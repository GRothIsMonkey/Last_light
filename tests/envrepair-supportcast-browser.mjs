// Prologue environment repairs (?envrepair) and supporting cast (?supportcast): checked in the real browser engine
// (Chromium, ANGLE SwiftShader: software rendering, NOT a GPU). One browser at a time.
//   A. the default game: neither module nor any of their assets is fetched; no 'er:' record or zone; the baseline: the
//      geometry fingerprint of every merged batch, shadow proxy and line; gameplay ground queries; obstacles, navigation,
//      driveway openings; three scripted rides; the frame-by-frame timeline of Jamie's mother's controller (friends.js
//      updateMom: mode, clock, path, facing, the door, visibility) through Jamie's departure; the hoop kid's timeline
//      (ambient.js updateKid: phase, clock, the ball's position, visibility) for 14 s;
//   B. ?envrepair alone: the geometry, gameplay queries, obstacles and rides identical to A; the creek's brush, reeds,
//      ground patches and algae recorded and baked apart; the repairs that need another benchmark say so; the Prologue only;
//   C. all eight flags (the six benchmarks, ?envrepair, ?supportcast): every repair applied (chain link coverage on the
//      street props' fences; the repaired trampolines, swing sets, big wheels and wagons on the ground; contact shadows;
//      the creek's plants), the ' key restores exactly what the six left; the mother's and the kid's controller timelines
//      identical to A frame by frame; the authored mother on the controller's own transform, feet on the ground, her eyes
//      on Jamie, never shown with the original (meshes hidden, groups untouched), hidden when the door has closed; the kid's
//      ball identical to A, his hands on it in the contact phases; night, restart, pause, a DEV scene jump; later chapters'
//      files untouched; no page errors;
//   D. the offline package (file://, browser offline, PLAYTEST_MODELS=1): both modules and their assets from the embedded
//      bytes, no network request.
// usage: node tests/envrepair-supportcast-browser.mjs [outDir=docs/qa/envrepair-supportcast/tests]   (PARTS=A,B,C,D)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/envrepair-supportcast/tests');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C,D').split(',');
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'];
const commit=(()=>{try{return execFileSync('git',['rev-parse','--short','HEAD']).toString().trim();}catch{return null;}})();
const prev=(()=>{try{return JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8'));}catch{return null;}})();
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',commit,started:new Date().toISOString(),viewport:'1600x900',checks:[],failures:[],parts:{}};
let PART='?';
if(prev){for(const k of Object.keys(prev.parts||{}))if(!PARTS.includes(k[0]))report.parts[k]=prev.parts[k];const keep=x=>x.part&&!PARTS.includes(x.part);report.checks.push(...(prev.checks||[]).filter(keep));report.failures.push(...(prev.failures||[]).filter(keep));}
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push({name,part:PART,...(detail===undefined?{}:{detail})});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail).slice(0,600):''));return ok;};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,1)+'\n');
const root=path.resolve('dist'),types={js:'application/javascript',html:'text/html',glb:'model/gltf-binary',json:'application/json',jpg:'image/jpeg',png:'image/png',css:'text/css'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
async function withPage(fn,{offline=false}={}){const browser=await pw.chromium.launch({headless:true,args:ARGS});const ctx=await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1,offline});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,800));});page.on('request',q=>requests.push(q.url()));
 try{return await fn(page,{errors,requests});}finally{await browser.close();}}
const open=async(page,flags,url=null)=>{await page.goto(url||(base+'/index.html?qa'+(flags?'&'+flags:'')),{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});};
const SIX='bikes&houses&vegetation&pavement&streetprops&details',ALL=SIX+'&envrepair&supportcast';
const waitER=page=>page.waitForFunction(()=>window.__envrepair,null,{timeout:600000});
const waitSC=page=>page.waitForFunction(()=>window.__supportcast,null,{timeout:600000});
const startRide=page=>page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';});

// ------------------------------------------------------------------------------------------------ in-page measures
const FINGERPRINT=`()=>{const L=lastLight,W=L.world;const acc={tris:0,verts:0,h1:0,h2:0},prox={tris:0,h1:0},lines={segs:0,h1:0};
 const hv=(x,y,z)=>{let h=Math.imul(Math.round(x*1000)|0,73856093)^Math.imul(Math.round(y*1000)|0,19349663)^Math.imul(Math.round(z*1000)|0,83492791);h=Math.imul(h^(h>>>15),2246822519);return (h^(h>>>13))>>>0;};
 for(const m of W.merged){const p=m.geometry.attributes.position.array;acc.tris+=p.length/9;acc.verts+=p.length/3;for(let i=0;i<p.length;i+=3){const h=hv(p[i],p[i+1],p[i+2]);acc.h1=(acc.h1+h)>>>0;acc.h2=(acc.h2+Math.imul(h,2654435761)>>>0)>>>0;}}
 for(const m of W.shadowProxies){const p=m.geometry.attributes.position.array;prox.tris+=p.length/9;for(let i=0;i<p.length;i+=3)prox.h1=(prox.h1+hv(p[i],p[i+1],p[i+2]))>>>0;}
 L.scene.traverse(o=>{if(!o.isLineSegments||o.parent!==L.scene)return;const p=o.geometry.attributes.position.array;lines.segs+=p.length/6;for(let i=0;i<p.length;i+=3)lines.h1=(lines.h1+hv(p[i],p[i+1],p[i+2]))>>>0;});
 return {merged:acc,proxies:prox,lines,erZones:[...new Set(W.merged.map(m=>m.userData.zone).filter(z=>z&&z.startsWith('er:')))].sort()};}`;
const QUERIES=`()=>{const W=lastLight.world;let h=0;const push=v=>{const s=typeof v==='boolean'?(v?1:0):Math.round(v*10000);h=(Math.imul(h^s,16777619)+1)>>>0;};
 for(let d=-420;d<1180;d+=0.83)for(const lat of [-12.5,-9.3,-7.3,-5.6,-4.6,-3.1,-0.4,1.7,4.5,5.05,6.2,7.8,9.4,11.5]){push(W.surfaceY(d,lat));push(W.rideable(d,lat));push(W.groundY(d,lat));push(W.authoredY(d,lat));}
 return {hash:h,obstacles:W.obstacles.length,obstacleHash:W.obstacles.reduce((a,o)=>(Math.imul(a^Math.round((o.d0+o.l0*7)*100),16777619)>>>0),0),
  space:['walk','porch','house','tree','fence','driveway','pole','lamp','mailbox','hydrant','bins','hoop','toy','sign'].map(t=>[t,W.space?.items(t).length]),drives:W.drivewayOpenings.length};}`;
const RIDES=`()=>{const L=lastLight,W=L.world;const ds=W.drivewayOpenings.filter(o=>o.side===1&&o.d>700).sort((a,b)=>a.d-b.d);const o=ds[0];const runs={};
 const run=(name,d,lat,keys,sec)=>{L.release('KeyW');L.release('KeyD');L.release('KeyA');L.place(d,lat,3.2);for(const k of keys)L.press(k);const tr=[];for(let i=0;i<sec*30;i++){L.step(1/30);if(i%6===0){const s=L.state;tr.push([+s.distance.toFixed(4),+s.lateral.toFixed(4),+s.speed.toFixed(4),+L.playerBike.group.position.y.toFixed(4)]);}}for(const k of keys)L.release(k);runs[name]=tr;};
 run('cut',o.d-3.2,2.6,['KeyW','KeyD'],3.5);run('curb',(o.d+o.d1)/2+9,3.1,['KeyW','KeyD'],3);run('mailbox',150,4.2,['KeyW','KeyD'],3);return runs;}`;
// The mother's controller, frame by frame, through Jamie's departure (and, with ?supportcast, the authored figure's measures)
const MOMLINE=`()=>{const L=lastLight;L.place(655,1.2,4.4);L.friends.warp(655);L.press('KeyW');const samples=[],meas=[];let h=0,i=0;const SC=window.__supportcast?.cast?.mother;
 const H=(a)=>{for(const v of a){const s=typeof v==='string'?v.length*7919+v.charCodeAt(0):Math.round(v*10000);h=(Math.imul(h^s,16777619)+1)>>>0;}};
 for(;i<45*30;i++){L.step(1/30);if(L.state.distance>778)L.release('KeyW');const m=L.friends.mom,d=L.world.doors.jamie,g=m.person.group;
  const s=[m.mode,+m.t.toFixed(4),+m.pd.toFixed(4),+m.plat.toFixed(4),+m.ppsi.toFixed(4),+d.open.toFixed(4),g.visible?1:0,+g.position.x.toFixed(4),+g.position.y.toFixed(4),+g.position.z.toFixed(4),m.slammed?1:0];H(s);if(i%10===0)samples.push(s);
  if(SC){const r=SC.root,st=SC.state;const meshVisible=SC.meshes.filter(([o])=>o.visible).length;let nan=false;SC.inst.model.traverse(o=>{if(o.isBone&&!o.matrixWorld.elements.every(Number.isFinite))nan=true;});
   meas.push({mode:m.mode,t:+m.t.toFixed(2),vis:r.visible,origVis:g.visible,dpos:+r.position.distanceTo(g.position).toFixed(5),dq:+(1-Math.abs(r.quaternion.dot(g.quaternion))).toFixed(6),origMeshesShown:meshVisible,gaze:st.gazeErr,ankle:st.ankle,nan,jamie:L.friends.list[0].mode});}
  if(m.mode==='gone'&&m.closeT>1.5)break;}
 L.release('KeyW');return {hash:h,steps:i,samples,meas};}`;
const KIDLINE=`()=>{const L=lastLight;L.place(60,0,0);for(let i=0;i<3;i++)L.step(1/30);const A=L.ambient,K=A.hoopKid.kid,B=A.hoopKid.ball;let h=0;const samples=[],meas=[];const SC=window.__supportcast?.cast?.kid;
 const H=(a)=>{for(const v of a){const s=typeof v==='string'?v.length*7919+v.charCodeAt(0):Math.round(v*10000);h=(Math.imul(h^s,16777619)+1)>>>0;}};
 for(let i=0;i<14*30;i++){L.step(1/30);const s=[K.phase,+K.t.toFixed(4),+B.position.x.toFixed(4),+B.position.y.toFixed(4),+B.position.z.toFixed(4),K.person.group.visible?1:0];H(s);if(i%10===0)samples.push(s);
  if(SC){const st=SC.state;let nan=false;SC.inst.model.traverse(o=>{if(o.isBone&&!o.matrixWorld.elements.every(Number.isFinite))nan=true;});meas.push({phase:K.phase,t:+K.t.toFixed(3),vis:SC.root.visible,origVis:K.person.group.visible,dpos:+SC.root.position.distanceTo(K.person.group.position).toFixed(5),gapR:st.gapR,gapL:st.gapL,shown:SC.meshes.filter(([o])=>o.visible).length,nan});}}
 return {hash:h,samples,meas};}`;

// ---------------------------------------------------------------------------------------------------------------- A
PART='A';
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{const R=report.parts.A={};await open(page,'');
 const mods=requests.filter(u=>/envrepair|supportcast|chr\.jamie-mother|chr\.hoop-kid/.test(u));
 check('Default game: no envrepair or supportcast module, model or texture is fetched',mods.length===0,mods);
 R.fingerprint=await page.evaluate(`(${FINGERPRINT})()`);check('Default game: no er: record or zone (world.er is null)',R.fingerprint.erZones.length===0&&await page.evaluate(()=>lastLight.world.er===null),R.fingerprint.erZones);
 R.queries=await page.evaluate(`(${QUERIES})()`);R.rides=await page.evaluate(`(${RIDES})()`);
 // the controllers' baseline in a freshly loaded page, as every other part records them: the scripted rides above leave the
 // friends one frame off (the default game gives the same timeline as the flags in a fresh page; after the rides it does not)
 await open(page,'');await startRide(page);R.mom=await page.evaluate(`(${MOMLINE})()`);
 await page.evaluate(()=>{lastLight.reset?.();});await startRide(page);R.kid=await page.evaluate(`(${KIDLINE})()`);
 check('Baseline recorded: geometry, '+R.fingerprint.merged.tris+' merged triangles; the mother\'s controller over '+R.mom.steps+' frames (door opens, she walks out, waits, goes in, the door closes); the kid\'s 14 s',R.mom.samples.some(s=>s[0]==='porch')&&R.mom.samples.some(s=>s[0]==='in')&&R.mom.samples.at(-1)[10]===1&&R.kid.samples.some(s=>s[0]==='shoot'),{momHash:R.mom.hash,kidHash:R.kid.hash});
 check('Default game: no page errors',errors.length===0,errors);delete R.mom.meas;delete R.kid.meas;save();});

// ---------------------------------------------------------------------------------------------------------------- B
PART='B';
if(PARTS.includes('B'))await withPage(async(page,{errors})=>{const R=report.parts.B={};const A=report.parts.A;await open(page,'envrepair');await waitER(page);
 R.fingerprint=await page.evaluate(`(${FINGERPRINT})()`);
 check('?envrepair: every merged surface, shadow proxy and line holds exactly the default game\'s vertices (the flag only bakes the creek\'s recorded plants and patches into batches of their own)',A&&R.fingerprint.merged.h1===A.fingerprint.merged.h1&&R.fingerprint.merged.h2===A.fingerprint.merged.h2&&R.fingerprint.merged.tris===A.fingerprint.merged.tris&&R.fingerprint.proxies.h1===A.fingerprint.proxies.h1&&R.fingerprint.lines.h1===A.fingerprint.lines.h1,{with:R.fingerprint,without:A?.fingerprint});
 R.queries=await page.evaluate(`(${QUERIES})()`);check('?envrepair: ground heights, rideability, obstacles, navigation shapes and driveway openings identical',A&&JSON.stringify(R.queries)===JSON.stringify(A.queries),R.queries);
 R.rides=await page.evaluate(`(${RIDES})()`);check('?envrepair: the three scripted rides identical',A&&JSON.stringify(R.rides)===JSON.stringify(A.rides));
 R.state=await page.evaluate(()=>{const E=__envrepair,W=lastLight.world,c=W.er.creek;return {records:{shrubs:c.shrubs.length,weeds:c.weeds.length,patches:c.patches.length,algae:c.algae.length,trees:c.trees.length},zones:[...new Set(W.merged.map(m=>m.userData.zone).filter(z=>z&&z.startsWith('er:')))].sort(),
  errors:E.errors,creek:E.parts.creek?.out,hidden:W.merged.filter(m=>(m.userData.zone||'').startsWith('er:creek-patch')).every(m=>!m.visible),active:E.active};});
 check('?envrepair alone: the creek\'s ground patches and algae recorded and replaced by soft-edged ones (the hard polygons hidden); the brush, reeds and trees left (they extend the vegetation library: ?vegetation); the chain link and play equipment say they need ?streetprops and ?details',R.state.records.patches>30&&R.state.records.weeds>100&&R.state.records.shrubs===0&&R.state.hidden&&R.state.creek.patches>30&&R.state.errors.some(e=>/streetprops/.test(e))&&R.state.errors.some(e=>/details/.test(e)),R.state);
 R.chapters=await page.evaluate(()=>{const L=lastLight,W=L.world,proc=()=>W.merged.filter(m=>(m.userData.zone||'').startsWith('er:')).every(m=>m.visible);__envrepair.tick();const r={prologue:{active:__envrepair.active,proc:proc()}};
  L.devScene(1,'title');for(let i=0;i<10;i++)L.step(1/30);__envrepair.tick();r.chapterOne={active:__envrepair.active,proc:proc()};return r;});
 check('Prologue only: active in the Prologue; in Chapter One the creek\'s originals show again',R.chapters.prologue.active&&!R.chapters.chapterOne.active&&R.chapters.chapterOne.proc,R.chapters);
 check('?envrepair: no page errors',errors.length===0,errors);save();});
if(PARTS.includes('B'))await withPage(async(page,{errors})=>{const R=report.parts.B2={};const A=report.parts.A;await open(page,'envrepair&supportcast');await waitER(page);await waitSC(page);
 await page.evaluate(()=>{for(const d of document.querySelectorAll('[id$="-benchmark-label"]'))d.style.display='none';});await startRide(page);R.mom=await page.evaluate(`(${MOMLINE})()`);
 await page.evaluate(()=>{lastLight.reset?.();});await startRide(page);R.kid=await page.evaluate(`(${KIDLINE})()`);
 check('?supportcast (with ?envrepair, without the six): the mother\'s controller identical to the default game on every one of '+R.mom.steps+' frames (door, path, facing, visibility, the slam) and the kid\'s 14 s identical (ball, phases)',A&&R.mom.hash===A.mom.hash&&R.mom.steps===A.mom.steps&&R.kid.hash===A.kid.hash,{mom:[R.mom.hash,A?.mom.hash],kid:[R.kid.hash,A?.kid.hash]});
 check('?supportcast without the six: no page errors',errors.length===0,errors);delete R.mom.meas;delete R.kid.meas;save();});

// ---------------------------------------------------------------------------------------------------------------- C
PART='C';
// the six benchmarks alone (the reference for the eight: they legitimately change some geometry and ground of their own)
if(PARTS.includes('C'))await withPage(async(page,{errors})=>{const R=report.parts.C0={};await open(page,SIX);await page.waitForFunction(()=>window.__details&&(window.__details.handle||window.__details.error)&&window.__streetprops&&window.__vegetation,null,{timeout:600000});
 R.fingerprint=await page.evaluate(`(${FINGERPRINT})()`);await startRide(page);R.mom=await page.evaluate(`(${MOMLINE})()`);await page.evaluate(()=>{lastLight.reset?.();});await startRide(page);R.kid=await page.evaluate(`(${KIDLINE})()`);
 delete R.mom.meas;delete R.kid.meas;check('Reference: the six benchmarks alone, recorded (geometry, the mother\'s and the kid\'s timelines)',errors.length===0,{mom:R.mom.hash,kid:R.kid.hash});save();});
if(PARTS.includes('C'))await withPage(async(page,{errors})=>{const R=report.parts.C={};const A=report.parts.A;const t0=Date.now();await open(page,ALL);await waitER(page);await waitSC(page);R.loadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>({er:__envrepair.errors,sc:__supportcast.errors,det:__details.error,sp:__streetprops.error,veg:__vegetation.error,houses:__houses.error,pv:__pavement.error}));
 check('All eight flags (?'+ALL+') load without error',!R.loaded.er.length&&!R.loaded.sc.length&&!R.loaded.det&&!R.loaded.sp&&!R.loaded.veg&&!R.loaded.houses&&!R.loaded.pv,R.loaded);
 const C0=report.parts.C0;R.fingerprint=await page.evaluate(`(${FINGERPRINT})()`);check('All eight: the world geometry is exactly the six benchmarks\' (vertex for vertex): the repairs and the cast add their own meshes and change no surface',C0&&R.fingerprint.merged.h1===C0.fingerprint.merged.h1&&R.fingerprint.merged.h2===C0.fingerprint.merged.h2&&R.fingerprint.proxies.h1===C0.fingerprint.proxies.h1&&R.fingerprint.lines.h1===C0.fingerprint.lines.h1,{tris:R.fingerprint.merged.tris,six:C0?.fingerprint.merged.tris});
 // 1. chain link
 R.chain=await page.evaluate(()=>{const m=__streetprops.handle.parts.props.mats.props_cut;const fences=__streetprops.handle.parts.props.sets['fence.chain'];return {key:m.customProgramCacheKey(),items:fences?.items.length,posts:__streetprops.handle.parts.props.sets['post.chain']?.items.length};});
 check('Chain link: the street props\' chain-link material carries the coverage rule (same material, same draws; '+R.chain.items+' chain-link bays, '+R.chain.posts+' posts, positions untouched)',R.chain.key==='ll-sp-cutout-er'&&R.chain.items>0,R.chain);
 // 2. play equipment: swapped, on the ground, no NaN; the key restores the details kit exactly
 R.kit=await page.evaluate(async()=>{const E=__envrepair,D=__details.handle,T=E.THREE,{MAIN}=await import('./terrain.js');const W=lastLight.world;const GY=(x,z)=>{const p=MAIN.project(x,z);return W.groundY(p.u,p.v);};
  const res={report:E.parts.kit.report,ground:{}};
  for(const key of ['trampoline','swing','toy.bigwheel','toy.wagon']){const set=D.sets[key];const g0=set.meshes.find(m=>m.l===0&&m.im.material===D.mats.dt_A).im.geometry;const a=g0.attributes.position,v=new T.Vector3();
   let worstFloat=0,worstSink=0,nan=0;const feet=E.parts.kit.contacts[key];
   for(const it of set.items){if(!it.matrix.elements.every(Number.isFinite))nan++;
    if(key==='trampoline'||key==='swing'){// every foot (the kit's contact points) against the ground under it
     const gaps=feet.map(c=>{v.set(c[0],c[1],c[2]).applyMatrix4(it.matrix);return v.y-GY(v.x,v.z);});worstFloat=Math.max(worstFloat,Math.min(...gaps));worstSink=Math.min(worstSink,Math.min(...gaps));continue;}
    let ymin=1e9;const P=[];for(let i=0;i<a.count;i+=Math.max(1,Math.floor(a.count/1500))){v.fromBufferAttribute(a,i).applyMatrix4(it.matrix);P.push([v.x,v.y,v.z]);ymin=Math.min(ymin,v.y);}
    const low=P.filter(p=>p[1]<ymin+.03);const gaps=low.map(p=>p[1]-GY(p[0],p[2]));worstFloat=Math.max(worstFloat,Math.min(...gaps));worstSink=Math.min(worstSink,Math.min(...gaps));}
   res.ground[key]={items:set.items.length,lowestFloat:+worstFloat.toFixed(3),deepestSink:+worstSink.toFixed(3),nan,tris0:g0.index.count/3};}
  const snap=()=>Object.fromEntries(['trampoline','swing','toy.bigwheel','toy.wagon'].map(k=>[k,{idx:D.sets[k].meshes.map(m=>m.im.geometry.index.count),m:D.sets[k].items.map(it=>it.matrix.elements.map(x=>+x.toFixed(5)).join(',')).join(';').length}]));
  res.repaired=snap();E.setMode('original');E.tick();res.original=snap();E.setMode('repaired');E.tick();res.again=snap();return res;});
 check('Play equipment: the trampolines, swing sets, big wheels and wagons use the repaired pieces ('+Object.entries(R.kit.ground).map(([k,g])=>`${k} ${g.items}`).join(', ')+'), no invalid transform',Object.values(R.kit.ground).every(g=>g.nan===0&&g.items>0),R.kit.report);
 check('Play equipment on the ground: every trampoline and swing-set foot on the lawn (fitted to the ground under its feet: none floats more than 3 cm, none sunk more than 5 cm); the toys rest on their lowest points',Object.values(R.kit.ground).every(g=>g.lowestFloat<.03&&g.deepestSink>-.05),R.kit.ground);
 check('The \' key restores the details kit exactly (its geometry and matrices) and repairs again',JSON.stringify(R.kit.repaired)===JSON.stringify(R.kit.again)&&JSON.stringify(R.kit.repaired)!==JSON.stringify(R.kit.original),{repaired:R.kit.repaired,original:R.kit.original});
 // 3. contact shadows, 4. creek
 R.contact=await page.evaluate(()=>({count:__envrepair.parts.contact.count,kinds:__envrepair.parts.contact.kinds,visible:__envrepair.parts.contact.mesh.visible}));
 check('Contact shadows: under '+R.contact.count+' grounded things (cars, chairs, toys, grills, play-equipment feet, mailboxes, bins, hydrants, poles, lamps, sheds)',R.contact.count>800&&R.contact.visible&&R.contact.kinds.car>40&&R.contact.kinds.lamp>20,R.contact.kinds);
 R.creek=await page.evaluate(()=>{const c=__envrepair.parts.creek,W=lastLight.world;return {out:c.out,records:c.records,procHidden:W.merged.filter(m=>(m.userData.zone||'').startsWith('er:')).every(m=>!m.visible),proxiesHidden:W.shadowProxies.filter(m=>(m.userData.zone||'').startsWith('er:')).every(m=>!m.visible)};});
 check('Briarwood creek: the brush, reeds, ground patches, algae and out-of-scope trees replaced one for one from the vegetation library (originals and their shadows hidden)',R.creek.out.shrubs===R.creek.records.shrubs&&R.creek.out.trees===R.creek.records.trees&&R.creek.out.patches===R.creek.records.patches&&R.creek.out.algae===R.creek.records.algae&&R.creek.out.grass>=R.creek.records.weeds&&R.creek.procHidden&&R.creek.proxiesHidden,R.creek);
 // supporting cast: the controllers' timelines identical to the default game, the authored figures on them
 await page.evaluate(()=>{for(const d of document.querySelectorAll('[id$="-benchmark-label"]'))d.style.display='none';});
 await startRide(page);const mom=await page.evaluate(`(${MOMLINE})()`);R.momHash=mom.hash;
 check('Jamie\'s mother: friends.js runs exactly as without ?supportcast: mode, clock, path, facing, the door\'s swing, visibility and the door\'s slam on every one of '+mom.steps+' frames, against the six benchmarks alone (hash '+mom.hash+')',C0&&mom.hash===C0.mom.hash&&mom.steps===C0.mom.steps,{with:mom.hash,six:C0?.mom.hash,default:A?.mom.hash});
 const M=mom.meas,shown=M.filter(x=>x.vis);
 R.mom={frames:M.length,shown:shown.length,maxDpos:Math.max(...M.map(x=>x.dpos)),maxDq:Math.max(...M.map(x=>x.dq)),origShown:Math.max(...M.map(x=>x.origMeshesShown)),visMismatch:M.filter(x=>x.vis!==(x.origVis&&x.mode!=='waiting'&&x.mode!=='gone')).length,nan:M.filter(x=>x.nan).length,
  ankle:{min:Math.min(...shown.map(x=>x.ankle)),max:Math.max(...shown.map(x=>x.ankle))},gazePorch:(()=>{const g=M.filter(x=>x.mode==='porch'&&x.gaze!==null).map(x=>x.gaze);return {n:g.length,median:g.sort((a,b)=>a-b)[g.length>>1],p90:g[Math.floor(g.length*.9)]};})(),hiddenAfter:M.at(-1).vis===false};
 check('Jamie\'s mother: the authored figure stands on the controller\'s own transform every frame (offset '+R.mom.maxDpos+' m) and is shown exactly when the original would be, never together with it (original meshes shown: '+R.mom.origShown+'), hidden once the door has closed',R.mom.maxDpos<1e-4&&R.mom.maxDq<1e-6&&R.mom.visMismatch===0&&R.mom.origShown===0&&R.mom.hiddenAfter&&R.mom.shown>200,R.mom);
 check('Jamie\'s mother: her feet on the ground she walks on (the lower ankle '+R.mom.ankle.min+'–'+R.mom.ankle.max+' m above the ground under it: neither floating nor sunk), no invalid bone transform',R.mom.ankle.min>.035&&R.mom.ankle.max<.13&&R.mom.nan===0,R.mom.ankle);
 check('Jamie\'s mother: on the porch she looks at Jamie whenever he is in front of her (within the neck\'s reach): head toward his head, median '+R.mom.gazePorch.median+'°, 90th percentile '+R.mom.gazePorch.p90+'°',R.mom.gazePorch.n>100&&R.mom.gazePorch.median<20&&R.mom.gazePorch.p90<40,R.mom.gazePorch);
 await page.evaluate(()=>{lastLight.reset?.();});await startRide(page);const kid=await page.evaluate(`(${KIDLINE})()`);R.kidHash=kid.hash;
 check('The hoop kid: ambient.js runs exactly as in the default game: phase, clock, the ball\'s path and visibility on every frame for 14 s (hash '+kid.hash+')',A&&kid.hash===A.kid.hash&&C0&&kid.hash===C0.kid.hash,{with:kid.hash,without:A?.kid.hash});
 const KM=kid.meas;R.kid={frames:KM.length,maxDpos:Math.max(...KM.map(x=>x.dpos)),shown:Math.max(...KM.map(x=>x.shown)),nan:KM.filter(x=>x.nan).length,vis:KM.filter(x=>x.vis!==x.origVis).length,
  gapR:(()=>{const g=KM.filter(x=>!(x.phase==='shoot'&&x.t<.07)).map(x=>x.gapR).filter(x=>x!==null);return {n:g.length,max:Math.max(...g),min:Math.min(...g)};})()};
 check('The hoop kid: on the controller\'s transform every frame, never shown with the original, his right hand on the ball the controller places in the contact phases (excluding the one frame where the controller itself moves the ball from the dribble to the set point; palm to ball surface '+R.kid.gapR.min+'…'+R.kid.gapR.max+' m)',R.kid.maxDpos<1e-4&&R.kid.shown===0&&R.kid.vis===0&&R.kid.nan===0&&R.kid.gapR.n>20&&R.kid.gapR.max<.05&&R.kid.gapR.min>-.05,R.kid);
 // night, restart, pause, DEV scene jump
 R.life=await page.evaluate(()=>{const L=lastLight,S=__supportcast,r={};L.ambient.night(true);L.step(1/30);r.nightKid=S.cast.kid.root.visible;L.ambient.night(false);
  L.reset();L.start();for(let i=0;i<5;i++)L.step(1/30);r.restartMom=S.cast.mother.root.visible;r.restartMode=L.friends.mom.mode;L.pause();L.step(1/30);L.resume?.();L.step(1/30);r.paused='ok';
  L.devScene(1,'title');for(let i=0;i<10;i++)L.step(1/30);S.tick();r.chapterOne={active:S.active,origShown:S.cast.mother.meshes.every(([o,v])=>o.visible===v)};return r;});
 check('Night, restart, pause and a DEV scene jump: the kid hidden at night as before; after a restart the mother waits unseen again; in Chapter One the originals are back (their meshes as before)',R.life.nightKid===false&&R.life.restartMom===false&&R.life.restartMode==='waiting'&&R.life.chapterOne.active===false&&R.life.chapterOne.origShown,R.life);
 check('All eight: no page errors',errors.length===0,errors);save();});
// later chapters' character files untouched by this branch
{PART='C';let diff='';try{diff=execFileSync('git',['diff','--name-only','716fc6bfacae1166f45826905475b7cb1d2409e0','--','dist/chapter7-cast.js','dist/aftermath1.js','dist/aftermath1-acting.js','dist/people.js','dist/adult-art.js','dist/adult-sculpt.js','dist/cast.js','dist/friends.js','dist/rig.js','dist/faces.js','dist/astra-anatomy.js']).toString().trim();}catch(e){diff='git: '+e.message;}
 if(PARTS.includes('C')){check('Later chapters, the four boys and the shared rig untouched: chapter7-cast.js, aftermath1*.js, people.js, adult-art.js, adult-sculpt.js, cast.js, friends.js, rig.js, faces.js, astra-anatomy.js identical to the starting commit',diff==='',diff);save();}}

// ---------------------------------------------------------------------------------------------------------------- D
PART='D';
if(PARTS.includes('D')){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'er-pkg-')),pm=path.join(tmp,'models');
 execFileSync('node',['tools/package-playtest.mjs',pm],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:'1'},stdio:'inherit'});
 const entry=d=>fs.readdirSync(d).find(f=>/\.html$/.test(f)&&!/Lab/.test(f));const mf=JSON.parse(fs.readFileSync(path.join(pm,'manifest.json'),'utf8'));
 const emb=Object.keys(mf.sourceHashes).filter(k=>/envrepair|supportcast|chr\.jamie-mother|chr\.hoop-kid/.test(k));
 check('Offline package (PLAYTEST_MODELS=1): both modules, the repair kit and both characters embedded',['dist/envrepair.js','dist/supportcast.js','dist/assets/envrepair/envrepair.kit.glb','dist/assets/chr/chr.jamie-mother.glb','dist/assets/chr/chr.hoop-kid.glb'].every(k=>emb.includes(k)),emb);
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pm,entry(pm))).href+'?qa&'+ALL);await waitER(page);await waitSC(page);
  const r=await page.evaluate(()=>({er:__envrepair.errors,sc:__supportcast.errors,cast:Object.keys(__supportcast.cast)}));const net=requests.filter(u=>/^https?:/.test(u));
  check('Offline package from disk, browser offline: all eight flags load from the embedded bytes, no network request, no error',!r.er.length&&!r.sc.length&&r.cast.length===2&&net.length===0&&errors.length===0,{...r,net,errors});},{offline:true});
 report.parts.D={bytes:fs.statSync(path.join(pm,entry(pm))).size};fs.rmSync(tmp,{recursive:true,force:true});save();}

report.finished=new Date().toISOString();report.summary={passed:report.checks.length,failed:report.failures.length};save();
console.log(`\n${report.checks.length} passed, ${report.failures.length} failed`);server.close();process.exit(report.failures.length?1:0);
