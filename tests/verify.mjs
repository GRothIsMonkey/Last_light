// Headless verification of Last Light: the real game module runs against a mocked DOM and
// renderer, with actual Three.js geometry, so world geometry, riding, characters, interface,
// interactions, the ending and replay are all checked on the code that ships in dist/.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from '../dist/three.module.js';
import {roadFrame,roadGrade,groundPoint,roadSurface,LATERAL_LIMIT,heading} from '../dist/route.js';
import {memories,LENGTH,reflections} from '../dist/story.js';
import {BODY,BIKE,newPose,ridePose,walkPose,dismountKeys,samplePose,createPerson,createBike,applyPose,P,stride,bikeGeometry} from '../dist/rig.js';
import {LOOKOUT,JUNCTIONS} from '../dist/world.js';
import {STREETS} from '../dist/layout.js';
import {MAIN} from '../dist/terrain.js';
import {HOUSE} from '../dist/palette.js';
import {CAST,FORMATION} from '../dist/cast.js';
const root=fileURLToPath(new URL('../dist/',import.meta.url));

// A small DOM: elements by id, classList, events; plus localStorage and fullscreen.
const elements=new Map(),events=new Map(),docEvents=new Map();
const HIDDEN=['ending','pause','error','ride-ui','mobile','act','settings','credits','continue'];
function classes(){const set=new Set();return {set,add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c)};}
function element(id){if(!elements.has(id)){const el={id,hidden:HIDDEN.includes(id),style:{},textContent:'',innerHTML:'',value:'',checked:false,children:[],events:new Map(),classList:classes(),
  setAttribute(){},replaceChildren(){this.children=[];},append(x){this.children.push(x);},addEventListener(type,fn){this.events.set(type,fn);},setPointerCapture(){},focus(){}};elements.set(id,el);}return elements.get(id);}
const canvas=element('world');
const store={};globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);}};
globalThis.document={getElementById:element,createElement:()=>element('el'+Math.random()),createTextNode:text=>({textContent:text}),body:{classList:classes()},documentElement:{requestFullscreen(){document.fullscreenElement=this;return Promise.resolve();}},fullscreenElement:null,exitFullscreen(){this.fullscreenElement=null;},
 addEventListener:(t,fn)=>docEvents.set(t,fn),hidden:false,pointerLockElement:null,exitPointerLock(){this.pointerLockElement=null;docEvents.get('pointerlockchange')?.();}};
canvas.requestPointerLock=()=>{document.pointerLockElement=canvas;docEvents.get('pointerlockchange')?.();return Promise.resolve();};
globalThis.window={};globalThis.devicePixelRatio=2;globalThis.innerWidth=1440;globalThis.innerHeight=900;globalThis.matchMedia=()=>({matches:false});globalThis.addEventListener=(type,fn)=>events.set(type,fn);let tick;globalThis.requestAnimationFrame=fn=>tick=fn;
globalThis.FakeRenderer=class{constructor(){this.shadowMap={};this.capabilities={maxTextureSize:8192};this.pixelRatio=1;}setPixelRatio(r){this.pixelRatio=r;}setSize(){}render(){}};
let source=fs.readFileSync(root+'game.js','utf8').replaceAll(/'\.\/([\w.\-]+)\.js'/g,(_,name)=>JSON.stringify(pathToFileURL(root+name+'.js').href)).replace('new THREE.WebGLRenderer','new globalThis.FakeRenderer');
source+=`\nglobalThis.harness={get snapshot(){return {state,distance,speed,lateral,look,headPitch,pedalPhase,steerVelocity,nextMemory,currentChapter,finaleT,callDone,walkD,walkLat,walkYaw,walkPitch,fade,clock,manualLook,glance,yawOffset,push,stamina,captionTimer,sens}},road,scene,camera,bikeRoot,playerBike,friends,originals,keys,world,ambient,contact,selfPose,self,foot,ui,interact,ending,nostalgia,renderer,sunlight,walkTo(d,lat,yaw=0,pitch=0){walkD=d;walkLat=lat;walkYaw=yaw;walkPitch=pitch;},place(d,lat,v=4.5){contact.reset();distance=d;lateral=lat;speed=v;yawOffset=0;psiVel=0;steerIn=0;bikeY=null;prevYaw=null;},get bikeY(){return bikeY;},
 jump:jumpTo,dev,devStart,chapter,chapter2,chapter3,tension,captionTone,get audioRef(){return audio;},memory,get memCast(){return memCast;},skyMat,hemi,face(a,pitch=0){if(state==='c1-walk'){wa=a;walkPitch=pitch;}else roam.a=a;},look(y,p=0){mouseYaw=y;mousePitch=p;},get prompt(){return promptItems();},roam,nav,placePlayer,action:()=>action(),drive(pts,o={}){auto={pts,i:0,...o};},get driving(){return auto&&!auto.done;},stopDriving(){auto=null;for(const k of ['KeyW','KeyA','KeyD','KeyS'])keys.delete(k);},get night(){return {state,wx,wz,wa,speed,fade,roam:{...roam}};}};`;
const t0=Date.now();
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const buildMs=Date.now()-t0;
const h=globalThis.harness,key=code=>({code,preventDefault(){},repeat:false});let t=0,simTime=0;
const DT=1/30;const advance=(seconds,each)=>{for(let i=0;i<Math.ceil(seconds/DT-1e-9);i++){t+=DT*1000;tick(t);simTime+=DT;each?.();}};
const press=code=>events.get('keydown')(key(code)),release=code=>events.get('keyup')(key(code)),tap=code=>{press(code);release(code);};
const checks=[],metrics={};function check(name,fn){try{fn();}catch(e){e.message=name+': '+e.message;throw e;}checks.push(name);}
// QUICK=1 skips the slow world-geometry sweeps while iterating on gameplay checks.
const QUICK=!!process.env.QUICK,wcheck=(name,fn)=>QUICK?null:check(name,fn);
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
const drag=(dx,dy=0)=>{canvas.events.get('pointerdown')({clientX:0,clientY:0,pointerId:1});events.get('mousemove')({clientX:dx,clientY:dy});canvas.events.get('pointerup')();};
const setField=(id,value)=>{const el=element(id);if(typeof value==='boolean')el.checked=value;else el.value=String(value);el.events.get('input')?.({target:el});};
const W=h.world,visible=W.merged.filter(m=>m.visible!==false&&!m.material.transparent);
advance(.05);
// TEMPORARY (private playtest build): record the state at each natural chapter arrival for the dev chapter selector checks.
const {installNaturalCapture,runDevChapterChecks,diff:devDiff,normalize:devNorm}=await import('./dev-chapters-sim.mjs');const devCapture=installNaturalCapture(h,element);
// ONLY=script SCRIPT=<file>: run a development script against the same harness (nothing is checked or reported).
if(process.env.ONLY==='script'){const m=await import(pathToFileURL(process.env.SCRIPT).href);await m.default({h,advance,press,release,tap,check,element,metrics,W,THREE,groundPoint,buildMs});process.exit(0);}
// ONLY=chapter3: a quick loop for Chapter Three alone (from the end of Chapter Two), for development.
if(process.env.ONLY==='chapter3'){const {playChapterThree,runChapterThreeChecks}=await import('./chapter3-sim.mjs');const T3={h,advance,press,release,tap,check,element,metrics,groundPoint,W};
 if(!process.env.SKIPPLAY){h.jump('chapter2-end');playChapterThree(T3,'chapter three alone');for(let n=2;n<=+(process.env.REPLAYS||1);n++){h.jump('chapter2-end');playChapterThree(T3,'replay '+n);}}if(!process.env.SKIPCHECKS)await runChapterThreeChecks(T3);console.log(JSON.stringify({passed:checks.length,checks,metrics},null,1));process.exit(0);}

// ------------------------------------------------------------------------------------------
// World: roads, ground, houses, continuity
// ------------------------------------------------------------------------------------------
wcheck('all local assets resolve',()=>{const html=fs.readFileSync(root+'index.html','utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(m[1]!=='./')assert.ok(fs.existsSync(root+m[1]),m[1]);for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.js')))for(const m of fs.readFileSync(root+f,'utf8').matchAll(/from '\.\/([\w.\-]+)'/g))assert.ok(fs.existsSync(root+m[1]),f+' -> '+m[1]);});
wcheck('gentle continuous route with constant distance scale',()=>{let maxGrade=0,maxStep=0;for(let d=0;d<LENGTH+40;d+=.5){const a=roadFrame(d),b=roadFrame(d+.5);assert.ok(Math.abs(Math.hypot(b.x-a.x,b.z-a.z)-.5)<.0002);maxGrade=Math.max(maxGrade,Math.abs(roadGrade(d)));maxStep=Math.max(maxStep,Math.abs(a.heading-b.heading));}assert.ok(maxGrade<.043);assert.ok(maxStep<.007);});
wcheck('asphalt faces upward and follows terrain throughout the ride',()=>{for(let d=0;d<=LENGTH;d+=5)for(const side of [-LATERAL_LIMIT,0,LATERAL_LIMIT]){const p=groundPoint(d,side);ray.set(new THREE.Vector3(p.x,p.y+5,p.z),down);const hits=ray.intersectObject(h.road);assert.ok(hits.length,`road missing at ${d}, ${side}`);assert.ok(hits[0].face.normal.y>.99);assert.ok(Math.abs(hits[0].point.y-roadSurface(d,side))<.002,`height discontinuity ${d}`);}});
wcheck('the street runs on well behind the start (no road edge in view looking back)',()=>{const asphalt=h.originals.filter(o=>o.material===h.road.material);for(let d=-400;d<0;d+=10){const p=groundPoint(d,0);ray.set(new THREE.Vector3(p.x,p.y+5,p.z),down);assert.ok(ray.intersectObjects(asphalt).length,`no road at ${d}`);}});
wcheck('side streets leave through curb openings and continue out of sight',()=>{const asphalt=h.originals.filter(o=>o.material===h.road.material);assert.equal(JUNCTIONS.length,2);
 for(const [i,j] of JUNCTIONS.entries()){const f=W.sideFrames[i];for(let u=3.5;u<210;u+=.5){const p=u<4.7?groundPoint(j.d,j.side*u):f.point(u,0);ray.set(new THREE.Vector3(p.x,p.y+5,p.z),down);const hits=ray.intersectObjects(asphalt);assert.ok(hits.length,`gap at junction ${j.d}, ${u}`);assert.ok(Math.abs(hits[0].point.y-p.y)<.09,`step at junction ${j.d}, ${u}`);}}});
wcheck('side streets are whole streets: houses, sidewalks, lamps and poles on both',()=>{for(const [i,j] of JUNCTIONS.entries()){const f=W.sideFrames[i];
  const lots=W.sidePlans.filter(p=>p.frameId===f.id);assert.ok(lots.length>=10,`${j.name}: only ${lots.length} houses`);assert.ok(lots.some(p=>p.side>0)&&lots.some(p=>p.side<0),`${j.name}: houses on one side only`);
  assert.ok(W.poles.filter(p=>p.frame===f).length>=4,`${j.name}: power line stops short`);
  for(const s of [-1,1])for(let u=40;u<200;u+=40){const p=f.point(u,s*(j.half+2.35));ray.set(new THREE.Vector3(p.x,p.y+4,p.z),down);const hit=ray.intersectObjects(visible)[0];assert.ok(hit&&Math.abs(hit.point.y-p.y-.16)<.2,`${j.name}: no sidewalk at ${u}, ${s}`);}}});
wcheck('sidewalks are clear to ride: nothing parked or left standing on them',()=>{const bad=[];
 const probe=(p,label)=>{ray.set(new THREE.Vector3(p.x,p.y+6,p.z),down);const hit=ray.intersectObjects(visible,false).find(x=>x.point.y-p.y<2.1);if(hit&&hit.point.y-p.y>.3)bad.push(label+' '+(hit.point.y-p.y).toFixed(2));};
 for(let d=-60;d<1110;d+=1.5)for(const s of [-1,1]){if(JUNCTIONS.some(j=>j.side===s&&Math.abs(d-j.d)<j.half+j.corner+3))continue;probe(groundPoint(d,s*7.1),`main ${d} ${s}`);}
 for(const [i,j] of JUNCTIONS.entries()){const f=W.sideFrames[i];for(let u=j.corner+4;u<200;u+=1.5)for(const s of [-1,1])probe(f.point(u,s*(j.half+2.4)),`${j.name} ${u} ${s}`);}
 assert.deepEqual(bad,[]);});
wcheck('walkable ground height matches rendered lawns, walks, drives and the lookout',()=>{
 // Every point riders and walkers stand on must agree with the visible surface under it.
 const solid=W.merged.filter(m=>!m.material.transparent&&m.material.side!==THREE.BackSide);const spots=[];
 for(const home of Object.values(W.homes).filter(h=>h.frameId==='main')){for(let u=0;u<=1;u+=.25){spots.push([home.drivD,home.side*(5.2+u*(home.endLat-6))]);}const door=home.S(home.doorX,home.front+.5);spots.push([door.d,door.lat]);const st=home.S(home.doorX,home.stepFront+.5);spots.push([st.d,st.lat]);}
 for(let d=40;d<1100;d+=97)for(const lat of [-12,-7,7,12])spots.push([d,lat]);for(let d=1124;d<1170;d+=5)for(const lat of [-9,-3,0,4,10])spots.push([d,lat]);
 let worst=0;for(const [d,lat] of spots){if(W.obstacles.some(o=>d>=o.d0&&d<=o.d1&&lat>=o.l0&&lat<=o.l1))continue;const p=groundPoint(d,lat);ray.set(new THREE.Vector3(p.x,W.groundY(d,lat)+.9,p.z),down);const hit=ray.intersectObjects(solid)[0];if(!hit)continue;const err=Math.abs(hit.point.y-W.groundY(d,lat));if(err>worst)worst=err;assert.ok(err<.06,`ground mismatch ${err.toFixed(3)} at ${d.toFixed(1)}, ${lat.toFixed(1)}`);}metrics.maxGroundMismatch=+worst.toFixed(3);});
wcheck('no world edge: the ground reaches the horizon in every direction',()=>{
 // From eye height at eight places along the ride, 24 directions each: a ray 2 degrees below
 // the horizon must land on something within the camera's range, and a level ray should
 // almost always meet houses, trees or hills rather than bare sky.
 ray.far=385;let level=0,levelHit=0;
 for(const d of [-20,150,400,595,750,870,1000,LOOKOUT.stop.d]){const p=groundPoint(d,0),y=W.groundY(d,0)+1.5;
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2;for(const pitch of [-.035,0]){ray.set(new THREE.Vector3(p.x,y,p.z),new THREE.Vector3(Math.sin(a)*Math.cos(pitch),Math.sin(pitch),Math.cos(a)*Math.cos(pitch)));const hit=ray.intersectObjects(visible,false)[0];
   if(pitch<0)assert.ok(hit,`world ends at d ${d}, bearing ${k*15} deg`);else{level++;if(hit)levelHit++;}}}}
 ray.far=Infinity;metrics.levelHorizonCoverage=+(levelHit/level).toFixed(3);assert.ok(levelHit/level>.9,'bare horizon '+levelHit/level);});
wcheck('gaps between first-row houses show more neighborhood behind them',()=>{let gaps=0,filled=0;
 for(const side of [-1,1]){const row=W.plans.filter(p=>p.side===side&&p.u>40&&p.u<1080).sort((a,b)=>a.u-b.u);
  for(let i=0;i<row.length-1;i++){const u=(row[i].u+row[i+1].u)/2;if(JUNCTIONS.some(j=>Math.abs(u-j.d)<20))continue;gaps++;const a=groundPoint(u,0),b=groundPoint(u,side*80),y=W.groundY(u,0)+1.6;
   ray.set(new THREE.Vector3(a.x,y,a.z),new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize());ray.far=260;const hit=ray.intersectObjects(visible,false).find(x=>x.distance>12);if(hit)filled++;/* poles and lamps stand on lot lines */}}
 ray.far=Infinity;metrics.gapBackdropCoverage=+(filled/gaps).toFixed(3);assert.ok(filled/gaps>.9,`${gaps-filled} of ${gaps} gaps look into nothing`);});
wcheck('neighborhood continues: second row, far houses, trees and rolling land',()=>{const b=W.background;assert.ok(b.row2>=80,'row 2 '+b.row2);assert.ok(b.farHouses>=300,'far houses '+b.farHouses);assert.ok(b.trees>=800,'trees '+b.trees);metrics.background=b;});
wcheck('street signs: real names, unique, on double-sided blades at every junction',()=>{const names=JUNCTIONS.map(j=>j.name);assert.equal(new Set([...names,STREETS.main]).size,names.length+1);
 for(const n of names)assert.ok(/^[A-Z]+ (LN|RD|ST|DR|CT|AVE|WAY)$/.test(n),n);assert.equal(W.signs.length,JUNCTIONS.length);
 const faces=h.originals.filter(o=>o.name==='sign-face');for(const n of [...names,STREETS.main]){const f=faces.filter(o=>o.userData.sign===n);assert.ok(f.length>=2,`${n}: ${f.length} faces`);
  // Front and back face opposite ways.
  const nz=f.map(o=>new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.normal,0));assert.ok(nz.some(a=>nz.some(b=>a.dot(b)<-.9)),`${n} is one-sided`);}});
wcheck('all roof slopes face upward',()=>{const roofs=h.originals.filter(o=>o.name==='roof-slope');assert.ok(roofs.length>60);for(const roof of roofs){const n=roof.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(n.getY(i)>.2,'inverted roof slope');}});
wcheck('houses are closed on all four sides, with windows front, back and on open sides',()=>{
 const curtain=new THREE.Color(HOUSE.curtain).getHex(),isWindow=x=>x.object.material===W.glassLit||(x.object.geometry.attributes.color&&new THREE.Color().fromBufferAttribute(x.object.geometry.attributes.color,x.face.a).getHex()===curtain);
 const houses=W.houses.filter(p=>p.frameId==='main'&&p.lod==='full'&&!p.far);let n=0,sideGlass=0,sides=0;
 const cast=(P,lx,lz,tx,tz,y,far)=>{const o=P.toWorld(lx,lz),tg=P.toWorld(tx,tz);ray.set(new THREE.Vector3(o.x,y,o.z),new THREE.Vector3(tg.x-o.x,0,tg.z-o.z).normalize());ray.far=far;return ray.intersectObjects(visible,false)[0];};
 for(const P of houses.filter((_,i)=>i%4===0)){n++;const g=P.toWorld(0,0).ground;
  const faces=[{dir:[0,1],half:P.w/2,dist:P.depth/2,name:'front'},{dir:[0,-1],half:P.w/2,dist:P.depth/2,name:'rear'},{dir:[1,0],half:P.depth/2,dist:P.w/2,name:'right'},{dir:[-1,0],half:P.depth/2,dist:P.w/2,name:'left'}];
  for(const F of faces){const at=k=>[F.dir[0]?F.dir[0]*(F.dist+3):k*F.half,F.dir[1]?F.dir[1]*(F.dist+3):k*F.half,F.dir[0]?0:k*F.half,F.dir[1]?0:k*F.half];
   // Closed: no ray at body height gets through the wall.
   for(let k=-.7;k<=.71;k+=.1)for(const hy of [1.05,1.45]){const [lx,lz,tx,tz]=at(k);assert.ok(cast(P,lx,lz,tx,tz,g+P.floor+hy,F.dist+3.2),`see-through ${F.name} wall on the house at ${P.u.toFixed(0)}`);}
   // Windows: sweep finely at sill-to-head height; garage walls have none.
   const garageWall=P.hasGarage&&((F.name==='right'&&P.gs>0)||(F.name==='left'&&P.gs<0));if(garageWall)continue;
   let win=0;for(let k=-.85;k<=.86;k+=.04){const [lx,lz,tx,tz]=at(k);const hit=cast(P,lx,lz,tx,tz,g+1.45,F.dist+3.2);if(hit&&isWindow(hit))win++;}
   if(F.name==='front'||F.name==='rear')assert.ok(win>0,`no ${F.name} windows on the house at ${P.u.toFixed(0)}`);else{sides++;if(win)sideGlass++;}}}
 ray.far=Infinity;metrics.housesChecked=n;metrics.openSideWallsWithWindows=`${sideGlass}/${sides}`;assert.ok(sideGlass>=sides*.8,'side windows '+sideGlass+'/'+sides);});
wcheck('front doors open inward into a lit room, never into a wall',()=>{for(const k of ['jamie','alex']){const door=W.doors[k],H=door.house,I=W.interiors[H.key];assert.equal(I.kind,'foyer');assert.ok(I.depth>=2.2&&I.width>=2,'room too small');
  // The door leaf swings into the house (not out over the porch) and the way in is clear.
  door.set(1);door.pivot.updateMatrixWorld(true);const tip=door.pivot.children[0].getWorldPosition(new THREE.Vector3()),r=H.frame.project(tip.x,tip.z,H.u),q=H.localOf(r.u,r.v);
  assert.ok(q.z<H.front-.2&&Math.abs(q.x-H.doorX)<1.3,`${k}'s door swings outside`);door.set(0);
  const a=door.threshold,b=door.inside,pa=H.frame.point(a.d,a.lat),pb=H.frame.point(b.d,b.lat),y=H.toWorld(H.doorX,H.front).ground+H.floor+1.2;ray.set(new THREE.Vector3(pa.x,y,pa.z),new THREE.Vector3(pb.x-pa.x,0,pb.z-pa.z).normalize());ray.far=Math.hypot(pb.x-pa.x,pb.z-pa.z)+.2;
  const block=ray.intersectObjects(visible,false).filter(x=>x.object.material.side!==THREE.BackSide)[0];ray.far=Infinity;assert.ok(!block,`${k}'s entry is blocked at ${block?.distance?.toFixed(2)} m`);}});
wcheck('Sam\'s garage has depth and clutter, and a door into the house',()=>{const g=W.garages.sam,I=W.interiors[g.house.key];assert.ok(I&&I.kind==='garage');assert.ok(g.houseDoor&&g.beyond,'no house door');
 const a=groundPoint(g.mouth.d,g.mouth.lat),b=groundPoint(g.back.d,g.back.lat);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>5,'shallow garage');
 const clutter=h.originals.filter(o=>o.name==='garage-interior');assert.ok(clutter.length>=1);});
wcheck('rideable surfaces: road, full sidewalks and curbs yes; yards no',()=>{
 for(const home of Object.values(W.homes).filter(h=>h.frameId==='main')){assert.ok(W.rideable(home.drivD,home.side*4.9),'driveway cut '+home.drivD);assert.ok(W.rideable(home.drivD,home.side*7.1),'sidewalk at drive');}
 let walk=0,lawn=0,curb=0;for(let d=30;d<1100;d+=13)for(const s of [-1,1]){if(JUNCTIONS.some(j=>Math.abs(d-j.d)<16))continue;if(W.rideable(d,s*7.1))walk++;if(W.rideable(d,s*11,0))lawn++;if(W.rideable(d,s*4.95,0))curb++;}
 assert.equal(lawn,0,'rode onto a lawn');assert.ok(walk>150,'sidewalk rideable '+walk);assert.ok(curb>100,'curbs '+curb);});
wcheck('trees stand clear of roads, sidewalks and driveways',()=>{const trees=W.space.items('tree');assert.ok(trees.length>300,'trees '+trees.length);const bad=[];
 for(const t of trees){const r=MAIN.project(t.x,t.z),q={d:r.u,lat:r.v};if(q.d<-420||q.d>1135||Math.abs(q.lat)>40)continue;const a=Math.abs(q.lat);
  if(a<7.9+t.r*.5&&!JUNCTIONS.some(j=>Math.abs(q.d-j.d)<30))bad.push(['street',q.d|0,q.lat.toFixed(1)]);
  if(W.drivewayOpenings.some(dr=>dr.contains(q.d,q.lat)))bad.push(['driveway',q.d|0,q.lat.toFixed(1)]);}
 assert.deepEqual(bad,[]);metrics.treesPlaced=trees.length;});
wcheck('power lines never end in the air: spans pole to pole, drops pole to house',()=>{const poles=W.poles;const atPole=(p,lo=6.9,hi=9.4)=>poles.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<1.2&&p.y>q.y+lo&&p.y<q.y+hi);
 let spans=0,drops=0,guys=0;for(const w of W.wires){if(w.kind==='span'){spans++;assert.ok(atPole(w.a)&&atPole(w.b),'span ends in the air');assert.ok(w.mid.y<Math.max(w.a.y,w.b.y),'span without sag');}
  else if(w.kind==='drop'){drops++;assert.ok(atPole(w.a,6.5,7.5),'drop not at a pole');const y=W.terrainY(w.b.x,w.b.z);assert.ok(w.b.y>y+2,'drop ends near the ground');}
  else if(w.kind==='guy'){guys++;assert.ok(atPole(w.a,8,9));}}
 assert.ok(spans>60&&drops>15&&drops<55&&guys>=1,`${spans} spans ${drops} drops ${guys} guys`);metrics.wires={spans,drops,guys,poles:poles.length};});
wcheck('scattered props stay off sidewalks and driveways',()=>{const onWalk=(d,lat)=>d<1118&&Math.abs(lat)>6.3&&Math.abs(lat)<7.9;for(const [name,list] of Object.entries(W.hooks))for(const hk of list){if(hk.d===undefined||name==='chalk'||name==='initials'||name==='toy-at-curb')continue;assert.ok(!onWalk(hk.d,hk.lat),`${name} on the sidewalk at ${hk.d}`);}
 const sc=W.hooks['scooter-in-grass']?.[0]?.object;assert.ok(sc,'scooter');const p=sc.getWorldPosition(new THREE.Vector3()),r=MAIN.project(p.x,p.z);assert.ok(Math.abs(r.v)>8,'scooter on the walk');});
wcheck('lookout sidewalk follows the grassy rise and faces upward',()=>{const ring=h.originals.find(o=>o.name==='lookout-walk');assert.ok(ring);for(let a=.7;a<5.6;a+=.2){const d=1142-Math.cos(a)*13.1,lat=Math.sin(a)*13.1,p=groundPoint(d,lat);ray.set(new THREE.Vector3(p.x,p.y+4,p.z),down);const hit=ray.intersectObject(ring)[0];assert.ok(hit,'missing sidewalk');assert.ok(hit.face.normal.y>.95);assert.ok(Math.abs(hit.point.y-W.groundY(d,lat))<.035);}});
wcheck('render budget: triangles and draw calls stay bounded',()=>{let tris=0,calls=0;for(const m of W.merged){if(m.material.colorWrite===false)continue;calls++;const g=m.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3;}
 metrics.worldTriangles=Math.round(tris);metrics.worldMeshes=calls;metrics.worldBuildMs=buildMs;metrics.performanceTargets={normalTriangles:4000000,normalMeshes:1500,profileCeilingTriangles:6000000,profileCeilingMeshes:2000};assert.ok(tris<6e6,'profile geometry above ceiling '+tris);assert.ok(calls<2000,'profile meshes above ceiling '+calls);/* each is frustum-culled; per-view draw calls are measured in the browser QA */});

// ------------------------------------------------------------------------------------------
// Characters and bikes
// ------------------------------------------------------------------------------------------
check('every friend is their own person: face, hair, build, clothes, bike and riding manner',()=>{const F=['jamie','sam','alex'].map(k=>CAST[k]);
 for(const pick of [c=>c.hair.style,c=>c.bike.style,c=>c.bike.bars,c=>c.clothes.shirt,c=>c.bike.frame,c=>c.face.nose+c.face.mouth,c=>c.build.bulk,c=>c.ride.cadence,c=>c.ride.phase])assert.equal(new Set(F.map(pick)).size,3);
 const heads=h.friends.list.map(f=>f.person.parts.head.geometry.attributes.position.count);assert.ok(new Set(heads).size>=2,'identical heads');
 const bikes=h.friends.list.map(f=>f.bike.geom.style);assert.equal(new Set(bikes).size,3);});
check('bikes are complete: two spoked wheels on the ground, cranks, pedals, bars, saddle',()=>{for(const style of ['road-kid','bmx','mtb','cruiser']){const b=createBike({style,frame:0x777777,bars:'riser'});b.group.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(b.group,true);assert.ok(Math.abs(box.min.y)<.02,`${style} floats ${box.min.y}`);assert.ok(box.max.y>.85&&box.max.y<1.25,`${style} height ${box.max.y}`);
 assert.ok(b.frontWheel.children.length>=2&&b.rearWheel.children.length>=2,'spokes');assert.equal(b.pedals.length,2);assert.ok(b.crank.children.length>=1);
 const G=bikeGeometry(style);assert.ok(Math.abs(b.frontWheel.getWorldPosition(new THREE.Vector3()).y-G.wheelR)<.02,'front axle height');}});
check('hands stay within two centimeters of grips while steering',()=>{const person=createPerson(),p=newPose();let worst=0;for(const steer of [-.55,-.25,0,.25,.55])for(const stand of [0,.5,1]){ridePose(p,0,{steer,stand});applyPose(person,p);for(const [s,o] of [['l',P.lh],['r',P.rh]])worst=Math.max(worst,person.joints[s+'wrist'].distanceTo(new THREE.Vector3().fromArray(p,o)));}assert.ok(worst<.02,'grip reach '+worst);metrics.gripReachErrorMeters=+worst.toFixed(4);});
check('rig limbs keep their length through riding, walking and dismount poses',()=>{const person=createPerson(),poses=[];for(let a=0;a<6.3;a+=.3)poses.push(ridePose(newPose(),a,{}),ridePose(newPose(),a,{stand:1}));for(let ph=0;ph<1;ph+=.05)poses.push(walkPose(newPose(),ph,1.3),walkPose(newPose(),ph,3.2));const keys=dismountKeys();for(let s=0;s<=1.3;s+=.05)poses.push(samplePose(newPose(),keys,s));
 for(const p of poses){applyPose(person,p);const pr=person.parts;for(const [s,side] of [['l',-1],['r',1]]){
  const hip=new THREE.Vector3(side*BODY.hip,-.03,0).applyAxisAngle(new THREE.Vector3(0,1,0),p[P.yaw]).add(new THREE.Vector3(p[0],p[1],p[2]));
  const knee=pr[s+'thigh'].position.clone().multiplyScalar(2).sub(hip);assert.ok(Math.abs(knee.distanceTo(hip)-BODY.thigh)<1e-4,'thigh length');assert.ok(Math.abs(knee.distanceTo(person.joints[s+'ankle'])-BODY.shin)<1e-4,'shin length');
  const elbow=pr[s+'fore'].position.clone().multiplyScalar(2).sub(person.joints[s+'wrist']);assert.ok(Math.abs(elbow.distanceTo(person.joints[s+'wrist'])-BODY.fore)<1e-4,'forearm length');}}});
check('rider feet stay on the pedals through a full crank turn, on every bike',()=>{let worst=0;for(const style of ['road-kid','bmx','mtb','cruiser']){const G=bikeGeometry(style),person=createPerson(),p=newPose();for(let a=0;a<Math.PI*2;a+=.1){ridePose(p,a,{geom:G});applyPose(person,p);for(const s of ['l','r'])worst=Math.max(worst,person.joints[s+'ankle'].distanceTo(new THREE.Vector3().fromArray(p,s==='l'?P.lf:P.rf)));}}assert.ok(worst<.005,'foot leaves pedal by '+worst);metrics.pedalReachErrorMeters=+worst.toFixed(4);});
check('walking stance feet stay planted',()=>{const sp=1.3,S=stride(sp);let worst=0;for(const off of [0,.5]){let prev=null;for(let ph=off+.02;ph<off+.5;ph+=.01){const p=walkPose(newPose(),ph,sp);const u=(ph%1+1)%1;const f=p[P.rf+2]-S*ph;if(prev!==null&&((u+.5)%1)<.5)worst=Math.max(worst,Math.abs(f-prev));prev=f;}}assert.ok(worst<.03,'stance slip '+worst);});
check('first-person body is whole and the head is only a shadow',()=>{const parts=h.self.parts;for(const [name,m] of Object.entries(parts)){if(name==='head'||name==='neck'){assert.equal(m.layers.mask,2,name+' visible to the camera');assert.ok(m.castShadow);}else assert.ok(m.layers.isEnabled(0),name+' hidden');}
 for(const k of ['torso','lupper','rupper','lfore','rfore','lhand','rhand','lthigh','rthigh','lshin','rshin','lshoe','rshoe'])assert.ok(parts[k].visible,k);});

// ------------------------------------------------------------------------------------------
// Title menu and settings
// ------------------------------------------------------------------------------------------
check('title menu: settings and credits open over the title and return to it',()=>{assert.equal(h.snapshot.state,'intro');
 for(const [open,panel,back] of [['open-settings','settings','settings-back'],['open-credits','credits','credits-back']]){element(open).onclick();assert.equal(element(panel).hidden,false);assert.equal(element('intro').hidden,true);element(back).onclick();assert.equal(element(panel).hidden,true);assert.equal(element('intro').hidden,false);}
 element('open-settings').onclick();press('Escape');release('Escape');assert.equal(element('settings').hidden,true,'Esc closes settings');assert.equal(element('intro').hidden,false);assert.equal(h.snapshot.state,'intro');});
check('settings apply immediately and are remembered',()=>{
 setField('set-quality','high');assert.equal(h.sunlight.shadow.mapSize.x,3072);assert.equal(h.renderer.pixelRatio,2);
 setField('set-quality','low');assert.equal(h.sunlight.shadow.mapSize.x,1024);assert.equal(h.renderer.pixelRatio,1);
 setField('set-quality','medium');assert.equal(h.sunlight.shadow.mapSize.x,2048);
 setField('set-sensitivity',2);assert.ok(Math.abs(h.snapshot.sens-.0044)<1e-9);setField('set-sensitivity',1);
 setField('set-volume',.5);setField('set-volume',1);
 const saved=JSON.parse(store['lastlight.settings']);assert.equal(saved.quality,'medium');assert.equal(saved.sensitivity,1);assert.equal(saved.fullscreen,false);
 setField('set-fullscreen',true);assert.ok(document.fullscreenElement);setField('set-fullscreen',false);assert.equal(document.fullscreenElement,null);});

// ------------------------------------------------------------------------------------------
// Riding
// ------------------------------------------------------------------------------------------
element('start').onclick();advance(.2);
check('start: title hidden, riding interface and the first prompt shown',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(element('intro').hidden,true);assert.equal(element('ride-ui').hidden,false);assert.ok(document.body.classList.contains('riding'));assert.equal(h.ui.promptText,'Space:Ring bell');});
press('KeyW');advance(5);
check('pedaling advances the bike and the prompt moves on to steering',()=>{assert.ok(h.snapshot.distance>15);assert.ok(h.snapshot.pedalPhase>10);const p=h.selfPose;for(const s of ['l','r'])assert.ok(h.self.joints[s+'ankle'].distanceTo(new THREE.Vector3().fromArray(p,s==='l'?P.lf:P.rf))<.005);assert.equal(h.ui.promptText,'Space:Ring bell');});
check('looking down finds your own chest, arms, hands on the grips and knees',()=>{
 h.scene.updateMatrixWorld(true);/* the mocked renderer never does this */const dir=new THREE.Vector3(0,-.85,-.55).normalize().applyQuaternion(h.bikeRoot.quaternion);ray.set(h.camera.getWorldPosition(new THREE.Vector3()),dir);ray.layers.set(0);
 const hit=ray.intersectObjects([h.self.group,h.playerBike.group],true)[0];assert.ok(hit&&hit.distance<1.3,'nothing below the eye');
 // Hands meet the grips of the actual bike.
 h.bikeRoot.updateMatrixWorld(true);for(const s of ['l','r']){const wrist=h.self.joints[s+'wrist'].clone().applyMatrix4(h.self.group.matrixWorld),target=new THREE.Vector3().fromArray(h.selfPose,s==='l'?P.lh:P.rh).applyMatrix4(h.self.group.matrixWorld);assert.ok(wrist.distanceTo(target)<.03,'hand off the grip');}});
const initialLateral=h.snapshot.lateral;
events.get('mousemove')({movementX:300,movementY:180});advance(.8);
check('mouse head-look turns smoothly without steering, and wins over the automatic glance',()=>{const s=h.snapshot;assert.ok(s.look<-.5);assert.ok(s.headPitch<-.3);assert.equal(s.lateral,initialLateral);assert.ok(s.manualLook);assert.equal(s.glance,0);assert.ok(Math.abs(h.bikeRoot.rotation.y+roadFrame(s.distance).heading)<1e-9);});
for(let i=0;i<6;i++)events.get('mousemove')({movementX:300,movementY:0});advance(.8);
check('head look reaches well over the shoulder, never all the way round',()=>{const l=h.snapshot.look;assert.ok(l<-1.7&&l>=-1.86,'look '+l);});
tap('KeyR');advance(.8);check('R returns gaze forward',()=>{assert.ok(Math.abs(h.snapshot.look)<.01);assert.ok(Math.abs(h.snapshot.headPitch)<.01);assert.equal(h.snapshot.manualLook,false);});
press('KeyQ');advance(.7);check('Q looks left',()=>assert.ok(h.snapshot.look>.70));release('KeyQ');press('KeyE');advance(.7);check('E looks right',()=>assert.ok(h.snapshot.look<-.70));release('KeyE');advance(.7);
check('sensitivity setting scales mouse look',()=>{setField('set-sensitivity',2);const before=h.snapshot.look;events.get('mousemove')({movementX:-100,movementY:0});advance(.8);const turned=h.snapshot.look-before;setField('set-sensitivity',1);assert.ok(Math.abs(turned-.44)<.03,'turned '+turned);tap('KeyR');advance(.8);});
press('KeyA');advance(5);check('A steering stops at the left curb (or runs onto a driveway cut), never onto lawn',()=>{const s=h.snapshot;assert.ok(s.lateral<-3.5,'lat '+s.lateral);assert.ok(W.rideable(s.distance,s.lateral,0),'not rideable '+s.lateral);});release('KeyA');
press('KeyD');let maxSteer=0,maxLean=0;advance(1.2,()=>{maxSteer=Math.max(maxSteer,Math.abs(h.playerBike.steerAngle));maxLean=Math.max(maxLean,Math.abs(h.bikeRoot.rotation.z));});advance(7);
check('D steering stops at the right curb, turns the bars and leans',()=>{const s=h.snapshot;assert.ok(s.lateral>3.5,'lat '+s.lateral);assert.ok(W.rideable(s.distance,s.lateral,0));assert.ok(maxSteer>.02,'bars do not turn');assert.ok(maxLean>.01&&maxLean<.25,'lean '+maxLean);});release('KeyD');
press('KeyA');advance(1.6);release('KeyA');{let peak=h.snapshot.yawOffset,worst=0;advance(3,()=>{const y=h.snapshot.yawOffset;if(Math.sign(y)!==Math.sign(peak)&&Math.abs(y)>worst)worst=Math.abs(y);});
check('letting go of the bars eases the bike straight without a springy overshoot',()=>{assert.ok(worst<.012,'overshoot '+worst);assert.ok(Math.abs(h.snapshot.yawOffset)<.02);});}
press('KeyA');advance(2);release('KeyA');
const stopped=h.snapshot.distance;press('Escape');release('Escape');advance(1);check('pause freezes travel, releases the mouse and hides prompts',()=>{assert.equal(h.snapshot.state,'paused');assert.equal(h.snapshot.distance,stopped);assert.equal(document.pointerLockElement,null);assert.equal(element('pause').hidden,false);assert.equal(h.ui.promptText,'');});
check('pause menu: settings open over it, Esc returns to it, Esc again resumes',()=>{element('pause-settings').onclick();assert.equal(element('settings').hidden,false);assert.equal(element('pause').hidden,true);
 advance(.3);tap('Escape');assert.equal(element('settings').hidden,true);assert.equal(element('pause').hidden,false);assert.equal(h.snapshot.state,'paused');});
element('resume').onclick();press('KeyW');advance(.1);
check('spurious mouse jump right after pointer lock is ignored',()=>{const before=h.snapshot.look;events.get('mousemove')({movementX:-640,movementY:-500});advance(.3);assert.ok(Math.abs(h.snapshot.look-before)<.05);});
document.exitPointerLock();check('browser pointer-lock exit pauses safely',()=>assert.equal(h.snapshot.state,'paused'));
canvas.requestPointerLock=()=>Promise.reject(new Error('test unavailable'));
check('pause menu: start over resets the ride',()=>{element('restart').onclick();advance(.1);const s=h.snapshot;assert.equal(s.state,'riding');assert.ok(s.distance<.5);assert.equal(element('pause').hidden,true);assert.equal(h.ui.promptText,'Space:Ring bell');});
await Promise.resolve();canvas.events.get('pointerdown')({clientX:100,clientY:100,pointerId:1});events.get('mousemove')({clientX:150,clientY:130});events.get('mousemove')({clientX:250,clientY:180});press('KeyW');advance(.5);check('drag fallback works when pointer lock unavailable',()=>assert.ok(h.snapshot.look<-.15));canvas.events.get('pointerup')();tap('KeyR');advance(.5);

// Pushing: Shift gives a bounded burst; the friends answer it and the group re-forms.
{advance(12);const F=h.friends.list,before=F.map(f=>f.d);let top=0,minStamina=1,lead=-99,surge=[],stoodAt=F.map(()=>null),t0=simTime;press('ShiftLeft');
 advance(10,()=>{const s=h.snapshot;top=Math.max(top,s.speed);minStamina=Math.min(minStamina,s.stamina);lead=Math.max(lead,s.distance-Math.max(...F.map(f=>f.d)));surge.push(F.map(f=>f.crank));F.forEach((f,i)=>{if(stoodAt[i]===null&&f.stand>.5)stoodAt[i]=simTime-t0;});});
 check('friends answering a surge pedal hard out of step, and not all stand at once',()=>{let apart=0;for(const c of surge){const w=c.map(a=>((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2));let near=false;for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){const d=Math.abs(w[i]-w[j]);if(Math.min(d,Math.PI*2-d)<.25)near=true;}if(!near)apart++;}assert.ok(apart/surge.length>.6,'in sync '+(1-apart/surge.length));
  const stood=stoodAt.filter(x=>x!==null);assert.ok(stood.length>=1,'nobody stood to answer');if(stood.length>=2)assert.ok(Math.max(...stood)-Math.min(...stood)>.5,'stood up in unison '+stood);metrics.surgeStandTimes=stoodAt.map(x=>x===null?null:+x.toFixed(2));});release('ShiftLeft');const pushedTo=h.snapshot.distance;
 check('pushing harder is faster but bounded, and tires you',()=>{assert.ok(top>5.4&&top<6.45,'top speed '+top);assert.ok(minStamina<.85,'stamina '+minStamina);metrics.pushTopSpeed=+top.toFixed(2);metrics.pushLeadMeters=+lead.toFixed(2);});
 advance(25);check('the friends answer a push and the group rides together again, without jumps',()=>{const s=h.snapshot;const gap=s.distance-Math.max(...F.map(f=>f.d));assert.ok(gap<6,'still ahead by '+gap);assert.ok(lead<4,'left them behind by '+lead);assert.ok(s.speed<5.6,'still sprinting '+s.speed);});}

// Full ride, holding W, as a first-time player might.
function ride(label,{each}={}){
 const F=h.friends.list,last=new Map(),seen={},angles={},goneSeen=[];let repeatedPrompt='',observed=h.snapshot.nextMemory,maxEye=[9,0],maxJump=0,hiddenBad=[],minGroup=99,glanced=0,reflectionsSeen=[],lastReflection='',overlap=0,phases=[];const fwd=new THREE.Vector3();
 const mark=(f,tag,obj)=>{if(seen[f.name+tag])return;seen[f.name+tag]=true;h.camera.getWorldDirection(fwd);const p=obj.getWorldPosition(new THREE.Vector3()).sub(h.camera.position);angles[f.name+':'+tag]=Math.round(Math.acos(Math.max(-1,Math.min(1,(p.x*fwd.x+p.z*fwd.z)/Math.hypot(p.x,p.z)/Math.hypot(fwd.x,fwd.z))))*180/Math.PI);};
 let rideSeconds=0;const departures=Object.values(FORMATION).map(f=>f.leaveAt);
 while(['riding','arriving'].includes(h.snapshot.state)&&rideSeconds<400){advance(DT);rideSeconds+=DT;const s=h.snapshot;each?.(s);
  assert.ok(Math.abs(s.lateral)<=LATERAL_LIMIT+.01);assert.ok(s.nextMemory===observed||s.nextMemory===observed+1);
  if(s.nextMemory>observed){assert.ok(s.distance>=memories[s.nextMemory-1].at);assert.ok(s.distance-memories[s.nextMemory-1].at<.27,'late trigger '+(s.distance-memories[s.nextMemory-1].at));observed=s.nextMemory;}
  if(s.state==='riding'){const eye=h.camera.position.y-roadSurface(s.distance,s.lateral);maxEye=[Math.min(maxEye[0],eye),Math.max(maxEye[1],eye)];}
  if(Math.abs(s.glance)>.05)glanced++;
  const r=h.ui.reflection;if(r&&r!==lastReflection){reflectionsSeen.push(r);if(s.captionTimer>0)overlap++;}lastReflection=r;
  // Riders still riding keep their speed while someone peels off.
  if(departures.some(a=>s.distance>a-5&&s.distance<a+60))for(const f of F)if(f.mode==='ride'&&s.distance>30)minGroup=Math.min(minGroup,f.speed);
  {const riding=F.filter(f=>f.mode==='ride');if(s.distance>40&&riding.length>=2&&Math.round(rideSeconds*30)%10===0)phases.push(riding.map(f=>f.crank));}
  for(const f of F){for(const [tag,obj] of [['bike',f.bike.group],['body',f.person.parts.pelvis]]){const p=obj.getWorldPosition(new THREE.Vector3()),k=f.name+tag,q=last.get(k);if(q&&f.person.group.visible&&(tag==='body'||obj.visible)){const jump=p.distanceTo(q);maxJump=Math.max(maxJump,jump);assert.ok(jump<.3,`${f.name} ${tag} jumped ${jump.toFixed(2)} m (step ${f.step})`);}last.set(k,p);}
   for(const v of Object.values(f.person.group.position))assert.ok(Number.isFinite(v));
   if(f.mode==='leave'&&f.step===1)mark(f,'stops',f.bike.group);if(f.mode==='foot'&&f.step>=3)mark(f,'on foot',f.person.group);if(f.inside)mark(f,'inside',f.person.group);
   if(!f.person.group.visible&&!f.inside&&!f.gone)hiddenBad.push(f.name);
   // Alex leaves the story out of sight: when he is gone, the place he was must not be in plain view.
   if(f.gone&&!seen[f.name+'gone']){seen[f.name+'gone']=true;const p=f.bike.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.9,0)),e=h.camera.getWorldPosition(new THREE.Vector3()),dir=p.clone().sub(e),dist=dir.length();dir.normalize();
    h.camera.updateMatrixWorld();const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(h.camera.projectionMatrix,h.camera.matrixWorldInverse));
    ray.set(e,dir);ray.far=dist-.5;const block=ray.intersectObjects(visible,false)[0];ray.far=Infinity;goneSeen.push({who:f.name,inFrustum:fr.containsPoint(p),occluded:!!block,dist:+dist.toFixed(1)});}}
  if(s.state==='riding'&&s.distance>160&&h.ui.promptText&&h.ui.promptText!=='Space:Ring bell')repeatedPrompt=h.ui.promptText;
  assert.equal(h.ending.state.clue,false,'clue during the ride');assert.equal(h.ending.state.otherBike,false,'other bike during the ride');
 }
 check(`${label}: all ${memories.length} story triggers in order, eye height steady`,()=>{assert.equal(h.snapshot.nextMemory,memories.length);assert.ok(maxEye[0]>1.35&&maxEye[1]<1.62,`eye ${maxEye}`);});
 check(`${label}: once learned, controls are not shown again during the ride`,()=>assert.equal(repeatedPrompt,''));
 check(`${label}: the group never brakes for a departure`,()=>assert.ok(minGroup>3.2,'group speed fell to '+minGroup));
 check(`${label}: friends pedal out of step with each other`,()=>{let apart=0;for(const c of phases){const w=c.map(a=>((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2));let near=false;for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){const d=Math.abs(w[i]-w[j]);if(Math.min(d,Math.PI*2-d)<.25)near=true;}if(!near)apart++;}
  assert.ok(phases.length>=60,'too few samples '+phases.length);metrics[label+' crank samples in step']=+(1-apart/phases.length).toFixed(3);assert.ok(apart/phases.length>.6,'in sync '+(1-apart/phases.length));});
 metrics[label+' ride seconds']=Math.round(rideSeconds);metrics[label+' departure view angles (deg)']=angles;metrics.maxFriendStepMeters=+maxJump.toFixed(3);metrics[label+' min group speed in departures']=+minGroup.toFixed(2);
 return {hiddenBad,glanced,reflectionsSeen,overlap,goneSeen};
}
function friendsHome(label){
 check(`${label}: bike rolls to a stop at the end of the street, prompt offers F`,()=>{assert.equal(h.snapshot.state,'stopped');assert.ok(Math.abs(h.snapshot.distance-LOOKOUT.stop.d)<.05);assert.equal(h.ui.promptText,'F:Get off bike');});
 check(`${label}: Jamie and Sam went home believably; Alex rode on down Briarwood and is gone`,()=>{const F=h.friends.list;const [jamie,sam,alex]=F;
  for(const f of [jamie,sam]){assert.ok(f.inside,`${f.name} not inside`);assert.equal(f.person.group.visible,false);}
  assert.ok(alex.gone&&!alex.inside,'Alex should be gone, not home');assert.equal(alex.person.group.visible,false);assert.equal(alex.bike.group.visible,false,'Alex\'s bike must be gone too');
  assert.ok(jamie.bike.group.visible&&Math.abs(jamie.fall)>1.2,'Jamie\'s bike lies on the lawn');
  assert.equal(sam.bike.group.visible,false);assert.ok(W.garages.sam.open<.01,'Sam\'s garage closed');assert.ok(W.doors.jamie.open<.01&&W.doors.alex.open<.01,'doors closed');
  const behind=(f,door)=>{const g=f.person.group.position,th=door.threshold,o=door.outside,a=groundPoint(th.d,th.lat),b=groundPoint(o.d,o.lat);return ((g.x-a.x)*(b.x-a.x)+(g.z-a.z)*(b.z-a.z))<0;};
  assert.ok(behind(jamie,W.doors.jamie),'Jamie hid outside');});
}
const eyeAbove=()=>h.camera.position.y-W.groundY(h.snapshot.walkD,h.snapshot.walkLat);
function finalStop(label){
 friendsHome(label);
 release('KeyW');advance(2);tap('KeyF');advance(2);
 check(`${label}: F gets off the bike and the player can walk`,()=>{assert.equal(h.snapshot.state,'walking');assert.ok(h.ui.promptText==='F:Get on bike',h.ui.promptText);});
 const start=[h.snapshot.walkD,h.snapshot.walkLat];press('KeyW');advance(6);release('KeyW');
 check(`${label}: walking moves the player and stays inside the lookout`,()=>{const s=h.snapshot,B=LOOKOUT.bounds;assert.ok(Math.hypot(s.walkD-start[0],s.walkLat-start[1])>3,'did not move');assert.ok(s.walkD>=B.d0&&s.walkD<=B.d1&&s.walkLat>=B.l0&&s.walkLat<=B.l1);
  const eye=eyeAbove();assert.ok(eye>1.35&&eye<1.5,'standing eye '+eye);});
 press('KeyW');advance(20);release('KeyW');check(`${label}: the fence stops the walk`,()=>assert.ok(h.snapshot.walkD<LOOKOUT.fenceD-.2));
 // Turn around and look back toward the neighborhood; the evening's last call comes.
 let turnedAt=h.snapshot.finaleT,callAt=null;const watch=()=>{if(callAt===null&&h.snapshot.callDone)callAt=h.snapshot.finaleT;};
 drag(1430);advance(4,watch);check(`${label}: the player can turn all the way around on foot`,()=>assert.ok(Math.abs(Math.abs(h.snapshot.walkYaw)-Math.PI)<.2));advance(12,watch);
 check(`${label}: looking back brings the distant call`,()=>{assert.ok(h.snapshot.callDone);assert.ok(callAt-turnedAt<3,`call came ${(callAt-turnedAt).toFixed(1)} s after turning`);metrics.callAfterTurningSeconds=+(callAt-turnedAt).toFixed(2);});
 // Things to touch at the end of the street.
 const sw=LOOKOUT.swing;h.walkTo(sw.d-1.2,sw.lat,0,0);advance(.2);
 check(`${label}: the tire swing takes a push, swings away and settles`,()=>{assert.equal(h.ui.promptText,'F:Push the swing');tap('KeyF');let peak=0,dir=0;advance(1.2,()=>{peak=Math.max(peak,h.ambient.state.swing);dir=dir||Math.sign(h.ambient.swing.th);});assert.ok(peak>.15,'swing '+peak);assert.equal(dir,1,'swung toward you');advance(25);assert.ok(h.ambient.state.swing<peak*.5,'never settles');});
 const b=LOOKOUT.bench;h.walkTo(b.d-1.1,b.lat,0,0);advance(.2);
 check(`${label}: sit on the bench, look around, stand back up`,()=>{assert.equal(h.ui.promptText,'F:Sit down');tap('KeyF');advance(1.5);assert.equal(h.snapshot.state,'walking');assert.equal(h.interact.pose?.id,'bench');assert.ok(Math.abs(eyeAbove()-(1.02+(W.groundY(b.d,b.lat)-W.groundY(h.snapshot.walkD,h.snapshot.walkLat))))<.06,'seated eye '+eyeAbove());assert.equal(h.ui.promptText,'F:Stand up');
  const yaw0=new THREE.Euler().setFromQuaternion(h.camera.quaternion,'YXZ').y;drag(-300);advance(.3);assert.ok(Math.abs(new THREE.Euler().setFromQuaternion(h.camera.quaternion,'YXZ').y-yaw0)>.3,'cannot look around seated');
  tap('KeyF');advance(1.2);assert.equal(h.interact.pose,null);assert.ok(Math.abs(eyeAbove()-1.41)<.05,'standing eye '+eyeAbove());});
 check(`${label}: the other bike is under the oak once you look away, never appearing in view`,()=>assert.ok(h.ending.state.otherBike));
 const c=LOOKOUT.chalk;h.walkTo(c.d-.7,c.lat+.6,0,0);advance(.2);
 check(`${label}: crouch at the chalk; after the call the faint AR is there when you turn to it`,()=>{assert.equal(h.ui.promptText,'F:Look closer');tap('KeyF');advance(1.3);assert.equal(h.interact.pose?.id,'chalk');assert.ok(eyeAbove()<.9,'not crouched '+eyeAbove());
  drag(1.0/.0022,-.7/.0022);advance(.4);assert.ok(h.ending.state.clue,'faint clue');advance(5);assert.equal(h.interact.pose,null,'still crouched');assert.ok(eyeAbove()>1.35);});
 // Walk back to the bike and ride home.
 for(let i=0;i<1500&&!(Math.hypot(h.snapshot.walkD-h.snapshot.distance,h.snapshot.walkLat-h.snapshot.lateral)<1.5);i++){const s=h.snapshot;const want=Math.atan2(-(s.lateral+.75-s.walkLat),s.distance-s.walkD);drag(-(want-s.walkYaw)/.0022);press('KeyW');advance(DT);}
 release('KeyW');advance(.3);check(`${label}: near the bike after the call, F means ride home`,()=>assert.equal(h.ui.promptText,'F:Go home'));
 tap('KeyF');advance(1.5);check(`${label}: F near the bike rides home: no end card, the bike rolls back out of the cul-de-sac`,()=>{assert.equal(h.snapshot.state,'c1-ride');assert.equal(element('ending').hidden,true);assert.equal(h.chapter.state.phase,'leave');});
 let clueSeen=false;const lines=[];press('KeyW');advance(17,()=>{clueSeen ||=h.ending.state.clue;const r=h.ui.reflection;if(r&&!lines.includes(r))lines.push(r);});
 check(`${label}: the transition keeps the last memory lines, "I thought I remembered everyone." among them`,()=>{assert.deepEqual(lines,['last','everyone'].map(id=>reflections.find(r=>r.id===id).text));assert.ok(clueSeen,'chalk plain in the fade');});
 check(`${label}: after the fade the ride home goes on, later, as night comes`,()=>{const s=h.chapter.state;assert.equal(s.phase,'home');assert.ok(h.snapshot.fade<.05);assert.ok(element('date').innerHTML.includes('8:44 PM'));
  const L=h.nav.locate(h.roam.x,h.roam.z);assert.equal(L.street,'main');assert.ok(L.d>780&&L.d<850,'resumed at '+L.d);assert.ok(document.body.classList.contains('night1'));});
}
// ------------------------------------------------------------------------------------------
// Chapter One: the night after. Ridden and walked the way a player would (an autopilot steers
// with A/D and W; walking goes straight to where a player would stand).
// ------------------------------------------------------------------------------------------
const C1=()=>h.chapter.state,B1=W.sideFrames[0];
const M1=(d,l)=>{const p=groundPoint(d,l);return [p.x,p.z];},S1=(u,v)=>{const p=B1.point(u,v);return [p.x,p.z];};
const sline1=(u0,u1,v,st=8)=>{const o=[];const n=Math.ceil(Math.abs(u1-u0)/st);for(let i=1;i<=n;i++)o.push(S1(u0+(u1-u0)*i/n,v));return o;};
const line1=(d0,d1,l,st=20)=>{const o=[];const n=Math.ceil(Math.abs(d1-d0)/st);for(let i=1;i<=n;i++)o.push(M1(d0+(d1-d0)*i/n,l));return o;};
function chapterOne(label){
 const said=[],objectives=[],phases=[];let last='',lastObj='',bad=[],minCarGap=99,companionsHidden=0,maxSpeed=0,lastPhase='';
 const watch=()=>{const s=C1();if(s.line&&s.line!==last){last=s.line;said.push((s.speaker||'')+': '+s.line);}if(s.objective&&s.objective!==lastObj){lastObj=s.objective;objectives.push(s.objective);}if(s.phase!==lastPhase){lastPhase=s.phase;phases.push(s.phase);}
  const n=h.night;for(const v of [n.roam.x,n.roam.z,h.camera.position.x,h.camera.position.y,h.camera.position.z])if(!Number.isFinite(v))bad.push('player');
  for(const c of h.chapter.companions.all)if(c.active){if(!Number.isFinite(c.bx+c.bz+c.px+c.pz))bad.push(c.key);if(c.follow&&!c.person.group.visible)companionsHidden++;}
  for(const car of [h.chapter.carA,h.chapter.carB])if(car.active){if(!Number.isFinite(car.x+car.z))bad.push(car.name);minCarGap=Math.min(minCarGap,Math.hypot(car.x-n.roam.x,car.z-n.roam.z));maxSpeed=Math.max(maxSpeed,car.v);}};
 const until=(fn,max)=>{let ok=false;advance(max,()=>{watch();if(fn()){ok=true;return false;}});return ok;};
 const rideTo=(pts,max=150)=>{h.drive(pts,{r:2.6});const ok=until(()=>!h.driving,max);h.stopDriving();advance(1.2,watch);return ok;};
 const off=()=>{release('KeyW');press('KeyS');until(()=>h.night.speed<.05,6);release('KeyS');tap('KeyF');until(()=>h.night.state==='c1-walk',4);};
 const standAt=(q,face)=>{const r=h.night.roam,a=Math.atan2(face[0]-q[0],-(face[1]-q[1]));h.placePlayer({x:q[0],z:q[1],a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});advance(.2,watch);};
 const on=()=>{const r=h.night.roam;h.placePlayer({x:r.x,z:r.z,a:r.a,mode:'ride',speed:0});advance(.3,watch);};
 // The ride home: quiet first, then a siren far off; the car passes, brakes and turns behind you.
 let quiet=0,sirenAt=null,passedAt=null,turnBehind=null,lookedBack=0;
 release('KeyW');h.drive(line1(838,540,-2.1,20),{r:2.6});
 advance(140,()=>{watch();const s=C1();if(!s.siren)quiet+=DT;else if(sirenAt===null)sirenAt=quiet;
  const A=h.chapter.carA;if(A.active&&passedAt===null){const La=h.nav.locate(A.x,A.z),Lp=h.nav.locate(h.roam.x,h.roam.z);if(La.street==='main'&&Lp.street==='main'&&La.d>Lp.d){passedAt=Lp.d;}}
  if(passedAt!==null&&turnBehind===null){const La=h.nav.locate(A.x,A.z),Lp=h.nav.locate(h.roam.x,h.roam.z);if(La.street==='side'||La.lat>8)turnBehind=Lp.d<J1.d;}
  if(Math.abs(h.snapshot.look)>1.2)lookedBack+=DT;if(s.phase==='briarwood')return false;});
 h.stopDriving();
 check(`${label}: 20 to 40 seconds of quiet riding, then a siren far off`,()=>{assert.ok(sirenAt>20&&sirenAt<40,'quiet '+sirenAt);metrics['chapter1 quiet seconds']=+sirenAt.toFixed(1);});
 check(`${label}: the police car passes you just past Briarwood, brakes, and turns onto it behind you`,()=>{assert.ok(passedAt<J1.d&&passedAt>J1.d-80,'passed at '+passedAt);assert.equal(turnBehind,true);assert.ok(minCarGap>2.5,'car came within '+minCarGap);assert.ok(maxSpeed<=15.01,'too fast '+maxSpeed);metrics['police pass at d']=+passedAt.toFixed(1);metrics['police closest m']=+minCarGap.toFixed(2);});
 check(`${label}: your head turns to follow it, and the siren goes quiet before the title`,()=>{assert.ok(lookedBack>1,'looked back '+lookedBack);assert.ok(phases.indexOf('title')>phases.indexOf('cruiser'));});
 check(`${label}: the title card came and went, and then the objective`,()=>{assert.equal(C1().phase,'briarwood');assert.equal(C1().title,-2);assert.equal(element('title-card').classList.contains('on'),false);assert.deepEqual(objectives,['See what’s happening on Briarwood.']);});
 // Down Briarwood to Alex's house.
 // Stop, walk the bike round (A held while stopped), and ride back to Briarwood.
 release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');{const L=h.nav.locate(h.roam.x,h.roam.z),q=groundPoint(L.d,-1.8);h.placePlayer({x:q.x,z:q.z,a:heading(L.d),mode:'ride',speed:0});}
 metrics['chapter1 turned round at d']=+h.nav.locate(h.roam.x,h.roam.z).d.toFixed(1);
 const reached=rideTo([...line1(h.nav.locate(h.roam.x,h.roam.z).d+12,560,-1.8,20),M1(568,-1.6),M1(584,1),S1(8,1.9),...sline1(8,112,1.8)],100);release('KeyW');
 metrics['chapter1 reached Alex house']=reached;until(()=>C1().phase==='friends',70);
 check(`${label}: at Alex's house the officer asks, his father answers, nothing supernatural`,()=>{for(const l of ['OFFICER: “You were with Alex tonight?”','YOU: “Yeah.”','OFFICER: “When did he leave you?”','YOU: “At Oak Hollow. He turned here.”','ALEX’S DAD: “He never came home.”','OFFICER: “Was anyone with him?”','YOU: “No.”'])assert.ok(said.includes(l),l+' | phase '+C1().phase+' reached '+metrics['chapter1 reached Alex house']+' at '+JSON.stringify(h.nav.locate(h.roam.x,h.roam.z))+' said '+said.join(' / ')+' phases '+phases);
  assert.equal(C1().objective,'Find Jamie.');});
 check(`${label}: Alex's bike is nowhere at his house; the garage hook is empty`,()=>{const al=h.friends.list[2];assert.equal(al.bike.group.visible,false);assert.ok(W.garages.alex.open>.9);assert.equal(W.homes.alex.garageBike,'empty');});
 // Jamie: a tap on his window.
 rideTo([...sline1(112,16,-1.9),M1(584,-2),...line1(584,786,-2.2)],120);off();
 const jw=h.chapter.windows.jamie;standAt([jw.stand.x,jw.stand.z],[jw.glass.x,jw.glass.z]);
 check(`${label}: at Jamie's side window, F taps on it`,()=>assert.equal(h.ui.promptText,'F:Tap on the window'));tap('KeyF');
 until(()=>C1().jamie.follow==='ride',90);
 check(`${label}: Jamie thinks it is a joke, then climbs out and rides with you`,()=>{assert.ok(said.includes('JAMIE: “Ha. Nice try.”'));assert.ok(said.includes('JAMIE: “…Wait. For real?”'));assert.equal(C1().jamie.mode,'ride');assert.ok(W.windows.jamie.open<.3,'window left open');assert.equal(C1().objective,'Find Sam.');});
 on();press('KeyW');rideTo(line1(790,983,-2.2),80);off();
 const sw=h.chapter.windows.sam;standAt([sw.stand.x,sw.stand.z],[sw.glass.x,sw.glass.z]);tap('KeyF');
 until(()=>C1().objective==='Wait by Sam’s garage.',60);
 check(`${label}: Jamie throws pebbles at Sam's window; Sam is skeptical`,()=>{assert.ok(said.includes('SAM: “That’s not funny.”'),JSON.stringify({obj:C1().objective,where:h.nav.locate(h.roam.x,h.roam.z),state:h.night.state,j:C1().jamie,said:said.slice(-5),prompt:h.ui.promptText}));assert.ok(said.includes('SAM: “This is so dumb. Okay. Side door. Two minutes.”'));assert.equal(W.garages.sam.open,0,'big garage door stays shut');});
 const sd=h.chapter.sideDoor.outside;standAt([sd.x+1.5,sd.z+1],[sd.x,sd.z]);until(()=>C1().sam.follow==='ride',60);
 check(`${label}: Sam comes out of the garage's side door pushing his bike`,()=>{assert.ok(said.includes('SAM: “If my dad finds out, I’m dead.”'));assert.equal(C1().sam.mode,'ride');assert.ok(W.sideDoors.sam.open<.05,'side door left open');assert.equal(C1().objective,'Go to the old oak.');});
 on();press('KeyW');rideTo(line1(1000,1128,-1.5),60);release('KeyW');until(()=>C1().phase==='retrace',90);
 check(`${label}: at the old oak they compare what they remember`,()=>{for(const l of ['SAM: “He stopped first.”','YOU: “No he didn’t.”','SAM: “Yeah, he did. For a second.”'])assert.ok(said.includes(l),l);});
 press('KeyW');rideTo([M1(1138,3),M1(1134,4),...line1(1130,606,2,25),M1(598,4),S1(10,1.8),...sline1(10,78,1.8)],180);release('KeyW');
 until(()=>C1().phase==='creek',30);
 check(`${label}: Jamie and Sam kept up the whole way, never hidden`,()=>{assert.equal(companionsHidden,0);for(const c of h.chapter.companions.all){const n=h.night;assert.ok(Math.hypot((c.mode==='ride'?c.bx:c.px)-n.roam.x,(c.mode==='ride'?c.bz:c.pz)-n.roam.z)<20,c.key+' left behind');}});
 check(`${label}: the police ahead stop them; they go to the creek instead`,()=>{assert.ok(said.includes('JAMIE: “Wait—stop. Cops.”'));assert.equal(C1().objective,'Look around the creek.');});
 advance(8,watch);off();const c=h.chapter.clue.position;standAt([c.x+1.2,c.z+.6],[c.x,c.z]);
 check(`${label}: the broken reflector is there to find`,()=>assert.equal(h.ui.promptText,'F:Look closer'));tap('KeyF');
 for(let i=0;i<40/DT&&C1().phase!=='c2-black';i++){advance(DT);watch();}// stop right at the hand-over
 // Chapter One no longer stops on an end card: the screen goes black, a quiet CHAPTER TWO, and the
 // same creek a few seconds later (Chapter Two's own checks follow in chapter2-sim.mjs).
 check(`${label}: "That’s his." / "Why would he come back here?", silence, a bell far off, then black and Chapter Two`,()=>{const i=said.indexOf('YOU: “That’s his.”'),j=said.indexOf('SAM: “Why would he come back here?”');assert.ok(i>=0&&j===i+1,'lines');assert.equal(said.length-1,j,'nothing said after: '+JSON.stringify(said.slice(j)));
  assert.notEqual(h.snapshot.state,'ended');assert.equal(element('ending').hidden,true,'no end-of-chapter menu');assert.ok(h.snapshot.state.startsWith('c1-'));});
 check(`${label}: the chapter ran through every phase in order, into Chapter Two`,()=>assert.deepEqual(phases.slice(0,phases.indexOf('c2-black')+1),['home','cruiser','title','briarwood','friends','oak','retrace','creek','clue','c2-black']));
 check(`${label}: nothing ever went missing or non-finite`,()=>assert.deepEqual(bad,[]));
 metrics['chapter1 lines spoken']=said.length;metrics['chapter1 objectives']=objectives;
}
const firstStart=simTime;
const {playChapterTwo,runChapterTwoChecks}=await import('./chapter2-sim.mjs'),T2={h,advance,press,release,tap,check,element,metrics,groundPoint,W};
const {playChapterThree,runChapterThreeChecks}=await import('./chapter3-sim.mjs');
const J1=JUNCTIONS[0];const r1=ride('first ride');finalStop('first ride');chapterOne('first ride');playChapterTwo(T2,'first ride');playChapterThree(T2,'first ride');
if(process.env.ONLY==='dev-record'){const {recordHistory}=await import('./dev-chapters-sim.mjs');console.log(JSON.stringify(recordHistory(h,devCapture,fs,root+'dev-chapter-history.js'),null,1));process.exit(0);}
if(process.env.ONLY==='dev'){if(process.env.DEV_RAW)for(const n of [1,2,3]){const d=devDiff(devNorm(devCapture.natural[n]),devNorm((h.devStart(n),h.dev.snapshot())));console.log('RAW',n,JSON.stringify({how:devCapture.how[n]}));for(const x of d)console.log('RAW',n,JSON.stringify(x));
  const S=h.chapter.kit.S,ph=S.phase;for(let i=0;i<900&&S.phase===ph;i++)advance(1/30);const o=h.dev.snapshot();o.phase=S.phase;for(const x of devDiff(devNorm(devCapture.opened[n]),devNorm(o)))console.log('OPEN',n,JSON.stringify(x));}
 const rep=await runDevChapterChecks(T2,devCapture);console.log(JSON.stringify({passed:checks.length,dev:rep,metrics:metrics['dev chapter selector']},null,1));process.exit(0);}
metrics['first playthrough minutes']=+((simTime-firstStart)/60).toFixed(2);
check('first ride: the head turns toward friends heading home when you are not looking around yourself',()=>assert.ok(r1.glanced>30));
check('first ride: memory lines appear once each, never over a friend\'s line',()=>{const texts=reflections.filter(r=>r.id!=='last').map(r=>r.text);assert.ok(r1.reflectionsSeen.length>=3,'reflections '+r1.reflectionsSeen.length);assert.equal(new Set(r1.reflectionsSeen).size,r1.reflectionsSeen.length);for(const x of r1.reflectionsSeen)assert.ok(texts.includes(x));assert.equal(r1.overlap,0);metrics.reflectionsShown=r1.reflectionsSeen.length;});
check('no friend was hidden before going inside (Alex only once he is out of sight down Briarwood)',()=>{assert.deepEqual(r1.hiddenBad,[]);const g=r1.goneSeen.find(x=>x.who==='ALEX');assert.ok(g,'Alex never left the story');assert.ok(!g.inFrustum||g.occluded,'Alex vanished in plain view '+JSON.stringify(g));metrics.alexGoneView=g;});
const frozen={clock:h.snapshot.clock,finale:h.snapshot.finaleT,position:h.camera.position.clone()};advance(8);
check('ending freezes the world and clears prompts',()=>{assert.equal(h.snapshot.clock,frozen.clock);assert.equal(h.snapshot.finaleT,frozen.finale);assert.ok(h.camera.position.equals(frozen.position));assert.equal(h.ui.promptText,'');});
element('again').onclick();advance(.1);
check('replay resets story, view, bike, friends, doors and controls',()=>{const s=h.snapshot;assert.equal(s.state,'riding');assert.ok(s.distance<.2);assert.equal(s.nextMemory,0);assert.equal(s.look,0);assert.equal(s.headPitch,0);assert.equal(s.finaleT,0);assert.equal(element('ending').hidden,true);
 for(const f of h.friends.list){assert.equal(f.mode,'ride');assert.ok(f.person.group.visible&&f.bike.group.visible);assert.equal(f.person.group.parent,f.bike.group);}assert.equal(W.garages.sam.open,1);assert.equal(W.doors.jamie.open,0);assert.equal(h.keys.size,0);assert.equal(s.push,0);assert.equal(s.stamina,1);assert.equal(s.yawOffset,0);});
check('replay resets Chapter Two too: no card, no morning, no flyers, no found bike, no memory',()=>{const c2=h.chapter2.state;assert.equal(c2.day,0);assert.equal(c2.flyers,false);assert.equal(c2.foundVisible,false);assert.equal(c2.tape,false);assert.equal(c2.searchers,0);assert.equal(h.memory.active,false);assert.equal(element('chapter-card').classList.contains('on'),false);assert.equal(h.skyMat.uniforms.day.value,0);assert.ok(!document.body.classList.contains('remembering'));assert.equal(h.ambient.morningMode,false);});
check('replay resets the environment, interactions, memory lines and the ending',()=>{assert.equal(h.friends.mom.slammed,false);assert.equal(h.ambient.state.kidVisible,true);assert.ok(h.ambient.time.value<.2);assert.ok(h.ambient.state.lamps.every(l=>l===0));assert.ok(h.ambient.state.sprinklers.every(l=>l>.99));assert.equal(h.ambient.state.car,'wait');assert.equal(W.alexWindow.emissiveIntensity,0);
 assert.equal(h.ambient.state.swing,0);assert.equal(h.interact.pose,null);assert.deepEqual(h.interact.used,[]);assert.deepEqual(h.nostalgia.shown,[]);assert.equal(h.ui.reflection,'');assert.deepEqual(h.ending.state,{clue:false,faint:0,otherBike:false,fifthRider:false,otherBikeGone:false});assert.equal(h.ending.otherBike.visible,false);assert.equal(h.ui.promptText,'Space:Ring bell');});

// Second ride: friends' lines and memory lines switched off, and no looking around.
setField('set-captions',false);setField('set-memories',false);
const whoShown=new Set();press('KeyW');const r2=ride('second ride',{each:()=>{for(const c of element('subtitle').children)if(c.textContent&&/^[A-Z]+$/.test(c.textContent))whoShown.add(c.textContent);}});release('KeyW');
check('with captions off, friends\' lines are not shown; with memories off, no memory lines',()=>{assert.equal(whoShown.size,0,[...whoShown].join());assert.equal(r2.reflectionsSeen.length,0);});
setField('set-captions',true);setField('set-memories',true);
friendsHome('second ride');
advance(1);tap('KeyF');advance(2);check('before the call, getting back on the bike keeps you at the end of the street',()=>{assert.equal(h.snapshot.state,'walking');assert.equal(h.ui.promptText,'F:Get on bike');tap('KeyF');advance(1.5);assert.equal(h.snapshot.state,'stopped');assert.equal(h.snapshot.callDone,false);});
tap('KeyF');advance(2);{const c=LOOKOUT.chalk;h.walkTo(c.d-.7,c.lat+.6,0,0);advance(.2);tap('KeyF');advance(1.3);drag(1.0/.0022,-.7/.0022);advance(.4);
 check('before the call there is only JSA in the chalk, and no other bike',()=>{assert.equal(h.snapshot.callDone,false);assert.equal(h.ending.state.clue,false);assert.equal(h.ending.state.otherBike,false);});advance(5);}
let idleClue=false,bikeAppearedInView=false;advance(104,()=>{idleClue ||=h.ending.state.clue;if(!bikeAppearedInView&&h.ending.otherBike.visible&&!h.ending.otherBike.userData.checked){h.ending.otherBike.userData.checked=true;const dir=h.camera.getWorldDirection(new THREE.Vector3()),to=h.ending.otherBike.getWorldPosition(new THREE.Vector3()).sub(h.camera.position).normalize();if(dir.dot(to)>0)bikeAppearedInView=true;}});
check('idle fade also reveals the chalk initials',()=>assert.ok(idleClue));check('the other bike never appears while you look toward it',()=>assert.equal(bikeAppearedInView,false));
advance(4);check('staying at the end of the street fades, then wakes into the ride home on its own',()=>{assert.equal(h.snapshot.state,'c1-ride');assert.equal(h.chapter.state.phase,'home');assert.ok(h.snapshot.fade<.2);});
element('again').onclick();press('KeyW');advance(6);release('KeyW');tap('Escape');advance(.2);
check('back to the title from the pause menu resets everything and waits',()=>{element('to-title').onclick();advance(1);const s=h.snapshot;assert.equal(s.state,'intro');assert.equal(element('intro').hidden,false);assert.equal(element('ride-ui').hidden,true);assert.equal(element('pause').hidden,true);assert.ok(!document.body.classList.contains('riding'));assert.ok(s.distance<.01);assert.equal(h.ui.promptText,'');
 element('start').onclick();advance(.2);assert.equal(h.snapshot.state,'riding');assert.ok(h.snapshot.distance<.05);});
// On a fresh ride (after the title check), where moving the rider cannot disturb the story checks.
// Sidewalk riding: up a driveway cut, along the walk past it, and the planting strip holds you there.
{const cut=W.drivewayOpenings.filter(dr=>dr.side>0&&dr.d>30&&dr.d<260&&!JUNCTIONS.some(j=>Math.abs(dr.d-j.d)<30)).sort((a,b)=>a.d-b.d)[0];
 h.place(cut.d0+.4,5.4,3.2);press('KeyW');let onWalk=false;advance(3,()=>{const s=h.snapshot;if(!onWalk&&s.lateral<6.75){press('KeyD');}else{release('KeyD');onWalk=true;}});release('KeyD');let lats=[],worstY=0;
 advance(6,()=>{const s=h.snapshot;lats.push(s.lateral);if(s.distance>cut.d1+2)worstY=Math.max(worstY,Math.abs(h.bikeY-W.groundY(s.distance,s.lateral)));});
 check('ride up a driveway cut onto the sidewalk and along it',()=>{const s=h.snapshot;assert.ok(s.distance>cut.d1+8,'did not pass the cut');assert.ok(Math.min(...lats.slice(-60))>6.3&&Math.max(...lats)<7.9,'left the walk '+Math.min(...lats)+'..'+Math.max(...lats));assert.ok(worstY<.05,'bike height off the walk '+worstY);});
 press('KeyA');advance(1.2);release('KeyA');advance(1);check('steering off the sidewalk crosses the roadside strip without trapping the bike',()=>{const s=h.snapshot;assert.ok(W.rideable(s.distance,s.lateral,0));assert.ok(s.lateral<6.2,'still trapped on walk '+s.lateral);});
 release('KeyW');}

// Final-polish regressions: player-reported sidewalk/curb, bell and support-foot bugs.
check('junction signs stand clear of utility poles',()=>{for(const sign of W.signs){const p=groundPoint(sign.d,sign.lat);assert.ok(Math.min(...W.poles.map(q=>Math.hypot(q.x-p.x,q.z-p.z)))>2.1,sign.junction+' pole obscures blades');}});
check('the full visible sidewalk width is usable on both sides',()=>{
 for(const d of [50,210,460,740,1020])for(const s of [-1,1])for(const x of [6.40,7.10,7.80])assert.ok(W.rideable(d,s*x),`sidewalk edge ${d}, ${s*x}`);
 for(const d of [50,210,460,740])for(const s of [-1,1])assert.equal(W.rideable(d,s*8.05),false,'yard must stay outside riding band');
});
for(const side of [-1,1])for(const direction of ['up','down'])check(`curb ${direction} on ${side<0?'left':'right'} side: two wheels cross without getting stuck`,()=>{
 let start=80;while(start<1050&&(W.drivewayOpenings.some(c=>c.side===side&&c.d1>start-1&&c.d0<start+23)||W.obstacles.some(o=>o.d1>start-1&&o.d0<start+23&&Math.sign(o.l0)===side&&Math.min(Math.abs(o.l0),Math.abs(o.l1))<8)))start+=1;assert.ok(start<1050,'no clear curb section');
 h.keys.clear();h.place(start,side*(direction==='up'?4.25:7.5),2.8);press('KeyW');const key=(side*(direction==='up'?1:-1))>0?'KeyD':'KeyA';press(key);let biggestStep=0,prev=h.snapshot.lateral;
 advance(4,()=>{biggestStep=Math.max(biggestStep,Math.abs(h.snapshot.lateral-prev));prev=h.snapshot.lateral;});release(key);release('KeyW');
 const ev=h.contact.state.events.filter(e=>e.direction===direction);assert.ok(ev.some(e=>e.wheel==='front')&&ev.some(e=>e.wheel==='rear'),JSON.stringify(h.contact.state));
 assert.ok(direction==='up'?Math.abs(h.snapshot.lateral)>6.4:Math.abs(h.snapshot.lateral)<4.5,'curb trap');assert.ok(biggestStep<.13,'lateral teleport');assert.ok(Math.abs(h.contact.state.offset)<.009);
});
{
 const {createRideContact}=await import('../dist/ride-contact.js');
 check('wheel impacts scale with speed and settle without ringing',()=>{
  const run=speed=>{const c=createRideContact(),events=[];for(let n=0;n<200;n++){const d=n*.015;c.update(1/60,{d,lat:0,yaw:0,speed,geom:BIKE,groundY:d=>d>1?.15:.025,baseY:()=>0,impact:e=>events.push(e)});}return {events,state:c.state};};
  const slow=run(.5),fast=run(4);assert.equal(slow.events.length,2);assert.equal(fast.events.length,2);assert.ok(slow.events[0].strength<fast.events[0].strength*.2);assert.ok(Math.abs(fast.state.offset)<.0001);
 });
}
element('restart').onclick();press('KeyW');advance(8);release('KeyW');press('KeyS');advance(13);release('KeyS');
check('stopped riders plant support feet with individual sides',()=>{
 assert.ok(h.snapshot.speed<.02);assert.ok(h.self.joints.lankle.y<.075&&h.self.joints.rankle.y<.075);
 for(const f of h.friends.list){assert.ok(f.speed<.25,`${f.name} still rolling ${f.speed}`);const J=f.person.joints;assert.ok(Math.min(J.lankle.y,J.rankle.y)<.078,`${f.name} feet floating`);}
 const [j,s,a]=h.friends.list;assert.ok(j.person.joints.lankle.y<j.person.joints.rankle.y);assert.ok(s.person.joints.rankle.y<s.person.joints.lankle.y);assert.ok(a.person.joints.lankle.y<.078&&a.person.joints.rankle.y<.078);
});
check('bell moves the actual left hand and lever, then returns them to the grip',()=>{
 const left=h.self.joints.lwrist.clone(),right=h.self.joints.rwrist.clone();tap('Space');advance(.14);
 assert.ok(h.self.joints.lwrist.distanceTo(left)>.035,'no hand reach');assert.ok(h.self.joints.rwrist.distanceTo(right)<.02,'other hand moved');assert.ok(Math.abs(h.playerBike.bell.lever.rotation.x)>.2,'lever did not move');advance(.7);assert.ok(h.self.joints.lwrist.distanceTo(left)<.015);assert.equal(h.playerBike.bell.lever.rotation.x,0);
});
check('replay clears wheel-impact and additional lore state',()=>{element('restart').onclick();advance(.1);assert.equal(h.contact.state.events.length,0);assert.equal(h.ending.fifth.visible,false);assert.equal(h.ending.state.fifthRider,false);});

// ------------------------------------------------------------------------------------------
// Chapter One: QA jumps, checkpoints and Continue, staying put, riding off script, replay
// ------------------------------------------------------------------------------------------
{const expect={'ride-home':'home','police':'cruiser','title':'title','alex-house':'briarwood','jamie':'friends','sam':'friends','oak':'oak','retrace':'retrace','investigation':'creek','clue':'creek'};
 const jumped={};for(const [sec,phase] of Object.entries(expect)){h.jump(sec);advance(1.5);const s=C1(),cam=h.camera.position;jumped[sec]=s.phase;
  check(`QA jump ${sec}: lands in ${phase}, everything finite, the night set up`,()=>{assert.equal(s.phase,phase);assert.ok(Number.isFinite(cam.x+cam.y+cam.z));assert.ok(document.body.classList.contains('night1'));assert.ok(h.chapter.police.attached);assert.ok(h.snapshot.state.startsWith('c1-'));});}
 h.jump('alex-departure');advance(4);check('QA jump alex-departure: the prologue, riding with all three, just before Alex goes',()=>{const s=h.snapshot;assert.equal(s.state,'riding');assert.ok(s.distance>528&&s.distance<556);assert.ok(h.friends.list.every(f=>f.mode==='ride'));assert.equal(C1().phase,'off');assert.ok(!document.body.classList.contains('night1'));});
 advance(40);check('QA jump alex-departure: Alex says goodbye and turns onto Briarwood',()=>{assert.equal(h.friends.list[2].mode,'leave');});}
// Checkpoints are quiet: saved as you go, offered only on the title menu as Continue.
{const saved=JSON.parse(globalThis.localStorage.getItem('lastlight.chapter1')||'null');
 check('checkpoints are saved during the chapter without showing anything',()=>{assert.ok(saved&&saved.section,'no checkpoint');assert.equal(element('intro').hidden,true,'Continue lives only in the title menu');assert.ok(fs.readFileSync(root+'index.html','utf8').match(/<section id="intro">[\s\S]*id="continue"[\s\S]*<\/section>/),'Continue is inside the title menu');});
 element('to-title')?.onclick?.();h.toTitle?.();advance(.5);
 check('Continue appears on the title menu and returns to the saved moment',()=>{assert.equal(element('continue').hidden,false);element('continue').onclick();advance(1.5);assert.ok(h.snapshot.state.startsWith('c1-'));assert.notEqual(C1().phase,'off');});}
// Staying put: stopped at Alex's house with nobody approached, nothing starts; a minute later still fine.
{h.jump('alex-house');h.placePlayer({x:h.roam.x,z:h.roam.z,a:h.roam.a,mode:'ride',speed:0});advance(90);
 check('lingering on Briarwood: the scene waits for you, nothing breaks',()=>{const s=C1();assert.equal(s.phase,'briarwood');assert.equal(s.flags.talked,undefined);assert.ok(Number.isFinite(h.camera.position.x));});}
// Riding the wrong way when the siren starts: the car still comes, turns, and the night goes on.
{h.jump('ride-home');press('KeyW');advance(3);release('KeyW');h.drive(line1(840,1100,-2,20),{r:2.6});advance(90);h.stopDriving();advance(60);
 check('riding away from it: the police car still arrives and the title still comes',()=>{assert.ok(['title','briarwood'].includes(C1().phase),C1().phase);assert.ok(h.chapter.carA.parked);});}
// Replay from the middle of the night: everything back to the summer evening.
{h.jump('investigation');advance(2);element('restart').onclick();advance(.2);
 check('replay from the middle of the chapter resets the night completely',()=>{const s=C1();assert.equal(s.phase,'off');assert.equal(h.snapshot.state,'riding');assert.ok(!document.body.classList.contains('night1'));assert.equal(h.chapter.police.attached,false);
  assert.ok(h.chapter.adults.every(a=>!a.visible));assert.ok(h.chapter.companions.all.every(c=>!c.active));for(const f of h.friends.list){assert.equal(f.external,false);assert.equal(f.person.group.parent,f.bike.group);assert.ok(f.person.group.visible);}
  assert.equal(W.windows.jamie.open,0);assert.equal(W.sideDoors.sam.open,0);assert.equal(W.doors.alex.open,0);assert.equal(h.chapter.clue.visible,false);assert.equal(element('objective').textContent,'');assert.equal(h.ambient.nightMode,false);assert.equal(h.ambient.state.kidVisible,true);});}

// Focused human-playtest regressions. The full two-run story above remains unchanged.
{h.jump('jamie');const q=groundPoint(850,0),a=heading(850);h.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:{x:q.x+3,z:q.z,a}});advance(.2);
 check('on foot: torso, connected legs and shoes are present, head excluded',()=>{assert.equal(h.self.group.parent,h.scene);assert.ok(h.self.group.visible);assert.equal(h.self.parts.head.layers.mask,2);assert.ok(h.self.joints.lankle.distanceTo(h.self.joints.lknee)<.38);});
 const p=h.camera.position.clone();press('KeyW');advance(4);release('KeyW');advance(.4);
 check('on foot: normal pace covers a practical eight metres in four seconds',()=>assert.ok(h.camera.position.distanceTo(p)>7.7&&h.camera.position.distanceTo(p)<9));
 press('KeyW');press('ShiftLeft');advance(5);
 check('sprint: drains stamina gradually and lasts beyond three seconds',()=>{assert.ok(h.foot.sprint);assert.ok(h.foot.stamina>.5&&h.foot.stamina<.7);});
 advance(8);check('sprint: exhaustion returns to walking with no movement freeze',()=>{assert.ok(h.foot.exhausted);assert.ok(h.foot.speed>1.9);});release('ShiftLeft');release('KeyW');advance(5);
 check('sprint: walking or stopping restores stamina and releases exhaustion',()=>{assert.ok(h.foot.stamina>.6);assert.ok(!h.foot.exhausted);});
 const eyeY=h.camera.position.y;press('KeyC');advance(.7);
 check('crouch: camera lowers smoothly and the torso bends coherently',()=>{assert.ok(h.foot.crouch>.95);assert.ok(eyeY-h.camera.position.y>.48);assert.ok(h.foot.pose[P.lean]>.5);});release('KeyC');advance(.7);
 tap('Space');let peak=0;advance(.8,()=>{peak=Math.max(peak,h.foot.height);});
 check('jump: restrained arc, gravity, landing and cooldown; no horizontal collision bypass',()=>{assert.ok(peak>.4&&peak<.6);assert.equal(h.foot.height,0);assert.ok(h.foot.cooldown>=0);});
 const win=h.chapter.windows.jamie;const inside=win.inside;
 check('jump does not make the house wall walkable',()=>assert.equal(h.nav.walkable(inside.x,inside.z),false));
 h.jump('investigation');advance(.3);check('flashlight: creek checkpoint grants the spare with a connected player body',()=>{assert.ok(h.foot.owned&&h.foot.on&&h.foot.light.intensity>0);assert.equal(h.self.group.parent,h.scene);});
 tap('KeyT');advance(.1);check('flashlight: T toggles without activating F interactions',()=>{assert.equal(h.foot.on,false);assert.equal(C1().phase,'creek');});tap('KeyT');advance(.1);
 element('restart').onclick();advance(.1);check('replay clears stamina, jump, crouch, flashlight and returns body to bicycle',()=>{assert.equal(h.foot.owned,false);assert.equal(h.foot.stamina,1);assert.equal(h.foot.crouch,0);assert.equal(h.foot.height,0);assert.equal(h.self.group.parent,h.playerBike.group);assert.equal(h.foot.light.intensity,0);});
}
check('night sidewalks use lit non-emissive joint geometry',()=>{const joints=W.originals.filter(m=>m.name==='sidewalk-joint');assert.ok(joints.length>500);assert.ok(joints.every(m=>m.material.isMeshStandardMaterial&&m.material.emissive.getHex()===0));});
check('friend homes have distinct persistent prologue/night landmarks',()=>{assert.match(W.homes.jamie.landmark,/red porch chair/);assert.match(W.homes.sam.landmark,/garage/);assert.notEqual(W.homes.jamie.style,W.homes.sam.style);});
{h.jump('jamie');const w=h.chapter.windows.sam;h.placePlayer({x:w.stand.x,z:w.stand.z,a:Math.atan2(w.glass.x-w.stand.x,-(w.glass.z-w.stand.z)),mode:'walk'});advance(.2);tap('KeyF');advance(.4);
 check('Sam first: gentle redirect preserves Jamie-first order',()=>{assert.equal(C1().objective,'Find Jamie.');assert.equal(C1().sam.active,false);assert.equal(C1().line,'I should get Jamie first.');});}
for(const [section,label] of [['alex-house','Briarwood Lane'],['jamie','Jamie’s house'],['sam','Sam’s house'],['oak','The old oak'],['retrace','The way he went'],['investigation','The creek']]){localStorage.setItem('lastlight.chapter1',JSON.stringify({section}));element('to-title').onclick();element('continue').onclick();advance(.5);check('Continue restores '+label,()=>{assert.ok(h.snapshot.state.startsWith('c1-'));assert.ok(Number.isFinite(h.camera.position.y));});}

// The four confirmed human-playtest bugs on the Chapter One release (fan, flag, hoop, old oak).
{const {runPlaytestFixChecks}=await import('./playtest-fixes.mjs');runPlaytestFixChecks({h,advance,press,release,tap,check,element,metrics,W,groundPoint});}
// Chapter Two, beat by beat: the bike, the reflector, the culvert and the bell, the morning, the memory,
// every QA jump and checkpoint, Continue and Start over.
await runChapterTwoChecks(T2);
// Chapter Three on its own: every QA jump and checkpoint, Start over from inside, the heartbeat, voices,
// bells and recordings as audio signals, the tension system, the caption tone, seeded randomized runs.
await runChapterThreeChecks(T2);
// Chapter Three again, twice, in the same page, after all those jumps and Start overs (Continue from Chapter Two's last
// checkpoint, then the whole chapter with inputs): every beat as the first time, nothing carried over.
for(const n of [2,3]){h.jump('chapter2-end');playChapterThree(T2,'Chapter Three replay '+n);}
// TEMPORARY (private playtest build): the dev chapter selector equals natural arrival; switching leaks nothing.
await runDevChapterChecks(T2,devCapture);

const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(root+n).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(root+n)).digest('hex')]));
console.log(JSON.stringify({runtimeHashes,passed:checks.length,checks,metrics,testMethod:'Actual Three.js geometry and full state updates with a mocked WebGL renderer and DOM.'},null,2));
