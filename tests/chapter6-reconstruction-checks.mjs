// Focused regressions for the reconstruction, using real chapter APIs and inputs.
import assert from 'node:assert/strict';
import {chapterSixTools,playChapterSix} from './chapter6-sim.mjs';
import * as THREE from '../dist/three.module.js';
export function runReconstruction(T,{part='all'}={}){const {h,advance,press,release,tap,check}=T,A=h.chapter6,X=chapterSixTools(T),{approach,faceV,until,me}=X;const snap=T.snap||(()=>{}),metrics={};
 const aim=q=>{faceV(q);advance(.1);};
 if(part==='all'||part==='home'){
 h.jump('c6-camera');advance(.3);snap('morning-bedroom');
 const home=A.home,origin=home.SPOTS.wake;
 // Walk there using the normal nav/collision path, and start with the visible F prompt.
 for(const id of ['wash','brush','breakfast']){
  const q=home.SPOTS[id];const reached=approach(q,.95,{max:30});aim(q);(metrics.home||=[]).push({id,reached,me:me(),local:home.toL(me().x,me().z),target:q,phase:A.C.phase,lock:h.roam.walkLock});snap('morning-'+id+'-approach');
  check('Morning: '+id+' is reachable from the bedroom with normal movement',()=>assert.ok(Math.hypot(me().x-q.x,me().z-q.z)<1.35,JSON.stringify({reached,me:me(),target:q,local:home.toL(me().x,me().z)})));
  tap('KeyF');advance(1.25);
  check('Morning: F starts '+id+' from its prompt',()=>assert.equal(A.C.routine?.id,id));
  if(!A.C.routine)continue;
  const progress=A.C.routine.progress;advance(.7);check('Morning: '+id+' waits for held F',()=>assert.equal(A.C.routine.progress,progress));
  press('KeyF');advance(1.3);snap('morning-'+id);release('KeyF');
  if(id==='wash'){const at=new THREE.Vector3(q.x,q.y-.07,q.z),ds=['l','r'].map(side=>h.self.parts[side+'hand'].getWorldPosition(new THREE.Vector3()).distanceTo(at));metrics.washHandDistances=ds;check('Morning: both washing hands stay within 30 cm of the basin',()=>assert.ok(ds.every(d=>d<.30),JSON.stringify(ds)));}
  if(id==='brush'){tap('KeyS');advance(.1);check('Morning: brushing can be interrupted and the toothbrush returns',()=>{assert.equal(A.C.routine,null);assert.equal(home.domestic.brush.parent,home.domestic.root);assert.ok(!A.C.flags['routine-brush']);});aim(q);tap('KeyF');advance(1.2);}
  press('KeyF');until(()=>!A.C.routine,12);release('KeyF');advance(.1);
  check('Morning: '+id+' completes, changes its prop state and releases movement',()=>{assert.ok(A.C.flags['routine-'+id]);assert.equal(home.domestic.ST[id],1);assert.equal(h.roam.walkLock,false);});
 }
 h.jump('c6-camera');advance(.2);check('Morning: replay clears routine progress and returns loose props',()=>{assert.equal(home.domestic.ST.breakfast,0);assert.equal(home.domestic.ST.brush,0);assert.equal(home.domestic.ST.tap,false);assert.equal(home.domestic.spoon.parent,home.domestic.root);});
 }
 if(part==='all'||part==='cloth'){
 h.jump('c6-shirt');advance(.1);let prev=null,transfer=0,pinError=0,fall=0,maxStrain=0,finite=true,steps=0;const seen=new Set();let lastOwner=null;
 const watch=()=>{const cloth=A.cloth,prop=A.SHIRT;if(prop.held){const curr=cloth.positions.map(p=>p.clone());if(prev&&lastOwner!==prop.holder)transfer=Math.max(transfer,...curr.map((p,i)=>p.distanceTo(prev[i])));prev=curr;lastOwner=prop.holder;
  finite&&=cloth.stats.finite;maxStrain=Math.max(maxStrain,cloth.stats.maxStrain);
  if(cloth.stats.pinned===2){const hands=['l','r'].map(s=>prop.holder.parts[s+'hand'].getWorldPosition(new THREE.Vector3()));cloth.pins.forEach((n,i)=>{pinError=Math.max(pinError,cloth.positions[n].distanceTo(hands[i]));});const ys=cloth.positions.map(p=>p.y);fall=Math.max(fall,Math.max(...ys)-Math.min(...ys));}
 }
 if(!prop.held){prev=null;lastOwner=null;}
 const stage=A.C.shirtAct?.stage;if(stage&&!seen.has(stage)){seen.add(stage);const dad=h.chapter.dad,p=me(),at=dad.person.parts.head.getWorldPosition(new THREE.Vector3());at.y-=.42;aim(at);snap('shirt-'+stage);}
 steps++;};
 for(let i=0;i<110*30&&!A.C.flags.bagged;i++){advance(1/30);watch();}
 metrics.cloth={pinError,transfer,maxStrain,fall,steps,stages:[...seen],stats:{...A.cloth.stats}};
 check('Cloth: natural scene reaches every pickup/fold/transfer/bag stage',()=>assert.deepEqual([...seen],['lift','cradle','fold','offer','receive','bag']));
 check('Cloth: gravity creates a hanging span of at least 25 cm',()=>assert.ok(fall>.25));
 check('Cloth: vertices stay finite and pinned points follow actual hands',()=>{assert.ok(finite);assert.ok(pinError<.001,'pin error '+pinError);});
 check('Cloth: transfer does not jump a vertex farther than 20 cm',()=>assert.ok(transfer<.20,'max transfer '+transfer));
 check('Cloth: bagging completes and hides the shirt',()=>{assert.ok(A.C.flags.bagged);assert.equal(A.SHIRT.obj.visible,false);assert.equal(A.C.inv.shirt,'reyes');});
 snap('shirt-bagged');
 }
 if(part==='all'||part==='restore'){
 h.jump('c5-garage');advance(.1);const people=[h.self,h.chapter.companions.list.jamie.person,h.chapter.companions.list.sam.person,h.chapter.dad.person,h.chapter.officer2.person],saved=people.map(p=>Object.fromEntries(Object.entries(p.parts).map(([k,m])=>[k,[m.geometry,m.material]])));
 h.jump('c6-anomaly');advance(1);check('Cast: Jamie and his double share the same reconstructed identity',()=>assert.equal(A.cast.JAMIE2.art6.model,A.appearances6.get(h.chapter.companions.list.jamie.person).model));
 const double=A.cast.JAMIE2.art6.face,normal=A.appearances6.get(h.chapter.companions.list.jamie.person).face;
 let blinks=0,wrongBlinks=0;for(let t=0;t<8;t+=1/30){normal.update(1/30,{clock:t});double.update(1/30,{clock:t,cursed:true});blinks+=normal.eyes[0].whites.scale.y<.002;wrongBlinks+=double.eyes[0].whites.scale.y<.002;}
 check('Cast: normal Jamie blinks; the double holds eye contact without blinking',()=>{assert.ok(blinks>0);assert.equal(wrongBlinks,0);});
 h.jump('c5-garage');advance(.2);check('Restoration: earlier chapter geometry and materials restore exactly',()=>people.forEach((p,i)=>Object.entries(p.parts).forEach(([k,m])=>{assert.equal(m.geometry,saved[i][k][0],k+' geometry');assert.equal(m.material,saved[i][k][1],k+' material');})));
 check('Restoration: Chapter Six rooms, foyer and character details detach or hide',()=>{assert.equal(A.props.rescueSeat.parent,null);assert.equal(A.props.blanket.parent,null);assert.equal(A.home.root.parent,null);assert.equal(A.threshold.root.parent,null);assert.equal(A.works.root.parent,null);for(const art of A.appearances6.values())assert.equal(art.enabled,false);});snap('chapter5-restored');
 }
 if(part==='anomaly'){
  h.jump('c6-anomaly');advance(.2);const J=A.JAM;X.rideTo([[J.drive.x+2.5,J.drive.z+2.5]],20,1.5);X.brake();X.offBike();
  approach({x:J.step.x+(J.step.x-J.door.x)*1.8,z:J.step.z+(J.step.z-J.door.z)*1.8},.8);until(()=>A.C.anom.shown,60);
  until(()=>{faceV({x:J.foyer.x,y:(J.foyer.y||0)+1.6,z:J.foyer.z});return A.C.flags.anomSeen&&A.C.anom.seen>1.3;},20);snap('jamie-double');
  check('Horror: the double is seen in the doorway while real Jamie remains outside',()=>{assert.ok(A.C.flags.anomSeen);assert.ok(A.state.jamie2);assert.ok(h.chapter.companions.list.jamie.person.group.visible);});
  const j=h.chapter.companions.list.jamie;until(()=>{faceV({x:j.px,y:1.4,z:j.pz});return A.C.anom.gone;},8);check('Horror: the double vanishes when the player looks away',()=>assert.ok(A.C.anom.gone));
 }
 if(['below','flood','after'].includes(part)){
  playChapterSix(T,'Rendered '+part,{from:part,to:part});
  if(part==='after'){
   h.jump('c6-aftermath');advance(6);const j=h.chapter.companions.list.jamie,pelvis=j.person.parts.pelvis.getWorldPosition(new THREE.Vector3());faceV({x:j.px,y:j.py+.85,z:j.pz});advance(.1);snap('emergency-aftermath');
   const seat=A.props.rescueSeat,top=seat.position.y+seat.scale.y;
   check('Aftermath: the blanket wraps Jamie and a stool supports his seated pose',()=>{assert.equal(A.props.blanket.parent,j.person.parts.torso);assert.ok(A.props.blanket.visible);assert.ok(seat.parent);assert.ok(Math.abs(pelvis.y-top-.07*j.person.scale)<.03);});
   h.jump('c5-garage');advance(.2);check('Aftermath: blanket and stool detach on earlier-chapter return',()=>{assert.equal(A.props.blanket.parent,null);assert.equal(seat.parent,null);});
  }
 }
 return metrics;
}
export default runReconstruction;
