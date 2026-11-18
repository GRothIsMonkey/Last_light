// The Bike Lab (DEV): the four authored bicycles beside the game's own procedural ones, drawn with the game's renderer
// settings (game.js: ACES filmic, exposure 1.16, sRGB, PCF soft shadows, the Prologue's hemisphere and sun colours, fog).
// Arrangements: 'lineup' (authored, common scale), 'compare' (each boy's authored bike beside his rig.js bike),
// 'riders' (the game's procedural boys riding the authored bikes under the real rig.js ridePose: wheels, cranks, pedals,
// steering), and a first-person view from the protagonist's eye on his bike. Contacts are measured every frame.
// ?qa: no animation loop; window.__bikelab drives it (tests/bike-browser.mjs).
import * as THREE from './three.module.js';
import {createBike,poseBike,ridePose,newPose,createPerson,applyPose,headPos,gripPos,pedalPos,P} from './rig.js';
import {CAST} from './cast.js';
import {BIKE_IDS,upgradeBike} from './bike-assets.js';

const qa=/[?&]qa\b/.test(location.search),hud=document.getElementById('hud'),canvas=document.getElementById('lab');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:qa});
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xd9b39a);scene.fog=new THREE.FogExp2(0xe3ac8d,.012);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.03,200);
const hemi=new THREE.HemisphereLight(0xe8e3d3,0x68675d,2.0);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffd09b,2.7);sun.position.set(-9,5.2,-6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:40});sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;scene.add(sun,sun.target);
// a driveway of asphalt beside a strip of lawn (plain materials, the same values the game's street uses broadly)
const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x3c3b39,roughness:.93}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const lawn=new THREE.Mesh(new THREE.PlaneGeometry(60,20),new THREE.MeshStandardMaterial({color:0x56663a,roughness:.95}));lawn.rotation.x=-Math.PI/2;lawn.position.set(0,.003,14);lawn.receiveShadow=true;scene.add(lawn);

const ONLY=(new URLSearchParams(location.search).get('only')||'').split(',').filter(Boolean);
const KEYS=ONLY.length?ONLY:['jamie','sam','alex','player'];   // ?only=jamie,sam to look at some of them
const SPACING=1.42;
const rows={authored:{},procedural:{},riders:{}};
function placeBike(b,x,z,face=-Math.PI/2){b.group.position.set(x,0,z);b.group.rotation.set(0,face,0);}

let t=0,anim=true,mode='lineup',handles={};
const riders={};
async function build(){
 const t0=performance.now();
 for(const [i,k] of KEYS.entries()){
  // authored (an upgraded rig.js bike), the plain rig.js bike, and a rider's bike
  const a=createBike(CAST[k].bike);scene.add(a.group);handles[k]=await upgradeBike(a,BIKE_IDS[k],{renderer});rows.authored[k]=a;
  const p=createBike(CAST[k].bike);scene.add(p.group);p.group.traverse(o=>{if(o.isMesh)o.castShadow=true;});rows.procedural[k]=p;
  const r=createBike(CAST[k].bike);scene.add(r.group);await upgradeBike(r,BIKE_IDS[k],{renderer});rows.riders[k]=r;
  const person=createPerson(k==='player'?{...CAST.player}:CAST[k]);r.group.add(person.group);riders[k]={bike:r,person,pose:newPose(),crank:i*1.3};
 }
 arrange('lineup');return +(performance.now()-t0).toFixed(0);
}
function arrange(m){mode=m;
 for(const [i,k] of KEYS.entries()){const x=(i-1.5)*SPACING;
  const A=rows.authored[k],Pr=rows.procedural[k],R=rows.riders[k];
  A.group.visible=m==='lineup'||m==='compare';Pr.group.visible=m==='compare';R.group.visible=m==='riders'||m==='fp';
  if(m==='lineup'){placeBike(A,x,0);}
  if(m==='compare'){placeBike(A,(i-1.5)*2.9-.62,0);placeBike(Pr,(i-1.5)*2.9+.62,0);}
  if(m==='riders'||m==='fp'){placeBike(R,x*1.15,0);}
 }}
// rest pose for the parked bikes: a little steer and the cranks at a quarter turn, as a bike stands
function parkPose(){for(const row of [rows.authored,rows.procedural])for(const b of Object.values(row)){b.wheel=0;b.crankAngle=1.1;b.steerAngle=-.12;b.kickstand=0;poseBike(b);}}

const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_m=new THREE.Matrix4();
// Contacts of the game's procedural rider on the authored bike: hand vertices to the grip surface, shoe soles to the
// pedal tops, the pelvis to the saddle. Negative = interpenetration, positive = gap (metres).
function contacts(k){const R=riders[k],b=R.bike,G=b.geom,person=R.person,out={};
 b.group.updateMatrixWorld(true);
 const gripR=.016,toLocal=_m.copy(b.group.matrixWorld).invert();
 for(const [side,part] of [[-1,'lhand'],[1,'rhand']]){const g=gripPos(b.steerAngle,side,new THREE.Vector3(),G);
  // grip axis: through the grip point along the steered bar (bike-local); the grip surface is ~1.6 cm off it
  const ax=new THREE.Vector3(1,0,0).applyQuaternion(G.rakeInv).applyAxisAngle(new THREE.Vector3(0,1,0),b.steerAngle).applyQuaternion(G.rakeQ).normalize();
  const mesh=person.parts[part],pos=mesh.geometry.attributes.position;let best=Infinity;
  for(let i=0;i<pos.count;i+=3){_a.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(toLocal);_b.subVectors(_a,g);const along=_b.dot(ax);_c.copy(ax).multiplyScalar(along);const d=_b.sub(_c).length()-gripR;if(Math.abs(along)<.07&&d<best)best=d;}
  out[`hand_${side<0?'l':'r'}`]=+best.toFixed(4);}
 for(const [side,part,idx] of [[-1,'lshoe',0],[1,'rshoe',1]]){const pc=pedalPos(b.crankAngle,side,new THREE.Vector3(),G);
  const mesh=person.parts[part],pos=mesh.geometry.attributes.position;let lowest=Infinity;
  for(let i=0;i<pos.count;i++){_a.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(toLocal);if(Math.abs(_a.x-pc.x)<.05&&Math.abs(_a.z-pc.z)<.06)lowest=Math.min(lowest,_a.y);}
  out[`sole_${side<0?'l':'r'}`]=lowest===Infinity?null:+(lowest-(pc.y+.011)).toFixed(4);}// (pedal top ~1.1 cm above its centre)
 {const mesh=person.parts.pelvis,pos=mesh.geometry.attributes.position;let lowest=Infinity;
  for(let i=0;i<pos.count;i++){_a.fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(toLocal);if(Math.abs(_a.z-G.saddle[2])<.07&&Math.abs(_a.x)<.06)lowest=Math.min(lowest,_a.y);}
  const top=saddleTop(b);out.pelvis_to_saddle=top===null||lowest===Infinity?null:+(lowest-top).toFixed(4);}
 return out;}
const ray=new THREE.Raycaster();
function saddleTop(b){const G=b.geom;b.group.updateMatrixWorld(true);const o=new THREE.Vector3(0,G.saddle[1]+.3,G.saddle[2]).applyMatrix4(b.group.matrixWorld);
 const d=new THREE.Vector3(0,-1,0);ray.set(o,d);ray.far=.6;const hits=ray.intersectObject(b.frame,true).filter(h=>{for(let p=h.object;p;p=p.parent)if(p.userData?.authored)return h.object.visible;return false;});
 if(!hits.length)return null;return b.group.worldToLocal(hits[0].point.clone()).y;}

function step(dt){t+=dt;
 for(const [i,k] of KEYS.entries()){const R=riders[k];if(!R)continue;const b=R.bike;R.crank+=dt*4.2*(anim?1:0);
  const steer=anim?.1*Math.sin(t*.8+i):0;b.crankAngle=R.crank;b.wheel+=dt*(anim?13.5:0);b.steerAngle=steer;b.kickstand=0;poseBike(b);
  ridePose(R.pose,R.crank,{geom:b.geom,steer,posture:CAST[k].build?.posture||0,look:anim?.15*Math.sin(t*.5+i):0});applyPose(R.person,R.pose);}
 for(const h of [...Object.values(handles),...Object.values(rows.riders).map(b=>b.authored)])h?.update(camera);}

const VIEWS={
 lineup:{p:[3.9,1.55,-6.2],t:[0,.55,0],fov:34,arr:'lineup'},
 'lineup-side':{p:[0,.62,-8.6],t:[0,.55,0],fov:30,arr:'lineup'},
 'lineup-rear':{p:[-3.4,1.5,5.8],t:[0,.55,0],fov:34,arr:'lineup'},
 compare:{p:[0,1.25,-9.5],t:[0,.55,0],fov:38,arr:'compare'},
 'compare-jamie':{p:[-4.35,.95,-3.1],t:[-4.35,.55,0],fov:34,arr:'compare'},'compare-sam':{p:[-1.45,.95,-3.1],t:[-1.45,.55,0],fov:34,arr:'compare'},
 'compare-alex':{p:[1.45,.95,-3.1],t:[1.45,.55,0],fov:34,arr:'compare'},'compare-player':{p:[4.35,.95,-3.1],t:[4.35,.55,0],fov:34,arr:'compare'},
 riders:{p:[3.6,1.6,-6.4],t:[0,.8,0],fov:36,arr:'riders'},
 fp:{fp:true,arr:'fp',fov:64},
};
let yaw=0,pitch=0,dist=0,base=VIEWS.lineup,viewName='lineup';
function view(name){viewName=name;base=VIEWS[name]||VIEWS.lineup;if(base.arr&&base.arr!==mode)arrange(base.arr);if(base.arr!=='riders'&&base.arr!=='fp')parkPose();yaw=pitch=0;dist=0;camera.fov=base.fov;camera.updateProjectionMatrix();place();}
function place(){if(base.fp){fpCamera();return;}const tg=new THREE.Vector3(...base.t),o=new THREE.Vector3(...base.p).sub(tg);const sph=new THREE.Spherical().setFromVector3(o);sph.radius*=1+dist;sph.theta+=yaw;sph.phi=Math.max(.1,Math.min(Math.PI-.1,sph.phi+pitch));camera.position.copy(tg).add(new THREE.Vector3().setFromSpherical(sph));camera.lookAt(tg);}
// the protagonist's eye, as game.js places it: headPos(pose) + EYE {up .03, forward .06, pitch -.16}, then looking down
function fpCamera(){const R=riders.player;if(!R)return;const h=headPos(R.pose,new THREE.Vector3());const eye=new THREE.Vector3(h.x,h.y+.03,h.z-.06);
 R.bike.group.updateMatrixWorld(true);camera.position.copy(eye.applyMatrix4(R.bike.group.matrixWorld));
 const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.16-.42+pitch,yaw,0,'YXZ'));R.bike.group.getWorldQuaternion(_q0);camera.quaternion.copy(_q0).multiply(q);}
const _q0=new THREE.Quaternion();
const bar=document.getElementById('views');for(const n of Object.keys(VIEWS)){const b=document.createElement('button');b.textContent=n;b.onclick=()=>view(n);bar.appendChild(b);}
{const b=document.createElement('button');b.textContent='animate';b.onclick=()=>{anim=!anim;};bar.appendChild(b);}
{const b=document.createElement('button');b.textContent='LOD';let f=null;b.onclick=()=>{f=f===null?0:f===2?null:f+1;b.textContent='LOD '+(f===null?'auto':f);for(const h of Object.values(handles))h.setLOD(f);};bar.appendChild(b);}
let drag=null;canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];});addEventListener('pointerup',()=>drag=null);
addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.005;pitch-=(e.clientY-drag[1])*.004;drag=[e.clientX,e.clientY];place();});
addEventListener('wheel',e=>{dist=Math.max(-.85,Math.min(2,dist+e.deltaY*.001));place();});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});

let loadMs=0;
const ready=(async()=>{try{loadMs=await build();}catch(e){hud.className='fail';hud.textContent='BIKE LAB: LOAD FAILED (no stand-in was used)\n'+(e?.stack||e);throw e;}
 view('lineup');step(0);renderer.compile(scene,camera);return true;})();
function hudText(){const r=renderer.info.render,m=renderer.info.memory,lines=[`BIKE LAB (DEV) — four authored bikes (Blender → glTF) · loaded in ${loadMs} ms · view ${viewName}`];
 for(const k of KEYS){const h=handles[k];if(!h)continue;const s=h.stats();lines.push(`${(h.id+'          ').slice(0,12)} v${h.info.version}  LOD0/1/2 ${s.tris.map(x=>Math.round(x)).join('/')} tris · ${h.info.materials} mats · ${h.info.textures} tex · ${(h.info.bytes/1048576).toFixed(2)} MB · LOD${h.level}`);}
 if((mode==='riders'||mode==='fp')&&riders.player){const c=contacts('player');lines.push('protagonist on his bike (rig.js rider): '+Object.entries(c).map(([k,v])=>`${k} ${v===null?'-':(v*100).toFixed(1)+' cm'}`).join(' · '));}
 lines.push(`GPU: ${m.geometries} geometries, ${m.textures} textures · ${r.calls} draw calls, ${r.triangles} tris`);return lines.join('\n');}
function render(){renderer.render(scene,camera);if(viewName==='fp')fpCamera();hud.textContent=hudText();return {...renderer.info.render};}
Object.assign(window,{__poseBike:poseBike,__pedalPos:pedalPos,__gripPos:gripPos});// (for tests/bike-browser.mjs)
window.__bikelab={ready,step,render,view,arrange,contacts,get handles(){return handles;},riders,rows,renderer,scene,camera,THREE,setAnim(v){anim=v;}};
if(!qa){let last=performance.now();ready.then(()=>{const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);if(viewName==='fp')fpCamera();render();requestAnimationFrame(loop);};requestAnimationFrame(loop);});}
