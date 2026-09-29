import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from '../dist/three.module.js';
import {roadFrame,roadGrade,groundPoint,roadSurface,LATERAL_LIMIT,heading} from '../dist/route.js';
import {memories,LENGTH} from '../dist/story.js';
import {BODY,BIKE,newPose,ridePose,walkPose,dismountKeys,samplePose,createPerson,applyPose,pedalPos,P,stride} from '../dist/rig.js';
import {LOOKOUT} from '../dist/world.js';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const elements=new Map(),events=new Map(),docEvents=new Map();
function element(id){if(!elements.has(id))elements.set(id,{hidden:['ending','pause','error','ride-ui','mobile','act'].includes(id),style:{},textContent:'',innerHTML:'',children:[],events:new Map(),setAttribute(){},replaceChildren(){this.children=[]},append(x){this.children.push(x)},addEventListener(type,fn){this.events.set(type,fn)},setPointerCapture(){}});return elements.get(id);}
const canvas=element('world');
globalThis.document={getElementById:element,createElement:()=>element('el'+Math.random()),createTextNode:text=>({textContent:text}),body:{classList:{add(){}}},addEventListener:(t,fn)=>docEvents.set(t,fn),hidden:false,pointerLockElement:null,exitPointerLock(){this.pointerLockElement=null;docEvents.get('pointerlockchange')?.();}};
canvas.requestPointerLock=()=>{document.pointerLockElement=canvas;docEvents.get('pointerlockchange')?.();return Promise.resolve();};
globalThis.window={};globalThis.devicePixelRatio=1;globalThis.innerWidth=1440;globalThis.innerHeight=900;globalThis.matchMedia=()=>({matches:false});globalThis.addEventListener=(type,fn)=>events.set(type,fn);let tick;globalThis.requestAnimationFrame=fn=>tick=fn;
globalThis.FakeRenderer=class{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}};
let source=fs.readFileSync(root+'game.js','utf8').replaceAll(/'\.\/([\w.]+)\.js'/g,(_,name)=>JSON.stringify(pathToFileURL(root+name+'.js').href)).replace('new THREE.WebGLRenderer','new globalThis.FakeRenderer');
source+=`\nglobalThis.harness={get snapshot(){return {state,distance,speed,lateral,look,headPitch,pedalPhase,steerVelocity,nextMemory,currentChapter,finaleT,callDone,walkD,walkLat,walkYaw,fade,clock,manualLook}},road,scene,camera,bikeRoot,playerBike,friends,originals,keys,world,ambient,selfPose,self};`;
const t0=Date.now();
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const buildMs=Date.now()-t0;
const h=globalThis.harness,key=code=>({code,preventDefault(){},repeat:false});let t=0,simTime=0;
const DT=1/30;const advance=(seconds,each)=>{for(let i=0;i<Math.ceil(seconds/DT);i++){t+=DT*1000;tick(t);simTime+=DT;each?.();}};
const press=code=>events.get('keydown')(key(code)),release=code=>events.get('keyup')(key(code));
const checks=[],metrics={};function check(name,fn){fn();checks.push(name);}
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
advance(.05);

check('all local assets resolve',()=>{const html=fs.readFileSync(root+'index.html','utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(m[1]!=='./')assert.ok(fs.existsSync(root+m[1]),m[1]);for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.js')))for(const m of fs.readFileSync(root+f,'utf8').matchAll(/from '\.\/([\w.]+)'/g))assert.ok(fs.existsSync(root+m[1]),f+' -> '+m[1]);});
check('gentle continuous route with constant distance scale',()=>{let maxGrade=0,maxStep=0;for(let d=0;d<LENGTH+40;d+=.5){const a=roadFrame(d),b=roadFrame(d+.5);assert.ok(Math.abs(Math.hypot(b.x-a.x,b.z-a.z)-.5)<.0002);maxGrade=Math.max(maxGrade,Math.abs(roadGrade(d)));maxStep=Math.max(maxStep,Math.abs(a.heading-b.heading));}assert.ok(maxGrade<.043);assert.ok(maxStep<.007);});
check('asphalt faces upward and follows terrain throughout ride',()=>{for(let d=0;d<=LENGTH;d+=5)for(const side of [-LATERAL_LIMIT,0,LATERAL_LIMIT]){const p=groundPoint(d,side);ray.set(new THREE.Vector3(p.x,p.y+5,p.z),down);const hits=ray.intersectObject(h.road);assert.ok(hits.length,`road missing at ${d}, ${side}`);assert.ok(hits[0].face.normal.y>.99);assert.ok(Math.abs(hits[0].point.y-roadSurface(d,side))<.002,`height discontinuity ${d}`);}});
check('side streets connect through curb openings',()=>{const asphalt=h.originals.filter(o=>o.material===h.road.material);for(const j of [{d:475,side:1},{d:740,side:-1}])for(let x=3.5;x<49;x+=.5){const p=groundPoint(j.d,j.side*x);ray.set(new THREE.Vector3(p.x,p.y+5,p.z),down);const hits=ray.intersectObjects(asphalt);assert.ok(hits.length,`gap at junction ${j.d}, ${x}`);assert.ok(Math.abs(hits[0].point.y-p.y)<.09);}});
check('walkable ground height matches rendered lawns, walks, drives and the lookout',()=>{
 // Every point riders and walkers stand on must agree with the visible surface under it.
 const solid=h.world.merged.filter(m=>!m.material.transparent&&m.material.side!==THREE.BackSide);const spots=[];
 for(const home of Object.values(h.world.homes)){for(let u=0;u<=1;u+=.25){spots.push([home.drivD,home.side*(5.2+u*(home.endLat-6))]);}const door=home.S(home.doorX,home.front+.5);spots.push([door.d,door.lat]);const st=home.S(home.doorX,home.stepFront+.5);spots.push([st.d,st.lat]);}
 for(let d=40;d<1100;d+=97)for(const lat of [-12,-7,7,12])spots.push([d,lat]);for(let d=1124;d<1170;d+=5)for(const lat of [-9,-3,0,4,10])spots.push([d,lat]);
 let worst=0;for(const [d,lat] of spots){const p=groundPoint(d,lat);ray.set(new THREE.Vector3(p.x,h.world.groundY(d,lat)+.9,p.z),down);const hit=ray.intersectObjects(solid)[0];if(!hit)continue;const err=Math.abs(hit.point.y-h.world.groundY(d,lat));if(err>worst)worst=err;assert.ok(err<.06,`ground mismatch ${err.toFixed(3)} at ${d.toFixed(1)}, ${lat.toFixed(1)}`);}metrics.maxGroundMismatch=+worst.toFixed(3);});
check('all roof slopes face upward',()=>{const roofs=h.originals.filter(o=>o.name==='roof-slope');assert.ok(roofs.length>60);for(const roof of roofs){const n=roof.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(n.getY(i)>.2,'inverted roof slope');}});
check('lookout sidewalk follows the grassy rise and faces upward',()=>{const ring=h.originals.find(o=>o.name==='lookout-walk');assert.ok(ring);for(let a=.7;a<5.6;a+=.2){const d=1142-Math.cos(a)*13.1,lat=Math.sin(a)*13.1,p=groundPoint(d,lat);ray.set(new THREE.Vector3(p.x,p.y+4,p.z),down);const hit=ray.intersectObject(ring)[0];assert.ok(hit,'missing sidewalk');assert.ok(hit.face.normal.y>.95);assert.ok(Math.abs(hit.point.y-h.world.groundY(d,lat))<.035);}});
check('hands stay within two centimeters of grips while steering',()=>{const person=createPerson(),p=newPose();let worst=0;for(const steer of [-.55,-.25,0,.25,.55])for(const stand of [0,.5,1]){ridePose(p,0,{steer,stand});applyPose(person,p);for(const [s,o] of [['l',P.lh],['r',P.rh]])worst=Math.max(worst,person.joints[s+'wrist'].distanceTo(new THREE.Vector3().fromArray(p,o)));}assert.ok(worst<.02,'grip reach '+worst);metrics.gripReachErrorMeters=+worst.toFixed(4);});
check('rig limbs keep their length through riding, walking and dismount poses',()=>{const person=createPerson(),poses=[];for(let a=0;a<6.3;a+=.3)poses.push(ridePose(newPose(),a,{}),ridePose(newPose(),a,{stand:1}));for(let ph=0;ph<1;ph+=.05)poses.push(walkPose(newPose(),ph,1.3),walkPose(newPose(),ph,3.2));const keys=dismountKeys();for(let s=0;s<=1.3;s+=.05)poses.push(samplePose(newPose(),keys,s));
 for(const p of poses){applyPose(person,p);const pr=person.parts;for(const [s,side] of [['l',-1],['r',1]]){
  const hip=new THREE.Vector3(side*BODY.hip,-.03,0).applyAxisAngle(new THREE.Vector3(0,1,0),p[P.yaw]).add(new THREE.Vector3(p[0],p[1],p[2]));
  const knee=pr[s+'thigh'].position.clone().multiplyScalar(2).sub(hip);assert.ok(Math.abs(knee.distanceTo(hip)-BODY.thigh)<1e-4,'thigh length');assert.ok(Math.abs(knee.distanceTo(person.joints[s+'ankle'])-BODY.shin)<1e-4,'shin length');
  const elbow=pr[s+'fore'].position.clone().multiplyScalar(2).sub(person.joints[s+'wrist']);assert.ok(Math.abs(elbow.distanceTo(person.joints[s+'wrist'])-BODY.fore)<1e-4,'forearm length');}}});
check('rider feet stay on the pedals through a full crank turn',()=>{const person=createPerson(),p=newPose();let worst=0;for(let a=0;a<Math.PI*2;a+=.1){ridePose(p,a,{});applyPose(person,p);for(const [s,side] of [['l',-1],['r',1]]){const target=new THREE.Vector3().fromArray(p,s==='l'?P.lf:P.rf);worst=Math.max(worst,person.joints[s+'ankle'].distanceTo(target));}}assert.ok(worst<.005,'foot leaves pedal by '+worst);metrics.pedalReachErrorMeters=+worst.toFixed(4);});
check('walking stance feet stay planted',()=>{const sp=1.3,S=stride(sp);let worst=0;for(const off of [0,.5]){let prev=null;for(let ph=off+.02;ph<off+.5;ph+=.01){const p=walkPose(newPose(),ph,sp);const u=(ph%1+1)%1;const f=p[P.rf+2]-S*ph;if(prev!==null&&((u+.5)%1)<.5)worst=Math.max(worst,Math.abs(f-prev));prev=f;}}assert.ok(worst<.03,'stance slip '+worst);});
element('start').onclick();press('KeyW');advance(5);
check('pedaling advances bike, animated feet stay on pedals',()=>{assert.ok(h.snapshot.distance>15);assert.ok(h.snapshot.pedalPhase>10);const p=h.selfPose;for(const [s,side] of [['l',-1],['r',1]]){assert.ok(h.self.joints[s+'ankle'].distanceTo(new THREE.Vector3().fromArray(p,s==='l'?P.lf:P.rf))<.005);}});
const initialLateral=h.snapshot.lateral;
events.get('mousemove')({movementX:300,movementY:180});advance(.8);
check('mouse head-look turns smoothly without steering',()=>{assert.ok(h.snapshot.look<-.5);assert.ok(h.snapshot.headPitch<-.3);assert.equal(h.snapshot.lateral,initialLateral);assert.ok(Math.abs(h.bikeRoot.rotation.y+roadFrame(h.snapshot.distance).heading)<1e-9);});
press('KeyR');advance(.8);check('R returns gaze forward',()=>{assert.ok(Math.abs(h.snapshot.look)<.01);assert.ok(Math.abs(h.snapshot.headPitch)<.01);});release('KeyR');
press('KeyQ');advance(.7);check('Q looks left',()=>assert.ok(h.snapshot.look>.70));release('KeyQ');press('KeyE');advance(.7);check('E looks right',()=>assert.ok(h.snapshot.look<-.70));release('KeyE');advance(.7);
press('KeyA');advance(5);check('A steering stays inside left road edge, turns the bars and leans',()=>{assert.equal(h.snapshot.lateral,-LATERAL_LIMIT);});release('KeyA');
press('KeyD');let maxSteer=0,maxLean=0;advance(1.2,()=>{maxSteer=Math.max(maxSteer,Math.abs(h.playerBike.steerAngle));maxLean=Math.max(maxLean,Math.abs(h.bikeRoot.rotation.z));});advance(7);
check('D steering stays inside right road edge, turns the bars and leans',()=>{assert.equal(h.snapshot.lateral,LATERAL_LIMIT);assert.ok(maxSteer>.02,'bars do not turn');assert.ok(maxLean>.01&&maxLean<.25,'lean '+maxLean);});release('KeyD');
const stopped=h.snapshot.distance;press('Escape');advance(1);check('pause freezes travel and releases mouse',()=>{assert.equal(h.snapshot.state,'paused');assert.equal(h.snapshot.distance,stopped);assert.equal(document.pointerLockElement,null);});
element('resume').onclick();press('KeyW');advance(.1);
check('spurious mouse jump right after pointer lock is ignored',()=>{const before=h.snapshot.look;events.get('mousemove')({movementX:-640,movementY:-500});advance(.3);assert.ok(Math.abs(h.snapshot.look-before)<.05);});
document.exitPointerLock();check('browser pointer-lock exit pauses safely',()=>assert.equal(h.snapshot.state,'paused'));
canvas.requestPointerLock=()=>Promise.reject(new Error('test unavailable'));element('resume').onclick();await Promise.resolve();canvas.events.get('pointerdown')({clientX:100,clientY:100,pointerId:1});events.get('mousemove')({clientX:150,clientY:130});events.get('mousemove')({clientX:250,clientY:180});press('KeyW');advance(.5);check('drag fallback works when pointer lock unavailable',()=>assert.ok(h.snapshot.look<-.15));canvas.events.get('pointerup')();press('KeyR');advance(.5);release('KeyR');

// Full ride, holding W and never looking around, as a first-time player might.
function ride(label){
 const F=h.friends.list,last=new Map(),seen={},angles={};let observed=h.snapshot.nextMemory,maxEye=[9,0],maxJump=0,hiddenBad=[];const fwd=new THREE.Vector3();
 const mark=(f,tag,obj)=>{if(seen[f.name+tag])return;seen[f.name+tag]=true;h.camera.getWorldDirection(fwd);const p=obj.getWorldPosition(new THREE.Vector3()).sub(h.camera.position);angles[f.name+':'+tag]=Math.round(Math.acos(Math.max(-1,Math.min(1,(p.x*fwd.x+p.z*fwd.z)/Math.hypot(p.x,p.z)/Math.hypot(fwd.x,fwd.z))))*180/Math.PI);};
 let rideSeconds=0;
 while(['riding','arriving'].includes(h.snapshot.state)&&rideSeconds<400){advance(DT);rideSeconds+=DT;const s=h.snapshot;
  assert.ok(Math.abs(s.lateral)<=LATERAL_LIMIT);assert.ok(s.nextMemory===observed||s.nextMemory===observed+1);
  if(s.nextMemory>observed){assert.ok(s.distance>=memories[s.nextMemory-1].at);assert.ok(s.distance-memories[s.nextMemory-1].at<.27,'late trigger '+(s.distance-memories[s.nextMemory-1].at));observed=s.nextMemory;}
  if(s.state==='riding'){const eye=h.camera.position.y-roadSurface(s.distance,s.lateral);maxEye=[Math.min(maxEye[0],eye),Math.max(maxEye[1],eye)];}
  for(const f of F){for(const [tag,obj] of [['bike',f.bike.group],['body',f.person.parts.pelvis]]){const p=obj.getWorldPosition(new THREE.Vector3()),k=f.name+tag,q=last.get(k);if(q&&f.person.group.visible&&(tag==='body'||obj.visible)){const jump=p.distanceTo(q);maxJump=Math.max(maxJump,jump);assert.ok(jump<.3,`${f.name} ${tag} jumped ${jump.toFixed(2)} m (step ${f.step})`);}last.set(k,p);}
   for(const v of Object.values(f.person.group.position))assert.ok(Number.isFinite(v));
   if(f.mode==='leave'&&f.step===1)mark(f,'stops',f.bike.group);if(f.mode==='foot'&&f.step>=3)mark(f,'on foot',f.person.group);if(f.inside)mark(f,'inside',f.person.group);
   if(!f.person.group.visible&&!f.inside)hiddenBad.push(f.name);}
 }
 check(`${label}: clue stays hidden throughout the ride`,()=>assert.equal(h.ambient.clue.visible,false));
 check(`${label}: all 14 story triggers in order, eye height steady`,()=>{assert.equal(h.snapshot.nextMemory,14);assert.ok(maxEye[0]>1.35&&maxEye[1]<1.62,`eye ${maxEye}`);});
 metrics[label+' ride seconds']=Math.round(rideSeconds);metrics[label+' departure view angles (deg)']=angles;metrics.maxFriendStepMeters=+maxJump.toFixed(3);
 return {hiddenBad};
}
function finalStop(label,{walk=true}={}){
 check(`${label}: bike rolls to a stop at the end of the street`,()=>{assert.equal(h.snapshot.state,'stopped');assert.ok(Math.abs(h.snapshot.distance-LOOKOUT.stop.d)<.05);});
 const F=h.friends.list;
 check(`${label}: every friend went home believably`,()=>{
  for(const f of F){assert.ok(f.inside,`${f.name} not inside`);assert.equal(f.person.group.visible,false);}
  const [jamie,sam,alex]=F;assert.ok(jamie.bike.group.visible&&Math.abs(jamie.fall)>1.2,'Jamie\'s bike lies on the lawn');assert.ok(alex.bike.group.visible&&alex.kick>.99,'Alex\'s bike stands on its kickstand');
  assert.equal(sam.bike.group.visible,false);assert.ok(h.world.garages.sam.open<.01,'Sam\'s garage closed');assert.ok(h.world.doors.jamie.open<.01&&h.world.doors.alex.open<.01,'doors closed');
  // Nobody vanishes in the open: hidden people are behind their own door or garage door.
  const behind=(f,door)=>{const g=f.person.group.position,th=door.threshold,o=door.outside,a=groundPoint(th.d,th.lat),b=groundPoint(o.d,o.lat);return ((g.x-a.x)*(b.x-a.x)+(g.z-a.z)*(b.z-a.z))<0;};
  assert.ok(behind(jamie,h.world.doors.jamie),'Jamie hid outside');assert.ok(behind(alex,h.world.doors.alex),'Alex hid outside');});
 if(!walk)return;
 advance(2);press('KeyF');release('KeyF');advance(2);
 check(`${label}: F gets off the bike and the player can walk`,()=>{assert.equal(h.snapshot.state,'walking');});
 const start=[h.snapshot.walkD,h.snapshot.walkLat];press('KeyW');advance(6);release('KeyW');
 check(`${label}: walking moves the player and stays inside the lookout`,()=>{const s=h.snapshot,B=LOOKOUT.bounds;assert.ok(Math.hypot(s.walkD-start[0],s.walkLat-start[1])>3,'did not move');assert.ok(s.walkD>=B.d0&&s.walkD<=B.d1&&s.walkLat>=B.l0&&s.walkLat<=B.l1);
  const eye=h.camera.position.y-h.world.groundY(s.walkD,s.walkLat);assert.ok(eye>1.35&&eye<1.5,'standing eye '+eye);});
 press('KeyW');advance(20);release('KeyW');check(`${label}: the fence stops the walk`,()=>assert.ok(h.snapshot.walkD<LOOKOUT.fenceD-.2));
 // Turn around and look back toward the neighborhood; the evening's last call comes.
 const turn=dx=>{canvas.events.get('pointerdown')({clientX:0,clientY:0,pointerId:1});events.get('mousemove')({clientX:dx,clientY:0});canvas.events.get('pointerup')();};
 turn(1430);advance(4);check(`${label}: the player can turn all the way around on foot`,()=>assert.ok(Math.abs(Math.abs(h.snapshot.walkYaw)-Math.PI)<.2));advance(18);
 check(`${label}: looking back brings the distant call`,()=>assert.ok(h.snapshot.callDone));
 // Walk back to the bike and ride home.
 for(let i=0;i<1500&&!(Math.hypot(h.snapshot.walkD-h.snapshot.distance,h.snapshot.walkLat-h.snapshot.lateral)<1.5);i++){const s=h.snapshot;const want=Math.atan2(-(s.lateral+.75-s.walkLat),s.distance-s.walkD);turn(-(want-s.walkYaw)/.0022);press('KeyW');advance(DT);}
 release("KeyW");advance(.3);press("KeyF");release("KeyF");advance(1.5);check(`${label}: F near the bike rides home`,()=>assert.ok(['leaving','ended'].includes(h.snapshot.state)));
 let clueSeen=false;advance(5,()=>{clueSeen ||=h.ambient.clue.visible;});check(`${label}: one clue appears during the final fade`,()=>assert.ok(clueSeen));check(`${label}: the ending card appears`,()=>{assert.equal(h.snapshot.state,'ended');assert.equal(element('ending').hidden,false);assert.equal(h.snapshot.currentChapter,3);});
}
const firstStart=simTime;
const r1=ride('first ride');finalStop('first ride');metrics['first playthrough minutes']=+((simTime-firstStart)/60).toFixed(2);
const frozen={clock:h.snapshot.clock,finale:h.snapshot.finaleT,position:h.camera.position.clone()};advance(8);
check('ending freezes world and clears the clue and controls',()=>{assert.equal(h.snapshot.clock,frozen.clock);assert.equal(h.snapshot.finaleT,frozen.finale);assert.ok(h.camera.position.equals(frozen.position));assert.equal(h.ambient.clue.visible,false);assert.equal(element('controls').innerHTML,'');});
check('no friend was hidden before going inside',()=>assert.deepEqual(r1.hiddenBad,[]));
element('again').onclick();advance(.1);
check('replay resets story, view, bike, friends, doors and controls',()=>{const s=h.snapshot;assert.equal(s.state,'riding');assert.equal(s.distance,0);assert.equal(s.nextMemory,0);assert.equal(s.look,0);assert.equal(s.headPitch,0);assert.equal(s.finaleT,0);assert.equal(element('ending').hidden,true);
 for(const f of h.friends.list){assert.equal(f.mode,'ride');assert.ok(f.person.group.visible&&f.bike.group.visible);assert.equal(f.person.group.parent,f.bike.group);}assert.equal(h.world.garages.sam.open,1);assert.equal(h.world.doors.jamie.open,0);assert.equal(h.keys.size,0);});
check('replay resets environment, final clue and mother sound state',()=>{assert.equal(h.friends.mom.slammed,false);assert.equal(h.ambient.clue.visible,false);assert.equal(h.ambient.state.kidVisible,true);assert.ok(h.ambient.time.value<.2);assert.ok(h.ambient.state.lamps.every(l=>l===0));assert.ok(h.ambient.state.sprinklers.every(l=>l>.99));assert.equal(h.ambient.state.car,'wait');assert.equal(h.world.alexWindow.emissiveIntensity,0);});
press('KeyW');ride('second ride');release('KeyW');finalStop('second ride',{walk:false});
let idleClue=false;advance(104,()=>{idleClue ||=h.ambient.clue.visible;});check('idle fade also reveals the single clue',()=>assert.ok(idleClue));check('staying at the end of the street eventually fades to the ending on its own',()=>assert.equal(h.snapshot.state,'ended'));
console.log(JSON.stringify({passed:checks.length,checks,metrics,worldBuildMs:buildMs,testMethod:'Actual Three.js geometry and full state updates with a mocked WebGL renderer and DOM.'},null,2));
