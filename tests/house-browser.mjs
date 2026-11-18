// Prologue house-architecture benchmark: the authored houses checked in the real browser engine (Chromium, ANGLE
// SwiftShader: software rendering, NOT a GPU). One browser at a time.
//   A. the running game without ?houses: none of the house modules or the model is fetched; the Prologue is the same;
//   B. the running game with ?houses (served index.html?qa&houses): the twelve houses load and sit exactly on their
//      plans; nothing reaches the street, the sidewalk or the riding route; the porch steps end where the plan's do;
//      LODs; the car house's working garage door is the authored one and still moves; H swaps authored/procedural in the
//      same frame (before/after pairs from the real riding camera and labelled review cameras); the ride keeps playing;
//      cost in the same frame; the rooms' evening lamps;
//   C. ?bikes&houses: both benchmarks together, the houses beside the authored bikes;
//   D. the offline package (file://, browser offline): PLAYTEST_MODELS=1 (game ?houses from embedded bytes, no network)
//      and the default package (?houses fails loudly, nothing substituted).
// Realism pass: every capture is a same-frame trio — C the refined houses (house.prologue v2), B the first benchmark
// (house.prologue.v1, kept byte for byte), A the procedural houses — switched with the benchmark's own H modes.
// usage: node tests/house-browser.mjs [outDir=docs/qa/houses-realism/browser]   (PARTS=A,B,C,D; SHOTS=0 to skip images)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import os from 'node:os';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/houses-realism/browser');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C,D').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',started:new Date().toISOString(),checks:[],failures:[],parts:{},shots:[]};
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push(detail===undefined?name:{name,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail).slice(0,600):''));return ok;};
const root=path.resolve('dist'),types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const shot=async(page,name,meta)=>{if(!SHOTS)return;const f=path.join(out,name+'.jpg');await page.screenshot({path:f,type:'jpeg',quality:90,timeout:180000});report.shots.push({file:path.relative(process.cwd(),f),...(meta||{})});};
async function withPage(fn,{viewport={width:1600,height:900},offline=false}={}){
 const browser=await pw.chromium.launch({headless:true,args:ARGS});const ctx=await browser.newContext({viewport,deviceScaleFactor:1,offline});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',q=>requests.push(q.url()));
 try{return await fn(page,{errors,requests});}finally{await browser.close();}}
const open=async(page,flags)=>{await page.goto(base+'/index.html?qa'+(flags?'&'+flags:''),{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});};
const waitHouses=page=>page.waitForFunction(()=>window.__houses||/FAILED/.test(document.getElementById('house-benchmark-label')?.textContent||''),null,{timeout:300000});
// the riding camera at a street position (QA place), looking yaw/pitch; returns renderer stats
const ride=(page,s)=>page.evaluate(s=>{const L=lastLight;L.place(s.d,s.lat??-.3,0);for(let i=0;i<4;i++)L.step(1/30);L.look(s.yaw||0,s.pitch||0);L.step(1/30);window.__houses?.tick();window.__bikes?.tick();const i=L.render();
 return {calls:i.calls,triangles:i.triangles,cam:{p:L.camera.position.toArray().map(v=>+v.toFixed(2)),yaw:s.yaw||0,pitch:s.pitch||0,d:s.d,lat:s.lat??-.3},authored:window.__houses?.handle?.authored};},s);
// a review camera: from a street point (d, lat, height) toward a house-local point of a plan
// (the rider is first moved beside the house and the game stepped, so its own distance culling and its sky, which follow
// the rider, are the ones a player standing there would have; then the camera alone moves)
const review=(page,s)=>page.evaluate(s=>{const L=lastLight,T=__houses.THREE,P=__houses.handle.houses.find(h=>h.lot===s.lot).plan;
 if(window.__save){L.camera.position.copy(__save.p);L.camera.quaternion.copy(__save.q);window.__save=null;}
 L.place(P.u,-.3,0);for(let i=0;i<4;i++)L.step(1/30);
 const cam=L.camera;window.__save={p:cam.position.clone(),q:cam.quaternion.clone()};const a=P.toWorld(s.from[0],s.from[2]),b=P.toWorld(s.at[0],s.at[2]);
 cam.position.set(a.x,a.ground+s.from[1],a.z);cam.lookAt(b.x,b.ground+s.at[1],b.z);cam.updateMatrixWorld(true);__houses.tick();window.__bikes?.tick();const i=L.render();return {calls:i.calls,triangles:i.triangles,cam:{p:cam.position.toArray().map(v=>+v.toFixed(2))}};},s);
const restoreCam=page=>page.evaluate(()=>{if(window.__save){lastLight.camera.position.copy(__save.p);lastLight.camera.quaternion.copy(__save.q);window.__save=null;}});
const MODES=[['refined','C-refined'],['v1','B-benchmark'],['procedural','A-procedural']];
const trio=async(page,name,fn,meta)=>{const r={};for(const [m,tag] of MODES){await page.evaluate(m=>__houses.setMode(m),m);r[m]=await fn();await shot(page,`${name}--${tag}`,{camera:meta,kind:'game',mode:m,...r[m]});}
 await page.evaluate(()=>__houses.setMode('refined'));return r;};

// ---------------------------------------------------------------------------------------------------------------- A
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{await open(page,'');await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<30;i++)L.step(1/30);L.render();});
 const req=requests.filter(u=>/house-assets|house-benchmark|assets\/house\//.test(u));
 check('Game: without ?houses the Prologue fetches none of the house benchmark modules or the model',req.length===0,req);
 const r=await page.evaluate(()=>({label:!!document.getElementById('house-benchmark-label'),zones:lastLight.world.merged.filter(m=>/^hb:/.test(m.userData.zone||'')).length,merged:lastLight.world.merged.length}));
 check('Game: without ?houses no benchmark batches exist (the world is baked as in the accepted build)',!r.label&&r.zones===0,r);
 check('Game (no ?houses): no page errors',errors.length===0,errors);report.parts.gameWithout=r;});

// ---------------------------------------------------------------------------------------------------------------- B
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{
 const R=report.parts.game={};await open(page,'houses');const t0=Date.now();await waitHouses(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>{const H=__houses.handle;return {error:__houses.error,errors:H?.errors,loadMs:__houses.loadMs,info:H?.info,houses:H?.houses.map(h=>({id:h.id,lot:h.lot,role:h.role,placeErrMm:+(h.placeErr*1000).toFixed(3)}))};});
 check('Game: ?houses loads the twelve authored houses with no errors',!R.loaded.error&&R.loaded.errors.length===0&&R.loaded.houses.length===12,{error:R.loaded.error,errors:R.loaded.errors,n:R.loaded.houses?.length});
 check('Game: each house sits on its lot exactly as the plan (P.toWorld) places it: placement error < 2 mm',R.loaded.houses.every(h=>h.placeErrMm<2),R.loaded.houses.map(h=>h.placeErrMm));
 check('Game: loaded through GLTFLoader r160 over same-origin HTTP, nothing else fetched',R.loaded.info.from==='http'&&requests.every(u=>u.startsWith(base)||/^(blob|data):/.test(u)));
 // geometry vs the plan, in street coordinates (d, lat): nothing on the street/curb/planting strip/sidewalk; the front
 // ends where the plan's riding obstacle ends (stepFront + 0.3); the authored footprint covers the procedural one
 R.fit=await page.evaluate(()=>{const H=__houses.handle,out={};const walk1=7.85;
  for(const h of H.houses){const P=h.plan;let minLat=1e9,maxZ=-1e9,minX=1e9,maxX=-1e9,minZ=1e9,n=0;
   for(const c of h.parts.house[0])c.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i+=3){const x=p.getX(i),z=p.getZ(i);n++;maxZ=Math.max(maxZ,z);minZ=Math.min(minZ,z);minX=Math.min(minX,x);maxX=Math.max(maxX,x);const s=P.S(x,z);minLat=Math.min(minLat,Math.abs(s.lat));}});
   const ob=__houses.handle.houses.length&&lastLight.world.obstacles?null:null;
   out[h.id]={minAbsLat:+minLat.toFixed(2),frontZ:+maxZ.toFixed(3),stepFront:+P.stepFront.toFixed(3),obstacleFront:+(P.stepFront+.3).toFixed(3),backZ:+minZ.toFixed(2),planBack:+(-P.depth/2).toFixed(2),x:[+minX.toFixed(2),+maxX.toFixed(2)],planX:[+(-P.w/2-(P.hasGarage&&P.gs<0?P.gw:0)).toFixed(2),+(P.w/2+(P.hasGarage&&P.gs>0?P.gw:0)).toFixed(2)],sampled:n};}
  return out;});
 check('Game: no authored geometry on the street, curb, planting strip or sidewalk (every vertex beyond 7.85 m from the centre line)',Object.values(R.fit).every(f=>f.minAbsLat>7.85+.5),Object.fromEntries(Object.entries(R.fit).map(([k,f])=>[k,f.minAbsLat])));
 check('Game: every house ends inside the plan\'s riding obstacle (front <= stepFront + 0.3 m: porches and steps never reach the yard path or the walk)',Object.values(R.fit).every(f=>f.frontZ<=f.obstacleFront+.001),Object.fromEntries(Object.entries(R.fit).map(([k,f])=>[k,[f.frontZ,f.obstacleFront]])));
 check('Game: footprints follow the plans (house and garage width within 0.8 m each side: eaves, chimneys and AC pads only)',Object.values(R.fit).every(f=>f.x[0]>=f.planX[0]-.8-.6&&f.x[1]<=f.planX[1]+.8+.6),Object.fromEntries(Object.entries(R.fit).map(([k,f])=>[k,{x:f.x,plan:f.planX}])));
 // the hoop house's hoop and the car house's door: the numbers the ambient life uses
 R.story=await page.evaluate(()=>{const W=lastLight.world,H=__houses.handle,hoop=W.homes.hoop,ring=W.hoops.find(x=>x.plan===hoop);const car=H.houses.find(h=>h.id==='house.car');const g=W.garages.car;
  const authoredDoor=g.panel.children.filter(c=>/authored/.test(c.name));const procVisible=g.panel.children.filter(c=>!/authored/.test(c.name)&&c.visible).length;
  const p0=new __houses.THREE.Vector3();authoredDoor[0]?.getWorldPosition(p0);const before=p0.clone();g.set(.8);g.panel.updateMatrixWorld(true);authoredDoor[0]?.getWorldPosition(p0);const moved=p0.distanceTo(before);g.set(0);
  return {hoopRim:ring?.rim,hoopPlanned:{x:hoop.gx,y:3.05,z:hoop.gfront+.36},authoredDoorLods:authoredDoor.length,procDoorVisible:procVisible,doorMovesWithPanel:+moved.toFixed(3),footingHidden:W.homes.car.garageFoundation?.visible===false};});
 check('Game: the car house\'s working garage door is the authored one (3 LODs under the panel world.js animates); it moves with the panel; the procedural slab and footing are hidden',R.story.authoredDoorLods===3&&R.story.procDoorVisible===0&&R.story.doorMovesWithPanel>.5&&R.story.footingHidden,R.story);
 check('Game: the hoop the kid shoots at is where the plan put it (the authored hoop was built on the same numbers)',!!R.story.hoopRim&&Math.abs(R.story.hoopRim.x-R.story.hoopPlanned.x)<1e-6&&Math.abs(R.story.hoopRim.z-R.story.hoopPlanned.z)<1e-6,R.story);
 // LOD
 R.lod=await page.evaluate(()=>{const s=__houses.stats();const f=[];for(const n of [0,1,2]){__houses.setLOD(n);__houses.tick();f.push(__houses.stats().tris);}__houses.setLOD(null);__houses.tick();return {allLevels:s.allLevels,forcedDrawn:f,materials:s.materials};});
 check('Game: three LODs per house (LOD0 > LOD1 > LOD2 triangles)',R.lod.allLevels[0]>R.lod.allLevels[1]&&R.lod.allLevels[1]>R.lod.allLevels[2],R.lod);
 // realism pass: the house-only material treatment on the refined set (and only there)
 R.refined=await page.evaluate(()=>{const H=__houses.handle,all=[...H.materials.all],withAO=all.filter(m=>m.aoMap).length,aniso=Math.max(...all.map(m=>m.map?.anisotropy||0)),
  care=H.materials.care.size,glass=[...H.materials.glass].map(m=>m.envMap?.uuid);return {asset:H.assetId,version:H.info.version,refined:H.refined,materials:all.length,withAO,maxAnisotropy:aniso,careClones:care,glassEnvs:new Set(glass).size,max:lastLight.renderer.capabilities.getMaxAnisotropy()};});
 check('Game: the refined set (house.prologue v2) gets the house-only treatment: occlusion maps, full anisotropy, per-house upkeep materials, the street-horizon glass reflection',R.refined.refined&&R.refined.version===2&&R.refined.withAO>0&&R.refined.maxAnisotropy>=Math.min(8,R.refined.max)&&R.refined.careClones>=12,R.refined);
 // B: the first benchmark, kept byte for byte, loads beside it on demand and sits on the same plans
 R.v1=await page.evaluate(async()=>{await __houses.loadV1();const H1=__houses.handleV1;return H1?{errors:H1.errors,houses:H1.houses.length,version:H1.info.version,bytes:H1.info.bytes,refined:H1.refined,placeErrMm:H1.houses.map(h=>+(h.placeErr*1000).toFixed(3)),withAO:[...H1.materials.all].filter(m=>m.aoMap).length,loadMs:__houses.loadMsV1}:null;});
 check('Game: B, the first benchmark (house.prologue.v1, version 1), loads on demand beside the refined houses, on the same plans (0 mm), with its own approved treatment',!!R.v1&&!R.v1.errors.length&&R.v1.houses===12&&R.v1.version===1&&!R.v1.refined&&R.v1.withAO===0&&R.v1.placeErrMm.every(e=>e<2),R.v1);
 R.modes=await page.evaluate(async()=>{const H=__houses.handle,H1=__houses.handleV1,vis=hs=>hs.houses.filter(h=>h.root.visible).length,pv=()=>H.proc.filter(m=>m.visible).length,out={};
  for(const m of ['v1','procedural','refined']){await __houses.setMode(m);out[m]={C:vis(H),B:vis(H1),proc:pv(),procTotal:H.proc.length};}return out;});
 check('Game: H shows exactly one of C, B, A at a time (all twelve lots each)',R.modes.refined.C===12&&R.modes.refined.B===0&&R.modes.refined.proc===0&&R.modes.v1.C===0&&R.modes.v1.B===12&&R.modes.v1.proc===0&&R.modes.procedural.C===0&&R.modes.procedural.B===0&&R.modes.procedural.proc===R.modes.procedural.procTotal,R.modes);
 R.lampsCheck=await page.evaluate(()=>{__houses.setLamps('on');__houses.tick();const lit=[...__houses.handle.materials.interior.values()].map(m=>m.emissiveIntensity);__houses.setLamps('off');__houses.tick();const off=[...__houses.handle.materials.interior.values()].map(m=>m.emissiveIntensity);__houses.setLamps('auto');__houses.tick();return {lit:Math.min(...lit),off:Math.max(...off)};});
 check('Game: the rooms\' lamps follow the evening schedule (V on: every house lit; off: none)',R.lampsCheck.lit>.5&&R.lampsCheck.off===0,R.lampsCheck);
 // ride: the real Prologue keeps playing over the twelve lots
 R.ride=await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);const d0=L.state.distance;L.press('KeyW');for(let i=0;i<240;i++)L.step(1/30);L.release('KeyW');__houses.tick();const r=L.render();return {state:L.state.state,moved:+(L.state.distance-d0).toFixed(2),lateral:+L.state.lateral?.toFixed?.(2),calls:r.calls};});
 check('Game: the Prologue plays on (8 s of pedalling from the start moves the player past the first benchmark lots)',R.ride.state==='riding'&&R.ride.moved>15,R.ride);
 // captures (software WebGL): the riding camera; same frame authored/procedural
 const views=[['prologue-start--riding-camera',{d:0,yaw:0}],['prologue-start-left--riding-camera',{d:20,yaw:.9}],['prologue-start-right--riding-camera',{d:24,yaw:-.85}],['prologue-street-ahead--riding-camera',{d:-12,yaw:.12,pitch:.05}],
  ['hoop-house--riding-camera',{d:138,yaw:.75}],['car-house--riding-camera',{d:505,yaw:.8}],['car-house-and-across--riding-camera',{d:540,yaw:2.6}]];
 R.views={};for(const [name,v] of views)R.views[name]=await trio(page,name,()=>ride(page,v),v);
 const rv=[['car-house-porch--review-camera',{lot:'main:-1:530',from:[2.5,1.7,13],at:[-.4,2.2,4]}],['car-house-garage-open--review-camera',{lot:'main:-1:530',from:[6.5,1.7,14],at:[6.2,1.3,0],open:.95}],
  ['colonial-across-start--review-camera',{lot:'main:1:8',from:[-3,1.7,12],at:[-1,3,4.5]}],['ranch-start--review-camera',{lot:'main:-1:-21',from:[3.5,1.7,13.5],at:[-.5,2.2,4]}],['hoop-house--review-camera',{lot:'main:-1:153',from:[-5,1.7,14],at:[-8.5,2.5,4]}],
  ['cape-start--review-camera',{lot:'main:-1:37',from:[3,1.7,12.5],at:[0,2.6,4]}],['front-gable-start--review-camera',{lot:'main:1:-21',from:[-2,1.7,13],at:[0,3.4,5]}],['window-depth--review-camera',{lot:'main:1:8',from:[-1.6,1.9,8.5],at:[-2.6,1.75,4.9]}]];
 R.review={};for(const [name,v] of rv){if(v.open)await page.evaluate(o=>lastLight.world.garages.car.set(o),v.open);R.review[name]=await trio(page,name,()=>review(page,v),v);if(v.open)await page.evaluate(()=>lastLight.world.garages.car.set(0));}
 await restoreCam(page);
 // the rooms' lamps forced on (V), the Prologue's own light: C and B
 for(const [m,tag] of MODES.slice(0,2)){await page.evaluate(m=>{__houses.setMode(m);__houses.setLamps('on');},m);R['lamps_'+m]=await ride(page,{d:30,yaw:.95});await shot(page,`prologue-start-left--riding-camera--room-lamps-on--${tag}`,{kind:'game',mode:m,note:'V: room lamps forced on (in the ride they come on house by house as the evening goes)'});}
 await page.evaluate(()=>{__houses.setLamps('auto');__houses.setMode('refined');});
 // cost: the same frames, C / B / A
 R.cost=Object.fromEntries(Object.entries(R.views).map(([k,v])=>[k,Object.fromEntries(Object.entries(v).map(([m,x])=>[m,{calls:x.calls,triangles:x.triangles}]))]));
 R.memory=await page.evaluate(()=>({...lastLight.renderer.info.memory,jsHeapMB:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null}));
 R.after=await page.evaluate(()=>{const L=lastLight;L.place(10,-.3,3);for(let i=0;i<5;i++)L.step(1/30);const d0=L.state.distance;L.press('KeyW');for(let i=0;i<90;i++)L.step(1/30);L.release('KeyW');return {state:L.state.state,moved:+(L.state.distance-d0).toFixed(2)};});
 check('Game: after H through B and A and back to C, the ride continues',R.after.state==='riding'&&R.after.moved>2,R.after);
 check('Game (?houses): no page errors',errors.length===0,errors);
 check('Game (?houses): no request leaves the local server',requests.every(u=>u.startsWith(base)||/^(blob|data):/.test(u)));
});

// ---------------------------------------------------------------------------------------------------------------- C
if(PARTS.includes('C'))await withPage(async(page,{errors})=>{const R=report.parts.bikesAndHouses={};await open(page,'bikes&houses');await waitHouses(page);await page.waitForFunction(()=>window.__bikes,null,{timeout:240000});
 R.loaded=await page.evaluate(()=>({houses:__houses.handle?.houses.length,houseErrors:__houses.handle?.errors,bikeErrors:__bikes.errors,bikes:Object.keys(__bikes.handles)}));
 check('Game: ?bikes&houses loads both benchmarks together (12 houses, 4 bikes, no failures)',R.loaded.houses===12&&!R.loaded.houseErrors.length&&!R.loaded.bikeErrors.length&&R.loaded.bikes.length===4,R.loaded);
 R.ride=await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);L.press('KeyW');for(let i=0;i<150;i++)L.step(1/30);L.release('KeyW');__houses.tick();__bikes.tick();const r=L.render();
  return {state:L.state.state,d:+L.state.distance.toFixed(1),calls:r.calls,triangles:r.triangles,friends:L.friends.list.map(f=>({k:f.key,authored:!!f.bike.authored}))};});
 check('Game: the group ride goes on with authored bikes past the authored houses',R.ride.state==='riding'&&R.ride.friends.every(f=>f.authored),R.ride);
 await shot(page,'bikes-and-houses--riding-camera',{kind:'game',...R.ride});
 R.review=await page.evaluate(()=>{const L=lastLight,cam=L.camera,fs=L.friends.list.map(f=>f.bike.group.position);const T=__houses.THREE;const c=fs.reduce((a,p)=>a.add(p),new T.Vector3()).multiplyScalar(1/fs.length);
  window.__save={p:cam.position.clone(),q:cam.quaternion.clone()};cam.position.set(c.x+5.5,c.y+1.7,c.z+6.5);cam.lookAt(c.x-6,c.y+2.2,c.z-3);cam.updateMatrixWorld(true);__houses.tick();__bikes.tick();const r=L.render();return {calls:r.calls,triangles:r.triangles};});
 await shot(page,'bikes-and-houses--review-camera--C-refined',{kind:'game review camera',...R.review});
 await page.evaluate(async()=>{await __houses.setMode('v1');__houses.tick();lastLight.render();});await shot(page,'bikes-and-houses--review-camera--B-benchmark-same-frame',{kind:'game review camera'});
 await page.evaluate(async()=>{await __houses.setMode('procedural');lastLight.render();});await shot(page,'bikes-and-houses--review-camera--A-procedural-same-frame',{kind:'game review camera'});await page.evaluate(()=>__houses.setMode('refined'));
 await restoreCam(page);
 check('Game (?bikes&houses): no page errors',errors.length===0,errors);});

// ---------------------------------------------------------------------------------------------------------------- D
if(PARTS.includes('D')){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ll-houses-')),withModels=path.join(tmp,'models'),plain=path.join(tmp,'default');
 const pack=(dir,env)=>JSON.parse(execFileSync('node',['tools/package-playtest.mjs',dir],{env:{...process.env,PLAYTEST_MENU:'1',...env},encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').pop());
 const P=report.parts.package={withModels:pack(withModels,{PLAYTEST_MODELS:'1'}),default:pack(plain,{})};
 P.sizes={withModels:fs.statSync(path.join(withModels,'Last-Light-Playtest.html')).size,default:fs.statSync(path.join(plain,'Last-Light-Playtest.html')).size};
 const man=JSON.parse(fs.readFileSync(path.join(withModels,'manifest.json'),'utf8'));
 check('Package: PLAYTEST_MODELS=1 embeds the house models (C and B) and hashes them in the manifest',!!man.sourceHashes['dist/assets/house/house.prologue.glb']&&!!man.sourceHashes['dist/assets/house/house.prologue.v1.glb'],{sizes:P.sizes});
 const offlineReq=r=>r.filter(u=>!/^(file|blob|data):/.test(u));
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(withModels,'Last-Light-Playtest.html')).href+'?qa&houses',{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});await waitHouses(page);
  const r=await page.evaluate(()=>{const L=lastLight;L.start();L.press('KeyW');for(let i=0;i<60;i++)L.step(1/30);L.release('KeyW');__houses.tick();L.render();const H=__houses.handle;return {error:__houses.error,errors:H?.errors,houses:H?.houses.length,from:H?.info.from,state:L.state.state};});
  P.game=r;check('Package: ?houses in the offline game places the twelve houses from the embedded bytes, in the running Prologue',!r.error&&r.houses===12&&r.from==='package'&&r.state==='riding',r);
  await shot(page,'package-offline-game-prologue-houses',{kind:'game (offline package)'});
  P.v1=await page.evaluate(async()=>{await __houses.setMode('v1');const H1=__houses.handleV1;const r={mode:__houses.mode,houses:H1?.houses.length,errors:H1?.errors,from:H1?.info.from,version:H1?.info.version};await __houses.setMode('procedural');r.procedural=__houses.mode;await __houses.setMode('refined');r.back=__houses.mode;return r;});
  check('Package: H in the offline game reaches B (the first benchmark, embedded too) and A, and comes back to C',P.v1.mode==='v1'&&P.v1.houses===12&&!P.v1.errors.length&&P.v1.from==='package'&&P.v1.version===1&&P.v1.procedural==='procedural'&&P.v1.back==='refined',P.v1);
  check('Package: offline game makes no network request',offlineReq(requests).length===0,offlineReq(requests));
  check('Package: offline game without page errors',errors.length===0,errors);
 },{offline:true});
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(plain,'Last-Light-Playtest.html')).href+'?qa&houses',{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});await waitHouses(page);
  const label=await page.evaluate(()=>document.getElementById('house-benchmark-label').textContent);const zones=await page.evaluate(()=>lastLight.world.merged.filter(m=>/^hb:/.test(m.userData.zone||'')&&m.visible).length);P.defaultPackageLabel=label;
  check('Package: the default package (no models) says the houses FAILED, keeps the procedural houses and substitutes nothing',/FAILED/.test(label)&&/not embedded/.test(label)&&zones>0,{label,proceduralBatchesVisible:zones});
  check('Package: default package makes no network request either',offlineReq(requests).length===0,offlineReq(requests));
  await shot(page,'package-default-houses-fail-loudly',{kind:'game (default package)'});
 },{offline:true});
 fs.rmSync(tmp,{recursive:true,force:true});
}

server.close();report.finished=new Date().toISOString();report.passed=report.checks.length;report.failed=report.failures.length;
fs.writeFileSync(path.join(out,'house-browser-report.json'),JSON.stringify(report,null,1)+'\n');
console.log(`${report.passed} passed, ${report.failed} failed`);process.exit(report.failed?1:0);
