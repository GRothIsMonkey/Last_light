// Chapter Eight, Act V (the end), rebuilt: the service hatch and Alex; the oak; the street at sunrise; the last ride.
//
// The hatch. The way out of the main chamber is the service ladder up its south well to a hatch in the field by the oak. The
// hatch's counterweight arm has snapped off: its chain hangs down the well, and without someone hauling on it from below the
// steel lid (four hundred pounds of it) drops shut on whoever is in the opening. Reyes has Brandt over his shoulder (the
// catwalk took Brandt's leg). Alex takes the chain before anyone can argue: he is the lightest; it will not pull him off the
// ladder; he will come up right behind. He holds it while Reyes, Sam and you climb, and starts up feeding it as he comes; the
// well shakes under him (the chamber going), the chain fouls on a rung, he lets go of it to climb the last of it, and the lid
// comes down across his back with the top half of him out on the grass. No prompt could have stopped it. What you can do is
// lift it, with Sam, and pull him out, and get him to the oak.
//
// The oak. The most personal scene in Last Light: Alex against the trunk, breathing badly, cold; Sam beside him holding his
// hand; you sit with him (a pose you can look round from, never a locked camera). Limited, dignified things to do: take his
// hand, look at Sam, stay. What he says is his own (the bikes he kept thinking about in the room it made, the riding they
// planned in the crew room). Then his breathing stops. Sam holds him. Reyes comes up the grass and kneels with Sam. You get up
// when you are ready.
//
// The street at sunrise, on foot with Sam past the hole and the house that fell and the Kesslers' shell, to your two bikes where
// Reyes left them; then the ride (cycling control kept): past the Hendersons' (an ambulance), Sam's, the Kowalskis', Summerfield
// (the fire engines, the hole), Jamie's house; Sam saying he keeps thinking they're right behind; the look back; the card.
// The town stays wrecked: the street's own pieces stay as they fell (chapter8-town.js), the sky settling after the seal.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {ACT,feel} from './chapter8-acting.js';
import {cutWorld} from './chapter8-ruin.js';
import {groundPoint,heading} from './route.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {newPose,copyPose,applyPose,sitPose,P as PP} from './rig.js';
import {LOOKOUT} from './layout.js';

export function finaleActs(X){
 const {o,k,C,S,presence,H,HM,brandt,reyes,police,jamie,sam,comp,brain,sound,gy,light,lightsOn,checkpoint,later,mark,say,SM,AL,R,BR,Y,N,V,task,wait,until,lines,offer,unoffer,V3,near,
  fail,hazard,huntStop,me,go,objective,busy,main,nav,camera,scene,world,stand,walkTo,joinFoot,leave,minds,date,HOUR,CM,enterComplex,lightsBelow,nightStreet,cry,weep,applyGrief,pose,unpose,ruin}=X;
 const SP=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)+dy};};
 const OAK=(()=>{const q=main(LOOKOUT.oak.d-.6,LOOKOUT.oak.lat-1.15);return {x:q.x,z:q.z,y:gy(q.x,q.z)};})();
 const street=()=>X.STREET;
 const F8={mode:null,y:-4,t:0,lid:1.15,chainHeld:true,pull:0,sam:null,alexDead:false,breath:0};// the finale's own state (reset with the chapter)
 // ---- the service hatch, in the field by the oak -----------------------------------------------------------------------------------------------
 const HAT=(()=>{const c=SP(1167.4,10.8),a=heading(1167);return {x:c.x,z:c.z,y:c.y,a};})();
 const hatch=new THREE.Group();hatch.name='c8-service-hatch';hatch.position.set(HAT.x,HAT.y,HAT.z);hatch.rotation.y=-HAT.a;hatch.updateMatrixWorld(true);
 const KNEEL=(p,w,t)=>{ACT.kneel({side:1,lookPitch:-.45})(p,{clock:t});};
 // (face down, the top half of him out on the grass, his arms out in front of him)
 const PRONE=(p,t)=>{const s3=(o,x,y,z)=>{p[o]=x;p[o+1]=y;p[o+2]=z;};s3(PP.root,0,.13,0);p[PP.lean]=1.42;p[PP.yaw]=0;p[PP.twist]=.05;p[PP.roll]=.06;p[PP.hp]=-.7;p[PP.hy]=.25;
  s3(PP.lf,-.13,.05,.84);s3(PP.rf,.14,.05,.8);p[PP.lfp]=1.4;p[PP.rfp]=1.4;s3(PP.lk,0,1,.2);s3(PP.rk,0,1,.2);s3(PP.lh,-.28,.04,-.86+Math.sin(t*.7)*.01);s3(PP.rh,.3,.04,-.8);s3(PP.le,-1,.3,0);s3(PP.re,1,.3,0);};
 const conc=new THREE.MeshStandardMaterial({color:0x77726a,roughness:.95});conc.name='c8-hatch-concrete';const steel=new THREE.MeshStandardMaterial({color:0x3c3e3c,roughness:.5,metalness:.65});steel.name='c8-hatch-steel';
 const rust=new THREE.MeshStandardMaterial({color:0x6a3e22,roughness:.8,metalness:.3});rust.name='c8-hatch-rust';const wellM=new THREE.MeshStandardMaterial({color:0x2a2724,roughness:1,side:THREE.BackSide});wellM.name='c8-hatch-well';
 const bx=(p,w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=true;b.receiveShadow=true;p.add(b);return b;};
 const OPEN=.96,RIM=.3,LIDL=OPEN+.1;
 for(const [x,z,w,d] of [[0,(OPEN+RIM)/2,OPEN+2*RIM,RIM],[0,-(OPEN+RIM)/2,OPEN+2*RIM,RIM],[(OPEN+RIM)/2,0,RIM,OPEN],[-(OPEN+RIM)/2,0,RIM,OPEN]])bx(hatch,w,.4,d,conc,x,.1,z);
 {const w=new THREE.Mesh(new THREE.BoxGeometry(OPEN,7.4,OPEN),wellM);w.position.y=-3.4;hatch.add(w);}
 for(const s of [-1,1])bx(hatch,.045,7,.045,steel,s*.21,-3.3,-OPEN/2+.07);for(let i=0;i<21;i++)bx(hatch,.46,.03,.03,steel,0,-6.6+i*.32,-OPEN/2+.07);
 const hinge=new THREE.Group();hinge.position.set(0,.31,OPEN/2+.03);hatch.add(hinge);
 const lid=bx(hinge,LIDL,.07,LIDL,steel,0,.035,-LIDL/2);for(const x of [-.3,0,.3])bx(lid,.05,.04,LIDL*.9,rust,x,.05,0);
 {const stub=bx(hinge,.09,.09,.52,rust,.36,.05,.26);stub.rotation.x=.35;}// (the counterweight arm, snapped off short)
 const chainG=new THREE.BufferGeometry();chainG.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));const chain=new THREE.Line(chainG,new THREE.LineBasicMaterial({color:0x2b2a27}));chain.frustumCulled=false;hatch.add(chain);
 let hatchCut=null;
 const lidEdge=(out={x:0,y:0,z:0})=>{const a=F8.lid;out.x=0;out.y=.31+Math.sin(a)*LIDL;out.z=OPEN/2+.03-Math.cos(a)*LIDL;return out;};
 const hw=(x,y,z)=>{const v=new THREE.Vector3(x,y,z);hatch.localToWorld(v);return {x:v.x,y:v.y,z:v.z};};// hatch-local to world
 function hatchShow(on){if(on&&!hatch.parent)scene.add(hatch);else if(!on&&hatch.parent)hatch.removeFromParent();if(!hatchCut)hatchCut=ruin.addCut(0,{x:HAT.x,y:HAT.y-3.4,z:HAT.z,sx:OPEN/2+.02,sy:3.6,sz:OPEN/2+.02,rot:-HAT.a});hatchCut.on=on;ruin.syncCuts();}
 // where people are, round it (hatch-local: -z is the oak side, the ladder side)
 const AT={rimS:hw(.95,0,-.15),rimP:hw(-.95,0,.2),lift:hw(-.55,0,-1.05),grass:hw(0,0,-1.9),reyes:hw(1.6,0,1.4),brandt:hw(2.4,0,1.9)};
 // ---- the field, after: the street's own state, the sky settling, the far fires; no creatures, no people of the street ------------------------
 function fieldWorld({ride=false}={}){CM.show(false);if(nav.room===CM.nav)nav.setRoom(null);presence.reset();presence.show(false);huntStop();o.bikeAway?.(!ride);
  nightStreet();X.ch3?.creature?.show?.(false);cutWorld(world);ruin.show(true);ruin.stage(2);ruin.truck.g.visible=true;street()?.after?.(true);nav.setRoom(ruin.room);lightsOn(true);for(let i=0;i<6;i++)light(i,null);
  C.apocWant=ride?.06:.16;C.where=ride?'ride':'oak';C.amb={traffic:0,insects:.2,wind:.45,life:.25,forest:0,tunnel:0,water:0};}
 // ---- Act V, scene 16a: the ladder, the chain; Alex ----------------------------------------------------------------------------------------------
 function sceneHatch(from='chamber'){go('n8-op');
  task('hatch',(function*(){
   if(from==='chamber'){
    const A2=X.enlistAlex();checkpoint('c8-chain');
    yield* lines([BR('It’s coming down. All of it. The service ladder— the south well— GO!',{time:2.2})]);objective('The ladder.','South end of the platform.');
    hazard({at:{x:CM.at('iwMid').x,y:4,z:CM.at('iwMid').z},r:2,warn:2.6,section:'c8-chain',n:18,fatal:true});
    yield* until(()=>near(CM.at('ipLadder'),3)||C.pt>120,90);
    // the well: the hatch at the top cracked open, its arm gone, the chain hanging down to them
    const lq=CM.at('ipLadder');S.lookTarget={x:lq.x,y:6,z:lq.z};
    yield* lines([N('The ladder goes up a concrete well to a square of red sky, forty feet up: the hatch, cracked open. Its counterweight arm has snapped off. The chain from it hangs straight down the well, swinging.',{time:5.2}),
     BR('(through his teeth; Reyes has him over his shoulder) No counterweight. That lid’s four hundred pounds. Nobody holds that chain, it comes down on whoever’s in the hole.',{time:4.6}),
     R('Then I’ll—',{time:.8}),BR('You’re carrying me, Reyes.',{time:1.6})]);
    S.lookTarget=null;
    // he has it already, wrapped twice round his forearm
    stand(A2,{x:lq.x+.3,z:lq.z-.2},{look:()=>({x:lq.x,y:5,z:lq.z}),gesture:ACT.overhead({shake:.4,lean:-.05}),max:2.4});feel(A2,'determined',12);
    yield* lines([AL('I’ve got it.',{time:1.2,face:'determined'}),N('Alex has the chain wrapped twice round his arm. He leans back on it. Up at the top, the lid lifts, and the square of sky gets bigger.',{time:4.4}),
     SM('Alex— no— give it to me, I’ll—',{time:1.8,face:'afraid'}),AL('You’re heavier. It’ll pull you off the ladder. It won’t pull me. I’m the light one.',{time:3.4,face:'determined'}),
     AL('Go. I’ll come up right behind you. I’m fast. You know I’m fast.',{time:3,face:'afraid'}),{wait:.6},SM('...Right behind.',{time:1.4,face:'tearful'}),AL('Right behind.',{time:1.2})]);
    for(const a of [reyes,brandt].filter(Boolean))a.show(false);mark('Alex has the chain');
    yield* lines([N('Reyes goes up with Brandt over his shoulder, slow, one rung at a time. Then Sam.',{time:3.2})]);sam.person.group.visible=false;
    objective('Climb.','The ladder. Alex is holding the lid.');
    offer('upLadder','Climb',()=>CM.at('ipLadder',1.4),{r:1.8,hold:2.4,tick:()=>{if(Math.random()<.1)sound('c6Clank',CM.at('ipLadder',1.4),{gain:.3});}});
    yield* until(()=>C.flags.upLadder||C.pt>600);
    C.fadeOut=0;let up=false;C.after=()=>{up=true;};yield* until(()=>up,4);}
   // ---- the top: the grass, the hatch held open from below, Alex's light down the well ------------------------------------------------------
   fieldWorld();hatchShow(true);checkpoint('c8-hatch');C.h=Math.max(C.h,HOUR.oak-.05);C.hMin=HOUR.oak-.05;date(C.h);C.fadeIn=0;
   Object.assign(C.flags,{jamieDead:true,sealed:true,samOut:true,anchor1:true,anchor2:true,anchor3:true});X.C.grief.jamie=true;applyGrief();
   const A2=X.enlistAlex();joinFoot(A2,{x:HAT.x,z:HAT.z},HAT.a);A2.follow=null;A2.brain=null;stand(A2,null);A2.script=null;F8.mode='well';F8.y=-3.6;F8.lid=1.25;F8.chainHeld=true;
   const pq=AT.grass;o.placePlayer({x:pq.x,z:pq.z,a:headingTo(pq.x,pq.z,HAT.x,HAT.z),mode:'walk',bike:null});
   joinFoot(sam,AT.rimS,headingTo(AT.rimS.x,AT.rimS.z,HAT.x,HAT.z));stand(sam,AT.rimS,{look:()=>({x:HAT.x,y:HAT.y-2,z:HAT.z}),gesture:ACT.kneel({side:1,lookPitch:-.6}),max:1});
   reyes.show(true);reyes.place(AT.reyes.x,AT.reyes.z,headingTo(AT.reyes.x,AT.reyes.z,HAT.x,HAT.z));reyes.gest(KNEEL);
   brandt?.show(true);brandt?.place(AT.brandt.x,AT.brandt.z,headingTo(AT.brandt.x,AT.brandt.z,HAT.x,HAT.z));brandt?.gest?.((p,w,t)=>{ACT.floor({arms:'lap',lean:-.35})(p,{clock:t});});
   light(3,hw(0,-2.6,-.1),{intensity:6,dist:6,color:0xffe2b0,flicker:.15});// (his flashlight, down the well)
   yield* lines([{wait:1},N('Grass. Air. The field by the oak, and the sky over it going from red to grey. Sam is on his knees at the edge of the hatch, looking down.',{time:4.4}),
    SM('(down the well) ALEX! Come on! COME ON!',{time:1.8,face:'afraid'}),AL('(from below) Coming— I’m coming—',{time:1.6})]);
   objective('Alex.','');
   // he climbs, feeding the chain up as he comes; the well shakes (the chamber going, under the field); the chain fouls; he lets go of it
   F8.mode='climb';sound('c8Rumble',hw(0,-6,0),{gain:1.4});C.shake=.6;
   yield* until(()=>F8.y>-1.5||C.pt>200,8);sound('c8Collapse',hw(0,-7,0),{gain:1.6});C.shake=1;
   yield* lines([AL('(close) It’s caught— the chain’s caught on the—',{time:1.6,face:'terrified'}),SM('LET GO OF IT! Alex, LET GO AND CLIMB!',{time:1.8,face:'terrified'})]);
   F8.chainHeld=false;F8.mode='last';mark('he let go of the chain');
   yield* until(()=>F8.y>-.45,3);
   // the lid comes down on him, the top half of him out on the grass
   F8.drop=true;yield* until(()=>F8.lid<=.19,2);F8.drop=false;sound('c6Clank',hw(0,.4,0),{gain:1.6});sound('c8Impact',hw(0,0,0),{gain:1.2});C.shake=.9;F8.mode='pinned';cry(.7,6);
   feel(A2,'pain',20);mark('the lid came down on Alex');
   yield* lines([{wait:.6},SM('NO— NO— ALEX—',{time:1.4,face:'anguish'}),N('The lid is across his back. His arms are out on the grass. He isn’t making any sound.',{time:3.4})]);
   // lift it, with Sam
   stand(sam,AT.lift,{look:()=>hw(0,.5,.1),gesture:ACT.heave({strain:1}),max:1.6});
   objective('Lift it.','The lid. You and Sam. Hold F.');
   offer('lift-lid','Lift the lid (with Sam)',()=>hw(0,.45,-.2),{r:2.4,hold:3.4,tick:(dt,v)=>{F8.lid=Math.max(F8.lid,.3+v*.75);if(Math.random()<dt*2)sound('c8Creak',hw(0,.3,0),{gain:.5});},release:()=>{},fn:()=>{F8.lid=1.15;sound('c6Clank',hw(0,.4,0),{gain:.8});}});
   yield* until(()=>C.flags['lift-lid']||C.pt>400);objective('Pull him out.','Under the arms. Hold F.');
   yield* lines([SM('I’ve got it— I’ve got it up— PULL HIM—',{time:1.8,face:'determined'})]);
   offer('pull-alex','Pull him out',()=>hw(0,.2,-.7),{r:2.4,hold:2.6,tick:(dt,v)=>{F8.pull=v;},release:()=>{},fn:()=>{F8.pull=1;}});
   yield* until(()=>C.flags['pull-alex']||C.pt>460);F8.pull=1;F8.mode='out';objective('','');F8.lid=.02;sound('c6Clank',hw(0,.4,0),{gain:1.2});C.shake=.3;stand(sam,null);
   yield* lines([N('You get him under the arms and pull, and he comes out of the hole onto the grass, and Sam lets the lid go and it slams behind him.',{time:4.4}),{wait:1},
    AL('(a breath that catches) ...Ow.',{time:1.4,face:'pain'}),SM('(laughing and crying at once) Ow. He says ow. He says—',{time:2.6,face:'tearful'}),{wait:1.2},
    AL('I can’t— I can’t feel my legs right.',{time:2.4,face:'pain'}),R('(coming over, kneeling) Don’t move him— Alex. Alex, look at me. Where does it hurt?',{time:3.4}),AL('...Everywhere?',{time:1.4,face:'weak'})]);
   sceneOak('carry');})());}
 // ---- Act V, scene 16b: the oak; Alex -------------------------------------------------------------------------------------------------------
 const _p=newPose();
 function sceneOak(from='oak'){go('n8-oak');
  if(from!=='carry'){fieldWorld();hatchShow(true);F8.lid=.02;Object.assign(C.flags,{jamieDead:true,sealed:true,alexHurt:true,samOut:true});X.C.grief.jamie=true;applyGrief();}
  hatch.parent&&(F8.lid=.02);const A2=X.enlistAlex();joinFoot(A2,{x:OAK.x,z:OAK.z},0);A2.follow=null;A2.brain=null;stand(A2,null);A2.script=null;C.flags.alexHurt=true;
  C.h=Math.max(C.h,HOUR.oak);C.hMin=HOUR.oak;date(C.h);checkpoint('c8-oak');C.mood='relaxed';C.mindKey=null;reyes.show(false);brandt?.show(false);
  // he is against the oak (they carried him: you and Sam, Reyes ran for the car's kit); Sam beside him holding his hand
  F8.mode='oak';F8.breath=1;F8.alexDead=false;C.alexSit=false;C.samSit=false;
  joinFoot(sam,{x:OAK.x+.9,z:OAK.z+.7},0);sam.follow=null;sam.brain=null;stand(sam,null);sam.script=null;F8.sam='hold';weep(sam,'crying',40);
  {const at={x:OAK.x-1.6,z:OAK.z+1.5};o.placePlayer({x:at.x,z:at.z,a:headingTo(at.x,at.z,OAK.x,OAK.z),mode:'walk',bike:null});}
  C.amb={traffic:0,insects:.15,wind:.5,life:.2,forest:0,tunnel:0,water:0};if(from!=='carry')C.fadeIn=0;
  task('oak',(function*(){
   if(from==='carry'){C.fadeOut=0;let done=false;C.after=()=>{done=true;};yield* until(()=>done,4);C.fadeIn=0;
    yield* lines([{wait:1.4},N('You and Sam carry him to the oak between you. He’s so light. Reyes runs for the car for the kit and the radio.',{time:4.4})]);}
   else yield* lines([{wait:2.4},N('The old oak. He’s sitting against it. Sam is beside him, holding his hand.',{time:3.4})]);
   feel(A2,'weak',40);cry(.35,8);
   objective('Alex.','');offer('alex-sit','Sit with him',()=>({x:OAK.x,y:OAK.y+.7,z:OAK.z}),{r:2.6});
   yield* until(()=>C.flags['alex-sit']||C.pt>180,170);unoffer('alex-sit');
   // sitting in the grass in front of him, a little to his left: close enough to touch (you can look where you like)
   {const h=headingTo(OAK.x,OAK.z,main(1150,0).x,main(1150,0).z),fx=Math.sin(h),fz=-Math.cos(h),rx=Math.cos(h),rz=Math.sin(h),q={x:OAK.x+fx*1.05-rx*.35,z:OAK.z+fz*1.05-rz*.35};
    pose(q,{y:gy(q.x,q.z)+.62,look:{x:OAK.x,z:OAK.z},pitch:-.12,slow:2});}
   const alexHead=()=>{const g=A2.person.group,j=A2.person.joints?.head;return j?g.localToWorld(j.clone()):{x:OAK.x,y:OAK.y+.75,z:OAK.z};};
   yield* lines([{wait:3},N('His breathing is wrong. Short, and wet, and every one of them costs him something.',{time:4}),{wait:2.6},
    AL('...Did we stop it?',{time:2,face:'weak'}),{wait:1.6},Y('Yeah.',{time:1}),{wait:1.2},AL('Good.',{time:1.2,face:'weak'}),{wait:4.4},
    AL('It doesn’t hurt that much. It’s just... heavy.',{time:3,face:'pain'}),{wait:3.2},
    AL('Is my mom...?',{time:1.6,face:'weak'}),SM('(trying to keep his voice right) She’s at the school. Everybody’s at the school. Reyes said.',{time:3.4,face:'crying'}),{wait:1},
    AL('She’s gonna be so mad.',{time:1.8,face:'weak'}),N('Something that’s almost a laugh. It turns into a cough, and the cough goes on too long.',{time:3.6}),{wait:3}]);
   // his hand
   offer('alex-hand','Take his hand',()=>{const g=A2.person.group;return V3({x:g.position.x+Math.sin(A2.pa)*.0-.18,y:g.position.y+.32,z:g.position.z});},{r:3,inPose:true,look:true,size:.6,cone:.4,fn:()=>{C.flags.alexHand=true;}});
   yield* until(()=>C.flags.alexHand||C.pt>420,60);unoffer('alex-hand');F8.hand=true;
   yield* lines([N(C.flags.alexHand?'His hand is cold, and too light. He holds on.':'Sam has his other hand. Neither of them lets go.',{time:3.4}),{wait:3.6},
    AL('Where’s Jamie?',{time:1.6,face:'weak'}),{wait:5.4},N('Nobody says anything.',{time:2.4}),{wait:3.4},N('He understands.',{time:2.2,act:()=>{feel(A2,'crying',20);weep(sam,'sobbing',20);cry(.9,14);}}),{wait:3},
    AL('(very quietly) ...Oh.',{time:1.6,face:'crying'}),{wait:6}]);
   yield* lines([AL('I kept thinking about the bikes. Down there. In the room it made.',{time:3.6,face:'tearful'}),{wait:1.6},
    AL('I kept thinking, if I could get out, we’d go riding. All four of us. Like before. Like we said.',{time:4.4,face:'tearful'}),{wait:2.2},
    SM('We’ll still go. We’ll go tomorrow. You and me and— you and me and him—',{time:3.4,face:'sobbing'}),N('Sam can’t finish it.',{time:2.2}),{wait:4.6},
    AL('We were supposed to go riding tomorrow.',{time:3.4,face:'tearful'}),{wait:7}]);
   // Sam
   offer('look-sam','Look at Sam',()=>{const g=sam.person.group,j=sam.person.joints?.head;return j?g.localToWorld(j.clone()):V3({x:sam.px,z:sam.pz});},{r:4,inPose:true,look:true,size:.5,cone:.5,fn:()=>{C.flags.lookedSam=true;}});
   yield* until(()=>C.flags.lookedSam||C.pt>620,40);unoffer('look-sam');
   yield* lines([{wait:1},N('Sam’s face is wet all over. He isn’t wiping it. He’s holding Alex’s hand in both of his.',{time:4}),{wait:2.6},
    AL('(to you) Don’t... don’t let him be by himself. Okay? After.',{time:3.4,face:'weak'}),{wait:1.4},Y('(you can barely say it) Okay.',{time:1.6,act:()=>cry(1,20)}),{wait:5},
    AL('...I’m really tired.',{time:2.2,face:'weak'}),{wait:6}]);
   // his breathing slows, and stops
   F8.breath=.45;yield* wait(7);F8.breath=.18;yield* wait(6);F8.breath=0;F8.alexDead=true;C.flags.alexDead=true;X.C.grief.alex=true;applyGrief();mark('Alex');feel(A2,'lifeless',999);
   yield* lines([{wait:4},N('His breathing stops.',{time:2.6}),{wait:5},SM('Alex?',{time:1.4,face:'shocked'}),{wait:2.2},SM('Alex.',{time:1.6,face:'anguish'}),{wait:2},
    SM('(sobbing) No. No no no. Come on. Come on, Alex, come on—',{time:3.6,face:'sobbing'})]);
   F8.sam='embrace';weep(sam,'sobbing',90);cry(1,40);
   yield* lines([{wait:4},N('Sam has him by the shoulders. He’s holding on to him and rocking and saying his name into his hair.',{time:4.6}),{wait:7},N('Birds, in the oak. Sirens, far off, getting fewer.',{time:3.2}),{wait:6}]);
   offer('stay','Stay',()=>alexHead(),{r:4,inPose:true,look:true,size:.8,cone:.6,fn:()=>{C.flags.stayed=true;}});
   yield* until(()=>C.flags.stayed||C.pt>900,50);unoffer('stay');
   yield* lines([{wait:3},N('You stay. The light comes up grey through the leaves. Nobody says anything for a long time.',{time:4.4}),{wait:6}]);
   // Reyes: up the grass; his hat off; down on his knees with Sam
   reyes.show(true);const rq=main(1150,4);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,OAK.x,OAK.z));reyes.gest(null);
   reyes.walk([[OAK.x+1.5,OAK.z+1.4]],{speed:.9,then:()=>{reyes.gest(KNEEL);}});
   yield* until(()=>!reyes.walking||C.pt>1100,20);
   yield* lines([{wait:2.6},N('Reyes comes up the grass from the street and stops a little way off. He takes his hat off. He doesn’t say anything for a while.',{time:4.6}),{wait:3},
    N('Then he gets down on his knees beside Sam and puts his hand on Sam’s back and leaves it there.',{time:4}),{wait:3},R('I’m here. I’m right here, son.',{time:2.4}),{wait:6},
    R('(after a long time) I brought your bikes. They’re down past the hole, on the road. Yours and Sam’s.',{time:4}),R('I thought you might want to ride. To the school. I’ll be right behind you the whole way.',{time:3.6}),{wait:3}]);
   offer('get-up','Get up',()=>({x:camera.position.x,y:camera.position.y+.4,z:camera.position.z}),{r:9,inPose:true,fn:()=>{}});
   yield* until(()=>C.flags['get-up']||C.pt>1500,60);unoffer('get-up');
   unpose();sceneWalk('oak');})());}
 // ---- Act V, scene 17a: down the street on foot, with Sam, to the bikes ----------------------------------------------------------------------------------
 const BIKEAT=()=>({me:SP(1043.5,1.2),sam:SP(1043.6,2.8)});
 function bikesDown(on){const B7=X.B7||{},q=BIKEAT();for(const [kk,at] of [['player',q.me],['sam',q.sam]]){const b=B7[kk];if(!b)continue;b.bike.group.visible=on;if(!on)continue;b.bike.group.position.set(at.x,at.y,at.z);b.bike.group.rotation.set(0,-heading(1040),.16);}}
 function sceneWalk(from='oak'){go('n8-ride');
  if(from!=='oak'){fieldWorld();C.flags.alexDead=true;X.C.grief.jamie=X.C.grief.alex=true;applyGrief();hatchShow(true);F8.lid=.02;}
  // Alex under Reyes's coat against the oak; Reyes stays with him
  F8.mode='oak';F8.alexDead=true;F8.breath=0;F8.sam=null;const A2=X.alex;
  C.h=Math.max(C.h,HOUR.ride-.08);C.hMin=HOUR.ride-.08;date(C.h);checkpoint('c8-walk');
  joinFoot(sam,{x:OAK.x+1.4,z:OAK.z+1.8},0);sam.boost=.7;weep(sam,'grief',60);bikesDown(true);
  if(from!=='oak'){const at={x:OAK.x-1.6,z:OAK.z+2.2};o.placePlayer({x:at.x,z:at.z,a:heading(1150)+Math.PI,mode:'walk',bike:null});reyes.show(true);reyes.place(OAK.x+1.5,OAK.z+1.4,headingTo(OAK.x+1.5,OAK.z+1.4,OAK.x,OAK.z));reyes.gest(KNEEL);}
  C.flags.covered8=true;C.amb={traffic:0,insects:.2,wind:.4,life:.3,forest:0,tunnel:0,water:0};o.setPace?.(.8);
  task('walk',(function*(){
   objective('Down to the bikes.','Past the hole, on the road. With Sam.');
   yield* lines([{wait:2},N('Sam gets up when you do. He doesn’t look back at the oak. You don’t either. Not yet.',{time:4})]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<1100||C.pt>200;},200);
   yield* lines([N('The hole where the road was. In the grey light you can see down into it: the storm line, broken open, and water standing in it, and the car on its nose.',{time:5}),{wait:3},
    N('The house at 1052 is still leaning into it. Its bedroom lamp is still on.',{time:3.4}),{wait:4}]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<1050||C.pt>320;},200);
   yield* lines([N('The Kesslers’ is a black shell, smoking. Across from it, the Hendersons’ yard is gone into the ground. There’s an ambulance in their drive with its back doors open.',{time:5}),{wait:2.6},
    SM('(barely) Is that for—',{time:1.4,face:'grief'}),{wait:2.6},SM('...',{time:1}),{wait:3}]);
   objective('Your bike.','');offer('bike','Get on your bike',()=>{const q=BIKEAT().me;return {x:q.x,y:q.y+.8,z:q.z};},{r:2.6});
   yield* until(()=>C.flags.bike||C.pt>600,240);bikesDown(false);sceneRide('walk');})());}
 // ---- Act V, scene 17b: the last ride ------------------------------------------------------------------------------------------------------------
 const RIDE8={look:0,wantLook:false,lookedBack:false};
 function sceneRide(from='ride'){go('n8-ride');
  if(from!=='walk'){fieldWorld({ride:true});hatchShow(true);F8.lid=.02;}
  C.where='ride';C.apocWant=.06;C.h=Math.max(C.h,HOUR.ride);C.hMin=HOUR.ride;date(C.h);
  // whoever comes in here (the ride from the walk, a DEV start, Continue): both of them gone, the grief on them both, Jamie's cap with you
  Object.assign(C.flags,{jamieDead:true,alexDead:true,sealed:true,samOut:true});X.C.grief.jamie=X.C.grief.alex=true;applyGrief();C.inv.cap=C.inv.cap||'have';
  F8.mode=null;X.dismissAlex?.();leave(jamie);C.alexSit=false;C.samSit=false;
  o.bikeAway?.(false);const st=SP(1042.5,1.2),st2=SP(1032,1.2),a=headingTo(st.x,st.z,st2.x,st2.z);o.placePlayer({x:st.x,z:st.z,a,mode:'ride',speed:0});
  const sq=SP(1043,3.1);comp.putRiding(sam,sq.x,sq.z,a,0);sam.gone=false;sam.follow='ride';brain.enable(sam,true);sam.boost=.82;
  reyes.show(false);k.carA.show(true);{const cq=SP(1060,6.2),cq2=SP(1050,6.2);k.carA.park(cq.x,cq.z,headingTo(cq.x,cq.z,cq2.x,cq2.z));k.carA.lights=true;police.attach?.(true);}
  responders(true);checkpoint('c8-ride');C.fadeIn=from==='walk'?-1:0;C.mood='relaxed';C.mindKey=null;C.amb={traffic:0,insects:.25,wind:.4,life:.4,forest:0,tunnel:0,water:0};
  cry(from==='walk'?.5:.65,from==='walk'?8:14);weep(sam,'grief',30);RIDE8.sob=6;o.setPace?.(1);
  task('ride',(function*(){
   yield* lines([{wait:3},N('Saturday. The sun not up yet, but nearly.',{time:3}),{wait:2.4},N('Two bikes.',{time:2.2}),{wait:3}]);
   objective('Ride.','Down Oak Hollow Drive. The school.');
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<1028||C.pt>180;});
   yield* lines([N('The Hendersons’. The fire truck, the ambulance in the drive. Somebody has put a blanket over the hole’s edge, by the side yard.',{time:4.4}),{wait:7}]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<998||C.pt>300;});
   yield* lines([N('Past Sam’s. Every window gone. His mom’s car isn’t in the drive.',{time:3.4}),{wait:6}]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<945||C.pt>420;});
   yield* lines([N('The Kowalskis’ house is a black frame with smoke going up out of it, straight, because there isn’t any wind.',{time:4}),{wait:5}]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<890||C.pt>520;});
   yield* lines([N('Summerfield. The fire engines, the police, people in blankets on the curb. A fireman lifts a hand to you as you go by. Nobody stops you.',{time:4.8}),{wait:6}]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<800||C.pt>640;});
   yield* lines([N('Jamie’s house. The red chair on the porch.',{time:2.6}),{wait:3},SM('(not really to you) His mom doesn’t know yet.',{time:2.4,face:'grief'}),{wait:9}]);
   yield* until(()=>{const L=ruin.locate(me().x,me().z);return L.d<680||C.pt>760;});
   yield* lines([{wait:1},SM('I keep thinking they’re right behind us.',{time:2.6,face:'grief'})]);
   RIDE8.look=0;RIDE8.wantLook=true;C.wantLook=true;objective('','');
   yield* until(()=>RIDE8.lookedBack||C.pt>860);RIDE8.wantLook=false;C.wantLook=false;C.lookedBack=true;
   yield* lines([{wait:1.4},N('The road behind you is empty.',{time:2.6}),{wait:3.4},N('You keep riding.',{time:2.4}),{wait:3.4}]);
   C.endT=0;})());}
 // the people out on the street at sunrise: the fire engines and the ambulance, the police; (made from what the chapter has: no new cast)
 function responders(on){const fire=X.fire||[];
  if(!on){for(const f of fire)f.show(false);return;}
  for(const [i,f] of fire.entries()){f.show(true);const q=SP(880+i*3.4,-8.6+i*.8);f.place(q.x,q.z,headingTo(q.x,q.z,SP(872,0).x,SP(872,0).z));}
  const cb=k.carB;cb.show(true);const bq=SP(866,10.6),bq2=SP(874,10.6);cb.park(bq.x,bq.z,headingTo(bq.x,bq.z,bq2.x,bq2.z));cb.lights=true;}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------------
 const _v=new THREE.Vector3(),_e=new THREE.Vector3();
 function update(dt){const ph=S.phase;F8.t+=dt;
  if(hatch.parent){
   // the lid: held at the chain's angle; dropping when let go (it slams); pinned on him; lifted
   if(F8.drop&&F8.mode!=='pinned'&&F8.lid>.18){F8.lid=Math.max(.18,F8.lid-dt*(1.2+(1.25-F8.lid)*6));}
   hinge.rotation.x=-F8.lid;
   // the chain: from the lid's edge down to his hand (or hanging free)
   const e=lidEdge(),pa=chain.geometry.attributes.position;pa.setXYZ(0,e.x,e.y,e.z);
   if(F8.chainHeld&&(F8.mode==='well'||F8.mode==='climb'))pa.setXYZ(1,.08,F8.y+1.25,-OPEN/2+.2);else pa.setXYZ(1,e.x+.04,Math.min(e.y-.2,-3.6),e.z*.4);pa.needsUpdate=true;
   if(F8.mode==='climb'){F8.y=Math.min(-1.2,F8.y+dt*.55);}else if(F8.mode==='last'){F8.y=Math.min(-.35,F8.y+dt*.9);}}
  // the breathing: his, while there is any
  if(F8.mode==='oak'&&!F8.alexDead&&F8.breath>0){F8.bt=(F8.bt??1)-dt;if(F8.bt<=0){F8.bt=(2.6+Math.random()*1.4)/Math.max(.25,F8.breath);const hd=X.alex?.person?.group?.position;if(hd)sound(F8.breath>.4?'c8Breath2':'c8Gasp',{x:hd.x,y:hd.y+.6,z:hd.z},{gain:.35+.3*F8.breath});}}
  // the ride: the look back (riding, the head turns to about 106 degrees, so past 97 counts); Sam crying now and then, never in step
  if(ph==='n8-ride'&&RIDE8.wantLook){camera.getWorldDirection(_v);const p=me(),back=-(_v.x*Math.sin(p.a)-_v.z*Math.cos(p.a));if(back>.12){RIDE8.look+=dt;if(RIDE8.look>.9)RIDE8.lookedBack=true;}else RIDE8.look=Math.max(0,RIDE8.look-dt*.5);}
  if(ph==='n8-ride'&&C.where==='ride'&&!sam.gone){RIDE8.sob=(RIDE8.sob??8)-dt;if(RIDE8.sob<=0){RIDE8.sob=14+Math.random()*16;weep(sam,Math.random()<.5?'crying':'tearful',6+Math.random()*4);}}
  if(ph==='n8-ride'&&C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n8-end');X.end();}}}
 function afterActors(dt){const A2=X.alex;if(!A2||!F8.mode)return;const g=A2.person.group;A2.posedAt=C.t;if(F8.sam)sam.posedAt=C.t;
  if(F8.mode==='well'||F8.mode==='climb'||F8.mode==='last'){// on the ladder in the well: hands up on the rungs, climbing
   const w=hw(0,F8.y,-OPEN/2+.36);g.position.set(w.x,w.y,w.z);g.rotation.set(0,-HAT.a,0);copyPose(_p,A2.pose);
   const ph=F8.mode==='well'?0:F8.t*2.2;ACT.overhead({shake:F8.mode==='well'?.6:.2,lean:-.05})(_p,{clock:F8.t});_p[PP.lh+1]+=Math.sin(ph)*.12;_p[PP.rh+1]-=Math.sin(ph)*.12;_p[PP.lf+1]+=Math.max(0,Math.sin(ph))*.18;_p[PP.rf+1]+=Math.max(0,-Math.sin(ph))*.18;applyPose(A2.person,_p);return;}
  if(F8.mode==='pinned'){// face down across the rim, the lid on his back; pulled out a little as you pull
   const w=hw(0,.1,lerp(-.22,-.9,F8.pull));g.position.set(w.x,w.y,w.z);g.rotation.set(0,-HAT.a,0);copyPose(_p,A2.pose);PRONE(_p,F8.t);applyPose(A2.person,_p);return;}
  if(F8.mode==='out'){// on his back on the grass, his feet toward the hatch
   const w=hw(0,.02,-1.45);g.position.set(w.x,w.y,w.z);g.rotation.set(0,-HAT.a+Math.PI,0);copyPose(_p,A2.pose);ACT.still({look:.35})(_p,{clock:F8.t});applyPose(A2.person,_p);return;}
  if(F8.mode==='oak'){// against the trunk, propped; his breathing; still, after
   const t2=main(1150,0),h=headingTo(OAK.x,OAK.z,t2.x,t2.z);A2.px=OAK.x;A2.pz=OAK.z;A2.pa=h;g.position.set(OAK.x,OAK.y-.02,OAK.z);g.rotation.set(0,-h,0);
   copyPose(_p,A2.pose);ACT.propped({lean:F8.alexDead?-.75:-.62,breath:F8.alexDead?0:F8.breath*1.6,head:F8.alexDead?.6:.25})(_p,{clock:F8.t});if(F8.alexDead){_p[PP.hp]=.35;_p[PP.hy]=.5;}
   if(F8.hand&&!F8.alexDead){_p[PP.lh]=-.38;_p[PP.lh+1]=.26;_p[PP.lh+2]=-.32;}
   applyPose(A2.person,_p);if(F8.alexDead){A2.person.lids?.forEach(L=>{L.visible=true;L.scale.y=.014;});}
   // Sam: sitting close on his right, holding his hand; then holding all of him
   if(F8.sam&&sam.person.group.visible){const fx=Math.sin(h),fz=-Math.cos(h),rx=Math.cos(h),rz=Math.sin(h),emb=F8.sam==='embrace',q={x:OAK.x+rx*(emb?.55:.72)+fx*(emb?.3:.16),z:OAK.z+rz*(emb?.55:.72)+fz*(emb?.3:.16)};
    sam.px=q.x;sam.pz=q.z;sam.pa=h-(emb?1.1:.45);const sg=sam.person.group;sg.position.set(q.x,gy(q.x,q.z)-.02,q.z);sg.rotation.set(0,-sam.pa,0);copyPose(_p,sam.pose);
    sitPose(_p,{seat:.06,legs:'bent',t:F8.t,hands:'deck',look:.3});
    if(emb){ACT.embrace(sam,A2,{k:1})(_p,{clock:F8.t});const r=Math.sin(F8.t*1.3)*.08;_p[PP.lean]+=.25+r;}else{ACT.sob(sam,{hands:'none',k:.6})(_p,{clock:F8.t});_p[PP.lh]=-.47;_p[PP.lh+1]=.12;_p[PP.lh+2]=.02;}
    applyPose(sam.person,_p);}}}
 function sources(out){if(S.phase==='n8-oak'||S.phase==='n8-ride'){out.push({id:'c8-sirens-far',kind:'siren',pos:V3(SP(880,-40,6)),level:.25});}}
 function blockers(out){if(hatch.parent)out.push({x:HAT.x,z:HAT.z,r:.85,speed:0});if(F8.mode==='oak')out.push({x:OAK.x,z:OAK.z,r:.6,speed:0});}
 function reset(){hatchShow(false);bikesDown(false);responders(false);Object.assign(F8,{mode:null,y:-4,t:0,lid:1.15,chainHeld:true,pull:0,sam:null,alexDead:false,breath:0,drop:false,hand:false});Object.assign(RIDE8,{look:0,wantLook:false,lookedBack:false,sob:8});light(3,null);o.setPace?.(1);}
 const SCENE={'c8-hatch':()=>{const A=()=>{};void A;sceneHatch('top');},'c8-oak':()=>sceneOak('oak'),'c8-alex-death':()=>sceneOak('oak'),'c8-walk':()=>sceneWalk('jump'),'c8-ride':()=>sceneRide('jump'),'c8-look-back':()=>sceneRide('jump'),
  'chapter8-end':()=>{sceneRide('jump');C.endT=0;}};
 return {SCENE,sceneHatch,sceneOak,sceneWalk,sceneRide,update,afterActors,sources,blockers,reset,F8,RIDE8,HAT,OAK,hatch,responders};
}
