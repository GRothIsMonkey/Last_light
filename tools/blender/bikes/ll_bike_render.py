"""Last Light: shared Blender (Cycles) presentation setups for the bicycle gallery.

Every gallery image of every bike goes through these functions, so the four bikes (and the Sketchfab source and the old
procedural bikes) are always lit, framed and tone-mapped the same way. Two looks:

  * 'review'  : soft late-afternoon light (sun 32 deg up, warm-neutral) on a neutral concrete pad. Used for the
                front / rear three-quarter, side profile and detail views, where the job is to judge the model.
  * 'golden'  : the Prologue's golden hour (sun ~7 deg up, behind-left, warm), asphalt and a strip of lawn.

These are offline Blender renders (Cycles, CPU), not game captures: Blender has image-based reflections from the sky
that the game does not have yet (approval item A-47), so metal looks brighter here than in the browser.
Blender convention (BLENDER-PIPELINE.md 3): the bike faces -Y, its right (drive) side is -X, ground is Z = 0.
"""
import math
import bpy
from mathutils import Vector

VIEW_TRANSFORM = 'ACES 1.3'   # the game tone-maps with three.js ACES Filmic: judge colour through the same curve


def _node(nt, kind, loc=(0, 0), **inputs):
    n = nt.nodes.new(kind)
    n.location = loc
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def ground_material(kind='concrete'):
    name = 'render.ground.' + kind
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    tex = _node(nt, 'ShaderNodeTexCoord', (-900, 0))
    noise = _node(nt, 'ShaderNodeTexNoise', (-700, 0))
    noise.inputs['Scale'].default_value = 38.0 if kind == 'asphalt' else 6.0
    noise.inputs['Detail'].default_value = 12.0
    nt.links.new(tex.outputs['Object'], noise.inputs['Vector'])
    ramp = _node(nt, 'ShaderNodeValToRGB', (-450, 0))
    if kind == 'asphalt':
        ramp.color_ramp.elements[0].color = (0.055, 0.052, 0.050, 1)
        ramp.color_ramp.elements[1].color = (0.15, 0.145, 0.14, 1)
    elif kind == 'grass':
        ramp.color_ramp.elements[0].color = (0.05, 0.085, 0.025, 1)
        ramp.color_ramp.elements[1].color = (0.16, 0.2, 0.06, 1)
    else:
        ramp.color_ramp.elements[0].color = (0.28, 0.27, 0.255, 1)
        ramp.color_ramp.elements[1].color = (0.42, 0.405, 0.385, 1)
    nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.92 if kind != 'grass' else 0.8
    bump = _node(nt, 'ShaderNodeBump', (-200, -300))
    bump.inputs['Strength'].default_value = 0.25 if kind == 'asphalt' else 0.12
    nt.links.new(noise.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def _plane(scene, name, size, loc, mat):
    me = bpy.data.meshes.new(name)
    sx, sy = size[0] / 2, size[1] / 2
    me.from_pydata([(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [], [(0, 1, 2, 3)])
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    scene.collection.objects.link(ob)
    return ob


def setup_scene(scene, look='review', res=(1600, 1000), samples=96):
    """Configure render settings, world (Nishita sky) and the ground set in `scene` (a REF/render scene)."""
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.cycles.glossy_bounces = 4
    scene.cycles.transparent_max_bounces = 4
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    try:
        scene.view_settings.view_transform = VIEW_TRANSFORM
        scene.view_settings.look = 'None'
    except TypeError:
        scene.view_settings.view_transform = 'AgX'
    scene.view_settings.exposure = -0.35 if look == 'golden' else -0.55
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 90

    world = bpy.data.worlds.new('render.world.' + look)
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes['Background']
    sky = _node(nt, 'ShaderNodeTexSky', (-300, 0))
    for kind in ('MULTIPLE_SCATTERING', 'NISHITA'):  # Blender 5 renamed Nishita; 4.x calls it NISHITA
        try:
            sky.sky_type = kind
            break
        except TypeError:
            continue
    dust = 'aerosol_density' if hasattr(sky, 'aerosol_density') else 'dust_density'
    if look == 'golden':
        sky.sun_elevation = math.radians(7.0)
        sky.sun_rotation = math.radians(305.0)
        sky.air_density = 1.6
        setattr(sky, dust, 3.5)
        sky.sun_intensity = 0.55
        bg.inputs['Strength'].default_value = 0.42
    else:
        sky.sun_elevation = math.radians(32.0)
        sky.sun_rotation = math.radians(220.0)
        sky.air_density = 1.0
        setattr(sky, dust, 1.6)
        sky.sun_intensity = 0.25
        bg.inputs['Strength'].default_value = 0.2
    nt.links.new(sky.outputs['Color'], bg.inputs['Color'])

    # the ground set (render-only; never exported: it lives in the render scene)
    if look == 'golden':
        _plane(scene, 'render.asphalt', (24, 400), (3.5, 0, 0), ground_material('asphalt'))
        _plane(scene, 'render.lawn', (400, 400), (-206.0, 0, 0.004), ground_material('grass'))
        sun = bpy.data.lights.new('render.sun', 'SUN')
        sun.energy = 3.4
        sun.color = (1.0, 0.72, 0.46)
        sun.angle = math.radians(1.2)
        so = bpy.data.objects.new('render.sun', sun)
        scene.collection.objects.link(so)
        so.rotation_euler = (math.radians(83.0), 0, math.radians(305.0 - 90.0))
    else:
        _plane(scene, 'render.pad', (600, 600), (0, 0, 0), ground_material('concrete'))
        sun = bpy.data.lights.new('render.sun', 'SUN')
        sun.energy = 1.6
        sun.color = (1.0, 0.9, 0.78)
        sun.angle = math.radians(3.0)
        so = bpy.data.objects.new('render.sun', sun)
        scene.collection.objects.link(so)
        so.rotation_euler = (math.radians(58.0), 0, math.radians(220.0 - 90.0))
        fill = bpy.data.lights.new('render.fill', 'AREA')
        fill.energy = 150
        fill.size = 3.0
        fill.color = (0.82, 0.88, 1.0)
        fo = bpy.data.objects.new('render.fill', fill)
        scene.collection.objects.link(fo)
        fo.location = (-2.6, -2.0, 2.4)
        look_at(fo, Vector((0, 0, 0.5)))
    return scene


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def camera(scene, name, loc, target, lens=50.0, sensor=36.0):
    cam = bpy.data.cameras.new(name)
    cam.lens = lens
    cam.sensor_width = sensor
    cam.clip_start = 0.02
    cam.clip_end = 900
    ob = bpy.data.objects.new(name, cam)
    scene.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, Vector(target))
    return ob


def render(scene, cam_ob, path):
    scene.camera = cam_ob
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True, scene=scene.name)
    return path


# Standard framings for one bike standing at the origin (wheelbase ~1 m, height ~1.1 m).
VIEWS = {
    'front34': dict(loc=(-1.95, -2.35, 1.05), target=(0, -0.05, 0.52), lens=50),
    'rear34': dict(loc=(1.9, 2.45, 1.12), target=(0, 0.05, 0.5), lens=50),
    'side': dict(loc=(-3.6, 0.0, 0.58), target=(0, 0.0, 0.55), lens=55),
    # close views (Blender frame: the bike's right/drive side is -X, front -Y)
    'cockpit': dict(loc=(-0.62, -0.95, 1.34), target=(0, -0.38, 0.95), lens=40),
    'drive': dict(loc=(-0.72, -0.25, 0.48), target=(-0.03, 0.14, 0.3), lens=42),
    'rearbrake': dict(loc=(-0.5, 0.95, 0.85), target=(0, 0.3, 0.5), lens=42),
    'firstperson': dict(loc=(0, 0.02, 1.36), target=(0, -0.55, 0.75), lens=24),
}
