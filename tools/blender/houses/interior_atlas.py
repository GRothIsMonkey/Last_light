"""Last Light house kit: the interior atlas seen through every window (mat.interior).

Eight small rooms of an ordinary 2011 house are modelled here in Blender and rendered with Cycles, orthographically,
straight at their back wall: a 2.8 x 2.8 m piece of wall from the floor up, with the furniture that stands against it.
Two renders per room: 'albedo' (even, soft light: the card's colour, which the game and Blender then light through
the window like any surface) and 'lamps' (only the room's own lamps on, everything else black: the emissive map the
game fades in as the evening goes on, staggered house by house). Strips for side walls, floors, ceilings, curtain
fabric, blinds and the garage are painted procedurally.

Layout (UV, v up; see house_parts.CARD_UV / STRIP_UV): cards 0-7 in a 4 x 2 grid over the top half; strips below.
  0 living room (sofa, lamp, picture)        1 living room (2011 TV on a cabinet, bookcase, floor lamp)
  2 dining room (china hutch, chairs, chandelier)  3 kitchen (cabinets, counter, fridge, pendant)
  4 bedroom (dresser, mirror, lamp, bed)     5 kid's room (bed, posters, desk with a monitor, shelf)
  6 stair hall (stairs, console table, coats) 7 den (desk, LCD monitor and tower, bookcase, desk lamp)

    python tools/blender/houses/interior_atlas.py [--size 2048] [--samples 48]
"""
import os
import sys
import json
import math
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import bpy
from PIL import Image
from scipy import ndimage

OUT = os.path.join(ROOT, 'assets', 'source', 'house', 'kit', 'textures')
SPAN = 2.8
TMP = os.path.join(ROOT, 'assets', 'source', 'house', 'kit', 'interior-renders')


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    o = {'size': 2048, 'samples': 48, 'reuse': False}
    for i, k in enumerate(a):
        if k == '--size':
            o['size'] = int(a[i + 1])
        if k == '--samples':
            o['samples'] = int(a[i + 1])
        if k == '--reuse':
            o['reuse'] = True
    return o


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4) for x in c) + (1.0,)


MATS = {}


def mat(name, color, rough=.7, metal=0.0, emit=None, strength=0.0):
    key = (name, color, rough, metal, emit, strength)
    if key in MATS:
        return MATS[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = srgb(color) if isinstance(color, str) else color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = srgb(emit)
        b.inputs['Emission Strength'].default_value = strength
    m['emitter'] = bool(emit)
    MATS[key] = m
    return m


def box(name, x, y, z, sx, sy, sz, m, bevel=.008):
    """x across the wall, y = distance from the wall (toward the camera), z up; (x, y, z) is the bottom-centre-back."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -(y + sy / 2), z + sz / 2))
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = ob.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
    ob.data.materials.append(m)
    return ob


def cyl(name, x, y, z, r, h, m, r2=None, seg=24):
    bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r, radius2=r if r2 is None else r2, depth=h, location=(x, -y, z + h / 2))
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return ob


def picture(x, z, w, h, frame='#3a2a1c', art=None, y=0.0):
    box('frame', x, y, z, w, .03, h, mat('frame', frame, .5))
    a = art or '#8a9a7a'
    box('art', x, y + .03, z + .05, w - .1, .004, h - .1, mat('art' + a, a, .6), bevel=0)


def lamp(x, y, z, shade='#efe2c4', h=.6, glow=1.0):
    base = mat('lampbase', '#8a7650', .35, .6)
    cyl('lampbody', x, y, z, .07, h * .55, base, r2=.05)
    sh = mat('shade' + shade, shade, .8, emit='#ffc98a', strength=0.0)
    sh['lamp_strength'] = 6.0 * glow
    cyl('shade', x, y, z + h * .55, .2, h * .38, sh, r2=.13)
    L = bpy.data.lights.new('bulb', 'POINT')
    L.energy = 0.0
    L['lamp_energy'] = 38.0 * glow
    L.color = (1.0, .78, .5)
    L.shadow_soft_size = .08
    ob = bpy.data.objects.new('bulb', L)
    ob.location = (x, -y, z + h * .72)
    bpy.context.scene.collection.objects.link(ob)


def ceiling_light(x, y, z=2.55, kind='dome', glow=1.0):
    sh = mat('fixture', '#f3ead6', .5, emit='#ffd9a0', strength=0.0)
    sh['lamp_strength'] = 5.0 * glow
    if kind == 'chandelier':
        cyl('chain', x, y, z - .5, .01, .5, mat('brass', '#8a6a30', .3, 1.0))
        for k in range(5):
            a = k / 5 * math.tau
            cyl('candle', x + math.cos(a) * .25, y + math.sin(a) * .25, z - .62, .03, .12, sh)
        z0 = z - .6
    else:
        cyl('dome', x, y, z - .12, .2, .12, sh, r2=.12)
        z0 = z - .15
    L = bpy.data.lights.new('ceil', 'POINT')
    L.energy = 0.0
    L['lamp_energy'] = 60.0 * glow
    L.color = (1.0, .82, .58)
    L.shadow_soft_size = .15
    ob = bpy.data.objects.new('ceil', L)
    ob.location = (x, -y, z0)
    bpy.context.scene.collection.objects.link(ob)


def room(wall='#d8ccb0', floor='#7b5c40', base_board=True):
    w = mat('wall' + wall, wall, .9)
    box('backwall', 0, -.05, 0, 6, .05, 3.0, w, bevel=0)
    box('floor', 0, 0, -.05, 6, 4, .05, mat('floor' + floor, floor, .6), bevel=0)
    if base_board:
        box('baseboard', 0, 0, 0, 6, .015, .1, mat('trimw', '#efe9dc', .5), bevel=.003)


def books(x0, x1, z, y=.02, depth=.22, rnd=None):
    cols = ['#7a2d24', '#2d4a6a', '#c9b48a', '#3b5a3a', '#8a6a3a', '#2a2a2a', '#b05a30', '#5a4a7a', '#d8d0bc']
    x = x0
    i = 0
    while x < x1 - .03:
        w = .025 + rnd.random() * .03
        h = .18 + rnd.random() * .08
        box('book', x + w / 2, y, z, w, depth, h, mat('book' + str(i % 9), cols[i % 9], .8), bevel=.002)
        x += w + .002
        i += 1


def card(i):
    import random
    rnd = random.Random(100 + i)
    wood = mat('wood', '#6a4a30', .45)
    dark = mat('darkwood', '#3e2a1c', .4)
    white = mat('trimw', '#efe9dc', .5)
    if i == 0:
        room('#cdbf9f', '#8a7a62')
        sofa = mat('sofa', '#7a6a58', .95)
        box('sofa.base', 0, .05, .0, 2.1, .9, .42, sofa, .04)
        box('sofa.back', 0, .05, .3, 2.1, .25, .55, sofa, .06)
        for s in (-1, 1):
            box('sofa.arm', s * .98, .05, .3, .2, .9, .32, sofa, .05)
        for k in range(3):
            box('cushion', -.66 + k * .66, .32, .42, .62, .6, .14, sofa, .05)
        box('pillow', -.75, .3, .55, .4, .14, .36, mat('pillow', '#a8553c', .95), .05)
        box('pillow', .75, .3, .55, .4, .14, .36, mat('pillow2', '#d8c9a0', .95), .05)
        box('endtable', 1.45, .08, 0, .5, .5, .6, wood)
        lamp(1.45, .32, .6)
        picture(0, 1.3, 1.1, .7, art='#6f8a9a')
        picture(-1.5, 1.45, .4, .5, art='#a07a5a')
        box('plant.pot', -1.5, .2, 0, .32, .32, .34, mat('pot', '#9a5a3a', .7), .02)
        cyl('plant', -1.5, .36, .34, .3, .7, mat('leaves', '#3d5a2a', .8), r2=.12, seg=10)
    elif i == 1:
        room('#c9c1aa', '#6a5c4a')
        box('tvstand', 0, .02, 0, 1.4, .45, .55, dark)
        box('tv', 0, .1, .55, .9, .08, .56, mat('tv', '#0c0c0e', .15))
        box('tvscreen', 0, .18, .6, .84, .002, .48, mat('screen', '#111418', .05), bevel=0)
        box('dvd', -.3, .1, .3, .42, .3, .07, mat('dvd', '#1a1a1a', .3))
        box('bookcase', 1.35, .02, 0, .8, .3, 1.8, wood)
        for z in (.05, .45, .85, 1.25):
            books(1.0, 1.7, z, rnd=rnd)
        lamp(-1.35, .3, 0, h=1.5, glow=1.1)
        picture(0, 1.5, .8, .55, art='#9a8a5a')
        box('console', -1.35, .02, 0, .5, .3, .5, wood)
    elif i == 2:
        room('#b8c0b0', '#7a5434')
        box('hutch.base', 0, .02, 0, 1.6, .45, .82, dark)
        box('hutch.top', 0, .02, .82, 1.5, .32, 1.1, dark)
        glassm = mat('hutchglass', '#9aa4a0', .05)
        for s in (-1, 1):
            box('hutch.glass', s * .37, .34, .9, .66, .005, .95, glassm, 0)
        for z in (1.05, 1.4):
            for k in range(5):
                cyl('plate', -.6 + k * .3, .14, z, .1, .015, mat('china', '#eeeae0', .2))
        chair = mat('chair', '#5a3a24', .5)
        for s in (-1, 1):
            box('chair.back', s * .55, 1.0, .45, .45, .05, .55, chair)
            for k in (-1, 1):
                box('chair.post', s * .55 + k * .2, 1.0, 0, .04, .04, 1.0, chair)
        box('table', 0, 1.15, .72, 1.6, .5, .04, chair)
        ceiling_light(0, 1.4, kind='chandelier', glow=1.2)
        picture(-1.6, 1.3, .5, .65, art='#7a6a8a')
    elif i == 3:
        room('#e3dcc4', '#c8c0aa')
        cab = mat('cabinet', '#d9cfb4', .5)
        box('base', -.3, .02, 0, 2.4, .6, .87, cab)
        box('counter', -.3, .02, .87, 2.44, .63, .04, mat('counter', '#5a5650', .3))
        box('upper', -.3, .02, 1.45, 2.4, .33, .75, cab)
        for k in range(4):
            x = -1.35 + k * .6
            box('door', x, .62, .1, .55, .005, .7, cab, .004)
            box('udoor', x, .35, 1.5, .55, .005, .65, cab, .004)
            box('knob', x + .2, .63, .7, .03, .02, .03, mat('steel', '#a0a0a0', .3, 1.0), .005)
        box('backsplash', -.3, .0, .91, 2.4, .01, .5, mat('tile', '#d8d2c4', .3), 0)
        box('fridge', 1.35, .02, 0, .8, .7, 1.75, mat('fridge', '#e8e6e0', .25))
        box('microwave', -.9, .1, .91, .5, .35, .3, mat('mw', '#202020', .3))
        box('canisters', .4, .1, .91, .35, .15, .22, mat('can', '#9a3a2a', .4))
        box('toaster', .0, .1, .91, .28, .18, .2, mat('steel', '#a0a0a0', .3, 1.0))
        ceiling_light(-.3, .9, kind='dome', glow=1.0)
        L = bpy.data.lights.new('under', 'AREA')
        L.energy = 0.0
        L['lamp_energy'] = 25.0
        L.size = 2.0
        L.color = (1, .85, .6)
        ob = bpy.data.objects.new('under', L)
        ob.location = (-.3, -.2, 1.43)
        ob.rotation_euler = (0, 0, 0)
        bpy.context.scene.collection.objects.link(ob)
    elif i == 4:
        room('#c4b8c8', '#9a8a78')
        box('dresser', -.3, .02, 0, 1.3, .48, .82, wood)
        for k in range(3):
            box('drawer', -.3, .5, .1 + k * .24, 1.2, .005, .2, wood, .004)
        box('mirror', -.3, .02, .95, .9, .03, .9, mat('mirrorframe', '#5a3a24', .4))
        box('mirrorglass', -.3, .05, 1.0, .8, .002, .8, mat('mirror', '#c8ccd0', .02, 1.0), 0)
        lamp(-.85, .25, .82, h=.5, glow=.9)
        bed = mat('quilt', '#8a9ab0', .95)
        box('bed', 1.3, .9, 0, 1.4, 1.4, .55, bed, .06)
        box('pillowb', 1.3, .2, .5, .7, .3, .18, mat('pillowc', '#efe8da', .95), .06)
        box('headboard', 1.3, .02, 0, 1.45, .06, 1.1, wood)
        picture(1.3, 1.45, .7, .5, art='#a0b0a0')
    elif i == 5:
        room('#b8c8d4', '#7a7a8a')
        bed = mat('kidbed', '#2d4a8a', .95)
        box('bed', -1.0, .02, 0, 1.0, 1.9, .5, bed, .06)
        box('pillowk', -1.0, .05, .5, .6, .3, .14, mat('pillowc', '#efe8da', .95), .05)
        box('desk', 1.0, .02, 0, 1.1, .55, .74, mat('desk', '#c8b490', .5))
        box('monitor', 1.0, .1, .74, .5, .05, .38, mat('tv', '#0c0c0e', .15))
        box('screenk', 1.0, .155, .78, .46, .002, .3, mat('screenlit', '#2a3a5a', .1, emit='#6a8ab8', strength=0.0), 0)
        box('shelf', 0, .02, 1.25, .9, .25, .03, wood)
        for k in range(4):
            box('toy', -.3 + k * .2, .05, 1.28, .14, .14, .14 + .06 * (k % 2), mat('toy' + str(k), ['#c03a2a', '#e8b830', '#3a8a4a', '#2a5ab0'][k], .5), .01)
        picture(-1.0, 1.35, .6, .85, frame='#ffffff', art='#1a3a6a')
        picture(.2, 1.7, .5, .7, frame='#ffffff', art='#b04a2a')
        lamp(1.4, .2, .74, h=.45, glow=.8)
    elif i == 6:
        room('#d4c8ac', '#6a4a30')
        # a straight stair rising to the right against the wall, with a handrail and balusters
        for k in range(11):
            box('tread', -.2 + k * .26, .05, 0, .28, 1.0, .19 * (k + 1), mat('stair', '#7a5a3c', .45), .004)
        rail = mat('rail', '#4a2e1c', .4)
        for k in range(11):
            box('baluster', -.2 + k * .26, 1.0, .19 * (k + 1), .03, .03, .8, white, .003)
        bpy.ops.mesh.primitive_cylinder_add(radius=.03, depth=3.0, location=(1.1, -1.0, 1.85))
        ob = bpy.context.active_object
        ob.rotation_euler = (0, math.atan2(2.1, 2.86) + math.pi / 2, 0)
        ob.data.materials.append(rail)
        box('console', -1.3, .02, 0, .9, .3, .78, dark)
        lamp(-1.5, .15, .78, h=.5, glow=.9)
        picture(-1.3, 1.3, .6, .8, art='#c8c8c0', frame='#8a6a3a')
        for k in range(3):
            box('hook', -1.9 + k * .2, .02, 1.6, .03, .06, .03, mat('brass', '#8a6a30', .3, 1.0), .005)
        box('coat', -1.8, .06, .9, .3, .15, .75, mat('coat', '#3a4a5a', .95), .05)
    else:
        room('#cfc2a4', '#5a4a3a')
        box('bookcase', -1.1, .02, 0, 1.2, .32, 2.0, dark)
        for z in (.08, .5, .92, 1.34, 1.72):
            books(-1.65, -.55, z, rnd=rnd)
        box('desk', .9, .02, 0, 1.4, .65, .74, wood)
        box('monitor', .8, .15, .74, .55, .05, .42, mat('tv', '#0c0c0e', .15))
        box('screend', .8, .205, .78, .51, .002, .33, mat('screenlit', '#2a3a5a', .1, emit='#6a8ab8', strength=0.0), 0)
        box('tower', 1.45, .1, 0, .2, .45, .45, mat('tower', '#1e1e20', .4))
        lamp(.25, .2, .74, h=.45, glow=.8)
        picture(.9, 1.55, .6, .45, art='#6a7a5a')
        box('blinds', .9, .0, 1.25, .1, .02, .1, white)


def setup_render(samples):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.film_transparent = False
    try:
        sc.view_settings.view_transform = 'Standard'
    except TypeError:
        pass
    sc.view_settings.exposure = 0.0
    sc.render.image_settings.file_format = 'PNG'
    cam = bpy.data.cameras.new('cam')
    cam.type = 'ORTHO'
    cam.ortho_scale = SPAN
    ob = bpy.data.objects.new('cam', cam)
    ob.location = (0, -6, SPAN / 2)
    ob.rotation_euler = (math.pi / 2, 0, 0)
    sc.collection.objects.link(ob)
    sc.camera = ob


def set_mode(mode):
    sc = bpy.context.scene
    w = sc.world or bpy.data.worlds.new('w')
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    for ob in sc.objects:
        if ob.type == 'LIGHT':
            if ob.name.startswith('fill'):
                ob.data.energy = ob['day'] if mode == 'albedo' else 0.0
            else:
                ob.data.energy = ob.data.get('lamp_energy', 0.0) if mode == 'lamps' else 0.0
    for m in bpy.data.materials:
        b = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
        if b and m.get('emitter'):
            b.inputs['Emission Strength'].default_value = (m.get('lamp_strength', 4.0) if mode == 'lamps' else 0.0)
    bg.inputs['Strength'].default_value = .3 if mode == 'albedo' else 0.0
    bg.inputs['Color'].default_value = (1, .97, .92, 1)


def fill_lights():
    # soft, even daylight from the window side (camera side) so the card holds colour with gentle form shading
    for (x, z, e) in [(-1.2, 2.2, 85.0), (1.4, 1.2, 55.0)]:
        L = bpy.data.lights.new('fill', 'AREA')
        L.size = 2.5
        L.color = (1.0, .98, .95)
        ob = bpy.data.objects.new('fill', L)
        ob.location = (x, -3.0, z)
        ob.rotation_euler = (math.radians(80), 0, 0)
        ob['day'] = e
        bpy.context.scene.collection.objects.link(ob)


def render_card(i, samples, size, reuse=False):
    if reuse and all(os.path.exists(os.path.join(TMP, f'card{i}_{m}.png')) for m in ('albedo', 'lamps')):
        return {m: os.path.join(TMP, f'card{i}_{m}.png') for m in ('albedo', 'lamps')}
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()
    setup_render(samples)
    card(i)
    fill_lights()
    sc = bpy.context.scene
    sc.render.resolution_x = sc.render.resolution_y = size
    out = {}
    os.makedirs(TMP, exist_ok=True)
    for mode in ('albedo', 'lamps'):
        set_mode(mode)
        p = os.path.join(TMP, f'card{i}_{mode}.png')
        sc.render.filepath = p
        bpy.ops.render.render(write_still=True)
        out[mode] = p
    return out


def strip(kind, w, h, rnd):
    """Procedural strips (sRGB float images, h x w)."""
    y = np.linspace(0, 1, h)[:, None] * np.ones((1, w))
    x = np.ones((h, 1)) * np.linspace(0, 1, w)[None, :]
    noise = ndimage.gaussian_filter(rnd.standard_normal((h, w)), 3) * 4
    def rgb(hexs):
        hexs = hexs.lstrip('#')
        return np.array([int(hexs[i:i + 2], 16) / 255 for i in (0, 2, 4)])
    if kind.startswith('wall'):
        c = rgb({'wall0': '#d6c9ab', 'wall1': '#c9b99a', 'wall2': '#b9c0b2', 'wall3': '#e0d8c0', 'garage_wall': '#9a958a'}[kind])
        # u: from the window (0) to the back (1): a little darker toward the window wall corner; v: floor to ceiling
        shade = .62 + .25 * x - .18 * np.exp(-((1 - y) / .08) ** 2) - .2 * np.exp(-(y / .06) ** 2)
        img = c[None, None, :] * shade[..., None] * (1 + .02 * noise[..., None])
        if kind != 'garage_wall':
            img = np.where((y < .045)[..., None], rgb('#e8e2d4') * (.6 + .3 * x)[..., None], img)
        if kind == 'wall1':
            # a doorway opening on the side wall
            m = (x > .55) & (x < .78) & (y < .78)
            img = np.where(m[..., None], rgb('#3a3028')[None, None, :] * (.7 + .3 * y)[..., None], img)
        return img
    if kind.startswith('floor'):
        if kind == 'floor_carpet':
            c = rgb('#9a8a72')
            img = c * (.75 + .25 * x)[..., None] * (1 + .05 * noise[..., None])
        elif kind == 'floor_wood':
            plank = (np.floor(y * 9) % 2) * .06 + ndimage.gaussian_filter(rnd.standard_normal((h, w)), (1, 25)) * .3
            img = rgb('#7a5434') * ((.72 + .28 * x) * (1 + plank))[..., None]
            img = np.where((np.abs((y * 9) % 1 - .5) > .47)[..., None], img * .6, img)
        else:
            gx = np.abs((x * 6) % 1 - .5) > .47
            gy = np.abs((y * 3) % 1 - .5) > .45
            img = rgb('#d8d2c0') * (.75 + .25 * x)[..., None] * np.ones((h, w, 1))
            img = np.where((gx | gy)[..., None], img * .75, img)
        return img
    if kind == 'ceiling':
        return rgb('#f0e8d8') * (.55 + .4 * x)[..., None] * np.ones((h, w, 1))
    if kind == 'fabric':
        weave = (np.sin(x * w * .9) * np.sin(y * h * .9)) * .03
        folds = .85 + .15 * np.sin(x * math.tau * 3)
        return np.ones((h, w, 3)) * .88 * (folds + weave + .02 * noise)[..., None]
    if kind == 'sheer':
        return np.ones((h, w, 3)) * .92 * (.9 + .1 * np.sin(x * math.tau * 8))[..., None]
    if kind == 'blinds':
        slat = (y * 40) % 1
        img = np.ones((h, w, 3)) * (.86 - .2 * slat)[..., None]
        img = np.where((slat > .9)[..., None], np.ones((h, w, 3)) * .3, img)
        return img
    if kind == 'garage':
        img = rgb('#6a665e') * (.5 + .2 * y)[..., None] * np.ones((h, w, 1))
        # shelving with boxes, a bike shape on the wall
        for k in range(3):
            m = (np.abs(y - (.3 + k * .25)) < .012) & (x > .05) & (x < .4)
            img = np.where(m[..., None], rgb('#4a4640'), img)
            for j in range(4):
                bm = (y > .3 + k * .25 + .012) & (y < .3 + k * .25 + .12) & (x > .07 + j * .08) & (x < .13 + j * .08)
                img = np.where(bm[..., None], rgb(['#3a5a8a', '#d8d0b0', '#8a3a2a', '#4a6a3a'][j]) * .7, img)
        for cx in (.62, .82):
            r = np.sqrt(((x - cx) * 2) ** 2 + ((y - .55) * 1) ** 2)
            img = np.where(((r > .07) & (r < .085))[..., None], rgb('#202020'), img)
        return img * (1 + .03 * noise[..., None])
    if kind == 'shade':
        return np.ones((h, w, 3)) * rgb('#3a342c') * (.8 + .2 * y)[..., None]
    if kind == 'dark':
        return np.ones((h, w, 3)) * .03
    if kind == 'glow':
        return np.ones((h, w, 3)) * rgb('#fff0c8')
    return np.ones((h, w, 3)) * .5


STRIPS = [('wall0', 0, 0), ('wall1', 1, 0), ('wall2', 2, 0), ('wall3', 3, 0),
          ('floor_carpet', 0, 1), ('floor_wood', 1, 1), ('floor_tile', 2, 1), ('ceiling', 3, 1),
          ('fabric', 0, 2), ('sheer', 1, 2), ('blinds', 2, 2), ('garage', 3, 2),
          ('garage_wall', 0, 3), ('shade', 1, 3), ('dark', 2, 3), ('glow', 3, 3)]


def main():
    o = args()
    N = o['size']
    cs = N // 4
    atlas = np.zeros((N, N, 3))
    emis = np.zeros((N, N, 3))
    for i in range(8):
        r = render_card(i, o['samples'], cs, o['reuse'])
        a = np.asarray(Image.open(r['albedo']).convert('RGB'), dtype=np.float64) / 255
        e = np.asarray(Image.open(r['lamps']).convert('RGB'), dtype=np.float64) / 255
        col, row = i % 4, i // 4
        atlas[row * cs:(row + 1) * cs, col * cs:(col + 1) * cs] = a
        emis[row * cs:(row + 1) * cs, col * cs:(col + 1) * cs] = e
        print('card', i, flush=True)
    rnd = np.random.default_rng(5)
    sh = N // 8
    for (kind, cx, cy) in STRIPS:
        img = strip(kind, cs, sh, rnd)
        y0 = N // 2 + cy * sh
        atlas[y0:y0 + sh, cx * cs:(cx + 1) * cs] = np.clip(img[::-1], 0, 1)   # v up within the strip
        if kind == 'glow':
            emis[y0:y0 + sh, cx * cs:(cx + 1) * cs] = img
    os.makedirs(OUT, exist_ok=True)
    rt = 1024
    files = {'basecolor': 'house.kit__interior_basecolor.jpg', 'emissive': 'house.kit__interior_emissive.jpg'}
    Image.fromarray((np.clip(atlas, 0, 1) * 255 + .5).astype(np.uint8)).resize((rt, rt), Image.LANCZOS).save(os.path.join(OUT, files['basecolor']), quality=90)
    Image.fromarray((np.clip(emis, 0, 1) * 255 + .5).astype(np.uint8)).resize((rt, rt), Image.LANCZOS).save(os.path.join(OUT, files['emissive']), quality=90)
    meta_path = os.path.join(OUT, 'library.json')
    lib = json.load(open(meta_path)) if os.path.exists(meta_path) else {'families': {}}
    lib['families']['interior'] = {'files': files, 'mean': [1, 1, 1], 'emission': 0.0,
                                   'note': 'cards rendered with Cycles (interior_atlas.py), strips painted; emissive = the rooms lamps alone'}
    json.dump(lib, open(meta_path, 'w'), indent=1)
    print('wrote atlas', flush=True)


if __name__ == '__main__':
    main()
