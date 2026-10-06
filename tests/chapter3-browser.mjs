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
   if(/^(d3-(street|mom|room|phone|window|neighbors|road|tracks|plan)|n3-(corner|ride|road|outfall|tunnel|evidence|bell|bike|deeper|figure|search|voice|behind|close|flee|safe))$/.test(c.phase)){const m=this.me();for(const k of L.chapter.companions.all){if(!k.active)continue;const d=Math.hypot((k.mode==='ride'?k.bx:k.px)-m.x,(k.mode==='ride'?k.bz:k.pz)-m.z);if(d>this.gap){this.gap=d;this.gapAt=c.phase;}}}},
  until(fn,max){for(let t=0;t<max;t+=1/30){L.step(1/30);this.watch();if(fn())return true;}return false;},
  me(){const s=L.state;return s.state==='c1-walk'?s.walk:s.roam;},
  face(x,z,p=0){const m=this.me();L.face(Math.atan2(x-m.x,-(z-m.z)),p);},
  walk(pts,{r=.6,max=90,stop=null,sprint=false}={}){let i=0;const ok=this.until(()=>{if(stop?.())return true;const m=this.me();while(i<pts.length&&Math.hypot(pts[i][0]-m.x,pts[i][1]-m.z)<r)i++;if(i>=pts.length)return true;this.face(pts[i][0],pts[i][1]);L.press('KeyW');if(sprint)L.press('ShiftLeft');return false;},max);L.release('KeyW');L.release('ShiftLeft');return ok;},
  go(q,o={}){const to={x:q.x??q[0],z:q.z??q[1]},m=this.me(),obs=L.state.state==='c1-walk'?[...(L.chapter.blockers?.(true)||[]).map(b=>({x:b.x,z:b.z,r:b.r})),{x:L.roam.x,z:L.roam.z,r:.4}]:[],path=L.nav.walkPath({x:m.x,z:m.z},to,obs),pts=path.length?path:[[to.x,to.z]];return this.walk(pts,o);},// (round people and parked bikes, as you would)
  ride(pts,max=150){L.drive(pts,{r:2.6});const ok=this.until(()=>!L.driving,max);L.stopDriving();return ok;},
  brake(){L.release('KeyW');L.press('KeyS');this.until(()=>L.state.speed<.05,8);L.release('KeyS');},
  offBike(){if(L.state.state==='c1-ride'){this.brake();L.key('KeyF');this.until(()=>L.state.state==='c1-walk',4);this.until(()=>false,.3);}},
  onBike(){if(L.state.state==='c1-walk'){const r=L.roam,m=this.me(),path=L.nav.walkPath({x:m.x,z:m.z},{x:r.x,z:r.z});this.walk(path.length?path:[[r.x,r.z]],{r:1.2,max:40});this.face(r.x,r.z);this.until(()=>false,.2);L.key('KeyF');this.until(()=>L.state.state==='c1-ride',4);}},
  near(q,d){const m=this.me(),l=Math.hypot(m.x-q.x,m.z-q.z)||1;return {x:q.x+(m.x-q.x)/l*d,z:q.z+(m.z-q.z)/l*d};},
  S(u,v){const p=B.point(u,v);return [p.x,p.z];},sl(u0,u1,v,st=12){const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(this.S(u0+(u1-u0)*i/n,v));return o;},
  R(s,t=0){const p=Wd.at(s,t);return [p.x,p.z];},rl(s0,s1,t=0,st=9){const o=[];const n=Math.ceil(Math.abs(s1-s0)/st);for(let i=1;i<=n;i++)o.push(this.R(s0+(s1-s0)*i/n,t));return o;},
  D(s,t=0){const p=Dr.at(s,t);return [p.x,p.z];},dl(s0,s1,t=0,st=3){const o=[];const n=Math.ceil(Math.abs(s1-s0)/st);for(let i=1;i<=n;i++)o.push(this.D(s0+(s1-s0)*i/n,t));return o;},
  O(a,b){const p=Wd.fromA(a,b);return [p.x,p.z];},ds(){const m=this.me(),q=Dr.project(m.x,m.z);return q?q.s:-1;},
  M(d,l){const p=groundPoint(d,l);return [p.x,p.z];},prompt(){return L.state.prompt;},C1(){return L.state.chapter;},C3(){return L.state.chapter3;}};}

const SECTIONS=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day','night-start','c3-road-night','c3-forest-deep','c3-tunnel-entrance','c3-tunnel-inside','c3-evidence','c3-first-bell','c3-old-bike-tunnel','c3-broken-bell','c3-figure','c3-figure-bend','c3-voice-ahead','c3-voice-behind','c3-close-bell','c3-tunnel-escape','c3-bike-escape','chapter3-end'];
const EXPECT={'chapter3-start':'d3-corner','c3-alex-house':'d3-street','alex-bedroom':'d3-room','recording':'d3-phone','neighbors':'d3-neighbors','c3-road-day':['d3-road','d3-tracks'],'night-start':'n3-home','c3-road-night':'n3-road','c3-forest-deep':'n3-road',
 'c3-tunnel-entrance':'n3-outfall','c3-tunnel-inside':'n3-tunnel','c3-evidence':['n3-tunnel','n3-evidence'],'c3-first-bell':['n3-bell','n3-tunnel'],'c3-old-bike-tunnel':'n3-bike','c3-broken-bell':'n3-bike','c3-figure':['n3-figure','n3-follow'],'c3-figure-bend':['n3-figure','n3-follow'],
 'c3-voice-ahead':['n3-voice','n3-behind'],'c3-voice-behind':['n3-behind','n3-close'],'c3-close-bell':['n3-close','n3-run'],'c3-tunnel-escape':'n3-run','c3-bike-escape':'n3-flee','chapter3-end':'n3-safe'};
const ORDER=['c3-black','d3-corner','d3-street','d3-mom','d3-room','d3-phone','d3-window','d3-neighbors','d3-road','d3-tracks','d3-plan','d3-home','c3-night','n3-home','n3-corner','n3-ride','n3-road','n3-outfall','n3-tunnel','n3-evidence','n3-tunnel','n3-bell','n3-tunnel','n3-bike','n3-deeper','n3-figure','n3-follow','n3-search','n3-voice','n3-behind','n3-close','n3-run','n3-out','n3-flee','n3-safe','n3-end'];

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
 await ev(()=>{const C=__c3,L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW,ph=L.chapter3.phone.position;C.go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20});C.face(ph.x,ph.z,-.6);C.until(()=>L.state.chapter.objective==='Listen to Alex’s recordings.',40);C.until(()=>false,.3);L.key('KeyF');C.until(()=>L.state.chapter.phase==='d3-phone',4);C.until(()=>false,1.4);
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
 await ev(()=>{const C=__c3,L=lastLight;C.onBike();L.press('KeyW');const u=L.nav.locate(C.me().x,C.me().z).u||130;C.ride(C.sl(Math.max(30,u)+4,240,1.2,10),120);C.until(()=>L.state.chapter3.flags.roadDay,15);C.brake();C.face(...C.R(14,0),0);C.until(()=>false,.5);});
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
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Enter the drain.',40);C.offBike();{const W=L.world.woods,q=W.project(C.me().x,C.me().z);if(q&&!q.out&&q.s<W.L-8)C.walk(C.rl(q.s,W.L-3,0,5),{r:1,max:60});}/* (stopped short, up the road: walk down it, as you would) */if(L.state.state!=='c1-walk')throw new Error('could not get off the bike at the outfall: '+JSON.stringify({state:L.state.state,speed:L.state.speed,prompt:L.state.prompt,lock:L.roam.lock,phase:L.state.chapter.phase,me:C.me(),at:L.nav.locate(C.me().x,C.me().z)}));C.go({x:C.O(9,4)[0],z:C.O(9,4)[1]},{r:.3,max:40});const m=L.world.drain.spots.mouth;C.face(m.x,m.z,.1);C.until(()=>false,1.2);});
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
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Keep going.',40);C.walk(C.dl(128,158,.2,3),{r:.6,max:60,stop:()=>L.state.chapter3.flags.oldBike});C.until(()=>L.state.chapter3.flags.oldBike,20);C.until(()=>false,1.6);});
 await snap(tag+'-n13-the-bike-down-here');
 await ev(()=>{const C=__c3,L=lastLight,b=L.chapter3.old.group.position;C.until(()=>L.state.chapter.objective==='Look at the bike.',40);C.go(C.near(b,1.4),{r:.3,max:25});C.face(b.x,b.z,-.4);C.until(()=>false,.3);L.key('KeyF');C.until(()=>L.state.chapter.objective==='Try the bell.',30);L.key('KeyF');C.until(()=>false,.25);});
 await snap(tag+'-n14-try-the-bell-click');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>false,1.4);L.key('KeyF');C.until(()=>L.state.chapter3.flags.bell2,30);C.until(()=>L.state.chapter.phase==='n3-deeper',20);const q=L.world.drain.project(C.me().x,C.me().z).s;C.face(...C.D(q+20,0));C.walk(C.dl(q+2,199,.3,3),{r:.6,max:60,stop:()=>L.state.chapter3.flags.figure});L.release('KeyW');C.until(()=>L.state.chapter3.flags.figure,15);const f=L.chapter3.figure.group.position;C.face(f.x,f.z,0);C.until(()=>L.state.chapter3.figure.seenAt!==null,8);});
 await snap(tag+'-n15-the-boy-down-the-tunnel');
 const fig=await ev(()=>{const C=__c3,L=lastLight;let vis=0;C.until(()=>{if(L.chapter3.figure.group.visible)vis+=1/30;return L.state.chapter3.figure.state==='gone';},10);const f=L.chapter3.figure.group.position,c=L.camera.position;return {vis:+vis.toFixed(2)};});
 await snap(tag+'-n16-the-bend-empty');
 check('Chapter Three: the boy at the end of the light, then around the bend like anyone would; visible '+fig.vis+' s after you saw him',fig.vis>=.8&&fig.vis<=3.8&&await said('JAMIE: “…Alex?”'));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Follow Jamie.',10);C.walk(C.dl(L.world.drain.project(C.me().x,C.me().z).s+1,232,.2,3),{r:.6,max:60});C.until(()=>L.state.chapter3.flags.search,10);C.walk(C.dl(232,250,.6,3),{r:.6,max:60});C.until(()=>L.state.chapter.line==='“It’s wet.”',25);C.until(()=>false,.5);});
 await snap(tag+'-n17-search-wet-footprint');
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(250,257,.2,2),{r:.5,max:20});const sc=L.world.drain.sideCulvert;C.face(sc.x,sc.z,0);C.until(()=>L.state.chapter3.flags.voice1,40);C.until(()=>false,2.6);});
 await snap(tag+'-n18-voice-ahead');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.voice2,30);C.until(()=>false,.9);});
 await snap(tag+'-n19-voice-behind-they-turn');
 await ev(()=>{const C=__c3,L=lastLight,q=L.state.chapter3.voices[1].pos;C.face(q.x,q.z,0);C.until(()=>false,2.5);});
 await snap(tag+'-n20-nothing-there');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.close,15);C.until(()=>false,.25);});
 await snap(tag+'-n21-the-bell-beside-them');
 check('Chapter Three: "Jamie?" ahead, "Guys?" behind, the wait, the bell beside them: "RUN!"',(await c3()).voices.length===2&&(await c3()).bells.some(b=>b.close));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.phase==='n3-run',6);const s=L.world.drain.project(C.me().x,C.me().z).s;C.walk(C.dl(s-1,150,0,4),{r:.6,max:60,sprint:true});const b=C.D(160,0);C.face(b[0],b[1],0);C.until(()=>false,.4);});
 await snap(tag+'-n22-run-looking-back');
 await ev(()=>{const C=__c3,L=lastLight;C.walk(C.dl(150,2,0,4).concat([C.O(5,0),C.O(9,4)]),{r:.6,max:120,sprint:true});C.until(()=>L.state.chapter.objective==='Get back to the bikes.',10);const r=L.roam;C.go({x:r.x,z:r.z},{r:2.6,max:30});C.face(r.x,r.z);C.until(()=>false,.15);L.key('KeyF');C.until(()=>L.state.state==='c1-ride',4);C.until(()=>false,.6);});
 await snap(tag+'-n23-back-on-the-bikes');
 await ev(()=>{const C=__c3,L=lastLight;L.press('KeyW');L.press('ShiftLeft');C.ride(C.rl(L.world.woods.L-8,200,0,9),150);});
 await snap(tag+'-n24-flight-up-the-road');
 await ev(()=>{const C=__c3,L=lastLight;C.ride(C.rl(200,1,0,9).concat([C.S(244,1.2),C.S(238,1.2)]),150);L.release('ShiftLeft');C.brake();C.until(()=>L.state.chapter.phase==='n3-safe',20);C.until(()=>L.state.chapter.line==='“That was him.”',30);C.until(()=>false,.6);});
 await snap(tag+'-n25-under-the-streetlight');
 check('Chapter Three: out under the streetlight at the end of Briarwood; "That was him." "No."',(await c1()).phase==='n3-safe'&&await said('SAM: “That was him.”'));
 await ev(()=>__c3.until(()=>lastLight.state.state==='ended',70));
 await page.waitForFunction(()=>!document.querySelector('#ending').hidden&&Number(getComputedStyle(document.querySelector('#ending')).opacity)>.99);
 await snap(tag+'-n26-chapter-three-end');
 check('Chapter Three: "You saw him." "I know." then LAST LIGHT / Chapter Three',await said('SAM: “You saw him.”')&&await said('JAMIE: “I know.”')&&(await page.locator('#ending h2').textContent())==='Chapter Three');
 const run=await ev(()=>({phases:__c3.phases.filter(p=>/^(c3|d3|n3)-/.test(p)),gap:__c3.gap,gapAt:__c3.gapAt,peak:Math.max(...__c3.tension),said:__c3.said.length,captions:__c3.caps.length}));
 check('Chapter Three: every phase in order in the browser',JSON.stringify(run.phases)===JSON.stringify(ORDER));
 check('Chapter Three: Jamie and Sam stayed with you (max gap '+run.gap.toFixed(1)+' m at '+run.gapAt+')',run.gap<30);
 check('Chapter Three: the whole chapter played with the sound off',await page.locator('#sound').getAttribute('aria-pressed')==='false');
 check('Chapter Three playthrough: no JavaScript or shader errors',errors.length===0);
 return run;
}

// After the playthroughs: every QA jump rendered, Continue, the captions with real readback, the setting, audio.
export async function runChapterThreeJumps({page,snap:rawSnap,check,state,errors,out,fs,path,tag='c3'}){
 const snap=settled(page,rawSnap),ev=(fn,arg)=>page.evaluate(fn,arg);await ev(installHelpers);
 for(const sec of SECTIONS){await ev(sec=>{lastLight.jump(sec);lastLight.step(2.5);},sec);await page.waitForTimeout(1600);await snap('qa-jump-'+sec);
  const s=await state(),want=[].concat(EXPECT[sec]);check('QA jump '+sec+' lands in '+want.join(' / '),want.includes(s.chapter.phase)&&Number.isFinite(s.roam.x)&&s.state.startsWith('c1-')&&s.day===(want[0].startsWith('d3-')?1:0));}
 // Continue from the title after a Chapter Three checkpoint (deep in the drain).
 await ev(()=>{lastLight.jump('c3-old-bike-tunnel');lastLight.step(1);lastLight.chapter.kit.checkpointTo('c3-old-bike',lastLight.chapter3.LABEL['c3-old-bike']);lastLight.toTitle();lastLight.step(.2);});
 check('Continue is offered on the title from a Chapter Three checkpoint',await page.locator('#continue').isVisible()&&/bike, down there/i.test(await page.locator('#continue-where').textContent()));await snap(tag+'-title-continue');
 await page.click('#continue');await ev(()=>lastLight.step(1.5));check('Continue returns to the bike in the drain',(await state()).chapter.phase==='n3-bike'&&(await state()).day===0);
 // The figure close up, for review (a QA camera at the player's eye, narrowed; not a story frame).
 await ev(()=>{const L=lastLight;L.jump('c3-figure');L.step(.9);L.camera.fov=18;L.camera.updateProjectionMatrix();const f=L.chapter3.figure.group.position;L.camera.lookAt(f.x,f.y+.9,f.z);L.camera.updateMatrixWorld();});
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
