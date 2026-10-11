// Creature lab: renders the creature's procedural animation in Chromium (SwiftShader) from several angles over time,
// on an empty stretch of Main Street, so its gait, contacts, stops and turns can be judged frame by frame.
// usage: OUT=dir [PROGS=run,trot,stalk,stop,start,turn,back,cower,flee,recoil,idle] [VIEWS=side,front,rear,q34] [N=16] [DT=0.0667] node tests/creature-lab.mjs
// Each program/view writes its frames and an 8-wide contact sheet (needs ImageMagick's montage); 'slip' is how far a
// planted hand or foot is from where it was planted (0 = no sliding).
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execSync} from 'node:child_process';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const exe=fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')?'/opt/pw-browsers/chromium-1194/chrome-linux/chrome':undefined;
const root=path.resolve(process.env.ROOT||'dist'),out=path.resolve(process.env.OUT||'creature-lab-out');fs.mkdirSync(out,{recursive:true});
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=req.url.split('?')[0];const file=path.join(root,decodeURIComponent(u).replace(/^\//,'')||'index.html');try{res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await pw.chromium.launch({executablePath:exe,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:640,height:420}});page.on('pageerror',e=>console.error('PAGE',String(e)));page.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text());});
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
await page.click('#start');
await page.evaluate(async()=>{const L=lastLight;L.step(.4);L.jump('c4-main-street');for(let i=0;i<30;i++)L.step(1/30);const cr=L.chapter3.creature;await cr.ready;
 for(const e of document.querySelectorAll('body *'))if(e.id!=='world'&&!e.contains(document.getElementById('world')))e.style.visibility='hidden';
 const A4=L.chapter4,V=L.camera.position.constructor;
 // motion programs: each returns {u,v,a,speed,drive} at time t (town u along Main, v across; heading west = -PI/2)
 const HW=-Math.PI/2;
 const P={
  run:t=>({u:20+8.6*t,v:0,a:HW,d:{}}),
  trot:t=>({u:20+3.6*t,v:0,a:HW,d:{}}),
  stalk:t=>({u:20+1.0*t,v:0,a:HW,d:{crouch:.4}}),
  stop:t=>{const T=1.1,v0=8.6;const s=t<T?v0*t-v0*t*t/(2*T):v0*T/2;return {u:20+s,v:0,a:HW,d:{}};},
  start:t=>{const s=t<.3?0:Math.min(8.6,(t-.3)*14);const x=t<.3?0:(t-.3<8.6/14?7*(t-.3)**2:8.6*8.6/28+8.6*(t-.3-8.6/14));return {u:20+x,v:0,a:HW,d:{}};},
  turn:t=>{const R=5,w=8.6/R*.6;const th=w*t;return {u:20+R*Math.sin(th),v:R*(1-Math.cos(th)),a:HW-th,d:{}};},
  back:t=>({u:20-0.9*t,v:0,a:HW,d:{back:1,cower:.4}}),
  cower:t=>({u:20,v:0,a:HW,d:{cower:1}}),
  flee:t=>{const T0=.4;if(t<T0)return {u:20,v:0,a:HW,d:{cower:1}};const tt=t-T0,a2=HW+Math.min(Math.PI,tt*Math.PI/.35);const v=Math.min(8.4,15*tt),s=tt<8.4/15?7.5*tt*tt:8.4*8.4/30+8.4*(tt-8.4/15);return {u:20-Math.sin(a2-HW)*0+(-s*Math.cos(a2-HW))*0+20*0+(-s),v:0,a:a2,d:{cower:Math.max(0,1-tt*3)}};},
  recoil:t=>{const x=t<.3?0:t<.55?-(t-.3)*2.6:-.65;return {u:20+x,v:0,a:HW,d:{cower:t<.3?0:.8,snap:1}};},
  idle:t=>({u:20,v:0,a:HW,d:{}}),
 };
 window.__lab={L,A4,cr,P,prev:null,
  frame(prog,t,dt,view){const s=P[prog](t),q=A4.at(s.u,s.v),y=L.nav.groundY(q.x,q.z)??0;
   const prev=this.prev;const sp=prev?Math.hypot(q.x-prev.x,q.z-prev.z)/dt:0;this.prev={x:q.x,z:q.z};
   Object.assign(cr.drive,{speed:sp,rear:0,claw:0,crouch:0,look:null,cower:0,back:0},s.d);cr.show(true);cr.place(q.x,y,q.z,s.a);cr.update(dt);
   const fx=Math.sin(s.a),fz=-Math.cos(s.a),rx=Math.cos(s.a),rz=Math.sin(s.a);const D=4.6;let cx,cz;
   if(view==='side'){cx=q.x+rx*D;cz=q.z+rz*D;}else if(view==='front'){cx=q.x+fx*D;cz=q.z+fz*D;}else if(view==='rear'){cx=q.x-fx*D;cz=q.z-fz*D;}else{cx=q.x+(fx+rx)*D*.72;cz=q.z+(fz+rz)*D*.72;}
   if(window.__hide)L.scene.traverse(o=>{if(o.name&&window.__hide.test(o.name))o.visible=false;});const cam=L.camera;if(cam.fov!==24){cam.fov=24;cam.updateProjectionMatrix();}cam.position.set(cx,y+.9,cz);cam.lookAt(q.x,y+.45,q.z);cam.updateMatrixWorld();L.render();return {sp:+sp.toFixed(2),lift:+(cr.lift||0).toFixed(3),slip:+(cr.slip||0).toFixed(3)};}};});
if(process.env.HIDE)await page.evaluate(h=>{window.__hide=new RegExp(h);},process.env.HIDE);
const progs=(process.env.PROGS||'run').split(','),views=(process.env.VIEWS||'side,front,rear,q34').split(','),N=+(process.env.N||16),dt=+(process.env.DT||1/15);
for(const prog of progs)for(const view of views){const dir=path.join(out,prog+'-'+view);fs.mkdirSync(dir,{recursive:true});
 await page.evaluate(([prog,dt,view])=>{__lab.prev=null;__lab.cr.reset();__lab.cr.show(true);for(let i=0;i<12;i++)__lab.frame(prog,0,dt,view);},[prog,dt,view]);// (settle at t=0)
 await page.evaluate(()=>{__lab.prev=null;});
 const info=[];for(let i=0;i<N;i++){const r=await page.evaluate(([prog,t,dt,view])=>__lab.frame(prog,t,dt,view),[prog,i*dt,dt,view]);info.push(r);await page.screenshot({path:path.join(dir,String(i).padStart(2,'0')+'.jpg'),type:'jpeg',quality:80});}
 execSync(`montage ${dir}/*.jpg -tile 8x -geometry 320x210+2+2 ${out}/${prog}-${view}.jpg`);console.log(prog,view,'slip',JSON.stringify(info.map(x=>x.slip)));}
await browser.close();server.close();
