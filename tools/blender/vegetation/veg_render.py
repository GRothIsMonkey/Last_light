"""Last Light vegetation presentation (Cycles): the Prologue's light, the lookout ground, render-only material extras.

Offline renders (VISUAL-QA-ACCEPTANCE §1 rank 6): not the game. The light rig is the house gallery's (house_render.py,
ACES 1.3) so oak, houses and bikes are judged under the same sun. Cycles-only additions here never reach the GLB:
leaf translucency (back-lit leaves glow), bark moss and dead wood from the _WIND.w channel, which the game's
vegetation shader reads the same way.
"""
import json
import math
import os
import sys
import numpy as np
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'houses'))
import house_render as HR  # noqa: E402

QA = os.path.join(ROOT, 'docs', 'qa', 'vegetation')


def _n(nt, kind, loc=(0, 0)):
    n = nt.nodes.new(kind)
    n.location = loc
    return n


def presentation_materials():
    """Upgrade the export materials for Cycles: leaves translucent, bark with moss/dead wood from _WIND.w."""
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        nt = m.node_tree
        b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
        if not b or not out or m.get('ll_presented'):
            continue
        m['ll_presented'] = 1
        name = m.name
        if name.startswith('mat.foliage'):
            mix_in = b.inputs['Base Color'].links[0].from_node if b.inputs['Base Color'].links else None
            tr = _n(nt, 'ShaderNodeBsdfTranslucent', (300, -250))
            if mix_in:
                warm = _n(nt, 'ShaderNodeMix', (100, -250))
                warm.data_type = 'RGBA'
                warm.blend_type = 'MULTIPLY'
                warm.inputs['Factor'].default_value = 1.0
                warm.inputs['B'].default_value = (1.25, 1.2, .7, 1)
                nt.links.new(mix_in.outputs['Result'], warm.inputs['A'])
                nt.links.new(warm.outputs['Result'], tr.inputs['Color'])
            ms = _n(nt, 'ShaderNodeMixShader', (500, -100))
            ms.inputs['Fac'].default_value = .32
            nt.links.new(b.outputs['BSDF'], ms.inputs[1])
            nt.links.new(tr.outputs['BSDF'], ms.inputs[2])
            alpha_src = b.inputs['Alpha'].links[0].from_socket if b.inputs['Alpha'].links else None
            if alpha_src:
                tp = _n(nt, 'ShaderNodeBsdfTransparent', (500, -300))
                ma = _n(nt, 'ShaderNodeMixShader', (700, -150))
                nt.links.new(alpha_src, ma.inputs['Fac'])
                nt.links.new(tp.outputs['BSDF'], ma.inputs[1])
                nt.links.new(ms.outputs['Shader'], ma.inputs[2])
                nt.links.new(ma.outputs['Shader'], out.inputs['Surface'])
                b.inputs['Alpha'].default_value = 1.0
                for l in list(b.inputs['Alpha'].links):
                    nt.links.remove(l)
            else:
                nt.links.new(ms.outputs['Shader'], out.inputs['Surface'])
            # leaf hue jitter from _WIND.w (0..1): +-6 % per card
            at = _n(nt, 'ShaderNodeAttribute', (-500, 650))
            at.attribute_name = '_WIND'
            hsv = _n(nt, 'ShaderNodeHueSaturation', (100, 400))
            mp = _n(nt, 'ShaderNodeMapRange', (-200, 650))
            mp.inputs['To Min'].default_value = .465
            mp.inputs['To Max'].default_value = .535
            nt.links.new(at.outputs['Alpha'], mp.inputs['Value'])
            nt.links.new(mp.outputs['Result'], hsv.inputs['Hue'])
            if mix_in:
                nt.links.new(mix_in.outputs['Result'], hsv.inputs['Color'])
                nt.links.new(hsv.outputs['Color'], b.inputs['Base Color'])
        elif name.startswith('mat.bark') and 'carving' not in name:
            mix_in = b.inputs['Base Color'].links[0].from_node if b.inputs['Base Color'].links else None
            if not mix_in:
                continue
            at = _n(nt, 'ShaderNodeAttribute', (-500, 650))
            at.attribute_name = '_WIND'
            neg = _n(nt, 'ShaderNodeMath', (-300, 650))
            neg.operation = 'MULTIPLY'
            neg.inputs[1].default_value = -1.0
            nt.links.new(at.outputs['Alpha'], neg.inputs[0])
            nz = _n(nt, 'ShaderNodeTexNoise', (-500, 850))
            nz.inputs['Scale'].default_value = 1.6
            nz.inputs['Detail'].default_value = 6
            mk = _n(nt, 'ShaderNodeMath', (-150, 750))
            mk.operation = 'MULTIPLY'
            nt.links.new(neg.outputs[0], mk.inputs[0])
            nt.links.new(nz.outputs['Fac'], mk.inputs[1])
            mk2 = _n(nt, 'ShaderNodeMath', (0, 750))
            mk2.operation = 'MULTIPLY'
            mk2.use_clamp = True
            mk2.inputs[1].default_value = 1.3
            nt.links.new(mk.outputs[0], mk2.inputs[0])
            moss = _n(nt, 'ShaderNodeMix', (150, 500))
            moss.data_type = 'RGBA'
            moss.inputs['B'].default_value = (.045, .065, .022, 1)
            nt.links.new(mk2.outputs[0], moss.inputs['Factor'])
            nt.links.new(mix_in.outputs['Result'], moss.inputs['A'])
            dead = _n(nt, 'ShaderNodeMix', (300, 450))
            dead.data_type = 'RGBA'
            dead.inputs['B'].default_value = (.42, .40, .37, 1)
            cl = _n(nt, 'ShaderNodeMath', (0, 550))
            cl.operation = 'MAXIMUM'
            cl.inputs[1].default_value = 0.0
            nt.links.new(at.outputs['Alpha'], cl.inputs[0])
            dm = _n(nt, 'ShaderNodeMath', (100, 600))
            dm.operation = 'MULTIPLY'
            dm.inputs[1].default_value = .75
            nt.links.new(cl.outputs[0], dm.inputs[0])
            nt.links.new(dm.outputs[0], dead.inputs['Factor'])
            nt.links.new(moss.outputs['Result'], dead.inputs['A'])
            nt.links.new(dead.outputs['Result'], b.inputs['Base Color'])


def lookout_ground(site, mat=None, size=24):
    """The game's ground around the oak (site grid), as a mesh."""
    g = site['grid']
    rows = np.array(g['rows'])
    n = rows.shape[0]
    x0, f0, st = g['x0'], g['f0'], g['step']
    verts = [(x0 + i * st, f0 + j * st, rows[j, i]) for j in range(n) for i in range(n)]
    faces = [(j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i) for j in range(n - 1) for i in range(n - 1)]
    me = bpy.data.meshes.new('ref.ground')
    me.from_pydata(verts, [], faces)
    me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new('ref.ground', me)
    bpy.context.scene.collection.objects.link(ob)
    if mat:
        me.materials.append(mat)
    # an outer skirt so the horizon is ground, not void
    sk = HR.plane(bpy.context.scene, 'ref.far', -400, 400, -400, 400, float(rows.min()) - .6, mat or HR.ground_mat('render.grass', (0.045, 0.075, 0.02), (0.11, 0.15, 0.04)))
    return ob


def meadow_material(site=None):
    """Late-August lookout grass: green-gold with dry patches, a worn dirt circle under the swing."""
    m = bpy.data.materials.new('ref.meadow')
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    tc = _n(nt, 'ShaderNodeTexCoord')
    nz = _n(nt, 'ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = .35
    nz.inputs['Detail'].default_value = 12
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = _n(nt, 'ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (.055, .085, .025, 1)
    ramp.color_ramp.elements[1].color = (.16, .17, .06, 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    fine = _n(nt, 'ShaderNodeTexNoise')
    fine.inputs['Scale'].default_value = 40
    nt.links.new(tc.outputs['Object'], fine.inputs['Vector'])
    mixf = _n(nt, 'ShaderNodeMix')
    mixf.data_type = 'RGBA'
    mixf.blend_type = 'OVERLAY'
    mixf.inputs['Factor'].default_value = .5
    nt.links.new(ramp.outputs['Color'], mixf.inputs['A'])
    nt.links.new(fine.outputs['Color'], mixf.inputs['B'])
    col_out = mixf.outputs['Result']
    if site:
        # worn dirt under the swing (the patch the game describes) and the trodden path from the bulb
        px, py = site['swing']['pivot'][0], site['swing']['pivot'][1]
        gm = _n(nt, 'ShaderNodeVectorMath')
        gm.operation = 'DISTANCE'
        gm.inputs[1].default_value = (px, py, 0)
        sep = _n(nt, 'ShaderNodeSeparateXYZ')
        nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
        comb = _n(nt, 'ShaderNodeCombineXYZ')
        nt.links.new(sep.outputs['X'], comb.inputs['X'])
        nt.links.new(sep.outputs['Y'], comb.inputs['Y'])
        nt.links.new(comb.outputs['Vector'], gm.inputs[0])
        wr = _n(nt, 'ShaderNodeMapRange')
        wr.inputs['From Min'].default_value = 1.6
        wr.inputs['From Max'].default_value = .4
        nt.links.new(gm.outputs['Value'], wr.inputs['Value'])
        wn = _n(nt, 'ShaderNodeMath')
        wn.operation = 'MULTIPLY'
        wn.use_clamp = True
        nt.links.new(wr.outputs['Result'], wn.inputs[0])
        nt.links.new(fine.outputs['Fac'], wn.inputs[1])
        wn2 = _n(nt, 'ShaderNodeMath')
        wn2.operation = 'MULTIPLY'
        wn2.use_clamp = True
        wn2.inputs[1].default_value = 2.2
        nt.links.new(wn.outputs[0], wn2.inputs[0])
        dirt = _n(nt, 'ShaderNodeMix')
        dirt.data_type = 'RGBA'
        dirt.inputs['B'].default_value = (.19, .14, .09, 1)
        nt.links.new(wn2.outputs[0], dirt.inputs['Factor'])
        nt.links.new(col_out, dirt.inputs['A'])
        col_out = dirt.outputs['Result']
    nt.links.new(col_out, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = .95
    bp = _n(nt, 'ShaderNodeBump')
    bp.inputs['Strength'].default_value = .35
    nt.links.new(fine.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def simple_mat(name, color, rough=.8, metal=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m


def box(name, c, size, mat, rot=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size
    ob.rotation_euler[2] = rot
    ob.data.materials.append(mat)
    return ob


def lookout_props(site, limb_r=.24):
    """Bench, field fence and the tire swing exactly where the game has them (oak-local)."""
    wood = simple_mat('ref.bench_wood', (.27, .19, .12), .8)
    iron = simple_mat('ref.iron', (.035, .035, .033), .5, .6)
    bx, by, bz = site['bench']['at']
    for k in range(3):
        box('ref.bench.seat', (bx, by - .18 + k * .14, bz + .46), (1.7, .11, .045), wood)
    for k in range(2):
        box('ref.bench.back', (bx, by + .22, bz + .66 + k * .16), (1.7, .04, .1), wood)
    for s in (-1, 1):
        box('ref.bench.leg', (bx + s * .74, by, bz + .32), (.07, .55, .64), iron)
    fence = simple_mat('ref.fence', (.36, .30, .22), .9)
    f = site['fence']['f']
    for lat in np.arange(-17 - site['oak']['lat'], 17.1 - site['oak']['lat'], 2.6):
        z = 0.0
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=.075, depth=1.5, location=(lat, f, z + .55))
        bpy.context.active_object.data.materials.append(fence)
    for yy in (.55, 1.05):
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=.045, depth=34, location=(-site['oak']['lat'], f + .06, yy), rotation=(0, math.pi / 2, 0))
        bpy.context.active_object.data.materials.append(fence)
    # the tire swing (ambient.js: pivot, rope 3.05 m, tire 0.3/0.11 m torus at 3.35 m below the pivot)
    rope = simple_mat('ref.rope', (.45, .38, .26), .95)
    tire = simple_mat('ref.tire', (.03, .03, .03), .7)
    px, py, pz = site['swing']['pivot']
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=.016, depth=3.05, location=(px, py, pz - 1.525))
    bpy.context.active_object.data.materials.append(rope)
    az = math.atan2(py, px)
    bpy.ops.mesh.primitive_torus_add(major_radius=limb_r + .02, minor_radius=.018, location=(px, py, pz + limb_r), rotation=(math.pi / 2, 0, az + math.pi / 2))
    bpy.context.active_object.data.materials.append(rope)
    bpy.ops.mesh.primitive_torus_add(major_radius=.3, minor_radius=.11, location=(px, py, pz - 3.35), rotation=(math.pi / 2, 0, az))
    bpy.context.active_object.data.materials.append(tire)


def cycles(scene, samples=48):
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.transparent_max_bounces = 16
    scene.cycles.max_bounces = 6
    scene.render.film_transparent = False


lights = HR.lights
camera = HR.camera
render = HR.render


def dusk(scene, azimuth=250.0):
    """Blue hour after sunset: the sun 3 deg below the horizon, a faint warm band, everything else silhouette."""
    HR.lights(scene, 'golden', azimuth, 1.0)
    w = scene.world.node_tree
    sky = next(n for n in w.nodes if n.type == 'TEX_SKY')
    sky.sun_elevation = math.radians(-2.5)
    try:
        sky.sun_disc = False
    except Exception:
        pass
    bg = w.nodes['Background']
    bg.inputs['Strength'].default_value = 1.6
    for o in scene.objects:
        if o.type == 'LIGHT':
            o.data.energy = 0.0
    scene.view_settings.exposure = 1.2


def sun(scene, bearing, elevation, look='golden'):
    """The house rig, with the sun placed by ONE bearing (deg, oak-local/X-east convention: 0 = +X, 90 = +Y) where the
    sun stands. Measured: house_render.lights puts the sky's sun 90 deg away from its lamp; here both agree."""
    HR.lights(scene, look, bearing, elevation)
    w = scene.world.node_tree
    sky = next(n for n in w.nodes if n.type == 'TEX_SKY')
    sky.sun_rotation = math.radians(bearing + 90)
    sky.sun_elevation = math.radians(elevation)
    for o in scene.objects:
        if o.type == 'LIGHT':
            o.rotation_euler = (math.radians(90 - elevation), 0, math.radians(bearing + 90))
