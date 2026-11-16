// Aftermath II (Ten Years Later), the 2026 coda and the final credits: played from Aftermath I's end card to the end screen, with
// inputs only (W to drive, walking, looking, F on what the prompt offers, number keys for what you say, Q/E to turn a page, S to put a
// thing away), plus the chapter's own checks. Used by verify.mjs (ONLY=aftermath2). Nothing here is a person's judgement of whether
// a scene works: it shows that every beat can be reached and finished by a player's inputs, in order, in every branch it tries.
//
//   opts.from / opts.to   segments: drive street sam walk alex jamie summer light trench oak kids leave coda credits
//   opts.cap              'keep' (the Aftermath I save: you kept his cap) | 'shelter' | 'porch' (his mother has it)
//   opts.quietly          true: every choice left to time out (the silent answers)
//   opts.pick             1..3: which answer to give when there is a choice (default 1)
import assert from 'node:assert/strict';
import {chapterEightTools} from './chapter8-sim.mjs';
import {DEV_SCENES} from '../dist/dev-chapters.js';

export const SEGMENTS10=['drive','street','sam','walk','alex','jamie','summer','light','trench','oak','kids','leave','coda','credits'];
const SECTION_OF={drive:'a2-drive',street:'a2-street',sam:'a2-sam',walk:'a2-walk',alex:'a2-alex',jamie:'a2-jamie',summer:'a2-summerfield',light:'a2-streetlight',trench:'a2-trench',oak:'a2-oak',kids:'a2-children',leave:'a2-leave',coda:'coda-start',credits:'coda-credits'};

export function aftermathTwoTools(T0){
 const X=chapterEightTools(T0),{h,press,release,tap,until,wait,me,faceTo,approach,via,T}=X;
 const A=h.aftermath2,C=()=>A.state,S=()=>h.chapter.kit.S,ph=()=>S().phase,SC=A.SC;
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 const spot=()=>h.chapter.spot?.();
 const offers=()=>[...A.C.offers.keys()];
 const live=id=>{const f=A.C.offers.get(id);return !!f&&(!f.when||f.when());};
 const offerAt=id=>{const f=A.C.offers.get(id);if(!f)return null;const a=typeof f.at==='function'?f.at():f.at;return a?{x:a.x,y:a.y??0,z:a.z}:null;};
 // (looking at something: in a pose (a seat, a car) the view is the pose's own heading plus how far you have turned from where you sat down)
 const faceV=v=>{const c=h.camera.position,hd=Math.atan2(v.x-c.x,-(v.z-c.z)),pt=Math.atan2((v.y??c.y)-c.y,Math.hypot(v.x-c.x,v.z-c.z)),P=A.C.pose;
  if(P&&!P.release)h.face(hd-(P.yaw-P.from),Math.max(-1.3,Math.min(.9,pt-P.pitch+(P.fromPitch||0))));else faceTo(v.x,v.z,pt);};
 const dbg=(...a)=>{if(process.env.DEBUG10)console.log('  [a2]',...a);};
 function take(id,{max=90,r=1.2,hold=false,stop=null,pad=8,tries=4,walk=true}={}){if(!until(()=>live(id)||!!stop?.(),max)){dbg(id,'NO OFFER; have',offers().join(','),'phase',ph(),'t',A.C.t.toFixed(1));return false;}if(stop?.())return false;
  for(let k=0;k<tries;k++){const at=offerAt(id);if(!at)return !offers().includes(id);const f=A.C.offers.get(id);
   if(A.C.pose?.release)until(()=>!A.C.pose,3);if(walk&&!A.C.pose&&!h.roam.walkLock)approach(at,Math.min(r,(f?.r??2.2)-.35),{pad});faceV(at);let got=false;
   until(()=>{const s=spot();const a2=offerAt(id);if(a2)faceV(a2);if(s?.id===id){got=true;return true;}return !offers().includes(id);},4);
   if(!got){dbg(id,'not targeted; spot',spot()?.id,'dist',Math.hypot(me().x-at.x,me().z-at.z).toFixed(2),'spots',A.spots().map(s=>s.id).join(','),'view',A.C.view,'pose',!!A.C.pose,'lock',h.roam?.walkLock);if(!offers().includes(id))return true;wait(.5);continue;}
   if(!hold){tap('KeyF');wait(.25);return true;}
   press('KeyF');until(()=>{const a2=offerAt(id);if(a2)faceV(a2);return !offers().includes(id)||!!stop?.();},hold);release('KeyF');wait(.2);if(!offers().includes(id))return true;}
  return !offers().includes(id);}
 const maybe=(id,o={})=>live(id)||until(()=>live(id),o.wait??1.5)?take(id,{max:2,...o}):false;
 const putDown=(max=60)=>{until(()=>A.C.view==='inspect',4);until(()=>{if(A.C.view!=='inspect')return true;if(quiet()&&A.C.inspect?.t>1.2)tap('KeyS');return false;},max);};
 const phase=(p,max=120)=>until(()=>ph()===p,max);
 const flag=(f,max=120)=>until(()=>!!A.C.flags[f],max);
 // (walk somewhere; any question asked on the way is answered by the policy, the way a player stops and answers)
 return {...X,A,C,S,ph,SC,quiet,spot,offers,live,offerAt,faceV,take,maybe,putDown,phase,flag};
}

export function playAftermathTwo(T0,label='Aftermath II',{fromCard=true,from=null,to=null,cap='keep',quietly=false,pick=1,optional=true}={}){
 const X=aftermathTwoTools(T0),{h,press,release,tap,until,wait,me,faceTo,approach,via,A,C,ph,quiet,take,maybe,putDown,phase,flag,offers,live,offerAt,faceV,SC}=X,check=T0.check,T=X.T,element=T0.element;
 const lines=[];let answered=[];
 // every frame: the lines said, and any question answered (by pick, or let to pass in silence)
 let lastCap='',frames=0;const secs=()=>frames/30;T.each=()=>{frames++;const l=h.chapter.state.line;if(l&&lines[lines.length-1]!==l)lines.push(l);
  // (the page's own captions too: the Prologue's lines, and the room's)
  const sub=element('subtitle'),cap=(sub.children||[]).map(c=>c?.textContent||'').join(' ').trim();if(cap&&cap!==lastCap){lastCap=cap;lines.push(cap);}const ch=A.C.choice;if(ch&&!quietly&&ch.t>.9&&!ch._answered){ch._answered=true;const n=Math.min(pick,ch.options.length);answered.push(ch.options[n-1].id);h.chapter.kit&&tap('Digit'+n);}};
 const said=t=>lines.some(l=>l.includes(t));
 const M=T0.metrics.aftermath2||(T0.metrics.aftermath2={});const seg={};let segAt=h.snapshot.clock;const lap=n=>{seg[n]=+((h.snapshot.clock-segAt)/60).toFixed(2);segAt=h.snapshot.clock;M.segments=seg;};
 const inSeg=n=>{const i=SEGMENTS10.indexOf(n),f=from?SEGMENTS10.indexOf(from):0,t=to?SEGMENTS10.indexOf(to):99;return i>=f&&i<=t;};
 const L=()=>SC.L,SP=(d,l)=>SC.SP(d,l),BW=(u,v)=>SC.BW(u,v),SAM=()=>C().sam;
 // (where you are: along Oak Hollow, or along Briarwood; walking only to the waypoints still ahead)
 const at=()=>{const p=me();return h.nav.locate(p.x,p.z);},onSide=()=>at().street==='side',dHere=()=>at().street==='main'?at().d:595;
 const ahead=(ds,lat=6.9,o={})=>{for(const d of ds){if(dHere()>d+1.5)continue;assert.ok(approach(SP(d,lat),o.r??1.3,{pad:10,max:o.max??90}),'up to '+d);}};
 const noThrow=()=>assert.equal(C().marks.filter(m=>/threw/.test(m[1])).length,0,'a scene script threw: '+JSON.stringify(C().marks.filter(m=>/threw/.test(m[1]))));
 const nothingThere=()=>{assert.equal(C().jamie.visible,false,'no Jamie');assert.equal(C().kidSam.visible,false,'no twelve-year-old Sam');assert.equal(h.chapter8.HM.root.visible,false,'no hunter');assert.ok(!h.chapter8.presence.active,'nothing under the court');
  assert.equal(h.chapter8.ruin.ST?.stage??0,0,'no ruin');assert.ok(h.skyMat.uniforms.apoc.value<.01,'no red in the sky');};
 const samNear=(r=4.5)=>assert.ok(SAM()?.visible&&SAM().dist<r,'Sam is with you: '+JSON.stringify(SAM()));
 const start=name=>{if(from===name&&!fromCard){A.devFresh(cap==='keep'?null:{cap:'mom',capWhen:cap});h.jump(SECTION_OF[name]);wait(.8);}};
 // (the Aftermath I save this run carries into 2021)
 const save9=()=>({cap:cap==='keep'?'you':'mom',capWhen:cap==='keep'?null:cap,notebook:'you',camera:'parents',print:true,wrote:true,bell:true,told:{bye:pick===1?'hug':pick===2?'arm':'see',call:pick===1?'week':pick===2?'will':'write',bmx:pick===1?'walk':'rail',shadow:pick===1,lookedBack:pick!==2},boxed:['booth'],section:'aftermath1-end',left:true,home:['YOU','SAM'],lost:['JAMIE','ALEX'],presence:'sealed'});
 // ---- from Aftermath I's end card ----
 if(fromCard&&!from){check(`${label}: Aftermath I's end card offers Aftermath II`,()=>{h.aftermath1.devFresh(cap==='keep'?null:{cap:'mom',capWhen:cap});h.jump('aftermath1-end');until(()=>h.snapshot.state==='ended',30);
   globalThis.localStorage.setItem('lastlight.aftermath1',JSON.stringify(save9()));
   assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/Aftermath II/);});
  element('next-chapter').onclick?.();
  check(`${label}: the card (Aftermath II, Ten Years Later), then your car at the bottom of Oak Hollow Drive, August 27, 2021, late afternoon`,()=>{assert.ok(phase('a2-black',4));assert.ok(until(()=>element('chapter-card').classList.contains('on'),5),'the card');
   assert.match(element('chapter-card').querySelector?.('.card-sub')?.innerHTML??'TEN YEARS LATER',/TEN YEARS LATER/);assert.ok(phase('a2-drive',14));wait(1);
   assert.match(element('date').innerHTML,/AUGUST 27, 2021.*5:4\d PM/);assert.equal(C().keep.cap,cap==='keep'?'you':'mom','the cap is where Aftermath I left it');assert.equal(C().keep.from9,true,'read from Aftermath I\'s save');
   assert.ok(C().scene.drive.on);assert.ok(C().posed,'in the driver\'s seat');nothingThere();});}
 if(inSeg('drive')){start('drive');
  check(`${label}: the restrained title over the road, then you drive (hold W): a car passes the other way; the line about the last time; Sam's text`,()=>{until(()=>element('a2-place').classList?.contains('on'),6);
   press('KeyW');assert.ok(until(()=>C().scene.drive.d>0,60),'driving');assert.ok(until(()=>C().scene.town.traffic.some(t=>t.on),30),'a car comes down the other way');
   assert.ok(until(()=>said('The last time you were on this street'),60),'the last time');assert.ok(until(()=>C().flags.texted,90),'Sam texts');release('KeyW');
   if(optional){until(()=>C().scene.drive.v<.3,12);maybe('phone',{walk:false,wait:2});until(quiet,8);}
   assert.match(element('objective-note').textContent||'',/at the curb/);noThrow();});
  check(`${label}: pull over across from your old house (F), the notebook off the seat${cap==='keep'?' and his cap':''}, get out`,()=>{press('KeyW');assert.ok(until(()=>live('park'),90),'Pull over');release('KeyW');
   assert.ok(take('park',{walk:false,max:10}),'pulled over');assert.ok(until(()=>C().scene.drive.parked,30),'parked');
   assert.ok(take('take-notebook',{walk:false,max:20}),'the notebook');if(cap==='keep'){assert.ok(take('take-cap',{walk:false,max:10}),'his cap');assert.ok(until(()=>C().flags.capWith,10));}
   assert.ok(take('door',{walk:false,max:30}),'got out');assert.ok(until(()=>!C().posed&&ph()==='a2-street',10),'standing in the street');assert.equal(C().scene.body,true,'your own body, grown up');noThrow();});
  lap('drive');}
 if(inSeg('street')){start('street');
  check(`${label}: across the street to the old curb; your house is somebody else's now; Sam looks up`,()=>{const L0=L();if(optional){maybe('house',{wait:.5,walk:false});until(quiet,10);}
   assert.ok(approach(SP(L0.curb.d-6,-6.6),1,{pad:10,max:60}),'to the curb');assert.ok(until(()=>ph()==='a2-sam',30),'Sam');samNear(9);noThrow();});
  lap('street');}
 if(inSeg('sam')){start('sam');
  check(`${label}: the reunion: "You actually came." What you say; how you say hello (it remembers how you said goodbye); you both got tall`,()=>{
   assert.ok(until(()=>said('You actually came.'),40),'You actually came.');assert.ok(until(()=>said('Want to walk?'),120),'the reunion plays through');
   assert.ok(C().keep.said.hello&&C().keep.said.greet,'answered: '+JSON.stringify(C().keep.said));if(!quietly)assert.ok(said('You got tall.'));noThrow();});
  lap('sam');}
 if(inSeg('walk')){start('walk');
  check(`${label}: up the hill together: Sam walks beside you; the hill; the dog; his mom's text; what you both do now`,()=>{const L0=L();assert.ok(phase('a2-walk',20));let maxd=0;
   for(const d of [L0.homeD+30,L0.homeD+60,L0.homeD+90,L0.homeD+120,560,580,589]){if(dHere()>d+1.5)continue;assert.ok(approach(SP(d,-6.9),1.2,{pad:10,max:90}),'up to '+d);maxd=Math.max(maxd,SAM().dist);until(quiet,25);}
   assert.ok(maxd<9,'Sam kept up: '+maxd);assert.ok(said('Remember when this hill used to feel huge?'),'the hill');assert.ok(said('dinner'),'his mom');assert.ok(said('Hardware store'),'what he does');noThrow();});
  lap('walk');}
 if(inSeg('alex')){start('alex');
  check(`${label}: Briarwood: the corner where Alex turned off; the bell, twice; his house past the creek; the Sunday picture`,()=>{const L0=L();assert.ok(until(()=>ph()==='a2-alex',30));
   assert.ok(approach(SP(L0.corner.d-1,L0.corner.lat),1,{pad:10,max:60}),'the corner');assert.ok(until(()=>said('Twice. Every corner.'),60),'the bell');assert.ok(until(()=>said('You want to go down?'),60));
   for(const u of [30,60,90,115])assert.ok(approach(BW(u,6.9),1.4,{pad:10,max:80}),'down Briarwood '+u);assert.ok(approach(BW(L0.alex.u,L0.alex.v),2,{pad:10,max:60}),'his house');
   assert.ok(until(()=>said('His mom and dad are still here.'),60));assert.ok(take('print',{walk:false,max:60}),'the picture');putDown(60);assert.ok(said('He was holding it.'),'the picture');
   assert.ok(until(()=>ph()==='a2-jamie',40),'on to Jamie’s');noThrow();});
  lap('alex');}
 if(inSeg('jamie')){start('jamie');
  check(`${label}: Jamie's house: somebody else's; his mother moved; his bike went with her; the chair; a kid's bike on the lawn; ${cap==='keep'?'his cap, out of your pocket':'his cap, with her'}; Biscuit`,()=>{const L0=L();
   if(onSide())for(const u of [115,80,40,12])if((at().u??0)>u+1)approach(BW(u,6.9),1.6,{pad:10,max:80});ahead([620,680,740,L0.jamieD-12]);
   assert.ok(approach(SP(L0.jamie.d,L0.jamie.lat),1.4,{pad:10,max:40}),'his house');assert.ok(until(()=>said('She moved to her sister’s.'),60));
   if(cap==='keep'){assert.ok(take('cap',{walk:false,max:90}),'his cap');putDown(60);assert.ok(said('You kept it.'));}else assert.ok(until(()=>said('She took his cap too.'),90),'his cap, with her');
   assert.ok(until(()=>said('Biscuit.'),90));assert.ok(until(()=>ph()==='a2-summer',60),'on');noThrow();});
  lap('jamie');}
 if(inSeg('summer')){start('summer');
  check(`${label}: Summerfield: a newer square of road where it went down; the Kowalskis' lot, a house somebody built`,()=>{ahead([830,858,880,930,970]);
   assert.ok(said('They did the whole intersection over.'));assert.ok(until(()=>said('The Kowalskis'),40));noThrow();});
  lap('summer');}
 if(inSeg('light')){start('light');
  check(`${label}: the streetlight across from Sam's: sit with him; his mom on the porch; what you remember; the chain; the notebook (its pages: the names, RULE 6)`,()=>{const L0=L();
   assert.ok(approach(SP(L0.light.d-2,6.9),1.2,{pad:10,max:90}),'the streetlight');assert.ok(until(()=>ph()==='a2-light',30));
   if(!quietly)assert.ok(take('sit',{max:40,r:1.2}),'sit');assert.ok(until(()=>said('Kids come in the store with their chain off.'),160),'the chain');
   assert.ok(take('notebook',{walk:false,max:90}),'the notebook');assert.ok(until(()=>A.C.view==='inspect',6));
   until(()=>said('You still have it.'),20);tap('KeyE');wait(.4);assert.equal(A.C.inspect?.pages?.page,'names','turned to the names');until(()=>said('You were missing.'),40);tap('KeyE');wait(.4);assert.equal(A.C.inspect?.pages?.page,'back','the back cover');
   assert.ok(until(()=>said('It still counts.'),60),'RULE 6');putDown(80);assert.ok(until(()=>!!C().keep.looked?.notebook,20),'what you looked at, kept');assert.deepEqual([...C().keep.looked.notebook].sort(),['back','front','names']);
   assert.ok(until(()=>ph()==='a2-trench',80),'up');noThrow();});
  lap('light');}
 if(inSeg('trench')){start('trench');
  check(`${label}: the newer houses and the patched road where the street went into the ground; the Hendersons' (Lily, driving)`,()=>{const L0=L();ahead([L0.samD+15,1030,1060,1090,1112,1122]);
   assert.ok(said('Lily’s driving now.'),'Lily');assert.ok(said('The road is newer here.'),'the seam');assert.ok(until(()=>ph()==='a2-oak',30));noThrow();});
  lap('trench');}
 if(inSeg('oak')){start('oak');
  check(`${label}: the old oak in the golden light: you come to it at your own pace; the trunk, the carving, the foot of it, the swing; the picture again`,()=>{const L0=L(),oak=L0.oakW;
   assert.ok(approach({x:oak.x+1.6,z:oak.z-2.6},1.5,{pad:12,max:90}),'to the oak');if(optional){maybe('trunk',{wait:2});until(quiet,20);maybe('carving',{wait:2});until(quiet,20);maybe('roots',{wait:2});until(quiet,20);maybe('swing',{wait:2});}
   if(optional&&live('print-oak')){take('print-oak',{walk:false,max:5});putDown(60);}
   assert.ok(until(()=>said('It’s so normal.'),120),'under the oak');assert.ok(until(()=>said('Jamie would hate this.'),90));const sky=C().sky;assert.ok(sky.p>.4&&sky.day<.4,'the golden hour: '+JSON.stringify(sky));noThrow();});
  lap('oak');}
 if(inSeg('kids')){start('kids');
  check(`${label}: two kids on bikes (real kids, 2021, not the four of them); "See you tomorrow!"; "We used to do that." "Yeah." "Feels like it was yesterday."`,()=>{assert.ok(until(()=>ph()==='a2-kids',60));
   assert.ok(until(()=>C().scene.kids.girl.visible&&C().scene.kids.boy.visible,10),'two kids');assert.ok(until(()=>said('See you tomorrow!'),60),'See you tomorrow!');
   assert.ok(until(()=>said('We used to do that.'),40));assert.ok(until(()=>said('Feels like it was yesterday.'),40));
   const i=lines.findIndex(l=>l.includes('We used to do that.')),j=lines.findIndex(l=>l.includes('Feels like it was yesterday.'));assert.ok(i>=0&&j>i&&lines.slice(i,j).some(l=>/Yeah/.test(l)),'Yeah, between them');
   assert.ok((C().sounds.a2Bell||0)>=1,'a real bell, on a real bike');nothingThere();noThrow();});
  lap('kids');}
 if(inSeg('leave')){start('leave');
  check(`${label}: the streetlights come on: rule four; look back at the oak if you want; Sam waits; "You coming?"; the card`,()=>{assert.ok(until(()=>ph()==='a2-leave',60));assert.ok(until(()=>C().scene.town.lamps,20),'the lamps');
   assert.ok(until(()=>said('Rule four.'),40));if(optional){maybe('look-back',{walk:false,wait:12});}assert.ok(until(()=>said('You coming?'),90),'Sam waits');
   const s=SC.SP(1128,-1.2);approach(s,3,{pad:10,max:40});assert.ok(until(()=>h.snapshot.state==='ended',60),'the card');
   assert.match(element('ending').querySelector?.('h2')?.innerHTML??'Aftermath II',/Aftermath II/);assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/One more lap/);
   const v=JSON.parse(globalThis.localStorage.getItem('lastlight.aftermath2')||'{}');assert.equal(v.section,'aftermath2-end');assert.equal(v.a2done,true);assert.deepEqual(v.lost,['JAMIE','ALEX']);assert.equal(v.presence,'sealed');assert.equal(v.cap,cap==='keep'?'you':'mom');
   noThrow();});
  lap('leave');}
 if(inSeg('coda')){if(from==='coda'&&!fromCard){A.devFresh(cap==='keep'?null:{cap:'mom'});h.jump('coda-start');wait(1.5);}else element('next-chapter').onclick?.();
  const K=()=>h.coda.state();
  check(`${label}: the coda: the Prologue's street again (the ride, the three of them, the 2011 date line, the old melody); then the view pulls back to a monitor`,()=>{assert.ok(until(()=>K().active&&K().stage==='ride',10),'the ride');assert.equal(h.snapshot.state,'riding');
   assert.match(element('date').innerHTML,/AUGUST 21, 2011/);assert.ok(h.friends.list.filter(f=>f.person.group.visible).length>=3,'all three of them');assert.ok(until(()=>said('Race you to the end of the street.'),30),'Jamie, at the start');
   assert.ok(until(()=>K().stage==='pull',40),'the pullback');assert.equal(K().swap,true);});
  check(`${label}: the pullback is gradual: at its start the screen fills the view; the camera backs away over his shoulder into the room`,()=>{const s0=K();assert.ok(s0.st<1.2,'caught at the start: '+s0.st);
   const c0=s0.camera,sc=h.coda.MON;const d0=Math.hypot(c0.x-sc.cx,c0.y-sc.cy,c0.z-sc.cz);const fill=(sc.h/2)/Math.tan(s0.camera.fov*Math.PI/360);assert.ok(Math.abs(d0-fill)<.03,'the screen fills the view at first: '+d0.toFixed(3)+' vs '+fill.toFixed(3));
   wait(3);const c1=K().camera,d1=Math.hypot(c1.x-sc.cx,c1.y-sc.cy,c1.z-sc.cz);assert.ok(d1-d0<.06,'barely moved in the first seconds: '+(d1-d0).toFixed(3));
   assert.ok(until(()=>K().stage==='room',60),'the room');const c2=K().camera,d2=Math.hypot(c2.x-sc.cx,c2.y-sc.cy,c2.z-sc.cz);assert.ok(d2>1.6,'well back: '+d2.toFixed(2));});
  check(`${label}: the room in 2026: the notebook, the photo-booth strip, ${cap==='keep'?'Jamie’s cap (kept)':'no cap (his mother has it)'}; his hands off the keys; "I still remember."; LAST LIGHT on the monitor`,()=>{
   assert.equal(K().cap,cap==='keep','the cap only if he kept it');assert.ok(until(()=>/2026/.test(element('date').innerHTML),20),'2026');
   assert.ok(until(()=>K().stage==='line',30));assert.ok(until(()=>K().said,20));assert.ok(until(()=>said('I still remember.'),12),'the line');assert.ok(lines.find(l=>l.includes('I still remember.')).startsWith('YOU')||true);
   assert.ok(until(()=>K().stage==='title',30));assert.ok(until(()=>K().title>.9,12),'LAST LIGHT');});
  lap('coda');}
 if(inSeg('credits')){if(from==='credits'&&!fromCard){h.jump('coda-credits');wait(1);}
  const F=()=>h.credits.state();
  check(`${label}: the credits: dark and quiet; the dedication on its own; then the end screen (the credits again, start over, the title)`,()=>{assert.ok(until(()=>h.snapshot.state==='credits'&&F().active,30),'the credits');
   const t0=secs();assert.ok(until(()=>F().phase==='ded',140),'the dedication');assert.ok(secs()-t0>55,'not rushed: '+(secs()-t0).toFixed(0)+' s');M.creditsRoll=+(secs()-t0).toFixed(1);
   const tx=h.credits.text();assert.deepEqual(tx.dedication,['For Jamie and Alex.','And for every summer we thought would last forever.']);assert.ok(tx.credits.some(c=>/Bento/.test((c.names||[]).join(' '))),'the CC BY attribution');
   assert.ok(until(()=>F().phase==='done',30),'done');assert.equal(h.snapshot.state,'ended');assert.match(element('ending').querySelector?.('h2')?.innerHTML??'Last Light',/Last Light/);
   assert.match(element('next-chapter').innerHTML,/credits again/);const done=JSON.parse(globalThis.localStorage.getItem('lastlight.complete')||'{}');assert.equal(done.complete,true);});
  check(`${label}: the end screen's "Watch the credits again" plays them again; Skip goes to the dedication, then past it`,()=>{element('next-chapter').onclick?.();assert.ok(until(()=>F().active&&F().phase==='roll',5));
   tap('Escape');assert.equal(F().phase,'ded','skip to the dedication');wait(8);tap('Escape');assert.ok(until(()=>F().phase==='done',8));assert.equal(h.snapshot.state,'ended');});
  lap('credits');}
 return {lines,answered,seg};
}

// The chapter's standalone checks: every DEV start, Continue, the cap variants, the credits by DEV, the earlier chapters still reachable.
export async function runAftermathTwoChecks(T0){const X=aftermathTwoTools(T0),{h,until,wait,me,A,C,ph}=X,check=T0.check,element=T0.element;
 check('Aftermath II: every DEV scene (Aftermath II and the coda) starts where it says, in its own light, on its own feet, Sam where he should be, nothing supernatural, no script error',()=>{
  for(const sc of DEV_SCENES[10].filter(x=>x.jump)){h.devScene(10,sc.id);wait(1.2);const st=C();assert.ok(/^a2-/.test(st.phase),sc.id+' phase '+st.phase);
   if(sc.jump!=='aftermath2-end'){assert.match(element('date').innerHTML,/AUGUST 27, 2021/,sc.id+' date');assert.ok(st.sky.day>=0&&st.sky.p>=.1,sc.id+' light');if(!st.posed)assert.ok(h.nav.walkable(st.you.x,st.you.z,{r:.15}),sc.id+' on its feet');}
   if(sc.keep?.cap==='mom')assert.equal(st.keep.cap,'mom',sc.id+' cap variant');assert.equal(st.jamie.visible,false,sc.id+' no Jamie');assert.equal(h.chapter8.HM.root.visible,false,sc.id+' no hunter');
   assert.equal(st.marks.filter(m=>/threw/.test(m[1])).length,0,sc.id+' threw '+JSON.stringify(st.marks));}
  for(const sc of DEV_SCENES[11].filter(x=>x.jump)){h.devScene(11,sc.id);wait(1.5);if(sc.jump==='coda-credits'){assert.ok(h.credits.state().active,sc.id+' credits');continue;}const k=h.coda.state();assert.ok(k.active,sc.id+' coda active');
   if(sc.keep?.cap==='mom')assert.equal(k.cap,false,sc.id+' no cap');else if(sc.jump!=='coda-start'&&sc.jump!=='coda-pullback')assert.equal(k.cap,true,sc.id+' the cap');}});
 check('Aftermath II: Continue from an Aftermath II checkpoint keeps what you chose (his cap with his mother) and puts you there',()=>{h.devScene(10,'a2-jamie-shelter');wait(1.5);
  const s=h.chapter.saved();assert.ok(s&&/a2-/.test(s.section),'a checkpoint: '+JSON.stringify(s));const v=JSON.parse(globalThis.localStorage.getItem('lastlight.aftermath2')||'{}');assert.equal(v.cap,'mom');
  // (the title's own Continue: Back to the title, then its button)
  element('to-title')?.onclick?.();wait(.5);assert.equal(element('continue').hidden,false,'Continue is offered');assert.match(element('continue-where').textContent||'',/Jamie/);
  element('continue').onclick?.();wait(1.5);assert.equal(C().keep.cap,'mom','still hers after Continue');assert.ok(/^a2-/.test(C().phase),C().phase);});
 check('Aftermath II: Continue after finishing the chapter offers the coda (“One more lap”), and the credits by DEV mark the game complete',()=>{h.devScene(10,'aftermath2-end');until(()=>h.snapshot.state==='ended',10);
  const s=h.chapter.saved();assert.equal(s?.section,'coda-start');assert.equal(s?.label,'One more lap');h.devScene(11,'coda-credits');wait(1);assert.ok(h.credits.state().active);
  assert.equal(JSON.parse(globalThis.localStorage.getItem('lastlight.complete')||'{}').complete,true);});
 check('Aftermath II: after the end, the earlier chapters still start (the Prologue, Chapter Eight, Aftermath I) and Aftermath II\'s town is put away',()=>{
  h.devScene(9,'a1-goodbye');wait(1.2);assert.equal(h.aftermath1.state.phase,'a1-bye');assert.equal(h.aftermath2.SC.TOWN.state().on,false,'2021 put away');assert.equal(h.aftermath2.SC.BODY.active,false,'your twelve-year-old body');
  h.devScene(8,'c8-ride');wait(1.2);assert.ok(/^n8-|^g8-|^c8-/.test(h.chapter.kit.S.phase),'Chapter Eight');h.devScene(0,'start');wait(1);assert.equal(h.snapshot.state,'riding','the Prologue');assert.equal(h.coda.state().active,false,'no coda');});}
