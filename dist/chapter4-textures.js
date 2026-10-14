// Static, mip-filtered material detail. The old per-fragment sin/hash and
// derivative bump recipes could alias at town-sized world coordinates.
import * as THREE from './three.module.js';
import {seeded} from './kit.js';
const cache=new Map();
function texture(kind){
 if(cache.has(kind))return cache.get(kind);
 const n=256,data=new Uint8Array(n*n*4),r=seeded(kind==='c4-brick'?441:442);
 const tones=Array.from({length:32},()=>.72+r()*.24);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  let c,mortar=0;
  if(kind==='c4-brick'){
   const row=Math.floor(y/32),xx=(x+(row%2)*32)%256,col=Math.floor(xx/64),fx=xx%64,fy=y%32;
   const edge=Math.min(fx,63-fx,fy*2,2*(31-fy));
   mortar=edge<2?1:0;c=edge<2?.88:tones[row*4+col]+(r()-.5)*.075;
  }else{
   const u=x/n,v=y/n,diamond=Math.abs(u-.5)+Math.abs(v-.5);
   c=.88+.025*Math.sin(u*Math.PI*8)+.025*Math.cos(v*Math.PI*4)+(r()-.5)*.10+(diamond<.13?.055:0);
  }
  const k=(y*n+x)*4;data[k]=data[k+1]=data[k+2]=Math.round(Math.max(0,Math.min(1,c))*255);data[k+3]=kind==='c4-brick'?Math.round(mortar*255):255;
 }
 const map=new THREE.DataTexture(data,n,n);map.wrapS=map.wrapT=THREE.RepeatWrapping;
 map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;
 map.generateMipmaps=true;map.anisotropy=8;map.needsUpdate=true;
 cache.set(kind,map);return map;
}
export function stableTownTexture(m,kind){
 m.map=texture(kind);m.userData.surface=kind;
 m.onBeforeCompile=sh=>{
  // Generate coordinates from the baked world mesh, preserving seams across
  // material batches. Subtract the town-sized origin before applying scale.
  const uv=kind==='c4-brick'?'vec2(abs(c4n.z)>.5?c4p.x:c4p.z,c4p.y)/vec2(.98,.632)':'c4p.xz/1.25';
  if(kind==='c4-brick')sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.37,.345,.29),texture2D(map,vMapUv).a*.6);diffuseColor.a=opacity;');
  sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
   vec3 c4p=(modelMatrix*vec4(position,1.)).xyz-vec3(-300.,0.,-900.);
   vec3 c4n=normalize(mat3(modelMatrix)*normal);
   vMapUv=${uv};`);
 };
 m.customProgramCacheKey=()=>kind+'-filtered-2';m.needsUpdate=true;return m;
}
