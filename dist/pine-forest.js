// Pine Ridge only. Original needle/leaf silhouettes, four shared prototypes, spatially culled instances.
// Tree centres and trunk radii still come from pine-plan: this is an art replacement, not a new nav layout.
import * as THREE from './three.module.js';
import {createKit,seeded} from './kit.js';
import {PW,heightAt} from './pine-plan.js';
import {pineMaterial} from './pine-materials.js';

function foliageTexture(pine){
 let c;try{c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');if(!g)return null;
 const r=seeded(pine?831:992);g.clearRect(0,0,256,256);
 // Entire branch silhouette, rather than a photograph of an opaque polygon.
 for(let b=0;b<(pine?13:19);b++){const x=128+(r()-.5)*156,y=28+r()*190;
  g.strokeStyle='#817550';g.lineWidth=pine?1.8:2.8;g.beginPath();g.moveTo(128,242);g.quadraticCurveTo(128,y,x,y-15);g.stroke();
  const n=pine?26:8;for(let k=0;k<n;k++){const u=k/n,px=128+(x-128)*u,py=242+(y-257)*u;
   const tone=205+Math.floor(r()*50);g.strokeStyle=`rgb(${tone},${tone},${tone})`;g.fillStyle=g.strokeStyle;
   if(pine){for(const s of [-1,1]){g.lineWidth=1.2+r();g.beginPath();g.moveTo(px,py);g.lineTo(px+s*(6+r()*17),py-9-r()*15);g.stroke();}}
   else{g.save();g.translate(px+(r()-.5)*23,py);g.rotate(r()*6.28);g.beginPath();g.ellipse(0,0,7+r()*7,3+r()*4,0,0,Math.PI*2);g.fill();g.restore();}
  }
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
 }catch{return null;}
}
function merge(group){group.updateMatrixWorld(true);const p=[],n=[],u=[];
 group.traverse(m=>{if(!m.isMesh)return;const g=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrixWorld),a=g.attributes;
  p.push(...a.position.array);n.push(...a.normal.array);if(a.uv)u.push(...a.uv.array);else for(let i=0;i<a.position.count;i++)u.push(0,0);g.dispose();});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.computeBoundingSphere();return g;
}
// place(t): where a tree stands ({x,y,z} in the world) for a forest somewhere other than Pine Ridge (Chapter Six's creek valley);
// without it, as always, Pine Ridge's plan point and ground.
export function createPineForest(trees,parent,place=null){
 const K=createKit(),time={value:0},bark=pineMaterial(0x645747,'wood'),leaves=[true,false].map(pine=>{
  const m=new THREE.MeshStandardMaterial({color:pine?0x9aa879:0xabb781,emissive:pine?0x566146:0x5e6944,emissiveIntensity:.16,map:foliageTexture(pine),alphaTest:.38,side:THREE.DoubleSide,roughness:1});
  m.onBeforeCompile=s=>{s.uniforms.c5Wind=time;s.vertexShader='uniform float c5Wind;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float h=max(0.,position.y-3.);vec4 wp=instanceMatrix*vec4(position,1.);
   transformed.x+=sin(c5Wind*.8+wp.x*.15+wp.z*.12)*h*.008;
   transformed.z+=sin(c5Wind*.57+wp.z*.19)*h*.005;`);};m.customProgramCacheKey=()=>`c5-foliage-${pine}`;return m;
 });
 const prototypes=[];
 for(let v=0;v<4;v++){const pine=v<3,r=seeded(441+v*37),wood=new THREE.Group(),leaf=new THREE.Group(),H=pine?11.5+v*1.05:9.5;
  K.lathe(wood,[[.48,-.1],[.30,.2],[.23,1.1],[.14,H*.65],[.022,H]],0,0,0,bark,7);
  for(let k=0;k<5;k++){const a=k*1.256;K.rod(wood,[0,.25,0],[Math.cos(a)*.7,.015,Math.sin(a)*.7],.1,bark,.025,4);}
  const count=pine?29:20;
  for(let k=0;k<count;k++){const u=k/count,a=k*2.399+v,y=pine?H*(.28+u*.69):H*(.4+u*.48),reach=pine?(3.5-u*3.05):2.6*(.6+.4*Math.sin(u*Math.PI));
   const x=Math.cos(a)*reach,z=Math.sin(a)*reach;
   K.rod(wood,[0,y-.35,0],[x,y-.12,z],.055*(1-u*.65),bark,.012,4);
   for(let j=0;j<(pine?4:5);j++){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(pine?3.3-u*1.7:3,pine?2.2:2.4),leaves[pine?0:1]);
    m.position.set(x*(.45+j*.17),y+(r()-.5)*.55,z*(.45+j*.17));m.rotation.set(-.5-r()*.85,a+j*1.09,(r()-.5)*.8);leaf.add(m);
   }
  }
  const near={wood:merge(wood),leaf:merge(leaf),pine};
  // Far trees retain their crown silhouettes with fewer branches, instead of the full close tree mesh.
  const trunk=new THREE.Group();K.lathe(trunk,[[.35,0],[.22,1],[.1,H*.65],[.018,H]],0,0,0,bark,5);
  const mid=new THREE.Group(),far=new THREE.Group();leaf.children.forEach((m,i)=>{if(i%2===0)mid.add(m.clone());if(i%4===0){const q=m.clone();q.scale.setScalar(1.18);far.add(q);}});
  prototypes.push([near,{wood:merge(trunk),leaf:merge(mid),pine},{wood:merge(trunk),leaf:merge(far),pine}]);
 }
 const cells=new Map();
 for(const t of trees){const variant=t.kind==='pine'?t.seed%3:3,key=[Math.floor(t.e/96),Math.floor(t.n/96),variant].join(':');if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);}
 const batches=[],dummy=new THREE.Object3D(),color=new THREE.Color();let geometryBytes=0;
 for(const levels of prototypes)for(const p of levels)for(const g of [p.wood,p.leaf])for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;
 for(const [key,ts] of cells){const v=+key.split(':')[2];for(let lod=0;lod<3;lod++){const p=prototypes[v][lod];
  for(const [geo,mat,foliage] of [[p.wood,bark,false],[p.leaf,leaves[p.pine?0:1],true]]){
   const mesh=new THREE.InstancedMesh(geo,mat,ts.length);mesh.name=foliage?'pine-needle-canopy':'pine-bark-trunks';mesh.castShadow=lod===0;mesh.receiveShadow=true;mesh.userData.c5Lod=lod;
   for(let i=0;i<ts.length;i++){const t=ts[i],q=place?place(t):PW(t.e,t.n),j=(t.seed%97)/97;dummy.position.set(q.x,(place?q.y:heightAt(q.x,q.z))-.04,q.z);dummy.rotation.set(0,t.seed*.01,0);dummy.scale.set(t.size*(.9+j*.18),t.size*(.92+j*.16),t.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);color.setScalar(.83+j*.26);mesh.setColorAt(i,color);}
   mesh.computeBoundingSphere();mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;parent.add(mesh);batches.push(mesh);geometryBytes+=mesh.instanceMatrix.array.byteLength+mesh.instanceColor.array.byteLength;
  }
 }}
 return {batches,geometryBytes,trees:trees.length,prototypes:prototypes.length,update(dt,camera){time.value+=dt;if(camera)for(const m of batches){const d=camera.position.distanceTo(m.boundingSphere.center),lod=d<100?0:d<205?1:2;m.visible=m.userData.c5Lod===lod&&d-m.boundingSphere.radius<330;}}};
}
