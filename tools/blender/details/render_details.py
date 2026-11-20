"""Blender inspection renders of the neighborhood-details kit (Cycles, CPU). NOT game captures: they show the models
themselves (the game-renderer captures are made by tests/details-browser.mjs).

    python3 tools/blender/details/render_details.py <outDir>

Writes blender-details-signs.png, blender-details-yard.png (chairs, grill, hose, toys, kiddie pool) and
blender-details-backyard.png (swing set, trampoline, sheds, clothesline, fences).
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'streetprops'))
import render_inspection as R       # noqa: E402  (the street-props inspection set-up: light, ground, camera, paint rule)
ROOT = R.ROOT
TEX = os.path.join(ROOT, 'assets', 'source', 'details', 'textures')
OUT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else os.path.join(ROOT, 'docs', 'qa', 'details', 'blender')
os.makedirs(OUT, exist_ok=True)


def mats():
    A = R.atlas_material('A', os.path.join(TEX, 'details_albedo.jpg'), os.path.join(TEX, 'details_orm.png'), R.srgb(0x8d9985))
    C = bpy.data.materials.new('cut')
    C.use_nodes = True
    tc = C.node_tree.nodes.new('ShaderNodeTexImage')
    tc.image = bpy.data.images.load(os.path.join(TEX, 'details_cutout.png'))
    C.node_tree.links.new(tc.outputs['Color'], C.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    C.node_tree.links.new(tc.outputs['Alpha'], C.node_tree.nodes['Principled BSDF'].inputs['Alpha'])
    Sg = bpy.data.materials.new('sign')
    Sg.use_nodes = True
    ts = Sg.node_tree.nodes.new('ShaderNodeTexImage')
    ts.image = bpy.data.images.load(os.path.join(TEX, 'details_signs.jpg'))
    Sg.node_tree.links.new(ts.outputs['Color'], Sg.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    Sg.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .4
    Wt = bpy.data.materials.new('water')
    Wt.use_nodes = True
    b = Wt.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (.2, .45, .55, 1)
    b.inputs['Roughness'].default_value = .05
    b.inputs['Alpha'].default_value = .55
    return {'dt_A': A, 'dt_cut': C, 'dt_sign': Sg, 'dt_water': Wt}


def scene(show, cam_from, cam_at, name, res=(1600, 900)):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc, co = R.setup(res)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'dist', 'assets', 'details', 'details.kit.glb'))
    M = mats()
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH' or o.name == 'Plane':
            continue
        if o.name not in show:
            o.hide_render = True
            continue
        v = tuple(show[o.name])
        dx, dz, rot, dy, sc_ = v + (0, 0, 0, 0, 1)[len(v):]
        o.location.x += dx
        o.location.y += dz
        o.location.z += dy
        o.rotation_euler.z += rot
        o.scale = (o.scale[0] * sc_, o.scale[1] * sc_, o.scale[2] * sc_)
        for k, slot in enumerate(o.material_slots):
            n = slot.material.name if slot.material else ''
            o.material_slots[k].material = M.get(n.split('.')[0], M['dt_A'])
    R.look(co, cam_from, cam_at)
    sc.render.filepath = os.path.join(OUT, name)
    bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    # a junction assembly as the game builds it (post, bracket, Oak Hollow's blade along z, the cross street's along x, STOP),
    # and the three single-post signs (their posts as well)
    J = {'sign.post.lod0': (0, 0), 'sign.anchor.lod0': (0, 0), 'sign.bracket.lod0': (0, 0), 'sign.stop.lod0': (0, 0, 0, 2.1),
         'sign.blade.OAK_HOLLOW_DR.lod0': (0, 0, math.pi / 2, 2.72), 'sign.blade.SUMMERFIELD_RD.lod0': (0, 0, 0, 2.98),
         'sign.speed.lod0': (2.4, 0, 0, 2.0), 'sign.children.lod0': (-2.4, 0, 0, 2.1), 'sign.outlet.lod0': (4.6, 0, 0, 2.0)}
    scene(J, (1.6, -5.8, 2.1), (1.2, 0, 2.15), 'blender-details-signs.png')
    scene({'chair.lawn.lod0': (-2.2, 0), 'chair.resin.lod0': (-1.4, 0), 'grill.lod0': (-.4, .3), 'hose.coil.lod0': (.5, -.6), 'hose.bib.lod0': (.5, .6),
           'toy.bigwheel.lod0': (1.3, -.2), 'toy.wagon.lod0': (2.3, 0), 'toy.scooter.lod0': (3.1, 0), 'toy.kidbike.lod0': (-.2, -1.5),
           'toy.basketball.lod0': (1.0, -1.3, 0, .12, .12), 'toy.playball.lod0': (1.4, -1.4, 0, .11, .11), 'pool.kiddie.lod0': (4.6, -.3), 'pool.water.lod0': (4.6, -.3),
           'sprinkler.base.lod0': (3.0, -1.4), 'sprinkler.head.lod0': (3.0, -1.4)},
          (1.2, -5.2, 2.0), (1.2, 0, .3), 'blender-details-yard.png')
    scene({'toy.bigwheel.lod0': (-.9, 0, .5), 'toy.wagon.lod0': (.4, .2, .3), 'toy.scooter.lod0': (1.5, .1, .4), 'toy.kidbike.lod0': (2.5, -.3),
           'chair.lawn.lod0': (-2.2, .8, .4), 'chair.resin.lod0': (-1.5, 1.1, -.3)},
          (0.2, -2.9, 1.25), (0.2, .3, .3), 'blender-details-toys.png')
    scene({'swing.lod0': (-4.5, 0), 'trampoline.lod0': (1.2, 0), 'trampoline.net.lod0': (1.2, 0), 'shed.lod0': (6.0, 0), 'shed.small.lod0': (9.4, 0),
           'clothesline.lod0': (1.2, 4.5), 'fence.chain.lod0': (-8.5, -2), 'post.chain.lod0': (-9.0, -2), 'ff.post.lod0': (-6.5, -3), 'ff.rail.lod0': (-6.5, -3)},
          (0.5, -17.5, 6.0), (0.5, 2, 1.0), 'blender-details-backyard.png')
    print('renders in', OUT)
