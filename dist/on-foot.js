// Shared on-foot movement and embodiment. Jump never changes horizontal collision rules.
import * as THREE from './three.module.js';
import {standPose,walkPose,newPose,applyPose,headPos,P,stride} from './rig.js';
const clamp=THREE.MathUtils.clamp,damp=THREE.MathUtils.damp;
export function createOnFoot({scene,self,bike,camera,keys,sfx,landing,$}){
 const pose=newPose(),direction=new THREE.Vector3(),hand=new THREE.Vector3();
 const light=new THREE.SpotLight(0xffefcf,0,17,.31,.8,2),torch=new THREE.Group();torch.name='player-flashlight';
 const shell=new THREE.Mesh(new THREE.CylinderGeometry(.026,.021,.17,12),new THREE.MeshStandardMaterial({color:0x33424a,roughness:.55,metalness:.35}));shell.rotation.x=Math.PI/2;torch.add(shell);
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.018,12),new THREE.MeshStandardMaterial({color:0xe9dfb9,roughness:.25}));lens.rotation.x=Math.PI/2;lens.position.z=-.091;torch.add(lens);scene.add(torch);torch.visible=false;
 const F={stamina:1,crouch:0,height:0,vy:0,cooldown:0,sprint:false,exhausted:false,owned:false,on:false,phase:0,land:0,drain:1,light,torch,pose,
  attach(on){if(on){scene.add(light,light.target);}else{light.removeFromParent();light.target.removeFromParent();}},
  reset(){Object.assign(F,{stamina:1,crouch:0,height:0,vy:0,cooldown:0,sprint:false,exhausted:false,owned:false,on:false,phase:0,land:0,drain:1});F.ride();light.intensity=0;torch.visible=false;const bar=$('stamina');if(bar)bar.style.opacity=0;},
  ride(){if(self.group.parent!==bike.group)bike.group.add(self.group);self.group.position.set(0,0,0);self.group.rotation.set(0,0,0);torch.visible=false;},
  give(){F.owned=true;F.on=true;sfx('click',null,{gain:.45});},
  toggle(){if(F.owned){F.on=!F.on;sfx('click',null,{gain:.5});}},
  jump(allowed){if(allowed&&F.height===0&&F.cooldown<=0&&F.crouch<.25){F.vy=3.25;F.height=.001;F.cooldown=.72;}},
  update(dt,moving,locked=false){
   const duck=!locked&&(keys.has('KeyC')||keys.has('ControlLeft')||keys.has('ControlRight'));
   F.crouch=damp(F.crouch,duck?1:0,11,dt);F.cooldown=Math.max(0,F.cooldown-dt);F.land=damp(F.land,0,12,dt);
   if(F.exhausted&&F.stamina>.28)F.exhausted=false;
   F.sprint=!!moving&&!locked&&!duck&&!F.exhausted&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))&&F.stamina>.02;
   F.stamina=clamp(F.stamina+dt*(F.sprint?-F.drain/13:1/8),0,1);if(F.stamina<=.02)F.exhausted=true;
   if(F.height>0||F.vy>0){F.vy-=9.8*dt;F.height+=F.vy*dt;if(F.height<=0){F.height=F.vy=0;F.land=.045;F.cooldown=Math.max(F.cooldown,.23);landing?.();}}
   const el=$('stamina');if(el){el.style.opacity=F.sprint||F.stamina<.98?'.65':'0';$('stamina-fill').style.width=(F.stamina*100)+'%';}
   return moving?(duck?.95:F.sprint?3.65:2.05):0;
  },
  body(dt,{x,z,a,y,speed=0,scripted=false}){
   if(self.group.parent!==scene)scene.add(self.group);self.group.visible=true;
   F.phase+=speed*dt/stride(Math.max(speed,.8));
   if(speed>.08&&F.height===0)walkPose(pose,F.phase,speed);else standPose(pose,0,{shift:0});
   const crouch=scripted?clamp((y+1.406-camera.position.y)/.54,0,1):F.crouch;
   pose[P.root+1]-=.31*crouch;pose[P.lean]+=.52*crouch;pose[P.root+2]+=.09*crouch;
   for(const p of [P.lh,P.rh]){pose[p+1]-=.22*crouch;pose[p+2]-=.16*crouch;}
   if(F.height>0){pose[P.root+1]-=.07;pose[P.lf+1]+=.035;pose[P.rf+1]+=.06;pose[P.lf+2]=-.09;pose[P.rf+2]=.08;}
   if(F.owned){pose[P.rh]=.2;pose[P.rh+1]=.98-.25*crouch;pose[P.rh+2]=-.34;pose[P.re]=1;pose[P.re+1]=-.5;pose[P.re+2]=.2;}
   if(scripted){pose[P.root+1]=.30;pose[P.lean]=1.04;pose[P.root+2]=0;pose[P.lf]=-.17;pose[P.rf]=.17;pose[P.lf+2]=-.10;pose[P.rf+2]=.06;pose[P.lh+1]=.25;pose[P.lh+2]=-.07;pose[P.rh+1]=.42;pose[P.rh+2]=-.45;const hp=headPos(pose,new THREE.Vector3());x=camera.position.x-hp.x*Math.cos(a)+hp.z*Math.sin(a);z=camera.position.z-hp.x*Math.sin(a)-hp.z*Math.cos(a);y=camera.position.y-hp.y-.015;}
   self.group.position.set(x,y+F.height-F.land,z);self.group.rotation.set(0,-a,0);applyPose(self,pose);
  },
  lamp(dt,walking){
   torch.visible=walking&&F.owned;light.intensity=walking&&F.on?24:0;
   if(!torch.visible)return;self.group.updateMatrixWorld(true);self.parts.rhand.getWorldPosition(hand);
   camera.getWorldDirection(direction);if(F.on&&direction.y<-.2){const distance=Math.max(.5,(hand.y-self.group.position.y)/-direction.y);light.intensity=clamp(distance*distance*1.1,.7,24);}
   torch.position.copy(hand);torch.lookAt(hand.clone().sub(direction));
   light.position.copy(hand).addScaledVector(direction,.1);const aim=hand.clone().addScaledVector(direction,12);if(dt===0)light.target.position.copy(aim);else light.target.position.lerp(aim,1-Math.exp(-16*dt));
  },
  get eyeOffset(){return F.height-.54*F.crouch-F.land;},
 };
 return F;
}
