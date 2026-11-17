// The isolated Pipeline Lab page (DEV): the Blender test figure in an empty lot, drawn with the game's renderer settings
// (game.js: ACES filmic, exposure 1.16, sRGB output, PCF soft shadows, the same hemisphere and sun, the same fog), beside
// one of the game's procedural kids and one of its procedural bikes. Mouse drag orbits; the buttons pick a view.
// ?qa: no animation loop; window.__lab drives it (tests/pipeline-browser.mjs).
import * as THREE from './three.module.js';
import {buildLineup} from './pipeline-lab.js';

const qa=/[?&]qa\b/.test(location.search),hud=document.getElementById('hud'),canvas=document.getElementById('lab');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:qa});
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xd9b39a);scene.fog=new THREE.FogExp2(0xe3ac8d,.008);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.05,200);
scene.add(new THREE.HemisphereLight(0xe8e3d3,0x68675d,2.0));
const sun=new THREE.DirectionalLight(0xffd09b,2.7);sun.position.set(-6,9,-4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:40});sun.shadow.bias=-.0005;sun.shadow.normalBias=.023;scene.add(sun,sun.target);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x7d8a5a,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.name='lab-ground';scene.add(ground);
// a 1 m grid on the ground for scale
const grid=new THREE.GridHelper(12,12,0x3a4030,0x55603f);grid.position.y=.002;grid.material.transparent=true;grid.material.opacity=.45;scene.add(grid);

const VIEWS={
 lineup:{p:[.2,1.35,-5.6],t:[.2,.85,0],fov:40},
 face:{p:[.42,1.47,-.62],t:[.5,1.44,0],fov:24},
 talker:{p:[-.47,1.47,-.62],t:[-.55,1.44,0],fov:24},
 rider:{p:[3.6,1.1,-2.2],t:[2.2,.8,.1],fov:38},
 walker:{p:[-3.2,1.0,-1.7],t:[-1.6,.8,0],fov:36},
 back:{p:[.2,1.4,5.4],t:[.2,.85,0],fov:40},
};
let yaw=0,pitch=0,dist=0,base=VIEWS.lineup;
function view(name){base=VIEWS[name]||VIEWS.lineup;yaw=pitch=0;dist=0;camera.fov=base.fov;camera.updateProjectionMatrix();place();}
function place(){const t=new THREE.Vector3(...base.t),o=new THREE.Vector3(...base.p).sub(t);const r=o.length()*(1+dist);const sph=new THREE.Spherical().setFromVector3(o);sph.radius=r;sph.theta+=yaw;sph.phi=Math.max(.1,Math.min(Math.PI-.1,sph.phi+pitch));camera.position.copy(t).add(new THREE.Vector3().setFromSpherical(sph));camera.lookAt(t);}
const bar=document.getElementById('views');for(const n of Object.keys(VIEWS)){const b=document.createElement('button');b.textContent=n;b.onclick=()=>view(n);bar.appendChild(b);}
let drag=null;canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];});addEventListener('pointerup',()=>drag=null);
addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.005;pitch-=(e.clientY-drag[1])*.004;drag=[e.clientX,e.clientY];place();});
addEventListener('wheel',e=>{dist=Math.max(-.7,Math.min(2,dist+e.deltaY*.001));place();});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
view('lineup');

let lab=null;
const ready=(async()=>{try{lab=await buildLineup(scene,{renderer});}catch(e){hud.className='fail';hud.textContent='PIPELINE LAB: LOAD FAILED (no stand-in was used)\n'+(e?.stack||e);throw e;}
 renderer.compile(scene,camera);return lab;})();
function hudText(){const s=lab.stats(),a=s.asset,c=lab.contacts,m=renderer.info.memory,r=renderer.info.render,f=n=>(n*100).toFixed(1)+' cm';
 return `PIPELINE LAB (DEV) — ${a.id} v${a.version} (technical probe, not a character)\n${a.generator} · loaded from ${a.from}: ${(a.bytes/1048576).toFixed(2)} MB, read ${a.readMs} ms, parse ${a.parseMs} ms\n`+
 `${a.triangles} tris · ${a.skinnedMeshes} skinned meshes · ${a.materials} materials · ${a.textures} textures · clips ${a.clips.map(k=>k.name).join(', ')}\n`+
 `shape keys: ${a.morphTargets.join(', ')}\nface (right figure): ${lab.expression}\n`+
 `4 copies share: ${s.geometries} geometries, ${s.materials} materials, ${s.textures} textures; ${s.skeletons} skeletons\n`+
 `GPU: ${m.geometries} geometries, ${m.textures} textures · ${r.calls} draw calls, ${r.triangles} tris\n`+
 `rider (rig.js pose contract on a procedural bike): grip L ${f(c.grip_l)} R ${f(c.grip_r)} · wrist err ${f(Math.max(c.wrist_l,c.wrist_r))} · ankle err ${f(Math.max(c.ankle_l,c.ankle_r))}`;}
function step(dt){lab.update(dt);}
function render(){renderer.render(scene,camera);hud.textContent=hudText();return {...renderer.info.render};}
window.__lab={ready,step,render,view,get lab(){return lab;},renderer,scene,camera,THREE};
if(!qa){let last=performance.now();ready.then(()=>{const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);render();requestAnimationFrame(loop);};requestAnimationFrame(loop);});}
