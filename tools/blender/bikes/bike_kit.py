"""Last Light bicycle kit: the geometry primitives every one of the four boys' bikes is built from.

One kit for all four bikes is how they stay one family: the same tube, weld, wheel, spoke, chain and bolt construction,
the same detail density, the same UV density and the same material language, with different frames and components.

All modelling happens in the GAME's bike-local frame (rig.js: metres, origin on the ground between the tyres, +Y up,
forward -Z, right +X), because that is where the riding anchors live (anchors.json, dumped from dist/rig.js). Meshes
are converted to Blender's frame (bike faces -Y, right side -X, Z up; BLENDER-PIPELINE.md 3) only when they become
Blender objects: Blender (x, y, z) = game (-x, z, y), a proper rotation, so face winding is kept.

A Mesh here is a plain accumulator: vertices, polygons, per-corner 'pattern' UVs in METRES (u along / around, v across)
and a part id per face. The pattern UVs drive the texture generator (tread, knurl, decals, brushing), and a copy packed
into the 0-1 square becomes the atlas UVs that the baked textures use.
"""
import math
import numpy as np
from mathutils import Vector, Matrix, Quaternion
import mathutils

TAU = 2 * math.pi


def V(*a):
    return Vector(a[0] if len(a) == 1 else a)


# ----------------------------------------------------------------------------------------------------------------------
# Parts: every face carries a part id; a part names its material slot and its finish (bike_textures.FINISHES).
# ----------------------------------------------------------------------------------------------------------------------
class Parts:
    def __init__(self):
        self.list = []      # [(name, slot, finish)]
        self.index = {}

    def id(self, name, slot, finish):
        if name not in self.index:
            self.index[name] = len(self.list) + 1
            self.list.append((name, slot, finish))
        return self.index[name]


class Mesh:
    def __init__(self):
        self.v = []
        self.f = []
        self.uv = []        # per face: list of (u, v) per corner, metres
        self.pid = []
        self.isl = []       # per face: atlas island index (long strips are cut into several islands for packing)
        self.sharp = set()  # edges (i, j) forced sharp
        self.cur_isl = 0

    def add_v(self, p):
        self.v.append((float(p[0]), float(p[1]), float(p[2])))
        return len(self.v) - 1

    def add_f(self, idx, uvs, pid, isl=0):
        self.f.append(tuple(idx))
        self.uv.append([tuple(map(float, t)) for t in uvs])
        self.pid.append(pid)
        self.isl.append(isl)

    def extend(self, other):
        o = len(self.v)
        self.v += other.v
        self.f += [tuple(i + o for i in f) for f in other.f]
        self.uv += other.uv
        self.pid += other.pid
        self.isl += other.isl
        self.sharp |= {(a + o, b + o) for a, b in other.sharp}

    def transform(self, mat):
        self.v = [tuple(mat @ Vector(p)) for p in self.v]
        return self

    def tris(self):
        return sum(len(f) - 2 for f in self.f)


def flip_faces(m, start, end=None):
    """Reverse the winding (and corner UVs) of faces start..end-1."""
    for k in range(start, len(m.f) if end is None else end):
        m.f[k] = tuple(reversed(m.f[k]))
        m.uv[k] = list(reversed(m.uv[k]))


def signed_volume(m, start=0, end=None):
    v = 0.0
    for f in m.f[start:end]:
        p = [Vector(m.v[i]) for i in f]
        for k in range(1, len(p) - 1):
            v += p[0].dot(p[k].cross(p[k + 1])) / 6
    return v


# ----------------------------------------------------------------------------------------------------------------------
# Frames along paths
# ----------------------------------------------------------------------------------------------------------------------
def _perp(t, ref):
    n = ref - t * ref.dot(t)
    if n.length < 1e-6:
        n = Vector((1, 0, 0)) - t * t.x
        if n.length < 1e-6:
            n = Vector((0, 1, 0)) - t * t.y
    return n.normalized()


def frames(path, ref=Vector((1, 0, 0)), closed=False):
    """Parallel-transport frames (rotation minimizing) along a polyline. Returns [(T, N, B)]."""
    n = len(path)
    T = []
    for i in range(n):
        if closed:
            a, b = path[i - 1], path[(i + 1) % n]
        else:
            a, b = path[max(0, i - 1)], path[min(n - 1, i + 1)]
        t = (b - a)
        T.append(t.normalized() if t.length > 1e-9 else Vector((0, 0, 1)))
    N = [_perp(T[0], ref)]
    for i in range(1, n):
        q = T[i - 1].rotation_difference(T[i])
        N.append(_perp(T[i], q @ N[-1]))
    if closed:
        # spread the closing twist evenly
        q = T[-1].rotation_difference(T[0])
        end = _perp(T[0], q @ N[-1])
        ang = math.atan2(N[0].cross(end).dot(T[0]), N[0].dot(end))
        for i in range(n):
            N[i] = Quaternion(T[i], -ang * i / n) @ N[i]
    return [(T[i], N[i], T[i].cross(N[i]).normalized()) for i in range(n)]


def polyline_len(path):
    return [0.0] + list(np.cumsum([(path[i + 1] - path[i]).length for i in range(len(path) - 1)]))


# ----------------------------------------------------------------------------------------------------------------------
# Paths: filleted polylines (bent tubes), Bezier and Catmull-Rom curves, arcs
# ----------------------------------------------------------------------------------------------------------------------
def fillet(points, radius, seg=6):
    """A polyline whose interior corners are replaced by circular arcs of `radius` (a bent tube)."""
    P = [Vector(p) for p in points]
    out = [P[0]]
    for i in range(1, len(P) - 1):
        a, b, c = P[i - 1], P[i], P[i + 1]
        d1, d2 = (a - b).normalized(), (c - b).normalized()
        ang = math.acos(max(-1, min(1, d1.dot(d2))))
        if ang > math.pi - 1e-3:
            out.append(b)
            continue
        r = radius if not isinstance(radius, (list, tuple)) else radius[i - 1]
        t = r / math.tan(ang / 2)
        t = min(t, (a - b).length * .49, (c - b).length * .49)
        r = t * math.tan(ang / 2)
        p1, p2 = b + d1 * t, b + d2 * t
        bis = (d1 + d2).normalized()
        center = b + bis * (r / math.sin(ang / 2))
        v1, v2 = p1 - center, p2 - center
        axis = v1.cross(v2).normalized()
        sweep = v1.angle(v2)
        for k in range(seg + 1):
            q = Quaternion(axis, sweep * k / seg)
            out.append(center + q @ v1)
    out.append(P[-1])
    return out


def bezier(p0, p1, p2, p3, n):
    p0, p1, p2, p3 = map(Vector, (p0, p1, p2, p3))
    out = []
    for i in range(n + 1):
        t = i / n
        out.append(p0 * (1 - t) ** 3 + p1 * 3 * t * (1 - t) ** 2 + p2 * 3 * t * t * (1 - t) + p3 * t ** 3)
    return out


def catmull(points, n_per, closed=False):
    P = [Vector(p) for p in points]
    out = []
    m = len(P)
    segs = m if closed else m - 1
    for i in range(segs):
        p0 = P[(i - 1) % m] if closed else P[max(0, i - 1)]
        p1, p2 = P[i], P[(i + 1) % m]
        p3 = P[(i + 2) % m] if closed else P[min(m - 1, i + 2)]
        for k in range(n_per):
            t = k / n_per
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    if not closed:
        out.append(P[-1])
    return out


def resample(path, n):
    """n+1 points evenly spaced by arc length."""
    L = polyline_len(path)
    out = []
    j = 0
    for i in range(n + 1):
        s = L[-1] * i / n
        while j < len(L) - 2 and L[j + 1] < s:
            j += 1
        seg = L[j + 1] - L[j]
        t = 0 if seg < 1e-12 else (s - L[j]) / seg
        out.append(path[j].lerp(path[j + 1], t))
    return out


# ----------------------------------------------------------------------------------------------------------------------
# Sweep: a profile (circle or any closed 2D loop) along a path. The workhorse for tubes, bars, stays, cables, rims' bead.
# ----------------------------------------------------------------------------------------------------------------------
def circle_profile(r, sides, start=0.0):
    return [(r * math.cos(start + TAU * k / sides), r * math.sin(start + TAU * k / sides)) for k in range(sides)]


def sweep(m, path, profile, pid, closed=False, caps=(True, True), ref=Vector((1, 0, 0)), scales=None, uv_u0=0.0,
          sharp_profile=False):
    """Sweep a closed 2D profile [(n, b)] along `path` (Vectors). scales: per path point radius factor (or (sx, sy)).
    Pattern UVs: u = arc length along the path (m), v = perimeter position around the profile (m)."""
    path = [Vector(p) for p in path]
    if _area(profile) < 0:          # faces point outward only for a counter-clockwise profile: normalise it
        profile = list(reversed(profile))
    F = frames(path, ref, closed)
    L = polyline_len(path)
    k = len(profile)
    per = [0.0]
    for i in range(k):
        a, b = profile[i], profile[(i + 1) % k]
        per.append(per[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    rings = []
    for i, p in enumerate(path):
        T, N, B = F[i]
        s = scales[i] if scales is not None else 1.0
        sx, sy = (s, s) if not isinstance(s, (tuple, list)) else s
        rings.append([m.add_v(p + N * (q[0] * sx) + B * (q[1] * sy)) for q in profile])
    n = len(path)
    segs = n if closed else n - 1
    for i in range(segs):
        r0, r1 = rings[i], rings[(i + 1) % n]
        u0 = L[i] + uv_u0
        u1 = (L[i + 1] if i + 1 < n else L[-1] + (path[0] - path[-1]).length) + uv_u0
        isl = int(L[i] / 0.42)
        for j in range(k):
            j2 = (j + 1) % k
            m.add_f((r0[j], r0[j2], r1[j2], r1[j]), [(u0, per[j]), (u0, per[j + 1]), (u1, per[j + 1]), (u1, per[j])], pid, isl)
            if sharp_profile:
                m.sharp.add((r0[j], r1[j]))
    if not closed:
        for end, ring, flip in ((0, rings[0], True), (1, rings[-1], False)):
            if not caps[end]:
                continue
            idx = list(reversed(ring)) if flip else list(ring)
            prof = list(reversed(profile)) if flip else list(profile)
            m.add_f(idx, [(q[0] + 5.0, q[1] + 5.0) for q in prof], pid)   # caps: planar UVs off to the side
            for a, b in zip(idx, idx[1:] + idx[:1]):
                m.sharp.add((a, b))
    return rings


def tube(m, a, b, r, sides, pid, caps=(True, True), ref=Vector((1, 0, 0)), r2=None, rings=1):
    a, b = Vector(a), Vector(b)
    path = [a.lerp(b, i / rings) for i in range(rings + 1)]
    scales = None if r2 is None else [1 + (r2 / r - 1) * i / rings for i in range(rings + 1)]
    return sweep(m, path, circle_profile(r, sides), pid, caps=caps, ref=ref, scales=scales)


def bent_tube(m, points, r, sides, pid, bend=0.03, seg=6, caps=(True, True), ref=Vector((1, 0, 0))):
    return sweep(m, fillet(points, bend, seg), circle_profile(r, sides), pid, caps=caps, ref=ref)


# ----------------------------------------------------------------------------------------------------------------------
# Lathe: a profile revolved about an axis (wheels, tyres, hubs, grips, bells, headsets, bottles, spindles)
# ----------------------------------------------------------------------------------------------------------------------
def lathe(m, profile, segments, pid, origin=(0, 0, 0), axis=(1, 0, 0), ref=(0, 1, 0), closed_profile=False,
          sharp=(), angle0=0.0, arc=TAU, r_uv=None):
    """profile: [(axial, radius)] in order. sharp: indices of profile points that make hard edges.
    Pattern UVs: u = angle x r_uv (default: the profile's max radius), v = arc length along the profile."""
    O, A = Vector(origin), Vector(axis).normalized()
    first_face = len(m.f)
    R0 = _perp(A, Vector(ref))
    R1 = A.cross(R0)
    full = abs(arc - TAU) < 1e-9
    cols = segments if full else segments + 1
    rmax = r_uv or max(p[1] for p in profile)
    per = [0.0]
    for i in range(1, len(profile)):
        per.append(per[-1] + math.hypot(profile[i][0] - profile[i - 1][0], profile[i][1] - profile[i - 1][1]))
    if closed_profile:
        per.append(per[-1] + math.hypot(profile[0][0] - profile[-1][0], profile[0][1] - profile[-1][1]))
    # duplicate verts at sharp profile points so the normals split there
    grid = []
    for c in range(cols):
        th = angle0 + arc * c / segments
        d = R0 * math.cos(th) + R1 * math.sin(th)
        col = []
        for i, (ax, r) in enumerate(profile):
            col.append(m.add_v(O + A * ax + d * r))
        grid.append(col)
    P = len(profile)
    rows = P if closed_profile else P - 1
    nisl = max(1, int(math.ceil(rmax * arc / 0.4)))
    for c in range(segments):
        c2 = (c + 1) % cols if full else c + 1
        u0, u1 = rmax * arc * c / segments, rmax * arc * (c + 1) / segments
        isl = min(nisl - 1, c * nisl // segments)
        for i in range(rows):
            i2 = (i + 1) % P
            if profile[i][1] < 1e-7 and profile[i2][1] < 1e-7:
                continue
            m.add_f((grid[c][i], grid[c2][i], grid[c2][i2], grid[c][i2]),
                    [(u0, per[i]), (u1, per[i]), (u1, per[i + 1]), (u0, per[i + 1])], pid, isl)
    for i in sharp:
        for c in range(segments):
            c2 = (c + 1) % cols if full else c + 1
            m.sharp.add((grid[c][i], grid[c2][i]))
    # Faces face outward when the profile, closed back to its start, runs clockwise in (axial, radius). Profiles are
    # written in whichever order reads best (rims and bell domes run the other way): flip those here, once.
    area = 0.5 * sum(profile[i][0] * profile[(i + 1) % P][1] - profile[(i + 1) % P][0] * profile[i][1] for i in range(P))
    if area > 1e-12:
        flip_faces(m, first_face)
    return grid


# ----------------------------------------------------------------------------------------------------------------------
# Slab: a flat outline (with holes) extruded, with chamfered edges. Dropouts, crank arms, chainrings, plates, levers.
# ----------------------------------------------------------------------------------------------------------------------
def _offset(poly, d):
    """Offset a closed 2D polygon by d (positive = outward for CCW)."""
    n = len(poly)
    out = []
    for i in range(n):
        p0, p1, p2 = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        e1, e2 = (p1 - p0).normalized(), (p2 - p1).normalized()
        n1, n2 = Vector((e1.y, -e1.x)), Vector((e2.y, -e2.x))
        nb = (n1 + n2)
        if nb.length < 1e-6:
            nb = n1
        nb.normalize()
        c = max(.35, nb.dot(n1))
        out.append(tuple(p1 + nb * (d / c)))
    return out


def _area(poly):
    return 0.5 * sum(poly[i - 1][0] * poly[i][1] - poly[i][0] * poly[i - 1][1] for i in range(len(poly)))


def slab(m, outline, thickness, pid, origin=(0, 0, 0), u=(0, 0, -1), v=(0, 1, 0), holes=(), chamfer=0.0008,
         sides_only=False):
    """outline/holes: 2D loops in the (u, v) plane; extruded along w = u x v, centred on origin (thickness total).
    Pattern UVs: faces planar in metres; sides by perimeter x depth."""
    O, U, Vv = Vector(origin), Vector(u).normalized(), Vector(v).normalized()
    W = U.cross(Vv).normalized()
    outline = list(outline)
    if _area(outline) < 0:
        outline.reverse()
    holes = [list(h) if _area(h) > 0 else list(reversed(h)) for h in holes]   # holes CCW too; walls flip below
    h = thickness / 2
    c = min(chamfer, h * .45)

    def P3(p, z):
        return O + U * p[0] + Vv * p[1] + W * z

    loops = [(outline, False)] + [(hh, True) for hh in holes]
    face_loops_top, face_loops_bot = [], []
    for loop, is_hole in loops:
        inner = _offset(loop, (c if is_hole else -c)) if c > 0 else loop
        # rings: top face edge (inset), top chamfer outer, bottom chamfer outer, bottom face edge (inset)
        if c > 0:
            rings = [[m.add_v(P3(p, h)) for p in inner], [m.add_v(P3(p, h - c)) for p in loop],
                     [m.add_v(P3(p, -h + c)) for p in loop], [m.add_v(P3(p, -h)) for p in inner]]
            zs = [0, c, thickness - c, thickness]
        else:
            rings = [[m.add_v(P3(p, h)) for p in loop], [m.add_v(P3(p, -h)) for p in loop]]
            zs = [0, thickness]
        face_loops_top.append((rings[0], inner))
        face_loops_bot.append((rings[-1], inner))
        n = len(loop)
        per = [0.0]
        for i in range(n):
            per.append(per[-1] + (Vector(loop[(i + 1) % n]) - Vector(loop[i])).length)
        for r in range(len(rings) - 1):
            A, B = rings[r], rings[r + 1]
            for i in range(n):
                i2 = (i + 1) % n
                # rings run top -> bottom; for a CCW outline (about W) the outward wall is (A[i], B[i], B[i2], A[i2])
                quad = (A[i], B[i], B[i2], A[i2]) if not is_hole else (A[i2], B[i2], B[i], A[i])
                uvq = [(per[i] + 9, zs[r] + 9), (per[i] + 9, zs[r + 1] + 9), (per[i + 1] + 9, zs[r + 1] + 9),
                       (per[i + 1] + 9, zs[r] + 9)]
                if is_hole:
                    uvq = [uvq[3], uvq[2], uvq[1], uvq[0]]
                m.add_f(quad, uvq, pid, int(per[i] / 0.4))
        for r in (0, len(rings) - 1):
            for i in range(n):
                m.sharp.add((rings[r][i], rings[r][(i + 1) % n]))
    if sides_only:
        return
    # caps via tessellation with holes
    for top, rl in ((True, face_loops_top), (False, face_loops_bot)):
        pts2 = [[Vector((p[0], p[1], 0)) for p in loop2] for _, loop2 in rl]
        tris = mathutils.geometry.tessellate_polygon(pts2)
        flat_idx, flat_uv = [], []
        for (ring, loop2) in rl:
            flat_idx += ring
            flat_uv += [(p[0] + (0 if top else 3), p[1]) for p in loop2]
        for t in tris:
            t = list(t)
            # tessellate_polygon returns triangles in the plane's winding; orient them to face +W (top) / -W (bottom)
            a, b, cc = (Vector(m.v[flat_idx[i]]) for i in t)
            nrm = (b - a).cross(cc - a)
            want = W if top else -W
            if nrm.dot(want) < 0:
                t = [t[0], t[2], t[1]]
            m.add_f([flat_idx[i] for i in t], [flat_uv[i] for i in t], pid)


def box(m, center, size, pid, u=(1, 0, 0), v=(0, 1, 0), chamfer=0.0006):
    sx, sy, sz = size
    outline = [(-sx / 2, -sy / 2), (sx / 2, -sy / 2), (sx / 2, sy / 2), (-sx / 2, sy / 2)]
    slab(m, outline, sz, pid, origin=center, u=u, v=v, chamfer=chamfer)


def rounded_rect(w, h, r, seg=3):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180),
                       (w / 2 - r, -h / 2 + r, 270)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def stadium(length, w, seg=6):
    """A slot / link outline along u: two half circles of radius w/2, centres length apart."""
    r = w / 2
    pts = []
    for k in range(seg + 1):
        a = -math.pi / 2 + math.pi * k / seg
        pts.append((length / 2 + r * math.cos(a), r * math.sin(a)))
    for k in range(seg + 1):
        a = math.pi / 2 + math.pi * k / seg
        pts.append((-length / 2 + r * math.cos(a), r * math.sin(a)))
    return pts


def circle2(r, n, cx=0, cy=0):
    return [(cx + r * math.cos(TAU * k / n), cy + r * math.sin(TAU * k / n)) for k in range(n)]


# ----------------------------------------------------------------------------------------------------------------------
# Welds: a bead along the intersection of a branch tube with a main tube (TIG weld ripples come from the normal map).
# ----------------------------------------------------------------------------------------------------------------------
def tube_intersection(a0, a1, ra, b0, b1, rb, n=24, end=1):
    """Points where the surface of tube A (axis a0->a1, radius ra) meets the cylinder B (axis b0->b1, radius rb),
    searched near A's `end` (1: a1, 0: a0). Returns a closed loop or None."""
    a0, a1, b0, b1 = map(Vector, (a0, a1, b0, b1))
    ta = (a1 - a0).normalized()
    tb = (b1 - b0).normalized()
    na = _perp(ta, Vector((1, 0, 0)) if abs(ta.x) < .9 else Vector((0, 1, 0)))
    ba = ta.cross(na)
    start = a1 if end == 1 else a0
    sign = -1 if end == 1 else 1   # march from the end back into A
    pts = []
    for k in range(n):
        th = TAU * k / n
        off = na * math.cos(th) * ra + ba * math.sin(th) * ra
        # point on A's surface line: q(s) = start + off + ta*sign*s ; find s where dist(q, line B) = rb
        lo, hi = -0.08, 0.12

        def f(s):
            q = start + off + ta * sign * s
            w = q - b0
            d = w - tb * w.dot(tb)
            return d.length - rb
        # find the first root walking from inside B outward
        s_prev, f_prev = lo, f(lo)
        found = None
        steps = 80
        for i in range(1, steps + 1):
            s = lo + (hi - lo) * i / steps
            fs = f(s)
            if f_prev < 0 <= fs or f_prev > 0 >= fs:
                a_, b_ = s_prev, s
                for _ in range(30):
                    mid = (a_ + b_) / 2
                    if (f(a_) < 0) == (f(mid) < 0):
                        a_ = mid
                    else:
                        b_ = mid
                found = (a_ + b_) / 2
                if f_prev < 0:   # leaving B: the outer surface
                    break
            s_prev, f_prev = s, fs
        if found is None:
            return None
        pts.append(start + off + ta * sign * found)
    return pts


def weld(m, loop, r, sides, pid, lift=None):  # sides: 4 is enough for a bead this small
    if not loop:
        return
    # push the bead slightly outward from the loop centroid so it sits in the corner, not inside the tubes
    c = sum(loop, Vector()) / len(loop)
    path = [p for p in loop]
    sweep(m, path, circle_profile(r, sides), pid, closed=True,
          ref=(path[0] - c).normalized() if (path[0] - c).length > 1e-6 else Vector((1, 0, 0)))


# ----------------------------------------------------------------------------------------------------------------------
# Wheels
# ----------------------------------------------------------------------------------------------------------------------
def tyre_profile(bead_r, width, height, pts=11, flat=0.0):
    """Tyre cross-section [(axial x, radius)] from the left bead round the crown to the right bead (open; the rim
    covers the bead). flat: tread flattening 0..1."""
    out = []
    for i in range(pts):
        t = math.pi * i / (pts - 1)            # 0 .. pi around the section
        x = -math.cos(t) * width / 2
        y = math.sin(t)
        y = y ** (1 - 0.35 * flat)
        out.append((x * (0.92 + 0.08 * math.sin(t)), bead_r + 0.004 + (height - 0.004) * y))
    # tuck the beads in toward the rim
    out[0] = (out[0][0] * 0.78, bead_r + 0.0015)
    out[-1] = (out[-1][0] * 0.78, bead_r + 0.0015)
    return out


def spoke_set(m, pid, nip_pid, *, n, hub_r, hub_x, rim_r, cross, axle=Vector(), sides=3, r=0.0011, offset_left=0.0,
              nipples=True, rim_x=0.0022):
    """n spokes, k-cross lacing, alternating flanges. hub_x = (left flange x, right flange x) along the axle (game X).
    Rotation is about the game X axis; angles measured in the YZ plane."""
    per_flange = n // 2
    step = TAU / per_flange
    dth = 720.0 / n * cross * math.pi / 180.0
    for i in range(n):
        side = 1 if i % 2 == 0 else -1               # +1 right flange (game +X), -1 left
        fx = hub_x[1] if side > 0 else hub_x[0]
        j = i // 2
        hub_a = j * step + (0 if side > 0 else step / 2) + offset_left
        lead = 1 if (j % 2 == 0) else -1
        rim_a = hub_a + lead * dth
        # rim holes are evenly spaced: snap the rim angle to the nearest rim hole of this side
        P0 = axle + Vector((fx, math.sin(hub_a) * hub_r, math.cos(hub_a) * hub_r))
        P1 = axle + Vector((side * rim_x, math.sin(rim_a) * rim_r, math.cos(rim_a) * rim_r))
        d = (P1 - P0)
        # start the spoke a little inside the flange (the J-bend head sits behind it)
        a = P0 - d.normalized() * 0.002
        tube(m, a, P1, r, sides, pid, caps=(False, False), ref=Vector((1, 0, 0)))
        if nipples:
            tdir = d.normalized()
            tube(m, P1 - tdir * 0.0015, P1 + tdir * 0.009, 0.0021, 4, nip_pid, caps=(False, False))


# ----------------------------------------------------------------------------------------------------------------------
# Chains: links distributed along a closed path round sprockets and pulleys
# ----------------------------------------------------------------------------------------------------------------------
def chain_path(circles, n_arc=10):
    """circles: [(center Vector (game frame; x ignored), radius, s)] in travel order; s = +1 if the chain turns
    counter-clockwise round it in the (z, y) plane, -1 clockwise. Returns a closed polyline (game frame, at the first
    circle's x): the tangent spans and the arcs of chain wrapped round each sprocket or pulley.

    For signed radii p = s*r the span from circle 1 to 2 touches them at c1 + p1*n and c2 + p2*n, where n.d = p1 - p2
    (d = c2 - c1); of the two solutions the chain leaves circle 1 along perp(n), so we take the one with d.perp(n) > 0."""
    C = [(Vector((c[0].z, c[0].y)), c[1], c[2]) for c in circles]   # 2D (z, y)

    def perp(v):
        return Vector((-v.y, v.x))

    spans = []
    for i in range(len(C)):
        c1, r1, s1 = C[i]
        c2, r2, s2 = C[(i + 1) % len(C)]
        d = c2 - c1
        L = d.length
        p1, p2 = s1 * r1, s2 * r2
        cosv = max(-1.0, min(1.0, (p1 - p2) / L))
        th = math.acos(cosv)
        base = math.atan2(d.y, d.x)
        best = None
        for sg in (1, -1):
            n = Vector((math.cos(base + sg * th), math.sin(base + sg * th)))
            if d.dot(perp(n)) > 0:
                best = n
        spans.append((c1 + best * p1, c2 + best * p2))
    pts = []
    for i in range(len(C)):
        c, r, s = C[i]
        p_in, p_out = spans[i - 1][1], spans[i][0]
        a0 = math.atan2((p_in - c).y, (p_in - c).x)
        a1 = math.atan2((p_out - c).y, (p_out - c).x)
        if s > 0:
            while a1 < a0:
                a1 += TAU
        else:
            while a1 > a0:
                a1 -= TAU
        k = max(2, int(abs(a1 - a0) / TAU * n_arc * 4))
        for j in range(k + 1):
            a = a0 + (a1 - a0) * j / k
            pts.append(c + Vector((math.cos(a), math.sin(a))) * r)
    x = circles[0][0].x
    return [Vector((x, p.y, p.x)) for p in pts]


def chain_links(m, path, pid, pitch=0.0127, plate_h=0.0096, waist=0.0074, half_width=0.0047, t=0.0009, samples=2,
                rollers=False, roller_pid=None):
    """The chain as two scalloped side ribbons (outer plates' silhouette: tall at the pins, waisted between them).
    Each ribbon: an outward face plus top and bottom edges; the link plates, pins and rollers come from the normal map
    (pattern u runs along the chain in metres, so the texture knows where every pin is). Returns the link count."""
    P = resample(path, 900)
    L = polyline_len(P)
    total = L[-1]
    count = max(4, int(round(total / pitch)))
    if count % 2:
        count += 1
    step = total / count
    n = count * samples

    def at(s):
        s %= total
        j = int(np.searchsorted(L, s)) - 1
        j = max(0, min(len(P) - 2, j))
        seg = L[j + 1] - L[j]
        return P[j].lerp(P[j + 1], 0 if seg < 1e-12 else (s - L[j]) / seg)
    pts = [at(i * step / samples) for i in range(n)]
    heights = [(plate_h if (i % samples) == 0 else waist) for i in range(n)]
    first_face = len(m.f)
    for side in (-1, 1):
        x_out = side * (half_width + t)
        x_in = side * half_width
        ring = []
        for i in range(n):
            p = pts[i]
            tang = (pts[(i + 1) % n] - pts[i - 1]).normalized()
            up = Vector((1, 0, 0)).cross(tang).normalized()
            h = heights[i] / 2
            ring.append([m.add_v(p + Vector((x_in, 0, 0)) + up * h), m.add_v(p + Vector((x_out, 0, 0)) + up * h),
                         m.add_v(p + Vector((x_out, 0, 0)) - up * h), m.add_v(p + Vector((x_in, 0, 0)) - up * h)])
        vb = (0.0, t, t + plate_h, 2 * t + plate_h)
        for i in range(n):
            a, b = ring[i], ring[(i + 1) % n]
            u0, u1 = i * step / samples, (i + 1) * step / samples
            faces = ((0, 1), (1, 2), (2, 3))   # top, outer, bottom
            isl = int(u0 / 0.3) + (0 if side < 0 else 50)
            for k, (j0, j1) in enumerate(faces):
                q = (a[j0], b[j0], b[j1], a[j1])
                uvq = [(u0, vb[k] + .005), (u1, vb[k] + .005), (u1, vb[k + 1] + .005), (u0, vb[k + 1] + .005)]
                if side < 0:
                    q = (a[j1], b[j1], b[j0], a[j0])
                    uvq = [uvq[3], uvq[2], uvq[1], uvq[0]]
                m.add_f(q, uvq, pid, isl)
            m.sharp.add((a[1], b[1]))
            m.sharp.add((a[2], b[2]))
    flip_faces(m, first_face)        # (wound inward as built: turn the plates' faces out, away from the rollers)
    return count


def sprocket_outline(teeth, pitch=0.0127, roller=0.00775, pts_per_tooth=6, tip=0.0042):
    """Outline of a toothed sprocket in 2D (CCW)."""
    Rp = pitch / (2 * math.sin(math.pi / teeth))
    root = Rp - roller / 2 - 0.0002
    tip_r = Rp + tip
    out = []
    for k in range(teeth):
        a0 = TAU * k / teeth
        half = math.pi / teeth
        # valley centred at a0, tooth centred at a0 + half
        if pts_per_tooth >= 6:
            prof = [(-0.30, root + 0.0006), (0.0, root), (0.30, root + 0.0006), (0.62, Rp + 0.0012),
                    (0.86, tip_r - 0.0004), (1.14, tip_r - 0.0004), (1.38, Rp + 0.0012), (1.70, root + 0.0006)]
            prof = prof[1:-1] if pts_per_tooth == 6 else prof
        elif pts_per_tooth == 2:
            prof = [(0.0, root + 0.0008), (1.0, tip_r - 0.0008)]
        else:
            prof = [(0.0, root), (0.55, Rp + 0.0008), (1.0, tip_r - 0.0006), (1.45, Rp + 0.0008)]
        for f, r in prof:
            if pts_per_tooth >= 6 and f in (-0.30, 1.70):
                continue
            a = a0 + f * half
            out.append((r * math.cos(a), r * math.sin(a)))
    return out, Rp


# ----------------------------------------------------------------------------------------------------------------------
# Lofted shells (saddles, pads, bottle cages' bottle, grips' flanges)
# ----------------------------------------------------------------------------------------------------------------------
def loft(m, sections, pid, closed_sections=True, cap_start=True, cap_end=True):
    """sections: list of lists of 3D points (same count). Quads between consecutive sections; optional fan caps."""
    n = len(sections[0])
    per = []
    for sec in sections:
        p = [0.0]
        for i in range(n if closed_sections else n - 1):
            p.append(p[-1] + (Vector(sec[(i + 1) % n]) - Vector(sec[i])).length)
        per.append(p)
    L = [0.0]
    for i in range(1, len(sections)):
        c0 = sum((Vector(p) for p in sections[i - 1]), Vector()) / n
        c1 = sum((Vector(p) for p in sections[i]), Vector()) / n
        L.append(L[-1] + (c1 - c0).length)
    first_face = len(m.f)
    idx = [[m.add_v(p) for p in sec] for sec in sections]
    for s in range(len(sections) - 1):
        for i in range(n if closed_sections else n - 1):
            i2 = (i + 1) % n
            m.add_f((idx[s][i], idx[s][i2], idx[s + 1][i2], idx[s + 1][i]),
                    [(L[s], per[s][i]), (L[s], per[s][i + 1]), (L[s + 1], per[s + 1][i + 1]), (L[s + 1], per[s][i])], pid)
    for cap, k, flip in ((cap_start, 0, True), (cap_end, len(sections) - 1, False)):
        if not cap:
            continue
        ring = idx[k]
        c = sum((Vector(m.v[i]) for i in ring), Vector()) / n
        ci = m.add_v(c)
        for i in range(n):
            i2 = (i + 1) % n
            tri = (ci, ring[i2], ring[i]) if flip else (ci, ring[i], ring[i2])
            m.add_f(tri, [(20, 20), (20 + .01 * i, 20.01), (20 + .01 * i2, 20.01)], pid)
    # orient outward: signed volume about the shell's own centre
    c = sum((Vector(p) for sec in sections for p in sec), Vector()) / sum(len(sec) for sec in sections)
    vol = 0.0
    for f in m.f[first_face:]:
        p = [Vector(m.v[i]) - c for i in f]
        for k in range(1, len(p) - 1):
            vol += p[0].dot(p[k].cross(p[k + 1]))
    if vol < 0:
        flip_faces(m, first_face)
    return idx


# ----------------------------------------------------------------------------------------------------------------------
# Small hardware
# ----------------------------------------------------------------------------------------------------------------------
def hex_nut(m, center, axis, size, depth, pid, ref=(0, 1, 0)):
    A = Vector(axis).normalized()
    R0 = _perp(A, Vector(ref))
    R1 = A.cross(R0)
    r = size / math.sqrt(3)
    outline = [(r * math.cos(TAU * k / 6 + math.pi / 6), r * math.sin(TAU * k / 6 + math.pi / 6)) for k in range(6)]
    slab(m, outline, depth, pid, origin=center, u=R0, v=R1, chamfer=min(0.0006, depth * .2))


def bolt_head(m, center, axis, d, h, pid, ref=(0, 1, 0), sides=10):
    A = Vector(axis).normalized()
    c = Vector(center)
    lathe(m, [(0, 0.0001), (0, d / 2), (h * .7, d / 2), (h, d / 2 * .8), (h, 0.0001)], sides, pid, origin=c, axis=A,
          ref=ref, sharp=(1, 3))


# ----------------------------------------------------------------------------------------------------------------------
# Conversion to Blender
# ----------------------------------------------------------------------------------------------------------------------
G2B = Matrix(((-1, 0, 0, 0), (0, 0, 1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))   # game (x,y,z) -> Blender (-x, z, y)


def g2b(p):
    return Vector((-p[0], p[2], p[1]))


def to_object(bpy, name, m, parts, materials, collection, smooth_angle=38.0):
    """Create a Blender mesh object from a kit Mesh (game frame -> Blender frame). Writes UV maps 'UVMap' (filled
    later by packing; starts as a copy of the metric pattern) and 'pattern' (metres), face attribute 'pid', material
    slots by part slot, smooth shading with sharp edges by angle plus the kit's forced sharp edges."""
    # drop degenerate and duplicate faces (decimated harvest geometry can carry a few) with their per-face data
    keep_f, keep_uv, keep_pid, keep_isl, seen = [], [], [], [], set()
    for f, uv, p_, isl in zip(m.f, m.uv, m.pid, m.isl):
        idx, uvs = [], []
        for i, t in zip(f, uv):
            if not idx or idx[-1] != i:
                idx.append(i)
                uvs.append(t)
        if len(idx) > 1 and idx[0] == idx[-1]:
            idx.pop()
            uvs.pop()
        key = frozenset(idx)
        if len(set(idx)) < 3 or len(set(idx)) != len(idx) or key in seen:
            continue
        a, b, c = (Vector(m.v[idx[0]]), Vector(m.v[idx[1]]), Vector(m.v[idx[2]]))
        if len(idx) == 3 and (b - a).cross(c - a).length < 1e-12:
            continue
        seen.add(key)
        keep_f.append(tuple(idx)); keep_uv.append(uvs); keep_pid.append(p_); keep_isl.append(isl)
    m.f, m.uv, m.pid, m.isl = keep_f, keep_uv, keep_pid, keep_isl
    me = bpy.data.meshes.new(name)
    verts = [tuple(g2b(p)) for p in m.v]
    me.from_pydata(verts, [], m.f)
    me.validate(clean_customdata=False)
    if len(me.polygons) != len(m.f):
        raise RuntimeError(f'{name}: {len(m.f) - len(me.polygons)} faces were invalid')
    uv_main = me.uv_layers.new(name='UVMap')
    uv_pat = me.uv_layers.new(name='pattern')
    flat = [c for face in m.uv for c in face]
    arr = np.array(flat, dtype=np.float32).ravel()
    uv_pat.data.foreach_set('uv', arr)
    shifted = [(c[0] + 6.0 * isl, c[1]) for face, isl in zip(m.uv, m.isl) for c in face]   # disconnect the islands
    uv_main.data.foreach_set('uv', np.array(shifted, dtype=np.float32).ravel())
    attr = me.attributes.new('pid', 'INT', 'FACE')
    attr.data.foreach_set('value', np.array(m.pid, dtype=np.int32))
    # material slots
    slots = [s for s in ('paint', 'hardware', 'soft') if s in materials]
    for s in slots:
        me.materials.append(materials[s])
    mi = np.array([slots.index(parts.list[p - 1][1]) for p in m.pid], dtype=np.int32)
    me.polygons.foreach_set('material_index', mi)
    me.polygons.foreach_set('use_smooth', np.ones(len(me.polygons), dtype=bool))
    try:
        me.set_sharp_from_angle(angle=math.radians(smooth_angle))
    except AttributeError:
        pass
    if m.sharp:
        sharp = me.attributes.get('sharp_edge') or me.attributes.new('sharp_edge', 'BOOLEAN', 'EDGE')
        lookup = {tuple(sorted(e.vertices)): e.index for e in me.edges}
        vals = np.zeros(len(me.edges), dtype=bool)
        sharp.data.foreach_get('value', vals)
        for a, b in m.sharp:
            i = lookup.get((min(a, b), max(a, b)))
            if i is not None:
                vals[i] = True
        sharp.data.foreach_set('value', vals)
    me.update()
    ob = bpy.data.objects.new(name, me)
    collection.objects.link(ob)
    return ob
