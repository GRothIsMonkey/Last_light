"""Render both comparison photographs from the packed four-character studio."""
from pathlib import Path
from math import radians
import bpy
from mathutils import Vector
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'comparison/four-friends.blend'))
scene=bpy.context.scene
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.refresh_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
except (RuntimeError,TypeError):scene.cycles.device='CPU'
def render(name):
    scene.render.filepath=str(root/'comparison'/(name+'.png'));bpy.ops.render.render(write_still=True)
render('01-four-friends')
for name,x in zip(('Jamie','Sam','Alex','Player'),(-.366,-.122,.122,.366)):
    anchor=bpy.data.objects[name+' • translation only'];anchor.location.x=x;anchor.rotation_euler.z=radians(-10)
camera=scene.camera;camera.data.ortho_scale=1.055;camera.location=(0,-4.5,1.41)
camera.rotation_euler=(Vector((0,0,1.392))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.resolution_x=1900;scene.render.resolution_y=680
render('02-four-faces')
