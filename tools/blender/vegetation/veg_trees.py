"""Last Light street trees (numpy): every species near the Prologue route as skeletons, then one kit for all of them.

Sources of each family's branch architecture:
  oak, ash  : Jungle Jim's "Realistic Trees Collection" (CC BY 4.0) - the three oak and three ash EZ-Tree branch meshes,
              recovered as skeletons (ez_skeleton.py), re-scaled to street-tree size; further variants are reshaped
              (one side pruned back, as a tree trimmed from a house; limbs bent; lean) so silhouettes really differ.
  maple, birch, white pine, spruce, young : grown here by a species-parameterised branching model (the collection has
              none of these). Maples branch opposite and ascend into an oval crown; birch grows as a 2-3 stem clump with
              weeping twigs; conifers grow whorls (spruce dense and conical, white pine in open tiers).
Everything then goes through the same kit as the hero oak (veg_mesh.py): bark tubes, twig cards from the street leaf atlas,
baked canopy occlusion in COLOR_0, wind data in _WIND, three LODs.
"""
import math
import os
import numpy as np

import veg_mesh as VM

HERE = os.path.dirname(os.path.abspath(__file__))

# street leaf atlas cells (veg_textures.street_leaf_atlas): 3x3
CELL = {'maple': (0, 1), 'oak': (2,), 'ash': (3,), 'birch': (4, 5), 'pine': (6,), 'spruce': (7,), 'young': (8,)}
# bark tint per species (COLOR_0 multiplies the shared grey broadleaf bark); birch uses its own bark
BARK_TINT = {'maple': (.92, .91, .89), 'oak': (.80, .74, .67), 'ash': (.88, .86, .82), 'pine': (.78, .60, .48),
             'spruce': (.66, .58, .52), 'young': (.86, .80, .70), 'birch': (1, 1, 1)}
MAT_BARK, MAT_BIRCH, MAT_LEAF = 0, 1, 2


class Skel:
    def __init__(self, pos, parent, radius=None, level=None):
        self.P = np.asarray(pos, np.float64)
        self.par = np.asarray(parent, np.int64)
        self.R = None if radius is None else np.asarray(radius, np.float64)
        self.L = np.zeros(len(self.P), int) if level is None else np.asarray(level, int)

    def children(self):
        return VM.children_of(self.par)

    def downstream(self):
        ch = self.children()
        w = np.ones(len(self.P))
        order = np.argsort(-self.depth())
        for i in order:
            if self.par[i] >= 0:
                w[self.par[i]] += w[i]
        return w

    def depth(self):
        d = np.zeros(len(self.P), int)
        for i in range(len(self.P)):
            j, k = i, 0
            while self.par[j] >= 0:
                j = self.par[j]
                k += 1
            d[i] = k
        return d

    def pipe_radii(self, r_base, r_tip=.006):
        ch = self.children()
        leaves = np.array([0 if ch[i] else 1 for i in range(len(self.P))], float)
        w = leaves.copy()
        for i in np.argsort(-self.depth()):
            if self.par[i] >= 0:
                w[self.par[i]] += w[i]
        R = r_tip * np.sqrt(w)
        root = int(np.argmin(self.par))
        R *= r_base / R[root]
        self.R = np.maximum(R, r_tip * .8)
        return self.R


# --------------------------------------------------------------------------------------------------- growth model
def _rot(v, axis, ang):
    axis = axis / (np.linalg.norm(axis) + 1e-12)
    return v * math.cos(ang) + np.cross(axis, v) * math.sin(ang) + axis * np.dot(axis, v) * (1 - math.cos(ang))


def _perp(v):
    a = np.array([0, 0, 1.0]) if abs(v[2]) < .9 else np.array([1.0, 0, 0])
    p = np.cross(v, a)
    return p / np.linalg.norm(p)


SPECIES = {
    # H total height, base: first scaffold height, r0 trunk radius, arrangement, scaffold angle (deg from vertical, low..high),
    # L1 scaffold length factor (of H), env crown envelope, trop tropism per level (+ up, - droop), gnarl per level,
    # child spacing per level (m), child angle per level, child length per level, levels
    'maple': dict(H=(9.5, 13.0), base=(.22, .3), r0=(.20, .27), opp=True, a0=(64, 36), L1=(.5, .62), env='oval', lead=.74,
                  trop=(.10, .06, .02, .0), gnarl=(.04, .09, .14, .2), sp=(.55, .5, .34, .22), ca=(0, 48, 52, 55), cl=(0, .7, .62, .5), levels=3, card=(.75, 1.05)),
    'ash': dict(H=(10, 13.5), base=(.28, .36), r0=(.19, .25), opp=True, a0=(55, 30), L1=(.42, .52), env='oval', lead=.85,
                trop=(.12, .09, .05, 0), gnarl=(.03, .07, .12, .2), sp=(.65, .55, .38, .25), ca=(0, 42, 50, 55), cl=(0, .66, .6, .5), levels=3, card=(.8, 1.1)),
    'oak': dict(H=(10, 13.0), base=(.22, .30), r0=(.25, .32), opp=False, a0=(72, 45), L1=(.45, .55), env='dome', lead=.55,
                trop=(.04, .03, .02, 0), gnarl=(.06, .16, .2, .25), sp=(.7, .6, .4, .28), ca=(0, 55, 58, 60), cl=(0, .62, .55, .45), levels=3, card=(.8, 1.1)),
    'birch': dict(H=(9, 12), base=(.18, .26), r0=(.09, .12), opp=False, a0=(34, 22), L1=(.22, .3), env='narrow', lead=.95, stems=(2, 3),
                  trop=(.14, .04, -.10, -.22), gnarl=(.03, .06, .1, .14), sp=(.42, .38, .3, .22), ca=(0, 38, 45, 40), cl=(0, .66, .62, .52), levels=3, card=(.6, .85)),
    'young': dict(H=(3.6, 4.6), base=(.36, .46), r0=(.04, .05), opp=True, a0=(52, 32), L1=(.36, .44), env='oval', lead=.92,
                  trop=(.1, .08, .04, 0), gnarl=(.03, .06, .1, .12), sp=(.3, .28, .2, .15), ca=(0, 45, 50, 50), cl=(0, .62, .55, .45), levels=3, card=(.55, .72)),
}


def _envelope(kind, t):
    t = float(np.clip(t, 0, 1))
    if kind == 'oval':
        return max(.15, math.sin(math.pi * (.12 + .82 * t)) ** .8)
    if kind == 'dome':
        return max(.15, (1 - t ** 1.7) ** .7)
    if kind == 'narrow':
        return max(.15, math.sin(math.pi * (.1 + .85 * t)) ** 1.2)
    return 1.0


def grow(species, seed):
    """A broadleaf (or birch / young) skeleton by a species-parameterised branching model."""
    S = SPECIES[species]
    rng = np.random.default_rng(seed)
    H = rng.uniform(*S['H'])
    base = rng.uniform(*S['base']) * H
    pos, par, lev = [], [], []

    def add(p, parent, level):
        pos.append(np.array(p, float))
        par.append(parent)
        lev.append(level)
        return len(pos) - 1

    def branch(start, d, length, level, t_crown=0.0):
        seg = max(.18, length / max(4, length / .45))
        n = max(2, int(length / seg))
        node = start
        p = pos[start].copy()
        d = d / np.linalg.norm(d)
        kids = []
        step_child = S['sp'][min(level + 1, 3)] if level + 1 <= S['levels'] else 1e9
        next_child = length * (.25 if level else .0) + rng.uniform(0, step_child)
        travelled = 0.0
        roll = rng.uniform(0, 2 * np.pi)
        for i in range(n):
            d = d + np.array([0, 0, 1.0]) * S['trop'][level] + rng.normal(0, S['gnarl'][level], 3)
            d /= np.linalg.norm(d)
            p = p + d * seg
            travelled += seg
            node = add(p, node, level)
            if level + 1 <= S['levels'] and travelled >= next_child and travelled < length * .97:
                k = 2 if (S['opp'] and level <= 1) else 1
                for j in range(k):
                    roll += (math.pi if k == 2 and j == 1 else (math.pi / 2 if S['opp'] else 2.4)) + rng.normal(0, .3)
                    ax = _rot(_perp(d), d, roll)
                    cd = _rot(d, ax, math.radians(S['ca'][level + 1] + rng.normal(0, 8)))
                    rem = 1 - travelled / length
                    cl = length * S['cl'][level + 1] * (.45 + .75 * rem) * rng.uniform(.75, 1.15)
                    if cl > .25:
                        kids.append((node, cd, cl, level + 1))
                next_child += step_child * rng.uniform(.8, 1.25)
        for kid in kids:
            branch(*kid)
        return node

    root = add([0, 0, -.35], -1, 0)
    stems = rng.integers(S.get('stems', (1, 1))[0], S.get('stems', (1, 1))[1] + 1)
    for s in range(stems):
        lean = math.radians(rng.uniform(2, 6) if stems == 1 else rng.uniform(10, 18))
        az = rng.uniform(0, 2 * np.pi) if stems == 1 else s / stems * 2 * np.pi + rng.uniform(-.4, .4)
        d = np.array([math.sin(lean) * math.cos(az), math.sin(lean) * math.sin(az), math.cos(lean)])
        # the leader, with scaffolds along it above `base`
        p = pos[root].copy()
        node = root
        lead_len = H * S['lead'] * (1 if stems == 1 else rng.uniform(.85, 1.0))
        z = 0.0
        step = .4
        next_s = base
        roll = rng.uniform(0, 2 * np.pi)
        scaffolds = []
        while z < lead_len:
            d = d + np.array([0, 0, 1.0]) * .06 + rng.normal(0, S['gnarl'][0], 3)
            d /= np.linalg.norm(d)
            p = p + d * step
            z += step
            node = add(p, node, 0)
            if z >= next_s:
                t = (z - base) / max(.1, H - base)
                k = 2 if S['opp'] else 1
                for j in range(k):
                    roll += (math.pi if (k == 2 and j == 1) else (math.pi / 2 if S['opp'] else math.radians(137.5))) + rng.normal(0, .25)
                    if rng.random() < .12:
                        continue
                    ang = math.radians(S['a0'][0] + (S['a0'][1] - S['a0'][0]) * t + rng.normal(0, 6))
                    cd = np.array([math.sin(ang) * math.cos(roll), math.sin(ang) * math.sin(roll), math.cos(ang)])
                    L = H * rng.uniform(*S['L1']) * _envelope(S['env'], t) * rng.uniform(.8, 1.15)
                    if stems > 1:
                        L *= .8
                    scaffolds.append((node, cd, L, 1))
                next_s += S['sp'][1] * rng.uniform(.8, 1.3) * (1.6 if S['opp'] else 1.0)
        for sc in scaffolds:
            branch(*sc)
        # the leader's own top: a few short upright twigs so the crown closes over it
        branch(node, np.array([0, 0, 1.0]) + rng.normal(0, .2, 3), H * .12, min(2, S['levels']))
    sk = Skel(pos, par, level=lev)
    sk.pipe_radii(rng.uniform(*S['r0']))
    sk.H = float(np.max(sk.P[:, 2]))
    return sk


def grow_conifer(kind, seed):
    """Spruce: dense conical whorls, branches level with drooping tips. White pine: open tiers of long horizontal branches
    with upturned tips, foliage in tufts; lower limbs pruned in yards."""
    rng = np.random.default_rng(seed)
    spruce = kind == 'spruce'
    H = rng.uniform(9, 13) if spruce else rng.uniform(10, 14)
    pos, par, lev = [], [], []

    def add(p, parent, level):
        pos.append(np.array(p, float))
        par.append(parent)
        lev.append(level)
        return len(pos) - 1
    root = add([0, 0, -.35], -1, 0)
    node, p = root, np.array([0, 0, -.35])
    z = 0.0
    lean = rng.normal(0, .025, 2)
    whorl_dz = rng.uniform(.38, .5) if spruce else rng.uniform(.75, 1.05)
    z_first = rng.uniform(.6, 1.2) if spruce else rng.uniform(2.0, 3.0)
    next_w = z_first
    while z < H:
        z += .3
        p = np.array([lean[0] * z + rng.normal(0, .01), lean[1] * z + rng.normal(0, .01), z])
        node = add(p, node, 0)
        if z >= next_w and z < H - .4:
            t = z / H
            n_br = rng.integers(6, 9) if spruce else rng.integers(4, 7)
            a0 = rng.uniform(0, 2 * np.pi)
            for k in range(n_br):
                az = a0 + k / n_br * 2 * np.pi + rng.normal(0, .25)
                if spruce:
                    L = (H - z) * rng.uniform(.30, .38) + .25
                    pitch = math.radians(rng.uniform(-8, 6))
                else:
                    L = (H - z) * rng.uniform(.35, .55) * (1 if t > .25 else .8) + .4
                    pitch = math.radians(rng.uniform(-2, 10))
                d = np.array([math.cos(az) * math.cos(pitch), math.sin(az) * math.cos(pitch), math.sin(pitch)])
                bp, bn = p.copy(), node
                n = max(2, int(L / .25))
                for i in range(n):
                    tt = i / n
                    droop = (-.06 * tt) if spruce else (.05 * tt)
                    d = d + np.array([0, 0, droop]) + rng.normal(0, .04, 3)
                    d /= np.linalg.norm(d)
                    bp = bp + d * (L / n)
                    bn = add(bp, bn, 1)
                    # branchlets (level 2) on alternate sides
                    if i < n - 1:
                        side = _perp(d) * (1 if i % 2 == 1 else -1)
                        cd = (d * .7 + side * .7)
                        cd /= np.linalg.norm(cd)
                        cl = L * (1 - tt) * rng.uniform(.25, .4)
                        q, qn = bp.copy(), bn
                        for j in range(3):
                            q = q + cd * cl / 3 + np.array([0, 0, -.02 if spruce else .02])
                            qn = add(q, qn, 2)
            next_w += whorl_dz * rng.uniform(.8, 1.2)
    sk = Skel(pos, par, level=lev)
    sk.pipe_radii(rng.uniform(.17, .23) if spruce else rng.uniform(.2, .27), r_tip=.004)
    sk.H = float(np.max(sk.P[:, 2]))
    sk.conifer = kind
    return sk


def from_collection(name, rng, scale=1.0):
    """A Jungle Jim tree's recovered skeleton (ez_skeleton.py), as a Skel with its own measured radii."""
    import ez_skeleton as E
    import veg_paths
    br = E.extract(veg_paths.original('realistic_trees_collection.glb'), name)
    P, par, R = E.to_skeleton(br)
    sk = Skel(P * scale, par, R * scale)
    # levels: the trunk branch is level 0; a branch hanging from a level-k node is k+1
    lev = np.zeros(len(P), int)
    for i in range(len(P)):
        if par[i] >= 0 and (i == 0 or par[i] != i - 1):
            lev[i] = lev[par[i]] + 1
        elif par[i] >= 0:
            lev[i] = lev[par[i]]
    sk.L = lev
    sk.H = float(P[:, 2].max() * scale)
    return sk


def reshape(sk, rng, prune_side=None, bend=0.0, lean=0.0):
    """Genuine silhouette variation: prune the crown back on one side (as owners do near a house), bend limbs, lean."""
    P = sk.P.copy()
    keep = np.ones(len(P), bool)
    if prune_side is not None:
        az = prune_side
        dirv = np.array([math.cos(az), math.sin(az)])
        reach = P[:, :2] @ dirv
        cut = reach > np.percentile(reach[sk.L > 0], 72) if (sk.L > 0).any() else reach > 1e9
        cut &= sk.L > 0
        # remove whole subtrees beyond the cut
        ch = sk.children()
        for i in np.nonzero(cut)[0]:
            if keep[i]:
                st = [i]
                while st:
                    x = st.pop()
                    keep[x] = False
                    st.extend(ch[x])
    if bend:
        h = np.clip(P[:, 2] / max(1, sk.H), 0, 1)
        ph = rng.uniform(0, 2 * np.pi, 3)
        P[:, 0] += bend * np.sin(P[:, 2] * .5 + ph[0]) * h ** 1.3 * np.hypot(P[:, 0], P[:, 1]) * .25
        P[:, 1] += bend * np.sin(P[:, 2] * .45 + ph[1]) * h ** 1.3 * np.hypot(P[:, 0], P[:, 1]) * .25
        P[:, 2] += bend * .2 * np.sin(P[:, 0] * .6 + ph[2]) * np.hypot(P[:, 0], P[:, 1]) * .15
    if lean:
        az = rng.uniform(0, 2 * np.pi)
        P[:, 0] += math.cos(az) * lean * np.maximum(P[:, 2], 0)
        P[:, 1] += math.sin(az) * lean * np.maximum(P[:, 2], 0)
    idx = np.nonzero(keep)[0]
    remap = -np.ones(len(P), int)
    remap[idx] = np.arange(len(idx))
    out = Skel(P[idx], np.where(sk.par[idx] >= 0, remap[np.clip(sk.par[idx], 0, None)], -1), sk.R[idx], sk.L[idx])
    out.H = float(out.P[:, 2].max())
    for k in ('conifer',):
        if hasattr(sk, k):
            setattr(out, k, getattr(sk, k))
    return out


# --------------------------------------------------------------------------------------------------- meshing
LODS = {
    0: dict(rmin=.024, sides=lambda r: 10 if r > .15 else 7 if r > .07 else 5 if r > .035 else 3, step=lambda r: min(.7, max(.18, r * 5)),
            spacing=.50, size=1.12, fold=.3, cells_far=False),
    1: dict(rmin=.045, sides=lambda r: 6 if r > .12 else 4, step=lambda r: min(1.2, max(.35, r * 8)), spacing=.78, size=1.7, fold=0, cells_far=True),
    2: dict(rmin=.11, sides=lambda r: 5 if r > .15 else 3, step=lambda r: min(2.5, max(.7, r * 12)), spacing=1.6, size=3.0, fold=0, cells_far=True),
}


def mesh_tree(sk, species, lod, seed, ao=None):
    """Bark tubes along the skeleton's chains + leaf cards at its twigs. Returns (MeshBuf, card count, leaf points)."""
    spec = LODS[lod]
    rng = np.random.default_rng(seed + 31 * lod)
    buf = VM.MeshBuf()
    P, R, par = sk.P, sk.R, sk.par
    w = sk.downstream()
    root = int(np.argmin(par))
    dist = np.zeros(len(P))
    ch = sk.children()
    order = np.argsort(sk.depth())
    limb = np.full(len(P), -1)
    for i in order:
        if par[i] >= 0:
            dist[i] = dist[par[i]] + np.linalg.norm(P[i] - P[par[i]])
            limb[i] = i if sk.L[i] == 1 and sk.L[par[i]] == 0 else limb[par[i]]
    H = max(1.0, sk.H)
    flex = np.clip(dist / (H * .9), 0, 1) ** 1.3 * (1 - np.clip((R - .03) / .2, 0, 1) * .85)
    phase = np.array([VM.hash01(limb[i], seed) for i in range(len(P))])
    birch = species == 'birch'
    mat_bark = MAT_BIRCH if birch else MAT_BARK
    tint = np.array(BARK_TINT[species])
    # leaf points first (they drive occlusion)
    conifer = species in ('pine', 'spruce')
    if conifer:
        cand = np.nonzero((sk.L >= 1) & (P[:, 2] > .4))[0]
    else:
        tip = np.array([len(ch[i]) == 0 for i in range(len(P))])
        cand = np.nonzero(((R < .035) | (tip & (R < .07))) & (sk.L >= 1) & (P[:, 2] > .22 * H))[0]
        if not len(cand):
            cand = np.nonzero(sk.L >= 1)[0]
    # a cloud of candidate card stems: each twig node and jittered points around it (outward and upward biased);
    # every card still hangs from its twig node, so nothing floats
    centre0 = np.array([0, 0, H * (.62 if not conifer else .45)])
    reps = 2 if conifer else 4
    cloud, owner = [], []
    for i in cand:
        out = P[i] - centre0
        out = out / (np.linalg.norm(out) + 1e-9)
        for r_ in range(reps):
            off = np.zeros(3) if r_ == 0 else rng.normal(0, .32, 3) + out * .25
            cloud.append(P[i] + off)
            owner.append(i)
    cloud, owner = np.array(cloud), np.array(owner)
    sel = VM.poisson_pick(cloud, np.ones(len(cloud)), spec['spacing'] * (.72 if conifer else 1.0), rng)
    pick = owner[sel]
    stems = cloud[sel]
    leafpts = stems
    if ao is None and len(leafpts):
        ao = VM.DensityAO(leafpts, np.ones(len(leafpts)), cell=.5, sigma=.35 if not conifer else .5, pad=2.0)
    occ = (lambda X: np.clip(.42 + .58 * ao(X, length=6.0, step=.5), 0, 1)) if ao else (lambda X: np.ones(len(X)))
    # wood
    tris = 0
    for att, path in VM.chains(par, w, root):
        pts = P[path]
        rad = R[path]
        if att >= 0:
            pts = np.concatenate([P[att][None], pts])
            rad = np.concatenate([[min(R[att] * .95, rad[0] * 1.2)], rad])
        if rad[0] < spec['rmin']:
            continue
        rad = np.minimum.accumulate(rad)
        keep = rad >= spec['rmin'] * .7
        last = int(np.nonzero(keep)[0][-1]) + 1
        if last < 2:
            continue
        pts, rad = VM.smooth_polyline(pts[:last], 2, .4), rad[:last]
        ids = np.array(([att] if att >= 0 else []) + list(path))[:last]
        P2, R2, E2 = VM.resample(pts, rad, spec['step'], np.arange(len(pts), dtype=float)[:, None])
        if len(P2) < 2:
            continue
        src = ids[np.clip(np.round(E2[:, 0]).astype(int), 0, len(ids) - 1)]
        col = occ(P2)[:, None] * tint[None]
        wnd = np.stack([flex[src], phase[src], np.zeros(len(src)), np.zeros(len(src))], 1)
        tile = .8 if R2[0] > .12 else .5 if R2[0] > .05 else .3
        tris += VM.tube(buf, P2, R2, spec['sides'](float(R2[0])), mat_bark, col, wnd, tile=(tile, tile * (2.0 if birch else 1.0)))
    # leaves
    cells = CELL[species]
    centre = np.array([0, 0, H * (.62 if not conifer else .45)])
    s0, s1 = SPECIES[species]['card'] if species in SPECIES else (.5, .7)
    nc = 0
    occ_leaf = occ(leafpts) if len(leafpts) else []
    for k, i in enumerate(pick):
        base = stems[k]
        j = par[i] if par[i] >= 0 else i
        along = P[i] - P[j]
        along = along / (np.linalg.norm(along) + 1e-9)
        out = base - centre
        out[2] *= .5
        out = out / (np.linalg.norm(out) + 1e-9)
        if conifer:
            # needle sprays lie along their branch, nearly level, facing up (white pine tufts turn up more)
            up = along * .85 + out * .25 + np.array([0, 0, .25 if species == 'pine' else .02]) + rng.normal(0, .12, 3)
            size = rng.uniform(.95, 1.3) * spec['size'] * (1.0 if species == 'spruce' else 1.1)
        elif birch:
            up = along * .3 + out * .3 + np.array([0, 0, -.75]) + rng.normal(0, .2, 3)       # weeping twigs hang
            size = rng.uniform(s0, s1) * spec['size']
        else:
            up = along * .45 + out * .45 + np.array([0, 0, .25]) + rng.normal(0, .25, 3)
            size = rng.uniform(s0, s1) * spec['size']
        up /= np.linalg.norm(up)
        side = np.cross(up, out + rng.normal(0, .5, 3))
        if np.linalg.norm(side) < 1e-3:
            side = _perp(up)
        side /= np.linalg.norm(side)
        cell = cells[rng.integers(len(cells))]
        nrm = out * .7 + np.cross(side, up) * .3
        c = np.full(3, occ_leaf[k])
        wnd = np.array([min(1, flex[i] + .2), phase[i], 0, rng.random()])
        VM.card(buf, base - up * size * .08, up, side, size, size, cell, MAT_LEAF, c, wnd, normal=nrm, atlas=(3, 3),
                fold=spec['fold'] if occ_leaf[k] > .6 else 0.0, bend=size * .1)
        nc += 1
    return buf, nc, ao


def stake(buf, height=1.6):
    """The young street tree's stake and tie (bark material, pale tint)."""
    p = np.array([[.32, 0, -.3], [.32, 0, height]])
    VM.tube(buf, p, np.array([.025, .022]), 4, MAT_BARK, np.array([1.1, 1.0, .85]), np.zeros(4), tile=(.3, .6))
    q = np.array([[.3, 0, height - .25], [.05, 0, height - .25]])
    VM.tube(buf, q, np.array([.012, .012]), 3, MAT_BARK, np.array([.25, .25, .25]), np.zeros(4), tile=(.3, .3))
