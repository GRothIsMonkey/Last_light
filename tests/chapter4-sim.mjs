// Chapter Four in the simulation harness: played the way a player would (walking and riding with the keys,
// turning to look, pressing F where the prompt says, V for Alex's camera), straight on from Chapter Three's end
// card; then every QA jump, alias and checkpoint, Continue and Start over, seeded randomized runs through the
// fallbacks (a player who idles, wanders, never takes the picture, never answers), what each scare is when it
// happens (who is where, what the light does), and the DEV selector's Chapter Four against arriving naturally.
// Called from verify.mjs with the running harness; real dist/ modules.
import assert from 'node:assert/strict';
import {chapterThreeTools} from './chapter3-sim.mjs';
import {connAt,TL} from '../dist/town-plan.js';

export function chapterFourTools(T){
 const X=chapterThreeTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo,go}=X;
 const C4=()=>h.chapter4.state,A4=h.chapter4,at=A4.at;
 const uv=(p=me())=>TL(p.x,p.z);
 const where=()=>{const p=me(),L=h.nav.locate(p.x,p.z);return L.street==='town'?'town-'+L.w.zone:L.street;};
 const goUV=(u,v,o={})=>go(at(u,v),{max:90,...o});
 const faceUV=(u,v,y,pitch=0)=>{const q=at(u,v,y);faceTo(q.x,q.z,pitch);};
 const M=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];};
 const B2=h.world.sideFrames[1],S2=(u,v)=>{const p=B2.point(u,v);return [p.x,p.z];};
 const TP=(u,v)=>{const q=at(u,v);return [q.x,q.z];},CN=(s,t)=>{const q=connAt(s,t);return [q.x,q.z];};
 // the route downtown and back, as a rider takes it: Oak Hollow, Summerfield Road, Old Mill Road, Main Street
 const routeDown=()=>{const pts=[];for(let d=995;d>=884;d-=12)pts.push(M(d,-2.2));for(let u=6;u<=246;u+=12)pts.push(S2(u,-1.6));for(let s=4;s<=168;s+=10)pts.push(CN(s,1.4));for(let u=-78;u<=-30;u+=8)pts.push(TP(u,-3));return pts;};
 const routeHome=(u0=100)=>{const pts=[];for(let u=u0;u>=-74;u-=10)pts.push(TP(u,3.2));for(let s=166;s>=4;s-=10)pts.push(CN(s,-1.4));for(let u=244;u>=8;u-=12)pts.push(S2(u,1.6));for(let d=880;d<=1132;d+=12)pts.push(M(d,1.8));return pts;};
 const offBike=()=>{if(h.night.state==='c1-ride'){release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');tap('KeyF');until(()=>h.night.state==='c1-walk',4);wait(.3);}};
 const onBike=()=>{if(h.night.state==='c1-walk'){if(C4().view)tap('KeyV');wait(.5);const r=h.night.roam;go({x:r.x,z:r.z},{r:1.2,max:40});const p=me();if(Math.hypot(p.x-r.x,p.z-r.z)>1.7)walkTo([[r.x,r.z]],{r:1.2,max:15});faceTo(r.x,r.z);wait(.2);tap('KeyF');until(()=>h.night.state==='c1-ride',4);}};
 const rideTo=(pts,max=200,r=2.8,stop=null,each=null)=>{h.drive(pts,{r});const ok=until(()=>{each?.();return !h.driving||!!stop?.();},max);h.stopDriving();return ok;};
 const companionsFinite=()=>h.chapter.companions.all.every(c=>!c.active||Number.isFinite(c.bx+c.bz+c.px+c.pz));
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 return {...X,C4,A4,at,uv,where,goUV,faceUV,M,S2,TP,CN,routeDown,routeHome,offBike,onBike,rideTo,companionsFinite,quiet};
}

// From Chapter Three's end card (or the chapter's own start) to Chapter Four's end card, with inputs only.
const clamp1=(x,a,b)=>Math.max(a,Math.min(b,x));
export function playChapterFour(T,label,{fromCard=true,dev=false}={}){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterFourTools(T),{C1,C4,A4,at,uv,where,goUV,faceUV,routeDown,routeHome,offBike,onBike,companionsFinite,quiet,log,until,wait,me,faceTo,go}=X;
 const M2=/replay/.test(label)?{}:metrics,said=()=>log.said,saidIdx=l=>log.said.indexOf(l);
 const watch={streets:[],jumps:0,maxStep:0,lampsLit:[],dayDrop:0,lastDay:null,boysToGangway:99,crMin:99,passMin:99,cower:0,claw:0,carGap:99,people:0,cars:0,moving:0,bad:0,kills:[],lastP:null,sky:[]};
 const sample=()=>{const s=C4(),p=me(),w=where();if(watch.streets[watch.streets.length-1]!==w)watch.streets.push(w);
  const ns=h.night.state,clk=h.snapshot.clock;if(watch.lastP&&watch.lastP.state===ns&&clk-watch.lastP.clk<.05){const d=Math.hypot(p.x-watch.lastP.x,p.z-watch.lastP.z);if(d>1.2&&A4.C.fadeOut<0)watch.jumps++;if(d>watch.maxStep){watch.maxStep=d;watch.maxAt={phase:s.phase,state:ns,from:watch.lastP,to:{x:+p.x.toFixed(2),z:+p.z.toFixed(2)},where:w,clock:+h.snapshot.clock.toFixed(2)};}}watch.lastP={x:+p.x.toFixed(2),z:+p.z.toFixed(2),state:ns,clk};
  if(!companionsFinite())watch.bad++;
  const ph=s.phase;if(/^(d4-closing|e4-)/.test(ph)){watch.lampsLit.push(s.presence.lampsLit);const d=h.chapter4.sky().day;if(watch.lastDay!==null&&d>watch.lastDay+1e-6)watch.dayDrop++;watch.lastDay=d;}
  if(ph==='e4-alex'){const g=at(126.8,-11);for(const c of h.chapter.companions.all)if(c.active)watch.boysToGangway=Math.min(watch.boysToGangway,Math.hypot((c.mode==='ride'?c.bx:c.px)-g.x,(c.mode==='ride'?c.bz:c.pz)-g.z));}
  const cr=h.chapter3.creature;if(cr.group.visible){const q=cr.group.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(/^e4-/.test(ph))watch.crMin=Math.min(watch.crMin,d);else watch.passMin=Math.min(watch.passMin,d);watch.cower=Math.max(watch.cower,cr.drive.cower||0);if(cr.slip!==undefined)watch.slip=Math.max(watch.slip||0,cr.slip);watch.claw=Math.max(watch.claw,cr.drive.claw||0,cr.drive.rear||0);}
  if(/^d4-(town|library)$/.test(ph)){const L=s.life;watch.people=Math.max(watch.people,L.people.length);watch.cars=Math.max(watch.cars,L.cars.length);watch.moving=Math.max(watch.moving,L.moving);
   for(const c of A4.life.cars)if(c.mode==='drive'&&c.g.visible)for(const o of [p,...h.chapter.companions.all.filter(c2=>c2.active).map(c2=>({x:c2.mode==='ride'?c2.bx:c2.px,z:c2.mode==='ride'?c2.bz:c2.pz}))])watch.carGap=Math.min(watch.carGap,Math.hypot(c.x-o.x,c.z-o.z)-c.L/2);}};
 const U=(fn,max)=>until(()=>{sample();return fn();},max);
 const rideTo=(pts,max,r,stop)=>X.rideTo(pts,max,r,stop,sample);
 const t0=h.snapshot.clock;
 // ---- the hand-over -------------------------------------------------------------------------------------------------
 let cardSeen=false,overBlack=1;
 if(dev){/* (the DEV selector's Chapter Four Start: the real hand-over, as a tester gets it) */h.devStart(4);T.advance?.(1/30);}
 else if(fromCard){check(`${label}: Chapter Three ends on its card, and the card leads on to Chapter Four`,()=>{assert.equal(h.snapshot.state,'ended');assert.equal(element('ending').querySelector?.('h2')?.innerHTML??'Chapter Three','Chapter Three');assert.equal(element('next-chapter').hidden,false);});
  element('next-chapter').onclick();}
 else h.jump('chapter4-start');
 U(()=>{if(element('chapter-card').classList.contains('on')){cardSeen=true;overBlack=Math.min(overBlack,+element('fade').style.opacity);}return C4().phase==='d4-sam';},20);
 check(`${label}: a quiet CHAPTER FOUR card over black, then the next afternoon at Sam’s (August 23, 1:52 PM)`,()=>{assert.ok(cardSeen,'card');assert.ok(overBlack>.99,'over black '+overBlack);assert.equal(h.snapshot.state,'c1-walk');
  assert.ok(element('date').innerHTML.includes('AUGUST 23, 2011'),element('date').innerHTML);assert.equal(element('ending').hidden,true);assert.equal(h.nav.townOpen,true);});
 // ---- Sam's house: his mother, the backpack, the camera ----------------------------------------------------------------
 U(()=>C4().flags.bagReady,60);
 check(`${label}: Sam’s mom: the police called, Alex’s backpack, home before the streetlights`,()=>{for(const l of ['SAM’S MOM: “Officer Reyes called again. Nothing new.”','SAM’S MOM: “I found Alex’s backpack in the garage this morning. He must have left it here Saturday.”',
  'SAM’S MOM: “And I want all three of you home before the streetlights come on. I mean it.”'])assert.ok(said().includes(l),l);assert.equal(C1().objective,'Look in Alex’s backpack.');});
 const b=A4.bag.position;go(b,{r:1.6,max:20});faceTo(b.x,b.z,-.6);wait(.3);
 check(`${label}: F at the backpack`,()=>assert.equal(h.ui.promptText,'F:Look in Alex’s backpack'));tap('KeyF');
 U(()=>C4().view==='camera',30);
 check(`${label}: his camera, from the front pocket, playback in your hands (A/D, W/S, V)`,()=>{assert.ok(said().includes('JAMIE: “His camera.”'));assert.equal(C4().inv.camera,true);assert.equal(C4().photos.open,true);assert.ok(/A \/ D/.test(h.ui.promptText),h.ui.promptText);});
 // browse; at each picture with the old bike in it, magnify on it (F: a friend's finger on the screen)
 const P=A4.photo,found=[];
 for(const id of ['oak-sunset','briarwood','creek','mason']){const i=P.photos.findIndex(p=>p.id===id);let n=0;while(C4().photos.index<i&&n++<20){tap('KeyD');U(()=>false,.4);}U(()=>false,1.2);
  if(id==='briarwood'){tap('KeyW');U(()=>false,.4);tap('KeyW');U(()=>false,.6);}/* (magnify yourself on this one) */
  tap('KeyF');if(U(()=>C4().found.includes(id),8))found.push(id);U(()=>quiet(),12);}
 check(`${label}: the old bike in the background of four pictures, the last downtown at Mason’s`,()=>{assert.deepEqual(found,['oak-sunset','briarwood','creek','mason']);assert.ok(said().includes('JAMIE: “Mason’s. The old bike shop.”'));
  assert.ok(said().includes('JAMIE: “It’s in all of them.”')||said().includes('SAM: “It’s in this one too.”'));});
 U(()=>C4().phase==='d4-ride',40);tap('KeyV');U(()=>false,.8);onBike();
 check(`${label}: "Ride downtown." — on the bike, Jamie and Sam with you`,()=>{assert.equal(C1().objective,'Ride downtown.');assert.equal(h.night.state,'c1-ride');});
 // ---- the ride downtown --------------------------------------------------------------------------------------------------
 const rideStart=h.snapshot.clock,s0=Math.max(0,watch.streets.length-1);rideTo(routeDown(),300,3,()=>C4().phase==='d4-town');
 const rideTime=h.snapshot.clock-rideStart;
 check(`${label}: a real ride downtown: Oak Hollow, Summerfield Road, Old Mill Road, Main Street; no teleport`,()=>{const seq=watch.streets.slice(s0);assert.equal(C4().phase,'d4-town',JSON.stringify(seq));
  for(const s of ['main','side2','town-conn','town-core'])assert.ok(seq.includes(s),s+' '+JSON.stringify(seq));assert.ok(seq.indexOf('side2')<seq.indexOf('town-conn')&&seq.indexOf('town-conn')<seq.indexOf('town-core'));assert.ok(rideTime>80,'ride time '+rideTime);
  assert.ok(watch.maxStep<1.2,'max step '+watch.maxStep+' '+JSON.stringify(watch.maxAt));});
 M2['chapter4 ride downtown seconds']=+rideTime.toFixed(1);
 // ---- Main Street by day -----------------------------------------------------------------------------------------------------
 rideTo([[-20,-3.4],[20,-3.4],[60,-3.4],[100,-3.4],[126,-4.2],[131,-5]].map(([u,v])=>X.TP(u,v)),140,2.4);X.brake();offBike();U(()=>C4().flags.mason,12);
 check(`${label}: an ordinary Tuesday downtown: people about, cars parked and moving, stopping for you`,()=>{assert.ok(watch.people>=8,'people '+watch.people);assert.ok(watch.cars>=6,'cars '+watch.cars);assert.ok(watch.carGap>1.5,'closest a moving car came '+watch.carGap);});
 goUV(134.4,-9.4,{r:.8});faceUV(134.4,-12.4,1.5);U(()=>false,.4);
 check(`${label}: Mason Cycle & Sport: F to look in the window`,()=>{assert.ok(said().includes('SAM: “This is it. This is where he took it.”'));assert.equal(h.ui.promptText,'F:Look in the window');});tap('KeyF');
 U(()=>C4().flags.toLibrary,90);
 check(`${label}: the poster, the florist: Roy Mason died in ninety-nine; the Courier on microfilm at the library`,()=>{assert.ok(said().includes('YOU: “That’s the bike.”'));assert.ok(said().some(l=>/MRS\. KOWALSKI: “If you want the old days/.test(l)),JSON.stringify(said().slice(-8)));assert.equal(C1().objective,'Go to the library.');});
 goUV(135,30);goUV(135,42.4);goUV(135,47.2);U(()=>C4().phase==='d4-library',5);U(()=>C4().flags.reel,60);
 check(`${label}: the library: Mrs. Albright, the local history room, "I close at eight"`,()=>{assert.ok(said().includes('MRS. ALBRIGHT: “I close at eight, boys.”'));assert.equal(C1().objective,'Use the microfilm reader.');});
 goUV(144.6,47.9,{r:.7});goUV(145.2,50.4,{r:.7});goUV(146.8,53.4,{r:.7});goUV(146.8,56,{r:.7});goUV(148.8,59.2,{r:.6});faceUV(148.8,61.2,1.7);U(()=>false,.4);tap('KeyF');U(()=>C4().view==='reader',6);
 const h0=C4().h;for(let i=0;i<5;i++){U(()=>quiet(),30);U(()=>false,.8);if(i<4)tap('KeyD');}
 U(()=>C4().phase==='d4-closing',40);
 check(`${label}: the microfilm: five things, read one after another while the afternoon goes; the librarian closing at ten to eight`,()=>{assert.deepEqual(C4().read,[0,1,2,3,4]);
  for(const l of ['JAMIE: “Zero four one seven.”','SAM: “August twenty-first.”','YOU: “People saw him. After.”','SAM: “A bell.”','SAM: “That’s today.”','MRS. ALBRIGHT: “Ten to eight.”'])assert.ok(said().includes(l),l);
  assert.ok(h0<16&&C4().h>19.8,h0+' → '+C4().h);assert.equal(C1().objective,'Go home.');});
 // ---- dusk ---------------------------------------------------------------------------------------------------------------------
 goUV(143,50.5);goUV(135,47);goUV(135,42);U(()=>C4().phase==='e4-dusk',8);goUV(128.4,13.4);U(()=>C4().phase==='e4-alex',10);
 const ax=A4.AX.person.group.position;faceTo(ax.x,ax.z);U(()=>C4().phase==='e4-ride',45);
 check(`${label}: ten to eight: Alex across the street, in the gangway by Mason’s; then not; they do not follow`,()=>{assert.ok(C4().alex.seenAt!==null,'seen');assert.ok(C4().alex.goneAt!==null,'gone');assert.equal(C4().alex.visible,false);
  assert.ok(said().includes('JAMIE: “…Alex?”')&&said().includes('SAM: “It wasn’t. It wasn’t him in the tunnel either.”'));assert.ok(watch.boysToGangway>11,'closest a boy came to the gangway '+watch.boysToGangway);});
 onBike();rideTo([[124,4],[110,3.2],[98,3]].map(([u,v])=>X.TP(u,v)),60,2,()=>C4().phase==='e4-creature');X.brake();
 /* (watching it, as a player would: the head followed wherever it goes) */U(()=>{const c=h.chapter3.creature;if(c.group.visible){const q=c.headPos();faceTo(q.x,q.z,-.05);}return C4().creature.stage==='gone';},75);U(()=>C4().phase==='e4-cascade',5);
 check(`${label}: the streetlights came on one by one at dusk, the sky darkened steadily`,()=>{const lit=watch.lampsLit,steps=new Set(lit).size;assert.ok(steps>=8,'distinct counts '+steps);assert.ok(lit[lit.length-1]>=40,'lit '+lit[lit.length-1]);assert.equal(watch.dayDrop,0,'the light never came back up');});
 check(`${label}: at the end of Second Street: it comes for them, stops dead, looks at the empty corner (its light dies), backs off, hides, runs`,()=>{const R=A4.C.crt,st=R.stageAt,order=['watch','stalk','freeze','look','back','scurry','hide','flinch','flee','gone'];
  for(const k of order)assert.ok(st[k]!==undefined,k);for(let i=1;i<order.length;i++)assert.ok(st[order[i-1]]<=st[order[i]],order[i]);assert.ok(st.look-st.stalk>2,'it came on for a while first');
  assert.ok(R.k.corner<R.k.side&&R.k.side<R.k.far,'the lights went, the corner first: '+JSON.stringify(R.k));assert.ok(R.k.corner>st.look,'the corner went after it looked there');
  assert.ok(C4().cascade&&A4.C.flags.cascade&&st.flee>st.hide,'far up Main the lights began to go while it hid');
  assert.ok(watch.cower>.9,'cowered '+watch.cower);assert.ok(watch.crMin>14,'closest '+watch.crMin);assert.equal(watch.claw,0,'never rears or claws');
  assert.ok(said().includes('SAM: “It’s hiding.”')&&said().includes('SAM: “There’s nothing there.”'));{const all=said().join(' ').toLowerCase();for(const bad of ['controls','servant','in charge','created'])assert.ok(!all.includes(bad),bad);}});
 metrics['chapter4 creature at dusk']={stages:Object.fromEntries(Object.entries(A4.C.crt.stageAt).map(([k2,v2])=>[k2,+(v2-A4.C.crt.stageAt.watch).toFixed(1)])),lightsOut:Object.fromEntries(Object.entries(A4.C.crt.k).map(([k2,v2])=>[k2,+(v2-A4.C.crt.stageAt.watch).toFixed(1)])),closest:+watch.crMin.toFixed(1),footSlipMax:+(watch.slip||0).toFixed(3)};
 U(()=>C4().cascade?.tvAt!=null,40);rideTo([[82,-3.5],[76,-6.4],[73.4,-8.4]].map(([u,v])=>X.TP(u,v)),30,1.4);X.brake();{const w=at(72.8,-11.6,1.5);faceTo(w.x,w.z,-.04);}U(()=>A4.C.cas.saidAt!=null,18);
 const tvSeen={watch:A4.C.cas.watch,front:C4().cascade.front,said:A4.C.cas.saidAt};U(()=>C4().cascade?.nearAt!=null,60);
 check(`${label}: the lights go out one after another, up Main toward them; the dark waits at the TV shop, whose window shows them from above, now (seen up close)`,()=>{assert.ok(tvSeen.watch>1&&tvSeen.said!==null,JSON.stringify(tvSeen));assert.equal(tvSeen.front,60,'held at the TV shop');const log2=C4().presence.log;assert.ok(C4().presence.kills>20,'kills '+C4().presence.kills);
  const its=new Set(Object.values(A4.C.crt.lit)),us=A4.lights.S.log.filter(e=>e.kind==='kill'&&!its.has(e.i)).map(e=>A4.lights.posOf(e.i)?.u).filter(u=>u!==undefined);let back=0;for(let i=1;i<us.length;i++)if(us[i]<us[i-1]-8)back++;assert.ok(back<=2,'out of order '+back+' '+JSON.stringify(A4.lights.S.log.filter(e=>e.kind==='kill').map(e=>[e.i,+(A4.lights.posOf(e.i)?.u??NaN).toFixed(1),+(e.t??0).toFixed(2)])));
  assert.equal(C4().tvs.acetv.shot,'live-high');assert.ok(said().includes('SAM: “That’s us. That’s us, right now.”'));void log2;});
 rideTo([[100,-2],[108,-6.6]].map(([u,v])=>X.TP(u,v)),20,1.6);X.brake();offBike();goUV(106.5,-10.2,{r:.6});goUV(106.5,-14,{r:.8});U(()=>C4().phase==='n4-store',8);
 // ---- the video store ------------------------------------------------------------------------------------------------------------
 U(()=>C4().store?.shot==='pine-ridge',60);const tv=at(99.15,-18,2.5);faceTo(tv.x,tv.z,.15);U(()=>false,.4);tap('KeyV');U(()=>false,1);faceTo(tv.x,tv.z,.18);U(()=>false,.4);
 check(`${label}: the picture of the screen: the camera raised as a viewfinder, F to take it`,()=>{assert.equal(C4().view,'shoot');assert.equal(h.ui.promptText,'F:Take a picture|V:Lower the camera');});tap('KeyF');U(()=>C4().inv.lead,6);
 check(`${label}: the TV: Alex from the air, from behind a hedge, at the PINE RIDGE sign (photographed), in his room from the ceiling`,()=>{const shots=(C4().shots||[]).filter(s=>s.key==='video').map(s=>s.shot).filter(Boolean);
  assert.deepEqual(shots.slice(0,3),['alex-ride','alex-yard','pine-ridge']);assert.equal(A4.C.leadBy,'you');assert.ok(C4().photos.lead>=0);});
 U(()=>C4().store?.ring,60);goUV(102.2,-19.3,{r:.6});faceUV(101,-19.4,1.1);U(()=>false,.3);tap('KeyF');U(()=>C4().store?.answered,4);U(()=>C4().store?.live!=null,40);U(()=>C4().store?.dark!=null,20);
 check(`${label}: the phone: "…Jamie?"; the TV: the three of them, now ("That’s us."); the lights go from the front`,()=>{assert.equal(C4().store.answered,'you');assert.ok(said().includes('ON THE PHONE: “…Jamie?”'));assert.ok(said().includes('SAM: “That’s us.”'));assert.equal(C4().tvs.video.shot,'live-store');});
 U(()=>false,5);goUV(111.2,-26,{r:.6});goUV(111.2,-30,{r:.6});goUV(104.2,-33.2,{r:.6});faceUV(103.75,-35.6,1);U(()=>false,.3);tap('KeyF');U(()=>false,1);goUV(103.75,-36.8,{r:.5});U(()=>C4().phase==='n4-alley',5);
 // ---- out the back -----------------------------------------------------------------------------------------------------------------
 goUV(118,-40.2);goUV(140,-40.2);goUV(150,-38.6);/* (and stop there, the way anyone would) */U(()=>C4().creature.pass?.stage==='gone',30);U(()=>said().includes('SAM: “It didn’t even look at us.”'),8);
 check(`${label}: the narrow way: it comes at them from the far end, stops, looks past them as a light goes out behind them, shrinks from it, and bolts past them, close`,()=>{const ps=C4().creature.pass,R=A4.C.esc.pass;assert.equal(ps.kind,'narrow');assert.ok(ps.passedAt!==null,'passed');
  for(const k of ['come','stop','look','afraid','bolt','gone'])assert.ok(R.stageAt[k]!==undefined,k);assert.ok(R.stageAt.afraid-R.stageAt.look>1.5,'it looked a while');assert.ok(R.k.behind&&R.k.far,'both lights: '+JSON.stringify(R.k));
  assert.ok(watch.passMin>1.3,'closest '+watch.passMin);assert.ok(ps.closest>1.3,'closest (its own count) '+ps.closest);assert.equal(watch.claw,0);
  assert.ok(said().includes(': [Behind them, a light goes out.]')&&said().includes('SAM: “It didn’t even look at us.”'));});
 metrics['chapter4 creature in the narrow way']={stages:Object.fromEntries(Object.entries(A4.C.esc.pass.stageAt).map(([k2,v2])=>[k2,+(v2-A4.C.esc.pass.stageAt.come).toFixed(1)])),closest:C4().creature.pass.closest,roof:C4().creature.pass.roof};
 goUV(163.75,-38.2,{r:.6});goUV(163.75,-35,{r:.6});U(()=>C4().phase==='n4-laundry',5);goUV(169,-27,{r:.6});goUV(173,-26.75,{r:.6});U(()=>C4().phase==='n4-depot',5);
 U(()=>A4.SIL.some(s=>s.state==='on'),8);/* look up at the one standing there (as a player would: straight at it) */U(()=>{const on=A4.SIL.find(s=>s.state==='on');if(on){const c=h.camera.position;faceTo(on.pos.x,on.pos.z,Math.atan2(on.pos.y-c.y,Math.hypot(on.pos.x-c.x,on.pos.z-c.z)));}return A4.SIL.some(s=>s.state==='gone');},8);
 check(`${label}: the theater’s upper windows: someone standing in one; looked at, the window is empty`,()=>{assert.ok(A4.SIL.some(s=>s.state==='gone'),JSON.stringify(C4().silhouettes));assert.ok(said().includes('SAM: “Jamie. The windows.”'));});
 goUV(179.4,-20);goUV(179.4,-10.8);U(()=>C4().phase==='n4-marquee',6);const ax2=A4.AX.person.group.position,k0=A4.lights.S.log.length;let amb=0,held=false,killsDuring=0,stepAt=[];
 /* (a cautious approach: a few steps toward him after each thing he says, never closer than about ten metres) */
 U(()=>{const q=A4.C.mq;if(q&&q.out==null){amb=Math.max(amb,...Object.values(A4.C.amb));held=held||!!A4.C.pose||!!h.night.roam?.walkLock;killsDuring=A4.lights.S.log.slice(k0).filter(e=>e.kind==='kill').length;if(stepAt[q.step]===undefined)stepAt[q.step]=+q.t.toFixed(1);
   const d=Math.hypot(me().x-ax2.x,me().z-ax2.z);if(q.step>=2&&d>10.5&&!h.chapter.state.line)press('KeyW');else release('KeyW');}else release('KeyW');faceTo(ax2.x,ax2.z);return C4().phase==='n4-return';},70);release('KeyW');
 check(`${label}: under the marquee: everything goes still; he says what Alex said on the hill, and Jamie answers as he did then; then Sam’s words from Second Street; then the goodbye; dark; gone; the lights come back`,()=>{
  const lines=['JAMIE: “…Alex?”','SAM: “Jamie. Don’t.”','ALEX: “Did you guys hear that?”','JAMIE: “…Hear what?”','ALEX: “Never mind.”','SAM: “That’s what he said. On the hill. That’s exactly—”','ALEX: “Don’t run. Don’t run.”','SAM: “…That’s what I said.”','ALEX: “Alright, I’m this way.”','ALEX: “See you tomorrow.”'],ix=lines.map(saidIdx);
  assert.ok(ix.every(i=>i>=0),JSON.stringify(ix));assert.ok(ix.every((v,i)=>!i||v>ix[i-1]),JSON.stringify(ix));assert.ok(said().includes(': [It goes quiet. No wind. Nothing.]'));
  const all=said().join(' ').toLowerCase();for(const bad of ['i am everywhere','you cannot escape','come play with me','you’re next','join us','i know where he is','come find him'])assert.ok(!all.includes(bad),bad);
  assert.equal(amb,0,'no sound of the town while he is there: '+amb);assert.equal(killsDuring,0,'nothing goes out while he speaks');assert.equal(held,false,'nothing holds you or turns your head');
  assert.equal(C4().alex.visible,false);U(()=>C4().presence.lampsLit>40,6);assert.ok(C4().presence.lampsLit>40,'lit again '+C4().presence.lampsLit);assert.ok(C4().presence.restores>40);});
 metrics['chapter4 under the marquee']={stepAt,closest:+(A4.C.mq?Math.hypot(me().x-ax2.x,me().z-ax2.z):0).toFixed(1)};
 goUV(150,-9);goUV(118,-8.6);const r=h.night.roam;go(r,{r:2});U(()=>C4().phase==='n4-clue',10);U(()=>C4().phase==='n4-ride',45);
 check(`${label}: the picture of the screen on Alex’s camera: PINE RIDGE RECREATION AREA (the next lead)`,()=>{assert.ok(said().includes('SAM: “Pine Ridge Recreation Area.”'));assert.equal(P.photos[C4().photos.lead].id,'pine-ridge-tv');assert.equal(C1().objective,'Go home.');});
 tap('KeyV');U(()=>false,.6);onBike();const h1=Math.max(0,watch.streets.length-1);rideTo(routeHome(118),340,3,()=>C4().phase==='n4-oak');X.brake();
 U(()=>h.snapshot.state==='ended',60);
 check(`${label}: home the way they came, to the old oak: "That thing in the tunnel…" "It was scared." "Of what?" — Chapter Four`,()=>{const seq=watch.streets.slice(h1);for(const s of ['town-core','town-conn','side2','main'])assert.ok(seq.includes(s),s);
  const lines=['JAMIE: “That thing in the tunnel…”','SAM: “It was scared.”','YOU: “Of what?”'],ix=lines.map(saidIdx);assert.ok(ix.every((v,i)=>v>=0&&(!i||v===ix[i-1]+1)),JSON.stringify(ix));assert.ok((A4.C.blink??-1)>=0,'a streetlight blinked');
  assert.equal(h.snapshot.state,'ended');assert.equal(element('ending').querySelector?.('h2')?.innerHTML??'Chapter Four','Chapter Four');assert.equal(element('next-chapter').hidden,true);});
 check(`${label}: nobody and nothing went missing or non-finite; every line was a caption; the placeholder sound hooks fired`,()=>{assert.equal(watch.bad,0);assert.deepEqual(log.bad,[]);
  for(const k of ['relay','phone','shutter','flash','door','step'])assert.ok((A4.C.sounds?.[k]||0)>0||((C4().sounds||{})[k]||0)>0,k);});
 const minutes=A4.C.t/60;/* (the chapter's own time since its card: the game clock restarts with the hand-over) */void t0;M2['chapter4 natural minutes']=+minutes.toFixed(2);M2['chapter4 lines spoken']=said().length;M2['chapter4 objectives']=[...new Set(log.objectives)].filter(o=>o).length;
 check(`${label}: the chapter takes ${minutes.toFixed(1)} minutes played straight through (a player who stops to look takes longer)`,()=>assert.ok(minutes>14&&minutes<45,minutes));
 return {minutes,said:said().length};
}

// Every jump, alias and checkpoint; Continue; Start over from inside; switching away leaves nothing behind; randomized runs.
export async function runChapterFourChecks(T,cap){
 const {h,advance,press,release,tap,check,element,metrics}=T,X=chapterFourTools(T),{C1,C4,A4,at,uv,until,wait,me,faceTo,go,goUV,faceUV,companionsFinite,quiet,offBike,onBike}=X;
 // ---- jumps --------------------------------------------------------------------------------------------------------------------
 const jumps={};for(const sec of [...A4.SECTIONS,...Object.keys(A4.ALIAS)]){let err=null;try{h.jump(sec);advance(2.5);}catch(e){err=String(e.stack||e).slice(0,300);}jumps[sec]={err,phase:C4().phase,finite:companionsFinite()&&Number.isFinite(h.camera.position.y)};}
 check(`Chapter Four: all ${A4.SECTIONS.length} QA jumps and ${Object.keys(A4.ALIAS).length} aliases start without an error, in a Chapter Four phase, everyone where they can be`,()=>{for(const [k,v] of Object.entries(jumps)){assert.equal(v.err,null,k+': '+v.err);assert.ok(A4.owns(v.phase),k+' '+v.phase);assert.ok(v.finite,k);}});
 // ---- checkpoints and Continue -------------------------------------------------------------------------------------------------
 const cont={};for(const [id,label] of Object.entries(A4.LABEL)){h.chapter.kit.checkpointTo(id,label);const s=h.chapter.saved();h.toTitle?.();h.jump(s.section);advance(1.5);cont[id]={label:s.label,phase:C4().phase};}
 check(`Chapter Four: ${Object.keys(A4.LABEL).length} checkpoints; Continue from each returns to it`,()=>{for(const [id,v] of Object.entries(cont)){assert.ok(A4.owns(v.phase),id+' '+v.phase);assert.equal(v.label,A4.LABEL[id]);}});
 // ---- the picture survives a Continue (it is on the camera again) ----------------------------------------------------------------
 h.jump('c4-escape');advance(1);check('Chapter Four: past the store, the picture of the screen is on the camera (made again after a Continue)',()=>{assert.ok(C4().photos.lead>=0);assert.equal(C4().inv.lead,true);});
 // ---- Start over from inside, and switching back to earlier chapters: nothing of Chapter Four left -------------------------------
 const leftovers=()=>{const s=C4(),out=[];if(h.nav.townOpen)out.push('town nav open');if(A4.lights.S.attached)out.push('town lights attached');if(s.life.people.length||s.life.cars.length)out.push('town life');if(A4.AX.person.group.visible)out.push('alex');
  if(h.chapter3.creature.group.visible&&!/^n3-/.test(h.chapter.state.phase))out.push('creature');if(A4.bag.visible)out.push('backpack');if(A4.samMom.visible)out.push('sam’s mom');if(s.tvs.video.on||s.tvs.acetv.on||s.tvs.laundry.on)out.push('tv');
  if(Object.entries(s.doors).some(([k,v])=>v!==({'video-back':0}[k]??1)))out.push('doors '+JSON.stringify(s.doors));if(A4.photo.V.open)out.push('camera');if(s.photos.count!==13)out.push('photos '+s.photos.count);return out;};
 const leaks={};for(const [from,to] of [['c4-store-live','restart'],['c4-tv-window','c3-road-night'],['c4-alley-creature','oak'],['c4-marquee','chapter2-end'],['c4-photo-mason','c3-creature-chase-start']]){h.jump(from);advance(3);
  if(to==='restart'){element('restart').onclick?.();advance(.5);}else{h.jump(to);advance(1);}leaks[from+'→'+to]=leftovers();}
 check('Chapter Four: Start over from inside it, and jumps back into earlier chapters, leave nothing of it behind (town, lights, people, TVs, doors, the camera)',()=>{for(const [k,v] of Object.entries(leaks))assert.deepEqual(v,[],k);});
 // ---- seeded randomized runs through the fallbacks ---------------------------------------------------------------------------------
 let seed=4417;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const runs=[];
 const segment=(name,start,steps,goal,max)=>{h.jump(start);advance(.5);const t=h.snapshot.clock;let err=null;try{steps();}catch(e){err=String(e).slice(0,200);}const ok=until(()=>goal(),max);runs.push({name,start,ok,err,phase:C4().phase,secs:+(h.snapshot.clock-t).toFixed(1),carried:Object.keys(A4.C.flags).filter(k=>k.startsWith('carried-'))});};
 for(let i=0;i<3;i++){const mash=Math.floor(rnd()*80);segment('camera, random keys then idle','c4-camera',()=>{for(let k=0;k<mash;k++){tap(['KeyA','KeyD','KeyW','KeyS','KeyF','KeyD','KeyD'][Math.floor(rnd()*7)]);advance(.3+rnd()*.6);}},()=>C4().flags.lead1,260);}
 for(let i=0;i<3;i++){const idle=rnd()*40;segment('dusk: idle, then the rack (or not)','c4-dusk',()=>{advance(idle);if(rnd()<.6)goUV(128.4,13.4);},()=>C4().phase==='e4-ride'||C4().phase==='e4-creature',150);}
 for(const choice of ['stand','store','west']){segment('the lights going: '+choice,'c4-presence',()=>{if(choice==='store'){advance(18);offBike();goUV(106.5,-10.2,{r:.6});goUV(106.5,-14,{r:.8});}else if(choice==='west'){press('KeyW');advance(8);release('KeyW');}},()=>C4().phase==='n4-store',110);}
 for(let i=0;i<4;i++){const pic=rnd()<.5,ans=rnd()<.5,back=rnd()<.5;segment(`the store: picture ${pic?'taken':'missed'}, phone ${ans?'answered':'left ringing'}, ${back?'out the back':'standing there'}`,'c4-video-store',()=>{
   if(pic){until(()=>C4().store?.shot==='pine-ridge',70);const tv=at(99.15,-18,2.5);faceTo(tv.x,tv.z,.15);advance(.3);tap('KeyV');advance(.8);faceTo(tv.x,tv.z,.18);advance(.3);tap('KeyF');advance(1.5);if(C4().view)tap('KeyV');}
   if(ans){until(()=>C4().store?.ring,70);goUV(102.2,-19.3,{r:.6});faceUV(101,-19.4,1.1);advance(.3);tap('KeyF');}
   if(back){until(()=>C4().store?.dark!=null,90);goUV(111.2,-26,{r:.6});goUV(111.2,-30,{r:.6});goUV(104.2,-33.2,{r:.6});faceUV(103.75,-35.6,1);advance(.3);tap('KeyF');advance(1);goUV(103.75,-36.8,{r:.5});}},
  ()=>C4().phase==='n4-alley'&&C4().inv.lead,260);}
 for(const choice of ['walk','idle']){segment('out the back: '+choice,'c4-escape',()=>{if(choice==='walk'){goUV(118,-40.2);goUV(140,-40.2);goUV(150,-38.6);}},()=>C4().creature.pass?.stage==='gone',160);}
 for(const choice of ['walk','idle']){segment('Depot Street: '+choice,'c4-depot-st',()=>{if(choice==='walk'){goUV(179.4,-20);goUV(179.4,-10.8);}},()=>C4().phase==='n4-return',190);}
 segment('the bikes, never gone back to','c4-power-returns',()=>{},()=>C4().phase==='n4-ride',240);
 check(`Chapter Four: ${runs.length} seeded randomized runs (idling, wandering, missing the picture, letting the phone ring) all reach the next beat, by the fallbacks where needed`,()=>{for(const r of runs){assert.equal(r.err,null,r.name);assert.ok(r.ok,JSON.stringify(r));}});
 check('Chapter Four: when the picture is missed, Jamie takes it; when the phone rings out, Sam answers; nobody waits forever',()=>{assert.ok(runs.some(r=>/picture missed/.test(r.name)&&r.ok));assert.ok(runs.some(r=>/left ringing/.test(r.name)&&r.ok));assert.ok(runs.some(r=>r.carried.length),'some run used a carry-on fallback');});
 metrics['chapter4 randomized runs']=runs.map(r=>({name:r.name,ok:r.ok,secs:r.secs,carried:r.carried}));
 // ---- the store watches them: a shot nobody has looked at waits; the live picture is from the corner farthest from you --------
 {const lens=A4.footage.SHOTS,said=()=>X.log.said;h.jump('c4-video-store');advance(.3);faceUV(114,-20,1.2);/* (turned away from the TV) */until(()=>C4().store?.shot==='alex-ride',20);const t0=C4().store.t;until(()=>C4().store.shot!=='alex-ride',40);const unseen=C4().store.t-t0;
  const tv=at(99.15,-18,2.5);until(()=>{faceTo(tv.x,tv.z,.12);return C4().store.shot!=='alex-yard';},30);const t1=C4().store.t;until(()=>{faceTo(tv.x,tv.z,.12);return C4().store.shot!=='alex-yard'||C4().store.t-t1>30;},30);
  h.jump('c4-video-store');advance(.3);until(()=>C4().store?.shot==='alex-ride',20);const t2=C4().store.t;until(()=>{faceTo(tv.x,tv.z,.12);return C4().store.shot!=='alex-ride';},40);const seen=C4().store.t-t2;
  h.jump('c4-store-live');advance(1.5);const c0=A4.footage.storeCornerChanges,k0=A4.footage.storeCorner,cu=A4.footage.storeCornerUV;goUV(clamp1(cu[0],101,113.5),clamp1(cu[1],-26.5,-13.5),{r:.8,max:25});advance(2.5);
  const moved=A4.footage.storeCornerChanges>c0&&A4.footage.storeCorner!==k0;until(()=>said().includes('SAM: “It moved. It’s— from over there now.”'),8);
  check('Chapter Four, the video store: a shot on the TV nobody has looked at waits for you; the live picture is from the corner farthest from you, and when you go to that corner it is from another one',()=>{
   assert.ok(unseen>lens['alex-ride'].len+6,'unwatched: '+unseen.toFixed(1));assert.ok(seen<lens['alex-ride'].len+1.2,'watched: '+seen.toFixed(1));assert.ok(moved,'the live picture moved: '+JSON.stringify({c0,k0,now:A4.footage.storeCorner}));
   assert.ok(said().includes('SAM: “It moved. It’s— from over there now.”'));});
  metrics['chapter4 store']={unwatchedShotSecs:+unseen.toFixed(1),watchedShotSecs:+seen.toFixed(1),shotLen:lens['alex-ride'].len,liveCornerMoved:moved};}
 // ---- every way out of the video store comes out at the Lyric; the dark follows the way they went; the boys stay with them --------
 {const comp=h.chapter.companions,J=comp.all.find(c=>c.key==='jamie'),Sm=comp.all.find(c=>c.key==='sam');
  const WAYS={laundromat:[[118,-40.2],[140,-40.2],[150,-38.6],[163.75,-38.6],[163.75,-35],[165,-30],[169,-27],[173,-26.75],[179.4,-20],[179.4,-10.8]],
   'narrow way to Depot':[[118,-40.2],[140,-40.2],[150,-38.6],[176,-38.8],[180,-20],[180,-10.8]],'passage to Main':[[118,-40.2],[135,-37.2],[143,-35.2],[143,-20],[143,-6],[172,-6]],
   'gangway to Main':[[118,-40.2],[125,-36.4],[127,-34.4],[127,-20],[127,-6],[150,-6],[172,-6]],'along the creek':[[110,-44],[125,-51],[150,-51],[178,-50],[180,-30],[180,-10.8]]};
  const ways={};for(const [name,pts] of Object.entries(WAYS))for(const sprint of [false,true]){if(sprint&&!/laundromat|passage/.test(name))continue;h.jump('c4-escape');advance(1);let worst=0,inv=0,t=0;
   const smp=()=>{t+=1/30;const p=me();for(const c of [J,Sm]){worst=Math.max(worst,Math.hypot(c.px-p.x,c.pz-p.z));if(!c.person.group.visible)inv++;}return C4().phase==='n4-marquee';};
   for(const [u,v] of pts){go(at(u,v),{max:60,sprint,stop:smp});if(C4().phase==='n4-marquee')break;}until(smp,30);release('ShiftLeft');release('KeyW');
   const e=C4().escape,pa=C4().creature.pass;ways[name+(sprint?' (running)':'')]={reached:C4().phase==='n4-marquee',secs:+t.toFixed(1),route:e.route,pass:pa?.kind??null,passed:pa?.passedAt!=null,closest:pa?.closest??null,gapMin:e.gapMin,gapMax:e.gapMax,lightsOut:e.lightsOut,nudges:e.nudges,boysWorst:+worst.toFixed(1),hidden:inv};}
  check(`Chapter Four: every way out of the video store (${Object.keys(WAYS).length} ways, walking and running) comes out at the Lyric; the dark follows, never closer than ${2.5} m; the creature passes, never through anyone; the boys stay close`,()=>{
   for(const [k,w] of Object.entries(ways)){assert.ok(w.reached,k+' '+JSON.stringify(w));assert.ok(w.passed,k+' passed');assert.ok(w.closest>1.3,k+' closest '+w.closest);assert.ok(w.gapMin>2.5,k+' gap '+w.gapMin);assert.ok(w.gapMax<36,k+' gapMax '+w.gapMax);assert.equal(w.nudges,0,k);assert.ok(w.boysWorst<15,k+' boys '+w.boysWorst);assert.equal(w.hidden,0,k);}
   assert.deepEqual([...new Set(Object.values(ways).map(w=>w.pass))].sort(),['creek','main','narrow']);assert.ok(new Set(Object.values(ways).map(w=>w.route)).size>=4,'the routes: '+JSON.stringify(Object.values(ways).map(w=>w.route)));});
  metrics['chapter4 escape routes']=ways;}
 // ---- the DEV selector's Chapter Four ---------------------------------------------------------------------------------------------
 if(cap?.natural?.[4]){const {compare,far,strict}=await import('./dev-chapters-sim.mjs');const devAt=()=>{const ph=h.devStart(4);advance(1/30);/* (the natural arrival is captured on the first frame after Chapter Four begins: so is this) */return {ph,snap:h.dev.snapshot()};};
  const {ph,snap}=devAt(),d=compare(cap.natural[4],snap,4,.04/* (one frame: both are measured on the first frame after the hand-over, the history applied at it) */).filter(x=>!/^(chapter4\.C\.(t|pt|h|minute|lastEvent|renderT|renderQ)|chapter4\.state\.(t|h|clock|lastEvent)|game\.clock|chapter4\.state\.presence)/.test(x.path||x[0]||'')),f=far(cap.natural[4],snap);
  check(`DEV start at Chapter Four (phase ${ph}): the same state as arriving from Chapter Three’s end card (${d.length} differences)`,()=>{assert.equal(ph,'c4-black');assert.deepEqual(d,[],JSON.stringify(d.slice(0,12)));assert.deepEqual(f,[]);});
  const clean4=devAt().snap,clean3=(h.devStart(3),h.dev.snapshot()),sw=[];
  for(const n of [4,1,4,3,4,0,2,4]){const s=(n===4?devAt().snap:(h.devStart(n),h.dev.snapshot()));if(n===4||n===3){const dd=strict(n===4?clean4:clean3,s,n);if(dd.length)sw.push({n,d:dd.slice(0,6)});}}
  check('DEV switching 4→1→4→3→4→0→2→4 in one session: Chapter Four starts identical to a clean start each time, and Chapter Three after it is untouched',()=>assert.deepEqual(sw,[],JSON.stringify(sw)));
  /* the order the revision asks for: scenes of four between scenes of the others; each Chapter Four scene identical to a clean start of it, the others carrying nothing of four */
  const ORDER=[[4,'c4-creature-hiding'],[3,'c3-creature-chase-start'],[4,'c4-escape'],[1,'oak'],[4,'c4-theater'],[2,'memory-start'],[4,'c4-video-store'],[4,'chapter4-end']],clean={},order=[];
  const scene=(n,id)=>{h.devScene(n,id);advance(1/30);return h.dev.snapshot();};for(const [n,id] of ORDER)if(n===4&&!clean[id]){h.devStart(4);advance(1/30);clean[id]=scene(4,id);}
  for(const [n,id] of ORDER){const snap=scene(n,id);const d=n===4?strict(clean[id],snap,4).filter(x=>!/^(game\.clock|chapter4\.(C|state)\.(t|lastEvent|renderT|renderQ))/.test(x[0])):[];const lo=n===4?[]:leftovers();order.push({n,id,diff:d.slice(0,6),left:lo});}
  check('DEV switching in the revision’s order (C4 Creature Fear → C3 Chase → C4 Downtown Escape → C1 Old Oak → C4 Theater → C2 Briarwood → C4 Video Store → C4 Ending): every Chapter Four scene starts as cleanly as on its own; nothing of Chapter Four leaks into the others',()=>{
   for(const o of order){assert.deepEqual(o.diff,[],o.n+'/'+o.id+' '+JSON.stringify(o.diff));assert.deepEqual(o.left,[],o.n+'/'+o.id+' '+JSON.stringify(o.left));}});
  const SC=h.dev.SCENES[4],st={};for(const sc of SC){try{const p2=h.devScene(4,sc.id);advance(1/30);st[sc.id]={ok:true,phase:p2};}catch(e){st[sc.id]={ok:false,err:String(e).slice(0,200)};}}
  check(`DEV scenes: all ${SC.length} Chapter Four scenes start without an error`,()=>{for(const [k,v] of Object.entries(st))assert.ok(v.ok,k+' '+v.err);});
  const BEFORE={'c4-photo-mason':()=>!C4().found.includes('mason'),'c4-alex-across':()=>C4().alex.goneAt==null,'c4-creature':()=>['watch','stalk'].includes(C4().creature.stage),'c4-creature-notices':()=>C4().creature.stage==='stalk'&&A4.C.crt.stageAt.freeze===undefined,'c4-creature-hiding':()=>C4().creature.stage==='hide'&&!A4.C.flags.cascade,'c4-presence':()=>C4().cascade?.nearAt==null,
   'c4-pine-ridge':()=>!C4().inv.lead,'c4-store-phone':()=>!C4().store?.answered,'c4-store-live':()=>C4().store?.live==null,'c4-alley-creature':()=>!C4().creature.pass,'c4-route-a':()=>!C4().creature.pass&&C4().escape?.gap>6,'c4-route-b':()=>!C4().creature.pass&&C4().escape?.gap>6,'c4-marquee':()=>C4().mq?.out==null,'chapter4-end':()=>h.snapshot.state!=='ended'};
  const notBefore=[];for(const [id,fn] of Object.entries(BEFORE)){h.devScene(4,id);advance(1/30);if(!fn())notBefore.push(id);}
  check(`DEV scenes: each of the ${Object.keys(BEFORE).length} key Chapter Four scenes starts shortly BEFORE its event`,()=>assert.deepEqual(notBefore,[]));
  metrics['dev chapter selector four']={phase:ph,differences:d.length,scenes:SC.length,started:Object.values(st).filter(v=>v.ok).length,switchingLeaks:sw.length,before:Object.keys(BEFORE).length-notBefore.length+'/'+Object.keys(BEFORE).length};}
 element('restart').onclick?.();advance(.5);check('after Chapter Four, Start over still begins the prologue normally',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.chapter.state.phase,'off');assert.equal(h.nav.townOpen,false);});
}
