// Chapter Seven: the frames a person should look at, in Chromium (SwiftShader unless BROWSER_GPU=1), sound off.
// Each shot starts from a QA jump, plays the beat for as long as it takes to reach the moment (the game's own update, no
// shortcuts inside the beat), turns the camera to what matters and saves a full-page screenshot. Unlike the walkthrough
// (tests/chapter7-browser.mjs), which captures after each checked beat, these are taken DURING the beats: the thing in the
// garage, the hand on the doorframe, the father at the glass, the large thing, the hand on Jamie's ankle.
// SHOTS=a,b,... takes only those; QA_OUTPUT (default docs/qa/chapter7-the-street-that-wasnt-there/frames) gets the jpgs
// and frames.json. BATCH (default 6): shots per browser (software GL memory).
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter7-the-street-that-wasnt-there/frames');fs.mkdirSync(out,{recursive:true});
const runtimeHashes=Object.fromEntries(fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).sort().map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json',png:'image/png',jpg:'image/jpeg'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);if(u==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.join(repo,u.replace(/^\//,''));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage','--enable-precise-memory-info','--js-flags=--expose-gc'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist');
let browser,page;const errors=[],frames=[];
async function open(){if(browser)await browser.close().catch(()=>{});browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args});page=await browser.newPage({viewport:{width:1440,height:900}});
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
 ['a01-foyer-from-entry','The whole foyer from the player’s entry, after the footsteps stop',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-green-star');F.run(1.6);const p=A.court.H3(-.12,-1.02);p.y+=1.32;F.face(p);F.run(.3);}],
 ['a03-jamie','Jamie at the curb in daylight, shortly before the ride',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-curb');F.run(1.4);const j=L.chapter.kit.jamie.person,head=j.parts.head.getWorldPosition(new L.camera.position.constructor()),p=j.group.position,dx=L.camera.position.x-p.x,dz=L.camera.position.z-p.z,d=Math.hypot(dx,dz)||1;L.placePlayer({x:p.x+dx/d*1.5,z:p.z+dz/d*1.5,a:0,mode:'walk'});F.run(.25,()=>F.face(head));}],
 ['a04-after-grip','The empty lane after Jamie has gone, at the gum checkpoint',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-gum-pickup');F.run(1);const p=A.court.SPOT.mouth;F.face({x:p.x,y:p.y+1.05,z:p.z});F.run(.2);}],

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
 ['13-reveal-hand','The top of the stairs: a hand round the post at the corner',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-reveal');const top=A.court.H3(-.3,2.8,null,'u');top.y+=1.2;F.run(1.6,()=>F.face(top));}],
 ['14-reveal-landing','It comes out onto the landing, looking at you',()=>{const L=lastLight,A=L.chapter7,F=__f;const top=A.court.H3(0,2.9,null,'u');top.y+=1.4;F.run(4.2,()=>F.face(top));}],
 ['15-reveal-stairs','It comes down',()=>{const L=lastLight,A=L.chapter7,F=__f;F.run(4.5,()=>F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor())));}],
 ['16-stealth','The stealth: it comes through the living room (seen from the dining room, past the foyer)',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-stalk');F.run(.3);A.act('c7-unhide');F.run(.5);const k=A.court.H3(2.0,-2.9);L.placePlayer({x:k.x,z:k.z,a:0,mode:'walk'});
   const look=A.court.H3(-2.4,-2.6);look.y=A.court.G0+A.court.HG.HH.F+1.2;F.until(()=>{const q=A.court.regL(A.HM.x,A.HM.z),h=A.court.cToH(q.x,q.z);return h.x<-1.5&&h.z<-1.6;},40,()=>F.face(look));F.run(.4,()=>F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor())));}],
 ['17-boys-room','The boy’s room, August 1991',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-clues');F.run(1);F.face({...A.court.H3(-3.3,.085,null,'u'),y:A.court.G0+A.court.HG.HH.UP+1.4});F.run(.3);}],
 ['18-old-bike','The old green bike in the storeroom',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-old-bike');F.run(1);F.face({...A.court.H3(-3.6,-2.5,null,'u'),y:A.court.G0+A.court.HG.HH.UP+.6});F.run(.3);}],
 ['19-giant','From the hall window: something far too large behind the roofs',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-giant');F.run(9.5,()=>F.face(A.court.W3(70,96,A.court.G0+9)));}],
 ['20-chase','The chase: it comes behind you on the court',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-chase');F.key('keydown','KeyW');F.run(7);F.key('keyup','KeyW');F.face(A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor()));F.run(.2);}],
 ['21-grab','At the oak: its hand on Jamie’s ankle',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-grab');F.run(2.6,()=>F.face(A.HM.sockets.grab.getWorldPosition(new L.camera.position.constructor())));}],
 ['22-struggle','Your hands on his wrist',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-grab');F.run(2.6);A.act('c7-grab');F.key('keydown','KeyF');F.run(3);F.key('keyup','KeyF');}],// (as played: it has him; F on his hand)
 ['23-gum','The gum in the grass',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-gum-pickup');F.run(1);const g=A.C.gumAt||A.house.items.gum.getWorldPosition(new L.camera.position.constructor());F.face(g);F.run(.3);}],
 ['24-photo-one','The same photograph that night: only you',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-photo');F.run(.5);if(A.C.view!=='inspect')A.act('c7-photo');F.run(2.8);}],
 ['25-names','The names, in your hand',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-names');F.run(.8);F.key('keydown','KeyF');F.until(()=>A.C.flags.names,14);F.key('keyup','KeyF');F.run(1);}],
 ['26-final-image','Four bikes under the streetlight',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-window');F.run(.6);A.act('c7-window');F.run(7);}],
 ['27-end-card','The end card',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('chapter7-end');F.until(()=>L.state.state==='ended',40);F.run(1);}],
 // ---- the expansion: the Langes' (Old Mill Court, No. 5) ----
 ['x10-lange-door','The Langes’: the door that was shut, standing open, the TV’s light inside',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange');F.run(1.5);const d=A.court.SPOT.langeDoor;F.face({x:d.x,y:d.y+1.3,z:d.z});F.run(.3);}],
 ['x11-lange-front','The front room: a 1959 set on a test card, the couch, the Courier and an ashtray, the cigarette still going',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-in');F.run(.4);const w=A.court.LW3(-1.2,-3.6),t=A.lgP({x:-4.6,y:A.LGH.F+.7,z:-1.6});
   L.placePlayer({x:w.x,z:w.z,a:Math.atan2(t.x-w.x,-(t.z-w.z)),mode:'walk',bike:{x:w.x+30,z:w.z+30,a:0}});F.run(1.2);F.face(t);F.run(.3);}],
 ['x12-lange-kitchen','The kitchen: dinner for three, one plate untouched and still steaming; the cap on the chair',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-in');F.run(.4);const w=A.court.LW3(1.2,-1.0),t=A.lgP({x:3.2,y:A.LGH.F+.75,z:-2.2});
   L.placePlayer({x:w.x,z:w.z,a:Math.atan2(t.x-w.x,-(t.z-w.z)),mode:'walk',bike:{x:w.x+30,z:w.z+30,a:0}});F.run(1.2);F.face(t);F.run(.3);}],
 ['x13-lange-phone','The phone, and the board beside it: Ruth Ann Carver, 1966; Danny Whitcomb, 1991; an empty pin',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-in');F.run(.4);const w=A.court.LW3(.9,-3.2);
   L.placePlayer({x:w.x,z:w.z,a:0,mode:'walk',bike:{x:w.x+30,z:w.z+30,a:0}});F.run(.5);A.act('c7-lg-phone');F.run(3.5);}],
 ['x14-lange-bath-door','The hall: the light under the bathroom door, and a shadow across it',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-in');F.run(.4);A.C.lg.stage='presence';A.C.lg.presAt=A.C.lg.t;A.C.lg.hallAt=A.C.lg.t;A.LGH.feetAt(true,-.12);A.LGH.strain(.8);
   const w=A.court.LW3(-2.4,.95),t=A.lgP({x:-.2,y:A.LGH.F+.55,z:1.55});L.placePlayer({x:w.x,z:w.z,a:Math.atan2(t.x-w.x,-(t.z-w.z)),mode:'walk',bike:{x:w.x+30,z:w.z+30,a:0}});F.run(1.0);F.face(t);F.run(.3);}],
 ['x15-lange-drawings','His room: three drawings over the bed, the same picture three times (R.A.C. 1966, D.W. 1991, and one with no name yet)',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-scare');F.run(.5);A.act('c7-lg-drawings');F.run(2.4);}],
 ['x16-lange-burst','It comes out of the bathroom and through his door; the chair goes',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-scare');F.run(.5);A.act('c7-lg-drawings');F.until(()=>!!A.C.lg.burst,30);
   const fig=()=>{const f=A.LF.F;return {x:f.x,y:f.y+1.4,z:f.z};};F.until(()=>A.LF.F.path&&A.LF.F.path.i>=5,3,()=>F.face(fig()));F.run(.12,()=>F.face(fig()));}],
 ['x17-lange-loom','It stands too close, mouth open; Jamie between you and it, arms out',()=>{const L=lastLight,A=L.chapter7,F=__f;const fig=()=>{const f=A.LF.F;return {x:f.x,y:f.y+1.45,z:f.z};};F.until(()=>A.C.lg.stage==='loom',3,()=>F.face(fig()));F.run(.9,()=>F.face(fig()));}],// (goes on from x16)
 ['x18-lange-front-burst','The other choice (leave): it comes into the front room after you; the couch goes',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-lange-in');F.run(.4);Object.assign(A.C.lg,{stage:'leave',leaveAt:A.C.lg.t,phoned:true,shoved:true,choice:'leave'});
   const w=A.court.LW3(-1.3,-3.2),t=A.lgP({x:-2.4,y:A.LGH.F+1.3,z:.2});L.placePlayer({x:w.x,z:w.z,a:Math.atan2(t.x-w.x,-(t.z-w.z)),mode:'walk',bike:{x:w.x+30,z:w.z+30,a:0}});F.face(t);
   F.until(()=>!!A.C.lg.burst,3);const fig=()=>{const f=A.LF.F;return {x:f.x,y:f.y+1.4,z:f.z};};F.until(()=>A.C.lg.stage==='loom',4,()=>F.face(fig()));F.run(.5,()=>F.face(fig()));}],
 // ---- the expansion: Sam's house, Reyes's second look ----
 ['x01-tour-poster','The Tour de Oak Hollow poster, out of the tube',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-memory');F.run(.6);F.until(()=>!!A.C.mem,20);A.act('c7-tube');F.run(3);}],
 ['x02-machine','The answering machine on the kitchen counter, its cord',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-machine');F.run(1);const q=A.house.SPOTS.machine;F.face(q);F.run(.3);}],
 ['x03-records-map','The map: MH-12, the streetlight schedule, the crayon circle',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-records');F.run(2);A.MAPV.mh=true;A.MAPV.photo=true;A.MAPV.sched=true;A.MAPV.crayon=1;A.MAPV.overlay=.2;F.run(.5);}],
 // ---- the expansion: the green-door house ----
 ['x20-green-star','A folded gum-wrapper star on the second stair',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-green-star');F.run(1);const s=A.court.HG.extra.starAt,w=A.court.H3(s.x,s.z);F.face({x:w.x,y:A.court.G0+s.y,z:w.z});F.run(.3);}],
 ['x21-green-prints','Wet prints across the kitchen, out of the closet under the stairs',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-green-star');F.run(.5);const w=A.court.H3(1.5,1.4),t=A.court.H3(2.8,2.6);
   L.placePlayer({x:w.x,z:w.z,a:Math.atan2(t.x-w.x,-(t.z-w.z)),mode:'walk',bike:{x:w.x+40,z:w.z+40,a:0}});F.run(.8);F.face({x:t.x,y:A.court.G0+A.court.HG.HH.F,z:t.z});F.run(.3);}],
 ['x22-pantry-hand','In the pantry: its hand on the edge of the door',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-stalk');F.run(.5);F.until(()=>A.C.sk?.check?.phase==='open',20);F.key('keydown','Space');
   const hd=()=>A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor());F.run(.6,()=>F.face(hd()));}],
 ['x23-pantry-head','Its head in the gap; you hold your breath',()=>{const L=lastLight,A=L.chapter7,F=__f;const hd=()=>A.HM.sockets.head.getWorldPosition(new L.camera.position.constructor());F.until(()=>A.C.sk?.check?.phase==='head',6,()=>F.face(hd()));F.run(1.2,()=>F.face(hd()));}],
 ['x24-rug-lift','The rug: Jamie lifts the dresser',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-rug');F.run(.5);F.until(()=>A.C.dr?.rug?.up,12);F.run(.25);const d=A.court.HG.dresser.getWorldPosition(new L.camera.position.constructor());F.face({x:d.x,y:d.y+.3,z:d.z});F.run(.1);}],
 // ---- the expansion: later ----
 ['x30-evidence','Showing Reyes: his flashlight on the marks in the grass',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-evidence');F.until(()=>A.C.af?.go,15);const E=A.C.af.E;L.placePlayer({x:E.marks.x+1.5,z:E.marks.z+1.5,a:0,mode:'walk',bike:null});F.run(.4);A.act('c7-ev-marks');F.run(4.5);F.face({x:E.marks.x,y:L.camera.position.y-1.4,z:E.marks.z});F.run(.2);}],
 ['x31-mom-phone','Her phone: the pool, nobody on the towel',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-mom');F.until(()=>!!A.C.choice,20);A.key('Digit1');F.until(()=>!!A.C.choice,20);A.key('Digit1');F.until(()=>A.C.view==='inspect',20);F.run(2.5);}],
 ['x32-record-light','His page an hour later, turned to the light: JAMIE pressed into the paper',()=>{const L=lastLight,A=L.chapter7,F=__f;L.jump('c7-record');F.until(()=>A.C.view==='inspect',20);F.run(.5);A.key('KeyD');F.run(.2);A.key('KeyD');F.run(.4);}],
];
const want=process.env.SHOTS?new Set(process.env.SHOTS.split(',')):null,list=SHOTS.filter(s=>!want||want.has(s[0])),BATCH=+process.env.BATCH||6;
try{for(const [i,[name,note,fn]] of list.entries()){const cont=i>0&&/^(05|11|12|14|15|x17|x23)-/.test(name);if(!cont&&i%BATCH===0)await open();else if(!cont&&!page)await open();
  try{await page.evaluate(`(${fn.toString()})()`);await snap(name,note);}catch(e){errors.push(name+': '+String(e.message||e).slice(0,300));console.log('ERR',name,String(e.message||e).slice(0,300));}
  await page.evaluate(()=>globalThis.gc?.());}}
finally{fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({runtimeHashes,frames,errors},null,2));await browser?.close();server.close();console.log(JSON.stringify({frames:frames.length,errors}));}
