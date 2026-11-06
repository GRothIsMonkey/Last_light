// Chapter Eight's scenes, Acts I-III (Friday night to the small hours, under the court): played as scripts on the
// chapter's task runner (chapter8.js). Acts IV and V are in chapter8-fall.js; this file joins them.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {P as PI,newPose,standPose,sitPose,applyPose} from './rig.js';
import {LOOKOUT} from './layout.js';
import {paper8,PAGES8,createFilm} from './chapter8-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {fallActs} from './chapter8-fall.js';
import {CX} from './chapter8-complex.js';

export function scenes8(X){
 const {o,k,C,S,A8,presence,H,HM,danny,brandt,reyes,police,jamie,sam,comp,brain,ch3,ch6,ch7,B7,sound,gy,light,lightsOn,checkpoint,later,mark,card,say,J,SM,AL,R,RR,BR,BRR,Y,N,V,
  task,wait,until,lines,quiet,offer,unoffer,V3,near,lookingAt,closeLook,endLook,looking,reading,choosing,fail,hazard,huntStart,huntStop,noise,me,go,objective,busy,main,nav,camera,scene,world,
  stand,walkTo,joinFoot,leave,minds,date,HOUR}=X;
 const CM=X.X;// the complex
 const ruin=X.ruin;
 const T=o.tension;
 const SH=world.homes.sam;
 const SHW=(x,z,y=0)=>{const p=SH.toWorld(x,z);return {x:p.x,z:p.z,y:p.ground+y};};
 const house=ch7.house,HSP=house?.SPOTS||{};
 // ---- places on the street at Sam's (night) ----------------------------------------------------------------------------------------------
 const BIKES=['alex','jamie','sam','player'].map((kk,i)=>({kk,d:-3.9+i*1.6,lat:3.4+((i%2)*.7)}));
 const bikeAt=b=>{const q=main(SH.drivD+b.d,b.lat),q2=main(SH.drivD+b.d+5,b.lat);return {x:q.x,z:q.z,y:gy(q.x,q.z),a:headingTo(q.x,q.z,q2.x,q2.z)};};
 const LAMP=(()=>{const q=main(SH.drivD-1.5,3.6);return {x:q.x,y:gy(q.x,q.z)+5.2,z:q.z};})();
 const COVER=(()=>{const q=main(SH.drivD+2.6,1.1);return {x:q.x,y:gy(q.x,q.z),z:q.z};})();
 const STOOP=HSP.stoop||SHW(SH.doorX,SH.stepFront+.35),WALK=SHW(SH.doorX,SH.stepFront+4.6);// (the front walk: where you stand once you are out of the door)
 function stageBikes(on,where=null){for(const b of BIKES){const S2=B7[b.kk];if(!S2)continue;S2.bike.group.visible=on;if(!on)continue;const q=where?where(b):bikeAt(b);S2.bike.group.position.set(q.x,q.y,q.z);S2.bike.group.rotation.set(0,-q.a,.12);}}
 // the cover in the road (Line Four), shifted off its seat, cold air coming out of the gap; and the field's things
 const coverG=new THREE.Group();coverG.name='c8-line4-cover';{const iron=new THREE.MeshStandardMaterial({color:0x2c2a28,roughness:.55,metalness:.6}),dark=new THREE.MeshBasicMaterial({color:0x030303});
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.03,24),dark);ring.position.y=.005;coverG.add(ring);const lid=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.05,24),iron);lid.name='c8-cover-lid';coverG.add(lid);coverG.userData.lid=lid;}
 const mist=new THREE.Sprite(new THREE.SpriteMaterial({color:0xbfc8cc,transparent:true,opacity:0,depthWrite:false}));mist.scale.set(1.2,1.6,1);coverG.add(mist);
 const MH={at:main(1166.4,3.4),vent:main(1169.2,-7.6),truck:main(1133,-3.6),car:main(1128.6,3.4)};for(const kk of ['at','vent','truck','car'])MH[kk].y=gy(MH[kk].x,MH[kk].z);
 const fieldG=new THREE.Group();fieldG.name='c8-field';{const iron=new THREE.MeshStandardMaterial({color:0x2a2826,roughness:.6,metalness:.55}),dirt=new THREE.MeshStandardMaterial({color:0x3b2f22,roughness:1}),dark=new THREE.MeshBasicMaterial({color:0x020202});
  const turf=new THREE.Mesh(new THREE.CylinderGeometry(.85,.95,.06,20),dirt);turf.position.set(MH.at.x,MH.at.y+.02,MH.at.z);turf.name='c8-dug';turf.visible=false;fieldG.add(turf);fieldG.userData.turf=turf;
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.06,24),iron);lid.position.set(MH.at.x,MH.at.y+.04,MH.at.z);lid.name='c8-mh12-lid';lid.visible=false;fieldG.add(lid);fieldG.userData.lid=lid;
  const hole=new THREE.Mesh(new THREE.CircleGeometry(.33,20),dark);hole.rotation.x=-Math.PI/2;hole.position.set(MH.at.x,MH.at.y+.035,MH.at.z);hole.visible=false;fieldG.add(hole);fieldG.userData.hole=hole;
  const vent=new THREE.Group();vent.position.set(MH.vent.x,MH.vent.y,MH.vent.z);fieldG.add(vent);const vp=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.55,10),iron);vp.position.y=.27;vent.add(vp);const vw=new THREE.Mesh(new THREE.TorusGeometry(.08,.012,6,14),new THREE.MeshStandardMaterial({color:0x8e2a20,roughness:.5}));vw.rotation.x=Math.PI/2;vw.position.y=.56;vent.add(vw);fieldG.userData.wheel=vw;
  // Brandt's pickup (Public Works white, its tailgate down, the work light on a stand)
  const truck=new THREE.Group();truck.position.set(MH.truck.x,MH.truck.y,MH.truck.z);truck.rotation.y=-headingTo(MH.truck.x,MH.truck.z,main(1140,-3.6).x,main(1140,-3.6).z);fieldG.add(truck);
  const white=new THREE.MeshStandardMaterial({color:0xe6e4dc,roughness:.5}),tire=new THREE.MeshStandardMaterial({color:0x141414,roughness:.9}),glass=new THREE.MeshStandardMaterial({color:0x1b2328,roughness:.1,metalness:.4});
  for(const [x,y,z,w,h,d,m] of [[0,.9,.6,1.9,.9,4.6,white],[0,1.55,-.4,1.85,.8,1.6,white],[0,1.6,-1.21,1.6,.5,.04,glass],[0,.55,2.95,1.9,.35,.08,white]])  {const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);truck.add(b);}
  for(const [x,z] of [[-.95,-1.4],[.95,-1.4],[-.95,1.6],[.95,1.6]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.26,14),tire);w.rotation.z=Math.PI/2;w.position.set(x,.36,z);truck.add(w);}
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(.4,.28,.15),new THREE.MeshStandardMaterial({color:0xfff0d0,emissive:0xffe8c0,emissiveIntensity:1.5}));lamp.position.set(1.4,2.1,2.6);truck.add(lamp);const st=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2,6),white);st.position.set(1.4,1,2.6);truck.add(st);fieldG.userData.truck=truck;}
 // ---- the complex's own lights, by where you are (only what has power; the rest is your flashlight) --------------------------------------
 const W=(x,z,y)=>({x:CX.x+x,z:CX.z+z,y});
 function lightsBelow(area){const L=(i,x,z,y,o2={})=>light(i,W(x,z,y),o2);for(let i=0;i<6;i++)light(i,null);
  if(area==='A'){L(0,0,-2.2,2.8,{intensity:4,dist:9,color:0xffe0b0,flicker:.15});}
  else if(area==='B'){L(0,-19,10.2,-.4,{intensity:5,dist:9,color:0xffd9a0});L(1,-17.5,18.2,-1.2,{intensity:C.flags.film?3:0,dist:6,color:0xd8e0ff});L(2,16,14,1.5,{intensity:2.2,dist:12,color:0x9fb0c0,flicker:.4});}
  else if(area==='C'){L(0,24,13.2,-.6,{intensity:4,dist:8,color:0xffe0b0,flicker:.1});L(1,43,13.2,-1,{intensity:C.flags.cPower?3:0,dist:6,color:0xffe8c8});}
  else if(area==='J'){L(0,0,27,.9,{intensity:4.5,dist:12});L(1,8,27,.9,{intensity:4.5,dist:12});L(2,-12,27,-.6,{intensity:3,dist:10,flicker:.2});L(3,17,27,-.2,{intensity:3,dist:10});}
  else if(area==='K'){L(0,3.5,34,-.3,{intensity:4,dist:10});L(1,3.5,40,-.3,{intensity:4,dist:10});L(2,-2,39.6,-.5,{intensity:4,dist:8,color:0xffe8c8});L(3,0,48,.9,{intensity:4,dist:12});L(4,12,48,.9,{intensity:4,dist:12,color:C.flags.alarm?0xff3a2a:0xffd6a0});}
  else if(area==='F'){L(0,19.8,50,-.5,{intensity:3.2,dist:9});L(1,19.8,58,-.5,{intensity:3.2,dist:9,flicker:.3});L(2,22,68.8,-.5,{intensity:3.5,dist:9,color:0xffd8a0});L(3,21,76,-.8,{intensity:1.5,dist:7,color:0xc0a8a0,flicker:.5});
   if(CM.made.visible)L(5,17.7,70.4,-1.55,{intensity:4,dist:7,color:0xffc890});}/* (his desk lamp, in the room it made) */
  // the main chamber: work lights along the catwalk, and the big cold lamps on the chamber's walls (the plug, the throat, the ribs)
  else if(area==='I'){L(0,-12.1,60,6.4,{intensity:4,dist:12,color:0xffe0b0});L(1,-12.1,72,6.4,{intensity:4,dist:12,color:0xffe0b0,flicker:.15});L(2,-8,78.2,6.4,{intensity:4.5,dist:12,color:0xffe0b0});
   L(3,1,66,9,{intensity:320,dist:50,color:0xa8bcd8,flicker:.08});L(4,1,82,5,{intensity:220,dist:40,color:0x9fb2cc,flicker:.12});}
  else if(area==='I'){L(0,-30,61.8,6.4,{intensity:3,dist:12});L(1,-12,66,6.6,{intensity:4,dist:14});L(2,-8,78,6.6,{intensity:5,dist:12});L(3,1,70,-6,{intensity:2.5,dist:30,color:0x9a8a80});}
  C.area=area;}
 const areaOf=id=>!id?null:['A','L4','S1'].includes(id)?'A':['B','B1','B2'].includes(id)?'B':/^C/.test(id)?'C':/^(J|D|E)/.test(id)?'J':['K','G','GD','H'].includes(id)?'K':/^F/.test(id)?'F':['IW','IP','L2'].includes(id)?'I':null;
 // ---- under the court: in, and the companions' floor -------------------------------------------------------------------------------------
 function enterComplex(at,a){CM.show(true);nav.setRoom(CM.nav);lightsOn(true);o.nightRendering?.(true);o.flashShadow?.(true);const q=CM.at(at);o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:null});C.where='below';
  o.setFlashlight?.(true,true);C.inv.flashlight='have';C.amb={traffic:0,insects:0,wind:0,life:0,forest:0,tunnel:1,water:.4};}
 // ---- Act I, scene 1: the four bikes ------------------------------------------------------------------------------------------------------
 function nightStreet(){document.body?.classList?.add('night1');nav.setTown(true);nav.setPine?.(true);ch3?.presentation?.(false);o.nightRendering?.(true);o.flashShadow?.(true);A8&&(k.api.night=1);ambient.night?.(true);ambient.morning?.(false);
  for(const a of [...(k.adults||[]),...(X.ch2.extra||[])])a.show(false);police.reset?.();k.carA.show(false);k.carB.show(false);
  X.ch2.flyers&&(X.ch2.flyers.visible=true);X.ch2.found&&(X.ch2.found.group.visible=false);X.ch2.tape&&(X.ch2.tape.visible=false);
  for(const c of [jamie,sam])leave(c);sam.bike.group.visible=false;jamie.bike.group.visible=false;C.amb={traffic:.1,insects:.55,wind:.35,life:0,forest:0,tunnel:0,water:0};}
 const ambient=o.ambient;
 function sceneBikes(from='start'){go('d8-bikes');C.where='sams';nightStreet();house.show(true);house.reset();house.show(true);house.lightsOut?.(true);stageBikes(true);if(!coverG.parent)scene.add(coverG);coverG.position.set(COVER.x,COVER.y,COVER.z);coverG.userData.lid.position.set(.18,.03,.06);coverG.userData.lid.rotation.set(.05,.4,0);
  lightsOn(true);light(0,LAMP,{intensity:34,dist:14,color:0xffcf8a});light(1,{x:STOOP.x,y:STOOP.y+2.4,z:STOOP.z},{intensity:2.4,dist:6,color:0xffd2a0});C.h=Math.max(C.h,HOUR.start);C.hMin=HOUR.start;date(C.h);
  if(from==='start'||from==='bikes'){nav.setRoom(house.nav);const q=HSP.samIn||HSP.enter;o.placePlayer({x:q.x,z:q.z,a:house.heading?.(0)??0,mode:'walk',bike:null});}
  else{nav.setRoom(null);const q=main(SH.drivD+1,-1);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,COVER.x,COVER.z),mode:'walk',bike:null});}
  checkpoint('chapter8-start');
  task('bikes',(function*(){
   if(from==='start'){yield* lines([{wait:1.4},N('Under the streetlight across the street, four bikes stand in a row.',{time:3.6}),{wait:.6},N('You heard him. Reyes said yours and Jamie’s were in his trunk.',{time:3.6})]);}
   objective('Go outside.','The bikes. Under the streetlight.');
   if(from==='start'||from==='bikes'){offer('out','Go outside',()=>HSP.door||HSP.front,{r:2.2,when:()=>house.inHouse?.(me().x,me().z)});yield* until(()=>C.flags.out||!house.inHouse?.(me().x,me().z));
    if(C.flags.out){C.fadeOut=0;C.after=()=>{nav.setRoom(null);const q=WALK;o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,COVER.x,COVER.z),mode:'walk',bike:null});C.fadeIn=0;};yield* wait(2.2);}}
   nav.setRoom(null);sound('c6Static',LAMP,{gain:.0});
   // the bikes: each one looked at; wet, mud on the tyres, the same mud as the culvert
   const looks={alex:['Alex’s. The green cruiser, the rack, the bell. The police took it on Sunday night. There’s still an evidence tag on the seat post.','Wet. Mud in the tread, grey, the culvert’s.'],
    jamie:['Jamie’s BMX. The pegs, the pad. It was in Reyes’s trunk an hour ago.','The bars are wet. The grips are cold.'],sam:['Sam’s. The bottle in its cage, still half full. It was on its stand in his garage this morning.','The tyres are caked to the rim.'],
    player:['Yours.','The bell rings when you touch it. It’s the only one that does.']};
   objective('Look at the bikes.','Under the streetlight.');
   for(const b of BIKES){const q=bikeAt(b);offer('bike-'+b.kk,'Look at '+(b.kk==='player'?'your bike':b.kk==='alex'?'Alex’s bike':b.kk==='jamie'?'Jamie’s bike':'Sam’s bike'),{x:q.x,y:q.y+.7,z:q.z},{r:2.4,look:true,size:.5,cone:.1,
    fn:()=>{const L=looks[b.kk];say(L.map(t=>N(t,{time:3.2})));if(b.kk==='player')sound('bell',{x:q.x,y:q.y+1,z:q.z},{gain:.5});C.looked.add('bike-'+b.kk);}});}
   const sheetAt=(()=>{const q=bikeAt(BIKES[2]);return {x:q.x+.3,y:q.y+.03,z:q.z+.4};})();
   offer('sheet','Pick up the page',sheetAt,{r:2,look:true,size:.25,cone:.16,when:()=>C.looked.size>=2,fn:()=>{C.inv.sheet='have';task('sheet-read',(function*(){yield* reading('sheet',[N('A page out of Sam’s notebook. The one torn out of it. Line Four, drawn bending round a box nobody drew.',{time:4.2}),N('MH-12 (1959). WHY IS THERE A JUNCTION NOBODY DREW? UNDER THE COURT.',{time:4})]);})());}});
   yield* until(()=>C.looked.size>=3&&C.flags.sheet||C.pt>150);
   // the cover in the road: shifted off its seat; cold air breathing out of the gap; the streetlight hums and shudders
   objective('The street.','Something in the road.');offer('cover','Look at the cover',{x:COVER.x,y:COVER.y+.1,z:COVER.z},{r:3,look:true,size:.4,cone:.14,fn:()=>{C.flags.coverSeen=true;}});
   yield* until(()=>C.flags.coverSeen||C.pt>200);
   yield* looking({x:COVER.x,y:COVER.y,z:COVER.z},[N('A manhole cover. OAK HOLLOW TWP. — LINE 4. It’s been pushed half off its seat, from underneath.',{time:4}),N('Cold air is coming up out of the gap. You can see your breath in it.',{time:3.4})],{back:1.2,eye:1.25,kind:'cover'});
   C.flags.breath=true;
   yield* wait(.6);sound('c8Impact',{x:COVER.x,y:COVER.y-4,z:COVER.z},{gain:.8});C.shake=.35;C.lampShake=1.2;T?.jolt?.(.6,{rise:.5,hold:6,why:'under the road'});
   yield* lines([N('A thud, far under the road. The streetlight shudders on its pole.',{time:3})]);
   checkpoint('c8-reyes');
   // Reyes: his car round the corner, slow, no siren; he gets out with your bikes on his mind
   const car=k.carA;car.show(true);const cq=main(SH.drivD-14,-2.2),cq2=main(SH.drivD-4,-2.2);car.park(cq.x,cq.z,headingTo(cq.x,cq.z,cq2.x,cq2.z));car.lights=false;police.attach?.(true);
   reyes.show(true);const rq=main(SH.drivD-11,-4.3);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,COVER.x,COVER.z));reyes.gest('flashlight');reyes.lookAt=null;
   yield* lines([R('Hey. HEY. What are you doing out here?',{time:2.2})]);
   reyes.walk([[main(SH.drivD-3,-2.6).x,main(SH.drivD-3,-2.6).z]],{speed:1.5,then:a=>{a.faceTo(BIKES[0]&&bikeAt(BIKES[1]).x,bikeAt(BIKES[1]).z);}});
   yield* until(()=>!reyes.walking,12);
   yield* lines([R('Those are— I had those in my trunk.',{time:2.2,face:'tired'}),{wait:.6},R('I had them in my trunk.',{time:1.8})]);
   const p0=me();reyes.lookAt={x:p0.x,y:camera.position.y,z:p0.z};
   yield* lines([Y('They’re underneath us.',{time:1.8}),R('Who?',{time:1}),Y('All of them.',{time:1.6})]);
   sound('c8Impact',{x:COVER.x,y:COVER.y-3,z:COVER.z},{gain:1.3});C.shake=.7;C.coverJump=1;T?.jolt?.(.9,{rise:.8,hold:8,why:'the cover moved'});
   yield* lines([R('Get away from that cover.',{time:1.8})]);
   yield* wait(1.2);
   // show him the page: MH-12; the plate Brandt photographed; the line in the road runs to the court
   objective('Show Reyes Sam’s page.','');offer('give','Show Reyes the page',()=>({x:reyes.x,y:1.5+gy(reyes.x,reyes.z),z:reyes.z}),{r:2.6});
   yield* until(()=>C.flags.give||C.pt>400);
   yield* lines([R('MH-12. That’s the plate on Brandt’s photograph.',{time:2.4}),R('It isn’t on any map we’ve got. It’s under the field. Past the oak.',{time:3}),{wait:.4},Y('Line Four goes there. This is Line Four.',{time:2.4}),
    R('…Okay.',{time:1}),R('Okay. I’m calling Brandt. Get in the car.',{time:2.2})]);
   objective('Get in Reyes’s car.','');offer('car','Get in the car',()=>({x:car.x,y:gy(car.x,car.z)+1,z:car.z}),{r:3.2});
   yield* until(()=>C.flags.car||C.pt>520);
   C.fadeOut=0;C.after=()=>sceneField();})());}
 // ---- Act I, scene 2: the missing junction (the field past the oak) -------------------------------------------------------------------------
 const MAP={cv:null,overlay:.5,cursor:{x:.5,y:.5},mark:null,solved:false,tries:0,hint:0};
 const MH12N={x:410/900,y:215/680};
 function drawMap(){if(!MAP.cv){try{const c=document.createElement('canvas');c.width=900;c.height=680;if(c.getContext?.('2d'))MAP.cv=c;}catch{}}const c=MAP.cv;if(!c)return;const g=c.getContext('2d');
  const a=PAGES8.map2009,b=PAGES8.plan1959;MAP.a??=(()=>{const x=document.createElement('canvas');x.width=900;x.height=680;a.draw(x.getContext('2d'),900,680);return x;})();MAP.b??=(()=>{const x=document.createElement('canvas');x.width=900;x.height=680;b.draw(x.getContext('2d'),900,680);return x;})();
  g.globalAlpha=1;g.drawImage(MAP.a,0,0);g.globalAlpha=MAP.overlay;g.drawImage(MAP.b,0,0);g.globalAlpha=1;
  const cx=MAP.cursor.x*900,cy=MAP.cursor.y*680;g.strokeStyle='#b02a1a';g.lineWidth=2;g.beginPath();g.moveTo(cx-14,cy);g.lineTo(cx+14,cy);g.moveTo(cx,cy-14);g.lineTo(cx,cy+14);g.stroke();
  if(MAP.mark){g.strokeStyle=MAP.solved?'#1a6a2a':'#b02a1a';g.lineWidth=3;g.beginPath();g.arc(MAP.mark.x*900,MAP.mark.y*680,16,0,7);g.stroke();}
  if(MAP.tex)MAP.tex.needsUpdate=true;}
 function mapView(on){if(on){drawMap();if(!MAP.mesh){MAP.tex=MAP.cv?new THREE.CanvasTexture(MAP.cv):null;if(MAP.tex)MAP.tex.colorSpace=THREE.SRGBColorSpace;MAP.mesh=new THREE.Mesh(new THREE.PlaneGeometry(.46,.348),new THREE.MeshBasicMaterial({map:MAP.tex,color:MAP.tex?0xffffff:0xe8e4d8}));}
   X.inspect(MAP.mesh,{dist:.42,kind:'maps'});C.view='maps';}else if(C.view==='maps'){X.endInspect();}}
 function mapKey(code){if(C.view!=='maps')return false;if(code==='KeyA'){MAP.overlay=clamp(MAP.overlay-.2,0,1);drawMap();return true;}if(code==='KeyD'){MAP.overlay=clamp(MAP.overlay+.2,0,1);drawMap();return true;}
  if(code==='KeyF'){MAP.mark={...MAP.cursor};MAP.tries++;const d=Math.hypot(MAP.mark.x-MH12N.x,(MAP.mark.y-MH12N.y)*.76);MAP.solved=d<.045;drawMap();C.flags.mapMarked=MAP.tries;if(MAP.solved){C.flags.mapSolved=true;sound('c7Pencil',camera.position,{gain:.5});}return true;}
  if(code==='KeyS'&&MAP.solved){mapView(false);C.flags.mapDone=true;return true;}return ['KeyW','Space','KeyC','KeyS'].includes(code);}
 function mapPan(dx,dy){if(C.view!=='maps')return false;MAP.cursor.x=clamp(MAP.cursor.x+dx*.0011,.02,.98);MAP.cursor.y=clamp(MAP.cursor.y+dy*.0011,.02,.98);drawMap();return true;}
 function mapWheel(dy){if(C.view!=='maps')return false;MAP.overlay=clamp(MAP.overlay+(dy<0?.2:-.2),0,1);drawMap();return true;}
 function sceneField(from='field'){go('d8-field');C.where='field';nightStreet();house.show(false);stageBikes(false);coverG.removeFromParent();if(!fieldG.parent)scene.add(fieldG);
  const U=fieldG.userData;U.turf.visible=['lift','shaft'].includes(from)||!!C.flags.dug;U.lid.visible=U.turf.visible;U.hole.visible=false;U.lid.position.set(MH.at.x,MH.at.y+.04,MH.at.z);
  C.h=Math.max(C.h,HOUR.field);C.hMin=HOUR.field;date(C.h);lightsOn(true);light(0,{x:U.truck.position.x,y:MH.truck.y+2.2,z:U.truck.position.z},{intensity:14,dist:16,color:0xfff0d8});light(1,null);
  const car=k.carA;car.show(true);car.park(MH.car.x,MH.car.z,headingTo(MH.car.x,MH.car.z,main(1145,3).x,main(1145,3).z));car.lights=true;police.attach?.(true);
  brandt?.show(true);const bq=main(1135.6,-1.6);brandt?.place(bq.x,bq.z,headingTo(bq.x,bq.z,MH.at.x,MH.at.z));brandt?.gest?.('flashlight');
  reyes.show(true);const rq=main(1137,-.2);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,MH.at.x,MH.at.z));reyes.gest('flashlight');
  const pq=main(1136.2,-2.8);o.placePlayer({x:pq.x,z:pq.z,a:headingTo(pq.x,pq.z,MH.at.x,MH.at.z),mode:'walk',bike:null});o.setFlashlight?.(true,false);C.inv.flashlight='have';
  if(from==='field')checkpoint('c8-field');if(from!=='field')C.flags.mapDone=true;
  task('field',(function*(){
   if(from==='field'){C.fadeIn=0;yield* lines([{wait:1},BR('Sheet two. The court’s mouth, 1959. Nobody’s opened this drawer since I started.',{time:3.4}),BR('If it’s there it’s under the grass. They seeded over all of it in seventy-five.',{time:3.2}),
     R('Show him.',{time:1})]);
    objective('Compare the old plan with the new map.','Brandt’s tailgate. A / D or the wheel: how much of the old plan shows. The mouse moves the pencil. F marks.');
    offer('maps','Look at the plans',()=>({x:fieldG.userData.truck.position.x,y:MH.truck.y+.95,z:fieldG.userData.truck.position.z}),{r:3.6,fn:()=>mapView(true),once:false,when:()=>!C.flags.mapDone});
    let hinted=0;while(!C.flags.mapDone){yield;if(C.view==='maps'&&!busy()){const el=C.pt;
      if(C.flags.mapMarked&&!MAP.solved&&MAP.tries>hinted){hinted=MAP.tries;say([BR(MAP.tries>2?'The oak’s on both. Eighteen feet off it, southwest. Toward the bench.':'Not there. Find something that’s on both.',{time:2.8})]);}
      if(MAP.solved&&!C.flags.mapSaid){C.flags.mapSaid=true;say([BR('That’s it. Right there. Eighteen feet off the oak.',{time:2.4}),N('S puts the plans down.',{time:2})]);}void el;}}
    unoffer('maps');checkpoint('c8-probe');}
   // the probe: a steel rod pushed into the turf, iron when you find it
   if(from==='field'||from==='probe'){objective('Find MH-12 with the probe.','Between the oak and the bench. F pushes the rod into the grass.');
    offer('probe','Push the probe in',()=>{const p=me(),f={x:p.x+Math.sin(p.a)*.9,z:p.z-Math.cos(p.a)*.9};return {x:f.x,y:gy(f.x,f.z)+.1,z:f.z};},{r:9,once:false,when:()=>!C.flags.found,
     fn:()=>{const p=me(),f={x:p.x+Math.sin(p.a)*.9,z:p.z-Math.cos(p.a)*.9},d=Math.hypot(f.x-MH.at.x,f.z-MH.at.z);sound('c7Pencil',{x:f.x,y:gy(f.x,f.z),z:f.z},{gain:.3});C.probes=(C.probes||0)+1;
      if(d<1.25){C.flags.found=true;sound('c6Clank',{x:f.x,y:gy(f.x,f.z),z:f.z},{gain:.9});say([N('Clank. Iron, a hand down under the turf.',{time:2.4}),BR('That’s her.',{time:1.2})]);}
      else if(d<3)say([N('Something hard. Deeper.',{time:1.8}),...(C.probes%2?[BR('You’re close.',{time:1})]:[])]);else if(d<6)say([N('A stone.',{time:1.2}),BR('Closer to the oak.',{time:1.4})]);else say([N('Dirt.',{time:1}),...(C.probes%3===0?[BR('Eighteen feet off the oak. Toward the bench.',{time:2.2})]:[])]);}});
    yield* until(()=>C.flags.found||C.pt>600);C.flags.found=true;unoffer('probe');checkpoint('c8-lift');}
   // the turf off it; the vent; the lift
   const U=fieldG.userData;
   if(!C.flags.dug){objective('Dig it out.','Hold F: Brandt’s shovel.');offer('dig','Dig',{x:MH.at.x,y:MH.at.y+.2,z:MH.at.z},{r:2.4,hold:4,tick:(dt,v)=>{if(Math.random()<dt*2.5)sound('c7Drag',MH.at,{gain:.4});U.turf.visible=v>.3;U.lid.visible=v>.75;},fn:()=>{C.flags.dug=true;U.turf.visible=true;U.lid.visible=true;}});
    yield* until(()=>C.flags.dug);yield* lines([N('A cover, cast iron: OAK HOLLOW TWP. — MH-12 — O.M.C. 1959.',{time:3.4}),BR('Okay. Hook.',{time:1}),{wait:.6},N('Brandt hooks it and pulls. It doesn’t move.',{time:2.6}),
     BR('She’s sucked down. Hear that? There’s a draught going in the pick hole.',{time:3}),BR('There’s a vent on these. Capped, on the old curb line. Open it.',{time:2.6})]);}
   if(!C.flags.vent){objective('Open the vent.','On the old curb line. Hold F.');offer('vent','Turn the vent valve',{x:MH.vent.x,y:MH.vent.y+.5,z:MH.vent.z},{r:2.2,hold:3,tick:(dt,v)=>{U.wheel.rotation.z=v*9;if(Math.random()<dt*3)sound('c6Grind',MH.vent,{gain:.25});},fn:()=>{C.flags.vent=true;sound('c8Hiss',MH.vent,{gain:1});}});
    yield* until(()=>C.flags.vent);yield* lines([N('Air roars into the pipe, a long breath going down. Then it stops.',{time:3}),BR('There she goes. Now. On three.',{time:2})]);}
   // the lift: the three of you on the hooks and the bar, on Brandt's count
   objective('Lift it.','On Brandt’s three: F.');let ok=false,tries=0;
   while(!ok){tries++;C.flags.heave=false;offer('heave','Lift',{x:MH.at.x,y:MH.at.y+.3,z:MH.at.z},{r:2.6,once:false});const t0=C.t;let pressedAt=null;C.flags.heave=false;
    say([BR('One.',{time:.8}),BR('Two.',{time:.8}),BR('Three.',{time:.9,act:()=>{C.threeAt=C.t;}})]);
    while(C.t-t0<5.2){yield;if(C.flags.heave&&pressedAt===null){pressedAt=C.t;C.flags.heave=false;}}
    unoffer('heave');ok=tries>=3||(pressedAt!==null&&C.threeAt&&pressedAt>=C.threeAt-.25&&pressedAt<=C.threeAt+1.2);
    if(!ok)yield* lines([BR(pressedAt===null?'On three. You have to pull on three.':pressedAt<C.threeAt?'Too soon. Wait for three.':'Again. On three.',{time:2})]);}
   sound('c6Clank',MH.at,{gain:1.2});U.lid.position.set(MH.at.x+.7,MH.at.y+.04,MH.at.z+.2);U.hole.visible=true;mark('MH-12 open');
   yield* lines([N('It comes up and over. A ladder, going down into black. The air is cold and wet and smells like the culvert.',{time:4}),BR('I’ll stay up top with the radio. Twenty minutes, Reyes.',{time:2.6}),
    R('Stay behind me.',{time:1.4})]);
   objective('Climb down.','MH-12.');offer('climb','Climb down',{x:MH.at.x,y:MH.at.y+.2,z:MH.at.z},{r:2});
   yield* until(()=>C.flags.climb||C.pt>900);
   C.fadeOut=0;C.after=()=>sceneShaft();})());}
 // ---- Act I, scene 2b: the access chamber and the outer barrier -----------------------------------------------------------------------------
 function hideReyesBelow(at,a){reyes.show(true);const q=CM.at(at);reyes.place(q.x,q.z,a);reyes.gest('flashlight');}
 function sceneShaft(from='shaft'){go('d8-shaft');fieldG.removeFromParent();k.carA.show(false);police.attach?.(false);brandt?.show(false);
  enterComplex('arrive',Math.PI);lightsBelow('A');C.h=Math.max(C.h,HOUR.shaft);C.hMin=HOUR.shaft;date(C.h);hideReyesBelow('stairTop',Math.PI*.5);
  checkpoint(from==='barrier'?'c8-shaft':'c8-shaft');C.fadeIn=0;
  task('shaft',(function*(){
   if(from==='shaft'){yield* lines([{wait:.8},N('The bottom of the shaft. A concrete room, 1959 painted on the wall in stencil. A switch box. A stair going down.',{time:4}),
     N('West, a pipe big enough to walk in goes away under the neighbourhood. LINE 4 → OAK HOLLOW DR.',{time:3.6}),R('Nobody’s been down here in years.',{time:1.8})]);}
   // in the Line Four connector: something coming along it from the far end; its breath, its weight
   CM.ST.barrier=CM.ST.barrierWant=1;
   // (its walk: deep in the pipe, a pause; halfway, a pause; then in close to the chamber, where it stops and listens a while)
   huntStart({ids:['A','L4'],at:CM.at('hunterL4'),catchTo:'c8-barrier',range:13,fov:1.1,speedK:.85,extra:[{id:'L4deep',x:CX.x-24.5,z:CX.z-3,pause:2.4},{id:'L4mid',x:CX.x-16.5,z:CX.z-3,pause:1.2},{id:'L4near',x:CX.x-10.4,z:CX.z-3,pause:3.2}]});
   H.patrol(['L4deep','L4mid','L4near','L4mid']);
   checkpoint('c8-barrier');
   yield* wait(2);sound('c7Step',CM.at('hunterL4'),{gain:.6});yield* lines([R('…Hear that?',{time:1.2}),{wait:1},R('Something’s in that pipe.',{time:1.6})]);
   yield* lines([BRR('Reyes. You there? There’s a gate on that side line. A crank, your side. Turn it, she comes down.',{time:3.6})]);
   objective('Close the outer barrier.','The crank by the Line Four pipe. Hold F. It hears the crank. Stop when it comes.');
   offer('crank','Turn the crank',()=>CM.at('barrierCrank',1.15),{r:1.25,hold:9,noise:.95,tick:(dt,v)=>{CM.ST.barrierWant=1-v;if(Math.random()<dt*2.2)sound('c6Grind',CM.at('barrierCrank',1.2),{gain:.45});},
    release:()=>{CM.ST.barrierWant=CM.ST.barrier;},fn:()=>{CM.ST.barrierWant=0;C.flags.barrierDown=true;}});
   let warned=0;
   while(!C.flags.barrierDown){yield;const d=Math.hypot(HM.x-me().x,HM.z-me().z);if(d<9&&warned<2&&!busy()){warned++;say([R(warned===1?'Stop. Stop. It’s coming.':'Lights off. Don’t move.',{time:1.6})]);}if(d>14)warned=Math.min(warned,1);}
   yield* until(()=>CM.ST.barrier<.04,8);
   // it comes to the leaf and hits it, and hits it, and puts its hand under it, and cannot come through; then it goes
   H.script([{to:()=>[CX.x-8.8,CX.z-3],speed:3.4,state:'run',free:false,near:.5},{act:()=>{sound('c7Door',CM.at('barrierLeaf',1.2),{gain:1.3});C.shake=.5;}},{wait:.6,state:'alert'},
    {act:()=>{sound('c7Door',CM.at('barrierLeaf',1.2),{gain:1.4});C.shake=.55;}},{wait:1.2,state:'peek',low:.9,look:CM.at('barrierCrank',1)},{wait:2.4,state:'crouch',low:1},
    {to:()=>[CX.x-24,CX.z-3],speed:1.1,state:'walk'},{act:()=>huntStop()}]);
   mark('it stopped at the barrier');
   yield* lines([{wait:2.2},R('…It stopped. At the gate.',{time:1.8}),{wait:2},R('It didn’t try the top. It didn’t try anything. It just— stopped.',{time:3}),{wait:3},BRR('Reyes? Talk to me.',{time:1.4}),R('Gate’s down. We’re going on.',{time:1.8})]);
   C.flags.shaftDone=true;checkpoint('c8-gallery');sceneGallery('gallery');})());}
 // ---- Act II, scene 3: the construction gallery (and Reyes on the other side of the bulkhead) --------------------------------------------------
 function sceneGallery(from='gallery'){go('e8-gallery');if(from!=='gallery-continue')enterComplex(from==='gallery'?'stairTop':'officeIn',from==='gallery'?Math.PI:Math.PI/2);lightsBelow('B');
  C.h=Math.max(C.h,HOUR.gallery);C.hMin=HOUR.gallery;date(C.h);CM.setDoor('bulkhead',.55,{instant:true});
  if(from==='gallery'){hideReyesBelow('stairTop',Math.PI);checkpoint('c8-gallery');}
  task('gallery',(function*(){
   if(from==='gallery'){objective('Follow Reyes.','Down the stair.');reyes.walk([[CM.at('stairFoot').x,CM.at('stairFoot').z],[CM.at('galleryMid').x,CM.at('galleryMid').z],[CM.at('bulkhead').x,CM.at('bulkhead').z-1.2]],{speed:1.15});
    yield* until(()=>near(CM.at('stairFoot'),3)||C.pt>40);
    yield* lines([N('A hall the size of a church, concrete, the marks of the boards it was poured against still in it. Columns. A crane on a rail, up in the dark.',{time:4.4}),
     R('Nineteen fifty-eight. They built this before the street was even— no. The street was here.',{time:3.4}),N('Along the floor a long dark streak, as if something heavy had been dragged, again and again, toward the far end.',{time:4})]);
    yield* until(()=>!reyes.walking,30);reyes.faceTo(CM.at('bulkhead').x,CM.at('bulkhead').z+2);
    yield* lines([R('There’s a door. It’s half up. I’ll look. Wait here. Right here.',{time:2.6})]);
    reyes.walk([[CM.at('bulkhead').x,CM.at('bulkhead').z+1.6],[CM.at('jMid').x,CM.at('jMid').z]],{speed:1});yield* wait(3.2);
    // the east window: a hand on the frame, out of the shaft beyond it; the bulkhead drops, fail-safe, when the old power dips
    sound('c7Glass',CM.at('deepWindow',0),{gain:1.2});C.shake=.4;T?.jolt?.(1,{rise:1,hold:14,why:'the window'});
    HM.show(true);H.reset();HM.show(true);const wq=CM.at('deepWindow');H.place(wq.x+.4,wq.z,-Math.PI/2);
    H.script([{wait:.9,state:'peek',low:.4,look:()=>camera.position},{to:()=>[CM.at('galleryE').x,CM.at('galleryE').z],speed:1.3,state:'stalk',free:true},{act:()=>{}}]);
    yield* wait(.6);CM.setDoor('bulkhead',0);sound('c7Door',CM.at('bulkhead',1.4),{gain:1.4});C.shake=.5;
    yield* lines([V('REYES (BEHIND THE DOOR)','GET OUT OF SIGHT!',{time:1.4}),N('The bulkhead’s down. Reyes is on the other side of it.',{time:2.6})]);reyes.show(false);
    C.flags.split=true;}
   checkpoint('c8-stealth');
   huntStart({ids:['B','B1','B2','S1'],cells:['B'],filter:n=>n.x>CX.x-5,at:CM.at('galleryE'),catchTo:'c8-stealth',range:14,fov:1.2,speedK:.9});// (it walks the east of the hall; the rooms on the west only when it hears something)
   if(from!=='gallery')yield* lines([{wait:.4},V('REYES (BEHIND THE DOOR)','Find another way— there’s power somewhere, this thing runs on— just stay out of sight!',{time:3.2})]);
   else yield* lines([V('REYES (BEHIND THE DOOR)','Find another way round. The door needs power. Stay out of its sight.',{time:3.2})]);
   objective('Stay out of its sight.','The offices on the west side. Crouch (C) and keep your light off (T).');
   // hiding places: the office's cabinet, under the review room's booth
   offer('hide-B1','Hide in the cabinet',()=>CM.at('officeCabinet',1),{r:1.6,once:false,when:()=>!C.hiding,fn:()=>hide('B1',CM.at('officeCabinet'))});
   offer('hide-B2','Hide behind the projector stand',()=>CM.at('reviewProj',.6),{r:1.6,once:false,when:()=>!C.hiding,fn:()=>hide('B2',CM.at('reviewProj'))});
   recordsOffers();
   yield* until(()=>C.flags.filmDone&&C.flags.receipt);
   // it gives up on the room and goes back the way it came, out through the broken window into the shaft
   yield* until(()=>H.mode==='patrol'||C.pt>2000,40);const wq=CM.at('deepWindow');H.script([{to:()=>[wq.x-.6,wq.z],speed:1.4,state:'walk'},{wait:.6,state:'crouch'},{act:()=>{sound('c7Glass',CM.at('deepWindow',0),{gain:.5});huntStop();}}]);
   yield* lines([N('The long footfalls go away up the hall. Glass, at the far end. Then nothing.',{time:3.2})]);
   objective('Find power for the bulkhead.','The service corridor: the green door on the east side.');
   yield* until(()=>CM.cellIdAt(me().x,me().z)==='C'||C.pt>2400);
   // it leaves the gallery the way it came (back out into the shaft), and the corridor is its own
   huntStop();sceneCorridor('corridor');})());}
 function hide(id,q){C.hiding=id;o.roam.walkLock=true;C.hideAt=q;offer('unhide','Come out',q,{r:9,once:true,fn:()=>{C.hiding=null;o.roam.walkLock=false;}});mark('hiding: '+id);o.setFlashlight?.(true,false);}
 // ---- Act II, scene 4: Annie Rowan, 0417; the film -----------------------------------------------------------------------------------------------
 const film=createFilm();
 function recordsOffers(){
  offer('receipt','Look at the desk',()=>CM.at('officeDesk',.82),{r:2,look:true,size:.4,cone:.14,fn:()=>task('receipt',(function*(){
   yield* reading('receipt',[N('A carbon sales slip, under the desk blotter. MASON CYCLE & SPORT, 214 MAIN ST. June 14, 1958.',{time:3.6}),N('SOLD TO: Annie Rowan. One Meadowlark, green. Bell, rack, reflector. Township licence No. 0417.',{time:4.4}),
    N('“First one out the door. — R.M.”',{time:2.4})]);C.inv.receipt='have';C.flags.receipt=true;
   yield* reading('registration',[N('Clipped to it, the township’s licence card. NO. 0417. OWNER: ROWAN, A. (ANNIE). AGE 12. MEADOWLARK, GREEN.',{time:4.2}),N('In pencil: owner missing 8/2/58 — see Chief Hollis.',{time:3})]);
   yield* reading('annie',[N('Pinned on the board over the desk with the site photographs: a school picture. A girl with dark hair and a cardigan.',{time:3.8}),N('On it, in pencil: Annie Rowan — 6th grade.',{time:2.6}),
    N('A.R. On the oak. On the frame of the old bike. In chalk, beside your initials.',{time:3.6})]);C.flags.annie=true;mark('Annie Rowan');})())});
  offer('film','Wind the projector',()=>CM.at('reviewProj',1.4),{r:1.8,hold:2.6,noise:.6,tick:()=>{if(Math.random()<.2)sound('c8Film',CM.at('reviewProj',1.3),{gain:.35});},fn:()=>{C.flags.film=true;lightsBelow('B');filmRun();}});}
 function filmRun(){C.filmT=0;C.view=null;task('film-run',(function*(){CM.screenM.map=film.tex;CM.screenM.color?.setHex?.(film.tex?0xffffff:0x777777);CM.screenM.needsUpdate=true;
  objective('Watch.','The screen. The projector is loud: get down behind its stand (F) if it comes.');
  let last=-1,lured=false;const beats=[[4,N('Ribbed walls. A cot. Someone small on it, in white.',{time:3})],[8,N('Two men in coveralls lift her and carry her away from the cot.',{time:3.4})],[13,N('The far wall moves. The ribs bulge out of it. Dust comes down.',{time:3.4})],
   [20,N('They stop. They look at the wall. They look at each other.',{time:3.2})],[28,N('They carry her back. They lay her down on the cot.',{time:3.2})],[35,N('The wall goes still.',{time:2.4})],[40,N('TEST 3 — 9/58 — SUBJECT A.R. — CH. 1.',{time:3})]];
  while((C.filmT||0)<film.LEN-.5){yield;C.filmT=(C.filmT||0)+C.dt;if(Math.random()<C.dt*4)sound('c8Film',CM.at('reviewProj',1.3),{gain:.3});film.draw(C.filmT);for(const [i,[t2,l]] of beats.entries())if(C.filmT>=t2&&last<i){last=i;say([l]);}
   // (the clatter carries: it comes to see, stands in the door, looks; anyone behind the stand, low, is not seen)
   if(!lured&&C.filmT>9){lured=true;noise(CM.at('reviewProj'),2.6,'the projector');say([N('Out in the hall, the long footfalls stop. Then come this way.',{time:3})]);}if(C.pt>3000)break;}
  C.flags.filmDone=true;mark('the film');
  yield* lines([{wait:.6},N('When she was carried away from it, the wall moved. When they brought her back, it stopped.',{time:4}),...(C.flags.annie?[N('A.R. Annie Rowan. September 1958.',{time:2.6})]:[])]);
  CM.screenM.map=null;CM.screenM.color?.setHex?.(0x111111);CM.screenM.needsUpdate=true;})());}
 // ---- Act II, scene 5: the service corridor; Danny ----------------------------------------------------------------------------------------------
 const D={st:'off',t:0,x:0,z:0,a:0,v:0,seenHand:false};
 function sceneCorridor(from='corridor'){go('e8-danny');if(from!=='corridor')enterComplex('cIn',Math.PI/2);lightsBelow('C');C.h=Math.max(C.h,HOUR.corridor);C.hMin=HOUR.corridor;date(C.h);checkpoint('c8-corridor');
  task('corridor',(function*(){
   if(from==='corridor'){yield* lines([N('A long low corridor. Pipes. One lamp still burning at this end. Alcoves along one side.',{time:3.4})]);}
   // the first alcove: a green bike, small; a flyer in a plastic sleeve taped to its basket
   offer('danny-bike','Look in the alcove',()=>CM.at('cAlcove1',.7),{r:2.4,look:true,size:.6,cone:.12,fn:()=>task('flyer',(function*(){
    yield* lines([N('A kid’s green bike, rusted to the colour of the floor. Its back tyre is gone. A plastic sleeve taped to the basket.',{time:4})]);
    yield* reading('flyer',[N('MISSING. DANIEL “DANNY” WHITCOMB. Age 12. Last seen 8/21/91, Mill Street, on a green bicycle.',{time:4.2}),N('IS MISSING THE LAST TWO FINGERS OF HIS LEFT HAND (1988 accident).',{time:3.8})]);C.inv.flyer='have';C.flags.flyer=true;})())});
   objective('Find the power.','The end of the corridor.');
   yield* until(()=>near(CM.at('cEnd'),5.5)||C.pt>600);
   offer('panel','Look at the panel',()=>CM.at('cEnd',1.4),{r:2.2,look:true,size:.4,cone:.14,fn:()=>{C.flags.panelSeen=true;}});
   yield* until(()=>C.flags.panelSeen||near(CM.at('cEnd'),2.4)||C.pt>660);unoffer('panel');
   yield* lines([N('A 1959 breaker panel. BULKHEAD — B-J. The handle’s down.',{time:3}),{wait:.6}]);
   // the vent beside it: scratching; then it comes out of it, fast and low, between you and the way back
   sound('c7Drag',CM.at('cVent',-2.6),{gain:.6});yield* wait(1.4);sound('c7Drag',CM.at('cVent',-2.6),{gain:.9});
   dannyStart();checkpoint('c8-danny');T?.jolt?.(1,{rise:1.2,hold:20,why:'it, out of the vent'});
   objective('Get out of its way.','An alcove. Get low (C). Don’t run at it.');
   yield* until(()=>D.st==='passed'||D.st==='name'||C.pt>900);
   // its hand on the alcove's edge, in your light: the last two fingers gone, the stumps healed over
   if(!C.flags.hand)yield* lines([N('Its hand on the edge of the alcove, right by your face. The last two fingers are gone. Old stumps, healed over.',{time:4.2})]);C.flags.hand=true;
   offer('name','Say his name',()=>({x:D.x,y:gy(D.x,D.z)+.8,z:D.z}),{r:7,when:()=>D.st==='passed'||D.st==='sniff',fn:()=>{D.st='name';D.t=0;}});
   yield* until(()=>D.st==='name'||C.pt>960);if(D.st!=='name'){D.st='name';D.t=0;}
   yield* lines([Y('…Danny?',{time:1.2}),{wait:1.4},N('It stops. Its head comes round, slowly, all the way to you.',{time:3}),{wait:.8},N('A sound comes out of it. Almost a word. Almost.',{time:2.8})]);
   C.flags.danny=true;mark('Danny');
   yield* wait(1.2);D.st='lunge';D.t=0;sound('c7Snarl',{x:D.x,y:gy(D.x,D.z)+.9,z:D.z},{gain:1.2});C.shake=.5;T?.jolt?.(1,{rise:1,hold:10,why:'it came at you'});
   yield* wait(1.4);
   // the lights at the far end going out one after another toward you; the walls sweat; it is more afraid of this than anything
   C.flags.presence=true;presenceInCorridor();yield* wait(3.2);D.st='cower';D.t=0;
   yield* lines([N('It goes down flat, shaking. It makes a sound like a kid trying not to cry.',{time:3.4})]);
   yield* wait(2.4);D.st='flee';D.t=0;yield* until(()=>D.st==='gone',10);
   yield* lines([{wait:1},N('The lights come back, one at a time. Whatever it was has gone back the way it came.',{time:3.4}),N('Danny Whitcomb. Twelve. Mill Street. 1991.',{time:3}),Y('He was a kid.',{time:1.6})]);
   objective('Throw the breaker.','The panel at the end.');offer('breaker','Throw the breaker',()=>CM.at('cEnd',1.4),{r:2.2,fn:()=>{C.flags.cPower=true;lightsBelow('C');sound('c6Clank',CM.at('cEnd',1.4),{gain:1});CM.setDoor('bulkhead',1);sound('c8Hydraulic',CM.at('bulkhead',1.5),{gain:.9});}});
   yield* until(()=>C.flags.breaker);
   yield* lines([N('Somewhere back up the corridor, a motor. The bulkhead.',{time:2.6})]);checkpoint('c8-bulkhead');
   objective('Go through the bulkhead.','Back across the gallery.');
   yield* until(()=>{const id=CM.cellIdAt(me().x,me().z);return id==='J'||C.pt>2000;});
   sceneWing('wing');})());}
 const dannyPos=()=>({x:D.x,z:D.z});
 function dannyStart(){danny.reset?.();danny.ground=(x,z)=>CM.nav.inside(x,z)?CM.nav.floorAt(x,z):gy(x,z);danny.show(true);C.dannyOn=true;const v=CM.at('cVent');Object.assign(D,{st:'emerge',t:0,x:v.x-.6,z:v.z,a:-Math.PI/2,v:0});danny.place(D.x,danny.ground(D.x,D.z),D.z,D.a);}
 function presenceInCorridor(){let n=0;for(const i of [1,0])later(.6+n++*.9,()=>{light(i,null);sound('click',camera.position,{gain:.2});});sound('c7Groan',CM.at('cEnd',0),{gain:1});C.shake=.3;}
 // Danny: territorial, fast, erratic; not the hunter: it doesn't search, it guards a place and it bolts
 function updateDanny(dt){if(!C.dannyOn)return;D.t+=dt;const p=me(),dv=danny.drive,dYou=Math.hypot(p.x-D.x,p.z-D.z),inAlcove=['Ca1','Ca2','Ca3'].includes(CM.cellIdAt(p.x,p.z));
  const crouch=(o.foot.crouch??0)>.4,face=(x,z,k2=6)=>{D.a+=wrap(headingTo(D.x,D.z,x,z)-D.a)*(1-Math.exp(-k2*dt));},step=(x,z,v)=>{const l=Math.hypot(x-D.x,z-D.z);if(l<.05)return true;const s=Math.min(l,v*dt);D.x+=(x-D.x)/l*s;D.z+=(z-D.z)/l*s;return l<.3;};
  let sp=0,look={x:camera.position.x,y:camera.position.y,z:camera.position.z};
  if(D.st==='emerge'){sp=2;step(D.x-1.6,D.z,2);if(D.t>.9){D.st='threat';D.t=0;sound('c7Snarl',{x:D.x,y:gy(D.x,D.z)+.9,z:D.z},{gain:1});}}
  else if(D.st==='threat'){// (up on its back legs at the vent, its mouth open, its head jerking: it is guarding this place; you have a moment)
   sp=0;dv.rear=damp(dv.rear||0,.85,5,dt);dv.snap=Math.sin(D.t*7)>.5?1:0;face(p.x,p.z,8);if(D.t>2.8){D.st='advance';D.t=0;dv.rear=0;}}
  else if(D.st==='advance'){// along the corridor toward you, in bursts; it rears when you are close and standing
   const burst=Math.sin(D.t*2.4)>0?3.2:.6;sp=burst;face(p.x,p.z,5);const tgt=inAlcove?{x:p.x+.35,z:CX.z+13.55}:{x:p.x+1.2,z:p.z};/* (at an alcove: to its mouth, its head in after you) */step(tgt.x,clamp(tgt.z,CX.z+12.6,CX.z+13.8),burst);dv.rear=damp(dv.rear||0,dYou<3&&!crouch?.6:0,4,dt);
   if(!inAlcove&&dYou<1.25&&D.t>1.6)fail('c8-danny','it had you');
   if(inAlcove&&dYou<2.4&&crouch){D.st='sniff';D.t=0;}else if(inAlcove&&dYou<2.2&&!crouch&&D.t>3){fail('c8-danny','it found you standing');}}
  else if(D.st==='sniff'){// at the alcove's mouth, its head going side to side, its hand on the edge
   sp=0;dv.crouch=damp(dv.crouch||0,.8,3,dt);look={x:p.x,y:gy(p.x,p.z)+.6,z:p.z};if(D.t>2.4&&!C.flags.handSeen){C.flags.handSeen=true;}if(D.t>5){D.st='passed';D.t=0;}}
  else if(D.st==='passed'){sp=0;dv.crouch=damp(dv.crouch||0,.7,3,dt);look={x:p.x,y:gy(p.x,p.z)+.6,z:p.z};}
  else if(D.st==='name'){sp=0;dv.snap=D.t<.3?1:0;dv.crouch=damp(dv.crouch||0,.4,3,dt);dv.alert=damp(dv.alert||0,1,3,dt);}
  else if(D.st==='lunge'){sp=D.t<.35?6:0;if(D.t<.35)step(p.x+(D.x>p.x?.9:-.9),p.z,6);dv.rear=damp(dv.rear||0,D.t<.5?.8:0,8,dt);dv.claw=D.t<.6?1:0;}
  else if(D.st==='cower'){sp=0;dv.cower=damp(dv.cower||0,1,4,dt);dv.crouch=damp(dv.crouch||0,.9,4,dt);dv.snap=Math.sin(D.t*9)>.6?1:0;look=CM.at('cEnd',0.6);}
  else if(D.st==='flee'){const v=CM.at('cVent');sp=Math.min(8,2+D.t*10);face(v.x,v.z,10);if(step(v.x,v.z,sp)||D.t>4){D.st='gone';danny.show(false);C.dannyOn=false;sound('c7Drag',v,{gain:.8});}dv.cower=damp(dv.cower||0,.2,6,dt);look=null;}
  if(D.st!=='gone'){dv.speed=sp;dv.look=look;danny.place(D.x,danny.ground(D.x,D.z),D.z,D.a);danny.update(dt);}}
 // ---- Act III, scene 6: the flooded wing; Ruth Ann Carver; Sam ----------------------------------------------------------------------------------------
 function sceneWing(from='wing'){go('e8-sam');if(from!=='wing'||C.where!=='below'){enterComplex('jMid',-Math.PI/2);if(from==='wing'){const q=W(3.5,23.4),t=CM.at('jMid');o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,t.x,t.z),mode:'walk',bike:null});}}/* (jumped to, or Continued: you come in at the bulkhead) */lightsBelow('J');C.h=Math.max(C.h,HOUR.wing);C.hMin=HOUR.wing;date(C.h);CM.setDoor('bulkhead',1,{instant:true});
  CM.setDoor('samCell',0,{instant:true});CM.setDoor('D2',1,{instant:true});if(from==='wing')checkpoint('c8-wing');
  task('wing',(function*(){
   if(from==='wing'){yield* lines([N('The other side of the bulkhead: a hall of green-painted steel. ISOLATION — 1959. Two wings. Water standing in the west one.',{time:4})]);}
   if(from==='wing'||from==='ruth'){objective('The west wing.','The water.');
    offer('ruth','Look in cell four',()=>CM.at('d2In',.6),{r:3,look:true,size:.8,cone:.12,fn:()=>task('ruth',(function*(){
     yield* lines([N('Cell four. A cot, a blanket gone grey. A girl’s hair ribbon, blue, tied round the cot’s leg. A ticket stub: LYRIC THEATRE — AUG. 23, 1966.',{time:4.6}),
      N('Under the blanket, on the cot, something small and very still that nobody has moved in a long time. You don’t lift the blanket.',{time:4.2})]);
     yield* reading('ruth',[N('A page from the township’s log, left on the cot. 8/24/66: CH. 4 OCCUPIED. CARVER, R.A. (11).',{time:3.8}),N('6/70: SHE TALKS TO THE WALL. ASKS FOR HER MOTHER.',{time:3.2}),
      N('3/12/79: NO RESPONSE. CONNECTION LOST. B-3 SHIFTED 2 IN. CH. 4 SEALED. NO FAMILY CONTACT.',{time:4.4})]);
     C.flags.ruth=true;yield* lines([{wait:.6},N('Ruth Ann Carver. She rode to the Lyric in 1966. She was in here thirteen years.',{time:3.8})]);})())});
    yield* until(()=>C.flags.ruth||near(CM.at('samDoor'),4)||C.pt>500);}
   checkpoint('c8-sam');
   // Sam's door: him, inside, in the water; it can't be him, unless it's something it couldn't have heard
   objective('Cell six.','The door with the light behind it.');light(4,CM.at('samIn',1.6),{intensity:2.2,dist:5,color:0xc8d4c8,flicker:.1});
   yield* until(()=>near(CM.at('samDoor'),2.6)||C.pt>700);
   yield* lines([N('Through the grille in the door: Sam. Standing in the water, his arms around himself. He looks at you and backs up to the wall.',{time:4.2}),
    SM('Don’t. Don’t come closer.',{time:1.6,face:'terrified'}),SM('It does you. It’s done you four times. It does everybody. It does what we SAY.',{time:3.4,face:'afraid'}),
    SM('Say something it couldn’t have heard. Something nobody ever said.',{time:3,face:'afraid'})]);
   let proven=false,tries=0;
   while(!proven){tries++;const id=yield* choosing([{id:'race',label:'“Race you to the end of the street.”'},{id:'fan',label:'“Your dad keeps turning your fan back on. He doesn’t know why.”'},{id:'rule',label:'“Nobody gets left behind.”'}],{timeout:45,fallback:tries>1?'fan':'race'});
    if(id==='fan'){proven=true;yield* lines([Y('Your dad keeps turning your fan back on. He doesn’t know why.',{time:3}),{wait:1.4},SM('…He can’t sleep without it.',{time:2,face:'sad'}),SM('I can’t. He knows that.',{time:1.8,face:'sad'})]);}
    else if(id==='race')yield* lines([Y('Race you to the end of the street.',{time:1.8}),SM('Jamie said that. On Sunday. It’s HEARD that.',{time:2.4,face:'afraid'})]);
    else yield* lines([Y('Nobody gets left behind.',{time:1.6}),SM('That’s on the poster. That’s in my head. It’s been IN my head.',{time:2.8,face:'afraid'})]);}
   C.flags.samProven=true;
   yield* lines([{wait:.8},SM('I thought you were another one.',{time:2,face:'sad'}),Y('It’s me.',{time:1}),SM('You found me.',{time:1.8,face:'relieved'}),
    SM('The door goes up with the crank. But not with the water on it. There’s a drain. The big wheel. In the end room.',{time:3.6,face:'determined'})]);
   checkpoint('c8-sam-door');
   // the valve, the crank, and it coming back along the wing
   objective('Drain the wing.','The big wheel in the end room. Hold F.');
   offer('valve','Turn the drain wheel',()=>CM.at('dValve',1.3),{r:1.9,hold:6,tick:(dt,v)=>{CM.ST.valveV=3;CM.ST.waterWant=-.4*v;if(Math.random()<dt*2)sound('c6Grind',CM.at('dValve',1.3),{gain:.4});},fn:()=>{CM.ST.waterWant=-.42;C.flags.drained=true;sound('c6Splash',CM.at('dValve',0),{gain:.8});}});
   yield* until(()=>C.flags.drained);
   // the water going out of the wing is loud: down the hall, something heard it, and comes; it walks the wing, up and back
   yield* lines([N('The water goes down the wing with a long, ugly sound, down to the ankles.',{time:3}),{wait:.4},N('Out in the hall, in the water, something heavy. Coming this way.',{time:3}),
    SM('It heard that. Get in a cell— get in four, beside me. When it goes past, the crank.',{time:3,face:'terrified'})]);
   huntStart({ids:['D','D0','D1','D2'],at:CM.at('jWest'),catchTo:'c8-sam-door',range:12,fov:1.1,speedK:.8,extra:[{id:'Dw',x:CX.x-25,z:CX.z+27,pause:2.6},{id:'De',x:CX.x-7.4,z:CX.z+27,pause:2.2}]});H.patrol(['Dw','De']);
   offer('hide-D2','Get into cell four',()=>CM.at('d2In',.4),{r:2,once:false,when:()=>!C.hiding,fn:()=>hide('D2',CM.at('d2In'))});
   offer('hide-D1','Get into cell five',()=>CM.at('d1In',.4),{r:1.8,once:false,when:()=>!C.hiding,fn:()=>hide('D1',CM.at('d1In'))});
   offer('hide-D0','Get down behind the pipes',()=>CM.at('dHide',.5),{r:2,once:false,when:()=>!C.hiding,fn:()=>hide('D0',CM.at('dHide'))});
   let warned=0;
   yield* lines([SM('Now the crank. By my door. When it’s got its back to you.',{time:2.4})]);
   offer('samcrank','Crank the door up',()=>CM.at('samCrank',1),{r:1.8,hold:5,noise:.55,can:()=>C.flags.pawl||((C.hold.samcrank||0)<.32),blocked:()=>{if(!C.flags.jam){C.flags.jam=true;sound('c6Clank',CM.at('samCrank',1),{gain:.8});say([SM('It’s seized. The pawl— the red catch, by your foot. Knock it up.',{time:2.8})]);offer('pawl','Knock the catch up',()=>CM.at('samCrank',.3),{r:1.8,fn:()=>{C.flags.pawl=true;sound('c6Clank',CM.at('samCrank',.3),{gain:1});}});}},
    tick:(dt,v)=>{CM.setDoor('samCell',v*.9,{instant:true});if(Math.random()<dt*2.4)sound('c6Grind',CM.at('samCrank',1),{gain:.4});},fn:()=>{CM.setDoor('samCell',1);C.flags.samOut=true;}});
   while(!C.flags.samOut){yield;warned=samWarn(warned);}
   huntStop();
   // Sam out: as he crosses the line of the door something big shifts, far off; a long impact; the water shivers
   const sq=CM.at('samIn');joinFoot(sam,sq,Math.PI);sam.gone=false;walkTo(sam,CM.at('samDoor'),{speed:1});
   yield* until(()=>!CM.inCell(sam.px,sam.pz,'D3',-.2)||C.pt>1600);
   C.flags.anchor1=true;sound('c8Impact',CM.at('jMid',-4),{gain:.9});C.shake=.45;mark('a barrier moved (Sam)');
   yield* lines([{wait:.4},N('Far off, under everything, something moves. A long, heavy sound, like a building settling. The water shivers.',{time:4}),SM('What was that?',{time:1.2,face:'afraid'}),Y('I don’t know.',{time:1.2}),
    SM('…Okay.',{time:.8}),SM('Jamie. It took Jamie. I heard him. It brought him past my door.',{time:3,face:'worried'})]);
   minds();sceneRetrieval('retrieval');})());}
 function samWarn(w){const d=Math.hypot(HM.x-me().x,HM.z-me().z);if(d<8&&w<3&&!busy()&&C.hunt){w++;say([SM(w===1?'Stop. It’s coming back.':w===2?'Get down. Get DOWN.':'Don’t move.',{time:1.4,face:'terrified'})]);}if(d>13&&w>0)w=0;return w;}
 // ---- Act III, scene 7: the retrieval wing; Jamie ---------------------------------------------------------------------------------------------------
 function sceneRetrieval(from='retrieval'){go('e8-jamie');if(from!=='retrieval'){enterComplex('jMid',Math.PI/2);joinFoot(sam,CM.at('jWest'),Math.PI/2);C.flags.samOut=true;C.flags.anchor1=true;}lightsBelow('J');C.h=Math.max(C.h,HOUR.retrieval);C.hMin=HOUR.retrieval;date(C.h);
  CM.ST.grille=CM.ST.grilleWant=1;CM.setDoor('jamieCell',0,{instant:true});CM.setDoor('den',1,{instant:true});checkpoint('c8-retrieval');
  task('retrieval',(function*(){
   objective('The east wing.','The grille.');
   yield* until(()=>near(CM.at('grille'),6)||C.pt>400);
   // from behind the grille: it, coming back up the wing with Jamie over its shoulder; his door; it puts him in; his door down
   HM.show(true);H.reset();HM.show(true);const den=CM.at('denIn'),jd=CM.at('jamieDoor'),ji=CM.at('jamieIn');H.place(den.x,den.z,-Math.PI/2);C.carryJamie=true;
   jamie.gone=false;comp.putFoot(jamie,den.x,den.z,0,{bike:null});jamie.person.group.visible=true;jamie.follow=null;C.jamieLimp=true;
   H.script([{to:()=>[jd.x,jd.z+1.4],speed:1.1,state:'walk',free:true},{act:()=>{CM.setDoor('jamieCell',1);sound('c8Hydraulic',jd,{gain:.8});}},{wait:1.4,state:'idle'},
    {to:()=>[ji.x,ji.z+.4],speed:.8,state:'walk',free:true},{act:()=>{C.carryJamie=false;C.jamieLimp='cot';}},{wait:1.2,state:'crouch'},{to:()=>[jd.x,jd.z+1.6],speed:.9,state:'walk',free:true},
    {act:()=>{CM.setDoor('jamieCell',0);sound('c7Door',jd,{gain:1});}},{to:()=>[den.x,den.z],speed:1,state:'walk',free:true},{act:()=>{HM.show(false);H.reset();}}]);
   yield* lines([N('Down the wing, it comes out of the far room. Jamie is over its shoulder. He isn’t moving.',{time:3.6}),SM('Jamie—',{time:.8,face:'terrified'}),{wait:2.4},
    N('It opens a door with one hand, the way you’d open your own front door. It goes in with him.',{time:3.6}),{wait:3},N('It comes out without him. The door comes down.',{time:2.6})]);
   yield* until(()=>H.mode!=='script'||C.pt>500,30);
   yield* lines([SM('He got out. He must’ve got out of it, and it— it brings you back. It brings you BACK.',{time:3.6,face:'afraid'}),N('Along the floor, the drag marks. Dozens of them, from the far room to these doors. Years of them.',{time:3.6})]);
   checkpoint('c8-jamie-door');
   // the grille: a counterweight; Sam holds it (if he lets go it drops); you go through to Jamie's door
   yield* lines([SM('It’s on a counterweight. Like the gate. If I hold this, it stays up. If I let go, it drops.',{time:3.4,face:'determined'}),SM('I’ll hold it. Go.',{time:1.4})]);
   stand(sam,CM.at('grilleLever'),{look:()=>CM.at('grilleLever',1.2),max:1});yield* until(()=>Math.hypot(sam.px-CM.at('grilleLever').x,sam.pz-CM.at('grilleLever').z)<.6,12);
   CM.ST.grilleWant=0;sound('c6Grind',CM.at('grille',1.4),{gain:.8});noise(CM.at('grille'),.6,'grille');
   // (it is in its room at the end, moving about in there: it comes out to a noise, and goes back)
   huntStart({ids:['E','E1','E2','E3','E4'],at:CM.at('denIn'),catchTo:'c8-jamie-door',range:12,fov:1.1,speedK:.85,extra:[{id:'den1',x:CX.x+39.2,z:CX.z+24.6,pause:3.4},{id:'den2',x:CX.x+39.4,z:CX.z+30.2,pause:2.6},{id:'den3',x:CX.x+36.4,z:CX.z+29.8,pause:1.6}]});H.patrol(['den1','den2','den3','den2']);
   offer('hide-E3','Get into cell nine',()=>CM.at('e3In',.4),{r:1.8,once:false,when:()=>!C.hiding,fn:()=>hide('E3',CM.at('e3In'))});
   offer('hide-E1','Get into cell seven',()=>CM.at('e1In',.4),{r:1.8,once:false,when:()=>!C.hiding,fn:()=>hide('E1',CM.at('e1In'))});
   objective('Jamie’s door.','The lever beside it. Hold F. It will hear the door.');
   offer('jlever','Hold the lever',()=>CM.at('jamieLever',1),{r:1.7,hold:6,noise:.8,tick:(dt,v)=>{CM.ST.leverJ=1;CM.setDoor('jamieCell',v*.85,{instant:true});if(Math.random()<dt*2)sound('c8Hydraulic',CM.at('jamieDoor',1),{gain:.4});},
    release:()=>{CM.ST.leverJ=0;},fn:()=>{CM.setDoor('jamieCell',1);C.flags.jamieDoor=true;}});
   // (it comes out to the noise: hide, wait for it to go back, go on; Sam holds the grille the whole time and tells you when)
   let warned=0;while(!C.flags.jamieDoor){yield;warned=samWarn(warned);}
   C.jamieLimp=null;joinFoot(jamie,CM.at('jamieIn'),0);jamie.gone=false;walkTo(jamie,CM.at('jamieDoor'),{speed:1.6});
   yield* lines([J('…Is it you? Is it really you?',{time:1.8,face:'afraid'}),Y('It’s me.',{time:1})]);
   yield* until(()=>!CM.inCell(jamie.px,jamie.pz,'E2',-.2)||C.pt>2400);C.flags.anchor2=true;
   // it comes: run for the grille; Sam lets go behind you; it hits the bars
   H.script([{to:()=>[CM.at('eMid').x,CM.at('eMid').z],speed:4,state:'run',free:false},{to:()=>[CM.at('grille').x+.7,CM.at('grille').z],speed:4,state:'run'}]);sound('c7Snarl',{x:HM.x,y:1,z:HM.z},{gain:1.2});
   say([SM('RUN! It’s COMING!',{time:1.2,face:'terrified'})]);objective('Run.','Under the grille.');jamie.footBoost=1.6;walkTo(jamie,CM.at('jEast'),{speed:3.4});
   yield* until(()=>me().x<CX.x+21.4||C.pt>2600);
   CM.ST.grilleWant=1;sound('c6Clank',CM.at('grille',1.4),{gain:1.3});C.shake=.5;stand(sam,null);
   yield* wait(1.2);sound('c7Door',CM.at('grille',1.2),{gain:1.4});C.shake=.6;H.script([{wait:2,state:'alert'},{to:()=>[CM.at('denIn').x,CM.at('denIn').z],speed:1.2,state:'walk'},{act:()=>huntStop()}]);
   yield* lines([{wait:.6},N('It hits the grille and the grille holds. It looks at the three of you through it. Then it goes back.',{time:3.6})]);
   sound('c8Impact',CM.at('jMid',-5),{gain:1});C.shake=.55;mark('a barrier moved (Jamie)');
   yield* lines([J('I thought you weren’t coming.',{time:1.8,face:'sad'}),Y('I’m here.',{time:1}),J('You actually came back.',{time:1.8,face:'relieved'}),{wait:.6},J('You look awful.',{time:1.4,face:'amused',act:()=>{jamie.lookAt=sam.person.group.position;}}),SM('You look worse.',{time:1.4,face:'relieved'}),
    {wait:2.2},N('For a second all three of you are laughing, too hard, the kind that hurts.',{time:3.4}),{wait:1.6},
    N('Then a bell, somewhere, once. A long way off, a sound like a dam letting go. Dust comes down out of the ceiling.',{time:4}),J('That’s not good.',{time:1.2,face:'worried'}),SM('Alex. We have to get Alex.',{time:1.8,face:'determined'})]);
   jamie.footBoost=1;minds();sceneAlex('shift');})());}
 // ---- Act III, scene 8: the corridor that moves; the room it made; Alex ----------------------------------------------------------------------------------
 function sceneAlex(from='shift'){go('e8-alex');
  // (Continue from the made room starts in its doorway; from his door, in what is left of the room, facing it)
  if(from!=='shift'||!X.friendsNow().includes(jamie)){const at=from==='made'?'f1In':from==='alex'?'f1Mid':'hMid',to=from==='made'?'f1Mid':from==='alex'?'alexDoor':null,q=CM.at(at),a=to?headingTo(q.x,q.z,CM.at(to).x,CM.at(to).z):Math.PI/2;
   enterComplex(at,a);if(to){joinFoot(sam,{x:q.x-.9,z:q.z-.6},a);joinFoot(jamie,{x:q.x+.8,z:q.z-.7},a);}else{joinFoot(sam,CM.at('hWest'),Math.PI/2);joinFoot(jamie,CM.at('hMid'),Math.PI/2);}
   if(from==='alex'){CM.made.visible=false;C.flags.madeBreak=true;}C.flags.samOut=C.flags.anchor1=C.flags.anchor2=true;}
  lightsBelow('F');C.h=Math.max(C.h,HOUR.alex);C.hMin=HOUR.alex;date(C.h);CM.setDoor('alexCell',0,{instant:true});CM.setDoor('F0',1,{instant:true});checkpoint(from==='alex'?'c8-alex':'c8-shift');
  task('alex',(function*(){
   if(from==='shift'){objective('Find Alex.','South, past the big gallery. The corridor on the east side.');mark('find Alex');
    yield* until(()=>CM.cellIdAt(me().x,me().z)==='F0'||C.pt>700);mark('the corridor');
    yield* lines([SM('He’s down here. The farthest one. I could hear it go down here with him, every time.',{time:3})]);
    // the corridor: it gets longer while you are not looking; the way back is a wall when you turn round; the lamps are not where they were
    const backWall=new THREE.Mesh(new THREE.BoxGeometry(.25,2.8,3.6),CM.mats.conc);backWall.position.set(CX.x+18.15,-1.6,CX.z+46);backWall.visible=false;scene.add(backWall);C.backWall=backWall;
    yield* until(()=>{const p=me();return p.z>CX.z+52;},120);
    yield* until(()=>!lookingAt(CM.at('f0Door',1),.4)||C.pt>800,20);backWall.visible=true;mark('behind you, a wall');CM.extraSolids.push({x:18,z:46,hw:.3,hd:1.8,id:'back'});CM.setDoor('F0',0,{instant:true});
    yield* until(()=>lookingAt({x:CX.x+19,y:-1.5,z:CX.z+46},.75)||C.pt>820,25);
    yield* lines([J('The door. Where’s the door?',{time:1.4,face:'terrified'}),SM('Don’t. Keep going. It’s doing it on purpose.',{time:2,face:'afraid'})]);
    yield* until(()=>CM.cellIdAt(me().x,me().z)==='F1'||C.pt>900);checkpoint('c8-made');mark('the room it made');}
   // the room it made: Alex's bedroom, here; too clean; then it stops being able to hold itself together
   if(from==='shift'||from==='made'){
    yield* lines([N('A bedroom. Alex’s bedroom. His quilt, his desk, his poster. The window shows the creek behind his house at night.',{time:4}),J('That’s— that’s his room.',{time:1.6,face:'shocked'}),SM('It isn’t. Look at it. Nothing’s been touched. It made it.',{time:2.6,face:'afraid'})]);
    yield* wait(1.4);C.madeT=0;C.flags.madeBreak=true;mark('it comes apart');sound('c7Groan',CM.at('f1Mid',0),{gain:.9});
    yield* lines([N('The poster’s ink runs down off it. The quilt goes grey and stiff and then it’s concrete. The window has nothing behind it but the wall.',{time:4.6}),
     SM('That’s what the court was. That’s what that whole street was.',{time:2.6,face:'afraid'}),J('Mrs. Lange.',{time:1.4,face:'afraid'})]);
    yield* until(()=>C.madeT>7,12);}
   checkpoint('c8-alex');
   // his door: him inside; he's had them come to the door before; proving it, by what they do right now
   objective('Alex’s door.','');mark('his door');yield* until(()=>near(CM.at('alexDoor'),3)||C.pt>1100);mark('at his door');
   if(C.backWall){C.backWall.visible=false;CM.extraSolids.splice(0);CM.setDoor('F0',1,{instant:true});}
   light(4,CM.at('alexIn',1.4),{intensity:1.6,dist:5,color:0xc0b0a8,flicker:.3});
   yield* lines([N('Through the door’s little window: Alex. Sitting on the cot, his knees up, his shirt gone, in somebody’s grey coverall too big for him. He looks up.',{time:4.4}),
    {who:'ALEX',text:q8('It keeps bringing you here.'),time:2.2},J('Alex. It’s really us.',{time:1.6,face:'hopeful'}),{who:'ALEX',text:q8('That’s what you said last time.'),time:2},
    {who:'ALEX',text:q8('Okay. All of you. At the same time. Jamie, three fingers. Sam, close your eyes. You—'),time:3.6},{who:'ALEX',text:q8('your light. Off and on. Twice.'),time:2}]);
   C.flicks=0;C.flickWant=true;C.lastOn=undefined;objective('Your flashlight: off and on, twice.','T.');mark('flash: wanted');
   {const t0=C.pt;let told=false;yield* until(()=>{if(!told&&C.pt-t0>25&&!busy()){told=true;say([SM('Your light. T. Off, on. Off, on.',{time:2.2})]);}return C.flicks>=4||C.pt-t0>150;});}
   C.flickWant=false;mark('flash: '+C.flicks);
   yield* lines([{wait:1},{who:'ALEX',text:q8('…It always does it after. A second after. Like it’s watching first.'),time:3},{who:'ALEX',text:q8('You did it at the same time.'),time:2},
    Y('We’re taking you home.',{time:1.6}),{wait:.8},{who:'ALEX',text:q8('There’s two handles. Outside. Somebody has to hold both.'),time:2.6}]);
   checkpoint('c8-alex-free');
   // two levers: you and Sam, both held; Jamie keeps the light on the door
   objective('Hold your lever with Sam.','The left handle. Hold F.');stand(sam,CM.at('alexLeverB'),{look:()=>CM.at('alexLeverB',1.2),max:1});stand(jamie,{x:CM.at('alexDoor').x+.4,z:CM.at('alexDoor').z-1.6},{look:()=>CM.at('alexDoor',1.1)});
   offer('alever','Hold the handle',()=>CM.at('alexLeverA',1),{r:1.6,hold:5,can:()=>Math.hypot(sam.px-CM.at('alexLeverB').x,sam.pz-CM.at('alexLeverB').z)<.8,
    tick:(dt,v)=>{CM.ST.leverA=[1,1];CM.setDoor('alexCell',v*.9,{instant:true});if(Math.random()<dt*2)sound('c8Hydraulic',CM.at('alexDoor',1),{gain:.4});},release:()=>{CM.ST.leverA=[0,0];},fn:()=>{CM.setDoor('alexCell',1);C.flags.alexDoor=true;}});
   yield* until(()=>C.flags.alexDoor);stand(sam,null);stand(jamie,null);
   const A2=X.enlistAlex();joinFoot(A2,CM.at('alexIn'),Math.PI);walkTo(A2,CM.at('alexDoor'),{speed:.9});
   yield* until(()=>!CM.inCell(A2.px,A2.pz,'F2',-.25)||C.pt>1500);C.flags.anchor3=true;
   // all three out: the last of it goes; the room it made comes down; the far wall cracks; the lights go
   sound('c8Collapse',CM.at('f2Window',0),{gain:1.4});C.shake=1;T?.jolt?.(1,{rise:1,hold:14,why:'the last one'});mark('a barrier moved (Alex): the last');
   for(const [x,z,w] of [[21,69,0],[24,66,.8],[19,60,1.4]])hazard({at:{x:CX.x+x,y:-3,z:CX.z+z},r:1.4,warn:1.6+w,section:'c8-alex-free',fatal:false});
   yield* lines([{wait:.4},N('Everything moves at once. The walls of the room it made fold in. A crack runs up the wall of his cell into the ceiling.',{time:4}),AL('Run. RUN. It knows.',{time:1.6}),SM('This way! The crew room!',{time:1.8})]);
   objective('Get out of here.','Back to the corridor. The crew room off the south hall.');
   yield* until(()=>{const id=CM.cellIdAt(me().x,me().z);return id==='G'||C.pt>2000;});
   sceneReunion('reunion');})());}
 const q8=t=>'“'+t+'”';
 // ---- Act III, scene 9: the crew room; all four of them -----------------------------------------------------------------------------------------------------
 function sceneReunion(from='reunion'){go('e8-reunion');const A2=X.enlistAlex();
  if(from!=='reunion'||!A2.active){enterComplex('gIn',-Math.PI/2);const g=CM.at('gTable');joinFoot(sam,{x:g.x-1.1,z:g.z+.9},0);joinFoot(jamie,{x:g.x+1.3,z:g.z-.7},-Math.PI/2);joinFoot(A2,{x:g.x+.2,z:g.z+1.3},-Math.PI/2);C.flags.samOut=C.flags.anchor1=C.flags.anchor2=C.flags.anchor3=true;}
  lightsBelow('K');C.h=Math.max(C.h,HOUR.reunion);C.hMin=HOUR.reunion;date(C.h);checkpoint('c8-reunion');C.mood='relaxed';C.mindKey=null;
  for(const c of [sam,jamie,A2])c.brain&&brain.enable(c,true);
  task('reunion',(function*(){
   yield* lines([{wait:.6},N('The crew room. 1974 paint, lockers, a table, a coffee urn, a calendar from 1991 nobody turned. It’s quiet in here. It holds.',{time:4}),
    stand3(),{wait:1.2},AL('I thought I wasn’t going to see you guys again.',{time:2.2,face:'sad'}),J('We’re all here.',{time:1.4,face:'hopeful'}),SM('Let’s get out.',{time:1.2}),AL('Can we just go home?',{time:1.6,face:'tired'})]);
   objective('','');
   // what you can do here, before anyone says go: talk to them; show Alex the notebook and his camera; give Sam his gum
   offer('t-jamie','Talk to Jamie',()=>({x:jamie.px,y:1.1+gy(jamie.px,jamie.pz),z:jamie.pz}),{r:2.6,look:true,size:.45,cone:.1,fn:()=>say([J('So do I get a parade? I feel like I should get a parade. Or a sandwich.',{time:3,face:'amused'}),Y('A sandwich.',{time:1}),J('A big one.',{time:1.2,face:'grin'}),{wait:.6},J('…I was so scared, man.',{time:1.8,face:'sad'})])});
   // (each of them is one conversation, a beat at a time: F again for the next thing; the prompt says what it is)
   const SAMB=[{label:'Talk to Sam',fn:()=>say([SM('Lockers. First-aid kit. A lantern that works. There’s a radio, 1974. It’s dead.',{time:3.2}),SM('Batteries for the batteries.',{time:1.6,face:'relieved'}),{wait:.4},SM('That was a joke.',{time:1.2})])},
    {label:'Give Sam the gum',when:()=>C.inv.gum==='have',fn:()=>{C.inv.gum='sam';say([SM('My gum.',{time:1,face:'surprised'}),J('I told you I’d give it back.',{time:1.6,face:'grin'}),SM('…Did he ask twice?',{time:1.4,face:'amused'}),Y('He didn’t ask once.',{time:1.4})]);}}];
   const ALEXB=[{label:'Talk to Alex',fn:()=>say([AL('Sunday. I heard the bell. Like every night. On Briarwood I stopped at the creek, and the old bike was down there. In the water.',{time:4.6,face:'tired'}),
     AL('I just wanted to look at it.',{time:1.6}),{wait:1},AL('I got out once. There’s a pipe off the end room. It goes forever. I came up in a box in the woods. The camp.',{time:4,face:'sad'}),
     AL('I took soup. I left my shirt. I cut our letters in the wall so somebody would know. Then the lights found me. And it brought me back.',{time:4.8,face:'sad'})])},
    {label:'Show Alex the notebook',when:()=>C.inv.notebook==='have',fn:()=>say([N('Sam’s notebook. The page with the three names on it, in your writing.',{time:3}),AL('You wrote us down.',{time:1.6,face:'sad'}),Y('Everybody was forgetting. Me too. So I wrote it down.',{time:2.6}),AL('…Keep it. Don’t lose it.',{time:1.6})])},
    {label:'Give Alex his camera',when:()=>C.inv.camera==='have',fn:()=>{C.inv.camera='alex';say([AL('My camera.',{time:1.2,face:'hopeful'}),N('He goes back through the pictures. Stops at the last one: the three of you at the fire, from the trees.',{time:3.6}),AL('I didn’t take that.',{time:1.4,face:'afraid'}),SM('Nobody did.',{time:1.2})]);}}];
   const convo=(id,who2,beats)=>{let i=0;const next=()=>{while(i<beats.length&&beats[i].when&&!beats[i].when())i++;return beats[i];};
    offer(id,next()?.label||'',()=>({x:who2().px,y:1.1+gy(who2().px,who2().pz),z:who2().pz}),{r:2.6,look:true,size:.45,cone:.1,once:false,when:()=>!busy()&&!!next(),fn:()=>{const b=next();if(!b)return;i++;C.flags[id+'-'+i]=true;b.fn();const n2=next();if(n2)C.offers.get(id).label=n2.label;else unoffer(id);}});};
   convo('t-sam',()=>sam,SAMB);convo('t-alex',()=>X.alex,ALEXB);
   // (the moment lasts: until every conversation has been had, or a minute and a quarter after Alex has told them what happened)
   const t0=C.t;let alexAt=null;yield* until(()=>{if(C.flags['t-alex-1']&&alexAt===null)alexAt=C.t;const all=!C.offers.has('t-sam')&&!C.offers.has('t-alex')&&!!C.flags['t-jamie'];
    return (!busy()&&(all||(alexAt!==null&&C.t-alexAt>75)))||C.t-t0>240;});
   for(const id of ['t-jamie','t-sam','t-alex'])unoffer(id);
   yield* quiet();yield* wait(2);
   // the alarm: an old klaxon; red lamps; and Jamie's radio, the one Reyes gave him, from the floor of the east wing
   C.flags.alarm=true;lightsBelow('K');sound('c8Alarm',CM.at('hMid',2),{gain:.9});C.alarmOn=true;
   yield* lines([N('A klaxon, 1959, somewhere close. Red lamps come on along the hall.',{time:3}),{wait:1},{who:'RADIO',text:q8('…anybody… this is Reyes. Copy?'),time:2.4},J('That’s— that’s the radio. I had it. He gave it to me.',{time:2.2,face:'surprised'})]);
   C.inv.radio='have';yield* lines([Y('It’s me. We’ve got them. All three of them.',{time:2.2}),{wait:1.2},RR('…Say again?',{time:1}),Y('All three.',{time:1}),{wait:1.6},RR('Stay— no. The big gallery. The long room with the windows. Come to me.',{time:3.2})]);
   C.mood=null;C.mindKey=null;X.sceneTruth?.('truth');})());}
 function stand3(){return {act:()=>{const g=CM.at('gTable');stand(jamie,{x:g.x+1.2,z:g.z-.6},{look:()=>({x:g.x,y:-2,z:g.z})});stand(sam,{x:g.x-1.1,z:g.z+.9},{look:()=>({x:g.x,y:-2,z:g.z})});const A2=X.alex;if(A2)stand(A2,{x:g.x+.2,z:g.z+1.3},{look:()=>camera.position});},wait:.2};}
 // ---- every frame: what the scenes keep going -----------------------------------------------------------------------------------------------------------------------
 function update(dt){const ph=S.phase;
  if(C.lampShake>0){C.lampShake-=dt;const l=X.LIGHTS[0];if(l&&ph==='d8-bikes')l.intensity=34*(.7+.3*Math.sin(C.t*40));}
  if(ph==='d8-bikes'&&coverG.parent){const lid=coverG.userData.lid;if(C.coverJump>0){C.coverJump-=dt*1.5;lid.position.y=.03+Math.max(0,Math.sin((1-C.coverJump)*Math.PI))*.12;}mist.material.opacity=(C.flags.breath?.22:.12)*(.6+.4*Math.sin(C.t*1.3));mist.position.set(.15,.6+.1*Math.sin(C.t),0);}
  if(X.X.ST.active){const id=CM.cellIdAt(me().x,me().z),ar=areaOf(id);if(ar&&ar!==C.area&&!C.areaLock)lightsBelow(ar);C.zone=id;}
  // the made room coming apart (its pieces sink, stretch and grey; the poster runs; the window goes to wall)
  if(C.flags.madeBreak&&C.madeT!=null){C.madeT+=dt;const k2=smooth(C.madeT/7),M=CM.made;for(const [i,ch] of M.children.entries()){ch.position.y=-k2*(.4+((i*.37)%1)*.9);ch.rotation.z=k2*((i%3)-1)*.3;ch.scale.y=1-k2*.7;}if(C.madeT<4.2&&Math.random()<dt*6)light(5,W(17.7,70.4,-1.55),{intensity:4*(1-k2)*Math.random(),dist:7,color:0xffc890});if(k2>=1&&M.visible){M.visible=false;light(5,null);}}
  // Jamie limp over its shoulder (carried), and lying on his cot
  if(C.carryJamie&&HM.root.visible){HM.root.updateMatrixWorld(true);const sh=HM.sockets.chest.getWorldPosition(new THREE.Vector3());jamie.px=sh.x;jamie.pz=sh.z;jamie.py=sh.y-1.05;jamie.holdPlace=true;}
  // the flashlight test at Alex's door: count your switches
  if(C.flickWant){const on=!!o.foot.on;if(C.lastOn!==undefined&&on!==C.lastOn)C.flicks=(C.flicks||0)+1;C.lastOn=on;}
  if(C.alarmOn&&Math.random()<dt*.25)sound('c8Alarm',CM.at('hMid',2),{gain:.5});
  FALL.update?.(dt);}
 function afterActors(dt){// Jamie carried / lying down: posed after the companions' own pass
  if(C.carryJamie||C.jamieLimp){const c=jamie;if(c.person.group.visible){const g=c.person.group;if(C.carryJamie){g.position.set(c.px,(c.py??-2)+.1,c.pz);g.rotation.set(0,-HM.heading,Math.PI/2*.95);}else if(C.jamieLimp==='cot'){const q=CM.at('jamieIn');g.position.set(q.x,q.y+.55,q.z+.2);g.rotation.set(-Math.PI/2,0,0);}}}
  FALL.afterActors?.(dt);}
 function key(code,repeat){if(mapKey(code))return true;if(FALL.key?.(code,repeat))return true;return false;}
 function pan(dx,dy){return mapPan(dx,dy)||!!FALL.pan?.(dx,dy);}
 function wheel(dy){return mapWheel(dy)||!!FALL.wheel?.(dy);}
 function hint(){if(C.view==='maps')return [['Mouse','Move the pencil'],['A / D','Old plan '+Math.round(MAP.overlay*100)+'%'],['F','Mark'],...(MAP.solved?[['S','Put it down']]:[])];
  if(C.flickWant)return [['T','Flashlight: off and on, twice']];return FALL.hint?.()??null;}
 function sources(out){const ph=S.phase;if(X.X.ST.active){out.push({id:'c8-drip',kind:'culvert',pos:CM.at('galleryMid',2),level:.5});if(C.zone&&/^D/.test(C.zone))out.push({id:'c8-wing-water',kind:'water',pos:CM.at('dMid',0),level:.6});}
  if(ph==='d8-bikes')out.push({id:'c8-cover-air',kind:'culvert',pos:new THREE.Vector3(COVER.x,COVER.y,COVER.z),level:.7});FALL.sources?.(out);}
 function blockers(out){if(C.dannyOn&&danny.group.visible)out.push({x:D.x,z:D.z,r:.7,speed:0});if(HM.root.visible)out.push({x:HM.x,z:HM.z,r:.5,speed:0});FALL.blockers?.(out);}
 function reset(){stageBikes(false);coverG.removeFromParent();fieldG.removeFromParent();Object.assign(D,{st:'off',t:0});C.dannyOn=false;if(C.backWall){C.backWall.removeFromParent();C.backWall=null;}
  MAP.overlay=.5;MAP.mark=null;MAP.solved=false;MAP.tries=0;CM.screenM.map=null;CM.screenM.needsUpdate=true;if(X.X.made){X.X.made.visible=true;}FALL.reset?.();}
 // ---- begin, jumps -----------------------------------------------------------------------------------------------------------------------------------------------------------
 function begin(){X.fresh();go('c8-black');C.cardT=0;o.fade(1);minds();objective('');T?.reset?.();C.h=HOUR.start;C.inv.flashlight='have';
  task('open',(function*(){yield* wait(6.4);C.fadeIn=0;sceneBikes('start');})());}
 const SCENE={'chapter8-start':()=>begin(),'c8-bikes':()=>sceneBikes('bikes'),'c8-cover':()=>{C.flags.out=true;sceneBikes('cover');},'c8-reyes':()=>{C.flags.out=true;C.looked.add('bike-alex');C.looked.add('bike-jamie');C.looked.add('bike-sam');C.flags.sheet=true;C.inv.sheet='have';C.flags.coverSeen=true;sceneBikes('cover');},
  'c8-field':()=>sceneField('field'),'c8-probe':()=>{C.flags.mapDone=true;sceneField('probe');},'c8-lift':()=>{C.flags.mapDone=true;C.flags.found=true;sceneField('lift');},
  'c8-shaft':()=>sceneShaft('shaft'),'c8-barrier':()=>sceneShaft('barrier'),'c8-gallery':()=>sceneGallery('gallery'),'c8-stealth':()=>{C.flags.split=true;sceneGallery('stealth');},
  'c8-office':()=>{C.flags.split=true;sceneGallery('stealth');const q=CM.at('officeIn');o.placePlayer({x:q.x,z:q.z,a:-Math.PI/2,mode:'walk',bike:null});},'c8-film':()=>{C.flags.split=true;C.flags.receipt=true;C.inv.receipt='have';C.flags.annie=true;sceneGallery('stealth');const q=CM.at('reviewIn');o.placePlayer({x:q.x,z:q.z,a:-Math.PI/2,mode:'walk',bike:null});},
  'c8-corridor':()=>{Object.assign(C.flags,{split:true,receipt:true,annie:true,film:true,filmDone:true});sceneCorridor('cor');},'c8-danny':()=>{Object.assign(C.flags,{split:true,receipt:true,annie:true,filmDone:true,flyer:true});C.inv.flyer='have';sceneCorridor('cor');const q=CM.at('cMid');o.placePlayer({x:q.x+6,z:q.z,a:Math.PI/2,mode:'walk',bike:null});},
  'c8-bulkhead':()=>{Object.assign(C.flags,{split:true,receipt:true,annie:true,filmDone:true,flyer:true,danny:true,cPower:true,breaker:true});sceneWing('wing');},
  'c8-wing':()=>{Object.assign(C.flags,{split:true,danny:true,cPower:true});sceneWing('wing');},'c8-ruth':()=>{Object.assign(C.flags,{split:true,danny:true,cPower:true});sceneWing('ruth');const q=CM.at('dMid');o.placePlayer({x:q.x+1,z:q.z,a:-Math.PI/2,mode:'walk',bike:null});},
  'c8-sam':()=>{Object.assign(C.flags,{split:true,danny:true,cPower:true,ruth:true});sceneWing('sam');const q=CM.at('samDoor');o.placePlayer({x:q.x+.6,z:q.z-1.6,a:Math.PI,mode:'walk',bike:null});},
  'c8-sam-door':()=>{Object.assign(C.flags,{split:true,danny:true,cPower:true,ruth:true});sceneWing('sam');const q=CM.at('samDoor');o.placePlayer({x:q.x+.6,z:q.z-1.6,a:Math.PI,mode:'walk',bike:null});},
  'c8-retrieval':()=>sceneRetrieval('r'),'c8-jamie':()=>sceneRetrieval('r'),'c8-jamie-door':()=>sceneRetrieval('r'),'c8-shift':()=>sceneAlex('shift'),'c8-made':()=>sceneAlex('made'),'c8-alex':()=>sceneAlex('alex'),'c8-alex-free':()=>sceneAlex('alex'),
  'c8-reunion':()=>sceneReunion('r'),'c8-alarm':()=>sceneReunion('r')};
 // (a copy of the context with this file's places added; Alex is a live getter, as he comes and goes: a spread would freeze it)
 const FX={...X,CM,sceneBikes,enterComplex,lightsBelow,hideReyesBelow,stageBikes,BIKES,bikeAt,MH,fieldG,nightStreet,q8,hide,stand3,D,updateDanny};
 Object.defineProperty(FX,'alex',{get:()=>X.alex,set:v=>{X.alex=v;},enumerable:true,configurable:true});
 const FALL=fallActs(FX);
 X.sceneTruth=FALL.sceneTruth;
 function jump(section){const f=SCENE[section]||FALL.SCENE?.[section];if(!f){begin();return;}C.where='';f();if(section!=='chapter8-start'){C.fadeIn=-1;o.fade(0);}}
 return {begin,jump,update,afterActors,key,pan,wheel,hint,sources,blockers,reset,updateDanny,MH,OAK:FALL.OAK,JD:FALL.JD,officerAim:()=>FALL.officerAim?.()??null,
  canDismount:()=>!!FALL.canDismount?.(),canRemount:()=>!!FALL.canRemount?.(),SCENE:{...SCENE,...(FALL.SCENE||{})},MAP,D,film};
}
