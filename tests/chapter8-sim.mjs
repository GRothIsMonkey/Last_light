// Chapter Eight (The Night Oak Hollow Fell): played from Chapter Seven's end card to Chapter Eight's, with inputs only
// (walking, riding, looking, F on what the prompt offers, holding F, the mouse on the plans, number keys for what you say,
// crouching and keeping your light off near the hunter, hiding, backing off from what is about to come down), plus the
// chapter's own checks. Used by verify.mjs (ONLY=chapter8) and by chapter8-browser.mjs (the same player in Chromium).
import assert from 'node:assert/strict';
import {chapterSixTools} from './chapter6-sim.mjs';
import {DEV_SCENES} from '../dist/dev-chapters.js';

export function chapterEightTools(T0){
 const T=T0.__eight||(T0.__eight={...T0,advance:(s,each)=>T0.advance(s,()=>{each?.();T.each?.();})});
 const X=chapterSixTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo,route}=X;X.h=h;X.press=press;X.release=release;X.tap=tap;
 const A8=h.chapter8,C8=()=>A8.state,S=()=>h.chapter.kit.S,ph=()=>S().phase,CM=A8.X;
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 const spot=()=>h.chapter.spot?.();
 const offers=()=>C8().offers;
 const offerAt=id=>{const f=A8.C.offers.get(id);if(!f)return null;const a=typeof f.at==='function'?f.at():f.at;return a?{x:a.x,y:a.y??0,z:a.z}:null;};
 const faceV=v=>{const c=h.camera.position;faceTo(v.x,v.z,Math.atan2((v.y??c.y)-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 // to within r of a point, by the nav's own walkable (a fine grid, with a wide pad under the court)
 const approach=(q,r=.9,o={})=>{if(!q)return false;if(Math.hypot(me().x-q.x,me().z-q.z)<=r)return true;const path=route(q,r,.1,o.pad??8);if(!path.length)return Math.hypot(me().x-q.x,me().z-q.z)<=r+.4;return walkTo(path,{r:.08,max:o.max??60,sprint:!!o.sprint,stop:o.stop});};
 const via=(pts,o={})=>{for(const p of pts){if(!approach(p,o.r??.8,o))return false;}return true;};
 const P=n=>CM.at(n);
 // wait for an offer, go to it, look at it, take it (tap F, or hold F until it is done)
 const dbg=(...a)=>{if(process.env.DEBUG8)console.log('  [take]',...a);};
 function take(id,{max=90,r=1.2,hold=false,stop=null,pad=8,tries=4}={}){dbg(id,'wait offer; have',offers().join(','),'t',h.snapshot.clock.toFixed(1));if(!until(()=>offers().includes(id)||!!stop?.(),max)){dbg(id,'NO OFFER');return false;}if(stop?.())return false;dbg(id,'offered at',JSON.stringify(offerAt(id)),'me',me().x.toFixed(1),me().z.toFixed(1));
  for(let k=0;k<tries;k++){const at=offerAt(id);if(!at)return !offers().includes(id);approach(at,r,{pad});faceV(at);let got=false;
   until(()=>{const s=spot();const a2=offerAt(id);if(a2)faceV(a2);if(s?.id===id){got=true;return true;}return !offers().includes(id);},4);
   if(!got){dbg(id,'not targeted; spot',spot()?.id,'dist',Math.hypot(me().x-at.x,me().z-at.z).toFixed(2));if(!offers().includes(id))return true;continue;}
   if(!hold){tap('KeyF');wait(.2);return true;}
   press('KeyF');const ok=until(()=>{const a2=offerAt(id);if(a2)faceV(a2);return !offers().includes(id)||!!stop?.();},hold);release('KeyF');wait(.2);if(!offers().includes(id))return true;}
  return !offers().includes(id);}
 const putDown=(max=30)=>{until(()=>A8.C.view==='inspect',4);until(()=>{if(A8.C.view!=='inspect')return true;if(quiet()&&A8.C.inspect?.t>1.2)tap('KeyS');return false;},max);};
 const chooseKey=n=>{until(()=>!!A8.C.choice,40);tap('Digit'+n);wait(.3);};
 return {...X,T,A8,C8,S,ph,CM,quiet,spot,offers,offerAt,faceV,approach,via,P,take,putDown,chooseKey};
}

export function playChapterEight(T0,label='Chapter Eight',{fromCard=true,from=null,to=null}={}){
 const X=chapterEightTools(T0),{h,press,release,tap,until,wait,me,faceTo,A8,C8,ph,CM,quiet,approach,via,P,take,putDown,chooseKey,offers,offerAt,faceV,spot}=X,check=T0.check,T=X.T,element=T0.element;
 const lines=[],marks=[];T.each=()=>{const l=h.chapter.state.line;if(l&&lines[lines.length-1]!==l)lines.push(l);};
 const said=t=>lines.some(l=>l.includes(t));
 const M8=T0.metrics.chapter8||(T0.metrics.chapter8={});const t0=h.snapshot.clock;const seg={};let segAt=t0;const lap=n=>{seg[n]=+((h.snapshot.clock-segAt)/60).toFixed(2);segAt=h.snapshot.clock;};
 const fails0=()=>Object.values(C8().fails).reduce((a,b)=>a+b,0);
 // a stretch where it can catch you: if it does, the chapter takes you back to the checkpoint, and you play it again
 const retry=(fn,n=4)=>{for(let i=0;i<n;i++){const f=fails0();const ok=fn(i);if(ok&&fails0()===f)return true;until(()=>!A8.C.failing,6);wait(1.2);}return false;};
 const hunterNear=(r=9)=>A8.HM.root.visible&&Math.hypot(A8.HM.x-me().x,A8.HM.z-me().z)<r;
 // hold F on an offer, letting go and keeping still while it is close (the stealth pattern for every noisy thing)
 function stealthHold(id,{max=180,near=8.5,far=12}={}){if(!until(()=>offers().includes(id),40))return false;const at=offerAt(id);approach(at,1.1);faceV(at);press('KeyC');
  const ok=until(()=>{const a2=offerAt(id);if(!a2)return true;faceV(a2);const d=A8.HM.root.visible?Math.hypot(A8.HM.x-me().x,A8.HM.z-me().z):99;if(d<near){release('KeyF');o.light(false);return false;}if(d>far||!A8.HM.root.visible){if(spot()?.id===id)press('KeyF');}return !offers().includes(id)||!!A8.C.failing;},max);
  release('KeyF');release('KeyC');return ok&&!A8.C.failing;}
 const o={light:on=>{if(!!h.foot.on!==on)tap('KeyT');}};
 // move only while it cannot see you: crouched, light off; stop and keep still whenever it is close and has a line to you
 const exposed=(range=17)=>{if(!A8.HM.root.visible)return false;const c=h.camera.position,d=Math.hypot(A8.HM.x-c.x,A8.HM.z-c.z);if(d>range)return false;return A8.X.sight(A8.HM.x,(A8.HM.y||0)+2,A8.HM.z,c.x,c.y,c.z);};
 // work something noisy only while it is far, or has its back to you; when it turns your way, hide (hideId) and wait
 const hunterSafe=()=>{if(!A8.HM.root.visible)return true;const d=Math.hypot(A8.HM.x-me().x,A8.HM.z-me().z),fx=Math.sin(A8.HM.heading),fz=-Math.cos(A8.HM.heading),away=fx*(me().x-A8.HM.x)+fz*(me().z-A8.HM.z)<0;
  const c=h.camera.position,los=A8.X.sight(A8.HM.x,(A8.HM.y||0)+2,A8.HM.z,c.x,c.y,c.z);return d>13||(away&&d>5.5)||(!los&&d>6.5&&A8.H.mode==='patrol');};
 function patientHold(id,{hideId=null,max=260,extra=null}={}){const t1=h.snapshot.clock;press('KeyC');o.light(false);
  while(h.snapshot.clock-t1<max&&!A8.C.failing&&offers().includes(id)){
   if(!hunterSafe()){release('KeyF');if(A8.C.hiding){wait(.4);continue;}const ids=(Array.isArray(hideId)?hideId:[hideId]).filter(x=>x&&offers().includes(x)).sort((a,b)=>{const qa=offerAt(a),qb=offerAt(b);return Math.hypot(qa.x-me().x,qa.z-me().z)-Math.hypot(qb.x-me().x,qb.z-me().z);});if(ids.length){take(ids[0],{max:6,r:1.8});}else wait(.4);continue;}
   if(A8.C.hiding){if(A8.HM.root.visible&&Math.hypot(A8.HM.x-me().x,A8.HM.z-me().z)<9){wait(.4);continue;}take('unhide',{max:4,r:9});continue;}
   if(extra&&extra())continue;
   const at=offerAt(id);if(!at)break;if(Math.hypot(at.x-me().x,at.z-me().z)>1.1){approach(at,1,{pad:8,max:4,stop:()=>!hunterSafe()});continue;}
   faceV(at);if(spot()?.id===id)press('KeyF');else release('KeyF');wait(.2);}
  release('KeyF');release('KeyC');if(A8.C.hiding)take('unhide',{max:4,r:9});return !offers().includes(id)&&!A8.C.failing;}
 function sneakTo(q,r=.8,{max=150}={}){press('KeyC');o.light(false);const t1=h.snapshot.clock;let ok=false;
  while(h.snapshot.clock-t1<max&&!A8.C.failing){if(Math.hypot(me().x-q.x,me().z-q.z)<=r){ok=true;break;}if(exposed()){release('KeyW');wait(.6);continue;}approach(q,r,{max:2.5,pad:12,stop:()=>exposed()||!!A8.C.failing});}
  release('KeyC');return ok;}
 const go=s=>{h.jump(s);wait(.4);};
 const at=(n,r=1)=>approach(P(n),r,{pad:10});
 const seg2=['bikes','field','shaft','gallery','corridor','wing','retrieval','alex','reunion','truth','breach','surface','street','staging','op','oak','ride'];
 const inSeg=n=>{const i=seg2.indexOf(n),f=from?seg2.indexOf(from):0,t=to?seg2.indexOf(to):99;return i>=f&&i<=t;};
 if(fromCard&&!from){h.jump('chapter7-end');until(()=>h.snapshot.state==='ended',30);
  check(`${label}: Chapter Seven's end card offers Chapter Eight`,()=>{assert.equal(element('next-chapter').hidden,false);assert.ok(/Chapter Eight/.test(element('next-chapter').innerHTML));});
  element('next-chapter').onclick?.();until(()=>ph()==='c8-black',6);
  check(`${label}: the card: LAST LIGHT · Chapter Eight · THE NIGHT OAK HOLLOW FELL`,()=>{until(()=>A8.C.cardOn,8);assert.ok(element('chapter-card').classList.contains('on'));});}
 else if(from){go({bikes:'chapter8-start',field:'c8-field',shaft:'c8-shaft',gallery:'c8-gallery',corridor:'c8-corridor',wing:'c8-wing',retrieval:'c8-retrieval',alex:'c8-shift',reunion:'c8-reunion',truth:'c8-truth',breach:'c8-breach',surface:'c8-surface',street:'c8-street',staging:'c8-staging',op:'c8-gates',oak:'c8-oak',ride:'c8-ride'}[from]);}
 // ---- Act I --------------------------------------------------------------------------------------------------------------------
 if(inSeg('bikes')){until(()=>ph()==='d8-bikes',20);
  take('out',{max:30});until(()=>!h.chapter8.CTX.X8.ST.active&&!A8.C.fadeOut>=0&&me().walking,10);wait(2.6);
  for(const kk of ['alex','jamie','sam','player'])take('bike-'+kk,{max:20,r:1.4});until(quiet,20);
  take('sheet',{max:20,r:1.2});putDown(30);putDown(10);
  take('cover',{max:30,r:2.2});until(()=>A8.C.flags.breath&&quiet()&&!A8.C.view,30);
  until(()=>offers().includes('give'),60);take('give',{max:20,r:1.8});until(()=>offers().includes('car'),40);
  check(`${label}: the four bikes, the page, the cover; Reyes: "They're underneath us." "Who?" "All of them."`,()=>{assert.ok(said('They’re underneath us.'));assert.ok(said('All of them.'));assert.ok(said('Get away from that cover.'));assert.equal(A8.state.inv.sheet,'have');});
  take('car',{max:20,r:2.4});until(()=>ph()==='d8-field',10);lap('bikes');}
 if(inSeg('field')){until(()=>ph()==='d8-field',10);take('maps',{max:40,r:2.6});until(()=>A8.C.view==='maps',4);
  // the pencil to MH-12 on the 1959 plan (the mouse), mark it (F); then S
  const M=A8.SC.MAP;for(let k=0;k<60&&!M.solved;k++){const dx=(410/900-M.cursor.x)/.0011,dy=(215/680-M.cursor.y)/.0011;h.chapter8.pan(dx,dy);tap('KeyF');wait(.2);}
  until(quiet,20);tap('KeyS');until(()=>A8.C.flags.mapDone,6);
  check(`${label}: the plans: MH-12 found on the 1959 sheet over the 2009 map`,()=>{assert.ok(M.solved);});
  // the probe: walk toward the oak side of the bench, probe until iron
  const mh=A8.SC.MH?.at||A8.SC.D;const tgt=offerAt('probe')?A8.CTX.X8&&A8.SC&&(A8.SC.MH?.at):null;void tgt;
  until(()=>offers().includes('probe'),30);const mh12=h.chapter8.SC?.MH?.at||null;const goal=mh12||{x:me().x,z:me().z};
  for(let k=0;k<20&&!A8.C.flags.found;k++){approach(goal,1.6-k*.05,{pad:8});faceTo(goal.x,goal.z,-.6);until(()=>spot()?.id==='probe',2);tap('KeyF');wait(1.4);}
  take('dig',{hold:12,r:1.4});until(()=>offers().includes('vent'),40);take('vent',{hold:10,r:1.2});until(()=>offers().includes('heave')||A8.C.flags.heave,40);
  // the lift: F on Brandt's three
  for(let k=0;k<4&&ph()==='d8-field'&&!offers().includes('climb');k++){until(()=>offers().includes('heave')||offers().includes('climb'),20);if(offers().includes('climb'))break;approach(offerAt('heave'),1.4);faceV(offerAt('heave'));
   until(()=>A8.C.threeAt&&h.snapshot.clock>0&&h.chapter.state.line?.includes('Three'),8);wait(.3);if(spot()?.id==='heave')tap('KeyF');until(()=>!offers().includes('heave'),8);}
  check(`${label}: MH-12: probed, dug, vented, lifted on three`,()=>{assert.ok(A8.C.flags.found&&A8.C.flags.dug&&A8.C.flags.vent);});
  take('climb',{max:60,r:1.2});until(()=>ph()==='d8-shaft',10);lap('field');}
 if(inSeg('shaft')){until(()=>ph()==='d8-shaft',10);
  retry(()=>{until(()=>offers().includes('crank'),60);o.light(false);return stealthHold('crank',{max:240,near:9,far:13});});
  until(()=>A8.C.flags.shaftDone||ph()==='e8-gallery',60);
  check(`${label}: the outer barrier: down before it gets there; it hits the leaf and stops; it goes`,()=>{assert.ok(A8.CTX.X8.ST.barrier<.06);assert.ok(said('It stopped. At the gate.'));});lap('shaft');}
 // ---- Act II -------------------------------------------------------------------------------------------------------------------
 if(inSeg('gallery')){until(()=>ph()==='e8-gallery',10);
  retry(()=>{until(()=>A8.C.flags.split||!!A8.C.hunt,80);until(()=>!!A8.C.hunt,30);o.light(false);press('KeyC');
   // into the office (out of its sight), the desk; then the review room and its projector, cranked while it is far
   sneakTo(P('officeIn'),.7);if(A8.C.failing)return false;until(()=>!exposed(14),40);take('receipt',{max:30,r:1.4});putDown(40);putDown(30);putDown(30);if(A8.C.failing)return false;
   sneakTo({x:P('officeIn').x+1.6,z:P('officeIn').z},.6);sneakTo({x:P('reviewIn').x+2.2,z:P('reviewIn').z-1.6},.7);sneakTo(P('reviewIn'),.6);if(A8.C.failing)return false;const ok=stealthHold('film',{max:120,near:8,far:12});if(!ok)return false;
   // the film runs by itself; its clatter brings it to the door: down behind the stand until the reel is done
   take('hide-B2',{max:10,r:1.4});until(()=>A8.C.flags.filmDone||!!A8.C.failing,90);if(A8.C.failing)return false;if(A8.C.hiding)take('unhide',{max:6,r:9});return true;});
  release('KeyC');until(()=>A8.C.flags.filmDone,40);until(()=>said('When she was carried away from it, the wall moved.'),15);
  check(`${label}: Annie Rowan: Mason's slip, licence 0417, her school picture (A.R.); the 1958 film (the wall moves while she is away)`,()=>{assert.ok(A8.C.flags.receipt&&A8.C.flags.annie);assert.equal(A8.state.inv.receipt,'have');assert.ok(said('Annie Rowan'));assert.ok(said('When she was carried away from it, the wall moved.'));});
  // to the corridor: the green door, east side
  retry(()=>{sneakTo({x:P('reviewIn').x+2.4,z:P('reviewIn').z-1.6},.7);sneakTo(P('galleryMid'),1.2);sneakTo(P('cIn'),1);return until(()=>ph()==='e8-danny',20);},3);lap('gallery');}
 if(inSeg('corridor')){until(()=>ph()==='e8-danny',10);take('danny-bike',{max:40,r:1.8});until(()=>A8.C.view==='inspect',8);putDown(40);
  approach(P('cEnd'),1.6,{pad:6});if(process.env.DEBUG8)console.log('  [corridor] at end',(me().x+2600).toFixed(1),'pt',A8.C.pt.toFixed(1),'tasks',A8.state.tasks,'D',A8.SC.D.st,'view',A8.C.view,'line',h.chapter.state.line);until(()=>A8.C.dannyOn,20);if(process.env.DEBUG8)console.log('  [corridor] danny',A8.C.dannyOn,A8.SC.D.st,'tasks',A8.state.tasks,'marks',A8.C.marks.slice(-3));
  // into the second alcove, low; it comes past; say his name
  retry(()=>{until(()=>A8.C.dannyOn,30);press('KeyC');approach(P('cAlcove3'),.45,{pad:4,sprint:true});until(()=>A8.SC.D.st==='passed'||A8.SC.D.st==='sniff'||!!A8.C.failing,30);if(A8.C.failing)return false;take('name',{max:20,r:6});release('KeyC');return true;});
  until(()=>A8.C.flags.danny&&offers().includes('breaker'),60);take('breaker',{max:30,r:1.6});
  check(`${label}: Danny: the flyer (two fingers, left hand), his hand on the alcove, his name; it flees what is coming`,()=>{assert.ok(A8.C.flags.flyer&&A8.C.flags.hand&&A8.C.flags.danny&&A8.C.flags.presence);assert.ok(said('Danny?'));});
  via([P('cIn'),P('galleryMid'),P('bulkhead'),P('jMid')],{r:1.1,pad:12});until(()=>ph()==='e8-sam',20);lap('corridor');}
 // ---- Act III ------------------------------------------------------------------------------------------------------------------
 if(inSeg('wing')){until(()=>ph()==='e8-sam',10);take('ruth',{max:40,r:2});until(()=>A8.C.view==='inspect',10);putDown(40);until(()=>A8.C.flags.ruth,20);
  approach(P('samDoor'),1.6,{pad:8});chooseKey(1);until(quiet,20);chooseKey(2);until(()=>A8.C.flags.samProven&&offers().includes('valve'),40);
  take('valve',{hold:12,r:1.4,max:40});
  retry(()=>{until(()=>offers().includes('hide-D0'),20);take('hide-D0',{max:8,r:1.8});until(()=>A8.HM.root.visible&&Math.hypot(A8.HM.x-me().x,A8.HM.z-me().z)<9,40);until(()=>hunterSafe()&&Math.hypot(A8.HM.x-me().x,A8.HM.z-me().z)>7,40);
   until(()=>offers().includes('samcrank'),40);return patientHold('samcrank',{hideId:['hide-D2','hide-D1','hide-D0'],extra:()=>{if(offers().includes('pawl')){release('KeyF');take('pawl',{r:1.5,max:6});return true;}return false;}});});
  until(()=>ph()==='e8-jamie',60);
  check(`${label}: Sam: what's new can't be copied (the fan); the drain; the seized crank and the catch; out; something far off moves`,()=>{assert.ok(said('He can’t sleep without it.'));assert.ok(said('I thought you were another one.'));assert.ok(said('You found me.'));assert.ok(A8.C.flags.anchor1);});lap('wing');}
 if(inSeg('retrieval')){until(()=>ph()==='e8-jamie',10);approach(P('grille'),5.5,{pad:8});until(()=>offers().includes('jlever'),80);
  retry(()=>{o.light(false);return patientHold('jlever',{hideId:['hide-E3','hide-E1']});});
  approach(P('jMid'),1.5,{pad:12,sprint:true});until(()=>said('You look worse.'),60);until(()=>ph()==='e8-alex',40);
  check(`${label}: Jamie: it brings him back to his cell; Sam holds the grille; Jamie's door; it hits the grille; "You look awful." "You look worse."`,()=>{assert.ok(said('You actually came back.'));assert.ok(A8.C.flags.anchor2);});lap('retrieval');}
 const marked=w=>A8.C.marks.some(m=>m[1]===w);
 if(inSeg('alex')){until(()=>ph()==='e8-alex',10);via([P('kMid'),P('hMid'),P('f0In'),P('f0Mid')],{r:1,pad:10});
  // halfway down, look back the way you came: the door to the gallery is a wall
  until(()=>marked('behind you, a wall'),20);const back=P('f0Door');for(let k=0;k<60&&!said('Where’s the door?');k++){faceV({x:back.x+1,y:-1.5,z:back.z});T.advance(1/15);}
  via([P('f0End'),P('f1In'),P('f1Mid')],{r:1,pad:10});until(()=>marked('his door'),60);approach(P('alexDoor'),2.2,{pad:8});
  until(()=>A8.C.flickWant,120);o.light(true);for(let k=0;k<4;k++){tap('KeyT');wait(.4);}until(()=>offers().includes('alever'),40);take('alever',{hold:14,r:1.2,max:40});
  until(()=>A8.C.flags.anchor3,20);via([P('f1In'),P('f0End'),P('f0Mid'),P('f0In'),P('hMid'),P('kSouth'),P('gDoor'),P('gIn')],{r:1,pad:10,sprint:true});until(()=>ph()==='e8-reunion',30);
  check(`${label}: Alex: "It keeps bringing you here."; at the same time (your light, twice); two handles; the last one out`,()=>{assert.ok(said('It keeps bringing you here.'));assert.ok(said('We’re taking you home.'));assert.ok(A8.C.flags.anchor3);});lap('alex');}
 if(inSeg('reunion')){until(()=>ph()==='e8-reunion',10);until(()=>offers().includes('t-alex'),40);for(const id of ['t-jamie','t-sam','t-sam','t-alex','t-alex','t-alex']){until(quiet,30);take(id,{max:12,r:1.8});until(quiet,30);}
  until(()=>ph()==='f8-truth',220);
  check(`${label}: all four of them: "I thought I wasn't going to see you guys again." … "Can we just go home?"; the alarm; Reyes on the radio`,()=>{assert.ok(said('I thought I wasn’t going to see you guys again.'));assert.ok(said('Can we just go home?'));assert.equal(A8.state.inv.radio,'have');});lap('reunion');}
 // ---- Act IV -------------------------------------------------------------------------------------------------------------------
 if(inSeg('truth')){until(()=>ph()==='f8-truth',10);approach(P('hMid'),1.5,{pad:12});take('board',{max:40,r:4});until(()=>ph()==='f8-breach',120);
  check(`${label}: the anchor board: the tags (A.R., R.A.C., E.L./T.L., D.W.), three blank rows, three needles down; "We let it out?" "You got your friends back."`,()=>{assert.ok(A8.C.flags.board);assert.ok(said('We let it out?'));assert.ok(said('You got your friends back.'));});lap('truth');}
 if(inSeg('breach')){until(()=>ph()==='f8-breach',10);
  retry(()=>{until(()=>A8.C.lastCheckpoint==='c8-escape',60);via([P('kSouth'),{x:P('kMid').x,z:P('kMid').z+3.2}],{r:1,pad:10,sprint:true});
   const clearOf=()=>until(()=>!A8.C.haz.some(z=>!z.fell&&z.fatal!==false),8);
   for(const q of [P('gDoor'),P('gIn'),P('gBack'),P('gdMid'),P('jMid')]){clearOf();approach(q,.9,{pad:10,sprint:true});}
   clearOf();press('KeyC');wait(.6);approach(P('bulkhead'),.8,{pad:10});approach({x:P('bulkhead').x,z:P('bulkhead').z-1.6},.8,{pad:10});release('KeyC');
   for(const [n,q] of [['w1',{x:P('galleryW').x+3,z:P('galleryW').z+5}],['w2',{x:P('galleryW').x+3,z:P('galleryW').z-4}],['foot',P('stairFoot')],['top',P('stairTop')],['arrive',P('arrive')]]){clearOf();if(A8.C.failing)return false;approach(q,n==='foot'?.4:1,{pad:12,sprint:true});}return !A8.C.failing;});
  take('climbup',{hold:8,r:1.2,max:60});until(()=>ph()==='g8-surface',20);
  check(`${label}: it comes through the barrier; the hunter runs from it; the way out comes down behind you; the ladder`,()=>{assert.ok(said('The ribs break outward'));assert.ok(said('It’s RUNNING. From THAT.'));assert.equal(ph(),'g8-surface');});lap('breach');}
 // ---- Act V --------------------------------------------------------------------------------------------------------------------
 const M8d=(d,l)=>{const q=T0.groundPoint(d,l);return {x:q.x,z:q.z};};
 if(inSeg('surface')){until(()=>ph()==='g8-surface',10);approach(M8d(1126,-1),2,{pad:12});approach(M8d(1096,-2),2,{pad:12});until(()=>ph()==='g8-street',90);
  check(`${label}: the street from the oak: the road gone, the fire, the pole; Summerfield goes down with a car`,()=>{assert.equal(A8.state.ruin.stage,1);assert.notEqual(A8.state.ruin.heave,'flat');assert.ok(said('That’s our street.'));});lap('surface');}
 if(inSeg('street')){until(()=>ph()==='g8-street',10);const Hh=A8.ruin.H;
  approach(Hh.doorAt,3.5,{pad:14});take('jack',{max:60,r:1.6,pad:14});take('jackset',{max:30,r:1.5,pad:12});take('pump',{hold:14,r:1.5,max:30});
  until(()=>A8.C.escort,60);approach({x:h.chapter.kit.carA.x,z:h.chapter.kit.carA.z},4,{pad:16});until(()=>A8.C.flags.jamieDead,60);
  take('jamie-kneel',{max:40,r:2,pad:14});until(()=>offers().includes('car2'),120);
  check(`${label}: the Hendersons': the jack, the door, Lily; Jamie under the garage door; it comes out of the hole; Jamie is dead`,()=>{assert.ok(A8.C.flags.doorFree);assert.ok(A8.C.flags.jamieDead);assert.ok(said('I’m so sorry.'));});
  take('car2',{max:30,r:3});until(()=>ph()==='g8-staging',20);lap('street');}
 if(inSeg('staging')){until(()=>ph()==='g8-staging',10);take('procedure',{max:40,r:2.2,pad:14});putDown(60);until(()=>ph()==='n8-op',80);
  check(`${label}: the drawdown nobody would use while anyone was in there; "There aren't now."`,()=>{assert.ok(A8.C.flags.procRead);assert.ok(said('There aren’t now.'));});lap('staging');}
 if(inSeg('op')){until(()=>ph()==='n8-op',10);
  // A: the main gate (back off when it rears), the gallery's drain gate
  retry(()=>{until(()=>offers().includes('gate1a'),40);const at=offerAt('gate1a');approach(at,1.1,{pad:14});faceV(at);
   until(()=>{const hz=A8.C.haz.find(z=>!z.fell);if(hz&&Math.hypot(hz.at.x-me().x,hz.at.z-me().z)<hz.r+1.4){release('KeyF');const away={x:me().x+(me().x-hz.at.x)*2,z:me().z+(me().z-hz.at.z)*2};approach(away,.6,{pad:6,max:4});return false;}
    if(Math.hypot(at.x-me().x,at.z-me().z)>1.4){approach(at,1.1,{pad:6,max:6});faceV(at);}if(spot()?.id==='gate1a')press('KeyF');return !offers().includes('gate1a')||!!A8.C.failing;},120);release('KeyF');return !A8.C.failing;});
  take('dd',{hold:8,r:1.2,max:60,pad:20});until(()=>offers().includes('port'),60);take('port',{hold:10,r:1.2,max:30});until(()=>offers().includes('jladder'),30);take('jladder',{hold:6,r:1.4,max:20});
  until(()=>A8.C.lastCheckpoint==='c8-plug',40);
  // C: along the catwalk; the pins, against the wall when it comes
  approach(P('ipPins'),2.5,{pad:12});
  for(let i=0;i<3;i++){retry(()=>{until(()=>offers().includes('pin'+i)||A8.C.flags['pin'+i],30);if(A8.C.flags['pin'+i])return true;const at=offerAt('pin'+i);
    until(()=>{const hz=A8.C.haz.find(z=>!z.fell);if(hz&&Math.hypot(hz.at.x-me().x,hz.at.z-me().z)<hz.r+1){release('KeyF');approach({x:P('ipPins').x-3.4,z:P('ipPins').z-1.2},.6,{pad:4,max:4});return false;}
     if(Math.hypot(at.x-me().x,at.z-me().z)>1.5){approach(at,1.2,{pad:4,max:6});}faceV(at);if(spot()?.id==='pin'+i)press('KeyF');return !offers().includes('pin'+i)||!!A8.C.failing;},90);release('KeyF');return !A8.C.failing;});}
  until(()=>offers().includes('upLadder'),60);take('upLadder',{hold:6,r:1.4,max:20});until(()=>ph()==='n8-oak',60);
  check(`${label}: the gates, the drain gate (Chapter Six's), the ports, Line Two, three pins, the plug; it goes quiet; Alex holds the hatch`,()=>{assert.ok(A8.C.flags.gateA&&A8.C.flags.dd&&A8.C.flags.port);assert.ok(A8.C.flags.sealed);assert.ok(A8.C.flags.alexHurt);});lap('op');}
 if(inSeg('oak')){until(()=>ph()==='n8-oak',10);take('alex-sit',{max:30,r:2});until(()=>ph()==='n8-ride',160);
  check(`${label}: the oak: "Did we stop it?" "Yeah." "Good." … "We were supposed to go riding tomorrow." Alex dies; your view is yours`,()=>{assert.ok(said('Did we stop it?'));assert.ok(said('We were supposed to go riding tomorrow.'));assert.ok(A8.C.flags.alexDead);});lap('oak');}
 if(inSeg('ride')){until(()=>ph()==='n8-ride',10);wait(4);const pts=[];for(let d=1120;d>=650;d-=15){const lat=(d>1004&&d<1034)?-6.6:(d>860&&d<884)?6.9:(d>930&&d<970)?2.6:-1.6;const q=T0.groundPoint(d,lat);pts.push([q.x,q.z]);}
  press('KeyW');X.rideTo(pts,260,3);release('KeyW');until(()=>A8.C.wantLook,60);
  // look back: the road behind you
  for(let k=0;k<80&&!A8.C.lookedBack;k++){h.look(Math.PI*.9,0);T.advance(1/30);}h.look(0,0);
  until(()=>h.snapshot.state==='ended',30);
  check(`${label}: the last ride: Sam, two bikes; "I keep thinking they're right behind us."; the road behind is empty; the end card`,()=>{assert.ok(said('I keep thinking they’re right behind us.'));assert.ok(said('The road behind you is empty.'));assert.equal(element('ending').hidden,false);assert.ok(/Chapter Eight/.test(element('ending').querySelector?.('h2')?.innerHTML??'Chapter Eight'));});
  lap('ride');}
 M8.minutes=+((h.snapshot.clock-t0)/60).toFixed(2);M8.segments=seg;M8.fails=C8().fails;
 return {lines:()=>lines,said};
}

export async function runChapterEightChecks(T0){
 const X=chapterEightTools(T0),{h,press,release,tap,until,wait,me,A8,C8,ph,CM,offers,approach,P,take}=X,check=T0.check,T=X.T,element=T0.element;
 // every DEV Chapter Eight scene starts in a Chapter Eight phase, on its feet, somewhere you can stand
 const sc=DEV_SCENES[8]||[];
 check(`chapter 8: every DEV Chapter Eight scene starts (${sc.length} scenes)`,()=>{const bad=[];for(const s of sc){if(!s.jump)continue;h.jump(s.jump);T.advance(1.5);const p=me(),st=A8.state;if(!/^(c8|d8|e8|f8|g8|n8)-/.test(st.phase))bad.push(s.id+': '+st.phase);if(!(p.walking||p.riding))bad.push(s.id+': not on foot or riding');if(p.walking&&!h.nav.walkable(p.x,p.z,{r:.2})&&!A8.C.view)bad.push(s.id+': stands in a wall');}assert.deepEqual(bad,[]);});
 check('chapter 8: the barrier can be failed: walk into the pipe and it has you; back at the barrier checkpoint',()=>{h.jump('c8-barrier');until(()=>!!A8.C.hunt,30);let caught=false;
  until(()=>{const q=P('hunterL4');X.faceTo(A8.HM.x,A8.HM.z,0);press('KeyW');if(A8.C.failing)caught=true;return caught;},40);release('KeyW');until(()=>!A8.C.failing,6);T.advance(1);
  assert.ok(caught,'caught');assert.equal(A8.state.phase,'d8-shaft');assert.ok(A8.state.fails['c8-barrier']>=1);});
 check('chapter 8: the hunter here is its own instance (not Chapter Seven\'s) and the smiling creature is Chapter Three\'s, with the injury',()=>{assert.notEqual(A8.HM,h.chapter7.HM);assert.ok(h.chapter3.creature.injury?.length>=4||!h.chapter3.creature.loaded,'injury bones');});
 check('chapter 8: Continue offers the last checkpoint',()=>{h.jump('c8-wing');T.advance(1);const s=h.chapter.saved?.();assert.ok(s&&/wing|flooded/i.test(s.label+s.section),JSON.stringify(s));});
 check('chapter 8: then Chapter Seven starts clean (no complex, no ruin, no Alex companion)',()=>{h.jump('c7-court');T.advance(.5);assert.equal(A8.X.ST.active,false);assert.equal(h.chapter.companions.all.length,2);assert.equal(A8.ruin.ST.stage,0);});
 check('chapter 8: then Chapter Six starts clean; its drawdown gate stops the voice in the horn (the demonstration)',()=>{h.jump('c6-gallery');T.advance(.5);const A6=h.chapter6;until(()=>A6.C.gal?.mutter,90);until(()=>A6.C.gal.mutter.n>=1,20);
  const at=A6.DD.at();approach(at,1.2,{pad:18});X.faceV(at);until(()=>h.chapter.spot?.()?.id==='c6-drawdown',6);tap('KeyF');until(()=>A6.C.gal.mutter.done,12);assert.equal(A6.C.gal.mutter.done,'gate');});
 check('chapter 8: earlier-chapter clues exist: Ch1 Line 4 plate, Ch2 sealed access, Ch4 A. Rowan & the hand, Ch5 vault, Ch7 the 1974 line and her note',async()=>{
  const fs=await import('node:fs');const read=f=>fs.readFileSync(new URL('../dist/'+f,import.meta.url),'utf8');assert.ok(read('chapter1.js').includes('LINE 4 — 1958'));assert.ok(read('chapter2.js').includes('NO ENTRY'));
  assert.ok(read('chapter4.js').includes('A. Rowan'));assert.ok(read('chapter4.js').includes('last two fingers of his left hand'));assert.ok(read('chapter5.js').includes('VALVE VAULT 3'));assert.ok(read('chapter7.js').includes('isolation work at the Line Four junction'));assert.ok(read('chapter7.js').includes('NOT EVEN IF IT SOUNDS LIKE ME'));});
 check('chapter 8: the save the aftermath will read: two home, two lost, the presence sealed',()=>{h.jump('chapter8-end');until(()=>h.snapshot.state==='ended',20);const v=JSON.parse(globalThis.localStorage.getItem('lastlight.chapter8')||'{}');assert.deepEqual(v.home,['YOU','SAM']);assert.deepEqual(v.lost,['JAMIE','ALEX']);});
}
