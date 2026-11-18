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


def save(name, base_lin, normal, orm, out, size=RUNTIME, extra=None):
    os.makedirs(out, exist_ok=True)
    files = {}
    b = (lin_to_srgb(base_lin) * 255 + .5).astype(np.uint8)
    im = Image.fromarray(b, 'RGB').resize((size, size), Image.LANCZOS)
    files['basecolor'] = f'house.kit__{name}_basecolor.jpg'
    im.save(os.path.join(out, files['basecolor']), quality=90)
    n = ((normal * .5 + .5) * 255 + .5).astype(np.uint8)
    files['normal'] = f'house.kit__{name}_normal.png'
    Image.fromarray(n, 'RGB').resize((size, size), Image.LANCZOS).save(os.path.join(out, files['normal']), optimize=True)
    o = (np.clip(orm, 0, 1) * 255 + .5).astype(np.uint8)
    files['orm'] = f'house.kit__{name}_orm.png'
    Image.fromarray(o, 'RGB').resize((size, size), Image.LANCZOS).save(os.path.join(out, files['orm']), optimize=True)
    mean = [float(x) for x in base_lin.reshape(-1, 3).mean(0)]
    d = {'files': files, 'mean': mean}
    if extra:
        d.update(extra)
    return d


# ---------------------------------------------------------------------------------------------------------- siding
def siding(N=2048, tile=2.0, seed=11):
    mpp = tile / N
    v = (N - 1 - np.arange(N) + .5) / N * tile          # metres up, per row
    u = (np.arange(N) + .5) / N * tile
    V_, U_ = np.meshgrid(v, u, indexing='ij')
    course = .1
    k = np.floor(V_ / course)
    t = V_ / course - k                                  # 0 at the butt (bottom), 1 at the top of the course
    r = rng(seed)
    # panel rows = 2 courses (double 4"); a lap joint in some rows
    prow = (k // 2).astype(int) % (int(tile / course) // 2)
    joints = {}
    for p in range(int(tile / course) // 2):
        if r.random() < .55:
            joints[p] = r.uniform(.1, tile - .1)
    H = .011 * (1 - t) ** 1.1                             # the lap's wedge: 11 mm at the butt
    butt = np.clip(t / .035, 0, 1)
    H = H * (.55 + .45 * butt ** .5)                      # rounded butt edge
    H += .0035 * np.clip(1 - np.abs(t - .5) / .5, 0, 1) * 0
    # the double-4: a small V groove in the middle of each panel (between its two laps) is the course boundary itself
    shift = np.zeros_like(H)
    for p, x in joints.items():
        m = (prow == p)
        side = (U_ > x) & (U_ < x + .9)
        shift += np.where(m & side, .0012, 0)
        edge = m & (np.abs(U_ - x) < .0015)
        shift -= np.where(edge, .002, 0)
    H += shift
    grain = fbm(N, seed + 3, scales=(64, 24, 8, 3), weights=(.15, .3, .35, .2), aniso=(6, .35))
    H += grain * .00025
    nrm = normal_from_height(H, mpp, 1.0)
    # colour: near-white vinyl, per-panel tone, chalky mottling, dirt settling under each butt
    tone = np.zeros_like(H)
    for p in range(int(tile / course) // 2):
        tone += np.where(prow == p, r.normal(0, .012), 0)
    mott = fbm(N, seed + 7, scales=(512, 160, 40, 10), weights=(.5, .3, .15, .05))
    under = np.exp(-((1 - t) / .06) ** 2) * .06 + np.exp(-(t / .03) ** 2) * .05
    base = .82 * (1 + tone + mott * .025 - under)
    base_rgb = np.stack([base * 1.0, base * .995, base * .985], -1)
    ao = 1 - np.exp(-((1 - t) / .08) ** 2) * .22 - np.exp(-(t / .02) ** 2) * .3
    rough = .52 + mott * .05 + grain * .03 + under * .4
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    return base_rgb, nrm, orm


# ---------------------------------------------------------------------------------------------------------- brick
def brick(N=2048, tile=2.0, seed=23):
    mpp = tile / N
    v = (N - 1 - np.arange(N) + .5) / N * tile
    u = (np.arange(N) + .5) / N * tile
    V_, U_ = np.meshgrid(v, u, indexing='ij')
    ch = tile / 30
    bl = tile / 10
    row = np.floor(V_ / ch).astype(int)
    off = (row % 2) * bl / 2
    col = np.floor((U_ + off) / bl).astype(int) % 10
    fv = V_ / ch - row
    fu = ((U_ + off) / bl) - np.floor((U_ + off) / bl)
    mj = .010
    dv = np.minimum(fv * ch, (1 - fv) * ch)              # distance to the bed joints (m)
    du = np.minimum(fu * bl, (1 - fu) * bl)
    d = np.minimum(dv, du) - mj / 2                       # distance into the brick face
    r = rng(seed)
    ids = (row * 10 + col)
    nb = 30 * 10
    hue = r.normal(0, 1, nb)
    val = r.normal(0, 1, nb)
    flash = r.random(nb) < .12
    base_a = hexlin('#93604c')
    base_b = hexlin('#7e5040')
    mixk = np.clip(.5 + .35 * hue, 0, 1)
    cols = base_a[None, :] * (1 - mixk[:, None]) + base_b[None, :] * mixk[:, None]
    cols *= (1 + .09 * val)[:, None]
    cols[flash] *= .78
    bc = cols[ids]
    # sand-struck face, speckles, darker ends on flashed bricks
    sand = fbm(N, seed + 1, scales=(32, 12, 4, 2), weights=(.2, .3, .3, .2))
    speck = (tile_noise(N, .6, seed + 2) > .82).astype(np.float32)
    bc *= (1 + .07 * sand[..., None] - .25 * speck[..., None])
    edge = np.clip(d / .004, 0, 1)                        # rounded arrises over 4 mm
    chip = (fbm(N, seed + 5, scales=(24, 8, 3, 1)) > .42) & (d < .006)
    face_h = .008 * edge ** .6 - chip * .003 + sand * .0004
    mortar = d < 0
    mort_h = .0 + fbm(N, seed + 9, scales=(8, 3, 1, .5)) * .0006
    H = np.where(mortar, mort_h, face_h)
    nrm = normal_from_height(H, mpp, 1.0)
    mc = hexlin('#a49d90') * (1 + .06 * fbm(N, seed + 11, scales=(64, 16, 4, 1))[..., None])
    base = np.where(mortar[..., None], mc, bc)
    ao = np.where(mortar, .62, 1 - .25 * (1 - edge))
    rough = np.where(mortar, .95, .86 + .05 * sand)
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    return base, nrm, orm


# ---------------------------------------------------------------------------------------------------------- roof
def shingle(N=2048, tile=2.0, seed=37):
    mpp = tile / N
    v = (N - 1 - np.arange(N) + .5) / N * tile          # v runs UP the slope (toward the ridge)
    u = (np.arange(N) + .5) / N * tile
    V_, U_ = np.meshgrid(v, u, indexing='ij')
    ex = tile / 16
    tab = tile / 6
    row = np.floor(V_ / ex).astype(int)
    t = V_ / ex - row                                    # 0 at the butt (downhill edge), 1 under the next course
    off = (row % 2) * tab / 2 + ((row // 2) % 3) * tab * .17
    fu = (U_ + off) / tab
    tabi = np.floor(fu).astype(int) % 6
    du = (fu - np.floor(fu)) * tab
    key = (np.minimum(du, tab - du) < .003)              # 6 mm keyway between tabs
    r = rng(seed)
    nt = 16 * 6
    tone = r.normal(0, 1, nt)
    ids = row * 6 + tabi
    H = .006 * (1 - t) + .0
    H = np.where(key, .0005, H)
    gran = tile_noise(N, .55, seed + 4)
    H += gran * .00035
    nrm = normal_from_height(H, mpp, 1.0)
    # granule blend: four tones, salt and pepper, per-tab value
    g2 = tile_noise(N, .45, seed + 8)
    g3 = tile_noise(N, .7, seed + 12)
    g4 = tile_noise(N, 1.1, seed + 13)
    base = .30 + .085 * gran + .06 * g2 + .05 * (g3 > .5) - .06 * (g4 < -.55) + .04 * (g4 > .6)
    base = base * (1 + .07 * tone[ids])
    # a little blend drift across each tab (the factory's colour drop)
    base *= 1 + .03 * np.sin(fu * 2.1 + row * .7)
    # algae/rain streaks running down the slope (subtle), lighter granule loss here and there
    streak = tile_noise(N, 3.0, seed + 15, aniso=(.25, 18))
    base *= (1 - .06 * np.clip(streak - .2, 0, 1))
    loss = (fbm(N, seed + 17, scales=(40, 12, 4, 1)) > .55) * .03
    base += loss
    under = np.where(key, 1.0, 0.0) + np.exp(-(t / .045) ** 2) * .85 + np.exp(-((1 - t) / .03) ** 2) * .15
    base *= (1 - .55 * np.clip(under, 0, 1))
    rgb = np.stack([base * 1.0, base * .985, base * .965], -1)
    ao = 1 - .5 * np.clip(under, 0, 1)
    rough = .9 + .05 * gran
    orm = np.stack([ao, rough, np.zeros_like(ao)], -1)
    return rgb, nrm, orm


# ---------------------------------------------------------------------------------------------------------- concrete
def concrete(N=2048, tile=2.0, seed=41):
    mpp = tile / N
    broom = tile_noise(N, 1.2, seed, aniso=(40, .4))
    agg = tile_noise(N, .8, seed + 1)
    pits = (tile_noise(N, .5, seed + 2) < -.7).astype(np.float32)
    blot = fbm(N, seed + 3, scales=(700, 240, 80, 20), weights=(.45, .3, .17, .08))
    H = broom * .0004 + agg * .0002 - pits * .0007
    nrm = normal_from_height(H, mpp, 1.0)
    base = .5 * (1 + .07 * blot + .04 * agg - .15 * pits + .02 * broom)
    rgb = np.stack([base * 1.0, base * .985, base * .955], -1)
    ao = 1 - .3 * pits
    rough = .9 + .04 * agg
    return rgb, nrm, np.stack([ao, rough, np.zeros_like(ao)], -1)


# ---------------------------------------------------------------------------------------------------------- painted wood
def painted(N=2048, tile=1.0, seed=53):
    mpp = tile / N
    grain = fbm(N, seed, scales=(40, 16, 6, 2), weights=(.3, .35, .25, .1), aniso=(30, .5))
    rings = np.sin(fbm(N, seed + 4, scales=(300, 120, 30, 8), aniso=(12, .6)) * 40)
    brush = tile_noise(N, .8, seed + 6, aniso=(60, .3))
    H = grain * .00025 + rings * .00012 + brush * .00008
    nrm = normal_from_height(H, mpp, 1.0)
    blot = fbm(N, seed + 9, scales=(500, 200, 60, 10))
    base = .88 * (1 + .012 * grain + .02 * blot)
    rgb = np.stack([base, base * .997, base * .99], -1)
    ao = np.ones_like(base)
    rough = .58 + .06 * brush + .04 * blot
    return rgb, nrm, np.stack([ao, rough, np.zeros_like(ao)], -1)


FAMILIES = {
    'siding': (siding, {'normal_strength': 1.0}),
    'brick': (brick, {'normal_strength': 1.0}),
    'roof': (shingle, {'normal_strength': 1.0}),
    'concrete': (concrete, {'normal_strength': .8}),
    'paint': (painted, {'normal_strength': .6}),
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
        lib['families'][name] = save(name, b, n, o, out, extra=extra)
        print(name, 'mean', [round(x, 3) for x in lib['families'][name]['mean']], flush=True)
    lib['note'] = 'Synthesized by tools/blender/houses/house_textures.py (original; no photographs or third-party textures). Runtime 1024 px.'
    json.dump(lib, open(meta_path, 'w'), indent=1)


if __name__ == '__main__':
    main()
