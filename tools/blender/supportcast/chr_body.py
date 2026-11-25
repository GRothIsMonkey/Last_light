"""Jamie's mother (chr.jamie-mother): the body below the head, as original procedural geometry.

Everything is built in Blender's frame (metres; x to the character's left, y back, z up; the character faces -y; feet on
z = 0) for a woman of 1.65 m in the A-pose of the pipeline's relaxed A-pose family (arms 75 degrees below horizontal:
the Prologue's standing, walking and small gestures then need little shoulder deformation). Visible skin is only the
neck and the top of the chest inside the neckline, the arms below the short sleeves, and the hands: the garments are the
outer surface everywhere else (no body is kept under clothes, so nothing can poke through).

Meshes come back as dicts: V (N,3) vertex positions, F lists of vertex indices (quads, a few triangles), UV per face
corner, plus a 'part' name. Pure numpy.
"""
import math
import numpy as np

# ------------------------------------------------------------------------------------------------ the skeleton
# Joint positions (PROVISIONAL proportions, recorded in the design report): stature 1.650 m, 7.5 heads (head 0.220).
J = dict(
    head_origin=np.array([0, .012, 1.511]),   # the ear canals (head space origin of chr_head)
    neck=np.array([0, .028, 1.400]), head=np.array([0, .016, 1.468]),
    chest=np.array([0, .030, 1.180]), spine_02=np.array([0, .030, 1.090]), spine_01=np.array([0, .024, 1.000]),
    hips=np.array([0, .012, .935]),
    shoulder=np.array([.166, .010, 1.322]), clav=np.array([.022, -.010, 1.350]),
    elbow=np.array([.243, .016, 1.058]), wrist=np.array([.302, -.003, .831]),     # rest: arms 75 deg below horizontal
    hip=np.array([.088, .004, .862]), knee=np.array([.093, -.004, .468]), ankle=np.array([.096, .012, .078]),
    ball=np.array([.104, -.118, .020]), toe=np.array([.108, -.178, .012]),
)


def mirror(p):
    return np.array([-p[0], p[1], p[2]])


# ------------------------------------------------------------------------------------------------ helpers
def sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def loft(rings, closed=True, cap0=False, cap1=False, uv_scale=(1., 1.), v_by_length=True, part=''):
    """quads between consecutive rings (each (n,3), same n); UV u along the ring, v along the loft"""
    R = [np.asarray(r, float) for r in rings]
    n = len(R[0])
    V = np.concatenate(R)
    F, UV = [], []
    if v_by_length:
        mids = np.array([r.mean(0) for r in R])
        L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(mids, axis=0), axis=1))])
    else:
        L = np.arange(len(R), dtype=float)
    m = n if closed else n - 1
    for k in range(len(R) - 1):
        for i in range(m):
            j = (i + 1) % n
            a, b, c, d = k * n + i, k * n + j, (k + 1) * n + j, (k + 1) * n + i
            F.append([a, b, c, d])
            u0, u1 = i / n * uv_scale[0], (i + 1) / n * uv_scale[0]
            v0, v1 = L[k] * uv_scale[1], L[k + 1] * uv_scale[1]
            UV.append([(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
    for cap, k in ((cap0, 0), (cap1, len(R) - 1)):
        if not cap:
            continue
        c = len(V)
        V = np.concatenate([V, R[k].mean(0)[None]])
        for i in range(n):
            j = (i + 1) % n
            f = [k * n + i, k * n + j, c] if k else [k * n + j, k * n + i, c]
            F.append(f)
            UV.append([(.5, .5)] * 3)
    return dict(V=V, F=F, UV=UV, part=part)


def merge(*meshes, part=''):
    V, F, UV = [], [], []
    off = 0
    for m in meshes:
        V.append(m['V'])
        F += [[i + off for i in f] for f in m['F']]
        UV += m['UV']
        off += len(m['V'])
    return dict(V=np.concatenate(V), F=F, UV=UV, part=part or meshes[0]['part'])


def frame(axis):
    """two unit vectors perpendicular to axis (x-ish 'side' and the other)"""
    a = axis / np.linalg.norm(axis)
    ref = np.array([0, 1., 0]) if abs(a[1]) < .9 else np.array([1., 0, 0])
    s = np.cross(ref, a)
    s /= np.linalg.norm(s)
    t = np.cross(a, s)
    return a, s, t


def ring_around(c, axis, rx, ry, n, phase=0., squ=2.0, bulge=None, side=None):
    """a ring of n points around centre c perpendicular to axis; rx along 'side', ry along the other; superellipse"""
    a, s, t = frame(axis)
    if side is not None:
        s = side - a * (side @ a)
        s /= np.linalg.norm(s)
        t = np.cross(a, s)
    th = phase + np.linspace(0, 2 * math.pi, n, endpoint=False)
    cs, sn = np.cos(th), np.sin(th)
    e = 2 / squ
    x = rx * np.sign(cs) * np.abs(cs) ** e
    y = ry * np.sign(sn) * np.abs(sn) ** e
    if bulge is not None:
        k = bulge(th)
        x, y = x * k, y * k
    return c + np.outer(x, s) + np.outer(y, t)


# ------------------------------------------------------------------------------------------------ the torso
# Horizontal sections (world z): half-width w, front y (negative), back y, superellipse exponent n.
TORSO = np.array([
    # z      w      yf      yb     n
    [1.450, .0470, -.026, .062, 2.0],
    [1.420, .0500, -.030, .066, 2.0],
    [1.395, .0545, -.036, .071, 2.0],
    [1.378, .0900, -.050, .076, 2.2],
    [1.360, .1400, -.066, .080, 2.6],
    [1.345, .1580, -.074, .082, 2.9],
    [1.330, .1630, -.080, .084, 3.0],
    [1.300, .1640, -.090, .088, 2.8],
    [1.260, .1560, -.098, .090, 2.5],
    [1.220, .1500, -.103, .090, 2.4],
    [1.180, .1480, -.100, .088, 2.3],
    [1.140, .1400, -.088, .086, 2.3],
    [1.100, .1320, -.082, .083, 2.3],
    [1.060, .1260, -.078, .080, 2.3],
    [1.020, .1240, -.076, .078, 2.3],
    [0.980, .1360, -.080, .088, 2.4],
    [0.940, .1540, -.084, .104, 2.4],
    [0.900, .1680, -.084, .118, 2.4],
    [0.860, .1740, -.080, .124, 2.4],
    [0.820, .1700, -.072, .118, 2.4],
    [0.780, .1600, -.064, .104, 2.4],
])


def _interp(z):
    z = np.asarray(z, float)
    zs = TORSO[::-1, 0]
    out = []
    for c in range(1, 5):
        vals = TORSO[::-1, c]
        # monotone-ish smooth interpolation: cubic Hermite with averaged slopes
        out.append(np.interp(z, zs, vals) if False else _hermite(zs, vals, z))
    return out


def _hermite(xs, ys, x):
    x = np.clip(x, xs[0], xs[-1])
    i = np.clip(np.searchsorted(xs, x) - 1, 0, len(xs) - 2)
    x0, x1, y0, y1 = xs[i], xs[i + 1], ys[i], ys[i + 1]
    m = np.gradient(ys, xs)
    h = x1 - x0
    t = (x - x0) / h
    h00, h10, h01, h11 = 2 * t ** 3 - 3 * t ** 2 + 1, t ** 3 - 2 * t ** 2 + t, -2 * t ** 3 + 3 * t ** 2, t ** 3 - t ** 2
    return h00 * y0 + h10 * h * m[i] + h01 * y1 + h11 * h * m[i + 1]


BUST = 1.0          # the bust volume (1 for Jamie's mother; 0 for a child)


def torso_point(z, th, ease=0.):
    """the body surface at height z, angle th (0 = straight ahead -y, +pi/2 = the character's left +x); ease pushes out"""
    z, th = np.broadcast_arrays(np.asarray(z, float), np.asarray(th, float))
    w, yf, yb, n = _interp(z)
    cs, sn = np.cos(th), np.sin(th)
    e = 2 / n
    x = (w + ease) * np.sign(sn) * np.abs(sn) ** e
    front = cs > 0
    y = np.where(front, (yf - ease) * np.abs(cs) ** e, (yb + ease) * np.abs(cs) ** e)
    # the bust: two soft volumes either side of the midline (a supported, everyday shape)
    bz = np.exp(-((z - 1.185) / .045) ** 2)
    for sx in (-1, 1):
        dx = x - sx * .088 * (TORSO[8, 1] / .150)
        y = y - front * .030 * BUST * bz * np.exp(-(dx / .055) ** 2)
    # shoulder blades and glutes: soft back volumes
    y = y + (~front) * (.010 * np.exp(-((z - 1.24) / .06) ** 2) * (np.abs(x) > .03) * np.exp(-((np.abs(x) - .075) / .05) ** 2))
    y = y + (~front) * (.012 * np.exp(-((z - .86) / .05) ** 2) * np.exp(-((np.abs(x) - .07) / .06) ** 2))
    return np.stack([x, y, z], -1)


# ------------------------------------------------------------------------------------------------ the neck yoke
def yoke(head_bottom, z_to=1.310, rows=10, inset=.003):
    """skin from the bottom ring of the head grid down under the shirt: continues the neck into the shoulders"""
    hb = np.asarray(head_bottom, float)
    n = len(hb)
    c = np.array([0, .012])
    th = np.arctan2(hb[:, 0], -(hb[:, 1] - c[1]))       # angle of each ring vertex around the neck axis
    rings = [hb]
    z0 = hb[:, 2]
    for k in range(1, rows + 1):
        t = k / rows
        z = z0 + (z_to - z0) * t ** 1.2
        tp = torso_point(z, th, ease=-inset)
        # blend in from the head ring's own shape for the first rows
        b = sstep(0, .5, t)
        p = hb * (1 - b)[..., None] * 0 + tp
        if k == 1:
            p = .55 * tp + .45 * np.stack([hb[:, 0] * 1.02, hb[:, 1], z], -1)
        rings.append(p)
    return loft(rings, part='skin.yoke')


# ------------------------------------------------------------------------------------------------ the T-shirt
def neckline_z(th):
    """a crew neck: low in front, up on the trapezius at the sides, highest at the back"""
    c = np.cos(th)
    return 1.374 + .030 * (1 - c) / 2


def shirt(n=60, hem=.865, rows=28):
    """a fitted cotton crew-neck T-shirt, untucked to the high hip: the body tube up to the neckline, the rib band"""
    th = np.linspace(0, 2 * math.pi, n, endpoint=False) + math.pi / n
    zt = neckline_z(th)
    rings = []
    # from the hem up; ease: a little looser at the waist and the hem, close at the shoulders
    for k in range(rows + 1):
        t = k / rows
        z = hem + (zt - hem) * t
        ease = .004 + .004 * np.exp(-((z - 1.00) / .09) ** 2) + .007 * sstep(.95, .87, z)
        # drape: the shirt bridges the gap under the bust instead of following it in
        under = np.exp(-((z - 1.120) / .040) ** 2) * (np.cos(th) > 0) * .012 * np.abs(np.cos(th)) ** 2
        p = torso_point(z, th, ease=ease)
        p[:, 1] -= under
        rings.append(p)
    body = loft(rings, uv_scale=(2.2, 2.6), part='shirt')
    # hem: a turned-up hem 2 cm deep (inside surface), so the edge has thickness
    hem_in = [rings[0], rings[0] + (np.array([0, 0, .0]) + 0), None]
    inside = []
    for k in (0, 2):
        r = rings[k].copy()
        cx = r.mean(0)
        r[:, :2] = cx[:2] + (r[:, :2] - cx[:2]) * .975
        inside.append(r)
    hem_m = loft([rings[0], inside[0], inside[1]], uv_scale=(2.2, 2.6), part='shirt')
    # rib neckband: up and in from the neckline, 1.6 cm, turned under
    top = rings[-1]
    cxy = np.array([0, .016])
    band = []
    for k, (rise, shrink) in enumerate(((0., 1.), (.006, .965), (.010, .925), (.008, .885), (-.004, .86))):
        r = top.copy()
        r[:, :2] = cxy + (r[:, :2] - cxy) * shrink
        r[:, 2] += rise
        band.append(r)
    nb = loft(band, uv_scale=(6, 4), part='shirt.rib')
    return merge(body, hem_m, nb, part='shirt'), rings


def sleeve(side=1, n=40, length=.150):
    """a short set-in sleeve over the upper arm; its top buried in the shirt's shoulder (the armhole seam)"""
    S = J['shoulder'] * [side, 1, 1]
    E = J['elbow'] * [side, 1, 1]
    ax = (E - S) / np.linalg.norm(E - S)
    rings = []
    for k, (d, r, sq) in enumerate(((-.034, .024, 2.0), (-.010, .037, 2.1), (.022, .044, 2.2), (.075, .049, 2.2), (length - .015, .050, 2.2), (length, .050, 2.2))):
        c = S + ax * d + np.array([0, 0, -.004]) * (d < .02)
        rings.append(ring_around(c, ax, r, r * .93, n, side=np.array([0, 1., 0]), squ=sq))
    # hem: a turned edge inside
    last = rings[-1]
    c = S + ax * length
    rin = c + (last - c) * .94
    rin2 = rin - ax * .016
    rings += [rin, rin2]
    m = loft(rings, uv_scale=(1.3, 3.0), part='shirt.sleeve')
    if side < 0:
        m['F'] = [f[::-1] for f in m['F']]
        m['UV'] = [u[::-1] for u in m['UV']]
    return m


# ------------------------------------------------------------------------------------------------ arms and hands
def arm(side=1, n=22):
    """skin from inside the sleeve to the wrist: deltoid, biceps/triceps, the elbow, forearm, wrist"""
    S = J['shoulder'] * [side, 1, 1]
    E = J['elbow'] * [side, 1, 1]
    W = J['wrist'] * [side, 1, 1]
    rings = []
    up = np.array([0, 1., 0])
    for t, rx, ry in ((.15, .043, .044), (.35, .041, .041), (.55, .039, .038), (.75, .036, .035), (.92, .034, .032), (1.0, .0335, .031)):
        c = S + (E - S) * t
        rings.append(ring_around(c, E - S, rx, ry, n, side=up))
    # forearm: flatter toward the wrist, the muscle mass high on the forearm
    for t, rx, ry in ((.06, .036, .032), (.20, .038, .033), (.38, .035, .030), (.58, .030, .026), (.80, .025, .021), (.95, .0235, .0185), (1.0, .0232, .0182)):
        c = E + (W - E) * t
        rings.append(ring_around(c, W - E, rx, ry, n, side=up))
    m = loft(rings, part='skin.arm')
    return m, rings[-1]


def hand(side=1, wrist_ring=None, n=22):
    """a woman's hand, relaxed: the palm lofted from the wrist to the knuckles, fingers in a soft natural curl, the
    thumb from the base of the palm; nails as their own small caps. Returns (mesh, nails mesh)."""
    W = J['wrist'] * [side, 1, 1]
    E = J['elbow'] * [side, 1, 1]
    ax = (W - E) / np.linalg.norm(W - E)
    # hand frame: a = along the hand, b = across the palm (toward the thumb), c = out of the back of the hand
    # relaxed A-pose: palm faces the thigh (inward) and a little back
    c_out = np.array([side * 1., 0, 0])                 # the back of the hand faces outward (away from the body)
    c_out = c_out - ax * (c_out @ ax)
    c_out /= np.linalg.norm(c_out)
    b = np.cross(c_out, ax) * side                       # toward the thumb (forward, -y)
    if b[1] > 0:
        b = -b
    a = ax

    def P(u, v, w):
        return W + a * u + b * v + c_out * w

    rings = [wrist_ring]
    # palm sections along the hand (u), half-width across (v), half-thickness (w)
    for u, hw, ht, off in ((.012, .027, .0175, 0), (.030, .033, .0165, .001), (.055, .037, .0150, .002), (.078, .0385, .0135, .002), (.092, .0375, .0125, .002)):
        th = np.linspace(0, 2 * math.pi, n, endpoint=False)
        cs, sn = np.cos(th), np.sin(th)
        e = 2 / 2.6
        vv = hw * np.sign(cs) * np.abs(cs) ** e
        ww = ht * np.sign(sn) * np.abs(sn) ** e
        # the palm is fuller on the thumb side (thenar) and at the heel (hypothenar)
        ww = np.where(sn < 0, ww * (1 + .25 * np.exp(-((vv / hw - .6) / .35) ** 2) * (u < .06)), ww)
        rings.append(np.array([P(u, v_, w_ + off) for v_, w_ in zip(vv, ww)]))
    # orient the wrist ring to match the palm's first ring ordering: resample the wrist ring by angle in the hand frame
    wr = np.asarray(wrist_ring, float)
    ang_w = np.arctan2((wr - W) @ c_out, (wr - W) @ b)
    th = np.linspace(0, 2 * math.pi, n, endpoint=False)
    ang_p = np.arctan2(rings[1][:, :] @ c_out - W @ c_out, rings[1] @ b - W @ b)
    shift = int(np.argmin(np.abs(np.angle(np.exp(1j * (ang_w - ang_p[0]))))))
    rings[0] = np.roll(wr, -shift, axis=0)
    # check orientation (same winding)
    d0 = np.angle(np.exp(1j * (np.arctan2((rings[0][1] - W) @ c_out, (rings[0][1] - W) @ b) - np.arctan2((rings[0][0] - W) @ c_out, (rings[0][0] - W) @ b))))
    if d0 < 0:
        rings[0] = np.roll(rings[0][::-1], 1, axis=0)
    palm = loft(rings, cap1=True, part='skin.hand')
    # fingers: base positions across the knuckles (v), lengths, radii; relaxed curl per joint (radians)
    fingers = []
    nails = []
    spec = [  # name, v at base, u at base, segment lengths, base radius, curl per joint, splay
        ('index', .026, .090, (.040, .025, .021), .0090, (.20, .30, .22), .06),
        ('middle', .009, .094, (.044, .028, .022), .0092, (.25, .34, .24), .0),
        ('ring', -.008, .091, (.041, .026, .021), .0086, (.30, .38, .26), -.05),
        ('pinky', -.024, .083, (.032, .020, .018), .0074, (.36, .42, .28), -.12),
    ]
    finger_tips = {}
    for name, v0, u0, segs, r0, curl, splay in spec:
        pts = [P(u0 - .012, v0, 0)]
        d = a * math.cos(splay) + b * math.sin(splay)
        p = P(u0, v0, -.001)
        pts.append(p)
        ang = 0.
        dirs = []
        for L, cu in zip(segs, curl):
            ang += cu
            dd = d * math.cos(ang) - c_out * math.sin(ang)
            dirs.append(dd)
            p = p + dd * L
            pts.append(p)
        # sections along the finger
        R = []
        npt = len(pts)
        for k_ in range(1, npt):
            for t in ((0., .45, .9) if k_ < npt - 1 else (0., .45, .8)):
                q = pts[k_ - 1] + (pts[k_] - pts[k_ - 1]) * t
                if k_ == 1 and t == 0.:
                    continue
                frac = (k_ - 1 + t) / (npt - 1)
                rad = r0 * (1 - .32 * frac) * (1.06 if t == 0. and k_ > 1 else 1.0)   # knuckles slightly fuller
                axis = pts[k_] - pts[k_ - 1]
                R.append(ring_around(q, axis, rad, rad * .86, 11, side=b))
        tip = pts[-1]
        # round the fingertip
        axis = pts[-1] - pts[-2]
        axn = axis / np.linalg.norm(axis)
        for t, s in ((.0, .9), (.004, .75), (.0075, .48), (.0095, .18)):
            R.append(ring_around(tip + axn * t, axis, r0 * .68 * s, r0 * .68 * .86 * s, 11, side=b))
        fm = loft(R, cap1=True, part='skin.hand')
        fingers.append(fm)
        finger_tips[name] = (pts, dirs)
        # the nail: a slightly domed, glossy plate on the back of the last segment
        nail_c = pts[-2] + (pts[-1] - pts[-2]) * .62
        nails.append(nail_plate(nail_c, axn, -c_out_turn(c_out, axn, -1), r0 * .62, .0105))
    # thumb: from the base of the palm on the thumb side, opposed and curled a little
    tb = P(.020, .026, -.008)
    tdir = (a * .82 + b * .46 - c_out * .34)
    tdir /= np.linalg.norm(tdir)
    pts = [tb]
    p = tb
    ang = 0.
    for L, cu in ((.036, .0), (.029, .18), (.025, .26)):
        ang += cu
        dd = tdir * math.cos(ang) + (a * .2 - c_out * .7 - b * .3) * math.sin(ang)
        dd /= np.linalg.norm(dd)
        p = p + dd * L
        pts.append(p)
    R = []
    for k_ in range(1, len(pts)):
        for t in (0., .5):
            q = pts[k_ - 1] + (pts[k_] - pts[k_ - 1]) * t
            frac = (k_ - 1 + t) / (len(pts) - 1)
            rad = (.0145 if k_ == 1 else .0105) * (1 - .25 * frac)
            R.append(ring_around(q, pts[k_] - pts[k_ - 1], rad, rad * .85, 11, side=b))
    axis = pts[-1] - pts[-2]
    axn = axis / np.linalg.norm(axis)
    for t, s in ((0., 1.), (.004, .8), (.0075, .5), (.0098, .2)):
        R.append(ring_around(pts[-1] + axn * t, axis, .0072 * s, .0062 * s, 11, side=b))
    fingers.append(loft(R, cap1=True, part='skin.hand'))
    finger_tips['thumb'] = (pts, None)
    nails.append(nail_plate(pts[-2] + (pts[-1] - pts[-2]) * .65, axn, b * 0 + c_out_turn(c_out, axn, 1), .0068, .0110))
    m = merge(palm, *fingers, part='skin.hand')
    if side < 0:
        m['F'] = [f[::-1] for f in m['F']]
        m['UV'] = [u[::-1] for u in m['UV']]
    nm = merge(*nails, part='nails')
    if side < 0:
        nm['F'] = [f[::-1] for f in nm['F']]
        nm['UV'] = [u[::-1] for u in nm['UV']]
    return m, nm, finger_tips, dict(a=a, b=b, c=c_out, W=W)


def c_out_turn(c, axis, s):
    v = c - axis * (c @ axis)
    return v / np.linalg.norm(v) * s


def nail_plate(c, along, up, half_w, length, nu=5, nv=4):
    """a small domed rectangle (the nail) lying on a fingertip, normal 'up'"""
    up = up / np.linalg.norm(up)
    side = np.cross(up, along)
    side /= np.linalg.norm(side)
    V, F, UV = [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            s = (i / nu - .5) * 2
            t = (j / nv - .5)
            dome = .0016 * (1 - s * s)
            rnd = 1 - .25 * max(0, (t + .5) * 2 - 1.6) ** 2
            V.append(c + side * s * half_w * rnd + along * t * length + up * (dome + .0016))
            UV.append(None)
    for j in range(nv):
        for i in range(nu):
            a = j * (nu + 1) + i
            F.append([a, a + 1, a + nu + 2, a + nu + 1])
    uv = [[(.0, .0)] * 4 for _ in F]
    return dict(V=np.array(V), F=F, UV=uv, part='nails')


# ------------------------------------------------------------------------------------------------ jeans
def jeans(n_hip=48, rows_hip=8, rows_leg=30, rise=.968, hem=.036):
    """mid-rise bootcut jeans (2011): the seat and hips from the waistband to the crotch, then two legs (the pants
    topology: each leg's first ring is half the hip ring plus the inseam), waistband with belt loops and a fly seam
    in the texture; the hem breaks a little on the shoe."""
    th = np.linspace(0, 2 * math.pi, n_hip, endpoint=False)
    rings = []
    zc = .772
    for k in range(rows_hip + 1):
        t = k / rows_hip
        z = rise + (zc - rise) * t
        ease = .006 + .002 * t
        p = torso_point(z, th, ease=ease)
        rings.append(p)
    hip = loft(rings, uv_scale=(2.4, 2.4), part='jeans')
    # the waistband: a band standing proud 2 mm, 3.5 cm tall
    wb_top = rings[0].copy()
    wb_out = wb_top.copy()
    cx = np.array([0, .010])
    wb_out[:, :2] = cx + (wb_out[:, :2] - cx) * 1.012
    wb_low = rings[0].copy()
    wb_low[:, 2] -= .035
    wb_low[:, :2] = cx + (wb_low[:, :2] - cx) * 1.012
    wb_in = wb_top.copy()
    wb_in[:, :2] = cx + (wb_in[:, :2] - cx) * .975
    wb_in[:, 2] -= .02
    band = loft([wb_low, wb_out, wb_top, wb_in], uv_scale=(2.4, 2.4), part='jeans')
    # legs
    last = rings[-1]
    # front crotch point index (th = 0) and back (th = pi)
    i_f, i_b = 0, n_hip // 2
    legs = []
    for side in (1, -1):
        # outer arc: from front crotch around the side to the back crotch
        if side > 0:
            arc = list(range(i_f, i_b + 1))
        else:
            arc = [i_f] + list(range(n_hip - 1, i_b - 1, -1))
        outer = last[arc]
        m_in = len(arc) - 2
        inner = []
        for q in range(1, m_in + 1):
            t = q / (m_in + 1)
            pb, pf = last[i_b], last[i_f]
            pt = pb + (pf - pb) * t
            pt = pt + np.array([side * .004, 0, -.010 * math.sin(math.pi * t)])
            inner.append(pt)
        top = np.concatenate([outer, np.array(inner)])
        nL = len(top)
        H = J['hip'] * [side, 1, 1]
        K = J['knee'] * [side, 1, 1]
        A = J['ankle'] * [side, 1, 1]
        # leg sections: centre, half-widths (side, front-back) along the leg
        secs = []
        for t, rx, ry in ((.30, .076, .082), (.42, .070, .074), (.56, .063, .066), (.70, .057, .059), (.84, .052, .053), (.94, .049, .050), (1.0, .048, .049)):
            c = H + (K - H) * t + np.array([side * -.004 * (1 - t), -.004, 0])
            secs.append((c, K - H, rx + .008, ry + .008))
        for t, rx, ry in ((.15, .046, .049), (.35, .047, .050), (.55, .048, .050), (.75, .051, .053), (.90, .055, .058), (1.0, .057, .061)):
            c = K + (A - K) * t
            c = c.copy()
            secs.append((c, A - K, rx + .006, ry + .006))
        # resample: ring k by angle around the leg axis, matching the top ring's angular order
        Lr = [top]
        cH = top.mean(0)
        ang_top = np.arctan2(top[:, 1] - cH[1], (top[:, 0] - cH[0]) * side)
        for c, axis, rx, ry in secs:
            axn = axis / np.linalg.norm(axis)
            s_ = np.array([side * 1., 0, 0])
            s_ -= axn * (s_ @ axn)
            s_ /= np.linalg.norm(s_)
            t_ = np.cross(axn, s_)
            # same angles as the top ring so the quads do not twist
            cs, sn = np.cos(ang_top), np.sin(ang_top)
            r = c + np.outer(rx * cs, s_) + np.outer(ry * sn, np.array([0, 1., 0]) - axn * axn[1])
            Lr.append(r)
        # hem: the break on the shoe (a slight forward kink), turned edge inside
        last_r = Lr[-1]
        cA = last_r.mean(0)
        brk = last_r.copy()
        brk[:, 2] = np.where(brk[:, 1] < cA[1], hem + .012, hem)
        Lr[-1] = brk
        inn = cA + (brk - cA) * .95
        inn[:, 2] += .02
        Lr.append(inn)
        leg = loft(Lr, uv_scale=(1.2, 2.4), part='jeans')
        if side < 0:
            leg['F'] = [f[::-1] for f in leg['F']]
            leg['UV'] = [u[::-1] for u in leg['UV']]
        legs.append(leg)
    return merge(hip, band, *legs, part='jeans')


# ------------------------------------------------------------------------------------------------ shoes
def shoe(side=1, n=18):
    """a dark low-top slip-on canvas sneaker: lofted upper over the foot, a rubber sole with a toe bumper"""
    A = J['ankle'] * [side, 1, 1]
    heel_y, toe_y = A[1] + .058, A[1] - .205
    x0 = A[0] + side * .004
    rings, sole_r = [], []
    L = heel_y - toe_y
    for k in range(17):
        t = k / 16
        y = heel_y - L * t
        # foot width and upper height along the length (heel -> toe)
        w = .030 + .016 * math.sin(math.pi * min(1, t * 1.3)) * (1 - .25 * sstep(.75, 1, t)) - .012 * sstep(.88, 1.0, t)
        h = .085 - .040 * sstep(.25, .80, t) - .022 * sstep(.80, 1.0, t)
        if t > .97:
            w *= .6
            h *= .7
        cx = x0 + side * (.006 * math.sin(math.pi * t))
        th = np.linspace(0, 2 * math.pi, n, endpoint=False)
        cs, sn = np.cos(th), np.sin(th)
        xs = cx + w * np.sign(cs) * np.abs(cs) ** .75
        zs = .020 + np.where(sn > 0, h * np.abs(sn) ** .9, .002 * np.abs(sn))
        r = np.stack([xs, np.full(n, y), zs], -1)
        rings.append(r)
    upper = loft(rings, cap0=True, cap1=True, uv_scale=(1., 3.), part='shoe')
    # sole: an outline at two heights
    out = []
    for k in range(21):
        t = k / 20
        y = heel_y + .008 - (L + .016) * t
        w = .034 + .017 * math.sin(math.pi * min(1, t * 1.3)) - .014 * sstep(.86, 1.0, t)
        out.append((y, w))
    pts = [(x0 + side * w, y) for y, w in out] + [(x0 - side * w, y) for y, w in out[::-1]]
    pts = np.array(pts)
    c = pts.mean(0)
    pts = c + (pts - c) * 1.0
    ring_lo = np.array([[p[0], p[1], .000] for p in pts])
    ring_mid = np.array([[p[0], p[1], .012] for p in pts])
    ring_hi = np.array([[c[0] + (p[0] - c[0]) * .985, c[1] + (p[1] - c[1]) * .985, .024] for p in pts])
    sole = loft([ring_lo, ring_mid, ring_hi], cap0=True, cap1=False, uv_scale=(4., 6.), part='sole')
    if side > 0:
        sole['F'] = [f[::-1] for f in sole['F']]
        sole['UV'] = [u[::-1] for u in sole['UV']]
    if side < 0:
        upper['F'] = [f[::-1] for f in upper['F']]
        upper['UV'] = [u[::-1] for u in upper['UV']]
    return upper, sole


# ------------------------------------------------------------------------------------------------ a child's legs
def shorts(n_hip=48, rows_hip=7, rise=None, hem_t=.92, loose=.012, zc=None):
    """basketball shorts: the jeans' construction (seat and two legs, the pants topology) with wide loose legs ending
    above the knee (hem_t along the thigh, 0 = hip joint, 1 = knee)"""
    rise = rise if rise is not None else J['hips'][2] + .025
    zc = zc if zc is not None else J['hip'][2] - .085
    th = np.linspace(0, 2 * math.pi, n_hip, endpoint=False)
    rings = []
    for k in range(rows_hip + 1):
        t = k / rows_hip
        z = rise + (zc - rise) * t
        rings.append(torso_point(z, th, ease=.002 + .007 * t))
    hip = loft(rings, uv_scale=(2.0, 2.4), part='shorts')
    wb_top = rings[0].copy()
    cx = np.array([0, .010])
    wb_in = wb_top.copy()
    wb_in[:, :2] = cx + (wb_in[:, :2] - cx) * .96
    wb_in[:, 2] -= .03
    band = loft([wb_top, wb_in], uv_scale=(2.0, 2.4), part='shorts')
    last = rings[-1]
    i_f, i_b = 0, n_hip // 2
    legs = []
    for side in (1, -1):
        arc = list(range(i_f, i_b + 1)) if side > 0 else [i_f] + list(range(n_hip - 1, i_b - 1, -1))
        outer = last[arc]
        m_in = len(arc) - 2
        inner = []
        for q in range(1, m_in + 1):
            t = q / (m_in + 1)
            pt = last[i_b] + (last[i_f] - last[i_b]) * t + np.array([side * .004, 0, -.008 * math.sin(math.pi * t)])
            inner.append(pt)
        top = np.concatenate([outer, np.array(inner)])
        Hj, K = J['hip'] * [side, 1, 1], J['knee'] * [side, 1, 1]
        cH = top.mean(0)
        ang = np.arctan2(top[:, 1] - cH[1], (top[:, 0] - cH[0]) * side)
        Lr = [top]
        for t in np.linspace(.30, hem_t, 5):
            c = Hj + (K - Hj) * t + np.array([side * .006, -.004, 0])
            axn = (K - Hj) / np.linalg.norm(K - Hj)
            s_ = np.array([side * 1., 0, 0])
            s_ -= axn * (s_ @ axn)
            s_ /= np.linalg.norm(s_)
            r = .060 + loose - .004 * (t - .3)
            Lr.append(c + np.outer(r * np.cos(ang), s_) + np.outer(r * .95 * np.sin(ang), np.array([0, 1., 0]) - axn * axn[1]))
        cA = Lr[-1].mean(0)
        inn = cA + (Lr[-1] - cA) * .97
        inn[:, 2] += .012
        Lr.append(inn)
        leg = loft(Lr, uv_scale=(1.2, 2.4), part='shorts')
        if side < 0:
            leg['F'] = [f[::-1] for f in leg['F']]
            leg['UV'] = [u[::-1] for u in leg['UV']]
        legs.append(leg)
    return merge(hip, band, *legs, part='shorts')


def bare_leg(side=1, n=20, t0=.45):
    """skin from inside the shorts down to the ankle (inside the sock): the knee, the calf, the shin"""
    Hj, K, A = J['hip'] * [side, 1, 1], J['knee'] * [side, 1, 1], J['ankle'] * [side, 1, 1]
    up = np.array([0, 1., 0])
    rings = []
    for t, rx, ry in ((t0, .056, .058), (.62, .052, .053), (.80, .046, .047), (.94, .041, .043), (1.0, .040, .042)):
        rings.append(ring_around(Hj + (K - Hj) * t, K - Hj, rx, ry, n, side=np.array([1., 0, 0])))
    for t, rx, ry in ((.10, .040, .044), (.28, .043, .049), (.45, .041, .046), (.65, .034, .036), (.85, .028, .029), (1.0, .026, .028)):
        rings.append(ring_around(K + (A - K) * t, A - K, rx, ry, n, side=np.array([1., 0, 0])))
    m = loft(rings, part='skin.leg')
    if side < 0:
        m['F'] = [f[::-1] for f in m['F']]
        m['UV'] = [u[::-1] for u in m['UV']]
    return m


def sock(side=1, n=20, top=.20):
    """a white crew sock from inside the shoe up the shin, a ribbed cuff"""
    K, A = J['knee'] * [side, 1, 1], J['ankle'] * [side, 1, 1]
    rings = []
    L = np.linalg.norm(K - A)
    for z, r in ((A[2] - .01, .033), (A[2] + .03, .031), (top - .02, .031), (top, .032), (top + .002, .029)):
        t = (z - A[2]) / (K[2] - A[2])
        rings.append(ring_around(A + (K - A) * t, K - A, r, r * 1.05, n, side=np.array([1., 0, 0])))
    m = loft(rings, uv_scale=(1., 4.), part='sock')
    if side < 0:
        m['F'] = [f[::-1] for f in m['F']]
        m['UV'] = [u[::-1] for u in m['UV']]
    return m
