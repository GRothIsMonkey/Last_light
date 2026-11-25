"""Jamie's mother (chr.jamie-mother): natural brown hair pulled back into a practical ponytail. Original geometry.

Three layers, all cheap at runtime (no strands):
  * the shell: the scalp above the hairline lifted 0-10 mm (thin at the hairline, fuller over the crown and where the
    hair is gathered), its UVs laid along the direction the hair is combed (from the hairline to the elastic), so the
    strand texture flows to the ponytail;
  * clumps: ribbons that follow the shell from points along the hairline to the elastic, 1-2 mm above it, alpha-cut at
    their edges: they break the shell into the locks a combed-back ponytail really has, and soften the hairline;
  * the ponytail: an elastic, a tapered core and ribbons around it that fan a little and fall down the back of the neck.
Head space (chr_head): metres, x left, y back, z up, origin at the ear canals.
"""
import math
import numpy as np
import chr_head as CH

HC = np.array([0, .010, .030])              # centre for the hairline's angles
ANCHOR = np.array([0, .082, .046])          # the elastic: mid-height at the back of the head


def _periodic(keys, a):
    """smooth periodic interpolation of [(angle, value)] (angles in radians, -pi..pi)"""
    ks = sorted(keys)
    xs = np.array([k[0] for k in ks] + [ks[0][0] + 2 * math.pi])
    ys = np.array([k[1] for k in ks] + [ks[0][1]])
    a = (np.asarray(a) - xs[0]) % (2 * math.pi) + xs[0]
    i = np.clip(np.searchsorted(xs, a) - 1, 0, len(xs) - 2)
    t = (a - xs[i]) / (xs[i + 1] - xs[i])
    t = t * t * (3 - 2 * t)
    return ys[i] * (1 - t) + ys[i + 1] * t


# hairline: elevation (radians above HC's horizontal) by azimuth (0 = straight ahead, + to the character's left)
HAIRLINE = [(0., .555), (.30, .525), (.62, .375), (.95, .265), (1.25, .08), (1.45, -.02), (1.62, .20), (1.85, .12),
            (2.25, -.30), (2.65, -.66), (math.pi, -.80)]


def hairline_elev(az):
    return _periodic(HAIRLINE + [(-a, e) for a, e in HAIRLINE if 0 < a < math.pi], az)


def az_el(p):
    d = p - HC
    az = np.arctan2(d[..., 0], -d[..., 1])
    el = np.arctan2(d[..., 2], np.hypot(d[..., 0], d[..., 1]))
    return az, el


def hair_mask(p, soft=.035):
    """0 below the hairline, 1 well inside the hair (radians of elevation)"""
    az, el = az_el(p)
    return CH.sstep(0, soft, el - hairline_elev(az))


def surface_normal(H, p):
    g = CH.grad(H, p)
    return g / np.maximum(np.linalg.norm(g, axis=-1, keepdims=True), 1e-9)


SHELL = dict(base=.0072, bulge=.0050, edge=.0052, flat_ears=.25)   # the mother's pulled-back hair; the kid's is cropped


def shell(head_mesh, H, NU, NV):
    """the hair shell from the head grid (the first NU*NV vertices of the head mesh are the grid, row-major)"""
    G = head_mesh['V'][:NU * NV].reshape(NV, NU, 3)
    mask = hair_mask(G, soft=.06)
    az0, el0 = az_el(G)
    depth = el0 - hairline_elev(az0)                     # radians above the hairline (negative below it)
    m0 = (depth > -.05).astype(float)
    n = surface_normal(H, G)
    # thickness: rises from under the skin (-0.8 mm) through the hairline (so the visible edge is the smooth curve where
    # the shell meets the skin), thin at the hairline, fuller over the crown and gathered at the elastic
    da = np.linalg.norm(G - ANCHOR, axis=-1)
    thick = -.0030 + SHELL['edge'] * CH.sstep(-.03, .03, depth) + SHELL['base'] * mask + SHELL['bulge'] * np.exp(-(da / .040) ** 2)
    # the pull: hair lies flatter above the ears where it is drawn back
    az, el = az_el(G)
    thick *= 1 - SHELL['flat_ears'] * np.exp(-((np.abs(az) - 1.45) / .35) ** 2)
    S = G + n * thick[..., None]
    keep = np.zeros((NV - 1, NU), bool)
    for j in range(NV - 1):
        for i in range(NU):
            i2 = (i + 1) % NU
            keep[j, i] = (m0[j, i] + m0[j, i2] + m0[j + 1, i2] + m0[j + 1, i]) >= 1
    # UVs along the combing direction: v from the hairline (0) to the elastic (1); u around the elastic
    v, u = flow_uv(S)
    V, F, UV, remap = [], [], [], {}

    def vid(j, i):
        k = (j, i % NU)
        if k not in remap:
            remap[k] = len(V)
            V.append(S[j, i % NU])
        return remap[k]
    for j in range(NV - 1):
        for i in range(NU):
            if not keep[j, i]:
                continue
            q = [(j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i)]
            F.append([vid(a, b) for a, b in q])
            us = [u[a, b % NU] for a, b in q]
            # unwrap u across its seam (under the ponytail)
            for k_ in range(1, 4):
                while us[k_] - us[0] > .5:
                    us[k_] -= 1
                while us[k_] - us[0] < -.5:
                    us[k_] += 1
            UV.append([(us[k_] * 6, v[a, b % NU] * 1.0) for k_, (a, b) in enumerate(q)])
    return dict(V=np.array(V), F=F, UV=UV, part='hair.shell'), dict(G=G, n=n, mask=mask)


def flow_uv(S):
    """v: 0 at the hairline .. 1 at the elastic (by angle about the head centre); u: angle around the elastic / 2pi"""
    ax = ANCHOR - HC
    ax /= np.linalg.norm(ax)
    d = S - HC
    d = d / np.linalg.norm(d, axis=-1, keepdims=True)
    ang = np.arccos(np.clip((d * ax).sum(-1), -1, 1))           # 0 at the elastic
    # the hairline's angle from the elastic, for this direction around it
    ref = np.array([0, 0, 1.])
    e1 = ref - ax * (ref @ ax)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(ax, e1)
    rot = np.arctan2((d * e2).sum(-1), (d * e1).sum(-1))
    # the hairline's angle from the elastic in that direction (vectorized bisection along the great circle)
    w = np.cos(rot)[..., None] * e1 + np.sin(rot)[..., None] * e2
    lo_a = np.zeros_like(ang)
    hi_a = np.full_like(ang, math.pi)
    for _ in range(24):
        mid = (lo_a + hi_a) / 2
        dirn = ax * np.cos(mid)[..., None] + w * np.sin(mid)[..., None]
        inside = hair_mask(HC + dirn * .1, soft=.0001) > .5
        lo_a = np.where(inside, mid, lo_a)
        hi_a = np.where(inside, hi_a, mid)
    hl = lo_a
    v = 1 - np.clip(ang / np.maximum(hl, 1e-3), 0, 1.2)
    u = (rot / (2 * math.pi)) % 1
    return v, u


def _path_on_hair(H, a_dir, b_dir, n, lift):
    """points along the great circle (about HC) from direction a to b, on the scalp + lift"""
    pts = []
    for t in np.linspace(0, 1, n):
        d = slerp(a_dir, b_dir, t)
        p = CH.project_dirs(H, H_C(), d[None])[0]
        pts.append(p)
    pts = np.array(pts)
    nrm = surface_normal(H, pts)
    return pts, nrm


def H_C():
    return np.array([0, -.006, .018])


def slerp(a, b, t):
    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
    om = math.acos(max(-1, min(1, a @ b)))
    if om < 1e-6:
        return a
    return (math.sin((1 - t) * om) * a + math.sin(t * om) * b) / math.sin(om)


def clumps(H, count=46, seed=11):
    """ribbons from points along the hairline to the elastic, on the shell (alpha-cut edges, strand texture)"""
    rng = np.random.default_rng(seed)
    Cc = H_C()
    V, F, UV = [], [], []
    tip_dir = ANCHOR - Cc
    for k in range(count):
        az = -math.pi * .97 + 2 * math.pi * .97 * (k + .5) / count + rng.uniform(-.04, .04)
        el = hairline_elev(az) + .012
        d0 = np.array([math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)])
        start = HC + d0 * .1 - Cc
        end = tip_dir + rng.normal(0, .004, 3)
        n = 14
        dirs = np.array([slerp(start, end, t ** .9) for t in np.linspace(0, 1, n)])
        pts = CH.project_dirs(H, Cc, dirs)
        nrm = surface_normal(H, pts)
        lift = .0016 + .0075 * np.sin(np.linspace(0, 1, n) * math.pi * .5) ** .7 + .002 * k % 3 * 0
        # the shell's own thickness at these points
        mk = hair_mask(pts, soft=.06)
        da = np.linalg.norm(pts - ANCHOR, axis=-1)
        th = .0012 + .0060 * mk + .0050 * np.exp(-(da / .040) ** 2)
        az_, el_ = az_el(pts)
        th *= 1 - .25 * np.exp(-((np.abs(az_) - 1.45) / .35) ** 2)
        cen = pts + nrm * (th + .0004 + .0005 * (k % 3))[:, None]
        width = .010 + .008 * rng.random()
        base = len(V)
        for i in range(n):
            t_ = i / (n - 1)
            tg = cen[min(i + 1, n - 1)] - cen[max(i - 1, 0)]
            tg /= np.linalg.norm(tg)
            side = np.cross(nrm[i], tg)
            side /= np.linalg.norm(side)
            w = width * (.25 + .75 * math.sin(math.pi * min(1, t_ * 1.6)) ** .7) * (1 - .55 * t_ ** 2)
            V.append(cen[i] - side * w)
            V.append(cen[i] + side * w)
        u0 = (k * .37) % 1
        for i in range(n - 1):
            a = base + 2 * i
            F.append([a, a + 1, a + 3, a + 2])
            UV.append([(u0, i / (n - 1)), (u0 + .25, i / (n - 1)), (u0 + .25, (i + 1) / (n - 1)), (u0, (i + 1) / (n - 1))])
    return dict(V=np.array(V), F=F, UV=UV, part='hair.cards')


def ponytail(n_core=12, length=.235, seed=7):
    """the elastic and the tail: a tapered core and ribbons fanning a little, falling down the back of the neck.
    Returns (core mesh, cards mesh, elastic mesh, bone chain points)."""
    rng = np.random.default_rng(seed)
    A = ANCHOR + np.array([0, .006, 0])
    # the tail's centreline: out from the elastic, over, then down along the neck (head space)
    ctrl = np.array([A, A + [0, .022, -.006], A + [0, .040, -.040], A + [0, .040, -.095], A + [0, .030, -.160], A + [0, .026, -length + .005]])
    t = np.linspace(0, 1, 26)
    C = np.array([_catmull(ctrl, x) for x in t])
    rings = []
    rads = []
    for i, c in enumerate(C):
        x = t[i]
        tg = C[min(i + 1, len(C) - 1)] - C[max(i - 1, 0)]
        r = (.0125 + .0060 * math.sin(math.pi * min(1, x * 2.2)) - .0105 * x ** 1.6) if x > 0 else .0105
        r = max(r, .0012)
        rads.append(r)
        rings.append(_ring(c, tg, r, r * .78, n_core))
    import chr_body as CB
    core = CB.loft(rings, cap1=True, uv_scale=(1., 4.), part='hair.tail')
    # elastic: a dark band around the gathered hair
    el = []
    tg0 = C[2] - C[0]
    for k, (dd, rr) in enumerate(((-.004, .0112), (-.002, .0124), (.002, .0124), (.004, .0112))):
        el.append(_ring(C[0] + tg0 / np.linalg.norm(tg0) * (dd + .004), tg0, rr, rr * .82, 16))
    elastic = CB.loft(el, uv_scale=(1., 1.), part='hair.elastic')
    # ribbons around the core (alpha cards)
    V, F, UV = [], [], []
    for k in range(18):
        ang = 2 * math.pi * k / 18 + rng.uniform(-.15, .15)
        spread = 1.0 + .25 * rng.random()
        base = len(V)
        nseg = 12
        for i in range(nseg + 1):
            x = i / nseg
            p = np.array([_catmull(ctrl, min(1, x * (.92 + .08 * rng.random())))])[0]
            j = min(int(x * (len(C) - 1)), len(C) - 2)
            tg = C[j + 1] - C[j]
            tg /= np.linalg.norm(tg)
            s1 = np.cross(tg, [1., 0, 0])
            s1 /= np.linalg.norm(s1)
            s2 = np.cross(tg, s1)
            r = rads[j] * spread * (1.05 + .25 * x)
            off = (math.cos(ang) * s2 + math.sin(ang) * s1) * r
            w = (.0065 + .003 * rng.random()) * (1 - .5 * x ** 1.5)
            side = np.cross(tg, off / max(np.linalg.norm(off), 1e-9))
            V.append(p + off - side * w)
            V.append(p + off + side * w)
        u0 = (k * .29) % 1
        for i in range(nseg):
            a = base + 2 * i
            F.append([a, a + 1, a + 3, a + 2])
            UV.append([(u0, i / nseg), (u0 + .25, i / nseg), (u0 + .25, (i + 1) / nseg), (u0, (i + 1) / nseg)])
    cards = dict(V=np.array(V), F=F, UV=UV, part='hair.cards')
    chain = [C[0], C[8], C[15], C[22], C[-1]]
    return core, cards, elastic, chain


def _ring(c, tg, rx, ry, n):
    a = tg / np.linalg.norm(tg)
    ref = np.array([1., 0, 0])
    s = ref - a * (ref @ a)
    s /= np.linalg.norm(s)
    t = np.cross(a, s)
    th = np.linspace(0, 2 * math.pi, n, endpoint=False)
    return c + np.outer(rx * np.cos(th), s) + np.outer(ry * np.sin(th), t)


def _catmull(P, x):
    n = len(P) - 1
    f = min(x * n, n - 1e-9)
    i = int(f)
    t = f - i
    p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[min(i + 1, n)], P[min(i + 2, n)]
    t2, t3 = t * t, t * t * t
    return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)


def lashes(head_mesh, side=1):
    """the upper lashes: a thin alpha strip along the upper lid margin, curling up and out"""
    rings = head_mesh['rings']['eye_l' if side > 0 else 'eye_r']
    rim = rings[0]
    V0 = head_mesh['V']
    pts = V0[rim]
    e = CH.D['eye'] * [side, 1, 1]
    # upper half of the rim: points above the eye centre's height, ordered medial->lateral
    up = [p for p in pts if p[2] > e[2] + .0015]
    up = sorted(up, key=lambda p: abs(p[0]))
    up = np.array(up)
    V, F, UV = [], [], []
    n = len(up)
    for i, p in enumerate(up):
        t = i / max(n - 1, 1)
        out = p - e
        out /= np.linalg.norm(out)
        L = .0062 + .0030 * math.sin(math.pi * t) + .0012 * t
        tipv = out * .8 + np.array([0, -.25, .55]) + np.array([side * .25 * t, 0, 0])
        tipv /= np.linalg.norm(tipv)
        V.append(p + out * .0003)
        V.append(p + out * .0003 + tipv * L)
    for i in range(n - 1):
        a = 2 * i
        F.append([a, a + 2, a + 3, a + 1])
        UV.append([(i / (n - 1), 0), ((i + 1) / (n - 1), 0), ((i + 1) / (n - 1), 1), (i / (n - 1), 1)])
    return dict(V=np.array(V), F=F, UV=UV, part='hair.lashes')
