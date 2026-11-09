// Chapter Eight (rebuilt): the same fifteen moments as tests/chapter8-baseline.mjs, shot in the reconstruction, for the
// before/after visual review (docs/qa/chapter8-reconstruction/VISUAL_REVIEW.md). Each shot jumps to a section, plays the beat on with
// the game's own update (any interaction the beat waits for is completed through its offer, so the camera sees the beat
// happen, not a static jump), and saves what the player's view shows at the moment that matters. These are for looking
// at; nothing is asserted. OUT (default docs/qa/chapter8-reconstruction/before) gets the jpgs and shots.json.
// SHOTS=a,b takes only those. VIEW=1280x720 by default; one browser per shot (software GL memory).
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.OUT||'docs/qa/chapter8-reconstruction/after');fs.mkdirSync(out,{recursive:true});
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const file=path.join(repo,u.replace(/^\//,''));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const [VW,VH]=(process.env.VIEW||'1280x720').split('x').map(Number);
const args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const shots=[],errors=[];
async function shot(name,note,fn){const browser=await pw.chromium.launch({headless:true,args});const page=await browser.newPage({viewport:{width:VW,height:VH}});const errs=[];
 page.on('pageerror',e=>errs.push(String(e)));
 try{await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
  await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
  await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
  await page.evaluate(()=>{const L=lastLight,A=L.chapter8;window.__f={
   face(q,{pitch=null}={}){const c=L.camera.position,a=Math.atan2(q.x-c.x,-(q.z-c.z)),pt=pitch??Math.atan2((q.y??c.y)-c.y,Math.hypot(q.x-c.x,q.z-c.z));L.face(a,pt);},
   run(sec,each){const n=Math.ceil(sec*30);for(let i=0;i<n;i++){L.step(1/30);each?.();}},
   // play on, completing whatever the beat waits for (not hiding), until done() or max seconds
   play(done,max=120,skip=/^(hide-|unhide|t-)/,each){for(let i=0;i<max*30;i++){if(done())return true;if(i%15===0)for(const [id,f] of [...A.C.offers]){if(skip.test(id))continue;A.C.offers.delete(id);A.C.flags[id]=true;try{f.fn?.();}catch{}break;}
     if(A.C.flickWant){const on=!!L.chapter.kit.o?.foot?.on;}L.step(1/30);each?.();}return !!done();},
   mark(t){return A.C.marks.some(m=>m[1].includes(t));},
   pos(o){return o.person?o.person.group.position:o.group?.position||o;}};});
  const info=await page.evaluate(fn);await page.evaluate(()=>lastLight.render());
  await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:84,timeout:300000});
  const st=await page.evaluate(()=>({phase:lastLight.chapter8.state.phase,caption:document.getElementById('subtitle').textContent.slice(0,140)}));
  shots.push({name,note,...st,info});console.log('shot',name,JSON.stringify(st));
 }catch(e){errors.push(name+': '+String(e.message||e).slice(0,200));console.log('ERR',name,String(e.message||e).slice(0,200));}
 errors.push(...errs.map(e=>name+': '+e));await browser.close().catch(()=>{});}
const S={
 'sam-out':['Sam’s rescue: the moment he is out of the cell (the flood door)',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-sam-door');F.play(()=>F.mark('Sam is out'),240);F.run(2);const s=L.chapter.kit.sam.person.group.position;F.face({x:s.x,y:s.y+1.1,z:s.z});F.run(.2);return F.mark('Sam is out');}],
 'jamie-out':['Jamie’s rescue: his door, him out',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-jamie-door');F.play(()=>F.mark('Jamie is out'),240);F.run(1.5);const s=L.chapter.kit.jamie.person.group.position;F.face({x:s.x,y:s.y+1.1,z:s.z});F.run(.2);return F.mark('Jamie is out');}],
 'alex-door':['Alex’s rescue: at his door',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-alex');F.play(()=>F.mark('alex: at his door')||F.mark('Alex believes'),120);F.run(.5);const q=A.X.at('alexDoor',-1.4);F.face(q);F.run(.2);return true;}],
 'alex-out':['Alex’s rescue: Alex out',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-alex-free');F.play(()=>F.mark('Alex is out'),160);F.run(2);const s=A.CTX.alex?.person?.group?.position;if(s)F.face({x:s.x,y:s.y+1.1,z:s.z});F.run(.2);return F.mark('Alex is out');}],
 'reunion':['The reunion in the crew room',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-reunion');F.run(8);const q=A.X.at('gTable',-2);F.face(q);F.run(.2);return true;}],
 'breach':['The breach through the windows, mid-beat',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-breach');F.run(12,()=>F.face(A.X.W(1,80,-2)));return true;}],
 'escape':['The escape: the junction hall under the jammed bulkhead',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-escape');F.run(2);const q=A.X.at('bulkhead',-1.5);L.placePlayer({x:q.x,z:q.z+5,a:Math.PI,mode:'walk',bike:null});F.run(.5);F.face(q);F.run(.2);return true;}],
 'street':['The surface: Oak Hollow Drive, the trench and the house that fell, from the near lawns',()=>{const L=lastLight,A=L.chapter8,F=__f,k=L.chapter.kit;L.jump('c8-street');F.run(2);const w=k.main(1100,5);L.placePlayer({x:w.x,z:w.z,a:0,mode:'walk',bike:null});F.run(4,()=>F.face(k.main(1040,0)));return true;}],
 'jamie-death':['Jamie’s death: the moment it has him',()=>{const L=lastLight,A=L.chapter8,F=__f,k=L.chapter.kit;L.jump('c8-yard');F.run(1);const w=k.main(1011.5,8.5);L.placePlayer({x:w.x,z:w.z,a:0,mode:'walk',bike:null});F.play(()=>A.C.jamieHeld!=null&&A.C.jamieHeld>.8,90);F.face({x:A.HM.x,y:(A.HM.y||0)+1.1,z:A.HM.z});F.run(.1);return A.C.jamieHeld!=null;}],
 'jamie-after':['After Jamie: Reyes working on him, Sam on his knees',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-jamie-death');F.run(26);const B=A.SC.STREET.HD.body;L.placePlayer({x:B.x+2.4,z:B.z-1.6,a:0,mode:'walk',bike:null});F.run(.3);F.face({x:B.x,y:B.y+.5,z:B.z});F.run(.2);return true;}],
 'gates':['The final operation: gate 1 on the bridge',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-gates');F.run(3);const W=A.CTX.WP;L.placePlayer({x:W(-1.6,.1).x,z:W(-1.6,.1).z,a:0,mode:'walk',bike:null});F.run(14,()=>F.face(W(-2,9,-4)));return true;}],
 'plug':['The final operation: the pins and the plug',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-plug');F.play(()=>A.C.flags.pin1,80);F.run(1);F.face(A.X.at('plug',2));F.run(.2);return true;}],
 'hatch':['Alex at the hatch: the lid down across his back',()=>{const L=lastLight,A=L.chapter8,F=__f,FN=A.SC.FIN;L.jump('c8-hatch');F.play(()=>FN.F8.mode==='pinned',90);F.run(1.5);const g=FN.hatch,p=new (g.position.constructor)(-1.1,0,-1.9);g.localToWorld(p);L.placePlayer({x:p.x,z:p.z,a:0,mode:'walk',bike:null});F.run(.2);const c=new (g.position.constructor)(0,.15,-.6);g.localToWorld(c);F.face(c);F.run(.1);return FN.F8.mode;}],
 'alex-death':['Alex at the oak',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-oak');F.play(()=>A.C.flags['alex-sit'],60);F.run(22);return true;}],
 'ride':['The last ride, looking back',()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-ride');F.run(4);L.look(1.8,0);F.run(.5);return true;}],
};
const want=process.env.SHOTS?new Set(process.env.SHOTS.split(',')):null;
for(const [name,[note,fn]] of Object.entries(S))if(!want||want.has(name))await shot(name,note,fn);
let all=shots;if(want){try{const old=JSON.parse(fs.readFileSync(path.join(out,'shots.json'),'utf8'));all=[...old.shots.filter(s=>!want.has(s.name)),...shots];}catch{}}
fs.writeFileSync(path.join(out,'shots.json'),JSON.stringify({shots:all,errors},null,2));server.close();console.log(JSON.stringify({shots:shots.length,errors}));
