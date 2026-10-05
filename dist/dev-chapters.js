// TEMPORARY — private playtest build only (branch claude/chapter3-private-playtest). NOT part of the
// shipped game: the finished Chapter Three branch does not contain this file, and the release will not.
//
// DEV — START AT CHAPTER: begin at the true beginning of the prologue or of Chapter One, Two or Three,
// in the same state a player reaches by playing everything before it.
//
// How the state is made canonical. Each chapter is entered by the game's own code path for entering it:
//   * Prologue: Start over (resetState + start), exactly what a new game does.
//   * Chapter One: the last stretch of the street (the game's own mid-ride warp), then the game itself
//     rides into the lookout, stops, plays the finale (the evening, the call, the "time to go home" hint),
//     and leave() — the function F → "Go home" calls — runs startNight('ride') → chapter.begin('ride').
//   * Chapter Two: Chapter One's last scene (the creek checkpoint), the real F at the reflector
//     (chapter.act('reflector')), then the game runs, muted and behind black, until Chapter One's own
//     ending calls chapter2.begin().
//   * Chapter Three: Chapter Two's last scene (the chapter2-end checkpoint), then the game runs, muted and
//     behind black, until Chapter Two's own end() calls chapter3.begin().
// The checkpoint scenes cannot know what earlier beats left behind (which windows were tapped, the
// flashlight Jamie gave you, the siren, Chapter Two's evidence and police flags…). That history comes from
// HISTORY (dev-chapter-history.js), which is GENERATED from a natural playthrough
// (`ONLY=dev-record node tests/verify.mjs`), never written by hand; timestamps in it are stored relative to
// the chapter clock and re-based. The simulation test compares every start with a natural arrival.
// Before any of it, everything transient is cleared (clear()), so switching chapters any number of times in
// one session leaves nothing behind.
import {HISTORY,TIMESTAMPS} from './dev-chapter-history.js';
export const DEV_CHAPTERS=[{n:0,label:'Prologue',phase:null},{n:1,label:'Chapter One',phase:'leave'},{n:2,label:'Chapter Two',phase:'c2-black'},{n:3,label:'Chapter Three',phase:'c3-black'}];

export function createDevChapters(g){
 const {chapter,chapter2,chapter3}=g,comp=chapter.companions,K=chapter.kit;
 // Every per-run state object emptied completely before the chapters' own reset()/fresh() refill them
 // (their fresh() functions refill a fixed list of keys; anything else would otherwise survive).
 function clearObject(o,keep=[]){if(!o)return;for(const k of Object.keys(o))if(!keep.includes(k))delete o[k];}
 // The grown-ups of every chapter (police, parents, neighbours, searchers): their walking speed, pose and
 // gesture blend carry over from one run to the next (the chapters place them again but do not reset those),
 // so the selector puts each back exactly as the page created them. The same for the night's free-ride state
 // (roam: where the bike is when you are not on the prologue's road), which keeps the last chapter's spot.
 const actors=[...new Set([...(chapter.adults||[]),...(chapter2.extra||[]),...Object.values(chapter3.people||{}),g.roam].filter(Boolean))];
 const copyOf=v=>ArrayBuffer.isView(v)||Array.isArray(v)?v.slice():v;
 const data=a=>Object.entries(Object.getOwnPropertyDescriptors(a)).filter(([,d])=>'value' in d&&typeof d.value!=='function');
 const born=actors.map(a=>new Map(data(a).map(([k,d])=>[k,copyOf(d.value)])));
 function rebirth(){actors.forEach((a,i)=>{const b=born[i];for(const [k] of data(a))if(!b.has(k))delete a[k];
  for(const [k,v] of b){if(ArrayBuffer.isView(v)&&ArrayBuffer.isView(a[k]))a[k].set(v);else a[k]=copyOf(v);}
  if(a.person?.group)a.person.group.visible=!!b.get('visible');});}
 // restart=false when the caller restarts the game itself next (the checkpoint scenes' jumpTo() does Start
 // over's resetState() + start() as its first step): one start(), so the pointer lock is requested once per click.
 function clear({restart=true}={}){
  g.audio()?.stopRecording?.();
  clearObject(chapter3.C);clearObject(chapter2.C);
  // Chapter One's shared state: the dialogue queue array is kept as the same array (other code holds it).
  const q=K.S.queue;clearObject(K.S);K.S.queue=q;q.length=0;
  rebirth();
  for(const c of comp.all){c.script=null;c.route=null;c.poi=null;c.gaze=null;c.lookAt=null;c.lookPlayer=false;}
  if(restart)g.resetGame();// Start over: resetState() (every module's reset, chapters included) and a fresh start()
 }
 // Run the game's own update until the chapter hand-over happens (audio off meanwhile; nothing is drawn).
 function runUntil(done,max=240){const a=g.audio(),was=a?.enabled;a?.setEnabled(false);let t=0;const dt=1/30;
  try{while(t<max&&!done()){g.update(dt);t+=dt;}}finally{a?.reset?.();if(was)a.setEnabled(true);}
  if(!done())throw new Error('dev start: the hand-over did not happen');return t;}
 const phase=()=>K.S.phase,G=()=>g.game();
 // What the earlier beats left behind, from the natural playthrough (see the header).
 function applyHistory(n){const H=HISTORY[n];if(!H)return;
  const put=(obj,vals,clock,stamps)=>{if(!obj||!vals)return;for(const [k,v] of Object.entries(vals)){if(v===null)delete obj[k];else obj[k]=JSON.parse(JSON.stringify(v));}
   for(const [k,off] of Object.entries(stamps||{}))obj[k]=off===null?undefined:(obj[clock]??0)-off;};
  put(K.S,H.chapter1,'t',H.chapter1Clock);put(chapter2.C,H.chapter2,'t',H.chapter2Clock);
  if(H.foot){g.foot.owned=H.foot.owned;g.foot.on=H.foot.on;}
  if(H.lens!=null&&K.lens)K.lens.emissiveIntensity=H.lens;
  if(H.save)K.checkpointTo(H.save,K.CHECKPOINT[H.save]);}
 function start(n,{history=true}={}){
  clear({restart:n<2});
  if(n===1){g.prologueApproach();g.press('KeyW');runUntil(()=>G().state==='arriving',60);g.release('KeyW');
   runUntil(()=>G().state==='stopped',60);
   // The finale: the call, the hint that it is time to go home, and the night fully fallen (before the
   // fade that would otherwise carry you home asleep, at 100 s).
   runUntil(()=>G().callDone&&G().finaleT>=G().callT+12&&g.skyMat.uniforms.night.value>=.9995,95);g.leave();}
  else if(n===2){g.jumpTo('clue');chapter.act('reflector');runUntil(()=>phase()==='c2-black');}
  else if(n===3){g.jumpTo('chapter2-end');runUntil(()=>phase()==='c3-black');}
  else if(n!==0)throw new Error('dev start: no chapter '+n);
  if(history)applyHistory(n);
  return phase();}

 // ---- a snapshot of everything that makes up the game's state, for comparing two ways of arriving ---------
 const r=v=>Number.isFinite(v)?Math.round(v*1000)/1000:v;
 const pos=o=>o?{x:r(o.x),z:r(o.z)}:null;
 // Plain data only: numbers rounded, objects that are scene objects or people reduced to what they are.
 function plain(v,d=0){if(v==null||typeof v==='boolean'||typeof v==='string')return v;if(typeof v==='number')return r(v);if(typeof v==='function')return undefined;
  if(v.isVector3||(typeof v.x==='number'&&typeof v.z==='number'&&Object.keys(v).length<=4))return pos(v);if(v.isObject3D)return {object:v.name||v.type,visible:v.visible};
  if(typeof v.key==='string'&&'px' in v)return 'companion:'+v.key;if(v instanceof Set)return [...v].sort();if(v instanceof Map)return [...v.keys()].sort();
  if(Array.isArray(v))return d>1?{length:v.length}:v.map(x=>plain(x,d+1));if(d>2)return '{…}';const o={};for(const k of Object.keys(v)){const p=plain(v[k],d+1);if(p!==undefined)o[k]=p;}return o;}
 const person=a=>{if(!a)return null;const v=!!(a.visible??a.person?.group?.visible);return v?{visible:true,x:r(a.x),z:r(a.z),mode:a.mode||null,gest:a.next??a.gesture??null}:{visible:false};};
 const car=c=>c?{active:c.active,parked:!!c.parked,lights:!!c.lights,siren:!!c.siren,headlights:!!c.headlights,x:c.active?r(c.x):null,z:c.active?r(c.z):null}:null;
 function snapshot(){const G=g.game(),S=K.S,el=id=>g.$(id),body=document.body?.classList;
  return {
   game:G,
   player:{roam:{x:r(g.roam.x),z:r(g.roam.z),a:r(g.roam.a),lock:g.roam.lock,walkLock:g.roam.walkLock,brake:r(g.roam.brake)},walk:G.state==='c1-walk'?g.walk():null,
    foot:{owned:g.foot.owned,on:g.foot.on,stamina:r(g.foot.stamina),crouch:r(g.foot.crouch),height:r(g.foot.height),exhausted:g.foot.exhausted,drain:g.foot.drain,light:!!g.foot.light.parent}},
   chapter1:{...plain(Object.fromEntries(Object.entries(S).filter(([k])=>!['queue','line','pose'].includes(k)))),queue:S.queue.length,line:S.line?.text||null,pose:!!S.pose,
    api:{night:chapter.night,deep:r(chapter.deep),day:chapter.day,pose:!!chapter.pose},state:plain(chapter.state)},
   chapter2:{C:plain(chapter2.C),day:chapter2.day,state:plain(chapter2.state),found:chapter2.found.group.visible,tape:chapter2.tape.visible,flyers:chapter2.flyers.visible,
    extra:chapter2.extra.map(person),beams:chapter2.beams.map(b=>({on:!!b.on,visible:!!b.beam?.visible}))},
   chapter3:{C:plain(chapter3.C),state:plain(chapter3.state),old:chapter3.old.group.visible,evidence:chapter3.evidence.visible,phone:chapter3.phone.visible,figure:chapter3.figure.group.visible,amb:plain(chapter3.amb)},
   companions:comp.all.map(c=>({key:c.key,active:c.active,mode:c.mode,follow:c.follow||null,script:!!c.script,visible:!!c.person?.group?.visible,bikeVisible:!!c.bike?.group?.visible,
    p:pos({x:c.px,z:c.pz}),b:pos({x:c.bx,z:c.bz}),pa:r(c.pa),ba:r(c.ba),speed:r(c.speed),flash:!!c.flash,lookAt:!!c.lookAt,lookPlayer:!!c.lookPlayer,hidden:!!c.hidden,poi:!!c.poi})),
   people:{officer:person(chapter.officer),officer2:person(chapter.officer2),dad:person(chapter.dad),mom:person(chapter.mom),neighbor:person(chapter.neighbor),adults:(chapter.adults||[]).map(person),
    neighbours3:Object.fromEntries(Object.entries(chapter3.people||{}).map(([k,a])=>[k,person(a)]))},
   police:{carA:car(chapter.carA),carB:car(chapter.carB),attached:!!chapter.police?.attached},
   props:{clue:chapter.clue?.visible,track:chapter.track?.visible,glint:K.glint?.visible,flies:K.flies?.visible,torch:K.torch?.visible,beamJ:K.beamJ?.visible,beamO:K.beamO?.visible,lens:r(K.lens?.emissiveIntensity)},
   world:{sky:{dusk:r(g.skyMat.uniforms.dusk.value),night:r(g.skyMat.uniforms.night.value),day:r(g.skyMat.uniforms.day.value)},sun:r(g.sunlight.intensity),shadows:g.sunlight.castShadow,hemi:r(g.hemi.intensity),
    alexWindow:r(g.world.alexWindow?.emissiveIntensity),doors:Object.fromEntries(Object.entries(g.world.doors||{}).map(([k,d])=>[k,r(d.open??0)])),garages:Object.fromEntries(Object.entries(g.world.garages||{}).map(([k,d])=>[k,r(d.open??0)]))},
   prologue:{friends:g.friends.list.map(f=>({key:f.key,mode:f.mode,inside:!!f.inside,gone:!!f.gone,visible:!!f.person?.group?.visible})),ambient:plain(g.ambient.state),ending:plain(g.ending.state),interact:{pose:g.interact.pose?.id??null,used:g.interact.used}},
   memory:{state:plain(g.memory.state),active:g.memory.active},
   body:{tension:plain(g.tension.state),captions:{mode:g.captionTone.state.mode,source:g.captionTone.state.source}},
   audio:{enabled:!!g.audio()?.enabled,phone:g.audio()?.phone?{i:g.audio().phone.i}:null},
   ui:{date:el('date')?.innerHTML,objective:el('objective')?.textContent||'',objectiveOn:!!el('objective')?.classList.contains('on'),card:!!el('chapter-card')?.classList.contains('on'),
    ending:!!el('ending')?.hidden,fade:r(+(el('fade')?.style.opacity||0)),warm:!!el('fade')?.classList.contains('warm'),
    body:['riding','night1','remembering'].filter(c=>body?.contains(c)),prompt:g.ui.promptText||''},
   save:(()=>{try{return JSON.parse(localStorage.getItem('lastlight.chapter1')||'null')?.section??null;}catch{return null;}})()};}
 return {start,snapshot,clear,applyHistory,CHAPTERS:DEV_CHAPTERS};
}
