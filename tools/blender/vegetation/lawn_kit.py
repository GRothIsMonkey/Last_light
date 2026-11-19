"""Lawn kit (numpy + Pillow; no bpy): the grass-and-ground repair of the Prologue vegetation benchmark.

What made the first benchmark's lawns read as "a flat green slab with clumps on it": the ground was one flat colour (a
few large noise blotches on top), and the 3D grass was a few thousand separate tufts of big blades, each its own little
bush, standing on that colour. Nothing tied the two together. This kit makes the ground itself grass and makes the 3D
grass a continuous field of fine blades that takes its colour from the ground under each blade:

  textures (all tileable, top-down, physically scaled):
    lawn     mown suburban lawn, 0.5 m tile, 1024 px (0.49 mm/px): ~26,000 blades in five depth layers (deep blades
             dark, top blades lit, cut tips, a little thatch), RGB + height in alpha; normal map from the height
    meadow   the lookout's unmown grass, 1.0 m tile: longer blades lying every way, straw, seed heads
    soil     trodden earth, 1.0 m tile: fine clods, grit, pebbles, flattened dead grass, a few roots
    clover   white clover, 0.5 m tile, 512 px: trefoil leaves with their pale chevron, a few flower heads; alpha = cover
  geometry:
    tile     one 1 m x 1 m patch of short lawn blades (Poisson-disk roots, toroidal, so neighbouring tiles join without
             seams), blades sorted by a random rank so a prefix of the index buffer is a sparser tile (LODs are draw
             ranges, nothing pops); per vertex: _LAWN = (root x, root z, rank, random), _BLADE = (t along the blade,
             side -1..1, width, height) for the runtime shader, which shapes, colours, sways and thins them.

    python tools/blender/vegetation/lawn_kit.py [textures] [preview] [glb]
"""
import json
import math
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_paths  # noqa: E402

ROOT = veg_paths.ROOT
LAWN_SRC = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'lawn')
TEXDIR = os.path.join(LAWN_SRC, 'textures')


# ---------------------------------------------------------------------------------------------------- colour helpers
def s2l(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def l2s(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def hexrgb(h):
    return s2l(np.array([(h >> 16) & 255, (h >> 8) & 255, h & 255]) / 255.0)


def tile_noise(n, scale, seed, octaves=4, persistence=.5):
    """Tileable band-limited noise in [0,1]."""
    rng = np.random.default_rng(seed)
    out = np.zeros((n, n))
    amp, tot = 1.0, 0.0
    fy, fx = np.meshgrid(np.fft.fftfreq(n) * n, np.fft.fftfreq(n) * n, indexing='ij')
    r = np.hypot(fx, fy)
    for o in range(octaves):
        f0 = scale * 2 ** o
        band = np.exp(-((r - f0) / (f0 * .5 + 1e-9)) ** 2)
        layer = np.real(np.fft.ifft2(band * np.exp(1j * rng.uniform(0, 2 * np.pi, (n, n)))))
        layer /= (np.abs(layer).max() + 1e-12)
        out += amp * layer
        tot += amp
        amp *= persistence
    out /= tot
    return (out - out.min()) / (np.ptp(out) + 1e-12)


def normal_from_height(h, strength):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * .5
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * .5
    nx, ny, nz = -gx * strength, gy * strength, np.ones_like(h)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx / l * .5 + .5, ny / l * .5 + .5, nz / l * .5 + .5], -1)


# ---------------------------------------------------------------------------------------------------- the blade painter
class Canvas:
    """A tileable supersampled canvas with a height (z) buffer: blades are painted with per-pixel colour along and across
    the blade, and only where they stand higher than what is already there (deep layers first)."""

    def __init__(self, n, bg_lin, bg_h=0.0):
        self.n = n
        self.col = np.empty((n, n, 3))
        self.col[:] = bg_lin
        self.h = np.full((n, n), bg_h)

    def blade(self, root, direction, length, width, curl, z0, dz, col_base, col_tip, tip=None, tip_len=0.0, flat_tip=False, ridge=.04):
        """root/direction in px; length/width px; curl: sideways bow (fraction of length); z0..z0+dz height along it;
        colours linear RGB at base and tip; tip: optional colour for the last tip_len of the blade (cut or dry ends)."""
        n = self.n
        dx, dy = direction
        px, py = -dy, dx
        a = np.array([dx * length, dy * length])
        b = np.array([px * curl * length, py * curl * length])
        pts = np.array([root + a * t + b * t * t for t in np.linspace(0, 1, 9)])
        x0, y0 = np.floor(pts.min(0) - width).astype(int)
        x1, y1 = np.ceil(pts.max(0) + width).astype(int)
        if x1 - x0 < 1 or y1 - y0 < 1:
            return
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        P = np.stack([xs, ys], -1).astype(np.float64)
        # nearest point on the polyline (8 segments)
        best_d = np.full(xs.shape, 1e9)
        best_t = np.zeros(xs.shape)
        for i in range(8):
            p0, p1 = pts[i], pts[i + 1]
            seg = p1 - p0
            L2 = max(seg @ seg, 1e-9)
            u = np.clip(((P - p0) @ seg) / L2, 0, 1)
            q = p0 + u[..., None] * seg
            d = np.hypot(*(P - q).transpose(2, 0, 1))
            m = d < best_d
            best_d = np.where(m, d, best_d)
            best_t = np.where(m, (i + u) / 8, best_t)
        t = best_t
        half = width * .5 * ((1 - .45 * t) if flat_tip else (1 - .85 * t ** 1.4))
        inside = best_d < half
        if not inside.any():
            return
        across = np.clip(best_d / np.maximum(half, 1e-6), 0, 1)
        hz = z0 + dz * t + ridge * (1 - across ** 2)
        yi, xi = ys % n, xs % n
        cur = self.h[yi, xi]
        w = inside & (hz > cur)
        if not w.any():
            return
        c = col_base[None, None, :] * (1 - t[..., None]) + col_tip[None, None, :] * t[..., None]
        c = c * (1.0 + .10 * (1 - across[..., None] ** 2) - .06 * across[..., None])   # a lit midrib, darker edges
        if tip is not None and tip_len > 0:
            k = np.clip((t - (1 - tip_len)) / max(tip_len, 1e-6), 0, 1)[..., None]
            c = c * (1 - k) + tip[None, None, :] * k
        self.col[yi[w], xi[w]] = c[w]
        self.h[yi[w], xi[w]] = hz[w]

    def down(self, f):
        if f == 1:                                        # painted at 1x (blades are 5-8 px wide): soften the edges only
            col = ndimage.gaussian_filter(self.col, (.45, .45, 0), mode='wrap')
            return col, ndimage.gaussian_filter(self.h, .45, mode='wrap')
        n = self.n // f
        col = self.col.reshape(n, f, n, f, 3).mean((1, 3))
        h = self.h.reshape(n, f, n, f).mean((1, 3))
        return col, h


def unit(a):
    return np.array([math.cos(a), math.sin(a)])


# ---------------------------------------------------------------------------------------------------- the textures
LAWN_PAL = dict(
    soil=0x2a2a1c, thatch=0x6e6648,
    greens=[0x56702f, 0x5f7a33, 0x4f6a30, 0x68823a, 0x5a7536, 0x4c6534, 0x6f8640],   # late-August cool-season lawn
    tip_cut=0x7f8558, tip_dry=0x86804f)


def lawn(n=1024, tile_m=0.5, seed=2011, layers=5, density=1.0):
    """Mown lawn seen from above: mostly upright blades (short projected strokes), some lying, deep blades in shade."""
    rng = np.random.default_rng(seed)
    S = 1
    N = n * S
    mm = N / (tile_m * 1000)                       # px per mm on the canvas
    cv = Canvas(N, hexrgb(LAWN_PAL['soil']) * .8)
    greens = [hexrgb(g) for g in LAWN_PAL['greens']]
    thatch, tip_cut, tip_dry = hexrgb(LAWN_PAL['thatch']), hexrgb(LAWN_PAL['tip_cut']), hexrgb(LAWN_PAL['tip_dry'])
    per_layer = int(5200 * density * (tile_m / .5) ** 2)
    # a soft patchiness of colour inside the tile (fertility, a slightly thinner spot) so a single tile is not uniform
    patch = tile_noise(64, 2, seed + 1, octaves=2)
    for L in range(layers):
        depth = L / (layers - 1)                     # 0 deep .. 1 top
        light = .22 + .78 * depth ** .8
        for _ in range(per_layer):
            root = rng.uniform(0, N, 2)
            pv = patch[int(root[1] / N * 64) % 64, int(root[0] / N * 64) % 64]
            if rng.random() < .07 * (1 - depth) + .015:         # thatch and dead blades, mostly deep
                base = thatch * rng.uniform(.7, 1.1)
                tipc = base * 1.15
            else:
                g = greens[rng.integers(len(greens))] * rng.uniform(.88, 1.12) * (0.96 + .08 * pv)
                base, tipc = g * .78, g * 1.12
            elev = math.radians(rng.uniform(35, 84) if rng.random() < .85 else rng.uniform(8, 30))
            blade_len = rng.uniform(40, 95) * mm
            proj = max(blade_len * math.cos(elev), 2.5 * mm)
            width = rng.uniform(2.4, 4.2) * mm
            cut = rng.random() < .22 and depth > .5
            cv.blade(root, unit(rng.uniform(0, 2 * math.pi)), proj, width, rng.uniform(-.25, .25),
                     z0=depth * .8 + rng.uniform(0, .05), dz=.18 * math.sin(elev) + .02, col_base=base * light, col_tip=tipc * light,
                     tip=(tip_cut if rng.random() < .6 else tip_dry) * light if cut else None, tip_len=.08, flat_tip=cut)
    col, h = cv.down(S)
    return col, h


def meadow(n=1024, tile_m=1.0, seed=1958, layers=5):
    """Unmown late-summer grass seen from above: long blades lying every way, straw, seed heads, deep shade."""
    rng = np.random.default_rng(seed)
    S = 1
    N = n * S
    mm = N / (tile_m * 1000)
    cv = Canvas(N, hexrgb(0x2a2618) * .8)
    greens = [hexrgb(g) for g in (0x5b6d30, 0x667634, 0x52652e, 0x707a3a, 0x5e6b38)]
    straws = [hexrgb(g) for g in (0x9a8a58, 0x8a7a4c, 0xa69a68, 0x7d7048)]
    seedc = hexrgb(0x8e7f55)
    per_layer = int(2600 * (tile_m / 1.0) ** 2)
    for L in range(layers):
        depth = L / (layers - 1)
        light = .30 + .70 * depth ** .8
        for _ in range(per_layer):
            root = rng.uniform(0, N, 2)
            dry = rng.random() < .22 + .1 * depth
            c = (straws[rng.integers(len(straws))] if dry else greens[rng.integers(len(greens))]) * rng.uniform(.85, 1.12)
            elev = math.radians(rng.uniform(10, 70))
            blade_len = rng.uniform(80, 260) * mm
            width = rng.uniform(2.5, 5.5) * mm
            cv.blade(root, unit(rng.uniform(0, 2 * math.pi)), max(blade_len * math.cos(elev), 4 * mm), width, rng.uniform(-.35, .35),
                     z0=depth * .8, dz=.2, col_base=c * .7 * light, col_tip=c * 1.1 * light)
            if depth > .6 and rng.random() < .04:                       # a seed head
                cv.blade(root + unit(rng.uniform(0, 6.28)) * rng.uniform(5, 40) * mm, unit(rng.uniform(0, 6.28)), rng.uniform(12, 30) * mm,
                         rng.uniform(3.5, 6) * mm, rng.uniform(-.1, .1), z0=depth * .8 + .1, dz=.05, col_base=seedc * light, col_tip=seedc * 1.15 * light, ridge=.08)
    return cv.down(S)


def soil(n=1024, tile_m=1.0, seed=77):
    """Trodden earth: fine clods and grit, pebbles, small cracks, flattened dead grass and a few roots."""
    rng = np.random.default_rng(seed)
    S = 1
    N = n * S
    mm = N / (tile_m * 1000)
    base = tile_noise(N, 3, seed, octaves=6, persistence=.55)
    fine = tile_noise(N, 90, seed + 1, octaves=3, persistence=.6)
    clod = tile_noise(N, 22, seed + 2, octaves=3, persistence=.5)
    c0, c1, c2 = hexrgb(0x4a3d2b), hexrgb(0x6e5b42), hexrgb(0x5b4c38)
    k = np.clip(base * .7 + fine * .3, 0, 1)[..., None]
    col = c0 * (1 - k) + c1 * k
    col = col * (.82 + .3 * clod[..., None]) * (.9 + .2 * fine[..., None])
    h = .3 * base + .25 * clod + .15 * fine
    # cracks: thin dark lines along the valleys of a cellular pattern
    from scipy.spatial import cKDTree
    pts = rng.uniform(0, N, (90, 2))
    tiles = np.concatenate([pts + np.array([dx, dy]) * N for dx in (-1, 0, 1) for dy in (-1, 0, 1)])
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float64)
    warp = (tile_noise(N, 8, seed + 5, octaves=3) - .5) * 60
    q = np.stack([(xx + warp).ravel(), (yy - warp).ravel()], 1)
    d, _ = cKDTree(tiles).query(q, k=2, workers=-1)
    edge = (d[:, 1] - d[:, 0]).reshape(N, N)
    crack = np.clip(1 - edge / (1.2 * mm), 0, 1) * (tile_noise(N, 6, seed + 6, octaves=2) > .45)
    col *= (1 - .45 * crack[..., None])
    h -= .25 * crack
    cv = Canvas(N, 0)
    cv.col, cv.h = col, h
    # pebbles and grit
    for _ in range(int(900 * tile_m ** 2)):
        r = rng.uniform(.8, 7.5 if rng.random() < .15 else 3) * mm
        g = hexrgb([0x8a8478, 0x6f675a, 0x9b8f7a, 0x5d564b][rng.integers(4)]) * rng.uniform(.85, 1.1)
        cv.blade(rng.uniform(0, N, 2), unit(rng.uniform(0, 6.28)), r * .6, r * 2, 0, z0=.6, dz=.02, col_base=g, col_tip=g * 1.08, flat_tip=True, ridge=.25)
    # flattened dead grass and a few green survivors, and thin roots
    straw = [hexrgb(x) for x in (0x9a8a5a, 0x857447, 0xa89c6c)]
    for _ in range(int(1400 * tile_m ** 2)):
        c = straw[rng.integers(3)] * rng.uniform(.8, 1.1) if rng.random() < .8 else hexrgb(0x5a6c30) * rng.uniform(.8, 1.1)
        cv.blade(rng.uniform(0, N, 2), unit(rng.uniform(0, 6.28)), rng.uniform(15, 70) * mm, rng.uniform(1.8, 3.5) * mm, rng.uniform(-.3, .3),
                 z0=.55, dz=.05, col_base=c * .85, col_tip=c)
    for _ in range(int(40 * tile_m ** 2)):
        c = hexrgb(0x6a5a44)
        cv.blade(rng.uniform(0, N, 2), unit(rng.uniform(0, 6.28)), rng.uniform(60, 220) * mm, rng.uniform(4, 9) * mm, rng.uniform(-.4, .4),
                 z0=.5, dz=0, col_base=c, col_tip=c * .9, flat_tip=True, ridge=.15)
    return cv.down(S)


def clover(n=512, tile_m=0.5, seed=5):
    """White clover (Trifolium repens) from above: trefoil leaves with the pale chevron, a few white heads. Alpha = cover."""
    rng = np.random.default_rng(seed)
    S = 2
    N = n * S
    mm = N / (tile_m * 1000)
    col = np.zeros((N, N, 3))
    h = np.full((N, N), -1.0)
    leaf = [hexrgb(x) for x in (0x4c6b38, 0x55753c, 0x48653a, 0x5b7a42)]
    mark = hexrgb(0x9aa883)
    yy, xx = np.mgrid[0:N, 0:N]
    cover = tile_noise(N, 3, seed + 3, octaves=2)

    def disc(cx, cy, r, c, z, chevron=None):
        x0, x1, y0, y1 = int(cx - r - 1), int(cx + r + 2), int(cy - r - 1), int(cy + r + 2)
        ys, xs = np.mgrid[y0:y1, x0:x1]
        d = np.hypot(xs - cx, ys - cy) / r
        inside = d < 1
        zz = z + .2 * (1 - d ** 2)
        yi, xi = ys % N, xs % N
        w = inside & (zz > h[yi, xi])
        cc = np.broadcast_to(c, xs.shape + (3,)).copy() * (1 + .12 * (1 - d[..., None]))
        if chevron is not None:
            ang, cxx, cyy = chevron
            u = (xs - cxx) * math.cos(ang) + (ys - cyy) * math.sin(ang)
            band = np.abs(d - .55) < .09
            cc[band] = cc[band] * .55 + mark * .45
        col[yi[w], xi[w]] = cc[w]
        h[yi[w], xi[w]] = zz[w]
    for _ in range(int(2400 * (tile_m / .5) ** 2)):
        cx, cy = rng.uniform(0, N, 2)
        if cover[int(cy) % N, int(cx) % N] < rng.uniform(.25, .6):
            continue
        r = rng.uniform(3.0, 6.5) * mm
        c = leaf[rng.integers(len(leaf))] * rng.uniform(.85, 1.1)
        a0 = rng.uniform(0, 2 * math.pi)
        z = rng.uniform(0, .6)
        for k in range(3):
            a = a0 + k * 2 * math.pi / 3
            disc(cx + math.cos(a) * r * .95, cy + math.sin(a) * r * .95, r, c, z, chevron=(a, cx, cy))
    for _ in range(int(4 * (tile_m / .5) ** 2)):                        # a few flower heads (white)
        cx, cy = rng.uniform(0, N, 2)
        for _ in range(40):
            a, rr = rng.uniform(0, 6.28), rng.uniform(0, 7.5) * mm
            disc(cx + math.cos(a) * rr, cy + math.sin(a) * rr, rng.uniform(1.2, 2.2) * mm, hexrgb(0xe6e0cc) * rng.uniform(.85, 1.05), .9 + rng.uniform(0, .1))
    a = (h > -1).astype(np.float64)
    hh = np.where(h > -1, h, 0)
    n_ = N // S
    col = col.reshape(n_, S, n_, S, 3).mean((1, 3))
    a = a.reshape(n_, S, n_, S).mean((1, 3))
    hh = hh.reshape(n_, S, n_, S).mean((1, 3))
    col = np.where(a[..., None] > 0, col / np.maximum(a[..., None], 1e-6), 0)
    return col, hh, a


# ---------------------------------------------------------------------------------------------------- the blade tile
TILE = dict(shoots=380, min_lod1=.34, min_lod2=.13, height=(.058, .092), width=(.0032, .0047))


def blue_noise_order(n, seed, cand=12):
    """n points on the unit torus in best-candidate order (Mitchell): every prefix is itself evenly spread, so a
    prefix of the blades (a sparser LOD, or the blades the distance fade keeps) never clumps."""
    rng = np.random.default_rng(seed)
    pts = np.zeros((n, 2))
    pts[0] = rng.random(2)
    for i in range(1, n):
        c = rng.random((cand + i // 8, 2))
        d = np.abs(c[:, None, :] - pts[None, :i, :])
        d = np.minimum(d, 1 - d)
        dist = np.sqrt((d ** 2).sum(-1)).min(1)
        pts[i] = c[dist.argmax()]
    return pts


def tile(seed=7):
    """One 1 m x 1 m patch of short lawn grass (centred on the origin, y up): shoots in blue-noise rank order, 1-3 blades
    each; per blade 5 vertices / 3 triangles (base pair, mid pair, tip). Returns arrays and the LOD index counts."""
    rng = np.random.default_rng(seed)
    roots = blue_noise_order(TILE['shoots'], seed) - .5
    P, N, LW, BL, WD, idx = [], [], [], [], [], []
    counts = {}
    for si, (rx, rz) in enumerate(roots):
        rank = si / TILE['shoots']
        nb = rng.choice([1, 2, 2, 2, 3])
        a0 = rng.uniform(0, 2 * math.pi)
        for k in range(nb):
            th = a0 + k * 2 * math.pi / nb + rng.uniform(-.5, .5)
            phi = math.radians(min(48, abs(rng.normal(16, 9)) + 4))      # lean from vertical
            H = rng.uniform(*TILE['height'])
            w = rng.uniform(*TILE['width'])
            tw = rng.uniform(-.6, .6)                                        # twist of the blade's face
            d = np.array([math.cos(th), 0, math.sin(th)])
            up = np.array([0, 1.0, 0])
            side = np.array([math.cos(th + math.pi / 2 + tw), 0, math.sin(th + math.pi / 2 + tw)])
            root = np.array([rx, 0, rz])

            def c(t):
                return root + up * H * (t - .22 * math.sin(phi) ** 2 * t ** 3) + d * H * math.sin(phi) * t ** 1.7
            rnd = rng.random()
            base = len(P)
            for t, hw in ((0.0, w * .5), (.55, w * .5 * .78)):
                cc = c(t)
                tan = c(min(1, t + .05)) - c(max(0, t - .05))
                tan /= np.linalg.norm(tan)
                nrm = np.cross(side, tan)
                nrm = nrm / np.linalg.norm(nrm)
                if nrm[1] < 0:
                    nrm = -nrm
                for sgn in (-1, 1):
                    P.append(cc + side * hw * sgn)
                    N.append(nrm)
                    LW.append((rx, rz, rank, rnd))
                    BL.append((t, sgn, H, w))
                    WD.append(side * hw * sgn)
            tip = c(1.0)
            P.append(tip)
            N.append(N[-1])
            LW.append((rx, rz, rank, rnd))
            BL.append((1.0, 0, H, w))
            WD.append((0, 0, 0))
            idx += [base, base + 1, base + 2, base + 1, base + 3, base + 2, base + 2, base + 3, base + 4]
        for name, lim in (('lod1', TILE['min_lod1']), ('lod2', TILE['min_lod2'])):
            if rank < lim:
                counts[name] = len(idx)
    counts['lod0'] = len(idx)
    A = lambda x: np.asarray(x, dtype=np.float32)
    return dict(P=A(P), N=A(N), LAWN=A(LW), BLADE=A(BL), WDIR=A(WD), I=np.asarray(idx, dtype=np.uint16), counts=counts,
                blades=sum(1 for b in BL if b[0] == 1.0))


# ---------------------------------------------------------------------------------------------------- the GLB
def _webp(path, lossless_alpha=True, quality=90):
    import io
    im = Image.open(path)
    out = io.BytesIO()
    if im.mode == 'RGBA':
        im.save(out, 'WEBP', quality=quality, alpha_quality=100, method=6, exact=True)
    else:
        im.convert('RGB').save(out, 'WEBP', quality=quality, method=6)
    return out.getvalue()


def write_glb(path):
    """veg.lawn.glb: the blade tile (mesh lawn.tile, LODs as index ranges in extras) and the ground texture sets as
    materials on 1 m swatches (mat.ground/lawn, meadow, soil, clover). Written directly (numpy + Pillow), WebP images."""
    import struct
    T = tile()
    meta = json.load(open(os.path.join(TEXDIR, 'textures.json')))
    bin_parts, views, accs = [], [], []

    def add_view(data, target=None):
        off = sum(len(b) for b in bin_parts)
        pad = (-off) % 4
        if pad:
            bin_parts.append(b'\0' * pad)
            off += pad
        bin_parts.append(data)
        v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
        if target:
            v['target'] = target
        views.append(v)
        return len(views) - 1

    def add_acc(arr, typ, target=34962, minmax=False):
        arr = np.ascontiguousarray(arr)
        ct = {np.dtype('float32'): 5126, np.dtype('uint16'): 5123, np.dtype('uint32'): 5125}[arr.dtype]
        a = {'bufferView': add_view(arr.tobytes(), target), 'componentType': ct, 'count': int(arr.shape[0]), 'type': typ}
        if minmax:
            a['min'] = [float(x) for x in arr.min(0)]
            a['max'] = [float(x) for x in arr.max(0)]
        accs.append(a)
        return len(accs) - 1
    images, textures = [], []

    def add_image(name, file):
        images.append({'name': name, 'mimeType': 'image/webp', 'bufferView': add_view(_webp(os.path.join(TEXDIR, file)))})
        textures.append({'sampler': 0, 'extensions': {'EXT_texture_webp': {'source': len(images) - 1}}})
        return len(textures) - 1
    materials, meshes, nodes = [], [], []
    tile_m = {'lawn': .5, 'meadow': 1.0, 'soil': 1.0, 'clover': .5}
    for name in ('lawn', 'meadow', 'soil', 'clover'):
        tb = add_image(f'veg.lawn__{name}_basecolor', f'veg.lawn__{name}_basecolor.png')
        tn = add_image(f'veg.lawn__{name}_normal', f'veg.lawn__{name}_normal.png')
        materials.append({'name': f'mat.ground/{name}', 'pbrMetallicRoughness': {'baseColorTexture': {'index': tb}, 'metallicFactor': 0, 'roughnessFactor': .92},
                          'normalTexture': {'index': tn}, 'alphaMode': 'MASK' if name == 'clover' else 'OPAQUE',
                          'extras': {'ll_tile_m': tile_m[name], 'll_alpha': 'cover' if name == 'clover' else 'height', 'll_mean_linear': meta[name]['meanLinear']}})
        # a 1 m swatch carrying the material (and the material's world scale in its UVs)
        k = 1.0 / tile_m[name]
        q = np.array([[-.5, 0, -.5], [.5, 0, -.5], [.5, 0, .5], [-.5, 0, .5]], np.float32)
        uv = np.array([[0, 0], [k, 0], [k, k], [0, k]], np.float32)
        n = np.tile(np.array([[0, 1, 0]], np.float32), (4, 1))
        meshes.append({'name': f'lawn.swatch.{name}', 'primitives': [{'attributes': {'POSITION': add_acc(q, 'VEC3', minmax=True), 'NORMAL': add_acc(n, 'VEC3'), 'TEXCOORD_0': add_acc(uv, 'VEC2')},
                                                                      'indices': add_acc(np.array([0, 2, 1, 0, 3, 2], np.uint16), 'SCALAR', 34963), 'material': len(materials) - 1}]})
        nodes.append({'name': f'lawn.swatch.{name}', 'mesh': len(meshes) - 1, 'translation': [2.0 + 1.2 * len(nodes), 0, 0], 'extras': {'ll_lawn_swatch': name}})
    materials.append({'name': 'mat.foliage/lawn.blade', 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': .8}, 'doubleSided': True})
    attrs = {'POSITION': add_acc(T['P'], 'VEC3', minmax=True), 'NORMAL': add_acc(T['N'], 'VEC3'), '_LAWN': add_acc(T['LAWN'], 'VEC4'),
             '_BLADE': add_acc(T['BLADE'], 'VEC4'), '_WDIR': add_acc(T['WDIR'], 'VEC3')}
    meshes.append({'name': 'lawn.tile', 'primitives': [{'attributes': attrs, 'indices': add_acc(T['I'], 'SCALAR', 34963), 'material': len(materials) - 1}]})
    nodes.append({'name': 'lawn.tile', 'mesh': len(meshes) - 1, 'extras': {'ll_lawn_tile': True, 'll_lod_index_counts': T['counts'], 'll_blades': T['blades'],
                                                                         'll_shoots': TILE['shoots'], 'll_size_m': 1.0, 'll_lod_rank': [1.0, TILE['min_lod1'], TILE['min_lod2']]}})
    ids = 'll_asset_id', 'll_asset_version', 'll_rig', 'll_license'
    root_extras = dict(zip(ids, ('veg.lawn', 1, 'none', 'original work (Last Light): no third-party content')))
    nodes.append({'name': 'veg.lawn', 'children': list(range(len(nodes))), 'extras': root_extras})
    gl = {'asset': {'version': '2.0', 'generator': 'Last Light lawn_kit.py', 'extras': {'ll_asset_id': 'veg.lawn', 'textures': meta,
                    'note': 'Original work for Last Light (no third-party content): ground textures and the lawn blade tile.'}},
          'scene': 0, 'scenes': [{'name': 'veg.lawn', 'nodes': [len(nodes) - 1], 'extras': root_extras}], 'nodes': nodes, 'meshes': meshes, 'materials': materials,
          'textures': textures, 'images': images, 'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}],
          'accessors': accs, 'bufferViews': views, 'extensionsUsed': ['EXT_texture_webp'], 'extensionsRequired': ['EXT_texture_webp']}
    binb = b''.join(bin_parts)
    binb += b'\0' * ((-len(binb)) % 4)
    gl['buffers'] = [{'byteLength': len(binb)}]
    jb = json.dumps(gl, separators=(',', ':')).encode()
    jb += b' ' * ((-len(jb)) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(binb)) + struct.pack('<I4s', len(jb), b'JSON') + jb + struct.pack('<I4s', len(binb), b'BIN\0') + binb
    open(path, 'wb').write(out)
    stats = {'bytes': len(out), 'tile': {'blades': T['blades'], 'shoots': TILE['shoots'], 'tris': {k: v // 3 for k, v in T['counts'].items()}, 'verts': int(len(T['P']))}}
    json.dump(stats, open(os.path.join(LAWN_SRC, 'build-stats.json'), 'w'), indent=1)
    print(path, stats)


# ---------------------------------------------------------------------------------------------------- saving
def pad(col, a):
    known = a > .5
    if known.all() or not known.any():
        return col
    _, (iy, ix) = ndimage.distance_transform_edt(~known, return_indices=True)
    fill = ndimage.gaussian_filter(col[iy, ix], (2, 2, 0))
    return np.where(known[..., None], col, fill)


def save_rgba(col_lin, alpha, name):
    os.makedirs(TEXDIR, exist_ok=True)
    rgb = l2s(col_lin)
    arr = np.concatenate([rgb, np.clip(alpha, 0, 1)[..., None]], -1)
    Image.fromarray((arr * 255 + .5).astype(np.uint8), 'RGBA').save(os.path.join(TEXDIR, name), optimize=True)


def save_rgb(rgb01, name):
    os.makedirs(TEXDIR, exist_ok=True)
    Image.fromarray((np.clip(rgb01, 0, 1) * 255 + .5).astype(np.uint8), 'RGB').save(os.path.join(TEXDIR, name), optimize=True)


def build_textures(only=None):
    meta = json.load(open(os.path.join(TEXDIR, 'textures.json'))) if only else {}
    for name, fn, strength in (('lawn', lawn, 9.0), ('meadow', meadow, 7.0), ('soil', lambda: soil(n=512), 6.0)):
        if only and name not in only:
            continue
        col, h = fn()
        h = (h - h.min()) / (np.ptp(h) + 1e-9)
        save_rgba(col, h, f'veg.lawn__{name}_basecolor.png')            # alpha = height (for height blending)
        save_rgb(normal_from_height(ndimage.gaussian_filter(h, .7), strength), f'veg.lawn__{name}_normal.png')
        meta[name] = {'meanLinear': [round(float(x), 5) for x in col.reshape(-1, 3).mean(0)], 'meanSRGB': [round(float(x), 4) for x in l2s(col.reshape(-1, 3).mean(0))]}
        print(name, meta[name], flush=True)
    if only and 'clover' not in only:
        json.dump(meta, open(os.path.join(TEXDIR, 'textures.json'), 'w'), indent=1)
        return
    col, h, a = clover()
    save_rgba(pad(col, a), a, 'veg.lawn__clover_basecolor.png')               # alpha = clover cover
    save_rgb(normal_from_height(ndimage.gaussian_filter(h * a, .7), 6.0), 'veg.lawn__clover_normal.png')
    meta['clover'] = {'meanLinear': [round(float(x), 5) for x in (col * a[..., None]).reshape(-1, 3).sum(0) / max(a.sum(), 1)], 'cover': round(float(a.mean()), 3)}
    json.dump(meta, open(os.path.join(TEXDIR, 'textures.json'), 'w'), indent=1)
    print('clover', meta['clover'])


def preview():
    """A 3 x 3 tiling of each texture (to judge seams and repetition)."""
    for name in ('lawn', 'meadow', 'soil', 'clover'):
        im = Image.open(os.path.join(TEXDIR, f'veg.lawn__{name}_basecolor.png')).convert('RGB')
        w = im.size[0]
        big = Image.new('RGB', (w * 3, w * 3))
        for i in range(3):
            for j in range(3):
                big.paste(im, (i * w, j * w))
        big.resize((1200, 1200), Image.LANCZOS).save(os.path.join(veg_paths.ROOT, 'docs', 'qa', 'vegetation', 'lawn', f'tex_{name}_3x3.jpg'), quality=88)


if __name__ == '__main__':
    args = sys.argv[1:] or ['textures', 'preview']
    os.makedirs(os.path.join(ROOT, 'docs', 'qa', 'vegetation', 'lawn'), exist_ok=True)
    if 'textures' in args:
        build_textures()
    for a in args:
        if a.startswith('only='):
            build_textures(a[5:].split(','))
    if 'preview' in args:
        preview()
    if 'glb' in args:
        write_glb(os.path.join(ROOT, 'dist', 'assets', 'veg', 'veg.lawn.glb'))
