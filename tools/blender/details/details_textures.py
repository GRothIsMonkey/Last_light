"""Neighborhood-details atlases for the ?details benchmark (original work, generated here with numpy and Pillow; the one
exception is the weathered fence wood, copied from the street-props atlas, which comes from DmitriyGDS's "Wooden Fence",
CC BY 4.0; the sign lettering uses the Overpass typeface, SIL OFL 1.1, vendored in assets/source/details/fonts/).

    python3 tools/blender/details/details_textures.py

Writes assets/source/details/textures/:
  details_albedo.jpg   2048^2 sRGB   T1-11 shed siding, 3-tab shingles, weathered fence wood, lawn-chair webbing, trampoline
                                     mat, basketball, playground ball, kiddie-pool print, clothes, perforated sign post, swatches
  details_orm.png      1024^2        R paint mask (the game tints it per object), G roughness, B metalness
  details_normal.png   1024^2        tangent-space normals (OpenGL: +Y up)
  details_cutout.png   512^2 RGBA    chain link (the street props' 0.4 m tile), trampoline enclosure netting, swing chain
  details_signs.jpg    2048x1024     sign faces: three street-name blades, STOP, SPEED LIMIT 25, SLOW CHILDREN AT PLAY,
                                     NO OUTLET, and the aluminium back
  details_atlas.json   pixel rectangles of every region (origin top-left)
Deterministic: fixed seeds only.
"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'source', 'details', 'textures')
FONTS = os.path.join(ROOT, 'assets', 'source', 'details', 'fonts')
PROPS = os.path.join(ROOT, 'assets', 'source', 'street', 'textures')
S = 2048


def vnoise(h, w, cy, cx, seed):
    r = np.random.default_rng(seed).random((max(2, cy), max(2, cx))).astype(np.float32)
    return np.asarray(Image.fromarray((r * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255


def fbm(h, w, cells, octaves, seed, gain=.5):
    out, amp, tot = np.zeros((h, w), np.float32), 1., 0.
    for o in range(octaves):
        c = cells * 2 ** o
        out += amp * vnoise(h, w, max(2, int(c * h / max(h, w))), max(2, int(c * w / max(h, w))), seed + o * 17)
        tot += amp
        amp *= gain
    return out / tot


def h2n(hm, strength):
    """height map (rows down) -> OpenGL tangent-space normal, encoded"""
    gy, gx = np.gradient(hm.astype(np.float32))
    n = np.dstack((-gx * strength, gy * strength, np.ones_like(hm, np.float32)))
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return ((n * .5 + .5) * 255).clip(0, 255).astype(np.uint8)


def srgb2lin(c):
    c = np.asarray(c, np.float32) / 255
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)


def lin2srgb(c):
    c = np.clip(c, 0, 1)
    return (np.where(c <= .0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - .055) * 255).clip(0, 255).astype(np.uint8)


def build():
    os.makedirs(OUT, exist_ok=True)
    rng = np.random.default_rng(2011)
    A = np.zeros((S, S, 3), np.uint8)
    A[:] = (120, 120, 120)
    N = np.zeros((S // 2, S // 2, 3), np.uint8)
    N[:] = (128, 128, 255)
    O = np.zeros((S // 2, S // 2, 3), np.float32)
    O[:] = (0, .8, 0)
    lay = {'size': S, 'tiles': {}, 'swatch': {}, 'cutout': {}, 'signs': {}, 'sources': {}}

    def put(name, x, y, alb, nrm=None, orm=None):
        h, w = alb.shape[:2]
        A[y:y + h, x:x + w] = alb
        if nrm is not None:
            N[y // 2:(y + h) // 2, x // 2:(x + w) // 2] = np.asarray(Image.fromarray(nrm).resize((w // 2, h // 2), Image.LANCZOS))
        if orm is not None:
            o8 = Image.fromarray((np.clip(orm, 0, 1) * 255).astype(np.uint8)).resize((w // 2, h // 2), Image.BILINEAR)
            O[y // 2:(y + h) // 2, x // 2:(x + w) // 2] = np.asarray(o8, np.float32) / 255
        lay['tiles'][name] = [x, y, w, h]

    # ---------------------------------------------------------------------------------------------- T1-11 shed siding
    # 1024 x 512 covers a 2.6 m wall, 2.1 m high: grooved plywood (grooves 8 in on centre), painted; the paint is the
    # game's tint (mask 1): albedo mid-grey with the plywood face, grooves, sun-fade at the top, soil splash at the foot
    h, w = 512, 1024
    xs = np.arange(w)[None, :] / w * 2.6
    gpos = (xs % .2032) / .2032
    groove = np.repeat((np.abs(gpos - .5) < .024).astype(np.float32), h, 0)
    grain = fbm(h, w, 6, 4, 11) * .5 + vnoise(h, w, 4, 300, 12) * .5
    base = .5 + (grain - .5) * .08
    ys = np.arange(h)[:, None] / h
    alb = base * (1 - groove * .45) * (1 + .05 * (1 - ys)) * (1 - .25 * np.clip((ys - .9) / .1, 0, 1) * fbm(h, w, 30, 3, 13))
    alb = np.repeat(alb[..., None], 3, 2)
    hm = -groove * 3 + (grain - .5) * .4
    orm = np.dstack((np.clip(1 - groove * .3, 0, 1), np.full((h, w), .72) + groove * .15, np.zeros((h, w))))
    put('siding', 0, 0, (alb * 255).clip(0, 255).astype(np.uint8), h2n(hm, 1.6), orm)

    # ---------------------------------------------------------------------------------------------- 3-tab shingles
    # 512^2 covers 1.5 m: courses of 5 in exposure, 12 in tabs, the slots shifting 6 in each course; tintable (mask 1)
    h = w = 512
    px = 512 / 1.5
    ys = np.arange(h)[:, None] / px
    xs = np.arange(w)[None, :] / px
    course = np.floor(ys / .127)
    yin = (ys % .127) / .127
    shift = (course % 2) * .1524
    tabx = (xs + shift) % .3048
    slot = (tabx < .006).astype(np.float32)
    yin, slot = np.broadcast_arrays(yin, slot)
    tabid = np.floor((xs + shift) / .3048) + course * 17
    tabv = (np.sin(tabid * 12.9898) * 43758.5453) % 1
    gran = vnoise(h, w, 256, 256, 21) * .6 + fbm(h, w, 16, 3, 22) * .4
    alb = .5 * (.86 + .22 * tabv) * (.8 + .4 * gran)
    alb *= 1 - .45 * np.clip(1 - yin / .12, 0, 1)            # the shadow line under the course above
    alb *= 1 - slot * .6
    streak = fbm(h, w, 5, 3, 23)
    alb *= 1 - .12 * np.clip(streak - .55, 0, 1) * 4
    alb = np.repeat(alb[..., None], 3, 2)
    hm = yin * 1.2 - slot * 2 + (gran - .5) * .5
    orm = np.dstack((np.ones((h, w)), np.full((h, w), .9), np.zeros((h, w))))
    put('shingles', 1024, 0, (alb * 255).clip(0, 255).astype(np.uint8), h2n(hm, 2.2), orm)

    # ---------------------------------------------------------------------------------------------- weathered fence wood
    # the street props' weathered grey board (DmitriyGDS, CC BY 4.0), copied so the lookout's rails match Oak Hollow's fences
    pa = Image.open(os.path.join(PROPS, 'props_albedo.jpg')).convert('RGB')
    pn = Image.open(os.path.join(PROPS, 'props_normal.png')).convert('RGB')
    po = Image.open(os.path.join(PROPS, 'props_orm.png')).convert('RGB')
    pl = json.load(open(os.path.join(PROPS, 'props_atlas.json')))
    tx, ty, tw, th = pl['tiles']['wood_grey']
    A[0 + 0:512, 1536:2048] = np.asarray(pa.crop((tx, ty, tx + tw, ty + th)).resize((512, 512), Image.LANCZOS))
    N[0:256, 768:1024] = np.asarray(pn.crop((tx // 2, ty // 2, (tx + tw) // 2, (ty + th) // 2)).resize((256, 256), Image.LANCZOS))
    O[0:256, 768:1024] = np.asarray(po.crop((tx // 2, ty // 2, (tx + tw) // 2, (ty + th) // 2)).resize((256, 256), Image.BILINEAR), np.float32) / 255
    O[0:256, 768:1024, 0] = 0
    lay['tiles']['wood_grey'] = [1536, 0, 512, 512]
    lay['sources']['wood_grey'] = 'street-props atlas tile wood_grey (DmitriyGDS "Wooden Fence", CC BY 4.0, graded)'

    # ---------------------------------------------------------------------------------------------- lawn-chair webbing
    # 512^2 covers 0.5 m: 2 1/4 in polypropylene straps woven over and under; the strap's middle is the chair's colour
    # (mask 1), its edges white; the gaps between straps dark
    h = w = 512
    px = 512 / .5
    pitch = .062
    yy, xx = np.mgrid[0:h, 0:w] / px
    ry, rx = (yy % pitch) / pitch, (xx % pitch) / pitch
    iy, ix = np.floor(yy / pitch), np.floor(xx / pitch)
    over_h = ((iy + ix) % 2 == 0)
    in_h = ry < .92
    in_v = rx < .92
    top_h = in_h & (over_h | ~in_v)
    top_v = in_v & ~top_h
    acr = np.where(top_h, ry / .92, np.where(top_v, rx / .92, .5))
    edge = (np.abs(acr - .5) > .3)
    crown = 1 - (acr - .5) ** 2 * 1.6
    alb = np.where(edge[..., None], np.array([238, 236, 228], np.float32) / 255, .5)
    alb = alb * crown[..., None] * (.92 + .08 * vnoise(h, w, 64, 64, 31)[..., None])
    gap = ~(top_h | top_v)
    alb[gap] = .05
    mask = (~edge & ~gap).astype(np.float32)
    hm = np.where(gap, -1., crown + np.where(top_h, .3, 0.))
    orm = np.dstack((mask, np.full((h, w), .62), np.zeros((h, w))))
    put('webbing', 0, 512, (alb * 255).clip(0, 255).astype(np.uint8), h2n(hm, 3.), orm)

    # ---------------------------------------------------------------------------------------------- trampoline mat
    # 512^2 maps the 3.4 m mat (planar): black woven polypropylene, a stitched band at its edge with the V-ring loops
    h = w = 512
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot(xx - 255.5, yy - 255.5) / 256
    weave = (np.sin(xx * 1.9) * np.sin(yy * 1.9) * .5 + .5)
    alb = (.075 + .03 * weave + .02 * vnoise(h, w, 48, 48, 41))
    band = (r > .945).astype(np.float32)
    ang = np.arctan2(yy - 255.5, xx - 255.5)
    loops = band * (np.cos(ang * 96) > .6)
    alb = alb * (1 - band * .2) + band * .06 + loops * .25
    alb = np.repeat(alb[..., None], 3, 2)
    hm = weave * .4 + band * .8 + loops * 1.2
    orm = np.dstack((np.zeros((h, w)), np.full((h, w), .78), loops * .8))
    put('mat', 512, 512, (alb * 255).clip(0, 255).astype(np.uint8), h2n(hm, 1.5), orm)

    # ---------------------------------------------------------------------------------------------- balls (equirectangular)
    # basketball: pebbled orange leather-look rubber, the black channels: the two great circles and the two curved seams
    h, w = 256, 512
    v, u = np.mgrid[0:h, 0:w]
    lat = (v / h - .5) * math.pi
    lon = u / w * 2 * math.pi
    d1 = np.abs(np.sin(lon)) * np.cos(lat)                       # meridian great circle through lon 0 / pi
    d2 = np.abs(np.sin(lat))                                      # equator
    curve = .62 * np.cos(lon)                                     # two curved seams (one each side)
    wave = np.arcsin(np.clip(curve, -1, 1))
    seam = np.minimum(np.minimum(d1, d2), np.minimum(np.abs(lat - wave), np.abs(lat + wave)))
    line = np.clip(1 - seam / .035, 0, 1)
    peb = vnoise(h, w, 128, 256, 51)
    orange = np.array([196, 92, 40], np.float32) / 255 * (.88 + .2 * peb)[..., None]
    alb = orange * (1 - line[..., None]) + np.array([.05, .04, .04]) * line[..., None]
    hm = peb * .6 - line * 2
    orm = np.dstack((np.zeros((h, w)), .62 + .12 * line, np.zeros((h, w))))
    put('basketball', 1024, 512, lin2srgb(srgb2lin(alb * 255)), h2n(hm, 2.), orm)
    # playground ball: white rubber, pebbled, a moulded seam round its middle, scuffed grey
    peb = vnoise(h, w, 128, 256, 52)
    sc = fbm(h, w, 6, 3, 53)
    seam = np.clip(1 - np.abs(lat) / .03, 0, 1)
    alb = (np.array([236, 233, 224], np.float32) / 255 * (.9 + .1 * peb)[..., None]) * (1 - .07 * np.clip(sc - .55, 0, 1) * 3)[..., None]
    alb *= (1 - .25 * seam)[..., None]
    put('playball', 1024, 768, (alb * 255).clip(0, 255).astype(np.uint8), h2n(peb * .5 - seam, 1.5),
        np.dstack((np.zeros((h, w)), np.full((h, w), .55), np.zeros((h, w)))))

    # ---------------------------------------------------------------------------------------------- kiddie-pool print
    # 512 x 256: the inside of a hard plastic wading pool: blue, a lighter printed ring of fish and bubbles (original shapes)
    h, w = 256, 512
    im = Image.new('RGB', (w, h), (58, 128, 186))
    d = ImageDraw.Draw(im)
    r2 = np.random.default_rng(61)
    for k in range(18):
        cx, cy = int(r2.random() * w), int(r2.random() * h)
        s = 10 + int(r2.random() * 14)
        col = (92, 168, 214) if k % 3 else (232, 196, 82)
        d.ellipse([cx - s, cy - s * .55, cx + s, cy + s * .55], fill=col)
        d.polygon([(cx + s, cy), (cx + s + s * .7, cy - s * .5), (cx + s + s * .7, cy + s * .5)], fill=col)
        d.ellipse([cx - s * .6, cy - s * .2, cx - s * .4, cy], fill=(30, 52, 80))
    for k in range(40):
        cx, cy, s = int(r2.random() * w), int(r2.random() * h), 2 + int(r2.random() * 4)
        d.ellipse([cx - s, cy - s, cx + s, cy + s], outline=(150, 204, 232), width=1)
    alb = np.asarray(im.filter(ImageFilter.GaussianBlur(.6)), np.float32) * (.94 + .06 * vnoise(h, w, 32, 64, 62))[..., None]
    put('poolprint', 1536, 512, alb.clip(0, 255).astype(np.uint8), None,
        np.dstack((np.zeros((h, w)), np.full((h, w), .32), np.zeros((h, w)))))

    # ---------------------------------------------------------------------------------------------- clothes on the line
    # 512 x 256: three garments, 170 px each: a cream sheet with a blue hem stripe, a blue-grey towel with woven bands,
    # a terracotta T-shirt (their colours are the procedural line's)
    h, w = 256, 512
    alb = np.zeros((h, w, 3), np.float32)
    weave = vnoise(h, w, 128, 256, 71)
    for k, col in enumerate(((216, 210, 196), (138, 160, 184), (194, 122, 106))):
        x0 = k * 170
        c = np.array(col, np.float32) / 255 * (.9 + .1 * weave[:, x0:x0 + 170, None])
        if k == 0:
            c[220:232] = np.array((96, 126, 168)) / 255
        if k == 1:
            for y0 in (30, 214):
                c[y0:y0 + 10] *= .82
            c *= (.92 + .08 * (np.sin(np.arange(170) * 2.4)[None, :, None] * .5 + .5))
        if k == 2:
            c[:, :, :] *= 1
        alb[:, x0:x0 + 170] = c
    put('clothes', 1536, 768, (alb * 255).clip(0, 255).astype(np.uint8), h2n(weave * .6, 1.),
        np.dstack((np.zeros((h, w)), np.full((h, w), .9), np.zeros((h, w)))))

    # ---------------------------------------------------------------------------------------------- perforated sign post
    # 64 x 1024 strip: one face of a 2 in square galvanized post, 3.0 m, 7/16 in holes on 1 in centres
    h, w = 1024, 64
    yy, xx = np.mgrid[0:h, 0:w]
    pxm = h / 3.0
    hole = (np.hypot(xx - 31.5, (yy % (pxm * .0254)) - pxm * .0127) < pxm * .0056).astype(np.float32)
    spang = vnoise(h, w, 80, 6, 81) * .5 + vnoise(h, w, 400, 30, 82) * .5
    alb = (np.array([156, 158, 155], np.float32) / 255 * (.88 + .2 * spang)[..., None]) * (1 - hole[..., None] * .92)
    put('post', 1984, 1024, (alb * 255).clip(0, 255).astype(np.uint8), h2n(-hole * 2 + spang * .3, 1.5),
        np.dstack((np.zeros((h, w)), .38 + hole * .5, .9 - hole * .8)))

    # ---------------------------------------------------------------------------------------------- swatches
    SW = [  # name, sRGB, roughness, metalness, mask, noise
        ('galv', (168, 171, 168), .45, .45, 0, .14), ('alu', (196, 198, 194), .38, .55, 0, .08), ('alu_cast', (172, 172, 167), .5, .45, 0, .12),
        ('iron_black', (32, 32, 31), .55, .4, 0, .1), ('enamel_black', (24, 24, 25), .28, .15, 0, .06), ('chrome', (206, 206, 204), .14, 1, 0, .04),
        ('rubber', (30, 30, 30), .9, 0, 0, .08), ('tire', (34, 34, 33), .85, 0, 0, .1),
        ('paint_tint', (128, 128, 128), .48, .1, 1, .06), ('plastic_tint', (128, 128, 128), .52, 0, 1, .05), ('resin_white', (232, 230, 222), .5, 0, 0, .05),
        ('plastic_red', (178, 46, 36), .42, 0, 0, .05), ('plastic_yellow', (226, 184, 50), .42, 0, 0, .05), ('plastic_blue', (46, 88, 152), .45, 0, 0, .05),
        ('plastic_black', (38, 38, 40), .55, 0, 0, .05), ('hose_green', (50, 98, 56), .5, 0, 0, .05),
        ('hose_dark', (40, 46, 44), .6, 0, 0, .05), ('brass', (178, 140, 64), .32, .9, 0, .08), ('wagon_red', (152, 34, 28), .38, .25, 0, .07),
        ('swing_green', (62, 92, 52), .45, .35, 0, .1), ('slide_yellow', (228, 188, 54), .3, 0, 0, .04), ('pad_blue', (40, 74, 132), .45, 0, 0, .05),
        ('poly_black', (30, 30, 32), .7, 0, 0, .05), ('foam', (42, 42, 44), .8, 0, 0, .05),
        ('paint_white', (232, 230, 222), .62, 0, 0, .06), ('trim_white', (226, 224, 214), .55, 0, 0, .05), ('pool_blue', (60, 132, 192), .3, 0, 0, .04),
        ('rope', (222, 218, 206), .9, 0, 0, .1), ('pin_wood', (198, 170, 122), .8, 0, 0, .12), ('concrete', (168, 163, 154), .92, 0, 0, .18),
        ('urethane', (204, 208, 176), .38, 0, 0, .05), ('grip_tape', (42, 42, 42), .95, 0, 0, .25),
        ('spring_steel', (150, 152, 150), .4, .5, 0, .1), ('seat_vinyl', (32, 32, 32), .6, 0, 0, .05), ('wood_post', (126, 104, 80), .85, 0, 0, .2),
        ('copper_green', (108, 140, 112), .6, .3, 0, .15), ('ash', (88, 86, 82), .95, 0, 0, .3), ('wheel_white', (226, 224, 216), .45, 0, 0, .05),
    ]
    for i, (name, c, ro, me, mk, nz) in enumerate(SW):
        x, y = (i % 8) * 128, 1024 + (i // 8) * 128
        a = np.ones((128, 128, 3), np.float32) * np.array(c, np.float32)
        nn = vnoise(128, 128, 16, 16, 100 + i)
        a *= (1 + nz * (nn - .5))[..., None] * (1 + nz * .5 * (rng.random((128, 128, 1)) - .5))
        A[y:y + 128, x:x + 128] = np.clip(a, 0, 255).astype(np.uint8)
        O[y // 2:(y + 128) // 2, x // 2:(x + 128) // 2] = (mk, ro, me)
        lay['swatch'][name] = [x, y, 128, 128]

    # ---------------------------------------------------------------------------------------------- paint-mask level
    # The game paints masked texels as tint x albedo x 2 (in linear), the street props' rule; so that a recorded colour comes
    # out as itself, every masked region's albedo averages 0.46 linear, the street-props atlas's level (0.42-0.47): its
    # pattern (grooves, granules, weave) is kept, only its level is set.
    MASK = np.asarray(Image.fromarray((O[..., 0] * 255).clip(0, 255).astype(np.uint8)).resize((S, S), Image.NEAREST)) > 127
    lay['maskLevel'] = {}
    for name, (x, y, w, h) in list(lay['tiles'].items()) + list(lay['swatch'].items()):
        m = MASK[y:y + h, x:x + w]
        if m.mean() < .02:
            continue
        reg = srgb2lin(A[y:y + h, x:x + w])
        mean = float(reg[m].mean())
        reg[m] *= .46 / max(mean, 1e-3)
        A[y:y + h, x:x + w] = np.where(m[..., None], lin2srgb(reg), A[y:y + h, x:x + w])
        lay['maskLevel'][name] = [round(mean, 3), .46]
    Image.fromarray(A).save(os.path.join(OUT, 'details_albedo.jpg'), quality=90, subsampling=0, optimize=True)
    Image.fromarray(N).save(os.path.join(OUT, 'details_normal.png'), optimize=True)
    Image.fromarray((O * 255).clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, 'details_orm.png'), optimize=True)

    # ---------------------------------------------------------------------------------------------- cut-outs
    C = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(C)
    chain = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    dc = ImageDraw.Draw(chain)
    for k in range(-8, 9):           # chain link: the street props' 2 in mesh, 8 diamonds across a 0.4 m tile
        x = k * 32
        dc.line([(x, 0), (x + 256, 256)], fill=(170, 172, 168, 255), width=3)
        dc.line([(x + 256, 0), (x, 256)], fill=(170, 172, 168, 255), width=3)
    C.paste(chain, (0, 0))
    net = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    dn = ImageDraw.Draw(net)
    for k in range(0, 256, 16):      # enclosure netting: 1.6 in square mesh, a 0.4 m tile, black polyethylene
        dn.line([(k, 0), (k, 256)], fill=(26, 26, 28, 255), width=2)
        dn.line([(0, k), (256, k)], fill=(26, 26, 28, 255), width=2)
    C.paste(net, (256, 0))
    links = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    dl = ImageDraw.Draw(links)
    for k in range(2):               # swing chain: two links per tile, one face-on, one edge-on (0.06 m of chain)
        y0 = k * 128
        if k == 0:
            dl.rounded_rectangle([88, y0 + 4, 168, y0 + 124], radius=38, outline=(168, 170, 166, 255), width=20)
        else:
            dl.rounded_rectangle([116, y0 - 10, 140, y0 + 138], radius=10, fill=(150, 152, 148, 255))
    C.paste(links, (0, 256))
    Cn = np.asarray(C).copy()
    Cn[..., 3] = np.where(Cn[..., 3] > 0, 255, 0)
    Image.fromarray(Cn).save(os.path.join(OUT, 'details_cutout.png'), optimize=True)
    lay['cutout'] = {'chain': [0, 0, 256, 256], 'net': [256, 0, 256, 256], 'links': [0, 256, 256, 256]}

    signs(lay)
    json.dump(lay, open(os.path.join(OUT, 'details_atlas.json'), 'w'), indent=1)
    print('details atlases ->', OUT)


# -------------------------------------------------------------------------------------------------- the sign faces
def signs(lay):
    """Sign faces at 2x, filtered down: crisp letters at the game's sizes. Proportions after the 2009 MUTCD (blades 4 in
    letters; STOP R1-1 30 in; SPEED LIMIT R2-1 24 x 30 in; 24 in diamonds), lettering in Overpass (Highway Gothic's
    open-source descendant). Slightly weathered: a little fade, dust toward the bottom edge, a few fine scratches."""
    SC = 2
    W, H = 2048 * SC, 1024 * SC
    im = Image.new('RGB', (W, H), (180, 182, 178))
    d = ImageDraw.Draw(im)
    f6 = os.path.join(FONTS, 'overpass-latin-600-normal.woff')
    f7 = os.path.join(FONTS, 'overpass-latin-700-normal.woff')
    GREEN, WHITE, RED, YELLOW, BLACK = (0, 106, 72), (240, 240, 234), (186, 32, 40), (246, 196, 18), (24, 24, 24)

    def font_for(path, cap):           # the font size whose capital H is `cap` px tall
        f = ImageFont.truetype(path, 100)
        b = f.getbbox('H')
        return ImageFont.truetype(path, max(8, int(round(100 * cap / (b[3] - b[1])))))

    def text(cx, cy, s, path, cap, fill, maxw=None):
        f = font_for(path, cap)
        b = f.getbbox(s)
        tw, th = b[2] - b[0], b[3] - b[1]
        layer = Image.new('L', (tw + 8, th + 8), 0)
        ImageDraw.Draw(layer).text((4 - b[0], 4 - b[1]), s, font=f, fill=255)
        if maxw and tw > maxw:          # condensed to fit (as a narrower series would be)
            layer = layer.resize((int((tw + 8) * maxw / tw), th + 8), Image.LANCZOS)
        lw, lh = layer.size
        im.paste(Image.new('RGB', (lw, lh), fill), (int(cx - lw / 2), int(cy - lh / 2)), layer)

    regions = {}
    # street-name blades: 1.2 x 0.19 m (1024 x 162 px), green, a white border, 4 in capitals
    for k, name in enumerate(('OAK HOLLOW DR', 'BRIARWOOD LN', 'SUMMERFIELD RD')):
        x, y, w, h = 0, k * 170, 1024, 162
        X, Y, Wd, Hd = x * SC, y * SC, w * SC, h * SC
        pxm = Wd / 1.2
        r = int(.038 * pxm)
        d.rounded_rectangle([X, Y, X + Wd - 1, Y + Hd - 1], radius=r, fill=GREEN)
        b = int(.006 * pxm)
        d.rounded_rectangle([X + b, Y + b, X + Wd - 1 - b, Y + Hd - 1 - b], radius=r - b, outline=WHITE, width=int(.012 * pxm))
        text(X + Wd / 2, Y + Hd / 2 + 2 * SC, name, f6, .1016 * pxm, WHITE, maxw=Wd - .1 * pxm)
        regions['blade:' + name] = [x, y, w, h]
    # STOP: 30 in octagon, 512 px; a red margin, the white border, the 10 in legend
    x, y, w = 1024, 0, 512
    X, Y, Wd = x * SC, y * SC, w * SC
    pxm = Wd / .762

    def octo(inset):
        R = Wd / 2 / math.cos(math.pi / 8) - inset
        return [(X + Wd / 2 + R * math.cos(math.pi / 8 + k * math.pi / 4), Y + Wd / 2 + R * math.sin(math.pi / 8 + k * math.pi / 4)) for k in range(8)]
    d.polygon(octo(0), fill=RED)
    d.polygon(octo(.0127 * pxm), fill=WHITE)
    d.polygon(octo(.0318 * pxm), fill=RED)
    text(X + Wd / 2, Y + Wd / 2, 'STOP', f7, .254 * pxm, WHITE, maxw=.66 * Wd)   # (a condensed series, as on the real sign)
    regions['stop'] = [x, y, w, w]
    # SPEED LIMIT 25: 24 x 30 in, 410 x 512 px
    x, y, w, h = 1536, 512, 410, 512
    X, Y, Wd, Hd = x * SC, y * SC, w * SC, h * SC
    pxm = Wd / .61
    d.rounded_rectangle([X, Y, X + Wd - 1, Y + Hd - 1], radius=int(.038 * pxm), fill=WHITE)
    d.rounded_rectangle([X + .0095 * pxm, Y + .0095 * pxm, X + Wd - 1 - .0095 * pxm, Y + Hd - 1 - .0095 * pxm], radius=int(.03 * pxm), outline=BLACK, width=int(.016 * pxm))
    text(X + Wd / 2, Y + .16 * Hd, 'SPEED', f6, .1016 * pxm, BLACK)
    text(X + Wd / 2, Y + .33 * Hd, 'LIMIT', f6, .1016 * pxm, BLACK)
    text(X + Wd / 2, Y + .66 * Hd, '25', f6, .254 * pxm, BLACK)
    regions['speed'] = [x, y, w, h]

    # diamonds: a 24 in square turned 45 degrees (0.862 m across), yellow, a black border
    def diamond(x, y, lines):
        w = 512
        X, Y, Wd = x * SC, y * SC, w * SC
        pxm = Wd / .862
        c = (X + Wd / 2, Y + Wd / 2)

        def dia(inset):
            R = Wd / 2 - inset * math.sqrt(2)
            return [(c[0], c[1] - R), (c[0] + R, c[1]), (c[0], c[1] + R), (c[0] - R, c[1])]
        d.polygon(dia(0), fill=YELLOW)
        d.polygon(dia(.0127 * pxm), fill=BLACK)
        d.polygon(dia(.0286 * pxm), fill=YELLOW)
        for cy, s, cap in lines:
            text(c[0], Y + cy * Wd, s, f6, cap * pxm, BLACK, maxw=Wd * (.58 if abs(cy - .5) < .12 else .4))
        return [x, y, w, w]
    regions['children'] = diamond(1536, 0, [(.355, 'SLOW', .1016), (.5, 'CHILDREN', .0762), (.625, 'AT PLAY', .0762)])
    regions['outlet'] = diamond(1024, 512, [(.42, 'NO', .127), (.585, 'OUTLET', .1016)])
    # the plates' backs and edges: mill-finish aluminium with a small inspection sticker
    x, y, w, h = 0, 512, 512, 512
    X, Y = x * SC, y * SC
    al = (vnoise(h * SC, w * SC, 8, 400, 91) * .5 + vnoise(h * SC, w * SC, 200, 30, 92) * .5)
    alu = (np.array([186, 188, 184], np.float32) * (.9 + .16 * al)[..., None]).clip(0, 255).astype(np.uint8)
    im.paste(Image.fromarray(alu), (X, Y))
    d.rectangle([X + 300 * SC, Y + 330 * SC, X + 360 * SC, Y + 370 * SC], fill=(226, 222, 206))
    d.text((X + 304 * SC, Y + 336 * SC), '08 06', fill=(80, 80, 80), font=ImageFont.truetype(f6, 14 * SC))
    regions['back'] = [x, y, w, h]
    # weathering over everything: a slight overall fade and unevenness, dust settling toward each plate's lower edge
    arr = np.asarray(im, np.float32)
    fade = fbm(H // 4, W // 4, 12, 3, 93)
    fade = np.asarray(Image.fromarray((fade * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    arr *= (.95 + .07 * fade)[..., None]
    for key, (x, y, w, h) in regions.items():
        if key == 'back':
            continue
        yy = (np.arange(h * SC) / (h * SC))[:, None, None]
        arr[y * SC:(y + h) * SC, x * SC:(x + w) * SC] *= 1 - .06 * np.clip((yy - .7) / .3, 0, 1)
    r3 = np.random.default_rng(94)
    out = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    ds = ImageDraw.Draw(out)
    for key, (x, y, w, h) in regions.items():
        for k in range(6):
            x0, y0 = (x + r3.random() * w) * SC, (y + r3.random() * h) * SC
            ds.line([(x0, y0), (x0 + (r3.random() - .5) * 60 * SC, y0 + (r3.random() - .5) * 8 * SC)], fill=(205, 205, 200), width=1)
    out = out.resize((2048, 1024), Image.LANCZOS)
    out.save(os.path.join(OUT, 'details_signs.jpg'), quality=94, subsampling=0, optimize=True)
    lay['signs'] = regions


if __name__ == '__main__':
    build()
