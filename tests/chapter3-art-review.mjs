// Repeatable visual review of the accepted scene starts. No story-state edits.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter3-astra-art');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html');if(req.url.startsWith('/favicon')){res.writeHead(204);return res.end();}try{res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.glb')?'model/gltf-binary':'text/html');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],frames=[];
page.on('pageerror',e=>{errors.push(String(e));console.error(e);});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
async function shot(name){
 await page.evaluate(()=>{for(const id of ['title-card','objective','objective-note','ending','prompt','subtitle','reflection','fade','chapter-card'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await page.evaluate(()=>({...lastLight.render(),phase:lastLight.state.chapter.phase}));
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:92,timeout:120000});frames.push({name,...info});console.log(name,info.triangles,info.calls);
}
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa`,{timeout:120000});await page.waitForFunction(()=>window.lastLight,null,{timeout:120000});
 await page.click('[data-dev-chapter="3"]');await shot('00-dev-scenes');
 await page.selectOption('#dev-scene','alex-bedroom');await page.click('#dev-start');await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:120000});await page.evaluate(()=>lastLight.step(.5));await shot('01-dev-bedroom');
 const scenes=(process.env.ART_SCENES||'chapter3-start,c3-alex-house,alex-bedroom,recording,neighbors,c3-road-day,c3-road-night,c3-forest-deep,c3-tunnel-entrance,c3-tunnel-inside,c3-tunnel-deep,c3-evidence,c3-alex-item,c3-old-bike,c3-broken-bell,c3-figure-reveal,c3-second-sighting,c3-creature-advance,c3-creature-far,c3-creature-side,c3-bike-block,c3-creature-near,c3-creature-barrier,c3-tunnel-exit,c3-bike-remount,c3-road-escape,c3-final-lure,chapter3-end').split(',');
 for(const id of scenes){await page.evaluate(id=>{lastLight.jump(id);lastLight.step(.5);},id);await shot(id);
  const heading=await page.evaluate(()=>lastLight.state.walk.a);
  if(process.env.ART_VIEWS==='all')for(const [suffix,y,p] of [['left',.75,0],['right',-.75,0],['detail',0,-.35]]){await page.evaluate(([y,p,a])=>{if(lastLight.state.state==='c1-walk'){lastLight.look(0,p);lastLight.face(a+y,p);}else lastLight.look(y,p);lastLight.step(.3);},[y,p,heading]);await shot(id+'-'+suffix);}
 }
 const inventory=await page.evaluate(()=>{const L=lastLight,gl=L.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown',staticTriangles:L.world.merged.reduce((n,m)=>n+(m.geometry.index?.count||m.geometry.attributes.position.count)/3,0),staticMeshes:L.world.merged.length};});
 const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({inventory,frames,errors,runtimeHashes},null,2));
 fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><meta charset="utf-8"><title>Chapter Three art review</title><style>body{background:#171819;color:#eee;font:14px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(440px,1fr));gap:20px}figure{margin:0}img{width:100%}figcaption{padding:8px}</style><h1>Chapter Three visual review</h1><p>SwiftShader; frame inventory only. '+frames.length+' frames, '+errors.length+' errors.</p><main>'+frames.map(f=>`<figure><a href="${f.name}.jpg"><img loading="lazy" src="${f.name}.jpg"></a><figcaption>${f.name} · ${f.triangles} triangles · ${f.calls} draws</figcaption></figure>`).join('')+'</main>');
 console.log(JSON.stringify({inventory,captures:frames.length,errors}));if(errors.length)process.exitCode=1;
}finally{await browser.close();server.close();}
