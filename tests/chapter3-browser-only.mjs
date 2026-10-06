// Chapter Three alone in Chromium (SwiftShader unless BROWSER_GPU=1): from the Chapter Two end checkpoint,
// the hand-over and the whole chapter played with inputs, every QA jump, Continue, the captions, the audio
// signals. For iterating on Chapter Three without the full release suite (tests/browser.mjs runs it too).
// QA_OUTPUT (default docs/qa/chapter3-rebuild) receives captures, WAV renders and chapter3-browser-report.json.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
import {runChapterThreeBrowser,runChapterThreeJumps,runChapterThreeAudio} from './chapter3-browser.mjs';
const require=createRequire(import.meta.url);let pw;try{pw=require('playwright');}catch{pw=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter3-rebuild');fs.mkdirSync(out,{recursive:true});
const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
const server=http.createServer((req,res)=>{if(req.url.split('?')[0]==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu');
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[],frames=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE',m.text());}});
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS',name);};
const state=()=>page.evaluate(()=>lastLight.state);
const HUD='header,#date,#ride-ui,#subtitle,#prompt,#reflection';
const snap=async(name,{clean=false}={})=>{if(clean)await page.evaluate(h=>{for(const el of document.querySelectorAll(h))el.style.visibility='hidden';},HUD);
 await page.evaluate(()=>{for(const id of ['title-card','objective','objective-note','ending','prompt','subtitle','reflection','fade','chapter-card'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await page.evaluate(()=>{const L=lastLight,r={...L.render()};let lights=0;L.scene.traverseVisible(o=>{if(o.isLight&&o.intensity>0)lights++;});return {...r,activeLights:lights,phase:L.state.chapter.phase,caption:L.captionTone.state};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:88});frames.push({name,...info});console.log('Captured',name,info.triangles,info.calls);
 if(clean)await page.evaluate(h=>{for(const el of document.querySelectorAll(h))el.style.visibility='';},HUD);};
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html?qa`,{timeout:120000});await page.waitForFunction(()=>window.lastLight);await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
 // From the Chapter Two end checkpoint: its last lines, then the hand-over.
 await page.evaluate(()=>{lastLight.jump('chapter2-end');let n=0;while(lastLight.state.chapter.phase!=='c3-black'&&n++<3000)lastLight.step(1/30);});
 check('Chapter Two hands over to Chapter Three (no end menu)',(await state()).chapter.phase==='c3-black'&&!(await page.locator('#ending').isVisible()));
 const run=process.env.C3_SKIP_RUN?null:await runChapterThreeBrowser({page,snap,check,state,errors});
 const jumps=await runChapterThreeJumps({page,snap,check,state,errors,out,fs,path});
 const audio=await runChapterThreeAudio({page,check,out,fs,path});
 const gpu=await page.evaluate(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});
 check('no JavaScript or shader errors',errors.length===0);
 const report={runtimeHashes,browser:browser.version(),gpu,passed:checks.length,checks,frames,run,captions:jumps.captions,captionSweep:jumps.sweep,audio,errors,
  audioLimitation:'OfflineAudioContext signal checks and WAV renders only; nobody has listened to them.',renderLimitation:gpu.includes('SwiftShader')?'Software rendering (SwiftShader); no real-GPU frame rate measured.':'Hardware renderer: '+gpu};
 fs.writeFileSync(path.join(out,'chapter3-browser-report.json'),JSON.stringify(report,null,2));
 // A plain gallery for review: every capture with its phase and render counts, and the audio renders.
 const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const cards=frames.map(f=>`<figure><a href="${esc(f.name)}.jpg"><img loading="lazy" src="${esc(f.name)}.jpg" alt="${esc(f.name)}"></a><figcaption><b>${esc(f.name)}</b><br>${esc(f.phase)} · ${f.triangles.toLocaleString('en-US')} tris · ${f.calls} draws · captions ${esc(f.caption.mode)} (${esc(f.caption.source)})</figcaption></figure>`).join('');
 const clips=audio.map(c=>`<tr><td>${esc(c.name)}</td><td><audio controls preload="none" src="audio/${esc(c.name)}.wav"></audio></td><td>${c.peak.toFixed(3)}</td><td>${c.rms.toFixed(4)}</td><td>${c.beats||''}</td></tr>`).join('');
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter Three QA</title><style>
:root{--bg:#f4f2ee;--fg:#1d1c1a;--mute:#5d5a55;--card:#fff}@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e9e6e0;--mute:#a19d96;--card:#1e1e1e}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}main{max-width:1400px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
figure{margin:0;background:var(--card);border-radius:6px;overflow:hidden}img{width:100%;display:block}figcaption{padding:6px 8px;color:var(--mute);font-size:12px}figcaption b{color:var(--fg)}table{border-collapse:collapse;width:100%;overflow-x:auto;display:block}td,th{padding:4px 8px;text-align:left;border-bottom:1px solid #8884}audio{max-width:220px}</style></head><body><main>
<h1>Last Light — Chapter Three QA</h1><p>${esc(report.renderLimitation)} ${checks.length} checks passed; ${errors.length} JavaScript/shader errors. Captures come from an input-driven run from the Chapter Two hand-over, then QA jumps and caption fixtures (frames marked <i>qa-forced</i> are review views, not story frames).</p>
<div class="grid">${cards}</div><h2>Audio renders (signal validation only)</h2><p>${esc(report.audioLimitation)} 24 kHz; bells and voices stereo (head-related panning), the rest mono.</p><table><tr><th>clip</th><th></th><th>peak</th><th>rms</th><th>beats</th></tr>${clips}</table></main></body></html>`);console.log(JSON.stringify({passed:checks.length,gpu,errors:errors.length},null,1));
}catch(e){try{await snap('c3-failure');console.error('STATE',JSON.stringify(await state()).slice(0,4000));console.error('SAID',JSON.stringify(await page.evaluate(()=>window.__c3?.said?.slice(-8))));}catch{}console.error(e);process.exitCode=1;}
finally{await browser.close();server.close();}
