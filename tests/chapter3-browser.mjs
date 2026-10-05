// Chapter Three in a real browser (Chromium, WebGL, Web Audio): played on from the end of Chapter Two
// the way a player would (walking with W and the heading, riding, F where the prompt says, running),
// with a rendered capture at each beat, day and night; then every Chapter Three QA jump, Continue,
// the captions measured over contrasting backgrounds with the real frame readback, the captions
// setting, and offline renders of the sounds Chapter Three adds (signal checks; nobody listened).
// Called from browser.mjs, or alone from chapter3-browser-only.mjs. Captures go to the QA folder.

// Page-side helpers (run inside the page).
async function installHelpers(){const L=lastLight,Q=L.world.basin,B=L.world.sideFrames[0],{groundPoint}=await import('./route.js');
 window.__c3={said:[],last:'',phases:[],caps:[],tension:[],gap:0,gapAt:null,
  watch(){const s=L.state,c=s.chapter;if(c.line&&c.line!==this.last){this.last=c.line;this.said.push((c.speaker||'')+': '+c.line);}if(this.phases[this.phases.length-1]!==c.phase)this.phases.push(c.phase);
   if(s.caption&&this.caps[this.caps.length-1]!==s.caption)this.caps.push(s.caption);
   if(/^n3-/.test(c.phase))this.tension.push(s.tension.value);
   // Jamie and Sam: how far from you, wherever the story keeps them with you.
   if(/^(d3-(street|mom|room|phone|window|neighbors|road|oldbike|plan)|n3-(corner|ride|drive|gate|bell|search|voice|close|run|safe))$/.test(c.phase)){const m=this.me();for(const k of L.chapter.companions.all){if(!k.active)continue;const d=Math.hypot((k.mode==='ride'?k.bx:k.px)-m.x,(k.mode==='ride'?k.bz:k.pz)-m.z);if(d>this.gap){this.gap=d;this.gapAt=c.phase;}}}},
  until(fn,max){for(let t=0;t<max;t+=1/30){L.step(1/30);this.watch();if(fn())return true;}return false;},
  me(){const s=L.state;return s.state==='c1-walk'?s.walk:s.roam;},
  face(x,z,p=0){const m=this.me();L.face(Math.atan2(x-m.x,-(z-m.z)),p);},
  walk(pts,{r=.6,max=90,stop=null,sprint=false}={}){let i=0;const ok=this.until(()=>{if(stop?.())return true;const m=this.me();while(i<pts.length&&Math.hypot(pts[i][0]-m.x,pts[i][1]-m.z)<r)i++;if(i>=pts.length)return true;this.face(pts[i][0],pts[i][1]);L.press('KeyW');if(sprint)L.press('ShiftLeft');return false;},max);L.release('KeyW');L.release('ShiftLeft');this.until(()=>false,.3);return ok;},
  // The world's walking paths, stepping round your own parked bike first (they do not know where it is).
  go(q,o={}){const to={x:q.x??q[0],z:q.z??q[1]},m=this.me(),path=L.nav.walkPath({x:m.x,z:m.z},to),pts=path.length?path:[[to.x,to.z]];
   if(L.state.state==='c1-walk'){const r=L.roam,[ax,az]=pts[0],dx=ax-m.x,dz=az-m.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((r.x-m.x)*dx+(r.z-m.z)*dz)/l2)),cx=m.x+dx*t,cz=m.z+dz*t;
    if(Math.hypot(cx-r.x,cz-r.z)<.8){const l=Math.sqrt(l2),nx=-dz/l,nz=dx/l,sg=Math.sign((m.x-r.x)*nx+(m.z-r.z)*nz)||1;pts.unshift([r.x+nx*sg*1.1-dx/l*.2,r.z+nz*sg*1.1-dz/l*.2],[r.x+nx*sg*1.1+dx/l*.9,r.z+nz*sg*1.1+dz/l*.9]);}}
   return this.walk(pts,o);},
  clearBike(){const m=this.me(),r=L.roam,dx=m.x-r.x,dz=m.z-r.z,l=Math.hypot(dx,dz)||1;this.walk([[m.x+dx/l*.9,m.z+dz/l*.9]],{r:.25,max:4});},
  ride(pts,max=150){L.drive(pts,{r:2.6});const ok=this.until(()=>!L.driving,max);L.stopDriving();return ok;},
  brake(){L.release('KeyW');L.press('KeyS');this.until(()=>L.state.speed<.05,8);L.release('KeyS');},
  offBike(){if(L.state.state==='c1-ride'){this.brake();L.key('KeyF');this.until(()=>L.state.state==='c1-walk',4);this.until(()=>false,.3);}},
  onBike(){if(L.state.state==='c1-walk'){const r=L.roam;this.walk([[r.x,r.z]],{r:1.2,max:25});this.face(r.x,r.z);this.until(()=>false,.2);L.key('KeyF');this.until(()=>L.state.state==='c1-ride',4);}},
  near(q,d){const m=this.me(),l=Math.hypot(m.x-q.x,m.z-q.z)||1;return {x:q.x+(m.x-q.x)/l*d,z:q.z+(m.z-q.z)/l*d};},
  S(u,v){const p=B.point(u,v);return [p.x,p.z];},sl(u0,u1,v,st=12){const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(this.S(u0+(u1-u0)*i/n,v));return o;},
  QW(u,v){const p=Q.world(u,v);return [p.x,p.z];},M(d,l){const p=groundPoint(d,l);return [p.x,p.z];},
  prompt(){return L.state.prompt;},C1(){return L.state.chapter;},C3(){return L.state.chapter3;}};}

const SECTIONS=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','service-access-day','old-bike','night-start','old-bike-gone','first-bell','c3-second-bell','alex-voice','close-bell','escape','chapter3-end'];
const EXPECT={'chapter3-start':'d3-corner','c3-alex-house':'d3-street','alex-bedroom':'d3-room','recording':'d3-phone','neighbors':'d3-neighbors','service-access-day':'d3-road','old-bike':'d3-oldbike','night-start':'n3-home',
 'old-bike-gone':'n3-gate','first-bell':'n3-bell','c3-second-bell':'n3-search','alex-voice':'n3-voice','close-bell':'n3-close','escape':'n3-run','chapter3-end':'n3-safe'};
const ORDER=['c3-black','d3-corner','d3-street','d3-mom','d3-room','d3-phone','d3-window','d3-neighbors','d3-road','d3-oldbike','d3-plan','d3-home','c3-night','n3-home','n3-corner','n3-ride','n3-drive','n3-gate','n3-bell','n3-search','n3-voice','n3-close','n3-run','n3-safe','n3-end'];

// The harness steps the game without drawing between captures; in play every frame is drawn and measured.
// So before a capture the caption tone is given what play would have given it: a few drawn frames of the
// current view, measured and fed to the tone (the story does not move meanwhile).
const settled=(page,snap)=>async(name,o)=>{await page.evaluate(()=>new Promise(res=>{const L=lastLight;let i=0;const f=()=>{L.render();L.captionTone.update(.15,{fade:L.state.fade||0});if(++i<12)requestAnimationFrame(f);else res();};requestAnimationFrame(f);}));return snap(name,o);};

// The continuous playthrough, from wherever Chapter Two handed over (c3-black) to the end card.
export async function runChapterThreeBrowser({page,snap:rawSnap,check,state,errors,tag='c3'}){
 const snap=settled(page,rawSnap);
 const ev=(fn,arg)=>page.evaluate(fn,arg),c1=async()=>(await state()).chapter,c3=async()=>(await state()).chapter3,settle=ms=>page.waitForTimeout(ms);
 await ev(installHelpers);const said=l=>ev(l=>__c3.said.includes(l),l);
 // ---- the hand-over: black, CHAPTER THREE, the same corner a few minutes later ----------------------------------
 await ev(()=>__c3.until(()=>document.getElementById('chapter-card').classList.contains('on'),20));await settle(1800);
 await snap(tag+'-00-chapter-three-card');
 check('Chapter Three: black, then a quiet CHAPTER THREE card (no end menu)',await page.locator('#chapter-card.on').isVisible()&&!(await page.locator('#ending').isVisible())&&(await page.locator('#chapter-card h2').textContent())==='Chapter Three');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.line==='“If Alex heard it before he left…”',60));await ev(()=>__c3.until(()=>lastLight.state.fade<.02,6));await settle(400);
 await snap(tag+'-d01-briarwood-opening');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Go to Alex’s house.',60));
 check('Chapter Three: the Briarwood corner in daylight; "Maybe yesterday wasn’t the first time."',(await state()).day===1&&await said('JAMIE: “Maybe yesterday wasn’t the first time.”'));
 // ---- Alex's house and his mom ----------------------------------------------------------------------------------
 await ev(()=>{const C=__c3;C.onBike();lastLight.press('KeyW');C.ride([C.S(10,1.6),...C.sl(10,118,1.6)],120);C.brake();C.until(()=>lastLight.state.chapter3.flags.atHouse,10);const AH=lastLight.world.homes.alex,d=AH.toWorld(AH.doorX,AH.stepFront);C.face(d.x,d.z,.05);C.until(()=>false,.4);});
 await snap(tag+'-d02-alex-house-exterior');
 check('Chapter Three: at Alex’s house: his mom on the porch, a cruiser out front',(await c1()).objective==='Talk to Alex’s mom.'&&await ev(()=>lastLight.chapter.mom.visible&&lastLight.chapter.carB.active));
 await ev(()=>{const C=__c3,mp=lastLight.chapter.mom.pos;C.offBike();C.go(C.near(mp,1.6),{r:.5,max:30,stop:()=>lastLight.state.chapter3.flags.momTalk});C.face(mp.x,mp.z,.08);C.until(()=>false,.4);if(!lastLight.state.chapter3.flags.momTalk)lastLight.key('KeyF');C.until(()=>(lastLight.state.chapter.line||'').includes('bike bell outside'),40);C.until(()=>false,1.2);});
 await snap(tag+'-d03-alex-mom');
 check('Chapter Three: his mom: he kept asking if she heard a bike bell outside',await said('ALEX’S MOM: “He kept asking if I heard a bike bell outside. At night.”'));
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Go up to Alex’s room.',90));
 // ---- his room, his phone, his window ------------------------------------------------------------------------------
 await ev(()=>{const C=__c3,AH=lastLight.world.homes.alex,door=AH.toWorld(AH.doorX,AH.stepFront+.7);C.go(door,{r:.5,max:30});C.face(door.x,door.z);C.until(()=>false,.3);});
 check('Chapter Three: "Go inside" at his front door',(await state()).prompt==='F:Go inside');
 await ev(()=>{lastLight.key('KeyF');__c3.until(()=>lastLight.state.chapter3.inRoom&&lastLight.state.fade<.03,10);__c3.until(()=>false,1.2);});
 await snap(tag+'-d04-bedroom-first-person');
 check('Chapter Three: in Alex’s room, on foot, first person, Jamie and Sam with you',(await c3()).inRoom&&(await state()).state==='c1-walk'&&await ev(()=>lastLight.chapter.companions.all.every(c=>lastLight.nav.locate(c.px,c.pz).street==='room')));
 // A wide look at the room from its corner (a QA camera for one frame).
 await ev(()=>{const L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW,a=RW(R.x1-.3,R.z1-.3,1.75),b=RW((R.x0+R.x1)/2-.4,(R.z0+R.z1)/2-.5,.85);L.camera.position.set(a.x,a.y,a.z);L.camera.lookAt(b.x,b.y,b.z);L.camera.updateMatrixWorld();});
 await snap(tag+'-d04b-bedroom-wide',{clean:true});
 await ev(()=>{const C=__c3,L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW,ph=L.chapter3.phone.position;C.go(RW(R.deskStand.x,R.deskStand.z),{r:.25,max:20});C.face(ph.x,ph.z,-.6);C.until(()=>L.state.chapter.objective==='Listen to Alex’s recordings.',40);C.until(()=>false,.3);});
 check('Chapter Three: his phone on the desk: "Listen to his recordings"',(await state()).prompt==='F:Listen to his recordings');
 await ev(()=>{const C=__c3,L=lastLight;L.key('KeyF');C.until(()=>L.state.chapter.phase==='d3-phone',4);C.until(()=>false,1.4);C.until(()=>/^F:(Play|Next recording)$/.test(L.state.prompt),40);L.key('KeyF');C.until(()=>L.state.chapter3.recPlaying===0&&(L.state.caption||'').includes('cracking up'),8);});
 await snap(tag+'-d05a-phone-first-recording');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.recPlaying<0&&!L.state.chapter.line,45);C.until(()=>false,.6);
  for(let i=1;i<5;i++){C.until(()=>/^F:(Play|Next recording)$/.test(L.state.prompt),40);L.key('KeyF');if(i===4)break;C.until(()=>L.state.chapter3.recPlaying<0&&!L.state.chapter.line,45);C.until(()=>false,.6);}
  C.until(()=>(L.state.caption||'').includes('A bike bell. Outside.'),20);C.until(()=>false,.6);});
 await snap(tag+'-d05-phone-recording-the-bell');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Look out his window.',60));
 check('Chapter Three: four ordinary recordings, then the night before: the bell twice, "There it is again."',await ev(()=>{const c=__c3.caps.join('\n');return ['[Jamie and Sam, cracking up]','[A TV downstairs. A game show. Applause.]','[A bike bell. Outside.]','[The bell again.]','“There it is again.”'].every(x=>c.includes(x))&&JSON.stringify(lastLight.state.chapter3.heard)==='[0,1,2,3,4]';}));
 await ev(()=>{const C=__c3,L=lastLight,R=L.world.interiors['alex-room'],RW=L.chapter3.RW,sw=RW(R.sideWindow.x,R.sideWindow.z),lk=RW(R.sideWindow.look.x,R.sideWindow.look.z);C.go(sw,{r:.3,max:20});C.face(lk.x,lk.z,-.1);C.until(()=>L.state.chapter3.flags.window,6);if(!L.state.chapter3.flags.window)L.key('KeyF');C.until(()=>L.state.chapter.line==='“That’s the creek. Behind the trees.”',20);C.until(()=>false,.8);});
 await snap(tag+'-d06-bedroom-window-view');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Ask around near the creek.',50);C.until(()=>false,1.5);const R=L.world.interiors['alex-room'],RW=L.chapter3.RW,dr=RW(R.door.x,R.door.z),f=RW(R.door.face.x,R.door.face.z);C.go(dr,{r:.3,max:20});C.face(f.x,f.z);C.until(()=>false,.2);});
 check('Chapter Three: "Go back outside" at his door',(await state()).prompt==='F:Go back outside');
 await ev(()=>{lastLight.key('KeyF');__c3.until(()=>lastLight.state.chapter.phase==='d3-neighbors'&&!lastLight.state.chapter3.inRoom&&lastLight.state.fade<.03,10);});
 // ---- the neighbors ---------------------------------------------------------------------------------------------
 const talkTo=async(key,shot)=>{await ev(key=>{const C=__c3,L=lastLight,a=L.chapter3.people[key];C.go(C.near(a,1.8),{r:.6,max:60});C.face(a.x,a.z,.06);C.until(()=>/^F:Talk to /.test(L.state.prompt),6);if(!/^F:Talk to /.test(L.state.prompt)){C.walk([[a.x,a.z]],{r:1.5,max:8});C.face(a.x,a.z,.06);C.until(()=>/^F:Talk to /.test(L.state.prompt),6);}__c3.lastPrompt=L.state.prompt;L.key('KeyF');C.until(()=>(L.state.chapter.speaker||'').startsWith('M'),8);C.until(()=>false,1.2);},key);
  if(shot)await snap(shot);await ev(key=>__c3.until(()=>lastLight.state.chapter3.talked.includes(key)&&!lastLight.state.chapter.line&&lastLight.state.chapter.queue===0,40),key);await ev(()=>__c3.until(()=>false,.5));};
 await talkTo('huang',tag+'-d07-neighbor-across-the-street');await talkTo('delaney');await talkTo('okafor',tag+'-d07b-neighbor-okafor-the-pond-road');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Find the old pond road.',20));
 check('Chapter Three: the neighbors: earplugs, teenagers; Mr. Okafor knows the old pond road',await said('MR. HUANG: “A bell? No. I’m asleep by ten. Earplugs.”')&&await said('MR. OKAFOR: “It runs back to the retention pond. The big drain from the creek comes out back there.”'));
 // ---- the pond road, the old bike, its bell ---------------------------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight,SP=L.world.basin.spots,E=L.world.basin.E;C.go({x:SP.driveMouth.x,z:SP.driveMouth.z},{r:.8,max:60});const q=C.QW(E.drive.u,30);C.face(q[0],q[1],.02);C.until(()=>false,.5);});
 await snap(tag+'-d08-service-road');
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.walk([C.QW(E.drive.u,14),C.QW(E.drive.u,24)],{max:40});C.walk([C.QW(E.drive.u,30),C.QW(E.drive.u-.2,36)],{max:30,stop:()=>L.state.chapter3.flags.oldBike});C.until(()=>L.state.chapter.line==='“I said I didn’t remember it.”',40);const b=L.chapter3.old.group.position;C.face(b.x,b.z,-.12);C.until(()=>false,.8);});
 await snap(tag+'-d09-old-bike-at-the-gate');
 check('Chapter Three: the old bike from the oak at the gate; Sam: "I said I didn’t remember it."',(await c3()).oldBike&&await said('SAM: “I said I didn’t remember it.”'));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Look at the bicycle.',40);const b=L.chapter3.old.group.position;C.go(C.near(b,1.5),{r:.3,max:20});C.face(b.x,b.z,-.4);C.until(()=>false,.3);});
 check('Chapter Three: F looks at the bike',(await state()).prompt==='F:Look at the bike');
 await ev(()=>{const C=__c3,L=lastLight;L.key('KeyF');C.until(()=>(L.state.chapter.line||'').includes('Bicycle license'),20);C.until(()=>false,.6);});
 await snap(tag+'-d09b-old-bike-close-sticker');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Try the bell.',30);L.key('KeyF');C.until(()=>false,.14);});
 await snap(tag+'-d10-broken-bell-pressed');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>false,1.4);L.key('KeyF');C.until(()=>L.state.chapter3.flags.evidence||L.state.chapter.line==='“Somebody wheeled it in here. Like, today.”',30);});
 await snap(tag+'-d10b-flattened-grass');
 await ev(()=>__c3.until(()=>lastLight.state.chapter.objective==='Go home.',120));
 check('Chapter Three: the bell only clicks; somebody wheeled it in today; they will come back tonight',await said('SAM: “It doesn’t even ring.”')&&await said('JAMIE: “Somebody wheeled it in here. Like, today.”')&&await said('JAMIE: “Eleven. The corner. Bring a flashlight.”'));
 // ---- that night ------------------------------------------------------------------------------------------------
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.walk([C.QW(E.drive.u,30),C.QW(E.drive.u,20)],{max:30});C.until(()=>L.state.chapter.phase==='n3-home',40);C.until(()=>L.state.fade<.03,8);});
 await snap(tag+'-n00-that-night-home');
 check('Chapter Three: that night, the same street, dark; "Meet Jamie and Sam at the corner."',(await state()).day===0&&(await c1()).objective==='Meet Jamie and Sam at the corner.');
 await ev(()=>{const C=__c3,L=lastLight;C.onBike();const m=C.me(),Lc=L.nav.locate(m.x,m.z);L.press('KeyW');const pts=[C.M(Lc.d+4,-2.4)];for(let d=Lc.d+24;d<=590;d+=20)pts.push(C.M(d,-2.2));pts.push(C.M(590,-2.2));C.ride(pts,120);C.brake();C.until(()=>L.state.chapter.line==='“You came.”',30);C.until(()=>false,.9);});
 await snap(tag+'-n01-meeting-at-the-corner');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.phase==='n3-ride',30);L.press('KeyW');C.ride([C.M(596,3),C.S(10,1.6),...C.sl(10,82,1.6)],80);});
 await snap(tag+'-n02-night-ride-briarwood');
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.ride(C.sl(82,139,1.6),80);C.brake();C.until(()=>L.state.chapter.phase==='n3-drive',10);C.offBike();if(!L.state.onFoot.on)L.key('KeyT');C.clearBike();C.go(C.QW(E.drive.u,9),{max:40});const q=C.QW(E.drive.u,30);C.face(q[0],q[1],-.05);C.until(()=>false,.5);});
 await snap(tag+'-n03-pond-road-at-night');
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.walk([C.QW(E.drive.u,12),C.QW(E.drive.u,20),C.QW(E.drive.u,28)],{max:40,stop:()=>L.state.chapter.line==='“Why’d everything stop?”'});C.until(()=>L.state.chapter.line==='“Why’d everything stop?”',20);C.until(()=>false,.8);});
 await snap(tag+'-n04-ambience-drop');
 check('Chapter Three: down the pond road the night sounds go; Sam: "Why’d everything stop?"',await said('SAM: “Why’d everything stop?”')&&await ev(()=>{const a=lastLight.chapter3.amb;return a.traffic<.3&&a.wind>.3;}));
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.walk([C.QW(E.drive.u,28),C.QW(E.drive.u,33),C.QW(E.drive.u,37)],{max:40});C.until(()=>L.state.chapter3.flags.gone,30);C.until(()=>L.state.chapter.line==='“It was right here.”',12);const g=L.world.basin.spots.gate;C.face(g.x,g.z,-.1);C.until(()=>false,.6);});
 await snap(tag+'-n05-empty-gate');
 check('Chapter Three: the bike is gone: "It was right here." "Okay. I saw it this time."',await ev(()=>!lastLight.chapter3.old.group.visible)&&await ev(()=>__c3.until(()=>__c3.said.includes('SAM: “Okay. I saw it this time.”'),10)));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.bell1,30);C.until(()=>L.state.chapter.line==='“Did you hear that?”',8);C.until(()=>false,.5);});
 await snap(tag+'-n06-first-bell-reaction');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.objective==='Find where the bell came from.',30);C.walk([C.QW(142.9,40.4),C.QW(142.9,42.6),C.QW(143.2,44.4)],{r:.35,max:30});C.go(C.QW(152,49.5),{max:40});const o=L.world.basin.spots.outlet;C.face(o.x,o.z,-.12);C.until(()=>false,.5);});
 await snap(tag+'-n07-basin-flashlight-search');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.bell2,40);C.until(()=>L.state.chapter.line==='“It moved.”',12);C.until(()=>false,.5);});
 await snap(tag+'-n07b-second-bell-it-moved');
 {const r=await ev(()=>{__c3.until(()=>lastLight.state.chapter3.bells.length>=3,6);const b=lastLight.state.chapter3.bells;return {ok:b.length>=3&&Math.hypot(b[1].pos.x-b[2].pos.x,b[1].pos.z-b[2].pos.z)>10,bells:b.map(x=>[x.pos.x,x.pos.z,+x.at.toFixed(1),!!x.tunnel]),t:lastLight.chapter3.C.t,phase:lastLight.state.chapter.phase};});
  check('Chapter Three: a second bell, closer, then from somewhere else'+(r.ok?'':' '+JSON.stringify(r)),r.ok);}
 await ev(()=>{const C=__c3,L=lastLight,SP=L.world.basin.spots,m=C.me();C.go({x:SP.apron.x+(m.x-SP.apron.x)*.15,z:SP.apron.z+(m.z-SP.apron.z)*.15},{max:30});C.face(SP.outlet.x,SP.outlet.z,-.1);C.until(()=>false,1);});
 await snap(tag+'-n08-culvert-approach');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.voice1,40);C.until(()=>false,.7);});
 await snap(tag+'-n09-alex-voice-from-the-culvert');
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.voice2,30);C.until(()=>L.state.chapter.line==='“That came from back there.”',10);C.until(()=>false,.3);});
 await snap(tag+'-n10-impossible-direction-guys');
 // You turn to where it came from: nothing there (the close bell follows a moment after you have looked).
 await ev(()=>{const C=__c3,L=lastLight,q=L.state.chapter3.voices[1].pos;C.face(q.x,q.z,0);C.until(()=>false,.7);});
 await snap(tag+'-n10b-turned-nothing-there');
 check('Chapter Three: "Jamie?" from deep in the culvert, then "Guys?" from behind',await ev(()=>{const v=lastLight.state.chapter3.voices;return v.length===2&&v[0].word==='jamie'&&v[0].tunnel&&v[1].word==='guys'&&v[1].dot<-.2;}));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter3.flags.close,12);C.until(()=>false,.35);});
 await snap(tag+'-n11-close-bell');
 check('Chapter Three: you turn: nothing; then the bell right behind you, nothing there either',await ev(()=>{const b=lastLight.state.chapter3.bells.at(-1),c=lastLight.camera.position;return b.close&&Math.hypot(b.pos.x-c.x,b.pos.z-c.z)<1.6&&lastLight.state.tension.value>.9;}));
 await ev(()=>{const C=__c3,L=lastLight;C.until(()=>L.state.chapter.phase==='n3-run',8);C.walk([C.QW(148,47),C.QW(147.4,44.2),C.QW(143.6,44)],{r:.5,max:30,sprint:true});const q=C.QW(142.9,40.4);C.face(q[0],q[1],-.05);});
 await snap(tag+'-n12-escape-through-the-fence');
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.walk([C.QW(142.9,42.8),C.QW(142.9,40.4),C.QW(E.drive.u,33),C.QW(E.drive.u,24)],{r:.5,max:40,sprint:true});});
 await snap(tag+'-n12b-escape-down-the-pond-road');
 await ev(()=>{const C=__c3,L=lastLight,E=L.world.basin.E;C.walk([C.QW(E.drive.u,14),C.QW(E.drive.u,6.5)],{r:.5,max:40,sprint:true});C.until(()=>L.state.chapter.phase==='n3-safe',20);C.until(()=>L.state.chapter.line==='“That was him.”',30);C.until(()=>false,.6);});
 await snap(tag+'-n13-safe-street');
 check('Chapter Three: out under the street light; "That was him." "No."',(await c1()).phase==='n3-safe'&&await said('SAM: “That was him.”'));
 await ev(()=>__c3.until(()=>lastLight.state.state==='ended',60));
 await page.waitForFunction(()=>!document.querySelector('#ending').hidden&&Number(getComputedStyle(document.querySelector('#ending')).opacity)>.99);
 await snap(tag+'-n14-chapter-three-end');
 check('Chapter Three: "You heard it." "I know." then LAST LIGHT / Chapter Three',await said('SAM: “You heard it. It said your name.”')&&await said('JAMIE: “I know.”')&&(await page.locator('#ending h2').textContent())==='Chapter Three');
 const run=await ev(()=>({phases:__c3.phases.filter(p=>/^(c3|d3|n3)-/.test(p)),gap:__c3.gap,gapAt:__c3.gapAt,peak:Math.max(...__c3.tension),said:__c3.said.length}));
 check('Chapter Three: every phase in order in the browser',JSON.stringify(run.phases)===JSON.stringify(ORDER));
 check('Chapter Three: Jamie and Sam stayed with you (max gap '+run.gap.toFixed(1)+' m at '+run.gapAt+')',run.gap<30);
 check('Chapter Three playthrough: no JavaScript or shader errors',errors.length===0);
 return run;
}

// After the playthroughs: every QA jump rendered, Continue, the captions with real readback, the setting, the glimpse, audio.
export async function runChapterThreeJumps({page,snap:rawSnap,check,state,errors,out,fs,path,tag='c3'}){
 const snap=settled(page,rawSnap),ev=(fn,arg)=>page.evaluate(fn,arg);await ev(installHelpers);
 for(const sec of SECTIONS){await ev(sec=>{lastLight.jump(sec);lastLight.step(2.5);},sec);await page.waitForTimeout(1600);await snap('qa-jump-'+sec);
  const s=await state();check('QA jump '+sec+' lands in '+EXPECT[sec],[EXPECT[sec],...(sec==='close-bell'?['n3-run']:[]),...(sec==='first-bell'?['n3-search']:[])].includes(s.chapter.phase)&&Number.isFinite(s.roam.x)&&s.state.startsWith('c1-')&&s.day===(EXPECT[sec].startsWith('d3-')?1:0));}
 // Continue from the title after a Chapter Three checkpoint.
 await ev(()=>{lastLight.jump('first-bell');lastLight.step(1);lastLight.toTitle();lastLight.step(.2);});
 check('Continue is offered on the title from a Chapter Three checkpoint',await page.locator('#continue').isVisible()&&/first bell/i.test(await page.locator('#continue-where').textContent()));await snap(tag+'-title-continue');
 await page.click('#continue');await ev(()=>lastLight.step(1.5));check('Continue returns to the first bell',['n3-bell','n3-search'].includes((await state()).chapter.phase)&&(await state()).day===0);
 // The glimpse, forced for one frame (in play it is brief, far, and only if you happen to look): a QA view, not a story frame.
 await ev(()=>{const L=lastLight;L.jump('c3-second-bell');L.step(.5);const C=L.chapter3,g=C.glimpseAt;C.figure.group.visible=true;C.glimpseBike.group.visible=true;const m=__c3.me();L.camera.position.set(m.x,L.nav.groundY(m.x,m.z)+1.45,m.z);L.camera.lookAt(g.x,g.y+.6,g.z);L.camera.updateMatrixWorld();});
 await snap(tag+'-qa-glimpse-forced-for-review',{clean:true});await ev(()=>{const C=lastLight.chapter3;C.figure.group.visible=false;C.glimpseBike.group.visible=false;});
 // ---- captions: measured with the frame's own pixels behind the words ---------------------------------------------
 const capCase=async(name,setup,want=null)=>{const r=await ev(async([setup])=>{const L=lastLight;await (0,eval)('('+setup+')')(L,__c3);const S=L.chapter.kit.S;S.queue.length=0;S.line=null;L.chapter.kit.talk([{who:'JAMIE',text:'“Can you read this? It should be easy to read here.”',time:40}]);
   // Frames driven by the browser's own animation frames, as in play: the readback is asynchronous (a fence
   // the browser resolves between frames), a few times a second; four fresh measurements at least.
   const n0=L.captionTone.state.samples;await new Promise(res=>{let i=0;const f=()=>{L.render();L.step(.12);if(++i<60&&(i<14||L.captionTone.state.samples<n0+4))requestAnimationFrame(f);else res();};requestAnimationFrame(f);});const st=L.captionTone.state,el=document.getElementById('subtitle'),cs=getComputedStyle(el);return {...st,bg:cs.backgroundColor,border:cs.borderTopWidth,color:cs.color,shown:el.style.opacity==='1'&&(el.textContent||'').length>3,text:(el.textContent||'').slice(0,60),opacity:cs.opacity,styleOpacity:el.style.opacity};},[setup.toString()]);
  await snap('caption-'+name);
  // Contrast is against the brightest (or darkest) sixth of the strip behind the words; where that is
  // low (a lit patch inside a dark strip), the opposite-tone edge round each letter is strengthened.
  const ok=r.source==='frame'&&(r.contrast>=3||r.contrast>=2&&r.halo>=.7||r.scrim>=.5)&&/rgba\(0, 0, 0, 0\)|transparent/.test(r.bg)&&r.border==='0px'&&(!want||r.mode===want)&&r.shown;
  check(`captions over ${name}: ${r.mode} words, worst-case contrast ${r.contrast}:1 measured from the frame (edge ${r.halo}${r.scrim?', glow '+r.scrim:''}), no box`+(ok?'':' '+JSON.stringify(r)),ok);await ev(()=>{const S=lastLight.chapter.kit.S;S.queue.length=0;S.line=null;});return {name,...r};};
 const caps=[];
 caps.push(await capCase('night-asphalt',(L,C)=>{L.jump('night-start');L.step(4);L.face(L.roam.a,-.5);},'light'));
 caps.push(await capCase('day-grass',(L,C)=>{L.jump('neighbors');L.step(2);const AH=L.world.homes.alex,p=AH.toWorld(-AH.w/2-2.5,AH.front+3.5);C.face(p.x,p.z,-.6);L.step(.1);}));
 caps.push(await capCase('culvert-darkness',(L,C)=>{L.jump('alex-voice');L.step(1);const o=L.world.basin.spots.outlet;C.face(o.x,o.z,-.05);L.step(.2);},'light'));
 caps.push(await capCase('flashlight-hotspot',(L,C)=>{L.jump('c3-second-bell');L.step(1);if(!L.state.onFoot.on)L.key('KeyT');L.face(L.state.walk.a,-.9);L.step(.2);}));
 caps.push(await capCase('bright-house-siding',(L,C)=>{L.jump('neighbors');L.step(1);const AH=L.world.homes.alex,p=AH.toWorld(-AH.w/4,AH.front),m=C.me();C.go({x:p.x+(m.x-p.x)*.35,z:p.z+(m.z-p.z)*.35},{max:20});C.face(p.x,p.z,.12);L.step(.2);}));
 caps.push(await capCase('streetlight',(L,C)=>{L.jump('chapter3-end');L.step(2);L.face(L.state.walk.a,.05);}));
 caps.push(await capCase('daylight-sky',(L,C)=>{L.jump('old-bike');L.step(1);L.face(L.state.walk.a,1.1);},'dark'));
 caps.push(await capCase('memory',(L,C)=>{L.jump('memory-reconstruction');L.step(6);}));
 caps.push(await capCase('police-lights',(L,C)=>{L.jump('alex-house');L.step(3);}));
 // Sweeping from bright sky down to dark ground and back: one change of tone each way at most, never a flicker.
 const sweep=await ev(async()=>{const L=lastLight;L.jump('old-bike');L.step(1);L.chapter.kit.talk([{who:'SAM',text:'“Okay. Sweeping the view.”',time:60}]);const a=L.state.walk.a;let prev=null;const trace=[],flips=[],lums=[];
  return new Promise(res=>{let i=0;const f=()=>{const t=i/80,p=1.1-2.2*Math.abs(Math.sin(t*Math.PI));L.face(a,p);L.render();L.step(.1);const st=L.captionTone.state,m=st.mode;if(prev&&m!==prev)flips.push(i);prev=m;trace.push(m[0]);lums.push(st.lum);
   if(++i<=80)requestAnimationFrame(f);else{const S=L.chapter.kit.S;S.queue.length=0;S.line=null;const gaps=flips.slice(1).map((x,k)=>(x-flips[k])*.1);res({flips:flips.length,minSecondsBetween:gaps.length?Math.min(...gaps):null,trace:trace.join(''),lums:lums.map(v=>+v.toFixed(3)),samples:st.samples});}};requestAnimationFrame(f);});});
 // Up into the sky, down to the sunlit ground at your feet and back: the tone follows what is behind the words
 // (it may change several times), but never flickers: each tone is held for most of a second at least.
 check('captions: sweeping the view sky → ground → sky follows the background without flicker ('+sweep.flips+' changes, at least '+sweep.minSecondsBetween+' s apart: '+sweep.trace+')',sweep.flips<=8&&(sweep.minSecondsBetween===null||sweep.minSecondsBetween>=.6));
 // The captions setting still hides spoken captions.
 const setting=await ev(()=>{const L=lastLight,S=L.chapter.kit.S,el=document.getElementById('subtitle'),clear=()=>{S.queue.length=0;S.line=null;};L.jump('first-bell');L.step(.5);
  clear();L.ui.settings.captions=false;L.chapter.kit.talk([{who:'JAMIE',text:'“Hidden by the setting.”',time:3}]);L.step(.6);const hidden=el.style.opacity==='0'&&L.state.chapter.line==='“Hidden by the setting.”';
  clear();L.ui.settings.captions=true;L.chapter.kit.talk([{who:'JAMIE',text:'“Shown again.”',time:3}]);L.step(.6);const shown=el.style.opacity==='1'&&el.textContent.includes('Shown again');return {hidden,shown};});
 check('captions: turning them off in Settings still hides them; on again shows them',setting.hidden&&setting.shown);
 check('Chapter Three jumps and captions: no JavaScript or shader errors',errors.length===0);
 return {captions:caps,sweep};
}

// Offline renders of the sounds Chapter Three adds. Signal checks only: finite, not clipped, present
// where they should be, silent where they should be; the heartbeat measured against tension.
export async function runChapterThreeAudio({page,check,out,fs,path}){
 const clips=await page.evaluate(async()=>{const {createAudio}=await import('./audio.js'),{createTension}=await import('./tension.js');const res=[];
  const night={speed:0,pedal:false,coasting:false,onBike:false,surface:'grass',p:1,night:1,deep:.4,finale:40,friendsLeft:0,state:'c1-walk',crank:0,night1:true,listener:{x:0,y:1.5,z:0},forward:{x:0,z:-1},sources:[]};
  // (The body and the one-shots are rendered with the night's layers off, so each is measured on its own.)
  const quiet={traffic:0,insects:0,wind:0,life:0};
  const cases=[['c3-heartbeat-calm',{tension:.1,amb:quiet}],['c3-heartbeat-uneasy',{tension:.35,amb:quiet}],['c3-heartbeat-afraid',{tension:.65,amb:quiet}],['c3-heartbeat-panic',{tension:1,amb:quiet}],['c3-heartbeat-rising',{rise:true,amb:quiet}],
   ['c3-night-ambience-full',{amb:{traffic:1,insects:1,wind:1,life:1}}],['c3-night-ambience-gone',{amb:{traffic:0,insects:0,wind:.45,life:0}}],
   ['c3-bell-in-the-culvert',{amb:quiet,bell:[{x:-2,y:1,z:-26},1.35,{tunnel:true,ref:5}]}],['c3-bell-from-the-slope',{amb:quiet,bell:[{x:14,y:1.5,z:-18},.85,{ref:5}]}],['c3-bell-right-behind',{amb:quiet,bell:[{x:0,y:1.25,z:1.15},.62,{ref:1}]}],
   ['c3-voice-jamie-in-the-culvert',{amb:quiet,voice:['jamie',{x:-1,y:1,z:-14},{gain:1,tunnel:true,ref:3}]}],['c3-voice-guys-behind',{amb:quiet,voice:['guys',{x:2,y:1.3,z:12},{gain:1.05,ref:3}]}],
   ['c3-recording-1',{amb:quiet,rec:0}],['c3-recording-2',{amb:quiet,rec:1}],['c3-recording-3',{amb:quiet,rec:2}],['c3-recording-4',{amb:quiet,rec:3}],['c3-recording-5-the-night-before',{amb:quiet,rec:4}],['c3-old-bell-click',{amb:quiet,sfx:'oldBell'}],['c3-chain-link',{amb:quiet,sfx:'fence'}]];
  for(const [name,c] of cases){const dur=c.rec===4?25:c.rec!==undefined?11:8,ctx=new OfflineAudioContext(2,48000*dur,48000);let seed=2011;const audio=createAudio({context:ctx,random:()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}});audio.ensure();audio.setEnabled(true);
   const T=createTension();if(c.tension!==undefined){T.value=T.target=c.tension;}
   // Drive the per-frame update on the offline clock (suspend, update, resume), a frame every 1/30 s.
   const frames=Math.round(dur*30),rendering=(()=>{for(let i=1;i<frames;i++)ctx.suspend(i/30).then(()=>{if(c.rise&&i===30)T.jolt(1,{rise:.35,hold:30});T.update(1/30);audio.update(1/30,{...night,amb:c.amb,heart:(c.tension!==undefined||c.rise)?T.heart:null});if(i===15){if(c.bell)audio.bell3(...c.bell);if(c.voice)audio.voice(...c.voice);if(c.rec!==undefined)audio.recording(c.rec,{x:.2,y:1,z:-.45});if(c.sfx)audio.sfx(c.sfx,{x:0,y:1,z:-1.5});}ctx.resume();});return ctx.startRendering();})();
   if(c.rise)T.value=T.target=.25;
   const b=await rendering,ch=[b.getChannelData(0),b.getChannelData(1)];let peak=0,sum=0,nonFinite=0,jump=0;for(const a of ch)for(let i=0;i<a.length;i++){peak=Math.max(peak,Math.abs(a[i]));sum+=a[i]*a[i];if(!Number.isFinite(a[i]))nonFinite++;if(i)jump=Math.max(jump,Math.abs(a[i]-a[i-1]));}
   // Low-band energy per 50 ms (the heartbeat lives below 150 Hz): the onsets of each beat.
   let beats=0;if(name.startsWith('c3-heartbeat')){const win=2400,e=[];for(let i=0;i+win<=b.length;i+=win){let s=0;for(let j=i;j<i+win;j+=8)s+=ch[0][j]*ch[0][j];e.push(s);}const mx=Math.max(...e);for(let i=1;i<e.length;i++)if(e[i]>mx*.25&&e[i-1]<=mx*.25)beats++;}
   const pcm=new Int16Array(b.length*2);for(let i=0;i<b.length;i++)for(let k=0;k<2;k++)pcm[i*2+k]=Math.round(Math.max(-1,Math.min(1,ch[k][i]))*32767);const bytes=new Uint8Array(pcm.buffer);let bin='';for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode(...bytes.subarray(i,i+8192));
   res.push({name,peak,rms:Math.sqrt(sum/(b.length*2)),nonFinite,maxSampleJump:jump,beats,seconds:dur,pcm:btoa(bin)});}
  return res;});
 // Signal-validation renders, kept small: 24 kHz (pairs of samples averaged), stereo only where placement matters.
 const wav=(raw,stereo)=>{const src=new Int16Array(Uint8Array.from(raw).buffer),frames=Math.floor(src.length/4),ch=stereo?2:1,pcm=Buffer.alloc(frames*ch*2);
  for(let i=0;i<frames;i++){const l=(src[i*4]+src[i*4+2])/2,r=(src[i*4+1]+src[i*4+3])/2;if(stereo){pcm.writeInt16LE(Math.round(l),i*4);pcm.writeInt16LE(Math.round(r),i*4+2);}else pcm.writeInt16LE(Math.round((l+r)/2),i*2);}
  const b=Buffer.alloc(44+pcm.length);b.write('RIFF',0);b.writeUInt32LE(36+pcm.length,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(ch,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(24000*ch*2,28);b.writeUInt16LE(ch*2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(pcm.length,40);pcm.copy(b,44);return b;};
 const dir=path.join(out,'audio');fs.mkdirSync(dir,{recursive:true});const by={};
 for(const c of clips){fs.writeFileSync(path.join(dir,c.name+'.wav'),wav(Buffer.from(c.pcm,'base64'),/bell|voice/.test(c.name)));delete c.pcm;by[c.name]=c;if(c.name!=='c3-heartbeat-calm')check('audio signal (Chapter Three) finite and unclipped: '+c.name,c.nonFinite===0&&c.peak<.95&&c.peak>1e-5);}
 check('audio signal: calm is silent (no heartbeat below the threshold)',by['c3-heartbeat-calm'].nonFinite===0&&by['c3-heartbeat-calm'].rms<by['c3-heartbeat-uneasy'].rms*.5+1e-6);
 check('audio signal: the heartbeat grows with tension (uneasy < afraid < panic) and quickens',by['c3-heartbeat-uneasy'].rms<by['c3-heartbeat-afraid'].rms&&by['c3-heartbeat-afraid'].rms<by['c3-heartbeat-panic'].rms&&by['c3-heartbeat-panic'].beats>by['c3-heartbeat-uneasy'].beats);
 check('audio signal: the night with its layers gone is much quieter than the ordinary night',by['c3-night-ambience-gone'].rms<by['c3-night-ambience-full'].rms*.6);
 check('audio signal: the bell right behind is louder than the bell in the culvert',by['c3-bell-right-behind'].peak>by['c3-bell-in-the-culvert'].peak);
 return clips;
}
