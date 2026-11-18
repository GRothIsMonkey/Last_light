"""Last Light bicycle components, shared by all four bikes (built from bike_kit primitives, game bike-local frame).

Each function adds geometry for one component to a kit Mesh with a part id. `C` is the build context (Ctx below):
anchors from dist/rig.js, the level of detail and the parts registry. Real component dimensions are used throughout
(tube diameters, ISO rim sizes, 1/2-inch chain pitch, 3/8-inch axles) so the bikes are built like bikes, at the scale
the game's riders already use.
"""
import math
from mathutils import Vector, Quaternion
import bike_kit as K
from bike_kit import V, TAU

X = Vector((1, 0, 0))
Y = Vector((0, 1, 0))
Z = Vector((0, 0, 1))


class Ctx:
    def __init__(self, A, lod, parts, front_offset):
        self.A = A
        self.lod = lod
        self.parts = parts
        self.R = A['wheelR']
        self.rake = A['rake']
        self.bb = V(*A['bb'])
        self.rear = V(0, self.R, A['rear'])
        self.piv = V(*A['pivot'])
        self.D = V(0, math.cos(self.rake), math.sin(self.rake))          # up the steering axis
        self.F = V(0, math.sin(self.rake), -math.cos(self.rake))         # forward, square to the steering axis
        self.saddle = V(*A['saddle'])
        self.grip_r = V(*A['gripR'])
        self.grip_l = V(*A['gripL'])
        self.crank_len = A['crank']
        self.pedal_x = A['pedalX']
        # the authored front axle: on the ground-height circle, `front_offset` ahead of the steering axis (a real
        # fork's offset). rig.js's own front axle (A['front']) sits behind the axis; see the review for why it moved.
        q = self.axis_at(self.R - front_offset * self.F.y)
        self.front = q + self.F * front_offset
        self.front_offset = front_offset

    def axis_at(self, y):
        return self.piv + self.D * ((y - self.piv.y) / self.D.y)

    def n(self, sides, minimum=3):
        """Polygon count for round sections at this LOD."""
        f = (1.0, 0.5, 0.3)[self.lod]
        return max(minimum, int(round(sides * f)))

    def pid(self, name, slot, finish):
        return self.parts.id(name, slot, finish)


def pt(*a):
    return Vector(a)


# ----------------------------------------------------------------------------------------------------------------------
# Frame tubes with welds
# ----------------------------------------------------------------------------------------------------------------------
class FrameBuilder:
    """Collects straight/curved frame members and welds them where branch tubes meet main tubes."""

    def __init__(self, C, m, pid, weld_pid, weld_r=0.0017):
        self.C, self.m, self.pid, self.weld_pid, self.weld_r = C, m, pid, weld_pid, weld_r
        self.members = {}

    def straight(self, name, a, b, r, sides=16, r2=None, caps=(True, True)):
        a, b = Vector(a), Vector(b)
        rings = 1 if r2 is None else 3
        K.tube(self.m, a, b, r, self.C.n(max(8, sides - 2), 5), self.pid, caps=caps, r2=r2, rings=rings)
        self.members[name] = (a, b, r if r2 is None else (r + r2) / 2)

    def curved(self, name, path, r, sides=16, scales=None, caps=(True, True)):
        path = [Vector(p) for p in path]
        K.sweep(self.m, path, K.circle_profile(r, self.C.n(max(8, sides - 2), 5)), self.pid, caps=caps, scales=scales)
        self.members[name] = (path[0], path[-1], r, path)

    def weld(self, branch, main, end=1, r=None, a=None, b=None):
        """Weld bead where member `branch` (its end `end`) meets member `main` (straight segment approximation)."""
        if self.C.lod > 0:
            return
        br = self.members[branch]
        mn = self.members[main]
        if len(br) == 4:   # curved: use its last/first segment
            path = br[3]
            a0, a1 = (path[-2], path[-1]) if end == 1 else (path[1], path[0])
            ra = br[2]
            e = 1
        else:
            a0, a1, ra = br[0], br[1], br[2]
            e = end
            if end == 0:
                a0, a1, e = br[1], br[0], 1
        if len(mn) == 4:
            p = mn[3]
            # nearest segment of the main path to the branch end
            best = min(range(len(p) - 1), key=lambda i: (((p[i] + p[i + 1]) / 2) - a1).length)
            b0, b1, rb = p[best], p[best + 1], mn[2]
        else:
            b0, b1, rb = mn[0], mn[1], mn[2]
        if a is not None:
            b0, b1 = a, b
        loop = K.tube_intersection(a0, a1, ra + 0.0004, b0, b1, rb + 0.0004, n=self.C.n(18, 8), end=e)
        if loop:
            K.weld(self.m, loop, r or self.weld_r, 4, self.weld_pid)


def bb_shell(C, m, pid, width=0.068, r=0.0205):
    K.lathe(m, [(-width / 2 - .0006, r * .96), (-width / 2, r), (width / 2, r), (width / 2 + .0006, r * .96),
                (width / 2 + .0006, r * .62), (-width / 2 - .0006, r * .62)], C.n(22, 8), pid, origin=C.bb, axis=X,
            closed_profile=True, sharp=(1, 2, 4, 5))


def head_tube(C, m, pid, y0, y1, r, flare=0.0016):
    a, b = C.axis_at(y0), C.axis_at(y1)
    L = (b - a).length
    prof = [(0, r * .72), (0, r + flare), (.009, r + flare), (.014, r), (L - .014, r), (L - .009, r + flare), (L, r + flare),
            (L, r * .72)]
    K.lathe(m, prof, C.n(24, 8), pid, origin=a, axis=C.D, ref=X, sharp=(1, 2, 5, 6))
    return a, b


def dropout(C, m, pid, axle, side, toward, up, size=0.024, thick=0.005, slot=True, hanger=False):
    """A rear dropout plate at `axle` on side (+1 right), its body reaching toward the stays (2D outline)."""
    org = axle + X * (side * (0.0565))
    u = toward.normalized()
    v = X.cross(u).normalized()
    if v.dot(up) < 0:
        v = -v
    s = size
    outline = [(-s * .55, -s * .35), (s * .3, -s * .6), (s * 1.25, -s * .32), (s * 1.45, s * .05), (s * 1.2, s * .55),
               (s * .2, s * .62), (-s * .5, s * .38)]
    if hanger and side > 0:
        outline = outline[:1] + [(-s * .35, -s * 1.05), (s * .15, -s * 1.15), (s * .32, -s * .62)] + outline[1:]
    holes = [K.circle2(.0052, 10)] if slot else []
    K.slab(m, outline, thick, pid, origin=org, u=u, v=v, holes=holes, chamfer=.0007)


def axle_nut(C, m, pid, axle, side, gap=0.0595, size=0.015, depth=0.008):
    K.hex_nut(m, axle + X * (side * (gap + depth / 2)), X, size, depth, pid)
    # threaded axle end
    K.tube(m, axle + X * (side * gap), axle + X * (side * (gap + depth + .006)), .0047, C.n(8, 5), pid, caps=(False, True))


# ----------------------------------------------------------------------------------------------------------------------
# Wheels
# ----------------------------------------------------------------------------------------------------------------------
def wheel(C, m, *, axle, bead_r, rim_w, rim_depth, tyre_w, tyre_h, rim_pid, tyre_pid, hub_pid, spoke_pid, nip_pid,
          spokes=36, cross=3, hub='front', flange_r=0.026, flange_x=(-.029, .029), knobby=False, tread='street',
          valve_pid=None, double_wall=True):
    """A complete wheel at `axle`: tyre, rim, hub, spokes, nipples, valve. Rotation axis is game X."""
    seg = C.n(44, 12)
    # tyre: carcass section from bead to bead
    prof = K.tyre_profile(bead_r, tyre_w, tyre_h - (0.0055 if knobby else 0), pts=C.n(13, 5), flat=.35 if tread == 'slick' else .15)
    K.lathe(C_m(m), prof, seg, tyre_pid, origin=axle, axis=X, ref=Y, r_uv=bead_r + tyre_h)
    if knobby and C.lod == 0:
        knobs(C, m, axle, bead_r, tyre_w, tyre_h, tyre_pid)
    # rim: a box section, its sidewalls flat (brake track), the bed under the tyre beads
    hw = rim_w / 2
    r_out = bead_r + 0.0045                      # hook edge
    r_in = bead_r - rim_depth
    if double_wall:
        rp = [(-hw * .72, bead_r + .0012), (-hw, r_out), (-hw, bead_r - .007), (-hw * .8, r_in + .003), (0, r_in),
              (hw * .8, r_in + .003), (hw, bead_r - .007), (hw, r_out), (hw * .72, bead_r + .0012)]
        sharp = (1, 7)
    else:
        rp = [(-hw * .72, bead_r + .0012), (-hw, r_out), (-hw, bead_r - .004), (-hw * .55, r_in + .002), (0, r_in),
              (hw * .55, r_in + .002), (hw, bead_r - .004), (hw, r_out), (hw * .72, bead_r + .0012)]
        sharp = (1, 7)
    if C.lod == 2:
        rp = [rp[1], rp[len(rp) // 2], rp[-2]]
        sharp = ()
    K.lathe(m, rp, seg, rim_pid, origin=axle, axis=X, ref=Y, sharp=sharp)
    # hub
    hub_body(C, m, axle, hub, flange_r, flange_x, hub_pid)
    # spokes
    if C.lod < 2:
        K.spoke_set(m, spoke_pid, nip_pid, n=spokes, hub_r=flange_r - .0035, hub_x=(flange_x[0], flange_x[1]),
                    rim_r=r_in + .0005, cross=cross, axle=axle, sides=3, nipples=C.lod == 0)
    else:
        for k in range(8):
            a = TAU * k / 8
            d = V(0, math.sin(a), math.cos(a))
            K.tube(m, axle + d * flange_r, axle + d * r_in, .0025, 3, spoke_pid, caps=(False, False))
    if valve_pid and C.lod < 2:
        a = math.radians(200)
        d = V(0, math.sin(a), math.cos(a))
        K.tube(m, axle + d * (r_in - .022), axle + d * (r_in + .002), .0032, C.n(8, 4), valve_pid, caps=(True, False))
        K.tube(m, axle + d * (r_in - .030), axle + d * (r_in - .022), .0038, C.n(8, 4), valve_pid)


def C_m(m):
    return m


def hub_body(C, m, axle, kind, flange_r, fx, pid):
    """Hub shell with flanges; 'front', 'rear-free' (freewheel side), 'coaster' (fat brake shell), 'bmx-rear'."""
    fl, fr = fx
    t = .0028
    if kind == 'coaster':
        prof = [(fl - .012, .0085), (fl - .006, .012), (fl - t, .014), (fl - t, flange_r), (fl + t, flange_r), (fl + t, .02),
                (fl + .01, .026), (fr - .01, .026), (fr - t, .02), (fr - t, flange_r), (fr + t, flange_r), (fr + t, .015),
                (fr + .009, .012), (fr + .012, .0085)]
    else:
        body = .0125 if kind == 'front' else .0145
        prof = [(fl - .011, .0072), (fl - .006, .0095), (fl - t, .011), (fl - t, flange_r), (fl + t, flange_r), (fl + t, .012),
                (fl + .012, body), ((fl + fr) / 2, body * .92), (fr - .012, body), (fr - t, .012), (fr - t, flange_r),
                (fr + t, flange_r), (fr + t, .011), (fr + .006, .0095), (fr + .011, .0072)]
    if C.lod == 2:
        prof = [prof[0], prof[3], prof[4], prof[-5], prof[-4], prof[-1]]
    K.lathe(m, prof, C.n(14, 6), pid, origin=axle, axis=X, ref=Y, sharp=(3, 4, len(prof) - 5, len(prof) - 4) if C.lod < 2 else ())


def knobs(C, m, axle, bead_r, tyre_w, tyre_h, pid, rows=34):
    """Knobby tread (Sam's MTB): per row a centre block, alternating left/right of the centre line, and a shoulder block
    on the opposite side, so the crown reads as a continuous zig-zag of blocks in profile and from above."""
    R = bead_r + tyre_h - .0055
    for k in range(rows):
        a0 = TAU * k / rows
        s = 1 if k % 2 else -1
        for (dx, da, w, l, h, r_off, tilt) in ((s * .0058, 0, .013, .0115, .0055, 0, 0),
                                                (-s * .0215, .5, .0105, .0105, .0048, -.0085, -s * .62)):
            a = a0 + da * TAU / rows
            d = V(0, math.sin(a), math.cos(a))
            tang = V(0, math.cos(a), -math.sin(a))
            c = axle + X * dx + d * (R + r_off)
            n = (d + X * math.sin(tilt)).normalized()
            u = tang
            v = n.cross(u).normalized()
            knob(m, c, n, u, v, w, l, h, pid)


def knob(m, c, n, u, v, w, l, h, pid):
    """A tapered tread block standing on the tyre surface at c (normal n): 5 faces, no bottom."""
    pts = []
    for z, s in ((-.002, 1.0), (h, .78)):
        for (a, b) in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            pts.append(c + n * z + u * (a * l / 2 * s) + v * (b * w / 2 * s))
    ids = [m.add_v(p) for p in pts]
    b0, t0 = ids[:4], ids[4:]
    for i in range(4):
        j = (i + 1) % 4
        m.add_f((b0[i], b0[j], t0[j], t0[i]), [(0 + i * .01, 30), (.01 + i * .01, 30), (.01 + i * .01, 30.006), (i * .01, 30.006)], pid)
        m.sharp.add((t0[i], t0[j]))
    m.add_f(t0, [(30, 30), (30.01, 30), (30.01, 30.01), (30, 30.01)], pid)


# ----------------------------------------------------------------------------------------------------------------------
# Drivetrain
# ----------------------------------------------------------------------------------------------------------------------
def sprocket(C, m, center, x, teeth, pid, holes=(), thick=0.0024, ppt=6, spider_holes=None):
    """A toothed ring in the YZ plane at lateral position x (game X), centre on the BB/axle line."""
    pts_t = ppt if C.lod == 0 else 4
    outline, Rp = K.sprocket_outline(teeth, pts_per_tooth=pts_t)
    if C.lod == 2:
        outline = K.circle2(Rp, 12)
    org = Vector((x, center.y, center.z))
    # (u, v) = (-Z, Y) so the outline lies in the wheel plane; w = u x v = +X
    K.slab(m, outline, thick, pid, origin=org, u=-Z, v=Y, holes=list(holes) if C.lod == 0 else [], chamfer=0)
    return Rp


def ring_holes(n, r, size, phase=0.0, sides=10):
    return [K.circle2(size, sides, r * math.cos(phase + TAU * k / n), r * math.sin(phase + TAU * k / n)) for k in range(n)]


def crank_arm(C, m, center, side, length, pid, x, width=(.034, .024), thick=.014, angle=0.0):
    """A forged crank arm in the YZ plane at lateral x; side +1 points up at crank angle 0 (rig.js)."""
    w0, w1 = width
    L = length
    n = 6 if C.lod == 0 else 3
    outline = []
    for k in range(n + 1):  # spindle end (round)
        a = math.pi / 2 + math.pi * k / n
        outline.append((w0 / 2 * math.cos(a), w0 / 2 * math.sin(a)))
    for k in range(n + 1):  # pedal end (round)
        a = -math.pi / 2 + math.pi * k / n
        outline.append((L + w1 / 2 * math.cos(a), w1 / 2 * math.sin(a)))
    # 2D: axis 'a' along the arm (up for side +1), 'b' across; map to (u, v) with u = arm direction
    dirv = V(0, math.cos(angle), -math.sin(angle)) * side
    org = Vector((x, center.y, center.z))
    across = X.cross(dirv).normalized()
    pts = [(p[0], p[1]) for p in outline]
    K.slab(m, pts, thick, pid, origin=org, u=dirv, v=across, chamfer=.0018 if C.lod == 0 else 0)
    # bosses at both ends
    if C.lod == 0:
        sgn = 1 if x > 0 else -1
        K.tube(m, org, org + X * (sgn * thick * .62), .0105, 10, pid)   # spindle boss, outboard


def pedal_platform(C, m, center, side, pid_body, pid_axle, pid_pin=None, w=.082, l=.092, h=.022, style='bmx',
                   refl_pid=None):
    """A platform pedal centred at `center` (the rig.js pedal point), spindle toward the crank (game X)."""
    s = side
    inner = center + X * (-s * (w / 2))
    # spindle stub
    K.tube(m, inner + X * (-s * .014), inner + X * (s * .004), .0062, C.n(10, 5), pid_axle, caps=(True, False))
    if style in ('bmx', 'mtb'):
        # cage frame: two side plates along Z with concave top edge + cross bars
        prof = [(-l / 2, -h / 2), (l / 2, -h / 2), (l / 2, h / 2), (l * .25, h * .36), (-l * .25, h * .36), (-l / 2, h / 2)]
        for xs in (-1, 1):
            org = center + X * (xs * (w / 2 - .0045))
            K.slab(m, prof, .009, pid_body, origin=org, u=-Z, v=Y, chamfer=.0012 if C.lod == 0 else 0)
        for zs in (-1, 1):
            org = center + Z * (zs * (l / 2 - .0045))
            K.slab(m, [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)], .009, pid_body, origin=org, u=X, v=Y,
                   chamfer=.0012 if C.lod == 0 else 0)
        # centre body (spindle housing)
        K.tube(m, center + X * (-w / 2 + .006), center + X * (w / 2 - .006), .0105, C.n(12, 5), pid_body)
        if pid_pin and C.lod == 0:
            for xs in (-1, 1):
                for zs in (-1, -.35, .35, 1):
                    for ys in (-1, 1):
                        p = center + X * (xs * (w / 2 - .0045)) + Z * (zs * (l / 2 - .006)) + Y * (ys * (h / 2 - .0005))
                        K.tube(m, p, p + Y * (ys * .0035), .0014, 5, pid_pin, caps=(False, True))
    elif style == 'block':
        # cruiser block pedal: steel frame with two rubber blocks
        for ys in (-1, 1):
            org = center + Y * (ys * .0075)
            K.slab(m, K.rounded_rect(l * .92, w * .74, .006, 2 if C.lod == 0 else 1), .012, pid_body, origin=org, u=-Z, v=X,
                   chamfer=.0015 if C.lod == 0 else 0)
        for xs in (-1, 1):
            K.slab(m, K.rounded_rect(l, h * 1.05, .004, 2), .004, pid_axle, origin=center + X * (xs * (w * .4)), u=-Z, v=Y)
        K.tube(m, center + X * (-w / 2), center + X * (w / 2), .006, C.n(8, 4), pid_axle)
    else:  # resin platform with reflectors (the protagonist's)
        K.slab(m, K.rounded_rect(l, w, .008, 3 if C.lod == 0 else 1), h * .62, pid_body, origin=center, u=-Z, v=X,
               chamfer=.0022 if C.lod == 0 else 0)
        if C.lod == 0:
            for zs in (-1, 1):
                for xs in (-1, 1):
                    K.box(m, center + Z * (zs * l * .2) + X * (xs * w * .2) + Y * (h * .31), (w * .26, .002, l * .22), pid_body,
                          u=X, v=Z)
        if refl_pid:
            for zs in (-1, 1):
                K.box(m, center + Z * (zs * (l / 2 + .0012)), (w * .62, h * .4, .003), refl_pid, u=X, v=Y)


def chain_and_path(C, m, circles, pid, roller_pid=None):
    path = K.chain_path(circles)
    if C.lod == 0:
        return K.chain_links(m, path, pid)
    # LOD1/2: two thin bands following the chain path
    P = K.resample(path, 40 if C.lod == 1 else 16)
    for s in (-1, 1):
        prof = [(-.0047, .0005), (.0047, .0005), (.0047, -.0005), (-.0047, -.0005)]
        K.sweep(m, [p + X * (s * .0045) for p in P[:-1]], prof, pid, closed=True, ref=X)
    return 0


def cassette(C, m, axle, teeth_list, x0, step, pid, spacer_pid):
    """A freewheel / cassette cluster: cogs from inboard (largest) outward."""
    for i, t in enumerate(teeth_list):
        x = x0 + i * step
        outline, Rp = K.sprocket_outline(t, pts_per_tooth=2)
        if C.lod > 0:
            outline = K.circle2(Rp + .002, max(8, t // (2 if C.lod == 1 else 4)))
        last = i == len(teeth_list) - 1
        K.slab(m, outline, .0018, pid, origin=Vector((x, axle.y, axle.z)), u=-Z, v=Y, chamfer=0, holes=[], sides_only=not last)
        if not last and C.lod == 0:
            # the cog's outer face, as a ring (the next cog covers its middle)
            nxt = K.sprocket_outline(teeth_list[i + 1], pts_per_tooth=2)[1]
            K.lathe(m, [(0, nxt), (0, Rp - .004)], C.n(24, 8), pid, origin=Vector((x + .0009, axle.y, axle.z)), axis=X, ref=Y)
    K.tube(m, Vector((x0 - .003, axle.y, axle.z)), Vector((x0 + step * len(teeth_list), axle.y, axle.z)), .016, C.n(14, 6),
           spacer_pid)


def derailleur_rear(C, m, axle, x, pid_body, pid_cage, pid_pulley, chain_cog_r, side=1):
    """A rear derailleur hanging below the right dropout; returns the two pulley circles for the chain path."""
    up = Vector((x, axle.y, axle.z))
    upper = up + V(0, -.066, .008)       # below the cog: the chain wraps the cog, then the guide pulley
    lower = upper + V(0, -.056, -.018)   # the tension pulley, a little forward
    pr = .0175
    if C.lod < 2:
        for c in (upper, lower):
            o, Rp = K.sprocket_outline(11, pts_per_tooth=2)
            if C.lod > 0:
                o = K.circle2(Rp, 10)
            K.slab(m, o, .0042, pid_pulley, origin=c, u=-Z, v=Y, chamfer=0)
        # cage plates (outer and inner) joining the pulleys
        for dx in (-.0058, .0058):
            cen = (upper + lower) / 2 + X * dx
            axis = (lower - upper)
            Lc = axis.length
            K.slab(m, K.stadium(Lc, .031, 4 if C.lod == 0 else 2), .0016, pid_cage, origin=cen, u=axis.normalized(),
                   v=X.cross(axis.normalized()).normalized(), chamfer=0)
        # parallelogram body and knuckle up to the hanger
        body_c = up + V(.012, -.03, -.004)
        K.slab(m, K.rounded_rect(.03, .012, .004, 2), .008, pid_body, origin=up + V(.008, -.014, .004), u=V(0, -1, .2).normalized(),
               v=V(0, .2, 1).normalized(), chamfer=.001 if C.lod == 0 else 0)
        K.slab(m, K.rounded_rect(.048, .022, .006, 2), .014, pid_body, origin=body_c + V(.006, -.008, .008),
               u=V(0, -.6, .8).normalized(), v=V(0, .8, .6).normalized(), chamfer=.0015 if C.lod == 0 else 0)
        K.tube(m, up + X * .002, up + X * .016, .009, C.n(10, 5), pid_body)
    return upper, lower, pr


# ----------------------------------------------------------------------------------------------------------------------
# Cockpit
# ----------------------------------------------------------------------------------------------------------------------
def grip(C, m, end_center, direction, pid, length=.118, r=.0158, flange=False, cap_pid=None, ribs=True):
    """A grip on the bar end: `end_center` = the bar end, `direction` = outward along the bar. Lathe with ribs."""
    d = Vector(direction).normalized()
    a = end_center - d * length
    prof = []
    if flange:
        prof += [(0, .0115), (0, .0235), (.004, .0235), (.006, .0175)]
    else:
        prof += [(0, .0115), (0, r * .96), (.004, r)]
    n_rib = 4 if (ribs and C.lod == 0) else 0
    if n_rib:
        start, stop = (.012 if flange else .008), length - .008
        for k in range(n_rib * 2 + 1):
            t = start + (stop - start) * k / (n_rib * 2)
            prof.append((t, r + (.0011 if k % 2 else 0)))
    else:
        prof.append((length * .5, r * 1.02))
    prof += [(length - .003, r * .98), (length, r * .82), (length + .0005, .006), (length + .0005, .0001)]
    K.lathe(m, prof, C.n(13, 6), pid, origin=a, axis=d, ref=Y, sharp=(1,) if not flange else (1, 2, 3))
    return a


def bar_end_path(p_end, d, length):
    return p_end - Vector(d).normalized() * length


def stem_threadless(C, m, steer_top, clamp, bar_dir, pid, bolt_pid, steer_r=.0143, ext_r=.0125):
    """Threadless stem: steerer clamp + extension + bar clamp with faceplate bolts."""
    axis = C.D
    lathe_p = [(-.022, steer_r + .0045), (.022, steer_r + .0045)]
    K.lathe(m, [(-.022, steer_r + .001), (-.022, steer_r + .0055), (.022, steer_r + .0055), (.022, steer_r + .001)], C.n(18, 6),
            pid, origin=steer_top, axis=axis, ref=X, sharp=(1, 2))
    # extension
    d = (clamp - steer_top)
    a = steer_top + d.normalized() * (steer_r + .002)
    b = clamp - d.normalized() * .012
    K.tube(m, a, b, ext_r, C.n(14, 6), pid, caps=(False, False))
    # bar clamp (around the bar, along X), faceplate
    K.lathe(m, [(-.021, .0122), (-.021, .0172), (.021, .0172), (.021, .0122)], C.n(18, 6), pid, origin=clamp, axis=X, ref=Y,
            sharp=(1, 2))
    if C.lod == 0:
        fwd = d.normalized()
        for dx in (-.014, .014):
            for dy in (-.011, .011):
                p = clamp + X * dx + Y * dy + fwd * .016
                K.bolt_head(m, p, fwd, .0068, .003, bolt_pid, sides=6)
        for dy in (-.008, .008):  # pinch bolts at the steerer clamp, back side
            p = steer_top + axis * dy - C.F * (steer_r + .0055)
            K.bolt_head(m, p, -C.F, .0062, .003, bolt_pid, sides=6)


def headset_stack(C, m, ht_top, ht_bot, cup_pid, steer_pid, steer_r, spacer_h=.012, top_extra=0.0, frame_m=None):
    """Headset cups (frame) and the steerer top: spacers + top cap (steer). Returns the top of the stack."""
    fm = frame_m or m
    K.lathe(fm, [(0, steer_r + .002), (0, .0215), (.007, .0215), (.0105, .019), (.0105, steer_r + .002)], C.n(22, 8), cup_pid,
            origin=ht_top, axis=C.D, ref=X, sharp=(1, 2))
    K.lathe(fm, [(0, steer_r + .002), (0, .0215), (-.008, .0215), (-.011, .019), (-.011, steer_r + .002)], C.n(22, 8), cup_pid,
            origin=ht_bot, axis=C.D, ref=X, sharp=(1, 2))
    top = ht_top + C.D * .0105
    if spacer_h > 0:
        K.lathe(m, [(0, steer_r + .0005), (0, .0185), (spacer_h, .0185), (spacer_h, steer_r + .0005)], C.n(20, 6), steer_pid,
                origin=top, axis=C.D, ref=X, sharp=(1, 2))
    return top + C.D * spacer_h


def brake_lever(C, m, bar_point, out_dir, side, pid_body, pid_blade, reach=.075, droop=.62, style='v'):
    """A flat-bar brake lever: clamp on the bar at bar_point, blade forward-down toward the grip (outward)."""
    o = Vector(out_dir).normalized()
    fwd = V(0, 0, -1)
    fwd = (fwd - o * fwd.dot(o)).normalized()
    up = o.cross(fwd).normalized()
    if up.y < 0:
        up = -up
    # clamp band
    K.lathe(m, [(-.006, .0118), (-.006, .0152), (.006, .0152), (.006, .0118)], C.n(14, 6), pid_body, origin=bar_point,
            axis=o, ref=Y, sharp=(1, 2))
    # perch body ahead of the bar
    perch = bar_point + fwd * .022 + up * (-.003)
    K.slab(m, K.rounded_rect(.034, .016, .005, 2), .015, pid_body, origin=perch, u=fwd, v=up, chamfer=.002 if C.lod == 0 else 0)
    # cable adjuster barrel pointing in and up
    if C.lod < 2:
        adj = perch - o * .011 + up * .004
        K.tube(m, adj, adj - o * .014 + up * .003, .0045, C.n(8, 4), pid_body)
    # blade: a curved flat bar from the pivot, out along the grip, angled down
    piv = perch + fwd * .012
    tilt = Quaternion(o, 0)  # (kept for clarity)
    b_dir = (o * .93 - up * math.sin(droop) * .35 + fwd * .08).normalized()
    pts = [piv, piv + b_dir * reach * .3 + fwd * .006, piv + b_dir * reach * .7 + fwd * .010, piv + b_dir * reach + fwd * .008]
    pts = K.catmull(pts, 3)
    prof = [(-.0065, -.0035), (.0065, -.0035), (.0072, .002), (0, .0042), (-.0072, .002)]
    K.sweep(m, pts, prof, pid_blade, ref=up)
    return perch - o * .025 + up * .004   # cable exit point


def cable(C, m, points, pid, r=.0024, n_per=6):
    if C.lod == 2:
        return
    pts = K.catmull([Vector(p) for p in points], 4 if C.lod == 0 else 2)
    K.sweep(m, pts, K.circle_profile(r, C.n(5, 3)), pid, ref=X)


def bell(C, m, clamp_point, bar_dir, pid_dome, pid_base, dome_r=.027, dome_h=.024, center=None):
    """A dome bell standing on the bar: clamp band round the bar, a short post, the dome. Returns the dome centre."""
    o = Vector(bar_dir).normalized()
    K.lathe(m, [(-.007, .0118), (-.007, .0148), (.007, .0148), (.007, .0118)], C.n(14, 6), pid_base, origin=clamp_point,
            axis=o, ref=Y, sharp=(1, 2))
    c = center if center is not None else clamp_point + Y * .025
    base = c - Y * (dome_h * .55)
    K.tube(m, clamp_point + Y * .012, base, .0045, C.n(8, 4), pid_base, caps=(False, False))
    n = C.n(10, 4)
    prof = [(0, .0001)]
    for k in range(n + 1):
        a = math.pi / 2 * k / n
        prof.append((dome_h * math.sin(a) * .95, dome_r * math.cos(a) + .0001))
    prof = [(dome_h * .95, .0001)] + list(reversed(prof[1:]))  # top to rim
    prof.append((-.0015, dome_r * .985))
    prof.append((-.0015, dome_r * .9))
    K.lathe(m, prof, C.n(24, 8), pid_dome, origin=base, axis=Y, ref=X, sharp=(len(prof) - 2,))
    return c


def bell_lever(C, m, pivot, bar_dir, pid, length=.026):
    """The striker lever (its own node: the game rotates it about its pivot when the bell is rung)."""
    o = Vector(bar_dir).normalized()
    fwd = (V(0, 0, -1) - o * V(0, 0, -1).dot(o)).normalized()
    K.tube(m, pivot - Y * .002, pivot + Y * .004, .0042, C.n(10, 5), pid)
    pts = [pivot, pivot + fwd * .006 - o * .004, pivot + fwd * .004 - o * length]
    K.sweep(m, K.catmull(pts, 3), [(-.003, -.0012), (.003, -.0012), (.003, .0012), (-.003, .0012)], pid, ref=Y)
    K.lathe(m, [(0, .0001), (0, .0052), (.004, .0052), (.004, .0001)], C.n(10, 5), pid, origin=pts[-1] - Y * .002, axis=Y,
            ref=X, sharp=(1, 2))


def reflector_disc(C, m, center, normal, r, pid_lens, pid_body, depth=.008):
    n = Vector(normal).normalized()
    K.lathe(m, [(0, .0001), (0, r), (-depth * .4, r * 1.04), (-depth, r * 1.04), (-depth, .0001)], C.n(24, 8), pid_body,
            origin=center - n * .0005, axis=n, ref=Y, sharp=(1, 2, 3))
    K.lathe(m, [(0, .0001), (.0016, r * .5), (.0012, r * .96), (0, r)], C.n(24, 8), pid_lens, origin=center, axis=n, ref=Y)


def reflector_rect(C, m, center, normal, up, w, h, pid_lens, pid_body, depth=.009):
    n, u = Vector(normal).normalized(), Vector(up).normalized()
    side = u.cross(n).normalized()
    K.slab(m, K.rounded_rect(w * 1.08, h * 1.08, .006, 2), depth, pid_body, origin=center - n * (depth / 2), u=side, v=u,
           chamfer=.0012 if C.lod == 0 else 0)
    K.slab(m, K.rounded_rect(w, h, .005, 2), .0024, pid_lens, origin=center + n * .0006, u=side, v=u, chamfer=.0006)


# ----------------------------------------------------------------------------------------------------------------------
# Saddles (lofted shells) and seatposts
# ----------------------------------------------------------------------------------------------------------------------
def saddle(C, m, center, pid_cover, pid_base, *, length=.255, w_rear=.155, w_nose=.05, h=.05, sag=.008, nose_drop=.012,
           tail_up=.006, style='sport', n_len=16, n_around=18):
    """A saddle shell lofted nose (-Z) to tail (+Z) round `center` (top surface ~ center.y). Plan view: a round nose, a
    narrow waisted mid-section, a wide rear with round corners. Side view: a wedge, thin at the nose and padded at the
    rear, the top dipping a little in the middle. style: 'sport' (MTB / hybrid), 'bmx' (slim pivotal), 'cruiser'."""
    nl, na = C.n(n_len, 5), C.n(n_around, 8)
    if na % 2:
        na += 1

    def smooth(a, b, x):
        t = max(0.0, min(1.0, (x - a) / (b - a)))
        return t * t * (3 - 2 * t)
    wide_from, wide_to = (.25, .78) if style == 'cruiser' else (.42, .86)
    sections = []
    ts = [0.0, .015, .045] + [0.08 + .84 * i / (nl - 4) for i in range(nl - 3)] + [.955, .985, 1.0]
    for t in ts:
        cap = 1.0
        if t < .08:
            cap = math.sqrt(max(0.0, 1 - ((.08 - t) / .08) ** 2))
        elif t > .9:
            cap = math.sqrt(max(0.0, 1 - ((t - .9) / .1) ** 2))
        cap = max(cap, .12)
        w = (w_nose + (w_rear - w_nose) * smooth(wide_from, wide_to, t))
        if style != 'cruiser':
            w *= 1 - .07 * math.sin(min(1, t / .5) * math.pi)          # the waist
        w *= (cap if t < .5 else (.55 + .45 * cap))
        thick = (h * .42 + h * .58 * smooth(.05, .7, t)) * (cap if t < .5 else (.6 + .4 * cap))
        z = -length / 2 + length * t
        ytop = (-sag * math.sin(math.pi * t) + tail_up * smooth(.72, 1, t) - nose_drop * (1 - smooth(0, .22, t)))
        crown = thick * (.16 if style == 'bmx' else .26)
        sec = []
        for k in range(na):
            a = math.pi / 2 - TAU * k / na                            # start at the top centre, go right
            ca, sa = math.cos(a), math.sin(a)
            e = 3.2
            x = math.copysign(abs(ca) ** (2 / e), ca) * w / 2
            y = math.copysign(abs(sa) ** (2 / e), sa) * thick / 2
            if sa > 0:
                y -= crown * (x / (w / 2)) ** 2 * sa
            else:
                y *= .8                                               # a flatter base shell
            sec.append(center + V(x, ytop + y - thick / 2, z))
        sections.append(sec)
    K.loft(m, sections, pid_cover)
    return sections


def seatpost(C, m, bottom, top, r, pid, clamp_pid=None, style='micro'):
    K.tube(m, bottom, top, r, C.n(16, 6), pid, caps=(False, True))
    if clamp_pid and C.lod < 2:
        d = (top - bottom).normalized()
        if style == 'candle':
            # separate saddle clamp on a plain post: two plates and a bolt across
            K.tube(m, top + V(-.022, .006, 0), top + V(.022, .006, 0), .0055, C.n(8, 4), clamp_pid)
            for s in (-1, 1):
                K.slab(m, K.rounded_rect(.03, .028, .006, 2), .004, clamp_pid, origin=top + V(s * .012, .004, 0), u=-Z, v=Y)
        else:
            K.slab(m, K.rounded_rect(.05, .022, .005, 2), .024, clamp_pid, origin=top + d * .006, u=-Z, v=X,
                   chamfer=.0015 if C.lod == 0 else 0)


def saddle_rails(C, m, center, pid, length=.13, gap=.022, drop=.02):
    if C.lod == 2:
        return
    for s in (-1, 1):
        pts = [center + V(s * gap * 1.4, -.006, -length * .62), center + V(s * gap, -drop, -length * .4),
               center + V(s * gap, -drop, length * .35), center + V(s * gap * 1.6, -.008, length * .55)]
        K.sweep(m, K.fillet(pts, .015, 4), K.circle_profile(.0035, C.n(8, 4)), pid)


def seat_collar(C, m, top_of_st, st_dir, r, pid, bolt_pid, qr=False):
    K.lathe(m, [(-.016, r - .001), (-.016, r + .0035), (.004, r + .0035), (.004, r - .001)], C.n(18, 6), pid, origin=top_of_st,
            axis=st_dir, ref=X, sharp=(1, 2))
    if C.lod == 0:
        back = V(0, -st_dir.z, st_dir.y).normalized()   # square to the seat tube, toward the rear
        if back.z < 0:
            back = -back
        c = top_of_st - st_dir * .006 + back * (r + .006)
        K.tube(m, c + V(-.012, 0, 0), c + V(.012, 0, 0), .0042, 8, bolt_pid)
        if qr:
            K.sweep(m, K.catmull([c + V(.012, 0, 0), c + V(.016, .006, .02), c + V(.017, .012, .055)], 3),
                    [(-.004, -.0015), (.004, -.0015), (.004, .0015), (-.004, .0015)], bolt_pid, ref=X)


# ----------------------------------------------------------------------------------------------------------------------
# Kickstand
# ----------------------------------------------------------------------------------------------------------------------
def kickstand(C, m, pivot, pid_leg, pid_foot, length=.30, rest=-1.2):
    """The leg, modelled in its stowed pose: rig.js turns the pivot group about X by -1.2 (stowed) and lays
    the leg along the pivot's -Y before that rotation. So the leg runs from the pivot along R_x(rest) * (0,-1,0)."""
    q = Quaternion(X, rest)
    down = q @ V(0, -1, 0)
    side_out = V(-1, 0, 0)   # the stand lives on the bike's left (game -X)
    a = pivot
    b = pivot + down * length
    K.tube(m, a + down * .006, b - down * .02, .0085, C.n(10, 5), pid_leg, r2=.0068)
    # pivot boss
    K.tube(m, a + side_out * -.008, a + side_out * .008, .011, C.n(12, 5), pid_leg)
    # rubber foot
    K.tube(m, b - down * .028, b, .0095, C.n(10, 5), pid_foot)


def kickstand_mount(C, m, pivot, pid, bolt_pid):
    """The clamp plate and bolt on the left chainstay that the leg pivots on (frame side)."""
    K.slab(m, K.rounded_rect(.05, .03, .006, 2), .006, pid, origin=pivot + V(.009, .006, 0), u=-Z, v=Y,
           chamfer=.0012 if C.lod == 0 else 0)
    if C.lod == 0:
        K.bolt_head(m, pivot + V(-.012, 0, 0), V(-1, 0, 0), .009, .004, bolt_pid, sides=6)
