// Chapter Three in the simulation harness: played the way a player would (walking and riding with the
// keys, turning to look, pressing F where the prompt says, running), straight on from the end of
// Chapter Two; then every beat on its own, every QA jump and checkpoint, Continue and Start over,
// randomized runs of the risky stretches, the tension/heartbeat system, the audio events (as signals)
// and the caption tone logic. Called from verify.mjs with the running harness; real dist/ modules.
import assert from 'node:assert/strict';
import {chapterTwoTools} from './chapter2-sim.mjs';

export function chapterThreeTools(T){
 const X=chapterTwoTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo}=X;
 const C1=()=>h.chapter.state,C3=()=>h.chapter3.state,Q=h.world.basin,SP=Q.spots,E=Q.E;
 const B=h.world.sideFrames[0],S1=(u,v)=>{const p=B.point(u,v);return [p.x,p.z];},sline=(u0,u1,v,st=12)=>{const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(S1(u0+(u1-u0)*i/n,v));return o;};
 const M1=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];},line=(d0,d1,l,st=20)=>{const o=[];const n=Math.ceil(Math.abs(d1-d0)/st);for(let i=1;i<=n;i++)o.push(M1(d0+(d1-d0)*i/n,l));return o;};
 const QW=(u,v)=>{const p=Q.world(u,v);return [p.x,p.z];};
 // Get off the bike (if on it) where you are.
 const offBike=()=>{if(h.night.state==='c1-ride'){release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');tap('KeyF');until(()=>h.night.state==='c1-walk',4);wait(.3);}};
 // Step clear of your own bike (you get off on its left; it stands between you and where you were riding).
 const clearBike=()=>{const p=me(),r=h.night.roam,dx=p.x-r.x,dz=p.z-r.z,l=Math.hypot(dx,dz)||1;X.walkTo([[p.x+dx/l*.9,p.z+dz/l*.9]],{r:.25,max:4});};
 const onBike=()=>{if(h.night.state==='c1-walk'){const r=h.night.roam;X.walkTo([[r.x,r.z]],{r:1.2,max:25});faceTo(r.x,r.z);wait(.2);tap('KeyF');until(()=>h.night.state==='c1-ride',4);}};
 // Walk somewhere through the world's own paths (rooms, gaps in fences), facing where you go.
 // (A player steps round their own parked bike; the world's walking paths do not know where it is.)
 const go=(q,o={})=>{const to={x:q.x??q[0],z:q.z??q[1]},p=me(),path=h.nav.walkPath({x:p.x,z:p.z},to),pts=path.length?path:[[to.x,to.z]];
  if(h.night.state==='c1-walk'){const r=h.night.roam,[ax,az]=pts[0],dx=ax-p.x,dz=az-p.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((r.x-p.x)*dx+(r.z-p.z)*dz)/l2)),cx=p.x+dx*t,cz=p.z+dz*t;
   if(Math.hypot(cx-r.x,cz-r.z)<.8){const l=Math.sqrt(l2),nx=-dz/l,nz=dx/l,sg=Math.sign((p.x-r.x)*nx+(p.z-r.z)*nz)||1;pts.unshift([r.x+nx*sg*1.1-dx/l*.2,r.z+nz*sg*1.1-dz/l*.2],[r.x+nx*sg*1.1+dx/l*.9,r.z+nz*sg*1.1+dz/l*.9]);}}
  return walkTo(pts,o);};
 const prompt=()=>h.ui.promptText;
 const companionsFinite=()=>h.chapter.companions.all.every(c=>!c.active||Number.isFinite(c.bx+c.bz+c.px+c.pz));
 const companionGap=()=>{const p=me();return Math.max(...h.chapter.companions.all.filter(c=>c.active).map(c=>Math.hypot((c.mode==='ride'?c.bx:c.px)-p.x,(c.mode==='ride'?c.bz:c.pz)-p.z)));};
 return {...X,C1,C3,Q,SP,E,B,S1,sline,M1,line,QW,offBike,clearBike,onBike,go,prompt,companionsFinite,companionGap};
}

// From the end of Chapter Two (its final lines) to the end of Chapter Three.
export function playChapterThree(T,label){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterThreeTools(T),{C1,C3,log,until,wait,me,faceTo,walkTo,rideTo,brake,Q,SP,E,S1,sline,QW,offBike,clearBike,onBike,go,prompt,companionsFinite,companionGap}=X;
 const said=()=>log.said;const watchMax={gap:0,tension:[],amb:[],bad:0},startClock=h.snapshot.clock;
 const sample=()=>{const c=C3(),g=companionGap(),ph=C1().phase;watchMax.byPhase??={};watchMax.byPhase[ph]=Math.max(watchMax.byPhase[ph]||0,+g.toFixed(1));
  // Apart only where the story parts them: the drive home in the afternoon, and home at night until the corner.
  if(!/^(c3-black|d3-home|c3-night|n3-home|n3-end)$/.test(ph)&&g>watchMax.gap){watchMax.gap=g;watchMax.worst={ph,me:h.nav.locate(me().x,me().z),c:h.chapter.companions.all.map(c=>[c.key,c.mode,c.follow,!!c.script,+c.speed.toFixed(2),h.nav.locate(c.mode==='ride'?c.bx:c.px,c.mode==='ride'?c.bz:c.pz)])};}if(!companionsFinite())watchMax.bad++;watchMax.tension.push([C1().phase,c.tension?.value??0,c.tension?.gain??0,c.tension?.bpm??0]);};
 const U=(fn,max)=>until(()=>{sample();return fn();},max);
 // ---- the hand-over: no end card; CHAPTER THREE over black; the same corner a few minutes later ---------------
 let cardSeen='',overBlack=1;U(()=>{const cc=element('chapter-card');if(cc.classList.contains('on')){cardSeen='Chapter Three';overBlack=Math.min(overBlack,+element('fade').style.opacity);}return C1().phase==='d3-street';},140);
 check(`${label}: Chapter Two runs straight into Chapter Three: no end menu, a quiet CHAPTER THREE card over black`,()=>{assert.equal(element('ending').hidden,true);assert.ok(cardSeen,'card');assert.ok(overBlack>.99,'over black '+overBlack);assert.ok(log.phases.includes('c3-black'));
  assert.ok(+element('fade').style.opacity<.05,'faded back in');assert.equal(h.chapter.day,1,'still daylight');assert.ok(element('date').innerHTML.includes('9:16 AM'));});

 check(`${label}: "If Alex heard it before he left…" / "Maybe yesterday wasn’t the first time." — ask his mom`,()=>{const a=said().indexOf('JAMIE: “If Alex heard it before he left…”');assert.ok(a>=0);
  assert.deepEqual(said().slice(a,a+3),['JAMIE: “If Alex heard it before he left…”','SAM: “What?”','JAMIE: “Maybe yesterday wasn’t the first time.”']);assert.ok(said().includes('YOU: “His mom would know.”'));assert.equal(C1().objective,'Go to Alex’s house.');});
 // ---- to Alex's house ---------------------------------------------------------------------------------------------
 if(h.night.state!=='c1-ride')onBike();
 press('KeyW');rideTo([S1(10,1.6),...sline(10,118,1.6)],120);brake();
 U(()=>C3().flags.atHouse,10);
 check(`${label}: at Alex's house: the search still going, his mom on the porch; "Talk to Alex’s mom."`,()=>{assert.equal(C1().objective,'Talk to Alex’s mom.');assert.ok(h.chapter.mom.visible);assert.ok(h.chapter.carB.active,'a cruiser out front');assert.ok(C3().oldBike,'the bike already at the gate (out of sight)');});
 offBike();const mp=h.chapter.mom.pos;go({x:mp.x+(me().x-mp.x)/Math.hypot(me().x-mp.x,me().z-mp.z)*1.6,z:mp.z+(me().z-mp.z)/Math.hypot(me().x-mp.x,me().z-mp.z)*1.6},{r:.5,max:30,stop:()=>C3().flags.momTalk});faceTo(mp.x,mp.z);wait(.4);
 if(!C3().flags.momTalk){check(`${label}: F talks to her`,()=>assert.equal(prompt(),'F:Talk to Alex’s mom'));tap('KeyF');}
 U(()=>C1().objective==='Go up to Alex’s room.',90);
 check(`${label}: his mom: he kept asking if she heard a bike bell outside, nights before; she thought nothing of it`,()=>{for(const l of ['ALEX’S MOM: “He kept asking if I heard a bike bell outside. At night.”','ALEX’S MOM: “Thursday, I think. And again Friday. Maybe Saturday.”','ALEX’S MOM: “I figured it was one of the neighbor kids riding around late. I told him to go to sleep.”','JAMIE: “…No reason.”'])assert.ok(said().includes(l),l);});
 // ---- his room ----------------------------------------------------------------------------------------------------
 const AH=h.world.homes.alex,door=AH.toWorld(AH.doorX,AH.stepFront+.7);go(door,{r:.5,max:30});faceTo(door.x,door.z);wait(.3);
 check(`${label}: "Go inside" at the front door`,()=>assert.equal(prompt(),'F:Go inside'));tap('KeyF');U(()=>C3().inRoom&&+element('fade').style.opacity<.05,8);
 const R=h.world.interiors['alex-room'];
 check(`${label}: upstairs in Alex's room: you walk it yourself (first person), Jamie and Sam with you`,()=>{assert.equal(C1().phase,'d3-room');assert.equal(h.nav.locate(me().x,me().z).street,'room');assert.equal(h.night.state,'c1-walk');
  const floor=h.nav.groundY(me().x,me().z);assert.ok(Math.abs(h.camera.position.y-floor-1.42)<.1,'eye height');assert.ok(h.world.merged.filter(m=>m.material===h.world.alexWindow).every(m=>!m.visible),'you can see out of his windows');
  for(const c of h.chapter.companions.all)assert.equal(h.nav.locate(c.px,c.pz).street,'room',c.key);assert.ok(C3().phone);});
 const RW=h.chapter3.RW,phone=h.chapter3.phone.position;go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20});faceTo(phone.x,phone.z,-.6);
 U(()=>C1().objective==='Listen to Alex’s recordings.',40);wait(.3);
 check(`${label}: his phone on the desk; Jamie: he records dumb stuff on it`,()=>{assert.ok(said().includes('JAMIE: “He records dumb stuff on it. Noises. He made a fart my ringtone for a week.”'));assert.equal(prompt(),'F:Listen to his recordings');});
 tap('KeyF');U(()=>C1().phase==='d3-phone',4);wait(1.4);const recTension=[];
 for(let i=0;i<5;i++){U(()=>prompt()==='F:Play'||prompt()==='F:Next recording',40);tap('KeyF');U(()=>{recTension.push(C3().tension?.value||0);return C3().recPlaying<0&&!h.chapter.state.line;},45);wait(.6);}
 U(()=>C1().objective==='Look out his window.',60);
 check(`${label}: four ordinary recordings first (laughing, a freewheel, the TV, crickets), then the night before: fan, insects, a bell outside twice, “There it is again.”`,()=>{assert.deepEqual(C3().heard,[0,1,2,3,4]);
  const caps=log.captions.join('\n');for(const c of ['[Jamie and Sam, cracking up]','[A bike’s freewheel, ticking down]','[A TV downstairs. A game show. Applause.]','[Crickets. A sprinkler somewhere.]','[A box fan. Insects outside.]','[A bike bell. Outside.]','[The bell again.]','“There it is again.”'])assert.ok(caps.includes(c),c);
  assert.ok(caps.indexOf('[A bike bell. Outside.]')>caps.indexOf('[Crickets. A sprinkler somewhere.]'));assert.ok(said().includes('JAMIE: “He’d heard it before. Like, a bunch of times.”'));
  assert.ok(Math.max(...recTension)>.22&&Math.max(...recTension)<.4,'the body notices the recorded bell, a little: '+Math.max(...recTension));});
 const sw=RW(R.sideWindow.x,R.sideWindow.z),look=RW(R.sideWindow.look.x,R.sideWindow.look.z);go(sw,{r:.3,max:20});faceTo(look.x,look.z,-.1);U(()=>C3().flags.window,6);if(!C3().flags.window){tap('KeyF');}
 U(()=>C1().objective==='Ask around near the creek.',50);
 check(`${label}: his window looks toward the creek and the trees behind the yards`,()=>{for(const l of ['JAMIE: “That’s the creek. Behind the trees.”','YOU: “Where his bike was.”','SAM: “So that’s where it was coming from.”'])assert.ok(said().includes(l),l);
  // The window faces the easement and the creek strip (west of the house), not the street.
  const gap=h.world.easement.spots.gap,dir=Math.atan2(look.x-sw.x,-(look.z-sw.z)),toGap=Math.atan2(gap.x-sw.x,-(gap.z-sw.z));const diff=Math.abs(Math.atan2(Math.sin(dir-toGap),Math.cos(dir-toGap)));assert.ok(diff<.9,'window bearing vs easement '+diff.toFixed(2));});
 wait(1.5);const dr=RW(R.door.x,R.door.z);go(dr,{r:.3,max:20});faceTo(RW(R.door.face.x,R.door.face.z).x,RW(R.door.face.x,R.door.face.z).z);wait(.2);
 check(`${label}: "Go back outside" at his door`,()=>assert.equal(prompt(),'F:Go back outside'));tap('KeyF');U(()=>C1().phase==='d3-neighbors'&&!C3().inRoom,6);
 check(`${label}: back outside on his front walk; the room is closed up again`,()=>{assert.equal(h.nav.room,null);assert.ok(h.world.merged.filter(m=>m.material===h.world.alexWindow).every(m=>m.visible));assert.notEqual(h.nav.locate(me().x,me().z).street,'room');});
 // ---- asking around: Mr. Huang across the street, Mrs. Delaney by the creek, then Mr. Okafor next door ------------
 const near=(q,d)=>{const l=Math.hypot(me().x-q.x,me().z-q.z)||1;return {x:q.x+(me().x-q.x)/l*d,z:q.z+(me().z-q.z)/l*d};};
 const talkTo=key=>{const a=h.chapter3.people[key];go(near(a,1.8),{r:.6,max:60});faceTo(a.x,a.z);wait(.4);tap('KeyF');U(()=>C3().talked.includes(key)&&!h.chapter.state.line&&h.chapter.state.queue===0,40);wait(.5);};
 talkTo('huang');talkTo('delaney');
 check(`${label}: the neighbors remember ordinary things: earplugs; teenagers by the creek`,()=>{assert.ok(said().includes('MR. HUANG: “A bell? No. I’m asleep by ten. Earplugs.”'));assert.ok(said().includes('MRS. DELANEY: “There’s always somebody out there late. Teenagers, cutting through by the creek.”'));
  assert.ok(said().includes('JAMIE: “What about Mr. Okafor? Next door. His yard goes way back.”'),'a nudge after two');assert.equal(C1().objective,'Ask around near the creek.');});
 talkTo('okafor');U(()=>C1().objective==='Find the old pond road.',20);
 check(`${label}: Mr. Okafor heard it too, and tells them about the old access road to the retention pond`,()=>{for(const l of ['MR. OKAFOR: “…Yes. A few nights this week. Late.”','MR. OKAFOR: “I figured it was some kid out on the pond road.”','MR. OKAFOR: “It runs back to the retention pond. The big drain from the creek comes out back there.”'])assert.ok(said().includes(l),l);});
 // ---- the pond road and the old bike -----------------------------------------------------------------------------
 go({x:SP.driveMouth.x,z:SP.driveMouth.z},{r:.8,max:60});walkTo([QW(E.drive.u,14),QW(E.drive.u,24)],{max:40});U(()=>C1().objective==='Follow it back.'||C3().flags.oldBike,4);
 check(`${label}: the drive between the yards is the old pond road`,()=>{assert.ok(C3().flags.onRoad);assert.ok(said().includes('JAMIE: “I always thought this was just somebody’s driveway.”'));});
 walkTo([QW(E.drive.u,30),QW(E.drive.u-.2,36)],{max:30,stop:()=>C3().flags.oldBike});U(()=>C1().objective==='Look at the bicycle.',40);
 check(`${label}: at the gate, the old bike from the oak; Sam sees it too ("I said I didn’t remember it.")`,()=>{for(const l of ['JAMIE: “That’s it.”','SAM: “What?”','JAMIE: “The bike. From the oak.”','JAMIE: “You said it wasn’t there.”','SAM: “I said I didn’t remember it.”'])assert.ok(said().includes(l),l);
  assert.ok(C3().oldBike);assert.ok(h.chapter3.old.group.visible);});
 const ob=h.chapter3.old.group.position;go(near(ob,1.5),{r:.3,max:20});faceTo(ob.x,ob.z,-.4);wait(.3);
 check(`${label}: F looks at the bike`,()=>assert.equal(prompt(),'F:Look at the bike'));tap('KeyF');U(()=>C1().objective==='Try the bell.',30);
 check(`${label}: an old license sticker; the year rubbed off`,()=>{assert.ok(said().includes('JAMIE: “There’s a sticker. ‘Bicycle license.’ Number four-one-seven.”'));});
 const calls=[];const o=h.chapter.kit.o,orig=o.sfx;o.sfx=(n,p,opt)=>{calls.push(n);return orig(n,p,opt);};
 tap('KeyF');wait(1.4);tap('KeyF');U(()=>C1().objective==='Go home.',120);o.sfx=orig;
 check(`${label}: its bell is rusted solid: a dull click, no ring; the grass is still flat where somebody wheeled it in`,()=>{assert.equal(calls.filter(n=>n==='oldBell').length,2);assert.ok(said().includes('SAM: “It doesn’t even ring.”'));assert.ok(said().includes('JAMIE: “Somebody wheeled it in here. Like, today.”'));assert.ok(C3().evidence);});
 check(`${label}: they will come back tonight; Sam resists, then agrees`,()=>{const a=said().indexOf('JAMIE: “We have to come back tonight.”'),b=said().indexOf('SAM: “No.”'),c=said().indexOf('SAM: “…If anything happens, we leave. Right away. I’m serious.”');assert.ok(a>=0&&b>a&&c>b);assert.ok(said().includes('JAMIE: “Eleven. The corner. Bring a flashlight.”'));});
 // ---- home, and that night -------------------------------------------------------------------------------------------
 walkTo([QW(E.drive.u,30),QW(E.drive.u,20)],{max:30});U(()=>C1().phase==='n3-home',40);U(()=>+element('fade').style.opacity<.05,8);
 check(`${label}: that night: the same house and street, dark; Jamie and Sam at the corner; the ordinary night sounds`,()=>{assert.equal(h.chapter.day,0);assert.ok(h.skyMat.uniforms.night.value>.9);assert.equal(C1().objective,'Meet Jamie and Sam at the corner.');assert.ok(element('date').innerHTML.includes('PM'));
  assert.ok(h.foot.owned&&!h.foot.on,'your flashlight, off');assert.deepEqual(Object.values(C3().amb).map(v=>v>.95),[true,true,true,true]);assert.ok((C3().tension?.value??0)<.1,'calm');});
 onBike();const L0=h.nav.locate(me().x,me().z);press('KeyW');rideTo([X.M1(L0.d+4,-2.4),...X.line(L0.d+4,590,-2.2)],120);brake();U(()=>C1().phase==='n3-ride',30);
 check(`${label}: at the corner: "You came."`,()=>{assert.ok(said().includes('JAMIE: “You came.”'));assert.equal(C1().objective,'Go to the pond road.');});
 press('KeyW');rideTo([X.M1(596,3),S1(10,1.6),...sline(10,139,1.6)],120);brake();U(()=>C1().phase==='n3-drive',10);offBike();if(!h.foot.on)tap('KeyT');
 const ambOrder={},amb0=h.snapshot.clock;const tick=()=>{for(const [k,v] of Object.entries(C3().amb))if(v<.5&&ambOrder[k]===undefined)ambOrder[k]=+(h.snapshot.clock-amb0).toFixed(1);};
 const U2=(fn,max)=>U(()=>{tick();return fn();},max);
 const ticking={stop:()=>{tick();return false;}};clearBike();go(QW(E.drive.u,9),{max:40,...ticking});walkTo([QW(E.drive.u,12),QW(E.drive.u,20),QW(E.drive.u,28)],{max:40,...ticking});walkTo([QW(E.drive.u,33),QW(E.drive.u,37)],{max:30,...ticking});U2(()=>C3().flags.gone,30);
 check(`${label}: down the pond road the night sounds go one at a time (traffic, then the street’s own noises, then the insects); Sam: "Why’d everything stop?"`,()=>{tick();assert.ok(said().includes('SAM: “Why’d everything stop?”'),JSON.stringify({near:h.chapter.blockers(true).filter(o=>Math.hypot(o.x-me().x,o.z-me().z)<o.r+.6).map(o=>({...o,d:+Math.hypot(o.x-me().x,o.z-me().z).toFixed(2)})),walk:h.nav.walkable(me().x,me().z),cpose:h.chapter.pose,c3pose:C3().pose,lock:h.night.roam.walkLock,rlock:h.night.roam.lock,state:h.night.state,prompt:prompt(),foot:h.foot.on,phase:C1().phase,flags:C3().flags,amb:C3().amb,depth:C3().depth,at:h.nav.locate(me().x,me().z),said:said().slice(-4)}));
  assert.ok(ambOrder.traffic!==undefined&&ambOrder.insects!==undefined,'layers went '+JSON.stringify(ambOrder));assert.ok(ambOrder.traffic<ambOrder.life&&ambOrder.life<ambOrder.insects,'order '+JSON.stringify(ambOrder));assert.ok(!h.chapter3.C.rush,'noticed on the way, not forced at the gate');assert.ok(C3().amb.wind>.3,'not muted: the air stays');});
 U2(()=>C3().flags.bell1,30);
 check(`${label}: the bike is gone; "Okay. I saw it this time."; then, after a quiet, one bell, far off`,()=>{for(const l of ['JAMIE: “It was right here.”','SAM: “Okay. I saw it this time.”'])assert.ok(said().includes(l),l+JSON.stringify({ph:C1().phase,fl:C3().flags,at:h.nav.locate(me().x,me().z),said:said().slice(-6)}));assert.equal(h.chapter3.old.group.visible,false);
  const b=C3().bells[0];assert.ok(b&&b.tunnel,'first bell from inside the culvert');assert.ok(Math.hypot(b.pos.x-me().x,b.pos.z-me().z)>14,'far');});
 U2(()=>C1().objective==='Find where the bell came from.',30);
 // Through the gap by the gate and into the basin, toward the outlet.
 walkTo([QW(142.9,40.4),QW(142.9,42.6),QW(143.2,44.4)],{r:.35,max:30});
 check(`${label}: through the bent-back fence beside the gate`,()=>{const L=h.nav.locate(me().x,me().z);assert.equal(L.street,'basin');assert.ok(L.v>E.fence.v0,'inside the basin');});
 go({x:QW(152,49.5)[0],z:QW(152,49.5)[1]},{max:40});U2(()=>C3().flags.bell2,40);wait(4);
 check(`${label}: a second bell, closer, then another from somewhere else: "It moved." "Bells don’t move."`,()=>{const bs=C3().bells;assert.ok(bs.length>=3);const d=Math.hypot(bs[1].pos.x-bs[2].pos.x,bs[1].pos.z-bs[2].pos.z);assert.ok(d>10,'different places '+d);assert.ok(said().includes('JAMIE: “It moved.”'));});
 go({x:SP.apron.x+(me().x-SP.apron.x)*.15,z:SP.apron.z+(me().z-SP.apron.z)*.15},{max:30});faceTo(SP.outlet.x,SP.outlet.z,-.1);
 const tv=()=>C3().tension?.value||0;let beforeVoice=0;U2(()=>{beforeVoice=tv();return C3().flags.voice1;},40);
 U2(()=>C3().flags.voice2,30);U2(()=>said().includes('SAM: “That came from back there.”'),10);
 const v=C3().voices;
 check(`${label}: from inside the culvert, Alex’s ordinary voice: "Jamie?" Then from behind them: "Guys?"`,()=>{assert.equal(v.length,2,JSON.stringify({ph:C1().phase,at:h.nav.locate(me().x,me().z),apron:Math.hypot(me().x-SP.apron.x,me().z-SP.apron.z),C:{nearT:h.chapter3.C.nearT,last:h.chapter3.C.lastEvent,t:h.chapter3.C.t,inT:h.chapter3.C.inT},said:said().slice(-3)}));assert.equal(v[0].word,'jamie');assert.ok(v[0].tunnel);const q=h.world.basin.local(v[0].pos.x,v[0].pos.z);assert.ok(q.u<E.outlet.u-3,'inside the pipe');
  assert.equal(v[1].word,'guys');assert.ok(v[1].dot<-.2,'behind where you were looking: '+v[1].dot);assert.ok(said().includes('JAMIE: “…Alex?”'));assert.ok(said().includes('SAM: “That came from back there.”'));});
 // Turn toward it.
 const bq=C3().voices[1].pos;faceTo(bq.x,bq.z);U2(()=>C3().flags.close,12);
 const cb=C3().bells[C3().bells.length-1],cam=h.camera.position;
 check(`${label}: you turn: nothing. Then a bell right behind you; nothing there either. "RUN!"`,()=>{assert.ok(cb.close);assert.ok(Math.hypot(cb.pos.x-cam.x,cb.pos.z-cam.z)<1.6,'beside you');assert.ok(tv()>.9,'panic '+tv());assert.ok(C3().glimpse!=='showing');});
 U2(()=>C1().phase==='n3-run',6);
 check(`${label}: "Run." — the escape is yours to play`,()=>{assert.equal(C1().objective,'Run.');assert.equal(h.night.state,'c1-walk');});
 // Sprint back out the way we came.
 const runStart=X.SP;void runStart;const t0=h.snapshot.clock;
 walkTo([QW(148,47),QW(147.4,44.2),QW(143.6,44),QW(142.9,42.8),QW(142.9,40.4),QW(E.drive.u,33),QW(E.drive.u,24),QW(E.drive.u,14),QW(E.drive.u,6.5)],{r:.5,max:60,sprint:true});U2(()=>C1().phase==='n3-safe',20);
 const escape=+(h.snapshot.clock-t0).toFixed(1);

 check(`${label}: out to the street under the light; Jamie and Sam made it out too`,()=>{assert.equal(C1().phase,'n3-safe',JSON.stringify({at:h.nav.locate(me().x,me().z),comp:h.chapter.companions.all.map(c=>[c.key,c.mode,c.follow,!!c.script,h.nav.locate(c.px,c.pz)]),stam:h.foot.stamina}));for(const c of h.chapter.companions.all){const L=h.nav.locate(c.px,c.pz);assert.ok(L.street==='side'||L.street==='main'||(L.street==='basin'&&L.v<20),c.key+' still in the basin: '+JSON.stringify(L));}});
 U2(()=>h.snapshot.state==='ended',60);
 check(`${label}: "That was him." "No." "You heard it." "I know." Then LAST LIGHT / Chapter Three`,()=>{const a=said().indexOf('SAM: “That was him.”');assert.ok(a>=0);assert.deepEqual(said().slice(a,a+4),['SAM: “That was him.”','JAMIE: “No.”','SAM: “You heard it. It said your name.”','JAMIE: “I know.”']);
  assert.equal(element('ending').hidden,false);});
 check(`${label}: Chapter Three ran through its phases in order`,()=>{const ph=log.phases.filter(p=>/^(c3|d3|n3)-/.test(p));const want=['c3-black','d3-corner','d3-street','d3-mom','d3-room','d3-phone','d3-window','d3-neighbors','d3-road','d3-oldbike','d3-plan','d3-home','c3-night','n3-home','n3-corner','n3-ride','n3-drive','n3-gate','n3-bell','n3-search','n3-voice','n3-close','n3-run','n3-safe','n3-end'];assert.deepEqual(ph,want);});
 // The heartbeat followed the night's curve: calm at home, rising down the road, highest at the close bell, still up after.
 const curve=Object.fromEntries(['n3-home','n3-drive','n3-gate','n3-bell','n3-search','n3-voice','n3-close','n3-run','n3-safe'].map(p=>{const xs=watchMax.tension.filter(x=>x[0]===p);return [p,{max:+Math.max(...xs.map(x=>x[1])).toFixed(2),min:+Math.min(...xs.map(x=>x[1])).toFixed(2),bpm:+Math.max(...xs.map(x=>x[3])).toFixed(0)}];}));
 check(`${label}: tension: calm at home, building down the road, peak at the bell behind them, slow to come down`,()=>{assert.ok(curve['n3-home'].max<.12);assert.ok(curve['n3-drive'].max>=.12&&curve['n3-drive'].max<.45);assert.ok(curve['n3-bell'].max>=.45);
  assert.ok(curve['n3-voice'].max>=.8);assert.ok(curve['n3-close'].max>=.95||curve['n3-run'].max>=.95);assert.ok(curve['n3-safe'].min>.4,'still up after: '+curve['n3-safe'].min);
  // Every frame, not just where the test looked: the value never moved faster than the fastest authored rise (no steps).
  assert.ok(h.tension.maxRate<=2.001,'no step in the heartbeat: '+h.tension.maxRate);});
 check(`${label}: Jamie and Sam stayed with you all chapter (never lost, never non-finite)`,()=>{assert.equal(watchMax.bad,0);assert.ok(watchMax.gap<30,'max gap '+watchMax.gap.toFixed(1)+' '+JSON.stringify(watchMax.byPhase)+' '+JSON.stringify(watchMax.worst));});
 check(`${label}: nothing went missing or non-finite in Chapter Three`,()=>assert.deepEqual(log.bad,[]));
 metrics['chapter3 lines spoken']=log.said.length;metrics['chapter3 tension curve']=curve;metrics['chapter3 escape seconds']=escape;metrics['chapter3 ambience order (seconds down the pond road when each layer passed half)']=ambOrder;metrics['chapter3 max companion gap']=+watchMax.gap.toFixed(1);metrics['chapter3 played minutes (scripted run, game time)']=+((h.snapshot.clock-startClock)/60).toFixed(1);
 return log;
}

// Focused checks: every QA jump and checkpoint, Start over from inside, the audio events as signals,
// the tension system on its own, the caption tone logic, and seeded randomized runs of the risky stretches.
export async function runChapterThreeChecks(T){
 const {h,advance,check,element,metrics}=T,X=chapterThreeTools(T),{C1,C3,Q,SP,E,until,wait,me,faceTo,walkTo,QW,go,companionsFinite,companionGap}=X;
 const {createAudio}=await import('../dist/audio.js'),{fakeAudioContext}=await import('./playtest-fixes.mjs'),{createTension,HEART}=await import('../dist/tension.js'),{createCaptionTone}=await import('../dist/captions.js');
 const finite=()=>{const c=h.camera.position;return Number.isFinite(c.x+c.y+c.z)&&Number.isFinite(h.night.roam.x+h.night.roam.z)&&companionsFinite();};
 const seeded=(s=2011)=>()=>{s=(s*16807)%2147483647;return s/2147483647;};
 // ---- every QA jump ------------------------------------------------------------------------------------
 const expect={'chapter3-start':'d3-corner','c3-alex-house':'d3-street','alex-bedroom':'d3-room','recording':'d3-phone','neighbors':'d3-neighbors','service-access-day':'d3-road','old-bike':'d3-oldbike',
  'night-start':'n3-home','old-bike-gone':'n3-gate','first-bell':'n3-bell','c3-second-bell':'n3-search','alex-voice':'n3-voice','close-bell':'n3-close','escape':'n3-run','chapter3-end':'n3-safe',
  'phone-recording':'d3-phone','neighbor-investigation':'d3-neighbors','service-access-night':'n3-gate','drainage-search':'n3-search','alex-house-day':'d3-street'};
 const glass=h.world.merged.filter(m=>m.material===h.world.alexWindow);
 for(const [sec,phase] of Object.entries(expect)){h.jump(sec);advance(.6);const day=phase.startsWith('d3-'),inRoom=['d3-room','d3-phone'].includes(phase);
  check(`QA jump ${sec}: lands in ${phase}; everything finite; ${day?'daylight':'night'}${inRoom?', inside Alex’s room':''}`,()=>{assert.equal(C1().phase,phase);assert.ok(finite());assert.ok(h.snapshot.state.startsWith('c1-'),h.snapshot.state);
   assert.equal(h.chapter.day,day?1:0);assert.equal(!!h.foot.light.parent,!day,'your flashlight is in the scene at night only');assert.equal(h.sunlight.castShadow,day);assert.ok(document.body.classList.contains('night1'),'chapter interface');
   assert.equal(!!h.nav.room,inRoom);assert.equal(glass.every(m=>m.visible),!inRoom,'his window glass hidden only from inside');assert.equal(C3().inRoom,inRoom);
   assert.equal(h.chapter3.old.group.visible,day,'the old bike: by the gate all day, gone at night');
   for(const c of h.chapter.companions.all){assert.ok(c.active,c.key+' with you');const L=h.nav.locate(c.mode==='ride'?c.bx:c.px,c.mode==='ride'?c.bz:c.pz);assert.ok(['main','side','basin','room'].includes(L.street),c.key+' somewhere real');}
   if(phase!=='n3-home')assert.ok(companionGap()<14,'Jamie and Sam near you: '+companionGap().toFixed(1));else assert.ok(companionGap()>60,'at night they wait at the corner');});}
 // A jump plays on from where it lands (each one, a few seconds; nothing waits forever on something that cannot happen).
 for(const [sec,next] of [['chapter3-start',p=>p!=='d3-corner'||C3().flags.toHouse||C1().objective],['first-bell',()=>C1().phase==='n3-search'],['c3-second-bell',()=>C3().flags.bell2&&C3().bells.length>=2],['escape',()=>C1().objective==='Run.']]){
  h.jump(sec);const ok=until(()=>!!next(C1().phase),40);check(`QA jump ${sec}: plays on from there`,()=>{assert.ok(ok,C1().phase);assert.ok(finite());});}
 h.jump('close-bell');until(()=>C3().flags.close,8);
 check('QA jump close-bell: the bell right behind you even if you never turn round',()=>{assert.ok(C3().flags.close);const b=C3().bells.at(-1),c=h.camera.position;assert.ok(b.close&&Math.hypot(b.pos.x-c.x,b.pos.z-c.z)<1.6);});
 // ---- checkpoints and Continue ----------------------------------------------------------------------------
 const ids=Object.keys(h.chapter3.LABEL);
 check('Chapter Three checkpoint names are known before they are reached (Continue after a reload)',()=>{assert.ok(ids.length>=14);for(const id of ids)assert.ok(h.chapter.kit.CHECKPOINT[id],id);});
 for(const id of ids){h.jump(id);advance(.4);h.chapter.kit.checkpointTo(id,h.chapter3.LABEL[id]);const sv=h.chapter.saved();
  check(`checkpoint ${id}: saved silently, Continue knows it ("${h.chapter3.LABEL[id]}") and returns to it`,()=>{assert.equal(sv.section,id);assert.equal(sv.label,h.chapter3.LABEL[id]);h.jump(sv.section);advance(.4);assert.ok(finite());assert.ok(/^(c3|d3|n3)-/.test(C1().phase),C1().phase);});}
 // ---- Start over from inside -------------------------------------------------------------------------------
 for(const sec of ['recording','close-bell','escape']){h.jump(sec);advance(1.2);element('restart').onclick?.();advance(.3);
  check(`Start over from ${sec}: nothing of Chapter Three is left behind (room, phone, bike, heartbeat, quiet, pose)`,()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.nav.room,null);assert.ok(glass.every(m=>m.visible));assert.equal(C3().inRoom,false);assert.equal(h.chapter3.phone.visible,false);
   assert.equal(h.chapter3.old.group.visible,false);assert.equal(h.tension.value,0);assert.deepEqual(C3().bells,[]);assert.deepEqual(C3().voices,[]);assert.equal(h.chapter.pose,null);assert.equal(h.night.roam.walkLock,false);assert.deepEqual(Object.values(h.chapter3.amb),[1,1,1,1]);assert.equal(h.audioRef?.phone??null,null);
   for(const c of h.chapter.companions.all)assert.equal(c.active,false);});}
 // A jump after the scare: nothing heard before is still counted (bells, voices, waits).
 h.jump('close-bell');until(()=>C3().flags.close,8);h.jump('first-bell');advance(.5);
 check('a jump after the close bell starts clean: only the first bell has been heard, no voices, no old waits',()=>{assert.equal(C3().bells.length,1);assert.ok(C3().bells[0].tunnel);assert.deepEqual(C3().voices,[]);
  for(const k of ['inT','waitFrom','closeWait','turnedAt','v1At','v2At','closeAt'])assert.equal(h.chapter3.C[k],undefined,k);});
 // ---- the tension system on its own ------------------------------------------------------------------------
 {const t=createTension(),trace=[];const step=(sec,dt=1/60)=>{for(let i=0;i<Math.round(sec/dt);i++){const a=t.value;t.update(dt);trace.push(t.value-a);}};
  check('tension: calm is silent (no heartbeat until it rises past a fifth); heart rate from 64 to 152 bpm',()=>{assert.equal(t.heart.gain,0);assert.equal(t.heart.bpm,HEART.rest);t.value=.19;assert.equal(t.heart.gain,0);t.value=1;assert.ok(Math.abs(t.heart.bpm-HEART.max)<.01);assert.ok(t.heart.gain>.99);
   let prev=-1;for(let v=0;v<=1.0001;v+=.01){t.value=v;const g=t.heart.gain;assert.ok(g>=prev-1e-9,'gain only grows with tension');prev=g;}t.reset();});
  t.set(.3,{rise:.04});step(1);
  check('tension: an authored rise is slow (the pond road: at most .04 a second)',()=>{assert.ok(t.value<=.0401&&t.value>.03,t.value);});
  step(10);t.jolt(1,{rise:2,hold:3});const before=t.value;step(1/60);
  check('tension: even a jolt is a fast rise, never a step (at most 2 a second, 1/30 a frame)',()=>{assert.ok(t.value-before<=2/60+1e-9);step(1.5);assert.ok(t.value>.99,t.value);assert.ok(Math.max(...trace.map(Math.abs))<=2/60+1e-9);});
  t.ease(.3,{fall:.05});step(1.2);const held=t.value;step(10);const after=t.value;step(60);
  check('tension: after a scare it is held a moment, then comes down slowly (minutes, not seconds)',()=>{assert.ok(held>.99,'held '+held);assert.ok(after<held&&after>.6,'slow: '+after);assert.ok(t.value<after&&t.value>.3,t.value);});
  t.reset();t.set(.1);step(5);t.update(1/60,{exertion:1});for(let i=0;i<300;i++)t.update(1/60,{exertion:1});
  check('tension: running while calm makes you breathe hard, not a pounding heart',()=>{assert.ok(t.exertion>.9);assert.ok(t.heart.breath>.4);assert.equal(t.heart.gain,0);});}
 // ---- the body, as audio signals (scheduled events in a stand-in audio graph; not listening) ------------------
 {const ctx=fakeAudioContext(),oscs=[];const co=ctx.createOscillator.bind(ctx);ctx.createOscillator=()=>{const n=co();n.start=at=>{n.at=at;};oscs.push(n);return n;};
  const a=createAudio({context:ctx,random:seeded(9)});a.ensure();a.setEnabled(true);const tn=createTension();
  const S0={speed:0,pedal:false,coasting:false,onBike:false,surface:'grass',p:1,night:1,deep:.4,finale:40,friendsLeft:0,state:'c1-walk',crank:0,night1:true,listener:{x:0,y:1.5,z:0},forward:{x:0,z:-1}};
  const run=(sec,fn)=>{for(let i=0;i<Math.round(sec*30);i++){ctx.currentTime+=1/30;fn?.(i);tn.update(1/30);a.update(1/30,{...S0,heart:tn.heart});}};
  const lubs=()=>oscs.filter(o=>o.frequency.events?.[0]?.[0]==='set'&&o.frequency.events[0][1]===52).map(o=>o.at).sort((x,y)=>x-y);
  run(10);const calm=lubs().length;
  check('heartbeat (signal): nothing at all while calm',()=>{assert.equal(calm,0);assert.equal(a.body.beats,0);assert.equal(a.body.breaths,0);});
  tn.value=tn.target=.6;oscs.length=0;const t0=ctx.currentTime;run(20);const L=lubs().filter(x=>x>t0+.5),iv=L.slice(1).map((x,i)=>x-L[i]),bpm=tn.heart.bpm;
  check('heartbeat (signal): steady tension, steady beat: one "lub" every 60/bpm seconds, on the audio clock',()=>{assert.ok(Math.abs(L.length-(20-.6)*bpm/60)<=2,L.length+' beats at '+bpm.toFixed(1));for(const d of iv)assert.ok(Math.abs(d-60/bpm)<1e-6,'interval '+d);assert.ok(a.body.lastGain<=.341,'never louder than its ceiling');});
  oscs.length=0;tn.value=tn.target=.25;run(6);const t1=ctx.currentTime;tn.jolt(1,{rise:.35,hold:30});run(10);const R=lubs().filter(x=>x>t1-1.6),ri=R.slice(1).map((x,i)=>x-R[i]);
  check('heartbeat (signal): rising tension quickens it smoothly (no seam, no doubled or dropped beat)',()=>{assert.ok(ri.length>15);for(let i=1;i<ri.length;i++){assert.ok(ri[i]<=ri[i-1]+1e-6,'only quickens');assert.ok(ri[i]>ri[i-1]*.92,'no jump between beats '+ri[i-1].toFixed(3)+' → '+ri[i].toFixed(3));}
   assert.ok(Math.min(...ri)>=60/HEART.max-1e-6,'never faster than the ceiling');assert.ok(a.body.breaths>0,'breathing, high up');});
  oscs.length=0;ctx.currentTime+=.7;run(3);const H=lubs();
  check('heartbeat (signal): a dropped frame does not bunch beats up to catch up',()=>{const hi=H.slice(1).map((x,i)=>x-H[i]);assert.ok(hi.every(d=>d>=60/HEART.max-1e-6),JSON.stringify(hi));});
  tn.reset();oscs.length=0;run(4);check('heartbeat (signal): back to silence when tension is gone (Start over)',()=>{const late=lubs().filter(x=>x>ctx.currentTime-3);assert.equal(late.length,0);});}
 // ---- bells, voices, recordings, as signals --------------------------------------------------------------------
 {const ctx=fakeAudioContext(),filters=[],delays=[],pans=[],oscs=[];const cf=ctx.createBiquadFilter.bind(ctx),cd=ctx.createDelay.bind(ctx),co=ctx.createOscillator.bind(ctx);
  ctx.createBiquadFilter=()=>{const n=cf();filters.push(n);return n;};ctx.createDelay=()=>{const n=cd();delays.push(n);return n;};ctx.createOscillator=()=>{const n=co();oscs.push(n);n.setPeriodicWave=()=>{n.wave=true;};return n;};
  const P=()=>({value:0});ctx.createPanner=()=>{const n={outputs:[],connect(x){this.outputs.push(x);return x;},positionX:P(),positionY:P(),positionZ:P()};pans.push(n);return n;};
  const a=createAudio({context:ctx,random:seeded(4)});a.ensure();a.setEnabled(true);
  const clear=()=>{filters.length=0;delays.length=0;pans.length=0;oscs.length=0;};
  clear();a.bell3({x:3,y:1.2,z:-30},1.35,{tunnel:true});
  check('audio: the first bell is placed in the world (head-related panning where the browser has it) and has the culvert on it',()=>{assert.equal(pans.length,1);assert.equal(pans[0].panningModel,'HRTF');assert.deepEqual([pans[0].positionX.value,pans[0].positionZ.value],[3,-30]);
   assert.ok(filters.some(f=>f.type==='lowpass'&&f.frequency.value===2700));assert.deepEqual(delays.map(d=>d.delayTime.value),[.08,.19]);assert.ok(oscs.some(o=>o.frequency.value===1760||o.frequency.events?.some(e=>e[1]===1760)));});
  clear();a.bell3({x:-1,y:1.3,z:1.1},.62,{ref:1});
  check('audio: the close bell is the same ordinary bell, dry, right beside you',()=>{assert.equal(pans.length,1);assert.equal(delays.length,0);assert.ok(!filters.some(f=>f.type==='lowpass'&&f.frequency.value===2700));assert.equal(pans[0].refDistance,1);});
  for(const [word,tunnel] of [['jamie',true],['guys',false]]){clear();const dur=a.voice(word,{x:0,y:1.3,z:-12},{tunnel});const src=oscs.find(o=>o.wave),fs=src.frequency.events.map(e=>e[1]);
   check(`audio: Alex’s voice, "${word==='jamie'?'Jamie?':'Guys?'}": a boy’s ordinary voice${tunnel?' from inside the pipe':''} (formant synthesis; no pitch-shift, no reverb wash)`,()=>{assert.ok(dur>.3&&dur<1.2,'a word, not a phrase: '+dur);assert.ok(fs.every(f=>f>=200&&f<=330),'a twelve-year-old’s pitch '+fs.map(f=>f.toFixed(0)));
    assert.ok(fs.at(-1)>fs[0],'rising: a question');assert.equal(delays.length,tunnel?2:0);assert.equal(pans.length,1);});}
  const dur=[0,1,2,3,4].map(i=>a.recording(i,{x:0,y:1,z:-.5}));
  const capLen=r=>r.lines.reduce((s2,l)=>s2+(l.wait??0)+(l.time??0)+(l.gap??0),0);
  check('audio: the recordings on his phone are as long as their captions; the last is the night before (bells at the caption marks)',()=>{assert.deepEqual(dur,[8.6,9,8.2,9.4,23.5]);const R=h.chapter3.RECS;R.forEach((r,i)=>assert.ok(Math.abs(capLen(r)-dur[i])<1.6,i+': '+capLen(r)+' vs '+dur[i]));
   let t=0;const marks={};for(const l of R[4].lines){t+=l.wait??0;if(l.mark)marks[l.mark]=t;t+=(l.time??0)+(l.gap??0);}assert.ok(Math.abs(marks.bell1-7.6)<.05&&Math.abs(marks.bell2-11.2)<.05&&Math.abs(marks.voice-14.6)<.05,JSON.stringify(marks));});
  const ph=a.phone;a.stopRecording();
  check('audio: a recording stops when it is stopped (its speaker fades out at once)',()=>{assert.equal(a.phone,null);const ev=ph.spk.gain.events.at(-1);assert.equal(ev[0],'lin');assert.equal(ev[1],0);});}
 // In the game: each bell and voice happens once, where the story says; Alex's voice is never placed where you can see it come from.
 {const calls=[];const o=h.chapter.kit.o,orig=o.audio;o.audio=()=>new Proxy(orig()||{},{get:(tg,k)=>['bell3','voice','sfx'].includes(k)?(...args)=>{calls.push([k,...args]);return k==='voice'?.6:null;}:typeof tg[k]==='function'?tg[k].bind(tg):tg[k]});
  h.jump('alex-voice');until(()=>C3().flags.voice2,30);until(()=>C3().flags.close,12);advance(3);o.audio=orig;
  const voices=calls.filter(c=>c[0]==='voice'),bells=calls.filter(c=>c[0]==='bell3');
  check('in the game: "Jamie?" once from deep in the culvert, "Guys?" once from behind, one bell right behind you; nothing repeats',()=>{assert.deepEqual(voices.map(v=>v[1]),['jamie','guys']);assert.equal(voices[0][3].tunnel,true);assert.equal(bells.length,1);
   const q=h.world.basin.local(voices[0][2].x,voices[0][2].z);assert.ok(q.u<E.outlet.u-8,'deep in the pipe');});}
 // ---- captions: light on dark, dark on bright, no flicker, small readback --------------------------------------------
 {const el={style:{setProperty(k,v){this[k]=v;}}},renderer={getContext:()=>null,domElement:{width:2880,height:1800}};const tone=createCaptionTone({renderer,el});const S=tone.S;
  const run=(sec,bg,dt=1/60)=>{let sw=0,prev=S.mode;for(let i=0;i<Math.round(sec/dt);i++){const b=typeof bg==='function'?bg(i*dt):bg;S.source='frame';S.lum=b;S.lo=b*.8;S.hi=Math.min(1,b*1.25);tone.update(dt);if(S.mode!==prev){sw++;prev=S.mode;}}return sw;};
  run(2,.01);check('captions: light words over a dark night (warm off-white, dark soft edge)',()=>{assert.equal(tone.state.mode,'light');assert.equal(el.style['--cap-color'],'rgb(255,244,226)');assert.ok(tone.state.contrast>7);});
  const sw=run(.3,.75);const mixEarly=S.mix;run(3,.75);
  check('captions: dark words over a bright sky, after a short settle (no snap)',()=>{assert.equal(sw,0,'not on the first glance');assert.ok(mixEarly<.05);assert.equal(tone.state.mode,'dark');assert.ok(S.mix>.99);assert.equal(el.style['--cap-color'],'rgb(30,29,27)');assert.ok(tone.state.contrast>4.5);});
  run(2,.01);const flick=run(10,t=>Math.floor(t/.25)%2?.7:.02);
  check('captions: police lights or a flashlight sweeping behind the words never make them flicker',()=>assert.equal(flick,0));
  const border=run(12,t=>.18+.05*Math.sin(t*5));check('captions: a background hovering in between does not flip back and forth',()=>assert.ok(border<=1,border));
  run(2,.01);const ramp=run(8,t=>Math.min(.8,t/5*.8));check('captions: a slow change from night to bright day flips once',()=>assert.equal(ramp,1));
  // A strip so mixed that neither tone reads (a lit shirt in the dark): a faint glow behind the line; gone again after.
  const run2=(sec,lo,hi,dt=1/60)=>{for(let i=0;i<Math.round(sec/dt);i++){S.source='frame';S.lo=lo;S.hi=hi;S.lum=(lo+hi)/2;tone.update(dt);}};
  run2(6,.01,.01);const before=tone.state.scrim;run2(3,.015,.9);const mixed=tone.state.scrim,mixedVar=el.style['--cap-scrim'];run2(6,.01,.012);
  check('captions: only where the background is too mixed for either tone, a faint glow behind the line (not a box), easing away after',()=>{assert.equal(before,0,'before '+JSON.stringify(tone.state));assert.ok(mixed>.9,'mixed '+mixed);assert.match(mixedVar,/^radial-gradient/);assert.equal(tone.state.scrim,0);assert.equal(el.style['--cap-scrim'],'none');});
  const reg=tone.region();check('captions: what is read back is a small strip behind the words, never the frame',()=>{assert.ok(reg.w<=224&&reg.h<=40);assert.ok(reg.x>=0&&reg.y>=0&&reg.x+reg.w<=2880&&reg.y+reg.h<=1800);});}
 {globalThis.WebGL2RenderingContext??=class{};const calls=[];let signaled=false;const gl=Object.assign(Object.create(globalThis.WebGL2RenderingContext.prototype),{PIXEL_PACK_BUFFER:1,STREAM_READ:2,RGBA:3,UNSIGNED_BYTE:4,SYNC_GPU_COMMANDS_COMPLETE:5,ALREADY_SIGNALED:6,CONDITION_SATISFIED:7,WAIT_FAILED:8,TIMEOUT_EXPIRED:9,
   createBuffer:()=>({}),bindBuffer(){},bufferData(){},flush(){},deleteSync(){},fenceSync:()=>({}),readPixels:(...a)=>calls.push(['read',...a]),clientWaitSync:(s2,f,timeout)=>{calls.push(['wait',timeout]);return signaled?6:9;},getBufferSubData:(t,o2,buf,off,n)=>{calls.push(['get',n]);buf.fill(240,0,n);}});
  const tone=createCaptionTone({renderer:{getContext:()=>gl,domElement:{width:2880,height:1800}},el:null});tone.sample(0);tone.sample(16);signaled=true;tone.sample(32);
  check('captions: the strip is read back asynchronously (a fence, polled without waiting; the GPU is never stalled)',()=>{const reads=calls.filter(c=>c[0]==='read');assert.equal(reads.length,1);assert.ok(reads[0][3]*reads[0][4]<=224*40);assert.equal(reads[0][7],0,'into a pixel-pack buffer');
   assert.ok(calls.filter(c=>c[0]==='wait').every(c=>c[1]===0),'never blocks');assert.equal(calls.filter(c=>c[0]==='get').length,1);assert.equal(tone.state.source,'frame');assert.ok(tone.state.lum>.8);});}
 // In the game: the night reads light; turning the captions off in Settings still hides them.
 h.jump('first-bell');advance(2);check('captions in the game: over the night, light words',()=>{assert.equal(h.captionTone.state.mode,'light');assert.equal(element('subtitle').style['--cap-color']??element('subtitle').style.getPropertyValue?.('--cap-color')??'rgb(255,244,226)','rgb(255,244,226)');});
 h.jump('old-bike');advance(.5);h.face(0,1.1);advance(4);check('captions in the game: looking up into a bright daytime sky, dark words',()=>assert.equal(h.captionTone.state.mode,'dark'));h.look(0,0);
 // ---- seeded randomized runs of the risky stretches --------------------------------------------------------------------
 const trials={drive:[],gap:[],escape:[]};
 for(const seed of [3,8,21]){const rnd=seeded(seed);
  // Down the fenced pond road on foot with Jamie and Sam: different paces, pauses, a sprint, a stop to look back.
  for(let k2=0;k2<4;k2++){h.jump('night-start');const st=C3();void st;h.chapter3.C.flags.met=true;
   const q=QW(E.drive.u+(rnd()-.5)*1.6,8+rnd()*2);h.placePlayer({x:q[0],z:q[1],a:Q.heading,mode:'walk'});
   // Half the time they are on foot at the mouth; otherwise still on their bikes somewhere back along the street (they brake, get off, and come after you).
   if(k2%2===0){const jq=QW(E.drive.u-1.2,6.5),sq=QW(E.drive.u+1.4,6);h.chapter.companions.putFoot(h.chapter.kit.jamie,jq[0],jq[1],Q.heading);h.chapter.companions.putFoot(h.chapter.kit.sam,sq[0],sq[1],Q.heading);}
   else for(const c of [h.chapter.kit.jamie,h.chapter.kit.sam]){const u=124+rnd()*14,v=(rnd()-.5)*5,p2=X.S1(u,v);h.chapter.companions.putRiding(c,p2[0],p2[1],h.chapter.kit.ha(u),1+rnd()*3);c.follow='ride';}
   h.chapter.kit.go("n3-ride");h.chapter3.C.flags.drive=false;h.chapter3.C.match=true;advance(.2);
   const t0=h.snapshot.clock;let worst=0;const pts=[[E.drive.u+(rnd()-.5)*1.4,16],[E.drive.u+(rnd()-.5)*1.4,24],[E.drive.u+(rnd()-.5)*1.4,31],[E.drive.u+(rnd()-.5)*1.2,36.6]].map(([u,v])=>QW(u,v));
   for(const p2 of pts){walkTo([p2],{max:30,sprint:rnd()<.3,stop:()=>{if(h.snapshot.clock-t0>10)worst=Math.max(worst,companionGap());return false;}});if(rnd()<.4)wait(rnd()*3);}
   const ok=until(()=>C3().flags.gone,40)&&until(()=>(C1().line||'').includes('It was right here'),10);trials.drive.push({seed,k:k2,ok,secs:+(h.snapshot.clock-t0).toFixed(1),gap:+worst.toFixed(1),atGate:+companionGap().toFixed(1),...(ok?{}:{ph:C1().phase,fl:C3().flags,me:h.nav.locate(me().x,me().z),comp:h.chapter.companions.all.map(c=>[c.mode,c.follow,!!c.script,h.nav.locate(c.px,c.pz)])})});}
  // Into the basin after the first bell: Jamie and Sam follow you through the bent fence.
  for(let k2=0;k2<3;k2++){h.jump('first-bell');until(()=>C1().phase==='n3-search',30);walkTo([QW(142.9,40.4),QW(142.9+(rnd()-.5)*.5,42.6),QW(143.2,44.4)],{r:.35,max:30});
   go({x:QW(148+rnd()*6,47+rnd()*4)[0],z:QW(148+rnd()*6,47+rnd()*4)[1]},{max:40});wait(4+rnd()*4);
   const inside=h.chapter.companions.all.map(c=>{const L=h.nav.locate(c.px,c.pz);return L.street==='basin'&&L.v>E.fence.v0;});trials.gap.push({seed,k:k2,inside,gap:+companionGap().toFixed(1)});}
  // The escape: out the way you came, at your own pace; sometimes you hesitate, sometimes you run the long way round.
  for(let k2=0;k2<4;k2++){h.jump('escape');advance(.2+rnd()*1.5);const t0=h.snapshot.clock;const long=rnd()<.35;
   const route=[QW(148+rnd(),47.5),QW(147.4,44.2),QW(143.6,44),QW(142.9,42.8),QW(142.9,40.4),QW(E.drive.u,33),QW(E.drive.u,20),QW(E.drive.u,6.5)];if(long)route.unshift(QW(155.5,54.5+rnd()*1.5),QW(153,46));
   walkTo(route,{r:.5,max:70,sprint:rnd()<.8});const ok=until(()=>C1().phase==='n3-safe',20);
   const out=h.chapter.companions.all.every(c=>{const L=h.nav.locate(c.px,c.pz);return L.street!=='basin'||L.v<20;});trials.escape.push({seed,k:k2,long,ok,out,secs:+(h.snapshot.clock-t0).toFixed(1),...(ok?{}:{me:h.nav.locate(me().x,me().z)})});}}
 check(`randomized (3 seeds): ${trials.drive.length} walks down the pond road all reach the empty gate with Jamie and Sam close (whether they were on foot at the mouth or still riding up the street)`,()=>{for(const t of trials.drive){assert.ok(t.ok,JSON.stringify(t));assert.ok(t.gap<24&&t.atGate<7,JSON.stringify(t));}});
 check(`randomized (3 seeds): ${trials.gap.length} times through the bent fence, Jamie and Sam come in after you`,()=>{for(const t of trials.gap){assert.ok(t.inside.every(Boolean),JSON.stringify(t));assert.ok(t.gap<10,JSON.stringify(t));}});
 check(`randomized (3 seeds): ${trials.escape.length} escapes all end under the street light, both friends out too, nobody stuck`,()=>{for(const t of trials.escape){assert.ok(t.ok&&t.out,JSON.stringify(t));}});
 metrics['chapter3 randomized']=trials;metrics['chapter3 jumps']=Object.keys(expect).length;metrics['chapter3 checkpoints']=ids.length;
 h.jump('chapter3-start');advance(.2);element('restart').onclick?.();advance(.2);
}
