"""Render the fitted rigs from one orthographic camera. Arguments are player, three friends and output PNG."""
import bpy,sys
from pathlib import Path
from mathutils import Vector
paths=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for i,p in enumerate(paths[:-1]):
    with bpy.data.libraries.load(str(Path(p).resolve()),link=False) as (lib,dst):
        dst.objects=['PlayerRig' if i==0 else 'FriendRig']
        dst.actions=['Idle'];dst.collections=[n for n in lib.collections if n[:2] in ['01','02','03','04','05']]
    for c in dst.collections:sc.collection.children.link(c)
    r=dst.objects[0];sc.collection.objects.link(r);r.animation_data.action=dst.actions[0]
    e=bpy.data.objects.new('Lineup placement',None);sc.collection.objects.link(e);e.location.x=(i-1.5)*.55;r.parent=e
sc.frame_set(1)
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;m=bpy.data.materials.new('Studio floor');m.diffuse_color=(.20,.22,.20,1);floor.data.materials.append(m)
world=bpy.data.worlds.new('Soft daylight');sc.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.54,.59,.65,1);world.node_tree.nodes['Background'].inputs[1].default_value=.65
for pos,power,size,color in [((-2,-3,4),420,3.1,(1,.90,.78)),((3,-1,2.5),220,2.5,(.79,.89,1)),((1,2,3.4),340,2.9,(1,.86,.73))]:
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;aim(o,(0,0,.95))
bpy.ops.object.camera_add(location=(0,-4,.91));c=bpy.context.object;aim(c,(0,0,.76));c.data.type='ORTHO';c.data.ortho_scale=2.45;sc.camera=c
sc.render.engine='CYCLES';sc.cycles.samples=28;sc.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.refresh_devices()
    for d in prefs.devices:d.use=d.type=='OPTIX'
    if any(d.use for d in prefs.devices):sc.cycles.device='GPU'
except RuntimeError:pass
sc.render.resolution_x=1400;sc.render.resolution_y=980;sc.render.resolution_percentage=100
sc.render.filepath=str(Path(paths[-1]).resolve());bpy.ops.render.render(write_still=True)
