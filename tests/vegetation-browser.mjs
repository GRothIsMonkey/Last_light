// Prologue vegetation benchmark: the authored vegetation checked in the real browser engine (Chromium, ANGLE SwiftShader:
// software rendering, NOT a GPU). One browser at a time.
//   A. the running game without ?vegetation: none of the vegetation modules or models is fetched; no vg: batches exist;
//   B. ?vegetation (served index.html?qa&vegetation): the oak, street trees, shrubs, lawn and meadow load and stand where
//      the plan put the procedural ones; the swing hangs from the oak's own limb at the game's pivot and the rope's path is
//      clear; the carving is the oak's own, at ending.js's height and bearing; the story marks around the trunk are clear;
//      no tree floats or reaches into a house; LODs; wind; K swaps authored/procedural in the same frame (before/after
//      pairs from the real riding camera); cost in the same frame; the whole Prologue played to Chapter One with it on;
//   C. ?bikes&houses&vegetation: the three benchmarks together;
//   D. the offline package (file://, browser offline): PLAYTEST_MODELS=1 (?vegetation from embedded bytes, no network)
//      and the default package (?vegetation fails loudly, nothing substituted).
// usage: node tests/vegetation-browser.mjs [outDir=docs/qa/vegetation/browser]   (PARTS=A,B,C,D; SHOTS=0 to skip images)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/vegetation/browser');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C,D').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const commit=(()=>{try{return execFileSync('git',['rev-parse','--short','HEAD']).toString().trim();}catch{return null;}})();
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',commit,started:new Date().toISOString(),viewport:'1600x900, deviceScaleFactor 1, Medium profile',checks:[],failures:[],parts:{},shots:[],pairs:[]};
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push(detail===undefined?name:{name,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail).slice(0,500):''));return ok;};
const root=path.resolve('dist'),types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const shot=async(page,name,meta)=>{if(!SHOTS)return null;const f=path.join(out,name+'.jpg');await page.screenshot({path:f,type:'jpeg',quality:90,timeout:240000});const rec={file:path.relative(process.cwd(),f),sha256:sha(f),...(meta||{})};report.shots.push(rec);return rec;};
async function withPage(fn,{viewport={width:1600,height:900},offline=false}={}){
 const browser=await pw.chromium.launch({headless:true,args:ARGS});const ctx=await browser.newContext({viewport,deviceScaleFactor:1,offline});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',q=>requests.push(q.url()));
 try{return await fn(page,{errors,requests});}finally{await browser.close();}}
const open=async(page,flags)=>{await page.goto(base+'/index.html?qa'+(flags?'&'+flags:''),{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});};
const waitVeg=page=>page.waitForFunction(()=>window.__vegetation||/FAILED/.test(document.getElementById('vegetation-benchmark-label')?.textContent||''),null,{timeout:300000});
const state=page=>page.evaluate(()=>lastLight.state);
// the riding camera at a street position (QA place), looking yaw/pitch; renderer stats of that frame
const ride=(page,s)=>page.evaluate(s=>{const L=lastLight;L.place(s.d,s.lat??-.3,s.v??0);for(let i=0;i<4;i++)L.step(1/30);L.look(s.yaw||0,s.pitch||0);L.step(1/30);
 window.__vegetation?.tick();window.__houses?.tick();window.__bikes?.tick();const i=L.render();const c=L.camera;
 return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4)),fov:c.fov,d:s.d,lat:s.lat??-.3,yaw:s.yaw||0,pitch:s.pitch||0},veg:window.__vegetation?.stats?.()};},s);
// the same frame again, without moving anything: render only
const again=page=>page.evaluate(()=>{window.__vegetation?.tick();const i=lastLight.render();const c=lastLight.camera;return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4))},veg:window.__vegetation?.stats?.()};});
// an honest before/after: one frame, one camera, the benchmark's K modes
const pair=async(page,name,frameFn,meta={})=>{const r={};await page.evaluate(()=>__vegetation.setMode('authored'));r.authored=await frameFn();const a=await shot(page,`${name}--authored`,{kind:'game',mode:'authored',...meta,...r.authored});
 await page.evaluate(()=>__vegetation.setMode('procedural'));r.procedural=await again(page);const b=await shot(page,`${name}--procedural`,{kind:'game',mode:'procedural',...meta,...r.procedural});
 await page.evaluate(()=>__vegetation.setMode('authored'));await again(page);
 const same=JSON.stringify(r.authored.cam.p)===JSON.stringify(r.procedural.cam.p)&&JSON.stringify(r.authored.cam.q)===JSON.stringify(r.procedural.cam.q);
 report.pairs.push({name,camera:r.authored.cam,sameCamera:same,authored:{calls:r.authored.calls,triangles:r.authored.triangles,vegTris:Math.round(r.authored.veg?.tris||0)},procedural:{calls:r.procedural.calls,triangles:r.procedural.triangles},files:[a?.file,b?.file],...meta});
 return {...r,same};};

// ---------------------------------------------------------------------------------------------------------------- A
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{await open(page,'');await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<30;i++)L.step(1/30);L.render();});
 const req=requests.filter(u=>/vegetation-assets|vegetation-benchmark|assets\/veg\//.test(u));
 check('Game: without ?vegetation the Prologue fetches none of the vegetation benchmark modules or models',req.length===0,req);
 const r=await page.evaluate(()=>({label:!!document.getElementById('vegetation-benchmark-label'),zones:lastLight.world.merged.filter(m=>/^vg:/.test(m.userData.zone||'')).length,proxies:lastLight.world.shadowProxies.length,merged:lastLight.world.merged.length,record:!!lastLight.world.vegRecord,swingLimb:lastLight.scene.getObjectByName('swing-limb')?.visible,carving:lastLight.scene.getObjectByName('oak-carving')?.visible}));
 check('Game: without ?vegetation no vegetation batches, proxies or records exist (the world is baked as in the accepted build; node: identical geometry hash)',!r.label&&r.zones===0&&!r.record&&r.proxies===379,r);
 check('Game (no ?vegetation): the swing\'s own cylinder limb is still drawn',r.swingLimb===true,r);
 check('Game (no ?vegetation): no page errors',errors.length===0,errors);report.parts.gameWithout=r;});

// ---------------------------------------------------------------------------------------------------------------- B
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{
 const R=report.parts.game={};await open(page,'vegetation');const t0=Date.now();await waitVeg(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>{const V=__vegetation.handle;return {error:__vegetation.error,loadMs:__vegetation.loadMs,info:V?.info,errors:V?.errors,records:{trees:lastLight.world.vegRecord.trees.length,beds:lastLight.world.vegRecord.beds.length}};});
 check('Game: ?vegetation loads the four vegetation files without error',!R.loaded.error&&!R.loaded.errors?.length,{error:R.loaded.error,errors:R.loaded.errors,loadMs:R.loaded.loadMs});
 const I=R.loaded.info;check('Game: every recorded tree stands authored (one landmark oak + the rest as street trees)',I&&I.trees===R.loaded.records.trees-1,{trees:I?.trees,records:R.loaded.records.trees,species:I?.speciesCount,variantsUsed:I?.variantsUsed});
 check('Game: bed shrubs and perennials stand on the recorded beds; the lookout meadow is planted',I&&I.shrubs>=300&&I.meadow>5000,{shrubs:I?.shrubs,meadow:I?.meadow});
 const offsite=requests.filter(u=>!u.startsWith(base)&&!u.startsWith('data:')&&!u.startsWith('blob:'));check('Game: no request leaves the local server',offsite.length===0,offsite);
 // geometry against the plan
 const G=await page.evaluate(async()=>{const V=__vegetation.handle,T=__vegetation.THREE,L=lastLight,W=L.world;const {LOOKOUT}=await import('./layout.js');const {groundPoint,heading}=await import('./route.js');const {MAIN}=await import('./terrain.js');
  const out={};const o=LOOKOUT.oak,p=groundPoint(o.d,o.lat);out.oakPlaceErr=+Math.hypot(V.oak.position.x-p.x,V.oak.position.z-p.z).toFixed(4);out.oakRotErr=+Math.abs(V.oak.rotation.y+heading(o.d)).toFixed(5);
  V.oak.updateMatrixWorld(true);const lod0=V.oak.children[0];lod0.visible=true;const rc=new T.Raycaster();
  // the swing's pivot exactly as ambient.js puts it
  const sw=LOOKOUT.swing,sp=groundPoint(sw.d,sw.lat),pivot=new T.Vector3(sp.x,W.groundY(sw.d,sw.lat)+4.35,sp.z);out.pivot=pivot.toArray().map(v=>+v.toFixed(3));
  rc.set(pivot.clone().add(new T.Vector3(0,-.12,0)),new T.Vector3(0,1,0));rc.far=1.0;const up=rc.intersectObject(lod0,false);
  out.limbAbovePivot=up.length?{dist:+(up[0].distance-.12).toFixed(3),mat:lod0.material[up[0].face.materialIndex]?.userData?.vegKind}:null;
  rc.set(pivot.clone().add(new T.Vector3(0,-.3,0)),new T.Vector3(0,-1,0));rc.far=3.75;const down=rc.intersectObject(lod0,false);out.ropePathHits=down.length;
  // story marks: nothing of the tree between the ground and 1.9 m above each
  const marks={oldBike:[o.d+.9,o.lat-1.9],sitAgainstTrunk:[o.d-.6,o.lat-1.15],bench:[LOOKOUT.bench.d,LOOKOUT.bench.lat],chalk:[LOOKOUT.chalk.d,LOOKOUT.chalk.lat],swingGround:[sw.d,sw.lat],friendsJamie:[o.d-2.2,o.lat-1.4],friendsSam:[o.d-2.6,o.lat-.2],ch6Stand:[o.d-1.2,o.lat-1.6]};out.marks={};
  for(const [k,[d,lat]] of Object.entries(marks)){const q=groundPoint(d,lat),y=W.groundY(d,lat);rc.set(new T.Vector3(q.x,y+1.9,q.z),new T.Vector3(0,-1,0));rc.far=1.85;const h=rc.intersectObject(lod0,false);out.marks[k]=h.length?+(y+1.9-h[0].distance-y).toFixed(3):null;}
  // the carving: the oak's own (the line carving of ending.js is hidden while the authored oak shows)
  const anchors=V.oakAnchors,car=anchors.carving;const cw=new T.Vector3(car.centre[0],car.centre[2],-car.centre[1]).applyMatrix4(V.oak.matrixWorld);/* (Blender x, forward, up -> glTF x, up, -forward) */const gc=L.scene.getObjectByName('oak-carving');
  const gcw=new T.Vector3();gc.getWorldPosition(gcw);const bearing=(a,b)=>Math.atan2(a.z-b.z,a.x-b.x);
  // ending.js: the letters' centre is the carving group's origin plus R (0.462) along its rotated -Z, 0.08 m up
  const th=gc.rotation.y,gl=new T.Vector3(gcw.x-Math.sin(th)*.462,gcw.y+.08,gcw.z-Math.cos(th)*.462),O=V.oak.position;
  const bA=Math.atan2(cw.z-O.z,cw.x-O.x),bG=Math.atan2(gl.z-O.z,gl.x-O.x);
  out.carving={authoredY:+cw.y.toFixed(3),gameLettersY:+gl.y.toFixed(3),bearingErr:+Math.abs(Math.atan2(Math.sin(bA-bG),Math.cos(bA-bG))).toFixed(3),gameHidden:!gc.visible,radius:anchors.trunkRadiusAtCarving,gameRadius:.462};
  out.swingLimbHidden=L.scene.getObjectByName('swing-limb')?.visible===false;
  // trees: none floats (base on the recorded ground) and none reaches into an Oak Hollow house
  const groundMeshes=W.merged.filter(m=>!/^vg:/.test(m.userData.zone||'')&&m.visible!==false);let worstFloat=0,sampled=0,into=[];
  V.treeField.items.forEach((it,k)=>{if(k%3)return;const e=new T.Vector3().setFromMatrixPosition(it.matrix);const near=groundMeshes.filter(m=>{const b=m.geometry.boundingSphere;return b&&Math.hypot(b.center.x-e.x,b.center.z-e.z)<b.radius+1;});
   rc.set(new T.Vector3(e.x,e.y+6,e.z),new T.Vector3(0,-1,0));rc.far=14;const h=rc.intersectObjects(near,false).filter(x=>x.face&&x.face.normal.y>.5);if(!h.length)return;sampled++;
   const gap=(e.y+.02)-h[h.length-1].point.y,top=(e.y+.02)-h[0].point.y;const d=Math.min(Math.abs(gap),Math.abs(top));const q=MAIN.project(e.x,e.z);(out.floatList||(out.floatList=[])).push({d:+d.toFixed(3),gap:+top.toFixed(3),id:it.variant.id,kind:it.rec.kind,lod:it.rec.lod,phase:it.rec.phase,u:+q.u.toFixed(1),v:+q.v.toFixed(1),zone:h[0].object.userData.zone||null});worstFloat=Math.max(worstFloat,d);});out.treesSampled=sampled;out.floatList=(out.floatList||[]).sort((a,b)=>b.d-a.d).slice(0,6);
  for(const it of V.treeField.items){const e=new T.Vector3().setFromMatrixPosition(it.matrix);const q=MAIN.project(e.x,e.z);
   if(it.rec.frame==='main'&&it.rec.lod!=='far'){let best=Infinity;for(const h of W.houses){if(h.frameId!=='main'||Math.abs((h.dc??h.u)-q.u)>45)continue;const l=h.localOf(q.u,q.v);best=Math.min(best,Math.hypot(Math.max(0,Math.abs(l.x)-h.w/2),Math.max(0,Math.abs(l.z)-h.depth/2)));}
    const crown=(it.variant.info.ll_crown||4)*it.s;if(crown>best+.45)into.push({id:it.variant.id,d:+q.u.toFixed(1),lat:+q.v.toFixed(1),crown:+crown.toFixed(2),clear:+best.toFixed(2)});}}
  out.treesWorstFloat=+worstFloat.toFixed(3);out.treesIntoHouses=into;
  lod0.visible=V.oak.children.indexOf(lod0)===0;return out;});
 R.geometry=G;
 check('Oak: stands on LOOKOUT.oak in the lookout\'s frame (< 1 cm, rotation = -heading)',G.oakPlaceErr<.01&&G.oakRotErr<1e-3,{place:G.oakPlaceErr,rot:G.oakRotErr});
 check('Oak: the swing\'s pivot (ambient.js, groundY + 4.35) is on the underside of the oak\'s own limb (bark within 0.15 m above it)',G.limbAbovePivot&&G.limbAbovePivot.dist<.15&&G.limbAbovePivot.mat==='bark',G.limbAbovePivot);
 check('Oak: nothing of the tree in the rope\'s and tire\'s path below the pivot',G.ropePathHits===0,G.ropePathHits);
 check('Oak: the stand-in cylinder limb is hidden while the authored oak shows',G.swingLimbHidden);
 check('Oak: the AR carving is the oak\'s own, at ending.js\'s height (+-3 cm) facing the swing (+-0.05 rad); the line carving is hidden',Math.abs(G.carving.authoredY-G.carving.gameLettersY)<.03&&G.carving.bearingErr<.05&&G.carving.gameHidden,G.carving);
 const blocked=Object.entries(G.marks).filter(([k,v])=>v!==null&&v>.12&&v<1.9);
 check('Oak: the story marks around the trunk are clear (old bike, Alex\'s place, bench, chalk, the swing\'s patch, where the friends stand: no wood or leaves from 0.12 to 1.9 m)',blocked.length===0,G.marks);
 check('Trees: none floats or sinks (ray down to the visible ground under every third tree: base within 0.2 m)',G.treesWorstFloat<.2&&G.treesSampled>80,{worst:G.treesWorstFloat,sampled:G.treesSampled,list:G.floatList});
 check('Trees: no crown reaches into an Oak Hollow house (crown radius within 0.45 m of the house wall)',G.treesIntoHouses.length===0,G.treesIntoHouses.slice(0,8));
 // LODs and wind
 const lod=await page.evaluate(()=>{const L=lastLight,out=[];L.start();for(let i=0;i<5;i++)L.step(1/30);
  for(const d of [60,300,700,1130]){L.place(d,-.3,0);for(let i=0;i<3;i++)L.step(1/30);__vegetation.tick();const s=__vegetation.stats();out.push({d,trees:s.trees.levels,shrubs:s.shrubs.levels,oak:s.oak.level,lawn:s.lawn.clumps});}
  const s1=__vegetation.stats();__vegetation.tick();const s2=__vegetation.stats();const stable=JSON.stringify(s1.trees.levels)===JSON.stringify(s2.trees.levels);
  const forced=[0,1,2,null].map(n=>{__vegetation.setLOD(n);__vegetation.tick();L.render();return {n,levels:__vegetation.stats().trees.levels};});
  const U=__vegetation.handle.uniforms,t0=U.uTime.value;L.step(.5);__vegetation.tick();const t1=U.uTime.value;__vegetation.setWind(2.2);__vegetation.tick();const w=U.uWind.value;__vegetation.setWind(1);__vegetation.tick();
  return {sweep:out,stable,forced,windTime:[t0,t1],windScale:w,gameWind:__vegetation.handle.gameWind};});
 R.lod=lod;
 check('LOD: near trees at LOD0, far ones at LOD1/2 along the street; the oak switches with distance',lod.sweep[0].trees[0]>0&&lod.sweep[0].trees[2]>0&&lod.sweep[3].oak===0&&lod.sweep[0].oak===2,lod.sweep);
 check('LOD: no flicker (a second update at the same place changes nothing); forced LOD 0/1/2 and back to auto',lod.stable&&lod.forced[0].levels[0]>0&&lod.forced[2].levels[2]>0,lod.forced);
 check('Wind: the vegetation runs on the game\'s own breeze (ambient.js time and gust) and the wind scale reaches the shader',lod.gameWind&&lod.windTime[1]>lod.windTime[0]&&lod.windScale===2.2,lod);
 // ---- gameplay captures, each an authored/procedural pair in the same frame (riding camera unless named)
 await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<6;i++)L.step(1/30);});
 R.pairs={};
 R.pairs.start=await pair(page,'G01-prologue-start-street',()=>ride(page,{d:2,lat:-.3,yaw:0,pitch:.02}),{caption:'the Prologue\'s starting street'});
 R.pairs.yards=await pair(page,'G04-shrubs-driveways-porches',()=>ride(page,{d:330,lat:3.2,yaw:-1.2,pitch:-.04}),{caption:'beds and shrubs at a porch and driveway'});
 R.pairs.jamie=await pair(page,'G04b-jamies-house',()=>ride(page,{d:780,lat:3.0,yaw:-1.2,pitch:-.02}),{caption:'Jamie\'s house: the red chair on the porch, the beds'});
 R.pairs.sidewalk=await pair(page,'G05-grass-beside-sidewalk',()=>ride(page,{d:410,lat:4.3,yaw:-.18,pitch:-.2}),{caption:'grass beside the sidewalk, from the riding camera'});
 R.pairs.street=await pair(page,'G03-street-trees',()=>ride(page,{d:470,lat:-.3,yaw:.04,pitch:.03}),{caption:'street trees down Oak Hollow Drive'});
 R.pairs.lookout=await pair(page,'G06-the-lookout',()=>ride(page,{d:1136.5,lat:-.9,yaw:.12,pitch:.06}),{caption:'the lookout from the stop'});
 R.pairs.oakFromBulb=await pair(page,'G07-oak-from-the-cul-de-sac',()=>ride(page,{d:1126,lat:-2,yaw:.3,pitch:.13}),{caption:'the old oak from the cul-de-sac'});
 R.pairs.oakFar=await pair(page,'G07b-oak-silhouette-from-124m',()=>ride(page,{d:1038,lat:-.3,yaw:.06,pitch:.07}),{caption:'the oak at 124 m down the street (the Aftermath I barricade distance, art bible §6): readable by silhouette'});
 R.pairs.lookingHome=await pair(page,'G10-dusk-looking-home',()=>ride(page,{d:1150,lat:2,yaw:Math.PI,pitch:.04}),{caption:'evening: looking back down the street from the lookout'});
 for(const [k,v] of Object.entries(R.pairs))check(`Before/after ${k}: the same camera and frame for both`,v.same,{authored:v.authored.cam,procedural:v.procedural.cam});
 check('Game (?vegetation, checks and captures): no page errors',errors.length===0,errors.slice(0,6));
 // cost: authored vs procedural in the same frames
 R.cost=report.pairs.map(p=>({name:p.name,authored:p.authored,procedural:p.procedural}));
});

// ---------------------------------------------------------------------------------------------------------------- B2
// a fresh game: the group ride from the start, then the whole Prologue to Chapter One with the authored vegetation
if(PARTS.includes('B'))await withPage(async(page,{errors})=>{const R=report.parts.play={pairs:{}};await open(page,'vegetation');await waitVeg(page);
 await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<10;i++)L.step(1/30);L.press('KeyW');let f=0;while(L.state.distance<85&&f++<9000)L.step(1/30);L.look(.15,-.04);L.step(.1);});
 // the group ride: pedal from the start with the friends
  R.pairs.groupRide=await pair(page,'G02-group-bicycle-ride',()=>page.evaluate(()=>{__vegetation.tick();const i=lastLight.render();const c=lastLight.camera;return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4)),d:lastLight.state.distance},veg:__vegetation.stats()};}),{caption:'the group ride (the friends riding beside)'});
 // ---- the whole Prologue, played with the authored vegetation (the release test's own sequence)
 const PL=await page.evaluate(async()=>{const L=lastLight,res={};const {LOOKOUT}=await import('./layout.js');
  let f=0;while(L.state.distance<1136.5&&f++<60000)L.step(1/30);res.reached=L.state.distance;
  res.homes=L.state.friends.map(x=>({name:x.name,inside:x.inside}));L.release('KeyW');L.step(2);L.look(0,0);L.step(.3);L.key('KeyF');L.step(.55);L.step(1.5);res.walking=L.state.state;
  L.press('KeyW');L.step(12);L.release('KeyW');L.step(.4);L.look(-.4,.12);L.step(.1);L.look(Math.PI,0);L.step(3);L.step(10);res.callDone=L.state.callDone;L.look(0,.02);L.step(.1);
  L.walkTo(LOOKOUT.swing.d-1.2,LOOKOUT.swing.lat,0,0);L.step(.2);res.swingPrompt=L.state.prompt;L.key('KeyF');L.step(.7);res.swing=L.state.swing;
  L.walkTo(LOOKOUT.bench.d-1.1,LOOKOUT.bench.lat,0,0);L.step(.2);L.key('KeyF');L.step(1.5);res.bench=L.state.pose;L.key('KeyF');L.step(1.2);res.otherBike=L.state.otherBike;
  L.walkTo(LOOKOUT.chalk.d-.7,LOOKOUT.chalk.lat+.6,0,0);L.step(.2);L.key('KeyF');L.step(1.3);res.chalk=L.state.pose;L.look(-1.0,.7);L.step(.3);res.clue=L.state.clue;L.step(5);
  return res;});
 R.prologue=PL;
 check('Prologue with ?vegetation: the ride reaches the lookout; Jamie and Sam are home, Alex on Briarwood',PL.reached>=1136.5&&PL.homes.filter(h=>h.name!=='ALEX').every(h=>h.inside),PL);
 check('Prologue with ?vegetation: dismount, the distant call, the swing pushed from its prompt, the bench, the chalk and the faint AR',PL.walking==='walking'&&PL.callDone&&PL.swingPrompt==='F:Push the swing'&&PL.swing>.1&&PL.bench==='bench'&&PL.otherBike&&PL.chalk==='chalk'&&PL.clue,PL);
 // the oak close, the carving, the swing and the other bike, from where the release test stands the player
 const L0=await page.evaluate(async()=>(await import('./layout.js')).LOOKOUT);
 const walkShot=async(name,fn,meta)=>{await page.evaluate(fn,L0);R.pairs[name]=await pair(page,name,()=>page.evaluate(()=>{__vegetation.tick();const i=lastLight.render();const c=lastLight.camera;return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4))},veg:__vegetation.stats()};}),meta);};
 await walkShot('G08-oak-close-up-carving',L=>{const d=L.oak.d-.26,lat=L.oak.lat-1.27;lastLight.walkTo(d,lat,Math.atan2(-(L.oak.lat-lat),L.oak.d-d),-.12);lastLight.step(.1);},{caption:'the oak close: bark, flare and the healed AR (the release test\'s carving view)'});
 await walkShot('G08b-oak-close-up-up-the-trunk',L=>{const d=L.oak.d-3.2,lat=L.oak.lat-3.4;lastLight.walkTo(d,lat,Math.atan2(-(L.oak.lat-lat),L.oak.d-d),.55);lastLight.step(.1);},{caption:'under the oak, looking up the trunk into the limbs'});
 await walkShot('G09-the-tire-swing',L=>{const d=L.swing.d-4.2,lat=L.swing.lat-3.2;lastLight.walkTo(d,lat,Math.atan2(-(L.swing.lat+.2-lat),L.swing.d+.4-d),.22);lastLight.step(.1);},{caption:'the tire swing on the oak\'s own limb'});
 await walkShot('G09b-the-other-bike',L=>{lastLight.walkTo(L.swing.d-4,L.swing.lat-5,Math.atan2(-(L.oak.lat+.6-(L.swing.lat-5)),L.oak.d+.9-(L.swing.d-4)),-.15);lastLight.step(.1);},{caption:'the other bike under the oak after the call (release test view)'});
 // go home: Chapter One begins
 const home=await page.evaluate(()=>{const L=lastLight;for(let i=0;i<1400;i++){const s=L.state;if(Math.hypot(s.walkD-s.distance,s.walkLat-s.lateral)<1.5)break;L.look(Math.atan2(-(s.lateral+.75-s.walkLat),s.distance-s.walkD),0);L.press('KeyW');L.step(1/30);}L.release('KeyW');L.step(.3);L.key('KeyF');L.step(1.2);
  L.press('KeyW');for(let i=0;i<12;i++)L.step(.3);return {state:L.state.state,ending:!document.getElementById('ending')?.hidden};});
 check('Prologue with ?vegetation plays to its end: Go home starts the ride home (Chapter One)',home.state==='c1-ride'||home.state==='riding',home);
 check('Game (?vegetation): no page errors through the whole Prologue',errors.length===0,errors.slice(0,6));
 for(const [k,v] of Object.entries(R.pairs))check(`Before/after ${k}: the same camera and frame for both`,v.same,{authored:v.authored.cam,procedural:v.procedural.cam});
});

// ---------------------------------------------------------------------------------------------------------------- C
if(PARTS.includes('C'))await withPage(async(page,{errors,requests})=>{const R=report.parts.combined={};await open(page,'bikes&houses&vegetation');
 await waitVeg(page);await page.waitForFunction(()=>window.__houses||/FAILED/.test(document.getElementById('house-benchmark-label')?.textContent||''),null,{timeout:300000});
 await page.waitForFunction(()=>window.__bikes||/FAILED/.test(document.getElementById('bike-benchmark-label')?.textContent||''),null,{timeout:300000});
 R.labels=await page.evaluate(()=>['bike','house','vegetation'].map(k=>document.getElementById(k+'-benchmark-label')?.textContent?.split('\n')[0]));
 check('Combined ?bikes&houses&vegetation: all three benchmarks load',R.labels.every(l=>l&&!/FAILED/.test(l)),R.labels);
 await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<6;i++)L.step(1/30);});
 R.pairs={};R.pairs.housesTrees=await pair(page,'G03b-street-trees-beside-the-new-houses',()=>ride(page,{d:150,lat:-.3,yaw:-.2,pitch:.03}),{caption:'street trees beside the authored houses (?bikes&houses&vegetation)',flags:'bikes&houses&vegetation'});
 R.pairs.housesYards=await pair(page,'G04c-yards-with-the-new-houses',()=>ride(page,{d:255,lat:3.0,yaw:-1.05,pitch:-.03}),{caption:'yards, beds and lawns at the authored houses',flags:'bikes&houses&vegetation'});
 await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<10;i++)L.step(1/30);L.press('KeyW');let f=0;while(L.state.distance<120&&f++<9000)L.step(1/30);L.look(-.1,-.05);L.step(.1);});
 R.pairs.ride=await pair(page,'G02b-group-ride-with-authored-bikes-and-houses',()=>page.evaluate(()=>{__vegetation.tick();__houses?.tick();__bikes?.tick();const i=lastLight.render();const c=lastLight.camera;return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4))},veg:__vegetation.stats()};}),{caption:'the group ride with the authored bikes, houses and vegetation',flags:'bikes&houses&vegetation'});
 const moved=await page.evaluate(()=>{const d0=lastLight.state.distance;lastLight.step(4);return lastLight.state.distance-d0;});
 check('Combined: the ride keeps playing',moved>5,moved);
 check('Combined: no page errors',errors.length===0,errors.slice(0,6));});

// ---------------------------------------------------------------------------------------------------------------- D
if(PARTS.includes('D')){const tmp=fs.mkdtempSync(path.join(process.env.TMPDIR||'/tmp','veg-pkg-'));
 for(const [label,env] of [['models',{PLAYTEST_MODELS:'1'}],['default',{}]]){const dir=path.join(tmp,label);fs.mkdirSync(dir,{recursive:true});
  execFileSync('node',['tools/package-playtest.mjs',dir],{env:{...process.env,PLAYTEST_MENU:'1',...env},encoding:'utf8',maxBuffer:1<<26});
  const html='Last-Light-Playtest.html',file=path.join(dir,html);
  if(label==='models'){const man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));check('Package: PLAYTEST_MODELS=1 embeds the four vegetation models and hashes them in the manifest',['lm.old-oak','veg.street-trees','veg.shrubs','veg.ground'].every(k=>!!man.sourceHashes['dist/assets/veg/'+k+'.glb']),{size:fs.statSync(file).size});}
  await withPage(async(page,{errors,requests})=>{await page.goto(pathToFileURL(file).href+'?qa&vegetation',{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});await waitVeg(page);
   const r=await page.evaluate(()=>({error:__vegetation?.error??null,label:document.getElementById('vegetation-benchmark-label')?.textContent?.split('\n')[0],from:__vegetation?.info?.()?Object.values(__vegetation.info().files).map(f=>f.from):null}));
   const net=requests.filter(u=>/^https?:/.test(u));
   if(label==='models'){check('Offline package (PLAYTEST_MODELS=1, file://, browser offline): ?vegetation loads from the embedded bytes, no network',!r.error&&r.from?.every(f=>f==='package')&&net.length===0,{...r,net:net.slice(0,4),size:fs.statSync(file).size});
    await page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<6;i++)L.step(1/30);L.place(1126,-2,0);for(let i=0;i<4;i++)L.step(1/30);L.look(.3,.13);L.step(1/30);__vegetation.tick();L.render();});await shot(page,'P01-offline-package-oak-from-the-cul-de-sac',{kind:'game',mode:'authored',package:'PLAYTEST_MODELS=1, file://, offline'});report.parts.packageModels={...r,bytes:fs.statSync(file).size,file:html};}
   else{check('Default offline package: ?vegetation fails loudly and substitutes nothing (the procedural vegetation stays)',/FAILED/.test(r.label||'')&&net.length===0,{...r,net:net.slice(0,4)});report.parts.packageDefault={...r,bytes:fs.statSync(file).size};}
   check(`Offline package (${label}): no page errors other than the deliberate asset message`,errors.filter(e=>!/not embedded|vegetation benchmark/.test(e)).length===0,errors.slice(0,4));},{offline:true});}}

report.finished=new Date().toISOString();report.summary={passed:report.checks.length,failed:report.failures.length};
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,1));console.log(`\n${report.checks.length} passed, ${report.failures.length} failed -> ${path.relative(process.cwd(),path.join(out,'report.json'))}`);
server.close();process.exit(report.failures.length?1:0);
