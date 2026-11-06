// Chapter Eight: The Night Oak Hollow Fell. Friday night, August 26, 2011, to Saturday morning, August 27.
//
//  I.   No one left. Sam's house after the names: four bikes under the streetlight that cannot be there; a Line Four cover
//       in the road, shifted, breathing; Sam's torn-out page; Reyes, and his empty trunk. "They're underneath us." The field
//       past the oak with Brandt: the 1959 plan over the 2009 map, the probe, the turf, the vent, the lift: MH-12. Down.
//       The access chamber, the Line Four connector, something coming along it, and the crank gate that stops it.
//  II.  Below Oak Hollow. The construction gallery (1958): the hunter searching it; Reyes leads it off. The site office:
//       Mason's receipt, a girl's registration card, ANNIE ROWAN, 0417 (A.R.). The review room: the 1958 film of a child
//       carried out of a chamber, and the wall that moves until she is carried back. The service corridor: Danny
//       Whitcomb's bike and flyer, and then the thing from the drain, with his hand; his name; and something coming that
//       it is more afraid of than of anything.
//  III. Bring them home. Sam, in the flooded wing (what is new can't be copied); the drain valve, the seized door, the hunter
//       coming back. Ruth Ann Carver's cell, and how it ended for her. The retrieval wing: it brings Jamie back to his cell;
//       Sam holds the grille; Jamie's door. The corridor that does not stay the same, Alex's room made down here coming apart,
//       Alex, who has seen them come for him before, and two levers. The crew room: all four of them.
//  IV.  The last lock. Reyes, alive. The anchor board: what the chambers were for. The plug, the barrier, and what comes
//       through it. The way out, coming apart behind them.
//  V.   Oak Hollow falls. The street from the oak: the road gone into the storm line, the Hendersons' house, the gas fire,
//       the pole, Summerfield going down. The Hendersons: the jack, the door, Mr. Henderson in the garage; Jamie holding the
//       door up; it comes out of the hole; Jamie. The works: the emergency drawdown nobody would use while anyone was in
//       there. The gates; the drain gate in the gallery; the ports; Line Two; the plug. Alex holds the hatch. The oak. Alex.
//       The last ride, two bikes, down the street the four of them rode on Sunday. Nobody behind them.
//
// chapter7.js hands this file every phase that starts c8-, d8-, e8-, f8-, g8- or n8-. Places: chapter8-complex.js (the works
// under the court), chapter8-ruin.js (the street), chapter6-works.js (Gate Structure No. 2, reused); the thing:
// chapter8-presence.js; the hunter: chapter7's model adapter and AI (a fresh instance); the drain creature: chapter3's.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {P as PI,newPose,standPose,sitPose,applyPose,blendPose,copyPose} from './rig.js';
import {createCompanionBrain} from './companion-brain.js';
import {createInventory} from './inventory.js';
import {LOOKOUT} from './layout.js';
import {createComplex,CX,W8} from './chapter8-complex.js';
import {createPresence} from './chapter8-presence.js';
import {createRuin,cutWorld} from './chapter8-ruin.js';
import {createHunterModel} from './chapter7-creature.js';
import {createHunterAI} from './chapter7-hunter.js';
import {paper8,PAGES8} from './chapter8-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// QA jumps and DEV scenes, in story order (each starts a little before its moment)
export const SECTIONS8=['chapter8-start','c8-bikes','c8-cover','c8-reyes','c8-field','c8-probe','c8-lift','c8-shaft','c8-barrier',
 'c8-gallery','c8-stealth','c8-office','c8-film','c8-corridor','c8-danny','c8-bulkhead',
 'c8-wing','c8-ruth','c8-sam','c8-sam-door','c8-retrieval','c8-jamie','c8-jamie-door','c8-shift','c8-made','c8-alex','c8-alex-free',
 'c8-reunion','c8-alarm','c8-truth','c8-breach','c8-escape','c8-ladder',
 'c8-surface','c8-street','c8-hendersons','c8-garage','c8-jamie-death','c8-staging','c8-gates','c8-ports','c8-line-two','c8-plug','c8-hatch',
 'c8-oak','c8-alex-death','c8-ride','c8-look-back','chapter8-end'];
export const ALIAS8={'c8-start':'chapter8-start','c8-four-bikes':'c8-bikes','c8-missing-junction':'c8-field','c8-mh12':'c8-lift','c8-outer-barrier':'c8-barrier','c8-construction-gallery':'c8-gallery',
 'c8-annie':'c8-office','c8-annie-rowan':'c8-office','c8-0417':'c8-office','c8-observation-film':'c8-film','c8-whitcomb':'c8-danny','c8-smiling-creature':'c8-danny','c8-flooded-wing':'c8-wing',
 'c8-ruth-ann':'c8-ruth','c8-rescue-sam':'c8-sam','c8-rescue-jamie':'c8-jamie','c8-rescue-alex':'c8-alex','c8-reconstruction':'c8-made','c8-four':'c8-reunion','c8-revelation':'c8-truth','c8-anchor-board':'c8-truth',
 'c8-presence':'c8-breach','c8-catastrophe':'c8-surface','c8-ruins':'c8-street','c8-jamie-dies':'c8-jamie-death','c8-drawdown':'c8-staging','c8-final-operation':'c8-gates','c8-outer-routes':'c8-gates',
 'c8-redirect':'c8-ports','c8-drop-plug':'c8-plug','c8-alex-dies':'c8-alex-death','c8-last-ride':'c8-ride','c8-end':'chapter8-end'};
// Checkpoints (silent; Continue on the title comes back here). A failure comes back to the checkpoint of where it happened.
export const LABEL8={'chapter8-start':'Four bikes','c8-field':'The missing junction','c8-shaft':'MH-12','c8-gallery':'The construction gallery','c8-stealth':'Something is searching',
 'c8-corridor':'The service corridor','c8-wing':'The flooded wing','c8-sam-door':'Sam’s door','c8-retrieval':'The retrieval wing','c8-jamie-door':'Jamie’s door','c8-shift':'The corridor that moves',
 'c8-alex':'Alex','c8-reunion':'All four of them','c8-truth':'The anchor board','c8-escape':'The way out','c8-surface':'Oak Hollow','c8-hendersons':'The Hendersons’','c8-staging':'The works',
 'c8-gates':'The outer routes','c8-ports':'The drawdown','c8-plug':'The plug','c8-oak':'The oak','c8-ride':'The last ride','chapter8-end':'The night Oak Hollow fell'};
const PHASES=['c8-black','d8-bikes','d8-field','d8-shaft','e8-gallery','e8-danny','e8-sam','e8-jamie','e8-alex','e8-reunion','f8-truth','f8-breach','g8-surface','g8-street','g8-staging','n8-op','n8-oak','n8-ride','n8-end'];
// (the clock: Friday 10:42 PM at Sam's; past midnight under the court; before five on the street; dawn at the oak)
const HOUR={start:22.7,field:23.25,shaft:23.6,gallery:23.9,corridor:24.35,wing:24.7,retrieval:25.1,alex:25.5,reunion:25.9,truth:26.2,breach:26.35,surface:28.75,street:28.95,staging:29.4,op:29.6,line2:29.95,oak:30.3,ride:30.45};
const fmt=h=>{const hh=((h%24)+24)%24,H=Math.floor(hh),M=Math.floor((hh-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};
export const SAVE8='lastlight.chapter8';// what the aftermath will find: who came home

export function createChapter8(o,k,{chapter2:ch2,chapter3:ch3,chapter4:ch4,chapter5:ch5,chapter6:ch6,chapter7:ch7}){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam}=k,A=k.api,T=o.tension,police=k.police;
 const me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,main=k.main;
 // (a scene's own clock starts at its phase: every scene's fallback timings are counted from when it began)
 const go=ph=>{k.go(ph);C.pt=0;};
 const reyes=k.officer2,officer=k.officer,phys=ch5.phys;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL8);
 const A8={},C={};
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos||camera.position,opts);}
 const gy=(x,z)=>nav.groundY(x,z);
 // ---- places, people, the things ---------------------------------------------------------------------------------------------
 const X=createComplex({scene,sfx:(n,p,op)=>sound(n,p,op)});
 const presence=createPresence({scene,sfx:(n,p,op)=>sound(n,p,op),floorAt:(x,z)=>X.nav.inside(x,z)?X.nav.floorAt(x,z):gy(x,z)});
 const ruin=createRuin({scene,world,nav,sfx:(n,p,op)=>sound(n,p,op)});
 const works=ch6.works,WS=ch6.WS||{},WP=ch6.WP||((x,z,y)=>{const w=works.local(x,z);return {x:w.x,z:w.z,y:y??gy(w.x,w.z)};});
 const HM=createHunterModel({scene});HM.root.name='chapter8-hunter';
 const hunterNav={walkable:(x,z,r)=>nav.walkable(x,z,{r}),floorAt:(x,z)=>nav.groundY(x,z)};
 const sightClear=(ax,ay,az,bx,by,bz)=>X.nav.inside(ax,az)&&X.nav.inside(bx,bz)?X.sight(ax,ay,az,bx,by,bz):true;
 const H=createHunterAI({model:HM,nav:hunterNav,sightClear,sfx:(n,p,op)=>sound(n,p,op),mark:w=>mark(w)});
 const danny=ch3.creature;// (the same thing as in the drain, the downtown street and the camp)
 const brandt=ch6.cast?.brandt,fire=ch6.cast?.fire||[];
 const samDad=ch6.cast?.samDad,samMom=ch4.samMom;
 const brain=createCompanionBrain({nav,comp});
 const B7=ch7.cast?.studio||{};// the four bikes (Chapter Seven's studio bikes: Alex's, Jamie's, Sam's, yours)
 let alex=null;// (enlisted from comp when he is freed; dismissed when the chapter resets)
 // ---- lights the chapter brings (the same six, moved; no shader changes mid-scene) ---------------------------------------------
 const LIGHTS=[0,1,2,3,4,5].map(i=>{const l=new THREE.PointLight(0xffd6a0,0,10,1.8);l.name='c8-light-'+i;l.userData.detection={intensity:0,position:new THREE.Vector3()};return l;});
 function lightsOn(on){for(const l of LIGHTS){if(on&&!l.parent)scene.add(l);else if(!on&&l.parent)l.removeFromParent();if(!on)l.intensity=l.userData.detection.intensity=0;}}
 function light(i,q,{intensity=3,dist=10,color=0xffd6a0,flicker=0}={}){const l=LIGHTS[i];if(!q){l.intensity=0;l.userData.detection.intensity=0;l.userData.base=0;return;}l.position.set(q.x,q.y,q.z);l.intensity=intensity;l.distance=dist;l.color.setHex(color);l.userData.base=intensity;l.userData.flicker=flicker;l.userData.detection.intensity=intensity;l.userData.detection.position.set(q.x,q.y,q.z);}
 // ---- state ----------------------------------------------------------------------------------------------------------------------
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,dt:0,h:HOUR.start,flags:{},timers:[],tasks:[],offers:new Map(),hold:{},cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,view:null,lookKind:null,minute:-1,
  sounds:{},amb:{traffic:0,insects:.25,wind:.35,life:0,forest:0,tunnel:0,water:0},inv:{notebook:'have',gum:'have',camera:'have',flashlight:'have',sheet:null,radio:null,receipt:null,flyer:null},seen:new Set(),looked:new Set(),choice:null,
  fails:{},shake:0,marks:[],where:'sams',zone:null,sc:null,hunt:null,haz:[],stage:{}});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL8[id]);C.lastCheckpoint=id;};
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why){T?.note?.(why);C.marks.push([+C.t.toFixed(1),why]);if(C.marks.length>240)C.marks.shift();}};
 const mine=ph=>typeof ph==='string'&&/^(c8|d8|e8|f8|g8|n8)-/.test(ph);
 const owns=mine;
 const handles=sec=>SECTIONS8.includes(sec)||!!ALIAS8[sec];
 function card(on,{title='Chapter Eight',eyebrow='LAST LIGHT',sub=''}={}){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2'),s=el.querySelector?.('.card-sub');if(e)e.textContent=eyebrow;if(h)h.textContent=title;if(s)s.innerHTML=sub;el.classList.add('on');}else{el.classList.remove('on');const s=el.querySelector?.('.card-sub');if(s)s.innerHTML='';}C.cardOn=on;}
 // ---- lines: who says them (a friend's face, a grown-up's mouth) -----------------------------------------------------------------
 const who=key=>key==='jamie'?jamie:key==='sam'?sam:key==='alex'?alex:null;
 const by=l=>{if(l.text===undefined&&!l.then&&!l.wait&&!l.until)l={...l,wait:.01};const from=l.by?who(l.by):l.from,act0=l.act;
  const act=(l.face||l.faces)?()=>{if(l.face&&from?.person?.face)from.person.face.set(l.face,{hold:Math.max(3,(l.time||2)+1.5)});if(l.faces)for(const [kk,f] of Object.entries(l.faces)){const c=who(kk);c?.person?.face?.set(f,{hold:4});}act0?.();}:act0;
  if(l.text===undefined)return {...l,act};return {...l,from,act,time:l.time??Math.max(1.4,(typeof l.text==='function'?'a line of about this long':l.text).replace(/[“”]/g,'').length*.056)};};
 function say(lines,opts){talk(lines.map(by),opts);}
 const q2=t=>'“'+t+'”';
 const J=(t,x={})=>({who:'JAMIE',text:q2(t),by:'jamie',...x}),SM=(t,x={})=>({who:'SAM',text:q2(t),by:'sam',...x}),AL=(t,x={})=>({who:'ALEX',text:q2(t),by:'alex',...x});
 const R=(t,x={})=>({who:'OFFICER REYES',text:q2(t),from:reyes,...x}),RR=(t,x={})=>({who:'REYES (RADIO)',text:q2(t),...x}),BR=(t,x={})=>({who:'MR. BRANDT',text:q2(t),from:brandt,...x}),BRR=(t,x={})=>({who:'BRANDT (RADIO)',text:q2(t),...x});
 const Y=(t,x={})=>({who:'YOU',text:q2(t),...x}),N=(t,x={})=>({who:'',text:t,...x}),V=(name,t,x={})=>({who:name,text:q2(t),...x});
 // ---- the task runner: each scene is a script (a generator) that waits on time, on lines and on what you do -----------------------
 function task(name,gen){C.tasks=C.tasks.filter(t=>t.name!==name);C.tasks.push({name,gen,started:C.t});}
 function stopTask(name){C.tasks=C.tasks.filter(t=>t.name!==name);}
 function* wait(s){let e=0;while(e<s){yield;e+=C.dt;}}
 function* until(fn,max=Infinity){let e=0;while(!fn()){if(e>=max)return false;yield;e+=C.dt;}return true;}
 function* lines(ls,opts){say(ls,opts);yield;while(busy())yield;}
 function* quiet(max=30){let e=0;while(busy()&&e<max){yield;e+=C.dt;}}
 // ---- what F does here: offers (a label at a place; tap or hold) ---------------------------------------------------------------------
 // offer(id, label, at, {r, look, size, cone, hold(seconds), fn, when, once, near})
 function offer(id,label,at,o2={}){C.offers.set(id,{id,label,at,r:2.2,once:true,...o2});}
 const unoffer=id=>{C.offers.delete(id);delete C.hold[id];};
 const V3=q=>q?(q.isVector3?q:new THREE.Vector3(q.x,q.y??gy(q.x,q.z)+1,q.z)):null;
 const atOf=q=>typeof q==='function'?q():q;
 // ---- the friends: where they stand, who follows, who is gone --------------------------------------------------------------------
 const friendsNow=()=>[jamie,sam,alex].filter(c=>c&&c.active&&!c.gone);
 function minds(){brain.reset();for(const c of friendsNow())brain.enable(c,true);C.mindKey=null;}
 function moodFor(ph){if(/^d8-(bikes|field)$/.test(ph))return 'tense';if(/^(e8|f8-truth)/.test(ph))return 'danger';if(/^(f8-breach|g8-street)$/.test(ph))return 'escape';if(/^g8-surface$/.test(ph))return 'escape';if(/^n8-op$/.test(ph))return 'danger';return 'tense';}
 function mind(){const ph=S.phase,key=ph+(C.mood||'');if(C.mindKey===key)return;C.mindKey=key;brain.setScene({mood:C.mood||moodFor(ph),pois:[],goal:null});}
 function joinFoot(c,q,a=0){if(!c)return;c.gone=false;comp.putFoot(c,q.x,q.z,a,{bike:null});c.person.group.visible=true;c.bike.group.visible=false;c.follow='walk';brain.enable(c,true);}
 function leave(c){if(!c)return;c.gone=true;c.person.group.visible=false;c.bike.group.visible=false;if(c.active)comp.release(c);c.brain=null;c.script=null;}
 // stand somewhere (a function or a point), looking somewhere; null: back to following
 const SPOTS={};
 function stand(c,q,{look=null,face=null,max=3.2,gesture=null}={}){if(!c||c.gone)return;SPOTS[c.key]=q?{q,look,face,max,gesture}:null;
  if(!q){if(c.script?.spot8){c.script=null;c.then=null;}if(c.mode==='foot')c.follow='walk';return;}
  if(c.mode!=='foot')return;comp.run(c,[comp.steps.toward(c,()=>{const s=SPOTS[c.key];if(!s)return null;const w=atOf(s.q);if(!w)return null;const lk=typeof s.look==='function'?s.look():s.look;
   return {x:w.x,z:w.z,look:lk,face:typeof s.face==='function'?s.face():s.face??undefined,max:s.max,gesture:s.gesture};})],{then:()=>{if(c.mode==='foot')c.follow='walk';}});c.script.spot8=true;}
 function walkTo(c,q,{speed=1.4,then=null}={}){if(!c||c.gone)return;const path=nav.walkPath({x:c.px,z:c.pz},q);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[q.x,q.z]],{speed})],{then:()=>{c.follow='walk';then?.(c);}});}
 const near=(q,r,p=me())=>{const w=atOf(q);return !!w&&Math.hypot(p.x-w.x,p.z-w.z)<r;};
 const lookingAt=(q,cos=.9)=>{const w=V3(atOf(q));return !!w&&k.camLooksAt(w,cos);};
 // ---- poses: a closer look; your hands on something ----------------------------------------------------------------------------------
 function pose(q,{y,pitch=0,yaw=null,look=null,slow=1.1}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false,fx:p.x,fz:p.z,slow};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/(P2.slow||1.1));if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 function closeLook(target,{back=.62,eye=1.42,floor=null,kind=null,dur=null}={}){const p=me(),a=headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
  pose(q,{y:fy+eye,yaw:a,pitch:Math.atan2(target.y-(fy+eye),back)});C.view='look';C.lookKind=kind;C.lookAt=target;C.lookT=0;C.lookDur=dur;}
 function endLook(){if(C.view!=='look')return;C.view=null;C.lookKind=null;unpose();}
 function* looking(target,ls,{back=.62,eye=1.42,floor=null,kind='look',min=0}={}){closeLook(target,{back,eye,floor,kind});say(ls);let e=0;yield;while(busy()||e<min){yield;e+=C.dt;}endLook();}
 // holding a page up to read (the mouse or A/D turns it); S puts it down
 const holder=new THREE.Group();holder.name='c8-held';
 function pageMesh(tex,{w=.2,h=.26,color=0xfbfaf4}={}){const m=new THREE.MeshBasicMaterial({map:tex,color:tex?0xffffff:color,side:THREE.DoubleSide});const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m));return g;}
 function inspect(obj,{dist=.4,ls=null,kind='thing',onClose=null}={}){if(C.view)return;camera.add(holder);holder.position.set(0,-.01,-dist);holder.rotation.set(0,0,0);holder.add(obj);obj.position.set(0,0,0);obj.rotation.set(0,0,0);
  C.view='inspect';C.inspect={obj,kind,onClose,yaw:0,pitch:0,t:0};o.roam.walkLock=true;C.lookKind=kind;if(ls)say(ls);mark('held: '+kind);}
 function endInspect(){const I=C.inspect;if(!I)return;holder.remove(I.obj);holder.removeFromParent();C.view=null;C.inspect=null;C.lookKind=null;if(!posed())o.roam.walkLock=false;I.onClose?.();}
 function* reading(kind,ls,{w=.2,h=.26,min=1.2}={}){const tex=paper8(kind);inspect(pageMesh(tex,{w,h}),{kind,ls});C.flags['read-'+kind]=true;let e=0;yield;while((C.view==='inspect'&&(busy()||e<min||!C.flags.putDown))&&e<90){yield;e+=C.dt;if(!busy()&&e>min+12)break;}if(C.view==='inspect')endInspect();C.flags.putDown=false;}
 // ---- choices: things you could say (number keys) -------------------------------------------------------------------------------------
 function choose(options,{then,timeout=40,fallback=null}){C.choice={options,then,t:0,timeout,fallback};}
 function pick(i){const ch=C.choice;if(!ch||!ch.options[i])return;C.choice=null;mark('chose: '+ch.options[i].id);ch.then(ch.options[i].id);}
 function* choosing(options,o2={}){let got=null;choose(options,{...o2,then:id=>{got=id;}});while(got===null){yield;if(C.choice&&o2.timeout&&C.choice.t>o2.timeout){const f=o2.fallback??options[0].id;C.choice=null;got=f;}}return got;}
 // ---- failing: caught, crushed, fallen: back to the checkpoint of the place it happened ------------------------------------------------
 function fail(section,why){if(C.failing)return;if(globalThis.process?.env?.DEBUG8){const p=me();console.log('  [fail]',section,why,'at',(p.x-CX.x).toFixed(1),(p.z-CX.z).toFixed(1),'hunter',(HM.x-CX.x).toFixed(1),(HM.z-CX.z).toFixed(1),H.mode,'hiding',C.hiding,C.marks.slice(-5).map(m=>m[1]).join(' | '));}C.failing={section,why,t:0};C.fails[section]=(C.fails[section]||0)+1;mark('FAIL '+why);T?.jolt?.(1,{rise:1,hold:3,why});sound('c7Strike',camera.position,{gain:1});C.shake=.6;}
 function updateFail(dt){const F=C.failing;if(!F)return;F.t+=dt;o.fade(smooth(F.t/.7));if(F.t>1.1){const s=F.section,f={...C.fails};C.keepFails=f;jumpTo(s);C.fails=f;C.flags.retried=(C.flags.retried||0)+1;}}
 // ---- hazards: something about to come down where you are (dust first, a crack, then it falls) ------------------------------------------
 // hazard({at, r, warn, onFall, fatal}): warn seconds of dust and creaking, then it falls; inside r when it does: fail
 function hazard(h){const z={t:0,warn:1.6,r:1.8,fatal:true,...h,fell:false};C.haz.push(z);sound('c8Creak',z.at,{gain:.8});return z;}
 function updateHazards(dt){const p=me();for(const z of C.haz){if(z.fell)continue;z.t+=dt;z.gt=(z.gt||0)-dt;if(z.gt<=0&&z.t<z.warn){z.gt=.12;presence.trickle(z.at,{h:z.h||3.2,n:z.t>z.warn*.6?3:2});}if(z.t>=z.warn){z.fell=true;presence.impact({x:z.at.x,y:z.at.y,z:z.at.z},{n:z.n||16,power:z.power||1});C.shake=Math.max(C.shake,.45);
   if(z.fatal&&Math.hypot(p.x-z.at.x,p.z-z.at.z)<z.r)fail(z.section||C.lastCheckpoint||'chapter8-start','under the fall');z.onFall?.();}}C.haz=C.haz.filter(z=>!z.fell||z.t<z.warn+.1);}
 // ---- the hunter here: a place to search, who it can see, and where a catch sends you ------------------------------------------------------
 function huntStart({ids,route,at,catchTo,fov=1.25,range=15,speedK=1,extra=[],cells=null,filter=null}){const G=X.graph(ids,{extra});H.reset();H.setGraph(G);H.place(at.x,at.z,0);HM.show(true);
  const nodes=G.nodes.filter(n=>!n.door),r=cells?nodes.filter(n=>cells.includes(n.cell)&&(!filter||filter(n))).sort((a,b)=>(a.x-b.x)||(a.z-b.z)).map(n=>n.id):(route||[]).map(i=>nodes[Math.min(i,nodes.length-1)]?.id).filter(Boolean);
  if(cells&&r.length>2){const back=r.slice(1,-1).reverse();r.push(...back);}H.patrol(r.length?r:nodes.slice(0,6).map(n=>n.id));
  H.sightRange=range*(1-.12*Math.min(2,C.fails[catchTo]||0));H.fov=fov;H.walkSpeed=1.25*speedK;H.runSpeed=4.1*speedK*(1-.06*Math.min(2,C.fails[catchTo]||0));H.stalkSpeed=.9*speedK;
  const you={id:'you',pos:()=>({x:camera.position.x,y:camera.position.y,z:camera.position.z}),crouch:()=>o.foot.crouch??0,hidden:()=>!!C.hiding,moving:()=>me().speed||0,lit:()=>o.foot.on?1:.25};
  H.setTargets([you]);H.onCatch=()=>{fail(catchTo,'caught');};C.hunt={catchTo,G};mark('it is searching: '+ids.join(','));}
 function huntStop(){H.reset();HM.show(false);C.hunt=null;for(const id of [...C.offers.keys()])if(id.startsWith('hide-'))C.offers.delete(id);if(C.hiding){C.hiding=null;o.roam.walkLock=false;C.offers.delete('unhide');}}
 const noise=(pos,loud=1,id='noise')=>{if(C.hunt)H.hear(pos,loud,{id});};
 // ---- the clock and the sky -------------------------------------------------------------------------------------------------------------
 const date=h=>o.setDate(`${h>=24?'AUGUST 27':'AUGUST 26'}, 2011 <i></i> ${fmt(h)}`);
 function clock(dt){if(S.phase==='c8-black')return;C.h+=dt/240;if(C.hMin!==undefined&&C.h<C.hMin)C.h=Math.min(C.hMin,C.h+dt/30);const m=Math.floor(C.h*60+1e-6);if(m!==C.minute){C.minute=m;date(C.h);}}
 const below=()=>X.ST.active&&X.nav.inside(camera.position.x,camera.position.z);
 function sky(){const ph=S.phase;
  if(below())return {day:0,p:0,night:1,deep:1,fill:0,storm:0,flash:0,cave:.94};
  if(/^n8-(oak|ride|end)$/.test(ph)){const k2=smooth((C.h-30.1)/.5);return {day:.18+.42*k2,p:.55-.15*k2,night:.4-.35*k2,deep:0,fill:.1,storm:0,flash:0,cave:0};}
  if(/^(g8|n8-op)/.test(ph)){const k2=smooth((C.h-28.6)/1.4);return {day:.02+.12*k2,p:.18+.2*k2,night:.92-.3*k2,deep:.2*(1-k2),fill:0,storm:0,flash:0,cave:inWorksBelow()?.8:0};}
  return {day:0,p:0,night:1,deep:.45,fill:0,storm:0,flash:0,cave:inSams()?.75:0};}
 const inSams=(p=camera.position)=>ch7.house?.root?.parent&&ch7.house.inHouse?.(p.x,p.z);
 const inWorksBelow=()=>{if(!works?.zoneAt)return false;const z=works.zoneAt(camera.position.x,camera.position.z);return ['gallery','stair2','L','J','gate'].includes(z);};
 // ---- what you carry (I) ----------------------------------------------------------------------------------------------------------------
 function items(){const I=C.inv,carry=[],found=[];
  if(I.notebook==='have')carry.push({id:'notebook',name:'Sam’s notebook',state:'ALEX · JAMIE · SAM'});if(I.gum==='have')carry.push({id:'gum',name:'A pack of gum',state:'Spearmint. Sam’s.'});
  if(I.camera==='have')carry.push({id:'camera',name:'Alex’s camera',state:'The last picture: the three of you at the fire, from the trees.'});if(I.flashlight)carry.push({id:'flashlight',name:'Flashlight',state:'T'});
  if(I.sheet==='have')found.push({id:'sheet',name:'Sam’s torn-out page',note:'Line Four bends round a box nobody drew. MH-12.'});if(I.radio==='have')found.push({id:'radio',name:'Reyes’s radio',note:'Channel three. Jamie had it.'});
  if(I.receipt)found.push({id:'receipt',name:'Mason’s receipt, 1958',note:'One Meadowlark, green. Annie Rowan. Licence 0417.'});if(I.flyer)found.push({id:'flyer',name:'A 1991 flyer',note:'Danny Whitcomb, 12. Missing the last two fingers of his left hand.'});
  if(C.flags.ruth)found.push({id:'ruth',name:'Cell 4',note:'Ruth Ann Carver. 1966. CONNECTION LOST 3/79.'});if(C.flags.board)found.push({id:'board',name:'The anchor board',note:'They kept them alive to hold it.'});
  return {carry,found};}
 const inv=createInventory({items,use:()=>{}});
 // ---- the scenes (below and on the street) are added by chapter8-scenes.js, which shares all of this --------------------------------------
 const CTX={o,k,C,A8,S,X,ruin,presence,H,HM,danny,brandt,fire,reyes,officer,police,samDad,samMom,jamie,sam,get alex(){return alex;},set alex(v){alex=v;},comp,brain,works,WS,WP,B7,ch2,ch3,ch4,ch5,ch6,ch7,
  sound,gy,light,LIGHTS,lightsOn,checkpoint,later,mark,card,say,J,SM,AL,R,RR,BR,BRR,Y,N,V,task,stopTask,wait,until,lines,quiet,offer,unoffer,V3,near,lookingAt,pose,unpose,posed,closeLook,endLook,looking,inspect,endInspect,reading,
  pageMesh,choose,choosing,fail,hazard,huntStart,huntStop,noise,me,go,objective,talk,busy,main,nav,camera,scene,world,stand,walkTo,joinFoot,leave,friendsNow,minds,date,fmt,HOUR,inv,SAVE8,
  enlistAlex:()=>{if(!alex){alex=comp.enlist('alex',{lag:2.2,side:0});}return alex;},dismissAlex:()=>{if(alex){comp.dismiss('alex');alex=null;}}};
 let SC=null;// (the scenes module, set by attach())
 // ---- prompts --------------------------------------------------------------------------------------------------------------------------------
 function spots(){const out=[];if(C.view||C.fadeOut>=0||posed()||C.choice||C.failing||C.hiding&&!C.offers.has('unhide'))return C.hiding?[...C.offers.values()].filter(f=>f.id==='unhide').map(f=>({id:f.id,label:f.label,at:V3(atOf(f.at)),face:V3(atOf(f.at)),r:9,wide:true})):out;
  for(const f of C.offers.values()){if(f.when&&!f.when())continue;const at=V3(atOf(f.at));if(!at)continue;const lb=f.hold?(f.label+(C.hold[f.id]>0?` (${Math.round(C.hold[f.id]*100)}%)`:'')):f.label;
   out.push({id:f.id,label:lb,at,face:at,r:f.r,wide:true,...(f.look?{look:true,size:f.size??.3,cone:f.cone??.14}:{})});}return out;}
 function act(id){const f=C.offers.get(id);if(!f)return;if(f.hold){C.holdOn=id;return;}if(f.once)C.offers.delete(id);C.flags[id]=true;f.fn?.();mark('F: '+id);}
 function updateHolds(dt){const id=C.holdOn;if(!id)return;const f=C.offers.get(id);const heldF=o.held?.('KeyF');if(!f||!heldF){C.holdOn=null;f?.release?.();return;}
  const p=me(),w=V3(atOf(f.at));if(w&&Math.hypot(p.x-w.x,p.z-w.z)>f.r+.6){C.holdOn=null;return;}if(f.can&&!f.can()){f.blocked?.();return;}
  const v=(C.hold[id]||0)+dt/f.hold;C.hold[id]=Math.min(1,v);f.tick?.(dt,C.hold[id]);if(f.noise&&C.t-(f.lastNoise||0)>.8){f.lastNoise=C.t;noise(w||camera.position,f.noise,id);}
  if(C.hold[id]>=1){C.offers.delete(id);C.holdOn=null;C.flags[id]=true;f.fn?.();mark('held: '+id);}}
 function key(code,repeat){if(!mine(S.phase))return false;
  if(C.failing)return true;
  if((code==='KeyI'||code==='Tab')&&!inv.isOpen&&(C.view||C.fadeOut>=0||S.phase==='c8-black'||C.choice))return true;if(inv.key(code,repeat))return true;
  if(C.choice){const m=/^(Digit|Numpad)([1-4])$/.exec(code);if(m){if(!repeat)pick(+m[2]-1);return true;}return ['KeyF','KeyW','KeyA','KeyS','KeyD','Space'].includes(code);}
  if(C.view==='inspect'){if((code==='KeyS'||code==='ArrowDown'||code==='KeyF')&&!repeat&&C.inspect?.t>.4&&!busy()){C.flags.putDown=true;endInspect();return true;}if(code==='KeyA'){C.inspect.yaw-=.25;return true;}if(code==='KeyD'){C.inspect.yaw+=.25;return true;}return ['KeyW','Space','KeyC','KeyS'].includes(code);}
  if(C.view==='look'){if((code==='KeyS'||code==='ArrowDown')&&!busy()&&!C.lockLook){if(!repeat){endLook();C.flags.lookEnded=true;}return true;}return ['KeyW','KeyA','KeyD','Space','KeyC','KeyS'].includes(code);}
  if(SC?.key?.(code,repeat))return true;
  if(C.hiding&&['KeyW','KeyA','KeyS','KeyD','Space'].includes(code))return true;
  return false;}
 function pan(dx,dy){if(!mine(S.phase))return false;if(C.view==='inspect'){C.inspect.yaw+=dx*.006;C.inspect.pitch=clamp(C.inspect.pitch+dy*.006,-1.2,1.2);return true;}return !!SC?.pan?.(dx,dy);}
 function wheel(dy){if(!mine(S.phase))return false;return !!SC?.wheel?.(dy);}
 function hint(){if(C.choice)return C.choice.options.map((op,i)=>[String(i+1),op.label]);
  if(C.view==='inspect')return [['Mouse / A D','Turn it'],['S','Put it down']];if(C.view==='look'&&!C.lockLook)return [['S','Step back']];
  const h=SC?.hint?.();if(h)return h;if(C.hiding)return [['F','Come out']];
  if(C.holdOn&&C.offers.get(C.holdOn))return [['Hold F',C.offers.get(C.holdOn).label+' '+Math.round((C.hold[C.holdOn]||0)*100)+'%']];return null;}
 function sources(out){if(!mine(S.phase))return;SC?.sources?.(out);ruin.sources(out);}
 function blockers(){const out=[];for(const a of [reyes,brandt,...fire,samDad,samMom].filter(Boolean))if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});
  if(C.duck&&!((o.foot.crouch??0)>.45))for(const q of C.duck)out.push({x:q.x,z:q.z,r:.3,speed:0});// (under a jammed door: only crouching)
 SC?.blockers?.(out);return out;}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------
 function update(dt){C.dt=dt;C.t+=dt;C.pt+=dt;const ph=S.phase;mind();
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  for(const t of C.tasks.slice()){let r;try{r=t.gen.next(dt);}catch(e){mark('task '+t.name+' threw: '+(e&&e.message));console.error?.(e);r={done:true};}if(r.done)C.tasks=C.tasks.filter(x=>x!==t);}
  if(C.cardT>=0){C.cardT+=dt;if(C.cardT>.8&&!C.cardOn)card(true,{sub:'THE NIGHT OAK HOLLOW FELL<br>FRIDAY, AUGUST 26, 2011'});if(C.cardT>5.6){card(false);C.cardT=-1;}}
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/2.2));if(C.fadeIn>2.2){C.fadeIn=-1;o.fade(0);}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/1.4));if(C.fadeOut>1.6){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(C.choice){C.choice.t+=dt;}
  updatePose(dt);if(C.view==='inspect'&&C.inspect){C.inspect.t+=dt;C.inspect.obj.rotation.set(C.inspect.pitch,C.inspect.yaw,0);}
  if(C.view==='look'&&C.lookDur){C.lookT+=dt;if(C.lookT>C.lookDur&&!busy())endLook();}
  updateHolds(dt);updateHazards(dt);updateFail(dt);clock(dt);
  if(X.ST.active)X.update(dt);presence.update(dt);ruin.update(dt,{camera,t:C.t});
  if(C.hunt||H.mode!=='off'){H.update(dt);}
  if(danny.group.visible&&C.dannyOn)SC?.updateDanny?.(dt);
  SC?.update?.(dt);
  for(const l of LIGHTS){const f=l.userData.flicker;if(f&&l.userData.base)l.intensity=l.userData.base*(1-f*.5+f*.5*Math.sin(C.t*23+l.id)*Math.sin(C.t*7.1+l.id*2));}
  const L8=sky();A.day=L8.day;A.night=L8.night;ch2.day=A.day;A.shade=0;A.barLight=false;}
 function afterActors8(dt){if(!owns(S.phase))return;k.torchO&&(k.torchO.visible=false);
  for(const a of [reyes,officer,brandt,...fire,samDad,samMom].filter(Boolean)){if(!a.visible)continue;applyPose(a.person,a.pose);}
  SC?.afterActors?.(dt);
  if(C.shake>0){C.shake=Math.max(0,C.shake-dt*.9);const s=C.shake*C.shake*.06;camera.position.x+=Math.sin(C.t*61)*s;camera.position.y+=Math.sin(C.t*47+1)*s*.7;camera.position.z+=Math.cos(C.t*53)*s;}
  for(const art of ch6.appearances6?.values?.()||[])art.update?.(dt,{clock:C.t,eye:camera.position,phase:S.phase});}
 {const prev=A.afterActors6;A.afterActors6=(dt,o2)=>{prev?.(dt,o2);afterActors8(dt,o2);};}
 // ---- lifecycle -------------------------------------------------------------------------------------------------------------------------------
 function reset(){const hadPose=C.pose,hadView=!!C.view;card(false);if(C.view==='inspect')endInspect();if(C.view==='look')C.view=null;inv.reset();C.choice=null;
  if(nav.room===X.nav||nav.room===ruin.room||nav.room===ch7.house?.nav||nav.room===works?.nav)nav.setRoom(null);
  X.show(false);X.reset();ruin.show(false);ruin.reset();presence.reset();presence.show(false);huntStop();lightsOn(false);if(danny){danny.show(false);danny.ground=null;}C.dannyOn=false;
  for(const a of [brandt,samDad,samMom,...fire].filter(Boolean)){a.show(false);a.lookAt=null;a.gest?.(null);a.path=null;a.mode='stand';}
  SC?.reset?.();for(const key of Object.keys(SPOTS))SPOTS[key]=null;
  CTX.dismissAlex();for(const c of [jamie,sam]){c.gone=false;c.crouch=0;c.boost=1;}sam.person.group.visible=true;sam.bike.group.visible=true;
  A.rideBoost=1;A.rideFov=0;o.setPace?.(1);o.roam.brake=0;holder.removeFromParent();
  if(A8.started)ch5.presentation?.(false);A8.started=false;A8.finished=false;
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView||C.hiding)o.roam.walkLock=false;const fails=C.keepFails||C.fails;fresh();C.fails=fails;}
 function begin(){A8.started=true;SC.begin();}
 function jump(section){jumpTo(section);}
 function jumpTo(section){section=ALIAS8[section]||section;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();minds();A8.started=true;
  SC.jump(section);}
 // ---- the end card --------------------------------------------------------------------------------------------------------------------------------
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Chapter Eight';if(pp)pp.innerHTML='THE NIGHT OAK HOLLOW FELL<br>August 27, 2011.';}
  const nb=$('next-chapter');if(nb)nb.hidden=true;A8.finished=true;
  try{localStorage.setItem(SAVE8,JSON.stringify({home:['YOU','SAM'],lost:['JAMIE','ALEX'],presence:'sealed',at:Date.now()}));}catch{}
  o.finish();}
 Object.assign(CTX,{end,jumpTo,reset,fresh,SPOTS,holder,items,X8:X});
 // ---- the api ------------------------------------------------------------------------------------------------------------------------------------------
 function attach(mod){SC=mod(CTX);A8.SC=SC;}
 Object.assign(A8,{SECTIONS:SECTIONS8,ALIAS:ALIAS8,LABEL:LABEL8,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,attach,
  jamieSweep:()=>null,officerAim:()=>SC?.officerAim?.()??null,light:()=>owns(S.phase)?sky():null,longThrow:()=>null,
  canDismount:()=>!posed()&&!C.view&&S.phase!=='c8-black'&&!!SC?.canDismount?.(),canRemount:()=>!C.view&&!posed()&&!!SC?.canRemount?.(),
  closeBag:()=>{if(inv.isOpen){inv.close();return true;}return false;},inventoryReady:()=>owns(S.phase)&&S.phase!=='c8-black',
  C,X,ruin,presence,H,HM,LIGHTS,inv,sky,brain,CTX,get alex(){return alex;},get started(){return A8._started;},set started(v){A8._started=v;}});
 Object.defineProperties(A8,{amb:{get:()=>C.amb},viewing:{get:()=>C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,lookKind:C.lookKind,inv:{...C.inv},offers:[...C.offers.keys()],hold:{...C.hold},
   hiding:C.hiding||null,fails:{...C.fails},where:C.where,stage:{...C.stage},tasks:C.tasks.map(t=>t.name),below:below(),cell:X.ST.active?X.cellIdAt(p.x,p.z):null,
   hunter:{mode:H.mode,state:HM.state,visible:HM.root.visible,x:+HM.x.toFixed(2),z:+HM.z.toFixed(2),log:{...H.log},trace:H.trace.slice(-10)},
   friends:{jamie:{gone:!!jamie.gone,active:jamie.active,visible:jamie.person.group.visible,mode:jamie.mode,dead:!!C.flags.jamieDead},sam:{gone:!!sam.gone,active:sam.active,visible:sam.person.group.visible,mode:sam.mode},
    alex:alex?{gone:!!alex.gone,active:alex.active,visible:alex.person.group.visible,mode:alex.mode,dead:!!C.flags.alexDead}:null},
   presence:{active:presence.active,log:{...presence.log}},ruin:{stage:ruin.ST.stage,heave:ruin.HV.stage},complex:{...X.ST,doors:Object.fromEntries([...X.doorOpen].map(([kk,v])=>[kk,+v.toFixed(2)]))},
   sounds:{...C.sounds},marks:C.marks.slice(-30),endT:+C.endT.toFixed(2)};}}});
 return A8;
}
