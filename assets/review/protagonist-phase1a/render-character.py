import bpy,sys
from pathlib import Path
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'models/protagonist/chr.protagonist.a12.blend'))
sc=bpy.context.scene
argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
preview='preview' in argv
scene_objs=sorted((o for o in sc.objects if o.type=='CAMERA'),key=lambda o:o.name)
views=[o for o in scene_objs if not argv or 'all' in argv or o.name[:2] in argv]
out=(root/'previews' if preview else root/'renders');out.mkdir(parents=True,exist_ok=True)
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.refresh_devices()
    for d in prefs.devices:d.use=(d.type=='OPTIX')
    sc.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
except Exception:sc.cycles.device='CPU'
sc.cycles.samples=12 if preview else 60
sc.cycles.use_denoising=True
if preview:sc.render.resolution_percentage=52
for cam in views:
    golden=cam.name.startswith('08');sc.camera=cam
    for col,hide in [('Studio • neutral',golden),('Location • August evening',not golden)]:
        bpy.data.collections[col].hide_viewport=hide;bpy.data.collections[col].hide_render=hide
    sc.world.node_tree.nodes['Background'].inputs[1].default_value=.40 if golden else .24
    sk=bpy.data.objects['chr.protagonist.a12:body'].data.shape_keys.key_blocks['Review • quiet acknowledgement'];sk.value=cam['smile']
    sc.render.filepath=str(out/(cam.name+'.png'))
    bpy.context.view_layer.update()
    print('Rendering',cam.name,sc.cycles.device,flush=True)
    bpy.ops.render.render(write_still=True)
    print('WROTE',sc.render.filepath,flush=True)

