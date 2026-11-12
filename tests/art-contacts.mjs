// Real runtime regression for the CPR update-order bug and contact poses.
// Run: ONLY=script SCRIPT=$PWD/tests/art-contacts.mjs node tests/verify.mjs
import assert from 'node:assert/strict';
import {chapterEightTools} from './chapter8-sim.mjs';
import {exportScene} from '../tools/art-review/export-scene.mjs';
export default async function(T){
 const {h,advance,THREE}=T,controls=chapterEightTools(T),v=()=>new THREE.Vector3();let checks=0;
 const check=(name,test)=>{assert.ok(test,name);checks++;};
 h.jump('c8-jamie-death');advance(8);
 const {jamie,reyes,sam}=h.chapter8.CTX;
 for(let i=0;i<30;i++){
  advance(1/30);h.scene.updateMatrixWorld(true);
  const target=v().set(0,.02,-.075).applyMatrix4(jamie.person.parts.torso.matrixWorld);
  for(const hand of ['lhand','rhand'])check(`CPR ${hand} reaches Jamie throughout a compression`,reyes.person.parts[hand].getWorldPosition(v()).distanceTo(target)<.085);
 }
 h.jump('c8-oak');advance(8);
 controls.take('alex-sit',{max:60,r:2.2});controls.take('alex-hand',{max:200,r:4,pad:6});controls.take('look-sam',{max:200,r:4,pad:6});
 check('Sam reaches the existing embrace beat',controls.until(()=>h.chapter8.SC.FIN.F8.sam==='embrace',150));advance(2);
 const alex=h.chapter8.CTX.alex;h.scene.updateMatrixWorld(true);
 check('Sam stays close enough to hold Alex',sam.person.parts.head.getWorldPosition(v()).distanceTo(alex.person.parts.head.getWorldPosition(v()))<.3);
 check('Alex remains dead in the embrace',h.chapter8.SC.FIN.F8.alexDead&&alex.person.face.expression==='lifeless');
 if(process.env.ART_OUTPUT){const o=h.chapter8.SC.FIN.OAK,at=sam.person.group.position,dx=at.x-o.x,dz=at.z-o.z;h.camera.aspect=1440/900;h.camera.position.set(o.x+dz*4,o.y+1.15,o.z-dx*4);h.camera.lookAt(o.x+dx*.5,o.y+.46,o.z+dz*.5);exportScene(h.scene,h.camera,process.env.ART_OUTPUT+'/oak-grief');}
 h.jump('c8-ride');advance(5);
 check('Both deaths persist on a direct final-ride start',h.chapter8.C.flags.jamieDead&&h.chapter8.C.flags.alexDead);
 check('Sam is visibly crying on a direct final-ride start',sam.person.face.crying>.6);
 console.log(JSON.stringify({passed:checks,failed:[]},null,2));
}
