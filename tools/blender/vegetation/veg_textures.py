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
    F1, F2, cid, rng = worley(n, 760, seed, aspect=(1.0, 0.30), warp=70.0)
    edge = F2 - F1                                     # small along the cracks between plates
    crack = np.exp(-edge / 5.0) * (.75 + .5 * tile_noise(n, 30, seed + 4, octaves=3))   # 1 in the cracks, broken
    plate_h = rng.uniform(.55, 1.0, cid.max() + 1)[cid]
    dome = np.clip(edge / 18.0, 0, 1) ** .45           # plates rise sharply from their edges (flaky)
    fiss = tile_noise(n, 3, seed + 1, octaves=4, aspect=(3.5, .35))   # long vertical fissure network
    fiss = np.clip((fiss - .62) * 4.0, 0, 1)
    fine = tile_noise(n, 48, seed + 2, octaves=4)
    flake = tile_noise(n, 22, seed + 3, octaves=3, aspect=(1, .5))
    H = plate_h * dome * (1 - .85 * fiss) + .12 * fine + .1 * flake - .55 * crack
    H = (H - H.min()) / np.ptp(H)
    # colour
    base = np.array([0.53, 0.51, 0.47])
    tone = (rng.uniform(-.06, .06, cid.max() + 1)[cid])[..., None]
    col = base[None, None] + tone + (fine[..., None] - .5) * .08
    warm = np.array([0.42, 0.36, 0.30])
    dark = np.array([0.20, 0.17, 0.14])
    col = col * (1 - (1 - H[..., None]) * .55) + dark * ((1 - H) ** 3)[..., None] * .55
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
    nrm = normal_from_height(ndimage.gaussian_filter(H2, .7, mode='wrap'), 9.0)
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
    tex = np.asarray(Image.open(os.path.join(TEX, 'bark.white-oak__height.png')).convert('L').resize((n * 2, n * 2)), dtype=np.float64)[:n, :n] / 255
    col = np.asarray(Image.open(os.path.join(TEX, 'bark.white-oak__basecolor.png')).convert('RGB').resize((n * 2, n * 2)), dtype=np.float64)[:n, :n] / 255
    smooth = np.clip(lip * 1.6 + inside, 0, 1)                   # callus and the old cut are smoother than plated bark
    Hb = tex * (1 - smooth) + .5 * smooth
    Hf = np.clip(H * .7 + (Hb - .5) * .3 * (1 - smooth), 0, 1)
    wood = np.array([0.36, 0.33, 0.29])                          # weathered, greyed wood in the old cut
    callus = np.array([0.50, 0.48, 0.44])
    c = col * (1 - smooth[..., None]) + callus * (lip[..., None] * .8)
    c = c * (1 - inside[..., None]) + (wood * (.75 + .25 * tex[..., None])) * inside[..., None]
    c = c * (1 - .45 * groove[..., None])
    yy, xx = np.mgrid[0:n, 0:n] / n
    edge = np.clip(1 - np.maximum(np.abs(xx - .5), np.abs(yy - .5)) * 2, 0, 1)
    alpha = np.clip(edge * 4 + (tile_noise(n, 6, 77) - .5) * .8, 0, 1)
    alpha = (alpha > .5).astype(np.float64)
    rgba = np.concatenate([np.clip(c, 0, 1), alpha[..., None]], -1)
    save(pad_color(rgba), 'detail.oak-carving__basecolor.png', 'RGBA')
    save(normal_from_height(ndimage.gaussian_filter(Hf, 1.0), 14.0), 'detail.oak-carving__normal.png')
    ao = np.clip(1 - .5 * groove * inside - .15 * (1 - Hf), 0, 1)
    save(np.stack([ao, np.full_like(ao, .9) - .1 * smooth, np.zeros_like(ao)], -1), 'detail.oak-carving__orm.png')
    print('detail.oak-carving', n, f'tile {S} m')


JOBS = {'bark.white-oak': bark_white_oak, 'leaf.oak': oak_leaf_atlas, 'detail.oak-carving': carving_decal}

if __name__ == '__main__':
    names = sys.argv[1:] or list(JOBS)
    for k in names:
        JOBS[k]()
