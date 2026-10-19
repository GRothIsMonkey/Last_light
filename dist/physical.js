// Things that are handled for real: a prop lies somewhere until a hand reaches it, is held in that hand (it follows the
// hand, frame by frame), and is put somewhere (a bag, a hook, another hand). Nothing appears in a hand or disappears from
// a table on a caption: a prop changes place only at the moment of contact. Shared by the player (first person) and by
// Jamie and Sam (steps for companions.js's step lists); any chapter can use it.
//
// The contract (what an art pass can change without touching a scene): a prop is any Object3D plus a grip (where it sits
// in a hand, in the hand's own frame); a container is any Object3D plus an opening (a point in its frame) and an open
// amount the scene animates. Replace the meshes, keep the names, grips and openings, and every scene still works.
// World space; a person is a rig.js person (parts, joints, group).
import * as THREE from './three.module.js';
import {standPose,sitPose,blendPose,copyPose,applyPose,newPose,P,smooth} from './rig.js';
import {headingTo,wrap} from './people.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const CURL=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.9);
const _p=new THREE.Vector3(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_v=new THREE.Vector3(),_m=new THREE.Matrix4(),_s=new THREE.Vector3();

// Where a hand is and which way it faces (world), without the left hand's mirror: the forearm's own turn and the
// fingers' curl, at the hand mesh.
export function handFrame(person,side,outP,outQ){const pr=person.parts,g=person.group;g.updateMatrixWorld(true);
 outP.copy(pr[side+'hand'].position).applyMatrix4(g.matrixWorld);g.matrixWorld.decompose(_v,_q2,_s);outQ.copy(_q2).multiply(pr[side+'fore'].quaternion).multiply(CURL);return outP;}

// The torso's own frame (for a backpack worn on the back: +z is the back, +y up the spine).
export function torsoFrame(person,outP,outQ){const pr=person.parts,g=person.group;g.updateMatrixWorld(true);outP.copy(pr.torso.position).applyMatrix4(g.matrixWorld);g.matrixWorld.decompose(_v,_q2,_s);outQ.copy(_q2).multiply(pr.torso.quaternion);return outP;}

export function createPhysical({scene,comp=null}){
 const root=new THREE.Group();root.name='physical-props';scene.add(root);
 const PROPS=new Map(),HELD=new Set(),LOG={contacts:0,releases:0,handoffs:0,log:[]};
 // ---- props ---------------------------------------------------------------------------------------------------------------
 // grip: {p:[x,y,z], r:[x,y,z]} in the hand's frame (y along the fingers, z out of the palm side).
 function prop(name,obj,{grip={p:[0,.045,.02],r:[0,0,0]},parent=root}={}){obj.name=obj.name||name;if(!obj.parent)parent.add(obj);
  const P2={name,obj,state:'placed',holder:null,side:'r',grip:{p:new THREE.Vector3(...grip.p),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(...grip.r))},home:null,where:null,container:null,
   // where it lies (world)
   place(pos,rot=null){HELD.delete(P2);P2.holder=null;if(obj.parent!==root)root.attach(obj);obj.position.copy(pos);if(rot)obj.quaternion.copy(rot.isQuaternion?rot:_q.setFromEuler(rot));obj.visible=true;P2.state='placed';P2.where='placed';return P2;},
   setHome(pos,rot=null){P2.home={p:pos.clone(),q:rot?(rot.isQuaternion?rot.clone():new THREE.Quaternion().setFromEuler(rot)):obj.quaternion.clone()};return P2;},
   restore(){if(P2.home)P2.place(P2.home.p,P2.home.q);P2.container=null;obj.visible=true;return P2;},
   // in a hand: from now on it goes where the hand goes
   holdBy(person,side='r',grip=null){if(grip)P2.grip={p:new THREE.Vector3(...grip.p),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(...(grip.r||[0,0,0]))),hang:!!grip.hang};P2.holder=person;P2.side=side;P2.state='held';P2.where='held';P2.container=null;
    if(obj.parent!==root)root.attach(obj);obj.visible=true;HELD.add(P2);sync1(P2);LOG.contacts++;LOG.log.push(['hold',name,side]);return P2;},
   // into something (a bag): hidden inside it, or kept visible at a point in it
   storeIn(box,{visible=false,local=null}={}){HELD.delete(P2);P2.holder=null;P2.state='stored';P2.where='stored';P2.container=box;box.contents?.add?.(name);
    if(visible&&local){box.obj.attach(obj);obj.position.copy(local);obj.visible=true;}else obj.visible=false;LOG.releases++;LOG.log.push(['store',name,box.name]);return P2;},
   // worn (a backpack): it goes where the wearer's back goes
   // (at: from the middle of the torso to the bag's bottom: down at the belt, its top at the shoulder blades, below the head)
   wearOn(person,at=[0,-.21,.14],rot=[0,0,0]){P2.grip={p:new THREE.Vector3(...at),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot))};P2.holder=person;P2.side='back';P2.state='worn';P2.where='worn';P2.container=null;if(obj.parent!==root)root.attach(obj);obj.visible=true;HELD.add(P2);sync1(P2);LOG.log.push(['wear',name]);return P2;},
   hide(){HELD.delete(P2);P2.holder=null;obj.visible=false;P2.state='hidden';P2.where='hidden';return P2;},
   get held(){return P2.state==='held';}};
  PROPS.set(name,P2);return P2;}
 // (a grip with hang: the thing hangs upright from the hand, turned the way its holder faces — a bag by its handle)
 function sync1(P2){if(!P2.holder)return;if(P2.side==='back')torsoFrame(P2.holder,_p,_q);else handFrame(P2.holder,P2.side,_p,_q);
  if(P2.grip.hang){P2.holder.group.matrixWorld.decompose(_v,_q2,_s);_q.copy(_q2);}P2.obj.position.copy(P2.grip.p).applyQuaternion(_q).add(_p);P2.obj.quaternion.copy(_q).multiply(P2.grip.q);}
 // (after everyone's pose for the frame is applied)
 function sync(){for(const P2 of HELD)sync1(P2);}
 // ---- containers: a bag, a backpack ----------------------------------------------------------------------------------------
 // opening: a point in the container's own frame where a hand goes to put something in
 function container(name,obj,{opening=[0,.3,0]}={}){const B={name,obj,open:0,want:0,opening:new THREE.Vector3(...opening),contents:new Set(),
  mouth(out=new THREE.Vector3()){obj.updateMatrixWorld(true);return out.copy(B.opening).applyMatrix4(obj.matrixWorld);}};return B;}
 // ---- a person's hand reaching: the steps (companions) -------------------------------------------------------------------------
 // Reach a point with one hand (bending for it if it is low), touch it (onContact), hold a moment, bring the hand back to
 // carry (or to the side). at(): the world point; dur: [reach, hold, back]. The other hand stays as it was.
 const toLocal=(c,w)=>{c.person.group.updateMatrixWorld(true);return c.person.group.worldToLocal(_v.copy(w));};
 function bend(p,y,w){// (how much a body bends to get a hand to height y: knees and back, as a kid would)
  const low=clamp((.95-y)/.85,0,1)*w;p[P.root+1]-=.34*low;p[P.root+2]+=.08*low;p[P.lean]+=.75*low;p[P.hp]-=.25*low;for(const f of [P.lf,P.rf])p[f+2]-=.03*low;}
 const CARRY={r:[.16,.98,-.24],l:[-.16,.98,-.24]};
 function reach(c,{at,side='r',dur=[.6,.18,.5],onContact=null,carry=true,face=true,keep=false,both=false,lean=0}={}){let e=0,touched=false,start=null,goal=null;const o=side==='r'?P.rh:P.lh,e2=side==='r'?P.re:P.le,o2=side==='r'?P.lh:P.rh;
  return (dt,ctx)=>{const w=at();if(!w)return true;if(e===0){start=[c.pose[o],c.pose[o+1],c.pose[o+2]];}e+=dt;
   if(face&&e<dur[0])c.pa+=clamp(wrap(headingTo(c.px,c.pz,w.x,w.z)-c.pa),-3*dt,3*dt);
   standPose(c.tmp,ctx.clock+c.R.phase,{look:0,shift:0});copyPose(c.pose,c.tmp);
   const L=toLocal(c,w);goal=[L.x,L.y,L.z];const u=smooth(e/dur[0]),back=smooth((e-dur[0]-dur[1])/dur[2]),k=u*(1-back);
   bend(c.pose,L.y,k);if(lean)c.pose[P.lean]+=lean*k;
   const cp=carry?CARRY[side]:start;for(let i=0;i<3;i++)c.pose[o+i]=(start[i]+(goal[i]-start[i])*u)*(1-back)+cp[i]*back;
   if(both){for(let i=0;i<3;i++)c.pose[o2+i]+=((goal[i]+(i===0?(side==='r'?-.14:.14):0))-c.pose[o2+i])*k;}
   c.pose[e2]=side==='r'?.6:-.6;c.pose[e2+1]=-.3;c.pose[e2+2]=.6;// (elbow out and back, the way an arm reaches)
   c.pose[P.hy]=clamp(-wrap(headingTo(c.px,c.pz,w.x,w.z)-c.pa),-1,1)*.7*(1-back);c.pose[P.hp]-=.35*k*clamp((1.3-L.y)/1.3,0,1);
   if(!touched&&e>=dur[0]){touched=true;onContact?.();}
   comp?.feet(c,c.pose);c.posed=true;applyPose(c.person,c.pose);return e>=dur[0]+dur[1]+dur[2]&&!keep;};}
 // A person's hold of something while doing anything else: the hand keeps to a carry place (drawn over the pose).
 function carryOverlay(side='r',where=null){const o=side==='r'?P.rh:P.lh,e2=side==='r'?P.re:P.le;return (p,w=1)=>{const q=where||CARRY[side];for(let i=0;i<3;i++)p[o+i]+=(q[i]-p[o+i])*w;p[e2]=side==='r'?.5:-.5;p[e2+1]=-.35;p[e2+2]=.7;};}
 // Hand to hand: the giver holds it out, the taker reaches, the prop changes hands at contact.
 function offer(c,{to,side='r',dur=1.2}={}){let e=0;const o=side==='r'?P.rh:P.lh;return (dt,ctx)=>{e+=dt;const t=to();c.pa+=clamp(wrap(headingTo(c.px,c.pz,t.x,t.z)-c.pa),-3*dt,3*dt);standPose(c.tmp,ctx.clock+c.R.phase,{look:clamp(-wrap(headingTo(c.px,c.pz,t.x,t.z)-c.pa),-1,1)});copyPose(c.pose,c.tmp);
   const u=smooth(e/.5);c.pose[o]+=((side==='r'?.12:-.12)-c.pose[o])*u;c.pose[o+1]+=(1.02-c.pose[o+1])*u;c.pose[o+2]+=(-.42-c.pose[o+2])*u;comp?.feet(c,c.pose);c.posed=true;applyPose(c.person,c.pose);return e>=dur;};}
 function handOff(prop2,to,side='r',grip=null){LOG.handoffs++;LOG.log.push(['handoff',prop2.name]);prop2.holdBy(to,side,grip);}
 // ---- sitting down and getting up (a dock's edge, a log) ----------------------------------------------------------------------
 // seat: {x, z, y (the surface sat on), a (the way the seat faces)}; legs 'hang' (over an edge) or 'bent' (on a log, h its
 // height over the ground at the feet). He turns his back to the seat, lowers onto it, and stays until until() says.
 function sit(c,{seat,legs='bent',h=.43,hands='knees',until=()=>false,look=null}){let e=0,mode='down';const base=newPose(),seatP=newPose();
  return (dt,ctx)=>{const S2=seat();if(!S2)return true;e+=dt;
   if(e<=dt){copyPose(base,c.pose);c.seatAt={...S2};}
   // (he ends up on the seat: from where he stands, a short step back onto it while he lowers)
   const u=smooth(e/.9);c.px+=(S2.x-c.px)*Math.min(1,dt*6);c.pz+=(S2.z-c.pz)*Math.min(1,dt*6);c.pa+=clamp(wrap(S2.a-c.pa),-3*dt,3*dt);
   const lk=look?clamp(-wrap(headingTo(c.px,c.pz,look().x,look().z)-c.pa),-1.1,1.1):0;
   sitPose(seatP,{seat:h,legs,t:ctx.clock+c.R.phase,hands,look:lk});blendPose(c.pose,base,seatP,u);c.sitW=u;c.seated=u>.98;
   c.py=S2.y;c.person.group.position.set(c.px,S2.y,c.pz);c.person.group.rotation.set(0,-c.pa,0);applyPose(c.person,c.pose);c.posed=true;c.holdPlace=true;
   if(e>1&&until()){c.seated=false;return true;}return false;};}
 function rise(c,{back=.45,legs='bent',h=.43}={}){let e=0;const seatP=newPose(),st=newPose();let from=null;return (dt,ctx)=>{e+=dt;if(!from){from={x:c.px,z:c.pz,y:c.py};copyPose(seatP,c.pose);}// (from the sit he is in, hands and head as they are)
  const u=smooth(e/.8);standPose(st,ctx.clock+c.R.phase);blendPose(c.pose,seatP,st,u);void legs;void h;
  // (up and a step forward off it)
  const fx=Math.sin(c.pa),fz=-Math.cos(c.pa);c.px=from.x+fx*back*u;c.pz=from.z+fz*back*u;c.py=null;c.sitW=1-u;c.seated=false;
  c.person.group.position.set(c.px,from.y,c.pz);applyPose(c.person,c.pose);c.posed=true;c.holdPlace=e<.8;return e>=.8;};}
 // ---- the player's hands (first person) -------------------------------------------------------------------------------------
 // One action at a time: reach a point (pick up / put in / touch / take), with the eye's crouch for something low; the
 // arm comes into view, the hand gets there, contact, back. arms(pose, toLocal) is what on-foot.js draws over the body.
 const ME={act:null,hold:{r:null,l:null},extra:[]};
 function playerReach({at,side='r',dur=[.42,.14,.38],onContact=null,low=null,then=null,carry=true}={}){ME.act={kind:'reach',at,side,dur,onContact,then,e:0,touched:false,carry,low};return ME.act;}
 function playerBusy(){return !!ME.act;}
 // the eye's dip for something low (the chapter's walking reads it): how far below standing reach the target is
 function playerCrouch(){const A=ME.act;if(!A||A.kind!=='reach'||A.low===false)return 0;const w=A.lastW;if(!w)return 0;const u=smooth(A.e/A.dur[0])*(1-smooth((A.e-A.dur[0]-A.dur[1])/A.dur[2]));return clamp((1.0-(A.lastY??1))/.8,0,1)*u;}
 const PCARRY={r:[.19,1.0,-.38],l:[-.19,1.0,-.38]};
 // How far you lean (and dip) to get a hand to something a little out of reach: the body and the eye go toward it.
 function lean(foot,dt,want,dip){if(!foot)return;const E=foot.extraEye,k=1-Math.exp(-7*dt);E.f+=(want-E.f)*k;E.y+=(dip-E.y)*k;}
 function arms(p,{toLocal:tl,dt,foot=null}){const A=ME.act;if(!A||A.kind!=='reach')lean(foot,dt,0,A?.dip??0);
  // held things in a hand when nothing else is going on: forward, low in view
  for(const side of ['r','l']){const H=ME.hold[side];if(!H||A?.side===side&&A.kind==='reach')continue;const o=side==='r'?P.rh:P.lh,e2=side==='r'?P.re:P.le,q=H.at||PCARRY[side];for(let i=0;i<3;i++)p[o+i]+=(q[i]-p[o+i])*(H.w??1);p[e2]=side==='r'?.8:-.8;p[e2+1]=-.4;p[e2+2]=.4;}
  for(const f of ME.extra)f(p,{toLocal:tl,dt,foot});
  if(!A||A.kind!=='reach')return;A.e+=dt;const w=A.at();if(!w){ME.act=null;return;}A.lastW=w;const L=tl(_v.copy(w));A.lastY=L.y;
  const o=A.side==='r'?P.rh:P.lh,e2=A.side==='r'?P.re:P.le;if(!A.start)A.start=[p[o],p[o+1],p[o+2]];
  const u=smooth(A.e/A.dur[0]),back=smooth((A.e-A.dur[0]-A.dur[1])/A.dur[2]),end=A.carry&&ME.hold[A.side]?PCARRY[A.side]:A.start;
  // (out of reach: lean toward it, and down for something low, as much as it takes, up to a step's worth)
  {const sx=A.side==='r'?.16:-.16,dh=Math.hypot(L.x-sx,L.z),need=dh-.4,lowK=clamp((.95-L.y)/.85,0,1),w=smooth(A.e/(A.dur[0]*.8))*(1-back);
   A.lean=clamp((A.lean??(foot?.extraEye.f||0))+(need>0?need*.5:need*.2)*Math.min(1,dt*12),0,.46);lean(foot,dt,A.lean*w,-.5*lowK*w);}
  for(let i=0;i<3;i++)p[o+i]=(A.start[i]+([L.x,L.y,L.z][i]-A.start[i])*u)*(1-back)+end[i]*back;p[e2]=A.side==='r'?.75:-.75;p[e2+1]=-.45;p[e2+2]=.35;
  bend(p,L.y,u*(1-back)*.6);
  if(!A.touched&&A.e>=A.dur[0]){A.touched=true;A.onContact?.();}
  if(A.e>=A.dur[0]+A.dur[1]+A.dur[2]){const t=A.then;ME.act=null;t?.();}}
 function playerHold(side,prop2,{at=null}={}){ME.hold[side]=prop2?{prop:prop2,at,w:1}:null;}
 function reset(){for(const P2 of PROPS.values()){P2.holder=null;HELD.delete(P2);}HELD.clear();ME.act=null;ME.hold.r=ME.hold.l=null;LOG.contacts=LOG.releases=LOG.handoffs=0;LOG.log.length=0;}
 const api={root,PROPS,LOG,ME,prop,container,sync,torsoFrame,sit,rise,reach,offer,handOff,carryOverlay,playerReach,playerBusy,playerCrouch,playerHold,arms,reset,handFrame,
  };
 return api;
}
