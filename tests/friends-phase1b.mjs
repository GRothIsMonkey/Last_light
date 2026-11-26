// Run from the repository root. Optionally pass a server-free game HTML and output JSON path.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const flags='bikes&houses&vegetation&pavement&streetprops&details&player1b&friends1b',root=path.resolve('dist');
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');if(u.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
 const f=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||undefined,headless:true,args:['--use-angle=d3d11','--enable-unsafe-swiftshader']});
const url='http://127.0.0.1:'+server.address().port,errors=[],report={},checks=[];
function check(k,v){checks.push({k,pass:!!v});}
try{
 for(const on of [false,true]){
   const page=await browser.newPage({viewport:{width:800,height:560}});const req=[];
   page.on('request',r=>req.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'/?qa'+(on?'&'+flags:''),{timeout:160000});
   await page.waitForFunction(on=>window.lastLight&&(!on||window.friends1b&&window.player1b?.flags.ready&&window.__bikes&&window.__houses&&window.__vegetation&&window.__pavement&&window.__streetprops&&window.__details),on,{timeout:150000});
   const trace=await page.evaluate(()=>{
     const g=lastLight;g.start();g.ui.closePanels();g.press('KeyW');const rows=[],handoffs=[],prev={};let seconds=0;
     for(let i=0;i<8300;i++){g.step(1/30);seconds+=1/30;const f=g.friends.list;
       if(window.friends1b)for(const item of friends1b.cast){const who=item.f,pt=item.skin.instance.bones.hips.getWorldPosition(g.camera.position.clone()),on=who.person.group.parent===who.bike.group;
         if(prev[who.key]?.ride&&!on)handoffs.push({key:who.key,meters:pt.distanceTo(prev[who.key].pt),sec:seconds});prev[who.key]={pt,ride:on};}
       if(i%90===0){const s=g.state;rows.push([s.state,+s.distance.toFixed(4),s.caption,...f.map(q=>[q.key,q.mode,q.step,+q.bd.toFixed(3),+q.blat.toFixed(3),!!q.inside,!!q.gone])]);}
       if(g.state.state==='stopped')break;
     }return {rows,handoffs};
   });
   if(!on){report.baseline=trace.rows;check('Flag absent loads zero friend GLBs or benchmark modules',!req.some(u=>/friends-1b|chr\.(alex|jamie|sam)\.a12\.glb/.test(u)));await page.close();continue;}
   check('Controls, paths, departures, captions and route trace match the unflagged build',JSON.stringify(trace.rows)===JSON.stringify(report.baseline));report.handoffs=trace.handoffs;check('Jamie and Sam hand off within one frame of normal movement',trace.handoffs.length===2&&trace.handoffs.every(h=>h.meters<.18));
   report.lifecycle=await page.evaluate(()=>{
     const g=lastLight;g.reset();g.step(.1);const start=friends1b.cast.map(({f,skin,original})=>({key:f.key,bones:Object.keys(skin.instance.bones).length,actions:Object.keys(skin.instance.actions),skeletons:skin.instance.skeletons,levels:skin.meshes.map(m=>m.visible),masked:original.every(([o])=>o.layers.mask===0),finite:Object.values(skin.instance.bones).every(b=>b.matrixWorld.elements.every(Number.isFinite))}));
     g.pause();const paused=g.state.state;g.resume();const resumed=g.state.state;g.toTitle();g.step(.1);const title=friends1b.cast.every(i=>!i.active&&i.original.every(([o,mask])=>o.layers.mask===mask));
     g.reset();g.step(.1);const reset=friends1b.cast.every(i=>i.active&&i.f.person.group.visible);
     g.jump('wake');g.step(.1);const later=friends1b.cast.every(i=>!i.active);
     g.reset();g.step(.1);return {start,paused,resumed,title,reset,later};
   });
   const life=report.lifecycle;check('68 finite joints, 14 actions, a shared skeleton, one visible LOD and zero original shadow casters per friend',life.start.every(v=>v.bones===68&&v.actions.length===14&&v.skeletons===1&&v.levels.filter(Boolean).length===1&&v.masked&&v.finite));
   check('Pause, resume, title, restart and chapter jump',life.paused==='paused'&&life.resumed==='riding'&&life.title&&life.reset&&life.later);
   report.contacts=await page.evaluate(async()=>{
     const {ridePose,walkPose,newPose,P,gripPos,pedalPos,addWave}=await import('./rig.js'),T=await import('./three.module.js'),results={};
     const v=new T.Vector3(),bar=new T.Vector3(),pedal=new T.Vector3(),delta=new T.Vector3(),axis=new T.Vector3();
     for(const {f,skin} of friends1b.cast){
       const m=skin.meshes[0],skeleton=m.skeleton,geom=f.bike.geom,a=m.geometry.attributes,groups={},pts={},p=newPose(),measure={};
       function add(n,val){if(Number.isFinite(val))(measure[n]??=[]).push(val);}
       const unique=new Set();for(let i=0;i<a.position.count;i++){
         const coords=[a.position.getX(i),a.position.getY(i),a.position.getZ(i)],id=coords.map(x=>x.toFixed(5)).join();if(unique.has(id))continue;unique.add(id);
         let best=0;for(let k=1;k<4;k++)if(a.skinWeight.getComponent(i,k)>a.skinWeight.getComponent(i,best))best=k;
         const n=skeleton.bones[a.skinIndex.getComponent(i,best)].name;
         if(/^(foot|toe|hand|thumb|index|middle|ring|pinky|hips|thigh)/.test(n))(groups[n]??=[]).push(i);
       }
       const own=f.bike.group.matrixWorld.clone().invert(),toLocal=own.clone();
       function update(x){skin.apply(p,x);f.bike.group.updateMatrixWorld(true);skeleton.update();toLocal.copy(f.bike.group.matrixWorld).invert().multiply(m.matrixWorld);}
       function vert(i){return m.getVertexPosition(i,v).applyMatrix4(toLocal);}
       let phaseCount=0;
       for(const steer of [-.41,0,.41])for(const speed of [1.3,4.8])for(let i=0;i<36;i++){
         const phase=2*Math.PI*i/36,wave=(speed===1.3&&steer===.41)?.9:0;
         ridePose(p,phase,{geom,steer,stand:0,astride:0,posture:f.cast.build.posture});if(wave)addWave(p,i/12,wave);
         update({clock:i/12,ride:1,geom,steer,crank:phase,speed,wave});phaseCount++;
         for(const [s,side] of [['l',-1],['r',1]]){
           pedalPos(phase,side,pedal,geom);let lowest=Infinity;
           for(const n of ['foot_'+s,'toe_'+s])for(const ix of groups[n]||[]){const z=vert(ix);if(Math.abs(z.x-pedal.x)<.043&&Math.abs(z.z-pedal.z)<.035)lowest=Math.min(lowest,z.y-pedal.y-.011);}
           add('pedalClearance',lowest);if(!Number.isFinite(lowest))add('offPedal',1);
           if(wave&&side===1)continue;
           gripPos(steer,side,bar,geom);axis.set(1,0,0).applyQuaternion(geom.rakeInv).applyAxisAngle(new T.Vector3(0,1,0),steer).applyQuaternion(geom.rakeQ);
           const socket=skin.instance.bones['socket_grip_'+s].getWorldPosition(delta).applyMatrix4(own);add('socket',socket.distanceTo(bar));
           for(const part of ['hand','thumb','index','middle','ring','pinky']){
             let nearest=Infinity,deep=Infinity;
             for(const [n,idx] of Object.entries(groups))if(n.startsWith(part)&&n.endsWith('_'+s))for(const ix of idx){
               delta.copy(vert(ix)).sub(bar);const along=delta.dot(axis);if(side*along<-.060||side*along>.045)continue;
               const gap=Math.sqrt(Math.max(0,delta.lengthSq()-along*along))-.019;nearest=Math.min(nearest,Math.abs(gap));deep=Math.min(deep,gap);
             }
             add(part+'Touch',nearest);add(part+'Signed',deep);
           }
         }
         // In the rest mesh +Y is height and -Z is posterior. Exclude cuffs and free thigh cloth.
         // Signed distance of the nearest gluteal garment sample to the central padded seat envelope.
         let seat=Infinity;for(const n of ['hips','thigh_l','thigh_r'])for(const ix of groups[n]||[]){
           if(a.position.getY(ix)<.735||a.position.getY(ix)>.83||a.position.getZ(ix)>-.050)continue;
           const b=vert(ix),gap=b.y-geom.saddle[1]-.0275;
           if(Math.abs(b.x)<.048&&Math.abs(b.z-geom.saddle[2])<.048&&Math.abs(gap)<Math.abs(seat))seat=gap;
         }add('saddleClearance',seat);
       }
       for(const speed of [1.65,3.35]){const name=speed<2?'walk':'run',ground=[];
         for(let i=0;i<48;i++){walkPose(p,i/48,speed);update({clock:i/24,gait:i/48,ride:0,geom,speed});
           const step=(.62+.42*speed)/48,feet=[];
           for(const [j,s] of ['l','r'].entries()){let lo=Infinity,loc=0,id=-1;for(const n of ['foot_'+s,'toe_'+s])for(const ix of groups[n]||[]){const b=vert(ix);if(b.y<lo){lo=b.y;loc=b.z;id=ix;}}
             if(i&&lo<.006&&ground[i-1][j][0]<.006){const old=ground[i-1][j];add(name+'PlantTravelPerStep',Math.abs(vert(old[2]).z-old[1]-step));}
             feet.push([lo,loc,id]);}add(name+'Ground',Math.min(feet[0][0],feet[1][0]));ground.push(feet);}
       }
       results[f.key]={phaseCount,meters:Object.fromEntries(Object.entries(measure).map(([k,r])=>{r.sort((a,b)=>a-b);return [k,{n:r.length,min:r[0],median:r[Math.floor(r.length*.5)],p95:r[Math.floor(r.length*.95)],max:r.at(-1)}];}))};
     }return results;
   });
   const surface=Object.values(report.contacts);
   check('Visible mesh sampled over 216 bicycle conditions per child',surface.every(c=>c.phaseCount===216&&c.meters.pedalClearance?.n===432&&c.meters.indexTouch?.n>350));
   check('Outsoles follow both tread envelopes within 2 mm',surface.every(({meters:m})=>!m.offPedal&&m.pedalClearance.min>-.002&&m.pedalClearance.max<.002));
   check('Every gripping digit is within 5 mm of the grip surface on every sampled pose',surface.every(({meters:m})=>['thumb','index','middle','ring','pinky'].every(d=>m[d+'Touch'].max<.005&&m[d+'Signed'].min>-.005)));
   check('Nearest posterior garment sample is within 7 mm of the saddle envelope throughout the seated sweep',surface.every(({meters:m})=>m.saddleClearance.n===216&&m.saddleClearance.max<.007&&m.saddleClearance.min>-.007));
   await page.close();
 }
 if(process.argv[2]){
   const ctx=await browser.newContext({offline:true,viewport:{width:800,height:560}}),page=await ctx.newPage(),outbound=[];
   page.on('request',r=>{if(/^https?:/.test(r.url()))outbound.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve(process.argv[2])).href+'?qa&'+flags,{timeout:170000});
   await page.waitForFunction(()=>window.friends1b&&window.player1b?.flags.ready&&window.__details&&window.__houses&&window.__bikes&&window.__pavement&&window.__streetprops&&window.__vegetation,null,{timeout:170000});
   const state=await page.evaluate(()=>{lastLight.start();lastLight.press('KeyW');lastLight.step(3);lastLight.render();return {d:lastLight.state.distance,active:friends1b.cast.filter(i=>i.active).length,embedded:Object.keys(globalThis.__LL_ASSETS__).length};});
   report.offline={...state,outbound};check('Offline file starts and rides with all eight flags and no network requests',!outbound.length&&state.active===3&&state.d>0);await ctx.close();
 }
 check('No browser JavaScript errors',!errors.length);
}finally{delete report.baseline;report.errors=errors;report.checks=checks;fs.writeFileSync(process.argv[3]||'friends-qa.json',JSON.stringify(report,null,2));await browser.close();await new Promise(ok=>server.close(ok));}
console.log(checks);assert(checks.every(x=>x.pass));
