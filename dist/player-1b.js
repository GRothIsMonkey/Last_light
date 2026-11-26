import * as THREE from './three.module.js';
import {instantiate} from './asset-library.js';
import {gripPos,pedalPos,smooth} from './rig.js';

const turn=2*Math.PI;
const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const quat=()=>new THREE.Quaternion();
function turnBone(bone,from,to,world){
 const delta=quat().setFromUnitVectors(from.normalize(),to.normalize());
 const parent=bone.parent.getWorldQuaternion(quat()).invert();
 bone.quaternion.copy(parent.multiply(delta).multiply(world));
 bone.updateWorldMatrix(false,true);
}
// Solve from the current authored bend plane. The end bone keeps its authored orientation.
function reach(a,b,c,target,endRotation,allowShoulder=false){
 let sh=a.getWorldPosition(v()),el=b.getWorldPosition(v()),wr=c.getWorldPosition(v());
 if(allowShoulder){
   const line=target.clone().sub(sh),excess=line.length()-sh.distanceTo(el)-el.distanceTo(wr)+.002;
   if(excess>0){
     const clavicle=a.parent,goal=clavicle.getWorldPosition(v()).addScaledVector(line.normalize(),excess);
     clavicle.position.copy(clavicle.parent.worldToLocal(goal));clavicle.updateWorldMatrix(false,true);
     sh=a.getWorldPosition(v());el=b.getWorldPosition(v());wr=c.getWorldPosition(v());
   }
 }
 const arm=el.clone().sub(sh),fore=wr.clone().sub(el),l1=arm.length(),l2=fore.length();
 const ray=target.clone().sub(sh);const dist=Math.max(.00001,Math.min(ray.length(),l1+l2-.00001));
 ray.normalize();const pole=arm.clone().addScaledVector(ray,-arm.dot(ray));
 if(pole.lengthSq()<1e-10)return;
 const along=THREE.MathUtils.clamp((dist*dist+l1*l1-l2*l2)/(2*dist),-l1,l1);
 const mid=sh.clone().addScaledVector(ray,along).addScaledVector(pole.normalize(),Math.sqrt(Math.max(0,l1*l1-along*along)));
 turnBone(a,arm,mid.clone().sub(sh),a.getWorldQuaternion(quat()));
 const joint=b.getWorldPosition(v());turnBone(b,c.getWorldPosition(v()).sub(joint),target.clone().sub(joint),b.getWorldQuaternion(quat()));
 c.quaternion.copy(c.parent.getWorldQuaternion(quat()).invert().multiply(endRotation));c.updateWorldMatrix(false,true);
}
export async function createPlayerBenchmark({renderer,self,bike,foot}){
 const inst=await instantiate('chr.protagonist.a12',{renderer});const {root,bones,actions}=inst;
 let enabled=false,held=false,time=0,lastMode='',gaitWeight=0;
 const originals=[];self.group.traverse(o=>{if(o.isMesh)originals.push([o,o.visible]);});
 // r160 filters shadows through the viewing camera's layers. Submit the head
 // only during the shadow pass. Other instances keep their photographic head.
 inst.model.traverse(mesh=>{
   if(!mesh.isSkinnedMesh||mesh.name!=='PlayerHead')return;
   const source=mesh.geometry,shadowGeometry=new THREE.BufferGeometry();
   shadowGeometry.setIndex(source.index);
   for(const [key,attribute] of Object.entries(source.attributes))shadowGeometry.setAttribute(key,attribute);
   shadowGeometry.setDrawRange(0,0);
   mesh.geometry=shadowGeometry;
   mesh.onBeforeShadow=()=>shadowGeometry.setDrawRange(0,source.index.count);
   mesh.onAfterShadow=()=>shadowGeometry.setDrawRange(0,0);
 });
 const torch=foot.torch.clone();torch.name='Movement study flashlight';root.add(torch);
 const flags={ready:true,mode:'idle',gripError:0,plantError:0,active:false,info:inst.info};
 const active=new Set(),locks={};
 const channels=Object.values(bones).map(b=>({b,p:v(),q:quat()}));let haveBase=false,lastTransition=null;
 const poseSnapshot=()=>channels.map(({b})=>[b.position.clone(),b.quaternion.clone()]);
 // Evaluate hand overlays on a second mixer bound only to the named arm chain.
 function armOverlay(name,side){
   const clip=actions[name].getClip(),tracks=clip.tracks.filter(t=>new RegExp('^(upperarm|lowerarm|forearm_twist|hand|thumb[123]|index[123]|middle[123]|ring[123]|pinky[123])_'+side+'\\.').test(t.name));
   const mixer=new THREE.AnimationMixer(inst.model),action=mixer.clipAction(new THREE.AnimationClip(name+' overlay',clip.duration,tracks));
   action.setLoop(THREE.LoopOnce,1).play();action.paused=true;action.clampWhenFinished=true;
   return u=>{action.time=Math.min(clip.duration-.00001,u*clip.duration);mixer.update(0);};
 }
 const lightArm=armOverlay('RunLight','r'),bellArm=armOverlay('Bell','l');
 function show(on){
   if(on===enabled)return;enabled=on;flags.active=on;root.visible=on;
   for(const [o,visible] of originals)o.visible=on?false:visible;
 }
 function sample(list){
   const next=new Set();
   for(const [n,w,u] of list){
     if(w<=.00001)continue;const a=actions[n];if(!a)continue;
     next.add(n);if(!active.has(n)){a.reset().setLoop(THREE.LoopOnce,1).play();a.clampWhenFinished=true;}
     a.enabled=true;a.paused=true;a.time=Math.min(a.getClip().duration,Math.max(0,u*a.getClip().duration));a.setEffectiveWeight(w);
   }
   for(const n of active)if(!next.has(n))actions[n].stop();
   active.clear();for(const n of next)active.add(n);inst.mixer.update(0);
 }
 function grips(angle,weight,bell){
   const rotation=quat().setFromAxisAngle(v(0,1,0).applyQuaternion(bike.geom.rakeQ),angle);
   const basis=bike.group.getWorldQuaternion(quat()),delta=basis.clone().multiply(rotation).multiply(basis.clone().invert());
   flags.gripError=0;
   for(const [s,sign] of [['l',-1],['r',1]]){
     const wrist=bones['hand_'+s],socket=bones['socket_grip_'+s],w=wrist.getWorldPosition(v()),g=socket.getWorldPosition(v());
     const goal=gripPos(angle,sign,v(),bike.geom);goal.add(v(-sign*(.006+(s==='l'?.024*bell:0)),0,0).applyQuaternion(rotation));bike.group.localToWorld(goal);
     const desired=goal.clone().add(w.clone().sub(g).applyQuaternion(delta));
     const handQ=wrist.getWorldQuaternion(quat());const orientation=handQ.clone().slerp(delta.clone().multiply(handQ),weight);
     reach(bones['upperarm_'+s],bones['lowerarm_'+s],wrist,w.lerp(desired,weight),orientation,true);
     flags.gripError=Math.max(flags.gripError,socket.getWorldPosition(v()).distanceTo(goal));
   }
 }
 function pedals(angle,plant){
    flags.plantError=0;
    for(const [s,sign] of [['l',-1],['r',1]]){
      const footBone=bones['foot_'+s],footQ=footBone.getWorldQuaternion(quat());
      const a=angle+(sign<0?Math.PI:0),pitch=.088*Math.sin(a);
      const ankle=pedalPos(angle,sign,v(),bike.geom);ankle.x+=sign*.005;ankle.z+=.060;
      // Rock the sole about the ball of the foot above the 22 mm pedal platform.
      ankle.y+=.087+.060*Math.sin(pitch);
      if(sign<0)ankle.lerp(v(-.222,.078,.06),plant);
      bike.group.localToWorld(ankle);
      reach(bones['thigh_'+s],bones['calf_'+s],footBone,ankle,footQ);
      flags.plantError=Math.max(flags.plantError,footBone.getWorldPosition(v()).distanceTo(ankle));
    }
 }
 function ground(phase,speed,playing){
   if(!playing){for(const k of Object.keys(locks))delete locks[k];return;}
   const beta=.58-.2*smooth((speed-1.7)/1.3);
   for(const [s,offset] of [['l',0],['r',.5]]){
     const u=(phase+offset)%1,b=bones['foot_'+s],pos=b.getWorldPosition(v()),rotation=b.getWorldQuaternion(quat());
     if(u>=beta){delete locks[s];continue;}
     // A supported boot keeps its ground contact while the actual player translates or turns.
     const contact=pos.clone().add(v(0,-.075,-.024).applyQuaternion(root.getWorldQuaternion(quat())));
     if(!locks[s])locks[s]=contact.clone();
     const slip=locks[s].clone().sub(contact);slip.y=0;
     if(slip.length()>.18){locks[s]=contact.clone();continue;}
     const gain=smooth(u/.055)*(1-smooth((u-beta+.07)/.07));
     reach(bones['thigh_'+s],bones['calf_'+s],b,pos.addScaledVector(slip,gain),rotation);
   }
 }
 const toggle=ev=>{if(ev.code==='BracketRight'&&!ev.repeat&&enabled&&lastMode==='foot')held=!held;};
 addEventListener('keydown',toggle);
 function update(dt,x){
   time+=dt;let mode=['riding','arriving','stopped','leaving'].includes(x.state)?'bike':x.state==='walking'?'foot':['dismounting','remounting'].includes(x.state)?'transition':'off';
   // Story-specific seated poses continue to use their existing model and attach points.
   if(x.scripted)mode='off';
   if(mode==='off'){show(false);held=false;lastMode=mode;lastTransition=null;return;}
   // Undo last frame's IK before sampling. A paused mixer may leave constant tracks untouched.
   const entering=mode==='transition'&&lastMode==='bike';
   if(entering)lastTransition=poseSnapshot();
   if(haveBase)for(const {b,p,q} of channels){b.position.copy(p);b.quaternion.copy(q);}
   if(root.parent!==self.group.parent){self.group.parent.add(root);for(const k of Object.keys(locks))delete locks[k];}
   show(true);root.position.copy(self.group.position);root.quaternion.copy(self.group.quaternion);root.scale.copy(self.group.scale);
   const phase=(x.phase%1+1)%1;const pedal=(bike.crankAngle/turn%1+1)%1;const plant=x.astride||0;
   const run=smooth((x.speed-1.85)/1.5);gaitWeight=THREE.MathUtils.damp(gaitWeight,mode==='foot'&&x.speed>.07?1:0,10,dt);
   torch.visible=false;
   if(mode==='bike'){sample([['Cycle',1-plant,pedal],['Brake',plant,1]]);}
   else if(mode==='transition'){
     const u=x.state==='dismounting'?Math.min(1,x.transT/1.35):1-Math.min(1,x.transT/1.05);
     sample([['Dismount',1,u]]);
   }else{
     const crouch=foot.crouch||0,g=gaitWeight*(1-crouch);
     sample([['Idle',(1-gaitWeight)*(1-crouch),(time%2)/2],['Walk',g*(1-run),phase*.5],['Run',held?0:g*run,phase*.5],['RunLight',held?g*run:0,phase*.5],['Crouch',crouch,.48]]);
     // The photographic counterpart retains its head. Its first-person companion follows the game's eye.
     root.translateZ(.055+.115*smooth((-x.pitch-.2)/.92));
   }
   for(const {b,p,q} of channels){p.copy(b.position);q.copy(b.quaternion);}haveBase=true;
   if(mode==='transition'&&lastTransition){
     const w=smooth(x.transT/.30);
     for(let i=0;i<channels.length&&w<1;i++){const {b}=channels[i];b.position.lerp(lastTransition[i][0],1-w);b.quaternion.slerp(lastTransition[i][1],1-w);}
     if(w>=1)lastTransition=null;
   }
   if(mode==='bike'&&x.bell>0)bellArm(x.bell);
   root.updateWorldMatrix(true,true);
   if(mode==='bike'){grips(bike.steerAngle,1,x.bell||0);pedals(bike.crankAngle,plant);}
   if(mode==='foot'){ground(phase,x.speed,x.speed>.12);if(held){
     // Apply the approved right-hand grasp even when standing or walking. Capture and restore only the arm branch.
     if(run<.999){lightArm(phase*.5);root.updateWorldMatrix(true,true);}
     const socket=bones.socket_lamp_r;sockToTorch(socket,torch,root);
   }}
   lastMode=mode;flags.mode=mode;flags.held=held;flags.phase=phase;flags.steering=bike.steerAngle;flags.crank=bike.crankAngle;flags.plant=plant;
 }
 function sockToTorch(socket,o,parent){
    o.visible=true;o.position.copy(parent.worldToLocal(socket.getWorldPosition(v())));
    const axis=v(0,1,0).applyQuaternion(socket.getWorldQuaternion(quat())).applyQuaternion(parent.getWorldQuaternion(quat()).invert());
    o.quaternion.setFromUnitVectors(v(0,0,-1),axis.normalize());
 }
 return {update,flags,instance:inst};
}
