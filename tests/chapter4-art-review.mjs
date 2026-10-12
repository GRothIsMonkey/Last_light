// Repeatable art views. The full input-driven walkthrough remains chapter4-browser.mjs.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter4-astra-review');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.join(root,req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]);try{res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],warnings=[],frames=[],checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS',name);};
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning'&&/shader|GL_INVALID|Feedback loop/i.test(m.text()))warnings.push(m.text());});
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa`);await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});await page.click('#start');
 await page.evaluate(()=>{const L=lastLight;window.originalArt={head:L.chapter.kit.jamie.person.parts.head.geometry,materials:L.world.merged.map(o=>o.material)};});
 const shots=[['c4-sam-house'],['c4-camera'],['c4-old-mill-road'],['c4-downtown-arrival'],['c4-main-street'],['c4-mason'],['c4-library'],['c4-microfilm'],['c4-dusk'],['c4-creature-hiding',4],['c4-tv-window'],['c4-video-store'],['c4-video-store',1,110,-17,107,-24],['c4-back-door'],['c4-route-a'],['c4-route-b'],['c4-theater'],['c4-marquee'],['c4-ride-home'],['alex-bedroom']];
 for(let i=0;i<shots.length;i++){
  const [id,sec=1.5,u,v,tu,tv]=shots[i];
  const info=await page.evaluate(async a=>{const L=lastLight;L.jump(a.id);L.step(a.sec);if(a.u!==undefined){const m=await import('./town-plan.js'),q=m.TW(a.u,a.v),t=m.TW(a.tu,a.tv);L.camera.position.set(q.x,m.townY(a.u,a.v)+1.5,q.z);L.camera.lookAt(t.x,m.townY(a.tu,a.tv)+1.3,t.z);L.camera.updateMatrixWorld();}
   for(const el of document.querySelectorAll('*'))for(const a of el.getAnimations())try{a.finish();}catch{}
   if(a.id==='c4-creature-hiding'){const p=L.chapter3.creature.headPos();L.camera.lookAt(p.x,p.y-.25,p.z);L.camera.updateMatrixWorld();}
   const r=L.render(),T=L.world.town;return {calls:r.calls,triangles:r.triangles,phase:L.state.chapter4.phase,atlases:Object.fromEntries(['signs','covers','rooms'].map(k=>{const A=T[k+'Atlas'];return [k,{full:A.full,entries:A.entries,width:A.width,height:A.height,usedHeight:A.usedHeight}];})),art:T.D.artStats||null,footageLightLeaked:!!L.scene.getObjectByName('chapter4-footage-room-bounce')};},{id,sec,u,v,tu,tv});
  const name=String(i).padStart(2,'0')+'-'+id;await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:88,timeout:300000});frames.push({name,...info});console.log(name,JSON.stringify(info));
 }
 check('every sign, cover and shop-room allocation fits',frames.every(f=>Object.values(f.atlases).every(a=>!a.full)));
 check('offscreen footage leaves no extra room light in the main scene',frames.every(f=>!f.footageLightLeaked));
 check('physical shop lights obey the Presence blackout immediately',await page.evaluate(()=>{const L=lastLight;L.jump('c4-video-store');L.step(1);const T=L.world.town,lit=T.D.lights.filter(s=>s.L.intensity>.05&&s.want?.idx!==undefined);if(!lit.length)return false;const ids=new Set(lit.map(s=>s.want.idx));for(const i of ids)L.chapter4.lights.kill(i,undefined,{flick:0,dur:.001});L.step(.04);return [...ids].every(i=>T.levels[i]===0)&&T.D.lights.every(s=>!ids.has(s.want?.idx)||s.L.intensity===0);}));
 for(const id of ['alex-departure','investigation','chapter2-end']){
  await page.evaluate(id=>{const L=lastLight;L.jump('c4-back-door');L.step(.3);L.jump(id);L.step(.5);L.render();},id);
  check(id+': earlier character and world materials restored',await page.evaluate(()=>{const L=lastLight;return L.chapter.kit.jamie.person.parts.head.geometry===originalArt.head&&L.world.merged.every((m,i)=>m.material===originalArt.materials[i]);}));
  check(id+': Chapter Four contacts, props, seams and lights absent',await page.evaluate(()=>{const L=lastLight;let clean=true;L.scene.traverse(o=>{if(['chapter4-domestic-detail','chapter4-mom-contact','apparent-alex-contact','chapter4-clothing-detail'].includes(o.name)&&o.visible)clean=false;});return clean&&L.world.town.D.lights.every(s=>!s.L.parent)&&!L.scene.getObjectByName('chapter4-footage-room-bounce');}));
 }
 check('no JavaScript errors or shader warnings',!errors.length&&!warnings.length);
}finally{const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:checks.length,checks,frames,errors,warnings,runtimeHashes},null,2));await browser.close();server.close();console.log(JSON.stringify({checks:checks.length,frames:frames.length,errors,warnings}));if(errors.length||warnings.length)process.exitCode=1;}
