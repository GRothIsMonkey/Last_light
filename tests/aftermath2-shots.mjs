// Aftermath II and 2026 captures: named shots, each a function run in the page after a fresh load (one browser per shot: software GL
// memory). SHOTS=a,b picks; OUT directory; VIEW size; DEFS the table (default tests/aftermath2-shot-defs.mjs).
// These are for looking at: whether a room reads as a room and a face as a face is judged by eye, not by this script.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const repo=path.resolve('.'),root=path.join(repo,'dist'),out=path.resolve(process.env.OUT||'docs/qa/aftermath2');fs.mkdirSync(out,{recursive:true});
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const file=path.join(repo,u.replace(/^\//,''));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{const body=fs.readFileSync(file);res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const [VW,VH]=(process.env.VIEW||'960x540').split('x').map(Number);
const args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const defs=(await import(path.resolve(process.env.DEFS||'tests/aftermath2-shot-defs.mjs'))).default;
const want=process.env.SHOTS?new Set(process.env.SHOTS.split(',')):null;const results=[];
for(const [name,{note,setup,frames}] of Object.entries(defs)){if(want&&!want.has(name))continue;
 const browser=await pw.chromium.launch({headless:true,args});const page=await browser.newPage({viewport:{width:VW,height:VH}});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200));});
 try{await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
  await page.goto(`http://127.0.0.1:${server.address().port}/dist/index.html?qa`,{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});
  await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
  await page.evaluate(async()=>{const L=lastLight,A=L.aftermath2,{groundPoint,heading}=await import('./route.js');window.__f={
   // (looking at a world point: in a pose the view is the pose's heading plus how far you have turned since sitting down)
   look(q,{pitch=null}={}){const c=L.camera.position,a=Math.atan2(q.x-c.x,-(q.z-c.z)),pt=pitch??Math.atan2((q.y??c.y)-c.y,Math.hypot(q.x-c.x,q.z-c.z)),P=A.C.pose;
    if(P&&!P.release)L.face(a-(P.yaw-P.from),Math.max(-1.3,Math.min(.9,pt-P.pitch+(P.fromPitch||0))));else L.face(a,pt);},
   run(sec,each){const n=Math.ceil(sec*30);for(let i=0;i<n;i++){L.step(1/30);each?.();}},
   SP:(d,lat,dy=0)=>A.SC.SP(d,lat,dy),BW:(u,v,dy=0)=>A.SC.BW(u,v,dy),heading,
   put(q,a=0){L.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:null});},
   view(from,to){this.put(from,0);this.run(.2);this.look(to);this.run(.1);},
   head(a){const pr=a.person,j=pr.joints?.head;if(j)return pr.group.localToWorld(j.clone());const g=pr.group.position;return {x:g.x,y:g.y+1.5*(a.spec?.scale||1),z:g.z};},
   closeOn(a,dist=1.4,side=.25,dy=-.02){const h=this.head(a),ang=a.a;const fx=Math.sin(ang),fz=-Math.cos(ang),rx=Math.cos(ang),rz=Math.sin(ang);this.put({x:h.x+fx*dist+rx*side,z:h.z+fz*dist+rz*side},0);this.run(.15);this.look({x:h.x,y:h.y+dy,z:h.z});this.run(.05);},
   play(done,max=120,{skip=/^$/,answer=1}={}){for(let i=0;i<max*30;i++){if(done())return true;if(i%15===0){for(const [id,f] of [...A.C.offers]){if(skip.test(id)||(f.when&&!f.when()))continue;A.C.offers.delete(id);A.C.flags[id]=true;try{f.fn?.();}catch(e){console.error(e);}break;}
     if(A.C.choice&&answer!=null&&A.C.choice.t>1.2){const ch=A.C.choice;A.C.choice=null;ch.then(ch.options[Math.min(answer,ch.options.length)-1].id);}}L.step(1/30);}return !!done();},
   said(t){return A.C.marks.some(m=>m[1].includes(t));},line(){return L.chapter.state.line||'';}};});
  if(setup)await page.evaluate(setup);
  // (a frame may ask for real time to pass first, for the page's own CSS fades: [name, fn, {wait:ms}])
  for(const [fname,fn,fo] of frames){const info=await page.evaluate(fn);if(fo?.wait)await page.waitForTimeout(fo.wait);await page.evaluate(()=>lastLight.render());await page.screenshot({path:path.join(out,name+'-'+fname+'.jpg'),type:'jpeg',quality:84,timeout:300000});
   const st=await page.evaluate(()=>({phase:lastLight.aftermath2.state.phase,coda:lastLight.coda.state().stage,caption:document.getElementById('subtitle').textContent.slice(0,120),draws:lastLight.renderer.info.render.calls,tris:lastLight.renderer.info.render.triangles}));results.push({name,frame:fname,note,...st,info});console.log('shot',name,fname,JSON.stringify(st).slice(0,200),JSON.stringify(info??null).slice(0,160));}
 }catch(e){console.log('ERR',name,String(e.message||e).slice(0,400));results.push({name,error:String(e.message||e).slice(0,400)});}
 if(errs.length)console.log('pageerrors',name,errs.slice(0,6));await browser.close().catch(()=>{});}
let all=results;try{const old=JSON.parse(fs.readFileSync(path.join(out,'shots.json'),'utf8'));all=[...old.filter(r=>!results.some(q=>q.name===r.name)),...results];}catch{}
fs.writeFileSync(path.join(out,'shots.json'),JSON.stringify(all,null,1));server.close();
