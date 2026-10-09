// TEMPORARY (private playtest build): checks for the developer chapter selector (dist/dev-chapters.js).
// The simulation's main run plays the prologue, Chapter One, Chapter Two and Chapter Three naturally with
// inputs. installNaturalCapture() records the game's full state snapshot at the end of the frame in which
// each chapter's begin() runs during that natural run. runDevChapterChecks() then starts each chapter from
// the selector and compares the two snapshots field by field, and switches chapters repeatedly in one
// session to show nothing leaks.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';

export function installNaturalCapture(h,element){
 const cap={natural:{},opened:{},how:{},armed:null,waiting:null,off:false,shots:{},scenes:{}},S=()=>h.chapter.kit.S;
 const render=h.renderer.render.bind(h.renderer);
 // The frame's render follows its update: a snapshot here is "the state at the end of that frame".
 // A second snapshot is taken when the chapter's first phase gives way to the next (the title card over
 // black ends and the chapter's opening scene is set): the first moment the player sees the chapter.
 h.renderer.render=(...a)=>{
  if(cap.waiting&&S().phase!==cap.waiting.phase){cap.opened[cap.waiting.n]=h.dev.snapshot();cap.opened[cap.waiting.n].phase=S().phase;cap.waiting=null;}
  // (the scenes: the first frame a natural run is at each one; see SCENE_REACH)
  if(!cap.off)for(const [k,reached] of Object.entries(SCENE_REACH))if(!cap.scenes[k]){let ok=false;try{ok=reached(h,S());}catch{}if(ok){cap.scenes[k]=h.dev.snapshot();cap.scenes[k].at=+h.snapshot.clock.toFixed(2);}}
  if(cap.armed!=null){const k=cap.armed;cap.armed=null;cap.shots[k]=h.dev.snapshot();if(typeof k==='number'){cap.natural[k]=cap.shots[k];if(k)cap.waiting={n:k,phase:S().phase};}}
  return render(...a);};
 // The prologue: the first frame after the title's start button on a fresh page (a new game).
 const st=element('start'),go=st.onclick;st.onclick=function(...a){const r=go.apply(this,a);if(!cap.off&&!(0 in cap.natural)){cap.armed=0;cap.how[0]='start';}return r;};
 for(const [n,api] of [[1,h.chapter],[2,h.chapter2],[3,h.chapter3],...(h.chapter4?[[4,h.chapter4]]:[])]){const b=api.begin;api.begin=function(...a){const r=b.apply(this,a);if(!cap.off&&!(n in cap.natural)){cap.armed=n;cap.how[n]=a[0]??null;}return r;};}
 return cap;
}

// ---- scenes (DEV_SCENES): where a natural run is first at each one, and what has to be the same ---------------
// The moment each scene's DEV start stands for, recognised in the natural run (the first frame it is true).
const c3=h=>h.chapter3,c3C=h=>h.chapter3.C;
export const SCENE_REACH={
 '0/alex-departure':(h,S)=>h.snapshot.state==='riding'&&!S.phase?.startsWith?.('c')&&h.snapshot.distance>=528,
 '0/jamie-departure':(h)=>h.snapshot.state==='riding'&&h.snapshot.distance>=670,
 '0/sam-departure':(h)=>h.snapshot.state==='riding'&&h.snapshot.distance>=870,
 '1/title':(h,S)=>S.phase==='title','1/alex-house':(h,S)=>S.phase==='briarwood'&&h.snapshot.state==='c1-ride',
 '1/jamie':(h,S)=>S.phase==='friends'&&S.objective==='Find Jamie.'&&h.snapshot.state==='c1-walk','1/sam':(h,S)=>S.phase==='friends'&&S.objective==='Find Sam.'&&h.snapshot.state==='c1-walk',
 '1/oak':(h,S)=>S.phase==='oak'&&S.objective==='Go to the old oak.'&&h.snapshot.state==='c1-ride'&&h.chapter.companions.all.every(c=>c.mode==='ride'),'1/retrace':(h,S)=>S.phase==='retrace'&&h.snapshot.state==='c1-ride'&&!!S.flags.patrol,
 '1/investigation':(h,S)=>S.phase==='creek'&&S.objective==='Look around the creek.'&&h.snapshot.state==='c1-walk',
 '2/chapter2-start':(h,S)=>S.phase==='c2-decide','2/easement':(h,S)=>S.phase==='c2-easement'&&S.objective==='Check the drainage path.','2/alex-bike':(h,S)=>S.phase==='c2-bike','2/second-bell':(h,S)=>S.phase==='c2-bell','2/police-find':(h,S)=>S.phase==='c2-police',
 '2/morning':(h,S)=>S.phase==='m-home','2/memory-start':(h,S)=>S.phase==='m-briarwood'&&!!h.chapter2.C.flags?.corner&&S.objective==='Remember Alex leaving.','2/memory-reconstruction':(h,S)=>S.phase==='m-memory','2/chapter2-end':(h,S)=>S.phase==='m-after'&&S.objective==='Remember Alex leaving.',
 '3/c3-alex-house':(h,S)=>S.phase==='d3-street'&&!!c3C(h).flags.atHouse,'3/alex-bedroom':(h,S)=>S.phase==='d3-room','3/recording':(h,S)=>S.phase==='d3-phone','3/neighbors':(h,S)=>S.phase==='d3-neighbors',
 '3/c3-road-day':(h,S)=>S.phase==='d3-road'&&h.snapshot.state==='c1-ride'&&c3(h).state.roadS>-20,'3/night-start':(h,S)=>S.phase==='n3-home','3/c3-road-night':(h,S)=>S.phase==='n3-road','3/c3-forest-deep':(h,S)=>S.phase==='n3-road'&&c3(h).state.roadS>=332,
 '3/c3-tunnel-entrance':(h,S)=>S.phase==='n3-outfall'&&!!c3C(h).flags.canEnter&&h.snapshot.state==='c1-walk'&&h.chapter.companions.all.every(c=>c.mode==='foot'),'3/c3-tunnel-deep':h=>!!c3C(h).flags.deep,
 '3/c3-alex-item':(h,S)=>S.phase==='n3-item','3/c3-old-bike':(h,S)=>S.phase==='n3-bike','3/c3-bike-gone':h=>!!c3C(h).flags.bikeGone,'3/c3-figure-reveal':(h,S)=>S.phase==='n3-figure','3/c3-follow-alex':(h,S)=>S.phase==='n3-follow',
 '3/c3-second-sighting':h=>c3(h).FG.state==='lure-wait','3/c3-creature-reveal':h=>c3(h).FG.state==='lure-walk','3/c3-creature-chase-start':h=>c3(h).CRT.state==='drop','3/c3-creature-far':h=>c3C(h).purs?.stage==='far',
 '3/c3-creature-side':h=>c3C(h).purs?.stage==='lost'&&c3C(h).purs.stumbleAt!=null&&c3(h).state.drainS<=190,'3/c3-bike-block':h=>c3C(h).purs?.stage==='side'&&c3(h).CRT.state==='chase'&&c3(h).state.drainS<=110,
 '3/c3-creature-near':h=>c3C(h).purs?.stage==='near'&&c3C(h).purs.bikeJamieAt!=null,'3/c3-creature-barrier':h=>c3C(h).purs?.gateHoldAt!=null,'3/c3-tunnel-exit':h=>c3C(h).purs?.stage==='after',
 '3/c3-bike-remount':(h,S)=>S.phase==='n3-out','3/c3-road-escape':(h,S)=>S.phase==='n3-flee'&&h.chapter.companions.all.every(c=>c.mode==='ride'),'3/c3-final-lure':h=>c3C(h).roadFig!=null,'3/chapter3-end':(h,S)=>S.phase==='n3-safe'};
// What a scene start must share with the natural moment: the chapter's place in the story (phase, objective, the
// saved checkpoint), day or night, the player's mode and flashlight, who is with you and how, and every story flag
// (Chapters One, Two and Three: what has happened), and in Chapter Three the bike, the boy, the creature, the gate and
// the chase. Positions, clocks and timers are not part of it (they depend on how it was played).
// Flags that only record optional things a player may or may not have done on the way are listed (OPTIONAL) with why.
export const OPTIONAL={
 chapter1:[],
 chapter2:[],
 // Chapter Three: lines and looks that depend on where you walked or looked (the wet print, the swinging cable,
 // Sam's "come back" if you lingered, Jamie's "come on" at the mouth, the turn-back exchange, the helmet line in
 // his room if you looked at it, an older recording heard), the neighbors you chose to ask, and per-frame
 // bookkeeping of where companions were sent (samBack, jamieToMouth).
 chapter3:['wetSeen','cableSeen','leaveHint','comeOn','comeOn2','samBack','jamieToMouth','helmetLine','wander','dayHint','window','okaforHint','glint','valley','noHouses','bellBehind','crossLight']};
export function meaning(snap,n){const s=JSON.parse(JSON.stringify(snap)),S=s.chapter1||{},C3=s.chapter3?.C||{},st=s.chapter3?.state||{};
 const flags=(o,skip)=>Object.fromEntries(Object.entries(o||{}).filter(([k,v])=>!skip.includes(k)&&v!==false&&v!=null&&v!==0));
 const m={phase:S.phase??null,objective:S.objective||'',game:s.game?.state,day:S.api?.day??null,night:S.api?.night??null,foot:s.player?.foot?{owned:s.player.foot.owned,on:s.player.foot.on}:null,flash:!!S.flashOn,
  companions:(s.companions||[]).map(c=>({key:c.key,active:c.active,mode:c.mode})),ch1:{flags:flags(S.flags,OPTIONAL.chapter1),jamieIn:!!S.jamieIn,samIn:!!S.samIn}};
 if(n>=1)m.save=s.save;
 if(n===0){m.prologue={friends:(s.prologue?.friends||[]).map(f=>({key:f.key,mode:f.gone?'(gone)':f.mode,inside:f.inside,gone:f.gone})),nextMemory:s.game?.nextMemory};}
 if(n>=2)m.ch2={flags:flags(s.chapter2?.C?.flags,OPTIONAL.chapter2)};
 if(n===3){const P=C3.purs||null;m.ch3={flags:flags(C3.flags,OPTIONAL.chapter3),bike:C3.bike,figure:st.figure?.state,creature:P?.stage==='mouth'&&/^(chase|watch)$/.test(st.creature?.state)?'at the mouth':st.creature?.state,creatureVisible:!!st.creature?.visible,gate:st.gate?{burst:st.gate.burst,want:st.gate.want}:null,
   lure:C3.lure?{seen:C3.lure.seenAt!=null,walk:C3.lure.walkAt!=null,gone:C3.lure.goneAt!=null,voice:C3.lure.voiceAt!=null}:null,crt:C3.crt?{seen:C3.crt.seenAt!=null,drop:C3.crt.dropAt!=null}:null,
   chase:P?{stage:P.stage,...Object.fromEntries(['farAt','lostAt','stumbleAt','sideAt','pipeAt','bikeJamieAt','nearAt','gateHoldAt','gateShutAt','gateHitAt','gateBurstAt','mouthAt'].map(k=>[k,P[k]!=null]))}:null};}
 return m;}

// Before comparing, both snapshots are normalized the same way (normalize()):
//  * timestamps measured on a chapter clock become "seconds before now" on that clock (the clocks themselves
//    count from different starting points: a natural run has been playing for twenty minutes);
//  * a companion riding a bike has no position of their own (the rider is attached to the bike; the stored
//    on-foot position is whatever it was when they last mounted), so only the bike's is compared;
//  * Chapter One's companion records under chapter1.state duplicate `companions`, which is compared instead;
//  * a parked, inactive police car's stored position is whatever it was the last time it drove (it is placed
//    when activated), so a car's position is compared only while it is active (police.carA/carB);
//  * a prologue friend who has gone (Alex) keeps the mode label they left in; it is never read again.
//  * a companion's hidden bike has no place to compare; Chapter One's silent siren has no doppler or muffling to compare.
import {TIMESTAMPS} from '../dist/dev-chapter-history.js';
export function normalize(snap){const s=JSON.parse(JSON.stringify(snap));
 const rebase=(o,keys,clock)=>{if(!o)return;for(const k of keys)if(typeof o[k]==='number'&&o[k]!==-1)o[k]=Math.round((clock-o[k])*1000)/1000;};
 rebase(s.chapter1,TIMESTAMPS.chapter1,s.chapter1?.t);rebase(s.chapter2?.C,TIMESTAMPS.chapter2,s.chapter2?.C?.t);rebase(s.chapter2?.state,TIMESTAMPS.chapter2,s.chapter2?.C?.t);
 for(const c of s.companions||[])if(c.mode==='ride'){delete c.p;delete c.pa;}
 if(s.chapter1?.state){delete s.chapter1.state.jamie;delete s.chapter1.state.sam;for(const k of ['carA','carB'])if(s.chapter1.state[k]&&typeof s.chapter1.state[k]==='object'){delete s.chapter1.state[k].x;delete s.chapter1.state[k].z;}}
 for(const f of s.prologue?.friends||[])if(f.gone)f.mode='(gone)';
 // (a companion's bike that is not there, hidden, has no meaningful place: whatever it was when last used)
 for(const c of s.companions||[])if(!c.bikeVisible){delete c.b;delete c.ba;}
 // (Chapter One's siren, silent: its doppler and muffling bookkeeping follow a parked, inactive car's last spot;
 //  they reach the audio only while it sounds)
 const sr=s.chapter1?.siren;if(sr&&!sr.active){delete sr.lastDist;delete sr.vr;delete sr.pitch;delete sr.muffle;}
 const ss=s.chapter1?.state?.siren;if(ss&&!ss.active){delete ss.pitch;delete ss.muffle;}
 return s;}

// What may still differ between a natural arrival and the selector, and why. Everything else must be equal.
// (Every one of these is shown by the DEV_RAW=1 DEV_NOIGNORE=1 listing; the reasons are below.)
export const IGNORE=[
 // Clocks: elapsed-time counters and running timers (a natural run has been playing for twenty minutes;
 // the title card's timers and dialogue gaps tick on frames that need not line up to the frame).
 /\.(t|pt|clock|card|cardT|fadeIn)$/, /\.(lastS|lastEvent|lingerT|searchT|titleT|poseT|objT|lineT|gap|nearMom|roomT|homeT|waitFrom|runT)$/,
 /^game\.captionTimer$/,
 // Chapter One's dad's errand: re-scheduled with Math.random() every time it fires (only in Chapter One's
 // friends/oak/retrace scenes); two natural playthroughs differ here too.
 /^chapter1\.dadCall$/,
 // The police cars' flashing lights: which lamp is lit this frame.
 /^chapter1\.state\.lights\./,
 // Where you happened to be and which way you faced when the previous chapter ended: depends on how it was
 // played (Chapter Two and Three keep the spot you were in when the hand-over came). Positions are checked
 // separately to be in the same place (within NEAR metres); headings are not compared. Derived from them:
 // Chapter One's distance-along-the-road tracker (lastDp, dpRate) and the siren's distance (siren.lastDist).
 /^player\.roam\.(x|z|a)$/, /^player\.walk\./, /^companions\.\d+\.(p|b)\.(x|z)$/, /^companions\.\d+\.(pa|ba|speed)$/,
 /^people\..*\.(x|z)$/, /^police\.car[AB]\.(x|z)$/, /^chapter1\.(lastDp|dpRate)$/, /^chapter1\.siren\.lastDist$/, /^game\.(lateral|speed)$/,
 // The Chapter Two searchers still walking their routes in the morning: how far along depends on how long
 // Chapter Two's dawn ran (they are hidden for the night in Chapter Three; never part of the story state).
 /^chapter2\.extra\.\d+\.(x|z|mode)$/,
 // The prologue's own lookout values, never read after you leave it: how long you lingered at the lookout
 // (finaleT, callT), the prologue's ride-section header index (currentChapter; the QA-jump path through the
 // checkpoints never rode the prologue), and which optional things you did there (bench, swing, chalk,
 // looking back to see the other bike and the fifth rider; their faint reveal). Cosmetic ambient phases.
 /^game\.(finaleT|callT|currentChapter)$/, /^prologue\.interact\./, /^prologue\.ending\./, /^prologue\.ambient\./,
];
// The Continue save is profile data, not game state: a natural arrival at Chapter One on a fresh profile has
// none; on a profile that has played before (as the selector's test session has), Start over keeps it.
const IGNORE_SAVE_UNTIL=1;
export const NEAR=15;// metres: inherited positions must be in the same place
const ignored=path=>!process.env.DEV_NOIGNORE&&IGNORE.some(re=>re.test(path));
// Timestamps (normalized to "seconds ago"), compared within `timeTol` seconds.
const STAMP=new RegExp('^(chapter1|chapter2\\.C|chapter2\\.state)\\.('+[...TIMESTAMPS.chapter1,...TIMESTAMPS.chapter2].join('|')+')$');
export function diff(a,b,path='',out=[],timeTol=1e-3){
 if(ignored(path))return out;
 // A key not created yet (a fresh page) and the same key at its reset default (null, false, 0) mean the same.
 if((a===undefined&&!b&&typeof b!=='object')||(b===undefined&&!a&&typeof a!=='object')||(a===undefined&&b===null)||(b===undefined&&a===null))return out;
 if(typeof a==='number'&&typeof b==='number'){if(Math.abs(a-b)>(STAMP.test(path)?timeTol:1e-3))out.push([path,a,b]);return out;}
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object'){if(JSON.stringify(a)!==JSON.stringify(b))out.push([path,a,b]);return out;}
 for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],path?path+'.'+k:k,out,timeTol);return out;}
// Compare a natural arrival with a selector start: normalized, documented exceptions left out. At the
// hand-over itself timestamps must agree exactly. By the opening scene they may differ by a fraction of a
// second (OPENING_TIME_TOL): the pause after the previous chapter's last spoken line (S.gap, 0.35 s by
// default) may still be counting down at the hand-over, and the new chapter's first line waits for it.
export const OPENING_TIME_TOL=.5;
export function compare(nat,dev,n,timeTol=1e-3){const A=normalize(nat),B=normalize(dev);if(n<=IGNORE_SAVE_UNTIL){delete A.save;delete B.save;}return diff(A,B,'',[],timeTol);}
// The inherited positions (ignored above) must still be in the same place.
export function far(nat,dev){const out=[],d=(p,q)=>p&&q&&Number.isFinite(p.x)&&Number.isFinite(q.x)?Math.hypot(p.x-q.x,p.z-q.z):0;
 const A=normalize(nat),B=normalize(dev);
 const pairs=[['player',A.player.roam,B.player.roam],...A.companions.flatMap((c,i)=>[['companion '+c.key+' bike',c.b,B.companions[i].b],['companion '+c.key,c.p,B.companions[i].p]])];
 for(const k of ['officer','officer2','dad','mom','neighbor'])if(A.people[k]?.visible&&B.people[k]?.visible)pairs.push([k,A.people[k],B.people[k]]);
 for(const [k,p,q] of pairs){const m=d(p,q);if(m>NEAR)out.push([k,Math.round(m*10)/10]);}return out;}

// Two selector starts of the same chapter must be identical (same code path, run the same way), apart from
// Chapter One's random errand timer, the police lights' flash pattern (which lamp is lit this frame, from a
// random phase) and the profile's Continue save.
export const strict=(a,b,n)=>{const A=normalize(a),B=normalize(b);for(const X of [A,B]){delete X.chapter1.dadCall;if(X.chapter1.state)delete X.chapter1.state.lights;}if(n<=IGNORE_SAVE_UNTIL){delete A.save;delete B.save;}
 const out=[];(function walk(x,y,path){if(typeof x==='number'&&typeof y==='number'){if(Math.abs(x-y)>1e-3)out.push([path,x,y]);return;}
  if(x===null||y===null||typeof x!=='object'||typeof y!=='object'){if(JSON.stringify(x)!==JSON.stringify(y))out.push([path,x,y]);return;}
  for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],path?path+'.'+k:k);})(A,B,'');return out;};

export async function runDevChapterChecks(T,cap){
 const {h,advance,check,metrics,element}=T;cap.off=true;
 // The natural snapshots, for the browser test to compare its selector starts against (tests/dev-chapters-browser.mjs).
 if(process.env.DEV_NATURAL_OUT){fs.mkdirSync(path.dirname(process.env.DEV_NATURAL_OUT),{recursive:true});fs.writeFileSync(process.env.DEV_NATURAL_OUT,JSON.stringify({note:'Snapshots taken in the simulation while playing naturally (tests/dev-chapters-sim.mjs).',natural:cap.natural,opened:cap.opened,scenes:cap.scenes},null,0));}
 const DT=1/30,S=()=>h.chapter.kit.S;
 // A selector start, and the snapshot at the same point a natural arrival is measured: the end of the frame
 // in which begin() ran (naturally every chapter's begin() runs inside a frame's update: Chapter One's when
 // the remount at the lookout finishes). The prologue is compared one frame after starting, like a new game.
 const devAt=n=>{const ph=h.devStart(n);if(n===0){cap.armed='dev';advance(DT);return {ph,snap:cap.shots.dev};}return {ph,snap:h.dev.snapshot()};};
 // …and, for Chapter Two and Three, again when the title card over black gives way to the opening scene.
 const openAt=n=>{devAt(n);const ph=S().phase;for(let i=0;i<900&&S().phase===ph;i++)advance(DT);const o=h.dev.snapshot();o.phase=S().phase;return o;};
 const report={};
 for(const n of [1,2,3]){
  assert.ok(cap.natural[n],'natural arrival at chapter '+n+' was recorded');
  const {ph,snap}=devAt(n),d=compare(cap.natural[n],snap,n),f=far(cap.natural[n],snap);
  const raw=diff(normalize(cap.natural[n]),normalize(snap),'',[]).length;
  report[n]={phase:ph,naturalHow:cap.how[n],differences:d,far:f};
  check(`DEV start at chapter ${n} (phase ${ph}): the same state as arriving naturally (${d.length} differences outside the documented list)`,()=>assert.deepEqual(d,[],JSON.stringify(d.slice(0,20))));
  check(`DEV start at chapter ${n}: player, companions and the people present are where a natural arrival leaves them (within ${NEAR} m)`,()=>assert.deepEqual(f,[]));
  if(n>=2){assert.ok(cap.opened[n],'natural opening of chapter '+n+' was recorded');const o=openAt(n),d2=compare(cap.opened[n],o,n,OPENING_TIME_TOL),f2=far(cap.opened[n],o);report[n].opening={phase:o.phase,differences:d2,far:f2};
   check(`DEV start at chapter ${n}: the opening scene (${o.phase}) matches the natural one too (${d2.length} differences)`,()=>{assert.equal(o.phase,cap.opened[n].phase);assert.deepEqual(d2,[],JSON.stringify(d2.slice(0,20)));assert.deepEqual(f2,[]);});}}
 // The prologue: the same as a new game on a fresh page (the title's start button).
 assert.ok(cap.natural[0],'the new game on a fresh page was recorded');
 const p0=devAt(0),d0=compare(cap.natural[0],p0.snap,0);report[0]={phase:p0.ph,naturalHow:'start',differences:d0};
 check('DEV start at the prologue: the same state as a new game on a fresh page',()=>assert.deepEqual(d0,[],JSON.stringify(d0.slice(0,20))));
 // Switching in one session, in a mixed order: each start equals that chapter's first, clean start, exactly.
 const clean={};for(const n of [0,1,2,3])clean[n]=devAt(n).snap;
 const switching=[];for(const order of [[3,1,3,0,3],[3,1,2,3,0,2,1,3]]){const leaks=[];switching.push({order:order.join('→'),leaks:leaks});for(const n of order){const d=strict(clean[n],devAt(n).snap,n);if(d.length)leaks.push({n,d:d.slice(0,10)});}
  check(`DEV switching ${order.join('→')} in one session: no state carried over (each start identical to a clean one)`,()=>assert.deepEqual(leaks,[],JSON.stringify(leaks)));}
 // After a chapter has been played for a while (bells heard, voices, tension up, a recording playing), a switch still starts clean.
 h.devStart(3);advance(1);h.jump('c3-creature-chase-start');advance(8);const busy={tension:h.tension.state.value,phase:S().phase};h.jump('recording');advance(3);
 const after=[];for(const n of [1,2,3,0]){const d=strict(clean[n],devAt(n).snap,n);if(d.length)after.push({n,d:d.slice(0,10)});}
 check(`DEV start after playing Chapter Three for a while (the creature chasing, tension ${busy.tension?.toFixed?.(2)}, a recording playing): every chapter starts clean`,()=>assert.deepEqual(after,[],JSON.stringify(after)));
 // Normal play is untouched: Start over still starts the prologue.
 element('restart').onclick?.();advance(.5);check('after the selector, Start over still begins the prologue normally',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.chapter.state.phase,'off');});
 // ---- scenes: every one starts, before its event; the important ones match a natural arrival; switching leaks nothing --
 const SC=h.dev.SCENES,scenes={starts:{},compare:{},switching:null},DTs=1/30;
 const startScene=(n,id)=>{const ph=h.devScene(n,id);advance(DTs);return {ph,snap:h.dev.snapshot()};};
 const c3=h.chapter3,st3=()=>c3.state,nScenes=Object.values(SC).flat().length;
 // (what "shortly before the event" means for the scenes that matter most: the event has not happened yet)
 const BEFORE={'3/c3-figure-reveal':()=>c3.C.fig?.seenAt==null,'3/c3-creature-reveal':()=>!c3.creature.group.visible&&!c3.C.crt&&/^lure-(walk|step|in)$/.test(c3.FG.state),
  '3/c3-creature-chase-start':()=>!c3.C.purs&&c3.CRT.state==='drop','3/c3-creature-far':()=>c3.C.purs.farSeenAt==null,'3/c3-creature-side':()=>c3.C.purs.sideAt==null&&!c3.creature.group.visible,
  '3/c3-bike-block':()=>c3.C.purs.bikeSeenAt==null,'3/c3-creature-barrier':()=>c3.C.purs.gateShutAt==null&&c3.GA.want===1,'3/c3-bike-remount':()=>h.night.state==='c1-walk',
  '3/c3-final-lure':()=>!c3.C.roadFig?.seenAt,'3/recording':()=>!c3.C.flags.recorded,'3/neighbors':()=>!c3.C.flags.okafor,
  '0/alex-departure':()=>h.friends.list.find(f=>f.key==='alex').mode==='ride','0/jamie-departure':()=>h.friends.list.find(f=>f.key==='jamie').mode==='ride'&&h.friends.list.find(f=>f.key==='alex').mode!=='ride',
  '0/sam-departure':()=>h.friends.list.find(f=>f.key==='sam').mode==='ride'&&h.friends.list.find(f=>f.key==='jamie').mode!=='ride'};
 const notBefore=[];
 for(const n of [0,1,2,3])for(const sc of SC[n]){const k=n+'/'+sc.id;let r;try{const {ph}=startScene(n,sc.id);r={ok:true,phase:ph,game:h.snapshot.state,save:h.dev.sceneSave()};if(BEFORE[k]&&!BEFORE[k]())notBefore.push(k);}catch(e){r={ok:false,err:String(e).slice(0,200)};}scenes.starts[k]=r;}
 check(`DEV scenes: all ${nScenes} scenes (Prologue ${SC[0].length}, One ${SC[1].length}, Two ${SC[2].length}, Three ${SC[3].length}) start without an error`,()=>{const bad=Object.entries(scenes.starts).filter(([,r])=>!r.ok);assert.deepEqual(bad,[]);});
 check(`DEV scenes: each of the ${Object.keys(BEFORE).length} key scenes starts shortly BEFORE its event (the reveal, RUN, the gate, the road figure, a departure… not yet happened)`,()=>assert.deepEqual(notBefore,[]));
 // Natural arrival vs DEV start, for every scene the natural run recorded: the same story state (see meaning()).
 assert.ok(Object.keys(cap.scenes).length>=20,'natural scene snapshots recorded: '+Object.keys(cap.scenes).length);
 for(const [k,nat] of Object.entries(cap.scenes)){const [n,id]=k.split('/');const {snap}=startScene(+n,id),A=meaning(nat,+n),B=meaning(snap,+n);if(+n<=IGNORE_SAVE_UNTIL&&A.save==null){delete A.save;delete B.save;}const d=diff(A,B,'',[]);scenes.compare[k]={differences:d,naturalAt:nat.at};
  if(process.env.DEV_SCENE_REPORT){console.log('SCENE',k,'nat@'+nat.at,JSON.stringify(d));continue;}
  check(`DEV scene ${k}: the same story state as playing to it naturally (phase ${A.phase}; ${d.length} differences)`,()=>assert.deepEqual(d,[],JSON.stringify(d.slice(0,20))));}
 if(process.env.DEV_SCENE_REPORT)process.exit(0);
 // Switching scenes in one session, playing a little each time; each start identical to a clean start of that scene.
 const order=[[3,'c3-creature-reveal'],[1,'oak'],[3,'c3-creature-chase-start'],[0,'alex-departure'],[2,'alex-bike'],[3,'c3-creature-reveal'],[3,'chapter3-end'],[2,'memory-reconstruction'],[3,'c3-creature-chase-start']];
 const cleanS={};for(const [n,id] of order){const k=n+'/'+id;if(cleanS[k])continue;element('restart').onclick?.();advance(.2);cleanS[k]=startScene(n,id).snap;}
 const leaks=[];for(const [n,id] of order){const s2=startScene(n,id).snap,d=strict(cleanS[n+'/'+id],s2,n);if(d.length)leaks.push({k:n+'/'+id,d:d.slice(0,8)});advance(n===3?8:4);}
 scenes.switching={order:order.map(([n,id])=>n+'/'+id).join(' → '),leaks};
 check(`DEV scene switching in one session (${scenes.switching.order}), playing on a little each time: every start identical to a clean start (no leaks)`,()=>assert.deepEqual(leaks,[],JSON.stringify(leaks)));
 element('restart').onclick?.();advance(.5);check('after the scene selector, Start over still begins the prologue normally',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.chapter.state.phase,'off');});
 report.scenes=scenes;
 metrics['dev chapter selector']=Object.fromEntries(Object.entries(report).filter(([k])=>/^\d$/.test(k)).map(([k,v])=>[k,{phase:v.phase,naturalHow:v.naturalHow,differences:v.differences.length,opening:v.opening?{phase:v.opening.phase,differences:v.opening.differences.length}:undefined}]));
 metrics['dev chapter selector'].switching={orders:switching.map(x=>({order:x.order,leaks:x.leaks.length})),afterPlaying:after.length};
 metrics['dev scene selector']={scenes:nScenes,started:Object.values(scenes.starts).filter(r=>r.ok).length,beforeTheEvent:Object.keys(BEFORE).length-notBefore.length+'/'+Object.keys(BEFORE).length,naturalComparisons:Object.fromEntries(Object.entries(scenes.compare).map(([k,v])=>[k,v.differences.length])),switching:{order:scenes.switching.order,leaks:leaks.length}};
 return report;
}

// ONLY=dev-record: write dist/dev-chapter-history.js from this natural playthrough. For each of Chapter Two
// and Three: start it from the selector WITHOUT history and record, from the natural arrival, every piece of
// carried story state that differs (Chapter One's shared state, Chapter Two's state, the flashlight, the
// creek lens, the Continue save). Clocks are not recorded; timestamps are recorded relative to their clock.
const CLOCK_STAMPS={chapter1:['sirenOff','bellAt','dadCall','samWait'],chapter2:['bellAt','warned','arrive','callAt','homeAt']};
const NOT_CARRIED=['t','pt','queue','line','pose','api','state','lookTarget','jamieAim','samAim','poiFor','timers'];
export function recordHistory(h,cap,fs,file,advance){
 const out={},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),scenes={};
 for(const n of [2,3]){h.dev.start(n,{history:false});const dev=h.dev.snapshot(),nat=cap.natural[n],H={};
  for(const [part,natObj,devObj] of [['chapter1',nat.chapter1,dev.chapter1],['chapter2',nat.chapter2.C,dev.chapter2.C]]){
   if(part==='chapter2'&&n<3)continue;const vals={},stamps={};
   for(const k of new Set([...Object.keys(natObj),...Object.keys(devObj)])){if(NOT_CARRIED.includes(k))continue;const v=natObj[k];
    if(CLOCK_STAMPS[part].includes(k)&&typeof v==='number'&&v>=0){stamps[k]=Math.round((natObj.t-v)*1000)/1000;continue;}
    if(typeof v==='string'&&(v.startsWith('companion:')||v==='{…}'))continue;
    if(!same(v,devObj[k]))vals[k]=v===undefined?null:v;}
   H[part]=vals;H[part+'Clock']=stamps;}
  if(!same(nat.player.foot.owned,dev.player.foot.owned)||!same(nat.player.foot.on,dev.player.foot.on))H.foot={owned:nat.player.foot.owned,on:nat.player.foot.on};
  if(!same(nat.props.lens,dev.props.lens))H.lens=nat.props.lens;
  if(nat.save)H.save=nat.save;
  out[n]=H;}
 // Each scene the natural run reached: start it from the selector WITHOUT its scene history and record what the
 // natural moment had that the start does not: Chapter One's story flags and who had joined you, Chapter Two's
 // story flags, the flashlight, the Continue save. (Measured as the checks measure: one frame after the start, so
// whatever the start's own first frame sets is not recorded.)
 for(const [key,nat] of Object.entries(cap.scenes)){const [n,id]=key.split('/');h.dev.startScene(+n,id,{sceneHistory:false});advance?.(1/30);const dev=h.dev.snapshot(),H={};
  const flagDiff=(a,b)=>{const o={};for(const k of new Set([...Object.keys(a||{}),...Object.keys(b||{})]))if(!same(a?.[k],b?.[k]))o[k]=a?.[k]===undefined?null:a[k];return o;};
  if(+n>=1){const f=flagDiff(nat.chapter1.flags,dev.chapter1.flags);if(Object.keys(f).length)H.chapter1Flags=f;const c1={};for(const k of ['jamieIn','samIn','alexScene','committed'])if(!same(nat.chapter1[k],dev.chapter1[k]))c1[k]=nat.chapter1[k]??null;if(Object.keys(c1).length)H.chapter1=c1;}
  if(+n>=2){const f=flagDiff(nat.chapter2.C.flags,dev.chapter2.C.flags);if(Object.keys(f).length)H.chapter2Flags=f;}
  if(+n>=1&&(!same(nat.player.foot.owned,dev.player.foot.owned)||!same(nat.player.foot.on,dev.player.foot.on)))H.foot={owned:nat.player.foot.owned,on:nat.player.foot.on};
  if(+n>=1&&nat.save)H.save=nat.save;scenes[key]=H;}
 fs.writeFileSync(file,`// GENERATED — do not edit by hand. TEMPORARY (private playtest build only).
// Recorded by \`ONLY=dev-record node tests/verify.mjs\` from a natural playthrough: what the earlier beats leave
// in the shared story state at each chapter's real beginning that the checkpoint scenes do not set.
// chapterNClock values are seconds before the chapter clock at that moment (re-based when applied).
export const HISTORY=${JSON.stringify(out,null,1)};
export const TIMESTAMPS=${JSON.stringify(CLOCK_STAMPS)};
// What the natural playthrough had at each DEV scene's moment that the scene's checkpoint start does not set
// (Chapter One's and Two's story flags, who had joined you, the flashlight, the Continue save).
export const SCENE_HISTORY=${JSON.stringify(scenes,null,1)};
`);
 return {chapters:out,scenes};}
