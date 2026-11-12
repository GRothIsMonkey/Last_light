// Offline geometry review: export the actual posed scene, without a browser.
// Custom WebGL shaders/post processing are intentionally not represented.
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../../dist/three.module.js';
export function exportScene(scene,camera,file){
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
 const vertices=[],draws=[],lights=[];let offset=0;
 const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 const v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3(),im=new THREE.Matrix4(),wm=new THREE.Matrix4();
 function draw(mesh,matrix){
  const g=mesh.geometry,p=g.attributes.position;if(!p)return;
  if(!g.boundingSphere)g.computeBoundingSphere();if(!fr.intersectsSphere(g.boundingSphere.clone().applyMatrix4(matrix)))return;
  const normal=g.attributes.normal,col=g.attributes.color,idx=g.index,groups=g.groups.length?g.groups:[{start:0,count:idx?idx.count:p.count,materialIndex:0}];
  nm.getNormalMatrix(matrix);
  for(const group of groups){const m=Array.isArray(mesh.material)?mesh.material[group.materialIndex]:mesh.material;if(!m||m.visible===false||m.opacity<.035||m.isShaderMaterial||m.wireframe)continue;
   const color=m.color||new THREE.Color(1,1,1),em=m.emissive||new THREE.Color(0,0,0),opacity=m.opacity??1,start=offset;
   for(let j=group.start;j<Math.min(group.start+group.count,idx?idx.count:p.count);j++){
    const i=idx?idx.getX(j):j;v.fromBufferAttribute(p,i).applyMatrix4(matrix);if(normal)n.fromBufferAttribute(normal,i).applyMatrix3(nm).normalize();else n.set(0,1,0);
    vertices.push(v.x,v.y,v.z,n.x,n.y,n.z,color.r*(m.vertexColors&&col?col.getX(i):1),color.g*(m.vertexColors&&col?col.getY(i):1),color.b*(m.vertexColors&&col?col.getZ(i):1));offset++;
   }
   draws.push({start,count:offset-start,em:em.toArray().map(v=>v*(m.emissiveIntensity??1)),opacity,unlit:!!m.isMeshBasicMaterial,roughness:m.roughness??.8,fog:m.fog!==false});
  }
 }
 scene.traverseVisible(o=>{
  if(!o.layers.test(camera.layers))return;
  if(o.isDirectionalLight){const t=o.target.getWorldPosition(new THREE.Vector3()),p=o.getWorldPosition(new THREE.Vector3());lights.push({type:'sun',dir:p.sub(t).normalize().toArray(),color:o.color.toArray(),intensity:o.intensity});}
  if(o.isHemisphereLight)lights.push({type:'hemi',color:o.color.toArray(),ground:o.groundColor.toArray(),intensity:o.intensity});
  if((o.isPointLight||o.isSpotLight)&&o.intensity>0){const p=o.getWorldPosition(new THREE.Vector3());lights.push({type:'point',pos:p.toArray(),color:o.color.toArray(),intensity:o.intensity,distance:o.distance||20,...(o.isSpotLight?{dir:o.target.getWorldPosition(new THREE.Vector3()).sub(p).normalize().toArray(),angle:o.angle,penumbra:o.penumbra}:{})});}
  if(!o.isMesh||o.isSkinnedMesh)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,im);if(Math.abs(im.determinant())<1e-12)continue;wm.multiplyMatrices(o.matrixWorld,im);draw(o,wm);}}else draw(o,o.matrixWorld);
 });
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.bin',Buffer.from(new Float32Array(vertices).buffer));
 fs.writeFileSync(file+'.json',JSON.stringify({draws,lights,camera:camera.position.toArray(),projection:camera.projectionMatrix.toArray(),view:camera.matrixWorldInverse.toArray(),fog:scene.fog?{color:scene.fog.color.toArray(),density:scene.fog.density||.003}:null}));
 console.log('Exported',file,offset/3,'triangles');
}
