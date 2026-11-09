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
 // (walking a path: stuck a moment against someone standing in the next step, or a corner, it steps aside and goes on, as you would)
 function walk8(pts,{r=.08,max=60,sprint=false,stop=null}={}){let i=0,last=me(),lt=h.snapshot.clock,side=0;
  const ok=until(()=>{if(stop?.())return true;const p=me();while(i<pts.length&&Math.hypot(pts[i][0]-p.x,pts[i][1]-p.z)<Math.max(r,.12))i++;if(i>=pts.length)return true;const t=h.snapshot.clock;
   if(Math.hypot(p.x-last.x,p.z-last.z)>.25){last=p;lt=t;}
   else if(t-lt>1.2){side++;const a=Math.atan2(pts[i][0]-p.x,-(pts[i][1]-p.z))+(side%2?1.5:-1.5);faceTo(p.x+Math.sin(a)*2,p.z-Math.cos(a)*2);press('KeyW');T.advance(.4);last=me();lt=h.snapshot.clock;}
   faceTo(pts[i][0],pts[i][1]);press('KeyW');if(sprint)press('ShiftLeft');return false;},max);release('KeyW');release('ShiftLeft');T.advance(.3);return ok;}
 const approach=(q,r=.9,o={})=>{if(!q)return false;if(Math.hypot(me().x-q.x,me().z-q.z)<=r)return true;const path=route(q,r,.1,o.pad??8);if(!path.length)return Math.hypot(me().x-q.x,me().z-q.z)<=r+.4;return walk8(path,{r:.08,max:o.max??60,sprint:!!o.sprint,stop:o.stop});};
 const via=(pts,o={})=>{for(const p of pts){if(!approach(p,o.r??.8,o))return false;}return true;};
 const P=n=>CM.at(n);
 // wait for an offer, go to it, look at it, take it (tap F, or hold F until it is done)
 const dbg=(...a)=>{if(process.env.DEBUG8)console.log('  [take]',...a);};
 function take(id,{max=90,r=1.2,hold=false,stop=null,pad=8,tries=4}={}){dbg(id,'wait offer; have',offers().join(','),'t',h.snapshot.clock.toFixed(1));if(!until(()=>offers().includes(id)||!!stop?.(),max)){dbg(id,'NO OFFER');return false;}if(stop?.())return false;dbg(id,'offered at',JSON.stringify(offerAt(id)),'me',me().x.toFixed(1),me().z.toFixed(1));
  for(let k=0;k<tries;k++){const at=offerAt(id);if(!at)return !offers().includes(id);approach(at,r,{pad});faceV(at);let got=false;
   until(()=>{const s=spot();const a2=offerAt(id);if(a2)faceV(a2);if(s?.id===id){got=true;return true;}return !offers().includes(id);},4);
   if(!got){dbg(id,'not targeted; spot',spot()?.id,'dist',Math.hypot(me().x-at.x,me().z-at.z).toFixed(2),'spots8',A8.spots().map(s=>s.id).join(','),'view',A8.C.view,'pose',!!A8.C.pose,'fade',A8.C.fadeOut,'lock',h.roam?.walkLock,'hiding',A8.C.hiding,'duck',(A8.C.duck||[]).length,'walkable',h.nav.walkable(me().x,me().z,{r:.3}),'route',X.route?.(at,r,.1,pad)?.length,'crouch',(h.foot?.crouch??0).toFixed(2),'kit',(h.chapter.spots?.()||[]).map(s=>s.id).join(','));if(!offers().includes(id))return true;continue;}
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
 else if(from){go({bikes:'chapter8-start',field:'c8-field',shaft:'c8-shaft',gallery:'c8-gallery',corridor:'c8-corridor',wing:'c8-wing',retrieval:'c8-retrieval',alex:'c8-shift',reunion:'c8-reunion',truth:'c8-truth',breach:'c8-breach',surface:'c8-surface',street:'c8-hendersons',staging:'c8-staging',op:'c8-gates',oak:'c8-oak',ride:'c8-ride'}[from]);}
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
 if(inSeg('gallery')){until(()=>ph()==='e8-gallery',10);const g0=h.snapshot.clock,dbgG=w=>{if(process.env.DEBUG8)console.log('  [gallery]',w,'t',((h.snapshot.clock-g0)/60).toFixed(2),'min; hunter',A8.H.mode,A8.HM.root.visible,'ck',A8.C.lastCheckpoint,'flags',['receipt','film','filmDone','drawnOff'].filter(f=>A8.C.flags[f]).join(','),'marks',A8.C.marks.slice(-2).map(m=>m[1]).join(' | '));};
  retry(()=>{until(()=>A8.C.flags.split||!!A8.C.hunt,80);until(()=>!!A8.C.hunt,30);o.light(false);press('KeyC');
   // into the office (out of its sight), the desk; then the review room and its projector, cranked while it is far
   dbgG('hunt on');sneakTo(P('officeIn'),.7);dbgG('in office');if(A8.C.failing)return false;until(()=>!exposed(14),40);take('receipt',{max:30,r:1.4});putDown(40);putDown(30);putDown(30);dbgG('receipt');if(A8.C.failing)return false;
   sneakTo({x:P('officeIn').x+1.6,z:P('officeIn').z},.6);sneakTo({x:P('reviewIn').x+2.2,z:P('reviewIn').z-1.6},.7);sneakTo(P('reviewIn'),.6);dbgG('in review');if(A8.C.failing)return false;const ok=stealthHold('film',{max:120,near:8,far:12});dbgG('film held '+ok);if(!ok)return false;
   // the film runs by itself; its clatter brings it to the door: down behind the stand until the reel is done
   take('hide-B2',{max:10,r:1.4});until(()=>A8.C.flags.filmDone||!!A8.C.failing,90);if(A8.C.failing)return false;if(A8.C.hiding)take('unhide',{max:6,r:9});return true;});
  release('KeyC');dbgG('stealth done');until(()=>A8.C.flags.filmDone,40);until(()=>said('When they took her out, the needle fell'),15);dbgG('film done');
  check(`${label}: Annie Rowan: Mason's slip, licence 0417, her school picture (A.R.); the 1958 film (taken out of her chamber, the needle falls and the wall starts to come apart; brought back, it stops)`,()=>{assert.ok(A8.C.flags.receipt&&A8.C.flags.annie);assert.equal(A8.state.inv.receipt,'have');assert.ok(said('Annie Rowan'));assert.ok(said('When they took her out, the needle fell'));assert.ok(said('DO NOT VACATE OCCUPIED CHAMBERS.'));});
  // to the corridor: the green door, east side
  retry(()=>{sneakTo({x:P('reviewIn').x+2.4,z:P('reviewIn').z-1.6},.7);dbgG('out of review');sneakTo(P('galleryMid'),1.2);dbgG('gallery mid');sneakTo(P('cIn'),1);dbgG('at the green door');return until(()=>ph()==='e8-danny',20);},3);dbgG('corridor');lap('gallery');}
 if(inSeg('corridor')){until(()=>ph()==='e8-danny',10);take('danny-bike',{max:40,r:1.8});until(()=>A8.C.view==='inspect',8);putDown(40);
  approach(P('cEnd'),1.6,{pad:6});if(process.env.DEBUG8)console.log('  [corridor] at end',(me().x+2600).toFixed(1),'pt',A8.C.pt.toFixed(1),'tasks',A8.state.tasks,'D',A8.SC.D.st,'view',A8.C.view,'line',h.chapter.state.line);until(()=>A8.C.dannyOn,20);if(process.env.DEBUG8)console.log('  [corridor] danny',A8.C.dannyOn,A8.SC.D.st,'tasks',A8.state.tasks,'marks',A8.C.marks.slice(-3));
  // into the second alcove, low; it comes past; say his name
  retry(()=>{until(()=>A8.C.dannyOn,30);press('KeyC');approach(P('cAlcove3'),.45,{pad:4,sprint:true});until(()=>A8.SC.D.st==='passed'||A8.SC.D.st==='sniff'||!!A8.C.failing,30);if(A8.C.failing)return false;take('name',{max:20,r:6});release('KeyC');return true;});
  until(()=>A8.C.flags.danny&&offers().includes('breaker'),60);take('breaker',{max:30,r:1.6});
  check(`${label}: Danny: the flyer (two fingers, left hand), his hand on the alcove, his name; it flees what is coming`,()=>{assert.ok(A8.C.flags.flyer&&A8.C.flags.hand&&A8.C.flags.danny&&A8.C.flags.presence);assert.ok(said('Danny?'));});
  via([P('cIn'),P('galleryMid'),P('bulkhead'),P('jMid')],{r:1.1,pad:12});until(()=>ph()==='e8-sam',20);lap('corridor');}
 // ---- Act III ------------------------------------------------------------------------------------------------------------------
 const marked=w=>A8.C.marks.some(m=>m[1]===w);
 const W8=(x,z)=>({x:-2600+x,z:2600+z});
 if(inSeg('wing')){until(()=>ph()==='e8-sam',10);
  take('panel',{max:30,r:2.4});until(()=>A8.C.flags.panelSeen,20);until(quiet,20);
  // down the wing along its north side, clear of the live cable in the middle of it, to the cell the knocking comes from
  retry(()=>{via([W8(-8,25.6),W8(-14.2,25.6),W8(-17.2,25.6),W8(-18.6,27.4)],{r:.6});return approach(P('samLook'),.7,{pad:6});},3);
  take('slot',{max:30,r:1.4});until(()=>!!A8.C.choice,40);chooseKey(1);until(quiet,20);until(()=>!!A8.C.choice,20);chooseKey(3);until(()=>A8.C.flags.samTrust,60);until(quiet,40);
  via([W8(-17.2,25.6),W8(-14.2,25.6),W8(-8,25.6)],{r:.6});take('breaker',{hold:4,r:1.4,max:20});until(()=>A8.C.flags.breakerOff,10);until(quiet,20);
  until(()=>offers().includes('drain'),30);
  retry(()=>{for(let k=0;k<6&&offers().includes('drain');k++){
    take('drain',{hold:30,r:1.3,max:20,stop:()=>A8.C.flags.wingHunt&&!A8.C.flags.wingClear});if(A8.C.failing)return false;
    // it heard the wheel: behind the pipes, low, light off, until it has gone back up the wing
    if(A8.C.flags.wingHunt&&!A8.C.flags.wingClear){o.light(false);press('KeyC');take('hide-D0',{max:6,r:2.2});until(()=>A8.C.flags.wingClear||!!A8.C.failing,90);if(A8.C.failing)return false;if(A8.C.hiding)take('unhide',{max:4,r:9});release('KeyC');}}
   return !A8.C.failing;},4);
  until(()=>A8.C.flags.drained,20);o.light(true);
  approach(P('samCrank'),1,{pad:6});take('crank1',{hold:6,r:1.3,max:30});
  for(let k=0;k<4&&!A8.C.flags.samFree&&A8.X.ST.wedge!==1;k++){if(!until(()=>offers().includes('crank2')||A8.X.DOORS.samCell.want>=.44,30))break;if(offers().includes('crank2'))take('crank2',{hold:4,r:1.4,max:2});}
  until(()=>offers().includes('pipe'),30);take('pipe',{max:20,r:1.3,pad:8});take('wedge',{hold:4,r:1.5,max:20});until(()=>A8.C.flags.samFree,30);
  // out: the flood door is coming down. Its brake, held until he is under; then under it yourself, low
  retry(()=>{if(!until(()=>offers().includes('isoBrake')||!!A8.C.flags.samThrough,90))return false;if(A8.C.flags.samThrough)return true;approach(P('dIsoD'),.9,{pad:6,sprint:true});const at=offerAt('isoBrake');if(!at)return !!A8.C.flags.samThrough;faceV(at);
   until(()=>{faceV(at);if(spot()?.id==='isoBrake')press('KeyF');return !!A8.C.flags.samThrough||!!A8.C.failing;},50);release('KeyF');if(A8.C.failing)return false;
   press('KeyC');approach(P('jMid'),1.2,{pad:8});release('KeyC');return !A8.C.failing;},4);
  until(()=>A8.C.flags.samDone||ph()==='e8-jamie',60);
  check(`${label}: Sam: a voice from the speaker and knocking from a cell; his own notebook through the door; the breaker, the drain (it comes), the catch, the pipe; the flood door; D3 drops`,()=>{
   assert.ok(said('It comes out of the grey speaker horn'));assert.ok(said('It’s wet. It’s real.'));assert.ok(said('You came.'));assert.ok(A8.C.flags.wingHunt&&A8.C.flags.samFree&&A8.C.flags.samThrough);assert.equal(A8.X.PANEL.want[0],0);assert.ok(said('D-three. That’s... that’s my cell.'));});lap('wing');}
 if(inSeg('retrieval')){until(()=>ph()==='e8-jamie',10);press('KeyC');o.light(false);
  // it brings him back: stay low at the wing's mouth until it has gone back into its room
  approach(P('eWest'),1,{pad:8});until(()=>A8.C.eHunt||!!A8.C.failing,90);release('KeyC');take('bolts',{max:10,r:1.2});take('grille',{max:20,r:1.3});
  retry(()=>{press('KeyC');o.light(false);if(offers().includes('grille'))take('grille',{max:10,r:1.3});
   if(!A8.C.flags.jamieTalk){
    // at the grille, low, light off, until it goes into its room at the end; then under, to his slot
    approach(W8(20.5,27.4),.6,{pad:6});press('KeyC');until(()=>(A8.HM.x+2600>34.4&&A8.H.mode==='patrol')||!!A8.C.failing,150);if(A8.C.failing)return false;
    press('KeyC');approach(P('e2Look'),.6,{pad:6});take('jslot',{max:10,r:1.4});until(()=>A8.C.flags.jamieTalk||!!A8.C.failing,60);if(A8.C.failing)return false;}
   if(!A8.C.flags.ventOpen){press('KeyC');approach(P('e3Mid'),.6,{pad:6});
    // behind the open door while it comes up the wing and looks in; out again when it has gone by
    const tIn=A8.C.t,e3d=W8(31.5,25.9);take('hide-E3',{max:60,r:1.5});if(process.env.DEBUG8)console.log('  [jamie] in E3 at',(me().x+2600).toFixed(1),(me().z-2600).toFixed(1),'hiding',A8.C.hiding,'offers',offers().join(','),'hunter',(A8.HM.x+2600).toFixed(1),A8.H.mode);until(()=>offers().includes('vent')||!!A8.C.failing,40);
    until(()=>((A8.C.doorCheck?.E3??-99)>tIn&&Math.hypot(A8.HM.x-e3d.x,A8.HM.z-e3d.z)>5.5&&A8.H.mode==='patrol')||!!A8.C.failing,150);if(A8.C.failing)return false;
    if(process.env.DEBUG8)console.log('  [jamie] waited behind the door; check',A8.C.doorCheck?.E3,'tIn',tIn,'t',A8.C.t.toFixed(1),'hiding',A8.C.hiding,'hunter',(A8.HM.x+2600).toFixed(1),(A8.HM.z-2600).toFixed(1),A8.H.mode);
    if(A8.C.hiding)take('unhide',{max:4,r:9});
    // it has looked in and gone on: it won't look again for a while. The bolts, now, low, light off
    press('KeyC');take('vent',{hold:9,r:1.2,max:10});release('KeyC');if(A8.C.failing||!A8.C.flags.ventOpen)return false;}
   until(()=>offers().includes('pull')||!!A8.C.failing,40);if(A8.C.failing)return false;take('pull',{hold:5,r:1.4,max:10});return until(()=>A8.C.flags.jamieOut,20);},4);
  // run: its room, its bore (under the pipe, low), F0, the long hall, the corridor, the crew room; the locker across the door
  retry(()=>{until(()=>!!A8.C.flags.jamieOut,10);o.light(true);
   {const ok1=via([P('denIn'),P('denBack')],{r:.8,sprint:true});if(process.env.DEBUG8)console.log('  [run] to the den back',ok1,'me',(me().x+2600).toFixed(1),(me().z-2600).toFixed(1),'hunter',(A8.HM.x+2600).toFixed(1),(A8.HM.z-2600).toFixed(1),A8.H.mode,'failing',!!A8.C.failing,'cell',A8.state.cell);if(!ok1)return false;}press('KeyC');wait(.6);X.walkLine=null;const w8=pts=>{for(const [x,z] of pts){const q=W8(x,z);if(!approach(q,.5,{pad:3,max:8}))return false;}return true;};w8([[39.6,34.5],[39.6,35.6],[39.6,37.3],[39.6,38.4]]);release('KeyC');
   if(!via([P('e5Mid'),W8(39.6,45.6),P('e6Mid'),P('e6West'),P('f0In'),P('hEast'),P('kSouth'),P('gIn')],{r:.9,sprint:true}))return false;
   until(()=>offers().includes('locker')||!!A8.C.failing,6);take('locker',{hold:3,r:1.4,max:8});return !A8.C.failing&&A8.X.ST.lockerWant===1;},4);
  until(()=>A8.C.flags.jamieDone||ph()==='e8-alex',220);
  check(`${label}: Jamie: it brings him back and bends his door; the grille (Sam); his slot; the duct (he sticks; you pull); it tears the door out; the den and its bore; the locker; E2 drops`,()=>{
   assert.ok(said('Took you long enough.'));assert.ok(A8.C.flags.latchBent&&A8.C.flags.ventOpen&&A8.C.flags.jamieOut);assert.ok(marked('it tore his door out'));assert.equal(A8.X.PANEL.want[1],0);assert.ok(said('Who’s in F-two.'));});lap('retrieval');}
 if(inSeg('alex')){until(()=>ph()==='e8-alex',10);
  via([P('hMid'),P('hEast'),P('f0In'),W8(19.8,50.6)],{r:.5,pad:10});until(()=>A8.C.flags.slid&&A8.X.ST.fa>.8,30);if(process.env.DEBUG8)console.log('  [alex] slid',A8.C.flags.slid,'fa',A8.X.ST.fa,'me',(me().x+2600).toFixed(1),(me().z-2600).toFixed(1),'cell',A8.state.cell);
  via([P('faNorth'),P('faMid'),P('faSouth'),W8(19.8,58.8),P('f0End'),P('f1In'),P('f1Mid')],{r:.8,pad:10});until(quiet,40);{const ok=approach(P('alexDoor'),1.9,{pad:8});if(process.env.DEBUG8)console.log('  [alex] at door?',ok,'me',(me().x+2600).toFixed(1),(me().z-2600).toFixed(1),'cell',A8.state.cell,'pt',A8.C.pt.toFixed(1),'flags',Object.keys(A8.C.flags).filter(k=>/slid|passage|made|alex/.test(k)).join(','));}for(let k=0;k<9&&!offers().includes('photo');k++){until(()=>offers().includes('photo'),10);if(process.env.DEBUG8)console.log('  [alex] waiting photo pt',A8.C.pt.toFixed(1),'line',(h.chapter.state.line||'').slice(0,80),'q',h.chapter.state.queue,'near',Math.hypot(me().x-P('alexDoor').x,me().z-P('alexDoor').z).toFixed(2),'tasks',A8.state.tasks.join(','),'ctxNear',A8.CTX.near(A8.X.at('alexDoor'),2.4),'meCtx',JSON.stringify(A8.CTX.me()).slice(0,80),'pt',A8.C.pt.toFixed(1));}
  take('photo',{max:30,r:9});take('under',{max:30,r:1.4,pad:8});until(()=>A8.C.flags.alexTrust,60);
  take('leverB',{hold:6,r:1.3,max:40,pad:8});until(()=>A8.C.flags.alexOut,90);
  retry(()=>{until(()=>A8.X.ST.breach>.9||!!A8.C.failing,20);const dbgL=w=>{if(process.env.DEBUG8)console.log('  [ledge]',w,'me',(me().x+2600).toFixed(1),(me().z-2600).toFixed(1),'y',h.camera.position.y.toFixed(2),'cell',A8.state.cell,'breach',A8.X.ST.breach.toFixed(2),'door',A8.X.doorOpen.get('breach'));};dbgL('start');
   {const ok=via([P('f2Breach'),P('ilSouth'),W8(15.1,70)],{r:.7,pad:6});dbgL('after via '+ok);if(!ok)return false;}press('KeyC');wait(.7);for(const z of [69,68.2,67,66,65.4])approach(W8(15.1,z),.4,{pad:3,max:8});release('KeyC');dbgL('under the pipe');
   approach(W8(15.1,63.6),.5,{pad:4});dbgL('at the gap');{const got=take('alexHand',{max:60,r:1.6});dbgL('hand taken '+got+' flag '+A8.C.flags.alexHand+' offers '+offers().join(',')+' marks '+A8.C.marks.slice(-3).map(m=>m.join(':')).join('|'));}if(!via([P('ilGap'),W8(15.1,58.6),P('ilNorth')],{r:.4,pad:4}))return false;take('hwin',{hold:2,r:1.4,max:30});return approach(P('hWinIn'),.8,{pad:6});},4);
  {const dbgA=w=>{if(process.env.DEBUG8)console.log('  [alex-run]',w,'me',(me().x+2600).toFixed(1),(me().z-2600).toFixed(1),'cell',A8.state.cell,'pt',A8.C.pt.toFixed(1),'shear',A8.X.ST.shear.toFixed(2),'friends',[A8.CTX.sam,A8.CTX.jamie,A8.CTX.alex].map(c=>c&&A8.X.cellIdAt(c.px,c.pz)).join(','),'line',(h.chapter.state.line||'').slice(0,60));};
  dbgA('in H');const ok=via([P('hMid'),P('kSouth'),P('gIn')],{r:1,pad:10,sprint:true});dbgA('to G '+ok);for(let k=0;k<6&&ph()!=='e8-reunion';k++){until(()=>ph()==='e8-reunion',10);dbgA('waiting');}}
  check(`${label}: Alex: the corridor closes ahead and makes a passage; the room it made; his camera, a picture of the three of you ("They never bleed"); two levers; the room comes apart; the ledge; his hand; the last wall breaks`,()=>{
   assert.ok(said('That was a corridor a second ago.'));assert.ok(said('Jamie’s bleeding.'));assert.ok(said('They never bleed.'));assert.ok(A8.C.flags.alexOut&&A8.C.flags.alexHand);assert.equal(A8.X.PANEL.want[2],0);assert.ok(A8.X.ST.shear>.5);});lap('alex');}
 if(inSeg('reunion')){until(()=>ph()==='e8-reunion',10);for(const id of ['gum','camera','bike','sit','ankle','alexStory']){until(quiet,40);take(id,{max:30,r:1.2,pad:6});until(()=>!A8.state.tasks.includes('beat-'+id),60);}
  until(()=>ph()==='f8-truth'||offers().includes('board'),240);
  check(`${label}: all four of them, for a while: the gum, the camera (riding tomorrow), the bike, sitting with them; Reyes on the radio`,()=>{assert.ok(said('It still tastes like gum.'));assert.ok(said('So we’re going.'));assert.ok(said('Tomorrow.'));assert.ok(said('This is the worst sleepover ever.'));assert.equal(A8.state.inv.radio,'have');});lap('reunion');}
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
 const ST8=()=>A8.SC.STREET,dHere=()=>A8.ruin.locate(me().x,me().z).d;
 const dbgS=w=>{if(process.env.DEBUG8){const L=A8.ruin.locate(me().x,me().z);console.log('  [street]',w,'d',L.d.toFixed(1),'lat',L.lat.toFixed(1),'pt',A8.C.pt.toFixed(1),'ck',A8.C.lastCheckpoint,'offers',offers().join(','),'marks',A8.C.marks.slice(-3).map(m=>m[1]).join(' | '));}};
 // along the street by its own d/lat, a few metres at a time (the nav's route between each)
 const walkD=(pts,o={})=>via(pts.map(([d,l])=>M8d(d,l)),{r:o.r??1.2,pad:o.pad??10,sprint:!!o.sprint,max:o.max});
 if(inSeg('surface')){until(()=>ph()==='g8-surface',10);
  // up out of MH-12 into it; down the drive; the first blows; the made thing in the yard across: down behind the car
  retry(()=>{until(()=>quiet()||offers().includes('hide-car'),60);if(A8.C.lastCheckpoint==='c8-surface'){walkD([[1150,2],[1144,2]]);until(quiet,30);walkD([[1136,3],[1129,4.5]]);dbgS('at impacts');
    if(!take('hide-car',{max:60,r:2.4,pad:12}))return false;dbgS('hidden '+A8.C.hiding);until(()=>A8.C.lastCheckpoint==='c8-trench'||!!A8.C.failing,90);}
   return A8.C.lastCheckpoint==='c8-trench'&&!A8.C.failing;});
  check(`${label}: the surface: the red sky over the whole town, the thing on the skyline; the first blows; a pale smiling made thing calling in a woman's voice, and you down behind a car until it has gone by`,()=>{
   assert.ok(A8.C.apoc>.5);assert.ok(said('The sky is wrong'));assert.ok(said('That’s not a person'));assert.ok(said('They all smile. The ones it makes.'));assert.ok(ST8().town.EV.impacts.t>=0);});
  // the road goes into the storm line; the hunter out of it searching the west side: along the east lawns, low and dark
  retry(()=>{if(A8.C.lastCheckpoint!=='c8-trench')return true;walkD([[1110,5.5],[1104,6.8]]);until(()=>ST8().town.EV.trench.t>=0,20);until(()=>ST8().CR.h2.mode!=='off'||!!A8.C.failing,40);dbgS('trench open');
   press('KeyC');o.light(false);const ok=walkD([[1098,8.6],[1090,9.2],[1082,9.4],[1074,9.4],[1066,9.2],[1062,8.4]],{r:1.2,pad:12,max:90});release('KeyC');dbgS('past the hole '+ok);return ok&&!A8.C.failing;});
  // Mrs. Pruitt, under her awning: you and Jamie lift it
  take('awning',{hold:8,r:1.6,max:90,pad:10});until(()=>A8.C.flags.pruitt,10);until(()=>said('We’re like... firemen.'),20);dbgS('pruitt');
  check(`${label}: the trench: the road heaves, splits and goes into the storm line with a car and the pole; a hunter climbs out of it and searches the far side while you go along the near; the house at 1052 leans in; Mrs. Pruitt freed (Jamie: "We’re like... firemen.")`,()=>{
   assert.ok(ST8().town.EV.trench.t>=0&&ST8().town.EV.lean.t>=0);assert.ok(ST8().town.FIELD.k>.5);assert.ok(A8.C.flags.pruitt);assert.ok(said('We’re like... firemen.'));});
  // a limb over the roofs, down on the Kesslers'
  {const ok=walkD([[1056,9],[1052,5.2],[1044,4.4]]);if(!ok&&process.env.DEBUG8){const p=me();console.log('  [street] walk to the limb failed; walkable here',h.nav.walkable(p.x,p.z,{r:.3}),'route',X.route(M8d(1052,5.2),1.2,.1,10).length);}}until(()=>ph()==='g8-street',90);dbgS('hendersons');
  check(`${label}: a limb of it out of the cloud, over the roofs, down on the house across from the Hendersons' (it goes, then fire)`,()=>{assert.ok(ST8().town.EV.across.t>=0);assert.ok(said('That was the Kesslers’.'));});lap('surface');}
 if(inSeg('street')){until(()=>ph()==='g8-street',10);const HD=ST8().HD;
  // Lily: Jamie puts his foot through the window and talks her out; you reach in
  take('lily',{max:60,r:2.6,pad:12});until(()=>said('She crawls out.'),40);dbgS('lily out');
  walkD([[1030,-3.8],[1016,-4.6],[1008,-4.6]]);until(()=>A8.C.lastCheckpoint==='c8-garage',60);dbgS('lily to the car');
  // Mr. Henderson: the jack under the garage door; then the lawn goes and you run for the street
  retry(()=>{until(()=>offers().includes('jack')||A8.C.lastCheckpoint==='c8-yard',40);if(A8.C.lastCheckpoint==='c8-yard')return true;walkD([[1012,4.4],[1017,7]]);take('jack',{hold:10,r:2.2,max:60,pad:10});dbgS('jacked');
   until(()=>A8.C.yardRun||!!A8.C.failing,40);dbgS('run');walkD([[1016,5.2],[1014,3.6]],{sprint:true,r:1,pad:8});until(()=>A8.C.lastCheckpoint==='c8-yard'||!!A8.C.failing,40);return A8.C.lastCheckpoint==='c8-yard'&&!A8.C.failing;});
  check(`${label}: the Hendersons': Lily out of the front room (Jamie's dog that isn't real); the jack, Mr. Henderson freed in the garage; the lawn goes between you and the house as you run off it`,()=>{
   assert.ok(A8.C.flags.lilyReach&&A8.C.flags.jacked);assert.ok(said('Biscuit'));assert.equal(ST8().town.YARD.on,true);assert.ok(ST8().town.YARD.k>.5);});
  // the side yard: the door, Jamie holding its header; it comes up out of the hole's end; you run at it
  walkD([[1011,6.5],[1011.5,9]],{r:1});dbgS('side yard');until(()=>A8.C.jamieHeld!=null||A8.C.flags.jamieDead,60);dbgS('it has him');
  {const t1=h.snapshot.clock;until(()=>{if(A8.HM.root.visible)approach({x:A8.HM.x,z:A8.HM.z},1.8,{pad:6,max:1.5,sprint:true});return A8.C.flags.jamieDead||h.snapshot.clock-t1>14;},16);}dbgS('jamie dead '+A8.C.flags.jamieDead);
  // with him: kneel; Reyes; his hand; his cap
  until(()=>A8.C.flags.jamieDead,20);approach(HD.body,1.6,{pad:8});
  take('jamie-hand',{max:120,r:3.2,pad:8});take('jamie-cap',{max:150,r:2.2,pad:8});until(()=>A8.C.flags.jamieMourned,120);dbgS('mourned');
  check(`${label}: Jamie: it takes him to drag him back down; it slams him down at the edge and goes; Sam on his knees; Reyes's CPR, then not; Alex: "It's my fault"; Sam: "Don't you DARE"; his hand; his cap; Reyes's jacket over him`,()=>{
   assert.ok(A8.C.flags.jamieDead);assert.ok(A8.C.grief.jamie);assert.ok(A8.C.flags.heldJamie);assert.equal(A8.C.inv.cap,'have');assert.ok(said('I’m so sorry, kid.'));assert.ok(said('Don’t you DARE say that.'));assert.ok(A8.C.flags.covered);});
  // away: south past Sam's, the Kowalskis' burning; Summerfield goes; Brandt's truck
  walkD([[1010,4.4],[1004,1.5],[994,1],[980,.5],[960,0],[944,0],[930,0],[918,0],[908,0],[902,0]],{r:1.6,pad:10,max:160});until(()=>ph()==='g8-staging',60);dbgS('to the works');
  check(`${label}: away from it: "We left him"; "Biscuit isn’t even real"; Summerfield goes down; the works`,()=>{assert.ok(said('We left him on the grass.'));assert.ok(said('Biscuit isn’t even real.'));assert.equal(ph(),'g8-staging');});lap('street');}
 if(inSeg('staging')){until(()=>ph()==='g8-staging',10);take('procedure',{max:40,r:2.2,pad:14});putDown(60);until(()=>ph()==='n8-op',80);
  check(`${label}: the drawdown nobody would use while anyone was in there; "There aren't now."`,()=>{assert.ok(A8.C.flags.procRead);assert.ok(said('There aren’t now.'));});lap('staging');}
 if(inSeg('op')){until(()=>ph()==='n8-op',10);
  // A: the main gate (back off when it rears), the gallery's drain gate
  retry(()=>{until(()=>offers().includes('gate1a'),40);const at=offerAt('gate1a');if(!at)return false;approach(at,1.1,{pad:14});faceV(at);
   until(()=>{const hz=A8.C.haz.find(z=>!z.fell);if(hz&&Math.hypot(hz.at.x-me().x,hz.at.z-me().z)<hz.r+1.4){release('KeyF');const away={x:me().x+(me().x-hz.at.x)*2,z:me().z+(me().z-hz.at.z)*2};approach(away,.6,{pad:6,max:4});return false;}
    if(Math.hypot(at.x-me().x,at.z-me().z)>1.4){approach(at,1.1,{pad:6,max:6});faceV(at);}if(spot()?.id==='gate1a')press('KeyF');return !offers().includes('gate1a')||!!A8.C.failing;},120);release('KeyF');return !A8.C.failing;});
  // (B is the gallery under the bank: down its steps at the east end of the bridge, along to the north end, the old speaker)
  until(()=>offers().includes('dd'),30);via([X.WP(7.8,-1.6),X.WP(8,-4),X.WP(8,-8.5)],{r:1,pad:8});take('dd',{hold:8,r:1.2,max:60,pad:10});until(()=>offers().includes('port'),60);take('port',{hold:10,r:1.2,max:30});until(()=>offers().includes('jladder'),30);take('jladder',{hold:6,r:1.4,max:20});
  until(()=>A8.C.lastCheckpoint==='c8-plug',40);
  // C: along the catwalk; the pins, against the wall when it comes
  approach(P('ipPins'),2.5,{pad:12});
  for(let i=0;i<3;i++){retry(()=>{until(()=>offers().includes('pin'+i)||A8.C.flags['pin'+i],30);if(A8.C.flags['pin'+i])return true;const at=offerAt('pin'+i);
    until(()=>{const hz=A8.C.haz.find(z=>!z.fell);if(hz&&Math.hypot(hz.at.x-me().x,hz.at.z-me().z)<hz.r+1){release('KeyF');approach({x:P('ipPins').x-3.4,z:P('ipPins').z-1.2},.6,{pad:4,max:4});return false;}
     if(Math.hypot(at.x-me().x,at.z-me().z)>1.5){approach(at,1.2,{pad:4,max:6});}faceV(at);if(spot()?.id==='pin'+i)press('KeyF');return !offers().includes('pin'+i)||!!A8.C.failing;},90);release('KeyF');return !A8.C.failing;});}
  // the chain: Alex takes it; up the ladder; at the top the lid comes down on him: lift it with Sam, pull him out
  approach(P('ipLadder'),1.6,{pad:10});until(()=>offers().includes('upLadder'),90);take('upLadder',{hold:6,r:1.6,max:20});
  take('lift-lid',{hold:8,r:2.2,max:120,pad:8});take('pull-alex',{hold:6,r:2.2,max:30,pad:8});until(()=>ph()==='n8-oak',60);
  check(`${label}: the chain: Alex holds the hatch's counterweight chain so the rest of you can climb; the lid comes down on him as he comes up; you and Sam lift it and pull him out`,()=>{
   assert.ok(said('I’m the light one.'));assert.ok(A8.C.flags['lift-lid']&&A8.C.flags['pull-alex']);});
  check(`${label}: the gates, the drain gate (Chapter Six's), the ports, Line Two, three pins, the plug; it goes quiet; Alex holds the hatch`,()=>{assert.ok(A8.C.flags.gateA&&A8.C.flags.dd&&A8.C.flags.port);assert.ok(A8.C.flags.sealed);assert.ok(A8.C.flags.alexHurt);});lap('op');}
 if(inSeg('oak')){until(()=>ph()==='n8-oak',10);take('alex-sit',{max:60,r:2.2});
  // sitting with him: his hand; Sam; stay; get up when you are ready
  for(const id of ['alex-hand','look-sam','stay','get-up'])take(id,{max:200,r:4,pad:6});until(()=>ph()==='n8-ride',60);
  check(`${label}: the oak: "Did we stop it?" "Yeah." "Good." … the bikes he kept thinking about; "We were supposed to go riding tomorrow."; his hand; Sam; he dies; Sam holds him; Reyes kneels with Sam; you get up when you are ready`,()=>{
   assert.ok(said('Did we stop it?'));assert.ok(said('We were supposed to go riding tomorrow.'));assert.ok(said('I kept thinking about the bikes.'));assert.ok(A8.C.flags.alexDead);assert.ok(A8.C.flags.alexHand&&A8.C.flags.lookedSam&&A8.C.flags.stayed);assert.ok(A8.C.grief.alex);});lap('oak');
  // on foot with Sam, down past the hole and the house that fell, to the bikes
  walkD([[1150,4.5],[1132,5],[1112,6],[1104,7],[1096,8.8],[1080,9.4],[1064,9],[1054,6],[1046,3]],{r:1.4,pad:12,max:160});take('bike',{max:60,r:2.4,pad:8});
  check(`${label}: the street at sunrise: on foot with Sam past the trench, the leaning house, the Kesslers' shell, the Hendersons' yard; your bike where Reyes left it`,()=>{assert.ok(said('The house at 1052 is still leaning into it.'));assert.ok(A8.C.flags.bike);});}
 if(inSeg('ride')){until(()=>ph()==='n8-ride',10);wait(4);const pts=[];for(let d=1034;d>=650;d-=15){const lat=(d>860&&d<884)?6.9:(d>930&&d<970)?2.6:-1.6;const q=T0.groundPoint(d,lat);pts.push([q.x,q.z]);}
  press('KeyW');X.rideTo(pts,260,3);release('KeyW');until(()=>A8.C.wantLook,60);
  // look back: the road behind you
  for(let k=0;k<80&&!A8.C.lookedBack;k++){h.look(Math.PI*.9,0);T.advance(1/30);}h.look(0,0);
  until(()=>h.snapshot.state==='ended',30);
  check(`${label}: the last ride: Sam, two bikes; "I keep thinking they're right behind us."; the road behind is empty; the end card`,()=>{assert.ok(said('I keep thinking they’re right behind us.'));assert.ok(said('The road behind you is empty.'));assert.ok(A8.C.grief.jamie&&A8.C.grief.alex);assert.equal(element('ending').hidden,false);assert.ok(/Chapter Eight/.test(element('ending').querySelector?.('h2')?.innerHTML??'Chapter Eight'));});
  lap('ride');}
 M8.minutes=+((h.snapshot.clock-t0)/60).toFixed(2);M8.segments=seg;M8.fails=C8().fails;
 return {lines:()=>lines,said};
}

export async function runChapterEightChecks(T0){
 const X=chapterEightTools(T0),{h,press,release,tap,until,wait,me,A8,C8,ph,CM,offers,approach,via,P,take}=X,check=T0.check,T=X.T,element=T0.element;
 // every DEV Chapter Eight scene starts in a Chapter Eight phase, on its feet, somewhere you can stand
 const sc=DEV_SCENES[8]||[];
 check(`chapter 8: every DEV Chapter Eight scene starts (${sc.length} scenes)`,()=>{const bad=[];for(const s of sc){if(!s.jump)continue;h.jump(s.jump);T.advance(1.5);const p=me(),st=A8.state;if(!/^(c8|d8|e8|f8|g8|n8)-/.test(st.phase))bad.push(s.id+': '+st.phase);const riding=h.snapshot.state==='c1-ride'||h.snapshot.state==='riding';if(!(p.walking||riding||h.snapshot.state==='ended'))bad.push(s.id+': not on foot or riding ('+h.snapshot.state+')');if(p.walking&&!h.nav.walkable(p.x,p.z,{r:.2})&&!A8.C.view)bad.push(s.id+': stands in a wall');}assert.deepEqual(bad,[]);});
 check('chapter 8: the barrier can be failed: walk into the pipe and it has you; back at the barrier checkpoint',()=>{h.jump('c8-barrier');until(()=>!!A8.C.hunt,30);let caught=false;
  until(()=>{const q=P('hunterL4');X.faceTo(A8.HM.x,A8.HM.z,0);press('KeyW');if(A8.C.failing)caught=true;return caught;},40);release('KeyW');until(()=>!A8.C.failing,6);T.advance(1);
  assert.ok(caught,'caught');assert.equal(A8.state.phase,'d8-shaft');assert.ok(A8.state.fails['c8-barrier']>=1);});
 check('chapter 8: the escape can be failed: stop under the beam in the junction hall and it comes down on you; back at the way out',()=>{h.jump('c8-escape');until(()=>A8.C.lastCheckpoint==='c8-escape',20);
  via([P('kSouth'),{x:P('kMid').x,z:P('kMid').z+3.2},P('gDoor'),P('gIn'),P('gBack'),P('gdMid')],{r:1,pad:10,sprint:true});
  // step into the hall and stand there, under the grit
  approach({x:P('gdMid').x,z:P('gdMid').z-2.6},.4,{pad:6});let failed=false;until(()=>{if(A8.C.failing)failed=true;return failed;},8);until(()=>!A8.C.failing,8);T.advance(1);
  assert.ok(failed,'it came down on you');assert.ok((A8.state.fails['c8-escape']||0)>=1);assert.equal(A8.state.phase,'f8-breach');});
 check('chapter 8: the hunter here is its own instance (not Chapter Seven\'s) and the smiling creature is Chapter Three\'s, with the injury',()=>{assert.notEqual(A8.HM,h.chapter7.HM);assert.ok(h.chapter3.creature.injury?.length>=4||!h.chapter3.creature.loaded,'injury bones');});
 check('chapter 8: Continue offers the last checkpoint',()=>{h.jump('c8-wing');T.advance(1);const s=h.chapter.saved?.();assert.ok(s&&/wing|flooded/i.test(s.label+s.section),JSON.stringify(s));});
 check('chapter 8: then Chapter Seven starts clean (no complex, no ruin, no Alex companion)',()=>{h.jump('c7-court');T.advance(.5);assert.equal(A8.X.ST.active,false);assert.equal(h.chapter.companions.all.length,2);assert.equal(A8.ruin.ST.stage,0);});
 check('chapter 8: then Chapter Six starts clean; its drawdown gate stops the voice in the horn (the demonstration)',()=>{h.jump('c6-gallery');T.advance(.5);const A6=h.chapter6;until(()=>A6.C.gal?.mutter,90);until(()=>A6.C.gal.mutter.n>=1,20);
  const at=A6.DD.at();approach(at,1.2,{pad:18});X.faceV(at);until(()=>h.chapter.spot?.()?.id==='c6-drawdown',6);tap('KeyF');until(()=>A6.C.gal.mutter.done,12);assert.equal(A6.C.gal.mutter.done,'gate');});
 await check('chapter 8: earlier-chapter clues exist: Ch1 Line 4 plate, Ch2 sealed access, Ch4 A. Rowan & the hand, Ch5 vault, Ch7 the 1974 line and her note',async()=>{
  const fs=await import('node:fs');const read=f=>fs.readFileSync(new URL('../dist/'+f,import.meta.url),'utf8');assert.ok(read('chapter1.js').includes('LINE 4 — 1958'));assert.ok(read('chapter2.js').includes('NO ENTRY'));
  assert.ok(read('chapter4.js').includes('A. Rowan'));assert.ok(read('chapter4.js').includes('last two fingers of his left hand'));assert.ok(read('chapter5.js').includes('VALVE VAULT 3'));assert.ok(read('chapter7.js').includes('isolation work at the Line Four junction'));assert.ok(read('chapter7.js').includes('NOT EVEN IF IT SOUNDS LIKE ME'));});
 check('chapter 8: the save the aftermath will read: two home, two lost, the presence sealed',()=>{h.jump('chapter8-end');until(()=>h.snapshot.state==='ended',20);const v=JSON.parse(globalThis.localStorage.getItem('lastlight.chapter8')||'{}');assert.deepEqual(v.home,['YOU','SAM']);assert.deepEqual(v.lost,['JAMIE','ALEX']);});
}
