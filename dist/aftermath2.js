// Aftermath II: Ten Years Later. Friday, August 27, 2021, from the late afternoon into the evening; then the 2026 coda and the
// credits (coda2026.js, final-credits.js, started from here so that Continue and the DEV panel reach them the same way).
//
//  1-2.  The drive in, up Oak Hollow Drive in your own car, and the last of the street on foot.
//  3.    Sam, at the curb where you said goodbye in October 2011.
//  4.    The long way: up the hill you both used to ride.
//  5-7.  The places the four of you went home to, in the order you left each other that Sunday: Briarwood (Alex), Jamie's,
//        Summerfield, the streetlight across from Sam's; the newer houses where the street went into the ground.
//  8-11. Summerfield; the streetlight; Sam's memory; the notebook.
//  12-16.The old oak. Two kids on bikes. When the streetlights come on.
//
// aftermath1.js hands this file every phase that starts a2-. The street is the world's own Oak Hollow Drive, ten years on
// (aftermath2-town.js): nothing of Chapter Eight's ruin, the lots that were lost rebuilt from new plans. The people are new or
// older (aftermath2-actors.js). No creature, no chase, no failure state, nothing under the ground. Jamie and Alex are dead.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {createInventory} from './inventory.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// QA jumps, DEV scenes and Continue checkpoints, in story order (each starts a little before its moment)
export const SECTIONS10=['aftermath2-start','a2-drive','a2-street','a2-sam','a2-walk','a2-alex','a2-jamie','a2-summerfield','a2-streetlight','a2-trench','a2-oak','a2-children','a2-leave','aftermath2-end',
 'coda-start','coda-pullback','coda-room','coda-line','coda-title','coda-credits'];
export const ALIAS10={'a2-start':'aftermath2-start','a2-arrive':'a2-drive','a2-car':'a2-drive','a2-return':'a2-drive','a2-rebuilt':'a2-street','a2-reunion':'a2-sam','a2-sam-reunion':'a2-sam','a2-neighborhood':'a2-walk',
 'a2-hill':'a2-walk','a2-briarwood':'a2-alex','a2-alexs-house':'a2-alex','a2-jamies-house':'a2-jamie','a2-catastrophe':'a2-summerfield','a2-talk':'a2-streetlight','a2-notebook':'a2-streetlight','a2-sams-memory':'a2-streetlight',
 'a2-new-houses':'a2-trench','a2-the-oak':'a2-oak','a2-kids':'a2-children','a2-bikes':'a2-children','a2-leaving':'a2-leave','a2-end':'aftermath2-end','coda':'coda-start','coda-monitor':'coda-pullback','coda-desk':'coda-room',
 'coda-remember':'coda-line','coda-last-light':'coda-title','credits':'coda-credits','final-credits':'coda-credits'};
export const LABEL10={'aftermath2-start':'Ten years later','a2-drive':'The drive in','a2-street':'Oak Hollow Drive','a2-sam':'Sam','a2-walk':'The hill','a2-alex':'Briarwood','a2-jamie':'Jamie’s house',
 'a2-summerfield':'Summerfield','a2-streetlight':'The streetlight','a2-trench':'The new houses','a2-oak':'The old oak','a2-children':'See you tomorrow','a2-leave':'When the streetlights come on','aftermath2-end':'Ten years later',
 'coda-start':'One more lap','coda-pullback':'One more lap','coda-room':'One more lap','coda-line':'One more lap','coda-title':'One more lap','coda-credits':'The credits'};
const PHASES=['a2-black','a2-drive','a2-street','a2-sam','a2-walk','a2-alex','a2-jamie','a2-summer','a2-light','a2-trench','a2-oak','a2-kids','a2-leave','a2-end','a2-coda'];
export const SAVE10='lastlight.aftermath2';// what this chapter kept, and how far the story has gone (the coda and the credits included)
export const SAVE9='lastlight.aftermath1',SAVE_DONE='lastlight.complete';
const CODA=new Set(['coda-start','coda-pullback','coda-room','coda-line','coda-title','coda-credits']);
const fmt=h=>{const hh=((h%24)+24)%24,H=Math.floor(hh),M=Math.floor((hh-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};

// The light of the evening, by the hour (game.js reads day, p (the evening's warmth), night, deep, storm). The drive in is a late
// afternoon; the oak is the golden hour, the way the Prologue's street was; the streetlights come on at the very end.
const SKY10=[
 [17.5,{day:.66,p:.16,night:0}],[18.2,{day:.48,p:.26,night:0}],[18.75,{day:.3,p:.42,night:0}],[19.1,{day:.17,p:.58,night:.02}],[19.45,{day:.08,p:.76,night:.1}],[19.8,{day:.02,p:.9,night:.3}]];
function skyAt(h){if(h<=SKY10[0][0])return SKY10[0][1];for(let i=1;i<SKY10.length;i++)if(h<SKY10[i][0]){const [a,A]=SKY10[i-1],[b,B]=SKY10[i],t=smooth((h-a)/(b-a));return {day:lerp(A.day,B.day,t),p:lerp(A.p,B.p,t),night:lerp(A.night,B.night,t)};}return SKY10[SKY10.length-1][1];}

export function createAftermath2(o,k,{chapter2:ch2,chapter5:ch5,chapter6:ch6,chapter8:ch8,aftermath1:a1}){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam:kidSam}=k,A=k.api,police=k.police;
 const me=k.me,talk=k.talk,busy=k.busy,objective=k.objective;
 const go=ph=>{k.go(ph);C.pt=0;};
 const phys=ch5.phys;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL10);
 const A10={},C={};
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos||camera.position,opts);}
 const gy=(x,z)=>nav.groundY(x,z);
 // ---- lights the chapter brings (the car's dome light, a porch, the oak's evening): the same four, moved -------------------------
 const LIGHTS=[0,1,2,3].map(i=>{const l=new THREE.PointLight(0xfff0d8,0,12,1.6);l.name='a2-light-'+i;return l;});
 function lightsOn(on){for(const l of LIGHTS){if(on&&!l.parent)scene.add(l);else if(!on&&l.parent)l.removeFromParent();if(!on){l.intensity=0;l.userData.base=0;}}}
 function light(i,q,{intensity=3,dist=12,color=0xfff0d8}={}){const l=LIGHTS[i];if(!q){l.intensity=0;l.userData.base=0;return;}l.position.set(q.x,q.y,q.z);l.intensity=intensity;l.distance=dist;l.color.setHex(color);l.userData.base=intensity;}
 // ---- what came down from Aftermath I (lastlight.aftermath1), and what this chapter keeps -------------------------------------------
 // cap: 'you' (you kept Jamie's cap) | 'mom' (his mother has it: capWhen 'shelter' | 'porch'). notebook: 'you' (Sam gave it to you at the
 // curb). print: the Sunday picture from Alex's father. told: what you said, scene by scene (the goodbye, the call, his bike, the
 // picture with Alex's shadow in it, looking back). A DEV start does not read your save: it begins every scene the same way.
 const KEEP0=()=>({cap:'you',capWhen:null,notebook:'you',print:true,camera:'parents',told:{},boxed:[],wrote:true,bell:true,from9:false,said:{},looked:{},capWith:null,section:null,a2done:false,coda:false,credits:false});
 function inherited(){try{const v=JSON.parse(localStorage.getItem(SAVE9)||'null');if(!v||typeof v!=='object')return null;const K=KEEP0();
   for(const key of ['cap','capWhen','notebook','print','camera','told','boxed','wrote','bell'])if(v[key]!==undefined&&v[key]!==null)K[key]=JSON.parse(JSON.stringify(v[key]));
   // (whatever Aftermath I's end says, the notebook left Oak Hollow with you on October 15: it is how that chapter ends)
   K.notebook='you';if(K.cap!=='mom')K.cap='you';K.from9=true;return K;}catch{return null;}}
 function saveKeep(){try{localStorage.setItem(SAVE10,JSON.stringify({...C.keep,section:C.lastCheckpoint||C.keep.section||null,home:['YOU','SAM'],lost:['JAMIE','ALEX'],presence:'sealed',year:2021,at:Date.now()}));}catch{}}
 function loadKeep(){try{const v=JSON.parse(localStorage.getItem(SAVE10)||'null');if(!v||typeof v!=='object')return null;const K=KEEP0();for(const key of Object.keys(K))if(v[key]!==undefined)K[key]=v[key];if(K.cap!=='mom')K.cap='you';return K;}catch{return null;}}
 function keep(key,val){C.keep[key]=val;saveKeep();mark('kept: '+key+'='+(typeof val==='object'?JSON.stringify(val):val));}
 const said=(key,val)=>{C.keep.said={...C.keep.said,[key]:val};saveKeep();mark('said: '+key+'='+val);};
 const told=key=>C.keep.told?.[key];
 // ---- state ---------------------------------------------------------------------------------------------------------------------------
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,dt:0,h:17.73,day:'AUGUST 27',flags:{},timers:[],tasks:[],offers:new Map(),hold:{},cardT:-1,cardKind:null,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,view:null,
  lookKind:null,minute:-1,sounds:{},amb:{traffic:.08,insects:.34,wind:.3,life:.55,forest:0,tunnel:0,water:0},choice:null,marks:[],where:null,inside:0,insideWant:0,skyK:null,clockRate:4,pCry:0,pCryT:0,
  keep:KEEP0(),lastCheckpoint:null,nextScene:null});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL10[id]);C.lastCheckpoint=id;C.keep.section=id;saveKeep();};
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why){C.marks.push([+C.t.toFixed(1),why]);if(C.marks.length>300)C.marks.shift();}};
 const mine=ph=>typeof ph==='string'&&/^a2-/.test(ph);
 const owns=mine;
 const handles=sec=>SECTIONS10.includes(sec)||!!ALIAS10[sec];
 function card(on,{title='Aftermath II',eyebrow='LAST LIGHT',sub=''}={}){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2'),s=el.querySelector?.('.card-sub');if(e)e.textContent=eyebrow;if(h)h.textContent=title;if(s)s.innerHTML=sub;el.classList.add('on');}else{el.classList.remove('on');const s=el.querySelector?.('.card-sub');if(s)s.innerHTML='';}C.cardOn=on;}
 // the place and the year, small, over the first of the drive (a lower third: no card over black)
 let placeEl=null;
 function placeTitle(on,text='OAK HOLLOW — AUGUST 2021'){try{if(!placeEl){placeEl=document.getElementById('a2-place');if(!placeEl&&document.body&&document.createElement){placeEl=document.createElement('div');placeEl.id='a2-place';placeEl.setAttribute?.('aria-live','polite');document.body.appendChild(placeEl);}}
   if(placeEl){placeEl.textContent=text;placeEl.classList?.[on?'add':'remove']('on');}}catch{}C.placeOn=on;}
 // ---- lines: who says them ------------------------------------------------------------------------------------------------------------
 let SAMA=null;// adult Sam (aftermath2-actors.js), set by attach()
 const q2=t=>'“'+t+'”';
 const by=l=>{if(l.text===undefined&&!l.then&&!l.wait&&!l.until)l={...l,wait:.01};const from=l.by==='sam'?SAMA:l.from,act0=l.act;
  const act=(l.face)?()=>{if(from?.face)from.face.set(l.face,{hold:Math.max(3,(l.time||2)+1.5)});act0?.();}:act0;
  if(l.text===undefined)return {...l,act};return {...l,from,act,time:l.time??Math.max(1.5,(typeof l.text==='function'?'a line of about this long':l.text).replace(/[“”]/g,'').length*.058)};};
 function say(lines,opts){talk(lines.map(by),opts);}
 const SM=(t,x={})=>({who:'SAM',text:q2(t),by:'sam',...x}),Y=(t,x={})=>({who:'YOU',text:q2(t),...x}),N=(t,x={})=>({who:'',text:t,...x}),V=(name,t,x={})=>({who:name,text:q2(t),...x});
 // ---- the task runner: each scene is a script (a generator) that waits on time, on lines and on what you do ---------------------------
 function task(name,gen){C.tasks=C.tasks.filter(t=>t.name!==name);C.tasks.push({name,gen,started:C.t});}
 function stopTask(name){C.tasks=C.tasks.filter(t=>t.name!==name);}
 function* wait(s){let e=0;while(e<s){yield;e+=C.dt;}}
 function* until(fn,max=Infinity){let e=0;while(!fn()){if(e>=max)return false;yield;e+=C.dt;}return true;}
 function* lines(ls,opts){say(ls,opts);yield;while(busy())yield;}
 function* quiet(max=30){let e=0;while(busy()&&e<max){yield;e+=C.dt;}}
 // ---- what F does here: offers (a label at a place; tap or hold) ----------------------------------------------------------------------
 function offer(id,label,at,o2={}){C.offers.set(id,{id,label,at,r:2.2,once:true,...o2});}
 const unoffer=id=>{C.offers.delete(id);delete C.hold[id];if(C.holdOn===id)C.holdOn=null;};
 const V3=q=>q?(q.isVector3?q:new THREE.Vector3(q.x,q.y??gy(q.x,q.z)+1,q.z)):null;
 const atOf=q=>typeof q==='function'?q():q;
 const near=(q,r,p=me())=>{const w=atOf(q);return !!w&&Math.hypot(p.x-w.x,p.z-w.z)<r;};
 const lookingAt=(q,cos=.9)=>{const w=V3(atOf(q));return !!w&&k.camLooksAt(w,cos);};
 // ---- poses: sitting down, a closer look ------------------------------------------------------------------------------------------------
 function pose(q,{y,pitch=0,yaw=null,look=null,slow=1.1,seat=null,stand=false}={}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);
  C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false,fx:p.x,fz:p.z,slow,stand};
  if(seat)C.pose.seat={x:seat.x??q.x,z:seat.z??q.z,y:seat.y??(y-1.0),a:seat.a??a,h:seat.h??.43,legs:seat.legs||'bent',hands:seat.hands||'knees'};
  k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/(P2.slow||1.1));if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 function closeLook(target,{back=.62,eye=1.62,floor=null,kind=null,dur=null}={}){const p=me(),a=headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
  pose(q,{y:fy+eye,yaw:a,pitch:Math.atan2(target.y-(fy+eye),back),stand:true});C.view='look';C.lookKind=kind;C.lookAt=target;C.lookT=0;C.lookDur=dur;}
 function endLook(){if(C.view!=='look')return;C.view=null;C.lookKind=null;unpose();}
 function* looking(target,ls,{back=.62,eye=1.62,floor=null,kind='look',min=0}={}){closeLook(target,{back,eye,floor,kind});say(ls);let e=0;yield;while(busy()||e<min){yield;e+=C.dt;}endLook();}
 // a thing held up to look at (the mouse or A/D turns it; W/S... S or F puts it down; Q/E turn a page where there are pages)
 const holder=new THREE.Group();holder.name='a2-held';
 function pageMesh(tex,{w=.2,h=.26,color=0xfbfaf4}={}){const m=new THREE.MeshBasicMaterial({map:tex||null,color:tex?0xffffff:color,side:THREE.DoubleSide});m.toneMapped=true;const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),m));return g;}
 function inspect(obj,{dist=.4,ls=null,kind='thing',onClose=null,tilt=0,pages=null,y=-.01}={}){if(C.view)return;camera.add(holder);holder.position.set(0,y,-dist);// (y: held a little higher, above the captions, for a page to read)
 holder.rotation.set(0,0,0);holder.add(obj);obj.position.set(0,0,0);obj.rotation.set(tilt,0,0);
  C.view='inspect';C.inspect={obj,kind,onClose,yaw:0,pitch:tilt,t:0,pages};o.roam.walkLock=true;C.lookKind=kind;if(ls)say(ls);mark('held: '+kind);}
 function endInspect(){const I=C.inspect;if(!I)return;holder.remove(I.obj);holder.removeFromParent();C.view=null;C.inspect=null;C.lookKind=null;if(!posed())o.roam.walkLock=false;I.onClose?.();}
 function* holding(obj,ls,{dist=.4,kind='thing',min=1.2,max=60,tilt=0,pages=null}={}){inspect(obj,{dist,ls,kind,tilt,pages});C.flags.putDown=false;let e=0;yield;while(C.view==='inspect'&&(busy()||e<min||!C.flags.putDown)&&e<max){yield;e+=C.dt;if(!busy()&&e>min+16)break;}if(C.view==='inspect')endInspect();C.flags.putDown=false;}
 // ---- choices: a few true things you could say (number keys). None of them changes what happened. ---------------------------------------
 function choose(options,{then,timeout=40,fallback=null}){C.choice={options,then,t:0,timeout,fallback};}
 function pick(i){const ch=C.choice;if(!ch||!ch.options[i])return;C.choice=null;mark('chose: '+ch.options[i].id);ch.then(ch.options[i].id);}
 function* choosing(options,o2={}){let got=null;choose(options,{...o2,then:id=>{got=id;}});while(got===null){yield;if(C.choice&&o2.timeout&&C.choice.t>o2.timeout){const f=o2.fallback??options[options.length-1].id;C.choice=null;mark('chose (silence): '+f);got=f;}}return got;}
 // ---- the day and the hour, and the light -----------------------------------------------------------------------------------------------
 const date=()=>o.setDate(`${C.day}, 2021 <i></i> ${fmt(C.h)}`);
 function setDay(h,rate=4){C.h=h;C.minute=-1;C.clockRate=rate;date();}
 function clock(dt){if(!owns(S.phase)||S.phase==='a2-black'||S.phase==='a2-end'||S.phase==='a2-coda')return;C.h+=dt*(C.clockRate||4)/3600;const m=Math.floor(C.h*60+1e-6);if(m!==C.minute){C.minute=m;date();}}
 function sky(){const B=C.skyK||skyAt(C.h),i=C.inside||0;return {day:B.day,p:B.p,night:B.night||0,deep:0,fill:lerp(0,C.fill??.7,i),storm:0,flash:0,cave:(C.cave??.4)*i,apoc:0};}
 // ---- the world as an evening in 2021 ---------------------------------------------------------------------------------------------------
 function dayWorld(){document.body?.classList?.add('night1');nav.setTown(true);nav.setPine?.(true);A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);o.setFlashlight?.(false,false);
  ambient.night?.(false);ambient.morning?.(true);S.flashOn=false;o.hideWorld?.(false);o.bikeAway?.(true);
  for(const a of [...(k.adults||[]),...(ch2.extra||[])]){a.show?.(false);a.lookAt=null;a.gest?.(null);a.path=null;a.mode='stand';}
  police.reset?.();k.carA?.show(false);k.carB?.show(false);if(ch2.flyers)ch2.flyers.visible=false;if(ch2.found)ch2.found.group.visible=false;if(ch2.tape)ch2.tape.visible=false;for(const b of ch2.beams||[])b.on=false;if(ch2.samBeam)ch2.samBeam.on=false;
  for(const kk of ['clue','glint','track','flies','torch'])if(k[kk])k[kk].visible=false;
  world.doors.alex?.set(0);world.doors.jamie?.set(0);if(world.alexWindow)world.alexWindow.emissiveIntensity=0;world.garages.sam?.set?.(0);world.garages.alex?.set?.(0);
  for(const f of o.friends?.list||[]){f.person.group.visible=false;f.bike.group.visible=false;}if(o.friends?.mom?.person)o.friends.mom.person.group.visible=false;
  for(const c of [jamie,kidSam]){if(!c)continue;c.gone=true;c.person.group.visible=false;c.bike.group.visible=false;if(c.active)comp.release(c);c.brain=null;c.script=null;}}
 // ---- what you carry (I) ------------------------------------------------------------------------------------------------------------------
 function items(){const K=C.keep,carry=[],found=[];
  carry.push({id:'notebook',name:'Sam’s notebook',state:'ALEX · JAMIE · SAM. Ten years in a drawer, a glovebox, a jacket pocket.'});
  if(K.print)carry.push({id:'print',name:'Sunday at the oak',state:'In the back of the notebook. Four bikes, three of you.'});
  if(K.cap==='you')carry.push({id:'cap',name:'Jamie’s cap',state:C.flags.capWith?'In your back pocket, the brim folded.':'On the passenger seat of your car.'});
  carry.push({id:'phone',name:'Your phone',state:C.flags.texted?'Sam: “at the curb. the old one”':'Sam: “text me when youre close”'});
  if(K.cap==='mom')found.push({id:'cap',name:'Jamie’s cap',note:'His mother has it.'});
  found.push({id:'tour',name:'The Tour de Oak Hollow',note:'Sam still has it. “Somebody has to.”'});
  return {carry,found};}
 const inv=createInventory({items,use:()=>{}});
 // ---- grief, ten years on: not a floor on anyone's face. A breath that catches, once or twice, when a scene says so. -------------------
 function cry(k2,sec=6){C.pCry=Math.max(C.pCry,k2);C.pCryT=Math.max(C.pCryT,sec);}
 let tearsEl=null;
 function tearsOverlay(v){if(!tearsEl){try{tearsEl=document.getElementById('c8-tears');if(!tearsEl&&document.body){tearsEl=document.createElement('div');tearsEl.id='c8-tears';document.body.appendChild(tearsEl);}}catch{}}if(tearsEl?.style)tearsEl.style.opacity=v.toFixed(3);}
 function updateGrief(dt){if(C.pCryT>0)C.pCryT-=dt;else C.pCry=Math.max(0,C.pCry-dt*.09);tearsOverlay(Math.min(.45,C.pCry*.55));}
 // ---- a safety net: standing somewhere that is not anywhere, after a moment the nearest place that is -----------------------------------------
 function unstick(dt){const p=me();if(!p?.walking||C.pose||C.view||C.fadeOut>=0||S.phase==='a2-black'||o.roam.walkLock){C.stuckT=0;return;}
  if(nav.walkable(p.x,p.z,{r:.2})){C.stuckT=0;return;}C.stuckT=(C.stuckT||0)+dt;if(C.stuckT<.8)return;C.stuckT=0;
  for(let r=.35;r<=3.2;r+=.35)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;if(nav.walkable(x,z,{r:.3})){o.placePlayer({x,z,a:p.a,mode:'walk',bike:null});mark('unstuck');return;}}}
 // ---- the scenes are added by aftermath2-scenes.js, which shares all of this ------------------------------------------------------------------
 const CTX={o,k,C,A10,S,ch2,ch5,ch6,ch8,a1,phys,comp,sound,gy,light,LIGHTS,lightsOn,checkpoint,later,mark,card,placeTitle,say,SM,Y,N,V,task,stopTask,wait,until,lines,quiet,offer,unoffer,V3,atOf,near,lookingAt,
  pose,unpose,posed,closeLook,endLook,looking,inspect,endInspect,holding,pageMesh,holder,choose,choosing,me,go,objective,talk,busy,nav,camera,scene,world,ambient,
  date,setDay,fmt,dayWorld,inv,keep,said,told,saveKeep,cry,SAVE10,SAVE_DONE,CODA,skyAt};
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
  if((code==='KeyI'||code==='Tab')&&!inv.isOpen&&(C.view||C.fadeOut>=0||S.phase==='a2-black'||C.choice))return true;if(inv.key(code,repeat))return true;
  if(C.choice){const m=/^(Digit|Numpad)([1-4])$/.exec(code);if(m){if(!repeat)pick(+m[2]-1);return true;}return ['KeyF','KeyW','KeyA','KeyS','KeyD','Space'].includes(code);}
  if(C.view==='inspect'){const I=C.inspect;
   if(I?.pages&&(code==='KeyE'||code==='ArrowRight'||code==='KeyQ'||code==='ArrowLeft')){if(!repeat)I.pages.turn(code==='KeyE'||code==='ArrowRight'?1:-1);return true;}
   if((code==='KeyS'||code==='ArrowDown'||code==='KeyF')&&!repeat&&I?.t>.4&&!busy()){C.flags.putDown=true;endInspect();return true;}if(code==='KeyA'){I.yaw-=.25;return true;}if(code==='KeyD'){I.yaw+=.25;return true;}return ['KeyW','Space','KeyC','KeyS','KeyF'].includes(code);}
  if(C.view==='look'){if((code==='KeyS'||code==='ArrowDown')&&!busy()&&!C.lockLook){if(!repeat){endLook();C.flags.lookEnded=true;}return true;}return ['KeyW','KeyA','KeyD','Space','KeyC','KeyS'].includes(code);}
  if(SC?.key?.(code,repeat))return true;
  if(code==='KeyT')return true;// (no flashlight here)
  return false;}
 function pan(dx,dy){if(!mine(S.phase))return false;if(C.view==='inspect'){C.inspect.yaw+=dx*.006;C.inspect.pitch=clamp(C.inspect.pitch+dy*.006,-1.2,1.2);return true;}return !!SC?.pan?.(dx,dy);}
 function wheel(dy){if(!mine(S.phase))return false;return !!SC?.wheel?.(dy);}
 function hint(){if(C.choice)return C.choice.options.map((op,i)=>[String(i+1),op.label]);
  if(C.view==='inspect')return C.inspect?.pages?[['Q / E','Turn the page'],['Mouse','Look'],['S','Put it away']]:[['Mouse / A D','Turn it'],['S','Put it away']];if(C.view==='look'&&!C.lockLook)return [['S','Step back']];
  const h=SC?.hint?.();if(h)return h;
  if(C.holdOn&&C.offers.get(C.holdOn))return [['Hold F',C.offers.get(C.holdOn).label+' '+Math.round((C.hold[C.holdOn]||0)*100)+'%']];return null;}
 function sources(out){if(!mine(S.phase))return;SC?.sources?.(out);}
 function blockers(){const out=[];SC?.blockers?.(out);return out;}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------
 function update(dt){C.dt=dt;C.t+=dt;C.pt+=dt;
  if(C.nextScene){const s2=C.nextScene;C.nextScene=null;jumpTo(s2,{keep:true});return;}
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  if(!owns(S.phase))return;// (a timer handed over (the coda) and the page was reset under it: nothing of this chapter's runs this frame)
  for(const t of C.tasks.slice()){let r;try{r=t.gen.next(dt);}catch(e){mark('task '+t.name+' threw: '+(e&&e.message));console.error?.(e);r={done:true};}if(r.done)C.tasks=C.tasks.filter(x=>x!==t);}
  if(C.cardT>=0){C.cardT+=dt;if(C.cardT>.8&&!C.cardOn)card(true,{sub:'TEN YEARS LATER'});if(C.cardT>5.4){card(false);C.cardT=-1;}}
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/(C.fadeInDur||2.2)));if(C.fadeIn>(C.fadeInDur||2.2)){C.fadeIn=-1;C.fadeInDur=null;o.fade(0);}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/(C.fadeOutDur||1.6)));if(C.fadeOut>(C.fadeOutDur||1.6)+.2){C.fadeOut=-1;C.fadeOutDur=null;const f=C.after;C.after=null;f?.();}}
  if(C.choice){C.choice.t+=dt;}
  updatePose(dt);if(C.view==='inspect'&&C.inspect){C.inspect.t+=dt;C.inspect.obj.rotation.set(C.inspect.pitch,C.inspect.yaw,0);}
  if(C.view==='look'&&C.lookDur){C.lookT+=dt;if(C.lookT>C.lookDur&&!busy())endLook();}
  updateHolds(dt);clock(dt);updateGrief(dt);unstick(dt);inv.update();
  C.inside=damp(C.inside||0,C.insideWant||0,2.2,dt);
  SC?.update?.(dt);
  const L=sky();A.day=L.day;A.night=L.night;ch2.day=A.day;A.shade=0;A.barLight=false;}
 function afterActors10(dt){if(!owns(S.phase))return;if(k.torchO)k.torchO.visible=false;SC?.afterActors?.(dt);phys?.sync?.();
  if(C.pCry>.05){const k2=C.pCry,b=Math.sin(C.t*1.5)*.006*k2+Math.sin(C.t*29)*.001*k2;camera.position.y+=b-.01*k2;}}
 {const prev=A.afterActors6;A.afterActors6=(dt,o2)=>{prev?.(dt,o2);afterActors10(dt,o2);};}
 // ---- lifecycle -----------------------------------------------------------------------------------------------------------------------------
 function reset(){if(!C.offers||!C.flags||!C.keep)fresh();const hadPose=C.pose,hadView=!!C.view;card(false);placeTitle(false);if(C.view==='inspect')endInspect();if(C.view==='look')C.view=null;inv.reset();C.choice=null;
  SC?.reset?.();lightsOn(false);
  if(A10.started){ch5.presentation?.(false);phys?.reset?.();if(o.foot.arms===phys?.arms)o.foot.arms=null;o.hideWorld?.(false);
   // (only what this chapter changed: the boys' companions are the Prologue's own riders too, so their bodies are left as the reset before
   //  this one left them: Start over shows all three)
   for(const c of [jamie,kidSam]){if(!c)continue;c.gone=false;c.crouch=0;c.boost=1;}if(kidSam)kidSam.person.group.visible=true;}
  tearsOverlay(0);A.rideBoost=1;A.rideFov=0;o.setPace?.(1);o.roam.brake=0;holder.removeFromParent();
  A10.started=false;A10.finished=false;
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView)o.roam.walkLock=false;fresh();}
 function setup(){A10.started=true;ch5.presentation?.(true);if(phys)o.foot.arms=phys.arms;SC?.setup?.();}
 // From Aftermath I's end card: what was kept is read from what it saved.
 function begin(){fresh();const K=inherited();if(K)C.keep=K;saveKeep();setup();SC.begin();}
 function jump(section){jumpTo(section);}
 // (a jump from Continue keeps what you chose; a DEV start does not: it starts every scene the same way)
 let devFresh=false,devOver=null;
 function jumpTo(section,{keep:keepNow=false}={}){section=ALIAS10[section]||section;const carry=keepNow?JSON.parse(JSON.stringify(C.keep||KEEP0())):null;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();
  let K=null;if(carry)K=carry;else if(!devFresh)K=loadKeep()||inherited();
  if(K)C.keep=K;else if(devOver)Object.assign(C.keep,devOver);if(K&&devOver)Object.assign(C.keep,devOver);C.fromSave=!!K&&!carry;devFresh=false;devOver=null;setup();C.jumped=section;SC.jump(section);}
 // ---- the end card --------------------------------------------------------------------------------------------------------------------------------
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Aftermath II';if(pp)pp.innerHTML='TEN YEARS LATER<br>August, 2021.';}
  const nb=$('next-chapter');if(nb){nb.hidden=false;nb.innerHTML='One more lap <span>→</span>';}A10.finished=true;C.keep.a2done=true;
  try{localStorage.setItem(SAVE10,JSON.stringify({...C.keep,section:'aftermath2-end',home:['YOU','SAM'],lost:['JAMIE','ALEX'],presence:'sealed',year:2021,you:'came back, August 2021',sam:'Oak Hollow',at:Date.now()}));}catch{}
  k.checkpointTo('coda-start',LABEL10['coda-start']);
  o.finish();}
 Object.assign(CTX,{end,jumpTo,reset,fresh,items,sky,inherited,loadKeep,KEEP0});
 // ---- the api --------------------------------------------------------------------------------------------------------------------------------------
 function attach(mod){SC=mod(CTX);A10.SC=SC;SAMA=SC.SAMA||null;}
 Object.assign(A10,{SECTIONS:SECTIONS10,ALIAS:ALIAS10,LABEL:LABEL10,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,attach,
  jamieSweep:()=>null,officerAim:()=>null,light:()=>owns(S.phase)?sky():null,longThrow:()=>null,
  canDismount:()=>false,canRemount:()=>false,
  closeBag:()=>{if(inv.isOpen){inv.close();return true;}return false;},inventoryReady:()=>owns(S.phase)&&S.phase!=='a2-black'&&S.phase!=='a2-end'&&S.phase!=='a2-coda',
  devFresh:(over=null)=>{devFresh=true;devOver=over;},loadKeep,saveKeep,keep,inherited,C,LIGHTS,inv,sky,CTX,get started(){return A10._started;},set started(v){A10._started=v;}});
 Object.defineProperties(A10,{amb:{get:()=>C.amb},viewing:{get:()=>C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,day:C.day,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,lookKind:C.lookKind,keep:JSON.parse(JSON.stringify(C.keep)),offers:[...C.offers.keys()],hold:{...C.hold},
   choice:C.choice?C.choice.options.map(q=>q.id):null,where:C.where,inside:+(C.inside||0).toFixed(2),pCry:+C.pCry.toFixed(2),tasks:C.tasks.map(t=>t.name),posed:posed(),
   you:{x:+p.x.toFixed(2),z:+p.z.toFixed(2),walking:!!p.walking,riding:!!p.riding},sky:sky(),
   sam:SAMA?{visible:!!SAMA.visible,x:+SAMA.x.toFixed(2),z:+SAMA.z.toFixed(2),mode:SAMA.mode,face:SAMA.face?.expression||null,dist:+Math.hypot(SAMA.x-p.x,SAMA.z-p.z).toFixed(2)}:null,
   jamie:{visible:!!jamie?.person.group.visible},kidSam:{visible:!!kidSam?.person.group.visible},
   sounds:{...C.sounds},marks:C.marks.slice(-40),endT:+C.endT.toFixed(2),scene:SC?.state?.()||null};}}});
 return A10;
}
