"""Build three independently simplified, skinned LODs sharing one atlas, skeleton and action library."""
import sys,math,bpy,numpy as np
from pathlib import Path
from mathutils import Vector
folder,dest=sys.argv[sys.argv.index('--')+1:];folder=Path(folder).resolve();key=folder.name
bpy.ops.wm.open_mainfile(filepath=str(folder/(key+'-rig.blend')))
sc=bpy.context.scene;rig=bpy.data.objects['FriendRig'];rig.data.pose_position='REST';bpy.context.view_layer.update()
names=list(rig.data.bones.keys());bi={n:i for i,n in enumerate(names)}
parts=[[] for _ in range(3)]
def arr(seq,field,k,it=False):
 a=np.empty((len(seq),k),'i' if it else 'f');seq.foreach_get(field,a.ravel());return a
def uvrect(src,rect):
 x,y,w,h=rect;uv=np.clip(src,.001,.999)
 return np.stack([(x+w*uv[...,0])/1024,1-(y+h-h*uv[...,1])/1024],axis=-1)
def record(level,v,f,uv,rgb,ids,weights):
 if not len(f):return
 used,fixed=np.unique(f,return_inverse=True)
 parts[level].append((v[used],fixed.reshape(-1,3),uv.reshape(-1,2),rgb.reshape(-1,4),ids[used],weights[used]))
def hair(o):
 xyz=arr(o.data.attributes['position'].data,'vector',3);M=np.array(o.matrix_world);xyz=xyz@M[:3,:3].T+M[:3,3]
 offs=np.empty(len(o.data.curve_offset_data),'i');o.data.curve_offset_data.foreach_get('value',offs);N=len(offs)-1
 center=np.median(xyz[offs[:-1:21]],axis=0);center[2]-=.05
 cloud=xyz[::19]-center;az=np.arctan2(cloud[:,0],-cloud[:,1]);rs=np.linalg.norm(cloud,axis=1);pol=np.arccos(np.clip(cloud[:,2]/np.maximum(.00001,rs),-1,1))
 color=np.array([.130,.058,.028]) if key=='alex' else np.array([.041,.021,.014])
 for level,(angular,rows,nstr,steps) in enumerate([(64,13,530,8),(35,8,115,6),(18,5,13,4)]):
    vv=[];ff=[];cc=[]
    for a in range(angular):
      phi=2*math.pi*a/angular-math.pi;mask=abs(np.angle(np.exp(1j*(az-phi))))<max(.10,math.pi/angular*1.4)
      sub=pol[mask];rad=rs[mask];edge=np.quantile(sub,.980)
      for z,t in enumerate(np.linspace(.03,1,rows)):
        theta=t*edge;select=abs(sub-theta)<.087
        if not select.any():select=np.argsort(abs(sub-theta))[:8]
        radius=np.quantile(rad[select],.60)-.002
        vv.append(center+radius*np.array([np.sin(phi)*np.sin(theta),-np.cos(phi)*np.sin(theta),np.cos(theta)]))
        cc.append(color*(.90+.13*math.sin(phi*23+5*t)+.08*math.cos(phi*15-2*t)))
        if z+1<rows:
          i=a*rows+z;j=((a+1)%angular)*rows+z;ff.extend([[i,i+1,j],[i+1,j+1,j]])
    for i in np.linspace(0,N-1,min(nstr,N),dtype=int):
      p=xyz[np.linspace(offs[i],offs[i+1]-1,steps,dtype=int)];n=p-center
      side=np.cross(np.gradient(p,axis=0),n);side/=np.maximum(.0000001,np.linalg.norm(side,axis=1,keepdims=True))
      width=(.00025+.00145*np.sin(np.linspace(.3,3.05,steps)))[:,None]
      start=len(vv);vv.extend(np.stack([p-side*width,p+side*width],1).reshape(-1,3));cc.extend([color*(.8+.45*(i%29)/28)]*(steps*2))
      for j in range(steps-1):
        a=start+j*2;ff.extend([[a,a+1,a+2],[a+1,a+3,a+2]])
    v=np.array(vv);f=np.array(ff);col=np.column_stack([cc,np.ones(len(v))]);ids=np.zeros((len(v),4),'i');ids[:,0]=bi['head'];ws=np.zeros_like(ids,'f');ws[:,0]=1
    record(level,v,f,np.tile([.9,.12],(len(f),3,1)),col[f],ids,ws)
sources=[o for o in sc.objects if o.get('friend_part') and not o.hide_render]
for o in sources:
 n=o.name.lower();kind=o['friend_part']
 if o.type=='CURVES':hair(o);continue
 if o.type not in ('MESH','CURVE'):continue
 if o.type=='CURVE' and len(o.data.splines)>290:continue
 if 'swept textured locks' in n and key=='jamie' and o.hide_render:continue
 for m in o.modifiers:
    if m.type=='SUBSURF':m.levels=1 if kind=='body' else 0
    if m.type=='ARMATURE':m.show_viewport=False
 if o.type=='CURVE':
    o.data.bevel_resolution=0;o.data.resolution_u=min(4,o.data.resolution_u)
 deps=bpy.context.evaluated_depsgraph_get();ev=o.evaluated_get(deps);me=bpy.data.meshes.new_from_object(ev,preserve_all_data_layers=True,depsgraph=deps)
 if not me.polygons:bpy.data.meshes.remove(me);continue
 obj=bpy.data.objects.new('Reduction',me);sc.collection.objects.link(obj)
 for vg in o.vertex_groups:obj.vertex_groups.new(name=vg.name)
 M=np.array(o.matrix_world);vg={g.index:bi[g.name] for g in o.vertex_groups if g.name in bi}
 rigid=bi.get(o.parent_bone,bi['head'])
 basecount=len(me.polygons);budget={'body':9600,'shirt':3600,'shorts':3000,'head':650,'foot':550}[kind]
 if 'lock' in n or 'undergrowth' in n or 'six-panel' in n:budget=1900
 small=any(s in n for s in ('stitch','thread','welt','eyelet','rib ','lace','seam','lash','meniscus','wet margin','vent','wisps','panel','brow'))
 for level,mul in enumerate([.55,.14,.034]):
    if level==2 and small or level>0 and any(s in n for s in ('thread','hairline wisps','loose fringe','loose tapered')):continue
    ratio=min(1,max(.006,budget*mul/basecount),[.48,.18,.052][level] if basecount>65 else 1)
    dec=obj.modifiers.new('Distance reduction','DECIMATE');dec.ratio=ratio
    deps=bpy.context.evaluated_depsgraph_get();tmp=obj.evaluated_get(deps);mesh=tmp.to_mesh(preserve_all_data_layers=True,depsgraph=deps);mesh.calc_loop_triangles()
    v=arr(mesh.vertices,'co',3)@M[:3,:3].T+M[:3,3];f=arr(mesh.loop_triangles,'vertices',3,True);loops=arr(mesh.loop_triangles,'loops',3,True)
    mats=arr(mesh.loop_triangles,'material_index',1,True)[:,0];uv=np.tile([.9,.12],(len(f),3,1));col=np.ones((len(f),3,4),'f')
    ids=np.zeros((len(v),4),'i');ws=np.zeros_like(ids,'f')
    for i,vx in enumerate(mesh.vertices):
       a=sorted([(gr.weight,vg[gr.group]) for gr in vx.groups if gr.group in vg],reverse=True)[:4]
       if not a:a=[(1,rigid)]
       for j,(w,gi) in enumerate(a):ids[i,j]=gi;ws[i,j]=w
    ws/=np.maximum(.00001,ws.sum(1,keepdims=True))
    cache={l.name:arr(l.data,'uv',2) for l in mesh.uv_layers}
    for mi,mat in enumerate(mesh.materials):
       if not mat:continue
       mask=mats==mi;color=np.array(mat.diffuse_color)[:3];col[mask,:,:3]=color
       if kind=='body' and mi==0:
          raw=v[f].mean(1);face=mask&(raw[:,2]>1.225)&(abs(raw[:,0])<.14)
          for selected,layer,rect in [(face,'PortraitProject',(0,0,640,640)),(mask&~face,'LimbProject',(640,192,384,384))]:
             if layer in cache:uv[selected]=uvrect(cache[layer][loops[selected]],rect);col[selected,:,:3]=1
       elif 'corneal dome' in n and 'UVMap' in cache:uv[mask]=uvrect(cache['UVMap'][loops[mask]],(640,0,384,192));col[mask,:,:3]=1
       elif ('lid roll' in n or 'margin' in n) and 'PortraitProject' in cache:uv[mask]=uvrect(cache['PortraitProject'][loops[mask]],(0,0,640,640));col[mask,:,:3]=1
    record(level,v,f,uv,col,ids,ws);tmp.to_mesh_clear();obj.modifiers.remove(dec)
 bpy.data.objects.remove(obj,do_unlink=True);bpy.data.meshes.remove(me)
for o in list(sc.objects):
 if o!=rig:bpy.data.objects.remove(o,do_unlink=True)
mat=bpy.data.materials.new(key+' • summer atlas');mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Roughness'].default_value=.80
tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(folder/'textures/game-atlas.jpg'));mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
for level,items in enumerate(parts):
 v,f,uv,rgb,ix,w=zip(*items);off=np.cumsum([0]+[len(a) for a in v[:-1]]);f=np.concatenate([a+b for a,b in zip(f,off)]);v=np.concatenate(v);ix=np.concatenate(ix);w=np.concatenate(w)
 mesh=bpy.data.meshes.new('FriendLOD'+str(level));mesh.from_pydata(v.tolist(),[],f.tolist());mesh.update();mesh.polygons.foreach_set('use_smooth',np.ones(len(f),bool))
 texcoord=mesh.uv_layers.new(name='Atlas');texcoord.data.foreach_set('uv',np.ascontiguousarray(np.concatenate(uv),'f').ravel())
 color=mesh.color_attributes.new(name='Pigment',type='BYTE_COLOR',domain='CORNER');color.data.foreach_set('color',np.ascontiguousarray(np.concatenate(rgb),'f').ravel());mesh.color_attributes.active_color=color
 obj=bpy.data.objects.new(mesh.name,mesh);sc.collection.objects.link(obj);obj.parent=rig;obj['friend_lod']=level;mesh.materials.append(mat)
 for j in np.unique(ix[w>0]):
    group=obj.vertex_groups.new(name=names[j]);rows,cols=np.where((ix==j)&(w>0));ww=w[rows,cols];ones=ww>.99999
    if ones.any():group.add(rows[ones].tolist(),1,'REPLACE')
    for row,weight in zip(rows[~ones],ww[~ones]):group.add([int(row)],float(weight),'REPLACE')
 md=obj.modifiers.new('Shared skeleton','ARMATURE');md.object=rig
 print('LOD',key,level,len(f),flush=True)
rig.data.pose_position='POSE';rig.animation_data.action=bpy.data.actions['Idle'];sc.frame_set(1);Path(dest).parent.mkdir(exist_ok=True,parents=True)
bpy.ops.export_scene.gltf(filepath=str(Path(dest).resolve()),export_format='GLB',export_extras=True,export_animation_mode='ACTIONS',export_anim_single_armature=True,export_force_sampling=True,export_frame_step=2,export_frame_range=False,export_morph=False,export_vertex_color='ACTIVE')
