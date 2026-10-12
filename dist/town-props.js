import * as THREE from './three.module.js';
import {mergeParts} from './rig.js';

// Keep moving wheels as separate pivots; merge fixed vehicle pieces by physical finish.
export function finishTownCar(K,g,parts){
 const {W,L}=parts,trim=K.mat(0x8c918e,{roughness:.46,metalness:.45}),dark=K.mat(0x252c2d,{roughness:.62});
 for(const e of [-1,1]){
  K.box(g,e*(W/2+.012),.54,0,.018,.032,L*.58,dark);
  K.box(g,e*(W/2+.013),.83,.6,.02,.026,.15,trim);
  K.rbox(g,e*(W/2-.26),.69,-L/2-.032,.36,.12,.025,.018,0xd0d0ba);
  K.box(g,e*(W/2-.09),.68,-L/2-.042,.055,.095,.016,0xad8346);
  K.box(g,e*(W/2-.12),.66,L/2+.032,.16,.026,.01,0xc2beb0);
 }
 for(let k=0;k<5;k++)K.box(g,-W*.21+k*W*.105,.675,-L/2-.044,.045,.1,.012,trim);
 K.box(g,0,.44,-L/2-.104,.43,.13,.017,0xbabeb5);K.box(g,0,.445,L/2+.113,.36,.056,.003,0x596369);
 // Fixed body pieces get five or fewer finish batches instead of dozens of draw calls.
 mergeDirect(g,'town-car-body');
 for(const w of parts.wheels)mergeDirect(w,'town-car-wheel');
}
export function mergeDirect(g,name){
 g.updateMatrixWorld(true);const inv=g.matrixWorld.clone().invert(),bins=new Map();
 for(const o of [...g.children]){if(!o.isMesh||o.material.map||o.material.transparent)continue;const m=o.material;
  const key=[m.roughness,m.metalness,m.emissive?.getHex()||0,m.emissiveIntensity,m.side].join(':');
  if(!bins.has(key))bins.set(key,{m,parts:[]});bins.get(key).parts.push({geo:o.geometry,color:m.color,matrix:inv.clone().multiply(o.matrixWorld)});g.remove(o);
 }
 for(const {m,parts} of bins.values()){const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:m.roughness,metalness:m.metalness,emissive:m.emissive,emissiveIntensity:m.emissiveIntensity,side:m.side});const mesh=new THREE.Mesh(mergeParts(parts),mat);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);}
}
