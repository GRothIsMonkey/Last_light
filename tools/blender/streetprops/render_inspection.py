"""Blender inspection renders of the street-props assets (Cycles, CPU). NOT game captures: for looking at the models
themselves (the game-renderer captures are made by tests/streetprops-browser.mjs).

    python3 tools/blender/streetprops/render_inspection.py <outDir>

Writes blender-vehicles-lineup.png (the six cars, LOD0, each in one of its period paints), blender-props-kit.png
(pole with transformer, cobra-head lamp, the four mailboxes, hydrant, cart, can, hoops, fence bays and a gate) and
blender-mailboxes.png (the four mailboxes close).
"""
import bpy, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
TEX = os.path.join(ROOT, 'assets', 'source', 'street', 'textures')
OUT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else os.path.join(ROOT, 'docs', 'qa', 'streetprops', 'blender')
os.makedirs(OUT, exist_ok=True)


def srgb(h):
    c = [((h >> s) & 255) / 255 for s in (16, 8, 0)]
    return [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]


def atlas_material(name, albedo, orm, paint=None, glass=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    if glass:
        b.inputs['Base Color'].default_value = (.02, .025, .028, 1)
        b.inputs['Roughness'].default_value = .05
        b.inputs['Alpha'].default_value = .6
        return m
    ta = nt.nodes.new('ShaderNodeTexImage')
    ta.image = bpy.data.images.load(albedo, check_existing=True)
    to = nt.nodes.new('ShaderNodeTexImage')
    to.image = bpy.data.images.load(orm, check_existing=True)
    to.image.colorspace_settings.name = 'Non-Color'
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(to.outputs['Color'], sep.inputs['Color'])
    nt.links.new(sep.outputs['Green'], b.inputs['Roughness'])
    nt.links.new(sep.outputs['Blue'], b.inputs['Metallic'])
    if paint is not None:     # the game's paint rule: mix(albedo, paint * albedo * 2, mask)
        mul = nt.nodes.new('ShaderNodeMix')
        mul.data_type = 'RGBA'
        mul.blend_type = 'MULTIPLY'
        mul.inputs['Factor'].default_value = 1
        nt.links.new(ta.outputs['Color'], mul.inputs['A'])
        mul.inputs['B'].default_value = (*[min(1, 2 * x) for x in paint], 1)
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        nt.links.new(sep.outputs['Red'], mix.inputs['Factor'])
        nt.links.new(ta.outputs['Color'], mix.inputs['A'])
        nt.links.new(mul.outputs['Result'], mix.inputs['B'])
        nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    else:
        nt.links.new(ta.outputs['Color'], b.inputs['Base Color'])
    return m


def setup(res=(1600, 900)):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 48
    sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.view_settings.view_transform = 'AgX'
    w = bpy.data.worlds.new('w')
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (.62, .58, .55, 1)
    w.node_tree.nodes['Background'].inputs[1].default_value = .8
    sun = bpy.data.lights.new('sun', 'SUN')
    sun.energy = 3.2
    sun.color = (1, .86, .7)
    so = bpy.data.objects.new('sun', sun)
    sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(62), 0, math.radians(-38))
    bpy.ops.mesh.primitive_plane_add(size=200)
    g = bpy.context.object
    gm = bpy.data.materials.new('ground')
    gm.use_nodes = True
    gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.32, .31, .29, 1)
    gm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .9
    g.data.materials.append(gm)
    cam = bpy.data.cameras.new('c')
    cam.lens = 40
    co = bpy.data.objects.new('c', cam)
    sc.collection.objects.link(co)
    sc.camera = co
    return sc, co


def look(co, frm, at):
    co.location = Vector(frm)
    co.rotation_euler = (Vector(at) - co.location).to_track_quat('-Z', 'Y').to_euler()


def vehicles():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc, co = setup()
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'dist', 'assets', 'street', 'street.vehicles.glb'))
    paints = {'sedan': 0x9a9d9e, 'hatchback': 0x6a3732, 'wagon': 0x66737d, 'minivan': 0xb3a689, 'suv': 0x222d42, 'pickup': 0x2b3a2e}
    order = ['hatchback', 'sedan', 'wagon', 'minivan', 'suv', 'pickup']
    keep = []
    for i, t in enumerate(order):
        A = atlas_material('A_' + t, os.path.join(TEX, 'veh_a_albedo.jpg'), os.path.join(TEX, 'veh_a_orm.png'), srgb(paints[t]))
        B = atlas_material('B_' + t, os.path.join(TEX, 'veh_b_albedo.jpg'), os.path.join(TEX, 'veh_b_orm.png'), srgb(paints[t]))
        G = atlas_material('G_' + t, None, None, glass=True)
        for o in bpy.context.scene.objects:
            if o.type == 'MESH' and o.name in (f'veh.{t}.lod0', f'veh.{t}.lod0.glass'):
                o.location.x += (i - 2.5) * 2.7
                for k, slot in enumerate(o.material_slots):
                    n = slot.material.name if slot.material else ''
                    o.material_slots[k].material = A if n.startswith('veh_A') else G if n.startswith('veh_glass') else B
                keep.append(o)
    for o in list(bpy.context.scene.objects):
        if o.type == 'MESH' and o not in keep and o.name != 'Plane':
            o.hide_render = True
    look(co, (-9.5, -13.5, 3.2), (0, 0, .7))
    sc.render.filepath = os.path.join(OUT, 'blender-vehicles-lineup.png')
    bpy.ops.render.render(write_still=True)


def props():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc, co = setup()
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'dist', 'assets', 'street', 'street.props.glb'))
    P = atlas_material('P', os.path.join(TEX, 'props_albedo.jpg'), os.path.join(TEX, 'props_orm.png'), srgb(0x262729))
    C = bpy.data.materials.new('cut')
    C.use_nodes = True
    tc = C.node_tree.nodes.new('ShaderNodeTexImage')
    tc.image = bpy.data.images.load(os.path.join(TEX, 'props_cutout.png'))
    C.node_tree.links.new(tc.outputs['Color'], C.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    C.node_tree.links.new(tc.outputs['Alpha'], C.node_tree.nodes['Principled BSDF'].inputs['Alpha'])
    show = {'pole.shaft.lod0': (0, 0), 'pole.arm.lod0': (0, 0), 'pole.xfmr.lod0': (0, 0), 'pole.rack.lod0': (0, 0),
            'lamp.lod0': (-4.5, 1.5), 'lamp.lens.lod0': (-4.5, 1.5),
            'mailbox.white.lod0': (2.4, -2.5), 'mailbox.wood.lod0': (3.2, -2.5), 'mailbox.deco.lod0': (4.0, -2.5), 'mailbox.brick.lod0': (5.0, -2.5),
            'hydrant.lod0': (1.6, -3.2), 'cart.lod0': (6.2, -2.4), 'can.lod0': (7.0, -2.6), 'hoop.portable.lod0': (8.6, 0),
            'fence.privacy.lod0': (2.2, 2.0), 'fence.gate.lod0': (4.6, 2.0), 'fence.picket.lod0': (7.0, 2.0)}
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH' or o.name == 'Plane':
            continue
        if o.name not in show:
            o.hide_render = True
            continue
        dx, dz = show[o.name]
        if o.name.startswith('fence.'):
            o.scale.x = 2.4
        o.location.x += dx
        o.location.y += dz
        for k, slot in enumerate(o.material_slots):
            n = slot.material.name if slot.material else ''
            o.material_slots[k].material = C if n.startswith('props_cut') else P
    look(co, (3.6, -17.5, 6.2), (3.2, 0, 3.6))
    sc.render.filepath = os.path.join(OUT, 'blender-props-kit.png')
    bpy.ops.render.render(write_still=True)


def mailboxes():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc, co = setup((1400, 800))
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'dist', 'assets', 'street', 'street.props.glb'))
    P = atlas_material('P', os.path.join(TEX, 'props_albedo.jpg'), os.path.join(TEX, 'props_orm.png'), srgb(0x5a2622))
    show = {'mailbox.white.lod0': -1.5, 'mailbox.wood.lod0': -.5, 'mailbox.deco.lod0': .5, 'mailbox.brick.lod0': 1.6}
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH' or o.name == 'Plane':
            continue
        if o.name not in show:
            o.hide_render = True
            continue
        o.location.x += show[o.name]
        for k, slot in enumerate(o.material_slots):
            o.material_slots[k].material = P
    look(co, (0.6, -5.2, 1.5), (0.2, 0, .8))
    sc.render.filepath = os.path.join(OUT, 'blender-mailboxes.png')
    bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    vehicles()
    props()
    mailboxes()
    print('renders in', OUT)
