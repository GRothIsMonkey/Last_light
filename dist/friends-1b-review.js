import * as T from './three.module.js';
import {instantiate} from './asset-library.js';
import {createBike,poseBike,PUSH_OFFSET} from './rig.js';
import {CAST} from './cast.js';
import {upgradeBike,BIKE_IDS} from './bike-assets.js';

const shots=[
 ['Walk','Walking','side',2],['Run','Running','front',3],['Cycle','Cycling · side','side',2],
 ['Cycle','Cycling · three-quarter','bike',2],['Steer','Steering','bike',1],['StandPedal','Standing on the pedals','side',1],
 ['Brake','Braking and planting','bike',1],['Dismount','Dismounting','bike',1],['HandleBike','Walking with the bicycle','front',1],
 ['Wave','Standing goodbye','front',1],['RideWave','Riding goodbye','bike',1],['Look','Glance and blink','face',1],
 ['Smile','Smile','face',1],['Talk','Speaking cue','face',1]];
const canvas=document.querySelector('canvas'),output=document.querySelector('output'),list=document.querySelector('#shot'),person=document.querySelector('#person');
shots.forEach(([,label],i)=>list.add(new Option(label,i)));
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(800,560,false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
const scene=new T.Scene();scene.background=new T.Color(0xa8afa9);scene.fog=new T.FogExp2(0xa8afa9,.07);
scene.add(new T.HemisphereLight(0xfffaf0,0x929298,1.6));
const keylight=new T.DirectionalLight(0xffe7c7,2.2);keylight.position.set(-3,5,-3);keylight.castShadow=true;
Object.assign(keylight.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.2,far:12});keylight.shadow.mapSize.set(1024,1024);keylight.shadow.normalBias=.003;scene.add(keylight);
const fill=new T.DirectionalLight(0xdfebff,1);fill.position.set(3,4,2);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color:0xabaea3,roughness:.95}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const cam=new T.PerspectiveCamera(40,800/560,.015,80),people={};let current,idx=0,action,time=0,playing=true;
for(const name of ['jamie','sam','alex']){
 const inst=await instantiate('chr.'+name+'.a12',{renderer}),bike=createBike(CAST[name].bike);
 await upgradeBike(bike,BIKE_IDS[name],{renderer});inst.model.traverse(o=>{if(o.isSkinnedMesh)o.visible=o.userData.friend_lod===0;});
 scene.add(inst.root,bike.group);inst.root.visible=bike.group.visible=false;people[name]={inst,bike};
}
function choose(name,i){
 if(current){current.inst.root.visible=false;current.bike.group.visible=false;action.stop();}
 current=people[name];current.inst.root.visible=true;idx=i;list.value=String(i);person.value=name[0].toUpperCase()+name.slice(1);
 const ac=shots[i][0];action=current.inst.actions[ac];action.reset().setLoop(T.LoopOnce,1).play();action.clampWhenFinished=true;action.paused=true;time=0;
}
function duration(){return action.getClip().duration*shots[idx][3];}
function frame(t){
 const {inst,bike}=current,[n,label,angle]=shots[idx],d=action.getClip().duration,u=Math.min(1,(t>=duration()?d:t%d)/d);
 action.time=u*d;inst.mixer.update(0);inst.root.updateMatrixWorld(true);
 bike.group.visible=['Cycle','Steer','StandPedal','Brake','Dismount','RideWave','HandleBike'].includes(n);
 bike.group.position.set(n==='HandleBike'?PUSH_OFFSET.x:0,0,n==='HandleBike'?PUSH_OFFSET.z:0);
 bike.crankAngle=n==='Brake'?Math.PI*(2*u-u*u):n==='HandleBike'||n==='Dismount'?0:2*Math.PI*u*(n==='StandPedal'||n==='Steer'?2:1);
 bike.steerAngle=n==='Steer'?.43*Math.sin(2*Math.PI*u):0;bike.wheel=bike.crankAngle*2.31+(n==='HandleBike'?u*5:0);poseBike(bike);
 let target=new T.Vector3(0,.78,0);
 if(angle==='face'){target=inst.bones.head.getWorldPosition(target);target.y+=.064;cam.position.copy(target).add(new T.Vector3(.13,.008,-.50));}
 else if(angle==='side')cam.position.set(2.80,1,.1);else if(angle==='bike')cam.position.set(-2.11,1.23,-2.26);else cam.position.set(-.44,1.03,-2.72);
 cam.lookAt(target);renderer.render(scene,cam);output.textContent=t.toFixed(1)+' s';
}
choose('jamie',0);frame(0);
const change=()=>{choose(person.value.toLowerCase(),Number(list.value));frame(0);};list.onchange=person.onchange=change;
document.querySelector('#play').onclick=e=>{playing=!playing;e.target.textContent=playing?'Pause':'Play';};
window.friendStudio={shots,choose,duration,frame,canvas,pause:()=>{playing=false;}};
let last=0;function draw(ts){if(playing&&last){time=(time+Math.min(.1,(ts-last)/1000))%duration();frame(time);}last=ts;requestAnimationFrame(draw);}requestAnimationFrame(draw);
