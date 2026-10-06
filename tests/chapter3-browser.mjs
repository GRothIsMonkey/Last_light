// Chapter Three in a real browser (Chromium, WebGL, Web Audio), rebuilt: played on from the end of
// Chapter Two the way a player would (riding, walking with W and the heading, F where the prompt says,
// running), with the sound OFF the whole way (the muted playtest), and a rendered capture at each beat:
// the day at the end of Briarwood, the old road at night, the outfall, the drain, the figure, the voices,
// the run, the ride out, the streetlight. Then every Chapter Three QA jump, Continue, the captions measured
// with the real frame readback (now also in the dark of the drain), the captions setting, and offline
// renders of the sounds Chapter Three uses (signal checks; nobody listened). Captures go to the QA folder.

// Page-side helpers (run inside the page).
async function installHelpers(){const L=lastLight,Wd=L.world.woods,Dr=L.world.drain,B=L.world.sideFrames[0],{groundPoint}=await import('./route.js');
 window.__c3={said:[],last:'',phases:[],caps:[],tension:[],gap:0,gapAt:null,
  watch(){const s=L.state,c=s.chapter;if(c.line&&c.line!==this.last){this.last=c.line;this.said.push((c.speaker||'')+': '+c.line);}if(this.phases[this.phases.length-1]!==c.phase)this.phases.push(c.phase);
   if(s.caption&&this.caps[this.caps.length-1]!==s.caption)this.caps.push(s.caption);
   if(/^n3-/.test(c.phase))this.tension.push(s.tension.value);
   if(/^(d3-(street|mom|room|phone|window|neighbors|road|tracks|plan)|n3-(corner|ride|road|outfall|tunnel|evidence|bell|item|bike|deeper|figure|follow|search|cross|voice|behind|close|flee|safe))$/.test(c.phase)){const m=this.me();for(const k of L.chapter.companions.all){if(!k.active)continue;const d=Math.hypot((k.mode==='ride'?k.bx:k.px)-m.x,(k.mode==='ride'?k.bz:k.pz)-m.z);if(d>this.gap){this.gap=d;this.gapAt=c.phase;}}}},
  until(fn,max){for(let t=0;t<max;t+=1/30){L.step(1/30);this.watch();if(fn())return true;}return false;},
  me(){const s=L.state;return s.state==='c1-walk'?s.walk:s.roam;},
  face(x,z,p=0){const m=this.me();L.face(Math.atan2(x-m.x,-(z-m.z)),p);},
  walk(pts,{r=.6,max=90,stop=null,sprint=false}={}){let i=0;const ok=this.until(()=>{if(stop?.())return true;const m=this.me();while(i<pts.length&&Math.hypot(pts[i][0]-m.x,pts[i][1]-m.z)<r)i++;if(i>=pts.length)return true;this.face(pts[i][0],pts[i][1]);L.press('KeyW');if(sprint)L.press('ShiftLeft');return false;},max);L.release('KeyW');L.release('ShiftLeft');return ok;},
  go(q,o={}){const to={x:q.x??q[0],z:q.z??q[1]},m=this.me(),obs=o.round&&L.state.state==='c1-walk'?[...(L.chapter.blockers?.(true)||[]).map(b=>({x:b.x,z:b.z,r:b.r})),{x:L.roam.x,z:L.roam.z,r:.4}]:[],path=L.nav.walkPath({x:m.x,z:m.z},to,obs),pts=path.length?path:[[to.x,to.z]];return this.walk(pts,o);},// (round: round people and parked bikes too, as you would)
  ride(pts,max=150){L.drive(pts,{r:2.6});const ok=this.until(()=>!L.driving,max);L.stopDriving();return ok;},
  brake(){L.release('KeyW');L.press('KeyS');this.until(()=>L.state.speed<.05,8);L.release('KeyS');},
  offBike(){if(L.state.state==='c1-ride'){this.brake();L.key('KeyF');this.until(()=>L.state.state==='c1-walk',4);this.until(()=>false,.3);}},
  onBike(){if(L.state.state==='c1-walk'){const r=L.roam,m=this.me(),path=L.nav.walkPath({x:m.x,z:m.z},{x:r.x,z:r.z});this.walk(path.length?path:[[r.x,r.z]],{r:1.2,max:40});this.face(r.x,r.z);this.until(()=>false,.2);L.key('KeyF');this.until(()=>L.state.state==='c1-ride',4);}},
  near(q,d){const m=this.me(),l=Math.hypot(m.x-q.x,m.z-q.z)||1;return {x:q.x+(m.x-q.x)/l*d,z:q.z+(m.z-q.z)/l*d};},
  S(u,v){const p=B.point(u,v);return [p.x,p.z];},sl(u0,u1,v,st=12){const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(this.S(u0+(u1-u0)*i/n,v));return o;},
  R(s,t=0){const p=Wd.at(s,t);return [p.x,p.z];},rl(s0,s1,t=0,st=9){const o=[];const n=Math.ceil(Math.abs(s1-s0)/st);for(let i=1;i<=n;i++)o.push(this.R(s0+(s1-s0)*i/n,t));return o;},
  D(s,t=0){const p=Dr.at(s,t);return [p.x,p.z];},dl(s0,s1,t=0,st=3){const o=[];const n=Math.ceil(Math.abs(s1-s0)/st);for(let i=1;i<=n;i++)o.push(this.D(s0+(s1-s0)*i/n,t));return o;},
  O(a,b){const p=Wd.fromA(a,b);return [p.x,p.z];},ds(){const m=this.me(),q=Dr.project(m.x,m.z);return q?q.s:-1;},
  // (running out: W, looking the way out; the story's escape carries you, as it does a player holding W)
  run(stop,max=30){return this.until(()=>{const m=this.me(),q=Dr.project(m.x,m.z);if(q&&q.s>2){const a=Dr.at(Math.max(0,q.s-4));L.face(Math.atan2(a.x-m.x,-(a.z-m.z)),0);}L.press('KeyW');if(this.fov)this.fov.push(L.camera.fov);return stop();},max);},
  M(d,l){const p=groundPoint(d,l);return [p.x,p.z];},prompt(){return L.state.prompt;},C1(){return L.state.chapter;},C3(){return L.state.chapter3;}};}

// (every Chapter Three QA jump, in story order; each held 1.5 s, so a moment that moves on by itself may be in its next phase)
const SECTIONS=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day','night-start','c3-road-night','c3-forest-deep','c3-tunnel-entrance','c3-tunnel-inside',
 'c3-tunnel-deep','c3-evidence','c3-first-bell','c3-alex-item','c3-old-bike','c3-broken-bell','c3-bike-gone','c3-figure-reveal','c3-after-figure','c3-figure-crossing','c3-voice-ahead','c3-voice-behind','c3-close-bell',
 'c3-run-start','c3-pursuit-far','c3-bike-block','c3-pursuit-near','c3-tunnel-exit','c3-bike-remount','c3-road-pursuit','c3-road-figure','chapter3-end'];
const EXPECT={'chapter3-start':'d3-corner','c3-alex-house':'d3-street','alex-bedroom':'d3-room','recording':'d3-phone','neighbors':'d3-neighbors','c3-road-day':['d3-road','d3-tracks'],'night-start':'n3-home','c3-road-night':'n3-road','c3-forest-deep':'n3-road',
 'c3-tunnel-entrance':'n3-outfall','c3-tunnel-inside':'n3-tunnel','c3-tunnel-deep':'n3-tunnel','c3-evidence':['n3-tunnel','n3-evidence'],'c3-first-bell':['n3-bell','n3-tunnel'],'c3-alex-item':'n3-item','c3-old-bike':'n3-bike','c3-broken-bell':'n3-bike','c3-bike-gone':'n3-deeper',
 'c3-figure-reveal':'n3-figure','c3-after-figure':['n3-follow','n3-search'],'c3-figure-crossing':['n3-cross','n3-voice'],'c3-voice-ahead':['n3-voice','n3-behind'],'c3-voice-behind':['n3-behind','n3-close'],'c3-close-bell':['n3-close','n3-run'],
 'c3-run-start':'n3-run','c3-pursuit-far':'n3-run','c3-bike-block':'n3-run','c3-pursuit-near':'n3-run','c3-tunnel-exit':'n3-run','c3-bike-remount':['n3-out','n3-flee'],'c3-road-pursuit':'n3-flee','c3-road-figure':'n3-flee','chapter3-end':'n3-safe'};
const ORDER=['c3-black','d3-corner','d3-street','d3-mom','d3-room','d3-phone','d3-window','d3-neighbors','d3-road','d3-tracks','d3-plan','d3-home','c3-night','n3-home','n3-corner','n3-ride','n3-road','n3-outfall','n3-tunnel','n3-evidence','n3-tunnel','n3-bell','n3-tunnel','n3-item','n3-tunnel','n3-bike','n3-deeper','n3-figure','n3-follow','n3-search','n3-cross','n3-voice','n3-behind','n3-close','n3-run','n3-out','n3-flee','n3-safe','n3-end'];

// The harness steps the game without drawing between captures; in play every frame is drawn and measured.
// So before a capture the caption tone is given what play would have given it: a few drawn frames of the
// current view, measured and fed to the tone (the story does not move meanwhile).
const settled=(page,snap)=>async(name,o)=>{await page.evaluate(()=>new Promise(res=>{const L=lastLight;let i=0;const f=()=>{L.render();L.captionTone.update(.15,{fade:L.state.fade||0});if(++i<12)requestAnimationFrame(f);else res();};requestAnimationFrame(f);}));return snap(name,o);};

// The continuous playthrough, from wherever Chapter Two handed over (c3-black) to the end card, sound off.
export async function runChapterThreeBrowser({page,snap:rawSnap,check,state,errors,tag='c3'}){
 const snap=settled(page,rawSnap);
 const ev=(fn,arg)=>page.evaluate(fn,arg),c1=async()=>(await state()).chapter,c3=async()=>(await state()).chapter3,settle=ms=>page.waitForTimeout(ms);
 await ev(installHelpers);const said=l=>ev(l=>__c3.said.includes(l),l);
 // The muted playtest: the sound is off for the whole chapter.
 if(await page.locator('#sound').getAttribute('aria-pressed')==='true')await page.keyboard.press('KeyM');// (M, as a player mutes; the button is under the game while playing)
 check('Chapter Three browser walkthrough: sound off (the muted playtest)',await page.locator('#sound').getAttribute('aria-pressed')==='false');
 // ---- the hand-over: black, CHAPTER THREE, the same corner a few minutes later ----------------------------------
 await ev(()=>__c3.until(()=>document.getElementById('chapter-card').classList.contains('on'),20));await settle(1800);
 await snap(tag+'-00-chapter-three-card');
 check('Chapter Three: black, then a quiet CHAPTER THREE card (no end menu)',await page.locator('#chapter-card.on').isVisible()&&!(await page.locator('#ending').isVisible())&&(await page.locator('#chapter-card h2').textContent())==='Chapter Three');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.line==='“If Alex heard it before he left…”',60));await ev(()=>__c3.until(()=>lastLight.state.fade<.02,6));await settle(400);
 await snap(tag+'-d01-briarwood-opening');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Talk to Alex’s mom.',60));
 check('Chapter Three: the Briarwood corner in daylight; "Maybe yesterday wasn’t the first time."',(await state()).day===1&&await said('JAMIE: “Maybe yesterday wasn’t the first time.”'));
 // ---- Alex's house, his mom, his room, the phone, the window ------------------------------------------------------
 await ev(()=>{const C=__c3;C.onBike();lastLight.press('KeyW');C.ride([C.S(10,1.6),...C.sl(10,118,1.6)],120);C.brake();C.until(()=>lastLight.state.chapter3.flags.atHouse,10);const AH=lastLight.world.homes.alex,d=AH.toWorld(AH.doorX,AH.stepFront);C.face(d.x,d.z,.05);C.until(()=>false,.4);});
 await snap(tag+'-d02-alex-house-exterior');
 await ev(()=>{const C=__c3,mp=lastLight.chapter.mom.pos;C.offBike();C.go(C.near(mp,1.6),{r:.5,max:30,stop:()=>lastLight.state.chapter3.flags.momTalk});C.face(mp.x,mp.z);C.until(()=>false,.4);if(!lastLight.state.chapter3.flags.momTalk)lastLight.key('KeyF');C.until(()=>lastLight.state.chapter.line==='“He kept asking if I heard a bike bell outside. At night.”',60);});
 await snap(tag+'-d03-alex-mom');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Go up to Alex’s room.',90);const AH=L.world.homes.alex,d=AH.toWorld(AH.doorX,AH.stepFront+.7);C.go(d,{r:.5,max:30});C.face(d.x,d.z);C.until(()=>false,.3);L.key('KeyF');C.until(()=>L.state.chapter3.inRoom&&L.state.fade<.03,10);C.until(()=>false,1);});
 await snap(tag+'-d04-bedroom-first-person');
 await ev(()=>{const C=__c3,L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW,ph=L.chapter3.phone.position;C.go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20});const hp=RW(R.helmet.x,R.helmet.z,R.helmet.y);C.face(hp.x,hp.z,-.62);C.until(()=>__c3.said.includes('SAM: “His helmet’s still here.”'),40);C.until(()=>false,1.2);});
 await snap(tag+'-d05-his-helmet-on-the-desk');
 await ev(()=>{const C=__c3,L=lastLight,ph=L.chapter3.phone.position;C.face(ph.x,ph.z,-.6);C.until(()=>L.state.chapter.objective==='Listen to Alex’s recordings.',40);C.until(()=>false,.3);L.key('KeyF');C.until(()=>L.state.chapter.phase==='d3-phone',4);C.until(()=>false,1.4);
  for(let i=0;i<5;i++){C.until(()=>/^F:(Play|Next recording)$/.test(L.state.prompt),40);L.key('KeyF');C.until(()=>L.state.chapter3.recPlaying<0&&!L.state.chapter.line,45);C.until(()=>false,.6);}});
 await ev(()=>{const C=__c3,L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW,sw=RW(R.sideWindow.x,R.sideWindow.z),lk=RW(R.sideWindow.look.x,R.sideWindow.look.z);C.until(()=>L.state.chapter.objective==='Look out his window.',60);C.go(sw,{r:.3,max:20});C.face(lk.x,lk.z,-.1);C.until(()=>L.state.chapter3.flags.window,6);if(!L.state.chapter3.flags.window)L.key('KeyF');C.until(()=>false,2.5);});
 await snap(tag+'-d06-window-to-the-creek');
 await ev(()=>{const C=__c3,L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW;C.until(()=>L.state.chapter.objective==='Ask the neighbors.',50);C.until(()=>false,1.5);const d=RW(R.door.x,R.door.z),f=RW(R.door.face.x,R.door.face.z);C.go(d,{r:.3,max:20});C.face(f.x,f.z);C.until(()=>false,.2);L.key('KeyF');C.until(()=>L.state.chapter.phase==='d3-neighbors'&&!L.state.chapter3.inRoom,6);});
 const talkTo=async(key,shot)=>{await ev(key=>{const C=__c3,L=lastLight,a=L.chapter3.people[key];C.go(C.near(a,1.8),{r:.6,max:60});C.face(a.x,a.z);C.until(()=>false,.4);L.key('KeyF');C.until(()=>!!L.state.chapter.line,4);C.until(()=>false,1.2);},key);
  if(shot)await snap(shot);await ev(key=>__c3.until(()=>lastLight.state.chapter3.talked.includes(key)&&!lastLight.state.chapter.line,40),key);};
 await talkTo('huang');await talkTo('delaney');await talkTo('okafor',tag+'-d07-mr-okafor');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Find the old service road.',60));
 check('Chapter Three: Mr. Okafor: the old city road at the end of Briarwood, down to the storm drain in the woods',await said('MR. OKAFOR: “End of Briarwood, past the last house. There’s a gate. An old city road goes down from there.”'));
 // ---- the end of Briarwood by day: posts, the gate, signs, the track going in; the road bends into the woods -------
 await ev(()=>{const C=__c3,L=lastLight;C.onBike();C.until(()=>L.chapter.companions.all.filter(c=>c.active).every(c=>c.mode==='ride'),10);/* (a calm day: you let them get back on their bikes before riding off; riding off at once they are briefly 30 m back while they do) */L.press('KeyW');const u=L.nav.locate(C.me().x,C.me().z).u||130;C.ride(C.sl(Math.max(30,u)+4,240,1.2,10),120);C.until(()=>L.state.chapter3.flags.roadDay,15);C.brake();C.face(...C.R(14,0),0);C.until(()=>false,.5);});
 await snap(tag+'-d08-end-of-briarwood-gate');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Go through the gate.',20);L.press('KeyW');C.ride([C.R(4,.4),C.R(12,.6),C.R(18,.4)],40);C.brake();C.until(()=>L.state.chapter3.flags.tracks,20);const q=L.world.woods.at(30,L.world.woods.halfW(30)-.45);C.face(q.x,q.z,-.32);C.until(()=>false,1.5);});
 await snap(tag+'-d09-tire-track-in-the-dust');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='See where the tracks lead.',30);L.press('KeyW');C.ride(C.rl(18,104,.5,10),60);C.brake();C.face(...C.R(135,0),0);C.until(()=>false,.8);});
 await snap(tag+'-d10-the-road-into-the-woods');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Go home.',120);});
 check('Chapter Three: where the road bends into the woods: back tonight; Sam reluctant',await said('JAMIE: “We have to come back tonight.”')&&await said('SAM: “…If anything happens, we leave. Right away. I’m serious.”')&&(await c3()).oldBike===false);
 // ---- that night --------------------------------------------------------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;L.press('KeyW');const s=L.nav.locate(C.me().x,C.me().z).s||100;C.ride(C.rl(s,2,0,10).concat([C.S(240,1.2),C.S(220,1.2)]),80);C.until(()=>L.state.chapter.phase==='n3-home',60);L.release('KeyW');C.until(()=>L.state.fade<.05,10);C.until(()=>false,1);});
 await snap(tag+'-n01-night-home');
 await ev(()=>{const C=__c3,L=lastLight;C.onBike();const d=L.nav.locate(C.me().x,C.me().z).d;L.press('KeyW');const pts=[C.M(d+4,-2.4)];for(let x=d+24;x<590;x+=20)pts.push(C.M(x,-2.2));pts.push(C.M(590,-2.2));C.ride(pts,120);C.brake();C.until(()=>L.state.chapter.phase==='n3-ride',30);});
 await snap(tag+'-n02-corner-at-night');
 await ev(()=>{const C=__c3,L=lastLight;L.press('KeyW');C.ride([C.M(596,3),C.S(10,1.6),...C.sl(10,236,1.4,12)],140);C.until(()=>L.state.chapter.phase==='n3-road',10);C.until(()=>false,.5);});
 await snap(tag+'-n03-end-of-briarwood-at-night');
 check('Chapter Three: the old road at night: your light on the handlebars, Jamie’s and Sam’s lights on',(await state()).onFoot.on&&(await c1()).flash===true);
 await ev(()=>{const C=__c3;C.ride(C.rl(2,120,0,9),60);});await snap(tag+'-n04-road-early');
 await ev(()=>{const C=__c3;C.ride(C.rl(120,240,0,9),60);});await snap(tag+'-n05-road-middle');
 await ev(()=>{const C=__c3;C.ride(C.rl(240,380,0,9),60);});await snap(tag+'-n06-road-deep');
 await ev(()=>{const C=__c3,L=lastLight;C.ride(C.rl(380,L.world.woods.L-6,0,9),70);C.until(()=>L.state.chapter.phase==='n3-outfall',20);C.brake();const m=L.world.drain.spots.mouth;C.face(m.x,m.z,.05);C.until(()=>false,1.5);});
 // ---- the drain ------------------------------------------------------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Enter the drain.',40);C.offBike();{const W=L.world.woods,q=W.project(C.me().x,C.me().z);if(q&&!q.out&&q.s<W.L-8)C.walk(C.rl(q.s,W.L-3,0,5),{r:1,max:60});}/* (stopped short, up the road: walk down it, as you would) */if(L.state.state!=='c1-walk')throw new Error('could not get off the bike at the outfall: '+JSON.stringify({state:L.state.state,speed:L.state.speed,prompt:L.state.prompt,lock:L.roam.lock,phase:L.state.chapter.phase,me:C.me(),at:L.nav.locate(C.me().x,C.me().z)}));C.go({x:C.O(9,4)[0],z:C.O(9,4)[1]},{r:.3,max:40,round:true});const m=L.world.drain.spots.mouth;C.face(m.x,m.z,.1);C.until(()=>false,1.2);});
 await snap(tag+'-n07-the-outfall');// (on foot on the apron, the headwall and the black mouth ahead)
 check('Chapter Three: the outfall: "That’s where the creek goes. Behind Alex’s."',await said('JAMIE: “That’s where the creek goes. Behind Alex’s. All of it comes out here.”'));
 await ev(()=>{const C=__c3,L=lastLight;C.walk([C.O(6,0),C.O(1.2,0)],{r:.5,max:30});C.face(...C.D(10,0),0);C.until(()=>false,.6);
  // (if the way in is not reached, say exactly where and why, instead of failing later on a missing drain position)
  const m=C.me(),near=L.chapter.blockers?L.chapter.blockers(true).filter(o=>Math.hypot(o.x-m.x,o.z-m.z)<3).map(o=>[+o.x.toFixed(2),+o.z.toFixed(2),o.r]):null;
  if(Math.hypot(m.x-C.O(1.2,0)[0],m.z-C.O(1.2,0)[1])>2)throw new Error('did not reach the drain mouth: '+JSON.stringify({me:m,state:L.state.state,phase:L.state.chapter.phase,obj:L.state.chapter.objective,speed:L.state.speed,roam:{x:L.roam.x,z:L.roam.z,lock:L.roam.lock},at:L.nav.locate(m.x,m.z),walk:L.nav.walkable(m.x,m.z),target:C.O(9,4),walkTarget:L.nav.walkable(...C.O(9,4)),path:L.nav.walkPath({x:m.x,z:m.z},{x:C.O(1.2,0)[0],z:C.O(1.2,0)[1]}),near,prompt:L.state.prompt,comps:L.chapter.companions.all.map(c=>[c.key,c.mode,+c.px.toFixed(1),+c.pz.toFixed(1),+c.bx.toFixed(1),+c.bz.toFixed(1)])}));});
 await snap(tag+'-n08-the-mouth');
 await ev(()=>{const C=__c3,L=lastLight;C.walk([C.D(3,0),...C.dl(3,44,.3,4)],{r:.6,max:60});C.until(()=>false,.4);});
 await snap(tag+'-n09-first-stretch');
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(44,99,.3,4),{r:.6,max:60});C.until(()=>L.state.chapter.line==='“It’s just the bend.”',10);const back=C.D(40,0);C.face(back[0],back[1],0);C.until(()=>false,.5);});
 await snap(tag+'-n10-after-the-bend-no-way-out');
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(99,104,.2,2),{r:.6,max:30});C.until(()=>L.state.chapter3.flags.prints,10);C.until(()=>L.state.chapter.line==='“Footprints.”',15);const {w}=L.world.drain.sizeAt(105),q=L.world.drain.at(105,-(w/2-.6));C.face(q.x,q.z,-.6);C.until(()=>false,.6);});
 await snap(tag+'-n11-footprints-in-the-silt');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='See where the tracks lead.',40);C.walk(C.dl(104,128,.2,3),{r:.6,max:60,stop:()=>L.state.chapter3.flags.bell1});C.until(()=>L.state.chapter3.flags.bell1,30);C.until(()=>false,1.4);});
 await snap(tag+'-n12-first-bell-they-freeze');
 // (a black side drain in the wall, low down: the light goes into it and nothing comes back)
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Keep going.',40);C.walk(C.dl(C.ds()+.5,127.6,.2,2),{r:.5,max:30,stop:()=>L.state.chapter3.flags.item});const q=C.D(129.5,-1.95);C.face(q[0],q[1],-.2);C.until(()=>false,.6);});
 await snap(tag+'-n13-side-drain-black');
 // ---- his helmet: the one from his desk this morning ----------------------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(C.ds()+1,141,.2,3),{r:.6,max:40,stop:()=>L.state.chapter3.flags.item});C.until(()=>L.state.chapter3.flags.item,15);C.until(()=>__c3.said.includes('JAMIE: “…That’s his helmet.”'),12);const it=L.chapter3.itemAt;C.go(C.near(it,1.7),{r:.35,max:15,round:true});C.face(it.x,it.z,-.62);C.until(()=>false,.6);});// (you walk up to it, as anyone would)
 await snap(tag+'-n14-his-helmet-in-the-silt');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>__c3.said.includes('SAM: “We need to tell somebody. Right now.”'),30);C.until(()=>false,.6);const s=L.chapter.companions.all.find(c=>c.key==='sam');C.face(s.px,s.pz,-.05);C.until(()=>false,.4);});
 await snap(tag+'-n15-sam-wants-out');
 check('Chapter Three: deep in, his helmet, the one from his desk this morning; Sam: "We need to tell somebody."',await said('SAM: “His helmet’s still here.”')&&await said('JAMIE: “…That’s his helmet.”')&&await said('SAM: “That was on his desk. This morning.”')&&await said('SAM: “We need to tell somebody. Right now.”')&&(await c3()).helmet===true);
 // ---- the bike from the oak, deep in; the bell that does not ring --------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Keep going.',60);C.walk(C.dl(C.ds()+1,158,.2,3),{r:.6,max:60,stop:()=>L.state.chapter3.flags.oldBike});C.until(()=>L.state.chapter3.flags.oldBike,20);C.until(()=>false,1.6);const b=L.chapter3.old.group.position;C.face(b.x,b.z,-.08);C.until(()=>false,.4);});
 await snap(tag+'-n16-the-bike-in-the-light');
 const bikeFar=await ev(()=>{const L=lastLight,b=L.chapter3.old.group.position,c=L.camera.position;return +Math.hypot(b.x-c.x,b.z-c.z).toFixed(1);});
 await ev(()=>{const C=__c3,L=lastLight,b=L.chapter3.old.group.position;C.until(()=>L.state.chapter.objective==='Look at the bike.',40);C.go(C.near(b,1.4),{r:.3,max:25});C.face(b.x,b.z,-.4);C.until(()=>false,.3);L.key('KeyF');C.until(()=>L.state.chapter.objective==='Try the bell.',30);L.key('KeyF');C.until(()=>false,.25);});
 await snap(tag+'-n17-try-the-bell-click');
 check('Chapter Three: the bike from the oak found by your light from '+bikeFar+' m; its bell only clicks',bikeFar>=5&&(await c3()).bike==='tunnel'&&await said('JAMIE: “That’s the bike. From the oak.”'));
 // ---- deeper: low, wet, a ledge; and behind them, the bike is gone ---------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>false,1.4);L.key('KeyF');C.until(()=>L.state.chapter3.flags.bell2,30);C.until(()=>L.state.chapter.phase==='n3-deeper',20);C.walk(C.dl(C.ds()+2,177,.3,3),{r:.6,max:60});const q=C.D(186,.5);C.face(q[0],q[1],-.17);C.until(()=>false,.6);});
 await snap(tag+'-n18-deep-low-ceiling-ankle-water');
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(C.ds()+1,183,.3,3),{r:.6,max:30});C.until(()=>L.state.chapter3.flags.bikeGone,12);C.until(()=>false,.8);const b=L.chapter3.oldSpot;C.face(b.x,b.z,-.05);C.until(()=>false,.5);});
 await snap(tag+'-n19-the-bike-is-gone');
 await ev(()=>__c3.until(()=>__c3.said.includes('SAM: “It was right there.”'),12));
 check('Chapter Three: farther in, the bike is no longer where it was (nobody saw it go)',(await c3()).bike==='removed'&&(await c3()).oldBike===false&&await said('SAM: “It was right there.”'));
 // ---- the boy at the end of their lights ----------------------------------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>!L.state.chapter.line,10);const a=C.D(205,0);C.face(a[0],a[1],0);C.walk(C.dl(C.ds()+1,199,.25,3),{r:.6,max:40,stop:()=>L.state.chapter3.flags.figure});L.release('KeyW');C.until(()=>L.state.chapter3.flags.figure,15);const f=C.D(212.2,0);C.face(f[0],f[1],-.02);C.until(()=>false,1.8);});
 await snap(tag+'-n20-figure-from-eye-height');// (your own view down the tunnel, as the game left it: they have stopped, either side of you)
 // (a review camera behind and above the three of them, for the wide shot; not a story frame)
 await ev(()=>{const L=lastLight,c=L.camera,Dr=L.world.drain,m=__c3.me(),q=Dr.project(m.x,m.z),b=Dr.at(q.s-3.2,.3),f=L.chapter3.figure.group.position;window.__camKeep={p:c.position.clone(),q:c.quaternion.clone()};c.position.set(b.x,Dr.floorAt(q.s-3.2,.3)+1.95,b.z);c.lookAt(f.x,f.y+.8,f.z);c.updateMatrixWorld();});
 await snap(tag+'-n21-qa-wide-reveal',{clean:true});
 await ev(()=>{const c=lastLight.camera,k=window.__camKeep;c.position.copy(k.p);c.quaternion.copy(k.q);c.updateMatrixWorld();});
 const reveal=await ev(()=>{const C=__c3,L=lastLight,f=L.chapter3.figure.group.position,cp=L.camera.position;C.face(f.x,f.z,-.01);const dist=Math.hypot(f.x-cp.x,f.z-cp.z),Dr=L.world.drain,ps=C.ds(),cs=k=>{const c=L.chapter.companions.all.find(x=>x.key===k);return Dr.project(c.px,c.pz);};
  C.until(()=>L.state.chapter3.figure.seenAt!==null,8);C.until(()=>false,1.2);const j=cs('jamie'),s=cs('sam');
  // (how far each of them is from your line of sight to his chest; behind you counts as clear)
  const c=L.camera.position,dx=f.x-c.x,dz=f.z-c.z,Ln=Math.hypot(dx,dz),ux=dx/Ln,uz=dz/Ln,clear=Object.fromEntries(L.chapter.companions.all.filter(k=>k.active).map(k=>{const ax=k.px-c.x,az=k.pz-c.z,al=ax*ux+az*uz;return [k.key,al<=0||al>=Ln?9:+Math.abs(ax*uz-az*ux).toFixed(2)];}));
  return {dist:+dist.toFixed(1),seenAt:L.state.chapter3.figure.seenAt,j:[+(j.s-ps).toFixed(2),+j.t.toFixed(2)],s:[+(s.s-ps).toFixed(2),+s.t.toFixed(2)],clear};});
 await snap(tag+'-n22-framed-by-their-lights');
 check('Chapter Three: they stop dead either side of you, both lights down the tunnel, your view to him clear between them ('+JSON.stringify(reveal.clear)+' m); at the end of them, '+reveal.dist+' m away, a boy',reveal.dist>=17&&reveal.dist<=28&&reveal.seenAt!==null&&reveal.clear.jamie>.45&&reveal.clear.sam>.45&&reveal.j[0]>.3&&reveal.s[0]>.3);
 const turn=await ev(()=>{const C=__c3,L=lastLight,fp=()=>L.chapter3.figure.group.position;let vis=0;const t0=L.state.chapter3.figure.seenAt;C.until(()=>{if(L.chapter3.figure.group.visible){vis+=1/30;C.face(fp().x,fp().z,-.01);}return L.state.chapter3.figure.state==='turning';},14);C.until(()=>{vis+=1/30;C.face(fp().x,fp().z,-.01);return false;},1.0);return {vis};});
 await snap(tag+'-n23-he-turns');
 await ev(()=>{const C=__c3,L=lastLight,fp=()=>L.chapter3.figure.group.position;C.until(()=>{C.face(fp().x,fp().z,-.01);return L.state.chapter3.figure.state==='leaving-bend';},8);C.until(()=>{C.face(fp().x,fp().z,-.01);return false;},1.4);});
 await snap(tag+'-n24-walking-round-the-bend');
 const gone=await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.figure.state==='hidden',20);return {t:L.state.chapter3.t,seenAt:L.state.chapter3.figure.seenAt};});
 check('Chapter Three: he stays until you have seen him, and well after ('+(gone.t-gone.seenAt).toFixed(1)+' s); "…Alex?"; he turns slowly and walks round the bend',gone.t-gone.seenAt>=4&&await said('JAMIE: “…Alex?”'));
 // ---- round the bend: nobody. A pause. Then someone crosses ahead --------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Follow Jamie.',10);C.walk(C.dl(C.ds()+1,232,.2,3),{r:.6,max:60});C.until(()=>L.state.chapter3.flags.search,10);const q=C.D(262,0);C.face(q[0],q[1],0);C.until(()=>false,1.2);});
 await snap(tag+'-n25-the-bend-empty');
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(232,251,.6,3),{r:.6,max:60,stop:()=>L.state.chapter3.flags.wetSeen});C.until(()=>__c3.said.includes('JAMIE: “It’s wet.”'),25);C.until(()=>false,.3);const f=L.world.drain.at(252,.95);C.face(f.x,f.z,-.36);C.until(()=>false,.4);});
 await snap(tag+'-n26-a-wet-footprint');
 // (then, as you would, you look on down the tunnel, where his light has gone: and wait)
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>!!L.chapter3.C.wetDone,20);C.walk(C.dl(C.ds()+.5,251,.6,3),{r:.6,max:20,stop:()=>L.state.chapter3.flags.cross});});
 const cross=await ev(()=>{const C=__c3,L=lastLight,q=C.D(264,0);C.face(q[0],q[1],0);C.until(()=>L.state.chapter3.flags.cross,45);let seen=0;C.until(()=>{if(L.state.chapter3.figure.state==='second-presence'&&L.chapter.kit.camLooksAt(L.chapter3.figure.group.position,.9))seen+=1/30;return seen>.45;},4);return {seen};});
 await snap(tag+'-n27-someone-crosses-ahead');
 await ev(()=>__c3.until(()=>__c3.said.includes('SAM: “Somebody just—”'),8));
 const pause=await ev(()=>+(lastLight.chapter3.C.crossAt-lastLight.chapter3.C.wetDone).toFixed(1));
 check('Chapter Three: after a long pause ('+pause+' s), a person crosses the tunnel ahead from one black opening to the other (in view '+cross.seen.toFixed(2)+' s)',pause>=10&&cross.seen>.4&&await said('SAM: “Somebody just—”'));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.voice1,40);C.until(()=>false,1.6);});
 await snap(tag+'-n28-voice-ahead-jamie-steps-toward-it');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.voice2,30);C.until(()=>false,.9);});
 await snap(tag+'-n29-voice-behind-they-whip-round');
 await ev(()=>{const C=__c3,L=lastLight,q=L.state.chapter3.voices[1].pos;C.face(q.x,q.z,0);C.until(()=>L.chapter3.C.flags.searchBack,8);C.until(()=>false,2.2);});
 await snap(tag+'-n30-searching-behind-nothing');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.close,20);C.until(()=>false,.3);});
 await snap(tag+'-n31-the-bell-beside-them');
 check('Chapter Three: "Jamie?" ahead, "Guys?" behind, they search behind (nothing), the bell beside them: "RUN!"',(await c3()).voices.length===2&&(await c3()).bells.some(b=>b.close)&&await ev(()=>lastLight.chapter3.C.flags.searchBack===true));
 // ---- RUN: W only; the view a little wider; looking back when they shout ------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.phase==='n3-run',8);C.runT0=L.state.chapter3.t;C.fov=[];C.run(()=>L.state.chapter3.t-C.runT0>1.4,4);});
 await snap(tag+'-n32-run');
 await ev(()=>{const C=__c3,L=lastLight;C.run(()=>L.state.chapter3.purs?.farVisAt!==null,30);C.run(()=>false,.5);});
 await snap(tag+'-n33-they-look-back');
 const far=await ev(()=>{const C=__c3,L=lastLight,f=L.chapter3.figure.group.position;C.face(f.x,f.z,0);C.until(()=>{L.press('KeyW');C.face(f.x,f.z,0);C.fov.push(L.camera.fov);return false;},.5);const cp=L.camera.position;return {d:+Math.hypot(f.x-cp.x,f.z-cp.z).toFixed(1),vis:L.chapter3.figure.group.visible,state:L.state.chapter3.figure.state};});
 await snap(tag+'-n34-he-is-running-after-them');
 await ev(()=>{const C=__c3,L=lastLight;C.run(()=>L.state.chapter3.purs.stumbleAt!==null,20);C.run(()=>false,.3);});
 await snap(tag+'-n35-jamie-goes-down');
 await ev(()=>{const C=__c3,L=lastLight;C.run(()=>L.state.chapter3.purs.pipeAt!==null,30);C.run(()=>false,.25);const q=C.D(136,1.4);C.face(q[0],q[1],-.05);C.until(()=>{L.press('KeyW');return false;},.2);});
 await snap(tag+'-n36-water-bursts-from-a-side-pipe');
 await ev(()=>{const C=__c3,L=lastLight;C.run(()=>C.ds()<=94,30);const r=L.chapter3.relAt;C.face(r.x,r.z,-.12);C.until(()=>{L.press('KeyW');C.face(r.x,r.z,-.12);return false;},.25);});
 await snap(tag+'-n37-the-bike-ahead-of-them');
 await ev(()=>{const C=__c3,L=lastLight;C.run(()=>L.state.chapter3.purs.nearVisAt!==null,30);C.run(()=>false,.15);const f=L.chapter3.figure.group.position;C.face(f.x,f.z,0);C.until(()=>{L.press('KeyW');C.face(f.x,f.z,0);return false;},.3);});
 await snap(tag+'-n38-closer');
 const near=await ev(()=>{const L=lastLight,f=L.chapter3.figure.group.position,cp=L.camera.position;return {d:+Math.hypot(f.x-cp.x,f.z-cp.z).toFixed(1),vis:L.chapter3.figure.group.visible};});
 await ev(()=>{const C=__c3,L=lastLight;C.run(()=>C.ds()<44,20);const q=C.D(0,0);C.face(q[0],q[1],0);C.until(()=>{L.press('KeyW');return false;},.2);});
 await snap(tag+'-n39-the-way-out');
 const run=await ev(()=>{const C=__c3,L=lastLight;C.run(()=>L.state.state==='c1-ride'||L.state.state==='c1-remount',40);L.release('KeyW');C.until(()=>L.state.state==='c1-ride',4);const P=L.state.chapter3.purs;return {secs:+(L.state.chapter3.t-C.runT0).toFixed(1),fov:Math.max(...C.fov),P,stamina:L.state.onFoot?.stamina};});
 await ev(()=>{__c3.until(()=>false,.8);});
 await snap(tag+'-n40-straight-onto-the-bike');
 check('Chapter Three: RUN is a real escape: '+run.secs+' s from the bell to the bikes (45–90), the view wider (fov '+run.fov.toFixed(1)+'), no stamina to run out',run.secs>=40&&run.secs<=95&&run.fov>=68);
 check('Chapter Three: looking back, he is running after them '+far.d+' m behind (50–70 ft), and later '+near.d+' m (25–35 ft); never catches them',far.vis&&far.d>=13&&far.d<=23&&near.vis&&near.d>=6.5&&near.d<=12&&run.P.minGap>=6);
 check('Chapter Three: Jamie goes down and gets up; water bursts from a side pipe; the bike lies across the way out ahead of them; the way out seen',!!run.P.stumbleAt&&!!run.P.pipeAt&&!!run.P.bikeSeenAt&&!!run.P.exitSeenAt&&(await c3()).bike==='relocated');
 // ---- the road out, fast; at a bend, him, in the road ahead; they ride on ------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.phase==='n3-flee',8);L.press('KeyW');C.ride(C.rl(L.world.woods.L-8,445,0,9),80);});
 await snap(tag+'-n41-flight-up-the-dark-road');
 const rf=await ev(()=>{const C=__c3,L=lastLight;L.drive(C.rl(445,300,0,9),{r:2.6});C.until(()=>!L.driving||L.state.chapter3.roadFig?.seenAt!=null,60);C.until(()=>false,.15);return L.state.chapter3.roadFig;});
 await snap(tag+'-n42-him-in-the-road-ahead');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>!L.driving||L.state.chapter3.roadFig?.stage==='leave',6);C.until(()=>false,.7);});
 await snap(tag+'-n43-he-steps-into-the-trees');
 check('Chapter Three: up the road, at a bend, the same boy standing in the road ahead ('+(rf?.seenDist??'?')+' m); he walks off into the trees; nobody stops',!!rf&&rf.seenAt!==null&&rf.seenDist>=8&&rf.seenDist<=16&&await said('JAMIE: “DON’T STOP!”'));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>!L.driving,60);L.stopDriving();C.ride(C.rl(300,4,0,9),120);C.until(()=>false,.2);});
 await snap(tag+'-n44-the-first-streetlight');
 await ev(()=>{const C=__c3,L=lastLight;C.ride([C.S(244,1.2),C.S(238,1.2)],60);C.brake();C.until(()=>L.state.chapter.phase==='n3-safe',20);C.until(()=>L.state.chapter.line==='“That was him.”',30);C.until(()=>false,.6);});
 await snap(tag+'-n45-under-the-streetlight');
 check('Chapter Three: out under the streetlight at the end of Briarwood; "That was him." "No."',(await c1()).phase==='n3-safe'&&await said('SAM: “That was him.”'));
 await ev(()=>__c3.until(()=>lastLight.state.state==='ended',70));
 await page.waitForFunction(()=>!document.querySelector('#ending').hidden&&Number(getComputedStyle(document.querySelector('#ending')).opacity)>.99);
 await snap(tag+'-n46-chapter-three-end');
 check('Chapter Three: "You saw him." "…I know." then LAST LIGHT / Chapter Three',await said('SAM: “You saw him.”')&&await said('JAMIE: “…I know.”')&&(await page.locator('#ending h2').textContent())==='Chapter Three');
 const res=await ev(()=>({phases:__c3.phases.filter(p=>/^(c3|d3|n3)-/.test(p)),gap:__c3.gap,gapAt:__c3.gapAt,peak:Math.max(...__c3.tension),said:__c3.said.length,captions:__c3.caps.length}));
 Object.assign(res,{figureRevealDist:reveal.dist,figurePresentAfterSeen:+(gone.t-gone.seenAt).toFixed(1),pursuitFar:far.d,pursuitNear:near.d,minGap:+run.P.minGap.toFixed(1),runSeconds:run.secs,roadFigureSeen:rf?.seenDist,bikeFoundFrom:bikeFar});
 check('Chapter Three: every phase in order in the browser',JSON.stringify(res.phases)===JSON.stringify(ORDER));
 check('Chapter Three: Jamie and Sam stayed with you (max gap '+res.gap.toFixed(1)+' m at '+res.gapAt+')',res.gap<30);
 check('Chapter Three: the whole chapter played with the sound off',await page.locator('#sound').getAttribute('aria-pressed')==='false');
 check('Chapter Three playthrough: no JavaScript or shader errors',errors.length===0);
 return res;
}

// After the playthroughs: every QA jump rendered, Continue, the captions with real readback, the setting, audio.
export async function runChapterThreeJumps({page,snap:rawSnap,check,state,errors,out,fs,path,tag='c3'}){
 const snap=settled(page,rawSnap),ev=(fn,arg)=>page.evaluate(fn,arg);await ev(installHelpers);
 for(const sec of SECTIONS){await ev(sec=>{lastLight.jump(sec);lastLight.step(1.5);},sec);await page.waitForTimeout(1600);await snap('qa-jump-'+sec);
  const s=await state(),want=[].concat(EXPECT[sec]);check('QA jump '+sec+' lands in '+want.join(' / '),want.includes(s.chapter.phase)&&Number.isFinite(s.roam.x)&&s.state.startsWith('c1-')&&s.day===(want[0].startsWith('d3-')?1:0));}
 // Continue from the title after a Chapter Three checkpoint (deep in the drain).
 await ev(()=>{lastLight.jump('c3-old-bike');lastLight.step(1);lastLight.chapter.kit.checkpointTo('c3-old-bike',lastLight.chapter3.LABEL['c3-old-bike']);lastLight.toTitle();lastLight.step(.2);});
 check('Continue is offered on the title from a Chapter Three checkpoint',await page.locator('#continue').isVisible()&&/bike, down there/i.test(await page.locator('#continue-where').textContent()));await snap(tag+'-title-continue');
 await page.click('#continue');await ev(()=>lastLight.step(1.5));check('Continue returns to the bike in the drain',(await state()).chapter.phase==='n3-bike'&&(await state()).day===0);
 // The figure close up, for review (a QA camera at the player's eye, narrowed; not a story frame).
 await ev(()=>{const L=lastLight;L.jump('c3-figure-reveal');L.step(1.2);L.camera.fov=18;L.camera.updateProjectionMatrix();const f=L.chapter3.figure.group.position;L.camera.lookAt(f.x,f.y+.9,f.z);L.camera.updateMatrixWorld();});
 await snap(tag+'-qa-figure-zoomed-for-review',{clean:true});await ev(()=>{const L=lastLight;L.camera.fov=64;L.camera.updateProjectionMatrix();});
 // ---- captions: measured with the frame's own pixels behind the words ---------------------------------------------
 const capCase=async(name,setup,want=null,{still=false}={})=>{const r=await ev(async([setup,still])=>{const L=lastLight;await (0,eval)('('+setup+')')(L,__c3);const S=L.chapter.kit.S;S.queue.length=0;S.line=null;L.chapter.kit.talk([{who:'JAMIE',text:'“Can you read this? It should be easy to read here.”',time:40}]);
   // Frames driven by the browser's own animation frames, as in play: the readback is asynchronous (a fence
   // the browser resolves between frames), a few times a second; four fresh measurements at least.
   const n0=L.captionTone.state.samples;await new Promise(res=>{let i=0;const f=()=>{L.render();if(!still)L.step(.12);if(++i<60&&(i<14||L.captionTone.state.samples<n0+4))requestAnimationFrame(f);else res();};requestAnimationFrame(f);});const st=L.captionTone.state,el=document.getElementById('subtitle'),cs=getComputedStyle(el);return {...st,bg:cs.backgroundColor,border:cs.borderTopWidth,color:cs.color,shown:parseFloat(el.style.opacity||'0')>=.75&&(el.textContent||'').length>3/* (a memory's own lines are drawn at 0.8) */,text:(el.textContent||'').slice(0,60),opacity:cs.opacity,styleOpacity:el.style.opacity};},[setup.toString(),still]);
  await snap('caption-'+name);
  // Contrast is against the brightest (or darkest) sixth of the strip behind the words; where that is
  // low (a lit patch inside a dark strip), the opposite-tone edge round each letter is strengthened.
  const ok=r.source==='frame'&&(r.contrast>=3||r.contrast>=2&&r.halo>=.7||r.scrim>=.5)&&/rgba\(0, 0, 0, 0\)|transparent/.test(r.bg)&&r.border==='0px'&&(!want||r.mode===want)&&r.shown;
  check(`captions over ${name}: ${r.mode} words, worst-case contrast ${r.contrast}:1 measured from the frame (edge ${r.halo}${r.scrim?', glow '+r.scrim:''}), no box`+(ok?'':' '+JSON.stringify(r)),ok);await ev(()=>{const S=lastLight.chapter.kit.S;S.queue.length=0;S.line=null;});return {name,...r};};
 const caps=[];
 caps.push(await capCase('night-asphalt',(L,C)=>{L.jump('night-start');L.step(4);L.face(L.roam.a,-.5);},'light'));
 caps.push(await capCase('day-grass',(L,C)=>{L.jump('neighbors');L.step(2);const AH=L.world.homes.alex,p=AH.toWorld(-AH.w/2-2.5,AH.front+3.5);C.face(p.x,p.z,-.6);L.step(.1);}));
 caps.push(await capCase('day-field-end-of-briarwood',(L,C)=>{L.jump('c3-road-day');L.step(3);}));
 caps.push(await capCase('woods-road-night',(L,C)=>{L.jump('c3-forest-deep');L.step(2);},'light'));
 caps.push(await capCase('drain-darkness',(L,C)=>{L.jump('c3-tunnel-inside');L.step(1);L.chapter.kit.o.setFlashlight(true,false);L.step(.2);},'light'));
 caps.push(await capCase('drain-flashlight-on-the-wall',(L,C)=>{L.jump('c3-tunnel-inside');L.step(1);const m=C.me(),q=L.world.drain.project(m.x,m.z),w=L.world.drain.at(q.s+1.2,2.3);C.face(w.x,w.z,0);L.step(.2);}));
 caps.push(await capCase('drain-flashlight-floor',(L,C)=>{L.jump('c3-tunnel-inside');L.step(1);L.face(L.state.walk.a,-.9);L.step(.2);}));
 caps.push(await capCase('bright-house-siding',(L,C)=>{L.jump('neighbors');L.step(1);const AH=L.world.homes.alex,p=AH.toWorld(-AH.w/4,AH.front),m=C.me();C.go({x:p.x+(m.x-p.x)*.35,z:p.z+(m.z-p.z)*.35},{max:20});C.face(p.x,p.z,.12);L.step(.2);}));
 caps.push(await capCase('streetlight',(L,C)=>{L.jump('chapter3-end');L.step(2);L.face(L.state.roam.a,.05);}));
 caps.push(await capCase('daylight-sky',(L,C)=>{L.jump('neighbors');L.step(1);L.face(L.state.walk.a,1.1);L.step(.1);},'dark'));// (on foot, so the view can look up)
 caps.push(await capCase('memory',(L,C)=>{L.jump('memory-reconstruction');L.step(4.7);},null,{still:true}));// (the memory's own subtitles: held on "…tomorrow…")
 caps.push(await capCase('police-lights',(L,C)=>{L.jump('alex-house');L.step(3);}));
 // Sweeping from bright sky down to dark ground and back: one change of tone each way at most, never a flicker.
 const sweep=await ev(async()=>{const L=lastLight;L.jump('c3-road-day');L.step(1);L.chapter.kit.talk([{who:'SAM',text:'“Okay. Sweeping the view.”',time:60}]);const a=L.state.walk.a;let prev=null;const trace=[],flips=[],lums=[];
  return new Promise(res=>{let i=0;const f=()=>{const t=i/80,p=1.1-2.2*Math.abs(Math.sin(t*Math.PI));L.face(a,p);L.render();L.step(.1);const st=L.captionTone.state,m=st.mode;if(prev&&m!==prev)flips.push(i);prev=m;trace.push(m[0]);lums.push(st.lum);
   if(++i<=80)requestAnimationFrame(f);else{const S=L.chapter.kit.S;S.queue.length=0;S.line=null;const gaps=flips.slice(1).map((x,k)=>(x-flips[k])*.1);res({flips:flips.length,minSecondsBetween:gaps.length?Math.min(...gaps):null,trace:trace.join(''),lums:lums.map(v=>+v.toFixed(3)),samples:st.samples});}};requestAnimationFrame(f);});});
 // Up into the sky, down to the sunlit ground at your feet and back: the tone follows what is behind the words
 // (it may change several times), but never flickers: each tone is held for most of a second at least.
 check('captions: sweeping the view sky → ground → sky follows the background without flicker ('+sweep.flips+' changes, at least '+sweep.minSecondsBetween+' s apart: '+sweep.trace+')',sweep.flips<=8&&(sweep.minSecondsBetween===null||sweep.minSecondsBetween>=.6));
 // The captions setting still hides spoken captions.
 const setting=await ev(()=>{const L=lastLight,S=L.chapter.kit.S,el=document.getElementById('subtitle'),clear=()=>{S.queue.length=0;S.line=null;};L.jump('c3-first-bell');L.step(.5);
  clear();L.ui.settings.captions=false;L.chapter.kit.talk([{who:'JAMIE',text:'“Hidden by the setting.”',time:3}]);L.step(.6);const hidden=el.style.opacity==='0'&&L.state.chapter.line==='“Hidden by the setting.”';
  clear();L.ui.settings.captions=true;L.chapter.kit.talk([{who:'JAMIE',text:'“Shown again.”',time:3}]);L.step(.6);const shown=el.style.opacity==='1'&&el.textContent.includes('Shown again');return {hidden,shown};});
 check('captions: turning them off in Settings still hides them; on again shows them',setting.hidden&&setting.shown);
 check('Chapter Three jumps and captions: no JavaScript or shader errors',errors.length===0);
 return {captions:caps,sweep};
}

// Audio for this pass is placeholder and deferred (the playtest is muted): no offline renders by default
// (C3_AUDIO_RENDER=1 brings back runChapterThreeAudio below). This only checks that the story still calls
// each sound hook, a sensible number of times, without errors: the voices, the bells, the click, the splashes.
export async function runChapterThreeAudioHooks({page,check,errors}){
 const r=await page.evaluate(()=>{const L=lastLight,A=L.audio(),o=L.chapter.kit.o,calls={},count=k=>calls[k]=(calls[k]||0)+1,keep={sfx:o.sfx};
  o.sfx=(n,...a)=>{count('sfx:'+n);return keep.sfx(n,...a);};for(const k of ['bell3','voice'])if(A&&typeof A[k]==='function'){keep[k]=A[k];A[k]=(...a)=>{count(k);return keep[k].apply(A,a);};}
  const err=[];try{L.jump('c3-first-bell');L.step(6);L.jump('c3-broken-bell');L.step(.3);L.key('KeyF');L.step(1.6);L.key('KeyF');L.step(8);
   L.jump('c3-voice-ahead');for(let t=0;t<45&&!L.state.chapter3.flags.close;t+=1/30)L.step(1/30);L.step(1.5);L.press('KeyW');L.step(6);L.release('KeyW');}catch(e){err.push(String(e));}
  o.sfx=keep.sfx;for(const k of ['bell3','voice'])if(keep[k])A[k]=keep[k];return {calls,err,hooks:{bell3:typeof A?.bell3,voice:typeof A?.voice,sfx:typeof o.sfx}};});
 check('audio hooks (placeholders, not rendered): the bells, both of his voices, the click and the splashes are still called, without errors '+JSON.stringify(r.calls),r.err.length===0&&r.hooks.bell3==='function'&&r.hooks.voice==='function'&&(r.calls.bell3||0)>=2&&(r.calls.voice||0)>=2&&(r.calls['sfx:click']||0)>=1);
 check('audio hooks: no runaway repeats (every hook called a handful of times at most)',Object.values(r.calls).every(n=>n<=40)&&(r.calls.voice||0)<=4&&(r.calls.bell3||0)<=6);
 check('audio hooks: no JavaScript errors',errors.length===0);
 return {mode:'hooks only (placeholders; offline renders skipped by design)',calls:r.calls};}

// Offline renders of the sounds Chapter Three adds. Signal checks only: finite, not clipped, present
// where they should be, silent where they should be; the heartbeat measured against tension.
export async function runChapterThreeAudio({page,check,out,fs,path}){
 // Run on a page of a plain browser of its own (the runners pass one): these checks are about the synthesized signals,
 // not the game session.
 // Each per-frame step resumes the render even if it throws, and a case that does not finish in two minutes fails
 // with what went wrong instead of waiting for ever. First one tiny HRTF render is made and kept alive for the whole
 // stage: Chromium shares its HRTF loader between contexts, and in this headless container an HRTF render could wait
 // for ever on it (intermittently; reproduced in a plain browser). If even that first render stalls for 20 s, these
 // signal checks are rendered with equal-power panning instead, and the report says so.
 const clips=await page.evaluate(async()=>{{const w=new OfflineAudioContext(2,4800,48000),p=w.createPanner();p.panningModel='HRTF';const o=w.createOscillator();o.connect(p).connect(w.destination);o.start();
   window.__hrtf=await Promise.race([w.startRendering().then(()=>true),new Promise(r=>setTimeout(()=>r(false),20000))]);window.__hrtfKeep=w;
   if(!window.__hrtf){const cp=OfflineAudioContext.prototype.createPanner;OfflineAudioContext.prototype.createPanner=function(){const q=cp.call(this);Object.defineProperty(q,'panningModel',{configurable:true,get:()=>'equalpower',set:()=>{}});return q;};}}const {createAudio}=await import('./audio.js'),{createTension}=await import('./tension.js');const res=[];
  const night={speed:0,pedal:false,coasting:false,onBike:false,surface:'grass',p:1,night:1,deep:.4,finale:40,friendsLeft:0,state:'c1-walk',crank:0,night1:true,listener:{x:0,y:1.5,z:0},forward:{x:0,z:-1},sources:[]};
  // (The body and the one-shots are rendered with the night's layers off, so each is measured on its own.)
  const quiet={traffic:0,insects:0,wind:0,life:0};
  const cases=[['c3-heartbeat-calm',{tension:.1,amb:quiet}],['c3-heartbeat-uneasy',{tension:.35,amb:quiet}],['c3-heartbeat-afraid',{tension:.65,amb:quiet}],['c3-heartbeat-panic',{tension:1,amb:quiet}],['c3-heartbeat-rising',{rise:true,amb:quiet}],
   ['c3-night-ambience-full',{amb:{traffic:1,insects:1,wind:1,life:1}}],['c3-night-ambience-gone',{amb:{traffic:0,insects:0,wind:.45,life:0}}],
   ['c3-bell-far-in-the-drain',{amb:quiet,bell:[{x:-.5,y:1.1,z:-60},1.1,{tunnel:true,ref:9}]}],['c3-bell-clear-ahead',{amb:quiet,bell:[{x:-1,y:1.1,z:-34},1.05,{tunnel:true,ref:7}]}],['c3-bell-right-beside',{amb:quiet,bell:[{x:.7,y:1.2,z:1.0},.62,{tunnel:true,ref:1}]}],['c3-bell-far-behind-on-the-road',{amb:quiet,bell:[{x:0,y:1.5,z:110},.9,{ref:30}]}],
   ['c3-voice-jamie-ahead-in-the-drain',{amb:quiet,voice:['jamie',{x:-3,y:1.6,z:-22},{gain:1,tunnel:true,ref:3}]}],['c3-voice-guys-behind-in-the-drain',{amb:quiet,voice:['guys',{x:0,y:1.3,z:32},{gain:1.05,tunnel:true,ref:4}]}],
   ['c3-recording-1',{amb:quiet,rec:0}],['c3-recording-2',{amb:quiet,rec:1}],['c3-recording-3',{amb:quiet,rec:2}],['c3-recording-4',{amb:quiet,rec:3}],['c3-recording-5-the-night-before',{amb:quiet,rec:4}],['c3-old-bell-lever-click',{amb:quiet,sfx:'click'}],['c3-splash-behind-placeholder',{amb:quiet,sfx:'splash'}],['c3-knock-up-the-shaft',{amb:quiet,sfx:'tap'}]];
  const errs=[];for(const [name,c] of cases){const dur=c.rec===4?25:c.rec!==undefined?11:8,ctx=new OfflineAudioContext(2,48000*dur,48000);let seed=2011;const audio=createAudio({context:ctx,random:()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}});audio.ensure();audio.setEnabled(true);
   const T=createTension();if(c.tension!==undefined){T.value=T.target=c.tension;}
   // Drive the per-frame update on the offline clock (suspend, update, resume), a frame every 1/30 s.
   const frames=Math.round(dur*30),rendering=(()=>{for(let i=1;i<frames;i++)ctx.suspend(i/30).then(()=>{try{if(c.rise&&i===30)T.jolt(1,{rise:.35,hold:30});T.update(1/30);audio.update(1/30,{...night,amb:c.amb,heart:(c.tension!==undefined||c.rise)?T.heart:null});if(i===15){if(c.bell)audio.bell3(...c.bell);if(c.voice)audio.voice(...c.voice);if(c.rec!==undefined)audio.recording(c.rec,{x:.2,y:1,z:-.45});if(c.sfx)audio.sfx(c.sfx,{x:0,y:1,z:-1.5});}}catch(e){errs.push(name+' at frame '+i+': '+e);}ctx.resume();});return ctx.startRendering();})();
   if(c.rise)T.value=T.target=.25;
   const b=await Promise.race([rendering,new Promise((_,no)=>setTimeout(()=>no(new Error('audio case did not finish: '+name+' '+JSON.stringify(errs.slice(0,3)))),120000))]),ch=[b.getChannelData(0),b.getChannelData(1)];let peak=0,sum=0,nonFinite=0,jump=0;for(const a of ch)for(let i=0;i<a.length;i++){peak=Math.max(peak,Math.abs(a[i]));sum+=a[i]*a[i];if(!Number.isFinite(a[i]))nonFinite++;if(i)jump=Math.max(jump,Math.abs(a[i]-a[i-1]));}
   // Low-band energy per 50 ms (the heartbeat lives below 150 Hz): the onsets of each beat.
   let beats=0;if(name.startsWith('c3-heartbeat')){const win=2400,e=[];for(let i=0;i+win<=b.length;i+=win){let s=0;for(let j=i;j<i+win;j+=8)s+=ch[0][j]*ch[0][j];e.push(s);}const mx=Math.max(...e);for(let i=1;i<e.length;i++)if(e[i]>mx*.25&&e[i-1]<=mx*.25)beats++;}
   const pcm=new Int16Array(b.length*2);for(let i=0;i<b.length;i++)for(let k=0;k<2;k++)pcm[i*2+k]=Math.round(Math.max(-1,Math.min(1,ch[k][i]))*32767);const bytes=new Uint8Array(pcm.buffer);let bin='';for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode(...bytes.subarray(i,i+8192));
   res.push({name,peak,rms:Math.sqrt(sum/(b.length*2)),nonFinite,maxSampleJump:jump,beats,seconds:dur,pcm:btoa(bin)});}
  if(errs.length)throw new Error('audio steps threw: '+JSON.stringify(errs.slice(0,5)));window.__hrtfKeep=null;for(const r of res)r.panning=window.__hrtf?'HRTF':'equalpower (HRTF stalled)';return res;});
 // Signal-validation renders, kept small: 24 kHz (pairs of samples averaged), stereo only where placement matters.
 const wav=(raw,stereo)=>{const src=new Int16Array(Uint8Array.from(raw).buffer),frames=Math.floor(src.length/4),ch=stereo?2:1,pcm=Buffer.alloc(frames*ch*2);
  for(let i=0;i<frames;i++){const l=(src[i*4]+src[i*4+2])/2,r=(src[i*4+1]+src[i*4+3])/2;if(stereo){pcm.writeInt16LE(Math.round(l),i*4);pcm.writeInt16LE(Math.round(r),i*4+2);}else pcm.writeInt16LE(Math.round((l+r)/2),i*2);}
  const b=Buffer.alloc(44+pcm.length);b.write('RIFF',0);b.writeUInt32LE(36+pcm.length,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(ch,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(24000*ch*2,28);b.writeUInt16LE(ch*2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(pcm.length,40);pcm.copy(b,44);return b;};
 const dir=path.join(out,'audio');fs.mkdirSync(dir,{recursive:true});const by={};
 for(const c of clips){fs.writeFileSync(path.join(dir,c.name+'.wav'),wav(Buffer.from(c.pcm,'base64'),/bell|voice/.test(c.name)));delete c.pcm;by[c.name]=c;if(c.name!=='c3-heartbeat-calm')check('audio signal (Chapter Three) finite and unclipped: '+c.name,c.nonFinite===0&&c.peak<.95&&c.peak>1e-5);}
 check('audio signal: calm is silent (no heartbeat below the threshold)',by['c3-heartbeat-calm'].nonFinite===0&&by['c3-heartbeat-calm'].rms<by['c3-heartbeat-uneasy'].rms*.5+1e-6);
 check('audio signal: the heartbeat grows with tension (uneasy < afraid < panic) and quickens',by['c3-heartbeat-uneasy'].rms<by['c3-heartbeat-afraid'].rms&&by['c3-heartbeat-afraid'].rms<by['c3-heartbeat-panic'].rms&&by['c3-heartbeat-panic'].beats>by['c3-heartbeat-uneasy'].beats);
 check('audio signal: the night with its layers gone is much quieter than the ordinary night',by['c3-night-ambience-gone'].rms<by['c3-night-ambience-full'].rms*.6);
 check('audio signal: the bell right beside them is louder than the bell far down the drain',by['c3-bell-right-beside'].peak>by['c3-bell-far-in-the-drain'].peak);
 return clips;
}
