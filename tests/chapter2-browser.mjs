// Chapter Two in a real browser (Chromium, WebGL): played on from the end of Chapter One the way a
// player would (walking with W and the mouse heading, riding, F where the prompt says), with a
// rendered capture at each beat, then every Chapter Two QA jump, lingering, the wrong way, Continue,
// and the audio clips Chapter Two adds. Called from browser.mjs. Captures go to the QA folder.

// Page-side helpers (run inside the page).
function installHelpers(){const L=lastLight,F=L.world.easement;
 window.__c2={said:[],last:'',phases:[],caps:[],
  watch(){const s=L.state.chapter;if(s.line&&s.line!==this.last){this.last=s.line;this.said.push((s.speaker||'')+': '+s.line);}if(this.phases[this.phases.length-1]!==s.phase)this.phases.push(s.phase);const c=L.state.caption;if(c&&this.caps[this.caps.length-1]!==c)this.caps.push(c);},
  until(fn,max){for(let t=0;t<max;t+=1/30){L.step(1/30);this.watch();if(fn())return true;}return false;},
  me(){const s=L.state;return s.state==='c1-walk'?s.walk:s.roam;},
  face(x,z,p=0){const m=this.me();L.face(Math.atan2(x-m.x,-(z-m.z)),p);},
  walk(pts,{r=.6,max=90,stop=null}={}){let i=0;const ok=this.until(()=>{if(stop?.())return true;const m=this.me();while(i<pts.length&&Math.hypot(pts[i][0]-m.x,pts[i][1]-m.z)<r)i++;if(i>=pts.length)return true;this.face(pts[i][0],pts[i][1]);L.press('KeyW');return false;},max);L.release('KeyW');this.until(()=>false,.3);return ok;},
  walkPath(q,o){const m=this.me(),p=L.nav.walkPath({x:m.x,z:m.z},{x:q.x,z:q.z});return this.walk(p.length?p:[[q.x,q.z]],o);},
  ride(pts,max=150){L.drive(pts,{r:2.6});const ok=this.until(()=>!L.driving,max);L.stopDriving();return ok;},
  brake(){L.release('KeyW');L.press('KeyS');this.until(()=>L.state.speed<.05,8);L.release('KeyS');},
  E(s,t){const p=F.world(s,t);return [p.x,p.z];},path(s){return this.E(s,F.pathT(s));},
  async M(d,l){const {groundPoint}=await import('./route.js');const p=groundPoint(d,l);return [p.x,p.z];},
  async line(d0,d1,l,st=20){const o=[];const n=Math.ceil(Math.abs(d1-d0)/st);for(let i=1;i<=n;i++)o.push(await this.M(d0+(d1-d0)*i/n,l));return o;}};}

export async function runChapterTwoBrowser({page,snap,check,state,errors,exploratory=false}){
 const ev=(fn,arg)=>page.evaluate(fn,arg),cstate=async()=>(await state()).chapter,c2=async()=>(await state()).chapter2;
 await ev(installHelpers);
 // Let CSS transitions (card, fade, objective) finish in real time before a capture.
 const settle=ms=>page.waitForTimeout(ms);
 // ---- the hand-over: black, CHAPTER TWO, the same creek -----------------------------------------
 await ev(()=>__c2.until(()=>document.getElementById('chapter-card').classList.contains('on'),12));await settle(2000);
 await snap('c2-01-chapter-two-card');
 check('Chapter Two: black, then a quiet CHAPTER TWO card (no end menu)',await page.locator('#chapter-card.on').isVisible()&&!(await page.locator('#ending').isVisible())&&(await page.locator('#chapter-card h2').textContent())==='Chapter Two');
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='c2-decide',14));await settle(1900);
 await ev(()=>__c2.until(()=>lastLight.state.chapter.line==='“We should go get the cops.”',12));await snap('c2-02-same-creek-moments-later');
 check('Chapter Two: the same creek moments later, the first words heard over black',await ev(()=>__c2.said.slice(0,2).join('|')==='JAMIE: “You guys heard that too, right?”|SAM: “Yeah.”'));
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='c2-follow',40));
 check('Chapter Two: the disagreement plays out; "Follow the sound."',(await cstate()).objective==='Follow the sound.'&&await ev(()=>['JAMIE: “And tell them what? We heard a bike bell?”','YOU: “His reflector’s here.”','JAMIE: “Just a little farther.”'].every(l=>__c2.said.includes(l))));
 // ---- through the gap -----------------------------------------------------------------------------
 await ev(()=>{const C=__c2,g=lastLight.world.easement.spots.gap;C.walkPath(g,{max:60});C.face(...C.path(3),-.05);C.until(()=>false,.4);});await snap('c2-03-fence-gap');
 await ev(()=>{const C=__c2;C.walk([.6,1.4,2.4,3.6,5,6.5].map(s=>C.path(s)),{max:30});});
 check('Chapter Two: through the gap into the drainage easement',(await cstate()).phase==='c2-easement');
 if(exploratory){await ev(()=>{const L=lastLight,C=__c2;L.key('KeyT');C.until(()=>false,7);const m=C.me();L.face(m.a+Math.PI,.25);C.until(()=>false,6);L.key('KeyT');C.walk([C.path(5),C.E(6.2,L.world.easement.pathT(6.2)+.55),C.path(6.5)],{max:25});});check('exploratory run: linger, turn, oblique approach and flashlight toggle remain usable',await ev(()=>lastLight.foot.on&&lastLight.state.chapter.phase==='c2-easement'));}
 await ev(()=>{const C=__c2;C.face(...C.path(14),-.1);C.until(()=>false,.3);});await snap('c2-04-easement-at-night');
 // The marks on the way, each looked at as a player would (stop, look down at it with the light).
 for(const [name,id,s0,p] of [['c2-05-tire-mark','mud',6.8,-.75],['c2-06-flattened-weeds','weeds',14.8,-.55],['c2-07-scrape','scrape',23.8,-.6]]){
  await ev(([id,s0,p])=>{const C=__c2,q=lastLight.world.easement.spots[id];C.walk([C.path(s0)],{max:30});C.face(q.x,q.z,p);C.until(()=>false,2.2);C.face(q.x,q.z,p);C.until(()=>false,.1);},[id,s0,p]);await snap(name);}
 check('Chapter Two: Jamie and Sam point out the tire mark and the weeds',await ev(()=>__c2.said.includes('JAMIE: “Look. A tire.”')&&__c2.said.includes('SAM: “Something went through here.”')));
 // The bicycle.
 await ev(()=>{const C=__c2,b=lastLight.chapter2.found.group.position;C.walk([C.path(27.4)],{max:30});C.face(b.x,b.z,-.3);C.until(()=>lastLight.state.chapter2.flags.found,8);C.until(()=>false,1.5);C.face(b.x,b.z,-.3);C.until(()=>false,.1);});
 await snap('c2-08-alex-bike-by-culvert');check('Chapter Two: Alex’s bike found beside the culvert',(await c2()).flags.found&&(await cstate()).phase==='c2-bike');
 await ev(()=>{const C=__c2,b=lastLight.chapter2.found.group.position,m=C.me();C.walk([[b.x+(m.x-b.x)*.5,b.z+(m.z-b.z)*.5]],{r:.3,max:12});C.face(b.x,b.z,-.4);C.until(()=>false,.3);});
 check('Chapter Two: F: Look closer',(await state()).prompt==='F:Look closer');
 await ev(()=>{lastLight.key('KeyF');__c2.until(()=>lastLight.state.chapter.line==='“The back reflector’s broken off.”',12);__c2.until(()=>false,.8);});await snap('c2-09-broken-reflector');
 await ev(()=>__c2.until(()=>lastLight.state.chapter2.flags.bell,20));await ev(()=>__c2.until(()=>false,2.2));await snap('c2-10-second-bell-culvert');
 check('Chapter Two: the bell again from inside the culvert; "Nope." / "That wasn’t his bike."',await ev(()=>{__c2.until(()=>__c2.said.includes('JAMIE: “That wasn’t his bike.”'),12);return __c2.said.includes('SAM: “Nope.”');}));
 // The police, from behind.
 await ev(()=>__c2.until(()=>lastLight.state.chapter.line==='“Kids! Stop right there.”',20));
 await ev(()=>{const o=lastLight.chapter.officer2;__c2.until(()=>Math.hypot(o.x-__c2.me().x,o.z-__c2.me().z)<9,20);__c2.face(o.x,o.z,0);__c2.until(()=>false,.4);__c2.face(o.x,o.z,0);__c2.until(()=>false,.05);});await snap('c2-11-police-flashlight');
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='c2-search',60));
 check('Chapter Two: "It’s Alex’s." / "What?" / "His bike."; radioed in',await ev(()=>['YOU: “It’s Alex’s.”','OFFICER: “What?”','JAMIE: “His bike.”'].every(l=>__c2.said.includes(l))&&__c2.said.some(l=>l.startsWith('RADIO:'))));
 // Step back as asked, along the path, then watch.
 await ev(()=>{const C=__c2;C.walk([C.path(25.5),C.path(24)],{max:20});C.until(()=>lastLight.state.chapter2.flags.dadThere,30);const d=lastLight.chapter.dad;C.face(d.x,d.z,-.05);C.until(()=>false,1.5);const b=lastLight.chapter2.found.group.position;C.face(b.x,b.z,-.08);C.until(()=>false,.05);});
 await snap('c2-12-tape-adults-dad');
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='c2-home',60));
 check('Chapter Two: Alex’s dad; "We heard a bell." "Okay."; sent home',await ev(()=>{const s=__c2.said,k=s.indexOf('SAM: “We heard a bell. In there.”');return k>=0&&s[k+1]==='OFFICER: “Okay.”'&&s.includes('ALEX’S DAD: “That’s his bike. That’s Alex’s bike.”');})&&(await cstate()).objective==='Go home.');
 await ev(()=>__c2.until(()=>lastLight.state.chapter2.flags.plan,30));check('Chapter Two: "Oak. Tomorrow morning." "Seriously?" "Nine."',await ev(()=>{const s=__c2.said,a=s.indexOf('JAMIE: “Oak. Tomorrow morning.”');return a>=0&&s[a+1]==='SAM: “Seriously?”'&&s[a+2]==='JAMIE: “Nine.”';}));
 await snap('c2-13-sent-home');
 await ev(()=>{const C=__c2,leaving=()=>lastLight.state.chapter.phase!=='c2-home';C.walk([C.path(16),C.path(8),C.path(2)],{max:40,stop:leaving});C.walkPath(lastLight.world.easement.spots.gap,{max:30,stop:leaving});C.until(()=>lastLight.state.chapter.phase==='c2-dawn',30);C.until(()=>document.getElementById('chapter-card').classList.contains('on'),5);});
 await settle(2000);await snap('c2-14-august-22-card');
 check('Chapter Two: walking away fades the night out; AUGUST 22, 2011',(await page.locator('#chapter-card h2').textContent())==='August 22, 2011');
 // ---- the morning -------------------------------------------------------------------------------
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='m-home'&&lastLight.state.fade<.01,20));await settle(2000);await snap('c2-15-morning-home');
 const morning=await state();check('Chapter Two: the next morning in daylight, near home and the bike, no flashlight prompt',morning.day===1&&morning.chapter.objective==='Meet Jamie and Sam at the oak.'&&!String(morning.prompt).startsWith('T:')&&/AUGUST 22, 2011/.test(await page.locator('#date').textContent()));
 await ev(()=>{const C=__c2,r=lastLight.roam;C.walk([[r.x,r.z]],{r:1.2,max:20});C.face(r.x,r.z);C.until(()=>false,.2);lastLight.key('KeyF');C.until(()=>lastLight.state.state==='c1-ride',4);});
 check('Chapter Two: back on the bike in the morning',(await state()).state==='c1-ride');
 // Ride up Oak Hollow past the search: capture the street, a flyer, then the oak.
 await ev(async()=>{const C=__c2,L0=lastLight.nav.locate(C.me().x,C.me().z);C.ride([await C.M(L0.d+3,-2.4),...await C.line(L0.d+3,596,-2.2)],120);});await snap('c2-16-morning-street-search');
 // A flyer on a pole: off the bike, walk up to it, read it, back on.
 await ev(async()=>{const C=__c2;C.ride(await C.line(596,658,-2.2),40);C.brake();lastLight.key('KeyF');C.until(()=>lastLight.state.state==='c1-walk',4);const f=lastLight.chapter2.flyers.children[1].position,m=C.me(),d=Math.hypot(f.x-m.x,f.z-m.z);C.walk([[f.x+(m.x-f.x)*1.1/d,f.z+(m.z-f.z)*1.1/d]],{r:.3,max:25});C.face(f.x,f.z,.12);C.until(()=>false,.3);});await snap('c2-17-missing-flyer');
 await ev(()=>{const C=__c2,r=lastLight.roam;C.walk([[r.x,r.z]],{r:1.2,max:25});C.face(r.x,r.z);C.until(()=>false,.2);lastLight.key('KeyF');C.until(()=>lastLight.state.state==='c1-ride',4);});
 await ev(async()=>{const C=__c2;lastLight.press('KeyW');const L0=lastLight.nav.locate(C.me().x,C.me().z);C.ride([await C.M(L0.d+3,-2.2),...await C.line(L0.d+3,1128,-2.2)],200);C.brake();C.until(()=>lastLight.state.chapter2.flags.oakTalk,20);C.until(()=>lastLight.state.chapter.line==='“There was one right there.”',30);});await snap('c2-18-oak-morning');
 check('Chapter Two: at the oak the old bike is not there; "What old bike?"',await ev(()=>!lastLight.ending.otherBike.visible&&__c2.said.includes('SAM: “What old bike?”')));
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='m-briarwood',80));
 check('Chapter Two: "What if he heard the bell?"; back to Briarwood',await ev(()=>__c2.said.includes('JAMIE: “What if he heard the bell?”'))&&(await cstate()).objective==='Go back to where Alex turned.');
 await ev(async()=>{const C=__c2;lastLight.press('KeyW');C.ride([await C.M(1131,3),...await C.line(1131,600,2.2,25),await C.M(596,2.4)],200);C.brake();const q=lastLight.chapter2.corner.look;C.face(q.x,q.z);C.until(()=>lastLight.state.chapter2.flags.corner,10);C.until(()=>false,2.5);});
 await snap('c2-19-briarwood-corner');check('Chapter Two: at the corner where he turned, F: Remember',(await state()).prompt==='F:Remember');
 check('Astra: memory objective is explicit at the intersection',(await cstate()).objective==='Remember Alex leaving.');
 check('Astra: Remember prompt has a distinct readable key and label',await ev(()=>document.querySelector('#prompt .memory-action')?.textContent.includes('— Remember')));
 if(exploratory){
  await ev(()=>{const L=lastLight,C=__c2;L.face(L.roam.a+Math.PI,0);C.until(()=>false,14);});
  check('Astra: Remember persists when facing away and lingering',(await state()).prompt==='F:Remember');
  check('Astra: Jamie gives one local reminder',await ev(()=>__c2.said.filter(x=>x.includes('Try to remember exactly what he did.')).length===1));
  // Walk outside the interaction, dismount normally, and return on foot; no placement/jump.
  await ev(async()=>{const C=__c2,L=lastLight;C.ride([await C.M(616,2.4)],25);C.brake();L.key('KeyF');C.until(()=>L.state.state==='c1-walk',5);const q=L.chapter2.corner.at;C.walkPath(q,{max:40});C.until(()=>false,2);});
  check('Astra: Remember works after leaving and returning on foot',(await state()).state==='c1-walk'&&(await state()).prompt==='F:Remember');
  await snap('memory-on-foot-persistent');
 }
 // ---- remembering ------------------------------------------------------------------------------
 const before=await ev(()=>({me:__c2.me(),j:[lastLight.state.chapter.jamie.x,lastLight.state.chapter.jamie.z]}));
 await ev(()=>{lastLight.key('KeyF');__c2.until(()=>lastLight.state.state==='memory'&&lastLight.state.memory?.phase==='play',12);__c2.until(()=>false,1);});await snap('c2-20-memory-evening');
 check('Chapter Two: remembering is first person on the evening ride, warm and soft, no glitch effects',(await state()).state==='memory'&&await ev(()=>document.body.classList.contains('remembering')&&lastLight.memCast.list.every(f=>f.bike.group.visible)));
 await ev(()=>{const a=lastLight.memCast.list.find(f=>f.key==='alex');__c2.until(()=>a.lookWorld&&a.pauseT>2.2,30);});await snap('c2-21-memory-alex-stops-and-looks');
 check('Chapter Two: in the memory Alex stops and looks off toward the creek',await ev(()=>{const a=lastLight.memCast.list.find(f=>f.key==='alex');return a.speed<.45&&Math.abs(a.look)>.6;}));
 await ev(()=>{const a=lastLight.memCast.list.find(f=>f.key==='alex');__c2.until(()=>a.paused&&a.waveW>.8,20);});await snap('c2-22-memory-alex-waves');
 await ev(()=>__c2.until(()=>lastLight.state.chapter.phase==='m-after',40));await ev(()=>__c2.until(()=>lastLight.state.fade<.01,6));await snap('c2-23-back-in-the-morning');
 const after=await ev(()=>({me:__c2.me(),j:[lastLight.state.chapter.jamie.x,lastLight.state.chapter.jamie.z]}));
 check('Chapter Two: back in the morning exactly where you were',Math.hypot(after.me.x-before.me.x,after.me.z-before.me.z)<.05&&Math.hypot(after.j[0]-before.j[0],after.j[1]-before.j[1])<.05&&!(await ev(()=>document.body.classList.contains('remembering'))));
 await ev(()=>__c2.until(()=>lastLight.state.state==='ended',40));
 await page.waitForFunction(()=>!document.querySelector('#ending').hidden&&Number(getComputedStyle(document.querySelector('#ending')).opacity)>.99);
 await snap('c2-24-chapter-two-end');
 check('Chapter Two: "He heard it before he left." then LAST LIGHT / Chapter Two',await ev(()=>['YOU: “Sam was right.”','JAMIE: “He stopped.”','YOU: “He was looking toward the creek.”','JAMIE: “He heard it before he left.”'].every(l=>__c2.said.includes(l)))&&(await page.locator('#ending h2').textContent())==='Chapter Two'&&!(/to be continued/i.test(await page.locator('#ending').textContent())));
 const phases=await ev(()=>__c2.phases.filter(p=>p.startsWith('c2-')||p.startsWith('m-')));
 check('Chapter Two: every phase in order in the browser',JSON.stringify(phases)===JSON.stringify(['c2-black','c2-decide','c2-follow','c2-easement','c2-bike','c2-bell','c2-police','c2-search','c2-home','c2-dawn','m-home','m-briarwood','m-memory','m-after','m-end']));
 check('Chapter Two playthrough: no JavaScript or shader errors',errors.length===0);
}

// After the main playthrough: QA jumps, lingering, the wrong way, Continue, and focused frames.
export async function runChapterTwoJumps({page,snap,check,state,errors}){
 const ev=(fn,arg)=>page.evaluate(fn,arg);await ev(installHelpers);
 const expect={'chapter2-start':'c2-decide','easement':'c2-easement','alex-bike':'c2-bike','second-bell':'c2-bell','police-find':'c2-police','morning':'m-home','morning-oak':'m-home','memory-start':'m-briarwood','memory-reconstruction':'m-memory','chapter2-end':'m-after'};
 for(const [sec,phase] of Object.entries(expect)){await ev(sec=>{lastLight.jump(sec);lastLight.step(2.5);},sec);await page.waitForTimeout(1600);await snap('qa-jump-'+sec);
  const s=await state();check('QA jump '+sec+' lands in '+phase,s.chapter.phase===phase&&Number.isFinite(s.roam.x)&&(s.state.startsWith('c1-')||s.state==='memory'));}
 // Lingering a long time: nothing moves on that should not, nothing breaks. (At the bike the night
 // goes on by itself: a closer look, the bell, the police, home; standing about there, the morning comes.)
 for(const [sec,phase] of [['easement','c2-easement'],['alex-bike','c2-bike'],['morning','m-home'],['memory-start','m-briarwood']]){await ev(sec=>{lastLight.jump(sec);lastLight.step(150);},sec);const s=await state();await snap('linger-'+sec);
  check('lingering 150 s at '+sec+' keeps the scene intact',Number.isFinite(s.roam.x)&&(sec==='alex-bike'?['c2-bike','c2-bell','c2-police','c2-search','c2-home','c2-dawn','m-home'].includes(s.chapter.phase):s.chapter.phase===phase));}
 // The wrong way at night: away from the gap, back along Briarwood; Jamie calls you back, and you can still go through.
 await ev(()=>{lastLight.jump('chapter2-start');__c2.until(()=>lastLight.state.chapter.phase==='c2-follow',40);const C=__c2,B=lastLight.world.sideFrames[0],q=B.point(90,9);C.walkPath({x:q.x,z:q.z},{max:30});C.until(()=>false,26);});
 check('wrong way at night: Jamie calls you back to the fence',await ev(()=>__c2.said.includes('JAMIE: “Through the fence. Come on.”')));
 await ev(()=>{const C=__c2;C.walkPath(lastLight.world.easement.spots.gap,{max:60});C.walk([.6,1.4,2.4,3.6,5,6.5].map(s=>C.path(s)),{max:30});});
 check('wrong way at night: back through the gap all the same',(await state()).chapter.phase==='c2-easement');
 // Sprint, jump and crouch work in the easement; the flashlight toggles.
 const moves=await ev(()=>{const L=lastLight,C=__c2,a=C.me();L.press('KeyW');L.press('ShiftLeft');C.until(()=>false,1.2);L.release('ShiftLeft');L.release('KeyW');const b=C.me();L.key('Space');let up=0;C.until(()=>{up=Math.max(up,L.state.onFoot.height);return false;},.6);const was=L.state.onFoot.on;L.key('KeyT');C.until(()=>false,.1);const now=L.state.onFoot.on;L.key('KeyT');return {moved:Math.hypot(b.x-a.x,b.z-a.z),up,toggled:was!==now};});
 check('easement: sprint, jump and flashlight work on foot',moves.moved>2&&moves.up>.05&&moves.toggled);
 // A different approach: straight to the bike along the channel side (not the path).
 await ev(()=>{lastLight.jump('easement');lastLight.step(1);const C=__c2;C.walk([C.E(12,1.8),C.E(20,1.6),C.E(26,-1)].map(x=>x),{max:40});const b=lastLight.chapter2.found.group.position;C.walkPath({x:b.x+1.6,z:b.z},{max:30});C.face(b.x,b.z,-.3);C.until(()=>lastLight.state.chapter2.flags.found,10);});
 check('alternate approach along the channel still finds the bike',(await state()).chapter2.flags.found);
 // Continue after the morning checkpoint, from the title.
 await ev(()=>{lastLight.jump('morning');lastLight.step(1);lastLight.toTitle();lastLight.step(.2);});
 check('Continue is offered on the title from a Chapter Two checkpoint',await page.locator('#continue').isVisible()&&/morning/i.test(await page.locator('#continue-where').textContent()));await snap('c2-title-continue');
 await page.click('#continue');await ev(()=>lastLight.step(1.5));check('Continue returns to the morning',(await state()).chapter.phase==='m-home'&&(await state()).day===1);
 check('Chapter Two jumps: no JavaScript or shader errors',errors.length===0);
}

// Fixed views for the rendered review: the two visual bug fixes in daylight, and a few Chapter Two
// details at close range (the player is placed where a player could stand; the camera override is
// used only for the flag and hoops, which are seen from the street).
export async function runChapterTwoCloseups({page,snap,check}){
 const ev=(fn,a)=>page.evaluate(fn,a);
 const cam=async(name,get)=>{const ok=await ev(async get=>{const T=await import('./three.module.js'),L=lastLight;L.scene.updateMatrixWorld(true);const v=await (new Function('L','T','return ('+get+')(L,T)'))(L,T);if(!v)return false;
  L.camera.position.set(...v.from);L.camera.lookAt(...v.at);L.camera.updateMatrixWorld();const sky=L.scene.children.find(o=>o.isMesh&&o.geometry?.parameters?.radius===350);sky?.position.copy(L.camera.position);return true;},String(get));if(ok)await snap(name);return ok;};
 await ev(()=>{lastLight.reset();lastLight.step(.5);});
 // The porch flag: canton up and at the pole, flying away from it.
 check('bug-fix capture: porch flag',await cam('bugfix-flag',(L,T)=>{const F=L.ambient.flag,c=F.cloth.getWorldPosition(new T.Vector3()),p=F.pole.getWorldPosition(new T.Vector3());const dir=new T.Vector3(c.x-p.x,0,c.z-p.z).normalize(),side=new T.Vector3(-dir.z,0,dir.x);const f=c.clone().add(side.multiplyScalar(5.5)).add(dir.multiplyScalar(1.5));return {from:[f.x,c.y-.4,f.z],at:[c.x,c.y,c.z]};}));
 // The curbside hoop: board and rim facing the street, the pole behind the board.
 check('bug-fix capture: curbside hoop',await cam('bugfix-hoop-curbside',(L,T)=>{const H=L.world.hoops.find(h=>h.kind==='portable');if(!H)return null;const g=H.group,u=g.userData.hoop,b=g.localToWorld(new T.Vector3(...u.board)),r=g.localToWorld(new T.Vector3(...u.rim)),d=r.clone().sub(b).setY(0).normalize();const f=b.clone().add(d.multiplyScalar(6.5));return {from:[f.x,b.y-1.6,f.z],at:[b.x,b.y-.4,b.z]};}));
 // Sam's driveway hoop, seen from where you would shoot.
 check('bug-fix capture: garage hoop',await cam('bugfix-hoop-garage',(L,T)=>{const H=L.world.hoops.find(h=>h.kind==='garage'&&h.plan===L.world.homes.sam)||L.world.hoops.find(h=>h.kind==='garage');const p=H.plan,a=p.toWorld(H.play.x+1.2,H.play.z+1.5),b=p.toWorld(H.board.x,H.board.z);return {from:[a.x,a.ground+1.5,a.z],at:[b.x,b.ground+H.board.y-.3,b.z]};}));
 const stand=(sec,fn)=>ev(([sec,fn])=>{const L=lastLight;L.jump(sec);L.step(1.5);const q=(new Function('L','return ('+fn+')(L)'))(L);const r=L.roam;L.placePlayer({x:q.x,z:q.z,a:Math.atan2(q.fx-q.x,-(q.fz-q.z)),mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});L.face(Math.atan2(q.fx-q.x,-(q.fz-q.z)),q.p||0);L.step(1.2);L.face(Math.atan2(q.fx-q.x,-(q.fz-q.z)),q.p||0);L.step(.05);},[sec,String(fn)]);
 // Alex's bicycle up close in the flashlight: the green frame, the rack, the empty reflector clip.
 await stand('alex-bike',L=>{const b=L.chapter2.found.group.position,F=L.world.easement,q=F.local(b.x,b.z),p=F.world(q.s-1.3,q.t-.5);return {x:p.x,z:p.z,fx:b.x,fz:b.z,p:-.62};});await snap('c2-close-alex-bike');
 // The culvert's mouth from the channel: big, dark, a step in at most.
 await stand('second-bell',L=>{const F=L.world.easement,m=F.spots.mouth,q=F.local(m.x,m.z),p=F.world(q.s-3.2,q.t);return {x:p.x,z:p.z,fx:m.x,fz:m.z,p:.02};});await snap('c2-culvert-entrance');
 // Morning: neighbors comparing notes on a lawn; the place by the oak where the old bike was.
 await stand('morning',L=>{const n=L.chapter.neighbor,{x,z}=n;return {x:x+3.6,z:z+2.2,fx:x,fz:z,p:.02};});await snap('c2-morning-neighbors');
 await stand('morning-oak',L=>{const o=L.ending.otherBike.position;return {x:o.x-2.8,z:o.z+1.6,fx:o.x,fz:o.z,p:-.25};});await snap('c2-old-bike-gone');
 check('morning: nothing where the old bike was',await ev(()=>!lastLight.ending.otherBike.visible));
}
