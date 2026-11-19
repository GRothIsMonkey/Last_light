// Pavement reconstruction: cost against the DEFAULT game (no flag) at the same cameras as the suite's part B pairs.
// Software rendering (Chromium + ANGLE SwiftShader): NOT a GPU measurement. Frame time is measured with a pixel
// read-back after each render, so it includes the software rasterization (render + readPixels of 1 px, median of 5).
// usage: node tests/pavement-cost.mjs [docs/qa/pavement/browser/report.json] [out=docs/qa/pavement/cost.json]
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const rep=JSON.parse(fs.readFileSync(process.argv[2]||'docs/qa/pavement/browser/report.json','utf8')),outFile=process.argv[3]||'docs/qa/pavement/cost.json';
const root=path.resolve('dist'),types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json',jpg:'image/jpeg'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const pairs=rep.pairs.filter(p=>p.flags==='qa&pavement'&&!/streetlights|flashlight/.test(p.name));// (the night pairs need the lookout's finale; the riding pairs are enough for cost)
const result={renderer:'Chromium + ANGLE SwiftShader (software rendering, not a GPU)',viewport:'1600x900',cameras:pairs.length,modes:{}};
for(const [mode,flags] of [['default',''],['pavement','pavement']]){
 const browser=await pw.chromium.launch({headless:true,args:ARGS});const page=await (await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1})).newPage();
 const t0=Date.now();await page.goto(base+'/index.html?qa'+(flags?'&'+flags:''),{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});
 if(flags)await page.waitForFunction(()=>window.__pavement,null,{timeout:300000});const wall=Date.now()-t0;
 await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);});
 const rows=[];
 for(const p of pairs){const r=await page.evaluate(p=>{const L=lastLight,at=p.at;L.place(at.d,at.lat,0);for(let i=0;i<4;i++)L.step(1/30);
   // the same camera as the pair: position and orientation copied
   const c=L.camera;L.render();c.position.fromArray(p.camera.p);c.quaternion.fromArray(p.camera.q);c.updateMatrixWorld(true);
   const gl=L.renderer.getContext(),px=new Uint8Array(4),times=[];let info;
   for(let k=0;k<6;k++){c.position.fromArray(p.camera.p);c.quaternion.fromArray(p.camera.q);const t=performance.now();const i=L.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const dt=performance.now()-t;if(k>0)times.push(dt);info=i;}
   times.sort((a,b)=>a-b);return {calls:info.calls,triangles:info.triangles,ms:+times[2].toFixed(1)};},p);rows.push({name:p.name,...r});}
 const mem=await page.evaluate(()=>({merged:lastLight.world.merged.length,geometries:lastLight.renderer.info.memory.geometries,textures:lastLight.renderer.info.memory.textures,programs:lastLight.renderer.info.programs?.length,jsHeapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(0):null}));
 result.modes[mode]={wallLoadMs:wall,...mem,rows};await browser.close();console.log(mode,JSON.stringify(mem),wall);}
const D=result.modes.default.rows,P=result.modes.pavement.rows;
result.delta=D.map((d,i)=>({name:d.name,calls:P[i].calls-d.calls,triangles:P[i].triangles-d.triangles,msDefault:d.ms,msPavement:P[i].ms}));
const sum=a=>a.reduce((s,x)=>s+x,0);result.summary={callsDefault:sum(D.map(r=>r.calls)),callsPavement:sum(P.map(r=>r.calls)),trianglesDefault:sum(D.map(r=>r.triangles)),trianglesPavement:sum(P.map(r=>r.triangles)),msDefault:+sum(D.map(r=>r.ms)).toFixed(1),msPavement:+sum(P.map(r=>r.ms)).toFixed(1)};
fs.mkdirSync(path.dirname(outFile),{recursive:true});fs.writeFileSync(outFile,JSON.stringify(result,null,1)+'\n');console.log(JSON.stringify(result.summary));server.close();
