"""Last Light vegetation mesh kit (numpy only): skeleton -> bark tubes + leaf cards, with the per-vertex data every
tree in the game shares.

Per-vertex data (one standard for every tree, shrub and grass clump):
  COLOR_0 (RGB)  multiplied into the base colour: baked occlusion x tint (canopy self-shadowing the game cannot compute)
  _WIND (vec4)   x = flex (0 rigid trunk base .. 1 twig tip), y = phase (0..1, per limb), z = flutter (leaf cards: 0 at the
                 stem .. 1 at the tip; bark 0), w = condition mask (bark: 1 = dead wood / bare; leaves: hue jitter 0..1)
The runtime wind shader (dist/vegetation-assets.js) reads only these, so wind is identical in every LOD.
"""
import math
import numpy as np


class MeshBuf:
    """Accumulates triangles with UVs, colours and wind data; material index per triangle."""

    def __init__(self):
        self.P, self.UV, self.C, self.W, self.N = [], [], [], [], []
        self.F, self.M = [], []
        self.n = 0

    def add(self, P, UV, C, W, F, mat, N=None):
        P = np.asarray(P, np.float64)
        k = len(P)
        self.P.append(P)
        self.UV.append(np.asarray(UV, np.float64))
        self.C.append(np.broadcast_to(np.asarray(C, np.float64), (k, 3)).copy())
        self.W.append(np.broadcast_to(np.asarray(W, np.float64), (k, 4)).copy())
        self.N.append(None if N is None else np.asarray(N, np.float64))
        F = np.asarray(F, np.int64) + self.n
        self.F.append(F)
        self.M.append(np.full(len(F), mat, np.int32))
        self.n += k

    def arrays(self):
        if not self.P:
            return None
        N = None
        if any(n is not None for n in self.N):
            N = np.concatenate([n if n is not None else np.zeros((len(p), 3)) for n, p in zip(self.N, self.P)])
        return dict(P=np.concatenate(self.P), UV=np.concatenate(self.UV), C=np.concatenate(self.C), W=np.concatenate(self.W),
                    F=np.concatenate(self.F), M=np.concatenate(self.M), N=N)

    @property
    def tris(self):
        return sum(len(f) for f in self.F)


def hash01(*v):
    x = math.sin(sum((i + 1) * 12.9898 * a for i, a in enumerate(v)) + 78.233) * 43758.5453
    return x - math.floor(x)


def children_of(parent):
    ch = [[] for _ in range(len(parent))]
    for i, p in enumerate(parent):
        if p >= 0:
            ch[p].append(i)
    return ch


def chains(parent, weight, root):
    """Decompose a tree into chains: each continues into its heaviest child; the other children start new chains.
    Returns a list of (attach_node or -1, [nodes...])."""
    ch = children_of(parent)
    out = []
    stack = [(-1, root)]
    while stack:
        att, start = stack.pop()
        path = [start]
        i = start
        while ch[i]:
            kids = sorted(ch[i], key=lambda k: -weight[k])
            for k in kids[1:]:
                stack.append((i, k))
            i = kids[0]
            path.append(i)
        out.append((att, path))
    return out


def smooth_polyline(P, iters, lam=.5, fix_first=True, fix_last=False):
    P = P.copy()
    for _ in range(iters):
        if len(P) < 3:
            break
        Q = P.copy()
        Q[1:-1] = P[1:-1] + lam * ((P[:-2] + P[2:]) * .5 - P[1:-1])
        if not fix_last:
            Q[-1] = P[-1] + lam * .5 * (P[-2] - P[-1])
        if not fix_first:
            Q[0] = P[0] + lam * .5 * (P[1] - P[0])
        P = Q
    return P


def resample(P, R, step_fn, extra=None):
    """Resample a polyline by arc length; step chosen from the local radius. extra: (k, m) per-point data, interpolated."""
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    L = s[-1]
    if L < 1e-6:
        return P[:1], R[:1], (extra[:1] if extra is not None else None)
    ts = [0.0]
    while ts[-1] < L:
        r = np.interp(ts[-1], s, R)
        ts.append(min(L, ts[-1] + step_fn(r)))
    ts = np.array(ts)
    Pn = np.stack([np.interp(ts, s, P[:, k]) for k in range(3)], 1)
    Rn = np.interp(ts, s, R)
    En = None if extra is None else np.stack([np.interp(ts, s, extra[:, k]) for k in range(extra.shape[1])], 1)
    return Pn, Rn, En


def frames(P):
    """Parallel-transport frames along a polyline: tangents T, normals N, binormals B."""
    T = np.gradient(P, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-12
    up = np.array([0, 0, 1.0]) if abs(T[0, 2]) < .9 else np.array([1.0, 0, 0])
    N = np.zeros_like(P)
    n = np.cross(T[0], np.cross(up, T[0]))
    n = np.cross(up, T[0])
    n /= np.linalg.norm(n) + 1e-12
    N[0] = n
    for i in range(1, len(P)):
        v = np.cross(T[i - 1], T[i])
        s = np.linalg.norm(v)
        if s < 1e-9:
            N[i] = N[i - 1]
            continue
        a = math.atan2(s, float(np.dot(T[i - 1], T[i])))
        v /= s
        n = N[i - 1]
        N[i] = n * math.cos(a) + np.cross(v, n) * math.sin(a) + v * np.dot(v, n) * (1 - math.cos(a))
    B = np.cross(T, N)
    return T, N, B


def tube(buf, P, R, sides, mat, color, wind, tile=(1.0, 1.0), radial=None, v0=0.0, cap=True, start_open=True):
    """A generalized cylinder along P with radii R. color: (k,3) or (3,); wind: (k,4) or (4,) per ring.
    radial(i, theta) -> radius multiplier (bark lobes, burls). UV: u around (integer repeats so no seam), v along length."""
    k = len(P)
    if k < 2:
        return 0
    T, N, B = frames(P)
    th = np.linspace(0, 2 * np.pi, sides + 1)
    circ = 2 * np.pi * float(np.max(R))
    urep = max(1, int(round(circ / tile[0])))
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    v = v0 + np.concatenate([[0], np.cumsum(seg)]) / tile[1]
    verts, uvs = [], []
    for i in range(k):
        rr = R[i] * (np.array([radial(i, t) for t in th]) if radial else np.ones(sides + 1))
        ring = P[i][None] + rr[:, None] * (np.cos(th)[:, None] * N[i][None] + np.sin(th)[:, None] * B[i][None])
        verts.append(ring)
        uvs.append(np.stack([th / (2 * np.pi) * urep, np.full(sides + 1, v[i])], 1))
    V = np.concatenate(verts)
    UV = np.concatenate(uvs)
    F = []
    w = sides + 1
    for i in range(k - 1):
        a = i * w + np.arange(sides)
        b = a + 1
        c = a + w
        d = b + w
        F.append(np.stack([a, c, b], 1))
        F.append(np.stack([b, c, d], 1))
    F = np.concatenate(F)
    col = np.asarray(color, np.float64)
    col = np.repeat(col, w, axis=0) if col.ndim == 2 else col
    wd = np.asarray(wind, np.float64)
    wd = np.repeat(wd, w, axis=0) if wd.ndim == 2 else wd
    if cap and R[-1] > .004:
        # a small pointed cap (branch ends are never open tubes)
        tip = P[-1] + T[-1] * R[-1] * .8
        base = (k - 1) * w
        V = np.concatenate([V, tip[None]])
        UV = np.concatenate([UV, [[urep * .5, v[-1] + R[-1] / tile[1]]]])
        ti = len(V) - 1
        F = np.concatenate([F, np.stack([base + np.arange(sides), np.full(sides, ti), base + np.arange(sides) + 1], 1)])
        col = np.concatenate([col, col[-1:]]) if col.ndim == 2 else col
        wd = np.concatenate([wd, wd[-1:]]) if wd.ndim == 2 else wd
    buf.add(V, UV, col, wd, F, mat)
    return len(F)


def card(buf, base, up, side, length, width, cell, mat, color, wind, normal=None, fold=0.0, atlas=(2, 2), bend=0.0):
    """One leaf card: stem at `base`, extending `length` along `up`; `side` is the card's width axis.
    fold > 0 bends the two halves (4 triangles) so the card keeps volume edge-on. cell: atlas cell index.
    bend: the tip droops along -normal (metres)."""
    cx, cy = cell % atlas[0], cell // atlas[0]
    u0, u1 = cx / atlas[0], (cx + 1) / atlas[0]
    v0, v1 = 1 - (cy + 1) / atlas[1], 1 - cy / atlas[1]
    up = up / (np.linalg.norm(up) + 1e-12)
    side = side / (np.linalg.norm(side) + 1e-12)
    nrm = np.cross(side, up)
    hw = width * .5
    tipdrop = nrm * bend
    if fold > 0:
        f = nrm * (hw * math.sin(fold))
        sw = side * hw * math.cos(fold)
        V = np.array([base - sw + f, base, base + sw + f,
                      base - sw + f + up * length + tipdrop, base + up * length + tipdrop, base + sw + f + up * length + tipdrop])
        UV = np.array([[u0, v0], [(u0 + u1) * .5, v0], [u1, v0], [u0, v1], [(u0 + u1) * .5, v1], [u1, v1]])
        F = np.array([[0, 1, 4], [0, 4, 3], [1, 2, 5], [1, 5, 4]])
        flut = np.array([0, 0, 0, 1, 1, 1.0])
    else:
        V = np.array([base - side * hw, base + side * hw, base + side * hw + up * length + tipdrop, base - side * hw + up * length + tipdrop])
        UV = np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]])
        F = np.array([[0, 1, 2], [0, 2, 3]])
        flut = np.array([0, 0, 1, 1.0])
    k = len(V)
    W = np.tile(np.asarray(wind, np.float64), (k, 1))
    W[:, 2] = flut
    N = None if normal is None else np.tile(normal / (np.linalg.norm(normal) + 1e-12), (k, 1))
    buf.add(V, UV, color, W, F, mat, N)


def poisson_pick(points, weights, spacing, rng, max_n=None):
    """Greedy Poisson-disk selection: heavier points first (with jitter), none closer than `spacing`."""
    from scipy.spatial import cKDTree
    order = np.argsort(-(weights * rng.uniform(.6, 1.4, len(weights))))
    tree = cKDTree(points)
    taken = np.zeros(len(points), bool)
    blocked = np.zeros(len(points), bool)
    out = []
    for i in order:
        if blocked[i]:
            continue
        out.append(i)
        taken[i] = True
        for j in tree.query_ball_point(points[i], spacing):
            blocked[j] = True
        if max_n and len(out) >= max_n:
            break
    return np.array(out, int)


class DensityAO:
    """Canopy occlusion from a foliage density grid: AO(p) = mean over upper-hemisphere rays of exp(-sigma * integral)."""

    def __init__(self, pts, w, cell=.5, sigma=.9, pad=3.0):
        from scipy import ndimage
        lo = pts.min(0) - pad
        hi = pts.max(0) + pad
        self.lo, self.cell = lo, cell
        shape = np.ceil((hi - lo) / cell).astype(int) + 1
        g = np.zeros(shape)
        idx = np.floor((pts - lo) / cell).astype(int)
        np.add.at(g, tuple(idx.T), w)
        g = ndimage.gaussian_filter(g, 1.0)
        self.g = g / (np.percentile(g[g > 0], 90) + 1e-9)
        self.sigma = sigma
        dirs = [(0, 0, 1)]
        for k in range(8):
            a = k / 8 * 2 * np.pi
            dirs.append((math.cos(a) * .7, math.sin(a) * .7, .7))
        for k in range(6):
            a = (k + .5) / 6 * 2 * np.pi
            dirs.append((math.cos(a) * .95, math.sin(a) * .95, .3))
        self.dirs = np.array(dirs) / np.linalg.norm(dirs, axis=1, keepdims=True)

    def __call__(self, P, length=9.0, step=.5):
        from scipy import ndimage
        acc = np.zeros(len(P))
        for d in self.dirs:
            tot = np.zeros(len(P))
            for t in np.arange(step, length, step):
                q = (P + d * t - self.lo) / self.cell
                tot += ndimage.map_coordinates(self.g, q.T, order=1, mode='constant') * step
            acc += np.exp(-self.sigma * tot)
        return acc / len(self.dirs)
