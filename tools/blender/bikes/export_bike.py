"""Re-export a bike's runtime GLB from its saved .blend (no rebuild): python tools/blender/bikes/export_bike.py -- --bike bike.jamie"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
import bpy
import ll_export
a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
bike = a[a.index('--bike') + 1] if '--bike' in a else 'bike.jamie'
key = bike.split('.')[1]
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT, 'assets', 'source', 'bike', key, bike + '.blend'))
assert bpy.context.scene.name == 'EXPORT', bpy.context.scene.name
# n-gons (caps, plates) defeat Blender's MikkTSpace tangents: triangulate them (UVs, part ids, materials kept)
import bmesh
for ob in bpy.context.scene.objects:
    if ob.type != 'MESH':
        continue
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    ng = [f for f in bm.faces if len(f.verts) > 4]
    if ng:
        bmesh.ops.triangulate(bm, faces=ng, quad_method='BEAUTY', ngon_method='BEAUTY')
        bm.to_mesh(ob.data)
    bm.free()
sys.path.insert(0, HERE)
from build_bike import strip_reference
print('export_bike: dropped', strip_reference(), 'reference objects')
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_mainfile(compress=True, relative_remap=True)
harvested = 'CC BY' in bpy.data.objects[bike].get('ll_license', '')
ll_export.export_glb(os.path.join(ROOT, 'dist', 'assets', 'bike', bike + '.glb'),
                     export_copyright='Roth Studios — Last Light' + (' (incorporates CC BY 4.0 geometry by Mitchell)' if harvested else ''))
