"""Textures for the supporting cast, generated here (numpy + Pillow): original work, no photographs, no scans.

  head skin  baked from the head's own 3D shape: every texel knows where on the face it lies (the head mesh rasterized
             into UV space), so colour is painted by anatomy: warmth over the cheeks, nose and ears, the lips, a faint
             darkening under the eyes, the brows (directional strokes), the scalp under the hair, fine mottling
  body skin  a tile for the arms and hands, matched to the face's mean tone
  eye        sclera, limbal ring, a warm brown iris with radial fibres, the pupil
  hair       strands along v (albedo + alpha for the cards), root-to-end variation
  jersey     cotton jersey knit (the shirt), its normal map
  denim      3x1 twill (the jeans), its normal map
  canvas     the shoes' canvas
All colours are sRGB in the files; base colours come from the character's spec (cast.js).
"""
import math
import numpy as np
from PIL import Image


def srgb(hexv):
    return np.array([(hexv >> 16) & 255, (hexv >> 8) & 255, hexv & 255], float) / 255


def noise2(shape, scale, seed, octaves=4):
    """smooth value noise, tiling, in [0, 1]"""
    rng = np.random.default_rng(seed)
    H, W = shape
    out = np.zeros(shape)
    amp, tot = 1., 0.
    for o in range(octaves):
        s = max(1, int(scale * 2 ** o))
        g = rng.random((s, s))
        yy = np.linspace(0, s, H, endpoint=False)
        xx = np.linspace(0, s, W, endpoint=False)
        y0 = np.floor(yy).astype(int)
        x0 = np.floor(xx).astype(int)
        ty = yy - y0
        tx = xx - x0
        ty = ty * ty * (3 - 2 * ty)
        tx = tx * tx * (3 - 2 * tx)
        a = g[y0[:, None] % s, x0[None, :] % s]
        b = g[y0[:, None] % s, (x0[None, :] + 1) % s]
        c = g[(y0[:, None] + 1) % s, x0[None, :] % s]
        d = g[(y0[:, None] + 1) % s, (x0[None, :] + 1) % s]
        v = (a * (1 - tx) + b * tx) * (1 - ty[:, None]) + (c * (1 - tx) + d * tx) * ty[:, None]
        out += v * amp
        tot += amp
        amp *= .5
    return out / tot


def noise3(P, freq, seed=0, octaves=3):
    """smooth 3D value noise at points P (..., 3), in [0, 1]"""
    out = np.zeros(P.shape[:-1])
    amp, tot = 1., 0.
    for o in range(octaves):
        q = P * freq * 2 ** o + seed * 17.13 + o * 3.7
        i0 = np.floor(q)
        f = q - i0
        f = f * f * (3 - 2 * f)
        acc = 0
        for dx in (0, 1):
            for dy in (0, 1):
                for dz in (0, 1):
                    h = np.sin((i0[..., 0] + dx) * 127.1 + (i0[..., 1] + dy) * 311.7 + (i0[..., 2] + dz) * 74.7 + seed * 13.3) * 43758.5453
                    h = h - np.floor(h)
                    w = (f[..., 0] if dx else 1 - f[..., 0]) * (f[..., 1] if dy else 1 - f[..., 1]) * (f[..., 2] if dz else 1 - f[..., 2])
                    acc = acc + h * w
        out += acc * amp
        tot += amp
        amp *= .5
    return out / tot


def save(arr, path, alpha=None, quality=None):
    a = np.clip(arr * 255 + .5, 0, 255).astype(np.uint8)
    if alpha is not None:
        a = np.dstack([a, np.clip(alpha * 255 + .5, 0, 255).astype(np.uint8)])
    im = Image.fromarray(a)
    if path.endswith('.jpg'):
        im.convert('RGB').save(path, quality=quality or 90, optimize=True)
    else:
        im.save(path, optimize=True)
    return path


def normal_from_height(h, strength):
    gy, gx = np.gradient(h)
    n = np.dstack([-gx * strength, -gy * strength, np.ones_like(h)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return n * .5 + .5


def blur(a, sigma):
    """separable gaussian blur (texels)"""
    r = max(1, int(sigma * 3))
    k = np.exp(-(np.arange(-r, r + 1) / sigma) ** 2 / 2)
    k /= k.sum()
    out = np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 1, out)


# ------------------------------------------------------------------------------------------------ rasterizer
def raster_positions(V, F, UV, size, attr=None):
    """rasterize triangles in UV space; returns (positions (S,S,3), mask (S,S)). F: index lists, UV per corner."""
    S = size
    P = np.zeros((S, S, 3))
    M = np.zeros((S, S), bool)
    V = np.asarray(V)
    for f, uv in zip(F, UV):
        for tri in ((0, 1, 2), (0, 2, 3)) if len(f) == 4 else ((0, 1, 2),):
            a, b, c = (np.array(uv[t]) * [S, S] for t in tri)
            a = np.array([a[0], (1 - uv[tri[0]][1]) * S])
            b = np.array([b[0], (1 - uv[tri[1]][1]) * S])
            c = np.array([c[0], (1 - uv[tri[2]][1]) * S])
            x0, x1 = int(max(0, math.floor(min(a[0], b[0], c[0])) - 1)), int(min(S - 1, math.ceil(max(a[0], b[0], c[0])) + 1))
            y0, y1 = int(max(0, math.floor(min(a[1], b[1], c[1])) - 1)), int(min(S - 1, math.ceil(max(a[1], b[1], c[1])) + 1))
            if x1 < x0 or y1 < y0:
                continue
            xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
            v0, v1 = b - a, c - a
            den = v0[0] * v1[1] - v1[0] * v0[1]
            if abs(den) < 1e-12:
                continue
            px, py = xs - a[0], ys - a[1]
            l1 = (px * v1[1] - v1[0] * py) / den
            l2 = (v0[0] * py - px * v0[1]) / den
            l0 = 1 - l1 - l2
            ins = (l0 >= -.02) & (l1 >= -.02) & (l2 >= -.02)
            if not ins.any():
                continue
            pa, pb, pc = V[f[tri[0]]], V[f[tri[1]]], V[f[tri[2]]]
            pos = l0[..., None] * pa + l1[..., None] * pb + l2[..., None] * pc
            sub = P[y0:y1 + 1, x0:x1 + 1]
            sm = M[y0:y1 + 1, x0:x1 + 1]
            sub[ins] = pos[ins]
            sm[ins] = True
    # dilate to fill seams
    for _ in range(4):
        miss = ~M
        if not miss.any():
            break
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            sh = np.roll(np.roll(M, dy, 0), dx, 1)
            take = miss & sh
            P[take] = np.roll(np.roll(P, dy, 0), dx, 1)[take]
            M = M | take
            miss = ~M
    return P, M


# ------------------------------------------------------------------------------------------------ head skin
def head_skin(Ppos, mask, spec, hair_mask_fn, eye_c, size, seed=3):
    """paint the face from texel positions (head space)."""
    S = size
    x, y, z = Ppos[..., 0], Ppos[..., 1], Ppos[..., 2]
    ax = np.abs(x)
    base = srgb(spec['skin'])
    col = np.broadcast_to(base, (S, S, 3)).copy()

    def g(c, r):
        d = np.sqrt(((ax - c[0]) / r[0]) ** 2 + ((y - c[1]) / r[1]) ** 2 + ((z - c[2]) / r[2]) ** 2)
        return np.exp(-d * d)

    def tint(w, rgb, k=1.):
        nonlocal col
        col = col * (1 - (w * k)[..., None]) + np.asarray(rgb) * (w * k)[..., None]
    warm = base * np.array([1.04, .90, .86])
    tint(g((.034, -.080, -.004), (.020, .025, .018)), warm, .55)        # cheeks
    tint(g((0, -.115, -.012), (.012, .016, .012)), warm * [1.02, .96, .96], .45)   # nose tip
    tint(g((.072, .010, .005), (.010, .030, .035)), warm, .45)          # ears
    tint(g((0, -.092, .060), (.035, .03, .02)), base * [1.03, 1.01, .97], .25)     # forehead, a touch lighter
    tint(g((.030, -.082, .012), (.014, .012, .005)), base * [.86, .80, .82], .40)  # under the eyes
    tint(g((.026, -.074, .033), (.016, .01, .006)), base * [.93, .86, .84], .35)   # upper lid, a little warmer and darker
    tint(g((0, -.092, -.075), (.022, .02, .018)), base * [1.0, .97, .95], .2)      # chin
    # lips: the vermilion (upper lip above the stomion down to its border; the lower lip), soft at the corners
    lips = srgb(spec['lips'])
    zst = -.0405
    up = (z > zst - .0003) & (z < -.0300 - .0030 * np.clip(ax / .022, 0, 1) ** 1.5 + .0007 * np.exp(-((ax - .0045) / .002) ** 2))
    lo = (z <= zst + .0003) & (z > -.0505 + .0062 * np.clip(ax / .021, 0, 1) ** 1.6)
    wl = ((up | lo) & (ax < .0238) & (y < -.088)).astype(float)
    wl *= np.clip((.0238 - ax) / .004, 0, 1)
    wl = blur(wl, 1.2)
    tint(wl, lips, .62)
    # lip lines (fine vertical creases) and a soft shine band on the lower lip
    ll = (np.sin(ax * 2400 + noise3(Ppos, 300, seed) * 6) * .5 + .5) ** 6
    tint(wl * ll, lips * .85, .15)
    # mouth corners: a little shadow
    tint(g((.0245, -.087, -.0408), (.003, .004, .003)), base * .7, .35)
    # nostrils
    for sx in (1,):
        nos = np.exp(-(((ax - .0072) / .0034) ** 2 + ((y + .1035) / .0042) ** 2 + ((z + .0205) / .0017) ** 2))
        tint(nos, np.array([.20, .10, .08]), .85)
    # brows: an arch from the medial head to the tail, strokes running out and up then out and down
    bx0, bx1 = .012, .051
    t = np.clip((ax - bx0) / (bx1 - bx0), 0, 1)
    zc = .0388 + .0064 * np.sin(math.pi * np.clip(t * 1.25, 0, 1)) ** .9 - .0035 * t ** 2
    thick = .0036 * (1 - .6 * t) + .0008
    inb = np.exp(-((z - zc) / thick) ** 4) * (ax > bx0 - .002) * (ax < bx1 + .002) * (y < -.06)
    inb *= np.clip((ax - bx0 + .002) / .004, 0, 1) * np.clip((bx1 + .002 - ax) / .004, 0, 1)
    # stroke texture: lines at an angle that turns along the brow
    ang = .9 - 1.3 * t
    sv = np.sin((ax * np.cos(ang) + (z - zc) * np.sin(ang)) * 5200 + noise3(Ppos, 400, seed + 1) * 8)
    strokes = np.clip(sv * .5 + .5, 0, 1) ** 2.2
    bw = inb * (.60 + .40 * strokes) * (.85 + .3 * noise3(Ppos, 120, seed + 2))
    tint(np.clip(bw, 0, 1), srgb(spec['brow']), .80)
    # lash line: the lid margins darken a little where the lashes root
    # scalp under the hair: hair-root colour so no skin shows between clumps
    depth = hair_mask_fn(Ppos)                       # radians above the hairline (negative below it)
    hm = np.clip((depth + .005) / .03, 0, 1)
    tint(hm, srgb(spec['hair']) * .62, .92)
    # hairline: fine baby hairs, a soft darker stipple a few millimetres either side of the line
    edge = np.exp(-((depth + .004) / .012) ** 2) * (depth < .02) * (y < .07)
    spk = np.clip((noise3(Ppos, 1100, seed + 5, 1) - .45) * 3, 0, 1)
    tint(edge * spk * .55, srgb(spec['hair']) * .75, .6)
    # mottling, pores, a few faint freckles across the nose and cheeks
    mot = noise3(Ppos, 45, seed + 7) - .5
    col *= (1 + .05 * mot)[..., None]
    pores = noise3(Ppos, 1400, seed + 9, 2) - .5
    col *= (1 + .012 * pores)[..., None]
    fr = np.clip((noise3(Ppos, 520, seed + 11, 1) - .80) * 6, 0, 1) * g((.030, -.095, .000), (.035, .02, .02))
    tint(fr * .4, base * [.84, .72, .62], .3)
    # special patches: lid margin (pinkish, wet) and mouth interior (dark), at the atlas corner (u .975-.99, v .985-.99)
    col[0:int(S * .02), int(S * .968):int(S * .985)] = [.34, .13, .11]
    col[0:int(S * .02), int(S * .985):] = [.78, .52, .46]
    return np.clip(col, 0, 1), pores


# ------------------------------------------------------------------------------------------------ simple tiles
def body_skin(spec, S=512, seed=21):
    base = srgb(spec['skin'])
    n = noise2((S, S), 6, seed) - .5
    p = noise2((S, S), 90, seed + 1, 2) - .5
    col = base[None, None] * (1 + .05 * n[..., None] + .025 * p[..., None])
    return np.clip(col, 0, 1), normal_from_height(p, 3.0)


def eye_tex(spec, S=512, seed=31):
    """spherical map: v = 0 at the cornea apex .. 1 at the back; u around"""
    yy, xx = np.mgrid[0:S, 0:S]
    v = (yy + .5) / S
    u = (xx + .5) / S
    ang = v * math.pi                                   # angle from the visual axis
    r_iris, r_pupil = math.asin(.0059 / .0119), math.asin(.0024 / .0119)
    scl = np.array([.90, .86, .82]) * (1 - .06 * (ang / math.pi))[..., None]
    col = np.broadcast_to(scl, (S, S, 3)).copy() if scl.ndim == 3 else np.ones((S, S, 3)) * scl
    # faint veins toward the corners
    vein = (noise2((S, S), 40, seed, 3) > .62) * np.clip((ang - .6) / .6, 0, 1)
    col = col * (1 - .12 * vein[..., None]) + np.array([.75, .35, .30]) * .12 * vein[..., None]
    iris = srgb(spec['iris'])
    fib = noise2((S, S), 4, seed + 1, 1)
    radial = np.sin(u * 2 * math.pi * 90 + fib * 9) * .5 + .5
    rr = ang / r_iris
    ic = iris * (1.25 - .55 * rr)[..., None] * (.8 + .4 * radial[..., None])
    ic = ic * (1 + .35 * np.exp(-((rr - .55) / .12) ** 2))[..., None] * np.array([1.12, 1.0, .85])
    ins = rr < 1
    col[ins] = ic[ins]
    limb = np.exp(-((rr - 1) / .06) ** 2)
    col = col * (1 - .7 * limb[..., None]) + np.array([.08, .05, .035]) * .7 * limb[..., None]
    pup = ang < r_pupil
    col[pup] = [.02, .015, .012]
    return np.clip(col, 0, 1)


def hair_tex(spec, W=512, Hh=1024, seed=41):
    """strands along v; alpha for the cards (tapered at the card's sides and its end)"""
    base = srgb(spec['hair']) * spec.get('hair_tone', 1.)      # the texture's average sits on the spec colour after shading
    xx = np.arange(W)
    rng = np.random.default_rng(seed)
    strand = np.zeros((Hh, W))
    alpha = np.zeros((Hh, W))
    lum = noise2((1, W), 64, seed, 3)[0]
    for k in range(220):
        c = rng.uniform(0, W)
        w = rng.uniform(.6, 1.8)
        L = rng.uniform(.55, 1.0)
        prof = np.exp(-(((xx - c + W / 2) % W - W / 2) / w) ** 2)
        tone = rng.uniform(-.35, .35)
        vv = np.arange(Hh) / Hh
        along = (vv < L).astype(float) * (1 - np.clip((vv - L + .15) / .15, 0, 1))
        strand += np.outer(along, prof) * tone
        alpha = np.maximum(alpha, np.outer(along, prof) * rng.uniform(.6, 1))
    strand = strand / max(1e-6, np.abs(strand).max())
    vv = (np.arange(Hh) / Hh)[:, None]
    col = base[None, None] * (1 + .45 * strand[..., None] + .30 * (lum[None, :, None] - .5))
    col *= (1 - .18 * np.exp(-vv * 6))[..., None]                  # darker at the roots
    col *= (1 + .10 * vv)[..., None]                              # sun-lightened ends
    # card alpha: dense in the middle of the card's width, thinning to the sides and the tip
    uu = (xx / W)[None, :]
    side = np.clip(1 - np.abs((uu * 4) % 1 - .5) * 2.2, 0, 1)      # cards use a quarter of u each
    a = np.clip(alpha * 1.6, 0, 1) * np.clip(side * 1.8, 0, 1) * np.clip((1 - vv) * 6, 0, 1)
    a = np.clip(a + side ** 3 * .6 * (vv < .8), 0, 1)
    nrm = normal_from_height(strand, 2.0)
    return np.clip(col, 0, 1), a, nrm


def jersey(color_hex, S=512, seed=51):
    """cotton jersey: rows of small V stitches, a faint heathering, slightly sun-faded"""
    yy, xx = np.mgrid[0:S, 0:S] / S
    k = 96
    st = np.abs(np.sin(xx * math.pi * k + np.sign(np.sin(yy * math.pi * k * 1.3)) * .6)) ** .6
    rows = .5 + .5 * np.sin(yy * math.pi * k * 1.3 * 2)
    h = st * .6 + rows * .4
    heat = noise2((S, S), 60, seed, 2)
    base = srgb(color_hex)
    col = base[None, None] * (.90 + .14 * h[..., None] + .06 * (heat[..., None] - .5))
    return np.clip(col, 0, 1), normal_from_height(h, 2.5)


def denim(color_hex, S=512, seed=61):
    """3x1 right-hand twill in indigo over white weft, a little wear"""
    yy, xx = np.mgrid[0:S, 0:S] / S
    k = 110
    tw = (np.sin((xx + yy * .55) * math.pi * k) * .5 + .5) ** 1.5
    weft = (np.sin(yy * math.pi * k * 2.2) * .5 + .5) ** 3
    slub = noise2((S, S), 12, seed, 3)
    base = srgb(color_hex)
    col = base[None, None] * (.82 + .28 * tw[..., None]) + np.array([.55, .58, .62])[None, None] * .10 * weft[..., None]
    col *= (.94 + .12 * slub[..., None])
    h = tw * .7 + weft * .3
    return np.clip(col, 0, 1), normal_from_height(h, 2.0)


def canvas(color_hex, S=256, seed=71):
    yy, xx = np.mgrid[0:S, 0:S] / S
    w = (np.sin(xx * math.pi * 64) * np.sin(yy * math.pi * 64)) * .5 + .5
    base = srgb(color_hex)
    col = base[None, None] * (.85 + .3 * w[..., None]) * (.95 + .1 * noise2((S, S), 8, seed)[..., None])
    return np.clip(col, 0, 1), normal_from_height(w, 1.5)
