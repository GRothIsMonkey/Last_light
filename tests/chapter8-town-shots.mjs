// Chapter Eight: the street's destruction, stage by stage, as frames (development captures). Builds the night street the
// chapter's surface uses, fires the town's set pieces in order and photographs each from a walker's eye height at fixed
// moments. OUT (default scratch) gets jpgs + town.json. SHOTS=prefix filters. VIEW=960x540 by default.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.OUT||'docs/qa/chapter8-reconstruction/dev-town');fs.mkdirSync(out,{recursive:true});
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const file=path.join(repo,u.replace(/^\//,''));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const [VW,VH]=(process.env.VIEW||'960x540').split('x').map(Number);
const browser=await pw.chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:VW,height:VH}});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
const info=await page.evaluate(async()=>{const L=lastLight,A=L.chapter8;L.jump('c8-surface');L.step(1);
 const {createTown}=await import('./chapter8-town.js');const {cutWorld}=await import('./chapter8-ruin.js');cutWorld(L.world);
 const town=createTown({scene:L.scene,world:L.world,nav:L.nav,ruin:A.ruin,ambient:L.ambient,sfx:()=>{}});town.show(true);window.__town=town;
 const {groundPoint,heading}=await import('./route.js');
 window.__at=(d,lat,a=null,pitch=0)=>{const p=groundPoint(d,lat);L.placePlayer({x:p.x,z:p.z,a:a??heading(d)+Math.PI,mode:'walk',bike:null});L.look(0,0);L.face(a??heading(d)+Math.PI,pitch);};
 window.__look=(d,lat,y=1)=>{const p=groundPoint(d,lat),c=L.camera.position;const a=Math.atan2(p.x-c.x,-(p.z-c.z));const gy=L.world.groundY(d,lat)+y;L.face(a,Math.atan2(gy-c.y,Math.hypot(p.x-c.x,p.z-c.z)));};
 window.__run=sec=>{for(let i=0;i<Math.ceil(sec*30);i++){L.step(1/30);town.update(1/30,{camera:L.camera});}};
 return {cuts:A.ruin.cuts.length,stage:town.stage};});
console.log('setup',JSON.stringify(info));
const shots=[];
async function snap(name,fn){const r=await page.evaluate(fn);await page.evaluate(()=>{lastLight.render();});await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:82,timeout:300000});shots.push({name,r});console.log('shot',name,JSON.stringify(r||null).slice(0,200));}
const want=process.env.SHOTS?process.env.SHOTS.split(','):null,ok=n=>!want||want.some(w=>n.startsWith(w));
if(ok('t0'))await snap('t0-before',()=>{__at(1146,1);__run(.2);__look(1110,0,1.2);__run(.1);});
if(ok('t1')){await snap('t1-impacts-2s',()=>{__town.fire('impacts');__run(2.4);__look(1112,-6,2);__run(.05);});
 await snap('t1-impacts-8s',()=>{__run(5.6);__look(1100,0,1);__run(.05);return __town.stage;});}
if(ok('t2')){await snap('t2-swap',()=>{__town.skip('impacts');__at(1103,2.5);__run(.3);__town.fire('trench');__run(.25);__look(1072,-2,0);__run(.05);});
 await snap('t2-heave',()=>{__run(2.4);__look(1072,-2,.5);__run(.05);});
 await snap('t2-split',()=>{__run(1.4);__look(1070,-2,0);__run(.05);});
 await snap('t2-fall',()=>{__run(2.2);__look(1072,-2,-1);__run(.05);});
 await snap('t2-pole',()=>{__run(2.5);__look(1066,-6,2);__run(.05);});
 await snap('t2-after',()=>{__run(8);__look(1070,-2,-2);__run(.05);return {k:__town.FIELD.k,stage:__town.stage};});
 await snap('t2-edge',()=>{__at(1093,1.6);__run(.1);__look(1074,-3,-4.5);__run(.05);});}
if(ok('t3')){await snap('t3-lean-0',()=>{__town.skip('impacts');__town.skip('trench');__at(1064,6.4);__run(.3);__town.fire('lean');__look(1052,-15,3);__run(.6);});
 await snap('t3-lean-3s',()=>{__run(2.6);__look(1052,-15,3);__run(.05);});
 await snap('t3-lean-7s',()=>{__run(4);__look(1052,-15,3);__run(.05);});
 await snap('t3-lean-after',()=>{__run(6);__at(1060,4);__run(.1);__look(1052,-16,3);__run(.05);});
 await snap('t3-porch-1081',()=>{__at(1086,5);__run(.1);__look(1081,-15,2);__run(.05);});}
fs.writeFileSync(path.join(out,'town.json'),JSON.stringify({shots,errs},null,1));console.log('errors',errs.slice(0,8));
await browser.close();server.close();
