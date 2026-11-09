// Chapter Eight (rebuilt): what the heavy moments cost, measured honestly in what this machine has: headless Chromium on
// SwiftShader (software GL, CPU only). Reports, per moment: the game's own update time per frame (JS, ms), the render
// submission time (software rasterising: NOT a GPU number, only a relative one), draw calls, triangles, geometries,
// textures, programs, and the JS heap. Nothing here is a frame rate on real hardware. OUT gets perf.json.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.OUT||'docs/qa/chapter8-reconstruction');fs.mkdirSync(out,{recursive:true});
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const file=path.join(repo,u.replace(/^\//,''));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const MOMENTS=[
 ['title (before Chapter Eight is entered)',null,0],
 ['the trench: the street coming apart, the second hunter, the skyline thing','c8-trench',14],
 ['the limb on the Kesslers’ (all the street’s pieces, fires, smoke)','c8-street',40],
 ['the side yard: the hunter dragging Jamie','c8-yard',30],
 ['away from it: the made things following, the far fires','c8-flee',20],
 ['the breach under the court','c8-breach',12],
 ['the oak: Alex','c8-oak',10],
 ['the last ride, the wrecked street','c8-ride',8],
];
const browser=await pw.chromium.launch({headless:true,args});const page=await browser.newPage({viewport:{width:1280,height:720}});const errs=[];page.on('pageerror',e=>errs.push(String(e)));
await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
const t0=Date.now();await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});const loadMs=Date.now()-t0;
await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
const res=[];
for(const [name,sec,warm] of MOMENTS){
 const r=await page.evaluate(async([sec,warm])=>{const L=lastLight;if(sec){L.jump(sec);for(let i=0;i<warm*30;i++)L.step(1/30);}
  const N=60,up=[],rd=[];let info=null;
  for(let i=0;i<N;i++){const a=performance.now();L.step(1/30);const b=performance.now();info=L.render();const c=performance.now();up.push(b-a);rd.push(c-b);}
  const q=(arr,p)=>{const s=[...arr].sort((x,y)=>x-y);return +s[Math.min(s.length-1,Math.floor(p*s.length))].toFixed(2);};const R=L.renderer.info;
  return {phase:L.chapter8.state.phase,updateMs:{median:q(up,.5),p95:q(up,.95)},renderSubmitMsSwiftShader:{median:q(rd,.5),p95:q(rd,.95)},calls:info.calls,triangles:info.triangles,
   geometries:R.memory.geometries,textures:R.memory.textures,programs:R.programs?.length??null,heapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,
   creaturesShown:Object.values(L.chapter8.SC.STREET?.CR||{}).filter(c=>c.M.root.visible).length};},[sec,warm]);
 res.push({moment:name,section:sec,...r});console.log(name,JSON.stringify(r));}
await browser.close();server.close();
const doc={note:'Headless Chromium 1280x720 on SwiftShader (software GL on this container\'s CPU). updateMs is the game\'s own per-frame JS update; renderSubmitMsSwiftShader is software rasterisation and says nothing about a GPU. Not a frame-rate measurement on real hardware.',
 machine:{cpus:(await import('node:os')).cpus().length,model:(await import('node:os')).cpus()[0]?.model},pageLoadMs:loadMs,errors:errs,moments:res};
fs.writeFileSync(path.join(out,'perf.json'),JSON.stringify(doc,null,1));console.log('wrote',path.join(out,'perf.json'));
