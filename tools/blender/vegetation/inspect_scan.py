"""Stage A (part 2): the Realistic Trees Collection at a usable scale, and the oak laser scan as points.

python tools/blender/vegetation/inspect_scan.py  -> docs/qa/vegetation/stageA/A1b_*.jpg, A4_*.jpg
"""
import math
import os
import sys
import bpy
from mathutils import Vector
sys.path.insert(0, os.path.dirname(__file__))
import veg_common as C  # noqa: E402

OUT = os.path.join(C.QA, 'stageA')
src = C.originals_dir()


def studio(scene, look='review'):
    C.look(scene, look)
    g = C.ground_mat('inspect.ground', (.18, .18, .17), (.24, .24, .22), scale=3, rough=.95, bump=.05)
    C.plane(scene, 'inspect.ground', -300, 300, -300, 300, 0, g)


# trees at 1/10 scale (the collection is modelled at ~10x: EZ-Tree units)
C.reset()
sc = bpy.context.scene
col, objs = C.import_glb(os.path.join(src, 'realistic_trees_collection.glb'), 'trees')
roots = [o for o in objs if o.parent is None]
for r in roots:
    r.scale = r.scale * 0.1
bpy.context.view_layer.update()
lo, hi = C.world_bbox(objs)
print('scaled bounds', lo, hi)
studio(sc)
mid = (lo + hi) / 2
C.camera(sc, (mid.x, lo.y - 46, 5.0), (mid.x, mid.y, 4.6), lens=35)
C.render(sc, os.path.join(OUT, 'A1b_trees_collection_scaled_0.1.jpg'), res=(1800, 800), samples=32)

# the oak scan: 4.6 M coloured points, drawn as 1.2 cm points
C.reset()
sc = bpy.context.scene
col, objs = C.import_glb(os.path.join(src, '200_year_old_oak_tree.glb'), 'scan')
meshes = [o for o in objs if o.type == 'MESH']
print('scan objects', len(meshes), 'points', sum(len(o.data.vertices) for o in meshes))
# join into one mesh, then geometry nodes: mesh -> points, coloured by COLOR_0
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.join()
scan = bpy.context.view_layer.objects.active
lo, hi = C.world_bbox([scan])
print('scan bounds', [round(v, 2) for v in lo], [round(v, 2) for v in hi])
attr = [a.name for a in scan.data.attributes]
print('attributes', attr)
col_name = next((a for a in attr if 'col' in a.lower()), None)
ng = bpy.data.node_groups.new('points', 'GeometryNodeTree')
ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
i = ng.nodes.new('NodeGroupInput')
o_ = ng.nodes.new('NodeGroupOutput')
m2p = ng.nodes.new('GeometryNodeMeshToPoints')
m2p.inputs['Radius'].default_value = 0.012
sm = ng.nodes.new('GeometryNodeSetMaterial')
ng.links.new(i.outputs[0], m2p.inputs['Mesh'])
ng.links.new(m2p.outputs[0], sm.inputs['Geometry'])
ng.links.new(sm.outputs[0], o_.inputs[0])
mat = bpy.data.materials.new('scan.points')
mat.use_nodes = True
nt = mat.node_tree
for n in list(nt.nodes):
    if n.type == 'BSDF_PRINCIPLED':
        nt.nodes.remove(n)
em = nt.nodes.new('ShaderNodeEmission')
at = nt.nodes.new('ShaderNodeAttribute')
at.attribute_name = col_name or 'Col'
nt.links.new(at.outputs['Color'], em.inputs['Color'])
nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
sm.inputs['Material'].default_value = mat
mod = scan.modifiers.new('points', 'NODES')
mod.node_group = ng
studio(sc)
ground_z = lo.z
cx, cy = (lo.x + hi.x) / 2, (lo.y + hi.y) / 2
H = hi.z - lo.z
for name, ang in (('A4_oak_scan_front', 0), ('A4_oak_scan_side', 90)):
    a = math.radians(ang)
    cam = (cx + math.sin(a) * 52, cy - math.cos(a) * 52, ground_z + 7)
    C.camera(sc, cam, (cx, cy, ground_z + H * .45), lens=35)
    C.render(sc, os.path.join(OUT, name + '.jpg'), res=(1400, 1000), samples=8)
C.camera(sc, (cx, cy, ground_z + 70), (cx, cy + .01, ground_z), lens=35)
C.render(sc, os.path.join(OUT, 'A4_oak_scan_top.jpg'), res=(1200, 1200), samples=8)
print('done')
