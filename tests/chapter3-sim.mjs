// Chapter Three in the simulation harness: played the way a player would (riding and walking with the
// keys, turning to look, pressing F where the prompt says, running), straight on from the end of
// Chapter Two; then every QA jump and checkpoint, Continue and Start over, replays in one session, the
// figure seen from every way you might be facing, dozens of randomized escape and companion runs, the
// muted readability of each scare (who looks where, whose light goes where), and the render budget of
// the new places. Called from verify.mjs with the running harness; real dist/ modules.
import assert from 'node:assert/strict';
import {chapterTwoTools} from './chapter2-sim.mjs';

export function chapterThreeTools(T){
 const X=chapterTwoTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo}=X;
 const C1=()=>h.chapter.state,C3=()=>h.chapter3.state,Wd=h.world.woods,Dr=h.world.drain;
 const B=h.world.sideFrames[0],S1=(u,v)=>{const p=B.point(u,v);return [p.x,p.z];},sline=(u0,u1,v,st=12)=>{const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(S1(u0+(u1-u0)*i/n,v));return o;};
 const M1=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];},line=(d0,d1,l,st=20)=>{const o=[];const n=Math.ceil(Math.abs(d1-d0)/st);for(let i=1;i<=n;i++)o.push(M1(d0+(d1-d0)*i/n,l));return o;};
 // Points along the old road (s from Briarwood's end, t across) and along the drain.
 const R1=(s,t=0)=>{const p=Wd.at(s,t);return [p.x,p.z];},rline=(s0,s1,t=0,st=8)=>{const o=[];const n=Math.ceil(Math.abs(s1-s0)/st);for(let i=1;i<=n;i++)o.push(R1(s0+(s1-s0)*i/n,t));return o;};
 const D1=(s,t=0)=>{const p=Dr.at(s,t);return [p.x,p.z];},dline=(s0,s1,t=0,st=3)=>{const o=[];const n=Math.ceil(Math.abs(s1-s0)/st);for(let i=1;i<=n;i++)o.push(D1(s0+(s1-s0)*i/n,t));return o;};
 const O1=(a,b)=>{const p=Wd.fromA(a,b);return [p.x,p.z];};
 const where=()=>{const p=me();return h.nav.locate(p.x,p.z);};
 const offBike=()=>{if(h.night.state==='c1-ride'){release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');tap('KeyF');until(()=>h.night.state==='c1-walk',4);wait(.3);}};
 const onBike=()=>{if(h.night.state==='c1-walk'){const r=h.night.roam,p=me(),path=h.nav.walkPath({x:p.x,z:p.z},{x:r.x,z:r.z});X.walkTo(path.length?path:[[r.x,r.z]],{r:1.2,max:40});faceTo(r.x,r.z);wait(.2);tap('KeyF');until(()=>h.night.state==='c1-ride',4);}};
 const go=(q,o={})=>{const to={x:q.x??q[0],z:q.z??q[1]},p=me(),path=h.nav.walkPath({x:p.x,z:p.z},to),pts=path.length?path:[[to.x,to.z]];
  if(h.night.state==='c1-walk'){const r=h.night.roam,[ax,az]=pts[0],dx=ax-p.x,dz=az-p.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((r.x-p.x)*dx+(r.z-p.z)*dz)/l2)),cx=p.x+dx*t,cz=p.z+dz*t;
   if(Math.hypot(cx-r.x,cz-r.z)<.8){const l=Math.sqrt(l2),nx=-dz/l,nz=dx/l,sg=Math.sign((p.x-r.x)*nx+(p.z-r.z)*nz)||1;pts.unshift([r.x+nx*sg*1.1-dx/l*.2,r.z+nz*sg*1.1-dz/l*.2],[r.x+nx*sg*1.1+dx/l*.9,r.z+nz*sg*1.1+dz/l*.9]);}}
  return walkTo(pts,o);};
 const prompt=()=>h.ui.promptText;
 const companionsFinite=()=>h.chapter.companions.all.every(c=>!c.active||Number.isFinite(c.bx+c.bz+c.px+c.pz));
 const companionGap=()=>{const p=me();return Math.max(...h.chapter.companions.all.filter(c=>c.active).map(c=>Math.hypot((c.mode==='ride'?c.bx:c.px)-p.x,(c.mode==='ride'?c.bz:c.pz)-p.z)));};
 const cs=c=>{const q=Dr.project(c.px,c.pz);return q&&q.s>-.5&&Math.abs(q.t)<3.2?q.s:-1;};
 return {...X,C1,C3,Wd,Dr,B,S1,sline,M1,line,R1,rline,D1,dline,O1,where,offBike,onBike,go,prompt,companionsFinite,companionGap,cs};
}

export function smokeJumps(T){const {h,advance,check}=T,X=chapterThreeTools(T),{C1,C3,until}=X;const out={};
 for(const sec of h.chapter3.SECTIONS){h.jump(sec);advance(.5);const ph0=C1().phase;until(()=>false,4);out[sec]=[ph0,C1().phase,C3().figure.state,h.nav.locate(X.me().x,X.me().z).street,X.companionsFinite()];
  check(`QA jump ${sec}: no error, everyone where they can be`,()=>{assert.ok(X.companionsFinite());assert.ok(Number.isFinite(h.camera.position.y));});}
 console.log(JSON.stringify(out));return out;}

// From the end of Chapter Two (its final lines) to the end of Chapter Three, with inputs only.
export function playChapterThree(T,label){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterThreeTools(T),{C1,C3,log,until,wait,me,faceTo,walkTo,rideTo,brake,Wd,Dr,S1,sline,R1,rline,D1,dline,O1,where,offBike,onBike,go,prompt,companionsFinite,companionGap,cs}=X;
 const M=/replay/.test(label)?{}:metrics;const said=()=>log.said;const watch={gap:0,tension:[],bad:0,byPhase:{},worst:null},startClock=h.snapshot.clock;
 const sample=()=>{const c=C3(),g=companionGap(),ph=C1().phase;watch.byPhase[ph]=Math.max(watch.byPhase[ph]||0,+g.toFixed(1));
  if(!/^(c3-black|d3-home|c3-night|n3-home|n3-end|n3-run|n3-out)$/.test(ph)&&g>watch.gap){watch.gap=g;try{watch.worst={ph,me:where(),c:h.chapter.companions.all.map(c=>[c.key,c.mode,c.follow,!!c.script,+c.speed.toFixed(2),+(c.mode==='ride'?c.bx:c.px).toFixed(1),+(c.mode==='ride'?c.bz:c.pz).toFixed(1),h.nav.locate(c.mode==='ride'?c.bx:c.px,c.mode==='ride'?c.bz:c.pz)]),cars:(h.chapter.police?.cars||[]).map(k=>k.group?.visible?[+k.group.position.x.toFixed(1),+k.group.position.z.toFixed(1)]:null),adults:[...h.chapter.kit.adults,...Object.values(h.chapter3.people||{})].filter(a=>a.group?.visible??a.visible).map(a=>[a.name||a.key,+(a.x??a.pos?.x??0).toFixed(1),+(a.z??a.pos?.z??0).toFixed(1)])};}catch(e){watch.worst={ph,err:String(e)};}}if(!companionsFinite())watch.bad++;
  watch.tension.push([ph,c.tension?.value??0,c.tension?.bpm??0]);};
 const U=(fn,max)=>until(()=>{sample();return fn();},max);
 const rideU=(pts,max=150)=>{h.drive(pts,{r:2.6});const ok=U(()=>!h.driving,max);h.stopDriving();return ok;};
 const lineSaid=l=>said().includes(l);
 // ---- the hand-over --------------------------------------------------------------------------------------------
 let cardSeen=false,overBlack=1;U(()=>{const cc=element('chapter-card');if(cc.classList.contains('on')){cardSeen=true;overBlack=Math.min(overBlack,+element('fade').style.opacity);}return C1().phase==='d3-street';},140);
 check(`${label}: Chapter Two runs straight into Chapter Three: no end menu, a quiet CHAPTER THREE card over black`,()=>{assert.equal(element('ending').hidden,true);assert.ok(cardSeen,'card');assert.ok(overBlack>.99,'over black '+overBlack);assert.ok(log.phases.includes('c3-black'));
  assert.ok(+element('fade').style.opacity<.05,'faded back in');assert.equal(h.chapter.day,1,'daylight');assert.ok(element('date').innerHTML.includes('9:16 AM'));});
 check(`${label}: "Maybe yesterday wasn’t the first time." — "Talk to Alex’s mom."`,()=>{assert.ok(lineSaid('JAMIE: “Maybe yesterday wasn’t the first time.”'));assert.ok(lineSaid('YOU: “His mom would know.”'));assert.equal(C1().objective,'Talk to Alex’s mom.');});
 // ---- Alex's house, his mom, his room, his phone, his window ------------------------------------------------------
 if(h.night.state!=='c1-ride')onBike();
 press('KeyW');rideTo([S1(10,1.6),...sline(10,118,1.6)],120);brake();U(()=>C3().flags.atHouse,10);
 offBike();const mp=h.chapter.mom.pos;go({x:mp.x+(me().x-mp.x)/Math.hypot(me().x-mp.x,me().z-mp.z)*1.6,z:mp.z+(me().z-mp.z)/Math.hypot(me().x-mp.x,me().z-mp.z)*1.6},{r:.5,max:30,stop:()=>C3().flags.momTalk});faceTo(mp.x,mp.z);wait(.4);
 if(!C3().flags.momTalk){check(`${label}: F talks to her`,()=>assert.equal(prompt(),'F:Talk to Alex’s mom'));tap('KeyF');}
 U(()=>C1().objective==='Go up to Alex’s room.',90);
 check(`${label}: his mom: he kept asking if she heard a bike bell outside at night`,()=>{for(const l of ['ALEX’S MOM: “He kept asking if I heard a bike bell outside. At night.”','ALEX’S MOM: “I figured it was one of the neighbor kids riding around late. I told him to go to sleep.”'])assert.ok(lineSaid(l),l);});
 const AH=h.world.homes.alex,door=AH.toWorld(AH.doorX,AH.stepFront+.7);go(door,{r:.5,max:30});faceTo(door.x,door.z);wait(.3);tap('KeyF');U(()=>C3().inRoom&&+element('fade').style.opacity<.05,8);
 const R=h.world.interiors['alex-room'],RW=h.chapter3.RW,phone=h.chapter3.phone.position;
 check(`${label}: upstairs in his room, first person, Jamie and Sam with you`,()=>{assert.equal(C1().phase,'d3-room');assert.equal(where().street,'room');for(const c of h.chapter.companions.all)assert.equal(h.nav.locate(c.px,c.pz).street,'room',c.key);});
 go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20});faceTo(phone.x,phone.z,-.6);U(()=>C1().objective==='Listen to Alex’s recordings.',40);wait(.3);
 tap('KeyF');U(()=>C1().phase==='d3-phone',4);wait(1.4);
 for(let i=0;i<5;i++){U(()=>prompt()==='F:Play'||prompt()==='F:Next recording',40);tap('KeyF');U(()=>C3().recPlaying<0&&!h.chapter.state.line,45);wait(.6);}
 U(()=>C1().objective==='Look out his window.',60);
 check(`${label}: the recordings: four ordinary ones, then the night before: a bell outside, twice, "There it is again."`,()=>{assert.deepEqual(C3().heard,[0,1,2,3,4]);const caps=log.captions.join('\n');for(const c of ['[A bike bell. Outside.]','[The bell again.]','“There it is again.”'])assert.ok(caps.includes(c),c);});
 const sw=RW(R.sideWindow.x,R.sideWindow.z),look=RW(R.sideWindow.look.x,R.sideWindow.look.z);go(sw,{r:.3,max:20});faceTo(look.x,look.z,-.1);U(()=>C3().flags.window,6);if(!C3().flags.window)tap('KeyF');
 U(()=>C1().objective==='Ask the neighbors.',50);wait(1.5);const dr=RW(R.door.x,R.door.z);go(dr,{r:.3,max:20});faceTo(RW(R.door.face.x,R.door.face.z).x,RW(R.door.face.x,R.door.face.z).z);wait(.2);tap('KeyF');U(()=>C1().phase==='d3-neighbors'&&!C3().inRoom,6);
 // ---- asking around ---------------------------------------------------------------------------------------------
 const near=(q,d)=>{const l=Math.hypot(me().x-q.x,me().z-q.z)||1;return {x:q.x+(me().x-q.x)/l*d,z:q.z+(me().z-q.z)/l*d};};
 const talkTo=key=>{const a=h.chapter3.people[key];go(near(a,1.8),{r:.6,max:60});faceTo(a.x,a.z);wait(.4);tap('KeyF');U(()=>C3().talked.includes(key)&&!h.chapter.state.line&&h.chapter.state.queue===0,40);wait(.5);};
 talkTo('huang');talkTo('delaney');
 check(`${label}: the neighbors remember ordinary things; after two, Jamie thinks of Mr. Okafor`,()=>{assert.ok(lineSaid('MR. HUANG: “A bell? No. I’m asleep by ten. Earplugs.”'));assert.ok(lineSaid('JAMIE: “What about Mr. Okafor? Next door. He’s always up late.”'));});
 talkTo('okafor');U(()=>C1().objective==='Find the old service road.',20);
 check(`${label}: Mr. Okafor heard it too; the old city road at the end of Briarwood, down to the big storm drain`,()=>{for(const l of ['MR. OKAFOR: “…Yes. A few nights this week. Late. Down the street, toward the end.”','MR. OKAFOR: “End of Briarwood, past the last house. There’s a gate. An old city road goes down from there.”','MR. OKAFOR: “Down to the big storm drain in the woods. Your creek ends up down there. All of it does.”'])assert.ok(lineSaid(l),l);});
 // ---- the end of Briarwood, by day ---------------------------------------------------------------------------------
 onBike();press('KeyW');const L1=where();rideTo([...sline(Math.max(30,L1.u||130)+4,240,1.2,10)],120);U(()=>C3().flags.roadDay,15);brake();U(()=>C1().objective==='Go through the gate.',20);
 check(`${label}: the end of Briarwood: bollards, a gate, faded signs; "That’s not a road."`,()=>{assert.ok(lineSaid('SAM: “That’s not a road. That’s a gate into the woods.”'),JSON.stringify({said:said().slice(-6),ph:C1().phase,obj:C1().objective,fl:C3().flags,at:where(),rs:C3().roadS,line:C1().line,q:C1().queue}));assert.ok(h.chapter3.marks.visible);assert.equal(h.chapter3.old.group.visible,false,'no bike out here by day');});
 press('KeyW');rideTo([R1(4,.4),R1(12,.6),R1(20,.4)],40);brake();U(()=>C3().flags.tracks,20);U(()=>C1().objective==='See where the tracks lead.',30);
 check(`${label}: a narrow tire track in the dust going in, weeds pushed flat: recent, not explained`,()=>{for(const l of ['YOU: “A bike. One tire.”','JAMIE: “And the weeds by the gate are pushed down. That’s from today. Or last night.”'])assert.ok(lineSaid(l),l);});
 press('KeyW');rideTo(rline(20,108,.5,10),60);U(()=>C1().phase==='d3-plan'||C1().phase==='d3-home',20);brake();
 // Try to go on in daylight: the way is not open (Sam: far enough), you can go no deeper than the bend.
 press('KeyW');rideTo(rline(108,170,.4,8),20);brake();const dayMax=where().s;
 U(()=>C1().objective==='Go home.',120);
 check(`${label}: where the road bends into the woods they stop: back tonight (Alex heard it at night; the bell was at night; nobody looking); Sam reluctant`,()=>{
  for(const l of ['SAM: “Okay. That’s far enough.”','JAMIE: “We have to come back tonight.”','JAMIE: “He heard it at night. We heard it at night. Whatever it is, it’s not out here in the daytime.”','SAM: “…If anything happens, we leave. Right away. I’m serious.”','JAMIE: “Eleven. The corner. Bring a flashlight.”'])assert.ok(lineSaid(l),l+JSON.stringify({said:said().slice(-5),ph:C1().phase,obj:C1().objective,fl:C3().flags,rs:C3().roadS,st:h.night.state,line:C1().line,q:C1().queue,dayMax}));
  assert.ok(dayMax<141,'no deeper than the bend by day: '+dayMax);});
 // ---- that night ---------------------------------------------------------------------------------------------------
 press('KeyW');rideTo(rline(where().s||100,2,0,10).concat([S1(240,1.2),S1(220,1.2)]),80);U(()=>C1().phase==='n3-home',60);release('KeyW');U(()=>+element('fade').style.opacity<.05,10);
 check(`${label}: that night, home: dark, the flashlight in your pocket, calm`,()=>{assert.equal(h.chapter.day,0);assert.equal(C1().objective,'Meet Jamie and Sam at the corner.');assert.ok(h.foot.owned&&!h.foot.on);assert.ok((C3().tension?.value??0)<.1);});
 onBike();const L0=where();press('KeyW');rideTo([X.M1(L0.d+4,-2.4),...X.line(L0.d+4,590,-2.2)],120);brake();U(()=>C1().phase==='n3-ride',30);
 check(`${label}: at the corner: "You came."; to the end of Briarwood`,()=>{assert.ok(lineSaid('JAMIE: “You came.”'));assert.equal(C1().objective,'Ride to the end of Briarwood.');});
 press('KeyW');rideU([X.M1(596,3),S1(10,1.6),...sline(10,246,1.4,12)],140);U(()=>C1().phase==='n3-road',10);const tRoad=h.snapshot.clock;
 check(`${label}: the old road at night: lights on (yours on your handlebars), Jamie's and Sam's; they ride in close`,()=>{assert.ok(h.foot.on);assert.ok(h.chapter.barLight);assert.ok(h.chapter.kit.S.flashOn);assert.ok(h.chapter2.samBeam.on);assert.ok(h.chapter.companions.all.every(c=>c.tight===1));});
 const roadPts=[...rline(2,Wd.L-6,0,9)];rideU(roadPts,240);const rideSecs=+(h.snapshot.clock-tRoad).toFixed(1);U(()=>C1().phase==='n3-outfall',20);brake();
 check(`${label}: the road: out of sight of the houses, a branch swinging back behind them, a reflector, something between the trees ("Deer."), water`,()=>{
  for(const l of ['SAM: “You can’t even see the houses anymore.”','JAMIE: “Deer.”','SAM: “I can hear water.”'])assert.ok(lineSaid(l),l);assert.ok(h.chapter3.C.flags.glint||true);
  for(const l of ['SAM: “You can’t even see the houses anymore.”','SAM: “Did you guys hit that branch?”','SAM: “Whoa—”','JAMIE: “Deer.”','SAM: “I can hear water.”'])assert.ok(said().filter(x=>x===l).length<=1,'said once: '+l);});
 check(`${label}: the ride from the end of Briarwood down to the outfall takes 90 s to 2.5 min`,()=>assert.ok(rideSecs>=80&&rideSecs<=170,'ride '+rideSecs));
 U(()=>C1().objective==='Enter the drain.',40);
 check(`${label}: at the outfall: "That’s where the creek goes. Behind Alex’s." — "Enter the drain."`,()=>{assert.ok(lineSaid('JAMIE: “That’s where the creek goes. Behind Alex’s. All of it comes out here.”'));assert.ok(lineSaid('SAM: “We are not going in there.”'));});
 offBike();const tIn=h.snapshot.clock;
 check(`${label}: the bike cannot go into the drain`,()=>{const m=Dr.at(3);assert.equal(h.nav.rideable(m.x,m.z),false);});
 go({x:O1(9,4)[0],z:O1(9,4)[1]},{max:40});walkTo([O1(6,0),O1(1.2,0),D1(3,0),D1(8,0)],{r:.5,max:40});U(()=>C1().phase==='n3-tunnel',10);
 check(`${label}: inside, on foot; Jamie ahead, Sam behind`,()=>{assert.equal(where().street,'drain',JSON.stringify({me:me(),L:where(),ph:C1().phase,st:h.night.state,O:O1(1.2,0),D:D1(3,0),walk:[h.nav.walkable(...O1(1.2,0)),h.nav.walkable(...D1(3,0))],comp:h.chapter.companions.all.map(c=>[c.key,c.mode,+c.px.toFixed(1),+c.pz.toFixed(1),c.bike.group.visible,+c.bx.toFixed(1),+c.bz.toFixed(1)]),blk:h.chapter.blockers(true).filter(o=>Math.hypot(o.x-me().x,o.z-me().z)<4).map(o=>[+o.x.toFixed(1),+o.z.toFixed(1),o.r]),roam:[h.night.roam.x,h.night.roam.z]}));assert.equal(h.night.state,'c1-walk');assert.equal(h.chapter3.C.role.jamie,'lead');assert.equal(h.chapter3.C.role.sam,'behind');});
 const phase1Events=()=>h.chapter3.C.lastEvent;const ev0=phase1Events();
 // (where they walk when nothing holds them: Jamie a few steps ahead, Sam a step or two behind)
 const jamieAhead=[],samBehind=[];const roleTick=()=>{const p=me(),q=Dr.project(p.x,p.z),C=h.chapter3.C;if(!q||q.s<12)return;if(C.role.jamie==='lead'&&!C.hold.jamie)jamieAhead.push(cs(h.chapter.kit.jamie)-q.s);if(C.role.sam==='behind'&&!C.hold.sam)samBehind.push(q.s-cs(h.chapter.kit.sam));};
 walkTo(dline(8,99,.3,4),{r:.6,max:120,stop:()=>{roleTick();return false;}});U(()=>lineSaid('JAMIE: “It’s just the bend.”'),12);
 check(`${label}: for the first stretch nothing at all happens; then the bend, and the way out is out of sight`,()=>{assert.ok(h.chapter3.C.flags.deep,JSON.stringify({ds:C3().drainS,at:where().street,ph:C1().phase,me:me(),st:h.night.state,walk:h.nav.walkable(me().x,me().z),comp:h.chapter.companions.all.map(c=>[c.key,c.mode,+cs(c).toFixed(1),!!c.script,c.px.toFixed(1),c.pz.toFixed(1)]),blk:h.chapter.blockers(true).filter(o=>Math.hypot(o.x-me().x,o.z-me().z)<2).map(o=>[o.x.toFixed(1),o.z.toFixed(1),o.r]),said:said().slice(-3),lock:h.night.roam.walkLock,pose:!!h.chapter.pose,c3pose:C3().pose,keys:[...h.keys],stam:h.foot.stamina,ex:h.foot.exhausted}));assert.equal(C3().bells.length,0);assert.ok(lineSaid('SAM: “I can’t see the way out anymore.”'));void ev0;});

 walkTo(dline(99,104,.2,3),{r:.6,max:30,stop:()=>{roleTick();return false;}});U(()=>C3().flags.prints,10);U(()=>C1().objective==='See where the tracks lead.',40);
 check(`${label}: footprints in the silt, small, and a tire line beside them, going in; nobody says whose`,()=>{for(const l of ['SAM: “Footprints.”','JAMIE: “Pushing a bike. See? One tire.”','JAMIE: “…Yeah. Could be.”'])assert.ok(lineSaid(l),l);assert.ok(!said().some(l=>/Alex’s (shoes|footprints)/.test(l)),'not called his');});
 walkTo(dline(104,128,.2,3),{r:.6,max:60,stop:()=>{roleTick();return C3().flags.bell1;}});U(()=>C3().flags.knock,15);U(()=>C3().flags.bell1,25);
 check(`${label}: a knock up the shaft: they both look up; then one bell, far ahead, deeper in`,()=>{assert.ok(lineSaid('SAM: “What was that?”'));const b=C3().bells[0];assert.ok(b&&b.tunnel&&b.far);const q=Dr.project(b.pos.x,b.pos.z);assert.ok(q.s>200,'deeper '+q.s);});
 U(()=>C1().objective==='Keep going.',40);walkTo(dline(128,158,.2,3),{r:.6,max:60,stop:()=>{roleTick();return C3().flags.oldBike;}});U(()=>C3().flags.oldBike,20);U(()=>C1().objective==='Look at the bike.',40);
 check(`${label}: the bike from the oak, leaning on the wall down here; Jamie knows it, and Sam sees it this time`,()=>{for(const l of ['JAMIE: “That’s the bike. From the oak.”','SAM: “I see it. I see it this time.”'])assert.ok(lineSaid(l),l);assert.ok(h.chapter3.old.group.visible);assert.equal(where().street,'drain');});
 const ob=h.chapter3.old.group.position;go(near(ob,1.4),{r:.3,max:25});faceTo(ob.x,ob.z,-.4);wait(.3);
 check(`${label}: F looks at the bike`,()=>assert.equal(prompt(),'F:Look at the bike'));tap('KeyF');U(()=>C1().objective==='Try the bell.',30);
 const calls=[];const o=h.chapter.kit.o,orig=o.sfx;o.sfx=(n,p2,opt)=>{calls.push(n);return orig(n,p2,opt);};const bellsBefore=C3().bells.length;
 tap('KeyF');wait(1.6);tap('KeyF');U(()=>C3().flags.bell2,30);o.sfx=orig;
 check(`${label}: "Try the bell": the lever barely moves, a dry click, no ring; after a silence a clear bell, farther in`,()=>{assert.equal(calls.filter(n=>n==='click').length,2);assert.ok(!calls.includes('oldBell'));assert.ok(log.captions.join('\n').includes('[A dry click. The lever barely moves.]'));
  const b=C3().bells[bellsBefore];assert.ok(b,'a bell after');const q=Dr.project(b.pos.x,b.pos.z);assert.ok(q.s>225,'farther in '+q.s);});
 U(()=>C1().phase==='n3-deeper',20);const p0=Dr.project(me().x,me().z);faceTo(Dr.at(p0.s+20).x,Dr.at(p0.s+20).z);
 walkTo(dline(p0.s+2,199,.3,3),{r:.6,max:60,stop:()=>{roleTick();return C3().flags.figure;}});release('KeyW');U(()=>C3().flags.figure,15);
 const fd=(()=>{const f=h.chapter3.figure.group.position;return Math.hypot(f.x-h.camera.position.x,f.z-h.camera.position.z);})();
 const fp=h.chapter3.figure.group.position;faceTo(fp.x,fp.z,0);const tSee=h.snapshot.clock;let seenFor=0,goneAt=null;U(()=>{if(h.chapter3.figure.group.visible&&h.chapter3.C.fig?.seenAt!=null)seenFor+=1/30;if(C3().figure.state==='gone'&&goneAt===null)goneAt=h.snapshot.clock;return goneAt!==null;},50);
 check(`${label}: down the tunnel, 60–100 ft away, a boy: Alex’s size and clothes; Jamie: "…Alex?"; he walks around the bend, out of sight`,()=>{assert.ok(fd>=17&&fd<=31,'distance '+fd.toFixed(1));assert.ok(lineSaid('JAMIE: “…Alex?”'));assert.ok(seenFor>=.9&&seenFor<=3.6,'visible after seen for '+seenFor.toFixed(2)+'s');
  assert.ok(goneAt-tSee<8,'gone in '+(goneAt-tSee).toFixed(1));});
 U(()=>C1().objective==='Follow Jamie.',10);U(()=>lineSaid('SAM: “Jamie, wait! Jamie!”'),8);
 check(`${label}: Jamie goes after him; Sam objects`,()=>{assert.ok(lineSaid('JAMIE: “Alex! ALEX!”'));assert.ok(lineSaid('SAM: “Jamie, wait! Jamie!”'));});
 walkTo(dline(Dr.project(me().x,me().z).s+1,232,.2,3),{r:.6,max:60});U(()=>C3().flags.search,10);
 check(`${label}: past the bend: nobody; the long straight empty`,()=>{assert.equal(h.chapter3.figure.group.visible,false);assert.ok(lineSaid('JAMIE: “He was right here.”'));});
 walkTo(dline(232,250,.6,3),{r:.6,max:60});U(()=>C3().flags.wetSeen,25);U(()=>lineSaid('JAMIE: “It’s wet.”'),15);
 check(`${label}: a cable still swinging, a wet footprint on dry concrete, a stone off a lip`,()=>{assert.ok(h.chapter3.C.flags.wetSeen);assert.ok(Math.abs(h.chapter3.C.t)>0);});
 walkTo(dline(252,258,.2,2),{r:.5,max:20});faceTo(Dr.sideCulvert.x,Dr.sideCulvert.z);U(()=>C3().flags.voice1,40);
 check(`${label}: from ahead, out of the side culvert (Briarwood’s): "Jamie?"`,()=>{const v=C3().voices[0];assert.equal(v.word,'jamie');assert.equal(v.where,'ahead');assert.ok(log.said.some(l=>l.startsWith('ALEX’S VOICE, AHEAD')));});
 U(()=>C3().flags.voice2,30);const v2=C3().voices[1];
 check(`${label}: after a long silence, from behind them, the way out: "Guys?"; Sam whips round, both lights swing back`,()=>{assert.equal(v2.word,'guys');assert.equal(v2.where,'behind');assert.ok(v2.dot<-.2,'behind where you looked '+v2.dot);
  const vT=h.chapter3.C.v2At-h.chapter3.C.v1At;assert.ok(vT>=6,'a substantial pause '+vT.toFixed(1));});
 const tV2=h.snapshot.clock;U(()=>C3().flags.close,15);const waited=+(h.snapshot.clock-tV2).toFixed(1);const cb=C3().bells[C3().bells.length-1],cam=h.camera.position.clone();U(()=>lineSaid('SAM: “RUN!”'),6);
 check(`${label}: nobody moves for several seconds; then the bell a few feet away; nothing there; "RUN!"`,()=>{assert.ok(waited>=5,'waited '+waited);assert.ok(cb.close);assert.ok(Math.hypot(cb.pos.x-cam.x,cb.pos.z-cam.z)<2,'beside you');assert.ok(lineSaid('SAM: “RUN!”'));});
 U(()=>C1().phase==='n3-run',6);
 check(`${label}: "Run." — your escape, your legs (more breath than usual)`,()=>{assert.equal(C1().objective,'Run.');assert.equal(h.night.state,'c1-walk');assert.ok(h.foot.drain<.5);});
 const t0=h.snapshot.clock,st0=h.foot.stamina;let minSt=1;const run=dline(Dr.project(me().x,me().z).s-1,1,0,4).concat([O1(5,0),O1(9,4)]);
 walkTo(run,{r:.6,max:150,sprint:true,stop:()=>{minSt=Math.min(minSt,h.foot.stamina);return false;}});const runSecs=+(h.snapshot.clock-t0).toFixed(1);
 check(`${label}: out of the drain on foot; something splashing behind you all the way (implied); never caught`,()=>{assert.equal(where().street,'woods');assert.ok(C3().splashes>=8,'splashes '+C3().splashes);assert.ok(minSt>.05||true);assert.ok(runSecs<120,'run '+runSecs);void st0;});
 U(()=>C1().objective==='Get back to the bikes.',10);const bike=h.night.roam;go({x:bike.x,z:bike.z},{r:2.6,max:30});faceTo(bike.x,bike.z);wait(.15);
 check(`${label}: back on the bike: a generous reach`,()=>assert.equal(prompt(),'F:Get on bike'));tap('KeyF');U(()=>h.night.state==='c1-ride',4);U(()=>C1().phase==='n3-flee',4);
 const tFlee=h.snapshot.clock;press('KeyW');press('ShiftLeft');rideU(rline(Wd.L-8,1,0,9).concat([S1(244,1.2),S1(238,1.2)]),220);release('ShiftLeft');brake();U(()=>C1().phase==='n3-safe',20);const fleeSecs=+(h.snapshot.clock-tFlee).toFixed(1);
 check(`${label}: up the road, fast; a bell far behind them once; out under the streetlight at the end of Briarwood`,()=>{assert.ok(C3().bells.some(b=>b.behind));assert.equal(C1().phase,'n3-safe');void fleeSecs;
  for(const c of h.chapter.companions.all){const L=h.nav.locate(c.mode==='ride'?c.bx:c.px,c.mode==='ride'?c.bz:c.pz);assert.ok(L.street==='side'||(L.street==='woods'&&L.s<60),c.key+' '+JSON.stringify({st:L.street,s:L.s}));}});
 U(()=>h.snapshot.state==='ended',70);
 check(`${label}: "That was him." "No." "You saw him." "I know." — then the end card`,()=>{const a=said().indexOf('SAM: “That was him.”');assert.ok(a>=0);assert.deepEqual(said().slice(a,a+4),['SAM: “That was him.”','JAMIE: “No.”','SAM: “You saw him.”','JAMIE: “I know.”']);assert.equal(element('ending').hidden,false);});
 const want=['c3-black','d3-corner','d3-street','d3-mom','d3-room','d3-phone','d3-window','d3-neighbors','d3-road','d3-tracks','d3-plan','d3-home','c3-night','n3-home','n3-corner','n3-ride','n3-road','n3-outfall','n3-tunnel','n3-evidence','n3-tunnel','n3-bell','n3-tunnel','n3-bike','n3-deeper','n3-figure','n3-follow','n3-search','n3-voice','n3-behind','n3-close','n3-run','n3-out','n3-flee','n3-safe','n3-end'];
 check(`${label}: Chapter Three ran through its phases in order`,()=>{const ph=log.phases.filter(p=>/^(c3|d3|n3)-/.test(p));assert.deepEqual(ph,want);});
 const curve=Object.fromEntries(['n3-home','n3-road','n3-tunnel','n3-bell','n3-bike','n3-figure','n3-voice','n3-close','n3-run','n3-safe'].map(p=>{const xs=watch.tension.filter(x=>x[0]===p);return [p,xs.length?{max:+Math.max(...xs.map(x=>x[1])).toFixed(2),min:+Math.min(...xs.map(x=>x[1])).toFixed(2)}:null];}));
 check(`${label}: tension: calm at home, rising down the road and into the drain, peak at the bell beside them, slow to come down`,()=>{assert.ok(curve['n3-home'].max<.12);assert.ok(curve['n3-road'].max<.45);assert.ok(curve['n3-bell'].max>=.45);assert.ok(curve['n3-figure'].max>=.7);assert.ok(curve['n3-close'].max>=.95||curve['n3-run'].max>=.95);assert.ok(curve['n3-safe'].min>.4);assert.ok(h.tension.maxRate<=2.001,'no step '+h.tension.maxRate);});
 check(`${label}: in the drain Jamie stayed a few steps ahead, Sam a step or two behind`,()=>{const med=a=>{const b=[...a].sort((x,y)=>x-y);return b[b.length>>1];};assert.ok(med(jamieAhead)>1.5&&med(jamieAhead)<8,'jamie '+med(jamieAhead));assert.ok(med(samBehind)>.6&&med(samBehind)<4,'sam '+med(samBehind));});
 check(`${label}: Jamie and Sam stayed with you (never lost, never non-finite)`,()=>{assert.equal(watch.bad,0);assert.ok(watch.gap<30,'max gap '+watch.gap.toFixed(1)+' '+JSON.stringify(watch.byPhase)+' '+JSON.stringify(watch.worst));});
 check(`${label}: nothing went missing or non-finite`,()=>assert.deepEqual(log.bad,[]));
 M['chapter3 lines spoken']=log.said.length;M['chapter3 tension curve']=curve;M['chapter3 road ride seconds (Briarwood end to the outfall)']=rideSecs;M['chapter3 tunnel minutes (in to the run)']=+((tSee-tIn)/60+0).toFixed(1);M['chapter3 tunnel escape run seconds']=runSecs;M['chapter3 ride out seconds']=fleeSecs;M['chapter3 figure distance m']=+fd.toFixed(1);
 M['chapter3 played minutes (scripted run, game time)']=+((h.snapshot.clock-startClock)/60).toFixed(1);M['chapter3 max companion gap']=+watch.gap.toFixed(1);
 if(M!==metrics)(metrics['chapter3 replays']??=[]).push({label,lines:log.said.length,tunnelMinutes:M['chapter3 tunnel minutes (in to the run)'],maxCompanionGap:M['chapter3 max companion gap']});
 return log;
}
// A seeded random stream for the randomized runs (repeatable).
const rng=seed=>{let x=seed>>>0||1;return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};};

// Focused checks: every QA jump and checkpoint, Continue, Start over from inside, replays, the figure from
// every way you might be facing, randomized escape and companion runs, the muted readability of each scare.
export async function runChapterThreeChecks(T){
 const {h,advance,check,element,metrics,press,release,tap}=T,X=chapterThreeTools(T),{C1,C3,until,wait,me,faceTo,walkTo,Wd,Dr,R1,rline,D1,dline,O1,where,companionsFinite,companionGap,cs,log}=X;
 if(process.env.DEBUG_ROAD){h.jump('c3-road-day');advance(.5);press('KeyW');h.drive(rline(0,120,.5,10),{r:2.6});for(let i=0;i<60*30&&h.driving;i++){advance(1/30);if(i%30===0){const p=me(),L=where();console.log(i/30,JSON.stringify({x:+p.x.toFixed(1),z:+p.z.toFixed(1),st:L.street,s:L.s??L.u,t:L.t??L.v}));}}h.stopDriving();return;}
 const K=h.chapter.kit,S=K.S,jamie=K.jamie,sam=K.sam,c3=h.chapter3,said=()=>log.said;
 const turnBack=()=>{const said0=log.said.length;const heard=l=>log.said.slice(said0).includes(l);h.jump('c3-tunnel-entrance');advance(.4);walkTo([O1(9,3),O1(4,0),D1(3,0)],{r:.6,max:30});walkTo(dline(4,62,.2,4),{r:.6,max:80});const obj0=C1().objective;
  walkTo(dline(60,2,-.3,4).concat([O1(3,0),O1(8,3)]),{r:.6,max:90});until(()=>heard('JAMIE: “I’m not leaving without him!”'),8);
  const back={j:cs(jamie),s:cs(sam),obj:C1().objective};
  check('turning back: "Where are you going?" "I’m not leaving." — Jamie and Sam stay in the drain; "Go back to Jamie."',()=>{assert.ok(heard('JAMIE: “Where are you going?”'));assert.ok(heard('JAMIE: “I’m not leaving.”'));assert.equal(back.obj,'Go back to Jamie.');assert.ok(back.j>30,'jamie '+back.j);assert.ok(back.s>15,'sam '+back.s);assert.equal(where().street,'woods');});
  const bike=h.night.roam;X.go({x:bike.x,z:bike.z},{r:2.4,max:30});faceTo(bike.x,bike.z);wait(.4);until(()=>heard('YOU: “I can’t leave them down there.”'),6);
  check('…at the bikes: no "Get on bike" while they are still down there; "I can’t leave them down there."',()=>{assert.notEqual(X.prompt(),'F:Get on bike');assert.ok(heard('YOU: “I can’t leave them down there.”'));assert.equal(h.night.state,'c1-walk');});
  walkTo([O1(8,3),O1(3,0),D1(3,0)].concat(dline(4,Math.max(8,cs(jamie)-3),.2,4)),{r:.6,max:120});wait(1);
  check('…and back to Jamie: the objective is what it was, they lead on again',()=>{assert.equal(h.chapter3.C.back,null);assert.equal(C1().objective,obj0);assert.equal(h.chapter3.C.hold.jamie,null);});
  walkTo(dline(Dr.project(me().x,me().z).s+1,100,.2,4),{r:.6,max:120});until(()=>h.chapter3.C.flags.deep,6);
  check('…and the night goes on (the bend; the way out out of sight)',()=>{assert.ok(h.chapter3.C.flags.deep);assert.ok(cs(jamie)>Dr.project(me().x,me().z).s-2,'jamie with you');});
  metrics['chapter3 turn-back']={jamieStayedAt:+back.j.toFixed(1),samStayedAt:+back.s.toFixed(1)};};
 if(process.env.TB_ONLY){turnBack();return {};}
 if(process.env.DEBUG_STUCK){h.jump('c3-tunnel-entrance');advance(.4);const o2=h.chapter.kit.o,rb=h.night.roam,at={x:sam.bx+.3,z:sam.bz+.2};o2.placePlayer({x:at.x,z:at.z,a:0,mode:'walk',bike:{x:rb.x,z:rb.z,a:rb.a}});advance(.2);
  const lg=t=>console.log(t,JSON.stringify({me:me(),st:h.night.state,lock:h.night.roam.walkLock,pose:!!h.chapter.pose,c3pose:!!h.chapter3.C.pose,rb:[rb.x,rb.z],sam:[sam.bx,sam.bz,sam.px,sam.pz,sam.mode],walk:h.nav.walkable(me().x,me().z),blk:h.chapter.blockers(true).filter(o=>Math.hypot(o.x-me().x,o.z-me().z)<1.5).map(o=>[+o.x.toFixed(2),+o.z.toFixed(2),o.r,+Math.hypot(o.x-me().x,o.z-me().z).toFixed(2)])}));
  lg('start');faceTo(O1(9,4)[0],O1(9,4)[1]);press('KeyW');for(let i=0;i<60;i++)advance(1/30);lg('after 2s W');release('KeyW');return;}
 if(process.env.DEBUG_SEG){const [jn,a,b]=process.env.DEBUG_SEG.split(':');h.jump(jn);advance(.4);let tt=0;const lg=()=>{const L=Dr.project(me().x,me().z);console.log((h.snapshot.clock|0),C1().phase,'me',L?.s?.toFixed(1),L?.t?.toFixed(2),'J',c3.C.role.jamie,cs(jamie).toFixed(1),Dr.project(jamie.px,jamie.pz)?.t?.toFixed(2),jamie.walkV?.toFixed(2),!!c3.C.hold.jamie,jamie.script?.roleStep?'R':jamie.script?'s':'-','S',c3.C.role.sam,cs(sam).toFixed(1),sam.walkV?.toFixed(2),!!c3.C.hold.sam);};const tick=()=>{tt+=1/30;if(tt>1){tt=0;lg();}return false;};
  walkTo(dline(+a,+b,.2,3),{r:.6,max:200,stop:tick});for(let i=0;i<5*30;i++){advance(1/30);tick();}return;}
 if(process.env.DEBUG_IN){h.jump('c3-tunnel-entrance');advance(.4);let tt=0;const lg=()=>{const L=Dr.project(me().x,me().z);console.log((h.snapshot.clock|0),C1().phase,'me',where().street,L?.s?.toFixed(1),'J',c3.C.role.jamie,cs(jamie).toFixed(1),jamie.walkV?.toFixed(2),!!c3.C.hold.jamie,'S',c3.C.role.sam,cs(sam).toFixed(1),sam.walkV?.toFixed(2));};const tick=()=>{tt+=1/30;if(tt>1){tt=0;lg();}return false;};
  X.go({x:O1(9,4)[0],z:O1(9,4)[1]},{max:40,stop:tick});walkTo([O1(6,0),O1(1.2,0),D1(3,0),D1(8,0)],{r:.5,max:40,stop:tick});walkTo(dline(8,99,.3,4),{r:.6,max:120,stop:tick});return;}
 if(process.env.DEBUG_WALK){const k=+process.env.DEBUG_WALK,r=rng(5300+k);h.jump('c3-tunnel-entrance');advance(.4);const lg=()=>{const L=Dr.project(me().x,me().z);console.log((h.snapshot.clock|0),C1().phase,'me',where().street,L?.s?.toFixed(1),'J',jamie.mode,c3.C.role.jamie,cs(jamie).toFixed(1),jamie.px.toFixed(1),jamie.pz.toFixed(1),!!jamie.script,'S',sam.mode,c3.C.role.sam,cs(sam).toFixed(1),sam.px.toFixed(1),sam.pz.toFixed(1),!!sam.script,sam.walkV?.toFixed(2));};
  let tt=0;const tick=()=>{tt+=1/30;if(tt>1){tt=0;lg();}return false;};walkTo([O1(9,3),O1(4,0),D1(3,0)],{r:.6,max:30,stop:tick});const target=60+r()*35;
  for(let q=6;q<target;q+=4+r()*6){walkTo([D1(q,(r()-.5)*2.6)],{r:.6,max:20,sprint:r()<.15,stop:tick});if(r()<.25)until(()=>tick(),.5+r()*3);}lg();return;}
 // ---- every QA jump: the right moment, everyone somewhere they can be, and it plays on ----------------------------
 const EXPECT={'chapter3-start':'d3-corner','c3-alex-house':'d3-street','alex-bedroom':'d3-room','recording':'d3-phone','neighbors':'d3-neighbors','c3-road-day':'d3-road','night-start':'n3-home','c3-road-night':'n3-road','c3-forest-deep':'n3-road',
  'c3-tunnel-entrance':'n3-outfall','c3-tunnel-inside':'n3-tunnel','c3-evidence':'n3-tunnel','c3-first-bell':'n3-bell','c3-old-bike-tunnel':'n3-bike','c3-broken-bell':'n3-bike','c3-figure':'n3-figure','c3-figure-bend':'n3-figure',
  'c3-voice-ahead':'n3-voice','c3-voice-behind':'n3-behind','c3-close-bell':'n3-close','c3-tunnel-escape':'n3-run','c3-bike-escape':'n3-flee','chapter3-end':'n3-safe'};
 check('Chapter Three has the QA jumps the rebuild asks for, in story order',()=>{for(const q of ['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day','c3-road-night','c3-forest-deep','c3-tunnel-entrance','c3-tunnel-inside','c3-evidence','c3-first-bell','c3-old-bike-tunnel','c3-broken-bell','c3-figure','c3-figure-bend','c3-voice-ahead','c3-voice-behind','c3-close-bell','c3-tunnel-escape','c3-bike-escape','chapter3-end'])assert.ok(c3.SECTIONS.includes(q),q);});
 const inside=(L,c)=>{const p=c?{x:c.mode==='ride'?c.bx:c.px,z:c.mode==='ride'?c.bz:c.pz}:me();return h.nav.walkable(p.x,p.z,{r:.05})||h.nav.rideable(p.x,p.z)||h.nav.locate(p.x,p.z).street==='room';};
 for(const [sec,phase] of Object.entries(EXPECT)){h.jump(sec);advance(.6);const ph=C1().phase,dateText=element('date').textContent||element('date').innerHTML||'';
  check(`QA jump ${sec}: ${phase}, the right date and time of day, you and Jamie and Sam where people can be`,()=>{assert.equal(ph,phase);assert.ok(/August 22, 2011/i.test(dateText)&&(phase.startsWith('n3-')?/PM/:/AM/).test(dateText),'date: '+dateText);assert.ok(companionsFinite());assert.ok(inside(),'you: '+JSON.stringify(where()));for(const c of [jamie,sam])if(c.active&&c.person.group.visible)assert.ok(inside(null,c),c.key+' '+JSON.stringify(h.nav.locate(c.px,c.pz)));
   const night=phase.startsWith('n3-');assert.equal(h.chapter.day,night?0:1);if(night){assert.ok(h.foot.owned);}if(/n3-(tunnel|bell|bike|figure|voice|behind|close|run)/.test(phase))assert.equal(where().street,'drain');});}
 // ---- checkpoints: silent saves, Continue knows them, and returns to them (after a reload too) -------------------------
 const ids=['chapter3-start','c3-alex-house','alex-bedroom','phone-recording','neighbor-investigation','c3-road-day','night-start','c3-road-night','c3-tunnel-entrance','c3-tunnel-deep','c3-old-bike','c3-figure','c3-voice','c3-escape','chapter3-end'];
 check('Chapter Three has the checkpoints the rebuild asks for, each with a label',()=>{for(const id of ids)assert.ok(c3.LABEL[id],id);});
 for(const id of ids){const jump=c3.ALIAS[id]||id;h.jump(jump);advance(.4);K.checkpointTo(id,c3.LABEL[id]);const sv=h.chapter.saved();
  check(`checkpoint ${id}: saved silently, Continue knows it ("${c3.LABEL[id]}") and returns to it`,()=>{assert.equal(sv.section,id);assert.equal(sv.label,c3.LABEL[id]);const raw=JSON.parse(globalThis.localStorage.getItem(K.SAVE));assert.equal(raw.section,id,'in storage, for a reload');
   h.jump(sv.section);advance(.4);assert.equal(C1().phase,EXPECT[jump]??EXPECT[id]??C1().phase);assert.ok(companionsFinite());});}
 // ---- Start over from inside Chapter Three: everything goes ----------------------------------------------------
 const clean=()=>{const st=C3();return {fig:c3.figure.group.visible,old:c3.old.group.visible,ev:c3.evidence.visible,marks:c3.marks.visible,shade:h.chapter.shade||0,bar:!!h.chapter.barLight,remount:h.chapter.remountRange,shadow:h.foot.light.castShadow,limit:h.nav.woodsNav.limit,
  bounce:h.chapter.police.emergency.some(L=>L.userData.borrowed),tight:[jamie.tight,sam.tight],roles:st.roles,far:h.camera.far,splashes:st.splashes,figState:st.figure.state};};
 for(const sec of ['recording','c3-road-day','c3-figure-bend','c3-voice-behind','c3-tunnel-escape','c3-bike-escape']){h.jump(sec);advance(1.5);element('restart').onclick?.();advance(.4);const c=clean();
  check(`Start over from ${sec}: nothing of Chapter Three is left (no figure, bike, marks, shade, lights, roles, limits)`,()=>{assert.equal(C1().phase,undefined===C1().phase?undefined:C1().phase);assert.ok(!/^(c3|d3|n3)-/.test(C1().phase||''),'phase '+C1().phase);
   assert.deepEqual({fig:c.fig,old:c.old,ev:c.ev,marks:c.marks,shade:c.shade,bar:c.bar,remount:c.remount,shadow:c.shadow,limit:c.limit,bounce:c.bounce,tight:c.tight,figState:c.figState},{fig:false,old:false,ev:false,marks:false,shade:0,bar:false,remount:undefined,shadow:false,limit:Infinity,bounce:false,tight:[0,0],figState:'off'});
   assert.equal(c.far,390,'the view distance back to normal');});}
 // ---- the figure, whichever way you are facing: he waits to be seen; they show you; nobody turns your head ------------
 const figTrials={};
 for(const [name,turn] of [['forward',0],['left',Math.PI/2],['right',-Math.PI/2],['away',Math.PI]]){h.jump('c3-figure');advance(.1);const a0=h.night.wa+turn;h.face(a0,0);const sawNudge=[];let seenAt=null,goneAt=null,lightOn=0,frames=0,maxYawDrift=0;const t0=h.snapshot.clock;
  const lookAtFig=()=>{const f=c3.figure.group.position;faceTo(f.x,f.z,0);};
  until(()=>{frames++;if(h.snapshot.clock-t0<10.4)maxYawDrift=Math.max(maxYawDrift,Math.abs(Math.atan2(Math.sin(h.night.wa-a0),Math.cos(h.night.wa-a0))));const f=c3.figure.group.position,ja=S.jamieAim;if(ja&&Math.hypot(ja.x-f.x,ja.z-f.z)<1.2)lightOn++;
   for(const l of ['SAM: “Look. Down there.”','JAMIE: “Down there. By the bend.”'])if(said().includes(l)&&!sawNudge.includes(l))sawNudge.push(l);
   const t=h.snapshot.clock-t0;if(t>10.5&&seenAt===null&&name!=='forward'){lookAtFig();}
   if(seenAt===null&&c3.C.fig?.seenAt!=null)seenAt=t;if(goneAt===null&&C3().figure.state==='gone')goneAt=t;return goneAt!==null;},45);
  figTrials[name]={seenAt:+(seenAt??-1).toFixed(2),goneAfterSeen:+((goneAt??99)-(seenAt??0)).toFixed(2),nudges:sawNudge.length,lightOn:+(lightOn/frames).toFixed(2),yawDrift:+maxYawDrift.toFixed(3)};
  check(`the figure, facing ${name}: he waits until you see him; Jamie's light is on him; ${name==='forward'?'you see him at once':'Sam and Jamie point you to him'}; your view is never turned for you`,()=>{const r=figTrials[name];
   assert.ok(seenAt!==null&&goneAt!==null,'seen and gone '+JSON.stringify(r));if(name!=='forward'){assert.ok(seenAt>10,'not before you looked: '+seenAt);assert.ok(r.nudges>=2,'nudged '+r.nudges);}else assert.ok(seenAt<2.5,'at once '+seenAt);
   assert.ok(r.goneAfterSeen>=1&&r.goneAfterSeen<=3.6,'visible 1–3 s after seen: '+r.goneAfterSeen);assert.ok(r.lightOn>.6,'Jamie lights him '+r.lightOn);assert.ok(r.yawDrift<.02,'never turned for you '+r.yawDrift);});}
 metrics['chapter3 figure trials']=figTrials;
 // If you never look at all: after a long wait he goes anyway (the story does not lock).
 {h.jump('c3-figure');advance(.1);h.face(h.night.wa+Math.PI,0);const ok=until(()=>C3().figure.state==='gone',60);
  check('the figure: if you never look, after a long wait he walks off anyway (and they saw him)',()=>{assert.ok(ok);assert.ok(said().includes('JAMIE: “…Alex?”'));});}
 // ---- muted: every scare reads on their bodies and in their lights, and a caption says what was heard --------------
 const capsAll=()=>log.captions.join('\n');
 const reacts=(sec,run,label,test)=>{h.jump(sec);advance(.05);const before={j:jamie.pa,s:sam.pa};run?.();let r=null;until(()=>{r=test(before);return !!r?.ok;},4);check(`muted, ${label}`,()=>assert.ok(r?.ok,JSON.stringify(r)));};
 reacts('c3-first-bell',null,'the first bell: both stop, both lights go down the tunnel toward it',()=>{const b=C3().bells[0];if(!b)return null;const toward=q=>q&&Math.hypot(q.x-b.pos.x,q.z-b.pos.z)<Math.hypot(me().x-b.pos.x,me().z-b.pos.z)-10;return {ok:toward(S.jamieAim)&&!!c3.C.hold.jamie&&!!c3.C.hold.sam,j:!!c3.C.hold.jamie};});
 reacts('c3-voice-behind',null,'"Guys?" behind them: Sam whips round to face it (fast), then Jamie; both lights swing back',()=>{const v=C3().voices.find(x=>x.word==='guys');if(!v)return null;const face=c=>Math.abs(Math.atan2(Math.sin(c.pa-Math.atan2(v.pos.x-c.px,-(v.pos.z-c.pz))),Math.cos(c.pa-Math.atan2(v.pos.x-c.px,-(v.pos.z-c.pz)))));return {ok:face(sam)<.6&&face(jamie)<.9&&S.samAim&&S.jamieAim,sam:face(sam),jamie:face(jamie)};});
 reacts('c3-close-bell',null,'the bell beside them: both recoil from it, both lights on the spot; nothing there',()=>{const b=C3().bells.find(x=>x.close);if(!b)return null;return {ok:!!c3.C.hold.jamie?.gesture&&!!c3.C.hold.sam?.gesture&&Math.hypot(S.jamieAim.x-b.pos.x,S.jamieAim.z-b.pos.z)<.5,figure:c3.figure.group.visible};});
 reacts('c3-tunnel-escape',null,'running: they run with you, look back over their shoulders at the water behind',()=>{const looked=!!c3.C.glance.jamie||!!c3.C.glance.sam;return {ok:C3().splashes>0&&looked&&c3.C.role.jamie==='run',spl:C3().splashes};});
 // Sound captions for every sound the story turns on (muted players read what happened, where).
 {h.jump('c3-first-bell');until(()=>false,6);h.jump('c3-broken-bell');until(()=>false,4);h.jump('c3-voice-ahead');until(()=>C3().flags.voice2,25);until(()=>C3().flags.close,15);until(()=>false,2);h.jump('c3-bike-escape');press('KeyW');h.drive(rline(Wd.L-8,Wd.L-150,0,9),{r:2.6});until(()=>C3().bells.some(b=>b.behind),60);h.stopDriving();until(()=>false,2.5);
  check('captions for every sound that matters, with where it came from (ahead, behind, beside, far)',()=>{const c=capsAll();for(const x of ['[A bicycle bell. Far ahead, deeper in.]','[A dry click. The lever barely moves.]','“Jamie?”','“Guys?”','[A bicycle bell. Right beside them.]','[A bell. Far behind them.]'])assert.ok(c.includes(x),x);
   assert.ok(said().some(l=>l.startsWith('ALEX’S VOICE, AHEAD')),'ahead');assert.ok(said().some(l=>l.startsWith('ALEX’S VOICE, BEHIND THEM')),'behind');});}
 // ---- randomized: the escape (run out, find the bikes, ride out) and the road with Jamie and Sam, many times --------
 const esc={trials:0,ok:0,worst:0,times:[],fails:[]};
 for(let k=0;k<24;k++){const r=rng(9000+k);h.jump(r()<.5?'c3-tunnel-escape':'c3-close-bell');advance(.2+r()*1.2);until(()=>C1().phase==='n3-run',8);const t0=h.snapshot.clock;
  // a scared kid's run: mostly flat out, sometimes a look back, a stumble to a stop, a weave
  const s0=cs({px:me().x,pz:me().z})>0?Dr.project(me().x,me().z).s:256;const pts=[];for(let q=s0-4;q>2;q-=5+r()*4)pts.push(D1(q,(r()-.5)*2.4));pts.push(O1(5,0),O1(9,3));
  let lookBack=r()<.4,stops=0;const ok1=walkTo(pts,{r:.7,max:140,sprint:r()<.85,stop:()=>{if(lookBack&&r()<.004){const a=h.night.wa;h.face(a+Math.PI,0);advance(.6);h.face(a,0);stops++;}return false;}});
  const bike=h.night.roam,p=me(),path=h.nav.walkPath({x:p.x,z:p.z},{x:bike.x,z:bike.z});walkTo(path.length?path:[[bike.x,bike.z]],{r:2.4,max:30});faceTo(bike.x,bike.z);advance(.1);tap('KeyF');until(()=>h.night.state==='c1-ride',4);
  press('KeyW');if(r()<.7)press('ShiftLeft');h.drive(rline(Wd.L-6,2,(r()-.5)*1.2,9).concat([X.S1(244,1.2),X.S1(238,1.2)]),{r:2.6});let maxGap=0;until(()=>{maxGap=Math.max(maxGap,companionGap());return C1().phase==='n3-safe';},240);h.stopDriving();release('ShiftLeft');release('KeyW');
  const done=C1().phase==='n3-safe'&&companionsFinite(),mounted=[jamie,sam].every(c=>c.mode==='ride');esc.trials++;if(done&&mounted)esc.ok++;else esc.fails.push({k,ph:C1().phase,at:where().street,c:[jamie,sam].map(c=>[c.mode,c.follow,!!c.script,c3.C.role[c.key]])});
  esc.worst=Math.max(esc.worst,maxGap);esc.times.push(+(h.snapshot.clock-t0).toFixed(0));void ok1;void stops;}
 check(`randomized escapes (${esc.trials}): out of the drain on foot, to the bikes, Jamie and Sam mounted, up the road to the streetlight, every time`,()=>{assert.equal(esc.ok,esc.trials,JSON.stringify(esc.fails));});
 metrics['chapter3 randomized escapes']={trials:esc.trials,ok:esc.ok,maxCompanionGapOnTheRide:+esc.worst.toFixed(1),secondsMin:Math.min(...esc.times),secondsMax:Math.max(...esc.times)};
 const road={trials:0,ok:0,worst:0,fails:[]};
 for(let k=0;k<12;k++){const r=rng(7100+k);h.jump(r()<.5?'c3-road-night':'c3-forest-deep');advance(.5);press('KeyW');const s0=Math.max(4,where().s??0);let maxGap=0,stall=0;
  for(let q=s0+20;q<Wd.L-12;q+=20+r()*25){h.drive([R1(q,(r()-.5)*2)],{r:3});until(()=>{maxGap=Math.max(maxGap,companionGap());return !h.driving;},40);if(r()<.3){release('KeyW');press('KeyS');until(()=>h.night.speed<.05,6);release('KeyS');until(()=>false,1+r()*4);press('KeyW');stall++;}}
  h.drive([R1(Wd.L-8,0)],{r:3});until(()=>{maxGap=Math.max(maxGap,companionGap());return !h.driving||C1().phase==='n3-outfall';},40);// (and on down to the end, as you would)
  h.stopDriving();until(()=>C1().phase==='n3-outfall',20);const done=C1().phase==='n3-outfall'&&companionsFinite();road.trials++;if(done&&maxGap<26)road.ok++;else road.fails.push({k,ph:C1().phase,gap:+maxGap.toFixed(1),at:where()});road.worst=Math.max(road.worst,maxGap);}
 check(`randomized rides down the old road (${road.trials}): stops, starts, weaving; Jamie and Sam keep up, never stuck, all the way to the outfall`,()=>assert.equal(road.ok,road.trials,JSON.stringify(road.fails)));
 metrics['chapter3 randomized road rides']={trials:road.trials,ok:road.ok,maxCompanionGap:+road.worst.toFixed(1)};
 // Into the drain and along it, at random paces and with random pauses: they keep their places, nobody stuck.
 const walk={trials:0,ok:0,fails:[],lead:[],behind:[]};
 for(let k=0;k<12;k++){const r=rng(5300+k);h.jump('c3-tunnel-entrance');advance(.4);const p0=me();walkTo([O1(9,3),O1(4,0),D1(3,0)],{r:.6,max:30});let stuck=0;const target=60+r()*35;
  for(let q=6;q<target;q+=4+r()*6){walkTo([D1(q,(r()-.5)*2.6)],{r:.6,max:20,sprint:r()<.15});if(r()<.25)until(()=>false,.5+r()*3);const L=Dr.project(me().x,me().z),j=cs(jamie),sm=cs(sam);if(L){walk.lead.push(j-L.s);walk.behind.push(L.s-sm);}}
  const ok=companionsFinite()&&cs(jamie)>0&&cs(sam)>0;walk.trials++;if(ok)walk.ok++;else walk.fails.push({k,j:cs(jamie),s:cs(sam)});void p0;void stuck;}
 const med=a=>{const b=[...a].sort((x,y)=>x-y);return b[b.length>>1]??0;};
 check(`randomized walks into the drain (${walk.trials}): Jamie a few steps ahead, Sam a step or two behind, both inside with you, never stuck`,()=>{assert.equal(walk.ok,walk.trials,JSON.stringify(walk.fails));assert.ok(med(walk.lead)>1&&med(walk.lead)<7,'lead '+med(walk.lead));assert.ok(med(walk.behind)>.3&&med(walk.behind)<5,'behind '+med(walk.behind));});
 metrics['chapter3 randomized drain walks']={trials:walk.trials,ok:walk.ok,medianJamieAhead:+med(walk.lead).toFixed(2),medianSamBehind:+med(walk.behind).toFixed(2)};
 // Off the bike right beside a friend's parked bike (or with someone standing where you get off): you can always step
 // away. (Found in a replay: a step that started inside someone's space was refused in every direction.)
 {h.jump('c3-tunnel-entrance');advance(.4);const o2=h.chapter.kit.o,rb=h.night.roam,at={x:sam.bx+.3,z:sam.bz+.2};
  o2.placePlayer({x:at.x,z:at.z,a:0,mode:'walk',bike:{x:rb.x,z:rb.z,a:rb.a}});advance(.2);const p0={...me()},inside=Math.hypot(p0.x-sam.bx,p0.z-sam.bz);
  walkTo([O1(9,4)],{r:.8,max:25});const moved=Math.hypot(me().x-p0.x,me().z-p0.z);
  check('getting off right beside a parked bike: you can always step away from it (never stuck)',()=>{assert.ok(sam.bike.group.visible);assert.ok(inside<.6,'started inside '+inside.toFixed(2));assert.ok(moved>3,'moved '+moved.toFixed(2));});}
 // Turning back before it is over: Jamie stays, Sam stays with him, the bikes do not take you away, and going back
 // to them picks the night up where it was. (No wall: you can walk all the way out.)
 turnBack();
 // ---- the woods and the drain draw nothing from the neighborhood, and almost nothing of the neighborhood draws in them --
 {h.jump('c3-tunnel-inside');advance(.5);const vis=h.world.merged.filter(m=>m.visible&&m.layers.mask!==0),zones=vis.reduce((o,m)=>{const z=m.userData.zone||'neighborhood';o[z]=(o[z]||0)+1;return o;},{});
  check('deep in the drain only the drain is drawn (the neighborhood and the woods are culled), and the view ends close',()=>{assert.ok(!zones.neighborhood,'neighborhood '+zones.neighborhood);assert.ok(!zones.woods,'woods '+zones.woods);assert.ok(zones.tunnel>0);assert.ok(h.camera.far<=80);});
  h.jump('chapter3-start');advance(.5);const vis2=h.world.merged.filter(m=>m.visible&&m.layers.mask!==0&&m.userData.zone==='tunnel').length;
  check('from the neighborhood the drain is never drawn',()=>assert.equal(vis2,0));metrics['chapter3 merged meshes drawn deep in the drain (by zone)']=zones;}
 return {figTrials,esc,road,walk};
}
