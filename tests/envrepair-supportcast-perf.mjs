// Cost of ?envrepair and ?supportcast: the six Prologue benchmarks against all eight flags at the same riding cameras (draw
// calls, triangles, median software frame time over 3 renders, JS heap), the supporting cast's own per-frame update cost,
// and load times. Software WebGL (Chromium + ANGLE SwiftShader): NOT a GPU; frame times show relative CPU-side cost only.
// usage: node tests/envrepair-supportcast-perf.mjs   (writes docs/qa/envrepair-supportcast/perf.json)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const SIX='bikes&houses&vegetation&pavement&streetprops&details',ALL=SIX+'&envrepair&supportcast';
const root=path.resolve('dist'),types={js:'application/javascript',html:'text/html',glb:'model/gltf-binary',json:'application/json',jpg:'image/jpeg',png:'image/png',css:'text/css'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const out={renderer:'Chromium (Playwright) + ANGLE SwiftShader — software rendering, not a GPU',commit:execFileSync('git',['rev-parse','--short','HEAD']).toString().trim(),cameras:[],runs:{}};
// riding cameras: the hoop kid's driveway, a yard with play equipment, chain link, Briarwood junction (the creek down it),
// Jamie's mother on her porch (the scene running), the lookout
const CAMS=[{n:'C1 hoop kid',d:128,lat:-1.2,yaw:.35},{n:'C2 yards',d:262,lat:-1.6,yaw:.45},{n:'C3 chain link',d:300,lat:2.5,yaw:-.3},{n:'C4 Briarwood junction',d:-1,lat:0,yaw:0,junction:true},{n:'C5 Jamie\'s porch (scene running)',d:772,lat:1.6,yaw:-.35,mom:true},{n:'C6 lookout',d:1132,lat:-.9,yaw:.18}];
async function run(flags){const browser=await pw.chromium.launch({headless:true,args:ARGS});const page=await (await browser.newContext({viewport:{width:1600,height:900}})).newPage();const t0=Date.now();
 await page.goto(base+'/index.html?qa&'+flags,{timeout:300000});await page.waitForFunction(f=>window.lastLight&&window.__details&&(window.__details.handle||window.__details.error)&&window.__streetprops&&window.__vegetation&&(!/envrepair/.test(f)||window.__envrepair)&&(!/supportcast/.test(f)||window.__supportcast),flags,{timeout:600000});
 const loadMs=Date.now()-t0;await page.evaluate(()=>{for(const d of document.querySelectorAll('[id$="-benchmark-label"]'))d.style.display='none';const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);});
 const cams=[];for(const c of CAMS){const r=await page.evaluate(async(c)=>{const L=lastLight,W=L.world;
   if(c.mom){L.place(655,1.2,4.4);L.friends.warp(655);L.press('KeyW');for(let i=0;i<40*30;i++){L.step(1/30);if(L.state.distance>=c.d)break;}L.release('KeyW');}
   else if(c.junction){const J=W.sideFrames[0].junction;L.place(J.d-6,J.side*2.5,0);for(let i=0;i<4;i++)L.step(1/30);}
   else{L.place(c.d,c.lat,0);for(let i=0;i<4;i++)L.step(1/30);}L.look(c.yaw,0);L.step(1/30);
   for(const k of ['__details','__streetprops','__vegetation','__houses','__bikes','__pavement','__envrepair','__supportcast'])window[k]?.tick?.(true);
   L.render();const ts=[];let info;for(let i=0;i<3;i++){const a=performance.now();info=L.render();ts.push(performance.now()-a);}ts.sort((a,b)=>a-b);
   // the supporting cast's own update cost (mean of 120 calls at this camera)
   let sc=null;if(window.__supportcast){const S=window.__supportcast,ctx={distance:L.state.distance,state:'riding',eye:L.camera.position.clone()};const a=performance.now();for(let i=0;i<120;i++)S.update(1/30,ctx);sc=+((performance.now()-a)/120).toFixed(3);}
   return {calls:info.calls,triangles:info.triangles,ms:+ts[1].toFixed(1),scUpdateMs:sc,momVisible:window.__supportcast?.cast?.mother?.root?.visible??null,heapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(0):null,
    geos:L.renderer.info.memory.geometries,textures:L.renderer.info.memory.textures};},c);cams.push({cam:c.n,...r});console.log(flags.length>60?'eight':'six',c.n,JSON.stringify(r));}
 const extra=await page.evaluate(()=>({er:window.__envrepair?{loadMs:__envrepair.loadMs}:null,sc:window.__supportcast?{loadMs:__supportcast.loadMs,cast:Object.fromEntries(Object.entries(__supportcast.cast).map(([k,c])=>[k,{tris:c.inst.info.triangles,bones:Object.keys(c.inst.bones).length,bytes:c.inst.info.bytes,readMs:c.inst.info.readMs,parseMs:c.inst.info.parseMs,textures:c.inst.info.textures,materials:c.inst.info.materials,clips:c.inst.info.clips.length,morphs:c.inst.info.morphTargets.length,draws:(()=>{let n=0;c.inst.model.traverse(o=>{if(o.isMesh)n++;});return n;})()}]))}:null}));
 await browser.close();return {loadMs,cams,...extra};}
out.runs.six=await run(SIX);out.runs.eight=await run(ALL);
const sum=(r,k)=>r.cams.reduce((a,c)=>a+c[k],0);
out.summary={calls:[sum(out.runs.six,'calls'),sum(out.runs.eight,'calls')],triangles:[sum(out.runs.six,'triangles'),sum(out.runs.eight,'triangles')],ms:[+sum(out.runs.six,'ms').toFixed(1),+sum(out.runs.eight,'ms').toFixed(1)],load:[out.runs.six.loadMs,out.runs.eight.loadMs]};
fs.mkdirSync('docs/qa/envrepair-supportcast',{recursive:true});fs.writeFileSync('docs/qa/envrepair-supportcast/perf.json',JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out.summary));server.close();
