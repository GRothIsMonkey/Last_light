// Prologue pavement reconstruction (?pavement): checked in the real browser engine (Chromium, ANGLE SwiftShader:
// software rendering, NOT a GPU). One browser at a time.
//   A. the game without ?pavement: none of the pavement modules or textures is fetched; no pavement material exists;
//      the baseline (geometry fingerprint of every merged batch, shadow proxy and line batch; gameplay ground queries at
//      4,000 street points; obstacles and navigation shapes; two scripted rides over a curb and a driveway cut);
//   B. ?pavement: the six textures load (mipmaps, anisotropy, real-world scale); every pavement batch carries its street
//      coordinates; the geometry is the baseline's exactly (but for the soil faces closing the lawn step beside driveway
//      aprons); the gameplay queries, obstacles, navigation shapes and the two rides are identical; no gap and no floating
//      surface at the junctions and the cul-de-sac (rays from above); the O key; the same-frame before/after captures
//      and their cost; the Prologue-only rule: past the Prologue the original surfaces show, and in Aftermath I the
//      street's damage (Chapter Eight's cuts) still cuts the pavement materials even with the reconstruction forced on;
//   C. ?bikes&houses&vegetation&pavement: the four benchmarks together; the repaired lawn's masks are the same as
//      without ?pavement (same lawn cells built in the same chunks);
//   D. the offline package (file://, browser offline): PLAYTEST_MODELS=1 (?pavement from the embedded textures, no
//      network) and the default package (?pavement fails loudly, nothing substituted).
// usage: node tests/pavement-browser.mjs [outDir=docs/qa/pavement/browser]   (PARTS=A,B,C,D; SHOTS=0 to skip images)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/pavement/browser');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C,D').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const commit=(()=>{try{return execFileSync('git',['rev-parse','--short','HEAD']).toString().trim();}catch{return null;}})();
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',commit,started:new Date().toISOString(),viewport:'1600x900, deviceScaleFactor 1',checks:[],failures:[],parts:{},shots:[],pairs:[]};
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push(detail===undefined?name:{name,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail).slice(0,600):''));return ok;};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,1)+'\n');
const root=path.resolve('dist'),types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json',jpg:'image/jpeg',png:'image/png'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const shot=async(page,name,meta)=>{if(!SHOTS)return null;const f=path.join(out,name+'.jpg');await page.screenshot({path:f,type:'jpeg',quality:90,timeout:480000});const rec={file:path.relative(process.cwd(),f),sha256:sha(f),...(meta||{})};report.shots.push(rec);return rec;};
async function withPage(fn,{viewport={width:1600,height:900},offline=false}={}){
 const browser=await pw.chromium.launch({headless:true,args:ARGS});const ctx=await browser.newContext({viewport,deviceScaleFactor:1,offline});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,1500));});page.on('request',q=>requests.push(q.url()));
 try{return await fn(page,{errors,requests});}finally{await browser.close();}}
const open=async(page,flags,url=null)=>{await page.goto(url||(base+'/index.html?qa'+(flags?'&'+flags:'')),{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});};
const waitPave=page=>page.waitForFunction(()=>window.__pavement||/FAILED/.test(document.getElementById('pavement-benchmark-label')?.textContent||''),null,{timeout:300000});
const startRide=page=>page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';});

// ------------------------------------------------------------------------------------------------ in-page measures
// a fingerprint of every merged batch, shadow proxy and line batch: the multiset of their vertex positions (mm), summed
// with an order-free 32-bit hash, and the triangle counts; batches of a given material can be left out (the soil faces)
const FINGERPRINT=`(skip)=>{const L=lastLight,W=L.world;const acc={tris:0,verts:0,h1:0,h2:0},prox={tris:0,h1:0},lines={segs:0,h1:0};
 const hv=(x,y,z)=>{let h=Math.imul(Math.round(x*1000)|0,73856093)^Math.imul(Math.round(y*1000)|0,19349663)^Math.imul(Math.round(z*1000)|0,83492791);h=Math.imul(h^(h>>>15),2246822519);return (h^(h>>>13))>>>0;};
 for(const m of W.merged){if(skip&&m.material?.userData?.pvSoil)continue;const p=m.geometry.attributes.position.array;acc.tris+=p.length/9;acc.verts+=p.length/3;for(let i=0;i<p.length;i+=3){const h=hv(p[i],p[i+1],p[i+2]);acc.h1=(acc.h1+h)>>>0;acc.h2=(acc.h2+Math.imul(h,2654435761)>>>0)>>>0;}}
 for(const m of W.shadowProxies){const p=m.geometry.attributes.position.array;prox.tris+=p.length/9;for(let i=0;i<p.length;i+=3)prox.h1=(prox.h1+hv(p[i],p[i+1],p[i+2]))>>>0;}
 L.scene.traverse(o=>{if(!o.isLineSegments||o.parent!==L.scene)return;const p=o.geometry.attributes.position.array;lines.segs+=p.length/6;for(let i=0;i<p.length;i+=3)lines.h1=(lines.h1+hv(p[i],p[i+1],p[i+2]))>>>0;});
 return {merged:acc,proxies:prox,lines,mergedCount:W.merged.length,proxyCount:W.shadowProxies.length};}`;
// gameplay ground queries at street points: the authored surface, rideability, the ground the player stands on
const QUERIES=`async()=>{const W=lastLight.world;const {JUNCTIONS}=await import('./layout.js');const out=[];let h=0;
 const push=v=>{const s=typeof v==='boolean'?(v?1:0):Math.round(v*10000);h=(Math.imul(h^s,16777619)+1)>>>0;out.length<12&&out.push(v);};
 for(let d=-420;d<1180;d+=0.83)for(const lat of [-8.1,-7.3,-6.4,-5.3,-4.9,-4.6,-3.1,-0.4,1.7,4.5,4.75,5.05,6.2,6.9,7.8,9.4]){push(W.surfaceY(d,lat));push(W.rideable(d,lat));push(W.groundY(d,lat));push(W.authoredY(d,lat));}
 return {n:Math.round(1600/0.83)*16,hash:h,obstacles:W.obstacles.length,space:['walk','porch','house','tree','fence','driveway','pole'].map(t=>W.space?.items(t).length),drives:W.drivewayOpenings.length};}`;
// a scripted ride (fixed steps): from the lane over a driveway cut onto the walk, and straight into a plain curb
const RIDES=`()=>{const L=lastLight,W=L.world;const ds=W.drivewayOpenings.filter(o=>o.side===1&&o.d>700).sort((a,b)=>a.d-b.d);const o=ds[0];const runs={};
 const run=(name,d,lat,keys,sec)=>{L.release('KeyW');L.release('KeyD');L.release('KeyA');L.place(d,lat,3.2);for(const k of keys)L.press(k);const tr=[];for(let i=0;i<sec*30;i++){L.step(1/30);if(i%6===0){const s=L.state;tr.push([+s.distance.toFixed(4),+s.lateral.toFixed(4),+s.speed.toFixed(4),+L.playerBike.group.position.y.toFixed(4)]);}}for(const k of keys)L.release(k);runs[name]=tr;};
 run('cut',o.d-3.2,2.6,['KeyW','KeyD'],3.5);run('curb',(o.d+o.d1)/2+9,3.1,['KeyW','KeyD'],3);return {drive:{d:o.d,d0:o.d0,d1:o.d1},runs};}`;
// rays from above over the junction corners and the cul-de-sac: what is hit, and how far from the authored surface
const GAPS=`async()=>{const L=lastLight,W=L.world,T=window.__pavement?.THREE||(await import('./three.module.js'));const R=await import('./route.js');const {CURB_TOP}=await import('./terrain.js');const rc=new T.Raycaster();rc.layers.set(0);rc.far=8;
 // (samples are offset from the meshes' own vertex lines, so a ray never runs exactly down a shared edge; the curb's
 // rounded face and nose are visual, the game's ground model treats the curb as a 15 cm step: within 0.35 m of a curb
 // only "something is there, not the base ground" is asked)
 const res={samples:0,none:0,base:0,off:0,worst:[],kinds:{}};
 const curbNear=(d,lat)=>{for(const e of [-.35,0,.35])for(const f of [-.35,0,.35])if(Math.abs(W.surfaceY(d+e,lat+f)-CURB_TOP)<1e-6)return true;return false;};
 let near=W.merged;const region=(d,lat,r)=>{const c=R.groundPoint(d,lat),v=new T.Vector3(c.x,c.y,c.z);near=W.merged.filter(m=>{const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();return g.boundingSphere.center.distanceTo(v)<g.boundingSphere.radius+r;});};
 const probe=(d,lat)=>{const g=R.groundPoint(d,lat);rc.set(new T.Vector3(g.x,g.y+4,g.z),new T.Vector3(0,-1,0));const hits=rc.intersectObjects(near,false).filter(h=>h.object.visible);const hit=hits[0];res.samples++;
  if(!hit){res.none++;res.worst.length<14&&res.worst.push({d:+d.toFixed(3),lat:+lat.toFixed(3),none:true});return;}
  const m=hit.object.material,k=m.userData.pvKind||(m.userData.pvSoil?'soil':'other');res.kinds[k]=(res.kinds[k]||0)+1;
  const want=g.y+W.surfaceY(d,lat),y=hit.point.y,dy=y-want;
  if(y<g.y-.02){res.base++;res.worst.length<14&&res.worst.push({d:+d.toFixed(3),lat:+lat.toFixed(3),base:+(y-g.y).toFixed(3)});}
  else if(Math.abs(dy)>.035&&k!=='iron'&&!curbNear(d,lat)){res.off++;res.worst.length<14&&res.worst.push({d:+d.toFixed(3),lat:+lat.toFixed(3),kind:k,dy:+dy.toFixed(3)});}};
 for(const jd of [595,870]){const s=jd===595?1:-1;region(jd,s*4,22);for(let d=jd-14.013;d<=jd+14;d+=.31)for(let a=.0071;a<=7.8;a+=.27)probe(d,s*a);}
 region(1130,0,40);for(let d=1100.017;d<=1156;d+=.37)for(let lat=-13.493;lat<=13.5;lat+=.37){const r=Math.hypot(d-1142,lat);if(d>1131&&r>11+3.3)continue;if(d<=1131&&Math.abs(lat)>7.9)continue;probe(d,lat);}
 return res;}`;

const look=(page,v)=>page.evaluate(v=>{const L=lastLight;let s=v;
 if(v.drive){const ds=L.world.drivewayOpenings.filter(o=>o.side===v.drive.side&&o.d>v.drive.after).sort((a,b)=>a.d-b.d);const o=ds[v.drive.k||0];s={...v,d:(v.drive.edge==='d0'?o.d0:o.d)+(v.dd??0),lat:v.lat};}
 if(v.lamp){const ls=L.ambient.lamps().filter(l=>l.frame==='main'||l.frame===undefined).filter(l=>l.d>v.lamp.after).sort((a,b)=>a.d-b.d);const l=ls[0];s={...v,d:l.d+(v.dd??-7),lat:v.lat??Math.sign(l.lat)*-.5};}
 L.place(s.d,s.lat,0);for(let i=0;i<(v.settle||4);i++)L.step(1/30);L.look(s.yaw||0,s.pitch||0);L.step(1/30);return {d:+s.d.toFixed(2),lat:+s.lat.toFixed(2)};},v);
const frame=page=>page.evaluate(()=>{window.__vegetation?.tick?.();window.__houses?.tick?.();window.__bikes?.tick?.();const i=lastLight.render();const c=lastLight.camera;
 return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4)),fov:c.fov},clock:document.getElementById('date')?.textContent||null};});
// an honest before/after: one frame, one camera, O's two modes
async function pair(page,v,flags){const at=await look(page,v);
 if(v.flash)await page.evaluate(()=>{const L=lastLight,F=L.foot,c=L.camera,T=__pavement.THREE;F.attach(true);const d=new T.Vector3();c.getWorldDirection(d);F.light.intensity=24;F.light.angle=.31;F.light.position.copy(c.position).add(new T.Vector3(.18,-.25,0));F.light.target.position.copy(c.position).addScaledVector(d,6);F.light.target.updateMatrixWorld();});
 await page.evaluate(()=>__pavement.setMode('reconstructed'));const a=await frame(page);const A=await shot(page,`${v.n}--reconstructed`,{kind:'game-renderer capture',camera:v.cam||'gameplay riding camera (QA placement)',mode:'reconstructed',flags,view:v,at,...a});
 await page.evaluate(()=>__pavement.setMode('original'));const b=await frame(page);const B=await shot(page,`${v.n}--original`,{kind:'game-renderer capture',camera:v.cam||'gameplay riding camera (QA placement)',mode:'original',flags,view:v,at,...b});
 await page.evaluate(()=>__pavement.setMode('reconstructed'));
 if(v.flash)await page.evaluate(()=>{const F=lastLight.foot;F.light.intensity=0;F.attach(false);});
 const same=JSON.stringify(a.cam)===JSON.stringify(b.cam);
 report.pairs.push({name:v.n,what:v.what,flags,camera:a.cam,at,clock:a.clock,sameCamera:same,reconstructed:{calls:a.calls,triangles:a.triangles},original:{calls:b.calls,triangles:b.triangles},files:[A?.file,B?.file]});save();return {a,b,same};}

// the comparisons asked for (P12, P17, P19, P20 need the authored lawn, trees, houses and bikes: part C)
const VIEWS_B=[
 {n:'P01-asphalt-beneath-the-bike',what:'asphalt directly beneath the player while riding',d:40,lat:-1.2,pitch:-.8},
 {n:'P02-road-ahead-from-the-bike',what:'the road looking forward from bicycle height',d:60,lat:-1.5,pitch:-.12},
 {n:'P03-long-view-down-oak-hollow',what:'a long view down Oak Hollow Drive',d:300,lat:-1.0,pitch:-.04},
 {n:'P04-asphalt-close-detail',what:'a close asphalt detail: a repaired manhole, a sealed crack',d:82.5,lat:-1.1,pitch:-.8},
 {n:'P05-asphalt-meets-gutter',what:'asphalt meeting the concrete gutter pan',d:150,lat:3.5,yaw:-.75,pitch:-.6},
 {n:'P06-sidewalk-from-standing-height',what:'sidewalk concrete (riding camera on the walk, eye about 1.5 m)',d:44,lat:7.1,pitch:-.35},
 {n:'P07-sidewalk-joints-close',what:'sidewalk joints from close range',d:44,lat:7.1,pitch:-.9},
 {n:'P08-curb-face-from-the-bike',what:'the curb face from bicycle height',d:40,lat:3.4,yaw:-1.25,pitch:-.32},
 {n:'P09-driveway-curb-cut',what:'a driveway curb cut from street level',drive:{side:1,after:100},dd:-3.5,lat:3.6,yaw:-1.0,pitch:-.35},
 {n:'P10-a-whole-driveway',what:'a complete residential driveway',drive:{side:1,after:100},dd:0,lat:2.2,yaw:-1.5,pitch:-.14},
 {n:'P11-sidewalk-passing-a-driveway',what:'the sidewalk passing a driveway',drive:{side:1,after:100,edge:'d0'},dd:-5,lat:7.1,pitch:-.42},
 {n:'P13-briarwood-intersection',what:'the Briarwood Lane junction',d:572,lat:-.5,yaw:-.5,pitch:-.18},
 {n:'P14-summerfield-intersection',what:'the Summerfield Road junction',d:848,lat:.5,yaw:.5,pitch:-.18},
 {n:'P15-cul-de-sac-curb',what:'the curved cul-de-sac curb',d:1127,lat:2.0,yaw:-.9,pitch:-.3},
 {n:'P16-cul-de-sac-and-lookout',what:'the cul-de-sac asphalt and the lookout',d:1112,lat:-.8,pitch:-.14},
 {n:'P18-streetlights-at-dusk',what:'streetlights on the pavement at dusk',lamp:{after:1000},dd:-8,lat:-.6,pitch:-.2,settle:150},
 {n:'P21-flashlight-on-the-pavement',what:'the game\'s flashlight on the pavement at the end of the evening (QA lighting test: the flashlight light switched on in the Prologue)',d:1118,lat:-3.2,yaw:-.6,pitch:-.45,flash:true,settle:150},
];
const VIEWS_C=[
 {n:'P12-sidewalk-and-lawn-boundary',what:'the sidewalk and the repaired lawn',d:120,lat:7.0,yaw:-.35,pitch:-.62},
 {n:'P17-golden-hour-shadows',what:'golden-hour shadows across the road',d:196,lat:-1.0,pitch:-.2},
 {n:'P19-houses-trees-and-pavement',what:'a wider scene with the refined houses and vegetation',d:96,lat:-2.2,yaw:.2,pitch:-.08},
 {n:'P20-the-boys-bikes-and-all-four',what:'the boys\' bicycles with all four upgraded systems',d:12,lat:-1.0,pitch:-.1,friends:true},
 {n:'P22-curb-cut-with-the-repaired-lawn',what:'a driveway apron and the repaired lawn',drive:{side:1,after:100},dd:-3.5,lat:3.6,yaw:-1.0,pitch:-.35},
];

// ---------------------------------------------------------------------------------------------------------------- A
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{await open(page,'');await startRide(page);
 const req=requests.filter(u=>/pavement-|assets\/pavement\//.test(u));
 check('Default game: without ?pavement none of the pavement modules or textures is fetched',req.length===0,req);
 const r=await page.evaluate(()=>({label:!!document.getElementById('pavement-benchmark-label'),pv:lastLight.world.merged.filter(m=>m.material?.userData?.pvKind!==undefined||m.geometry.attributes.pv).length,layout:lastLight.world.pavement,merged:lastLight.world.merged.length,proxies:lastLight.world.shadowProxies.length}));
 check('Default game: no pavement material, attribute or layout exists (the world is baked as before)',!r.label&&r.pv===0&&r.layout===null&&r.proxies===379,r);
 report.parts.A={...r,fingerprint:await page.evaluate(`(${FINGERPRINT})(false)`),queries:await page.evaluate(`(${QUERIES})()`),rides:await page.evaluate(`(${RIDES})()`),gaps:await page.evaluate(`(${GAPS})()`)};
 check('Default game: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- B
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{const R=report.parts.B={};const t0=Date.now();await open(page,'pavement');await waitPave(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>({error:__pavement.error,loadMs:__pavement.loadMs,info:__pavement.info,layout:__pavement.layout,stats:__pavement.stats()}));
 check('?pavement: the six pavement textures load without error',!R.loaded.error&&R.loaded.info?.files?.length===6,{error:R.loaded.error,loadMs:R.loaded.loadMs,files:R.loaded.info?.files});
 const tex=await page.evaluate(()=>{const P=__pavement.kit.PAVE;return ['asA','asN','asH','coA','coN','coH'].map(k=>{const t=P[k].value;return {k,w:t.image?.width,h:t.image?.height,mips:t.generateMipmaps,min:t.minFilter===__pavement.THREE.LinearMipmapLinearFilter,wrap:t.wrapS===__pavement.THREE.RepeatWrapping,aniso:t.anisotropy,space:t.colorSpace};});});
 check('?pavement: textures are 1024 x 1024, tiled, trilinear mipmapped, anisotropic, linear data',tex.every(t=>t.w===1024&&t.h===1024&&t.mips&&t.min&&t.wrap&&t.aniso>=4&&t.space===''||t.space==='NoColorSpace'),tex);
 const man=JSON.parse(fs.readFileSync('dist/assets/pavement/pavement-textures.json','utf8'));
 check('?pavement: real-world scale (asphalt 2.5 m per tile = 410 px/m; concrete 2.0 m = 512 px/m; the Art Bible asks 256-512 px/m)',man.materials.asphalt.stats.meters===2.5&&man.materials.concrete.stats.meters===2&&Math.abs(man.materials.asphalt.stats.px_per_m-409.6)<.1&&man.materials.concrete.stats.px_per_m===512,{asphalt:man.materials.asphalt.stats,concrete:man.materials.concrete.stats});
 const offsite=requests.filter(u=>!u.startsWith(base)&&!u.startsWith('data:')&&!u.startsWith('blob:'));check('?pavement: no request leaves the local server',offsite.length===0,offsite);
 // street coordinates on every pavement batch, and their scale against the world
 R.coords=await page.evaluate(async()=>{const W=lastLight.world,{MAIN}=await import('./terrain.js');const pave=W.merged.filter(m=>m.material.userData.pvKind!==undefined);let missing=0,bad=0,n=0,maxDu=0,maxDv=0;const kinds={};
  for(const m of pave){const g=m.geometry,uv=g.attributes.uv,pv=g.attributes.pv,k=m.material.userData.pvKind;kinds[k]=(kinds[k]||0)+1;if(!uv||!pv){missing++;continue;}
   for(let i=0;i<pv.count;i++){const a=[uv.getX(i),uv.getY(i),pv.getX(i),pv.getY(i),pv.getZ(i),pv.getW(i)];if(a.some(v=>!Number.isFinite(v))||Math.abs(Math.hypot(a[2],a[3])-1)>.02){bad++;}}
   if(k==='asphalt'){const p=g.attributes.position;for(let i=0;i<p.count;i+=97){if(pv.getW(i)!==0)continue;const d=uv.getY(i);if(d>1100||d<-425)continue;const q=MAIN.project(p.getX(i),p.getZ(i),d);n++;maxDu=Math.max(maxDu,Math.abs(q.u-d));maxDv=Math.max(maxDv,Math.abs(q.v-uv.getX(i)));}}}
  // the along scale of street coordinates against the world, at the asphalt edge (the micro-structure is in world metres: none)
  const R2=await import('./route.js');let worst=0;for(let d=-420;d<1120;d+=2)for(const lat of [-4.32,4.32]){const a=R2.groundPoint(d,lat),b=R2.groundPoint(d+.5,lat);worst=Math.max(worst,Math.abs(Math.hypot(b.x-a.x,b.z-a.z)/.5-1));}
  return {batches:pave.length,kinds,missing,bad,samples:n,maxDu:+maxDu.toFixed(4),maxDv:+maxDv.toFixed(4),alongScaleWorstAtEdge:+worst.toFixed(4)};});
 check('?pavement: every pavement batch carries finite street coordinates (uv) and a unit along-direction (pv)',R.coords.missing===0&&R.coords.bad===0&&R.coords.batches>150,R.coords);
 check('?pavement: on Oak Hollow Drive the asphalt\'s coordinates are the street\'s own (u within 5 cm of d, v within 5 cm of the lateral offset)',R.coords.samples>200&&R.coords.maxDu<.05&&R.coords.maxDv<.05,R.coords);
 check('?pavement: no UV stretch at bends: micro-structure in world metres; street-coordinate features within 6 % of true length at the asphalt edge on the tightest bend',R.coords.alongScaleWorstAtEdge<.06,R.coords);
 // geometry, gameplay, collisions: the baseline's
 await startRide(page);
 R.fingerprint=await page.evaluate(`(${FINGERPRINT})(true)`);const F0=report.parts.A?.fingerprint;
 const soil=await page.evaluate(()=>{let t=0,n=0;for(const m of lastLight.world.merged)if(m.material?.userData?.pvSoil){n++;t+=m.geometry.attributes.position.count/3;}return {batches:n,tris:t};});R.soil=soil;
 check('Geometry: every merged surface, shadow proxy and line has exactly the default game\'s vertices (positions hashed at 1 mm), but for the soil faces added beside driveway aprons',F0&&R.fingerprint.merged.h1===F0.merged.h1&&R.fingerprint.merged.h2===F0.merged.h2&&R.fingerprint.merged.tris===F0.merged.tris&&R.fingerprint.proxies.h1===F0.proxies.h1&&R.fingerprint.proxies.tris===F0.proxies.tris&&R.fingerprint.lines.h1===F0.lines.h1,{with:R.fingerprint,without:F0,soil});
 R.queries=await page.evaluate(`(${QUERIES})()`);const Q0=report.parts.A?.queries;
 check('Gameplay: surface heights, rideability, standing ground and authored pads at '+(Q0?.n||0)+' street points are identical; obstacles, navigation shapes and driveway openings unchanged',Q0&&R.queries.hash===Q0.hash&&R.queries.obstacles===Q0.obstacles&&JSON.stringify(R.queries.space)===JSON.stringify(Q0.space)&&R.queries.drives===Q0.drives,{with:R.queries,without:Q0});
 R.rides=await page.evaluate(`(${RIDES})()`);const RD0=report.parts.A?.rides;
 check('Riding: a scripted ride over a driveway cut onto the walk, and one into a plain curb, follow exactly the same path, speed and wheel height',RD0&&JSON.stringify(R.rides)===JSON.stringify(RD0),{cut:R.rides.runs.cut.slice(-2),curb:R.rides.runs.curb.slice(-2),without:RD0&&{cut:RD0.runs.cut.slice(-2),curb:RD0.runs.curb.slice(-2)}});
 R.gaps=await page.evaluate(`(${GAPS})()`);const G0=report.parts.A?.gaps;
 check('Junctions and cul-de-sac: rays from above find a surface everywhere, never the base ground, and every surface within 3.5 cm of the authored height away from the curbs (no gaps, no floating or sunken surfaces; the same as without ?pavement)',R.gaps.none===0&&R.gaps.base===0&&R.gaps.off===0&&G0&&G0.none===R.gaps.none&&G0.base===R.gaps.base&&G0.off===R.gaps.off,{with:R.gaps,without:G0&&{none:G0.none,base:G0.base,off:G0.off}});
 check('?pavement (measures): no page errors',errors.length===0,errors);save();});
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{const R=report.parts.B;await open(page,'pavement');await waitPave(page);await startRide(page);
 // the comparison key
 R.key=await page.evaluate(()=>{const P=__pavement.kit.PAVE,W=lastLight.world;const jb=()=>W.merged.filter(m=>m.material.userData.pvToggle==='original').every(m=>m.visible);const r=[];
  const k=()=>dispatchEvent(Object.assign(new Event('keydown'),{code:'KeyO'}));r.push([__pavement.mode,P.on.value,jb()]);k();__pavement.tick();r.push([__pavement.mode,P.on.value,jb()]);k();__pavement.tick();r.push([__pavement.mode,P.on.value,jb()]);return r;});
 check('Comparison: O swaps RECONSTRUCTED (shader on, old decal patches / joint bars / crack lines hidden) and ORIGINAL (shader off, all shown) in the same frame',JSON.stringify(R.key)===JSON.stringify([['reconstructed',1,false],['original',0,true],['reconstructed',1,false]]),R.key);
 // same-frame captures
 for(const v of VIEWS_B){const r=await pair(page,v,'qa&pavement');if(!r.same)check('Same camera: '+v.n,false,r);}
 check('Captures: every before/after pair is one camera and one frame',report.pairs.filter(p=>p.flags==='qa&pavement').every(p=>p.sameCamera),report.pairs.length);
 const P=report.pairs.filter(p=>p.flags==='qa&pavement'),dc=P.map(p=>p.reconstructed.calls-p.original.calls),dt=P.map(p=>p.reconstructed.triangles/p.original.triangles);
 R.cost={drawCallDelta:[Math.min(...dc),Math.max(...dc)],triangleRatio:[+Math.min(...dt).toFixed(3),+Math.max(...dt).toFixed(3)]};
 check('Cost: in every pair the reconstruction draws no more draw calls than the original and at most 1 % more triangles (the soil faces)',dc.every(x=>x<=0)&&dt.every(x=>x<1.01),R.cost);
 // software frame time, the same frame, both modes (SwiftShader: NOT a GPU measurement)
 R.frameMs=await page.evaluate(()=>{const L=lastLight;L.place(300,-1,0);for(let i=0;i<4;i++)L.step(1/30);L.look(0,-.06);const t={};for(const m of ['reconstructed','original']){__pavement.setMode(m);L.render();const t0=performance.now();for(let i=0;i<5;i++)L.render();t[m]=+((performance.now()-t0)/5).toFixed(1);}__pavement.setMode('reconstructed');return t;});
 R.memory=await page.evaluate(()=>{const i=__pavement.info,l=__pavement.layout;return {textures:i.files.length,gpuTextureMB:i.gpuMB,layoutTextureBytes:l.layoutBytes,driveTableBytes:1024,renderer:{...lastLight.renderer.info.memory},programs:lastLight.renderer.info.programs?.length};});
 check('?pavement: no page errors (every pavement shader compiles and links)',errors.length===0,errors);
 // the Prologue only: a later chapter shows the original surfaces; Aftermath I's damaged street still cuts the pavement
 R.chapters=await page.evaluate(()=>{const L=lastLight,P=__pavement.kit.PAVE,r={};L.devScene(1,'title');for(let i=0;i<10;i++)L.step(1/30);__pavement.tick();r.chapterOne={active:__pavement.active,on:P.on.value,state:L.state.state};return r;});
 check('Prologue only: in Chapter One the original surfaces show (the reconstruction is inactive)',R.chapters.chapterOne.active===false&&R.chapters.chapterOne.on===0,R.chapters);
 save();});
if(PARTS.includes('B'))await withPage(async(page,{errors})=>{const R=report.parts.B2={};await open(page,'pavement');await waitPave(page);
 R.a1=await page.evaluate(()=>{const L=lastLight,P=__pavement.kit.PAVE;L.devScene(9,'a1-return');for(let i=0;i<20;i++)L.step(1/30);__pavement.tick();
  const pave=L.world.merged.filter(m=>m.material.userData.pvKind!==undefined),keys=[...new Set(pave.map(m=>m.material.customProgramCacheKey()))];
  return {active:__pavement.active,on:P.on.value,state:L.state.state,keys,allCut:keys.every(k=>k.includes('|c8cut'))};});
 check('Aftermath I: the reconstruction is inactive, and Chapter Eight\'s ground cuts are installed on every pavement material',R.a1.active===false&&R.a1.on===0&&R.a1.allCut,R.a1);
 // the damaged street from the Drive's trench (d 1047-1095): the original shader and the reconstruction forced on show the same holes
 R.trench=await page.evaluate(async()=>{const L=lastLight,P=__pavement.kit.PAVE,R=await import('./route.js');const g=R.groundPoint(1033,-2.4),a=R.heading(1033);L.placePlayer({x:g.x,z:g.z,a,mode:'walk'});L.face(a,-.32);for(let i=0;i<3;i++)L.step(1/30);L.face(a,-.32);
  const px=()=>{L.render();const cv=L.renderer.domElement,gl=L.renderer.getContext(),w=cv.width,h=cv.height,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);return {w,h,a};};
  P.on.value=0;const o=px();P.on.value=1;const f=px();P.on.value=0;let diff=0,dark0=0,dark1=0;for(let i=0;i<o.a.length;i+=4){const l0=o.a[i]+o.a[i+1]+o.a[i+2],l1=f.a[i]+f.a[i+1]+f.a[i+2];if(Math.abs(l0-l1)>24)diff++;if(l0<40)dark0++;if(l1<40)dark1++;}
  return {pixels:o.a.length/4,changed:diff,darkOriginal:dark0,darkForced:dark1,state:L.state.state};});
 report.notes=(report.notes||[]).concat(['Aftermath I trench frame: reconstruction forced on vs the original shader: '+JSON.stringify(R.trench)]);
 if(SHOTS){await page.evaluate(()=>{__pavement.kit.PAVE.on.value=1;lastLight.render();});await shot(page,'P23-aftermath1-damage-with-the-flag--forced-on',{kind:'game-renderer capture',camera:'Aftermath I scene camera (DEV scene start)',mode:'reconstruction forced on for this test only (in play it is off outside the Prologue)'});
  await page.evaluate(()=>{__pavement.kit.PAVE.on.value=0;lastLight.render();});await shot(page,'P23-aftermath1-damage-with-the-flag--as-played',{kind:'game-renderer capture',camera:'Aftermath I scene camera (DEV scene start)',mode:'as played with ?pavement: original surfaces'});}
 check('Aftermath I with ?pavement: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- C
const lawnCells=`async()=>{const V=window.__vegetation?.handle;if(!V)return null;const B=V.lawn2?.blades||V.lawn?.blades;if(!B?.buildChunk)return {noApi:true};const W=lastLight.world;const R=await import('./route.js');const out=[];
 for(const d of [40,104,150,572,848,1110]){const g=R.groundPoint(d,6);const cx=Math.floor(g.x/16),cz=Math.floor(g.z/16);const cells=B.buildChunk(cx,cz);out.push([d,cells.length]);}return out;}`;
if(PARTS.includes('C'))await withPage(async(page,{errors})=>{await open(page,'vegetation');await page.waitForFunction(()=>window.__vegetation,null,{timeout:400000});report.parts.Cbase={lawn:await page.evaluate(`(${lawnCells})()`)};save();});
if(PARTS.includes('C'))await withPage(async(page,{errors,requests})=>{const R=report.parts.C={};const flags='bikes&houses&vegetation&pavement';await open(page,flags);
 await page.waitForFunction(()=>window.__vegetation&&window.__houses&&window.__bikes&&window.__pavement,null,{timeout:600000});
 R.loaded=await page.evaluate(()=>({pavement:__pavement.error,veg:__vegetation.error,houses:__houses.error,lawn:__vegetation.lawnMode}));
 check('All four benchmarks together (?bikes&houses&vegetation&pavement) load without error; the lawn is the repair (C)',!R.loaded.pavement&&!R.loaded.veg&&!R.loaded.houses&&R.loaded.lawn==='C',R.loaded);
 R.lawn=await page.evaluate(`(${lawnCells})()`);
 check('Lawn: the repaired lawn\'s masks build the same lawn cells in the same chunks as without ?pavement (grass boundaries unchanged)',JSON.stringify(R.lawn)===JSON.stringify(report.parts.Cbase?.lawn)&&Array.isArray(R.lawn),{with:R.lawn,without:report.parts.Cbase?.lawn});
 await startRide(page);
 for(const v of VIEWS_C){if(v.friends){await page.evaluate(()=>{const L=lastLight;L.reset?.();L.start();for(let i=0;i<150;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';});
   const r=await pair(page,{...v,d:await page.evaluate(()=>lastLight.state.distance),lat:await page.evaluate(()=>lastLight.state.lateral)},flags);continue;}
  await pair(page,v,flags);}
 check('Four benchmarks: no page errors; riding works with them all on',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- D
if(PARTS.includes('D')){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pave-pkg-')),pm=path.join(tmp,'models'),pd=path.join(tmp,'default');
 execFileSync('node',['tools/package-playtest.mjs',pm],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:'1'},stdio:'inherit'});
 execFileSync('node',['tools/package-playtest.mjs',pd],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:''},stdio:'inherit'});
 const entry=d=>fs.readdirSync(d).find(f=>/\.html$/.test(f)&&!/Lab/.test(f));
 const mf=JSON.parse(fs.readFileSync(path.join(pm,'manifest.json'),'utf8'));const embedded=Object.keys(mf.sourceHashes).filter(k=>/assets\/pavement\//.test(k));
 check('Offline package (PLAYTEST_MODELS=1): the six pavement textures and the pavement modules are embedded',embedded.length===6&&mf.sourceHashes['dist/pavement-surfaces.js']&&mf.sourceHashes['dist/pavement-benchmark.js'],embedded);
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pm,entry(pm))).href+'?qa&pavement');await waitPave(page);
  const r=await page.evaluate(()=>({error:__pavement.error,files:__pavement.info?.files?.length,active:__pavement.active}));const net=requests.filter(u=>/^https?:/.test(u));
  check('Offline package from disk, browser offline: ?pavement loads its textures from the embedded bytes, with no network request',!r.error&&r.files===6&&net.length===0,{...r,net});
  check('Offline package: no page errors',errors.length===0,errors);},{offline:true});
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pd,entry(pd))).href+'?qa&pavement');await waitPave(page);
  const r=await page.evaluate(()=>({error:__pavement.error,on:__pavement.kit.PAVE.on.value,label:document.getElementById('pavement-benchmark-label')?.textContent}));
  check('Default package (no models): ?pavement fails loudly and substitutes nothing (the original surfaces stay)',!!r.error&&/not embedded/.test(r.error)&&r.on===0,r);},{offline:true});
 fs.rmSync(tmp,{recursive:true,force:true});save();}

report.finished=new Date().toISOString();save();server.close();
console.log(`\n${report.checks.length} passed, ${report.failures.length} failed`);process.exit(report.failures.length?1:0);
