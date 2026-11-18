"""Last Light house kit: same-camera Blender comparisons between two versions of the kit. OFFLINE RENDERS, NOT THE GAME.

    python tools/blender/houses/render_compare.py -- --kit <dir with house_kit.py ...> --label B-benchmark --out <dir>
                                                     [--only street,car,...] [--samples 40]

Each version is built by ITS OWN kit code, textures and plans (point --kit at a git worktree of the earlier commit), and
rendered with exactly the cameras, sun and sky below. The realism pass's baked shading is applied when the kit has it
(house_bake.py); the earlier kit simply has none. Rooms get the same small ambient in both (the light that reaches a room
from its other windows), so the comparison is about the houses, not the render setup.
"""
import sys
import os
import math
import importlib


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'kit': None, 'label': 'C-refined', 'out': None, 'only': None, 'samples': '40', 'res': '1280x800'}
    for i, k in enumerate(a):
        if k.startswith('--') and i + 1 < len(a):
            o[k[2:]] = a[i + 1]
    return o


O = args()
KIT = os.path.abspath(O['kit'] or os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, KIT)
sys.path.insert(0, os.path.abspath(os.path.join(KIT, '..')))
import bpy
import house_kit as K
import house_build as HB
import house_render as R
import build_houses as BH
# the baked shading only if THIS kit has it (an earlier kit must not pick up the current one from the script's folder)
if os.path.exists(os.path.join(KIT, 'house_bake.py')):
    import house_bake
else:
    house_bake = None

# camera views: (name, houses, placement, camera (Blender coords), target, lens, sun azimuth, sun elevation)
VIEWS = ['street', 'hoop', 'car', 'colonial', 'ranch', 'cape', 'car-porch', 'colonial-window']


def H(x, y, z):
    return (x, -z, y)


def interior_ambient(mats, ambient=.16):
    m = mats['interior']
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    base = next((n for n in nt.nodes if n.type == 'TEX_IMAGE' and n.image and 'basecolor' in n.image.name), None)
    for l in list(b.inputs['Emission Color'].links):
        nt.links.remove(l)
    if base:
        mul = nt.nodes.new('ShaderNodeMix')
        mul.data_type = 'RGBA'
        mul.blend_type = 'MULTIPLY'
        mul.inputs['Factor'].default_value = 1.0
        mul.inputs[7].default_value = (ambient, ambient, ambient, 1)
        nt.links.new(base.outputs['Color'], mul.inputs[6])
        nt.links.new(mul.outputs[2], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = 1.0


def build(houses, P, place, mats, tints):
    sc = bpy.context.scene
    for o in list(sc.objects):
        bpy.data.objects.remove(o)
    for (h, (x, y), rz) in place:
        coll = bpy.data.collections.get('g.' + h['id']) or bpy.data.collections.new('g.' + h['id'])
        if coll.name not in sc.collection.children:
            sc.collection.children.link(coll)
        house = HB.House(h, 0, tints, P['palette'])
        mb = house.build()
        if house_bake:
            house_bake.bake(mb, house, 0)
        ob = mb.build(coll, mats, name=h['id'])
        ob.location = (x, y, 0)
        ob.rotation_euler = (0, 0, rz)
        if h['dynamicGarage']:
            g = HB.car_garage_door(h, tints, 0).build(coll, mats, name=h['id'] + ':door')
            G = h['garageInfo']
            g.parent = ob
            g.location = (G['x'], -(G['front'] - .1), G['y'] + G['doorH'] / 2)


def road(sc):
    grass = R.ground_mat('render.grass', (0.045, 0.075, 0.02), (0.11, 0.15, 0.04), scale=14, rough=.95, bump=.3)
    conc = R.ground_mat('render.concrete', (0.36, 0.34, 0.31), (0.5, 0.48, 0.44), scale=9, rough=.88, bump=.08)
    asph = R.ground_mat('render.asphalt', (0.035, 0.035, 0.035), (0.09, 0.088, 0.085), scale=40, rough=.92, bump=.2)
    R.plane(sc, 'set.street', -4.7, 4.7, -60, 160, 0.0, asph)
    for s in (-1, 1):
        for (a, b, z, m) in [(4.7, 5.0, .15, conc), (5.0, 6.35, .12, grass), (6.35, 7.85, .14, conc), (7.85, 45, -.002, grass)]:
            lo, hi = sorted((s * a, s * b))
            R.plane(sc, 'set.' + str(a), lo, hi, -60, 160, z, m)


def lights(sc, az, el):
    """The same golden hour for every view and version (house_render.lights, made deterministic here)."""
    try:
        R.lights(sc, 'golden', az, el)
    except TypeError:                 # an earlier house_render without the azimuth arguments
        R.lights(sc, 'golden')
        w = sc.world.node_tree
        sky = [n for n in w.nodes if n.type == 'TEX_SKY'][0]
        sky.sun_elevation = math.radians(el)
        sky.sun_rotation = math.radians(az)
        for ob in sc.objects:
            if ob.type == 'LIGHT':
                ob.rotation_euler = (math.radians(90 - el), 0, math.radians(az - 90))


def main():
    out = os.path.abspath(O['out'])
    os.makedirs(out, exist_ok=True)
    P = BH.plans()
    by = {h['id']: h for h in P['houses']}
    BH.fresh()
    tex, means = BH.texture_set()
    mats = K.make_materials(tex)
    tints = HB.Tints(means)
    res = tuple(int(x) for x in O['res'].split('x'))
    only = O['only'].split(',') if O['only'] else VIEWS
    lot = lambda h: [(h, (0, 0), 0)]
    for name in only:
        sc = bpy.context.scene
        if name == 'street':
            start = [h for h in P['houses'] if h['d'] < 100]
            place = [(h, (h['side'] * h['setback'], h['d']), math.pi / 2 if h['side'] < 0 else -math.pi / 2) for h in start]
            build(start, P, place, mats, tints)
            road(sc)
            lights(sc, 30.0, 7.0)
            cam = ((1.4, -24, 1.65), (-3.5, 40, 3.0), 30)
        else:
            hid = {'hoop': 'house.hoop', 'car': 'house.car', 'colonial': 'house.lotR8', 'ranch': 'house.lotLm21', 'cape': 'house.lotL37', 'car-porch': 'house.car', 'colonial-window': 'house.lotR8'}[name]
            h = by[hid]
            build([h], P, lot(h), mats, tints)
            R.street_set(sc, h['setback'])
            lights(sc, 250.0, 8.0)
            S, W, D = h['setback'], h['w'], h['depth']
            if name == 'hoop':
                cam = (H(h['gx'] + 7.5, 1.6, S - 3), H(h['gx'] * .3, 2.4, 0), 30)
            elif name == 'car':
                cam = (H(W * .95 + 4, 1.6, S - 1.5), H(0, 3.0, 0), 32)
            elif name == 'car-porch':
                cam = (H(h['doorX'] + 3.5, 1.7, D / 2 + 6.5), H(h['doorX'] - .5, 1.9, D / 2), 35)
            elif name == 'colonial-window':
                cam = (H(-1.6, 1.9, D / 2 + 3.6), H(-2.6, 1.75, D / 2), 35)
            else:
                x = W * .9 + (6 if h['style'] == 'ranch' else 4)
                cam = (H(x, 1.6, S - 1.5), H(0, 2.6, 0), 32 if h['style'] != 'ranch' else 28)
        interior_ambient(mats)
        R.camera(sc, cam[0], cam[1], lens=cam[2])
        p = os.path.join(out, f'{name}--{O["label"]}.jpg')
        R.render(sc, p, res=res, samples=int(O['samples']))
        print('rendered', p, flush=True)


main()
