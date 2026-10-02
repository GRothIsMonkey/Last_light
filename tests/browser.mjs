// Browser release checks. npm install --no-save playwright; npx playwright install chromium.
// BROWSER_PATH can select an existing Chromium. SOFTWARE_GL=1 uses SwiftShader.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {runAstraChecks} from './astra-browser.mjs';
import {runSceneChecks} from './polish-scenes.mjs';
import {runChapterTwoBrowser,runChapterTwoJumps,runChapterTwoCloseups} from './chapter2-browser.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa');fs.mkdirSync(out,{recursive:true});
const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
const server=http.createServer((req,res)=>{if(req.url.split('?')[0]==='/favicon.ico'){res.writeHead(204);return res.end();}// newer Chromium asks for a favicon; the game has none
 const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage'];if(process.env.SOFTWARE_GL)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu');
const browser=await playwright.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[],frames=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE',m.text());}});
const base=`http://127.0.0.1:${server.address().port}`;
const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const state=()=>page.evaluate(()=>lastLight.state);
const snap=async(name,{clean=false}={})=>{if(clean)await page.evaluate(()=>{for(const el of document.querySelectorAll('header,#date,#ride-ui,#subtitle,#prompt,#reflection'))el.style.visibility='hidden';});
 await page.evaluate(()=>{for(const id of ['title-card','objective','objective-note','ending','prompt','subtitle','reflection','fade'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await page.evaluate(()=>(()=>{const L=lastLight,r={...L.render()};let lights=0,shadowLights=0;L.scene.traverseVisible(o=>{if(o.isLight&&o.intensity>0){lights++;if(o.castShadow)shadowLights++;}});return {...r,activeLights:lights,shadowLights,geometries:L.renderer.info.memory.geometries,textures:L.renderer.info.memory.textures,programs:L.renderer.info.programs.length};})());await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:90});frames.push({name,...info});console.log('Captured',name,JSON.stringify(info));
 if(clean)await page.evaluate(()=>{for(const el of document.querySelectorAll('header,#date,#ride-ui,#subtitle,#prompt,#reflection'))el.style.visibility='';});};
// Look somewhere for a moment, take a clean frame, then look ahead again (the ride keeps going only when stepped).
const view=async(name,yaw,pitch=0)=>{await page.evaluate(([y,p])=>{lastLight.look(y,p);lastLight.step(.05);},[yaw,pitch]);await snap(name,{clean:true});await page.evaluate(()=>{lastLight.look(0,0);});};
// A QA camera placed relative to something in the world, for one rendered frame (the next step puts the eye back).
// who: 'jamie'|'sam'|'alex' (their bike), or {house:'sam'|'jamie'|'alex', from:[x,y,z], at:[x,y,z]} in house coordinates.
const camAt=async(name,target,off=[2.4,.1,.6],look=[0,.75,0])=>{await page.evaluate(async([target,off,look])=>{const T=await import('./three.module.js');lastLight.scene.updateMatrixWorld(true);
  if(typeof target==='string'){const f=lastLight.friends.list.find(f=>f.key===target),g=f.bike.group,q=g.getWorldQuaternion(new T.Quaternion()),p=g.getWorldPosition(new T.Vector3());lastLight.camera.position.copy(p).add(new T.Vector3(...off).applyQuaternion(q));lastLight.camera.lookAt(p.x+look[0],p.y+look[1],p.z+look[2]);}
  else{const W=lastLight.world,h=target.plan?W.houses.find(p=>Math.abs(p.u-target.plan.u)<.01&&p.side===target.plan.side):W.homes[target.house||target.door||target.garage];
   // Anchors: the house center, its front door (x from the door, z from the front wall) or its garage door.
   const G=h.garageInfo,o=target.door?[h.doorX,h.front]:target.garage?[G.x,G.front]:[0,0],zz=v=>v==='back'?-G.depth+.6:v;
   if(target.open){const d=W.doors[target.door]||W.garages[target.garage];window.__qaOpen=[d,d.open];d.set(1);}
   const a=h.toWorld(o[0]+target.from[0],o[1]+zz(target.from[2])),b=h.toWorld(o[0]+target.at[0],o[1]+zz(target.at[2]));lastLight.camera.position.set(a.x,a.ground+target.from[1],a.z);lastLight.camera.lookAt(b.x,b.ground+target.at[1],b.z);}
  // The sky dome follows the eye in game; keep it centered on this QA camera too.
  const sky=lastLight.scene.children.find(o=>o.isMesh&&o.geometry?.parameters?.radius===350);sky?.position.copy(lastLight.camera.position);
  lastLight.camera.updateMatrixWorld();},[target,off,look]);await snap(name,{clean:true});await page.evaluate(()=>{if(window.__qaOpen){const [d,v]=window.__qaOpen;d.set(v);window.__qaOpen=null;}});};
// A short sequence of frames, dt seconds apart, each framed by frame() (a view or a camera override).
const sequence=async(name,n,dt,frame)=>{for(let i=1;i<=n;i++){await page.evaluate(dt=>lastLight.step(dt),dt);await frame(name+'-'+i);}};
const advanceTo=async d=>{await page.evaluate(d=>{let frames=0;while(lastLight.state.distance<d&&frames++<14000)lastLight.step(1/30);},d);check('reached '+d,(await state()).distance>=d);};
try{
 await page.goto(base+'/index.html?qa');await page.waitForFunction(()=>window.lastLight);await page.evaluate(()=>lastLight.step(.04));await snap('01-opening');
 // Title menu: Settings and Credits open over it and come back.
 await page.click('#open-settings');check('settings panel opens from the title',await page.locator('#settings').isVisible()&&!(await page.locator('#intro').isVisible()));await snap('01b-settings');
 await page.selectOption('#set-quality','high');check('graphics setting changes the shadow map',await page.evaluate(()=>lastLight.scene.children.find(o=>o.isDirectionalLight).shadow.mapSize.x===3072));await page.selectOption('#set-quality','medium');
 await page.click('#settings-back');check('settings returns to the title',await page.locator('#intro').isVisible());
 await page.click('#open-credits');await snap('01c-credits');await page.keyboard.press('Escape');check('Esc closes credits back to the title',await page.locator('#intro').isVisible()&&!(await page.locator('#credits').isVisible()));
 await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
 check('audio starts from a user gesture',await page.evaluate(()=>lastLight.audio()?.ctx?.state==='running'));
 check('mouse captured in Chromium',await page.evaluate(()=>document.pointerLockElement===document.querySelector('#world')));
 await page.mouse.click(720,450);await page.keyboard.press('r');check('click while locked keeps capture',await page.evaluate(()=>document.pointerLockElement===document.querySelector('#world')));
 await page.keyboard.down('w');await page.evaluate(()=>lastLight.step(3));await page.keyboard.up('w');check('W key pedals',(await state()).distance>5);
 await page.keyboard.press('Space');await page.evaluate(()=>lastLight.step(.13));check('bell schedules real Web Audio sources',await page.evaluate(()=>lastLight.audio().activeShots>0));
 // Headless audio still runs in real time; accelerate only after muting.
 await page.keyboard.press('m');check('M mutes sound under pointer lock',await page.evaluate(()=>!lastLight.audio().enabled));await page.evaluate(()=>lastLight.look(0,-.7));await page.evaluate(()=>lastLight.step(.25));await snap('02-pedaling');
 await page.evaluate(()=>lastLight.look(0,0));await page.keyboard.press('Escape');const paused=await state();await page.evaluate(()=>lastLight.step(5));check('QA pause freezes simulation',(await state()).distance===paused.distance&&(await state()).state==='paused');
 check('pause menu offers resume, settings, start over and title',await page.locator('#pause #resume').isVisible()&&await page.locator('#pause #restart').isVisible()&&await page.locator('#pause #to-title').isVisible());await snap('02b-pause-menu');
 await page.click('#resume');await page.evaluate(()=>lastLight.press('KeyW'));await advanceTo(22);await snap('02c-prompt');
 // World edge: behind the start, through the gaps, out to the sides.
 await view('edge-01-looking-back-at-start',Math.PI*.98,.02);await view('edge-02-left-gap',1.5,.03);await view('edge-03-right-gap',-1.5,.03);
 await advanceTo(85);await snap('03-group-ride');await view('body-01-looking-down',0,-1.15);await view('body-02-over-the-shoulder',1.8,-.2);
 await sequence('seq-group-pedaling',4,.18,n=>camAt(n,'sam',[2.6,.15,.4]));
 // The body stays whole while steering, braking and pushing hard.
 await advanceTo(100);await page.evaluate(()=>{lastLight.press('KeyA');lastLight.step(.6);});await view('body-03-steering-left',0,-1.0);await page.evaluate(()=>{lastLight.release('KeyA');lastLight.press('KeyD');lastLight.step(1.1);lastLight.release('KeyD');lastLight.step(2);});
 await page.evaluate(()=>{lastLight.release('KeyW');lastLight.press('KeyS');lastLight.step(.7);});await view('body-04-braking',0,-1.0);await page.evaluate(()=>{lastLight.release('KeyS');lastLight.press('KeyW');lastLight.step(2);});
 await page.evaluate(()=>{lastLight.press('ShiftLeft');lastLight.step(3.2);});check('Shift pushes harder',(await state()).push>.2);await view('body-05-hard-pedaling',0,-1.05);
 await sequence('seq-friends-surge',4,.25,n=>camAt(n,'sam',[2.2,.2,-1.6],[0,.8,0]));await view('friends-04-answering-a-push',-.55,-.08);await page.evaluate(()=>{lastLight.release('ShiftLeft');lastLight.step(3);});
 await advanceTo(180);await snap('04-first-hill');await view('friends-01-left',.95,-.12);await view('friends-02-right',-.9,-.12);
 await advanceTo(250);await view('friends-03-alongside',1.25,-.18);await view('edge-04-backyards-left',1.6,.06);
 // Alex says goodbye first and turns onto Briarwood; later Jamie runs inside; Sam rides into his garage last.
 for(const [name,d,look] of [['09-alex-goodbye',560],['09b-alex-waves',584,[-.75,.02]],['edge-05-briarwood-ln',592,[-1.45,.02]],['10-alex-down-briarwood',600,[-1.57,.01]]]){await advanceTo(d);if(look)await view(name,...look);else await snap(name);}
 await advanceTo(756);await sequence('seq-jamie-goes-home',4,.55,n=>snap(n,{clean:true}));await camAt('house-01-jamie-entry',{door:'jamie',open:true,from:[.7,1.9,5.2],at:[0,1.4,-2.2]});
 for(const [name,d,look] of [['05-jamie-runs-home',762],['06-jamie-at-door',778],['edge-07-summerfield-rd',867,[1.45,.02]],['edge-08-summerfield-down-the-street',872,[1.57,.01]]]){await advanceTo(d);if(look)await view(name,...look);else await snap(name);}
 await advanceTo(940);await camAt('house-02-sam-garage-open',{garage:'sam',from:[.4,1.6,6.5],at:[0,1.0,'back']});
 await advanceTo(958);await sequence('seq-sam-rides-into-the-garage',4,.7,n=>camAt(n,{garage:'sam',from:[1.8,1.7,8.5],at:[-.2,1.0,'back']}));
 for(const [name,d,look] of [['07-sam-parks',968],['08-sam-garage-closes',990],['house-03-alex-entry',1000,'alex'],['11-late-houses',1005],['edge-10-late-left',1030,[1.57,.03]],['edge-11-late-right',1034,[-1.57,.03]],['12-late-sunset',1060],['13-final-arrival',1136.5]]){await advanceTo(d);if(look==='alex')await camAt(name,{door:'alex',open:true,from:[.7,1.9,5.6],at:[0,1.4,-2.2]});else if(look)await view(name,...look);else await snap(name);}
 check('Jamie and Sam are inside; Alex has gone on down Briarwood',(await state()).friends.filter(f=>f.name!=='ALEX').every(f=>f.inside)&&!(await state()).friends.find(f=>f.name==='ALEX').inside);check('no clue during main ride',!(await state()).clue);
 await page.evaluate(()=>{lastLight.release('KeyW');lastLight.step(2);});await view('body-06-stopped-looking-down',0,-1.1);await page.evaluate(()=>{lastLight.look(0,0);lastLight.step(.3);lastLight.key('KeyF');lastLight.step(.55);});await snap('body-07-getting-off',{clean:true});
 await page.evaluate(()=>lastLight.step(1.5));check('dismount reaches walking',(await state()).state==='walking');
 await page.evaluate(()=>{lastLight.press('KeyW');lastLight.step(12);lastLight.release('KeyW');lastLight.step(.4);lastLight.look(-.4,.12);});await snap('14-oak-and-bench');
 await page.evaluate(()=>{lastLight.look(Math.PI,0);lastLight.step(3);});await snap('15-looking-home');
 await page.evaluate(()=>lastLight.step(10));check('distant call triggers',(await state()).callDone);check('clue remains absent after call',!(await state()).clue);
 await page.evaluate(()=>{lastLight.look(0,.02);lastLight.step(.1);});await snap('edge-09-lookout-field',{clean:true});
 // The end of the street, touched: the swing, the bench, the chalk, the oak.
 const L=await page.evaluate(async()=>(await import('./layout.js')).LOOKOUT);
 await page.evaluate(L=>{lastLight.walkTo(L.swing.d-1.2,L.swing.lat,0,0);lastLight.step(.2);},L);check('swing prompt',(await state()).prompt==='F:Push the swing');
 await page.evaluate(()=>{lastLight.key('KeyF');lastLight.step(.7);});check('the swing swings',(await state()).swing>.1);await snap('20-swing-pushed');
 await page.evaluate(L=>{lastLight.walkTo(L.bench.d-1.1,L.bench.lat,0,0);lastLight.step(.2);lastLight.key('KeyF');lastLight.step(1.5);},L);check('sitting on the bench',(await state()).pose==='bench');await snap('21-bench-view');
 await page.evaluate(()=>{lastLight.key('KeyF');lastLight.step(1.2);});check('standing up again',(await state()).pose===null);check('the other bike is there after the call',(await state()).otherBike);
 await page.evaluate(L=>{lastLight.walkTo(L.chalk.d-.7,L.chalk.lat+.6,0,0);lastLight.step(.2);lastLight.key('KeyF');lastLight.step(1.3);},L);check('crouched at the chalk',(await state()).pose==='chalk');await snap('22-chalk-crouch',{clean:true});
 await page.evaluate(()=>{lastLight.look(-1.0,.7);lastLight.step(.3);});check('faint AR after the call',(await state()).clue);await snap('23-chalk-ar-faint',{clean:true});await page.evaluate(()=>lastLight.step(5));
 await page.evaluate(L=>{const d=L.oak.d-.26,lat=L.oak.lat-1.27;lastLight.walkTo(d,lat,Math.atan2(-(L.oak.lat-lat),L.oak.d-d),-.12);lastLight.step(.1);},L);await snap('24-oak-carving',{clean:true});
 await page.evaluate(L=>{lastLight.walkTo(L.swing.d-4,L.swing.lat-5,Math.atan2(-(L.oak.lat+.6-(L.swing.lat-5)),L.oak.d+.9-(L.swing.d-4)),-.15);lastLight.step(.1);},L);await snap('25-the-other-bike',{clean:true});
 // Return by walking; no teleport/set-distance hooks.
 await page.evaluate(()=>{for(let i=0;i<1400;i++){const s=lastLight.state;if(Math.hypot(s.walkD-s.distance,s.walkLat-s.lateral)<1.5)break;lastLight.look(Math.atan2(-(s.lateral+.75-s.walkLat),s.distance-s.walkD),0);lastLight.press('KeyW');lastLight.step(1/30);}lastLight.release('KeyW');lastLight.step(.3);lastLight.key('KeyF');lastLight.step(.5);});await snap('body-08-getting-back-on',{clean:true});await page.evaluate(()=>lastLight.step(1.1));
 check('Go home starts the ride home instead of an end card',(await state()).state==='c1-ride'&&!(await page.locator('#ending').isVisible()));
 await page.evaluate(()=>lastLight.press('KeyW'));let fadeClue=false;for(let i=0;i<40;i++){await page.evaluate(()=>lastLight.step(.3));const s=await state();if(s.clue&&s.fade>0)fadeClue=true;if(i===30)await snap('16-ride-home-transition');}
 check('the chalk shows plainly only in the transition fade, with the last memory line',fadeClue);
 // ---- Chapter One, played on from here the way a player would --------------------------------
 // Page-side helpers: ride with the QA autopilot (W and A/D), stand where a player would stand.
 await page.evaluate(()=>{const L=lastLight,B=L.world.sideFrames[0];
  window.__c1={said:[],last:'',
   sl(u0,u1,v,st=8){const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(this.S(u0+(u1-u0)*i/n,v));return o;},
   M:async(d,l)=>{const {groundPoint}=await import('./route.js');const p=groundPoint(d,l);return [p.x,p.z];},S:(u,v)=>{const p=B.point(u,v);return [p.x,p.z];},
   watch(){const s=L.state.chapter;if(s.line&&s.line!==this.last){this.last=s.line;this.said.push((s.speaker||'')+': '+s.line);}},
   until(fn,max){for(let t=0;t<max;t+=1/30){L.step(1/30);this.watch();if(fn())return true;}return false;},
   ride(pts,max=150){L.drive(pts,{r:2.6});const ok=this.until(()=>!L.driving,max);L.stopDriving();this.until(()=>false,1.2);return ok;},
   off(){L.release('KeyW');L.press('KeyS');this.until(()=>L.state.speed<.05||L.state.state!=='c1-ride',6);L.release('KeyS');L.key('KeyF');this.until(()=>L.state.state==='c1-walk',4);},
   standAt(q,face){const r=L.roam,a=Math.atan2(face[0]-q[0],-(face[1]-q[1]));L.placePlayer({x:q[0],z:q[1],a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});this.until(()=>false,.3);},
   on(){const r=L.roam;L.placePlayer({x:r.x,z:r.z,a:r.a,mode:'ride',speed:0});this.until(()=>false,.3);}};});
 const c1=(fn,arg)=>page.evaluate(fn,arg),cstate=async()=>(await state()).chapter;
 // The ride home: quiet, a siren, the car passing and turning onto Briarwood behind you, the title.
 await c1(async()=>{const C=window.__c1,pts=[];for(let d=820;d>=540;d-=20)pts.push(await C.M(d,-2.1));lastLight.drive(pts,{r:2.6});});
 let shots={};for(let i=0;i<900;i++){await page.evaluate(()=>{lastLight.step(1/6);window.__c1.watch();});const s=await state(),ch=s.chapter;
  if(!shots.siren&&ch.siren&&ch.siren.active){shots.siren=1;await snap('c1-01-ride-home-siren');}
  if(!shots.near&&ch.carA.active&&Math.hypot(ch.carA.x-s.roam.x,ch.carA.z-s.roam.z)<45&&!ch.carA.parked){shots.near=1;await snap('c1-02-police-approaching');}
  if(!shots.pass&&shots.near&&ch.carA.active&&Math.hypot(ch.carA.x-s.roam.x,ch.carA.z-s.roam.z)<9){shots.pass=1;await snap('c1-03-police-passing');}
  if(!shots.turn&&shots.pass&&Math.hypot(ch.carA.x-s.roam.x,ch.carA.z-s.roam.z)>30){shots.turn=1;await snap('c1-04-police-turning-onto-briarwood');}
  if(!shots.title&&ch.phase==='title'&&ch.title>2.4){shots.title=1;await page.waitForTimeout(1800);await snap('c1-05-title-card');}
  if(ch.phase==='briarwood')break;}
 check('Chapter 1: the siren, the police car passing and turning, then the title card',shots.siren&&shots.near&&shots.pass&&shots.title&&(await cstate()).phase==='briarwood');
 await page.evaluate(()=>lastLight.step(1.2));check('Chapter 1: objective after the title',(await state()).objective==='See what’s happening on Briarwood.');
 await c1(async()=>{const C=window.__c1,L=lastLight;L.stopDriving();L.press('KeyS');C.until(()=>L.state.speed<.05,8);L.release('KeyS');const {groundPoint,heading}=await import('./route.js');const Lc=L.nav.locate(L.roam.x,L.roam.z),q=groundPoint(Lc.d,-1.8);L.placePlayer({x:q.x,z:q.z,a:heading(Lc.d),mode:'ride',speed:0});
  const pts=[];for(let d=Lc.d+12;d<566;d+=20)pts.push(await C.M(d,-1.8));pts.push(await C.M(568,-1.6),await C.M(584,1),C.S(8,1.9),...C.sl(8,96,1.8));C.ride(pts,100);});
 await snap('c1-06-briarwood-police-scene');
 await c1(()=>{const C=window.__c1;C.ride(C.sl(96,112,1.7),30);lastLight.release('KeyW');C.until(()=>lastLight.state.chapter.line,20);});await snap('c1-07-officer-asks');
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.phase==='friends',70));
 check('Chapter 1: the conversation at Alex\'s house, as written',await c1(()=>['OFFICER: “You were with Alex tonight?”','YOU: “Yeah.”','OFFICER: “When did he leave you?”','YOU: “At Oak Hollow. He turned here.”','ALEX’S DAD: “He never came home.”','OFFICER: “Was anyone with him?”','YOU: “No.”'].every(l=>window.__c1.said.includes(l))));
 await camAt('c1-08-alex-garage-empty',{garage:'alex',from:[.4,1.6,6],at:[0,1.2,'back']});
 // Jamie's window.
 await c1(async()=>{const C=window.__c1,pts=[...C.sl(112,16,-1.9),await C.M(584,-2)];for(let d=604;d<=786;d+=20)pts.push(await C.M(d,-2.2));C.ride(pts,120);C.off();const w=lastLight.chapter.windows.jamie;C.standAt([w.stand.x,w.stand.z],[w.glass.x,w.glass.z]);});
 check('Chapter 1: F taps on Jamie\'s window',(await state()).prompt==='F:Tap on the window');await snap('c1-09-jamie-window');
 await c1(()=>{lastLight.key('KeyF');window.__c1.until(()=>lastLight.state.chapter.line==='“Ha. Nice try.”',20);});await snap('c1-10-jamie-nice-try');
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.flags.jamieClosing,40));await snap('c1-11-jamie-climbed-out');
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.jamie.follow==='ride',40));check('Chapter 1: Jamie gets his bike and comes along',(await cstate()).jamie.mode==='ride');
 // Sam: pebbles, the window, the side door.
 await c1(async()=>{const C=window.__c1;C.on();lastLight.press('KeyW');const pts=[];for(let d=800;d<=983;d+=20)pts.push(await C.M(d,-2.2));C.ride(pts,80);C.off();const w=lastLight.chapter.windows.sam;C.standAt([w.stand.x,w.stand.z],[w.glass.x,w.glass.z]);lastLight.key('KeyF');C.until(()=>lastLight.state.chapter.line==='“He sleeps with a fan on. He can’t hear anything. Watch.”',10);});
 await snap('c1-12-jamie-pebbles');await c1(()=>window.__c1.until(()=>lastLight.state.chapter.line==='“That’s not funny.”',40));await snap('c1-13-sam-at-window');
 await c1(()=>{const C=window.__c1;C.until(()=>lastLight.state.objective==='Wait by Sam’s garage.',40);const d=lastLight.chapter.sideDoor.outside;C.standAt([d.x+1.5,d.z+1],[d.x,d.z]);C.until(()=>lastLight.state.chapter.flags.samOut,30);C.until(()=>false,2.5);});await snap('c1-14-sam-side-door');
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.sam.follow==='ride',40));check('Chapter 1: Sam sneaks out with his bike',(await cstate()).sam.mode==='ride');
 // The oak, then back the way Alex went.
 await c1(async()=>{const C=window.__c1;C.on();lastLight.press('KeyW');const pts=[];for(let d=1000;d<=1128;d+=16)pts.push(await C.M(d,-1.5));C.ride(pts,60);lastLight.release('KeyW');C.until(()=>lastLight.state.chapter.line==='“He stopped first.”',60);});
 await view('c1-15-oak-he-stopped-first',.9,-.05);
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.phase==='retrace',60));check('Chapter 1: the friends compare memories at the oak',await c1(()=>['SAM: “He stopped first.”','YOU: “No he didn’t.”','SAM: “Yeah, he did. For a second.”'].every(l=>window.__c1.said.includes(l))));
 await c1(async()=>{const C=window.__c1;lastLight.press('KeyW');const pts=[await C.M(1138,3),await C.M(1134,4)];for(let d=1130;d>=606;d-=25)pts.push(await C.M(d,2));pts.push(await C.M(598,4),C.S(10,1.8),...C.sl(10,50,1.8));C.ride(pts,180);});
 await snap('c1-16-retrace-briarwood-dark');
 await c1(()=>{const C=window.__c1;C.ride(C.sl(50,78,1.8),30);lastLight.release('KeyW');C.until(()=>lastLight.state.chapter.phase==='creek',30);C.until(()=>false,8);C.off();});
 await snap('c1-17-creek-flashlight');console.log('creek state',JSON.stringify({ch:(await cstate()).phase,flags:(await cstate()).flags,line:(await cstate()).line,roam:(await state()).roam,said:await c1(()=>window.__c1.said.slice(-6))}));check('Chapter 1: the police keep them back; the creek instead',(await cstate()).phase==='creek');
 await c1(()=>{const C=window.__c1,c=lastLight.chapter.clue.position;C.standAt([c.x+1.2,c.z+.6],[c.x,c.z]);});check('Chapter 1: the reflector can be found',(await state()).prompt==='F:Look closer');await snap('c1-18-reflector-in-the-weeds');
 await c1(()=>{lastLight.key('KeyF');window.__c1.until(()=>lastLight.state.chapter.line==='“That’s his.”',10);});await snap('c1-19-thats-his');
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.line==='“Why would he come back here?”',10));await snap('c1-20-why-would-he-come-back');
 // Chapter One no longer ends on a card: black, CHAPTER TWO, and the same creek moments later.
 await c1(()=>window.__c1.until(()=>lastLight.state.chapter.phase==='c2-black',40));
 check('Chapter 1 hands over to Chapter Two after the bell and the fade (no end menu)',(await state()).state.startsWith('c1-')&&!(await page.locator('#ending').isVisible()));
 await runChapterTwoBrowser({page,snap,check,state,errors});
 check('Chapter Two ends on its own card',(await state()).state==='ended'&&await page.locator('#ending').isVisible());
 const ended=await state();await page.evaluate(()=>lastLight.step(20));check('ending freezes the world',(await state()).finaleT===ended.finaleT&&JSON.stringify((await state()).roam)===JSON.stringify(ended.roam));
 await page.click('#again');await page.evaluate(()=>lastLight.step(.1));const replay=await state();check('replay resets story and clue',replay.distance===0&&!replay.clue&&replay.friends.every(f=>!f.inside&&f.mode==='ride'));
 check('replay resets environment',await page.evaluate(()=>lastLight.ambient.state.kidVisible&&lastLight.ambient.state.car==='wait'&&lastLight.ambient.state.sprinklers.every(v=>v>.99)&&!lastLight.friends.mom.slammed));
 await page.evaluate(()=>lastLight.press('KeyW'));await advanceTo(1136.5);await page.evaluate(()=>{lastLight.release('KeyW');lastLight.step(101);});check('idle route reveals same clue',(await state()).clue);await snap('19-idle-clue');await page.evaluate(()=>lastLight.step(8));check('staying put fades and wakes into the ride home',(await state()).state==='c1-ride'&&(await state()).chapter.phase==='home');
 await page.evaluate(()=>{lastLight.reset();lastLight.press('KeyW');lastLight.step(4);lastLight.release('KeyW');});await page.keyboard.press('Escape');await page.click('#to-title');await page.evaluate(()=>lastLight.step(.5));
 check('back to the title resets and waits',(await state()).state==='intro'&&(await state()).distance<.01&&await page.locator('#intro').isVisible());await snap('26-back-to-title');
 // Chapter One QA jumps: every section reachable directly, rendered, without errors.
 for(const sec of ['alex-departure','ride-home','police','title','alex-house','jamie','sam','oak','retrace','investigation','clue']){await page.evaluate(sec=>{lastLight.jump(sec);lastLight.step(2.5);},sec);await page.waitForTimeout(sec==='title'?1800:300);await snap('qa-jump-'+sec);
  const s=await state();check('QA jump '+sec+' runs',sec==='alex-departure'?s.state==='riding':s.state.startsWith('c1-')&&s.chapter.phase!=='off');}
 // Lingering: staying a long while in a scene changes nothing it should not.
 for(const sec of ['title','alex-house','jamie','oak']){await page.evaluate(sec=>{lastLight.jump(sec);const r=lastLight.roam;if(lastLight.state.state==='c1-ride')lastLight.placePlayer({x:r.x,z:r.z,a:r.a,mode:'ride',speed:0});lastLight.step(150);},sec);const s=await state();await snap('linger-'+sec);
  check('lingering 150 s at '+sec+' keeps the scene intact',s.state.startsWith('c1-')&&Number.isFinite(s.roam.x)&&(sec==='title'?s.chapter.phase==='briarwood':sec==='alex-house'?s.chapter.phase==='briarwood':sec==='jamie'?s.chapter.phase==='friends':s.chapter.phase==='oak'));}
 // Unusual angles: straight up, straight down, behind, and from above the police scene and the creek.
 await page.evaluate(()=>{lastLight.jump('alex-house');lastLight.step(3);});
 for(const [name,yaw,pitch] of [['angle-up',0,.6],['angle-down',0,-1.2],['angle-behind',1.8,0],['angle-behind-other',-1.8,0]]){await page.evaluate(([y,p])=>{lastLight.look(y,p);lastLight.step(.1);},[yaw,pitch]);await snap(name);}
 for(const [name,where] of [['angle-above-police',[124,6]],['angle-above-creek',[100,16]]])await page.evaluate(async w=>{const B=lastLight.world.sideFrames[0],p=B.point(...w);lastLight.camera.position.set(p.x+18,p.y+26,p.z+18);lastLight.camera.lookAt(p.x,p.y,p.z);lastLight.camera.updateMatrixWorld();},where).then(()=>snap(name));
 check('unusual angles render without errors',errors.length===0);
 await runChapterTwoJumps({page,snap,check,state,errors});
 await runChapterTwoCloseups({page,snap,check,state,errors});
 await page.evaluate(()=>{lastLight.toTitle();lastLight.step(.2);});check('Continue is offered on the title after reaching the night',await page.locator('#continue').isVisible());await snap('c1-22-title-continue');
 // Character close-ups: the camera is set beside each person for a single rendered frame.
 const portrait=async(name,who,off)=>{await page.evaluate(async([who,off])=>{const T=await import('./three.module.js');const F=lastLight.friends.list;const person=who==='mom'?lastLight.friends.mom.person:F.find(f=>f.key===who).person;
  lastLight.scene.updateMatrixWorld(true);const p=person.parts.head.getWorldPosition(new T.Vector3()),q=person.group.getWorldQuaternion(new T.Quaternion());lastLight.camera.position.copy(p).add(new T.Vector3(...off).applyQuaternion(q));lastLight.camera.lookAt(p.x,p.y-.25,p.z);lastLight.scene.children.find(o=>o.isMesh&&o.geometry?.parameters?.radius===350)?.position.copy(lastLight.camera.position);lastLight.camera.updateMatrixWorld();},[who,off]);await snap(name,{clean:true});};
 await page.click('#start');await page.evaluate(()=>{lastLight.press('KeyW');lastLight.step(22);});
 for(const who of ['jamie','sam','alex']){await portrait('character-'+who+'-front',who,[.55,.05,-1.25]);await portrait('character-'+who+'-side',who,[1.9,-.15,-.2]);}
 // Sidewalk riding: up a driveway cut and along the walk.
 const cut=await page.evaluate(()=>{const s=lastLight.state,c=lastLight.world.drivewayOpenings.filter(dr=>dr.side>0&&dr.d>s.distance+15&&dr.d<s.distance+160).sort((a,b)=>a.d-b.d)[0];return {d0:c.d0,d1:c.d1};});
 await page.evaluate(c=>{lastLight.place(c.d0+.4,5.4,3.2);lastLight.press('KeyW');let on=false;for(let i=0;i<90;i++){const s=lastLight.state;if(!on&&s.lateral<6.75)lastLight.press('KeyD');else{lastLight.release('KeyD');on=true;}lastLight.step(1/30);}lastLight.release('KeyD');lastLight.step(2.5);},cut);
 {const s=await state();check('riding along the sidewalk in the browser',s.lateral>6.3&&s.lateral<7.9&&s.distance>cut.d1+4);}await snap('sidewalk-01-riding',{clean:true});await view('sidewalk-02-looking-down',0,-1.0);
 // House QA: several kinds of house from the front corner, the side and the back corner.
 const picks=await page.evaluate(()=>{const H=lastLight.world.houses.filter(p=>p.frameId==='main'&&p.lod==='full'&&!p.key&&p.u>60&&p.u<700),out=[];
  for(const want of [p=>p.style==='ranch'&&p.brick==='front',p=>p.style==='colonial'&&p.porch==='porch',p=>p.style==='cape',p=>p.style==='frontgable',p=>p.style==='ranch'&&p.roof==='hip',p=>p.style==='colonial'&&p.brick==='lower']){const h=H.find(p=>want(p)&&!out.includes(p));if(h)out.push(h);}
  return out.map(h=>({u:h.u,side:h.side,name:h.style+(h.brick?'-brick-'+h.brick:'')+(h.roof==='hip'?'-hip':'')+(h.porch==='porch'?'-porch':''),w:h.w,depth:h.depth}));});
 check('house QA found varied houses',picks.length>=5);
 for(const [i,h] of picks.entries()){const plan={u:h.u,side:h.side},tag=`house-q${i+1}-${h.name}`;
  await camAt(tag+'-front-corner',{plan,from:[h.w/2+6,2.0,h.depth/2+9],at:[0,2.4,0]});await camAt(tag+'-side',{plan,from:[h.w/2+11,1.8,.5],at:[0,2.2,0]});await camAt(tag+'-back-corner',{plan,from:[-(h.w/2+6),2.4,-(h.depth/2+10)],at:[0,2.4,0]});}
 await page.evaluate(()=>{lastLight.place(lastLight.state.distance,-.3,4);let n=0;while(lastLight.state.distance<402&&n++<9000)lastLight.step(1/30);});await portrait('character-mom','mom',[.5,.05,-1.4]);
 // Player-reported regressions, tested with actual input and rendered contact frames.
 await page.evaluate(()=>{lastLight.reset();lastLight.press('KeyW');lastLight.step(8);lastLight.release('KeyW');lastLight.press('KeyS');lastLight.step(13);lastLight.release('KeyS');lastLight.look(0,-1.1);});
 check('all four riders stop with feet down',await page.evaluate(()=>lastLight.friends.list.every(f=>f.speed<.25&&Math.min(f.person.joints.lankle.y,f.person.joints.rankle.y)<.078)&&lastLight.self.joints.lankle.y<.078));
 await snap('polish-stopped-player',{clean:true});for(const who of ['jamie','sam','alex'])await camAt('polish-stopped-'+who,who,[1.7,.05,-1.2],[0,.65,0]);
 await page.evaluate(()=>{lastLight.look(0,-.8);lastLight.step(.05);});await snap('polish-bell-before',{clean:true});
 const wrist=await page.evaluate(()=>lastLight.self.joints.lwrist.toArray());await page.keyboard.press('Space');await page.evaluate(()=>lastLight.step(.13));
 check('bell hand reaches and lever presses at the strike',await page.evaluate(w=>Math.hypot(...lastLight.self.joints.lwrist.toArray().map((v,i)=>v-w[i]))>.035&&Math.abs(lastLight.playerBike.bell.lever.rotation.x)>.2,wrist));await snap('polish-bell-press',{clean:true});
 await page.evaluate(()=>lastLight.step(.7));check('bell lever returns',await page.evaluate(()=>lastLight.playerBike.bell.lever.rotation.x===0));await snap('polish-bell-return',{clean:true});
 check('only contextual bell control shown while riding',(await state()).prompt==='Space:Ring bell');
 const signCount=await page.evaluate(()=>lastLight.world.originals.filter(o=>o.name==='sign-face').length);
 for(let i=0;i<signCount;i++){
  const data=await page.evaluate(async i=>{const T=await import('./three.module.js'),W=lastLight.world,o=W.originals.filter(o=>o.name==='sign-face')[i],g=o.geometry;g.computeBoundingBox();const p=g.boundingBox.getCenter(new T.Vector3()),n=new T.Vector3().fromBufferAttribute(g.attributes.normal,0).normalize();lastLight.camera.position.copy(p).addScaledVector(n,1.7);lastLight.camera.lookAt(p);lastLight.scene.children.find(o=>o.isMesh&&o.geometry?.parameters?.radius===350)?.position.copy(lastLight.camera.position);lastLight.camera.updateMatrixWorld();return {name:o.userData.sign,map:o.material.map?.uuid,preserved:W.merged.some(m=>m.material.map===o.material.map)};},i);
  check('sign texture survives batching '+i+' '+data.name,!!data.map&&data.preserved);await snap('polish-sign-'+String(i).padStart(2,'0'),{clean:true});
 }
 for(const side of [-1,1])for(const direction of ['up','down'])for(const slow of [false,true]){
  await page.evaluate(({side,direction})=>{const W=lastLight.world;let d=80;while(d<1050&&(W.drivewayOpenings.some(c=>c.side===side&&c.d1>d-1&&c.d0<d+23)||W.obstacles.some(o=>o.d1>d-1&&o.d0<d+23&&Math.sign(o.l0)===side&&Math.min(Math.abs(o.l0),Math.abs(o.l1))<8)))d++;lastLight.place(d,side*(direction==='up'?4.25:7.5),2.8);lastLight.look(0,-.95);lastLight.press('KeyW');lastLight.press(side*(direction==='up'?1:-1)>0?'KeyD':'KeyA');}, {side,direction});
  const tag=`polish-curb-${side<0?'left':'right'}-${direction}-${slow?'slow':'normal'}`;
  const contact=await page.evaluate(({slow,direction})=>{let maxOffset=0,front=null,rear=null;for(let i=0;i<(slow?850:120);i++){if(slow){if(lastLight.state.speed>1.1)lastLight.press('KeyS');else lastLight.release('KeyS');}lastLight.step(1/30);const c=lastLight.contact.state;maxOffset=Math.max(maxOffset,Math.abs(c.offset));front=front||c.events.find(e=>e.wheel==='front'&&e.direction===direction);rear=rear||c.events.find(e=>e.wheel==='rear'&&e.direction===direction);if(front&&rear)break;}return {front,rear,maxOffset};},{slow,direction});
  check(tag+' front and rear contacts',contact.front&&contact.rear&&contact.maxOffset<.009);await snap(tag,{clean:true});
  await page.evaluate(()=>{for(const k of ['KeyW','KeyS','KeyA','KeyD'])lastLight.release(k);});
 }
 await page.evaluate(()=>{lastLight.reset();lastLight.press('KeyW');});await advanceTo(1136.5);await page.evaluate(()=>{lastLight.release('KeyW');lastLight.step(38);lastLight.key('KeyF');lastLight.step(2);});
 await page.evaluate(()=>{const d=lastLight.ending.drawing.position;lastLight.camera.position.copy(d).add({x:0,y:1.5,z:8});lastLight.camera.lookAt(d.x,d.y+1.5,d.z+30);lastLight.camera.updateMatrixWorld();lastLight.ending.update(.1,{callDone:true,fade:0,ended:false,camera:lastLight.camera});lastLight.ending.update(.1,{callDone:true,fade:0,ended:false,camera:lastLight.camera});});
 check('fifth chalk rider appears only after call and looking away',await page.evaluate(()=>lastLight.ending.state.fifthRider));
 await page.evaluate(()=>{const d=lastLight.ending.drawing.position;lastLight.camera.position.copy(d).add({x:.4,y:1.4,z:1});lastLight.camera.lookAt(d);lastLight.camera.updateMatrixWorld();});await snap('polish-fifth-rider',{clean:true});
 await page.evaluate(()=>{const s=lastLight.state;lastLight.walkTo(s.distance,s.lateral+.8);lastLight.step(.1);});check('bike prompt becomes Go home',(await state()).prompt==='F:Go home');await snap('polish-go-home');
 await page.evaluate(()=>{lastLight.reset();lastLight.step(.1);});check('replay resets added lore and impact state',await page.evaluate(()=>!lastLight.ending.fifth.visible&&!lastLight.ending.state.fifthRider&&lastLight.contact.state.events.length===0));
 // A laptop title screen must keep the complete controls and buttons available.
 await page.setViewportSize({width:1280,height:720});await page.waitForFunction(()=>Math.abs(lastLight.camera.aspect-1280/720)<.001);await page.evaluate(()=>{lastLight.toTitle();lastLight.step(.1);});await snap('polish-title-laptop');
 check('laptop title controls fit',await page.locator('.controls').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight&&lastLight.state.state==='intro'&&getComputedStyle(document.querySelector('#prompt')).visibility==='hidden'));await page.setViewportSize({width:1440,height:900});

 await runAstraChecks({page,snap,check,camAt,state});
 const sceneInventory=await runSceneChecks({page,snap,check,camAt,state});
 const gpu=await page.evaluate(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});
 // Real Web Audio renders of every important synthesized sound, retained for listening.
 const audioReport=await page.evaluate(async()=>{
  const {createAudio}=await import('./audio.js');const clips=[];
  for(const name of ['rolling','grass','coasting','footstep-asphalt','footstep-grass','bell','curb','sprinkler','dribble','rim','doorOpen','doorSlam','garage','bikeDrop','kickstand','engineOff','dog','creak','bird','call','morning-neighborhood','evening-neighborhood','ending','tap','pebble','window','click','squelch','carDoor','callName','siren-near','siren-far-muffled','night-search','chapter-ending','distant-final-bell','culvert-bell','culvert-loop','fan-window','morning-search','memory-muffled']){
   const ctx=new OfflineAudioContext(2,48000*(name.includes('ending')?10:7),48000);let seed=2011;const audio=createAudio({context:ctx,random:()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}});audio.ensure();audio.setEnabled(true);
   const ready=ctx.suspend(.75),rendering=ctx.startRendering();await ready;
   const ride={speed:4.5,pedal:true,coasting:false,onBike:true,surface:'asphalt',p:.2,night:0,finale:0,listener:{x:0,y:1.5,z:0},forward:{x:0,z:-1},friendsLeft:3,state:'riding',crank:2,sources:[]};
   if(name==='rolling'||name==='grass'||name==='coasting'){audio.update(1/30,{...ride,surface:name==='grass'?'grass':'asphalt',coasting:name==='coasting',pedal:name!=='coasting',p:1,night:0,finale:2});}
   else if(name.startsWith('footstep-'))audio.footstep(name.slice(9),1.1);
   else if(name==='morning-neighborhood'||name==='evening-neighborhood')audio.update(1/30,{...ride,p:name.startsWith('evening')?1:.1,night:name.startsWith('evening')?.8:0,speed:0,onBike:false,friendsLeft:name.startsWith('evening')?0:3,sources:name.startsWith('evening')?[]:[{kind:'mower',pos:{x:-25,y:0,z:-20},level:1},{kind:'engine',pos:{x:14,y:0,z:-10},level:.6}]});
   else if(name.startsWith('siren-')){const far=name.includes('far');for(let k=0;k<45;k++)audio.update(1/30,{...ride,speed:0,onBike:false,p:1,night:1,night1:true,finale:40,sources:[{id:'siren',kind:'siren',pos:{x:0,y:1,z:far?-420:-25},level:1,pitch:far?1.02:.96,mode:'wail',muffle:far?1:0}]});}
   else if(name==='night-search'){for(let k=0;k<45;k++)audio.update(1/30,{...ride,speed:0,onBike:false,p:1,night:1,night1:true,finale:40,state:'walking',sources:[{id:'radio',kind:'radio',pos:{x:4,y:1,z:-6},level:1},{id:'water',kind:'water',pos:{x:-3,y:0,z:-5},level:1},{id:'idle-a',kind:'idle',pos:{x:8,y:0,z:-12},level:.8},{id:'tv',kind:'tv',pos:{x:-2,y:1,z:-3},level:1}]});}
   else if(name==='distant-final-bell'){audio.update(1/30,{...ride,speed:0,onBike:false,p:1,night:1,night1:true,finale:40,sources:[]});audio.bell({x:5,y:1,z:-47},1.8);}
   // Chapter Two: the bell from inside the culvert, the culvert and channel, Sam's fan through the window, the morning search, a memory.
   else if(name==='culvert-bell'){audio.update(1/30,{...ride,speed:0,onBike:false,p:1,night:1,night1:true,finale:40,state:'walking',sources:[]});audio.bell({x:3,y:1,z:-25},1.5,{tunnel:true});}
   else if(name==='culvert-loop'||name==='fan-window'){const src=name==='fan-window'?[{id:'fan',kind:'fan',pos:{x:2,y:1,z:-3},level:1}]:[{id:'culvert',kind:'culvert',pos:{x:2,y:.5,z:-6},level:1},{id:'channel',kind:'water',pos:{x:-1,y:0,z:-3},level:.7}];for(let k=0;k<45;k++)audio.update(1/30,{...ride,speed:0,onBike:false,p:1,night:1,night1:true,finale:40,state:'walking',sources:src});}
   else if(name==='morning-search'){for(let k=0;k<45;k++)audio.update(1/30,{...ride,speed:0,onBike:false,p:0,night:0,night1:true,morning:true,finale:40,state:'walking',friendsLeft:0,sources:[{id:'radio-am',kind:'radio',pos:{x:6,y:1,z:-8},level:.8}]});}
   else if(name==='memory-muffled'){audio.memory(true);for(let k=0;k<45;k++)audio.update(1/30,{...ride,p:.5});audio.bell({x:4,y:1,z:-12},.75);}
   else if(name==='callName')audio.callName({x:-30,y:1.7,z:-60});else if(name==='chapter-ending')audio.ending('chapter');
   else if(['bell','call','ending'].includes(name))audio[name]();else audio.sfx(name,null);
   await ctx.resume();const b=await rendering,channels=[b.getChannelData(0),b.getChannelData(1)];let peak=0,sum=0,nonFinite=0,jump=0;
   for(const a of channels)for(let i=0;i<a.length;i++){peak=Math.max(peak,Math.abs(a[i]));sum+=a[i]*a[i];if(!Number.isFinite(a[i]))nonFinite++;if(i)jump=Math.max(jump,Math.abs(a[i]-a[i-1]));}
   const pcm=new Int16Array(b.length*2);for(let i=0;i<b.length;i++)for(let c=0;c<2;c++)pcm[i*2+c]=Math.round(Math.max(-1,Math.min(1,channels[c][i]))*32767);
   const bytes=new Uint8Array(pcm.buffer);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   clips.push({name,peak,rms:Math.sqrt(sum/(b.length*2)),nonFinite,maxSampleJump:jump,pcm:btoa(binary)});
  }
  return clips;
 });
 function wav(pcm){const b=Buffer.alloc(44+pcm.length);b.write('RIFF',0);b.writeUInt32LE(36+pcm.length,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(48000,24);b.writeUInt32LE(192000,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(pcm.length,40);pcm.copy(b,44);return b;}
 const audioDir=path.join(out,'audio');fs.mkdirSync(audioDir,{recursive:true});for(const c of audioReport){fs.writeFileSync(path.join(audioDir,c.name+'.wav'),wav(Buffer.from(c.pcm,'base64')));delete c.pcm;check('audio finite and unclipped: '+c.name,c.nonFinite===0&&c.peak<.95&&c.peak>1e-5);}
 fs.writeFileSync(path.join(out,'errors.json'),JSON.stringify(errors,null,2));check('no JavaScript or shader errors',errors.length===0);
 const report={runtimeHashes,browser:browser.version(),gpu,passed:checks.length,checks,frames,sceneInventory,audio:audioReport,errors,audioLimitation:'Offline Web Audio signal checks and recorded clips; no claim of perceptual listening.'};fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();server.close();}
