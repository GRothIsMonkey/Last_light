// Phase 1 bicycle benchmark: the four authored bikes checked in the real browser engine (Chromium, ANGLE SwiftShader:
// software rendering, NOT a GPU). One browser at a time.
//   A. the Bike Lab (served dist/bike-lab.html): load, anchors vs rig.js, materials and textures, moving parts about
//      their real pivots (wheels, steering, crank, pedals, bell lever, stand), LODs, contacts of the game's riders,
//      memory; captures (lineup, compare with the procedural bikes, riders, first person);
//   B. the running game (served index.html?qa&bikes): nothing loads without ?bikes; the four bikes under their riders in
//      the Prologue; the real first-person camera; the bell; the ride keeps playing; same-frame authored/procedural pairs;
//   C. the offline package (file://, browser offline): PLAYTEST_MODELS=1 (Bike Lab page and game ?bikes from embedded
//      bytes, zero network requests) and the default package (?bikes fails loudly, nothing substituted).
// usage: node tests/bike-browser.mjs [outDir=docs/qa/bikes-phase1/browser]   (PARTS=A,B,C; SHOTS=0 to skip images)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import os from 'node:os';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/bikes-phase1/browser');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',started:new Date().toISOString(),checks:[],failures:[],parts:{}};
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push(detail===undefined?name:{name,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail).slice(0,600):''));return ok;};
const root=path.resolve('dist'),types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const shot=async(page,name,opts={})=>{if(!SHOTS)return;const f=path.join(out,name+'.jpg');await page.screenshot({path:f,type:'jpeg',quality:88,...opts});report.shots=(report.shots||[]).concat(path.relative(process.cwd(),f));};
async function withPage(fn,{scale=1,viewport={width:1280,height:720},offline=false}={}){
 const browser=await pw.chromium.launch({headless:true,args:ARGS});const ctx=await browser.newContext({viewport,deviceScaleFactor:scale,offline});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',q=>requests.push(q.url()));
 try{return await fn(page,{errors,requests});}finally{await browser.close();}}
const KEYS=['jamie','sam','alex','player'];

// ---------------------------------------------------------------------------------------------------------------- A
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{
 const R=report.parts.lab={};
 await page.goto(base+'/bike-lab.html?qa',{timeout:180000});await page.waitForFunction(()=>window.__bikelab,null,{timeout:180000});
 const t0=Date.now();const ready=await page.evaluate(async()=>{try{await __bikelab.ready;return {ok:true};}catch(e){return {ok:false,e:String(e)};}});R.readyWallMs=Date.now()-t0;
 if(!check('Lab: the four authored bikes load through GLTFLoader r160',ready.ok,ready.e))return;
 R.assets=await page.evaluate(()=>Object.fromEntries(Object.entries(__bikelab.handles).map(([k,h])=>[k,{...h.info,anchors:h.report,lods:h.stats()}])));
 check('Lab: loaded over same-origin HTTP from dist/assets/bike, nothing else fetched',Object.values(R.assets).every(a=>a.from==='http')&&requests.every(u=>u.startsWith(base)||/^(blob|data):/.test(u)));
 check('Lab: generator is Blender\'s glTF exporter',Object.values(R.assets).every(a=>/Blender I\/O/.test(a.generator)),Object.values(R.assets).map(a=>a.generator));
 check('Lab: every bike is on its rig.js anchors (BB, saddle, grips, steering pivot and rake, rear axle, wheel radius, crank, pedal offset within 2 mm)',
  Object.values(R.assets).every(a=>Object.entries(a.anchors).every(([k,v])=>k==='frontAxleMovedBy'||v<.002)),Object.fromEntries(Object.entries(R.assets).map(([k,a])=>[k,a.anchors])));
 check('Lab: three PBR materials and nine textures per bike (≤ 4 materials)',Object.values(R.assets).every(a=>a.materials===3&&a.textures===9),Object.values(R.assets).map(a=>[a.materials,a.textures]));
 R.materials=await page.evaluate(()=>{const out={};for(const [k,h] of Object.entries(__bikelab.handles)){for(const m of h.materials){const t=x=>m[x]?{w:m[x].image?.width,cs:m[x].colorSpace}:null;out[k+':'+m.name]={type:m.type,map:t('map'),normalMap:t('normalMap'),orm:t('roughnessMap'),sameORM:m.roughnessMap===m.metalnessMap&&m.aoMap===m.roughnessMap,env:!!m.envMap,side:m.side,fog:m.fog};}}return out;});
 check('Lab: base colour sRGB, normal and ORM linear, 1024², one ORM image for occlusion/roughness/metal, single-sided, fog on',
  Object.values(R.materials).every(m=>m.type==='MeshStandardMaterial'&&m.map?.w===1024&&m.map.cs==='srgb'&&m.normalMap?.w===1024&&m.normalMap.cs!=='srgb'&&m.orm?.w===1024&&m.sameORM&&m.side===0&&m.fog),R.materials);
 // --- moving parts about their real pivots
 R.motion=await page.evaluate(()=>{const L=__bikelab,T=L.THREE,res={};L.arrange('riders');L.setAnim(false);
  for(const [k,R] of Object.entries(L.riders)){const b=R.bike,G=b.geom;const local=v=>b.group.worldToLocal(v.clone());
   const box=o=>{const bb=new T.Box3();o.updateWorldMatrix(true,true);o.traverse(x=>{if(x.isMesh&&x.visible){x.geometry.computeBoundingBox();bb.union(x.geometry.boundingBox.clone().applyMatrix4(x.matrixWorld));}});return bb;};
   const authoredOf=g=>g.children.filter(c=>c.userData.authored&&c.visible);
   const r={};b.wheel=0;b.crankAngle=0;b.steerAngle=0;b.kickstand=0;// pose
   // wheels: the authored front/rear wheel centre stays on its axle while it turns
   const fc=[],rc=[];for(const w of [0,1.3,2.9]){b.wheel=w;__poseBike(b);fc.push(local(box(b.frontWheel).getCenter(new T.Vector3())));rc.push(local(box(b.rearWheel).getCenter(new T.Vector3())));}
   r.frontWheelCentreDrift=Math.max(...fc.map(c=>c.distanceTo(fc[0])));r.rearWheelCentreDrift=Math.max(...rc.map(c=>c.distanceTo(rc[0])));
   const A=b.authored.anchors;r.frontWheelCentreToAuthoredAxle=fc[0].distanceTo(new T.Vector3(...A.axleFront));r.rearWheelCentreToAxle=rc[0].distanceTo(new T.Vector3(0,G.wheelR,G.rear));
   // a spoke vertex really turns: compare the authored front wheel's world matrix before/after
   b.wheel=0;__poseBike(b);const m0=authoredOf(b.frontWheel)[0].matrixWorld.clone();b.wheel=1;__poseBike(b);b.group.updateMatrixWorld(true);r.wheelTurns=!authoredOf(b.frontWheel)[0].matrixWorld.equals(m0);
   // pedals: the authored pedal bodies sit on rig.js's pedal points at any crank angle
   let pd=0;for(const c of [0,1.1,2.6,4.4]){b.crankAngle=c;__poseBike(b);for(const [i,s] of [[0,-1],[1,1]]){const p=local(box(b.pedals[i]).getCenter(new T.Vector3())),q=__pedalPos(c,s,new T.Vector3(),G);pd=Math.max(pd,Math.hypot(p.y-q.y,p.z-q.z));}}r.pedalCentreToRigPedal=pd;
   // steering: the authored bar under the right hand follows gripPos (nearest authored vertex to the grip point)
   const near=(g,pt)=>{let best=1e9;g.updateWorldMatrix(true,true);g.traverse(x=>{if(!x.isMesh||!x.visible)return;for(let p=x;p;p=p.parent)if(p.userData?.authored){const P=x.geometry.attributes.position,v=new T.Vector3();for(let i=0;i<P.count;i+=2){v.fromBufferAttribute(P,i).applyMatrix4(x.matrixWorld);const d=local(v).distanceTo(pt);if(d<best)best=d;}return;}});return best;};
   const gs=[];for(const s of [0,.3,-.35]){b.steerAngle=s;__poseBike(b);gs.push(near(b.steer,__gripPos(s,1,new T.Vector3(),G)));}r.gripSurfaceToRigGrip=gs.map(x=>+x.toFixed(4));
   // the stand: stowed vs deployed foot height
   b.steerAngle=0;b.kickstand=1;__poseBike(b);r.standFootLowest=+box(b.kickPivot).min.y.toFixed(4);r.standFootLowestLocal=+local(box(b.kickPivot).min).y.toFixed(4);b.kickstand=0;__poseBike(b);
   // bell lever (bikes with a bell): it moves when the game rotates bell.lever
   if(b.bell?.lever&&authoredOf(b.bell.lever).length){const l=authoredOf(b.bell.lever)[0];const a=box(l).getCenter(new T.Vector3());b.bell.lever.rotation.x=-.4;b.group.updateMatrixWorld(true);r.bellLeverMoves=+box(l).getCenter(new T.Vector3()).distanceTo(a).toFixed(4);b.bell.lever.rotation.x=0;
    r.bellDomeToRigBell=+near(b.steer,new T.Vector3().copy(b.bell.position).applyQuaternion(G.rakeQ).add(G.pivotV)).toFixed(4);}
   res[k]=r;}
  L.setAnim(true);return res;});
 const M=R.motion;
 check('Lab: wheels turn about their axles (authored wheel centres drift < 2 mm while turning; front on the authored axle, rear on rig.js\'s)',KEYS.every(k=>M[k].wheelTurns&&M[k].frontWheelCentreDrift<.002&&M[k].rearWheelCentreDrift<.002&&M[k].frontWheelCentreToAuthoredAxle<.006&&M[k].rearWheelCentreToAxle<.006),M);
 check('Lab: the authored pedals ride on rig.js\'s pedal points at every crank angle (< 8 mm)',KEYS.every(k=>M[k].pedalCentreToRigPedal<.008),KEYS.map(k=>M[k].pedalCentreToRigPedal));
 check('Lab: steering turns the authored bars about the raked axis: the grip surface stays at rig.js\'s grip point (< 2 cm, the grip\'s own radius)',KEYS.every(k=>M[k].gripSurfaceToRigGrip.every(d=>d<.02)),KEYS.map(k=>M[k].gripSurfaceToRigGrip));
 check('Lab: the deployed stand reaches the ground (foot within 1.5 cm of y=0 in bike space)',KEYS.every(k=>Math.abs(M[k].standFootLowestLocal)<.015),KEYS.map(k=>M[k].standFootLowestLocal));
 check('Lab: the bell lever moves with the game\'s bell animation, and the dome sits at rig.js\'s bell point (< 3 cm)',['alex','player'].every(k=>M[k].bellLeverMoves>.002&&M[k].bellDomeToRigBell<.03),['alex','player'].map(k=>[M[k].bellLeverMoves,M[k].bellDomeToRigBell]));
 // --- contacts of the game's procedural riders on the authored bikes, over 3 s of riding (measured, reported)
 R.contacts=await page.evaluate(()=>{const L=__bikelab;L.view('riders');const worst={};for(let i=0;i<60;i++){L.step(1/20);for(const k of ['jamie','sam','alex','player']){const c=L.contacts(k);for(const [n,v] of Object.entries(c)){if(v===null)continue;const key=k+'.'+n;worst[key]=worst[key]||{min:1e9,max:-1e9};worst[key].min=Math.min(worst[key].min,v);worst[key].max=Math.max(worst[key].max,v);}}}return worst;});
 // --- LODs and memory
 R.lod=await page.evaluate(()=>{const L=__bikelab,out={};L.view('lineup');for(const n of [0,1,2]){for(const h of Object.values(L.handles))h.setLOD(n);const r=L.render();out['lod'+n]={calls:r.calls,triangles:r.triangles};}for(const h of Object.values(L.handles))h.setLOD(null);
  out.memory={...L.renderer.info.memory};out.heapMB=performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null;return out;});
 check('Lab: LOD1 and LOD2 cut the lineup\'s triangles (LOD0 > LOD1 > LOD2)',R.lod.lod0.triangles>R.lod.lod1.triangles&&R.lod.lod1.triangles>R.lod.lod2.triangles,R.lod);
 R.firstFrameMs=await page.evaluate(()=>{const t=performance.now();__bikelab.render();return +(performance.now()-t).toFixed(1);});
 check('Lab: no page errors',errors.length===0,errors);
 if(SHOTS){for(const v of ['lineup','lineup-side','lineup-rear','compare','compare-jamie','compare-sam','compare-alex','compare-player','riders','fp']){await page.evaluate(v=>{__bikelab.view(v);__bikelab.step(1/30);__bikelab.render();},v);await shot(page,'lab-'+v);}
  for(const n of [0,1,2]){await page.evaluate(n=>{const L=__bikelab;L.view('lineup');for(const h of Object.values(L.handles))h.setLOD(n);L.render();},n);await shot(page,'lab-lineup-forced-lod'+n);}
  await page.evaluate(()=>{for(const h of Object.values(__bikelab.handles))h.setLOD(null);});}
},{scale:1,viewport:{width:1600,height:900}});

// ---------------------------------------------------------------------------------------------------------------- B
const prologue=async(page,{bikes})=>{await page.goto(base+'/index.html?qa'+(bikes?'&bikes':''),{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.evaluate(()=>{const e=document.getElementById('set-quality');if(e){e.value='medium';e.dispatchEvent(new Event('change'));}});};
if(PARTS.includes('B')){
 await withPage(async(page,{errors,requests})=>{await prologue(page,{bikes:false});await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<30;i++)L.step(1/30);L.render();});
  const bikeReq=requests.filter(u=>/bike-assets|bike-benchmark|bike-lab|assets\/bike\//.test(u));
  check('Game: without ?bikes the Prologue fetches none of the bike modules or models',bikeReq.length===0,bikeReq);
  report.parts.gameWithout={errors};});
 await withPage(async(page,{errors,requests})=>{
  const R=report.parts.game={};await prologue(page,{bikes:true});
  await page.waitForFunction(()=>window.__bikes,null,{timeout:180000});
  R.loaded=await page.evaluate(()=>({errors:__bikes.errors,loadMs:__bikes.loadMs,keys:Object.keys(__bikes.handles),info:__bikes.info()}));
  check('Game: ?bikes upgrades the protagonist\'s, Jamie\'s, Sam\'s and Alex\'s bikes in place (no failures)',R.loaded.errors.length===0&&['player','jamie','sam','alex'].every(k=>R.loaded.keys.includes(k)),R.loaded);
  // ride: start, pedal 6 s; the friends ride with their own bikes under them
  R.ride=await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);const d0=L.state.distance;L.press('KeyW');for(let i=0;i<180;i++){L.step(1/30);}L.release('KeyW');__bikes.tick();
   const friends=L.friends?.list?.map(f=>({key:f.key,mode:f.mode,visible:f.bike.group.visible,authored:!!f.bike.authored,lod:f.bike.authored?.level,dist:+f.bike.group.position.distanceTo(L.camera.position).toFixed(1),riderOn:f.person.group.parent===f.bike.group}));
   const i=L.render();return {state:L.state.state,moved:+(L.state.distance-d0).toFixed(2),friends,calls:i.calls,triangles:i.triangles,player:{authored:!!L.playerBike.authored,lod:L.playerBike.authored?.level}};});
  check('Game: the Prologue plays on with the authored bikes (6 s of pedalling moves the player; the friends ride on them)',R.ride.state==='riding'&&R.ride.moved>8&&R.ride.player.authored&&R.ride.friends.every(f=>f.authored),R.ride);
  // bell: Space rings it; the hand reaches and the authored lever follows the game's lever
  R.bell=await page.evaluate(()=>{const L=lastLight,lev=L.playerBike.bell.lever,a=lev.children.find(c=>c.userData.authored);L.key('Space');let maxRot=0;for(let i=0;i<10;i++){L.step(1/60);maxRot=Math.min(maxRot,lev.rotation.x);}return {maxLeverRotation:+maxRot.toFixed(3),authoredLeverAttached:!!a&&a.parent===lev};});
  check('Game: Space rings the bell: the authored lever is on the game\'s lever and swings with it',R.bell.authoredLeverAttached&&R.bell.maxLeverRotation<-.05,R.bell);
  // first person: the real game camera, looking ahead (bars, bell, front wheel, the friends ahead)
  if(SHOTS){await page.evaluate(()=>{const L=lastLight;L.look(0,-.18);L.step(1/30);__bikes.tick();L.render();});await shot(page,'game-prologue-first-person-authored');
   await page.evaluate(async()=>{await __bikes.toggle(false);const L=lastLight;L.render();});await shot(page,'game-prologue-first-person-procedural-same-frame');
   await page.evaluate(async()=>{await __bikes.toggle(true);const L=lastLight;L.look(0,-.62);L.step(1/30);__bikes.tick();L.render();});await shot(page,'game-prologue-first-person-looking-down-authored');
   await page.evaluate(async()=>{await __bikes.toggle(false);lastLight.render();});await shot(page,'game-prologue-first-person-looking-down-procedural-same-frame');
   await page.evaluate(async()=>{await __bikes.toggle(true);lastLight.look(0,0);lastLight.render();});}
  // review cameras beside each friend (labelled review camera): the riders on their bikes in the Prologue's light
  R.review={};
  for(const k of ['jamie','sam','alex']){
   const r=await page.evaluate(k=>{const L=lastLight,T=L.camera.position.constructor,f=L.friends.list.find(x=>x.key===k);if(!f)return null;const g=f.bike.group;g.updateMatrixWorld(true);
    const cam=L.camera,save={p:cam.position.clone(),q:cam.quaternion.clone()};const side=new T(1,0,0).applyQuaternion(g.getWorldQuaternion(new cam.quaternion.constructor())),fwd=new T(0,0,-1).applyQuaternion(g.getWorldQuaternion(new cam.quaternion.constructor()));
    cam.position.copy(g.position).addScaledVector(side,-2.6).addScaledVector(fwd,1.5);cam.position.y+=1.15;cam.lookAt(g.position.x,g.position.y+.75,g.position.z);cam.updateMatrixWorld(true);__bikes.tick();const i=L.render();
    window.__restoreCam=()=>{cam.position.copy(save.p);cam.quaternion.copy(save.q);};return {lod:f.bike.authored?.level,calls:i.calls};},k);
   R.review[k]=r;if(SHOTS&&r){await shot(page,`game-prologue-review-${k}-authored`);await page.evaluate(async()=>{await __bikes.toggle(false);lastLight.render();});await shot(page,`game-prologue-review-${k}-procedural-same-frame`);await page.evaluate(async()=>{await __bikes.toggle(true);});}
   await page.evaluate(()=>window.__restoreCam?.());}
  // the group from behind and above (review camera), all LODs in play
  R.group=await page.evaluate(()=>{const L=lastLight,cam=L.camera,save={p:cam.position.clone(),q:cam.quaternion.clone()},fs=L.friends.list.map(f=>f.bike.group.position);const c=fs.reduce((a,p)=>a.add(p),new cam.position.constructor()).multiplyScalar(1/fs.length);
   cam.position.lerpVectors(save.p,c,-.15);cam.position.y+=2.2;cam.lookAt(c.x,c.y+.6,c.z);cam.updateMatrixWorld(true);__bikes.tick();const i=L.render();window.__restoreCam=()=>{cam.position.copy(save.p);cam.quaternion.copy(save.q);};
   return {lods:Object.fromEntries(Object.entries(__bikes.handles).map(([k,h])=>[k,h.level])),calls:i.calls,triangles:i.triangles};});
  if(SHOTS)await shot(page,'game-prologue-group-review-camera-authored');
  await page.evaluate(()=>window.__restoreCam?.());
  // cost: same frame, procedural vs authored
  R.cost=await page.evaluate(async()=>{const L=lastLight;__bikes.tick();const a=L.render(),ma={...L.renderer.info.memory};await __bikes.toggle(false);const p=L.render(),mp={...L.renderer.info.memory};await __bikes.toggle(true);return {authored:{calls:a.calls,triangles:a.triangles,memory:ma},procedural:{calls:p.calls,triangles:p.triangles,memory:mp}};});
  R.after=await page.evaluate(()=>{const L=lastLight,d0=L.state.distance;L.press('KeyW');for(let i=0;i<90;i++)L.step(1/30);L.release('KeyW');return {state:L.state.state,moved:+(L.state.distance-d0).toFixed(2)};});
  check('Game: after B (procedural) and back (authored), the ride continues',R.after.state==='riding'&&R.after.moved>2,R.after);
  check('Game: no page errors',errors.length===0,errors);
  check('Game: no request leaves the local server',requests.every(u=>u.startsWith(base)||/^(blob|data):/.test(u)),requests.filter(u=>!u.startsWith(base)&&!/^(blob|data):/.test(u)));
 },{scale:1,viewport:{width:1600,height:900}});
}

// ---------------------------------------------------------------------------------------------------------------- C
if(PARTS.includes('C')){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ll-bikes-')),withModels=path.join(tmp,'models'),plain=path.join(tmp,'default');
 const pack=(dir,env)=>JSON.parse(execFileSync('node',['tools/package-playtest.mjs',dir],{env:{...process.env,PLAYTEST_MENU:'1',...env},encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').pop());
 const P=report.parts.package={withModels:pack(withModels,{PLAYTEST_MODELS:'1'}),default:pack(plain,{})};
 P.sizes={withModels:fs.statSync(path.join(withModels,'Last-Light-Playtest.html')).size,bikeLab:fs.existsSync(path.join(withModels,'Last-Light-Bike-Lab.html'))?fs.statSync(path.join(withModels,'Last-Light-Bike-Lab.html')).size:0,default:fs.statSync(path.join(plain,'Last-Light-Playtest.html')).size};
 const man=JSON.parse(fs.readFileSync(path.join(withModels,'manifest.json'),'utf8'));P.models=man.pipelineLab?.models;
 check('Package: PLAYTEST_MODELS=1 embeds the four bikes, hashes them in the manifest and writes the offline Bike Lab page',KEYS.every(k=>P.models?.includes(`assets/bike/bike.${k}.glb`)&&man.sourceHashes[`dist/assets/bike/bike.${k}.glb`])&&!!man.pipelineLab?.bikeLab,{models:P.models,bikeLab:man.pipelineLab?.bikeLab});
 const offlineReq=r=>r.filter(u=>!/^(file|blob|data):/.test(u));
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(withModels,'Last-Light-Bike-Lab.html')).href+'?qa',{timeout:240000});await page.waitForFunction(()=>window.__bikelab,null,{timeout:240000});
  const r=await page.evaluate(async()=>{try{await __bikelab.ready;}catch(e){return {ok:false,e:String(e)};}__bikelab.step(1/30);__bikelab.render();return {ok:true,from:Object.values(__bikelab.handles).map(h=>h.info.from)};});
  P.lab=r;check('Package: the offline Bike Lab loads the four embedded bikes (browser offline)',r.ok&&r.from.length===4&&r.from.every(f=>f==='package'),r);
  if(SHOTS)await shot(page,'package-offline-bike-lab');
  check('Package: offline Bike Lab makes no network request',offlineReq(requests).length===0,offlineReq(requests));
  check('Package: offline Bike Lab without page errors',errors.length===0,errors);
 },{offline:true});
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(withModels,'Last-Light-Playtest.html')).href+'?qa&bikes',{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});
  await page.waitForFunction(()=>window.__bikes||/FAILED/.test(document.getElementById('bike-benchmark-label')?.textContent||''),null,{timeout:240000});
  const r=await page.evaluate(()=>{const L=lastLight;L.start();L.press('KeyW');for(let i=0;i<60;i++)L.step(1/30);L.release('KeyW');__bikes.tick();L.render();return {errors:__bikes.errors,from:Object.values(__bikes.handles).map(h=>h.info.from),state:L.state.state,label:document.getElementById('bike-benchmark-label')?.textContent};});
  P.game=r;check('Package: ?bikes in the offline game upgrades the four bikes from the embedded bytes, in the running Prologue',r.errors.length===0&&r.from.length===4&&r.from.every(f=>f==='package')&&r.state==='riding',r);
  if(SHOTS)await shot(page,'package-offline-game-prologue-bikes');
  check('Package: offline game makes no network request',offlineReq(requests).length===0,offlineReq(requests));
  check('Package: offline game without page errors',errors.length===0,errors);
 },{offline:true});
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(plain,'Last-Light-Playtest.html')).href+'?qa&bikes',{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});
  await page.waitForFunction(()=>/FAILED|\(DEV\)/.test(document.getElementById('bike-benchmark-label')?.textContent||''),null,{timeout:120000});
  const label=await page.evaluate(()=>document.getElementById('bike-benchmark-label').textContent),proc=await page.evaluate(()=>!lastLight.playerBike.authored);P.defaultPackageLabel=label;
  check('Package: the default package (no models) says the bikes FAILED, keeps the procedural bikes and substitutes nothing',/FAILED/.test(label)&&/not embedded/.test(label)&&proc,label);
  check('Package: default package makes no network request either',offlineReq(requests).length===0,offlineReq(requests));
  if(SHOTS)await shot(page,'package-default-bikes-fail-loudly');
 },{offline:true});
 fs.rmSync(tmp,{recursive:true,force:true});
}

server.close();report.finished=new Date().toISOString();report.passed=report.checks.length;report.failed=report.failures.length;
fs.writeFileSync(path.join(out,'bike-browser-report.json'),JSON.stringify(report,null,1)+'\n');
console.log(`\n${report.passed} passed, ${report.failed} failed — ${path.relative(process.cwd(),path.join(out,'bike-browser-report.json'))}`);
process.exit(report.failed?1:0);
