"""Fit the player skeleton to corresponding Phase 1A surface vertices. Run with Blender --python fit.py -- PLAYER.blend FRIEND.blend KEY OUTPUT."""
import bpy,sys,json,hashlib
from pathlib import Path
import numpy as np
from mathutils import Vector
from mathutils.kdtree import KDTree
player,src,key,out=sys.argv[sys.argv.index('--')+1:]
out=Path(out).resolve();out.mkdir(parents=True,exist_ok=True)
def pts(seq,prop='co'):
    a=np.empty((len(seq),3),'f');seq.foreach_get(prop,a.ravel());return a.astype(float)
def world(o):
    m=np.array(o.matrix_world);return pts(o.data.vertices)@m[:3,:3].T+m[:3,3]
def tree(v):
    t=KDTree(len(v))
    for i,p in enumerate(v):t.insert(p,i)
    t.balance();return t
def record(o,names):
    table={g.index:names.index(g.name) for g in o.vertex_groups if g.name in names}
    w=np.zeros((len(o.data.vertices),len(names)),np.float32)
    for i,v in enumerate(o.data.vertices):
        for g in v.groups:
            if g.group in table:w[i,table[g.group]]=g.weight
    return w
bpy.ops.wm.open_mainfile(filepath=str(Path(player).resolve()))
rig=bpy.data.objects['PlayerRig'];body=bpy.data.objects['chr.protagonist.a12:body']
base=world(body);near=tree(base);names=[b.name for b in rig.data.bones];bw=record(body,names)
skeleton={b.name:(np.array(b.head_local),np.array(b.tail_local),np.array(b.matrix_local)[:3,2],b.parent.name if b.parent else None) for b in rig.data.bones}
ref={}
for o in bpy.context.scene.objects:
    if o.type=='MESH' and (o.name.endswith(':shirt') or 'joined rise and inseams' in o.name):
        ref[o.get('motion_part')]=(world(o),record(o,names))
rig.animation_data.action=bpy.data.actions['Cycle'];bpy.context.scene.frame_set(1)
# Rotation differences are in the anatomical world frame. Digits preserve the approved bicycle grasp.
C=np.array([[-1,0,0],[0,0,1],[0,1,0]],float)
from mathutils import Matrix
def qjson(m):
    q=Matrix(m).to_quaternion();return [q.x,q.y,q.z,q.w]
grip={}
for b in rig.pose.bones:
    R=np.array(b.matrix.to_3x3())@np.linalg.inv(np.array(b.bone.matrix_local.to_3x3()))
    grip[b.name]=qjson(C@R@C.T)
bpy.ops.wm.open_mainfile(filepath=str(Path(src).resolve()))
sc=bpy.context.scene;bpy.context.preferences.filepaths.save_version=0;sc.render.fps=30
cid='chr.'+key+'.a12';body=bpy.data.objects[cid+':body'];actual=world(body)
assert len(base)==len(actual)==7093
def fit(p):
    idx,d=np.array([(i,d) for _,i,d in near.find_n(p,16)]).T
    w=1/(.002+d)**2;return p+np.average((actual-base)[idx.astype(int)],axis=0,weights=w)
def game(p):return (C@p).tolist()
arm=bpy.data.armatures.new(key+' fitted skeleton');rig=bpy.data.objects.new('FriendRig',arm);sc.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,(head,tail,z,parent) in skeleton.items():
    b=arm.edit_bones.new(name)
    if name in ('root','hips') and name=='root':h,t=head,tail
    else:h,t=fit(head),fit(tail)
    if name.startswith('socket_'):
        h=np.array(arm.edit_bones[parent].head)+(head-skeleton[parent][0]);t=h+(tail-head)
    b.head=h;b.tail=t;b.align_roll(Vector(z))
    if parent:b.parent=arm.edit_bones[parent]
    b.use_deform=not name.startswith('socket_') and name!='root'
# Separate facial joints retain control over eyes, lids, eyebrows, mouth and cheeks after mesh simplification.
eyes={}
for side in ['l','r']:
    # Geometry determines anatomical side, independent of inherited object suffixes.
    sign=1 if side=='l' else -1
    globe=next(o for o in sc.objects if ':globe.' in o.name and world(o).mean(0)[0]*sign>0)
    center=world(globe).mean(0);eyes[side]=center
    for label,shift in [('eye',(0,0,0)),('lid',(0,-.009,.005)),('brow',(0,0,.020)),('cheek',(0,-.003,-.033))]:
        b=arm.edit_bones.new(label+'_'+side);b.head=center+shift;b.tail=b.head+Vector((0,0,.016));b.parent=arm.edit_bones['head'];b.align_roll(Vector((0,1,0)))
b=arm.edit_bones.new('jaw');b.head=fit(np.array([0,-.060,1.351]));b.tail=b.head+Vector((0,0,.021));b.parent=arm.edit_bones['head']
bpy.ops.object.mode_set(mode='OBJECT');arm.display_type='STICK';rig.show_in_front=True
rig['ll_asset_id']=cid;rig['ll_asset_version']='1B.1';rig['ll_rig']='rig.human.child';rig['ll_license']='Child by gelmi.com.br, CC BY 4.0; adapted for Last Light'
joints={b.name:{'head':game(np.array(b.head_local)),'tail':game(np.array(b.tail_local)),'parent':b.parent.name if b.parent else None} for b in arm.bones}
profile={'key':key,'joints':joints,'grasp':{n:q for n,q in grip.items() if n.startswith(('hand_','thumb','index','middle','ring','pinky'))},'source_sha256':hashlib.sha256(Path(src).read_bytes()).hexdigest()}
calibration=Path(__file__).with_name('grip-calibration.json')
if calibration.exists():
    profile['grasp'].update(json.loads(calibration.read_text())[key])
allnames=list(joints);count=len(allnames);donor_columns=[allnames.index(n) for n in names]
ref={n:(tree(v),v,w) for n,(v,w) in ref.items()}
def rigid(o,bone):
    m=o.matrix_world.copy();o.parent=rig;o.parent_type='BONE';o.parent_bone=bone;bpy.context.view_layer.update();o.matrix_world=m
def assign(o,w):
    best=np.argsort(w,axis=1)[:,-4:];val=np.take_along_axis(w,best,1);val[val<.001]=0;val/=np.maximum(.00001,val.sum(1,keepdims=True))
    for i in np.unique(best[val>0]):
        vg=o.vertex_groups.get(allnames[i]) or o.vertex_groups.new(name=allnames[i]);rows,cols=np.where((best==i)&(val>0))
        ones=val[rows,cols]>.99999
        if ones.any():vg.add(rows[ones].tolist(),1,'REPLACE')
        for ix,weight in zip(rows[~ones],val[rows[~ones],cols[~ones]]):vg.add([int(ix)],float(weight),'REPLACE')
    m=o.matrix_world.copy();o.parent=rig;o.matrix_world=m
    mod=o.modifiers.new('Fitted skeleton','ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=True;o.modifiers.move(len(o.modifiers)-1,0)
def g(v,c,w):return np.exp(-np.sum(((v-c)/w)**2,axis=1))
char=[(o,c.name[:2]) for c in bpy.data.collections if c.name[:2] in ('01','02','03','04','05') for o in list(c.objects)]
for o,num in char:
    name=o.name.lower()
    if o.type not in ('CURVE','MESH','CURVES'):continue
    if num in ('02','03','05') or num=='01' and o!=body:
        p=np.array(o.matrix_world.translation)
        if o.type=='MESH':p=world(o).mean(0)
        elif o.type=='CURVE' and len(o.data.splines):
            p=np.mean([o.matrix_world@Vector(v) for v in o.bound_box],axis=0)
        side='l' if p[0]>0 else 'r';bone='head'
        if num=='02':
            if any(t in name for t in ('globe','ocular-surface','corneal dome')):bone='eye_'+side
            elif 'brow' in name:bone='brow_'+side
            elif 'upper' in name or 'lash' in name:bone='lid_'+side
        rigid(o,bone);o['friend_part']='head';continue
    if o.type=='CURVE':
        deps=bpy.context.evaluated_depsgraph_get();me=bpy.data.meshes.new_from_object(o.evaluated_get(deps),depsgraph=deps)
        M=o.matrix_world.copy();n=o.name;c=o.users_collection[0];bpy.data.objects.remove(o,do_unlink=True);o=bpy.data.objects.new(n,me);c.objects.link(o);o.matrix_world=M
    if o.type!='MESH':continue
    v=world(o);w=np.zeros((len(v),count),'f')
    if o==body:
        w[:,donor_columns]=bw
        for side in eyes:
            eye=eyes[side]
            for n,c,sz,amp in [('lid',eye+[0,-.010,.005],[.017,.014,.005],1),('brow',eye+[0,-.003,.023],[.025,.022,.012],.9),('cheek',eye+[0,-.007,-.040],[.034,.023,.026],.85)]:
                a=np.minimum(w[:,names.index('head')],g(v,c,sz)*amp);w[:,names.index('head')]-=a;w[:,allnames.index(n+'_'+side)]+=a
        zmid=fit(np.array([0,-.086,1.347]));a=np.minimum(w[:,names.index('head')],g(v,zmid,[.035,.034,.026]));w[:,names.index('head')]-=a;w[:,allnames.index('jaw')]+=a
        o['friend_part']='body'
        mask=np.array([bool(.590<z<.664 and abs(x)<.18 or 1.085<z<1.221 and abs(x)>.095) for x,y,z in base])
        group=o.vertex_groups.new(name='Wardrobe cover');group.add(np.flatnonzero(~mask).tolist(),1,'REPLACE')
        mod=o.modifiers.new('Covered upper arm and hip','MASK');mod.vertex_group=group.name
    elif any(t in name for t in ('short','pocket','outseam','waist','fly','shirt','sleeve','neckband','armscye','collar','button','henley','polo','placket')):
        kind='shorts' if any(t in name for t in ('short','pocket','outseam','waist','fly')) else 'shirt'
        t,donor,weights=ref[kind]
        if len(donor)==len(v) and (name.endswith(':shirt') or 'joined rise' in name):
            w[:,donor_columns]=weights
        else:
            idx=np.array([t.find(p)[1] for p in v]);w[:,donor_columns]=weights[idx]
        o['friend_part']=kind
    else:
        side='l' if v[:,0].mean()>0 else 'r';w[:,allnames.index('foot_'+side)]=1;o['friend_part']='foot'
        if 'outsole' in name:
            profile['sole_'+side]=[game(p-np.array(arm.bones['foot_'+side].head_local)) for p in v]
    assign(o,w)
for im in bpy.data.images:
    if im.packed_file and '__' in im.name:
        tx=out/'textures';tx.mkdir(exist_ok=True);(tx/im.name).write_bytes(im.packed_file.data)
(out/'profile.json').write_text(json.dumps(profile),encoding='utf8')
sc['source_sha256']=profile['source_sha256'];sc['character']=key
bpy.ops.wm.save_as_mainfile(filepath=str(out/(key+'-rig.blend')),compress=True)
