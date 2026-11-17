// Phase 0A: the Blender -> glTF -> three.js pipeline, checked in the real browser engine (Chromium, ANGLE SwiftShader:
// software rendering, NOT a GPU). One browser at a time.
//   A. the isolated Pipeline Lab (served dist/): load, clips, facial clip and shape keys, materials and textures, the
//      rig.js pose contract on a procedural bike, sockets, shared memory across copies, load time;
//   B. the running game (served dist/index.html?qa): nothing is fetched without ?pipeline; the probe in the Prologue's own
//      scene, light and fog beside the procedural world; the game keeps running;
//   C. the offline package (file://, browser context offline): PLAYTEST_MODELS=1 package (lab page and game ?pipeline load
//      from the embedded bytes, zero network requests) and the default package (?pipeline fails loudly, nothing substituted).
// usage: node tests/pipeline-browser.mjs [outDir=docs/qa/pipeline-phase0a]   (PARTS=A,B,C to choose; SHOTS=0 to skip images)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import os from 'node:os';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/pipeline-phase0a');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',started:new Date().toISOString(),checks:[],failures:[],parts:{}};
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push(detail===undefined?name:{name,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail):''));return ok;};
const root=path.resolve('dist'),types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const shot=async(page,name,opts={})=>{if(!SHOTS)return;const f=path.join(out,name+'.jpg');await page.screenshot({path:f,type:'jpeg',quality:86,...opts});report.shots=(report.shots||[]).concat(path.relative(process.cwd(),f));};
async function withPage(fn,{scale=2,viewport={width:1280,height:720},offline=false}={}){
 const browser=await pw.chromium.launch({headless:true,args:ARGS});const ctx=await browser.newContext({viewport,deviceScaleFactor:scale,offline});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',q=>requests.push(q.url()));
 try{return await fn(page,{errors,requests});}finally{await browser.close();}}

// ---------------------------------------------------------------------------------------------------------------- A
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{
 const R=report.parts.lab={};
 await page.goto(base+'/pipeline-lab.html?qa',{timeout:120000});await page.waitForFunction(()=>window.__lab,null,{timeout:120000});
 const t0=Date.now();const ready=await page.evaluate(async()=>{try{await __lab.ready;return {ok:true};}catch(e){return {ok:false,e:String(e)};}});R.readyWallMs=Date.now()-t0;
 if(!check('Lab: the Blender export loads through GLTFLoader r160',ready.ok,ready.e))return;
 R.asset=await page.evaluate(()=>__lab.lab.asset.info);
 check('Lab: loaded over same-origin HTTP from dist/assets/tst',R.asset.from==='http'&&requests.every(u=>u.startsWith(base)||u.startsWith('blob:')||u.startsWith('data:')));
 check('Lab: generator is Blender\'s glTF exporter',/Blender I\/O/.test(R.asset.generator),R.asset.generator);
 check('Lab: four clips (idle_breathe, talk, walk_normal, wave_r)',['idle_breathe','talk','walk_normal','wave_r'].every(n=>R.asset.clips.some(c=>c.name===n)),R.asset.clips);
 check('Lab: six shape keys as morph targets',R.asset.morphTargets.length===6,R.asset.morphTargets);
 // first frame (shader compile) time
 R.firstRenderMs=await page.evaluate(()=>{const t=performance.now();__lab.step(1/30);__lab.render();return +(performance.now()-t).toFixed(1);});
 // --- skeletal animation: bones and skinned vertices move over time
 R.animation=await page.evaluate(()=>{const L=__lab.lab,V=__lab.THREE.Vector3,w=n=>L.walker.bones[n].getWorldPosition(new V()),q=n=>L.walker.bones[n].quaternion.clone();
  const s=[];for(let i=0;i<4;i++){const f=w('foot_l'),h=w('hand_r'),t=q('thigh_l');s.push({foot:[f.x,f.y,f.z].map(v=>+v.toFixed(3)),hand:[h.x,h.y,h.z].map(v=>+v.toFixed(3)),thighQ:[t.x,t.y,t.z,t.w].map(v=>+v.toFixed(3))});for(let k=0;k<8;k++)__lab.step(1/30);}
  // a skinned vertex really follows the skeleton (CPU replica of the GPU skinning)
  const body=L.walker.model.getObjectByProperty('isSkinnedMesh',true),v0=new V(),v1=new V();__lab.render();body.getVertexPosition(200,v0);for(let k=0;k<7;k++)__lab.step(1/30);__lab.render();body.getVertexPosition(200,v1);// (bone matrices update at render)
  return {samples:s,skinnedVertexMoved:+v0.distanceTo(v1).toFixed(4),mixerTime:+L.walker.mixer.time.toFixed(3)};});
 const fz=R.animation.samples.map(s=>s.foot[2]);
 check('Lab: walk_normal moves the skeleton (left foot travels ≥ 10 cm fore/aft)',Math.max(...fz)-Math.min(...fz)>=.10,fz);
 check('Lab: skinned vertices follow the bones (GPU skinning path, checked on the CPU)',R.animation.skinnedVertexMoved>.005,R.animation.skinnedVertexMoved);
 // --- the facial clip drives morph weights; the faces.js expression table drives the shape keys
 R.face=await page.evaluate(()=>{const L=__lab.lab,vals=[];for(let i=0;i<40;i++){__lab.step(1/20);vals.push(+L.talker.morph('jawOpen').toFixed(3));}
  L.waver.setExpression({});const neutral=Object.fromEntries(L.waver.faceMeshes[0].morphTargetInfluences.map((v,i)=>[Object.keys(L.waver.faceMeshes[0].morphTargetDictionary)[i],+v.toFixed(3)]));
  L.waver.setExpression({smile:.8,teeth:.5,browY:.0015});const happy={smile:+L.waver.morph('mouthSmileLeft').toFixed(3),brow:+L.waver.morph('browInnerUp').toFixed(3)};
  L.waver.setExpression({browY:.008,open:.65,wide:.78,tilt:.3});const shocked={jaw:+L.waver.morph('jawOpen').toFixed(3),brow:+L.waver.morph('browInnerUp').toFixed(3)};
  let threw=false;try{L.waver.setMorph('notAShapeKey',1);}catch{threw=true;}
  return {talkJawOpen:{min:Math.min(...vals),max:Math.max(...vals)},neutral,happy,shocked,unknownKeyThrows:threw};});
 check('Lab: the talk clip animates jawOpen (Blender shape-key Action merged into the clip)',R.face.talkJawOpen.max>.5&&R.face.talkJawOpen.min<.1,R.face.talkJawOpen);
 check('Lab: faces.js expressions drive the shape keys (happy → smile, shocked → jaw + brows)',R.face.happy.smile>.7&&R.face.shocked.jaw>.6&&R.face.shocked.brow>.5,{happy:R.face.happy,shocked:R.face.shocked});
 check('Lab: a misnamed shape key throws instead of failing silently',R.face.unknownKeyThrows);
 // --- materials and textures as authored
 R.materials=await page.evaluate(()=>{const L=__lab.lab,seen=new Map();L.walker.model.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material))if(!seen.has(m.name)){const t=k=>m[k]?{w:m[k].image?.width||0,h:m[k].image?.height||0,cs:m[k].colorSpace,flipY:m[k].flipY}:null;
  seen.set(m.name,{type:m.type,color:'#'+m.color.getHexString(),roughness:m.roughness,metalness:m.metalness,map:t('map'),normalMap:t('normalMap'),normalScale:m.normalMap?[m.normalScale.x,m.normalScale.y]:null,roughnessMap:t('roughnessMap'),metalnessMap:t('metalnessMap'),sameORM:!!m.roughnessMap&&m.roughnessMap===m.metalnessMap,fog:m.fog,skinning:!!o.isSkinnedMesh});}});return Object.fromEntries(seen);});
 const M=R.materials,skin=M['mat.skin/tst.pipeline-probe'],shirt=M['mat.fabric.cotton/tst.pipeline-probe.shirt'],metal=M['mat.metal.steel/tst.pipeline-probe.watch'];
 check('Lab: nine PBR materials (MeshStandardMaterial)',Object.keys(M).length===9&&Object.values(M).every(m=>m.type==='MeshStandardMaterial'),Object.keys(M));
 check('Lab: skin and shirt carry base colour (sRGB), normal map and roughness/metal map (linear), decoded 512×512',[skin,shirt].every(m=>m.map?.w===512&&m.map.cs==='srgb'&&m.normalMap?.w===512&&m.normalMap.cs!=='srgb'&&m.roughnessMap?.w===512&&m.sameORM&&m.map.flipY===false));
 check('Lab: the normal-map strength set in Blender arrives (skin 0.35)',Math.abs(skin.normalScale[0]-.35)<1e-3,skin.normalScale);
 check('Lab: the watch is metallic (metalness 1, roughness 0.28)',metal.metalness===1&&Math.abs(metal.roughness-.28)<1e-3,metal);
 // --- rig.js pose contract on the procedural bike, over 3 s of pedalling and steering
 R.contacts=await page.evaluate(()=>{const L=__lab.lab,worst={};for(let i=0;i<90;i++){__lab.step(1/30);for(const [k,v] of Object.entries(L.contacts))worst[k]=Math.max(worst[k]||0,v);}return worst;});
 check('Lab: rig.js pose contract drives the skinned skeleton exactly (shoulders, elbows, wrists, knees, ankles within 2 mm of rig.js IK)',['wrist_l','wrist_r','elbow_l','elbow_r','knee_l','knee_r','ankle_l','ankle_r','shoulder_l','shoulder_r'].every(k=>R.contacts[k]<.002),R.contacts);
 R.gripSocketToBar={l:R.contacts.grip_l,r:R.contacts.grip_r};R.ballToPedal={l:R.contacts.ballToPedal_l,r:R.contacts.ballToPedal_r};
 check('Lab: socket_grip within 5 cm of the procedural bike\'s grips while riding (measured; see report)',R.contacts.grip_l<.05&&R.contacts.grip_r<.05,R.gripSocketToBar);
 // --- sockets carry attachments with the bones
 R.sockets=await page.evaluate(()=>{const L=__lab.lab,V=__lab.THREE.Vector3,cap=L.group.getObjectByName('pipeline-lab:cap-on-socket'),torch=L.group.getObjectByName('pipeline-lab:torch-on-socket');
  // the cap rides the talker's head (idle_breathe turns it): it moves, and keeps its distance to the head bone
  const a=cap.getWorldPosition(new V()),h=L.talker.bones.head.getWorldPosition(new V()),d0=a.distanceTo(h);let moved=0,drift=0;for(let i=0;i<60;i++){__lab.step(1/30);const b=cap.getWorldPosition(new V()),h2=L.talker.bones.head.getWorldPosition(new V());moved=Math.max(moved,a.distanceTo(b));drift=Math.max(drift,Math.abs(b.distanceTo(h2)-d0));}
  return {sockets:Object.keys(L.waver.sockets),capParent:cap.parent.name,torchParent:torch.parent.name,capMoved:+moved.toFixed(4),capToHeadChange:+drift.toFixed(5)};});
 check('Lab: nine sockets; attachments ride on them (the cap moves with the turning head, rigidly)',R.sockets.sockets.length===9&&R.sockets.capParent==='socket_cap'&&R.sockets.torchParent==='socket_grip_l'&&R.sockets.capMoved>.002&&R.sockets.capToHeadChange<.0005,R.sockets);
 // --- reuse without duplicating GPU data: 8 more copies
 R.memory=await page.evaluate(async()=>{const L=__lab.lab,{instantiate}=await import('./asset-library.js');const ren=__lab.renderer;__lab.render();const before={...ren.info.memory},heap0=performance.memory?.usedJSHeapSize;
  const extra=[];for(let i=0;i<8;i++){const x=await instantiate('tst.pipeline-probe');x.root.position.set(-4+i,0,3);x.play('idle_breathe');L.group.add(x.root);extra.push(x);}
  __lab.render();const after={...ren.info.memory},heap1=performance.memory?.usedJSHeapSize;
  const geos=new Set(),tex=new Set(),mats=new Set();for(const x of [...L.all,...extra])x.model.traverse(o=>{if(!o.isMesh)return;geos.add(o.geometry);for(const m of [].concat(o.material)){if(!/^mat\./.test(m.name))continue;mats.add(m);for(const k of ['map','normalMap','roughnessMap'])if(m[k])tex.add(m[k]);}});// (the asset's own materials, not the lab's cap and torch)
  const sk=new Set();for(const x of [...L.all,...extra])x.model.traverse(o=>{if(o.isSkinnedMesh)sk.add(o.skeleton);});
  for(const x of extra)x.dispose();__lab.render();
  return {before,after,addedGeometries:after.geometries-before.geometries,addedTextures:after.textures-before.textures,copies:L.all.length+extra.length,uniqueGeometries:geos.size,uniqueMaterials:mats.size,uniqueImageTextures:tex.size,skeletons:sk.size,jsHeapMBPerCopy:heap0&&heap1?+((heap1-heap0)/8/1048576).toFixed(2):null};});
 check('Lab: 12 copies share one set of geometry, materials and textures (8 more copies add 0 geometries)',R.memory.addedGeometries===0&&R.memory.uniqueImageTextures===10&&R.memory.uniqueMaterials===9,R.memory);
 R.notes={ballToPedal:'ball_l/ball_r joint to pedal centre while riding, measured (not a pass/fail): rig.js puts the ankle 5 cm behind and 6.2 cm above the pedal, so the pedal sits under the mid-foot; an authored foot puts the ball ~11 cm ahead of the ankle'};
 check('Lab: one skeleton (one bone texture) per copy',R.memory.skeletons===R.memory.copies&&R.memory.addedTextures===8,{skeletons:R.memory.skeletons,addedTextures:R.memory.addedTextures});
 check('Lab: no page errors',errors.length===0,errors);
 // --- pictures
 if(SHOTS){await page.evaluate(()=>{const L=__lab.lab;L.waver.setExpression({});});
  for(const [v,name,prep] of [['lineup','lab-lineup'],['rider','lab-rider-procedural-bike'],['walker','lab-walk'],['back','lab-back']]){await page.evaluate(v=>{__lab.view(v);__lab.render();},v);await shot(page,name);}
  // face: neutral, then the faces.js 'surprised' and 'happy' expressions, then raw shape keys at full weight
  const faces=[['neutral',{}],['surprised',{browY:.007,open:.5,wide:.82,tilt:.1}],['happy',{smile:.8,teeth:.5,browY:.0015}]];
  for(const [n,e] of faces){await page.evaluate(e=>{const L=__lab.lab;__lab.view('face');L.waver.setExpression(e);L.waver.mixer.update(0);__lab.render();},e);await shot(page,'lab-face-'+n);}
  await page.evaluate(()=>{const L=__lab.lab;__lab.view('face');L.waver.setExpression({});for(const k of ['jawOpen','browInnerUp','eyeBlinkLeft'])L.waver.setMorph(k,1);__lab.render();});await shot(page,'lab-face-shapekeys-jawOpen-browInnerUp-eyeBlinkLeft');
  // walk cycle strip (8 frames, 1/8 s apart)
  const frames=[];await page.evaluate(()=>__lab.view('walker'));for(let i=0;i<8;i++){await page.evaluate(()=>{for(let k=0;k<4;k++)__lab.step(1/30);__lab.render();});const f=path.join(os.tmpdir(),`ll-walk-${i}.png`);await page.screenshot({path:f,clip:{x:200,y:60,width:560,height:640},scale:'css'});frames.push(f);}
  try{execFileSync('montage',[...frames,'-tile','8x1','-geometry','280x320+2+2','-background','#222',path.join(out,'lab-walk-cycle-strip.jpg')]);report.shots.push(path.relative(process.cwd(),path.join(out,'lab-walk-cycle-strip.jpg')));}catch(e){report.notes=(report.notes||[]).concat('montage unavailable: walk strip not made');}
 }
 R.hud=await page.evaluate(()=>{__lab.view('lineup');__lab.render();return document.getElementById('hud').textContent;});
});

// ---------------------------------------------------------------------------------------------------------------- B
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{
 const R=report.parts.game={};
 await page.goto(base+'/index.html?qa',{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.evaluate(()=>{const e=document.getElementById('set-quality');if(e){e.value='low';e.dispatchEvent(new Event('change'));}});
 await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<60;i++)L.step(1/30);L.render();});
 const pipelineReq=()=>requests.filter(u=>/asset-library|asset-pose|pipeline-lab|three-addons|assets\/tst\//.test(u));
 check('Game: without ?pipeline the Prologue fetches none of the new modules or models',pipelineReq().length===0,pipelineReq());
 R.before=await page.evaluate(()=>{const L=lastLight;const i=L.render();return {state:L.state.state,distance:L.state.distance,calls:i.calls,triangles:i.triangles,memory:{...L.renderer.info.memory}};});
 // put the lineup 6 m ahead of the player's camera, on the street, facing the camera
 R.placed=await page.evaluate(async()=>{const L=lastLight,T=L.camera.position.constructor,m=await import('./pipeline-lab.js');const cam=L.camera,f=new T();cam.getWorldDirection(f);f.y=0;f.normalize();
  const p=cam.getWorldPosition(new T()).addScaledVector(f,6.5);p.y=L.nav.groundY(p.x,p.z)??0;const lab=await m.buildLineup(L.scene,{origin:p,heading:Math.atan2(f.x,f.z),renderer:L.renderer});window.__probe=lab;
  for(let i=0;i<20;i++){lab.update(1/30);}const info=L.render();return {at:[p.x,p.y,p.z].map(v=>+v.toFixed(2)),calls:info.calls,triangles:info.triangles,memory:{...L.renderer.info.memory},from:lab.asset.info.from,inScene:!!L.scene.getObjectByName('pipeline-lab')};});
 check('Game: the probe lineup sits in the game\'s own scene beside the procedural street',R.placed.inScene&&R.placed.triangles>R.before.triangles,{added:{calls:R.placed.calls-R.before.calls,triangles:R.placed.triangles-R.before.triangles}});
 R.fog=await page.evaluate(()=>{const lab=window.__probe,fogs=new Set();lab.walker.model.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material))fogs.add(m.fog);});return {materialsFog:[...fogs],sceneFog:!!lastLight.scene.fog};});
 check('Game: the probe takes the scene fog and the game\'s lights (MeshStandardMaterial, fog on)',R.fog.materialsFog.every(Boolean)&&R.fog.sceneFog);
 if(SHOTS){await shot(page,'game-prologue-probe-beside-street');
  await page.evaluate(()=>{const L=lastLight,T=L.camera.position.constructor,lab=window.__probe;const g=lab.group.position,cam=L.camera,save=cam.position.clone(),q=cam.quaternion.clone();
   const side=new T(1,0,0).applyQuaternion(lab.group.quaternion);cam.position.set(g.x,g.y+1.4,g.z).addScaledVector(new T(0,0,-1).applyQuaternion(lab.group.quaternion),-3.4).addScaledVector(side,.2);cam.lookAt(g.x,g.y+.9,g.z);
   for(let i=0;i<6;i++)lab.update(1/30);L.render();window.__restoreCam=()=>{cam.position.copy(save);cam.quaternion.copy(q);};});
  await shot(page,'game-prologue-probe-closeup');await page.evaluate(()=>window.__restoreCam());}
 // the game still plays: pedal for 3 s with the probe in the scene
 R.after=await page.evaluate(()=>{const L=lastLight,d0=L.state.distance;L.press('KeyW');for(let i=0;i<90;i++){L.step(1/30);window.__probe.update(1/30);}L.release('KeyW');const i=L.render();return {state:L.state.state,distance:+L.state.distance.toFixed(2),moved:+(L.state.distance-d0).toFixed(2),calls:i.calls};});
 check('Game: the Prologue keeps playing with the probe present (riding, 3 s of pedalling moves the player)',R.after.state==='riding'&&R.after.moved>2,R.after);
 R.removed=await page.evaluate(()=>{window.__probe.dispose();const i=lastLight.render();return {inScene:!!lastLight.scene.getObjectByName('pipeline-lab'),calls:i.calls};});
 check('Game: the probe removes cleanly',!R.removed.inScene);
 check('Game: no page errors',errors.length===0,errors);
 check('Game: no request leaves the local server',requests.every(u=>u.startsWith(base)||u.startsWith('blob:')||u.startsWith('data:')),requests.filter(u=>!u.startsWith(base)&&!/^(blob|data):/.test(u)));
},{scale:1});

// ---------------------------------------------------------------------------------------------------------------- C
if(PARTS.includes('C')){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ll-pkg-')),withModels=path.join(tmp,'models'),plain=path.join(tmp,'default');
 const pack=(dir,env)=>JSON.parse(execFileSync('node',['tools/package-playtest.mjs',dir],{env:{...process.env,PLAYTEST_MENU:'1',...env},encoding:'utf8'}).trim().split('\n').pop());
 const P=report.parts.package={withModels:pack(withModels,{PLAYTEST_MODELS:'1'}),default:pack(plain,{})};
 P.sizes={withModels:fs.statSync(path.join(withModels,'Last-Light-Playtest.html')).size,lab:fs.statSync(path.join(withModels,'Last-Light-Pipeline-Lab.html')).size,default:fs.statSync(path.join(plain,'Last-Light-Playtest.html')).size};
 P.manifest=JSON.parse(fs.readFileSync(path.join(withModels,'manifest.json'),'utf8')).pipelineLab;
 check('Package: PLAYTEST_MODELS=1 embeds the probe and writes the offline lab page; manifest hashes it',P.manifest?.models?.includes('assets/tst/tst.pipeline-probe.glb'));
 const offlineReq=r=>r.filter(u=>!/^(file|blob|data):/.test(u));
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(withModels,'Last-Light-Pipeline-Lab.html')).href+'?qa',{timeout:180000});await page.waitForFunction(()=>window.__lab,null,{timeout:180000});
  const r=await page.evaluate(async()=>{try{await __lab.ready;}catch(e){return {ok:false,e:String(e)};}for(let i=0;i<20;i++)__lab.step(1/30);__lab.render();return {ok:true,from:__lab.lab.asset.info.from,clips:__lab.lab.asset.info.clips.length,contacts:__lab.lab.contacts};});
  P.lab=r;check('Package: the offline lab page loads the embedded model (from the package, browser offline)',r.ok&&r.from==='package'&&r.clips===4,r);
  if(SHOTS)await shot(page,'package-offline-lab');
  check('Package: offline lab makes no network request',offlineReq(requests).length===0,offlineReq(requests));
  check('Package: offline lab without page errors',errors.length===0,errors);
 },{offline:true,scale:1});
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(withModels,'Last-Light-Playtest.html')).href+'?qa&pipeline',{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
  await page.waitForFunction(()=>window.__pipelineProbe||/FAILED/.test(document.getElementById('pipeline-probe-label')?.textContent||''),null,{timeout:180000});
  const r=await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<30;i++)L.step(1/30);const lab=window.__pipelineProbe;L.camera.updateMatrixWorld();
   // move it in front of the riding camera, as P does
   const T=L.camera.position.constructor,f=new T();L.camera.getWorldDirection(f);f.y=0;f.normalize();const p=L.camera.getWorldPosition(new T()).addScaledVector(f,6.5);p.y=L.nav.groundY(p.x,p.z)??0;lab.group.position.copy(p);lab.group.rotation.y=Math.atan2(f.x,f.z);
   for(let i=0;i<10;i++)lab.update(1/30);L.render();return {from:lab?.asset.info.from,label:document.getElementById('pipeline-probe-label')?.textContent,state:L.state.state};});
  P.game=r;check('Package: ?pipeline in the offline game loads the embedded probe into the running Prologue',r.from==='package'&&!/FAILED/.test(r.label)&&r.state==='riding',r);
  if(SHOTS)await shot(page,'package-offline-game-prologue-probe');
  check('Package: offline game makes no network request',offlineReq(requests).length===0,offlineReq(requests));
  check('Package: offline game without page errors',errors.length===0,errors);
 },{offline:true,scale:1});
 await withPage(async(page,{errors,requests})=>{
  await page.goto(pathToFileURL(path.join(plain,'Last-Light-Playtest.html')).href+'?qa&pipeline',{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
  await page.waitForFunction(()=>/FAILED|PIPELINE PROBE \(DEV\) tst/.test(document.getElementById('pipeline-probe-label')?.textContent||''),null,{timeout:120000});
  const label=await page.evaluate(()=>document.getElementById('pipeline-probe-label').textContent);P.defaultPackageLabel=label;
  check('Package: the default package (no models embedded) says the probe FAILED and substitutes nothing',/FAILED/.test(label)&&/not embedded/.test(label),label);
  check('Package: default package makes no network request either',offlineReq(requests).length===0,offlineReq(requests));
  P.defaultErrors=errors;// (the failure is logged as a console error on purpose)
  if(SHOTS)await shot(page,'package-default-pipeline-fails-loudly');
 },{offline:true,scale:1});
 fs.rmSync(tmp,{recursive:true,force:true});
}

server.close();report.finished=new Date().toISOString();report.passed=report.checks.length;report.failed=report.failures.length;
fs.writeFileSync(path.join(out,'pipeline-browser-report.json'),JSON.stringify(report,null,1)+'\n');
console.log(`\n${report.passed} passed, ${report.failed} failed — ${path.relative(process.cwd(),path.join(out,'pipeline-browser-report.json'))}`);
process.exit(report.failed?1:0);
