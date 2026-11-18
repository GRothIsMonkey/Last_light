"""Last Light house kit: the offline Blender gallery (Cycles). OFFLINE RENDERS, NOT GAME CAPTURES.

    python tools/blender/houses/render_gallery.py -- [--only name,name] [--samples 48] [--out docs/qa/houses-phase1/blender]

Every image is built from the same plans, kit and texture library as the game file (LOD0). Blender has bounce light and
real raytraced glass the game does not; the interiors get a little ambient (the light that reaches a room from its
other windows) and, in the blue-hour view, their lamps (the same emissive cards the game fades in).
"""
import sys
import os
import json
import math

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
import bpy
from mathutils import Vector
import house_kit as K
import house_build as HB
import house_render as R
import build_houses as BH


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'only': None, 'samples': 48, 'out': os.path.join(ROOT, 'docs', 'qa', 'houses-phase1', 'blender'), 'res': '1600x1000'}
    for i, k in enumerate(a):
        if k.startswith('--') and i + 1 < len(a):
            o[k[2:]] = a[i + 1]
    o['samples'] = int(o['samples'])
    o['res'] = tuple(int(x) for x in o['res'].split('x'))
    return o


def interior_light(mats, ambient=.16, lamps=0.0):
    """Render-time only: a little ambient in the rooms (+ their lamps); the exported material is not touched."""
    m = mats['interior']
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    imgs = [n for n in nt.nodes if n.type == 'TEX_IMAGE']
    base = next((n for n in imgs if 'basecolor' in (n.image.name if n.image else '')), None)
    emis = next((n for n in imgs if 'emissive' in (n.image.name if n.image else '')), None)
    for l in list(b.inputs['Emission Color'].links):
        nt.links.remove(l)
    add = nt.nodes.get('render.add') or nt.nodes.new('ShaderNodeMix')
    add.name = 'render.add'
    add.data_type = 'RGBA'
    add.blend_type = 'ADD'
    add.inputs['Factor'].default_value = 1.0
    sa = nt.nodes.get('render.sa') or nt.nodes.new('ShaderNodeMix')
    sa.name = 'render.sa'
    sa.data_type = 'RGBA'
    sa.blend_type = 'MULTIPLY'
    sa.inputs['Factor'].default_value = 1.0
    sa.inputs[7].default_value = (ambient, ambient, ambient, 1)
    if base:
        nt.links.new(base.outputs['Color'], sa.inputs[6])
    sl = nt.nodes.get('render.sl') or nt.nodes.new('ShaderNodeMix')
    sl.name = 'render.sl'
    sl.data_type = 'RGBA'
    sl.blend_type = 'MULTIPLY'
    sl.inputs['Factor'].default_value = 1.0
    sl.inputs[7].default_value = (lamps, lamps * .9, lamps * .75, 1)
    if emis:
        nt.links.new(emis.outputs['Color'], sl.inputs[6])
    nt.links.new(sa.outputs[2], add.inputs[6])
    nt.links.new(sl.outputs[2], add.inputs[7])
    nt.links.new(add.outputs[2], b.inputs['Emission Color'])
    b.inputs['Emission Strength'].default_value = 1.0
    lm = mats['light'].node_tree.nodes['Principled BSDF']
    lm.inputs['Emission Strength'].default_value = 4.0 * lamps


def scene_with(houses, P, place, mats, tints, look, street=None, door_open=False, azimuth=None, elevation=None):
    """Build houses at Blender placements [(house, (x, y), rot_z)], a street set, lights."""
    sc = bpy.context.scene
    for o in list(sc.objects):
        bpy.data.objects.remove(o)
    obs = []
    for (h, (x, y), rz) in place:
        coll = bpy.data.collections.get('g.' + h['id']) or bpy.data.collections.new('g.' + h['id'])
        if coll.name not in sc.collection.children:
            sc.collection.children.link(coll)
        house = HB.House(h, 0, tints, P['palette'])
        mb = house.build()
        ob = mb.build(coll, mats, name=h['id'])
        ob.location = (x, y, 0)
        ob.rotation_euler = (0, 0, rz)
        obs.append((ob, house))
        if h['dynamicGarage']:
            g = HB.car_garage_door(h, tints, 0).build(coll, mats, name=h['id'] + ':door')
            G = h['garageInfo']
            g.parent = ob
            if door_open:
                g.location = (G['x'], -(G['front'] - .1 - G['doorH'] / 2), G['y'] + G['doorH'] + .05)
                g.rotation_euler = (math.pi / 2, 0, 0)
            else:
                g.location = (G['x'], -(G['front'] - .1), G['y'] + G['doorH'] / 2)
    if street == 'lot':
        R.street_set(sc, place[0][0]['setback'])
    elif street == 'road':
        road_set(sc)
    R.lights(sc, look, azimuth, elevation)
    return obs


def road_set(sc, y0=-60, y1=160):
    grass = R.ground_mat('render.grass', (0.045, 0.075, 0.02), (0.11, 0.15, 0.04), scale=14, rough=.95, bump=.3)
    conc = R.ground_mat('render.concrete', (0.36, 0.34, 0.31), (0.5, 0.48, 0.44), scale=9, rough=.88, bump=.08)
    asph = R.ground_mat('render.asphalt', (0.035, 0.035, 0.035), (0.09, 0.088, 0.085), scale=40, rough=.92, bump=.2)
    R.plane(sc, 'set.street', -4.7, 4.7, y0, y1, 0.0, asph)
    for s in (-1, 1):
        a, b = sorted((s * 4.7, s * 5.0))
        R.plane(sc, 'set.curb', a, b, y0, y1, .15, conc)
        a, b = sorted((s * 5.0, s * 6.35))
        R.plane(sc, 'set.strip', a, b, y0, y1, .12, grass)
        a, b = sorted((s * 6.35, s * 7.85))
        R.plane(sc, 'set.walk', a, b, y0, y1, .14, conc)
        a, b = sorted((s * 7.85, s * 45))
        R.plane(sc, 'set.lawn', a, b, y0, y1, -.002, grass)


def H(x, y, z):
    return R.H(x, y, z)


def shoot(name, o, cam, lens=35, samples=None, res=None):
    R.camera(bpy.context.scene, cam[0], cam[1], lens=lens)
    p = os.path.join(o['out'], name + '.jpg')
    R.render(bpy.context.scene, p, res=res or o['res'], samples=samples or o['samples'])
    print('rendered', p, flush=True)
    return p


def main():
    o = args()
    os.makedirs(o['out'], exist_ok=True)
    P = BH.plans()
    by = {h['id']: h for h in P['houses']}
    BH.fresh()
    tex, means = BH.texture_set()
    mats = K.make_materials(tex)
    tints = HB.Tints(means)
    want = lambda n: (o['only'] is None) or (n in o['only'].split(','))
    lot = lambda h: [(h, (0, 0), 0)]
    # ---------------------------------------------------------------- the hero: the car house (colonial, story house)
    car = by['house.car']
    S, W, D = car['setback'], car['w'], car['depth']
    if any(want(n) for n in ('hero-car--front34-golden', 'hero-car--front34-review', 'hero-car--side', 'hero-car--rear34', 'hero-car--roof-detail', 'hero-car--window-interior', 'hero-car--porch', 'hero-car--front-elevation')):
        for look in ('golden', 'review'):
            obs = scene_with([car], P, lot(car), mats, tints, look, street='lot')
            interior_light(mats, ambient=.16)
            if look == 'golden':
                if want('hero-car--front34-golden'):
                    shoot('hero-car--front34-golden', o, (H(W * .95 + 4, 1.6, S - 1.5), H(0, 3.0, 0)), 32)
                if want('hero-car--window-interior'):
                    fo = obs[0][1].fo
                    wx = [f for f in fo if f[1] < 2.6][-1][0]
                    shoot('hero-car--window-interior', o, (H(wx + 1.2, 1.85, D / 2 + 3.2), H(wx, 1.8, D / 2)), 35)
                if want('hero-car--porch'):
                    shoot('hero-car--porch', o, (H(car['doorX'] + 3.5, 1.7, D / 2 + 6.5), H(car['doorX'] - .5, 1.9, D / 2)), 35)
            else:
                if want('hero-car--front34-review'):
                    shoot('hero-car--front34-review', o, (H(W * .95 + 4, 1.6, S - 1.5), H(0, 3.0, 0)), 32)
                if want('hero-car--front-elevation'):
                    shoot('hero-car--front-elevation', o, (H(1.6, 3.2, S + 2), H(1.6, 3.4, 0)), 30)
                if want('hero-car--side'):
                    shoot('hero-car--side', o, (H(-W / 2 - 15, 3.0, 1.0), H(0, 3.2, 0)), 35)
                if want('hero-car--rear34'):
                    shoot('hero-car--rear34', o, (H(-W - 6, 4.0, -D - 9), H(0, 3.2, 0)), 32)
                if want('hero-car--roof-detail'):
                    shoot('hero-car--roof-detail', o, (H(W / 2 + 2.2, 7.4, D / 2 + 3.2), H(W / 2 - 1.5, 5.4, D / 2)), 32)
    if want('hero-car--garage-open'):
        scene_with([car], P, lot(car), mats, tints, 'review', street='lot', door_open=True)
        interior_light(mats, ambient=.16)
        shoot('hero-car--garage-open', o, (H(car['gx'] + 1.0, 1.6, car['gfront'] + 7.5), H(car['gx'], 1.2, car['gfront'] - 3)), 35)
    # ---------------------------------------------------------------- the four styles
    styles = [('style-ranch--hoop-house', 'house.hoop'), ('style-colonial', 'house.lotR8'), ('style-cape', 'house.lotL37'), ('style-front-gable', 'house.lotRm21')]
    for (name, hid) in styles:
        if not want(name):
            continue
        h = by[hid]
        scene_with([h], P, lot(h), mats, tints, 'review', street='lot')
        interior_light(mats, ambient=.16)
        x = h['w'] * .9 + (6 if h['style'] == 'ranch' else 4)
        shoot(name, o, (H(x, 1.6, h['setback'] - 1.5), H(0, 2.6, 0)), 32 if h['style'] != 'ranch' else 28)
    if want('hoop-house--hoop-and-garage'):
        h = by['house.hoop']
        scene_with([h], P, lot(h), mats, tints, 'golden', street='lot')
        interior_light(mats, ambient=.16)
        shoot('hoop-house--hoop-and-garage', o, (H(h['gx'] + 4.5, 1.5, h['gfront'] + 9), H(h['gx'], 2.4, h['gfront'])), 32)
    # ---------------------------------------------------------------- lineup at one scale
    for (name, order) in [('lineup--six-houses-a', ['house.lotLm21', 'house.hoop', 'house.lotR153', 'house.lotR8', 'house.lotL66', 'house.car']),
                          ('lineup--six-houses-b', ['house.lotL37', 'house.lotR37', 'house.lotRm21', 'house.lotL8', 'house.lotR66', 'house.lotR530'])]:
        if not want(name):
            continue
        place = []
        x = 0.0
        for hid in order:
            h = by[hid]
            left = h['w'] / 2 + (h['gw'] if h['hasGarage'] and h['gs'] < 0 else 0) + 1.2
            right = h['w'] / 2 + (h['gw'] if h['hasGarage'] and h['gs'] > 0 else 0) + 1.2
            x += left
            place.append((h, (x, 0), 0))
            x += right
        scene_with([p[0] for p in place], P, place, mats, tints, 'review', street=None)
        interior_light(mats, ambient=.16)
        R.plane(bpy.context.scene, 'set.ground', -20, x + 20, -30, 30, -.002, R.ground_mat('render.grass', (0.045, 0.075, 0.02), (0.11, 0.15, 0.04), scale=14, rough=.95, bump=.3))
        cam = bpy.data.cameras.new('ortho')
        cam.type = 'ORTHO'
        cam.ortho_scale = x + 4
        ob = bpy.data.objects.new('ortho', cam)
        bpy.context.scene.collection.objects.link(ob)
        ob.location = (x / 2, -80, 5.0)
        ob.rotation_euler = (math.radians(89.0), 0, 0)
        bpy.context.scene.camera = ob
        p = os.path.join(o['out'], name + '.jpg')
        w = 2400
        R.render(bpy.context.scene, p, res=(w, int(w * 13.5 / (x + 4))), samples=o['samples'])
        print('rendered', p, flush=True)
    # ---------------------------------------------------------------- the street: the actual sample lots at the start of the ride
    if want('street--golden-hour') or want('street--blue-hour-lamps'):
        start = [h for h in P['houses'] if h['d'] < 100]
        place = []
        for h in start:
            # street along +Y (increasing d); side -1 houses on -X facing +X, side +1 on +X facing -X
            rz = math.pi / 2 if h['side'] < 0 else -math.pi / 2
            place.append((h, (h['side'] * h['setback'], h['d']), rz))
        for look in (['golden'] if want('street--golden-hour') else []) + (['blue'] if want('street--blue-hour-lamps') else []):
            scene_with(start, P, place, mats, tints, 'golden', street='road', azimuth=30.0, elevation=7.0)
            if look == 'golden':
                interior_light(mats, ambient=.16)
                R.camera(bpy.context.scene, (1.4, -24, 1.65), (-3.5, 40, 3.0), lens=30)
                p = os.path.join(o['out'], 'street--golden-hour.jpg')
            else:
                sc = bpy.context.scene
                w = sc.world.node_tree
                sky = [n for n in w.nodes if n.type == 'TEX_SKY'][0]
                sky.sun_elevation = math.radians(-2.0)
                w.nodes['Background'].inputs['Strength'].default_value = .9
                for ob in sc.objects:
                    if ob.type == 'LIGHT':
                        ob.data.energy = 0.0
                sc.view_settings.exposure = .4
                interior_light(mats, ambient=.05, lamps=1.6)
                R.camera(sc, (1.4, -24, 1.65), (-3.5, 40, 3.0), lens=30)
                p = os.path.join(o['out'], 'street--blue-hour-lamps.jpg')
            R.render(bpy.context.scene, p, res=o['res'], samples=o['samples'])
            print('rendered', p, flush=True)


if __name__ == '__main__':
    main()
