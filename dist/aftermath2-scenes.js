// Aftermath II: the scenes. Played as scripts on the chapter's task runner (aftermath2.js), one afternoon without a cut: each
// section below is a checkpoint (Continue and the DEV panel start there), but walking from one to the next is just walking.
//
//  a2-drive        Your car, up Oak Hollow Drive from the bottom of the hill (hold W to drive; look where you like). The hoop at
//                  the bottom, a dog, a mower. Sam's text. Pull over across from your old house; the notebook off the seat (his cap
//                  too, if it is yours); get out.
//  a2-street       Across the street and along it: your house is blue now. Sam on the curb.
//  a2-sam          The reunion: what you say, and how you say hello (it remembers how you said goodbye).
//  a2-walk         Up the hill, the two of you, at your pace. The things the street has now. His mom, on his phone.
//  a2-alex         Briarwood: the corner where Alex turned off, the bell, his house past the creek; the Sunday picture.
//  a2-jamie        Jamie's house: somebody else's now; his mother's chair; a kid's bike on the lawn.
//  a2-summerfield  Where the road went down, a newer square of pavement. The Kowalskis' lot.
//  a2-streetlight  The curb under the streetlight across from Sam's, where the four bikes stood: ten years, what you each do now,
//                  what Sam does with the chains, the notebook.
//  a2-trench       The new houses, the patched road, the Hendersons' (Lily, driving).
//  a2-oak          The old oak, in the golden light. Whatever you want to look at. Under it.
//  a2-children     Two kids on bikes. "See you tomorrow!"
//  a2-leave        The streetlights come on. Rule four. The end card, and after it, one more lap.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {groundPoint,heading} from './route.js';
import {LOOKOUT} from './layout.js';
import {ACT} from './chapter8-acting.js';
import {ACT9,G,asC} from './aftermath1-acting.js';
import {createTown2021} from './aftermath2-town.js';
import {createFriend21,adultBody,createNeighbours21,createRider21,SAM21,YOU21,KIDS21} from './aftermath2-actors.js';
import {samNotebook,notebookHeld,printHeld,jamieCap,createCar21,TEXTS1,phoneScreen} from './aftermath2-props.js';
import {texOf} from './chapter7-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {P as PP,newPose,copyPose,applyPose,createBike} from './rig.js';

export function scenes10(X){
 const {o,k,C,A10,S,ch8,phys,comp,sound,gy,light,lightsOn,checkpoint,later,mark,card,placeTitle,say,SM,Y,N,V,task,stopTask,wait,until,lines,quiet,offer,unoffer,V3,atOf,near,lookingAt,
  pose,unpose,posed,closeLook,endLook,looking,inspect,endInspect,holding,pageMesh,choosing,me,go,objective,busy,nav,camera,scene,world,ambient,
  date,setDay,fmt,dayWorld,inv,keep,said,told,cry,SAVE10,SAVE_DONE,CODA}=X;
 const TOWN=createTown2021({scene,world,nav,ch8,ambient});
 const SAMA=createFriend21(scene,nav,SAM21,{seed:22});
 const NB=createNeighbours21(scene,nav);
 const KIDS={girl:createRider21(scene,KIDS21.girl,{seed:5}),boy:createRider21(scene,KIDS21.boy,{seed:9})};
 const BODY=adultBody(o.self);
 const CAR=createCar21();
 const SP=TOWN.SP,D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const BW=(u,v,dy=0)=>{const f=world.sideFrames[0],p=f.point(u,v);return {x:p.x,z:p.z,y:p.y+dy};};
 const ME=()=>me(),toward=(a,b)=>headingTo(a.x,a.z,b.x,b.z);
 const KID=(t,x={})=>({who:'',text:'“'+t+'”',...x});
 const order=A10.SECTIONS,after=(sec,than)=>order.indexOf(sec)>=order.indexOf(than);
 // ---- where things are ------------------------------------------------------------------------------------------------------------------
 const HOME=TOWN.ST.homeQ||null;// (built on first show; read again then)
 const L={};// the places, filled once the town is built
 function places(){if(L.ok)return;const H=TOWN.ST.homeQ,dd=H?.drivD??434.5;L.ok=true;L.homeD=dd;
  L.park={d:dd-38,lat:3.55};L.start={d:-262,lat:2.15};
  L.curb={d:dd+12.5,lat:-5.3};// in front of your old house, on the curb (the walk to its door comes down here)
  const SH=world.homes.sam,JH=world.homes.jamie,AH=world.homes.alex;
  L.samD=SH?.drivD??994;L.light={d:L.samD-3.1,lat:5.3};// the curb under the streetlight across from Sam's, where the four bikes stood
  L.jamieD=JH?.drivD??791;L.jamie={d:(JH?.u??791)+.5,lat:6.9};L.jamieLawn=JH?JH.toWorld((JH.doorX??0)+2.2*-(JH.gs||1),JH.depth/2+4.2):null;L.jamieChair=JH?JH.toWorld((JH.doorX??0)-(JH.sneakWin?.s??1)*.95,JH.depth/2+1.1):null;
  L.corner={d:589.5,lat:6.6};L.alexU=AH?.u??127;L.alex={u:L.alexU-1.5,v:7.1};L.alexHouse=AH?AH.toWorld(0,AH.depth/2):null;L.alexWindow=AH?AH.toWorld(AH.w*.25,AH.depth/2):null;
  L.creek={u:100,v:5.5};L.oak=LOOKOUT.oak;L.oakW=(()=>{const p=groundPoint(LOOKOUT.oak.d,LOOKOUT.oak.lat);return {x:p.x,z:p.z,y:world.groundY(LOOKOUT.oak.d,LOOKOUT.oak.lat)};})();
  L.bench=LOOKOUT.bench;L.swing=LOOKOUT.swing;}
 // ---- the world as it is in 2021 ---------------------------------------------------------------------------------------------------------
 function world2021({car=true}={}){dayWorld();TOWN.show(true);places();BODY.on(YOU21);o.eyeLift?.(.22);o.setPace?.(.84);C.where='street';C.inside=0;C.insideWant=0;
  C.amb={traffic:.09,insects:.34,wind:.28,life:.6,forest:0,tunnel:0,water:0};
  if(car){if(!CAR.g.parent)scene.add(CAR.g);CAR.g.visible=true;}else{CAR.g.visible=false;}
  lightsOn(false);}
 function parkCar(){const q=SP(L.park.d,L.park.lat),q2=SP(L.park.d+4,L.park.lat);CAR.g.position.set(q.x,q.y,q.z);CAR.g.rotation.y=-toward(q,q2);CAR.inside(false);CAR.g.visible=true;C.carParked=true;}
 // the people who are out this evening: each comes and goes with how far the evening has got (stageTo is called by every section,
 // the continuous way through as much as a jump; it changes only what has to change)
 const STG={n:0,mower:false,walker:false,hoops:false,mom:false};
 function stageTo(n){const {mower,walker,samMom,kid,dog,mw,ball,lead}=NB;STG.n=n;
  if(n<=4&&!STG.mower){STG.mower=true;const a=SP(L.homeD-18,14),b=SP(L.homeD-6,14);mower.show(true);mower.place(a.x,a.z,toward(a,b));mw.visible=true;C.mowing={a,b,dir:1,t:0};}
  if(n>=6&&STG.mower){STG.mower=false;mower.show(false);mw.visible=false;C.mowing=false;}
  if(n<=3&&!STG.walker){STG.walker=true;const a=SP(L.homeD+70,-7.1);walker.show(true);walker.place(a.x,a.z,heading(L.homeD)+Math.PI);dog.show(true);lead.visible=true;C.walking={from:L.homeD+70,to:L.homeD-120,lat:-7.1,v:1.05,started:false};}
  if(n>=5&&STG.walker){STG.walker=false;walker.show(false);dog.show(false);lead.visible=false;C.walking=null;}
  if(n>=2&&n<=6&&!STG.hoops){const Q=TOWN.houseAt(L.homeD+215,1);if(Q){STG.hoops=true;const at=Q.toWorld(Q.hasGarage?Q.gx:0,Q.depth/2+4.6),rim=Q.toWorld(Q.hasGarage?Q.gx:0,Q.depth/2+.3);kid.show(true);kid.place(at.x,at.z,toward(at,rim));ball.visible=true;C.hoops={at,rim:{x:rim.x,y:gy(rim.x,rim.z)+3.05,z:rim.z},t:0,phase:'dribble',n:0};}}
  if((n<2||n>6)&&STG.hoops){STG.hoops=false;kid.show(false);ball.visible=false;C.hoops=null;}
  if(n>=6&&n<=7&&!STG.mom){const SH=world.homes.sam;if(SH){STG.mom=true;const q=SH.toWorld(SH.doorX??0,SH.depth/2+1.2);samMom.show(true);samMom.place(q.x,q.z,toward(q,SP(L.light.d,L.light.lat)));samMom.gest('fold');}}
  if(n>=9&&STG.mom){STG.mom=false;samMom.show(false);}
  kidBikeOnLawn(n>=4&&n<=6);}
 function clearNeighbours(){const {mower,walker,samMom,kid,dog,mw,ball,lead}=NB;for(const a of NB.all){a.show(false);a.gest(null);a.lookAt=null;a.path=null;}dog.show(false);mw.visible=false;ball.visible=false;lead.visible=false;
  C.mowing=false;C.walking=null;C.hoops=null;Object.assign(STG,{n:0,mower:false,walker:false,hoops:false,mom:false});}
 function updateNeighbours(dt){const {mower,walker,kid,dog,mw,ball,lead}=NB;
  if(C.mowing&&mower.visible){const M=C.mowing;if(!mower.walking){M.dir*=-1;const t=M.dir>0?M.b:M.a;M.lane=(M.lane||0)+.55;const off=(M.lane%2.2)-1.1,q={x:t.x+off*Math.cos(heading(L.homeD)),z:t.z+off*Math.sin(heading(L.homeD))};mower.walk([[q.x,q.z]],{speed:.75});mower.gest(G(ACT9.holdOut({k:.8})));}
   const f={x:Math.sin(mower.a),z:-Math.cos(mower.a)};mw.position.set(mower.x+f.x*.85,gy(mower.x+f.x*.85,mower.z+f.z*.85),mower.z+f.z*.85);mw.rotation.y=-mower.a+Math.PI;}
  if(C.walking&&walker.visible){const Wk=C.walking;if(!Wk.started&&(S.phase!=='a2-drive'||C.carD>L.homeD-160)){Wk.started=true;const b=SP(Wk.to,Wk.lat);walker.walk([[b.x,b.z]],{speed:Wk.v,then:a=>{a.show(false);dog.show(false);lead.visible=false;C.walking=null;}});}
   const f={x:Math.sin(walker.a),z:-Math.cos(walker.a)},r={x:Math.cos(walker.a),z:Math.sin(walker.a)},dx=walker.x+f.x*1.3+r.x*.45,dz=walker.z+f.z*1.3+r.z*.45;dog.update(dt,{x:dx,z:dz,a:walker.a,v:walker.walking?Wk.v:0,groundY:gy});
   const pos=lead.geometry.attributes.position;pos.setXYZ(0,walker.x+r.x*.22+f.x*.2,gy(walker.x,walker.z)+.95*1.12,walker.z+r.z*.22+f.z*.2);pos.setXYZ(1,dx-f.x*.25,gy(dx,dz)+.45,dz-f.z*.25);pos.needsUpdate=true;
   if(walker.walking&&D(walker,ME())<9&&!C.flags.walkerSeen){C.flags.walkerSeen=true;walker.lookAt=camera.position;later(2.4,()=>{walker.lookAt=null;});if(Math.random()<.9)sound('dog',new THREE.Vector3(dx,.5,dz),{gain:.25});}}
  if(C.hoops&&kid.visible){const Hh=C.hoops;Hh.t+=dt;const at=Hh.at;
   if(Hh.phase==='dribble'){const k2=Math.abs(Math.sin(Hh.t*5.2));ball.position.set(at.x+Math.sin(kid.a)*.32+Math.cos(kid.a)*.2,gy(at.x,at.z)+.12+k2*.75,at.z-Math.cos(kid.a)*.32+Math.sin(kid.a)*.2);
    if(Math.floor(Hh.t*10.4/Math.PI)!==Hh.n){Hh.n=Math.floor(Hh.t*10.4/Math.PI);if(D(at,ME())<45)sound('dribble',ball.position,{gain:.35});}kid.gest('talk');if(Hh.t>3.4){Hh.phase='shot';Hh.t=0;}}
   else if(Hh.phase==='shot'){const u=Math.min(1,Hh.t/1.1),h=gy(at.x,at.z)+1.6;ball.position.set(lerp(at.x,Hh.rim.x,u),lerp(h,Hh.rim.y,u)+Math.sin(u*Math.PI)*1.5,lerp(at.z,Hh.rim.z,u));kid.gest('point',Hh.rim);
    if(u>=1){Hh.phase='fall';Hh.t=0;if(D(at,ME())<45)sound('rim',ball.position,{gain:.4});}}
   else{const u=Math.min(1,Hh.t/.9);ball.position.set(lerp(Hh.rim.x,at.x,u),Hh.rim.y-(Hh.rim.y-gy(at.x,at.z)-.12)*u*u,lerp(Hh.rim.z,at.z,u));if(u>=1){Hh.phase='dribble';Hh.t=0;}}}}
 // ---- Sam: beside you as you walk (on the side he is already on), or where a scene puts him ---------------------------------------------------
 const SAMF={vx:0,vz:0,px:null,pz:null,side:1,speed:0};
 function trackYou(dt){const p=ME();if(SAMF.px===null){SAMF.px=p.x;SAMF.pz=p.z;}const vx=(p.x-SAMF.px)/Math.max(dt,1e-3),vz=(p.z-SAMF.pz)/Math.max(dt,1e-3);SAMF.vx=damp(SAMF.vx,vx,6,dt);SAMF.vz=damp(SAMF.vz,vz,6,dt);SAMF.px=p.x;SAMF.pz=p.z;SAMF.speed=Math.hypot(SAMF.vx,SAMF.vz);}
 function besideYou(A){const p=ME(),sp=SAMF.speed;
  if(sp<.3){const d=D(A,p);if(d<2.6)return null;// (you stopped: he stops where he is, unless he is left behind)
   const a=toward(p,A),x=p.x+Math.sin(a)*1.35,z=p.z-Math.cos(a)*1.35;return {x,z,look:null};}
  const fx=SAMF.vx/sp,fz=SAMF.vz/sp,rx=-fz,rz=fx;// (right of the way you are walking)
  const side=((A.x-p.x)*rx+(A.z-p.z)*rz)>=0?1:-1;SAMF.side=side;
  const at=s=>({x:p.x+rx*.9*s-fx*.3,z:p.z+rz*.9*s-fz*.3});let q=at(side);if(!nav.walkable(q.x,q.z,{r:.25}))q=at(-side);if(!nav.walkable(q.x,q.z,{r:.25}))q={x:p.x-fx*1.2,z:p.z-fz*1.2};
  return {...q,run:sp>2.6,look:null};}
 function samWalks(){SAMA.pin=null;SAMA.gest(null);SAMA.setFollow(besideYou);}
 function samAt(q,a,g=null){SAMA.stopFollow();SAMA.show(true);SAMA.place(q.x,q.z,a);SAMA.gest(g);SAMA.pin=null;}
 function samGo(q,{speed=1.3,then=null,face=null}={}){SAMA.stopFollow();SAMA.pin=null;const path=nav.walkPath({x:SAMA.x,z:SAMA.z},q);SAMA.walk(path.length?path:[[q.x,q.z]],{speed,then:a=>{if(face!==null)a.face(face);then?.(a);}});}
 // a safety net: he is never more than a little way behind, and never stuck (a jump to behind you, only where you are not looking)
 function samNet(dt){if(!SAMA.visible||SAMA.pin||!SAMA.follow)return;const p=ME(),d=D(SAMA,p);C.samFar=d>14?(C.samFar||0)+dt:0;
  if(C.samFar>2.5&&!lookingAt({x:SAMA.x,y:gy(SAMA.x,SAMA.z)+1.5,z:SAMA.z},.5)){const sp=SAMF.speed>.3?{x:-SAMF.vx/SAMF.speed,z:-SAMF.vz/SAMF.speed}:{x:-Math.sin(p.a),z:Math.cos(p.a)};
   for(const r of [3.2,4.5,2.4,6]){const x=p.x+sp.x*r,z=p.z+sp.z*r;if(nav.walkable(x,z,{r:.3})){SAMA.place(x,z,toward({x,z},p));mark('sam caught up');break;}}C.samFar=0;}}
 // ---- you: on foot, or in the driver's seat -----------------------------------------------------------------------------------------------
 function placeMe(q,a){o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:null});o.bikeAway?.(true);}
 // hands on the wheel (physical.js runs extra arm functions after its own; this one only while you drive)
 const _w=new THREE.Vector3();
 const wheelHands=(p,{toLocal})=>{if(!C.driving)return;for(const [side,o2,e] of [[-1,PP.lh,PP.le],[1,PP.rh,PP.re]]){const w=CAR.wheelWorld(side*.9),L2=toLocal(_w.copy(w));p[o2]=L2.x;p[o2+1]=L2.y;p[o2+2]=L2.z;p[e]=side*.8;p[e+1]=-.5;p[e+2]=.35;}};
 // ---- the drive ---------------------------------------------------------------------------------------------------------------------------------
 const DRV={d:-262,v:0,lat:2.15,park:0,parked:false,on:false,wheel:0};
 function placeCar(){const q=SP(DRV.d,DRV.lat),a=heading(DRV.d);CAR.g.position.set(q.x,q.y,q.z);CAR.g.rotation.y=-a;CAR.wheel.rotation.z=0;}
 function seatPose(){const s=CAR.seatWorld(-1);if(!C.pose){pose({x:s.x,z:s.z},{y:s.y,yaw:s.a,pitch:-.05,slow:.5,seat:{h:.48,y:s.gy+.27,legs:'bent',hands:'knees'}});}
  else{C.pose.x=s.x;C.pose.y=s.y;C.pose.z=s.z;C.pose.yaw=s.a;C.pose.baseYaw=s.a;if(C.pose.seat){C.pose.seat.x=s.x;C.pose.seat.z=s.z;C.pose.seat.a=s.a;C.pose.seat.y=s.gy+.27;}}}
 function updateDrive(dt){if(!DRV.on)return;const held=c=>o.held?.(c);
  let want=0;if(!DRV.parked&&!DRV.park){if(held('KeyW')||held('ArrowUp'))want=held('ShiftLeft')||held('ShiftRight')?11:8.5;if(held('KeyS')||held('ArrowDown'))want=-1;}
  // (anyone in the road ahead: the car slows of its own accord, the way you would)
  for(const T of TOWN.TRAFFIC)if(T.on&&T.dir>0&&T.d>DRV.d&&T.d-DRV.d<14)want=Math.min(want,Math.max(0,T.v));
  if(DRV.park){// (easing in to the curb across from your old house, or just ahead if you are already past it)
   const rem=Math.max(0,DRV.parkAt-DRV.d);DRV.v=Math.min(Math.max(DRV.v,1.2),Math.sqrt(2*1.1*rem)+.05);if(rem<.04){DRV.v=0;DRV.parked=true;}
   DRV.lat=lerp(DRV.lat0,L.park.lat,smooth(1-rem/Math.max(.1,DRV.parkLen)));DRV.park=1-rem/Math.max(.1,DRV.parkLen);want=0;}
  else if(want<0)DRV.v=Math.max(0,DRV.v-5*dt);else DRV.v=damp(DRV.v,want,want>DRV.v?.55:.8,dt);
  const prev=CAR.seatWorld(-1);DRV.d+=DRV.v*dt;C.carD=DRV.d;placeCar();const s=CAR.seatWorld(-1);
  if(C.pose){const lead=DRV.v*dt,px=s.x+Math.sin(s.a)*lead,pz=s.z-Math.cos(s.a)*lead;C.pose.x=px;C.pose.y=s.y;C.pose.z=pz;C.pose.yaw=s.a;C.pose.baseYaw=s.a;if(C.pose.seat){C.pose.seat.x=px;C.pose.seat.z=pz;C.pose.seat.a=s.a;C.pose.seat.y=s.gy+.27;}}
  o.shift?.(s.x-prev.x,s.z-prev.z,{bike:false});
  // the wheel turns with the street's curve, a little
  const curve=wrap(heading(DRV.d+4)-heading(DRV.d))*14;CAR.wheel.rotation.z=damp(CAR.wheel.rotation.z,clamp(-curve,-.6,.6),3,dt);
  if(!DRV.parked&&!DRV.park&&DRV.d>L.park.d+30){DRV.d=L.park.d+30;DRV.v=0;}}
 function* sceneDriveScript(){stageTo(1);
  // the place and the year, over the road
  yield* wait(1.4);placeTitle(true);later(6.5,()=>placeTitle(false));
  objective('Oak Hollow Drive.','Hold W to drive. Look around.');C.driveHint=true;
  const t0=C.pt;yield* until(()=>DRV.v>.5||C.pt-t0>12,20);
  yield* until(()=>DRV.d>-150,240);
  // a car comes down the other way
  TOWN.drive(0,{from:DRV.d+160,to:-430,v:9});
  yield* until(()=>DRV.d>-40,240);
  yield* lines([N(told('lookedBack')===false?'The last time you were on this street you were twelve, in the passenger seat, and you didn’t look back.':
   told('lookedBack')?'The last time you were on this street you were twelve, in the passenger seat, watching it get smaller through the back window.':'The last time you were on this street you were twelve, in the passenger seat of your mother’s car.',{time:5.6})]);
  yield* until(()=>DRV.d>110,240);
  yield* until(()=>DRV.d>170,240);yield* wait(.4);
  yield* until(()=>DRV.d>L.homeD-120,240);
  // Sam's text
  sound('click',camera.position,{gain:.3});C.flags.texted=true;try{const t=texOf(phoneScreen(TEXTS1));if(t){const sm=CAR.phone.screen.material;sm.map=t;sm.color.setHex(0xffffff);sm.needsUpdate=true;}}catch{}
  objective('Your old house.','Sam: “at the curb. the old one”');
  offer('phone','Look at your phone',()=>{const p=new THREE.Vector3();CAR.phone.g.getWorldPosition(p);return p;},{r:3,look:true,inPose:true,size:.08,cone:.2,once:true,fn:()=>task('look-phone',(function*(){
   const p=new THREE.Vector3();CAR.phone.g.getWorldPosition(p);yield* lines([N('Sam. “at the curb. the old one”',{time:3})]);})())});
  yield* until(()=>DRV.d>L.homeD-75,240);
  offer('park','Pull over',()=>SP(DRV.d+8,3.4,1),{r:9,inPose:true,once:true,when:()=>DRV.d>L.homeD-75,fn:()=>{DRV.parkAt=Math.max(DRV.d+10,L.park.d);DRV.parkLen=DRV.parkAt-DRV.d;DRV.lat0=DRV.lat;DRV.park=.0001;unoffer('phone');}});
  objective('Pull over.','Across from your old house.');
  yield* until(()=>DRV.parked,300);unoffer('park');unoffer('phone');sound('engineOff',camera.position,{gain:.4});C.carEngine=false;
  yield* wait(1.2);
  // what is on the seat beside you
  objective('','');
  const onSeat=()=>{const p=new THREE.Vector3();CAR.notebook.getWorldPosition(p);return p;},capAt=()=>{const p=new THREE.Vector3();CAR.cap.getWorldPosition(p);return p;};
  offer('take-notebook','Take the notebook',onSeat,{r:3,look:true,inPose:true,size:.12,cone:.2,once:true});
  yield* lines([N('On the passenger seat: Sam’s notebook'+(C.keep.cap==='you'?', and Jamie’s cap.':'.'),{time:3})]);
  yield* until(()=>C.flags['take-notebook'],60);if(!C.flags['take-notebook']){unoffer('take-notebook');C.flags['take-notebook']=true;}
  CAR.notebook.visible=false;sound('click',camera.position,{gain:.15});
  if(C.keep.cap==='you'){offer('take-cap','Take his cap',capAt,{r:3,look:true,inPose:true,size:.12,cone:.2,once:true});const tc=C.pt;yield* until(()=>C.flags['take-cap']||C.pt-tc>14,16);if(C.flags['take-cap']){CAR.cap.visible=false;C.flags.capWith=true;yield* lines([N('You fold the brim and put it in your back pocket. You don’t know why. You just want it with you.',{time:4.4})]);}else unoffer('take-cap');}
  offer('door','Get out',()=>CAR.doorWorld().setY(gy(CAR.g.position.x,CAR.g.position.z)+1.2),{r:4,inPose:true,once:true,look:false});
  objective('Get out.','');
  yield* until(()=>C.flags.door,90);if(!C.flags.door){unoffer('door');}
  sound('carDoor',camera.position,{gain:.5});
  yield* outOfCar();
  yield* streetScript();}
 function* outOfCar(){unoffer('take-cap');DRV.on=false;C.driving=false;CAR.inside(false);unpose();yield* until(()=>!C.pose,3);
  const s=CAR.seatWorld(-1),a=-CAR.g.rotation.y,q={x:s.x-Math.cos(a)*1.25,z:s.z-Math.sin(a)*1.25};placeMe(q,a+.4);sound('carDoor',camera.position,{gain:.45});}
 // ---- the street, on foot ------------------------------------------------------------------------------------------------------------------
 function* streetScript(){stageTo(2);go('a2-street');checkpoint('a2-street');
  objective('The old curb.','Sam: “at the curb. the old one”');
  const curb=SP(L.curb.d,L.curb.lat);
  // the new pole, gone grey with the rest; your house
  offer('pole','Look at the pole',()=>SP(L.homeD+4.2,-5.2,3.2),{r:7,look:true,size:.5,cone:.25,once:true,fn:()=>task('pole',(function*(){yield* lines([N('They put a new pole in, that September. It’s grey now, like all the others. You only know which one it is because you know.',{time:5.4})]);})())});
  offer('house','Look at the house',()=>{const H=TOWN.ST.homeQ;if(!H)return null;const p=H.toWorld(0,H.depth/2);return {x:p.x,y:p.ground+2.6,z:p.z};},{r:24,look:true,size:2.6,cone:.3,once:true,fn:()=>task('house',(function*(){
   yield* lines([N('Your house. It’s blue now. There’s a red car in the drive and a scooter on the walk, and somebody’s kid has drawn a hopscotch in chalk at the end of the driveway.',{time:6})]);})())});
  yield* until(()=>D(ME(),curb)<17,180);
  // he looks up
  SAMA.gest('phone');yield* until(()=>D(ME(),curb)<12,60);SAMA.gest(null);SAMA.lookAt=camera.position;SAMA.face.set('surprised',{hold:2});
  yield* wait(.8);
  yield* samScene();}
 // ---- Sam ------------------------------------------------------------------------------------------------------------------------------------
 function* samScene(){stageTo(2);go('a2-sam');checkpoint('a2-sam');unoffer('pole');unoffer('house');objective('','');
  // he gets up off the curb
  SAMA.pin=null;SAMA.gest(null);{const q=SP(L.curb.d,-6.2);SAMA.walk([[q.x,q.z]],{speed:.8,then:a=>{a.faceTo(ME().x,ME().z);}});}
  yield* until(()=>D(ME(),SAMA)<3.4,40);
  yield* lines([{wait:.4},SM('You actually came.',{time:1.8,face:'hopeful'})]);
  const c1=yield* choosing([{id:'yeah',label:'“Yeah.”'},{id:'said',label:'“I said I would.”'},{id:'nod',label:'Nod'}],{timeout:14,fallback:'nod'});said('hello',c1);
  if(c1==='yeah')yield* lines([Y('Yeah.',{time:1}),{wait:.8},SM('I wasn’t sure you would.',{time:1.8}),{wait:.6},Y('Me neither.',{time:1.2})]);
  else if(c1==='said')yield* lines([Y('I said I would.',{time:1.4}),{wait:.6},SM('You said that about a lot of stuff.',{time:2.2,face:'amused'}),{wait:.4},SM('...I wasn’t sure you would.',{time:1.8}),{wait:.4},Y('Me neither.',{time:1.2})]);
  else yield* lines([{wait:1.4},N('You nod. It’s all you can do, for a second.',{time:2.4}),{wait:.6},SM('Yeah. Me too.',{time:1.4})]);
  // how you say hello (it remembers how you said goodbye)
  yield* wait(.6);
  const bye=told('bye');
  const c2=yield* choosing([{id:'hug',label:'Hug him'},{id:'hand',label:'Shake his hand'},{id:'arm',label:'Punch his arm'}],{timeout:16,fallback:'hand'});said('greet',c2);
  const p=ME(),h=toward(p,SAMA);
  if(c2==='hug'||c2==='hand'){
   if(c2==='hand'){SAMA.gest(G(ACT9.offer({hand:'r'})));yield* lines([N('You put your hand out. He looks at it.',{time:2.4}),{wait:.4},SM(bye==='see'?'“See you, Sam.” That’s what you said. Ten years.':'A handshake. Okay. Okay, sure.',{time:bye==='see'?3:2.2,face:'amused'}),{wait:.4}]);}
   SAMA.gest(G(ACT9.hold(asC(SAMA),{px:p.x,pz:p.z,pa:h,person:o.self},{bend:.12})));pose({x:p.x+Math.sin(h)*.1,z:p.z-Math.cos(h)*.1},{y:gy(p.x,p.z)+1.6,yaw:h,pitch:-.18,slow:.8,stand:true});sound('a1Cloth',camera.position,{gain:.35});
   yield* lines([{wait:1.2},N(bye==='hug'?'It’s quick, and too hard, and neither of you is any good at it. Some things don’t change.':'He pulls you in. It’s quick, and too hard, and neither of you is any good at it.',{time:4.2}),{wait:.8}]);
   unpose();SAMA.gest(null);yield* until(()=>!C.pose,3);}
  else{yield* lines([N('You punch him in the arm. Not hard.',{time:2}),{wait:.4},{act:()=>{SAMA.gest(G(ACT9.offer({hand:'r',k:.6})));sound('a1Cloth',camera.position,{gain:.3});}},SM(bye==='arm'?'Okay. I owed you that one. Since 2011.':'Ow. Okay. Hi.',{time:bye==='arm'?2.6:1.6,face:'grin'}),{wait:.3,act:()=>SAMA.gest(null)},
    N(bye==='arm'?'He punches you back. Harder. Same as last time.':'He punches you back, harder, and then you’re both standing there laughing at nothing.',{time:3.4})]);}
  // the quiet realisation that you have both changed
  yield* lines([{wait:.8},SM('You got tall.',{time:1.2}),Y('You got tall.',{time:1.2}),SM('I was always tall.',{time:1.4}),Y('You were not.',{time:1.2}),{wait:.6},
   SM(told('call')==='week'?'You called every Sunday. For like a year.':told('call')==='write'?'You wrote back. You know. Mostly.':'You called when you got there. You said you would, and you did.',{time:3}),{wait:.6},
   SM(told('call')==='week'?'Then every other Sunday. Then birthdays.':'Then it was birthdays. Then it was…',{time:2.6}),{wait:.6},Y('Yeah.',{time:1}),SM('Me too. I’m bad at it too.',{time:1.8}),{wait:1.2},
   SM('Your house is blue.',{time:1.4,act:()=>{const H=TOWN.ST.homeQ;if(H){const q=H.toWorld(0,0);SAMA.lookAt={x:q.x,y:q.ground+3,z:q.z};}}}),Y('I saw.',{time:1}),SM('It’s been blue for like six years. I keep forgetting it wasn’t.',{time:2.8}),{wait:.6,act:()=>{SAMA.lookAt=null;}},
   SM('Want to walk?',{time:1.2}),{wait:.4}]);
  yield* walkScene();}
 // ---- the hill ------------------------------------------------------------------------------------------------------------------------------
 let lastD=0;function dNow(){const p=ME(),q=nav.locate?.(p.x,p.z);if(q&&(q.street==='main'||q.street===undefined))lastD=q.d;return lastD;}
 const onMain=()=>{const p=ME(),q=nav.locate?.(p.x,p.z);return !q||q.street==='main';};
 function* walkScene(){stageTo(3);go('a2-walk');checkpoint('a2-walk');samWalks();objective('Up the hill.','Toward Briarwood. Sam walks with you.');
  const said2={};let last=C.pt;
  while(true){yield;const d=dNow();if(busy()){last=C.pt;continue;}
   if(!said2.hill&&d>L.homeD+40&&d<L.homeD+120&&onMain()){said2.hill=true;yield* hillTalk();continue;}
   if(!said2.dog&&C.flags.walkerSeen&&!said2.hill2){said2.dog=true;yield* lines([{wait:.4},SM('Hey, Pepper.',{time:1.2,face:'happy'}),N('The dog wags at him all the way past. Everybody’s dog knows Sam.',{time:3.2})]);continue;}
   if(!said2.phone&&d>L.homeD+90&&C.pt-last>4){said2.phone=true;SAMA.gest('phone');yield* lines([{wait:.6},SM('My mom.',{time:1}),SM('She wants to know if you’re coming to dinner.',{time:2.2}),Y('Is that a question?',{time:1.4}),SM('No.',{time:.9,act:()=>SAMA.gest(null)}),{wait:.4},SM('She’s been making the thing since Tuesday.',{time:2.2}),Y('What thing?',{time:1}),SM('The thing. You’ll see.',{time:1.6,face:'amused'})]);continue;}
   if(!said2.store&&said2.phone&&d>L.homeD+120&&C.pt-last>5){said2.store=true;yield* lifeTalk();continue;}
   if(d>584&&onMain())break;
   // (wandered off up Briarwood already: that is where you were going)
   if(!onMain()&&nav.locate?.(ME().x,ME().z)?.street==='side')break;}
  yield* alexScene();}
 function* hillTalk(){yield* lines([{wait:.6},SM('Remember when this hill used to feel huge?',{time:2.2})]);
  const c=yield* choosing([{id:'said',label:'“You said that. When we were twelve. Right here.”'},{id:'hill',label:'“It’s not even a hill.”'},{id:'none',label:'Say nothing'}],{timeout:14,fallback:'none'});said('hill',c);
  if(c==='said')yield* lines([Y('You said that. When we were twelve. Right about here.',{time:2.8}),{wait:.8},SM('Did I?',{time:1}),Y('Same words.',{time:1.2}),{wait:1.2},SM('Huh.',{time:.9}),{wait:.8},SM('I was old already.',{time:1.6,face:'amused'})]);
  else if(c==='hill')yield* lines([Y('It’s not even a hill.',{time:1.4}),SM('It’s barely a hill.',{time:1.4}),{wait:.6},SM('Jamie never sat down on this part. He stood on the pedals the whole way, so he could get to the top first and say he waited.',{time:4.4,face:'happy'}),{wait:.6},Y('He always said he waited.',{time:1.8})]);
  else yield* lines([{wait:1.6},SM('It’s barely a hill.',{time:1.4})]);}
 function* lifeTalk(){yield* lines([{wait:.4},SM('So. What do you do now? Like, actually.',{time:2.2})]);
  const c=yield* choosing([{id:'make',label:'“I make things. Computer stuff.”'},{id:'dunno',label:'“Honestly? I don’t know yet.”'},{id:'you',label:'“You first.”'}],{timeout:16,fallback:'dunno'});said('work',c);
  if(c==='make')yield* lines([Y('I make things. On the computer. Trying to.',{time:2.4}),SM('Like what?',{time:1}),Y('I’ll show you sometime.',{time:1.6}),SM('That means you’re not going to show me.',{time:2.2,face:'amused'}),Y('It means it’s not done.',{time:1.6})]);
  else if(c==='dunno')yield* lines([Y('Honestly? I don’t know yet.',{time:1.8}),{wait:.4},SM('Yeah.',{time:.9}),SM('Me neither, and I have a key to a whole store.',{time:2.4,face:'amused'})]);
  else yield* lines([Y('You first.',{time:1})]);
  yield* lines([{wait:.4},SM('Hardware store, on Main. Assistant manager. Since March.',{time:2.6}),SM('I have a key now. To the whole store.',{time:2,face:'happy'}),{wait:.6},Y('A key.',{time:1}),SM('It’s a big deal.',{time:1.4})]);
  if(c==='you')yield* lines([{wait:.6},SM('Your turn.',{time:1}),Y('I make things. On the computer.',{time:1.8}),SM('Still?',{time:.9}),Y('Still.',{time:.9})]);}
 // ---- Briarwood: Alex --------------------------------------------------------------------------------------------------------------------------
 function* alexScene(){stageTo(4);go('a2-alex');checkpoint('a2-alex');
  objective('Briarwood.','The corner.');
  const corner=SP(L.corner.d,L.corner.lat);
  yield* until(()=>D(ME(),corner)<7.5||!onMain(),120);
  // he stops at the corner
  SAMA.stopFollow();samGo(corner,{speed:1.25,face:toward(corner,BW(30,0))});
  yield* until(()=>D(SAMA,corner)<.8,12);yield* until(()=>D(ME(),SAMA)<4.5,20);SAMA.lookAt=BW(60,0,1.4);
  yield* lines([{wait:.8},SM('He’d stop right here. Every night.',{time:2}),{wait:.6},SM('“Alright, I’m this way.” Like we didn’t know which way he was.',{time:3.2}),{wait:1},SM('And the bell. Twice. Every corner.',{time:2.2})]);
  const c=yield* choosing([{id:'nobody',label:'“Even when nobody was there.”'},{id:'hear',label:'“I can still hear it.”'},{id:'none',label:'Say nothing'}],{timeout:14,fallback:'none'});said('bell',c);
  if(c==='nobody')yield* lines([Y('Even when nobody was there.',{time:1.6}),{wait:.6},SM('Especially then.',{time:1.4})]);
  else if(c==='hear')yield* lines([Y('I can still hear it.',{time:1.4}),{wait:1.4},SM('…Yeah.',{time:1})]);
  else yield* lines([{wait:2.2}]);
  SAMA.lookAt=null;yield* lines([{wait:.6},SM('You want to go down?',{time:1.2})]);
  objective('Alex’s house.','Down Briarwood, past the creek.');samWalks();
  const front=BW(L.alex.u,L.alex.v);
  let creek=false;
  while(D(ME(),front)>4){yield;const p=ME(),q=nav.locate?.(p.x,p.z);
   if(!creek&&q?.street==='side'&&(q.u??0)>80&&!busy()){creek=true;say([{wait:.4},SM('They put the fence up along the creek. After.',{time:2.4}),{wait:.4},SM('Kids still get through it.',{time:1.4})]);}}
  // his house
  SAMA.stopFollow();{const q=BW(L.alex.u-1.2,L.alex.v-.2);samGo(q,{speed:1.1,face:toward(q,L.alexHouse||q)});}
  yield* until(()=>!busy(),10);
  objective('','');
  yield* lines([{wait:1.2},N('The same house. The same garage door. The window over it has its blind down.',{time:3.8}),{wait:1},SM('His mom and dad are still here.',{time:1.8})]);
  const c2=yield* choosing([{id:'see',label:'“Do you see them?”'},{id:'still',label:'“Still?”'},{id:'none',label:'Say nothing'}],{timeout:14,fallback:'none'});said('alexParents',c2);
  if(c2==='see')yield* lines([Y('Do you see them?',{time:1.2}),SM('His dad comes in the store. Same light bulbs every month.',{time:2.6}),{wait:.6},SM('I don’t think he needs that many light bulbs.',{time:2.2})]);
  else if(c2==='still')yield* lines([Y('Still?',{time:.9}),{wait:.6},SM('Where would they go?',{time:1.4})]);
  else yield* lines([{wait:2}]);
  if(told('shadow'))yield* lines([{wait:.8},SM('He told me about the picture. The one you found. Where you can see his shadow.',{time:3.4}),SM('He keeps it in his wallet.',{time:1.6})]);
  // the Sunday picture, in the back of the notebook
  if(C.keep.print){objective('The picture.','In the back of the notebook. Press F.');
   offer('print','Take out the picture',()=>new THREE.Vector3(camera.position.x,camera.position.y-.4,camera.position.z),{r:9,once:true});
   const t0=C.pt;yield* until(()=>C.flags.print||C.pt-t0>40,45);
   if(C.flags.print){C.looked={...C.looked,print:true};C.keep.looked={...C.keep.looked,print:true};
    yield* holding(printHeld(),[N('Sunday at the oak. The twenty-first, at 7:26. Four bikes in the grass, and three of you, because he was the one holding it.',{time:5.6}),{wait:1.2},
     SM('He’s not in it.',{time:1.4,face:'sad'}),Y('He was holding it.',{time:1.4}),{wait:1},SM('He always was.',{time:1.6})],{dist:.42,kind:'print',min:5});}
   else unoffer('print');}
  objective('Jamie’s house.','Back to Oak Hollow, and up it, on the right.');
  yield* lines([{wait:.8},SM('Come on.',{time:1})]);samWalks();
  yield* jamieScene();}
 // ---- Jamie -----------------------------------------------------------------------------------------------------------------------------------
 let lawnBike=null;
 function kidBikeOnLawn(on){if(!lawnBike&&on){lawnBike=createBike({style:'mtb',frame:0x2f6a9a,bars:'flat',wheelR:.25,saddle:0x262626,grips:0x1c1c1e,tire:0x2b2c2e,extras:[]});lawnBike.group.name='a2-lawn-bike';lawnBike.group.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(lawnBike.group);}
  if(!lawnBike)return;lawnBike.group.visible=!!on;if(on&&L.jamieLawn){const q=L.jamieLawn;lawnBike.group.position.set(q.x,gy(q.x,q.z)+.03,q.z);lawnBike.group.rotation.set(0,1.1,Math.PI/2-.08,'YXZ');}}
 function* jamieScene(){stageTo(5);go('a2-jamie');checkpoint('a2-jamie');
  const front=SP(L.jamie.d,L.jamie.lat);
  let called=false;
  while(D(ME(),front)>5.5){yield;const d=dNow();if(!called&&onMain()&&d>L.jamieD-110&&d<L.jamieD-40&&!busy()){called=true;say([{wait:.4},SM('His mom used to yell for him from all the way up there. And he’d pretend he couldn’t hear her until the third time.',{time:4.4}),{wait:.4},Y('Every time.',{time:1}),SM('Every single time.',{time:1.4,face:'happy'})]);}}
  SAMA.stopFollow();{const q=SP(L.jamie.d-1.3,L.jamie.lat+.2);samGo(q,{speed:1.1,face:toward(q,L.jamieChair||front)});}
  yield* until(()=>!busy(),12);objective('','');
  yield* lines([{wait:1},N('Jamie’s house. A different car in the drive. A wreath on the red door that isn’t hers. The porch light is the cold white kind now.',{time:5.4}),{wait:1},
   SM('She moved to her sister’s. Four years ago? Five.',{time:2.4}),{wait:.6},SM('She took his bike. She made my dad tie it down in the truck so it wouldn’t get scratched.',{time:3.6}),{wait:.6},Y('It was already scratched.',{time:1.4}),SM('That’s what I said.',{time:1.4,face:'amused'})]);
  if(told('bmx'))yield* lines([{wait:.6},SM(told('bmx')==='walk'?'You put it in the middle of the walk. Where he always left it. She left it right there for a year. The mailman went round it.':'You leaned it by the rail. She left it there for a year. Nobody touched it.',{time:4.6})]);
  // the chair
  yield* lines([{wait:.8},SM('She left the chair, though.',{time:1.6,act:()=>{if(L.jamieChair)SAMA.lookAt={x:L.jamieChair.x,y:L.jamieChair.ground+.8,z:L.jamieChair.z};}}),{wait:.4},SM('They kept it.',{time:1.2})]);
  // a kid's bike on the lawn, dropped where it stopped
  yield* lines([{wait:1.2},SM('The kid who lives there now leaves his bike right there. On the lawn. Every day.',{time:3.4,act:()=>{if(L.jamieLawn)SAMA.lookAt={x:L.jamieLawn.x,y:L.jamieLawn.ground+.3,z:L.jamieLawn.z};}}),{wait:2.2,act:()=>{SAMA.lookAt=null;}}]);
  // his cap
  if(C.keep.cap==='mom'){const w=C.keep.capWhen;yield* lines([{wait:.6},SM('She took his cap too. The one you gave her'+(w==='shelter'?', that morning at the school.':w==='porch'?', on the porch.':'.'),{time:3}),{wait:.6},SM('She wore it out to the car once. When she thought nobody was looking.',{time:3.2})]);}
  else if(C.flags.capWith){offer('cap','Take out his cap',()=>new THREE.Vector3(camera.position.x,camera.position.y-.45,camera.position.z),{r:9,once:true});objective('His cap.','In your back pocket.');
   const t0=C.pt;yield* until(()=>C.flags.cap||C.pt-t0>30,35);unoffer('cap');
   if(C.flags.cap){const cg=jamieCap();cg.rotation.set(.4,0,0);yield* holding(cg,[N('His cap. Blue. The brim bent the way he bent it.',{time:3}),{wait:.8},SM('You kept it.',{time:1.2}),{wait:.8},SM('Good.',{time:1}),{wait:.4},SM('He’d want somebody to have it who’d wear it backwards wrong.',{time:2.8,face:'amused'})],{dist:.4,kind:'cap',min:4});}
   objective('','');}
  else if(C.keep.cap==='you')yield* lines([{wait:.6},SM('You still have his cap?',{time:1.4}),Y('It’s in the car.',{time:1.2}),SM('Good.',{time:1})]);
  // the funny kid he was
  yield* lines([{wait:1.2},SM('You know what I think about? Biscuit.',{time:2}),{wait:.6},Y('The dog.',{time:.9}),SM('The dog he didn’t have. He made up a whole dog so Lily would climb out a window.',{time:3.2}),{wait:.8},SM('He was so stupid.',{time:1.4,face:'happy'}),{wait:1.6},SM('He was so stupid and he was the best one of us.',{time:2.4,face:'tearful'})]);
  cry(.4,6);
  yield* lines([{wait:2.4},SM('Okay.',{time:.9}),{wait:.6},SM('Okay. Come on.',{time:1.2})]);
  objective('Up the street.','Summerfield.');samWalks();
  yield* summerScene();}
 // ---- Summerfield ----------------------------------------------------------------------------------------------------------------------------------
 function* summerScene(){stageTo(6);go('a2-summer');checkpoint('a2-summerfield');
  yield* until(()=>dNow()>852&&onMain(),240);
  // the newer square in the road: you look at it, or you don't; Sam does
  SAMA.lookAt=SP(872,0,.2);
  yield* lines([{wait:.6},SM('They did the whole intersection over. Twice.',{time:2}),{wait:.6},SM('It was closed for three years. You had to go round by the school.',{time:2.8}),{wait:.4}]);
  SAMA.lookAt=null;
  const kow=TOWN.ST.houses.find(h=>h.id==='939w');
  yield* until(()=>dNow()>925||!onMain(),90);
  if(kow)yield* lines([{wait:.4},SM('The Kowalskis didn’t come back. Somebody built that one. Nice guy. Has a boat he never takes anywhere.',{time:4.2,act:()=>{SAMA.lookAt={x:kow.at.x,y:gy(kow.at.x,kow.at.z)+3,z:kow.at.z};}}),{wait:1,act:()=>{SAMA.lookAt=null;}}]);
  objective('The streetlight.','Across from Sam’s.');
  yield* streetlightScene();}
 // ---- the streetlight across from Sam's: ten years, the chain, the notebook ------------------------------------------------------------------
 function* streetlightScene(){stageTo(7);go('a2-light');checkpoint('a2-streetlight');
  const spot=SP(L.light.d,L.light.lat);
  yield* until(()=>D(ME(),spot)<7,240);
  SAMA.stopFollow();{const q=SP(L.light.d+.85,5.25);samGo(q,{speed:1.2,then:a=>{a.face(toward(q,SP(L.light.d,-6)));}});}
  yield* until(()=>D(SAMA,SP(L.light.d+.85,5.25))<.6,12);
  // he sits on the curb, where the four bikes stood
  {const q=SP(L.light.d+.85,5.05);SAMA.pin={x:q.x,z:q.z,a:toward(q,SP(L.light.d+.85,-6))};SAMA.gest(G(ACT.seat(.2,{hands:'knees',lean:.16})));}
  yield* lines([{wait:.8},N('Sam sits down on the curb under the streetlight. Where the four bikes stood that Friday night, in a row.',{time:4.4})]);
  offer('sit','Sit down',()=>SP(L.light.d-.2,5.1,.4),{r:3,once:true});objective('','Sit with him. (F)');
  const t0=C.pt;yield* until(()=>C.flags.sit||C.pt-t0>25,30);unoffer('sit');
  if(C.flags.sit){const q=SP(L.light.d-.25,5.15),face=toward(q,SP(L.light.d-.25,-6));pose({x:q.x,z:q.z},{y:gy(q.x,q.z)+.95,yaw:face,pitch:-.08,slow:1,seat:{h:.2,y:gy(q.x,q.z)-.02,legs:'bent',hands:'knees',a:face}});C.flags.seated=true;}
  else yield* lines([N('You stay standing. He doesn’t seem to mind.',{time:2.4})]);
  objective('','');
  // his mom, across the street, on her porch
  if(NB.samMom.visible)yield* lines([{wait:1.4},N('Across the street, on the porch of Sam’s house, his mom is watching the two of you with her arms folded.',{time:4}),{act:()=>{NB.samMom.gest('wave');NB.samMom.lookAt=camera.position;}},{wait:1.4},SM('Don’t wave.',{time:1}),SM('If you wave she’ll come over.',{time:1.8,face:'amused'})]);
  const w=yield* choosing([{id:'wave',label:'Wave'},{id:'not',label:'Don’t wave'}],{timeout:10,fallback:'not'});said('waveMom',w);
  if(w==='wave'){yield* lines([N('You wave.',{time:1}),{wait:.6},SM('Oh, now she’s coming over.',{time:1.6}),{wait:1,act:()=>{NB.samMom.gest('wave');}},N('She isn’t. She waves back with her whole arm and goes inside, and the screen door slaps behind her.',{time:4,act:()=>later(2.4,()=>{NB.samMom.show(false);const SH=world.homes.sam;sound('doorSlam',SH?new THREE.Vector3(SH.toWorld(0,0).x,1,SH.toWorld(0,0).z):camera.position,{gain:.4});})})]);}
  else yield* lines([{wait:1.6,act:()=>{NB.samMom.gest('fold');}},N('His mom goes in. Somewhere behind you a screen door slaps shut.',{time:3}),{act:()=>{later(.6,()=>{NB.samMom.show(false);sound('doorSlam',camera.position,{gain:.25});});}}]);
  // ten years
  yield* lines([{wait:1.6},SM('I used to come sit here. After. When they let us back on the street.',{time:3.2}),{wait:.8},SM('Not for any reason.',{time:1.4}),{wait:1.6}]);
  const c=yield* choosing([{id:'memory',label:'“Do you remember the Tour?”'},{id:'fade',label:'“Some of it’s going. I can’t remember his voice.”'},{id:'ask',label:'“What do you remember?”'},{id:'quiet',label:'Say nothing'}],{timeout:18,fallback:'quiet'});said('remember',c);
  if(c==='memory')yield* lines([Y('Do you remember the Tour?',{time:1.4}),SM('I have the Tour. It’s on my wall.',{time:2,face:'happy'}),{wait:.6},SM('People come over and think it’s a kid’s drawing.',{time:2.2}),Y('It is a kid’s drawing.',{time:1.4}),SM('It’s four kids’ drawing.',{time:1.8})]);
  else if(c==='fade')yield* lines([Y('Some of it’s going. I can’t remember his voice. Jamie’s. Not really.',{time:3.4}),{wait:1.4},SM('…Yeah.',{time:1}),{wait:1},SM('I can do his laugh. Not his voice. His laugh, though.',{time:2.6}),{wait:.6},SM('It was a stupid laugh.',{time:1.6,face:'tearful'})]);
  else if(c==='ask')yield* lines([Y('What do you remember?',{time:1.2}),{wait:1.2},SM('Stupid stuff. Alex’s bell. Jamie’s bananas.',{time:2.4}),SM('You. Your chain coming off every single time we went up a hill.',{time:2.8,face:'amused'})]);
  else yield* lines([{wait:3.4}]);
  // Sam's memory: what he does with it
  yield* lines([{wait:1},SM('Kids come in the store with their chain off. Like, every week.',{time:2.6}),{wait:.4},SM('I do it for free. I’m not supposed to. Mr. Abbott yells at me.',{time:3,face:'amused'}),{wait:.8},SM('Turn the pedal backwards. Slow. It just goes back on.',{time:2.6}),{wait:1.2},SM('Every time I do it I think about you sitting on your driveway, mad at it.',{time:3.2}),{wait:1.6}]);
  // the notebook
  objective('','The notebook. (F)');
  offer('notebook','Take out the notebook',()=>new THREE.Vector3(camera.position.x,camera.position.y-.45,camera.position.z),{r:9,once:true,inPose:true});
  const t1=C.pt;yield* until(()=>C.flags.notebook||C.pt-t1>40,45);unoffer('notebook');objective('','');
  if(!C.flags.notebook)yield* lines([N('You take the notebook out anyway. You were always going to.',{time:2.6})]);
  const NBK=notebookHeld({k:1,print:!!C.keep.print});C.notebook=NBK.pages;
  task('nb-talk',(function*(){yield* wait(1.8);yield* lines([SM('Is that—',{time:1}),{wait:.4},SM('You still have it.',{time:1.4,face:'surprised'})]);
   yield* until(()=>NBK.pages.page!=='front',5);if(NBK.pages.page==='front')NBK.pages.go('names');
   if(NBK.pages.page==='names'||NBK.pages.seen.includes('names'))yield* lines([N('ALEX. JAMIE. SAM. In your writing, in the gym that Monday, because everybody was forgetting.',{time:4.6}),{wait:1},SM('You wrote me in it.',{time:1.4}),Y('You were missing.',{time:1.4}),{wait:1.2},SM('Huh.',{time:.9})]);
   objective('','Q / E: turn the page.');yield* until(()=>NBK.pages.page==='back',12);if(NBK.pages.page!=='back')NBK.pages.go('back');objective('','');
   if(NBK.pages.page==='back')yield* lines([{wait:.6},SM('That’s my writing.',{time:1.2}),{wait:.4},SM('Rule six.',{time:1}),{wait:.8},Y('You made that one up.',{time:1.4}),SM('It still counts.',{time:1.4}),{wait:1.2},SM('You’re bad at rule six.',{time:1.6,face:'amused'}),Y('I know.',{time:1}),{wait:.8},SM('I’m worse.',{time:1})]);
   C.flags.nbDone=true;})());
  yield* holding(NBK.g,[N('His notebook. The cover’s gone soft at the corners. It’s been in a drawer, a glovebox, a jacket pocket, a box, and a drawer again.',{time:5.2})],{dist:.42,kind:'notebook',min:4,max:120,pages:NBK.pages});
  stopTask('nb-talk');C.flags.nbDone=true;keep('looked',{...C.keep.looked,notebook:NBK.pages.seen});
  yield* quiet(8);
  yield* lines([{wait:1.4},SM('Okay.',{time:.8}),{wait:.4},SM('You want to go up there?',{time:1.4})]);
  const c3=yield* choosing([{id:'yeah',label:'“Yeah.”'},{id:'minute',label:'“In a minute.”'}],{timeout:10,fallback:'yeah'});said('oak',c3);
  if(c3==='minute')yield* lines([Y('In a minute.',{time:1}),{wait:4.2},N('A car goes by. Somebody’s sprinkler starts up. The light’s going gold.',{time:3.4}),{wait:2.6},SM('Okay. Now?',{time:1}),Y('Now.',{time:.8})]);
  else yield* lines([Y('Yeah.',{time:.8})]);
  // up off the curb
  if(posed()){unpose();C.flags.seated=false;}yield* until(()=>!C.pose,3);
  SAMA.pin=null;SAMA.gest(null);samWalks();
  objective('The old oak.','At the end of the street.');
  yield* trenchScene();}
 // ---- the new houses, the patched road -----------------------------------------------------------------------------------------------------------
 function* trenchScene(){stageTo(9);go('a2-trench');checkpoint('a2-trench');
  const said3={};
  while(true){yield;const d=dNow();if(busy())continue;
   if(!said3.lily&&d>L.samD+18&&d<1045){said3.lily=true;yield* lines([{wait:.4},SM('The Hendersons are still there.',{time:1.6,act:()=>{SAMA.lookAt=SP(1026,18,2);}}),{wait:.4},SM('Lily’s driving now. She almost hit me in the parking lot at the store.',{time:3,face:'amused'}),{wait:.6,act:()=>{SAMA.lookAt=null;}},Y('Lily’s driving?',{time:1.2}),SM('Badly.',{time:1})]);continue;}
   if(!said3.seam&&d>1050&&d<1090){said3.seam=true;yield* lines([{wait:1.6},N('The road is newer here. You can see where. A line across the asphalt, and then darker asphalt, and new curbs, and houses that are all about the same age.',{time:5.6}),{wait:1.2},SM('You can tell.',{time:1.2}),Y('Yeah.',{time:.8}),{wait:.8},SM('The trees are all little.',{time:1.6})]);continue;}
   if(d>1118&&onMain())break;}
  yield* oakScene();}
 // ---- the oak -------------------------------------------------------------------------------------------------------------------------------------
 function* oakScene(){stageTo(10);go('a2-oak');checkpoint('a2-oak');objective('','');
  yield* lines([{wait:1.2},N('The old oak, at the end of the street. It’s bigger. That shouldn’t be surprising, and it is.',{time:4.4})]);
  // let you come to it at your own pace; let you look
  const oak=L.oakW;
  SAMA.stopFollow();{const q=SP(1150,4.2);samGo(q,{speed:.95,then:a=>{a.face(toward(q,oak));}});}
  const looks=new Set();
  offer('trunk','Put your hand on the trunk',()=>({x:oak.x,y:oak.y+1.25,z:oak.z}),{r:2.4,look:true,size:.8,cone:.25,once:true,fn:()=>{looks.add('trunk');task('trunk',(function*(){yield* lines([N('The bark is warm from the sun.',{time:2.4})]);})());}});
  offer('carving','Look at the carving',()=>({x:oak.x,y:oak.y+1.05,z:oak.z}),{r:2.2,look:true,size:.35,cone:.18,once:true,when:()=>C.flags.trunk,fn:()=>{looks.add('carving');task('carving',(function*(){yield* lines([N('AR. Older than any of you. It was already old when you were twelve, and it’s older now.',{time:4})]);})());}});
  offer('roots','Look at the foot of the trunk',()=>({x:oak.x,y:oak.y+.2,z:oak.z}),{r:3,look:true,size:.8,cone:.22,once:true,fn:()=>{looks.add('roots');task('roots',(function*(){yield* lines([N('Where the roots make a kind of seat. The grass is long there now.',{time:3.4}),{wait:1},N('Neither of you sits there.',{time:2.4})]);})());}});
  offer('swing','Push the swing',()=>{const p=ambient.swingPosition?.();return p?{x:p.x,y:p.y,z:p.z}:SP(L.swing.d,L.swing.lat,1);},{r:2.4,look:true,size:.5,cone:.22,once:false,fn:()=>{looks.add('swing');ambient.pushSwing?.({d:L.swing.d-1,lat:L.swing.lat});sound('creak',camera.position,{gain:.35});if(!C.flags.swingSaid){C.flags.swingSaid=true;say([{wait:.6},SM('They put a new rope on it. Mr. Davis did. It still swings crooked.',{time:3})]);}}});
  offer('street','Look back down the street',()=>SP(1040,0,1.6),{r:30,look:true,size:4,cone:.14,once:true,fn:()=>{looks.add('street');task('street',(function*(){yield* lines([N('All the way down Oak Hollow, the trees and the roofs, the long gold light on them. Somebody mowing, still. A car turning in.',{time:4.6})]);})());}});
  if(C.keep.print)offer('print-oak','Take out the picture',()=>new THREE.Vector3(camera.position.x,camera.position.y-.4,camera.position.z),{r:30,once:true,when:()=>D(ME(),oak)<12,fn:()=>{looks.add('print');}});
  // the traffic: one car turns into a drive behind you
  TOWN.drive(1,{from:900,to:1200,v:7.5,park:{at:1078,d:1081.5,lat:11,a:heading(1081.5)+Math.PI/2}});
  const t0=C.pt;yield* until(()=>D(ME(),oak)<6.5||C.pt-t0>60,90);
  // a moment, whatever you do
  const t1=C.pt;yield* until(()=>(looks.size>=2&&C.pt-t1>12)||C.pt-t1>32||C.flags['print-oak'],50);
  if(C.flags['print-oak']){C.keep.looked={...C.keep.looked,printOak:true};yield* holding(printHeld(),[N('Sunday at the oak. The same tree. The same light, nearly.',{time:3.6}),{wait:1.6},N('Four bikes in the grass. You look up from it, and the grass is right there, and there’s nothing in it.',{time:4.8})],{dist:.42,kind:'print-oak',min:5});}
  yield* quiet(8);
  yield* underOak();}
 function* underOak(){go('a2-oak');
  // the conversation beneath the oak: standing in the shade, the street behind you
  const q=SP(1154.5,4.6);SAMA.stopFollow();samGo(q,{speed:.9,then:a=>a.face(toward(q,SP(1130,0)))});
  yield* lines([{wait:2},SM('It’s so normal.',{time:1.4}),{wait:1.4},SM('I used to think it should look different. Like there should be— I don’t know. Something.',{time:3.6}),{wait:1}]);
  const c=yield* choosing([{id:'tree',label:'“It’s just a tree.”'},{id:'know',label:'“I know.”'},{id:'quiet',label:'Say nothing'}],{timeout:14,fallback:'quiet'});said('normal',c);
  if(c==='tree')yield* lines([Y('It’s just a tree.',{time:1.2}),{wait:1},SM('Yeah. Just a tree.',{time:1.6})]);
  else if(c==='know')yield* lines([Y('I know.',{time:.9}),{wait:2}]);
  else yield* lines([{wait:3.2}]);
  yield* lines([{wait:1.6},SM('Jamie would hate this. Us just standing here.',{time:2.2,face:'amused'})]);
  const c2=yield* choosing([{id:'race',label:'“Race you to the end of the street.”'},{id:'swing',label:'“He’d be on the swing.”'},{id:'quiet',label:'Say nothing'}],{timeout:14,fallback:'quiet'});said('jamieOak',c2);
  if(c2==='race')yield* lines([Y('Race you to the end of the street.',{time:1.8}),{wait:1},N('Sam laughs. Really laughs, like he didn’t know he was going to.',{time:3}),SM('We’re at the end of the street.',{time:1.8,face:'happy'}),{wait:1},SM('He said that every single time.',{time:2})]);
  else if(c2==='swing')yield* lines([Y('He’d be on the swing.',{time:1.2}),SM('Standing on it. Going too high.',{time:1.8,face:'happy'}),{wait:.6},SM('And Alex would be taking a picture of him going too high.',{time:2.6})]);
  else yield* lines([{wait:1.6},SM('He’d have climbed it by now.',{time:1.6})]);
  yield* lines([{wait:3}]);
  yield* childrenScene();}
 // ---- the children on bikes --------------------------------------------------------------------------------------------------------------------------
 function kidsStart(){for(const R of Object.values(KIDS)){R.show(true);R.v=3.8;}
  const g=KIDS.girl,b=KIDS.boy,a0=SP(1084,1.6),b0=SP(1080,-1.2);g.place(a0.x,a0.z,heading(1084));b.place(b0.x,b0.z,heading(1080));
  // up the street, round the end of it, once, and stop at the curb near the bench
  const loop=(r,lat0)=>[SP(1118,lat0),SP(1132,lat0*.6),[1142,-r],[1150,0],[1142,r],[1134,lat0*.4]].map(q=>Array.isArray(q)?(()=>{const p=groundPoint(q[0],q[1]);return [p.x,p.z];})():[q.x,q.z]);
  g.ride(loop(7.2,1.6).concat([[SP(1129.5,-2.4).x,SP(1129.5,-2.4).z]]),{v:4,then:R=>{C.flags.girlStop=true;}});
  b.ride(loop(6.2,-1.2).concat([[SP(1127,-.9).x,SP(1127,-.9).z]]),{v:4.3,then:R=>{C.flags.boyStop=true;}});
  C.kids=true;}
 function* childrenScene(){stageTo(11);go('a2-kids');checkpoint('a2-children');
  // ordinary neighbourhood activity: first you hear them
  kidsStart();sound('a2Bell',KIDS.girl.bike.group.position,{gain:.5});
  yield* until(()=>C.flags.girlStop&&C.flags.boyStop||C.pt>40,45);
  SAMA.lookAt=KIDS.girl.bike.group.position;
  yield* wait(.8);
  // they talk, the way kids do; then they go
  say([KID('My mom said seven-thirty.',{time:2,from:KIDS.girl}),KID('It’s not seven-thirty.',{time:1.6,from:KIDS.boy}),KID('It’s like seven-thirty.',{time:1.6,from:KIDS.girl})]);
  yield* until(()=>!busy(),12);
  {const g=KIDS.girl,b=KIDS.boy,gp=[[SP(1110,-2.2).x,SP(1110,-2.2).z],[SP(1060,-2.2).x,SP(1060,-2.2).z],[SP(980,-2.2).x,SP(980,-2.2).z]],bp=[[SP(1122,1.8).x,SP(1122,1.8).z],[SP(1116,8).x,SP(1116,8).z],[SP(1114.2,14).x,SP(1114.2,14).z]];
   g.ride(gp,{v:4.4,stopAt:false,then:R=>{R.show(false);}});later(1.1,()=>b.ride(bp,{v:2.6,then:R=>{R.v=0;C.flags.boyHome=true;}}));
   later(1.8,()=>{sound('a2Bell',g.bike.group.position,{gain:.45});});}
  yield* wait(1.6);
  // the line
  yield* lines([KID('See you tomorrow!',{time:2.4,from:KIDS.girl})]);
  yield* wait(.6);if(KIDS.boy.visible){KIDS.boy.lookAt=KIDS.girl.bike.group.position;}
  yield* lines([KID('Bye!',{time:1.2,from:KIDS.boy})]);
  yield* wait(2.6);SAMA.lookAt=null;
  // the two of you
  yield* lines([{wait:1.4},SM('We used to do that.',{time:2.2,face:'sad'}),{wait:1},Y('Yeah.',{time:1.2}),{wait:4.2},SM('Feels like it was yesterday.',{time:2.6,face:'tearful'})]);
  cry(.35,8);
  yield* lines([{wait:6}]);
  for(const R of Object.values(KIDS))if(!R.path)R.show(false);
  yield* leaveScene();}
 // ---- the streetlights come on ----------------------------------------------------------------------------------------------------------------------
 function* leaveScene(){stageTo(12);go('a2-leave');checkpoint('a2-leave');
  if(C.h<19.3)C.h=19.3;C.clockRate=10;
  yield* wait(2);TOWN.lampsOn(true);sound('click',SP(1130,6,6),{gain:.12});
  yield* lines([{wait:2.6},N('Down the street, the streetlights come on. One, and then the next one, and then all of them, the cold white kind.',{time:4.4}),{wait:1.6},SM('Rule four.',{time:1.4})]);
  const c=yield* choosing([{id:'home',label:'“When the streetlights come on, you go home.”'},{id:'nod',label:'Nod'}],{timeout:12,fallback:'nod'});said('rule4',c);
  if(c==='home')yield* lines([Y('When the streetlights come on, you go home.',{time:2.4}),{wait:1},SM('Come on. My mom made the thing.',{time:1.8,face:'happy'})]);
  else yield* lines([{wait:1.4},SM('Come on. My mom made the thing.',{time:1.8})]);
  // he goes on a few steps ahead, and turns, and waits for you
  {const q=SP(1128,-1.2);samGo(q,{speed:1.05,then:a=>{a.faceTo(ME().x,ME().z);C.flags.samWaits=true;}});}
  objective('','Look back, if you want. Then go with Sam.');
  offer('look-back','Look back at the oak',()=>({x:L.oakW.x,y:L.oakW.y+4,z:L.oakW.z}),{r:40,look:true,size:4,cone:.2,once:true});
  const t0=C.pt;yield* until(()=>C.flags['look-back']||(D(ME(),SP(1128,-1.2))<4.5&&C.pt-t0>6)||C.pt-t0>40,45);
  if(C.flags['look-back']){C.keep.looked={...C.keep.looked,oakBack:true};yield* lines([N('The oak, in the last of the light. Its leaves moving a little. The swing still going, just barely, from when somebody pushed it.',{time:5}),{wait:1.6},N('That’s all.',{time:2})]);}
  else unoffer('look-back');
  yield* until(()=>C.flags.samWaits,12);
  yield* lines([{wait:.8},SM('You coming?',{time:1.2})]);
  objective('','');
  {const q=SP(1080,-6.9);samGo(q,{speed:1.15});}
  yield* until(()=>D(ME(),SP(1128,-1.2))<5||C.pt-t0>90,30);
  yield* lines([{wait:1.4}]);
  C.fadeOut=0;C.fadeOutDur=5.5;C.after=()=>{go('a2-end');X.end();};}
 // ---- the end card by itself (DEV) ----------------------------------------------------------------------------------------------------------------------
 function sceneEnd(){go('a2-end');o.fade(1);objective('');C.endT=0;later(1.2,()=>X.end());}
 // ---- sections: where each starts, for Continue and DEV, and the beginning from Aftermath I's end card ---------------------------------------------
 function startDrive(){go('a2-drive');world2021();setDay(17.73);
  Object.assign(DRV,{d:L.start.d,v:0,lat:L.start.lat,park:0,parked:false,on:true});CAR.inside(true);CAR.notebook.visible=true;CAR.cap.visible=C.keep.cap==='you';C.flags.capWith=false;placeCar();
  const s=CAR.seatWorld(-1);placeMe({x:s.x,z:s.z},s.a);seatPose();C.driving=true;SAMA.show(false);
  {const q=SP(L.curb.d,L.curb.lat);SAMA.show(true);SAMA.stopFollow();SAMA.place(q.x,q.z,toward(q,SP(L.curb.d,0)));SAMA.pin={x:q.x,z:q.z,a:toward(q,SP(L.curb.d,0))};SAMA.gest(G(ACT.seat(.2,{hands:'knees',lean:.2})));}
  checkpoint('a2-drive');C.fadeIn=0;C.fadeInDur=2.8;C.carEngine=true;
  task('drive',sceneDriveScript());}
 function startStreet(){go('a2-street');world2021();setDay(17.82);parkCar();CAR.notebook.visible=false;CAR.cap.visible=C.keep.cap==='you';C.flags['take-notebook']=true;
  {const s=CAR.seatWorld(-1),a=-CAR.g.rotation.y;placeMe({x:s.x-Math.cos(a)*1.25,z:s.z-Math.sin(a)*1.25},a+.4);}
  {const q=SP(L.curb.d,L.curb.lat);SAMA.show(true);SAMA.place(q.x,q.z,toward(q,SP(L.curb.d,0)));SAMA.pin={x:q.x,z:q.z,a:toward(q,SP(L.curb.d,0))};SAMA.gest(G(ACT.seat(.2,{hands:'knees',lean:.2})));}
  C.flags.texted=true;C.fadeIn=0;task('street',streetScript());}
 function startSam(){go('a2-sam');world2021();setDay(17.86);parkCar();CAR.notebook.visible=false;
  {const q=SP(L.curb.d-5.5,-5.9);placeMe(q,toward(q,SP(L.curb.d,-5.4)));}
  {const q=SP(L.curb.d,L.curb.lat);SAMA.show(true);SAMA.place(q.x,q.z,toward(q,SP(L.curb.d-5.5,-5.9)));SAMA.lookAt=camera.position;}
  C.flags.texted=true;C.fadeIn=0;task('sam',samScene());}
 function startWalk(){go('a2-walk');world2021();setDay(17.95);parkCar();CAR.notebook.visible=false;
  {const q=SP(L.curb.d+2,-6.9);placeMe(q,heading(L.curb.d));const s=SP(L.curb.d+1.4,-5.9);SAMA.show(true);SAMA.place(s.x,s.z,heading(L.curb.d));}
  C.fadeIn=0;task('walk',walkScene());}
 function startAlex(){go('a2-alex');world2021();setDay(18.12);parkCar();CAR.notebook.visible=false;
  {const q=SP(572,6.9);placeMe(q,heading(572));const s=SP(571,5.9);SAMA.show(true);SAMA.place(s.x,s.z,heading(571));samWalks();}
  C.fadeIn=0;task('alex',alexScene());}
 function startJamie(){go('a2-jamie');world2021();setDay(18.36);parkCar();CAR.notebook.visible=false;
  {const q=SP(L.jamieD-46,6.9);placeMe(q,heading(L.jamieD-46));const s=SP(L.jamieD-47,5.9);SAMA.show(true);SAMA.place(s.x,s.z,heading(L.jamieD));samWalks();}
  C.flags.capWith=C.keep.cap==='you';C.fadeIn=0;task('jamie',jamieScene());}
 function startSummer(){go('a2-summer');world2021();setDay(18.6);parkCar();
  {const q=SP(836,6.9);placeMe(q,heading(836));const s=SP(835,5.9);SAMA.show(true);SAMA.place(s.x,s.z,heading(835));samWalks();}C.fadeIn=0;task('summer',summerScene());}
 function startLight(){go('a2-light');world2021();setDay(18.72);parkCar();
  {const q=SP(L.light.d-14,6.9);placeMe(q,heading(L.light.d));const s=SP(L.light.d-15,5.9);SAMA.show(true);SAMA.place(s.x,s.z,heading(L.light.d));samWalks();}C.fadeIn=0;task('light',streetlightScene());}
 function startTrench(){go('a2-trench');world2021();setDay(18.95);parkCar();
  {const q=SP(L.samD+6,6.9);placeMe(q,heading(L.samD+6));const s=SP(L.samD+5,5.9);SAMA.show(true);SAMA.place(s.x,s.z,heading(L.samD));samWalks();}C.fadeIn=0;task('trench',trenchScene());}
 function startOak(){go('a2-oak');world2021();setDay(19.05);parkCar();
  {const q=SP(1121,-1.5);placeMe(q,heading(1121));const s=SP(1120,-.4);SAMA.show(true);SAMA.place(s.x,s.z,heading(1120));samWalks();}C.fadeIn=0;task('oak',oakScene());}
 function startChildren(){go('a2-kids');world2021();setDay(19.22);parkCar();
  {const q=SP(1153.2,3.4);placeMe(q,toward(q,SP(1130,0)));const s=SP(1154.5,4.6);SAMA.show(true);SAMA.place(s.x,s.z,toward(s,SP(1130,0)));}C.fadeIn=0;task('kids',childrenScene());}
 function startLeave(){go('a2-leave');world2021();setDay(19.32);parkCar();
  {const q=SP(1153.2,3.4);placeMe(q,toward(q,SP(1130,0)));const s=SP(1154.5,4.6);SAMA.show(true);SAMA.place(s.x,s.z,toward(s,SP(1130,0)));}C.fadeIn=0;task('leave',leaveScene());}
 function begin(){go('a2-black');C.cardT=0;o.fade(1);objective('');task('open',(function*(){yield* wait(6.2);startDrive();})());}
 // the coda and the credits are game.js's (coda2026.js, final-credits.js): this hands over, so Continue and DEV reach them the same way
 function startCoda(section){go('a2-coda');o.fade(1);objective('');C.coda=section;later(.05,()=>{o.coda?.(section,{keep:JSON.parse(JSON.stringify(C.keep))});});}
 const SCENE={'aftermath2-start':()=>begin(),'a2-drive':startDrive,'a2-street':startStreet,'a2-sam':startSam,'a2-walk':startWalk,'a2-alex':startAlex,'a2-jamie':startJamie,'a2-summerfield':startSummer,
  'a2-streetlight':startLight,'a2-trench':startTrench,'a2-oak':startOak,'a2-children':startChildren,'a2-leave':startLeave,'aftermath2-end':sceneEnd};
 for(const s of CODA)SCENE[s]=()=>startCoda(s);
 function jump(section){const f=SCENE[section];if(!f){begin();return;}f();}
 // ---- every frame ---------------------------------------------------------------------------------------------------------------------------------
 function update(dt){trackYou(dt);updateDrive(dt);updateNeighbours(dt);
  const people=[ME(),SAMA.visible?SAMA:null,NB.walker.visible?NB.walker:null].filter(Boolean);TOWN.update(dt,{people});
  if(SAMA.visible)SAMA.update(dt,{eye:camera.position});for(const a of NB.all)if(a.visible)a.update(dt,{eye:camera.position});
  for(const R of Object.values(KIDS))if(R.visible)R.update(dt,{groundY:gy,eye:camera.position,clock:C.t});
  samNet(dt);
  if(C.endT>=0){C.endT+=dt;}}
 function afterActors(){}
 function sources(out){TOWN.sources(out);if(C.mowing&&NB.mower.visible)out.push({id:'a2-mower',kind:'mower',pos:NB.mw.position.clone().setY(gy(NB.mw.position.x,NB.mw.position.z)+.4),level:.55});
  if(DRV.on&&C.carEngine!==false){const s=CAR.seatWorld(-1);out.push({id:'a2-car-engine',kind:'idle',pos:new THREE.Vector3(s.x,s.y-.4,s.z),level:.35+DRV.v*.04});}
  if(S.phase==='a2-oak'||S.phase==='a2-kids'||S.phase==='a2-leave'){const SH=world.homes.sam;void SH;out.push({id:'a2-sprinkler',kind:'sprinkler',pos:V3(SP(1088,14,.4)),level:.35});}}
 function blockers(out){TOWN.blockers(out);if(SAMA.visible&&!SAMA.pin)out.push({x:SAMA.x,z:SAMA.z,r:.32,speed:SAMA.v||0});for(const a of NB.all)if(a.visible)out.push({x:a.x,z:a.z,r:.32,speed:0});
  if(CAR.g.visible&&C.carParked){const p=CAR.g.position;out.push({x:p.x,z:p.z,r:1.3,speed:0});const a=-CAR.g.rotation.y;for(const s of [-1.5,1.5])out.push({x:p.x+Math.sin(a)*s,z:p.z-Math.cos(a)*s,r:1.05,speed:0});}}
 function key(code){if(DRV.on&&!DRV.parked&&['KeyW','KeyS','ArrowUp','ArrowDown'].includes(code))return true;return false;}
 function hint(){if(DRV.on&&!DRV.parked&&!DRV.park&&!C.choice)return C.offers.has('park')?[['F','Pull over'],['W','Drive'],['S','Slow down']]:[['W','Drive'],['S','Slow down'],['Mouse','Look around']];return null;}
 function setup(){if(phys)phys.ME.extra=phys.ME.extra||[];if(phys&&!phys.ME.extra.includes(wheelHands))phys.ME.extra.push(wheelHands);}
 function reset(){TOWN.reset();BODY.off();o.eyeLift?.(0);SAMA.show(false);SAMA.stopFollow();SAMA.pin=null;SAMA.lookAt=null;SAMA.gest(null);
  for(const a of NB.all){a.show(false);a.gest(null);a.lookAt=null;}NB.dog.show(false);NB.mw.visible=false;NB.ball.visible=false;NB.lead.visible=false;
  for(const R of Object.values(KIDS)){R.show(false);R.path=null;R.lookAt=null;}if(C.lawnBike)C.lawnBike.group.visible=false;
  DRV.on=false;CAR.g.visible=false;CAR.inside(false);CAR.g.removeFromParent();C.driving=false;C.carParked=false;
  if(phys?.ME?.extra){const i=phys.ME.extra.indexOf(wheelHands);if(i>=0)phys.ME.extra.splice(i,1);}placeTitle(false);
  SAMF.px=null;}
 function state(){return {town:TOWN.state(),drive:{on:DRV.on,d:+DRV.d.toFixed(1),v:+DRV.v.toFixed(2),parked:DRV.parked},kids:Object.fromEntries(Object.entries(KIDS).map(([kk,R])=>[kk,{visible:R.visible,x:+R.x.toFixed(1),z:+R.z.toFixed(1),v:+R.v.toFixed(2)}])),
  notebook:C.notebook?{page:C.notebook.page,seen:C.notebook.seen}:null,body:BODY.active,places:L.ok?{homeD:L.homeD,samD:L.samD,jamieD:L.jamieD,park:L.park,curb:L.curb,light:L.light}:null};}
 return {SAMA,begin,jump,update,afterActors,key,hint,sources,blockers,reset,setup,state,TOWN,NB,KIDS,CAR,DRV,L,SP,BW,BODY,kidBikeOnLawn};
}
