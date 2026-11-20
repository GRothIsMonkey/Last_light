"""Last Light: the street-prop atlases (vehicles & street props benchmark, ?streetprops). numpy + Pillow; deterministic.

    python3 tools/blender/streetprops/street_textures.py props

props_albedo.jpg 2048^2 (PIL pixel layout; UVs in build_props.py come from props_atlas.json):
  P0 [0,0,1024,1024]       utility pole (SLASH / RENDAR, CC BY 4.0): wood shaft, crossarms, insulators, cutouts, transformer
                           (2048 -> 1024; the transformers' rust toned down to an aged galvanized grey with rust at the seams)
  P1 [1024,0,512,512]      fire hydrant (Spellkaze, CC BY 4.0), its red paint repainted the game's hydrant yellow (chips,
                           rust and grime kept)
  P2 [1536,0,512,512]      wheeled cart (peyman.khaleghi, CC BY 4.0): the body a grey shading tinted per cart (paint mask);
                           its recycling mark removed from the body (a plain moulded panel)
  P3 [1024,512,512,512]    galvanized can (peyman.khaleghi, CC BY 4.0)
  P4 [1536,512,512,512]    fence boards, stained (DmitriyGDS, CC BY 4.0, colour graded)
  P5 [1024,1024,512,512]   fence boards painted white, worn (generated from P4)
  P6 [1536,1024,512,512]   fence boards weathered grey (generated from P4)
  P7 [0,1024,1024,1024]    64 swatches (8 x 8, 128^2): original materials (galvanized, painted metals, glass, plastics...)
  P8 [1024,1536,1024,512]  backboard face, brick, house numbers, the lamp's refractor (original work)
props_orm.png 1024^2: R paint mask, G roughness, B metalness.  props_normal.png 1024^2: tangent space (OpenGL, +Y).
props_cutout.png 512^2 RGBA: chain-link diamond tile (left half) and the hoop's net (right half).
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from street_textures import Glb, OUT, srgb_to_lin, lin_to_srgb, font

S = 2048


def img(glb, mat, slot, size, mode='RGB'):
    return glb.tex_image(mat, slot).convert(mode).resize((size, size), Image.LANCZOS)


def flat_normal(w, h):
    return np.full((h, w, 3), (128, 128, 255), np.uint8)


def build():
    os.makedirs(OUT, exist_ok=True)
    rng = np.random.default_rng(1124)
    A = np.zeros((S, S, 3), np.uint8)
    N = np.zeros((S // 2, S // 2, 3), np.uint8)
    N[:] = (128, 128, 255)
    O = np.zeros((S // 2, S // 2, 3), np.float32)
    O[:] = (0, .8, 0)
    lay = {'tiles': {}, 'swatch': {}, 'sources': {}}

    def put(name, x, y, alb, nrm=None, orm=None):
        h, w = alb.shape[:2]
        A[y:y + h, x:x + w] = alb
        if nrm is not None:
            N[y // 2:(y + h) // 2, x // 2:(x + w) // 2] = np.asarray(Image.fromarray(nrm).resize((w // 2, h // 2), Image.LANCZOS))
        if orm is not None:
            O[y // 2:(y + h) // 2, x // 2:(x + w) // 2] = np.asarray(Image.fromarray((orm * 255).astype(np.uint8)).resize((w // 2, h // 2), Image.BILINEAR), np.float32) / 255
        lay['tiles'][name] = [x, y, w, h]

    # P0 utility pole ------------------------------------------------------------------------------------------------
    g = Glb('utility_pole_pbr.glb')
    lay['sources']['pole'] = g.sha
    base = np.asarray(img(g, 'DefaultMaterial', 'baseColorTexture', 1024), np.float32)
    mr = np.asarray(img(g, 'DefaultMaterial', 'metallicRoughnessTexture', 1024), np.float32) / 255   # R ao, G rough, B metal
    nrm = np.asarray(img(g, 'DefaultMaterial', 'normalTexture', 1024))
    # tone the transformers' heavy rust down: where metal is high and the colour is orange-brown, pull toward grey steel
    lin = srgb_to_lin(base)
    lum = lin @ np.array([.2126, .7152, .0722], np.float32)
    warm = np.clip((lin[..., 0] - lin[..., 2]) * 6, 0, 1)
    metal = mr[..., 2]
    steel = np.stack([lum * 1.05 + .02, lum * 1.05 + .02, lum * 1.1 + .025], -1)
    k = (metal > .5)[..., None] * warm[..., None] * .55
    lin = lin * (1 - k) + steel * k
    alb = lin_to_srgb(lin)
    orm = np.stack([np.zeros_like(lum), np.clip(mr[..., 1] * .95 + .04, .25, 1), np.clip(metal * .9, 0, 1)], -1)
    put('pole', 0, 0, alb, nrm, orm)

    # P1 hydrant: red paint -> the game's hydrant yellow ---------------------------------------------------------------
    g = Glb('fire_hydrant.glb')
    lay['sources']['hydrant'] = g.sha
    base = np.asarray(img(g, 'lambert1', 'baseColorTexture', 512), np.float32)
    mr = np.asarray(img(g, 'lambert1', 'metallicRoughnessTexture', 512), np.float32) / 255
    nrm = np.asarray(img(g, 'lambert1', 'normalTexture', 512))
    lin = srgb_to_lin(base)
    r, gg, b = lin[..., 0], lin[..., 1], lin[..., 2]
    red = np.clip((r - np.maximum(gg, b)) / np.maximum(r, 1e-3), 0, 1)              # how much of a texel is the red paint
    shade = np.clip(r / .34, 0, 1.12)                                              # its brightness (chips, grime, edges)
    yellow = srgb_to_lin(np.array([188, 158, 54], np.float32))                     # aged chrome yellow (the game's 0xc8b53a)
    new = yellow[None, None, :] * shade[..., None]
    lin = lin * (1 - red[..., None]) + new * red[..., None]
    orm = np.stack([np.zeros_like(r), np.clip(mr[..., 1] * .9 + .08, .3, 1), mr[..., 2] * (1 - red)], -1)
    put('hydrant', 1024, 0, lin_to_srgb(lin), nrm, orm)

    # P2 cart (recycle bin) and P3 galvanized can ---------------------------------------------------------------------
    g = Glb('trash_cans.glb')
    lay['sources']['trash'] = g.sha
    base = np.asarray(img(g, 'recycle_binlambert3SG', 'baseColorTexture', 512), np.float32)
    mr = np.asarray(img(g, 'recycle_binlambert3SG', 'metallicRoughnessTexture', 512), np.float32) / 255
    nrm = np.asarray(img(g, 'recycle_binlambert3SG', 'normalTexture', 512))
    lin = srgb_to_lin(base)
    r, gg, b = lin[..., 0], lin[..., 1], lin[..., 2]
    body = np.clip((gg - np.maximum(r, b)) * 30, 0, 1)                             # the green moulded body and lid
    lum = lin @ np.array([.2126, .7152, .0722], np.float32)
    med = float(np.median(lum[body > .5])) if (body > .5).any() else .03
    shade = np.clip(lum / max(med, 1e-4), .35, 1.6) * .5
    # the recycling mark moulded into the body: replaced by the plain body (median shading)
    mark = (lum > med * 2.2) & (body < .5) & (mr[..., 2] < .3)
    mk = np.asarray(Image.fromarray((mark * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)), np.float32) / 255
    out = np.where(body[..., None] > .5, shade[..., None], lin)
    out = out * (1 - mk[..., None]) + .5 * mk[..., None]
    mask = np.maximum(body, mk)
    orm = np.stack([mask, np.clip(mr[..., 1], .45, 1), mr[..., 2] * (1 - mask)], -1)
    put('cart', 1536, 0, lin_to_srgb(out), nrm, orm)
    base = np.asarray(img(g, 'lambert8SG', 'baseColorTexture', 512))
    mr = np.asarray(img(g, 'lambert8SG', 'metallicRoughnessTexture', 512), np.float32) / 255
    nrm = np.asarray(img(g, 'lambert8SG', 'normalTexture', 512))
    put('can', 1024, 512, base, nrm, np.stack([np.zeros_like(mr[..., 0]), np.clip(mr[..., 1], .35, 1), mr[..., 2]], -1))

    # P4-P6 fence boards ----------------------------------------------------------------------------------------------
    g = Glb('wooden_fence.glb')
    lay['sources']['fence'] = g.sha
    base = np.asarray(img(g, 'wooden_fence', 'baseColorTexture', 512), np.float32)
    nrm = np.asarray(img(g, 'wooden_fence', 'normalTexture', 512))
    lin = srgb_to_lin(base)
    lum = lin @ np.array([.2126, .7152, .0722], np.float32)
    stain = lin * np.array([1.0, .93, .82], np.float32) * 1.45          # (graded toward the game's own fence tan)
    put('wood', 1536, 512, lin_to_srgb(stain), nrm, np.stack([np.zeros_like(lum), np.full_like(lum, .82), np.zeros_like(lum)], -1))
    # painted white: paint over the grain, worn through where the grain is dark and in blotches
    blot = np.asarray(Image.fromarray((rng.random((64, 64)) * 255).astype(np.uint8)).resize((512, 512), Image.BICUBIC), np.float32) / 255
    wear = np.clip((.38 - lum / max(float(lum.mean()), 1e-4) * .5) * 1.6 + (blot - .82) * 2.5, 0, 1) * .7
    paint = srgb_to_lin(np.array([226, 222, 210], np.float32)) * (.86 + .14 * np.clip(lum / max(float(lum.mean()), 1e-4), 0, 1.3))[..., None]
    pw = paint * (1 - wear[..., None] * .8) + lin * wear[..., None] * .8
    put('wood_white', 1024, 1024, lin_to_srgb(pw), nrm, np.stack([np.zeros_like(lum), .6 + .3 * wear, np.zeros_like(lum)], -1))
    grey = np.stack([lum, lum, lum * .96], -1) * 1.7 + .02
    gw = lin * .35 + grey * .65
    put('wood_grey', 1536, 1024, lin_to_srgb(gw), nrm, np.stack([np.zeros_like(lum), np.full_like(lum, .9), np.zeros_like(lum)], -1))

    # P7 swatches -----------------------------------------------------------------------------------------------------
    SW = [  # name, sRGB, roughness, metalness, mask, noise
        ('galvanized', (150, 152, 150), .42, .9, 0, .14), ('galvanized_dull', (122, 124, 121), .6, .75, 0, .2),
        ('lamp_housing', (156, 156, 148), .5, .55, 0, .1), ('refractor', (226, 220, 196), .18, 0, 0, .04),
        ('powder_black', (34, 33, 31), .5, .2, 0, .08), ('white_paint', (232, 229, 220), .55, 0, 0, .06),
        ('flag_red', (168, 46, 40), .45, .1, 0, .06), ('mailbox_paint', (188, 188, 188), .42, .35, 1, .05),
        ('concrete', (168, 163, 154), .92, 0, 0, .18), ('rubber', (26, 26, 26), .9, 0, 0, .08),
        ('rim_orange', (196, 86, 46), .5, .4, 0, .08), ('cord_white', (224, 221, 210), .95, 0, 0, .1),
        ('aluminum', (196, 196, 192), .38, .9, 0, .08), ('plastic_dark', (43, 44, 46), .6, 0, 0, .06),
        ('photocell', (96, 98, 92), .55, 0, 0, .06), ('brass', (176, 138, 62), .38, .9, 0, .08),
        ('iron_black', (30, 30, 30), .6, .45, 0, .1), ('rust', (107, 74, 54), .85, .3, 0, .25),
        ('wood_post', (128, 104, 78), .85, 0, 0, .2), ('vinyl_white', (238, 236, 230), .45, 0, 0, .03),
        ('pole_steel', (112, 112, 106), .55, .6, 0, .12), ('concrete_dark', (128, 124, 116), .95, 0, 0, .2),
        ('base_plastic', (52, 54, 58), .65, 0, 1, .05), ('glass_clear', (40, 46, 50), .08, 0, 0, .02),
        ('porcelain', (168, 170, 166), .22, 0, 0, .04), ('tag_aluminum', (184, 186, 182), .45, .85, 0, .1),
        ('creosote', (58, 46, 36), .9, 0, 0, .15), ('guard_yellow', (214, 176, 40), .5, 0, 0, .06),
        ('mortar', (176, 170, 158), .95, 0, 0, .15), ('cast_iron', (54, 52, 50), .7, .5, 0, .14),
        ('net_dirty', (196, 192, 180), .95, 0, 0, .12), ('green_paint', (48, 74, 56), .5, .2, 0, .06),
    ]
    for i, (name, c, ro, me, mk, nz) in enumerate(SW):
        x, y = (i % 8) * 128, 1024 + (i // 8) * 128
        a = np.ones((128, 128, 3), np.float32) * np.array(c, np.float32)
        n = np.asarray(Image.fromarray((rng.random((16, 16)) * 255).astype(np.uint8)).resize((128, 128), Image.BICUBIC), np.float32) / 255
        a *= (1 + nz * (n - .5))[..., None] * (1 + nz * .5 * (rng.random((128, 128, 1)) - .5))
        A[y:y + 128, x:x + 128] = np.clip(a, 0, 255).astype(np.uint8)
        O[y // 2:(y + 128) // 2, x // 2:(x + 128) // 2] = (mk, ro, me)
        lay['swatch'][name] = [x, y, 128, 128]

    # P8 backboard, brick, numbers, refractor ---------------------------------------------------------------------------
    bb = Image.new('RGB', (512, 256), (236, 234, 226))      # a 72 x 42 in board: white, the shooter's square, a border
    d = ImageDraw.Draw(bb)
    d.rectangle([4, 4, 507, 251], outline=(196, 70, 44), width=7)
    d.rectangle([186, 118, 326, 214], outline=(196, 70, 44), width=7)
    bba = np.asarray(bb, np.float32) * (0.9 + .1 * np.asarray(Image.fromarray((rng.random((32, 64)) * 255).astype(np.uint8)).resize((512, 256), Image.BICUBIC), np.float32)[..., None] / 255)
    A[1536:1792, 1024:1536] = np.clip(bba, 0, 255).astype(np.uint8)
    O[768:896, 512:768] = (0, .4, 0)
    lay['tiles']['backboard'] = [1024, 1536, 512, 256]
    # brick (running bond, 8 x 2.25 in units with 3/8 in joints), 512 x 256 covering 0.81 x 0.405 m
    br = np.zeros((256, 512, 3), np.float32)
    bh, bw = 256 // 7, 512 // 4
    for row in range(8):
        off = (row % 2) * bw // 2
        for col in range(-1, 5):
            x0, y0 = col * bw + off, row * bh
            cc = np.array([150, 92, 72], np.float32) * (.82 + .3 * rng.random()) * np.array([1, .95 + .1 * rng.random(), 1])
            x1, y1 = max(0, x0 + 3), y0 + 3
            x2, y2 = min(512, x0 + bw - 3), min(256, y0 + bh - 3)
            if x2 > x1 and y2 > y1:
                br[y1:y2, x1:x2] = cc
    mortar = (br.sum(-1) == 0)
    br[mortar] = (172, 166, 154)
    br *= (.92 + .16 * rng.random((256, 512, 1)))
    A[1536:1792, 1536:2048] = np.clip(br, 0, 255).astype(np.uint8)
    O[768:896, 768:1024] = (0, .9, 0)
    nb = np.zeros((256, 512, 3), np.uint8)
    nb[:] = (128, 128, 255)
    nb[mortar] = (128, 128, 225)
    N[768:896, 768:1024] = np.asarray(Image.fromarray(nb).resize((256, 128), Image.BILINEAR))
    lay['tiles']['brick'] = [1536, 1536, 512, 256]
    # house numbers (brass on black) and the refractor's prisms
    hn = Image.new('RGB', (512, 128), (28, 27, 26))
    d = ImageDraw.Draw(hn)
    for i, t in enumerate(('214', '1137', '806', '452')):
        d.text((8 + i * 128, 40), t, fill=(186, 150, 74), font=font(40))
    A[1792:1920, 1024:1536] = np.asarray(hn)
    O[896:960, 512:768] = (0, .4, .8)
    lay['tiles']['numbers'] = [1024, 1792, 512, 128]
    ref = np.zeros((128, 512, 3), np.float32)
    for x in range(512):
        ref[:, x] = 214 + 26 * abs(np.sin(x / 512 * np.pi * 18))
    ref *= np.array([1, .97, .86], np.float32)
    A[1920:2048, 1024:1536] = np.clip(ref, 0, 255).astype(np.uint8)
    O[960:1024, 512:768] = (0, .15, 0)
    lay['tiles']['refractor'] = [1024, 1920, 512, 128]
    A[1792:2048, 1536:2048] = (90, 90, 90)
    lay['tiles']['spare'] = [1536, 1792, 512, 256]

    # cut-outs: chain-link diamonds (galvanized wire) and a net ----------------------------------------------------------
    C = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(C)
    for k in range(-8, 9):       # chain link: 2 in mesh -> 8 diamonds across a 256 px tile (one tile = 0.4 m)
        x = k * 32
        d.line([(x, 0), (x + 256, 256)], fill=(170, 172, 168, 255), width=3)
        d.line([(x + 256, 0), (x, 256)], fill=(170, 172, 168, 255), width=3)
    C.paste(C.crop((0, 0, 256, 256)), (0, 256))
    net = Image.new('RGBA', (256, 512), (0, 0, 0, 0))
    dn = ImageDraw.Draw(net)
    for k in range(-12, 13):     # net: 6 diamonds round per tile, 6 rows down (one tile spans the net)
        x = k * 43
        dn.line([(x, 0), (x + 256, 512)], fill=(226, 222, 212, 255), width=5)
        dn.line([(x + 256, 0), (x, 512)], fill=(226, 222, 212, 255), width=5)
    C.paste(net, (256, 0))
    Cn = np.asarray(C).copy()
    Cn[:, 256:][:, :, 3] = np.where(Cn[:, 256:][:, :, 3] > 0, 255, 0)
    Image.fromarray(Cn).save(os.path.join(OUT, 'props_cutout.png'), optimize=True)
    lay['cutout'] = {'chain': [0, 0, 256, 256], 'net': [256, 0, 256, 512]}

    Image.fromarray(A).save(os.path.join(OUT, 'props_albedo.jpg'), quality=90, subsampling=0, optimize=True)
    Image.fromarray(N).save(os.path.join(OUT, 'props_normal.png'), optimize=True)
    Image.fromarray(np.clip(np.round(O * 255), 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'props_orm.png'), optimize=True)
    json.dump(lay, open(os.path.join(OUT, 'props_atlas.json'), 'w'), indent=1)
    print('props: atlases written', sorted(lay['tiles']), len(lay['swatch']), 'swatches')
