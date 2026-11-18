"""Last Light house kit: the shared texture library, synthesized from measurements (no photographs, no third-party
textures). One tiling set per material family, authored at 2048 px and written at runtime size (1024 px):

    family     tile    what is in it
    siding     2 m     double-4" vinyl lap: 20 courses of 0.1 m, butt shadow lines, panel laps staggered, faint woodgrain
    brick      2 m     modular brick, running bond: 30 courses of 66.7 mm, 10 mm recessed mortar, per-brick colour
    roof       2 m     three-tab asphalt shingles: 16 courses of 125 mm, 1/3 m tabs, keyways, granule blend, streaks
    concrete   2 m     broom-finished concrete: aggregate, pits, trowel marks, blotches
    paint      1 m     painted wood: grain along U, brush direction, slight sheen variation

Each family writes basecolor (sRGB JPEG), normal (OpenGL +Y, PNG) and ORM (R occlusion, G roughness, B metal, PNG),
plus its mean base colour (linear) so the kit's vertex colours can put the palette's colour back exactly
(house_build.Tints). Colours are near-neutral; the house's own paint/roof/trim colour rides on the vertices.

    python tools/blender/houses/house_textures.py [--size 2048] [--out assets/source/house/kit/textures]
"""
import os
import sys
import json
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'source', 'house', 'kit', 'textures')
RUNTIME = 1024


def rng(seed):
    return np.random.default_rng(seed)


def tile_noise(n, scale_px, seed, aniso=(1.0, 1.0)):
    """Tileable smooth noise in [-1, 1]: white noise blurred with wrap-around (gaussian, anisotropic)."""
    r = rng(seed)
    w = r.standard_normal((n, n)).astype(np.float32)
    s = ndimage.gaussian_filter(w, sigma=(scale_px * aniso[1], scale_px * aniso[0]), mode='wrap')
    s /= (np.abs(s).max() + 1e-6)
    return s


def fbm(n, seed, scales=(256, 64, 16, 4), weights=(.5, .28, .15, .07), aniso=(1, 1)):
    out = np.zeros((n, n), np.float32)
    for i, (sc, w) in enumerate(zip(scales, weights)):
        out += w * tile_noise(n, sc / 4.0, seed + i * 31, aniso)
    return out


def normal_from_height(H, metres_per_px, strength=1.0):
    """H in metres, image rows top->bottom (row 0 = v near 1). OpenGL normal map (+Y = +v)."""
    gx = (np.roll(H, -1, axis=1) - np.roll(H, 1, axis=1)) / (2 * metres_per_px)
    gy = (np.roll(H, 1, axis=0) - np.roll(H, -1, axis=0)) / (2 * metres_per_px)   # +v is up = smaller row
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(H)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx / l, ny / l, nz / l], -1)


def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def srgb_to_lin(c):
    c = np.asarray(c, dtype=np.float32)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def hexlin(h):
    h = h.lstrip('#')
    return srgb_to_lin(np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32))


def save(name, base_lin, normal, orm, out, size=RUNTIME, extra=None, normal_size=None, orm_size=None):
    os.makedirs(out, exist_ok=True)
    files = {}
    b = (lin_to_srgb(base_lin) * 255 + .5).astype(np.uint8)
    im = Image.fromarray(b, 'RGB').resize((size, size), Image.LANCZOS)
    files['basecolor'] = f'house.kit__{name}_basecolor.jpg'
    im.save(os.path.join(out, files['basecolor']), quality=90)
    n = ((normal * .5 + .5) * 255 + .5).astype(np.uint8)
    files['normal'] = f'house.kit__{name}_normal.png'
    ns = normal_size or size
    Image.fromarray(n, 'RGB').resize((ns, ns), Image.LANCZOS).save(os.path.join(out, files['normal']), optimize=True)
    o = (np.clip(orm, 0, 1) * 255 + .5).astype(np.uint8)
    files['orm'] = f'house.kit__{name}_orm.png'
    os_ = orm_size or size
    Image.fromarray(o, 'RGB').resize((os_, os_), Image.LANCZOS).save(os.path.join(out, files['orm']), optimize=True)
    mean = [float(x) for x in base_lin.reshape(-1, 3).mean(0)]
    d = {'files': files, 'mean': mean, 'sizes': {'basecolor': size, 'normal': ns, 'orm': os_}}
    if extra:
        d.update(extra)
    return d


# ---------------------------------------------------------------------------------------------------------- siding
def siding(N=2048, tile=2.0, seed=11):
    """Double-4" vinyl lap (v2): convex lap faces, deep butt shadow, staggered panel laps with their overlap shadow,
    woodgrain embossing, slow 'oil-canning' waviness, per-panel and per-run tone, chalky mottling."""
    mpp = tile / N
    v = (N - 1 - np.arange(N) + .5) / N * tile
    u = (np.arange(N) + .5) / N * tile
    V_, U_ = np.meshgrid(v, u, indexing='ij')
    course = .1
    k = np.floor(V_ / course)
    t = V_ / course - k                                   # 0 at the butt (bottom), 1 at the top of the course
    r = rng(seed)
    rows = int(tile / course) // 2
    prow = (k // 2).astype(int) % rows
    H = .012 * (1 - t) ** 1.05 + .0011 * np.sin(np.pi * np.clip(t, 0, 1)) # wedge + a slight convex lap face
    butt = np.clip(t / .03, 0, 1)
    H = H * (.5 + .5 * butt ** .45)
    tone = np.zeros_like(H)
    lapmask = np.zeros_like(H)
    for p in range(rows):
        m = (prow == p)
        cuts = sorted(r.uniform(0, tile, size=r.integers(0, 2)))
        x0 = 0.0
        segs = list(cuts) + [tile]
        for x in segs:
            seg = m & (U_ >= x0) & (U_ < x)
            tone += np.where(seg, r.normal(0, .016), 0)
            x0 = x
        for x in cuts:
            side = m & (U_ > x) & (U_ < x + .02)
            H += np.where(side, .0009 * (1 - (U_ - x) / .02), 0)
            lapmask = np.maximum(lapmask, np.where(m & (np.abs(U_ - x) < .004), 1.0, 0.0))
            lapmask = np.maximum(lapmask, np.where(m & (U_ > x) & (U_ < x + .012), .45 * (1 - (U_ - x) / .012), 0.0))
    grain = fbm(N, seed + 3, scales=(48, 20, 8, 3), weights=(.15, .3, .35, .2), aniso=(7, .3))
    H += grain * .00034
    wave = tile_noise(N, 60, seed + 5, aniso=(1.0, .15))
    H += wave * .0006
    nrm = normal_from_height(H, mpp, 1.0)
    mott = fbm(N, seed + 7, scales=(560, 180, 48, 12), weights=(.5, .3, .15, .05))
    chalk = np.clip(fbm(N, seed + 9, scales=(300, 90, 24, 6)) - .15, 0, 1)
    under = np.exp(-((1 - t) / .05) ** 2) * .07 + np.exp(-(t / .028) ** 2) * .16
    base = .82 * (1 + tone + mott * .03 + chalk * .035 - under - lapmask * .06 + grain * .006)
    base_rgb = np.stack([base * 1.0, base * .995, base * .982], -1)
    ao = 1 - np.exp(-((1 - t) / .07) ** 2) * .2 - np.exp(-(t / .02) ** 2) * .38 - lapmask * .2
    rough = .5 + mott * .05 + grain * .04 + chalk * .12 + under * .3
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    return base_rgb, nrm, orm


# ---------------------------------------------------------------------------------------------------------- brick
def brick(N=2048, tile=2.0, seed=23):
    """Modular brick in running bond (v2): four clay tones and flashed ends, sand-struck faces with pits and iron
    specks, slightly irregular brick faces and lengths, chipped arrises, a tooled concave mortar joint of varying
    tone, recessed 8 mm."""
    mpp = tile / N
    v = (N - 1 - np.arange(N) + .5) / N * tile
    u = (np.arange(N) + .5) / N * tile
    V_, U_ = np.meshgrid(v, u, indexing='ij')
    nrows, ncols = 30, 10
    ch = tile / nrows
    bl = tile / ncols
    r = rng(seed)
    row = np.floor(V_ / ch).astype(int)
    off = (row % 2) * bl / 2 + r.normal(0, .004, nrows)[row % nrows]
    jit = r.normal(0, .003, (nrows, ncols + 1))
    uu = U_ + off
    col = np.floor(uu / bl).astype(int) % ncols
    fv = V_ / ch - row
    fu = uu / bl - np.floor(uu / bl)
    # per-brick joint jitter (a few mm) so the bond is not a perfect grid
    ja = jit[row % nrows, col]
    jb = jit[row % nrows, (col + 1) % (ncols + 1)]
    mj = .010
    dv = np.minimum(fv * ch, (1 - fv) * ch)
    du = np.minimum(fu * bl - ja, (1 - fu) * bl + jb)
    d = np.minimum(dv, du) - mj / 2
    ids = (row % nrows) * ncols + col
    nb = nrows * ncols
    tones = [hexlin('#93604c'), hexlin('#7e5040'), hexlin('#a3593e'), hexlin('#6f4a44')]
    pick = r.choice(4, nb, p=[.42, .28, .18, .12])
    val = r.normal(0, 1, nb)
    cols = np.stack([tones[i] for i in pick]) * (1 + .085 * val)[:, None]
    flash = r.random(nb) < .16
    bc = cols[ids]
    # flashed (darker) ends on some bricks
    endd = np.minimum(fu, 1 - fu)
    bc = np.where((flash[ids])[..., None], bc * (1 - .28 * np.exp(-endd / .18))[..., None], bc)
    sand = fbm(N, seed + 1, scales=(28, 10, 4, 1.5), weights=(.2, .3, .3, .2))
    speck = (tile_noise(N, .55, seed + 2) > .8).astype(np.float32)
    pits = (tile_noise(N, .8, seed + 3) < -.78).astype(np.float32)
    bc = bc * (1 + .08 * sand[..., None] - .3 * speck[..., None] - .18 * pits[..., None])
    edge = np.clip(d / .0045, 0, 1)
    chip = (fbm(N, seed + 5, scales=(22, 7, 3, 1)) > .4) & (d < .007)
    tilt = r.normal(0, .0007, (nb, 2))
    face_h = .008 * edge ** .55 - chip * .0035 + sand * .0005 - pits * .0007 + tilt[ids, 0] * (fu - .5) * 2 + tilt[ids, 1] * (fv - .5) * 2
    mortar = d < 0
    md = np.clip(-d / (mj / 2), 0, 1)
    mort_h = .0015 * (1 - md) ** 2 + fbm(N, seed + 9, scales=(8, 3, 1, .5)) * .0005
    H = np.where(mortar, mort_h, face_h)
    nrm = normal_from_height(H, mpp, 1.0)
    mt = fbm(N, seed + 11, scales=(220, 60, 12, 2))
    mc = hexlin('#a49d90')[None, None, :] * (1 + .09 * mt[..., None]) * (1 - .25 * (1 - md)[..., None] * 0 - .15 * md[..., None])
    base = np.where(mortar[..., None], mc, bc)
    ao = np.where(mortar, .5 + .2 * (1 - md), 1 - .28 * (1 - edge))
    rough = np.where(mortar, .96, .84 + .06 * sand)
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    return base, nrm, orm


# ---------------------------------------------------------------------------------------------------------- roof
def shingle(N=2048, tile=2.0, seed=37):
    """Three-tab asphalt shingles (v2): 125 mm exposure, 1/3 m tabs, dark keyways and butt shadows, tabs that sag and
    curl a little, a four-tone granule blend with the factory's blend drops across several tabs, worn and darker
    tabs, faint algae streaks running down the slope."""
    mpp = tile / N
    v = (N - 1 - np.arange(N) + .5) / N * tile
    u = (np.arange(N) + .5) / N * tile
    V_, U_ = np.meshgrid(v, u, indexing='ij')
    ex = tile / 16
    tab = tile / 6
    row = np.floor(V_ / ex).astype(int)
    t = V_ / ex - row
    r = rng(seed)
    off = (row % 2) * tab / 2 + ((row // 2) % 3) * tab * .17
    fu = (U_ + off) / tab
    tabi = np.floor(fu).astype(int) % 6
    du = (fu - np.floor(fu)) * tab
    key = (np.minimum(du, tab - du) < .0035)
    nt = 16 * 6
    tone = r.normal(0, 1, nt)
    worn = r.random(nt) < .07
    ids = row * 6 + tabi
    fx = (du / tab)
    sag = r.normal(0, .0009, nt)[ids] * np.sin(np.pi * fx) + r.normal(0, .0006, nt)[ids] * (fx - .5)
    H = .0065 * (1 - t) ** .9 + sag * (1 - t)
    H = np.where(key, .0004, H)
    gran = tile_noise(N, .5, seed + 4)
    g2 = tile_noise(N, .42, seed + 8)
    g3 = tile_noise(N, .7, seed + 12)
    g4 = tile_noise(N, 1.0, seed + 13)
    H += gran * .0004 + g2 * .0002
    nrm = normal_from_height(H, mpp, 1.0)
    mid = tile_noise(N, 2.6, seed + 21)
    mid2 = tile_noise(N, 7.0, seed + 23)
    base = .3 + .095 * gran + .065 * g2 + .055 * (g3 > .48) - .065 * (g4 < -.5) + .045 * (g4 > .62) + .07 * mid + .05 * mid2
    base = base * (1 + .13 * tone[ids])
    drops = fbm(N, seed + 19, scales=(260, 90, 30, 10), weights=(.5, .3, .15, .05), aniso=(2.2, 1))
    base *= 1 + .13 * drops
    base *= 1 + .03 * np.sin(fu * 2.1 + row * .7)
    base = np.where(worn[ids], base * 1.08 + .015, base)
    streak = tile_noise(N, 3.0, seed + 15, aniso=(.25, 18))
    base *= (1 - .075 * np.clip(streak - .15, 0, 1))
    under = np.where(key, 1.0, 0.0) + np.exp(-(t / .04) ** 2) * .9 + np.exp(-((1 - t) / .03) ** 2) * .15
    base *= (1 - .6 * np.clip(under, 0, 1))
    rgb = np.stack([base * 1.0, base * .985, base * .962], -1)
    ao = 1 - .55 * np.clip(under, 0, 1)
    rough = .88 + .06 * gran
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    return rgb, nrm, orm


# ---------------------------------------------------------------------------------------------------------- concrete
def concrete(N=2048, tile=2.0, seed=41):
    """Broom-finished concrete (v2): broom lines, exposed fines and aggregate, pinholes, soft stains and curing
    blotches, slightly darker, rougher wear."""
    mpp = tile / N
    broom = tile_noise(N, 1.1, seed, aniso=(40, .4))
    agg = tile_noise(N, .8, seed + 1)
    stones = (tile_noise(N, 2.2, seed + 4) > .62).astype(np.float32)
    pits = (tile_noise(N, .5, seed + 2) < -.72).astype(np.float32)
    blot = fbm(N, seed + 3, scales=(700, 240, 80, 20), weights=(.45, .3, .17, .08))
    stain = np.clip(fbm(N, seed + 6, scales=(500, 160, 40, 10)) - .25, 0, 1)
    H = broom * .00045 + agg * .00022 - pits * .0008 + stones * .0002
    nrm = normal_from_height(H, mpp, 1.0)
    base = .5 * (1 + .08 * blot + .045 * agg - .18 * pits + .025 * broom - .12 * stain + .03 * stones)
    rgb = np.stack([base * 1.0, base * .983, base * .95], -1)
    ao = 1 - .35 * pits
    rough = .9 + .05 * agg - .04 * stain
    return rgb, nrm, np.stack([ao, rough, np.zeros_like(ao)], -1)


# ---------------------------------------------------------------------------------------------------------- painted wood
def painted(N=2048, tile=1.0, seed=53):
    """Painted wood and vinyl trim (v2): grain telegraphing through the paint, brush strokes along the board, slight
    orange-peel, a satin sheen that varies; paint built up a little darker in the low spots."""
    mpp = tile / N
    grain = fbm(N, seed, scales=(40, 16, 6, 2), weights=(.3, .35, .25, .1), aniso=(30, .5))
    rings = np.sin(fbm(N, seed + 4, scales=(300, 120, 30, 8), aniso=(12, .6)) * 40)
    brush = tile_noise(N, .9, seed + 6, aniso=(70, .3))
    peel = tile_noise(N, .9, seed + 8)
    H = grain * .0003 + rings * .00014 + brush * .0001 + peel * .00004
    nrm = normal_from_height(H, mpp, 1.0)
    blot = fbm(N, seed + 9, scales=(500, 200, 60, 10))
    base = .88 * (1 + .014 * grain + .024 * blot - .012 * np.clip(-rings, 0, 1))
    rgb = np.stack([base, base * .997, base * .99], -1)
    ao = 1 - .05 * np.clip(-rings, 0, 1)
    rough = .55 + .07 * brush + .05 * blot
    return rgb, nrm, np.stack([ao, rough, np.zeros_like(ao)], -1)


FAMILIES = {
    'siding': (siding, {'normal_strength': 1.0}),
    'brick': (brick, {'normal_strength': 1.0}),
    'roof': (shingle, {'normal_strength': 1.0}),
    'concrete': (concrete, {'normal_strength': .8}),
    'paint': (painted, {'normal_strength': .6}),
}
# runtime size overrides (pixels): fine-grained, low-contrast normal detail that the riding camera cannot resolve at
# 1024 is written at 512 (GPU memory, refinement pass); colour stays 1024 everywhere
SIZES = {
    'concrete': {'normal_size': 512, 'orm_size': 512},
    'paint': {'normal_size': 512},
}


def main():
    a = sys.argv[1:]
    size = 2048
    out = OUT
    only = None
    for i, k in enumerate(a):
        if k == '--size':
            size = int(a[i + 1])
        if k == '--out':
            out = a[i + 1]
        if k == '--only':
            only = a[i + 1].split(',')
    meta_path = os.path.join(out, 'library.json')
    lib = {'families': {}}
    if os.path.exists(meta_path):
        lib = json.load(open(meta_path))
    for name, (fn, extra) in FAMILIES.items():
        if only and name not in only:
            continue
        b, n, o = fn(size)
        lib['families'][name] = save(name, b, n, o, out, extra=extra, **SIZES.get(name, {}))
        print(name, 'mean', [round(x, 3) for x in lib['families'][name]['mean']], flush=True)
    lib['note'] = 'Synthesized by tools/blender/houses/house_textures.py (original; no photographs or third-party textures). Runtime 1024 px.'
    json.dump(lib, open(meta_path, 'w'), indent=1)


if __name__ == '__main__':
    main()
