// Chapter Six in Chromium (SwiftShader unless BROWSER_GPU=1), sound off. Two parts:
//  * the walkthrough: Chapter Five's end checkpoint played to its end card, the card's "Chapter Six" button (a real
//    click), then the whole chapter played with inputs by the same player the simulation uses (tests/chapter6-sim.mjs,
//    playChapterSix: walking, riding, looking, F, V and the camera's keys; no QA jump inside it), in the page against the
//    real renderer.
//    A frame is captured at every beat it checks (the WebGL picture, with the date, objective and caption the page
//    shows written over it by this test); the hand-over and the end card are full-page screenshots;
//  * the DEV selector: Chapter Six chosen with real clicks, each of its scenes started with START SCENE, captured.
// QA_OUTPUT (default docs/qa/chapter6-someone-was-here) receives the captures, chapter6-browser-report.json and a gallery.
// Renders are software (SwiftShader): frame times here say nothing about a real GPU.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const exe=process.env.BROWSER_PATH||undefined;
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter6-someone-was-here');fs.mkdirSync(out,{recursive:true});
const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
// The simulation's player runs in the page: its modules are served from tests/ with node:assert swapped for this.
const ASSERT=`const fail=(m,d)=>{throw new Error((m?m+' ':'')+(d||''));};const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export default {ok:(v,m)=>{if(!v)fail(m,'expected truthy');},equal:(a,b,m)=>{if(a!==b)fail(m,JSON.stringify(a)+' !== '+JSON.stringify(b));},notEqual:(a,b,m)=>{if(a===b)fail(m,JSON.stringify(a)+' === '+JSON.stringify(b));},
 deepEqual:(a,b,m)=>{if(!eq(a,b))fail(m,JSON.stringify(a).slice(0,400)+' != '+JSON.stringify(b).slice(0,400));},match:(s,r,m)=>{if(!r.test(s))fail(m,JSON.stringify(s)+' !~ '+r);}};`;
const types={js:'application/javascript',mjs:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json',png:'image/png',jpg:'image/jpeg'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);if(u==='/favicon.ico'){res.writeHead(204);return res.end();}
 if(u==='/__assert.mjs'){res.setHeader('Content-Type','application/javascript');return res.end(ASSERT);}
 const file=path.join(repo,u.replace(/^\//,''));if(!(file.startsWith(root+path.sep)||file.startsWith(path.join(repo,'tests')+path.sep))){res.writeHead(403);return res.end();}
 try{let body=fs.readFileSync(file);if(file.endsWith('.mjs'))body=String(body).replace(/import assert from 'node:assert\/strict';/,"import assert from '/__assert.mjs';");
  res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist');
if(process.env.BROWSER_SERVERLESS)args.push('--no-zygote','--single-process');
// (gc() between segments and precise heap numbers for the report; BROWSER_MEMORY_MB bounds the test browser's heap)
const memoryMB=Number(process.env.BROWSER_MEMORY_MB||0);args.push('--enable-precise-memory-info',`--js-flags=--expose-gc${memoryMB>0?' --max-old-space-size='+memoryMB:''}`);
// SEGMENTED=1: each walkthrough segment after the first, and each batch of DEV scenes (DEV_BATCH, default 6), in a fresh
// browser; SEGS=dusk,lights,... plays only those segments (each from its checkpoint) (software GL's
// memory peaks on a jump add up in one page; a container with less memory than the renderer's peaks kills the page)
const SEG=!!process.env.SEGMENTED,errors=[],warnings=[],checks=[],failed=[],frames=[];let browser,page;
async function openBrowser(){if(browser)await browser.close().catch(()=>{});browser=await pw.chromium.launch({executablePath:exe,headless:true,args});page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});page.on('crash',()=>{errors.push('page crashed');console.error('PAGE CRASHED');});
 page.on('console',m=>{const t=m.text();if(m.type()==='error'){errors.push(t);console.error('CONSOLE',t);}else if(m.type()==='warning'&&/GL_INVALID|Feedback loop|shader/i.test(t))warnings.push(t);});
 await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 if(process.env.QUALITY)await page.evaluate(q=>{const el=document.getElementById('set-quality');el.value=q;el.dispatchEvent(new Event('change'));},process.env.QUALITY);/* (QUALITY=low: the game's Low setting, less memory) */
 await page.click('#start');await page.evaluate(()=>lastLight.step(.4));}
await openBrowser();
const check=(name,value,info='')=>{if(value){checks.push(name);console.log('PASS',name);}else{failed.push(name+(info?' '+info:''));console.log('FAIL',name,info);}};
const ev=(fn,arg)=>page.evaluate(fn,arg);
const snap=async(name)=>{await ev(()=>{for(const id of ['objective','objective-note','prompt','subtitle','fade','chapter-card','ending'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await ev(()=>{const L=lastLight,r={...L.render()},s=L.chapter6.state;return {calls:r.calls,triangles:r.triangles,phase:s?.phase,time:document.getElementById('date')?.textContent||'',caption:document.getElementById('subtitle').textContent.slice(0,90)};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:300000});frames.push({name,...info});console.log('Captured',name,info.phase,info.calls,info.triangles);if(memoryMB>0)await ev(()=>globalThis.gc?.());};
let report={};
try{
 // ---- the hand-over: Chapter Five's ending, its card, the button ---------------------------------------------------------------
 const card5=await ev(()=>{const L=lastLight;L.jump('chapter5-end');for(let i=0;i<120*30&&L.state.state!=='ended';i++)L.step(1/30);
  return {state:L.state.state,h2:document.querySelector('#ending h2').textContent,next:!document.getElementById('next-chapter').hidden,label:document.getElementById('next-chapter').textContent};});
 check('Chapter Five ends on its card, with a "Chapter Six" button',card5.state==='ended'&&card5.h2==='Chapter Five'&&card5.next&&/Chapter Six/.test(card5.label),JSON.stringify(card5));
 await snap('00-chapter-five-end-card');
 await page.click('#next-chapter',{timeout:300000});await ev(()=>lastLight.step(1.2));
 const c6card=await ev(()=>({phase:lastLight.chapter6.state.phase,card:document.getElementById('chapter-card').classList.contains('on'),h2:document.querySelector('#chapter-card h2').textContent,sub:document.querySelector('#chapter-card .card-sub')?.textContent||''}));
 check('the button opens Chapter Six on its card over black: LAST LIGHT · Chapter Six · Someone Was Here · Thursday, August 25, 2011',c6card.phase==='c6-black'&&c6card.card&&/Chapter Six/.test(c6card.h2)&&/SOMEONE WAS HERE/i.test(c6card.sub)&&/AUGUST 25, 2011/i.test(c6card.sub),JSON.stringify(c6card));
 await snap('01-chapter-six-card');
 // ---- the walkthrough: the simulation's player, in the page ---------------------------------------------------------------------
 const t0=Date.now();
const installWalk=()=>ev(async()=>{const L=lastLight,{playChapterSix}=await import('/tests/chapter6-sim.mjs'),{groundPoint}=await import('/dist/route.js');
  let clock=0;const caps=window.__caps=[],fails=[],passed=[],metrics={};
  const h=new Proxy(L,{get(t,k){if(k==='snapshot'){const s=L.state;return {state:s.state,clock,speed:s.speed};}
   if(k==='night'){const s=L.state;return {state:s.state,wx:s.walk.x,wz:s.walk.z,wa:s.walk.a,speed:s.speed,fade:s.fade,roam:L.roam};}return Reflect.get(t,k);}});
  const advance=s=>{const n=Math.ceil(s*30-1e-9);for(let i=0;i<n;i++)L.step(1/30);clock+=n/30;};
  const key=(type,code)=>dispatchEvent(Object.assign(new Event(type),{code}));
  const press=c=>key('keydown',c),release=c=>key('keyup',c),tap=c=>{press(c);release(c);};
  const element=id=>{const el=document.getElementById(id);return el&&new Proxy(el,{get(t,k){if(k==='children')return Array.from(t.children);const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true;}});};
  // a frame at each beat: the WebGL picture, with the date, the objective and the caption written over it
  const capture=name=>{const r=L.render(),src=L.renderer.domElement,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
   const k=c.width/1440,txt=(s,x,y,size,align='left',style='')=>{g.font=`${style} ${Math.round(size*k)}px Georgia, serif`;g.textAlign=align;g.fillStyle='rgba(0,0,0,.55)';g.fillText(s,x*k+1,y*k+1);g.fillStyle='rgba(255,248,236,.95)';g.fillText(s,x*k,y*k);};
   const date=document.getElementById('date')?.textContent||'',obj=document.getElementById('objective')?.textContent||'',cap=document.getElementById('subtitle').textContent||'';
   txt(date.toUpperCase(),48,70,15);if(obj)txt(obj,48,98,18);if(cap)txt(cap.slice(0,110),720,820,24,'center','italic');
   caps.push({name,data:c.toDataURL('image/jpeg',.84),phase:L.chapter6.state?.phase,time:date,caption:cap.slice(0,90),calls:r.calls,triangles:r.triangles});};
  const check=(name,fn)=>{try{fn();passed.push(name);}catch(e){fails.push(name+': '+String(e.message).slice(0,400));}try{capture(String(caps.length+2).padStart(2,'0')+'-'+name.replace(/^Chromium: /,''));}catch(e){fails.push('capture '+name+': '+e);}};
  const T={h,advance,press,release,tap,check,element,metrics,groundPoint,W:null,snap:n=>capture(String(caps.length+2).padStart(2,'0')+'-'+n)};
  // one segment of the chapter per call (the simulation's own segments), so the page gets its event loop back between them
  window.__walk={T,playChapterSix,passed,fails,metrics,get clock(){return clock;}};return true;});
 await installWalk();
 // (what the page has gathered, kept here before a fresh browser replaces it)
 const got={passed:[],fails:[],metrics:{},clock:0,caps:[]};
 const harvest=async()=>{const w=await ev(()=>{const W=window.__walk;return {passed:W.passed,fails:W.fails,metrics:W.metrics,clock:W.clock,n:window.__caps.length};});
  got.passed.push(...w.passed);got.fails.push(...w.fails);Object.assign(got.metrics,w.metrics);got.clock+=w.clock;
  for(let i=0;i<w.n;i++)got.caps.push(await ev(i=>{const c=window.__caps[i];window.__caps[i]=null;return c;},i));
  await ev(()=>{const W=window.__walk;W.passed.length=0;W.fails.length=0;window.__caps.length=0;});};
 const SEGS=(process.env.SEGS==='none'?[]:process.env.SEGS?process.env.SEGS.split(','):['morning','meeting','streets','records','works','below','flood','after']),mem=[];
 for(const k of SEGS){const t1=Date.now();if(SEG&&k!=='start'){await harvest();await openBrowser();await installWalk();}const r=await ev(({k,SEG})=>{const W=window.__walk,L=lastLight;
   try{W.playChapterSix(W.T,'Chromium',k==='morning'?{fromCard:false,entered:true,to:'morning'}:{from:k,to:k,cont:!SEG});}catch(e){W.fails.push(k+': playthrough threw: '+String(e.stack||e).slice(0,800));}
   globalThis.gc?.();return {phase:L.chapter6.state.phase,clock:+(W.clock/60).toFixed(2),heapMB:Math.round((performance.memory?.usedJSHeapSize||0)/1048576)};},{k,SEG});
  mem.push({segment:k,...r,wallSeconds:Math.round((Date.now()-t1)/1000)});console.log('segment',k,JSON.stringify(mem[mem.length-1]));}
 await harvest();const walk={...got,state:await ev(()=>lastLight.state.state)};
 console.log('walkthrough',((Date.now()-t0)/1000).toFixed(0)+'s',JSON.stringify({passed:walk.passed.length,fails:walk.fails}));
 for(const n of walk.passed)check(n,true);for(const f of walk.fails)check(f,false);
 // the frames the player captured, one at a time
 for(const c of walk.caps){if(!c)continue;const name=c.name.replace(/[^a-z0-9]+/gi,'-').replace(/-+$/,'').slice(0,70).toLowerCase();
  fs.writeFileSync(path.join(out,name+'.jpg'),Buffer.from(c.data.split(',')[1],'base64'));frames.push({name,phase:c.phase,time:c.time,caption:c.caption,calls:c.calls,triangles:c.triangles,overlay:'test-drawn text'});}
 const end=await ev(()=>({state:lastLight.state.state,h2:document.querySelector('#ending h2').textContent,
  text:document.getElementById('ending').textContent.replace(/\s+/g,' ').trim(),next:document.getElementById('next-chapter').hidden}));
 await snap('99-chapter-six-end-card');
 check('the walkthrough reaches Chapter Six’s end card by inputs alone, with sound off: LAST LIGHT · Chapter Six · Someone Was Here · August 25, 2011, and no Chapter Seven',
  end.state==='ended'&&end.h2==='Chapter Six'&&/LAST LIGHT/i.test(end.text)&&/SOMEONE WAS HERE/i.test(end.text)&&/August 25, 2011/.test(end.text)&&end.next===true,JSON.stringify(end));
 report.walkthrough={scope:SEG?'segmented: Chapter Five end card → real click → the first segment; each later segment in a fresh browser from its own checkpoint, played with inputs (the end card reached by the last)':'continuous: Chapter Five end card → real click → Chapter Six played with inputs to its end card (one page call per segment, no jump between them)',gameMinutes:+(walk.clock/60).toFixed(2),wallSeconds:Math.round((Date.now()-t0)/1000),segments:mem,metrics:walk.metrics,fails:walk.fails};
 // ---- the DEV selector: Chapter Six, every scene, with real clicks ---------------------------------------------------------------
 const scenes=process.env.NO_DEV?[]:await ev(()=>lastLight.DEV_SCENES[6].map(s=>({id:s.id,label:s.label})));const dev=[];/* (NO_DEV=1: the walkthrough only) */
 await ev(()=>lastLight.toTitle());
 for(const [i,sc] of scenes.entries()){if(SEG&&i%(+process.env.DEV_BATCH||6)===0){await openBrowser();await ev(()=>lastLight.toTitle());}await page.click('[data-dev-chapter="6"]',{timeout:300000});await page.selectOption('#dev-scene',sc.id);await page.click('#dev-start',{timeout:300000});
  await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});await ev(()=>lastLight.step(1.5));
  const s=await ev(()=>{const c=lastLight.chapter.companions.all.filter(c=>c.active&&!c.gone);return {phase:lastLight.chapter6.state.phase,state:lastLight.state.state,boys:c.length};});
  dev.push({...sc,...s});await snap('dev-'+sc.id);await ev(()=>lastLight.toTitle());}
 const late=new Set(['c6-sealed','c6-rescue','c6-aftermath','c6-testimony','chapter6-end']);
 if(scenes.length)check(`DEV: all ${scenes.length} Chapter Six scenes start from the selector (real clicks) in a Chapter Six phase; Jamie and Sam there (only Jamie after the gate)`,dev.every(d=>/^(c6|d6|e6|n6)-/.test(d.phase)&&d.boys===(late.has(d.id)?1:2)),JSON.stringify(dev.filter(d=>!/^(c6|d6|e6|n6)-/.test(d.phase)||d.boys!==(late.has(d.id)?1:2))));
 report.dev=dev;
 const gpu=await ev(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});
 check('no JavaScript errors',errors.length===0,JSON.stringify(errors.slice(0,4)));check('no WebGL/shader warnings',warnings.length===0,JSON.stringify(warnings.slice(0,3)));
 const tris=frames.map(f=>f.triangles).filter(Number.isFinite);
 report={...report,browser:browser.version(),gpu,triangles:{min:Math.min(...tris),max:Math.max(...tris)},renderLimitation:/SwiftShader/i.test(gpu)?'Software rendering (SwiftShader): render counts are real, frame times are not a real-GPU measurement.':'GPU: '+gpu,audio:'Sound off; audio events are exercised, not listened to.'};
}catch(e){report.failure=String(e.stack||e);console.error('FAILED',e);process.exitCode=1;}
finally{if(failed.length)process.exitCode=1;
 fs.writeFileSync(path.join(out,'chapter6-browser-report.json'),JSON.stringify({...report,runtimeHashes,passed:checks.length,checks,failed,frames,errors,warnings},null,2));
 const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter Six QA</title><style>
:root{--bg:#f4f2ee;--fg:#1d1c1a;--mute:#5d5a55;--card:#fff}@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e9e6e0;--mute:#a19d96;--card:#1e1e1e}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}main{max-width:1400px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
figure{margin:0;background:var(--card);border-radius:6px;overflow:hidden}img{width:100%;display:block}figcaption{padding:6px 8px;color:var(--mute);font-size:12px}figcaption b{color:var(--fg)}</style></head><body><main>
<h1>Last Light — Chapter Six QA</h1><p>${esc(report.renderLimitation)} ${checks.length} checks passed, ${failed.length} failed; ${errors.length} JavaScript errors; ${warnings.length} WebGL warnings. ${report.failure?'Run incomplete: '+esc(report.failure.split('\n')[0]):esc(report.walkthrough?.scope)}.
Walkthrough frames (numbered) are the WebGL picture at each checked beat, with the page's date, objective and caption drawn over it by the test; <i>00/01/99</i> and <i>dev-*</i> are full-page screenshots (<i>dev-*</i>: each DEV scene started from the selector).</p>
<div class="grid">${frames.map(f=>`<figure><a href="${esc(f.name)}.jpg"><img loading="lazy" src="${esc(f.name)}.jpg" alt="${esc(f.name)}"></a><figcaption><b>${esc(f.name)}</b><br>${esc(f.phase)} · ${esc(f.time)} · ${(f.triangles||0).toLocaleString('en-US')} tris · ${f.calls} draws<br>${esc(f.caption)}</figcaption></figure>`).join('')}</div></main></body></html>`);
 await browser.close();server.close();console.log(JSON.stringify({passed:checks.length,failed,errors:errors.length,warnings:warnings.length,frames:frames.length,failure:report.failure||null}));}
