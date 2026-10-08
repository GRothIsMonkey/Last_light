// Reproduce the rendered flashlight/caption regression without replaying the chapter.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve('docs/qa/chapter3-astra-caption');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{if(req.url.startsWith('/favicon')){res.writeHead(204);return res.end();}const file=path.join(root,req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html?qa`,{timeout:120000});await page.waitForFunction(()=>window.lastLight,null,{timeout:120000});
 const caption=await page.evaluate(async()=>{const L=lastLight;L.jump('c3-tunnel-inside');L.step(1);const m=L.state.walk,q=L.world.drain.project(m.x,m.z),w=L.world.drain.at(q.s+1.2,2.3);L.face(Math.atan2(w.x-m.x,-(w.z-m.z)),0);L.step(.2);
  const S=L.chapter.kit.S;S.queue.length=0;S.line=null;L.chapter.kit.talk([{who:'JAMIE',text:'“Can you read this? It should be easy to read here.”',time:40}]);
  const n0=L.captionTone.state.samples;await new Promise(resolve=>{let i=0;const frame=()=>{L.render();L.step(.12);if(++i<60&&(i<14||L.captionTone.state.samples<n0+4))requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  const el=document.getElementById('subtitle'),css=getComputedStyle(el);return {...L.captionTone.state,bg:css.backgroundColor,border:css.borderTopWidth,shown:parseFloat(el.style.opacity||'0')>=.75};});
 await page.screenshot({path:path.join(out,'flashlight-wall-after.jpg'),type:'jpeg',quality:92,timeout:120000});
 assert.ok(caption.source==='frame'&&(caption.contrast>=3||caption.contrast>=2&&caption.halo>=.7||caption.scrim>=.5)&&/rgba\(0, 0, 0, 0\)|transparent/.test(caption.bg)&&caption.border==='0px'&&caption.shown,JSON.stringify(caption));assert.deepEqual(errors,[]);
 const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:1,caption,errors,runtimeHashes},null,2));console.log(JSON.stringify({passed:1,caption,errors},null,2));
}finally{await browser.close();server.close();}
