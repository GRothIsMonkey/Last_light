// Aftermath I (What Was Left): played from Chapter Eight's end card to its own, with inputs only (riding, walking, looking, F
// on what the prompt offers, holding F, number keys for what you say, S to put a thing down), plus the chapter's own checks.
// Used by verify.mjs (ONLY=aftermath1). Nothing here is a human's judgement of whether a scene works: it shows that every
// beat can be reached and finished by a player's inputs, in order, in every branch it tries.
//
//   opts.from / opts.to   segments: arrive gym jamie alex families quiet record names return remained porch driveway
//                                   memorial-jamie memorial-alex sam weeks home packing goodbye road
//   opts.cap              'give-shelter' | 'give-porch' | 'keep'  (what you do with Jamie's cap)
//   opts.quiet            true: every choice left to time out (the silent / hesitant answers)
import assert from 'node:assert/strict';
import {chapterEightTools} from './chapter8-sim.mjs';
import {DEV_SCENES} from '../dist/dev-chapters.js';

export const SEGMENTS9=['arrive','gym','jamie','alex','families','quiet','record','names','return','remained','porch','driveway','memorial-jamie','memorial-alex','sam','weeks','home','packing','goodbye','road'];
const SECTION_OF={arrive:'a1-arrive',gym:'a1-gym',jamie:'a1-jamie-mom',alex:'a1-alex-parents',families:'a1-families',quiet:'a1-quiet-room',record:'a1-record',names:'a1-names',return:'a1-return',remained:'a1-remained',porch:'a1-porch',driveway:'a1-driveway',
 'memorial-jamie':'a1-memorial-jamie','memorial-alex':'a1-memorial-alex',sam:'a1-sam',weeks:'a1-weeks',home:'a1-home',packing:'a1-packing',goodbye:'a1-goodbye',road:'a1-road-out'};

export function aftermathTools(T0){
 const X=chapterEightTools(T0),{h,press,release,tap,until,wait,me,faceTo,approach,via,T}=X;
 const A9=h.aftermath1,C9=()=>A9.state,S=()=>h.chapter.kit.S,ph=()=>S().phase;
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 const spot=()=>h.chapter.spot?.();
 const offers=()=>[...A9.C.offers.keys()];
 const live=id=>{const f=A9.C.offers.get(id);return !!f&&(!f.when||f.when());};
 const offerAt=id=>{const f=A9.C.offers.get(id);if(!f)return null;const a=typeof f.at==='function'?f.at():f.at;return a?{x:a.x,y:a.y??0,z:a.z}:null;};
 const faceV=v=>{const c=h.camera.position;faceTo(v.x,v.z,Math.atan2((v.y??c.y)-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const dbg=(...a)=>{if(process.env.DEBUG9)console.log('  [a1]',...a);};
 // wait for an offer, go to it (unless you are sitting: then only look), look at it, take it (tap F, or hold F until it is done)
 function take(id,{max=90,r=1.2,hold=false,stop=null,pad=8,tries=4}={}){if(!until(()=>live(id)||!!stop?.(),max)){dbg(id,'NO OFFER; have',offers().join(','),'phase',ph(),'t',A9.C.t.toFixed(1));return false;}if(stop?.())return false;
  for(let k=0;k<tries;k++){const at=offerAt(id);if(!at)return !offers().includes(id);const f=A9.C.offers.get(id);
   // (getting up out of a seat: wait for it to finish before walking anywhere)
   if(A9.C.pose?.release)until(()=>!A9.C.pose,3);if(!A9.C.pose&&!h.roam.walkLock)approach(at,Math.min(r,(f?.r??2.2)-.35),{pad});faceV(at);let got=false;
   until(()=>{const s=spot();const a2=offerAt(id);if(a2)faceV(a2);if(s?.id===id){got=true;return true;}return !offers().includes(id);},4);
   if(!got){dbg(id,'not targeted; spot',spot()?.id,'dist',Math.hypot(me().x-at.x,me().z-at.z).toFixed(2),'spots',A9.spots().map(s=>s.id).join(','),'view',A9.C.view,'pose',!!A9.C.pose,'fade',A9.C.fadeOut,'lock',h.roam?.walkLock,'walkable',h.nav.walkable(me().x,me().z,{r:.3}),'state',h.night.state);if(!offers().includes(id))return true;wait(.5);continue;}
   if(!hold){tap('KeyF');wait(.25);return true;}
   press('KeyF');until(()=>{const a2=offerAt(id);if(a2)faceV(a2);return !offers().includes(id)||!!stop?.();},hold);release('KeyF');wait(.2);if(!offers().includes(id))return true;}
  return !offers().includes(id);}
 // an offer taken only if it is there within a moment (the optional things)
 const maybe=(id,o={})=>live(id)||until(()=>live(id),o.wait??1.5)?take(id,{max:2,...o}):false;
 const putDown=(max=40)=>{until(()=>A9.C.view==='inspect',4);until(()=>{if(A9.C.view!=='inspect')return true;if(quiet()&&A9.C.inspect?.t>1.2)tap('KeyS');return false;},max);};
 const stepBack=(max=40)=>{until(()=>A9.C.view==='look',4);until(()=>{if(A9.C.view!=='look')return true;if(quiet())tap('KeyS');return false;},max);};
 // a choice: the n-th thing you could say (1-based), or null: say nothing (let it pass)
 const choose=(n,max=60)=>{if(!until(()=>!!A9.C.choice,max))return null;const ids=A9.C.choice.options.map(q=>q.id);if(n==null){until(()=>!A9.C.choice,60);return 'silence';}tap('Digit'+n);wait(.3);return ids[n-1];};
 const phase=(p,max=120)=>until(()=>ph()===p,max);
 const flag=(f,max=120)=>until(()=>!!A9.C.flags[f],max);
 const said=()=>h.chapter.state.line;
 return {...X,A9,C9,S,ph,quiet,spot,offers,live,offerAt,faceV,take,maybe,putDown,stepBack,choose,phase,flag,said};
}

export function playAftermathOne(T0,label='Aftermath I',{fromCard=true,from=null,to=null,cap='keep',quietly=false,optional=true}={}){
 const X=aftermathTools(T0),{h,press,release,tap,until,wait,me,faceTo,approach,via,A9,C9,ph,quiet,take,maybe,putDown,stepBack,choose,phase,flag,offers,live,offerAt,faceV,spot,offBike,onBike,rideTo}=X,check=T0.check,T=X.T,element=T0.element;
 const lines=[];T.each=()=>{const l=h.chapter.state.line;if(l&&lines[lines.length-1]!==l)lines.push(l);};
 const said=t=>lines.some(l=>l.includes(t));
 const M9=T0.metrics.aftermath1||(T0.metrics.aftermath1={});const seg={};let segAt=h.snapshot.clock;const lap=n=>{seg[n]=+((h.snapshot.clock-segAt)/60).toFixed(2);segAt=h.snapshot.clock;};
 const inSeg=n=>{const i=SEGMENTS9.indexOf(n),f=from?SEGMENTS9.indexOf(from):0,t=to?SEGMENTS9.indexOf(to):99;return i>=f&&i<=t;};
 const SCH=A9.SC.SCH,W=(x,z)=>SCH.W(x,z),SP=SCH.SPOT;
 const pickN=n=>quietly?null:n;
 const noThrow=()=>assert.equal(C9().marks.filter(m=>/threw/.test(m[1])).length,0,'a scene script threw: '+JSON.stringify(C9().marks.filter(m=>/threw/.test(m[1]))));
 const neverThere=()=>{assert.equal(C9().jamie.visible,false,'Jamie is not in this chapter');assert.equal(h.chapter8.HM.root.visible,false,'no hunter');assert.ok(!h.chapter8.presence.active,'nothing under the court is awake');};
 const start=name=>{if(from===name&&!fromCard){h.aftermath1.devFresh();h.jump(SECTION_OF[name]);wait(.6);}};
 // ---- from Chapter Eight's end card ----
 if(fromCard&&!from){check(`${label}: Chapter Eight's end card offers Aftermath I, and its save says who carried what`,()=>{h.jump('chapter8-end');until(()=>h.snapshot.state==='ended',30);assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/Aftermath I/);
   const v=JSON.parse(globalThis.localStorage.getItem('lastlight.chapter8')||'{}');assert.deepEqual(v.home,['YOU','SAM']);assert.deepEqual(v.lost,['JAMIE','ALEX']);assert.equal(v.presence,'sealed');assert.equal(v.carried.cap,'you');});
  element('next-chapter').onclick?.();
  check(`${label}: the card, then the school on Saturday morning: on your bike, Sam beside you`,()=>{assert.ok(phase('a1-black',4));assert.ok(phase('a1-arrive',14));wait(1);assert.match(element('date').innerHTML,/AUGUST 27, 2011.*6:3\d AM/);assert.equal(h.night.state,'c1-ride');const s=C9().sam;assert.equal(s.mode,'ride');assert.ok(s.visible);
   assert.equal(C9().sky,'dawn');assert.ok(h.skyMat.uniforms.apoc.value<.12,'the red is all but gone');neverThere();});}
 // ---- Act I, scene 1: two bikes, the rack; the shelter ----
 if(inSeg('arrive')){start('arrive');
  check(`${label}: you ride in, get off, and wheel your bike into the rack`,()=>{const way=SP.way.map(([x,z])=>{const w=W(x,z);return [w.x,w.z];});assert.ok(rideTo(way,90,2.2),'rode to the rack');offBike();assert.equal(h.night.state,'c1-walk');
   assert.ok(take('rack',{hold:8,max:30,r:1.4}),'the rack');const r=W(SP.rackSlot.x,SP.rackSlot.z);assert.ok(Math.hypot(h.roam.x-r.x,h.roam.z-r.z)<.2,'your bike is in the rack');noThrow();});
  check(`${label}: Sam cannot let go of his; you take the handlebars; he gets off; Reyes is behind you`,()=>{assert.ok(until(()=>live('sam-bike'),80),'Sam has stopped');assert.equal(C9().sam.mode,'ride');assert.ok(take('sam-bike',{hold:8,max:20,r:1.5}));
   assert.ok(until(()=>C9().sam.mode==='foot',20),'he is off it');assert.ok(until(()=>A9.cast.reyes.visible,60),'Reyes');assert.ok(until(()=>ph()==='a1-gym',60));assert.ok(said('I can’t feel my hands'));noThrow();});
  lap('arrive');}
 if(inSeg('gym')){start('gym');
  check(`${label}: into the gym; Sam stops in the doorway and you stand with him`,()=>{const d=W(SP.vest.x,SP.vest.z+.5),i=W(SP.inside.x,SP.inside.z-1.4);assert.ok(approach(d,.7,{pad:10,max:40}),'the doors');assert.ok(approach(i,.8,{pad:10,max:30}),'inside');
   assert.ok(until(()=>live('sam-door'),40),'he has stopped in the doorway');if(!quietly)assert.ok(take('sam-door',{max:10,r:1.2,pad:10}));assert.ok(until(()=>!live('sam-door')&&quiet(),40));assert.ok(C9().inside>.6,'the light is the room’s');noThrow();});
  check(`${label}: the shelter is a shelter: people on cots, a volunteer who knows the name, FOUND across his flyer, and who looks past you`,()=>{const vis=A9.CTX.EVERYONE.filter(a=>a.visible&&SCH.where(a.x,a.z)==='gym').length;assert.ok(vis>=20,'people in the gym: '+vis);
   approach(W(-4.6,5.2),1,{pad:10,max:30});assert.ok(until(()=>said('he’s on the board')||said('He’s on the missing board'),60),'the volunteer');assert.ok(until(()=>A9.C.flags.boardFound,30),'FOUND');assert.ok(until(()=>said('Nobody else comes in'),40));assert.ok((A9.C.flags.looked||0)>=3,'people looked at you and then at the doors: '+A9.C.flags.looked);noThrow();});
  if(optional)check(`${label}: (optional) the board, the television, a cup of water`,()=>{if(take('board',{max:6,r:2.2,pad:10}))stepBack(40);until(quiet,30);approach(W(SP.aisleS.x,SP.aisleS.z),1,{pad:10,max:30});if(until(()=>live('water'),30))assert.ok(take('water',{max:4,r:1.6,pad:10}));noThrow();});
  check(`${label}: Reyes finds two cots; you sit down`,()=>{approach(W(SP.aisleN.x-.6,SP.aisleN.z+.3),.9,{pad:10,max:40});assert.ok(until(()=>live('sit'),90),'somewhere to sit');if(!quietly)assert.ok(take('sit',{max:10,r:1.3,pad:10}));assert.ok(phase('a1-jamie',40));noThrow();});
  lap('gym');}
 // ---- Act I, scene 2: Jamie's mother ----
 if(inSeg('jamie')){start('jamie');
  check(`${label}: Jamie's mother looks past you at the doors, and asks; ${quietly?'you cannot answer':'you say what you can'}; Reyes tells her, kneeling`,()=>{assert.ok(until(()=>said('Where’s Jamie'),60));const c=choose(pickN(2),30);assert.ok(c,'a choice was offered');
   assert.ok(until(()=>A9.C.flags.jmSat,90),'she is sat down, away from the cots');assert.ok(until(()=>said('He did.'),90));assert.ok(until(()=>said('What kind of a mother'),60));const f=A9.FACES.get(A9.cast.jamieMom);assert.ok(f.crying>.5,'she is crying: '+f.crying.toFixed(2));noThrow();neverThere();});
  check(`${label}: his cap: ${cap==='give-shelter'?'you hold it out, and it is hers':cap==='keep'&&quietly?'you keep hold of it':'you hold it out, and keep it safe for her'}`,()=>{assert.ok(until(()=>live('cap'),40),'the cap is in your hand');
   if(quietly){assert.ok(until(()=>!live('cap'),50));assert.equal(C9().keep.cap,'you');}
   else{if(A9.C.pose)take('stand-up',{max:4,r:9});assert.ok(take('cap',{max:10,r:1.6,pad:10}));const c=choose(cap==='give-shelter'?1:2,30);assert.equal(c,cap==='give-shelter'?'give':'keep');until(quiet,30);assert.equal(C9().keep.cap,cap==='give-shelter'?'mom':'you');}
   assert.ok(phase('a1-alex',60));noThrow();});
  lap('jamie');}
 // ---- Act I, scene 3: Alex's parents ----
 if(inSeg('alex')){start('alex');
  check(`${label}: Alex's father asks if he was where Sam was; Reyes takes them aside; his mother straightens Sam's collar`,()=>{assert.ok(until(()=>said('Was Alex there'),60));const c=choose(pickN(2),30);assert.ok(c);assert.ok(until(()=>said('He died about an hour ago'),120));assert.ok(until(()=>said('He liked that tree'),60));
   assert.ok(until(()=>said('get these boys a blanket'),90));const fm=A9.FACES.get(A9.cast.alexMom),fj=A9.FACES.get(A9.cast.jamieMom);assert.notEqual(fm.expression,fj.expression,'the two mothers are not the same face');noThrow();});
  check(`${label}: his father asks what he said; ${quietly?'you say nothing, and that is allowed':'you tell him'}`,()=>{assert.ok(until(()=>said('Did he say anything'),90));const c=choose(pickN(1),30);assert.ok(c);assert.ok(until(()=>said('I need you to know that I know that'),60));assert.ok(phase('a1-family',60));noThrow();});
  lap('alex');}
 // ---- Act I, scene 4: Sam's father; your mother ----
 if(inSeg('families')){start('families');
  check(`${label}: Sam will not go to his father until he says something it would not know; the fan`,()=>{assert.ok(until(()=>said('Say something it wouldn’t know'),60));assert.ok(until(()=>said('I left your fan on'),30));const sd=A9.cast.samDad;assert.ok(until(()=>Math.hypot(C9().sam.x-sd.x,C9().sam.z-sd.z)<1,20),'he goes to him');
   assert.ok(until(()=>said('Jamie’s dead'),40),'the relief has it in it');noThrow();});
  check(`${label}: your mother; somebody else is responsible for you now`,()=>{assert.ok(until(()=>said('I’ve got you. I’ve got you. I’ve got you.')&&A9.cast.mom.visible,60));assert.ok(until(()=>!!A9.C.pose,20),'she has you');assert.ok(until(()=>said('before you land'),80));assert.ok(phase('a1-quiet',30));noThrow();neverThere();});
  lap('families');}
 // ---- Act II, scene 5: the nurse's room ----
 const NS=SCH.NSPOT,RS=SCH.RSPOT;
 if(inSeg('quiet')){start('quiet');
  check(`${label}: the nurse's room, that afternoon: you wash your hands (the water goes grey, then clear); the cut; the paramedic dresses it`,()=>{assert.ok(phase('a1-quiet',60));assert.match(element('date').innerHTML,/AUGUST 27, 2011.*2:\d\d PM/);
   assert.ok(take('wash',{hold:10,max:90,r:1.1,pad:6}));assert.ok(until(()=>said('Keep it dry'),40));assert.ok(h.self.parts.lhand.children.some(c=>c.name==='a1-dressing'),'the dressing is on your hand');noThrow();});
  if(optional)check(`${label}: (optional) something to eat; his cap where you can see it`,()=>{if(maybe('eat',{r:1.4,wait:4}))until(quiet,20);if(C9().keep.cap==='you'&&maybe('cap-safe',{r:1.5,wait:2}))until(quiet,20);noThrow();});
  check(`${label}: Sam's father brings the fan from the office (he can't sleep without one)`,()=>{assert.ok(until(()=>said('Humor me'),120));assert.ok(A9.C.fanOn,'the fan is on');noThrow();});
  check(`${label}: Sam, the hinge and the chain; ${quietly?'you say nothing':'your hand on his back'}; he wants to sleep there`,()=>{assert.ok(until(()=>live('beside')||live('sit-cot'),60));if(!quietly)take('beside',{max:6,r:2.6,pad:6});
   assert.ok(until(()=>said('He did what I said'),120));const c=choose(pickN(3),30);assert.ok(c);assert.ok(until(()=>said('Wanting to sleep in the nurse’s room'),80));choose(pickN(2),20);
   assert.ok(until(()=>live('lie'),40));if(!quietly)assert.ok(take('lie',{max:6,r:9}));assert.ok(until(()=>ph()==='a1-record',90),'Sunday');noThrow();});
  lap('quiet');}
 // ---- Act II, scene 6: Reyes needs a record ----
 if(inSeg('record')){start('record');
  check(`${label}: Sunday, Room 6: you sit down; Reyes reads what he saw (the two Sams, the board, Jamie, Alex) and does not ask you to prove it`,()=>{assert.ok(phase('a1-record',30));assert.match(element('date').innerHTML,/AUGUST 28, 2011/);
   assert.ok(approach(W(RS.in.x,RS.in.z),.8,{pad:8,max:30}));assert.ok(take('sit',{max:40,r:1.2,pad:8}));assert.ok(until(()=>said('so it’s written'),150));assert.ok(A9.cast.mom.visible,'your mother is in the room');noThrow();});
  check(`${label}: you lay out what he kept, one thing at a time, in your own order; he reads it back`,()=>{const order=quietly?['plan','camera','notebook','sketch']:['sketch','plan','camera','notebook'];
   for(const id of order){assert.ok(until(()=>live('ev-'+id),60),'offered: '+id);assert.ok(take('ev-'+id,{max:8,r:1.5,pad:8})&&A9.C.ev.carrying===id,'took '+id+' (carrying '+A9.C.ev.carrying+')');putDown(40);assert.ok(take('slot',{max:20,r:1.2,pad:8}),'placed '+id);until(()=>!A9.C.ev.carrying,8);until(quiet,20);}
   assert.deepEqual(A9.C.ev.order,order,'laid out: '+JSON.stringify(A9.C.ev.order));assert.ok(until(()=>said(quietly?'That’s the order I’d have put them in':'In any order it’s true'),90));assert.equal(C9().keep.camera,'reyes');noThrow();});
  check(`${label}: what you want written down, beside his`,()=>{assert.ok(take('sit2',{max:30,r:1.2,pad:8}));assert.ok(until(()=>said('Anything I didn’t say'),40));
   if(quietly)choose(null,40);else{choose(1,30);until(()=>!!A9.C.choice||said('That’s it. That’s all I need'),40);if(A9.C.choice)choose(1,10);until(()=>!!A9.C.choice||said('That’s it'),40);if(A9.C.choice)choose(2,10);}
   assert.ok(until(()=>said('nobody gets to say it didn’t happen'),120));assert.ok(until(()=>ph()==='a1-names',40),'Monday');if(!quietly)assert.ok(C9().keep.told.record.includes('biscuit'));noThrow();});
  lap('record');}
 // ---- Act II, scene 7: the names that changed ----
 if(inSeg('names')){start('names');
  check(`${label}: Monday: the county's list has a line with no name; you can't reach the word; the names in your own handwriting`,()=>{assert.ok(phase('a1-names',30));assert.match(element('date').innerHTML,/AUGUST 29, 2011/);
   assert.ok(take('list',{max:60,r:1.8,pad:10}),'read the list');assert.ok(until(()=>said('a step that isn’t there'),60),'the word is not there');assert.ok(until(()=>C9().marks.some(m=>m[1].includes('I thought I remembered everyone')),10),'the memory line');
   assert.ok(take('notebook',{max:40,r:9}),'the notebook ('+C9().keep.notebook+'; offers '+offers().join(',')+')');putDown(40);noThrow();neverThere();});
  check(`${label}: you write his name on the line (hold F); the volunteer copies it; Sam: what it did is still done`,()=>{assert.ok(take('write',{hold:12,max:30,r:9}));assert.equal(C9().keep.wrote,true);assert.ok(until(()=>said('on the back of her hand'),40));
   assert.ok(until(()=>said('un-burn'),40));assert.ok(until(()=>ph()==='a1-return',60),'on to September');noThrow();});
  lap('names');}
 M9.seg=seg;M9.lines=lines.length;
 return {lines:()=>lines,seg};
}
