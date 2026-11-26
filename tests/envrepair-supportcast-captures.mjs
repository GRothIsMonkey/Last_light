// Review evidence for ?envrepair and ?supportcast: same-frame before/after pairs and frame-sequence recordings, all with the
// eight flags on (?bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast). The shipped renderer under
// software WebGL (Chromium + ANGLE SwiftShader: NOT a GPU), 1600 x 900. A pair is one camera and one frame: only the
// benchmark's own key changes between the two images (' for the repairs, ; for the supporting cast). Recordings are
// rendered frame by frame at a fixed game step (deterministic: the game advances exactly 1/fps between frames, whatever
// the software renderer's speed), then encoded with ffmpeg; they play back in real time.
// usage: node tests/envrepair-supportcast-captures.mjs [what=pairs,mom,kid,fence,ride] (VIEWS=E01,S01 to redo some)
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const WHAT=(process.argv[2]||'pairs,mom,kid,fence,ride').split(',');
const OUT=path.resolve('docs/qa/envrepair-supportcast');const PAIRS=path.join(OUT,'browser'),VIDEO=path.join(OUT,'video');fs.mkdirSync(PAIRS,{recursive:true});fs.mkdirSync(VIDEO,{recursive:true});
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const ALL='bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast';
const commit=(()=>{try{return execFileSync('git',['rev-parse','--short','HEAD']).toString().trim();}catch{return null;}})();
const repPath=path.join(OUT,'captures.json');const rep=(()=>{try{return JSON.parse(fs.readFileSync(repPath,'utf8'));}catch{return {pairs:[],videos:[]};}})();
rep.renderer='Chromium (Playwright) with ANGLE SwiftShader — software rendering, not a GPU';rep.commit=commit;rep.flags=ALL;
const save=()=>fs.writeFileSync(repPath,JSON.stringify(rep,null,1)+'\n');
const sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const root=path.resolve('dist'),types={js:'application/javascript',html:'text/html',glb:'model/gltf-binary',json:'application/json',jpg:'image/jpeg',png:'image/png',css:'text/css'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');if(!f.startsWith(root)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
async function session(fn){const browser=await pw.chromium.launch({headless:true,args:ARGS});const page=await (await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1})).newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
 try{await page.goto(base+'/index.html?qa&'+ALL,{timeout:300000});await page.waitForFunction(()=>window.lastLight&&window.__envrepair&&window.__supportcast,null,{timeout:600000});
  await page.evaluate(()=>{for(const d of document.querySelectorAll('[id$="-benchmark-label"]'))d.style.display='none';const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);for(const id of ['subtitle'])document.getElementById(id).style.visibility='hidden';});
  return await fn(page,errors);}finally{await browser.close();}}
// the benchmarks' own per-frame upkeep (LOD buckets, the vegetation's wind, the repairs), then one render with the camera kept
const TICK=`()=>{for(const k of ['__details','__streetprops','__vegetation','__houses','__bikes','__pavement','__envrepair','__supportcast'])window[k]?.tick?.(true);}`;
const render=(page)=>page.evaluate(`(()=>{(${TICK})();const L=lastLight,c=L.camera;const fc=window.__fc;if(fc){c.position.fromArray(fc.p);if(fc.q)c.quaternion.fromArray(fc.q);else c.lookAt(...fc.at);c.updateMatrixWorld(true);}
 let i=L.render();if(fc){c.position.fromArray(fc.p);if(fc.q)c.quaternion.fromArray(fc.q);else c.lookAt(...fc.at);c.updateMatrixWorld(true);i=L.render();}return {calls:i.calls,triangles:i.triangles,cam:{p:c.position.toArray().map(v=>+v.toFixed(3)),q:c.quaternion.toArray().map(v=>+v.toFixed(4))},clock:document.getElementById('date')?.textContent||null};})()`);
const mode=(page,which,m)=>page.evaluate(([w,m])=>{if(w==='er'){__envrepair.setMode(m==='after'?'repaired':'original');}else{__supportcast.setMode(m==='after'?'authored':'original');}},[which,m]);

// ------------------------------------------------------------------------------------------------ pairs
// placement helpers evaluated in the page: P(view) returns nothing; sets window.__fc and places the bike near the subject
const PLACE=`async(v)=>{const L=lastLight,W=L.world,T=__envrepair.THREE,{MAIN}=await import('./terrain.js');const near=(x,z)=>{const q=MAIN.project(x,z);L.place(q.u-3,Math.max(-3.3,Math.min(3.3,q.v)),0);for(let i=0;i<4;i++)L.step(1/30);L.look(0,0);L.step(1/30);};
 const at=(set,i)=>{const it=set.items[i];return it.matrix;};let from,to;
 if(v.kind==='chain'){const set=__streetprops.handle.parts.props.sets['fence.chain'];
  // Oak Hollow's rear-lot chain link (parallel to the street at the back of the lots, |v| = 33.5): the longest continuous run
  // in the playable stretch; close and medium views straight on from inside the yard (the sight line checked clear of every
  // house footprint, in street coordinates), the distant view looking along the run
  const foot=W.plans.map(h=>{const x0=-h.w/2-(h.hasGarage&&h.gs<0?h.gw:0)-.4,x1=h.w/2+(h.hasGarage&&h.gs>0?h.gw:0)+.4,z0=-h.depth/2-.6,z1=h.depth/2+.6;return [[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>{const s=h.S(x,z);return [s.d,s.lat];});});
  const cross=(a,b,c,d)=>{const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);return o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;};
  const inside=(P,pt)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if((yi>pt[1])!==(yj>pt[1])&&pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi)c=!c;}return c;};
  const clear=(a,b)=>foot.every(P=>!inside(P,a)&&P.every((c,i)=>!cross(a,b,c,P[(i+1)%P.length])));
  const bays=set.items.map(it=>{const p=new T.Vector3().setFromMatrixPosition(it.matrix);return {p,q:MAIN.project(p.x,p.z),len:Math.hypot(it.matrix.elements[0],it.matrix.elements[2])};}).filter(o=>Math.abs(Math.abs(o.q.v)-33.5)<.8&&o.q.u>60&&o.q.u<1050);
  const runs=[];for(const side of [-1,1]){const l=bays.filter(o=>Math.sign(o.q.v)===side).sort((a,b)=>a.q.u-b.q.u);let r=null;for(const o of l){if(r&&o.q.u-r[r.length-1].q.u<o.len/2+r[r.length-1].len/2+.8)r.push(o);else{r=[o];runs.push(r);}}}
  runs.sort((a,b)=>(b[b.length-1].q.u-b[0].q.u)-(a[a.length-1].q.u-a[0].q.u));const run=runs[0];if(!run)throw new Error('no rear chain-link run');
  const side=Math.sign(run[0].q.v),u0=run[0].q.u-run[0].len/2,u1=run[run.length-1].q.u+run[run.length-1].len/2,vf=run[0].q.v;
  let cam,look,dist=v.dist;
  if(v.dist<30){const mids=run.slice().sort((a,b)=>Math.abs(a.q.u-(u0+u1)/2)-Math.abs(b.q.u-(u0+u1)/2));let pick=null;
   for(const d of [v.dist,v.dist*.85,v.dist*.7,v.dist*.55])for(const o of mids){const c=[o.q.u,o.q.v-side*d];if(clear(c,[o.q.u,o.q.v-side*.4])){pick={o,d};break;}}if(pick)break;
   if(!pick)throw new Error('no clear straight-on view of the run');dist=pick.d;const a=MAIN.point(pick.o.q.u,pick.o.q.v-side*pick.d);cam=new T.Vector3(a.x,a.y+(v.h||1.55),a.z);look=pick.o.p.clone().add(new T.Vector3(0,.7,0));}
  else{const a=MAIN.point(u0-1.5,vf-side*1.6),b=MAIN.point(Math.min(u1,u0+v.dist),vf);cam=new T.Vector3(a.x,a.y+(v.h||1.6),a.z);look=new T.Vector3(b.x,b.y+.6,b.z);dist=+(Math.min(u1,u0+v.dist)-u0+1.5).toFixed(1);}
  from=cam;to=look;near(to.x,to.z);window.__subject={run:[+u0.toFixed(1),+u1.toFixed(1)],side,bays:run.length,distance:+(+dist).toFixed(1)};}
 else if(v.kind==='rec'){const set=(v.from==='sp'?__streetprops.handle.parts.props.sets:v.from==='veh'?__streetprops.handle.parts.vehicles.sets:__details.handle.sets)[v.set];const M=at(set,v.i||0);from=new T.Vector3(...v.cam).applyMatrix4(M);to=new T.Vector3(...v.look).applyMatrix4(M);near(to.x,to.z);}
 else if(v.kind==='frame'){const f=W.sideFrames[0],a=f.point(v.u,v.v),b=f.point(v.tu,v.tv);from=new T.Vector3(a.x,a.y+v.h,a.z);to=new T.Vector3(b.x,b.y+(v.th||0),b.z);near(b.x,b.z);}
 else if(v.kind==='point'){const a=MAIN.point(v.d,v.lat),b=MAIN.point(v.td,v.tlat);from=new T.Vector3(a.x,a.y+v.h,a.z);to=new T.Vector3(b.x,b.y+(v.th||0),b.z);(v.under?near(a.x,a.z):near(b.x,b.z));}
 else if(v.kind==='ride'){L.place(v.d,v.lat,0);for(let i=0;i<4;i++)L.step(1/30);L.look(v.yaw||0,v.pitch||0);L.step(1/30);window.__fc=null;return;}
 const c=L.camera;c.position.copy(from);c.up.set(0,1,0);c.lookAt(to);c.updateMatrixWorld(true);window.__fc={p:c.position.toArray(),q:c.quaternion.toArray()};}`;
// a camera on the hoop kid with a clear sight line: candidate spots around him (street coordinates, dv>0 = toward his house,
// where he faces the hoop), the first whose ray to his chest meets no visible mesh (poles, cars, the garage) wins
const KIDVIEW=`(K,T,MAIN,cands,h,far)=>{let sc=K.person.group;while(sc.parent)sc=sc.parent;const g=K.person.group.getWorldPosition(new T.Vector3()),q=MAIN.project(g.x,g.z),sv=Math.sign(q.v)||1;
 const skip=new Set(),ex=o=>o&&o.traverse(x=>skip.add(x));ex(K.person.group);ex(window.__supportcast?.cast?.kid?.root);ex(lastLight.ambient.hoopKid.ball);
 const meshes=[];sc.traverseVisible(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!skip.has(o))meshes.push(o);});const rc=new T.Raycaster(),tgt=g.clone().add(new T.Vector3(0,1.0,0));
 for(const [du,dv] of cands){const a=MAIN.point(q.u+du,q.v+sv*dv);const p=new T.Vector3(a.x,a.y+h,a.z);const dir=tgt.clone().sub(p),L2=dir.length();dir.normalize();rc.set(p,dir);rc.far=L2-.3;
  if(!rc.intersectObjects(meshes,false).length)return {p:p.toArray(),at:tgt.toArray(),du,dv};}return null;}`;
const VIEWS=[
 {n:'E01-chain-link-close',what:'Oak Hollow chain link (the street props\' rear-lot fence) straight on at 2.5 m, from inside the yard: the wire up close; the coverage rule changes nothing here (QA camera)',kind:'chain',dist:2.5,h:1.5},
 {n:'E02-chain-link-medium',what:'the same run straight on from further into the yard (about 10 m; the exact distance is in the record): the wire starts to thin below the 0.5 test (QA camera)',kind:'chain',dist:12,h:1.6},
 {n:'E03-chain-link-distant',what:'looking along the run from its end, 1.6 m inside it: the bays recede from 2 m to 30-40 m; before, the far wire thins away; after, it keeps its coverage as a faint grey screen (QA camera)',kind:'chain',dist:40,h:1.6},
 {n:'E04-creek-vegetation',what:'Briarwood creek from the inside bank: the brush, reeds, ground patches and algae (before: procedural balls, flat blades, hard polygons; after: the vegetation library\'s shrubs and grasses, soft patches) (QA camera)',kind:'frame',u:92,v:9.6,h:1.6,tu:104,tv:28,th:.3},
 {n:'E05-creek-fence-and-vegetation',what:'the creek\'s chain link across the back of the strip and the planting around it (QA camera on the bank)',kind:'frame',u:91.5,v:24.5,h:1.5,tu:103,tv:31.2,th:-.1},
 {n:'E06-trampoline-supports',what:'a trampoline\'s supports: W-legs 45 mm with their sockets and feet, the enclosure poles clamped to the legs (QA camera, 3 m)',kind:'rec',set:'trampoline',i:0,cam:[3.0,.55,1.6],look:[1.6,.45,.6]},
 {n:'E07-trampoline-net',what:'a trampoline and its enclosure net from the yard, 7 m (QA camera)',kind:'rec',set:'trampoline',i:0,cam:[5.6,1.5,3.8],look:[0,.9,0]},
 {n:'E08-big-wheel',what:'a big wheel: the moulded body, tread ribs, pedal blocks on their cranks, axle caps (QA camera)',kind:'rec',set:'toy.bigwheel',i:0,cam:[1.1,.75,-.9],look:[0,.28,0]},
 {n:'E08b-wagon',what:'a wagon: the tray\'s walls, the rolled rim, hub caps, the handle\'s yoke (QA camera)',kind:'rec',set:'toy.wagon',i:0,cam:[1.2,.9,1.1],look:[0,.25,-.3]},
 {n:'E08c-swing-set',what:'a swing set: thicker legs on plastic feet, the hangers, seats with thickness (QA camera between the houses)',kind:'rec',set:'swing',i:0,cam:[3.0,1.4,4.0],look:[.2,.9,0]},
 {n:'E09-grounding-yard',what:'grounding: lawn chairs, a grill and toys with their contact shadows (QA camera)',kind:'rec',set:'chair.lawn',i:0,cam:[2.4,1.4,-2.8],look:[.3,.3,.1]},
 {n:'E09b-grounding-car-mailbox',what:'grounding: a parked car and a mailbox at the curb, the contact under the car (QA camera on the sidewalk)',kind:'rec',from:'veh',set:'sedan',i:2,cam:[3.2,1.4,-4.2],look:[0,.4,0]},
 {n:'E10-riding-view',what:'the riding camera in the repaired neighbourhood (first-person, a yard with play equipment ahead on the left)',kind:'ride',d:262,lat:-1.6,yaw:.45,pitch:-.04},
 {n:'E11-lookout-and-old-oak',what:'the lookout and the old oak as the ride ends: unchanged by the repairs',kind:'ride',d:1132,lat:-.9,yaw:.18,pitch:.03},
 {n:'E12-full-environment',what:'Oak Hollow wide with all six benchmarks and the repairs (QA raised camera, 13 m up)',kind:'point',d:28,lat:-1,h:13,td:150,tlat:0,th:0,under:true},
 {n:'E13-creek-from-oak-hollow',what:'what the Prologue\'s playable street shows of the creek: Briarwood Lane from Oak Hollow at the junction, the creek strip 90 m down it (riding camera)',kind:'junction'},
 {n:'S01-mother-porch-close',what:'Jamie\'s mother on her porch during her wave (QA camera on the front walk, 4 m); left: the authored character, right: the original',kind:'mom',t:.9,cam:'close',sc:true},
 {n:'S02-mother-from-the-street',what:'Jamie\'s mother waiting on the porch as the ride comes past (the riding camera, turned toward her); Jamie is the existing placeholder',kind:'mom',t:6,cam:'ride',sc:true},
 {n:'S03-hoop-kid-driveway',what:'the driveway basketball kid dribbling (QA camera beside the driveway, 5 m)',kind:'kid',phase:'dribble',sc:true},
 {n:'S04-hoop-kid-riding-view',what:'the hoop kid as the ride comes past (riding camera); he looks at the boys, ball at his hip',kind:'kidride',sc:true},
];
if(WHAT.includes('pairs')){const only=process.env.VIEWS?process.env.VIEWS.split(','):null,list=VIEWS.filter(v=>!only||only.some(o=>v.n.startsWith(o)));
 for(let i=0;i<list.length;i+=2)await session(async(page,errors)=>{for(const v of list.slice(i,i+2)){
   if(v.kind==='mom')await page.evaluate(async(v)=>{const L=lastLight;L.place(655,1.2,4.4);L.friends.warp(655);L.press('KeyW');for(let i=0;i<60*30;i++){L.step(1/30);const m=L.friends.mom;if(m.mode==='porch'&&m.t>=v.t)break;}L.release('KeyW');
     const {MAIN}=await import('./terrain.js');const T=__envrepair.THREE,grp=L.friends.mom.person.group,g=grp.getWorldPosition(new T.Vector3()),fw=new T.Vector3(0,0,-1).applyQuaternion(grp.getWorldQuaternion(new T.Quaternion()));fw.y=0;fw.normalize();const side=new T.Vector3(-fw.z,0,fw.x),c=L.camera;
     // close: on the front walk 3.1 m out from her toward the street, at porch eye height (above the foundation shrubs)
     if(v.cam==='close'){const m=L.friends.mom,a=MAIN.point(m.pd+.9,m.plat-Math.sign(m.plat)*3.1);c.position.set(a.x,g.y+1.5,a.z);c.lookAt(g.x,g.y+1.3,g.z);}else{L.look(0,0);L.step(1/30);c.lookAt(g.x,g.y+1.2,g.z);}
     c.updateMatrixWorld(true);window.__fc={p:c.position.toArray(),q:c.quaternion.toArray()};},v);
   else if(v.kind==='kid'||v.kind==='kidride')await page.evaluate(async([v,KV])=>{const kidView=(0,eval)(KV);const L=lastLight,K=L.ambient.hoopKid.kid,T=__envrepair.THREE;
     if(v.kind==='kid'){L.place(K.d-30,0,0);for(let i=0;i<300;i++){L.step(1/30);if(K.phase==='dribble'&&(K.t%.52)/.52>.1&&(K.t%.52)/.52<.16&&K.t>1)break;}
      const {MAIN}=await import('./terrain.js');const r=kidView(K,T,MAIN,[[2.6,3.4],[-2.6,3.4],[3.6,1.8],[-3.6,1.8],[0,4.2],[4.2,0],[-4.2,0],[3.4,-2.2],[-3.4,-2.2]],1.4);if(!r)throw new Error('no clear view of the hoop kid');
      const c=L.camera;c.position.fromArray(r.p);c.lookAt(r.at[0],r.at[1]-.15,r.at[2]);c.updateMatrixWorld(true);window.__fc={p:c.position.toArray(),q:c.quaternion.toArray()};window.__subject={du:r.du,dv:r.dv};}
     else{const {MAIN}=await import('./terrain.js');let ok=null;for(const [x,lat] of [[9,-1.5],[11,-1.5],[8,1.2],[13,-1.5],[10,1.2],[7,-1.5],[15,-1.5]]){L.place(K.d-x,lat,4.5);L.friends.warp(K.d-x);for(let i=0;i<20;i++)L.step(1/30);
       const g=K.person.group.getWorldPosition(new T.Vector3()),c=L.camera;c.lookAt(g.x,g.y+1,g.z);c.updateMatrixWorld(true);const q=MAIN.project(c.position.x,c.position.z),gq=MAIN.project(g.x,g.z);
       const r=kidView(K,T,MAIN,[[q.u-gq.u,(q.v-gq.v)*(Math.sign(gq.v)||1)]],c.position.y-MAIN.point(q.u,q.v).y);if(r){ok={x,lat};break;}}
      window.__subject=ok;const c=L.camera;const g=K.person.group.getWorldPosition(new T.Vector3());c.lookAt(g.x,g.y+1,g.z);c.updateMatrixWorld(true);window.__fc={p:c.position.toArray(),q:c.quaternion.toArray()};}},[v,KIDVIEW]);
   else if(v.kind==='junction')await page.evaluate(async()=>{const L=lastLight,W=L.world,f=W.sideFrames[0],J=f.junction;L.place(J.d-6,J.side*2.5,0);for(let i=0;i<4;i++)L.step(1/30);const c=L.camera;const b=f.point(J.creek.u,0);c.lookAt(b.x,b.y+1.2,b.z);c.updateMatrixWorld(true);window.__fc={p:c.position.toArray(),q:c.quaternion.toArray()};});
   else await page.evaluate(`(${PLACE})(${JSON.stringify(v)})`);
   const which=v.sc?'sc':'er',files=[],stats={};
   // warm-up: the street props' paint/metal environment and the LOD buckets settle on the first renders at a new camera,
   // so both images of the pair are taken from the same settled state
   for(const m of ['after','before','after']){await mode(page,which,m);await render(page);}
   for(const m of ['after','before']){await mode(page,which,m);const r=await render(page);const f=path.join(PAIRS,`${v.n}--${m==='after'?(v.sc?'authored':'repaired'):'original'}.jpg`);await page.screenshot({path:f,type:'jpeg',quality:90,timeout:480000});files.push(path.relative(process.cwd(),f));stats[m]=r;}
   await mode(page,which,'after');
   rep.pairs=rep.pairs.filter(p=>p.name!==v.n);const subject=await page.evaluate(()=>window.__subject||null);rep.pairs.push({name:v.n,what:v.what,subject,key:v.sc?'; (supporting cast)':'\' (repairs)',camera:stats.after.cam,sameCamera:JSON.stringify(stats.after.cam)===JSON.stringify(stats.before.cam),clock:stats.after.clock,
    after:{calls:stats.after.calls,triangles:stats.after.triangles},before:{calls:stats.before.calls,triangles:stats.before.triangles},files,sha256:files.map(f=>sha(f))});
   rep.pairs.sort((a,b)=>a.name.localeCompare(b.name));save();console.log('pair',v.n,stats.after.calls,stats.after.triangles,'/',stats.before.calls,stats.before.triangles);}
  if(errors.length)console.log('errors',errors.slice(0,5));});}

// ------------------------------------------------------------------------------------------------ recordings
const encode=(dir,name,fps,meta)=>{const f=path.join(VIDEO,name+'.mp4');execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',path.join(dir,'%05d.jpg'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','23','-preset','medium',f]);
 rep.videos=rep.videos.filter(v=>v.name!==name);rep.videos.push({name,file:path.relative(process.cwd(),f),fps,bytes:fs.statSync(f).size,sha256:sha(f),...meta});save();fs.rmSync(dir,{recursive:true,force:true});console.log('video',name);};
async function record(page,name,fps,frames,stepFn,meta){const dir=fs.mkdtempSync(path.join(VIDEO,'.frames-'));
 for(let k=0;k<frames;k++){const done=await page.evaluate(stepFn,{k,dt:1/fps});await render(page);const fr=path.join(dir,String(k).padStart(5,'0')+'.jpg');for(let a=0;;a++){try{await page.screenshot({path:fr,type:'jpeg',quality:84,timeout:480000});break;}catch(e){if(a>=3)throw e;await new Promise(r=>setTimeout(r,2000));}}if(done)break;}
 encode(dir,name,fps,meta);}
// the mother's whole scene, from the door opening to its closing, from the front walk across the street (the ride goes on)
if(WHAT.includes('mom'))await session(async(page)=>{await page.evaluate(async()=>{const L=lastLight;L.place(660,1.2,4.4);L.friends.warp(660);L.press('KeyW');for(let i=0;i<30*30;i++){L.step(1/30);if(L.friends.mom.mode!=='waiting')break;}
  const {MAIN}=await import('./terrain.js');const a=MAIN.point(788.5,5.2),b=MAIN.point(791.6,13.4);window.__fc={p:[a.x,a.y+1.5,a.z],at:[b.x,b.y+1.25,b.z]};window.__mm={stop:0};});
 await record(page,'V02-jamies-mother-complete-scene',12,640,({k,dt})=>{const L=lastLight;const n=Math.round(30*dt);for(let i=0;i<n;i++){L.step(1/30);if(L.state.distance>778)L.release('KeyW');}const m=L.friends.mom;if(m.mode==='gone'&&m.closeT>1.2)window.__mm.stop++;return window.__mm.stop>6;},
  {what:'Jamie\'s mother\'s complete Prologue scene in the running game: the door opens, she comes out, waves and calls (silently: she has no line), waits, Jamie arrives (the existing procedural Jamie: a placeholder, not Astra\'s Phase 1B character), she follows him in, the door closes. Camera: QA camera on the street in front of the house; the ride goes on as in the game.'});});
if(WHAT.includes('kid'))await session(async(page)=>{await page.evaluate(async(KV)=>{const kidView=(0,eval)(KV);const {MAIN}=await import('./terrain.js');const L=lastLight,K=L.ambient.hoopKid.kid,T=__envrepair.THREE;L.place(K.d-32,0,0);for(let i=0;i<5;i++)L.step(1/30);
  const r=kidView(K,T,MAIN,[[3.2,4.2],[-3.2,4.2],[4.4,2.4],[-4.4,2.4],[0,5.2],[5.2,0],[-5.2,0],[4,-2.6],[-4,-2.6]],1.45);if(!r)throw new Error('no clear view of the hoop kid');window.__fc={p:r.p,at:[r.at[0],r.at[1],r.at[2]]};},KIDVIEW);
 await record(page,'V03-hoop-kid-driveway',15,150,({k,dt})=>{const L=lastLight;L.step(dt);return false;},{what:'the hoop kid in the running game: dribbling, the shot (release at the controller\'s 0.35 s), the ball back off the rim, the catch; QA camera beside the driveway; 10 s'});
 await page.evaluate(()=>{const L=lastLight,K=L.ambient.hoopKid.kid;window.__fc=null;L.place(K.d-34,-1.5,4.6);L.friends.warp(K.d-34);L.press('KeyW');for(let i=0;i<10;i++)L.step(1/30);});
 await record(page,'V03b-hoop-kid-riding-past',15,120,({k,dt})=>{const L=lastLight,K=L.ambient.hoopKid.kid;L.step(dt);const c=L.camera,g=K.person.group.position;const s=L.state;L.look(Math.max(-1.2,Math.min(1.2,-(Math.atan2(g.x-c.position.x,-(g.z-c.position.z))-(-c.rotation?.y||0))*0)),0);return false;},{what:'riding past the hoop kid with the group (riding camera): he stops dribbling and watches the boys go by, ball at his hip'});});
// riding past chain link in both modes (the shimmer and the coverage in motion)
if(WHAT.includes('fence'))await session(async(page)=>{const r=await page.evaluate(async()=>{const set=__streetprops.handle.parts.props.sets['fence.chain'],T=__envrepair.THREE,{MAIN}=await import('./terrain.js');
  const pts=set.items.map(it=>{const p=new T.Vector3().setFromMatrixPosition(it.matrix);return MAIN.project(p.x,p.z);}).filter(q=>Math.abs(q.v)>9&&Math.abs(q.v)<26&&q.u>60&&q.u<1000).sort((a,b)=>a.u-b.u);
  let best=null;for(const q of pts){const n=pts.filter(o=>o.u>=q.u&&o.u<q.u+40).length;if(!best||n>best.n)best={n,u:q.u,v:q.v};}return best;});
 for(const m of ['before','after']){await page.evaluate(({u,v})=>{const L=lastLight;L.place(u-55,Math.sign(v)*2.6,5.2);L.press('KeyW');for(let i=0;i<5;i++)L.step(1/30);window.__fc=null;},r);await mode(page,'er',m);
  await record(page,'V01-riding-past-chain-link--'+(m==='after'?'repaired':'original'),15,135,({k,dt})=>{const L=lastLight;L.step(dt);L.look(.32*Math.sign(1),0);return false;},{what:`riding past Oak Hollow chain link at 5 m/s (riding camera looking 18 degrees toward the fences), ${m==='after'?'with the coverage rule':'as the street props left it'}: from 55 m out to alongside`,subject:r});}});
// a continuous ride through the Prologue's relevant stretch: the hoop kid, the yards and fences, Jamie's mother's scene
if(WHAT.includes('ride'))await session(async(page)=>{await page.evaluate(()=>{const L=lastLight;L.place(96,1.0,4.8);L.friends.warp(96);L.press('KeyW');for(let i=0;i<10;i++)L.step(1/30);window.__fc=null;});
 await record(page,'V04-combined-prologue-ride',10,3000,({k,dt})=>{const L=lastLight;const n=Math.round(30*dt);for(let i=0;i<n;i++)L.step(1/30);const s=L.state;
   // look a little toward what the ride passes: the hoop kid's driveway, Jamie's porch
   const d=s.distance;L.look(d>118&&d<150?.42*Math.min(1,(d-118)/8)*Math.min(1,(150-d)/8):d>700&&d<800?-.35*Math.min(1,(d-700)/15)*Math.min(1,(800-d)/12):0,0);
   return d>830;},{what:'a continuous ride with the group (riding camera) from the hoop kid\'s street to Jamie\'s house: the repaired neighbourhood, the hoop kid, the yards, Jamie\'s mother\'s whole scene; all eight flags; Jamie is the existing placeholder'});});
server.close();
