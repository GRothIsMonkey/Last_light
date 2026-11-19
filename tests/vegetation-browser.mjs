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
// The lawn and ground repair (vegetation-lawn.js; Y steps the lawns alone): A/B/C triplets in one frame (C repaired,
// B the first benchmark, A the original procedural lawn; trees and shrubs authored in all three) from the riding and
// walking cameras, and focused checks: blades cover every lawn cell near the camera; no blade over a walk, curb, drive,
// porch or house; tile LODs drop only blades already faded; the same pose twice gives the same tiles; the ground's tile
// period does not repeat visibly (pixel correlation at the 0.5 m period); no tuft islands (clump-scale blotchiness of the
// lawn in the riding view, C against B); cost against B in the same frames; the blades on the game's breeze; the oak,
// trees, shrubs and ground files untouched; the world's obstacles unchanged.
// usage: node tests/vegetation-browser.mjs [outDir=docs/qa/vegetation/browser]   (PARTS=A,B,C,D; SHOTS=0 to skip images)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/vegetation/browser');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C,D').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const commit=(()=>{try{return execFileSync('git',['rev-parse','--short','HEAD']).toString().trim();}catch{return null;}})();
const report={lawn:[],renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',commit,started:new Date().toISOString(),viewport:'1600x900, deviceScaleFactor 1, Medium profile',checks:[],failures:[],parts:{},shots:[],pairs:[]};
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
// the lawns alone, in one frame: C repaired, B the first benchmark's, A the original procedural lawn (trees and shrubs
// stay authored); optional pixel metrics of a lawn rectangle read from the frame itself
const canvasPixels=()=>{const cv=[...document.querySelectorAll('canvas')].sort((a,b)=>b.width*b.height-a.width*a.height)[0],gl=cv.getContext('webgl2');const w=cv.width,h=cv.height,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);return {w,h,px};};
// the lawn's own pixels in this frame: one extra render with the lawn ground flat magenta and no blades (QA mode 3)
const lawnMask=page=>page.evaluate(src=>{const read=new Function('return '+src)();const V=__vegetation.handle,mode=V.lawnMode;V.lawn2.setGround(3);const bv=V.lawn2.blades.visible;V.lawn2.blades.visible=false;
 lastLight.render();const {w,h,px}=read();const m=new Uint8Array(w*h);let n=0;for(let k=0;k<w*h;k++){const r=px[k*4],g=px[k*4+1],b=px[k*4+2];if(r>1.5*g+12&&b>1.5*g+12){m[k]=1;n++;}}
 V.lawn2.blades.visible=bv;V.setLawn(mode);window.__lawnMask={w,h,m};return {w,h,lawnShare:+(n/(w*h)).toFixed(3)};},canvasPixels.toString());
const measure=(page,metrics)=>page.evaluate(([metrics,src])=>{window.__vegetation?.tick();const i=lastLight.render();const c=lastLight.camera;const out={calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4))},veg:window.__vegetation?.stats?.()};
 const M=window.__lawnMask;if(metrics&&M){const {w,h,px}=new Function('return '+src)()();
  // clump-scale blotchiness over 12 px blocks that are all lawn: the spread of block means, the share of blocks far from
  // the local median (a tuft island is a block much brighter or darker than the lawn around it)
  const B=12,bm=[];for(let by=0;by+B<=h;by+=B)for(let bx=0;bx+B<=w;bx+=B){let a=0,ok=true;for(let y=by;y<by+B&&ok;y++)for(let x=bx;x<bx+B;x++){const k=y*w+x;if(!M.m[k]){ok=false;break;}a+=.2126*px[k*4]+.7152*px[k*4+1]+.0722*px[k*4+2];}if(ok)bm.push([bx,by,a/(B*B)]);}
  const near=(q)=>bm.filter(o=>Math.abs(o[0]-q[0])<=60&&Math.abs(o[1]-q[1])<=60).map(o=>o[2]).sort((a,b)=>a-b);
  let dev=0,outl=0;for(const q of bm){const l=near(q),med=l[l.length>>1];const d=Math.abs(q[2]-med)/Math.max(med,1);dev+=d;if(d>.15)outl++;}
  out.metrics={blocks:bm.length,meanDev:+(dev/Math.max(1,bm.length)).toFixed(4),islands:+(outl/Math.max(1,bm.length)).toFixed(4)};}
 return out;},[!!metrics,canvasPixels.toString()]);
const triple=async(page,name,frameFn,meta={},metrics=false)=>{const r={};await page.evaluate(()=>__vegetation.setLawn('C'));await frameFn();if(metrics)r.mask=await lawnMask(page);r.C=await measure(page,metrics);const fc=await shot(page,`${name}--C-repaired`,{kind:'game',lawn:'C',...meta,cam:r.C.cam});
 await page.evaluate(()=>__vegetation.setLawn('B'));r.B=await measure(page,metrics);const fb=await shot(page,`${name}--B-first-benchmark`,{kind:'game',lawn:'B',...meta,cam:r.B.cam});
 await page.evaluate(()=>__vegetation.setLawn('A'));r.A=await measure(page,metrics);const fa=await shot(page,`${name}--A-original`,{kind:'game',lawn:'A',...meta,cam:r.A.cam});
 await page.evaluate(()=>{__vegetation.setLawn('C');window.__lawnMask=null;});await measure(page,false);
 const same=['B','A'].every(k=>JSON.stringify(r[k].cam.p)===JSON.stringify(r.C.cam.p)&&JSON.stringify(r[k].cam.q)===JSON.stringify(r.C.cam.q));
 const sum=k=>({calls:r[k].calls,triangles:r[k].triangles,vegTris:Math.round(r[k].veg?.tris||0),bladeTris:Math.round(r[k].veg?.blades?.tris||0),bladeTiles:r[k].veg?.blades?.tiles,clumps:r[k].veg?.lawn?.clumps||0,metrics:r[k].metrics});
 report.lawn.push({name,camera:r.C.cam,sameCamera:same,mask:r.mask||null,C:sum('C'),B:sum('B'),A:sum('A'),files:[fc?.file,fb?.file,fa?.file],...meta});
 return {...r,same};};
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
 const r=await page.evaluate(()=>({label:!!document.getElementById('vegetation-benchmark-label'),zones:lastLight.world.merged.filter(m=>/^vg:/.test(m.userData.zone||'')).length,proxies:lastLight.world.shadowProxies.length,merged:lastLight.world.merged.length,record:!!lastLight.world.vegRecord,swingLimb:lastLight.scene.getObjectByName('swing-limb')?.visible,carving:lastLight.scene.getObjectByName('oak-carving')?.visible,obstacles:lastLight.world.obstacles?.length??null,space:['walk','porch','house','tree','fence','driveway','pole'].map(t=>lastLight.world.space?.items(t).length)}));
 check('Game: without ?vegetation no vegetation batches, proxies or records exist (the world is baked as in the accepted build; node: identical geometry hash)',!r.label&&r.zones===0&&!r.record&&r.proxies===379,r);
 check('Game (no ?vegetation): the swing\'s own cylinder limb is still drawn',r.swingLimb===true,r);
 check('Game (no ?vegetation): no page errors',errors.length===0,errors);report.parts.gameWithout=r;});

// ---------------------------------------------------------------------------------------------------------------- B
if(PARTS.includes('B')){const UNCHANGED={'lm.old-oak':'4a947c087d3e76dee74af8442c7e8755afda3812525bb916fe8897e579405154','veg.street-trees':'134dde67bc4110fd3038f7893129c1ceab692e3132afab122e0a327e8c4db54d','veg.shrubs':'2e0baf6c09e19dfa1237b6484cfb061ca1feeecc140a6752b75a777c72e5555e','veg.ground':'48ea0331638e9cb3c90a0d18cab93a7071b3c74cfe68025e01232b2ed4102599'};
 const now=Object.fromEntries(Object.keys(UNCHANGED).map(k=>[k,sha('dist/assets/veg/'+k+'.glb')]));
 check('Lawn repair: the oak, street trees, shrubs and ground plants are the first benchmark\'s files, byte for byte (f1f085a)',Object.entries(UNCHANGED).every(([k,v])=>now[k]===v),now);}
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{
 const R=report.parts.game={};await open(page,'vegetation');const t0=Date.now();await waitVeg(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>{const V=__vegetation.handle;return {error:__vegetation.error,loadMs:__vegetation.loadMs,info:V?.info,errors:V?.errors,records:{trees:lastLight.world.vegRecord.trees.length,beds:lastLight.world.vegRecord.beds.length}};});
 check('Game: ?vegetation loads the five vegetation files without error (oak, street trees, shrubs, ground plants, lawn)',!R.loaded.error&&!R.loaded.errors?.length,{error:R.loaded.error,errors:R.loaded.errors,loadMs:R.loaded.loadMs});
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
 // ---- the lawns: C / B / A in one frame (Y), from the riding camera at golden hour, with pixel metrics of the lawn itself
 R.lawn={};const T3=(n,s,cap,m=true)=>triple(page,n,()=>ride(page,s),{caption:cap},m);
 R.lawn.sidewalk=await T3('L01-lawn-beside-sidewalk',{d:410,lat:4.3,yaw:-.18,pitch:-.2},'the lawn beside the sidewalk, from the riding camera');
 R.lawn.lookDown=await T3('L02-looking-down-near-the-sidewalk',{d:560,lat:4.6,yaw:-.55,pitch:-.62},'looking down at the curb strip and the walk edge while riding');
 R.lawn.front=await T3('L03-lawn-in-front-of-a-house',{d:330,lat:3.2,yaw:-1.2,pitch:-.04},'a front lawn, its beds and porch');
 R.lawn.near=await T3('L04-near-grass-while-riding',{d:612,lat:3.6,yaw:-.35,pitch:-.32},'the grass right beside the bike (a rougher lot)');
 R.lawn.row=await T3('L05-a-row-of-front-yards',{d:200,lat:-2.5,yaw:.9,pitch:-.02},'across the street: several front yards, each kept its own way');
 R.lawn.jamie=await T3('L06-jamies-house',{d:780,lat:3.0,yaw:-1.2,pitch:-.02},'Jamie\'s house');
 R.lawn.sam=await T3('L07-sams-house',{d:982,lat:-3.0,yaw:1.2,pitch:-.02},'Sam\'s house');
 R.lawn.street=await T3('L08-down-the-street',{d:470,lat:-.3,yaw:.04,pitch:.03},'down Oak Hollow Drive: the lawns into the distance (no ring, no line)');
 R.lawn.lookout=await T3('L09-the-lookout-from-the-stop',{d:1136.5,lat:-.9,yaw:.12,pitch:.06},'the lookout from the stop: the knoll\'s long grass',false);
 for(const [k,v] of Object.entries(R.lawn))check(`Lawn ${k}: C, B and A in the same camera and frame`,v.same,{C:v.C.cam,B:v.B.cam,A:v.A.cam});
 const LR=report.lawn.filter(x=>x.C.metrics&&x.B.metrics);
 check('Lawn: no tuft islands: the share of 12 px lawn blocks far (>15 %) from their neighbourhood median is under 3 % in every riding view, and below the first benchmark\'s',
  LR.every(x=>x.C.metrics.islands<.03&&x.C.metrics.islands<=x.B.metrics.islands),LR.map(x=>({name:x.name,C:x.C.metrics,B:x.B.metrics,A:x.A.metrics})));
 check('Lawn cost: in every riding view the repaired lawn draws at most 25 % more triangles and 12 more draw calls than the first benchmark\'s in the same frame',
  report.lawn.every(x=>x.C.triangles<=1.25*x.B.triangles&&x.C.calls<=x.B.calls+12),report.lawn.map(x=>({name:x.name,C:[x.C.calls,x.C.triangles,x.C.bladeTris],B:[x.B.calls,x.B.triangles],A:[x.A.calls,x.A.triangles]})));
 // ---- focused checks of the blade field, the ground and the switch
 const LC=await page.evaluate(async()=>{const V=__vegetation.handle,T=__vegetation.THREE,L=lastLight,W=L.world,F=V.lawn2.blades;const {MAIN}=await import('./terrain.js');
  V.setLawn('C');const out={};
  L.place(330,3.2,0);for(let i=0;i<3;i++)L.step(1/30);L.look(-1.2,-.04);L.step(1/30);__vegetation.tick();
  const cam=L.camera.getWorldPosition(new T.Vector3()),fw=new T.Vector3();L.camera.getWorldDirection(fw);
  const cells=new Map();F.meshes.forEach((im,l)=>{const e=im.instanceMatrix.array,mk=im.geometry.attributes.aMask.array;for(let i=0;i<im.count;i++){const x=e[i*16+12],z=e[i*16+14];cells.set(Math.floor(x)+','+Math.floor(z),{l,mask:[mk[i*4],mk[i*4+1],mk[i*4+2],mk[i*4+3]],x,z});}});
  const bit=(c,b)=>Math.floor(c.mask[b>>4]/2**(b&15))%2===1;
  // coverage: random lawn points in front of the camera, 2.6-11 m: each one's cell has a tile, its 12.5 cm sub-cell is on
  let tested=0;const missing=[];let seed=7;const r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  // (points are taken at the centre of their 12.5 cm sub-cell: the mask's own resolution)
  for(let k=0;k<3000&&tested<400;k++){const a=Math.atan2(fw.z,fw.x)+(r()-.5)*1.4,d=2.6+r()*8.4;let x=cam.x+Math.cos(a)*d,z=cam.z+Math.sin(a)*d;x=(Math.floor(x*8)+.5)/8;z=(Math.floor(z*8)+.5)/8;const y=F.lawnPoint(x,z,MAIN.project(x,z).u);if(y===null)continue;tested++;
   const c=cells.get(Math.floor(x)+','+Math.floor(z)),b=Math.min(7,Math.floor((z-Math.floor(z))*8))*8+Math.min(7,Math.floor((x-Math.floor(x))*8));
   if(!c||!bit(c,b))missing.push({x:+x.toFixed(2),z:+z.toFixed(2),cell:!!c});}
  out.coverage={tested,missing:missing.length,examples:missing.slice(0,5)};
  // nothing over a hard surface: every sub-cell that is on, tested independently (walk or curb height, a drive or pad, a
  // walk, porch, house, shed or driveway footprint, the street inside the curbs)
  let bits=0;const bad=[];const HARD=new Set(['walk','porch','house','shed','driveway']);
  for(const c of cells.values()){const x0=Math.floor(c.x),z0=Math.floor(c.z);for(let b=0;b<64;b++){if(!bit(c,b))continue;bits++;
   const x=x0+((b&7)+.5)/8,z=z0+((b>>3)+.5)/8,q=MAIN.project(x,z),s=W.surfaceY(q.u,q.v),a=W.authoredY(q.u,q.v);
   const hard=(q.u<1121&&Math.abs(q.v)<5)||(q.u<1140&&(s>.135&&s<.175||Math.abs(a-s)>.004))||!!W.space.blocked(x,z,0,HARD);
   if(hard)bad.push({x:+x.toFixed(2),z:+z.toFixed(2),u:+q.u.toFixed(2),v:+q.v.toFixed(2),s:+s.toFixed(3)});}}
  out.hard={cells:cells.size,bits,bad:bad.length,examples:bad.slice(0,5)};
  // LODs drop only blades already faded: a LOD1/LOD2 tile's nearest point has a standing share under that LOD's ranks
  const D=F.U.uFade.value;let lodBad=0;F.meshes.forEach((im,l)=>{if(!l)return;const e=im.instanceMatrix.array;for(let i=0;i<im.count;i++){const x=e[i*16+12],y=e[i*16+13],z=e[i*16+14];const dn=Math.max(0,Math.hypot(x-cam.x,z-cam.z)-.71),dn3=Math.hypot(dn,Math.max(0,Math.abs(y-cam.y)-.1));
   if(Math.min(1,Math.exp(-(dn3-D.x)/D.y))>F.lodRank[l]+1e-6)lodBad++;}});out.lod={bad:lodBad,tiles:F.stats().tiles};
  // the same pose again gives the same tiles
  const sig=()=>F.meshes.map(im=>im.count+':'+Array.from(im.instanceMatrix.array.slice(0,Math.min(im.count,40)*16)).map(v=>v.toFixed(3)).join(',')).join('|');
  const s1=sig();F.last=null;__vegetation.tick();out.stable=s1===sig();
  // the ground's tiling: ground only (blades hidden), the lawn's own pixels compared with the pixels 0.5 m away (the
  // first scale's period) and with an unrelated offset: a visible repetition would correlate strongly at the period
  L.place(330,3.2,0);for(let i=0;i<3;i++)L.step(1/30);L.look(-1.2,-.16);L.step(1/30);__vegetation.tick();F.visible=false;L.render();
  const cv=[...document.querySelectorAll('canvas')].sort((a,b)=>b.width*b.height-a.width*a.height)[0],gl=cv.getContext('webgl2'),w=cv.width,h=cv.height,px=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);F.visible=true;
  const cam2=L.camera.getWorldPosition(new T.Vector3()),fw2=new T.Vector3();L.camera.getWorldDirection(fw2);const lum=(x,y,z)=>{const v=new T.Vector3(x,y,z).project(L.camera);if(v.z>1||Math.abs(v.x)>.98||Math.abs(v.y)>.98)return null;const X=Math.round((v.x*.5+.5)*(w-1)),Y=Math.round((v.y*.5+.5)*(h-1)),k=(Y*w+X)*4;return .2126*px[k]+.7152*px[k+1]+.0722*px[k+2];};
  // the patch: 2.8 m square of front lawn where the view ray meets the ground
  const hit=-(cam2.y-(F.lawnPoint(cam2.x+fw2.x*8,cam2.z+fw2.z*8,330)??cam2.y-1.4))/Math.min(-.05,fw2.y),cx=cam2.x+fw2.x*hit,cz=cam2.z+fw2.z*hit;out.tilingPatch={x:+cx.toFixed(2),z:+cz.toFixed(2),dist:+hit.toFixed(2)};
  const corr=(dx,dz)=>{const A=[],B=[];for(let i=0;i<70;i++)for(let j=0;j<70;j++){const x=cx+(i-35)*.04,z=cz+(j-35)*.04;const y1=F.lawnPoint(x,z,330),y2=F.lawnPoint(x+dx,z+dz,330);if(y1===null||y2===null)continue;const a=lum(x,y1,z),b=lum(x+dx,y2,z+dz);if(a===null||b===null)continue;A.push(a);B.push(b);}
   const n=A.length;if(n<200)return {n,r:null};const ma=A.reduce((s,v)=>s+v,0)/n,mb=B.reduce((s,v)=>s+v,0)/n;let sab=0,saa=0,sbb=0;for(let k=0;k<n;k++){sab+=(A[k]-ma)*(B[k]-mb);saa+=(A[k]-ma)**2;sbb+=(B[k]-mb)**2;}return {n,r:+(sab/Math.sqrt(saa*sbb)).toFixed(3)};};
  out.tiling={periodX:corr(.5,0),periodZ:corr(0,.5),unrelated:corr(.27,.11)};
  // the blades on the game's breeze (the trees' own uniforms)
  const BU=V.lawn2.bladeUniforms;out.wind={sameTime:BU.uTime===V.uniforms.uTime,sameGust:BU.uGust===V.uniforms.uGust,sameScale:BU.uWind===V.uniforms.uWind};const t0=BU.uTime.value;L.step(.5);__vegetation.tick();out.wind.advances=BU.uTime.value>t0;
  out.obstacles=W.obstacles?.length??null;out.space=['walk','porch','house','tree','fence','driveway','pole'].map(t=>W.space?.items(t).length);
  out.info={lawn:V.info.lawn,gpuTextureMB:V.info.gpuTextureMB,textures:V.info.textures,materials:V.info.materials};
  return out;});
 R.lawnChecks=LC;
 check('Lawn coverage: every lawn point within 11 m in view has its tile and its 12.5 cm sub-cell on (400 random points)',LC.coverage.tested>=300&&LC.coverage.missing===0,LC.coverage);
 check('Lawn boundaries: no blade sub-cell over a walk, curb, drive, pad, porch, house, shed or the street (every sub-cell of every tile, independent tests)',LC.hard.bits>2000&&LC.hard.bad===0,LC.hard);
 check('Lawn LOD: a tile drops to a sparser LOD only where the blades it drops have already faded (no popping); the same pose gives the same tiles',LC.lod.bad===0&&LC.stable,{lod:LC.lod,stable:LC.stable});
 check('Lawn ground: no visible tiling (lawn pixels 0.5 m apart, the texture\'s period, correlate under 0.5, close to an unrelated offset)',[LC.tiling.periodX,LC.tiling.periodZ].every(c=>c.r!==null&&c.r<.5&&c.r-LC.tiling.unrelated.r<.3),LC.tiling);
 check('Lawn wind: the blades run on the trees\' breeze uniforms (the game\'s own time and gusts) and the time advances',LC.wind.sameTime&&LC.wind.sameGust&&LC.wind.sameScale&&LC.wind.advances,LC.wind);
 const W0=report.parts.gameWithout;check('Collisions: the world\'s obstacles and navigation shapes are the same as without ?vegetation',W0&&LC.obstacles===W0.obstacles&&JSON.stringify(LC.space)===JSON.stringify(W0.space),{with:[LC.obstacles,LC.space],without:W0&&[W0.obstacles,W0.space]});
 // Y steps the lawns (C -> B -> A -> C); K still swaps everything
 const ky=[];for(let i=0;i<3;i++){await page.keyboard.press('y');ky.push(await page.evaluate(()=>__vegetation.lawnMode));}
 check('Lawn switch: Y steps C (repaired) -> B (first benchmark) -> A (original) -> C',ky.join('')==='BAC',ky);
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
 // ---- the lawns at the lookout and in the later evening, from where a player stands (C / B / A, one frame each)
 const walkT=(n,fn,cap)=>triple(page,n,async()=>{await page.evaluate(fn,L0);},{caption:cap,camera:'walking'});
 R.lawn={};
 R.lawn.underOak=await walkT('L10-grass-beneath-the-old-oak',L=>{lastLight.walkTo(L.swing.d-4.2,L.swing.lat-3.2,-.636,-.12);lastLight.step(.1);},'the grass beneath the old oak, the swing\'s worn patch, the roots');
 R.lawn.path=await walkT('L11-the-lookout-path-and-bench',L=>{lastLight.walkTo(1156,3.4,.75,-.28);lastLight.step(.1);},'the trodden way, the bench, the knoll\'s long grass');
 R.lawn.meadow=await walkT('L12-across-the-meadow',L=>{lastLight.walkTo(1167,2.5,.05,-.06);lastLight.step(.1);},'across the knoll and the field fence into the meadow');
 R.lawn.bike=await walkT('L13-the-old-bike-in-the-grass',L=>{lastLight.walkTo(L.swing.d-4,L.swing.lat-5,Math.atan2(-(L.oak.lat+.6-(L.swing.lat-5)),L.oak.d+.9-(L.swing.d-4)),-.3);lastLight.step(.1);},'the other bike lying in the grass (scale of the blades beside the wheels)');
 R.lawn.evening=await walkT('L14-evening-lawns-from-the-stop',L=>{lastLight.walkTo(L.stop.d+1,L.stop.lat,Math.PI,-.08);lastLight.step(.1);},'later evening: looking back at the last lawns of the street');
 for(const [k,v] of Object.entries(R.lawn))check(`Lawn ${k} (walking): C, B and A in the same camera and frame`,v.same,{C:v.C.cam,B:v.B.cam,A:v.A.cam});
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
 R.lawn={};R.lawn.housesStreet=await triple(page,'L15-street-with-the-new-houses-and-trees',()=>ride(page,{d:150,lat:-.3,yaw:-.2,pitch:.03}),{caption:'the street with the authored houses and trees (?bikes&houses&vegetation)',flags:'bikes&houses&vegetation'},true);
 R.lawn.housesYards=await triple(page,'L16-yards-of-the-new-houses',()=>ride(page,{d:255,lat:3.0,yaw:-1.05,pitch:-.03}),{caption:'front yards of the authored houses (?bikes&houses&vegetation)',flags:'bikes&houses&vegetation'},true);
 for(const [k,v] of Object.entries(R.lawn))check(`Lawn ${k} (with bikes and houses): C, B and A in the same camera and frame`,v.same,{C:v.C.cam,B:v.B.cam});
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
  if(label==='models'){const man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));check('Package: PLAYTEST_MODELS=1 embeds the five vegetation files and hashes them in the manifest',['lm.old-oak','veg.street-trees','veg.shrubs','veg.ground','veg.lawn'].every(k=>!!man.sourceHashes['dist/assets/veg/'+k+'.glb']),{size:fs.statSync(file).size});}
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
