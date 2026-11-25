"""Rig, skin weights, face shape keys and clips for the supporting cast (pure numpy; build_*.py applies them in Blender).

Skeleton names follow Astra's Phase 1B protagonist rig (root, hips, spine_01, spine_02, chest, neck, head, clavicle_*,
upperarm_*, lowerarm_*, forearm_twist_*, hand_*, thumb1-3_*, index1-3_*, middle1-3_*, ring1-3_*, pinky1-3_*, thigh_*,
calf_*, foot_*, toe_*), plus jaw, eye_l/eye_r (BLENDER-PIPELINE.md 4.1), phys_ponytail_01-03 (runtime secondary motion)
and non-deforming sockets. Skin weights are computed from each part's own chain (arc length along the bones, with a
blend width per joint), at most 4 influences, normalized.
"""
import math
import numpy as np


def sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------------------------------------ skeleton
def skeleton(J, hands, eyes, tail, jaw):
    """bone list: name -> dict(head, tail, parent, deform). hands: {1: (tips, frame), -1: ...}"""
    B = {}

    def add(n, h, t, p, deform=True):
        B[n] = dict(head=np.asarray(h, float), tail=np.asarray(t, float), parent=p, deform=deform)
    add('root', [0, 0, 0], [0, -.12, 0], None, False)
    add('hips', J['hips'], J['spine_01'], 'root')
    add('spine_01', J['spine_01'], J['spine_02'], 'hips')
    add('spine_02', J['spine_02'], J['chest'], 'spine_01')
    add('chest', J['chest'], J['neck'], 'spine_02')
    add('neck', J['neck'], J['head'], 'chest')
    add('head', J['head'], J['head'] + [0, 0, .17], 'neck')
    add('jaw', jaw[0], jaw[1], 'head')
    for s, side in (('l', 1), ('r', -1)):
        m = np.array([side, 1, 1])
        add('eye_' + s, eyes[side], eyes[side] + [0, -.025, 0], 'head')
        add('clavicle_' + s, J['clav'] * m, J['shoulder'] * m, 'chest')
        add('upperarm_' + s, J['shoulder'] * m, J['elbow'] * m, 'clavicle_' + s)
        add('lowerarm_' + s, J['elbow'] * m, J['wrist'] * m, 'upperarm_' + s)
        mid = (J['elbow'] * m + J['wrist'] * m) / 2
        add('forearm_twist_' + s, mid, J['wrist'] * m, 'lowerarm_' + s)
        tips, fr = hands[side]
        knuck = fr['W'] + fr['a'] * .090
        add('hand_' + s, J['wrist'] * m, knuck, 'lowerarm_' + s)
        for fname in ('index', 'middle', 'ring', 'pinky', 'thumb'):
            pts = tips[fname][0]
            chain = pts[1:] if fname != 'thumb' else pts
            for k in range(3):
                add(f'{fname}{k + 1}_{s}', chain[k], chain[k + 1], 'hand_' + s if k == 0 else f'{fname}{k}_{s}')
        grip = fr['W'] + fr['a'] * .085 - fr['c'] * .030
        add('socket_grip_' + s, grip, grip + fr['a'] * .05, 'hand_' + s, False)
        add('thigh_' + s, J['hip'] * m, J['knee'] * m, 'hips')
        add('calf_' + s, J['knee'] * m, J['ankle'] * m, 'thigh_' + s)
        add('foot_' + s, J['ankle'] * m, J['ball'] * m, 'calf_' + s)
        add('toe_' + s, J['ball'] * m, J['toe'] * m, 'foot_' + s)
    for k in range(3):
        add(f'phys_ponytail_0{k + 1}', tail[k], tail[k + 1], 'head' if k == 0 else f'phys_ponytail_0{k}')
    add('socket_head_top', J['head'] + [0, 0, .175], J['head'] + [0, 0, .22], 'head', False)
    add('socket_chest', J['chest'] + [0, -.11, .06], J['chest'] + [0, -.15, .06], 'chest', False)
    return B


# ------------------------------------------------------------------------------------------------ weights
def chain_weights(P, pts, names, blend):
    """weights along a polyline of joints pts (k+1 points) for bones names (k): arc-length windows, smooth at joints.
    blend: half-width (m) of the blend at each inner joint (k-1 values) or one value"""
    P = np.asarray(P, float)
    pts = np.asarray(pts, float)
    k = len(names)
    seg = pts[1:] - pts[:-1]
    L = np.linalg.norm(seg, axis=1)
    cum = np.concatenate([[0], np.cumsum(L)])
    # closest point on the polyline: arc length s
    best_d = np.full(len(P), 1e9)
    s = np.zeros(len(P))
    for i in range(k):
        a, d = pts[i], seg[i]
        t = np.clip(((P - a) @ d) / (d @ d), 0, 1)
        q = a + np.outer(t, d)
        dist = np.linalg.norm(P - q, axis=1)
        # beyond the chain's ends, extend
        if i == 0:
            t0 = ((P - a) @ d) / (d @ d)
            t = np.where(t0 < 0, t0, t)
        if i == k - 1:
            t1 = ((P - a) @ d) / (d @ d)
            t = np.where(t1 > 1, t1, t)
        better = dist < best_d
        best_d = np.where(better, dist, best_d)
        s = np.where(better, cum[i] + t * L[i], s)
    bl = np.broadcast_to(np.asarray(blend, float), (max(k - 1, 1),))
    W = np.zeros((len(P), k))
    for i in range(k):
        lo = sstep(cum[i] - bl[i - 1], cum[i] + bl[i - 1], s) if i > 0 else np.ones(len(P))
        hi = 1 - sstep(cum[i + 1] - bl[i], cum[i + 1] + bl[i], s) if i < k - 1 else np.ones(len(P))
        W[:, i] = lo * hi
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    return {n: W[:, i] for i, n in enumerate(names)}


def combine(*pairs):
    """weighted sum of weight dicts: pairs of (factor array, dict)"""
    out = {}
    for f, d in pairs:
        for n, w in d.items():
            out[n] = out.get(n, 0) + np.asarray(f) * w
    return out


def finalize(Wd, n):
    """top-4, normalized: returns list of (names, weights (n,4))"""
    names = list(Wd)
    M = np.stack([np.broadcast_to(np.asarray(Wd[k], float), (n,)) for k in names], 1)
    idx = np.argsort(-M, axis=1)[:, :4]
    top = np.take_along_axis(M, idx, 1)
    top /= np.maximum(top.sum(1, keepdims=True), 1e-9)
    return names, idx, top


def spine_weights(P, J):
    pts = [J['hips'] - [0, 0, .12], J['spine_01'], J['spine_02'], J['chest'], J['neck'], J['head']]
    return chain_weights(P, pts, ['hips', 'spine_01', 'spine_02', 'chest', 'neck'], [.05, .05, .06, .03])


def arm_weights(P, J, s, side, hand_pts=None):
    m = np.array([side, 1, 1])
    S, E, W = J['shoulder'] * m, J['elbow'] * m, J['wrist'] * m
    mid = (E + W) / 2
    pts = [J['clav'] * m, S, E, mid, W, W + (W - E) / np.linalg.norm(W - E) * .1]
    return chain_weights(P, pts, ['clavicle_' + s, 'upperarm_' + s, 'lowerarm_' + s, 'forearm_twist_' + s, 'hand_' + s], [.05, .045, .06, .025])


def leg_weights(P, J, s, side):
    m = np.array([side, 1, 1])
    pts = [J['hips'] + [side * .02, 0, .08], J['hip'] * m, J['knee'] * m, J['ankle'] * m, J['ball'] * m, J['toe'] * m]
    return chain_weights(P, pts, ['hips', 'thigh_' + s, 'calf_' + s, 'foot_' + s, 'toe_' + s], [.07, .06, .04, .03])


def hand_weights(P, J, s, side, tips, fr):
    """the palm to hand_*; each finger to its own chain; the wrist blends to the forearm"""
    P = np.asarray(P, float)
    W = fr['W']
    # which finger is nearest (by distance to its polyline), and how far along the hand
    out = {}
    along = (P - W) @ fr['a']
    base_w = sstep(-.03, .01, along)          # forearm -> hand at the wrist
    best = np.full(len(P), 1e9)
    best_name = np.array([''] * len(P), dtype=object)
    per = {}
    for fname in ('index', 'middle', 'ring', 'pinky', 'thumb'):
        pts = np.array(tips[fname][0])
        ch = pts[1:] if fname != 'thumb' else pts
        names = [f'{fname}{k + 1}_{s}' for k in range(3)]
        cw = chain_weights(P, np.concatenate([ch[:1] - (ch[1] - ch[0]) * .5, ch]), ['hand_' + s] + names, [.012, .007, .006])
        per[fname] = cw
        d = np.min(np.stack([np.linalg.norm(np.cross(P - ch[i], ch[i + 1] - ch[i]), axis=1) / np.linalg.norm(ch[i + 1] - ch[i]) for i in range(3)], 1), 1)
        better = d < best
        best = np.where(better, d, best)
        best_name = np.where(better, fname, best_name)
    for fname, cw in per.items():
        sel = (best_name == fname) & (best < .014)
        for n, w in cw.items():
            out[n] = out.get(n, 0) + np.where(sel, w, 0)
    rest = 1 - sum(out.values()) if out else np.ones(len(P))
    out['hand_' + s] = out.get('hand_' + s, 0) + np.clip(rest, 0, 1)
    out = {n: w * base_w for n, w in out.items()}
    out['forearm_twist_' + s] = 1 - base_w
    return out


# ------------------------------------------------------------------------------------------------ face shape keys
def face_keys(Vh, info, D, EYE, MOUTH):
    """displacements (head space) for the ARKit-style keys. Vh: head-space rest positions of the head mesh vertices.
    info: dict(upper=bool mask of upper-lid vertices per side, lower=..., lip_upper, lip_lower masks...)"""
    x, y, z = Vh[:, 0], Vh[:, 1], Vh[:, 2]
    ax = np.abs(x)
    keys = {}
    e = D['eye']
    sideL = x > 0

    def g(c, r, p=None):
        q = Vh if p is None else p
        dd = np.sqrt(((np.abs(q[:, 0]) - c[0]) / r[0]) ** 2 + ((q[:, 1] - c[1]) / r[1]) ** 2 + ((q[:, 2] - c[2]) / r[2]) ** 2)
        return np.exp(-dd * dd)

    def sided(w, s):
        return w * ((x > 0) if s > 0 else (x < 0)) + w * (np.abs(x) < 1e-6) * .5

    # --- eyelids: rotation of the lid about the eye's horizontal axis
    for s, sname in ((1, 'Left'), (-1, 'Right')):
        ce = e * [s, 1, 1]
        rel = Vh - ce
        r = np.linalg.norm(rel, axis=1)
        phi = np.arctan2(rel[:, 2], -rel[:, 1])                       # elevation around the x axis, 0 = straight ahead
        near = (r < .0215) & (np.sign(x) == s) & (rel[:, 1] < .006)
        t = np.clip((ax - EYE['m'][0]) / (EYE['l'][0] - EYE['m'][0]), 0, 1)
        import chr_head as CH
        zu = CH.almond(t, EYE['m'], EYE['l'], EYE['up'], EYE['upeak'])[:, 1]
        zl = CH.almond(t, EYE['m'], EYE['l'], EYE['lo'], EYE['lpeak'])[:, 1]
        zm = (zu + zl) / 2
        phu = np.arcsin(np.clip((zu - ce[2]) / .0132, -1, 1))
        phl = np.arcsin(np.clip((zl - ce[2]) / .0132, -1, 1))
        phc = phl + (phu - phl) * .22                                   # where the closed lids meet (low)
        upper = near & (z >= zm) & info['lid_zone'][s]
        lower = near & (z < zm) & info['lid_zone'][s]
        # upper lid: full at the margin, fading over ~0.55 rad toward the brow
        wu = np.clip(1 - (phi - phu) / .55, 0, 1) * upper
        wl = np.clip(1 - (phl - phi) / .45, 0, 1) * lower

        def rot(dphi, w):
            ang = dphi * w
            c, sn = np.cos(ang), np.sin(ang)
            ry, rz = rel[:, 1], rel[:, 2]
            ny = ry * c + rz * sn          # rotate in the y-z plane (positive ang lowers the front)
            nz = -ry * sn + rz * c
            out = np.zeros_like(Vh)
            out[:, 1] = ny - ry
            out[:, 2] = nz - rz
            return out
        blink = rot(-(phu - phc), wu) + rot((phc - phl) * .9, wl)
        keys['eyeBlink' + sname] = blink * (w_any(wu, wl)[:, None] > 0)
        keys['eyeSquint' + sname] = rot(-(phu - phc) * .18, wu) + rot((phc - phl) * .55, wl) + \
            np.outer(g((.034, -.080, .002), (.016, .02, .012)) * (np.sign(x) == s), [0, -.0006, .0018])
        keys['eyeWide' + sname] = rot((phu - phc) * .28, wu) + rot(-(phc - phl) * .15, wl)
        # brows
        bm = g((.022, -.088, .043), (.012, .02, .012)) * (np.sign(x) == s)
        bo = g((.044, -.075, .044), (.012, .02, .012)) * (np.sign(x) == s)
        bb = g((.032, -.083, .044), (.024, .025, .016)) * (np.sign(x) == s)
        keys['browDown' + sname] = np.outer(bb, [0, .0004, -.0026]) + np.outer(bm, [-.0016 * s, 0, -.0006])
        keys['browOuterUp' + sname] = np.outer(bo, [0, 0, .0034])
        # mouth corners and cheeks
        corner = g((.0245, -.087, -.041), (.012, .016, .012)) * (np.sign(x) == s)
        cheek = g((.032, -.076, -.010), (.016, .02, .016)) * (np.sign(x) == s)
        upl = g((.016, -.096, -.036), (.010, .012, .006)) * (np.sign(x) == s)
        keys['mouthSmile' + sname] = np.outer(corner, [.0042 * s, .0040, .0056]) + np.outer(cheek, [.0010 * s, -.0014, .0032]) + \
            np.outer(upl, [.0010 * s, .0010, .0012]) + rot((phc - phl) * .25, wl)
        keys['mouthFrown' + sname] = np.outer(corner, [.0008 * s, .0004, -.0030])
        keys['mouthStretch' + sname] = np.outer(corner, [.0034 * s, .0016, -.0010])
        lipband = g((.012, -.096, -.0405), (.016, .012, .008)) * (np.sign(x) == s)
        keys['mouthPress' + sname] = np.outer(lipband * (z > MOUTH['z']), [0, .0004, -.0007]) + np.outer(lipband * (z <= MOUTH['z']), [0, .0004, .0008])
        keys['cheekSquint' + sname] = np.outer(cheek, [0, -.0004, .0022]) + rot((phc - phl) * .35, wl)
        keys['noseSneer' + sname] = np.outer(g((.011, -.097, -.012), (.007, .01, .008)) * (np.sign(x) == s), [.0003 * s, 0, .0016])
    # --- whole-face keys
    keys['browInnerUp'] = np.outer(g((.010, -.090, .044), (.016, .02, .014)), [0, -.0004, .0032])
    mouth_w = g((0, -.098, -.0405), (.030, .016, .014))
    centre = mouth_w * (1 - (ax / .025) ** 2).clip(0, 1)
    keys['mouthPucker'] = np.outer(centre, [0, -.0042, 0]) - np.outer(mouth_w * np.clip(ax / .025, 0, 1), [0, 0, 0]) + \
        np.stack([-x * .30 * mouth_w, np.zeros_like(x), np.zeros_like(x)], 1)
    keys['mouthFunnel'] = keys['mouthPucker'] * .6 + np.outer(mouth_w * (z > MOUTH['z']), [0, -.0008, .0014]) + np.outer(mouth_w * (z <= MOUTH['z']), [0, -.0008, -.0016])
    keys['mouthUpperUp'] = np.outer(g((.010, -.100, -.034), (.018, .012, .006)), [0, -.0004, .0018])
    keys['mouthLowerDown'] = np.outer(g((.010, -.098, -.048), (.018, .012, .007)), [0, -.0004, -.0020])
    keys['mouthClose'] = np.outer(g((.010, -.099, -.035), (.018, .012, .005)), [0, 0, -.0010]) + np.outer(g((.010, -.097, -.047), (.018, .012, .006)), [0, 0, .0010])
    keys['cheekPuff'] = np.outer(g((.034, -.070, -.028), (.016, .02, .016)), [0, 0, 0]) + np.stack([np.sign(x) * .0030 * g((.034, -.070, -.028), (.016, .02, .016)), -.0010 * g((.034, -.070, -.028), (.016, .02, .016)), np.zeros_like(x)], 1)
    # --- jawOpen: the mandible rotates about the joints in front of the ears; the lower lip, chin and floor of the mouth
    # follow fully, the cheeks blend
    jw = info['jaw_w']
    piv = np.array([0, -.004, -.010])
    ang = .28
    rel = Vh - piv
    c, sn = math.cos(ang), math.sin(ang)
    ny = rel[:, 1] * c - rel[:, 2] * sn
    nz = rel[:, 1] * sn + rel[:, 2] * c
    jo = np.zeros_like(Vh)
    jo[:, 1] = (ny - rel[:, 1]) * jw
    jo[:, 2] = (nz - rel[:, 2]) * jw
    keys['jawOpen'] = jo
    return keys


def w_any(a, b):
    return np.maximum(a, b)


def jaw_mask(Vh, lower_lip_ids, upper_lip_ids):
    """1 on the mandible (below the mouth line, in front of the ramus), 0 on the maxilla; smooth blend on the cheeks"""
    x, y, z = Vh[:, 0], Vh[:, 1], Vh[:, 2]
    ax = np.abs(x)
    # the boundary: the mouth line, rising behind the corners toward the jaw joint
    zb = -.0405 + .030 * sstep(.022, .050, ax) * sstep(-.09, -.02, y)
    w = 1 - sstep(zb - .006, zb + .004, z)
    # the neck below the chin moves partly; the throat and below do not
    w *= 1 - sstep(-.03, .02, y) * sstep(-.09, -.115, z) * 0
    w *= 1 - sstep(-.105, -.140, z)
    w *= 1 - sstep(-.030, -.006, y)                 # nothing behind the jaw joint (the ears, the back of the neck)
    w[upper_lip_ids] = 0
    w[lower_lip_ids] = 1
    return w
