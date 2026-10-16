// node memprobe2.mjs <distDir> <steps>  — isolated: per step, renderer.info (programs, geometries, textures), JS heap, and RSS of the
// renderer and GPU processes (now and peak since the previous step), sampled every 500 ms.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execSync} from 'node:child_process';
const require=createRequire(import.meta.url),pw=require('/opt/node22/lib/node_modules/playwright');const root=path.resolve(process.argv[2]);const steps=(process.argv[3]||'').split(',').filter(Boolean);
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u==='/'?'index.html':u);try{res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.glb')?'model/gltf-binary':'text/html');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const b=await pw.chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});const p=await b.newPage({viewport:{width:1280,height:720}});
const rss=t=>{try{return Math.round(+execSync(`ps -eo rss,cmd | grep '[t]ype=${t}' | awk '{s+=$1}END{print s+0}'`).toString()/1024);}catch{return -1;}};
let pk={r:0,g:0};const iv=setInterval(()=>{pk.r=Math.max(pk.r,rss('renderer'));pk.g=Math.max(pk.g,rss('gpu-process'));},500);
const m=async(tag)=>{const j=await p.evaluate(()=>{globalThis.gc?.();const M=performance.memory,I=lastLight.renderer.info;const Ls={};lastLight.scene.traverseVisible(o=>{if(o.isLight){const k=o.type+(o.castShadow?'*':'');Ls[k]=(Ls[k]||0)+1;}});return {lights:JSON.stringify(Ls),heap:Math.round(M.usedJSHeapSize/1048576),prog:I.programs?.length,geo:I.memory.geometries,tex:I.memory.textures};});
 console.log(tag.padEnd(26),'heap',String(j.heap).padStart(5),'MB  programs',String(j.prog).padStart(4),' geometries',String(j.geo).padStart(5),' textures',String(j.tex).padStart(4),'  lights',j.lights,'  renderer',rss('renderer'),'(peak',pk.r+')  gpu',rss('gpu-process'),'(peak',pk.g+')');pk={r:0,g:0};};
await p.goto(`http://127.0.0.1:${server.address().port}/?qa`,{timeout:600000});await p.waitForFunction(()=>window.lastLight,null,{timeout:600000});
await p.evaluate(()=>{document.getElementById('intro').hidden=true;lastLight.start?.();lastLight.step(.5);lastLight.render();});await m('title+start');
for(const s of steps){await p.evaluate(s=>{const L=lastLight;L.jump(s);for(let i=0;i<6;i++){L.step(.5);L.render();}},s);await m(s);}
clearInterval(iv);await b.close();server.close();
