// Chapter Eight: the frames a person should look at, in Chromium (SwiftShader unless BROWSER_GPU=1), sound off.
// Each shot starts from a QA jump, runs the game's own update for as long as the beat needs to reach the moment, turns
// the camera to what matters and saves a full-page screenshot (1440x900). These are for looking at, not for passing:
// nothing here asserts what a frame shows. SHOTS=a,b,... takes only those; QA_OUTPUT (default
// docs/qa/chapter8-the-night-oak-hollow-fell/frames) gets the jpgs and frames.json. BATCH (default 5): shots per browser.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter8-the-night-oak-hollow-fell/frames');fs.mkdirSync(out,{recursive:true});
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
 await page.evaluate(()=>{const L=lastLight;window.__f={
  face(q,{pitch=null}={}){const c=L.camera.position,a=Math.atan2(q.x-c.x,-(q.z-c.z)),pt=pitch??Math.atan2((q.y??c.y)-c.y,Math.hypot(q.x-c.x,q.z-c.z));L.face(a,pt);},
  run(sec,each){const n=Math.ceil(sec*30);for(let i=0;i<n;i++){L.step(1/30);each?.();}},
  until(fn,max=20,each){const n=Math.ceil(max*30);for(let i=0;i<n;i++){if(fn())return true;L.step(1/30);each?.();}return !!fn();},
  place(w,t){L.placePlayer({x:w.x,z:w.z,a:Math.atan2(t.x-w.x,-(t.z-w.z)),mode:'walk',bike:null});}};});}
const snap=async(name,note='')=>{await page.evaluate(()=>{for(const id of ['objective','objective-note','prompt','subtitle','fade','chapter-card','ending'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await page.evaluate(()=>{const r=lastLight.render(),s=lastLight.chapter8.state;return {phase:s.phase,calls:r.calls,triangles:r.triangles,caption:document.getElementById('subtitle').textContent.slice(0,120),objective:document.getElementById('objective')?.textContent?.slice(0,80)||'',hunter:s.hunter?{state:s.hunter.state,mode:s.hunter.mode,visible:s.hunter.visible}:null};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:300000});frames.push({name,note,...info});console.log('frame',name,JSON.stringify(info));};
// [name, note, page function that sets the moment up]
const SHOTS=[
 ['b01-four-bikes','Under the streetlight outside Sam’s, Friday night: the four bikes',()=>{const L=lastLight,F=__f,A=L.chapter8;L.jump('c8-bikes');F.until(()=>A.C.offers.has('bike-alex'),30);const f=A.C.offers.get('bike-alex'),q=typeof f.at==='function'?f.at():f.at;
   F.place({x:q.x+2.6,z:q.z+2.2},q);F.run(1.2);F.face({x:q.x,y:q.y-.2,z:q.z});F.run(.3);}],
 ['b02-field-cover','The cover in the field, MH-12, open',()=>{const L=lastLight,F=__f,A=L.chapter8;L.jump('c8-field');F.run(2.5);const m=A.SC?.MH?.at||A.CTX?.MH?.at;if(m)F.face({x:m.x,y:m.y,z:m.z});F.run(.3);}],
 ['b03-barrier','The outer barrier under the neighbourhood: the leaf, the crank, the long pipe beyond',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-barrier');F.run(2);F.face(CM.at('barrierLeaf',1.2));F.run(.3);}],
 ['b04-gallery','The 1958 construction gallery: columns, the crane rail, the window on the deep shaft',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-gallery');F.run(2);F.face(CM.at('galleryMid',-1.2));F.run(.3);}],
 ['b05-film','The review room: the 1958 observation film on the screen (wound, running)',()=>{const L=lastLight,F=__f,A=L.chapter8,CM=A.X;L.jump('c8-film');F.until(()=>A.C.offers.has('film'),20);const f=A.C.offers.get('film');f.fn();A.C.offers.delete('film');A.C.flags.film=true;
   const w=CM.at('reviewSeat'),t=CM.at('reviewScreen',-1.6);F.place(w,t);F.run(9);F.face(t);F.run(.3);}],
 ['b06-danny','The service corridor: Danny Whitcomb’s thing at the alcoves',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-danny');F.run(4);F.face(CM.at('cMid',-1.6));F.run(.3);}],
 ['b07-sam-cell','The flooded isolation wing: Sam’s cell door',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-sam-door');F.run(2);F.face(CM.at('samDoor',-1.8));F.run(.3);}],
 ['b08-retrieval','The retrieval wing: the grille, the drag marks, Jamie’s door',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-jamie-door');F.run(2);F.face(CM.at('jamieDoor',-1.8));F.run(.3);}],
 ['b09-made-room','The room it made for Alex (the reconstruction)',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-made');F.run(3);F.face(CM.at('f1Mid',-1.6));F.run(.3);}],
 ['b10-reunion','The crew room: all four of them',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-reunion');F.run(4);F.face(CM.at('gTable',-2));F.run(.3);}],
 ['b11-anchor-board','The anchor board in the 1959 hall',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-truth');F.run(2);const t=CM.at('hBoard',-1.15);F.place(CM.at('hMid'),t);F.run(.6);F.face(t);F.run(.3);}],
 ['b12-breach','Through the long windows: the ribs breaking outward',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-breach');F.run(9,()=>F.face(CM.W(1,80,-2)));}],
 ['b13-surface','Oak Hollow Drive from the cul-de-sac at five in the morning',()=>{const L=lastLight,F=__f,k=L.chapter.kit;L.jump('c8-surface');F.run(3);const q=k.main(1060,0);F.face({x:q.x,y:q.y+1,z:q.z});F.run(.3);}],
 ['b13b-summerfield','Down at Summerfield: the intersection lifts, splits and goes down with a car',()=>{const L=lastLight,F=__f,A=L.chapter8,k=L.chapter.kit;L.jump('c8-surface');F.run(1);const w=k.main(1092,-1);L.placePlayer({x:w.x,z:w.z,a:0,mode:'walk',bike:null});F.run(.5);const c=A.ruin.pits.heave.c;F.run(9,()=>F.face({x:c.x,y:c.y+1.5,z:c.z}));}],
 ['b14-hendersons','The Hendersons’: the hole where the yard was, the jammed door, her car at the curb',()=>{const L=lastLight,F=__f,A=L.chapter8,k=L.chapter.kit;L.jump('c8-hendersons');F.run(2);const H=A.ruin.H,w=k.main(H.P.u+12,2);F.place(w,H.doorAt);F.run(1);F.face({x:H.doorAt.x,y:H.doorAt.y+.6,z:H.doorAt.z});F.run(.3);}],
 ['b15-after-jamie','After: Jamie on the grass short of the curb (not graphic)',()=>{const L=lastLight,F=__f,A=L.chapter8,k=L.chapter.kit;L.jump('c8-jamie-death');F.run(2.5);const H=A.ruin.H,j=k.main(H.P.u+5.4,8.6);F.face({x:j.x,y:j.y+.3,z:j.z});F.run(.3);}],
 ['b16-works','The Mill Creek works at first light: the staging area',()=>{const L=lastLight,F=__f,A=L.chapter8;L.jump('c8-staging');F.run(3);const W=A.CTX.WP;F.face(W(4,3,-1));F.run(.3);}],
 ['b17-plug','The catwalk over the main chamber: the plug and its pins',()=>{const L=lastLight,F=__f,CM=L.chapter8.X;L.jump('c8-plug');F.run(3);F.face(CM.at('plug',2));F.run(.3);}],
 ['b18-oak','The oak: Alex against it, Sam holding his hand',()=>{const L=lastLight,F=__f,A=L.chapter8;L.jump('c8-oak');F.run(5);const q=A.SC?.OAK||A.CTX?.OAK;if(q)F.face({x:q.x,y:q.y+.6,z:q.z});F.run(.3);}],
 ['b19-look-back','The last ride: the road behind you',()=>{const L=lastLight,F=__f;L.jump('c8-look-back');F.run(2.5);L.look(1.8,0);F.run(.6);}],
 ['b20-end-card','The end card',()=>{const L=lastLight,F=__f;L.jump('chapter8-end');F.until(()=>!document.getElementById('ending').hidden,40);F.run(1);}],
];
const want=process.env.SHOTS?new Set(process.env.SHOTS.split(',')):null,list=SHOTS.filter(s=>!want||want.has(s[0])),BATCH=+process.env.BATCH||5;
try{for(const [i,[name,note,fn]] of list.entries()){if(i%BATCH===0||!page)await open();
  try{await page.evaluate(`(${fn.toString()})()`);await snap(name,note);}catch(e){errors.push(name+': '+String(e.message||e).slice(0,300));console.log('ERR',name,String(e.message||e).slice(0,300));}
  await page.evaluate(()=>globalThis.gc?.());}}
finally{fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({runtimeHashes,frames,errors},null,2));await browser?.close();server.close();console.log(JSON.stringify({frames:frames.length,errors}));}
