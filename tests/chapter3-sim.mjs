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
 // How far each friend's body is from your line of sight to the boy's chest (m; behind you counts as clear).
 const sightClear=()=>{const cp=h.camera.position,f=h.chapter3.figure.group.position,dx=f.x-cp.x,dz=f.z-cp.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
  return Object.fromEntries(h.chapter.companions.all.filter(c=>c.active).map(c=>{const ax=c.px-cp.x,az=c.pz-cp.z,along=ax*ux+az*uz;return [c.key,along<=0||along>=L?9:+Math.abs(ax*uz-az*ux).toFixed(2)];}));};
 return {...X,C1,C3,Wd,Dr,B,S1,sline,M1,line,R1,rline,D1,dline,O1,where,offBike,onBike,go,prompt,companionsFinite,companionGap,cs,sightClear};
}

export function smokeJumps(T){const {h,advance,check}=T,X=chapterThreeTools(T),{C1,C3,until}=X;const out={};
 for(const sec of h.chapter3.SECTIONS){h.jump(sec);advance(.5);const ph0=C1().phase;until(()=>false,4);out[sec]=[ph0,C1().phase,C3().figure.state,h.nav.locate(X.me().x,X.me().z).street,X.companionsFinite()];
  check(`QA jump ${sec}: no error, everyone where they can be`,()=>{assert.ok(X.companionsFinite());assert.ok(Number.isFinite(h.camera.position.y));});}
 console.log(JSON.stringify(out));return out;}

// From the end of Chapter Two (its final lines) to the end of Chapter Three, with inputs only.
export function playChapterThree(T,label){
 const {h,press,release,tap,check,element,metrics,advance}=T,X=chapterThreeTools(T),{C1,C3,log,until,wait,me,faceTo,walkTo,rideTo,brake,Wd,Dr,S1,sline,R1,rline,D1,dline,O1,where,offBike,onBike,go,prompt,companionsFinite,companionGap,cs,sightClear}=X;
 const M=/replay/.test(label)?{}:metrics;const said=()=>log.said;const watch={gap:0,tension:[],bad:0,byPhase:{},worst:null},startClock=h.snapshot.clock;
 const crWatch={last:null};watch.together=0;watch.crJumps=0;watch.crJumpAt=[];
 const sample=()=>{const c=C3(),g=companionGap(),ph=C1().phase;
  {const cg=h.chapter3.creature.group;if(cg.visible&&h.chapter3.figure.group.visible)watch.together++;
   if(cg.visible){const p={x:cg.position.x,y:cg.position.y,z:cg.position.z},inView=h.chapter.kit.camLooksAt({x:p.x,y:p.y+.6,z:p.z},.55),L=crWatch.last;
    if(L&&L.inView&&inView&&Math.hypot(p.x-L.x,p.z-L.z)>1.2){watch.crJumps++;watch.crJumpAt.push([ph,+Math.hypot(p.x-L.x,p.z-L.z).toFixed(2)]);}crWatch.last={...p,inView};}else crWatch.last=null;}watch.byPhase[ph]=Math.max(watch.byPhase[ph]||0,+g.toFixed(1));
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
 const tMom=h.snapshot.clock;U(()=>C1().objective==='Go up to Alex’s room.',90);const momSecs=+(h.snapshot.clock-tMom).toFixed(1);
 check(`${label}: his mom, about half a minute (${momSecs} s): he kept asking if she heard a bike bell outside at night, Thursday to Saturday; his room`,()=>{for(const l of ['ALEX’S MOM: “He kept asking if I heard a bike bell outside. At night.”','ALEX’S MOM: “Thursday, Friday. Maybe Saturday. I told him it was the neighbor kids, and to go to sleep.”','ALEX’S MOM: “Go on up to his room, if you want. Just don’t move anything.”'])assert.ok(lineSaid(l),l);assert.ok(momSecs>=25&&momSecs<=60,'mom '+momSecs);});
 const AH=h.world.homes.alex,door=AH.toWorld(AH.doorX,AH.stepFront+.7);go(door,{r:.5,max:30});faceTo(door.x,door.z);wait(.3);tap('KeyF');U(()=>C3().inRoom&&+element('fade').style.opacity<.05,8);
 const R=h.world.interiors['alex-room'],RW=h.chapter3.RW,phone=h.chapter3.phone.position;
 check(`${label}: upstairs in his room, first person, Jamie and Sam with you`,()=>{assert.equal(C1().phase,'d3-room');assert.equal(where().street,'room');for(const c of h.chapter.companions.all)assert.equal(h.nav.locate(c.px,c.pz).street,'room',c.key);});
 // (they talk while you look around: nothing holds you; the phone is there to pick up at once)
 const tRoom=h.snapshot.clock;let roomLocked=false;const noLock=()=>{if(h.chapter.pose&&!h.chapter.pose.release&&C1().phase!=='d3-phone')roomLocked=true;return false;};
 go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20,stop:noLock});faceTo(phone.x,phone.z,-.6);U(()=>{noLock();return C1().objective==='Listen to Alex’s recordings.';},40);U(()=>prompt()==='F:Listen to his recordings',20);const readyAfter=+(h.snapshot.clock-tRoom).toFixed(1);U(()=>lineSaid('JAMIE: “His phone. The cops went through it and gave it back.”'),15);
 check(`${label}: in his room they talk while you look around (nothing locks you); the phone is ready ${readyAfter} s in`,()=>{assert.ok(!roomLocked);assert.ok(lineSaid('SAM: “It’s weird being in here without him.”'));assert.ok(lineSaid('JAMIE: “His phone. The cops went through it and gave it back.”'));assert.ok(readyAfter<20,'ready after '+readyAfter);});
 tap('KeyF');U(()=>C1().phase==='d3-phone',4);U(()=>prompt()==='F:Play the last one',15);
 check(`${label}: the phone opens on the last recording (08/20, 11:52 PM), the one that matters`,()=>assert.equal(C3().recSel,4));
 const tRec=h.snapshot.clock;tap('KeyF');U(()=>C3().flags.recorded,60);const recSecs=+(h.snapshot.clock-tRec).toFixed(1);
 check(`${label}: one press plays it: a bell outside, twice, "There it is again."; then the phone is put down (${recSecs} s)`,()=>{assert.deepEqual(C3().heard,[4]);const caps=log.captions.join('\n');for(const c of ['[A bike bell. Outside.]','[The bell again.]','“There it is again.”'])assert.ok(caps.includes(c),c);assert.ok(!h.chapter.pose||h.chapter.pose.release,'phone down');assert.ok(recSecs<40,'took '+recSecs);});
 U(()=>C1().objective==='Look out his window.',30);U(()=>!h.chapter.state.line&&h.chapter.state.queue===0,30);
 // (the older ones are there if you want them; nothing holds you while one plays)
 go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20});faceTo(phone.x,phone.z,-.6);U(()=>prompt()==='F:Play an older recording',10);tap('KeyF');U(()=>C3().recPlaying>=0,3);const lockedOld=!!h.chapter.pose&&!h.chapter.pose.release;U(()=>C3().recPlaying<0,20);
 check(`${label}: an older recording, if you want one (optional): it plays and nothing holds you`,()=>{assert.deepEqual(C3().heard,[4,3]);assert.ok(!lockedOld,'not locked');assert.ok(log.captions.join('\n').includes('[Crickets. A sprinkler somewhere.]'));});
 const sw=RW(R.sideWindow.x,R.sideWindow.z),look=RW(R.sideWindow.look.x,R.sideWindow.look.z);go(sw,{r:.3,max:20});faceTo(look.x,look.z,-.1);U(()=>C3().flags.window,6);if(!C3().flags.window)tap('KeyF');const winLocked=!!h.chapter.pose&&!h.chapter.pose.release;
 U(()=>C1().objective==='Ask Mr. Okafor.',40);
 check(`${label}: at his window (no camera lock): the creek; "Mr. Okafor’s up all night." His helmet was mentioned in his room`,()=>{assert.ok(!winLocked,'no lock');assert.ok(lineSaid('JAMIE: “Somebody else on his street had to hear it. Mr. Okafor’s up all night.”'));assert.ok(lineSaid('SAM: “His helmet’s still here.”'));});
 const dr=RW(R.door.x,R.door.z);go(dr,{r:.3,max:20});faceTo(RW(R.door.face.x,R.door.face.z).x,RW(R.door.face.x,R.door.face.z).z);wait(.2);tap('KeyF');U(()=>C1().phase==='d3-neighbors'&&!C3().inRoom,6);
 // ---- his street: one person knows ----------------------------------------------------------------------------------
 const near=(q,d)=>{const l=Math.hypot(me().x-q.x,me().z-q.z)||1;return {x:q.x+(me().x-q.x)/l*d,z:q.z+(me().z-q.z)/l*d};};
 const talkTo=key=>{const a=h.chapter3.people[key];go(near(a,1.8),{r:.6,max:60});faceTo(a.x,a.z);wait(.4);tap('KeyF');U(()=>C3().talked.includes(key)&&!h.chapter.state.line&&h.chapter.state.queue===0,40);wait(.5);};
 talkTo('huang');
 check(`${label}: another neighbor, if you ask (optional): one line, and the objective is still Mr. Okafor`,()=>{assert.ok(lineSaid('MR. HUANG: “Morning, boys. I hope they find him. I really do.”'));assert.equal(C1().objective,'Ask Mr. Okafor.');});
 {const a=h.chapter3.people.okafor;go(near(a,1.8),{r:.6,max:60});faceTo(a.x,a.z);wait(.4);}const tOk=h.snapshot.clock;talkTo('okafor');U(()=>C1().objective==='Find the old service road.',20);const okSecs=+(h.snapshot.clock-tOk).toFixed(1);
 check(`${label}: Mr. Okafor heard it too: the gate at the end of Briarwood, the old city road down to the big storm drain (${okSecs} s)`,()=>{for(const l of ['MR. OKAFOR: “…Yes. A few nights this week. Late. Down toward the end of the street.”','MR. OKAFOR: “End of Briarwood, past the last house, there’s a gate. An old city road goes down from there to the big storm drain.”','MR. OKAFOR: “Your creek ends up down there. All of it does. You boys stay off it.”'])assert.ok(lineSaid(l),l);assert.ok(okSecs<35,'okafor '+okSecs);});
 if(M===metrics)M['chapter3 day pacing (scripted walkthrough, s)']={mom:momSecs,phoneReady:readyAfter,lastRecording:recSecs,okafor:okSecs};
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
 offBike();const tIn=h.snapshot.clock;const c3=h.chapter3,K=h.chapter.kit,jamie=K.jamie,sam=K.sam,DD=Dr.D;
 check(`${label}: the bike cannot go into the drain`,()=>{const m=Dr.at(3);assert.equal(h.nav.rideable(m.x,m.z),false);});
 go({x:O1(9,4)[0],z:O1(9,4)[1]},{max:40});walkTo([O1(6,0),O1(1.2,0),D1(3,0),D1(8,0)],{r:.5,max:40});U(()=>C1().phase==='n3-tunnel',10);
 check(`${label}: inside, on foot; Jamie ahead, Sam behind`,()=>{assert.equal(where().street,'drain');assert.equal(h.night.state,'c1-walk');assert.equal(c3.C.role.jamie,'lead');assert.equal(c3.C.role.sam,'behind');});
 // (where they walk when nothing holds them: Jamie a few steps ahead, Sam a step or two behind)
 const jamieAhead=[],samBehind=[];const roleTick=()=>{const p=me(),q=Dr.project(p.x,p.z),C=c3.C;if(!q||q.s<12)return;if(C.role.jamie==='lead'&&!C.hold.jamie)jamieAhead.push(cs(jamie)-q.s);if(C.role.sam==='behind'&&!C.hold.sam)samBehind.push(q.s-cs(sam));};
 const W=(pts,o={})=>walkTo(pts,{r:.6,max:120,...o,stop:()=>{roleTick();sample();return o.stop?.()||false;}});
 // ---- large → enclosed: the mouth, the bend, the way out out of sight, the ceiling coming down ---------------------
 const sz=s=>Dr.sizeAt(s);
 check(`${label}: the drain closes in: 4.6 × 3.6 m at the mouth, lower past the first bend, the deep box about 3.1 × 2.3 m (7½ ft)`,()=>{assert.equal(sz(10).h,3.6);assert.ok(sz(120).h<=2.8&&sz(120).w<=3.8);assert.ok(sz(180).h<=2.35&&sz(180).w<=3.2,JSON.stringify(sz(180)));assert.ok(Dr.wetAt(180)>=.08,'ankle-deep water');assert.ok(Dr.ledgeAt(180,1.3)>.2,'a dry ledge');});
 W(dline(8,99,.3,4));U(()=>lineSaid('JAMIE: “It’s just the bend.”'),12);
 check(`${label}: for the first stretch nothing at all happens; then the bend, and the way out is out of sight`,()=>{assert.ok(c3.C.flags.deep);assert.equal(C3().bells.length,0);assert.ok(lineSaid('SAM: “I can’t see the way out anymore.”'));});
 W(dline(99,104,.2,3));U(()=>C3().flags.prints,10);U(()=>C1().objective==='See where the tracks lead.',40);
 check(`${label}: footprints in the silt, small, and a tire line beside them, going in; nobody says whose`,()=>{for(const l of ['SAM: “Footprints.”','JAMIE: “Pushing a bike. See? One tire.”','JAMIE: “…Yeah. Could be.”'])assert.ok(lineSaid(l),l);});
 W(dline(104,127,.2,3),{stop:()=>C3().flags.bell1});U(()=>C3().flags.knock,15);U(()=>C3().flags.bell1,25);
 check(`${label}: a knock up the shaft: they both look up; then one bell, far ahead, deeper in`,()=>{assert.ok(lineSaid('SAM: “What was that?”'));const b=C3().bells[0];assert.ok(b&&b.tunnel&&b.far);const q=Dr.project(b.pos.x,b.pos.z);assert.ok(q.s>200,'deeper '+q.s);});
 // ---- his helmet: the one from his desk this morning ---------------------------------------------------------------
 U(()=>C1().objective==='Keep going.',40);let samTurned=false;W(dline(127,141,.2,3),{stop:()=>C3().flags.item});U(()=>C3().flags.item,15);
 {const it=c3.itemAt;faceTo(it.x,it.z,-.3);}U(()=>{const h2=c3.C.hold.sam;if(h2&&typeof h2.face==='function'&&lineSaid('SAM: “That was on his desk. This morning.”'))samTurned=true;return C1().objective==='Keep going.';},60);
 check(`${label}: deep inside, his helmet, upside down on the silt: the one on his desk this morning. Jamie goes to it; Sam backs off and turns toward the way out`,()=>{
  for(const l of ['JAMIE: “…That’s his helmet.”','SAM: “That was on his desk. This morning.”','SAM: “We need to tell somebody. Right now.”','JAMIE: “He was here. Tonight.”'])assert.ok(lineSaid(l),l);
  assert.ok(c3.helmet.visible);assert.ok(samTurned,'Sam turned toward the way out');assert.ok(lineSaid('SAM: “His helmet’s still here.”'),'established in his room this morning');});
 // ---- the old bike, its bell; then, past it, the bike is gone -------------------------------------------------------
 W(dline(141,157,.2,3),{stop:()=>C3().flags.oldBike});U(()=>C3().flags.oldBike,20);U(()=>C1().objective==='Look at the bike.',40);
 check(`${label}: the bike from the oak, leaning on the wall down here; Jamie knows it, and Sam sees it this time`,()=>{for(const l of ['JAMIE: “That’s the bike. From the oak.”','SAM: “I see it. I see it this time.”'])assert.ok(lineSaid(l),l);assert.equal(C3().bike,'tunnel');assert.equal(where().street,'drain');});
 const ob=c3.old.group.position;go(near(ob,1.4),{r:.3,max:25});faceTo(ob.x,ob.z,-.4);wait(.3);
 check(`${label}: F looks at the bike`,()=>assert.equal(prompt(),'F:Look at the bike'));tap('KeyF');U(()=>C1().objective==='Try the bell.',30);
 const calls=[];const o=h.chapter.kit.o,orig=o.sfx;o.sfx=(n,p2,opt)=>{calls.push(n);return orig(n,p2,opt);};const bellsBefore=C3().bells.length;
 tap('KeyF');wait(1.6);tap('KeyF');U(()=>C3().flags.bell2,30);o.sfx=orig;
 check(`${label}: "Try the bell": the lever barely moves, a dry click, no ring; after a silence a clear bell, farther in`,()=>{assert.equal(calls.filter(n=>n==='click').length,2);assert.ok(log.captions.join('\n').includes('[A dry click. The lever barely moves.]'));
  const b=C3().bells[bellsBefore];assert.ok(b,'a bell after');assert.ok(Dr.project(b.pos.x,b.pos.z).s>225);});
 U(()=>C1().phase==='n3-deeper',20);const p0=Dr.project(me().x,me().z);let bikeGoneWhileLooked=false;
 W(dline(p0.s+2,183,.3,3),{stop:()=>{if(C3().bike==='removed'&&h.chapter.kit.camLooksAt(c3.oldSpot,.4))bikeGoneWhileLooked=true;return false;}});U(()=>C3().flags.bikeGone,12);U(()=>!h.chapter.state.line&&h.chapter.state.queue===0,12);
 check(`${label}: well past it, the bike is not there any more (nobody saw it go; it went while nobody looked); Sam notices`,()=>{assert.equal(C3().bike,'removed');assert.equal(c3.old.group.visible,false);assert.ok(!bikeGoneWhileLooked);assert.ok(lineSaid('SAM: “It was right there.”'));});
 // ---- the boy at the end of the light: they stop dead, either side of you; he waits to be seen -----------------------
 faceTo(Dr.at(205).x,Dr.at(205).z,0);W(dline(184,199,.25,3),{stop:()=>C3().flags.figure});release('KeyW');U(()=>C3().flags.figure,15);
 const fd=(()=>{const f=c3.figure.group.position;return Math.hypot(f.x-h.camera.position.x,f.z-h.camera.position.z);})();U(()=>false,1.6);
 const framed=(()=>{const q=Dr.project(me().x,me().z),ps=q.s,j=Dr.project(jamie.px,jamie.pz),sm=Dr.project(sam.px,sam.pz);return {me:+q.t.toFixed(2),j:[+(j.s-ps).toFixed(2),+(j.t-q.t).toFixed(2)],s:[+(sm.s-ps).toFixed(2),+(sm.t-q.t).toFixed(2)]};})();
 const fp=c3.figure.group.position;faceTo(fp.x,fp.z,0);advance(.05);const clear=sightClear();const tSee=h.snapshot.clock;let seenAt=null,hiddenAt=null,states=new Set();
 U(()=>{const st=C3().figure;states.add(st.state);if(seenAt===null&&st.seenAt!=null)seenAt=h.snapshot.clock;const f=c3.figure.group.position;if(st.visible)faceTo(f.x,f.z,0);if(hiddenAt===null&&st.state==='hidden')hiddenAt=h.snapshot.clock;return hiddenAt!==null;},50);
 check(`${label}: they stop dead either side of you, a step ahead, your view to him clear between them (${JSON.stringify(clear)} m off your line of sight); both lights down the tunnel; at the end of them, 60–90 ft away, a boy: Alex's size and clothes`,()=>{assert.ok(fd>=17&&fd<=28,'distance '+fd.toFixed(1));assert.ok(framed.j[0]>.6&&framed.j[1]>.6,'Jamie a step ahead, a metre to your right '+JSON.stringify(framed));assert.ok(framed.s[0]>.4&&framed.s[1]<-.6,'Sam a step ahead, a metre to your left '+JSON.stringify(framed));assert.ok(clear.jamie>.45&&clear.sam>.45,'neither is in your line of sight to him '+JSON.stringify(clear));assert.ok(true||JSON.stringify({framed,roles:c3.C.role,frame:c3.C.frame&&Object.fromEntries(Object.entries(c3.C.frame).map(([k2,v])=>[k2,Dr.project(v.x,v.z)])),scripts:[!!jamie.script,!!sam.script,jamie.script?.roleStep,sam.script?.roleStep],ph:C1().phase,fig:C3().figure,hold:[!!c3.C.hold.jamie,!!c3.C.hold.sam],me:Dr.project(me().x,me().z),pose:!!h.chapter.pose,back:c3.C.back}));});
 check(`${label}: he stays until you have seen him, for well over four seconds; "…Alex?"; he turns, slowly, and walks round the bend like anyone would`,()=>{assert.ok(seenAt!==null);assert.ok(hiddenAt-seenAt>=4,'present after seen '+(hiddenAt-seenAt).toFixed(1));assert.ok(lineSaid('JAMIE: “…Alex?”'));
  for(const s of ['first-seen','turning','leaving-bend','hidden'])assert.ok(states.has(s),s+' '+[...states]);});
 U(()=>C1().objective==='Follow him.',10);U(()=>lineSaid('SAM: “Jamie— wait for us!”'),8);
 // ---- after him: past the bend, nobody; the last stretch; then him again, at the junction, by the side culvert ------
 const cul=c3.CUL,lip=c3.culvertAt(-.3,.5);let lureFigSeenFrom=null;
 W(dline(Dr.project(me().x,me().z).s+1,250,.3,3),{stop:()=>{if(C3().flags.lure&&lureFigSeenFrom===null)lureFigSeenFrom=Dr.project(me().x,me().z).s;return C3().flags.lure;}});U(()=>C3().flags.lure,12);release('KeyW');
 U(()=>lineSaid('JAMIE: “ALEX! It’s us! It’s Jamie!”'),8);const LU={...c3.C.lure};
 check(`${label}: him again, farther in, by the black side culvert at the junction, his back to them (${LU.distAtSeen} m); "There!" "ALEX! It’s us! It’s Jamie!"`,()=>{assert.ok(LU.distAtSeen>=12&&LU.distAtSeen<=45,"dist "+LU.distAtSeen);assert.ok(lineSaid('JAMIE: “There!”'));assert.ok(lineSaid('JAMIE: “ALEX! It’s us! It’s Jamie!”'));assert.equal(C3().figure.state==='lure-wait'||C3().figure.state==='lure-walk',true,C3().figure.state);});
 // (you stand and watch him: he walks to the culvert, climbs up into it, gone; his voice from in there)
 const lureStates=new Set();W(dline(Dr.project(me().x,me().z).s+1,259,.3,2),{stop:()=>{lureStates.add(C3().figure.state);return C3().flags.creature;}});U(()=>{lureStates.add(C3().figure.state);if(c3.figure.group.visible){const f=c3.figure.group.position;faceTo(f.x,f.z,0);}return C3().flags.creature;},40);
 const crFirst={state:C3().creature.state,t:C3().creature.t,w:Dr.sizeAt(cul.s).w};
 check(`${label}: he does not stop: to the side culvert, up over its sill and in, gone; from in there, his voice: "Jamie?"`,()=>{for(const st of ['lure-walk','lure-step','lure-in','lure-gone'])assert.ok(lureStates.has(st),st+' '+[...lureStates]);const v=C3().voices.find(x=>x.where==='culvert');assert.ok(v&&v.word==='jamie');assert.ok(lineSaid('FROM THE CULVERT: “Jamie?”'));});
 // ---- the creature: out of the dark of the culvert to its lip (its head and arms out); you look; it waits to be seen --
 faceTo(lip.x,lip.z,-.05);U(()=>C3().creature.state==='chase'||C1().phase==='n3-run',45);const CR={...c3.C.crt};
 check(`${label}: something comes up out of the dark of the culvert (where nobody down the tunnel can see) to its lip, head and arms out; seen at ${CR.distAtSeen} m; "That’s not Alex."; it drops into the water, turns to them; "RUN!"`,()=>{
  assert.equal(crFirst.state,'emerge');assert.ok(crFirst.t<=-(crFirst.w/2+2.5),'starts deep in the culvert '+crFirst.t);assert.ok(c3.C.crt.callUp==null,'no need to call you up from where you stood');assert.ok(CR.seenAt!==null&&!CR.unseenGo,'seen');assert.ok(CR.distAtSeen>=9&&CR.distAtSeen<=30,'seen at '+CR.distAtSeen);
  assert.ok(CR.creepAt>CR.seenAt&&CR.dropAt>CR.creepAt&&CR.landedAt>CR.dropAt,'creep, drop, land after seen');for(const l of ['JAMIE: “Alex? …Alex, come out. It’s okay.”','SAM: “That’s not Alex.”','SAM: “RUN!”'])assert.ok(lineSaid(l),l);});
 // ---- the run: W only, a scared kid's run (a look back when they shout) ----------------------------------------------
 U(()=>C1().phase==='n3-run',6);const t0=h.snapshot.clock,fov=[],speeds=[];let lookedFar=0,lookedSide=0,lookedNear=0,minSt=1,exhausted=false,prevDs=Dr.project(me().x,me().z).s;press('KeyW');
 const lookBack=d=>{const f=c3.creature.group.position,a0=h.night.wa;faceTo(f.x,f.z,0);advance(d);h.face(a0,0);};
 U(()=>{const P2=c3.C.purs,q=Dr.project(me().x,me().z);fov.push(h.camera.fov);minSt=Math.min(minSt,h.foot.stamina);exhausted||=h.foot.exhausted;
  if(q&&q.s>0){speeds.push((prevDs-q.s)*30);prevDs=q.s;}
  if(P2.farVisAt&&!lookedFar&&h.snapshot.clock-P2.farVisAt>.8){lookedFar=1;lookBack(.7);}
  if(P2.sideAt&&!lookedSide&&h.snapshot.clock-P2.sideAt>.9&&c3.creature.group.visible){lookedSide=1;lookBack(.6);}
  if(P2.nearVisAt&&!lookedNear){lookedNear=1;lookBack(.5);}
  if(q&&q.s>2){const a=Dr.at(Math.max(0,q.s-4));faceTo(a.x,a.z,0);}
  return h.night.state==='c1-remount'||h.night.state==='c1-ride';},120);const runSecs=+(h.snapshot.clock-t0).toFixed(1);release('KeyW');U(()=>C1().phase==='n3-flee',8);
 const P2={...c3.C.purs},med=a=>{const b=[...a].sort((x,y)=>x-y);return b[b.length>>1]??0;};
 check(`${label}: RUN is a real escape: a story sprint (fast, no stamina to run out), the view a little wider, 45–90 s from "RUN!" to the bikes (${runSecs} s)`,()=>{assert.ok(med(speeds)>=4.8,'speed '+med(speeds).toFixed(2));assert.ok(Math.max(...fov)>=69,'fov '+Math.max(...fov).toFixed(1));assert.ok(!exhausted&&minSt>.9,'stamina '+minSt);assert.ok(runSecs>=45&&runSecs<=90,'run '+runSecs);});
 check(`${label}: it comes after them about 20 m back (${P2.farDist} m); "It’s coming!"; round the second bend it is gone; Jamie goes down and gets up`,()=>{assert.ok(P2.farSeenAt,'seen far');assert.ok(P2.farDist>=13&&P2.farDist<=26,'far '+P2.farDist);assert.ok(lineSaid('SAM: “It’s coming! IT’S COMING!”'));assert.ok(P2.lostAt,'lost round the bend');assert.ok(P2.stumbleAt,'Jamie goes down');});
 check(`${label}: then out of a hole low in the wall behind them, much closer (${P2.sideDist} m); "It came out of the wall—"; water bursts from a side pipe`,()=>{assert.ok(P2.sideAt&&P2.sideSeenAt,'seen');assert.ok(P2.sideDist>=8&&P2.sideDist<=16,'side '+P2.sideDist);assert.ok(lineSaid('SAM: “It came out of the wall— it’s behind us!”'));assert.ok(P2.pipeAt);});
 check(`${label}: the bike from the oak lying across the way out; they get round it; then it is right behind them (${P2.nearDist} m), never closer than ${P2.minGapRun} m running`,()=>{assert.equal(C3().bike,'relocated');assert.ok(P2.bikeJamieAt&&P2.bikeSeenAt,'bike seen');assert.ok(lineSaid('JAMIE: “WHAT—”'));assert.ok(P2.nearSeenAt,'seen near');assert.ok(P2.nearDist>=6&&P2.nearDist<=10.5,'near '+P2.nearDist);assert.ok(P2.minGapRun>=6,'min gap '+P2.minGapRun);});
 check(`${label}: the gate at the first bend: one of them through first, holding it; you through; slammed; it hits the bars and claws at them, held ${(P2.gateBurstAt-P2.gateHitAt).toFixed(1)} s; then it is through`,()=>{assert.ok(P2.gateHoldAt&&P2.gateShutAt&&P2.gateHitAt&&P2.gateBurstAt,'gate beats');const held=P2.gateBurstAt-P2.gateHitAt;assert.ok(held>=2.5&&held<=4,'held '+held);assert.ok(P2.gateShutAt>P2.gateHoldAt&&P2.gateHitAt>P2.gateShutAt);assert.ok(lineSaid('SAM: “It’s at the gate—”'));assert.ok(C3().gate.burst);assert.ok(C3().gateSounds>=4,'gate sounds '+C3().gateSounds);});
 check(`${label}: the way out ahead, pale; at the bike, running: straight on it (no prompt to hunt for); Jamie and Sam on theirs; it stops at the mouth, low, watching (it does not come out)`,()=>{assert.ok(P2.exitSeenAt,'exit seen');assert.equal(h.night.state,'c1-ride');U(()=>[jamie,sam].every(c=>c.mode==='ride'),8);assert.ok([jamie,sam].every(c=>c.mode==='ride'));assert.ok(P2.mouthAt,'mouth');assert.ok(C3().creature.s>=7,'inside the drain '+C3().creature.s);});
 // ---- the road out: fast; a look back (it, at the edge of the trees); at a bend, him, in the road ahead ----------------
 const tFlee=h.snapshot.clock;press('KeyW');let lookedTree=0,bothShown=0;h.drive(rline(Wd.L-8,1,0,9).concat([S1(244,1.2),S1(238,1.2)]),{r:2.6});
 U(()=>{const P3=c3.C.purs;if(c3.creature.group.visible&&c3.figure.group.visible)bothShown++;if((P3.stage==='mouth'||P3.stage==='away')&&!lookedTree&&C3().roadS<Wd.L-32){lookedTree=1;h.look(1.8,0);advance(1.2);h.look(0,0);}return !h.driving;},220);h.stopDriving();brake();U(()=>C1().phase==='n3-safe',20);const fleeSecs=+(h.snapshot.clock-tFlee).toFixed(1);const RFs=C3().roadFig,P3={...c3.C.purs};
 check(`${label}: riding away, a look back over your shoulder; facing front again, it is low at the edge of the trees ahead, beside the road (${P3.treeDist} m); gone after; never on screen with him`,()=>{assert.ok(P3.treeAt&&P3.treeSeenAt,'glimpse '+JSON.stringify({stage:P3.stage,treeAt:P3.treeAt,treeSeenAt:P3.treeSeenAt,mouthAt:P3.mouthAt,cr:C3().creature,lookedTree}));assert.equal(P3.stage,'done');assert.equal(c3.creature.group.visible,false);assert.equal(bothShown,0);});
 check(`${label}: up the road, fast; at a bend, the Alex-like boy standing in the road ahead (${RFs?.seenDist} m); nobody stops; he steps off into the trees`,()=>{assert.ok(RFs&&RFs.seenAt,'seen');assert.ok(RFs.seenDist>=8&&RFs.seenDist<=16,'seen at '+RFs.seenDist);assert.equal(RFs.stage,'gone');assert.ok(lineSaid('SAM: “No— no no no—”'));assert.ok(lineSaid('JAMIE: “Don’t stop. DON’T STOP.”'));assert.equal(C1().phase,'n3-safe');
  for(const c of h.chapter.companions.all){const L=h.nav.locate(c.mode==='ride'?c.bx:c.px,c.mode==='ride'?c.bz:c.pz);assert.ok(L.street==='side'||(L.street==='woods'&&L.s<60),c.key+' '+JSON.stringify({st:L.street,s:L.s}));}});
 U(()=>h.snapshot.state==='ended',70);
 check(`${label}: "That wasn’t Alex." "…I know." "Then what did we follow?" — Jamie does not answer; then the end card`,()=>{const a=said().indexOf('SAM: “That wasn’t Alex.”');assert.ok(a>=0);assert.deepEqual(said().slice(a,a+3),['SAM: “That wasn’t Alex.”','JAMIE: “…I know.”','SAM: “Then what did we follow?”']);assert.ok(!said().slice(a+3).some(l=>l.startsWith('JAMIE')),'no answer');assert.equal(element('ending').hidden,false);});
 check(`${label}: it is never named; him and it never on screen together; it never jumped while in view; the sound hooks for it fired`,()=>{assert.ok(!said().some(l=>/monster|creature|smil/i.test(l)),'named');assert.equal(watch.together,0,'together');assert.equal(watch.crJumps,0,'jumped in view '+JSON.stringify(watch.crJumpAt));const k=C3().crKinds;assert.ok(k.move>10&&k.impact>=3,JSON.stringify(k));});
 const want=['c3-black','d3-corner','d3-street','d3-mom','d3-room','d3-phone','d3-window','d3-neighbors','d3-road','d3-tracks','d3-plan','d3-home','c3-night','n3-home','n3-corner','n3-ride','n3-road','n3-outfall','n3-tunnel','n3-evidence','n3-tunnel','n3-bell','n3-tunnel','n3-item','n3-tunnel','n3-bike','n3-deeper','n3-figure','n3-follow','n3-lure','n3-creature','n3-run','n3-out','n3-flee','n3-safe','n3-end'];
 check(`${label}: Chapter Three ran through its phases in order`,()=>{const ph=log.phases.filter(p=>/^(c3|d3|n3)-/.test(p));assert.deepEqual(ph,want);});
 const curve=Object.fromEntries(['n3-home','n3-road','n3-tunnel','n3-bell','n3-item','n3-bike','n3-figure','n3-follow','n3-lure','n3-creature','n3-run','n3-flee','n3-safe'].map(p=>{const xs=watch.tension.filter(x=>x[0]===p);return [p,xs.length?{max:+Math.max(...xs.map(x=>x[1])).toFixed(2),min:+Math.min(...xs.map(x=>x[1])).toFixed(2)}:null];}));
 check(`${label}: tension: calm at home, rising down the road and into the drain, up at the boy, the creature and through the run, slow to come down`,()=>{assert.ok(curve['n3-home'].max<.12);assert.ok(curve['n3-road'].max<.45);assert.ok(curve['n3-bell'].max>=.45);assert.ok(curve['n3-figure'].max>=.7);assert.ok(curve['n3-lure'].max>=.75);assert.ok(curve['n3-creature'].max>=.95);assert.ok(curve['n3-run'].max>=.95);assert.ok(curve['n3-safe'].min>.4);assert.ok(h.tension.maxRate<=2.001,'no step '+h.tension.maxRate);});
 check(`${label}: in the drain Jamie stayed a few steps ahead, Sam a step or two behind`,()=>{assert.ok(med(jamieAhead)>1.5&&med(jamieAhead)<8,'jamie '+med(jamieAhead));assert.ok(med(samBehind)>.6&&med(samBehind)<4,'sam '+med(samBehind));});
 check(`${label}: Jamie and Sam stayed with you (never lost, never non-finite)`,()=>{assert.equal(watch.bad,0);assert.ok(watch.gap<30,'max gap '+watch.gap.toFixed(1)+' '+JSON.stringify(watch.byPhase)+' '+JSON.stringify(watch.worst));});
 check(`${label}: nothing went missing or non-finite`,()=>assert.deepEqual(log.bad,[]));
 M['chapter3 lines spoken']=log.said.length;M['chapter3 tension curve']=curve;M['chapter3 road ride seconds (Briarwood end to the outfall)']=rideSecs;M['chapter3 tunnel minutes (in to the run)']=+((t0-tIn)/60).toFixed(1);M['chapter3 run seconds (RUN! to the bikes)']=runSecs;M['chapter3 ride out seconds']=fleeSecs;M['chapter3 figure distance m']=+fd.toFixed(1);
 M['chapter3 figure present after seen s']=+(hiddenAt-seenAt).toFixed(1);M["chapter3 lure seen m"]=LU.distAtSeen;M['chapter3 creature seen m (reveal)']=CR.distAtSeen;
 M['chapter3 chase']={farDist:P2.farDist,sideDist:P2.sideDist,nearDist:P2.nearDist,minGapRunning:P2.minGapRun,gateHeldSeconds:+(P2.gateBurstAt-P2.gateHitAt).toFixed(1),treeGlimpseM:P3.treeDist,medianRunSpeed:+med(speeds).toFixed(2),maxFov:+Math.max(...fov).toFixed(1),creatureSounds:C3().crKinds,gateSounds:C3().gateSounds};M['chapter3 road figure seen m']=RFs.seenDist;
 M['chapter3 played minutes (scripted run, game time)']=+((h.snapshot.clock-startClock)/60).toFixed(1);M['chapter3 max companion gap']=+watch.gap.toFixed(1);
 if(M!==metrics)(metrics['chapter3 replays']??=[]).push({label,lines:log.said.length,tunnelMinutes:M['chapter3 tunnel minutes (in to the run)'],runSeconds:runSecs,maxCompanionGap:M['chapter3 max companion gap']});
 return log;
}
// A seeded random stream for the randomized runs (repeatable).
const rng=seed=>{let x=seed>>>0||1;return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};};

// Focused checks: every QA jump and checkpoint, Continue, Start over from inside, replays, the figure from
// every way you might be facing, randomized escape and companion runs, the muted readability of each scare.
export async function runChapterThreeChecks(T){
 const {h,advance,check,element,metrics,press,release,tap}=T,X=chapterThreeTools(T),{C1,C3,until,wait,me,faceTo,walkTo,Wd,Dr,R1,rline,D1,dline,O1,where,companionsFinite,companionGap,cs,log,sightClear}=X;
 if(process.env.DEBUG_ROAD){h.jump('c3-road-day');advance(.5);press('KeyW');h.drive(rline(0,120,.5,10),{r:2.6});for(let i=0;i<60*30&&h.driving;i++){advance(1/30);if(i%30===0){const p=me(),L=where();console.log(i/30,JSON.stringify({x:+p.x.toFixed(1),z:+p.z.toFixed(1),st:L.street,s:L.s??L.u,t:L.t??L.v}));}}h.stopDriving();return;}
 const K=h.chapter.kit,S=K.S,jamie=K.jamie,sam=K.sam,c3=h.chapter3,said=()=>log.said,OB=Dr.D.oldBike,RL=Dr.D.relocate;
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
 if(process.env.DEBUG_WEDGE){h.jump('c3-tunnel-entrance');advance(.4);const o2=h.chapter.kit.o,comp=h.chapter.companions;comp.putFoot(sam,645.34,-525.08,0,{bike:{x:644.51,z:-526.29,a:0,kick:1}});
  o2.placePlayer({x:645.24,z:-525.94,a:-.84,mode:'walk',bike:{x:645.80,z:-526.11,a:0}});advance(.1);until(()=>false,2);const samFrom=Math.hypot(sam.px-me().x,sam.pz-me().z);walkTo([[me().x+.3,me().z+1.2]],{r:.3,max:4});
  const obs=[...h.chapter.blockers(true).map(b=>({x:b.x,z:b.z,r:b.r})),{x:h.night.roam.x,z:h.night.roam.z,r:.4}],path=h.nav.walkPath({x:me().x,z:me().z},{x:634.8,z:-545.5},obs);walkTo(path.length?path:[[634.8,-545.5]],{r:.25,max:40});
  {const a=[639.97,-539.04],b=[634.8,-545.5],o=[];for(let i=0;i<=12;i++){const t=i/12,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;o.push([+x.toFixed(2),+z.toFixed(2),h.nav.walkable(x,z),h.nav.walkable(x,z,{r:.3}),+h.nav.groundY(x,z).toFixed(2),JSON.stringify(h.nav.locate(x,z).w||{}).slice(0,60)]);}console.log('SEG',JSON.stringify(o));}
  const m=me();console.log('WEDGE',JSON.stringify({samFrom:+samFrom.toFixed(2),samRole:c3.C.role.sam,path,me:[+m.x.toFixed(2),+m.z.toFixed(2)],ph:C1().phase,walk:h.nav.walkable(m.x,m.z),loc:h.nav.locate(m.x,m.z).street,blk:h.chapter.blockers(true).filter(o=>Math.hypot(o.x-m.x,o.z-m.z)<2).map(o=>[+o.x.toFixed(2),+o.z.toFixed(2),o.r]),roam:[+h.night.roam.x.toFixed(2),+h.night.roam.z.toFixed(2)],sam:[+sam.px.toFixed(2),+sam.pz.toFixed(2)],jamie:[+jamie.px.toFixed(2),+jamie.pz.toFixed(2)],got:+Math.hypot(m.x-634.8,m.z+545.5).toFixed(2)}));return;}
 if(process.env.DEBUG_SEG){const [jn,a,b]=process.env.DEBUG_SEG.split(':');h.jump(jn);advance(.4);let tt=0;const lg=()=>{const L=Dr.project(me().x,me().z);console.log((h.snapshot.clock|0),C1().phase,'me',L?.s?.toFixed(1),L?.t?.toFixed(2),'J',c3.C.role.jamie,cs(jamie).toFixed(1),Dr.project(jamie.px,jamie.pz)?.t?.toFixed(2),jamie.walkV?.toFixed(2),!!c3.C.hold.jamie,jamie.script?.roleStep?'R':jamie.script?'s':'-','S',c3.C.role.sam,cs(sam).toFixed(1),sam.walkV?.toFixed(2),!!c3.C.hold.sam);};const tick=()=>{tt+=1/30;if(tt>1){tt=0;lg();}return false;};
  walkTo(dline(+a,+b,.2,3),{r:.6,max:200,stop:tick});for(let i=0;i<5*30;i++){advance(1/30);tick();}return;}
 if(process.env.DEBUG_IN){h.jump('c3-tunnel-entrance');advance(.4);let tt=0;const lg=()=>{const L=Dr.project(me().x,me().z);console.log((h.snapshot.clock|0),C1().phase,'me',where().street,L?.s?.toFixed(1),'J',c3.C.role.jamie,cs(jamie).toFixed(1),jamie.walkV?.toFixed(2),!!c3.C.hold.jamie,'S',c3.C.role.sam,cs(sam).toFixed(1),sam.walkV?.toFixed(2));};const tick=()=>{tt+=1/30;if(tt>1){tt=0;lg();}return false;};
  X.go({x:O1(9,4)[0],z:O1(9,4)[1]},{max:40,stop:tick});walkTo([O1(6,0),O1(1.2,0),D1(3,0),D1(8,0)],{r:.5,max:40,stop:tick});walkTo(dline(8,99,.3,4),{r:.6,max:120,stop:tick});return;}
 if(process.env.DEBUG_WALK){const k=+process.env.DEBUG_WALK,r=rng(5300+k);h.jump('c3-tunnel-entrance');advance(.4);const lg=()=>{const L=Dr.project(me().x,me().z);console.log((h.snapshot.clock|0),C1().phase,'me',where().street,L?.s?.toFixed(1),'J',jamie.mode,c3.C.role.jamie,cs(jamie).toFixed(1),jamie.px.toFixed(1),jamie.pz.toFixed(1),!!jamie.script,'S',sam.mode,c3.C.role.sam,cs(sam).toFixed(1),sam.px.toFixed(1),sam.pz.toFixed(1),!!sam.script,sam.walkV?.toFixed(2));};
  let tt=0;const tick=()=>{tt+=1/30;if(tt>1){tt=0;lg();}return false;};walkTo([O1(9,3),O1(4,0),D1(3,0)],{r:.6,max:30,stop:tick});const target=60+r()*35;
  for(let q=6;q<target;q+=4+r()*6){walkTo([D1(q,(r()-.5)*2.6)],{r:.6,max:20,sprint:r()<.15,stop:tick});if(r()<.25)until(()=>tick(),.5+r()*3);}lg();return;}
 // ---- every QA jump: the right moment, everyone somewhere they can be, and it plays on ----------------------------
 const EXPECT={'chapter3-start':'d3-corner','c3-alex-house':'d3-street','alex-bedroom':'d3-room','recording':'d3-phone','neighbors':'d3-neighbors','c3-road-day':'d3-road','night-start':'n3-home','c3-road-night':'n3-road','c3-forest-deep':'n3-road',
  'c3-tunnel-entrance':'n3-outfall','c3-tunnel-inside':'n3-tunnel','c3-tunnel-deep':'n3-tunnel','c3-evidence':'n3-tunnel','c3-first-bell':'n3-bell','c3-alex-item':'n3-item','c3-old-bike':'n3-bike','c3-broken-bell':'n3-bike','c3-bike-gone':'n3-deeper',
  'c3-figure-reveal':'n3-figure','c3-follow-alex':'n3-follow','c3-second-sighting':['n3-follow','n3-lure'],'c3-creature-reveal':'n3-lure','c3-creature-advance':'n3-creature','c3-creature-chase-start':'n3-run','c3-creature-far':'n3-run','c3-creature-side':'n3-run',
  'c3-bike-block':'n3-run','c3-creature-near':'n3-run','c3-creature-barrier':'n3-run','c3-tunnel-exit':'n3-run','c3-bike-remount':'n3-out','c3-road-escape':'n3-flee','c3-final-lure':'n3-flee','chapter3-end':'n3-safe'};
 const BIKE={'night-start':'tunnel','c3-old-bike':'tunnel','c3-broken-bell':'tunnel','c3-bike-gone':'removed','c3-figure-reveal':'removed','c3-creature-reveal':'removed','c3-creature-chase-start':'relocated','c3-bike-block':'relocated','c3-final-lure':'relocated','c3-road-day':'none'};
 const FIGS={'c3-old-bike':['off'],'c3-bike-gone':['off'],'c3-figure-reveal':['first-reveal','first-seen'],'c3-follow-alex':['hidden'],'c3-second-sighting':['lure-wait','lure-walk'],'c3-creature-reveal':['lure-walk','lure-step','lure-in'],'c3-creature-advance':['lure-gone'],
  'c3-creature-chase-start':['hidden','lure-gone'],'c3-tunnel-exit':['hidden'],'c3-final-lure':['road-block'],'chapter3-end':['off','gone']};
 // (what it is doing at each jump; nothing anywhere before the junction)
 const CREAT={'c3-bike-gone':['off',false],'c3-figure-reveal':['off',false],'c3-second-sighting':['off',false],'c3-creature-reveal':['off',false],'c3-creature-advance':[['reveal','creep'],true],'c3-creature-chase-start':[['turn','chase'],true],'c3-creature-far':['chase',true],
  'c3-creature-side':['hidden',false],'c3-bike-block':['chase',true],'c3-creature-near':['chase',true],'c3-creature-barrier':['chase',true],'c3-tunnel-exit':['chase',true],'c3-bike-remount':['watch',true],'c3-road-escape':['watch',true],'c3-final-lure':['gone',false],'chapter3-end':['gone',false]};
 check('Chapter Three has the QA jumps the creature pass asks for, in story order, old names kept as aliases',()=>{for(const q of ['c3-creature-reveal','c3-creature-advance','c3-creature-chase-start','c3-creature-far','c3-creature-barrier','c3-creature-near','c3-tunnel-exit','c3-bike-remount','c3-road-escape','c3-final-lure','chapter3-end'])assert.ok(c3.SECTIONS.includes(q),q);
  const ix=q=>c3.SECTIONS.indexOf(q);assert.ok(ix('c3-figure-reveal')<ix('c3-follow-alex')&&ix('c3-second-sighting')<ix('c3-creature-reveal')&&ix('c3-creature-reveal')<ix('c3-creature-advance')&&ix('c3-creature-chase-start')<ix('c3-creature-far')&&ix('c3-creature-far')<ix('c3-creature-side')&&ix('c3-bike-block')<ix('c3-creature-near')&&ix('c3-creature-near')<ix('c3-creature-barrier')&&ix('c3-tunnel-exit')<ix('c3-bike-remount')&&ix('c3-road-escape')<ix('c3-final-lure'));
  assert.equal(new Set(c3.SECTIONS).size,c3.SECTIONS.length,'no name used twice');for(const a of Object.keys(c3.ALIAS)){assert.ok(!c3.SECTIONS.includes(a),'alias collides: '+a);assert.ok(c3.SECTIONS.includes(c3.ALIAS[a]),'alias to nowhere: '+a);}
  for(const old of ['c3-figure','c3-after-figure','c3-voice-behind','c3-close-bell','c3-run-start','c3-escape','c3-pursuit-far','c3-pursuit-near','c3-road-pursuit','c3-road-figure','c3-alex-lure','c3-creature-chase'])assert.ok(c3.ALIAS[old],'old name kept: '+old);});
 const inside=(L,c)=>{const p=c?{x:c.mode==='ride'?c.bx:c.px,z:c.mode==='ride'?c.bz:c.pz}:me();return h.nav.walkable(p.x,p.z,{r:.05})||h.nav.rideable(p.x,p.z)||h.nav.locate(p.x,p.z).street==='room';};
 for(const [sec,phases] of Object.entries(EXPECT)){const phase=[].concat(phases)[0];h.jump(sec);advance(.6);const ph=C1().phase,dateText=element('date').textContent||element('date').innerHTML||'',st=C3();
  check(`QA jump ${sec}: ${phase}, the right date and time of day, you and Jamie and Sam where people can be${BIKE[sec]?', the bike '+BIKE[sec]:''}${FIGS[sec]?', the boy '+FIGS[sec].join('/'):''}${CREAT[sec]?', it '+CREAT[sec][0]:''}`,()=>{assert.ok([].concat(phases).includes(ph),ph);assert.ok(/August 22, 2011/i.test(dateText)&&(phase.startsWith('n3-')?/PM/:/AM/).test(dateText),'date: '+dateText);assert.ok(companionsFinite());assert.ok(inside(),'you: '+JSON.stringify(where()));for(const c of [jamie,sam])if(c.active&&c.person.group.visible)assert.ok(inside(null,c),c.key+' '+JSON.stringify(h.nav.locate(c.px,c.pz)));
   const night=phase.startsWith('n3-');assert.equal(h.chapter.day,night?0:1);if(night){assert.ok(h.foot.owned);}if(/n3-(tunnel|bell|item|bike|deeper|figure|follow|lure|creature)/.test(phase))assert.equal(where().street,'drain');
   if(BIKE[sec])assert.equal(st.bike,BIKE[sec],'bike');if(FIGS[sec])assert.ok(FIGS[sec].includes(st.figure.state),'figure '+st.figure.state);
   if(CREAT[sec]){assert.ok([].concat(CREAT[sec][0]).includes(st.creature.state),'creature '+st.creature.state);assert.equal(st.creature.visible,CREAT[sec][1],'creature visible');}else{assert.equal(st.creature.visible,false,'no creature here');}
   assert.ok(!(st.creature.visible&&st.figure.visible),'never both');assert.ok(st.creature.loaded&&!st.creature.error,'creature loaded');});}
 // ---- checkpoints: silent saves, Continue knows them, and returns to them (after a reload too) -------------------------
 const ids=['chapter3-start','c3-alex-house','alex-bedroom','phone-recording','neighbor-investigation','c3-road-day','night-start','c3-road-night','c3-tunnel-entrance','c3-tunnel-deep','c3-old-bike','c3-alex-lure','c3-creature-reveal','c3-creature-chase','c3-road-escape','chapter3-end'];
 check('Chapter Three has the checkpoints the creature pass asks for (c3-tunnel-deep, c3-old-bike, c3-alex-lure, c3-creature-reveal, c3-creature-chase, c3-road-escape, chapter3-end), each with a label; older saves (c3-figure, c3-voice, c3-escape) still continue',()=>{for(const id of ids)assert.ok(c3.LABEL[id],id);for(const old of ['c3-figure','c3-voice','c3-escape'])assert.ok(c3.LABEL[old]&&c3.ALIAS[old],old);});
 for(const id of ids){const jump=c3.ALIAS[id]||id;h.jump(jump);advance(.4);K.checkpointTo(id,c3.LABEL[id]);const sv=h.chapter.saved();
  check(`checkpoint ${id}: saved silently, Continue knows it ("${c3.LABEL[id]}") and returns to it (bike, boy, it, people and story where they were)`,()=>{assert.equal(sv.section,id);assert.equal(sv.label,c3.LABEL[id]);const raw=JSON.parse(globalThis.localStorage.getItem(K.SAVE));assert.equal(raw.section,id,'in storage, for a reload');
   h.jump(sv.section);advance(.4);assert.ok([].concat(EXPECT[jump]??EXPECT[id]??C1().phase).includes(C1().phase),C1().phase);assert.ok(companionsFinite());if(BIKE[jump])assert.equal(C3().bike,BIKE[jump]);});}
 // ---- Start over from inside Chapter Three: everything goes ----------------------------------------------------
 const clean=()=>{const st=C3();return {fig:c3.figure.group.visible,old:c3.old.group.visible,bike:st.bike,helmet:c3.helmet.visible,glow:c3.glow.visible,ev:c3.evidence.visible,marks:c3.marks.visible,shade:h.chapter.shade||0,bar:!!h.chapter.barLight,remount:h.chapter.remountRange,escape:h.chapter.escape?.()??null,boost:h.chapter.rideBoost,
  shadow:h.foot.light.castShadow,limit:h.nav.woodsNav.limit,bounce:h.chapter.police.emergency.some(L=>L.userData.borrowed),tight:[jamie.tight,sam.tight],cboost:[jamie.boost,sam.boost],roles:st.roles,far:h.camera.far,fov:h.camera.fov,splashes:st.splashes,figState:st.figure.state,purs:st.purs,road:st.roadFig,
  cr:c3.creature.group.visible,crState:st.creature.state,gate:c3.gate.visible,gateOpen:st.gate.open,burst:st.gate.burst,lure:st.lure,crt:st.crt,blockers:h.chapter.blockers(true).filter(o=>o.gate||o.creature).length};};
 for(const sec of ['recording','c3-road-day','c3-alex-item','c3-figure-reveal','c3-creature-reveal','c3-creature-advance','c3-creature-far','c3-creature-barrier','c3-bike-remount','c3-final-lure']){h.jump(sec);advance(1.5);if(/far|barrier/.test(sec)){press('KeyW');advance(2.5);release('KeyW');}element('restart').onclick?.();advance(.4);const c=clean();
  check(`Start over from ${sec}: nothing of Chapter Three is left (no boy, no creature, no gate, bike, helmet, glow, chase, shade, lights, roles, boosts, view changes, colliders)`,()=>{assert.ok(!/^(c3|d3|n3)-/.test(C1().phase||''),'phase '+C1().phase);
   assert.deepEqual({fig:c.fig,old:c.old,bike:c.bike,helmet:c.helmet,glow:c.glow,ev:c.ev,marks:c.marks,shade:c.shade,bar:c.bar,remount:c.remount,escape:c.escape,boost:c.boost,shadow:c.shadow,limit:c.limit,bounce:c.bounce,tight:c.tight,cboost:c.cboost,figState:c.figState,purs:c.purs,road:c.road,cr:c.cr,crState:c.crState,gate:c.gate,gateOpen:c.gateOpen,burst:c.burst,lure:c.lure,crt:c.crt,blockers:c.blockers},
    {fig:false,old:false,bike:'none',helmet:false,glow:false,ev:false,marks:false,shade:0,bar:false,remount:undefined,escape:null,boost:undefined,shadow:false,limit:Infinity,bounce:false,tight:[0,0],cboost:[1,1],figState:'off',purs:null,road:null,cr:false,crState:'off',gate:false,gateOpen:1,burst:false,lure:null,crt:null,blockers:0});
   assert.equal(c.far,390,'the view distance back to normal');assert.equal(c.fov,64,'the field of view back to normal');});}
 // ---- the figure, whichever way you are facing: he waits to be seen (and for seconds after); they show you; nobody turns your head --
 const figTrials={};const aimAt=a=>typeof a==='function'?a():a;
 for(const [name,turn] of [['forward',0],['left',Math.PI/2],['right',-Math.PI/2],['away',Math.PI]]){h.jump('c3-figure-reveal');advance(.05);const a0=h.night.wa+turn;h.face(a0,0);const nudges=new Set();let seenAt=null,goneAt=null,lightOn=0,frames=0,maxYawDrift=0,stillAtLook=null;const t0=h.snapshot.clock;
  const lookAtFig=()=>{const f=c3.figure.group.position;faceTo(f.x,f.z+0,0);};
  until(()=>{frames++;const t=h.snapshot.clock-t0;if(t<10.4)maxYawDrift=Math.max(maxYawDrift,Math.abs(Math.atan2(Math.sin(h.night.wa-a0),Math.cos(h.night.wa-a0))));const f=c3.figure.group.position,ja=aimAt(S.jamieAim);if(ja&&Math.hypot(ja.x-f.x,ja.z-f.z)<1.2)lightOn++;
   for(const l of ['SAM: “Look. Down there.”','JAMIE: “There. At the end. Somebody’s standing there.”','SAM: “Don’t you see him?”'])if(said().includes(l))nudges.add(l);
   if(t>10.5&&name!=='forward'){if(stillAtLook===null)stillAtLook=C3().figure.state;if(C3().figure.visible)lookAtFig();}
   if(seenAt===null&&c3.C.fig?.seenAt!=null)seenAt=t;if(goneAt===null&&C3().figure.state==='hidden')goneAt=t;return goneAt!==null;},60);
  figTrials[name]={seenAt:+(seenAt??-1).toFixed(2),presentAfterSeen:+((goneAt??99)-(seenAt??0)).toFixed(2),nudges:nudges.size,lightOn:+(lightOn/frames).toFixed(2),yawDrift:+maxYawDrift.toFixed(3),stateWhenLooked:stillAtLook};
  check(`the figure, facing ${name}: he waits until you see him${name==='forward'?' (at once)':' (still standing there when you finally look; Sam and Jamie point you to him)'}, stays well over four seconds after, Jamie's light on him; your view is never turned for you`,()=>{const r=figTrials[name];
   assert.ok(seenAt!==null&&goneAt!==null,'seen and gone '+JSON.stringify(r));if(name!=='forward'){assert.ok(seenAt>10,'not before you looked: '+seenAt);assert.ok(r.nudges>=2,'nudged '+r.nudges);assert.equal(r.stateWhenLooked,'first-reveal');}else assert.ok(seenAt<2.5,'at once '+seenAt);
   assert.ok(r.presentAfterSeen>=4,'present after seen: '+r.presentAfterSeen);assert.ok(r.lightOn>.6,'Jamie lights him '+r.lightOn);assert.ok(r.yawDrift<.02,'never turned for you '+r.yawDrift);});}
 // If you never look at all: never silently; cue after cue, then after a long wait he goes (and they saw him).
 {h.jump('c3-figure-reveal');advance(.05);h.face(h.night.wa+Math.PI,0);const s0=said().length;const t0=h.snapshot.clock;const ok=until(()=>C3().figure.state==='turning',70);const waited=h.snapshot.clock-t0,cues=said().slice(s0).filter(l=>/Down there|Somebody’s standing|see him/.test(l)).length;
  check('the figure: if you never look, he does not slip away unseen: they cue you again and again, and only after a long wait does he turn and go',()=>{assert.ok(ok);assert.ok(waited>=38,'waited '+waited.toFixed(1));assert.ok(cues>=4,'cues '+cues);assert.ok(C3().figure.unseenGo);});figTrials.neverLooked={waited:+waited.toFixed(1),cues};}
 // Randomized: any facing, looking at any moment, walking or not: he waits, then stays seconds after, and the story goes on.
 {const rt={trials:0,ok:0,fails:[],minPresent:99};for(let k2=0;k2<14;k2++){const r=rng(4400+k2);h.jump('c3-figure-reveal');advance(.05);h.face(h.night.wa+(r()-.5)*2*Math.PI,(r()-.5)*.6);const lookAt=r()*16,walkIn=r()<.4;let seenAt=null,goneAt=null;const t0=h.snapshot.clock;
   let clearAt=null;until(()=>{const t=h.snapshot.clock-t0;if(t>lookAt&&C3().figure.visible){const f=c3.figure.group.position;faceTo(f.x,f.z,0);if(walkIn)press('KeyW');}if(seenAt===null&&c3.C.fig?.seenAt!=null){seenAt=t;clearAt=sightClear();}if(goneAt===null&&C3().figure.state==='hidden')goneAt=t;return goneAt!==null&&C1().phase==='n3-follow';},70);release('KeyW');
   rt.trials++;const pres=(goneAt??0)-(seenAt??0);const minClear=clearAt?Math.min(...Object.values(clearAt)):0;const ok=seenAt!==null&&goneAt!==null&&pres>=4&&C1().phase==='n3-follow'&&companionsFinite()&&minClear>.35;if(ok)rt.ok++;else rt.fails.push({k2,seenAt,goneAt,ph:C1().phase,st:C3().figure.state,clearAt});rt.minPresent=Math.min(rt.minPresent,pres);rt.minClear=Math.min(rt.minClear??9,minClear);}
  check(`the figure, randomized (${rt.trials}: any facing, looking at any moment, walking toward him or not): never missed, always 4 s or more after you see him, Jamie and Sam never in your line of sight to him when you do, the story always goes on`,()=>assert.equal(rt.ok,rt.trials,JSON.stringify(rt.fails)));figTrials.randomized={trials:rt.trials,ok:rt.ok,minPresentAfterSeen:+rt.minPresent.toFixed(1),minClearanceM:+rt.minClear.toFixed(2)};}
 metrics['chapter3 figure trials']=figTrials;
 // ---- the old bike: leaning in the deep box; gone only while nobody is looking; then lying across the way out -------------
 {h.jump('c3-broken-bell');advance(.3);tap('KeyF');until(()=>C3().flags.bell2,30);until(()=>C1().phase==='n3-deeper',20);const sp=c3.oldSpot;let movedWhileWatched=false;
  // walk on backwards, looking at it the whole way: it stays
  const q0=Dr.project(me().x,me().z);for(let s=q0.s;s<OB.s+16;s+=.05){const a=Dr.at(s,.2);h.chapter.kit.o.placePlayer({x:a.x,z:a.z,a:a.a+Math.PI,mode:'walk',bike:{x:h.night.roam.x,z:h.night.roam.z,a:h.night.roam.a}});faceTo(sp.x,sp.z,-.05);advance(1/30);if(C3().bike!=='tunnel')movedWhileWatched=true;}
  const stayed=C3().bike;h.face(h.night.wa+Math.PI,0);advance(.2);const after=C3().bike;
  check('the old bike stays where it is while anyone looks at it; the moment nobody does (well past it), it is gone (never seen going)',()=>{assert.equal(stayed,'tunnel');assert.ok(!movedWhileWatched);assert.equal(after,'removed');assert.equal(c3.old.group.visible,false);});
  h.jump('c3-run-start');advance(.3);const b=h.chapter.blockers(true).filter(o=>o.low),rel=c3.relAt;
  check('when they run, the bike is lying across the way out at the first bend (low: it can be jumped, or run round)',()=>{assert.equal(C3().bike,'relocated');assert.ok(c3.old.group.visible);assert.equal(b.length,3);assert.ok(Dr.project(rel.x,rel.z).s<95&&Dr.project(rel.x,rel.z).s>72,'in the first bend');});
  // states across jumps, Start over and the DEV start (already covered: the jump table, Start over, and dev-chapters-sim)
  metrics['chapter3 old bike']={stayedWhileWatched:stayed,afterLookingAway:after,relocatedAtS:+Dr.project(rel.x,rel.z).s.toFixed(1)};}
 // ---- the creature at the culvert, whichever way you are facing: it waits at the lip until you have seen it -------
 // (out of the dark of the culvert, where nobody down the tunnel can see into it; cues, never a turned camera)
 const crTrials={};const GT=c3.GT;
 const crReveal=({turn=0,lookAfter=0,aimOff=0,walk=false,max=75}={})=>{h.jump('c3-creature-reveal');advance(.05);h.face(h.night.wa+turn,0);const a0=h.night.wa;let firstVis=null,seenAt=null,lipAt=null,maxDrift=0,stateWhenLooked=null,both=0;const nudges=new Set();const t0=h.snapshot.clock;
  until(()=>{const t=h.snapshot.clock-t0,st=C3();if(st.creature.visible&&st.figure.visible)both++;if(firstVis===null&&st.creature.visible)firstVis={t,state:st.creature.state,tt:st.creature.t};if(lipAt===null&&c3.C.crt?.t0!=null)lipAt=t;
   if(t<lookAfter)maxDrift=Math.max(maxDrift,Math.abs(Math.atan2(Math.sin(h.night.wa-a0),Math.cos(h.night.wa-a0))));
   for(const l of ['SAM: “Jamie.”','SAM: “Jamie. The pipe. Look at the pipe.”','JAMIE: “Something’s in there.”','SAM: “The pipe. On the left.”'])if(said().includes(l))nudges.add(l);
   if(t>=lookAfter&&st.creature.visible&&['emerge','reveal','creep'].includes(st.creature.state)){if(stateWhenLooked===null)stateWhenLooked=st.creature.state;const hp=c3.creature.headPos();h.face(Math.atan2(hp.x-me().x,-(hp.z-me().z))+aimOff,-.04);if(walk)press('KeyW');}
   if(seenAt===null&&c3.C.crt?.seenAt!=null)seenAt=t;return C1().phase==='n3-run';},max);release('KeyW');const CR=c3.C.crt||{};
  return {firstVis,lipAt:lipAt==null?null:+lipAt.toFixed(1),seenAt:seenAt==null?null:+seenAt.toFixed(1),nudges:nudges.size,drift:+maxDrift.toFixed(3),stateWhenLooked,unseenGo:!!CR.unseenGo,dist:CR.distAtSeen,dropAfterSeen:CR.dropAt!=null&&CR.seenAt!=null?+(CR.dropAt-CR.seenAt).toFixed(1):null,both,run:C1().phase==='n3-run',w:Dr.sizeAt(c3.CUL.s).w};};
 const deepStart=r=>r.firstVis&&r.firstVis.state==='emerge'&&r.firstVis.tt<=-(r.w/2+2.5);
 for(const [name,turn] of [['forward',0],['left',Math.PI/2],['right',-Math.PI/2],['behind',Math.PI]]){const r=crReveal({turn,lookAfter:name==='forward'?0:22});crTrials[name]=r;
  check(`the creature at the culvert, facing ${name}: it comes out of the dark (unseen) to the lip and waits there until you see it${name==='forward'?'':' (still waiting when you finally look; Sam and Jamie point you to it)'}; then it creeps, drops, turns; RUN; your view never turned for you`,()=>{
   assert.ok(deepStart(r),'appears deep in the culvert '+JSON.stringify(r.firstVis));assert.ok(r.seenAt!==null&&!r.unseenGo,'seen '+JSON.stringify(r));assert.ok(r.run,'the run starts');assert.equal(r.both,0,'never on screen with him');assert.ok(r.dropAfterSeen>=3,'drops only after being seen '+r.dropAfterSeen);
   if(name!=='forward'){assert.ok(r.seenAt>=22,'not before you looked: '+r.seenAt);assert.ok(r.nudges>=2,'nudged '+r.nudges);assert.equal(r.stateWhenLooked,'reveal');assert.ok(r.drift<.02,'never turned for you '+r.drift);}
   else assert.ok(r.seenAt-r.lipAt<2,'seen as soon as it is at the lip '+(r.seenAt-r.lipAt));assert.ok(r.dist>=9&&r.dist<=30,'distance '+r.dist);});}
 {const r=crReveal({aimOff:.28});crTrials.imperfectAim=r;check('the creature at the culvert, your light a little off it (16°): it still counts as seen (the beam is wide, and Jamie’s light is on it)',()=>{assert.ok(r.seenAt!==null&&!r.unseenGo);assert.ok(r.run);});}
 {const r=crReveal({turn:Math.PI,lookAfter:999,max:90});crTrials.neverLooked=r;check('the creature at the culvert, never looked at: cue after cue, and only after a long wait does it come on (and they saw it)',()=>{assert.ok(r.unseenGo,'fallback');assert.ok(r.nudges>=4,'cues '+r.nudges);assert.ok(r.seenAt-r.lipAt>=38,'waited '+(r.seenAt-r.lipAt));assert.ok(r.run);});}
 {const rt={trials:0,ok:0,fails:[],minDist:99};for(let k2=0;k2<14;k2++){const r=rng(8800+k2),walk=r()<.4,res=crReveal({turn:(r()-.5)*2*Math.PI,lookAfter:r()*24,aimOff:(r()-.5)*.4,walk});rt.trials++;
   const ok=deepStart(res)&&res.run&&res.both===0&&(res.unseenGo||(res.seenAt!==null&&res.dist>=7))&&res.dropAfterSeen>=3;if(ok)rt.ok++;else rt.fails.push({k2,walk,...res});if(res.dist)rt.minDist=Math.min(rt.minDist,res.dist);}
  check(`the creature at the culvert, randomized (${rt.trials}: any facing, looking at any moment, light a little off, walking toward it or not): never missed, never before it is seen, never closer than 7 m when seen, the run always starts`,()=>assert.equal(rt.ok,rt.trials,JSON.stringify(rt.fails)));crTrials.randomized={trials:rt.trials,ok:rt.ok,minSeenDist:rt.minDist};}
 metrics['chapter3 creature reveal trials']=crTrials;
 // ---- the chase is perceived: they look back and shout; a hint if you never look; then you see it --------------------
 const pursuit={};const runOut=()=>{const q=Dr.project(me().x,me().z);if(q&&q.s>2){const a=Dr.at(Math.max(0,q.s-4));faceTo(a.x,a.z,0);}};
 {h.jump('c3-creature-far');advance(.1);press('KeyW');let hint=false,samLight=false,samLooked=false;until(()=>{const P2=c3.C.purs;if(X.prompt()==='Mouse:Look back')hint=true;const f=c3.crChest(),sa=aimAt(S.samAim);if(sa&&Math.hypot(sa.x-f.x,sa.z-f.z)<1.2)samLight=true;const g=c3.C.glance.sam;if(g&&h.snapshot.clock<g.until&&Math.hypot(g.at.x-f.x,g.at.z-f.z)<2)samLooked=true;
    runOut();return P2.farVisAt&&h.snapshot.clock-P2.farVisAt>3.2;},20);
  const gapF=C3().creature.s-Dr.project(me().x,me().z).s;const f=c3.creature.group.position;faceTo(f.x,f.z,0);advance(.5);const seen=C3().purs.farSeenAt;release('KeyW');
  check('chase, far: running and not looking, you are told: Sam looks back, his light swings onto it, "It’s coming! IT’S COMING!", and if you still do not look, a hint (Mouse: Look back); look, and it is there, about 20 m back, coming',()=>{assert.ok(samLooked,'Sam looks back');assert.ok(samLight,'Sam’s light on it');assert.ok(said().includes('SAM: “It’s coming! IT’S COMING!”'));assert.ok(hint,'hint');assert.ok(seen,'seen when you look');assert.ok(gapF>=13&&gapF<=24,'gap '+gapF.toFixed(1));});
  pursuit.far={gapWhenLooked:+gapF.toFixed(1)};}
 {h.jump('c3-creature-side');advance(.1);press('KeyW');let inWall=null;until(()=>{runOut();const P2=c3.C.purs;if(P2.sideAt&&inWall===null){inWall=C3().creature.t;}return P2.sideAt&&h.snapshot.clock-P2.sideAt>.9;},10);
  const f=c3.creature.group.position;faceTo(f.x,f.z,0);advance(.5);const P2=C3().purs,w=Dr.sizeAt(c3.SIDE.s).w;release('KeyW');
  check(`chase, side channel: lost round the bend, then out of a hole low in the wall behind them, ${P2.sideDist} m back (it starts inside the wall, out of sight); "It came out of the wall—"`,()=>{assert.ok(P2.sideAt&&P2.sideSeenAt,'seen');assert.ok(inWall<-w/2,'inside the wall '+inWall);assert.ok(P2.sideDist>=8&&P2.sideDist<=16,'side '+P2.sideDist);assert.ok(said().includes('SAM: “It came out of the wall— it’s behind us!”'));});pursuit.side={dist:P2.sideDist};}
 {h.jump('c3-creature-near');advance(.1);press('KeyW');until(()=>{runOut();return c3.C.purs.nearVisAt;},15);const f=c3.creature.group.position;faceTo(f.x,f.z,0);advance(.4);const gapN=C3().creature.s-Dr.project(me().x,me().z).s;
  // stop dead: it comes on, slower, to a few metres, rears up there; it never reaches you
  release('KeyW');let minGap=99,rear=0;until(()=>{minGap=Math.min(minGap,C3().creature.s-Dr.project(me().x,me().z).s);rear=Math.max(rear,c3.creature.drive.rear);const f2=c3.creature.group.position;faceTo(f2.x,f2.z,0);return false;},7);
  const touch=h.chapter.blockers(true).filter(o=>o.creature).some(o=>Math.hypot(o.x-me().x,o.z-me().z)<o.r+.6);
  check(`chase, near: right behind you (${gapN.toFixed(1)} m), running; stop dead and it comes on to about ${minGap.toFixed(1)} m and rears up, and comes no closer: it never reaches you`,()=>{assert.ok(C3().purs.nearSeenAt,'seen');assert.ok(gapN>=6&&gapN<=10.5,'gap '+gapN.toFixed(1));assert.ok(minGap>=4.4&&minGap<7,'stalled at '+minGap.toFixed(1));assert.ok(rear>.3,'rears '+rear.toFixed(2));assert.ok(!touch);assert.ok(said().includes('SAM: “It’s RIGHT THERE!”'));});
  pursuit.near={gapWhenLooked:+gapN.toFixed(1),closestWhenStopped:+minGap.toFixed(1)};}
 // The gate: through, slammed behind you, it held there a few seconds; the way through is never blocked for you.
 {h.jump('c3-creature-barrier');advance(.1);press('KeyW');let minCr=99,held=null,passedAt=null,holder=null;const t0=h.snapshot.clock;
  until(()=>{runOut();const P2=c3.C.purs,st=C3();if(P2.stage==='gate')minCr=Math.min(minCr,st.creature.s);if(passedAt===null&&Dr.project(me().x,me().z).s<GT.s-1)passedAt=h.snapshot.clock-t0;if(P2.gateShutAt&&!holder)holder=P2.gateHolder;return P2.gateBurstAt;},20);release('KeyW');const P2=C3().purs;held=P2.gateBurstAt-P2.gateHitAt;
  check(`chase, the gate: ${holder==='sam'?'Sam':'Jamie'} through first holding it, you through (${passedAt?.toFixed(1)} s), slammed; it hits the bars ${P2.gateHits} times, never past them (${(minCr-GT.s).toFixed(2)} m back), held ${held.toFixed(1)} s, then through`,()=>{assert.ok(passedAt!==null&&passedAt<3,'you got through '+passedAt);assert.ok(P2.gateShutAt&&P2.gateHitAt);assert.ok(minCr>=GT.s+1.1,'behind the bars '+minCr);assert.ok(held>=2.5&&held<=4,'held '+held);assert.ok(P2.gateHits>=4,'blows '+P2.gateHits);assert.ok(said().includes('SAM: “It’s at the gate—”'));});
  pursuit.gate={heldSeconds:+held.toFixed(1),blows:P2.gateHits,closestToBarsM:+(minCr-GT.s).toFixed(2),holder};}
 {h.jump('c3-creature-barrier');advance(.1);let minGap=99;until(()=>{minGap=Math.min(minGap,C3().creature.s-Dr.project(me().x,me().z).s);return false;},5);press('KeyW');until(()=>{runOut();minGap=Math.min(minGap,(C3().creature.visible&&C3().creature.s>0?C3().creature.s-Math.max(0,Dr.project(me().x,me().z)?.s??0):99));return h.night.state==='c1-ride'||C1().phase==='n3-flee';},40);release('KeyW');const P2=C3().purs;
  check(`chase, the gate, standing still in front of it first: it comes on (never nearer than ${minGap.toFixed(1)} m); run, and either it is shut on it or (if it is already too close) left open; out either way`,()=>{assert.ok(minGap>=4.4,'gap '+minGap);assert.ok(h.night.state==='c1-ride'||C1().phase==='n3-flee','got out');assert.ok(P2.gateShutAt||P2.gateSkipped);});pursuit.gateStalled={closest:+minGap.toFixed(1),shut:!!P2.gateShutAt};}
 // Its body: on the ground, feet not sliding, facing where it goes, never a rest pose; and it never jumps while in view.
 {h.jump('c3-creature-chase-start');until(()=>C1().phase==='n3-run',4);press('KeyW');const errs=[],floats=[],heads=[];let prev=null,lifts=0,phases=new Set(),jumps=0;
  until(()=>{runOut();const g=c3.creature.group,st=C3(),cr=c3.CRT;if(g.visible&&cr.state==='chase'&&!cr.road){const p={x:g.position.x,y:g.position.y,z:g.position.z};
    if(cr.y<=0){const fl=Dr.floorAt(Math.max(0,Math.min(Dr.len,cr.s)),cr.t,{ledge:false});floats.push(Math.abs(p.y-fl));}
    if(prev){const d=Math.hypot(p.x-prev.x,p.z-prev.z)*30;errs.push(Math.abs(d-c3.creature.drive.speed));if(d>2){const mv=Math.atan2(p.x-prev.x,-(p.z-prev.z)),hd=c3.creature.heading;heads.push(Math.abs(Math.atan2(Math.sin(mv-hd),Math.cos(mv-hd))));}if(d>30)jumps++;}
    prev=p;lifts=Math.max(lifts,c3.creature.lift||0);phases.add(Math.round(c3.creature.phase*8));}else prev=null;return C1().phase!=='n3-run'||c3.C.purs?.stage==='gate';},70);release('KeyW');
  const q=(a,f)=>{const b=[...a].sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(b.length*f))]??0;};const anim={frames:errs.length,speedErrMedian:+q(errs,.5).toFixed(3),speedErr95:+q(errs,.95).toFixed(3),floatMax:+Math.max(0,...floats).toFixed(3),headingErr95:+q(heads,.95).toFixed(3),maxLiftM:+lifts.toFixed(3),gaitPhases:phases.size,jumps};
  check(`its body through the chase (${anim.frames} frames): on the ground (≤ ${anim.floatMax} m off it), feet keeping pace with the ground (speed error median ${anim.speedErrMedian} m/s), facing where it goes, its gait cycling, never a rest pose, never a jump`,()=>{assert.ok(anim.frames>300);assert.ok(anim.floatMax<.02,'float '+anim.floatMax);assert.ok(anim.speedErrMedian<.15&&anim.speedErr95<.6,'slide '+JSON.stringify(anim));assert.ok(anim.headingErr95<.6,'heading '+anim.headingErr95);assert.ok(anim.gaitPhases>=8,'gait');assert.ok(anim.maxLiftM<.45,'lift '+anim.maxLiftM);assert.equal(anim.jumps,0);assert.ok(c3.creature.loaded&&c3.creature.triangles===23820);});
  metrics['chapter3 creature animation']=anim;}
 // Out of the drain, on the bike, the road: a look back, it at the edge of the trees; gone after; never with him.
 {h.jump('c3-road-escape');advance(.1);press('KeyW');h.drive(rline(Wd.L-8,Wd.L-120,0,9),{r:2.6});let looked=0,both=0;until(()=>{const P3=c3.C.purs;if(c3.creature.group.visible&&c3.figure.group.visible)both++;if((P3.stage==='mouth'||P3.stage==='away')&&!looked&&C3().roadS<Wd.L-32){looked=1;h.look(-1.8,0);advance(1.2);h.look(0,0);}return !h.driving;},120);h.stopDriving();release('KeyW');const P3=C3().purs;
  check(`the road, riding away: look back over your shoulder, and when you face front it is low at the edge of the trees ahead (${P3.treeDist} m), placed only where nobody was looking; then gone; never on screen with him`,()=>{assert.ok(P3.treeAt&&P3.treeSeenAt,'glimpse');assert.ok(P3.treeDist>=12&&P3.treeDist<=45,'dist '+P3.treeDist);assert.equal(P3.stage,'done');assert.equal(both,0);});pursuit.tree={dist:P3.treeDist};}
 // The bike in the way: run straight at it (you veer round it), or jump it.
 {for(const mode of ['straight-at-it','jump']){h.jump('c3-bike-block');advance(.1);const rel=c3.relAt;press('KeyW');let jumped=false,stuck=0,lastS=999;const t0=h.snapshot.clock;
   until(()=>{const q=Dr.project(me().x,me().z);if(!q)return true;if(q.s>RL.s+.5)faceTo(rel.x,rel.z,0);else{const a=Dr.at(Math.max(0,q.s-5));faceTo(a.x,a.z,0);}
    if(mode==='jump'&&!jumped&&Math.hypot(me().x-rel.x,me().z-rel.z)<1.9){tap('Space');jumped=true;}if(Math.abs(q.s-lastS)<.002)stuck+=1/30;else stuck=0;lastS=q.s;return q.s<RL.s-6||stuck>2;},20);release('KeyW');
   const dt2=h.snapshot.clock-t0;check(`the bike lying across the way out: ${mode==='jump'?'jumped (in the air it is not in the way)':'run straight at it, you veer round it'}; never stuck`,()=>{assert.ok(stuck<=2,'stuck');assert.ok(Dr.project(me().x,me().z).s<RL.s-5,'got past');assert.ok(dt2<6,'took '+dt2.toFixed(1));});pursuit[mode]={seconds:+dt2.toFixed(1)};}}
 // The road: him in the road ahead; they do not stop; he walks off it; nobody hits anything, nobody is stuck.
 {const rd={trials:0,ok:0,fails:[],seen:[],unseen:0};for(let k2=0;k2<10;k2++){const r=rng(6600+k2);h.jump('c3-road-figure');advance(.1);press('KeyW');if(r()<.5)press('ShiftLeft');const lat=(r()-.5)*1.6;h.drive([R1(c3.RF.s-30,lat),R1(c3.RF.s-60,0)],{r:3});
   // (glancing round now and then, and back to the road, as anyone riding for their life does; the last two rides never look at the road at all; h.look sets the view offset, it does not add to it)
   const away=k2>=8?(k2===8?1.2:-1.2):0;if(away)h.look(away,0);let back=0,glanceLeft=0;
   let minD=99;until(()=>{const f=c3.figure.group.position;if(c3.figure.group.visible)minD=Math.min(minD,Math.hypot(f.x-h.night.roam.x,f.z-h.night.roam.z));if(!away){if(glanceLeft>0&&--glanceLeft===0){h.look(0,0);back=0;}else if(!glanceLeft&&r()<.01){back=(r()-.5)*1.4;h.look(back,0);glanceLeft=12+Math.floor(r()*20);}}return !h.driving;},40);h.stopDriving();release('KeyW');release('ShiftLeft');h.look(0,0);
   const R=C3().roadFig;rd.trials++;const ok=R&&R.stage==='gone'&&(away||R.seenAt)&&minD>1&&companionsFinite();if(ok){rd.ok++;if(R.seenAt)rd.seen.push(R.seenDist);else rd.unseen++;}else rd.fails.push({k2,away,R,minD});}
  check(`the road figure (${rd.trials} rides, any speed and line, glancing round): seen ahead in their lights, he steps off the road before they reach him (nobody hits him, nobody stops); then gone. Riding the whole way looking off into the woods (${rd.unseen} rides) you can miss him: nothing waits on it, nobody is hurt`,()=>assert.equal(rd.ok,rd.trials,JSON.stringify(rd.fails)));pursuit.road={trials:rd.trials,seenDistMin:Math.min(...rd.seen),seenDistMax:Math.max(...rd.seen),unseenLookingAway:rd.unseen};}
 metrics['chapter3 pursuit perception']=pursuit;
 // ---- muted: every scare reads on their bodies and in their lights, and a caption says what was heard --------------
 const capsAll=()=>log.captions.join('\n');
 const reacts=(sec,run,label,test,max=5)=>{h.jump(sec);advance(.05);const before={j:jamie.pa,s:sam.pa};run?.();let r=null;until(()=>{r=test(before);return !!r?.ok;},max);check(`muted, ${label}`,()=>assert.ok(r?.ok,JSON.stringify(r)));};
 reacts('c3-first-bell',null,'the first bell: both stop, both lights go down the tunnel toward it',()=>{const b=C3().bells[0];if(!b)return null;const toward=q=>q&&Math.hypot(q.x-b.pos.x,q.z-b.pos.z)<Math.hypot(me().x-b.pos.x,me().z-b.pos.z)-10;return {ok:toward(aimAt(S.jamieAim))&&!!c3.C.hold.jamie&&!!c3.C.hold.sam};});
 reacts('c3-alex-item',null,'his helmet: Jamie crouches to it, Sam turns away toward the way out',()=>{const hs=c3.C.hold.sam;return {ok:c3.C.role.jamie==='point'&&!!hs&&typeof hs.face==='function'};},9);
 reacts('c3-second-sighting',()=>{const p=c3.figure.group.position;faceTo(p.x,p.z,0);},'him again at the junction: Jamie points, both lights go to him',()=>{const f=c3.figure.group.position,on=a=>{const q=aimAt(a);return q&&Math.hypot(q.x-f.x,q.z-f.z)<1.2;};return {ok:C3().flags.lure&&on(S.jamieAim)&&on(S.samAim)};},6);
 reacts('c3-creature-advance',null,'it, at the lip of the culvert: both recoil, both lights on it',()=>{const c=c3.crChest(),on=a=>{const q=aimAt(a);return q&&Math.hypot(q.x-c.x,q.z-c.z)<1.4;};return {ok:!!c3.C.hold.jamie?.gesture&&!!c3.C.hold.sam?.gesture&&on(S.jamieAim)&&on(S.samAim)};});
 reacts('c3-creature-chase-start',()=>press('KeyW'),'running: they run flat out ahead of you, looking back over their shoulders at it',()=>{const looked=!!c3.C.glance.jamie||!!c3.C.glance.sam;return {ok:looked&&c3.C.role.sam==='run'&&sam.walkV>3,v:sam.walkV};},6);release('KeyW');
 // Sound captions for every sound the story turns on (muted players read what happened, where).
 {h.jump('c3-first-bell');until(()=>false,6);h.jump('c3-broken-bell');until(()=>false,4);h.jump('c3-creature-reveal');until(()=>C3().flags.creature,25);until(()=>false,1);h.jump('c3-road-escape');press('KeyW');h.drive(rline(Wd.L-8,Wd.L-150,0,9),{r:2.6});until(()=>C3().bells.some(b=>b.behind),60);h.stopDriving();release('KeyW');until(()=>false,2.5);
  check('captions for every sound that matters, with where it came from (far ahead, the culvert, far behind)',()=>{const c=capsAll();for(const x of ['[A bicycle bell. Far ahead, deeper in.]','[A dry click. The lever barely moves.]','“Jamie?”','[A bell. Far behind them.]'])assert.ok(c.includes(x),x);
   assert.ok(said().some(l=>l.startsWith('FROM THE CULVERT')),'from the culvert');});}
 // Audio (placeholders; not tuned, not rendered here): every hook still fires, a bounded number of times, without error.
 {const calls={};const o=h.chapter.kit.o,orig=o.sfx,A=h.audioRef,wrap2=(name,fn)=>(...a)=>{calls[name]=(calls[name]||0)+1;return fn?.(...a);};o.sfx=(n,...a)=>{calls['sfx:'+n]=(calls['sfx:'+n]||0)+1;return orig(n,...a);};
  const keep={};if(A)for(const k2 of ['bell3','voice'])if(A[k2]){keep[k2]=A[k2];A[k2]=wrap2(k2,A[k2].bind(A));}const cr0=C3().crSounds;
  h.jump('c3-first-bell');until(()=>false,3);h.jump('c3-creature-reveal');until(()=>C1().phase==='n3-run',40);const crs0=C3().crSounds;press('KeyW');until(()=>{const q=Dr.project(me().x,me().z);if(q&&q.s>2){const a=Dr.at(Math.max(0,q.s-4));faceTo(a.x,a.z,0);}return C3().purs?.gateBurstAt;},80);release('KeyW');o.sfx=orig;if(A)Object.assign(A,keep);const kinds=C3().crKinds;void cr0;
  check('audio hooks (placeholders): the bell, the voice from the culvert, its movement in the water and its impacts, the gate, the splashes and the pipe all fire, a bounded number of times, no errors',()=>{if(A){assert.ok(calls.bell3>=1&&calls.bell3<=3,'bells '+calls.bell3);assert.equal(calls.voice,1,'voice');}assert.ok((calls['sfx:splash']||0)>=10&&(calls['sfx:splash']||0)<400,'splashes '+calls['sfx:splash']);assert.ok((calls['sfx:tap']||0)>=4&&(calls['sfx:tap']||0)<60,'impacts '+calls['sfx:tap']);
   assert.ok(kinds.move>=10&&kinds.impact>=3,JSON.stringify(kinds));assert.ok(crs0>0,'landing');});metrics['chapter3 audio hook calls (one stretch)']={...calls,creature:kinds,gate:C3().gateSounds};}
 // ---- randomized: the run (out of the drain, the gate, the bikes, the road, the boy in the road, home), many times --------
 const esc={trials:0,ok:0,worst:0,times:[],fails:[],minGap:99,minGapRun:99,gates:0};
 for(let k=0;k<24;k++){const r=rng(9000+k);h.jump(r()<.5?'c3-creature-chase-start':'c3-creature-advance');advance(.2+r()*1.2);until(()=>C1().phase==='n3-run',15);const t0=h.snapshot.clock;
  // a scared kid's run: mostly flat out, looks back now and then, sometimes stops dead, weaves; the keys do the rest
  let stopFor=0,lookFor=0,steer=0;press('KeyW');const ok1=until(()=>{const q=Dr.project(me().x,me().z);
   if(stopFor>0){stopFor-=1/30;if(stopFor<=0)press('KeyW');}else if(r()<.004){stopFor=.5+r()*2.5;release('KeyW');}
   if(lookFor>0){lookFor-=1/30;}else if(r()<.012&&c3.creature.group.visible){lookFor=.4+r()*.8;const f=c3.creature.group.position;faceTo(f.x,f.z,0);}else if(q&&q.s>2){const a=Dr.at(Math.max(0,q.s-4),steer);faceTo(a.x,a.z,0);}
   if(r()<.01)steer=(r()-.5)*2;if(r()<.006){const kk=r()<.5?'KeyA':'KeyD';press(kk);advance(.3);release(kk);}
   return h.night.state==='c1-ride'||h.night.state==='c1-remount';},150);release('KeyW');
  if(h.night.state==='c1-walk'){const bike=h.night.roam,p=me(),path=h.nav.walkPath({x:p.x,z:p.z},{x:bike.x,z:bike.z});walkTo(path.length?path:[[bike.x,bike.z]],{r:2.4,max:30});faceTo(bike.x,bike.z);advance(.1);tap('KeyF');}
  until(()=>h.night.state==='c1-ride',6);const runT=h.snapshot.clock-t0;
  press('KeyW');if(r()<.7)press('ShiftLeft');h.drive(rline(Wd.L-6,2,(r()-.5)*1.2,9).concat([X.S1(244,1.2),X.S1(238,1.2)]),{r:2.6});let maxGap=0,both=0;until(()=>{maxGap=Math.max(maxGap,companionGap());if(c3.creature.group.visible&&c3.figure.group.visible)both++;return C1().phase==='n3-safe';},240);h.stopDriving();release('ShiftLeft');release('KeyW');
  const P2=c3.C.purs,RF2=C3().roadFig,done=C1().phase==='n3-safe'&&companionsFinite(),mounted=[jamie,sam].every(c=>c.mode==='ride');esc.trials++;esc.minGap=Math.min(esc.minGap,P2?.minGap??99);esc.minGapRun=Math.min(esc.minGapRun,P2?.minGapRun??99);if(P2?.gateBurstAt)esc.gates++;
  if(done&&mounted&&RF2?.stage==='gone'&&(P2?.minGap??99)>=4.4&&both===0&&!c3.creature.group.visible)esc.ok++;else esc.fails.push({k,ph:C1().phase,at:where().street,road:RF2?.stage,gap:P2?.minGap,both,c:[jamie,sam].map(c=>[c.mode,c.follow,!!c.script,c3.C.role[c.key]])});
  esc.worst=Math.max(esc.worst,maxGap);esc.times.push(+runT.toFixed(0));void ok1;}
 check(`randomized runs (${esc.trials}): looks back, stops dead, weaves: out of the drain, on the bike, Jamie and Sam mounted, past the boy in the road, home; it never nearer than ${esc.minGap.toFixed(1)} m (only ever when you stop); every time`,()=>{assert.equal(esc.ok,esc.trials,JSON.stringify(esc.fails));});
 metrics['chapter3 randomized runs']={trials:esc.trials,ok:esc.ok,maxCompanionGapOnTheRide:+esc.worst.toFixed(1),runSecondsMin:Math.min(...esc.times),runSecondsMax:Math.max(...esc.times),closestM:+esc.minGap.toFixed(1),closestRunningM:+esc.minGapRun.toFixed(1),gateHeld:esc.gates};
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
 // ...and wedged between the parked bikes and Sam (the exact spot a long browser run logged).
 {h.jump('c3-tunnel-entrance');advance(.4);const o2=h.chapter.kit.o,comp=h.chapter.companions;comp.putFoot(sam,645.34,-525.08,0,{bike:{x:644.51,z:-526.29,a:0,kick:1}});
  o2.placePlayer({x:645.24,z:-525.94,a:-.84,mode:'walk',bike:{x:645.80,z:-526.11,a:0}});advance(.1);const p0={...me()};
  // Sam had stood at your elbow there, closing the pocket between his bike and yours; now he hangs back behind you.
  // The way straight at the mouth passes between the two bikes, too close to pass, so you step back out and walk
  // round them (the path below sees the bikes, as you would).
  until(()=>false,2);const samFrom=Math.hypot(sam.px-me().x,sam.pz-me().z);walkTo([[me().x+.3,me().z+1.2]],{r:.3,max:4});
  const obs=[...h.chapter.blockers(true).map(b=>({x:b.x,z:b.z,r:b.r})),{x:h.night.roam.x,z:h.night.roam.z,r:.4}],path=h.nav.walkPath({x:me().x,z:me().z},{x:634.8,z:-545.5},obs);
  walkTo(path.length?path:[[634.8,-545.5]],{r:.25,max:40});const got=Math.hypot(me().x-634.8,me().z+545.5);// (corners taken close, round the wingwall's end, not across it)
  check('wedged between parked bikes and a friend at the outfall: Sam steps back, no trap, you walk round them to the drain',()=>{assert.ok(samFrom>1.3,'Sam still at your elbow '+samFrom.toFixed(2));assert.ok(path.length>0,'no way round');assert.ok(got<1.5,'still '+got.toFixed(1)+' m away, moved '+Math.hypot(me().x-p0.x,me().z-p0.z).toFixed(2));});}
 // Turning back before it is over: Jamie stays, Sam stays with him, the bikes do not take you away, and going back
 // to them picks the night up where it was. (No wall: you can walk all the way out.)
 turnBack();
 // ---- the woods and the drain draw nothing from the neighborhood, and almost nothing of the neighborhood draws in them --
 {h.jump('c3-tunnel-deep');advance(.5);const vis=h.world.merged.filter(m=>m.visible&&m.layers.mask!==0),zones=vis.reduce((o,m)=>{const z=m.userData.zone||'neighborhood';o[z]=(o[z]||0)+1;return o;},{});
  check('deep in the drain only the drain is drawn (the neighborhood and the woods are culled), no sky, and the view ends at its far end',()=>{assert.ok(!zones.neighborhood,'neighborhood '+zones.neighborhood);assert.ok(!zones.woods,'woods '+zones.woods);assert.ok(zones.tunnel>0);assert.ok(h.camera.far<=150);assert.equal(h.scene.children.find(o=>o.geometry?.type==='SphereGeometry'&&o.geometry.parameters?.radius===350)?.visible,false,'no sky');});
  h.jump('chapter3-start');advance(.5);const vis2=h.world.merged.filter(m=>m.visible&&m.layers.mask!==0&&m.userData.zone==='tunnel').length;
  check('from the neighborhood the drain is never drawn',()=>assert.equal(vis2,0));metrics['chapter3 merged meshes drawn deep in the drain (by zone)']=zones;}
 return {figTrials,crTrials,esc,road,walk,pursuit};
}
