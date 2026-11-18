"""Last Light house kit: Blender (Cycles) presentation for the house gallery. Offline renders, not game captures.

Two looks, the same for every house (so the gallery is comparable):
  * 'review' : soft, high afternoon light, neutral, to judge construction and materials;
  * 'golden' : the Prologue's golden hour (low warm sun, sky fill), the light the game rides in.
The ground is a simple lawn/concrete set at the lot's own street geometry (sidewalk at 6.35-7.85 m from the street's
centre line, the house at its setback), so framing matches what a rider sees.
Blender frame: house-local (x, y_up, z_front) -> Blender (x, -z, y); the street is toward -Y.
"""
import math
import bpy
from mathutils import Vector

VIEW = 'ACES 1.3'


def _node(nt, kind, loc=(0, 0)):
    n = nt.nodes.new(kind)
    n.location = loc
    return n


def ground_mat(name, c0, c1, scale=6.0, rough=.9, bump=.15):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    tc = _node(nt, 'ShaderNodeTexCoord')
    nz = _node(nt, 'ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = 10
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = _node(nt, 'ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*c0, 1)
    ramp.color_ramp.elements[1].color = (*c1, 1)
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    bp = _node(nt, 'ShaderNodeBump')
    bp.inputs['Strength'].default_value = bump
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def plane(scene, name, x0, x1, y0, y1, z, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata([(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], [], [(0, 1, 2, 3)])
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob


def street_set(scene, setback, x0=-40, x1=40, extra_back=25):
    """Lawn, sidewalk, curb strip and street in front of a house whose front lot line is at the setback."""
    grass = ground_mat('render.grass', (0.045, 0.075, 0.02), (0.11, 0.15, 0.04), scale=14, rough=.95, bump=.3)
    conc = ground_mat('render.concrete', (0.36, 0.34, 0.31), (0.5, 0.48, 0.44), scale=9, rough=.88, bump=.08)
    asph = ground_mat('render.asphalt', (0.035, 0.035, 0.035), (0.09, 0.088, 0.085), scale=40, rough=.92, bump=.2)
    # house-local z toward the street; the street's centre line is at z = setback (Blender y = -setback)
    S = setback
    plane(scene, 'set.lawn', x0, x1, -S + 7.85, extra_back, -.002, grass)
    plane(scene, 'set.walk', x0, x1, -S + 6.35, -S + 7.85, .14, conc)
    plane(scene, 'set.strip', x0, x1, -S + 5.0, -S + 6.35, .12, grass)
    plane(scene, 'set.curb', x0, x1, -S + 4.7, -S + 5.0, .15, conc)
    plane(scene, 'set.street', x0, x1, -S - 30, -S + 4.7, 0.0, asph)


def lights(scene, look):
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 5
    scene.cycles.transparent_max_bounces = 8
    try:
        scene.view_settings.view_transform = VIEW
        scene.view_settings.look = 'None'
    except TypeError:
        scene.view_settings.view_transform = 'AgX'
    world = bpy.data.worlds.new('render.world.' + look)
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes['Background']
    sky = _node(nt, 'ShaderNodeTexSky')
    for kind in ('MULTIPLE_SCATTERING', 'NISHITA'):
        try:
            sky.sky_type = kind
            break
        except TypeError:
            continue
    dust = 'aerosol_density' if hasattr(sky, 'aerosol_density') else 'dust_density'
    if look == 'golden':
        sky.sun_elevation = math.radians(8.0)
        sky.sun_rotation = math.radians(250.0)
        sky.air_density = 1.6
        setattr(sky, dust, 3.2)
        sky.sun_intensity = .6
        bg.inputs['Strength'].default_value = .5
        scene.view_settings.exposure = -.2
    else:
        sky.sun_elevation = math.radians(38.0)
        sky.sun_rotation = math.radians(215.0)
        sky.air_density = 1.0
        setattr(sky, dust, 1.4)
        sky.sun_intensity = .28
        bg.inputs['Strength'].default_value = .22
        scene.view_settings.exposure = -.5
    nt.links.new(sky.outputs['Color'], bg.inputs['Color'])
    for o in [o for o in scene.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(o)
    sun = bpy.data.lights.new('render.sun', 'SUN')
    if look == 'golden':
        sun.energy = 3.4
        sun.color = (1.0, .72, .48)
        sun.angle = math.radians(1.2)
        rot = (math.radians(90 - 8), 0, math.radians(250 - 90))
    else:
        sun.energy = 2.6
        sun.color = (1.0, .96, .9)
        sun.angle = math.radians(2.0)
        rot = (math.radians(90 - 38), 0, math.radians(215 - 90))
    so = bpy.data.objects.new('render.sun', sun)
    so.rotation_euler = rot
    scene.collection.objects.link(so)


def camera(scene, loc, target, lens=35.0, name='render.cam'):
    cam = bpy.data.cameras.new(name)
    cam.lens = lens
    cam.clip_end = 400
    ob = bpy.data.objects.new(name, cam)
    scene.collection.objects.link(ob)
    ob.location = Vector(loc)
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    scene.camera = ob
    return ob


def H(x, y, z):
    """house-local -> Blender"""
    return (x, -z, y)


def render(scene, path, res=(1600, 1000), samples=64):
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.cycles.samples = samples
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 90
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return path
