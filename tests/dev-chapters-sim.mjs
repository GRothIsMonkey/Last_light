// TEMPORARY (private playtest build): checks for the developer chapter selector (dist/dev-chapters.js).
// The simulation's main run plays the prologue, Chapter One, Chapter Two and Chapter Three naturally with
// inputs. installNaturalCapture() records the game's full state snapshot at the end of the frame in which
// each chapter's begin() runs during that natural run. runDevChapterChecks() then starts each chapter from
// the selector and compares the two snapshots field by field, and switches chapters repeatedly in one
// session to show nothing leaks.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';

export function installNaturalCapture(h,element){
 const cap={natural:{},opened:{},how:{},armed:null,waiting:null,off:false,shots:{}},S=()=>h.chapter.kit.S;
 const render=h.renderer.render.bind(h.renderer);
 // The frame's render follows its update: a snapshot here is "the state at the end of that frame".
 // A second snapshot is taken when the chapter's first phase gives way to the next (the title card over
 // black ends and the chapter's opening scene is set): the first moment the player sees the chapter.
 h.renderer.render=(...a)=>{
  if(cap.waiting&&S().phase!==cap.waiting.phase){cap.opened[cap.waiting.n]=h.dev.snapshot();cap.opened[cap.waiting.n].phase=S().phase;cap.waiting=null;}
  if(cap.armed!=null){const k=cap.armed;cap.armed=null;cap.shots[k]=h.dev.snapshot();if(typeof k==='number'){cap.natural[k]=cap.shots[k];if(k)cap.waiting={n:k,phase:S().phase};}}
  return render(...a);};
 // The prologue: the first frame after the title's start button on a fresh page (a new game).
 const st=element('start'),go=st.onclick;st.onclick=function(...a){const r=go.apply(this,a);if(!cap.off&&!(0 in cap.natural)){cap.armed=0;cap.how[0]='start';}return r;};
 for(const [n,api] of [[1,h.chapter],[2,h.chapter2],[3,h.chapter3]]){const b=api.begin;api.begin=function(...a){const r=b.apply(this,a);if(!cap.off&&!(n in cap.natural)){cap.armed=n;cap.how[n]=a[0]??null;}return r;};}
 return cap;
}

// Before comparing, both snapshots are normalized the same way (normalize()):
//  * timestamps measured on a chapter clock become "seconds before now" on that clock (the clocks themselves
//    count from different starting points: a natural run has been playing for twenty minutes);
//  * a companion riding a bike has no position of their own (the rider is attached to the bike; the stored
//    on-foot position is whatever it was when they last mounted), so only the bike's is compared;
//  * Chapter One's companion records under chapter1.state duplicate `companions`, which is compared instead;
//  * a parked, inactive police car's stored position is whatever it was the last time it drove (it is placed
//    when activated), so a car's position is compared only while it is active (police.carA/carB);
//  * a prologue friend who has gone (Alex) keeps the mode label they left in; it is never read again.
import {TIMESTAMPS} from '../dist/dev-chapter-history.js';
export function normalize(snap){const s=JSON.parse(JSON.stringify(snap));
 const rebase=(o,keys,clock)=>{if(!o)return;for(const k of keys)if(typeof o[k]==='number'&&o[k]!==-1)o[k]=Math.round((clock-o[k])*1000)/1000;};
 rebase(s.chapter1,TIMESTAMPS.chapter1,s.chapter1?.t);rebase(s.chapter2?.C,TIMESTAMPS.chapter2,s.chapter2?.C?.t);rebase(s.chapter2?.state,TIMESTAMPS.chapter2,s.chapter2?.C?.t);
 for(const c of s.companions||[])if(c.mode==='ride'){delete c.p;delete c.pa;}
 if(s.chapter1?.state){delete s.chapter1.state.jamie;delete s.chapter1.state.sam;for(const k of ['carA','carB'])if(s.chapter1.state[k]&&typeof s.chapter1.state[k]==='object'){delete s.chapter1.state[k].x;delete s.chapter1.state[k].z;}}
 for(const f of s.prologue?.friends||[])if(f.gone)f.mode='(gone)';
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
 if(process.env.DEV_NATURAL_OUT){fs.mkdirSync(path.dirname(process.env.DEV_NATURAL_OUT),{recursive:true});fs.writeFileSync(process.env.DEV_NATURAL_OUT,JSON.stringify({note:'Snapshots taken in the simulation while playing naturally (tests/dev-chapters-sim.mjs).',natural:cap.natural,opened:cap.opened},null,0));}
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
 const order=[3,1,2,3,0,2,1,3],leaks=[];for(const n of order){const d=strict(clean[n],devAt(n).snap,n);if(d.length)leaks.push({n,d:d.slice(0,10)});}
 check(`DEV switching ${order.join('→')} in one session: no state carried over (each start identical to a clean one)`,()=>assert.deepEqual(leaks,[],JSON.stringify(leaks)));
 // After a chapter has been played for a while (bells heard, voices, tension up, a recording playing), a switch still starts clean.
 h.devStart(3);advance(1);h.jump('close-bell');advance(8);const busy={tension:h.tension.state.value,phase:S().phase};h.jump('recording');advance(3);
 const after=[];for(const n of [1,2,3,0]){const d=strict(clean[n],devAt(n).snap,n);if(d.length)after.push({n,d:d.slice(0,10)});}
 check(`DEV start after playing Chapter Three for a while (the close bell, tension ${busy.tension?.toFixed?.(2)}, a recording playing): every chapter starts clean`,()=>assert.deepEqual(after,[],JSON.stringify(after)));
 // Normal play is untouched: Start over still starts the prologue.
 element('restart').onclick?.();advance(.5);check('after the selector, Start over still begins the prologue normally',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.chapter.state.phase,'off');});
 metrics['dev chapter selector']=Object.fromEntries(Object.entries(report).filter(([k])=>/^\d$/.test(k)).map(([k,v])=>[k,{phase:v.phase,naturalHow:v.naturalHow,differences:v.differences.length,opening:v.opening?{phase:v.opening.phase,differences:v.opening.differences.length}:undefined}]));
 metrics['dev chapter selector'].switching={order:order.join('→'),leaks:leaks.length,afterPlaying:after.length};
 return report;
}

// ONLY=dev-record: write dist/dev-chapter-history.js from this natural playthrough. For each of Chapter Two
// and Three: start it from the selector WITHOUT history and record, from the natural arrival, every piece of
// carried story state that differs (Chapter One's shared state, Chapter Two's state, the flashlight, the
// creek lens, the Continue save). Clocks are not recorded; timestamps are recorded relative to their clock.
const CLOCK_STAMPS={chapter1:['sirenOff','bellAt','dadCall','samWait'],chapter2:['bellAt','warned','arrive','callAt','homeAt']};
const NOT_CARRIED=['t','pt','queue','line','pose','api','state','lookTarget','jamieAim','samAim','poiFor','timers'];
export function recordHistory(h,cap,fs,file){
 const out={},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
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
 fs.writeFileSync(file,`// GENERATED — do not edit by hand. TEMPORARY (private playtest build only).
// Recorded by \`ONLY=dev-record node tests/verify.mjs\` from a natural playthrough: what the earlier beats leave
// in the shared story state at each chapter's real beginning that the checkpoint scenes do not set.
// chapterNClock values are seconds before the chapter clock at that moment (re-based when applied).
export const HISTORY=${JSON.stringify(out,null,1)};
export const TIMESTAMPS=${JSON.stringify(CLOCK_STAMPS)};
`);
 return out;}
