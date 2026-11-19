"""Blender close-ups of the lawn repair's assets (offline Cycles; rank 6 evidence, NOT the game).

    python tools/blender/vegetation/lawn_render.py [--quick] [L1 L2 L3 L4]
  L1  the lawn beside the sidewalk, a crouching eye (0.9 m): the ground material (veg.lawn lawn textures, the two height-blended
      scales the game uses) with the blade tiles standing on it
  L2  the same lawn from a standing eye (1.6 m) looking down 2-5 m ahead
  L3  the lookout's long grass and a trodden patch of earth (meadow + soil textures, long blades)
  L4  one tile up close (0.3 m): the blades, their shoots, their colour from root to tip
The geometry and textures come from lawn_kit.py, exactly what veg.lawn.glb ships; the colours are the game's
(vegetation-lawn.js COLOURS) with the detail textures normalised to mean 1, as the game's shader does.
"""
import json
import math
import os
import sys
import numpy as np
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_render as R  # noqa: E402
import lawn_kit as K  # noqa: E402

OUT = os.path.join(R.QA, 'lawn')
KEEP = (.158, .205, .066)
WILD = (.200, .198, .076)
SOIL = (.150, .118, .078)
rng = np.random.default_rng(2011)


def _img(name):
    p = os.path.join(K.TEXDIR, name)
    im = bpy.data.images.load(p, check_existing=True)
    return im


def ground_material(name, tex, target, tile_m, second=True, soil_patch=None):
    """World-position mapped ground: albedo (normalised to its mean) x target colour, two scales height-blended, normal."""
    meta = json.load(open(os.path.join(K.TEXDIR, 'textures.json')))
    mean = meta[tex]['meanLinear']
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    n = lambda k, x, y: R._n(nt, k, (x, y))
    out = n('ShaderNodeOutputMaterial', 900, 0)
    bsdf = n('ShaderNodeBsdfPrincipled', 600, 0)
    bsdf.inputs['Roughness'].default_value = .93
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    geo = n('ShaderNodeNewGeometry', -1400, 0)
    sep = n('ShaderNodeSeparateXYZ', -1200, 0)
    nt.links.new(geo.outputs['Position'], sep.inputs[0])
    comb = n('ShaderNodeCombineXYZ', -1000, 0)
    nt.links.new(sep.outputs[0], comb.inputs[0])
    nt.links.new(sep.outputs[1], comb.inputs[1])

    def sample(scale, rot, y, colorspace='sRGB', file=None):
        mp = n('ShaderNodeMapping', -800, y)
        mp.inputs['Scale'].default_value = (1 / scale, 1 / scale, 1)
        mp.inputs['Rotation'].default_value = (0, 0, math.radians(rot))
        mp.inputs['Location'].default_value = (.31, .17, 0) if rot else (0, 0, 0)
        nt.links.new(comb.outputs[0], mp.inputs[0])
        t = n('ShaderNodeTexImage', -600, y)
        t.image = _img(file)
        t.image.colorspace_settings.name = colorspace
        t.interpolation = 'Cubic'
        nt.links.new(mp.outputs[0], t.inputs[0])
        return t
    a1 = sample(tile_m, 0, 300, file=f'veg.lawn__{tex}_basecolor.png')
    n1 = sample(tile_m, 0, -300, 'Non-Color', f'veg.lawn__{tex}_normal.png')
    col, nor = a1.outputs['Color'], n1.outputs['Color']
    if second:
        a2 = sample(1 / .73, 37, 100, file=f'veg.lawn__{tex}_basecolor.png')
        n2 = sample(1 / .73, 37, -500, 'Non-Color', f'veg.lawn__{tex}_normal.png')
        noise = n('ShaderNodeTexNoise', -600, 600)
        noise.inputs['Scale'].default_value = .45
        nt.links.new(geo.outputs['Position'], noise.inputs['Vector'])
        # height blend: which sample stands higher (alpha = height), biased by a slow noise
        d = n('ShaderNodeMath', -350, 500)
        d.operation = 'SUBTRACT'
        nt.links.new(a1.outputs['Alpha'], d.inputs[0])
        nt.links.new(a2.outputs['Alpha'], d.inputs[1])
        b = n('ShaderNodeMath', -200, 500)
        b.operation = 'MULTIPLY_ADD'
        nt.links.new(noise.outputs['Fac'], b.inputs[0])
        b.inputs[1].default_value = 1.8
        b.inputs[2].default_value = -.9
        s = n('ShaderNodeMath', -100, 450)
        s.operation = 'ADD'
        nt.links.new(d.outputs[0], s.inputs[0])
        nt.links.new(b.outputs[0], s.inputs[1])
        w = n('ShaderNodeMapRange', 0, 450)
        w.inputs['From Min'].default_value = -.06
        w.inputs['From Max'].default_value = .06
        nt.links.new(s.outputs[0], w.inputs['Value'])
        mix = n('ShaderNodeMix', 150, 300)
        mix.data_type = 'RGBA'
        nt.links.new(w.outputs[0], mix.inputs['Factor'])
        nt.links.new(a2.outputs['Color'], mix.inputs[6])
        nt.links.new(a1.outputs['Color'], mix.inputs[7])
        col = mix.outputs[2]
        mixn = n('ShaderNodeMix', 150, -400)
        mixn.data_type = 'RGBA'
        nt.links.new(w.outputs[0], mixn.inputs['Factor'])
        nt.links.new(n2.outputs['Color'], mixn.inputs[6])
        nt.links.new(n1.outputs['Color'], mixn.inputs[7])
        nor = mixn.outputs[2]
    gain = n('ShaderNodeVectorMath', 330, 300)
    gain.operation = 'MULTIPLY'
    gain.inputs[1].default_value = tuple(t / m_ for t, m_ in zip(target, mean))
    nt.links.new(col, gain.inputs[0])
    final = gain.outputs[0]
    if soil_patch:
        # a trodden patch of bare earth (the swing's): soil texture inside a ragged ellipse
        cx, cy, rx, ry = soil_patch
        st = sample(1.0, 11, -800, file='veg.lawn__soil_basecolor.png')
        sg = n('ShaderNodeVectorMath', 330, -800)
        sg.operation = 'MULTIPLY'
        smean = json.load(open(os.path.join(K.TEXDIR, 'textures.json')))['soil']['meanLinear']
        sg.inputs[1].default_value = tuple(t / m_ for t, m_ in zip(SOIL, smean))
        nt.links.new(st.outputs['Color'], sg.inputs[0])
        ell = n('ShaderNodeVectorMath', -800, -1100)
        ell.operation = 'MULTIPLY'
        sub = n('ShaderNodeVectorMath', -1000, -1100)
        sub.operation = 'SUBTRACT'
        sub.inputs[1].default_value = (cx, cy, 0)
        nt.links.new(comb.outputs[0], sub.inputs[0])
        ell.inputs[1].default_value = (1 / rx, 1 / ry, 0)
        nt.links.new(sub.outputs[0], ell.inputs[0])
        ln = n('ShaderNodeVectorMath', -600, -1100)
        ln.operation = 'LENGTH'
        nt.links.new(ell.outputs[0], ln.inputs[0])
        nz = n('ShaderNodeTexNoise', -600, -1300)
        nz.inputs['Scale'].default_value = 1.6
        nt.links.new(geo.outputs['Position'], nz.inputs['Vector'])
        ad = n('ShaderNodeMath', -400, -1100)
        ad.operation = 'MULTIPLY_ADD'
        nt.links.new(nz.outputs['Fac'], ad.inputs[0])
        ad.inputs[1].default_value = .5
        nt.links.new(ln.outputs[1], ad.inputs[2])
        rr = n('ShaderNodeMapRange', -200, -1100)
        rr.inputs['From Min'].default_value = 1.15
        rr.inputs['From Max'].default_value = .7
        nt.links.new(ad.outputs[0], rr.inputs['Value'])
        mx = n('ShaderNodeMix', 480, 0)
        mx.data_type = 'RGBA'
        nt.links.new(rr.outputs[0], mx.inputs['Factor'])
        nt.links.new(final, mx.inputs[6])
        nt.links.new(sg.outputs[0], mx.inputs[7])
        final = mx.outputs[2]
    nt.links.new(final, bsdf.inputs['Base Color'])
    nm = n('ShaderNodeNormalMap', 330, -300)
    nm.space = 'OBJECT'
    nm.inputs['Strength'].default_value = .35
    nt.links.new(nor, nm.inputs['Color'])
    nt.links.new(nm.outputs[0], bsdf.inputs['Normal'])
    return m


def blade_material(name, target):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = .82
    at = R._n(nt, 'ShaderNodeAttribute', (-700, 200))
    at.attribute_name = 'll_t'
    ramp = R._n(nt, 'ShaderNodeMix', (-400, 200))
    ramp.data_type = 'RGBA'
    nt.links.new(at.outputs['Fac'], ramp.inputs['Factor'])
    ramp.inputs[6].default_value = (*(c * .6 for c in target), 1)
    ramp.inputs[7].default_value = (*(c * 1.16 for c in target), 1)
    jit = R._n(nt, 'ShaderNodeAttribute', (-700, -100))
    jit.attribute_name = 'll_j'
    mul = R._n(nt, 'ShaderNodeMix', (-200, 100))
    mul.data_type = 'RGBA'
    mul.blend_type = 'MULTIPLY'
    mul.inputs['Factor'].default_value = 1
    nt.links.new(ramp.outputs[2], mul.inputs[6])
    nt.links.new(jit.outputs['Color'], mul.inputs[7])
    nt.links.new(mul.outputs[2], bsdf.inputs['Base Color'])
    # thin leaves pass a little light (Cycles-only; the game's blade normal leans to the ground's instead)
    bsdf.inputs['Transmission Weight'].default_value = .05
    return m


def tile_object(mat):
    T = K.tile()
    P = T['P'][:, [0, 2, 1]] * np.array([1, -1, 1])           # glTF y-up -> Blender z-up
    me = bpy.data.meshes.new('lawn.tile')
    faces = T['I'].reshape(-1, 3)[:, [0, 2, 1]]
    me.from_pydata(P.tolist(), [], faces.tolist())
    t = me.attributes.new('ll_t', 'FLOAT', 'POINT')
    t.data.foreach_set('value', T['BLADE'][:, 0].astype(np.float32))
    j = me.color_attributes.new('ll_j', 'FLOAT_COLOR', 'POINT')
    w = T['LAWN'][:, 3]
    jc = np.stack([.95 + .11 * w, 1.02 - .04 * w, .92 + .13 * w, np.ones_like(w)], 1) * (.9 + .2 * ((w * 7.13) % 1))[:, None]
    jc[:, 3] = 1
    j.data.foreach_set('color', jc.astype(np.float32).ravel())
    me.materials.append(mat)
    ob = bpy.data.objects.new('lawn.tile', me)
    ob.hide_render = True
    bpy.context.scene.collection.objects.link(ob)
    return ob


def scatter(src, x0, x1, y0, y1, z, hscale=(1, 1), keep=lambda x, y: True):
    for i in range(int(math.floor(x0)), int(math.ceil(x1))):
        for j in range(int(math.floor(y0)), int(math.ceil(y1))):
            cx, cy = i + .5, j + .5
            if cx < x0 or cx > x1 or cy < y0 or cy > y1 or not keep(cx, cy):
                continue
            o = src.copy()
            bpy.context.scene.collection.objects.link(o)
            o.hide_render = False
            o.location = (cx, cy, z - .008)
            o.rotation_euler = (0, 0, rng.integers(4) * math.pi / 2)
            h = rng.uniform(*hscale)
            o.scale = (-1 if rng.random() < .5 else 1, 1, h)


def lawn_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    S = 19.0
    R.HR.street_set(sc, S, x0=-25, x1=25, extra_back=14)
    lawn = ground_material('render.lawn', 'lawn', KEEP, .5)
    for name in ('set.lawn', 'set.strip'):
        o = bpy.data.objects[name]
        o.data.materials[0] = lawn
    tile = tile_object(blade_material('render.blade', KEEP))
    scatter(tile, -7, 7, -S + 7.86, -S + 17, -.002, (.85, 1.1))
    scatter(tile, -7, 7, -S + 5.02, -S + 6.33, .12, (.85, 1.1))
    R.cycles(sc, 32)
    R.sun(sc, 215, 22)
    sc.view_settings.exposure = -.9
    return sc, S


def lookout_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    g = ground_material('render.meadow', 'meadow', WILD, 1.0, second=False, soil_patch=(0, 3, 1.75, 1.35))
    R.HR.plane(sc, 'lookout.ground', -20, 20, -10, 30, 0, g)
    tile = tile_object(blade_material('render.blade.wild', WILD))
    scatter(tile, -9, 9, -4, 14, 0, (2.4, 3.6), keep=lambda x, y: math.hypot(x / 1.75, (y - 3) / 1.35) > 1.05 + rng.uniform(0, .25))
    R.cycles(sc, 32)
    R.sun(sc, 230, 16)
    sc.view_settings.exposure = -.9
    return sc


def main(argv):
    quick = '--quick' in argv
    want = [a for a in argv if not a.startswith('--')] or ['L1', 'L2', 'L3', 'L4']
    os.makedirs(OUT, exist_ok=True)
    res = (800, 500) if quick else (1600, 1000)
    smp = 12 if quick else 40
    if {'L1', 'L2', 'L4'} & set(want):
        sc, S = lawn_scene()
        if 'L1' in want:
            R.camera(sc, (-2.4, -S + 6.6, .9), (1.6, -S + 11.5, .05), lens=30)
            R.render(sc, os.path.join(OUT, 'L1_lawn_beside_sidewalk.jpg'), res=res, samples=smp)
        if 'L2' in want:
            R.camera(sc, (0, -S + 7.1, 1.6), (.4, -S + 10.8, 0), lens=32)
            R.render(sc, os.path.join(OUT, 'L2_lawn_standing.jpg'), res=res, samples=smp)
        if 'L4' in want:
            R.camera(sc, (.1, -S + 10.2, .32), (.5, -S + 11.1, .02), lens=40)
            R.render(sc, os.path.join(OUT, 'L4_blades_close.jpg'), res=res, samples=smp)
    if 'L3' in want:
        sc = lookout_scene()
        R.camera(sc, (-4.5, -4.2, 1.6), (0, 4, 0), lens=30)
        R.render(sc, os.path.join(OUT, 'L3_lookout_long_grass_and_earth.jpg'), res=res, samples=smp)


if __name__ == '__main__':
    main(sys.argv[1:])
