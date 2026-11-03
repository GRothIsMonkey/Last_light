// Chapter Seven: The Street That Wasn't There. Friday, August 26, 2011: the morning at Sam's, the afternoon at the end of
// Oak Hollow Drive, and that evening on a street that has not been on any map since 1974.
//
//  I.   The house without Sam. Jamie on Sam's front step. Sam's mom, organised; Sam's dad, on the couch with the phone and
//       the TV with the sound off. Sam's room, untouched since Thursday: the fan running (turn it off; his dad turns it back
//       on: "He can't sleep without that."), the photograph of the four of you at the oak, his notebook (taken), a pack of
//       gum (Jamie takes it). Something in the garage: a long thing, low, a hand flat on the concrete, gone out the side door.
//  II.  The search continues. Officer Reyes at the kitchen table: nothing found; the grille open. Sam's notebook ("Why does
//       Line Four bend around nothing?"), the 1958 plan over the 2009 map: Old Mill Court, past the oak, vacated in 1974. Mark
//       it. "Four-thirty. You stay where I can see you." That afternoon, on the curb: "I keep thinking I'm gonna tell him."
//  III. The street that wasn't there. The ride to the end of the street; Reyes; the old curb in the grass; the township's
//       lane behind the oak. Bring the bikes. Round two bends, and out onto a street: Old Mill Court. Reyes on the radio, in
//       the field, where there is nothing. The lane behind them shut by a fence. The light going faster than it should. A
//       house with its lights on and a family at dinner who do not move, until they turn their heads, and the father comes
//       through the room at the glass.
//  IV.  Something is hunting us. Sam's voice on the radio: the house with the green door, upstairs. At the top of the stairs a
//       hand round a doorframe. It comes down. Get past it to the stairs (it walks the rooms; it hears; it can catch you).
//       The room at the top: the door shut, the dresser, the door hammered, then nothing. A boy's room from August 1991, a page
//       in Sam's writing gone yellow as if it had waited twenty years, the old green bike, wet, and its bell, which rings.
//       From the hall window something far too large moves behind the roofs. Lights past a hedge: Reyes. The porch roof.
//  V.   Jamie's last ride. The bikes; it comes over the car at them. Down the court, round the bend, up the other side, into
//       the other lane, and out at the oak. Reyes's car, empty. It takes Jamie. You hold on to him. You lose him. It drags
//       him into the lane, and the lane is only the lane. The gum in the grass. Later: Reyes says Sam's name off his notebook.
//       Jamie's mother's pictures have no Jamie in them. In Sam's room the fan is on and Sam's dad doesn't know why. The
//       photograph is of you, alone at the oak. You write their names down. Four bikes under the streetlight. One is yours.
//
// Nothing here explains anything. Sam is missing (never seen); Jamie is taken (never seen again here). chapter6.js hands this
// file every phase that starts c7-, d7-, e7- or n7-. Places: chapter7-house.js (Sam's), chapter7-court.js (the lane, the
// court) with chapter7-interiors.js; the hunter: chapter7-creature.js (the replaceable model) and chapter7-hunter.js (its
// mind); people: chapter7-cast.js; paper: chapter7-props.js; building kit: chapter7-build.js.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {P as PI,newPose,standPose,sitPose,applyPose,blendPose,copyPose} from './rig.js';
import {CAST} from './cast.js';
import {createCompanionBrain} from './companion-brain.js';
import {createInventory} from './inventory.js';
import {LOOKOUT} from './layout.js';
import {createSamHouse} from './chapter7-house.js';
import {createCourt,P1 as LANE_P1,LEG as COURT_LEG} from './chapter7-court.js';
import {STAIR,HH} from './chapter7-interiors.js';
import {createHunterModel,HUNTER_ID} from './chapter7-creature.js';
import {createHunterAI} from './chapter7-hunter.js';
import {createCast7} from './chapter7-cast.js';
import {canvas,texOf,photoSketch,PHOTO,planCanvas,modernCanvas,drawMapView,MAP,notebookPage,newspaper1966,calendar1991,samPage} from './chapter7-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// QA jumps and DEV scenes, in story order (each starts a little before its moment).
export const SECTIONS7=['chapter7-start','c7-step','c7-family','c7-bedroom','c7-fan','c7-gum','c7-garage','c7-reyes','c7-map','c7-curb','c7-ride','c7-lookout','c7-lane',
 'c7-court','c7-separation','c7-dining','c7-dining-scare','c7-house','c7-reveal','c7-stalk','c7-door','c7-clues','c7-trace','c7-old-bike','c7-giant','c7-out','c7-bikes',
 'c7-chase','c7-lookout-attack','c7-grab','c7-struggle','c7-taken','c7-gum-pickup','c7-after','c7-forgetting','c7-sams','c7-photo','c7-names','c7-window','chapter7-end'];
export const ALIAS7={'c7-start':'chapter7-start','c7-house-morning':'c7-family','c7-room':'c7-bedroom','c7-investigation':'c7-reyes','c7-old-map':'c7-map','c7-jamie':'c7-curb',
 'c7-wrong-street':'c7-lane','c7-reyes-radio':'c7-separation','c7-window-scare':'c7-dining-scare','c7-horror-house':'c7-house','c7-creature':'c7-reveal','c7-stealth':'c7-stalk',
 'c7-historical':'c7-clues','c7-sam-trace':'c7-trace','c7-meadowlark':'c7-old-bike','c7-vantage':'c7-giant','c7-escape':'c7-chase','c7-attack':'c7-lookout-attack','c7-rescue':'c7-struggle',
 'c7-gone':'c7-taken','c7-gum-drop':'c7-gum-pickup','c7-aftermath':'c7-after','c7-final-photo':'c7-photo','c7-notebook':'c7-names','c7-final-image':'c7-window','c7-end':'chapter7-end'};
// Checkpoints (silent; Continue on the title comes back here). A failure in the house or the chase comes back to its own.
export const LABEL7={'chapter7-start':'The house without Sam','c7-bedroom':'Sam’s room','c7-garage':'The garage','c7-reyes':'Officer Reyes','c7-curb':'That afternoon',
 'c7-lookout':'The end of the street','c7-court':'Old Mill Court','c7-house':'The house with the green door','c7-stalk':'Something is hunting us','c7-clues':'Upstairs',
 'c7-bikes':'Jamie’s last ride','c7-after':'Later','c7-sams':'Sam’s room, that night','chapter7-end':'The street that wasn’t there'};
const PHASES=['c7-black','d7-step','d7-house','d7-garage','d7-reyes','d7-map','d7-curb','e7-ride','e7-lookout','e7-lane','e7-court','e7-dining','e7-house','e7-reveal','e7-stalk',
 'e7-door','e7-upstairs','e7-giant','e7-out','n7-bikes','n7-chase','n7-lookout','n7-grab','n7-taken','n7-gone','n7-after','n7-sams','n7-names','n7-window','n7-end'];
// (Friday: Sam's at twenty to ten, the garage at ten, Reyes at a quarter to eleven; the curb at a quarter past four, the oak
// at twenty to five, the court at five, where the clock does not keep time; the bikes at twenty-five past eight; later, ten)
const HOUR={start:9.62,garage:10.02,reyes:10.72,curb:16.25,ride:16.6,lookout:16.7,court:17.05,dining:19.25,house:19.55,upstairs:20.0,bikes:20.4,after:21.7,sams:22.4};
const fmt=h=>{const H=Math.floor(h),M=Math.floor((h-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};
export const SAVE7='lastlight.chapter7';// what Chapter Eight will find: the names, the photograph, the gum

export function createChapter7(o,k,{chapter2:ch2,chapter3:ch3,chapter4:ch4,chapter5:ch5,chapter6:ch6}){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam}=k,A=k.api,T=o.tension,police=k.police;
 const me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go,main=k.main;
 const reyes=k.officer2,officer=k.officer,phys=ch5.phys,G5=ch5.G5;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL7);
 const A7={};
 const C={};
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos,opts);}
 // ---- places, people, the hunter -----------------------------------------------------------------------------------------------
 const house=createSamHouse({scene,world,shoot:o.shoot});
 const court=createCourt({scene,world,sfx:(n,p,op)=>sound(n,p,op)});court.setBaseNav(nav);
 const cast=createCast7({scene,nav});
 const HM=createHunterModel({scene});
 const samDad=ch6.cast.samDad,samMom=ch4.samMom;
 const brain=createCompanionBrain({nav,comp});
 function minds(){brain.reset();brain.enable(jamie,true);brain.enable(sam,false);C.mindKey=null;}
 // the hunter walks the region's ground with its own floor (it can be upstairs while you are not)
 const HL={level:'g'};
 const withLevel=(lv,f)=>{const s=court.ST.level;court.ST.level=lv;try{return f();}finally{court.ST.level=s;}};
 const hunterNav={walkable:(x,z,r)=>withLevel(HL.level,()=>court.nav.inside(x,z)?court.nav.walkable(x,z,r):nav.walkable(x,z,{r})),floorAt:(x,z)=>withLevel(HL.level,()=>court.nav.inside(x,z)?court.nav.floorAt(x,z):nav.groundY(x,z))};
 // sight inside the green-door house: its walls, doors and furniture (heights over the court's ground)
 function sightClear(ax,ay,az,bx,by,bz){const qa=court.regL(ax,az),qb=court.regL(bx,bz);const inA=court.inHouseAt(ax,az),inB=court.inHouseAt(bx,bz);
  if(!inA&&!inB)return true;if(inA!==inB)return false;const ha=court.cToH(qa.x,qa.z),hb=court.cToH(qb.x,qb.z);return court.HG.sight(ha.x,ay-court.G0,ha.z,hb.x,by-court.G0,hb.z);}
 const H=createHunterAI({model:HM,nav:hunterNav,sightClear,sfx:(n,p,op)=>sound(n,p,op),mark:w=>mark(w)});
 // ---- the lights this chapter brings (always the same four while it plays: no shader changes mid-scene) -------------------------
 const LIGHTS=[0,1,2,3].map(i=>{const l=new THREE.PointLight(0xffd6a0,0,9,2);l.name='c7-light-'+i;return l;});
 function lightsOn(on){for(const l of LIGHTS){if(on&&!l.parent)scene.add(l);else if(!on&&l.parent)l.removeFromParent();if(!on)l.intensity=0;}}
 function light(i,q,{intensity=3,dist=9,color=0xffd6a0}={}){const l=LIGHTS[i];if(!q){l.intensity=0;return;}l.position.set(q.x,q.y,q.z);l.intensity=intensity;l.distance=dist;l.color.setHex(color);}
 // ---- state ------------------------------------------------------------------------------------------------------------------
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,h:HOUR.start,flags:{},timers:[],cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,match:false,want:null,wantT:0,
  spot:{jamie:null,sam:null},view:null,lookKind:null,minute:-1,sounds:{},amb:{traffic:.5,insects:.5,wind:.4,life:1,forest:0,tunnel:0,water:0},
  inv:{notebook:null,gum:'nightstand',photo:'desk',radio:false,flashlight:false},seen:new Set(),looked:new Set(),beat:{},choice:null,fails:{stalk:0,chase:0},rate:null,lv:'g'});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL7[id]);C.lastCheckpoint=id;};
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why){T?.note?.(why);(C.marks||=[]).push([+C.t.toFixed(1),why]);if(C.marks.length>200)C.marks.shift();}};
 const mine=ph=>typeof ph==='string'&&/^(c7|d7|e7|n7)-/.test(ph);
 const owns=mine;
 const handles=sec=>SECTIONS7.includes(sec)||!!ALIAS7[sec];
 function card(on,{title='Chapter Seven',eyebrow='LAST LIGHT',sub=''}={}){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2'),s=el.querySelector?.('.card-sub');if(e)e.textContent=eyebrow;if(h)h.textContent=title;if(s)s.innerHTML=sub;el.classList.add('on');}else{el.classList.remove('on');const s=el.querySelector?.('.card-sub');if(s)s.innerHTML='';}C.cardOn=on;}
 // a line: by ('jamie' | an actor), face (the speaker's expression), faces (the listeners')
 const by=l=>{if(l.text===undefined&&!l.then&&!l.wait&&!l.until)l={...l,wait:.01};/* (an act alone: a beat, not a line) */if(l.text===undefined&&!l.face&&!l.faces)return l;const from=l.by==='jamie'?jamie:l.by==='sam'?sam:l.from,act0=l.act;
  const act=(l.face||l.faces)?()=>{if(l.face&&from?.person?.face)from.person.face.set(l.face,{hold:Math.max(3,(l.time||2)+1.5)});if(l.faces)for(const [kk,f] of Object.entries(l.faces)){const c=kk==='jamie'?jamie:sam;c.person.face?.set(f,{hold:4});}act0?.();}:act0;
  if(l.text===undefined)return {...l,act};return {...l,from,act,time:l.time??Math.max(1.4,(typeof l.text==='function'?'a line of about this long':l.text).replace(/[“”]/g,'').length*.056)};};
 function say(lines,opts){talk(lines.map(by),opts);}
 const J=(text,o2={})=>({who:'JAMIE',text:'“'+text+'”',by:'jamie',...o2});
 const R=(text,o2={})=>({who:'OFFICER REYES',text:'“'+text+'”',from:reyes,...o2});
 const RR=(text,o2={})=>({who:'REYES (RADIO)',text:'“'+text+'”',...o2});
 const MOM=(text,o2={})=>({who:'SAM’S MOM',text:'“'+text+'”',from:samMom,...o2});
 const DAD=(text,o2={})=>({who:'SAM’S DAD',text:'“'+text+'”',from:samDad,...o2});
 const N=(text,o2={})=>({who:'',text,...o2});
 const face=(c,f,hold=4)=>c.person.face?.set(f,{hold});
 // ---- poses: a closer look, holding on, lying in the grass ------------------------------------------------------------------
 function pose(q,{y,pitch=0,yaw=null,look=null,slow=1.1}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false,fx:p.x,fz:p.z,slow};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/(P2.slow||1.1));if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 const gy=(x,z)=>nav.groundY(x,z);
 function closeLook(target,{back=.62,eye=1.42,floor=null,kind=null,dur=null}={}){const p=me(),a=headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
  const dy=target.y-(fy+eye),pitch=Math.atan2(dy,back);pose(q,{y:fy+eye,yaw:a,pitch});C.view='look';C.lookKind=kind;C.lookAt=target;C.lookT=0;C.lookDur=dur;}
 function endLook(){if(C.view!=='look')return;C.view=null;C.lookKind=null;unpose();}
 // ---- Jamie (Chapter Six's ways: he rides when you ride, walks when you walk, stands where a scene asks) ------------------------
 function follow(on){C.match=on;}
 function match(dt){if(!C.match)return;const p=me(),want=p.riding?'ride':'walk';C.wantT=C.want===want?C.wantT+dt:0;C.want=want;
  for(const c of [jamie]){if(c.script||!c.active||c.gone)continue;
   if(C.spot[c.key]){if(want==='walk'&&c.mode==='ride'&&C.wantT>=1)comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)]);continue;}
   if(want==='ride'){if(c.mode==='ride'){c.follow='ride';continue;}if(C.wantT<.8||C.flags.noBikes)continue;
    const fb=Math.hypot(c.bx-c.px,c.bz-c.pz);if(c.bike.group.visible&&fb<45){const s2={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2);
     comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:1.8}),comp.steps.turnTo(c,()=>c.ba,.45),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,1.3)],{then:()=>{c.follow='ride';}});}
    else c.follow='walk';}
   else{if(c.mode==='foot'){c.follow='walk';continue;}if(C.wantT<1)continue;
    if(c.mode==='ride')comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)],{then:()=>{c.follow='walk';}});}}}
 const at=q=>Array.isArray(q)?{x:q[0],z:q[1],y:gy(q[0],q[1])}:q;
 function stand(c,q,{look=null,face:fc=null,max=3.2,gesture=null,keep=false,leash=14}={}){
  C.spot[c.key]=q?{q,look,face:fc,max,gesture,keep,leash}:null;if(!q){if(c.script?.spot7){c.script=null;c.then=null;}if(C.match&&c.mode==='foot')c.follow='walk';return;}
  if(c.mode!=='foot'||c.script?.spot7||c.gone)return;
  comp.run(c,[comp.steps.toward(c,()=>{const s=C.spot[c.key];if(!s)return null;const w=typeof s.q==='function'?s.q():at(s.q);const lk=typeof s.look==='function'?s.look():s.look;
   return {x:w.x,z:w.z,look:lk,face:typeof s.face==='function'?s.face():s.face??undefined,max:s.max,gesture:s.gesture};})],{then:()=>{if(C.match&&c.mode==='foot')c.follow='walk';}});c.script.spot7=true;}
 function standAll(){for(const c of [jamie]){const s=C.spot[c.key];if(s&&c.mode==='foot'&&!c.script&&!c.gone&&c.active)stand(c,s.q,s);}}
 function glance(c,q,secs=2){c.lookAt=q;later(secs,()=>{if(c.lookAt===q)c.lookAt=null;});}
 const dist2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const near=(q,r,p=me())=>{const w=at(q);return Math.hypot(p.x-w.x,p.z-w.z)<r;};
 // Jamie stays with you (Chapter Five/Six's guard: out of sight, a stuck friend is put back on your trail)
 const GUARD={x:0,z:0,t:0,stuck:0},TRAIL=[];
 const seenAt=q=>{const e=camera.position,f=new THREE.Vector3();camera.getWorldDirection(f);const dx=q.x-e.x,dz=q.z-e.z,l=Math.hypot(dx,dz)||1;return (dx*f.x+dz*f.z)/l/(Math.hypot(f.x,f.z)||1)>.3&&l<45;};
 function guard(dt){const ph=S.phase;if(!C.guardLog){C.guardLog={released:0,unstuck:0,recovered:0};TRAIL.length=0;Object.assign(GUARD,{x:0,z:0,t:0,stuck:0});}
  if(!/^(d7-(step|curb)|e7-(ride|lookout|court|dining|out)|n7-(bikes))$/.test(ph)||C.fadeOut>=0)return;const p=me(),c=jamie;if(!c.active||c.gone||c.script&&!c.script.spot7)return;
  const tl=TRAIL[TRAIL.length-1];if(!tl||Math.hypot(tl.x-p.x,tl.z-p.z)>1){TRAIL.push({x:p.x,z:p.z});if(TRAIL.length>40)TRAIL.shift();}
  const q=c.mode==='ride'?{x:c.bx,z:c.bz}:{x:c.px,z:c.pz},d=Math.hypot(q.x-p.x,q.z-p.z);c.footBoost=C.flags.hurry?1.45:1.2;
  const sp=C.spot[c.key];if(sp&&!sp.keep&&c.mode==='foot'&&p.walking&&d>(sp.leash||14)){stand(c,null);C.guardLog.released++;}
  GUARD.t+=dt;if(GUARD.t>=2.5){const mv=Math.hypot(q.x-GUARD.x,q.z-GUARD.z);GUARD.x=q.x;GUARD.z=q.z;GUARD.t=0;GUARD.stuck=d>6&&mv<.4&&c.mode==='foot'&&!sp?GUARD.stuck+2.5:0;if(GUARD.stuck===2.5){c.route=null;C.guardLog.unstuck++;}}
  if(GUARD.stuck>=7.5&&d>9&&c.mode==='foot'&&!c.script&&p.walking&&!C.view&&!seenAt(q)){
   for(let i=TRAIL.length-1;i>=0;i--){const t2=TRAIL[i],b=Math.hypot(t2.x-p.x,t2.z-p.z);if(b<5)continue;if(b>12)break;
    if(nav.walkable(t2.x,t2.z,{r:.3})&&!seenAt(t2)){comp.putFoot(c,t2.x,t2.z,headingTo(t2.x,t2.z,p.x,p.z),{bike:c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null});if(C.match)c.follow='walk';GUARD.stuck=0;C.guardLog.recovered++;mark('caught up: jamie');break;}}}}
 // ---- the clock and the sky ------------------------------------------------------------------------------------------------
 // (in the court the clock does not keep time: from five it runs fast, steadily, until it is dark; nowhere else)
 const RATE={day:4/3600,court:2.2/230,night:2/3600};
 function clock(dt){const ph=S.phase;let r=0;if(/^d7-/.test(ph))r=RATE.day;else if(ph==='e7-court'&&C.h<HOUR.dining)r=RATE.court;else if(/^(e7|n7)-/.test(ph))r=RATE.night;
  C.h+=r*dt;if(C.hMin!==undefined&&C.h<C.hMin)C.h=Math.min(C.hMin,C.h+dt/60);const m=Math.floor(C.h*60+1e-6);if(m!==C.minute&&ph!=='c7-black'){C.minute=m;date(C.h);}}
 const date=h=>o.setDate(`AUGUST 26, 2011 <i></i> ${fmt(h)}`);
 const inSams=(p=camera.position)=>house.root.parent&&house.inHouse(p.x,p.z);
 const inGreen=(p=camera.position)=>court.ST.active&&court.inHouseAt(p.x,p.z);
 function sky(h=C.h){const q=(a,b)=>smooth((h-a)/(b-a));let day=1-.5*q(18.4,19.6)-.5*q(19.6,20.25),p=.3*q(18.6,19.7)+.7*q(19.7,20.3),night=.6*q(19.95,20.4)+.3*q(20.4,21),deep=.15*q(20.2,21);
  const cv=inSams()?(S.phase==='n7-sams'||S.phase==='n7-names'||S.phase==='n7-window'?.75:.44):inGreen()?.62:C.inGarage?.4:0;
  return {day,p,night,deep,fill:0,storm:0,flash:0,cave:cv};}
 // ---- what you carry (I) -------------------------------------------------------------------------------------------------------
 function items(){const I=C.inv,carry=[],found=[];
  if(I.notebook==='have')carry.push({id:'notebook',name:'Sam’s notebook',state:C.flags.names?'ALEX · JAMIE · SAM':'His square printing',action:'Read'});
  if(I.gum==='have')carry.push({id:'gum',name:'A pack of gum',state:'Spearmint. Sam’s. Jamie’s.'});
  if(I.radio)found.push({id:'radio',name:'Reyes’s radio',note:'Channel three. Jamie has it.'});
  if(C.flags.photoSeen)found.push({id:'photo',name:'The photograph',note:C.flags.altered?'You, at the oak, with your bike.':'The four of you at the oak. July.'});
  if(C.flags.marked)found.push({id:'court',name:'Old Mill Court',note:'1958. Vacated 1974. Past the oak.'});
  return {carry,found};}
 const inv=createInventory({items,use:id=>{if(id==='notebook'){inv.close();readNotebook();}}});
 // ---- holding something up to look at it (the photograph, a page, the gum): it comes to you, the mouse turns it --------------------
 const holder=new THREE.Group();holder.name='c7-held';
 function inspect(obj,{dist=.42,lines=null,kind='thing',restore=true,spin=0,onClose=null,plane=false}={}){if(C.view)return;
  const prev={parent:obj.parent,pos:obj.position.clone(),q:obj.quaternion.clone(),scale:obj.scale.clone(),visible:obj.visible};
  camera.add(holder);holder.position.set(0,-.02,-dist);holder.rotation.set(0,0,0);holder.add(obj);obj.position.set(0,0,0);obj.quaternion.identity();obj.visible=true;
  if(plane)obj.rotation.set(0,0,0);else obj.rotation.set(.12,spin,0);
  C.view='inspect';C.inspect={obj,prev,kind,restore,onClose,yaw:0,pitch:0,t:0};o.roam.walkLock=true;C.lookKind=kind;if(lines)say(lines);mark('held: '+kind);}
 function endInspect(){const I=C.inspect;if(!I)return;const {obj,prev}=I;holder.remove(obj);
  if(I.restore&&prev.parent){prev.parent.add(obj);obj.position.copy(prev.pos);obj.quaternion.copy(prev.q);obj.scale.copy(prev.scale);obj.visible=prev.visible;}
  holder.removeFromParent();C.view=null;C.inspect=null;C.lookKind=null;if(!posed())o.roam.walkLock=false;const f=I.onClose;f?.();}
 function updateInspect(dt){const I=C.inspect;if(!I)return;I.t+=dt;I.obj.rotation.set(.12+I.pitch,I.yaw,0);}
 // a page (a canvas) on a little card held up
 function pageMesh(cv,{w=.17,h=.225,color=0xfbfaf4}={}){const t=texOf(cv),m=new THREE.MeshBasicMaterial({map:t,color:t?0xffffff:color});const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m));g.userData.tex=t;g.userData.cv=cv;return g;}
 // ---- the map on the kitchen table (the 2009 map; the 1958 plan on tracing paper over it) --------------------------------------
 const MAPV={cv:canvas(MAP.w,MAP.h),plan:planCanvas(),modern:modernCanvas(),overlay:0,cursor:{x:.5,y:.62},mark:null,hint:0};
 const mapTex=texOf(MAPV.cv),mapMesh=new THREE.Mesh(new THREE.PlaneGeometry(.92,.69),new THREE.MeshBasicMaterial({map:mapTex,color:mapTex?0xffffff:0xe8e4d8}));mapMesh.name='c7-maps-on-the-table';mapMesh.visible=false;
 function drawMap(){drawMapView(MAPV.cv,{plan:MAPV.plan,modern:MAPV.modern,overlay:MAPV.overlay,cursor:MAPV.cursor,mark:MAPV.mark,hint:MAPV.hint});if(mapTex)mapTex.needsUpdate=true;}
 // ---- a choice (three things you could say): number keys, shown on the hint row ---------------------------------------------------
 function choose(options,{then,timeout=25,fallback=null}){C.choice={options,then,t:0,timeout,fallback};}
 function pick(i){const ch=C.choice;if(!ch||!ch.options[i])return;C.choice=null;mark('chose: '+ch.options[i].id);ch.then(ch.options[i].id);}
 // ---- how the cast looks (Chapter Six's reconstruction: the same Jamie, the same Reyes; Sam's parents with them) -------------------
 const extraArt=new Map();
 function presentation7(on){for(const v of ch6.appearances6.values())v.enable(on);for(const v of extraArt.values())v.enable(on);}
 // ---- the world as this chapter finds it ----------------------------------------------------------------------------------------
 function common(){document.body?.classList?.add('night1');nav.setTown(true);nav.setPine?.(true);ch5.presentation(true);presentation7(true);lightsOn(true);o.foot.arms=phys.arms;if(!mapMesh.parent)scene.add(mapMesh);}
 function dayWorld(){A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);o.attachFlashlight?.(true);ambient.night?.(false);ambient.morning?.(true);
  for(const a of [...k.adults,...ch2.extra,...Object.values(ch3.people||{})]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  for(const a of [samDad,samMom,cast.jamieMom]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  police.reset?.();k.carA.show(false);k.carB.show(false);ch2.flyers.visible=true;ch2.found.group.visible=false;ch2.tape.visible=false;for(const b of ch2.beams)b.on=false;ch2.samBeam&&(ch2.samBeam.on=false);
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;k.torch.visible=false;S.flashOn=false;o.setFlashlight?.(false,false);
  world.doors.alex?.set(0);world.doors.jamie?.set(0);world.alexWindow.emissiveIntensity=.04;world.garages.sam?.set?.(1);
  // Sam is not here. His bike is in the garage, on its stand.
  sam.gone=true;sam.person.group.visible=false;sam.bike.group.visible=false;comp.release(sam);jamie.gone=false;jamie.person.group.visible=true;radioHand.visible=false;}
 function nightWorld7(){A.day=0;A.night=1;ch2.day=0;o.flashShadow?.(true);o.nightRendering?.(true);ambient.night?.(true);ambient.morning?.(false);}
 // the radio Reyes gives Jamie (channel three), in Jamie's hand when he talks on it
 const radioHand=ch6.props.radioMesh(0x2a2c2a);radioHand.visible=false;jamie.person.parts.rhand.add(radioHand);radioHand.position.set(0,.06,.03);radioHand.rotation.set(-.4,0,0);
 // ---- Act I: the house without Sam ---------------------------------------------------------------------------------------------------
 const HS=house.SPOTS,SH=world.homes.sam;
 const SHW=(x,z,y=0)=>{const p=SH.toWorld(x,z);return {x:p.x,z:p.z,y:p.ground+y};};
 const gxS=SH.gx??(SH.w*.32),gzS=SH.gfront??SH.front;
 const drive=(x,z)=>SHW(gxS+x,gzS+z),driveA=(x,z)=>{const a=drive(x,z),b=drive(x,z+5);return headingTo(a.x,a.z,b.x,b.z);};
 const STEP=SHW(SH.doorX,SH.stepFront+.35),WALK=SHW(SH.doorX,SH.stepFront+6.2),CURB=SHW(SH.doorX+1.5,SH.stepFront+11.5);
 const SD=world.sideDoors.sam,SDOOR={out:SHW(...[SD.outside.x??0,SD.outside.z??0]),in:null};
 const sideDoorAt=(()=>{const A2=SH.sideDoorAt;return A2?{inside:SHW(A2.x-SH.gs*1.0,A2.z),door:SHW(A2.x,A2.z),outside:SHW(A2.x+SH.gs*1.6,A2.z),far:SHW(A2.x+SH.gs*6,A2.z-4)}:null;})();
 void SDOOR;
 // the bikes: yours and Jamie's in Sam's garage since Thursday (his dad put them in); Sam's on its stand
 const samBikeAt=drive(-.6,-4.6),yourBikeAt=drive(1.1,-1.2),jamieBikeAt=drive(-1.5,-1.0);
 const samBike=(()=>{const b=ch6.cast?.samBikeModel;return b||null;})();void samBike;
 function placeOutsideSams(){house.show(true);house.reset();house.show(true);nav.setRoom(null);
  const a=headingTo(CURB.x,CURB.z,STEP.x,STEP.z);o.placePlayer({x:CURB.x,z:CURB.z,a,mode:'walk',bike:{x:yourBikeAt.x,z:yourBikeAt.z,a:driveA(1.1,-1.2)}});
  comp.putFoot(jamie,STEP.x+.4,STEP.z+.2,headingTo(STEP.x,STEP.z,CURB.x,CURB.z),{bike:{x:jamieBikeAt.x,z:jamieBikeAt.z,a:driveA(-1.5,-1),kick:1}});jamie.follow=null;}
 function begin(){fresh();go('c7-black');C.cardT=0;o.fade(1);common();dayWorld();comp.reset();minds();phys.reset();o.foot.arms=phys.arms;objective('');T?.reset?.();C.h=HOUR.start;
  placeOutsideSams();PH.state='four';photoRender();}
 function opening(){go('d7-step');date(C.h);C.fadeIn=0;checkpoint('chapter7-start');C.st={t:0};mark('Sam’s house');
  // Jamie on the step, elbows on his knees (he has been here twenty minutes)
  comp.run(jamie,[phys.sit(jamie,{seat:()=>({x:STEP.x+.3,z:STEP.z+.1,y:STEP.y+.02,a:headingTo(STEP.x,STEP.z,CURB.x,CURB.z)}),h:.36,hands:'knees',until:()=>!!C.flags.jamieUp,look:()=>camera.position})]);
  objective('Sam’s house.','Jamie is on the front step.');
  // the street goes on: a police car across the way, nobody in it; a neighbour on her porch, watching
  const pc=main(SH.drivD-14,6.2),pc2=main(SH.drivD+4,6.2);k.carB.show(true);k.carB.park(pc.x,pc.z,headingTo(pc.x,pc.z,pc2.x,pc2.z));k.carB.lights=false;k.carB.headlights=false;}
 function updateStep(dt){const X=C.st;X.t+=dt;const p=me(),dj=Math.hypot(p.x-STEP.x,p.z-STEP.z);
  if(!X.talk&&(dj<5.2||X.t>40)&&!busy()){X.talk=true;mark('Jamie on the step');
   say([J('Hey.',{face:'tired'}),J('I didn’t know if we were supposed to come.'),J('His mom called my mom at like seven. She wants us here when Reyes comes.'),
    {wait:.6},J('I’ve been out here twenty minutes.',{face:'sad'}),J('I couldn’t knock.',{time:2})],{then:()=>{C.flags.jamieUp=true;X.knock=true;objective('Knock.','The front door.');later(2,()=>{if(!jamie.script)stand(jamie,()=>({x:STEP.x+.9,z:STEP.z-.2}),{look:()=>camera.position,keep:true,max:.8});});}});}
  if(X.knock&&!X.knocked&&X.t>(X.knockT??=X.t+30)){knock();}}
 function knock(){const X=C.st;if(X.knocked)return;X.knocked=true;objective('');sound('tap',STEP,{gain:.9});mark('knock');
  later(2.2,()=>{sound('doorOpen',STEP,{gain:.6});C.fadeOut=0;C.after=()=>{inside();};});}
 function inside(){go('d7-house');house.show(true);nav.setRoom(house.nav);k.carB.show(false);
  const q=HS.enter;o.placePlayer({x:q.x,z:q.z,a:house.heading(Math.PI),mode:'walk',bike:{x:yourBikeAt.x,z:yourBikeAt.z,a:driveA(1.1,-1.2)}});
  comp.reset();const jq=house.toW(DOOR_X()+.7,house.P.depth/2-.15-1.4);comp.putFoot(jamie,jq.x,jq.z,house.heading(Math.PI),{bike:null});follow(true);jamie.follow='walk';
  houseAdults('morning');C.fadeIn=0;C.hs={t:0};mark('inside');
  say([{wait:.6},MOM('Hi, boys. Come in. Shoes are fine.',{face:'tired'}),MOM('There’s juice. I made coffee for the volunteers and then nobody came in.',{time:3.2}),
   MOM('Officer Reyes is coming at ten-thirty. He wants to go over everything again. With you two.',{time:3.6}),{wait:.5},
   DAD('Boys.',{time:1.4}),{wait:.8},DAD('Thank you for coming.',{time:2.2}),{wait:.4},
   MOM('You can wait in his room if you want. I haven’t—',{time:2.4}),MOM('Nothing’s moved. I didn’t want to move anything.',{time:3})],
   {then:()=>{objective('Wait for Officer Reyes.','Sam’s room is down the hall.');C.flags.mayRoom=true;}});}
 const DOOR_X=()=>SH.doorX;
 function houseAdults(when){const tbl=house.SPOTS.kitchenTable;
  samDad.show(true);samMom.show(true);
  if(when==='morning'){const c=HS.couch;samDad.place(c.x,c.z,house.heading(Math.PI));samDad.gest('phone');samDad.lookAt=null;
   const m=house.toW(-1.6,-1.8);samMom.place(m.x,m.z,headingTo(m.x,m.z,HS.enter.x,HS.enter.z));samMom.gest('fold');samMom.lookAt=camera.position;}
  else if(when==='table'){const ch=HS.chairs;samMom.place(ch[2].x,ch[2].z,ch[2].a);samMom.gest('fold');samMom.lookAt=tbl;const d=house.toW(.2,-.3);samDad.place(d.x,d.z,headingTo(d.x,d.z,tbl.x,tbl.z));samDad.gest('fold');samDad.lookAt=tbl;}
  else if(when==='night'){const ch=HS.chairs;samMom.place(ch[1].x,ch[1].z,ch[1].a);samMom.gest('head');samMom.lookAt=tbl;const b=HS.bedEdge;samDad.place(b.x,b.z,house.heading(-Math.PI/2));samDad.gest('fold');samDad.lookAt=HS.fan;}}
 function updateHouse(dt){const X=C.hs;if(!X)return;X.t+=dt;const p=me(),rm=house.room(p.x,p.z);
  if(rm==='sam'&&!C.flags.inRoom)enterRoom();
  if(C.flags.mayRoom&&!C.flags.inRoom&&X.t>70&&!X.nudge&&!busy()){X.nudge=true;say([J('Come on. His room.',{time:1.8})]);stand(jamie,HS.samDoor,{look:()=>HS.samIn,max:1.2});}
  if(C.flags.inRoom)updateRoom(dt);}
 function enterRoom(){C.flags.inRoom=true;checkpoint('c7-bedroom');mark('Sam’s room');C.rm={t:0};T?.set?.(.12,{rise:.02,why:'his room'});
  stand(jamie,()=>({x:HS.samDoor.x+.15,z:HS.samDoor.z}),{look:()=>HS.bed,keep:true,max:.9});
  say([{wait:1.2},J('…It even smells like him.',{face:'sad',time:2.4}),{wait:.8},J('Is that weird? That’s weird.',{time:2})]);
  objective('Sam’s room.','Look around. His dad’s in the hall.');}
 function updateRoom(dt){const X=C.rm;X.t+=dt;
  // after a while Jamie comes in and finds the gum (if you have not taken it to him yourself)
  if(!C.flags.gum&&X.t>(C.flags.notebook?14:55)&&!busy()&&!C.view)gumBeat();
  if(X.fanOffAt!=null&&!X.dadFan&&C.t-X.fanOffAt>2.4)dadAndTheFan();
  // the garage: when the room has had its moment (the notebook and the gum), or after a while anyway
  if(!C.flags.noise&&((C.flags.notebook&&C.flags.gum&&X.t>(X.readyAt??=X.t+10))||X.t>200)&&!busy()&&!C.view&&(!X.dadFan||X.dadDone))garageNoise();// (never while his dad is in the room with the fan)
  if(X.dadFan&&!X.dadDone)updateDadFan(dt);}
 // the fan: you turn it off; his dad comes in from the hall and turns it back on
 function fanOff(){if(!house.ST.fan||phys.playerBusy())return;o.roam.walkLock=true;const f=HS.fan;
  phys.playerReach({at:()=>new THREE.Vector3(f.x,f.y+.2,f.z),dur:[.5,.2,.45],carry:false,onContact:()=>{house.ST.fan=false;sound('click',f,{gain:.5});mark('the fan, off');C.rm.fanOffAt=C.t;C.flags.fanOff=true;},then:()=>{o.roam.walkLock=false;}});}
 function dadAndTheFan(){const X=C.rm;X.dadFan=true;X.df={t:0};const d=HS.samDoor;samDad.show(true);samDad.place(d.x-.9,d.z,house.heading(Math.PI/2));samDad.gest(null);samDad.lookAt=HS.fan;
  const f=HS.fan;samDad.walk([[HS.samIn.x,HS.samIn.z],[f.x-.5,f.z+.3]],{speed:.9,then:a=>{a.faceTo(f.x,f.z);X.df.at=X.df.t;}});}
 function updateDadFan(dt){const X=C.rm,D=X.df;D.t+=dt;
  if(D.at!=null&&!D.on&&D.t-D.at>.8){D.on=true;samDad.gest('point',HS.fan);later(.6,()=>{house.ST.fan=true;sound('click',HS.fan,{gain:.5});mark('his dad turns the fan back on');});
   later(1.4,()=>{samDad.gest(null);say([DAD('He can’t sleep without that.',{time:2.6})],{then:()=>{later(2.6,()=>{samDad.lookAt=null;const h=HS.hall;samDad.walk([[HS.samIn.x,HS.samIn.z],[h.x,h.z]],{speed:.8,then:a=>{a.show(false);X.dadDone=true;}});});}});});
   face(jamie,'sad',6);}}
 // the photograph: hold it
 function lookPhoto(){if(C.view)return;C.flags.photoSeen=true;C.looked.add('photo');const g=house.items.photo;
  const lines=C.flags.altered?[N('July. You, at the oak, with your bike. Sam’s mom took it.',{time:3.6})]
   :[N('July. The four of you at the oak with your bikes. Sam’s mom took it. She made you stand still for five minutes.',{time:4.4}),
     ...(near({x:jamie.px,z:jamie.pz},3.5)?[J('Alex is doing the face.',{time:1.8,face:'amused'}),J('He always did the face.',{time:2,face:'sad'})]:[])];
  inspect(g,{dist:.36,kind:'photo',spin:Math.PI,lines});mark(C.flags.altered?'the photograph, now':'the photograph');}
 // his notebook: read it, keep it
 function readNotebook(){if(C.view)return;const pg=pageMesh(notebookPage(C.flags.names?'names':'notes',{names:'ALEX\nJAMIE\nSAM'}));pg.name='notebook-page';
  const lines=C.flags.names?[N('ALEX. JAMIE. SAM.',{time:2.6})]:[N('Sam’s notebook. His square printing. Times, places, who was there.',{time:3.6}),N('“Why does Line Four bend around nothing? (behind the oak)”',{time:3.6}),
   N('“Culvert goes under a street that isn’t there.”',{time:3}),N('And near the back, one page torn out. Just the stub.',{time:3})];
  inspect(pg,{dist:.3,kind:'notebook',restore:false,plane:true,lines,onClose:()=>{pg.removeFromParent();}});}
 function takeNotebook(){if(C.inv.notebook||phys.playerBusy())return;const n=house.items.notebook;o.roam.walkLock=true;
  phys.playerReach({at:()=>n.getWorldPosition(new THREE.Vector3()),dur:[.45,.15,.4],carry:false,onContact:()=>{n.visible=false;C.inv.notebook='have';C.flags.notebook=true;mark('Sam’s notebook');sound('blinds',HS.notebook,{gain:.3});},
   then:()=>{o.roam.walkLock=false;readNotebook();if(near({x:jamie.px,z:jamie.pz},4))later(.5,()=>say([J('He was gonna show Reyes. He said “everything.”',{time:2.8,face:'sad'})]));}});}
 // the gum: Jamie finds it on the nightstand and keeps it
 function gumBeat(){if(C.flags.gum)return;C.flags.gum=true;mark('the gum');const g=HS.gum;
  stand(jamie,()=>({x:g.x-.55,z:g.z-.35}),{look:()=>g,keep:true,max:.6});
  later(2.2,()=>{comp.run(jamie,[phys.reach(jamie,{at:()=>house.items.gum.getWorldPosition(new THREE.Vector3()),dur:[.6,.25,.55],carry:false,onContact:()=>{house.items.gum.visible=false;C.inv.gum='jamie';sound('c7Gum',g,{gain:.4});}})],
   {then:()=>{stand(jamie,()=>({x:g.x-.6,z:g.z-.5}),{look:()=>camera.position,keep:true,max:.6});
    say([J('…Spearmint.',{time:1.6}),J('He always had gum. He never gave anybody any unless you asked twice.',{time:3.4,face:'amused'}),{wait:.6},J('I’m gonna give it back to him.',{time:2.2,face:'sad'})]);}});});}
 // things in his room (each its own small look)
 const ROOM_LOOKS={
  shelf:[N('Three flashlights. A bag of batteries. A smaller bag of batteries.',{time:3.2}),J('“Batteries for the batteries.” He said that at Pine Ridge.',{time:3,face:'amused'}),J('…I laughed so hard I fell off the dock.',{time:2.6,face:'sad'})],
  games:[N('A stack of game cases. The top one he borrowed from you in June and never gave back.',{time:3.6})],
  helmet:[N('His helmet on the doorknob. He always wore it. He always made you wear yours.',{time:3.4})],
  hoodie:[N('His gray hoodie over the chair, the cuffs chewed.',{time:2.8})],
  fish:[N('A little wooden fish from the Pine Ridge bait shop. The day his dad took you all and nobody caught anything.',{time:4})],
  window:[N('The street. A police car across the way with nobody in it. Mrs. Kowalski on her porch, watching the house.',{time:4})],
  bed:[N('His bed is made. He never made his bed.',{time:2.8})],
 };
 function roomLook(id){if(C.looked.has(id))return;C.looked.add(id);const q=HS[id];closeLook({x:q.x,y:q.y,z:q.z},{back:id==='window'?.75:.6,eye:1.42,kind:id,floor:house.SPOTS.samIn.y});
  const lines=ROOM_LOOKS[id].filter(l=>l.by!=='jamie'||near({x:jamie.px,z:jamie.pz},4));C.lookDur=Math.max(3,lines.reduce((a,l)=>a+(l.time||2.4)+.3,0)+.8);say(lines);mark('looked: '+id);}
 // ---- the garage ------------------------------------------------------------------------------------------------------------------
 function garageNoise(){C.flags.noise=true;go('d7-garage');checkpoint('c7-garage');mark('a noise in the garage');const g=drive(0,-3);
  sound('c6Hit',g,{gain:1.1});later(.35,()=>sound('c6Clank',g,{gain:.8}));later(1.1,()=>sound('c7Drag',g,{gain:.6}));T?.set?.(.32,{rise:.1,why:'the garage'});
  face(jamie,'afraid',5);glance(jamie,g,4);
  say([{wait:1.2},J('What was that?',{time:1.6,face:'afraid'}),J('…Is somebody in the garage?',{time:2.2})],{then:()=>{objective('The garage.','Out the front. The big door is up.');stand(jamie,null);follow(true);jamie.follow='walk';}});
  C.gr={t:0,stage:'go'};}
 function goOutside(){if(C.fadeOut>=0)return;C.fadeOut=0;sound('doorOpen',STEP,{gain:.5});C.after=()=>{nav.setRoom(null);const q=STEP,a=headingTo(STEP.x,STEP.z,CURB.x,CURB.z);
  o.placePlayer({x:q.x+Math.sin(a)*.5,z:q.z-Math.cos(a)*.5,a:a+.9,mode:'walk',bike:{x:yourBikeAt.x,z:yourBikeAt.z,a:driveA(1.1,-1.2)}});
  comp.putFoot(jamie,q.x-.6,q.z,a,{bike:null});follow(true);jamie.follow='walk';C.fadeIn=0;mark('outside');};}
 function updateGarage(dt){const X=C.gr;if(!X)return;X.t+=dt;const p=me();const gIn=Math.hypot(p.x-drive(0,-3).x,p.z-drive(0,-3).z)<4.4;C.inGarage=gIn;
  if(X.stage==='go'&&!inSams(p)&&p.walking){X.stage='yard';}
  if(X.stage==='yard'&&gIn){X.stage='in';X.inAt=X.t;mark('in the garage');creatureInGarage();}
  if(X.stage==='in'){const c=HM.sockets.head.getWorldPosition(new THREE.Vector3());const seen=k.camLooksAt(c,.94)&&dist2(p,c)<10;X.seen=(X.seen||0)+(seen?dt:0);
   if((X.seen>.55||X.t-X.inAt>9)&&!X.go){X.go=true;creatureLeaves(X.seen>.55);}}
  if(X.stage==='after'&&X.afterT!=null&&C.t-X.afterT>2&&!X.dad)garageAfter();}
 function creatureInGarage(){const sd=sideDoorAt;if(!sd)return;const q=sd.inside;H.place(q.x-.4*SH.gs,q.z+.3,headingTo(q.x,q.z,drive(0,1).x,drive(0,1).z));HL.level='g';
  HM.drive.low=.75;HM.setState('crouch');H.setMode('script');H.script([{wait:99,state:'crouch',low:.8,look:()=>camera.position}]);
  world.sideDoors.sam?.set(.25);light(1,{x:sd.inside.x,y:sd.inside.y+2.2,z:sd.inside.z},{intensity:1.6,dist:6,color:0xd8dce4});
  // what it has knocked down: a can on the floor, still rolling
  sound('c7Breath',q,{gain:.5});}
 function creatureLeaves(seen){const X=C.gr,sd=sideDoorAt;mark(seen?'it is seen, and goes':'it goes');T?.set?.(.82,{rise:.5,why:'something in the garage'});X.stage='after';
  // it lowers itself, a long hand flat on the floor, the head round to you; then out, fast, low, through the side door, which bangs
  H.script([{wait:.9,state:'crouch',low:.95,look:()=>camera.position},{act:()=>{HM.drive.reachL=new THREE.Vector3(HM.x+Math.sin(HM.heading)*.6,HM.y+.03,HM.z-Math.cos(HM.heading)*.6);}},{wait:.5,state:'peek',look:()=>camera.position},
   {act:()=>{HM.drive.reachL=null;sound('c7Snarl',{x:HM.x,y:HM.y+1,z:HM.z},{gain:.6});}},{to:[sd.door.x,sd.door.z],speed:5.6,state:'crawl',low:1,free:true,turn:9,look:null},
   {act:()=>{world.sideDoors.sam?.set(1);sound('doorSlam',sd.door,{gain:1.2});sound('c6Clank',sd.door,{gain:.6});}},{to:[sd.outside.x,sd.outside.z],speed:6,state:'crawl',low:1,free:true},{to:[sd.far.x,sd.far.z],speed:6.5,state:'run',low:1,free:true},
   {act:()=>{H.setMode('off');HM.show(false);X.afterT=C.t;light(1,null);}}]);
  later(.3,()=>{face(jamie,'terrified',6);comp.run(jamie,[comp.steps.idle(jamie,.2)],{});});
  later(1.6,()=>say([J('WHAT WAS THAT—',{time:1.3,face:'terrified'}),J('What was THAT? That was a— its ARMS—',{time:2.6,face:'terrified'})]));}
 function garageAfter(){const X=C.gr;X.dad=true;const g=drive(0,1.5);samDad.show(true);samDad.place(g.x,g.z+3,headingTo(g.x,g.z+3,g.x,g.z));samDad.gest(null);
  samDad.walk([[g.x,g.z]],{speed:1.6,then:a=>{a.lookAt=camera.position;}});world.sideDoors.sam?.set(.6);
  say([DAD('What happened? Are you okay?',{time:2}),J('Something was in here! It went out the side!',{time:2.4,face:'afraid'}),{wait:.5},
   {act:()=>{const sd=sideDoorAt;samDad.walk([[sd.inside.x,sd.inside.z]],{speed:1.1,then:a=>{a.faceTo(sd.outside.x,sd.outside.z);}});}},{wait:2.6},
   DAD('…Probably a raccoon. They get in.',{time:2.4}),J('It wasn’t a raccoon.',{time:1.8,face:'determined'}),{wait:1.4},
   {act:()=>{samDad.lookAt=camera.position;}},DAD('Come inside. Officer Reyes is here.',{time:2.4})],{then:()=>{X.done=true;reyesArrives();}});
  const car=main(SH.drivD-9,-3.0),car2=main(SH.drivD+4,-3.0);k.carA.show(true);k.carA.park(car.x,car.z,headingTo(car.x,car.z,car2.x,car2.z));k.carA.lights=false;k.carA.headlights=false;sound('carDoor',car,{gain:.5});}
 // ---- Act II: Reyes at the kitchen table -----------------------------------------------------------------------------------------
 function reyesArrives(){if(C.fadeOut>=0)return;objective('');C.fadeOut=0;C.after=()=>{tableStage();};}
 function tableStage(){go('d7-reyes');checkpoint('c7-reyes');C.hMin=HOUR.reyes;C.h=Math.max(C.h,HOUR.reyes);C.minute=-1;C.inGarage=false;H.setMode('off');HM.show(false);
  world.sideDoors.sam?.set(0);house.show(true);nav.setRoom(house.nav);houseAdults('table');const tbl=HS.kitchenTable,ch=HS.chairs;
  reyes.show(true);reyes.place(ch[1].x,ch[1].z,ch[1].a);reyes.gest('fold');reyes.lookAt=tbl;reyes.y=null;
  const q=house.toW(-1.4,-1.2);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,tbl.x,tbl.z),mode:'walk',bike:{x:yourBikeAt.x,z:yourBikeAt.z,a:driveA(1.1,-1.2)}});
  comp.reset();const jq=house.toW(-2.0,-.6);comp.putFoot(jamie,jq.x,jq.z,headingTo(jq.x,jq.z,tbl.x,tbl.z),{bike:null});stand(jamie,jq,{look:()=>tbl,keep:true,max:.8});
  C.fadeIn=0;C.rx={t:0,stage:'talk'};mark('Reyes');
  say([{wait:1},R('I’m sorry. I don’t have good news. I don’t have any news.',{face:'tired'}),
   R('The county’s divers went through both chambers twice. Public Works walked Line Two with lights as far as a person can walk it.',{time:4.2}),R('Nothing.',{time:1.4}),
   MOM('And the grille.',{time:1.6}),R('The grille was open. It was locked in March. Nobody has a key but Mr. Brandt.',{time:3.6}),{wait:.6},
   R('His mom says Sam was writing everything down. A notebook.',{time:2.8,act:()=>{reyes.lookAt=camera.position;}})],
   {then:()=>{C.rx.stage='notebook';objective(C.inv.notebook==='have'?'Show Officer Reyes Sam’s notebook.':'Sam’s notebook.',C.inv.notebook==='have'?'F, by Reyes.':'It’s on his desk. Bring it.');}});}
 function giveNotebook(){if(C.rx?.stage!=='notebook'||phys.playerBusy())return;C.rx.stage='reading';o.roam.walkLock=true;mark('the notebook to Reyes');
  phys.playerReach({at:()=>reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),dur:[.5,.25,.45],carry:false,then:()=>{o.roam.walkLock=false;}});
  say([{wait:1},R('“Why does Line Four bend around nothing.”',{time:2.4,act:()=>{reyes.gest('phone');}}),{wait:.8},R('“Culvert goes under a street that isn’t there.”',{time:2.6}),{wait:.6},
   R('I asked Brandt for the rest of the sheets this morning. Sheet two came over at nine.',{time:3.4,act:()=>{reyes.gest(null);}}),
   R('Your friend asked a good question. Look at these with me.',{time:2.6,face:'determined'})],{then:()=>{mapStage();}});}
 // the map: lay the plan over the street map, find what is on both, mark where the court began
 function mapStage(){go('d7-map');C.mp={t:0,tries:0,stage:'look',wrong:0};mark('the maps');const tbl=HS.kitchenTable;
  mapMesh.visible=true;mapMesh.position.set(tbl.x,tbl.y+.005,tbl.z);mapMesh.rotation.set(-Math.PI/2,0,house.P.worldRot);MAPV.overlay=.0;MAPV.mark=null;MAPV.hint=0;MAPV.cursor={x:.5,y:.62};drawMap();
  closeLook({x:tbl.x,y:tbl.y,z:tbl.z},{back:.42,eye:1.05,kind:'map',floor:HS.couch.y});C.lookDur=null;
  objective('Find where Old Mill Court was.','Mouse: the pencil · A / D: the 1958 plan · F: mark it');
  say([N('The township’s street map, 2009. And on tracing paper over it, the 1958 storm plan. The same blocks. The same scale.',{time:4.4})]);}
 function mapKey(code){const M=C.mp;if(!M||M.stage!=='look')return false;
  if(code==='KeyA'||code==='ArrowLeft'){MAPV.overlay=Math.max(0,MAPV.overlay-.5);drawMap();M.toggled=true;return true;}
  if(code==='KeyD'||code==='ArrowRight'){MAPV.overlay=Math.min(1,MAPV.overlay+.5);drawMap();M.toggled=true;if(!M.oldSeen&&MAPV.overlay>.9){M.oldSeen=true;mark('the old plan over the new');say([N('On the old plan Oak Hollow Drive doesn’t stop. It goes on past the end of the street, past a tree, into a horseshoe of numbered lots.',{time:4.8}),N('OLD MILL CT. Stamped across it in red: VACATED 1974.',{time:3.2})]);}return true;}
  if(code==='KeyF'){placeMark();return true;}return false;}
 function placeMark(){const M=C.mp;M.tries++;MAPV.mark={...MAPV.cursor};drawMap();sound('c7Pencil',HS.kitchenTable,{gain:.5});
  const d=Math.hypot(MAPV.mark.x-MAP.target.x,(MAPV.mark.y-MAP.target.y)*.75);
  if(d<.075){mapSolved('you');return;}
  M.wrong++;const W=[[J('That’s just— no. Nothing’s different there.',{time:2.2})],[R('Look at the end of Oak Hollow. Where the two don’t match.',{time:2.8})],[MOM('Where the street ends. Where you boys always are.',{time:2.8})]];
  say(W[Math.min(M.wrong-1,W.length-1)]);}
 function updateMap(dt){const M=C.mp;if(!M||M.stage!=='look')return;M.t+=dt;if(busy())return;
  if(M.t>18&&!M.h1){M.h1=true;say([J('The streets don’t line up at the top. Look at the end of Oak Hollow.',{time:3})]);}
  else if(M.t>40&&!M.h2){M.h2=true;say([R('Surveyors drew the trees they meant to keep. Find something that’s on both.',{time:3.4})]);}
  else if(M.t>62&&!M.h3){M.h3=true;MAPV.hint=1;MAPV.overlay=Math.max(MAPV.overlay,.5);drawMap();say([MOM('That’s the oak. Isn’t it? The tree at the end of your street.',{time:3.2,face:'concerned'})]);}
  else if(M.t>95&&!M.h4){M.h4=true;say([J('Here. It’s right here.',{time:1.8})],{then:()=>{MAPV.cursor={...MAP.target};mapSolved('jamie');}});}}
 function mapSolved(who){const M=C.mp;if(M.stage!=='look')return;M.stage='solved';MAPV.mark={...MAP.target};MAPV.overlay=1;drawMap();C.flags.marked=true;C.flags.markedBy=who;mark('Old Mill Court ('+who+')');T?.set?.(.2,{rise:.04,why:'the map'});
  say([{wait:.6},R('…Old Mill Court.',{time:1.8}),J('That’s the lookout. That’s— that’s OUR spot. It went right past the oak.',{time:3.2,face:'surprised'}),
   R('Vacated in seventy-four. They took it out when they put the storm line in.',{time:3.2}),DAD('There’s nothing back there. It’s a field.',{time:2.2}),
   R('Line Four bends around it. Like it’s still there.',{time:2.6}),{wait:.5},MOM('Sam drew that. Look.',{time:1.8,face:'sad'}),N('In his notebook: the end of the street, the oak, and a dotted line going on past it. A question mark.',{time:3.8}),
   {wait:.4},R('In sixty-six and in ninety-one the dogs went down Line Four to the end of the court’s right-of-way and sat down. Both times.',{time:4.4}),R('That doesn’t mean anything.',{time:1.8}),
   J('It means something.',{time:1.8,face:'determined'}),{wait:.8},
   R('I’m going to go look at it this afternoon.',{time:2.2}),J('We’re coming.',{time:1.4}),R('No.',{time:1}),{wait:1.2},
   MOM('…Take them. Please.',{time:2,face:'sad'}),{wait:.6},MOM('He’d want them to go. And I’d rather they were with you than out there by themselves.',{time:3.6}),{wait:1},
   R('Four-thirty. You stay where I can see you. The whole time.',{time:3}),J('The whole time.',{time:1.6}),{wait:.6},
   R('And take this back. It’s his. Keep it safe.',{time:2.4,act:()=>{C.inv.notebook='have';C.flags.notebookBack=true;}})],{then:()=>{endLook();mapMesh.visible=false;M.stage='done';later(1.2,()=>toCurb());}});}
 // ---- that afternoon: the curb ----------------------------------------------------------------------------------------------------
 function toCurb(){if(C.fadeOut>=0)return;objective('That afternoon.','');C.fadeOut=0;C.after=()=>curbStage();}
 function curbStage(){go('d7-curb');checkpoint('c7-curb');C.h=HOUR.curb;C.hMin=HOUR.curb;C.minute=-1;nav.setRoom(null);reyes.show(false);samDad.show(false);samMom.show(false);k.carA.show(false);
  // the two bikes out of the garage, on the driveway; Sam's still in there on its stand (the door up: you can see it)
  const yb=drive(.9,4.6),jb=drive(-1.0,4.9);const q=drive(.2,6.4);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,jb.x,jb.z),mode:'walk',bike:{x:yb.x,z:yb.z,a:driveA(.9,4.6)+Math.PI}});
  comp.reset();const cs=drive(-1.6,7.6);comp.putFoot(jamie,cs.x,cs.z,headingTo(cs.x,cs.z,drive(0,0).x,drive(0,0).z),{bike:{x:jb.x,z:jb.z,a:driveA(-1,4.9)+Math.PI,kick:1}});
  comp.run(jamie,[phys.sit(jamie,{seat:()=>({x:cs.x,z:cs.z,y:gy(cs.x,cs.z)+.02,a:driveA(0,0)+Math.PI}),h:.22,hands:'knees',until:()=>!!C.flags.curbUp,look:()=>drive(0,-2)})]);
  C.fadeIn=0;C.cb={t:0};mark('the curb');house.show(false);
  say([{wait:2.4},J('I keep thinking I’m gonna tell him about this.',{time:2.8,face:'sad'}),J('Like he’s just gonna be at his house later. And I’ll be like, “Dude. You missed it. There was a whole street.”',{time:4.4}),
   J('And he’d say something like, “Technically it’s a court.”',{time:2.6,face:'amused'}),{wait:1.4,act:()=>face(jamie,'sad',6)}],{then:()=>{
    choose([{id:'reassure',label:'“We’re gonna find him.”'},{id:'scared',label:'“I’m scared.”'},{id:'look',label:'“Then let’s go look.”'}],{then:id=>jamieAnswers(id),timeout:25,fallback:'none'});}});}
 function jamieAnswers(id){C.flags.jamieTalk=id;const L={reassure:[{who:'YOU',text:'“We’re gonna find him.”',time:1.8},{wait:.8},J('…Yeah.',{time:1.2}),J('Yeah. We are.',{time:1.8,face:'determined'})],
  scared:[{who:'YOU',text:'“I’m scared.”',time:1.4},{wait:1},J('…Me too.',{time:1.4}),J('Like, all the time now. I’m scared to go to sleep.',{time:2.8,face:'afraid'}),{wait:.8},J('Don’t tell anybody that.',{time:1.8,face:'embarrassed'})],
  look:[{who:'YOU',text:'“Then let’s go look.”',time:1.6},{wait:.6},J('Okay.',{time:1}),J('Okay. Let’s go look.',{time:1.8,face:'determined'})],
  none:[{wait:.6},J('…Anyway.',{time:1.4})]}[id];
  say(L,{then:()=>{C.flags.curbUp=true;later(1.6,()=>reyesAtCurb());}});}
 function reyesAtCurb(){const car=main(SH.drivD-30,-2.6),stop=main(SH.drivD-6,-3.0);k.carA.show(true);k.carA.park(car.x,car.z,headingTo(car.x,car.z,stop.x,stop.z));k.carA.headlights=false;
  k.carA.go([[stop.x,stop.z]],{speed:()=>5});reyes.show(false);mark('Reyes');
  later(4,()=>{reyes.show(true);const q=main(SH.drivD-5,-5.6);reyes.place(q.x,q.z,headingTo(q.x,q.z,camera.position.x,camera.position.z));reyes.lookAt=camera.position;sound('carDoor',q,{gain:.6});
   say([R('It’s at the end of your street. Ride down. I’ll follow you in the car.',{time:3}),J('We’re bringing the bikes. Into wherever it is.',{time:2.4,face:'determined'}),R('Why?',{time:1}),{wait:.4},J('Sam always made us. In case.',{time:2.2}),{wait:1.2},
    R('…Fine. Ride slow. Stay in front of me.',{time:2.4}),R('And Jamie. Channel three. Push to talk. You don’t let go of it.',{time:3,act:()=>{C.inv.radio=true;radioHand.visible=true;later(3,()=>{radioHand.visible=false;});}}),
    J('I won’t.',{time:1.2})],{then:()=>{rideStart();}});});}
 // ---- Act III: down Oak Hollow to the end of the street --------------------------------------------------------------------------
 const LK={stop:main(LOOKOUT.stop.d,LOOKOUT.stop.lat),oak:main(LOOKOUT.oak.d,LOOKOUT.oak.lat),bench:main(LOOKOUT.bench.d,LOOKOUT.bench.lat),chalk:main(LOOKOUT.chalk.d,LOOKOUT.chalk.lat),
  car:main(1129,-3.2),car2:main(1137,-3.6)};
 function rideStart(){go('e7-ride');C.rd={t:0};follow(true);mark('the ride');C.flags.noBikes=false;
  objective('The end of Oak Hollow Drive.','Get on your bike. Reyes follows in the car.');
  // Reyes behind you in the car, slow; he parks at the cul-de-sac when you get there
  reyes.show(false);k.carA.lights=false;k.carA.headlights=true;}
 function updateRide(dt){const X=C.rd;X.t+=dt;const p=me();const car=k.carA;
  if(p.riding&&!X.rolling&&X.t>1){X.rolling=true;car.go([[LK.car.x,LK.car.z]],{speed:()=>{const d=Math.hypot(car.x-p.x,car.z-p.z);return clamp((d-12)*.6,0,7.5);},then:()=>{X.parked=true;}});}
  // (the first thing he ever said to you on a bike, in the Prologue; not a race now)
  if(p.riding&&p.speed>2.2&&X.t>6&&!X.echo&&!busy()){X.echo=true;say([J('Race you to the end of the street.',{time:2.2}),{wait:1.6},J('…That’s what I said on Sunday. Before any of it.',{time:2.8,face:'sad'}),{wait:.8},J('Sam said racing on Oak Hollow was how people got hit by cars.',{time:3,face:'amused'})]);}
  if(near(LK.stop,16)&&!X.there){X.there=true;lookoutStart();}}
 function lookoutStart(){go('e7-lookout');checkpoint('c7-lookout');C.h=Math.max(C.h,HOUR.lookout);C.hMin=HOUR.lookout;mark('the lookout');C.lk={t:0,stage:'arrive'};
  court.attach(true);court.ST.portalA=false;nav.setRoom(court.nav);
  const car=k.carA;if(!car.parked||Math.hypot(car.x-LK.car.x,car.z-LK.car.z)>3){car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));}
  later(1.6,()=>{sound('carDoor',car,{gain:.6});reyes.show(true);const q=main(1131,-5.4);reyes.place(q.x,q.z,headingTo(q.x,q.z,LK.oak.x,LK.oak.z));reyes.gest(null);
   const corner=court.SPOT.curb;reyes.walk([[corner.x,corner.z]],{speed:1.15,then:a=>{a.faceTo(court.SPOT.mouth.x,court.SPOT.mouth.z);a.gest('point',court.SPOT.mouth);C.lk.reyesAt=true;}});});}
 function updateLookout(dt){const X=C.lk;X.t+=dt;const p=me();
  if(X.stage==='arrive'&&X.reyesAt&&!busy()){X.stage='plan';
   say([R('Okay. If this is right, the court started about… there.',{time:2.8}),J('That’s— that’s where we always leave the bikes.',{time:2.4,face:'surprised'}),{wait:.4},
    J('There’s a path. Behind the fence.',{time:1.8}),R('Township right-of-way. It goes down to the creek.',{time:2.4,act:()=>{reyes.gest(null);}}),
    {wait:.6},{who:'DISPATCH',text:'“…Twelve, the county’s asking for you at the Mill Creek works when you’re clear…”',time:3.4,act:()=>{sound('c6Static',reyes.pos,{gain:.5});reyes.gest('radio');}},
    R('Go ahead.',{time:1.2}),{wait:.4},R('Stay where I can see you. Don’t go past the bend.',{time:2.6,act:()=>{reyes.lookAt=camera.position;}})],
    {then:()=>{X.stage='lane';court.ST.portalA=true;objective('Follow the old court.','The path behind the oak. Ride slow.');}});}
  // (the curb in the grass, the post: what there is to look at)
  if(X.stage==='lane'){const L=court.realL(p.x,p.z);
   if(court.inLane(L.x,L.z)&&!p.riding&&L.z>2&&!X.walkWarn){X.walkWarn=true;say([J('Get your bike. Sam always— in case.',{time:2.2})]);}
   if(court.inLane(L.x,L.z)&&!X.reyesIn){X.reyesIn=true;mark('into the lane');const m=court.SPOT.mouth,i=court.SPOT.inLane;reyes.walk([[m.x,m.z],[i.x,i.z]],{speed:.8,then:a=>{a.gest('radio');a.faceTo(court.SPOT.bend1.x,court.SPOT.bend1.z);}});}}}
 // ---- the lane's crossing: you (and Jamie, and your bikes, and the way you came) moved by one translation -------------------------
 function crossing(prev,cur){if(!court.ST.active)return;const P=court.portal(prev.x,prev.z,cur.x,cur.z);if(!P)return;
  const p=me();if(P.to==='A'&&!p.riding&&!C.flags.allowWalkCross)return;// (Act III: with the bike; the boys bring the bikes)
  o.shift?.(P.dx,P.dz,{bike:p.riding});
  for(const pt of comp.trail.pts){pt.x+=P.dx;pt.z+=P.dz;}
  // Jamie, if he is in the lane or close behind you, comes the same way (else he is put right behind you, out of sight)
  const c=jamie;if(c.active&&!c.gone){const jx=c.mode==='ride'?c.bx:c.px,jz=c.mode==='ride'?c.bz:c.pz,close=Math.hypot(jx-prev.x,jz-prev.z)<16;
   if(close){c.bx+=P.dx;c.bz+=P.dz;c.px+=P.dx;c.pz+=P.dz;c.route=null;c.py=null;if(c.bikeY!=null)c.bikeY=null;}
   else{const a=me().a;const q={x:cur.x+P.dx-Math.sin(a)*3,z:cur.z+P.dz+Math.cos(a)*3};if(c.mode==='ride')comp.putRiding(c,q.x,q.z,a,p.speed);else comp.putFoot(c,q.x,q.z,a,{bike:null});}}
  C.lastCross={to:P.to,t:C.t};mark('crossed to '+P.to);
  if(P.to==='A'){court.ST.portalA=false;courtStart();}else if(P.to==='real'){court.ST.portalB=false;outAtTheOak();}}
 // ---- Old Mill Court --------------------------------------------------------------------------------------------------------------
 function courtStart(){go('e7-court');checkpoint('c7-court');C.ct={t:0,stage:'out'};C.h=Math.max(C.h,HOUR.court);reyes.show(false);k.carA.show(false);mark('Old Mill Court');T?.set?.(.3,{rise:.05,why:'the court'});}
 function courtFrame(p=me()){return court.regL(p.x,p.z);}
 function updateCourt(dt){const X=C.ct;X.t+=dt;const p=me(),q=courtFrame(p);
  if(X.stage==='out'&&q.z>27.5&&!busy()){X.stage='radio';X.outAt=X.t;mark('out on the street');
   stand(jamie,null);say([{wait:.8},J('…What.',{time:1.4,face:'shocked'}),J('This isn’t— there’s nothing back here. There’s a field.',{time:2.8,face:'afraid'}),
    {wait:.6,act:()=>{radioHand.visible=true;}},J('Reyes? Officer Reyes. Are you— are you seeing this?',{time:2.8}),{wait:.8},RR('Seeing what? I’m right behind you. I’m in the bend.',{time:2.6,act:()=>sound('c6Static',jamie.person.group.position,{gain:.3})}),
    {wait:4.5},RR('Jamie, where are you? I’m at the end of the path. It’s the field. There’s nobody here.',{time:3.6,act:()=>sound('c6Static',jamie.person.group.position,{gain:.3})}),
    J('We’re on a STREET. There’s houses! We’re right HERE!',{time:2.6,face:'terrified'}),RR('Stay where you are. I’m coming back up the path.',{time:2.4})],
    {then:()=>{X.stage='back';X.backAt=X.t;radioHand.visible=false;objective('The way you came.','Back up the path, to Reyes.');}});}
  if(X.stage==='back'){const F2=court.SPOT.fenceA,df=Math.hypot(p.x-F2.x,p.z-F2.z);
   if(df<3.2&&!X.fence)fenceBeat();
   else if(!X.fence&&X.t-X.backAt>45&&!busy()){X.fence=true;X.jamieFence=true;say([J('I’ll go. Wait— wait here.',{time:1.8})]);follow(false);
    comp.run(jamie,[comp.steps.walkTo(jamie,[[court.SPOT.headA.x,court.SPOT.headA.z],[F2.x,F2.z+2]],{speed:2.4})],{then:()=>{sound('c5WoodStrike',F2,{gain:.8});say([J('It’s a FENCE. There’s a FENCE!',{time:2.2,face:'terrified'})],{then:()=>{follow(true);afterFence();}});}});}}
  if(X.stage==='lost'){
   // the bikes: when you first get off yours here, Jamie leaves his beside it, pointed out
   if(!C.flags.bikesLeft&&p.walking&&me().bike){C.flags.bikesLeft=true;C.bikesAt={x:me().bike.x,z:me().bike.z,a:me().bike.a};mark('the bikes left');if(!busy())say([J('Leave them pointed out. So we can just go.',{time:2.2}),J('Sam always— yeah.',{time:1.6})]);}
   if(!X.dark&&C.h>18.1&&!busy()){X.dark=true;say([J('…Was it this dark? It was like five o’clock.',{time:2.6,face:'worried'})]);}
   // somebody here has a phone: knock (the first door, nothing; the second, somebody comes to it and does not open it)
   if(!X.knockAsk&&X.t-X.lostAt>5&&!busy()&&!C.view){X.knockAsk=true;X.knocks=0;say([J('Somebody’s gotta have a phone. Come on.',{time:2.2}),J('We knock, we say we’re lost. That’s all.',{time:2.4})],{then:()=>{if(X.knocks<2)objective('Find a phone.','Knock on a door. Stay together.');}});}
   if(!X.seenYou&&(X.knocks>=2&&X.t-X.knockedAt>9||X.t-X.lostAt>80)&&Math.hypot(p.x-court.SPOT.fenceA.x,p.z-court.SPOT.fenceA.z)>15&&!busy()){X.seenYou=true;
    say([{act:()=>{radioHand.visible=true;sound('c6Static',jamie.person.group.position,{gain:.35});}},RR('…I can see you. By the fence. Jamie, why are you just standing there? Turn around.',{time:3.6}),
     J('We’re not by any fence. We’re— Reyes, we’re not by a fence.',{time:2.8,face:'afraid'}),{wait:.5,act:()=>sound('c6Static',jamie.person.group.position,{gain:.5})},J('Reyes?',{time:1.2}),{wait:1.6,act:()=>{radioHand.visible=false;}}]);}
   // the house with its lights on (when it is dark enough to see in, or when you come to it)
   const dw=court.SPOT.diningWalk;if(!X.lights&&(C.h>=HOUR.dining-.15||Math.hypot(p.x-dw.x,p.z-dw.z)<16)&&X.seenYou&&!busy()){X.lights=true;C.h=Math.max(C.h,HOUR.dining-.05);
    say([J('There’s people. There’s people in there.',{time:2.2,face:'hopeful'}),J('Maybe they have a phone.',{time:1.8})],{then:()=>{objective('The house with its lights on.','Across the lawn. Its front window.');diningStart();}});}}}
 function fenceBeat(){const X=C.ct;X.fence=true;mark('the fence');T?.set?.(.5,{rise:.15,why:'the fence'});sound('c5WoodStrike',court.SPOT.fenceA,{gain:.9});
  say([J('No. No no no. We just came through here. This was OPEN.',{time:3,face:'terrified'}),{wait:.4,act:()=>sound('c5WoodStrike',court.SPOT.fenceA,{gain:1})},J('REYES!',{time:1.2}),
   {wait:1.2},RR('…I hear something. Keep yelling…',{time:2.2,act:()=>sound('c6Static',jamie.person.group.position,{gain:.4})}),J('REYES! WE’RE HERE!',{time:1.6}),{wait:2.6},N('Nothing. Static.',{time:2})],{then:()=>afterFence()});}
 function knockCourt(id){const X=C.ct,q=court.SPOT.doors[id];if(!q||X.knocking||(X.knocks||0)>=2)return;X.knocking=true;(X.knocked||=new Set()).add(id);X.knocks=(X.knocks||0)+1;mark('knock: '+id);
  sound('tap',q,{gain:1});stand(jamie,()=>({x:q.stand.x+.9,z:q.stand.z}),{look:()=>q,keep:true,max:.8});
  if(X.knocks===1){later(2.4,()=>say([{wait:.6},N('Nothing. Somewhere inside, a television, the sound turned low.',{time:3.4}),J('Hello? …We just need a phone.',{time:2.2}),{wait:1.6},J('Nobody’s coming.',{time:1.6,face:'worried'}),J('Try another one.',{time:1.6})],{then:()=>{X.knocking=false;stand(jamie,null);follow(true);jamie.follow='walk';}}));}
  else{// footsteps inside, coming to the door; they stop on the other side of it; nobody opens it
   for(let i=0;i<6;i++)later(2.2+i*.55,()=>sound(i%2?'thud':'c7Board',q,{gain:.22+i*.05}));
   later(5.6,()=>{T?.set?.(.62,{rise:.2,why:'the door'});say([N('Footsteps inside. Coming to the door.',{time:2.4}),N('They stop on the other side of it.',{time:2.4}),{wait:1.2},J('…Hello?',{time:1.2,face:'afraid'}),{wait:2.4},N('Nobody opens it.',{time:2}),
    J('…There’s somebody right there. Right behind it.',{time:2.6,face:'terrified'}),J('Go. Go, go.',{time:1.4,face:'terrified'})],{then:()=>{X.knocking=false;X.knockedAt=X.t;objective('Find a way back to Reyes.','Stay together.');stand(jamie,null);follow(true);jamie.follow='walk';}});});}}
 function afterFence(){const X=C.ct;if(X.stage==='lost')return;X.stage='lost';X.lostAt=X.t;court.ST.fenceA=true;objective('Find a way back to Reyes.','Stay together.');}
 // the newspaper on the lawn, the '59 sedan, the sign at the head of the street
 function lookNewspaper(){if(C.view)return;C.looked.add('newspaper');const pg=pageMesh(newspaper1966(),{w:.26,h:.34,color:0xe6dcc0});
  inspect(pg,{dist:.38,kind:'newspaper',restore:false,plane:true,onClose:()=>pg.removeFromParent(),lines:[N('The Oak Hollow Courier. Tuesday, August twenty-third, 1966. Dry, not yellow. This morning’s.',{time:4}),
   ...(near({x:jamie.px,z:jamie.pz},5)?[J('Nineteen sixty-six. The girl. From the microfilm. Ruth Ann—',{time:3}),J('August twenty-third.',{time:1.8}),J('That’s the day she—',{time:1.6,face:'afraid'}),{wait:1}]:[])]});mark('the newspaper');}
 function lookCar(){C.looked.add('car');const c=court.cars.fifty9;const w=court.regW(c.x,c.z);closeLook({x:w.x,y:court.G0+1.0,z:w.z},{back:2.4,eye:1.45,kind:'car'});C.lookDur=8;
  say([N('A ’59 sedan, two-tone, chrome like it was polished this morning. A township sticker in the corner of the windshield: 1966.',{time:4.4}),...(near({x:jamie.px,z:jamie.pz},6)?[J('That car’s like… from a movie. Old old.',{time:2.2})]:[])]);}
 // ---- the dining room ---------------------------------------------------------------------------------------------------------------
 function diningStart(){go('e7-dining');C.dn={t:0,stage:'approach',seen:0};mark('the lit window');const D=court.dining,DL=court.houses.dining;
  cast.seatAll(D.seats,{toWorld:(x,z)=>{const c=court.regW(DL.x+Math.cos(DL.a)*x+Math.sin(DL.a)*z,DL.z-Math.sin(DL.a)*x+Math.cos(DL.a)*z);return c;},heading:a=>a-DL.a-court.TH,floorY:court.G0+D.F});cast.show(true);
  D.crack.material.opacity=0;D.tvScreen.emissiveIntensity=.9;court.dining.lamp.visible=true;
  const tb=court.regW(DL.x+Math.cos(DL.a)*D.seats[0].x*.0+Math.sin(DL.a)*(-D.D/2+2.1)+Math.cos(DL.a)*2.3,DL.z-Math.sin(DL.a)*2.3+Math.cos(DL.a)*(-D.D/2+2.1));light(0,{x:tb.x,y:court.G0+D.F+2.25,z:tb.z},{intensity:2.6,dist:7,color:0xffcf90});}
 function updateDining(dt){const X=C.dn;if(!X)return;X.t+=dt;const p=me(),W2=court.SPOT.diningWindow;const D=court.dining;
  D.tvScreen.emissiveIntensity=.55+.35*Math.abs(Math.sin(C.t*7.3))*(.6+.4*Math.sin(C.t*1.7));LIGHTS[0].intensity=(2.2+.5*Math.sin(C.t*7.3))*(X.stage==='done'?1:1);
  const d=Math.hypot(p.x-W2.x,p.z-W2.z);const looking=k.camLooksAt(W2,.9)&&d<6.5;X.seen+=looking?dt:0;
  if(X.stage==='approach'){if(d<9&&!X.jamieNear){X.jamieNear=true;stand(jamie,()=>{const a=headingTo(W2.x,W2.z,p.x,p.z);return {x:W2.x+Math.sin(a)*3.4+Math.cos(a)*1.1,z:W2.z-Math.cos(a)*3.4+Math.sin(a)*1.1};},{look:()=>W2,keep:true,max:.8});}
   if((X.seen>1.2||(d<7&&X.t>40))&&!busy()){X.stage='still';X.stillAt=X.t;mark('the family at the table');T?.set?.(.45,{rise:.05,why:'the window'});
    say([J('Hey. Hey— excuse me—',{time:1.6}),{wait:1.6},J('…They’re not moving.',{time:1.8,face:'worried'}),{wait:1},J('Why aren’t they moving.',{time:1.8,face:'afraid'})],{then:()=>{X.stage='turn';cast.turnHeads(()=>camera.position,['mother','girl','boy','father'],1.0);X.turnAt=X.t;}});}}
  if(X.stage==='turn'&&X.t-X.turnAt>4.6){X.stage='lunge';const D2=court.dining,DL=court.houses.dining;const n={x:Math.sin(DL.a+court.TH)*0,z:0};void n;
   // the window's outward normal in the world: the dining house's front faces its -z, turned by the house and the court
   const fr=court.regW(DL.x+Math.sin(DL.a)*-1,DL.z+Math.cos(DL.a)*-1),cen=court.regW(DL.x,DL.z),nx=fr.x-cen.x,nz=fr.z-cen.z,nl=Math.hypot(nx,nz);
   cast.lunge({x:W2.x,y:W2.y,z:W2.z},{x:nx/nl,z:nz/nl},{onHit:()=>windowHit()});mark('it comes at the glass');}
  if(X.stage==='after'&&!X.examined&&X.t-X.hitAt>4&&!busy()){X.examined=true;say([J('Don’t. Don’t look at them. Don’t look at them.',{time:2.6,face:'terrified'})],{then:()=>{objective('Get away from the window.','');}});}
  if(X.stage==='after'&&!X.radio&&(X.t-X.hitAt>16||d>11)&&!busy()&&!C.view){X.radio=true;samOnTheRadio();}}
 function windowHit(){const X=C.dn;X.stage='after';X.hitAt=X.t;const D=court.dining,W2=court.SPOT.diningWindow;D.crack.material.opacity=1;C.flags.windowHit=true;
  sound('c7Glass',W2,{gain:1.4});sound('c6Hit',W2,{gain:.8});o.foot.land=.07;T?.set?.(.96,{rise:.7,why:'the window'});mark('the glass');X.shake=.5;
  later(.2,()=>{face(jamie,'terrified',6);comp.run(jamie,[comp.steps.walkTo(jamie,[[jamie.px+(jamie.px-W2.x)*.35,jamie.pz+(jamie.pz-W2.z)*.35]],{speed:2.6})],{then:()=>{stand(jamie,()=>({x:jamie.px,z:jamie.pz}),{look:()=>W2,keep:true,max:.4});}});});
  later(.5,()=>say([J('JESUS— go, GO—',{time:1.4,face:'terrified'})]));}
 // ---- Act IV: the house with the green door --------------------------------------------------------------------------------------------
 const HGd=court.HG,HW=(hx,hz,lv='g')=>court.H3(hx,hz,null,lv);
 const houseLocal=(x,z)=>{const q=court.regL(x,z);return court.cToH(q.x,q.z);};
 function samOnTheRadio(){go('e7-house');C.gh={t:0,stage:'radio'};mark('Sam on the radio');radioHand.visible=true;sound('c6Static',jamie.person.group.position,{gain:.5});
  // (it is upstairs, walking, before anyone sees it: you hear it in the house across the street when you get to the door)
  creatureUpstairs();
  say([{who:'SAM (RADIO)',text:'“…guys? Guys, it’s me.”',time:2.4,act:()=>sound('c6Static',jamie.person.group.position,{gain:.4})},J('SAM? SAM!',{time:1.4,face:'shocked'}),
   {who:'SAM (RADIO)',text:'“I’m in the house. The one with the green door. Upstairs. Hurry—”',time:3.4},{wait:.4,act:()=>sound('c6Static',jamie.person.group.position,{gain:.6})},
   J('The green door—',{time:1.4}),{wait:.8},J('It did that before. With Reyes’s voice. With Sam’s.',{time:2.6,face:'afraid'}),J('…I know. I know.',{time:1.6}),{wait:.6},J('But what if it’s him.',{time:2,face:'hopeful'})],
   {then:()=>{radioHand.visible=false;C.gh.stage='door';objective('The house with the green door.','Across the street. Upstairs, he said.');}});}
 function creatureUpstairs(){HGd.doors.boy.set(.85);HGd.doors.store.set(.8);HGd.doors.parents.set(.75);/* (upstairs the doors stand open: it has been walking through them) */HL.level='u';const a=HW(-3.2,2.2,'u'),b=HW(-.6,3.6,'u'),c2=HW(3.4,-2.6,'u');H.place(a.x,a.z,0);HM.drive.low=.35;
  const loop=()=>H.script([{to:[b.x,b.z],speed:.7,state:'stalk',low:.35},{wait:1.4,state:'idle'},{to:[c2.x,c2.z],speed:.7,state:'stalk'},{wait:2,state:'idle'},{to:[b.x,b.z],speed:.7,state:'stalk'},{to:[a.x,a.z],speed:.7,state:'stalk'},{wait:2.4,state:'idle'}],{then:()=>{if(C.gh&&!C.gh.revealed)loop();}});loop();}
 function updateGreen(dt){const X=C.gh;if(!X)return;X.t+=dt;const p=me(),q=houseLocal(p.x,p.z),inH=court.inHouseAt(p.x,p.z);
  if(X.stage==='door'){const dr=court.SPOT.greenDoor;if(Math.hypot(p.x-dr.x,p.z-dr.z)<3.4&&!X.atDoor){X.atDoor=true;
    stand(jamie,()=>({x:dr.x,z:dr.z}),{look:()=>HW(0,-1.5),keep:true,max:.5});
    say([J('It’s stuck—',{time:1.2}),{wait:.6,act:()=>sound('c5WoodStrike',dr,{gain:.8})},J('It’s— hang on—',{time:1.2}),{wait:.5,act:()=>{sound('c5WoodStrike',dr,{gain:1});X.opening=0;}}],{then:()=>{stand(jamie,null);follow(true);jamie.follow='walk';}});}
   if(X.opening!=null&&X.opening<1){X.opening=Math.min(1,X.opening+dt*1.6);HGd.doors.front.set(X.opening);}
   if(inH&&!X.inside){X.inside=true;go('e7-house');checkpoint('c7-house');X.stage='in';X.inAt=X.t;mark('inside the green-door house');lightsGreen();
    // footsteps overhead; Jamie: "Sam?"; they stop
    later(1.6,()=>say([J('Sam?',{time:1.2}),{wait:1.4,act:()=>{if(!X.revealed)H.script([{wait:99,state:'idle',look:()=>camera.position}]);X.stopped=true;}},N('The footsteps overhead stop.',{time:2})]));}}
  if(X.stage==='in'){// the door swings shut behind them on its own weight, and sticks
   if(X.t-X.inAt>4&&!X.shut){X.shut=true;X.closing=1;}
   if(X.closing!=null&&X.closing>0){X.closing=Math.max(0,X.closing-dt*.55);HGd.doors.front.set(X.closing);if(X.closing===0){sound('click',HW(0,-4.4),{gain:.6});later(1,()=>say([J('…It’s stuck again.',{time:1.8,face:'afraid'})],{then:()=>{objective('Upstairs.','Sam said upstairs.');}}));}}
   const foot=HGd.spots.stairFoot,dF=Math.hypot(q.x-foot.x,q.z-foot.z);const top=HW(0,2.9,'u');top.y+=1.4;
   // (only once the footsteps have stopped: it is waiting up there, and it knows you are in the house)
   if(X.stopped&&((dF<1.8&&k.camLooksAt(top,.86))||X.t-X.inAt>45)){if(!X.revealed&&!busy())reveal();}}}
 function lightsGreen(){const L=HGd.lamps;light(1,HW(L.living.x,L.living.z),{intensity:1.8,dist:6,color:0xffc890});LIGHTS[1].position.y=court.G0+L.living.y;
  light(2,HW(L.kitchen.x,L.kitchen.z),{intensity:1.4,dist:6,color:0xe8eef0});LIGHTS[2].position.y=court.G0+L.kitchen.y;
  light(3,HW(L.boy.x,L.boy.z,'u'),{intensity:1.6,dist:6,color:0xffd0a0});LIGHTS[3].position.y=court.G0+L.boy.y;HGd.tvScreen.emissiveIntensity=.7;}
 // the reveal: at the top of the stairs, a hand round the doorframe, a shoulder, the head turns, the body follows; it comes down
 function reveal(){const X=C.gh;X.revealed=true;go('e7-reveal');mark('the hand round the doorframe');T?.set?.(.7,{rise:.2,why:'the stairs'});HL.level='u';
  const frame=HW(-HH.UCX-.05,2.86,'u'),hide=HW(-HH.UCX-.8,3.3,'u'),landing=HW(0,3.0,'u'),top=HW(0,2.5,'u'),bottom=HW(0,-2.0,'g');
  H.place(hide.x,hide.z,headingTo(hide.x,hide.z,landing.x,landing.z));HM.show(true);
  const fr={x:frame.x,y:frame.y+1.55,z:frame.z};
  H.script([{wait:.9,state:'peek',low:.3,reach:()=>fr,look:()=>landing},{wait:1.1,state:'peek',reach:()=>fr,look:()=>camera.position,act:null},
   {act:()=>sound('c7Board',landing,{gain:.9})},{to:[frame.x,frame.z],speed:.5,state:'stalk',low:.3,look:()=>camera.position,reach:()=>fr,free:true},
   {act:()=>{HM.drive.reach=null;}},{to:[landing.x,landing.z],speed:.6,state:'stalk',look:()=>camera.position,free:true},{wait:2.2,state:'idle',look:()=>camera.position},
   {act:()=>{sound('c7Breath',landing,{gain:1});}},{to:[top.x,top.z],speed:.6,state:'stalk',free:true,look:()=>camera.position,sound:'c7Board'},
   {to:[bottom.x,bottom.z],speed:.72,state:'stalk',free:true,look:()=>camera.position,keepY:false},{act:()=>{HL.level='g';}},{wait:.6,state:'alert',look:()=>camera.position}],{then:()=>bottomOfStairs()});
  // the treads, one at a time, as it comes down
  for(let i=0;i<9;i++)later(6.6+i*.62,()=>sound(i%2?'c7Step':'c7Board',HM.sockets.hips.getWorldPosition(new THREE.Vector3()),{gain:.9}));
  face(jamie,'terrified',10);
  say([{wait:1.4},J('…Oh my god.',{time:1.6,face:'terrified'}),{wait:2},J('Oh my god oh my god—',{time:1.8}),{wait:1.2},J('Back. Back, back—',{time:1.6})],{then:()=>{X.hideNow=true;objective('Hide.','Through the dining room. The kitchen. F: hide.');jamieHides();}});}
 const JPANTRY={x:4.62,z:4.12};// (Jamie's place in the pantry: at the back, beside where you crouch)
 function jamieHides(){const P2=HW(JPANTRY.x,JPANTRY.z),door=HW(4.15,2.7);stand(jamie,null);follow(false);
  comp.run(jamie,[comp.steps.walkTo(jamie,[[HW(2.4,-2.6).x,HW(2.4,-2.6).z],[HW(3.4,-.3).x,HW(3.4,-.3).z],[door.x,door.z],[P2.x,P2.z]],{speed:3.2})],{then:()=>{jamie.crouch=.3;C.jHide='pantry';stand(jamie,P2,{look:()=>camera.position,keep:true,max:.3});}});}
 function bottomOfStairs(){const p=me(),d=Math.hypot(p.x-HM.x,p.z-HM.z);
  // you stood and watched it all the way down: it has you (the stealth's own checkpoint is where you go back to)
  if(d<4.2&&!C.hiding&&!sightBlockedToPlayer()){H.setTargets([playerTarget()]);H.hear({x:p.x,z:p.z},2);H.setMode('pursue');H.chasing=playerTarget();H.lastSeenT=H.t;H.meter.set('player',1.2);stalkStart({live:true});return;}
  stalkStart({live:true});}
 const sightBlockedToPlayer=()=>{const e=HM.eye(new THREE.Vector3()),c=camera.position;return !sightClear(e.x,e.y,e.z,c.x,c.y,c.z);};
 // ---- the stealth: it walks the rooms; get past it to the stairs ------------------------------------------------------------------------
 const playerTarget=(()=>{let T0=null;return ()=>T0||(T0={id:'player',pos:()=>camera.position,crouch:()=>clamp(o.foot.crouch||0,0,1),hidden:()=>!!C.hiding,watchedIn:()=>!!C.hideSeen,moving:()=>me().speed||0,lit:()=>litAt(camera.position),catchable:true});})();
 const jamieTarget=(()=>{let T0=null;return ()=>T0||(T0={id:'jamie',pos:()=>{const p=jamie.person.parts.head.getWorldPosition(new THREE.Vector3());return p;},crouch:()=>clamp((jamie.crouch||0)*3,0,1),hidden:()=>C.jHide==='pantry'&&Math.hypot(jamie.px-HW(JPANTRY.x,JPANTRY.z).x,jamie.pz-HW(JPANTRY.x,JPANTRY.z).z)<.8,moving:()=>jamie.walkV||0,lit:()=>.7,catchable:true});})();
 function litAt(q){let s=.35;for(const l of LIGHTS){if(l.intensity<=0)continue;const d=l.position.distanceTo(q);s+=l.intensity*.25/(1+d*d*.3);}return clamp(s,0,1);}
 function houseGraph(){const G=HGd.graph;return {nodes:G.nodes.map(n=>{const w=HW(n.x,n.z);return {...n,x:w.x,z:w.z};}),edges:G.edges};}
 function stalkStart({live=false}={}){go('e7-stalk');if(!live)checkpoint('c7-stalk');else checkpoint('c7-stalk');C.sk={t:0,stage:'hunt',helped:false,caught:false};mark('it is hunting');
  HL.level='g';C.lv='g';court.ST.level='g';C.jlv='g';H.setGraph(houseGraph());H.setTargets([playerTarget(),jamieTarget()]);H.catchR=1.25;H.runSpeed=C.fails.stalk>=2?3.5:4.0;H.sightRange=C.fails.stalk>=2?11:13.5;
  if(H.mode!=='pursue'){const loop=HGd.graph.loop;H.patrol(loop);H.patrolI=1;}
  H.onCatch=T2=>caught(T2);H.onSpot=T2=>{mark('it saw '+T2.id);if(T2.id==='player'&&!C.sk.helped&&C.sk.t>3)jamieHelps();else if(T2.id==='jamie')jamieSeen();};
  objective('Get upstairs without it seeing you.','It walks the rooms. Go the other way round. F: hide.');
  if(C.fails.stalk>=1)later(2,()=>say([J(C.fails.stalk>=2?'Wait for it. When it goes in the den— when you hear it in there— go. Dining room, then the stairs.':'It goes round. Like a circle. When it’s on the other side, we go.',{time:3.4})]));
  else later(3,()=>say([J('It goes round. Like a circle. When it’s on the other side, we go.',{time:3,face:'terrified'})]));}
 function jamieHelps(){const X=C.sk;X.helped=true;mark('Jamie throws a can');const far=HW(-3.4,1.8);
  later(.5,()=>{sound('c6Clank',far,{gain:1.1});sound('c5WoodStrike',far,{gain:.6});H.hear({x:far.x,z:far.z},3,{id:'a can, thrown',force:true});});
  later(.9,()=>say([J('GO!',{time:1})]));}
 function jamieSeen(){mark('it saw Jamie');face(jamie,'terrified',4);}
 function caught(T2){const X=C.sk||C.ch;if(!X||X.caught)return;X.caught=true;const which=C.sk?'stalk':'chase';C.fails[which]++;const fails={...C.fails};mark('caught ('+T2.id+')');sound('c7Strike',camera.position,{gain:1.4});T?.set?.(1,{rise:1,why:'caught'});
  // a short, physical end: it is on you, the view goes over, black
  const p=me();pose({x:p.x,z:p.z},{y:camera.position.y-.9,yaw:p.a+.6,pitch:-.9,slow:.25});o.fade(1);C.capturedT=0;
  say([N(T2.id==='jamie'?'It has Jamie.':'It has you.',{time:2.4})]);
  later(2.6,()=>{const sec=which==='stalk'?'c7-stalk':'c7-bikes';jumpTo(sec);Object.assign(C.fails,fails);C.fadeIn=0;o.fade(1);mark('again: '+sec);if(which==='stalk'){H.runSpeed=C.fails.stalk>=2?3.5:4.0;H.sightRange=C.fails.stalk>=2?11:13.5;}});}
 function updateStalk(dt){const X=C.sk;if(!X||X.caught)return;X.t+=dt;const p=me(),q=houseLocal(p.x,p.z);
  // sprinting is heard; doors are heard
  if((me().speed||0)>3.2&&(o.foot.crouch||0)<.3){X.noiseT=(X.noiseT||0)+dt;if(X.noiseT>.6){X.noiseT=0;H.hear({x:p.x,z:p.z},.9,{id:'running'});}}
  // Jamie: in the pantry until you go; then right behind you (crouched), never in front
  if(C.jHide==='pantry'&&!C.hiding&&Math.hypot(q.x-HGd.hides.pantry.x,q.z-HGd.hides.pantry.z)>2.2&&!X.jamieOut&&H.mode!=='pursue'){X.jamieOut=true;C.jHide=null;stand(jamie,()=>{const a=me().a;return {x:p.x-Math.sin(a)*1.4,z:p.z+Math.cos(a)*1.4};},{look:()=>({x:HM.x,y:HM.y+1.6,z:HM.z}),keep:true,max:.6});jamie.crouch=.25;}
  // up the stairs and off the top: the room at the top of the stairs
  if(C.lv==='u'&&q.z>2.4&&!X.up){X.up=true;mark('upstairs');H.setTargets([]);doorStart();}}
 // hiding (a closet, the pantry): in, the door nearly shut; out
 function hide(id){const h=HGd.hides[id];if(!h||C.hiding)return;const w=HW(h.x,h.z),room=HW(h.x>0?2.4:-2.6,h.x===0?3.75:2.2);C.hiding=id;C.hideSeen=(H.meter.get('player')||0)>.55;mark('hid: '+id);
  o.placePlayer({x:w.x,z:w.z,a:headingTo(w.x,w.z,room.x,room.z),mode:'walk',bike:me().bike?{x:me().bike.x,z:me().bike.z,a:me().bike.a}:null});
  const d=HGd.doors[h.door];if(d){d.set(.12);sound('creak',w,{gain:.4});}o.foot.crouch=.4;}
 function unhide(){const id=C.hiding;if(!id)return;const h=HGd.hides[id],d=HGd.doors[h.door];if(d){d.set(.9);sound('creak',HW(h.x,h.z),{gain:.5});H.hear(HW(h.x,h.z),.55,{id:'a door'});}C.hiding=null;C.hideSeen=false;mark('out of hiding');}
 // the room at the top: shut the door, the dresser, and it comes and hammers on it
 function doorStart(){go('e7-door');C.dr={t:0,stage:'in'};objective('The room at the top of the stairs. Shut the door.','On the left, at the top.');
  // Jamie comes up after you (it is on the far side: it does not see him)
  const top=HW(0,3.1,'u'),boy=HW(-2.6,2.2,'u');C.jHide=null;
  comp.run(jamie,[comp.steps.walkTo(jamie,[[HW(2.6,-1.5).x,HW(2.6,-1.5).z],[HW(1.6,-2.6).x,HW(1.6,-2.6).z],[HW(0,-2.2).x,HW(0,-2.2).z],[HW(0,2.7).x,HW(0,2.7).z],[top.x,top.z],[boy.x,boy.z]],{speed:2.8})],
   {then:()=>{C.jlv='u';jamie.crouch=0;stand(jamie,boy,{look:()=>HW(-HH.UCX,3.3,'u'),keep:true,max:.6});}});C.jStair=true;}
 function shutDoor(){const X=C.dr;if(X.shut)return;X.shut=true;X.closing=1;mark('the door, shut');sound('doorSlam',HW(-HH.UCX,3.3,'u'),{gain:.5});
  H.hear(HW(-HH.UCX,3.3,'u'),5,{id:'a door shut'});objective('The dresser.','Against the door. F.');
  later(.8,()=>say([J('The dresser— help me—',{time:1.6,face:'terrified'})]));later(5,()=>{if(!X.pushed)pushDresser('jamie');});}
 function pushDresser(who){const X=C.dr;if(X.pushed)return;X.pushed=true;X.pushT=0;mark('the dresser ('+who+')');sound('c7Furniture',HW(-HH.UCX-.4,2.0,'u'),{gain:.9});
  // (Jamie behind it, shoving, as it goes: then against it, holding)
  stand(jamie,()=>{const d=HGd.dresser.position;return HW(d.x,d.z-.82,'u');},{look:()=>HW(-HH.UCX-.4,3.3,'u'),keep:true,max:.3});objective('Hold it.','');
  // it comes up: the stairs, the door, the hits
  later(2.2,()=>{HL.level='g';const foot=HW(0,-2.0),top=HW(0,2.4,'u'),door=HW(-HH.UCX+.6,3.3,'u');H.setMode('script');HM.show(true);
   H.script([{to:[foot.x,foot.z],speed:2.6,state:'run',low:.6},{to:[top.x,top.z],speed:2.0,state:'walk',low:.3,free:true},{act:()=>{HL.level='u';}},{to:[door.x,door.z],speed:1.4,state:'walk',low:.3,free:true},
    {face:[HW(-2,3.3,'u').x,HW(-2,3.3,'u').z]},{wait:.8,state:'idle',look:()=>HW(-2,3.3,'u')},
    {act:()=>hitDoor(1)},{wait:1.6,state:'hit',reach:()=>HW(-HH.UCX-.05,3.3,'u'),reachL:null},{act:()=>hitDoor(2)},{wait:2.2,state:'hit'},{act:()=>{sound('c7Drag',HW(-HH.UCX,3.3,'u'),{gain:.8});}},{wait:3,state:'idle',reach:null},
    {to:[top.x,top.z],speed:1.0,state:'walk',free:true},{act:()=>{HL.level='g';}},{to:[foot.x,foot.z],speed:1.0,state:'walk',free:true},{act:()=>{HGd.doors.front.set(1);sound('doorOpen',HW(0,-4.4),{gain:.8});}},
    {to:[HW(0,-6).x,HW(0,-6).z],speed:1.2,state:'walk',free:true},{to:[court.SPOT.greenRoad.x,court.SPOT.greenRoad.z],speed:1.3,state:'stalk'},{wait:1.6,state:'idle',look:()=>HW(-3,4.5,'u')},
    {to:()=>{const b=C.bikesAt||{x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z};return [b.x,b.z];},speed:2.2,state:'walk',low:.3},{act:()=>{H.setMode('off');HM.show(false);X.gone=true;mark('it has gone up the street');}}]);});}
 function hitDoor(n){const X=C.dr,d=HGd.doors.boy;X.hit=n;X.shakeT=.45;sound('c7Door',HW(-HH.UCX,3.3,'u'),{gain:1.3+.2*n});T?.set?.(1,{rise:.8,why:'the door'});o.foot.land=.05;
  const dr=HGd.dresser;HGd.moveDresser(dr.position.x+.05*n,dr.position.z-.02,dr.rotation.y);mark('the door, hit '+n);
  if(n===1)later(.4,()=>say([J('HOLD IT— hold it—',{time:1.6,face:'terrified'})]));}
 function updateDoor(dt){const X=C.dr;if(!X)return;X.t+=dt;const d=HGd.doors.boy;
  if(X.closing!=null&&X.closing>0){X.closing=Math.max(0,X.closing-dt*2.4);d.set(X.closing);}
  if(X.shakeT>0){X.shakeT-=dt;d.pivot.rotation.y=-Math.PI/2+Math.sin(C.t*60)*.03*(X.shakeT/.45);}
  if(X.pushed&&X.pushT<1){X.pushT=Math.min(1,X.pushT+dt/1.5);const a=smooth(X.pushT),s0=HGd.spots.dresserStart,s1=HGd.spots.dresserBlock;HGd.moveDresser(s0.x+(s1.x-s0.x)*a,s0.z+(s1.z-s0.z)*a,Math.PI/2);}
  if(X.gone&&!X.after&&!busy()){X.after=true;say([{wait:1.4},J('…It’s going up the street.',{time:2}),J(C.bikesAt?'It’s going toward the bikes.':'It’s just— walking. Like it lives here.',{time:2.2,face:'afraid'})],{then:()=>upstairsStart()});}}
 // ---- upstairs: what is up here ---------------------------------------------------------------------------------------------------------
 function upstairsStart(){go('e7-upstairs');checkpoint('c7-clues');C.up={t:0};
  // (Jamie drags the dresser off the door again, and opens it: they listen; nothing)
  sound('c7Furniture',HW(-HH.UCX-.4,2.8,'u'),{gain:.6});C.up.unblock=0;mark('upstairs');T?.set?.(.4,{rise:-.3,why:'quiet'});objective('Look around. Quietly.','A boy’s room. The hall. The other rooms.');
  stand(jamie,null);follow(true);jamie.follow='walk';}
 function updateUpstairs(dt){const X=C.up;if(!X)return;X.t+=dt;
  if(X.unblock!=null&&X.unblock<1){X.unblock=Math.min(1,X.unblock+dt/1.6);const a=smooth(X.unblock),s0=HGd.spots.dresserBlock,s1=HGd.spots.dresserAfter;HGd.moveDresser(s0.x+(s1.x-s0.x)*a,s0.z+(s1.z-s0.z)*a,Math.PI/2);if(X.unblock>=1)HGd.doors.boy.set(.85);}
  const found=['calendar','trace','oldbike'].filter(k2=>C.looked.has(k2)).length;
  if(!X.down&&(found>=3||X.t>150)&&!busy()&&!C.view){X.down=true;objective('Find a way down.','The window at the end of the hall. The porch roof.');say([J('Here— the window. The porch roof. We climb out and drop.',{time:2.8})]);}}
 function lookCalendar(){if(C.view)return;C.looked.add('calendar');const pg=pageMesh(calendar1991(),{w:.21,h:.27,color:0xf0ece0});
  inspect(pg,{dist:.36,kind:'calendar',restore:false,plane:true,onClose:()=>pg.removeFromParent(),lines:[N('August 1991. Somebody crossed off every day up to the twenty-first. Then nothing.',{time:4}),
   ...(near({x:jamie.px,z:jamie.pz},5)?[J('Nineteen ninety-one…',{time:1.6}),J('August twenty-first. That’s the same day as—',{time:2.4,face:'afraid'}),{wait:.8},J('Whose room is this?',{time:1.8})]:[])]});mark('the calendar');}
 function lookTrace(){if(C.view)return;C.looked.add('trace');C.flags.trace=true;const pg=pageMesh(samPage(),{w:.17,h:.225,color:0xece4c4});
  inspect(pg,{dist:.3,kind:'trace',restore:false,plane:true,onClose:()=>pg.removeFromParent(),lines:[N('A page from a spiral notebook, on the desk. Sam’s square printing. Yellow and soft, like it has been lying here for years.',{time:4.6}),
   J('That’s his. That’s his WRITING.',{time:2,face:'shocked'}),J('“Batteries for the batteries.” That’s HIS joke—',{time:2.6,face:'hopeful'}),...(C.inv.notebook==='have'?[N('The torn edge looks like the stub in his notebook. Almost.',{time:3.2})]:[]),
   {wait:1},J('…It could do that. It did his voice. It could do his writing.',{time:3.2,face:'afraid'}),J('…It’s old. Look at it. How is it old.',{time:2.6})]});mark('Sam’s page');}
 function lookOldBike(){C.looked.add('oldbike');const b=HW(-3.6,-2.5,'u');closeLook({x:b.x,y:b.y+.6,z:b.z},{back:1.2,eye:1.42,kind:'oldbike',floor:b.y});C.lookDur=11;
  say([N('The old green bike. The Meadowlark. Leaning against the boxes, wet, a puddle spreading under it on the boards.',{time:4.4}),N('The township sticker on the frame: OAK HOLLOW TWP. 0417. And scratched into the paint, A R.',{time:3.8}),
   ...(near({x:jamie.px,z:jamie.pz},5)?[J('Why is it always where we are.',{time:2.2,face:'afraid'})]:[])]);mark('the old bike');}
 function ringOldBell(){C.flags.bell=true;const b=HW(-3.6,-2.5,'u');const a=o.audio?.();a?.bell?.({x:b.x,y:b.y+1,z:b.z},.9);later(.32,()=>a?.bell?.({x:b.x,y:b.y+1,z:b.z},.9));sound('oldBell',{x:b.x,y:b.y+1,z:b.z},{gain:.2});mark('the bell rings');T?.set?.(.6,{rise:.2,why:'the bell'});
  say([N('It rings. Clear. Twice.',{time:2.4}),...(near({x:jamie.px,z:jamie.pz},6)?[J('…It doesn’t ring. It’s never rung. It CLICKS.',{time:2.8,face:'terrified'}),J('Don’t touch it again.',{time:1.8})]:[])]);}
 function lookWedding(){C.looked.add('wedding');const w=HW(4.6,-.6,'u');closeLook({x:w.x,y:w.y+.95,z:w.z},{back:.7,eye:1.42,kind:'wedding',floor:w.y});C.lookDur=7;
  say([N('On the dresser, a wedding picture in a silver frame. The man and the woman from the table across the street. Younger.',{time:4.4}),...(near({x:jamie.px,z:jamie.pz},5)?[J('That’s them. From the window.',{time:1.8})]:[])]);mark('the wedding picture');}
 // the window at the end of the hall: something far too large, behind the roofs; then the lights
 function giantStart(){if(C.gt)return;go('e7-giant');C.gt={t:0};mark('the large thing');court.giantStart();
  const gp=court.W3(92,96,court.G0+12);sound('c7Groan',gp,{gain:3});later(8.6,()=>sound('c7Groan',gp,{gain:2.4}));T?.set?.(.72,{rise:.2,why:'the large thing'});
  stand(jamie,()=>HW(.7,-3.7,'u'),{look:()=>gp,keep:true,max:.4});
  say([{wait:5},J('…What is that.',{time:1.8,face:'terrified'}),{wait:3},J('What IS that.',{time:1.8}),{wait:8}],{then:()=>{C.gt.done=true;}});}
 function updateGiant(dt){const X=C.gt;if(!X)return;X.t+=dt;
  if(X.done&&!X.lights&&!busy()){X.lights=true;court.police.visible=true;mark('lights past the hedge');
   say([J('Okay. Okay. We’re getting out of here.',{time:2}),{wait:1},J('Lights. LIGHTS. Over there— red and blue—',{time:2.6,face:'hopeful'}),
    {act:()=>{radioHand.visible=true;sound('c6Static',jamie.person.group.position,{gain:.4});}},RR('…Jamie? …hear me? I’m at the oak. With the car… lights on… if you can see them, come toward them…',{time:4.4}),
    J('The other path. There’s another one. On the other side.',{time:2.6}),J('We need the bikes. We can’t outrun it. We SAW it.',{time:2.6,face:'determined'})],{then:()=>{radioHand.visible=false;court.ST.portalB=true;court.ST.fenceB=false;
     objective('Out the window. Get to the bikes.','Onto the porch roof, then drop.');stand(jamie,null);}});}}
 function climbOut(){if(C.view||posed())return;C.flags.out=true;mark('out the window');const r=court.SPOT.porchRoof;go('e7-out');
  pose({x:r.x,z:r.z},{y:r.y+1.45,yaw:me().a,pitch:-.35,slow:1.2});C.outT=0;objective('Drop down.','F, at the edge.');}
 function dropDown(){const d=court.SPOT.porchDrop;unpose();o.placePlayer({x:d.x,z:d.z,a:me().a,mode:'walk',bike:C.bikesAt?{x:C.bikesAt.x,z:C.bikesAt.z,a:C.bikesAt.a}:{x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z,a:court.SPOT.bikeA}});
  o.foot.land=.12;sound('c7Fall',d,{gain:.6});mark('dropped');C.lv='g';court.ST.level='g';
  const jl=()=>{const j={x:d.x+.9,z:d.z+.6};if(seenAt(j)&&(C.dropWait=(C.dropWait||0)+1)<6){later(.6,jl);return;}comp.putFoot(jamie,j.x,j.z,me().a,{bike:jamieBikeState()});sound('c7Fall',j,{gain:.5});C.jlv='g';follow(true);jamie.follow='walk';jamie.crouch=0;};later(1.2,jl);
  later(2,()=>{objective('The bikes.','Up the street, where you left them.');C.flags.dropped=true;});}
 function jamieBikeState(){if(jamie.bike.group.visible&&(jamie.bx||jamie.bz))return {x:jamie.bx,z:jamie.bz,a:jamie.ba,kick:1};const b={x:court.SPOT.bikes[1].x,z:court.SPOT.bikes[1].z,a:court.SPOT.bikeA};return {x:b.x,z:b.z,a:b.a,kick:1};}
 // ---- Act V: the bikes ----------------------------------------------------------------------------------------------------------
 // where it waits for you: behind whatever stands nearest your bikes (a car, a tree, a corner), on the side away from where you come
 function coverNear(b){const G=court.regL(b.x,b.z),cands=[];for(const [id,c] of Object.entries(court.cars))cands.push({x:c.x+Math.sin(c.a)*0,z:c.z,r:2.6,id});
  for(const L of court.lamps)cands.push({x:L.x,z:L.z,r:.9,id:'lamp'});for(const s2 of [court.SPOT.sign])cands.push({...court.regL(s2.x,s2.z),r:.8,id:'sign'});
  let best=null,bd=1e9;for(const c of cands){const d=Math.hypot(c.x-G.x,c.z-G.z);if(d<bd&&d>2.5){bd=d;best=c;}}
  if(!best||bd>16){best={x:G.x+4.5,z:G.z-3,r:0,id:'yard'};}
  // behind it: on the far side from the green-door house (you come from there)
  const hx=-26,hz=96,dx=best.x-hx,dz=best.z-hz,l=Math.hypot(dx,dz)||1,q={x:best.x+dx/l*(best.r+.9),z:best.z+dz/l*(best.r+.9)};const w=court.regW(q.x,q.z);return {x:w.x,z:w.z,id:best.id,coverX:best.x,coverZ:best.z};}
 function bikesStart(){go('n7-bikes');checkpoint('c7-bikes');C.bk={t:0,stage:'walk'};C.h=Math.max(C.h,HOUR.bikes);mark('to the bikes');follow(true);jamie.follow='walk';
  const b=me().bike,cv=coverNear(b);C.bk.cover=cv;HL.level='g';H.place(cv.x,cv.z,headingTo(cv.x,cv.z,b.x,b.z));HM.show(false);H.setMode('off');
  // (it went this way: a trash can it knocked into the road)
  court.cans[1].position.x=-8-1.6;court.cans[1].rotation.z=Math.PI/2;court.cans[1].position.y=court.G0+.3;C.canAt=court.W3(-8-1.6,64);
  objective('The bikes.','Up the street, where you left them.');}
 function updateBikes(dt){const X=C.bk;if(!X)return;X.t+=dt;const p=me(),b=me().bike;const d=Math.hypot(p.x-b.x,p.z-b.z);
  if(X.stage==='walk'&&(d<6||p.riding)){X.stage='mount';X.mountAt=X.t;say([J('Get on. Get ON.',{time:1.4,face:'terrified'})]);objective('Get on your bike.','');
   // it is there, low, behind the cover, where it has been waiting; you might see it if you look
   HM.show(true);H.script([{wait:99,state:'crouch',low:.9,look:()=>camera.position}]);}
  if(X.stage==='mount'&&(p.riding&&(jamie.mode==='ride'||X.t-X.mountAt>9)||X.t-X.mountAt>14)){X.stage='go';ambush();}}
 function ambush(){const X=C.bk;mark('it comes over the car');T?.set?.(1,{rise:.9,why:'the bikes'});const tgt=()=>jamie.mode==='ride'?{x:jamie.bx,y:gy(jamie.bx,jamie.bz)+1,z:jamie.bz}:{x:jamie.px,y:gy(jamie.px,jamie.pz)+1,z:jamie.pz};
  sound('c7Snarl',HM.sockets.head.getWorldPosition(new THREE.Vector3()),{gain:1.4});
  const car=Object.values(court.cars).find(c=>Math.hypot(court.regL(HM.x,HM.z).x-c.x,court.regL(HM.x,HM.z).z-c.z)<5);
  // (it comes at Jamie and he swerves: it lands past him, on the far side of his bike from yours, not between the two of you)
  const past=()=>{const t=tgt(),p=me(),dx=t.x-p.x,dz=t.z-p.z,l=Math.hypot(dx,dz)||1;return [t.x+dx/l*1.2-dz/l*1.4,t.z+dz/l*1.2+dx/l*1.4];};
  H.script([{to:past,speed:7.5,state:'lunge',low:.4,free:true,look:tgt,reach:tgt,near:.5,max:.9},
   {act:()=>{sound('c7Strike',tgt(),{gain:1});if(car){X.carHit=.5;X.car=car;}sound('c6Hit',tgt(),{gain:.8});face(jamie,'terrified',5);
    // it misses: Jamie swerves, and is past it
    if(jamie.mode==='ride'){jamie.speed=Math.max(jamie.speed,3.5);}}},{wait:.5,state:'alert',reach:null}],{then:()=>chaseStart()});
  later(.3,()=>say([J('GO! GO GO GO!',{time:1.6,face:'terrified'})]));if(!me().riding){C.flags.mountForced=true;}}
 // ---- the chase: down leg A, round the bend, up leg B, into the other lane --------------------------------------------------------
 function chaseStart(){go('n7-chase');C.ch={t:0,stage:'chase',cut:false};mark('the chase');objective('Ride.','Toward the lights. Don’t stop.');A.rideBoost=1.08;A.rideFov=7;C.flags.hurry=true;
  court.ST.portalB=true;court.ST.fenceB=false;court.police.visible=true;
  const R=court.routeWorld(),p=me();let i0=0,bd=1e9;R.forEach(([x,z],i)=>{const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;i0=i;}});
  const route=[[HM.x,HM.z],...R.slice(i0)];C.ch.route=route;C.ch.i0=i0;
  H.chaseStart(route,{rider:()=>{const q=me();return {x:q.x,z:q.z,speed:q.riding?q.speed:0};},gap:()=>{const j=jamie;const pj=H.chase?H.project(j.mode==='ride'?j.bx:j.px,j.mode==='ride'?j.bz:j.pz):0,pp=H.chase?H.project(me().x,me().z):0;
   return 7+Math.max(0,pp-pj);},onCatch:()=>caught({id:'player'}),grace:3.2});
  HM.drive.low=1;jamieChase();}
 // Jamie in the chase: on the road ahead of you (never more than a few lengths: he slows for you), down the court, round the
 // bend, up the other side; at the far lane he pulls over to let you in first and comes in after you (the lane is one bike wide)
 const routeS=(pts,x,z)=>{let best=0,bd=1e9,acc=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<bd){bd=d;best=acc+Math.sqrt(l2)*t;}acc+=Math.sqrt(l2);}return best;};
 function jamieChase(){const X=C.ch;if(jamie.mode!=='ride'||jamie.gone)return;const R=court.routeWorld(),B=court.ROUTE,iEnd=B.findIndex(([x,z])=>x===COURT_LEG.B&&z===36);
  const pts=R.slice(0,iEnd+1),j=[jamie.bx,jamie.bz];let i0=0,bd=1e9;pts.forEach(([x,z],i)=>{const d=Math.hypot(x-j[0],z-j[1]);if(d<bd){bd=d;i0=i;}});
  const over=court.regW(COURT_LEG.B+2.6,33.2),path=[...pts.slice(Math.min(i0+1,pts.length-1)),[over.x,over.z]];X.jPts=R;X.jWait=false;
  const ride=comp.steps.rideTo(jamie,path,{vmax:7.4,vend:0,decel:2.2});
  const paced=(dt,ctx)=>{const p=me(),ahead=routeS(R,jamie.bx,jamie.bz)-routeS(R,p.x,p.z),ps=p.riding?p.speed:0;
   if(ahead>3.5){const cap=ahead>8?Math.max(0,ps-1.2):ps+.4;if(jamie.speed>cap)jamie.speed=damp(jamie.speed,cap,4,dt);}return ride(dt,ctx);};
  follow(false);comp.run(jamie,[paced],{then:()=>{X.jWait=true;mark('Jamie pulls over at the lane');}});}
 function updateChase(dt){const X=C.ch;if(!X||X.caught)return;X.t+=dt;const p=me(),q=court.regL(p.x,p.z);
  // the can in the road (it ran into it on its way up): ride round it
  // Jamie: ahead and beside you, shouting (his own line, his own speed: he stays up with you)
  if(jamie.mode==='ride'){jamie.boost=1.35;}
  // (pulled over at the far lane: you go in first; once you are past him he comes in after you)
  if(X.jWait&&!X.jIn){const pS=routeS(X.jPts,p.x,p.z),jS=routeS(X.jPts,jamie.bx,jamie.bz);if(pS>jS+2.5){X.jIn=true;follow(true);jamie.follow='ride';say([J('GO— I’m behind you—',{time:1.4,face:'terrified'})]);}}
  if(!X.l1&&X.t>4&&!busy()){X.l1=true;say([J('It’s right behind us!',{time:1.6})]);}
  // at the bend it leaves the road: through the back yards, over the fence, and out ahead of you on the other leg
  if(!X.cut&&q.z>BEND_Z()-4&&q.x>-12&&H.mode==='chase'){X.cut=true;cutAcross();}
  if(X.cutStage==='lunge'&&!X.lunged){const m=HM,dd=Math.hypot(p.x-m.x,p.z-m.z);if(dd<1.7){X.lunged=true;knocked();}}
  if(!X.l3&&q.x<-50&&q.z<100&&!busy()){X.l3=true;say([J('The lights! GO!',{time:1.4,face:'determined'})]);}
  if(H.mode==='chase'&&H.chase&&H.chase.s>=H.chase.len-.4&&!X.through){X.through=true;// (it follows you into the lane: through the middle, and out the other side)
   const D=court.DB;H.setMode('script');HM.place(HM.x+D.dx,HM.z+D.dz,HM.heading);H.script([{wait:99,state:'idle'}]);HM.show(false);}}
 const BEND_Z=()=>118;
 function cutAcross(){const X=C.ch;X.cutStage='cut';mark('it cuts across');const P=court.CUT.map(([x,z])=>court.regW(x,z));
  H.script([...P.map((w,i)=>({to:[w.x,w.z],speed:i===2?9:8.5,state:'run',low:1,free:true,turn:8,look:()=>camera.position,...(i===2?{sound:'fence'}:{})})),
   {act:()=>{X.cutStage='lunge';sound('c7Snarl',{x:HM.x,y:HM.y+1.2,z:HM.z},{gain:1.4});}},
   {to:()=>{const p=me(),a=p.a,s=Math.max(4,p.speed||4);return [p.x+Math.sin(a)*s*.25,p.z-Math.cos(a)*s*.25];},speed:8,state:'lunge',low:.5,free:true,max:.9,look:()=>camera.position,reach:()=>camera.position},
   {act:()=>{X.cutStage='after';HM.drive.reach=null;}},{wait:.4,state:'alert'}],{then:()=>{// back on the road behind you
    const R=C.ch.route;H.chaseStart(R,{rider:()=>{const q=me();return {x:q.x,z:q.z,speed:q.riding?q.speed:0};},gap:()=>6.5,onCatch:()=>caught({id:'player'})});H.chase.s=H.project(HM.x,HM.z);}});
  later(.6,()=>say([J('IT’S GOING ROUND— IT’S CUTTING ACROSS!',{time:2.4,face:'terrified'})]));later(4.6,()=>say([J('LOOK OUT—',{time:1})]));}
 function knocked(){mark('it clips your back wheel');sound('c7Strike',camera.position,{gain:1.2});sound('curb',camera.position,{gain:1.5});o.roam.brake=.55;C.ch.knockT=.6;o.foot.land=.08;T?.set?.(1,{rise:.6,why:'hit'});}
 // ---- out at the oak ----------------------------------------------------------------------------------------------------------------
 function outAtTheOak(){go('n7-lookout');C.lo={t:0,stage:'out'};mark('out at the oak');court.police.visible=false;A.rideFov=4;
  nightWorld7();police.attach?.(true);const car=k.carA;car.show(true);car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));car.lights=true;car.headlights=true;
  reyes.show(true);const rf=court.SPOT.reyesField;reyes.place(rf.x,rf.z,headingTo(rf.x,rf.z,court.SPOT.fieldFar.x,court.SPOT.fieldFar.z));reyes.gest('flashlight');
  const ff=court.SPOT.fieldFar;reyes.walk([[ff.x,ff.z]],{speed:.7});objective('','');
  later(.4,()=>say([J('REYES! REYES!',{time:1.6,face:'terrified'})]));}
 // out of the lane and onto the grass by the oak (or a few seconds on): it comes out of the lane behind you, at Jamie
 function updateOakOut(dt){const X=C.lo;if(!X)return;X.t+=dt;if(X.stage!=='out')return;const p=me(),L=court.realL(p.x,p.z),out=!court.inLane(L.x,L.z)||L.z<.4;
  const jx=jamie.mode==='ride'?jamie.bx:jamie.px,jz=jamie.mode==='ride'?jamie.bz:jamie.pz,JLc=court.realL(jx,jz),jOut=JLc.z<-1.5||!court.inLane(JLc.x,JLc.z);
  // (both of you out on the grass, Jamie behind you; or long enough: then it comes)
  if((out&&jOut&&X.t>2.2)||X.t>9){X.stage='coming';mark('it comes out of the lane');const sp=court.SPOT;H.place(sp.realP1.x,sp.realP1.z,0);HM.show(true);
   H.script([{to:[sp.bend1.x,sp.bend1.z],speed:8,state:'run',low:1,free:true},{to:[sp.mouth.x,sp.mouth.z],speed:9,state:'run',low:1,free:true,near:6},{act:()=>leapAtJamie()}]);}}
 function leapAtJamie(){const X=C.lo;X.stage='leap';mark('it leaps');const tgt=()=>({x:jamie.mode==='ride'?jamie.bx:jamie.px,y:gy(jamie.bx,jamie.bz)+.9,z:jamie.mode==='ride'?jamie.bz:jamie.pz});
  sound('c7Snarl',HM.sockets.head.getWorldPosition(new THREE.Vector3()),{gain:1.6});
  H.script([{to:()=>{const t=tgt();return [t.x,t.z];},speed:10,state:'lunge',low:.3,free:true,look:tgt,reach:tgt,near:1.0,max:1.2},{act:()=>thrown()},{wait:.6,state:'alert',reach:null}],{then:()=>grabStart()});}
 // Jamie off his bike into the grass; you off yours
 const JL={on:false,x:0,z:0,y:0,dir:{x:0,z:1},t:0,phase:'thrown',grip:false,reach:0,pose:newPose(),fall:null};
 function thrown(){mark('Jamie is thrown');sound('c7Strike',{x:jamie.bx,y:1,z:jamie.bz},{gain:1.5});sound('bikeDrop',{x:jamie.bx,y:1,z:jamie.bz},{gain:1.2});
  const a=jamie.ba,bx=jamie.bx,bz=jamie.bz;comp.release(jamie);scene.attach(jamie.person.group);jamie.person.group.visible=true;
  // his bike goes down where it was hit
  jamie.bike.group.rotation.z=1.35;jamie.bike.group.position.y=gy(bx,bz)+.05;C.jBikeDown={x:bx,z:bz};
  let land={x:bx,z:bz};for(const [f,sd] of [[2.6,1.2],[2.2,0],[1.8,-1.0],[1.4,0],[.8,0]]){const c={x:bx+Math.sin(a)*f+Math.cos(a)*sd,z:bz-Math.cos(a)*f+Math.sin(a)*sd};if(nav.walkable(c.x,c.z,{r:.3})){land=c;break;}}Object.assign(JL,{on:true,x:land.x,z:land.z,y:gy(land.x,land.z),t:0,phase:'thrown',from:{x:bx,z:bz,y:gy(bx,bz)+.9},grip:false,dragS:0});
  // you: the bike stops under you, and you are off it, down in the grass
  o.roam.brake=1;later(.25,()=>{const p=me();sound('c7Fall',camera.position,{gain:1.2});const a2=p.a;let q={x:p.x,z:p.z};
   for(const [f,sd] of [[1.1,0],[.8,.5],[.8,-.5],[.5,0],[0,.9],[0,-.9]]){const c={x:p.x+Math.sin(a2)*f+Math.cos(a2)*sd,z:p.z-Math.cos(a2)*f+Math.sin(a2)*sd};if(nav.walkable(c.x,c.z,{r:.32})){q=c;break;}}
   o.placePlayer({x:q.x,z:q.z,a:a2,mode:'walk',bike:{x:p.x,z:p.z,a:a2}});o.roam.brake=0;pose({x:q.x,z:q.z},{y:gy(q.x,q.z)+.35,yaw:headingTo(q.x,q.z,land.x,land.z),pitch:-.15,slow:.3});C.downAt=C.t;});
  A.rideBoost=1;A.rideFov=0;face(jamie,'terrified',8);}
 // ---- the grab and the struggle -----------------------------------------------------------------------------------------------------
 function grabStart(){go('n7-grab');C.gb={t:0,stage:'grab',yanks:0,grip:1,pull:0,s:0};mark('it has Jamie');T?.set?.(1,{rise:1,why:'Jamie'});
  // (time to get to him: however far you rode on, you can reach him running before it has him in the lane)
  {const p=me(),d0=Math.hypot(p.x-JL.x,p.z-JL.z);C.gb.giveUp=clamp(6+d0/3.2,11,22);C.gb.d0=+d0.toFixed(1);}
  const mouth=court.SPOT.mouth;C.gb.mouth=mouth;
  // it takes his ankle, and goes backwards toward the lane, low, dragging him; he claws at the grass
  H.script([{to:()=>{const f=jamieAnkle();return [f.x+(JL.x-f.x)*0-JL.dir.x*.6,f.z-JL.dir.z*.6];},speed:3,state:'crouch',low:.6,free:true,look:()=>jamieAnkle(),near:.5,max:1.2},
   {act:()=>{JL.held=true;C.gb.heldAt=C.t;sound('c7Drag',jamieAnkle(),{gain:.8});mark('its hand on his ankle');}},{until:()=>C.gb.stage==='lost',state:'drag',low:.6,look:()=>camera.position}]);
  later(1.6,()=>{if(C.downAt!=null&&posed()&&C.gb.stage==='grab')unpose();});
  say([{wait:.8},J('NO— NO NO—',{time:1.4,face:'terrified'}),J('HELP ME— GRAB MY HAND—',{time:2,face:'terrified'})],{then:()=>{}});
  objective('JAMIE.','Get to him. F: grab his hand.');}
 function jamieAnkle(){// his right ankle in the world (feet at JL's origin)
  return new THREE.Vector3(JL.x,JL.y+.1,JL.z);}
 function jamieHand(){jamie.person.group.updateMatrixWorld(true);return jamie.person.parts.rhand.getWorldPosition(new THREE.Vector3());}
 function grabHand(){const X=C.gb;if(X.stage!=='grab'||X.grip0)return;X.grip0=true;X.stage='struggle';X.st=0;go('n7-grab');mark('you have his hand');sound('c7Drag',jamieHand(),{gain:.5});
  JL.grip=true;phys.ME.extra.push(gripArms);C.gripFn=gripArms;objective('HOLD ON.','Hold F. Pull back: S.');
  say([J('DON’T LET GO— DON’T LET GO—',{time:2,face:'terrified'})]);}
 // your hands on his wrist (first person: both arms to his hand, held there)
 function gripArms(p,{toLocal:tl}){const w=jamieHand(),L=tl(w.clone());for(const [o2,e,s] of [[PI.rh,PI.re,1],[PI.lh,PI.le,-1]]){p[o2]=L.x+s*.04;p[o2+1]=L.y-.02;p[o2+2]=L.z+.02;p[e]=s*.75;p[e+1]=-.35;p[e+2]=.5;}}
 function updateGrab(dt){const X=C.gb;if(!X)return;X.t+=dt;const p=me(),mouth=X.mouth,c=HM;
  // the drag: it goes back toward the lane mouth; jerks; you slow it pulling back, not enough
  if(JL.held&&X.stage!=='lost'){const toM={x:mouth.x-c.x,z:mouth.z-c.z},L=Math.hypot(toM.x,toM.z)||1,dir={x:toM.x/L,z:toM.z/L};
   const pulling=X.stage==='struggle'&&o.held?.('KeyS'),holding=X.stage==='struggle'&&o.held?.('KeyF');X.pull=damp(X.pull,pulling?1:0,6,dt);
   // (how fast: it gets him to the lane in its own time: before you reach him it is getting its grip and he claws at the grass;
   //  while you hold on, you and he slow it; either way it gets there. The yanks are its jerks on his leg)
   const budget=X.stage==='struggle'?13:(X.giveUp??=11),el=X.stage==='struggle'?X.st:X.t,left=Math.max(.8,budget-el);
   X.yankT=(X.yankT??1.2)-dt;let v=Math.min(1.1,L/left)*(X.stage==='struggle'?1-.4*X.pull:1);if(X.yankT<=0){X.yankT=1.3+(X.yanks%3)*.25;X.yanks++;v+=Math.min(7,L*3);X.jerk=.18;sound('c7Drag',jamieAnkle(),{gain:1});mark('a yank');
    if(X.stage==='struggle'){X.grip=Math.max(0,X.grip-(holding?.13:.32));o.foot.land=.04;}if(X.yanks===1)dropGum();}
   X.jerk=Math.max(0,(X.jerk||0)-dt);const step=Math.min(L,(v*(X.jerk>0?1:0)+ (X.jerk>0?0:v))*dt);
   c.x+=dir.x*step;c.z+=dir.z*step;c.heading=headingTo(c.x,c.z,p.x,p.z);HM.drive.back=1;HM.drive.speed=v*.4;
   if(X.stage==='struggle'&&holding)X.grip=Math.min(1,X.grip+dt*.12);
   // the end: at the mouth, or the grip gone, or long enough: the last pull
   if(X.stage==='struggle'){X.st+=dt;if(L<.5||X.grip<=0||X.st>13)letGo();}
   else if(X.stage==='grab'&&(X.t>X.giveUp||L<.5)){/* (you never reached him: it goes on without you having held him) */X.stage='lost';X.never=true;takenStart();}}
  if(X.stage==='grab'&&!X.grip0&&JL.held&&dist2(p,jamieHand())<1.7&&!busy()){}// (F: in spots)
  // your pose while you hold on: down on your knees behind his hands, pulled along
  if(X.stage==='struggle'){const h=jamieHand(),bx=h.x+JL.dir.x*.62,bz=h.z+JL.dir.z*.62;if(!C.pose||C.pose.release)pose({x:bx,z:bz},{y:gy(bx,bz)+.95,yaw:headingTo(bx,bz,c.x,c.z),pitch:-.35,slow:.35});
   C.pose.x=damp(C.pose.x,bx,10,dt);C.pose.z=damp(C.pose.z,bz,10,dt);C.pose.y=gy(bx,bz)+.95+Math.sin(C.t*31)*.006*X.pull;}}
 function letGo(){const X=C.gb;if(X.stage==='lost')return;X.stage='lost';X.lostAt=C.t;mark('his hand goes out of yours');sound('c7Strike',jamieHand(),{gain:1.3});
  JL.grip=false;const i=phys.ME.extra.indexOf(gripArms);if(i>=0)phys.ME.extra.splice(i,1);
  // you go over backwards into the grass; you see it take him round the bend
  const p=me();if(C.pose){C.pose.slow=.25;C.pose.y=gy(p.x,p.z)+.38;C.pose.pitch=.15;}o.foot.land=.1;T?.set?.(1,{rise:1,why:'gone'});
  say([J('PLEASE—',{time:1.2,face:'terrified'})]);later(.6,()=>takenStart());}
 // ---- taken: into the lane, round the bend, and gone ---------------------------------------------------------------------------------
 function takenStart(){go('n7-taken');C.tk={t:0};mark('into the lane');const sp=court.SPOT;
  if(!C.flags.gumDropped)dropGum();
  H.script([{to:[sp.mouth.x,sp.mouth.z],speed:3.4,state:'drag',low:.6,free:true,back:0},{to:[sp.inLane.x,sp.inLane.z],speed:4.6,state:'drag',free:true},{to:[sp.bend1.x,sp.bend1.z],speed:5,state:'drag',free:true},
   {to:()=>{const w=court.realW(LANE_P1.x-.6,LANE_P1.z);return [w.x,w.z];},speed:5.2,state:'drag',free:true},{act:()=>gone()}]);HM.drive.back=0;
  later(1.6,()=>{if(posed())unpose();objective('Jamie.','The lane.');});}
 function gone(){mark('Jamie is gone');C.flags.jamieTaken=true;JL.on=false;JL.held=false;jamie.gone=true;jamie.person.group.visible=false;H.setMode('off');HM.show(false);
  // (they are in the other lane now, far away: the court; the lane here is only the lane)
  goneStart();}
 function dropGum(){if(C.flags.gumDropped)return;C.flags.gumDropped=true;C.inv.gum='grass';const g=house.items.gum;scene.attach(g);g.visible=true;
  const from=new THREE.Vector3(JL.x+JL.dir.x*.75,JL.y+.4,JL.z+JL.dir.z*.75);g.position.copy(from);C.gumFall={v:new THREE.Vector3(JL.dir.x*.6+.4,1.1,JL.dir.z*.6),t:0};mark('the gum falls');sound('c7Gum',from,{gain:.5});}
 function updateGum(dt){const F=C.gumFall;if(!F)return;const g=house.items.gum;F.t+=dt;if(F.done)return;F.v.y-=9.8*dt;g.position.addScaledVector(F.v,dt);g.rotation.x+=dt*7;g.rotation.z+=dt*4;
  const fy=gy(g.position.x,g.position.z)+.012;if(g.position.y<fy){g.position.y=fy;if(Math.abs(F.v.y)>1.2){F.v.y*=-.25;F.v.x*=.4;F.v.z*=.4;sound('c7Gum',g.position,{gain:.35});}else{F.done=true;g.rotation.set(0,g.rotation.y,0);C.gumAt={x:g.position.x,y:g.position.y,z:g.position.z};mark('the gum, in the grass');}}}
 // ---- after: you, the lane that is only a lane, the gum; Reyes ----------------------------------------------------------------------------
 function goneStart(){go('n7-gone');C.gn={t:0,calls:0};const sp=court.SPOT;
  reyes.show(true);reyes.place(sp.fieldFar.x,sp.fieldFar.z,0);reyes.gest('flashlight');later(4,()=>{reyes.walk([[sp.fieldOut.x,sp.fieldOut.z],[court.realW(-8,12).x,court.realW(-8,12).z],[sp.bend1.x,sp.bend1.z],[sp.inLane.x,sp.inLane.z]],{speed:2.6,then:a=>{a.lookAt=camera.position;reyesArrives2();}});
   say([R('HEY— HEY! WHO’S THERE—',{time:1.8})]);});}
 function reyesArrives2(){const X=C.gn;if(X.reyes)return;X.reyes=true;mark('Reyes');
  say([R('Where’s Jamie?',{time:1.4}),R('WHERE’S JAMIE?',{time:1.4}),N('You can’t make the words come out.',{time:2.4}),{wait:1.2},
   {act:()=>reyes.gest('radio')},R('Dispatch, twelve. I need every unit at the end of Oak Hollow Drive. I have a second missing juvenile.',{time:4}),R('A second one.',{time:1.6,face:'tired'}),
   {act:()=>{reyes.gest('flashlight');const sp=court.SPOT;reyes.walk([[sp.bend1.x,sp.bend1.z],[court.realW(-6,12).x,court.realW(-6,12).z]],{speed:1.2,then:a=>a.walk([[sp.mouth.x,sp.mouth.z]],{speed:1.2,then:b=>{b.lookAt=camera.position;X.searched=true;}})});}}]);}
 function updateGone(dt){const X=C.gn;if(!X)return;X.t+=dt;
  if((C.inv.gum==='have'&&X.searched&&X.t>25)||X.t>110){if(!X.leave&&!busy()){X.leave=true;say([R('Come here. Come here. Stay with me.',{time:2.4})],{then:()=>{toAfter();}});}}}
 function pickGum(){if(C.inv.gum!=='grass'||phys.playerBusy())return;const g=house.items.gum;o.roam.walkLock=true;
  phys.playerReach({at:()=>g.getWorldPosition(new THREE.Vector3()),dur:[.55,.25,.5],carry:false,onContact:()=>{g.visible=false;C.inv.gum='have';C.flags.gumPicked=true;mark('the gum, picked up');sound('c7Gum',g.position,{gain:.4});},
   then:()=>{o.roam.walkLock=false;say([N('A pack of spearmint gum. Sam’s. Jamie’s.',{time:3})]);}});}
 function callName(){const X=C.gn||C.lo;if(!X||(X.callT||0)>0)return;X.callT=3.6;X.calls=(X.calls||0)+1;mark('you call his name');const p=camera.position;
  o.audio?.()?.callName?.({x:p.x,y:p.y,z:p.z},{gain:.9});say([{who:'YOU',text:X.calls>2?'“Jamie…”':'“JAMIE!”',time:1.6}]);}
 // ---- later: the lookout, at night -------------------------------------------------------------------------------------------------------------
 function toAfter(){if(C.fadeOut>=0)return;objective('','');C.fadeOut=0;C.after=()=>afterStart();}
 function afterStart(){go('n7-after');checkpoint('c7-after');C.h=Math.max(C.h,HOUR.after);C.hMin=HOUR.after;C.minute=-1;C.af={t:0,stage:'mom'};mark('later');H.setMode('off');HM.show(false);
  nightWorld7();police.attach?.(true);nav.setRoom(court.nav);court.ST.portalA=court.ST.portalB=false;
  const car=k.carA;car.show(true);car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));car.lights=true;const c2=main(1118,2.6),c3=main(1124,2.6);k.carB.show(true);k.carB.park(c2.x,c2.z,headingTo(c2.x,c2.z,c3.x,c3.z));k.carB.lights=true;
  // you on the bench; Reyes crouched in front of you; the other officer by his car; flashlights in the field
  const b=LK.bench;pose({x:b.x,z:b.z},{y:gy(b.x,b.z)+1.02,yaw:headingTo(b.x,b.z,LK.car.x,LK.car.z),pitch:-.08,slow:.01});C.pose.w=1;
  reyes.show(true);const rq=main(LOOKOUT.bench.d-1.1,LOOKOUT.bench.lat+.2);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,b.x,b.z));reyes.gest('fold');reyes.lookAt=camera.position;
  officer.show(true);const oq=main(1121,4.8);officer.place(oq.x,oq.z,headingTo(oq.x,oq.z,rq.x,rq.z));officer.gest('radio');
  const ex=ch2.extra||[];for(let i=0;i<2&&i<ex.length;i++){const s2=court.SPOT[i?'fieldFar':'reyesField'];ex[i].show(true);ex[i].place(s2.x+i*4,s2.z,0);ex[i].gest('flashlight');}
  const jm=cast.jamieMom;jm.show(true);const jq=main(1104,-2.8);jm.place(jq.x,jq.z,headingTo(jq.x,jq.z,rq.x,rq.z));jm.gest(null);
  jamie.gone=true;jamie.person.group.visible=false;jamie.bike.group.visible=false;
  C.fadeIn=0;T?.set?.(.4,{rise:-.6,why:'later'});
  say([{wait:2.4,act:()=>{jm.walk([[rq.x-1.6,rq.z-.4]],{speed:2.4});}},{who:'JAMIE’S MOM',text:'“Where is he? WHERE IS HE?”',from:jm,time:2,face:'terrified'},
   {act:()=>{reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,jm.x,jm.z));reyes.gest('brace');reyes.lookAt=jm.person.group.position;}},R('Ma’am— ma’am. We have everyone out there. Everyone.',{time:2.8}),
   {wait:.8,act:()=>{jm.lookAt=camera.position;}},{who:'JAMIE’S MOM',text:'“You were with him.”',from:jm,time:1.8},{who:'JAMIE’S MOM',text:'“You were WITH him.”',from:jm,time:2.2,face:'sad'},
   {wait:2.4,act:()=>{jm.gest('head');jm.walk([[c2.x+1.6,c2.z]],{speed:1});}},{wait:3}],{then:()=>afterB()});
  C.flags.forgetReyes=true;C.flags.forgetPhotoMom=true;}
 function afterB(){const jm=cast.jamieMom,b=LK.bench,c2=main(1118,2.6);C.af.stage='forget';mark('the forgetting');
  say([{who:'OFFICER',text:'“Description for the second one?”',from:officer,time:2.2},R('Twelve. Blue cap. Orange shirt. His name is Jamie.',{time:3,act:()=>{reyes.gest('fold');reyes.lookAt=officer.person.group.position;}}),
   {who:'JAMIE’S MOM',text:'“I have a picture— I have one from the pool, last week—”',from:jm,time:3,act:()=>{jm.gest('phone');}},{wait:1.6},
   {who:'JAMIE’S MOM',text:'“…He was right there. He was RIGHT there.”',from:jm,time:2.6},{who:'OFFICER',text:'“Ma’am— there’s nobody in this one.”',from:officer,time:2.2},
   {who:'JAMIE’S MOM',text:'“He’s in all of these. He’s in— where is—”',from:jm,time:2.8,face:'terrified'},{who:'OFFICER',text:'“A school picture is fine, ma’am. Anything.”',from:officer,time:2.4},
   {wait:2.2},{who:'OFFICER',text:'“And the other one. From yesterday. The Mill Creek kid.”',from:officer,time:2.8},{wait:.6},R('…S—',{time:1.2}),
   {act:()=>{reyes.gest('phone');mark('Reyes looks at his notebook');}},{wait:2.4},R('Sam.',{time:1.4}),{wait:.8},R('His name is Sam.',{time:1.8}),{wait:2.6},
   {act:()=>{reyes.gest('fold');reyes.lookAt=camera.position;const rq2=main(LOOKOUT.bench.d-1.1,LOOKOUT.bench.lat+.2);reyes.walk([[rq2.x,rq2.z]],{speed:.8,then:a=>{a.faceTo(b.x,b.z);}});}},{wait:1.6},
   R('Your bike’s in my trunk. Jamie’s too. I’ll bring them back tomorrow.',{time:3}),R('I’m taking you to Sam’s. Your mom’s meeting us there. That’s where everybody is.',{time:3.4})],{then:()=>{C.af.stage='done';later(1.6,()=>toSams());}});void c2;}
 function toSams(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>samsNight();}
 // ---- Sam's room, that night ---------------------------------------------------------------------------------------------------------------
 function samsNight(){go('n7-sams');checkpoint('c7-sams');C.h=Math.max(C.h,HOUR.sams);C.hMin=HOUR.sams;C.minute=-1;C.sn={t:0,stage:'in'};mark('Sam’s, that night');unpose();
  for(const a of [reyes,officer,cast.jamieMom,...(ch2.extra||[])])a.show(false);k.carA.show(false);k.carB.show(false);police.attach?.(false);court.attach(false);
  house.show(true);house.reset();house.show(true);house.lightsOut(true);nav.setRoom(house.nav);house.items.gum.visible=false;house.items.notebook.visible=false;photoState('one');
  houseAdults('night');light(0,{...HS.kitchenTable,y:HS.kitchenTable.y+1.4},{intensity:2.2,dist:7,color:0xffd2a0});light(1,{...HS.bed,y:HS.bed.y+1.6},{intensity:1.6,dist:5.5,color:0xffd6aa});light(2,null);light(3,null);
  const q=HS.enter;o.placePlayer({x:q.x,z:q.z,a:house.heading(Math.PI),mode:'walk',bike:{x:yourBikeAt.x,z:yourBikeAt.z,a:0}});C.fadeIn=0;
  say([{wait:1.2},MOM('Come here.',{time:1.2}),MOM('Your mom’s on her way. She’s coming from the station.',{time:2.6}),{wait:.8},MOM('…They told me about Jamie.',{time:2.2,face:'sad'}),{wait:1},
   MOM('Sam would’ve made you all stay home today. He’d have been right. He’s always right about that stuff.',{time:4.2}),{wait:.6},MOM('Go sit. His dad’s in his room. He’s been in there an hour.',{time:3})],
   {then:()=>{objective('Sam’s room.','');}});}
 function updateSams(dt){const X=C.sn;if(!X)return;X.t+=dt;const p=me(),rm=house.room(p.x,p.z);
  if(rm==='sam'&&!X.inRoom){X.inRoom=true;X.roomAt=X.t;mark('Sam’s room, at night');objective('','');}
  if(X.inRoom&&!X.fanBeat&&((C.flags.fanOffNight&&C.t-C.flags.fanOffNight>2.2)||X.t-X.roomAt>22)&&!busy()){X.fanBeat=true;
   const touched=!!C.flags.fanOffNight;if(!touched){house.ST.fan=false;sound('click',HS.fan,{gain:.5});}
   later(touched?0:1.8,()=>{house.ST.fan=true;sound('click',HS.fan,{gain:.5});mark('his dad turns the fan on again');});
   later(3.4,()=>say(touched?[DAD('…I don’t know why I keep doing that.',{time:2.6}),{wait:.8},DAD('Was it always on? I don’t…',{time:2.4})]:[DAD('I keep coming in here and turning this on.',{time:2.6}),{wait:.8},DAD('I don’t know why.',{time:1.8})],
    {then:()=>{C.flags.forgetFan=true;objective('The photograph.','On his desk.');}}));}
  if(C.flags.photoSeenNight&&!X.photoLine&&!busy()&&!C.view){X.photoLine=true;say([DAD('That’s a nice one of you.',{time:2.2})],{then:()=>{C.flags.forgetPhoto=true;objective('Sam’s notebook.','At his desk. Write in it.');}});}}
 // ---- the names ---------------------------------------------------------------------------------------------------------------------------
 const NAMES='ALEX\nJAMIE\nSAM';
 function writeStart(){if(C.wr)return;go('n7-names');C.wr={t:0,n:0,prog:0,done:false};mark('the notebook, open');const d=HS.desk;const top=house.toW(3.55,house.P.depth/2-.15-.36,house.FL+.765);
  const pg=pageMesh(notebookPage('names',{names:''}),{w:.17,h:.225});pg.name='names-page';pg.position.set(top.x,top.y+.003,top.z);pg.rotation.set(-Math.PI/2,0,house.P.worldRot+Math.PI);scene.add(pg);C.wr.page=pg;
  closeLook({x:top.x,y:top.y,z:top.z},{back:.36,eye:.82,kind:'names',floor:HS.couch.y});C.lookDur=null;void d;
  // a pencil in your hand
  if(!C.pencil){const pc=new THREE.Mesh(new THREE.CylinderGeometry(.0045,.0045,.15,6),new THREE.MeshStandardMaterial({color:0xd8b040,roughness:.6}));pc.name='c7-pencil';C.pencil=pc;}
  o.self.parts.rhand.add(C.pencil);C.pencil.position.set(0,.06,.02);C.pencil.rotation.set(.4,0,0);phys.ME.extra.push(writeArm);objective('Write their names.','Hold F.');}
 function letterAt(i){// where on the page the i-th letter of NAMES is (world)
  const lines=NAMES.split('\n');let n=i,li=0;while(li<lines.length&&n>=lines[li].length){n-=lines[li].length;li++;}const u=(100+n*33+16)/512,v=(190+li*110-18)/680,pg=C.wr.page;
  return pg.localToWorld(new THREE.Vector3((u-.5)*.17,(.5-v)*.225,.004));}
 function writeArm(p,{toLocal:tl}){const X=C.wr;if(!X||X.done)return;const n=Math.min(X.n,NAMES.replace(/\n/g,'').length-1),w=letterAt(n);w.x+=Math.sin(C.t*24)*.004;w.z+=Math.cos(C.t*19)*.003;const L=tl(w.clone());p[PI.rh]=L.x;p[PI.rh+1]=L.y+.02;p[PI.rh+2]=L.z;p[PI.re]=.7;p[PI.re+1]=-.4;p[PI.re+2]=.4;}
 function updateWrite(dt){const X=C.wr;if(!X||X.done)return;X.t+=dt;const total=NAMES.replace(/\n/g,'').length;
  if(o.held?.('KeyF')||X.t>40){X.prog+=dt*3.1;const n=Math.min(total,Math.floor(X.prog));if(n>X.n){X.n=n;sound('c7Pencil',HS.desk,{gain:.5});let s2='',c=0;for(const ch of NAMES){if(ch==='\n'){s2+=ch;continue;}if(c>=n)break;s2+=ch;c++;}
    const cv=notebookPage('names',{names:s2}),t=texOf(cv);const m=X.page.children[0].material;if(t){m.map?.dispose?.();m.map=t;m.needsUpdate=true;}X.text=s2;}}
  if(X.n>=total&&!X.done){X.done=true;C.flags.names=true;mark('ALEX JAMIE SAM');const i=phys.ME.extra.indexOf(writeArm);if(i>=0)phys.ME.extra.splice(i,1);
   try{localStorage.setItem(SAVE7,JSON.stringify({names:['ALEX','JAMIE','SAM'],photo:'altered',gum:C.inv.gum==='have',notebook:'player',jamie:'taken',sam:'missing',at:Date.now()}));}catch{}
   later(1.6,()=>{showMemory('I thought I remembered everyone.');});later(6.4,()=>{endLook();C.pencil?.removeFromParent();objective('Look outside.','His window.');C.flags.lookOutside=true;});}}
 function showMemory(text){const el=$('reflection');if(el&&o.ui?.settings?.memories!==false){el.textContent=text;el.classList?.add('on');el.style.opacity='1';later(6,()=>{el.style.opacity='0';el.classList?.remove('on');});}else say([N(text,{time:4})]);mark('memory: '+text);}
 // ---- the last thing: out the window ---------------------------------------------------------------------------------------------------------
 const finalBikes=['alex','jamie','sam','player'].map((kk,i)=>({kk,d:-3.9+i*1.6,lat:3.4+((i%2)*.7)}));
 function stageBikes(on){for(const [i,b] of finalBikes.entries()){const S2=cast.studio[b.kk],q=main(SH.drivD+b.d,b.lat),q2=main(SH.drivD+b.d+5,b.lat);S2.bike.group.visible=on;
   if(on){S2.bike.group.position.set(q.x,gy(q.x,q.z),q.z);S2.bike.group.rotation.set(0,-headingTo(q.x,q.z,q2.x,q2.z),.12);void i;}}
  if(on)light(2,{x:main(SH.drivD-1.5,3.6).x,y:gy(main(SH.drivD,3).x,main(SH.drivD,3).z)+6.5,z:main(SH.drivD-1.5,3.6).z},{intensity:9,dist:13,color:0xffcf8a});}
 function lookOutside(){if(C.flags.window)return;C.flags.window=true;go('n7-window');mark('out the window');stageBikes(true);house.renderView('night',{staged:null});
  const w=HS.window;closeLook({x:w.x,y:w.y,z:w.z},{back:.62,eye:1.42,kind:'window',floor:HS.couch.y});C.lookDur=null;
  say([{wait:1.6},N('Under the streetlight across the street, four bikes stand in a row. The way you used to ride.',{time:4.4}),{wait:.8},N('Alex’s. Jamie’s. Sam’s.',{time:3}),{wait:1.4},N('Yours.',{time:2.6})],
   {then:()=>{later(2.6,()=>{C.endT=0;});}});}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Chapter Seven';if(pp)pp.innerHTML='THE STREET THAT WASN’T THERE<br>August 26, 2011.';}
  const nb=$('next-chapter');if(nb)nb.hidden=true;A7.finished=true;o.finish();}
 // ---- the photograph: rendered from the world (the oak, last July's light), with all four of you, and with only you ---------------------------
 const PH={four:null,one:null,state:'four'};
 function photoCanvas(who){const cv=canvas(PHOTO.w,PHOTO.h);if(!cv)return null;let ok=false;
  try{if(o.shoot&&o.readPixels&&typeof THREE.WebGLRenderTarget==='function'){const studio=cast.studio,o2=main(LOOKOUT.oak.d-3.2,LOOKOUT.oak.lat-3.4);
    const cam=new THREE.PerspectiveCamera(46,PHOTO.w/PHOTO.h,.1,300),cp=main(LOOKOUT.oak.d-10.5,LOOKOUT.oak.lat-7.5);cam.position.set(cp.x,gy(cp.x,cp.z)+1.25,cp.z);cam.lookAt(o2.x,gy(o2.x,o2.z)+.95,o2.z);cam.updateMatrixWorld();
    const keys=['player','jamie','sam','alex'];keys.forEach((kk,i)=>{const S2=studio[kk];const on=who.includes(kk);const q=main(LOOKOUT.oak.d-3.6+i*.15,LOOKOUT.oak.lat-6.2+i*1.35),qb=main(LOOKOUT.oak.d-3.0+i*.15,LOOKOUT.oak.lat-6.6+i*1.35);
     S2.person.group.visible=on;S2.bike.group.visible=on;if(!on)return;const a=headingTo(q.x,q.z,cam.position.x,cam.position.z);S2.person.group.position.set(q.x,gy(q.x,q.z),q.z);S2.person.group.rotation.set(0,-a,0);
     standPose(S2.pose,i*1.7,{look:0});S2.pose[PI.rh]=.32;S2.pose[PI.rh+1]=.95;S2.pose[PI.rh+2]=-.25;applyPose(S2.person,S2.pose);S2.person.face?.set?.(kk==='alex'?'grin':kk==='jamie'?'happy':kk==='sam'?'amused':'happy',{hold:9});S2.person.face?.update?.(1/30,{clock:i});
     S2.bike.group.position.set(qb.x,gy(qb.x,qb.z),qb.z);S2.bike.group.rotation.set(0,-a+Math.PI/2,.1);});
    const rt=new THREE.WebGLRenderTarget(PHOTO.w,PHOTO.h,{colorSpace:THREE.SRGBColorSpace});
    if(o.shoot({cam,target:rt,preset:{day:.35,dusk:.32,night:0},sun:[-50,22,40],at:{x:o2.x,y:gy(o2.x,o2.z),z:o2.z}})){const px=o.readPixels(rt,PHOTO.w,PHOTO.h);if(px){ch4.photo.toCanvas(cv,px,{blur:false});ok=true;}}rt.dispose?.();
    for(const kk of keys){studio[kk].person.group.visible=false;studio[kk].bike.group.visible=false;}}}catch{for(const kk of ['player','jamie','sam','alex']){cast.studio[kk].person.group.visible=false;cast.studio[kk].bike.group.visible=false;}}
  if(!ok)photoSketch(cv.g,PHOTO.w,PHOTO.h,{who});const g=cv.g;g.fillStyle='rgba(255,138,58,.95)';g.font='bold 16px monospace';g.fillText("'11 7 16",PHOTO.w-96,PHOTO.h-14);cv.rendered=ok;return cv;}
 function photoRender(){if(!PH.four){PH.four=photoCanvas(['player','jamie','sam','alex']);PH.fourTex=texOf(PH.four);}if(!PH.one){PH.one=photoCanvas(['player']);PH.oneTex=texOf(PH.one);}photoState(PH.state);}
 function photoState(s){PH.state=s;C.flags&&(C.flags.altered=s==='one');const m=house.photoMat,t=s==='one'?PH.oneTex:PH.fourTex;if(t){m.map=t;m.color.setHex(0xffffff);}else{m.map=null;m.color.setHex(s==='one'?0xc8b896:0xd8c8a0);}m.needsUpdate=true;}
 // ---- the spots F works on ---------------------------------------------------------------------------------------------------------
 const V3=q=>new THREE.Vector3(q.x,q.y??gy(q.x,q.z),q.z);
 function spots(){const out=[],ph=S.phase,p=me();
  const add=(id,label,q,r=2.4,o2={})=>out.push({id,label,at:V3(q),face:V3(q),r,wide:true,...o2});const lk=(size,cone=.14)=>({look:true,size,cone});
  // (on the porch roof you are posed: the drop is the one thing to do)
  if(ph==='e7-out'&&C.flags.out&&!C.flags.dropped){add('c7-drop','Drop down',court.SPOT.porchDrop,6);return out;}
  if(C.view||C.fadeOut>=0||posed()||phys.playerBusy()||C.choice)return out;
  if(ph==='d7-step'&&C.st?.knock&&!C.st.knocked)add('c7-knock','Knock',{x:STEP.x,y:STEP.y+1.4,z:STEP.z},2.6);
  if(/^d7-(house|garage|reyes)$/.test(ph)&&inSams(p)){const rm=house.room(p.x,p.z);
   if(rm==='sam'){if(house.ST.fan&&!C.flags.fanOff)add('c7-fan','Turn off the fan',HS.fan,1.8,lk(.3,.16));add('c7-photo','Pick up the photograph',HS.photo,1.9,lk(.18,.16));
    if(!C.inv.notebook)add('c7-notebook','Take Sam’s notebook',HS.notebook,1.9,lk(.16,.16));else if(C.inv.notebook==='have'&&!C.looked.has('reread'))void 0;
    for(const id of Object.keys(ROOM_LOOKS))if(!C.looked.has(id))add('c7-look-'+id,{shelf:'Look at the shelf',games:'Look at the games',helmet:'Look at his helmet',hoodie:'Look at his hoodie',fish:'Look at the wooden fish',window:'Look out the window',bed:'Look at his bed'}[id],HS[id],2.2,lk(id==='window'?.5:id==='bed'?.6:.22,.14));}
   if(rm==='kitchen'&&!C.looked.has('flyer'))add('c7-flyer','Look at the flyers',{...HS.kitchenTable,y:HS.kitchenTable.y+.02},2.4,lk(.25,.14));
   if(rm==='kitchen'&&!C.looked.has('list'))add('c7-list','Read the list on the fridge',HS.fridge,2.2,lk(.18,.14));
   if(rm==='living'&&!C.looked.has('tv'))add('c7-tv','Look at the TV',HS.tv,3.2,lk(.4,.12));
   if((rm==='living'||rm==='hall')&&(ph==='d7-garage')&&C.gr?.stage==='go')add('c7-out','Go outside',HS.door,2.4,lk(.6,.2));
   if(ph==='d7-reyes'&&C.rx?.stage==='notebook'&&C.inv.notebook==='have')add('c7-give','Show Officer Reyes the notebook',reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),3);}
  if(ph==='e7-lookout'){if(!C.looked.has('curbstones'))add('c7-curbstones','Look at the ground',court.SPOT.curb,3.6,lk(.6,.1));if(!C.looked.has('post'))add('c7-post','Look at the post',{...court.SPOT.post,y:court.SPOT.post.y+1.1},2.6,lk(.2,.14));
   if(!C.looked.has('chalk'))add('c7-chalk','Look at the chalk',LK.chalk,3,lk(.5,.1));}
  if(/^e7-(court|dining|house)$/.test(ph)&&court.inRegionAt(p.x,p.z)&&!court.inHouseAt(p.x,p.z)){if(!C.looked.has('newspaper'))add('c7-newspaper','Pick up the newspaper',court.SPOT.newspaper,2.2,lk(.3,.14));
   if(!C.looked.has('car'))add('c7-car','Look at the car',{...court.SPOT.fifty9,y:court.G0+1},4,lk(1.2,.08));if(!C.looked.has('sign'))add('c7-sign','Look at the street sign',{...court.SPOT.sign,y:court.G0+2.7},4,lk(.4,.1));
   if(C.flags.windowHit&&!C.looked.has('crack'))add('c7-crack','Look at the window',court.SPOT.diningWindow,4,lk(.6,.1));
   for(const [id,q] of [['mbDining',court.SPOT.mbDining],['mbGreen',court.SPOT.mbGreen]])if(!C.looked.has(id))add('c7-'+id,'Read the mailbox',q,2.0,lk(.3,.16));
   if(ph==='e7-court'&&C.ct?.stage==='lost'&&C.ct.knockAsk&&(C.ct.knocks||0)<2&&!C.ct.knocking)for(const [id,q] of Object.entries(court.SPOT.doors))if(q&&Math.hypot(p.x-q.x,p.z-q.z)<3.2)add('c7-door-'+id,C.ct.knocked?.has?.(id)?'Knock again':'Knock',q,3.2,lk(.6,.14));}
  if(/^e7-(house|reveal)$/.test(ph)&&inGreen()){if(!C.looked.has('testpattern'))add('c7-testpattern','Look at the television',{...HW(-1.75,-.9),y:court.G0+HH.F+.75},2.6,lk(.4,.12));if(!C.looked.has('clock'))add('c7-clock','Look at the clock',{...HW(-2.2,-4.4),y:court.G0+HH.F+1.9},2.6,lk(.3,.12));}
  if(ph==='e7-stalk'||(ph==='e7-reveal'&&C.gh?.hideNow)){if(C.hiding)add('c7-unhide','Come out',camera.position.clone().add(new THREE.Vector3(0,-.3,0)),5);
   else for(const [id,h] of Object.entries(HGd.hides)){const w=HW(h.x,h.z);if(Math.hypot(p.x-w.x,p.z-w.z)<1.9)add('c7-hide-'+id,h.label,{...w,y:w.y+1},2.2);}}
  if(ph==='e7-door'){const q=houseLocal(p.x,p.z);if(!C.dr.shut&&q.x<-HH.UCX&&q.z>0&&C.lv==='u')add('c7-shut','Shut the door',{...HW(-HH.UCX,3.3,'u'),y:court.G0+HH.UP+1.1},2.6);if(C.dr.shut&&!C.dr.pushed)add('c7-push','Push the dresser against the door',{...HW(-HH.UCX-.55,1.0,'u'),y:court.G0+HH.UP+.6},2.2);}
  if(/^e7-(upstairs|giant)$/.test(ph)){const q=houseLocal(p.x,p.z);
   if(!C.looked.has('calendar'))add('c7-calendar','Look at the calendar',{...HW(-5,2.05,'u'),y:court.G0+HH.UP+1.55},2.4,lk(.25,.14));
   if(!C.looked.has('trace'))add('c7-trace','Look at the paper on the desk',{...HW(-4.55,.95,'u'),y:court.G0+HH.UP+.8},2.2,lk(.2,.14));
   if(!C.looked.has('oldbike'))add('c7-oldbike','Look at the old bike',{...HW(-3.6,-2.5,'u'),y:court.G0+HH.UP+.7},2.6,lk(.5,.12));else if(!C.flags.bell)add('c7-bell','Try the bell',{...HW(-3.4,-2.1,'u'),y:court.G0+HH.UP+1.0},2.2,lk(.15,.18));
   if(!C.looked.has('wedding'))add('c7-wedding','Look at the picture',{...HW(4.6,-.6,'u'),y:court.G0+HH.UP+.95},2.4,lk(.2,.14));
   if(C.up?.down&&!C.gt)add('c7-hallwindow','Look out the window',{...HW(0,-4.5,'u'),y:court.G0+HH.UP+1.5},2.6,lk(.6,.12));
   if(C.gt?.lights&&court.ST.portalB&&Math.abs(q.x)<1.3&&q.z<-3)add('c7-climb','Climb out onto the porch roof',{...HW(0,-4.6,'u'),y:court.G0+HH.UP+1.2},2.4);}
  if(ph==='n7-grab'&&C.gb?.stage==='grab'&&JL.held){const h=jamieHand();if(dist2(p,h)<1.8)add('c7-grab','Grab his hand',h,2.2);}
  if(/^n7-(taken|gone)$/.test(ph)){if(C.inv.gum==='grass'&&C.gumAt)add('c7-gum','Pick up the gum',C.gumAt,1.8,lk(.15,.2));if(ph==='n7-gone'&&!(C.gn?.callT>0))out.push({id:'c7-call',label:'Call his name',at:camera.position.clone().add(new THREE.Vector3(0,-.2,0)),face:camera.position.clone(),r:9,wide:true});}
  if(/^n7-(sams|names)$/.test(ph)&&inSams(p)){const rm=house.room(p.x,p.z);if(rm==='sam'){if(house.ST.fan&&!C.flags.fanOffNight&&!C.sn?.fanBeat)add('c7-fan','Turn off the fan',HS.fan,1.8,lk(.3,.16));
    if(C.flags.forgetFan&&!C.flags.photoSeenNight)add('c7-photo','Pick up the photograph',HS.photo,1.9,lk(.18,.16));if(C.flags.forgetPhoto&&!C.flags.names)add('c7-write','Write in Sam’s notebook',HS.notebook,2,lk(.2,.18));
    if(C.flags.lookOutside)add('c7-window','Look outside',HS.window,2.4,lk(.5,.14));}}
  return out;}
 function act(id){const ph=S.phase;
  if(id==='c7-knock')knock();else if(id==='c7-fan'){if(ph==='n7-sams'){house.ST.fan=false;sound('click',HS.fan,{gain:.5});C.flags.fanOffNight=C.t;mark('the fan, off (night)');}else fanOff();}
  else if(id==='c7-photo'){if(ph==='n7-sams'){C.flags.photoSeenNight=true;}lookPhoto();}else if(id==='c7-notebook')takeNotebook();
  else if(id.startsWith('c7-look-'))roomLook(id.slice(8));
  else if(id==='c7-flyer'){C.looked.add('flyer');const q=HS.kitchenTable;closeLook({x:q.x+.3,y:q.y,z:q.z+.3},{back:.55,eye:1.3,kind:'flyer',floor:HS.couch.y});C.lookDur=8;
   say([N('MISSING. SAM. Age 12. His school picture from fifth grade, the one he hated.',{time:3.6}),...(near({x:jamie.px,z:jamie.pz},4)?[J('He hated that picture. He said it made him look like a lawyer.',{time:3,face:'sad'})]:[])]);}
  else if(id==='c7-list'){C.looked.add('list');const q=HS.fridge;closeLook(q,{back:.5,eye:1.42,kind:'list',floor:HS.couch.y});C.lookDur=9;
   say([N('Her handwriting. Fri 8/26. Call the detective’s office at nine. Flyers: library, Kroger, the pool, church. Brandt? Call Grandma back. Feed the cat.',{time:5.4}),N('And at the bottom, just: SAM.',{time:2.6})]);}
  else if(id==='c7-tv'){C.looked.add('tv');closeLook(HS.tv,{back:2.2,eye:1.25,kind:'tv',floor:HS.couch.y});C.lookDur=7;say([N('The local news with the sound off. A map of Old Mill Road. The works’ gate. Then a picture of Sam.',{time:4.4})]);}
  else if(id==='c7-out')goOutside();else if(id==='c7-give')giveNotebook();
  else if(id==='c7-curbstones'){C.looked.add('curbstones');const q=court.SPOT.curb;closeLook({x:q.x,y:q.y+.05,z:q.z},{back:1.2,eye:1.42,kind:'curbstones'});C.lookDur=7;
   say([N('Curbstones in the grass. A straight line of them, going on past the end of the fence.',{time:3.6}),R('Huh. That’s curb. That’s old curb.',{time:2})]);}
  else if(id==='c7-post'){C.looked.add('post');const q=court.SPOT.post;closeLook({x:q.x,y:q.y+1.1,z:q.z},{back:.7,eye:1.42,kind:'post'});C.lookDur=5;say([N('A township post, green tag: R.O.W. OAK HOLLOW TWP. DO NOT OBSTRUCT.',{time:3.4})]);}
  else if(id==='c7-chalk'){C.looked.add('chalk');closeLook({...LK.chalk,y:LK.chalk.y+.02},{back:.5,eye:.75,kind:'chalk'});C.lookDur=6;say([N('J S A. Still there.',{time:2}),J('…We should write him in. Sam. Like— so it’s right.',{time:2.8,face:'sad'})]);}
  else if(id==='c7-newspaper')lookNewspaper();else if(id==='c7-car')lookCar();
  else if(id==='c7-sign'){C.looked.add('sign');const q=court.SPOT.sign;closeLook({x:q.x,y:court.G0+2.75,z:q.z},{back:2.0,eye:1.45,kind:'sign'});C.lookDur=5;say([N('OLD MILL CT. Green, the old kind of sign. Not a scratch on it.',{time:3.2})]);}
  else if(id==='c7-crack'){C.looked.add('crack');const q=court.SPOT.diningWindow;closeLook(q,{back:1.3,eye:1.5,kind:'crack'});C.lookDur=7;
   say([N('The glass is cracked from the inside. A star of cracks the size of a hand.',{time:3.4}),...(near({x:jamie.px,z:jamie.pz},6)?[J('From the INSIDE.',{time:1.6,face:'terrified'})]:[])]);}
  else if(id==='c7-testpattern'){C.looked.add('testpattern');const q=HW(-1.75,-.9);closeLook({x:q.x,y:court.G0+HH.F+.65,z:q.z},{back:1.4,eye:1.3,kind:'tv'});C.lookDur=5;say([N('A test pattern: circles and wedges and a station number nobody has used in years. A thin tone you feel more than hear.',{time:4.2})]);}
  else if(id==='c7-clock'){C.looked.add('clock');const q=HW(-2.2,-4.4);closeLook({x:q.x,y:court.G0+HH.F+1.9,z:q.z},{back:1.1,eye:1.5,kind:'clock'});C.lookDur=4.5;say([N('A starburst clock. Stopped at 7:42.',{time:3})]);}
  else if(id.startsWith('c7-hide-'))hide(id.slice(8));else if(id==='c7-unhide')unhide();
  else if(id==='c7-shut')shutDoor();else if(id==='c7-push')pushDresser('you');
  else if(id.startsWith('c7-door-'))knockCourt(id.slice(8));
  else if(id==='c7-mbDining'||id==='c7-mbGreen'){const k2=id.slice(3),q=court.SPOT[k2],jn=near({x:jamie.px,z:jamie.pz},5);C.looked.add(k2);closeLook(q,{back:.75,eye:1.42,kind:'mailbox'});C.lookDur=6.5;mark('the mailbox: '+k2);
   say(k2==='mbDining'?[N('CARVER, in white letters on the side of the mailbox.',{time:3}),...(jn?[J('Carver.',{time:1.2}),J('Like the girl. Ruth Ann Carver. Nineteen sixty-six.',{time:2.8,face:'afraid'})]:[])]
    :[N('WHITCOMB.',{time:2}),...(jn?[J('…Danny Whitcomb.',{time:1.8,face:'afraid'}),J('The green bike.',{time:1.6})]:[])]);}
  else if(id==='c7-calendar')lookCalendar();else if(id==='c7-trace')lookTrace();else if(id==='c7-oldbike')lookOldBike();else if(id==='c7-bell')ringOldBell();else if(id==='c7-wedding')lookWedding();
  else if(id==='c7-hallwindow')giantStart();else if(id==='c7-climb')climbOut();else if(id==='c7-drop'){C.flags.dropped=true;dropDown();go('e7-out');}
  else if(id==='c7-grab')grabHand();else if(id==='c7-gum')pickGum();else if(id==='c7-call')callName();
  else if(id==='c7-write')writeStart();else if(id==='c7-window')lookOutside();}
 // ---- keys, the mouse, the hint row --------------------------------------------------------------------------------------------------
 function key(code,repeat){if(!mine(S.phase))return false;
  if(C.capturedT!=null&&C.fadeIn<0&&S.phase!=='c7-black'&&C.sk?.caught)return true;
  if((code==='KeyI'||code==='Tab')&&!inv.isOpen&&(C.view||C.fadeOut>=0||C.endT>=0||S.phase==='c7-black'||C.choice))return true;if(inv.key(code,repeat))return true;
  if(C.choice){const m=/^(Digit|Numpad)([1-3])$/.exec(code);if(m){if(!repeat)pick(+m[2]-1);return true;}return ['KeyF','KeyW','KeyA','KeyS','KeyD','Space'].includes(code);}
  if(C.view==='inspect'){if((code==='KeyS'||code==='ArrowDown'||code==='KeyF')&&!repeat&&C.inspect?.t>.35){endInspect();return true;}if(code==='KeyA'){C.inspect.yaw-=.25;return true;}if(code==='KeyD'){C.inspect.yaw+=.25;return true;}return ['KeyW','Space','KeyC','KeyS'].includes(code);}
  if(C.view==='look'&&C.lookKind==='map'){if(mapKey(code))return true;return ['KeyW','KeyS','Space','KeyC'].includes(code);}
  if(C.view==='look'){const locked=['names','window'].includes(C.lookKind);if((code==='KeyS'||code==='ArrowDown')&&!busy()&&!locked){if(!repeat)endLook();return true;}return ['KeyW','KeyA','KeyD','Space','KeyC','KeyS'].includes(code)||(locked&&code==='KeyF');}
  if(S.phase==='n7-grab'&&C.gb?.stage==='struggle')return ['KeyF','KeyS','KeyW','KeyA','KeyD','Space'].includes(code);
  if(S.phase==='n7-names'&&!C.flags.names)return code==='KeyF';// (F writes, while there is writing to do; then it is yours again)
  if(C.hiding&&['KeyW','KeyA','KeyS','KeyD','Space'].includes(code))return true;
  return false;}
 function pan(dx,dy){if(!mine(S.phase))return false;if(C.view==='inspect'){C.inspect.yaw+=dx*.006;C.inspect.pitch=clamp(C.inspect.pitch+dy*.006,-1.2,1.2);return true;}
  if(C.view==='look'&&C.lookKind==='map'&&C.mp?.stage==='look'){MAPV.cursor.x=clamp(MAPV.cursor.x+dx*.0011,.02,.98);MAPV.cursor.y=clamp(MAPV.cursor.y+dy*.0011,.02,.98);drawMap();return true;}return false;}
 function wheel(dy){if(!mine(S.phase))return false;if(C.view==='look'&&C.lookKind==='map'){MAPV.overlay=clamp(MAPV.overlay+(dy<0?.25:-.25),0,1);drawMap();return true;}return false;}
 function hint(){const ph=S.phase;
  if(C.choice)return C.choice.options.map((op,i)=>[String(i+1),op.label]);
  if(C.view==='inspect')return [['Mouse / A D','Turn it'],['S','Put it down']];
  if(C.view==='look'&&C.lookKind==='map')return C.mp?.stage==='look'?[['Mouse','The pencil'],['A / D','The 1958 plan'],['F','Mark it']]:null;
  if(C.view==='look'&&C.lookKind==='names')return C.flags.names?null:[['Hold F','Write']];
  if(C.view==='look')return ['window'].includes(C.lookKind)?null:[['S','Step back']];
  if(ph==='n7-grab'&&C.gb?.stage==='struggle')return [['Hold F',`Hold on · ${Math.round(C.gb.grip*100)}%`],['S','Pull']];
  if(C.hiding)return [['F','Come out']];
  if(ph==='e7-stalk'&&!C.hiding)return [['C','Crouch'],['F','Hide (by a door)']];
  if(ph==='n7-chase')return [['W + Shift','Ride hard'],['A / D','Steer']];
  return null;}
 // ---- sounds in the world; what is in the way --------------------------------------------------------------------------------------
 function sources(out){const ph=S.phase,p=me();
  if(house.root.parent&&house.ST.spin>.05)out.push({id:'c7-fan',kind:'fan',pos:HS.fan,level:.6*house.ST.spin,muffle:inSams(p)?0:.85});
  if(/^e7-(court|dining)$/.test(ph)&&C.dn)out.push({id:'c7-dining-tv',kind:'tv',pos:court.SPOT.diningWindow,level:.45,muffle:.55});
  if(/^e7-(house|reveal|stalk|door)$/.test(ph))out.push({id:'c7-console',kind:'tv',pos:HW(-3.1,-3.9),level:.18,muffle:inGreen(p)?0:.7});
  if(/^n7-(lookout|grab|taken|gone|after)$/.test(ph)&&k.carA.active)out.push({id:'c7-car-radio',kind:'radio',pos:k.carA.pos||{x:k.carA.x,y:1,z:k.carA.z},level:.35});
  if(ph==='n7-gone'&&C.gn?.reyes||ph==='n7-after')out.push({id:'c7-sirens',kind:'siren',pos:main(980,0),level:ph==='n7-after'?.15:.35,mode:'wail'});}
 function blockers(){const out=[];if(HM.visible&&H.mode!=='off'&&H.mode!=='chase'&&S.phase!=='n7-chase')out.push({x:HM.x,z:HM.z,r:HM.radius(),speed:H.speed||0});
  for(const a of [samDad,samMom,cast.jamieMom])if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});
  if(C.canAt&&/^n7-/.test(S.phase))out.push({x:C.canAt.x,z:C.canAt.z,r:.45,speed:0,low:true});
  if(C.jBikeDown)out.push({x:C.jBikeDown.x,z:C.jBikeDown.z,r:.6,speed:0,low:true});return out;}
 function updateAmb(dt){const ph=S.phase,p=me();let want;
  if(inSams(p))want={traffic:.15,life:.4,insects:ph==='n7-sams'?.5:.2,wind:.1,forest:0,tunnel:0,water:0};
  else if(court.ST.active&&court.inRegionAt(p.x,p.z))want={traffic:0,life:0,insects:C.h<19?.9:.6,wind:.25,forest:.15,tunnel:inGreen(p)?.25:0,water:0};
  else want={traffic:/^n7/.test(ph)?.2:.55,life:/^d7/.test(ph)?1:.4,insects:.8,wind:.4,forest:0,tunnel:0,water:0};
  for(const kk in want)C.amb[kk]=damp(C.amb[kk]??0,want[kk],.6,dt);}
 // ---- Jamie down in the grass (thrown, held by the ankle, dragged): posed here, out of the companions' hands ------------------------------
 const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_m4=new THREE.Matrix4(),_bx=new THREE.Vector3(),_by=new THREE.Vector3(),_bz=new THREE.Vector3(0,-1,0);
 function poseJamieDown(dt){if(!JL.on)return;JL.t+=dt;const g=jamie.person.group,p=me();
  // where his feet are: held, the creature's hand; else where he landed
  if(JL.held){const s2=HM.sockets.grab.getWorldPosition(new THREE.Vector3());const dx=s2.x-HM.x,dz=s2.z-HM.z,l=Math.hypot(dx,dz);
   JL.dir=l>.05?{x:dx/l,z:dz/l}:JL.dir;JL.x=s2.x;JL.z=s2.z;JL.y=gy(s2.x,s2.z);}
  else{const dx=p.x-JL.x,dz=p.z-JL.z,l=Math.hypot(dx,dz)||1;JL.dir={x:dx/l,z:dz/l};}
  _by.set(JL.dir.x,0,JL.dir.z);_bx.set(JL.dir.z,0,-JL.dir.x);_m4.makeBasis(_bx,_by,_bz);_q1.setFromRotationMatrix(_m4);
  if(JL.phase==='thrown'){const u=Math.min(1,JL.t/.55),f=JL.from;g.position.set(f.x+(JL.x-f.x)*u,f.y+(JL.y+.12-f.y)*u+Math.sin(u*Math.PI)*.9,f.z+(JL.z-f.z)*u);
   _q2.setFromEuler(new THREE.Euler(0,-headingTo(f.x,f.z,JL.x,JL.z),0));g.quaternion.copy(_q2).slerp(_q1,smooth(u));if(u>=1){JL.phase='down';sound('c7Fall',g.position,{gain:1});}}
  else{g.position.set(JL.x,JL.y+.12,JL.z);g.quaternion.slerp(_q1,1-Math.exp(-14*dt));}
  // his body: arms up over his head (toward you), clawing; one knee up; his head lifted to look at you
  const P2=JL.pose,t=JL.t;standPose(P2,t,{});const claw=Math.sin(t*7.1),claw2=Math.sin(t*6.3+1.3);
  P2[PI.lh]=-.22;P2[PI.lh+1]=1.72+.12*claw;P2[PI.lh+2]=-.1+.08*claw2;P2[PI.rh]=.22;P2[PI.rh+1]=1.72+.12*claw2;P2[PI.rh+2]=-.1+.08*claw;
  P2[PI.le]=-.8;P2[PI.le+1]=.1;P2[PI.le+2]=.3;P2[PI.re]=.8;P2[PI.re+1]=.1;P2[PI.re+2]=.3;
  P2[PI.lf]=-.14;P2[PI.lf+1]=.28+.1*Math.max(0,claw);P2[PI.lf+2]=-.32;P2[PI.rf]=.1;P2[PI.rf+1]=.05;P2[PI.rf+2]=0;P2[PI.hp]=.55;P2[PI.hy]=.15*Math.sin(t*2.1);
  if(JL.grip){g.updateMatrixWorld(true);const ch=camera.position.clone().add(new THREE.Vector3(0,-.3,0)),L=g.worldToLocal(ch);const k2=Math.min(1,1.0/Math.max(.5,L.length()));
   P2[PI.rh]=L.x*k2*.9;P2[PI.rh+1]=Math.min(1.95,L.y*k2);P2[PI.rh+2]=L.z*k2*.9;}
  applyPose(jamie.person,P2);jamie.person.face?.set?.('terrified',{hold:2});}
 // ---- minds: Jamie's mood by where the chapter is ------------------------------------------------------------------------------------------
 function mind(){const ph=S.phase,key=ph+(C.flags.hurry?'!':'');if(C.mindKey===key)return;C.mindKey=key;let mood='relaxed';
  if(/^d7-(house|reyes|map)$/.test(ph))mood='relaxed';else if(/^d7-(garage)$/.test(ph))mood='tense';else if(/^e7-(court)$/.test(ph))mood='tense';else if(/^e7-(dining|house|reveal|stalk|door)$/.test(ph))mood='danger';
  else if(/^e7-(upstairs|giant|out)$/.test(ph))mood='tense';else if(/^n7-/.test(ph))mood='escape';
  brain.setScene({mood,pois:[],goal:null});}
 // ---- every frame -----------------------------------------------------------------------------------------------------------------------------
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase;mind();court.ST.level=C.lv||'g';
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  clock(dt);updatePose(dt);match(dt);guard(dt);standAll();inv.update();if(inv.isOpen&&(C.view||posed()||C.fadeOut>=0||C.endT>=0))inv.close();
  // the lane's crossing (your last position to this one)
  const p=me();if(C.prevP&&Math.hypot(p.x-C.prevP.x,p.z-C.prevP.z)<3)crossing(C.prevP,p);C.prevP={x:p.x,z:p.z};
  // which floor you are on in the green-door house (and Jamie): the stair hands you up or down as you leave it
  if(court.ST.active){const q=houseLocal(p.x,p.z);if(court.inHouseAt(p.x,p.z)&&HGd.inStair(q.x,q.z))C.lv=(q.z-STAIR.z0)/(STAIR.z1-STAIR.z0)>.5?'u':'g';else if(!court.inHouseAt(p.x,p.z))C.lv='g';
   const jq=houseLocal(jamie.px,jamie.pz);if(jamie.mode==='foot'&&court.inHouseAt(jamie.px,jamie.pz)&&HGd.inStair(jq.x,jq.z))C.jlv=(jq.z-STAIR.z0)/(STAIR.z1-STAIR.z0)>.5?'u':'g';else if(!court.inHouseAt(jamie.px,jamie.pz))C.jlv='g';}
  court.ST.level=C.lv||'g';
  if(house.root.parent)house.update(dt);if(court.ST.active)court.update(dt,{camera,dusk:sky().p});
  cast.update(dt,{eye:camera.position});H.update(dt);poseJamieDown(dt);updateGum(dt);updateInspect(dt);
  for(const a of [samDad,samMom,cast.jamieMom])if(a.visible)a.update(dt,{eye:camera.position});updateAmb(dt);
  if(C.dn?.shake>0){C.dn.shake-=dt;court.dining.frame.position.x+=Math.sin(C.t*70)*.004*(C.dn.shake/.5);}
  if(C.bk?.carHit>0){C.bk.carHit-=dt;const c=C.bk.car;if(c)c.g.rotation.z=Math.sin(C.t*40)*.04*(C.bk.carHit/.5);}
  if(C.ch?.knockT>0){C.ch.knockT-=dt;if(C.ch.knockT<=0)o.roam.brake=0;}
  if(C.gn?.callT>0)C.gn.callT-=dt;if(C.lo?.callT>0)C.lo.callT-=dt;
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.6));if(C.fadeIn>=1.6){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.8));if(C.fadeOut>=1){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(C.choice){C.choice.t+=dt;if(C.choice.t>C.choice.timeout){const ch=C.choice;C.choice=null;ch.then(ch.fallback);}}
  if(ph==='c7-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<5.6&&!C.cardOn)card(true,{title:'Chapter Seven',eyebrow:'LAST LIGHT',sub:'THE STREET THAT WASN’T THERE<br><small>FRIDAY, AUGUST 26, 2011</small>'});if(C.cardT>5.6&&C.cardOn)card(false);if(C.cardT>6.8)opening();}
  else if(ph==='d7-step')updateStep(dt);
  else if(ph==='d7-house')updateHouse(dt);
  else if(ph==='d7-garage'){if(C.rm&&inSams(p))updateRoom(dt);updateGarage(dt);}
  else if(ph==='d7-map')updateMap(dt);
  else if(ph==='e7-ride')updateRide(dt);
  else if(ph==='e7-lookout')updateLookout(dt);
  else if(ph==='e7-court')updateCourt(dt);
  else if(ph==='e7-dining'){updateDining(dt);if(C.ct)updateCourt(dt);}
  else if(ph==='e7-house'||ph==='e7-reveal'){updateGreen(dt);if(C.dn)updateDining(dt);}
  else if(ph==='e7-stalk')updateStalk(dt);
  else if(ph==='e7-door')updateDoor(dt);
  else if(ph==='e7-upstairs')updateUpstairs(dt);
  else if(ph==='e7-giant'){updateGiant(dt);updateUpstairs(dt);}
  else if(ph==='e7-out'){if(C.flags.dropped&&C.flags.out&&!C.bk&&near(me().bike,24))bikesStart();else if(C.flags.dropped&&!C.bk&&C.t-(C.outT2??=C.t)>20)bikesStart();}
  else if(ph==='n7-bikes')updateBikes(dt);
  else if(ph==='n7-chase')updateChase(dt);
  else if(ph==='n7-lookout')updateOakOut(dt);
  else if(ph==='n7-grab'||ph==='n7-taken')updateGrab(dt);
  else if(ph==='n7-gone')updateGone(dt);
  else if(ph==='n7-sams')updateSams(dt);
  else if(ph==='n7-names')updateWrite(dt);
  else if(ph==='n7-window'){if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n7-end');end();}}}
  if(C.view==='look'&&C.lookDur){C.lookT+=dt;if(C.lookT>C.lookDur&&!busy())endLook();}
  const L7=sky();A.day=L7.day;A.night=L7.night;ch2.day=A.day;A.shade=0;A.barLight=false;
  // (the companions are placed next, on Jamie's own floor; the after-actors hook puts yours back)
  court.ST.level=C.jlv||'g';}
 function afterActors7(dt){if(!owns(S.phase))return;court.ST.level=C.lv||'g';
  k.torchO.visible=false;
  for(const a of [reyes,officer,samDad,samMom,cast.jamieMom]){if(!a.visible)continue;const pp=a.pose;if(a.lookAt){const head=a.person.parts.head.getWorldPosition(new THREE.Vector3()),to=a.lookAt,want=clamp(Math.atan2((to.y??head.y)-head.y,Math.max(.3,Math.hypot(to.x-head.x,to.z-head.z))),-.6,.4);a.look7=damp(a.look7||0,want,5,dt);pp[PI.hp]=a.look7;}applyPose(a.person,pp);}
  // Sam's dad, that night, sitting on Sam's bed
  if(S.phase==='n7-sams'||S.phase==='n7-names'||S.phase==='n7-window'){const d=samDad;if(d.visible&&!d.walking){sitPose(d.pose,{seat:.5/1.2,legs:'bent',t:C.t,hands:'knees',look:0});d.pose[PI.hp]=-.35;applyPose(d.person,d.pose);}}
  for(const art of ch6.appearances6.values())art.update(dt,{clock:C.t,eye:camera.position,phase:S.phase});for(const art of extraArt.values())art.update(dt,{clock:C.t,eye:camera.position,phase:S.phase});}
 {const prev=A.afterActors6;A.afterActors6=(dt,o2)=>{prev?.(dt,o2);afterActors7(dt,o2);};}
 // ---- lifecycle ---------------------------------------------------------------------------------------------------------------------------------
 const GUM0=(()=>{const g=house.items.gum;return {parent:g.parent,pos:g.position.clone(),rot:g.rotation.clone()};})();
 function reset(){const hadPose=C.pose,hadView=!!C.view;card(false);if(C.view==='inspect')endInspect();if(C.view==='look')C.view=null;inv.reset();C.choice=null;
  if(nav.room===house.nav||nav.room===court.nav)nav.setRoom(null);house.reset();court.reset();cast.reset();H.reset();HM.show(false);HL.level='g';lightsOn(false);
  for(const a of [samDad,samMom,cast.jamieMom]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  mapMesh.visible=false;mapMesh.removeFromParent();if(C.wr?.page)C.wr.page.removeFromParent();C.pencil?.removeFromParent();holder.removeFromParent();
  for(const f of [gripArms,writeArm]){const i=phys.ME.extra.indexOf(f);if(i>=0)phys.ME.extra.splice(i,1);}
  {const g=house.items.gum;GUM0.parent.add(g);g.position.copy(GUM0.pos);g.rotation.copy(GUM0.rot);g.visible=true;}
  JL.on=false;JL.held=false;JL.grip=false;radioHand.visible=false;world.sideDoors.sam?.set(0);
  for(const c of [jamie,sam]){c.gone=false;c.crouch=0;c.boost=1;}jamie.bike.group.rotation.z=0;sam.person.group.visible=true;sam.bike.group.visible=true;
  for(const s2 of Object.values(cast.studio)){s2.person.group.visible=false;s2.bike.group.visible=false;}
  A.rideBoost=1;A.rideFov=0;o.setPace?.(1);o.roam.brake=0;
  presentation7(false);if(A7.started)ch5.presentation(false);A7.started=false;A7.finished=false;
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView||C.hiding)o.roam.walkLock=false;const fails=C.fails;fresh();if(C.keepFails)C.fails=fails;}
 // QA jumps, DEV scenes and Continue: the chapter at one of its moments, every earlier beat's flags set as playing sets them.
 function jump(section){jumpTo(section);}
 function jumpTo(section){section=ALIAS7[section]||section;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();minds();A7.started=true;
  if(section==='chapter7-start'){begin();return;}
  common();dayWorld();objective('');phys.reset();o.foot.arms=phys.arms;
  // (the photograph is the four of you until that night in Sam's room, on every jump, whatever was played before)
  PH.state=SECTIONS7.indexOf(section)>=SECTIONS7.indexOf('c7-sams')?'one':'four';photoRender();
  const ix=SECTIONS7.indexOf(section),ff=(...ks)=>{for(const kk of ks)C.flags[kk]=true;},hh=h=>{C.h=h;C.hMin=h;C.minute=-1;date(h);},quiet=()=>{S.queue.length=0;S.line=null;};
  const yourBike=()=>({x:yourBikeAt.x,z:yourBikeAt.z,a:driveA(1.1,-1.2)});
  // (Jamie where he would be: behind you in the hall, or by the nightstand where the gum was; never in Sam's doorway)
  const inRoomAt=(hx,hz,lookX,lookZ,jq=null)=>{house.show(true);nav.setRoom(house.nav);const q=house.toW(hx,hz),l=house.toW(lookX,lookZ);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,l.x,l.z),mode:'walk',bike:yourBike()});
   jq=jq||{x:HS.gum.x-.6,z:HS.gum.z-.5};comp.putFoot(jamie,jq.x,jq.z,headingTo(jq.x,jq.z,l.x,l.z),{bike:null});follow(true);jamie.follow='walk';};
  // ---- Act I ----
  if(ix<=SECTIONS7.indexOf('c7-garage')){hh(HOUR.start+.05);placeOutsideSams();
   if(section==='c7-step'){opening();quiet();C.st.t=0;return;}
   ff('jamieUp');C.st={t:20,talk:true,knock:true,knocked:true};
   if(section==='c7-family'){inside();C.fadeIn=-1;o.fade(0);return;}
   go('d7-house');houseAdults('morning');ff('mayRoom');C.hs={t:40};
   if(section==='c7-bedroom'){inRoomAt(1.4,2.45,4,2.45,house.toW(.9,3.3));quiet();return;}
   inRoomAt(3.6,2.2,5,1.6);quiet();C.flags.inRoom=true;C.rm={t:30};checkpoint('c7-bedroom');
   if(section==='c7-fan'){objective('Sam’s room.','Look around. His dad’s in the hall.');return;}
   ff('notebook','photoSeen');C.inv.notebook='have';house.items.notebook.visible=false;
   if(section==='c7-gum'){gumBeat();return;}
   ff('gum','fanOff');C.inv.gum='jamie';house.items.gum.visible=false;C.rm.dadFan=true;C.rm.dadDone=true;
   quiet();garageNoise();return;}
  ff('jamieUp','mayRoom','inRoom','notebook','photoSeen','gum','fanOff','noise');C.inv.notebook='have';C.inv.gum='jamie';house.items.notebook.visible=false;house.items.gum.visible=false;
  // ---- Act II ----
  if(ix<=SECTIONS7.indexOf('c7-map')){hh(HOUR.reyes);C.gr={t:30,stage:'after',done:true,dad:true};tableStage();C.fadeIn=-1;o.fade(0);
   if(section==='c7-reyes')return;quiet();C.rx.stage='reading';mapStage();return;}
  ff('marked','notebookBack');C.inv.notebook='have';C.inv.radio=true;
  if(section==='c7-curb'){hh(HOUR.curb);curbStage();C.fadeIn=-1;o.fade(0);return;}
  ff('curbUp');C.flags.jamieTalk='look';
  // ---- Act III ----
  if(section==='c7-ride'){hh(HOUR.curb+.2);house.show(false);nav.setRoom(null);const q=main(SH.drivD+2,-2.4),q2=main(SH.drivD+12,-2.4),a=headingTo(q.x,q.z,q2.x,q2.z);
   o.placePlayer({x:q.x,z:q.z,a,mode:'ride',speed:0});const j=main(SH.drivD-1.5,-1.0);comp.putRiding(jamie,j.x,j.z,a,0);jamie.follow='ride';follow(true);
   const car=main(SH.drivD-12,-3.0);k.carA.show(true);k.carA.park(car.x,car.z,a);rideStart();C.rd.t=2;return;}
  hh(HOUR.lookout);house.show(false);
  const atLookout=(onBike=false)=>{const s0=LK.stop,b=main(LOOKOUT.stop.d-1,-1.6),a=headingTo(s0.x,s0.z,LK.oak.x,LK.oak.z);
   if(onBike){const c0=court.SPOT.cul,m=court.SPOT.mouth,a2=headingTo(c0.x,c0.z,m.x,m.z);o.placePlayer({x:c0.x,z:c0.z,a:a2,mode:'ride',speed:0});const j=court.R3(16.4,-22.6);comp.putRiding(jamie,j.x,j.z,a2,0);jamie.follow='ride';}
   else{o.placePlayer({x:s0.x,z:s0.z,a,mode:'walk',bike:{x:b.x,z:b.z,a}});const jb=main(LOOKOUT.stop.d-2,1.5);comp.putFoot(jamie,jb.x+.8,jb.z,a,{bike:{x:jb.x,z:jb.z,a,kick:1}});}follow(true);
   const car=k.carA;car.show(true);car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));};
  if(section==='c7-lookout'){atLookout();lookoutStart();return;}
  if(section==='c7-lane'){atLookout(true);court.attach(true);nav.setRoom(court.nav);go('e7-lookout');checkpoint('c7-lookout');C.lk={t:30,stage:'lane',reyesAt:true};court.ST.portalA=true;
   reyes.show(true);const rq=court.SPOT.curb;reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,court.SPOT.mouth.x,court.SPOT.mouth.z));reyes.gest('radio');objective('Follow the old court.','The path behind the oak. Ride slow.');return;}
  // ---- in the court ----
  court.attach(true);nav.setRoom(court.nav);court.ST.portalA=false;
  const inCourt=(x,z,{ride=false,ja=null}={})=>{const w=court.regW(x,z),wa=court.regW(x,z+5),a=headingTo(w.x,w.z,wa.x,wa.z);
   if(ride){o.placePlayer({x:w.x,z:w.z,a,mode:'ride',speed:0});const j=court.regW(x+1.6,z-2.4);comp.putRiding(jamie,j.x,j.z,a,0);jamie.follow='ride';}
   else{const b=C.bikesAt||{x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z,a:court.SPOT.bikeA};o.placePlayer({x:w.x,z:w.z,a:ja??a,mode:'walk',bike:b});const j=court.regW(x+1.2,z-1);const jb=court.SPOT.bikes[1];comp.putFoot(jamie,j.x,j.z,a,{bike:{x:jb.x,z:jb.z,a:court.SPOT.bikeA,kick:1}});}follow(true);};
  if(section==='c7-court'){hh(HOUR.court);inCourt(-8,29,{ride:true});courtStart();C.fadeIn=-1;return;}
  ff('fenceSeen');
  if(section==='c7-separation'){hh(HOUR.court+.05);const f=court.SPOT.fenceA,w=court.regW(-8,24),f2=court.regW(0,8);void w;o.placePlayer({x:f2.x,z:f2.z,a:headingTo(f2.x,f2.z,f.x,f.z),mode:'ride',speed:0});
   const j=court.regW(0,10);comp.putRiding(jamie,j.x,j.z,headingTo(j.x,j.z,f.x,f.z),0);jamie.follow='ride';follow(true);go('e7-court');checkpoint('c7-court');C.ct={t:12,stage:'back',backAt:0};quiet();return;}
  C.ct={t:120,stage:'lost',lostAt:0,fence:true,dark:true,seenYou:true,lights:true};C.bikesAt={x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z,a:court.SPOT.bikeA};ff('bikesLeft');
  hh(HOUR.dining);
  if(section==='c7-dining'){inCourt(1.2,60);go('e7-court');checkpoint('c7-court');diningStart();objective('The house with its lights on.','Across the lawn. Its front window.');return;}
  if(section==='c7-dining-scare'){const lk2=court.SPOT.diningLook,wi=court.SPOT.diningWindow,q2=court.regL(lk2.x,lk2.z);inCourt(q2.x,q2.z,{ja:headingTo(lk2.x,lk2.z,wi.x,wi.z)});go('e7-court');checkpoint('c7-court');diningStart();quiet();
   C.dn.stage='turn';cast.turnHeads(()=>camera.position,['mother','girl','boy','father'],1.0);C.dn.turnAt=0;return;}
  ff('windowHit');
  const diningAfter=()=>{diningStart();C.dn.stage='after';C.dn.hitAt=-30;C.dn.examined=true;C.dn.radio=true;court.dining.crack.material.opacity=1;for(const m of Object.values(cast.fam)){m.want=0;m.turnAt=0;}cast.D.target=()=>camera.position;};
  if(section==='c7-house'){hh(HOUR.house);inCourt(-6,92);diningAfter();go('e7-house');C.gh={t:0,stage:'door'};creatureUpstairs();objective('The house with the green door.','Across the street. Upstairs, he said.');return;}
  diningAfter();hh(HOUR.house+.1);
  const inHouse=(hx,hz,lv='g',look=null,jx=null,jz=null,jlv=null)=>{const w=HW(hx,hz,lv),l=look?HW(look[0],look[1],lv):HW(0,0,lv);C.lv=lv;court.ST.level=lv;
   o.placePlayer({x:w.x,z:w.z,a:headingTo(w.x,w.z,l.x,l.z),mode:'walk',bike:{x:C.bikesAt.x,z:C.bikesAt.z,a:C.bikesAt.a}});
   const jw=HW(jx??hx+.9,jz??hz-.6,jlv??lv);C.jlv=jlv??lv;comp.putFoot(jamie,jw.x,jw.z,headingTo(jw.x,jw.z,l.x,l.z),{bike:{...jamieBikeState()}});follow(true);jamie.follow='walk';};
  if(section==='c7-reveal'){inHouse(0,-2.9,'g',[0,2.6],.8,-3.6);go('e7-house');checkpoint('c7-house');C.gh={t:10,stage:'in',inside:true,shut:true,inAt:0,stopped:true};lightsGreen();quiet();creatureUpstairs();reveal();return;}
  ff('revealed');
  // (the stealth's checkpoint: you and Jamie in the pantry, the door nearly shut; it is at the foot of the stairs)
  if(section==='c7-stalk'){inHouse(3.2,2.6,'g',[1.6,3.7],JPANTRY.x,JPANTRY.z);lightsGreen();C.jHide='pantry';stand(jamie,HW(JPANTRY.x,JPANTRY.z),{look:()=>camera.position,keep:true,max:.3});jamie.crouch=.3;
   const sf=HW(0,-2.0);HL.level='g';H.place(sf.x,sf.z,0);HM.show(true);stalkStart();hide('pantry');return;}
  ff('stalked');lightsGreen();HGd.doors.boy.set(.85);HGd.doors.store.set(.8);HGd.doors.parents.set(.75);
  if(section==='c7-door'){inHouse(0,3.3,'u',[-2,3.3],-.6,3.9,'u');doorStart();comp.release(jamie);comp.putFoot(jamie,HW(-.6,3.9,'u').x,HW(-.6,3.9,'u').z,0,{bike:jamieBikeState()});C.jlv='u';follow(true);jamie.follow='walk';C.jStair=false;return;}
  ff('doorShut');HGd.doors.boy.set(.85);
  if(ix<=SECTIONS7.indexOf('c7-giant')){const at={'c7-clues':[-3,2.2,[-5,2]],'c7-trace':[-3.9,1.4,[-4.6,.95]],'c7-old-bike':[-2.4,-2.2,[-3.6,-2.5]],'c7-giant':[0,-3.4,[0,-4.5]]}[section]||[-3,2.2,[-5,2]];
   inHouse(at[0],at[1],'u',at[2],-HH.UCX-.35,3.95,'u');upstairsStart();quiet();C.up.unblock=1;{const s1=HGd.spots.dresserAfter;HGd.moveDresser(s1.x,s1.z,Math.PI/2);}
   if(section==='c7-trace'||section==='c7-old-bike'||section==='c7-giant')C.looked.add('calendar');if(section==='c7-old-bike'||section==='c7-giant'){C.looked.add('trace');ff('trace');}
   if(section==='c7-giant'){C.looked.add('oldbike');C.up.down=true;giantStart();}return;}
  ff('giant','trace');for(const kk of ['calendar','trace','oldbike'])C.looked.add(kk);court.police.visible=true;court.ST.portalB=true;court.ST.fenceB=false;
  if(section==='c7-out'){inHouse(0,-3.6,'u',[0,-4.5],.8,-3.0,'u');upstairsStart();quiet();C.up.unblock=1;C.up.down=true;C.gt={t:30,done:true,lights:true};go('e7-giant');objective('Out the window. Get to the bikes.','Onto the porch roof, then drop.');return;}
  ff('out','dropped');
  // ---- Act V ----
  hh(HOUR.bikes);HGd.doors.front.set(1);
  if(section==='c7-bikes'){const d=court.SPOT.porchDrop,dq=court.regL(d.x,d.z);inCourt(dq.x,dq.z);bikesStart();return;}
  if(section==='c7-chase'){const b=C.bikesAt,bq=court.regL(b.x,b.z);inCourt(bq.x+.4,bq.z+1.2,{ride:true});go('n7-bikes');checkpoint('c7-bikes');C.bk={t:5,stage:'go'};const cv=coverNear({x:b.x,z:b.z});H.place(cv.x,cv.z,0);HM.show(true);
   court.cans[1].position.x=-8-1.6;court.cans[1].rotation.z=Math.PI/2;court.cans[1].position.y=court.G0+.3;C.canAt=court.W3(-8-1.6,64);chaseStart();return;}
  ff('chased');nightWorld7();
  // out at the oak (the real lane, just through the middle)
  const realLaneRide=()=>{nav.setRoom(court.nav);const s1=court.R3(-2,12),s2=court.R3(0,12),a=headingTo(s1.x,s1.z,s2.x,s2.z);o.placePlayer({x:s2.x,z:s2.z+.0,a:headingTo(s2.x,s2.z,court.SPOT.mouth.x,court.SPOT.mouth.z),mode:'ride',speed:4});
   const j=court.R3(-1.5,12);comp.putRiding(jamie,j.x,j.z,a,4);jamie.follow='ride';follow(true);};
  if(section==='c7-lookout-attack'){realLaneRide();checkpoint('c7-bikes');outAtTheOak();return;}
  // Jamie down in the grass; you up; it has him
  const downScene=()=>{nav.setRoom(court.nav);police.attach?.(true);const car=k.carA;car.show(true);car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));car.lights=true;
   const land=court.R3(9,-9),me0=court.R3(12.6,-13.4);o.placePlayer({x:me0.x,z:me0.z,a:headingTo(me0.x,me0.z,land.x,land.z),mode:'walk',bike:{x:me0.x+1,z:me0.z-1,a:0}});
   comp.release(jamie);scene.attach(jamie.person.group);jamie.person.group.visible=true;jamie.bike.group.visible=true;jamie.bike.group.position.set(land.x+1.5,gy(land.x,land.z)+.05,land.z-1);jamie.bike.group.rotation.z=1.35;
   Object.assign(JL,{on:true,x:land.x,z:land.z,y:gy(land.x,land.z),t:1,phase:'down',from:{x:land.x,z:land.z,y:land.y},grip:false,held:false});HM.show(true);const hp=court.R3(7.6,-7.4);H.place(hp.x,hp.z,headingTo(hp.x,hp.z,land.x,land.z));
   reyes.show(true);const rf=court.SPOT.fieldFar;reyes.place(rf.x,rf.z,0);reyes.gest('flashlight');go('n7-lookout');C.lo={t:5,stage:'leap'};};
  if(section==='c7-grab'){downScene();quiet();grabStart();return;}
  if(section==='c7-struggle'){downScene();grabStart();quiet();JL.held=true;const h=jamieHand(),me1={x:h.x+JL.dir.x*.7,z:h.z+JL.dir.z*.7};o.placePlayer({x:me1.x,z:me1.z,a:headingTo(me1.x,me1.z,h.x,h.z),mode:'walk',bike:{x:me1.x+1,z:me1.z,a:0}});grabHand();return;}
  if(section==='c7-taken'){downScene();grabStart();quiet();JL.held=true;C.gb.stage='lost';C.gb.never=true;takenStart();return;}
  ff('jamieTaken');jamie.gone=true;jamie.person.group.visible=false;
  if(section==='c7-gum-pickup'){nav.setRoom(court.nav);police.attach?.(true);const car=k.carA;car.show(true);car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));car.lights=true;
   const gp=court.R3(3.6,-3.2),me2=court.R3(4.6,-5);o.placePlayer({x:me2.x,z:me2.z,a:headingTo(me2.x,me2.z,gp.x,gp.z),mode:'walk',bike:{x:me2.x+3,z:me2.z-2,a:0}});
   const g=house.items.gum;scene.attach(g);g.visible=true;g.position.set(gp.x,gp.y+.012,gp.z);g.rotation.set(0,.6,0);C.inv.gum='grass';C.gumAt={x:gp.x,y:gp.y+.012,z:gp.z};C.flags.gumDropped=true;
   const jb=court.R3(10,-10);jamie.bike.group.visible=true;jamie.bike.group.position.set(jb.x,gy(jb.x,jb.z)+.05,jb.z);jamie.bike.group.rotation.z=1.35;C.jBikeDown={x:jb.x,z:jb.z};goneStart();return;}
  ff('gumPicked');C.inv.gum='have';house.items.gum.visible=false;
  if(section==='c7-after'){afterStart();C.fadeIn=-1;o.fade(0);return;}
  if(section==='c7-forgetting'){afterStart();C.fadeIn=-1;o.fade(0);quiet();afterB();return;}
  ff('forgetReyes','forgetPhotoMom');hh(HOUR.sams);
  samsNight();C.fadeIn=-1;o.fade(0);if(section==='c7-sams')return;
  quiet();C.sn.inRoom=true;C.sn.roomAt=0;C.sn.fanBeat=true;ff('forgetFan');const toRoom=(hx,hz,lx,lz)=>{const q=house.toW(hx,hz),l=house.toW(lx,lz);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,l.x,l.z),mode:'walk',bike:yourBike()});};
  if(section==='c7-photo'){toRoom(3.6,3.2,3.95,4.45);objective('The photograph.','On his desk.');return;}
  ff('photoSeenNight','forgetPhoto');C.sn.photoLine=true;
  if(section==='c7-names'){toRoom(3.55,3.6,3.55,4.6);writeStart();return;}
  ff('names','lookOutside');
  if(section==='c7-window'){toRoom(4.2,3.7,4.2,4.7);objective('Look outside.','His window.');return;}
  if(section==='chapter7-end'){toRoom(4.2,3.7,4.2,4.7);lookOutside();quiet();C.endT=0;return;}}
 // ---- the api -----------------------------------------------------------------------------------------------------------------------------------------
 Object.assign(A7,{SECTIONS:SECTIONS7,ALIAS:ALIAS7,LABEL:LABEL7,owns,handles,begin:()=>{A7.started=true;begin();},update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,
  // (QA, for the visual review: where to stand in the garage to see the side door; where Reyes's head is)
  garageView:()=>{const q=drive(0,-3.2),sd=sideDoorAt?.inside||drive(1.5,-5);return {x:q.x,z:q.z,a:headingTo(q.x,q.z,sd.x,sd.z)};},reyesHead:()=>reyes.person.parts.head.getWorldPosition(new THREE.Vector3()),
  jamieSweep:()=>null,officerAim:()=>{const ph=S.phase;if(/^n7-(lookout|grab|taken|gone|after)$/.test(ph)&&reyes.visible)return court.SPOT.fieldFar;return null;},
  light:()=>owns(S.phase)?sky():null,longThrow:()=>null,
  canDismount:()=>!posed()&&!C.view&&S.phase!=='c7-black'&&!/^(n7-(chase|lookout|grab))$/.test(S.phase)&&!inSams(),
  canRemount:()=>!C.view&&!posed()&&!inSams()&&!inGreen()&&!/^(d7-(house|reyes|map)|n7-(grab|taken|gone|after|sams|names|window))$/.test(S.phase),
  closeBag:()=>{if(inv.isOpen){inv.close();return true;}return false;},inventoryReady:()=>owns(S.phase)&&S.phase!=='c7-black',
  C,house,court,cast,HM,H,HL,JL,LIGHTS,PH,MAPV,photoRender,photoState,inv,sky,brain,HUNTER_ID,STEP,CURB,sideDoorAt,LK,
  get started(){return A7._started;},set started(v){A7._started=v;}});
 Object.defineProperties(A7,{amb:{get:()=>C.amb},viewing:{get:()=>C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,lookKind:C.lookKind,inv:{...C.inv},looked:[...C.looked].sort(),
   level:C.lv||'g',jlevel:C.jlv||'g',hiding:C.hiding||null,fails:{...C.fails},photo:PH.state,photoRendered:{four:!!PH.four?.rendered,one:!!PH.one?.rendered},
   hunter:{mode:H.mode,state:HM.state,visible:HM.visible,x:+HM.x.toFixed(2),z:+HM.z.toFixed(2),level:HL.level,log:{...H.log},meter:Object.fromEntries(H.meter),source:HM.source,trace:H.trace.slice(-12)},
   jamie:{gone:!!jamie.gone,visible:jamie.person.group.visible,mode:jamie.mode,held:JL.held,down:JL.on,grip:JL.grip},
   court:{active:!!court.ST.active,portalA:court.ST.portalA,portalB:court.ST.portalB,inRegion:court.ST.active?court.inRegionAt(p.x,p.z):false,giant:court.GI.stage},
   cross:C.lastCross||null,sounds:{...C.sounds},guard:C.guardLog?{...C.guardLog}:null,marks:(C.marks||[]).slice(-30),endT:+C.endT.toFixed(2)};}}});
 return A7;
}
