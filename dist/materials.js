// Restrained, world-space surface detail: no asset downloads or texture seams.
import * as THREE from './three.module.js';
const noise=`
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float softNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),f.x),mix(hsh(i+vec2(0,1)),hsh(i+1.),f.x),f.y);}
`;
export function surfaceMaterial(material,kind){
 if(material.userData.surface)return material;material.userData.surface=kind;
 material.onBeforeCompile=sh=>{
  sh.vertexShader='varying vec3 vSurface;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSurface=position;');
  let detail='';
  if(kind==='asphalt')detail=`float grain=softNoise(vSurface.xz*115.);float broad=softNoise(vSurface.xz*.8);float aa=1.-smoothstep(.03,.2,length(fwidth(vSurface.xz)));diffuseColor.rgb*=.91+.1*broad+(grain-.5)*.18*aa;`;
  if(kind==='concrete')detail=`float wear=softNoise(vSurface.xz*6.)*.5+softNoise(vSurface.xz*.5)*.5;diffuseColor.rgb*=.92+.12*wear;`;
  if(kind==='earth')detail=`float grit=softNoise(vSurface.xz*78.);float damp=softNoise(vSurface.xz*2.4)*.5+softNoise(vSurface.xz*.35)*.5;float aa=1.-smoothstep(.025,.15,length(fwidth(vSurface.xz)));diffuseColor.rgb*=.66+.39*damp+(grit-.5)*.24*aa;`;
  if(kind==='water')detail=`float ripple=sin(vSurface.x*53.+sin(vSurface.z*9.))*sin(vSurface.z*37.);diffuseColor.rgb*=.88+.12*ripple;`;
  if(kind==='bark')detail=`float grain=softNoise(vec2((vSurface.x+vSurface.z)*18.,vSurface.y*1.4));diffuseColor.rgb*=.83+.24*grain;`;
  if(kind==='roof')detail=`float row=vSurface.y*7.;float along=(vSurface.x+vSurface.z)*3.6+floor(row)*.5;float aa=1.-smoothstep(.08,.45,fwidth(row));float seam=(1.-smoothstep(0.,.09,fract(row)))*.15+(1.-smoothstep(0.,.04,fract(along)))*.07;float tile=hsh(floor(vec2(along,row)));float fleck=softNoise(vSurface.xz*32.);diffuseColor.rgb*=(.86+.20*tile-seam*aa)+(.06*fleck-.03)*aa;`;
  // Lap siding: a soft shadow line under each board, fading out before it would shimmer.
  if(kind==='siding')detail=`float fade=softNoise(vSurface.xz*.4);float lap=fract(vSurface.y*5.55);float aa=1.-smoothstep(.04,.2,fwidth(vSurface.y*5.55));diffuseColor.rgb*=(.96+.06*fade)*mix(1.,.87+.13*smoothstep(0.,.16,lap),aa);`;
  // Running-bond brick with mortar joints, measured along whichever wall it is on.
  // Board fence: vertical board seams along whichever direction the fence runs.
  if(kind==='fence')detail=`float along=(vSurface.x-vSurface.z)*6.6;float aa=1.-smoothstep(.05,.25,fwidth(along));float seam=1.-smoothstep(0.,.12,fract(along));float grain=softNoise(vec2(floor(along),vSurface.y*.7));diffuseColor.rgb*=(.9+.18*grain)*(1.-.28*seam*aa);`;
  if(kind==='brick')detail=`float row=vSurface.y*13.3;float along=(vSurface.x+vSurface.z)*4.4+floor(row)*.5;float aa=1.-smoothstep(.05,.25,fwidth(row));float joint=max(1.-smoothstep(0.,.1,fract(row)),1.-smoothstep(0.,.06,fract(along)));float tone=hsh(floor(vec2(along,row)));diffuseColor.rgb=mix(diffuseColor.rgb*(.86+.26*tone),vec3(.62,.58,.53),joint*aa*.85);`;
  sh.fragmentShader='varying vec3 vSurface;\n'+noise+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+detail);
 };material.customProgramCacheKey=()=>kind;material.needsUpdate=true;return material;
}
// A small cutout spray of leaves, generated locally. Intersecting cards make
// airy tree silhouettes at a lower triangle count than solid polygon crowns.
const size=64,pixels=new Uint8Array(size*size*4);
const leaflets=Array.from({length:15},(_,i)=>({x:.5+Math.sin(i*2.4)*(.12+i*.014),y:.18+(i%5)*.14,a:i*2.1,rx:.115,ry:.055}));
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const u=x/size,v=y/size;let alpha=0,shade=.8;
 for(const l of leaflets){const dx=u-l.x,dy=v-l.y,c=Math.cos(l.a),s=Math.sin(l.a),xx=(dx*c+dy*s)/l.rx,yy=(-dx*s+dy*c)/l.ry,r=xx*xx+yy*yy;
  if(r<1){alpha=255;shade=.72+.25*(1-r);}}
 const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=shade*255;pixels[i+3]=alpha;
}
export const leafTexture=new THREE.DataTexture(pixels,size,size);leafTexture.colorSpace=THREE.SRGBColorSpace;leafTexture.magFilter=THREE.LinearFilter;leafTexture.minFilter=THREE.LinearMipmapLinearFilter;leafTexture.generateMipmaps=true;leafTexture.needsUpdate=true;
function cardCluster(count,size=1){const verts=[],normals=[],uvs=[];
for(let i=0;i<count;i++){
 const a=i*2.39996,h=1-2*(i+.5)/count,r=Math.sqrt(1-h*h),n=new THREE.Vector3(Math.cos(a)*r,h,Math.sin(a)*r),center=n.clone().multiplyScalar(.73);
 const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n),corners=[[-.48,-.44],[.48,-.44],[.48,.44],[-.48,.44]].map(([x,y])=>[x*size,y*size]);
 for(const k of [0,1,2,0,2,3]){const [x,y]=corners[k],v=new THREE.Vector3(x,y,0).applyQuaternion(q).add(center);verts.push(v.x,v.y,v.z);normals.push(n.x,n.y,n.z);uvs.push(k===0||k===3?0:1,k<2?0:1);}
}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));return g;}
export const leafGeometry=cardCluster(30);
// A lighter cluster for tufts and mid-distance trees.
export const leafGeometrySmall=cardCluster(12,1.3);
