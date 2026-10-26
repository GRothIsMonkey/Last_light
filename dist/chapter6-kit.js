// Chapter Six: small shared helpers for the chapter's own places and props (the room at home, the Mill Creek works,
// the evidence on the table). Nothing here touches what earlier chapters built.
//
//  bake(group, keep):  every plain mesh under a group merged by material (one draw per material, not per box). Meshes in
//                      keep (moving parts: a gate leaf, a lever, a door) and anything already instanced stay as they are.
//  paper(w, h, draw):  a canvas texture drawn once (a page, a sign, a map); null where there is no canvas (the tests).
import * as THREE from './three.module.js';

export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));

export function paper(w,h,draw){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;draw(g,w,h);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.userData.canvas=c;return t;}catch{return null;}}

// One merged geometry per material: positions, normals and (when every part has them) uvs, in the group's own frame.
export function bake(group,keep=new Set(),{shadow=true}={}){group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),bins=new Map(),drop=[];
 group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||keep.has(o))return;for(let p=o.parent;p&&p!==group;p=p.parent)if(keep.has(p))return;
  const m=o.material;if(Array.isArray(m))return;if(!bins.has(m))bins.set(m,[]);bins.get(m).push(o);drop.push(o);});
 const out=[];
 for(const [m,list] of bins){if(list.length<2){continue;}
  let n=0;const parts=list.map(o=>{const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());g.applyMatrix4(inv.clone().multiply(o.matrixWorld));if(!g.attributes.normal)g.computeVertexNormals();n+=g.attributes.position.count;return g;});
  const uv=parts.every(g=>g.attributes.uv),pos=new Float32Array(n*3),nor=new Float32Array(n*3),uvs=uv?new Float32Array(n*2):null;let o2=0;
  for(const g of parts){pos.set(g.attributes.position.array,o2*3);nor.set(g.attributes.normal.array,o2*3);if(uv)uvs.set(g.attributes.uv.array,o2*2);o2+=g.attributes.position.count;g.dispose();}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));if(uv)geo.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,m);mesh.name=(group.name||'baked')+'-'+(m.name||'m');mesh.castShadow=shadow&&list.some(o=>o.castShadow);mesh.receiveShadow=true;out.push(mesh);
  for(const o of list){o.removeFromParent();}}
 for(const mesh of out)group.add(mesh);return out.length;}

// A box with its faces' uvs in metres (so a world-scaled texture or a canvas reads the right size on any box).
export function boxUV(w,h,d){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,n=g.attributes.normal;
 for(let i=0;i<uv.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i));const su=ax>.5?d:w,sv=ay>.5?d:h;uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);}return g;}

// Shapes that come up everywhere here: a box at a point in a group, a flat quad facing a way, a pipe between two points.
export function makeShapes(){const bg=new THREE.BoxGeometry(1,1,1);
 return {
  box(g,x,y,z,w,h,d,m,{ry=0,rx=0,rz=0,name=''}={}){const o=new THREE.Mesh(bg,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.set(rx,ry,rz);if(name)o.name=name;o.castShadow=true;o.receiveShadow=true;g.add(o);return o;},
  slab(g,x,y,z,w,h,d,m,opt={}){const o=new THREE.Mesh(boxUV(w,h,d),m);o.position.set(x,y,z);o.rotation.set(opt.rx||0,opt.ry||0,opt.rz||0);if(opt.name)o.name=opt.name;o.castShadow=opt.shadow!==false;o.receiveShadow=true;g.add(o);return o;},
  plane(g,x,y,z,w,h,m,{ry=0,rx=0,rz=0,name=''}={}){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz,'YXZ');if(name)o.name=name;g.add(o);return o;},
  pipe(g,a,b,r,m,sides=10){const A=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(A),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),sides),m);o.position.copy(A).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.castShadow=true;g.add(o);return o;},
  cyl(g,x,y,z,r,h,m,{sides=14,rx=0,rz=0,ry=0,r2=null}={}){const o=new THREE.Mesh(new THREE.CylinderGeometry(r2??r,r,h,sides),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;g.add(o);return o;},
 };}

// Is a point clear of every box (centre x,z, half sizes hw,hd, turned a)? r: how far clear.
export function inBox(x,z,b,r=0){const c=Math.cos(b.a||0),s=Math.sin(b.a||0),dx=x-b.x,dz=z-b.z,lx=dx*c+dz*s,lz=-dx*s+dz*c;return Math.abs(lx)<b.hw+r&&Math.abs(lz)<b.hd+r;}
