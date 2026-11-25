"""Jamie's mother (chr.jamie-mother): the head, as original procedural geometry.

The head is an implicit surface (smooth unions and subtractions of anatomical volumes: cranium, midface, cheekbones,
jaw, chin, brow, nose, lips, the lids over each eyeball) sampled on a radial quad grid from a point inside the head.
The grid is warped so the face gets most of the vertices. Each grid vertex is pushed out along its ray to the surface
(bisection), so the topology is a clean quad grid with UVs (longitude, latitude) for free. Afterwards:
  * the eye openings are cut as almond-shaped holes, their rims snapped onto the lid margin curve, and the margin is
    turned in toward the eyeball (lid thickness);
  * the mouth line is cut as a thin slit whose rim curls into a small mouth cavity;
  * the neck continues below the grid as horizontal rings down into the shirt.
Units: metres. Head space: x to the character's left, y back (the face looks toward -y), z up; origin at the ear
canals (tragion). Pure numpy: no Blender needed to build the arrays (build_jamie_mother.py turns them into a mesh).
"""
import math
import numpy as np

# ---------------------------------------------------------------------------------------------- implicit helpers
def ell(p, c, r):
    """approximate signed distance to an ellipsoid (centre c, radii r); exact on the surface's zero set"""
    q = (p - c) / r
    k0 = np.linalg.norm(q, axis=-1)
    k1 = np.linalg.norm((p - c) / (np.asarray(r) ** 2), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-12)


def cone(p, a, b, ra, rb):
    """a capsule whose radius runs from ra at a to rb at b (approximate)"""
    a, b = np.asarray(a, float), np.asarray(b, float)
    pa, ba = p - a, b - a
    h = np.clip((pa @ ba) / (ba @ ba), 0, 1)[..., None]
    return np.linalg.norm(pa - ba * h, axis=-1) - (ra + (rb - ra) * h[..., 0])


def smin(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def bump(p, c, r):
    """a smooth 0..1 bump around c with radii r (ellipsoidal falloff)"""
    q = np.linalg.norm((p - c) / r, axis=-1)
    return np.where(q < 1, (1 - q * q) ** 2, 0.0)


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------------------------------------- the design
# Landmarks (head space, metres; tragion = origin). Adult woman, late thirties (PROVISIONAL, A-22): vertex z +0.125,
# menton z -0.095 (head height 0.220), breadth 0.141, length 0.180, bizygomatic 0.127, bigonial 0.094, interpupillary 0.061.
D = dict(
    eye=np.array([0.0305, -0.0726, 0.0250]), eye_r=0.0119,      # eyeball centre (left eye; mirrored) and radius
    lid_r=0.0132,                                               # lid skin 1.3 mm proud of the eyeball (lid thickness)
    mouth_w=0.0245, stomion=np.array([0.0, -0.0990, -0.0402]),
)


class Head:
    """the implicit face; params tweak the identity (all distances in metres)"""

    def __init__(self, **kw):
        self.k = dict(
            cheek=1.0,        # cheek fullness (family resemblance: Jamie's round cheeks)
            jaw=1.0,          # jaw width
            nose_len=1.0, nose_proj=1.0, nose_w=1.0,
            lip_full=1.0, brow=1.0, chin=1.0,
            age=1.0,          # depth of the expression lines (late thirties)
            asym=1.0,         # natural asymmetry
        )
        self.k.update(kw)

    def field(self, p, neck=True):
        k = self.k
        x, y, z = p[..., 0], p[..., 1], p[..., 2]
        ax = np.abs(x)
        # natural asymmetry: the left side of the face very slightly fuller and higher (a few tenths of a millimetre)
        sgn = np.sign(x + 1e-12)
        pm = p.copy()
        pm[..., 0] = ax
        pm[..., 2] = z - .0004 * k['asym'] * sgn
        # cranium, with the occiput behind and the forehead in front
        f = ell(p, np.array([0, .006, .040]), np.array([.0700, .0860, .0860]))
        f = smin(f, ell(p, np.array([0, .030, .022]), np.array([.0640, .0620, .0640])), .025)
        f = smin(f, ell(p, np.array([0, -.050, .056]), np.array([.0560, .0420, .0420])), .020)        # forehead
        # midface: the maxilla, under the nose, out to the cheekbones
        f = smin(f, ell(p, np.array([0, -.036, -.010]), np.array([.0590, .0570, .0480])), .018)
        cw = k['cheek']
        f = smin(f, ell(pm, np.array([.0420, -.0560, .0040]), np.array([.0170, .0185, .0130])), .022)   # zygoma, soft
        f = smin(f, ell(pm, np.array([.0320, -.0680, -.0150]), np.array([.0240 * cw, .0170 * cw, .0240])), .018)  # cheek pads
        f = smin(f, ell(pm, np.array([.0335, -.0490, -.0320]), np.array([.0140, .0230, .0190])), .020)  # buccal fill
        f = smin(f, ell(pm, np.array([.0530, -.0380, .0380]), np.array([.0110, .0220, .0190])), .016)  # temples
        # lower face: narrows to a soft jaw; the mandible's border from gonion to the chin
        jw = k['jaw']
        f = smin(f, ell(p, np.array([0, -.040, -.046]), np.array([.0465 * jw, .0520, .0370])), .016)
        go = np.array([.0390 * jw, -.012, -.0525])
        f = smin(f, cone(pm, go + [.004, .012, .030], go, .0100, .0092), .016)                     # ramus
        f = smin(f, cone(pm, go, np.array([.0145, -.0785, -.0760]), .0098, .0092), .016)           # body
        f = smin(f, ell(p, np.array([0, -.0852, -.0712]), np.array([.0180, .0148 * k['chin'], .0158])), .011)  # chin
        # the soft volume over the teeth, and the lips
        f = smin(f, ell(p, np.array([0, -.0745, -.0405]), np.array([.0260, .0240, .0235])), .012)
        lf = k['lip_full']
        # upper lip: two lobes tapering to the corners (the cupid's bow between them) and the central tubercle
        f = smin(f, cone(pm, np.array([.0040, -.0982, -.0352]), np.array([.0242, -.0868, -.0404]), .0053 * lf, .0017), .0034)
        f = smin(f, ell(p, np.array([0, -.1000, -.0358]), np.array([.0060, .0048 * lf, .0045])), .0030)
        # lower lip: fuller, two soft lobes
        f = smin(f, cone(pm, np.array([.0042, -.0962, -.0466]), np.array([.0228, -.0868, -.0414]), .0064 * lf, .0019), .0036)
        # brow: a soft ridge (female), glabella
        b = k['brow']
        f = smin(f, cone(pm, np.array([.008, -.0880, .0425]), np.array([.042, -.0765, .0440]), .0050 * b, .0042 * b), .012)
        # nose: bridge from nasion to tip, the lobule, alae and columella
        nl, npj, nw = k['nose_len'], k['nose_proj'], k['nose_w']
        nas = np.array([0, -.0890, .0300])
        tip = np.array([0, -.0890 - .0225 * npj, .0300 - .0415 * nl])
        f = smin(f, cone(p, nas, tip + [0, .0045, .0055], .0064, .0070), .009)
        f = smin(f, ell(p, tip, np.array([.0080 * nw, .0078, .0078])), .0055)
        al = np.array([.0106 * nw, -.0962, tip[2] - .0012])
        f = smin(f, ell(pm, al, np.array([.0058, .0070, .0056])), .0040)
        f = smin(f, cone(p, tip + [0, .0030, -.0040], np.array([0, -.1005, tip[2] - .0078]), .0034, .0036), .0035)
        # orbits: hollow in front of the eyeball, then the lids laid over it (the crease forms where they meet)
        e, er = D['eye'], D['lid_r']
        f = smax(f, -ell(pm, e + [.0005, -.0105, .0012], np.array([.0170, .0115, .0126])), .005)
        f = smin(f, np.linalg.norm(pm - e, axis=-1) - er, .0020)
        # neck: a slightly forward-leaning column
        if neck:
            nk = cone(p, np.array([0, .014, -.030]), np.array([0, .006, -.200]), .0470, .0505)
            f = smin(f, nk, .020)
        # ---- fine surface detail (added to the field: + pushes the surface in, - out) ----------------------
        a = k['age']
        # tear trough and the lid-cheek junction: a faint hollow under each eye
        f = f + .0006 * a * bump(pm, e + [-.003, -.0085, -.0150], np.array([.0130, .0100, .0040]))
        # nasolabial fold: from above the ala down past the mouth corner, soft (late thirties)
        t = np.clip((al[2] + .002 - z) / .034, 0, 1)
        cx = al[0] + .0075 + .0090 * t
        cy = -.0925 + .0085 * t
        dd = np.sqrt((ax - cx) ** 2 + .6 * (y - cy) ** 2)
        f = f + .0009 * a * np.exp(-(dd / .0026) ** 2) * sstep(-.002, .004, al[2] + .002 - z) * sstep(-.062, -.050, z)
        # alar crease: the groove around each nostril wing
        da = np.sqrt(((ax - al[0]) / 1.0) ** 2 + ((y - al[1]) / 1.15) ** 2 + ((z - al[2]) / .9) ** 2)
        f = f + .00055 * np.exp(-((da - .0072) / .0011) ** 2) * sstep(-.004, .002, al[1] + .004 - y)
        # philtrum: two soft ridges, a shallow groove between them
        ph = sstep(-.0300, -.0283, z) * (1 - sstep(tip[2] - .0095, tip[2] - .0075, z))
        f = f + ph * (.00045 * np.exp(-(x / .0024) ** 2) - .00040 * np.exp(-((ax - .0046) / .0017) ** 2))
        # the vermilion border: a fine ridge where lip meets skin
        f = f - .00030 * np.exp(-((z + .0287) / .0010) ** 2) * sstep(-.024, -.014, -ax)
        # chin: the mentolabial sulcus
        f = f + .0010 * np.exp(-((z + .0565) / .0032) ** 2) * sstep(-.020, -.008, -ax) * sstep(.080, .090, -y)
        # fine relief: crow's feet and faint forehead lines (age)
        f = f + .00010 * a * np.sin((z - .025) * 900) * bump(pm, np.array([.050, -.056, .023]), np.array([.006, .012, .010]))
        f = f + .00008 * a * np.sin(z * 520) * bump(p, np.array([0, -.088, .072]), np.array([.035, .02, .015]))
        return f


# ---------------------------------------------------------------------------------------------- the grid
def warp_lon(u):
    """u in [-1, 1) (0 = straight ahead) -> longitude in radians; samples bunch toward the face"""
    return math.pi * np.sign(u) * (np.abs(u) ** 1.55)


def remap(n, lo, hi, bands):
    """n samples from lo to hi; bands [(a, b, density)] concentrate samples where density is high"""
    xs = np.linspace(lo, hi, 4001)
    dens = np.ones_like(xs)
    for a, b, k in bands:
        dens += (k - 1) * sstep(a - .12, a + .06, xs) * (1 - sstep(b - .06, b + .12, xs))
    cdf = np.concatenate([[0], np.cumsum((dens[1:] + dens[:-1]) / 2 * np.diff(xs))])
    cdf /= cdf[-1]
    return np.interp(np.linspace(0, 1, n), cdf, xs)


def build(head=None, NU=104, NV=114, centre=(0, -.006, .018), lat_lo=-1.10, lat_hi=math.pi / 2):
    """the head grid: returns dict(P (NV, NU, 3) surface points, lon, lat, C, NU, NV, head)"""
    H = head or Head()
    C = np.asarray(centre, float)
    lon = remap(NU + 1, -math.pi, math.pi, [(-1.0, 1.0, 2.4), (-.55, .55, 1.6)])[:-1]       # 0 = the face (-y); + toward +x
    lat = remap(NV, lat_lo, lat_hi, [(-.95, .38, 2.2), (-.64, -.30, 2.6), (-.02, .20, 2.0)])
    LO, LA = np.meshgrid(lon, lat)
    d = np.stack([np.sin(LO) * np.cos(LA), -np.cos(LO) * np.cos(LA), np.sin(LA)], -1)
    d[-1, :] = [0, 0, 1]
    # march in from outside to the outermost crossing (what is seen), then bisect within the step
    steps = np.linspace(.30, .02, 281)
    hit = np.full(d.shape[:2], np.nan)
    prev_out = np.ones(d.shape[:2], bool)
    for i, t in enumerate(steps):
        inside = H.field(C + d * t) < 0
        new = np.isnan(hit) & inside
        hit[new] = t
    lo_t = hit.copy()
    hi_t = hit + (steps[0] - steps[1])
    for _ in range(26):
        mid = (lo_t + hi_t) / 2
        inside = H.field(C + d * mid[..., None]) < 0
        lo_t = np.where(inside, mid, lo_t)
        hi_t = np.where(inside, hi_t, mid)
    P = C + d * ((lo_t + hi_t) / 2)[..., None]
    return dict(P=P, lon=LO, lat=LA, C=C, NU=NU, NV=NV, head=H)


# ---------------------------------------------------------------------------------------------- openings
def almond(t, m, l, up, peak):
    """the lid margin from the medial canthus m (t=0) to the lateral canthus l (t=1); up>0 upper lid, <0 lower lid"""
    t = np.asarray(t, float)
    w = t ** (math.log(.5) / math.log(peak))
    x = m[0] + (l[0] - m[0]) * t
    z = m[1] + (l[1] - m[1]) * t + up * np.sin(math.pi * w) ** .85
    return np.stack([x, z], -1)


EYE_OPEN = dict(m=(.0170, .0236), l=(.0442, .0259), up=.0047, upeak=.44, lo=-.0045, lpeak=.60)
MOUTH_OPEN = dict(w=.0236, z=-.0405, h=.00045)


def eye_curve(n=64, E=EYE_OPEN):
    """closed opening polygon in the frontal (x, z) plane (left eye): upper margin m->l, lower margin l->m"""
    t = np.linspace(0, 1, n // 2 + 1)
    u = almond(t, E['m'], E['l'], E['up'], E['upeak'])
    lo = almond(t[::-1], E['m'], E['l'], E['lo'], E['lpeak'])
    return np.concatenate([u[:-1], lo[:-1]])


def mouth_curve(n=48, M=MOUTH_OPEN):
    t = np.linspace(-1, 1, n // 2 + 1)
    up = np.stack([t * M['w'], M['z'] + M['h'] * (1 - t * t)], -1)
    lo = np.stack([t[::-1] * M['w'], M['z'] - M['h'] * (1 - t[::-1] ** 2)], -1)
    return np.concatenate([up[:-1], lo[:-1]])


def inside_poly(pts, poly):
    """even-odd test for 2D points (N,2) against a closed polygon (M,2)"""
    x, y = pts[:, 0], pts[:, 1]
    res = np.zeros(len(pts), bool)
    px, py = poly[:, 0], poly[:, 1]
    qx, qy = np.roll(px, -1), np.roll(py, -1)
    for a, b, c, d in zip(px, py, qx, qy):
        cond = ((b > y) != (d > y)) & (x < (c - a) * (y - b) / ((d - b) + 1e-15) + a)
        res ^= cond
    return res


def project_dirs(H, C, dirs):
    """surface points along unit directions (outermost crossing)"""
    steps = np.linspace(.30, .02, 281)
    hit = np.full(dirs.shape[:-1], np.nan)
    for t in steps:
        inside = H.field(C + dirs * t) < 0
        hit[np.isnan(hit) & inside] = t
    lo_t, hi_t = hit.copy(), hit + (steps[0] - steps[1])
    for _ in range(26):
        mid = (lo_t + hi_t) / 2
        inside = H.field(C + dirs * mid[..., None]) < 0
        lo_t = np.where(inside, mid, lo_t)
        hi_t = np.where(inside, hi_t, mid)
    return C + dirs * ((lo_t + hi_t) / 2)[..., None]


def assemble(g, eye_rings=((.0123, .0), (.0112, .0012)), mouth_depth=(.0016, .0045)):
    """cut the eye and mouth openings into the grid; returns a mesh dict with every face as a quad (or tri) of vertex
    indices, per-corner UVs, vertex groups of interest (rims) and the opening loops"""
    P, NU, NV, H, C = g['P'], g['NU'], g['NV'], g['head'], g['C']
    V = P.reshape(-1, 3).copy()
    idx = lambda j, i: j * NU + (i % NU)
    faces, fuv = [], []
    for j in range(NV - 1):
        for i in range(NU):
            faces.append([idx(j, i), idx(j, i + 1), idx(j + 1, i + 1), idx(j + 1, i)])
            fuv.append([(i / NU, j / (NV - 1)), ((i + 1) / NU, j / (NV - 1)), ((i + 1) / NU, (j + 1) / (NV - 1)), (i / NU, (j + 1) / (NV - 1))])
    faces = np.array(faces)
    front = V[:, 1] < -.04
    cent = V[faces].mean(1)
    loops = {}
    keep = np.ones(len(faces), bool)
    cuts = []
    for name, poly, side in (('eye_l', eye_curve(), 1), ('eye_r', eye_curve() * [-1, 1], -1)):
        sel = (cent[:, 1] < -.05) & inside_poly(cent[:, [0, 2]], poly) & (np.abs(cent[:, 2] - .025) < .012)
        keep &= ~sel
        cuts.append((name, poly, sel))
    # boundary loops of each cut, ordered, then snapped onto the opening curve (by normalized angle)
    from collections import defaultdict
    for name, poly, sel in cuts:
        edges = defaultdict(int)
        for f in faces[sel]:
            for a, b in zip(f, np.roll(f, -1)):
                edges[(min(a, b), max(a, b))] += 1
        bnd = [e for e, c in edges.items() if c == 1]
        nb = defaultdict(list)
        for a, b in bnd:
            nb[a].append(b)
            nb[b].append(a)
        start = bnd[0][0]
        loop = [start]
        prev = None
        cur = start
        while True:
            nx = [q for q in nb[cur] if q != prev]
            if not nx:
                break
            prev, cur = cur, nx[0]
            if cur == start:
                break
            loop.append(cur)
        loop = np.array(loop)
        c2 = poly.mean(0)
        half = (poly.max(0) - poly.min(0)) / 2
        ang = lambda q: np.arctan2((q[:, 1] - c2[1]) / half[1], (q[:, 0] - c2[0]) / half[0])
        a_loop = ang(V[loop][:, [0, 2]])
        # dense curve for lookup
        dense = np.concatenate([poly, poly[:1]])
        tt = np.linspace(0, 1, len(dense))
        fine = np.stack([np.interp(np.linspace(0, 1, 2000), tt, dense[:, 0]), np.interp(np.linspace(0, 1, 2000), tt, dense[:, 1])], -1)
        a_fine = ang(fine)
        order = np.argsort(a_fine)
        target = np.stack([np.interp(a_loop, a_fine[order], fine[order][:, 0], period=2 * math.pi),
                           np.interp(a_loop, a_fine[order], fine[order][:, 1], period=2 * math.pi)], -1)
        # move each rim vertex along the surface to its target (x, z): pick the direction through (x, z) at the vertex's
        # current depth, then project back onto the surface
        q = np.stack([target[:, 0], V[loop][:, 1], target[:, 1]], -1)
        dq = q - C
        dq /= np.linalg.norm(dq, axis=1, keepdims=True)
        V[loop] = project_dirs(H, C, dq)
        loops[name] = loop
    # the mouth: split the grid row nearest the stomion between the corners (upper lip faces keep the row, lower lip
    # faces get a copy), snap the row onto the lip line, and keep the two edges as the mouth's rim
    W = MOUTH_OPEN['w']
    i0 = int(np.argmin(np.abs(g['lon'][0])))
    jrow = int(np.argmin(np.abs(P[:, i0, 2] - MOUTH_OPEN['z']) + (P[:, i0, 1] > -.09) * 1))
    cols = [i for i in range(NU) if abs(P[jrow, i, 0]) < W and P[jrow, i, 1] < -.07]
    cols = sorted(cols, key=lambda i: P[jrow, i, 0])
    inner = cols[1:-1]                                            # the two end vertices are the shared corners
    for i in cols:
        x_ = P[jrow, i, 0]
        t_ = min(1., abs(x_) / W)
        V[idx(jrow, i), 2] = MOUTH_OPEN['z'] - .0008 * t_ ** 2
    dq = V[[idx(jrow, i) for i in cols]] - C
    V[[idx(jrow, i) for i in cols]] = to_surface(H, V[[idx(jrow, i) for i in cols]])
    dup = {}
    Vl = list(V)
    for i in inner:
        dup[idx(jrow, i)] = len(Vl)
        Vl.append(V[idx(jrow, i)].copy())
    V = np.array(Vl)
    for fi, f in enumerate(faces):
        if not keep[fi]:
            continue
        # faces between rows jrow-1 and jrow (below the line: the lower lip) take the copies
        rows = [v // NU if v < NU * NV else -1 for v in f]
        if min(rows) == jrow - 1 and max(rows) == jrow:
            faces[fi] = [dup.get(v, v) for v in f]
    upper = [idx(jrow, i) for i in cols]
    lower = [idx(jrow, cols[0])] + [dup[idx(jrow, i)] for i in inner] + [idx(jrow, cols[-1])]
    loops['mouth'] = np.array(upper + lower[::-1][1:-1])
    faces_kept = faces[keep]
    uv_kept = [fuv[i] for i in np.nonzero(keep)[0]]
    # relax the vertices near the rims (two rings) in direction space, rims fixed, then re-project
    used = np.unique(faces_kept)
    rim = np.concatenate(list(loops.values()))
    adj = defaultdict(set)
    for f in faces_kept:
        for a, b in zip(f, np.roll(f, -1)):
            adj[a].add(b)
            adj[b].add(a)
    ring1 = set()
    for r in rim:
        ring1 |= adj[r]
    ring1 -= set(rim.tolist())
    ring2 = set()
    for r in ring1:
        ring2 |= adj[r]
    ring2 -= set(rim.tolist())
    movable = np.array(sorted(ring1 | ring2))
    for it in range(6):
        newp = np.array([np.mean(V[list(adj[v])], 0) for v in movable])
        V[movable] = V[movable] * .5 + newp * .5
    dq = V[movable] - C
    dq /= np.linalg.norm(dq, axis=1, keepdims=True)
    V[movable] = project_dirs(H, C, dq)
    # lid margins and the mouth's inner lips: new rings extruded from each rim
    V = list(map(tuple, V))
    F = [list(f) for f in faces_kept]
    UV = [list(u) for u in uv_kept]
    extra = {}
    e = D['eye']
    for name in ('eye_l', 'eye_r'):
        loop = loops[name]
        ce = e * [1 if name == 'eye_l' else -1, 1, 1]
        prev = loop
        rings = [loop]
        for (r, back) in eye_rings:
            nxt = []
            for v in prev:
                p = np.array(V[v])
                d = p - ce
                q = ce + d / np.linalg.norm(d) * r
                nxt.append(len(V))
                V.append(tuple(q))
            nxt = np.array(nxt)
            rings.append(nxt)
            prev = nxt
        for a, b in zip(rings[:-1], rings[1:]):
            n = len(a)
            for i in range(n):
                F.append([a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]])
                UV.append([(.985, .985), (.99, .985), (.99, .99), (.985, .99)])   # the lid margin patch of the atlas
        extra[name] = rings
    # mouth: the inner lips (rings going back from the rim, parting a little) and a closed cavity behind them
    loop = loops['mouth']
    rings = [loop]
    prev = loop
    zc = MOUTH_OPEN['z']
    n_up = len(cols)
    for k_, (dep, spread, narrow) in enumerate(((.0018, .0010, 1.), (.0045, .0030, .97), (.0110, .0075, .88), (.0200, .0085, .75), (.0270, .0050, .45))):
        nxt = []
        for q_, v in enumerate(prev):
            p = np.array(V[v])
            s_ = 1 if q_ < n_up else -1
            if q_ == 0 or q_ == n_up - 1:
                s_ = 0
            x0 = np.array(V[loop[q_]])
            q = np.array([x0[0] * narrow, x0[1] + dep, zc + s_ * spread - .0006 * (k_ > 1)])
            nxt.append(len(V))
            V.append(tuple(q))
        nxt = np.array(nxt)
        rings.append(nxt)
        prev = nxt
    for a, b in zip(rings[:-1], rings[1:]):
        n = len(a)
        for i in range(n):
            F.append([a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]])
            UV.append([(.975, .985), (.98, .985), (.98, .99), (.975, .99)])      # the mouth-interior patch
    # close the cavity
    last = rings[-1]
    cc = len(V)
    V.append(tuple(np.mean([V[v] for v in last], 0)))
    n = len(last)
    for i in range(n):
        F.append([last[i], last[(i + 1) % n], cc])
        UV.append([(.975, .985), (.98, .985), (.98, .99)])
    extra['mouth'] = rings
    return dict(V=np.array(V), F=F, UV=UV, loops=loops, rings=extra, NU=NU, NV=NV)


def loops_x(x):
    return x


# ---------------------------------------------------------------------------------------------- relaxation
def grad(H, p, h=.00015):
    ex, ey, ez = np.eye(3) * h
    return np.stack([(H.field(p + ex) - H.field(p - ex)), (H.field(p + ey) - H.field(p - ey)), (H.field(p + ez) - H.field(p - ez))], -1) / (2 * h)


def to_surface(H, p, steps=4):
    for _ in range(steps):
        f = H.field(p)
        gr = grad(H, p)
        p = p - (f / np.maximum((gr * gr).sum(-1), 1e-9))[..., None] * gr
    return p


def relax(g, iters=14, k=.5):
    """even out the grid on the true surface: umbrella steps (tangential only) and projection along the gradient;
    the pole row and the bottom (neck) row stay where they are"""
    P, H = g['P'].copy(), g['head']
    for it in range(iters):
        nb = (np.roll(P, 1, 1) + np.roll(P, -1, 1))
        up = np.concatenate([P[1:], P[-1:]], 0)
        dn = np.concatenate([P[:1], P[:-1]], 0)
        avg = (nb + up + dn) / 4
        gr = grad(H, P)
        n = gr / np.maximum(np.linalg.norm(gr, axis=-1, keepdims=True), 1e-9)
        dlt = avg - P
        dlt -= (dlt * n).sum(-1, keepdims=True) * n          # tangential part only
        Q = P + k * dlt
        Q[0], Q[-1] = P[0], P[-1]
        Q[-2] = P[-2]
        P = to_surface(H, Q)
        P[0], P[-1] = g['P'][0], g['P'][-1]
    g = dict(g)
    g['P'] = P
    return g


# ---------------------------------------------------------------------------------------------- ears
def ear(H, side=1, n_ang=28, rings=(0., .22, .45, .62, .76, .86, .93, 1.0, 1.04, 1.02, .90, .70)):
    """a procedural outer ear (head space): concentric rings from the concha's floor out over the antihelix to the
    helix rim, then rolling back under the rim and in toward the head (its back, which meets the skull).
    Height profile (lateral, from the ear's root plane): concha deep, the antihelix a ridge, the helix a rolled rim,
    the lobe soft and thicker at the bottom. The tragus is a small bump at the front."""
    c = np.array([.0700 * side, .0110, .0030])                     # the concha's centre, at the ear canal
    tilt = math.radians(14)                                         # the ear leans back
    W, Hh = .0160, .0290                                            # half width (front-back), half height
    out = np.array([side * 1., 0, 0])
    V, F, UV = [], [], []
    th = np.linspace(0, 2 * math.pi, n_ang, endpoint=False)
    for k, r in enumerate(rings):
        back = k >= 8
        for a in th:
            ca, sa = math.cos(a), math.sin(a)
            # the outline: an oval, narrower at the bottom (the lobe), the front edge straighter
            rx = W * (1 + .12 * sa) * (.85 if ca < 0 else 1.0)
            rz = Hh * (1.05 if sa > 0 else .95)
            u = rx * ca * r                                         # along -y is front (ca < 0 toward the face)
            v = rz * sa * r
            if not back:
                h = .0040 + .0060 * (r ** 1.6) - .0035 * math.exp(-((r - .62) / .12) ** 2) * (sa > -.45) * -1 \
                    + .0030 * math.exp(-((r - .93) / .06) ** 2)
                h -= .0045 * math.exp(-(r / .35) ** 2)            # the concha's bowl
                h += .0020 * math.exp(-((r - .55) / .10) ** 2) * (1 if sa > -.3 else .3)   # antihelix
                if sa < -.55:
                    h += .0018 * (r > .3)                           # the lobe is fuller
                if ca < -.55 and abs(sa) < .45 and r < .5:
                    h += .0035 * math.exp(-((r - .35) / .12) ** 2)  # tragus
            else:
                h = .0095 - (r < 1.0) * (1.02 - r) * .045 - (k - 8) * .0025
            y = c[1] + u * math.cos(tilt) + v * math.sin(tilt)
            z = c[2] - u * math.sin(tilt) + v * math.cos(tilt)
            # lateral: from the root plane (the head's side) outward, the ear standing off ~20 degrees at its back
            x = c[0] + side * (.8 * h + max(0, u) * .22 + (.0 if not back else -.002 * (k - 8)))
            V.append([x, y, z])
            UV.append(None)
    n = n_ang
    for k in range(len(rings) - 1):
        for i in range(n):
            j = (i + 1) % n
            a, b, cc, d = k * n + i, k * n + j, (k + 1) * n + j, (k + 1) * n + i
            F.append([a, b, cc, d] if side > 0 else [d, cc, b, a])
    # close the concha's centre
    ci = len(V)
    V.append(list(c + out * .0005))
    for i in range(n):
        j = (i + 1) % n
        F.append([j, i, ci] if side > 0 else [i, j, ci])
    return dict(V=np.array(V), F=F, part='skin.ear')
