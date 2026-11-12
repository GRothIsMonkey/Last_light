import {exportScene} from './export-scene.mjs';
import path from 'node:path';
export default async function({h,advance,THREE}){
 const out=process.env.ART_OUTPUT||'/workspace/scratch/33779ad70efe/art-before';
 for(const [key,jump,seconds] of [['reunion','c8-reunion',4],['breach','c8-breach',10],['skyline','c8-surface',3],['oak','c8-oak',6],['ride','c8-ride',3]]){
  if(process.env.ART_SHOTS&&!process.env.ART_SHOTS.split(',').includes(key))continue;
  h.jump(jump);advance(seconds);h.camera.aspect=1440/900;
  if(key==='skyline'){const p=h.chapter.kit.main(1262,46);h.camera.lookAt(p.x,p.y+40,p.z);}
  if(key==='breach'){const p=h.chapter8.X.W(1,80,-2);h.camera.lookAt(p.x,p.y,p.z);}
  exportScene(h.scene,h.camera,path.join(out,key));
 }
 // Neutral studio geometry under identical lighting, for useful model comparison.
 const {createPerson,applyPose,newPose}=await import('../../dist/rig.js');const {createFace}=await import('../../dist/faces.js');const {CAST}=await import('../../dist/cast.js');const {createHunterModel}=await import('../../dist/chapter7-creature.js');
 for(const key of ['sam','jamie','alex','hunter']){
  if(process.env.ART_SHOTS&&!process.env.ART_SHOTS.split(',').includes(key))continue;
  const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(36,1440/900,.01,100);
  s.add(new THREE.HemisphereLight(0xc3d7e4,0x594a40,1.5));const light=new THREE.DirectionalLight(0xffdfb6,2.5);light.position.set(-2,4,-3);s.add(light);
  if(key==='hunter'){const m=createHunterModel({scene:s});m.show(true);m.drive.low=.45;m.drive.open=.5;m.drive.look={x:1,y:1.4,z:-3};m.update(2);cam.position.set(3,1.7,-4);cam.lookAt(0,1,0);}
  else{const p=createPerson({...CAST[key],expressive:true});p.face=createFace(p,CAST[key]);p.face.rich(true);p.face.set('grief',{hold:100});p.face.grief(1);s.add(p.group);for(let i=0;i<90;i++)p.face.update(1/30,{clock:2+i/30});cam.position.set(.26,1.43,-.66);cam.lookAt(0,1.38,0);}
  exportScene(s,cam,path.join(out,key));
 }
}
