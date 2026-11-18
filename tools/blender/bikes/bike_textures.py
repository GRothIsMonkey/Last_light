"""Last Light bicycle textures: one finish library and one set of wear rules for all four bikes.

Inputs are utility maps baked from the bike's own geometry into each material atlas (build_bike.bake_maps):
    pos (Blender world, = object space; metres), nrm (smooth normal), pid (part id per face), pat (the kit's metric
    pattern UVs: tread, knurl, decals and pins are placed in real millimetres), ao (local occlusion, 5 cm), edge.
Outputs per atlas: basecolor (sRGB), ORM (R occlusion, G roughness, B metallic; linear) and a tangent-space normal
map (OpenGL +Y), all at the authoring size; build_bike downsamples them to the runtime size.

Art direction (LAST-LIGHT-FINAL-ART-BIBLE 5.1; ENVIRONMENT-STYLE-GUIDE 8): believable, restrained wear. The bikes are
used and loved, not showroom-new and not junk. One wear model with a per-bike amount: Jamie rides hardest.
Brand marks are original (no real manufacturer): REDTAIL, NORTHLINE, Cloverdale, EASTWIND; tyres DURALINE.
"""
import math
import os
import numpy as np

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:      # the decals need Pillow (pip install pillow); everything else is numpy
    Image = None

FONT_DIRS = ['/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/dejavu', '/Library/Fonts', 'C:/Windows/Fonts']


def font(name, size):
    for d in FONT_DIRS:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def srgb2lin(c):
    c = np.asarray(c, np.float32)
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)


def lin2srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= .0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - .055)


def hexlin(h):
    return srgb2lin([((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255])


# ----------------------------------------------------------------------------------------------------------------------
# Noise (vectorised value noise on arbitrary coordinates; deterministic)
# ----------------------------------------------------------------------------------------------------------------------
def _hash(ix, iy, iz, seed):
    h = (ix * 374761393 + iy * 668265263 + iz * 2147483647 + seed * 144665) & 0xFFFFFFFF
    h = (h ^ (h >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFF) / 65535.0


def vnoise(p, freq, seed=0):
    """Value noise in 3D (p: (..., 3) metres), smooth, 0..1."""
    q = p * freq
    i = np.floor(q).astype(np.int64)
    f = q - i
    f = f * f * (3 - 2 * f)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (f[..., 0] if dx else 1 - f[..., 0]) * (f[..., 1] if dy else 1 - f[..., 1]) * (f[..., 2] if dz else 1 - f[..., 2])
                out = out + w * _hash(i[..., 0] + dx, i[..., 1] + dy, i[..., 2] + dz, seed)
    return out


def fbm(p, freq, octaves=4, seed=0):
    s, a, tot = 0, 1.0, 0
    for o in range(octaves):
        s = s + a * vnoise(p, freq * 2 ** o, seed + o * 17)
        tot += a
        a *= .5
    return s / tot


def vnoise2(u, v, fu, fv=None, seed=0):
    p = np.stack([u * fu, v * (fv if fv is not None else fu), np.zeros_like(u)], -1)
    return vnoise(p, 1.0, seed)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ----------------------------------------------------------------------------------------------------------------------
# The finish library: (base colour sRGB hex or None = the part's colour, roughness, metallic, normal pattern)
# ----------------------------------------------------------------------------------------------------------------------
FINISHES = {
    # painted steel / alloy frames: gloss enamel with a little orange peel; chips show primer and steel
    'paint': dict(rough=.36, metal=0.0, rough_var=.05, pattern='peel', wear='paint'),
    'paint_weld': dict(rough=.42, metal=0.0, rough_var=.06, pattern='weld', wear='paint'),
    'paint_black': dict(color=0x1d1e1c, rough=.42, metal=0.0, pattern='peel', wear='paint'),
    'chrome': dict(color=0xd9dad7, rough=.12, metal=1.0, rough_var=.05, pattern=None, wear='chrome'),
    'alloy': dict(color=0xc9cac8, rough=.32, metal=1.0, rough_var=.05, pattern='brushed', wear='alloy'),
    'alloy_machined': dict(color=0xc6c7c5, rough=.28, metal=1.0, pattern='machined', wear='alloy'),
    'alloy_black': dict(color=0x1b1c1e, rough=.42, metal=.55, pattern='brushed_fine', wear='anodized'),
    'steel_black': dict(color=0x1a1a1b, rough=.48, metal=0.0, pattern='peel', wear='blackpaint'),
    'zinc': dict(color=0xb4b5b0, rough=.38, metal=1.0, rough_var=.08, pattern=None, wear='zinc'),
    'brass': dict(color=0xc9a35c, rough=.32, metal=1.0, pattern='badge', wear='zinc'),
    'spoke': dict(color=0xbdbeba, rough=.3, metal=1.0, pattern=None, wear='zinc'),
    'chain': dict(color=0x8a8984, rough=.42, metal=1.0, pattern='chain', wear='grease'),
    'steel_cog': dict(color=0xa6a7a3, rough=.36, metal=1.0, pattern=None, wear='grease'),
    'peg': dict(color=0xb8b9b5, rough=.4, metal=1.0, pattern='knurl', wear='grind'),
    'tyre_street': dict(rough=.84, metal=0.0, pattern='tread_street', wear='tyre'),
    'tyre_knobby': dict(rough=.86, metal=0.0, pattern='tread_knobby', wear='tyre'),
    'tyre_cruiser': dict(rough=.84, metal=0.0, pattern='tread_cruiser', wear='tyre', cream=0xcdbf9f),
    'tyre_hybrid': dict(rough=.8, metal=0.0, pattern='tread_slick', wear='tyre'),
    'rubber_grip': dict(rough=.74, metal=0.0, pattern='grip', wear='grip'),
    'rubber_block': dict(rough=.86, metal=0.0, pattern='block', wear='soft'),
    'vinyl': dict(rough=.52, metal=0.0, pattern='vinyl', wear='vinyl'),
    'foam_pad': dict(rough=.62, metal=0.0, pattern='vinyl', wear='vinyl'),
    'plastic_pedal': dict(rough=.62, metal=0.0, pattern='grain', wear='soft'),
    'plastic': dict(color=0x232426, rough=.5, metal=0.0, pattern='grain', wear='soft'),
    'cable': dict(color=0x161718, rough=.38, metal=0.0, pattern=None, wear='soft'),
    'brake_pad': dict(color=0x1f1d1c, rough=.82, metal=0.0, pattern=None, wear='soft'),
    'bottle': dict(rough=.34, metal=0.0, pattern='grain', wear='soft'),
    'reflector_red': dict(rough=.14, metal=0.0, pattern='prism', wear='soft'),
    'reflector_amber': dict(rough=.14, metal=0.0, pattern='prism', wear='soft'),
    'reflector_white': dict(rough=.14, metal=0.0, pattern='prism', wear='soft'),
    'tape': dict(color=0x151516, rough=.45, metal=0.0, pattern='grain', wear='soft'),
}

# Per bike: how much use shows, where it is used (contact points in GAME coordinates), and the decals.
PROFILES = {
    'bike.jamie': dict(wear=1.0, dust=.9, seed=11, scuffs=[
        # (game point, radius m, strength): the left side takes the drops (kids lay a bike on its non-drive side)
        ((-.36, 1.06, -.38), .03, 1.0), ((-.2, .85, .22), .05, .7), ((-.12, .14, .03), .05, .9), ((.12, .44, .03), .05, .6),
        ((-.16, .29, .46), .03, 1.0), ((.16, .29, .46), .03, .9), ((-.16, .29, -.57), .03, 1.0), ((.16, .29, -.57), .03, .8),
        ((0, .62, -.1), .07, .5), ((.03, .33, .14), .04, .8)]),
    'bike.sam': dict(wear=.4, dust=.42, seed=23, scuffs=[((-.36, 1.0, -.43), .025, .6), ((0, .72, -.05), .06, .25),
                                                           ((.04, .33, .12), .035, .5), ((-.12, .2, .02), .04, .4)]),
    'bike.alex': dict(wear=.35, dust=.45, seed=37, scuffs=[((-.33, 1.04, -.34), .025, .4), ((0, .7, .3), .05, .3),
                                                            ((-.12, .15, .03), .04, .3)]),
    'bike.player': dict(wear=.6, dust=.65, seed=53, scuffs=[((-.34, 1.02, -.39), .025, .6), ((0, .74, -.1), .06, .35),
                                                             ((.04, .34, .13), .04, .6), ((-.12, .16, .03), .04, .5),
                                                             ((.12, .44, .03), .04, .4)]),
}

DECALS = {
    # part, centre along the tube (fraction), text, letter height (m), style
    'bike.jamie': [('frame_dt', .5, 'REDTAIL', .03, 'bold'), ('frame_tt', .55, 'STREET 22', .0115, 'small')],
    'bike.sam': [('frame_dt', .5, 'NORTHLINE', .028, 'bold'), ('frame_tt', .5, 'TRAIL 24', .013, 'small'),
                 ('frame_st', .55, '21 SPEED', .009, 'small')],
    'bike.alex': [('frame_dt', .42, 'Cloverdale', .032, 'script'), ('frame_tt', .5, None, .0, 'pinstripe')],
    'bike.player': [('frame_dt', .5, 'EASTWIND', .028, 'bold'), ('frame_tt', .55, '24   7-SPEED', .0115, 'small')],
}
TYRE_TEXT = {'bike.jamie': 'DURALINE  STREET  22 x 2.25  INFLATE 40-65 PSI', 'bike.sam': 'DURALINE  TRAIL  24 x 2.35  INFLATE 35-50 PSI',
             'bike.alex': 'DURALINE  BALLOON  24 x 2.125  INFLATE 35-45 PSI', 'bike.player': 'DURALINE  CITY  24 x 1.95  INFLATE 40-60 PSI'}


# ----------------------------------------------------------------------------------------------------------------------
# Decal images (Pillow): text rendered once, sampled in pattern space
# ----------------------------------------------------------------------------------------------------------------------
def text_image(text, style, px=220):
    if style == 'script':
        f = font('DejaVuSerif-BoldItalic.ttf', px)
    elif style == 'bold':
        f = font('DejaVuSans-BoldOblique.ttf', px)
    elif style == 'tyre':
        f = font('DejaVuSans-Bold.ttf', px)
    else:
        f = font('DejaVuSans-Bold.ttf', px)
    w = int(f.getlength(text)) + px
    h = int(px * 1.5)
    img = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(img)
    d.text((px // 2, int(px * .12)), text, fill=255, font=f)
    a = np.asarray(img, np.float32) / 255.0
    # trim to ink
    ys, xs = np.nonzero(a > .02)
    a = a[max(0, ys.min() - 6):ys.max() + 7, max(0, xs.min() - 6):xs.max() + 7]
    return a


def dilate(a, r):
    from scipy.ndimage import maximum_filter
    return maximum_filter(a, size=2 * r + 1)


def sample(img, s, t):
    """Bilinear sample of a 2D array at normalised coords s (x, left->right), t (y, bottom->top); 0 outside."""
    from scipy.ndimage import map_coordinates
    H, W = img.shape
    x = s * (W - 1)
    y = (1 - t) * (H - 1)
    inside = (s >= 0) & (s <= 1) & (t >= 0) & (t <= 1)
    out = np.zeros_like(s, dtype=np.float32)
    if inside.any():
        out[inside] = map_coordinates(img, [y[inside], x[inside]], order=1, mode='constant')
    return out


# ----------------------------------------------------------------------------------------------------------------------
# Synthesis
# ----------------------------------------------------------------------------------------------------------------------
def synthesize(bike_id, maps, parts, colors, tube_info, density, author=2048):
    """maps: dict of numpy arrays (H, W, k) for one atlas: pos(3) nrm(3) pid(1) pat(2) ao(1) edge(1).
    parts: [(name, slot, finish)] (pid = index + 1). colors: {part name: sRGB hex}. tube_info: {part: dict(length,
    radius)} for decal placement. density: atlas pixels per metre. Returns basecolor (sRGB), orm, normal (H, W, 3)."""
    prof = PROFILES[bike_id]
    W = prof['wear']
    H_, W_ = maps['pid'].shape[:2]
    pid = np.rint(maps['pid'][..., 0]).astype(np.int32)
    pos = maps['pos']
    nrm = maps['nrm']
    u, v = maps['pat'][..., 0], maps['pat'][..., 1]
    ao = np.clip(maps['ao'][..., 0], 0, 1)
    edge = np.clip(maps['edge'][..., 0] * 6, 0, 1)
    covered = pid > 0
    base = np.zeros((H_, W_, 3), np.float32)
    rough = np.full((H_, W_), .6, np.float32)
    metal = np.zeros((H_, W_), np.float32)
    height = np.zeros((H_, W_), np.float32)      # metres, for the normal map
    seed = prof['seed']
    # game-space position (Blender (x, y, z) = game (-x, z, y))
    gx, gy, gz = -pos[..., 0], pos[..., 2], pos[..., 1]
    gpos = np.stack([gx, gy, gz], -1)
    up = nrm[..., 2]                                     # Blender Z up
    n_fine = fbm(pos, 900.0, 3, seed)                    # ~1 mm
    n_mid = fbm(pos, 90.0, 4, seed + 1)                  # ~1 cm
    n_big = fbm(pos, 9.0, 3, seed + 2)                   # ~10 cm
    # contact scuffs (shared rule, per-bike points)
    scuff = np.zeros((H_, W_), np.float32)
    for (p, r, s) in prof['scuffs']:
        d = np.sqrt((gx - p[0]) ** 2 + (gy - p[1]) ** 2 + (gz - p[2]) ** 2)
        scuff = np.maximum(scuff, s * (1 - smoothstep(r * .4, r, d)))
    scuff *= smoothstep(.35, .65, n_mid + .15 * n_fine)
    # dust: settles on up-facing surfaces and on the low parts of the bike (road spray), never dense
    dust = prof['dust'] * (.55 * smoothstep(.05, .9, up) + .5 * (1 - smoothstep(.06, .4, gy))) * (.55 + .45 * n_big)
    dust = np.clip(dust * (.5 + .5 * smoothstep(.3, .7, n_mid)), 0, 1) * .38
    dust_col = srgb2lin([.62, .57, .5])
    grime = (1 - ao) * .8                                # cavity dirt

    for i, (name, slot, finish) in enumerate(parts, start=1):
        sel = pid == i
        if not sel.any():
            continue
        F = FINISHES[finish]
        col = colors.get(name, F.get('color', 0x808080))
        c = hexlin(col)
        su, sv = u[sel], v[sel]
        nf, nm, nb = n_fine[sel], n_mid[sel], n_big[sel]
        a_ = ao[sel]
        e_ = edge[sel]
        sc = scuff[sel] * W
        bc = np.tile(c, (sel.sum(), 1))
        r = np.full(sel.sum(), F['rough'], np.float32) + F.get('rough_var', .04) * (nm - .5) * 2
        mt = np.full(sel.sum(), F['metal'], np.float32)
        h = np.zeros(sel.sum(), np.float32)
        bc *= (.96 + .08 * nb)[:, None]                  # large, soft tonal variation
        pat = F.get('pattern')
        # ---------------- surface patterns (height in metres)
        if pat == 'peel':
            h += (n_fine[sel] - .5) * 0.00004
        elif pat == 'weld':
            h += .00012 * np.sin(su * 2 * math.pi / .0016) + (nf - .5) * .00006
            bc *= .93
        elif pat == 'brushed':
            h += (vnoise2(su, sv, 40.0, 2400.0, seed + 3) - .5) * .00003
        elif pat == 'brushed_fine':
            h += (vnoise2(su, sv, 60.0, 3000.0, seed + 3) - .5) * .00002
        elif pat == 'machined':
            h += (np.sin(sv * 2 * math.pi / .0004) * .5) * .00001
        elif pat == 'knurl':
            h += .00035 * np.abs(np.sin((su + sv) * math.pi / .0022)) * np.abs(np.sin((su - sv) * math.pi / .0022))
        elif pat == 'grip':
            h += .0003 * (np.abs(np.sin((su + sv) * math.pi / .003)) * np.abs(np.sin((su - sv) * math.pi / .003)))
        elif pat == 'block':
            h += .0006 * (np.sin(su * 2 * math.pi / .012) > .2) * (np.sin(sv * 2 * math.pi / .01) > -.4)
        elif pat in ('vinyl',):
            h += (nf - .5) * .00012
        elif pat == 'grain':
            h += (nf - .5) * .00005
        elif pat == 'prism':
            hx = np.abs(((su / .0024) % 1) - .5) + np.abs(((sv / .0024 + .5 * (np.floor(su / .0024) % 2)) % 1) - .5)
            h += .00025 * (1 - hx)
        elif pat == 'chain':
            # pin heads every half-inch on the outer plates; the plate waist between them
            ph = (su % .0127) / .0127
            dpin = np.minimum(ph, 1 - ph) * .0127
            vv = (sv - (.005 + .0009 + .0048))       # the outer plate's middle (chain_links v layout)
            pin = 1 - smoothstep(.0012, .0019, np.sqrt(dpin ** 2 + vv ** 2))
            h += .0005 * pin
            bc = bc * (1 + .35 * pin[:, None])
        elif pat == 'badge':
            h += .0003 * (np.sin(su * 2 * math.pi / .004) * np.sin(sv * 2 * math.pi / .004) > .3)
        elif pat and pat.startswith('tread'):
            info = tube_info.get(name, {})
            vmid = info.get('vmid', .1)
            dv = sv - vmid
            crown = 1 - smoothstep(.016, .026, np.abs(dv))
            if pat == 'tread_street':
                blk = ((np.sin(su * 2 * math.pi / .013 + np.sign(dv) * 1.2) > -.35) & (np.sin(dv * 2 * math.pi / .012) > -.55))
                h += crown * .0011 * blk
            elif pat == 'tread_cruiser':
                dia = np.abs(((su + np.abs(dv)) / .011) % 1 - .5)
                h += crown * .0008 * (dia > .18) * (np.abs(dv) > .0025)
            elif pat == 'tread_slick':
                side = smoothstep(.006, .009, np.abs(dv)) * (1 - smoothstep(.018, .024, np.abs(dv)))
                h += side * .00035 * (np.abs(np.sin((su + dv) * math.pi / .0026)) * np.abs(np.sin((su - dv) * math.pi / .0026)))
                h += (1 - smoothstep(.0, .0015, np.abs(dv))) * .0002   # the centre ridge
            elif pat == 'tread_knobby':
                h += (nf - .5) * .0001
            # sidewalls: molded lettering (two places round the tyre, both sides) and the casing texture
            side_band = smoothstep(.008, .014, np.abs(dv) - .026) * (1 - smoothstep(.0, .006, np.abs(dv) - info.get('vside', .06)))
            h += side_band * (np.sin(su * 2 * math.pi / .0015) * .00003)
            if 'text' in info:
                img, tw, th = info['text']
                for u0 in (.25, .25 + info['circ'] / 2):
                    for sgn in (-1, 1):
                        vc = vmid + sgn * info['vtext']
                        s_ = ((su - u0) / tw + .5) if sgn > 0 else ((u0 - su) / tw + .5)
                        t_ = ((sv - vc) / th + .5) if sgn > 0 else ((vc - sv) / th + .5)
                        a = sample(img, s_, t_)
                        h += a * .00045
                        bc = bc * (1 + .25 * a[:, None])
            if F.get('cream'):
                cream = hexlin(F['cream'])
                band = smoothstep(.0, .003, np.abs(dv) - .0285) * (1 - smoothstep(.0, .003, np.abs(dv) - info.get('vside', .06) + .004))
                bc = bc * (1 - band[:, None]) + cream * band[:, None] * (.92 + .1 * nb[:, None])
                r = r - .06 * band
        # ---------------- decals and pinstripes (frame tubes)
        for (dpart, frac, text, th, style) in DECALS.get(bike_id, []):
            if dpart != name:
                continue
            info = tube_info.get(name)
            if not info:
                continue
            L, rad = info['length'], info['radius']
            P = 2 * math.pi * rad
            uc = L * frac
            vs = ((sv + P / 2) % P) - P / 2                       # signed, 0 = the right side
            vl = sv - P / 2                                        # 0 = the left side
            if style == 'pinstripe':
                cream = hexlin(0xe6dcc0)
                for vline in (P * .25 - .0035, P * .25 + .0035):    # two fine lines along the top of the tube
                    m_ = 1 - smoothstep(.00035, .0007, np.abs(sv - vline))
                    m_ *= smoothstep(.02, .04, su) * (1 - smoothstep(L - .04, L - .02, su))
                    bc = bc * (1 - m_[:, None]) + cream * m_[:, None]
                continue
            img = info['decals'][text]
            ar = img.shape[1] / img.shape[0]
            tw = th * ar
            for side in (1, -1):
                if side > 0:
                    s_ = (uc - su) / tw + .5
                    t_ = vs / th + .5
                else:
                    s_ = (su - uc) / tw + .5
                    t_ = -vl / th + .5
                a = sample(img, s_, t_)
                o = sample(dilate(img, 3), s_, t_)
                if style == 'script':
                    fill, line = hexlin(0xeee3c6), hexlin(0x3a3d1c)
                elif style == 'small':
                    fill, line = hexlin(0xf0eee8), hexlin(0x151515)
                else:
                    fill, line = hexlin(0xf3f1ec), hexlin(0x141414)
                o = np.clip(o * (0 if style == 'small' else 1), 0, 1)
                bc = bc * (1 - o[:, None]) + line * o[:, None]
                bc = bc * (1 - a[:, None]) + fill * a[:, None]
                r = r * (1 - np.maximum(a, o)) + .3 * np.maximum(a, o)
                h += .00002 * np.maximum(a, o)
                # decals wear at their edges on a hard-used bike
                if W > .6:
                    worn = (np.maximum(a, o) > .1) & (nm > .78)
                    bc[worn] = bc[worn] * .6 + c * .4
        # ---------------- wear by kind (shared rules, scaled by the bike's wear amount)
        wear = F.get('wear')
        if wear == 'paint':
            chips = (e_ * .8 + sc * .9) * W
            chip = smoothstep(.62, .78, chips * (.5 + nf))
            primer = hexlin(0x575752)
            steel = hexlin(0x8d8c86)
            bare = (nf > .55)
            under = np.where(bare[:, None], steel, primer)
            bc = bc * (1 - chip[:, None]) + under * chip[:, None]
            mt = np.where(bare, np.maximum(mt, chip * .9), mt)
            r = r + chip * .12 + sc * .12
            bc = bc * (1 - .1 * sc[:, None])                  # scuffed paint goes duller, lighter
            bc = bc + .025 * sc[:, None]
        elif wear == 'blackpaint':
            chip = smoothstep(.65, .8, (e_ * .9 + sc) * W * (.5 + nf))
            bc = bc * (1 - chip[:, None]) + hexlin(0x8a8984) * chip[:, None]
            mt = np.maximum(mt, chip * .9)
        elif wear == 'anodized':
            chip = smoothstep(.6, .78, (e_ + sc * .8) * W * (.5 + nf))
            bc = bc * (1 - chip[:, None]) + hexlin(0xbfc0bd) * chip[:, None]
            mt = np.maximum(mt, chip)
            r = r - .1 * chip
        elif wear == 'chrome':
            spots = smoothstep(.72, .86, nm * (.7 + .5 * nb)) * (.3 + .7 * W)
            r = r + .14 * spots + .1 * sc
            bc = bc * (1 - .25 * spots[:, None])
            pit = smoothstep(.83, .9, nf * nm * 1.6) * W * .6     # a few pinprick rust spots on older chrome
            bc = bc * (1 - pit[:, None]) + hexlin(0x6a4630) * pit[:, None]
            mt = mt * (1 - pit)
            r = r + .5 * pit
        elif wear == 'alloy':
            r = r + .08 * sc + .05 * (nm - .5)
        elif wear == 'zinc':
            white = smoothstep(.7, .85, nm) * .5
            bc = bc * (1 - .3 * white[:, None]) + hexlin(0xd8d8d0) * .3 * white[:, None]
            r = r + .15 * white
        elif wear == 'grease':
            g = np.clip((1 - a_) * 1.4 + .25 + .2 * nm, 0, 1) * (.6 + .4 * W)
            bc = bc * (1 - .72 * g[:, None]) + hexlin(0x1c1a17) * .72 * g[:, None]
            r = r - .08 * g
            if W > .7:      # Jamie's chain: a touch of surface rust on the plates' edges
                rust = smoothstep(.7, .85, nf * (.6 + nm)) * .5
                bc = bc * (1 - rust[:, None]) + hexlin(0x6b3a22) * rust[:, None]
                mt = mt * (1 - rust)
                r = r + .3 * rust
        elif wear == 'grind':
            g = smoothstep(.3, .7, sc + .3 * nm) * W
            r = r - .12 * g
            bc = bc * (1 + .25 * g[:, None])
            h += g * (vnoise2(su, sv, 20.0, 900.0, seed + 9) - .5) * .00006
        elif wear == 'tyre':
            info = tube_info.get(name, {})
            dv = np.abs(sv - info.get('vmid', .1))
            crown = 1 - smoothstep(.012, .02, dv)
            r = r - .06 * crown * W                            # the contact patch wears a little shinier
            side = smoothstep(.025, .035, dv)
            bc = bc + dust_col * .022 * side[:, None] * prof['dust']   # dried dust on the sidewalls
        elif wear == 'grip':
            r = r - .12 * sc
            bc = bc * (1 + .3 * sc[:, None]) + .01 * sc[:, None]
        elif wear == 'vinyl':
            # stitching where the top panel meets the sides, scuffs where the bike was dropped
            nn = nrm[sel]
            seam = 1 - smoothstep(.0, .06, np.abs(nn[:, 2] - .55))
            stitch = seam * (np.sin((su) * 2 * math.pi / .004) > .2)
            h += .00025 * seam - .00015 * stitch
            bc = bc * (1 - .25 * stitch[:, None])
            r = r + .14 * sc
            bc = bc * (1 - .25 * sc[:, None]) + hexlin(0x8a8478) * .25 * sc[:, None]
        elif wear == 'soft':
            r = r + .06 * sc
            bc = bc + .015 * sc[:, None]
        # ---------------- global: grime in cavities, dust (not on chrome/tyres' crowns), tiny AO in colour
        gm = grime[sel] * (.5 + .5 * W)
        bc = bc * (1 - .35 * gm[:, None]) + hexlin(0x2a241d) * .2 * gm[:, None]
        if wear not in ('tyre',):
            d_ = dust[sel] * (.5 if F['metal'] > .5 else 1.0)
            bc = bc * (1 - d_[:, None]) + dust_col * d_[:, None]
            r = r + (.9 - r) * d_ * .8
            mt = mt * (1 - d_ * .7)
        bc = bc * (.82 + .18 * a_)[:, None]
        base[sel] = bc
        rough[sel] = np.clip(r, .04, 1)
        metal[sel] = np.clip(mt, 0, 1)
        height[sel] = h

    # normal map from the height field (atlas pixel space; no slopes across island borders)
    hy, hx = np.gradient(height)
    same_x = np.zeros_like(pid, bool)
    same_x[:, 1:-1] = (pid[:, 2:] == pid[:, :-2])
    same_y = np.zeros_like(pid, bool)
    same_y[1:-1, :] = (pid[2:, :] == pid[:-2, :])
    hx = np.where(same_x, hx, 0) * density
    hy = np.where(same_y, hy, 0) * density
    n = np.stack([-hx, -hy, np.ones_like(hx)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    normal = n * .5 + .5
    occl = np.clip(.35 + .65 * ao, 0, 1)
    orm = np.stack([occl, rough, metal], -1)
    base = np.where(covered[..., None], base, srgb2lin([.2, .2, .2]))
    return lin2srgb(base), orm, normal


def tyre_text_image(bike_id):
    return text_image(TYRE_TEXT[bike_id], 'tyre', px=160)


def decal_images(bike_id):
    out = {}
    for (_, _, text, _, style) in DECALS.get(bike_id, []):
        if text:
            out[text] = text_image(text, style)
    return out
