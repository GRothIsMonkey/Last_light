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
import {P as PI,newPose,standPose,sitPose,applyPose,blendPose,copyPose,shoulderPos} from './rig.js';
import {CAST} from './cast.js';
import {createCompanionBrain} from './companion-brain.js';
import {createInventory} from './inventory.js';
import {LOOKOUT} from './layout.js';
import {createSamHouse} from './chapter7-house.js';
import {createCourt,P1 as LANE_P1,LEG as COURT_LEG} from './chapter7-court.js';
import {STAIR,HH} from './chapter7-interiors.js';
import {createHunterModel,HUNTER_ID} from './chapter7-creature.js';
import {createHunterAI} from './chapter7-hunter.js';
import {heelMark,fridayYards} from './chapter7-street-art.js';
import {portrait} from './chapter7-portraits.js';
import {chapter6Appearance} from './chapter6-models.js';
import {createCast7,createLangeFigure,MRS_LANGE,JAMIE_MOM} from './chapter7-cast.js';
import {makeOldBike} from './old-bike.js';
import {poseBike} from './rig.js';
import {canvas,texOf,photoSketch,PHOTO,planCanvas,modernCanvas,drawMapView,MAP,notebookPage,newspaper1966,calendar1991,samPage,tourPoster,schoolPictures,reyesPage,reyesIndent,poolPhoto} from './chapter7-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// QA jumps and DEV scenes, in story order (each starts a little before its moment).
export const SECTIONS7=['chapter7-start','c7-step','c7-family','c7-bedroom','c7-fan','c7-gum','c7-memory','c7-search','c7-machine','c7-garage','c7-reyes','c7-map','c7-records','c7-curb','c7-ride','c7-lookout','c7-lane',
 'c7-court','c7-separation','c7-lange','c7-lange-in','c7-lange-scare','c7-dining','c7-dining-scare','c7-house','c7-green-star','c7-reveal','c7-stalk','c7-stairs','c7-door','c7-rug','c7-clues','c7-trace','c7-old-bike','c7-giant','c7-out','c7-bikes',
 'c7-chase','c7-lookout-attack','c7-grab','c7-struggle','c7-taken','c7-gum-pickup','c7-after','c7-evidence','c7-mom','c7-forgetting','c7-record','c7-sams','c7-photo','c7-names','c7-window','chapter7-end'];
export const ALIAS7={'c7-start':'chapter7-start','c7-tour':'c7-memory','c7-belongings':'c7-search','c7-answering-machine':'c7-machine','c7-house-morning':'c7-family','c7-room':'c7-bedroom','c7-investigation':'c7-reyes','c7-old-map':'c7-map','c7-second-investigation':'c7-records','c7-streetlights':'c7-records','c7-jamie':'c7-curb',
 'c7-wrong-street':'c7-lane','c7-reyes-radio':'c7-separation','c7-open-door':'c7-lange','c7-secondary-house':'c7-lange','c7-lange-house':'c7-lange-in','c7-langes':'c7-lange-in','c7-bathroom':'c7-lange-scare','c7-window-scare':'c7-dining-scare','c7-horror-house':'c7-house','c7-creature':'c7-reveal','c7-stealth':'c7-stalk',
 'c7-historical':'c7-clues','c7-star':'c7-green-star','c7-wrapper-star':'c7-green-star','c7-closet-check':'c7-stalk','c7-pantry':'c7-stalk','c7-timer':'c7-stairs','c7-distraction':'c7-stairs','c7-dresser':'c7-rug','c7-barricade':'c7-rug','c7-sam-trace':'c7-trace','c7-meadowlark':'c7-old-bike','c7-vantage':'c7-giant','c7-escape':'c7-chase','c7-attack':'c7-lookout-attack','c7-rescue':'c7-struggle',
 'c7-gone':'c7-taken','c7-gum-drop':'c7-gum-pickup','c7-aftermath':'c7-after','c7-show-reyes':'c7-evidence','c7-reyes-evidence':'c7-evidence','c7-jamies-mom':'c7-mom','c7-pool-photo':'c7-mom','c7-notebook-page':'c7-record','c7-indentation':'c7-record','c7-final-photo':'c7-photo','c7-notebook':'c7-names','c7-final-image':'c7-window','c7-end':'chapter7-end'};
// Checkpoints (silent; Continue on the title comes back here). A failure in the house or the chase comes back to its own.
export const LABEL7={'chapter7-start':'The house without Sam','c7-bedroom':'Sam’s room','c7-search':'Sam’s things','c7-garage':'The garage','c7-reyes':'Officer Reyes','c7-records':'The plate and the streetlights','c7-curb':'That afternoon',
 'c7-lookout':'The end of the street','c7-court':'Old Mill Court','c7-lange':'The house with its door open','c7-house':'The house with the green door','c7-stalk':'Something is hunting us','c7-stairs':'It is waiting at the stairs','c7-clues':'Upstairs',
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
 const LF=createLangeFigure({scene});// (Mrs. Lange, No. 5)
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
 const LIGHTS=[0,1,2,3].map(i=>{const l=new THREE.PointLight(0xffd6a0,0,9,2);l.name='c7-light-'+i;l.userData.detection={intensity:0,position:new THREE.Vector3()};return l;});
 function lightsOn(on){for(const l of LIGHTS){if(on&&!l.parent)scene.add(l);else if(!on&&l.parent)l.removeFromParent();if(!on)l.intensity=l.userData.detection.intensity=0;}}
 // Brighter art lights retain accepted fixture values for hunter detection.
 function light(i,q,{intensity=3,dist=9,color=0xffd6a0,detectionIntensity=intensity,visualOnly=false}={}){
  const l=LIGHTS[i],d=l.userData.detection;
  if(!visualOnly){d.intensity=q?detectionIntensity:0;if(q)d.position.set(q.x,q.y,q.z);}
  if(!q){l.intensity=0;return;}l.position.set(q.x,q.y,q.z);l.intensity=intensity;l.distance=dist;l.color.setHex(color);
 }
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
 function closeLook(target,{back=.62,eye=1.42,floor=null,kind=null,dur=null,yaw=null}={}){const p=me(),a=yaw??headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
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
 // (you walking into Jamie where there is no room for him to step back out of your way, a doorway, between a car and a
 //  porch: after a moment he is round you, behind you where there is room, never in front of you; anywhere on foot)
 function giveWay(dt){const p=me(),c=jamie;if(!p.walking||c.mode!=='foot'||!c.active||c.gone||C.view||posed()||C.hiding||(c.script&&!c.script.spot7)){C.pushT=0;return;}
  const d=Math.hypot(c.px-p.x,c.pz-p.z),fx=Math.sin(p.a),fz=-Math.cos(p.a),ahead=(c.px-p.x)*fx+(c.pz-p.z)*fz,pushing=['KeyW','ArrowUp','KeyA','KeyD'].some(k=>o.held?.(k))&&(p.speed||0)<.45;
  C.pushT=d<1.1&&ahead>-.2&&pushing?(C.pushT||0)+dt:Math.max(0,(C.pushT||0)-dt);
  if(C.pushT<1.3)return;C.pushT=0;
  for(const [b,sd] of [[1.5,0],[1.3,.8],[1.3,-.8],[2.1,0],[.9,1.2],[.9,-1.2]]){const q={x:p.x-fx*b+Math.cos(p.a)*sd,z:p.z-fz*b+Math.sin(p.a)*sd};
   if(nav.walkable(q.x,q.z,{r:.3})&&!blockers().some(o2=>Math.hypot(o2.x-q.x,o2.z-q.z)<o2.r+.35)){const sp=C.spot[c.key];
    comp.putFoot(c,q.x,q.z,p.a,{bike:c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null});if(sp)stand(c,sp.q,sp);else if(C.match)c.follow='walk';mark('jamie steps round you');(C.guardLog||{}).gaveWay=((C.guardLog||{}).gaveWay||0)+1;break;}}}
 function guard(dt){const ph=S.phase;if(!C.guardLog){C.guardLog={released:0,unstuck:0,recovered:0};TRAIL.length=0;Object.assign(GUARD,{x:0,z:0,t:0,stuck:0});}
  giveWay(dt);
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
 function clock(dt){const ph=S.phase;let r=0;if(/^d7-/.test(ph))r=RATE.day;else if(ph==='e7-court'&&C.h<HOUR.dining)r=C.lg?.inside?RATE.night:RATE.court;else if(/^(e7|n7)-/.test(ph))r=RATE.night;
  C.h+=r*dt;if(C.hMin!==undefined&&C.h<C.hMin)C.h=Math.min(C.hMin,C.h+dt/60);const m=Math.floor(C.h*60+1e-6);if(m!==C.minute&&ph!=='c7-black'){C.minute=m;date(C.h);}}
 const date=h=>o.setDate(`AUGUST 26, 2011 <i></i> ${fmt(h)}`);
 const inSams=(p=camera.position)=>house.root.parent&&house.inHouse(p.x,p.z);
 const inGreen=(p=camera.position)=>court.ST.active&&court.inHouseAt(p.x,p.z);
 function sky(h=C.h){
  // (in Old Mill Court the light goes faster than the clock: up to most of an hour ahead, the longer you are there)
  if(court.ST.active){const p0=me();if(court.inRegionAt(p0.x,p0.z))h+=.7*clamp((C.h-HOUR.court)/1.5,0,1);}
  const q=(a,b)=>smooth((h-a)/(b-a));let day=1-.5*q(18.4,19.6)-.5*q(19.6,20.25),p=.3*q(18.6,19.7)+.7*q(19.7,20.3),night=.6*q(19.95,20.4)+.3*q(20.4,21),deep=.15*q(20.2,21);
  const cv=inSams()?(S.phase==='n7-sams'||S.phase==='n7-names'||S.phase==='n7-window'?.75:.44):inGreen()?.62:inLange(camera.position)?.55:C.inGarage?.4:0;
  const lateSun=q(15.4,17.4)*(1-q(18.7,20));
  return {day:day-.29*lateSun,p:p+.32*lateSun,night,deep,fill:0,storm:0,flash:0,cave:cv};}
 // ---- what you carry (I) -------------------------------------------------------------------------------------------------------
 function items(){const I=C.inv,carry=[],found=[];
  if(I.notebook==='have')carry.push({id:'notebook',name:'Sam’s notebook',state:C.flags.names?'ALEX · JAMIE · SAM':'His square printing',action:'Read'});
  if(I.gum==='have')carry.push({id:'gum',name:'A pack of gum',state:'Spearmint. Sam’s. Jamie’s.'});
  if(I.radio)found.push({id:'radio',name:'Reyes’s radio',note:'Channel three. Jamie has it.'});
  if(C.flags.photoSeen)found.push({id:'photo',name:'The photograph',note:C.flags.altered?'You, at the oak, with your bike.':'The four of you at the oak. July.'});
  if(C.flags.marked)found.push({id:'court',name:'Old Mill Court',note:'1958. Vacated 1974. Past the oak.'});
  if(C.flags.reyesPage)found.push({id:'reyes-page',name:'Officer Reyes’s page',note:'No name in the ink. JAMIE, pressed into the paper.'});
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
 function updateInspect(dt){const I=C.inspect;if(!I)return;I.t+=dt;I.obj.rotation.set(.12+I.pitch,I.yaw,0);
  if(I.kind==='reyes-page-now'){const ov=I.obj.userData.indent;const k2=clamp((Math.abs(I.yaw)+Math.abs(I.pitch)*.8-.32)*2.6,0,.92);if(ov)ov.material.opacity=k2;
   if(k2>.55&&!C.flags.indentSeen){C.flags.indentSeen=true;mark('the name, pressed into the paper');later(.3,()=>say([N('Pressed into the paper, where the ink isn’t: JAMIE.',{time:3.4}),R('…Keep it. Somebody has to.',{time:2.4,face:'tired'})]));}
   if(!C.flags.indentSeen&&I.t>14&&!I.nudged&&!busy()){I.nudged=true;say([R('Tilt it. Tilt it to the light.',{time:2})]);}}}
 // a page (a canvas) on a little card held up
 function pageMesh(cv,{w=.17,h=.225,color=0xfbfaf4}={}){const t=texOf(cv),m=new THREE.MeshBasicMaterial({map:t,color:t?0xffffff:color});const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m));g.userData.tex=t;g.userData.cv=cv;return g;}
 // ---- the map on the kitchen table (the 2009 map; the 1958 plan on tracing paper over it) --------------------------------------
 const MAPV={cv:canvas(MAP.w,MAP.h),plan:planCanvas(),modern:modernCanvas(),overlay:0,cursor:{x:.5,y:.62},mark:null,hint:0,mh:false,photo:false,sched:false,crayon:0,mark2:null,schedMark:null,hint2:0};
 const mapTex=texOf(MAPV.cv),mapMesh=new THREE.Mesh(new THREE.PlaneGeometry(.92,.69),new THREE.MeshBasicMaterial({map:mapTex,color:mapTex?0xffffff:0xe8e4d8}));mapMesh.name='c7-maps-on-the-table';mapMesh.visible=false;
 function drawMap(){drawMapView(MAPV.cv,{plan:MAPV.plan,modern:MAPV.modern,overlay:MAPV.overlay,cursor:MAPV.cursor,mark:MAPV.mark,hint:MAPV.hint,mh:MAPV.mh,photo:MAPV.photo,sched:MAPV.sched,crayon:MAPV.crayon,mark2:MAPV.mark2,schedMark:MAPV.schedMark,hint2:MAPV.hint2});if(mapTex)mapTex.needsUpdate=true;}
 // ---- a choice (three things you could say): number keys, shown on the hint row ---------------------------------------------------
 function choose(options,{then,timeout=25,fallback=null}){C.choice={options,then,t:0,timeout,fallback};}
 function pick(i){const ch=C.choice;if(!ch||!ch.options[i])return;C.choice=null;mark('chose: '+ch.options[i].id);ch.then(ch.options[i].id);}
 // ---- how the cast looks (Chapter Six's reconstruction: the same Jamie, the same Reyes; Sam's parents with them) -------------------
 const extraArt=new Map(),portraits=[];
 function dress(person,spec,actor=null) {
  if(!person)return;
  const shared=ch6.appearances6.get(person),base=shared||chapter6Appearance(person,spec,{actor});
  if(!shared)extraArt.set(person,base);
  portraits.push(portrait(person,spec,base));
 }
 dress(jamie.person,CAST.jamie,jamie);dress(sam.person,CAST.sam,sam);dress(o.self,CAST.player);
 for(const a of [reyes,officer,samDad,samMom])dress(a.person,a.spec,a);
 dress(cast.jamieMom.person,JAMIE_MOM,cast.jamieMom);dress(LF.person,MRS_LANGE);
 for(const f of Object.values(cast.fam))dress(f.person,f.spec);
 for(const [key,model] of Object.entries(cast.studio))dress(model.person,CAST[key]);
 const yards=fridayYards(world.homes);
 function presentation7(on){
  if(on&&!yards.parent)scene.add(yards);else if(!on)yards.removeFromParent();
  if(!on)for(const v of portraits)v.enable(false);
  for(const v of ch6.appearances6.values())v.enable(on);
  for(const v of extraArt.values())v.enable(on);
  if(on)for(const v of portraits)v.enable(true);
 }
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
  // (the expanded morning) after the gum and his dad's fan: the tube; then his dad's list; then the machine; then the garage
  const dadFree=!X.dadFan||X.dadDone;
  if(!C.mem&&C.flags.gum&&dadFree&&X.t>(X.memAt??=X.t+6)&&!busy()&&!C.view)memoryAsk();
  if(C.mem){C.mem.t+=dt;
   if(C.view==='inspect'&&C.lookKind==='tour'&&!C.mem.back&&!busy()){const yw=Math.atan2(Math.sin(C.inspect.yaw),Math.cos(C.inspect.yaw));if(Math.abs(yw)>2.3)tourBack();}
   if(!C.flags.tube&&C.mem.t>35&&!C.mem.nudge&&!busy()&&!C.view){C.mem.nudge=true;say([J('Get it down. Come on, you’re taller.',{time:2.2})]);}
   if(!C.flags.tube&&C.mem.t>90&&!busy()&&!C.view){C.flags.tube=true;C.flags.memory=true;}}// (left on the shelf: his dad comes in anyway)
  if(!C.dl&&C.flags.memory&&dadFree&&X.t>(X.dlAt??=X.t+3)&&!busy()&&!C.view)dadList();
  if(C.dl){C.dl.t+=dt;if(C.dl.stage==='look'&&!busy()&&!C.view){const e=C.dl.t-C.dl.lookAt;
    if(e>35&&!C.dl.h1){C.dl.h1=true;say([J(C.dl.found.has('pictures')?'Did you check under his desk? He kicks everything under his desk.':'His desk. He keeps everything in that drawer.',{time:2.6})]);}
    else if(e>70&&!C.dl.h2){C.dl.h2=true;say([J('Shoes under the desk. And his watch— is that it? On the dresser?',{time:3})]);}}}
  if(C.mc){C.mc.t+=dt;if(!C.mc.h1&&C.mc.t>45&&C.mc.stage==='go'&&!busy()&&!C.view){C.mc.h1=true;say([J('The machine. In the kitchen. Come on.',{time:2.2})]);}}
  // the garage: when the morning has had its moments (the machine), never while his dad is in the room with the fan
  if(!C.flags.noise&&C.flags.machineDone&&C.t-(C.mc?.doneAt??-99)>3.5&&!busy()&&!C.view&&dadFree)garageNoise();
  if(X.dadFan&&!X.dadDone)updateDadFan(dt);}
 // the fan: you turn it off; his dad comes in from the hall and turns it back on
 function fanOff(){if(!house.ST.fan||phys.playerBusy())return;o.roam.walkLock=true;const f=HS.fan;
  phys.playerReach({at:()=>new THREE.Vector3(f.x,f.y+.2,f.z),dur:[.5,.2,.45],carry:false,onContact:()=>{house.ST.fan=false;sound('click',f,{gain:.5});mark('the fan, off');C.flags.fanOff=true;if(C.dl&&C.dl.stage!=='done'&&!C.rm.dadFan){C.rm.dadFan=true;dadFanFromBed();}else C.rm.fanOffAt=C.t;},then:()=>{o.roam.walkLock=false;}});}
 function dadAndTheFan(){const X=C.rm;X.dadFan=true;X.df={t:0};const d=HS.samDoor;samDad.show(true);samDad.place(d.x-.9,d.z,house.heading(Math.PI/2));samDad.gest(null);samDad.lookAt=HS.fan;
  const f=HS.fan;samDad.walk([[HS.samIn.x,HS.samIn.z],[f.x-.5,f.z+.3]],{speed:.9,then:a=>{a.faceTo(f.x,f.z);X.df.at=X.df.t;}});}
 // (his dad is on the bed with his list: he leans across and turns it back on himself)
 function dadFanFromBed(){later(1.4,()=>{samDad.gest('point',HS.fan);later(.6,()=>{house.ST.fan=true;sound('click',HS.fan,{gain:.5});mark('his dad turns the fan back on');});
   later(1.4,()=>{samDad.gest('phone');say([DAD('He can’t sleep without that.',{time:2.6})],{then:()=>{C.rm.dadDone=true;}});});face(jamie,'sad',6);});}
 function updateDadFan(dt){const X=C.rm,D=X.df;D.t+=dt;
  if(D.at!=null&&!D.on&&D.t-D.at>.8){D.on=true;samDad.gest('point',HS.fan);later(.6,()=>{house.ST.fan=true;sound('click',HS.fan,{gain:.5});mark('his dad turns the fan back on');});
   later(1.4,()=>{samDad.gest(null);say([DAD('He can’t sleep without that.',{time:2.6})],{then:()=>{later(2.6,()=>{samDad.lookAt=null;const h=HS.hall;samDad.walk([[HS.samIn.x,HS.samIn.z],[h.x,h.z]],{speed:.8,then:a=>{a.show(false);X.dadDone=true;}});});}});});
   face(jamie,'sad',6);}}
 // the photograph: hold it
 function lookPhoto(){if(C.view)return;C.flags.photoSeen=true;C.looked.add('photo');const g=house.items.photo;
  const lines=C.flags.altered?[N('July. You, at the oak, with your bike. Sam’s mom took it.',{time:3.6})]
   :[N('July. The four of you at the oak with your bikes. Sam’s mom took it. She made you stand still for five minutes.',{time:4.4}),
     ...(near({x:jamie.px,z:jamie.pz},3.5)?[J('Alex is doing the face.',{time:1.8,face:'amused'}),J('He always did the face.',{time:2,face:'sad'})]:[])];
  // (at night, in his dark room, the picture held up catches what light there is from the street: enough to see who is in it)
  if(/^n7-/.test(S.phase))house.photoMat.emissive.setScalar(.26);
  inspect(g,{dist:.36,kind:'photo',spin:Math.PI,lines,onClose:()=>house.photoMat.emissive.setHex(0)});mark(C.flags.altered?'the photograph, now':'the photograph');}
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
  stars:[N('A jar on the shelf, half full of gum wrappers folded into little stars. Green and white.',{time:3.6}),J('He folds every single one. He can’t throw a wrapper away without folding it first.',{time:3.4,face:'amused'}),J('He leaves them everywhere. Like a trail.',{time:2.2,face:'sad'})],
 };
 function roomLook(id){if(C.looked.has(id))return;C.looked.add(id);const q=HS[id];closeLook({x:q.x,y:q.y,z:q.z},{back:id==='window'?.75:.6,eye:1.42,kind:id,floor:house.SPOTS.samIn.y});
  const lines=ROOM_LOOKS[id].filter(l=>l.by!=='jamie'||near({x:jamie.px,z:jamie.pz},4));C.lookDur=Math.max(3,lines.reduce((a,l)=>a+(l.time||2.4)+.3,0)+.8);say(lines);mark('looked: '+id);}
 // ---- (the morning, expanded) the Tour de Oak Hollow; his dad's list; the answering machine -----------------------------------------
 // Jamie sees the tube on top of the shelf; you take it down and unroll it: the summer they raced round the block. The back is
 // the rules. Then his dad, with a legal pad: the detective wants a newer picture, his shoes, his watch; you find them. Then the
 // machine in the kitchen is blinking, and it is not plugged in.
 const nearJ=(r=4.2)=>near({x:jamie.px,z:jamie.pz},r);
 function memoryAsk(){if(C.mem)return;C.mem={t:0,back:false};mark('the tube on the shelf');const sh=house.toW(3.0,3.15);
  stand(jamie,()=>sh,{look:()=>HS.tube,keep:true,max:.7});
  say([J('…No way.',{time:1.4,face:'surprised'}),J('On top of his shelf. The tube. He KEPT it?',{time:2.4,face:'surprised'})],{then:()=>{if(!C.flags.tube)objective('The tube on his shelf.','Take it down.');}});}
 const tourPg=(()=>{let g=null;return ()=>{if(g)return g;g=new THREE.Group();g.name='tour-poster';const f=pageMesh(tourPoster('front'),{w:.6,h:.4,color:0xf3efe2}),b=pageMesh(tourPoster('back'),{w:.6,h:.4,color:0xf3efe2});b.rotation.y=Math.PI;g.add(f,b);return g;};})();
 function takeTube(){if(C.view||phys.playerBusy()||C.flags.tube)return;const t=house.items.tube;o.roam.walkLock=true;
  phys.playerReach({at:()=>t.getWorldPosition(new THREE.Vector3()),dur:[.55,.2,.45],carry:false,onContact:()=>{t.visible=false;C.flags.tube=true;sound('c7Pencil',HS.tube,{gain:.3});mark('the tube, down');},then:()=>{o.roam.walkLock=false;lookTour();}});}
 function lookTour(){const g=tourPg();C.mem.lookAt=C.t;objective('The Tour de Oak Hollow.','Mouse / A D: turn it over.');
  inspect(g,{dist:.62,kind:'tour',restore:false,plane:true,onClose:()=>{g.removeFromParent();if(!C.flags.memory&&!C.mem.again){C.mem.again=true;say([J('Wait— the back. Look at the back.',{time:2})],{then:()=>{if(!C.view)lookTour();}});}else if(!C.flags.memory){C.flags.memory=true;objective('','');stand(jamie,null);follow(true);jamie.follow='walk';}},
   lines:[N('The Tour de Oak Hollow. Summer 2010. Official. Marker on a poster board, rolled up so long it wants to roll back.',{time:4.2}),
    J('Oh my god. Look at Alex’s time.',{time:2,face:'amused'}),J('He cut through the Hendersons’ backyard to beat Sam. Right through their clothesline.',{time:3.6,face:'amused'}),
    J('He came out the other side with Mrs. Henderson’s nightgown on his handlebars.',{time:3.4,face:'amused'}),
    J('Sam made a DQ stamp. Out of a potato. At the kitchen table, with a steak knife, while Alex yelled at him.',{time:4,face:'amused'}),
    J('Alex wrote “protest” on it like five times.',{time:2.2,face:'amused'}),{wait:.8},J('…He kept all of it.',{time:2,face:'sad'})]});}
 function tourBack(){const X=C.mem;X.back=true;mark('the back of the poster: the rules');
  say([N('On the back, in Sam’s square printing: the rules.',{time:2.6}),J('“Four. When the streetlights come on you go home.”',{time:3,face:'sad'}),{wait:.8},J('…“Five.”',{time:1.4}),{wait:1.4},
   J('He made us all sign it. Alex signed right across the whole bottom so nobody else could fit.',{time:3.6,face:'sad'}),
   N('Four signatures. Sam’s square printing. Jamie’s big J. Alex, right across the bottom. And yours.',{time:3.8})],{then:()=>{C.flags.memory=true;objective('Sam’s room.','');stand(jamie,null);follow(true);jamie.follow='walk';}});}
 // his dad's list: a newer picture, his shoes, his watch
 function dadList(){if(C.dl)return;C.dl={t:0,found:new Set(),stage:'ask'};checkpoint('c7-search');mark('his dad, with a legal pad');stand(jamie,null);follow(true);jamie.follow='walk';
  const d=HS.samDoor;samDad.show(true);samDad.place(d.x-.9,d.z,house.heading(Math.PI/2));samDad.gest(null);samDad.lookAt=camera.position;
  samDad.walk([[HS.samIn.x,HS.samIn.z],[HS.bedEdge.x,HS.bedEdge.z]],{speed:.9,then:a=>{a.faceTo(camera.position.x,camera.position.z);a.gest('phone');}});
  say([{wait:1.4},DAD('Boys. Sorry.',{time:1.4,face:'tired'}),DAD('The detective called back. They’re putting out a state alert. They need… things.',{time:3.4}),
   DAD('A newer picture. The one on the flyers is from last year.',{time:2.8}),DAD('What he had on his feet. If he had his watch on.',{time:2.6}),{wait:.8},
   DAD('I should know that. I should know what shoes my own kid wears.',{time:3.2,face:'sad'})],{then:()=>{C.dl.stage='look';C.dl.lookAt=C.dl.t;objective('Help his dad.','A newer picture. His shoes. His watch.');}});}
 function dlFound(what){const X=C.dl;if(!X||X.found.has(what))return;X.found.add(what);mark('found: '+what);
  const L={pictures:[DAD('That’s— yeah. That’s him.',{time:2,face:'sad'}),DAD('He hated the flyer one. He said it made him look like a lawyer.',{time:3})],
   shoes:[DAD('Vans. Six and a half. Gray.',{time:2.2}),J('He got them Saturday. He wore them out of the store and put the old ones in the box.',{time:3.6}),DAD('…Gray and white.',{time:1.8})],
   watch:[DAD('His watch.',{time:1.4}),DAD('He doesn’t take it off. He sleeps in it.',{time:2.4}),{wait:1},DAD('Why would he take it off.',{time:2.2,face:'worried'})]}[what];
  say(L,{then:()=>{if(X.found.size>=3&&X.stage==='look'){X.stage='done';dadListDone();}}});}
 function openDrawer(){const X=C.dl;if(!X||X.found.has('pictures')||C.view)return;house.ST.drawer=1;sound('creak',HS.drawer,{gain:.35});
  later(.7,()=>{const pg=pageMesh(schoolPictures(),{w:.2,h:.25,color:0xf4f1ea});
   inspect(pg,{dist:.34,kind:'pictures',restore:false,plane:true,onClose:()=>{pg.removeFromParent();house.ST.drawer=0;dlFound('pictures');},
    lines:[N('In his desk drawer, under a pencil sharpener: this year’s school pictures. Sixth grade. A sheet of wallets, one cut out.',{time:4.4}),
     ...(nearJ()?[J('He gave me that one. It’s in my wallet. I have it right now.',{time:2.8,face:'sad'})]:[])]});});}
 function lookShoes(){const X=C.dl;if(!X||X.found.has('shoes')||C.view)return;const q=HS.shoebox;
  closeLook({x:q.x,y:q.y,z:q.z},{back:.75,eye:.8,kind:'shoes',floor:HS.couch.y});C.lookDur=null;
  say([N('Under his desk, behind the chair: a shoe box. VANS. Six and a half. Gray and white.',{time:3.6}),N('Inside it, his old ones. The toes held together with duct tape.',{time:3.2})],{then:()=>{endLook();house.items.shoebox.visible=false;dlFound('shoes');}});}
 function lookWatch(){const X=C.dl;if(!X||X.found.has('watch')||C.view)return;const w=house.items.watch;
  inspect(w,{dist:.2,kind:'watch',spin:Math.PI,lines:[N('His watch, on the dresser. A black Casio. The strap held on with tape where it broke in June.',{time:4}),N('It’s still running. 10:31.',{time:2.4})],onClose:()=>{w.visible=false;dlFound('watch');}});}
 function dadListDone(){mark('his dad’s list');
  say([{wait:.6},DAD('Okay. Okay.',{time:1.4}),DAD('Thank you. Both of you. I’m gonna call them back.',{time:2.6}),
   {act:()=>{samDad.gest(null);samDad.lookAt=null;samDad.walk([[HS.samIn.x,HS.samIn.z],[HS.hall.x,HS.hall.z],[HS.dadKitchen.x,HS.dadKitchen.z]],{speed:.95,then:a=>{a.faceTo(HS.machine.x,HS.machine.z);a.gest('fold');}});
    // (Jamie goes out after him, ahead of you: by the table, out of the doorway, when you come in)
    const jk=house.toW(-4.6,-1.1);stand(jamie,()=>jk,{look:()=>HS.machine,keep:true,max:.8,leash:40});}},{wait:3.4},
   MOM('…Honey? The machine’s blinking.',{time:2.2}),{wait:.8},MOM('I unplugged that thing Thursday night. It wouldn’t stop ringing.',{time:3})],{then:()=>machineStage()});}
 // the answering machine: a message from Thursday, three in the morning; what is on it; its cord
 function machineStage(){if(C.mc)return;C.mc={t:0,stage:'go'};house.ST.machine='blink';mark('the machine, blinking');objective('The kitchen.','The answering machine. It’s blinking.');
  samMom.show(true);const m=HS.momKitchen;samMom.place(m.x,m.z,headingTo(m.x,m.z,HS.machine.x,HS.machine.z));samMom.gest('fold');samMom.lookAt=HS.machine;
}
 const ONM=(who,text,o2={})=>({who:who+' (ON THE MACHINE)',text:'“'+text+'”',...o2});
 function playMessage(){const X=C.mc;if(!X)return;
  if(X.stage==='again'){X.stage='done';sound('click',HS.machine,{gain:.5});say([{wait:.6},{who:'THE MACHINE',text:'“You have no messages.”',time:2.2}],{then:()=>{C.flags.machineDone=true;X.doneAt=C.t;objective('','');}});return;}
  if(X.stage!=='go')return;X.stage='playing';house.ST.machine='on';sound('click',HS.machine,{gain:.5});mark('the message');T?.set?.(.3,{rise:.05,why:'the machine'});
  say([{wait:.8},{who:'THE MACHINE',text:'“Thursday. Three. Twelve. A.M.”',time:2.6},{wait:1.4,act:()=>sound('c6Static',HS.machine,{gain:.25})},
   N('Wind. Bike chains, three of them, four. Cicadas, the way they sound at the end of your street.',{time:3.8}),
   ONM('JAMIE','Race you to the end of the street.',{time:2.4}),{wait:1.6},ONM('SAM','We should do this every night.',{time:2.4}),{wait:.6},ONM('ALEX','Even when school starts?',{time:2.2}),
   {wait:2},ONM('ALEX','Did you guys hear that?',{time:2.2}),ONM('JAMIE','Hear what?',{time:1.6}),{wait:1.2},ONM('ALEX','…Never mind.',{time:2}),
   {wait:2.4},ONM('SAM','Save me a spot tomorrow.',{time:2.6}),{wait:2.2,act:()=>{house.ST.machine='off';}},{who:'THE MACHINE',text:'“End of messages.”',time:2},{wait:1.2},
   MOM('That’s— that’s Sam. That’s Sam’s voice.',{time:2.4,face:'shocked'}),J('That’s Sunday. That’s us. Riding home, Sunday night.',{time:3,face:'afraid'}),
   J('Nobody was recording. Nobody— how is that ON there?',{time:2.8,face:'terrified'}),{wait:.6},DAD('Thursday. Three in the morning. Who would even—',{time:2.6})],
   {then:()=>{X.stage='cord';objective('The machine.','Its cord.');}});}
 function lookCord(){const X=C.mc;if(!X||X.stage!=='cord'||C.view)return;X.stage='looking';const q=HS.plug;mark('the cord');
  closeLook({x:q.x,y:q.y,z:q.z},{back:.55,eye:1.32,kind:'cord',floor:HS.couch.y});C.lookDur=null;
  say([N('Its cord runs across the counter. The plug lies at the end of it, a foot from the outlet.',{time:3.6}),{wait:.6},MOM('I unplugged it. Thursday night. I put it right there.',{time:2.8}),
   {wait:1},DAD('…It’s not plugged in.',{time:2,face:'shocked'}),N('The little red light is out. The display says 0.',{time:2.6}),{wait:1.4},DAD('Play it again.',{time:1.6})],
   {then:()=>{endLook();X.stage='again';objective('The machine.','Play it again.');}});}
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
  world.sideDoors.sam?.set(.25);light(1,{x:sd.inside.x,y:sd.inside.y+2.2,z:sd.inside.z},{intensity:3.4,detectionIntensity:.55,dist:7,color:0xb9cac7});
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
  mapMesh.visible=true;mapMesh.position.set(tbl.x,tbl.y+.005,tbl.z);mapMesh.rotation.set(-Math.PI/2,0,house.P.worldRot);MAPV.overlay=.0;MAPV.mark=null;MAPV.hint=0;MAPV.cursor={x:.5,y:.62};Object.assign(MAPV,{mh:false,photo:false,sched:false,crayon:0,mark2:null,schedMark:null,hint2:0});drawMap();
  closeLook({x:tbl.x,y:tbl.y,z:tbl.z},{back:.42,eye:1.05,kind:'map',floor:HS.couch.y});C.lookDur=null;
  objective('Find where Old Mill Court was.','Mouse: the pencil · A / D: the 1958 plan · F: mark it');
  say([N('The township’s street map, 2009. And on tracing paper over it, the 1958 storm plan. The same blocks. The same scale.',{time:4.4})]);}
 function mapKey(code){const M=C.mp;if(!M||!['look','mh','sched'].includes(M.stage))return false;
  if(code==='KeyA'||code==='ArrowLeft'){MAPV.overlay=Math.max(0,MAPV.overlay-.5);drawMap();M.toggled=true;return true;}
  if(code==='KeyD'||code==='ArrowRight'){MAPV.overlay=Math.min(1,MAPV.overlay+.5);drawMap();M.toggled=true;if(!M.oldSeen&&MAPV.overlay>.9){M.oldSeen=true;mark('the old plan over the new');say([N('On the old plan Oak Hollow Drive doesn’t stop. It goes on past the end of the street, past a tree, into a horseshoe of numbered lots.',{time:4.8}),N('OLD MILL CT. Stamped across it in red: VACATED 1974.',{time:3.2})]);}return true;}
  if(code==='KeyF'){if(M.stage==='mh')placeMH();else if(M.stage==='sched')placeSched();else placeMark();return true;}return false;}
 function placeMark(){const M=C.mp;M.tries++;MAPV.mark={...MAPV.cursor};drawMap();sound('c7Pencil',HS.kitchenTable,{gain:.5});
  const d=Math.hypot(MAPV.mark.x-MAP.target.x,(MAPV.mark.y-MAP.target.y)*.75);
  if(d<.075){mapSolved('you');return;}
  M.wrong++;const W=[[J('That’s just— no. Nothing’s different there.',{time:2.2})],[R('Look at the end of Oak Hollow. Where the two don’t match.',{time:2.8})],[MOM('Where the street ends. Where you boys always are.',{time:2.8})]];
  say(W[Math.min(M.wrong-1,W.length-1)]);}
 function updateMap(dt){const M=C.mp;if(!M)return;
  if(M.stage==='mh'&&!busy()){M.t2+=dt;
   if(M.t2>20&&!M.g1){M.g1=true;say([J('The plate says twelve. Find twelve on the old one.',{time:2.6})]);}
   else if(M.t2>45&&!M.g2){M.g2=true;say([R('They number them up from the creek. Ten, eleven… on Line Four.',{time:3.2})]);}
   else if(M.t2>70&&!M.g3){M.g3=true;MAPV.hint2=1;drawMap();say([MOM('There. By the tree.',{time:1.8})]);}
   else if(M.t2>100&&!M.g4){M.g4=true;say([J('There. Twelve.',{time:1.6})],{then:()=>{MAPV.cursor={...MAP.mh12};mhSolved('jamie');}});}}
  if(M.stage==='sched'&&!busy()){M.t3+=dt;
   if(M.t3>20&&!M.s1){M.s1=true;say([J('One of these isn’t a street anymore.',{time:2.2})]);}
   else if(M.t3>50&&!M.s2){M.s2=true;say([R('Read the names. Which one shouldn’t be on there.',{time:2.6})]);}
   else if(M.t3>85&&!M.s3){M.s3=true;say([J('Old Mill Court. It says Old Mill Court.',{time:2.4})],{then:()=>{MAPV.cursor={x:(MAP.sched.x0+MAP.sched.x1)/2,y:MAP.sched.row0+MAP.sched.odd*MAP.sched.dy};schedSolved('jamie');}});}}
  // (Reyes lifts the tracing paper off the street map; under it, what was not there)
  if(M.stage==='lift'){M.liftT+=dt;MAPV.overlay=Math.max(0,1-M.liftT/1.4);MAPV.crayon=M.liftT>1.2?Math.min(1,(M.liftT-1.2)/.5):0;drawMap();if(M.liftT>1.8&&!busy())mapCrayon();}
  if(M.stage!=='look')return;M.t+=dt;if(busy())return;
  if(M.t>18&&!M.h1){M.h1=true;say([J('The streets don’t line up at the top. Look at the end of Oak Hollow.',{time:3})]);}
  else if(M.t>40&&!M.h2){M.h2=true;say([R('Surveyors drew the trees they meant to keep. Find something that’s on both.',{time:3.4})]);}
  else if(M.t>62&&!M.h3){M.h3=true;MAPV.hint=1;MAPV.overlay=Math.max(MAPV.overlay,.5);drawMap();say([MOM('That’s the oak. Isn’t it? The tree at the end of your street.',{time:3.2,face:'concerned'})]);}
  else if(M.t>95&&!M.h4){M.h4=true;say([J('Here. It’s right here.',{time:1.8})],{then:()=>{MAPV.cursor={...MAP.target};mapSolved('jamie');}});}}
 function mapSolved(who){const M=C.mp;if(M.stage!=='look')return;M.stage='solved';MAPV.mark={...MAP.target};MAPV.overlay=1;drawMap();C.flags.marked=true;C.flags.markedBy=who;mark('Old Mill Court ('+who+')');T?.set?.(.2,{rise:.04,why:'the map'});
  say([{wait:.6},R('…Old Mill Court.',{time:1.8}),J('That’s the lookout. That’s— that’s OUR spot. It went right past the oak.',{time:3.2,face:'surprised'}),
   R('Vacated in seventy-four. They took it out when they put the storm line in.',{time:3.2}),DAD('There’s nothing back there. It’s a field.',{time:2.2}),
   R('Line Four bends around it. Like it’s still there.',{time:2.6}),{wait:.5},MOM('Sam drew that. Look.',{time:1.8,face:'sad'}),N('In his notebook: the end of the street, the oak, and a dotted line going on past it. A question mark.',{time:3.8}),
   {wait:.4},R('In sixty-six and in ninety-one the dogs went down Line Four to the end of the court’s right-of-way and sat down. Both times.',{time:4.4}),R('That doesn’t mean anything.',{time:1.8}),
   J('It means something.',{time:1.8,face:'determined'})],{then:()=>mapSecond()});}
 // ---- (the investigation, expanded) the plate in the junction chamber; the streetlight schedule; under the tracing paper ----------
 function mapSecond(){const M=C.mp;M.stage='mh';M.t2=0;M.wrong2=0;checkpoint('c7-records');Object.assign(MAPV,{photo:true,mh:true,overlay:1});drawMap();mark('the plate in the junction chamber');
  objective('The plate in Reyes’s picture.','Find it on the old plan. F: mark it.');
  say([{wait:.6},R('Look at this. Brandt took me down into the junction chamber this morning. Under the works.',{time:3.6,act:()=>reyes.gest('phone')}),
   R('There’s a plate bolted to the wall where Line Four comes in. I took a picture of it.',{time:3.2}),N('A flash on wet concrete. A plate, rusted at the edges: OAK HOLLOW TWP. MH-12. O.M.C. 1959.',{time:4.2}),
   R('O.M.C. Old Mill Court. Where’s twelve?',{time:2.4,act:()=>reyes.gest(null)})]);}
 function placeMH(){const M=C.mp;MAPV.mark2={...MAPV.cursor};drawMap();sound('c7Pencil',HS.kitchenTable,{gain:.5});
  if(Math.hypot(MAPV.mark2.x-MAP.mh12.x,(MAPV.mark2.y-MAP.mh12.y)*.75)<.035){mhSolved('you');return;}
  M.wrong2++;const W=[[J('That’s eleven. It goes up from the creek.',{time:2.2})],[R('Twelve. Follow Line Four from the creek, up toward the court.',{time:3})],[J('Where the court starts. Right where the court starts.',{time:2.4})]];
  say(W[Math.min(M.wrong2-1,W.length-1)]);}
 function mhSolved(who){const M=C.mp;if(M.stage!=='mh')return;M.stage='mhDone';MAPV.mark2={...MAP.mh12};MAPV.hint2=0;drawMap();C.flags.mh12=who;mark('MH-12 ('+who+')');
  say([{wait:.5},R('Twelve.',{time:1.2}),R('That’s under the grass at the end of your street. Right where that old paving is.',{time:3.4}),J('We sit on that. Every night. That’s where we leave our bikes.',{time:3,face:'afraid'}),
   {wait:.8},R('And this. Brandt’s office faxed it over with the plan. The streetlight schedule.',{time:3.2,act:()=>{MAPV.sched=true;drawMap();}}),
   R('Every lamp the township pays the electric company for. Every street.',{time:2.8})],{then:()=>{M.stage='sched';M.t3=0;M.wrong3=0;objective('The streetlight schedule.','One line on it is wrong. F: mark it.');}});}
 function placeSched(){const M=C.mp,S=MAP.sched,c2=MAPV.cursor;const i=Math.round((c2.y-S.row0+.008)/S.dy),inX=c2.x>S.x0&&c2.x<S.x1;sound('c7Pencil',HS.kitchenTable,{gain:.5});
  if(inX&&i>=0&&i<S.rows.length){MAPV.schedMark=i;drawMap();}
  if(inX&&i===S.odd){schedSolved('you');return;}
  M.wrong3++;const W=[[J('That’s just a regular street. That one’s real.',{time:2.2})],[R('One of those streets isn’t there anymore.',{time:2.4})],[MOM('The one that’s a field.',{time:1.8})]];
  say(W[Math.min(M.wrong3-1,W.length-1)]);}
 function schedSolved(who){const M=C.mp;if(M.stage!=='sched')return;M.stage='lamps';MAPV.schedMark=MAP.sched.odd;drawMap();C.flags.lamps=who;mark('the streetlights ('+who+')');
  say([{wait:.5},R('Old Mill Court. Four lamps. Active.',{time:2.4}),R('Billed last month.',{time:1.8}),DAD('It’s a field. There’s no court.',{time:2.2}),
   R('Somebody’s been paying for four streetlights on a street that’s been a field since 1974.',{time:3.6}),{wait:.6},
   R('There’s a junction box in that chamber. Brandt said it was dead. I watched the meter on it turn.',{time:3.8,face:'worried'}),{wait:1},
   R('Let me see the street map under that.',{time:2})],{then:()=>{M.stage='lift';M.liftT=0;mark('the tracing paper, lifted');}});}
 function mapCrayon(){const M=C.mp;M.stage='crayon';C.flags.crayon=true;mark('the crayon');T?.set?.(.35,{rise:.1,why:'the map'});
  say([{wait:1},N('Under the tracing paper, on the township’s map: a circle in red crayon around the spot. A date beside it, in a child’s hand.',{time:4.4}),
   J('…Was that there before?',{time:1.8,face:'afraid'}),MOM('That’s crayon.',{time:1.6}),
   R('This came off the township’s printer at nine o’clock this morning. I watched it come out.',{time:3.6}),{wait:.8},
   R('Eight twenty-one, ninety-one.',{time:2.2}),{wait:1},R('That’s the day the Whitcomb boy went missing.',{time:2.8,face:'worried'}),
   J('Somebody circled it twenty years ago. On a map from this morning.',{time:3.2,face:'afraid'})],{then:()=>{M.stage='after';mapFinish();}});}
 function mapFinish(){const M=C.mp;
  say([{wait:.8},R('I’m going to go look at it this afternoon.',{time:2.2}),J('We’re coming.',{time:1.4}),R('No.',{time:1}),{wait:1.2},
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
 function updateCourt(dt){const X=C.ct;X.t+=dt;const p=me(),q=courtFrame(p);if(C.lg)updateLange(dt);
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
   if(!X.knockAsk&&!X.lights&&!X.seenYou&&X.t-X.lostAt>5&&!busy()&&!C.view){X.knockAsk=true;X.knocks=0;say([J('Somebody’s gotta have a phone. Come on.',{time:2.2}),J('We knock, we say we’re lost. That’s all.',{time:2.4})],{then:()=>{if(X.knocks<2)objective('Find a phone.','Knock on a door. Stay together.');}});}
   if(!X.seenYou&&(X.knocks>=2&&X.t-X.knockedAt>9||X.t-X.lostAt>80)&&Math.hypot(p.x-court.SPOT.fenceA.x,p.z-court.SPOT.fenceA.z)>15&&!busy()){X.seenYou=true;X.seenAt=X.t;
    say([{act:()=>{radioHand.visible=true;sound('c6Static',jamie.person.group.position,{gain:.35});}},RR('…I can see you. By the fence. Jamie, why are you just standing there? Turn around.',{time:3.6}),
     J('We’re not by any fence. We’re— Reyes, we’re not by a fence.',{time:2.8,face:'afraid'}),{wait:.5,act:()=>sound('c6Static',jamie.person.group.position,{gain:.5})},J('Reyes?',{time:1.2}),{wait:1.6,act:()=>{radioHand.visible=false;}}]);}
   // the Langes' door, standing open (a phone, they think)
   if(X.seenYou&&!X.lange&&!X.lights&&!busy()&&!C.view&&X.t-(X.seenAt??0)>2.5)langeOpens();
   // the house with its lights on (when it is dark enough to see in, or when you come to it; after the Langes')
   const dw=court.SPOT.diningWalk,lgDone=!X.lange||C.lg?.stage==='done';if(!X.lights&&lgDone&&(C.h>=HOUR.dining-.15||Math.hypot(p.x-dw.x,p.z-dw.z)<16||(C.lg&&C.lg.t-C.lg.doneAt>1.2))&&X.seenYou&&!busy()){X.lights=true;C.h=Math.max(C.h,HOUR.dining-.05);
    say([...(X.lange?[J('…Look. Across the street.',{time:1.8,face:'worried'})]:[]),J('There’s people. There’s people in there.',{time:2.2,face:'hopeful'}),J('Maybe they have a phone.',{time:1.8})],{then:()=>{objective('The house with its lights on.','Across the lawn. Its front window.');diningStart();}});}}}
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
 // ---- the Langes' (No. 5): the door that was shut is standing open; inside, an evening a minute old; somebody in the bathroom ----
 // (after Reyes says he can see you by the fence, before it is dark enough for the Carvers' window: a phone, they think)
 const LGH=court.lange,LS=LGH.spots,LG3=(lx,lz,y=null)=>court.LW3(lx,lz,y),lgP=s=>LG3(s.x,s.z,s.y!=null?court.G0+s.y:null);
 const inLange=(p=me())=>court.ST.active&&court.inLangeAt(p.x,p.z);
 const langeRoom=(p=me())=>{if(!inLange(p))return null;const q=court.langeLocal(p.x,p.z);return LGH.room(q.x,q.z);};
 const cvOf=t=>t?.userData?.canvas?{c:t.userData.canvas}:null;
 // a place beside you (to your right and a little behind, or the other side, or behind): where Jamie keeps close
 const besideMe=(d=.9)=>{const p=me(),a=p.a,r={x:Math.cos(a),z:Math.sin(a)},b={x:-Math.sin(a),z:Math.cos(a)};
  for(const [s,k] of [[1,.45],[-1,.45],[0,1]]){const q={x:p.x+r.x*d*s*.85+b.x*d*k,z:p.z+r.z*d*s*.85+b.z*d*k};if(nav.walkable(q.x,q.z,{r:.3}))return q;}return {x:p.x+b.x*d,z:p.z+b.z*d};};
 // (Jamie, arms out to the sides and back: stay behind me)
 const shield=p=>{p[PI.lh]=-.44;p[PI.lh+1]=1.0;p[PI.lh+2]=.2;p[PI.rh]=.44;p[PI.rh+1]=1.0;p[PI.rh+2]=.2;p[PI.le]=-.9;p[PI.le+1]=.1;p[PI.le+2]=.4;p[PI.re]=.9;p[PI.re+1]=.1;p[PI.re+2]=.4;p[PI.lean]-=.04;};
 function langeLights(on){if(!on){for(const i of [1,2,3])light(i,null);light(0,null,{visualOnly:true});return;}const L=LGH.lamps;
  light(1,lgP(L.front),{intensity:6.4,detectionIntensity:1.5,dist:7.4,color:0xffcf95});light(2,lgP(L.kitchen),{intensity:4.2,detectionIntensity:1.7,dist:7,color:0xffe3b6});light(3,lgP(L.tv),{intensity:2.5,detectionIntensity:.5,dist:5,color:0xb0c7d4});light(0,lgP({x:-1.17,y:LGH.F+1.94,z:1.30}),{intensity:4.6,dist:5,color:0xffcd90,visualOnly:true});}
 function langeOpens(){const X=C.ct;X.lange=true;C.lg={t:0,stage:'open',opening:0};mark('the Langes’ door opens');const d=court.SPOT.langeDoor;sound('c7Door',d,{gain:.6});langeLights(true);
  say([{wait:.4},N('A latch, somewhere up the street. A door coming open.',{time:3}),{wait:.6},J('…That one. The blue one.',{time:2,face:'worried'}),
   ...(X.knocked?.has?.('a5')?[J('We knocked on that one. Nobody came. Now it’s open.',{time:2.8,face:'afraid'})]:[J('That door was shut. I looked right at it.',{time:2.4,face:'afraid'})]),
   {wait:.5},J('There’s a TV on in there. …Somebody’s home.',{time:2.4}),J('A phone. They’ve gotta have a phone. Come on.',{time:2.4})],
   {then:()=>{if(C.lg.stage==='open')C.lg.stage='door';C.lg.doorAt=C.lg.t;objective('The open door.','The blue house. A phone. Stay together.');}});}
 function updateLange(dt){const X=C.lg;if(!X)return;X.t+=dt;const p=me(),rm=langeRoom(p),d=court.SPOT.langeDoor,dd=Math.hypot(p.x-d.x,p.z-d.z);
  // the door: in, slowly, on its own; the TV's light, uneven
  if(X.opening<1){X.opening=Math.min(1,X.opening+dt*.42);LGH.doors.front.set(smooth(X.opening));}
  if(X.closing!=null&&X.closing>0){X.closing=Math.max(0,X.closing-dt*.5);LGH.doors.front.set(smooth(X.closing));if(X.closing===0){sound('click',d,{gain:.6});X.closing=null;}}
  if(!LGH.ST.tvOff&&LIGHTS[3].intensity>0&&X.stage!=='burst'&&X.stage!=='loom'&&X.stage!=='retreat')LIGHTS[3].intensity=LIGHTS[3].userData.detection.intensity=.38+.18*Math.abs(Math.sin(C.t*7.7))*(.6+.4*Math.sin(C.t*1.9));
  X.inside=!!rm;
  if((X.stage==='door'||X.stage==='open')&&dd<2.6&&!X.atDoor&&!busy()){X.atDoor=true;
   stand(jamie,LG3(LGH.doorX+1.05,-LGH.hd-1.35),{look:()=>lgP({...LS.inFront,y:LGH.F+1.4}),keep:true,max:1.6});
   say([J('Hello?',{time:1}),{wait:1.2},J('Hi— sorry. We knocked before. We’re lost. We just need to use your phone.',{time:3.2}),{wait:1.4},N('Nobody answers. The television, low. Somewhere inside, a tap dripping.',{time:3.4}),
    J('…They’re probably out back.',{time:1.8}),J('We’ll just— we’ll be really quick.',{time:2})],{then:()=>{stand(jamie,null);follow(true);jamie.follow='walk';if(X.stage==='door')objective('Find the phone.','Quietly.');}});}
  if((X.stage==='door'||X.stage==='open')&&rm){X.stage='in';X.inAt=X.t;checkpoint('c7-lange');mark('inside the Langes’');T?.set?.(.4,{rise:.05,why:'the Langes’'});
   later(1.2,()=>{if(!busy())say([J('…It smells like dinner.',{time:1.8,face:'worried'}),J('Hello?',{time:1})]);});objective('Find the phone.','Quietly.');}
  if(X.stage==='in'){if(rm==='kitchen'&&!X.kitchen){X.kitchen=true;if(!busy())later(.6,()=>{if(!busy())say([J('Somebody’s eating. Was eating.',{time:2,face:'afraid'})]);});}
   if(!X.phoned&&!X.nudge&&X.t-X.inAt>55&&!busy()&&!C.view){X.nudge=true;say([J('The phone’s gotta be in the kitchen. On the wall. Come on.',{time:2.6})]);}}
  if(X.stage==='presence'){
   if(rm==='hall'&&!X.hallAt){X.hallAt=X.t;LGH.feetTo(.05,1.6);sound('c7Step',lgP({...LS.bathDoor,y:LGH.F+.1}),{gain:.25});later(2.4,()=>{if(!X.shoved)LGH.feetTo(-.35,1.8);});
    if(!busy())say([J('Don’t. Don’t go near it.',{time:1.8,face:'terrified'})]);}
   if(!X.shoved&&!X.listening&&(X.hallAt!=null?X.t-X.hallAt>24:X.t-X.presAt>42)&&!busy()&&!C.view)langeShove();}
  if(X.stage==='look'){if(rm==='boy'&&X.inBoy==null)X.inBoy=X.t;
   if(!X.burst&&(X.drew?X.t-X.drewAt>X.drewDur:(X.inBoy!=null&&X.t-X.inBoy>25)||X.t-X.lookAt>45)&&!C.choice)langeBurst('boy');}
  if(X.stage==='leave'){const q=court.langeLocal(p.x,p.z);
   if(!X.burst&&rm==='front'&&q.z<-1.95&&!C.choice)langeBurst('front');
   else if(!X.burst&&X.t-X.leaveAt>30&&!X.pulled&&!busy()){X.pulled=true;say([J('COME ON. Out. OUT.',{time:1.6,face:'terrified'})]);}}
  if(X.stage==='flee'&&!rm&&dd>1.0&&(!inLange(p))){X.stage='out';X.outAt=X.t;mark('out of the Langes’');X.closing=1;
   later(1.4,()=>{langeLights(false);LGH.ST.smoke=false;LGH.ST.steam=false;});
   say([{wait:1.2},N('Behind you, the door swings shut on its own. The lights inside go out.',{time:3.4})]);}
  if(X.stage==='out'&&(X.t-X.outAt>4.5||dd>4)&&!busy())langeRecover();}
 // ---- what is in it ----
 function langeAct(w){const X=C.lg,jn=near({x:jamie.px,z:jamie.pz},4.5),fl=court.G0+LGH.F;if(w!=='listen')C.looked.add('lg-'+w);mark('the Langes’: '+w);
  if(w==='tv'){closeLook(lgP(LS.tv),{back:1.6,eye:1.3,kind:'lg-tv',floor:fl});C.lookDur=7.5;
   say([N('A console set on legs, the kind with the speaker cloth. A test card: WOHT CHANNEL 9. PLEASE STAND BY.',{time:4.4}),N('The tone, turned almost all the way down.',{time:2.6}),...(jn?[J('There’s no channel nine. There’s never been a channel nine.',{time:2.8,face:'worried'})]:[])]);}
  else if(w==='courier'){const pg=pageMesh(cvOf(LGH.pages.courier),{w:.26,h:.34,color:0xe8dcbc});
   inspect(pg,{dist:.38,kind:'lg-courier',restore:false,plane:true,onClose:()=>pg.removeFromParent(),lines:[N('The Courier, folded open on the coffee table, by an ashtray. The cigarette in it is still going.',{time:4}),
    N('Thursday, April 11, 1974. TOWNSHIP VACATES OLD MILL COURT.',{time:3.6}),N('“…to permit isolation work at the Line Four junction beneath it.”',{time:3.2}),N('“Mrs. E. Lange, of No. 5, could not be reached for comment.”',{time:3.4}),
    ...(jn?[J('Seventy-four. The one on the lawn was sixty-six.',{time:2.6,face:'worried'}),J('No. 5. That’s this one. This is her house.',{time:2.4,face:'afraid'})]:[])]});}
  else if(w==='dinner'){closeLook(lgP(LS.dinner),{back:.85,eye:1.35,kind:'lg-dinner',floor:fl});C.lookDur=8;
   say([N('Dinner for three. Two plates eaten from. One not touched: meatloaf, peas, a glass of milk with the cold still beaded on it.',{time:4.8}),N('Steam, a little, off the meat.',{time:2.2}),...(jn?[J('Somebody was just sitting here. Like— just.',{time:2.4,face:'afraid'})]:[])]);}
  else if(w==='cap'){const cp=LGH.g.getObjectByName('lange-cap');
   inspect(cp,{dist:.36,kind:'lg-cap',spin:Math.PI*.8,lines:[N('A boy’s ball cap, on the chair at the untouched plate. Oak Hollow Little League.',{time:3.6}),N('Inside the band, in marker: T. LANGE. The band is still damp.',{time:3.4}),...(jn?[J('…Where is he, then?',{time:2,face:'afraid'})]:[])]});}
  else if(w==='note'){closeLook(lgP(LS.note),{back:.65,eye:1.32,kind:'lg-note',floor:fl});C.lookDur=10;
   // (a physical clue: when the real house was lost, she was keeping her boy in his room, away from whatever was coming, and
   // she knew it could use her voice; it explains nothing about what she is now, and she is no less frightening for it)
   say([N('A note taped to his wall, across from the door, where he’d see it from his bed. Pencil, pressed hard.',{time:3.8}),N('TOMMY — STAY IN HERE. KEEP THE LATCH ON. DON’T OPEN IT FOR ANYBODY. NOT EVEN IF IT SOUNDS LIKE ME. I’M RIGHT OUTSIDE. — MOM',{time:6.2}),
    N('On the inside of his door, high up, a hook-and-eye latch. The screws are still bright.',{time:3.4}),...(jn?[J('Not even if it sounds like her.',{time:2.2,face:'afraid'}),J('…It did that. To us. With Sam’s voice.',{time:2.6,face:'afraid'})]:[])]);}
  else if(w==='calendar'){closeLook(lgP(LS.calendar),{back:.7,eye:1.45,kind:'lg-calendar',floor:fl});C.lookDur=6.5;
   say([N('A calendar from Lange Fuel & Oil. October 1983. Nothing written on it.',{time:3.6}),...(jn?[J('The TV, the paper, this. Nothing in here’s the same year.',{time:3,face:'worried'})]:[])]);}
  else if(w==='board'){const pg=pageMesh(cvOf(LGH.pages.board),{w:.3,h:.246,color:0xb48a5a});
   inspect(pg,{dist:.36,kind:'lg-board',restore:false,plane:true,onClose:()=>pg.removeFromParent(),lines:[N('A cork board by the phone. A grocery list. Two clippings. A pin with nothing on it.',{time:3.8})]});}
  else if(w==='parents'){sound('tap',lgP(LS.parentsDoor),{gain:.5});say([N('Locked. And something on the other side of it, leaning on it: it doesn’t give at all.',{time:3.6}),...(jn?[J('Don’t. Leave it.',{time:1.6,face:'afraid'})]:[])]);}
  else if(w==='phone')langePhone();else if(w==='listen')langeListen();else if(w==='drawings')langeDrawings();}
 function langePhone(){const X=C.lg;X.phoned=true;mark('the Langes’ phone');const q=lgP(LS.phone);const mid=LG3((LS.phone.x+LS.board.x)/2,(LS.phone.z+LS.board.z)/2,court.G0+LGH.F+1.47);closeLook(mid,{back:.95,eye:1.45,kind:'lg-phone',floor:court.G0+LGH.F});C.lookDur=null;
  LGH.handset.visible=false;sound('click',q,{gain:.6});
  say([N('The receiver is heavy and cold. No dial tone.',{time:3}),{wait:.4,act:()=>sound('c6Static',q,{gain:.12})},N('Something on the line, very far off: a television. The same tone as the one in the front room.',{time:4.2}),
   {wait:.8,act:()=>sound('c7Breath',q,{gain:.4})},N('And under it, close to the receiver, somebody breathing.',{time:3.4}),J('Hang up. Hang it UP.',{time:1.6,face:'terrified'}),
   {act:()=>{LGH.handset.visible=true;sound('click',q,{gain:.8});}},{wait:.6},
   N('Pinned to a cork board beside the phone: two clippings from the Courier, gone yellow by different amounts.',{time:4}),
   N('GIRL, 11, MISSING. Ruth Ann Carver. August 1966.',{time:3.2}),N('BOY STILL MISSING. Danny Whitcomb. August 1991.',{time:3.2}),
   J('Ninety-one. In a house nobody’s lived in since seventy-four.',{time:3,face:'afraid'}),N('And a third pin, with nothing on it but a torn corner of newsprint.',{time:3.4})],
   {then:()=>{endLook();langePresence();}});}
 function langePresence(){const X=C.lg;if(X.stage!=='in')return;X.stage='presence';X.presAt=X.t;mark('somebody in the bathroom');const bd=lgP(LS.bathDoor);
  LGH.strain(.9);LGH.feetAt(true,-.15);sound('c7Door',bd,{gain:.5});later(1.8,()=>LGH.strain(0));T?.set?.(.62,{rise:.2,why:'the bathroom door'});
  stand(jamie,()=>besideMe(.9),{look:()=>bd,keep:true,max:2.2});
  say([{wait:.9},J('…That was down the hall.',{time:2,face:'afraid'}),{wait:.6},J('Hello? Is somebody— we’re sorry, we just—',{time:2.6,face:'afraid'}),{wait:1.4},N('Nothing. Down the hall, the light is on under the bathroom door.',{time:3.2})],
   {then:()=>{objective('Somebody is in the house.','The hall. The light under the door.');}});}
 function langeListen(){const X=C.lg;X.listened=true;X.listening=true;const bd=lgP(LS.bathDoor);closeLook({...bd,y:court.G0+LGH.F+1.45},{back:.55,eye:1.5,kind:'lg-door',floor:court.G0+LGH.F});C.lookDur=null;
  LGH.feetTo(-.2,.8);say([{wait:.8},N('Nothing behind the door.',{time:2.2}),{wait:1.2,act:()=>sound('c7Breath',bd,{gain:.55})},N('Then breathing. Slow. Right on the other side of it, at the height of your face.',{time:4})],{then:()=>{X.listening=false;langeShove();}});}
 function langeShove(){const X=C.lg;if(X.shoved)return;X.shoved=true;X.shoveAt=X.t;mark('the door, shoved from inside');const bd=lgP(LS.bathDoor);
  LGH.shove();LGH.strain(0);sound('doorSlam',bd,{gain:1.3});sound('c7Strike',bd,{gain:.7});LGH.pictureFalls();later(.45,()=>sound('c7Glass',lgP({x:.62,y:LGH.F+.1,z:1.45}),{gain:.7}));
  o.foot.land=.05;T?.set?.(.86,{rise:.5,why:'the bathroom door'});later(.9,()=>LGH.feetAt(false));
  if(C.view==='look')later(.45,()=>endLook());face(jamie,'terrified',6);
  later(.6,()=>say([J('Get AWAY from it—',{time:1.4,face:'terrified'}),J('We’re going. We’re going right NOW.',{time:2.2,face:'terrified'})],{then:()=>langeDecide()}));}
 function langeDecide(){const X=C.lg;X.stage='decide';objective('Leave. Or look.','');
  choose([{id:'leave',label:'“Okay. We go.”'},{id:'look',label:'“Wait— the drawings in his room. Four bikes.”'}],{then:id=>langeChose(id),timeout:20,fallback:'leave'});}
 function langeChose(id){const X=C.lg;X.choice=id;
  if(id==='look'){X.stage='look';X.lookAt=X.t;say([J('What? No— NO.',{time:1.4,face:'terrified'}),{wait:.4},J('…Okay. Fast. FAST.',{time:1.6,face:'afraid'})],{then:()=>objective('The boy’s room.','Fast.')});
   stand(jamie,()=>besideMe(.95),{look:()=>lgP({...LS.boyDoor,y:LGH.F+1.3}),keep:true,max:2.6});}
  else{X.stage='leave';X.leaveAt=X.t;say([J('Go. Go, go.',{time:1.4,face:'terrified'})],{then:()=>objective('Get out.','The front door.')});stand(jamie,()=>besideMe(1.0),{look:()=>lgP({...LS.frontGap,y:LGH.F+1.3}),keep:true,max:2.6});}}
 function langeDrawings(){const X=C.lg;X.drew=true;X.drewAt=X.t;closeLook(lgP(LS.drawings),{back:1.15,eye:1.5,kind:'lg-drawings',floor:court.G0+LGH.F});C.lookDur=null;
  const lines=[N('Three drawings taped up over the bed. The same picture, three times.',{time:3.4}),N('A streetlight and its light. Four bikes in a row under it. Nobody on them.',{time:3.8}),
   N('R.A.C., 1966, in blue crayon. D.W., 1991, in red marker.',{time:3.6}),N('The third is in pencil, so faint it’s hardly there. No name on it. 2011.',{time:4}),J('…Four bikes.',{time:1.6,face:'afraid'})];
  X.drewDur=lines.reduce((a,l)=>a+(l.time||2)+.3,0)+.8;say(lines);}
 // ---- it comes out: along the hall, through what is in the way, at you; Jamie between; it stands; it goes back -------------------
 function langeBurst(where){const X=C.lg;if(X.burst)return;X.burst=where;X.stage='burst';X.burstAt=X.t;mark('it comes out of the bathroom ('+where+')');
  if(C.view==='look')endLook();else if(C.view==='inspect')endInspect();S.queue.length=0;S.line=null;T?.set?.(.98,{rise:.8,why:'the Langes’ bathroom'});
  const fy=court.G0+LGH.F+.01,pl=court.langeLocal(me().x,me().z);
  LGH.doors.bath.set(1);LGH.bathLight(false);LGH.ST.tvOff=true;light(3,lgP(LGH.lamps.bath),{intensity:1.3,dist:5,color:0xd8e6ff});sound('doorSlam',lgP({...LS.bathDoor,y:LGH.F+1.2}),{gain:1.5});
  // the way: out of the bathroom, along the hall past its table, then into the room you are in; it stops short of you
  const via=where==='boy'?[LS.bathOut,LS.hallMid,LS.hallTable,LS.hallWest,LS.boyIn]:[LS.bathOut,LS.hallMid,LS.hallTable,LS.hallWest,LS.frontGap,LS.frontIn];
  let pts=via.slice(),last=pts[pts.length-1],d=Math.hypot(pl.x-last.x,pl.z-last.z);while(d<1.25&&pts.length>2){pts.pop();last=pts[pts.length-1];d=Math.hypot(pl.x-last.x,pl.z-last.z);}
  const k=clamp((d-1.45)/(d||1),0,1),stop={x:last.x+(pl.x-last.x)*k,z:last.z+(pl.z-last.z)*k};if(LGH.walkable(stop.x,stop.z,.18))pts.push(stop);
  const at={};pts.forEach((q,i)=>{const w=lgP({...q,y:LGH.F+.5});
   if(q===LS.hallTable)at[i]=()=>{LGH.strike('hall',{x:-.92,z:-.38},{dist:.42,spin:.6});sound('c7Furniture',w,{gain:1.2});later(.25,()=>sound('c7Glass',w,{gain:.6}));};
   if(q===LS.boyIn){const nx=stop.x-q.x,nz=stop.z-q.z,nl=Math.hypot(nx,nz)||1;at[i]=()=>{LGH.strike('chair',{x:nx/nl,z:nz/nl},{dist:.75,spin:1.3,tip:1.45});sound('c7Furniture',w,{gain:1.35});};}
   if(q===LS.frontIn)at[i]=()=>{LGH.strike('couch',{x:-.25,z:-.97},{dist:.38,spin:-.22});LGH.strike('coffee',{x:-.6,z:-.8},{dist:.25,spin:.3});sound('c7Furniture',w,{gain:1.4});};});
  X.route=pts.map(q=>{const w=LG3(q.x,q.z);return [w.x,w.z];});const s0=LG3(LS.bathIn.x,LS.bathIn.z);LF.place(s0.x,s0.z,headingTo(s0.x,s0.z,X.route[0][0],X.route[0][1]),fy);
  LF.run(X.route,{speed:4.9,look:()=>camera.position,at,then:()=>langeLoom()});
  for(let i=0;i<9;i++)later(.12+i*.17,()=>sound('c7Step',{x:LF.F.x,y:fy,z:LF.F.z},{gain:.75}));
  // Jamie: between you and it, arms out
  face(jamie,'terrified',8);stand(jamie,()=>{const p=me(),fx=LF.F.x,fz=LF.F.z;return {x:p.x+(fx-p.x)*.4,z:p.z+(fz-p.z)*.4};},{look:()=>({x:LF.F.x,y:fy+1.5,z:LF.F.z}),keep:true,max:4.2,gesture:shield});
  say([{wait:.8},J('NO—',{time:1,face:'terrified'})]);}
 function langeLoom(){const X=C.lg;X.stage='loom';X.loomAt=X.t;mark('it stands there, too close');sound('c7Breath',{x:LF.F.x,y:court.G0+LGH.F+1.6,z:LF.F.z},{gain:.9});
  LF.loom(()=>camera.position,{dur:2.1,then:()=>langeRetreat()});say([J('GET BACK— GET AWAY FROM US—',{time:1.8,face:'terrified'})]);}
 function langeRetreat(){const X=C.lg;X.stage='retreat';mark('it goes back the way it came');const back=X.route.slice(0,-1).reverse(),s0=LG3(LS.bathIn.x,LS.bathIn.z);back.push([s0.x,s0.z]);
  LF.run(back,{speed:3.9,back:true,look:()=>camera.position,then:()=>{LF.show(false);LGH.doors.bath.set(0);sound('doorSlam',lgP({...LS.bathDoor,y:LGH.F+1.2}),{gain:1.2});light(3,null);
   X.stage='flee';X.fleeAt=X.t;C.flags.langeScare=true;jamieOut();
   say([{wait:.5},J('GO. GO!',{time:1.2,face:'terrified'})],{then:()=>objective('Get out.','The front door.')});}});}
 // (Jamie runs for the front door ahead of you, and waits on the lawn: he does not trail you through the doorways)
 function jamieOut(){const jq=court.langeLocal(jamie.px,jamie.pz),back=jq.z>-.3,path=[...(jq.z>1.55?[[-2.75,2.05]]:[]),...(back?[[-2.75,1.0],[-2.5,.1],[-1.6,-.6]]:[]),[-1.5,-3.0],[-1.5,-4.5],[-1.5,-6.4]].map(([x,z])=>{const w=LG3(x,z);return [w.x,w.z];});
  stand(jamie,null);follow(false);const wait=LG3(LGH.doorX+1.6,-LGH.hd-3.3);comp.run(jamie,[comp.steps.walkTo(jamie,path,{speed:3.4})],{then:()=>stand(jamie,wait,{look:()=>court.SPOT.langeDoor,keep:true,max:1.2})});}
 function langeRecover(){const X=C.lg;X.stage='recover';mark('outside again');const look=X.choice==='look';C.hMin=Math.max(C.hMin??0,HOUR.dining-.1);
  stand(jamie,()=>besideMe(1.1),{look:()=>camera.position,keep:true,max:2});
  say([J('What WAS that. Was that— was that a PERSON?',{time:2.6,face:'terrified'}),{wait:.6},
   ...(look?[J('You went IN there. I said we go, and you went in there.',{time:2.8,face:'afraid'}),{wait:.4},J('Those drawings. R.A.C. That’s Ruth Ann Carver. D.W., that’s Danny Whitcomb.',{time:3.6,face:'afraid'}),J('And the last one didn’t have a name on it yet.',{time:2.8,face:'terrified'})]
    :[J('It came right at you. It came right AT you.',{time:2.4,face:'afraid'}),{wait:.4},J('That board. By the phone. Ruth Ann Carver and Danny Whitcomb, on the same board.',{time:3.6,face:'afraid'}),J('And a pin with nothing on it.',{time:2,face:'terrified'})]),
   {wait:.8},J('I’m going back to the fence. I’m climbing it. I don’t care what Reyes said.',{time:3.2,face:'afraid'})],
   {then:()=>choose([{id:'sam',label:'“We’re not leaving without Sam.”'},{id:'fence',label:'“Okay. The fence.”'},{id:'together',label:'“We stay together. Whatever we do.”'}],{then:id=>langeAnswer(id),timeout:20,fallback:'together'})});}
 function langeAnswer(id){const X=C.lg;X.answer=id;
  const L=id==='sam'?[J('Sam’s not HERE. There’s nobody here. There’s just— THAT.',{time:3,face:'terrified'}),{wait:.8},J('…Okay. Okay. But we don’t go in anywhere else. Promise.',{time:3,face:'sad'})]
   :id==='fence'?[J('Okay.',{time:1}),{wait:1},J('…It’ll still be a fence. Even if we get over it, it’s the same field. Isn’t it.',{time:3.4,face:'sad'})]
   :[J('…Yeah. Yeah.',{time:1.4}),J('Together. But we don’t go in anywhere else.',{time:2.6})];
  say(L,{then:()=>{X.stage='done';X.doneAt=X.t;stand(jamie,null);follow(true);jamie.follow='walk';objective('Find a way back to Reyes.','Stay together.');}});}
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
  D.tvScreen.emissiveIntensity=.55+.35*Math.abs(Math.sin(C.t*7.3))*(.6+.4*Math.sin(C.t*1.7));LIGHTS[0].userData.detection.intensity=(2.2+.5*Math.sin(C.t*7.3))*(X.stage==='done'?1:1);if(S.phase==='e7-dining')LIGHTS[0].intensity=LIGHTS[0].userData.detection.intensity;
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
 // the boy's room's calendar on its wall (August 1991), facing into the room from the wall it shares with the storeroom
 const CAL={x:-3.3,z:.085,y:HH.UP+1.5};// (on the wall face: the wall is .14 thick, its face at .07)
 // the old green bike in the storeroom: the Meadowlark (the same build as every other time it is seen), leaning on its
 // side against the boxes, wet, a dark puddle spreading under it on the boards
 const oldBike=(()=>{const ob=makeOldBike(),g=ob.group;g.name='c7-old-bike';const at=HW(-3.6,-2.45,'u'),y=court.G0+HH.UP,a=headingTo(at.x,at.z,HW(-3.6,-1.4,'u').x,HW(-3.6,-1.4,'u').z);
  g.position.set(at.x,y,at.z);g.rotation.set(0,-a+Math.PI/2,.24,'YXZ');ob.steerAngle=-.3;ob.crankAngle=1.2;ob.wheel=.3;ob.kickstand=0;poseBike(ob);g.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(g);g.position.y+=y+.004-box.min.y;
  const pud=new THREE.Mesh(new THREE.CircleGeometry(.55,24),new THREE.MeshStandardMaterial({color:0x0c0e10,roughness:.06,metalness:.2,transparent:true,opacity:.82}));pud.rotation.x=-Math.PI/2;pud.scale.set(1.5,1,1);pud.position.set(at.x,y+.006,at.z);pud.name='c7-old-bike-puddle';
  const grp=new THREE.Group();grp.add(g);grp.add(pud);grp.visible=false;scene.add(grp);return grp;})();
 const wallCal=(()=>{const m=pageMesh(calendar1991(),{w:.3,h:.4,color:0xf0ece0});m.name='c7-wall-calendar';const a=HW(CAL.x,CAL.z,'u'),b=HW(CAL.x,CAL.z+1,'u');
  m.position.set(a.x,court.G0+CAL.y,a.z);m.lookAt(b.x,court.G0+CAL.y,b.z);m.visible=false;scene.add(m);return m;})();
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
   // (the folded star on the second step first: then, at the foot of the stairs looking up, it is there)
   if(!C.flags.star&&!X.starHint&&X.t-X.inAt>14&&!busy()&&!C.view){X.starHint=true;say([J('What’s that— on the stairs. On the step.',{time:2.2})]);}
   if(X.stopped&&!C.view&&(C.flags.star||X.t-X.inAt>110)&&((dF<1.8&&k.camLooksAt(top,.86))||X.t-X.inAt>(C.flags.star?80:120))){if(!X.revealed&&!busy())reveal();}}}
 function lightsGreen(){const L=HGd.lamps;light(1,HW(L.living.x,L.living.z),{intensity:5.3,detectionIntensity:1.8,dist:7.2,color:0xf5ba85});LIGHTS[1].userData.detection.position.y=LIGHTS[1].position.y=court.G0+L.living.y;
  light(2,HW(L.kitchen.x,L.kitchen.z),{intensity:4.1,detectionIntensity:1.4,dist:7,color:0xc4d5cf});LIGHTS[2].userData.detection.position.y=LIGHTS[2].position.y=court.G0+L.kitchen.y;
  light(3,HW(L.boy.x,L.boy.z,'u'),{intensity:4.7,detectionIntensity:1.6,dist:6.8,color:0xdacd99});LIGHTS[3].userData.detection.position.y=LIGHTS[3].position.y=court.G0+L.boy.y;HGd.tvScreen.emissiveIntensity=.7;
  const landing=HW(.08,2.86,'u');landing.y=court.G0+HH.UP+1.55;
  light(0,landing,{intensity:9.4,dist:8.2,color:0xbbd5cd,visualOnly:true});}
 // the reveal: at the top of the stairs, a hand round the corner (the newel post), the head leans out and turns, the body follows; it comes down
 function reveal(){const X=C.gh;X.revealed=true;go('e7-reveal');mark('the hand round the corner at the top of the stairs');T?.set?.(.7,{rise:.2,why:'the stairs'});HL.level='u';
  // (seen from the foot of the stairs, through the stairwell: a long hand comes round the newel post at the top on the left,
  //  where it has been standing in the hall out of sight; the head leans out after it and turns to you; then the body)
  const frame=HW(-.82,3.0,'u'),hide=HW(-1.1,3.15,'u'),landing=HW(0,3.0,'u'),top=HW(0,2.5,'u'),bottom=HW(0,-2.0,'g');
  H.place(hide.x,hide.z,headingTo(hide.x,hide.z,landing.x,landing.z));HM.show(true);
  const post=HW(-.56,2.62,'u'),fr={x:post.x,y:post.y+.98,z:post.z};
  H.script([{wait:.9,state:'peek',low:.3,reach:()=>fr,look:()=>landing},{wait:1.1,state:'peek',reach:()=>fr,look:()=>camera.position,act:null},
   {act:()=>sound('c7Board',landing,{gain:.9})},{to:[frame.x,frame.z],speed:.5,state:'stalk',low:.3,look:()=>camera.position,reach:()=>fr,free:true},
   {act:()=>{HM.drive.reach=null;}},{to:[landing.x,landing.z],speed:.6,state:'stalk',look:()=>camera.position,free:true},{wait:2.2,state:'idle',look:()=>camera.position},
   {act:()=>{sound('c7Breath',landing,{gain:1});}},{to:[top.x,top.z],speed:.6,state:'stalk',free:true,look:()=>camera.position,sound:'c7Board'},
   {to:[bottom.x,bottom.z],speed:.72,state:'stalk',free:true,look:()=>camera.position,keepY:false},{act:()=>{HL.level='g';}},{wait:.6,state:'alert',look:()=>camera.position}],{then:()=>bottomOfStairs()});
  // the treads, one at a time, as it comes down
  for(let i=0;i<9;i++)later(6.6+i*.62,()=>sound(i%2?'c7Step':'c7Board',HM.sockets.hips.getWorldPosition(new THREE.Vector3()),{gain:.9}));
  face(jamie,'terrified',10);
  say([{wait:1.4},J('…Oh my god.',{time:1.6,face:'terrified'}),{wait:2},J('Oh my god oh my god—',{time:1.8}),{wait:1.2},J('Back. Back, back—',{time:1.6})],{then:()=>{X.hideNow=true;objective('Hide.','Through the dining room. The kitchen. F: hide.');jamieHides();}});}
 // ---- (expanded) before it comes down: what is in the house -------------------------------------------------------------------
 const GX=()=>HGd.extra,gxW=(q,lv='g')=>{const w=HW(q.x,q.z,lv);return {x:w.x,y:court.G0+q.y,z:w.z};};
 function pickStar(){if(C.view)return;C.flags.star=true;mark('the folded star');const st=GX().star,jn=true;stand(jamie,()=>besideMe(1.0),{look:()=>camera.position,keep:true,max:2.4});later(14,()=>{if(C.gh&&!C.gh.revealed){stand(jamie,null);follow(true);jamie.follow='walk';}});
  inspect(st,{dist:.2,kind:'star',spin:.6,onClose:()=>{st.visible=false;},lines:[N('A star, folded out of a gum wrapper. Spearmint. The silver side out, the way you fold them so they shine.',{time:4.2}),
   ...(jn?[J('…Sam makes these. He’s got a whole jar of them.',{time:2.6,face:'hopeful'}),J('He was here. He was HERE.',{time:1.8,face:'hopeful'}),{wait:.8},J('…Anybody can fold a star, though. Right?',{time:2.6,face:'worried'}),N('Jamie takes it from you, carefully, like it could tear.',{time:3})]:[N('Sam folds these. He has a jar of them on his shelf.',{time:2.8})])]});}
 function lookPrints(){if(C.view)return;C.looked.add('prints');const q=HW(2.6,2.75);closeLook({x:q.x,y:court.G0+HH.F,z:q.z},{back:.95,eye:1.25,kind:'prints',floor:court.G0+HH.F});C.lookDur=9.5;mark('the wet prints');
  say([N('Wet prints across the kitchen floor. Bare. Too long, too narrow, the toes spread out like fingers.',{time:4.2}),N('They come out of the closet under the stairs, and go round through the dining room, toward the front.',{time:4}),
   ...(near({x:jamie.px,z:jamie.pz},5)?[J('Whose foot is that.',{time:1.6,face:'afraid'}),J('Whose foot IS that.',{time:1.6,face:'terrified'})]:[])]);}
 function radioOn(){if(C.view)return;const q=gxW(GX().radioAt);C.looked.add('radio');
  if(!C.sk){closeLook(q,{back:.75,eye:1.35,kind:'radio',floor:court.G0+HH.F});C.lookDur=null;sound('click',q,{gain:.5});mark('the radio');
   say([{act:()=>sound('c6Static',q,{gain:.35})},N('A transistor radio on the desk. Static, and under the static, a voice.',{time:3.4}),
    {who:'THE RADIO',text:'“…It’s the field. There’s nobody here.”',time:3,act:()=>sound('c6Static',q,{gain:.25})},
    J('That’s— that’s what Reyes said. Before. Word for word.',{time:2.8,face:'afraid'}),{act:()=>sound('click',q,{gain:.5})},N('You turn it off.',{time:1.6})],{then:()=>endLook()});return;}
  radioLure();}
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
 function litAt(q){let s=.35;for(const source of LIGHTS){const l=source.userData.detection;if(l.intensity<=0)continue;const d=l.position.distanceTo(q);s+=l.intensity*.25/(1+d*d*.3);}return clamp(s,0,1);}
 function houseGraph(){const G=HGd.graph;return {nodes:G.nodes.map(n=>{const w=HW(n.x,n.z);return {...n,x:w.x,z:w.z};}),edges:G.edges};}
 function stalkStart({live=false}={}){go('e7-stalk');if(!live)checkpoint('c7-stalk');else checkpoint('c7-stalk');C.sk={t:0,stage:'hunt',helped:false,caught:false};mark('it is hunting');
  HL.level='g';C.lv='g';court.ST.level='g';C.jlv='g';H.setGraph(houseGraph());H.setTargets([playerTarget(),jamieTarget()]);H.catchR=1.25;H.runSpeed=C.fails.stalk>=2?3.5:4.0;H.sightRange=C.fails.stalk>=2?11:13.5;
  if(H.mode!=='pursue'){const loop=HGd.graph.loop;H.patrol(loop);H.patrolI=1;}
  H.onCatch=T2=>caught(T2);H.onSpot=T2=>{mark('it saw '+T2.id);if(T2.id==='player'&&!C.sk.helped&&C.sk.t>3)jamieHelps();else if(T2.id==='jamie')jamieSeen();};
  H.stalkSpeed=.9;objective('Stay hidden.','It is looking for you. F: hide.');
  later(1.4,()=>{if(C.sk&&C.sk.stage==='hunt'&&C.hiding)say([J('(Don’t move. Don’t move.)',{time:2,face:'terrified'})]);});}
 // ---- (expanded) the closets: it comes and looks; the stairs: it waits at them; a noise: it goes; and then it knows ----------------
 // where it stands to look into each closet (house frame), and the step it takes into the doorway
 const HIDE_LOOK={pantry:{front:{x:3.98,z:2.34},step:{x:4.1,z:2.70}},den:{front:{x:-4.42,z:2.42},step:{x:-4.45,z:2.76}}};
 // (where you stand to get into each one: in front of its door)
 const HIDE_FRONT={pantry:{x:4.15,z:2.7},den:{x:-4.45,z:2.8},stair:{x:0,z:3.75}};
 const LEARNED_LOOP=['stairWatch','livingArch','living','livingDoor','den','denCloset','denDoor','backHall','kitchenDoor','kitchen','pantryFront','kitchenDining','dining','diningArch'];
 function doorEdge(id){const d=HGd.doors[HGd.hides[id].door],p=d.pivot,a=p.rotation.y;const w=HW(p.position.x+Math.cos(a)*.8,p.position.z-Math.sin(a)*.8);return {x:w.x,y:court.G0+HH.F+1.15,z:w.z};}
 // it comes to the closet you are in, its hand on the edge of the door; the door opens wider; its head in the gap; hold your breath
 function checkHide(id,{after='watch'}={}){const X=C.sk,L=HIDE_LOOK[id];if(!L){if(after==='watch')watchStairs();return;}X.checked=true;const chk=X.check={id,phase:'come',t:0,after};const live=()=>C.sk===X&&X.check===chk;if(after==='watch')X.stage='check';mark('it comes to the '+id);
  const fr=HW(L.front.x,L.front.z),st=HW(L.step.x,L.step.z),hp=HW(HGd.hides[id].x,HGd.hides[id].z),edge=()=>doorEdge(id);H.setTargets([]);
  H.script([{to:[fr.x,fr.z],speed:1.1,state:'stalk',low:.3,near:.35},{face:[hp.x,hp.z]},
   {act:()=>{if(!live())return;chk.phase='hand';say([J('(It’s here. Don’t move— hold your breath—)',{time:2.4,face:'terrified'})]);}},
   {wait:1.3,state:'peek',low:.45,reach:edge,look:edge},
   {act:()=>{if(!live())return;chk.phase='open';sound('creak',hp,{gain:.7});}},
   {wait:.9,state:'peek',low:.5,reach:edge,look:()=>camera.position},
   {to:[st.x,st.z],speed:.35,state:'peek',free:true,reach:edge,look:()=>camera.position,max:1.4},
   {act:()=>{if(!live())return;chk.phase='head';chk.headT=0;sound('c7Breath',hp,{gain:1});}},
   {wait:3.2,state:'peek',low:.62,reach:edge,look:()=>camera.position},
   {act:()=>{if(!live())return;chk.phase='leave';sound('c7Breath',hp,{gain:.5});}},
   {to:[fr.x,fr.z],speed:.5,state:'stalk',free:true,reach:null,look:()=>camera.position,max:2},{wait:.4,state:'idle',reach:null}],
   {then:()=>{if(!live())return;X.check=null;mark('it lets the door go');if(chk.after==='loop')learnedLoop({at:(X.resumeAt??10)});else watchStairs();}});}
 // after looking, it goes and stands at the foot of the stairs: it knows where you want to go
 function watchStairs(){const X=C.sk;if(!X)return;X.stage='watch';X.watchAt=X.t;X.stairsCp=true;H.setTargets([playerTarget(),jamieTarget()]);H.patrol(['stairWatch']);mark('it waits at the foot of the stairs');checkpoint('c7-stairs');
  later(2.6,()=>{if(C.sk!==X||X.stage!=='watch')return;say([J('(It’s at the stairs.)',{time:1.8,face:'afraid'}),J('(It’s just— standing at the bottom of the stairs. Waiting.)',{time:2.8,face:'terrified'}),{wait:1},
   J('(The timer. On the counter. Wind it up, and we go out the back way, round, while it looks.)',{time:3.8,face:'afraid'})],{then:()=>{if(X.stage==='watch')objective('It is waiting at the foot of the stairs.','Make a noise somewhere else: the egg timer on the kitchen counter. Then the back way round.');}});});}
 function windTimer(){const X=C.sk;if(!X||X.timer)return;const pos=gxW(GX().timerAt);X.timer={t:0,ring:7,pos,tick:0};mark('the timer, wound');sound('click',pos,{gain:.6});
  objective('Get out of the kitchen.','The back way: the back hall, the den, round to the front.');say([J('(Go— the back way—)',{time:1.6,face:'afraid'})]);}
 function radioLure(){const X=C.sk;if(!X||X.radio)return;const pos=gxW(GX().radioAt);X.radio=true;mark('the radio, on');sound('click',pos,{gain:.6});
  for(let i=0;i<8;i++)later(i*.45,()=>sound('c6Static',pos,{gain:.55}));later(.3,()=>{const heard=H.hear(pos,2.2,{id:'the radio'});X.lure={id:'radio',pos,at:X.t,heard};});
  say([J('(Go— GO—)',{time:1.2,face:'afraid'})]);}
 // there, at what it heard: it breaks it; and after that it looks in the closets as it goes round
 function learn(L){const X=C.sk;L.done=true;X.learned=(X.learned||0)+1;mark('it learns ('+L.id+')');const q=L.pos;
  H.script([{face:[q.x,q.z]},{wait:.6,state:'peek',reach:()=>q,look:()=>q},{act:()=>{sound('c7Strike',q,{gain:1.1});sound('c6Clank',q,{gain:.8});if(L.id==='timer')GX().timer.visible=false;else GX().radio.visible=false;}},
   {wait:.9,state:'alert',reach:null,look:()=>({x:q.x,y:q.y+.4,z:q.z})},
   // (and it stands there, turning its head: where are they)
   {wait:2.6,state:'idle',look:()=>({x:HM.x+Math.sin(C.t*1.3)*4,y:HM.y+1.3,z:HM.z-Math.cos(C.t*1.3)*4})}],{then:()=>{X.resumeAt=L.id==='timer'?10:5;learnedLoop({at:X.resumeAt});}});
  later(1.4,()=>say([J(X.learned===1?'(It broke it. It just— broke it.)':'(It knows that’s us. It knows.)',{time:2.2,face:'terrified'})]));}
 function learnedLoop({at=0}={}){const X=C.sk;X.stage='learned';H.setTargets([playerTarget(),jamieTarget()]);H.stalkSpeed=.9+.18*(X.learned||1);H.patrol(LEARNED_LOOP);H.patrolI=at;
  if(!X.loopSaid){X.loopSaid=true;later(2.2,()=>say([J('(It’s looking in the closets now. It goes round. Like a circle.)',{time:3.2,face:'afraid'}),J('(When it’s on the other side— the stairs.)',{time:2.2})],{then:()=>objective('Get upstairs without it seeing you.','It walks the rooms, and looks in the closets now. Go the other way round.')}));}}
 // (going round, at a closet: the door opened, a look in, on; if you are in it, the close look)
 function quickCheck(hid){const X=C.sk,L=HIDE_LOOK[hid];if(!L)return;X.resumeAt=H.patrolI+1;if(C.hiding===hid){checkHide(hid,{after:'loop'});return;}
  const fr=HW(L.front.x,L.front.z),hp=HW(HGd.hides[hid].x,HGd.hides[hid].z),edge=()=>doorEdge(hid);const pk=X.peek={id:hid,open:false};const live=()=>C.sk===X&&X.peek===pk;mark('it looks in the '+hid);
  H.script([{to:[fr.x,fr.z],speed:1.0,state:'stalk',near:.45},{face:[hp.x,hp.z]},{wait:.6,state:'peek',reach:edge,look:edge},{act:()=>{if(live()){pk.open=true;sound('creak',hp,{gain:.5});}}},
   {wait:1.5,state:'peek',reach:edge,look:()=>hp},{act:()=>{if(live())pk.open=false;}},{wait:.4,state:'idle',reach:null}],{then:()=>{if(!live())return;X.peek=null;learnedLoop({at:X.resumeAt});}});}
 function jamieHelps(){const X=C.sk;X.helped=true;mark('Jamie throws a can');const far=HW(-3.4,1.8);
  later(.5,()=>{sound('c6Clank',far,{gain:1.1});sound('c5WoodStrike',far,{gain:.6});H.hear({x:far.x,z:far.z},3,{id:'a can, thrown',force:true});});
  later(.9,()=>say([J('GO!',{time:1})]));}
 function jamieSeen(){mark('it saw Jamie');face(jamie,'terrified',4);}
 function caught(T2){const X=C.sk||C.ch;if(!X||X.caught)return;X.caught=true;const which=C.sk?'stalk':'chase';C.fails[which]++;const fails={...C.fails};mark('caught ('+T2.id+')');sound('c7Strike',camera.position,{gain:1.4});T?.set?.(1,{rise:1,why:'caught'});
  // a short, physical end: it is on you, the view goes over, black
  const p=me();pose({x:p.x,z:p.z},{y:camera.position.y-.9,yaw:p.a+.6,pitch:-.9,slow:.25});o.fade(1);C.capturedT=0;
  say([N(T2.id==='jamie'?'It has Jamie.':'It has you.',{time:2.4})]);
  const back=which==='stalk'?(X.stairsCp?'c7-stairs':'c7-stalk'):'c7-bikes';
  later(2.6,()=>{const sec=back;jumpTo(sec);Object.assign(C.fails,fails);C.fadeIn=0;o.fade(1);mark('again: '+sec);if(which==='stalk'){H.runSpeed=C.fails.stalk>=2?3.5:4.0;H.sightRange=C.fails.stalk>=2?11:13.5;}});}
 function updateStalk(dt){const X=C.sk;if(!X||X.caught)return;X.t+=dt;const p=me(),q=houseLocal(p.x,p.z);
  // sprinting is heard; doors are heard
  if((me().speed||0)>3.2&&(o.foot.crouch||0)<.3){X.noiseT=(X.noiseT||0)+dt;if(X.noiseT>.6){X.noiseT=0;H.hear({x:p.x,z:p.z},.9,{id:'running'});}}
  // Jamie: in the pantry until you go; then right behind you (crouched), never in front
  if(C.jHide==='pantry'&&!C.hiding&&Math.hypot(q.x-HGd.hides.pantry.x,q.z-HGd.hides.pantry.z)>2.2&&!X.jamieOut&&H.mode!=='pursue'){X.jamieOut=true;C.jHide=null;stand(jamie,()=>{const a=me().a;return {x:p.x-Math.sin(a)*1.4,z:p.z+Math.cos(a)*1.4};},{look:()=>({x:HM.x,y:HM.y+1.6,z:HM.z}),keep:true,max:.6});jamie.crouch=.25;}
  // (expanded) it comes to the closet you hid in; the door opens wider; its head in the gap: hold your breath (Space) or it hears you
  if(X.stage==='hunt'&&!X.checked&&C.hiding&&X.t>3.2&&H.mode!=='pursue'&&HIDE_LOOK[C.hiding])checkHide(C.hiding);
  else if(X.stage==='hunt'&&!X.checked&&!C.hiding&&X.t>10&&H.mode==='patrol')watchStairs();
  if(X.check){const c=X.check,d=HGd.doors[HGd.hides[c.id].door];c.t+=dt;
   if(c.phase==='open'||c.phase==='head')d.set(Math.min(.62,d.open+dt*.45));else if(c.phase==='leave')d.set(Math.max(.3,d.open-dt*.5));
   if(['hand','open','head'].includes(c.phase)&&C.hiding!==c.id){X.check=null;mark('out of the closet with it right there');H.script([{wait:3,state:'alert',look:()=>camera.position}]);caught(playerTarget());return;}
   if(c.phase==='head'){c.headT+=dt;const holding=!!o.held?.('Space');c.held=(c.held||0)+(holding?dt:0);
    if(c.headT>.75&&!holding){X.check=null;mark('it hears you breathe');sound('c7Snarl',camera.position,{gain:1});H.script([{wait:3,state:'alert',look:()=>camera.position}]);caught(playerTarget());return;}}}
  if(X.peek){const d=HGd.doors[HGd.hides[X.peek.id].door];d.set(X.peek.open?Math.min(.9,d.open+dt*.8):Math.max(.25,d.open-dt*.8));}
  // the timer: ticking; then it rings (and what hears it comes to it)
  if(X.timer&&!X.timer.rang){const T2=X.timer;T2.t+=dt;T2.tick+=dt;if(T2.tick>.5){T2.tick=0;sound('tap',T2.pos,{gain:.14});}GX().timer.rotation.y=-T2.t*.5;
   if(T2.t>=T2.ring){T2.rang=true;mark('the timer rings');for(let i=0;i<12;i++)later(i*.1,()=>sound(i%2?'tap':'c6Clank',T2.pos,{gain:i%2?.55:.3}));const heard=H.hear(T2.pos,2.2,{id:'the timer'});X.lure={id:'timer',pos:T2.pos,at:X.t,heard};}}
  if(X.lure&&!X.lure.done&&H.mode==='search'&&H.lastKnown?.id==='the '+X.lure.id&&Math.hypot(HM.x-X.lure.pos.x,HM.z-X.lure.pos.z)<1.5)learn(X.lure);
  // (a noise it heard and went to, that it lost on the way: it comes back to the stairs, and the next noise works no better)
  if(X.lure&&!X.lure.done&&H.mode==='patrol'&&X.t-X.lure.at>25){X.lure.done=true;learnedLoop({at:0});}
  // (it waits at the stairs a long time: Jamie goes for the timer himself)
  if(X.stage==='watch'&&!X.timer&&X.t-X.watchAt>90&&!X.jamieTimer&&!busy()){X.jamieTimer=true;say([J('(I’ll do it. Stay here.)',{time:1.8,face:'afraid'})],{then:()=>{if(!X.timer)windTimer();}});}
  // going round, it looks in the closets it passes
  if(X.stage==='learned'&&H.mode==='patrol'&&!X.check&&!X.peek){for(const [nid,hid] of [['denCloset','den'],['pantryFront','pantry']]){const n=H.node(nid);if(n&&Math.hypot(HM.x-n.x,HM.z-n.z)<.6&&X.t-((X.peeked||={})[hid]??-99)>20){X.peeked[hid]=X.t;quickCheck(hid);break;}}}
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
  objective('The dresser.','Against the door. F.');
  later(.8,()=>say([J('The dresser— help me—',{time:1.6,face:'terrified'})]));
  // (it heard that: up the stairs, and it stands at the top of them; you hear every tread)
  later(1.0,()=>{if(C.dr!==X)return;const foot=HW(0,-2.0),top=HW(0,2.4,'u');H.setTargets([]);H.setMode('script');HM.show(true);const up=HL.level==='u';
   H.script([...(up?[]:[{to:[foot.x,foot.z],speed:2.6,state:'run',low:.5},{to:[top.x,top.z],speed:.9,state:'walk',low:.3,free:true,keepY:false},{act:()=>{HL.level='u';X.upTop=true;}}]),
    {until:()=>X.pushed,state:'idle',look:()=>HW(-HH.UCX,3.3,'u')}]);
   for(let i=0;i<10;i++)later(1.4+i*.62,()=>{if(!X.pushed)sound(i%2?'c7Step':'c7Board',HW(0,-1.4+i*.42),{gain:.8});});});
  X.shutAt=X.t;}
 // the dresser will not slide: it stands on the rug. Jamie lifts; you pull the rug out from under it while it is up
 function rugStuck(){const X=C.dr;if(X.rug||X.pushed)return;X.rug={stage:'stuck',t:0,cycle:0};sound('c7Furniture',HW(-2.2,1.0,'u'),{gain:.5});mark('the dresser will not move: the rug');
  stand(jamie,()=>HW(-2.2,.3,'u'),{look:()=>HW(-2.2,1.0,'u'),keep:true,max:1.6});
  say([J('It won’t— it’s on the RUG— it won’t slide—',{time:2,face:'terrified'}),J('I’ll lift it. When I lift, pull the rug out. When I say.',{time:3,face:'afraid'})],{then:()=>{if(X.rug.stage==='stuck'){X.rug.stage='lift';X.rug.t=0;objective('Pull the rug out from under it.','When Jamie lifts the dresser. F.');}}});}
 function pullRug(who){const X=C.dr,R=X?.rug;if(!R||R.stage!=='lift')return;
  if(who==='you'&&!R.up){R.miss=(R.miss||0)+1;mark('the rug: too soon');say([J(R.miss>1?'WAIT for it— when it’s UP—':'Not yet— when I lift—',{time:1.6,face:'afraid'})]);return;}
  R.stage='out';R.outT=0;mark('the rug, out ('+who+')');sound('c7Drag',HW(-2.6,1.2,'u'),{gain:.9});
  say([J('PUSH— PUSH IT—',{time:1.2,face:'terrified'})],{then:()=>{if(!X.pushed)objective('Push it against the door.','F.');}});if(who==='jamie')later(.7,()=>pushDresser('jamie'));}
 function pushDresser(who){const X=C.dr;if(X.pushed)return;if(who==='you'&&X.rug?.stage!=='out'){rugStuck();return;}X.pushed=true;X.pushT=0;mark('the dresser ('+who+')');sound('c7Furniture',HW(-HH.UCX-.4,2.0,'u'),{gain:.9});
  // (Jamie behind it, shoving, as it goes: then against it, holding)
  stand(jamie,()=>{const d=HGd.dresser.position;return HW(d.x,d.z-.82,'u');},{look:()=>HW(-HH.UCX-.4,3.3,'u'),keep:true,max:.3});objective('Hold it.','');
  // it comes up: the stairs, the door, the hits
  later(X.upTop?.6:2.2,()=>{const foot=HW(0,-2.0),top=HW(0,2.4,'u'),door=HW(-HH.UCX+.6,3.3,'u'),up=X.upTop;if(!up)HL.level='g';H.setMode('script');HM.show(true);
   H.script([...(up?[]:[{to:[foot.x,foot.z],speed:2.6,state:'run',low:.6},{to:[top.x,top.z],speed:2.0,state:'walk',low:.3,free:true},{act:()=>{HL.level='u';}}]),{to:[door.x,door.z],speed:1.4,state:'walk',low:.3,free:true},
    {face:[HW(-2,3.3,'u').x,HW(-2,3.3,'u').z]},{wait:.8,state:'idle',look:()=>HW(-2,3.3,'u')},
    {act:()=>hitDoor(1)},{wait:1.6,state:'hit',reach:()=>HW(-HH.UCX-.05,3.3,'u'),reachL:null},{act:()=>hitDoor(2)},{wait:2.2,state:'hit'},{act:()=>{sound('c7Drag',HW(-HH.UCX,3.3,'u'),{gain:.8});}},{wait:3,state:'idle',reach:null},
    {to:[top.x,top.z],speed:1.0,state:'walk',free:true},{act:()=>{HL.level='g';}},{to:[foot.x,foot.z],speed:1.0,state:'walk',free:true},{act:()=>{HGd.doors.front.set(1);sound('doorOpen',HW(0,-4.4),{gain:.8});}},
    {to:[HW(0,-6).x,HW(0,-6).z],speed:1.2,state:'walk',free:true},{to:[court.SPOT.greenRoad.x,court.SPOT.greenRoad.z],speed:1.3,state:'stalk'},{wait:1.6,state:'idle',look:()=>HW(-3,4.5,'u')},
    {to:()=>{const b=C.bikesAt||{x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z};return [b.x,b.z];},speed:2.2,state:'walk',low:.3},{act:()=>{H.setMode('off');HM.show(false);X.gone=true;mark('it has gone up the street');}}]);});}
 function hitDoor(n){const X=C.dr,d=HGd.doors.boy;X.hit=n;X.shakeT=.45;sound('c7Door',HW(-HH.UCX,3.3,'u'),{gain:1.3+.2*n});T?.set?.(1,{rise:.8,why:'the door'});o.foot.land=.05;
  const dr=HGd.dresser;HGd.moveDresser(dr.position.x+.05*n,dr.position.z-.02,dr.rotation.y);mark('the door, hit '+n);
  if(n===1)later(.4,()=>say([J('HOLD IT— hold it—',{time:1.6,face:'terrified'})]));}
 function updateDoor(dt){const X=C.dr;if(!X)return;X.t+=dt;const d=HGd.doors.boy;
  if(X.shut&&!X.rug&&!X.pushed&&X.shutAt!=null&&X.t-X.shutAt>9)rugStuck();
  const R=X.rug;if(R?.stage==='lift'&&!X.pushed){R.t+=dt;const ph2=R.t%3.2,up=ph2>1.0&&ph2<2.5;const dr=HGd.dresser;
   if(up&&!R.up){R.up=true;R.cycle++;sound('c7Furniture',HW(-2.2,1.0,'u'),{gain:.4});face(jamie,'terrified',3);say([J(R.cycle===1?'NOW—':R.cycle%2?'NOW! Pull—':'Now— NOW—',{time:1,face:'terrified'})]);}
   if(!up&&R.up){R.up=false;sound('c5WoodStrike',HW(-2.2,1.0,'u'),{gain:.45});}
   const lift=up?smooth(Math.min(1,(ph2-1.0)/.25))*(1-smooth((ph2-2.25)/.25)):0;dr.rotation.z=.08*lift;dr.position.y=HH.UP+.05*lift;
   if(R.t>34&&!R.heave){R.heave=true;say([J('MOVE—',{time:1,face:'terrified'})]);R.up=true;pullRug('jamie');}}
  else if(HGd.dresser.rotation.z!==0&&!X.pushed){HGd.dresser.rotation.z=0;HGd.dresser.position.y=HH.UP;}
  if(R?.stage==='out'&&R.outT<1){R.outT=Math.min(1,R.outT+dt/.5);const u=smooth(R.outT),rg=HGd.extra.rug,r0=HGd.rug0;rg.position.set(r0.x-1.15*u,HH.UP,r0.z+.2*u);rg.scale.set(1-.4*u,1,1);rg.rotation.y=.3*u;HGd.dresser.rotation.z=0;HGd.dresser.position.y=HH.UP;}
  if(X.closing!=null&&X.closing>0){X.closing=Math.max(0,X.closing-dt*2.4);d.set(X.closing);}
  if(X.shakeT>0){X.shakeT-=dt;d.pivot.rotation.y=-Math.PI/2+Math.sin(C.t*60)*.03*(X.shakeT/.45);}
  if(X.pushed&&X.pushT<1){X.pushT=Math.min(1,X.pushT+dt/1.5);const a=smooth(X.pushT),s0=HGd.spots.dresserStart,s1=HGd.spots.dresserBlock;HGd.moveDresser(s0.x+(s1.x-s0.x)*a,s0.z+(s1.z-s0.z)*a,Math.PI/2);}
  if(X.gone&&!X.after&&!busy()){X.after=true;say([{wait:1.4},J('…It’s going up the street.',{time:2}),J(C.bikesAt?'It’s going toward the bikes.':'It’s just— walking. Like it lives here.',{time:2.2,face:'afraid'}),
    // (the room held: Jamie, down against the dresser, the star in his hand)
    ...(C.flags.star?[{wait:1.2},N('Jamie slides down with his back against the dresser. He has the star in his hand.',{time:3.4}),J('…If it’s his, he was in this house.',{time:2.6,face:'sad'}),J('He was right here.',{time:1.8,face:'sad'})]:[J('…We’re okay. We’re okay.',{time:2,face:'sad'})])],{then:()=>upstairsStart()});}}
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
  let land={x:bx,z:bz};for(const [f,sd] of [[2.6,1.2],[2.2,0],[1.8,-1.0],[1.4,0],[.8,0]]){const c={x:bx+Math.sin(a)*f+Math.cos(a)*sd,z:bz-Math.cos(a)*f+Math.sin(a)*sd};if(nav.walkable(c.x,c.z,{r:.3})){land=c;break;}}Object.assign(JL,{on:true,x:land.x,z:land.z,y:gy(land.x,land.z),t:0,phase:'thrown',from:{x:bx,z:bz,y:gy(bx,bz)+.9},grip:false,dragS:0,hand:null,q:null});
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
 // (while he is down, his hand where he was last laid out: the friends' own riding update, which runs before he is laid down
 //  each frame, puts his body back on its bike's origin in between, and a hand read there sent the struggle's view across the map)
 function jamieHand(){if(JL.on){if(JL.hand)return JL.hand.clone();return new THREE.Vector3(JL.x+JL.dir.x*1.9,JL.y+.25,JL.z+JL.dir.z*1.9);}
  jamie.person.group.updateMatrixWorld(true);return jamie.person.parts.rhand.getWorldPosition(new THREE.Vector3());}
 function grabHand(){const X=C.gb;if(X.stage!=='grab'||X.grip0)return;X.grip0=true;X.stage='struggle';X.st=0;go('n7-grab');mark('you have his hand');sound('c7Drag',jamieHand(),{gain:.5});
  JL.grip=true;phys.ME.extra.push(gripArms);C.gripFn=gripArms;objective('HOLD ON.','Hold F. Pull back: S.');
  say([J('DON’T LET GO— DON’T LET GO—',{time:2,face:'terrified'})]);}
 // your hands on his wrist (first person: both arms to his hand, held there)
 function gripArms(p,{toLocal:tl}){
  const L=tl(jamieHand()),shoulder=shoulderPos(p,-1,new THREE.Vector3()).add(shoulderPos(p,1,new THREE.Vector3())).multiplyScalar(.5);
  const reach=L.clone().sub(shoulder),distance=reach.length(),bend=Math.min(.55,Math.max(0,distance-.36));
  // Kneel and lean from the hips so both wrists can reach without stretching
  // the skeleton. Feet retain their ground targets while the knees fold.
  if(distance>.001){reach.multiplyScalar(bend/distance);p[PI.root]+=reach.x;p[PI.root+1]+=reach.y;p[PI.root+2]+=reach.z;}
  for(const [o2,e,s] of [[PI.rh,PI.re,1],[PI.lh,PI.le,-1]]){p[o2]=L.x+s*.022;p[o2+1]=L.y-.012;p[o2+2]=L.z+.014;p[e]=s*.75;p[e+1]=-.35;p[e+2]=.5;}
 }
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
  if(X.stage==='struggle'){const h=jamieHand(),bx=h.x+JL.dir.x*.22,bz=h.z+JL.dir.z*.22;if(!C.pose||C.pose.release)pose({x:bx,z:bz},{y:gy(bx,bz)+.61,yaw:headingTo(bx,bz,c.x,c.z),pitch:-.6,slow:.35});
   // (looking down at his hands in yours, his face, and along him to the thing that has his ankle, which the view keeps as it drags)
   {let d=headingTo(C.pose.x,C.pose.z,c.x,c.z)-C.pose.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));C.pose.yaw+=d*Math.min(1,dt*3);}
   C.pose.x=damp(C.pose.x,bx,10,dt);C.pose.z=damp(C.pose.z,bz,10,dt);C.pose.y=gy(bx,bz)+.61+Math.sin(C.t*31)*.006*X.pull;}}
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
  const fy=gy(g.position.x,g.position.z)+.012;if(g.position.y<fy){g.position.y=fy;if(Math.abs(F.v.y)>1.2){F.v.y*=-.25;F.v.x*=.4;F.v.z*=.4;sound('c7Gum',g.position,{gain:.35});}else{F.done=true;g.rotation.set(0,g.rotation.y,0);
    // (it ends up where you can get to it: thrown off his hand by the lane's mouth it could land in the hedge, under it, or
    //  past where the ground can be walked, and there it could never be picked up; it is in the grass at the nearest place)
    if(!nav.walkable(g.position.x,g.position.z,{r:.35}))for(let rr=.25,found=false;rr<=3.5&&!found;rr+=.25)for(let k=0;k<16;k++){const a=k*Math.PI/8+rr,x=g.position.x+Math.sin(a)*rr,z=g.position.z-Math.cos(a)*rr;
      if(nav.walkable(x,z,{r:.35})){g.position.set(x,gy(x,z)+.012,z);found=true;break;}}
    C.gumAt={x:g.position.x,y:g.position.y,z:g.position.z};mark('the gum, in the grass');}}}
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
   {wait:2.4,act:()=>{jm.gest('head');jm.walk([[c2.x+1.6,c2.z]],{speed:1});}},{wait:3}],{then:()=>afterEvidence()});
  C.flags.forgetReyes=true;C.flags.forgetPhotoMom=true;}
 function afterB(){const jm=cast.jamieMom,b=LK.bench,c2=main(1118,2.6);C.af.stage='forget';mark('the forgetting');
  say([{who:'OFFICER',text:'“Description for the second one?”',from:officer,time:2.2},R('Twelve. Blue cap. Orange shirt. His name is Jamie.',{time:3,act:()=>{reyes.gest('fold');reyes.lookAt=officer.person.group.position;}}),
   {who:'JAMIE’S MOM',text:'“Look at it. You look at it. He’s right there.”',from:jm,time:2.6,act:()=>{jm.gest('phone');}},{wait:1.4},{who:'OFFICER',text:'“Ma’am— there’s nobody in this one.”',from:officer,time:2.2},
   {who:'JAMIE’S MOM',text:'“He’s in all of these. He’s in— where is—”',from:jm,time:2.8,face:'terrified'},{who:'OFFICER',text:'“A school picture is fine, ma’am. Anything.”',from:officer,time:2.4},
   {wait:1.2,act:()=>sound('c6Static',{x:officer.x,y:gy(officer.x,officer.z)+1.2,z:officer.z},{gain:.35})},{who:'DISPATCH (RADIO)',text:'“…all units, Oak Hollow Drive, end of the street: one juvenile missing. One.”',time:3.6},
   R('Two. TWO.',{time:1.4,face:'tired'}),{wait:1.2},R('…Two.',{time:1.4}),
   ...(C.af?.capWithMom?[{wait:.8},{who:'OFFICER',text:'“Ma’am, is that— whose hat is that? Is that evidence?”',from:officer,time:2.6},{wait:1.4},{who:'JAMIE’S MOM',text:'“…I don’t—”',from:jm,time:1.4},
    {who:'JAMIE’S MOM',text:'“I don’t know whose this is.”',from:jm,time:2.2,act:()=>{C.af.capDown=true;mark('the cap, nobody’s');capOnHood();}}]:[]),
   {wait:2.2},{who:'OFFICER',text:'“And the other one. From yesterday. The Mill Creek kid.”',from:officer,time:2.8},{wait:.6},R('…S—',{time:1.2}),
   {act:()=>{reyes.gest('phone');mark('Reyes looks at his notebook');}},{wait:2.4},R('Sam.',{time:1.4}),{wait:.8},R('His name is Sam.',{time:1.8}),{wait:2.6},
   {act:()=>{reyes.gest('fold');reyes.lookAt=camera.position;const p0=me(),rq2=C.af?.notes?{x:p0.x+Math.sin(p0.a)*1.4,z:p0.z-Math.cos(p0.a)*1.4}:main(LOOKOUT.bench.d-1.1,LOOKOUT.bench.lat+.2);reyes.walk([[rq2.x,rq2.z]],{speed:.8,then:a=>{const p1=me();a.faceTo(p1.x,p1.z);}});}},{wait:1.6}],
   {then:()=>{if(C.af?.notes)afterRecord();else afterLeave();}});void c2;}
 function afterLeave(){say([R('Your bike’s in my trunk. Jamie’s too. I’ll bring them back tomorrow.',{time:3}),R('I’m taking you to Sam’s. Your mom’s meeting us there. That’s where everybody is.',{time:3.4})],{then:()=>{C.af.stage='done';later(1.6,()=>toSams());}});}
 // ---- (expanded) later: show Reyes where; Jamie's mom asks you; her phone; what his notebook says an hour later ----------------------------
 // the evidence in the grass: his bike where it went down, his cap, the two marks his heels made to the mouth of the path
 const capMesh=(()=>{const g=new THREE.Group();g.name='c7-jamies-cap';const blue=new THREE.MeshStandardMaterial({color:0x1e2f6a,roughness:.85});
  const crown=new THREE.Mesh(new THREE.SphereGeometry(.1,16,10,0,Math.PI*2,0,Math.PI/2),blue);crown.scale.set(1,.8,1.1);g.add(crown);
  const bill=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.008,16,1,false,-Math.PI*.35,Math.PI*.7),blue);bill.position.set(0,.004,-.07);bill.scale.set(1,1,1.2);g.add(bill);g.visible=false;scene.add(g);return g;})();
 const marksG=(()=>{const g=new THREE.Group();g.name='c7-drag-marks';g.visible=false;scene.add(g);return g;})();
 function evidencePlaces(){const sp=court.SPOT,R3=court.R3,mouth=sp.mouth;
  // (where his bike went down, if that was here by the path; if it was out on the road, Reyes has walked it back here)
  const bike=C.jBikeDown&&Math.hypot(C.jBikeDown.x-mouth.x,C.jBikeDown.z-mouth.z)<20&&nav.walkable(C.jBikeDown.x,C.jBikeDown.z,{r:.3})?{x:C.jBikeDown.x,z:C.jBikeDown.z}:(()=>{const q=R3(7.2,-9.8);return {x:q.x,z:q.z};})();
  const land=(JL.x||JL.z)&&Math.hypot(JL.x-mouth.x,JL.z-mouth.z)<25?{x:JL.x,z:JL.z}:(()=>{const q=R3(3.6,-6.2);return {x:q.x,z:q.z};})();
  const at=u=>({x:land.x+(mouth.x-land.x)*u,z:land.z+(mouth.z-land.z)*u});const cap=(()=>{const q=at(.78),dx=mouth.x-land.x,dz=mouth.z-land.z,l=Math.hypot(dx,dz)||1;return {x:q.x-dz/l*1.0,z:q.z+dx/l*1.0};})();
  // (each with its own ground: the marks where he went down, the cap near the path, his bike off to the side)
  return {bike,land,mouth:{x:mouth.x,z:mouth.z},marks:at(.18),cap,at};}
 function evidenceProps(on,E){capMesh.visible=on;marksG.visible=on;if(!on)return;
  capMesh.position.set(E.cap.x,gy(E.cap.x,E.cap.z)+.02,E.cap.z);capMesh.rotation.set(.25,.8,.15);
  const trackKey=[E.land.x,E.land.z,E.mouth.x,E.mouth.z].join('/');
  if(marksG.userData.site!==trackKey){
   for(const strip of [...marksG.children]){strip.geometry.dispose();strip.removeFromParent();}
   marksG.userData.site=trackKey;const m=marksG.userData.ink??=heelMark();
   const dx=E.mouth.x-E.land.x,dz=E.mouth.z-E.land.z,L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L,n=Math.ceil(L/.45);
   for(const sd of [-1,1])for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,wob=Math.sin(k*1.7+sd)*.04,x0=E.land.x+dx*u0+nx*(.13*sd+wob),z0=E.land.z+dz*u0+nz*(.13*sd+wob),x1=E.land.x+dx*u1+nx*(.13*sd+wob),z1=E.land.z+dz*u1+nz*(.13*sd+wob);
    const seg=new THREE.Mesh(new THREE.PlaneGeometry(.16+.04*Math.sin(k*2.3),Math.hypot(x1-x0,z1-z0)+.05),m);seg.rotation.order='YXZ';seg.rotation.set(-Math.PI/2,Math.atan2(-(x1-x0),-(z1-z0)),0);
    seg.position.set((x0+x1)/2,gy((x0+x1)/2,(z0+z1)/2)+.018,(z0+z1)/2);marksG.add(seg);}}
  // his bike, where it went down (in the dark, on its side)
  const jb=jamie.bike.group;jb.visible=true;jb.position.set(E.bike.x,gy(E.bike.x,E.bike.z)+.05,E.bike.z);jb.rotation.set(0,jb.rotation.y,1.35);}
 function flashAt(q){const X=C.af;X.photos=(X.photos||0)+1;sound('click',q,{gain:.9});light(3,{x:q.x,y:gy(q.x,q.z)+1.5,z:q.z},{intensity:10,dist:7,color:0xffffff});later(.12,()=>light(3,null));mark('photo '+X.photos);}
 function afterEvidence(){const X=C.af;X.stage='show';X.shown={};mark('show me where');unpose();o.roam.walkLock=false;
  // (up off the bench, on your feet: your bike is in his trunk)
  {const s0=main(LOOKOUT.bench.d+.9,LOOKOUT.bench.lat-.4);o.placePlayer({x:s0.x,z:s0.z,a:headingTo(s0.x,s0.z,reyes.x,reyes.z),mode:'walk',bike:null});}const E=evidencePlaces();X.E=E;evidenceProps(true,E);
  reyes.gest('fold');reyes.lookAt=camera.position;
  say([{wait:1},R('Hey. Look at me. You’re okay. You’re okay.',{time:2.4}),R('I need you to show me where. Exactly where it happened. Can you do that?',{time:3.4}),R('Take your time.',{time:1.4})],
   {then:()=>{X.go=true;objective('Show Officer Reyes where it happened.','His bike. His cap. The marks in the grass. And the gum. F: show him.');}});}
 function showEvidence(kind){const X=C.af,E=X.E;if(!X.go||X.shown[kind]||X.busyR)return;X.busyR=true;X.shown[kind]=true;mark('shown: '+kind);const p=me();
  const q=kind==='gum'?{x:p.x,z:p.z}:kind==='bike'?E.bike:kind==='cap'?E.cap:E.marks,qy={x:q.x,y:gy(q.x,q.z)+(kind==='gum'?1.1:.15),z:q.z};
  const st=(()=>{const a=headingTo(q.x,q.z,p.x,p.z);return kind==='gum'?{x:p.x+Math.sin(p.a)*1.1,z:p.z-Math.cos(p.a)*1.1}:{x:q.x+Math.sin(a)*1.1,z:q.z-Math.cos(a)*1.1};})();
  const done=()=>{X.busyR=false;light(2,null);reyes.gest('fold');reyes.lookAt=camera.position;};
  const lines={bike:[R('His bike.',{time:1.4}),R('It went down here. He came off it, here.',{time:2.6}),{act:()=>flashAt(qy)},{wait:.8},{act:()=>sound('c7Pencil',qy,{gain:.6})},R('Okay. Okay.',{time:1.4})],
   marks:[N('Two long marks in the grass, pressed flat, a heel’s width apart. They go to the mouth of the path.',{time:4.2}),R('Heels.',{time:1.2}),R('He was dragged. Both heels. All the way to the path.',{time:3,face:'tired'}),{act:()=>flashAt(qy)},
    {act:()=>{light(2,{x:E.mouth.x,y:gy(E.mouth.x,E.mouth.z)+1.2,z:E.mouth.z},{intensity:2,dist:5,color:0xeef2ff});}},N('At the mouth of the path the marks stop. Past it the grass stands up straight, like nothing went in.',{time:4.2})],
   cap:[R('Is this his?',{time:1.4}),N('His blue cap. The one he turns backwards when he rides.',{time:3}),{act:()=>flashAt(qy)},{wait:.6,act:()=>{capMesh.visible=false;X.capReyes=true;}},R('I’ll give it to his mom.',{time:2})],
   gum:[R('What’s that?',{time:1.2}),N('The pack of gum. Spearmint. Sam’s. Jamie’s.',{time:2.8}),R('Where was it?',{time:1.4}),N('You point at the grass where it was.',{time:2.4}),{act:()=>flashAt(qy)},{wait:.6},R('Keep it. Keep it safe for him.',{time:2.4,face:'tired'})]}[kind];
  reyes.walk([[st.x,st.z]],{speed:1.7,then:a=>{a.faceTo(q.x,q.z);a.gest(kind==='gum'?'fold':'flashlight');a.lookAt=qy;if(kind!=='gum')light(2,{x:q.x,y:gy(q.x,q.z)+1.3,z:q.z},{intensity:2.2,dist:4,color:0xeef2ff});say(lines,{then:done});}});}
 function reyesNotes(){const X=C.af;X.notes=true;mark('Reyes’s notes, as he wrote them');reyes.gest('phone');sound('c7Pencil',{x:reyes.x,y:gy(reyes.x,reyes.z)+1.2,z:reyes.z},{gain:.6});
  say([{wait:1.2},R('Read it back to me. Tell me if I got it right.',{time:2.6})],{then:()=>{const pg=pageMesh(reyesPage({altered:false}),{w:.18,h:.24,color:0xf6f3e6});
   inspect(pg,{dist:.33,kind:'reyes-page',restore:false,plane:true,onClose:()=>{pg.removeFromParent();afterMom();},lines:[N('His notebook, in blue ballpoint, pressed hard into the page.',{time:3}),N('21:38. 2ND JUV. MISSING. JAMIE, 12. Blue cap, orange shirt. His bike. The marks, nine meters to the path. The cap. The gum.',{time:5.6}),R('That’s right? …That’s right.',{time:2})]});}});}
 // Jamie's mom: two things she asks you; then the picture on her phone
 function afterMom(){const X=C.af;if(X.stage==='asks')return;X.stage='asks';X.momAt=X.t;mark('Jamie’s mom asks you');const jm=cast.jamieMom,p=me(),q={x:p.x+Math.sin(p.a)*1.3,z:p.z-Math.cos(p.a)*1.3};
  jm.walk([[q.x,q.z]],{speed:1.9,then:a=>{const p1=me();a.faceTo(p1.x,p1.z);a.lookAt=camera.position;}});
  later(2.4,()=>say([...(X.capReyes?[{act:()=>{X.capWithMom=true;}},{who:'JAMIE’S MOM',text:'“Is that his? That’s his. That’s his cap.”',from:jm,time:2.6,act:()=>jm.gest('head')}]:[]),
   {who:'JAMIE’S MOM',text:'“What was he wearing? Tell me exactly. They keep asking me and I can’t— you tell me.”',from:jm,time:3.8}],
   {then:()=>choose([{id:'cap',label:'“His blue cap. His orange shirt.”'},{id:'dunno',label:'“…I don’t know. I don’t remember.”'}],{then:id=>momQ1(id),timeout:20,fallback:'cap'})}));}
 function momQ1(id){const jm=cast.jamieMom;C.af.q1=id;
  say(id==='cap'?[{who:'JAMIE’S MOM',text:'“His orange shirt. The one with the hole in the sleeve he won’t let me throw out.”',from:jm,time:3.6}]
   :[{who:'JAMIE’S MOM',text:'“You were WITH him. All day you were with him—”',from:jm,time:2.6,face:'terrified'},{wait:.8},{who:'JAMIE’S MOM',text:'“…I’m sorry. I’m sorry. It’s okay.”',from:jm,time:2.4,face:'sad'}],
   {then:()=>say([{wait:.4},{who:'JAMIE’S MOM',text:'“Did he say anything? Before. Did he say anything to you?”',from:jm,time:3}],{then:()=>choose([{id:'together',label:'“He said we stay together.”'},{id:'gum',label:'“He said he’d give Sam his gum back.”'}],{then:id2=>momQ2(id2),timeout:20,fallback:'together'})})});}
 function momQ2(id){const jm=cast.jamieMom;C.af.q2=id;
  say([...(id==='together'?[{who:'JAMIE’S MOM',text:'“…Stay together. That’s him. That’s exactly him.”',from:jm,time:3}]:[{who:'JAMIE’S MOM',text:'“…Sam’s gum. He would. He would do that.”',from:jm,time:2.8}]),
   {wait:.6},{who:'JAMIE’S MOM',text:'“Look— look. This is him last week. At the pool. You were there.”',from:jm,time:3.2,act:()=>jm.gest('phone')}],{then:()=>momPhone()});}
 function momPhone(){const jm=cast.jamieMom,ph=new THREE.Group();ph.name='c7-moms-phone';
  const body=new THREE.Mesh(new THREE.BoxGeometry(.075,.14,.009),new THREE.MeshStandardMaterial({color:0x18181c,roughness:.4}));ph.add(body);const scr=pageMesh(poolPhoto(),{w:.066,h:.118,color:0x2a8ac8});scr.position.z=.0047;ph.add(scr);mark('her phone');
  inspect(ph,{dist:.24,kind:'mom-phone',restore:false,plane:true,onClose:()=>{ph.removeFromParent();momAfter();},lines:[
   N('Her phone. A picture from the pool: the deck, the deep end, a striped towel, a bike against the fence.',{time:4.4}),
   {who:'JAMIE’S MOM',text:'“He’s right there. On the towel. Doing the thing with his fingers, the bunny ears.”',from:jm,time:3.6},
   N('There is nobody on the towel. There is a damp shape on it, where somebody was sitting.',{time:4}),
   {who:'JAMIE’S MOM',text:'“Why are you looking at me like that? He’s RIGHT THERE.”',from:jm,time:3,face:'terrified'}]});}
 function momAfter(){const X=C.af;X.stage='forget';const jm=cast.jamieMom;jm.walk([[officer.x+1.3,officer.z]],{speed:1.4,then:a=>{a.faceTo(officer.x,officer.z);}});later(1.6,()=>afterB());}
 function updateAfter(dt){const X=C.af;if(!X)return;X.t+=dt;
  if(X.stage==='show'&&X.go&&!X.busyR){const p=me(),d=Math.hypot(p.x-reyes.x,p.z-reyes.z);X.rT=(X.rT||0)-dt;
   if(d>3.2&&X.rT<=0){X.rT=1.2;const a=p.a,q={x:p.x-Math.sin(a)*1.3+Math.cos(a)*.9,z:p.z+Math.cos(a)*1.3+Math.sin(a)*.9};if(nav.walkable(q.x,q.z,{r:.3}))reyes.walk([[q.x,q.z]],{speed:1.8,then:a2=>{a2.lookAt=camera.position;}});}
   if(['bike','cap','marks','gum'].every(k2=>X.shown[k2]||(k2==='gum'&&C.inv.gum!=='have'))&&!X.notes&&!busy()&&!C.view)reyesNotes();}}
 function capOnHood(){const c=k.carB;const q=c?.group?.position||{x:officer.x,z:officer.z};capMesh.visible=true;capMesh.position.set(q.x+.4,gy(q.x,q.z)+1.0,q.z);capMesh.rotation.set(0,1.2,0);}
 // what his notebook says now: the ink has nothing where the name was; the paper still has it, pressed in, turned to the light
 function afterRecord(){const X=C.af;X.stage='record';mark('the page, an hour later');
  say([R('…I wrote it down. I know I wrote his name down.',{time:2.8,face:'tired'}),R('Look. Look at this. Is that— is that my writing?',{time:3})],{then:()=>{
   const g=new THREE.Group();g.name='c7-reyes-page-now';const pg=pageMesh(reyesPage({altered:true}),{w:.18,h:.24,color:0xf6f3e6});g.add(pg);
   const it=texOf(reyesIndent()),ov=new THREE.Mesh(new THREE.PlaneGeometry(.18,.24),new THREE.MeshBasicMaterial({map:it,transparent:true,opacity:0,depthWrite:false,color:it?0xffffff:0xc8c4b4}));ov.position.z=.0006;g.add(ov);g.userData.indent=ov;
   inspect(g,{dist:.33,kind:'reyes-page-now',restore:false,plane:true,onClose:()=>{g.removeFromParent();C.flags.reyesPage=true;afterLeave();},lines:[N('His page. The same blue ballpoint: JUV. MISSING, 12. Blue cap, orange shirt. Where the name was, nothing.',{time:4.6}),
    N('The line that said SECOND does not say it.',{time:2.6}),N('But he pressed hard. Turn it to the light.',{time:2.6})]});X.recordAt=X.t;}});}
 function toSams(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>samsNight();}
 // ---- Sam's room, that night ---------------------------------------------------------------------------------------------------------------
 function samsNight(){go('n7-sams');checkpoint('c7-sams');evidenceProps(false);jamie.bike.group.visible=false;C.h=Math.max(C.h,HOUR.sams);C.hMin=HOUR.sams;C.minute=-1;C.sn={t:0,stage:'in'};mark('Sam’s, that night');unpose();
  for(const a of [reyes,officer,cast.jamieMom,...(ch2.extra||[])])a.show(false);k.carA.show(false);k.carB.show(false);police.attach?.(false);court.attach(false);
  house.show(true);house.reset();house.show(true);house.lightsOut(true);nav.setRoom(house.nav);house.items.gum.visible=false;house.items.notebook.visible=false;photoState('one');
  houseAdults('night');light(0,{...HS.kitchenTable,y:HS.kitchenTable.y+1.4},{intensity:2.2,dist:7,color:0xffd2a0});light(1,{...HS.bed,y:HS.bed.y+1.6},{intensity:2.6,dist:6,color:0xcbd3c5});light(2,null);light(3,null);
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
  closeLook({x:top.x,y:top.y,z:top.z},{back:.3,eye:1.24,kind:'names',floor:HS.couch.y});C.lookDur=null;void d;
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
  if(on)light(2,{x:main(SH.drivD-1.5,3.6).x,y:gy(main(SH.drivD,3).x,main(SH.drivD,3).z)+5.2,z:main(SH.drivD-1.5,3.6).z},{intensity:36,dist:14,color:0xffcf8a});}
 function lookOutside(){if(C.flags.window)return;C.flags.window=true;go('n7-window');mark('out the window');stageBikes(true);
  // (the view through his window, rendered from just outside it and a little up, past the corner of the garage, at the four
  //  bikes under the streetlight across the street; shown bright on the glass, the room dark around it)
  {const mid=main(SH.drivD-1.5,3.75),eye=house.toW(4.2,house.P.depth/2+2.2,house.FL+1.75);house.renderView('night-bikes',{from:eye,look:{x:mid.x,y:gy(mid.x,mid.z)+.7,z:mid.z},bright:1.0});}
  // (square on to the glass, whatever corner of the room you were standing in: from the desk the line to it is at a slant)
  const w=HS.window,ins=house.toW(4.2,house.P.depth/2-2,house.FL+1.45);closeLook({x:w.x,y:w.y,z:w.z},{back:.62,eye:1.42,kind:'window',floor:HS.couch.y,yaw:headingTo(ins.x,ins.z,w.x,w.z)});C.lookDur=null;
  say([{wait:1.6},N('Under the streetlight across the street, four bikes stand in a row. The way you used to ride.',{time:4.4}),{wait:.8},N('Alex’s. Jamie’s. Sam’s.',{time:3}),{wait:1.4},N('Yours.',{time:2.6})],
   {then:()=>{later(2.6,()=>{C.endT=0;});}});}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Chapter Seven';if(pp)pp.innerHTML='THE STREET THAT WASN’T THERE<br>August 26, 2011.';}
  const nb=$('next-chapter');if(nb){nb.hidden=!A7.next;if(A7.next)nb.innerHTML='Chapter Eight <span>→</span>';}A7.finished=true;o.finish();}
 // ---- the photograph: rendered from the world (the oak, last July's light), with all four of you, and with only you ---------------------------
 const PH={four:null,one:null,state:'four'};
 function photoCanvas(who){const cv=canvas(PHOTO.w,PHOTO.h);if(!cv)return null;let ok=false;
  try{if(o.shoot&&o.readPixels&&typeof THREE.WebGLRenderTarget==='function'){const studio=cast.studio,o2=main(LOOKOUT.oak.d-3.36,LOOKOUT.oak.lat-4.18);
    const cam=new THREE.PerspectiveCamera(34,PHOTO.w/PHOTO.h,.1,300),cp=main(LOOKOUT.oak.d-10.5,LOOKOUT.oak.lat-7.5);cam.position.set(cp.x,gy(cp.x,cp.z)+1.25,cp.z);cam.lookAt(o2.x,gy(o2.x,o2.z)+.95,o2.z);cam.updateMatrixWorld();
    const keys=['player','jamie','sam','alex'];keys.forEach((kk,i)=>{const S2=studio[kk];const on=who.includes(kk);const q=main(LOOKOUT.oak.d-3.6+i*.15,LOOKOUT.oak.lat-6.2+i*1.35),qb=main(LOOKOUT.oak.d-3.0+i*.15,LOOKOUT.oak.lat-6.6+i*1.35);
     S2.person.group.visible=on;S2.bike.group.visible=on;if(!on)return;const a=headingTo(q.x,q.z,cam.position.x,cam.position.z);S2.person.group.position.set(q.x,gy(q.x,q.z),q.z);S2.person.group.rotation.set(0,-a,0);
     standPose(S2.pose,i*1.7,{look:0});S2.pose[PI.rh]=.32;S2.pose[PI.rh+1]=.95;S2.pose[PI.rh+2]=-.25;applyPose(S2.person,S2.pose);S2.person.face?.set?.(kk==='alex'?'grin':kk==='jamie'?'happy':kk==='sam'?'amused':'happy',{hold:9});S2.person.face?.update?.(1/30,{clock:i});
     extraArt.get(S2.person)?.update(1,{clock:i,eye:cam.position});for(const detail of portraits)if(detail.person===S2.person)detail.update(1,{clock:i});
     S2.bike.group.position.set(qb.x,gy(qb.x,qb.z),qb.z);S2.bike.group.rotation.set(0,-a+Math.PI/2,.1);});
    const rt=new THREE.WebGLRenderTarget(PHOTO.w,PHOTO.h,{colorSpace:THREE.SRGBColorSpace});
    // (last July at the oak: nobody else is in it; whoever the world has standing about today is put out of the picture)
    const hid=[],H2=g=>{if(g&&g.visible){g.visible=false;hid.push(g);}};
    for(const a of [...(k.adults||[]),reyes,officer,samDad,samMom,cast.jamieMom])H2(a?.person?.group);for(const c of comp.all){H2(c.person?.group);H2(c.bike?.group);}
    for(const car of [k.carA,k.carB])H2(car?.group);H2(HM?.root);for(const m of Object.values(cast.fam))H2(m.person.group);
    // (and the tire swing on its rope, which hangs right where Sam stood: it is not in the picture they took)
    if(!PH.swing){PH.swing=[];const oak=main(LOOKOUT.oak.d,LOOKOUT.oak.lat),wp=new THREE.Vector3();for(const top of scene.children)top.traverse?.(o=>{const pr=o.geometry?.parameters;if(o.isMesh&&o.geometry.type==='TorusGeometry'&&Math.abs((pr?.radius||0)-.3)<.01&&Math.abs((pr?.tube||0)-.11)<.01){o.getWorldPosition(wp);if(Math.hypot(wp.x-oak.x,wp.z-oak.z)<14)PH.swing.push(o.parent||o);}});}
    for(const g of PH.swing)H2(g);
    try{if(o.shoot({cam,target:rt,preset:{day:.35,dusk:.32,night:0},sun:[-50,22,40],at:{x:o2.x,y:gy(o2.x,o2.z),z:o2.z}})){const px=o.readPixels(rt,PHOTO.w,PHOTO.h);if(px){ch4.photo.toCanvas(cv,px,{blur:false});ok=true;}}}finally{for(const g of hid)g.visible=true;}rt.dispose?.();
    for(const kk of keys){studio[kk].person.group.visible=false;studio[kk].bike.group.visible=false;}}}catch{for(const kk of ['player','jamie','sam','alex']){cast.studio[kk].person.group.visible=false;cast.studio[kk].bike.group.visible=false;}}
  if(!ok)photoSketch(cv.g,PHOTO.w,PHOTO.h,{who});
  const g=cv.g,w=PHOTO.w,h=PHOTO.h;
  g.fillStyle='rgba(224,183,128,.10)';g.fillRect(0,0,w,h);
  const corners=g.createRadialGradient(w*.46,h*.46,w*.18,w*.5,h*.5,w*.67);
  corners.addColorStop(0,'rgba(46,36,25,0)');corners.addColorStop(1,'rgba(46,36,25,.29)');
  g.fillStyle=corners;g.fillRect(0,0,w,h);
  g.strokeStyle='#ded4b9';g.lineWidth=12;g.strokeRect(0,0,w,h);g.fillStyle='#e0d5bc';g.fillRect(0,h-22,w,22);
  g.fillStyle='#60574b';g.font='italic 13px Georgia';g.fillText('the oak, July',15,h-7);
  g.fillStyle='rgba(255,177,94,.96)';g.font='bold 14px monospace';g.fillText("'11 7 16",w-83,h-29);
  cv.rendered=ok;return cv;}
 function photoRender(){if(!PH.four){PH.four=photoCanvas(['player','jamie','sam','alex']);PH.fourTex=texOf(PH.four);}if(!PH.one){PH.one=photoCanvas(['player']);PH.oneTex=texOf(PH.one);}photoState(PH.state);}
 function photoState(s){PH.state=s;C.flags&&(C.flags.altered=s==='one');const m=house.photoMat,t=s==='one'?PH.oneTex:PH.fourTex;if(t){m.map=t;m.emissiveMap=t;m.color.setHex(0xffffff);}else{m.map=null;m.emissiveMap=null;m.color.setHex(s==='one'?0xc8b896:0xd8c8a0);}m.emissive.setHex(0);m.needsUpdate=true;}
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
    for(const id of Object.keys(ROOM_LOOKS))if(!C.looked.has(id))add('c7-look-'+id,{shelf:'Look at the shelf',games:'Look at the games',helmet:'Look at his helmet',hoodie:'Look at his hoodie',fish:'Look at the wooden fish',window:'Look out the window',bed:'Look at his bed',stars:'Look at the jar'}[id],HS[id],2.2,lk(id==='window'?.5:id==='bed'?.6:id==='stars'?.12:.22,.14));
    // (the morning, expanded: the tube on the shelf; his dad's list)
    if(C.mem&&!C.flags.tube)add('c7-tube','Take down the tube',HS.tube,2.3,lk(.25,.16));
    if(C.dl?.stage==='look'){if(!C.dl.found.has('pictures'))add('c7-drawer','Open his desk drawer',HS.drawer,1.9,lk(.2,.16));if(!C.dl.found.has('shoes'))add('c7-shoebox','Look under his desk',HS.shoebox,2.2,lk(.25,.18));if(!C.dl.found.has('watch'))add('c7-watch','His watch',HS.watch,1.9,lk(.12,.18));}}
   if(rm==='kitchen'&&C.mc){if(C.mc.stage==='go')add('c7-machine','Play the message',HS.machine,2.2,lk(.16,.18));else if(C.mc.stage==='cord')add('c7-cord','Look at its cord',HS.plug,2.2,lk(.12,.2));else if(C.mc.stage==='again')add('c7-machine','Play it again',HS.machine,2.2,lk(.16,.18));}
   if(rm==='kitchen'&&!C.looked.has('flyer'))add('c7-flyer','Look at the flyers',{...HS.kitchenTable,y:HS.kitchenTable.y+.02},2.4,lk(.25,.14));
   if(rm==='kitchen'&&!C.looked.has('list'))add('c7-list','Read the list on the fridge',HS.fridge,2.2,lk(.18,.14));
   if(rm==='living'&&!C.looked.has('tv'))add('c7-tv','Look at the TV',HS.tv,3.2,lk(.4,.12));
   if((rm==='living'||rm==='hall')&&(ph==='d7-garage')&&C.gr?.stage==='go')add('c7-out','Go outside',HS.door,2.4,lk(.6,.2));
   if(ph==='d7-reyes'&&C.rx?.stage==='notebook'&&C.inv.notebook==='have')add('c7-give','Show Officer Reyes the notebook',reyes.person.parts.rhand.getWorldPosition(new THREE.Vector3()),3);}
  if(ph==='e7-lookout'){if(!C.looked.has('curbstones'))add('c7-curbstones','Look at the ground',court.SPOT.curb,3.6,lk(.6,.1));if(!C.looked.has('post'))add('c7-post','Look at the post',{...court.SPOT.post,y:court.SPOT.post.y+1.1},2.6,lk(.2,.14));
   if(!C.looked.has('chalk'))add('c7-chalk','Look at the chalk',LK.chalk,3,lk(.5,.1));}
  if(ph==='e7-court'&&C.lg&&inLange(p)){const X=C.lg,rm=langeRoom(p);
   if(X.stage==='in'||X.stage==='presence'){
    if(rm==='front'){if(!C.looked.has('lg-tv'))add('c7-lg-tv','Look at the television',lgP(LS.tv),3,lk(.45,.12));if(!C.looked.has('lg-courier'))add('c7-lg-courier','Pick up the newspaper',lgP(LS.courier),2.2,lk(.25,.16));}
    if(rm==='kitchen'){if(!C.looked.has('lg-dinner'))add('c7-lg-dinner','Look at the table',lgP(LS.dinner),2.4,lk(.35,.14));if(!C.looked.has('lg-cap'))add('c7-lg-cap','Pick up the cap',lgP(LS.cap),2.0,lk(.15,.18));
     if(!C.looked.has('lg-calendar'))add('c7-lg-calendar','Look at the calendar',lgP(LS.calendar),2.4,lk(.2,.14));if(!X.phoned)add('c7-lg-phone','Use the phone',lgP(LS.phone),2.2,lk(.2,.18));else if(!C.looked.has('lg-board'))add('c7-lg-board','Look at the board',lgP(LS.board),2.2,lk(.25,.16));}
    if(rm==='hall'&&!C.looked.has('lg-parents'))add('c7-lg-parents','Try the door',lgP(LS.parentsDoor),1.8,lk(.4,.16));
    if((rm==='hall'||rm==='boy')&&!C.looked.has('lg-note')&&LS.note)add('c7-lg-note','Read the note',lgP(LS.note),rm==='boy'?2.6:3.8,lk(.24,.12));
    if(X.stage==='presence'&&!X.listened&&!X.shoved&&rm==='hall')add('c7-lg-listen','Listen at the door',lgP(LS.bathDoor),1.9,lk(.5,.16));}
   if(X.stage==='look'&&rm==='boy'&&!X.drew)add('c7-lg-drawings','Look at the drawings',lgP(LS.drawings),2.8,lk(.4,.12));}
  if(/^e7-(court|dining|house)$/.test(ph)&&court.inRegionAt(p.x,p.z)&&!court.inHouseAt(p.x,p.z)&&!inLange(p)){if(!C.looked.has('newspaper'))add('c7-newspaper','Pick up the newspaper',court.SPOT.newspaper,2.2,lk(.3,.14));
   if(!C.looked.has('car'))add('c7-car','Look at the car',{...court.SPOT.fifty9,y:court.G0+1},4,lk(1.2,.08));if(!C.looked.has('sign'))add('c7-sign','Look at the street sign',{...court.SPOT.sign,y:court.G0+2.7},4,lk(.4,.1));
   if(C.flags.windowHit&&!C.looked.has('crack'))add('c7-crack','Look at the window',court.SPOT.diningWindow,4,lk(.6,.1));
   for(const [id,q] of [['mbDining',court.SPOT.mbDining],['mbGreen',court.SPOT.mbGreen]])if(!C.looked.has(id))add('c7-'+id,'Read the mailbox',q,2.0,lk(.3,.16));
   if(ph==='e7-court'&&C.ct?.stage==='lost'&&C.ct.knockAsk&&(C.ct.knocks||0)<2&&!C.ct.knocking)for(const [id,q] of Object.entries(court.SPOT.doors))if(q&&Math.hypot(p.x-q.x,p.z-q.z)<3.2)add('c7-door-'+id,C.ct.knocked?.has?.(id)?'Knock again':'Knock',q,3.2,lk(.6,.14));}
  if(ph==='e7-house'&&C.gh?.stage==='in'&&inGreen()&&(C.lv||'g')==='g'){const q=houseLocal(p.x,p.z);if(!C.flags.star)add('c7-star','Pick up the folded paper',gxW(GX().starAt),2.2,lk(.08,.22));
   if(!C.looked.has('prints')&&q.x>1.2&&q.z>0)add('c7-prints','Look at the floor',{...HW(2.6,2.75),y:court.G0+HH.F},2.8,lk(.5,.14));if(!C.looked.has('radio')&&q.x<-1.2&&q.z>0)add('c7-radio','Turn on the radio',gxW(GX().radioAt),2.0,lk(.15,.18));}
  if(/^e7-(house|reveal)$/.test(ph)&&inGreen()){if(!C.looked.has('testpattern'))add('c7-testpattern','Look at the television',{...HW(-1.75,-.9),y:court.G0+HH.F+.75},2.6,lk(.4,.12));if(!C.looked.has('clock'))add('c7-clock','Look at the clock',{...HW(-2.2,-4.4),y:court.G0+HH.F+1.9},2.6,lk(.3,.12));}
  if(ph==='e7-stalk'||(ph==='e7-reveal'&&C.gh?.hideNow)){if(C.hiding&&!(C.sk?.check&&['hand','open','head'].includes(C.sk.check.phase)))add('c7-unhide','Come out',camera.position.clone().add(new THREE.Vector3(0,-.3,0)),5);
   else for(const [id,h] of Object.entries(HGd.hides)){const w=HW(h.x,h.z),fq=HIDE_FRONT[id],f=fq?HW(fq.x,fq.z):w;if(Math.hypot(p.x-w.x,p.z-w.z)<1.1||Math.hypot(p.x-f.x,p.z-f.z)<1.35)add('c7-hide-'+id,h.label,{...w,y:w.y+1},2.2);}
   if(ph==='e7-stalk'&&!C.hiding&&C.sk&&!C.sk.check){if(!C.sk.timer&&GX().timer.visible)add('c7-timer','Wind the timer',gxW(GX().timerAt),1.9,lk(.1,.22));if(!C.sk.radio&&GX().radio.visible&&C.sk.stage!=='hunt')add('c7-radio','Turn on the radio',gxW(GX().radioAt),1.9,lk(.15,.2));}}
  if(ph==='e7-door'){const q=houseLocal(p.x,p.z);if(!C.dr.shut&&q.x<-HH.UCX&&q.z>0&&C.lv==='u')add('c7-shut','Shut the door',{...HW(-HH.UCX,3.3,'u'),y:court.G0+HH.UP+1.1},2.6);if(C.dr.shut&&!C.dr.pushed){if(C.dr.rug?.stage==='lift')add('c7-rug','Pull the rug',{...HW(-2.75,1.1,'u'),y:court.G0+HH.UP+.05},2.4);else if(!C.dr.rug||C.dr.rug.stage==='out')add('c7-push','Push the dresser against the door',{...HW(-HH.UCX-.55,1.0,'u'),y:court.G0+HH.UP+.6},2.2);}}
  if(/^e7-(upstairs|giant)$/.test(ph)){const q=houseLocal(p.x,p.z);
   if(!C.looked.has('calendar'))add('c7-calendar','Look at the calendar',{...HW(CAL.x,CAL.z,'u'),y:court.G0+CAL.y},2.6,lk(.25,.14));
   if(!C.looked.has('trace'))add('c7-trace','Look at the paper on the desk',{...HW(-4.55,.95,'u'),y:court.G0+HH.UP+.8},2.2,lk(.2,.14));
   if(!C.looked.has('oldbike'))add('c7-oldbike','Look at the old bike',{...HW(-3.6,-2.5,'u'),y:court.G0+HH.UP+.7},2.6,lk(.5,.12));else if(!C.flags.bell)add('c7-bell','Try the bell',{...HW(-3.4,-2.1,'u'),y:court.G0+HH.UP+1.0},2.2,lk(.15,.18));
   if(!C.looked.has('wedding'))add('c7-wedding','Look at the picture',{...HW(4.6,-.6,'u'),y:court.G0+HH.UP+.95},2.4,lk(.2,.14));
   if(C.up?.down&&!C.gt)add('c7-hallwindow','Look out the window',{...HW(0,-4.5,'u'),y:court.G0+HH.UP+1.5},2.6,lk(.6,.12));
   if(C.gt?.lights&&court.ST.portalB&&Math.abs(q.x)<1.3&&q.z<-3)add('c7-climb','Climb out onto the porch roof',{...HW(0,-4.6,'u'),y:court.G0+HH.UP+1.2},2.4);}
  // (in the dark: each is offered when you stand by it, whichever way you are looking)
  if(ph==='n7-after'&&C.af?.stage==='show'&&C.af.go&&!C.af.busyR){const X=C.af,E=X.E;if(!X.shown.bike)add('c7-ev-bike','Show him Jamie’s bike',{x:E.bike.x,y:gy(E.bike.x,E.bike.z)+.4,z:E.bike.z},1.8);
   if(!X.shown.cap)add('c7-ev-cap','Show him the cap',{x:E.cap.x,y:gy(E.cap.x,E.cap.z)+.05,z:E.cap.z},1.5);if(!X.shown.marks)add('c7-ev-marks','Show him the marks in the grass',{x:E.marks.x,y:gy(E.marks.x,E.marks.z),z:E.marks.z},1.7);
   if(!X.shown.gum&&C.inv.gum==='have'&&X.shown.bike&&X.shown.cap&&X.shown.marks)out.push({id:'c7-ev-gum',label:'Show him the gum',at:camera.position.clone().add(new THREE.Vector3(0,-.4,0)),face:camera.position.clone(),r:9,wide:true});}
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
  else if(id==='c7-tube')takeTube();else if(id==='c7-drawer')openDrawer();else if(id==='c7-shoebox')lookShoes();else if(id==='c7-watch')lookWatch();else if(id==='c7-machine')playMessage();else if(id==='c7-cord')lookCord();
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
  else if(id==='c7-star')pickStar();else if(id==='c7-prints')lookPrints();else if(id==='c7-radio')radioOn();else if(id==='c7-timer')windTimer();else if(id==='c7-rug')pullRug('you');
  else if(id==='c7-shut')shutDoor();else if(id==='c7-push')pushDresser('you');
  else if(id.startsWith('c7-door-'))knockCourt(id.slice(8));
  else if(id.startsWith('c7-lg-'))langeAct(id.slice(6));
  else if(id==='c7-mbDining'||id==='c7-mbGreen'){const k2=id.slice(3),q=court.SPOT[k2],jn=near({x:jamie.px,z:jamie.pz},5);C.looked.add(k2);closeLook(q,{back:.75,eye:1.42,kind:'mailbox'});C.lookDur=6.5;mark('the mailbox: '+k2);
   say(k2==='mbDining'?[N('CARVER, in white letters on the side of the mailbox.',{time:3}),...(jn?[J('Carver.',{time:1.2}),J('Like the girl. Ruth Ann Carver. Nineteen sixty-six.',{time:2.8,face:'afraid'})]:[])]
    :[N('WHITCOMB.',{time:2}),...(jn?[J('…Danny Whitcomb.',{time:1.8,face:'afraid'}),J('The green bike.',{time:1.6})]:[])]);}
  else if(id==='c7-calendar')lookCalendar();else if(id==='c7-trace')lookTrace();else if(id==='c7-oldbike')lookOldBike();else if(id==='c7-bell')ringOldBell();else if(id==='c7-wedding')lookWedding();
  else if(id==='c7-hallwindow')giantStart();else if(id==='c7-climb')climbOut();else if(id==='c7-drop'){C.flags.dropped=true;dropDown();go('e7-out');}
  else if(id.startsWith('c7-ev-'))showEvidence(id.slice(6));
  else if(id==='c7-grab')grabHand();else if(id==='c7-gum')pickGum();else if(id==='c7-call')callName();
  else if(id==='c7-write')writeStart();else if(id==='c7-window')lookOutside();}
 // ---- keys, the mouse, the hint row --------------------------------------------------------------------------------------------------
 function key(code,repeat){if(!mine(S.phase))return false;
  if(C.capturedT!=null&&C.fadeIn<0&&S.phase!=='c7-black'&&C.sk?.caught)return true;
  if((code==='KeyI'||code==='Tab')&&!inv.isOpen&&(C.view||C.fadeOut>=0||C.endT>=0||S.phase==='c7-black'||C.choice))return true;if(inv.key(code,repeat))return true;
  if(C.choice){const m=/^(Digit|Numpad)([1-3])$/.exec(code);if(m){if(!repeat)pick(+m[2]-1);return true;}return ['KeyF','KeyW','KeyA','KeyS','KeyD','Space'].includes(code);}
  if(C.view==='inspect'){if((code==='KeyS'||code==='ArrowDown'||code==='KeyF')&&!repeat&&C.inspect?.t>.35&&(C.inspect.kind!=='reyes-page-now'||C.flags.indentSeen||C.inspect.t>30)&&!(['reyes-page','mom-phone'].includes(C.inspect.kind)&&busy())){endInspect();return true;}if(code==='KeyA'){C.inspect.yaw-=.25;return true;}if(code==='KeyD'){C.inspect.yaw+=.25;return true;}return ['KeyW','Space','KeyC','KeyS'].includes(code);}
  if(C.view==='look'&&C.lookKind==='map'){if(mapKey(code))return true;return ['KeyW','KeyS','Space','KeyC'].includes(code);}
  if(C.view==='look'){const locked=['names','window'].includes(C.lookKind);if((code==='KeyS'||code==='ArrowDown')&&!busy()&&!locked){if(!repeat)endLook();return true;}return ['KeyW','KeyA','KeyD','Space','KeyC','KeyS'].includes(code)||(locked&&code==='KeyF');}
  if(S.phase==='n7-grab'&&C.gb?.stage==='struggle')return ['KeyF','KeyS','KeyW','KeyA','KeyD','Space'].includes(code);
  if(S.phase==='n7-names'&&!C.flags.names)return code==='KeyF';// (F writes, while there is writing to do; then it is yours again)
  if(C.hiding&&['KeyW','KeyA','KeyS','KeyD','Space'].includes(code))return true;
  return false;}
 function pan(dx,dy){if(!mine(S.phase))return false;if(C.view==='inspect'){C.inspect.yaw+=dx*.006;C.inspect.pitch=clamp(C.inspect.pitch+dy*.006,-1.2,1.2);return true;}
  if(C.view==='look'&&C.lookKind==='map'&&['look','mh','sched'].includes(C.mp?.stage)){MAPV.cursor.x=clamp(MAPV.cursor.x+dx*.0011,.02,.98);MAPV.cursor.y=clamp(MAPV.cursor.y+dy*.0011,.02,.98);drawMap();return true;}return false;}
 function wheel(dy){if(!mine(S.phase))return false;if(C.view==='look'&&C.lookKind==='map'){MAPV.overlay=clamp(MAPV.overlay+(dy<0?.25:-.25),0,1);drawMap();return true;}return false;}
 function hint(){const ph=S.phase;
  if(C.choice)return C.choice.options.map((op,i)=>[String(i+1),op.label]);
  if(C.view==='inspect'&&C.inspect?.kind==='reyes-page-now'&&!C.flags.indentSeen)return [['A / D','Turn it to the light']];
  if(C.view==='inspect')return [['Mouse / A D','Turn it'],['S','Put it down']];
  if(C.view==='look'&&C.lookKind==='map')return C.mp?.stage==='look'?[['Mouse','The pencil'],['A / D','The 1958 plan'],['F','Mark it']]:null;
  if(C.view==='look'&&C.lookKind==='names')return C.flags.names?null:[['Hold F','Write']];
  if(C.view==='look')return ['window'].includes(C.lookKind)?null:[['S','Step back']];
  if(ph==='n7-grab'&&C.gb?.stage==='struggle')return [['Hold F',`Hold on · ${Math.round(C.gb.grip*100)}%`],['S','Pull']];
  if(C.hiding&&C.sk?.check&&['hand','open','head'].includes(C.sk.check.phase))return [['Hold Space','Hold your breath']];
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
   _q2.setFromEuler(new THREE.Euler(0,-headingTo(f.x,f.z,JL.x,JL.z),0));g.quaternion.copy(_q2).slerp(_q1,smooth(u));if(u>=1){JL.phase='down';JL.q=g.quaternion.clone();sound('c7Fall',g.position,{gain:1});}}
  // (his lying orientation is kept here: the friends' riding update, which still thinks of him as on his bike, stands his body
  //  upright again every frame before this, and a turn eased from there each frame left him half sat up, his head a metre up)
  else{g.position.set(JL.x,JL.y+.12,JL.z);if(!JL.q)JL.q=_q1.clone();JL.q.slerp(_q1,1-Math.exp(-14*dt));g.quaternion.copy(JL.q);}
  // his body: arms up over his head (toward you), clawing; one knee up; his head lifted to look at you
  const P2=JL.pose,t=JL.t;standPose(P2,t,{});const claw=Math.sin(t*7.1),claw2=Math.sin(t*6.3+1.3);
  P2[PI.lh]=-.22;P2[PI.lh+1]=1.72+.12*claw;P2[PI.lh+2]=-.1+.08*claw2;P2[PI.rh]=.22;P2[PI.rh+1]=1.72+.12*claw2;P2[PI.rh+2]=-.1+.08*claw;
  P2[PI.le]=-.8;P2[PI.le+1]=.1;P2[PI.le+2]=.3;P2[PI.re]=.8;P2[PI.re+1]=.1;P2[PI.re+2]=.3;
  P2[PI.lf]=-.14;P2[PI.lf+1]=.28+.1*Math.max(0,claw);P2[PI.lf+2]=-.32;P2[PI.rf]=.1;P2[PI.rf+1]=.05;P2[PI.rf+2]=0;P2[PI.hp]=.55;P2[PI.hy]=.15*Math.sin(t*2.1);
  // (the hand you hold reaches from his shoulder toward you, an arm's length at most: solved from his feet it stopped at his waist)
  if(JL.grip){g.updateMatrixWorld(true);const ch=camera.position.clone().add(new THREE.Vector3(0,-.3,0)),L=g.worldToLocal(ch),S={x:.19,y:1.22,z:0},dx=L.x-S.x,dy=L.y-S.y,dz=L.z-S.z,l=Math.hypot(dx,dy,dz)||1,k2=Math.min(1,.6/l);
   P2[PI.rh]=S.x+dx*k2;P2[PI.rh+1]=S.y+dy*k2;P2[PI.rh+2]=S.z+dz*k2;}
  applyPose(jamie.person,P2);jamie.person.face?.set?.('terrified',{hold:2});g.updateMatrixWorld(true);JL.hand=jamie.person.parts.rhand.getWorldPosition(JL.hand||new THREE.Vector3());}
 // ---- minds: Jamie's mood by where the chapter is ------------------------------------------------------------------------------------------
 function mind(){const ph=S.phase,key=ph+(C.flags.hurry?'!':'');if(C.mindKey===key)return;C.mindKey=key;let mood='relaxed';
  if(/^d7-(house|reyes|map)$/.test(ph))mood='relaxed';else if(/^d7-(garage)$/.test(ph))mood='tense';else if(/^e7-(court)$/.test(ph))mood='tense';else if(/^e7-(dining|house|reveal|stalk|door)$/.test(ph))mood='danger';
  else if(/^e7-(upstairs|giant|out)$/.test(ph))mood='tense';else if(/^n7-/.test(ph))mood='escape';
  brain.setScene({mood,pois:[],goal:null});}
 // ---- every frame -----------------------------------------------------------------------------------------------------------------------------
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase;mind();court.ST.level=C.lv||'g';
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  // (Sam's window by day: the street across from it, rendered once the morning is set and you are in his house)
  if(/^d7-/.test(ph)&&!C.dayView&&inSams()&&C.t>.3)C.dayView=house.renderView('day')?'day':'none';
  // Light from the road and the search party falls sideways across the field.
  // Slots 0 and 1 leave the dedicated camera flash and Reyes's torch available.
  if(['n7-grab','n7-taken','n7-gone','n7-after'].includes(ph)){
   const field=court.R3(3,-6),lane=court.SPOT.mouth;
   light(0,{x:field.x+1.8,y:field.y+3.4,z:field.z-.6},{intensity:ph==='n7-after'?15:21,dist:18,color:ph==='n7-after'?0xc2d5d1:0xe9c498,visualOnly:true});
   light(1,{x:lane.x-1.8,y:lane.y+2.1,z:lane.z+.5},{intensity:8.5,dist:13,color:0x9ab8c2,visualOnly:true});
  }
  clock(dt);updatePose(dt);match(dt);guard(dt);standAll();inv.update();if(inv.isOpen&&(C.view||posed()||C.fadeOut>=0||C.endT>=0))inv.close();
  // the lane's crossing (your last position to this one)
  const p=me();if(C.prevP&&Math.hypot(p.x-C.prevP.x,p.z-C.prevP.z)<3)crossing(C.prevP,p);C.prevP={x:p.x,z:p.z};
  // which floor you are on in the green-door house (and Jamie): the stair hands you up or down as you leave it
  if(court.ST.active){const q=houseLocal(p.x,p.z);if(court.inHouseAt(p.x,p.z)&&HGd.inStair(q.x,q.z))C.lv=(q.z-STAIR.z0)/(STAIR.z1-STAIR.z0)>.5?'u':'g';else if(!court.inHouseAt(p.x,p.z))C.lv='g';
   const jq=houseLocal(jamie.px,jamie.pz);if(jamie.mode==='foot'&&court.inHouseAt(jamie.px,jamie.pz)&&HGd.inStair(jq.x,jq.z))C.jlv=(jq.z-STAIR.z0)/(STAIR.z1-STAIR.z0)>.5?'u':'g';else if(!court.inHouseAt(jamie.px,jamie.pz))C.jlv='g';}
  court.ST.level=C.lv||'g';
  if(house.root.parent)house.update(dt);if(court.ST.active)court.update(dt,{camera,dusk:sky().p});wallCal.visible=!!court.ST.active;oldBike.visible=!!court.ST.active;
  cast.update(dt,{eye:camera.position});LF.update(dt,{clock:C.t});H.update(dt);updateGum(dt);updateInspect(dt);
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
  else if(ph==='n7-after')updateAfter(dt);
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
  // (Jamie in the grass: posed here, after the friends' own update, so nothing stands him back up; his clothes follow)
  poseJamieDown(dt);
  // The on-foot pass precedes the companion pass. Resolve once more against
  // his current wrist after the yank, rather than the previous frame's wrist.
  if(JL.grip&&C.gb?.stage==='struggle'){
   o.self.group.updateMatrixWorld(true);gripArms(o.foot.pose,{toLocal:v=>o.self.group.worldToLocal(v)});applyPose(o.self,o.foot.pose);
  }
  for(const art of ch6.appearances6.values())art.update(dt,{clock:C.t,eye:camera.position,phase:S.phase});for(const [person,art] of extraArt)if(person.group.visible)art.update(dt,{clock:C.t,eye:camera.position,phase:S.phase});
  for(const detail of portraits)detail.update(dt,{clock:C.t});
 }
 {const prev=A.afterActors6;A.afterActors6=(dt,o2)=>{prev?.(dt,o2);afterActors7(dt,o2);};}
 // ---- lifecycle ---------------------------------------------------------------------------------------------------------------------------------
 const GUM0=(()=>{const g=house.items.gum;return {parent:g.parent,pos:g.position.clone(),rot:g.rotation.clone()};})();
 function reset(){const hadPose=C.pose,hadView=!!C.view;card(false);if(C.view==='inspect')endInspect();if(C.view==='look')C.view=null;inv.reset();C.choice=null;
  if(nav.room===house.nav||nav.room===court.nav)nav.setRoom(null);house.reset();court.reset();cast.reset();LF.reset();H.reset();HM.show(false);HL.level='g';lightsOn(false);
  for(const a of [samDad,samMom,cast.jamieMom]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  mapMesh.visible=false;mapMesh.removeFromParent();capMesh.visible=false;marksG.visible=false;if(C.wr?.page)C.wr.page.removeFromParent();C.pencil?.removeFromParent();holder.removeFromParent();
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
   jq=jq||(()=>{const g=house.toL(HS.gum.x,HS.gum.z);return house.toW(g.x-1.1,g.z-.3);})();// (in the room, by the nightstand: the offset in the room's own frame, not the world's, which put him through the wall)
   comp.putFoot(jamie,jq.x,jq.z,headingTo(jq.x,jq.z,l.x,l.z),{bike:null});follow(true);jamie.follow='walk';};
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
   // (the expanded morning: the tube, his dad's list, the machine)
   if(section==='c7-memory'){quiet();memoryAsk();return;}
   C.mem={t:60,back:true};ff('tube','memory');house.items.tube.visible=false;
   if(section==='c7-search'){quiet();dadList();return;}
   C.dl={t:60,found:new Set(['pictures','shoes','watch']),stage:'done'};house.items.shoebox.visible=false;house.items.watch.visible=false;
   if(section==='c7-machine'){quiet();const k2=HS.machineStand;o.placePlayer({x:k2.x,z:k2.z,a:headingTo(k2.x,k2.z,HS.machine.x,HS.machine.z),mode:'walk',bike:yourBike()});
    const jq=house.toW(-1.2,-2.9);comp.putFoot(jamie,jq.x,jq.z,headingTo(jq.x,jq.z,HS.machine.x,HS.machine.z),{bike:null});follow(true);jamie.follow='walk';
    samDad.show(true);samDad.place(HS.dadKitchen.x,HS.dadKitchen.z,headingTo(HS.dadKitchen.x,HS.dadKitchen.z,HS.machine.x,HS.machine.z));samDad.gest('fold');machineStage();return;}
   ff('machineDone');C.mc={t:30,stage:'done',doneAt:-99};
   quiet();garageNoise();return;}
  ff('jamieUp','mayRoom','inRoom','notebook','photoSeen','gum','fanOff','noise');C.inv.notebook='have';C.inv.gum='jamie';house.items.notebook.visible=false;house.items.gum.visible=false;
  // ---- Act II ----
  if(ix<=SECTIONS7.indexOf('c7-records')){hh(HOUR.reyes);C.gr={t:30,stage:'after',done:true,dad:true};tableStage();C.fadeIn=-1;o.fade(0);
   if(section==='c7-reyes')return;quiet();C.rx.stage='reading';mapStage();if(section==='c7-map')return;
   // (the second look: the court found; Reyes's photograph)
   quiet();C.mp.stage='solved';MAPV.mark={...MAP.target};MAPV.overlay=1;ff('marked');C.flags.markedBy='you';drawMap();mapSecond();return;}
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
  // the Langes' (after Reyes sees you by a fence; before the Carvers' lights): at its open door, inside it, in the boy's room
  if(/^c7-lange/.test(section)){C.ct={t:120,stage:'lost',lostAt:0,fence:true,dark:true,seenYou:true,seenAt:0,knockAsk:true,knocks:2,knockedAt:0,lange:true};C.bikesAt={x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z,a:court.SPOT.bikeA};ff('bikesLeft');
   hh(HOUR.court+1.3);go('e7-court');lightsOn(true);langeLights(true);LGH.doors.front.set(1);
   const putL=(lx,lz,look,jx,jz)=>{const w=LG3(lx,lz),l=LG3(look[0],look[1]),j=LG3(jx,jz),b=C.bikesAt;o.placePlayer({x:w.x,z:w.z,a:headingTo(w.x,w.z,l.x,l.z),mode:'walk',bike:{x:b.x,z:b.z,a:b.a}});
    const jb=court.SPOT.bikes[1];comp.putFoot(jamie,j.x,j.z,headingTo(j.x,j.z,w.x,w.z),{bike:{x:jb.x,z:jb.z,a:court.SPOT.bikeA,kick:1}});follow(true);};
   if(section==='c7-lange'){putL(LGH.doorX,-LGH.hd-4.4,[LGH.doorX,0],LGH.doorX+1.2,-LGH.hd-5.0);checkpoint('c7-court');C.lg={t:30,stage:'door',opening:1,doorAt:0};objective('The open door.','The blue house. A phone. Stay together.');return;}
   checkpoint('c7-lange');
   if(section==='c7-lange-in'){putL(-.9,-1.9,[3.2,-2.3],-1.7,-2.6);C.lg={t:30,stage:'in',opening:1,inAt:0,atDoor:true,inside:true};objective('Find the phone.','Quietly.');return;}
   // (the bathroom door has been shoved from inside, the picture is down; you said you would look)
   putL(-4.4,2.75,[-4.85,4.1],-3.6,2.3);LGH.pictureFalls();LGH.ST.picT=1;LGH.feetAt(false);for(const id of ['lg-tv','lg-courier','lg-dinner','lg-cap','lg-calendar'])C.looked.add(id);
   C.lg={t:60,stage:'look',opening:1,inAt:0,atDoor:true,inside:true,phoned:true,presAt:20,hallAt:25,listened:true,shoved:true,shoveAt:30,choice:'look',lookAt:58,inBoy:58};
   stand(jamie,()=>besideMe(.95),{look:()=>lgP({...LS.boyDoor,y:LGH.F+1.3}),keep:true,max:2.6});objective('The boy’s room.','Fast.');return;}
  C.ct={t:120,stage:'lost',lostAt:0,fence:true,dark:true,seenYou:true,lights:true,knockAsk:true,knocks:2,knockedAt:0};C.bikesAt={x:court.SPOT.bikes[0].x,z:court.SPOT.bikes[0].z,a:court.SPOT.bikeA};ff('bikesLeft');
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
  if(section==='c7-green-star'){inHouse(0,-3.7,'g',[0,-1.2],.8,-4.1);go('e7-house');checkpoint('c7-house');C.gh={t:10,stage:'in',inside:true,shut:true,inAt:0,stopped:true};lightsGreen();quiet();creatureUpstairs();H.script([{wait:999,state:'idle',look:()=>camera.position}]);objective('Upstairs.','Sam said upstairs.');return;}
  if(section==='c7-reveal'){ff('star');GX().star.visible=false;inHouse(0,-2.9,'g',[0,2.6],.8,-3.6);go('e7-house');checkpoint('c7-house');C.gh={t:10,stage:'in',inside:true,shut:true,inAt:0,stopped:true};lightsGreen();quiet();creatureUpstairs();reveal();return;}
  ff('revealed');
  // (the stealth's checkpoint: you and Jamie in the pantry, the door nearly shut; it is at the foot of the stairs)
  if(section==='c7-stalk'){inHouse(3.2,2.6,'g',[1.6,3.7],JPANTRY.x,JPANTRY.z);lightsGreen();C.jHide='pantry';stand(jamie,HW(JPANTRY.x,JPANTRY.z),{look:()=>camera.position,keep:true,max:.3});jamie.crouch=.3;
   const sf=HW(0,-2.0);HL.level='g';H.place(sf.x,sf.z,0);HM.show(true);stalkStart();hide('pantry');return;}
  // (it has looked in the pantry and gone to wait at the foot of the stairs: you are still in there)
  if(section==='c7-stairs'){inHouse(3.2,2.6,'g',[1.6,3.7],JPANTRY.x,JPANTRY.z);lightsGreen();C.jHide='pantry';stand(jamie,HW(JPANTRY.x,JPANTRY.z),{look:()=>camera.position,keep:true,max:.3});jamie.crouch=.3;
   const sw=HW(.45,-2.75);HL.level='g';H.place(sw.x,sw.z,0);HM.show(true);stalkStart();hide('pantry');C.sk.checked=true;watchStairs();quiet();return;}
  ff('stalked');lightsGreen();HGd.doors.boy.set(.85);HGd.doors.store.set(.8);HGd.doors.parents.set(.75);
  {const sf=HW(0,-2.0);HL.level='g';H.place(sf.x,sf.z,0);}// (it is downstairs: it comes up when the door shuts)
  if(section==='c7-door'){inHouse(0,3.3,'u',[-2,3.3],-.6,3.9,'u');doorStart();comp.release(jamie);comp.putFoot(jamie,HW(-.6,3.9,'u').x,HW(-.6,3.9,'u').z,0,{bike:jamieBikeState()});C.jlv='u';follow(true);jamie.follow='walk';C.jStair=false;return;}
  if(section==='c7-rug'){inHouse(-2.7,1.9,'u',[-2.2,1.0],-2.2,.35,'u');doorStart();comp.release(jamie);comp.putFoot(jamie,HW(-2.2,.35,'u').x,HW(-2.2,.35,'u').z,0,{bike:jamieBikeState()});C.jlv='u';C.jStair=false;
   HGd.doors.boy.set(0);shutDoor();C.dr.closing=0;quiet();rugStuck();return;}
  ff('doorShut');HGd.doors.boy.set(.85);
  if(ix<=SECTIONS7.indexOf('c7-giant')){const at={'c7-clues':[-3,1.9,[-3.3,.085]],'c7-trace':[-3.9,1.4,[-4.6,.95]],'c7-old-bike':[-2.4,-2.2,[-3.6,-2.5]],'c7-giant':[0,-3.4,[0,-4.5]]}[section]||[-3,2.2,[-5,2]];
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
   Object.assign(JL,{on:true,x:land.x,z:land.z,y:gy(land.x,land.z),t:1,phase:'down',from:{x:land.x,z:land.z,y:land.y},grip:false,held:false,hand:null,q:null});HM.show(true);const hp=court.R3(7.6,-7.4);H.place(hp.x,hp.z,headingTo(hp.x,hp.z,land.x,land.z));
   reyes.show(true);const rf=court.SPOT.fieldFar;reyes.place(rf.x,rf.z,0);reyes.gest('flashlight');go('n7-lookout');C.lo={t:5,stage:'leap'};};
  if(section==='c7-grab'){downScene();quiet();grabStart();return;}
  if(section==='c7-struggle'){downScene();grabStart();quiet();JL.held=true;
   // (it already has his ankle: put it there, or the view you hold on in looks back up the street to where it started)
   {const f=jamieAnkle(),hx=f.x-JL.dir.x*.6,hz=f.z-JL.dir.z*.6;H.place(hx,hz,headingTo(hx,hz,f.x,f.z));}JL.hand=null;const h=jamieHand(),me1={x:h.x+JL.dir.x*.7,z:h.z+JL.dir.z*.7};o.placePlayer({x:me1.x,z:me1.z,a:headingTo(me1.x,me1.z,h.x,h.z),mode:'walk',bike:{x:me1.x+1,z:me1.z,a:0}});grabHand();return;}
  if(section==='c7-taken'){downScene();grabStart();quiet();JL.held=true;C.gb.stage='lost';C.gb.never=true;takenStart();return;}
  ff('jamieTaken');jamie.gone=true;jamie.person.group.visible=false;
  if(section==='c7-gum-pickup'){nav.setRoom(court.nav);police.attach?.(true);const car=k.carA;car.show(true);car.park(LK.car.x,LK.car.z,headingTo(LK.car.x,LK.car.z,LK.car2.x,LK.car2.z));car.lights=true;
   const gp=court.R3(3.6,-3.2),me2=court.R3(4.6,-5);o.placePlayer({x:me2.x,z:me2.z,a:headingTo(me2.x,me2.z,gp.x,gp.z),mode:'walk',bike:{x:me2.x+3,z:me2.z-2,a:0}});
   const g=house.items.gum;scene.attach(g);g.visible=true;g.position.set(gp.x,gp.y+.012,gp.z);g.rotation.set(0,.6,0);C.inv.gum='grass';C.gumAt={x:gp.x,y:gp.y+.012,z:gp.z};C.flags.gumDropped=true;
   const jb=court.R3(10,-10);jamie.bike.group.visible=true;jamie.bike.group.position.set(jb.x,gy(jb.x,jb.z)+.05,jb.z);jamie.bike.group.rotation.z=1.35;C.jBikeDown={x:jb.x,z:jb.z};goneStart();return;}
  ff('gumPicked');C.inv.gum='have';house.items.gum.visible=false;
  if(section==='c7-after'){afterStart();C.fadeIn=-1;o.fade(0);return;}
  if(section==='c7-forgetting'){afterStart();C.fadeIn=-1;o.fade(0);quiet();afterB();return;}
  if(section==='c7-evidence'){afterStart();C.fadeIn=-1;o.fade(0);quiet();cast.jamieMom.place(main(1119,1.4).x,main(1119,1.4).z,0);afterEvidence();return;}
  if(section==='c7-mom'||section==='c7-record'){afterStart();C.fadeIn=-1;o.fade(0);quiet();const E=evidencePlaces();Object.assign(C.af,{E,shown:{bike:true,cap:true,marks:true,gum:true},go:true,notes:true,capReyes:true});evidenceProps(true,E);capMesh.visible=false;unpose();
   const b=LK.bench,s0=main(LOOKOUT.bench.d+1.6,LOOKOUT.bench.lat-1.2);o.placePlayer({x:s0.x,z:s0.z,a:headingTo(s0.x,s0.z,LK.car.x,LK.car.z),mode:'walk',bike:null});void b;
   if(section==='c7-mom'){cast.jamieMom.place(main(1119,1.4).x,main(1119,1.4).z,0);afterMom();return;}
   Object.assign(C.af,{q1:'cap',q2:'together',capWithMom:true,capDown:true});capOnHood();const p0=me(),rq=main(LOOKOUT.bench.d+.4,LOOKOUT.bench.lat-1.4);reyes.place(rq.x,rq.z,headingTo(rq.x,rq.z,p0.x,p0.z));afterRecord();return;}
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
  canRemount:()=>!C.view&&!posed()&&!inSams()&&!inGreen()&&!inLange()&&!/^(d7-(house|reyes|map)|n7-(grab|taken|gone|after|sams|names|window))$/.test(S.phase),
  closeBag:()=>{if(inv.isOpen){inv.close();return true;}return false;},inventoryReady:()=>owns(S.phase)&&S.phase!=='c7-black',
  C,house,court,cast,yards,HM,H,HL,JL,LIGHTS,PH,MAPV,photoRender,photoState,inv,sky,brain,HUNTER_ID,STEP,CURB,sideDoorAt,LK,LF,LGH,lgP,inLange,langeRoom,
  get started(){return A7._started;},set started(v){A7._started=v;}});
 Object.defineProperties(A7,{amb:{get:()=>A7.next?.owns(S.phase)?A7.next.amb:C.amb},viewing:{get:()=>A7.next?.owns(S.phase)?A7.next.viewing:C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,lookKind:C.lookKind,inv:{...C.inv},looked:[...C.looked].sort(),
   level:C.lv||'g',jlevel:C.jlv||'g',hiding:C.hiding||null,fails:{...C.fails},photo:PH.state,photoRendered:{four:!!PH.four?.rendered,one:!!PH.one?.rendered},
   hunter:{mode:H.mode,state:HM.state,visible:HM.visible,x:+HM.x.toFixed(2),z:+HM.z.toFixed(2),level:HL.level,log:{...H.log},meter:Object.fromEntries(H.meter),source:HM.source,trace:H.trace.slice(-12)},
   jamie:{gone:!!jamie.gone,visible:jamie.person.group.visible,mode:jamie.mode,held:JL.held,down:JL.on,grip:JL.grip},
   court:{active:!!court.ST.active,portalA:court.ST.portalA,portalB:court.ST.portalB,inRegion:court.ST.active?court.inRegionAt(p.x,p.z):false,giant:court.GI.stage},
   lange:C.lg?{stage:C.lg.stage,choice:C.lg.choice||null,burst:C.lg.burst||null,answer:C.lg.answer||null,room:langeRoom(p),figure:{visible:LF.person.group.visible,state:LF.F.state}}:null,
   cross:C.lastCross||null,sounds:{...C.sounds},guard:C.guardLog?{...C.guardLog}:null,marks:(C.marks||[]).slice(-30),endT:+C.endT.toFixed(2)};}}});
 // (Chapter Eight picks up that night: chapter8.js has its phases and sections; while one of them is current, everything
 // here hands over to it, the way Chapter Six hands over to this chapter)
 {const nextOwns=()=>!!A7.next?.owns(S.phase),own=A7.owns,hnd=A7.handles;
  A7.owns=ph=>own(ph)||!!A7.next?.owns(ph);A7.handles=sec=>hnd(sec)||!!A7.next?.handles?.(sec);
  for(const m of ['update','spots','act','sources','blockers','hint','key','pan','wheel','jamieSweep','officerAim','light','longThrow','canDismount','canRemount','inventoryReady']){const f=A7[m];
   A7[m]=(...a)=>nextOwns()?(A7.next[m]?A7.next[m](...a):(m==='spots'||m==='blockers'?[]:m==='sources'?undefined:null)):f(...a);}
  const bag=A7.closeBag;A7.closeBag=()=>bag()||!!A7.next?.closeBag?.();
  const rs=A7.reset;A7.reset=()=>{A7.next?.reset();rs();};
  const jp=A7.jump;A7.jump=section=>{if(A7.next?.handles?.(section)&&!SECTIONS7.includes(section)&&!ALIAS7[section]){rs();A7.next.jump(section);return;}jp(section);};
  /* (amb and viewing ask the next chapter in their own getters, above) */}
 return A7;
}
