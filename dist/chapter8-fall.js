// Chapter Eight, Acts IV and V: the anchor board and what it means; the breach and the way out; Oak Hollow from the oak
// at five in the morning; the Hendersons' and Jamie; the works and the drawdown; Line Two; the plug; Alex; the last ride.
// Shares the chapter's state and helpers (chapter8.js) and the earlier acts' places (chapter8-scenes.js).
import * as THREE from './three.module.js';
import {headingTo,wrap,createActor} from './people.js';
import {P as PI,newPose,standPose,sitPose,applyPose} from './rig.js';
import {CAST} from './cast.js';
import {LOOKOUT} from './layout.js';
import {paper8} from './chapter8-props.js';
import {cutWorld} from './chapter8-ruin.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

export function fallActs(X){
 const {o,k,C,S,presence,H,HM,danny,brandt,reyes,police,jamie,sam,comp,brain,ch2,ch6,works,WP,sound,gy,light,lightsOn,checkpoint,later,mark,say,J,SM,AL,R,RR,BR,BRR,Y,N,V,
  task,wait,until,lines,quiet,offer,unoffer,near,lookingAt,closeLook,endLook,looking,reading,choosing,fail,hazard,huntStart,huntStop,noise,me,go,objective,busy,main,nav,camera,scene,world,
  stand,walkTo,joinFoot,leave,minds,date,HOUR,CM,enterComplex,lightsBelow,hideReyesBelow,MH,fieldG,nightStreet,q8,stand3}=X;
 const ruin=X.ruin,T=o.tension,CX={x:CM.W(0,0).x,z:CM.W(0,0).z};
 const W=(x,z,y)=>CM.W(x,z,y);
 const fire=X.fire||[];
 // ---- the Hendersons (Mrs. Henderson, Lily, Mr. Henderson), and the neighbours running ---------------------------------------------------------------
 const ADULT=(name,shirt,pants,hair,skin,scale=1.16,old=false)=>({name,scale,face:{jaw:old?.98:.86,cheek:.96,eyeGap:.036,eyeY:.013,browTilt:old?-.06:.1,nose:'straight',mouth:'flat',ears:1,skin,lips:0xa86a58,iris:0x2a2018},
  hair:{style:old?'cropped':'ponytail',color:hair},build:{bulk:old?1.02:.94,shoulders:old?.98:.96,head:.96,posture:old?.08:0,hunch:old?.12:.02},clothes:{shirt,trim:null,sleeves:'long',pants,socks:pants,shoes:0x2a2a2c,sole:0x4a4a48}});
 const mrsH=createActor(scene,nav,ADULT('MRS. HENDERSON',0x7a5a8a,0x2e3446,0x5a3a24,0xd9ad8c),{seed:81});
 const mrH=createActor(scene,nav,ADULT('MR. HENDERSON',0x8a8a7a,0x4a4436,0xc8c4bc,0xd2a68a,1.14,true),{seed:82});
 const lily=createActor(scene,nav,{...CAST.kid,name:'LILY',scale:.78,clothes:{...CAST.kid.clothes,shirt:0xe8a0b0,shorts:0x6a7ab0}},{seed:83});
 const runners=[0,1,2].map(i=>createActor(scene,nav,ADULT('NEIGHBOR',[0x3a5a7a,0x8a3a2a,0x5a6a3a][i],0x2e2e32,[0x2a1e16,0x6a4a2a,0x3a2a1a][i],[0xd8ad8c,0x9a6a4c,0xe2b898][i]),{seed:90+i}));
 const PEOPLE=[mrsH,mrH,lily,...runners];
 // ---- Act IV, scene 10: the anchor board ----------------------------------------------------------------------------------------------------------------
 function boardMesh(){if(!C.boardMesh){const t=paper8('board'),m=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.1),new THREE.MeshStandardMaterial({map:t,color:t?0xffffff:0x2f4637,roughness:.7,emissive:0x1a2a20,emissiveIntensity:.15}));m.name='c8-anchor-board';C.boardMesh=m;}
  const q=CM.at('hBoard');C.boardMesh.position.set(q.x,-1.15,q.z+.12);C.boardMesh.rotation.set(0,0,0);if(!C.boardMesh.parent)scene.add(C.boardMesh);return C.boardMesh;}
 function sceneTruth(from='truth'){go('f8-truth');const A2=X.enlistAlex();
  if(from!=='truth'||!A2.active){enterComplex('hMid',Math.PI/2);joinFoot(sam,CM.at('hWest'),Math.PI/2);joinFoot(jamie,CM.at('kSouth'),Math.PI);joinFoot(A2,CM.at('hMid'),Math.PI);C.flags.samOut=C.flags.anchor1=C.flags.anchor2=C.flags.anchor3=true;C.inv.radio='have';}
  lightsBelow('K');C.flags.alarm=true;C.h=Math.max(C.h,HOUR.truth);C.hMin=HOUR.truth;date(C.h);checkpoint('c8-truth');boardMesh();
  reyes.show(true);const rq=CM.at('hEast');reyes.place(rq.x-2,rq.z,-Math.PI/2);reyes.gest('flashlight');
  task('truth',(function*(){
   objective('Find Reyes.','The long gallery with the windows.');yield* until(()=>CM.cellIdAt(me().x,me().z)==='H'||C.pt>400);
   yield* lines([R('…Sam.',{time:1.2,face:'tired'}),{wait:.8},R('Jamie.',{time:1}),{wait:1},R('Alex.',{time:1.2}),{wait:1.6},N('Reyes goes down on one knee in front of Alex and puts a hand on his shoulder, very carefully, as if he might not be there.',{time:4.2}),
    R('Your mom is going to— okay. Okay. You’re okay.',{time:2.6}),R('It chased me for an hour. I lost it in the dark down there. I found this room.',{time:3})]);
   yield* wait(.6);sound('c8Impact',CM.at('hWindow',-6),{gain:1.2});C.shake=.6;
   objective('The board.','On the north wall. F: look closer.');offer('board','Look at the board',()=>CM.at('hBoard',1.15),{r:4.5,look:true,size:2.2,cone:.08,fn:()=>{C.flags.board=true;}});
   yield* until(()=>C.flags.board||C.pt>560);
   yield* looking(CM.at('hBoard',1.15),[N('A green steel board. Brass tags, typed, one for each chamber, a needle under every one.',{time:3.6}),N('CH. 1 — A.R. — 9/58. CONN. LOST 2/66.',{time:3}),N('CH. 4 — R.A.C. — 8/66. CONN. LOST 3/79.',{time:3}),
    N('CH. 7 — E.L. · T.L. — 4/74. CH. 14 — D.W. — 8/91. VACATED 9/91 — BREACH.',{time:4}),N('Fifteen, sixteen, seventeen: no tags. Three needles, all of them down on the pin.',{time:3.4}),N('Along the bottom: BARRIER 1. BARRIER 2. BARRIER 3 (ORIGINAL, 1958). All three of those needles are moving.',{time:4.2})],{back:2.6,eye:1.5,kind:'board',min:2});
   yield* lines([SM('Fifteen was mine. I watched a needle like that, in my door. It was up the whole time I was in there.',{time:3.6,face:'afraid'}),AL('Mine too. It went down when you opened it.',{time:2.4}),
    R('Those chambers weren’t just holding the children.',{time:2.6}),SM('They were holding something else.',{time:2.2,face:'afraid'})]);
   sound('c8Impact',CM.at('hWindow',-8),{gain:1.6});C.shake=.9;T?.jolt?.(1,{rise:1,hold:20,why:'it, through the wall'});
   yield* lines([{wait:.4},SM('When we got out, the walls started moving.',{time:2.4}),R('The connections were keeping it in place.',{time:2.6}),Y('We let it out?',{time:1.4}),R('You got your friends back.',{time:2.2}),
    {wait:.4,act:()=>{sound('c8Impact',CM.at('hWindow',-8),{gain:1.8});C.shake=1;}},R('Whatever these people built, it wasn’t going to hold forever.',{time:3})]);
   sceneBreach('breach');})());}
 // ---- Act IV, scene 11: it comes through the barrier; the way out comes apart ----------------------------------------------------------------------------------
 function sceneBreach(from='breach'){go('f8-breach');const A2=X.enlistAlex();
  if(from!=='breach'||!A2.active){enterComplex(from==='escape'?'kMid':'hMid',from==='escape'?Math.PI:Math.PI);joinFoot(sam,CM.at('hWest'),Math.PI);joinFoot(jamie,CM.at('kSouth'),Math.PI);joinFoot(A2,CM.at('hMid'),Math.PI);reyes.show(true);reyes.place(CM.at('hEast').x-2,CM.at('hEast').z,Math.PI);reyes.gest('flashlight');Object.assign(C.flags,{samOut:true,anchor1:true,anchor2:true,anchor3:true,board:true});C.inv.radio='have';}
  boardMesh();lightsBelow('K');C.h=Math.max(C.h,HOUR.breach);C.hMin=HOUR.breach;date(C.h);presence.show(true);
  task('breach',(function*(){
   if(from==='breach'){
    // through the windows: the far end of the main chamber, the original barrier: something pushes on it from behind; the ribs go
    presence.showMass(true,{at:W(1,92,-2),r:11,squash:[1.4,1,.8]});presence.lean(.2);
    yield* lines([N('Through the long windows, the main chamber: a drum of concrete the size of a house hanging over a black hole in the floor. And at the far end, the wall of ribs.',{time:4.6})]);
    presence.lean(.6);sound('c8Collapse',W(1,86,-4),{gain:1.6});C.shake=1;for(let i=0;i<4;i++)later(.3+i*.35,()=>presence.impact(W(-8+i*5,85,-6+i*2),{n:14,power:1.2}));
    CM.barrier.children.forEach((r2,i)=>{if(i<9&&i%2===0){r2.rotation.x=-.25-Math.random()*.2;r2.position.z=85-1.2;}});
    presence.set(0,{root:[W(1,86,-4).x,-4,W(1,86,-4).z],dir:[0,.1,-1],len:22,r0:3.4,r1:.6,state:'emerge',speed:1.4});presence.set(1,{root:[W(-6,86,0).x,0,W(-6,86,0).z],dir:[.2,-.1,-1],len:18,r0:2.6,r1:.5,state:'emerge',speed:1.2});
    presence.set(2,{root:[W(1,74,-14).x,-14,W(1,74,-14).z],dir:[0,1,0],len:20,r0:3,r1:.7,state:'emerge',speed:1});
    yield* lines([N('The ribs break outward. Something comes through after them, wet and dark and the width of a road, and doesn’t end.',{time:4.4}),AL('That’s it. That’s IT.',{time:1.4,face:'terrified'}),R('MOVE. Everybody MOVE.',{time:1.4})]);
    later(1.5,()=>{presence.strike(0,W(4,54,-2),{onLand:p=>{sound('c7Glass',W(5,52,-1.5),{gain:1.6});C.shake=1;}});});
    yield* wait(2.2);
    // the hunter: out of the chamber, past them in the hall, not after anyone: getting away from it
    HM.show(true);H.reset();HM.show(true);H.place(W(-6,48).x,W(-6,48).z,0);H.script([{to:()=>[W(-6,40).x,W(-6,40).z],speed:5,state:'run',free:true},{to:()=>[W(-4,34).x,W(-4,34).z],speed:5,state:'run',free:true},{act:()=>{HM.show(false);H.reset();}}]);
    yield* lines([N('The long thing from the houses goes past the end of the hall flat out, on its knuckles. It doesn’t even look at you.',{time:3.6}),J('It’s RUNNING. From THAT.',{time:1.4,face:'terrified'})]);}
   checkpoint('c8-escape');C.mood='escape';C.mindKey=null;presence.show(true);presence.showMass(true,{at:W(1,90,-2),r:11});
   objective('Get out.','North. The way you came. The crew room if the hall is down.');
   // the south hall comes down between you and the crew room's door: the way is round through the crew room
   hazard({at:W(3.5,41,-3),r:1.6,warn:2.2,section:'c8-escape',n:24,power:1.2,onFall:()=>{CM.extraSolids.push({x:3.5,z:41,hw:1.6,hd:1.4,id:'K-fall'});mark('the south hall is down');say([AL('This way! Through the crew room! The back!',{time:1.8,face:'determined'})]);}});
   const A3=X.alex;for(const c of [sam,jamie,A3].filter(Boolean)){c.footBoost=1.5;}
   yield* until(()=>{const id=CM.cellIdAt(me().x,me().z);return id==='J'||C.pt>900;});
   // the junction hall: the west wing's water coming in; a beam down; the bulkhead's frame twisting
   CM.ST.waterWant=.5;sound('c6Splash',CM.at('jWest',0),{gain:1.2});hazard({at:W(4,26.5,-3),r:1.5,warn:2,section:'c8-escape',n:20});
   later(1.2,()=>{CM.setDoor('bulkhead',.42);sound('c8Metal',CM.at('bulkhead',1.4),{gain:1.3});C.shake=.6;});
   yield* lines([SM('The door’s coming down— it’s jammed, it’s twisting—',{time:2.2,face:'afraid'}),J('UNDER IT! Get under!',{time:1.4})]);
   objective('Under the bulkhead.','Crouch (C).');
   yield* until(()=>{const id=CM.cellIdAt(me().x,me().z);return id==='B'||C.pt>1100;});
   // the gallery: up through the floor, in the middle of it; then the crane comes off its rail
   presence.set(3,{root:[W(3,14,-8).x,-8,W(3,14,-8).z],dir:[0,1,0],len:13,r0:2.6,r1:.5,state:'emerge',speed:2.2});sound('c8Collapse',W(3,14,-3),{gain:1.6});C.shake=1;presence.impact(W(3,14,-3),{n:30,power:1.6});
   CM.extraSolids.push({x:3,z:14,hw:2.6,hd:2.6,id:'limb'});
   later(1,()=>{presence.strike(3,W(-6,14,-2.5),{hold:2.6,onLand:()=>{C.shake=.8;}});});
   hazard({at:W(-2,14,-3),r:2.2,warn:3.2,section:'c8-escape',n:26,power:1.4,onFall:()=>{CM.ST.crane=1;}});
   yield* lines([R('ROUND IT! The side! Stay by the wall!',{time:1.8})]);
   yield* until(()=>{const id=CM.cellIdAt(me().x,me().z);return id==='S1'||id==='A'||C.pt>1300;});
   checkpoint('c8-ladder');
   // the shaft: up, one at a time: Sam, Alex, Jamie, Reyes; you last; it is in the stairwell below you
   objective('Climb.','The ladder. Hold W / F.');presence.strike(3,W(0,4,-2),{hold:3});
   yield* lines([R('UP. Sam, go. Alex. Jamie. GO.',{time:2}),{wait:1.6},N('They go up the rungs into the dark. Their lights go small.',{time:3})]);
   for(const c of [sam,X.alex,jamie].filter(Boolean))c.person.group.visible=false;reyes.show(false);
   offer('climbup','Climb',()=>CM.at('ladder',1.4),{r:1.8,hold:2.6,tick:()=>{if(Math.random()<.1)sound('c6Clank',CM.at('ladder',1.4),{gain:.3});},fn:()=>{}});
   yield* until(()=>C.flags.climbup||C.pt>1500);
   C.fadeOut=0;C.after=()=>sceneSurface('surface');})());}
 // ---- Act V, scene 12: Oak Hollow from the oak ------------------------------------------------------------------------------------------------------------------
 function surfaceWorld(){CM.show(false);if(nav.room===CM.nav)nav.setRoom(null);presence.reset();presence.show(true);huntStop();if(C.boardMesh)C.boardMesh.removeFromParent();
  nightStreet();X.ch3?.creature?.show?.(false);cutWorld(world);ruin.show(true);ruin.stage(1);ruin.truck.g.visible=true;nav.setRoom(ruin.room);lightsOn(true);for(let i=0;i<6;i++)light(i,null);
  light(0,{x:ruin.F.center?.x??0,y:(ruin.F.center?.y??0)+3,z:ruin.F.center?.z??0},{intensity:40,dist:34,color:0xff8a3a,flicker:.6});
  const car=k.carA;car.show(true);const cq=main(1000,-6.4),cq2=main(990,-6.4);car.park(cq.x,cq.z,headingTo(cq.x,cq.z,cq2.x,cq2.z));car.lights=true;police.attach?.(true);
  const cb=k.carB;cb.show(true);const bq=main(895,3),bq2=main(905,3);cb.park(bq.x,bq.z,headingTo(bq.x,bq.z,bq2.x,bq2.z));cb.lights=true;
  for(const [i,f] of fire.entries()){f.show(true);const q=main(903+i*2,-7.2-i);f.place(q.x,q.z,headingTo(q.x,q.z,ruin.F.center?.x??q.x,ruin.F.center?.z??q.z+1));}
  C.amb={traffic:0,insects:.1,wind:.5,life:0,forest:0,tunnel:0,water:.3};C.where='street';}
 function fourOut(at){const A2=X.enlistAlex();const q=at;joinFoot(sam,{x:q.x+.9,z:q.z+.6},0);joinFoot(A2,{x:q.x-.8,z:q.z+.5},0);joinFoot(jamie,{x:q.x+.2,z:q.z+1.4},0);reyes.show(true);reyes.place(q.x+1.6,q.z-.6,0);reyes.gest('flashlight');minds();}
 function sceneSurface(from='surface'){go('g8-surface');surfaceWorld();C.h=Math.max(C.h,HOUR.surface);C.hMin=HOUR.surface;date(C.h);
  if(!fieldG.parent)scene.add(fieldG);fieldG.userData.hole.visible=true;fieldG.userData.lid.visible=true;fieldG.userData.lid.position.set(MH.at.x+.7,MH.at.y+.04,MH.at.z+.2);fieldG.userData.truck.visible=false;
  const at={x:MH.at.x,z:MH.at.z+1.2};o.placePlayer({x:at.x,z:at.z,a:headingTo(at.x,at.z,main(1100,0).x,main(1100,0).z),mode:'walk',bike:null});fourOut(at);
  Object.assign(C.flags,{samOut:true,anchor1:true,anchor2:true,anchor3:true,board:true});checkpoint('c8-surface');C.fadeIn=0;C.mood='escape';C.mindKey=null;
  task('surface',(function*(){
   yield* lines([{wait:1.2},N('The field. Grey light in the east, not dawn yet. Sirens, a lot of them, all over town.',{time:3.6}),N('The air smells like gas and smoke and wet dirt.',{time:2.6})]);
   objective('The street.','Down from the oak.');
   yield* until(()=>{const L=nav.locate(me().x,me().z);return L.d<1128||C.pt>120;});
   yield* lines([N('Oak Hollow Drive. From the cul-de-sac you can see down it.',{time:2.6}),N('Halfway to Sam’s the road isn’t there. The whole width of it is a hole. The Hendersons’ garage has gone down into it.',{time:4.2}),
    N('Past Sam’s, a house is burning. Fire is coming straight up out of the curb in front of it like a torch.',{time:3.6}),N('A pole is down across the sidewalk. The wires on it are spitting.',{time:3}),
    SM('That’s our street.',{time:1.4,face:'shocked'}),AL('It got out. It got all the way out.',{time:2,face:'terrified'})]);
   // down at Summerfield: the road lifts, splits, goes, with a car on it; something under the intersection the size of the intersection
   yield* until(()=>{const L=nav.locate(me().x,me().z);return L.d<1100||C.pt>220;});
   ruin.heave();C.shake=.4;later(3.4,()=>{C.shake=.9;T?.jolt?.(1,{rise:1,hold:14,why:'Summerfield'});});later(4.6,()=>{const p=ruin.pits.heave;presence.set(4,{root:[p.c.x,p.c.y-p.depth,p.c.z],dir:[0,1,.1],len:15,r0:2.8,r1:.5,state:'emerge',speed:1.2});});
   later(9,()=>presence.retract(4));
   yield* lines([{wait:.4},N('Down at Summerfield the street comes up. All of it, at once, like something underneath it stood up.',{time:4}),{wait:1.2},N('It splits. A car that was stopped in the middle of the intersection goes down into it nose first, its lights still on.',{time:4.2}),
    {wait:1},N('For a second something comes up out of the hole after it, bigger than the hole, and goes back down.',{time:3.6}),R('Get to my car. My car. Past Sam’s. GO.',{time:2.2})]);
   for(const [i,r2] of [0,1,2].entries()){const a=runners[r2];a.show(true);const q=main(1040-i*7,-9-i*2),q2=main(880,-8+i);a.place(q.x,q.z,headingTo(q.x,q.z,q2.x,q2.z));a.walk([[q2.x,q2.z]],{speed:2.6+i*.3});}
   sceneStreet('street');})());}
 // ---- Act V, scene 13: the Hendersons'; Jamie -----------------------------------------------------------------------------------------------------------------
 const JD={on:false,x:0,z:0,a:0};
 function sceneStreet(from='street'){go('g8-street');if(from!=='street'){surfaceWorld();const at=main(1060,-1);o.placePlayer({x:at.x,z:at.z,a:headingTo(at.x,at.z,main(1030,0).x,main(1030,0).z),mode:'walk',bike:null});fourOut({x:at.x,z:at.z+1});}
  const Hh=ruin.H;C.h=Math.max(C.h,HOUR.street);C.hMin=HOUR.street;date(C.h);checkpoint('c8-hendersons');C.mood='escape';C.mindKey=null;
  for(const a of [mrsH,mrH,lily])a.show(false);
  task('street',(function*(){
   // Mrs. Henderson on her lawn, screaming at her own front door; her father-in-law and her girl inside
   mrsH.show(true);const mq=Hh.lawn;mrsH.place(mq.x,mq.z,headingTo(mq.x,mq.z,Hh.doorAt.x,Hh.doorAt.z));mrsH.gest?.('point',Hh.doorAt);
   yield* lines([V('MRS. HENDERSON','Lily! LILY! The door won’t— it won’t open— my father-in-law is in the garage— somebody HELP me!',{time:4}),J('That’s the Hendersons’. That’s Lily.',{time:1.6,face:'afraid'})]);
   objective('Help them.','The front door. The header’s come down on it.');
   yield* until(()=>near(Hh.doorAt,5)||C.pt>200);
   yield* lines([SM('The beam over the door’s come down. It’s pinning it. Lift the beam and it’ll open.',{time:3,face:'determined'}),SM('A jack. Her car. Every car has one.',{time:2.2})]);
   // the jack: out of the trunk; under the header; pumped while Jamie pulls the door
   const trunk=main(Hh.P.u-4.5,9.6);trunk.y=gy(trunk.x,trunk.z);
   offer('jack','Take the jack',{x:trunk.x,y:trunk.y+.8,z:trunk.z},{r:2.4,fn:()=>{C.flags.haveJack=true;sound('c6Clank',trunk,{gain:.6});}});
   yield* until(()=>C.flags.jack||C.pt>320);
   offer('jackset','Put the jack under the beam',{x:Hh.jackAt.x,y:Hh.jackAt.y+.4,z:Hh.jackAt.z},{r:2.2,fn:()=>{C.flags.jackSet=true;Hh.jack.visible=true;}});
   yield* until(()=>C.flags.jackset||C.pt>380);
   stand(jamie,{x:Hh.doorAt.x+.6,z:Hh.doorAt.z+(Hh.front||1)*.9},{look:()=>Hh.doorAt});
   offer('pump','Pump the jack',{x:Hh.jackAt.x,y:Hh.jackAt.y+.4,z:Hh.jackAt.z},{r:2.2,hold:5,tick:(dt,v)=>{Hh.post.position.y=Hh.jackAt.y+1.1+v*.4;Hh.header.rotation.z=(Hh.sideK||1)*.32*(1-v*.8);if(Math.random()<dt*3)sound('c6Clank',Hh.jackAt,{gain:.35});},
    fn:()=>{C.flags.doorFree=true;Hh.door.visible=false;sound('c7Door',Hh.doorAt,{gain:1});}});
   yield* until(()=>C.flags.doorFree||C.pt>520);
   lily.show(true);lily.place(Hh.doorAt.x,Hh.doorAt.z,headingTo(Hh.doorAt.x,Hh.doorAt.z,Hh.lawn.x,Hh.lawn.z));lily.walk([[Hh.lawn.x+.3,Hh.lawn.z]],{speed:1.6});
   yield* lines([N('The door swings. Lily comes out of the dark hall into her mother’s arms.',{time:3}),V('MRS. HENDERSON','Grandpa— Grandpa’s in the garage— he can’t get out from under it—',{time:3})]);
   // the garage: its door sagged, a gap under it; the old man in there; Jamie goes under it and holds it up
   mrH.show(true);const gq=Hh.garageAt;mrH.place(gq.x,gq.z-(Hh.front||1)*1.6,0);
   yield* lines([J('I’ve got him. I can hold it. Go— get them to the car!',{time:2.4,face:'determined'}),SM('Jamie—',{time:.8}),J('GO! I’ve GOT it!',{time:1.2,face:'determined'})]);
   C.jamieHold=true;stand(jamie,{x:gq.x,z:gq.z+(Hh.front||1)*.25},{look:()=>({x:gq.x,y:gq.y+1.2,z:gq.z})});ruin.H.garage.position.y=gq.y+.55;
   objective('Get Lily and her mom to Reyes’s car.','Round the hole. Stay off the edge.');
   C.escort=[mrsH,lily];C.escortT=0;
   checkpoint('c8-garage');
   yield* until(()=>{const car=k.carA;return Math.hypot(me().x-car.x,me().z-car.z)<5||C.pt>800;});
   // it comes out of the hole beside the house
   const p=ruin.pits.sams,eq=p.W(p.a*.4,p.b*.85);HM.show(true);H.reset();HM.show(true);H.place(eq.x,eq.z,0);
   yield* lines([N('Behind you, at the edge of the hole, a long hand comes up over the broken asphalt. Then the rest of it.',{time:3.6}),SM('JAMIE!',{time:.9,face:'terrified'})]);
   mrH.walk([[Hh.lawn.x-1,Hh.lawn.z+1.6],[main(Hh.P.u-6,-6.6).x,main(Hh.P.u-6,-6.6).z]],{speed:.9});X.alex&&walkTo(X.alex,{x:Hh.lawn.x-.6,z:Hh.lawn.z+1.2},{speed:2.6});
   yield* wait(2.4);
   // Jamie lets the door go when Mr. Henderson is out, and runs; it is faster than him
   C.jamieHold=false;ruin.H.garage.position.y=gq.y+.2;sound('c7Door',gq,{gain:1.1});stand(jamie,null);
   const jT=main(Hh.P.u-2,-5.6);walkTo(jamie,jT,{speed:3.6});
   H.script([{to:()=>[jamie.px,jamie.pz],speed:6,state:'run',free:true,near:1.6},{act:()=>{C.jamieHit=C.t;sound('c7Strike',{x:jamie.px,y:1,z:jamie.pz},{gain:1.5});C.shake=.7;JD.on=true;JD.x=jamie.px;JD.z=jamie.pz;JD.a=jamie.pa;jamie.script=null;jamie.follow=null;mark('JAMIE');}},
    {wait:1.4,state:'crouch',look:()=>({x:JD.x,y:.4,z:JD.z})},{act:()=>{for(let i=0;i<3;i++)later(i*.35,()=>sound('c8Shot',reyes.pos||camera.position,{gain:1.2}));}},{wait:.8,state:'hit'},
    {to:()=>[eq.x,eq.z],speed:5,state:'run',free:true},{act:()=>{HM.show(false);H.reset();}}]);
   yield* until(()=>C.jamieHit||C.pt>900,12);
   C.flags.jamieDead=true;T?.jolt?.(1,{rise:1,hold:30,why:'Jamie'});
   yield* lines([N('It reaches him on the lawn before the curb, and throws him, the whole of him, against the side of the Hendersons’ car.',{time:4}),{wait:.6},N('Reyes is firing. Three times. It goes back down into the hole.',{time:3})]);
   checkpoint('c8-jamie-death');
   objective('Jamie.','');offer('jamie-kneel','Jamie',()=>({x:JD.x,y:gy(JD.x,JD.z)+.3,z:JD.z}),{r:2.4});
   yield* until(()=>C.flags['jamie-kneel']||C.pt>1100);
   yield* looking({x:JD.x,y:gy(JD.x,JD.z)+.25,z:JD.z},[{wait:1.6},N('He’s on his back in the grass, one arm under him. His eyes are open. He isn’t breathing.',{time:4}),{wait:1.4},
    SM('Jamie?',{time:1,face:'shocked'}),SM('Jamie. Get up.',{time:1.4,face:'sad'}),{wait:2},AL('No. No, no, no.',{time:1.8,face:'sad'}),{wait:1.6},
    N('Reyes kneels and puts two fingers on his neck and keeps them there a long time.',{time:3.4}),{wait:2},R('…I’m sorry.',{time:1.4,face:'sad'}),{wait:1.2},R('I’m so sorry.',{time:1.6,face:'sad'}),{wait:3}],{back:1.1,eye:.9,kind:'jamie',min:4});
   sound('c8Collapse',ruin.pits.sams.c,{gain:1.3});C.shake=.7;ruin.F.spread=Math.max(ruin.F.spread,.6);
   yield* lines([N('The hole takes another piece of the street. The fire has the Kowalskis’ garage now.',{time:3}),R('We have to go. NOW. Get in the car.',{time:2}),SM('We can’t leave him—',{time:1.4,face:'sad'}),
    R('They’ll take him. The firemen. I’ll make sure. I’ll make SURE. Get in the car.',{time:3.2})]);
   offer('car2','Get in the car',()=>({x:k.carA.x,y:gy(k.carA.x,k.carA.z)+1,z:k.carA.z}),{r:3.4});
   yield* until(()=>C.flags.car2||C.pt>1300);
   C.fadeOut=0;C.after=()=>sceneStaging('staging');})());}
 // ---- Act V, scene 14: the works; the drawdown -------------------------------------------------------------------------------------------------------------------
 function worksWorld(){ruin.show(false);if(nav.room===ruin.room)nav.setRoom(null);presence.reset();presence.show(true);for(const a of PEOPLE)a.show(false);for(const f of fire)f.show(false);k.carB.show(false);
  works.attach?.(true);nav.setRoom(works.nav);C.where='works';lightsOn(true);for(let i=0;i<6;i++)light(i,null);light(0,WP(26,6,4),{intensity:30,dist:30,color:0xfff2d0});light(1,WP(17,-3.5,2.6),{intensity:4,dist:9});
  const car=k.carA;car.show(true);const cq=WP(...(X.WS.cruiser||[26,10.5]));car.park(cq.x,cq.z,0);car.lights=true;police.attach?.(true);
  brandt?.show(true);const bq=WP(17.8,-4.6);brandt?.place(bq.x,bq.z,Math.PI/2);brandt?.gest?.(null);C.amb={traffic:0,insects:.1,wind:.45,life:0,forest:.4,tunnel:0,water:1};}
 function threeAtWorks(at){const A2=X.enlistAlex();leave(jamie);joinFoot(sam,{x:at.x+.8,z:at.z+.4},0);joinFoot(A2,{x:at.x-.7,z:at.z+.5},0);reyes.show(true);reyes.place(at.x+1.5,at.z-.4,0);reyes.gest(null);minds();}
 function sceneStaging(from='staging'){go('g8-staging');worksWorld();C.h=Math.max(C.h,HOUR.staging);C.hMin=HOUR.staging;date(C.h);Object.assign(C.flags,{jamieDead:true,samOut:true,anchor1:true,anchor2:true,anchor3:true,board:true});
  const at=WP(19.6,-3.9);o.placePlayer({x:at.x,z:at.z,a:Math.PI/2,mode:'walk',bike:null});threeAtWorks(at);checkpoint('c8-staging');C.fadeIn=0;C.mood='tense';C.mindKey=null;
  task('staging',(function*(){
   yield* lines([{wait:1},N('The Mill Creek works. Brandt’s truck, a generator, a light on a pole. The creek is roaring down its channel, high and brown.',{time:4}),
    BR('It’s coming up the lines. Line Four, the old court, Mill Street. It’s in all of it.',{time:3}),R('Tell them.',{time:1})]);
   objective('The binder.','On the desk in the gatehouse: Procedure 7.');offer('procedure','Read the procedure',()=>WP(18.6,1.25,.25+.85),{r:2.6,look:true,size:.4,cone:.14,fn:()=>task('proc',(function*(){
    yield* reading('procedure',[N('EMERGENCY DRAWDOWN. O.M.C. ISOLATION STRUCTURE (1959). PROCEDURE 7.',{time:3.4}),N('1. Close outer routes: main gates 1A and 1B; the Line 4 drawdown gate in the gallery. 2. Open the drawdown ports in junction J. Line Two runs it to the court.',{time:5}),
     N('3. At the plug platform, drive out latch pins A, B and C. The plug drops. The central junction floods and collapses. Rupture isolated.',{time:4.6}),N('Stamped across it: NOT TO BE OPERATED WHILE CHAMBERS OCCUPIED. Approved: no.',{time:3.6})]);C.flags.procRead=true;})())});
   yield* until(()=>C.flags.procRead||C.pt>300);
   yield* lines([R('They never used it because—',{time:1.4}),SM('Because there were people in there.',{time:2,face:'sad'}),AL('There aren’t now.',{time:1.4,face:'determined'}),{wait:1},
    BR('The gates I know. The ports I know. The plug’s at the court, under the field. You go down Line Two to get to it, with the water.',{time:4}),
    AL('It comes up the water. When the water moves, it moves. It’ll come at us down there.',{time:3,face:'afraid'}),SM('Then we do it fast.',{time:1.4,face:'determined'}),
    R('I’ve got them evacuating everything from Briarwood to Main. Brandt, you’re with the kids. I’m with the kids.',{time:3.6})]);
   sceneOp('gates');})());}
 // ---- Act V, scene 15: the final operation ------------------------------------------------------------------------------------------------------------------------------
 function sceneOp(from='gates'){go('n8-op');if(S.phase!=='n8-op'||from!=='gates'||C.where!=='works'){if(C.where!=='works'&&from!=='line-two'&&from!=='plug'&&from!=='hatch')worksWorld();}
  const at=WP(2.5,0.7);
  if(from==='gates'&&!X.alex?.active){o.placePlayer({x:WP(7.8,-2).x,z:WP(7.8,-2).z,a:-Math.PI/2,mode:'walk',bike:null});threeAtWorks(WP(7.8,-1));}
  C.h=Math.max(C.h,HOUR.op);C.hMin=HOUR.op;date(C.h);Object.assign(C.flags,{jamieDead:true,procRead:true,samOut:true,anchor1:true,anchor2:true,anchor3:true});
  task('op',(function*(){
   if(from==='gates'){checkpoint('c8-gates');C.mood='danger';C.mindKey=null;
    // A. the outer routes: the two main gates on the operating bridge (you and Brandt), and the gallery's Line Four drawdown gate
    objective('Close main gate 1A.','The handwheel on the operating bridge. Hold F. Back off when the water heaves.');
    if(C.pt<1){const p0=me();if(!nav.walkable(p0.x,p0.z)){const q=WP(7.8,-2);o.placePlayer({x:q.x,z:q.z,a:-Math.PI/2,mode:'walk',bike:null});}}
    brandt?.show(true);const bq=WP(3.2,.9);brandt?.place(bq.x,bq.z,Math.PI);
    const wheel=works.wheels?.[0],wq=WP(-3.2,.9,-3+1.1);let surges=0;
    offer('gate1a','Turn the handwheel',wq,{r:1.8,hold:8,tick:(dt,v)=>{if(wheel)wheel.rotation.z+=dt*4;const g=works.mainGates?.[0];if(g)g.leaf.position.y=lerp(g.y,g.y-2.2,v);if(Math.random()<dt*2)sound('c6Grind',wq,{gain:.4});},fn:()=>{C.flags.gateA=true;}});
    const surgeAt=()=>({x:WP(-2,9).x,y:-5,z:WP(-2,9).z});
    while(!C.flags.gateA){yield;if(C.pt>12+surges*14&&surges<4){surges++;const s=surgeAt();presence.set(5,{root:[s.x,-7,s.z],dir:[0,1,-.6],len:9,r0:1.8,r1:.4,state:'emerge',speed:2});sound('c6Splash',s,{gain:1.3});
      say([AL(surges===1?'In the water— BACK! Get back!':'BACK!',{time:1.2,face:'terrified'})]);const z=hazard({at:WP(-1.6,0,-3),r:2.2,warn:2.3,section:'c8-gates',n:18,power:1.2,onFall:()=>{later(1.5,()=>presence.retract(5));}});void z;
      later(2.3,()=>presence.strike(5,WP(-1.6,0,-3),{hold:1}));}}
    yield* lines([BR('One-B’s down! That’s both!',{time:1.6}),SM('The drain gate. In the gallery. The one by the speaker.',{time:2.2})]);
    // the gallery's Line Four drawdown gate (Chapter Six's: the voice stopped when it shut)
    const DD=X.ch6.DD;objective('The Line Four drawdown gate.','North end of the gallery, by the old speaker.');
    offer('dd','Shut the drain gate',()=>DD?DD.at():WP(8.8,-12.15,-3+1),{r:2.2,hold:2.4,tick:(dt,v)=>{if(DD){DD.want=0;DD.open=1-v;DD.update(0);}},fn:()=>{if(DD){DD.want=0;DD.open=0;DD.update(0);}C.flags.dd=true;sound('c6Clank',DD?DD.at():camera.position,{gain:1});}});
    yield* until(()=>C.flags.dd||C.pt>600);
    yield* lines([{wait:.6},SM('That’s what stopped the voice. On Thursday. When I shut it.',{time:2.6}),Y('It was you?',{time:1}),SM('It was you. I said shut it.',{time:1.6}),BR('Outer routes closed. Now the ports.',{time:1.8})]);
    checkpoint('c8-ports');}
   if(from==='gates'||from==='ports'){
    // B. the drawdown ports in J's west wall: down through the bank manhole; two wheels; the water comes in, and so does it
    if(from==='ports'&&C.where!=='works')worksWorld();
    const jq=WP(9,26.4,-5.8);o.placePlayer({x:jq.x,z:jq.z,a:Math.PI,mode:'walk',bike:null});joinFoot(sam,WP(8.4,28),Math.PI);const A2=X.enlistAlex();joinFoot(A2,WP(10,28.4),Math.PI);reyes.show(false);brandt?.show(false);C.fadeIn=0;
    lightsOn(true);light(0,WP(9,30,-3.6),{intensity:6,dist:12,color:0xffe0b0,flicker:.2});light(1,WP(9,25,-3.6),{intensity:4,dist:10});
    yield* lines([N('Junction J, down the ladder from the bank. Brown water to your shins and rising. The Line Two grille at the far end is standing open.',{time:4}),SM('The ports. Two wheels. I’ve got the far one.',{time:1.8})]);
    objective('Open the near port.','The wheel on the west wall. Hold F.');stand(sam,WP(7,30.6),{look:()=>WP(6.5,30.6,-4)});
    offer('port','Turn the port wheel',WP(6.8,26.2,-5.8+1.2),{r:1.8,hold:6,tick:(dt)=>{if(Math.random()<dt*2)sound('c6Grind',WP(6.8,26.2,-4.6),{gain:.4});},fn:()=>{C.flags.port=true;sound('c6Splash',WP(6.6,26.2,-4.3),{gain:1.4});}});
    yield* until(()=>C.flags.port||C.pt>900);
    yield* lines([N('The creek comes in through the wall in a solid brown sheet. It turns, and goes down Line Two, toward the court, carrying everything.',{time:4}),AL('It knows. It’s coming up the pipe— it’s COMING—',{time:1.8,face:'terrified'})]);
    // the hunter, up Line Two against the flow, at them; the surge takes it
    HM.show(true);H.reset();HM.show(true);const gq=WP(9,35);H.place(gq.x,gq.z,Math.PI);H.script([{wait:.6,state:'alert',look:()=>camera.position},{to:()=>[WP(9,31).x,WP(9,31).z],speed:2.4,state:'run',free:true}]);
    yield* lines([SM('THE LADDER! UP!',{time:1,face:'terrified'})]);objective('Up the ladder.','The well on the east side.');
    offer('jladder','Climb',WP(12.85,33.2,-5.8+1.2),{r:2.2,hold:1.6});
    later(4.2,()=>{sound('c6Splash',WP(9,30),{gain:1.6});H.script([{to:()=>[WP(9,36).x,WP(9,36).z],speed:3.4,state:'hit',free:true},{act:()=>{HM.show(false);H.reset();mark('the drawdown takes it down Line Two');}}]);});
    yield* until(()=>C.flags.jladder||C.pt>1100);
    yield* lines([N('From the ladder you see the second port go, Sam’s. The water hits it from behind and it goes down Line Two with everything else, folded up, and is gone.',{time:4.4})]);
    checkpoint('c8-line-two');}
   if(['gates','ports','line-two'].includes(from)){
    // Line Two, with the water, to the court (it is three hundred yards; the ride on the current is not played)
    C.fadeOut=0;let arrived=false;C.after=()=>{arrived=true;};yield* until(()=>arrived,4);
    yield* lines([N('Line Two. Brick, 1908. Three hundred yards of it, with the water.',{time:3})]);
    enterComplex('l2Mid',Math.PI/2);lightsBelow('I');presence.show(true);presence.showMass(true,{at:W(1,90,-2),r:11});X.dismissAlex?.();const A2=X.enlistAlex();
    joinFoot(sam,CM.at('l2End'),Math.PI/2);joinFoot(A2,{x:CM.at('l2End').x-1,z:CM.at('l2End').z},Math.PI/2);reyes.show(true);reyes.place(CM.at('l2End').x-2,CM.at('l2End').z,Math.PI/2);reyes.gest('flashlight');
    brandt?.show(true);brandt?.place(CM.at('l2End').x-3,CM.at('l2End').z,Math.PI/2);C.fadeIn=0;C.areaLock=false;checkpoint('c8-plug');}
   // C. the plug: the catwalk over the main chamber; three pins; it, below and through the wall, at the catwalk
   if(from==='plug'){enterComplex('iwNorth',Math.PI);lightsBelow('I');presence.show(true);presence.showMass(true,{at:W(1,90,-2),r:11});const A2=X.enlistAlex();joinFoot(sam,CM.at('iwNorth'),Math.PI);joinFoot(A2,{x:CM.at('iwNorth').x,z:CM.at('iwNorth').z-1},Math.PI);
    reyes.show(true);reyes.place(CM.at('iwNorth').x,CM.at('iwNorth').z-2,Math.PI);brandt?.show(true);brandt?.place(CM.at('iwNorth').x,CM.at('iwNorth').z-3,Math.PI);checkpoint('c8-plug');}
   C.mood='danger';C.mindKey=null;
   presence.set(0,{root:[W(1,86,-4).x,-4,W(1,86,-4).z],dir:[0,.2,-1],len:20,r0:3.4,r1:.6,state:'probe',probe:[W(-2,72,2).x,2,W(-2,72,2).z]});presence.set(2,{root:[W(1,74,-14).x,-14,W(1,74,-14).z],dir:[0,1,0],len:16,r0:3,r1:.7,state:'probe',probe:[W(0,74,-2).x,-2,W(0,74,-2).z]});
   objective('The plug platform.','Along the catwalk to the south end.');
   yield* until(()=>near(CM.at('ipPins'),4)||C.pt>500);
   yield* lines([BR('There. Three pins through the hanger. Drive them out. Brandt’s sledge.',{time:2.6}),SM('A, B, then C. C last. C’s the one holding it.',{time:2.2,face:'determined'}),AL('When it pulls back, it’s going to hit. Get against the wall.',{time:2.4,face:'afraid'})]);
   stand(sam,{x:CM.at('ipPins').x-1.6,z:CM.at('ipPins').z-.9},{look:()=>CM.at('ipPins',5)});const A3=X.alex;stand(A3,{x:CM.at('ipLadder').x,z:CM.at('ipLadder').z-.6},{look:()=>CM.at('plug',2)});
   for(let i=0;i<3;i++){const name='ABC'[i];objective('Pin '+name+'.','Hold F: the sledge. Get against the wall when it comes.');
    let strikes=0,since=0;offer('pin'+i,'Drive out pin '+name,()=>{const q=CM.pins[i].getWorldPosition(new THREE.Vector3());return {x:q.x,y:q.y,z:q.z};},{r:2,hold:3.2,tick:(dt,v)=>{CM.ST.pins[i]=v*1.7;if(Math.random()<dt*3)sound('c6Clank',CM.at('ipPins',5),{gain:.7});},fn:()=>{CM.ST.pins[i]=2;sound('c6Clank',CM.at('ipPins',5),{gain:1.3});C.shake=.3;}});
    while(!C.flags['pin'+i]){yield;since+=C.dt;if(since>7.5&&strikes<3){since=0;strikes++;const tgt={x:CM.at('ipPins').x,y:5,z:CM.at('ipPins').z+.2};say([AL('IT’S COMING! THE WALL!',{time:1.2,face:'terrified'})]);
      hazard({at:tgt,r:1.6,warn:2.1,section:'c8-plug',n:16,power:1,fatal:true});later(2.1,()=>presence.strike(0,tgt,{hold:.8}));}}}
   // the plug drops; seats in the throat; the water fills the chamber under it; everything it had in the room is pushed back under the plug
   CM.ST.plugWant=1;sound('c8Collapse',CM.at('plug',2),{gain:1.8});C.shake=1.2;T?.jolt?.(1,{rise:1,hold:20,why:'the plug'});mark('the plug');
   later(1.1,()=>{sound('c8Impact',CM.at('throat',-12),{gain:1.8});C.shake=1.4;presence.impact(CM.at('throat',-11),{n:40,power:2});for(let i=0;i<6;i++)presence.retract(i);presence.lean(-.4);});
   yield* lines([N('The hangers sing. The plug goes, the whole drum of it, straight down into the throat, and the chamber jumps like a struck bell.',{time:4.4}),{wait:1},N('The water from Line Two pours in over it. What was in the room goes back under, all of it, the way it came.',{time:4}),
    {wait:1.6},N('And then, under the noise of the water, something you had stopped hearing so long ago you’d forgotten it was there: nothing. It’s gone quiet.',{time:4.6})]);
   presence.showMass(false);C.flags.sealed=true;checkpoint('c8-hatch');
   // the way out: the service ladder up through the roof of the chamber, to the field; the hatch at the top; Alex holds it
   yield* lines([BR('It’s coming down. All of it. The ladder— GO!',{time:1.8})]);objective('The ladder.','South end of the platform. Up.');
   hazard({at:{x:CM.at('iwMid').x,y:4,z:CM.at('iwMid').z},r:2,warn:2.6,section:'c8-hatch',n:18,fatal:true});
   offer('upLadder','Climb',()=>CM.at('ipLadder',1.4),{r:1.8,hold:2});
   yield* until(()=>C.flags.upLadder||C.pt>1800);
   yield* lines([N('The hatch at the top is jammed half open, its counterweight gone. Alex gets his shoulder under it and holds it.',{time:3.8}),AL('GO. Go, I’ve got it—',{time:1.4,face:'determined'}),
    N('You go through. Sam goes through. Something comes down the shaft behind you, a whole slab of the roof, and hits him.',{time:4}),SM('ALEX!',{time:.9,face:'terrified'}),
    N('You and Sam get him by the arms and pull him up out of it into the grass. He’s light. He was always the light one.',{time:4.2})]);
   C.flags.alexHurt=true;sceneOak('oak');})());}
 // ---- Act V, scene 16: the oak; Alex --------------------------------------------------------------------------------------------------------------------------------------
 const OAK=(()=>{const q=main(LOOKOUT.oak.d-.6,LOOKOUT.oak.lat-1.15);return {x:q.x,z:q.z,y:gy(q.x,q.z)};})();
 function sceneOak(from='oak'){go('n8-oak');CM.show(false);if(nav.room===CM.nav||nav.room===works?.nav)nav.setRoom(null);works?.attach?.(false);presence.reset();huntStop();for(const a of PEOPLE)a.show(false);brandt?.show(false);
  nightStreet();cutWorld(world);ruin.show(true);ruin.stage(2);nav.setRoom(ruin.room);C.where='oak';lightsOn(true);for(let i=0;i<6;i++)light(i,null);C.h=Math.max(C.h,HOUR.oak);C.hMin=HOUR.oak;date(C.h);
  Object.assign(C.flags,{jamieDead:true,sealed:true,alexHurt:true,samOut:true,anchor1:true,anchor2:true,anchor3:true});
  const A2=X.enlistAlex();joinFoot(A2,OAK,0);A2.follow=null;A2.brain=null;C.alexSit=true;joinFoot(sam,{x:OAK.x+.9,z:OAK.z+.7},0);leave(jamie);reyes.show(false);k.carA.show(false);
  const at={x:OAK.x-1.4,z:OAK.z+1.4};o.placePlayer({x:at.x,z:at.z,a:headingTo(at.x,at.z,OAK.x,OAK.z),mode:'walk',bike:null});checkpoint('c8-oak');C.fadeIn=0;C.mood='relaxed';C.mindKey=null;
  stand(sam,{x:OAK.x+.75,z:OAK.z+.55},{look:()=>({x:OAK.x,y:OAK.y+.6,z:OAK.z})});
  C.amb={traffic:0,insects:.15,wind:.55,life:.3,forest:0,tunnel:0,water:0};
  task('oak',(function*(){
   yield* lines([{wait:2.4},N('The old oak. He’s sitting against it. You don’t remember getting him here.',{time:3.4}),{wait:2}]);
   objective('Alex.','');offer('alex-sit','Sit with him',()=>({x:OAK.x,y:OAK.y+.7,z:OAK.z}),{r:2.4});
   yield* until(()=>C.flags['alex-sit']||C.pt>120);
   const s=me();closeLook({x:OAK.x,y:OAK.y+.62,z:OAK.z},{back:.95,eye:.85,kind:'alex'});C.lockLook=true;
   yield* lines([{wait:2.4},AL('Did we stop it?',{time:1.8,face:'tired'}),{wait:1.4},Y('Yeah.',{time:1}),{wait:1},AL('Good.',{time:1.2,face:'tired'}),{wait:3.2},
    AL('Where’s Jamie?',{time:1.4,face:'tired'}),{wait:4.6},N('Nobody says anything.',{time:2.4}),{wait:3},N('He understands.',{time:2.2}),{wait:2.6},
    AL('We were supposed to go riding tomorrow.',{time:2.6,face:'sad'}),{wait:4}]);
   C.alexDying=0;yield* wait(9);C.flags.alexDead=true;mark('Alex');
   yield* lines([{wait:1.2},N('His breathing stops. Sam is holding his hand. Neither of you moves for a long time.',{time:4.4}),{wait:6},N('Birds, in the oak. Sirens, far off, getting fewer.',{time:3.2}),{wait:5}]);
   C.lockLook=false;endLook();
   yield* lines([{wait:2},N('Reyes comes up across the grass. He stops a little way off and takes his hat off. He doesn’t say anything for a while.',{time:4.4}),
    R('The evacuation point’s the school. I brought your bikes. Yours and Sam’s. I thought—',{time:3.4}),R('I thought you might want to ride.',{time:2})]);
   sceneRide('ride');})());}
 // ---- Act V, scene 17: the last ride ---------------------------------------------------------------------------------------------------------------------------------------
 function sceneRide(from='ride'){go('n8-ride');if(from!=='ride'||C.where!=='oak'){nightStreet();cutWorld(world);ruin.show(true);ruin.stage(2);nav.setRoom(ruin.room);lightsOn(true);for(let i=0;i<6;i++)light(i,null);}
  C.where='ride';C.h=Math.max(C.h,HOUR.ride);C.hMin=HOUR.ride;date(C.h);Object.assign(C.flags,{jamieDead:true,alexDead:true,sealed:true});C.alexSit=false;X.dismissAlex?.();leave(jamie);
  const st=main(1131,-1.2),st2=main(1120,-1.2),a=headingTo(st.x,st.z,st2.x,st2.z);o.placePlayer({x:st.x,z:st.z,a,mode:'ride',speed:0});comp.putRiding(sam,main(1132,1.4).x,main(1132,1.4).z,a,0);sam.gone=false;sam.follow='ride';brain.enable(sam,true);
  reyes.show(false);k.carA.show(false);k.carB.show(true);const bq=main(640,-6),bq2=main(630,-6);k.carB.park(bq.x,bq.z,headingTo(bq.x,bq.z,bq2.x,bq2.z));k.carB.lights=true;police.attach?.(true);
  checkpoint('c8-ride');C.fadeIn=from==='ride'?0:-1;C.mood='relaxed';C.mindKey=null;C.amb={traffic:0,insects:.25,wind:.4,life:.4,forest:0,tunnel:0,water:0};
  task('ride',(function*(){
   yield* lines([{wait:2.4},N('Saturday. The sun not up yet but nearly.',{time:3}),{wait:1}]);
   objective('Ride.','Down Oak Hollow Drive. The school.');
   yield* until(()=>{const L=nav.locate(me().x,me().z);return L.d<1000||C.pt>240;});
   yield* lines([N('Past Sam’s. His garage door is open. His mom’s car is gone.',{time:3}),{wait:6}]);
   yield* until(()=>{const L=nav.locate(me().x,me().z);return L.d<900||C.pt>360;});
   yield* lines([N('The Kowalskis’ house is a black frame with smoke going up out of it, straight, because there isn’t any wind.',{time:4}),{wait:5}]);
   yield* until(()=>{const L=nav.locate(me().x,me().z);return L.d<800||C.pt>480;});
   yield* lines([N('Jamie’s house. The red chair on the porch.',{time:2.6}),{wait:8}]);
   yield* until(()=>{const L=nav.locate(me().x,me().z);return L.d<680||C.pt>600;});
   yield* lines([{wait:1},SM('I keep thinking they’re right behind us.',{time:2.4,face:'sad'})]);
   C.lookBack=0;C.wantLook=true;objective('','');
   yield* until(()=>C.lookedBack||C.pt>660);C.wantLook=false;
   yield* lines([{wait:1.4},N('The road behind you is empty.',{time:2.6}),{wait:2.6},N('You keep riding.',{time:2.4}),{wait:3}]);
   C.endT=0;})());}
 // ---- every frame ------------------------------------------------------------------------------------------------------------------------------------------------------
 function update(dt){const ph=S.phase;
  for(const a of PEOPLE)if(a.visible)a.update(dt,{eye:camera.position});
  // the people you are getting out: they follow you, a little behind, round the hole
  if(C.escort){C.escortT+=dt;const p=me();C.escort.forEach((a,i)=>{if(!a.visible)return;const d=Math.hypot(a.x-p.x,a.z-p.z);if(d>2.2+i*.8&&!a.walking&&C.escortT>.4){const back=1.4+i*.9,q={x:p.x-Math.sin(p.a)*back+(i?.6:-.6),z:p.z+Math.cos(p.a)*back};if(nav.walkable(q.x,q.z,{r:.3}))a.walk([[q.x,q.z]],{speed:d>6?2.4:1.5});}});}
  if(ph==='n8-ride'&&C.wantLook){const f=new THREE.Vector3();camera.getWorldDirection(f);const p=me(),back=-(f.x*Math.sin(p.a)-f.z*Math.cos(p.a));if(back>.55){C.lookBack+=dt;if(C.lookBack>1.2)C.lookedBack=true;}}
  if(ph==='n8-ride'&&C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n8-end');X.end();}}
  if(C.alexSit&&X.alex){const c=X.alex;c.follow=null;}}
 function afterActors(dt){
  // Jamie on the lawn: on his back, still
  if(JD.on&&jamie.person.group.visible){const g=jamie.person.group,y=gy(JD.x,JD.z);g.position.set(JD.x,y+.12,JD.z);g.rotation.set(-Math.PI/2,0,JD.a*.3,'YXZ');jamie.person.face?.set?.('neutral',{hold:999});}
  // Alex against the oak
  if(C.alexSit&&X.alex){const c=X.alex,pp=c.pose;sitPose(pp,{seat:.06,legs:'bent',t:C.t*(C.flags.alexDead?0:1),hands:'deck',look:0});pp[PI.hp]=C.flags.alexDead?-.5:-.2;const g=c.person.group;g.position.set(OAK.x,OAK.y-.02,OAK.z);g.rotation.set(0,-headingTo(OAK.x,OAK.z,main(1150,0).x,main(1150,0).z),0);applyPose(c.person,pp);c.person.face?.set?.(C.flags.alexDead?'neutral':'tired',{hold:3});}
  // Jamie holding the garage door up
  if(C.jamieHold){const c=jamie,pp=c.pose;for(const s of [PI.lh,PI.rh]){pp[s+1]=1.95;}applyPose(c.person,pp);}}
 function officerAim(){const ph=S.phase;if(/^(f8|e8|d8)-/.test(ph)&&reyes.visible)return {x:reyes.x+Math.sin(reyes.a)*4,y:-2,z:reyes.z-Math.cos(reyes.a)*4};return null;}
 function key(code){return false;}
 function hint(){if(S.phase==='n8-ride'&&C.wantLook)return [['Mouse / Q','Look back']];return null;}
 function sources(out){const ph=S.phase;if(C.where==='works')out.push({id:'c8-creek',kind:'water',pos:new THREE.Vector3(WP(0,0).x,-3,WP(0,0).z),level:1.2},{id:'c8-gen',kind:'generator',pos:new THREE.Vector3(WP(26,8).x,1,WP(26,8).z),level:.6});
  if(/^g8-/.test(ph)){const t=ruin.truck.g.position;out.push({id:'c8-siren',kind:'siren',pos:new THREE.Vector3(t.x,2,t.z),mode:'wail',level:.6});}}
 function blockers(out){for(const a of PEOPLE)if(a.visible)out.push({x:a.x,z:a.z,r:.3,speed:0});if(JD.on)out.push({x:JD.x,z:JD.z,r:.5,speed:0});}
 function reset(){for(const a of PEOPLE){a.show(false);a.path=null;}JD.on=false;C.alexSit=false;C.escort=null;C.jamieHold=false;if(C.boardMesh)C.boardMesh.removeFromParent();if(works?.attach&&C.where==='works')works.attach(false);}
 const SCENE={'c8-truth':()=>sceneTruth('t'),'c8-breach':()=>sceneBreach('breach'),'c8-escape':()=>sceneBreach('escape'),'c8-ladder':()=>sceneBreach('escape'),
  'c8-surface':()=>sceneSurface('surface'),'c8-street':()=>sceneStreet('s'),'c8-hendersons':()=>sceneStreet('s'),'c8-garage':()=>sceneStreet('s'),'c8-jamie-death':()=>sceneStreet('s'),
  'c8-staging':()=>sceneStaging('staging'),'c8-gates':()=>sceneOp('gates'),'c8-ports':()=>sceneOp('ports'),'c8-line-two':()=>sceneOp('line-two'),'c8-plug':()=>sceneOp('plug'),'c8-hatch':()=>sceneOp('plug'),
  'c8-oak':()=>sceneOak('oak'),'c8-alex-death':()=>sceneOak('oak'),'c8-ride':()=>sceneRide('jump'),'c8-look-back':()=>sceneRide('jump'),'chapter8-end':()=>{sceneRide('jump');C.endT=0;}};
 return {sceneTruth,update,afterActors,officerAim,key,hint,sources,blockers,reset,SCENE,canDismount:()=>S.phase==='n8-ride',canRemount:()=>S.phase==='n8-ride',PEOPLE,JD,OAK};
}
