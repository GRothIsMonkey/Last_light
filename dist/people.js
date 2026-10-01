// People placed in world space that night: the grown-ups on Briarwood Lane (two officers, Alex's
// mom and dad, a neighbor). Same rig, same poses and feet on the ground as everyone else, with a
// few small gestures layered on a standing pose: arms folded, hands on hips, a phone, a shoulder
// radio, a flashlight, pointing, talking with one hand. Heading a: forward is (sin a, -cos a).
import * as THREE from './three.module.js';
import {createPerson,blinkPerson,newPose,standPose,walkPose,addWave,applyPose,copyPose,blendPose,P,smooth,stride,shoulderPos} from './rig.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
// Grown-ups are taller and broader than the kids; all of them dressed for a summer night at home,
// except the officers, in navy uniform shirts and dark trousers.
export const ADULTS={
 officer:{name:'OFFICER',scale:1.22,
  face:{jaw:.98,cheek:.94,eyeGap:.037,eyeY:.014,browTilt:-.06,nose:'straight',mouth:'flat',ears:.95,skin:0xc99a78,lips:0xa86a58,iris:0x2e2418},
  hair:{style:'cropped',color:0x2a221c},build:{bulk:1.14,shoulders:1.16,head:.97,posture:0,hunch:0},
  clothes:{shirt:0x27324a,trim:0x27324a,collar:true,sleeves:'short',pants:0x1c2232,socks:0x1c2232,shoes:0x141416,sole:0x1d1d1f}},
 officer2:{name:'OFFICER',scale:1.2,
  face:{jaw:.9,cheek:1,eyeGap:.035,eyeY:.012,browTilt:0,nose:'broad',mouth:'flat',ears:1,skin:0x9a6a4c,lips:0x7a4a3a,iris:0x1e140e},
  hair:{style:'cropped',color:0x171310},build:{bulk:1.08,shoulders:1.1,head:.98,posture:0,hunch:0},
  clothes:{shirt:0x27324a,trim:0x27324a,collar:true,sleeves:'short',pants:0x1c2232,socks:0x1c2232,shoes:0x141416,sole:0x1d1d1f}},
 dad:{name:'ALEX’S DAD',scale:1.21,
  face:{jaw:.96,cheek:.98,eyeGap:.038,eyeY:.01,browTilt:.1,nose:'button',mouth:'flat',ears:1,skin:0xd8ad8c,lips:0xb87a64,iris:0x4a5a3a},
  hair:{style:'swept',color:0x5a3f28},build:{bulk:1.1,shoulders:1.08,head:.98,posture:0,hunch:.04},
  clothes:{shirt:0x7f8f9c,trim:0x7f8f9c,collar:true,sleeves:'short',pants:0x8c7b5e,socks:0x8c7b5e,shoes:0x4a3c30,sole:0x2c2724}},
 mom:{name:'ALEX’S MOM',scale:1.14,
  face:{jaw:.84,cheek:.96,eyeGap:.037,eyeY:.013,browTilt:.16,nose:'button',mouth:'flat',ears:.95,skin:0xe2b898,lips:0xb87064,iris:0x4a5a3a},
  hair:{style:'ponytail',color:0x7a5230},build:{bulk:.94,shoulders:.96,head:.95,posture:0,hunch:.05},
  clothes:{shirt:0xc9b9a8,trim:null,sleeves:'long',pants:0x3a4252,socks:0x3a4252,shoes:0x2e2e33,sole:0x5a5a58}},
 neighbor:{name:'NEIGHBOR',scale:1.15,
  face:{jaw:.86,cheek:1.02,eyeGap:.036,eyeY:.012,browTilt:.06,nose:'straight',mouth:'flat',ears:1,skin:0xe6c2a6,lips:0xb07a6a,iris:0x3a3a42},
  hair:{style:'cropped',color:0xb9b3aa},build:{bulk:1,shoulders:.95,head:.96,posture:0,hunch:.12},
  clothes:{shirt:0x6f6688,trim:null,sleeves:'long',pants:0x5a5a64,socks:0x5a5a64,shoes:0x8a7f78,sole:0x5f5853}},
};

// A world-space path through [x,z] points (Catmull-Rom), measured in meters.
export function worldPath(ctrl){const pts=[];
 for(let i=0;i<ctrl.length-1;i++){const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(ctrl.length-1,i+2)];
  for(let k=0;k<10;k++){const t=k/10,t2=t*t,t3=t2*t;const f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);pts.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 pts.push(ctrl[ctrl.length-1]);const s=[0];for(let i=1;i<pts.length;i++)s.push(s[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 const length=s[s.length-1];let hint=1;
 function at(u){u=clamp(u,0,length);let i=clamp(hint,1,s.length-1);while(i>1&&s[i-1]>u)i--;while(i<s.length-1&&s[i]<u)i++;hint=i;const t=(u-s[i-1])/((s[i]-s[i-1])||1),a=pts[i-1],b=pts[i];
  return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,a:Math.atan2(b[0]-a[0],-(b[1]-a[1]))};}
 const curv=u=>{const p=at(u-.8),q=at(u+.8);return Math.abs(wrap(q.a-p.a))/1.6;};
 return {length,at,curv,pts};
}
// Heading from (x,z) toward (tx,tz).
export const headingTo=(x,z,tx,tz)=>Math.atan2(tx-x,-(tz-z));

// One grown-up. Modes: stand (with an optional gesture), walk (along a path), turn.
export function createActor(scene,nav,spec,{seed=0}={}){
 const person=createPerson(spec);scene.add(person.group);person.group.visible=false;
 person.group.traverse(o=>{if(o.isMesh)o.castShadow=false;});
 const A={person,spec,name:spec.name,seed,x:0,z:0,a:0,y:null,pose:newPose(),from:newPose(),tmp:newPose(),t:0,e:0,gait:0,mode:'stand',
  path:null,u:0,v:0,speed:1.2,onArrive:null,look:0,lookPitch:0,lookAt:null,gesture:null,gw:0,next:null,gtarget:null,talk:0,turnTo:null,visible:false,
  show(on=true){A.visible=on;person.group.visible=on;},
  place(x,z,a=A.a){A.x=x;A.z=z;A.a=a;A.y=null;A.mode='stand';A.path=null;A.turnTo=null;copyPose(A.from,A.pose);A.e=0;},
  walk(points,{speed=1.25,then=null}={}){A.path=worldPath([[A.x,A.z],...points]);A.u=0;A.v=Math.min(A.v,.4);A.speed=speed;A.mode='walk';A.onArrive=then;copyPose(A.from,A.pose);A.e=0;},
  face(a){A.turnTo=a;},faceTo(x,z){A.turnTo=headingTo(A.x,A.z,x,z);},
  // gesture: null | 'fold' | 'hips' | 'phone' | 'radio' | 'flashlight' | 'point' | 'head' (a hand to the head) | 'wave'
  gest(g,target=null){A.next=g;A.gtarget=target;},
  get walking(){return A.mode==='walk';},
  get pos(){return person.group.position;},
 };
 const hand=new THREE.Vector3();
 function layer(p,g,w,t){if(!g||w<=0)return;const L=P.lh,R=P.rh;const set=(o,x,y,z)=>{p[o]+=(x-p[o])*w;p[o+1]+=(y-p[o+1])*w;p[o+2]+=(z-p[o+2])*w;};
  if(g==='fold'){set(L,.07,1.06,-.19);set(R,-.06,1.03,-.2);set(P.le,-1,-.5,-.1);set(P.re,1,-.5,-.1);}
  else if(g==='hips'){set(L,-.21,.86,.0);set(R,.21,.86,.0);set(P.le,-1,0,.5);set(P.re,1,0,.5);}
  else if(g==='phone'){set(R,.1,1.39,-.03);set(P.re,1,-.7,.2);set(L,.05,1.02,-.16);set(P.le,-1,-.5,0);p[P.hy]+=.12*w;}
  else if(g==='radio'){set(L,-.13,1.19,-.11);set(P.le,-1,-.6,.1);p[P.hy]-=.38*w;p[P.hp]+=.18*w;}
  else if(g==='head'){set(R,.08,1.47,-.03);set(P.re,1,.2,-.3);set(L,-.1,.98,-.12);set(P.le,-1,-.4,.2);p[P.hp]+=.12*w;}
  else if(g==='flashlight'){set(R,.17,1.04,-.36);set(P.re,1,-.6,.3);}
  else if(g==='talk'){const s=Math.sin(t*3.1+seed)*.05,c=Math.cos(t*2.3+seed)*.03;set(R,.19+c,1.0+s,-.27);set(P.re,1,-.5,.3);}
  else if(g==='point'){const sh=shoulderPos(p,1,hand);let dx=0,dz=-1;if(A.gtarget){const a=headingTo(A.x,A.z,A.gtarget.x,A.gtarget.z)-A.a;dx=Math.sin(a);dz=-Math.cos(a);}
   set(R,sh.x+dx*.52,sh.y-.06,sh.z+dz*.52);set(P.re,1,-.3,.4);}
  else if(g==='wave')addWave(p,t,w);}
 function update(dt,ctx){if(!A.visible)return;A.t+=dt;A.e+=dt;const p=A.pose;
  // Gestures blend out, swap, and blend back in.
  if(A.next!==A.gesture){A.gw=damp(A.gw,0,8,dt);if(A.gw<.05){A.gesture=A.next;}}else A.gw=damp(A.gw,A.gesture?1:0,4,dt);
  let lookT=0,pitchT=0;
  if(A.lookAt){const la=A.lookAt.isVector3?A.lookAt:A.lookAt;const want=headingTo(A.x,A.z,la.x,la.z);lookT=clamp(-wrap(want-A.a),-1.2,1.2);
   const dist=Math.hypot(la.x-A.x,la.z-A.z),dy=(la.y??(A.pos.y+1.4))-(A.pos.y+1.62*(spec.scale||1));pitchT=clamp(-Math.atan2(dy,Math.max(dist,.5)),-.5,.45);}
  A.look=damp(A.look,lookT,4,dt);A.lookPitch=damp(A.lookPitch,pitchT,4,dt);
  if(A.mode==='walk'){const path=A.path,remain=path.length-A.u,target=Math.min(A.speed,Math.sqrt(2*1.6*Math.max(0,remain))+.12);A.v+=clamp(target-A.v,-3*dt,1.6*dt);
   const q=path.at(A.u+Math.min(.45,remain)),turn=remain>.05?wrap(q.a-A.a):0,max=3*dt;A.a+=clamp(turn,-max,max);const slow=Math.abs(turn)>1.1?.4:1;
   const step=A.v*slow*dt;A.u+=step;const at=path.at(A.u);A.x=at.x;A.z=at.z;A.gait+=step/stride(Math.max(A.v,.8));walkPose(p,A.gait,Math.max(A.v,.8),{look:A.look*.6,lookPitch:A.lookPitch*.5});
   if(A.e<.35)blendPose(p,A.from,p,smooth(A.e/.35));
   if(remain<.04){A.mode='stand';copyPose(A.from,p);A.e=0;const f=A.onArrive;A.onArrive=null;f?.(A);}}
  else{let turning=0;if(A.turnTo!==null){const d=wrap(A.turnTo-A.a),step=clamp(d,-2.2*dt,2.2*dt);A.a+=step;turning=Math.abs(step)/dt;if(Math.abs(d)<.01)A.turnTo=null;}
   standPose(p,A.t+seed*3.1,{look:A.look,lookPitch:A.lookPitch});
   if(turning>.2){A.gait+=turning*dt*.35;const w=walkPose(A.tmp,A.gait,.8,{look:A.look});blendPose(p,p,w,clamp(turning*.5,0,.8));}
   if(A.e<.4)blendPose(p,A.from,p,smooth(A.e/.4));}
  layer(p,A.gesture,A.gw,A.t);if(A.talk>0){A.talk-=dt;p[P.hp]+=Math.sin(A.t*7.3)*.025;p[P.hy]+=Math.sin(A.t*3.7)*.03;}
  // Feet on the ground: each foot finds its own height relative to the ground under the body.
  const gy=nav.groundY(A.x,A.z);A.y=A.y===null?gy:damp(A.y,gy,12,dt);const s=spec.scale||1,c=Math.cos(A.a),sn=Math.sin(A.a);
  for(const o of [P.lf,P.rf]){const lx=p[o]*s,lz=p[o+2]*s,wx=A.x+lx*c-lz*sn,wz=A.z+lx*sn+lz*c;p[o+1]+=clamp((nav.groundY(wx,wz)-A.y)/s,-.25,.4);}
  person.group.position.set(A.x,A.y,A.z);person.group.rotation.set(0,-A.a,0);applyPose(person,p);blinkPerson(person,A.t,seed+4);}
 A.update=update;return A;
}
