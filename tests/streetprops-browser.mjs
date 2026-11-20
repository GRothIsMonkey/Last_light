// Prologue vehicles & street props (?streetprops): checked in the real browser engine (Chromium, ANGLE SwiftShader:
// software rendering, NOT a GPU). One browser at a time.
//   A. the game without ?streetprops: no street-props module or asset is fetched; no 'sp:' zone exists; the baseline
//      (geometry fingerprint of every merged batch, shadow proxy and line batch; gameplay ground queries at street
//      points; obstacles, navigation shapes, driveway openings; two scripted rides);
//   B. ?streetprops: the two GLBs and eight textures load; every recorded object has its authored counterpart, standing
//      exactly where the procedural one stands (transforms finite, upright, unit scale); the cars' tyres on the ground;
//      no car over the sidewalk or into a house more than the procedural car; geometry, gameplay queries, obstacles,
//      navigation shapes and the rides identical to A; every wire attached at both ends (to its poles' hardware or the
//      house it serves) and continuous; X and Z; the moving minivan upgraded in place (same path, its wheels turn,
//      its lamps are the game's); the Prologue only (Chapter One shows the originals);
//   C. ?bikes&houses&vegetation&pavement&streetprops: the five benchmarks together; trees, shrubs and lawn the same as
//      without ?streetprops; the pavement active; the bikes and riding work;
//   D. the offline package (file://, browser offline): PLAYTEST_MODELS=1 (from the embedded bytes, no network) and the
//      default package (?streetprops fails loudly, nothing substituted);
//   E. the review captures: same camera, same frame, X's two modes, with all five benchmarks (cost per pair);
//   F. cost against the default game at eight riding cameras (software frame time, draw calls, triangles).
// usage: node tests/streetprops-browser.mjs [outDir=docs/qa/streetprops/browser]   (PARTS=A,B,C,D,E,F; SHOTS=0 to skip images; VIEWS=S01,S05 to pick captures)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/streetprops/browser');fs.mkdirSync(out,{recursive:true});
const PARTS=(process.env.PARTS||'A,B,C,D,E,F').split(','),SHOTS=process.env.SHOTS!=='0';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info',...(process.env.SP_ARGS?process.env.SP_ARGS.split(' '):[])];
// (SP_ARGS: extra Chromium switches, e.g. "--in-process-gpu" to keep the software GPU's buffers in the page's own process
// when the five benchmarks together come near the machine's memory limit)
const commit=(()=>{try{return execFileSync('git',['rev-parse','--short','HEAD']).toString().trim();}catch{return null;}})();
const report={renderer:'Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU',commit,started:new Date().toISOString(),viewport:'1600x900, deviceScaleFactor 1',checks:[],failures:[],parts:{},shots:[],pairs:[]};
const prev=(()=>{try{return JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8'));}catch{return null;}})();
// re-running only some parts keeps the other parts' results (their checks, measures, pairs and shots) from the last report
let PART='?';const partOf=x=>(typeof x==='object'&&x.part)||null;
if(prev){for(const k of Object.keys(prev.parts||{}))if(!PARTS.includes(k[0]))report.parts[k]=prev.parts[k];
 const keep=x=>{const pt=partOf(x);return pt&&!PARTS.includes(pt);};report.checks.push(...(prev.checks||[]).filter(keep));report.failures.push(...(prev.failures||[]).filter(keep));
 if(!PARTS.includes('E')){report.pairs=prev.pairs||[];report.shots=prev.shots||[];}
 else if(process.env.VIEWS){const re=process.env.VIEWS.split(','),again=n=>re.some(o=>n.startsWith(o));report.pairs=(prev.pairs||[]).filter(p=>!again(p.name));report.shots=(prev.shots||[]).filter(x=>!again(path.basename(x.file||'')));
  report.checks.push(...(prev.checks||[]).filter(x=>partOf(x)==='E'&&!/^Captures|^Cost \(measured|^Five benchmarks, captures/.test(x.name)));}report.kept=[...new Set([...(prev.checks||[]),...(prev.failures||[])].filter(keep).map(partOf))];}
const check=(name,ok,detail)=>{(ok?report.checks:report.failures).push({name,part:PART,...(detail===undefined?{}:{detail})});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?' '+JSON.stringify(detail).slice(0,700):''));return ok;};
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
const waitSP=page=>page.waitForFunction(()=>window.__streetprops||/FAILED/.test(document.getElementById('streetprops-benchmark-label')?.textContent||''),null,{timeout:400000});
const startRide=page=>page.evaluate(()=>{const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';});

// ------------------------------------------------------------------------------------------------ in-page measures
const FINGERPRINT=`()=>{const L=lastLight,W=L.world;const acc={tris:0,verts:0,h1:0,h2:0},prox={tris:0,h1:0},lines={segs:0,h1:0};
 const hv=(x,y,z)=>{let h=Math.imul(Math.round(x*1000)|0,73856093)^Math.imul(Math.round(y*1000)|0,19349663)^Math.imul(Math.round(z*1000)|0,83492791);h=Math.imul(h^(h>>>15),2246822519);return (h^(h>>>13))>>>0;};
 for(const m of W.merged){const p=m.geometry.attributes.position.array;acc.tris+=p.length/9;acc.verts+=p.length/3;for(let i=0;i<p.length;i+=3){const h=hv(p[i],p[i+1],p[i+2]);acc.h1=(acc.h1+h)>>>0;acc.h2=(acc.h2+Math.imul(h,2654435761)>>>0)>>>0;}}
 for(const m of W.shadowProxies){const p=m.geometry.attributes.position.array;prox.tris+=p.length/9;for(let i=0;i<p.length;i+=3)prox.h1=(prox.h1+hv(p[i],p[i+1],p[i+2]))>>>0;}
 L.scene.traverse(o=>{if(!o.isLineSegments||o.parent!==L.scene)return;const p=o.geometry.attributes.position.array;lines.segs+=p.length/6;for(let i=0;i<p.length;i+=3)lines.h1=(lines.h1+hv(p[i],p[i+1],p[i+2]))>>>0;});
 return {merged:acc,proxies:prox,lines,mergedCount:W.merged.length,proxyCount:W.shadowProxies.length,zones:[...new Set(W.merged.map(m=>m.userData.zone).filter(z=>z&&z.startsWith('sp:')))]};}`;
const QUERIES=`async()=>{const W=lastLight.world;const out=[];let h=0;
 const push=v=>{const s=typeof v==='boolean'?(v?1:0):Math.round(v*10000);h=(Math.imul(h^s,16777619)+1)>>>0;out.length<12&&out.push(v);};
 for(let d=-420;d<1180;d+=0.83)for(const lat of [-12.5,-9.3,-8.1,-7.3,-6.4,-5.6,-5.3,-4.9,-4.6,-3.1,-0.4,1.7,4.5,4.75,5.05,5.6,6.2,6.9,7.8,9.4,11.5]){push(W.surfaceY(d,lat));push(W.rideable(d,lat));push(W.groundY(d,lat));push(W.authoredY(d,lat));}
 return {n:Math.round(1600/0.83)*21,hash:h,obstacles:W.obstacles.length,obstacleHash:W.obstacles.reduce((a,o)=>(Math.imul(a^Math.round((o.d0+o.l0*7)*100),16777619)>>>0),0),
  space:['walk','porch','house','tree','fence','driveway','pole','lamp','mailbox','hydrant','bins','hoop','toy','sign'].map(t=>[t,W.space?.items(t).length]),drives:W.drivewayOpenings.length};}`;
const RIDES=`()=>{const L=lastLight,W=L.world;const ds=W.drivewayOpenings.filter(o=>o.side===1&&o.d>700).sort((a,b)=>a.d-b.d);const o=ds[0];const runs={};
 const run=(name,d,lat,keys,sec)=>{L.release('KeyW');L.release('KeyD');L.release('KeyA');L.place(d,lat,3.2);for(const k of keys)L.press(k);const tr=[];for(let i=0;i<sec*30;i++){L.step(1/30);if(i%6===0){const s=L.state;tr.push([+s.distance.toFixed(4),+s.lateral.toFixed(4),+s.speed.toFixed(4),+L.playerBike.group.position.y.toFixed(4)]);}}for(const k of keys)L.release(k);runs[name]=tr;};
 run('cut',o.d-3.2,2.6,['KeyW','KeyD'],3.5);run('curb',(o.d+o.d1)/2+9,3.1,['KeyW','KeyD'],3);run('mailbox',150,4.2,['KeyW','KeyD'],3);return {drive:{d:o.d},runs};}`;
// the authored instances against their records (positions, orientation, scale, grounding) and the wires' attachments
const AUTHORED=`async()=>{const S=__streetprops.handle,T=__streetprops.THREE,W=lastLight.world,R=W.streetProps,{MAIN}=await import('./terrain.js');
 const V=S.parts.vehicles,P=S.parts.props;const res={};const v=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
 const items=set=>set.items.map(it=>{it.matrix.decompose(v,q,s);const up=new T.Vector3(0,1,0).applyQuaternion(q);return {p:v.clone(),s:s.clone(),up:up.y,m:it.matrix,data:it.data};});
 // every set: finite, upright, unit scale (fences and posts are sheared/stretched by design and checked apart)
 let bad=[],n=0;const rigid=k=>!/^(fence|post)/.test(k)&&k!=='pole.guard';
 for(const set of [...Object.values(V.sets),...Object.values(P.sets)]){for(const it of items(set)){n++;const fin=it.m.elements.every(Number.isFinite);if(!fin){bad.push([set.name,'nan']);continue;}
  if(rigid(set.name.replace(/^car:.*/,'car'))&&(Math.abs(it.s.x-1)>.01||Math.abs(it.s.y-1)>.01||Math.abs(it.s.z-1)>.01||it.up<.985))bad.push([set.name,+it.s.x.toFixed(3),+it.s.y.toFixed(3),+it.up.toFixed(4)]);}}
 res.transforms={instances:n,bad:bad.slice(0,12),badCount:bad.length};
 // each authored car on its record: same x/z (2 cm), height within the tyre fit; its kind
 const recPos=g=>{g.updateWorldMatrix(true,false);return new T.Vector3().setFromMatrixPosition(g.matrixWorld);};
 let worstXZ=0,worstY=0,kinds={};for(const pl of V.placed){const set=V.sets[pl.type],it=set.items[pl.id];const a=recPos(pl.rec.g),b=new T.Vector3().setFromMatrixPosition(it.matrix);worstXZ=Math.max(worstXZ,Math.hypot(a.x-b.x,a.z-b.z));worstY=Math.max(worstY,Math.abs(a.y-b.y));kinds[pl.rec.kind+'->'+pl.type]=(kinds[pl.rec.kind+'->'+pl.type]||0)+1;}
 res.cars={records:R.cars.length,placed:V.placed.length,worstXZ:+worstXZ.toFixed(4),worstY:+worstY.toFixed(4),kinds,tilted:V.tilted,dynamic:!!V.dynamic};
 // tyres on the ground (Oak Hollow's drives: the ground the riders use)
 const info=V.info,gl=b=>[b[0],b[2],-b[1]];let worstGap=0,gaps=[],n2=0,procGap=0;
 for(const pl of V.placed){if(pl.rec.frame!=='main')continue;const it=V.sets[pl.type].items[pl.id],I=info[pl.type];n2++;
  for(const w of I.wheels.map(gl)){const c=new T.Vector3(w[0],0,w[2]).applyMatrix4(it.matrix),qq=MAIN.project(c.x,c.z),g=W.groundY(qq.u,qq.v);const gap=c.y-g;worstGap=Math.max(worstGap,Math.abs(gap));if(Math.abs(gap)>.03)gaps.push([pl.type,+qq.u.toFixed(1),+gap.toFixed(3)]);}
  // the procedural car (level) at the same spot: how far its tyres were from the ground
  const g0=pl.rec.g;g0.updateWorldMatrix(true,false);const y0=new T.Vector3().setFromMatrixPosition(g0.matrixWorld).y;for(const w of I.wheels.map(gl)){const c=new T.Vector3(-w[0],0,-w[2]).applyMatrix4(g0.matrixWorld),qq=MAIN.project(c.x,c.z);procGap=Math.max(procGap,Math.abs(y0-W.groundY(qq.u,qq.v)));}}
 res.grounding={cars:n2,worstGap:+worstGap.toFixed(4),over3cm:gaps.slice(0,10),over3cmCount:gaps.length,proceduralWorstGap:+procGap.toFixed(4)};
 // the sidewalk and the houses: no authored car corner further over the walk or into a house than the procedural car's
 const houses=W.space.items('house'),inRect=(r,x,z,m=0)=>{const c=Math.cos(r.rot),sn=Math.sin(r.rot),dx=x-r.x,dz=z-r.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<r.hw-m&&Math.abs(lz)<r.hd-m;};
 const PROC={sedan:[4.75,1.8],van:[5.1,1.95],suv:[4.8,1.9],pickup:[5.5,2],wagon:[4.9,1.82]};let walkWorse=0,houseHits=0,walkOver=[],procHouse=0;
 for(const pl of V.placed){if(pl.rec.frame!=='main')continue;const it=V.sets[pl.type].items[pl.id],I=info[pl.type],L2=I.L/2,W2=(I.W-.3)/2;const corners=[[-W2,-L2],[W2,-L2],[-W2,L2],[W2,L2]].map(([x,z])=>new T.Vector3(x,.3,z).applyMatrix4(it.matrix));
  const [pl0,pw0]=PROC[pl.rec.kind],pc=[[-pw0/2,-pl0/2],[pw0/2,-pl0/2],[-pw0/2,pl0/2],[pw0/2,pl0/2]].map(([x,z])=>new T.Vector3(x,0,z).applyMatrix4(pl.rec.g.matrixWorld));
  const minLat=cs=>Math.min(...cs.map(c=>Math.abs(MAIN.project(c.x,c.z).v)));const a=minLat(corners),b=minLat(pc);if(a<b-.12){walkWorse++;walkOver.push([pl.type,+(b-a).toFixed(3)]);}
  // (the game's house rectangles carry margins round the house and garage; a car's corner inside one is compared with the
  // procedural car's own corners at the same place)
  const hitsA=corners.filter(c=>houses.some(r=>inRect(r,c.x,c.z,.35))).length,hitsP=pc.filter(c=>houses.some(r=>inRect(r,c.x,c.z,.35))).length;if(hitsA>hitsP)houseHits++;procHouse+=hitsP;}
 res.footprint={walkWorse,walkOver:walkOver.slice(0,8),houseCornerHitsBeyondProcedural:houseHits,proceduralCornersInHouseMargins:procHouse};
 // the props on their records (identity of placement)
 const near=(set,g,dx=0)=>{const a=recPos(g);let best=1e9;for(const it of set.items){const b=new T.Vector3().setFromMatrixPosition(it.matrix);best=Math.min(best,Math.hypot(a.x+(dx?0:0)-b.x,a.y-b.y,a.z-b.z));}return best;};
 const worst=(list,setNames)=>{let w=0;for(const r of list){const sets=setNames.map(k=>P.sets[k]).filter(Boolean);w=Math.max(w,Math.min(...sets.map(st=>near(st,r.g))));}return +w.toFixed(4);};
 res.props={counts:P.kinds,records:{poles:R.poles.length,lamps:R.lamps.length,mailboxes:R.mailboxes.length,hydrants:R.hydrants.length,bins:R.bins.length,binsTotal:R.bins.reduce((a,b)=>a+(b.pair?2:1),0),hoops:R.hoops.length,fences:R.fences.length,bays:R.fences.reduce((a,f)=>a+f.bays.length,0),posts:R.fences.reduce((a,f)=>a+f.posts.length,0)},
  worst:{poles:worst(R.poles,['pole.shaft']),lamps:worst(R.lamps,['lamp']),mailboxes:worst(R.mailboxes,['mailbox.white','mailbox.wood','mailbox.deco','mailbox.brick']),hydrants:worst(R.hydrants,['hydrant']),bins:worst(R.bins,['cart','can'])}};
 // wires: every wire continuous; both ends on an attachment (pole hardware within reach of its pole, or the house it serves)
 const wg=P.wireMesh.geometry.attributes.position.array;res.wires={count:P.kinds.wires,records:R.spans.length+R.drops.length+R.guys.length,vertices:wg.length/3,finite:Array.prototype.every.call(wg,Number.isFinite)};
 const poleAt=R.poles.map(p=>{p.g.updateWorldMatrix(true,false);return new T.Vector3().setFromMatrixPosition(p.g.matrixWorld);});let far=0,farList=[];
 const ends=[];for(const s of R.spans)ends.push([s.a.pole,s.b.pole]);
 // (the ribbon's points: two per sample, 25 samples per span; spans first, then drops, then guys)
 let k=0;const pt=i=>new T.Vector3(wg[i*3],wg[i*3+1],wg[i*3+2]);const spanPts=25;
 for(const s of R.spans){const A=pt(k),B=pt(k+(spanPts-1)*2);for(const [e,p] of [[A,s.a.pole],[B,s.b.pole]]){const c=poleAt[p],dh=Math.hypot(e.x-c.x,e.z-c.z),dy=e.y-c.y;if(dh>1.05||dy<6.5||dy>9.3){far++;farList.push([p,+dh.toFixed(2),+dy.toFixed(2)]);}}k+=spanPts*2;}
 let dropOff=0;for(const d of R.drops){const B=pt(k+18*2),t=new T.Vector3(d.house.x,d.house.y,d.house.z);if(B.distanceTo(t)>.01)dropOff++;const A=pt(k),c=poleAt[d.a.pole];if(Math.hypot(A.x-c.x,A.z-c.z)>.4)dropOff++;k+=19*2;}
 res.wires.detached=far;res.wires.detachedList=farList.slice(0,8);res.wires.dropsOffTarget=dropOff;
 // continuity: consecutive samples of a wire never jump more than a span's step
 let jump=0;k=0;for(const s of R.spans){for(let i=0;i<spanPts-1;i++){const a=pt(k+i*2),b=pt(k+(i+1)*2);if(a.distanceTo(b)>6)jump++;}k+=spanPts*2;}res.wires.jumps=jump;
 // every pole's crossarm insulators carry their conductors: the primaries' ends at the insulator tie height (8.925 m)
 const prim=R.spans.filter(s=>s.role==='primary');let offIns=0;k=0;for(const s of R.spans){if(s.role==='primary'){const A=pt(k);const c=poleAt[s.a.pole];if(Math.abs(A.y-c.y-8.925)>.01)offIns++;}k+=spanPts*2;}res.wires.primaries=prim.length;res.wires.primariesOffInsulator=offIns;
 // lamps: each lens on its lamp's own level slot
 const lens=P.sets['lamp.lens'];res.lamps={lenses:lens.items.length,slots:[...new Set(lens.items.map(i=>i.data.iLamp[0]))].length,records:R.lamps.length};
 return res;}`;

// ---------------------------------------------------------------------------------------------------------------- A
PART='A';
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{await open(page,'');await startRide(page);
 const req=requests.filter(u=>/streetprops-|assets\/street\//.test(u));
 check('Default game: without ?streetprops none of the street-props modules or assets is fetched',req.length===0,req);
 const r=await page.evaluate(()=>({label:!!document.getElementById('streetprops-benchmark-label'),rec:lastLight.world.streetProps,zones:lastLight.world.merged.filter(m=>(m.userData.zone||'').startsWith('sp:')).length,spLines:(()=>{let n=0;lastLight.scene.traverse(o=>{if(o.userData?.spLine)n++;});return n;})(),proxies:lastLight.world.shadowProxies.length}));
 check('Default game: no street-props record, zone, line tag or label exists (the world is baked as before; 379 shadow proxies as accepted)',!r.label&&r.rec===null&&r.zones===0&&r.spLines===0&&r.proxies===379,r);
 report.parts.A={...r,fingerprint:await page.evaluate(`(${FINGERPRINT})()`),queries:await page.evaluate(`(${QUERIES})()`),rides:await page.evaluate(`(${RIDES})()`)};
 check('Default game: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- B
PART='B';
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{const R=report.parts.B={};const t0=Date.now();await open(page,'streetprops');await waitSP(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>{const S=__streetprops.handle;return {error:__streetprops.error,loadMs:__streetprops.loadMs,errors:S?.errors,tex:S?.texInfo,stats:__streetprops.stats(),label:document.getElementById('streetprops-benchmark-label')?.textContent};});
 check('?streetprops: the two GLBs and eight textures load without error',!R.loaded.error&&!(R.loaded.errors||[]).length&&R.loaded.tex?.files?.length===8,{error:R.loaded.error,errors:R.loaded.errors,files:R.loaded.tex?.files});
 const req=requests.filter(u=>/assets\/street\//.test(u)).map(u=>u.replace(base,''));
 check('?streetprops: assets come from dist/assets/street (2 GLBs, 8 textures), none from outside the local server',req.length===10&&requests.every(u=>u.startsWith(base)||u.startsWith('data:')||u.startsWith('blob:')),req);
 R.texture=await page.evaluate(()=>{const S=__streetprops.handle,T=__streetprops.THREE;const all=[];for(const p of Object.values(S.parts))for(const m of Object.values(p.mats))for(const k of ['map','normalMap','roughnessMap'])if(m[k])all.push({m:m.name,k,w:m[k].image?.width,h:m[k].image?.height,mips:m[k].generateMipmaps,cs:m[k].colorSpace,aniso:m[k].anisotropy});return all;});
 check('Textures: colour maps sRGB, data maps linear, mipmapped, anisotropic',R.texture.every(t=>t.mips&&t.aniso>=1&&(t.k==='map'?t.cs==='srgb':t.cs!=='srgb')),R.texture);
 await startRide(page);
 R.authored=await page.evaluate(`(${AUTHORED})()`);const A=R.authored;
 check('Transforms: every authored instance is finite; every rigid one upright (within 10°) at unit scale',A.transforms.badCount===0&&A.transforms.instances>3000,A.transforms);
 check('Cars: each of the '+A.cars.records+' recorded cars has its authored car, at the same x/z (within 2 cm), standing on its own drive (within 25 cm of the procedural car\'s height)',A.cars.placed===A.cars.records&&A.cars.worstXZ<.02&&A.cars.worstY<.25,A.cars);
 check('Cars: no floating or sunken tyres on Oak Hollow\'s drives (every tyre within 3 cm of the ground the riders use; the procedural cars, level, were off by up to '+A.grounding.proceduralWorstGap+' m)',A.grounding.over3cmCount===0,A.grounding);
 check('Cars: no authored car reaches further over the sidewalk than the procedural car it replaces (by more than 12 cm), and none reaches further into a house or garage margin than it',A.footprint.walkWorse===0&&A.footprint.houseCornerHitsBeyondProcedural===0,A.footprint);
 const pc=A.props;
 check('Props: every recorded pole, lamp, mailbox, hydrant and bin has its authored counterpart at its exact place (within 1 mm)',pc.counts.poles===pc.records.poles&&pc.counts.lamps===pc.records.lamps&&Object.entries(pc.counts).filter(([k])=>k.startsWith('mailbox')).reduce((a,[,c])=>a+c,0)===pc.records.mailboxes&&pc.counts.hydrants===pc.records.hydrants&&(pc.counts.carts||0)+(pc.counts.cans||0)===pc.records.binsTotal&&Object.values(pc.worst).every(w=>w<.001),pc);
 check('Fences: every recorded bay and post of Oak Hollow\'s fences has its authored counterpart (bays sheared between their posts on the ground; gates where side yards meet houses)',pc.counts.bays+(pc.counts.gates||0)===pc.records.bays&&pc.counts.posts===pc.records.posts,{bays:pc.counts.bays,gates:pc.counts.gates,posts:pc.counts.posts,records:pc.records});
 check('Wires: every recorded wire is drawn ('+A.wires.records+'), finite and continuous; every span ends on its own two poles\' hardware (6.5-9.3 m up, within 1.05 m of the pole), every service drop on its pole\'s rack and on the house it served; every primary on an insulator',A.wires.count===A.wires.records&&A.wires.finite&&A.wires.detached===0&&A.wires.dropsOffTarget===0&&A.wires.jumps===0&&A.wires.primariesOffInsulator===0,A.wires);
 check('Streetlights: every lamp has its cobra head and a lens lit by its own lamp level',A.lamps.lenses===A.lamps.records&&A.lamps.slots===A.lamps.records,A.lamps);
 // geometry, gameplay, collisions: the baseline's
 R.fingerprint=await page.evaluate(`(${FINGERPRINT})()`);const F0=report.parts.A?.fingerprint;
 check('Geometry: every merged surface, shadow proxy and line holds exactly the default game\'s vertices (hashed at 1 mm) — the flag only splits the street props into batches of their own',F0&&R.fingerprint.merged.h1===F0.merged.h1&&R.fingerprint.merged.h2===F0.merged.h2&&R.fingerprint.merged.tris===F0.merged.tris&&R.fingerprint.proxies.h1===F0.proxies.h1&&R.fingerprint.proxies.tris===F0.proxies.tris&&R.fingerprint.lines.h1===F0.lines.h1&&R.fingerprint.lines.segs===F0.lines.segs,{with:{...R.fingerprint,zones:R.fingerprint.zones},without:F0});
 R.queries=await page.evaluate(`(${QUERIES})()`);const Q0=report.parts.A?.queries;
 check('Gameplay: surface heights, rideability, standing ground and authored pads at '+(Q0?.n||0)+' street points identical; obstacles, navigation and placement shapes (walk, porch, house, tree, fence, driveway, pole, lamp, mailbox, hydrant, bins, hoop, toy, sign) and driveway openings unchanged',Q0&&R.queries.hash===Q0.hash&&R.queries.obstacles===Q0.obstacles&&R.queries.obstacleHash===Q0.obstacleHash&&JSON.stringify(R.queries.space)===JSON.stringify(Q0.space)&&R.queries.drives===Q0.drives,{with:R.queries,without:Q0});
 R.rides=await page.evaluate(`(${RIDES})()`);const RD0=report.parts.A?.rides;
 check('Riding: scripted rides over a driveway cut, into a plain curb and past a mailbox follow exactly the same path, speed and wheel height',RD0&&JSON.stringify(R.rides)===JSON.stringify(RD0),{with:Object.fromEntries(Object.entries(R.rides.runs).map(([k,v])=>[k,v.slice(-1)])),without:RD0&&Object.fromEntries(Object.entries(RD0.runs).map(([k,v])=>[k,v.slice(-1)]))});
 // the comparison key, the LOD key
 R.keys=await page.evaluate(()=>{const W=lastLight.world,S=__streetprops.handle;const vis=()=>({proc:W.merged.filter(m=>(m.userData.zone||'').startsWith('sp:')).every(m=>m.visible),procHidden:W.merged.filter(m=>(m.userData.zone||'').startsWith('sp:')).every(m=>!m.visible),wires:S.parts.props.wireMesh.visible,lines:S.parts.props.lines.every(l=>l.visible),mode:__streetprops.mode});
  const k=c=>dispatchEvent(Object.assign(new Event('keydown'),{code:c}));const r=[vis()];k('KeyX');__streetprops.tick();r.push(vis());k('KeyX');__streetprops.tick();r.push(vis());
  const lod=[];for(let i=0;i<4;i++){k('KeyZ');__streetprops.tick();lod.push(S.parts.vehicles.sets.sedan.forced);}return {r,lod};});
 check('Comparison: X swaps AUTHORED (procedural props, their shadows and the old wire lines hidden; authored props and wires shown) and ORIGINAL in the same frame',R.keys.r[0].procHidden&&R.keys.r[0].wires&&!R.keys.r[0].lines&&R.keys.r[1].proc&&!R.keys.r[1].wires&&R.keys.r[1].lines&&R.keys.r[1].mode==='original'&&R.keys.r[2].procHidden&&R.keys.r[2].mode==='authored',R.keys.r);
 check('LOD: Z steps the forced level 0, 1, 2 and back to automatic',JSON.stringify(R.keys.lod)==='[0,1,2,null]',R.keys.lod);
 // the moving minivan: the parent's car comes home during the ride (ambient.js), upgraded in place
 R.dynamic=await page.evaluate(()=>{const L=lastLight,S=__streetprops.handle,D=S.parts.vehicles.dynamic;if(!D)return null;const g=D.root.parent,p0=g.position.clone();
  L.place(406,-1.5,4);for(let i=0;i<30*7;i++)L.step(1/30);__streetprops.tick();const p1=g.position.clone(),a=D.parts.wheels[0].rotation.x,b=D.pivots[0].rotation.x;
  return {upgraded:D.root.visible&&D.proc.every(o=>!o.visible),moved:+p0.distanceTo(p1).toFixed(2),visible:g.visible,wheelSync:Math.abs(a+b)<1e-6&&Math.abs(a)>.01,lamps:D.root.children.filter(o=>o.isMesh&&!o.isInstancedMesh&&o.material===D.parts.head).length};});
 check('The parent\'s minivan (ambient.js) is the authored minivan on the same group and path: it drives in (moved), its wheels turn with the game\'s, its headlamps are the game\'s lamp material',R.dynamic&&R.dynamic.upgraded&&R.dynamic.moved>5&&R.dynamic.wheelSync&&R.dynamic.lamps===2,R.dynamic);
 check('?streetprops (measures): no page errors (every street-props shader compiles and links)',errors.length===0,errors);save();});
// the Prologue only (a fresh page): Chapter One shows the originals
if(PARTS.includes('B'))await withPage(async(page,{errors})=>{const R=report.parts.B;await open(page,'streetprops');await waitSP(page);
 R.chapters=await page.evaluate(()=>{const L=lastLight,W=L.world,r={};const proc=()=>W.merged.filter(m=>(m.userData.zone||'').startsWith('sp:')).every(m=>m.visible);
  __streetprops.tick();r.prologue={active:__streetprops.active,procVisible:proc(),state:L.state.state};L.devScene(1,'title');for(let i=0;i<10;i++)L.step(1/30);__streetprops.tick();r.chapterOne={active:__streetprops.active,procVisible:proc(),state:L.state.state};return r;});
 check('Prologue only: active in the Prologue; in Chapter One the procedural cars and props show again (the authored set hidden)',R.chapters.prologue.active===true&&R.chapters.chapterOne.active===false&&R.chapters.chapterOne.procVisible===true,R.chapters);
 check('Chapter One with ?streetprops: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- C
PART='C';
const VEGSTATS=`()=>{const V=window.__vegetation?.handle;if(!V)return null;const I=V.info;return {trees:I.trees,shrubs:I.shrubs,meadow:I.meadow,variants:I.variantsUsed,lawn:V.lawnMode};}`;
if(PARTS.includes('C'))await withPage(async(page)=>{await open(page,'vegetation');await page.waitForFunction(()=>window.__vegetation,null,{timeout:400000});report.parts.Cbase={veg:await page.evaluate(`(${VEGSTATS})()`)};save();});
const FIVE='bikes&houses&vegetation&pavement&streetprops';
if(PARTS.includes('C'))await withPage(async(page,{errors})=>{const R=report.parts.C={};const t0=Date.now();await open(page,FIVE);
 await page.waitForFunction(()=>window.__vegetation&&window.__houses&&window.__bikes&&window.__pavement&&window.__streetprops,null,{timeout:600000});R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>({streetprops:__streetprops.error,spErrors:__streetprops.handle?.errors,pavement:__pavement.error,veg:__vegetation.error,houses:__houses.error,bikes:window.__bikes?.error||null}));
 check('All five benchmarks together (?'+FIVE+') load without error',!R.loaded.streetprops&&!(R.loaded.spErrors||[]).length&&!R.loaded.pavement&&!R.loaded.veg&&!R.loaded.houses&&!R.loaded.bikes,R.loaded);
 R.veg=await page.evaluate(`(${VEGSTATS})()`);
 check('Trees and lawns intact: the authored vegetation places the same trees, shrubs and meadow, with the repaired lawn (C), as without ?streetprops',JSON.stringify(R.veg)===JSON.stringify(report.parts.Cbase?.veg),{with:R.veg,without:report.parts.Cbase?.veg});
 await startRide(page);await page.evaluate(()=>{const L=lastLight;L.press('KeyW');for(let i=0;i<4*30;i++)L.step(1/30);L.release('KeyW');__streetprops.tick();});// (pedal for four seconds)
 R.state=await page.evaluate(()=>({pavement:__pavement.active,streetprops:__streetprops.active,hoopsLeftToHouses:__streetprops.handle.parts.props.kinds['hoops-on-house-benchmark-lots']||0,houses:__houses.mode,bikes:!!window.__bikes,friends:lastLight.state.friends.map(f=>f.mode),distance:+lastLight.state.distance.toFixed(2),speed:+lastLight.state.speed.toFixed(2)}));
 check('With all five: the pavement and the street props are active, the houses refined, the bikes upgraded; the ride runs (the boys ride on); the garage hoops on the house benchmark\'s lots are left to it',R.state.pavement&&R.state.streetprops&&R.state.houses==='refined'&&R.state.bikes&&R.state.distance>0&&R.state.hoopsLeftToHouses>0,R.state);
 check('Five benchmarks: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- D
PART='D';
if(PARTS.includes('D')){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sp-pkg-')),pm=path.join(tmp,'models'),pd=path.join(tmp,'default');
 execFileSync('node',['tools/package-playtest.mjs',pm],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:'1'},stdio:'inherit'});
 execFileSync('node',['tools/package-playtest.mjs',pd],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:''},stdio:'inherit'});
 const entry=d=>fs.readdirSync(d).find(f=>/\.html$/.test(f)&&!/Lab/.test(f));
 const mf=JSON.parse(fs.readFileSync(path.join(pm,'manifest.json'),'utf8'));const embedded=Object.keys(mf.sourceHashes).filter(k=>/assets\/street\//.test(k));
 check('Offline package (PLAYTEST_MODELS=1): the two street GLBs, the eight street textures and both street-props modules are embedded',embedded.length===10&&mf.sourceHashes['dist/streetprops-assets.js']&&mf.sourceHashes['dist/streetprops-benchmark.js'],embedded);
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pm,entry(pm))).href+'?qa&streetprops');await waitSP(page);
  const r=await page.evaluate(()=>({error:__streetprops.error,errors:__streetprops.handle?.errors,files:__streetprops.handle?.texInfo?.files?.length,active:__streetprops.active}));const net=requests.filter(u=>/^https?:/.test(u));
  check('Offline package from disk, browser offline: ?streetprops loads its models and textures from the embedded bytes, with no network request',!r.error&&!(r.errors||[]).length&&r.files===8&&net.length===0,{...r,net});
  check('Offline package: no page errors',errors.length===0,errors);},{offline:true});
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pm,entry(pm))).href+'?qa&'+FIVE);await page.waitForFunction(()=>window.__vegetation&&window.__houses&&window.__bikes&&window.__pavement&&window.__streetprops,null,{timeout:600000});
  const r=await page.evaluate(()=>({sp:__streetprops.error,pv:__pavement.error,veg:__vegetation.error,houses:__houses.error}));const net=requests.filter(u=>/^https?:/.test(u));
  check('Offline package from disk, browser offline: all five benchmarks load together from the embedded bytes, no network request, no error',!r.sp&&!r.pv&&!r.veg&&!r.houses&&net.length===0&&errors.length===0,{...r,net,errors});},{offline:true});
 await withPage(async(page,{errors})=>{await open(page,null,pathToFileURL(path.join(pd,entry(pd))).href+'?qa&streetprops');await waitSP(page);
  const r=await page.evaluate(()=>({error:__streetprops.error,label:document.getElementById('streetprops-benchmark-label')?.textContent,proc:lastLight.world.merged.filter(m=>(m.userData.zone||'').startsWith('sp:')).every(m=>m.visible)}));
  check('Default package (no models): ?streetprops fails loudly and substitutes nothing (the procedural props stay)',!!r.error&&/not embedded/.test(r.error)&&r.proc,r);},{offline:true});
 report.parts.D={package:{models:fs.statSync(path.join(pm,entry(pm))).size,default:fs.statSync(path.join(pd,entry(pd))).size}};
 fs.rmSync(tmp,{recursive:true,force:true});save();}

// ---------------------------------------------------------------------------------------------------------------- E
PART='E';
// The review captures. Riding camera views are placed by the QA hook (L.place + L.look, as the pavement suite does);
// 'free' views are a QA close-up camera set beside a recorded object (the game renderer, the game's light and shadows;
// only the camera is placed by hand) and are labelled so.
const look=(page,v)=>page.evaluate(async v=>{const L=lastLight,{MAIN}=await import('./terrain.js'),T=__streetprops.THREE,R=L.world.streetProps;let s=v;
 if(v.night&&!window.__spNight){L.devScene(0,'lookout');for(let t=0;t<57;t++)L.step(1);window.__spNight=true;document.getElementById('subtitle').style.visibility='hidden';}
 if(v.friends){L.reset?.();L.start();for(let i=0;i<150;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';s={...v,d:L.state.distance,lat:L.state.lateral};}
 if(v.carType){const P=__streetprops.handle.parts.vehicles.placed.filter(p=>p.type===v.carType&&p.rec.frame==='main'&&p.rec.where==='drive');const pos=g=>{g.updateWorldMatrix(true,false);const q=MAIN.project(g.matrixWorld.elements[12],g.matrixWorld.elements[14]);return q;};
  const c=P.map(p=>({p,q:pos(p.rec.g)})).filter(x=>x.q.u>(v.after??0)).sort((a,b)=>a.q.u-b.q.u)[0];const sd=Math.sign(c.q.v);s={...v,d:c.q.u+(v.dd??-7),lat:sd*(v.latAbs??2.4)};
  const g=c.p.rec.g;g.updateWorldMatrix(true,false);window.__aim={x:g.matrixWorld.elements[12],z:g.matrixWorld.elements[14]};s.yaw=0;window.__target={u:+c.q.u.toFixed(1),v:+c.q.v.toFixed(1)};}
 else window.__aim=null;
 L.place(s.d,s.lat,0);for(let i=0;i<(v.settle||4);i++)L.step(1/30);if(v.step)for(let t=0;t<v.step;t++)L.step(1);L.look(s.yaw||0,s.pitch||0);L.step(1/30);
 if(window.__aim){// turn until the camera looks straight at the target (the riding look's yaw is relative to the bike)
  const err=()=>{const c=L.camera,f=new T.Vector3();c.getWorldDirection(f);const t=new T.Vector3(window.__aim.x-c.position.x,0,window.__aim.z-c.position.z).normalize();f.y=0;f.normalize();return Math.atan2(f.x*t.z-f.z*t.x,f.x*t.x+f.z*t.z);};
  const set=y=>{s.yaw=y;L.look(y,s.pitch||0);L.step(1/30);};let sg=-1;
  for(let k=0;k<4;k++){const e0=err(),y0=s.yaw||0;set(y0+sg*e0);if(Math.abs(err())>Math.abs(e0)){sg=-sg;set(y0+sg*e0);}}
  if(v.yawOff)set(s.yaw+v.yawOff);window.__aimErr=+err().toFixed(4);}
 window.__freeCam=null;
 if(v.free){let M;const f=v.free;
  // (only the runs whose first bay the game draws as a gate: a side-yard run's first bay shorter than 3.2 m)
  if(f.kind==='gate'){const gates=R.fences.filter(x=>x.gate&&x.bays[0]&&x.bays[0].run===0&&x.bays[0].k===0&&x.bays[0].len<3.2);const g=gates[f.i],b=g.bays[0],a=MAIN.point((b.ua+b.ub)/2,b.va),side=Math.sign(b.va)*(f.flip?-1:1);const cpos=MAIN.point((b.ua+b.ub)/2+(f.du||0),b.va-side*(f.back||4.2));
   const from=new T.Vector3(cpos.x,cpos.y+(f.h||1.55),cpos.z),at=new T.Vector3(a.x,a.y+(f.ah||.95),a.z);M={from,at};}
  else if(f.kind==='hoop'){const hp=R.hoops.filter(h=>h.kind==='garage'&&!h.old)[f.i],P=hp.plan,a=P.toWorld(hp.board.x,hp.board.z),b2=P.toWorld(hp.board.x,hp.board.z+f.back);M={from:new T.Vector3(b2.x,a.ground+f.h,b2.z),at:new T.Vector3(a.x,a.ground+hp.board.y-.4,a.z)};}
  else if(f.kind==='mailbox'){const list=R.mailboxes.filter(m=>(m.frame||'main')==='main'&&m.style===f.style);const g=list[f.i].g;g.updateWorldMatrix(true,false);
   M={from:new T.Vector3(...f.from).applyMatrix4(g.matrixWorld),at:new T.Vector3(...f.at).applyMatrix4(g.matrixWorld)};}
  else if(f.kind==='bgpole'){const p=R.poles.filter(x=>x.background)[f.i],P=MAIN.point(p.u+(f.du??-14),Math.sign(p.v)*(f.lat??40));
   M={from:new T.Vector3(P.x,P.y+(f.h??4),P.z),at:new T.Vector3(p.x,p.y+(f.ah??7.5),p.z)};}
  else if(f.kind==='street'){const a=MAIN.point(f.d,f.lat),b=MAIN.point(f.td,f.tlat);M={from:new T.Vector3(a.x,a.y+f.h,a.z),at:new T.Vector3(b.x,b.y+(f.th||0),b.z)};}
  else{let list=R[f.kind];if(f.kind==='cars')list=__streetprops.handle.parts.vehicles.placed.filter(p=>p.type===f.type&&p.rec.frame==='main').map(p=>p.rec);else list=list.filter(x=>(x.frame||'main')==='main');const g=list[f.i].g;g.updateWorldMatrix(true,false);
   M={from:new T.Vector3(...f.from).applyMatrix4(g.matrixWorld),at:new T.Vector3(...f.at).applyMatrix4(g.matrixWorld)};}
  // the bike (and with it the sky dome, the shadow camera and the world's own distance culling) next to the subject;
  // for the raised street view and the view across the back yards, under the camera (the sky dome must hold the camera,
  // which stands far from its target)
  {const A=f.kind==='street'||f.kind==='bgpole'?M.from:M.at,q=MAIN.project(A.x,A.z);L.place(q.u-3,Math.max(-3.3,Math.min(3.3,q.v)),0);for(let i=0;i<4;i++)L.step(1/30);L.look(0,0);L.step(1/30);s={...s,d:q.u-3,lat:Math.max(-3.3,Math.min(3.3,q.v))};}
  const c=L.camera;c.position.copy(M.from);c.up.set(0,1,0);c.lookAt(M.at);c.updateMatrixWorld(true);window.__freeCam={p:c.position.toArray(),q:c.quaternion.toArray()};}
 return {d:+(+s.d).toFixed(2),lat:+(+s.lat).toFixed(2),yaw:+(s.yaw||0).toFixed(3),target:window.__target||null,aimError:window.__aim?window.__aimErr:null,free:!!v.free};},v);
const frame=(page,mode,timing=false)=>page.evaluate(([m,timing])=>{__streetprops.setMode(m);__streetprops.tick(true);window.__vegetation?.tick?.();window.__houses?.tick?.();window.__bikes?.tick?.();window.__pavement?.tick?.();
 if(window.__freeCam){const c=lastLight.camera;c.position.fromArray(window.__freeCam.p);c.quaternion.fromArray(window.__freeCam.q);c.updateMatrixWorld(true);}
 const i=lastLight.render();const c=lastLight.camera;
 // software frame time: the median of three renders of this frame (SwiftShader on the CPU: NOT a GPU number)
 const gl=lastLight.renderer.getContext(),px=new Uint8Array(4),ms=[];if(timing)for(let k=0;k<3;k++){const t0=performance.now();lastLight.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);ms.push(performance.now()-t0);}ms.sort((a,b)=>a-b);
 if(window.__freeCam){c.position.fromArray(window.__freeCam.p);c.quaternion.fromArray(window.__freeCam.q);c.updateMatrixWorld(true);lastLight.render();}
 return {calls:i.calls,triangles:i.triangles,ms:ms.length?+ms[1].toFixed(0):null,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4)),fov:c.fov},clock:document.getElementById('date')?.textContent||null};},[mode,timing]);
const labels=page=>page.evaluate(()=>{const out={};for(const el of document.querySelectorAll('[id$="-benchmark-label"]')){out[el.id]=el.textContent;el.style.visibility='hidden';}return out;});
async function pair(page,v,flags){const at=await look(page,v);const lab=await labels(page);const cam=v.free?'QA close-up camera (placed by hand beside the object; the game renderer, light and shadows)':'gameplay riding camera (QA placement)';
 const a=await frame(page,'authored');const A=await shot(page,`${v.n}--authored`,{kind:'game-renderer capture',camera:cam,mode:'authored',flags,view:v,at,...a});
 const b=await frame(page,'original');const B=await shot(page,`${v.n}--original`,{kind:'game-renderer capture',camera:cam,mode:'original',flags,view:v,at,...b});
 await page.evaluate(()=>__streetprops.setMode('authored'));
 const same=JSON.stringify(a.cam)===JSON.stringify(b.cam);
 report.pairs.push({name:v.n,what:v.what,flags,camera:a.cam,cameraKind:cam,at,clock:a.clock,sameCamera:same,labels:lab,authored:{calls:a.calls,triangles:a.triangles,ms:a.ms},original:{calls:b.calls,triangles:b.triangles,ms:b.ms},files:[A?.file,B?.file]});
 const vi=n=>{const k=VIEWS.findIndex(x=>x.n===n);return k<0?1e9:k;};report.pairs.sort((x,y)=>vi(x.name)-vi(y.name));save();return {a,b,same};}
const VIEWS=[
 {n:'S01-sedan-in-a-driveway',what:'a sedan parked in a driveway',carType:'sedan',after:100,dd:-5.5,latAbs:3.3,pitch:-.06},
 {n:'S02-minivan-beside-a-house',what:'a minivan in a driveway beside a house',carType:'minivan',after:60,dd:-6.5,latAbs:3.3,pitch:-.05},
 {n:'S03-pickup-in-a-driveway',what:'a pickup in a driveway',carType:'pickup',after:300,dd:-6,latAbs:3.3,pitch:-.06},
 {n:'S03b-wagon-in-a-driveway',what:'a station wagon in a driveway',carType:'wagon',after:120,dd:-6,latAbs:3.3,pitch:-.06},
 {n:'S04-three-vehicle-types-together',what:'a wagon, a pickup and an SUV (and a sedan) parked down the street, at matched scale',d:-232,lat:-.4,yaw:.0,pitch:-.05},
 {n:'S05-wheel-and-body-close',what:'a close view of a car\'s front wheel, tyre, body paint and glass (QA close-up camera, 1.4 m from the wheel)',d:200,lat:-2,free:{kind:'cars',type:'sedan',i:2,from:[2.25,.85,-2.55],at:[.8,.42,-1.35]}},
 {n:'S06-utility-pole-and-wires',what:'a utility pole with its crossarm, transformer and the connected overhead wires',d:128,lat:1.5,yaw:.55,pitch:.32},
 {n:'S06b-pole-line-behind-the-houses',what:'the pole line along the next street over, seen across the back yards: the same authored pole, crossarm, insulators and wires as on Oak Hollow (QA camera raised to crossarm height over the back yards, about 30 m from the pole)',d:0,lat:0,free:{kind:'bgpole',i:6,du:-12,lat:40,h:8.6,ah:8.4}},
 {n:'S07-transformer-and-insulators',what:'the transformer, fused cutouts, pin insulators, crossarm braces and the secondary rack (QA close-up camera at 7.6 m)',d:138,lat:-3,free:{kind:'poles',i:10,from:[2.4,7.6,3.2],at:[.2,8.1,0]}},
 {n:'S08-streetlight-golden-hour',what:'a cobra-head streetlight at golden hour (off, as the game\'s evening has it)',d:123,lat:-1.5,yaw:-.42,pitch:.12},
 {n:'S08b-cobra-head-close',what:'the cobra head: die-cast housing, photocell, drop refractor, mast arm (QA close-up camera)',d:131,lat:3,free:{kind:'lamps',i:8,from:[-.6,6.5,2.6],at:[-2,7.2,0]}},
 {n:'S09-streetlight-at-dusk',what:'streetlights lit at dusk (the ride near the end of the street: the lamps have come on)',d:1032,lat:-1.2,yaw:-.3,pitch:.06,step:4},
 {n:'S10-mailbox-beside-a-driveway',what:'mailboxes beside a driveway (a white post, a brick column beyond)',d:135.6,lat:-3.2,yaw:.95,pitch:-.3},
 {n:'S10b-brick-mailbox-close',what:'a brick mailbox column: plinth, running bond at true brick size, rowlock course, precast cap, arched steel insert, newspaper slot, house numbers (QA close-up camera)',d:0,lat:0,free:{kind:'mailbox',style:'brick',i:3,from:[1.4,1.35,2.6],at:[0,.85,0]}},
 {n:'S11-hydrant-near-the-curb',what:'a fire hydrant in the parking strip near the curb (and a black scroll-post mailbox)',d:76.5,lat:-3.4,yaw:.85,pitch:-.35},
 {n:'S12-bins-beside-a-driveway',what:'the recorded wheeled carts at the curb beside a driveway, the garage behind (their existing place)',d:-4.5,lat:-3.3,yaw:.75,pitch:-.22},
 {n:'S13-basketball-hoop-garage',what:'a garage-mounted basketball hoop: backboard, rim, net, bracket (QA camera at the driveway\'s free-throw distance)',d:322,lat:3,free:{kind:'hoop',i:3,back:5.2,h:1.6}},
 {n:'S13b-portable-hoop-at-the-curb',what:'the portable hoop at the curb (d 253), as placed',d:241,lat:1.6,yaw:-.36,pitch:.05},
 {n:'S14-wooden-fence-and-gate',what:'a side-yard gate (grey boards, strap hinges, latch) between the house and the stained privacy fence, its finished face toward the street (QA camera standing in the side yard)',d:-256,lat:-3,free:{kind:'gate',i:9,back:3.6,h:1.55,du:-1.2}},
 {n:'S14b-fences-from-the-street',what:'back-yard and lot-line fences seen between houses from the sidewalk',d:-418,lat:-6.9,yaw:1.35,pitch:0},
 {n:'S15-residential-street',what:'a residential street with its cars, poles, wires, lamps, mailboxes and bins',d:380,lat:-1.1,yaw:.05,pitch:-.04},
 {n:'S16-oak-hollow-wide-all-five',what:'a wide, raised view of Oak Hollow with all five benchmarks (QA raised camera, 13 m up)',d:30,lat:0,free:{kind:'street',d:28,lat:-1,h:13,td:150,tlat:0,th:0}},
 {n:'S17-the-boys-on-their-current-bikes',what:'the boys on their bikes as the ride begins — CURRENT IN-GAME CHARACTER PLACEHOLDERS (the game\'s procedural figures on the authored ?bikes bicycles), not the unintegrated Phase 1A Blender characters',d:12,lat:-1,pitch:-.08,friends:true},
];
const loadFive=async page=>{await open(page,FIVE);await page.waitForFunction(()=>window.__vegetation&&window.__houses&&window.__bikes&&window.__pavement&&window.__streetprops,null,{timeout:600000});await startRide(page);};
if(PARTS.includes('E')){const R=report.parts.E={};const only=process.env.VIEWS?process.env.VIEWS.split(','):null,pick=VIEWS.filter(v=>!only||only.some(o=>v.n.startsWith(o)));
 // (three views per fresh browser: in software rendering the five benchmarks together come near this machine's memory,
 // and every rendered frame and screenshot holds memory the software GPU releases late)
 const day=pick.filter(v=>!v.friends&&!v.n.startsWith('S09')),errs=[];
 for(let i=0;i<day.length;i+=3)await withPage(async(page,{errors})=>{await loadFive(page);for(const v of day.slice(i,i+3))await pair(page,v,'qa&'+FIVE);errs.push(...errors);});
 for(const v of pick.filter(v=>v.n.startsWith('S09')))await withPage(async(page,{errors})=>{await loadFive(page);
  await page.evaluate(()=>{const L=lastLight;for(let d=600;d<=1030;d+=10){L.place(d,-1.2,6);L.step(.6);}});await pair(page,v,'qa&'+FIVE);errs.push(...errors);});
 for(const v of pick.filter(v=>v.friends))await withPage(async(page,{errors})=>{await loadFive(page);await pair(page,v,'qa&'+FIVE);errs.push(...errors);});
 const P=report.pairs.filter(p=>p.flags==='qa&'+FIVE);
 check('Captures: every before/after pair is one camera and one frame ('+P.length+' pairs)',P.length>0&&P.every(p=>p.sameCamera),P.map(p=>[p.name,p.sameCamera]));
 const dc=P.map(p=>p.authored.calls-p.original.calls),dt=P.map(p=>p.authored.triangles/p.original.triangles);
 R.cost={drawCallDelta:[Math.min(...dc),Math.max(...dc)],triangleRatio:[+Math.min(...dt).toFixed(3),+Math.max(...dt).toFixed(3)],
  sum:{authored:{calls:P.reduce((a,p)=>a+p.authored.calls,0),tris:P.reduce((a,p)=>a+p.authored.triangles,0)},original:{calls:P.reduce((a,p)=>a+p.original.calls,0),tris:P.reduce((a,p)=>a+p.original.triangles,0)}}};
 check('Cost (measured, reported): the authored set adds at most 90 draw calls and at most 60 % more triangles in any captured frame',dc.every(x=>x<=90)&&dt.every(x=>x<=1.6),R.cost);
 check('Five benchmarks, captures: no page errors',errs.length===0,errs);save();}

// ---------------------------------------------------------------------------------------------------------------- F
PART='F';
// Cost against the default game at the same riding cameras (software rendering: the ratio shows the added work; NOT a GPU
// number): the default game (no flag), and ?streetprops with X's two modes (authored / original), each a fresh browser.
const COST_VIEWS=[{n:'C1',d:40,lat:-1.2,pitch:-.1},{n:'C2',d:-232,lat:-.4,pitch:-.05},{n:'C3',d:128,lat:1.5,yaw:.55,pitch:.32},{n:'C4',d:380,lat:-1.1,yaw:.05,pitch:-.04},{n:'C5',d:76.5,lat:-3.4,yaw:.85,pitch:-.35},{n:'C6',d:-4.5,lat:-3.3,yaw:.75,pitch:-.22},{n:'C7',d:700,lat:1,pitch:-.03},{n:'C8',d:1032,lat:-1.2,yaw:-.3,pitch:.06}];
const COST=`async v=>{const L=lastLight;L.place(v.d,v.lat,0);for(let i=0;i<4;i++)L.step(1/30);L.look(v.yaw||0,v.pitch||0);L.step(1/30);const out={};const gl=L.renderer.getContext(),px=new Uint8Array(4);
 const modes=window.__streetprops?['authored','original']:['default'];
 for(const m of modes){if(window.__streetprops){__streetprops.setMode(m);__streetprops.tick(true);}const i=L.render();const ms=[];for(let k=0;k<3;k++){const t0=performance.now();L.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);ms.push(performance.now()-t0);}ms.sort((a,b)=>a-b);out[m]={calls:i.calls,tris:i.triangles,ms:+ms[1].toFixed(0)};}
 if(window.__streetprops)__streetprops.setMode('authored');return out;}`;
if(PARTS.includes('F')){const R=report.parts.F={views:COST_VIEWS,default:{},streetprops:{}};
 // (fresh browsers: software rendering holds every rendered frame's memory late, so the default game measures three
 // cameras per browser and ?streetprops, which renders each camera in both X modes, one camera per browser)
 for(const [key,flags,per] of [['default','',3],['streetprops','streetprops',1]]){const errs=[];
  for(let i=0;i<COST_VIEWS.length;i+=per)await withPage(async(page,{errors})=>{const t0=Date.now();await open(page,flags);if(flags)await waitSP(page);await startRide(page);if(i===0)R[key+'LoadMs']=Date.now()-t0;
   for(const v of COST_VIEWS.slice(i,i+per))R[key][v.n]=await page.evaluate(`(${COST})(${JSON.stringify(v)})`);
   if(i===0)R[key+'Memory']=await page.evaluate(()=>({heapMB:+(performance.memory.usedJSHeapSize/1048576).toFixed(0),renderer:{...lastLight.renderer.info.memory},programs:lastLight.renderer.info.programs?.length}));
   errs.push(...errors);});
  check('Cost run ('+key+'): no page errors',errs.length===0,errs);}
 const sum=(k,m,f)=>COST_VIEWS.reduce((a,v)=>a+(R[k][v.n]?.[m]?.[f]||0),0);
 R.summary={default:{calls:sum('default','default','calls'),tris:sum('default','default','tris'),ms:sum('default','default','ms')},authored:{calls:sum('streetprops','authored','calls'),tris:sum('streetprops','authored','tris'),ms:sum('streetprops','authored','ms')},original:{calls:sum('streetprops','original','calls'),tris:sum('streetprops','original','tris'),ms:sum('streetprops','original','ms')}};
 R.summary.ratio={calls:+(R.summary.authored.calls/R.summary.default.calls).toFixed(3),tris:+(R.summary.authored.tris/R.summary.default.tris).toFixed(3),ms:+(R.summary.authored.ms/R.summary.default.ms).toFixed(3)};
 check('Cost against the default game measured at '+COST_VIEWS.length+' riding cameras (software frame time, draw calls, triangles: reported)',R.summary.default.ms>0&&R.summary.authored.ms>0,R.summary);save();}

report.finished=new Date().toISOString();save();server.close();
console.log(`\n${report.checks.length} passed, ${report.failures.length} failed`);process.exit(report.failures.length?1:0);
