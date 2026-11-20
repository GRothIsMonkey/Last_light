"""Blender background renderer. Optional arguments after -- are two-digit shot numbers."""
import bpy, sys, os
from pathlib import Path
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'models/protagonist/first-person-studies.blend'))
scene=bpy.context.scene
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
out=Path(os.environ.get('LL_PROOF_DIR',root/'first-person'));out.mkdir(parents=True,exist_ok=True)
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.refresh_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
except (RuntimeError,TypeError):scene.cycles.device='CPU'
if 'LL_PROOF_DIR' in os.environ:
    scene.cycles.samples=8;scene.render.resolution_percentage=52
for mark in sorted(scene.timeline_markers,key=lambda m:m.frame):
    if args and mark.name[:2] not in args:continue
    scene.frame_set(mark.frame);scene.camera=mark.camera;scene.render.filepath=str(out/(mark.name+'.png'))
    bpy.context.view_layer.update();print('SHOT',mark.name,scene.cycles.device,flush=True)
    bpy.ops.render.render(write_still=True)
