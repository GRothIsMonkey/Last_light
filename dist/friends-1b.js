import * as T from './three.module.js';
import {instantiate} from './asset-library.js';
import {prepareFriend,solveFriend} from './friends-1b-pose.js';
import {P,gripPos,smooth} from './rig.js';

export function bindFriend(instance){
 const {model,root,bones}=instance;let profile;
 model.traverse(o=>{if(o.userData.friend_profile)profile=JSON.parse(o.userData.friend_profile);});
 if(!profile)throw Error('Missing fitted rider profile for '+instance.id);
 const c=prepareFriend(profile);
 root.updateMatrixWorld(true);
 const joints=Object.entries(profile.joints).map(([name,j])=>{
   const bone=bones[name];if(!bone)throw Error(instance.id+' missing '+name);
   return {name,bone,parent:j.parent,restQ:bone.getWorldQuaternion(new T.Quaternion()),q:new T.Quaternion()};
 });
 const index=Object.fromEntries(joints.map(j=>[j.name,j]));
 const top=bones.root.parent,topQ=top.getWorldQuaternion(new T.Quaternion()),topP=top.getWorldPosition(new T.Vector3());
 const inv=new T.Quaternion();
 const meshes=[];model.traverse(o=>{if(o.isSkinnedMesh)meshes[o.userData.friend_lod]=o;});
 if(meshes.length!==3||meshes.some(m=>!m))throw Error('Expected three skinned detail levels for '+instance.id);
 let lod=-1;
 function level(n){if(n===lod)return;lod=n;meshes.forEach((m,i)=>{m.visible=i===n;});}
 level(0);
 function apply(p,state){
    const pose=solveFriend(c,p,state);
    for(const j of joints){
       const d=pose[j.name],par=index[j.parent];j.q.multiplyQuaternions(d.q,j.restQ);
       inv.copy(par?par.q:topQ).invert();
       j.bone.position.copy(d.p).sub(par?pose[par.name].p:topP).applyQuaternion(inv);
       j.bone.quaternion.multiplyQuaternions(inv,j.q);
    }
 }
 return {instance,apply,level,model:c,meshes,get lod(){return lod;}};
}

export async function createFriendBenchmark({friends,renderer,camera}){
 const cast=await Promise.all(friends.list.map(async f=>{
    const inst=await instantiate('chr.'+f.key+'.a12',{renderer}),skin=bindFriend(inst);
    const original=[];f.person.group.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints)original.push([o,o.layers.mask]);});
    f.person.group.add(inst.root);inst.root.visible=false;
    return {f,skin,original,active:false,lastParent:null,offTime:10,elapsed:0,lastGait:f.gait,speed:0,speech:0,updates:0};
 }));
 const eye=new T.Vector3(),point=new T.Vector3(),grip=new T.Vector3();
 let totalMs=0,updates=0;
 function enable(item,on){
   if(on===item.active)return;item.active=on;item.skin.instance.root.visible=on;
   for(const [o,mask] of item.original)o.layers.mask=on?0:mask;
   if(!on){item.lastParent=null;item.offTime=10;item.elapsed=0;item.speed=0;item.speech=0;}
 }
 function update(dt,ctx,show){
   const begin=performance.now();camera.getWorldPosition(eye);
   for(const item of cast){
     const {f,skin}=item;enable(item,show&&!f.external);
     if(!item.active||!f.person.group.visible)continue;
     const group=f.person.group,riding=group.parent===f.bike.group;
     if(item.lastParent===true&&!riding)item.offTime=0;
     item.lastParent=riding;item.offTime+=dt;
     const distance=group.getWorldPosition(point).distanceTo(eye),old=skin.lod;
     const lod=distance<(old===0?13:11)?0:distance<(old===2?29:33)?1:2;skin.level(lod);
     item.elapsed+=dt;
     const desired=lod===2?1/15:lod===1?1/30:0;
     if(item.elapsed+1e-6<desired)continue;
     const elapsed=item.elapsed;item.elapsed=0;
     const gaitDelta=Math.abs(f.gait-item.lastGait);item.lastGait=f.gait;
     const phaseSpeed=elapsed>0?gaitDelta/elapsed:0;
     item.speed=gaitDelta<.25?T.MathUtils.damp(item.speed,T.MathUtils.clamp(.62*phaseSpeed/Math.max(.15,1-.42*phaseSpeed),0,4),9,elapsed):0;
     const ride=riding?1:1-smooth(item.offTime/.32);
     const raised=T.MathUtils.clamp((f.pose[P.rh+1]-f.pose[1]-.19)/.43,0,1);
     const wave=riding?f.waveW||0:raised*smooth((item.offTime-.80)/.4);
     const speaking=ctx.speaker===f.name;
     item.speech=T.MathUtils.damp(item.speech,speaking?1:0,10,elapsed);
     const clock=ctx.clock+f.slot*.79;
     const hold=!riding&&f.holding?1:0;
     if(hold){gripPos(f.bike.steerAngle,-1,grip,f.bike.geom);f.bike.group.localToWorld(grip);group.worldToLocal(grip);}
     skin.apply(f.pose,{clock,gait:f.gait,geom:f.bike.geom,ride,crank:f.crank,steer:f.steer,astride:f.astride,
       stopSide:f.mode==='ride'?[-1,1,0][f.slot]:0,hold,heldGrip:hold?grip:null,wave,speed:riding?0:item.speed,
       attention:item.speech*.45+Math.max(0,Math.min(1,f.bellLook||0))*.6,
       speech:item.speech*(.34+.27*Math.sin(clock*13.3)+.19*Math.sin(clock*22.9+.6)),
       lookExtra:riding&&f.waveW>.1?-.52*f.waveW:0});
     item.updates++;
   }
   totalMs+=performance.now()-begin;updates++;
 }
 return {cast,update,stats(){return {updates,totalMs,meanMs:totalMs/Math.max(1,updates),lods:cast.map(i=>i.skin.lod)};}};
}
