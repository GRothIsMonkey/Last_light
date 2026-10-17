// Chapter Five in Chromium (SwiftShader unless BROWSER_GPU=1), sound off. Two parts:
//  * the walkthrough: Chapter Four's end checkpoint played to its end card, the card's "Chapter Five" button (a real
//    click), then the whole chapter played with inputs by the same player the simulation uses (tests/chapter5-sim.mjs,
//    playChapterFive: keys, looking, F, V, T, C; no QA jump inside it), running in the page against the real renderer.
//    A frame is captured at every beat it checks (the WebGL picture, with the date, objective and caption the page
//    shows written over it by this test); the hand-over and the end card are full-page screenshots;
//  * the DEV selector: Chapter Five chosen with real clicks, each of its scenes started with START SCENE, captured.
// QA_OUTPUT (default docs/qa/chapter5-pine-ridge) receives the captures, chapter5-browser-report.json and a gallery.
// ROUTE (A or C) and CHOICE (sam or jamie) choose the walkthrough's way. Renders are software (SwiftShader): frame
// times here say nothing about a real GPU.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const exe=process.env.BROWSER_PATH||undefined;
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter5-pine-ridge');fs.mkdirSync(out,{recursive:true});
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
// (gc() between segments and precise heap numbers for the report; BROWSER_MEMORY_MB bounds the test browser's heap)
const memoryMB=Number(process.env.BROWSER_MEMORY_MB||0);args.push('--enable-precise-memory-info',`--js-flags=--expose-gc${memoryMB>0?' --max-old-space-size='+memoryMB:''}`);
const browser=await pw.chromium.launch({executablePath:exe,headless:true,args});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],warnings=[],checks=[],failed=[],frames=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});
page.on('console',m=>{const t=m.text();if(m.type()==='error'){errors.push(t);console.error('CONSOLE',t);}else if(m.type()==='warning'&&/GL_INVALID|Feedback loop|shader/i.test(t))warnings.push(t);});
const check=(name,value,info='')=>{if(value){checks.push(name);console.log('PASS',name);}else{failed.push(name+(info?' '+info:''));console.log('FAIL',name,info);}};
const ev=(fn,arg)=>page.evaluate(fn,arg);
const snap=async(name)=>{await ev(()=>{for(const id of ['objective','objective-note','prompt','subtitle','fade','chapter-card','ending'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await ev(()=>{const L=lastLight,r={...L.render()},s=L.chapter5.state;return {calls:r.calls,triangles:r.triangles,phase:s?.phase,time:document.getElementById('date')?.textContent||'',caption:document.getElementById('subtitle').textContent.slice(0,90)};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:300000});frames.push({name,...info});console.log('Captured',name,info.phase,info.calls,info.triangles);if(memoryMB>0)await ev(()=>globalThis.gc?.());};
const route=process.env.ROUTE||'A',choice=process.env.CHOICE||'sam';let report={};
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.click('#start');await ev(()=>lastLight.step(.4));
 // ---- the hand-over: Chapter Four's ending, its card, the button ---------------------------------------------------------------
 const card4=await ev(()=>{const L=lastLight;L.jump('chapter4-end');for(let i=0;i<120*30&&L.state.state!=='ended';i++)L.step(1/30);
  return {state:L.state.state,h2:document.querySelector('#ending h2').textContent,next:!document.getElementById('next-chapter').hidden,label:document.getElementById('next-chapter').textContent};});
 check('Chapter Four ends on its card, with a "Chapter Five" button',card4.state==='ended'&&card4.h2==='Chapter Four'&&card4.next&&/Chapter Five/.test(card4.label),JSON.stringify(card4));
 await snap('00-chapter-four-end-card');
 await page.click('#next-chapter',{timeout:300000});await ev(()=>lastLight.step(.6));
 const c5card=await ev(()=>({phase:lastLight.chapter5.state.phase,card:document.getElementById('chapter-card').classList.contains('on')}));
 check('the button opens Chapter Five on its card over black',c5card.phase==='c5-black',JSON.stringify(c5card));
 await snap('01-chapter-five-card');
 // ---- the walkthrough: the simulation's player, in the page ---------------------------------------------------------------------
 const t0=Date.now();
 await ev(async({route,choice})=>{const L=lastLight,{playChapterFive}=await import('/tests/chapter5-sim.mjs'),{groundPoint}=await import('/dist/route.js');
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
   caps.push({name,data:c.toDataURL('image/jpeg',.84),phase:L.chapter5.state?.phase,time:date,caption:cap.slice(0,90),calls:r.calls,triangles:r.triangles});};
  const check=(name,fn)=>{try{fn();passed.push(name);}catch(e){fails.push(name+': '+String(e.message).slice(0,400));}try{capture(String(caps.length+2).padStart(2,'0')+'-'+name.replace(/^Chromium: /,''));}catch(e){fails.push('capture '+name+': '+e);}};
  const T={h,advance,press,release,tap,check,element,metrics,groundPoint,W:null,snap:n=>capture(String(caps.length+2).padStart(2,'0')+'-'+n)};
  // one segment of the chapter per call (the simulation's own segments), so the page gets its event loop back between them
  window.__walk={T,playChapterFive,passed,fails,metrics,get clock(){return clock;}};return true;});
 const SEGS=['start','stones','sign','road','camp','dusk','lights','split','run'],mem=[];
 for(const k of SEGS){const t1=Date.now();const r=await ev(({k,route,choice})=>{const W=window.__walk,L=lastLight;
   try{W.playChapterFive(W.T,'Chromium',k==='start'?{fromCard:false,entered:true,route,choice,to:'start'}:{from:k,to:k,cont:true,route,choice});}catch(e){W.fails.push(k+': playthrough threw: '+String(e.stack||e).slice(0,800));}
   globalThis.gc?.();return {phase:L.chapter5.state.phase,clock:+(W.clock/60).toFixed(2),heapMB:Math.round((performance.memory?.usedJSHeapSize||0)/1048576)};},{k,route,choice});
  mem.push({segment:k,...r,wallSeconds:Math.round((Date.now()-t1)/1000)});console.log('segment',k,JSON.stringify(mem[mem.length-1]));}
 // the flashlight's two lights are in the scene for the whole chapter (T only changes how bright), so the beam lights the camp
 const flash=await ev(()=>{const L=lastLight,f=L.foot;return {light:!!f?.light?.parent,spill:!!f?.spill?.parent,owned:!!f?.owned};});
 check('Chapter Five: the flashlight’s lights are in the scene (the beam lights what it points at)',flash.light&&flash.spill,JSON.stringify(flash));
 const walk=await ev(()=>{const W=window.__walk;return {passed:W.passed,fails:W.fails,metrics:W.metrics,clock:W.clock,state:lastLight.state.state};});
 console.log('walkthrough',((Date.now()-t0)/1000).toFixed(0)+'s',JSON.stringify({passed:walk.passed.length,fails:walk.fails}));
 for(const n of walk.passed)check(n,true);for(const f of walk.fails)check(f,false);
 // the frames the player captured, one at a time
 const nCaps=await ev(()=>window.__caps.length);
 for(let i=0;i<nCaps;i++){const c=await ev(i=>{const c=window.__caps[i];window.__caps[i]=null;return c;},i);const name=c.name.replace(/[^a-z0-9]+/gi,'-').replace(/-+$/,'').slice(0,70).toLowerCase();
  fs.writeFileSync(path.join(out,name+'.jpg'),Buffer.from(c.data.split(',')[1],'base64'));frames.push({name,phase:c.phase,time:c.time,caption:c.caption,calls:c.calls,triangles:c.triangles,overlay:'test-drawn text'});}
 const end=await ev(()=>({state:lastLight.state.state,eyebrow:document.querySelector('#ending .eyebrow, #ending p')?.textContent||'',h2:document.querySelector('#ending h2').textContent,
  text:document.getElementById('ending').textContent.replace(/\s+/g,' ').trim(),next:document.getElementById('next-chapter').hidden}));
 await snap('99-chapter-five-end-card');
 check('the walkthrough reaches Chapter Five’s end card by inputs alone, with sound off: LAST LIGHT · Chapter Five · August 24, 2011, and no Chapter Six',
  end.state==='ended'&&end.h2==='Chapter Five'&&/LAST LIGHT/i.test(end.text)&&/August 24, 2011/.test(end.text)&&end.next===true,JSON.stringify(end));
 report.walkthrough={scope:'continuous: Chapter Four end card → real click → Chapter Five played with inputs to its end card (one page call per segment, no jump between them)',route,choice,gameMinutes:+(walk.clock/60).toFixed(2),wallSeconds:Math.round((Date.now()-t0)/1000),segments:mem,metrics:walk.metrics,fails:walk.fails};
 // ---- the DEV selector: Chapter Five, every scene, with real clicks ---------------------------------------------------------------
 const scenes=await ev(()=>lastLight.DEV_SCENES[5].map(s=>({id:s.id,label:s.label})));const dev=[];
 await ev(()=>lastLight.toTitle());
 for(const sc of scenes){await page.click('[data-dev-chapter="5"]',{timeout:300000});await page.selectOption('#dev-scene',sc.id);await page.click('#dev-start',{timeout:300000});
  await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});await ev(()=>lastLight.step(1.5));
  const s=await ev(()=>{const c=lastLight.chapter.companions.all.filter(c=>c.active);return {phase:lastLight.chapter5.state.phase,state:lastLight.state.state,boys:c.length};});
  dev.push({...sc,...s});await snap('dev-'+sc.id);await ev(()=>lastLight.toTitle());}
 check(`DEV: all ${scenes.length} Chapter Five scenes start from the selector (real clicks) in a Chapter Five phase, Jamie and Sam there`,dev.every(d=>/^(c5|d5|e5|n5)-/.test(d.phase)&&d.boys===2),JSON.stringify(dev.filter(d=>!/^(c5|d5|e5|n5)-/.test(d.phase)||d.boys!==2)));
 report.dev=dev;
 const gpu=await ev(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});
 check('no JavaScript errors',errors.length===0,JSON.stringify(errors.slice(0,4)));check('no WebGL/shader warnings',warnings.length===0,JSON.stringify(warnings.slice(0,3)));
 const tris=frames.map(f=>f.triangles).filter(Number.isFinite);
 report={...report,browser:browser.version(),gpu,triangles:{min:Math.min(...tris),max:Math.max(...tris)},renderLimitation:/SwiftShader/i.test(gpu)?'Software rendering (SwiftShader): render counts are real, frame times are not a real-GPU measurement.':'GPU: '+gpu,audio:'Sound off; audio events are exercised, not listened to.'};
}catch(e){report.failure=String(e.stack||e);console.error('FAILED',e);process.exitCode=1;}
finally{if(failed.length)process.exitCode=1;
 fs.writeFileSync(path.join(out,'chapter5-browser-report.json'),JSON.stringify({...report,runtimeHashes,passed:checks.length,checks,failed,frames,errors,warnings},null,2));
 const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter Five QA</title><style>
:root{--bg:#f4f2ee;--fg:#1d1c1a;--mute:#5d5a55;--card:#fff}@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e9e6e0;--mute:#a19d96;--card:#1e1e1e}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}main{max-width:1400px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
figure{margin:0;background:var(--card);border-radius:6px;overflow:hidden}img{width:100%;display:block}figcaption{padding:6px 8px;color:var(--mute);font-size:12px}figcaption b{color:var(--fg)}</style></head><body><main>
<h1>Last Light — Chapter Five QA</h1><p>${esc(report.renderLimitation)} ${checks.length} checks passed, ${failed.length} failed; ${errors.length} JavaScript errors; ${warnings.length} WebGL warnings. ${report.failure?'Run incomplete: '+esc(report.failure.split('\n')[0]):esc(report.walkthrough?.scope)} (route ${esc(route)}, gate choice ${esc(choice)}).
Walkthrough frames (numbered) are the WebGL picture at each checked beat, with the page's date, objective and caption drawn over it by the test; <i>00/01/99</i> and <i>dev-*</i> are full-page screenshots (<i>dev-*</i>: each DEV scene started from the selector).</p>
<div class="grid">${frames.map(f=>`<figure><a href="${esc(f.name)}.jpg"><img loading="lazy" src="${esc(f.name)}.jpg" alt="${esc(f.name)}"></a><figcaption><b>${esc(f.name)}</b><br>${esc(f.phase)} · ${esc(f.time)} · ${(f.triangles||0).toLocaleString('en-US')} tris · ${f.calls} draws<br>${esc(f.caption)}</figcaption></figure>`).join('')}</div></main></body></html>`);
 await browser.close();server.close();console.log(JSON.stringify({passed:checks.length,failed,errors:errors.length,warnings:warnings.length,frames:frames.length,failure:report.failure||null}));}
