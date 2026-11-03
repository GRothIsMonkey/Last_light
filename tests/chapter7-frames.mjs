// Chapter Seven: the frames a person should look at, in Chromium (SwiftShader unless BROWSER_GPU=1), sound off.
// Each shot starts from a QA jump, plays the beat for as long as it takes to reach the moment (the game's own update, no
// shortcuts inside the beat), turns the camera to what matters and saves a full-page screenshot. Unlike the walkthrough
// (tests/chapter7-browser.mjs), which captures after each checked beat, these are taken DURING the beats: the thing in the
// garage, the hand on the doorframe, the father at the glass, the large thing, the hand on Jamie's ankle.
// SHOTS=a,b,... takes only those; QA_OUTPUT (default docs/qa/chapter7-the-street-that-wasnt-there/frames) gets the jpgs
// and frames.json. BATCH (default 6): shots per browser (software GL memory).
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter7-the-street-that-wasnt-there/frames');fs.mkdirSync(out,{recursive:true});
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json',png:'image/png',jpg:'image/jpeg'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);if(u==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.join(repo,u.replace(/^\//,''));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage','--enable-precise-memory-info','--js-flags=--expose-gc'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist');
let browser,page;const errors=[],frames=[];
async function open(){if(browser)await browser.close().catch(()=>{});browser=await pw.chromium.launch({headless:true,args});page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
 await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
 // helpers in the page: face a point, step with a callback, hold a key
 await page.evaluate(()=>{const L=lastLight;window.__f={
  face(q,{pitch=null}={}){const c=L.camera.position,a=Math.atan2(q.x-c.x,-(q.z-c.z)),pt=pitch??Math.atan2((q.y??c.y)-c.y,Math.hypot(q.x-c.x,q.z-c.z));L.face(a,pt);},
  run(sec,each){const n=Math.ceil(sec*30);for(let i=0;i<n;i++){L.step(1/30);each?.();}},
  until(fn,max=20,each){const n=Math.ceil(max*30);for(let i=0;i<n;i++){if(fn())return true;L.step(1/30);each?.();}return !!fn();},
  key(type,code){dispatchEvent(Object.assign(new Event(type),{code}));}};});}
const snap=async(name,note='')=>{await page.evaluate(()=>{for(const id of ['objective','objective-note','prompt','subtitle','fade','chapter-card','ending'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await page.evaluate(()=>{const r=lastLight.render(),s=lastLight.chapter7.state;return {phase:s.phase,calls:r.calls,triangles:r.triangles,caption:document.getElementById('subtitle').textContent.slice(0,100),hunter:s.hunter?{state:s.hunter.state,mode:s.hunter.mode,visible:s.hunter.visible}:null};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:300000});frames.push({name,note,...info});console.log('frame',name,JSON.stringify(info));};
// The shots. Each is [name, note, page function that sets the moment up]. The page function may return a list of
// [name, note, page function] continuations taken in order after it (the beat goes on between them).
const A7='lastLight.chapter7';
const SHOTS=[
 ['01-sams-room','Sam’s room, the morning: the desk, the photograph in its frame, the fan',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-fan');F.run(1.2);F.face(A.house.SPOTS.photo);F.run(.4);}],
 ['02-the-fan','The box fan by the bed, running',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-fan');F.run(.8);F.face(A.house.SPOTS.fan);F.run(.3);}],
 ['03-photo-four','The photograph in your hand: the four of you at the oak',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-fan');F.run(.5);A.act('c7-photo');F.run(2.6);}],
 ['04-garage-glimpse','The garage: low by the side door, the head turned to you',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-garage');F.run(.5);const SH=L.world?.homes?.sam||A.world?.homes?.sam;
   const gp=A.garageView();L.placePlayer({x:gp.x,z:gp.z,a:gp.a,mode:'walk',bike:{x:gp.x+3,z:gp.z+3,a:0}});F.until(()=>A.state.hunter.visible,4);F.run(.5,()=>F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor())));}],
 ['05-garage-hand','The garage: a long hand flat on the floor; then out the side door',()=>{const L=lastLight,A=L.chapter7,F=__f;F.run(.9,()=>F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor())));}],
 ['06-reyes-table','Officer Reyes at Sam’s kitchen table',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-reyes');F.run(3);F.face(A.reyesHead());F.run(.3);}],
 ['07-the-map','The 1958 plan over the 2009 map (the old plan showing)',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-map');F.run(2.5);F.key('keydown','KeyD');F.key('keyup','KeyD');F.run(.5);F.key('keydown','KeyD');F.key('keyup','KeyD');F.run(1.2);}],
 ['08-the-lane','The lane behind the oak (the right-of-way), late afternoon',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lane');F.run(1);F.face(A.court.SPOT.inLane);F.run(.3);}],
 ['09-old-mill-court','Old Mill Court from the head of the street',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-court');F.run(1.5);F.face({...A.court.W3(-6,70),y:A.court.G0+1.5});F.run(.3);}],
 ['10-dining-still','The family at the table, not moving (through the window)',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-dining-scare');F.until(()=>A.C.dn?.stage==='turn',30,()=>F.face(A.court.SPOT.diningWindow));F.run(1.5,()=>F.face(A.court.SPOT.diningWindow));}],
 ['11-dining-heads','Their heads turned to you',()=>{const L=lastLight,A=L.chapter7,F=__f;F.until(()=>A.C.dn?.stage==='lunge',8,()=>F.face(A.court.SPOT.diningWindow));}],
 ['12-dining-glass','The father at the glass (the hit)',()=>{const L=lastLight,A=L.chapter7,F=__f;F.until(()=>A.C.dn?.stage==='after',4,()=>F.face(A.court.SPOT.diningWindow));F.run(.35,()=>F.face(A.court.SPOT.diningWindow));}],
 ['13-reveal-hand','The top of the stairs: a hand round the doorframe',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-reveal');const top=A.court.H3(-.6,2.9,null,'u');top.y+=1.5;F.run(1.4,()=>F.face(top));}],
 ['14-reveal-landing','It comes out onto the landing, looking at you',()=>{const L=lastLight,A=L.chapter7,F=__f;const top=A.court.H3(0,2.9,null,'u');top.y+=1.4;F.run(4.2,()=>F.face(top));}],
 ['15-reveal-stairs','It comes down',()=>{const L=lastLight,A=L.chapter7,F=__f;F.run(4.5,()=>F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor())));}],
 ['16-stealth','The stealth: it walks the rooms (from the kitchen door)',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-stalk');F.run(.3);A.act('c7-unhide');F.run(.5);const k=A.court.H3(2.1,1.6);L.placePlayer({x:k.x,z:k.z,a:0,mode:'walk'});F.run(9,()=>F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor())));}],
 ['17-boys-room','The boy’s room, August 1991',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-clues');F.run(1);F.face({...A.court.H3(-4.6,2.0,null,'u'),y:A.court.G0+A.court.HG.HH.UP+1.3});F.run(.3);}],
 ['18-old-bike','The old green bike in the storeroom',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-old-bike');F.run(1);F.face({...A.court.H3(-3.6,-2.5,null,'u'),y:A.court.G0+A.court.HG.HH.UP+.6});F.run(.3);}],
 ['19-giant','From the hall window: something far too large behind the roofs',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-giant');F.run(9.5,()=>F.face(A.court.W3(70,96,A.court.G0+9)));}],
 ['20-chase','The chase: it comes behind you on the court',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-chase');F.key('keydown','KeyW');F.run(7);F.key('keyup','KeyW');F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor()));F.run(.2);}],
 ['21-grab','At the oak: its hand on Jamie’s ankle',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-grab');F.run(2.6,()=>F.face(A.HM.sockets.grab.getWorldPosition(new L.camera.position.constructor())));}],
 ['22-struggle','Your hands on his wrist',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-struggle');F.key('keydown','KeyF');F.run(3);F.key('keyup','KeyF');}],
 ['23-gum','The gum in the grass',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-gum-pickup');F.run(1);const g=A.C.gumAt||A.house.items.gum.getWorldPosition(new L.camera.position.constructor());F.face(g);F.run(.3);}],
 ['24-photo-one','The same photograph that night: only you',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-photo');F.run(.5);if(A.C.view!=='inspect')A.act('c7-photo');F.run(2.8);}],
 ['25-names','The names, in your hand',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-names');F.run(.8);F.key('keydown','KeyF');F.until(()=>A.C.flags.names,14);F.key('keyup','KeyF');F.run(1);}],
 ['26-final-image','Four bikes under the streetlight',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-window');F.run(.6);A.act('c7-window');F.run(7);}],
 ['27-end-card','The end card',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('chapter7-end');F.until(()=>L.state.state==='ended',40);F.run(1);}],
];
const want=process.env.SHOTS?new Set(process.env.SHOTS.split(',')):null,list=SHOTS.filter(s=>!want||want.has(s[0])),BATCH=+process.env.BATCH||6;
try{for(const [i,[name,note,fn]] of list.entries()){const cont=i>0&&/^(05|11|12|14|15)-/.test(name);if(!cont&&i%BATCH===0)await open();else if(!cont&&!page)await open();
  try{await page.evaluate(`(${fn.toString()})()`);await snap(name,note);}catch(e){errors.push(name+': '+String(e.message||e).slice(0,300));console.log('ERR',name,String(e.message||e).slice(0,300));}
  await page.evaluate(()=>globalThis.gc?.());}}
finally{fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({frames,errors},null,2));await browser?.close();server.close();console.log(JSON.stringify({frames:frames.length,errors}));}
