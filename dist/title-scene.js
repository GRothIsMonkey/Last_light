// The title screen's backdrop: the end of Oak Hollow Drive at the last of the light, drawn by the game itself
// (the same world, the same sky, the same lamps), with a slow camera, a few cuts, and a few small things that do
// not quite fit. It is a memory of the place, not a scene from the story.
//
// What it touches, and how it gives everything back:
//   * the light (sky, fog, hemisphere, sun, exposure): set after the game's own lighting each frame while the title
//     is up; the game sets all of it again from scratch every frame once play begins;
//   * the camera: placed after the game's own placement each frame; the game places it again every frame;
//   * the ambient neighborhood (lamps, porch lights, fireflies, the tire swing): driven through a context of its own
//     (never the shared one, which the riders and Jamie's mother read); ambient.reset() on exit;
//   * the ending's props (the old bike under the oak, the fifth chalk rider): shown for a moment; ending.reset() on exit;
//   * its own props (the bikes in the grass, a far figure, a far rider): in a group of its own, removed on exit.
// game.js calls exit() before any way out of the title (New Game, Continue, a chapter, DEV), so the story always
// starts from exactly the state it started from before this file existed.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {LOOKOUT} from './layout.js';
import {createBike,poseBike,createPerson,newPose,standPose,ridePose,applyPose} from './rig.js';
import {makeOldBike} from './old-bike.js';
import {CAST} from './cast.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const ease=t=>{t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};

// ---- moods: what the player has lived through changes the evening the title remembers --------------------------
// summer: the Prologue to Chapter Three. Warm, late, all four bikes in the grass.
// search: Chapter Four to Chapter Eight. Later and bluer; one bike is missing; things are seen at the end of the street.
// after:  Chapter Eight finished, or Aftermath I reached. Nearly dark; a low sky with the faintest red in it; two bikes.
export const MOODS={
 summer:{dusk:.66,night:.05,deep:0,storm:0,apoc:0,exposure:0,fog:1,bikes:['player','jamie','sam','alex'],swing:.18,
  events:{flicker:.55,oldBike:.18,rider:.5,figure:.04,bell:.35},fireflies:1},
 search:{dusk:.82,night:.3,deep:.14,storm:.06,apoc:0,exposure:.01,fog:1.08,bikes:['player','jamie','sam'],swing:.32,
  events:{flicker:.7,oldBike:.5,rider:.45,figure:.35,bell:.5},fireflies:.8},
 after:{dusk:.9,night:.58,deep:.3,storm:.16,apoc:.3,exposure:.02,fog:1.18,bikes:['player','sam'],swing:0,bent:'sam',
  events:{flicker:.75,oldBike:.4,rider:.25,figure:.4,bell:.3},fireflies:.25,fifth:true}};

// ---- the shots, in street coordinates: d along Oak Hollow Drive, lat across it (+ toward the oak), h above ground ----
// Each drifts from `from` to `to` over `dur` seconds, looking from `look0` toward `look1`.
export const SHOTS={
 // The oak against the last of the sky, the swing, the bikes dropped in the grass; slowly closer.
 oak:{dur:36,fov:40,from:{d:1136.4,lat:-2.5,h:1.16},to:{d:1141,lat:-1.7,h:1.1},look0:{d:1162,lat:2.3,h:3.5},look1:{d:1162,lat:2.1,h:3.42}},
 // From the grass under the oak, back down the street the way you came: the bikes, the lamps, the long road home.
 street:{dur:32,fov:40,from:{d:1167.2,lat:-1.8,h:1.02},to:{d:1166.5,lat:.1,h:1.04},look0:{d:1085,lat:9.5,h:6.2},look1:{d:1085,lat:8.6,h:6.0}},
 // Down at the chalk on the asphalt: the initials, and the riders someone drew.
 chalk:{dur:22,fov:36,from:{d:1147.55,lat:1.25,h:1.05},to:{d:1147.75,lat:.95,h:1.0},look0:{d:1149.25,lat:.95,h:0},look1:{d:1149.3,lat:1.0,h:0}},
 // Low in the grass among the bikes, the swing beyond.
 grass:{dur:26,fov:46,from:{d:1154.1,lat:3.3,h:.44},to:{d:1154.6,lat:2.6,h:.43},look0:{d:1163,lat:6,h:2.25},look1:{d:1163,lat:5.4,h:2.3}}};
const ORDER={summer:['oak','street','grass'],search:['oak','street','grass','oak','chalk','street'],after:['oak','street','chalk','grass']};

// Where the kids' bikes lie in the grass in front of the oak: [d, lat, yaw relative to the street, which side down].
const BIKE_SPOTS={player:[1155.5,1.3,.55,1],alex:[1157.5,-1.3,-.4,-1],jamie:[1156.7,4.5,-1.9,-1],sam:[1158.9,2.7,2.6,1]};

export function createTitleScene(o){
 const {scene,world,camera,ambient,ending,skyMat,hemi,sunlight,renderer,lightFor}=o;
 const props=new THREE.Group();props.name='title-props';
 const _v=new THREE.Vector3(),_t=new THREE.Vector3(),_c=new THREE.Color(),_q=new THREE.Quaternion();
 const W=(d,lat,h=0)=>{const p=groundPoint(d,lat),y=world.groundY?world.groundY(d,lat):p.y;return new THREE.Vector3(p.x,y+h,p.z);};
 // (a seeded random, so a QA capture of the title is the same every time; the live title varies by the clock)
 let seed=0x51a7e;const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};

 // ---- props ---------------------------------------------------------------------------------------------------
 // The kids' bikes, lying in the grass the way bikes are dropped when everyone runs to the swing.
 const bikes={};
 function layBike(key){if(bikes[key])return bikes[key];const b=createBike(CAST[key].bike),[d,lat,yaw,side]=BIKE_SPOTS[key];
  b.wheel=rnd()*6;b.crankAngle=rnd()*6;b.steerAngle=side*(.35+rnd()*.3);b.kickstand=0;poseBike(b);
  const p=W(d,lat);b.group.position.set(p.x,p.y+.035+(b.geom?.wheelR||.3)*.0,p.z);b.group.rotation.set(0,-(heading(d)+yaw),side*1.43,'YXZ');
  b.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});b.group.name='title-bike-'+key;props.add(b.group);bikes[key]=b;return b;}
 // In the last mood one of them is not lying right: the bars wrenched round, the front wheel folded under.
 function bend(b,on){if(!b)return;if(on){b.steerAngle=1.25;poseBike(b);b.frontWheel.rotation.z=.32;b.frontWheel.scale.set(1,.86,1.06);}else{b.frontWheel.rotation.z=0;b.frontWheel.scale.set(1,1,1);}}
 // A far figure beside an old bike, under the last lamp you can see from the grass. It is there, or it is not.
 let figure=null;
 function makeFigure(){if(figure)return figure;const spec={...CAST.alex,clothes:{...CAST.alex.clothes,shirt:0x47443c,shorts:0x2f3330,shoes:0x24262a}};
  const person=createPerson(spec),pose=newPose(),bike=makeOldBike();standPose(pose,0,{look:0});applyPose(person,pose);bike.kickstand=1;bike.steerAngle=.3;poseBike(bike);
  const g=new THREE.Group();g.name='title-figure';g.add(person.group);g.add(bike.group);bike.group.position.set(.62,0,.15);bike.group.rotation.set(0,.2,-.16,'YXZ');
  person.group.traverse(m=>{if(m.isMesh)m.castShadow=true;});g.visible=false;props.add(g);figure={g,person,pose,bike};return figure;}
 // A kid riding across the far end of the street, the way somebody always was at that hour.
 let rider=null;
 function makeRider(){if(rider)return rider;const c=CAST.alex,bike=createBike(c.bike),person=createPerson(c),pose=newPose();bike.group.add(person.group);bike.group.name='title-rider';
  bike.group.traverse(m=>{if(m.isMesh)m.castShadow=true;});bike.group.visible=false;props.add(bike.group);rider={bike,person,pose,crank:0,t:-1,from:null,to:null,dur:7};return rider;}

 // ---- state ---------------------------------------------------------------------------------------------------
 let active=false,moodKey='summer',M=MOODS.summer,order=ORDER.summer,shotIndex=0,shot=SHOTS.oak,shotT=0,shotStarted=false,time=0,fade=0,reduce=false;
 const pointer={x:0,y:0,sx:0,sy:0};let lookout=null,farLamp=null,timers=[],flick=null,handlers={},flies=null;
 const ctx2={distance:1140,speed:0,lateral:0,state:'intro',clock:0,eye:new THREE.Vector3(),p:.66,night:0,finale:1,deep:0};
 const emit=(name,data)=>{try{handlers[name]?.(data);}catch{}};
 function lampNear(p,skip){let best=null,bd=1e9;for(const l of ambient.lamps?.()||[]){if(l.at===undefined||l.i===skip)continue;const d=Math.hypot(l.at.x-p.x,l.at.z-p.z);if(d<bd){bd=d;best=l;}}return best;}
 function schedule(at,fn){timers.push({at:time+at,fn});}

 function setMood(key){moodKey=MOODS[key]?key:'summer';M=MOODS[moodKey];order=ORDER[moodKey];
  for(const [k,b] of Object.entries(bikes)){b.group.visible=M.bikes.includes(k);bend(b,false);}
  for(const k of M.bikes)layBike(k).group.visible=true;bend(bikes[M.bent],!!M.bent);
  if(ending?.fifth)ending.fifth.visible=!!M.fifth&&active;}

 function enter(key=moodKey,{shotName=null}={}){
  if(!props.parent)scene.add(props);active=true;time=0;timers=[];flick=null;
  setMood(key);
  // (the lamp that stands over the lookout, and the farthest one you can see back down the street)
  lookout=lampNear(W(LOOKOUT.oak.d,LOOKOUT.oak.lat));farLamp=lampNear(W(1092,-5.5),lookout?.i);
  ambient.skipTo?.(1140);ambient.lampOverride?.clear?.();
  if(M.swing)ambient.pushSwing?.({d:LOOKOUT.swing.d-1,lat:LOOKOUT.swing.lat+M.swing*2});
  shotIndex=Math.max(0,order.indexOf(shotName||order[0]));cut(shotIndex,true);
  planEvents();}

 function exit(){if(!active)return;active=false;scene.remove(props);timers=[];flick=null;
  if(figure)figure.g.visible=false;if(rider){rider.bike.group.visible=false;rider.t=-1;}
  ambient.lampOverride?.clear?.();ambient.reset?.();ending?.reset?.();
  if(camera.fov!==64){camera.fov=64;camera.updateProjectionMatrix();}emit('exit');}

 // ---- shots and cuts --------------------------------------------------------------------------------------------
 function cut(i,first=false){shotIndex=(i+order.length)%order.length;shot=SHOTS[order[shotIndex]];shotT=0;shotStarted=false;
  if(!first){emit('cut',{shot:order[shotIndex]});
   // Something can be under the oak that was not there a moment ago (the one bike from the prologue's last minute).
   if(ending?.otherBike)ending.otherBike.visible=rnd()<M.events.oldBike;
   if(figure&&order[shotIndex]!=='street')figure.g.visible=false;}}
 function planEvents(){
  // A lamp that stutters and comes back (the title's "Light" stutters with it): first one early, then now and then.
  schedule(9+rnd()*6,function flickLoop(){if(rnd()<M.events.flicker)startFlicker(lookout);schedule(28+rnd()*34,flickLoop);});
  // A far bell, twice: nobody there.
  schedule(20+rnd()*20,function bellLoop(){if(rnd()<M.events.bell)emit('bell',{far:true,pan:rnd()*1.4-.7,twice:rnd()<.6});schedule(40+rnd()*50,bellLoop);});}
 function startFlicker(l,{gone=null}={}){if(!l||flick||reduce)return;
  // on/off pattern (seconds, level); the last step leaves it on (or, for the far lamp with the figure, off a while).
  const steps=[[.0,.12],[.07,1],[.16,.05],[.3,.9],[.36,0],[.62,.0],[.7,1]];flick={l,t:0,steps,gone};emit('flicker',{lamp:l.i,steps,lookout:l===lookout});}
 function updateFlicker(dt){if(!flick)return;flick.t+=dt;let lv=1;for(const [at,v] of flick.steps)if(flick.t>=at)lv=v;
  ambient.lampOverride?.set?.(flick.l.i,lv);
  if(flick.gone&&flick.t>=.36&&figure?.g.visible){figure.g.visible=false;emit('gone');}
  if(flick.t>flick.steps[flick.steps.length-1][0]+.05){ambient.lampOverride?.delete?.(flick.l.i);flick=null;}}

 // The street shot's two things at the far end: a rider crossing, or someone standing by the far lamp.
 function onShotStart(name){if(name!=='street')return;
  const r=rnd();
  if(r<M.events.figure&&farLamp){const f=makeFigure(),d=(farLamp.d??1094)+.4,lat=farLamp.lat!==undefined?farLamp.lat+(farLamp.lat>0?-1.4:1.4):-4.6,p=W(d,lat);
   f.g.position.set(p.x,p.y,p.z);_v.copy(camera.position).sub(p);f.g.rotation.set(0,Math.atan2(_v.x,_v.z),0);f.g.visible=true;emit('figure');
   schedule(9+rnd()*5,()=>{if(active&&figure.g.visible)startFlicker(farLamp,{gone:true});});}
  else if(r<M.events.figure+M.events.rider){const R=makeRider(),d=1062+rnd()*10,dir=rnd()<.5?1:-1;R.from=W(d,-10*dir);R.to=W(d+5,12*dir);R.t=0;R.dur=7.5+rnd()*2;R.bike.group.visible=true;
   schedule(R.dur*.42,()=>emit('bell',{far:true,pan:-dir*.35,twice:true,rider:true}));}}
 function updateRider(dt){const R=rider;if(!R||R.t<0)return;R.t+=dt;const u=R.t/R.dur;if(u>=1){R.t=-1;R.bike.group.visible=false;return;}
  const p=_v.copy(R.from).lerp(R.to,u),fx=R.to.x-R.from.x,fz=R.to.z-R.from.z;R.bike.group.position.copy(p);R.bike.group.rotation.set(0,Math.atan2(-fx,-fz),0,'YXZ');
  R.crank+=dt*4.4;R.bike.crankAngle=R.crank;R.bike.wheel+=dt*4.5/(R.bike.geom?.wheelR||.31);R.bike.steerAngle=0;poseBike(R.bike);
  ridePose(R.pose,R.crank,{geom:R.bike.geom,posture:CAST.alex.build.posture,look:.25});applyPose(R.person,R.pose);}

 // ---- each frame ------------------------------------------------------------------------------------------------
 function update(dt){if(!active)return;time+=dt;shotT+=dt;ctx2.clock=time;
  for(const t of timers.slice())if(time>=t.at){timers.splice(timers.indexOf(t),1);t.fn();}
  if(shotT>=shot.dur)cut(shotIndex+1);
  if(!shotStarted){shotStarted=true;onShotStart(order[shotIndex]);}
  updateFlicker(dt);updateRider(dt);
  // a dip to black around each cut (the menu draws it: the title's own fade layer)
  const out=smooth((shotT-(shot.dur-1.1))/1.1),inn=1-smooth(shotT/1.4);fade=Math.max(out,inn*(time<2?0:1));
  pointer.sx+=(pointer.x-pointer.sx)*(1-Math.exp(-dt*1.6));pointer.sy+=(pointer.y-pointer.sy)*(1-Math.exp(-dt*1.6));}

 // The light: a fixed moment of the evening for each mood (after the game's own lighting, which it replaces).
 const SUN=[44,0,-85];
 function light(){if(!active)return;const L=M,p=L.dusk,n=L.night,deep=L.deep,at=W(1150,2);
  SUN[1]=30-p*21;lightFor({dusk:p,night:n,day:0},at,SUN);
  if(deep>0){hemi.intensity*=1-.26*deep;scene.fog.color.lerp(_c.set(0x2c3650),deep*.6);hemi.groundColor.lerp(_c.set(0x272a38),deep*.5);sunlight.intensity*=1-deep;}
  scene.fog.density=(.0058+p*.004+n*.001+deep*.0015)*L.fog;
  skyMat.uniforms.storm.value=L.storm;skyMat.uniforms.flash.value=0;skyMat.uniforms.apoc.value=L.apoc;
  if(L.apoc>0){skyMat.uniforms.apocT.value=time*.5;skyMat.uniforms.apocDir.value.set(-.25,.02,1).normalize();// (low, behind the way home: never over the oak)
   scene.fog.color.lerp(_c.set(0x3a2228),.16*smooth(L.apoc/.4));}
  renderer.toneMappingExposure=1.10-p*.06-n*.06-deep*.06+L.exposure;}

 // The camera: the shot's drift, a breath of a hand holding it, and the pointer leaning the view a little.
 function place(){if(!active)return;const s=shot,u=ease(shotT/s.dur);
  const a=s.from,b=s.to,d=a.d+(b.d-a.d)*u,lat=a.lat+(b.lat-a.lat)*u,h=a.h+(b.h-a.h)*u;
  const la=s.look0,lb=s.look1,ld=la.d+(lb.d-la.d)*u,ll=la.lat+(lb.lat-la.lat)*u,lh=la.h+(lb.h-la.h)*u;
  const eye=W(d,lat,h),tgt=W(ld,ll,lh);
  if(!reduce){const t=time;eye.x+=Math.sin(t*.31)*.012+Math.sin(t*.77)*.004;eye.y+=Math.sin(t*.43+1)*.009+Math.sin(t*1.13)*.003;eye.z+=Math.sin(t*.27+2)*.01;
   // parallax: the view leans toward the pointer (a few centimetres, a fraction of a degree)
   _v.subVectors(tgt,eye).normalize();_t.set(-_v.z,0,_v.x);eye.addScaledVector(_t,pointer.sx*.05);eye.y+=-pointer.sy*.025;tgt.addScaledVector(_t,pointer.sx*.6);tgt.y+=-pointer.sy*.35;}
  camera.position.copy(eye);camera.up.set(0,1,0);camera.lookAt(tgt);
  if(!reduce){_q.setFromAxisAngle(_v.set(0,0,1),Math.sin(time*.21)*.004);camera.quaternion.multiply(_q);}
  if(Math.abs(camera.fov-s.fov)>.01){camera.fov=s.fov;camera.updateProjectionMatrix();}
  camera.updateMatrixWorld();ctx2.eye.copy(camera.position);}

 // What the neighborhood should believe: the end of the street, the lamps on, the evening of this mood.
 function ambientCtx(){ctx2.p=M.dusk;ctx2.night=M.night;ctx2.deep=M.deep;ctx2.finale=1;ctx2.distance=1140;return ctx2;}
 // (fireflies: the ambient's own, found once by their material; fewer of them in the later moods)
 function afterAmbient(){if(!active)return;if(flies===null)flies=scene.children.find(c=>c.isPoints&&c.material?.uniforms?.uAmount&&c.material.uniforms.uTime)||false;
  if(flies)flies.material.uniforms.uAmount.value*=M.fireflies;}

 // QA / DEV: hold one shot at one moment (for captures), or change the mood.
 function preview({mood=null,shot:name=null,t=null}={}){if(mood&&mood!==moodKey){setMood(mood);}if(name&&SHOTS[name]){const i=order.indexOf(name);if(i>=0)shotIndex=i;else{order=[...order,name];shotIndex=order.length-1;}shot=SHOTS[name];}if(t!==null)shotT=clamp(t,0,shot.dur);fade=0;}

 return {enter,exit,update,light,place,ambientCtx,afterAmbient,preview,setMood,
  on(name,fn){handlers[name]=fn;},
  pointer(x,y){pointer.x=clamp(x,-1,1);pointer.y=clamp(y,-1,1);},
  set reduceMotion(v){reduce=!!v;},get reduceMotion(){return reduce;},
  get active(){return active;},get mood(){return moodKey;},get fade(){return active?fade:0;},get shot(){return order[shotIndex];},get time(){return time;},
  get state(){return {active,mood:moodKey,shot:order[shotIndex],shotT:+shotT.toFixed(2),fade:+fade.toFixed(3),figure:!!figure?.g.visible,rider:!!(rider&&rider.t>=0),oldBike:!!ending?.otherBike?.visible,flicker:!!flick,bikes:Object.entries(bikes).filter(([,b])=>b.group.visible).map(([k])=>k)};},
  props,bikes,SHOTS,MOODS};
}
