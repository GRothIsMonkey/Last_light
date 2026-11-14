// Remove actual triangles of replaced buildings, including their shadow proxies.
// Ground failures still use the existing precise shader cuts. Building cuts are
// classified once and only rewrite indices when the damage state changes.
import * as THREE from './three.module.js';
export function structuralCuts(world){
 const records=[],point=new THREE.Vector3(),unit=new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,1,1));
 let revision=-1,previous=-1,volumes=[];
 function prepare(cuts){
  for(const r of records)r.mesh.geometry.setIndex(r.original);
  records.length=0;volumes=cuts.filter(c=>c.physical);revision=volumes.length;previous=-1;
  if(volumes.length>30)throw Error('Structural damage map exceeds 30 building volumes');
  const boxes=volumes.map(c=>unit.clone().applyMatrix4(c.m));
  for(const mesh of [...world.merged,...world.shadowProxies]){
   const g=mesh.geometry;if(!g?.attributes.position||g.groups.length)continue;
   g.computeBoundingBox();mesh.updateMatrixWorld(true);const bb=g.boundingBox.clone().applyMatrix4(mesh.matrixWorld),candidates=[];
   for(let i=0;i<volumes.length;i++)if(boxes[i].intersectsBox(bb))candidates.push(i);
   if(!candidates.length)continue;
   const p=g.attributes.position,index=g.index,N=(index?index.count:p.count)/3,mask=new Uint32Array(N);let bits=0;
   for(let t=0;t<N;t++){
    const a=index?index.getX(t*3):t*3,b=index?index.getX(t*3+1):t*3+1,c=index?index.getX(t*3+2):t*3+2;
    point.set((p.getX(a)+p.getX(b)+p.getX(c))/3,(p.getY(a)+p.getY(b)+p.getY(c))/3,(p.getZ(a)+p.getZ(b)+p.getZ(c))/3).applyMatrix4(mesh.matrixWorld);
    const x=point.x,y=point.y,z=point.z;
    for(const i of candidates){point.set(x,y,z).applyMatrix4(volumes[i].inv);if(Math.abs(point.x)<1&&Math.abs(point.y)<1&&Math.abs(point.z)<1){mask[t]|=1<<i;bits|=1<<i;}}
   }
   if(bits)records.push({mesh,original:index,mask,bits,N,key:0,removed:0});
  }
 }
 function sync(cuts){
  const physical=cuts.filter(c=>c.physical);if(!physical.length)return;
  if(revision!==physical.length)prepare(cuts);
  let active=0;for(let i=0;i<volumes.length;i++)if(volumes[i].on)active|=1<<i;
  if(active===previous)return;previous=active;
  for(const r of records){const key=active&r.bits;if(key===r.key)continue;r.key=key;
   if(!key){r.mesh.geometry.setIndex(r.original);r.removed=0;continue;}
   const indices=[];for(let t=0;t<r.N;t++)if(!(r.mask[t]&key))for(let j=0;j<3;j++)indices.push(r.original?r.original.getX(t*3+j):t*3+j);
   r.mesh.geometry.setIndex(indices);r.removed=r.N-indices.length/3;
  }
 }
 return {sync,get state(){return {buildings:volumes.filter(c=>c.on).length,batches:records.length,removedTriangles:records.reduce((n,r)=>n+r.removed,0)};}};
}
