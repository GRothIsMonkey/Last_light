// Human-viewable review frames (Chromium, SwiftShader unless BROWSER_GPU=1, sound off): a review script runs in the
// page against the real renderer, steps the game deterministically (?qa), and captures the WebGL picture at the moments
// it names, so an animation can be looked at before, during and after it. Not a pass/fail test: it writes frames.
//   REVIEW=tests/review/garage.mjs OUT=docs/qa/chapter5-repair/garage node tests/review-capture.mjs
// The review module: export default async function(L,{cap,step,press,release,tap,face,wait}) { ... }
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.OUT||'docs/qa/chapter5-repair/review');fs.mkdirSync(out,{recursive:true});
const review=process.env.REVIEW;if(!review){console.error('REVIEW=<module> required');process.exit(2);}
const types={js:'application/javascript',mjs:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json',png:'image/png',jpg:'image/jpeg'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);if(u==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.join(repo,u.replace(/^\//,''));if(!(file.startsWith(root+path.sep)||file.startsWith(path.join(repo,'tests')+path.sep))){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist');
const browser=await pw.chromium.launch({headless:true,args});
const W=+(process.env.W||1280),H=+(process.env.H||800);
const page=await browser.newPage({viewport:{width:W,height:H}});const errors=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE',m.text());}else if(process.env.VERBOSE)console.log('page:',m.text());});
let saved=0;
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.click('#start');await page.evaluate(()=>lastLight.step(.3));
 await page.exposeFunction('__save',(name,data)=>{fs.writeFileSync(path.join(out,name+'.jpg'),Buffer.from(data.split(',')[1],'base64'));saved++;console.log('frame',name);});
 const rel='/'+path.relative(repo,path.resolve(review)).split(path.sep).join('/');
 const res=await page.evaluate(async(rel)=>{const L=lastLight,m=await import(rel);
  const key=(type,code)=>dispatchEvent(Object.assign(new Event(type),{code}));
  const step=(s=1/30)=>{const n=Math.max(1,Math.round(s*30));for(let i=0;i<n;i++)L.step(1/30);};
  const press=c=>key('keydown',c),release=c=>key('keyup',c),tap=c=>{press(c);release(c);};
  const cap=async(name,{text=true}={})=>{L.render();const src=L.renderer.domElement,c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);
   if(text){const k=c.width/1280,line=(s,x,y,sz,al='left')=>{g.font=`${Math.round(sz*k)}px Georgia, serif`;g.textAlign=al;g.fillStyle='rgba(0,0,0,.6)';g.fillText(s,x*k+1,y*k+1);g.fillStyle='rgba(255,248,236,.95)';g.fillText(s,x*k,y*k);};
    const date=document.getElementById('date')?.textContent||'',obj=document.getElementById('objective')?.textContent||'',cap=document.getElementById('subtitle')?.style.opacity==='0'?'':document.getElementById('subtitle')?.textContent||'',pr=L.state.prompt||'';
    line(date.toUpperCase(),40,56,14);if(obj)line(obj,40,80,16);if(cap)line(cap.slice(0,120),640,730,21,'center');if(pr)line(pr,640,770,16,'center');line(name,1240,790,12,'right');}
   await window.__save(name,c.toDataURL('image/jpeg',.86));};
  const face=(a,p=0)=>L.face(a,p);
  try{return {ok:true,info:await m.default(L,{cap,step,press,release,tap,face,wait:step})};}catch(e){return {ok:false,err:String(e.stack||e).slice(0,1500)};}},rel);
 console.log(JSON.stringify(res,null,1));
}catch(e){console.error(e);errors.push(String(e));}
finally{await browser.close();server.close();console.log(JSON.stringify({saved,errors:errors.slice(0,10)}));}
