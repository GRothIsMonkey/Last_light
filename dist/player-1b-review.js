import * as THREE from './three.module.js';
import {instantiate} from './asset-library.js';
import {createBike,poseBike,smooth} from './rig.js';
import {CAST} from './cast.js';
const shots=[
 ['walk-side','Walk · side','Walk','side',2],['walk-front','Walk · front','Walk','front',2],
 ['run-side','Run · side','Run','side',2],['run-front','Run · front','Run','front',2],
 ['pedal-side','Pedaling · side','Cycle','side',2],['ride-eyes','Riding · player view','Cycle','eyes',2],
 ['steer','Steering and bell · player view','Steer','eyes',1],['brake','Braking and planting a foot','Brake','bike34',1],
 ['walk-eyes','Walking · player view','Walk','eyes',2],['run-eyes','Running · player view','Run','eyes',2],
 ['dismount','Dismount and walk','RideToWalk','bike34',1],['gait-changes','Idle, walk, run and stop','GaitChanges','side',1],
 ['run-stop','Run to rest','RunStop','side',1],['crouch','Standing and crouching','Crouch','front',1],['light','Running with the flashlight','RunLight','eyes',2]
];
const el=id=>document.getElementById(id),canvas=document.querySelector('canvas'),select=el('shot'),tau=2*Math.PI;
for(const [id,text] of shots){const o=document.createElement('option');o.value=id;o.text=text;select.append(o);}
async function setup(){
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(800,552,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb3b6ac);scene.fog=new THREE.FogExp2(0xb3b6ac,.073);
scene.add(new THREE.HemisphereLight(0xfffbf4,0x8d9990,1.68));
const sun=new THREE.DirectionalLight(0xffebce,2.0);sun.position.set(-3,5,-4);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-2.2,right:2.2,top:2.3,bottom:-2.3,near:.1,far:15});sun.shadow.normalBias=.004;sun.shadow.bias=-.00028;scene.add(sun);scene.add(sun.target);
const rim=new THREE.DirectionalLight(0xebf2ff,.92);rim.position.set(1,3,2);scene.add(rim);
const ground=document.createElement('canvas');ground.width=256;ground.height=256;const g=ground.getContext('2d');
g.fillStyle='#92958c';g.fillRect(0,0,256,256);const pixels=g.getImageData(0,0,256,256);let seed=37;for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let q=((seed>>>24)-128)*.059;for(let c=0;c<3;c++)pixels.data[i+c]+=q;}g.putImageData(pixels,0,0);g.strokeStyle='rgba(47,54,47,.18)';g.lineWidth=1;g.strokeRect(0,0,256,256);
const tex=new THREE.CanvasTexture(ground);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(96,96);tex.anisotropy=4;
const floor=new THREE.Mesh(new THREE.PlaneGeometry(96,96),new THREE.MeshStandardMaterial({map:tex,roughness:.97}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const inst=await instantiate('chr.protagonist.a12',{renderer});scene.add(inst.root);const bike=createBike(CAST.player.bike);scene.add(bike.group);
const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.023,.021,.17,24),new THREE.MeshStandardMaterial({color:0x35414a,metalness:.35,roughness:.49}));barrel.castShadow=true;inst.bones.socket_lamp_r.add(barrel);
const cam=new THREE.PerspectiveCamera(40,800/552,.018,100);let action=null,chosen=shots[0],playing=true,sec=0,last=0;
function choose(id){chosen=shots.find(q=>q[0]===id)||shots[0];select.value=chosen[0];sec=0;if(action)action.stop();action=inst.actions[chosen[2]];action.reset().setLoop(THREE.LoopOnce,1).play();action.paused=true;action.clampWhenFinished=true;}
function duration(){return action.getClip().duration*chosen[4];}
function frame(t){
const [id,label,name,angle,loops]=chosen,d=action.getClip().duration,local=t%d,u=Math.min(1,(t>=duration()?d:local)/d);
action.time=u*d;inst.mixer.update(0);inst.root.updateMatrixWorld(true);
const riding=['Steer','Cycle','Brake','RideToWalk','Dismount'].includes(name),eye=angle==='eyes';
inst.model.traverse(o=>{if(o.isMesh&&o.name.startsWith('PlayerHead'))o.layers.set(eye?1:0);});sun.shadow.camera.layers.enable(1);
bike.group.visible=riding;let crank=u*tau,steer=0,road=0;
if(name==='Steer'){crank*=2;steer=.31*Math.sin(u*tau);}
if(name==='Brake')crank=tau*(u-.5*u*u)+Math.PI*.5;
if(name==='RideToWalk')crank=Math.PI*(.5+2*smooth(local/1.2));
bike.crankAngle=crank;bike.steerAngle=steer;bike.wheel=crank*2.31;poseBike(bike);barrel.visible=name==='RunLight';
if(name==='Walk')road=t/d*2*(.62+.42*2.05);else if(name==='Run'||name==='RunLight')road=t/d*2*(.62+.42*3.65);else if(riding&&name!=='RideToWalk')road=crank*.82+(Math.floor(t/d)*tau*.82);else if(name==='GaitChanges'||name==='RunStop'||name==='RideToWalk'){const speed=q=>name==='RunStop'?3.65*(1-smooth((q-1.05)/.8)):name==='RideToWalk'?2.05*smooth((q-2.57)/.62):2.05*smooth(q/.70)+1.6*smooth((q-1.5)/.65)-1.6*smooth((q-2.9)/.65)-2.05*smooth((q-4.25)/.72);for(let q=0;q<local;q+=1/60)road+=speed(q)*Math.min(1/60,local-q);}
tex.offset.y=road;
cam.up.set(0,1,0);cam.fov=38;
if(eye){
 const p=inst.bones.socket_eye.getWorldPosition(new THREE.Vector3());
 // Constrain the view to a child's eye height, with only a fraction of the skeletal bob.
 if(riding){cam.position.set(p.x*.42,1.427+(p.y-1.43)*.34,-.354);cam.up.set(0,0,-1);cam.lookAt(0,.69,-.196);cam.fov=79;}
 else{cam.position.set(p.x*.22,1.286+(p.y-1.397)*.38,-.323);cam.up.set(0,0,-1);cam.lookAt(name==='RunLight'?.065:0,.52,-.11);cam.fov=69;}
}else if(angle==='side'){cam.position.set(3.2,1.04,.10);cam.lookAt(0,.76,0);}
else if(angle==='front'){cam.position.set(.06,.91,-2.95);cam.lookAt(0,.77,0);}
else{cam.position.set(-2.17,1.27,-2.45);cam.lookAt(-.16,.73,0);}
cam.updateProjectionMatrix();renderer.render(scene,cam);el('time').value=Math.min(1000,1000*t/duration());el('status').textContent=t.toFixed(1)+' / '+duration().toFixed(1)+' s';
}
choose(shots[0][0]);frame(0);
select.onchange=()=>{choose(select.value);frame(0);};el('play').onclick=()=>{playing=!playing;el('play').textContent=playing?'Pause':'Play';};el('time').oninput=()=>{playing=false;el('play').textContent='Play';sec=duration()*Number(el('time').value)/1000;frame(sec);};
function draw(ts){if(playing&&last){sec=(sec+Math.min(.1,(ts-last)/1000))%duration();frame(sec);}last=ts;requestAnimationFrame(draw);}
window.motionReview={shots,choose,frame,duration,renderer,inst,pause(){playing=false;},canvas};
requestAnimationFrame(draw);
}setup().catch(e=>{el('status').textContent=e.message;console.error(e);});
