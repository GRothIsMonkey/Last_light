// Matched player-height art views. Software rendering is recorded explicitly; no FPS claim.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(process.env.GAME_ROOT||'dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter5-astra/after');
fs.mkdirSync(out,{recursive:true});
const MIME={js:'text/javascript',html:'text/html',css:'text/css',glb:'model/gltf-binary',png:'image/png',jpg:'image/jpeg',json:'application/json'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',MIME[p.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const scenes=(process.env.SCENES||'c5-garage,c5-ride,c5-crest,c5-park,c5-dock-memory,c5-camp-gate,c5-camp,c5-office,c5-lodge,c5-cabins,c5-campfire,c5-owl,c5-calling,c5-three-lights,c5-window,c5-boundary,c5-aftermath').split(',');
const args=['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info','--js-flags=--expose-gc --max-old-space-size=2048'];
if(process.env.BROWSER_SERVERLESS)args.push('--single-process');
const report={renderer:'Chromium / ANGLE SwiftShader (software)',quality:process.env.QUALITY||'low',frames:[],errors:[],runtimeHashes:{}};
for(const name of fs.readdirSync(root).filter(n=>fs.statSync(path.join(root,n)).isFile()).sort())report.runtimeHashes[name]=createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
if(fs.existsSync(path.join(out,'report.json'))){const prev=JSON.parse(fs.readFileSync(path.join(out,'report.json')));report.frames=prev.frames.filter(f=>!scenes.includes(f.section));report.errors=prev.errors.filter(f=>!scenes.includes(f.section));}
let browser,page,activeSection;const batch=Number(process.env.CAPTURE_BATCH||3);
try{for(const [i,section] of scenes.entries()){activeSection=section;if(!browser){
 browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH,args});
 page=await browser.newPage({viewport:{width:1280,height:800}});
 page.on('pageerror',e=>report.errors.push({section:activeSection,error:String(e)}));
 page.on('console',m=>{if(m.type()==='error')report.errors.push({section:activeSection,error:m.text()});});
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa`,{timeout:180000});
 await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.evaluate(q=>{const e=document.getElementById('set-quality');if(e){e.value=q;e.dispatchEvent(new Event('change'));}},report.quality);
 await page.click('#start');}
 const result=await page.evaluate(async section=>{
  const L=lastLight;L.jump(section);L.step(1);
  if(section==='c5-garage'){const s=L.chapter.companions.list.sam,p=L.state.walk;L.face(Math.atan2(s.px-p.x,-(s.pz-p.z)),-.08);L.step(.1);}
  const info=L.render();await new Promise(r=>setTimeout(r,250));L.render();
  const canvas=L.renderer.domElement;
  return {section,phase:L.chapter5.state.phase,camera:{position:L.camera.position.toArray(),rotation:L.camera.rotation.toArray()},...info,heap:performance.memory?.usedJSHeapSize,picture:canvas.toDataURL('image/jpeg',.9)};
 },section);
 fs.writeFileSync(path.join(out,section+'.jpg'),Buffer.from(result.picture.split(',')[1],'base64'));delete result.picture;report.frames.push(result);
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(result));await page.evaluate(()=>globalThis.gc?.());if((i+1)%batch===0){await browser.close();browser=null;}
 }}finally{if(browser)await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
if(report.errors.length){console.error(report.errors);process.exitCode=1;}
