"""Last Light vegetation texture library (numpy + Pillow; no bpy).

One library for every tree, shrub and grass in the benchmark, so the four Sketchfab sources stop looking like four
products. Two kinds of map:
  * ORIGINAL maps synthesized here (white-oak plated bark, maple/birch/pine bark, maple and birch leaves, lawn blades,
    wildflowers, the AR carving): tileable, authored at 2x runtime size.
  * ADAPTED maps from the CC BY 4.0 sources (oak / ash / pine twig photos from Jungle Jim's collection, LOLIPOP's shrub
    branch atlas, Ali haghshenas' grass tufts): colour under transparent pixels padded (no white or black halos in
    the mip chain), graded to one late-August palette (VEG_GRADE), re-packed into Last Light atlases.
Every map is written to assets/source/vegetation/textures/ at authoring size; the builders downsample for runtime.

python tools/blender/vegetation/veg_textures.py [names...]   (default: all)
"""
import io
import json
import math
import os
import struct
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_paths  # noqa: E402

TEX = os.path.join(veg_paths.ROOT, 'assets', 'source', 'vegetation', 'textures')
os.makedirs(TEX, exist_ok=True)

# One palette for all foliage: late August 2011 in a Midwestern suburb, a little tired, never neon.
# (mean target in sRGB 0..1 per foliage family; the grade moves each source's mean toward it and caps saturation)
VEG_GRADE = {
    'oak': dict(mean=(0.30, 0.38, 0.17), sat=0.62, contrast=1.05),
    'ash': dict(mean=(0.31, 0.39, 0.16), sat=0.60, contrast=1.04),
    'pine': dict(mean=(0.22, 0.30, 0.17), sat=0.50, contrast=1.05),
    'shrub': dict(mean=(0.26, 0.34, 0.15), sat=0.58, contrast=1.06),
    'grass': dict(mean=(0.36, 0.42, 0.20), sat=0.55, contrast=1.04),
}


# ---------------------------------------------------------------------------------------------------- helpers
def srgb_to_lin(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def save(arr, name, mode=None):
    a = np.clip(arr, 0, 1)
    im = Image.fromarray((a * 255 + .5).astype(np.uint8), mode)
    p = os.path.join(TEX, name)
    im.save(p, optimize=True)
    return p


def tile_noise(n, scale, seed, octaves=5, persistence=.5, aspect=(1, 1)):
    """Tileable fractal noise in [0,1] (spectral synthesis: band-limited random phases on the torus)."""
    rng = np.random.default_rng(seed)
    out = np.zeros((n, n))
    amp, tot = 1.0, 0.0
    fy, fx = np.meshgrid(np.fft.fftfreq(n) * n, np.fft.fftfreq(n) * n, indexing='ij')
    for o in range(octaves):
        f0 = scale * 2 ** o
        r = np.hypot(fx / aspect[0], fy / aspect[1])
        band = np.exp(-((r - f0) / (f0 * .5 + 1e-9)) ** 2)
        ph = rng.uniform(0, 2 * np.pi, (n, n))
        spec = band * np.exp(1j * ph)
        layer = np.real(np.fft.ifft2(spec))
        layer /= (np.abs(layer).max() + 1e-12)
        out += amp * layer
        tot += amp
        amp *= persistence
    out /= tot
    return (out - out.min()) / (np.ptp(out) + 1e-12)


def worley(n, count, seed, aspect=(1.0, 1.0), warp=0.0):
    """Tileable cellular noise: F1, F2 distances (pixels) and the nearest cell id; optional domain warp (pixels)."""
    rng = np.random.default_rng(seed)
    pts = rng.uniform(0, n, (count, 2))
    tiles = np.concatenate([pts + np.array([dx, dy]) * n for dx in (-1, 0, 1) for dy in (-1, 0, 1)])
    ids = np.tile(np.arange(count), 9)
    sx, sy = aspect
    tree = cKDTree(tiles * np.array([sx, sy]))
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float64)
    if warp:
        xx = xx + (tile_noise(n, 6, seed + 91, octaves=3) - .5) * warp + (tile_noise(n, 24, seed + 92, octaves=2) - .5) * warp * .35
        yy = yy + (tile_noise(n, 4, seed + 93, octaves=3) - .5) * warp * 1.6
    q = np.stack([xx.ravel() * sx, yy.ravel() * sy], 1)
    d, i = tree.query(q, k=2, workers=-1)
    return d[:, 0].reshape(n, n), d[:, 1].reshape(n, n), ids[i[:, 0]].reshape(n, n), rng


def normal_from_height(h, strength):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * .5
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * .5
    nx, ny = -gx * strength, gy * strength          # OpenGL convention (+Y up in tangent space)
    nz = np.ones_like(h)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx / l * .5 + .5, ny / l * .5 + .5, nz / l * .5 + .5], -1)


def seamless(img, border=0.12):
    """Make a nearly-tileable photo tile seamlessly (blend with its half-offset copy across the edges)."""
    a = img.astype(np.float64)
    h, w = a.shape[:2]
    off = np.roll(np.roll(a, h // 2, 0), w // 2, 1)
    yy, xx = np.mgrid[0:h, 0:w]
    ex = np.minimum(xx, w - 1 - xx) / (w * border)
    ey = np.minimum(yy, h - 1 - yy) / (h * border)
    m = np.clip(np.minimum(ex, ey), 0, 1)[..., None] if a.ndim == 3 else np.clip(np.minimum(ex, ey), 0, 1)
    m = m * m * (3 - 2 * m)
    return a * m + off * (1 - m)


def read_glb_images(path):
    d = open(path, 'rb').read()
    ln = struct.unpack_from('<I', d, 12)[0]
    js = json.loads(d[20:20 + ln])
    bo, bv = 20 + ln + 8, js['bufferViews']
    out = []
    for im in js.get('images', []):
        v = bv[im['bufferView']]
        out.append(Image.open(io.BytesIO(d[bo + v.get('byteOffset', 0):bo + v.get('byteOffset', 0) + v['byteLength']])).copy())
    return out, js


def pad_color(rgba, iters=48):
    """Push colour from opaque pixels into transparent ones (so mips never pull in the matte colour)."""
    a = rgba[..., 3]
    rgb = rgba[..., :3].copy()
    known = a > 0.5
    if known.all():
        return rgba
    dist, (iy, ix) = ndimage.distance_transform_edt(~known, return_indices=True)
    rgb = rgb[iy, ix]
    out = rgba.copy()
    out[..., :3] = ndimage.gaussian_filter(rgb, (2, 2, 0)) * (~known[..., None]) + rgb * known[..., None]
    return out


def grade(rgba, family, mask=None):
    """Move the opaque pixels' mean toward the family's late-August target; cap saturation; gentle contrast."""
    g = VEG_GRADE[family]
    rgb = rgba[..., :3]
    m = rgba[..., 3] > .5 if mask is None else mask
    lin = srgb_to_lin(rgb)
    mean = lin[m].mean(0)
    tgt = srgb_to_lin(g['mean'])
    lin = lin * (tgt / np.maximum(mean, 1e-4))
    lum = (lin * np.array([.2126, .7152, .0722])).sum(-1, keepdims=True)
    lin = lum + (lin - lum) * g['sat'] / max(.01, np.sqrt(((lin[m] - lum[m]) ** 2).mean()) / max(1e-4, np.sqrt(((lin[m] - lum[m]) ** 2).mean())))
    lin = lum + (lin - lum) * g['sat'] * 1.35
    lmean = lum[m].mean()
    lin = lmean + (lin - lmean) * g['contrast']
    out = rgba.copy()
    out[..., :3] = lin_to_srgb(lin)
    return out


def flip_up(rgba):
    return rgba[::-1].copy()


# ---------------------------------------------------------------------------------------------------- bark
def bark_white_oak(n=2048, seed=29):
    """Mature white oak: pale ash-grey, broken into irregular vertical plates and flakes, shallow fissures, lichen."""
    F1, F2, cid, rng = worley(n, 270, seed, aspect=(1.0, 0.30), warp=90.0)
    edge = F2 - F1                                     # small along the cracks between plates
    g1, g2, _, _ = worley(n, 1500, seed + 40, aspect=(1.0, 0.45), warp=30.0)
    sub = np.exp(-(g2 - g1) / 3.0)                     # fine cracks that break each plate into flakes
    crack = np.exp(-edge / 8.5) * (.75 + .5 * tile_noise(n, 30, seed + 4, octaves=3))   # 1 in the cracks, broken
    plate_h = rng.uniform(.55, 1.0, cid.max() + 1)[cid]
    dome = np.clip(edge / 30.0, 0, 1) ** .45           # plates rise sharply from their edges (flaky)
    fiss = tile_noise(n, 3, seed + 1, octaves=4, aspect=(3.5, .35))   # long vertical fissure network
    fiss = np.clip((fiss - .62) * 4.0, 0, 1)
    fine = tile_noise(n, 48, seed + 2, octaves=4)
    flake = tile_noise(n, 22, seed + 3, octaves=3, aspect=(1, .5))
    H = plate_h * dome * (1 - .85 * fiss) + .12 * fine + .1 * flake - .55 * crack - .16 * sub
    H = (H - H.min()) / np.ptp(H)
    # colour
    base = np.array([0.47, 0.45, 0.42])
    tone = (rng.uniform(-.09, .07, cid.max() + 1)[cid])[..., None] + (tile_noise(n, 2, seed + 8, octaves=3)[..., None] - .5) * .12
    col = base[None, None] + tone + (fine[..., None] - .5) * .08
    warm = np.array([0.42, 0.36, 0.30])
    dark = np.array([0.13, 0.11, 0.09])
    col = col * (1 - (1 - H[..., None]) * .7) + dark * ((1 - H) ** 2.2)[..., None] * .7
    col = col * (1 - .25 * crack[..., None]) + warm * (.25 * crack[..., None])
    # lichen (pale grey-green blotches on the plates) and a little green algae in the fissures
    lich = tile_noise(n, 9, seed + 5, octaves=4)
    lich = np.clip((lich - .66) * 5, 0, 1) * (H > .45)
    col = col * (1 - .55 * lich[..., None]) + np.array([0.60, 0.62, 0.52]) * (.55 * lich[..., None])
    alg = np.clip((tile_noise(n, 5, seed + 6, octaves=3) - .55) * 3, 0, 1) * (1 - H) ** 2
    col = col * (1 - .4 * alg[..., None]) + np.array([0.24, 0.29, 0.14]) * (.4 * alg[..., None])
    # photographic micro-detail from the supplied bark (Jungle Jim's collection), high-passed, made seamless
    imgs, _ = read_glb_images(veg_paths.original('realistic_trees_collection.glb'))
    photo = np.asarray(imgs[0].convert('L'), dtype=np.float64) / 255
    photo = seamless(photo)
    photo = np.asarray(Image.fromarray((photo * 255).astype(np.uint8)).resize((n // 2, n // 2), Image.LANCZOS), dtype=np.float64) / 255
    photo = np.tile(photo, (2, 2))
    hp = photo - ndimage.gaussian_filter(photo, 6, mode='wrap')
    col = col * (1 + hp[..., None] * 1.1)
    H2 = np.clip(H + hp * .35, 0, 1)
    nrm = normal_from_height(ndimage.gaussian_filter(H2, .8, mode='wrap'), 13.0)
    ao = np.clip(.45 + .55 * ndimage.gaussian_filter(H2, 3, mode='wrap') ** .7, 0, 1)
    rough = np.clip(.86 + .1 * (1 - H2) + .03 * fine, 0, 1)
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    save(np.clip(col, 0, 1), 'bark.white-oak__basecolor.png')
    save(nrm, 'bark.white-oak__normal.png')
    save(orm, 'bark.white-oak__orm.png')
    save(H2, 'bark.white-oak__height.png', 'L')
    print('bark.white-oak', n)


# ---------------------------------------------------------------------------------------------------- leaves
def oak_leaf_atlas(n=2048):
    """2x2 atlas of the oak twig photo (Jungle Jim's collection): sun twig, shade twig, mirrored twig, dense cluster.
    The photo is stored stem-down in its file; cards use v=0 at the stem."""
    imgs, js = read_glb_images(veg_paths.original('realistic_trees_collection.glb'))
    src = np.asarray(imgs[5].convert('RGBA'), dtype=np.float64) / 255   # leaves.010 (oak)
    src = pad_color(src)
    base = grade(src, 'oak')
    c = n // 2

    def fit(a):
        """crop to the twig (stem kept at the bottom centre), square, then fill the cell"""
        al = a[..., 3] > .1
        ys, xs = np.nonzero(al)
        y0, y1 = ys.min(), ys.max() + 1
        side = max(y1 - y0, int((xs.max() - xs.min()) * 1.04))
        cx = int(np.median(xs[ys > y1 - 20])) if (ys > y1 - 20).any() else a.shape[1] // 2   # the stem's x at the bottom
        x0 = int(np.clip(cx - side // 2, 0, max(0, a.shape[1] - side)))
        pad = np.zeros((side, max(side, a.shape[1]), 4))
        crop = a[max(0, y1 - side):y1, x0:x0 + side]
        pad[side - crop.shape[0]:, :crop.shape[1]] = crop
        im = Image.fromarray((np.clip(pad[:, :side], 0, 1) * 255).astype(np.uint8), 'RGBA').resize((c, c), Image.LANCZOS)
        return pad_color(np.asarray(im, dtype=np.float64) / 255)
    sun = base.copy()
    sun[..., :3] = lin_to_srgb(srgb_to_lin(sun[..., :3]) * np.array([1.10, 1.06, .86]))
    shade = base.copy()
    shade[..., :3] = lin_to_srgb(srgb_to_lin(shade[..., :3]) * np.array([.80, .88, .92]))
    mirror = base[:, ::-1].copy()
    mirror[..., :3] = lin_to_srgb(srgb_to_lin(mirror[..., :3]) * np.array([1.02, .98, .9]))
    # dense cluster: three rotated copies layered (for the far crown, more coverage per card)
    im = Image.fromarray((base * 255).astype(np.uint8), 'RGBA')
    cl = Image.new('RGBA', im.size, (0, 0, 0, 0))
    for ang, sc, dx in ((-28, .85, -110), (24, .9, 120), (0, 1.0, 0)):
        t = im.rotate(ang, resample=Image.BICUBIC, center=(512, 1000)).resize((int(1024 * sc), int(1024 * sc)), Image.LANCZOS)
        layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
        layer.paste(t, (int((1024 - t.width) / 2 + dx), 1024 - t.height), t)
        cl = Image.alpha_composite(cl, layer)
    cluster = pad_color(np.asarray(cl, dtype=np.float64) / 255)
    atlas = np.zeros((n, n, 4))
    atlas[:c, :c] = fit(sun)
    atlas[:c, c:] = fit(shade)
    atlas[c:, :c] = fit(mirror)
    atlas[c:, c:] = fit(cluster)
    atlas = pad_color(atlas)
    save(atlas, 'leaf.oak__basecolor.png', 'RGBA')
    print('leaf.oak atlas', n, 'cells: sun, shade / mirrored, cluster')


# ---------------------------------------------------------------------------------------------------- the carving
def carving_decal(n=1024):
    """The AR cut into the old oak at a child's height (ending.js letters), decades healed: the grooves have widened and
    weathered grey, the bark has grown back in swollen callus lips along every stroke. One 1024 tile: colour + alpha
    (the patch fades into the bark around it), normal, ORM. Strokes as ending.js draws them (A then R, left to right)."""
    letters = [[[0, 0], [.06, .16], [.12, 0]], [[.03, .07], [.09, .07]], [[.17, 0], [.17, .16], [.25, .16], [.26, .11], [.18, .08], [.27, 0]]]
    S = 0.40
    ox, oy = (S - .27) / 2, (S - .16) / 2
    rng = np.random.default_rng(1958)
    img = Image.new('L', (n, n), 0)
    dr = ImageDraw.Draw(img)
    px = lambda x, y: ((ox + x) / S * n, n - (oy + y) / S * n)
    for s_ in letters:
        for (x0, y0), (x1, y1) in zip(s_[:-1], s_[1:]):
            L = math.hypot(x1 - x0, y1 - y0)
            k = max(2, int(L / .004))
            nx, ny = -(y1 - y0) / L, (x1 - x0) / L
            wob = np.cumsum(rng.normal(0, .0009, k + 1))
            wob -= np.linspace(wob[0], wob[-1], k + 1)
            for i in range(k + 1):
                t = i / k
                x, y = x0 + (x1 - x0) * t + nx * wob[i], y0 + (y1 - y0) * t + ny * wob[i]
                r = (.0075 + .0035 * math.sin(t * 5.3 + x0 * 40) + rng.uniform(-.001, .001)) / S * n
                cx, cy = px(x, y)
                dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    m = np.asarray(img.filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float64) / 255
    inside = m > .5
    sd = (ndimage.distance_transform_edt(~inside) - ndimage.distance_transform_edt(inside)) / n * S   # metres, <0 in the groove
    groove = np.clip(-sd / .007, 0, 1)
    groove = groove * groove * (3 - 2 * groove)
    lip = np.exp(-((sd - .004) / .009) ** 2) * (sd > -0.001)
    lip = lip * (.8 + .4 * tile_noise(n, 18, 58, octaves=2))
    H = .5 - .32 * groove + .22 * lip
    crop = int(2048 * S / 1.5)                                    # the patch shows the bark at the trunk's 1.5 m tile
    tex = np.asarray(Image.open(os.path.join(TEX, 'bark.white-oak__height.png')).convert('L').crop((0, 0, crop, crop)).resize((n, n), Image.LANCZOS), dtype=np.float64) / 255
    col = np.asarray(Image.open(os.path.join(TEX, 'bark.white-oak__basecolor.png')).convert('RGB').crop((0, 0, crop, crop)).resize((n, n), Image.LANCZOS), dtype=np.float64) / 255
    smooth = np.clip(lip * 1.6 + inside, 0, 1)                   # callus and the old cut are smoother than plated bark
    Hb = tex * (1 - smooth) + .5 * smooth
    Hf = np.clip(H * .7 + (Hb - .5) * .3 * (1 - smooth), 0, 1)
    wood = np.array([0.36, 0.33, 0.29])                          # weathered, greyed wood in the old cut
    callus = np.array([0.50, 0.48, 0.44])
    c = col * (1 - smooth[..., None]) + callus * (lip[..., None] * .8)
    c = c * (1 - inside[..., None]) + (wood * (.75 + .25 * tex[..., None])) * inside[..., None]
    c = c * (1 - .45 * groove[..., None])
    reach = np.clip(1 - sd / .03, 0, 1)                            # 3 cm around every stroke: the callus and the cut
    alpha = ((reach + (tile_noise(n, 14, 77) - .5) * .9) > .55).astype(np.float64)
    rgba = np.concatenate([np.clip(c, 0, 1), alpha[..., None]], -1)
    save(pad_color(rgba), 'detail.oak-carving__basecolor.png', 'RGBA')
    save(normal_from_height(ndimage.gaussian_filter(Hf, 1.0), 14.0), 'detail.oak-carving__normal.png')
    ao = np.clip(1 - .5 * groove * inside - .15 * (1 - Hf), 0, 1)
    save(np.stack([ao, np.full_like(ao, .9) - .1 * smooth, np.zeros_like(ao)], -1), 'detail.oak-carving__orm.png')
    print('detail.oak-carving', n, f'tile {S} m')


JOBS = {'bark.white-oak': bark_white_oak, 'leaf.oak': oak_leaf_atlas, 'detail.oak-carving': carving_decal}



# ================================================================================================== Stage C: street trees
def _leaf_outline(kind, rng, n=260):
    """Leaf outline (unit length, petiole joint at (0,0), tip toward +y).
    maple: palmate, five pointed lobes (sugar/red maple), toothed margins, deep sinuses.
    birch: ovate with an acuminate tip and a doubly serrate margin."""
    if kind == 'maple':
        th = np.linspace(-np.pi, np.pi, n, endpoint=False)
        lobes = [(0.0, 1.0), (.98, .86), (-.98, .86), (2.0, .50), (-2.0, .50)]
        r = np.full_like(th, .26)
        for a, L in lobes:
            a2 = a + rng.normal(0, .05)
            c = np.clip(np.cos(th - a2), 0, 1)
            r = np.maximum(r, .26 + (L * rng.uniform(.92, 1.05) - .26) * c ** 9)
        # a few teeth on each lobe
        teeth = 1 + .045 * np.maximum(0, np.sin(th * 21 + rng.uniform(0, 6))) ** 3
        r = r * teeth
        # the petiole notch (heart-shaped base)
        r = r * (1 - .35 * np.clip(np.cos(th - np.pi), 0, 1) ** 12)
        x, y = r * np.sin(th), r * np.cos(th)
        return np.stack([x * .55, y * .55 + .30], 1)
    s_ = np.linspace(0, 1, n // 2)
    w = .36 * np.sin(np.pi * s_ ** .75) ** 1.1 * (1 - .25 * s_)
    w = w * (1 + .07 * np.abs(np.sin(s_ * 38)) ** .6 + .03 * np.abs(np.sin(s_ * 19)))
    left = np.stack([-w, s_], 1)
    right = np.stack([w, s_], 1)[::-1]
    return np.concatenate([left, right]) * np.array([1, 1.0]) + np.array([0, .06])


def _draw_leaf(img, base_xy, angle, size, squash, col, rng, kind, vein_col):
    from PIL import ImageDraw
    pts = _leaf_outline(kind, rng)
    pts[:, 0] *= squash
    ca, sa = math.cos(angle), math.sin(angle)
    R = np.array([[ca, -sa], [sa, ca]])
    P = (pts * size) @ R.T + np.array(base_xy)
    d = ImageDraw.Draw(img)
    # petiole
    tip = np.array([0, .16 if kind == 'maple' else .06]) * size
    pt = (tip * [squash, 1]) @ R.T + np.array(base_xy)
    d.line([tuple(base_xy), tuple(pt)], fill=(70, 62, 40, 255), width=max(1, int(size * .03)))
    d.polygon([tuple(p) for p in P], fill=tuple(int(c * 255) for c in col) + (255,))
    # veins (lighter) from the leaf base toward the lobes / along the midrib
    vc = tuple(int(c * 255) for c in vein_col) + (255,)
    base = pt
    if kind == 'maple':
        for a in (0, .95, -.95, 1.95, -1.95):
            v = np.array([math.sin(a), math.cos(a)]) * (.5 if abs(a) < 1 else .27) * size
            v = (v * [squash, 1]) @ R.T
            d.line([tuple(base), tuple(base + v * .95)], fill=vc, width=max(1, int(size * .009)))
    else:
        v = (np.array([0, .78]) * size * [squash, 1]) @ R.T
        d.line([tuple(base), tuple(base + v)], fill=vc, width=max(1, int(size * .015)))
        for k in range(5):
            o = base + v * (.15 + k * .15)
            for s in (-1, 1):
                w = (np.array([s * .25, .12]) * size * [squash, 1]) @ R.T
                d.line([tuple(o), tuple(o + w)], fill=vc, width=1)
    return P


def twig_sprite(kind, seed, n=2048):
    """An original twig with leaves, drawn at 2x and downsampled: 'maple' (opposite pairs) or 'birch' (alternate, drooping).
    Stem at the bottom centre (card v=0)."""
    from PIL import ImageDraw
    rng = np.random.default_rng(seed)
    img = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # stem path: from bottom centre upward with a gentle curve (birch droops sideways)
    k = 40
    t = np.linspace(0, 1, k)
    bend = rng.uniform(-.18, .18)
    if kind == 'maple':
        xs = n * (.5 + bend * t ** 1.5 + .02 * np.sin(t * 7))
        ys = n * (1 - .9 * t)
    else:
        xs = n * (.5 + (.28 if rng.random() < .5 else -.28) * t ** 1.3)
        ys = n * (1 - .88 * t + .12 * t ** 2)
    stem = np.stack([xs, ys], 1)
    for i in range(k - 1):
        w = int(n * (.012 * (1 - t[i]) + .003))
        d.line([tuple(stem[i]), tuple(stem[i + 1])], fill=(78, 64, 46, 255), width=max(1, w))
    pal = {'maple': [(0.22, 0.32, 0.12), (0.26, 0.35, 0.13), (0.19, 0.28, 0.11), (0.30, 0.37, 0.15), (0.24, 0.30, 0.12)],
           'birch': [(0.30, 0.39, 0.14), (0.27, 0.36, 0.13), (0.34, 0.42, 0.16), (0.25, 0.33, 0.12)]}[kind]
    leaves = []
    if kind == 'maple':
        nodes = [.22, .45, .66, .86, .98]
        for j, tt in enumerate(nodes):
            i = int(tt * (k - 1))
            p = stem[i]
            tang = stem[min(i + 1, k - 1)] - stem[max(i - 1, 0)]
            ang0 = math.atan2(tang[0], -tang[1])
            for s in ((-1, 1) if tt < .95 else (0,)):
                size = n * rng.uniform(.26, .33) * (1.0 if tt < .9 else .8)
                a = ang0 + s * rng.uniform(.65, 1.15) + rng.normal(0, .15)
                off = np.array([math.sin(a), -math.cos(a)]) * size * .12
                col = pal[rng.integers(len(pal))]
                shade = rng.uniform(.8, 1.12)
                leaves.append((p + off, a, size, rng.uniform(.7, 1.0), tuple(np.clip(np.array(col) * shade, 0, 1)), rng))
    else:
        for j in range(22):
            tt = .1 + j / 22 * .88
            i = int(tt * (k - 1))
            p = stem[i]
            s = 1 if j % 2 else -1
            size = n * rng.uniform(.10, .14)
            tang = stem[min(i + 1, k - 1)] - stem[max(i - 1, 0)]
            ang0 = math.atan2(tang[0], -tang[1])
            a = ang0 + s * rng.uniform(.6, 1.3) + .5 * np.sign(stem[-1, 0] - n / 2) * (-1)
            col = pal[rng.integers(len(pal))]
            leaves.append((p, a + math.pi * .0, size, rng.uniform(.6, 1.0), tuple(np.clip(np.array(col) * rng.uniform(.85, 1.15), 0, 1)), rng))
    # draw back to front with slightly darker leaves underneath
    order = rng.permutation(len(leaves))
    for idx in order:
        p, a, size, sq, col, r = leaves[idx]
        vein = tuple(np.clip(np.array(col) * 1.13 + .01, 0, 1))
        _draw_leaf(img, p, a, size, sq, col, r, kind, vein)
    a = np.asarray(img, dtype=np.float64) / 255
    # leaf surface: soft cupping shade and a fine noise so flat fills read as tissue
    noise = tile_noise(n, 40, seed + 1, octaves=3)[..., None]
    a[..., :3] = a[..., :3] * (.88 + .24 * noise)
    small = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGBA').resize((n // 2, n // 2), Image.LANCZOS)
    out = pad_color(np.asarray(small, dtype=np.float64) / 255)
    return grade(out, 'oak' if kind == 'maple' else 'ash')


def street_leaf_atlas(n=2048):
    """3x3 atlas of twig cards for every street-tree species (one material for all of them):
    0 maple A, 1 maple B, 2 oak (photo), 3 ash (photo), 4 birch A, 5 birch B, 6 pine (photo), 7 pine dark, 8 maple sapling."""
    imgs, _ = read_glb_images(veg_paths.original('realistic_trees_collection.glb'))
    oak = grade(pad_color(np.asarray(imgs[5].convert('RGBA'), dtype=np.float64) / 255), 'oak')
    ash = grade(pad_color(np.asarray(imgs[2].convert('RGBA'), dtype=np.float64) / 255), 'ash')
    pine = grade(pad_color(np.asarray(imgs[9].convert('RGBA'), dtype=np.float64) / 255), 'pine')
    pine_dark = pine.copy()
    pine_dark[..., :3] = lin_to_srgb(srgb_to_lin(pine_dark[..., :3]) * np.array([.72, .82, .86]))
    cells = [twig_sprite('maple', 11), twig_sprite('maple', 23), oak, ash, twig_sprite('birch', 31), twig_sprite('birch', 47), pine, pine_dark, twig_sprite('maple', 59)]
    c = n // 3
    atlas = np.zeros((c * 3, c * 3, 4))
    for i, cell in enumerate(cells):
        im = Image.fromarray((np.clip(cell, 0, 1) * 255).astype(np.uint8), 'RGBA').resize((c, c), Image.LANCZOS)
        atlas[(i // 3) * c:(i // 3 + 1) * c, (i % 3) * c:(i % 3 + 1) * c] = np.asarray(im, dtype=np.float64) / 255
    atlas = pad_color(atlas)
    out = np.zeros((n, n, 4))
    out[:c * 3, :c * 3] = atlas
    save(out, 'leaf.street__basecolor.png', 'RGBA')
    print('leaf.street atlas', n, '3x3 cells')


def bark_broadleaf(n=1024, seed=71):
    """Neutral grey furrowed bark shared by maple, oak, ash and pine (species tint rides on COLOR_0): long narrow
    interlacing ridges (the plated generator stretched), photo micro-detail from the supplied bark."""
    F1, F2, cid, rng = worley(n, 300, seed, aspect=(1.0, 0.16), warp=40.0)
    edge = F2 - F1
    crack = np.exp(-edge / 4.5)
    ridge = np.clip(edge / 14.0, 0, 1) ** .5
    fine = tile_noise(n, 40, seed + 2, octaves=4)
    H = ridge * (.7 + .3 * rng.uniform(.6, 1, cid.max() + 1)[cid]) + .12 * fine - .4 * crack
    H = (H - H.min()) / np.ptp(H)
    imgs, _ = read_glb_images(veg_paths.original('realistic_trees_collection.glb'))
    photo = seamless(np.asarray(imgs[0].convert('L').resize((n, n), Image.LANCZOS), dtype=np.float64) / 255)
    hp = photo - ndimage.gaussian_filter(photo, 5, mode='wrap')
    g = .30 + .34 * H[..., None] + hp[..., None] * .9 + (rng.uniform(-.04, .04, cid.max() + 1)[cid])[..., None]
    col = np.concatenate([g * 1.0, g * .97, g * .91], -1)
    save(np.clip(col, 0, 1), 'bark.broadleaf__basecolor.png')
    save(normal_from_height(ndimage.gaussian_filter(np.clip(H + hp * .4, 0, 1), .8, mode='wrap'), 10.0), 'bark.broadleaf__normal.png')
    print('bark.broadleaf', n)


def bark_birch(n=1024, seed=83):
    """Paper birch: chalk-white, dark horizontal lenticels, black chevrons where branches were, peeling papery edges."""
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:n, 0:n] / n
    base = .80 + .08 * tile_noise(n, 6, seed, octaves=4) - .05 * tile_noise(n, 30, seed + 1, octaves=2)
    col = np.stack([base * 1.0, base * .985, base * .95], -1)
    H = np.full((n, n), .6)
    img = Image.new('L', (n, n), 0)
    d = ImageDraw.Draw(img)
    for _ in range(260):           # lenticels: short horizontal dark dashes (wrapping)
        cx, cy = rng.uniform(0, n), rng.uniform(0, n)
        L = rng.uniform(n * .02, n * .09)
        w = rng.uniform(1.5, 4.5)
        for ox in (-n, 0, n):
            d.line([(cx - L / 2 + ox, cy), (cx + L / 2 + ox, cy + rng.uniform(-2, 2))], fill=int(rng.uniform(150, 255)), width=int(w))
    for _ in range(5):             # dark scars where twigs were shed: irregular, soft-edged
        cx, cy = rng.uniform(0, n), rng.uniform(0, n)
        s = rng.uniform(n * .02, n * .045)
        pts = [(cx + math.cos(t) * s * (1.6 if abs(math.sin(t)) < .5 else .5) * rng.uniform(.6, 1.2), cy + math.sin(t) * s * .45 * rng.uniform(.6, 1.3) + (s * .3 if abs(math.cos(t)) < .4 else 0)) for t in np.linspace(0, 2 * np.pi, 14, endpoint=False)]
        for ox in (-n, 0, n):
            d.polygon([(x + ox, y) for x, y in pts], fill=int(rng.uniform(170, 230)))
    m = ndimage.gaussian_filter(np.asarray(img, dtype=np.float64) / 255, 1.4, mode='wrap')
    dark = np.array([.08, .07, .065])
    col = col * (1 - m[..., None]) + dark * m[..., None]
    peel = np.clip((tile_noise(n, 10, seed + 3, octaves=3) - .72) * 6, 0, 1)
    col = col * (1 - .25 * peel[..., None]) + np.array([.62, .45, .35]) * (.25 * peel[..., None])
    H = H - .35 * m + .15 * peel + .05 * tile_noise(n, 50, seed + 4, octaves=2)
    save(np.clip(col, 0, 1), 'bark.birch__basecolor.png')
    save(normal_from_height(ndimage.gaussian_filter(H, .8, mode='wrap'), 6.0), 'bark.birch__normal.png')
    print('bark.birch', n)


JOBS.update({'leaf.street': street_leaf_atlas, 'bark.broadleaf': bark_broadleaf, 'bark.birch': bark_birch})


# ================================================================================================== Stage C: ground layer
def _draw_blades(n, rng, count, h=(.6, .95), cols=None, width=(2.5, 5.5), tip_dry=.25):
    from PIL import ImageDraw
    img = Image.new('RGBA', (n * 2, n * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cols = cols or [(.44, .52, .26), (.50, .57, .30), (.40, .48, .24), (.55, .58, .33), (.47, .50, .27)]
    for _ in range(count):
        x0 = rng.uniform(.06, .94) * n * 2
        H = rng.uniform(*h) * n * 2
        lean = rng.normal(0, .18) * H
        c = np.array(cols[rng.integers(len(cols))]) * rng.uniform(.8, 1.15)
        k = 10
        w0 = rng.uniform(*width) * 2
        for i in range(k):
            t0, t1 = i / k, (i + 1) / k
            p0 = (x0 + lean * t0 ** 1.8, n * 2 - H * t0)
            p1 = (x0 + lean * t1 ** 1.8, n * 2 - H * t1)
            cc = c * (.75 + .35 * t0)
            if t0 > 1 - tip_dry:
                cc = cc * .6 + np.array([.55, .5, .32]) * .4
            d.line([p0, p1], fill=tuple(int(v * 255) for v in np.clip(cc, 0, 1)) + (255,), width=max(1, int(w0 * (1 - t0 * .85))))
    return np.asarray(img.resize((n, n), Image.LANCZOS), dtype=np.float64) / 255


def _draw_flowers(n, rng, kind):
    from PIL import ImageDraw
    img = Image.new('RGBA', (n * 2, n * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    N = n * 2
    stems = 9 if kind != 'clover' else 0
    for k in range(stems):
        x0 = rng.uniform(.15, .85) * N
        H = rng.uniform(.55, .95) * N
        top = (x0 + rng.normal(0, .06) * N, N - H)
        d.line([(x0, N), top], fill=(70, 92, 40, 255), width=int(rng.uniform(3, 6)))
        for j in range(3):                        # a few narrow leaves on each stem
            y = N - H * rng.uniform(.1, .6)
            x = x0 + (top[0] - x0) * (N - y) / H
            s = 1 if j % 2 else -1
            d.line([(x, y), (x + s * N * .06, y - N * .05)], fill=(64, 88, 36, 255), width=4)
        cx, cy = top
        if kind == 'lace' and k % 3 != 2:        # Queen Anne's lace: a flat white umbel
            for q in range(60):
                a, r = rng.uniform(0, 2 * np.pi), abs(rng.normal(0, N * .045))
                px, py = cx + math.cos(a) * r * 1.5, cy + math.sin(a) * r * .55
                d.ellipse([px - 4, py - 4, px + 4, py + 4], fill=(236, 232, 214, 255))
        elif kind == 'lace':                     # chicory: pale blue stars along the top
            for q in range(4):
                px, py = cx + rng.normal(0, 10), cy + q * N * .05
                for t in range(10):
                    a = t / 10 * 2 * np.pi
                    d.line([(px, py), (px + math.cos(a) * 16, py + math.sin(a) * 16)], fill=(128, 150, 214, 255), width=5)
        else:                                    # black-eyed Susan
            for t in range(13):
                a = t / 13 * 2 * np.pi + rng.uniform(0, .2)
                d.ellipse([cx + math.cos(a) * 22 - 9, cy + math.sin(a) * 10 - 6, cx + math.cos(a) * 22 + 9, cy + math.sin(a) * 10 + 6], fill=(226, 168, 36, 255))
            d.ellipse([cx - 9, cy - 7, cx + 9, cy + 7], fill=(58, 36, 20, 255))
    if kind == 'clover':                         # low trefoil clover with white heads and a dandelion, seen from above
        for q in range(120):
            cx, cy = rng.uniform(.08, .92) * N, rng.uniform(.08, .92) * N
            g = rng.uniform(.8, 1.1)
            for t in range(3):
                a = t / 3 * 2 * np.pi + rng.uniform(0, 1)
                px, py = cx + math.cos(a) * 14, cy + math.sin(a) * 14
                d.ellipse([px - 13, py - 13, px + 13, py + 13], fill=(int(70 * g), int(110 * g), int(42 * g), 255))
        for q in range(9):
            cx, cy = rng.uniform(.1, .9) * N, rng.uniform(.1, .9) * N
            d.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(238, 232, 222, 255) if q % 4 else (236, 196, 40, 255))
    return np.asarray(img.resize((n, n), Image.LANCZOS), dtype=np.float64) / 255


def ground_atlas(c=512):
    """4x2 atlas (2048x1024) for everything on the ground:
    0 lawn blades (original)  1 tall grass tuft  2 dry grass tuft  3 weed sprig   (1-3: Ali haghshenas, upright, graded)
    4 dried seed stalk (Ali haghshenas)  5 Queen Anne's lace + chicory  6 black-eyed Susans  7 clover + dandelion"""
    imgs, _ = read_glb_images(veg_paths.original('grass_and_bush_-_mobile_gameready.glb'))
    a = np.asarray(imgs[0].convert('RGBA'), dtype=np.float64) / 255

    def take(y0, y1, x0, x1, flip, fam, rot=0):
        t = a[y0:y1, x0:x1].copy()
        if flip:
            t = t[::-1]
        if rot:
            t = np.rot90(t, rot).copy()
        h, w = t.shape[:2]
        side = max(h, w)
        sq = np.zeros((side, side, 4))
        sq[side - h:, (side - w) // 2:(side - w) // 2 + w] = t
        im = Image.fromarray((np.clip(sq, 0, 1) * 255).astype(np.uint8), 'RGBA').resize((c, c), Image.LANCZOS)
        return grade(pad_color(np.asarray(im, dtype=np.float64) / 255), fam)
    rng = np.random.default_rng(2011)
    cells = [_draw_blades(c, rng, 220, h=(.45, .95), tip_dry=.15), take(0, 218, 393, 629, True, 'grass'), take(260, 505, 419, 634, True, 'grass'),
             take(519, 707, 470, 717, False, 'grass', rot=-1), take(483, 732, 824, 1006, True, 'grass'),
             _draw_flowers(c, rng, 'lace'), _draw_flowers(c, rng, 'susan'), _draw_flowers(c, rng, 'clover')]
    # the dry tuft and the seed stalk keep their straw colour (graded toward it, not toward green)
    for k in (2, 4):
        m = cells[k][..., 3] > .5
        lin = srgb_to_lin(cells[k][..., :3])
        lin = lin * (srgb_to_lin([.55, .48, .30]) / np.maximum(lin[m].mean(0), 1e-4))
        cells[k][..., :3] = lin_to_srgb(lin)
    out = np.zeros((c * 2, c * 4, 4))
    for i, cell in enumerate(cells):
        out[(i // 4) * c:(i // 4 + 1) * c, (i % 4) * c:(i % 4 + 1) * c] = cell
    save(pad_color(out), 'ground.atlas__basecolor.png', 'RGBA')
    print('ground atlas', out.shape)


JOBS['ground.atlas'] = ground_atlas


if __name__ == '__main__':
    names = sys.argv[1:] or list(JOBS)
    for k in names:
        JOBS[k]()
