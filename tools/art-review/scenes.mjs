import {exportScene} from './export-scene.mjs';
import fs from 'node:fs';
import {chapterEightTools} from '../../tests/chapter8-sim.mjs';
export default async function(T){const {h,advance,THREE}=T,controls=chapterEightTools(T);
 const out=process.env.ART_OUTPUT||'artifacts/art-review/scenes';const notes=[];
 const frames=[['prologue','start',2],['drain','c3-tunnel-inside',2],['pine-ridge','chapter5-start',3],['lange-house','c7-lange-in',2],['hunter-house','c7-reveal',7],['bunker','c8-gallery',2],['sam-rescue','c8-sam',3],['jamie-rescue','c8-jamie',3],['reunion','c8-reunion',7],['truth','c8-truth',3],['breach','c8-breach',9],['skyline','c8-surface',10],['destruction','c8-trench',5],['jamie-death','c8-jamie-death',8],['jamie-covered','c8-jamie-death',8],['oak','c8-oak',8],['oak-grief','c8-oak',8],['ride','c8-ride',5],['ride-sam','c8-ride',5]];
 for(const [name,jump,sec] of frames){if(process.env.ART_SHOTS&&!process.env.ART_SHOTS.split(',').includes(name))continue;
  if(jump==='start')h.devStart(0);else h.jump(jump);advance(sec);h.camera.aspect=1440/900;
  if(name==='oak-grief'){controls.take('alex-sit',{max:60,r:2.2});controls.take('alex-hand',{max:200,r:4,pad:6});controls.take('look-sam',{max:200,r:4,pad:6});if(!controls.until(()=>h.chapter8.SC.FIN.F8.sam==='embrace',150))throw Error('Oak grief pose not reached');advance(2);}
  if(name==='jamie-covered'){controls.approach(h.chapter8.SC.STREET.HD.body,1.4);controls.take('jamie-hand',{max:200,r:3});controls.take('jamie-cap',{max:90,r:2});if(!controls.until(()=>h.chapter8.C.flags.covered,60))throw Error('Covered Jamie pose not reached');advance(.5);}
  let review=false;
  if(name==='hunter-house'){const q=h.chapter7.HM.sockets.head.getWorldPosition(new THREE.Vector3());h.camera.lookAt(q.x,q.y-.35,q.z);review=true;}
  if(name==='bunker'){const p=h.chapter8.X.W(-10,9,-1.4),q=h.chapter8.X.W(12,17,0);h.camera.position.set(p.x,p.y,p.z);h.camera.lookAt(q.x,q.y,q.z);review=true;}
  if(name==='skyline'){const p=h.chapter.kit.main(1120,1.5),q=h.chapter.kit.main(1262,46);h.camera.position.set(p.x,p.y+1.7,p.z);h.camera.lookAt(q.x,q.y+39,q.z);review=true;}
  if(name==='breach'){const p=h.chapter8.X.W(-5,49,-1.4),q=h.chapter8.X.W(1,80,2);h.camera.position.set(p.x,p.y,p.z);h.camera.lookAt(q.x,q.y,q.z);review=true;}
  if(name==='reunion'){const p=h.chapter8.X.W(-3.9,37.7,-1.75),q=h.chapter8.X.W(-2.9,40.5,-2.1);h.camera.position.set(p.x,p.y,p.z);h.camera.lookAt(q.x,q.y,q.z);review=true;}
  if(name.startsWith('jamie-')&&name!=='jamie-rescue'){const p=h.chapter8.SC.STREET.HD.body;h.camera.position.set(p.x-1,p.y+1.45,p.z+1.1);h.camera.lookAt(p.x+.1,p.y+.17,p.z);review=true;}
  if(name==='jamie-covered'){const p=h.chapter8.SC.STREET.HD.body;h.camera.position.set(p.x-1.4,p.y+1.9,p.z+1.5);h.camera.lookAt(p.x+.1,p.y+.5,p.z);}
  if(name.startsWith('oak')){const p=h.chapter8.SC.FIN.OAK,sa=h.chapter8.CTX.sam.person.group.position;const dx=sa.x-p.x,dz=sa.z-p.z;h.camera.position.set(p.x+dz*3,p.y+1.2,p.z-dx*3);h.camera.lookAt(p.x+dx*.5,p.y+.46,p.z+dz*.5);review=true;}
  if(name==='ride-sam'){const sam=h.chapter8.CTX.sam,at=sam.person.group.getWorldPosition(new THREE.Vector3()),a=sam.ba;h.camera.position.set(at.x+Math.sin(a)*1.5+Math.cos(a)*.65,at.y+1.6,at.z-Math.cos(a)*1.5+Math.sin(a)*.65);h.camera.lookAt(at.x,at.y+1.2,at.z);review=true;}
  exportScene(h.scene,h.camera,out+'/'+name);notes.push({name,jump,sec,reviewCamera:review,phase:h.chapter.kit.S.phase});
 }
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/capture-notes.json',JSON.stringify(notes,null,2));
}
