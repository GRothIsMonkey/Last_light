"""Bake the runtime solver's absolute, person-space joints into editable local Blender actions."""
from pathlib import Path
import json,sys,numpy as np,bpy
from mathutils import Matrix
model,samples=sys.argv[sys.argv.index('--')+1:]
file=Path(model).resolve();data=json.loads(Path(samples).read_text());bpy.ops.wm.open_mainfile(filepath=str(file));bpy.context.preferences.filepaths.save_version=0
sc=bpy.context.scene;sc.render.fps=data['fps'];rig=bpy.data.objects['FriendRig'];rig.animation_data_create()
joints=data['bones'];rest=np.array([np.array(rig.data.bones[n].matrix_local) for n in joints]);parents=[joints.index(rig.data.bones[n].parent.name) if rig.data.bones[n].parent else -1 for n in joints]
C=np.array([[-1,0,0],[0,0,1],[0,1,0]]);invrest=np.linalg.inv(rest)
for name,clip in data['clips'].items():
 act=bpy.data.actions.new(name);act.use_fake_user=True;rig.animation_data.action=act;last={}
 for frame,raw in enumerate(clip['rows'],1):
    a=np.asarray(raw).reshape(-1,7);x,y,z,w=a[:,3:].T
    m=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]).transpose(2,0,1)
    worlds=rest.copy();worlds[:,:3,3]=a[:,:3]@C.T;worlds[:,:3,:3]=(C@m@C.T)@rest[:,:3,:3]
    local=invrest@rest[parents]@np.linalg.inv(worlds[parents])@worlds
    for i,n in enumerate(joints):
        if parents[i]<0:local[i]=invrest[i]@worlds[i]
        mat=Matrix(local[i]);q=mat.to_quaternion();b=rig.pose.bones[n];b.rotation_mode='QUATERNION'
        if n in last:q.make_compatible(last[n])
        last[n]=q.copy();b.location=mat.translation;b.rotation_quaternion=q
        b.keyframe_insert(data_path='location',frame=frame,group=n);b.keyframe_insert(data_path='rotation_quaternion',frame=frame,group=n)
rig.animation_data.action=bpy.data.actions['Idle'];sc.frame_end=49;sc.frame_set(1);sc['actions']=', '.join(data['clips']);sc['bike_fit']=json.dumps(data['geometry'])
rig['friend_profile']=(file.parent/'profile.json').read_text()
bpy.ops.wm.save_as_mainfile(filepath=str(file),compress=True)
