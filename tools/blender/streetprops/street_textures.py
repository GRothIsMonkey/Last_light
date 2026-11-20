"""Last Light: vehicle and street-prop texture atlases (Prologue vehicles & street props benchmark, ?streetprops).

Deterministic: reads the Sketchfab originals byte for byte (assets/source/street/third-party/sketchfab-originals/*.glb,
their embedded images), writes the runtime atlases into assets/source/street/textures/. Needs numpy and Pillow only.

    python3 tools/blender/streetprops/street_textures.py            # all atlases
    python3 tools/blender/streetprops/street_textures.py vehicles   # one group

Vehicle atlases (the six US-market bodies of Comrade1280's "Generic passenger car pack", CC BY 4.0):
  veh_a_albedo.jpg 2048^2   sedan | wagon / minivan | SUV            (1024^2 tiles, downsampled from 2048^2)
  veh_b_albedo.jpg 2048^2   pickup | hatchback / lamp optics | wheels A,B,D,E (512x448) + 4 strips of 4 swatches
  veh_a_orm.png / veh_b_orm.png 1024^2   R = paint mask (the body colour is given per car at runtime),
                                          G = roughness, B = metalness (from the source's material-ID maps)
In the albedo the painted panels hold the source's own baked shading as a grey (0.5 = the panel's median), so one
texture serves every paint colour; everything else (trim, chrome, rubber, lamps, wheels) keeps its source colour.
Swatches (original work): three generic licence plates (no real state's design), seat fabric (grey, tan), dash
plastic, underbody, exhaust steel, headliner.

Street-prop atlases: see build_props() below.
"""
import io, json, os, struct, sys, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.join(ROOT, 'assets', 'source', 'street', 'third-party', 'sketchfab-originals')
OUT = os.path.join(ROOT, 'assets', 'source', 'street', 'textures')


# ------------------------------------------------------------------------------------------------ GLB image access
class Glb:
    def __init__(self, name):
        self.path = os.path.join(SRC, name)
        b = open(self.path, 'rb').read()
        l0 = struct.unpack('<I', b[12:16])[0]
        self.j = json.loads(b[20:20 + l0])
        self.bin = b[20 + l0 + 8:]
        self.sha = hashlib.sha256(b).hexdigest()

    def image(self, idx):
        v = self.j['bufferViews'][self.j['images'][idx]['bufferView']]
        o = v.get('byteOffset', 0)
        im = Image.open(io.BytesIO(self.bin[o:o + v['byteLength']]))
        im.load()
        return im

    def mat(self, name):
        for m in self.j['materials']:
            if m.get('name') == name:
                return m
        raise KeyError(name)

    def tex_image(self, mat, slot):
        m = self.mat(mat)
        pb = m.get('pbrMetallicRoughness', {})
        t = pb.get(slot) if slot in ('baseColorTexture', 'metallicRoughnessTexture') else m.get(slot)
        return self.image(self.j['textures'][t['index']]['source'])


def srgb_to_lin(x):
    x = np.asarray(x, np.float32) / 255.0
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(x):
    x = np.clip(x, 0, 1)
    return np.round(255 * np.where(x <= 0.0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - 0.055)).astype(np.uint8)


def box_down(a, f):
    """Exact box-filter downsample by an integer factor (float array HxWxC)."""
    h, w = a.shape[:2]
    return a.reshape(h // f, f, w // f, f, -1).mean((1, 3))


# (G, B) of the source material-ID maps -> (roughness, metalness, paint)
MR_CLASSES = [
    ((16, 0), (0.30, 0.0, 1)), ((32, 0), (0.30, 0.0, 1)),      # body paint (and its anti-aliased edge)
    ((176, 80), (0.70, 0.0, 0)), ((160, 80), (0.68, 0.0, 0)), ((176, 96), (0.68, 0.0, 0)), ((144, 96), (0.62, 0.0, 0)),
    ((0, 48), (0.24, 0.0, 0)),                                  # gloss black trim
    ((0, 240), (0.16, 1.0, 0)),                                 # chrome
    ((240, 240), (0.88, 0.0, 0)),                               # black rough: tyres, wells, underside
    ((144, 112), (0.55, 0.15, 0)),                              # grey seals, mouldings
    ((64, 0), (0.36, 0.0, 0)), ((80, 80), (0.5, 0.3, 0)), ((240, 0), (0.9, 0.0, 0)),
]


def classify(mr):
    """mr: HxWx3 uint8 -> rough, metal, paint (float32 HxW)."""
    g = mr[..., 1].astype(np.int32)
    b = mr[..., 2].astype(np.int32)
    rough = np.maximum(0.15, g / 255.0).astype(np.float32)
    metal = (b / 255.0).astype(np.float32)
    paint = np.zeros(g.shape, np.float32)
    best = np.full(g.shape, 1e9, np.float32)
    for (cg, cb), (r, m, p) in MR_CLASSES:
        d = (g - cg) ** 2 + (b - cb) ** 2
        sel = (d < 12 ** 2) & (d < best)
        best = np.where(sel, d, best)
        rough = np.where(sel, r, rough)
        metal = np.where(sel, m, metal)
        paint = np.where(sel, p, paint)
    return rough, metal, paint


def body_tile(glb, mat, size):
    """One car body: (albedo uint8 size^2x3, orm float size^2x3). Painted panels become grey shading (0.5 = median)."""
    base = np.asarray(glb.tex_image(mat, 'baseColorTexture').convert('RGB'))
    mr = np.asarray(glb.tex_image(mat, 'metallicRoughnessTexture').convert('RGB'))
    rough, metal, paint = classify(mr)
    lin = srgb_to_lin(base)
    lum = lin @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    # the panel shading: blurred a little (the darkest paint, near black, is quantized in 8 bits) and normalized
    enc = Image.fromarray((np.sqrt(np.clip(lum, 0, 1)) * 255).astype(np.uint8))      # perceptual encoding for the blur
    lum_b = (np.asarray(enc.filter(ImageFilter.GaussianBlur(1.6)), np.float32) / 255.0) ** 2
    med = float(np.median(lum_b[paint > 0.5])) if (paint > 0.5).any() else 0.2
    shade = np.clip(lum_b / max(med, 1e-4), 0.30, 1.55) * 0.5
    out = lin.copy()
    out = np.where(paint[..., None] > 0.5, shade[..., None], out)
    # chrome: a believable metal albedo (the source's chrome is a dark grey under metalness 1)
    chrome = (metal > 0.9)[..., None]
    out = np.where(chrome, np.maximum(out, 0.42), out)
    f = base.shape[0] // size
    alb = lin_to_srgb(box_down(out, f))
    orm = box_down(np.stack([paint, rough, metal], -1), f * 2)        # ORM atlas is half the albedo's resolution
    return alb, orm


def wheel_tile(glb, mat, w, h):
    base = np.asarray(glb.tex_image(mat, 'baseColorTexture').convert('RGB').resize((w, h), Image.BOX))
    mr = np.asarray(glb.tex_image(mat, 'metallicRoughnessTexture').convert('RGB').resize((w // 2, h // 2), Image.NEAREST))
    rough, metal, _ = classify(mr)
    lin = srgb_to_lin(base)
    # brake dust and road film on the rim faces: a slight warm grey, stronger toward the hub (radial) -- baked lightly
    alb = lin_to_srgb(lin * np.array([0.97, 0.95, 0.92], np.float32))
    orm = np.stack([np.zeros_like(rough), np.maximum(rough, 0.25), np.minimum(metal, 0.85)], -1)
    return alb, orm


def font(px):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, px)
    return ImageFont.load_default()


def swatches(rng):
    """Sixteen 128x64 swatches (original work): plates, fabrics, plastics. -> list of (albedo RGB uint8, (rough, metal))."""
    out = []
    plates = [('KVR 4127', (238, 236, 228), (34, 52, 96)), ('8DH 251', (234, 232, 222), (120, 34, 34)),
              ('BHT 9036', (236, 234, 226), (28, 30, 34))]
    for txt, bg, fg in plates:   # generic plates: no real state's name, colours or graphics
        im = Image.new('RGB', (128, 64), bg)
        d = ImageDraw.Draw(im)
        d.rectangle([1, 1, 126, 62], outline=tuple(int(c * .55) for c in bg), width=2)
        d.rectangle([4, 4, 123, 11], fill=tuple(int(.7 * a + .3 * b) for a, b in zip(bg, fg)))
        f = font(26)
        tw = d.textlength(txt, font=f)
        d.text(((128 - tw) / 2, 17), txt, fill=fg, font=f)
        for x in (12, 116):
            d.ellipse([x - 3, 30, x + 3, 36], fill=(150, 150, 146))
        a = np.asarray(im, np.float32)
        a *= 0.92 + 0.08 * rng.random((64, 128, 1))           # weathered sheeting
        out.append((np.clip(a, 0, 255).astype(np.uint8), (0.5, 0.0)))

    def noise(c, amp, rough, metal):
        a = np.ones((64, 128, 3), np.float32) * np.array(c, np.float32)
        a *= 1 + amp * (rng.random((64, 128, 1)) - 0.5)
        return (np.clip(a, 0, 255).astype(np.uint8), (rough, metal))
    out += [noise((92, 92, 90), .18, .95, 0), noise((138, 120, 96), .18, .95, 0),     # seat fabric grey, tan
            noise((44, 44, 44), .08, .6, 0), noise((22, 21, 20), .1, .9, 0),         # dash plastic, underbody
            noise((120, 118, 112), .2, .45, .7), noise((160, 156, 146), .12, .95, 0),  # exhaust steel, headliner
            noise((70, 70, 68), .1, .7, 0), noise((10, 10, 11), .05, .2, 0),          # rubber seal, gloss black
            noise((150, 150, 150), .05, .3, 1), noise((96, 82, 70), .2, .95, 0),       # bright metal, carpet brown
            noise((60, 64, 70), .15, .95, 0), noise((200, 196, 186), .1, .6, 0),       # carpet grey, cream plastic
            noise((30, 30, 30), .1, .85, 0)]                                         # tyre black
    return out


def build_vehicles():
    os.makedirs(OUT, exist_ok=True)
    g = Glb('generic_passenger_car_pack.glb')
    rng = np.random.default_rng(2011)
    A = np.zeros((2048, 2048, 3), np.uint8)
    B = np.zeros((2048, 2048, 3), np.uint8)
    OA = np.zeros((1024, 1024, 3), np.float32)
    OB = np.zeros((1024, 1024, 3), np.float32)
    layout = {'atlas': {}, 'swatch': {}}
    bodies = [('A', 'sedan', 'Body_5', 0, 0), ('A', 'wagon', 'Body_8', 1024, 0), ('A', 'minivan', 'Body_2', 0, 1024),
              ('A', 'suv', 'Body_7', 1024, 1024), ('B', 'pickup', 'Body_4', 0, 0), ('B', 'hatchback', 'Body_1', 1024, 0)]
    for atlas, car, mat, x, y in bodies:
        alb, orm = body_tile(g, mat, 1024)
        (A if atlas == 'A' else B)[y:y + 1024, x:x + 1024] = alb
        (OA if atlas == 'A' else OB)[y // 2:y // 2 + 512, x // 2:x // 2 + 512] = orm
        layout['atlas'][car + ':body'] = {'atlas': atlas, 'px': [x, y, 1024, 1024], 'source': mat}
    # lamp optics (shared by every body): 1024^2 as supplied
    opt = np.asarray(g.image(g.j['textures'][g.mat('Optics')['pbrMetallicRoughness']['baseColorTexture']['index']]['source']).convert('RGB'))
    B[1024:2048, 0:1024] = opt
    OB[512:1024, 0:512] = np.array([0, 0.12, 0.0], np.float32)
    layout['atlas']['optics'] = {'atlas': 'B', 'px': [0, 1024, 1024, 1024], 'source': 'Optics'}
    wheels = [('A', 'Wheel_4', 1024, 1024), ('B', 'Wheek', 1536, 1024), ('D', 'Wheel_1', 1024, 1536), ('E', 'Wheel_3', 1536, 1536)]
    sw = swatches(rng)
    k = 0
    for name, mat, x, y in wheels:
        alb, orm = wheel_tile(g, mat, 512, 448)
        B[y:y + 448, x:x + 512] = alb
        OB[y // 2:y // 2 + 224, x // 2:x // 2 + 256] = orm
        layout['atlas']['wheel:' + name] = {'atlas': 'B', 'px': [x, y, 512, 448], 'source': mat}
        for s in range(4):   # the strip below each wheel: four 128x64 swatches
            if k < len(sw):
                a, (r, m) = sw[k]
                B[y + 448:y + 512, x + s * 128:x + s * 128 + 128] = a
                OB[(y + 448) // 2:(y + 512) // 2, (x + s * 128) // 2:(x + s * 128 + 128) // 2] = np.array([0, r, m], np.float32)
                layout['swatch'][k] = [x + s * 128, y + 448, 128, 64]
                k += 1
    names = ['plate1', 'plate2', 'plate3', 'fabric_grey', 'fabric_tan', 'dash', 'underbody', 'exhaust', 'headliner', 'seal',
             'gloss_black', 'bright_metal', 'carpet_brown', 'carpet_grey', 'cream_plastic', 'tyre']
    layout['swatch'] = {names[i]: v for i, v in layout['swatch'].items()}
    Image.fromarray(A).save(os.path.join(OUT, 'veh_a_albedo.jpg'), quality=90, subsampling=0, optimize=True)
    Image.fromarray(B).save(os.path.join(OUT, 'veh_b_albedo.jpg'), quality=90, subsampling=0, optimize=True)
    for n, O in (('veh_a_orm.png', OA), ('veh_b_orm.png', OB)):
        Image.fromarray(np.clip(np.round(O * 255), 0, 255).astype(np.uint8)).save(os.path.join(OUT, n), optimize=True)
    layout['source_sha256'] = g.sha
    json.dump(layout, open(os.path.join(OUT, 'vehicle_atlas.json'), 'w'), indent=1)
    print('vehicles: atlases written', sorted(layout['atlas']))
    return layout


if __name__ == '__main__':
    what = sys.argv[1:] or ['vehicles', 'props']
    if 'vehicles' in what:
        build_vehicles()
    if 'props' in what:
        import street_props_textures  # noqa: F401  (the props atlases; see that module)
        street_props_textures.build()
