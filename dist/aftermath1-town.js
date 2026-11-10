// Aftermath I, Act III: the places they left. Oak Hollow Drive as Chapter Eight left it, five days and then weeks older
// (aftermath1-street.js), and the houses along it.
//
//  8. Thursday, September 1. Behind the fence, with Reyes: the gate below Summerfield; the paint on the doors; a gas crew who
//     needs a minute (stop when he says stop); Sam's house; as far as the barricade at the trench, and what is past it.
//  9. The same morning. Two bikes under the streetlight across from Sam's, where the four of you left them that Friday night.
//     Jamie's on its side. Alex's bell. What Sam's father carries out of the house. Walking them out.
// 10. Friday. Jamie's porch: his bike back where he leaves it; a drawing of a dog that does not exist; a question. Alex's
//     garage: the bike on its hooks; the pictures his father printed; his room, if you go up, and a question you can leave.
// The two remembrances and Sam's chain (scenes 11 and 12) are aftermath1-memorial.js; October is aftermath1-leaving.js.
// Nobody is saved here, and nothing comes up out of the ground. The worst of it is how ordinary the street is now.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {heading} from './route.js';
import {ACT} from './chapter8-acting.js';
import {ACT9,G,asC} from './aftermath1-acting.js';
import {tex9} from './aftermath1-props.js';
import {createStreet9} from './aftermath1-street.js';
import {tourPoster,texOf} from './chapter7-props.js';
import {makeCameraModel} from './alex-camera.js';
import {dressCamera} from './chapter5-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {P as PP,newPose,copyPose,applyPose,poseBike,gripPos} from './rig.js';
import {memorialActs} from './aftermath1-memorial.js';
import {leavingActs} from './aftermath1-leaving.js';

export function townActs(H){
 const {o,k,C,S,ch7,ch8,STREET,phys,comp,brain,sam,cast,EVERYONE,sound,gy,light,lightsOn,checkpoint,later,mark,say,SM,Y,N,V,R,JM,AD,AM,SD,person,
  task,wait,until,lines,quiet,offer,unoffer,V3,lookingAt,pose,unpose,posed,looking,holding,pageMesh,choosing,me,go,objective,busy,nav,camera,scene,world,
  stand,joinFoot,leave,minds,setDay,dayWorld,keep,cry,weep,feel,mood,applyGrief,headOf,pinSam,PIN,capTo,CAP,capWithHer,MRSH,ACT2}=H;
 const {reyes,samDad,samMom,jamieMom,alexDad,alexMom,mrsH,mrH,lily,pruitt,davis,mom,vol,extras}=cast;
 const [vol1,vol2,vol3,vol4,vol5,huang,delaney,pruitt3,okafor]=extras;
 const toNext=ACT2.toNext;
 const ST9=createStreet9({scene,world,nav,ch8,STREET}),SP=ST9.SP;
 const B7=ch7.cast?.studio||{};// the four bikes (Chapter Seven's, as Chapter Eight left them): Alex's and Jamie's are still on the street
 const LILY=person('LILY',lily),CREW=(t,x={})=>V('GAS CREW',t,x);
 const D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const placeMe=(q,a)=>o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:null});
 const dNow=()=>ch8.ruin.locate(me().x,me().z).d;
 // ---- people, here (world points) ------------------------------------------------------------------------------------------------
 function putW(a,q,h=0,g=null,{noBlock=false}={}){if(!a)return;a.show(true);a.place(q.x,q.z,h);a.gest(g);a.lookAt=null;a.noBlock=noBlock;a.routine=null;}
 // the people working on the street: an orange vest, a hard hat (taken off when the chapter resets)
 const WORN=[];
 const vestM=new THREE.MeshStandardMaterial({color:0xe4ef3e,roughness:.7,side:THREE.DoubleSide}),stripeM=new THREE.MeshStandardMaterial({color:0xd8dcdc,roughness:.3,metalness:.5}),hatM=new THREE.MeshStandardMaterial({color:0xf2c418,roughness:.45});
 vestM.name='a1-vest';hatM.name='a1-hardhat';
 function hiVis(a,{hat=true}={}){if(!a?.person||a.worn?.vest)return;const g=new THREE.Group();g.name='a1-vest';const v=new THREE.Mesh(new THREE.CylinderGeometry(.188,.206,.44,14,1,true),vestM);v.scale.set(1,1,.76);v.position.y=-.02;g.add(v);
  for(const y of [-.12,.06]){const s=new THREE.Mesh(new THREE.CylinderGeometry(.192+(y<0?.012:.004),.196+(y<0?.012:.004),.03,14,1,true),stripeM);s.scale.set(1,1,.77);s.position.y=y;g.add(s);}
  a.person.parts.torso.add(g);(a.worn||={}).vest=g;WORN.push([a,'vest',g]);
  if(hat){const h=new THREE.Group();h.name='a1-hardhat';const d=new THREE.Mesh(new THREE.SphereGeometry(.112,14,8,0,Math.PI*2,0,Math.PI/2),hatM);d.scale.set(1,.86,1.1);h.add(d);const b=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.012,16),hatM);b.position.set(0,.004,-.012);b.scale.set(1,1,1.12);h.add(b);
   h.position.set(0,.05,.004);a.person.parts.head.add(h);a.worn.hat=h;WORN.push([a,'hat',h]);}}
 function unwear(){for(const [a,kk,g] of WORN){g.removeFromParent();if(a.worn)delete a.worn[kk];}WORN.length=0;}
 // a walk with Reyes: he goes to each point and waits there, turned back toward you, until you are close
 function* lead(a,pts,{speed=1.15,ahead=5.5,patience=45,each=null}={}){for(const [i,q] of pts.entries()){let done=false;a.walk([[q.x,q.z]],{speed,then:()=>{done=true;}});yield* until(()=>done,60);each?.(i);
   a.lookAt=camera.position;yield* until(()=>Math.hypot(me().x-a.x,me().z-a.z)<ahead,patience);a.lookAt=null;}}
 // the people at work on the street (September): a surveyor at Summerfield, the gas crew at the Kowalskis' curb, two on the trench
 const TRIPOD=(()=>{const g=new THREE.Group();g.name='a1-total-station';const m=new THREE.MeshStandardMaterial({color:0xd8b23a,roughness:.5}),dk=new THREE.MeshStandardMaterial({color:0x2a2c2e,roughness:.4});
  for(let i=0;i<3;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.014,.01,1.5,6),m);const a=i*2.094;l.position.set(Math.sin(a)*.24,.7,Math.cos(a)*.24);l.rotation.set(Math.cos(a)*.32,0,-Math.sin(a)*.32);g.add(l);}
  const head=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.14),dk);head.position.y=1.5;g.add(head);const lens=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.12,10),dk);lens.rotation.x=Math.PI/2;lens.position.set(0,1.53,-.1);g.add(lens);g.visible=false;scene.add(g);return g;})();
 function crews(state){unwear();TRIPOD.visible=false;
  if(state==='september'){
   const sv=vol1;if(sv){const q=SP(889.5,-2.4);putW(sv,q,headingTo(q.x,q.z,SP(872,-.4).x,SP(872,-.4).z),'fold');hiVis(sv);const t=SP(888.8,-1.6);TRIPOD.position.set(t.x,t.y,t.z);TRIPOD.rotation.y=-headingTo(t.x,t.z,SP(872,-.4).x,SP(872,-.4).z);TRIPOD.visible=true;}
   const g1=okafor,g2=huang;if(g1){const q=SP(943,-6.8);putW(g1,q,headingTo(q.x,q.z,SP(941.4,-5.6).x,SP(941.4,-5.6).z),G(ACT.kneel({side:1,lookPitch:-.5})));hiVis(g1);}
   if(g2){const q=SP(938.6,-4.4);putW(g2,q,headingTo(q.x,q.z,SP(941.4,-5.6).x,SP(941.4,-5.6).z),'radio');hiVis(g2);}
   const t1=vol2,t2=vol4;if(t1){const q=SP(1047,-3.4);putW(t1,q,heading(1047)+.4,'point');hiVis(t1);}if(t2){const q=SP(1050.5,5.6);putW(t2,q,heading(1050)-.8,'fold');hiVis(t2);}}}
 // ---- the four bikes' two: Alex's (his bell) and Jamie's (on its side, its back tire flat) -----------------------------------------
 const BK={alex:B7.alex?.bike||null,jamie:B7.jamie?.bike||null};
 const SH=world.homes.sam;
 const bikeSpot={alex:{d:SH.drivD-3.9,lat:3.4},jamie:{d:SH.drivD-2.3,lat:4.3}};// (Chapter Eight's own row: Alex, Jamie, Sam, you)
 const BS={};// how each bike is being shown: {mode:'park'|'lying'|'up'|'walk'|'samWalk'|'bed'|'hook'|'rail'|'walkway', k (0..1 standing up), ...}
 function bikeAt(kk){const s=bikeSpot[kk],q=SP(s.d,s.lat),q2=SP(s.d+5,s.lat);return {x:q.x,y:q.y,z:q.z,a:headingTo(q.x,q.z,q2.x,q2.z)};}
 function showBike(kk,mode,o2={}){const b=BK[kk];if(!b)return;if(!mode){b.group.visible=false;delete BS[kk];return;}b.group.visible=true;BS[kk]={mode,k:mode==='lying'?0:1,t:0,...o2};
  if(mode==='park'||mode==='lying'){const q=o2.at||bikeAt(kk);BS[kk].at=q;b.group.position.set(q.x,q.y,q.z);}
  b.kickstand=mode==='park'?1:0;b.steerAngle=mode==='park'?.32:0;poseBike(b);}
 const _bw=new THREE.Vector3(),_gp=new THREE.Vector3();
 function updateBikes(dt){for(const [kk,st] of Object.entries(BS)){const b=BK[kk];if(!b)continue;st.t+=dt;const g=b.group;
   if(st.mode==='park'){g.rotation.set(0,-st.at.a,.12);}
   else if(st.mode==='lying'||st.mode==='up'){if(st.mode==='up')st.k=Math.min(1,st.k+dt/1.1);const u=smooth(st.k),q=st.at;g.position.set(q.x,q.y+.16*(1-u),q.z);g.rotation.set(0,-q.a,lerp(1.42,.12,u));b.kickstand=u>.8?1:0;b.steerAngle=lerp(.9,.32,u);poseBike(b);if(st.k>=1)st.mode='park';}
   else if(st.mode==='walk'||st.mode==='samWalk'){// beside you (at your right), or beside Sam: rolled as you go, its bars in your hands
    const p=st.mode==='walk'?me():{x:sam.px,z:sam.pz,a:sam.pa},a=p.a,rx=Math.cos(a),rz=Math.sin(a),fx=Math.sin(a),fz=-Math.cos(a);
    const side=st.mode==='walk'?.44:.5,fwd=st.mode==='walk'?.18:-.05,x=p.x+rx*side+fx*fwd,z=p.z+rz*side+fz*fwd;
    const moved=Math.hypot(x-(st.lx??x),z-(st.lz??z));st.lx=x;st.lz=z;b.wheel=(b.wheel||0)+moved/(b.geom?.wheelR||.3);b.crankAngle=(b.crankAngle||0)+moved*.4;
    g.position.set(x,gy(x,z),z);g.rotation.set(0,-a,.03);b.steerAngle=damp(b.steerAngle||0,0,4,dt);b.kickstand=0;poseBike(b);
    if(st.flat&&moved>.01){st.flap=(st.flap||0)+moved;if(st.flap>1.9){st.flap=0;sound('tap',{x,y:.2,z},{gain:.16});}}}
   else if(st.mode==='at'){const q=st.at;g.position.set(q.x,q.y,q.z);g.rotation.set(q.rx||0,q.ry||0,q.rz||0,q.order||'XYZ');b.kickstand=q.kick?1:0;b.steerAngle=q.steer||0;poseBike(b);}
   else if(st.mode==='move'){// carried from one place to another (into a truck's bed, up onto a hook)
    st.k=Math.min(1,st.k0+(st.t/(st.dur||1.4)));const u=smooth(st.k),A2=st.from,B2=st.to;g.position.set(lerp(A2.x,B2.x,u),lerp(A2.y,B2.y,u)+Math.sin(u*Math.PI)*(st.lift||.4),lerp(A2.z,B2.z,u));
    g.rotation.set(lerp(A2.rx||0,B2.rx||0,u),A2.ry+wrap((B2.ry||0)-A2.ry)*u,lerp(A2.rz||0,B2.rz||0,u),B2.order||'XYZ');b.kickstand=0;b.steerAngle=lerp(A2.steer||0,B2.steer||0,u);poseBike(b);
    if(st.k>=1){BS[kk]={mode:'at',at:B2,t:0};st.then?.();}}}}
 const bikePose=kk=>{const g=BK[kk]?.group;return g?{x:g.position.x,y:g.position.y,z:g.position.z,rx:g.rotation.x,ry:g.rotation.y,rz:g.rotation.z,steer:BK[kk].steerAngle||0}:null;};
 function moveBike(kk,to,{dur=1.4,lift=.4,then=null}={}){const from=bikePose(kk);if(!from)return;BS[kk]={mode:'move',from,to,t:0,k0:0,k:0,dur,lift,then};}
 // your hands on the bars of the one you are walking (physical.js's arm pass)
 function barArms(p,{toLocal:tl}){const st=Object.values(BS).find(s=>s.mode==='walk');if(!st)return;const kk=Object.keys(BS).find(q=>BS[q]===st),b=BK[kk];if(!b)return;b.group.updateMatrixWorld(true);
  for(const [side,o2,e,ex] of [[1,PP.rh,PP.re,.7],[-1,PP.lh,PP.le,-.7]]){gripPos(b.steerAngle||0,side,_gp,b.geom);_bw.copy(_gp).applyMatrix4(b.group.matrixWorld);const L=tl(_bw.clone());p[o2]=L.x;p[o2+1]=L.y;p[o2+2]=L.z;p[e]=ex;p[e+1]=-.5;p[e+2]=.3;}}
 function walkBike(kk,on,o2={}){if(on){showBike(kk,'walk',o2);if(phys&&!phys.ME.extra.includes(barArms))phys.ME.extra.push(barArms);}else{const i=phys?.ME.extra.indexOf(barArms);if(i>=0)phys.ME.extra.splice(i,1);}}
 // Sam, walking one beside him: his hands on its bars (drawn after the companions' pass)
 const _sp=newPose();
 function samBars(){if(!Object.values(BS).some(s=>s.mode==='samWalk')||sam.gone||PIN.q||sam.mode!=='foot')return;copyPose(_sp,sam.pose);ACT9.grips({k:1})(_sp,{clock:C.t});
  const g=C.grief||0;_sp[PP.lean]+=.1*g;_sp[PP.hp]-=.2*g;applyPose(sam.person,_sp);sam.posedAt=C.t;}
 // the bell on Alex's bars: its lever thumbed down and back; the sound of it (an ordinary bell: aftermath1's own, not Chapter Three's)
 function bellAt(){const b=BK.alex;if(!b)return null;b.group.updateMatrixWorld(true);return b.bell.lever.getWorldPosition(new THREE.Vector3());}
 function ring(n=2){const b=BK.alex;if(!b)return;const at=bellAt();sound('a1Bell',at,{gain:.8});for(let i=0;i<n;i++){later(i*.16,()=>{b.bell.lever.rotation.x=-.5;});later(i*.16+.08,()=>{b.bell.lever.rotation.x=0;});}mark('the bell: twice');}
 // ---- the street, as a place to be --------------------------------------------------------------------------------------------------
 function streetWorld(state,{sky='clear',evening=false}={}){dayWorld({evening});o.hideWorld?.(false);o.bikeAway?.(true);ST9.show(state);crews(state);C.where='street';C.sky=sky;C.inside=0;C.insideWant=0;C.cave=.46;C.fill=.72;
  lightsOn(true);for(let i=0;i<6;i++)light(i,null);minds('relaxed');k.carA.show(false);k.carB.show(false);}
 // ---- scene 8: behind the fence ------------------------------------------------------------------------------------------------------
 const GATE=()=>ST9.GATES[0];
 const SAMWALK=(()=>{const q=SH.toWorld(SH.doorX,SH.stepFront+4.2);return {x:q.x,y:q.ground,z:q.z};})(),SAMSTOOP=(()=>{const q=SH.toWorld(SH.doorX,SH.stepFront+.3);return {x:q.x,y:q.ground,z:q.z};})();
 function returnCast(){const rq=SP(855.2,8.6);putW(reyes,rq,heading(855)+Math.PI);reyes.gest('radio');
  const car=k.carA,cq=SP(843,-3.4),cq2=SP(850,-3.4);car.show(true);car.park(cq.x,cq.z,headingTo(cq.x,cq.z,cq2.x,cq2.z));car.lights=false;car.headlights=false;car.siren=false;
  ST9.park(ST9.pickup,836.5,4.4,0);}
 const LOOKS={// what you can stop and look at on the way, and what is said about it (each once)
  crater:{at:()=>SP(872,-.4,1.2),label:'Look at Summerfield',when:()=>{const d=dNow();return d>857&&d<893;},
   ls:()=>[N('Where Summerfield crossed Oak Hollow there’s a hole with a fence round it. A man in a vest is looking at it through a thing on a tripod.',{time:5.4}),SM('It’s bigger.',{time:1.4,face:'numb'}),R('It’s still settling. That’s what he’s finding out: how much.',{time:3.4})]},
  paint:{at:()=>paintAt(),label:'The paint on the door',when:()=>{const d=dNow();return d>893&&d<990;},
   ls:()=>[SM('What’s that? On the door.',{time:1.8}),R('Search teams. The date they checked the house. Who checked it.',{time:3.4}),R('The number at the bottom is how many people they found inside.',{time:3.4}),{wait:1.6},
    SM('They’re all zeros.',{time:1.8,face:'numb'}),{wait:1},R('They’re all zeros.',{time:1.8})]},
  kowalski:{at:()=>SP(939.4,-17,3),label:'The Kowalskis’ house',when:()=>{const d=dNow();return d>915&&d<965;},
   ls:()=>[N('The Kowalskis’ is a black frame. You can see straight through it to the backyard, to their swing set, which is fine.',{time:5})]},
  kesslers:{at:()=>SP(1026,-17,3),label:'The Kesslers’',when:()=>dNow()>1003,
   ls:()=>[N('The Kesslers’ is a shell. A blue tarp over what’s left of the roof. A sign on the post where the mailbox was.',{time:4.6}),{wait:.6},SM('They weren’t home. Right?',{time:1.8,face:'numb'}),R('They were at the lake. All of them.',{time:2.4})]},
  hendersons:{at:()=>SP(1026,13,1),label:'The Hendersons’',when:()=>dNow()>1003,
   ls:()=>[N('The Hendersons’ front yard is a hole with a fence round it. Their side yard is past it, where you can’t see from here.',{time:5}),{wait:2.4,act:()=>{feel(reyes,'grief',10);}},N('Nobody says anything.',{time:2.2}),{wait:2.4}]},
  lean:{at:()=>SP(1052.3,-16,4),label:'The house at 1052',when:()=>dNow()>1020,
   ls:()=>[N('The house at 1052 is still leaning into the trench, the way it was when you walked past it that morning.',{time:4.6}),N('Somebody has been in and turned its bedroom lamp off.',{time:3.4})]},
  oak:{at:()=>SP(1162,7.6,7),label:'The oak',when:()=>dNow()>1020,cone:.1,r:170,
   ls:()=>[N('And past all of it, at the very end of the street, the oak. Exactly where it was.',{time:4}),{wait:1.6},SM('It doesn’t even look different.',{time:2,face:'numb'}),{wait:1.4},SM('It should look different.',{time:2.2,face:'frustrated'})]},
 };
 const _pq=new THREE.Vector3();
 function paintAt(){const p=me();let best=null,bd=1e9;for(const m of ST9.houses){const Q=m,w=Q.toWorld(Q.doorX??0,Q.depth/2),dd=Math.hypot(w.x-p.x,w.z-p.z);if(dd<bd){bd=dd;best={x:w.x,y:w.ground+1.8,z:w.z};}}return best;}
 function lookOffer(id){const L=LOOKS[id];offer('look-'+id,L.label,L.at,{r:L.r??60,look:true,size:id==='oak'?2:1.2,cone:L.cone??.12,when:()=>L.when()&&!busy()&&!C.flags['seen-'+id],once:true,
  fn:()=>{C.flags['seen-'+id]=true;C.looked=(C.looked||0)+1;say(L.ls());mark('looked: '+id);}});}
 function sceneReturn(from='jump'){go('a1-return');streetWorld('september');setDay('SEPTEMBER 1',10.1,'clear');C.skyK={};C.grief=.62;applyGrief();
  C.amb={traffic:.04,insects:.32,wind:.25,life:.28,forest:0,tunnel:0,water:0};
  const st=SP(845.6,7.2);placeMe(st,heading(846));joinFoot(sam,SP(844.6,9.4),heading(846));weep(sam,'numb',40);
  putW(samDad,SP(846.4,10.8),heading(846)+.2);feel(samDad,'tired',30);returnCast();showBike('alex','park');showBike('jamie','lying');
  checkpoint('a1-return');C.fadeIn=0;C.fadeInDur=2.6;
  task('return',(function*(){
   yield* lines([{wait:1.8},N('There’s a fence all the way across Oak Hollow now, just below Summerfield. Chain-link on concrete feet, a gate, a sign.',{time:5}),{wait:.6},
    N('Above it, the street goes on up the hill, the same as always, except it isn’t.',{time:3.6})]);
   objective('Officer Reyes.','At the gate.');
   yield* until(()=>D(me(),reyes)<6||C.pt>45,60);reyes.gest(null);reyes.lookAt=camera.position;
   yield* lines([R('Morning.',{time:1.2}),R('Here’s how this works. You stay on the sidewalk. You walk where I walk.',{time:3.6}),R('If I say stop, you stop. Not in a minute. Right then.',{time:3.2}),{wait:.6},R('Okay?',{time:1})]);
   const ok=yield* choosing([{id:'okay',label:'“Okay.”'},{id:'nod',label:'Nod'}],{timeout:9,fallback:'nod'});
   yield* lines([ok==='okay'?Y('Okay.',{time:1}):N('You nod.',{time:1.4}),{wait:.4},SD('Twenty minutes. I just need some of his things.',{time:2.6}),{wait:.4},SD('And a couple of— some things.',{time:2.2})]);
   // the padlock; the gate
   {const g=GATE(),q=SP(856.2,9.9);reyes.walk([[q.x,q.z]],{speed:1,then:a=>{a.faceTo(SP(857,9.85).x,SP(857,9.85).z);a.gest('point');}});}
   yield* until(()=>!reyes.walking,8);sound('chain',SP(857,9.6,1.1),{gain:.7});yield* wait(.8);sound('fence',SP(857,10.2,1),{gain:.6});C.gateWant=1;reyes.gest(null);
   objective('Walk with Reyes.','Through the gate. Stay on the sidewalk.');for(const id of ['crater','paint','kowalski'])lookOffer(id);
   // up the east side, past Summerfield; the paint
   yield* lead(reyes,[SP(860,9.9),SP(870,10.4),SP(884,10.2),SP(896,6.8),SP(910,6.4)],{each:i=>{if(i===1&&!busy())say([N('Reyes walks slow. He looks at everything before he lets you near it.',{time:3.6})]);}});
   if(!C.flags['seen-paint']&&!busy()){C.flags['seen-paint']=true;unoffer('look-paint');say(LOOKS.paint.ls());}
   yield* quiet(20);
   // the gas crew: stop when he says
   yield* lead(reyes,[SP(926,6.4)]);
   const crew=huang;if(crew){crew.gest('wave');crew.lookAt=headOf(reyes);}
   yield* lines([CREW('Officer! Hold them there a minute. We’re bleeding the line.',{time:3})]);
   reyes.gest('brace');reyes.lookAt=camera.position;C.stopAt={x:me().x,z:me().z};
   yield* lines([R('Stop. Right there.',{time:1.6})]);objective('Stop.','');
   C.flags.stopped=false;{let e=0,moved=false;while(e<4.4){yield;e+=C.dt;const p=me();if(Math.hypot(p.x-C.stopAt.x,p.z-C.stopAt.z)>1.6){moved=true;break;}}
    if(moved){C.flags.didntStop=true;mark('did not stop');yield* lines([R('Hey. I said stop.',{time:1.6})]);C.stopAt={x:me().x,z:me().z};}else{C.flags.stopped=true;mark('stopped when he said');}}
   C.gasOn=true;if(crew)crew.gest('radio');
   yield* lines([{wait:1.6},N('Across the street, a hiss, low, from the curb. A man in a vest kneels by it with a wrench.',{time:4}),{wait:2.4}]);
   if(!C.flags['seen-kowalski']&&!busy()){C.flags['seen-kowalski']=true;unoffer('look-kowalski');say(LOOKS.kowalski.ls());yield* quiet(12);}
   yield* wait(2.4);C.gasOn=false;yield* lines([CREW('Okay. You’re good.',{time:1.6}),R('Thank you.',{time:1}),{wait:.4},R('Okay. Go on.',{time:1.2})]);reyes.gest(null);if(crew){crew.gest('radio');crew.lookAt=null;}
   objective('Walk with Reyes.','Up to Sam’s.');
   yield* lead(reyes,[SP(945,6.2),SP(964,6.2),SP(982,4.8),SAMWALK],{speed:1.2});
   // Sam's house
   reyes.faceTo(SAMSTOOP.x,SAMSTOOP.z);{const q={x:SAMWALK.x-.9,z:SAMWALK.z+.6};samDad.walk([[q.x,q.z]],{speed:1.3,then:a=>a.faceTo(SAMSTOOP.x,SAMSTOOP.z)});}
   yield* until(()=>D(me(),SAMWALK)<9,40);
   yield* lines([N('Sam’s house. There’s paint on his door too. A yellow sign on the post: RESTRICTED. Entry for belongings by escort only.',{time:5}),{wait:.6},
    R('Twenty minutes. Upstairs is fine. Not the garage, and not the basement stairs.',{time:3.6}),SD('Got it.',{time:1}),{wait:.6},SD('Sam? You want to come in with me?',{time:2}),
    {wait:1.6},SM('...No.',{time:1.2,face:'numb'}),{wait:.6},SD('Okay. Okay, bud.',{time:1.6,face:'tired'})]);
   {const a=SAMSTOOP;samDad.walk([[a.x,a.z]],{speed:1.1,then:q=>{q.show(false);sound('doorOpen',SAMSTOOP,{gain:.5});}});}
   yield* wait(2.2);
   yield* lines([R('Come on. I’ll show you where the line is.',{time:2.2})]);objective('Walk with Reyes.','As far as the barricade.');
   for(const id of ['kesslers','hendersons','lean','oak'])lookOffer(id);
   // past the bikes (on the way back, he says)
   yield* lead(reyes,[SP(1000,-1.2)],{speed:1.1});
   yield* lines([{wait:.4,act:()=>{sam.lookAt=V3(SP(999.4,3.8,.6));}},SM('...They’re still here.',{time:1.6,face:'grief'}),R('On the way back. I promise.',{time:2})]);sam.lookAt=null;
   yield* lead(reyes,[SP(1020,-1.6),SP(1037.6,-1.2)],{speed:1.05});reyes.faceTo(SP(1050,0).x,SP(1050,0).z);
   yield* until(()=>dNow()>1031||C.pt>900,60);
   yield* lines([N('ROAD CLOSED. UNSTABLE GROUND. Past the barricade the street just stops.',{time:3.6}),{wait:.4},R('This is as far as anybody goes. Me too.',{time:2.4})]);
   objective('The barricade.','Look as long as you want.');
   // you choose what to look at here; when you have (or after a while), down to the bikes
   {const t0=C.pt,n0=C.looked||0;let lastN=n0,lastT=C.pt;
    yield* until(()=>{const n=C.looked||0;if(n!==lastN){lastN=n;lastT=C.pt;}if(busy())lastT=Math.max(lastT,C.pt-.01);const seen=n-n0;
     return seen>=4||(seen>=2&&C.pt-lastT>14)||C.pt-t0>75||(seen>=1&&dNow()<1022);},90);}
   yield* quiet(14);
   if(!C.flags['seen-oak']){C.flags['seen-oak']=true;unoffer('look-oak');say([N('Past all of it, at the very end of the street: the oak. Exactly where it was.',{time:4})]);yield* quiet(8);}
   for(const id of Object.keys(LOOKS))unoffer('look-'+id);
   yield* lines([{wait:1.2},N('When you turn round, Sam isn’t next to you. He’s gone back down the street. He’s standing by the bikes.',{time:4.6})]);
   leaveToBikes();objective('The bikes.','Across from Sam’s.');
   yield* until(()=>D(me(),bikeAt('jamie'))<4.2,240);
   sceneRemained('walk');})());}
 function leaveToBikes(){const q=SP(bikeSpot.jamie.d-.6,1.8);stand(sam,q,{look:()=>V3(SP(bikeSpot.jamie.d,bikeSpot.jamie.lat,.3)),max:1.2});weep(sam,'grief',30);
  {const rq=SP(1006,-4.2);reyes.walk([[rq.x,rq.z]],{speed:1,then:a=>{a.faceTo(sam.px,sam.pz);a.gest('fold');}});}}
 // ---- scene 9: under the streetlight ----------------------------------------------------------------------------------------------------------
 const SDAD=()=>samDad;
 // what Sam's father carries out of the house: a laundry basket, the box fan, the Tour de Oak Hollow on top
 const BASKET=(()=>{const g=new THREE.Group();g.name='a1-basket';const w=new THREE.MeshStandardMaterial({color:0xe8e4d8,roughness:.8}),cl=[0x3d5a7a,0x8a3a32,0xc8c2b0,0x4a4a4a];
  const b=new THREE.Mesh(new THREE.BoxGeometry(.56,.3,.4),w);b.position.y=.15;g.add(b);for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(.22+(i%2)*.1,.06,.18),new THREE.MeshStandardMaterial({color:cl[i],roughness:1}));c.position.set(-.13+(i%2)*.24,.3+Math.floor(i/2)*.05,-.06+(i>>1)*.1);c.rotation.y=i*.6;g.add(c);}
  const roll=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.6,10),new THREE.MeshStandardMaterial({color:0xf3efe2,roughness:.9}));roll.rotation.z=Math.PI/2;roll.position.set(0,.4,.04);roll.name='a1-tour-roll';g.add(roll);g.userData.roll=roll;g.visible=false;scene.add(g);return g;})();
 const FAN9=(()=>{const g=new THREE.Group();g.name='a1-sams-fan';const fr=new THREE.MeshStandardMaterial({color:0x2f3a46,roughness:.6}),gr=new THREE.MeshStandardMaterial({color:0x9a9c9e,roughness:.4,metalness:.4});
  const f=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.12),fr);f.position.y=.25;g.add(f);const gd=new THREE.Mesh(new THREE.CircleGeometry(.21,24),gr);gd.position.set(0,.25,.062);g.add(gd);g.visible=false;scene.add(g);return g;})();
 const tourG=(()=>{let g=null;return ()=>{if(g)return g;g=new THREE.Group();g.name='a1-tour';const f=pageMesh(texOf(tourPoster('front')),{w:.6,h:.4,color:0xf3efe2}),b=pageMesh(texOf(tourPoster('back')),{w:.6,h:.4,color:0xf3efe2});b.rotation.y=Math.PI;g.add(f,b);return g;};})();
 function remainedSetup(){streetWorld('september');setDay('SEPTEMBER 1',10.42,'clear');C.grief=.62;applyGrief();C.amb={traffic:.04,insects:.32,wind:.25,life:.28,forest:0,tunnel:0,water:0};
  returnCast();C.gateWant=1;GATE()?.set(1);showBike('alex','park');showBike('jamie','lying');
  const yq=SP(bikeSpot.jamie.d+5.4,1.2);placeMe(yq,headingTo(yq.x,yq.z,SP(bikeSpot.jamie.d,bikeSpot.jamie.lat).x,SP(bikeSpot.jamie.d,bikeSpot.jamie.lat).z));
  joinFoot(sam,SP(bikeSpot.jamie.d-.6,1.8),heading(1000));leaveToBikes();reyes.show(true);{const rq=SP(1006,-4.2);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,sam.px,sam.pz));reyes.gest('fold');}
  samDad.show(false);}
 function sceneRemained(from='jump'){go('a1-remain');if(from!=='walk'){remainedSetup();C.fadeIn=0;C.fadeInDur=2;}
  checkpoint('a1-remained');for(const id of Object.keys(LOOKS))unoffer('look-'+id);
  task('remained',(function*(){
   yield* lines([{wait:.6},N('Two bikes under the streetlight across from Sam’s. Where the four of you left them on Friday night, in a row.',{time:5}),{wait:1},
    N('Alex’s is still on its kickstand. Jamie’s is on its side in the gutter, like something knocked it over.',{time:4.4}),{wait:1.4},
    SM('They were right here. The whole time everybody was looking.',{time:3.2,face:'grief'}),{wait:1}]);
   // Jamie's: stood back up
   objective('Jamie’s bike.','Hold F to stand it up.');
   offer('jamie-up','Stand Jamie’s bike up',()=>{const g=BK.jamie?.group.position;return g?{x:g.x,y:g.y+.5,z:g.z}:SP(1000,4,.5);},{r:2.4,hold:1.2,
    tick:(dt,v)=>{if(BS.jamie&&BS.jamie.mode==='lying')BS.jamie.k=v*.25;if(v>.05&&phys&&!phys.playerBusy()&&!C.reachedJ){C.reachedJ=true;const g=BK.jamie.group;phys.playerReach({at:()=>{g.updateMatrixWorld(true);return new THREE.Vector3(0,.7,-.4).applyMatrix4(g.matrixWorld);},dur:[.4,1.2,.5],carry:false,low:true});}},
    fn:()=>{if(BS.jamie){BS.jamie.mode='up';}sound('creak',V3(SP(1000.2,4.3,.4)),{gain:.4});}});
   yield* until(()=>C.flags['jamie-up'],120);if(!C.flags['jamie-up']){unoffer('jamie-up');if(BS.jamie)BS.jamie.mode='up';}
   yield* wait(1.2);
   yield* lines([N(C.keep.cap==='you'?'His bike. The pad on the bars is the same blue as his cap, which is in your pocket.':'His bike. The pad on the bars is the same blue as his cap.',{time:4}),{wait:.6},N('The back tire is flat.',{time:2})]);
   // Alex's bell
   objective('Alex’s bike.','');
   offer('bell','Alex’s bell',()=>bellAt()||SP(998.6,3.4,1),{r:2.2,look:true,size:.14,cone:.2,fn:()=>{ring(2);}});
   yield* until(()=>C.flags.bell,40);
   if(C.flags.bell){keep('bell',true);yield* wait(.6);
    yield* lines([N('Twice. Like at every corner.',{time:2.4}),{wait:1.6},N('The last time you heard it was the twenty-first. At the corner of Briarwood. He waved, and rang it twice, and went round the corner.',{time:5.6}),
     {wait:1.4,act:()=>{weep(sam,'crying',20);}},SM('Don’t.',{time:1,face:'crying'}),{wait:2.6},SM('...No. Do it again.',{time:2,face:'crying'})]);cry(.45,10);
    const ch=yield* choosing([{id:'again',label:'Ring it again'},{id:'leave',label:'Leave it'}],{timeout:14,fallback:'leave'});C.keep.told.bell=ch;keep('told',C.keep.told);
    if(ch==='again'){offer('bell2','Ring it',()=>bellAt()||SP(998.6,3.4,1),{r:2.4,fn:()=>ring(2)});yield* until(()=>C.flags.bell2,10);unoffer('bell2');if(!C.flags.bell2)ring(2);
     yield* lines([{wait:1.4},SM('His dad hated that bell.',{time:2,face:'crying'}),{wait:1},SM('He did it so we’d know where he was.',{time:2.6,face:'crying'}),{wait:2.4}]);}
    else yield* lines([{wait:1.6},N('You leave it. Sam puts one finger on the lever, and doesn’t push it.',{time:3.8}),{wait:2}]);}
   else{unoffer('bell');yield* lines([N('Sam takes Alex’s bike by the bars. His thumb catches the lever and it rings, once, and he stops dead.',{time:5}),{wait:2.4,act:()=>{weep(sam,'crying',16);}},N('Neither of you says anything about it.',{time:2.6}),{wait:1.6}]);}
   // Sam's father, out of the house: the basket; the fan; the Tour
   {const a=SAMSTOOP,b={x:SAMWALK.x,z:SAMWALK.z},c=SP(1001.6,-.6);samDad.show(true);samDad.place(a.x,a.z,headingTo(a.x,a.z,b.x,b.z));sound('doorSlam',SAMSTOOP,{gain:.3});samDad.gest(G(ACT9.holdOut()));C.carry={basket:true};
    samDad.walk([[b.x,b.z],[c.x,c.z]],{speed:1.05,then:q=>{q.faceTo(sam.px,sam.pz);C.flags.dadOut=true;}});}
   yield* until(()=>C.flags.dadOut,25);
   C.carry={basket:false,set:true};samDad.gest(null);
   yield* lines([{wait:.4},SD('I got your— some of your clothes. Your fan.',{time:2.6,face:'tired'}),{wait:1.4},SD('I don’t know why I took the fan.',{time:2.2,face:'tearful'}),{wait:1},SM('It’s okay, Dad.',{time:1.4}),{wait:1.4},
    N('On top of the basket, rolled up: the Tour de Oak Hollow.',{time:3}),SM('...The Tour.',{time:1.4,face:'tearful'})]);
   objective('The Tour de Oak Hollow.','');
   offer('tour','Look at the Tour de Oak Hollow',()=>{const r=BASKET.userData.roll;BASKET.updateMatrixWorld(true);return r.getWorldPosition(new THREE.Vector3());},{r:2.6});
   yield* until(()=>C.flags.tour,30);unoffer('tour');
   if(C.flags.tour){BASKET.userData.roll.visible=false;
    yield* holding(tourG(),[N('The Tour de Oak Hollow. Summer 2010. Official. Sam unrolls it for you and holds the corners.',{time:4.4}),{wait:.6},
     SM('Jamie DNF’d the second one. His chain came off on the hill.',{time:3,face:'tired'}),SM('He said it was sabotage.',{time:1.8}),{wait:1.2},
     SM('Alex wrote “protest” on it five times.',{time:2.4}),{wait:1.6},N('On the back, the rules. Sam’s square printing. Four signatures.',{time:3.4})],{dist:.62,kind:'tour',min:6});
    BASKET.userData.roll.visible=true;}
   yield* lines([{wait:.8},N('Sam rolls it back up. He keeps hold of it.',{time:2.6}),{wait:1.2},R('Okay. Let’s get these out of here.',{time:2.2})]);
   // walking them out: Jamie's with you, Alex's with Sam; down the street to the gate and the truck
   objective('Jamie’s bike.','Walk it out to the truck.');
   offer('take-jamie','Walk Jamie’s bike',()=>{const g=BK.jamie?.group.position;return g?{x:g.x,y:g.y+.8,z:g.z}:null;},{r:2.4});
   yield* until(()=>C.flags['take-jamie'],60);unoffer('take-jamie');walkBike('jamie',true,{flat:true});
   showBike('alex','samWalk');stand(sam,null);sam.follow='walk';brain.enable(sam,true);weep(sam,'grief',60);
   {const q=SP(1004,4.6);samDad.gest(G(ACT9.holdOut()));C.carry={basket:true};samDad.walk([[q.x,q.z],[SP(860,10.4).x,SP(860,10.4).z],[SP(850,9.6).x,SP(850,9.6).z],[SP(838.6,6.6).x,SP(838.6,6.6).z]],{speed:1.2,then:a=>{a.faceTo(SP(836.5,4.4).x,SP(836.5,4.4).z);C.carry={basket:false,truck:true};a.gest(null);}});}
   objective('Down to the gate.','The truck is just outside.');
   reyes.gest(null);
   yield* lead(reyes,[SP(985,4.4),SP(960,6.2),SP(930,6.4),SP(900,6.6),SP(884,10.2),SP(862,9.9),SP(852,8.6)],{speed:1.15,ahead:7,each:i=>{
    if(i===0)say([{wait:1.4},N('His back tire goes flap, flap, flap the whole way down the street.',{time:3.6})]);
    if(i===2)say([{wait:1},SM('I’ll fix his tire.',{time:1.6,face:'tired'}),{wait:2.6},SM('...For who.',{time:1.6,face:'grief'})]);
    if(i===4)say([N('Halfway down, a woman on the far side of the fence is watching you come. She has a hand over her mouth.',{time:4.4})]);}});
   yield* quiet(10);
   // into the truck's bed
   objective('The truck.','Lift it in.');
   const bed=()=>{const g=ST9.pickup;g.updateMatrixWorld(true);return new THREE.Vector3(0,1.3,1.6).applyMatrix4(g.matrixWorld);};
   offer('lift','Lift it into the truck',()=>bed(),{r:3.2,hold:1,fn:()=>{walkBike('jamie',false);const g=ST9.pickup;g.updateMatrixWorld(true);const w=new THREE.Vector3(.35,.98,1.55).applyMatrix4(g.matrixWorld);
     moveBike('jamie',{x:w.x,y:w.y,z:w.z,rx:0,ry:g.rotation.y+Math.PI/2,rz:1.25,steer:.5},{dur:1.2,lift:.6,then:()=>sound('bikeDrop',w,{gain:.4})});}});
   yield* until(()=>C.flags.lift,90);if(!C.flags.lift){unoffer('lift');walkBike('jamie',false);}
   yield* wait(1.4);
   {const g=ST9.pickup;g.updateMatrixWorld(true);const w=new THREE.Vector3(-.4,1.08,1.7).applyMatrix4(g.matrixWorld);moveBike('alex',{x:w.x,y:w.y,z:w.z,rx:0,ry:g.rotation.y-Math.PI/2,rz:-1.2,steer:-.4},{dur:1.4,lift:.6});}
   yield* lines([{wait:1.2},N('Sam’s dad lifts Alex’s in next to it, and ties them both down, and pulls on the rope to check, twice.',{time:4.6}),{wait:1},
    SD('Jamie’s mom’s tomorrow morning. Then Alex’s.',{time:2.6,face:'tired'}),SD('If you want to come.',{time:1.6}),{wait:1.2},SM('We want to come.',{time:1.6}),{wait:2}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-porch');})());}
 // ---- scene 10a: Jamie's porch ------------------------------------------------------------------------------------------------------------------
 const JH=world.homes.jamie,JW=(x,z,y=0)=>{const q=JH.toWorld(x,z),o0=JH.toWorld(0,0);return {x:q.x,y:o0.ground+y,z:q.z};},JA=a=>a-JH.worldRot;// (house frame to world; a heading in the house frame)
 const JP={step:JW(JH.doorX+.32,6.42),rail:JW(JH.doorX+1.32,6.05),walk:JW(JH.doorX,9.4),stand:JW(JH.doorX-.6,8.2),hen:JW(JH.doorX+1.6,8.9),lily:JW(JH.doorX+.6,7.5),curb:JW(JH.doorX,13.6),capStep:JW(JH.doorX-.28,6.36,.36)};
 function porchSetup(){streetWorld('september');setDay('SEPTEMBER 2',10.62,'clear');C.grief=.58;applyGrief();C.amb={traffic:.08,insects:.3,wind:.22,life:.32,forest:0,tunnel:0,water:0};
  // the truck at the curb in front of Jamie's; his bike in its bed
  {const q=SP(JH.drivD-4,4.6);ST9.pickup.position.set(q.x,q.y,q.z);ST9.pickup.rotation.set(0,-heading(JH.drivD)+Math.PI,0);ST9.pickup.visible=true;}
  {const g=ST9.pickup;g.updateMatrixWorld(true);const w=new THREE.Vector3(.35,.98,1.55).applyMatrix4(g.matrixWorld);showBike('jamie','at',{at:{x:w.x,y:w.y,z:w.z,rx:0,ry:g.rotation.y+Math.PI/2,rz:1.25,steer:.5}});}
  const tg=(()=>{const g=ST9.pickup;g.updateMatrixWorld(true);return new THREE.Vector3(0,0,3.6).applyMatrix4(g.matrixWorld);})();
  placeMe({x:tg.x,z:tg.z},headingTo(tg.x,tg.z,JP.walk.x,JP.walk.z));joinFoot(sam,{x:tg.x+.9,z:tg.z+.5},headingTo(tg.x,tg.z,JP.walk.x,JP.walk.z));weep(sam,'tired',40);
  putW(samDad,{x:tg.x-1.1,z:tg.z-.3},headingTo(tg.x,tg.z,JP.walk.x,JP.walk.z));
  // his mother, on the step, a mug she isn't drinking; the porch light on in the daytime
  putW(jamieMom,JP.step,JA(Math.PI),G(ACT9.cup({base:ACT.seat(.4,{lean:.18})})),{noBlock:true});feel(jamieMom,'numb',60);mood(jamieMom,'grief');C.porchOn=true;
  if(C.keep.cap==='mom'){capTo('place',{x:JP.capStep.x,y:JP.capStep.y,z:JP.capStep.z,ry:-JH.worldRot+.4});}}
 function scenePorch(from='jump'){go('a1-porch');porchSetup();checkpoint('a1-porch');C.fadeIn=0;C.fadeInDur=2.6;const jm=jamieMom;
  task('porch',(function*(){
   yield* lines([{wait:1.6},N('Jamie’s house. The porch light is on, in the daytime.',{time:3.4}),{wait:1.4},N('His mom is on the top step with a mug she isn’t drinking.',{time:3.4})]);
   objective('Jamie’s bike.','In the back of the truck.');
   offer('take-bmx','Take Jamie’s bike',()=>{const g=BK.jamie?.group.position;return g?{x:g.x,y:g.y+.3,z:g.z}:null;},{r:3});
   yield* until(()=>C.flags['take-bmx'],60);unoffer('take-bmx');walkBike('jamie',true,{flat:true});
   objective('Up the walk.','');
   yield* until(()=>D(me(),JP.step)<5.2,90);jm.lookAt=camera.position;feel(jm,'tearful',20);
   yield* lines([JM('...Oh.',{time:1.2,face:'tearful'}),{wait:.8},JM('You brought his bike.',{time:1.8})]);
   yield* until(()=>D(me(),JP.step)<3.4,20);
   yield* lines([{wait:.6},JM('He leaves it right in the middle of the walk. Every day. I’ve tripped on it a hundred times.',{time:4.2}),
    JM('I asked him why he can’t put it in the garage like a person. You know what he said?',{time:3.6}),{wait:1.2},JM('“That’s how you know I’m home.”',{time:2.6,face:'tearful'}),{wait:2.4}]);
   // where it goes
   objective('Put it down.','By the rail, or where he left it.');
   offer('rail','Lean it by the rail',()=>V3({x:JP.rail.x,y:JP.rail.y+.7,z:JP.rail.z}),{r:2.4,fn:()=>{placeBike('rail');}});
   offer('walkway','Leave it in the middle of the walk',()=>V3({x:JP.walk.x,y:JP.walk.y+.6,z:JP.walk.z}),{r:2.6,fn:()=>{placeBike('walk');}});
   yield* until(()=>C.flags.rail||C.flags.walkway,60);unoffer('rail');unoffer('walkway');if(!C.flags.rail&&!C.flags.walkway)placeBike('rail');
   const where=C.flags.walkway?'walk':'rail';C.keep.told.bmx=where;keep('told',C.keep.told);objective('Jamie’s mom.','');
   yield* wait(.8);
   if(where==='walk')yield* lines([{wait:.8},N('She looks at it there, in the middle of the walk, for a long time.',{time:3.4}),{wait:1},JM('...Yeah. Right there. Leave it right there.',{time:2.8,face:'crying'}),{wait:1.6}]);
   else yield* lines([{wait:.8},JM('Thank you, honey.',{time:1.6,face:'tearful'}),{wait:1.6}]);
   cry(.35,8);
   // the Hendersons: a drawing
   {const a=JP.curb,b=JP.hen,c=JP.lily;mrsH.show(true);mrsH.place(a.x-1,a.z,headingTo(a.x,a.z,b.x,b.z));mrsH.gest(null);feel(mrsH,'grief',30);mrsH.walk([[b.x,b.z]],{speed:.8,then:q=>q.faceTo(JP.step.x,JP.step.z)});
    lily.show(true);lily.place(a.x-.4,a.z,headingTo(a.x,a.z,c.x,c.z));lily.gest(G(ACT9.holdOut({k:.8})));lily.walk([[b.x+.3,b.z-.4]],{speed:.8,then:q=>{q.faceTo(JP.step.x,JP.step.z);}});C.drawingOn='lily';}
   yield* until(()=>!mrsH.walking,20);
   yield* lines([{wait:.6},N('Mrs. Henderson comes up the walk, slow, with Lily holding her hand.',{time:3.4}),MRSH('We won’t stay. Lily made something. She wanted to bring it herself.',{time:3.6})]);
   {const c=JP.lily;lily.walk([[c.x,c.z]],{speed:.7,then:q=>{q.faceTo(JP.step.x,JP.step.z);C.flags.lilyThere=true;}});}
   yield* until(()=>C.flags.lilyThere,12);
   yield* lines([{wait:.4},LILY('It’s Biscuit.',{time:1.4}),{wait:.4,act:()=>{C.drawingOn='mom';jm.gest(G(ACT9.holdOut({base:ACT.seat(.4,{lean:.2})})));}},{wait:1.4},JM('...Biscuit?',{time:1.4}),{wait:1},
    MRSH('Jamie told her about his dog. When she was hiding. So she’d come out.',{time:3.8}),{wait:2},JM('He doesn’t have a dog.',{time:1.8}),{wait:1.6},
    JM('He has wanted a dog since he was four years old. I said no. Every birthday. Every Christmas.',{time:4.4,face:'tearful'}),{wait:1.2,act:()=>{feel(jm,'crying',20);}},
    N('She laughs. It comes out of her before she can stop it, and then she’s crying, and she’s still laughing a little.',{time:5}),JM('Of course he did. Of course he gave himself a dog.',{time:3,face:'crying'}),
    {wait:1},LILY('He eats socks.',{time:1.4}),{wait:1.2},JM('He eats socks.',{time:1.8,face:'crying'})]);cry(.5,10);
   offer('drawing','Look at Lily’s drawing',()=>V3({x:JP.step.x,y:JP.step.y+.9,z:JP.step.z}),{r:2.8,look:true,size:.3,cone:.25});
   yield* lines([{wait:1.4},MRSH('I don’t know how to— we’re so—',{time:2.4,face:'crying'}),JM('You don’t have to. You don’t have to say anything.',{time:2.6}),{wait:.6},JM('Thank you for bringing it.',{time:2})]);
   {let e=0;while(e<6&&!C.flags.drawing){yield;e+=C.dt;}}
   if(C.flags.drawing){yield* holding(pageMesh(tex9('biscuit'),{w:.3,h:.235}),[N('A brown dog with a long body and a curly tail, in crayon. BISCUIT across the top. For Jamie love Lily.',{time:4.6})],{dist:.42,kind:'drawing',min:3});}
   unoffer('drawing');
   {const a=JP.curb;mrsH.walk([[a.x-1,a.z]],{speed:.8,then:q=>q.show(false)});lily.gest(null);lily.walk([[a.x-.5,a.z]],{speed:.8,then:q=>q.show(false)});}
   yield* wait(2.4);
   // her question; the cap
   jm.gest(G(ACT.seat(.4,{lean:.22,hands:'knees'})));jm.lookAt=camera.position;feel(jm,'tearful',30);
   yield* lines([{wait:1.2},JM('Can I ask you something? You don’t have to answer it.',{time:2.8}),{wait:1.4},JM('Was he scared?',{time:1.6})]);
   const ch=yield* choosing([{id:'anyway',label:'“Yes. He did it anyway.”'},{id:'jokes',label:'“He was making jokes. The whole time.”'},{id:'dunno',label:'“I don’t know.”'},{id:'walk',label:'Go back down the steps'}],{timeout:18,fallback:'dunno'});
   C.keep.told.jamieMom2=ch;keep('told',C.keep.told);
   if(ch==='walk'){objective('','');yield* lines([N('You go back down the steps. You can’t. Not that.',{time:3}),{wait:1.2},JM('It’s okay. Go on, honey.',{time:2,face:'tearful'}),JM('Come back sometime.',{time:1.8})]);}
   else{if(ch==='anyway')yield* lines([Y('Yes.',{time:1}),{wait:1},Y('He did it anyway.',{time:1.8}),{wait:2.4},JM('...Yeah.',{time:1.2,face:'crying'}),JM('That’s him. That’s exactly him.',{time:2.4,face:'crying'})]);
    else if(ch==='jokes')yield* lines([Y('He was making jokes. The whole time.',{time:2.4}),{wait:1.6},JM('Of course he was.',{time:1.8,face:'crying'}),{wait:1},JM('Were they any good?',{time:1.6}),{wait:1.4},Y('...Some of them.',{time:1.6}),{wait:.8},N('That one gets a real laugh out of her.',{time:2.6})]);
    else yield* lines([Y('I don’t know.',{time:1.4}),{wait:1.6},JM('Okay. That’s okay. I don’t either.',{time:2.6})]);
    cry(.5,10);
    if(C.keep.cap==='you'){capTo('hand');yield* capWithHer(jm,'porch',{base:ACT.seat(.4,{lean:.2})});}
    else if(C.keep.cap==='mom')yield* lines([{wait:1},N('His cap is on the step beside her. Like she put it there for him to pick up on the way in.',{time:4.4})]);}
   yield* lines([{wait:1.6},JM('There’s going to be candles. Tomorrow night, on the lawn.',{time:3}),JM('People keep asking me what to do, and I keep saying I don’t know.',{time:3.2}),{wait:1},JM('So. Candles.',{time:1.6}),{wait:2.4}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-driveway');})());}
 function placeBike(where){walkBike('jamie',false);const st=BS.jamie;if(where==='rail'){const r=JP.rail;moveBike('jamie',{x:r.x,y:gy(r.x,r.z),z:r.z,rx:0,ry:-JA(0),rz:.2,steer:.3},{dur:.9,lift:.1});}
  else{const w=JP.walk;moveBike('jamie',{x:w.x,y:gy(w.x,w.z),z:w.z,rx:0,ry:-JA(-Math.PI/2)+.5,rz:1.42,steer:.9},{dur:1,lift:.15,then:()=>sound('bikeDrop',w,{gain:.45})});}void st;}
 // ---- scene 10b: Alex's garage; his room --------------------------------------------------------------------------------------------------------
 const AH=world.homes.alex,AO=AH.toWorld(0,0),AW=(x,z,y=0)=>{const q=AH.toWorld(x,z);return {x:q.x,y:AO.ground+y,z:q.z};},AA=a=>a-AH.worldRot;
 const GZ=AH.gfront-AH.gd/2,GS=AH.gs||1,HOOKX=AH.gx+GS*(AH.gw/2-.2);
 const AP={door:AW(AH.gx,AH.gfront+.2),inG:AW(AH.gx-GS*.6,GZ+.6),dad:AW(AH.gx+GS*.4,GZ+1.6),hook:AW(HOOKX-GS*.14,GZ+.0,1.52),curb:AW(AH.gx,AH.endLat-1.2),me:AW(AH.gx-.4,AH.gfront+3.2),
  mom:AW(AH.doorX+.4,AH.stepFront-.3),porch:AW(AH.doorX,AH.stepFront+.9)};
 const RM=world.interiors['alex-room'],FR=nav.frame;
 const roomLocal=(x,z)=>{const q=FR.project(x,z,127);return AH.localOf(q.u,q.v);};
 const RW=(x,z,y=0)=>{const w=AH.toWorld(x,z);return {x:w.x,z:w.z,y:w.ground+RM.floor+y};};
 const roomZone={inside(x,z){const q=roomLocal(x,z);return q.x>RM.x0-.03&&q.x<RM.x1+.03&&q.z>RM.z0-.03&&q.z<RM.z1+.03;},
  floorAt(x,z){const q=FR.project(x,z,127);return FR.point(q.u,q.v).y+RM.floor;},
  walkable(x,z,r=.28){const q=roomLocal(x,z);if(q.x<RM.x0+r||q.x>RM.x1-r||q.z<RM.z0+r||q.z>RM.z1-r)return false;return !RM.blocks.some(([x0,x1,z0,z1])=>q.x>x0-r&&q.x<x1+r&&q.z>z0-r&&q.z<z1+r);},heading:0};
 const alexGlass=world.merged.filter(m=>m.material===world.alexWindow);
 function roomOn(on){if(on)nav.setRoom(roomZone);else if(nav.room===roomZone)nav.setRoom(null);for(const m of alexGlass)m.visible=!on;o.audio?.()?.indoors?.(on);C.inRoom=on;C.insideWant=on?1:0;if(on)C.inside=1;}
 // his camera on his desk (it came back from Reyes on Tuesday: he copied the card first)
 const CAM9=(()=>{const g=dressCamera(makeCameraModel()).group;g.name='a1-alex-camera';g.visible=false;scene.add(g);return g;})();
 function drivewaySetup(){streetWorld('september');setDay('SEPTEMBER 2',16.4,'clear');C.skyK={p:.22};C.grief=.56;applyGrief();C.amb={traffic:.06,insects:.34,wind:.2,life:.34,forest:0,tunnel:0,water:0};
  world.garages.alex?.set?.(1);
  {const q=AW(AH.gx-1.6,AH.endLat+2.4),q2=AW(AH.gx-12,AH.endLat+2.4);ST9.pickup.position.set(q.x,gy(q.x,q.z),q.z);ST9.pickup.rotation.set(0,-headingTo(q.x,q.z,q2.x,q2.z),0);ST9.pickup.visible=true;}
  {const g=ST9.pickup;g.updateMatrixWorld(true);const w=new THREE.Vector3(-.4,1.08,1.7).applyMatrix4(g.matrixWorld);showBike('alex','at',{at:{x:w.x,y:w.y,z:w.z,rx:0,ry:g.rotation.y-Math.PI/2,rz:-1.2,steer:-.4}});}
  const tg=(()=>{const g=ST9.pickup;g.updateMatrixWorld(true);return new THREE.Vector3(0,0,3.6).applyMatrix4(g.matrixWorld);})();
  placeMe({x:tg.x,z:tg.z},headingTo(tg.x,tg.z,AP.door.x,AP.door.z));joinFoot(sam,{x:tg.x+1,z:tg.z+.4},headingTo(tg.x,tg.z,AP.door.x,AP.door.z));weep(sam,'tired',40);
  putW(samDad,{x:tg.x-1.2,z:tg.z-.2},headingTo(tg.x,tg.z,AP.door.x,AP.door.z));
  putW(alexDad,AP.dad,AA(Math.PI)+GS*.4,'fold');feel(alexDad,'numb',60);mood(alexDad,'grief');alexMom.show(false);
  CAM9.visible=false;keep('camera','parents');}
 function sceneDriveway(from='jump'){go('a1-drive');drivewaySetup();checkpoint('a1-driveway');C.fadeIn=0;C.fadeInDur=2.6;const ad=alexDad,am=alexMom;
  task('driveway',(function*(){
   yield* lines([{wait:1.6},N('Briarwood. The garage is open at Alex’s. His dad is in it, not doing anything, with a rag in his hands.',{time:4.8})]);
   objective('Alex’s bike.','In the back of the truck.');
   offer('take-alex','Take Alex’s bike',()=>{const g=BK.alex?.group.position;return g?{x:g.x,y:g.y+.3,z:g.z}:null;},{r:3});
   yield* until(()=>C.flags['take-alex'],60);unoffer('take-alex');walkBike('alex',true);
   objective('Up the driveway.','');
   yield* until(()=>D(me(),AP.door)<6.5,90);ad.gest(null);ad.lookAt=camera.position;
   {const q=AW(AH.gx,AH.gfront+.9);ad.walk([[q.x,q.z]],{speed:.9,then:a=>{a.faceTo(me().x,me().z);}});}
   yield* lines([AD('...That’s his.',{time:1.4,face:'grief'}),{wait:1},AD('Where was it?',{time:1.4}),{wait:.6},SM('Under the light across from my house. Where we left them.',{time:3}),{wait:.8},AD('All week.',{time:1.4}),SM('...Yeah.',{time:1}),{wait:1.6}]);
   objective('Give it to him.','');
   offer('give-alex','Give him the bike',()=>headOf(ad),{r:2.8,fn:()=>{walkBike('alex',false);}});
   yield* until(()=>C.flags['give-alex'],40);unoffer('give-alex');walkBike('alex',false);
   // up on its hooks, where it hung every night until the twenty-first
   {const h=AP.hook;ad.walk([[AP.inG.x,AP.inG.z]],{speed:.8,then:a=>{a.faceTo(h.x,h.z);a.gest(G(ACT.overhead?ACT.overhead():ACT9.holdOut()));}});
    moveBike('alex',{x:h.x,y:h.y,z:h.z,rx:0,ry:-AA(0)+(GS>0?0:Math.PI),rz:0,steer:0,order:'XYZ'},{dur:3.2,lift:.5,then:()=>{sound('c8Metal',h,{gain:.25});ad.gest(null);C.flags.hung=true;}});}
   yield* until(()=>C.flags.hung,8);
   yield* lines([{wait:.6},N('The bike hangs on its two hooks again, where it hung every night until the twenty-first.',{time:4}),{wait:1.2},
    AD('He asked for these hooks for his birthday. Who asks for hooks?',{time:3.2,face:'grief'}),{wait:2}]);
   ad.walk([[AW(AH.gx,AH.gfront+.9).x,AW(AH.gx,AH.gfront+.9).z]],{speed:.8,then:a=>a.faceTo(me().x,me().z)});
   yield* until(()=>!ad.walking,8);
   yield* lines([AD('Officer Reyes brought his camera back on Tuesday. He copied the card first. He said he had to, and I said that’s fine.',{time:5}),{wait:.6},
    AD('I printed them. All of them. I didn’t know what else to do with my hands.',{time:3.4}),{wait:1.4,act:()=>{ad.gest(G(ACT9.offer({hand:'r'})));}},AD('This one’s yours.',{time:1.4})]);
   objective('The picture.','');
   const print=pageMesh(tex9('sunday'),{w:.24,h:.18,color:0xe8d8b8});
   offer('print','Take the picture',()=>headOf(ad),{r:2.8});
   yield* until(()=>C.flags.print,30);unoffer('print');ad.gest(null);keep('print',true);
   yield* holding(print,[N('Sunday at the oak. The twenty-first, at 7:26. Four bikes in the grass, and three of you, because he was the one holding it.',{time:5.6}),{wait:1},
    AD('He isn’t in any of them. Did you notice that? Hundreds of pictures.',{time:3.2,face:'grief'}),{wait:1.2},AD('Always the one holding it.',{time:2.2,face:'crying'})],{dist:.4,kind:'print',min:4});
   cry(.4,8);
   // his mother, at the front door
   {const a=AP.porch;am.show(true);am.place(a.x,a.z,AA(Math.PI));am.gest(null);am.lookAt=camera.position;feel(am,'numb',60);sound('doorOpen',a,{gain:.4});}
   yield* lines([{wait:1.6},N('His mom is at the front door. She’s been there a while, maybe.',{time:3}),AM('Do you want to come up? To his room?',{time:2.4})]);
   const up=yield* choosing([{id:'up',label:'“Okay.”'},{id:'cant',label:'“I don’t think I can.”'}],{timeout:16,fallback:'cant'});C.keep.told.alexRoom=up;keep('told',C.keep.told);
   if(up==='cant'){yield* lines([Y('I don’t think I can.',{time:1.6}),{wait:1},AM('That’s all right. That’s all right, honey.',{time:2.4}),{wait:2.4}]);C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-memorial-jamie');return;}
   yield* lines([Y('Okay.',{time:1})]);
   let inside=false;C.fadeOut=0;C.fadeOutDur=1.6;C.after=()=>{enterRoom();inside=true;C.fadeIn=0;C.fadeInDur=1.6;};yield* until(()=>inside,8);
   yield* roomScene();})());}
 function enterRoom(){roomOn(true);setDay('SEPTEMBER 2',16.55,null);const e=RW(RM.enter.x,RM.enter.z),c0=RW((RM.x0+RM.x1)/2,(RM.z0+RM.z1)/2);placeMe(e,headingTo(e.x,e.z,c0.x,c0.z));
  leave(sam);samDad.show(false);alexDad.show(false);for(const kk of ['alex','jamie'])showBike(kk,null);
  // his mother on the end of his bed; his camera on the desk where it lives
  const bq=RW(4.5,1.78);alexMom.show(true);alexMom.place(bq.x,bq.z,AA(Math.PI));alexMom.gest(G(ACT.seat(.5,{hands:'knees',lean:.16})));alexMom.noBlock=true;alexMom.y=bq.y;feel(alexMom,'numb',60);
  const cq=RW(3.9,4.12,.765);CAM9.position.set(cq.x,cq.y+.03,cq.z);CAM9.rotation.set(-Math.PI/2+.02,0,.4-AA(0));CAM9.visible=true;
  lightsOn(true);light(0,RW(3.2,2.4,2.2),{intensity:7,dist:7,color:0xffefd8});C.fill=.8;C.cave=.5;}
 const ROOMLOOK={
  window:{at:()=>V3(RW(RM.frontWindow.x,RM.frontWindow.z+.9,1.5)),label:'The window',ls:[N('His window looks down on the street. You can see the corner from here. The corner of Briarwood.',{time:4.4}),{wait:.6},
   AM('He’d sit there for an hour. Watching the street.',{time:2.6}),AM('He said you can tell everything about a person by how they park.',{time:3})]},
  camera:{at:()=>CAM9.getWorldPosition(new THREE.Vector3()),label:'His camera',ls:[N('His camera, on the desk where it lives. The strap wound round it the way he winds it.',{time:4}),{wait:.6},AM('I keep picking it up. I don’t know what I think it’s going to do.',{time:3.4})]},
  bed:{at:()=>V3(RW(4.4,1.1,.6)),label:'His bed',ls:[AM('I made the bed on Tuesday. Then I unmade it again.',{time:2.8}),{wait:.8},AM('That’s not how he leaves it.',{time:2})]},
 };
 function* roomScene(){const am=alexMom;checkpoint('a1-driveway');
  for(const [id,L] of Object.entries(ROOMLOOK))offer('room-'+id,L.label,L.at,{r:4,look:true,size:.3,cone:.2,when:()=>!busy(),fn:()=>{C.roomLooked=(C.roomLooked||0)+1;say(L.ls);}});
  offer('room-leave','Leave the room',()=>V3(RW(RM.door.x,RM.door.z,1.1)),{r:1.6,fn:()=>{C.flags.leftRoom=true;}});
  objective('Alex’s room.','');
  yield* lines([{wait:1.2},N('His room. Exactly the way it was on the twenty-first, except for her.',{time:3.4}),{wait:.8},AM('I haven’t touched anything.',{time:1.8})]);
  {const t0=C.pt;yield* until(()=>((C.roomLooked||0)>=2&&!busy())||C.pt-t0>40||C.flags.leftRoom,60);}
  if(!C.flags.leftRoom){yield* quiet(10);
   am.lookAt=camera.position;yield* lines([{wait:1.4},AM('Can I ask you— the week he was gone. Was he by himself? Down there?',{time:3.8,face:'tearful'})]);
   const ch=yield* choosing([{id:'end',label:'“Not at the end. We were there.”'},{id:'bikes',label:'“He said he kept thinking about our bikes.”'},{id:'dunno',label:'“I don’t know.”'},{id:'leave',label:'Leave the room'}],{timeout:18,fallback:'dunno'});
   C.keep.told.alexMom=ch;keep('told',C.keep.told);
   if(ch==='leave')C.flags.leftRoom=true;
   else if(ch==='end')yield* lines([Y('Not at the end. We were all there.',{time:2.2}),{wait:1.6},AM('Okay.',{time:1,face:'crying'}),AM('Okay. Thank you.',{time:1.6,face:'crying'})]);
   else if(ch==='bikes')yield* lines([Y('He said he kept thinking about our bikes. The whole time he was in there.',{time:3.4}),{wait:1.6},AM('His bike.',{time:1.2,face:'tearful'}),{wait:1},AM('Of course it was his bike.',{time:2,face:'crying'})]);
   else yield* lines([Y('I don’t know.',{time:1.4}),{wait:1.2},AM('No. Of course you don’t. I’m sorry, honey.',{time:2.6})]);}
  for(const id of Object.keys(ROOMLOOK))unoffer('room-'+id);unoffer('room-leave');
  if(C.flags.leftRoom)yield* lines([N('You go out of his room. You can’t, any more. Not today.',{time:3}),{wait:.6},AM('That’s okay, honey. That’s okay.',{time:2.2})]);
  else{cry(.45,8);yield* lines([{wait:2.4},N('After a while she gets up, and straightens his pillow, and then puts it back the way it was.',{time:4.6}),{wait:2}]);}
  C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-memorial-jamie');}
 // ---- the rest of Act III and Act IV ----------------------------------------------------------------------------------------------------------
 const HT={...H,ST9,SP,putW,hiVis,unwear,lead,placeMe,streetWorld,showBike,moveBike,walkBike,BK,BS,bikeAt,ring,bellAt,LILY,dNow,roomOn,CAM9,AH,AW,JH,JW,JP,toNext};
 const MEM=memorialActs(HT),LEAVE=leavingActs({...HT,MEM});
 // ---- every frame ---------------------------------------------------------------------------------------------------------------------------------
 function update(dt){if(!ST9.ST.state&&!C.inRoom){MEM.update?.(dt);LEAVE.update?.(dt);return;}ST9.update(dt,{camera});updateBikes(dt);
  {const g=GATE();if(g&&C.gateWant!==undefined)g.set(damp(g.k,C.gateWant,2.2,dt));}
  // what Sam's father carries
  if(samDad.visible&&(C.carry?.basket||C.carry?.set)){samDad.person.group.updateMatrixWorld(true);const hp=samDad.person.group.localToWorld(new THREE.Vector3(0,C.carry.basket?.95:0,C.carry.basket?-.32:-.7));
   BASKET.visible=true;BASKET.position.set(hp.x,C.carry.basket?hp.y:gy(hp.x,hp.z),hp.z);BASKET.rotation.y=-samDad.a;FAN9.visible=true;FAN9.position.set(hp.x+Math.cos(samDad.a)*.6,gy(hp.x,hp.z),hp.z+Math.sin(samDad.a)*.6);FAN9.rotation.y=-samDad.a;}
  else if(C.carry?.truck){const g=ST9.pickup;g.updateMatrixWorld(true);const w=new THREE.Vector3(.2,1.05,.9).applyMatrix4(g.matrixWorld);BASKET.visible=true;BASKET.position.copy(w);BASKET.rotation.y=g.rotation.y;FAN9.visible=true;const f=new THREE.Vector3(-.5,1.05,.7).applyMatrix4(g.matrixWorld);FAN9.position.copy(f);FAN9.rotation.y=g.rotation.y;}
  else{BASKET.visible=false;FAN9.visible=false;}
  MEM.update?.(dt);LEAVE.update?.(dt);}
 function afterActors(dt){samBars();
  // Jamie's porch light, on in the daylight (ambient.js would have it off by day)
  if(C.porchOn){const m=world.homes.jamie.porchMat;if(m)m.emissiveIntensity=1.6;}
  // what she is holding: Lily's drawing (a sheet in a hand)
  if(C.drawingOn){const who=C.drawingOn==='lily'?lily:jamieMom;if(who?.visible){who.person.group.updateMatrixWorld(true);const hp=who.person.group.localToWorld(new THREE.Vector3(0,who===lily?.78:.86,who===lily?-.3:-.36));DRAW.visible=true;DRAW.position.copy(hp);DRAW.rotation.set(-.3,-who.a+Math.PI,0);}else DRAW.visible=false;}else DRAW.visible=false;
  MEM.afterActors?.(dt);LEAVE.afterActors?.(dt);}
 const DRAW=(()=>{const m=pageMesh(tex9('biscuit'),{w:.26,h:.2});m.name='a1-biscuit';m.visible=false;scene.add(m);return m;})();
 function sources(out){if(ST9.ST.state){const sep=ST9.ST.state==='september';
   if(sep){out.push({id:'a1-dig',kind:'idle',pos:V3(SP(1062,4.6,1.5)),level:.7});out.push({id:'a1-pump',kind:'pump',pos:V3(SP(1060,-2,.5)),level:.6});out.push({id:'a1-gen9',kind:'generator',pos:V3(SP(1070,-12,1)),level:.5});
    if(C.gasOn)out.push({id:'a1-gas9',kind:'gas',pos:V3(SP(941.4,-5.6,.4)),level:.35});if(reyes.visible)out.push({id:'a1-radio9',kind:'radio',pos:reyes.pos.clone().setY(reyes.pos.y+1.2),level:.35});}}
  MEM.sources?.(out);LEAVE.sources?.(out);}
 // (now and then the excavator's bucket on the trench: September only)
 let digT=4;function digSounds(dt){if(ST9.ST.state!=='september')return;digT-=dt;if(digT<=0){digT=7+Math.random()*9;sound(Math.random()<.5?'c8Hydraulic':'c8Metal',V3(SP(1062,4.6,2)),{gain:.32});}}
 function reset(){ST9.show(null);crews(null);unwear();for(const kk of ['alex','jamie'])showBike(kk,null);walkBike('jamie',false);walkBike('alex',false);C.porchOn=false;C.drawingOn=null;DRAW.visible=false;
  BASKET.visible=false;FAN9.visible=false;CAM9.visible=false;TRIPOD.visible=false;if(C.inRoom)roomOn(false);if(nav.room===roomZone)nav.setRoom(null);for(const m of alexGlass)m.visible=true;world.garages.alex?.set?.(0);
  MEM.reset?.();LEAVE.reset?.();}
 const SCENE={'a1-return':()=>sceneReturn('jump'),'a1-remained':()=>sceneRemained('jump'),'a1-porch':()=>scenePorch('jump'),'a1-driveway':()=>sceneDriveway('jump'),...MEM.SCENE,...LEAVE.SCENE};
 return {SCENE,update:dt=>{update(dt);digSounds(dt);},afterActors,sources,reset,ST9,BK,BS,MEM,LEAVE,bellAt,moveBike,showBike,
  key:(c,r)=>!!(MEM.key?.(c,r)||LEAVE.key?.(c,r)),hint:()=>MEM.hint?.()||LEAVE.hint?.()||null,canDismount:()=>!!LEAVE.canDismount?.(),canRemount:()=>!!LEAVE.canRemount?.(),blockers:out=>{MEM.blockers?.(out);LEAVE.blockers?.(out);}};
}
