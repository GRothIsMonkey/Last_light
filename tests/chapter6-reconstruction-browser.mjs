// Rendered reconstruction acceptance: seven fresh-browser parts, real game APIs and gameplay inputs.
// Low quality / SwiftShader software; AudioContext disabled for accelerated visual checks.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const exe=process.env.BROWSER_PATH||undefined;
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter6-reconstruction/focused');fs.mkdirSync(out,{recursive:true});
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
 await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
 await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 if(process.env.QUALITY)await page.evaluate(q=>{const el=document.getElementById('set-quality');el.value=q;el.dispatchEvent(new Event('change'));},process.env.QUALITY);/* (QUALITY=low: the game's Low setting, less memory) */
 await page.click('#start');await page.evaluate(()=>lastLight.step(.4));if(await page.locator('#sound').getAttribute('aria-pressed')==='true')await page.keyboard.press('m');}
await openBrowser();
const check=(name,value,info='')=>{if(value){checks.push(name);console.log('PASS',name);}else{failed.push(name+(info?' '+info:''));console.log('FAIL',name,info);}};
const ev=(fn,arg)=>page.evaluate(fn,arg);
const snap=async(name)=>{await ev(()=>{for(const id of ['objective','objective-note','prompt','subtitle','fade','chapter-card','ending'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await ev(()=>{const L=lastLight,r={...L.render()},s=L.chapter6.state;return {calls:r.calls,triangles:r.triangles,phase:s?.phase,time:document.getElementById('date')?.textContent||'',caption:document.getElementById('subtitle').textContent.slice(0,90)};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:300000});frames.push({name,...info});console.log('Captured',name,info.phase,info.calls,info.triangles);if(memoryMB>0)await ev(()=>globalThis.gc?.());};
let report={audio:'AudioContext disabled and game muted; no listening review.',quality:process.env.QUALITY||'default'};
try{
 for(const [partIndex,part] of (process.env.PARTS||'after,home,cloth,restore,anomaly,below,flood').split(',').entries()){
  if(partIndex)await openBrowser();
  const result=await ev(async part=>{
   const L=lastLight,{runReconstruction}=await import('/tests/chapter6-reconstruction-checks.mjs'),{groundPoint}=await import('/dist/route.js');
   const h=new Proxy(L,{get(t,k){if(k==='snapshot')return {...L.state,clock:0};if(k==='night'){const s=L.state;return {state:s.state,wx:s.walk.x,wz:s.walk.z,wa:s.walk.a,speed:s.speed,roam:L.roam};}return Reflect.get(t,k);}});
   const caps=[],passed=[],failed=[];const key=(type,code)=>dispatchEvent(Object.assign(new Event(type),{code}));
   const capture=name=>{L.render();caps.push({name,data:L.renderer.domElement.toDataURL('image/jpeg',.9),phase:L.chapter6.state.phase,caption:document.getElementById('subtitle').textContent});};
   const T={h,groundPoint,metrics:{},advance(s,each){for(let t=0;t<s-1e-8;t+=1/30){L.step(Math.min(1/30,s-t));each?.();}},press:c=>key('keydown',c),release:c=>key('keyup',c),tap:c=>{key('keydown',c);key('keyup',c);},element:id=>{const el=document.getElementById(id);return el&&new Proxy(el,{get(t,k){if(k==='children')return Array.from(t.children);const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true;}});},snap:capture,check(name,fn){try{fn();passed.push(name);}catch(e){failed.push(name+': '+e.message);}}};
   let metrics;try{metrics=runReconstruction(T,{part});}catch(e){failed.push(String(e.stack));}return {passed,failed,metrics,caps};
  },part);
  for(const n of result.passed)check(n,true);for(const n of result.failed)check(n,false);report[part]=result.metrics;
  for(const c of result.caps){fs.writeFileSync(path.join(out,c.name+'.jpg'),Buffer.from(c.data.split(',')[1],'base64'));delete c.data;frames.push(c);}
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,checks,failed,errors,warnings,frames,runtimeHashes},null,2));
 }
 check('No JavaScript or shader errors',!errors.length&&!warnings.length,JSON.stringify(errors));
}catch(e){console.error(e);report.failure=String(e.stack);process.exitCode=1;}finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,checks,failed,errors,warnings,frames,runtimeHashes,renderer:'Chromium / ANGLE SwiftShader software'},null,2));if(failed.length||errors.length||warnings.length)process.exitCode=1;console.log(JSON.stringify({passed:checks.length,failed,errors,warnings}));}
