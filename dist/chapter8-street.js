// Chapter Eight, Act V (first half), rebuilt: Oak Hollow falls, and Jamie.
//
// Up out of MH-12 by the oak, a little before five on Saturday morning, into a sky that is wrong: a low red deck churning over
// the whole town, lit from underneath by fires and from the north-east by the glow over the open ground where the court was;
// and in that glow the thing itself, out, its body a hill of folds behind the trees, its limbs going up into the cloud and
// coming down over the roofs. Down Oak Hollow Drive with Reyes and the three of them, toward his car and the trucks at
// Summerfield, through the street coming apart (chapter8-town.js): the first blows (windows, lamps, the crack); a pale smiling
// thing in a yard calling in a woman's voice (down behind a car until it has gone by); the road going into the storm line in
// front of you and a hunter climbing out of it on the far side (along the east lawns, low, while it searches the west);
// Mrs. Pruitt under her porch awning (Jamie and you lift it: his win); a limb coming over the roofs and down on the house
// across from the Hendersons'. Then the Hendersons': Lily in the front room (Jamie talks her out), Mr. Henderson pinned in the
// garage (you jack the door, Jamie goes in), the yard opening between the street and the house with Jamie and Mr. Henderson on
// the far side, the garage roof coming down over the only way out and Jamie holding it up while the old man crawls under,
// and the hunter, out of the ground, reaching him first. Reyes empties his gun. Then: the three of you, and Jamie on the grass.
//
// The other things in the street are made, as the room was made for Alex: copies of what it did to Danny Whitcomb (pale,
// smiling, too long in the arm), put together out of what it has taken. Danny is the real one, and he is not here. They are
// few and placed, not many and simulated: each has a short route, a sight check, a rush; the far ones only turn their heads.
import * as THREE from './three.module.js';
import {headingTo,wrap,createActor} from './people.js';
import {createHunterModel} from './chapter7-creature.js';
import {createPresence} from './chapter8-presence.js';
import {createTown} from './chapter8-town.js';
import {cutWorld} from './chapter8-ruin.js';
import {ACT,feel} from './chapter8-acting.js';
import {CAST} from './cast.js';
import {groundPoint,heading} from './route.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {newPose,copyPose,applyPose,P as PP} from './rig.js';

export function streetActs(X){
 const {o,k,C,S,presence,H,HM,reyes,police,jamie,sam,comp,sound,gy,light,lightsOn,checkpoint,later,mark,say,J,SM,AL,R,RR,Y,N,V,task,wait,until,lines,quiet,offer,unoffer,V3,near,
  closeLook,endLook,choosing,fail,hazard,huntStop,me,go,objective,busy,main,nav,camera,scene,world,stand,walkTo,joinFoot,leave,minds,date,HOUR,CM,ruin,nightStreet,cry,weep,applyGrief,pose,unpose}=X;
 const town=createTown({scene,world,nav,ruin,ambient:o.ambient,sfx:(n,p,op)=>sound(n,p,op)});
 const SP=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)+dy};};
 const locate=(x,z)=>ruin.locate(x,z);
 const dNow=()=>locate(me().x,me().z)?.d??0;
 const crouched=()=>(o.foot.crouch??0)>.45;
 const hold=(c,q,g,look)=>stand(c,q,{gesture:g,look:look||null,max:1.2});
 // ---- the thing, on the skyline: its own body (a second instance of the presence, huge, never fogged out) ----------------------------
 const SKY=createPresence({scene,sfx:(n,p,op)=>sound(n,p,op),floorAt:(x,z)=>town.floorAt(x,z),sky:true});
 SKY.group.name='chapter8-presence-skyline';SKY.group.traverse(o2=>{if(o2.material){const ms=Array.isArray(o2.material)?o2.material:[o2.material];for(const m of ms)m.fog=false;}});
 const BODY=SP(1262,46,-6),RISE=[[1222,18,58],[1236,70,64],[1205,-34,52],[1270,-8,66],[1190,92,48]];
 function skyline(on){SKY.reset();SKY.show(on);if(!on)return;SKY.showMass(true,{at:{x:BODY.x,y:BODY.y+8,z:BODY.z},r:46,squash:[1.7,1.05,1.25],fog:.0});SKY.lean(.2);
  // its limbs: up out of the ground round the body, into the deck, and over: the probe points drift over the roofs
  RISE.forEach(([d,lat,len],i)=>{const r=SP(d,lat,-4),toward=SP(1080-i*40,(i%2?1:-1)*20,0);const dir=[toward.x-r.x,len*1.4,toward.z-r.z];
   SKY.set(i,{root:[r.x,r.y,r.z],dir,len,r0:6+i%3*1.6,r1:1.1,state:'emerge',probe:[lerp(r.x,toward.x,.55),r.y+len*.8,lerp(r.z,toward.z,.55)],speed:.35});SKY.limbs[i].probeR=9+i*2;});}
 // ---- the things in the street: made copies of Danny's change (pale, smiling), a second hunter, and far ones that only watch ----------
 const GRIN=(()=>{const g=new THREE.Group();const mouth=new THREE.Mesh(new THREE.TorusGeometry(.085,.016,6,16,Math.PI),new THREE.MeshBasicMaterial({color:0x140a08}));mouth.rotation.set(0,0,Math.PI);g.add(mouth);
  const teeth=new THREE.Mesh(new THREE.TorusGeometry(.085,.009,4,16,Math.PI),new THREE.MeshStandardMaterial({color:0xe8e0cc,roughness:.4}));teeth.rotation.set(0,0,Math.PI);teeth.position.z=-.006;teeth.scale.set(.96,.94,1);g.add(teeth);return g;})();
 function creature(name,{pale=false,scale=1,grin=false}={}){const M=createHunterModel({scene});M.root.name='c8-street-'+name;
  if(pale)M.root.traverse(o2=>{if(o2.isMesh&&o2.material?.name==='hunter-skin'){o2.material.color.setHex(0xcdc2b4);o2.material.roughness=.62;}});
  if(scale!==1)M.root.scale.setScalar(scale);
  if(grin){const g=GRIN.clone();const hd=M.root.getObjectByName('head')||M.sockets.head;g.position.set(0,-.012,-.196);g.scale.set(1.12,.9,1);hd.add(g);}
  return {M,name,pale,mode:'off',path:[],i:0,speed:1.2,sight:9,fov:.45,rush:false,onSee:null,onCatch:null,seenT:0,still:0,look:null,low:0,state:'walk',frozen:false};}
 const CR={a:creature('made-a',{pale:true,scale:.84,grin:true}),b:creature('made-b',{pale:true,scale:.8,grin:true}),c:creature('made-c',{pale:true,scale:.86,grin:true}),
  h2:creature('hunter-2',{scale:1.05}),far1:creature('far-1',{pale:true,scale:.9,grin:true}),far2:creature('far-2',{scale:1}),far3:creature('far-3',{pale:true,scale:.82,grin:true})};
 // a route (street points [d,lat]), at a speed, in a state; it watches for you while watch is set
 function send(c,pts,{speed=1.2,state='walk',low=0,watch=true,then=null,look=null}={}){c.path=pts.map(([d,lat])=>SP(d,lat));c.i=0;c.speed=speed;c.state=state;c.low=low;c.mode='path';c.watch=watch;c.then=then;c.look=look;c.M.show(true);}
 function put(c,d,lat,a=0,{state='idle',low=0,watch=false}={}){const q=SP(d,lat);c.M.place(q.x,q.z,a,q.y);c.M.setState(state);c.M.drive.low=low;c.mode='hold';c.state=state;c.watch=watch;c.M.show(true);}
 function hideC(c){c.mode='off';c.M.show(false);c.rush=false;}
 // whether it can see you: near enough, in front of it, a clear line (houses and the trench in the way count), you not hidden;
 // crouched and dark you are a third as far away to it
 const _e=new THREE.Vector3();
 function sees(c){if(C.hiding)return false;const p=me(),M=c.M,d=Math.hypot(p.x-M.x,p.z-M.z),lim=c.sight*(crouched()?.38:1)*(o.foot.on?1:.75);if(d>lim)return false;
  const fx=Math.sin(M.heading),fz=-Math.cos(M.heading),dot=((p.x-M.x)*fx+(p.z-M.z)*fz)/(d||1);if(dot<c.fov&&d>2.2)return false;
  const n=Math.ceil(d/.7);for(let i=1;i<n;i++){const x=M.x+(p.x-M.x)*i/n,z=M.z+(p.z-M.z)*i/n;if(!nav.walkable(x,z,{r:.05})&&!inHole(x,z))return false;}return true;}
 const inHole=(x,z)=>{for(const F of [town.FIELD,town.YARD]){if(!F.on||F.k<.2)continue;const q=F.local(x,z);if(q&&F.hole(q.d,q.lat)>.05)return true;}return !!ruin.inPit(x,z);};
 const canStep=(x,z)=>nav.walkable(x,z,{r:.32});
 function crUpdate(c,dt){const M=c.M;if(c.mode==='off')return;const p=me(),dYou=Math.hypot(p.x-M.x,p.z-M.z);
  // far away from you it is only drawn, at a lower rate: nothing to decide
  c.acc=(c.acc||0)+dt;if(dYou>75&&c.mode!=='path'){if(c.acc<.2)return;}const dd=c.acc;c.acc=0;
  if(c.rush){const a=headingTo(M.x,M.z,p.x,p.z);M.heading+=clamp(wrap(a-M.heading),-6*dd,6*dd);const sp=c.rushSpeed||4.6,nx=M.x+Math.sin(M.heading)*sp*dd,nz=M.z-Math.cos(M.heading)*sp*dd;
   if(canStep(nx,nz)){M.x=nx;M.z=nz;}else if(canStep(nx,M.z)){M.x=nx;}else if(canStep(M.x,nz)){M.z=nz;}M.setState('run');M.drive.speed=sp;M.drive.low=.7;M.drive.look={x:p.x,y:camera.position.y,z:p.z};M.y=gy(M.x,M.z);M.place(M.x,M.z,M.heading,M.y);M.update(dd);
   if(dYou<1.25){c.rush=false;c.onCatch?.();}else if(dYou>c.sight*2.6||c.rushT>(c.rushMax||7)){c.rush=false;c.mode='path';}c.rushT=(c.rushT||0)+dd;return;}
  if(c.mode==='path'&&c.path.length){const q=c.path[c.i];const dx=q.x-M.x,dz=q.z-M.z,d=Math.hypot(dx,dz);if(d<.4){c.i++;if(c.i>=c.path.length){c.mode='hold';M.drive.speed=0;M.setState('idle');const t2=c.then;c.then=null;t2?.(c);}}
   else{const a=Math.atan2(dx,-dz);M.heading+=clamp(wrap(a-M.heading),-3*dd,3*dd);const st=Math.min(d,c.speed*dd);M.x+=Math.sin(M.heading)*st;M.z-=Math.cos(M.heading)*st;M.y=gy(M.x,M.z);M.setState(c.state);M.drive.speed=c.speed;M.drive.low=c.low;}}
  else{M.drive.speed=damp(M.drive.speed,0,6,dd);}
  M.drive.look=c.look?(typeof c.look==='function'?c.look():c.look):(dYou<16?{x:p.x,y:camera.position.y,z:p.z}:null);M.drive.tilt=Math.sin(C.t*.7+c.name.length)*.4;M.drive.twitch=.5;
  M.place(M.x,M.z,M.heading,M.y);M.update(dd);
  if(c.watch&&!C.failing&&sees(c)){c.seenT+=dd;if(c.seenT>(c.pale?.5:.8)){c.seenT=0;c.rush=true;c.rushT=0;sound(c.pale?'c8Scrape':'c7Snarl',{x:M.x,y:M.y+1.6,z:M.z},{gain:1.2});c.onSee?.(c);mark('it saw you: '+c.name);}}else c.seenT=Math.max(0,c.seenT-dd);}
 // ---- the people of the street ------------------------------------------------------------------------------------------------------------------------------
 const ADULT=(name,shirt,pants,hair,skin,scale=1.16,old=false)=>({name,scale,face:{jaw:old?.98:.86,cheek:.96,eyeGap:.036,eyeY:.013,browTilt:old?-.06:.1,nose:'straight',mouth:'flat',ears:1,skin,lips:0xa86a58,iris:0x2a2018},
  hair:{style:old?'cropped':'ponytail',color:hair},build:{bulk:old?1.02:.94,shoulders:old?.98:.96,head:.96,posture:old?.08:0,hunch:old?.12:.02},clothes:{shirt,trim:null,sleeves:'long',pants,socks:pants,shoes:0x2a2a2c,sole:0x4a4a48}});
 const mrsH=createActor(scene,nav,ADULT('MRS. HENDERSON',0x7a5a8a,0x2e3446,0x5a3a24,0xd9ad8c),{seed:181});
 const mrH=createActor(scene,nav,ADULT('MR. HENDERSON',0x8a8a7a,0x4a4436,0xc8c4bc,0xd2a68a,1.14,true),{seed:182});
 const lily=createActor(scene,nav,{...CAST.kid,name:'LILY',scale:.76,clothes:{...CAST.kid.clothes,shirt:0xe8a0b0,shorts:0x6a7ab0}},{seed:183});
 const pruitt=createActor(scene,nav,ADULT('MRS. PRUITT',0x5a6a8a,0x3a3a40,0xd8d4cc,0xe0b89a,1.1,true),{seed:184});
 const davis=createActor(scene,nav,ADULT('MR. DAVIS',0x6a4a3a,0x2e2e32,0x2a1e16,0x9a6a4c),{seed:185});
 const runners=[0,1].map(i=>createActor(scene,nav,ADULT('NEIGHBOR',[0x3a5a7a,0x8a3a2a][i],0x2e2e32,[0x2a1e16,0x6a4a2a][i],[0xd8ad8c,0xe2b898][i]),{seed:190+i}));
 const PEOPLE=[mrsH,mrH,lily,pruitt,davis,...runners];
 const HQ=town.houseHend,HAt=(x,z,y=0)=>{const w=HQ.toWorld(x,z);return {x:w.x,z:w.z,y:w.ground+y};};
 // (the Hendersons' house, in its own frame: +z its front, toward the street; its garage on the gs side, its outer wall at gx+gs*gw/2.
 //  The yard that opens runs from the sidewalk to the front of the house; the side path, past the garage's outer wall, is the one
 //  way off the house side that doesn't cross it: out along the wall, past the hole's end, to the street.)
 const HD=(()=>{const D2=HQ.depth/2,W2=HQ.w/2,gs=HQ.gs||1,gw=HQ.gw??6.4,gx=HQ.gx??gs*(W2+gw/2),gf=HQ.gfront??D2,gd=HQ.gd??Math.min(HQ.depth,7),ow=gx+gs*gw/2;
  return {D2,W2,gx,gw,gs,gf,gd,ow,door:HAt(HQ.doorX??0,D2+1.4),win:HAt(-W2*.45,D2+.7),lilyIn:HAt(-W2*.45,D2-1.3),garageFront:HAt(gx,gf+.9),mrIn:HAt(gx-gs*.5,gf-1.7),jamieIn:HAt(gx-gs*.1,gf-1.2),
   jackAt:HAt(gx-gs*1.4,gf+.35),sideDoor:HAt(ow+gs*.55,gf-gd*.55),side:HAt(ow+gs*.62,gf-.75),beam:HAt(ow+gs*.62,gf-.55,2.05),corner:HAt(ow+gs*.9,gf+.7),
   out:HAt(ow+gs*1.6,gf+3.2),grab:HAt(ow+gs*1.0,gf-1.6),body:HAt(ow+gs*1.75,gf+3.0),cap:HAt(ow+gs*2.6,gf+2.2),up:HAt(ow-gs*1.6,gf+4.4),watch:HAt(ow+gs*3.4,gf+8.6),street:SP(1010,4.4)};})();
 // the beam over the side path (the garage roof's corner, come down): Jamie under it, holding it
 const beam=new THREE.Group();beam.name='c8-door-header';{const m=new THREE.MeshStandardMaterial({color:0x6a4c32,roughness:.85});m.name='c8-beam';const b=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,1.5),m);b.castShadow=true;beam.add(b);
  // (the header and what came down with it: the top of the door frame, a broken stud, a sheet of siding hanging)
  const st=new THREE.Mesh(new THREE.BoxGeometry(.09,1.1,.09),m);st.position.set(0,.45,.62);st.rotation.x=.5;beam.add(st);const sh=new THREE.Mesh(new THREE.BoxGeometry(.04,.7,1.2),new THREE.MeshStandardMaterial({color:HQ.wall??0xb8a890,roughness:.9}));sh.position.set(.06,.3,-.1);sh.rotation.x=-.2;beam.add(sh);}
 // ---- the world up here ----------------------------------------------------------------------------------------------------------------------------------
 function streetWorld(){CM.show(false);if(nav.room===CM.nav)nav.setRoom(null);presence.reset();presence.show(true);huntStop();o.bikeAway?.(true);
  nightStreet();X.ch3?.creature?.show?.(false);cutWorld(world);ruin.show(true);ruin.stage(1);ruin.truck.g.visible=true;
  // (the draft's own Hendersons' wreck and their yard pit give way to the stand-in house and the yard that opens)
  ruin.H.g.visible=false;if(ruin.H.cut)ruin.H.cut.on=false;for(const kk of ['under','sams']){ruin.pits[kk].g.visible=false;ruin.pits[kk].cut.on=false;}ruin.sedan.visible=false;ruin.syncCuts();
  town.show(true);town.skip('ruin');ruin.setBlocked((x,z,r)=>town.blocked(x,z,r));nav.setRoom(ruin.room);lightsOn(true);for(let i=0;i<6;i++)light(i,null);
  light(0,{x:ruin.F.center?.x??0,y:(ruin.F.center?.y??0)+3,z:ruin.F.center?.z??0},{intensity:40,dist:34,color:0xff8a3a,flicker:.6});
  const car=k.carA;car.show(true);const cq=main(1000,-6.4),cq2=main(990,-6.4);car.park(cq.x,cq.z,headingTo(cq.x,cq.z,cq2.x,cq2.z));car.lights=true;police.attach?.(true);
  const cb=k.carB;cb.show(true);const bq=main(895,3),bq2=main(905,3);cb.park(bq.x,bq.z,headingTo(bq.x,bq.z,bq2.x,bq2.z));cb.lights=true;
  for(const [i,f] of (X.fire||[]).entries()){f.show(true);const q=main(903+i*2,-7.2-i);f.place(q.x,q.z,headingTo(q.x,q.z,ruin.F.center?.x??q.x,ruin.F.center?.z??q.z+1));}
  skyline(true);C.apocWant=1;town.ash=0;C.amb={traffic:0,insects:0,wind:.7,life:0,forest:0,tunnel:0,water:.3};C.where='street';}
 function four(at,a=0){const A2=X.enlistAlex();joinFoot(sam,{x:at.x+.9,z:at.z+.6},a);joinFoot(A2,{x:at.x-.8,z:at.z+.5},a);joinFoot(jamie,{x:at.x+.2,z:at.z+1.4},a);reyes.show(true);reyes.place(at.x+1.6,at.z-.6,a);reyes.gest('flashlight');minds();}
 const say1=(c,l)=>say([l]);
 // ---- the surface: up into it, down the drive ----------------------------------------------------------------------------------------------------------
 function sceneSurface(from='surface'){go('g8-surface');streetWorld();C.h=Math.max(C.h,HOUR.surface);C.hMin=HOUR.surface;date(C.h);town.ash=.85;
  const start=from==='surface'?SP(1160,2.6):from==='trench'?SP(1104,4.2):SP(1062,6.2);o.placePlayer({x:start.x,z:start.z,a:heading(1100)+Math.PI,mode:'walk',bike:null});four(start,heading(1100)+Math.PI);
  if(from==='trench'){town.skip('impacts');}if(from==='pruitt'){town.skip('impacts');town.skip('trench');town.skip('lean');}
  checkpoint(from==='surface'?'c8-surface':from==='trench'?'c8-trench':'c8-street');
  // the far ones, from the start: on a roof at the end of the drive, at the edge of the field, crossing far down at Summerfield
  put(CR.far1,1112,-24,heading(1112),{state:'crouch',low:.6});CR.far1.M.root.position.y+=5.6;CR.far1.roof=5.6;
  put(CR.far2,1188,-30,0,{state:'idle'});send(CR.far3,[[868,-30],[868,30]],{speed:1.6,state:'stalk',low:.5,watch:false});
  task('surface',(function*(){
   if(from==='surface'){
    yield* lines([N('Up the last rungs into air that smells of gas and smoke and wet earth. And the sky—',{time:3.4}),{wait:.6},
     N('The sky is wrong. A low red ceiling over the whole town, churning, lit from underneath. Toward the court it glows like the inside of an oven.',{time:5}),
     N('And in the glow, past the oak and the trees: it. A hill of it, folds and swellings, and things like arms going up out of it into the cloud and coming down over the roofs.',{time:6})]);
    feel(jamie,'horror',6);feel(sam,'horror',6);feel(X.alex,'terrified',8);hold(X.alex,{x:start.x-1.2,z:start.z+.6},ACT.floor({arms:'hug',lean:-.2,shiver:1}));
    yield* lines([J('Is that— is that IT? That’s all IT?',{time:2.6,face:'horror'}),SM('It’s the size of the school.',{time:2,face:'horror'}),{wait:1.2},AL('(on the grass, hugging his knees) It got out. It got all the way out.',{time:3,face:'terrified'}),
     R('Hey. HEY. Eyes on me. All of you. My car’s at Sam’s house and there are trucks at Summerfield. We are walking down that street, together, and we are not stopping. Okay?',{time:6.2}),
     J('Okay.',{time:1}),SM('Okay.',{time:1}),{wait:.8},R('Alex. Alex, I need you up. I’ve got you. Come on.',{time:3})]);
    stand(X.alex,null);reyes.gest('flashlight');
    objective('Down the drive.','Reyes’s car at Sam’s house; the trucks at Summerfield. Stay together.');
    // the first blows under the street, as you come out of the bulb
    yield* until(()=>dNow()<1146||C.pt>60);town.fire('impacts');later(1.8,()=>{davis.show(true);const q=SP(1114,12);davis.place(q.x,q.z,heading(1114)-Math.PI/2);davis.gest('flashlight');davis.lookAt=SP(1120,0);});
    later(5.2,()=>{const r=runners[0],q=SP(1098,-14),q2=SP(1092,-6.5),q3=SP(1060,-7.5),q4=SP(1030,-9.5);r.show(true);r.place(q.x,q.z,headingTo(q.x,q.z,q2.x,q2.z));r.walk([[q2.x,q2.z],[q3.x,q3.z],[q4.x,q4.z]],{speed:3.6,then:a=>a.show(false)});
     sound('c7Door',q,{gain:.8});later(2.2,()=>{const c=CR.far3;c.M.show(true);const s0=SP(1104,-19);c.M.place(s0.x,s0.z,headingTo(s0.x,s0.z,q2.x,q2.z),s0.y);send(c,[[1096,-9],[1086,-7],[1060,-8],[1032,-10]],{speed:4.2,state:'run',low:.75,watch:false,then:cc=>hideC(cc)});sound('c8Scrape',s0,{gain:1.1});});
     later(3.4,()=>say([V('A MAN, RUNNING','Get inside! GET INSIDE! It’s— they’re everywhere, they’re in the—',{time:2.6}),J('Something’s chasing him— there— on the LAWNS—',{time:2.2,face:'terrified'})]));});
    yield* lines([{wait:2.4},J('The windows— all the windows!',{time:1.8,face:'shocked'}),V('MR. DAVIS (ON HIS PORCH)','What the hell was that? What the HELL was that?',{time:2.6}),{wait:3},N('The streetlights go out one after another down the whole length of the drive.',{time:3.4})]);
    // a pale thing in the yard of 1110, calling in a woman's voice; down behind the car in the drive until it has gone by
    objective('Down the drive.','Stay together.');yield* until(()=>dNow()<1131||C.pt>300);
    put(CR.a,1108,-17,heading(1108)+Math.PI/2,{state:'idle'});CR.a.M.drive.low=0;
    yield* lines([V('A WOMAN’S VOICE, FROM THE YARD ACROSS','Help me. Please. Please, I’m hurt, I can’t— help me—',{time:3.6}),N('A figure in the yard across the street. Standing very straight. Pale all over. Smiling. Its mouth doesn’t move with the voice.',{time:4.6}),
     AL('That’s not a person. That’s one of the things it makes. DON’T look at it—',{time:3,face:'terrified'}),R('Down. Behind the car. All of you, DOWN.',{time:2})]);
    objective('Hide.','Behind the car in the driveway. Stay down until it’s gone by.');
    const car2=town.CAR2.g.position;offer('hide-car','Get down behind the car',()=>({x:car2.x+Math.sin(heading(1116))*1.6,y:car2.y+.6,z:car2.z-Math.cos(heading(1116))*1.6}),{r:3,once:false,when:()=>!C.hiding,fn:()=>{C.hiding='car';o.roam.walkLock=true;offer('unhide','Come out',V3(camera.position),{r:9,once:true,fn:()=>{C.hiding=null;o.roam.walkLock=false;}});}});
    for(const c of [sam,jamie,X.alex])hold(c,{x:car2.x+Math.sin(heading(1116))*1.4+(Math.random()-.5)*1.4,z:car2.z-Math.cos(heading(1116))*1.4+(Math.random()-.5)*1.4},ACT.hide({low:.5}));reyes.gest('brace');
    CR.a.onCatch=()=>fail('c8-surface','it reached you');yield* wait(3.6);
    send(CR.a,[[1112,-8],[1117,2],[1124,9],[1131,17]],{speed:1.35,state:'stalk',low:.25,watch:true});
    yield* until(()=>CR.a.mode==='hold'||C.failing,60);if(C.failing)return;CR.a.watch=false;send(CR.a,[[1140,40],[1150,70]],{speed:1.6,state:'stalk',watch:false,then:c=>hideC(c)});
    if(C.hiding){unoffer('unhide');C.hiding=null;o.roam.walkLock=false;}unoffer('hide-car');for(const c of [sam,jamie,X.alex])stand(c,null);reyes.gest('flashlight');
    yield* lines([N('It walks past the car, close enough to hear it breathing, and on across the lawns toward the field, still calling for help in that voice.',{time:4.8}),
     J('(whispering) It smiled at me. It was smiling at me.',{time:2.4,face:'afraid'}),AL('They all smile. The ones it makes.',{time:2.2,face:'numb'}),R('Move. Move.',{time:1.2})]);
    checkpoint('c8-trench');}
   if(from==='surface'||from==='trench'){
    // the road goes, in front of you; something comes up out of it on the far side
    yield* until(()=>dNow()<1103||C.pt>200);town.fire('trench');
    yield* lines([{wait:1.4},SM('The road— get BACK, it’s lifting—',{time:2,face:'terrified'}),{wait:5},J('The CAR— oh my God, the car—',{time:2,face:'horror'}),{wait:3},R('Stay on this side! East side! Stay off the edge!',{time:2.4})]);
    yield* wait(2.4);objective('Along the east side.','Past the hole, on the lawns. Keep low: something is down there.');
    // the hunter out of the storm line, on the far side: it searches the west sidewalk while you go along the east lawns
    const st=town.FIELD.stormMouth;if(st){CR.h2.M.place(st.x,st.z,0,st.y);CR.h2.M.show(true);CR.h2.mode='hold';}
    yield* lines([N('Down in the hole, in the black mouth of the storm line, something moves. A long arm comes up over the broken edge. Then the rest of it, on the far side.',{time:5}),
     SM('There’s another one. There’s another one of THEM.',{time:2.2,face:'terrified'}),R('Get low. Keep the houses between you and it. Go.',{time:2.4})]);
    CR.h2.onCatch=()=>fail('c8-trench','it caught you');CR.h2.sight=12;CR.h2.rushSpeed=4.2;CR.h2.rushMax=6;
    send(CR.h2,[[1090,-6.6],[1080,-8.4],[1066,-8.2],[1057,-7.4]],{speed:.9,state:'stalk',low:.35,watch:true,then:c=>{send(c,[[1066,-8.2],[1084,-8.4]],{speed:.9,state:'stalk',low:.35,watch:true});}});
    // the house at 1052 goes over as you pass it
    yield* until(()=>dNow()<1068||C.pt>420);town.fire('lean');yield* lines([{wait:1},J('That house— that HOUSE—',{time:1.6,face:'horror'}),N('The whole house across the hole leans toward it, slowly, and its front comes off in pieces and you can see into the rooms. A lamp is still on up there.',{time:5})]);}
   if(!C.flags.pruitt){// Mrs. Pruitt, under the awning of her stoop: Jamie and you
    pruitt.show(true);const pq=SP(1056.3,12.4);pruitt.place(pq.x,pq.z,heading(1056)+Math.PI/2);pruitt.gest((p,w)=>{ACT.floor({arms:'lap',lean:-.4})(p,{clock:C.t});});
    const awn=SP(1056.3,12.9,.4);if(!C.awning){C.awning=new THREE.Mesh(new THREE.BoxGeometry(2.4,.12,1.2),new THREE.MeshStandardMaterial({color:0x4d4a48,roughness:.9}));scene.add(C.awning);}
    C.awning.position.set(awn.x,awn.y,awn.z);C.awning.rotation.set(.25,-heading(1056),0,'YXZ');C.awning.visible=true;
    yield* until(()=>dNow()<1067||C.pt>500);
    yield* lines([V('MRS. PRUITT','Help— somebody— my leg— I can’t get out from under—',{time:3}),J('Mrs. Pruitt! Hang on— we got you!',{time:2,face:'determined'})]);
    walkTo(jamie,SP(1056.9,11.9),{speed:2.6});objective('Mrs. Pruitt.','Lift the awning with Jamie.');
    yield* wait(1.6);hold(jamie,SP(1056.9,11.9),ACT.heave({strain:1}),()=>pruitt.pos);
    offer('awning','Lift (with Jamie)',()=>SP(1055.8,12.6,.6),{r:2.4,hold:2.2,tick:(dt2,k2)=>{C.awning.position.y=awn.y+k2*.7;C.awning.rotation.x=.25-k2*.5;},release:()=>{C.awning.position.y=awn.y;C.awning.rotation.x=.25;},fn:()=>{C.flags.pruitt=true;}});
    yield* until(()=>C.flags.pruitt);C.awning.position.y=awn.y+.9;C.awning.rotation.x=-.4;pruitt.gest(null);
    const rq=SP(1062,3);pruitt.walk([[rq.x,rq.z]],{speed:.9});feel(jamie,'grin',5);
    yield* lines([V('MRS. PRUITT','Oh— oh, thank you, boys— thank you—',{time:2.4}),J('(to you, out of breath, grinning) See? We’re good at this. We’re like... firemen.',{time:3,face:'grin'}),SM('Firemen don’t say “like”.',{time:1.8,face:'amused'}),
     J('This one does.',{time:1.2}),R('Ma’am, stay with me. Stay right behind me.',{time:2})]);stand(jamie,null);
    pruitt.walk([[SP(1050,3).x,SP(1050,3).z],[SP(1030,-6).x,SP(1030,-6).z],[SP(1004,-8.6).x,SP(1004,-8.6).z]],{speed:1});checkpoint('c8-street');}
   // (the one out of the storm line goes back down into it: something bigger is coming over the roofs)
   if(CR.h2.mode!=='off'){CR.h2.watch=false;const sm=town.FIELD.stormMouth;send(CR.h2,[[1072,-5.5]],{speed:2.4,state:'run',low:.7,watch:false,then:c=>{if(sm)c.M.place(sm.x,sm.z,c.M.heading,sm.y);hideC(c);}});}
   // a limb over the roofs, and down on the house across from the Hendersons'
   yield* until(()=>dNow()<1046||C.pt>700);
   const lb=SP(1150,-60,-8),hit=SP(1026,-15,2);SKY.set(5,{root:[lb.x,lb.y,lb.z],dir:[hit.x-lb.x,70,hit.z-lb.z],len:150,r0:7.5,r1:1.4,state:'emerge',probe:[lerp(lb.x,hit.x,.7),55,lerp(lb.z,hit.z,.7)],speed:.9});
   yield* lines([N('A shadow goes over the street. Over all of it. You look up—',{time:2.4}),{wait:1.6},N('—an arm of it, over the roofs, longer than the street is wide, coming down out of the cloud.',{time:3.6}),SM('Run— RUN—',{time:1.2,face:'terrified'})]);
   for(const c of [sam,jamie,X.alex])feel(c,'horror',6);
   yield* wait(1.6);SKY.strike(5,hit,{speed:.7,hold:4,onLand:()=>{town.fire('across');C.shake=1.4;}});
   yield* until(()=>town.EV.across.t>=0||C.pt>760,20);yield* wait(3.2);
   yield* lines([N('It comes down on the house across from the Hendersons’ and the house just— goes. The front of it, the roof, all at once, into a cloud of dust. Then fire.',{time:5}),{wait:1.4},
    J('(very quietly) That was the Kesslers’.',{time:2.4,face:'shocked'}),SM('They weren’t home. They weren’t home, right?',{time:2.4,face:'afraid'}),R('Keep. Moving.',{time:1.6})]);
   SKY.retract(5);sceneHendersons('arrive');})());}
 // ---- the Hendersons': Lily, Mr. Henderson, the yard, Jamie ---------------------------------------------------------------------------------------------
 function sceneHendersons(from='arrive'){go('g8-street');if(C.where!=='street'){streetWorld();town.skip('impacts');town.skip('trench');town.skip('lean');town.skip('across');const s0=SP(1036,3.6);o.placePlayer({x:s0.x,z:s0.z,a:heading(1030)+Math.PI,mode:'walk',bike:null});four(s0,heading(1030)+Math.PI);}
  town.ash=.85;C.h=Math.max(C.h,HOUR.street);C.hMin=HOUR.street;date(C.h);town.engage(town.PX.hend);
  mrsH.show(true);const mq=SP(1034,9.4);mrsH.place(mq.x,mq.z,headingTo(mq.x,mq.z,HD.door.x,HD.door.z));mrsH.gest('head');
  if(from==='arrive'){lily.show(true);lily.place(HD.lilyIn.x,HD.lilyIn.z,headingTo(HD.lilyIn.x,HD.lilyIn.z,HD.win.x,HD.win.z));lily.gest((p,w,t)=>{ACT.floor({arms:'hug',lean:-.1,shiver:1})(p,{clock:t});});}
  mrH.show(true);mrH.place(HD.mrIn.x,HD.mrIn.z,0);mrH.gest((p,w,t)=>{ACT.floor({arms:'lap',lean:-.5})(p,{clock:t});});
  if(from==='arrive')checkpoint('c8-hendersons');else if(from==='garage')checkpoint('c8-garage');else if(from==='yard'){checkpoint('c8-yard');lily.show(false);mrsH.show(false);}
  task('hend',(function*(){
   if(from==='arrive'){
    yield* lines([V('MRS. HENDERSON','HELP ME! My husband— my daughter— they’re in there! The door won’t— the door won’t open!',{time:3.8}),R('Okay. Okay, ma’am. Where?',{time:1.6}),
     V('MRS. HENDERSON','Lily’s in the front room! Frank was in the garage— the ceiling came down—',{time:3.2})]);
    objective('The Hendersons.','Lily in the front room. Mr. Henderson in the garage.');
    // the front window: Jamie puts his foot through it before anyone can stop him
    walkTo(jamie,HD.win,{speed:3,then:()=>{sound('c8Glass',HD.win,{gain:1.2});hold(jamie,HD.win,ACT.reach(jamie,()=>({x:HD.lilyIn.x,y:HD.lilyIn.y+.5,z:HD.lilyIn.z}),{hand:'r'}),()=>V3(HD.lilyIn));town.engage(town.PX.hend);town.hurt(town.PX.hend,'facade',.0);C.flags.winOut=true;}});
    yield* until(()=>C.flags.winOut||C.pt>40,30);
    yield* lines([J('Got it! Window’s open— she’s right there, under the table!',{time:2.6,face:'determined'}),SM('Jamie, the ceiling—',{time:1.4,face:'afraid'}),J('I KNOW about the ceiling.',{time:1.4})]);
    // she won't come; he talks her out
    offer('lily','Reach in for Lily',()=>V3({x:HD.win.x,y:HD.win.y+1.1,z:HD.win.z}),{r:3.4,fn:()=>{C.flags.lilyReach=true;}});
    yield* until(()=>C.flags.lilyReach);feel(jamie,'concerned',8);
    yield* lines([N('Under the dining table, in the dark: a little girl in pink pyjamas with her hands over her ears. She won’t come.',{time:3.8}),
     J('(crouching at the window) Hey. Hey, Lily. I’m Jamie. You know my dog? Biscuit? The dumb one that eats socks?',{time:4,face:'happy'}),{wait:1},
     J('He’s waiting for you. He wants to meet you. But you gotta come out first. Can you come out? I’ll hold your hand the whole time. Promise.',{time:4.8}),{wait:1.2},
     N('She crawls out. Slowly. She takes his hand. Then yours.',{time:3})]);
    lily.gest(null);lily.place(HD.win.x,HD.win.z,0);const cq=SP(1003,-5.6);
    objective('Lily.','To Reyes’s car at Sam’s house, with her mother.');feel(jamie,'relieved',4);
    lily.walk([[SP(1036,4).x,SP(1036,4).z],[SP(1032,-4.6).x,SP(1032,-4.6).z],[cq.x,cq.z]],{speed:1.15});mrsH.walk([[SP(1036,5).x,SP(1036,5).z],[SP(1031,-5).x,SP(1031,-5).z],[SP(1004,-5).x,SP(1004,-5).z]],{speed:1.2});
    yield* until(()=>dNow()<1010||C.pt>200,90);checkpoint('c8-garage');}
   // the garage: the jack under the door; Jamie in
   const jk=HD.jackAt;
   if(from!=='yard'){
   yield* lines([R('Good. Good. Get in the car, both of you, keep your heads down. Frank’s in the garage, boys— where’s Jamie?',{time:4}),SM('He went back. He went to the garage.',{time:2.2,face:'worried'})]);
   walkTo(jamie,HD.garageFront,{speed:2.4});objective('Mr. Henderson.','The garage. Its door has come down crooked: the jack from her car.');
   offer('jack','Pump the jack under the garage door',()=>V3({x:jk.x,y:jk.y+.3,z:jk.z}),{r:2.8,hold:3.2,tick:()=>{if(Math.random()<.12)sound('c8Hydraulic',V3(jk),{gain:.3});},fn:()=>{C.flags.jacked=true;}});
   yield* until(()=>C.flags.jacked);sound('c8Metal',V3(jk),{gain:.7});
   hold(jamie,HD.jamieIn,ACT.heave({strain:1}),()=>V3(HD.mrIn));
   yield* lines([J('(from inside, under the door) He’s here— there’s a shelf on his leg— I got it— I GOT it—',{time:3.4,face:'determined'}),{wait:1.4},V('MR. HENDERSON','Oh God. Oh God, son, thank you—',{time:2.2})]);
   // the lawn: it lifts under your feet. Off it, now, or go down with it
   sound('c8Groan',SP(1024,11),{gain:1.4});C.shake=.5;for(let i=0;i<4;i++)later(i*.3,()=>town.dust(SP(1016+i*5,10+i%2*3),{n:2,r:1.4,rise:.4,size:[1,3],life:3,a:.3}));
   for(const [c,q] of [[sam,SP(1021,4.4)],[X.alex,SP(1026,4.1)]])if(c)stand(c,q,{max:4});reyes.walk([[SP(1018,4.8).x,SP(1018,4.8).z]],{speed:3.4});
   say([R('THE GROUND— OFF THE LAWN! OFF IT! NOW!',{time:2})]);objective('Get off the lawn.','The street, or the side yard. Now.');C.yardRun=true;
   yield* wait(1.4);town.fire('yard');for(const c of [sam,X.alex])feel(c,'horror',6);cry(.25,3);
   yield* wait(5.6);C.yardRun=false;if(C.failing)return;
   yield* lines([N('The whole lawn goes down between you and the house. A long breath of dust comes up out of the dark where it was.',{time:4}),
    J('(somewhere inside the garage, muffled) GUYS? GUYS! The door— it’s all gone out the front, there’s no— it’s a HOLE—',{time:3.6,face:'terrified'})]);
   checkpoint('c8-yard');}
   else{// (Continue from the yard: the lawn gone, the two of them in the garage)
    for(const n of ['yard'])town.skip(n);mrH.show(true);mrH.place(HD.mrIn.x,HD.mrIn.z,0);hold(jamie,HD.jamieIn,ACT.overhead({shake:.5,lean:.04}),()=>V3(HD.mrIn));
    const s0=SP(1020,4.2);o.placePlayer({x:s0.x,z:s0.z,a:headingTo(s0.x,s0.z,HD.garageFront.x,HD.garageFront.z),mode:'walk',bike:null});reyes.place(SP(1018,4.8).x,SP(1018,4.8).z,0);reyes.gest('flashlight');}
   // the garage is coming down on them; the one way out is its side door, into the side yard
   town.hurt(town.PX.hend,'garage',.3);sound('c8Creak',V3(HD.garageFront),{gain:1.2});
   yield* lines([SM('The side! There’s a side door on the garage— the side yard, it’s still there!',{time:3,face:'determined'}),R('Jamie! Can you hear me? The side door! Bring him out the side!',{time:2.8}),
    J('(muffled) Okay— OKAY— I see it—',{time:1.8})]);
   objective('The side yard.','Round the end of the hole. Get them out.');
   yield* until(()=>near(V3(HD.sideDoor),10)||C.pt>60,45);
   // the side door: its frame coming down; Jamie under the header with his arms up, holding it, while the old man crawls out under him
   const sd=HD.sideDoor,ry=-HQ.worldRot+Math.PI/2;beam.position.set(sd.x,sd.y+1.86,sd.z);beam.rotation.set(0,ry,.1);scene.add(beam);sound('c8Collapse',V3(HD.garageFront),{gain:1.4});town.hurt(town.PX.hend,'garage',.6);C.shake=.6;
   town.dust(V3({x:sd.x,y:sd.y+2.2,z:sd.z}),{n:4,r:1.2,rise:.5,size:[1.5,4],life:4,a:.45});
   stand(jamie,null);jamie.person.group.visible=true;{const a=headingTo(sd.x,sd.z,HD.street.x,HD.street.z);comp.putFoot(jamie,sd.x,sd.z,a,{bike:null});jamie.follow=null;}hold(jamie,sd,ACT.overhead({shake:1,lean:.08}),()=>V3(HD.street));feel(jamie,'terrified',14);
   mrH.show(true);const inside=HAt(HD.ow-HD.gs*.6,HD.gf-HD.gd*.55);mrH.place(inside.x,inside.z,headingTo(inside.x,inside.z,sd.x,sd.z));mrH.gest((p,w,t)=>{ACT.crawl({speed:.6})(p,{clock:t});});
   S.lookTarget=V3({x:sd.x,y:sd.y+1.5,z:sd.z});
   yield* lines([N('The side door of the garage. Its whole frame has come down, and Jamie is in the doorway with his arms up, holding the header off the opening with everything he has.',{time:5}),
    J('Under me— go UNDER— I can hold it— GO!',{time:2.2,face:'terrified'}),V('MR. HENDERSON','Son, you come too—',{time:1.6}),J('I can’t let go! GO!',{time:1.4})]);
   S.lookTarget=null;mrH.walk([[sd.x,sd.z]],{speed:.45});
   // it comes up out of the hole's end, in the side yard: between you and him. It doesn't look at you. It wants him
   HM.show(true);H.reset();HM.show(true);const up=HD.up;H.place(up.x,up.z,headingTo(up.x,up.z,sd.x,sd.z));C.huntRise=1.5;HM.setState('crawl');sound('c7Snarl',V3(up),{gain:1.6});C.shake=.5;mark('it came up in the side yard');
   H.script([{wait:1.3,state:'peek',low:.6,look:()=>V3(sd)},{to:()=>[lerp(up.x,sd.x,.45),lerp(up.z,sd.z,.45)],speed:1,state:'stalk',low:.5,free:true}]);
   // (Sam and Alex at the end of the hole, turned to it, watching; Sam half a step toward it, Alex back)
   {const jw=()=>V3({x:jamie.px,z:jamie.pz});stand(sam,SP(1012.4,8.4),{look:jw,max:4});if(X.alex)stand(X.alex,SP(1010.2,6.6),{look:jw,max:4,gesture:ACT.shake(ACT.hug(null),{k:1})});feel(sam,'anguish',12);if(X.alex)feel(X.alex,'horror',12);}
   yield* lines([SM('JAMIE! JAMIE, IT’S IN THE YARD— IT’S COMING—',{time:2,face:'anguish'}),Y('JAMIE! LET GO! RUN!',{time:1.4}),J('NOT YET! He’s not through! NOT YET!',{time:1.8,face:'terrified'})]);
   reyes.walk([[HD.watch.x+.8,HD.watch.z-.6]],{speed:3.4,then:()=>{reyes.gest('point',V3(HM.root.position));}});later(1.2,()=>{C.reyesFire=true;});
   objective('Jamie.','');
   yield* until(()=>Math.hypot(mrH.x-sd.x,mrH.z-sd.z)<.5||C.pt>400,6);mrH.gest(null);mrH.walk([[HD.out.x,HD.out.z],[HD.street.x,HD.street.z],[SP(1004,-5).x,SP(1004,-5).z]],{speed:1.1});
   yield* lines([V('MR. HENDERSON','I’m through— I’m through, son—',{time:1.8}),N('Jamie lets the header go. It comes down behind him like a door slamming. He runs—',{time:3.4})]);
   beam.rotation.z=.95;beam.position.y=sd.y+.9;sound('c8Collapse',V3(sd),{gain:1.2});town.hurt(town.PX.hend,'garage',1);
   // it takes him. To take him back down: it has him by the shoulder and it is dragging him to the hole. Reyes is firing. You can run at it
   stand(jamie,{x:HD.grab.x,z:HD.grab.z},{max:3.6});C.jamieDrag=null;
   H.script([{to:()=>[jamie.px,jamie.pz],speed:4.6,state:'run',low:.7,free:true,near:1.05},{act:()=>{C.jamieHeld=0;C.jamieDrag={from:{x:jamie.px,z:jamie.pz},t:0};mark('it has Jamie');sound('c7Strike',V3({x:jamie.px,z:jamie.pz}),{gain:1.3});C.shake=.6;}},
    {wait:.7,state:'grab',reach:()=>({x:jamie.px,y:jamie.person.group.position.y+1.2,z:jamie.pz})},
    {to:()=>[HD.out.x,HD.out.z],speed:1.1,state:'drag',low:.5,free:true,near:.4},{act:()=>{C.slam=true;}}]);
   yield* until(()=>C.jamieHeld!=null||C.pt>500,12);
   yield* lines([SM('IT’S GOT HIM— IT’S TAKING HIM BACK— NO— NO—',{time:2.2,face:'anguish'})]);
   // it slams him down at the edge, hit, and goes into the ground; whether you got to it or not
   yield* until(()=>C.slam||(C.jamieHeld>1.2&&Math.hypot(me().x-HM.x,me().z-HM.z)<2.2)||C.jamieHeld>6,8);
   C.jamieHeld=null;C.jamieThrown=0;C.jamieDrag=null;sound('c8Fall',V3(HD.out),{gain:1.6});sound('c7Strike',V3(HD.out),{gain:1.2});C.shake=.9;mark('it threw him down');
   H.script([{wait:.5,state:'hit'},{act:()=>sound('c8Shot',V3(reyes.pos),{gain:1.3})},{wait:.4,state:'hit'},{to:()=>[HD.up.x,HD.up.z],speed:4.2,state:'run',low:.9,free:true,near:.5},{act:()=>{HM.show(false);H.reset();C.reyesFire=false;mark('it went back into the ground');}}]);
   yield* until(()=>C.jamieThrown>=1||C.pt>900,3);C.jamieDead=true;C.flags.jamieDead=true;X.C.grief.jamie=true;
   yield* wait(1.4);sceneJamieDeath('now');})());}
 // ---- after: the three of you, and Jamie on the grass ------------------------------------------------------------------------------------------------------------
 function jamieBody(){// where he lies, and how: on his back on the grass by the garage, his cap a little way off
  leave(jamie);jamie.gone=false;jamie.person.group.visible=true;C.jamieBodyAt={x:HD.body.x,z:HD.body.z};C.jamieLying=true;
  if(!C.cap){C.cap=new THREE.Mesh(new THREE.SphereGeometry(.11,10,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x2e4a7a,roughness:.8}));C.cap.name='c8-jamie-cap';const brim=new THREE.Mesh(new THREE.BoxGeometry(.16,.01,.1),C.cap.material);brim.position.set(0,0,-.1);C.cap.add(brim);scene.add(C.cap);}
  const cq=HD.cap;C.cap.position.set(cq.x,cq.y+.04,cq.z);C.cap.visible=C.inv.cap!=='have';
  if(!C.jacket){const m=new THREE.MeshStandardMaterial({color:0x1b2232,roughness:.92});m.name='c8-reyes-jacket';const g=new THREE.Group();g.name='c8-reyes-jacket';
   const b=new THREE.Mesh(new THREE.BoxGeometry(.66,.07,.86),m);b.position.y=.04;b.castShadow=true;g.add(b);for(const s2 of [-1,1]){const sl=new THREE.Mesh(new THREE.BoxGeometry(.16,.05,.62),m);sl.position.set(s2*.42,.02,.18);sl.rotation.y=s2*.35;g.add(sl);}
   const col=new THREE.Mesh(new THREE.BoxGeometry(.4,.05,.1),new THREE.MeshStandardMaterial({color:0x111620,roughness:.9}));col.position.set(0,.08,-.42);g.add(col);C.jacket=g;scene.add(g);}
  {const q=HD.body,a=-(HQ.worldRot+.4);C.jacket.position.set(q.x+Math.sin(-a)*.1,q.y+.1,q.z-Math.cos(-a)*.1);C.jacket.rotation.set(0,a,0);C.jacket.visible=!!C.flags.covered;}}
 function sceneJamieDeath(from='now'){go('g8-street');if(C.where!=='street'){streetWorld();for(const n of ['impacts','trench','lean','across','yard'])town.skip(n);town.engage(town.PX.hend);const s0=SP(1022,2.4);o.placePlayer({x:s0.x,z:s0.z,a:heading(1022)+Math.PI/2,mode:'walk',bike:null});four(s0);}
  C.h=Math.max(C.h,HOUR.street+.12);C.hMin=HOUR.street+.12;date(C.h);X.C.grief.jamie=true;applyGrief();C.flags.jamieDead=true;jamieBody();HM.show(false);C.reyesFire=false;scene.add(beam);beam.position.set(HD.beam.x,HD.beam.y-1.2,HD.beam.z);beam.rotation.set(0,-HQ.worldRot+Math.PI/2,.9);
  mrsH.show(false);lily.show(false);mrH.show(false);town.ash=.9;C.apocWant=1;checkpoint('c8-jamie-death');
  const A2=X.alex;
  task('jamie-death',(function*(){
   if(from==='now'){
    // the moment: no one moves. Then everyone does.
    cry(1,14);for(const c of [sam,A2])feel(c,'horror',4);
    yield* lines([N('He hits the grass at the edge of the hole, hard, and doesn’t move.',{time:3}),{wait:1.6},
     Y('JAMIE!',{time:1}),SM('JAMIE— JAMIE— NO— NO NO NO—',{time:2.4,face:'anguish'})]);
    // Sam runs to him; Alex can't move; Reyes runs, his gun still in his hand
    weep(sam,'anguish',8);walkTo(sam,{x:HD.body.x-.85,z:HD.body.z-.45},{speed:3.8,then:()=>hold(sam,{x:HD.body.x-.75,z:HD.body.z+.35},ACT.kneelOver(sam,()=>({x:HD.body.x,y:HD.body.y+.25,z:HD.body.z}),{rock:1}),()=>V3(HD.body))});
    weep(A2,'horror',10);hold(A2,HD.watch,ACT.shake(ACT.hug(null),{k:1.2}),()=>V3(HD.body));
    reyes.walk([[HD.body.x+.9,HD.body.z+.3]],{speed:3.4,then:()=>{C.reyesThere=true;reyes.gest(REYES_CPR);}});
    yield* lines([R('Don’t move him— don’t move him— let me— LET ME—',{time:2.6})]);
    objective('Jamie.','');C.flags.wayRound=true;}
   else{C.reyesThere=true;const q=HD.body;reyes.show(true);reyes.place(q.x+.9,q.z+.3,headingTo(q.x+.9,q.z+.3,q.x,q.z));reyes.gest(REYES_CPR);C.flags.wayRound=true;cry(.85,10);}
   yield* until(()=>near(V3(HD.body),2.4)||C.pt>240,200);
   // at him: kneel; his face; Reyes, working on him, and then not
   pose(V3({x:me().x,z:me().z}),{y:gy(me().x,me().z)+.85,look:{x:HD.body.x,z:HD.body.z},pitch:-.55,slow:1.6});cry(1,20);
   yield* lines([N('His eyes are closed. There’s a cut over his eyebrow from the cell, and grass in his hair. He looks like he’s asleep. He doesn’t look like anything happened to him at all.',{time:5.6}),{wait:1.6},
    R('Come on, son. Come on. Come on.',{time:2.6}),N('Reyes is pressing on his chest with both hands, counting under his breath.',{time:3}),{wait:3},R('Come ON.',{time:1.2}),{wait:2.4}]);
   reyes.gest(REYES_STOP);
   yield* lines([N('He stops. He sits back on his heels. He puts his hand over his eyes and stays like that.',{time:4}),{wait:2.2},R('(not loud) I’m sorry. I’m so sorry. I’m so sorry, kid.',{time:3.4})]);
   // Sam: comes round, down on his knees on Jamie's other side, shaking him
   hold(sam,{x:HD.body.x-.75,z:HD.body.z+.35},ACT.kneelOver(sam,()=>({x:HD.body.x,y:HD.body.y+.25,z:HD.body.z}),{rock:1}),()=>V3(HD.body));weep(sam,'sobbing',40);
   yield* lines([{wait:1.4},SM('Jamie. Jamie, wake up.',{time:2.2,face:'sobbing'}),SM('Wake up. You have to wake up. You can’t— you can’t do this, you can’t—',{time:3.6}),{wait:1.6},
    SM('(sobbing) He was being so STUPID, he was holding the stupid roof, why did he— why didn’t he just RUN—',{time:4.2})]);
   // Alex: can't come close; then sits down on the grass, his hands over his head
   hold(A2,{x:HD.body.x+2.4,z:HD.body.z+1.8},ACT.headInHands({rock:1}),()=>V3(HD.body));weep(A2,'crying',40);
   yield* lines([AL('(behind you, on the grass) It’s my fault. It’s because you came for me. If you didn’t come for me he’d—',{time:4.4,face:'crying'}),
    SM('(turning on him) SHUT UP. Don’t— DON’T. Don’t you say that. Don’t you DARE say that.',{time:3.6,face:'anguish'}),{wait:1.2},SM('(the anger going out of him all at once) Don’t... don’t...',{time:2.6,face:'sobbing'})]);
   // and you: stay, as long as you need to. Then his cap.
   offer('jamie-hand','Hold his hand',()=>V3({x:HD.body.x+.3,y:HD.body.y+.15,z:HD.body.z+.2}),{r:3.4,inPose:true,look:true,size:.5,cone:.35,fn:()=>{C.flags.heldJamie=true;}});
   yield* until(()=>C.flags.heldJamie||C.pt>420,120);unoffer('jamie-hand');if(C.flags.heldJamie){cry(1,16);
    yield* lines([N('His hand is still warm. It’s just his hand. It’s just Jamie’s hand, the one he punches your arm with.',{time:4.6}),{wait:2},Y('(you can barely get it out) ...You said we were good at this.',{time:3.4}),{wait:2.6}]);}
   unpose();yield* wait(1.4);
   offer('jamie-cap','Pick up his cap',()=>V3(C.cap.position),{r:2.6,fn:()=>{C.inv.cap='have';C.cap.visible=false;}});
   yield* until(()=>C.inv.cap==='have'||C.pt>560,90);unoffer('jamie-cap');
   if(C.inv.cap==='have')yield* lines([N('His cap is on the grass where it came off. You pick it up. It still smells like him, like grass and that gum.',{time:4})]);
   // Reyes covers him; they have to go (more of them, coming up out of the ground)
   yield* lines([{wait:1,act:()=>{C.flags.covered=true;jamieBody();}},N('Reyes takes off his jacket and lays it over Jamie, all of him but his sneakers.',{time:3.6}),R('(to all of you, his voice not working right) I’m not leaving him. I’m coming back for him. I swear to God. I’m coming back for him.',{time:4.6})]);
   send(CR.b,[[1024.5,12.4],[1028,10.6]],{speed:.8,state:'crawl',low:.9,watch:false});send(CR.c,[[1019,13],[1022,11]],{speed:.7,state:'crawl',low:.9,watch:false});CR.b.M.show(true);CR.c.M.show(true);
   const sv=SP(1024,11.5,-3);CR.b.M.place(sv.x,sv.z,0,sv.y);CR.c.M.place(sv.x-2,sv.z+1,0,sv.y);sound('c8Scrape',sv,{gain:1});
   yield* lines([N('Something is climbing up out of the hole in the yard. Two of them. Pale. Smiling.',{time:3.4}),R('Up. UP. We have to go. Sam— Sam, I’ve got you. Up. I’ve got you.',{time:3.6})]);
   reyes.gest(null);unpose();objective('Go.','South. Summerfield. Stay with Reyes.');
   for(const c of [sam,A2])stand(c,null);stand(sam,null);sam.boost=.85;A2.boost=.8;
   C.flags.jamieMourned=true;mark('Jamie mourned');
   sceneFlee('go');})());}
 const REYES_CPR=(p,w,t,A)=>{const k2=w;ACT.kneel({side:1,lookPitch:-.5,hands:'down'})(p,{clock:t});const pump=Math.max(0,Math.sin(t*10.5));p[PP.root+1]-=pump*.03;p[PP.lean]+=.3+pump*.08;
  p[PP.lh+1]=.22-pump*.05;p[PP.rh+1]=.22-pump*.05;p[PP.lh+2]=-.48;p[PP.rh+2]=-.48;p[PP.lh]=-.04;p[PP.rh]=.04;void k2;void A;};
 const REYES_STOP=(p,w,t)=>{ACT.kneel({side:1,lookPitch:-.2})(p,{clock:t});p[PP.lean]-=.1;p[PP.rh+1]=.78+.47;p[PP.rh+2]=-.12;p[PP.rh]=.03;p[PP.hp]-=.25;};
 // ---- away from it: south, past Sam's house, the fire, to Summerfield; the intersection goes ------------------------------------------------------------------
 function sceneFlee(from='go'){
  if(from!=='go'){go('g8-street');if(C.where!=='street')streetWorld();for(const n of ['impacts','trench','lean','across','yard','ruin'])town.skip(n);town.engage(town.PX.hend);
   C.h=Math.max(C.h,HOUR.street+.2);C.hMin=HOUR.street+.2;date(C.h);X.C.grief.jamie=true;C.flags.jamieDead=true;C.flags.jamieMourned=true;C.flags.covered=true;C.inv.cap=C.inv.cap||'have';jamieBody();applyGrief();town.ash=.9;C.apocWant=1;
   const s0=SP(1038,4.5);o.placePlayer({x:s0.x,z:s0.z,a:heading(1030)+Math.PI,mode:'walk',bike:null});const A2=X.enlistAlex();joinFoot(sam,{x:s0.x+.9,z:s0.z+.5},heading(1030)+Math.PI);joinFoot(A2,{x:s0.x-.8,z:s0.z+.6},heading(1030)+Math.PI);
   reyes.show(true);reyes.place(s0.x+1.4,s0.z-.8,heading(1030)+Math.PI);reyes.gest(null);minds();sam.boost=.85;A2.boost=.8;for(const c of [sam,A2])weep(c,'grief',20);cry(.7,10);
   const sv=SP(1024,11.5,-3);CR.b.M.place(sv.x,sv.z,0,sv.y);CR.c.M.place(sv.x-2,sv.z+1,0,sv.y);CR.b.M.show(true);CR.c.M.show(true);
   objective('Go.','South. Summerfield. Stay with Reyes.');checkpoint('c8-flee');}
  task('flee',(function*(){const A2=X.alex;
   // the two of them come up out of the yard and follow, slowly, keeping their distance, smiling; Reyes fires; they stop at the corner
   send(CR.b,[[1018,6],[1000,4],[980,4]],{speed:1.3,state:'stalk',low:.4,watch:false});send(CR.c,[[1016,8],[996,7],[976,7]],{speed:1.2,state:'stalk',low:.4,watch:false});
   yield* lines([{wait:1.6},SM('(walking, not looking at anything) We left him. We left him on the grass.',{time:3.4,face:'grief'}),{wait:2.4},AL('(barely) I’m sorry. I’m sorry. I’m sorry.',{time:2.4,face:'crying'}),{wait:3}]);
   yield* until(()=>dNow()<996||C.pt>120,90);
   yield* lines([N('Sam’s house. Every window gone, the garage door caved in. His mom’s car isn’t in the drive.',{time:3.8}),SM('...They got out. They got out, right? Reyes?',{time:2.6,face:'tearful'}),
    R('Your street was evacuated two hours ago. They’re at the school. They’re okay.',{time:3.4}),{wait:1},SM('(quiet) Okay.',{time:1.4,face:'grief'})]);
   hideC(CR.b);hideC(CR.c);
   yield* until(()=>dNow()<945||C.pt>260,120);
   yield* lines([N('The Kowalskis’ house is burning all along its roof. The gas at the curb roars like a jet.',{time:3.4}),{wait:2},Y('(your voice wrong) He did the dog voice. For Lily. The dumb dog.',{time:3,act:()=>cry(.8,8)}),
    {wait:1.4},SM('Biscuit.',{time:1.2,face:'sobbing'}),{wait:2.4},AL('He’s not even— Biscuit isn’t even real. He doesn’t have a dog.',{time:3.2,face:'crying'}),{wait:2},SM('(a sound that is almost a laugh and isn’t) I know.',{time:2,face:'sobbing'})]);
   yield* until(()=>dNow()<935||C.pt>330,120);
   {const cb=k.carB,c=CR.far1;c.roof=null;c.M.show(true);c.M.place(cb.x,cb.z,(cb.a??0)+Math.PI,gy(cb.x,cb.z)+1.55);c.M.setState('crouch');c.M.drive.low=.95;c.mode='hold';c.watch=false;c.look=()=>({x:cb.x,y:gy(cb.x,cb.z)+1.1,z:cb.z});C.carThing=true;
    yield* lines([N('On the roof of the police car at the corner: one of them. Crouched. Its face pressed down against the windshield, looking in at the empty seats.',{time:4.4}),R('Don’t stop. Don’t stop walking.',{time:1.8})]);
    yield* until(()=>Math.hypot(me().x-cb.x,me().z-cb.z)<19||C.pt>400,40);C.reyesShots=3;reyes.gest('point',V3({x:cb.x,z:cb.z}));
    for(let i=0;i<3;i++)later(i*.5,()=>sound('c8Shot',V3(reyes.pos),{gain:1.2}));later(.6,()=>{C.carThing=false;c.look=null;const q=SP(940,30);send(c,[[948,18],[940,30]],{speed:5,state:'run',low:.8,watch:false,then:cc=>hideC(cc)});sound('c8Scrape',V3({x:cb.x,z:cb.z}),{gain:1.2});});
    yield* lines([{wait:1.2},N('It comes off the car in one long movement and is gone between the houses, faster than anything that size should move.',{time:4}),{wait:.4,act:()=>reyes.gest(null)}]);}
   yield* until(()=>dNow()<908||C.pt>460,120);
   ruin.heave();yield* lines([{wait:1.2},N('At Summerfield the whole intersection lifts, splits, and goes down, and takes the car that was sitting in it.',{time:4.4}),{wait:2},
    V('MR. BRANDT (BY THE RESCUE TRUCK)','REYES! Over here! Kids— oh, thank God— kids, over here!',{time:3})]);
   C.flags.streetDone=true;mark('to the works');yield* wait(2.4);X.toStaging?.();})());}
 // ---- after: the street as it is left, for the finale's walk and ride: every piece where it fell, nothing moving in it, the thing gone under
 function after(on){C.afterStreet=!!on;if(!on){town.show(false);return;}
  town.show(true);for(const n of ['ruin','impacts','trench','lean','across','yard'])town.skip(n);town.engage(town.PX.hend);ruin.setBlocked((x,z,r)=>town.blocked(x,z,r));
  for(const kk of ['under','sams']){ruin.pits[kk].g.visible=false;ruin.pits[kk].cut.on=false;}ruin.H.g.visible=false;if(ruin.H.cut)ruin.H.cut.on=false;ruin.sedan.visible=false;ruin.syncCuts();
  for(const c of Object.values(CR))hideC(c);for(const a of PEOPLE)a.show(false);SKY.reset();SKY.show(false);town.ash=.22;HM.show(false);
  // (Jamie is gone from the side yard: they came for him, as Reyes swore. The header where it fell)
  if(C.jacket)C.jacket.visible=false;if(C.cap)C.cap.visible=false;C.jamieLying=false;C.jamieHeld=null;C.jamieThrown=null;
  scene.add(beam);beam.position.set(HD.sideDoor.x,HD.sideDoor.y+.9,HD.sideDoor.z);beam.rotation.set(0,-HQ.worldRot+Math.PI/2,.95);if(C.awning){C.awning.visible=true;}}
 // ---- every frame ----------------------------------------------------------------------------------------------------------------------------------------------
 const _p=newPose(),_hp=new THREE.Vector3();
 function update(dt){const ph=S.phase;if(C.afterStreet&&ph!=='g8-surface'&&ph!=='g8-street'){town.update(dt,{camera});return;}if(ph!=='g8-surface'&&ph!=='g8-street'){return;}
  town.update(dt,{camera});SKY.update(dt);
  if(town.EV.across.t>2.5&&!C.acrossLit){C.acrossLit=true;const f=town.PX.across?.at(0,2.4,3.4)||SP(1026,-14,2);light(2,f,{intensity:46,dist:26,color:0xff7a30,flicker:.55});}
  if(town.EV.trench.t>3.5&&!C.trenchLit&&town.FIELD.mainEnd){C.trenchLit=true;}
  for(const c of Object.values(CR)){crUpdate(c,dt);if(c.roof&&c.M.root.visible)c.M.root.position.y=gy(c.M.x,c.M.z)+c.roof;}
  if(C.carThing&&CR.far1.M.root.visible){const cb=k.carB;CR.far1.M.root.position.y=gy(cb.x,cb.z)+1.5;}
  for(const a of PEOPLE)if(a.visible)a.update(dt,{eye:camera.position});
  if(town.shake>0)C.shake=Math.max(C.shake,town.shake*.6);
  if(C.yardRun||town.YARD.stage==='go'&&town.YARD.t<7){const Y=town.YARD,p=me(),L2=locate(p.x,p.z);if(L2&&Y.stage==='go'){const hv=Y.hole(L2.d,L2.lat),dist=Math.hypot(L2.d-1024,L2.lat-11.4);if(hv>.12&&Y.t>4.35+dist/11&&!C.failing)fail('c8-garage','the yard went');}}
  if(HM.root.visible&&C.huntRise!=null){C.huntRise=Math.max(0,C.huntRise-dt*.9);HM.root.position.y-=C.huntRise;}
  if(C.reyesFire&&HM.root.visible){C.fireT=(C.fireT||0)-dt;if(C.fireT<=0){C.fireT=.55+Math.random()*.5;sound('c8Shot',V3(reyes.pos),{gain:1.1});}}
  // Jamie held in its hand, then thrown, then lying where he fell
  if(C.jamieHeld!=null&&C.jamieHeld!==undefined){C.jamieHeld+=dt;}
  if(C.jamieThrown!=null&&C.jamieThrown!==undefined&&C.jamieThrown<1){C.jamieThrown=Math.min(1,C.jamieThrown+dt/.7);}
  }
 function afterActors(dt){if(!C.jamieLying&&C.jamieHeld==null&&(C.jamieThrown==null))return;const g=jamie.person.group;
  if(C.jamieHeld!=null&&HM.root.visible){HM.root.updateMatrixWorld(true);const hp=HM.sockets.grab.getWorldPosition(_hp);const k2=Math.min(1,C.jamieHeld/.45);
   // (by the shoulder, in its hand: his feet dragging on the grass, his body pulled over backward, kicking)
   const x=lerp(jamie.px,hp.x,k2),z=lerp(jamie.pz,hp.z,k2),ground=gy(x,z),y=Math.max(ground-.04,lerp(ground,hp.y-1.12,k2));
   g.position.set(x,y,z);g.rotation.set(clamp((ground+1.12-hp.y)*.8,0,.85)*k2,-(HM.heading+Math.PI),Math.sin(C.t*13)*.18*k2,'YXZ');
   ACT.shake(null,{k:1.4})(jamie.pose,{clock:C.t});jamie.pose[PP.lh+1]+=.25;jamie.pose[PP.rh+1]+=.4;applyPose(jamie.person,jamie.pose);jamie.person.face?.set?.('terrified',{hold:2});return;}
  if(C.jamieThrown!=null&&C.jamieThrown<1){const from=HM.sockets.grab.getWorldPosition(new THREE.Vector3()),to=HD.body,k2=C.jamieThrown;g.position.set(lerp(from.x,to.x,k2),lerp(from.y-1,to.y,k2)+Math.sin(k2*Math.PI)*.6,lerp(from.z,to.z,k2));g.rotation.set(k2*1.2,-jamie.pa,k2*.8);return;}
  if(C.jamieLying){const q=HD.body;g.position.set(q.x,q.y+.02,q.z);g.rotation.set(0,-(HQ.worldRot+.4),0);copyPose(_p,jamie.pose);ACT.still({look:.7})(_p,{clock:C.t});applyPose(jamie.person,_p);jamie.person.face?.set?.('neutral',{hold:9});jamie.person.lids?.forEach(L=>{L.visible=true;L.scale.y=.014;});}}
 function sources(out){const ph=S.phase;if(C.afterStreet&&ph!=='g8-surface'&&ph!=='g8-street'){town.sources(out);return;}if(ph!=='g8-surface'&&ph!=='g8-street')return;town.sources(out);out.push({id:'c8-it-sky',kind:'presence',pos:new THREE.Vector3(BODY.x,BODY.y+20,BODY.z),level:1.2});
  out.push({id:'c8-sirens',kind:'siren',pos:V3(SP(880,-30,4)),level:.5});}
 function blockers(out){for(const a of PEOPLE)if(a.visible)out.push({x:a.x,z:a.z,r:.3,speed:0});for(const c of Object.values(CR))if(c.M.root.visible&&c.mode!=='off')out.push({x:c.M.x,z:c.M.z,r:.45,speed:0});
  if(C.jamieLying)out.push({x:HD.body.x,z:HD.body.z,r:.5,speed:0});}
 function reset(){C.afterStreet=false;town.reset();town.show(false);SKY.reset();SKY.show(false);for(const c of Object.values(CR))hideC(c);for(const a of PEOPLE){a.show(false);a.path=null;a.gest(null);}
  beam.removeFromParent();if(C.awning)C.awning.visible=false;if(C.cap)C.cap.visible=false;if(C.jacket)C.jacket.visible=false;C.acrossLit=false;C.trenchLit=false;C.jamieLying=false;C.jamieHeld=null;C.jamieThrown=null;C.reyesFire=false;ruin.setBlocked(null);}
 const SCENE={'c8-surface':()=>sceneSurface('surface'),'c8-trench':()=>sceneSurface('trench'),'c8-street':()=>sceneSurface('pruitt'),'c8-hendersons':()=>sceneHendersons('arrive'),'c8-garage':()=>sceneHendersons('garage'),'c8-yard':()=>sceneHendersons('yard'),
  'c8-jamie-death':()=>sceneJamieDeath('after'),'c8-flee':()=>sceneFlee('jump')};
 return {SCENE,update,afterActors,sources,blockers,reset,town,SKY,CR,sceneSurface,sceneHendersons,sceneJamieDeath,HD,PEOPLE,after};
}
