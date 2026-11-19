"""The old oak (lm.old-oak), step 2: from the scan skeleton to game geometry (numpy only; oak_build.py makes it Blender).

What comes from kungphil's scan: the whole branch architecture (every limb's path, the crown's extent and its gaps, the
low limb that sweeps nearly to the ground, the trunk's lean and size: 1.26 m at chest height, forking at 3.3-4.3 m) and
where the foliage is (each leaf card stands where the scan saw leaves, on the branch the skeleton grew there).
What is reconstructed for Last Light (ENVIRONMENT-STYLE-GUIDE §6):
  * the scan is turned 56 deg about the vertical so its limbs answer the lookout: the flattest scaffold limb (17 deg off)
    becomes the swing limb, the sweeping low limb reaches away from every story mark, toward the open side;
  * the swing limb is reshaped near the trunk (it now leaves the trunk at ~3.5 m and runs over the swing pivot dumped
    from the game, ambient.js: groundY + 4.35) and blends back into its scanned path by 7.5 m, so the crown is unchanged;
  * the trunk is rebuilt as one massive stem with root flare and buttress lobes (smallest on the story side, where the
    old bike lies and Alex sits), surface roots on the open side, the AR carving patch at ending.js's height and bearing;
  * a dead stub high on the field side; a few dead twigs; nothing hangs into the swing's path or the riders' heads.
Frame: oak-local (tools/assets/oak-site.mjs): X = lateral (+lat), Y = forward (+d), Z = up; origin = the game's
placement point of the oak. Units: metres.
"""
import json
import math
import os
import numpy as np
from scipy.spatial import cKDTree

import veg_mesh as VM

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OAKDIR = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'oak')
PHI = math.radians(56.0)          # scan -> lookout rotation (chosen from the limb survey; see the report)
DBH_R = 0.63                      # trunk radius at 1.3 m measured in the scan (diameter 1.26 m)
STORY_AZ = (150.0, 265.0)         # bearings (deg, from +X toward +Y) of the swing, the old bike, Alex's place, the group


def az_deg(x, y):
    return math.degrees(math.atan2(y, x)) % 360


def in_story(az):
    return STORY_AZ[0] <= az <= STORY_AZ[1]


class Oak:
    def __init__(self, seed=1958, log=print):
        self.log = log
        self.rng = np.random.default_rng(seed)
        S = json.load(open(os.path.join(OAKDIR, 'oak_skeleton.json')))
        self.site = json.load(open(os.path.join(HERE, 'oak_site.json')))
        c, s = math.cos(PHI), math.sin(PHI)
        self.Rz = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])
        N = S['nodes']
        self.P = np.array([n['p'] for n in N]) @ self.Rz.T
        self.parent = np.array([n['parent'] for n in N])
        self.down = np.array([n['down'] for n in N])
        V = np.load(os.path.join(OAKDIR, 'oak_scan_voxels.npz'))
        self.V = V['pos'].astype(np.float64) @ self.Rz.T
        self.Vn = V['n'].astype(np.float64)
        self.Vcl = V['cluster']
        self.ch = VM.children_of(self.parent)
        self.root = int(np.argmax(self.down))
        sw = self.site['swing']
        self.pivot = np.array(sw['pivot'])
        self.ground = self._ground_fn()
        self._stem()
        self._radii()

    # ---------------------------------------------------------------------------------------------- site and trunk
    def _ground_fn(self):
        g = self.site['grid']
        rows = np.array(g['rows'])
        x0, f0, st = g['x0'], g['f0'], g['step']
        from scipy.ndimage import map_coordinates

        def ground(x, y):
            x = np.asarray(x, np.float64)
            y = np.asarray(y, np.float64)
            return map_coordinates(rows, [(y - f0) / st, (x - x0) / st], order=1, mode='nearest')
        return ground

    def _stem(self):
        stem = [self.root]
        i = self.root
        while self.ch[i]:
            j = max(self.ch[i], key=lambda k: self.down[k])
            if self.down[j] < .55 * self.down[i]:
                break
            stem.append(j)
            i = j
        self.stem = stem
        sp = self.P[stem]
        # trunk axis: smoothed stem centroids (x, y as functions of z), measured slices put the base at (0, 0)
        z = sp[:, 2]
        order = np.argsort(z)
        z, xy = z[order], sp[order, :2]
        k = np.ones(5) / 5
        xs = np.convolve(np.pad(xy[:, 0], 2, mode='edge'), k, 'valid')
        ys = np.convolve(np.pad(xy[:, 1], 2, mode='edge'), k, 'valid')
        self.axis_z = np.concatenate([[-0.6], z, [z[-1] + .5]])
        self.axis_x = np.concatenate([[0], xs - xs[0] * np.exp(-z / .8), [xs[-1]]])
        self.axis_y = np.concatenate([[0], ys - ys[0] * np.exp(-z / .8), [ys[-1]]])
        self.trunk_top = float(min(4.3, z[-1]))
        self.log(f'stem {len(stem)} nodes, top z {z[-1]:.2f}; trunk axis lean at 4 m: '
                 f'({np.interp(4, self.axis_z, self.axis_x):.2f}, {np.interp(4, self.axis_z, self.axis_y):.2f})')

    def axis(self, z):
        return np.array([np.interp(z, self.axis_z, self.axis_x), np.interp(z, self.axis_z, self.axis_y), z])

    def trunk_r(self, z):
        """trunk radius profile (no lobes): measured 0.62-0.64 m from 1 to 2.8 m, flaring below, swelling at the fork."""
        return DBH_R + .42 * np.exp(-np.maximum(z, -.5) / .42) + .08 * np.exp(-((z - 3.6) / .55) ** 2) - .02 * np.clip(z - 1.3, 0, 2)

    def _radii(self):
        # pipe model: area proportional to the foliage carried; calibrated on the stem at 1.3 m
        sz = self.P[self.stem, 2]
        ref = self.stem[int(np.argmin(np.abs(sz - 1.3)))]
        self.k = DBH_R / math.sqrt(self.down[ref])
        self.R = np.maximum(.006, self.k * np.sqrt(self.down))

    # ---------------------------------------------------------------------------------------------- survey
    def limbs(self):
        """major limbs leaving the stem (>2% of the foliage), with bearing and height"""
        tot = self.down[self.root]
        out = []
        stemset = set(self.stem)
        for s in self.stem:
            for c in self.ch[s]:
                if c in stemset or self.down[c] < .02 * tot:
                    continue
                out.append(c)
        top = self.stem[-1]
        for c in self.ch[top]:
            if self.down[c] > .02 * tot and c not in out:
                out.append(c)
        rows = []
        for c in out:
            path = self.heavy_path(c)
            p = self.P[path]
            d = np.hypot(p[:, 0] - np.interp(p[:, 2], self.axis_z, self.axis_x), p[:, 1] - np.interp(p[:, 2], self.axis_z, self.axis_y))
            k = int(np.argmax(d >= 3.0)) if (d >= 3).any() else len(d) - 1
            first_out = int(np.argmax(d > self.trunk_r(p[:, 2]) + .05)) if (d > self.trunk_r(p[:, 2]) + .05).any() else 0
            rows.append(dict(node=c, mass=self.down[c] / tot, az=az_deg(p[k, 0], p[k, 1]), z3=p[k, 2], z_out=p[first_out, 2], path=path))
        return sorted(rows, key=lambda r: -r['mass'])

    def heavy_path(self, c):
        path = [c]
        while self.ch[path[-1]]:
            path.append(max(self.ch[path[-1]], key=lambda k: self.down[k]))
        return path

    def subtree(self, c):
        out, st = [], [c]
        while st:
            x = st.pop()
            out.append(x)
            st.extend(self.ch[x])
        return np.array(out)

    # ---------------------------------------------------------------------------------------------- reshaping
    def reshape_swing_limb(self, limb):
        """Move the limb's first metres onto a path that passes over the swing pivot, blending back by 7.5 m."""
        path = limb['path']
        P = self.P
        piv = self.pivot
        az = math.atan2(piv[1], piv[0])
        dirv = np.array([math.cos(az), math.sin(az), 0])
        rho_p = math.hypot(piv[0], piv[1])
        # radius of the limb where the rope hangs (pipe model along its path)
        pp = P[path]
        rho = np.hypot(pp[:, 0], pp[:, 1])
        r_at = float(np.interp(rho_p, rho, self.R[path])) if np.all(np.diff(rho) > -1) else float(self.R[path][np.argmin(np.abs(rho - rho_p))])
        r_at = max(.19, min(.26, r_at))
        z_piv = piv[2] + r_at * .92            # rope wraps the limb: its top at the limb's underside
        z0 = 3.55
        self.swing_info = dict(radius_at_pivot=r_at, centre_z_at_pivot=z_piv, socket_z=z0)

        def target(rh):
            # rises gently from the trunk to the pivot, then keeps a slow rise outward
            if rh <= rho_p:
                t = rh / rho_p
                z = z0 + (z_piv - z0) * (1 - (1 - t) ** 1.6)
            else:
                z = z_piv + (rh - rho_p) * .16
            return dirv * rh + np.array([0, 0, z])
        disp = {}
        for n in path:
            rh = math.hypot(P[n, 0], P[n, 1])
            w = 1.0 if rh <= 4.0 else max(0.0, 1 - (rh - 4.0) / 3.5)
            w = w * w * (3 - 2 * w)
            disp[n] = (target(rh) - P[n]) * w
        # every node of the subtree moves with the point of the main path it hangs from
        onpath = set(path)
        anchor = {}
        for n in self.subtree(path[0]):
            m = n
            while m not in onpath:
                m = self.parent[m]
            anchor[n] = m
        for n, m in anchor.items():
            P[n] = P[n] + disp[m]
        self.swing_path = path
        self.log(f'swing limb: bearing {math.degrees(az) % 360:.1f} deg, centre {z_piv:.2f} m over the pivot '
                 f'(rope top {piv[2]:.2f}, limb radius {r_at:.2f})')

    def clear_zones(self):
        """Nodes that may not carry wood or leaves: the rope and the tire's swept volume, the riders' and walkers' heads."""
        piv = self.pivot
        dxy = np.hypot(self.P[:, 0] - piv[0], self.P[:, 1] - piv[1])
        swing_set = set(self.subtree(self.swing_path[0]).tolist())
        rope = (dxy < 1.0) & (self.P[:, 2] < piv[2] - .05)
        arc = (dxy < 2.6) & (self.P[:, 2] < piv[2] - .9)
        self.blocked = rope | arc
        self.blocked[self.stem] = False
        self.blocked[self.swing_path] = False
        self.log(f'clear zones: {int(rope.sum())} nodes under the rope, {int(arc.sum())} in the tire arc removed')

    def dead_wood(self):
        """A dead stub high on the field side (+Y), and a sprinkle of dead twigs (crown gaps)."""
        P, R = self.P, self.R
        cand = [i for i in range(len(P)) if 9.5 < P[i, 2] < 13.5 and P[i, 1] > 3 and .055 < R[i] < .1 and self.parent[i] >= 0
                and R[self.parent[i]] > R[i] * 1.6]
        self.dead = np.zeros(len(P), bool)
        if cand:
            c = max(cand, key=lambda i: P[i, 1] + P[i, 2] * .3)
            sub = self.subtree(c)
            self.dead[sub] = True
            self.dead_stub = c
            self.log(f'dead stub at ({P[c, 0]:.1f}, {P[c, 1]:.1f}, {P[c, 2]:.1f}) r {R[c]:.3f}, {len(sub)} nodes bare')
        small = [i for i in range(len(P)) if .03 < R[i] < .05 and self.parent[i] >= 0 and R[self.parent[i]] > .07 and 5 < P[i, 2]]
        pick = self.rng.choice(small, size=min(len(small), max(1, len(small) // 25)), replace=False)
        for c in pick:
            self.dead[self.subtree(c)] = True
        self.log(f'dead twigs: {len(pick)} small branches without leaves')


# ================================================================================================== geometry
LOD_SPEC = {
    # wood: minimum branch radius meshed, sides by radius, resample step; leaves: card spacing, size, fold (4 tris)
    0: dict(rmin=.032, sides=lambda r: 18 if r > .3 else 12 if r > .14 else 7 if r > .07 else 5 if r > .045 else 4,
            step=lambda r: min(.8, max(.22, r * 4.5)), leaf_spacing=.50, leaf_size=(.62, .95), fold=.35, trunk_sides=56),
    1: dict(rmin=.07, sides=lambda r: 10 if r > .3 else 6 if r > .12 else 4,
            step=lambda r: min(1.0, max(.3, r * 5)), leaf_spacing=.82, leaf_size=(1.1, 1.5), fold=0.0, trunk_sides=20),
    2: dict(rmin=.14, sides=lambda r: 6 if r > .3 else 4,
            step=lambda r: min(2.0, max(.6, r * 7)), leaf_spacing=1.55, leaf_size=(2.1, 2.8), fold=0.0, trunk_sides=10),
}
MAT_BARK, MAT_LEAF, MAT_DETAIL = 0, 1, 2


def _smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def _periodic_noise(seed, n=12):
    rng = np.random.default_rng(seed)
    ph = rng.uniform(0, 2 * np.pi, (n, 2))
    fr = rng.integers(1, 9, n)
    fz = rng.uniform(.6, 3.5, n)
    amp = 1 / fr

    def f(theta, z):
        theta = np.asarray(theta)
        out = 0
        for i in range(n):
            out = out + amp[i] * np.sin(fr[i] * theta + ph[i, 0] + fz[i] * z) * np.cos(fz[i] * .7 * z + ph[i, 1])
        return out / amp.sum()
    return f


class OakGeometry:
    """Everything oak_build.py needs: per-LOD MeshBuf arrays, the carving patch, and a record of what was decided."""

    def __init__(self, oak):
        self.o = oak
        o = oak
        limbs = o.limbs()
        self.limb_rows = [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in r.items() if k != 'path'} for r in limbs]
        # the flattest limb within 30 deg of the swing's bearing becomes the swing limb
        piv_az = az_deg(o.pivot[0], o.pivot[1])
        cand = [r for r in limbs if abs((r['az'] - piv_az + 180) % 360 - 180) < 30]
        swing = min(cand, key=lambda r: r['z3'])
        o.reshape_swing_limb(swing)
        o.clear_zones()
        o.dead_wood()
        self.noise = _periodic_noise(5)
        self.noise2 = _periodic_noise(9, 16)
        # buttress lobes: bearings (deg) and amplitudes; the fused stem toward the sweeping limb is the biggest
        sweep = next(r for r in limbs if r['z_out'] < 2 and not in_story(r['az']))
        self.sweep_az = sweep['az']
        lobes = [(sweep['az'], .34, 3.4), (sweep['az'] + 58, .2, 1.0), (sweep['az'] - 62, .22, 1.1), (35, .16, .9), (115, .18, .9),
                 (300, .14, .7), (225, .07, .6), (180, .06, .5)]
        self.lobes = [(math.radians(a), (amp * .45 if in_story(a % 360) else amp), h) for a, amp, h in lobes]
        self.carve_az = math.atan2(o.pivot[1], o.pivot[0])   # ending.js: the carving faces the swing
        self.carve_z = o.site['oak']['groundAtTrunk'] + o.site['carving']['height'] + .08
        o.log(f'trunk lobes (deg, amp): {[(round(math.degrees(a)) % 360, round(m, 2)) for a, m, _ in self.lobes]}')

    # ---------------------------------------------------------------------------------------------- trunk surface
    def trunk_radius(self, theta, z):
        """radius of the lobed, flared trunk at bearing theta (rad) and height z (scalar z, array theta ok)"""
        o = self.o
        r = o.trunk_r(z)
        lob = 0
        for a, amp, h in self.lobes:
            d = np.angle(np.exp(1j * (theta - a)))
            fall = np.exp(-np.maximum(z, 0) / (.45 if h < 2 else 1.0)) if h < 2 else _smoothstep(h + .5, h - .4, z) * (.55 + .45 * math.exp(-max(z, 0) / .6))
            lob = lob + amp * np.cos(np.clip(d, -np.pi / 2, np.pi / 2)) ** 6 * fall
        bark = .035 * self.noise(theta, z * 1.3) + .018 * self.noise2(theta * 2, z * 3.1)
        # the carving: the trunk is a little flatter where the letters were cut (they sit on a smooth bulge of callus)
        dc = np.angle(np.exp(1j * (theta - self.carve_az)))
        flat = np.exp(-(dc / .35) ** 2) * math.exp(-((z - self.carve_z) / .35) ** 2)
        return (r + lob) * (1 + bark * (1 - .8 * flat)) + .012 * flat

    def trunk_point(self, theta, z, off=0.0):
        a = self.o.axis(z)
        rr = self.trunk_radius(theta, z) + off
        return np.array([a[0] + rr * math.cos(theta), a[1] + rr * math.sin(theta), z])

    # ---------------------------------------------------------------------------------------------- data per vertex
    def ao_bark(self, pts):
        return np.clip(.38 + .62 * self.ao(pts), 0, 1)

    def wind_of(self, n):
        o = self.o
        return np.array([self.flex[n], self.phase[n], 0.0, 1.0 if o.dead[n] else 0.0])

    def prepare(self):
        o = self.o
        P, R = o.P, o.R
        # foliage density for occlusion: the scan's own leaf voxels
        leafy = o.R[o.Vcl.clip(0)] < .08
        self.ao = VM.DensityAO(o.V[leafy], o.Vn[leafy], cell=.6, sigma=.55)
        # wind flex: grows with distance along the hierarchy and with slenderness; phase: per scaffold limb
        dist = np.zeros(len(P))
        order = np.argsort(np.array([0] * len(P)))
        # breadth-first from the root
        q = [o.root]
        seen = np.zeros(len(P), bool)
        seen[o.root] = True
        limb_of = np.full(len(P), -1)
        while q:
            nq = []
            for i in q:
                for c in o.ch[i]:
                    dist[c] = dist[i] + np.linalg.norm(P[c] - P[i])
                    limb_of[c] = c if (i in set(o.stem) and c not in set(o.stem)) else limb_of[i]
                    nq.append(c)
            q = nq
        self.flex = np.clip((dist - 3.5) / 16, 0, 1) ** 1.2 * (1 - _smoothstep(.06, .45, R) * .85)
        self.phase = np.array([VM.hash01(limb_of[i]) * .7 + VM.hash01(i, 3.1) * .08 if limb_of[i] >= 0 else 0 for i in range(len(P))]) % 1
        del order

    # ---------------------------------------------------------------------------------------------- wood
    def wood(self, buf, lod):
        o = self.o
        spec = LOD_SPEC[lod]
        P, R = o.P, o.R
        stemset = set(o.stem)
        tris = 0
        # 1. the trunk: rings of the lobed surface from below the ground to the fork, closing over the top
        zs = np.concatenate([np.arange(-.55, 1.2, .06 if lod == 0 else .2), np.arange(1.2, o.trunk_top + .36, .12 if lod == 0 else .35)])
        sides = spec['trunk_sides']
        th = np.linspace(0, 2 * np.pi, sides + 1)
        rings, uvs, cols, winds = [], [], [], []
        circ = 2 * np.pi * (DBH_R + .1)
        urep = max(1, int(round(circ / 1.0)))
        for z in zs:
            top_taper = _smoothstep(o.trunk_top - .45, o.trunk_top + .35, z)
            rr = self.trunk_radius(th, z) * (1 - .35 * top_taper)
            a = o.axis(z)
            ring = np.stack([a[0] + rr * np.cos(th), a[1] + rr * np.sin(th), np.full_like(th, z)], 1)
            rings.append(ring)
            uvs.append(np.stack([th / (2 * np.pi) * urep, np.full_like(th, (z + .6) / 1.0)], 1))
        V = np.concatenate(rings)
        UV = np.concatenate(uvs)
        w = sides + 1
        F = []
        for i in range(len(zs) - 1):
            a_ = i * w + np.arange(sides)
            F += [np.stack([a_, a_ + w, a_ + 1], 1), np.stack([a_ + 1, a_ + w, a_ + w + 1], 1)]
        top = o.axis(zs[-1] + .25)
        V = np.concatenate([V, top[None]])
        UV = np.concatenate([UV, [[urep * .5, (zs[-1] + .85)]]])
        base = (len(zs) - 1) * w
        F.append(np.stack([base + np.arange(sides), np.full(sides, len(V) - 1), base + np.arange(sides) + 1], 1))
        F = np.concatenate(F)
        occ = self.ao_bark(V)
        # moss on the trunk's north side (here: toward -Y, the shaded side at the lookout's evening) and low down
        north = np.clip(-(V[:, 1] - np.interp(V[:, 2], o.axis_z, o.axis_y)) / (DBH_R + .4), 0, 1)
        moss = np.clip(north * (1 - _smoothstep(.5, 3.2, V[:, 2])) * 1.2 + (V[:, 2] < .25) * .35, 0, 1)
        C = np.stack([occ, occ, occ], 1)
        W = np.stack([np.zeros(len(V)), np.zeros(len(V)), np.zeros(len(V)), -moss], 1)   # w<0: moss amount on bark
        buf.add(V, UV, C, W, F, MAT_BARK)
        tris += len(F)
        # 2. surface roots on the open side, half buried, following the real ground
        if lod <= 1:
            rng = np.random.default_rng(31)
            for a_deg, length, r0 in ((self.sweep_az - 8, 3.4, .2), (self.sweep_az + 55, 2.6, .16), (self.sweep_az - 70, 2.2, .14),
                                      (95, 2.4, .15), (40, 1.9, .12), (135, 1.5, .1)):
                if in_story(a_deg % 360):
                    continue
                a = math.radians(a_deg)
                k = 14 if lod == 0 else 6
                t = np.linspace(0, 1, k)
                wob = np.cumsum(rng.normal(0, .06, k))
                bear = a + wob * .25
                dist = .45 + t * length
                x = np.cos(bear) * dist
                y = np.sin(bear) * dist
                g = o.ground(x, y)
                rr = r0 * (1 - .85 * t) + .015
                z = g - rr * (.25 + .5 * t) + .02 * np.sin(t * 9)
                z[0] = .55
                pts = np.stack([x, y, z], 1)
                pts = VM.smooth_polyline(pts, 3, .4)
                col = np.tile(self.ao_bark(pts)[:, None], (1, 3)) * .92
                wnd = np.zeros((k, 4))
                wnd[:, 3] = -.5
                tris += VM.tube(buf, pts, rr, 10 if lod == 0 else 5, MAT_BARK, col, wnd, tile=(.6, .6))
        # 3. branches: chains from the skeleton, sockets where they truly leave the trunk
        weight = o.down.copy()
        chs = VM.chains(o.parent, weight, o.root)
        for att, path in chs:
            path = [n for n in path if not o.blocked[n]] if att != -1 else path
            if att == -1:
                # the root chain: the trunk is meshed already; keep what continues above it (the leader)
                path = [n for n in path if n not in stemset]
                att = o.stem[-1]
            if len(path) < 2:
                continue
            if R[path[0]] < spec['rmin']:
                continue
            pts = P[path]
            rad = R[path].copy()
            # leaving the trunk: drop nodes still inside the trunk, socket on the axis below the departure
            if att in stemset or path[0] in stemset:
                d = np.array([math.hypot(p[0] - o.axis(p[2])[0], p[1] - o.axis(p[2])[1]) - o.trunk_r(p[2]) for p in pts])
                outside = np.nonzero((d > .5) | (pts[:, 2] > 6.5))[0]
                if not len(outside):
                    continue
                k0 = outside[0]
                zf = pts[k0, 2]
                if path[0] in o.swing_path or path == o.swing_path[:len(path)]:
                    zs_ = o.swing_info['socket_z']
                else:
                    zs_ = float(np.clip(zf - .7, 2.9, o.trunk_top))
                sock = o.axis(zs_)
                pts = np.concatenate([sock[None], pts[k0:]])
                rad = np.concatenate([[rad[k0] * 1.05], rad[k0:]])
            else:
                pts = np.concatenate([P[att][None], pts])
                rad = np.concatenate([[min(R[att] * .92, rad[0] * 1.15)], rad])
            # radius never grows toward the tip; a collar where big limbs leave
            rad = np.minimum.accumulate(rad)
            # smooth (more on thin branches: the slices' centroid noise), resample, cut at rmin
            it = 4 if rad[0] > .2 else 7
            pts = VM.smooth_polyline(pts, it, .5, fix_first=True)
            keep = rad >= spec['rmin'] * .8
            if keep.sum() < 2:
                continue
            last = int(np.nonzero(keep)[0][-1]) + 1
            pts, rad = pts[:last], rad[:last]
            nodes_idx = np.array([path[0]] + list(path[:last - 1]) if len(path) >= last - 1 else path)
            ex = np.stack([np.arange(len(pts), dtype=np.float64)], 1)
            P2, R2, E2 = VM.resample(pts, rad, spec['step'], ex)
            if len(P2) < 2:
                continue
            if att in stemset and rad[0] > .15:
                s_ = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P2, axis=0), axis=1))])
                R2 = R2 * (1 + .28 * np.exp(-s_ / .5))
            # dead stub: broken short, no cap smoothing
            src = np.clip(np.round(E2[:, 0]).astype(int), 0, len(path) - 1)
            ids = np.array(path)[np.clip(src - 1, 0, len(path) - 1)]
            if o.dead[ids].all() and getattr(o, 'dead_stub', None) in path:
                s_ = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P2, axis=0), axis=1))])
                cut = max(2, int(np.searchsorted(s_, 1.7)))
                P2, R2, ids = P2[:cut], R2[:cut] * 1.0, ids[:cut]
                R2[-1] = R2[-2] * .85
            col = np.tile(self.ao_bark(P2)[:, None], (1, 3))
            wnd = np.stack([self.flex[ids], self.phase[ids], np.zeros(len(ids)), np.where(o.dead[ids], 1.0, 0.0)], 1)
            tris += VM.tube(buf, P2, R2, spec['sides'](float(R2[0])), MAT_BARK, col, wnd, tile=(1.0, 1.0))
        return tris

    # ---------------------------------------------------------------------------------------------- leaves
    def leaves(self, buf, lod):
        o = self.o
        spec = LOD_SPEC[lod]
        rng = np.random.default_rng(100 + lod)
        V, Vn, Vcl = o.V, o.Vn, o.Vcl
        node = np.clip(Vcl, 0, None)
        R = o.R
        cand = (Vcl >= 0) & (R[node] < .07) & (V[:, 2] > 2.2) & ~o.dead[node] & ~o.blocked[node]
        # no foliage in the swing's swept volume, none at riders' and walkers' heads around the lookout
        piv = o.pivot
        dxy = np.hypot(V[:, 0] - piv[0], V[:, 1] - piv[1])
        cand &= ~((dxy < 1.25) & (V[:, 2] < piv[2] + .2))
        cand &= ~((dxy < 2.8) & (V[:, 2] < piv[2] - .6))
        cand &= ~((V[:, 2] < 2.6) & (np.vectorize(lambda x, y: in_story(az_deg(x, y)))(V[:, 0], V[:, 1])))
        idx = np.nonzero(cand)[0]
        pick = idx[VM.poisson_pick(V[idx], Vn[idx], spec['leaf_spacing'], rng)]
        centre = np.array([0.0, 0.0, 10.5])
        P = o.P
        twig = np.nonzero((R < .06) & (R > .004) & ~o.dead & ~o.blocked)[0]
        tt = cKDTree(P[twig])
        n_cards = 0
        occ = np.clip(.3 + .7 * self.ao(V[pick]) ** .8, 0, 1)
        for k, i in enumerate(pick):
            tip = V[i]
            d, j = tt.query(tip)
            nd = twig[j]
            base = P[nd]
            if d < .15 or d > 1.6:
                base = tip - (tip - centre) / (np.linalg.norm(tip - centre) + 1e-9) * .35
            out = tip - centre
            out /= np.linalg.norm(out) + 1e-9
            up = (tip - base)
            up = up / (np.linalg.norm(up) + 1e-9) * .55 + out * .35 + np.array([0, 0, .25]) + rng.normal(0, .25, 3)
            up /= np.linalg.norm(up)
            side = np.cross(up, out + rng.normal(0, .5, 3))
            if np.linalg.norm(side) < 1e-3:
                side = np.cross(up, [0, 0, 1.0])
            side /= np.linalg.norm(side)
            size = rng.uniform(*spec['leaf_size'])
            start = base + (tip - base) * .15
            # an upward-facing outer card gets the sun twig, inner/lower cards the shade twig; far LODs the dense cluster
            outer = occ[k] > .62
            cell = 3 if lod >= 1 else (0 if outer else 1) if rng.random() < .7 else 2
            nrm = out * .7 + np.cross(side, up) * .3
            tint = rng.random()
            c = np.array([occ[k]] * 3)
            wnd = np.array([min(1, self.flex[nd] + .25), self.phase[nd], 0, tint])
            VM.card(buf, start, up, side, size, size, cell, MAT_LEAF, c, wnd, normal=nrm, fold=spec['fold'] if outer else 0.0, bend=size * .12)
            n_cards += 1
        return n_cards

    # ---------------------------------------------------------------------------------------------- the carving
    def carving(self, buf):
        """A patch of the trunk surface (0.40 x 0.40 m, 4 mm proud) with the AR detail texture, at ending.js's place."""
        nu, nv = 22, 22
        S = .40
        z0 = self.carve_z - S / 2
        Vs, UV = [], []
        for j in range(nv + 1):
            for i in range(nu + 1):
                z = z0 + S * j / nv
                rr = self.trunk_radius(self.carve_az, z) + .004
                # arc length -> angle: letters read left to right seen from the swing (ending.js)
                th = self.carve_az - ((i / nu) - .5) * S / rr
                Vs.append(self.trunk_point(th, z, .004))
                UV.append([i / nu, j / nv])
        V = np.array(Vs)
        F = []
        for j in range(nv):
            for i in range(nu):
                a = j * (nu + 1) + i
                F += [[a, a + 1, a + nu + 2], [a, a + nu + 2, a + nu + 1]]
        occ = self.ao_bark(V)
        buf.add(V, np.array(UV), np.stack([occ] * 3, 1), np.zeros(4), np.array(F), MAT_DETAIL)
        self.carving_centre = self.trunk_point(self.carve_az, self.carve_z, .004)
        return len(F)
