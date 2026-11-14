// Aftermath I: What Was Left. Saturday morning, August 27, 2011, to an afternoon in October.
//
//  I.   Who came home. The school at half past six, the smoke still over the town: two bikes, the rack by the gym doors, Sam
//       who cannot let go of his. Inside, a shelter: cots, lists, a board of the missing. People look up at two boys, and then
//       past them at the doors. Jamie's mother. Alex's parents, who have waited since the twenty-first. Sam's father and the fan
//       he left on. Your own mother.
//  II.  What they remember. A nurse's room that afternoon: the water grey in the sink, Sam and the arm that sheared at the pin.
//       Sunday, a classroom: Reyes writing down what he saw, and asking for yours beside it. Monday, the county's list on the
//       gym wall: a line with no name on it, and a pen.
//  III. The places they left. Oak Hollow Drive behind a fence, with Reyes, as far as the barricade: the houses with paint on
//       their doors, the bikes still under Sam's streetlight, the oak across a hole nobody can cross. Jamie's porch. Alex's
//       driveway. A lawn at dusk and a gym full of his pictures. A chain that always came off, and Sam who can fix it.
//  IV.  Leaving Oak Hollow. The fence a block further up. A letter on the kitchen table. A room in boxes. Sam at the curb.
//       The road out, and the last of the light on it.
//
// chapter8.js hands this file every phase that starts a1-. Nothing of Chapters Zero to Eight is rebuilt or replayed here: the
// street is Chapter Eight's own (chapter8-town.js, chapter8-ruin.js, as it fell, then weeks older), the people are the ones the
// earlier chapters made, the house is your own (chapter6-home.js). New places: the school (aftermath1-places.js).
// No creature, no chase, no failure state. Nobody comes back.
import * as THREE from './three.module.js';
import {headingTo,wrap,createActor} from './people.js';
import {P as PI,newPose,applyPose,copyPose} from './rig.js';
import {createCompanionBrain} from './companion-brain.js';
import {createInventory} from './inventory.js';
import {ACT} from './chapter8-acting.js';
import {adultFace} from './aftermath1-acting.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// QA jumps, DEV scenes and Continue checkpoints, in story order (each starts a little before its moment)
export const SECTIONS9=['aftermath1-start','a1-arrive','a1-gym','a1-jamie-mom','a1-alex-parents','a1-families','a1-quiet-room','a1-record','a1-names',
 'a1-return','a1-remained','a1-porch','a1-driveway','a1-memorial-jamie','a1-memorial-alex','a1-sam','a1-weeks','a1-home','a1-packing','a1-goodbye','a1-road-out','aftermath1-end'];
export const ALIAS9={'a1-start':'aftermath1-start','a1-shelter':'a1-gym','a1-school':'a1-arrive','a1-jamies-mother':'a1-jamie-mom','a1-alexs-parents':'a1-alex-parents','a1-sams-family':'a1-families','a1-quiet':'a1-quiet-room',
 'a1-reyes':'a1-record','a1-evidence':'a1-record','a1-memory':'a1-names','a1-oak-hollow':'a1-return','a1-bikes':'a1-remained','a1-keepsakes':'a1-remained','a1-jamies-porch':'a1-porch','a1-alexs-driveway':'a1-driveway',
 'a1-memorials':'a1-memorial-jamie','a1-conversation':'a1-sam','a1-chain':'a1-sam','a1-october':'a1-weeks','a1-letter':'a1-home','a1-room':'a1-packing','a1-goodbye-sam':'a1-goodbye','a1-road':'a1-road-out','a1-end':'aftermath1-end'};
export const LABEL9={'aftermath1-start':'What was left','a1-arrive':'The school','a1-gym':'The shelter','a1-jamie-mom':'Jamie’s mother','a1-alex-parents':'Alex’s parents','a1-families':'Sam’s father','a1-quiet-room':'The nurse’s room',
 'a1-record':'Reyes’s record','a1-names':'The list','a1-return':'Behind the fence','a1-remained':'Under the streetlight','a1-porch':'Jamie’s porch','a1-driveway':'Alex’s driveway','a1-memorial-jamie':'Jamie’s lawn',
 'a1-memorial-alex':'Alex’s pictures','a1-sam':'The chain','a1-weeks':'October','a1-home':'The letter','a1-packing':'Your room','a1-goodbye':'Sam','a1-road-out':'The road out','aftermath1-end':'What was left'};
const PHASES=['a1-black','a1-arrive','a1-gym','a1-jamie','a1-alex','a1-family','a1-quiet','a1-record','a1-names','a1-return','a1-remain','a1-porch','a1-drive','a1-mem1','a1-mem2','a1-sam','a1-weeks','a1-home','a1-pack','a1-bye','a1-road','a1-end'];
export const SAVE9='lastlight.aftermath1';// what Aftermath II will find: what was kept, and who has it
export const SAVE8='lastlight.chapter8';
const fmt=h=>{const hh=((h%24)+24)%24,H=Math.floor(hh),M=Math.floor((hh-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};

// The sky and the light, by what the day is (game.js reads day, p (the evening's warmth), night, storm (a grey cover: here, smoke),
// apoc (what is left of the red: none after the first morning)). A month is a different light, not a caption.
export const SKY9={
 dawn:{day:.34,p:.46,night:.2,deep:.04,fill:.05,storm:.44,apoc:.07},   // August 27, half past six: smoke over the town, the red gone brown
 smoke:{day:.78,p:.1,night:0,deep:0,fill:0,storm:.34,apoc:0},            // the days after: daylight through haze
 clear:{day:1,p:0,night:0,deep:0,fill:0,storm:.05,apoc:0},               // September: an ordinary sky over a street that is not
 evening:{day:.2,p:.72,night:.2,deep:.05,fill:.05,storm:.04,apoc:0},     // a lawn at dusk, the porch light on
 autumn:{day:.66,p:.3,night:0,deep:0,fill:0,storm:0,apoc:0},             // October: low gold in the afternoon
 last:{day:.3,p:.64,night:.08,deep:0,fill:0,storm:0,apoc:0},             // the road out: the last of the light
};
// Grown-ups this chapter adds: your mother (Chapter Six's voice in the kitchen, seen for the first time), a volunteer with the
// lists, a paramedic. Dressed as people.js dresses everyone.
export const ADULTS9={
 mom:{name:'MOM',scale:1.14,face:{jaw:.85,cheek:.97,eyeGap:.036,eyeY:.013,browTilt:.1,nose:'button',mouth:'flat',ears:.95,skin:0xd9a883,lips:0xb07062,iris:0x3a3020},
  hair:{style:'ponytail',color:0x5a4030},build:{bulk:.95,shoulders:.96,head:.95,posture:0,hunch:.03},clothes:{shirt:0x4f6f7a,trim:null,sleeves:'long',pants:0x3a3f4e,socks:0x3a3f4e,shoes:0x5a5048,sole:0x3a3430}},
 volunteer:{name:'VOLUNTEER',scale:1.12,face:{jaw:.86,cheek:1.02,eyeGap:.036,eyeY:.013,browTilt:.12,nose:'broad',mouth:'flat',ears:.96,skin:0x8a5a3e,lips:0x6e4234,iris:0x20140e},
  hair:{style:'ponytail',color:0x1a1412},build:{bulk:1,shoulders:.96,head:.96,posture:0,hunch:.03},clothes:{shirt:0xd8d2c2,trim:null,sleeves:'short',pants:0x4a5262,socks:0x4a5262,shoes:0xdcd8cc,sole:0xa8a49a}},
 medic:{name:'PARAMEDIC',scale:1.2,face:{jaw:.96,cheek:.96,eyeGap:.037,eyeY:.012,browTilt:.02,nose:'straight',mouth:'flat',ears:1,skin:0xe0b898,lips:0xb07868,iris:0x3a4a5a},
  hair:{style:'cropped',color:0x6a4a2c},build:{bulk:1.1,shoulders:1.1,head:.97,posture:0,hunch:.02},clothes:{shirt:0x2c4a72,trim:0xd8d8d0,collar:true,sleeves:'short',pants:0x1e2636,socks:0x1e2636,shoes:0x141416,sole:0x1d1d1f}},
};

export function createAftermath1(o,k,{chapter2:ch2,chapter3:ch3,chapter4:ch4,chapter5:ch5,chapter6:ch6,chapter7:ch7,chapter8:ch8}){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam}=k,A=k.api,T=o.tension,police=k.police;
 const me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,main=k.main,side=k.side;
 const go=ph=>{k.go(ph);C.pt=0;};
 const phys=ch5.phys;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL9);
 const A9={},C={};
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos||camera.position,opts);}
 const gy=(x,z)=>nav.groundY(x,z);
 // ---- the people ----------------------------------------------------------------------------------------------------------------
 const reyes=k.officer2,officer=k.officer,alexDad=k.dad,alexMom=k.mom,neighbor=k.neighbor;
 const samDad=ch6.cast?.samDad,brandt=ch6.cast?.brandt,fire=ch6.cast?.fire||[],samMom=ch4.samMom,jamieMom=ch7.cast?.jamieMom;
 const STREET=ch8.SC?.STREET,[mrsH,mrH,lily,pruitt,davis,run1,run2]=STREET?.PEOPLE||[];
 const mom=createActor(scene,nav,ADULTS9.mom,{seed:201}),vol=createActor(scene,nav,ADULTS9.volunteer,{seed:202}),medic=createActor(scene,nav,ADULTS9.medic,{seed:203});
 const extras=[...(ch2.extra||[]),...Object.values(ch3.people||{}),run1,run2].filter(Boolean);
 // (the kit's own five are moved by Chapter One every frame; everyone else here by this file)
 const OWN=[samDad,samMom,jamieMom,brandt,...fire,mrsH,mrH,lily,pruitt,davis,mom,vol,medic,...extras].filter(Boolean),KIT=[reyes,officer,alexDad,alexMom,neighbor];
 const EVERYONE=[...KIT,...OWN];
 // their faces: laid over the grown-ups' heads while the chapter runs (aftermath1-acting.js), taken off when it ends
 const FACES=new Map();for(const a of EVERYONE)if(a.art?.mouth&&a.art?.brows)FACES.set(a,adultFace(a));
 function facesOn(on){for(const f of FACES.values())on?f.attach():f.detach();}
 const brain=createCompanionBrain({nav,comp});
 // ---- lights the chapter brings (a gym's lamps, a porch light, candles): the same six, moved --------------------------------------
 const LIGHTS=[0,1,2,3,4,5].map(i=>{const l=new THREE.PointLight(0xfff0d8,0,12,1.6);l.name='a1-light-'+i;return l;});
 function lightsOn(on){for(const l of LIGHTS){if(on&&!l.parent)scene.add(l);else if(!on&&l.parent)l.removeFromParent();if(!on){l.intensity=0;l.userData.base=0;}}}
 function light(i,q,{intensity=3,dist=12,color=0xfff0d8,flicker=0}={}){const l=LIGHTS[i];if(!q){l.intensity=0;l.userData.base=0;return;}l.position.set(q.x,q.y,q.z);l.intensity=intensity;l.distance=dist;l.color.setHex(color);l.userData.base=intensity;l.userData.flicker=flicker;}
 // ---- what was kept (lastlight.aftermath1): the things the later story needs, and who has them ----------------------------------
 // cap: 'you' | 'mom' (Jamie's mother has it). notebook: 'sam' | 'you'. camera: 'reyes' (evidence) | 'parents'. print: the picture
 // Alex's father gives you. Everything else is what was said and done (told, wrote, bell, note, boxed).
 const KEEP0=()=>({cap:'you',capWhen:null,notebook:'sam',camera:'reyes',print:false,wrote:false,bell:false,note:false,told:{},boxed:[],left:false});
 function carried8(){try{const v=JSON.parse(localStorage.getItem(SAVE8)||'null');return v?.carried||null;}catch{return null;}}
 function saveKeep(){try{localStorage.setItem(SAVE9,JSON.stringify({...C.keep,section:C.lastCheckpoint||null,at:Date.now()}));}catch{}}
 function loadKeep(){try{const v=JSON.parse(localStorage.getItem(SAVE9)||'null');if(!v||typeof v!=='object')return null;const K=KEEP0();for(const key of Object.keys(K))if(v[key]!==undefined)K[key]=v[key];return K;}catch{return null;}}
 function keep(key,val){C.keep[key]=val;saveKeep();mark('kept: '+key+'='+(typeof val==='object'?JSON.stringify(val):val));}
 // ---- state ----------------------------------------------------------------------------------------------------------------------
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,dt:0,h:6.5,day:'AUGUST 27',flags:{},timers:[],tasks:[],offers:new Map(),hold:{},cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,view:null,lookKind:null,minute:-1,
  sounds:{},amb:{traffic:0,insects:.1,wind:.3,life:0,forest:0,tunnel:0,water:0},seen:new Set(),choice:null,marks:[],where:null,sky:'dawn',inside:0,insideWant:0,skyK:{},
  grief:1,pCry:0,pCryT:0,sobNext:{},keep:KEEP0(),lastCheckpoint:null});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL9[id]);C.lastCheckpoint=id;saveKeep();};
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why){C.marks.push([+C.t.toFixed(1),why]);if(C.marks.length>300)C.marks.shift();}};
 const mine=ph=>typeof ph==='string'&&/^a1-/.test(ph);
 const owns=mine;
 const handles=sec=>SECTIONS9.includes(sec)||!!ALIAS9[sec];
 function card(on,{title='Aftermath I',eyebrow='LAST LIGHT',sub=''}={}){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2'),s=el.querySelector?.('.card-sub');if(e)e.textContent=eyebrow;if(h)h.textContent=title;if(s)s.innerHTML=sub;el.classList.add('on');}else{el.classList.remove('on');const s=el.querySelector?.('.card-sub');if(s)s.innerHTML='';}C.cardOn=on;}
 // ---- lines: who says them -------------------------------------------------------------------------------------------------------
 const who=key=>key==='sam'?sam:null;
 const by=l=>{if(l.text===undefined&&!l.then&&!l.wait&&!l.until)l={...l,wait:.01};const from=l.by?who(l.by):l.from,act0=l.act;
  const act=(l.face||l.faces)?()=>{if(l.face&&from?.person?.face)from.person.face.set(l.face,{hold:Math.max(3,(l.time||2)+1.5)});if(l.faces)for(const [a,f] of l.faces)a?.person?.face?.set(f,{hold:5});act0?.();}:act0;
  if(l.text===undefined)return {...l,act};return {...l,from,act,time:l.time??Math.max(1.5,(typeof l.text==='function'?'a line of about this long':l.text).replace(/[“”]/g,'').length*.058)};};
 function say(lines,opts){talk(lines.map(by),opts);}
 const q2=t=>'“'+t+'”';
 const person=(name,a)=>(t,x={})=>({who:name,text:q2(t),from:a,...x});
 const SM=(t,x={})=>({who:'SAM',text:q2(t),by:'sam',...x}),Y=(t,x={})=>({who:'YOU',text:q2(t),...x}),N=(t,x={})=>({who:'',text:t,...x}),V=(name,t,x={})=>({who:name,text:q2(t),...x});
 const R=person('OFFICER REYES',reyes),JM=person('JAMIE’S MOM',jamieMom),AD=person('ALEX’S DAD',alexDad),AM=person('ALEX’S MOM',alexMom),SD=person('SAM’S DAD',samDad),SMO=person('SAM’S MOM',samMom),MO=person('MOM',mom),BR=person('MR. BRANDT',brandt);
 // ---- the task runner: each scene is a script (a generator) that waits on time, on lines and on what you do ------------------------
 function task(name,gen){C.tasks=C.tasks.filter(t=>t.name!==name);C.tasks.push({name,gen,started:C.t});}
 function stopTask(name){C.tasks=C.tasks.filter(t=>t.name!==name);}
 function* wait(s){let e=0;while(e<s){yield;e+=C.dt;}}
 function* until(fn,max=Infinity){let e=0;while(!fn()){if(e>=max)return false;yield;e+=C.dt;}return true;}
 function* lines(ls,opts){say(ls,opts);yield;while(busy())yield;}
 function* quiet(max=30){let e=0;while(busy()&&e<max){yield;e+=C.dt;}}
 // ---- what F does here: offers (a label at a place; tap or hold) ---------------------------------------------------------------------
 // offer(id, label, at, {r, look, size, cone, hold(seconds), fn, when, once, inPose, ride, tick, release})
 function offer(id,label,at,o2={}){C.offers.set(id,{id,label,at,r:2.2,once:true,...o2});}
 const unoffer=id=>{C.offers.delete(id);delete C.hold[id];if(C.holdOn===id)C.holdOn=null;};
 const V3=q=>q?(q.isVector3?q:new THREE.Vector3(q.x,q.y??gy(q.x,q.z)+1,q.z)):null;
 const atOf=q=>typeof q==='function'?q():q;
 const near=(q,r,p=me())=>{const w=atOf(q);return !!w&&Math.hypot(p.x-w.x,p.z-w.z)<r;};
 const lookingAt=(q,cos=.9)=>{const w=V3(atOf(q));return !!w&&k.camLooksAt(w,cos);};
 // ---- Sam: where he stands, how he follows ---------------------------------------------------------------------------------------------
 const SPOTS={};
 function joinFoot(c,q,a=0){if(!c)return;c.gone=false;comp.putFoot(c,q.x,q.z,a,{bike:null});c.person.group.visible=true;c.bike.group.visible=false;c.follow='walk';brain.enable(c,true);}
 function leave(c){if(!c)return;c.gone=true;c.person.group.visible=false;c.bike.group.visible=false;if(c.active)comp.release(c);c.brain=null;c.script=null;}
 function stand(c,q,{look=null,face=null,max=3.2,gesture=null}={}){if(!c||c.gone)return;SPOTS[c.key]=q?{q,look,face,max,gesture}:null;
  if(!q){if(c.script?.spot9){c.script=null;c.then=null;}if(c.mode==='foot')c.follow='walk';return;}
  if(c.mode!=='foot')return;comp.run(c,[comp.steps.toward(c,()=>{const s=SPOTS[c.key];if(!s)return null;const w=atOf(s.q);if(!w)return null;const lk=typeof s.look==='function'?s.look():s.look;
   return {x:w.x,z:w.z,look:lk,face:typeof s.face==='function'?s.face():s.face??undefined,max:s.max,gesture:s.gesture};})],{then:()=>{if(c.mode==='foot')c.follow='walk';}});c.script.spot9=true;}
 function walkTo(c,q,{speed=1.3,then=null}={}){if(!c||c.gone)return;const path=nav.walkPath({x:c.px,z:c.pz},q);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[q.x,q.z]],{speed})],{then:()=>{c.follow='walk';then?.(c);}});}
 function minds(mood='tense'){brain.reset();if(sam.active&&!sam.gone)brain.enable(sam,true);brain.setScene({mood,pois:[],goal:null});}
 // ---- poses: sitting down, a closer look ------------------------------------------------------------------------------------------------
 // pose(q, {y, yaw | look, pitch, slow, seat: {h, legs, hands} (your body sits there), stand (your body stays standing)})
 function pose(q,{y,pitch=0,yaw=null,look=null,slow=1.1,seat=null,stand=false}={}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);
  C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false,fx:p.x,fz:p.z,slow,stand};
  if(seat)C.pose.seat={x:q.x,z:q.z,y:seat.y??(y-1.0),a,h:seat.h??.43,legs:seat.legs||'bent',hands:seat.hands||'knees'};
  k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/(P2.slow||1.1));if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 function closeLook(target,{back=.62,eye=1.42,floor=null,kind=null,dur=null}={}){const p=me(),a=headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
  pose(q,{y:fy+eye,yaw:a,pitch:Math.atan2(target.y-(fy+eye),back),stand:true});C.view='look';C.lookKind=kind;C.lookAt=target;C.lookT=0;C.lookDur=dur;}
 function endLook(){if(C.view!=='look')return;C.view=null;C.lookKind=null;unpose();}
 function* looking(target,ls,{back=.62,eye=1.42,floor=null,kind='look',min=0}={}){closeLook(target,{back,eye,floor,kind});say(ls);let e=0;yield;while(busy()||e<min){yield;e+=C.dt;}endLook();}
 // a thing held up to look at (the mouse or A/D turns it); S or F puts it down
 const holder=new THREE.Group();holder.name='a1-held';
 function pageMesh(tex,{w=.2,h=.26,color=0xfbfaf4}={}){const m=new THREE.MeshBasicMaterial({map:tex||null,color:tex?0xffffff:color,side:THREE.DoubleSide});const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m));return g;}
 function inspect(obj,{dist=.4,ls=null,kind='thing',onClose=null,tilt=0}={}){if(C.view)return;camera.add(holder);holder.position.set(0,-.01,-dist);holder.rotation.set(0,0,0);holder.add(obj);obj.position.set(0,0,0);obj.rotation.set(tilt,0,0);
  C.view='inspect';C.inspect={obj,kind,onClose,yaw:0,pitch:tilt,t:0};o.roam.walkLock=true;C.lookKind=kind;if(ls)say(ls);mark('held: '+kind);}
 function endInspect(){const I=C.inspect;if(!I)return;holder.remove(I.obj);holder.removeFromParent();C.view=null;C.inspect=null;C.lookKind=null;if(!posed())o.roam.walkLock=false;I.onClose?.();}
 function* holding(obj,ls,{dist=.4,kind='thing',min=1.2,max=60,tilt=0}={}){inspect(obj,{dist,ls,kind,tilt});C.flags.putDown=false;let e=0;yield;while(C.view==='inspect'&&(busy()||e<min||!C.flags.putDown)&&e<max){yield;e+=C.dt;if(!busy()&&e>min+14)break;}if(C.view==='inspect')endInspect();C.flags.putDown=false;}
 // ---- choices: a few true things you could say (number keys). None of them changes what happened. ------------------------------------
 function choose(options,{then,timeout=40,fallback=null}){C.choice={options,then,t:0,timeout,fallback};}
 function pick(i){const ch=C.choice;if(!ch||!ch.options[i])return;C.choice=null;mark('chose: '+ch.options[i].id);ch.then(ch.options[i].id);}
 function* choosing(options,o2={}){let got=null;choose(options,{...o2,then:id=>{got=id;}});while(got===null){yield;if(C.choice&&o2.timeout&&C.choice.t>o2.timeout){const f=o2.fallback??options[options.length-1].id;C.choice=null;mark('chose (silence): '+f);got=f;}}return got;}
 // ---- the day and the hour, and the light ---------------------------------------------------------------------------------------------------
 const date=()=>o.setDate(`${C.day}, 2011 <i></i> ${fmt(C.h)}`);
 function setDay(day,h,skyName=null){C.day=day;C.h=h;C.minute=-1;if(skyName)C.sky=skyName;date();}
 function clock(dt){if(S.phase==='a1-black')return;C.h+=dt/240;const m=Math.floor(C.h*60+1e-6);if(m!==C.minute){C.minute=m;date();}}
 // (inside: 0 out of doors, 1 in a lit room: the sun and the sky's own light mostly shut out, the room's lamps doing the work)
 function sky(){const B=SKY9[C.sky]||SKY9.clear,K=C.skyK||{},i=C.inside||0;
  return {day:K.day??B.day,p:K.p??B.p,night:K.night??B.night,deep:B.deep||0,fill:lerp(B.fill||0,C.fill??.72,i),storm:(K.storm??B.storm)*(1-.5*i),flash:0,cave:(C.cave??.46)*i,apoc:(K.apoc??B.apoc)||0,apocDir:APOC_DIR};}
 const APOC_DIR=new THREE.Vector3(.4,.06,-.9).normalize();
 // the world as a day (sun and its shadows, no flashlight in your hand, the street lamps off) or an evening (lamps on)
 function dayWorld({evening=false}={}){document.body?.classList?.add('night1');nav.setTown(true);nav.setPine?.(true);A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);o.setFlashlight?.(false,false);
  ambient.night?.(evening);ambient.morning?.(!evening);S.flashOn=false;
  for(const a of EVERYONE){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  police.reset?.();k.carA.show(false);k.carB.show(false);if(ch2.flyers)ch2.flyers.visible=false;if(ch2.found)ch2.found.group.visible=false;if(ch2.tape)ch2.tape.visible=false;for(const b of ch2.beams||[])b.on=false;if(ch2.samBeam)ch2.samBeam.on=false;
  for(const kk of ['clue','glint','track','flies','torch'])if(k[kk])k[kk].visible=false;
  world.doors.alex?.set(0);world.doors.jamie?.set(0);world.alexWindow.emissiveIntensity=0;world.garages.sam?.set?.(0);world.garages.alex?.set?.(0);
  for(const f of o.friends?.list||[]){f.person.group.visible=false;f.bike.group.visible=false;}if(o.friends?.mom?.person)o.friends.mom.person.group.visible=false;
  leave(jamie);}
 // ---- what you carry (I) --------------------------------------------------------------------------------------------------------------------
 function items(){const K=C.keep,carry=[],found=[];
  if(K.cap==='you')carry.push({id:'cap',name:'Jamie’s cap',state:'Off the grass by the Hendersons’ garage. Blue. His.'});
  if(K.notebook==='you')carry.push({id:'notebook',name:'Sam’s notebook',state:'ALEX · JAMIE · SAM. Your writing.'});
  if(K.print)carry.push({id:'print',name:'A picture from Alex’s camera',state:'Sunday, at the oak. Four bikes.'});
  if(C.flags.gum)carry.push({id:'gum',name:'A pack of gum',state:'Spearmint. Sam’s.'});
  if(K.cap==='mom')found.push({id:'cap',name:'Jamie’s cap',note:'His mother has it.'});if(K.notebook==='sam')found.push({id:'notebook',name:'Sam’s notebook',note:'Sam has it. The names are in it.'});
  if(K.camera==='reyes'&&C.flags.cameraSeen)found.push({id:'camera',name:'Alex’s camera',note:'Reyes has it. He is copying the card.'});if(K.camera==='parents')found.push({id:'camera',name:'Alex’s camera',note:'With his mother and father.'});
  if(K.wrote)found.push({id:'list',name:'The county’s list',note:'The line that was empty says JAMIE now. You wrote it.'});
  return {carry,found};}
 const inv=createInventory({items,use:()=>{}});
 // ---- grief: what is left on the two of you ---------------------------------------------------------------------------------------------------
 // C.grief: how raw it is (1 the first morning; less as the weeks go, never nothing). Sam's face keeps a floor of it; his walk
 // slumps by it; you: a wave of it when a scene says (cry(k, seconds)): the breath, the view, the edges of things swimming.
 function applyGrief(){const g=C.grief||0;sam.person?.face?.grief?.(clamp(g*.9,0,1));jamie.person?.face?.grief?.(0);}
 function richFaces(on){for(const c of [jamie,sam])c.person?.face?.rich?.(on);}
 function cry(k2,sec=6){C.pCry=Math.max(C.pCry,k2);C.pCryT=Math.max(C.pCryT,sec);}
 function weep(c,expr='crying',sec=8){if(!c?.person?.face)return;c.person.face.set(expr,{hold:sec});}
 const feel=(a,expr,hold=5)=>{(a?.person?.face||FACES.get(a))?.set?.(expr,{hold});};
 const mood=(a,expr)=>{(a?.person?.face||FACES.get(a))?.mood?.(expr);};
 let tearsEl=null;
 function tearsOverlay(v){if(!tearsEl){try{tearsEl=document.getElementById('c8-tears');if(!tearsEl&&document.body){tearsEl=document.createElement('div');tearsEl.id='c8-tears';document.body.appendChild(tearsEl);}}catch{}}if(tearsEl?.style){tearsEl.style.opacity=v.toFixed(3);}}
 const headOf=a=>{const pr=a?.person;if(!pr)return null;const j=pr.joints?.head;if(j)return pr.group.localToWorld(j.clone());const g=pr.group.position;return new THREE.Vector3(g.x,g.y+1.5*(a.spec?.scale||1),g.z);};
 function updateGrief(dt){if(C.pCryT>0)C.pCryT-=dt;else C.pCry=Math.max(0,C.pCry-dt*.07);
  // (the sound of it, yours and theirs: seldom, never in step, quieter than Chapter Eight's; C.quietCry: none at all)
  if(C.pCry>.3&&!C.quietCry){C.sobNext.you=(C.sobNext.you??2)-dt;if(C.sobNext.you<=0){C.sobNext.you=C.pCry>.65?4+Math.random()*4:7+Math.random()*6;sound(C.pCry>.65?'c8Sob':'c8Breath2',camera.position,{gain:.3*C.pCry+.12});}}
  tearsOverlay(Math.min(.7,C.pCry*.8));
  if(C.quietCry)return;
  for(const a of [sam,...FACES.keys()]){const f=a?.person?.face;if(!f||!a.person.group.visible)continue;const sob=f.sobbing||0,cr=f.crying||0;if(sob>.4||cr>.75){const key=a.key||a.name||'x';C.sobNext[key]=(C.sobNext[key]??(1.5+Math.random()*3))-dt;
    if(C.sobNext[key]<=0){C.sobNext[key]=sob>.4?3+Math.random()*4:7+Math.random()*6;const hp=headOf(a);if(hp)sound(sob>.4?'c8Sob':'c8Sniff',hp,{gain:sob>.4?.55:.4});}}}}
 // ---- a safety net (as Chapter Eight's): standing somewhere that is not anywhere, after a moment the nearest place that is ---------------------
 function unstick(dt){const p=me();if(!p?.walking||C.pose||C.view||C.fadeOut>=0||S.phase==='a1-black'||o.roam.walkLock){C.stuckT=0;return;}
  if(nav.walkable(p.x,p.z,{r:.2})){C.stuckT=0;return;}C.stuckT=(C.stuckT||0)+dt;if(C.stuckT<.8)return;C.stuckT=0;
  for(let r=.35;r<=3.2;r+=.35)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;if(nav.walkable(x,z,{r:.3})){o.placePlayer({x,z,a:p.a,mode:'walk',bike:null});mark('unstuck');return;}}}
 // ---- the scenes are added by aftermath1-scenes.js, which shares all of this ----------------------------------------------------------------------
 const CTX={o,k,C,A9,S,ch2,ch3,ch4,ch5,ch6,ch7,ch8,STREET,phys,comp,brain,jamie,sam,
  cast:{reyes,officer,alexDad,alexMom,neighbor,samDad,samMom,jamieMom,brandt,fire,mrsH,mrH,lily,pruitt,davis,mom,vol,medic,extras},OWN,KIT,EVERYONE,FACES,
  sound,gy,light,LIGHTS,lightsOn,checkpoint,later,mark,card,say,SM,Y,N,V,R,JM,AD,AM,SD,SMO,MO,BR,person,task,stopTask,wait,until,lines,quiet,offer,unoffer,V3,atOf,near,lookingAt,
  pose,unpose,posed,closeLook,endLook,looking,inspect,endInspect,holding,pageMesh,holder,choose,choosing,me,go,objective,talk,busy,main,side,nav,camera,scene,world,
  stand,walkTo,joinFoot,leave,minds,date,setDay,fmt,dayWorld,inv,keep,saveKeep,cry,weep,feel,mood,applyGrief,headOf,SKY9,SAVE9};
 let SC=null;// (the scenes module, set by attach())
 // ---- prompts --------------------------------------------------------------------------------------------------------------------------------
 function spots(){const out=[];const pz=posed()&&![...C.offers.values()].some(f=>f.inPose);if(C.view||C.fadeOut>=0||pz||C.choice)return out;
  for(const f of C.offers.values()){if(f.when&&!f.when())continue;if(posed()&&!f.inPose)continue;const at=V3(atOf(f.at));if(!at)continue;const lb=f.hold?(f.label+(C.hold[f.id]>0?` (${Math.round(C.hold[f.id]*100)}%)`:'')):f.label;
   out.push({id:f.id,label:lb,at,face:at,r:f.r,wide:true,ride:!!f.ride,...(f.look?{look:true,size:f.size??.3,cone:f.cone??.14}:{})});}return out;}
 function act(id){const f=C.offers.get(id);if(!f)return;if(f.hold){C.holdOn=id;return;}if(f.once)C.offers.delete(id);C.flags[id]=true;f.fn?.();mark('F: '+id);}
 function updateHolds(dt){const id=C.holdOn;if(!id)return;const f=C.offers.get(id);const heldF=o.held?.('KeyF');if(!f||!heldF){C.holdOn=null;f?.release?.();return;}
  const p=me(),w=V3(atOf(f.at));if(w&&!posed()&&Math.hypot(p.x-w.x,p.z-w.z)>f.r+.6){C.holdOn=null;return;}
  const v=(C.hold[id]||0)+dt/f.hold;C.hold[id]=Math.min(1,v);f.tick?.(dt,C.hold[id]);
  if(C.hold[id]>=1){C.offers.delete(id);C.holdOn=null;C.flags[id]=true;f.fn?.();mark('held: '+id);}}
 function key(code,repeat){if(!mine(S.phase))return false;
  if((code==='KeyI'||code==='Tab')&&!inv.isOpen&&(C.view||C.fadeOut>=0||S.phase==='a1-black'||C.choice))return true;if(inv.key(code,repeat))return true;
  if(C.choice){const m=/^(Digit|Numpad)([1-4])$/.exec(code);if(m){if(!repeat)pick(+m[2]-1);return true;}return ['KeyF','KeyW','KeyA','KeyS','KeyD','Space'].includes(code);}
  if(C.view==='inspect'){if((code==='KeyS'||code==='ArrowDown'||code==='KeyF')&&!repeat&&C.inspect?.t>.4&&!busy()){C.flags.putDown=true;endInspect();return true;}if(code==='KeyA'){C.inspect.yaw-=.25;return true;}if(code==='KeyD'){C.inspect.yaw+=.25;return true;}return ['KeyW','Space','KeyC','KeyS','KeyF'].includes(code);}
  if(C.view==='look'){if((code==='KeyS'||code==='ArrowDown')&&!busy()&&!C.lockLook){if(!repeat){endLook();C.flags.lookEnded=true;}return true;}return ['KeyW','KeyA','KeyD','Space','KeyC','KeyS'].includes(code);}
  if(SC?.key?.(code,repeat))return true;
  if(code==='KeyT')return true;// (no flashlight here)
  return false;}
 function pan(dx,dy){if(!mine(S.phase))return false;if(C.view==='inspect'){C.inspect.yaw+=dx*.006;C.inspect.pitch=clamp(C.inspect.pitch+dy*.006,-1.2,1.2);return true;}return !!SC?.pan?.(dx,dy);}
 function wheel(dy){if(!mine(S.phase))return false;return !!SC?.wheel?.(dy);}
 function hint(){if(C.choice)return C.choice.options.map((op,i)=>[String(i+1),op.label]);
  if(C.view==='inspect')return [['Mouse / A D','Turn it'],['S','Put it down']];if(C.view==='look'&&!C.lockLook)return [['S','Step back']];
  const h=SC?.hint?.();if(h)return h;
  if(C.holdOn&&C.offers.get(C.holdOn))return [['Hold F',C.offers.get(C.holdOn).label+' '+Math.round((C.hold[C.holdOn]||0)*100)+'%']];return null;}
 function sources(out){if(!mine(S.phase))return;SC?.sources?.(out);}
 function blockers(){const out=[];for(const a of OWN)if(a.visible&&!a.noBlock)out.push({x:a.x,z:a.z,r:.34,speed:0});SC?.blockers?.(out);return out;}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------
 function update(dt){C.dt=dt;C.t+=dt;C.pt+=dt;
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  for(const t of C.tasks.slice()){let r;try{r=t.gen.next(dt);}catch(e){mark('task '+t.name+' threw: '+(e&&e.message));console.error?.(e);r={done:true};}if(r.done)C.tasks=C.tasks.filter(x=>x!==t);}
  if(C.cardT>=0){C.cardT+=dt;if(C.cardT>.8&&!C.cardOn)card(true,{sub:'WHAT WAS LEFT<br>SATURDAY, AUGUST 27, 2011'});if(C.cardT>5.6){card(false);C.cardT=-1;}}
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/(C.fadeInDur||2.2)));if(C.fadeIn>(C.fadeInDur||2.2)){C.fadeIn=-1;C.fadeInDur=null;o.fade(0);}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/(C.fadeOutDur||1.6)));if(C.fadeOut>(C.fadeOutDur||1.6)+.2){C.fadeOut=-1;C.fadeOutDur=null;const f=C.after;C.after=null;f?.();}}
  if(C.choice){C.choice.t+=dt;}
  updatePose(dt);if(C.view==='inspect'&&C.inspect){C.inspect.t+=dt;C.inspect.obj.rotation.set(C.inspect.pitch,C.inspect.yaw,0);}
  if(C.view==='look'&&C.lookDur){C.lookT+=dt;if(C.lookT>C.lookDur&&!busy())endLook();}
  updateHolds(dt);clock(dt);updateGrief(dt);unstick(dt);inv.update();
  C.inside=damp(C.inside||0,C.insideWant||0,2.2,dt);
  for(const a of OWN)if(a.visible)a.update(dt,{eye:camera.position});
  SC?.update?.(dt);
  for(const l of LIGHTS){const f=l.userData.flicker;if(f&&l.userData.base)l.intensity=l.userData.base*(1-f*.5+f*.5*Math.sin(C.t*23+l.id)*Math.sin(C.t*7.1+l.id*2));}
  const L9=sky();A.day=L9.day;A.night=L9.night;ch2.day=A.day;A.shade=0;A.barLight=false;}
 const _gp=newPose();
 function afterActors9(dt){if(!owns(S.phase))return;if(k.torchO)k.torchO.visible=false;
  for(const a of EVERYONE){if(!a.visible)continue;applyPose(a.person,a.pose);FACES.get(a)?.update(dt,{clock:C.t});}
  SC?.afterActors?.(dt);
  // Sam, when nothing else is posing him: what it has left in how he stands and walks, and on the bike
  {const c=sam,g=C.grief||0;if(g>.05&&!c.gone&&c.person.group.visible&&!c.script&&c.posedAt!==C.t){
    if(c.mode==='foot'){copyPose(_gp,c.pose);_gp[PI.root+1]-=.03*g;_gp[PI.lean]+=.13*g;_gp[PI.hp]-=.3*g;_gp[PI.lh+1]-=.03*g;_gp[PI.rh+1]-=.03*g;applyPose(c.person,_gp);}
    else if(c.mode==='ride'){copyPose(_gp,c.pose);const sob=c.person.face?.pulse||0;_gp[PI.hp]-=(.3+.05*Math.sin(C.t*.4))*g+sob*.05;_gp[PI.lean]+=.06*g;applyPose(c.person,_gp);}}}
  phys?.sync?.();
  if(C.pCry>.05){const k2=C.pCry,b=Math.sin(C.t*1.5)*.008*k2+Math.sin(C.t*29)*.0014*k2;camera.position.y+=b-.015*k2;camera.position.x+=Math.sin(C.t*21)*.0012*k2;}}
 {const prev=A.afterActors6;A.afterActors6=(dt,o2)=>{prev?.(dt,o2);afterActors9(dt,o2);};}
 // ---- lifecycle -----------------------------------------------------------------------------------------------------------------------------
 function reset(){o.bikeAway?.(false);if(!C.offers||!C.flags||!C.keep)fresh();const hadPose=C.pose,hadView=!!C.view;card(false);if(C.view==='inspect')endInspect();if(C.view==='look')C.view=null;inv.reset();C.choice=null;
  SC?.reset?.();for(const key of Object.keys(SPOTS))SPOTS[key]=null;lightsOn(false);
  for(const a of OWN){a.show(false);a.lookAt=null;a.gest?.(null);a.path=null;a.mode='stand';a.noBlock=false;}
  if(A9.started){facesOn(false);richFaces(false);for(const c of [jamie,sam]){c.person?.face?.grief?.(0);c.person?.face?.mood?.('neutral');c.gone=false;c.crouch=0;c.boost=1;}sam.person.group.visible=true;
   ch5.presentation?.(false);phys?.reset?.();if(o.foot.arms===phys?.arms)o.foot.arms=null;o.hideWorld?.(false);}
  tearsOverlay(0);A.rideBoost=1;A.rideFov=0;o.setPace?.(1);o.roam.brake=0;holder.removeFromParent();
  A9.started=false;A9.finished=false;
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView)o.roam.walkLock=false;fresh();}
 // (the friends' faces and the first-person body are Chapter Five's shared presentation, switched on here as Six to Eight do;
 //  your hands (physical.js) too, for what you hold and hand over)
 function setup(){A9.started=true;ch5.presentation?.(true);if(phys)o.foot.arms=phys.arms;richFaces(true);facesOn(true);applyGrief();}
 // From Chapter Eight's end card: what was carried out of that night is read from what it saved.
 function begin(){fresh();const c8=carried8();if(c8){if(c8.notebook==='you')C.keep.notebook='you';C.flags.gum=c8.gum!=='none';}else C.flags.gum=true;saveKeep();setup();SC.begin();}
 function jump(section){jumpTo(section);}
 // (a jump from Continue keeps what you chose; a DEV start does not: it starts every scene the same way)
 let devFresh=false,devOver=null;
 function jumpTo(section){section=ALIAS9[section]||section;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();
  const K=devFresh?null:loadKeep();if(K)C.keep=K;else if(devOver)Object.assign(C.keep,devOver);C.fromSave=!!K;devFresh=false;devOver=null;C.flags.gum=true;setup();C.jumped=section;SC.jump(section);richFaces(true);applyGrief();}
 // ---- the end card -------------------------------------------------------------------------------------------------------------------------------
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Aftermath I';if(pp)pp.innerHTML='WHAT WAS LEFT<br>October, 2011.';}
  const nb=$('next-chapter');if(nb){nb.hidden=!A9.next;}A9.finished=true;C.keep.left=true;
  try{localStorage.setItem(SAVE9,JSON.stringify({...C.keep,section:'aftermath1-end',home:['YOU','SAM'],lost:['JAMIE','ALEX'],presence:'sealed',you:'moved away, October 2011',sam:'Oak Hollow',at:Date.now()}));}catch{}
  o.finish();}
 Object.assign(CTX,{end,jumpTo,reset,fresh,SPOTS,items,sky});
 // ---- the api --------------------------------------------------------------------------------------------------------------------------------------
 function attach(mod){SC=mod(CTX);A9.SC=SC;}
 Object.assign(A9,{SECTIONS:SECTIONS9,ALIAS:ALIAS9,LABEL:LABEL9,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,attach,
  jamieSweep:()=>null,officerAim:()=>null,light:()=>owns(S.phase)?sky():null,longThrow:()=>null,
  canDismount:()=>!posed()&&!C.view&&S.phase!=='a1-black'&&!!SC?.canDismount?.(),canRemount:()=>!C.view&&!posed()&&!!SC?.canRemount?.(),
  closeBag:()=>{if(inv.isOpen){inv.close();return true;}return false;},inventoryReady:()=>owns(S.phase)&&S.phase!=='a1-black'&&S.phase!=='a1-end',
  devFresh:(over=null)=>{devFresh=true;devOver=over;},loadKeep,saveKeep,keep,C,LIGHTS,inv,sky,brain,CTX,FACES,cast:CTX.cast,get started(){return A9._started;},set started(v){A9._started=v;}});
 Object.defineProperties(A9,{amb:{get:()=>C.amb},viewing:{get:()=>C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,day:C.day,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,lookKind:C.lookKind,keep:JSON.parse(JSON.stringify(C.keep)),offers:[...C.offers.keys()],hold:{...C.hold},
   choice:C.choice?C.choice.options.map(q=>q.id):null,where:C.where,sky:C.sky,inside:+(C.inside||0).toFixed(2),grief:C.grief,pCry:+C.pCry.toFixed(2),tasks:C.tasks.map(t=>t.name),posed:posed(),
   you:{x:+p.x.toFixed(2),z:+p.z.toFixed(2),walking:!!p.walking,riding:!!p.riding},
   sam:{gone:!!sam.gone,active:sam.active,visible:sam.person.group.visible,mode:sam.mode,face:sam.person.face?.expression||null,x:+(sam.mode==='foot'?sam.px:sam.bx).toFixed(2),z:+(sam.mode==='foot'?sam.pz:sam.bz).toFixed(2)},
   jamie:{visible:jamie.person.group.visible,active:jamie.active},people:Object.fromEntries(Object.entries(CTX.cast).filter(([,a])=>a&&!Array.isArray(a)&&a.visible!==undefined).map(([kk,a])=>[kk,{visible:!!a.visible,x:+a.x.toFixed(1),z:+a.z.toFixed(1),face:FACES.get(a)?.expression||null}])),
   sounds:{...C.sounds},marks:C.marks.slice(-40),endT:+C.endT.toFixed(2)};}}});
 return A9;
}
