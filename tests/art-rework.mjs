// Art adapter regression: real geometries, full pose state cycle, expression/reset invariants.
import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import {createPerson} from '../dist/rig.js';
import {createFace} from '../dist/faces.js';
import {CAST} from '../dist/cast.js';
import {createHunterModel,HUNTER_STATES} from '../dist/chapter7-creature.js';
import {presenceOrganism} from '../dist/astra-presence.js';
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++;};
const finiteGeometry=root=>{let valid=true;root.traverse(o=>{for(const a of Object.values(o.geometry?.attributes||{}))for(const v of a.array)if(!Number.isFinite(v))valid=false;});return valid;};
for(const key of ['jamie','sam','alex','player']){
 const p=createPerson(CAST[key]),f=p.face=createFace(p,CAST[key]);const head=p.parts.head.geometry;
 f.set('sobbing',{hold:50});f.grief(1);for(let i=0;i<180;i++)f.update(1/30,{clock:i/30});
 check(f.crying>.9&&f.sobbing>.9,`${key}: sustained crying`);check(finiteGeometry(p.group),`${key}: expressive vertices finite`);
 f.set('lifeless',{hold:100});for(let i=0;i<90;i++)f.update(1/30,{clock:6+i/30});
 check(p.parts.head.getObjectByName('face-rich').children.filter(o=>o.isGroup).every(o=>!o.visible),`${key}: eyes close at death`);
 f.enable(false);for(let i=0;i<180;i++)f.update(1/30,{clock:10+i/30});
 check(f.crying<.03&&f.S.grief===0&&f.expression==='neutral',`${key}: title/replay resets grief`);
 check(p.parts.head.geometry===head,`${key}: chapter reset retains rebuilt head`);
}
const scene=new THREE.Scene(),h=createHunterModel({scene});h.show(true);
for(const state of HUNTER_STATES){h.setState(state);h.drive.speed=['run','walk','stalk','crawl'].includes(state)?2:0;h.drive.open=.6;for(let i=0;i<120;i++)h.update(1/60);scene.updateMatrixWorld(true);
 check(Object.values(h.sockets).every(s=>s.getWorldPosition(new THREE.Vector3()).toArray().every(Number.isFinite)),`${state}: sockets finite`);
 check(finiteGeometry(h.root),`${state}: posed geometry finite`);
}
h.reset();h.show(true);for(let i=0;i<120;i++)h.update(1/60);
check(h.sockets.head.position.y<1.7,'rest posture is quadrupedal');
const pm=presenceOrganism();check(finiteGeometry(pm),'Presence mesh finite');
const box=new THREE.Box3().setFromObject(pm);check(box.max.z-box.min.z>2&&box.max.y-box.min.y>1,'Presence arch and neck silhouette');
console.log(`${checks} art regression checks passed`);
