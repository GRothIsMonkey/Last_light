import * as THREE from '../../dist/three.module.js';
import {createPerson} from '../../dist/rig.js';
import {createFace} from '../../dist/faces.js';
import {CAST} from '../../dist/cast.js';
import {createHunterModel} from '../../dist/chapter7-creature.js';
import {presenceOrganism} from '../../dist/astra-presence.js';
import {exportScene} from './export-scene.mjs';
const out=process.env.ART_OUTPUT||'artifacts/art-review/studio';
for(const key of (process.env.ART_SHOTS||'sam,jamie,alex,hunter,presence').split(',')){
 const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(36,1440/900,.01,1000);
 s.add(new THREE.HemisphereLight(0xc3d7e4,0x594a40,1));const light=new THREE.DirectionalLight(0xffdfb6,1.8);light.position.set(-2,4,-3);s.add(light);
 if(key==='hunter'){const m=createHunterModel({scene:s});m.show(true);m.drive.open=.7;m.drive.look={x:1,y:1.4,z:-3};for(let i=0;i<90;i++)m.update(1/30);cam.position.set(3,1.7,-4);cam.lookAt(0,.85,-.2);}
 else if(key==='presence'){const m=presenceOrganism({sky:true});m.scale.setScalar(45);s.add(m);cam.far=1000;cam.position.set(110,20,-130);cam.lookAt(0,23,-6);const p=createPerson(CAST.sam);p.group.position.set(10,0,-34);s.add(p.group);const house=new THREE.Mesh(new THREE.BoxGeometry(12,6,9),new THREE.MeshStandardMaterial({color:0x6e6860}));house.position.set(-26,3,-32);s.add(house);}
 else {const cast=CAST[key.split('-')[0]],p=createPerson({...cast,expressive:true});p.face=createFace(p,cast);p.face.rich(true);p.face.set(key.split('-')[1]||'grief',{hold:100});p.face.grief(key.includes('-')?0:1);s.add(p.group);for(let i=0;i<90;i++)p.face.update(1/30,{clock:2+i/30});cam.position.set(.23,1.43,-.72);cam.lookAt(0,1.38,0);}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:0x292b2a}));ground.rotation.x=-Math.PI/2;ground.position.y=-.025;s.add(ground);
 exportScene(s,cam,out+'/'+key);
}
