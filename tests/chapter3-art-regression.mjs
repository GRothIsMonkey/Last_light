// Rendered regression for the new material/geometry swaps and room-only lights.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter3-astra-regression');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html');if(req.url.startsWith('/favicon')){res.writeHead(204);return res.end();}try{res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.glb')?'model/gltf-binary':'text/html');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[],frames=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
function check(name,value){assert.ok(value,name);checks.push(name);console.log('PASS',name);}
async function shot(name){const f=await page.evaluate(()=>({...lastLight.render(),phase:lastLight.state.chapter.phase}));await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:91,timeout:120000});frames.push({name,...f});}
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/?qa`,{timeout:120000});await page.waitForFunction(()=>window.lastLight,null,{timeout:120000});
 await page.evaluate(()=>{const L=lastLight;window.originalArt={head:L.chapter.kit.jamie.person.parts.head.geometry,torso:L.chapter.kit.jamie.person.parts.torso.geometry,materials:L.world.merged.map(o=>o.material),torch:L.foot.light.color.getHex()};});
 for(const [c3,earlier] of [['alex-bedroom','alex-departure'],['c3-tunnel-deep','investigation'],['c3-creature-advance','chapter2-end']]){
  await page.evaluate(id=>{lastLight.jump(id);lastLight.step(.8);},c3);await shot(c3);
  check(c3+': Chapter Three geometry active',await page.evaluate(()=>lastLight.chapter.kit.jamie.person.parts.head.geometry!==originalArt.head));
  if(c3==='alex-bedroom')check('bedroom daylight attached only in the room',await page.evaluate(()=>!!lastLight.scene.getObjectByName('alex-window-daylight')));
  if(c3==='c3-tunnel-deep'){
   check('deep tunnel culls outside world and shadow batches',await page.evaluate(()=>lastLight.world.merged.filter(o=>o.userData.zone!=='tunnel').every(o=>o.layers.mask===0)&&lastLight.world.shadowProxies.every(o=>o.layers.mask===0)));
   check('tunnel water is bounded transparent shallow water',await page.evaluate(()=>{const m=lastLight.world.merged.find(o=>o.material.userData.surface==='drainwater').material;return m.transparent&&m.opacity>.5&&m.opacity<1&&!m.depthWrite;}));
  }
  await page.evaluate(id=>{lastLight.jump(id);lastLight.step(.5);},earlier);await shot('restored-'+earlier);
  check(earlier+': original character geometry and world materials restored',await page.evaluate(()=>{const L=lastLight;return L.chapter.kit.jamie.person.parts.head.geometry===originalArt.head&&L.chapter.kit.jamie.person.parts.torso.geometry===originalArt.torso&&L.world.merged.every((o,i)=>o.material===originalArt.materials[i]);}));
  check(earlier+': no room light, contact shadow, or torch-colour leak',await page.evaluate(()=>{const L=lastLight;return !L.scene.getObjectByName('alex-window-daylight')&&!L.scene.getObjectByName('alex-room-sky-bounce')&&L.scene.children.filter(o=>o.name==='chapter3-contact').every(o=>!o.visible)&&L.foot.light.color.getHex()===originalArt.torch;}));
 }
 check('no JavaScript or shader errors',errors.length===0);
 const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:checks.length,checks,errors,frames,runtimeHashes},null,2));
}finally{await browser.close();server.close();}
