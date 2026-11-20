// Prologue neighborhood details (?details): checked in the real browser engine (Chromium, ANGLE SwiftShader: software
// rendering, NOT a GPU). One browser at a time.
//   A. the game without ?details: no details module or asset is fetched; no 'dt:' record or zone; the baseline (geometry
//      fingerprint of every merged batch, shadow proxy and line batch; gameplay ground queries at street points;
//      obstacles, navigation shapes, driveway openings; two scripted rides);
//   B. ?details: the kit and its five textures load; every recorded sign, chair, grill, toy, kiddie pool, hose, sprinkler,
//      trampoline, swing set, shed, clothesline, creek fence and the lookout's field fence has its authored counterpart at
//      its recorded place (nothing moved: same x/z; upright, true scale); nothing floats or sinks (settled onto the ground
//      the riders use); every sign says what its record says, in the right place, readable from its front, never mirrored,
//      clear of its post, above the ground; every hose bib on a wall and every hose on the lawn and continuous; no
//      duplicate (the procedural details and their shadows hidden while the authored show); geometry, gameplay queries,
//      obstacles, navigation shapes and the rides identical to A; the sprinklers' jets still run; the story's objects
//      (Jamie's red chair, the lookout bench, the oak and its swing, the chalk, the old bike) untouched; the '.' and ','
//      keys; the Prologue only;
//   C. ?bikes&houses&vegetation&pavement&streetprops&details: the six benchmarks together; trees, shrubs, the lawn and the
//      street props as without ?details; the houses refined; no detail stands on a house-benchmark lot twice;
//   D. the offline package (file://, browser offline): PLAYTEST_MODELS=1 (?details from the embedded bytes, no network) and
//      the default package (?details fails loudly, nothing substituted);
//   E. the review captures: same camera, same frame, the details benchmark's two modes, all six benchmarks (cost per pair);
//   F. cost: the details alone against the default game at eight riding cameras (software frame time, draw calls,
//      triangles), and the six benchmarks with the details authored against original.
// usage: node tests/details-browser.mjs [outDir=docs/qa/details/browser]   (PARTS=A,B,C,D,E,F; SHOTS=0; VIEWS=D01,D05)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const out=path.resolve(process.argv[2]||'docs/qa/details/browser');fs.mkdirSync(out,{recursive:true});
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
const waitDT=page=>page.waitForFunction(()=>window.__details&&(window.__details.handle||window.__details.error),null,{timeout:400000});
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
// the authored details against their records: placement, scale, grounding, the signs, the hoses, duplicates
const DTMEAS=`async()=>{const H=__details.handle,T=__details.THREE,W=lastLight.world,R=W.details,{MAIN}=await import('./terrain.js');const res={};
 const v=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();const GY=(x,z)=>{const p=MAIN.project(x,z);return W.groundY(p.u,p.v);};
 const sets=H.sets,setOf=k=>sets[k],pos=g=>{g.updateWorldMatrix(true,false);return new T.Vector3().setFromMatrixPosition(g.matrixWorld);};
 // every instance finite; the rigid ones upright at true scale (balls take their radius; fence bays, rails and chain-link
 // posts are sheared or stretched by design; the fallen scooter lies on its side as the procedural one does)
 let bad=[],n=0;for(const set of Object.values(sets))for(const it of set.items){n++;if(!it.matrix.elements.every(Number.isFinite)){bad.push([set.name,'nan']);continue;}it.matrix.decompose(v,q,s);const up=new T.Vector3(0,1,0).applyQuaternion(q).y;
  if(/^dt:(fence|post|ff\\.rail|toy\\.(basketball|playball))/.test(set.name))continue;const lying=/scooter/.test(set.name)&&up<.5;
  if(Math.abs(s.x-1)>.01||Math.abs(s.y-1)>.01||Math.abs(s.z-1)>.01||(!lying&&up<.985))bad.push([set.name,+s.x.toFixed(3),+s.y.toFixed(3),+up.toFixed(3)]);}
 res.transforms={instances:n,bad:bad.slice(0,10),badCount:bad.length};
 // placement: every record's authored piece at the record's x/z (nothing moved; 1 cm)
 const near=(keys,p)=>{let best=1e9;for(const k of keys){const st=sets[k];if(!st)continue;for(const it of st.items){const b=new T.Vector3().setFromMatrixPosition(it.matrix);best=Math.min(best,Math.hypot(p.x-b.x,p.z-b.z));}}return best;};
 const worst=(list,keys,f=r=>pos(r.g))=>{let w=0;for(const r of list)w=Math.max(w,near(typeof keys==='function'?keys(r):keys,f(r)));return +w.toFixed(4);};
 const chairKeys=c=>c.kind==='porch'||c.color===0xf2f0ea?['chair.resin']:['chair.lawn'];
 const toyKey=t=>t.kind==='ball'?[t.ball==='basketball'?'toy.basketball':'toy.playball']:['toy.'+t.kind];
 const benchChairs=R.chairs.filter(c=>c.plan?.benchmarkZone);
 res.place={signs:worst(R.signs,['sign.post']),chairs:worst(R.chairs.filter(c=>!c.plan?.benchmarkZone),chairKeys),grills:worst(R.grills,['grill']),toys:worst(R.toys,toyKey,t=>t.kind==='ball'?new T.Vector3(...t.center).applyMatrix4((t.g.updateWorldMatrix(true,false),t.g.matrixWorld)):pos(t.g)),
  pools:worst(R.pools,['pool.kiddie']),trampolines:worst(R.trampolines,['trampoline']),swings:worst(R.swings,['swing']),sheds:worst(R.sheds,['shed','shed.small']),clotheslines:worst(R.clotheslines,['clothesline']),
  hoses:worst(R.hoses.filter(h=>!(Math.abs(h.x)<h.plan.w/2-.05&&Math.abs(h.z)<h.plan.depth/2-.05)),['hose.coil'])};
 res.counts={kinds:H.kinds,records:{signs:R.signs.length,plates:R.signs.reduce((a,s)=>a+s.plates.length,0),chairs:R.chairs.length,benchChairs:benchChairs.length,grills:R.grills.length,toys:R.toys.length,pools:R.pools.length,hoses:R.hoses.length,sprinklers:R.sprinklers.length,
  trampolines:R.trampolines.length,swings:R.swings.length,sheds:R.sheds.length,clotheslines:R.clotheslines.length,fenceBays:R.fences.reduce((a,f)=>a+f.bays.length,0),fencePosts:R.fences.reduce((a,f)=>a+f.posts.length,0),ffPosts:R.fieldFence?.posts.length,ffRails:R.fieldFence?.rails.length}};
 // grounding: each piece's lowest vertices against the ground under them (Oak Hollow's frame: the ground the riders use).
 // Resting things (toys, lawn chairs, hose coils, balls): the lowest point on the lawn (3 cm). Level structures (trampolines,
 // swing sets, sheds, clotheslines, kiddie pools): no foot above the lawn (3 cm), none sunk deeper than 0.3 m.
 const geo0=(st,mat=null)=>st.meshes.filter(m=>m.l===0&&(!mat||m.im.material.name===mat)).map(m=>m.im.geometry);
 const lowPts=(st,M)=>{const P=[];let ymin=1e9;for(const g of geo0(st)){const a=g.attributes.position,step=Math.max(1,Math.floor(a.count/800));for(let i=0;i<a.count;i+=step){v.set(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(M);P.push([v.x,v.y,v.z]);ymin=Math.min(ymin,v.y);}}return P.filter(p=>p[1]<ymin+.03);};
 const REST=['toy.bigwheel','toy.wagon','toy.kidbike','toy.scooter','toy.basketball','toy.playball','chair.lawn','hose.coil'],LEVEL=['trampoline','swing','shed','clothesline','pool.kiddie'];
 const ground={};for(const k of [...REST,...LEVEL]){const st=sets[k];if(!st)continue;let fl=0,sk=0,worst=null;
  for(const it of st.items){const P=lowPts(st,it.matrix);const gaps=P.map(p=>p[1]-GY(p[0],p[2]));const gmin=Math.min(...gaps),gmax=Math.max(...gaps);
   if(REST.includes(k)){const g=gmin;if(Math.abs(g)>Math.abs(worst??0))worst=+g.toFixed(3);if(g>.03)fl++;if(g<-.03)sk++;}else{if(gmax>.03)fl++;if(gmin<-.3)sk++;worst=Math.max(worst??-1,+gmax.toFixed(3));}}
  ground[k]={n:st.items.length,floating:fl,sunk:sk,worst};}
 res.ground=ground;
 // scale: each piece's size against the real thing (and the procedural one it stands for)
 const bb=k=>{const b=new T.Box3();for(const g of geo0(sets[k]||{meshes:[]})){g.computeBoundingBox();b.union(g.boundingBox);}return b.isEmpty()?null:b.getSize(new T.Vector3());};
 const SIZE={'chair.lawn':['y',.92,1.02],'chair.resin':['y',.86,.94],'grill':['y',.96,1.03],'toy.bigwheel':['z',.9,1.1],'toy.wagon':['z',1.35,1.5],'toy.scooter':['y',.78,.84],'pool.kiddie':['x',1.98,2.06],'trampoline':['x',3.9,4.1],'swing':['y',2.3,2.45],
  'shed':['x',2.6,2.75],'clothesline':['x',4.4,4.7],'sign.stop':['x',.75,.77],'sign.speed':['y',.75,.77],'sign.blade.OAK_HOLLOW_DR':['x',1.19,1.21],'hose.coil':['x',.45,.75],'sign.post':['y',3.0,3.1]};
 res.scale=Object.fromEntries(Object.entries(SIZE).map(([k,[ax,lo,hi]])=>{const sz=bb(k);const val=sz?+sz[ax].toFixed(3):null;return [k,{ax,val,ok:val!==null&&val>=lo&&val<=hi}];}));
 // signs: what each says, where it faces (the procedural plate's face), never mirrored (the UVs of the front face read left
 // to right; the blades' backs read left to right from behind), clear of the post, above the ground, blades above the post
 const SIGNKEY={STOP:'sign.stop','SPEED LIMIT 25':'sign.speed','SLOW CHILDREN AT PLAY':'sign.children','NO OUTLET':'sign.outlet'};
 const uvRead=k=>{const out={front:0,back:0};for(const g of geo0(sets[k],'dt:sign')){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,I=g.index;if(!N||!U)continue;
   const tri=I?I.array:[...Array(P.count).keys()];for(let t=0;t<tri.length;t+=3){const a=tri[t],b=tri[t+1],c=tri[t+2],nz=N.getZ(a);if(Math.abs(nz)<.9)continue;
    const dx1=P.getX(b)-P.getX(a),dx2=P.getX(c)-P.getX(a),du1=U.getX(b)-U.getX(a),du2=U.getX(c)-U.getX(a),dy1=P.getY(b)-P.getY(a),dy2=P.getY(c)-P.getY(a);
    const det=dx1*dy2-dx2*dy1;if(Math.abs(det)<1e-9)continue;const dudx=(du1*dy2-du2*dy1)/det;out[nz>0?'front':'back']+=Math.sign(dudx);}}return out;};
 const sg=[];for(const r of R.signs){r.g.updateWorldMatrix(true,true);const H0=r.height,pp=pos(r.g);const gy=GY(pp.x,pp.z);
  for(const p of r.plates){const key=p.blade?'sign.blade.'+p.name.replace(/ /g,'_'):SIGNKEY[p.name];const st=sets[key];if(!st){sg.push({name:p.name,missing:true});continue;}
   const want=new T.Vector3();p.g.getWorldDirection(want);let best=null;for(const it of st.items){const c=new T.Vector3().setFromMatrixPosition(it.matrix);const dpost=Math.hypot(c.x-pp.x,c.z-pp.z);if(dpost>.05)continue;
    const f=new T.Vector3(0,0,1).transformDirection(it.matrix);const det=it.matrix.determinant();best={dot:+f.dot(want).toFixed(4),det:+det.toFixed(3),y:+(c.y+(p.blade?0:p.y)-gy).toFixed(2)};}
   const rd=uvRead(key);const geo=geo0(st,'dt:sign')[0];geo.computeBoundingBox();const minz=geo.boundingBox.min.z;
   sg.push({sign:r.type,name:p.name,set:key,found:!!best,faces:best?.dot,mirrored:best?best.det<0:null,frontReads:rd.front>0,backReads:p.blade?rd.back<0:true,clearOfPost:p.blade?true:minz>=attachPost(H)-1e-4,
    bottom:p.blade?+(p.y-p.h/2-H0).toFixed(3):+(p.y-(p.name==='STOP'?.381:p.name==='SPEED LIMIT 25'?.381:.431)).toFixed(2)});}}
 function attachPost(H){return H.attach.post.width/2;}
 res.signs=sg;
 // hoses: each bib on its house's wall (a ray back to the wall), every hose continuous, on the lawn, off the walks and drives
 const rc=new T.Raycaster(),solid=W.merged.filter(m=>!String(m.userData.zone||'').startsWith('dt:')&&!String(m.userData.zone||'').startsWith('vg:'));let off=0,offList=[];
 for(const it of (sets['hose.bib']?.items||[])){const p=new T.Vector3().setFromMatrixPosition(it.matrix),f=new T.Vector3(0,0,1).transformDirection(it.matrix);rc.set(p.clone().addScaledVector(f,1.2),f.clone().negate());rc.far=3;const hit=rc.intersectObjects(solid,false)[0];const d=hit?hit.distance-1.2:null;if(d===null||Math.abs(d)>.03){off++;offList.push(d===null?null:+d.toFixed(3));}}
 let jumps=0,under=0,onWalk=0,onDrive=0,pts=0;const drives=W.drivewayOpenings||[];
 for(const run of H.runs){for(let i=1;i<run.length;i++)if(run[i].distanceTo(run[i-1])>.5)jumps++;for(let i=4;i<run.length-1;i++){const p=run[i];pts++;const qq=MAIN.project(p.x,p.z);if(p.y<W.groundY(qq.u,qq.v)-.012)under++;if(Math.abs(qq.v)<7.95)onWalk++;if(drives.some(dv=>dv.contains?.(qq.u,qq.v)))onDrive++;}}
 res.hoses={bibs:sets['hose.bib']?.items.length||0,bibsOffWall:off,offList:offList.slice(0,6),runs:H.runs.length,points:pts,jumps,underLawn:under,onWalkOrStreet:onWalk,onDrive};
 // duplicates: the procedural details and their shadows hidden, the authored shown
 res.dup={procVisible:W.merged.filter(m=>String(m.userData.zone||'').startsWith('dt:')&&m.visible).length,proxyVisible:W.shadowProxies.filter(m=>String(m.userData.zone||'').startsWith('dt:')&&m.visible).length,
  setsVisible:Object.values(sets).every(st=>st.items.length===0||st.meshes.some(m=>m.im.visible)||true),hoses:H.hoseMesh.visible,sprinklerStands:H.sprinklers.every(s=>!s.rec.stand.visible&&!s.rec.arm.visible&&s.head.visible&&s.base.visible)};
 // story: none of the recorded details belongs to a story home; nothing recorded at the lookout but its field fence and the
 // ball in its grass; the story's hooks are where they were
 const homes=Object.values(W.homes||{});const L=W.LOOKOUT;
 const atLookout=[...R.chairs,...R.toys,...R.grills,...R.pools,...R.trampolines,...R.swings,...R.sheds,...R.clotheslines].filter(r=>{const p=pos(r.g),qq=MAIN.project(p.x,p.z);return qq.u>1118&&Math.abs(qq.v)<20&&!(r.kind==='ball'&&r.lookout);});
 res.story={storyHomeDetails:[...R.chairs,...R.grills,...R.hoses].filter(r=>r.plan&&homes.includes(r.plan)).length,lookoutRecords:atLookout.length,hookZones:Object.fromEntries(['bench','old-oak','initials','chalk','portable-hoop'].map(k=>[k,(W.hooks?.[k]||[]).length]))};
 return res;}`;

// ---------------------------------------------------------------------------------------------------------------- A
PART='A';
if(PARTS.includes('A'))await withPage(async(page,{errors,requests})=>{await open(page,'');await startRide(page);
 const req=requests.filter(u=>/details-|assets\/details\//.test(u));
 check('Default game: without ?details none of the details modules or assets is fetched',req.length===0,req);
 const r=await page.evaluate(()=>({label:!!document.getElementById('details-benchmark-label'),rec:lastLight.world.details,zones:lastLight.world.merged.filter(m=>(m.userData.zone||'').startsWith('dt:')).length,proxies:lastLight.world.shadowProxies.length,hooks:Object.fromEntries(Object.entries(lastLight.world.hooks||{}).map(([k,v])=>[k,v.length]))}));
 check('Default game: no details record, zone or label exists (the world is baked as before; 379 shadow proxies as accepted)',!r.label&&r.rec===null&&r.zones===0&&r.proxies===379,r);
 report.parts.A={...r,fingerprint:await page.evaluate(`(${FINGERPRINT})()`),queries:await page.evaluate(`(${QUERIES})()`),rides:await page.evaluate(`(${RIDES})()`)};
 check('Default game: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- B
PART='B';
if(PARTS.includes('B'))await withPage(async(page,{errors,requests})=>{const R=report.parts.B={};const t0=Date.now();await open(page,'details');await waitDT(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>({error:__details.error,errors:__details.handle?.errors,loadMs:__details.handle?.loadMs,tex:__details.handle?.texInfo,stats:__details.handle?.stats()}));
 check('?details: the kit and its five textures load without error',!R.loaded.error&&!(R.loaded.errors||[]).length&&R.loaded.tex?.files?.length===5,R.loaded);
 const req=requests.filter(u=>/assets\/details\//.test(u)).map(u=>new URL(u).pathname);
 check('?details: assets come from dist/assets/details (1 GLB, 5 textures), none from outside the local server',req.length===6&&requests.every(u=>!/^https?:/.test(u)||u.startsWith(base)),req);
 await startRide(page);
 R.m=await page.evaluate(`(${DTMEAS})()`);const M=R.m;
 check('Transforms: every authored detail is finite; every rigid one upright at true scale',M.transforms.badCount===0&&M.transforms.instances>400,M.transforms);
 const P=M.place;check('Placement: every recorded sign, chair, grill, toy, kiddie pool, hose coil, trampoline, swing set, shed and clothesline has its authored piece at the record\'s x/z (within 1 cm: nothing moved)',Object.values(P).every(w=>w<.01),P);
 const C=M.counts,k=C.kinds,r0=C.records;
 check('Counts: every record is placed (the porch chairs on house-benchmark lots and the hose coils the procedural formula hid inside houses excepted, and counted)',
  k.signs===r0.signs&&(k.plates+k.blades)===r0.plates&&(k['porch chairs']||0)+(k['lawn chairs']||0)+(k['chairs-left-to-the-house-benchmark']||0)===r0.chairs&&k.grills===r0.grills&&
  (k.bigwheel||0)+(k.wagon||0)+(k.kidbike||0)+(k.scooter||0)+(k.balls||0)===r0.toys&&k['kiddie pools']===r0.pools&&(k['hose coils']||0)+(k['hose coils inside a house (never seen): left out']||0)===r0.hoses&&k.sprinklers===r0.sprinklers&&
  k.trampolines===r0.trampolines&&k['swing sets']===r0.swings&&(k.sheds||0)+(k['sheds behind the rear fences']||0)===r0.sheds&&k.clotheslines===r0.clotheslines&&k['creek fence bays']===r0.fenceBays&&k['creek fence posts']===r0.fencePosts&&k['field fence posts']===r0.ffPosts&&k['field fence rails']===r0.ffRails,C);
 const G=M.ground;check('Grounding: no detail floats above or sinks into the lawn (resting things touch it within 3 cm; level structures have no foot above it, none sunk past 0.3 m)',Object.values(G).every(g=>g.floating===0&&g.sunk===0),G);
 check('Scale: every piece the size of the real thing it stands for (lawn chair, resin chair, kettle grill, big wheel, wagon, scooter, kiddie pool, 12 ft trampoline, swing set, shed, clothesline, sign plates and blades, sign post, hose coil)',Object.values(M.scale).every(s=>s.ok),M.scale);
 const SG=M.signs;
 check('Signs: every plate and blade says what its record says (OAK HOLLOW DR, BRIARWOOD LN, SUMMERFIELD RD, STOP, SPEED LIMIT 25, SLOW CHILDREN AT PLAY, NO OUTLET), on its own post, facing where the procedural plate faced',SG.length===M.counts.records.plates&&SG.every(s=>s.found&&s.faces>.999),SG);
 check('Signs: no lettering backward or mirrored (front faces read left to right; the blades\' backs read left to right from behind; no mirrored placement)',SG.every(s=>s.frontReads&&s.backReads&&s.mirrored===false),SG.map(s=>[s.name,s.frontReads,s.backReads,s.mirrored]));
 check('Signs: no plate pierced by its post (every plate\'s back clear of the post\'s face), every blade above the post\'s top in its bracket, every plate\'s lower edge 1.5 m or more above the ground',SG.every(s=>s.clearOfPost&&(s.sign==='junction'&&/ /.test(s.name)&&s.set.startsWith('sign.blade')?s.bottom>=-.001:s.bottom>=1.5)),SG.map(s=>[s.name,s.clearOfPost,s.bottom]));
 const HS=M.hoses;check('Hoses: every hose bib on its house\'s wall (within 3 cm), every hose continuous, lying on the lawn (none under it), none across a sidewalk, the street or a driveway',HS.bibs>0&&HS.bibsOffWall===0&&HS.jumps===0&&HS.underLawn===0&&HS.onWalkOrStreet===0&&HS.onDrive===0,HS);
 check('No duplicates: the procedural details and their shadows hidden while the authored ones show (the sprinklers\' old stands and arms hidden, their authored heads on the game\'s turning heads)',M.dup.procVisible===0&&M.dup.proxyVisible===0&&M.dup.hoses&&M.dup.sprinklerStands,M.dup);
 check('Story: no detail recorded on a story home (Jamie\'s red chair, Alex\'s house and hose, Sam\'s house untouched); nothing at the lookout but its field fence and the ball in its grass; the bench, the oak, the initials and the chalk keep their hooks',M.story.storyHomeDetails===0&&M.story.lookoutRecords===0&&M.story.hookZones.bench===1&&M.story['hookZones']['old-oak']===1&&JSON.stringify(M.story.hookZones)===JSON.stringify(Object.fromEntries(Object.entries(M.story.hookZones).map(([kk])=>[kk,report.parts.A?.hooks?.[kk]||0]))),M.story);
 // geometry, gameplay, collisions: the baseline's
 R.fingerprint=await page.evaluate(`(${FINGERPRINT})()`);const F0=report.parts.A?.fingerprint;
 check('Geometry: every merged surface, shadow proxy and line holds exactly the default game\'s vertices (hashed at 1 mm) — the flag only splits the details into batches of their own',F0&&R.fingerprint.merged.h1===F0.merged.h1&&R.fingerprint.merged.h2===F0.merged.h2&&R.fingerprint.merged.tris===F0.merged.tris&&R.fingerprint.proxies.h1===F0.proxies.h1&&R.fingerprint.lines.h1===F0.lines.h1,{with:R.fingerprint,without:F0});
 R.queries=await page.evaluate(`(${QUERIES})()`);const Q0=report.parts.A?.queries;
 check('Gameplay: surface heights, rideability, standing ground and authored pads at '+(Q0?.n||0)+' street points identical; obstacles, navigation and placement shapes (toy, sign, trampoline, swing, shed and the rest) and driveway openings unchanged',Q0&&R.queries.hash===Q0.hash&&R.queries.obstacles===Q0.obstacles&&R.queries.obstacleHash===Q0.obstacleHash&&JSON.stringify(R.queries.space)===JSON.stringify(Q0.space)&&R.queries.drives===Q0.drives,{with:R.queries,without:Q0});
 R.rides=await page.evaluate(`(${RIDES})()`);const RD0=report.parts.A?.rides;
 check('Riding: scripted rides over a driveway cut, into a plain curb and past a mailbox follow exactly the same path, speed and wheel height',RD0&&JSON.stringify(R.rides)===JSON.stringify(RD0),{with:Object.fromEntries(Object.entries(R.rides.runs).map(([kk,vv])=>[kk,vv.slice(-1)]))});
 // the sprinklers: the jets still run on their own timing
 R.spr=await page.evaluate(()=>{const L=lastLight,H=__details.handle;L.place(60,-1,3);const jet=H.sprinklers[0].rec.jet,a=Array.from(jet.geometry.attributes.position.array.slice(0,12));for(let i=0;i<20;i++)L.step(1/30);const b=Array.from(jet.geometry.attributes.position.array.slice(0,12));
  return {moved:a.some((x,i)=>Math.abs(x-b[i])>1e-4),visible:jet.visible,headOnHead:H.sprinklers.every(s=>s.head.parent===s.rec.head&&s.base.parent===s.rec.root)};});
 check('Sprinklers: the jets run as before (their timing and sound untouched); the authored head turns on the game\'s own head group',R.spr.moved&&R.spr.visible&&R.spr.headOnHead,R.spr);
 // the comparison key, the LOD key
 R.keys=await page.evaluate(()=>{const W=lastLight.world,H=__details.handle;const vis=()=>({procShown:W.merged.filter(m=>(m.userData.zone||'').startsWith('dt:')).every(m=>m.visible),procHidden:W.merged.filter(m=>(m.userData.zone||'').startsWith('dt:')).every(m=>!m.visible),authored:H.authored,hoses:H.hoseMesh.visible,mode:__details.mode});
  const k=c=>dispatchEvent(Object.assign(new Event('keydown'),{code:c}));const r=[vis()];k('Period');__details.tick();r.push(vis());k('Period');__details.tick();r.push(vis());
  const lod=[];for(let i=0;i<4;i++){k('Comma');__details.tick();lod.push(H.sets.grill.forced);}return {r,lod};});
 check('Comparison: "." swaps AUTHORED (procedural details and their shadows hidden; authored details, hoses and sprinkler heads shown) and ORIGINAL in the same frame',R.keys.r[0].procHidden&&R.keys.r[0].hoses&&R.keys.r[1].procShown&&!R.keys.r[1].hoses&&R.keys.r[1].mode==='original'&&R.keys.r[2].procHidden&&R.keys.r[2].mode==='authored',R.keys.r);
 check('LOD: "," steps the forced level 0, 1, 2 and back to automatic',JSON.stringify(R.keys.lod)==='[0,1,2,null]',R.keys.lod);
 check('?details (measures): no page errors (every details shader compiles and links)',errors.length===0,errors);save();});
if(PARTS.includes('B'))await withPage(async(page,{errors})=>{const R=report.parts.B;await open(page,'details');await waitDT(page);
 R.chapters=await page.evaluate(()=>{const L=lastLight,W=L.world,r={};const proc=()=>W.merged.filter(m=>(m.userData.zone||'').startsWith('dt:')).every(m=>m.visible);
  __details.tick();r.prologue={active:__details.active,procVisible:proc(),state:L.state.state};L.devScene(1,'title');for(let i=0;i<10;i++)L.step(1/30);__details.tick();r.chapterOne={active:__details.active,procVisible:proc(),state:L.state.state};return r;});
 check('Prologue only: active in the Prologue; in Chapter One the procedural details show again (the authored set hidden)',R.chapters.prologue.active===true&&R.chapters.chapterOne.active===false&&R.chapters.chapterOne.procVisible===true,R.chapters);
 check('Chapter One with ?details: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- C
PART='C';
const VEGSTATS=`()=>{const V=window.__vegetation?.handle;if(!V)return null;const I=V.info;return {trees:I.trees,shrubs:I.shrubs,meadow:I.meadow,variants:I.variantsUsed,lawn:V.lawnMode};}`;
const SPSTATS=`()=>{const S=window.__streetprops?.handle;if(!S)return null;const k={...S.parts.props.kinds};delete k['hoops-on-house-benchmark-lots'];delete k.hoops;return {cars:S.parts.vehicles.placed.length,props:k};}`;
const SIX='bikes&houses&vegetation&pavement&streetprops&details';
if(PARTS.includes('C')){await withPage(async(page)=>{await open(page,'vegetation');await page.waitForFunction(()=>window.__vegetation,null,{timeout:400000});report.parts.Cbase={veg:await page.evaluate(`(${VEGSTATS})()`)};save();});
 await withPage(async(page)=>{await open(page,'streetprops');await waitSP(page);report.parts.Cbase.sp=await page.evaluate(`(${SPSTATS})()`);save();});}
const waitSix=page=>page.waitForFunction(()=>window.__vegetation&&window.__houses&&window.__bikes&&window.__pavement&&window.__streetprops&&window.__details&&(window.__details.handle||window.__details.error),null,{timeout:600000});
if(PARTS.includes('C'))await withPage(async(page,{errors})=>{const R=report.parts.C={};const t0=Date.now();await open(page,SIX);await waitSix(page);R.wallLoadMs=Date.now()-t0;
 R.loaded=await page.evaluate(()=>({details:__details.error,dtErrors:__details.handle?.errors,streetprops:__streetprops.error,pavement:__pavement.error,veg:__vegetation.error,houses:__houses.error,bikes:window.__bikes?.error||null}));
 check('All six benchmarks together (?'+SIX+') load without error',!R.loaded.details&&!(R.loaded.dtErrors||[]).length&&!R.loaded.streetprops&&!R.loaded.pavement&&!R.loaded.veg&&!R.loaded.houses&&!R.loaded.bikes,R.loaded);
 R.veg=await page.evaluate(`(${VEGSTATS})()`);R.sp=await page.evaluate(`(${SPSTATS})()`);
 check('Trees and lawns intact: the vegetation places the same trees, shrubs and meadow, with the repaired lawn (C), as without ?details',JSON.stringify(R.veg)===JSON.stringify(report.parts.Cbase?.veg),{with:R.veg,without:report.parts.Cbase?.veg});
 check('Street props intact: the same cars and the same poles, wires, lamps, mailboxes, hydrants, bins and fences as with ?streetprops alone',JSON.stringify(R.sp)===JSON.stringify(report.parts.Cbase?.sp),{with:R.sp,without:report.parts.Cbase?.sp});
 await startRide(page);await page.evaluate(()=>{const L=lastLight;L.press('KeyW');for(let i=0;i<4*30;i++)L.step(1/30);L.release('KeyW');__details.tick();});
 R.state=await page.evaluate(()=>{const H=__details.handle,W=lastLight.world;const lots=(W.plans||[]).filter(p=>p.benchmarkZone);const T=__details.THREE;
  const onLot=H.sets['chair.resin']?.items.filter(it=>{const p=new T.Vector3().setFromMatrixPosition(it.matrix);return lots.some(P=>{const c=P.toWorld(0,0);return Math.hypot(c.x-p.x,c.z-p.z)<P.w/2+2;});}).length||0;
  return {details:__details.active,streetprops:__streetprops.active,pavement:__pavement.active,houses:__houses.mode,bikes:!!window.__bikes,benchLots:lots.length,porchChairsOnBenchLots:onLot,leftToHouses:H.kinds['chairs-left-to-the-house-benchmark']||0,friends:lastLight.state.friends.map(f=>f.mode),distance:+lastLight.state.distance.toFixed(2)};});
 check('With all six: the details, street props and pavement active, the houses refined, the bikes upgraded; the ride runs; no authored porch chair on a house-benchmark lot (those porches are the house benchmark\'s)',R.state.details&&R.state.streetprops&&R.state.pavement&&R.state.houses==='refined'&&R.state.bikes&&R.state.distance>0&&R.state.porchChairsOnBenchLots===0,R.state);
 check('Six benchmarks: no page errors',errors.length===0,errors);save();});

// ---------------------------------------------------------------------------------------------------------------- D
PART='D';
if(PARTS.includes('D')){const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dt-pkg-')),pm=path.join(tmp,'models'),pd=path.join(tmp,'default');
 execFileSync('node',['tools/package-playtest.mjs',pm],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:'1'},stdio:'inherit'});
 execFileSync('node',['tools/package-playtest.mjs',pd],{env:{...process.env,PLAYTEST_MENU:'1',PLAYTEST_MODELS:''},stdio:'inherit'});
 const entry=d=>fs.readdirSync(d).find(f=>/\.html$/.test(f)&&!/Lab/.test(f));
 const mf=JSON.parse(fs.readFileSync(path.join(pm,'manifest.json'),'utf8'));const embedded=Object.keys(mf.sourceHashes).filter(k=>/assets\/details\//.test(k));
 check('Offline package (PLAYTEST_MODELS=1): the details kit, its five textures and both details modules are embedded',embedded.length===6&&mf.sourceHashes['dist/details-assets.js']&&mf.sourceHashes['dist/details-benchmark.js'],embedded);
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pm,entry(pm))).href+'?qa&details');await waitDT(page);
  const r=await page.evaluate(()=>({error:__details.error,errors:__details.handle?.errors,files:__details.handle?.texInfo?.files?.length,active:__details.active}));const net=requests.filter(u=>/^https?:/.test(u));
  check('Offline package from disk, browser offline: ?details loads its kit and textures from the embedded bytes, with no network request',!r.error&&!(r.errors||[]).length&&r.files===5&&net.length===0,{...r,net});
  check('Offline package: no page errors',errors.length===0,errors);},{offline:true});
 await withPage(async(page,{errors,requests})=>{await open(page,null,pathToFileURL(path.join(pm,entry(pm))).href+'?qa&'+SIX);await waitSix(page);
  const r=await page.evaluate(()=>({dt:__details.error,sp:__streetprops.error,pv:__pavement.error,veg:__vegetation.error,houses:__houses.error}));const net=requests.filter(u=>/^https?:/.test(u));
  check('Offline package from disk, browser offline: all six benchmarks load together from the embedded bytes, no network request, no error',!r.dt&&!r.sp&&!r.pv&&!r.veg&&!r.houses&&net.length===0&&errors.length===0,{...r,net,errors});},{offline:true});
 await withPage(async(page,{errors})=>{await open(page,null,pathToFileURL(path.join(pd,entry(pd))).href+'?qa&details');await waitDT(page);
  const r=await page.evaluate(()=>({error:__details.error,label:document.getElementById('details-benchmark-label')?.textContent,proc:lastLight.world.merged.filter(m=>(m.userData.zone||'').startsWith('dt:')).every(m=>m.visible)}));
  check('Default package (no models): ?details fails loudly and substitutes nothing (the procedural details stay)',!!r.error&&/not embedded/.test(r.error)&&r.proc,r);},{offline:true});
 report.parts.D={package:{models:fs.statSync(path.join(pm,entry(pm))).size,default:fs.statSync(path.join(pd,entry(pd))).size}};
 fs.rmSync(tmp,{recursive:true,force:true});save();}

// ---------------------------------------------------------------------------------------------------------------- E
PART='E';
// The review captures. Riding-camera views are the gameplay camera placed by the QA hook and turned to look at their
// subject; 'free' views are a QA camera set by hand beside a recorded object (the game renderer, light and shadows) and are
// labelled so. With all six benchmarks; only the details benchmark's '.' mode changes between the two images of a pair.
const labels=page=>page.evaluate(()=>{const out={};for(const el of document.querySelectorAll('[id$="-benchmark-label"]')){out[el.id]=el.textContent;el.style.visibility='hidden';}return out;});
const look=(page,v)=>page.evaluate(async v=>{const L=lastLight,{MAIN}=await import('./terrain.js'),T=__details.THREE,W=L.world,R=W.details;let s={...v};
 const pick=(list,where={},i=0)=>R[list].filter(r=>Object.entries(where).every(([k,val])=>r[k]===val))[i];
 const wpos=g=>{g.updateWorldMatrix(true,false);return new T.Vector3().setFromMatrixPosition(g.matrixWorld);};
 let aim=null;
 if(v.friends){L.reset?.();L.start();for(let i=0;i<150;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';s={...s,d:L.state.distance,lat:L.state.lateral};}
 if(v.aimRec){const r=pick(v.aimRec.list,v.aimRec.where,v.aimRec.i||0);const p=wpos(r.g||r.root);const q=MAIN.project(p.x,p.z);aim=p;s={...s,d:q.u+(v.dd??-9),lat:Math.sign(q.v)*(v.latAbs??3.2)};}
 if(v.aimAt){const q=MAIN.point(v.aimAt.d,v.aimAt.lat);aim=new T.Vector3(q.x,q.y,q.z);}
 if(v.busiest){// the stretch of yard with the most toys, lawn chairs and kiddie pools on one side, seen from the street
  const items=[...R.toys,...R.chairs.filter(c=>c.kind==='lawn'),...R.pools].map(r=>{const p=wpos(r.g),q=MAIN.project(p.x,p.z);return {d:q.u,lat:q.v,p};}).filter(o=>Math.abs(o.lat)<20&&o.d>-400&&o.d<1100);
  let best=null;for(const o of items){const g=items.filter(x=>Math.sign(x.lat)===Math.sign(o.lat)&&x.d>=o.d&&x.d<o.d+26);if(!best||g.length>best.n)best={n:g.length,d:o.d,lat:o.lat,g};}
  const c=best.g.reduce((a,o)=>a.add(o.p),new T.Vector3()).divideScalar(best.g.length);aim=c;s={...s,d:best.d-(v.back??8),lat:Math.sign(best.lat)*3.2};window.__busy={n:best.n,d:+best.d.toFixed(1)};}
 L.place(s.d,s.lat,0);for(let i=0;i<4;i++)L.step(1/30);L.look(s.yaw||0,s.pitch||0);L.step(1/30);
 if(aim){window.__aim={x:aim.x,z:aim.z};const err=()=>{const c=L.camera,f=new T.Vector3();c.getWorldDirection(f);const t=new T.Vector3(aim.x-c.position.x,0,aim.z-c.position.z).normalize();f.y=0;f.normalize();return Math.atan2(f.x*t.z-f.z*t.x,f.x*t.x+f.z*t.z);};
  const set=y=>{s.yaw=y;L.look(y,s.pitch||0);L.step(1/30);};let sg=-1;for(let k=0;k<5;k++){const e0=err(),y0=s.yaw||0;set(y0+sg*e0);if(Math.abs(err())>Math.abs(e0)){sg=-sg;set(y0+sg*e0);}}window.__aimErr=+err().toFixed(4);}else window.__aimErr=null;
 window.__freeCam=null;
 if(v.free){let M;const f=v.free;
  if(f.kind==='rec'){const r=pick(f.list,f.where,f.i||0);const g=r.g||r.root;g.updateWorldMatrix(true,false);M={from:new T.Vector3(...f.from).applyMatrix4(g.matrixWorld),at:new T.Vector3(...f.at).applyMatrix4(g.matrixWorld)};}
  else if(f.kind==='hose'){const H=__details.handle,h=H.hoseInfo[f.i||0],y=W.groundY(MAIN.project(h.coil[0],h.coil[1]).u,MAIN.project(h.coil[0],h.coil[1]).v);const c=new T.Vector3(h.coil[0],y,h.coil[1]),b=new T.Vector3(h.bib[0],y,h.bib[1]);const out=new T.Vector3().subVectors(c,b).normalize(),side=new T.Vector3(-out.z,0,out.x);
   M={from:c.clone().addScaledVector(out,1.9).addScaledVector(side,1.1).add(new T.Vector3(0,1.25,0)),at:new T.Vector3().lerpVectors(c,b,.4).add(new T.Vector3(0,.25,0))};}
  else if(f.kind==='frame'){const fr=R.fences[0].frame,a=fr.point(f.u,f.v),b=fr.point(f.tu,f.tv);M={from:new T.Vector3(a.x,a.y+f.h,a.z),at:new T.Vector3(b.x,b.y+(f.th||0),b.z)};}
  else if(f.kind==='point'){const a=MAIN.point(f.d,f.lat),b=MAIN.point(f.td,f.tlat);M={from:new T.Vector3(a.x,a.y+f.h,a.z),at:new T.Vector3(b.x,b.y+(f.th||0),b.z)};}
  // the bike (and with it the sky dome, the shadow camera and the world's own distance culling) next to the subject; for a
  // raised or distant view, under the camera
  {const A=f.under?M.from:M.at,q=MAIN.project(A.x,A.z);L.place(q.u-3,Math.max(-3.3,Math.min(3.3,q.v)),0);for(let i=0;i<4;i++)L.step(1/30);L.look(0,0);L.step(1/30);}
  const c=L.camera;c.position.copy(M.from);c.up.set(0,1,0);c.lookAt(M.at);c.updateMatrixWorld(true);window.__freeCam={p:c.position.toArray(),q:c.quaternion.toArray()};}
 return {d:+(+s.d).toFixed(2),lat:+(+s.lat).toFixed(2),yaw:+(s.yaw||0).toFixed(3),aimError:window.__aimErr,busiest:window.__busy||null,free:!!v.free};},v);
const frame=(page,mode)=>page.evaluate(m=>{__details.setMode(m);__details.tick(true);window.__streetprops?.tick?.(true);window.__vegetation?.tick?.();window.__houses?.tick?.();window.__bikes?.tick?.();window.__pavement?.tick?.();
 if(window.__freeCam){const c=lastLight.camera;c.position.fromArray(window.__freeCam.p);c.quaternion.fromArray(window.__freeCam.q);c.updateMatrixWorld(true);}
 const i=lastLight.render();const c=lastLight.camera;if(window.__freeCam){c.position.fromArray(window.__freeCam.p);c.quaternion.fromArray(window.__freeCam.q);c.updateMatrixWorld(true);lastLight.render();}
 return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4)),fov:c.fov},clock:document.getElementById('date')?.textContent||null};},mode);
async function pair(page,v,flags){const at=await look(page,v);const lab=await labels(page);const cam=v.free?'QA camera (placed by hand beside the object; the game renderer, light and shadows)':'gameplay riding camera (QA placement)';
 const a=await frame(page,'authored');const A=await shot(page,`${v.n}--authored`,{kind:'game-renderer capture',camera:cam,mode:'authored',flags,view:v,at,...a});
 const b=await frame(page,'original');const B=await shot(page,`${v.n}--original`,{kind:'game-renderer capture',camera:cam,mode:'original',flags,view:v,at,...b});
 await page.evaluate(()=>__details.setMode('authored'));
 report.pairs.push({name:v.n,what:v.what,flags,camera:a.cam,cameraKind:cam,at,clock:a.clock,sameCamera:JSON.stringify(a.cam)===JSON.stringify(b.cam),labels:lab,authored:{calls:a.calls,triangles:a.triangles},original:{calls:b.calls,triangles:b.triangles},files:[A?.file,B?.file]});
 const vi=n=>{const k=VIEWS.findIndex(x=>x.n===n);return k<0?1e9:k;};report.pairs.sort((x,y)=>vi(x.name)-vi(y.name));save();}
const VIEWS=[
 {n:'D01-street-name-sign-close',what:'the street-name blades at Briarwood Lane: OAK HOLLOW DR and BRIARWOOD LN in their cast cross bracket on the galvanized post (QA camera)',free:{kind:'rec',list:'signs',where:{type:'junction'},i:0,from:[2.6,2.35,1.4],at:[0,2.82,0]}},
 {n:'D02-stop-sign-and-intersection',what:'the STOP sign at Briarwood Lane seen from the cross street, the intersection with Oak Hollow beyond (QA camera on Briarwood)',free:{kind:'rec',list:'signs',where:{type:'junction'},i:0,from:[6.5,1.55,-1.2],at:[0,2.0,0]}},
 {n:'D03-speed-limit-sign',what:'SPEED LIMIT 25 at d 150, as the ride passes it',aimRec:{list:'signs',where:{type:'speed'}},dd:-11,latAbs:2.4,pitch:.02},
 {n:'D04-children-at-play-sign',what:'SLOW CHILDREN AT PLAY near the start of the ride',aimRec:{list:'signs',where:{type:'children'}},dd:-11,latAbs:2.4,pitch:.02},
 {n:'D04b-no-outlet-sign',what:'NO OUTLET past Summerfield Road',aimRec:{list:'signs',where:{type:'outlet'}},dd:-11,latAbs:2.4,pitch:.02},
 {n:'D05-lawn-chairs',what:'a pair of lawn chairs left in a front yard (QA camera)',free:{kind:'rec',list:'chairs',where:{kind:'lawn'},i:0,from:[1.9,1.25,-2.2],at:[.4,.45,.1]}},
 {n:'D05b-porch-chairs',what:'white resin chairs on a front porch, from the street',aimRec:{list:'chairs',where:{kind:'porch'},i:6},dd:-6,latAbs:3.2,pitch:.02},
 {n:'D06-garden-hose',what:'a garden hose coiled on the lawn by a house, run to its hose bib on the wall (QA camera)',free:{kind:'hose',i:0}},
 {n:'D07-sprinkler',what:'an impact sprinkler on its spike, running, its hose across the lawn to the house (QA camera)',free:{kind:'rec',list:'sprinklers',i:1,from:[1.6,1.0,2.0],at:[0,.3,-.3]}},
 {n:'D08-wagon',what:'a red steel wagon left in a front yard (QA camera)',free:{kind:'rec',list:'toys',where:{kind:'wagon'},i:0,from:[1.3,.95,1.2],at:[0,.25,-.3]}},
 {n:'D09-big-wheel',what:'a big-wheel trike in the grass (QA camera)',free:{kind:'rec',list:'toys',where:{kind:'bigwheel'},i:0,from:[1.2,.85,-1.0],at:[0,.28,0]}},
 {n:'D10-yard-with-toys',what:'the stretch of front yards with the most toys, chairs and kiddie pools, from the street',busiest:true,back:9,pitch:-.04},
 {n:'D11-swing-set',what:'a back-yard swing set with its slide (QA camera between the houses)',free:{kind:'rec',list:'swings',i:0,from:[4.8,2.0,4.6],at:[.4,1.1,0]}},
 {n:'D12-trampoline',what:'a 12 ft trampoline with its enclosure (QA camera)',free:{kind:'rec',list:'trampolines',i:0,from:[4.4,2.6,4.4],at:[0,1.0,0]}},
 {n:'D13-kiddie-pool',what:'a hard plastic kiddie pool on a front lawn (QA camera)',free:{kind:'rec',list:'pools',i:0,from:[2.3,1.5,2.4],at:[0,.15,0]}},
 {n:'D14-shed',what:'a back-yard shed: T1-11 siding, trim, the braced door, shingles (QA camera)',free:{kind:'rec',list:'sheds',where:{door:true},i:0,from:[3.6,1.9,4.6],at:[0,1.2,0]}},
 {n:'D15-clothesline',what:'a clothesline with its sheet, towel and shirt (QA camera)',free:{kind:'rec',list:'clotheslines',i:0,from:[.6,1.55,-3.0],at:[-.2,1.45,0]}},
 {n:'D16-creek-chain-link',what:'Briarwood\'s creek-side chain-link fence following the dip (QA camera on the bank)',free:{kind:'frame',u:84,v:7.5,h:1.6,tu:89,tv:13,th:.7}},
 {n:'D17-lookout-field-fence',what:'the lookout\'s field fence beyond the bench (QA camera at the knoll)',free:{kind:'point',d:1165,lat:-9,h:1.55,td:1173,tlat:-14,th:.7}},
 {n:'D18-side-street-fences',what:'the side-street fences: Briarwood\'s creek runs either side of the channel, from the street (QA camera on Briarwood)',free:{kind:'frame',u:78,v:0,h:1.6,tu:100,tv:11,th:.6,under:true}},
 {n:'D19-residential-street',what:'a residential street with its signs, chairs, hoses, toys and back-yard structures',d:240,lat:-1.2,yaw:.05,pitch:-.03},
 {n:'D20-oak-hollow-wide-all-six',what:'a wide, raised view of Oak Hollow with all six benchmarks (QA raised camera, 13 m up)',free:{kind:'point',d:28,lat:-1,h:13,td:150,tlat:0,th:0,under:true}},
 {n:'D21-riding-past-household-things',what:'riding past a run of front yards: chairs, toys, a sprinkler and hoses on the right',aimAt:{d:452,lat:12},d:432,lat:2.6,pitch:-.03},
 {n:'D22-lookout-and-old-oak',what:'the lookout as the ride ends: the old oak, its tire swing, the bench and the chalk unchanged; only the field fence behind them is the details benchmark\'s',d:1132,lat:-.9,aimAt:{d:1160,lat:3},pitch:.03},
 {n:'D23-kettle-grill',what:'a kettle grill on a back patio (QA camera)',free:{kind:'rec',list:'grills',where:{on:'patio'},i:0,from:[1.5,1.35,1.6],at:[0,.7,0]}},
 {n:'D24-kids-bike-and-scooter',what:'a small kid\'s bike with training wheels lying in a yard (QA camera)',free:{kind:'rec',list:'toys',where:{kind:'kidbike'},i:0,from:[1.3,.95,1.1],at:[0,.12,0]}},
];
const loadSix=async page=>{await open(page,SIX);await waitSix(page);await startRide(page);};
if(PARTS.includes('E')){const only=process.env.VIEWS?process.env.VIEWS.split(','):null,pick=VIEWS.filter(v=>!only||only.some(o=>v.n.startsWith(o)));const errs=[];
 // (two views per fresh browser: in software rendering six benchmarks together come near this machine's memory, and every
 // rendered frame holds memory the software GPU releases late)
 for(let i=0;i<pick.length;i+=2)await withPage(async(page,{errors})=>{await loadSix(page);for(const v of pick.slice(i,i+2))await pair(page,v,'qa&'+SIX);errs.push(...errors);});
 const P=report.pairs.filter(p=>p.flags==='qa&'+SIX);
 check('Captures: every before/after pair is one camera and one frame ('+P.length+' pairs)',P.length>0&&P.every(p=>p.sameCamera),P.map(p=>[p.name,p.sameCamera]));
 const dc=P.map(p=>p.authored.calls-p.original.calls),dt=P.map(p=>p.authored.triangles/p.original.triangles);
 report.parts.E={cost:{drawCallDelta:[Math.min(...dc),Math.max(...dc)],triangleRatio:[+Math.min(...dt).toFixed(3),+Math.max(...dt).toFixed(3)],sum:{authored:{calls:P.reduce((a,p)=>a+p.authored.calls,0),tris:P.reduce((a,p)=>a+p.authored.triangles,0)},original:{calls:P.reduce((a,p)=>a+p.original.calls,0),tris:P.reduce((a,p)=>a+p.original.triangles,0)}}}};
 check('Cost (measured, reported): the details add at most 60 draw calls and at most 40 % more triangles in any captured frame',dc.every(x=>x<=60)&&dt.every(x=>x<=1.4),report.parts.E.cost);
 check('Six benchmarks, captures: no page errors',errs.length===0,errs);save();}

// ---------------------------------------------------------------------------------------------------------------- F
PART='F';
// Cost against the default game at the same riding cameras (software rendering: the ratio shows the added work; NOT a GPU
// number): the default game, and ?details in its two modes; fresh browsers.
const COST_VIEWS=[{n:'C1',d:40,lat:-1.2,pitch:-.1},{n:'C2',d:-232,lat:-.4,pitch:-.05},{n:'C3',d:128,lat:1.5,yaw:.55,pitch:.0},{n:'C4',d:380,lat:-1.1,yaw:.05,pitch:-.04},{n:'C5',d:76.5,lat:-3.4,yaw:.85,pitch:-.15},{n:'C6',d:-4.5,lat:-3.3,yaw:.75,pitch:-.12},{n:'C7',d:700,lat:1,pitch:-.03},{n:'C8',d:1132,lat:-.9,pitch:.03}];
const COST=`async v=>{const L=lastLight;L.place(v.d,v.lat,0);for(let i=0;i<4;i++)L.step(1/30);L.look(v.yaw||0,v.pitch||0);L.step(1/30);const out={};const gl=L.renderer.getContext(),px=new Uint8Array(4);
 const modes=window.__details?['authored','original']:['default'];
 for(const m of modes){if(window.__details){__details.setMode(m);__details.tick(true);}const i=L.render();const ms=[];for(let k=0;k<3;k++){const t0=performance.now();L.render();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);ms.push(performance.now()-t0);}ms.sort((a,b)=>a-b);out[m]={calls:i.calls,tris:i.triangles,ms:+ms[1].toFixed(0)};}
 if(window.__details)__details.setMode('authored');return out;}`;
if(PARTS.includes('F')){const R=report.parts.F={views:COST_VIEWS,default:{},details:{}};
 for(const [key,flags,per] of [['default','',3],['details','details',2]]){const errs=[];
  for(let i=0;i<COST_VIEWS.length;i+=per)await withPage(async(page,{errors})=>{const t0=Date.now();await open(page,flags);if(flags)await waitDT(page);await startRide(page);if(i===0)R[key+'LoadMs']=Date.now()-t0;
   for(const v of COST_VIEWS.slice(i,i+per))R[key][v.n]=await page.evaluate(`(${COST})(${JSON.stringify(v)})`);
   if(i===0)R[key+'Memory']=await page.evaluate(()=>({heapMB:+(performance.memory.usedJSHeapSize/1048576).toFixed(0),renderer:{...lastLight.renderer.info.memory},programs:lastLight.renderer.info.programs?.length,details:window.__details?.handle?{texMB:__details.handle.texInfo.gpuMB,materials:__details.handle.stats().materials,sets:__details.handle.stats().sets}:null}));
   errs.push(...errors);});
  check('Cost run ('+key+'): no page errors',errs.length===0,errs);}
 const sum=(k,m,f)=>COST_VIEWS.reduce((a,v)=>a+(R[k][v.n]?.[m]?.[f]||0),0);
 R.summary={default:{calls:sum('default','default','calls'),tris:sum('default','default','tris'),ms:sum('default','default','ms')},authored:{calls:sum('details','authored','calls'),tris:sum('details','authored','tris'),ms:sum('details','authored','ms')},original:{calls:sum('details','original','calls'),tris:sum('details','original','tris'),ms:sum('details','original','ms')}};
 R.summary.ratio={calls:+(R.summary.authored.calls/R.summary.default.calls).toFixed(3),tris:+(R.summary.authored.tris/R.summary.default.tris).toFixed(3),ms:+(R.summary.authored.ms/R.summary.default.ms).toFixed(3)};
 check('Cost against the default game measured at '+COST_VIEWS.length+' riding cameras (software frame time, draw calls, triangles: reported)',R.summary.default.ms>0&&R.summary.authored.ms>0,R.summary);save();}

report.finished=new Date().toISOString();save();server.close();
console.log(`\n${report.checks.length} passed, ${report.failures.length} failed`);process.exit(report.failures.length?1:0);
