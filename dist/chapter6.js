// Chapter Six: Someone Was Here. The next day, Thursday, August 25, 2011: the morning in Oak Hollow, and the afternoon,
// in a thunderstorm, at the Mill Creek isolation works.
//
//  Morning: your room, a little before nine. The mower down the street, the radio in the kitchen, Alex's camera on your desk
//           where you left it, and on it the picture from the trees. The phone: Sam. His dad knows; he has called Alex's
//           dad and Officer Reyes; nine-thirty, everyone, with whatever they found. And at two in the morning Jamie called
//           him from his back yard ("Sam, come to the window"), and Jamie was asleep at home.
//  Sam's:   the garage, the card table. Sam's dad; Alex's dad; Officer Reyes (Sunday night's officer, the one who said
//           "Okay."). The shirt on the table, and Alex's dad's hands. Reyes bags it. The pictures, the register, the one
//           from the trees, and in it, up the bank behind them, something nobody remembers. Reyes takes the camera to
//           copy it. Jamie tells them about Jamie. Reyes: what can be done today, and the rest written down. The county to
//           the camp; Alex's dad with them; the boys to show Reyes where it began.
//  Streets: the oak, the three of them ("It looked at me like I was the one who wasn't supposed to be there."); Jamie's
//           house, the door left open, and on the stairs inside, Jamie; the creek at Briarwood with Reyes, his questions,
//           the dog that would not go past the culvert. The storm coming.
//  Records: Sam's garage at two: the weather radio, the camera back, the township's drainage plan and the old files.
//           Mill Street in sixty-six, Mill Street in ninety-one, Briarwood now: Line Two and Line Four, and where they meet.
//           A kid's helmet in the works' bar screen yesterday morning. Reyes takes them, to say if it's his.
//  The works: Brandt; the helmet (17); the log (2B open in ninety-one, the lock gone); the gallery, and Reyes's voice on
//           the radio twice, the second time from behind them; the junction chamber; Line Two, the bell, and Alex up the
//           pipe, who runs at the grille. The power. The gate coming down; Sam's hands on the brake; under it; the pin
//           that won't go in. A light at the far end of the chamber and, under it, Sam. Both of them. Reyes sees both.
//           It runs. The gate comes down. Sam is on the other side, and then he isn't anywhere.
//  After:   the bank, the manhole, the black water. Two hours later: the yard full of lights, Jamie with a blanket, Sam's
//           dad. "I saw them both." Reyes's radio: "…I've got it."
//
// Nothing here explains anything. Every event has a fallback in time; nothing turns the player's view for them. chapter5.js
// hands this file every phase that starts c6-, d6-, e6- or n6-. Places: chapter6-home.js (your room), Sam's garage
// (chapter5-garage.js's own), chapter6-works.js; people: chapter6-cast.js; things: chapter6-props.js; weather: chapter6-storm.js.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {P as PI,createPerson,newPose,sitPose,applyPose} from './rig.js';
import {CAST} from './cast.js';
import {createFace} from './faces.js';
import {chapter5Appearance} from './chapter5-models.js';
import {SPOT as PSPOT,SOLIDS,PW,heightAt as pineHeight,hd} from './pine-plan.js';
import {registerPageArt,searchMapArt} from './pine-art.js';
import {createCompanionBrain} from './companion-brain.js';
import {createInventory} from './inventory.js';
import {LOOKOUT} from './layout.js';
import {makeCameraModel} from './alex-camera.js';
import {dressCamera,clothShirt} from './chapter5-props.js';
import {createHome} from './chapter6-home.js';
import {createWorks,SPOT as WS,GATE,MANHOLE,FLOOR} from './chapter6-works.js';
import {createCast6,rescueTruck} from './chapter6-cast.js';
import {createProps6} from './chapter6-props.js';
import {createStorm} from './chapter6-storm.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// QA jumps and DEV scenes, in story order (each starts a little before its moment).
export const SECTIONS6=['chapter6-start','c6-room','c6-camera','c6-phone','c6-ride','c6-meeting','c6-shirt','c6-photos','c6-plan','c6-oak','c6-street','c6-anomaly','c6-creek',
 'c6-records','c6-map','c6-works','c6-gatehouse','c6-gallery','c6-radio','c6-lower','c6-grille','c6-grate-scare','c6-emergency','c6-hold','c6-pin','c6-double','c6-sealed',
 'c6-rescue','c6-manhole','c6-aftermath','c6-testimony','chapter6-end'];
export const ALIAS6={'c6-start':'chapter6-start','c6-morning':'c6-room','c6-call':'c6-phone','c6-adults':'c6-meeting','c6-evidence':'c6-shirt','c6-camera-review':'c6-photos',
 'c6-friends':'c6-oak','c6-neighborhood':'c6-street','c6-jamie-house':'c6-anomaly','c6-briarwood':'c6-creek','c6-drainage':'c6-records','c6-entry':'c6-works','c6-helmet':'c6-gatehouse',
 'c6-grate':'c6-grate-scare','c6-storm':'c6-emergency','c6-gate':'c6-hold','c6-release':'c6-pin','c6-duplicate':'c6-double','c6-disappearance':'c6-sealed','c6-search':'c6-rescue',
 'c6-reyes':'c6-testimony','c6-end':'chapter6-end'};
// Checkpoints (silent; Continue on the title comes back here).
export const LABEL6={'chapter6-start':'The morning after','c6-phone':'Sam calls','c6-ride':'Oak Hollow, morning','c6-meeting':'Sam’s garage','c6-oak':'The old oak','c6-creek':'Briarwood',
 'c6-records':'The plan','c6-works':'The Mill Creek works','c6-gallery':'The gallery','c6-grille':'Line Two','c6-emergency':'The water','c6-hold':'The gate','c6-sealed':'Sam',
 'c6-aftermath':'Later','chapter6-end':'Someone was here'};
const PHASES=['c6-black','d6-room','d6-phone','d6-ride','d6-meet','d6-oak','d6-street','d6-jamie','d6-creek','e6-garage','e6-yard','e6-house','e6-gallery','e6-lower','e6-grille',
 'n6-flood','n6-hold','n6-double','n6-sealed','n6-rescue','n6-after','n6-end'];
// (Thursday: up at 8:41, the phone at ten to nine, Sam's at a quarter past, the oak at ten, Briarwood at a quarter to eleven; the
// garage again a little after two, the works at half past three, the water at twenty past four, the yard a little before eight)
const HOUR={start:8.68,phone:8.84,ride:9.02,meet:9.22,oak:10.08,jamie:10.42,creek:10.72,records:14.15,works:15.52,flood:16.32,after:19.9};
const fmt=h=>{const H=Math.floor(h),M=Math.floor((h-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};
const FIRE_TIME='6:45PM';// (the campfire picture: the time of the rest at the fire, as Chapter Five's own scenes stamp it)

export function createChapter6(o,k,{chapter2:ch2,chapter3:ch3,chapter4:ch4,chapter5:ch5}){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam}=k,A=k.api,T=o.tension,police=k.police;
 const me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go,main=k.main,side=k.side;
 const reyes=k.officer2,dad=k.dad,officer=k.officer,photo=ch4.photo,phys=ch5.phys,G5=ch5.G5;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL6);
 const A6={};
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos,opts);}
 const home=createHome({scene,world,camera,shoot:o.shoot});
 const works=createWorks({scene,camera,sfx:(n,p,op)=>sound(n,p,op),car:world.car});
 const cast=createCast6({scene,nav,camera});const {samDad,brandt,AX,SAM2,JAMIE2}=cast;
 const props=createProps6();
 const storm=createStorm({scene,camera,sfx:(n,p,op)=>sound(n,p,op)});
 const car3=police.makeCar('works-third');const rescue=rescueTruck();works.root.add(rescue.g);rescue.g.visible=false;
 const brain=createCompanionBrain({nav,comp});
 function minds(){brain.reset();for(const c of [jamie,sam])brain.enable(c,true);C.mindKey=null;}
 // ---- places -------------------------------------------------------------------------------------------------------------
 const gy=(x,z)=>nav.groundY(x,z);
 const at=q=>Array.isArray(q)?{x:q[0],z:q[1],y:gy(q[0],q[1])}:q;
 const near=(q,r,p=me())=>{const w=at(q);return Math.hypot(p.x-w.x,p.z-w.z)<r;};
 const dist2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const date=h=>o.setDate(`AUGUST 25, 2011 <i></i> ${fmt(h)}`);
 const WP=(x,z,y=null)=>{const w=works.local(x,z);return {x:w.x,z:w.z,y:y??gy(w.x,w.z)};};// a point at the works (its own metres)
 const WPa=a=>WP(a[0],a[1]);
 const inWorks=(p=me())=>works.nav.inside(p.x,p.z);
 const zone=(p=me())=>inWorks(p)?works.zoneAt(p.x,p.z,0):null;
 // Sam's house and garage (the frame Chapter Five's garage scene uses); Jamie's house; Briarwood
 const SH=world.homes.sam,SHW=(x,z,y=0)=>{const p=SH.toWorld(x,z);return {x:p.x,z:p.z,y:p.ground+y};},gxS=SH.gx??(SH.w*.32),gzS=SH.gfront??SH.front;
 const drive=(x,z)=>SHW(gxS+x,gzS+z),driveA=(x,z)=>{const a=drive(x,z),b=drive(x,z+5);return headingTo(a.x,a.z,b.x,b.z);};
 const JH=world.homes.jamie,JHW=(x,z)=>{const p=JH.toWorld(x,z);return {x:p.x,z:p.z,y:p.ground};};
 const JDOOR=JHW(JH.doorX,JH.front+.2),JSTEP=JHW(JH.doorX,JH.stepFront+.5),JFOYER=JHW(JH.doorX-JH.gs*.25,JH.front-1.9),JDRIVE=JHW(JH.gx,JH.gfront+6.5),JBIKE=JHW(JH.gx-.6,JH.gfront+5.2);
 const BW={corner:side(16,-2.4),creek:side(99.4,6.2),car:side(110,-3),reyes:side(100.6,6.9),stop:side(84,3),gap:side(100.2,31)};
 const LOOK={oak:main(LOOKOUT.oak.d,LOOKOUT.oak.lat),bench:main(LOOKOUT.bench.d,LOOKOUT.bench.lat),chalk:main(LOOKOUT.chalk.d,LOOKOUT.chalk.lat),stop:main(LOOKOUT.stop.d,LOOKOUT.stop.lat)};
 // ---- props of the morning: the shirt in Sam's bag, the camera in Reyes's hand ------------------------------------------------
 const shirt=new THREE.Group();shirt.name='c6-alex-shirt';clothShirt(shirt);const SHIRT=phys.prop('c6-shirt',shirt,{grip:{p:[0,.12,.03],r:[0,0,0]}});SHIRT.hide();
 const camHand=dressCamera(makeCameraModel()).group;camHand.name='camera-with-reyes';camHand.visible=false;reyes.person.parts.rhand.add(camHand);camHand.position.set(0,.05,.03);camHand.rotation.set(-1.1,0,0);
 const radioHand=props.radioMesh(0x3a3c3a);radioHand.visible=false;sam.person.parts.rhand.add(radioHand);radioHand.position.set(0,.06,.03);radioHand.rotation.set(-.4,0,0);
 const reyesRadio=props.radioMesh(0x1e1f22);reyes.person.parts.torso?.add(reyesRadio);reyesRadio.scale.setScalar(.9);reyesRadio.position.set(-.1,.12,-.11);reyesRadio.rotation.set(0,0,-.3);reyesRadio.visible=false;
 const bagHand=props.bag;bagHand.visible=false;scene.add(bagHand);
 const PIN=phys.prop('c6-pin',works.pin,{grip:{p:[0,.05,.02],r:[0,Math.PI/2,0]}});
 const helmetP=phys.prop('c6-helmet',props.helmet,{grip:{p:[0,.08,.04],r:[0,0,0]}});helmetP.hide();
 const planP=phys.prop('c6-plan',props.plan,{grip:{p:[0,.05,.03],r:[0,0,Math.PI/2]}});planP.hide();
 const folderP=phys.prop('c6-folder',props.folder,{grip:{p:[0,.04,.03],r:[0,0,0]}});folderP.hide();
 const wxRadio=props.wxRadio;wxRadio.visible=false;scene.add(wxRadio);
 const lightsYellow=[0,1,2].map(i=>{const m=props.radioMesh(0xc9a227);m.visible=false;return m;});void lightsYellow;
 // ---- the campfire picture, again: the three of them at the fire, from the trees (and up the bank behind them) ------------------
 const FIRE=PSPOT.campfire,SEATS=SOLIDS.filter(q=>q.kind==='log').map(q=>{const de=FIRE[0]-q.c[0],dn=FIRE[1]-q.c[1],l=Math.hypot(de,dn)||1;return {seat:q.c,face:hd(de,dn),front:[q.c[0]+de/l*.8,q.c[1]+dn/l*.8]};});
 const studio=['player','jamie','sam'].map(key=>{const p=createPerson({...CAST[key],expressive:true});p.group.visible=false;p.group.name='studio-'+key;scene.add(p.group);const f=createFace(p,CAST[key]);p.face=f;chapter5Appearance(p,CAST[key]).enable(true);f.update(1/30,{clock:0});/* (a face is built on its first update; until then its mouth has no shape) */return p;});
 const shade=createPerson({...CAST.alex,clothes:{...CAST.alex.clothes,shirt:0x2a2622,trim:0x2a2622,pants:0x1e1c1a,socks:0x1e1c1a,shoes:0x161412}});shade.group.visible=false;shade.group.name='studio-up-the-bank';scene.add(shade.group);
 const FIREPIC={canvas:null,sil:{x:.7,y:.45},rendered:false};
 function fireCam(){const a=SEATS[3].face+Math.PI,f=PW(...FIRE),back=PW(FIRE[0]+Math.sin(a)*12,FIRE[1]+Math.cos(a)*12),cam=new THREE.PerspectiveCamera(48,640/480,.1,300);cam.position.set(back.x,pineHeight(back.x,back.z)+1.55,back.z);cam.lookAt(f.x,pineHeight(f.x,f.z)+.6,f.z);cam.updateMatrixWorld();return {cam,a};}
 function silAt(){const {a}=fireCam(),d=20,e=FIRE[0]-Math.sin(a)*d+Math.cos(a)*2.4,n=FIRE[1]-Math.cos(a)*d-Math.sin(a)*2.4,w=PW(e,n);return {x:w.x,z:w.z,y:pineHeight(w.x,w.z)};}
 function firePicture(){if(FIREPIC.canvas)return FIREPIC;const cv=(()=>{try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=640;c.height=480;return {c,g};}catch{return null;}})();FIREPIC.canvas=cv;
  const {cam}=fireCam(),s=silAt();
  {const v=new THREE.Vector3(s.x,s.y+1.2,s.z).project(cam);FIREPIC.sil={x:clamp((v.x+1)/2,.05,.95),y:clamp((1-v.y)/2,.05,.95)};}
  try{if(o.shoot&&o.readPixels&&cv&&typeof THREE.WebGLRenderTarget==='function'){const pose=newPose();
    studio.forEach((p,i)=>{const S0=SEATS[[0,2,4][i]],w=PW(...S0.seat);p.group.position.set(w.x,pineHeight(w.x,w.z),w.z);p.group.rotation.set(0,-S0.face,0);sitPose(pose,{seat:.43,legs:'bent',t:i,look:i===1?.3:i===2?-.25:0});applyPose(p,pose);p.group.visible=true;});
    shade.group.position.set(s.x,s.y,s.z);shade.group.rotation.set(0,-headingTo(s.x,s.z,cam.position.x,cam.position.z),0);applyPose(shade,newPose());shade.group.visible=true;
    const rt=new THREE.WebGLRenderTarget(640,480,{colorSpace:THREE.SRGBColorSpace});const f=PW(...FIRE);
    if(o.shoot({cam,target:rt,preset:{day:.52,dusk:.38,night:0},sun:[-60,16,35],at:{x:f.x,y:pineHeight(f.x,f.z),z:f.z}})){const px=o.readPixels(rt,640,480);if(px){photo.toCanvas(cv,px,{blur:true});FIREPIC.rendered=true;}}rt.dispose?.();}}catch{}
  for(const p of studio)p.group.visible=false;shade.group.visible=false;
  if(!FIREPIC.rendered&&cv)fireSketch(cv.g,640,480);return FIREPIC;}
 function fireSketch(g,w,h){const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#d8a058');sky.addColorStop(.5,'#b06a38');sky.addColorStop(1,'#2a1e16');g.fillStyle=sky;g.fillRect(0,0,w,h);
  g.fillStyle='#4a5a6a';g.fillRect(0,h*.46,w,h*.08);g.fillStyle='#3a2a1c';g.fillRect(0,h*.54,w,h*.46);g.fillStyle='#2a2018';g.beginPath();g.ellipse(w*.52,h*.72,w*.11,h*.035,0,0,7);g.fill();
  const kid=(x,c,cap)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,h*.66,w*.03,h*.06,0,0,7);g.fill();g.fillStyle='#2a1c14';g.beginPath();g.arc(x,h*.585,w*.022,0,7);g.fill();if(cap){g.fillStyle=cap;g.fillRect(x-w*.024,h*.565,w*.048,h*.016);}};
  kid(w*.38,'#c8743f','#2d4a7a');kid(w*.52,'#5a6070',null);kid(w*.66,'#6d9a8a',null);
  const s=FIREPIC.sil;g.fillStyle='rgba(14,11,9,.92)';g.beginPath();g.ellipse(w*s.x,h*(s.y+.03),w*.009,h*.03,0,0,7);g.fill();g.beginPath();g.arc(w*s.x,h*(s.y-.012),w*.0065,0,7);g.fill();
  for(const [x,ww] of [[.03,.06],[.16,.04],[.84,.05],[.95,.07]]){g.fillStyle='#120e0a';g.fillRect(w*x,0,w*ww,h);}g.fillStyle='rgba(10,8,6,.35)';g.fillRect(0,0,w,h);}
 // A picture of a page (the register, the search map) as the camera took it on the office counter
 function pagePicture(g,w,h,kind){g.fillStyle='#2a2420';g.fillRect(0,0,w,h);g.save();g.translate(w/2,h/2);g.rotate(-.04);
  const cv=(()=>{try{const c=document.createElement('canvas');const x=c.getContext?.('2d');if(!x)return null;c.width=1024;c.height=730;return {c,g:x};}catch{return null;}})();
  if(cv){try{if(kind==='register')registerPageArt(cv.g,1024,730,3);else searchMapArt(cv.g,1024,730);}catch{}g.drawImage(cv.c,-w*.42,-h*.4,w*.84,h*.8);}g.restore();
  const v=g.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,h*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(0,0,w,h);}
 // What is on Alex's camera this morning: his own pictures, the television's (Chapter Four), the register and the map
 // (yesterday, at the office), and the one from the trees.
 function cameraPictures(){ch4.ensureLead();const has=id=>photo.photos.findIndex(p=>p.id===id);
  if(has('c5-register3')<0)photo.capture({id:'c5-register3',date:'08/24/2011',time:'5:52PM',label:'REGISTER',source:(g,w,h)=>pagePicture(g,w,h,'register')});
  if(has('c5-searchmap')<0)photo.capture({id:'c5-searchmap',date:'08/24/2011',time:'5:58PM',label:'SEARCHMAP',source:(g,w,h)=>pagePicture(g,w,h,'map')});
  if(has('c5-campfire')<0){const F=firePicture();photo.capture({id:'c5-campfire',date:'08/24/2011',time:FIRE_TIME,label:'',source:(g,w,h)=>{if(F.canvas)g.drawImage(F.canvas.c,0,0,w,h);else fireSketch(g,w,h);}});}
  photo.V.shutter=0;C.pics={register:has('c5-register3'),map:has('c5-searchmap'),fire:has('c5-campfire'),lead:ch4.leadIndex()};}
 // Is the shape up the bank in what the screen shows, magnified enough to make out?
 function silInView(){const V=photo.V;if(!photo.current||photo.current.id!=='c5-campfire'||V.zoom<1.8)return false;const z=V.zoom,sw=1/z,sx=clamp(V.px-sw/2,0,1-sw),sy=clamp(V.py-sw/2,0,1-sw),b=FIREPIC.sil;
  return b.x>sx+sw*.12&&b.x<sx+sw*.88&&b.y>sy+sw*.12&&b.y<sy+sw*.88;}
 // ---- state ---------------------------------------------------------------------------------------------------------------
 const C={};
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,h:HOUR.start,flags:{},timers:[],cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,match:false,want:null,wantT:0,
  spot:{jamie:null,sam:null},view:null,lookKind:null,minute:-1,sounds:{},amb:{traffic:.5,insects:.5,wind:.6,life:1,forest:0,tunnel:0,water:0},storm:0,stormTo:0,rain:0,rainTo:0,
  inv:{camera:null,shirt:'sam',helmet:null,radio:false,flashlight:false,pin:null,plan:false,file:false},seen:new Set(),looked:new Set(),pics:{},beat:{},anom:null,meet:null,rec:null,wk:null,fl:null,af:null});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL6[id]);};
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why)T?.note?.(why);};
 const mine=ph=>typeof ph==='string'&&/^(c6|d6|e6|n6)-/.test(ph);
 const owns=mine;
 const handles=sec=>SECTIONS6.includes(sec)||!!ALIAS6[sec];
 function card(on,{title='Chapter Six',eyebrow='LAST LIGHT',sub=''}={}){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2'),s=el.querySelector?.('.card-sub');if(e)e.textContent=eyebrow;if(h)h.textContent=title;if(s)s.innerHTML=sub;el.classList.add('on');}else{el.classList.remove('on');const s=el.querySelector?.('.card-sub');if(s)s.innerHTML='';}C.cardOn=on;}
 // a line: by (who's speaking, for the face and the head), face (the speaker's expression), faces (the listeners')
 const by=l=>{if(l.text===undefined&&!l.face&&!l.faces)return l;const from=l.by==='jamie'?jamie:l.by==='sam'?sam:l.from,act0=l.act;
  const act=(l.face||l.faces)?()=>{if(l.face&&from?.person?.face)from.person.face.set(l.face,{hold:Math.max(3,(l.time||2)+1.5)});if(l.faces)for(const [kk,f] of Object.entries(l.faces)){const c=kk==='jamie'?jamie:sam;c.person.face?.set(f,{hold:4});}act0?.();}:act0;
  if(l.text===undefined)return {...l,act};return {...l,from,act,time:l.time??Math.max(1.4,(typeof l.text==='function'?'a line of about this long':l.text).replace(/[“”]/g,'').length*.056)};};
 function say(lines,opts){talk(lines.map(by),opts);}
 const face=(c,f,hold=4)=>c.person.face?.set(f,{hold});
 // ---- poses: a closer look, lying in bed --------------------------------------------------------------------------------------
 function pose(q,{y,pitch=0,yaw=null,look=null}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false,fx:p.x,fz:p.z};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/(P2.slow||1.1));if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 function closeLook(target,{back=.62,eye=1.42,floor=null,kind=null,dur=null}={}){const p=me(),a=headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
  const dy=target.y-(fy+eye),pitch=Math.atan2(dy,back);pose(q,{y:fy+eye,yaw:a,pitch});C.view='look';C.lookKind=kind;C.lookAt=target;C.lookT=0;C.lookDur=dur;}
 function endLook(){if(C.view!=='look')return;C.view=null;C.lookKind=null;unpose();}
 // ---- Jamie and Sam (Chapter Five's ways: they ride when you ride, walk when you walk, stand where a scene asks) ------------
 function follow(on){C.match=on;}
 function match(dt){if(!C.match)return;const p=me(),want=p.riding?'ride':'walk';C.wantT=C.want===want?C.wantT+dt:0;C.want=want;
  for(const c of [jamie,sam]){if(c.script||!c.active||c.gone)continue;
   if(C.spot[c.key]){if(want==='walk'&&c.mode==='ride'&&C.wantT>=1)comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)]);continue;}
   if(want==='ride'){if(c.mode==='ride'){c.follow='ride';continue;}if(C.wantT<.8||C.flags.noBikes)continue;
    const fb=Math.hypot(c.bx-c.px,c.bz-c.pz);if(c.bike.group.visible&&fb<45){const s2={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2);
     comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:1.8}),comp.steps.turnTo(c,()=>c.ba,.45),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,1.3)],{then:()=>{c.follow='ride';}});}
    else c.follow='walk';}
   else{if(c.mode==='foot'){c.follow='walk';continue;}if(C.wantT<1)continue;
    if(c.mode==='ride')comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)],{then:()=>{c.follow='walk';}});}}}
 function stand(c,q,{look=null,face:fc=null,max=3.2,gesture=null,keep=false,leash=14}={}){
  C.spot[c.key]=q?{q,look,face:fc,max,gesture,keep,leash}:null;if(!q){if(c.script?.spot6){c.script=null;c.then=null;}if(C.match&&c.mode==='foot')c.follow='walk';return;}
  if(c.mode!=='foot'||c.script?.spot6||c.gone)return;
  comp.run(c,[comp.steps.toward(c,()=>{const s=C.spot[c.key];if(!s)return null;const w=typeof s.q==='function'?s.q():at(s.q);const lk=typeof s.look==='function'?s.look():s.look;
   return {x:w.x,z:w.z,look:lk,face:typeof s.face==='function'?s.face():s.face??undefined,max:s.max,gesture:s.gesture};})],{then:()=>{if(C.match&&c.mode==='foot')c.follow='walk';}});c.script.spot6=true;}
 function standAll(){for(const c of [jamie,sam]){const s=C.spot[c.key];if(s&&c.mode==='foot'&&!c.script&&!c.gone)stand(c,s.q,s);}}
 function glance(c,q,secs=2){c.lookAt=q;later(secs,()=>{if(c.lookAt===q)c.lookAt=null;});}
 const camBeside=(s,back=.38,sd=.66)=>()=>{const p=me(),fx=Math.sin(p.a),fz=-Math.cos(p.a),rx=Math.cos(p.a),rz=Math.sin(p.a);return {x:p.x+rx*sd*s-fx*back,z:p.z+rz*sd*s-fz*back};};
 const GEST={point:w=>p=>{const y=p[PI.root+1];p[PI.rh]+=(.16-p[PI.rh])*w;p[PI.rh+1]+=(y+.42-p[PI.rh+1])*w;p[PI.rh+2]+=(-.5-p[PI.rh+2])*w;},
  tense:w=>p=>{p[PI.root+1]-=.04*w;p[PI.lean]+=.12*w;p[PI.lh+1]+=.06*w;},
  hold:w=>p=>{const y=p[PI.root+1];for(const [o2,s] of [[PI.lh,-1],[PI.rh,1]]){p[o2]+=(s*.08-p[o2])*w;p[o2+1]+=(y+.08-p[o2+1])*w;p[o2+2]+=(-.34-p[o2+2])*w;}p[PI.lean]+=.08*w;},
  hug:w=>p=>{for(const [o2,s] of [[PI.lh,-1],[PI.rh,1]]){p[o2]+=(s*.06-p[o2])*w;p[o2+1]+=(1.0-p[o2+1])*w;p[o2+2]+=(-.18-p[o2+2])*w;}p[PI.hp]+=.25*w;p[PI.lean]+=.12*w;},
  brake:w=>p=>{const y=p[PI.root+1];for(const [o2,s] of [[PI.lh,-1],[PI.rh,1]]){p[o2]+=(s*.12-p[o2])*w;p[o2+1]+=(y+.38-p[o2+1])*w;p[o2+2]+=(-.42-p[o2+2])*w;}p[PI.lean]-=.18*w;p[PI.root+1]-=.06*w;},
  sit:w=>p=>{p[PI.root+1]-=.5*w;for(const f of [PI.lf,PI.rf])p[f+2]-=.42*w;for(const h of [PI.lh,PI.rh]){p[h+1]-=.32*w;p[h+2]-=.22*w;}p[PI.hp]+=.35*w;p[PI.lean]+=.2*w;}};
 // Jamie and Sam stay with you (Chapter Five's guard and make-way, unchanged in what they do)
 const GUARD={jamie:{x:0,z:0,t:0,stuck:0},sam:{x:0,z:0,t:0,stuck:0}},TRAIL=[];
 const seenAt=q=>{const e=camera.position,f=new THREE.Vector3();camera.getWorldDirection(f);const dx=q.x-e.x,dz=q.z-e.z,l=Math.hypot(dx,dz)||1;return (dx*f.x+dz*f.z)/l/(Math.hypot(f.x,f.z)||1)>.3&&l<45;};
 function guard(dt){const ph=S.phase;if(!C.guardLog){C.guardLog={released:0,unstuck:0,recovered:0,madeWay:0};TRAIL.length=0;for(const g of Object.values(GUARD))Object.assign(g,{x:0,z:0,t:0,stuck:0});}
  if(!/^(d6-(ride|oak|street|creek)|e6-|n6-(rescue|after))/.test(ph)||C.fadeOut>=0)return;const p=me();
  const tl=TRAIL[TRAIL.length-1];if(!tl||Math.hypot(tl.x-p.x,tl.z-p.z)>1){TRAIL.push({x:p.x,z:p.z});if(TRAIL.length>40)TRAIL.shift();}
  for(const c of [jamie,sam]){if(!c.active||c.gone)continue;const g=GUARD[c.key],q=c.mode==='ride'?{x:c.bx,z:c.bz}:{x:c.px,z:c.pz},d=Math.hypot(q.x-p.x,q.z-p.z);
   c.footBoost=C.flags.hurry?1.45:1.2;
   const sp=C.spot[c.key];if(sp&&!sp.keep&&c.mode==='foot'&&p.walking&&d>(sp.leash||14)){stand(c,null);C.guardLog.released++;}
   g.t+=dt;if(g.t>=2.5){const mv=Math.hypot(q.x-g.x,q.z-g.z);g.x=q.x;g.z=q.z;g.t=0;g.stuck=d>6&&mv<.4&&c.mode==='foot'&&!sp?g.stuck+2.5:0;if(g.stuck===2.5){c.route=null;C.guardLog.unstuck++;}}
   if(g.stuck>=7.5&&d>9&&c.mode==='foot'&&!c.script&&p.walking&&!C.view&&!seenAt(q)){
    for(let i=TRAIL.length-1;i>=0;i--){const t2=TRAIL[i],b=Math.hypot(t2.x-p.x,t2.z-p.z);if(b<5)continue;if(b>12)break;
     if(nav.walkable(t2.x,t2.z,{r:.3})&&!seenAt(t2)){comp.putFoot(c,t2.x,t2.z,headingTo(t2.x,t2.z,p.x,p.z),{bike:c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null});if(C.match)c.follow='walk';g.stuck=0;C.guardLog.recovered++;mark('caught up: '+c.key);break;}}}}
  makeWay(dt,p);}
 function clearWay(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.25);for(let i=1;i<=n;i++){const t2=i/n;if(!nav.walkable(x0+(x1-x0)*t2,z0+(z1-z0)*t2,{r:.2}))return false;}return true;}
 function makeWay(dt,p){const M=C.makeWay||(C.makeWay={x:p.x,z:p.z,t:0,cool:0});M.cool-=dt;const mv=Math.hypot(p.x-M.x,p.z-M.z);M.x=p.x;M.z=p.z;
  M.t=p.walking&&p.pushing&&mv<Math.max(dt,1e-3)*.3&&!C.view&&!posed()?M.t+dt:0;if(M.t<.6||M.cool>0)return;
  const fx=Math.sin(p.a),fz=-Math.cos(p.a),rx=Math.cos(p.a),rz=Math.sin(p.a);let best=null;
  for(const c of [jamie,sam]){if(!c.active||c.gone||c.mode!=='foot'||(c.script&&!c.script.spot6))continue;const dx=c.px-p.x,dz=c.pz-p.z,d=Math.hypot(dx,dz);
   if(d>1.6||dx*fx+dz*fz<.15||Math.abs(dx*rx+dz*rz)>.75)continue;if(!best||d<best.d)best={c,d,side:Math.sign(dx*rx+dz*rz)||1};}
  if(!best)return;const c=best.c,s0=best.side;
  const q=[1.5,2.2].flatMap(kk=>[[s0,0],[s0,-.7],[-s0,0],[-s0,-.7],[s0,.6],[-s0,.6]].map(([sd,bk])=>({x:c.px+rx*sd*kk+fx*bk*kk,z:c.pz+rz*sd*kk+fz*bk*kk})))
   .find(q2=>nav.walkable(q2.x,q2.z,{r:.3})&&Math.abs((q2.x-p.x)*rx+(q2.z-p.z)*rz)>.9&&clearWay(c.px,c.pz,q2.x,q2.z)&&[jamie,sam].every(o2=>o2===c||o2.mode!=='foot'||Math.hypot(o2.px-q2.x,o2.pz-q2.z)>1.1));if(!q)return;
  M.cool=2.5;M.t=0;C.guardLog.madeWay++;mark('made way: '+c.key);
  comp.run(c,[comp.steps.walkTo(c,[[q.x,q.z]],{speed:1.7})],{then:()=>{const sp=C.spot[c.key];if(sp){c.script=null;stand(c,sp.q,sp);}else if(C.match&&c.mode==='foot')c.follow='walk';}});c.script.makeWay=true;}
 // ---- the clock, the sky, the storm --------------------------------------------------------------------------------------------
 const RATE={day:4/3600,works:3/3600,flood:1.5/3600};
 function clock(dt){const ph=S.phase;let r=0;if(/^d6-/.test(ph)||ph==='e6-garage')r=RATE.day;else if(/^e6-/.test(ph))r=RATE.works;else if(/^n6-/.test(ph))r=RATE.flood;
  C.h+=r*dt;if(C.hMin!==undefined&&C.h<C.hMin)C.h=Math.min(C.hMin,C.h+dt/60);const m=Math.floor(C.h*60+1e-6);if(m!==C.minute&&ph!=='c6-black'){C.minute=m;date(C.h);}
  C.storm=damp(C.storm,C.stormTo,.18,dt);C.rain=damp(C.rain,C.rainTo,.35,dt);}
 // The light: a plain August morning; the afternoon going grey; the storm; an evening under it. Indoors (your room, the
 // gatehouse) a little of it; below ground at the works none but the lamps.
 function sky(h=C.h){const q=(a,b)=>smooth((h-a)/(b-a));let day=1-.5*q(18.4,19.6)-.5*q(19.6,20.25),p=.3*q(18.6,19.7)+.7*q(19.7,20.3),night=.6*q(19.95,20.4)+.3*q(20.4,21),deep=.15*q(20.2,21);
  const cv=inWorks(camera.position)?works.cave(camera.position.x,camera.position.z):home.root.parent&&home.inRoom(camera.position.x,camera.position.z)?.12:home.root.parent&&home.inHall(camera.position.x,camera.position.z)?.25:0;
  return {day,p,night,deep,fill:0,storm:C.storm,flash:storm.flash*(C.storm>.3?1:0),cave:cv};}
 // ---- the world as this chapter finds it -----------------------------------------------------------------------------------------
 function common(){document.body?.classList?.add('night1');nav.setTown(true);nav.setPine?.(true);ch5.presentation(true);if(!props.plan.parent)scene.add(props.plan);storm.attach(true);o.foot.arms=phys.arms;}
 function dayWorld(){A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);o.attachFlashlight?.(true);ambient.night?.(false);ambient.morning?.(true);
  for(const a of [...k.adults,...ch2.extra,...Object.values(ch3.people||{})]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}cast.reset();
  police.reset?.();k.carA.show(false);k.carB.show(false);car3.show(false);ch2.flyers.visible=true;ch2.found.group.visible=false;ch2.tape.visible=false;for(const b of ch2.beams)b.on=false;ch2.samBeam&&(ch2.samBeam.on=false);
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;k.torch.visible=false;S.flashOn=false;o.setFlashlight?.(false,false);
  world.doors.alex?.set(0);world.doors.jamie?.set(0);world.alexWindow.emissiveIntensity=.04;works.attach(false);works.reset();storm.reset();C.stormTo=C.storm=0;C.rainTo=C.rain=0;
  for(const c of [jamie,sam]){c.gone=false;c.person.group.visible=true;}radioHand.visible=false;reyesRadio.visible=false;camHand.visible=false;}
 // (behind black: the works, the storm's rendering: the sun's shadows off under the cloud, the flashlights' on; the one shader change)
 function worksWorld(){works.attach(true);home.show(false);nav.setRoom(works.nav);o.nightRendering?.(true);o.flashShadow?.(true);ambient.night?.(true);ambient.morning?.(false);k.carA.show(true);k.carA.lights=false;k.carA.headlights=false;
  const c=WPa(WS.cruiser);k.carA.park(c.x,c.z,Math.PI*.98);reyesRadio.visible=true;works.lamps('*',1,{rate:6});works.setLamp('pole',0);works.ST.power=true;}
 // ---- what you have: the bag (I) -------------------------------------------------------------------------------------------------
 function items(){const I=C.inv,carry=[],found=[];
  if(I.camera==='have')carry.push({id:'camera',name:'Alex’s camera',state:'In your pocket',action:'Look (V)'});else if(I.camera==='reyes')found.push({id:'camera',name:'Alex’s camera',note:'With Officer Reyes. The station is copying the pictures.'});
  if(I.flashlight)carry.push({id:'flashlight',name:'Flashlight',state:o.foot.on?'On':'Off',action:o.foot.on?'Turn off':'Turn on'});
  if(I.pin==='hand')carry.push({id:'pin',name:'The locking pin',state:'In your hand'});
  if(I.shirt==='sam')found.push({id:'shirt',name:'Alex’s shirt',note:'In Sam’s backpack, since last night.'});else if(I.shirt==='reyes')found.push({id:'shirt',name:'Alex’s shirt',note:'Evidence. Officer Reyes has it, in a paper bag.'});
  found.push({id:'pics',name:'Alex’s pictures',note:C.pics.fire>=0?'Yesterday’s too: the register, the map, and the one from the trees.':'His summer.'});
  if(I.plan)found.push({id:'plan',name:'The drainage plan',note:'Line Two and Line Four. Where they meet.'});
  if(I.helmet==='reyes')found.push({id:'helmet',name:'Alex’s helmet',note:'From the works’ bar screen. Evidence now.'});
  return {carry,found};}
 const inv=createInventory({items,use:id=>{if(id==='flashlight'){o.foot.on=!o.foot.on;}else if(id==='camera'){inv.close();if(canCamera())openCamera(C.pics.fire>=0?C.pics.fire:0);}}});
 // ---- Act I: the morning ------------------------------------------------------------------------------------------------------------
 const HS=home.SPOTS;
 function placeAtHome(){home.show(true);home.reset();home.show(true);nav.setRoom(home.nav);const bk=main(home.P.drivD+1,home.P.side*9.4),road=main(home.P.drivD+1,0);
  o.placePlayer({x:HS.wake.x,z:HS.wake.z,a:headingTo(HS.wake.x,HS.wake.z,HS.window.x,HS.window.z),mode:'walk',bike:{x:bk.x,z:bk.z,a:headingTo(bk.x,bk.z,road.x,road.z)}});}
 // Jamie and Sam are already at Sam's (Jamie came over early; neither slept)
 function boysAtSams(){const jb=drive(-.9,6.6),sb=drive(-2.1,6.4),jq=drive(-1.6,7.4),sq=G5.samStand(0);
  comp.putFoot(jamie,jq.x,jq.z,driveA(0,0)+Math.PI,{bike:{x:jb.x,z:jb.z,a:driveA(-.9,6.6),kick:1}});comp.putFoot(sam,sq.x,sq.z,driveA(0,0),{bike:{x:sb.x,z:sb.z,a:driveA(-2.1,6.4),kick:1}});
  for(const c of [jamie,sam]){c.follow=null;c.lookAt=null;c.lookPlayer=false;}}
 function begin(){fresh();go('c6-black');C.cardT=0;o.fade(1);common();dayWorld();comp.reset();minds();phys.reset();o.foot.arms=phys.arms;objective('');T?.reset?.();C.h=HOUR.start;
  cameraPictures();placeAtHome();boysAtSams();meetingStage(false);}
 function opening(){go('d6-room');date(C.h);C.fadeIn=0;C.room={t:0};checkpoint('chapter6-start');
  const b=HS.bed;pose({x:b.x,z:b.z},{y:b.y+.62,yaw:headingTo(b.x,b.z,HS.door.x,HS.door.z)+.5,pitch:.42});C.pose.slow=.01;C.pose.w=1;
  say([{wait:2.6},{who:'',text:'Thursday.',time:2.4},{wait:2},{who:'',text:'For a second it was just a morning.',time:3.6}],{then:()=>{C.flags.awake=true;}});}
 function getUp(){if(C.flags.up)return;C.flags.up=true;unpose();mark('up');C.room.upAt=C.t;}
 function lookThing(id,target,lines,{eye=1.42,back=.7}={}){if(C.looked.has(id)&&id!=='window')return;C.looked.add(id);closeLook(target,{eye,back,kind:id,floor:home.root.position.y+home.P.floor});C.lookDur=Math.max(3.2,lines.reduce((a,l)=>a+(l.time||2.4)+.3,0)+1);say(lines);}
 function takeCamera(){if(C.inv.camera||phys.playerBusy())return;o.roam.walkLock=true;
  phys.playerReach({at:()=>home.CAMERA_AT(),onContact:()=>{home.cameraOnDesk(false);C.inv.camera='have';sound('click',HS.desk,{gain:.2});mark('Alex’s camera');},then:()=>{o.roam.walkLock=false;
   objective('Look at the last picture.','V: Alex’s camera. A / D: the pictures.');}});}
 function updateRoom(dt){const X=C.room;X.t+=dt;home.update(dt);
  if(!C.flags.up&&(X.t>16||(C.flags.awake&&X.t>7&&(o.held?.('KeyW')||o.held?.('KeyS')||o.held?.('KeyF')||o.held?.('Space')))))getUp();
  if(C.view==='look'){C.lookT+=dt;if(C.lookT>(C.lookDur||4)&&!busy())endLook();}
  // the camera: the last picture, looked at long enough to see it
  if(C.view==='camera'&&photo.current?.id==='c5-campfire'){X.fireT=(X.fireT||0)+dt;if(X.fireT>1.4&&!C.flags.reviewed)reviewed();}
  if(C.flags.up&&!C.inv.camera&&X.t-X.upAt>45&&!C.flags.camHint&&!busy()){C.flags.camHint=true;say([{who:'',text:'Alex’s camera. On your desk, where you put it last night.',time:3.4}]);objective('Take Alex’s camera.','On the desk, under the window.');}
  if(!C.flags.ring&&((C.flags.reviewed&&C.t-C.reviewAt>5&&!busy())||X.t>140))ringPhone();
  if(C.flags.ring&&!C.flags.answered){X.ringT=(X.ringT||0)+dt;if(X.ringT>2.9){X.ringT=0;sound('phoneRing',HS.phone,{gain:.8});}if(C.t-C.ringAt>24&&!C.flags.momAgain&&!busy()){C.flags.momAgain=true;say([{who:'MOM (KITCHEN)',text:'“Honey? The phone!”',time:1.8}]);}
   // (never answered: she gets it in the kitchen, and calls you to it)
   if(C.t-C.ringAt>55&&!C.flags.momGot&&!busy()&&!phys.playerBusy()){C.flags.momGot=true;home.ring(false);say([{who:'MOM (KITCHEN)',text:'“Hello? …Hi, Sam. Hang on.”',time:2},{who:'MOM (KITCHEN)',text:'“Hon! It’s Sam! Pick up in the hall!”',time:2.2}],
    {then:()=>{if(C.flags.answered)return;carry('phone',HS.phoneStand,headingTo(HS.phoneStand.x,HS.phoneStand.z,HS.phone.x,HS.phone.z),{after:()=>{C.flags.answered=true;home.holdPhone(true);o.roam.walkLock=true;objective('');call();}});}});}}
  if(C.flags.called&&!C.flags.outT)C.flags.outT=C.t;
  if(C.flags.called&&C.t-C.flags.outT>75&&C.fadeOut<0&&!busy()&&!C.flags.outAuto&&!phys.playerBusy()){C.flags.outAuto=true;if(!C.inv.camera){C.inv.camera='have';home.cameraOnDesk(false);}goOutside();}}
 function reviewed(){if(C.flags.reviewed)return;C.flags.reviewed=true;C.reviewAt=C.t;mark('the picture from the trees');T?.set?.(.18,{rise:.03,why:'the picture'});
  say([{wait:.6},{who:'',text:'The three of you at the fire. From the trees.',time:3},{who:'',text:`${FIRE_TIME.replace('PM',' PM')}. Sam read it out loud last night, like that would make it make sense.`,time:4.4},{who:'',text:'The camera never left your pocket.',time:3}]);}
 function ringPhone(){if(C.flags.ring)return;C.flags.ring=true;C.ringAt=C.t;home.ring(true);sound('phoneRing',HS.phone,{gain:.8});if(C.view==='camera')closeView();if(C.view==='look')endLook();if(!C.flags.up)getUp();
  later(1.6,()=>say([{who:'MOM (KITCHEN)',text:'“Can you get that? My hands are wet!”',time:2.4}]));objective('Answer the phone.','In the hall, by the front door.');go('d6-phone');}
 function answer(){if(C.flags.answered||phys.playerBusy())return;C.flags.answered=true;o.roam.walkLock=true;objective('');
  phys.playerReach({at:()=>HS.phone,onContact:()=>{home.ring(false);home.holdPhone(true);sound('click',HS.phone,{gain:.25});},then:()=>call()});}
 function call(){checkpoint('c6-phone');const SP='SAM (PHONE)';
  say([{wait:.5},{who:SP,text:'“Hey. It’s me.”',time:1.4},{who:'YOU',text:'“Hey.”',time:.9},{who:SP,text:'“Did you sleep?”',time:1.2},{who:'YOU',text:'“Not really.”',time:1.1},
   {who:SP,text:'“Me neither. My dad knows. Everything. Well— he knows we went to Pine Ridge. And that I lied.”',time:4},
   {who:SP,text:'“He called Alex’s dad. And the police. Officer Reyes is coming to our house at nine-thirty.”',time:3.8},
   {who:SP,text:'“He wants all three of us there. He said ‘with whatever you found.’”',time:3},{who:'YOU',text:'“The shirt.”',time:1.2},
   {who:SP,text:'“It’s still in my bag. I didn’t want to touch it.”',time:2.6},{wait:1.4},
   {who:SP,text:'“Can I tell you something weird?”',time:1.8},{who:'YOU',text:'“Weirder than yesterday?”',time:1.6},{wait:.8},
   {who:SP,text:'“Jamie called me last night. Like two in the morning.”',time:2.6},
   {who:SP,text:'“He said he was outside. In our back yard. He said, ‘Sam, come to the window. I need to show you something.’”',time:4.6},
   {who:'YOU',text:'“Did you go?”',time:1.2},{who:SP,text:'“No. I just lay there. With the fan on. Until it stopped.”',time:3.2},
   {who:SP,text:'“I called him this morning. He says he was asleep. His mom says he was asleep.”',time:3.6},{who:SP,text:'“He doesn’t even know our number.”',time:2},{wait:1.6},
   {who:'YOU',text:'“So who called you?”',time:1.6},{wait:2.2},{who:SP,text:'“…Nine-thirty. Bring the camera.”',time:2.2,act:()=>later(2.3,()=>sound('click',HS.phone,{gain:.3}))},{wait:1.4}],
   {then:()=>{phys.playerReach({at:()=>HS.phone,dur:[.42,.14,.38],onContact:()=>{home.holdPhone(false);sound('click',HS.phone,{gain:.25});},then:()=>{o.roam.walkLock=false;
    say([{who:'MOM (KITCHEN)',text:'“Who was that, hon?”',time:1.6},{who:'YOU',text:'“Sam. I’m going over to Sam’s.”',time:1.8},{who:'MOM (KITCHEN)',text:'“Okay. Back for lunch.”',time:1.6},{wait:.8},
     {who:'MOM (KITCHEN)',text:'“And hey— stay together, okay? All of you.”',time:2.4},{who:'YOU',text:'“We will.”',time:1.2}],{then:()=>{C.flags.called=true;objective('Go to Sam’s.',C.inv.camera?'Out the front door. Oak Hollow, toward the oak.':'Bring Alex’s camera. Then out the front door.');}});}});}});}
 function goOutside(){if(C.fadeOut>=0)return;if(!C.inv.camera){say([{who:'',text:'Alex’s camera. It’s still on your desk.',time:2.6}]);objective('Take Alex’s camera.','On the desk, under the window.');return;}
  C.fadeOut=0;sound('doorOpen',HS.front,{gain:.5});C.after=()=>{nav.setRoom(null);home.show(false);const [sx,sz]=landing(HS.stoop.x,HS.stoop.z),bk=main(home.P.drivD+1,home.P.side*9.4),road=main(home.P.drivD+1,0);
   o.placePlayer({x:sx,z:sz,a:headingTo(sx,sz,road.x,road.z),mode:'walk',bike:{x:bk.x,z:bk.z,a:headingTo(bk.x,bk.z,road.x,road.z)}});sound('doorSlam',HS.front,{gain:.25});
   go('d6-ride');checkpoint('c6-ride');C.fadeIn=0;C.hMin=HOUR.ride;objective('Ride to Sam’s.','Oak Hollow, toward the oak. The ranch with the blue garage trim.');meetingStage(true);};}
 // ---- Sam's garage ----------------------------------------------------------------------------------------------------------------
 // (who stands where: TL is Chapter Five's table frame: x across, +z into the garage)
 const TL=(x,z,y=0)=>G5.TL(x,z,y);
 const MEET={you:[0,-.95],jamie:[.95,-.35],sam:[0,.66],reyes:[-1.05,-.2],samDad:[1.45,1.25],dad:[-1.35,1.35]};
 const mp=key=>{const [x,z]=MEET[key];return TL(x,z,0);};
 function meetingStage(on){const SG=world.garages.sam;
  if(on){SG?.set?.(1);G5.build();G5.layTable();for(const P of [...G5.S.items,...G5.S.bars,G5.S.sock,G5.S.map,G5.S.cam,G5.S.jbagP])P?.hide();
   // the bag on the table, the shirt in it
   if(C.inv.shirt==='sam'){SHIRT.storeIn(G5.S.bag);}
   const rp=mp('reyes'),dp=mp('dad'),sd=mp('samDad');const tc=TL(0,0);
   reyes.show(true);reyes.place(rp.x,rp.z,headingTo(rp.x,rp.z,tc.x,tc.z));reyes.gest('fold');reyes.lookAt=null;
   dad.show(true);dad.place(dp.x,dp.z,headingTo(dp.x,dp.z,tc.x,tc.z));dad.gest('fold');
   samDad.show(true);samDad.place(sd.x,sd.z,headingTo(sd.x,sd.z,tc.x,tc.z));samDad.gest('fold');
   const car=main(SH.drivD-7,-3.0),car2=main(SH.drivD+4,-3.0);k.carA.show(true);k.carA.park(car.x,car.z,headingTo(car.x,car.z,car2.x,car2.z));k.carA.lights=false;k.carA.headlights=false;}
  else{reyes.show(false);dad.show(false);samDad.show(false);}}
 function updateRide(dt){const p=me(),g=TL(0,-1.6);const d=dist2(p,g);
  if(!C.flags.jamieWave&&d<38){C.flags.jamieWave=true;jamie.lookPlayer=true;say([{who:'JAMIE',text:'“Hey.”',by:'jamie',time:1}]);}
  if(d<9&&p.walking){meetStart();return;}
  if(d<16&&p.riding){C.rideNear=(C.rideNear||0)+dt;if(C.rideNear>8&&!C.flags.leaveBike&&!busy()){C.flags.leaveBike=true;say([{who:'JAMIE',text:'“Leave your bike. They’re in the garage.”',by:'jamie'}]);}
   if(C.rideNear>70)carry('meeting',drive(.2,2.4),driveA(0,0)+Math.PI,{after:meetStart});}
  if(S.pt>200&&!C.flags.rideHint&&!busy()){C.flags.rideHint=true;objective('Ride to Sam’s.','Up Oak Hollow, toward the oak. Reyes’s car is out front.');}
  if(S.pt>330)carry('meeting',drive(.2,2.4),driveA(0,0)+Math.PI,{after:meetStart});}
 // The meeting. Everything is said at the table; everything handed is handed.
 function meetStart(){if(C.meet)return;go('d6-meet');checkpoint('c6-meeting');C.hMin=HOUR.meet;objective('');mark('Sam’s garage');C.meet={t:0,stage:'hello',pics:new Set(),silT:0};
  follow(false);for(const c of [jamie,sam])c.lookPlayer=false;
  stand(jamie,mp('jamie'),{look:()=>TL(0,0,.9),keep:true,max:1.6});stand(sam,mp('sam'),{look:()=>TL(0,0,.9),keep:true,max:1.6});
  reyes.lookAt=camera.position;samDad.lookAt=camera.position;
  say([{wait:.8},{who:'SAM’S DAD',text:'“There you are. Come on in.”',from:samDad,time:1.8},{wait:.4},
   {who:'OFFICER REYES',text:'“Morning.”',from:reyes,time:1,act:()=>{reyes.gest(null);}},{who:'OFFICER REYES',text:'“We met Sunday night. Behind Briarwood.”',from:reyes,time:2.4},
   {who:'OFFICER REYES',text:'“You told me you heard a bell.”',from:reyes,time:2},{who:'JAMIE',text:'“You said ‘okay.’”',by:'jamie',time:1.4,face:'frustrated'},{wait:1.2},
   {who:'OFFICER REYES',text:'“I did.”',from:reyes,time:1.2},{wait:1},{who:'OFFICER REYES',text:'“So tell me again. All of it. Take your time.”',from:reyes,time:2.6,act:()=>{reyes.lookAt=TL(0,0,.9);}},{wait:.8},
   {who:'SAM',text:'“We found this. Yesterday.”',by:'sam',time:1.6}],{then:shirtOut});}
 function shirtOut(){C.meet.stage='shirt';const mouth=()=>G5.S.bag.mouth(new THREE.Vector3()),flat=TL(-.05,-.05,.725);
  comp.run(sam,[comp.steps.turnTo(sam,()=>G5.TA?G5.TA():driveA(0,0),.3),phys.reach(sam,{at:mouth,dur:[.6,.3,.5],onContact:()=>{SHIRT.holdBy(sam.person,'r');sound('cloth',mouth(),{gain:.3});},carry:true}),
   phys.reach(sam,{at:()=>flat,dur:[.6,.2,.5],onContact:()=>{SHIRT.place(flat,new THREE.Euler(-Math.PI/2,driveA(0,0),0));C.flags.shirtOnTable=true;mark('the shirt on the table');},carry:false})],{then:()=>stand(sam,mp('sam'),{look:()=>flat,keep:true,max:1.6})});
  say([{until:()=>C.flags.shirtOnTable||C.meet.t>20},{wait:1.6,act:()=>{for(const a of [reyes,samDad])a.lookAt=TL(0,0,.75);dad.gest(null);const d2=TL(-.55,.25,0);dad.walk([[d2.x,d2.z]],{speed:.7,then:a=>{a.faceTo(TL(0,0).x,TL(0,0).z);a.lookAt=TL(0,0,.75);}});}},
   {wait:3.4},{who:'ALEX’S DAD',text:'“Where.”',from:dad,time:1.6},
   {who:'SAM',text:'“Camp Whippoorwill. Past Pine Ridge. It was on a nail. In the last cabin.”',by:'sam',time:3.4,face:'sad'},
   {wait:1.6,act:()=>{dad.gest('hold');C.flags.dadHands=true;}},{wait:2.6},{who:'ALEX’S DAD',text:'“…It’s damp.”',from:dad,time:1.6},
   {who:'SAM',text:'“It was wet yesterday. When we found it.”',by:'sam',time:2.2},{wait:2.4},
   {who:'ALEX’S DAD',text:'“His mother bought this at the outlet mall. He hated the collar.”',from:dad,time:3.4},{wait:1.4},
   {who:'ALEX’S DAD',text:'“He wore it anyway. Because she liked it.”',from:dad,time:2.8,act:()=>{dad.gest('head');}},{wait:3.4,act:()=>{dad.gest('hold');}},
   {who:'OFFICER REYES',text:'“Sir.”',from:reyes,time:1},{wait:1.2},{who:'OFFICER REYES',text:'“I’m going to need to take it.”',from:reyes,time:2},{wait:2.8},
   {who:'ALEX’S DAD',text:'“…Yeah.”',from:dad,time:1.2,act:()=>handShirt()},{until:()=>C.flags.bagged||C.meet.t>90},{wait:.6},
   {who:'OFFICER REYES',text:'“Recovered August twenty-fourth, around seven-thirty P.M. Camp Whippoorwill. The last cabin— what’s it called?”',from:reyes,time:4.6,act:()=>{reyes.gest('talk');}},
   {who:'SAM',text:'“Owl.”',by:'sam',time:.9},{who:'OFFICER REYES',text:'“Owl.”',from:reyes,time:1},{wait:.8},
   {who:'OFFICER REYES',text:'“Who touched it before you did?”',from:reyes,time:1.8},{who:'SAM',text:'“…I don’t know.”',by:'sam',time:1.2},
   {who:'JAMIE',text:'“Whoever carved our initials in the wall.”',by:'jamie',time:2.2},{who:'OFFICER REYES',text:'“Your initials.”',from:reyes,time:1.2},
   {who:'SAM',text:'“J, S, A. Jamie, Sam, Alex. The way we write it. Fresh. And four marks. Sunday to Wednesday.”',by:'sam',time:4,face:'concerned'},
   {who:'OFFICER REYES',text:'“Four marks.”',from:reyes,time:1.2},{wait:.8},{who:'SAM’S DAD',text:'“Show him the pictures.”',from:samDad,time:1.6}],
   {then:()=>{C.meet.stage='pictures';C.flags.showPics=true;objective('Show Officer Reyes the pictures.','Alex’s camera. F, by Reyes.');}});}
 // Alex's dad folds it the way his mother would, and it goes into the bag Reyes holds open
 function handShirt(){const toR=()=>reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3());dad.gest(null);
  SHIRT.holdBy(dad.person,'r');later(1.4,()=>{const rp=reyes.pos;dad.walk([[rp.x+(dad.x-rp.x)*.55,rp.z+(dad.z-rp.z)*.55]],{speed:.6,then:a=>{a.faceTo(rp.x,rp.z);a.gest('point',toR());
   later(.9,()=>{SHIRT.holdBy(reyes.person,'r');reyes.gest(null);later(.8,()=>{SHIRT.hide();bagHand.visible=true;C.inv.shirt='reyes';C.flags.bagged=true;sound('cloth',reyes.pos,{gain:.3});mark('the shirt, bagged');
     const bp=TL(-.42,-.1,.72);bagHand.position.set(bp.x,bp.y,bp.z);bagHand.rotation.set(0,-driveA(0,0),0);a.gest('fold');const back=mp('dad');a.walk([[back.x,back.z]],{speed:.6,then:b=>{b.faceTo(TL(0,0).x,TL(0,0).z);b.gest('fold');}});});});}});});}
 // the pictures: you hold the camera, Reyes looks over your shoulder; each one gets its own words
 function showPictures(){if(C.view||!C.inv.camera)return;C.flags.showing=true;const q=camBeside(-1,.55,.55)();reyes.walk([[q.x,q.z]],{speed:.8,then:a=>{a.lookAt=camera.position;}});
  openCamera(C.pics.register>=0?C.pics.register:0);objective('Show Officer Reyes the pictures.','A / D: the pictures. W: zoom.');}
 function updateMeeting(dt){const M=C.meet;M.t+=dt;if(!M)return;
  if(M.stage==='pictures'&&C.view==='camera'&&C.flags.showing){const id=photo.current?.id;M.dwell=(M.last===id?(M.dwell||0)+dt:0);M.last=id;
   if(M.dwell>.9&&!busy()&&id&&!M.pics.has(id))pictureTalk(id);
   if(id==='c5-campfire'){M.fireT=(M.fireT||0)+dt;if(silInView()){M.silT+=dt;if(M.silT>.8&&!C.flags.silSeen)silhouette(false);}
    if(M.fireT>18&&!C.flags.silSeen&&!C.flags.guide&&!busy()&&M.pics.has('c5-campfire')){C.flags.guide=true;say([{who:'SAM',text:'“Wait. Can I—”',by:'sam',time:1.2,act:()=>{photo.V.zt=2.6;photo.V.px=FIREPIC.sil.x;photo.V.py=FIREPIC.sil.y;photo.V.dirty=true;}}]);later(2.2,()=>{if(!C.flags.silSeen)silhouette(true);});}}
   if(C.flags.silDone&&M.pics.has('c5-register3')&&!C.flags.copy&&!busy())copyRequest();}
  if(M.stage==='pictures'&&!C.flags.showing&&M.t>80&&!C.flags.picNudge&&!busy()){C.flags.picNudge=true;say([{who:'OFFICER REYES',text:'“The camera. Let me see.”',from:reyes,time:1.8}]);}
  // (never showing them: Reyes asks for it, and you hand it over; the station looks at them)
  if(M.stage==='pictures'&&!C.flags.showing&&M.t>170&&!C.flags.copy&&!busy()){C.flags.silDone=true;copyRequest();}
  if(M.stage==='pictures'&&C.flags.showing&&M.t>260&&!C.flags.copy&&!busy()){C.flags.silDone=true;copyRequest();}
  if(M.stage==='give'&&!C.flags.given&&M.t-M.giveAt>40&&!C.flags.giveNudge&&!busy()){C.flags.giveNudge=true;say([{who:'OFFICER REYES',text:'“I’ll be careful with it.”',from:reyes,time:1.6}]);}
  if(M.stage==='give'&&!C.flags.given&&M.t-M.giveAt>80&&!busy()&&!phys.playerBusy()){C.flags.given=true;C.inv.camera='reyes';camHand.visible=true;reyes.gest(null);sound('click',reyes.pos,{gain:.2});mark('the camera, to Reyes (he asked twice)');
   say([{who:'',text:'You give it to him.',time:1.6}]);objective('');later(1.2,()=>{camHand.visible=false;});later(1.8,jamieTells);}}
 function pictureTalk(id){const M=C.meet;M.pics.add(id);
  if(id==='c5-register3')say([{who:'SAM',text:'“That’s the camp’s register. From ninety-one. The search.”',by:'sam',time:2.6},{who:'SAM',text:'“August twenty-fourth. ‘Two bike tracks at the service gate. Both lead in. None out.’”',by:'sam',time:3.8},
   {who:'OFFICER REYES',text:'“Danny Whitcomb.”',from:reyes,time:1.4},{who:'SAM’S DAD',text:'“The Whitcomb boy. God.”',from:samDad,time:1.6},{who:'OFFICER REYES',text:'“‘Told Sergeant Pruitt. He says kids, cutting through.’”',from:reyes,time:3}]);
  else if(id==='c5-searchmap')say([{who:'SAM',text:'“Their search map. Grid seven, the pump house. That’s where the light went. Last night.”',by:'sam',time:3.6}]);
  else if(id==='c5-campfire')say([{who:'JAMIE',text:'“That one. Look at that one.”',by:'jamie',time:1.6,face:'afraid'},{who:'OFFICER REYES',text:'“That’s you three.”',from:reyes,time:1.4},
   {who:'JAMIE',text:'“Nobody took it. The camera was in his pocket the whole time.”',by:'jamie',time:2.8},{who:'OFFICER REYES',text:'“Somebody pressed the button.”',from:reyes,time:1.8},{who:'SAM',text:'“Not us.”',by:'sam',time:1}]);
  else if(id&&photo.current?.lead)say([{who:'JAMIE',text:'“That’s the TV at the video store. Alex walking. At Pine Ridge.”',by:'jamie',time:3}]);}
 function silhouette(guided){if(C.flags.silSeen)return;C.flags.silSeen=true;mark('someone up the bank');T?.set?.(.25,{rise:.05,why:'the picture'});
  say([...(guided?[]:[{who:'SAM',text:'“Wait. Go back. There.”',by:'sam',time:1.4}]),{who:'SAM',text:'“Up the bank. Behind us.”',by:'sam',time:1.6,face:'afraid'},
   {who:'OFFICER REYES',text:'“That’s a post. Or a stump.”',from:reyes,time:1.8},{who:'SAM',text:'“There’s no post there. I walked right past there.”',by:'sam',time:2.4},
   {who:'JAMIE',text:'“It wasn’t there last night. I looked at that picture like fifty times.”',by:'jamie',time:3,face:'afraid'},{who:'OFFICER REYES',text:'“It’s dark. It’s a shadow.”',from:reyes,time:1.6},
   {wait:1.4,act:()=>{const d2=camBeside(1,.7,.5)();dad.walk([[d2.x,d2.z]],{speed:.6,then:a=>{a.lookAt=camera.position;}});}},{wait:4.6},{who:'',text:'Alex’s dad looks at it for a long time. He doesn’t say anything.',time:3.6}],
   {then:()=>{C.flags.silDone=true;}});}
 function copyRequest(){if(C.flags.copy)return;C.flags.copy=true;const M=C.meet;M.stage='give';M.giveAt=M.t;
  say([{who:'OFFICER REYES',text:'“I need to copy these. The station’s got a card reader.”',from:reyes,time:2.6},{who:'OFFICER REYES',text:'“You’ll have it back this afternoon. I promise.”',from:reyes,time:2.2}],
   {then:()=>{if(C.view==='camera')closeView();objective('Give Officer Reyes the camera.','F, by Reyes.');reyes.gest('point',camera.position);}});}
 function giveCamera(){if(C.flags.given||phys.playerBusy())return;o.roam.walkLock=true;
  phys.playerReach({at:()=>reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),onContact:()=>{C.flags.given=true;C.inv.camera='reyes';camHand.visible=true;reyes.gest(null);sound('click',reyes.pos,{gain:.2});mark('the camera, to Reyes');},
   then:()=>{o.roam.walkLock=false;objective('');later(1.2,()=>{camHand.visible=false;});jamieTells();}});}
 function jamieTells(){C.meet.stage='jamie';
  say([{wait:1.6},{who:'JAMIE',text:'“And then there was me.”',by:'jamie',time:1.6,face:'worried'},{who:'OFFICER REYES',text:'“You.”',from:reyes,time:.9,act:()=>{reyes.lookAt=jamie.person.group.position.clone().setY(1.3);}},
   {who:'JAMIE',text:'“In the cabin. In Owl. Standing where the shirt was. My hat. My shirt. My face.”',by:'jamie',time:3.6},
   {who:'JAMIE',text:'“It looked at me. And then it walked out at us.”',by:'jamie',time:2.6,face:'afraid'},{who:'SAM’S DAD',text:'“Jamie—”',from:samDad,time:.9},
   {who:'JAMIE',text:'“I’m not making it up.”',by:'jamie',time:1.4,face:'frustrated'},{who:'OFFICER REYES',text:'“I didn’t say you were.”',from:reyes,time:1.6,act:()=>reyes.gest('talk')},
   {who:'OFFICER REYES',text:'“Did it say anything?”',from:reyes,time:1.4},{wait:1},{who:'JAMIE',text:'“…It smiled.”',by:'jamie',time:1.4},{wait:2.4},
   {who:'OFFICER REYES',text:'“Okay. Here’s where I am.”',from:reyes,time:1.8,act:()=>{reyes.lookAt=camera.position;}},
   {who:'OFFICER REYES',text:'“A shirt. A place. A date. Pictures. That I can do something with. Today.”',from:reyes,time:3.6},
   {who:'OFFICER REYES',text:'“The rest, I’m writing down. All of it. Because you told me. That much I can promise you.”',from:reyes,time:4},{wait:1.6},
   {who:'SAM’S DAD',text:'“Four miles. On your bikes. And you told your mother you were at Jamie’s.”',from:samDad,time:3.4,act:()=>{samDad.lookAt=sam.person.group.position.clone().setY(1.3);samDad.gest(null);}},
   {who:'SAM',text:'“I know.”',by:'sam',time:1,face:'sad'},{wait:1.2},{who:'SAM’S DAD',text:'“We’ll talk about it.”',from:samDad,time:1.6,act:()=>samDad.gest('fold')},{wait:1.6},
   {who:'OFFICER REYES',text:'“Here’s what happens now. I call the county. Deputies go out to that camp this morning. Dogs. The pump house. The whole grid.”',from:reyes,time:5.4},
   {who:'ALEX’S DAD',text:'“I’m going with them.”',from:dad,time:1.6},{who:'OFFICER REYES',text:'“Sir, I’d rather you—”',from:reyes,time:1.4},{who:'ALEX’S DAD',text:'“I’m going.”',from:dad,time:1.2},{wait:1.4},
   {who:'OFFICER REYES',text:'“…Then you ride out with the deputies. Not on your own.”',from:reyes,time:2.6,act:()=>{reyes.gest('radio');}},
   {who:'OFFICER REYES',text:'“Dispatch, twelve. I need the county at Camp Whippoorwill, off the reservoir road. Possible evidence, missing juvenile.”',from:reyes,time:4.6,act:()=>sound('squelch',reyes.pos,{gain:.4})},
   {who:'DISPATCH (RADIO)',text:'“Twelve, copy. Advising county.”',time:1.8,act:()=>reyes.gest(null)},
   {who:'OFFICER REYES',text:'“I’m pulling the ninety-one file. The Whitcomb search. All of it.”',from:reyes,time:2.6},
   {who:'OFFICER REYES',text:'“And you three stay out of places like that. Storm drains. The woods. Anywhere you’d have to lie to get to.”',from:reyes,time:4},{wait:1},
   {who:'SAM',text:'“Officer Reyes?”',by:'sam',time:1},{who:'OFFICER REYES',text:'“Yeah.”',from:reyes,time:.8},
   {who:'SAM',text:'“In the paper. In ninety-one. Somebody saw something pale in the storm culvert under the Mill Street bridge. Where does that pipe go?”',by:'sam',time:5,face:'concerned'},
   {who:'OFFICER REYES',text:'“…I don’t know.”',from:reyes,time:1.2},{who:'SAM',text:'“Ours goes under Briarwood. Into the woods. Into the big pipe.”',by:'sam',time:2.8},
   {who:'OFFICER REYES',text:'“I’ll ask Public Works.”',from:reyes,time:1.4,act:()=>reyes.gest('talk')},{wait:1},
   {who:'OFFICER REYES',text:'“One more thing. I want to see it. Sunday night. Where you were, where he turned. Meet me at the corner of Briarwood at eleven. I’ve got calls to make first.”',from:reyes,time:6},
   {who:'JAMIE',text:'“Start at the oak. That’s where he heard it.”',by:'jamie',time:2.2},{who:'OFFICER REYES',text:'“Then start at the oak.”',from:reyes,time:1.6}],
   {then:meetEnd});}
 function meetEnd(){C.meet.stage='done';C.flags.met=true;mark('the meeting, over');objective('Ride to the old oak.','The end of Oak Hollow. With Jamie and Sam.');
  // Reyes to the car, and away; Alex's dad to the deputies (out of sight down the street); Sam's dad inside
  const car=k.carA,door={x:car.x+Math.cos(car.a)*1.4,z:car.z+Math.sin(car.a)*1.4};reyes.gest(null);reyes.lookAt=null;reyes.walk([[drive(1,8).x,drive(1,8).z],[door.x,door.z]],{speed:1.15,then:a=>{a.show(false);sound('carDoor',car.pos,{gain:.6});later(1.4,()=>{const p2=main(SH.drivD-120,-2.2);car.go([[p2.x,p2.z]],{speed:()=>8,then:c=>c.show(false)});});}});
  bagHand.visible=false;
  dad.gest(null);dad.walk([[drive(-2.5,9).x,drive(-2.5,9).z],[main(SH.drivD-30,-6.9).x,main(SH.drivD-30,-6.9).z]],{speed:1,then:a=>a.show(false)});
  const inside=drive(3.6,-5);samDad.gest(null);samDad.walk([[inside.x,inside.z]],{speed:.9,then:a=>a.show(false)});
  later(2,()=>{for(const c of [jamie,sam])stand(c,null);toBikes();go('d6-oak');C.oak={t:0};});}
 // each to his own bike: walk to it, the stand up, on, down the drive to wait
 function toBike(c,delay){later(delay,()=>{const a=c.ba,s2={x:c.bx-Math.cos(a)*.43,z:c.bz-Math.sin(a)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2),w=drive(c===jamie?-1.15:-2.55,c===jamie?11.2:9.6);
  stand(c,null);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:1.35}),comp.steps.turnTo(c,()=>c.ba,.5),comp.steps.kickUp(c),comp.steps.mount(c,.85),comp.steps.wait(.4),
   comp.steps.rideTo(c,[[w.x,w.z]],{vmax:1.8,vend:0}),comp.steps.brake(c,.3)],{then:()=>{c.follow=null;C.flags['ready-'+c.key]=C.t;follow(true);}});});}
 function toBikes(){toBike(jamie,.8);toBike(sam,1.6);}
 // ---- Act II: the oak; Jamie's house; Briarwood -------------------------------------------------------------------------------------
 function updateOak(dt){const X=C.oak;X.t+=dt;const p=me(),L=nav.locate(p.x,p.z),d=L.street==='main'?L.d:0;
  if(!X.talk){const close=[jamie,sam].every(c=>Math.hypot((c.mode==='ride'?c.bx:c.px)-p.x,(c.mode==='ride'?c.bz:c.pz)-p.z)<15);
   if(d>1121&&close&&(p.walking||(p.riding&&(p.speed||0)<.5))){X.wait=(X.wait||0)+dt;if(X.wait>1.2)oakTalk();}
   if(X.t>220&&!X.nudge&&!busy()){X.nudge=true;say([{who:'JAMIE',text:'“The oak. Come on.”',by:'jamie'}]);}
   if(X.t>320)carry('oak',[LOOK.stop.x+.6,LOOK.stop.z],headingTo(LOOK.stop.x,LOOK.stop.z,LOOK.oak.x,LOOK.oak.z),{after:oakTalk});}
  else if(X.done&&!X.left){X.after=(X.after||0)+dt;if(X.after>(X.chalk?6:4)&&!busy()){X.left=true;streetStart();}}}
 function oakTalk(){const X=C.oak;if(X.talk)return;X.talk=true;checkpoint('c6-oak');C.hMin=HOUR.oak;mark('the oak');
  const oj=main(LOOKOUT.oak.d-1.2,LOOKOUT.oak.lat-1.6),os=main(LOOKOUT.bench.d,LOOKOUT.bench.lat+1.2);
  stand(jamie,[oj.x,oj.z],{look:()=>LOOK.oak,keep:true,max:1.6,gesture:GEST.tense(.4)});stand(sam,[os.x,os.z],{look:()=>camera.position,keep:true,max:1.6});
  say([{wait:2},{who:'JAMIE',text:'“Sam told you. About the phone.”',by:'jamie',time:1.8,act:()=>{jamie.lookAt=camera.position;}},{who:'YOU',text:'“Yeah.”',time:.8},
   {who:'JAMIE',text:'“I didn’t call him. I swear. I was asleep. My mom checked on me at like one. She said I was snoring.”',by:'jamie',time:4,face:'frustrated'},
   {who:'SAM',text:'“I believe you.”',by:'sam',time:1.2},{who:'JAMIE',text:'“You say that like you’re not sure.”',by:'jamie',time:1.8},{who:'SAM',text:'“I’m sure it wasn’t you.”',by:'sam',time:1.6},{wait:2.6},
   {who:'JAMIE',text:'“It looked exactly like me.”',by:'jamie',time:1.8,face:'sad',act:()=>{jamie.lookAt=LOOK.chalk;}},{who:'SAM',text:'“We know.”',by:'sam',time:1},
   {who:'JAMIE',text:'“No. I don’t think you do.”',by:'jamie',time:1.6},{wait:2.4},
   {who:'JAMIE',text:'“It looked at me like I was the one who wasn’t supposed to be there.”',by:'jamie',time:3.4,face:'afraid'},{wait:3},
   {who:'SAM',text:'“…You had a pine needle stuck to your hat the whole way back. It didn’t.”',by:'sam',time:3.2},{who:'JAMIE',text:'“What?”',by:'jamie',time:.8,act:()=>{jamie.lookAt=sam.person.group.position.clone().setY(1.3);}},
   {who:'SAM',text:'“The other one. Its hat was clean. That’s how I knew which one was you.”',by:'sam',time:3},{who:'JAMIE',text:'“That’s so dumb.”',by:'jamie',time:1.2,face:'amused'},
   {who:'SAM',text:'“It’s not dumb. It’s how I knew.”',by:'sam',time:1.6},{wait:2},
   {who:'JAMIE',text:'“Remember when Alex tried to jump the curb right here? On the cruiser?”',by:'jamie',time:3,face:'happy'},{who:'SAM',text:'“He went over the bars.”',by:'sam',time:1.4,face:'amused'},
   {who:'JAMIE',text:'“He said he meant to.”',by:'jamie',time:1.2},{who:'YOU',text:'“He said he ‘chose to dismount.’”',time:1.8,faces:{jamie:'grin',sam:'amused'}},{wait:2.6},
   {who:'JAMIE',text:'“…Okay. Reyes. Briarwood.”',by:'jamie',time:1.8,face:'determined'}],{then:()=>{X.done=true;objective('Meet Officer Reyes at Briarwood.','Back down Oak Hollow, where Alex turned. You can look around first.');}});}
 function streetStart(){go('d6-street');C.st={t:0};for(const c of [jamie,sam])stand(c,null);follow(true);objective('Meet Officer Reyes at Briarwood.','Back down Oak Hollow, where Alex turned.');}
 // Jamie's house on the way: he goes to tell his mom; she isn't home; the door is left open; the stairs inside.
 function updateStreet(dt){const X=C.st;X.t+=dt;const p=me(),L=nav.locate(p.x,p.z),d=L.street==='main'?L.d:null;
  if(!X.stop&&d!==null&&d<815&&d>700){X.stop=true;jamieHome();}
  if(!X.stop&&X.t>260&&!busy()&&!X.nudge){X.nudge=true;say([{who:'SAM',text:'“Briarwood. It’s back that way.”',by:'sam'}]);}
  if(!X.stop&&X.t>380){X.stop=true;carry('street',[JDRIVE.x+2.2,JDRIVE.z+3.2],headingTo(JDRIVE.x,JDRIVE.z,JDOOR.x,JDOOR.z),{after:jamieHome});}}
 function jamieHome(){go('d6-jamie');const A2=C.anom={t:0,stage:'ride',seen:0,seenTotal:0,shown:false,gone:false,cue:false};mark('Jamie’s house');
  say([{who:'JAMIE',text:'“Hang on. I gotta tell my mom where I am. She’ll freak.”',by:'jamie',time:2.4}]);
  const stop=JBIKE;comp.run(jamie,[...(jamie.mode==='ride'?[comp.steps.rideTo(jamie,[[JDRIVE.x,JDRIVE.z],[stop.x,stop.z]],{vmax:3,vend:0}),comp.steps.brake(jamie,.3),comp.steps.dismount(jamie),comp.steps.kickstand(jamie)]:[]),
   comp.steps.walkTo(jamie,[[JSTEP.x,JSTEP.z],[JDOOR.x+(JSTEP.x-JDOOR.x)*.25,JDOOR.z+(JSTEP.z-JDOOR.z)*.25]],{speed:1.4}),comp.steps.turnTo(jamie,()=>headingTo(JSTEP.x,JSTEP.z,JDOOR.x,JDOOR.z),.4)],{then:()=>{A2.stage='door';A2.doorAt=C.t;}});
  stand(sam,[JDRIVE.x+.8,JDRIVE.z+1.6],{look:()=>JDOOR,keep:true,max:1.8});objective('Wait for Jamie.');}
 function updateJamie(dt){const X=C.anom;X.t+=dt;const p=me(),dp=dist2(p,JDOOR);const doorV=world.doors.jamie;
  if(X.stage==='door'){if(dp>34&&C.t-X.doorAt<50){if(!X.callBack&&!busy()){X.callBack=true;say([{who:'SAM',text:'“Hey! He’s just at his house!”',by:'sam'}]);}return;}
   X.stage='calling';C.jdoor=0;const opening=()=>{C.jdoor=Math.min(.9,C.jdoor+.05);if(C.jdoor<.9)later(.03,opening);};opening();sound('doorOpen',JDOOR,{gain:.5});void doorV;
   say([{wait:.6},{who:'JAMIE',text:'“Mom?”',by:'jamie',time:1},{wait:1.2},{who:'JAMIE',text:'“MOM?”',by:'jamie',time:1.1},{wait:1.6},
    {who:'JAMIE',text:'“…Her car’s gone. She works Thursdays. I forgot.”',by:'jamie',time:2.6,act:()=>{X.stage='back';X.backAt=C.t;
     comp.run(jamie,[comp.steps.walkTo(jamie,[[JSTEP.x,JSTEP.z],[JBIKE.x+.9,JBIKE.z+.6]],{speed:1.1})],{then:()=>{stand(jamie,camBeside(1,-.6,1.1),{look:()=>camera.position,max:1.6,keep:true});}});}},
    {who:'JAMIE',text:'“I’ll call her from Sam’s. She’ll say ‘where were you’ and then forget she was mad.”',by:'jamie',time:3.4,face:'amused'}]);}
  // the stairs inside the open door: him (once the real one has come away from it)
  if(X.stage==='back'&&!X.shown&&dist2({x:jamie.px,z:jamie.pz},JDOOR)>2.4){X.shown=true;X.shownAt=C.t;const a=headingTo(JFOYER.x,JFOYER.z,JSTEP.x,JSTEP.z);JAMIE2.show(true,{x:JFOYER.x,z:JFOYER.z,a,y:JFOYER.y+JH.floor});JAMIE2.ground=null;JAMIE2.tiltTo=.12;mark('the stairs');}
  if(X.shown&&!X.gone){const q={x:JAMIE2.x,y:JAMIE2.y+1.3,z:JAMIE2.z},look=k.camLooksAt(q,.94),front=frontOfDoor(p),occl=jamieInLine(q);
   const now=look&&front&&!occl&&dp<34&&(C.jdoor??0)>.5;if(now){X.seen+=dt;X.seenTotal+=dt;if(X.seenTotal>.25&&!C.flags.anomSeen){C.flags.anomSeen=true;T?.set?.(.5,{rise:.1,why:'Jamie on the stairs'});sound('creak',JDOOR,{gain:.18});}}
   else if(X.seenTotal>1.0||X.seen>0)X.lostAt=X.lostAt??C.t;
   // gone: the first moment it is not watched (once it has been, long enough), or when the foyer's lamp blinks after a while
   if(X.seenTotal>1.0&&!now)vanish('unwatched');
   if(X.seenTotal>4.8&&!X.cue){X.cue=true;X.cueAt=C.t;}if(X.cue&&C.t-X.cueAt>.25)vanish('the lamp');
   // never looked: Sam saw it (the fallback); then it is gone when nobody is looking
   if(!C.flags.anomSeen&&C.t-X.shownAt>7&&!X.samSaw&&!busy()){X.samSaw=true;sam.lookAt=JDOOR;say([{who:'SAM',text:'“Jamie. …Is somebody home?”',by:'sam',time:2,face:'afraid'}]);}
   if(!C.flags.anomSeen&&X.samSaw&&C.t-X.shownAt>12&&!now)vanish('Sam saw');}
  if(X.gone&&!X.reacted&&!busy()&&C.t-X.goneAt>.8)react();
  if(X.reacted&&X.done&&!X.left&&!busy()){X.left=true;go('d6-street');C.st.stop=true;C.st.after=true;follow(true);for(const c of [jamie,sam])stand(c,null);creekStage();}}
 const frontOfDoor=p=>{const n={x:JSTEP.x-JDOOR.x,z:JSTEP.z-JDOOR.z},l=Math.hypot(n.x,n.z)||1,dx=p.x-JDOOR.x,dz=p.z-JDOOR.z,d=Math.hypot(dx,dz)||1;return (dx*n.x+dz*n.z)/(l*d)>.55;};
 function jamieInLine(q){const e=camera.position,j={x:jamie.px,z:jamie.pz},dx=q.x-e.x,dz=q.z-e.z,L=Math.hypot(dx,dz)||1,t2=((j.x-e.x)*dx+(j.z-e.z)*dz)/(L*L);if(t2<0||t2>1)return false;return Math.hypot(e.x+dx*t2-j.x,e.z+dz*t2-j.z)<.32;}
 function vanish(why){const X=C.anom;if(X.gone)return;X.gone=true;X.goneAt=C.t;X.why=why;JAMIE2.show(false);mark('gone ('+why+')');}
 function react(){const X=C.anom;X.reacted=true;const close=()=>{comp.run(jamie,[comp.steps.walkTo(jamie,[[JSTEP.x,JSTEP.z],[JDOOR.x+(JSTEP.x-JDOOR.x)*.3,JDOOR.z+(JSTEP.z-JDOOR.z)*.3]],{speed:1.6}),
   comp.steps.act(()=>{const shut=()=>{C.jdoor=Math.max(0,(C.jdoor??.9)-.12);if(C.jdoor>0)later(.03,shut);else sound('doorSlam',JDOOR,{gain:.6});};shut();}),comp.steps.wait(.9),
   comp.steps.act(()=>{sound('click',JDOOR,{gain:.3});later(.5,()=>sound('thud',JDOOR,{gain:.3}));}),comp.steps.wait(.8),comp.steps.walkTo(jamie,[[JSTEP.x,JSTEP.z],[JBIKE.x+.8,JBIKE.z]],{speed:1.4})],{then:()=>{stand(jamie,null);}});};
  if(C.flags.anomSeen)say([{who:'YOU',text:'“Jamie.”',time:.8},{who:'JAMIE',text:'“What?”',by:'jamie',time:.7},{who:'YOU',text:'“Who’s in your house?”',time:1.4},
   {who:'JAMIE',text:'“Nobody. I just— nobody.”',by:'jamie',time:1.6,act:()=>{jamie.lookAt=JFOYER;}},{wait:1.8},{who:'JAMIE',text:'“…Why?”',by:'jamie',time:1,face:'afraid'},
   {who:'YOU',text:'“There was somebody on the stairs.”',time:1.8},{wait:1.4},...(X.samLook?[{who:'SAM',text:'“I saw it too.”',by:'sam',time:1.2}]:[]),
   {who:'JAMIE',text:'“…Was it me?”',by:'jamie',time:1.4,face:'terrified'},{wait:2.4,act:close},{who:'JAMIE',text:'“I’m locking it.”',by:'jamie',time:1.4},{wait:3},
   {who:'JAMIE',text:'“Let’s go. Let’s just go.”',by:'jamie',time:1.6,face:'afraid'}],{then:()=>{X.done=true;}});
  else say([{who:'JAMIE',text:'“No. I just said. Why?”',by:'jamie',time:1.6},{who:'SAM',text:'“I thought I saw somebody. On the stairs.”',by:'sam',time:2.2,face:'afraid'},
   {wait:.4,act:()=>{jamie.lookAt=JFOYER;}},{wait:1.8},{who:'JAMIE',text:'“There’s nobody.”',by:'jamie',time:1.2,act:close},{wait:3.2},
   {who:'JAMIE',text:'“There’s nobody, Sam.”',by:'jamie',time:1.4},{who:'SAM',text:'“Okay.”',by:'sam',time:.8},{wait:1.4},{who:'JAMIE',text:'“Let’s go.”',by:'jamie',time:1,face:'afraid'}],{then:()=>{X.done=true;}});
  C.flags.jamieShaken=true;}
 // Reyes at the creek: the cruiser up past the culvert, Reyes on foot by the railing
 function creekStage(){const car=k.carA,c=BW.car,c2=side(115,-3);car.show(true);car.park(c.x,c.z,headingTo(c.x,c.z,c2.x,c2.z));car.lights=false;car.headlights=false;
  reyes.show(true);reyes.place(BW.reyes.x,BW.reyes.z,headingTo(BW.reyes.x,BW.reyes.z,BW.gap.x,BW.gap.z));reyes.gest('fold');reyes.lookAt=null;
  objective('Meet Officer Reyes at Briarwood.','By the creek, where Alex turned. His car’s there.');C.cr={t:0};}
 function updateCreek(dt){const X=C.cr;if(!X)return;X.t+=dt;const p=me();
  if(!X.talk){if(dist2(p,BW.reyes)<14){creekTalk();}else if(X.t>240)carry('creek',[BW.creek.x-1.6,BW.creek.z-2.4],headingTo(BW.creek.x,BW.creek.z,BW.reyes.x,BW.reyes.z),{after:creekTalk});return;}}
 function creekTalk(){const X=C.cr;if(X.talk)return;X.talk=true;go('d6-creek');checkpoint('c6-creek');C.hMin=HOUR.creek;mark('Reyes at the creek');reyes.gest(null);reyes.lookAt=camera.position;
  stand(jamie,[BW.creek.x+1.6,BW.creek.z+.6],{look:()=>BW.gap,max:2,keep:true,leash:40});stand(sam,[BW.creek.x-1.2,BW.creek.z-.8],{look:()=>reyes.pos,max:2,keep:true,leash:40});
  say([{wait:.6},{who:'OFFICER REYES',text:'“You started at the oak.”',from:reyes,time:1.6},{who:'JAMIE',text:'“Yeah.”',by:'jamie',time:.8},
   {who:'OFFICER REYES',text:'“Sunday. About eight. He rode off ahead of you.”',from:reyes,time:2.6},
   {who:'SAM',text:'“Down Oak Hollow. He turned here. He rang his bell twice. And he stopped. Right there.”',by:'sam',time:3.8,act:()=>{sam.lookAt=BW.stop;}},
   {who:'SAM',text:'“He looked at the creek.”',by:'sam',time:1.4},{who:'OFFICER REYES',text:'“How long?”',from:reyes,time:1},{who:'SAM',text:'“A few seconds. Then he went round the curve.”',by:'sam',time:2.2},
   {who:'OFFICER REYES',text:'“And you didn’t see him after that.”',from:reyes,time:1.8},{who:'YOU',text:'“No.”',time:.8},{wait:1.6,act:()=>{reyes.lookAt=BW.gap;}},
   {who:'OFFICER REYES',text:'“Sunday night you were down there.”',from:reyes,time:1.6},{who:'JAMIE',text:'“Through the fence. There’s a gap.”',by:'jamie',time:1.6},
   {who:'OFFICER REYES',text:'“I know the gap. I walked that whole strip Monday. With a dog.”',from:reyes,time:3},{wait:1.4},
   {who:'OFFICER REYES',text:'“The dog wouldn’t go past the culvert. Sat down and wouldn’t move.”',from:reyes,time:3},{wait:1.8},
   {who:'SAM',text:'“The creek goes into the big pipe there. Under the yards. It comes out in the woods. At the end of Briarwood there’s an old road down to it.”',by:'sam',time:5.4},
   {who:'OFFICER REYES',text:'“You went in there.”',from:reyes,time:1.2,act:()=>{reyes.lookAt=sam.person.group.position.clone().setY(1.3);}},
   {who:'SAM',text:'“Monday night. We found his helmet. Inside. On a ledge. We left it there.”',by:'sam',time:3.4,face:'sad'},
   {who:'OFFICER REYES',text:'“You left it.”',from:reyes,time:1.2},{who:'SAM',text:'“We ran.”',by:'sam',time:.9},{wait:1.4},{who:'OFFICER REYES',text:'“…From what?”',from:reyes,time:1.2},
   {wait:2.6,act:()=>{jamie.lookAt=BW.gap;}},{who:'',text:'Nobody answers.',time:2.2},
   {wait:1.6,act:()=>{storm.strike(2600);C.stormTo=.12;}},{wait:5.5},
   {who:'OFFICER REYES',text:'“Storm’s coming in this afternoon. County’s got a watch out.”',from:reyes,time:2.6,act:()=>{reyes.lookAt=null;}},
   {who:'DISPATCH (RADIO)',text:'“Twelve, county advises deputies on scene at Whippoorwill. The father’s with them.”',time:3.4,act:()=>{reyes.gest('radio');sound('squelch',reyes.pos,{gain:.4});}},
   {who:'OFFICER REYES',text:'“Twelve, copy.”',from:reyes,time:1,act:()=>reyes.gest(null)},{wait:1},
   {who:'OFFICER REYES',text:'“Go home. Eat something. I’ll come by Sam’s around two with what I’ve got. If you’re there, you’re there.”',from:reyes,time:4.2,act:()=>{reyes.lookAt=camera.position;}}],
   {then:()=>{C.flags.creekDone=true;later(2.5,()=>recordsCarry());}});}
 function recordsCarry(){if(C.flags.toRecords)return;C.flags.toRecords=true;objective('A little after two · Sam’s garage','The storm, coming in over the ridge.');
  carry('records',drive(.2,-.4),driveA(0,0)+Math.PI,{after:()=>recordsStart()});}
 // ---- Act III: the plan, at two --------------------------------------------------------------------------------------------------------
 function recordsStage(){meetingStage(true);reyes.show(false);dad.show(false);k.carA.show(false);
  const wb=TL(1.5,1.6,.95);wxRadio.position.set(wb.x,wb.y-.04,wb.z);wxRadio.rotation.y=-driveA(0,0);wxRadio.visible=true;
  const sd=TL(1.55,1.15,0);samDad.show(true);samDad.place(sd.x,sd.z,headingTo(sd.x,sd.z,wb.x,wb.z));samDad.gest('fold');
  const js=TL(1.0,.25,0);comp.putFoot(jamie,js.x,js.z,headingTo(js.x,js.z,TL(0,0).x,TL(0,0).z),{bike:{x:drive(-.9,6.6).x,z:drive(-.9,6.6).z,a:driveA(-.9,6.6),kick:1}});
  const ss=G5.samStand(-.1);comp.putFoot(sam,ss.x,ss.z,driveA(0,0),{bike:{x:drive(-2.1,6.4).x,z:drive(-2.1,6.4).z,a:driveA(-2.1,6.4),kick:1}});
  for(const c of [jamie,sam]){c.follow=null;c.lookAt=null;}G5.S.map.restore?.();G5.S.bagP?.hide?.();// (Sam's backpack went home with him this morning)
  // Sam's notebook, open on the table: what he wrote down last night
  const nb=props.samNotes;if(!nb.parent)scene.add(nb);const nq=TL(.42,-.32,.726);nb.position.set(nq.x,nq.y,nq.z);nb.rotation.set(0,-driveA(0,0)+Math.PI+.12,0);nb.visible=true;
  C.stormTo=.32;C.rainTo=0;C.h=Math.max(C.h,HOUR.records);C.minute=-1;}
 function recordsStart(){go('e6-garage');checkpoint('c6-records');C.rec={t:0,stage:'wait'};recordsStage();mark('two o’clock');follow(false);
  stand(jamie,TL(1.0,.25,0),{look:()=>TL(0,0,.9),keep:true,max:1.4,gesture:GEST.sit(.0)});stand(sam,G5.samStand(-.1),{look:()=>TL(0,0,.75),keep:true,max:1.4});
  say([{wait:1.4},{who:'WEATHER RADIO',text:'“…the National Weather Service has issued a severe thunderstorm warning for the township and surrounding areas until eight P.M.…”',time:4.6},
   {who:'WEATHER RADIO',text:'“…one to two inches of rain, heaviest over the upper Mill Creek basin. Rapid rises on small streams and in storm drains…”',time:4.6},
   {who:'SAM’S DAD',text:'“That’s all we need.”',from:samDad,time:1.4,act:()=>samDad.gest(null)},{wait:1},
   {who:'JAMIE',text:'“My mom called. She said ‘you’re grounded’ and then she said ‘are you okay.’”',by:'jamie',time:3.2},{who:'SAM',text:'“What’d you say?”',by:'sam',time:1},
   {who:'JAMIE',text:'“Yes to both.”',by:'jamie',time:1.2,face:'amused'}],{then:()=>{C.rec.stage='car';reyesArrives();}});}
 function reyesArrives(){const car=k.carA,from=main(SH.drivD-90,-2.2),to=main(SH.drivD-7,-3.0),t2=main(SH.drivD+4,-3);car.show(true);car.park(from.x,from.z,headingTo(from.x,from.z,to.x,to.z));car.headlights=true;
  car.go([[to.x,to.z]],{speed:(c,r)=>Math.min(9,r*.8+1),then:c=>{c.headlights=false;sound('carDoor',c.pos,{gain:.5});const door={x:c.x+Math.cos(c.a)*1.4,z:c.z+Math.sin(c.a)*1.4},rp=mp('reyes');
   reyes.show(true);reyes.place(door.x,door.z,headingTo(door.x,door.z,rp.x,rp.z));reyes.walk([[drive(1,8).x,drive(1,8).z],[rp.x,rp.z]],{speed:1.1,then:a=>{a.faceTo(camera.position.x,camera.position.z);a.lookAt=camera.position;recordsTalk();}});
   planP.holdBy(reyes.person,'l');props.rolled(true);folderP.holdBy(reyes.person,'r');}});void t2;}
 function recordsTalk(){const X=C.rec;X.stage='camera';camHand.visible=true;folderP.hide();
  say([{who:'OFFICER REYES',text:'“Your camera. The pictures are on a disk at the station.”',from:reyes,time:2.6,act:()=>reyes.gest('point',camera.position)}],{then:()=>{objective('Take the camera.','F, from Officer Reyes.');C.flags.camBack=true;}});}
 function takeCameraBack(){if(C.inv.camera==='have'||phys.playerBusy())return;o.roam.walkLock=true;
  phys.playerReach({at:()=>reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),onContact:()=>{camHand.visible=false;C.inv.camera='have';reyes.gest(null);sound('click',reyes.pos,{gain:.2});},then:()=>{o.roam.walkLock=false;objective('');planTalk();}});}
 function planTalk(){const X=C.rec;X.stage='plan';const tp=TL(-.05,-.02,.724);
  say([{who:'OFFICER REYES',text:'“County’s at the camp. The pump house was open. Nothing in it.”',from:reyes,time:2.8},
   {who:'OFFICER REYES',text:'“The dogs went round and round grid seven. Then they sat down.”',from:reyes,time:2.8},{who:'JAMIE',text:'“Like at the culvert.”',by:'jamie',time:1.4},{wait:1.2},
   {who:'OFFICER REYES',text:'“And this. Public Works let me borrow it. Don’t spill anything on it.”',from:reyes,time:3,act:()=>{
    const P2=planP;P2.place(tp,new THREE.Euler(0,-driveA(0,0),0));props.rolled(false);C.inv.plan=true;sound('cloth',tp,{gain:.3});folderP.place(TL(-.55,.1,.73),new THREE.Euler(0,-driveA(0,0)+.2,0));}}],
   {then:()=>{objective('Look at the plan.','On the table. F.');X.planAt=C.t;}});}
 function lookPlan(){if(C.flags.planLook)return;C.flags.planLook=true;const tp=TL(-.05,-.02,.73);closeLook({x:tp.x,y:tp.y,z:tp.z},{back:.55,eye:1.32,kind:'plan',floor:drive(0,0).y});C.lookDur=999;mark('the plan');planWords();}
 function planWords(){if(C.flags.planWords)return;C.flags.planWords=true;const pt=(c,w)=>()=>{const q=TL(...w,.74);comp.run(c,[phys.reach(c,{at:()=>q,dur:[.55,.6,.45],carry:false})],{then:()=>stand(c,c===sam?G5.samStand(-.1):TL(1.0,.25,0),{look:()=>TL(0,0,.75),keep:true,max:1.4})});};
  const mk=id=>()=>props.mark(id);
  say([{wait:.8},{who:'SAM',text:'“Okay. This is Briarwood. Our creek.”',by:'sam',time:1.8,act:()=>{pt(sam,[.12,-.15])();later(.6,mk('alex'));}},
   {who:'SAM',text:'“Under the yards, into the culvert. Then this. Line Four. Through the woods.”',by:'sam',time:3.2,act:mk('line4')},
   {who:'SAM',text:'“And it comes out here. The outfall.”',by:'sam',time:1.8},
   {who:'OFFICER REYES',text:'“Then the creek runs north. To here.”',from:reyes,time:1.8,act:()=>reyes.gest('point',TL(-.1,.12,.74))},
   {who:'OFFICER REYES',text:'“‘Mill Creek Isolation Works. Gate Structure Number Two.’”',from:reyes,time:2.8},{who:'JAMIE',text:'“What’s an isolation works?”',by:'jamie',time:1.6},
   {who:'OFFICER REYES',text:'“Where they shut the creek out when Mill Creek floods. So it can’t back up into town.”',from:reyes,time:3.4,act:()=>reyes.gest(null)},{wait:1},
   {who:'SAM',text:'“And this comes in the other side. Line Two. Mill Street. ‘Brick, nineteen-oh-eight.’”',by:'sam',time:3.4,act:()=>pt(sam,[-.24,.05])()},
   {who:'SAM',text:'“Ninety-one. The pale thing in the culvert, under the Mill Street bridge. That’s Line Two.”',by:'sam',time:3.6,act:mk('dw')},
   {who:'OFFICER REYES',text:'“Sixty-six.”',from:reyes,time:1,act:()=>{folderP.holdBy(reyes.person,'r');}},
   {who:'OFFICER REYES',text:'“Ruth Ann Carver. Rode downtown to the Lyric. Searchers heard a bike bell at the Mill Street culvert that night.”',from:reyes,time:4.6,act:()=>later(4.8,()=>{folderP.place(TL(-.55,.1,.73),new THREE.Euler(0,-driveA(0,0)+.2,0));})},
   {who:'SAM',text:'“Mill Street again.”',by:'sam',time:1.2,act:mk('rac')},{who:'SAM',text:'“And Alex. Briarwood. Line Four.”',by:'sam',time:1.8},{wait:1},
   {who:'SAM',text:'“Line Four goes out to the creek. The creek comes here. Line Two comes in here.”',by:'sam',time:3.2,act:mk('meet')},{wait:1.2},
   {who:'SAM',text:'“…They meet. Right here.”',by:'sam',time:1.6,face:'afraid',act:mk('works')},
   {who:'OFFICER REYES',text:'“Ninety-one again.”',from:reyes,time:1.2},
   {who:'OFFICER REYES',text:'“‘August twenty-seventh. Public Works reports isolation gate two-B at the Mill Creek works found open. Padlock missing. K-9 would not enter Line Two.’”',from:reyes,time:5.6},
   {who:'SAM',text:'“Six days after Danny. Three days after the tracks at the camp.”',by:'sam',time:2.6},{wait:1},
   {who:'JAMIE',text:'“So what. Alex is in a sewer?”',by:'jamie',time:1.6,face:'frustrated'},{who:'SAM',text:'“No. I don’t know.”',by:'sam',time:1.2},
   {who:'SAM',text:'“I’m saying everything happened next to the same water.”',by:'sam',time:2.6},{wait:1.6},
   {who:'SAM',text:'“…Wait. There’s something else. This little box, at the works. ‘Trash rack.’”',by:'sam',time:3.2,act:()=>{pt(sam,[-.08,.14])();}},
   {who:'OFFICER REYES',text:'“The bar screen. It catches what comes down the creek.”',from:reyes,time:2.4},{wait:1.4},
   {who:'OFFICER REYES',text:'“…Public Works pulled a kid’s bike helmet out of it yesterday morning.”',from:reyes,time:3},{wait:2,act:mk('rack')},
   {who:'JAMIE',text:'“Red? With a seventeen?”',by:'jamie',time:1.6,face:'afraid'},{who:'OFFICER REYES',text:'“I didn’t ask.”',from:reyes,time:1.2},
   {who:'SAM',text:'“We left it in the drain. On the ledge. It was dry.”',by:'sam',time:2.4},{wait:1.4,act:()=>{storm.strike(1500);}},
   {who:'OFFICER REYES',text:'“Dispatch, twelve. Can you raise Brandt at Public Works?”',from:reyes,time:2.4,act:()=>{reyes.gest('radio');sound('squelch',reyes.pos,{gain:.4});}},
   {wait:2.2},{who:'DISPATCH (RADIO)',text:'“Twelve, Brandt says he’s at the Mill Creek works now. Says if you’re coming, come now. The creek’s coming up.”',time:4,act:()=>sound('squelch',reyes.pos,{gain:.4})},
   {who:'OFFICER REYES',text:'“Tell him I want that helmet. And I want to see gate two-B.”',from:reyes,time:2.6,act:()=>reyes.gest(null)}],
   {then:()=>{endLook();argument();}});}
 function argument(){const X=C.rec;X.stage='argue';
  say([{who:'OFFICER REYES',text:'“You three stay here.”',from:reyes,time:1.4},{who:'SAM',text:'“If it’s his, somebody has to say. His dad’s at the camp.”',by:'sam',time:2.6},
   {who:'JAMIE',text:'“We know his stuff better than anybody. Better than his dad.”',by:'jamie',time:2.6},{who:'SAM’S DAD',text:'“Absolutely not.”',from:samDad,time:1.4,act:()=>{samDad.gest(null);samDad.lookAt=reyes.pos;}},
   {wait:2.4,act:()=>{reyes.lookAt=null;}},{who:'',text:'Reyes looks out at the sky over the ridge for a while.',time:2.8},
   {who:'OFFICER REYES',text:'“…Here’s what I’ll do. They ride with me. They look at the helmet in the gatehouse, up top, where it’s dry. Then I drive them straight home.”',from:reyes,time:5.6,act:()=>{reyes.lookAt=samDad.pos;}},
   {wait:1.6},{who:'SAM’S DAD',text:'“…Twenty minutes. And Sam stays where you can see him.”',from:samDad,time:2.8},{who:'OFFICER REYES',text:'“Where I can see him.”',from:reyes,time:1.6},{wait:1.2},
   {who:'SAM’S DAD',text:'“Sam.”',from:samDad,time:.8,act:()=>{samDad.lookAt=sam.person.group.position.clone().setY(1.3);}},{who:'SAM',text:'“Yeah?”',by:'sam',time:.8},{wait:1},
   {who:'SAM’S DAD',text:'“…Stay with him.”',from:samDad,time:1.4},{who:'SAM',text:'“I will.”',by:'sam',time:1}],
   {then:()=>{X.stage='go';objective('Go with Officer Reyes.','His car, at the curb.');const car=k.carA,door={x:car.x+Math.cos(car.a)*1.4,z:car.z+Math.sin(car.a)*1.4};
    reyes.walk([[drive(1,8).x,drive(1,8).z],[door.x,door.z]],{speed:1.1,then:a=>{a.faceTo(camera.position.x,camera.position.z);}});planP.hide();// (the file stays on the table: copies)
    for(const c of [jamie,sam])stand(c,()=>{const cc=k.carA;return {x:cc.x-Math.cos(cc.a)*(c===jamie?1.5:1.7)-Math.sin(cc.a)*(c===jamie?.6:-1.2),z:cc.z-Math.sin(cc.a)*(c===jamie?1.5:1.7)+Math.cos(cc.a)*(c===jamie?.6:-1.2)};},{look:()=>camera.position,max:2.4,leash:60});}});}
 function updateRecords(dt){const X=C.rec;if(!X)return;X.t+=dt;
  if(X.stage==='camera'&&C.flags.camBack&&C.inv.camera!=='have'){X.camT=(X.camT||0)+dt;if(X.camT>30&&!X.camNudge&&!busy()){X.camNudge=true;say([{who:'OFFICER REYES',text:'“Here. Take it.”',from:reyes,time:1.2}]);}
   if(X.camT>70&&!busy()&&!phys.playerBusy()){camHand.visible=false;C.inv.camera='have';reyes.gest(null);sound('click',reyes.pos,{gain:.2});objective('');say([{who:'',text:'He puts it in your hands.',time:1.6}]);X.stage='plan0';later(1.8,planTalk);}}
  if(X.stage==='plan'&&X.planAt&&!C.flags.planLook&&C.t-X.planAt>26&&!busy()){if(!X.nudge){X.nudge=true;say([{who:'SAM',text:'“Come look at this.”',by:'sam',time:1.4}]);}else if(C.t-X.planAt>45){C.flags.planLook=true;planWords();}}
  if(X.stage==='go'){const car=k.carA;X.goT=(X.goT||0)+dt;if(X.goT>55&&!X.goNudge&&!busy()){X.goNudge=true;say([{who:'OFFICER REYES',text:'“Come on. Before it opens up.”',from:reyes,time:1.8}]);}if(X.goT>110)toWorks();void car;}}
 // into the car, and Old Mill Road, and the gravel track down to the creek
 function toWorks(){if(C.flags.toWorks||C.fadeOut>=0)return;C.flags.toWorks=true;objective('Old Mill Road · the Mill Creek works','Half past three.');C.fadeOut=0;sound('carDoor',k.carA.pos,{gain:.6});
  C.after=()=>{meetingStage(false);wxRadio.visible=false;samDad.show(false);folderP.hide();props.samNotes.removeFromParent();G5.reset?.();worksStart();};}
 // ---- Act IV: the works ---------------------------------------------------------------------------------------------------------------
 function worksPeople(){const pa=WPa(WS.arrive),c=WPa(WS.cruiser);
  o.placePlayer({x:pa.x,z:pa.z,a:headingTo(pa.x,pa.z,WPa(WS.houseDoor).x,WPa(WS.houseDoor).z),mode:'walk',bike:leftBike()});
  // (no bikes here: they came in Reyes's car)
  for(const [ch,dx,dz] of [[jamie,-1.4,.9],[sam,-1.7,-.9]]){const q=WP(WS.arrive[0]+dx,WS.arrive[1]+dz);comp.putFoot(ch,q.x,q.z,headingTo(q.x,q.z,WPa(WS.houseDoor).x,WPa(WS.houseDoor).z),{bike:null});ch.bike.group.visible=false;ch.follow=null;}
  C.flags.noBikes=true;reyes.show(true);reyes.place(c.x+1.2,c.z-1.6,headingTo(c.x,c.z,WPa(WS.houseDoor).x,WPa(WS.houseDoor).z));reyes.gest(null);reyes.lookAt=null;
  const b=WP(WS.truck[0]-1.6,WS.truck[1]+1.6);brandt.show(true);brandt.place(b.x,b.z,headingTo(b.x,b.z,pa.x,pa.z));brandt.gest('fold');}
 function worksStart(){fresh2();go('e6-yard');worksWorld();worksPeople();checkpoint('c6-works');C.hMin=HOUR.works;C.h=Math.max(C.h,HOUR.works);C.minute=-1;C.fadeIn=0;mark('the works');
  C.stormTo=.62;C.rainTo=.22;C.storm=Math.max(C.storm,.5);works.WATER.chan.want=-4.45;works.WATER.chan.y=-4.55;follow(true);minds();
  C.wk={t:0,stage:'hello'};yardTalk();}
 function fresh2(){C.flags.noBikes=true;}
 // (your bike stayed in Sam's drive: they came in Reyes's car)
 function leftBike(){const b=drive(1.3,5.4);return {x:b.x,z:b.z,a:driveA(1.3,5.4)};}
 function yardTalk(){const W=C.wk;
  say([{wait:1.2},{who:'MR. BRANDT',text:'“Officer.”',from:brandt,time:1,act:()=>{brandt.gest(null);brandt.walk([[WPa(WS.arrive).x+3,WPa(WS.arrive).z-1.5]],{speed:1,then:a=>{a.lookAt=camera.position;}});}},
   {who:'OFFICER REYES',text:'“Ray.”',from:reyes,time:.8},{who:'MR. BRANDT',text:'“These the boys?”',from:brandt,time:1.2},{who:'OFFICER REYES',text:'“These are the boys.”',from:reyes,time:1.2},
   {who:'MR. BRANDT',text:'“Ray Brandt. Thirty-one years with the township. I’ve pulled a lot of things out of that rack.”',from:brandt,time:3.8},
   {who:'MR. BRANDT',text:'“Never a kid’s helmet.”',from:brandt,time:1.6,act:()=>{brandt.lookAt=null;}},{wait:.8},
   {who:'MR. BRANDT',text:'“Here. Take these. The lights down there are older than I am.”',from:brandt,time:2.6,act:()=>{brandt.gest('point',camera.position);}}],
   {then:()=>{W.stage='lights';objective('Take the flashlight.','From Mr. Brandt.');jamie.lookAt=brandt.pos;}});}
 function takeLight(){if(C.inv.flashlight||phys.playerBusy())return;o.roam.walkLock=true;
  phys.playerReach({at:()=>brandt.person.parts.rhand.getWorldPosition(new THREE.Vector3()),onContact:()=>{C.inv.flashlight=true;o.setFlashlight?.(true,false);brandt.gest(null);sound('click',brandt.pos,{gain:.2});},
   then:()=>{o.roam.walkLock=false;C.wk.stage='go';objective('Go into the gatehouse.','The door on its east side.');jamie.lookAt=null;
    say([{who:'MR. BRANDT',text:'“The helmet’s inside. Come on, before this opens up.”',from:brandt,time:2.2,act:()=>{const d=WPa(WS.houseIn);brandt.walk([[WPa(WS.houseDoor).x,WPa(WS.houseDoor).z],[d.x-1,d.z+1.6]],{speed:1.1,then:a=>{a.lookAt=null;}});
      const r=WP(19.5,-5.6);reyes.walk([[WPa(WS.houseDoor).x,WPa(WS.houseDoor).z],[r.x,r.z]],{speed:1.05,then:a=>{a.faceTo(WPa(WS.helmet).x,WPa(WS.helmet).z);}});}}]);}});}
 // the yard's two side looks: the river in its channel, the sign on the gatehouse
 function lookChannel(){if(C.looked.has('channel'))return;C.looked.add('channel');const q=WP(7.6,-20);closeLook({x:q.x,y:-2,z:q.z},{back:.9,eye:1.42,kind:'channel'});C.lookDur=8;
  say([{who:'SAM',text:'“It’s way higher than our creek ever gets.”',by:'sam',time:2},{who:'MR. BRANDT',text:'“Rain upstream. The ridge got an inch since noon. It all comes down here.”',from:brandt,time:3.2}]);}
 function houseIn(){const W=C.wk;if(W.stage==='house')return;W.stage='house';go('e6-house');mark('the gatehouse');
  const hb=WPa(WS.helmet);helmetP.place(new THREE.Vector3(hb.x,FLOOR.house+.82,hb.z),new THREE.Euler(0,.6,0));const bin=props.bin;if(!bin.parent)scene.add(bin);bin.position.set(hb.x,FLOOR.house+.77,hb.z);bin.visible=true;
  const lg=WPa(WS.log);const log=props.log;if(!log.parent)scene.add(log);log.position.set(lg.x,FLOOR.house+.77,lg.z);log.rotation.y=-.1;log.visible=true;
  stand(jamie,WP(17.6,.2),{look:()=>({x:hb.x,y:FLOOR.house+.9,z:hb.z}),max:1.6,keep:true,leash:30});stand(sam,WP(18.4,-.4),{look:()=>({x:hb.x,y:FLOOR.house+.9,z:hb.z}),max:1.6,keep:true,leash:30});
  objective('Look at the helmet.','In the bin on the desk.');}
 function lookHelmet(){if(C.flags.helmetSeen)return;C.flags.helmetSeen=true;const hb=WPa(WS.helmet);closeLook({x:hb.x,y:FLOOR.house+.95,z:hb.z},{back:.55,eye:1.36,kind:'helmet',floor:FLOOR.house});C.lookDur=11;mark('the helmet');T?.set?.(.22,{rise:.03,why:'his helmet'});
  say([{wait:.8},{who:'JAMIE',text:'“That’s his.”',by:'jamie',time:1,face:'sad'},{who:'SAM',text:'“Seventeen. And the strap’s broken. He caught it on the fence at the pool. In June.”',by:'sam',time:3.4},
   {wait:1.6},{who:'OFFICER REYES',text:'“Okay.”',from:reyes,time:1,act:()=>{endLook();bagHelmet();}}]);}
 function bagHelmet(){const hb=WPa(WS.helmet);reyes.walk([[hb.x+.9,hb.z-.7]],{speed:.8,then:a=>{a.faceTo(hb.x,hb.z);comp;later(.6,()=>{helmetP.holdBy(reyes.person,'r');later(1.2,()=>{helmetP.hide();C.inv.helmet='reyes';sound('cloth',reyes.pos,{gain:.3});logTalk();});});}});}
 function lookLog(){if(C.flags.logSeen)return;C.flags.logSeen=true;const lg=WPa(WS.log);closeLook({x:lg.x,y:FLOOR.house+.8,z:lg.z},{back:.55,eye:1.36,kind:'log',floor:FLOOR.house});C.lookDur=12;
  say([{who:'MR. BRANDT',text:'“That’s me. Twenty-fourth of August, yesterday. The rack, the helmet.”',from:brandt,time:3},{who:'MR. BRANDT',text:'“And that’s me in ninety-one. Six in the morning. Two-B wide open, the lock gone.”',from:brandt,time:3.6},
   {who:'MR. BRANDT',text:'“No marks on anything. Like somebody had the key. I was twenty-four. I put the new lock on myself.”',from:brandt,time:4}]);}
 function logTalk(){if(C.flags.logTalk)return;C.flags.logTalk=true;
  say([{wait:1},{who:'MR. BRANDT',text:'“You wanted to see two-B. It’s down below, in the junction chamber. Where Line Two comes in.”',from:brandt,time:3.6},
   {who:'OFFICER REYES',text:'“Boys stay up here.”',from:reyes,time:1.4},{who:'MR. BRANDT',text:'“Gallery’s fine. Dry as a bone. They can see the whole works from the gallery.”',from:brandt,time:3.2},{wait:1.4},
   {who:'OFFICER REYES',text:'“…The gallery. Not one step past it.”',from:reyes,time:2},
   {who:'OFFICER REYES',text:'“Sam. Take Ray’s spare radio. You’re the radio.”',from:reyes,time:2.4,act:()=>reyes.gest('point',sam.person.group.position.clone().setY(1.2))},{who:'SAM',text:'“Why me?”',by:'sam',time:.9},
   {who:'OFFICER REYES',text:'“Because you’ll answer it.”',from:reyes,time:1.6,act:()=>{comp.run(sam,[comp.steps.walkTo(sam,[[reyes.x+(sam.px-reyes.x)*.45,reyes.z+(sam.pz-reyes.z)*.45]],{speed:1}),phys.reach(sam,{at:()=>reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),dur:[.5,.15,.45],onContact:()=>{radioHand.visible=true;C.inv.radio=true;reyes.gest(null);}})],{then:()=>stand(sam,null)});}}],
   {then:()=>{C.wk.stage='down';objective('Go down to the gallery.','The stairs through the west wall.');galleryAdults();for(const c of [jamie,sam])stand(c,null);follow(true);}});}
 // Reyes and Brandt go down ahead, through the gallery and on down the south stairs to the landing
 function galleryAdults(){const r1=WPa(WS.stairTop),g1=WP(9.2,-6.9),g2=WPa(WS.gallerySouth),s2=WP(8,14),L=WPa(WS.L);
  brandt.walk([[r1.x,r1.z],[g1.x,g1.z],[g2.x,g2.z],[s2.x,s2.z],[L.x+.6,L.z+1.2]],{speed:1,then:a=>{a.faceTo(WPa(WS.Lgate).x,WPa(WS.Lgate).z);}});
  later(1.2,()=>reyes.walk([[r1.x,r1.z],[g1.x,g1.z],[g2.x,g2.z+.8]],{speed:1,then:a=>{a.faceTo(camera.position.x,camera.position.z);a.lookAt=camera.position;C.wk.reyesWait=true;}}));}
 function updateWorks(dt){const W=C.wk;if(!W)return;W.t+=dt;const p=me(),z=zone();
  if(W.stage==='lights'&&W.t>40&&!W.lightNudge&&!busy()){W.lightNudge=true;say([{who:'MR. BRANDT',text:'“Go on, take one.”',from:brandt,time:1.2}]);}
  if(W.stage==='lights'&&W.t>85&&!busy()&&!phys.playerBusy()){C.inv.flashlight=true;o.setFlashlight?.(true,false);brandt.gest(null);sound('click',brandt.pos,{gain:.2});say([{who:'',text:'He puts one in your hand anyway.',time:1.8}]);
   W.stage='go';W.goAt=W.t;objective('Go into the gatehouse.','The door on its east side.');jamie.lookAt=null;const d=WPa(WS.houseIn);brandt.walk([[WPa(WS.houseDoor).x,WPa(WS.houseDoor).z],[d.x-1,d.z+1.6]],{speed:1.1});
   const r=WP(19.5,-5.6);reyes.walk([[WPa(WS.houseDoor).x,WPa(WS.houseDoor).z],[r.x,r.z]],{speed:1.05,then:a=>{a.faceTo(WPa(WS.helmet).x,WPa(WS.helmet).z);}});}
  if(W.stage==='go'&&W.t-(W.goAt??=W.t)>100)carry('house',WP(19.6,-3.9),-Math.PI/2,{after:houseIn});
  if((W.stage==='go'||W.stage==='lights')&&(z==='house'||z==='door')){if(W.stage==='lights'){C.inv.flashlight=true;o.setFlashlight?.(true,false);}houseIn();}
  if(W.stage==='house'&&!C.flags.helmetSeen&&C.t>(W.houseAt??=C.t)+28&&!busy()){if(!W.hNudge){W.hNudge=true;say([{who:'OFFICER REYES',text:'“The bin. On the desk.”',from:reyes,time:1.4}]);}else if(C.t>W.houseAt+50){lookHelmet();}}
  if(W.stage==='down'&&(z==='gallery'||z==='bridge')){galleryStart();}
  if(W.stage==='down'&&W.t>(W.downAt??=W.t)+90&&!W.downNudge&&!busy()){W.downNudge=true;say([{who:'SAM',text:'“The stairs are through there. In the wall.”',by:'sam'}]);}
  if(W.stage==='down'&&W.t>W.downAt+150)carry('gallery',WP(8,-2),Math.PI,{after:galleryStart});}
 // ---- the gallery: the gates below, the gauge, a lamp at the dead end, and the radio --------------------------------------------------
 function galleryStart(){if(C.gal)return;go('e6-gallery');checkpoint('c6-gallery');C.gal={t:0};mark('the gallery');C.stormTo=.72;C.rainTo=.45;works.WATER.chan.want=-4.2;works.ST.wheelSpin=0;
  later(2,()=>{const L=WPa(WS.L);reyes.lookAt=null;reyes.walk([[WP(8,14).x,WP(8,14).z],[L.x-.8,L.z]],{speed:1,then:a=>{a.faceTo(WPa(WS.Lgate).x,WPa(WS.Lgate).z);}});});
  say([{wait:.8},{who:'OFFICER REYES',text:'“We’ll be right below you.”',from:reyes,time:1.4}]);works.setLamp('gal-0',0);}
 function updateGallery(dt){const X=C.gal;X.t+=dt;const p=me(),z=zone();
  // the dead end's lamp: on, by itself, for a moment, and off again
  if(X.t>18&&!X.flick){X.flick=true;works.setLamp('gal-0',.9,{rate:30,flick:1});sound('click',WPa(WS.galleryNorth),{gain:.15});later(1.4,()=>works.setLamp('gal-0',0,{rate:20}));
   later(1.8,()=>say([{who:'JAMIE',text:'“Did that light just—”',by:'jamie',time:1.4,act:()=>{jamie.lookAt=WPa(WS.galleryNorth);}},{who:'SAM',text:'“Old wiring.”',by:'sam',time:1}]));}
  if(X.t>34&&!X.radio&&!busy()){X.radio=true;radioTwice();}
  if(X.down&&(z==='stair2'||z==='L'))lowerStart();
  if(X.down&&C.t-X.downAt>70&&!X.nudge&&!busy()){X.nudge=true;say([{who:'OFFICER REYES (RADIO)',text:'“Boys. Down here. Now.”',time:1.6,act:()=>sound('c6Static',{x:sam.px,y:1,z:sam.pz},{gain:.4})}]);}
  if(X.down&&C.t-X.downAt>130)carry('lower',WP(8.6,18.4),Math.PI,{after:lowerStart});}
 function radioTwice(){const X=C.gal,ic=WPa(WS.intercom);ic.y=FLOOR.gallery+2.1;mark('the radio');
  for(const c of [jamie,sam])stand(c,null);
  say([{wait:.2,act:()=>sound('c6Static',{x:sam.px,y:1.2,z:sam.pz},{gain:.6})},{who:'OFFICER REYES (RADIO)',text:'“Sam, it’s Reyes. Stay right where you are. Don’t come down.”',time:3.2},
   {who:'SAM',text:'“…Okay.”',by:'sam',time:.9},{wait:3.4,act:()=>{X.echo=true;X.echoAt=C.t;sound('c6Static',ic,{gain:.7});}},
   {who:'REYES — BEHIND YOU',text:'“Sam, it’s Reyes. Stay right where you are. Don’t come down.”',time:3.2,act:()=>{for(const c of [jamie,sam]){c.lookAt=ic;}T?.set?.(.45,{rise:.08,why:'the voice behind'});}},
   {wait:1.6},{who:'JAMIE',text:'“…That came from back there.”',by:'jamie',time:1.6,face:'afraid'},
   {who:'SAM',text:'“Officer Reyes? Did you just say it twice?”',by:'sam',time:2,act:()=>sound('c6Static',{x:sam.px,y:1.2,z:sam.pz},{gain:.4})},{wait:1},
   {who:'OFFICER REYES (RADIO)',text:'“Say again?”',time:1},{who:'SAM',text:'“You said it twice. The second time it came from up here. From the end of the gallery.”',by:'sam',time:3.2},{wait:2.4},
   {who:'OFFICER REYES (RADIO)',text:'“…I said it once.”',time:1.4},{who:'MR. BRANDT (RADIO)',text:'“That old intercom picks up radio traffic sometimes. Bleed-over.”',time:2.8},{wait:1.8},
   {who:'OFFICER REYES (RADIO)',text:'“Come down here. All three of you. Right now. The stairs at the south end.”',time:3,act:()=>{for(const c of [jamie,sam])c.lookAt=null;}}],
   {then:()=>{X.down=true;X.downAt=C.t;works.prints.visible=true;objective('Go down to Reyes.','The stairs at the south end of the gallery.');follow(true);}});}
 function lookSpeaker(){if(C.looked.has('speaker'))return;C.looked.add('speaker');const ic=WPa(WS.intercom);closeLook({x:ic.x,y:FLOOR.gallery+1.9,z:ic.z+.15},{back:.6,eye:1.42,kind:'speaker',floor:FLOOR.gallery});C.lookDur=6;
  const close=Math.hypot(sam.px-ic.x,sam.pz-ic.z)<6;say([{who:'',text:'The speaker’s cable is cut. The end of it is green with corrosion.',time:3.4},...(close?[{who:'SAM',text:'“It’s not connected to anything.”',by:'sam',time:1.6}]:[])]);}
 // ---- below: the landing, 2B, the junction chamber -------------------------------------------------------------------------------------
 function lowerStart(){if(C.low)return;go('e6-lower');C.low={t:0,stage:'gate'};mark('the landing');C.stormTo=.85;C.rainTo=.8;works.WATER.chan.want=-4.0;
  reyes.lookAt=camera.position;const g=WPa(WS.Lgate);brandt.walk([[g.x+.7,g.z-.2]],{speed:.9,then:a=>{a.faceTo(g.x,g.z+2);}});
  say([{wait:.4},{who:'OFFICER REYES',text:'“Stay where I can see you. All of you.”',from:reyes,time:2},
   {who:'MR. BRANDT',text:'“This is two-B.”',from:brandt,time:1.2,act:()=>brandt.gest('point',WP(9,23,FLOOR.low+1.6))},
   {who:'MR. BRANDT',text:'“If the power goes, she drops by herself. Weight and a brake. So the river can’t come back up Line Two into town.”',from:brandt,time:4.4},
   {who:'OFFICER REYES',text:'“And in ninety-one somebody opened it.”',from:reyes,time:1.8},{who:'MR. BRANDT',text:'“From this side you’d need the crank or the panel upstairs. Both were locked.”',from:brandt,time:3,act:()=>brandt.gest(null)},{wait:.6}],
   {then:()=>{const sp=WP(GATE.sam.x,GATE.sam.z);comp.run(sam,[comp.steps.walkTo(sam,nav.walkPath({x:sam.px,z:sam.pz},sp).length?nav.walkPath({x:sam.px,z:sam.pz},sp):[[sp.x,sp.z]],{speed:1.1}),comp.steps.turnTo(sam,()=>headingTo(sam.px,sam.pz,WP(GATE.lever.x+.1,GATE.z+.21).x,WP(GATE.lever.x+.1,GATE.z+.21).z),.4)],
     {then:()=>{stand(sam,[sp.x,sp.z],{look:()=>WP(GATE.lever.x+.1,GATE.z+.21,FLOOR.low+1.55),keep:true,max:.6,leash:40});plateTalk();}});
    const j=WPa(WS.J);brandt.walk([[WP(9,22).x,WP(9,22).z],[j.x,j.z]],{speed:.9});objective('');}});}
 function plateTalk(){
  say([{who:'SAM',text:'“‘Pull and hold to stop leaf. Release: leaf lowers. Fail-safe.’”',by:'sam',time:3},
   {who:'MR. BRANDT',text:'“That’s the hand brake. Return spring’s busted. Been asking for the part since June.”',from:brandt,time:3.4},
   {who:'MR. BRANDT',text:'“If you ever have to use it, you hold it. You let go, she drops.”',from:brandt,time:2.6},{who:'SAM',text:'“Okay.”',by:'sam',time:.8},
   {wait:.6}],{then:printsBeat});}
 // the wet prints on the landing: out from under the gate to the foot of the stairs, a pair there facing up, and back
 const PRINTS_AT={x:8,z:16.95};
 function printsBeat(){const X=C.low;X.stage='prints';X.printsAt=C.t;mark('the prints');const pq=WP(PRINTS_AT.x,PRINTS_AT.z,FLOOR.low);
  stand(jamie,WP(8.9,17.9),{look:()=>pq,keep:true,max:.8,leash:30,gesture:GEST.tense(.5)});
  say([{who:'JAMIE',text:'“Guys. Look down.”',by:'jamie',time:1.4,face:'afraid',act:()=>{jamie.lookAt=pq;}},{wait:1.2},{who:'SAM',text:'“Those are shoes.”',by:'sam',time:1.2},
   {who:'JAMIE',text:'“Those are his. The checkers on the bottom. His Vans. He wore them every single day.”',by:'jamie',time:3.4},
   {who:'MR. BRANDT',text:'“Nobody’s been down here since I pulled the rack yesterday morning.”',from:brandt,time:2.6,act:()=>{brandt.lookAt=pq;}},
   {who:'SAM',text:'“They’re wet. Everything else down here is dry.”',by:'sam',time:2.2,face:'concerned'},{wait:1.4},
   {who:'SAM',text:'“They come out from under the gate. To here. And they stop. Both feet. Pointing up the stairs.”',by:'sam',time:4,act:()=>{sam.lookAt=WP(8,12,FLOOR.gallery+1.4);}},
   {wait:1.2},{who:'JAMIE',text:'“Up at the gallery.”',by:'jamie',time:1.4,act:()=>{jamie.lookAt=WP(8,11,FLOOR.gallery+1.6);}},{wait:1},{who:'JAMIE',text:'“…At us.”',by:'jamie',time:1.2,face:'terrified'},{wait:1.6},
   {who:'OFFICER REYES',text:'“Nobody step on them.”',from:reyes,time:1.4,act:()=>{reyes.lookAt=pq;}},
   {who:'OFFICER REYES',text:'“Dispatch, twelve. I need county ID out to the Mill Creek works. Footwear impressions. Fresh.”',from:reyes,time:3.8,act:()=>{reyes.gest('radio');sound('squelch',reyes.pos,{gain:.4});}},
   {who:'DISPATCH (RADIO)',text:'“Twelve, county ID is committed at Whippoorwill. Could be a couple hours.”',time:3,act:()=>reyes.gest(null)},{wait:1},
   {who:'OFFICER REYES',text:'“…Ray. Where do they go?”',from:reyes,time:1.4},{who:'MR. BRANDT',text:'“Back under two-B. Toward Line Two.”',from:brandt,time:2},
   {who:'MR. BRANDT',text:'“Line Two’s at the end. Come look. Stay on the walkway side.”',from:brandt,time:2.4,act:()=>{brandt.lookAt=null;const gr=WP(9.6,34.2);brandt.walk([[gr.x,gr.z]],{speed:.9,then:a=>{a.faceTo(WPa(WS.Jlamp).x,WPa(WS.Jlamp).z+3);}});
    const rr=WP(8.4,33.6);later(.8,()=>{reyes.lookAt=null;reyes.walk([[WP(9,22).x,WP(9,22).z],[rr.x,rr.z]],{speed:.9,then:a=>{a.faceTo(WP(9,37).x,WP(9,37).z);a.gest('flashlight');}});});}}],
   {then:()=>{C.low.stage='j';objective('Follow Brandt to Line Two.','The far end of the junction chamber.');follow(true);stand(jamie,null);for(const c of [jamie,sam])c.lookAt=null;}});}
 function lookPrints(){if(C.looked.has('prints'))return;C.looked.add('prints');const q=WP(PRINTS_AT.x,PRINTS_AT.z,FLOOR.low);closeLook({x:q.x,y:q.y,z:q.z},{back:.55,eye:1.0,kind:'prints',floor:FLOOR.low});C.lookDur=6;mark('the prints, close');
  say([{who:'',text:'Small. Narrower than yours. The checkerboard of the sole, sharp at the edges, still shining.',time:4},{who:'',text:'Whoever stood here was looking up.',time:2.6}]);}
 function updateLower(dt){const X=C.low;X.t+=dt;const p=me();
  if(X.stage==='j'&&near(WP(9,33),4.2))grilleStart();
  if(X.stage==='j'&&C.t-(X.jAt??=C.t)>70&&!X.nudge&&!busy()){X.nudge=true;say([{who:'MR. BRANDT',text:'“Down here. Watch your step, it’s slick.”',from:brandt}]);}
  if(X.stage==='j'&&C.t-X.jAt>130)carry('line-two',WP(9,31.4),Math.PI,{after:grilleStart});}
 // ---- Line Two: the bell, the figure up the pipe, and the grille ----------------------------------------------------------------------------
 const AXSTAND={x:9.6,z:49.5};
 function grilleStart(){if(C.gr)return;go('e6-grille');checkpoint('c6-grille');C.gr={t:0,stage:'look',seen:0};mark('Line Two');
  stand(jamie,WP(8.6,34.9),{look:()=>WP(9,40,FLOOR.low+1),keep:true,max:.8,leash:30});
  say([{wait:.4},{who:'MR. BRANDT',text:'“Line Two. Mill Street. Brick, nineteen-oh-eight. A mile of it, under town.”',from:brandt,time:3.4},
   {who:'MR. BRANDT',text:'“That grille’s padlocked. I locked it myself, in March.”',from:brandt,time:2.4},
   {who:'OFFICER REYES',text:'“How far before you could stand up in it?”',from:reyes,time:2},{who:'MR. BRANDT',text:'“You can’t. Forty-two inches. You crawl.”',from:brandt,time:2.2},{wait:2.2}],
   {then:()=>{C.gr.stage='bell';C.gr.bellAt=C.t;const b=WP(9.4,52,FLOOR.low+1);o.audio?.()?.bell3?.(b,.6,{tunnel:true,ref:4});sound('bell',b);later(.62,()=>o.audio?.()?.bell3?.(b,.6,{tunnel:true,ref:4}));mark('the bell, up Line Two');
    for(const c of [jamie,sam])glance(c,WP(9,44,FLOOR.low+1),4);T?.set?.(.35,{rise:.06,why:'the bell'});
    say([{wait:2.2},{who:'JAMIE',text:'“…You heard that.”',by:'jamie',time:1.2,face:'afraid'},{who:'MR. BRANDT',text:'“Probably a—”',from:brandt,time:1},{wait:2.6,act:()=>{works.setLamp('J-c',.5,{rate:20,flick:1});later(1.2,()=>works.setLamp('J-c',1,{rate:6}));}}],{then:()=>{C.gr.stage='figure';C.gr.figAt=C.t;}});}});}
 function updateGrille(dt){const X=C.gr;X.t+=dt;const p=me(),G=WP(9,GATE.z+12.95,FLOOR.low+1.1);
  if(X.stage==='figure'){if(!X.shown&&(k.camLooksAt(G,.88)||C.t-X.figAt>7)){X.shown=true;X.shownAt=C.t;const q=WP(AXSTAND.x,AXSTAND.z);AX.show(true,{x:q.x,z:q.z,a:Math.PI,y:FLOOR.low+.05});AX.ground=null;AX.lookAt(camera.position);reyes.lookAt=q;mark('Alex, up the pipe');}
   if(X.shown){const q={x:AX.x,y:AX.y+1.25,z:AX.z};if(k.camLooksAt(q,.97)){X.seen+=dt;if(X.seen>.3&&!C.flags.axSeen){C.flags.axSeen=true;}}
    if(!X.called&&(X.seen>1.1||C.t-X.shownAt>6)&&!busy()){X.called=true;hope();}}}
  if(X.stage==='charge'){X.ct=(X.ct||0)+dt;if(!X.hit&&AX.z<=works.local(0,GRILLE_Z+.35).z){X.hit=true;grilleHit();}}
  if(X.stage==='after'&&X.done&&!X.flood){X.ft=(X.ft||0)+dt;if(X.ft>2.4&&!busy())floodStart();}}
 const GRILLE_Z=35.95;
 function hope(){const X=C.gr;
  comp.run(jamie,[comp.steps.walkTo(jamie,[[WP(9.1,35.5).x,WP(9.1,35.5).z]],{speed:1.6}),comp.steps.act(()=>{stand(jamie,WP(9.1,35.5),{look:()=>({x:AX.x,y:AX.y+1.3,z:AX.z}),keep:true,max:.4,gesture:GEST.brake(.9),leash:30});})]);
  say([{who:'JAMIE',text:'“…Alex?”',by:'jamie',time:1.2,face:'surprised'},{wait:.8},{who:'JAMIE',text:'“ALEX! It’s me! It’s Jamie!”',by:'jamie',time:1.8,face:'hopeful'},
   {who:'OFFICER REYES',text:'“Hey— HEY! Police! Stay right there! We’re going to get you out!”',from:reyes,time:2.6},{wait:1.2},{who:'SAM',text:'“Jamie, get back from the bars.”',by:'sam',time:1.6},{wait:.5}],
   {then:()=>{X.stage='charge';const g=WP(AXSTAND.x-.4,GRILLE_Z+.32);AX.lookTo=0;AX.go([{x:g.x,z:g.z}],{speed:7.6,accel:16});AX.face.set('grin',{hold:99});mark('it runs');sound('c5Rush',{x:AX.x,y:1,z:AX.z},{gain:.8});}});}
 function grilleHit(){const X=C.gr;X.stage='after';const g=WP(9,GRILLE_Z,FLOOR.low+1.1);AX.stop();AX.reachTo=1;AX.hit=1;works.ST.grilleShake=1.2;sound('c6Grate',g,{gain:1.2});sound('c6Hit',g,{gain:.8});o.foot.land=.07;T?.set?.(.92,{rise:.6,why:'the grille'});mark('the grille');
  // Jamie goes over backwards, into the water on the floor
  stand(jamie,null);comp.run(jamie,[comp.steps.idle(jamie,1.1,{gesture:(p,e)=>{const w=smooth(e/.35);p[PI.root+1]-=.55*w;p[PI.lean]-=.3*w;p[PI.root+2]+=.5*w;for(const f of [PI.lf,PI.rf])p[f+2]-=.5*w;}})],{then:()=>stand(jamie,WP(8.4,33.2),{look:()=>g,keep:true,max:1,leash:30})});
  later(.15,()=>sound('c6Splash',WP(9,35,FLOOR.low+.2),{gain:.6}));
  later(.65,()=>{works.lamps('J',0,{rate:40});works.setLamp('J-c',0,{rate:40});reyes.gest(null);});later(1.25,()=>{AX.show(false);});later(1.75,()=>{works.lamps('J',1,{rate:9});works.setLamp('J-c',1,{rate:9});reyes.gest('flashlight');});
  say([{wait:2.2},{who:'JAMIE',text:'“That was him— that was HIM—”',by:'jamie',time:1.8,face:'terrified'},{who:'SAM',text:'“That wasn’t him. Jamie. That wasn’t him.”',by:'sam',time:2,face:'terrified'},
   {who:'OFFICER REYES',text:'“That was a kid. That was a kid!”',from:reyes,time:1.6,act:()=>{reyes.gest(null);const rr=WP(8.6,35.4);reyes.walk([[rr.x,rr.z]],{speed:2,then:a=>{a.faceTo(g.x,g.z);sound('fence',g,{gain:.7});works.ST.grilleShake=.5;}});}},
   {who:'OFFICER REYES',text:'“Dispatch, twelve! I have a juvenile in the Line Two conduit at the Mill Creek works, possibly the missing— I need—”',from:reyes,time:4.2,act:()=>{reyes.gest('radio');sound('squelch',reyes.pos,{gain:.5});}},
   {who:'MR. BRANDT',text:'“That pipe runs a mile under town! There’s no way in from here!”',from:brandt,time:2.4},{who:'OFFICER REYES',text:'“Then we find a way in from somewhere!”',from:reyes,time:2,act:()=>reyes.gest(null)},{wait:1.2},
   {who:'MR. BRANDT',text:'“Reyes. The level.”',from:brandt,time:1.4,act:()=>{brandt.lookAt=WP(6.2,28,FLOOR.low+1.4);works.WATER.chan.want=-3.6;works.WATER.chan.rate=.12;}}],
   {then:()=>{X.done=true;}});}
 // ---- the water: the power, 2B coming down, Sam's hands on the brake --------------------------------------------------------------------------
 function floodStart(){const X=C.gr;X.flood=true;go('n6-flood');checkpoint('c6-emergency');C.fl={t:0,stage:'drop',crossed:false};C.flags.hurry=true;C.hMin=HOUR.flood;mark('the power');
  works.ST.power=false;works.ST.alarm=1;works.GS.mode='down';works.GS.held=false;works.GS.v=0;sound('c6Horn',WP(9,22,FLOOR.low+2));sound('c6Grind',WP(9,23,FLOOR.low+2.4),{gain:.9});
  works.WATER.chan.want=-3.0;works.WATER.chan.rate=.14;works.WATER.J.want=FLOOR.low+.45;works.WATER.J.rate=.03;S.flashOn=true;ch2.samBeam&&(ch2.samBeam.on=true);T?.set?.(.8,{rise:.2,why:'the power'});
  for(const c of [jamie])stand(c,null);
  say([{who:'MR. BRANDT',text:'“That’s the main— she’s dropping! Two-B’s dropping!”',from:brandt,time:2.2},{who:'OFFICER REYES',text:'“OUT! Everybody under the gate! Go, go, go!”',from:reyes,time:2.2,act:()=>{reyes.gest('flashlight');}}]);
  objective('Get under the gate.','Back the way you came. Now.');
  // Sam, at the brake: he sees it coming down, and takes hold
  later(4.2,()=>{say([{who:'SAM',text:'“It’s coming down— I’ve got the brake— I’ve got it!”',by:'sam',time:2.4,face:'terrified'}]);});
  // Brandt first, under and up the stairs for the generator; Jamie behind him
  const out=WP(9,20.4),up=WP(8,13);brandt.walk([[WP(9,26).x,WP(9,26).z],[WP(9,23.9).x,WP(9,23.9).z],[out.x,out.z],[up.x,up.z]],{speed:2.4,then:a=>a.show(false)});
  later(1.6,()=>say([{who:'MR. BRANDT',text:'“The generator— I can get the generator going!”',from:brandt,time:2}]));
  later(1.1,()=>{comp.run(jamie,[comp.steps.walkTo(jamie,[[WP(9,28).x,WP(9,28).z],[WP(9.2,24).x,WP(9.2,24).z]],{speed:2.8}),comp.steps.act(()=>{jamie.crouch=.28;}),comp.steps.walkTo(jamie,[[WP(8.8,21.6).x,WP(8.8,21.6).z]],{speed:1.6}),comp.steps.act(()=>{jamie.crouch=0;})],{then:()=>stand(jamie,WP(8.2,21.2),{look:()=>WP(9,25,FLOOR.low+1),keep:true,max:.8,leash:30})});});
  const rr=WP(9,26.5);reyes.walk([[rr.x,rr.z]],{speed:2,then:a=>{a.faceTo(camera.position.x,camera.position.z);a.lookAt=camera.position;}});}
 function updateFlood(dt){const X=C.fl;X.t+=dt;const p=me(),z=zone(),G=works.GS;
  // the brake: Sam has it once the leaf is a little way down
  if(!G.held&&G.mode==='down'&&G.gap<=1.68&&X.t>4){G.held=true;X.heldAt=C.t;sound('c6Clank',WP(GATE.lever.x,GATE.lever.z,FLOOR.low+1),{gain:.6});mark('Sam, on the brake');
   stand(sam,WP(GATE.sam.x,GATE.sam.z),{look:()=>camera.position,keep:true,max:.3,gesture:GEST.brake(1),leash:99});C.samHolds=true;later(.5,()=>say([{who:'SAM',text:'“GO! I’ve got it! GO!”',by:'sam',time:1.6,face:'terrified'}]));}
  if(G.held&&!X.crossed&&p.z!==undefined){const L=works.toLocal(p.x,p.z);if(L.z<22.6&&(z==='L'||z==='stair2')){X.crossed=true;X.crossedAt=C.t;crossed();}}
  if(!X.crossed){X.wait=(X.wait||0)+dt;
   if(X.wait>14&&!X.n1&&!busy()){X.n1=true;say([{who:'OFFICER REYES',text:'“MOVE! Under it! NOW!”',from:reyes,time:1.4}]);}
   if(X.wait>26&&!X.n2&&!busy()){X.n2=true;say([{who:'SAM',text:'“I can’t hold it forever! GO!”',by:'sam',time:1.6}]);}
   if(X.wait>48)carry('under',WP(8.8,20.6),Math.PI,{after:()=>{X.crossed=true;X.crossedAt=C.t;X.carried=true;crossed();}});}
  waterPace(dt);}
 function crossed(){const X=C.fl;X.stage='under';mark('under the gate');
  // Reyes, last: through it, and back for Sam; the surge
  const rr=WP(9,23.8);reyes.walk([[rr.x,rr.z]],{speed:1.8,then:a=>{a.faceTo(WP(GATE.sam.x,GATE.sam.z).x,WP(GATE.sam.x,GATE.sam.z).z);}});
  say([{wait:.6},{who:'OFFICER REYES',text:'“Sam! Let go and come under, I’ve got you—”',from:reyes,time:2.2},{who:'SAM',text:'“If I let go it drops! It doesn’t stop, it slams!”',by:'sam',time:2.4},
   {who:'OFFICER REYES',text:'“Then give me the—”',from:reyes,time:1.2,act:()=>surge()}],{then:()=>{holdStart();}});}
 function surge(){works.WATER.J.want=FLOOR.low+.85;works.WATER.J.rate=.55;works.WATER.L.want=FLOOR.low+.32;works.WATER.L.rate=.12;sound('c6Splash',WP(6.4,28,FLOOR.low+1),{gain:1});sound('c5Rush',WP(9,23,FLOOR.low+.6),{gain:.9});o.foot.land=.05;mark('the surge');
  const back=WP(9.4,20.8);reyes.path=null;reyes.walk([[back.x,back.z]],{speed:2.6,then:a=>{a.faceTo(WP(9,23).x,WP(9,23).z);a.gest('brace');}});
  stand(jamie,null);comp.run(jamie,[comp.steps.idle(jamie,.9,{gesture:(p,e)=>{const w=smooth(e/.3)*(1-smooth((e-.6)/.3));p[PI.root+1]-=.5*w;p[PI.lean]+=.5*w;}})],{then:()=>stand(jamie,WP(8.2,20.6),{look:()=>WP(9,25,FLOOR.low+1),keep:true,max:.6,leash:30})});
  T?.set?.(.9,{rise:.3,why:'the surge'});}
 // ---- the gate held: the pin that won't go in --------------------------------------------------------------------------------------------------
 function holdStart(){if(C.hold)return;go('n6-hold');checkpoint('c6-hold');C.hold={t:0,tries:0,stage:'pin'};mark('the gate held');
  const gq=WP(8.15,22.35);// (at the left of the gap, his light under the leaf: he sees through it, and so do you, past him)reyes.walk([[gq.x,gq.z]],{speed:1.4,then:a=>{a.faceTo(WP(9,24).x,WP(9,24).z);a.gest('flashlight');a.lookAt=WP(GATE.sam.x,GATE.sam.z,FLOOR.low+1.2);}});
  say([{who:'MR. BRANDT (RADIO)',text:'“Reyes! The pin! Red handle, on your side of the guide! Put it through and she holds by herself!”',time:3.6,act:()=>sound('c6Static',reyes.pos,{gain:.5})},
   {who:'MR. BRANDT (RADIO)',text:'“Then Sam can let go!”',time:1.4}],{then:()=>{objective('Pull the locking pin.','Red handle, on the wall by the gate.');C.hold.stage='pin';}});}
 function pullPin(){if(C.inv.pin||phys.playerBusy())return;o.roam.walkLock=true;
  phys.playerReach({at:()=>new THREE.Vector3(works.pinAt.stow.x,works.pinAt.stow.y,works.pinAt.stow.z),onContact:()=>{PIN.holdBy(o.self,'r');phys.playerHold('r',PIN);C.inv.pin='hand';sound('chain',works.pinAt.stow,{gain:.5});},
   then:()=>{o.roam.walkLock=false;objective('Push the pin through the guide.','The hole in the gate’s guide, waist high.');}});}
 function tryPin(){if(phys.playerBusy())return;const H=C.hold;o.roam.walkLock=true;H.tries++;
  phys.playerReach({at:()=>new THREE.Vector3(works.pinAt.hole.x,works.pinAt.hole.y,works.pinAt.hole.z),dur:[.38,.22,.4],onContact:()=>{sound('c6Clank',works.pinAt.hole,{gain:.9});o.foot.land=.02;},
   then:()=>{o.roam.walkLock=false;if(H.tries===1)say([{who:'YOU',text:'“It won’t go in!”',time:1.2},{who:'MR. BRANDT (RADIO)',text:'“It’s got to line up! She has to come up another inch!”',time:2.4},
    {who:'SAM',text:'“It won’t go UP! It only stops!”',by:'sam',time:1.6,face:'terrified'}],{then:()=>{H.ready=true;H.readyAt=C.t;}});
    else if(H.tries===2)say([{who:'JAMIE',text:'“Let me— let me try—”',by:'jamie',time:1.2,act:()=>{comp.run(jamie,[phys.reach(jamie,{at:()=>new THREE.Vector3(works.pinAt.hole.x,works.pinAt.hole.y,works.pinAt.hole.z),dur:[.4,.2,.4],onContact:()=>sound('c6Clank',works.pinAt.hole,{gain:.8})})]);}}]);}});}
 function crank(){if(phys.playerBusy())return;o.roam.walkLock=true;const cp=WP(GATE.crank.x,GATE.crank.z,FLOOR.low+1.05);
  phys.playerReach({at:()=>new THREE.Vector3(cp.x+.26,cp.y,cp.z),dur:[.35,.9,.35],onContact:()=>{C.crankT=1.2;sound('chain',cp,{gain:.4});},then:()=>{o.roam.walkLock=false;
   if(!C.flags.crankSaid){C.flags.crankSaid=true;say([{who:'',text:'The wheel spins. Nothing on the other end of it moves.',time:3},...(C.hold&&!C.hold.dbl?[{who:'MR. BRANDT (RADIO)',text:'“The crank’s been out since ninety-eight!”',time:2}]:[])]);}}});}
 function updateHold(dt){const H=C.hold;H.t+=dt;waterPace(dt);
  if(!H.dbl&&((H.ready&&C.t-H.readyAt>6)||H.t>38)&&!busy())doubleStart();}
 // ---- the other Sam --------------------------------------------------------------------------------------------------------------------------------
 function doubleStart(){const H=C.hold;if(H.dbl)return;H.dbl=true;go('n6-double');C.dbl={t:0,stage:'light',seen:0,both:0};mark('a light, at the far end');
  works.setLamp('J-c',1,{rate:2.5});works.LAMPS['J-c'].emerg=false;works.LAMPS['J-c'].force=true;// (the mains are dead; this one comes on anyway)
  const q=WPa(WS.Jlamp);SAM2.show(true,{x:q.x,z:q.z-.15,a:Math.PI,y:FLOOR.low});SAM2.ground=null;SAM2.copy=()=>sam.pose;SAM2.lag=.6;SAM2.copyWTo=.85;SAM2.tiltTo=.0;SAM2.lookAt(WP(GATE.sam.x,GATE.sam.z));
  for(const c of [jamie])glance(c,q,6);}
 function bothSeen(dt){const D=C.dbl,e=camera.position,s2={x:SAM2.x,y:SAM2.y+1.2,z:SAM2.z},s1={x:sam.px,y:(sam.py??FLOOR.low)+1.15,z:sam.pz};
  const through=q=>{const L=works.toLocal(e.x,e.z),Q=works.toLocal(q.x,q.z);if(L.z>=GATE.z)return true;const t2=(GATE.z-L.z)/((Q.z-L.z)||1e-6);if(t2<0||t2>1)return false;const x=L.x+(Q.x-L.x)*t2,y=e.y+(q.y-e.y)*t2;return x>GATE.x0+.05&&x<GATE.x1-.05&&y<FLOOR.low+works.GS.gap-.03&&y>FLOOR.low;};
  const v2=k.camLooksAt(s2,.95)&&through(s2),v1=k.camLooksAt(s1,.88)&&through(s1);if(v2)D.seen+=dt;if(v1&&v2)D.both+=dt;D.v2=v2;return v2;}
 function updateDouble(dt){const D=C.dbl;D.t+=dt;waterPace(dt);const v=bothSeen(dt);
  if(D.stage==='light'){if((D.seen>.5||D.t>5)&&!busy()){D.stage='who';mark('Reyes sees');reyes.lookAt={x:SAM2.x,y:SAM2.y+1.3,z:SAM2.z};
    say([{who:'OFFICER REYES',text:'“Sam?”',from:reyes,time:.9},{who:'SAM',text:'“What?”',by:'sam',time:.7},{wait:.8},{who:'OFFICER REYES',text:'“…Who’s that?”',from:reyes,time:1.2},
     {who:'JAMIE',text:'“Don’t look at him. Sam. Don’t look at him.”',by:'jamie',time:2.2,face:'terrified',act:()=>{jamie.lookAt={x:SAM2.x,y:SAM2.y+1.3,z:SAM2.z};}},
     {wait:.6,act:()=>{sam.lookAt={x:SAM2.x,y:SAM2.y+1.35,z:SAM2.z};face(sam,'terrified',12);D.samSaw=C.t;SAM2.tiltTo=.42;}},{wait:2},{who:'SAM',text:'“…Guys?”',by:'sam',time:1,face:'terrified'}],{then:()=>{D.stage='still';D.stillAt=C.t;SAM2.face.set('grin',{hold:99});}});}}
  // stillness: as long as it takes to be seen, the two of them at once (and not for ever)
  if(D.stage==='still'){if(D.samSaw&&C.t-D.samSaw>1.5)SAM2.face.set('grin',{hold:99});if((D.both>1.6&&C.t-D.stillAt>3.2)||C.t-D.stillAt>16){D.stage='step';const q1=WP(9,33.4);SAM2.copyWTo=0;SAM2.go([{x:q1.x,z:q1.z}],{speed:.7,accel:1.4});D.stepAt=C.t;}}
  if(D.stage==='step'&&C.t-D.stepAt>1.9){D.stage='run';const L=WP(GATE.lever.x+.35,GATE.lever.z+.45);SAM2.go([{x:L.x,z:L.z}],{speed:8.2,accel:22});sound('c5Rush',{x:SAM2.x,y:FLOOR.low+1,z:SAM2.z},{gain:1});sound('c6Splash',{x:SAM2.x,y:FLOOR.low,z:SAM2.z},{gain:.7});D.runAt=C.t;mark('it runs');}
  if(D.stage==='run'){if(Math.hypot(SAM2.x-WP(GATE.lever.x,GATE.lever.z).x,SAM2.z-WP(GATE.lever.x,GATE.lever.z).z)<.75||C.t-D.runAt>2.2)theGate();}
  if(D.stage==='gone'){D.goneT=(D.goneT||0)+dt;if(D.goneT>2.6&&!D.next){D.next=true;sealedStart();}}}
 function theGate(){const D=C.dbl;if(D.stage==='gone')return;D.stage='gone';const L=WP(GATE.lever.x,GATE.lever.z,FLOOR.low+1);mark('the gate');
  SAM2.stop();SAM2.reachTo=1;sound('c6Slam',L,{gain:.7});sound('c6Hit',L,{gain:1});o.foot.land=.08;T?.set?.(1,{rise:1,why:'the gate'});
  works.GS.held=false;works.GS.mode='drop';works.GS.v=.4;say([{who:'SAM',text:'“GUYS—”',by:'sam',time:.6}],{interrupt:true});
  // his hands toward the gap, the light at the end out, then nothing
  stand(sam,null);comp.run(sam,[comp.steps.idle(sam,.5,{gesture:(p,e)=>{const w=smooth(e/.25);for(const [o2,s] of [[PI.lh,-1],[PI.rh,1]]){p[o2]+=(s*.1-p[o2])*w;p[o2+1]+=(1.25-p[o2+1])*w;p[o2+2]+=(-.5-p[o2+2])*w;}p[PI.lean]+=.3*w;}})]);
  later(.18,()=>{works.setLamp('J-c',0,{rate:60});works.LAMPS['J-c'].force=false;});
  later(.55,()=>{sam.gone=true;sam.person.group.visible=false;sam.bike.group.visible=false;comp.release(sam);SAM2.show(false);radioHand.visible=false;mark('Sam, gone');});
  later(.8,()=>{works.WATER.J.want=FLOOR.low+3.0;works.WATER.J.rate=.09;works.WATER.L.want=FLOOR.low+.18;works.WATER.L.rate=.04;});
  objective('');C.flags.samGone=true;}
 // ---- after the gate: what you can do, and what it does --------------------------------------------------------------------------------------
 function sealedStart(){go('n6-sealed');checkpoint('c6-sealed');C.sl={t:0,did:new Set(),stage:'gate'};mark('sealed');reyes.gest('flashlight');
  if(C.inv.pin==='hand'){phys.playerHold('r',null);PIN.place(new THREE.Vector3(works.pinAt.stow.x,works.pinAt.stow.y-.6,works.pinAt.stow.z-.3),new THREE.Euler(0,.4,Math.PI/2));C.inv.pin='floor';}
  stand(jamie,null);comp.run(jamie,[comp.steps.walkTo(jamie,[[WP(8.6,22.25).x,WP(8.6,22.25).z]],{speed:2.2})],{then:()=>stand(jamie,WP(8.6,22.25),{look:()=>WP(9,23,FLOOR.low+1.2),keep:true,max:.4,gesture:GEST.brake(.6),leash:30})});
  say([{wait:1.4},{who:'JAMIE',text:'“SAM!”',by:'jamie',time:.9,face:'terrified',act:()=>sound('c6Hit',WP(9,23,FLOOR.low+1.2),{gain:.7})},{wait:.6},{who:'JAMIE',text:'“SAM! SAM!”',by:'jamie',time:1.2,act:()=>sound('c6Hit',WP(9,23,FLOOR.low+1.2),{gain:.8})},
   {wait:1.2},{who:'OFFICER REYES',text:'“Dispatch, twelve, I need fire and rescue at the Mill Creek works. Juvenile trapped in a flooding chamber. I need a dive team. I need everybody.”',from:reyes,time:5.4,act:()=>{reyes.gest('radio');sound('squelch',reyes.pos,{gain:.5});}},
   {who:'DISPATCH (RADIO)',text:'“Twelve, copy. Fire and rescue en route.”',time:2,act:()=>reyes.gest('flashlight')}],{then:()=>{C.sl.stage='free';C.sl.freeAt=C.t;objective('Get Sam out.','The gate. Anything.');}});}
 function updateSealed(dt){const X=C.sl;X.t+=dt;waterPace(dt);
  if(X.stage==='free'&&(X.did.size>=2&&C.t-X.freeAt>14||C.t-X.freeAt>32)&&!busy()&&!X.up){X.up=true;
   say([{who:'MR. BRANDT (RADIO)',text:'“Reyes! The junction chamber’s got a manhole! On the bank, south of the yard!”',time:3,act:()=>sound('c6Static',reyes.pos,{gain:.5})},
    {who:'OFFICER REYES',text:'“Everybody up. NOW.”',from:reyes,time:1.2},{who:'JAMIE',text:'“I’m not leaving him!”',by:'jamie',time:1.4,face:'frustrated'},
    {who:'OFFICER REYES',text:'“You’re not leaving him. We’re getting him from the top. COME ON.”',from:reyes,time:2.6,act:()=>{const up=WP(8,13),g1=WP(8,0),st=WP(12,-6.9),hs=WP(18,-3.9),y=WP(20,8),gt=WP(16.5,21);reyes.gest(null);
     reyes.walk([[WP(8.6,19).x,WP(8.6,19).z],[up.x,up.z],[g1.x,g1.z],[st.x,st.z],[hs.x,hs.z],[WPa(WS.houseDoor).x,WPa(WS.houseDoor).z],[y.x,y.z],[gt.x,gt.z]],{speed:2.2,then:a=>{works.ST.southGate=1;sound('fence',gt,{gain:.6});const pd=WPa(WS.padStand);a.walk([[pd.x,pd.z]],{speed:2,then:b=>{b.faceTo(WP(MANHOLE.x,MANHOLE.z).x,WP(MANHOLE.x,MANHOLE.z).z);b.gest('brace');C.flags.reyesAtPad=true;}});}});
     stand(jamie,null);follow(true);C.flags.hurry=true;}}],{then:()=>{X.stage='up';X.upAt=C.t;objective('Follow Reyes. Up.','The manhole on the bank, south of the yard.');rescueStart();}});}
  if(X.stage==='up'){const z=zone();if(z==='yard'||z==='door'||z==='path'||z==='pad'||z==='sgate')rescueGo();
   if(C.t-X.upAt>45&&!X.n1&&!busy()){X.n1=true;say([{who:'OFFICER REYES (RADIO)',text:'“Up here! Now!”',time:1.2}]);}
   if(C.t-X.upAt>90)carry('up',WP(17,18),Math.PI,{after:rescueGo});}}
 function sealedAct(id){const X=C.sl;if(!X||X.stage==='gate')return;X.did.add(id);const g=WP(9,23,FLOOR.low+1.2);
  if(id==='bang'){phys.playerReach({at:()=>new THREE.Vector3(g.x,g.y,g.z-.15),dur:[.2,.05,.3],onContact:()=>{sound('c6Hit',g,{gain:1});o.foot.land=.015;}});if(!X.bangSaid){X.bangSaid=true;say([{who:'YOU',text:'“SAM!”',time:.8},{wait:1.4},{who:'',text:'Nothing. The water, behind the steel.',time:2.4}]);}}
  else if(id==='pull'){o.roam.walkLock=true;phys.playerReach({at:()=>new THREE.Vector3(WP(10.25,23).x,FLOOR.low+.4,WP(10.25,23).z-.12),dur:[.4,1.4,.4],low:true,onContact:()=>{sound('c6Grind',g,{gain:.3});},then:()=>{o.roam.walkLock=false;say([{who:'',text:'It doesn’t move. It’s three tons of steel with a river behind it.',time:3.2}]);}});}
  else if(id==='crank')crank();
  else if(id==='port'){works.GS.portOpen=true;sound('c6Clank',g,{gain:.4});const pq=WP(GATE.port.x,GATE.z-.1,FLOOR.low+GATE.port.y);closeLook({x:pq.x,y:pq.y,z:pq.z},{back:.42,eye:1.42,kind:'port',floor:FLOOR.low});C.lookDur=6.5;
   say([{wait:1},{who:'',text:'Brown water against the glass. Moving. Nothing else.',time:3.2},{wait:1.2},{who:'',text:'Then, for a moment, a light. Far back. Then not.',time:3}],{then:()=>{works.GS.portOpen=false;}});}}
 // ---- the bank: the manhole ----------------------------------------------------------------------------------------------------------------------
 function rescueStart(){C.stormTo=1;C.rainTo=1;}
 function rescueGo(){if(C.rs)return;go('n6-rescue');C.rs={t:0,stage:'go'};mark('the bank');objective('The manhole. On the bank.','Out of the yard by the south gate.');
  const bp=WP(14.4,31.6);brandt.show(true);brandt.place(WP(16,20).x,WP(16,20).z,0);brandt.walk([[WP(16.5,21).x,WP(16.5,21).z],[bp.x,bp.z]],{speed:1.8,then:a=>{a.faceTo(WP(MANHOLE.x,MANHOLE.z).x,WP(MANHOLE.x,MANHOLE.z).z);a.gest('brace');}});
  works.ST.southGate=1;works.ST.power=false;}
 function updateRescue(dt){const X=C.rs;X.t+=dt;const p=me();
  if(X.stage==='go'&&near(WPa(WS.padStand),4.5)&&C.flags.reyesAtPad){X.stage='lift';objective('Help them lift the cover.','F.');}
  if(X.stage==='go'&&X.t>80&&!X.n&&!busy()){X.n=true;say([{who:'OFFICER REYES',text:'“Over here! Help me!”',from:reyes,time:1.4}]);}
  if(X.stage==='go'&&X.t>120){X.stage='lift';C.flags.reyesAtPad=true;}
  if(X.stage==='lift'&&X.t>(X.liftAt??=X.t)+40&&!X.lifted)liftCover(true);
  if(X.stage==='open'){X.ot=(X.ot||0)+dt;if(X.ot>24&&!X.fade){X.fade=true;afterCarry();}}
  if(X.lifting){works.ST.cover=Math.min(1,works.ST.cover+dt*.7);if(works.ST.cover>=1){X.lifting=false;opened();}}}
 function liftCover(selfDone=false){const X=C.rs;if(X.lifted)return;X.lifted=true;const cv=WP(MANHOLE.x,MANHOLE.z,FLOOR.pad+.1);
  const go2=()=>{X.lifting=true;sound('c6Grind',cv,{gain:.6});sound('c6Clank',cv,{gain:.7});};
  if(selfDone)go2();else{o.roam.walkLock=true;phys.playerReach({at:()=>new THREE.Vector3(cv.x+.3,cv.y,cv.z),low:true,dur:[.45,.9,.45],onContact:go2,then:()=>{o.roam.walkLock=false;}});}}
 function opened(){const X=C.rs;X.stage='open';mark('the manhole, open');reyes.gest('flashlight');reyes.lookAt=WP(MANHOLE.x,MANHOLE.z,-1);
  say([{wait:.8},{who:'',text:'Black water, a metre down, turning on itself.',time:2.8},{who:'OFFICER REYES',text:'“SAM!”',from:reyes,time:.9},{wait:1.6},
   {who:'JAMIE',text:'“SAM! SAM!”',by:'jamie',time:1.4,face:'terrified'},{wait:3,act:()=>storm.strike(500)},{who:'',text:'Sirens, somewhere out on Old Mill Road.',time:2.4,act:()=>{C.sirens=true;}},{wait:2},
   {who:'OFFICER REYES',text:'“…Come on, Sam. Come on.”',from:reyes,time:2}]);}
 function afterCarry(){objective('Two hours later.','The yard, full of lights.');carry('after',WP(26.5,6.5),Math.PI*1.25,{after:afterStart});}
 // ---- after: the yard, two hours later ---------------------------------------------------------------------------------------------------------
 function afterStage(){C.h=Math.max(C.h,HOUR.after);C.minute=-1;C.stormTo=.7;C.rainTo=.55;works.ST.power=true;works.lamps('*',1);works.setLamp('pole',1);works.ST.cover=1;works.ST.southGate=1;
  works.WATER.chan.want=works.WATER.chan.y=-4.4;works.WATER.J.want=works.WATER.J.y=FLOOR.low+.04;works.WATER.L.want=works.WATER.L.y=FLOOR.low-.02;works.GS.mode='up';works.GS.gap=GATE.open;works.GS.held=false;works.ST.alarm=0;
  const cA=WPa(WS.cruiser);k.carA.show(true);k.carA.park(cA.x,cA.z,Math.PI*.98);k.carA.lights=true;k.carA.headlights=true;
  const b2=WP(31,14);k.carB.show(true);k.carB.park(b2.x,b2.z,Math.PI*.6);k.carB.lights=true;k.carB.headlights=false;
  const c3=WP(33,-10);car3.show(true);car3.park(c3.x,c3.z,-Math.PI*.4);car3.lights=true;car3.headlights=true;
  works.prints.visible=false;// (the water came through the landing)
  rescue.g.visible=true;rescue.g.position.set(26,0,-15);rescue.g.rotation.y=Math.PI/2;works.ST.amber=true;
  const [f1,f2]=cast.fire;const q1=WP(22.8,-3.2),q2=WP(14.6,31.2);f1.show(true);f1.place(q1.x,q1.z,-Math.PI/2);f1.gest('fold');f2.show(true);f2.place(q2.x,q2.z,0);f2.gest('flashlight');
  const bq=WP(24.2,-11);brandt.show(true);brandt.place(bq.x,bq.z,Math.PI);brandt.gest('fold');
  const rq=WP(24.5,8.6);reyes.show(true);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,WP(22,-4).x,WP(22,-4).z));reyes.gest('fold');reyes.lookAt=null;
  officer.show(true);const oq=WP(25.6,7.2);officer.place(oq.x,oq.z,headingTo(oq.x,oq.z,rq.x,rq.z));officer.gest('fold');
  // Jamie in the open back door of the car, a blanket round him
  const jq=WP(24.6,11.6);comp.putFoot(jamie,jq.x,jq.z,-Math.PI*.55,{bike:null});jamie.bike.group.visible=false;jamie.follow=null;stand(jamie,[jq.x,jq.z],{look:()=>WP(21,-2,1),keep:true,max:.3,gesture:GEST.sit(1),leash:99});
  const bl=props.blanket;if(!bl.parent)jamie.person.parts.torso.add(bl);bl.visible=true;bl.position.set(0,.05,.04);bl.rotation.set(0,Math.PI,0);bl.scale.setScalar(.5);
  sam.gone=true;sam.person.group.visible=false;sam.bike.group.visible=false;comp.release(sam);
  S.flashOn=false;ch2.samBeam&&(ch2.samBeam.on=false);}
 function afterStart(){go('n6-after');checkpoint('c6-aftermath');afterStage();C.af={t:0,stage:'jamie'};mark('later');objective('');C.fadeIn=0;C.flags.hurry=false;T?.set?.(.3,{rise:-.2,why:'later'});
  // (by the cruiser's back door, where Jamie sits: the car is at the cruiser spot, nose to the south)
  const pq=WP(23.2,9.2);o.placePlayer({x:pq.x,z:pq.z,a:headingTo(pq.x,pq.z,WP(24.6,11.6).x,WP(24.6,11.6).z),mode:'walk',bike:leftBike()});}
 function updateAfter(dt){const X=C.af;X.t+=dt;const p=me();
  if(X.stage==='jamie'&&(near(WP(24.6,11.6),3.2)||X.t>22)&&!busy()){X.stage='j1';
   say([{wait:.6},{who:'JAMIE',text:'“I should’ve been faster.”',by:'jamie',time:1.6,face:'sad'},{who:'YOU',text:'“Jamie—”',time:.7},
    {who:'JAMIE',text:'“Under the gate. If I was faster he wouldn’t have had to hold it.”',by:'jamie',time:2.8},{wait:2.4},{who:'JAMIE',text:'“He held it for me.”',by:'jamie',time:1.6},{wait:3.4}],{then:()=>{X.stage='fire';X.at=C.t;}});}
  if(X.stage==='fire'&&C.t-X.at>2&&!busy()){X.stage='f1';const [f1]=cast.fire;f1.gest(null);const rq=reyes.pos;f1.walk([[rq.x+1,rq.z-1.2]],{speed:1.1,then:a=>{a.faceTo(rq.x,rq.z);a.lookAt=rq;
    say([{who:'FIREFIGHTER',text:'“Water’s down. We went in both chambers. The grille at the end was open.”',from:a,time:3.2},{who:'OFFICER REYES',text:'“It was locked.”',from:reyes,time:1.2,act:()=>{reyes.lookAt=a.pos;}},
     {who:'FIREFIGHTER',text:'“It was open. We went two hundred yards up the pipe on a line. There’s nothing in there.”',from:a,time:3.6},{wait:1.2},{who:'OFFICER REYES',text:'“…Go again.”',from:reyes,time:1.2},{who:'FIREFIGHTER',text:'“We will.”',from:a,time:1}],
     {then:()=>{a.walk([[WP(22.6,-3.6).x,WP(22.6,-3.6).z],[WP(20,-3.9).x,WP(20,-3.9).z]],{speed:1.2,then:b=>b.show(false)});X.stage='dad';X.at=C.t;}});}});}
  if(X.stage==='dad'&&C.t-X.at>3&&!busy()){X.stage='d1';const g0=WP(35,2),gq=WP(30,1.4);samDad.show(true);samDad.place(g0.x,g0.z,-Math.PI/2);samDad.gest(null);samDad.walk([[gq.x,gq.z]],{speed:1.7,then:a=>{a.faceTo(reyes.x,reyes.z);}});
   later(1.2,()=>{reyes.gest(null);reyes.walk([[WP(28.6,2.4).x,WP(28.6,2.4).z]],{speed:1.1,then:a=>{a.faceTo(samDad.x,samDad.z);a.lookAt=samDad.pos;samDad.lookAt=a.pos;}});});
   say([{wait:3},{who:'',text:'Across the yard, Sam’s dad. Reyes is talking to him. You can’t hear what they say.',time:4.2},{wait:3.4,act:()=>samDad.gest('head')},{wait:4.4,act:()=>samDad.gest('brace')},{wait:3}],
    {then:()=>{X.stage='gum';X.at=C.t;const rq=WP(24.8,8.4);reyes.walk([[rq.x,rq.z]],{speed:1,then:a=>{a.faceTo(officer.x,officer.z);a.gest('fold');}});}});}
  if(X.stage==='gum'&&C.t-X.at>6&&!busy()){X.stage='g1';
   say([{who:'JAMIE',text:'“Sam, do you have any—”',by:'jamie',time:1.4,act:()=>{jamie.lookAt=camBeside(-1,0,1.2)();}},{wait:3.4,act:()=>{jamie.lookAt=null;face(jamie,'sad',12);}},
    {who:'JAMIE',text:'“…I was gonna ask him for gum.”',by:'jamie',time:2.2},{wait:4}],{then:()=>{X.stage='talk';X.at=C.t;}});}
  if(X.stage==='talk'&&!busy()&&(near(reyes.pos,9)||C.t-X.at>30)){X.stage='t1';officer.gest(null);officer.lookAt=reyes.pos;reyes.lookAt=officer.pos;
   say([{who:'OFFICER',text:'“You put out a call for a second juvenile.”',from:officer,time:2.2},{who:'OFFICER REYES',text:'“Yeah.”',from:reyes,time:.8},
    {who:'OFFICER',text:'“In the chamber. Another boy.”',from:officer,time:1.6},{who:'OFFICER REYES',text:'“He looked exactly like Sam.”',from:reyes,time:1.8},{wait:1.8},
    {who:'OFFICER',text:'“…What do you mean?”',from:officer,time:1.2},{who:'OFFICER REYES',text:'“I mean he looked exactly like Sam.”',from:reyes,time:2},{wait:2.8},
    {who:'OFFICER REYES',text:'“I saw them both. At the same time.”',from:reyes,time:2.4,act:()=>{reyes.lookAt=WP(21,-2,1.6);}},{wait:3.4,act:()=>{officer.lookAt=WP(21,-2,1.6);}},
    {who:'',text:'The other officer doesn’t write anything down.',time:2.8},{wait:2.6}],{then:()=>{X.stage='radio';X.at=C.t;}});}
  if(X.stage==='radio'&&C.t-X.at>1.5&&!busy()){X.stage='r1';const rp={x:reyes.x,y:1.6,z:reyes.z};sound('c6Static',rp,{gain:.8});mark('the radio');T?.set?.(.6,{rise:.2,why:'his voice'});
   say([{who:'REYES’S RADIO',text:'“…I’ve got it.”',time:1.8},{wait:1.4,act:()=>{jamie.lookAt=reyes.pos;face(jamie,'shocked',8);}},{who:'JAMIE',text:'“That’s him.”',by:'jamie',time:1},{who:'JAMIE',text:'“That’s Sam.”',by:'jamie',time:1.2},
    {wait:1.4,act:()=>{reyes.gest('radio');reyes.lookAt=null;}},{who:'OFFICER REYES',text:'“…Sam?”',from:reyes,time:1,act:()=>sound('c6Static',rp,{gain:.4})},{wait:3.2},{who:'',text:'Static.',time:2},{wait:2.6}],
    {then:()=>{X.stage='end';C.endT=0;checkpoint('chapter6-end');}});}}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Chapter Six';if(pp)pp.innerHTML='SOMEONE WAS HERE<br>August 25, 2011.';}
  const nb=$('next-chapter');if(nb)nb.hidden=true;A6.finished=true;o.finish();}
 // ---- the water's pull on your legs, and what it sounds like underfoot --------------------------------------------------------------------------
 function waterPace(dt){const p=me(),z=zone();let d=0;if(z==='L')d=works.WATER.L.y-FLOOR.low;else if(z==='J'||z==='gate')d=works.WATER.J.y-FLOOR.low;d=Math.max(0,d);
  o.setPace?.(clamp(1-d*.85,.45,1));nav.ducking=false;works.nav.ducking=(o.foot.crouch||0)>.5;
  if(d>.05&&p.walking&&(p.speed||0)>.3){C.splashT=(C.splashT||0)+dt*(p.speed||1);if(C.splashT>.55){C.splashT=0;sound('splash',{x:p.x,y:p.y??0,z:p.z},{gain:.25+d*.5});}}}
 // ---- the story never waits forever ---------------------------------------------------------------------------------------------------------------
 function landing(x,z){const ok=(a,b)=>nav.walkable(a,b,{r:.3});if(ok(x,z))return [x,z];for(let r=.5;r<=6;r+=.5)for(let i=0;i<16;i++){const t2=i/16*Math.PI*2,a=x+Math.sin(t2)*r,b=z+Math.cos(t2)*r;if(ok(a,b))return [a,b];}return [x,z];}
 function carry(why,q0,a,{after=null}={}){if(C.fadeOut>=0)return;C.flags['carried-'+why]=true;mark('carried on: '+why);C.fadeOut=0;if(C.view==='camera')closeView();if(C.view==='look')endLook();
  const w0=Array.isArray(q0)?{x:q0[0],z:q0[1]}:q0;
  C.after=()=>{const r=o.roam,q=landing(w0.x,w0.z);o.placePlayer({x:q[0],z:q[1],a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});
   const J=landing(q[0]-Math.sin(a)*1.3+Math.cos(a)*.9,q[1]+Math.cos(a)*1.3+Math.sin(a)*.9),Sq=landing(q[0]-Math.sin(a)*1.6-Math.cos(a)*.9,q[1]+Math.cos(a)*1.6-Math.sin(a)*.9);
   for(const [c,w] of [[jamie,J],[sam,Sq]]){if(c.gone)continue;const bk=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null;comp.putFoot(c,w[0],w[1],a,{bike:bk});c.follow=null;}
   C.fadeIn=0;after?.();if(C.match)for(const c of [jamie,sam])if(!c.gone&&!C.spot[c.key])c.follow='walk';};}
 // ---- the spots F works on ----------------------------------------------------------------------------------------------------------------------------
 function spots(){const out=[],ph=S.phase,p=me();if(C.view||C.fadeOut>=0||posed()||phys.playerBusy())return out;
  const add=(id,label,q,fc,r=2.4,o2={})=>out.push({id,label,at:q,face:fc||q,r,wide:true,...o2});
  if(ph==='d6-room'||ph==='d6-phone'){if(!C.flags.up)return out;
   // (a small room, everything within reach of everything: what you look at is what F takes)
   const lk=(size,cone=.12)=>({look:true,size,cone});
   if(!C.inv.camera)add('c6-cam','Pick up Alex’s camera',home.CAMERA_AT(),null,1.9,lk(.22,.16));
   if(!C.looked.has('window'))add('c6-window','Look outside',HS.window,null,2.6,lk(.5));if(!C.looked.has('cork'))add('c6-cork','Look at the photo strip',HS.cork,null,2.2,lk(.3));
   if(!C.looked.has('calendar'))add('c6-calendar','Look at the calendar',HS.calendar,null,2.2,lk(.26));if(!C.looked.has('trophies'))add('c6-trophies','Look at the trophies',HS.trophies,null,2.2,lk(.3));
   if(ph==='d6-phone'&&!C.flags.answered)add('c6-phone','Answer the phone',HS.phone,null,2.2,lk(.24,.2));
   if(C.flags.called)add('c6-out','Go outside',HS.front,null,2,lk(.5,.2));}
  if(ph==='d6-meet'){if(C.flags.showPics&&!C.flags.showing&&C.inv.camera==='have')add('c6-show','Show Reyes the pictures',reyes.pos.clone().setY(reyes.pos.y+1.3),null,3);
   if(C.flags.copy&&!C.flags.given)add('c6-give','Give Reyes the camera',reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),null,3);}
  if(ph==='d6-oak'&&C.oak?.done){if(!C.looked.has('chalk')&&near(LOOK.chalk,3))add('c6-chalk','Look at the chalk',LOOK.chalk,null,3);if(!C.looked.has('carving')&&near(LOOK.oak,3.2))add('c6-carving','Look at the oak',{...LOOK.oak,y:LOOK.oak.y+.9},null,3.2);}
  if(/^d6-(street|creek)$/.test(ph)&&!C.looked.has('corner')&&near(BW.corner,6))add('c6-corner','Look down Briarwood',BW.stop,BW.stop,6);
  if(ph==='e6-garage'){if(C.flags.camBack&&C.inv.camera!=='have')add('c6-camback','Take the camera',reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),null,3);
   if(C.inv.plan&&!C.flags.planLook)add('c6-plan','Look at the plan',TL(-.05,-.02,.73),null,2.6,{look:true,size:.45,cone:.14});if(!C.looked.has('wx'))add('c6-wx','Listen to the weather radio',wxRadio.position,null,2.6,{look:true,size:.2,cone:.14});
   if(C.rec?.stage==='go'){const car=k.carA;add('c6-car','Get in Reyes’s car',car.pos.clone().setY(car.pos.y+1),null,3.4);}
   if(!C.looked.has('notes')&&props.samNotes.parent)add('c6-notes','Read Sam’s notebook',props.samNotes.getWorldPosition(new THREE.Vector3()),null,2.4,{look:true,size:.16,cone:.14});
   if(C.inv.plan&&!C.looked.has('file')&&folderP.state==='placed'&&folderP.obj.visible)add('c6-file','Read the photocopies',folderP.obj.getWorldPosition(new THREE.Vector3()),null,2.6,{look:true,size:.24,cone:.12});}
  if(/^e6-/.test(ph)&&ph!=='e6-garage'){if(C.wk?.stage==='lights'&&!C.inv.flashlight)add('c6-light','Take the flashlight',brandt.person.parts.rhand.getWorldPosition(new THREE.Vector3()),null,3);
   if(!C.looked.has('channel')&&near(WS.channel?WP(8,-20):WP(8,-20),4))add('c6-channel','Look at the channel',WP(7,-20,-1.5),null,4);
   if((ph==='e6-house'||ph==='e6-yard')&&zone()==='house'){if(C.wk?.stage==='house'&&!C.flags.helmetSeen)add('c6-helmet','Look at the helmet',WP(WS.helmet[0],WS.helmet[1],FLOOR.house+.9),null,2.4,{look:true,size:.3,cone:.14});if(C.wk?.stage==='house'||C.wk?.stage==='down')if(!C.flags.logSeen)add('c6-log','Read the gate log',WP(WS.log[0],WS.log[1],FLOOR.house+.8),null,2.4,{look:true,size:.26,cone:.14});}
   if(ph==='e6-gallery'&&C.gal?.echo&&!C.looked.has('speaker'))add('c6-speaker','Look at the speaker',WP(8,-13.6,FLOOR.gallery+1.9),null,2.6);
   // (what there is to look at, if you look: the bar screen from the yard, the switchgear, the gauges)
   const z0=zone();
   if(!C.looked.has('rack')&&(z0==='yard')&&near(WP(7.6,-24.6),5))add('c6-rack','Look at the bar screen',WP(4,-24.6,-2.6),null,5.5,{look:true,size:1.6,cone:.08});
   if(!C.looked.has('panel')&&z0==='house'&&C.wk?.stage!=='lights')add('c6-panel','Look at the switchgear',WP(WS.panel[0],WS.panel[1]+.1,FLOOR.house+1.55),null,2.8,{look:true,size:.9,cone:.06});
   if(!C.looked.has('gauge')&&(z0==='gallery'||z0==='bridge')&&ph==='e6-gallery')add('c6-gauge','Look at the staff gauge',WP(.5,-1.6,FLOOR.bed+2.6),null,8.5,{look:true,size:.5,cone:.05});
   if(!C.looked.has('prints')&&works.prints.visible&&(z0==='L'||z0==='stair2')&&C.low?.stage!=='gate')add('c6-prints','Look at the footprints',WP(PRINTS_AT.x,PRINTS_AT.z,FLOOR.low),null,2.6,{look:true,size:.35,cone:.12});}
  const lk=(size,cone=.14)=>({look:true,size,cone});
  if(ph==='n6-hold'||ph==='n6-double'){if(C.hold?.stage==='pin'&&!C.inv.pin)add('c6-pin','Pull the locking pin',new THREE.Vector3(works.pinAt.stow.x,works.pinAt.stow.y,works.pinAt.stow.z),null,2,lk(.2,.2));
   if(C.inv.pin==='hand')add('c6-insert','Push the pin through the guide',new THREE.Vector3(works.pinAt.hole.x,works.pinAt.hole.y,works.pinAt.hole.z),null,1.9,lk(.2,.2));
   add('c6-crank','Turn the crank',WP(GATE.crank.x,GATE.crank.z,FLOOR.low+1.05),null,1.9,lk(.3));}
  if(ph==='n6-sealed'&&C.sl?.stage!=='gate'){const g=WP(9,22.85,FLOOR.low+1.2);add('c6-bang','Bang on the gate',g,null,2.2,lk(.6,.1));add('c6-pull','Pull at the gate',WP(10.2,22.85,FLOOR.low+.5),null,1.9,lk(.3));
   add('c6-port','Look through the port',WP(GATE.port.x,22.85,FLOOR.low+GATE.port.y),null,1.9,lk(.18,.12));add('c6-crank2','Turn the crank',WP(GATE.crank.x,GATE.crank.z,FLOOR.low+1.05),null,1.9,lk(.3));}
  if(ph==='n6-rescue'&&C.rs?.stage==='lift'&&!C.rs.lifted)add('c6-lift','Help lift the cover',WP(MANHOLE.x,MANHOLE.z,FLOOR.pad+.1),null,2.4);
  return out;}
 function act(id){
  if(id==='c6-cam')takeCamera();else if(id==='c6-phone')answer();else if(id==='c6-out')goOutside();
  else if(id==='c6-window')lookThing('window',HS.window,[{who:'',text:'Somebody’s mower, down the street. A sprinkler. A car going by slow.',time:3.2},{who:'',text:'Everything going on like it always did.',time:2.8}],{back:.75});
  else if(id==='c6-cork')lookThing('cork',HS.cork,[{who:'',text:'June. The four of you in the photo booth at the mall.',time:3},{who:'',text:'Alex wouldn’t take his helmet off. His mom made him promise.',time:3.4}],{back:.6});
  else if(id==='c6-calendar')lookThing('calendar',HS.calendar,[{who:'',text:'School on the thirtieth. You’d crossed off every day since the first.',time:3.4},{who:'',text:'You stopped on the twenty-fourth.',time:2.4}],{back:.6});
  else if(id==='c6-trophies')lookThing('trophies',HS.trophies,[{who:'',text:'Participant, 2009. Participant, 2010. Most Improved, 2011.',time:3.4},{who:'',text:'Alex said “most improved” meant you used to be the worst.',time:3.2}],{back:.8});
  else if(id==='c6-show')showPictures();else if(id==='c6-give')giveCamera();
  else if(id==='c6-chalk'){C.looked.add('chalk');C.oak.chalk=true;closeLook({...LOOK.chalk,y:LOOK.chalk.y+.02},{back:.5,eye:.75,kind:'chalk'});C.lookDur=7;say([{who:'',text:'J S A. Still there, under the dust.',time:2.6},{who:'',text:'Alex always made his A lean, like it was about to tip over.',time:3.2}]);}
  else if(id==='c6-carving'){C.looked.add('carving');C.oak.chalk=true;closeLook({...LOOK.oak,y:LOOK.oak.y+.95},{back:.55,eye:1.2,kind:'carving'});C.lookDur=6;say([{who:'',text:'A R. Cut into the bark at a kid’s height.',time:2.6},{who:'',text:'Nobody ever said who.',time:2.2}]);}
  else if(id==='c6-corner'){C.looked.add('corner');say([{who:'',text:'He rang twice. He always rang twice.',time:2.8}]);}
  else if(id==='c6-camback')takeCameraBack();else if(id==='c6-plan')lookPlan();else if(id==='c6-car')toWorks();
  else if(id==='c6-wx'){C.looked.add('wx');say([{who:'WEATHER RADIO',text:'“…stay out of low-lying areas and away from drainage channels. Turn around, don’t drown…”',time:3.6}]);}
  else if(id==='c6-prints')lookPrints();
  else if(id==='c6-file'){C.looked.add('file');const q=TL(-.55,.1,.74);closeLook({x:q.x,y:q.y,z:q.z},{back:.5,eye:1.3,kind:'file',floor:drive(0,0).y});C.lookDur=15;mark('the photocopies');
   say([{who:'',text:'Photocopies. “Supplementary report, case 91-0821.” Typed. A coffee ring through the middle of it.',time:4.2},
    {who:'',text:'“8/27. 0640. Isolation gate 2B found open. Padlock missing. K-9 would not enter Line Two.”',time:4.4},
    {who:'',text:'Under it, the township blotter. August 23, 1966. “2350. Bicycle bell heard at the Mill Street culvert. W. Keller.”',time:4.8},
    ...(Math.hypot(sam.px-me().x,sam.pz-me().z)<4?[{who:'SAM',text:'“A bell. Twice. That’s what Alex did.”',by:'sam',time:2}]:[])]);}
  else if(id==='c6-notes'){C.looked.add('notes');const q=props.samNotes.getWorldPosition(new THREE.Vector3());closeLook({x:q.x,y:q.y+.01,z:q.z},{back:.45,eye:1.25,kind:'notes',floor:drive(0,0).y});C.lookDur=17;mark('Sam’s notebook');
   const by=Math.hypot(sam.px-me().x,sam.pz-me().z)<4;
   say([{who:'',text:'Sam’s notebook. Every day since Sunday, in his small square printing. Times. Places. Who was there.',time:4.4},
    {who:'',text:'Sunday, 8:02: Briarwood. Two rings. Monday: the helmet, on the ledge in the drain, dry. Tuesday: the TV at the video store. Wednesday: the camp. Jamie. Jamie.',time:6},
    {who:'',text:'On the other page, one word with a box around it: WATER. And under it, everything, with arrows.',time:4.2},
    ...(by?[{who:'SAM',text:'“I couldn’t sleep. I wanted it all in one place.”',by:'sam',time:2.2},{who:'SAM',text:'“The creek. The culvert. The reservoir. Every time, there’s water.”',by:'sam',time:3}]:[])]);}
  else if(id==='c6-rack'){C.looked.add('rack');const q=WP(4,-24.6,-2.6);closeLook({x:q.x,y:q.y,z:q.z},{back:4.6,eye:1.5,kind:'rack'});C.lookDur=8;
   say([{who:'',text:'The bar screen, steel bars slanting into the brown water. Leaves. A tire. A cooler lid. Sticks packed in like a beaver dam.',time:4.6},
    {who:'MR. BRANDT',text:'“That’s where it was. Hung on the bars by the strap, like somebody hung it there.”',from:brandt,time:3.4,act:()=>{brandt.lookAt=q;}}]);}
  else if(id==='c6-panel'){C.looked.add('panel');const q=WP(WS.panel[0],WS.panel[1]+.1,FLOOR.house+1.55);closeLook({x:q.x,y:q.y,z:q.z},{back:1.3,eye:1.5,kind:'panel',floor:FLOOR.house});C.lookDur=8;
   say([{who:'',text:'Green steel doors, stenciled. MAIN. 2A. 2B. PUMP. The handle under 2B is padlocked down.',time:4},
    {who:'MR. BRANDT',text:'“Two-B’s on its own breaker. If the main goes, the brake is all that holds her up.”',from:brandt,time:3.2}]);}
  else if(id==='c6-gauge'){C.looked.add('gauge');const q=WP(.5,-1.6,FLOOR.bed+2.6);closeLook({x:q.x,y:q.y,z:q.z},{back:6.2,eye:1.45,kind:'gauge',floor:FLOOR.gallery});C.lookDur=7;
   say([{who:'',text:'The staff gauge on the pier. The brown water is over the five-foot mark, and moving fast.',time:3.6},
    {who:'SAM',text:'“It was under four when we came in. I looked.”',by:'sam',time:2,face:'concerned'}]);}
  else if(id==='c6-light')takeLight();else if(id==='c6-channel')lookChannel();else if(id==='c6-helmet')lookHelmet();else if(id==='c6-log')lookLog();else if(id==='c6-speaker')lookSpeaker();
  else if(id==='c6-pin')pullPin();else if(id==='c6-insert')tryPin();else if(id==='c6-crank')crank();
  else if(id==='c6-bang')sealedAct('bang');else if(id==='c6-pull')sealedAct('pull');else if(id==='c6-port')sealedAct('port');else if(id==='c6-crank2')sealedAct('crank');
  else if(id==='c6-lift')liftCover();}
 // ---- Alex's camera --------------------------------------------------------------------------------------------------------------------------------------
 const canCamera=()=>C.inv.camera==='have'&&me().walking&&!C.view&&C.fadeOut<0&&S.phase!=='c6-black'&&!posed();
 function openCamera(i){photo.open(i);C.view='camera';C.viewT=0;o.roam.walkLock=true;}
 function closeView(){if(C.view==='camera')photo.close();if(C.view==='look')return endLook();C.view=null;if(!posed())o.roam.walkLock=false;if(C.meet&&C.flags.showing&&!C.flags.copy){C.flags.showing=false;}}
 function key(code,repeat){if(!mine(S.phase))return false;
  if((code==='KeyI'||code==='Tab')&&!inv.isOpen&&(C.view||C.fadeOut>=0||C.endT>=0||S.phase==='c6-black'))return true;if(inv.key(code,repeat))return true;
  if(S.phase==='d6-room'&&!C.flags.up&&!repeat&&['KeyW','KeyS','KeyA','KeyD','KeyF','Space'].includes(code)){if(C.flags.awake||C.room?.t>3)getUp();return true;}
  if(code==='KeyT'&&!C.view){return !C.inv.flashlight;}
  if(code==='KeyV'){if(C.view==='camera'){if(!repeat)closeView();return true;}if(canCamera()){if(!repeat){const i=S.phase==='d6-meet'?(C.pics.register>=0?C.pics.register:0):C.pics.fire>=0?C.pics.fire:photo.photos.length-1;openCamera(i);}return true;}return false;}
  if(C.view==='camera'){if(code==='KeyA'||code==='ArrowLeft'){photo.browse(-1);return true;}if(code==='KeyD'||code==='ArrowRight'){photo.browse(1);return true;}
   if(code==='KeyW'||code==='ArrowUp'){photo.zoomBy(1);return true;}if(code==='KeyS'||code==='ArrowDown'){photo.zoomBy(-1);return true;}return ['Space','KeyQ','KeyE','KeyC','KeyT','KeyF'].includes(code);}
  if(C.view==='look'){if((code==='KeyS'||code==='ArrowDown')&&!busy()&&C.lookKind!=='plan'){if(!repeat)endLook();return true;}if((code==='KeyS'||code==='ArrowDown')&&C.lookKind==='plan'&&C.flags.planDone){if(!repeat)endLook();return true;}return ['KeyW','KeyA','KeyD','Space','KeyC','KeyS'].includes(code);}
  return false;}
 function pan(dx,dy){if(!mine(S.phase))return false;if(C.view==='camera'){photo.pan(dx,dy);return true;}return false;}
 function wheel(dy){if(!mine(S.phase)||C.view!=='camera')return false;photo.zoomBy(dy<0?1:-1);return true;}
 function hint(){const ph=S.phase;
  if(C.view==='camera')return [['A / D','Previous / next'],['W / S','Zoom'],...(photo.V.zoom>1.05?[['Mouse','Move around']]:[]),['V','Lower the camera']];
  if(C.view==='look')return C.lookKind==='plan'?null:[['S','Step back']];
  if(ph==='d6-room'&&!C.flags.up&&C.flags.awake)return [['W','Get up']];
  if(canCamera()&&(ph==='d6-room'||ph==='d6-phone')&&!C.flags.reviewed)return [['V','Alex’s camera']];
  if(C.inv.flashlight&&!o.foot.on&&inWorks()&&(works.cave(camera.position.x,camera.position.z)>.5)&&!C.flags.tHint){return [['T','Flashlight']];}
  return null;}
 // ---- sounds in the world, what is in the way --------------------------------------------------------------------------------------------------------
 function sources(out){const ph=S.phase,p=me();
  if(/^d6-(room|phone)$/.test(ph)){out.push({id:'c6-kitchen-radio',kind:'radio',pos:HS.kitchen,level:.5,muffle:.6});const m=main(home.P.dc+60,14);out.push({id:'c6-mower',kind:'mower',pos:{x:m.x,y:1,z:m.z},level:.55,muffle:.5});}
  if(/^d6-(ride|street|oak)$/.test(ph)){const m=main(470,18);out.push({id:'c6-mower',kind:'mower',pos:{x:m.x,y:1,z:m.z},level:.7});}
  if(ph==='e6-garage'&&wxRadio.visible)out.push({id:'c6-wx',kind:'radio',pos:wxRadio.position,level:.6});
  if(inWorks(p)||/^(e6-(yard|house|gallery|lower|grille)|n6-)/.test(ph)){const cv=works.cave(p.x,p.z);out.push({id:'c6-rain',kind:'rain',pos:camera.position,level:C.rain*(1-cv*.75)});
   const lv=clamp((works.WATER.chan.y+5)/2,.2,1.4);out.push({id:'c6-river',kind:'surge',pos:works.local(0,-4,-4),level:lv*(cv>.5?1:.7)});
   if(works.ST.spill>.02)out.push({id:'c6-falls',kind:'water',pos:works.local(6.6,28,-4.2),level:works.ST.spill*1.4});if(works.ST.jet>.02)out.push({id:'c6-jet',kind:'surge',pos:works.local(9,22.5,FLOOR.low+.5),level:works.ST.jet*1.2});
   if(!works.ST.power&&works.ST.alarm)out.push({id:'c6-alarm',kind:'alarm',pos:works.local(9,20,-3.5),level:.9});
   if(ph==='n6-after'){out.push({id:'c6-gen',kind:'generator',pos:works.local(24.8,-12,1),level:.8});out.push({id:'c6-radio-yard',kind:'radio',pos:reyes.pos,level:.35});}
   if(C.sirens&&ph==='n6-rescue')out.push({id:'c6-sirens',kind:'siren',pos:works.local(60,-40,2),level:.5,mode:'wail'});}}
 function blockers(){const out=[];cast.blockers(out);if(inWorks())works.blockers(out);if(reyes.visible&&inWorks())out.push({x:reyes.x,z:reyes.z,r:.34,speed:0});
  if(S.phase==='d6-meet'||S.phase==='e6-garage')G5.blockers(out);return out;}
 function updateAmb(dt){const ph=S.phase,p=me(),cv=inWorks(p)?works.cave(p.x,p.z):0;let want;
  if(/^d6-(room|phone)$/.test(ph))want={traffic:.25,life:.6,insects:.35,wind:.15,forest:0,tunnel:0,water:0};
  else if(/^d6-/.test(ph)||ph==='e6-garage')want={traffic:.6,life:1-C.storm*.6,insects:.8-C.storm,wind:.7+C.storm*.6,forest:0,tunnel:0,water:0};
  else want={traffic:0,life:0,insects:0,wind:(.8+C.storm*.5)*(1-cv*.85),forest:.2,tunnel:cv,water:.6};
  for(const kk in want)C.amb[kk]=damp(C.amb[kk]??0,want[kk],.6,dt);}
 // Jamie's flashlight, when it is on: where he points it (at the far end; at the gate; at the water)
 function jamieSweep(t){const ph=S.phase;if(ph==='n6-double'&&SAM2.mode!=='off')return {x:SAM2.x,y:SAM2.y+1.1,z:SAM2.z};if(/^n6-(flood|hold|sealed)$/.test(ph))return WP(9,24.5,FLOOR.low+.9);
  const c=jamie,x=c.px,z=c.pz,a=c.pa+Math.sin(t*.6)*.45;return {x:x+Math.sin(a)*6,y:gy(x+Math.sin(a)*6,z-Math.cos(a)*6),z:z-Math.cos(a)*6};}
 function officerAim(){const ph=S.phase;if(ph==='e6-grille'&&AX.mode!=='off')return {x:AX.x,y:AX.y+1.1,z:AX.z};if(ph==='e6-grille'||ph==='e6-lower')return WP(9.2,40,FLOOR.low+.9);
  if(ph==='n6-double'&&SAM2.mode!=='off')return {x:SAM2.x,y:SAM2.y+1,z:SAM2.z};if(/^n6-(flood|hold)$/.test(ph))return WP(GATE.sam.x,GATE.sam.z,FLOOR.low+1);if(ph==='n6-sealed')return WP(9,23,FLOOR.low+1);
  if(ph==='n6-rescue')return WP(MANHOLE.x,MANHOLE.z,-1);return null;}
 // ---- minds: the mood and what is worth a look, by where the chapter is ------------------------------------------------------------------------------
 const poi=(id,kind,q,{stand:st=1,h=1.1,gesture=null,who=null,reach=10,time=null}={})=>({id,kind,x:q.x,z:q.z,y:(q.y??0)+h,stand:st,time,gesture,reach,who});
 const POIS={
  street:()=>[poi('oak','view',LOOK.oak,{stand:1.4,h:2}),poi('chalk','odd',LOOK.chalk,{stand:.9,h:.1,gesture:'inspect',who:'jamie'}),poi('bench','records',LOOK.bench,{stand:1,h:.6,who:'sam'})],
  garage:()=>[poi('wx','records',wxRadio.position,{stand:.8,h:0,who:'sam'}),poi('table','map',TL(0,0,.72),{stand:.7,h:0})],
  yard:()=>[poi('sign','sign',WP(23,-1.6),{stand:1.2,h:2.6,who:'sam'}),poi('channel','water',WP(7.6,-20),{stand:.6,h:-.2,who:'jamie',gesture:'look'}),poi('truck','odd',WPa(WS.truck),{stand:1.6,h:1.2,who:'jamie'}),poi('gen','records',WP(24.8,-11.3),{stand:.9,h:1.4,who:'sam'})],
  house:()=>[poi('panel','records',WP(17.6,-7.2,FLOOR.house),{stand:.8,h:1.5,who:'sam',gesture:'look'}),poi('log','records',WPa(WS.log),{stand:.7,h:.9,who:'sam'})],
  gallery:()=>[poi('gates','water',WP(6.4,-3),{stand:.5,h:-2.4,gesture:'look',who:'jamie'}),poi('gauge','records',WP(6.5,-1.6),{stand:.6,h:-3,who:'sam'}),poi('bridge','odd',WP(5.5,0),{stand:.6,h:-1.6,who:'jamie'})],
 };
 function mind(){const ph=S.phase,key=ph+(C.flags.hurry?'!':'')+(C.flags.jamieShaken?'s':'');if(C.mindKey===key)return;C.mindKey=key;let mood='relaxed',pois=[],goal=null;
  if(ph==='d6-oak'||ph==='d6-ride')pois=POIS.street();
  else if(ph==='d6-street'){mood=C.flags.jamieShaken?'tense':'relaxed';goal=BW.corner;}
  else if(ph==='d6-creek')mood='explore';
  else if(ph==='e6-garage'){mood='relaxed';pois=POIS.garage();}
  else if(ph==='e6-yard'){mood='explore';pois=POIS.yard();goal=WPa(WS.houseDoor);}
  else if(ph==='e6-house'){mood='explore';pois=POIS.house();}
  else if(ph==='e6-gallery'){mood='tense';pois=POIS.gallery();}
  else if(/^e6-(lower|grille)$/.test(ph))mood='tense';
  else if(/^n6-(flood|hold|double|sealed)$/.test(ph))mood='danger';
  else if(ph==='n6-rescue'){mood='escape';goal=WPa(WS.padStand);}
  else if(ph==='n6-after')mood='tense';
  brain.setScene({mood,pois,goal});}
 // ---- every frame ----------------------------------------------------------------------------------------------------------------------------------------
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase;mind();
  if(C.jdoor!=null)world.doors.jamie?.set(C.jdoor);// (Jamie's front door, while this chapter has it: the prologue's own door logic shuts it every frame first)
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  clock(dt);updatePose(dt);match(dt);guard(dt);standAll();photo.update(dt);if(C.view==='camera'){C.viewT+=dt;if(photo.current&&!photo.current.canvas&&!photo.current.lead)photo.take(photo.V.i);}
  inv.update();if(inv.isOpen&&(C.view||posed()||C.fadeOut>=0||C.endT>=0))inv.close();
  if(C.crankT>0){C.crankT-=dt;works.crank.rotation.z+=dt*9;}
  // the works and the weather (drawn only where you are)
  if(works.root.parent){works.update(dt,{eye:camera.position});const forced=works.LAMPS['J-c'];if(forced?.force){forced.shown=forced.level=damp(forced.level,1,3,dt);forced.bulb.material.emissiveIntensity=2.6*forced.shown;}}
  const cvNow=inWorks()?works.cave(camera.position.x,camera.position.z):0;storm.update(dt,{storm:C.storm,rain:C.rain,indoor:cvNow>.3?1:0,lightning:/^(e6|n6)-/.test(ph)});
  cast.update(dt,{eye:camera.position});phys.sync();rescue.update(C.t,rescue.g.visible);updateAmb(dt);
  for(const c of [jamie,sam])if(c.crouch!==undefined&&!c.script&&c.crouch>0&&!/^n6-(flood)$/.test(ph))c.crouch=Math.max(0,c.crouch-dt);
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.6));if(C.fadeIn>=1.6){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.8));if(C.fadeOut>=1){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(ph==='c6-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<5.6&&!C.cardOn)card(true,{title:'Chapter Six',eyebrow:'LAST LIGHT',sub:'SOMEONE WAS HERE<br><small>THURSDAY, AUGUST 25, 2011</small>'});if(C.cardT>5.6&&C.cardOn)card(false);if(C.cardT>6.8)opening();}
  else if(ph==='d6-room'||ph==='d6-phone'){updateRoom(dt);}
  else if(ph==='d6-ride')updateRide(dt);
  else if(ph==='d6-meet')updateMeeting(dt);
  else if(ph==='d6-oak')updateOak(dt);
  else if(ph==='d6-street'){updateStreet(dt);if(C.st?.after)updateCreek(dt);}
  else if(ph==='d6-jamie')updateJamie(dt);
  else if(ph==='d6-creek'){}
  else if(ph==='e6-garage')updateRecords(dt);
  else if(ph==='e6-yard'||ph==='e6-house')updateWorks(dt);
  else if(ph==='e6-gallery')updateGallery(dt);
  else if(ph==='e6-lower')updateLower(dt);
  else if(ph==='e6-grille')updateGrille(dt);
  else if(ph==='n6-flood')updateFlood(dt);
  else if(ph==='n6-hold')updateHold(dt);
  else if(ph==='n6-double')updateDouble(dt);
  else if(ph==='n6-sealed')updateSealed(dt);
  else if(ph==='n6-rescue')updateRescue(dt);
  else if(ph==='n6-after'){updateAfter(dt);if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n6-end');end();}}}
  if(C.view==='look'&&ph!=='d6-room'&&ph!=='d6-phone'){C.lookT+=dt;if(C.lookDur&&C.lookT>C.lookDur&&!busy()&&C.lookKind!=='plan')endLook();}
  if(C.view==='look'&&C.lookKind==='plan'&&C.rec?.stage!=='plan'&&C.rec?.stage!=='camera')C.flags.planDone=true;
  const L6=sky();A.day=L6.day;A.night=L6.night;ch2.day=A.day;A.shade=0;A.barLight=false;}
 // ---- lifecycle ------------------------------------------------------------------------------------------------------------------------------------------
 function reset(){const hadPose=C.pose,hadView=!!C.view;card(false);if(C.view==='camera')photo.close();inv.reset();
  if(nav.room===home.nav||nav.room===works.nav)nav.setRoom(null);home.reset();works.attach(false);works.reset();storm.reset();storm.attach(false);cast.reset();rescue.g.visible=false;car3.show(false);
  SHIRT.hide();PIN.place?.(new THREE.Vector3(works.pinAt.stow.x,works.pinAt.stow.y,works.pinAt.stow.z),new THREE.Euler(0,0,Math.PI/2));works.pinTo('stow');helmetP.hide();planP.hide();folderP.hide();props.rolled(false);for(const mk of [...props.planMarks])props.planMarks.delete(mk);
  bagHand.visible=false;camHand.visible=false;radioHand.visible=false;reyesRadio.visible=false;wxRadio.visible=false;props.samNotes.removeFromParent();props.bin.removeFromParent();props.log.removeFromParent();props.plan.removeFromParent?.();
  if(props.blanket.parent)props.blanket.removeFromParent();for(const p of studio)p.group.visible=false;shade.group.visible=false;
  for(const c of [jamie,sam]){c.gone=false;c.crouch=0;}o.setPace?.(1);works.nav.ducking=false;
  if(A6.started)ch5.presentation(false);A6.started=false;A6.finished=false;
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView)o.roam.walkLock=false;fresh();}
 // QA jumps, DEV scenes and Continue: the chapter at one of its moments, with every earlier beat's flags set as playing sets them.
 function jump(section){jumpTo(section);}
 function jumpTo(section){section=ALIAS6[section]||section;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();minds();A6.started=true;
  if(section==='chapter6-start'){begin();return;}
  common();dayWorld();objective('');phys.reset();o.foot.arms=phys.arms;cameraPictures();
  const ix=SECTIONS6.indexOf(section),ff=(...ks)=>{for(const kk of ks)C.flags[kk]=true;},hh=h=>{C.h=h;C.minute=-1;date(h);};
  const quiet=()=>{S.queue.length=0;S.line=null;};
  // ---- the morning ----
  if(ix<=SECTIONS6.indexOf('c6-phone')){placeAtHome();boysAtSams();meetingStage(false);hh(HOUR.start+.02);go('d6-room');C.room={t:20,upAt:0};ff('awake','up');
   if(section==='c6-room'){C.room.t=0;const b=HS.bed;C.flags.up=false;pose({x:b.x,z:b.z},{y:b.y+.62,yaw:headingTo(b.x,b.z,HS.door.x,HS.door.z)+.5,pitch:.42});C.pose.w=1;C.flags.awake=true;return;}
   if(section==='c6-camera'){return;}
   C.inv.camera='have';home.cameraOnDesk(false);ff('reviewed');C.reviewAt=C.t-10;hh(HOUR.phone);ringPhone();quiet();return;}
  ff('awake','up','reviewed','ring','answered','called');C.inv.camera='have';home.cameraOnDesk(false);
  if(section==='c6-ride'){hh(HOUR.ride);const [sx,sz]=landing(HS.stoop.x,HS.stoop.z),bk=main(home.P.drivD+1,home.P.side*9.4),road=main(home.P.drivD+1,0);o.placePlayer({x:sx,z:sz,a:headingTo(sx,sz,road.x,road.z),mode:'walk',bike:{x:bk.x,z:bk.z,a:headingTo(bk.x,bk.z,road.x,road.z)}});
   boysAtSams();meetingStage(true);go('d6-ride');objective('Ride to Sam’s.','Oak Hollow, toward the oak. The ranch with the blue garage trim.');return;}
  // ---- Sam's garage ----
  const atMeeting=()=>{boysAtSams();meetingStage(true);const q=mp('you'),bk=drive(1.3,5.4);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,TL(0,0).x,TL(0,0).z),mode:'walk',bike:{x:bk.x,z:bk.z,a:driveA(1.3,5.4)}});};
  if(ix<=SECTIONS6.indexOf('c6-photos')){hh(HOUR.meet);atMeeting();
   if(section==='c6-meeting'){meetStart();return;}
   C.meet={t:30,stage:'shirt',pics:new Set(),silT:0};go('d6-meet');checkpoint('c6-meeting');stand(jamie,mp('jamie'),{look:()=>TL(0,0,.9),keep:true,max:1.6});stand(sam,mp('sam'),{look:()=>TL(0,0,.9),keep:true,max:1.6});
   if(section==='c6-shirt'){quiet();C.meet.t=0;shirtOut();return;}
   SHIRT.hide();C.inv.shirt='reyes';ff('shirtOnTable','bagged','dadHands');C.meet.stage='pictures';ff('showPics');objective('Show Officer Reyes the pictures.','Alex’s camera. F, by Reyes.');return;}
  ff('shirtOnTable','bagged','showPics','showing','silSeen','silDone','copy','given');C.inv.shirt='reyes';C.inv.camera='reyes';SHIRT.hide();
  if(section==='c6-plan'){hh(HOUR.meet+.6);atMeeting();C.meet={t:200,stage:'jamie',pics:new Set(['c5-register3','c5-searchmap','c5-campfire']),silT:2};go('d6-meet');stand(jamie,mp('jamie'),{look:()=>TL(0,0,.9),keep:true,max:1.6});stand(sam,mp('sam'),{look:()=>TL(0,0,.9),keep:true,max:1.6});quiet();jamieTells();return;}
  ff('met');
  // ---- the streets ----
  if(ix<=SECTIONS6.indexOf('c6-oak')){hh(HOUR.oak);const s0=LOOK.stop;o.placePlayer({x:s0.x,z:s0.z,a:headingTo(s0.x,s0.z,LOOK.oak.x,LOOK.oak.z),mode:'walk',bike:{x:main(LOOKOUT.stop.d-1,-1.6).x,z:main(LOOKOUT.stop.d-1,-1.6).z,a:headingTo(s0.x,s0.z,LOOK.oak.x,LOOK.oak.z)}});
   const jb=main(LOOKOUT.stop.d-2,1.5),sb=main(LOOKOUT.stop.d-3,-2.8);comp.putFoot(jamie,jb.x+.8,jb.z,headingTo(jb.x,jb.z,LOOK.oak.x,LOOK.oak.z),{bike:{x:jb.x,z:jb.z,a:headingTo(jb.x,jb.z,LOOK.oak.x,LOOK.oak.z),kick:1}});
   comp.putFoot(sam,sb.x-.8,sb.z,headingTo(sb.x,sb.z,LOOK.oak.x,LOOK.oak.z),{bike:{x:sb.x,z:sb.z,a:headingTo(sb.x,sb.z,LOOK.oak.x,LOOK.oak.z),kick:1}});follow(true);go('d6-oak');C.oak={t:0};quiet();oakTalk();return;}
  ff('oakDone');
  const onStreet=(d,a=Math.PI)=>{const q=main(d,-2.4),hd2=headingTo(q.x,q.z,main(d-10,-2.4).x,main(d-10,-2.4).z);o.placePlayer({x:q.x,z:q.z,a:hd2,mode:'ride',speed:2.5});const j=main(d+3.5,-1.4),s=main(d+5.5,-3);comp.putRiding(jamie,j.x,j.z,hd2,2.5);comp.putRiding(sam,s.x,s.z,hd2,2.5);follow(true);jamie.follow='ride';sam.follow='ride';void a;};
  if(section==='c6-street'){hh(HOUR.oak+.2);onStreet(900);go('d6-street');C.st={t:0};objective('Meet Officer Reyes at Briarwood.','Back down Oak Hollow, where Alex turned.');return;}
  if(section==='c6-anomaly'){hh(HOUR.jamie);onStreet(805);go('d6-street');C.st={t:0};quiet();jamieHome();return;}
  ff('jamieShaken','anomSeen');
  if(section==='c6-creek'){hh(HOUR.creek-.02);const q=side(84,-2.2),q2=side(92,-2.2),hd2=headingTo(q.x,q.z,q2.x,q2.z);o.placePlayer({x:q.x,z:q.z,a:hd2,mode:'walk',bike:{x:side(83,-3.3).x,z:side(83,-3.3).z,a:hd2}});
   comp.putFoot(jamie,side(85,-.6).x,side(85,-.6).z,hd2,{bike:{x:side(84.4,.4).x,z:side(84.4,.4).z,a:hd2,kick:1}});comp.putFoot(sam,side(83.5,-3.8).x,side(83.5,-3.8).z,hd2,{bike:{x:side(82.4,-4.6).x,z:side(82.4,-4.6).z,a:hd2,kick:1}});
   follow(true);go('d6-street');C.st={t:0,stop:true,after:true};creekStage();C.flags.jamieShaken=true;return;}
  ff('creekDone','toRecords');
  // ---- the plan ----
  if(ix<=SECTIONS6.indexOf('c6-map')){hh(HOUR.records);const q=mp('you'),bk=drive(1.3,5.4);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,TL(0,0).x,TL(0,0).z),mode:'walk',bike:{x:bk.x,z:bk.z,a:driveA(1.3,5.4)}});
   if(section==='c6-records'){quiet();recordsStart();return;}
   go('e6-garage');C.rec={t:60,stage:'plan'};recordsStage();const rp=mp('reyes'),car=main(SH.drivD-7,-3.0),car2=main(SH.drivD+4,-3.0);k.carA.show(true);k.carA.park(car.x,car.z,headingTo(car.x,car.z,car2.x,car2.z));
   reyes.show(true);reyes.place(rp.x,rp.z,headingTo(rp.x,rp.z,TL(0,0).x,TL(0,0).z));C.inv.camera='have';ff('camBack');stand(jamie,TL(1.0,.25,0),{look:()=>TL(0,0,.9),keep:true,max:1.4});stand(sam,G5.samStand(-.1),{look:()=>TL(0,0,.75),keep:true,max:1.4});
   const tp=TL(-.05,-.02,.724);planP.place(tp,new THREE.Euler(0,-driveA(0,0),0));props.rolled(false);C.inv.plan=true;folderP.place(TL(-.55,.1,.73),new THREE.Euler(0,-driveA(0,0)+.2,0));quiet();C.rec.planAt=C.t;objective('Look at the plan.','On the table. F.');return;}
  ff('camBack','planLook','planWords','toWorks');C.inv.camera='have';C.inv.plan=true;for(const mk of ['alex','line4','dw','rac','meet','works','rack'])props.mark(mk);
  // ---- the works ----
  worksWorld();worksPeople();C.flags.noBikes=true;C.stormTo=C.storm=.62;C.rainTo=C.rain=.22;minds();
  if(section==='c6-works'){hh(HOUR.works);go('e6-yard');checkpoint('c6-works');C.wk={t:0,stage:'hello'};works.WATER.chan.want=works.WATER.chan.y=-4.45;quiet();yardTalk();return;}
  C.inv.flashlight=true;o.setFlashlight?.(true,false);
  if(section==='c6-gatehouse'){hh(HOUR.works+.08);go('e6-yard');C.wk={t:30,stage:'go'};const q=WP(21,-3.9);o.placePlayer({x:q.x,z:q.z,a:-Math.PI/2,mode:'walk',bike:leftBike()});
   comp.putFoot(jamie,WP(22.6,-3.2).x,WP(22.6,-3.2).z,-Math.PI/2,{bike:null});comp.putFoot(sam,WP(23,-4.6).x,WP(23,-4.6).z,-Math.PI/2,{bike:null});const r=WP(19.5,-5.6);reyes.place(r.x,r.z,-Math.PI/2);const b=WP(18.6,-2);brandt.place(b.x,b.z,Math.PI);follow(true);quiet();houseIn();return;}
  ff('helmetSeen','logTalk');C.inv.helmet='reyes';C.inv.radio=true;radioHand.visible=true;
  const inGallery=(x,z,a=Math.PI)=>{const q=WP(x,z);o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:leftBike()});comp.putFoot(jamie,WP(x-.9,z+1.2).x,WP(x-.9,z+1.2).z,a,{bike:null});comp.putFoot(sam,WP(x+.6,z+1.6).x,WP(x+.6,z+1.6).z,a,{bike:null});follow(true);};
  C.stormTo=C.storm=.72;C.rainTo=C.rain=.45;works.WATER.chan.want=works.WATER.chan.y=-4.2;
  if(section==='c6-gallery'||section==='c6-radio'){hh(HOUR.works+.16);inGallery(8,4);brandt.place(WPa(WS.L).x,WPa(WS.L).z,0);reyes.place(WPa(WS.L).x-.8,WPa(WS.L).z,0);go('e6-yard');C.wk={t:60,stage:'down'};galleryStart();if(section==='c6-radio'){C.gal.t=33;C.gal.flick=true;}quiet();return;}
  ff('radio');C.gal={t:99,flick:true,radio:true,echo:true,down:true,downAt:C.t};
  works.WATER.chan.want=works.WATER.chan.y=-4.0;C.stormTo=C.storm=.85;C.rainTo=C.rain=.8;
  works.prints.visible=true;
  if(section==='c6-lower'){hh(HOUR.works+.3);const q=WP(8,15.4);o.placePlayer({x:q.x,z:q.z,a:Math.PI,mode:'walk',bike:leftBike()});comp.putFoot(jamie,WP(8,13.4).x,WP(8,13.4).z,Math.PI,{bike:null});comp.putFoot(sam,WP(8,12.6).x,WP(8,12.6).z,Math.PI,{bike:null});
   reyes.place(WPa(WS.L).x-.8,WPa(WS.L).z,0);brandt.place(WPa(WS.L).x+.6,WPa(WS.L).z+1.2,0);go('e6-gallery');follow(true);quiet();lowerStart();return;}
  C.low={t:90,stage:'j'};ff('plate');works.prints.visible=true;
  const inJ=(z,a=Math.PI)=>{const q=WP(9,z);o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:leftBike()});comp.putFoot(jamie,WP(8.4,z+.9).x,WP(8.4,z+.9).z,a,{bike:null});follow(true);};
  const samAtPlate=()=>{const sp=WP(GATE.sam.x,GATE.sam.z);comp.putFoot(sam,sp.x,sp.z,headingTo(sp.x,sp.z,WP(GATE.lever.x+.1,GATE.z+.21).x,WP(GATE.lever.x+.1,GATE.z+.21).z),{bike:null});stand(sam,[sp.x,sp.z],{look:()=>WP(GATE.lever.x+.1,GATE.z+.21,FLOOR.low+1.55),keep:true,max:.6,leash:40});};
  if(section==='c6-grille'||section==='c6-grate-scare'){hh(HOUR.works+.42);inJ(31.6);samAtPlate();brandt.place(WP(9.6,34.2).x,WP(9.6,34.2).z,0);reyes.place(WP(8.4,33.6).x,WP(8.4,33.6).z,0);reyes.gest('flashlight');go('e6-lower');quiet();grilleStart();
   if(section==='c6-grate-scare'){quiet();C.gr.stage='figure';C.gr.figAt=C.t-6;C.gr.bellAt=C.t-8;}return;}
  ff('axSeen');C.gr={t:99,stage:'after',done:true,flood:true,seen:2,shown:true,called:true,hit:true};works.WATER.chan.want=works.WATER.chan.y=-3.6;
  if(section==='c6-emergency'){hh(HOUR.flood-.01);inJ(33.4);samAtPlate();brandt.place(WP(9.6,34.2).x,WP(9.6,34.2).z,0);reyes.place(WP(8.6,35).x,WP(8.6,35).z,0);reyes.gest('flashlight');go('e6-grille');quiet();floodStart();return;}
  // ---- the gate held ----
  const inL=(x,z,a=0)=>{const q=WP(x,z);o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:leftBike()});comp.putFoot(jamie,WP(8.2,20.6).x,WP(8.2,20.6).z,0,{bike:null});};
  const holdState=()=>{works.ST.power=false;works.ST.alarm=1;works.GS.mode='down';works.GS.gap=1.62;works.GS.held=true;works.WATER.chan.want=works.WATER.chan.y=-3.0;works.WATER.J.want=works.WATER.J.y=FLOOR.low+.85;works.WATER.L.want=works.WATER.L.y=FLOOR.low+.3;
   S.flashOn=true;ch2.samBeam&&(ch2.samBeam.on=true);const sp=WP(GATE.sam.x,GATE.sam.z);comp.putFoot(sam,sp.x,sp.z,headingTo(sp.x,sp.z,WP(9,21).x,WP(9,21).z),{bike:null});stand(sam,[sp.x,sp.z],{look:()=>camera.position,keep:true,max:.3,gesture:GEST.brake(1),leash:99});C.samHolds=true;
   const gq=WP(8.15,22.35);reyes.place(gq.x,gq.z,0);reyes.gest('flashlight');brandt.show(false);C.flags.hurry=true;C.fl={t:60,stage:'under',crossed:true};C.stormTo=C.storm=1;C.rainTo=C.rain=1;
   stand(jamie,WP(8.2,20.6),{look:()=>WP(9,25,FLOOR.low+1),keep:true,max:.6,leash:30});};
  if(ix<=SECTIONS6.indexOf('c6-double')){hh(HOUR.flood+.04);inL(9.6,21.2,0);holdState();go('n6-flood');quiet();
   if(section==='c6-hold'){holdStart();return;}
   holdStart();quiet();C.hold.stage='pin';
   if(section==='c6-pin'){objective('Pull the locking pin.','Red handle, on the wall by the gate.');return;}
   C.inv.pin='hand';PIN.holdBy(o.self,'r');phys.playerHold('r',PIN);C.hold.tries=1;C.hold.ready=true;C.hold.readyAt=C.t-7;objective('Push the pin through the guide.','The hole in the gate’s guide, waist high.');return;}
  // ---- after the gate ----
  ff('samGone');sam.gone=true;sam.person.group.visible=false;comp.release(sam);
  const sealedState=()=>{works.ST.power=false;works.ST.alarm=1;works.GS.mode='shut';works.GS.gap=0;works.GS.held=false;works.WATER.chan.want=works.WATER.chan.y=-3.0;works.WATER.J.want=works.WATER.J.y=FLOOR.low+3;works.WATER.L.want=works.WATER.L.y=FLOOR.low+.18;
   S.flashOn=true;C.stormTo=C.storm=1;C.rainTo=C.rain=1;brandt.show(false);C.flags.hurry=true;};
  if(section==='c6-sealed'){hh(HOUR.flood+.08);inL(9.4,21.4,0);sealedState();reyes.place(WP(9.2,22.1).x,WP(9.2,22.1).z,0);reyes.gest('flashlight');go('n6-double');quiet();sealedStart();return;}
  if(section==='c6-rescue'||section==='c6-manhole'){hh(HOUR.flood+.12);sealedState();go('n6-sealed');C.sl={t:60,did:new Set(['bang','pull']),stage:'up',upAt:C.t,up:true};
   const q=WP(section==='c6-manhole'?15.6:20,section==='c6-manhole'?28.6:12);o.placePlayer({x:q.x,z:q.z,a:Math.PI,mode:'walk',bike:leftBike()});comp.putFoot(jamie,WP(q.x-W0x(),q.z-W0z()-1.4).x,WP(q.x-W0x(),q.z-W0z()-1.4).z,Math.PI,{bike:null});follow(true);
   const pd=WPa(WS.padStand);reyes.place(pd.x,pd.z,0);reyes.gest('brace');C.flags.reyesAtPad=true;works.ST.southGate=1;quiet();rescueGo();if(section==='c6-manhole'){C.rs.stage='lift';}return;}
  // ---- later ----
  ff('rescued');
  afterStart();quiet();C.fadeIn=-1;o.fade(0);
  if(section==='c6-testimony'){C.af.stage='talk';C.af.at=C.t-30;const q=WP(23.6,8.4);o.placePlayer({x:q.x,z:q.z,a:Math.PI,mode:'walk',bike:leftBike()});return;}
  if(section==='chapter6-end'){C.af.stage='radio';C.af.at=C.t-2;const q=WP(23.4,8.8);o.placePlayer({x:q.x,z:q.z,a:Math.PI,mode:'walk',bike:leftBike()});return;}}
 const W0x=()=>works.local(0,0).x,W0z=()=>works.local(0,0).z;
 // ---- the api --------------------------------------------------------------------------------------------------------------------------------------------
 Object.assign(A6,{SECTIONS:SECTIONS6,ALIAS:ALIAS6,LABEL:LABEL6,owns,handles,begin:()=>{A6.started=true;begin();},update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,jamieSweep,officerAim,
  light:()=>owns(S.phase)?sky():null,longThrow:()=>null,
  canDismount:()=>!posed()&&!C.view&&S.phase!=='c6-black'&&!inWorks()&&!(nav.room===home.nav),
  canRemount:()=>!C.view&&!posed()&&!inWorks()&&!/^(d6-(room|phone|meet)|e6-garage)$/.test(S.phase)&&!(S.phase==='d6-jamie'),
  closeBag:()=>{if(inv.isOpen){inv.close();return true;}return false;},inventoryReady:()=>owns(S.phase)&&S.phase!=='c6-black',
  C,home,works,cast,props,storm,inv,FIREPIC,firePicture,silInView,sky,WP,TL,SHIRT,PIN,car3,rescue,brain,
  JAM:{door:JDOOR,step:JSTEP,foyer:JFOYER,drive:JDRIVE,bike:JBIKE},BW,LOOK,GRILLE_Z,AXSTAND});
 Object.defineProperties(A6,{amb:{get:()=>C.amb},viewing:{get:()=>C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,inv:{...C.inv},looked:[...C.looked].sort(),
   zone:zone(p),gate:{gap:+works.GS.gap.toFixed(3),mode:works.GS.mode,held:works.GS.held},water:Object.fromEntries(Object.entries(works.WATER).map(([kk,w])=>[kk,+w.y.toFixed(3)])),power:works.ST.power,
   storm:+C.storm.toFixed(3),rain:+C.rain.toFixed(3),samGone:!!sam.gone,sam2:SAM2.mode!=='off'&&SAM2.person.group.visible,ax:AX.mode!=='off'&&AX.person.group.visible,jamie2:JAMIE2.mode!=='off'&&JAMIE2.person.group.visible,
   anom:C.anom?{seen:+C.anom.seenTotal.toFixed(2),shown:!!C.anom.shown,gone:!!C.anom.gone,why:C.anom.why||null}:null,dbl:C.dbl?{seen:+C.dbl.seen.toFixed(2),both:+C.dbl.both.toFixed(2),stage:C.dbl.stage}:null,
   photos:photo.photos.length,pics:{...C.pics},sounds:{...C.sounds},guard:C.guardLog?{...C.guardLog}:null,endT:+C.endT.toFixed(2)};}}});
 return A6;
}
