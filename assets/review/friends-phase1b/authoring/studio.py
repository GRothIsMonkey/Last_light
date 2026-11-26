"""Add the original authored bicycle to the master and render the ten approval views."""
from pathlib import Path
import sys,json,math,bpy
from mathutils import Vector,Matrix
folder,bikefile,samples=sys.argv[sys.argv.index('--')+1:];folder=Path(folder).resolve();key=folder.name;file=folder/(key+'-rig.blend')
data=json.loads(Path(samples).read_text());g=data['geometry'];C=Matrix(((-1,0,0),(0,0,1),(0,1,0)));cv=lambda v:C@Vector(v)
bpy.ops.wm.open_mainfile(filepath=str(file));sc=bpy.context.scene;rig=bpy.data.objects['FriendRig'];bpy.context.preferences.filepaths.save_version=0
review=folder/'renders';review.mkdir(exist_ok=True)
if 'Bicycle • '+key not in bpy.data.collections:
 old=set(sc.objects);bpy.ops.import_scene.gltf(filepath=str(Path(bikefile).resolve()));objects=set(sc.objects)-old
 bike=bpy.data.collections.new('Bicycle • '+key);sc.collection.children.link(bike)
 keep=[o for o in objects if o.type=='MESH' and o.get('ll_lod',-1)==0]
 assert len(keep)>=7,[o.name for o in objects]
 for o in keep:
    M=o.matrix_world.copy();o.parent=None;o.matrix_world=M
    for coll in list(o.users_collection):coll.objects.unlink(o)
    bike.objects.link(o)
 for o in objects-set(keep):bpy.data.objects.remove(o,do_unlink=True)
 def ctrl(n,at):
    o=bpy.data.objects.new(n,None);bike.objects.link(o);o.location=at;o.empty_display_size=.04;bpy.context.view_layer.update();return o
 def parent(o,ctl):
    M=o.matrix_world.copy();o.parent=ctl;o.matrix_world=M
 def drv(o,prop,idx,expression,propname):
    curve=o.driver_add(prop,idx) if idx is not None else o.driver_add(prop)
    dr=curve.driver;var=dr.variables.new();var.name='v';var.type='SINGLE_PROP';var.targets[0].id=rig;var.targets[0].data_path='["'+propname+'"]';dr.expression=expression
 for n in ['crank_angle','steering_angle','bike_visible']:rig[n]=0.
 display=ctrl('Bicycle display',Vector((0,0,0)))
 bb=cv(g['bb']);pivot=cv(g['pivot']);crank=ctrl('Crank pivot',bb);steer=ctrl('Steering pivot',pivot)
 steer.rotation_mode='AXIS_ANGLE';steer.rotation_axis_angle=(0,0,math.sin(g['rake']),math.cos(g['rake']))
 drv(steer,'rotation_axis_angle',0,'v','steering_angle');drv(crank,'rotation_euler',0,'v','crank_angle')
 for o in keep:
    role=o['ll_node'];ctl=None
    if role in ('steer','wheel_front','bell_lever'):ctl=steer
    if role=='crank':ctl=crank
    if role.startswith('pedal_'):
        s=-1 if role.endswith('_l') else 1;phase=math.pi if s<0 else 0;at=bb+Vector((-s*g['pedalX'],0,g['crank']*math.cos(phase)))
        ctl=ctrl(role+' tread centre',at);parent(o,ctl)
        drv(ctl,'location',1,f'{bb.y}-{g["crank"]}*sin(v+{phase})','crank_angle');drv(ctl,'location',2,f'{bb.z}+{g["crank"]}*cos(v+{phase})','crank_angle');ctl=None
    if role.startswith('wheel_'):
        corners=[o.matrix_world@Vector(x) for x in o.bound_box];center=sum(corners,Vector())/8
        wheel=ctrl(role+' axle',center)
        if ctl:parent(wheel,ctl)
        ctl=wheel;drv(wheel,'rotation_euler',0,'2.31*v','crank_angle')
    if ctl:parent(o,ctl)
 for o in list(bike.objects):
    if o!=display and o.parent is None:parent(o,display)
 for i in range(3):drv(display,'scale',i,'max(0.000001,v)','bike_visible')
 for name,clip in data['clips'].items():
    rig.animation_data.action=bpy.data.actions[name]
    for i,meta in enumerate(clip['meta'],1):
       for prop,value in [('crank_angle',meta[0]),('steering_angle',meta[1]),('bike_visible',float(name in ['Cycle','Steer','StandPedal','Brake','Dismount','RideWave','HandleBike']))]:
          rig[prop]=value;rig.keyframe_insert(data_path='["'+prop+'"]',frame=i,group='Bicycle contacts')
def camera(name,position,target,lens):
 cam=bpy.data.cameras.new(name);obj=bpy.data.objects.new(name,cam);sc.collection.objects.link(obj);obj.location=position;obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens;cam.clip_start=.01;return obj
def pose(name,frame):
 rig.animation_data.action=bpy.data.actions[name];sc.frame_set(frame);bpy.context.view_layer.update()
def at(n):return rig.matrix_world@rig.pose.bones[n].head
def shot(n,action,f,mode):
 pose(action,f)
 if mode=='portrait':
    ctr=(at('eye_l')+at('eye_r'))/2;ctr.z-=.021;delta=Vector((.065,-.91,.02)) if action=='Smile' else Vector((0,-.91,.018));cam=camera(n,ctr+delta,ctr,82)
 elif mode=='grip':
    ctr=at('socket_grip_r');cam=camera(n,ctr+Vector((-.34,-.35,.24)),ctr,67)
 elif mode=='pedal':
    ctr=at('foot_l')+Vector((0,-.033,-.04));cam=camera(n,ctr+Vector((.54,-.17,.14)),ctr,53)
 else:
    target=Vector((0,0,.79));dirs={'front':(.025,-3.95,.86),'side':(-3.9,0,.89),'three':(-2.05,-3.35,1.02),'rest':(1.85,-3.25,1.04),'wave':(-1.50,-3.40,1.1),'ride':(-2.88,-1.35,1.06)}
    cam=camera(n,dirs[mode],target,48 if mode=='ride' else 53)
 return cam
rig.animation_data.action=bpy.data.actions['Cycle'];sc.frame_start=1;sc.frame_end=33;sc.frame_set(1);sc['review']='Select FriendRig and an action in the Action Editor. The bike follows the crank and steering channels in riding actions.'
sc.camera=camera(key+' bicycle review',(-2.70,-2.0,1.05),(0,0,.77),45)
sc.render.engine='CYCLES'
for c in bpy.data.collections:
 if c.name.startswith('Location'):c.hide_render=True;c.hide_viewport=True
 if c.name.startswith('Studio'):c.hide_render=False;c.hide_viewport=False
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(file),compress=True)
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
 prefs.compute_device_type='OPTIX';prefs.refresh_devices()
 for d in prefs.devices:d.use=d.type=='OPTIX'
 if any(d.use for d in prefs.devices):sc.cycles.device='GPU'
except (TypeError,RuntimeError):pass
sc.cycles.samples=20;sc.cycles.use_denoising=True;sc.render.resolution_percentage=100
shots=[('01-front','Idle',1,'front'),('02-side','Idle',1,'side'),('03-three-quarter','Idle',1,'three'),('04-face','Idle',1,'portrait'),('05-smile','Smile',21,'portrait'),('06-ride','Cycle',12,'ride'),('07-grip','Steer',9,'grip'),('08-pedal','Cycle',12,'pedal'),('09-standing','Idle',22,'rest'),('10-goodbye','Wave',23,'wave')]
for n,ac,f,mode in shots:
 sc.camera=shot(n,ac,f,mode);sc.render.resolution_x=760;sc.render.resolution_y=610 if mode in ['grip','pedal','ride'] else 850
 sc.render.filepath=str(review/(n+'.png'));bpy.ops.render.render(write_still=True)
