// Regression: sleeves must gather with the body, not remain at their hanging offsets.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/three.module.js';
import {clothShirt} from '../dist/chapter5-props.js';
const shirt=clothShirt(new THREE.Group()),parts=shirt.children.filter(q=>q.userData.hanging),body=parts[0];
function seamDistance(a,b){shirt.updateMatrixWorld(true);const p=new THREE.Vector3(),q=new THREE.Vector3();let best=Infinity;
 for(let i=0;i<a.geometry.attributes.position.count;i++){p.fromBufferAttribute(a.geometry.attributes.position,i).applyMatrix4(a.matrixWorld);
  for(let j=0;j<b.geometry.attributes.position.count;j++){q.fromBufferAttribute(b.geometry.attributes.position,j).applyMatrix4(b.matrixWorld);best=Math.min(best,p.distanceTo(q));}}
 return best;}
const base=parts.slice(1).map(p=>seamDistance(body,p)),frames=[];
for(const fold of [0,.25,.5,.75,1]){shirt.userData.setFold(fold);const gaps=parts.slice(1).map(p=>seamDistance(body,p));
 for(const [i,d] of gaps.entries())assert.ok(d<=base[i]+.001,`sleeve ${i} detached at fold ${fold}: ${d}`);
 for(const p of parts)assert.ok([...p.geometry.attributes.position.array].every(Number.isFinite));
 frames.push({fold,sleeveSeamMetres:gaps.map(v=>+v.toFixed(5))});}
shirt.userData.setFold(0);for(const p of parts)assert.deepEqual(p.geometry.attributes.position.array,p.userData.hanging,'unfold restores hanging geometry');
const result={passed:6,frames,unfoldRestores:true};console.log(JSON.stringify(result,null,2));
if(process.env.QA_OUTPUT)fs.writeFileSync(process.env.QA_OUTPUT,JSON.stringify(result,null,2)+'\n');
