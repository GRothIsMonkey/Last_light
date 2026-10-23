// Chapter Five: Pine Ridge, built. The land (one surface, pine-plan.js), the reservoir, the old road and the farm by it,
// the park, the dam, the woods, and (pine-camp.js) the camp. Static pieces bake into the merged world under the zone
// 'pine' (culled by distance in game.js; the rooms you can walk into under 'pine-int', drawn only near them); what the
// story moves (doors, the bell, the gate, lit windows, the lot's lamp, the water) stays live in W.pine.live.
import * as THREE from './three.module.js';
import {createKit,seeded,hashSeed,smooth,clamp,lerp} from './kit.js';
import {GATES,P0,PW,PL,hd,WATER,frameOf,SHORE_LINE,shoreSD,DAM,ROADS,PADS,BUILDINGS,BLD,PATHS,DOCKS,GRID,PS,cellOf,typeAt,TREES,SOLIDS,SPOT,
 FINE,fineHeights,heightAt,coarseY,ownsCell,LAT,REGION_BOX,regionDist,insideRegion,interiorOf,DOORS} from './pine-plan.js';
import {TL,TW,inRegion as inTown} from './town-plan.js';
import {outsideMasks} from './town-ground.js';
import {farLandY} from './far-land.js';
import {makeCar} from './props.js';
import {planHouse,buildHouse} from './houses.js';
import {leafGeometrySmall,leafTexture} from './materials.js';
import {oldSignArt,newSignArt,kioskMapArt,simpleSign,PARK_SIGNS} from './pine-art.js';
import {buildCamp} from './pine-camp.js';
import {pineMaterial} from './pine-materials.js';
import {buildPineDetail} from './pine-detail.js';
import {createPineForest} from './pine-forest.js';

// ---- canvases and the sign atlas ----------------------------------------------------------------------------------------------
export function canvas(w,h){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;return {c,g};}catch{return null;}}
export function texOf(cv){if(!cv)return null;const t=new THREE.CanvasTexture(cv.c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
// Best-fit packing (as the town's): every painted thing at Pine Ridge in one texture, one material.
export function atlas(W2,H2){const cv=canvas(W2,H2);let free=[{x:2,y:2,w:W2-4,h:H2-4}];const A={cv,tex:null,full:false,entries:0,
 add(w,h,draw){A.entries++;const pw=w+3,ph=h+3;let slot=null,score=Infinity;for(const f of free)if(f.w>=pw&&f.h>=ph){const s=Math.min(f.w-pw,f.h-ph)*1e7+f.w*f.h;if(s<score){score=s;slot=f;}}
  if(!slot){A.full=true;return {u0:0,u1:.001,v0:0,v1:.001};}
  const r={x:slot.x,y:slot.y,w,h},right=r.x+pw,bottom=r.y+ph,next=[];
  for(const f of free){const fr=f.x+f.w,fb=f.y+f.h;if(r.x>=fr||right<=f.x||r.y>=fb||bottom<=f.y){next.push(f);continue;}
   if(r.x>f.x)next.push({x:f.x,y:f.y,w:r.x-f.x,h:f.h});if(right<fr)next.push({x:right,y:f.y,w:fr-right,h:f.h});if(r.y>f.y)next.push({x:f.x,y:f.y,w:f.w,h:r.y-f.y});if(bottom<fb)next.push({x:f.x,y:bottom,w:f.w,h:fb-bottom});}
  free=next.filter((a,i)=>!next.some((b,j)=>j!==i&&b.x<=a.x&&b.y<=a.y&&b.x+b.w>=a.x+a.w&&b.y+b.h>=a.y+a.h&&(j<i||b.w*b.h>a.w*a.h)));
  if(cv){const g=cv.g;g.save();g.translate(r.x,r.y);g.beginPath();g.rect(0,0,w,h);g.clip();try{draw(g,w,h);}catch{}g.restore();}
  return {u0:(r.x+.5)/W2,u1:(r.x+w-.5)/W2,v0:1-(r.y+h-.5)/H2,v1:1-(r.y+.5)/H2};},
 finish(){A.tex=texOf(cv);if(A.tex){A.tex.generateMipmaps=true;A.tex.minFilter=THREE.LinearMipmapLinearFilter;}return A.tex;}};return A;}

export function buildPine(W){
 const K=createKit(),veg=W.veg,frame=W.pine;
 const zone='pine',root=new THREE.Group(),far=new THREE.Group(),inn=new THREE.Group();
 W.layers.push({mode:'rigid',group:root,zone,release:true},{mode:'rigid',group:far,far:true,zone,release:true},{mode:'rigid',group:inn,zone:'pine-int',release:true});
 const live=new THREE.Group();live.name='pine-live';W.scene.add(live);
 const mat=(c,o={},kind=null)=>{const m=K.mat(c,o);return kind?W.surfaceMaterial(m.clone(),kind):m;};// (a surface kind on its own copy: cached colours are shared)
 // places (e, n) in the world, standing on the ground (or a height)
 const at=(parent,e,n,y=null,rot=0)=>{const p=PW(e,n),g=new THREE.Group();g.position.set(p.x,y??heightAt(p.x,p.z),p.z);g.rotation.y=-rot;parent.add(g);return g;};
 const gY=(e,n)=>{const p=PW(e,n);return heightAt(p.x,p.z);};
 const B=(g,x,y,z,w,h,d,m)=>K.box(g,x,y,z,w,h,d,m);
 // ---- materials ---------------------------------------------------------------------------------------------------------------
 const M={
  grass:W.grassMat,litter:mat(0x5d5636,{},'litter'),needles:mat(0x5a4a30,{},'litter'),sand:mat(0x9c8b6c,{},'earth'),mud:mat(0x5e5640,{},'earth'),bed:mat(0x2e3428,{roughness:1}),
  field:mat(0x8a8a52,{},'litter'),
  asphalt:mat(0x4f4f4c,{roughness:.95,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},'roadwear'),lotA:mat(0x55554f,{roughness:.95,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},'roadwear'),
  patch:mat(0x3c3c3a,{roughness:.9,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},'roadwear'),
  yellow:mat(0xc2a650,{roughness:.8,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),white:mat(0xd8d6cc,{roughness:.8,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
  gravel:mat(0x8a8272,{roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},'litter'),rut:mat(0x6a5f4c,{roughness:.95,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},'litter'),
  dirt:mat(0x66583f,{roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},'earth'),worn:mat(0x5c4f3a,{roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1},'earth'),
  concrete:mat(0x9a978c,{},'mineral'),oldConcrete:mat(0x7e7b70,{},'mineral'),stone:mat(0x8a8478,{},'mineral'),block:mat(0xa8a49a,{},'mineral'),
  timber:mat(0x7a5a3a,{},'timber'),grey:mat(0x8a8478,{},'timber'),bark:mat(0x4a3a2a,{},'bark3'),steel:K.mat(0x6e7270,{roughness:.55,metalness:.55}),rust:K.mat(0x7a4a2e,{roughness:.9,metalness:.25}),
  yellowSteel:K.mat(0xd6b438,{roughness:.6,metalness:.2}),green:K.mat(0x3e5a3e,{roughness:.8}),brown:mat(0x4a3322,{},'timber'),shingle:mat(0x4a4e44,{},'roof'),red:mat(0x8a3226,{},'timber'),
 };
 const surf={asphalt:'asphalt',lotA:'asphalt',patch:'asphalt',gravel:'gravel',rut:'gravel',concrete:'concrete',oldConcrete:'concrete',stone:'stone',block:'stone',timber:'wood',grey:'wood',bark:'wood',brown:'wood',shingle:'roof',red:'paint',steel:'metal',rust:'metal',yellowSteel:'metal',green:'paint'};
 for(const [name,kind] of Object.entries(surf)){const old=M[name];M[name]=pineMaterial(old.color,kind,{roughness:old.roughness,metalness:old.metalness,polygonOffset:old.polygonOffset,polygonOffsetFactor:old.polygonOffsetFactor,polygonOffsetUnits:old.polygonOffsetUnits});}
 const signs=atlas(4096,2048),signMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.75});
 // A painted face: a quad mapped to an atlas rectangle, placed in a group's frame (it faces the group's -z, the front).
 const faces=[];
 function face(parent,uv,w,h,{x=0,y=0,z=0,ry=0,rx=0,two=false}={}){const g=new THREE.PlaneGeometry(w,h),a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setXY(i,lerp(uv.u0,uv.u1,a.getX(i)),lerp(uv.v0,uv.v1,a.getY(i)));
  const m=new THREE.Mesh(g,signMat);m.position.set(x,y,z);m.rotation.set(rx,ry+Math.PI,0,'YXZ');m.name='pine-sign';parent.add(m);faces.push(m);
  if(two){const b=m.clone();b.rotation.y+=Math.PI;parent.add(b);}return m;}
 const paint=(px,py,draw)=>signs.add(px,py,draw);
 const signOf=(spec)=>paint(Math.min(1024,Math.round(spec.w*220)),Math.max(32,Math.round(spec.h*220)),spec.draw);
 const out={live,root,far,inn,K,M,at,gY,B,mat,face,paint,signs,signMat,doors:{},glows:{},lights:{},anchors:{},dyn:{}};

 // ============================================== the land =========================================================================
 // One material for all of Pine Ridge's ground: grass (the fields, the verges, the lawn, and at the region's edge the far ground's
 // own grass), needle litter in the woods, a darker needle carpet in the camp, sand and mud at the waterline, the lake bed. Which
 // is where comes from a soft 2 m mask (blurred, its edges broken up by noise in the shader), so lawn meets woods the way it does.
 {const H=fineHeights(),F=FINE,RB=REGION_BOX;
  const camp=(e,n)=>e>-340&&e<-150&&n>484&&n<630,openCountry=(e,n)=>{if(n>165)return false;const w=PW(e,n),q=ROADS.orr.project(w.x,w.z,3);return !!q&&Math.abs(q.t)<52;};
  // the mask: R grass, G litter, B shore, A needles
  const MS=2,mx0=Math.floor(RB.x0/MS)*MS-4,mz0=Math.floor(RB.z0/MS)*MS-4,mw=Math.ceil((RB.x1-mx0)/MS)+4,mh=Math.ceil((RB.z1-mz0)/MS)+4,raw=new Float32Array(mw*mh*4);
  for(let i=0;i<mw;i++)for(let j=0;j<mh;j++){const x=mx0+(i+.5)*MS,z=mz0+(j+.5)*MS,{e,n}=PL(x,z);let w=[0,0,0,0];const sd=shoreSD(e,n);
   if(sd<1.8)w=[0,0,1,0];else{const k=cellOf(e,n),t=k>=0?GRID.t[k]:-1;
    if(t===PS.lawn||t===PS.grass||t===PS.asphalt||t===PS.lot||t===PS.field)w=[1,0,0,0];else if(camp(e,n))w=[0,0,0,1];
    else if(Math.hypot(e-62,n-115)<42||openCountry(e,n)||!insideRegion(x,z,-2)||regionDist(x,z)<28)w=[1,0,0,0];else w=[0,1,0,0];}
   raw.set(w,(j*mw+i)*4);}
  // blur (two box passes, radius 2 cells)
  const tmp=new Float32Array(raw.length),blur=(src,dst,dx,dy)=>{for(let j=0;j<mh;j++)for(let i=0;i<mw;i++){let a=[0,0,0,0],c=0;for(let k=-2;k<=2;k++){const ii=clamp(i+k*dx,0,mw-1),jj=clamp(j+k*dy,0,mh-1),o=(jj*mw+ii)*4;for(let q=0;q<4;q++)a[q]+=src[o+q];c++;}dst.set(a.map(v=>v/c),(j*mw+i)*4);}};
  blur(raw,tmp,1,0);blur(tmp,raw,0,1);
  const px=new Uint8Array(mw*mh*4);for(let k=0;k<raw.length;k++)px[k]=Math.round(clamp(raw[k],0,1)*255);
  const maskTex=new THREE.DataTexture(px,mw,mh,THREE.RGBAFormat);maskTex.magFilter=THREE.LinearFilter;maskTex.minFilter=THREE.LinearFilter;maskTex.needsUpdate=true;
  const col=c=>new THREE.Color(c);
  const U={uMask:{value:maskTex},uMaskO:{value:new THREE.Vector2(mx0,mz0)},uMaskS:{value:new THREE.Vector2(mw*MS,mh*MS)},uGrass:{value:col(0x7f8a55)},uLitter:{value:col(0x5f5336)},uMoss:{value:col(0x4f5a31)},
   uNeedles:{value:col(0x5a4630)},uSand:{value:col(0x9a8a6a)},uMud:{value:col(0x4e4834)},uBed:{value:col(0x26302a)},uWater:{value:WATER},uTime:{value:0}};
  const tm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.96});tm.userData.keep=true;tm.userData.noShadow=true;
  tm.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
   sh.vertexShader='varying vec3 vPW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPW=(modelMatrix*vec4(position,1.)).xyz;');
   sh.fragmentShader=`varying vec3 vPW;uniform sampler2D uMask;uniform vec2 uMaskO,uMaskS;uniform vec3 uGrass,uLitter,uMoss,uNeedles,uSand,uMud,uBed;uniform float uWater,uTime;
float th(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float tn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(th(i),th(i+vec2(1,0)),f.x),mix(th(i+vec2(0,1)),th(i+1.),f.x),f.y);}
`+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=vPW.xz;float aa=1.-smoothstep(.03,.25,length(fwidth(q)));
 vec2 jit=vec2(tn(q*.21)-.5,tn(q*.21+7.3)-.5)*3.2+vec2(tn(q*.9)-.5,tn(q*.9+3.1)-.5)*.9;
 vec4 m=texture2D(uMask,(q+jit-uMaskO)/uMaskS);float sum=max(.001,m.r+m.g+m.b+m.a);m/=sum;
 // sharpen the blend a little so edges read as edges, broken by the jitter
 m=pow(m,vec4(1.6));m/=max(.001,m.r+m.g+m.b+m.a);
 float broad=tn(q*.07),pch=tn(q*.31),grain=tn(q*36.),fleck=th(floor(q*14.));
 vec3 grass=uGrass*(.88+.18*pch)*(1.+.035*sin(dot(q,vec2(.23,.17))-uTime*1.7)*sin(dot(q,vec2(-.11,.29))-uTime*1.1));
 vec3 litter=mix(uLitter,uMoss,smoothstep(.45,.75,tn(q*.12+2.)))*(.7+.45*broad+(grain-.5)*.22*aa);litter=mix(litter,litter*vec3(1.25,1.02,.7),smoothstep(.72,.9,fleck)*.5*aa);
 vec3 needles=uNeedles*(.72+.4*broad+(grain-.5)*.26*aa);needles=mix(needles,needles*vec3(1.3,1.05,.72),smoothstep(.68,.88,fleck)*.55*aa);
 float dry=smoothstep(uWater+.05,uWater+.6,vPW.y);vec3 shore=mix(uMud,uSand,dry*(.6+.4*pch))*(.85+.25*grain*aa);
 vec3 c=grass*m.r+litter*m.g+shore*m.b+needles*m.a;
 // Scattered individual leaves and needles, metre-scaled and filtered at distance.
 vec2 lc=floor(q*3.1),lp=fract(q*3.1)-.5;float la=th(lc+3.7)*6.283;
 lp=mat2(cos(la),-sin(la),sin(la),cos(la))*lp;
 float ld=length(lp/vec2(.23,.072)),lw=max(.05,fwidth(ld));float leaf=(1.-smoothstep(1.-lw,1.+lw,ld))*step(.42,th(lc+8.));
 float vein=(1.-smoothstep(.002,.012+fwidth(lp.y),abs(lp.y)))*leaf;
 vec3 leafCol=mix(vec3(.17,.12,.065),vec3(.38,.26,.13),th(lc+17.));
 c=mix(c,leafCol,leaf*(m.g*.68+m.a*.42)*aa);c*=1.-vein*.13*(m.g+m.a)*aa;
 float groundPatch=tn(q*.8)*tn(q*.18+9.);c*=.87+.23*groundPatch+.12*tn(q*2.7);
 c=mix(c,uBed,smoothstep(uWater-.2,uWater-1.2,vPW.y));
 diffuseColor.rgb=c;`);};
  tm.customProgramCacheKey=()=>'pine-ground';out.groundMat=tm;out.groundU=U;
  const nrm=(x,z)=>{const e=1.0,hx=heightAt(x+e,z)-heightAt(x-e,z),hz=heightAt(x,z+e)-heightAt(x,z-e),l=Math.hypot(hx,2*e,hz);return [-hx/l,2*e/l,-hz/l];};
  const P=[],N=[];const putTri=(a,b,c)=>{for(const v of [a,b,c]){P.push(v[0],v[1],v[2]);const q=nrm(v[0],v[2]);N.push(q[0],q[1],q[2]);}};
  // a cell as two triangles, split along (x+s, z)–(x, z+s) as the far ground is: (a,c,b), (b,c,d)
  const quad=(x,z,s,y)=>{const a=[x,y(x,z),z],b=[x+s,y(x+s,z),z],c=[x,y(x,z+s),z+s],d=[x+s,y(x+s,z+s),z+s];putTri(a,c,b);putTri(b,c,d);};
  const fy=(x,z)=>H[((x-F.x0)/2)*F.nz+(z-F.z0)/2];
  const i0=Math.floor(RB.x0/LAT)-1,i1=Math.ceil(RB.x1/LAT)+1,j0=Math.floor(RB.z0/LAT)-1,j1=Math.ceil(RB.z1/LAT)+1;let cells=0;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){if(!ownsCell(i,j))continue;const x=i*LAT,z=j*LAT;cells++;
   const inFine=x>=F.x0&&x+LAT<=F.x1&&z>=F.z0&&z+LAT<=F.z1,nearTown=PL(x,z).n<1.5||PL(x,z+LAT).n<1.5;
   if(nearTown&&inTown(x+2,z+2,44)){// (Mill Street's end: clip to downtown's own ground, exactly as the far ground is)
    for(const [sx,sz] of [[0,0],[2,0],[0,2],[2,2]]){const poly=[[x+sx,z+sz],[x+sx+2,z+sz],[x+sx+2,z+sz+2],[x+sx,z+sz+2]].map(([px2,pz])=>{const q=TL(px2,pz);return [q.u,q.v];});
     for(const pc of outsideMasks(poly)){const pts=pc.map(([u,v])=>{const w=TW(u,v);return [w.x,heightAt(w.x,w.z),w.z];});for(let k=1;k<pts.length-1;k++)putTri(pts[0],pts[k+1],pts[k]);}}continue;}
   if(inFine){for(const [sx,sz] of [[0,0],[2,0],[0,2],[2,2]])quad(x+sx,z+sz,2,fy);}
   else quad(x,z,LAT,coarseY);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  const m=new THREE.Mesh(g,tm);m.name='pine-ground';m.userData.zone=zone;W.baked.push(m);
  out.cells=cells;out.groundTris=P.length/9;P.length=0;N.length=0;}// (the build arrays are copied into the geometry: let them go)

 // ============================================== the reservoir ====================================================================
 {const e0=-372,e1=-136,n0=318,n1=516,s=3,ne=Math.ceil((e1-e0)/s)+1,nn=Math.ceil((n1-n0)/s)+1,pos=[],sh=[],idx=[],ids=new Int32Array(ne*nn).fill(-1);
  const keep=(i,j)=>{for(const [a,b] of [[0,0],[1,0],[0,1],[1,1]]){const e=e0+(i+a)*s,n=n0+(j+b)*s;if(shoreSD(e,n)<1.6)return true;}return false;};
  const vid=(i,j)=>{const k=i*nn+j;if(ids[k]>=0)return ids[k];const e=e0+i*s,n=n0+j*s,p=PW(e,n);ids[k]=pos.length/3;pos.push(p.x,WATER,p.z);sh.push(clamp(shoreSD(e,n),-40,4));return ids[k];};
  for(let i=0;i<ne-1;i++)for(let j=0;j<nn-1;j++){if(!keep(i,j))continue;const a=vid(i,j),b=vid(i+1,j),c=vid(i,j+1),d=vid(i+1,j+1);idx.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aShore',new THREE.Float32BufferAttribute(sh,1));g.setIndex(idx);g.computeVertexNormals();
  {const n=g.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}g.setIndex(idx);g.computeVertexNormals();}}
  g.computeBoundingSphere();
  // The water: dark and clear near the bank, the sky in it farther out, small wind ripples, a sheen where the sun is.
  const U={uTime:{value:0},uSky:{value:new THREE.Color(0x9ab0c8)},uDeep:{value:new THREE.Color(0x1d2c30)},uBank:{value:new THREE.Color(0x2a3424)},uWind:{value:1}};
  const wm=new THREE.MeshStandardMaterial({color:0x2a3c40,roughness:.18,metalness:.04,transparent:true,opacity:1,depthWrite:false});wm.userData.keep=true;
  wm.onBeforeCompile=sh2=>{Object.assign(sh2.uniforms,U);
   sh2.vertexShader='attribute float aShore;\nvarying float vShore;\nvarying vec3 vWPos;\n'+sh2.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvShore=aShore;\nvWPos=(modelMatrix*vec4(position,1.)).xyz;');
   sh2.fragmentShader='uniform float uTime,uWind;uniform vec3 uSky,uDeep,uBank;varying float vShore;varying vec3 vWPos;\nfloat wh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat wn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wh(i),wh(i+vec2(1,0)),f.x),mix(wh(i+vec2(0,1)),wh(i+1.),f.x),f.y);}\n'
    +sh2.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
     vec2 q=vWPos.xz;float t=uTime;float r1=wn(q*.55+vec2(t*.18,t*.07))-.5,r2=wn(q*1.7-vec2(t*.11,-t*.23))-.5,r3=wn(q*5.3+vec2(t*.4,t*.31))-.5;
     float fade=1.-smoothstep(25.,120.,length(vWPos-cameraPosition));vec3 bump=vec3(r1*.22+r2*.13+r3*.06,0.,r1*.15-r2*.12+r3*.07)*uWind*(.35+.65*fade);
     normal=normalize(normal+(viewMatrix*vec4(bump,0.)).xyz);`)
    .replace('#include <color_fragment>',`#include <color_fragment>
     vec3 V=normalize(cameraPosition-vWPos);float fres=pow(1.-max(V.y,0.),3.2);float near=smoothstep(-7.,0.,vShore);
     vec3 body=mix(uDeep,uBank,near*.8);diffuseColor.rgb=mix(body,uSky*.92,clamp(fres*.85+.08,0.,.86)*(1.-near*.55));
     float ripple=wn(vWPos.xz*.43+vec2(uTime*.06,-uTime*.035));
     float cloud=wn(vec2(V.x/max(.12,V.y),V.z/max(.12,V.y))*2.4+ripple*.15);
     vec3 reflected=uSky*(.62+.46*cloud);diffuseColor.rgb=mix(body,reflected,clamp(fres*.88+.08,0.,.9));
     // The bed really shows through the shallows. Distant water retains sky colour and a moving specular surface.
     diffuseColor.a=mix(.93,.32,smoothstep(-3.8,.15,vShore))*(1.-smoothstep(.2,1.6,vShore));
     diffuseColor.rgb=mix(diffuseColor.rgb,uBank,smoothstep(-1.3,.2,vShore)*.3);`);};
  wm.customProgramCacheKey=()=>'pine-water';
  const water=new THREE.Mesh(g,wm);water.name='pine-reservoir';water.receiveShadow=true;live.add(water);out.water=water;out.waterU=U;}

 // ============================================== ribbons: roads, lots, paths ======================================================
 // Rows along a road (every step m), columns across it; each vertex on the land itself plus a small lift.
 function ribbon(R,cols,m,{s0=0,s1=R.L,step=1,name='pine-road',lift=(t,s)=>.035,skip=null}={}){const pos=[],idx=[],nc=cols.length;let rows=0;
  for(let s=s0;s<=s1+1e-6;s+=step){const ss=Math.min(s,s1);for(const c of cols){const t=typeof c==='function'?c(ss):c,p=R.at(ss,t);pos.push(p.x,heightAt(p.x,p.z)+lift(t,ss),p.z);}rows++;if(ss>=s1)break;}
  for(let i=0;i<rows-1;i++){const sm=s0+(i+.5)*step;if(skip&&skip(sm))continue;for(let j=0;j<nc-1;j++){const a=i*nc+j,b=a+1,c=a+nc,d=c+1;idx.push(a,c,b,b,c,d);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  {const n=g.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}g.setIndex(idx);g.computeVertexNormals();}}
  const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.userData.zone=zone;W.baked.push(mesh);return mesh;}
 // a polyline as a road-like frame (for paths, docks' approaches)
 function lineRoad(pts){const P=pts.map(([e,n])=>PW(e,n)),seg=[];let L=0;for(let i=0;i<P.length-1;i++){const l=Math.hypot(P[i+1].x-P[i].x,P[i+1].z-P[i].z);seg.push({a:P[i],b:P[i+1],l,s:L});L+=l;}
  return {L,at(s,t=0){s=clamp(s,0,L);let k=seg.findIndex(q=>s<=q.s+q.l);if(k<0)k=seg.length-1;const q=seg[k],f=(s-q.s)/(q.l||1),x=q.a.x+(q.b.x-q.a.x)*f,z=q.a.z+(q.b.z-q.a.z)*f;
   // (a little mitre at the joints: the heading eases between segments over a meter)
   let a=Math.atan2(q.b.x-q.a.x,-(q.b.z-q.a.z));const nx=seg[k+1];if(nx&&s>q.s+q.l-.8){const a2=Math.atan2(nx.b.x-nx.a.x,-(nx.b.z-nx.a.z));a+=Math.atan2(Math.sin(a2-a),Math.cos(a2-a))*smooth((s-(q.s+q.l-.8))/1.6);}
   return {x:x+Math.cos(a)*t,z:z+Math.sin(a)*t,a};}};}
 // The old Reservoir Road: cracked asphalt with patches, a faded double yellow line, crumbling edges into gravel shoulders.
 {const R=ROADS.orr,hw=s=>R.half(s);
  ribbon(R,[s=>-hw(s)-.7,s=>-hw(s)-.05,s=>-hw(s)/2,0,s=>hw(s)/2,s=>hw(s)+.05,s=>hw(s)+.7],M.asphalt,{name:'reservoir-road',lift:(t,s)=>Math.abs(t)>hw(s)?.012:.035});
  // gravel shoulders (beyond the edge) as their own strips so they read lighter
  for(const sg of [-1,1])ribbon(R,[s=>sg*(hw(s)+.05),s=>sg*(hw(s)+.75)],M.gravel,{name:'reservoir-shoulder',s0:18,lift:(t,s)=>Math.abs(t)>hw(s)+.4?.006:.03});
  // the line: double yellow, faded, worn through in places
  const worn=s=>{const k=Math.sin(s*.37)+Math.sin(s*.113+1);return k>1.5;};
  for(const o of [-.11,.11])ribbon(R,[o-.05,o+.05],M.yellow,{name:'reservoir-line',s0:20,s1:R.L-24,step:2,lift:()=>.042,skip:worn});
  // patches and long cracks
  const r=seeded(311);for(let k=0;k<26;k++){const s=12+r()*(R.L-30),len=1.5+r()*5,t=(r()-.5)*R.half(s)*1.4,w2=.6+r()*1.4;ribbon(R,[t-w2/2,t+w2/2],M.patch,{name:'reservoir-patch',s0:s,s1:Math.min(R.L,s+len),step:.5,lift:()=>.039});}
  for(let k=0;k<40;k++){const s=10+r()*(R.L-20),len=2+r()*7,t=(r()-.5)*R.half(s)*1.6;ribbon(R,[s2=>t+Math.sin(s2*1.7)*.12-.025,s2=>t+Math.sin(s2*1.7)*.12+.025],M.patch,{name:'reservoir-crack',s0:s,s1:Math.min(R.L,s+len),step:.5,lift:()=>.041});}}
 // The park's lot: newer asphalt, white stall lines, concrete wheel stops.
 {const P=PADS.find(p=>p.id==='lot'),F=frameOf(P.c,P.a),pos=[],idx=[],nx=24,nz=13;
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const [e,n]=F.to(-P.w/2+P.w*i/nx,-P.d/2+P.d*j/nz),p=PW(e,n);pos.push(p.x,heightAt(p.x,p.z)+.035,p.z);}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*(nz+1)+j,b=a+nz+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();if(g.attributes.normal.getY(0)<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}g.setIndex(idx);g.computeVertexNormals();}
  const lm=new THREE.Mesh(g,M.lotA);lm.name='park-lot';lm.userData.zone=zone;W.baked.push(lm);
  const lot=at(root,P.c[0],P.c[1],P.y+.035,P.a);
  // two rows of stalls along the long sides, facing the middle lane
  for(const side of [-1,1])for(let k=0;k<=15;k++){const x=-P.w/2+2.6+k*2.7;B(lot,x,.006,side*(P.d/2-2.8),.1,.008,5.4,M.white);if(k<15&&(k%3!==1))B(lot,x+1.35,.06,side*(P.d/2-.75),1.6,.12,.18,M.concrete);}
  // the lot's edge: timber bollards toward the lawn
  for(const s of SOLIDS.filter(q=>q.kind==='bollard'))K.cyl(at(root,s.e,s.n),0,.4,0,.11,.8,M.brown,8);}
 // The old gravel lot (the picture's), the gravel road through the gate to the camp, the camp's lane, the service road.
 {const P=PADS.find(p=>p.id==='oldlot'),F=frameOf(P.c,P.a),pos=[],idx=[],nx=13,nz=9;
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const [e,n]=F.to(-P.w/2+P.w*i/nx,-P.d/2+P.d*j/nz),p=PW(e,n),edge=i===0||j===0||i===nx||j===nz;pos.push(p.x,heightAt(p.x,p.z)+(edge?.008:.03),p.z);}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*(nz+1)+j,b=a+nz+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();if(g.attributes.normal.getY(0)<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}g.setIndex(idx);g.computeVertexNormals();}
  const lm=new THREE.Mesh(g,M.gravel);lm.name='old-gravel-lot';lm.userData.zone=zone;W.baked.push(lm);}
 for(const id of ['gravel','lane']){const R=ROADS[id],hw=R.half(0);ribbon(R,[-hw-.4,-hw,-hw*.45,hw*.45,hw,hw+.4],M.gravel,{name:'pine-'+id,lift:t=>Math.abs(t)>hw?.008:.03});
  // two wheel ruts, darker; grass in between on the old road
  for(const o of [-hw*.42,hw*.42])ribbon(R,[o-.22,o+.22],M.rut,{name:'pine-rut',step:1,lift:()=>.036});}
 {const R=ROADS.service;for(const o of [-.85,.85])ribbon(R,[o-.32,o+.32],M.rut,{name:'service-track',lift:()=>.03});
  ribbon(R,[-1.3,-1.17],M.dirt,{name:'service-edge',lift:()=>.012});ribbon(R,[1.17,1.3],M.dirt,{name:'service-edge',lift:()=>.012});}
 // Paths: packed dirt, a little uneven at the edges.
 for(const p of PATHS){const R=lineRoad(p.pts),r=seeded(hashSeed(5,p.pts[0][0],p.pts[0][1])),wob=[...Array(40)].map(()=>r());const hw=s=>p.half*(.85+.3*wob[Math.floor(s/1.3)%40]);
  ribbon(R,[s=>-hw(s)-.25,s=>-hw(s),0,s=>hw(s),s=>hw(s)+.25],M.dirt,{name:'pine-path',step:.7,lift:t=>Math.abs(t)>p.half?.004:.022});}
 // The clearing and the campfire terrace: worn dirt discs.
 for(const [c,r,lift] of [[SPOT.clearing,15.6,.018],[SPOT.campfire,5.7,.02]]){const pos=[],idx=[],N=64,R=Math.ceil(r/1.1);const p0=PW(c[0],c[1]);pos.push(p0.x,heightAt(p0.x,p0.z)+lift,p0.z);
  for(let k=1;k<=R;k++)for(let a=0;a<N;a++){const rr=r*k/R*(k===R?1+.06*Math.sin(a*1.7):1),ang=a/N*Math.PI*2,p=PW(c[0]+Math.sin(ang)*rr,c[1]+Math.cos(ang)*rr);pos.push(p.x,heightAt(p.x,p.z)+(k===R?.004:lift),p.z);}
  for(let a=0;a<N;a++)idx.push(0,1+a,1+(a+1)%N);for(let k=1;k<R;k++)for(let a=0;a<N;a++){const i0=1+(k-1)*N+a,i1=1+(k-1)*N+(a+1)%N,j0=1+k*N+a,j1=1+k*N+(a+1)%N;idx.push(i0,j0,i1,i1,j0,j1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();if(g.attributes.normal.getY(0)<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}g.setIndex(idx);g.computeVertexNormals();}
  const m=new THREE.Mesh(g,M.worn);m.name='camp-worn-ground';m.userData.zone=zone;W.baked.push(m);}

 // Where Mill Street leaves downtown's ground for Pine Ridge's: the two surfaces meet on the town's edge line, the town's
 // with its curbs, Pine Ridge's on its 2 m lattice. A low skirt along the line closes any sliver between them.
 {const pos=[],col=[],cA=new THREE.Color(0x55585a),cG=new THREE.Color(0x6f7a48);
  for(let e=-19;e<19;e+=.5){const road=Math.abs(e+.25)<5,ys=[e,e+.5].map(ee=>{const p=PW(ee,0),town=road?farLandY(p.x,p.z)-.12:farLandY(p.x,p.z),pine=heightAt(p.x,p.z)+(road?.035:0);return {p,lo:Math.min(town,pine)-.06,hi:Math.max(town,pine)};});
   const c=road?cA:cG;const [a,b]=ys;for(const v of [[a.p,a.lo],[b.p,b.lo],[b.p,b.hi],[a.p,a.lo],[b.p,b.hi],[a.p,a.hi]]){pos.push(v[0].x,v[1],v[0].z);col.push(c.r,c.g,c.b);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat(0xffffff,{roughness:1,vertexColors:true,side:THREE.DoubleSide}));m.name='pine-town-seam';m.userData.zone=zone;W.baked.push(m);}

 // ============================================== docks ===========================================================================
 for(const D of DOCKS){const g=at(root,D.root[0],D.root[1],D.y,D.a),pub=D.id==='public';
  // posts in pairs, joists, a deck of boards with small gaps, a step down at the shore end
  for(let z=0;z<=D.len;z+=2.6)for(const s of [-1,1]){const post=K.cyl(g,s*(D.w/2-.08),-1.6,-z,.09,3.4,M.grey,8);void post;}
  for(const s of [-1,1])B(g,s*(D.w/2-.1),-.14,-D.len/2,.08,.18,D.len,M.grey);
  for(let z=0;z<D.len;z+=.16)B(g,0,-.03,-z-.07,D.w,.045,.13,z%(.16*7)<.16?M.grey:M.timber);
  if(pub){for(let z=1;z<=D.len;z+=1.9){K.cyl(g,D.w/2-.05,.5,-z,.04,1.0,M.grey,6);}B(g,D.w/2-.05,1.0,-D.len/2-.4,.06,.06,D.len-.8,M.grey);B(g,D.w/2-.05,.55,-D.len/2-.4,.05,.05,D.len-.8,M.grey);
   // a ladder at the end
   for(const s of [-1,1])K.rod(g,[s*.24,.05,-D.len+.05],[s*.24,-1.4,-D.len+.12],.025,M.steel);for(let k=0;k<4;k++)B(g,0,-.25-k*.32,-D.len+.09,.48,.03,.05,M.steel);}
  // cleats, a mooring post
  for(const s of [-1,1])B(g,s*(D.w/2-.12),.05,-D.len+.5,.08,.06,.25,M.steel);out.anchors['dock-'+D.id]=g;}

 // ============================================== the dam ==========================================================================
 {const a=PW(DAM.a[0],DAM.a[1]),b=PW(DAM.b[0],DAM.b[1]),L=Math.hypot(b.x-a.x,b.z-a.z),ang=Math.atan2(b.x-a.x,-(b.z-a.z)),g=new THREE.Group();g.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);g.rotation.y=-ang;root.add(g);
  // in the dam's frame: z along it (a, the north end, toward +z), x across: +x is downstream (west), -x the lake
  const crest=DAM.crest,W2=DAM.width,toe=DAM.toe,lakeBed=WATER-3.4;
  // the body: a trapezoid, the upstream face plumb, the downstream face battered down to the toe
  const prof=[[-W2/2,lakeBed],[-W2/2,toe-.4],[W2/2+6.5,toe-.4],[W2/2,crest],[-W2/2,crest]];const body=K.extrude(g,prof,L+1.2,.05,M.oldConcrete,{curve:1,bevelSegments:1});body.name='dam-body';
  // the crest: a concrete deck, curbs, pipe railings both sides, a light post at each end (dark)
  B(g,0,crest+.05,0,W2,.1,L+1.2,M.concrete);for(const s of [-1,1]){B(g,s*(W2/2-.12),crest+.2,0,.24,.3,L+1.2,M.concrete);
   for(let z=-L/2;z<=L/2;z+=2.2)K.cyl(g,s*(W2/2-.12),crest+.75,z,.03,1.1,M.steel,6);for(const y of [crest+.72,crest+1.28])K.cyl(g,s*(W2/2-.12),y,0,.028,L+1,M.steel,6,[Math.PI/2,0,0]);}
  // the intake tower out in the water, and its walkway
  const T=new THREE.Group();T.position.set(-W2/2-9,0,-4);g.add(T);K.cyl(T,0,(lakeBed+crest+1.6)/2,0,2.1,crest+1.6-lakeBed,M.oldConcrete,16);K.cyl(T,0,crest+1.75,0,2.35,.3,M.concrete,16);
  B(T,0,crest+2.9,0,2.4,2.3,2.4,M.block);B(T,0,crest+4.15,0,2.9,.2,2.9,M.shingle);B(T,-1.21,crest+2.5,0,.05,1.9,.9,M.steel);
  B(g,-W2/2-4.4,crest+.06,-4,7.6,.12,1.2,M.steel);for(const s of [-1,1])for(let x=-W2/2-.8;x>=-W2/2-7.8;x-=1.4)K.cyl(g,x,crest+.6,-4+s*.6,.025,1.0,M.steel,6);
  // the buoy line: DANGER, DAM — white floats on a cable out from the shore
  const buoys=new THREE.Group();g.add(buoys);for(let k=0;k<11;k++){const x=-W2/2-22,z=-L/2+4+k*(L-8)/10;K.ball(buoys,x,WATER+.06,z,.2,k%2?0xe85a2a:0xece8dc,[1,.8,1]);}
  out.anchors.dam=g;}

 // ============================================== the park ========================================================================
 {const S=(e,n,rot,spec,{h=1.4,posts=2,y=null}={})=>{const g=at(root,e,n,y,rot),uv=signOf(spec);for(let k=0;k<posts;k++){const x=posts===1?0:(k?1:-1)*(spec.w/2-.12);K.cyl(g,x,(h+spec.h)/2,0,.045,h+spec.h,M.grey,6);}
   B(g,0,h+spec.h/2,.03,spec.w+.06,spec.h+.06,.05,M.brown);face(g,uv,spec.w,spec.h,{y:h+spec.h/2,z:-.06});return g;};
  // ---- the entrance: a routed sign on stone piers; the fee booth; the parks pickup
  {const g=at(root,SPOT.newSign[0],SPOT.newSign[1],null,hd(.55,-1)),uv=paint(900,300,newSignArt);for(const s of [-1,1]){B(g,s*1.95,.6,0,.7,1.2,.7,M.stone);B(g,s*1.95,1.24,0,.8,.08,.8,M.concrete);}
   B(g,0,1.55,0,3.3,1.1,.2,M.brown);face(g,uv,3.2,1.05,{y:1.55,z:-.11});face(g,uv,3.2,1.05,{y:1.55,z:.11,ry:Math.PI});
   // a bed of daylilies at its foot, gone over
   for(let k=0;k<14;k++){const x=-1.4+k*.2,z=-.7+Math.sin(k)*.15;K.cyl(g,x,.18,z,.02,.36,0x4a6a2a,4);if(k%3===0)K.ball(g,x,.38,z,.05,0xd88a2a);}}
  {const b=BLD.booth,g=at(root,b.c[0],b.c[1],b.y,b.a);B(g,0,b.floor/2,0,b.w+.2,b.floor,b.d+.2,M.concrete);B(g,0,b.floor+1.1,0,b.w,2.2,b.d,M.block);
   B(g,0,b.floor+1.55,-b.d/2-.01,1.6,.8,.04,K.mat(0x3a4a50,{roughness:.3,metalness:.2}));B(g,0,b.floor+2.32,0,b.w+.5,.14,b.d+.5,M.shingle);
   const uv=signOf(PARK_SIGNS.fee);face(g,uv,.8,.5,{y:b.floor+.85,z:-b.d/2-.03});out.anchors.booth=g;}
  {const P=PADS.find(p=>p.id==='lot');const pk=at(root,-120,306,P.y+.035,-Math.PI/2);makeCar(K,pk,'pickup',0xe8e4d8);pk.name='parks-pickup';out.dyn.pickup=pk;
   // two cars of people out at the water (the fisherman's leaves later: chapter5.js drives it)
   const c1=at(root,-103,296,P.y+.035,Math.PI/2);makeCar(K,c1,'wagon',0x7a8a6a);const c2=new THREE.Group();live.add(c2);const {x,z}=PW(-127,296);c2.position.set(x,P.y+.035,z);c2.rotation.y=-Math.PI/2;const cp=makeCar(K,c2,'sedan',0x8a3a2e);out.dyn.fishCar={g:c2,parts:cp};}
  // ---- the lot's lamp: a tall pole, a cobra head (its level is the story's)
  {const s=SOLIDS.find(q=>q.kind==='lamp'),g=at(root,s.e,s.n,null,0);K.cyl(g,0,4.5,0,.1,9,M.steel,8);K.rod(g,[0,8.7,0],[0,9.1,1.4],.05,M.steel);const head=new THREE.Mesh(new THREE.BoxGeometry(.32,.14,.62),new THREE.MeshStandardMaterial({color:0xd8d0c0,emissive:0xffb060,emissiveIntensity:0}));
   const hp=PW(s.e,s.n-1.5);head.position.set(hp.x,gY(s.e,s.n)+9.05,hp.z);head.name='lot-lamp-head';live.add(head);
   // (its light joins the scene only while Chapter Five is playing: every light in the scene costs every lit material)
   const pool=new THREE.PointLight(0xffb870,0,26,1.6);pool.position.set(hp.x,gY(s.e,s.n)+8.6,hp.z);pool.name='lot-lamp-light';out.lights.lot={head,pool,level:0};}
  // ---- the kiosk: two posts, a little roof, the map behind plexiglass
  {const s=SOLIDS.find(q=>q.kind==='kiosk'),g=at(root,s.c[0],s.c[1],null,Math.PI);for(const x of [-.95,.95])K.cyl(g,x,1.3,0,.07,2.6,M.brown,6);B(g,0,2.68,0,2.4,.08,.9,M.shingle);B(g,0,1.45,.02,2.02,1.42,.06,M.brown);
   const uv=paint(1024,720,kioskMapArt);face(g,uv,1.86,1.3,{y:1.45,z:-.03});out.anchors.kiosk=g;}
  // ---- the restroom: a block building, two doors, a vent pipe
  {const b=BLD.restroom,g=at(root,b.c[0],b.c[1],b.y,b.a);B(g,0,b.floor/2,0,b.w+.3,b.floor,b.d+.3,M.concrete);B(g,0,b.floor+b.h/2,0,b.w,b.h,b.d,M.block);B(g,0,b.floor+b.h+.08,0,b.w+.4,.16,b.d+.4,M.shingle);
   for(const x of [-1.05,1.05]){B(g,x,b.floor+1,-b.d/2-.02,.85,2,.05,M.brown);}const uv=signOf(PARK_SIGNS.restroom);face(g,uv,.9,.3,{y:b.floor+2.35,z:-b.d/2-.04});K.cyl(g,1.6,b.floor+b.h+.6,.8,.05,1,M.steel,6);}
  // ---- the shelter: six timber posts on a concrete pad, a hip roof; tables under it
  {const P=PADS.find(p=>p.id==='shelter'),g=at(root,P.c[0],P.c[1],P.y,P.a);B(g,0,.06,0,10.4,.12,7.2,M.concrete);
   for(const x of [-4.6,0,4.6])for(const z of [-3.1,3.1])B(g,x,1.4,z,.24,2.8,.24,M.brown);for(const z of [-3.1,3.1])B(g,0,2.86,z,9.8,.26,.16,M.brown);for(const x of [-4.6,0,4.6])B(g,x,2.86,0,.16,.26,6.4,M.brown);
   const roof=[[-5.6,2.95,-4],[5.6,2.95,-4],[3.2,4.2,0],[-3.2,4.2,0],[5.6,2.95,4],[-5.6,2.95,4]];
   K.quad(g,roof[0],roof[3],roof[2],roof[1],M.shingle);K.quad(g,roof[4],roof[2],roof[3],roof[5],M.shingle);K.tri(g,[...roof[0],...roof[5],...roof[3]],M.shingle);K.tri(g,[...roof[1],...roof[2],...roof[4]],M.shingle);
   // the underside (so the roof is not paper from below)
   K.quad(g,[roof[0][0],2.93,roof[0][2]],[roof[1][0],2.93,roof[1][2]],[roof[4][0],2.93,roof[4][2]],[roof[5][0],2.93,roof[5][2]],M.brown);
   const uv=signOf(PARK_SIGNS.shelter);face(g,uv,1.4,.32,{y:2.6,z:-3.2});}
  // ---- picnic tables, grills, barrels
  for(const s of SOLIDS.filter(q=>q.kind==='table'&&!q.inside)){const g=at(root,s.c[0],s.c[1],null,s.a);picnicTable(g);}
  for(const s of SOLIDS.filter(q=>q.kind==='grill')){const g=at(root,s.e,s.n);K.cyl(g,0,.45,0,.05,.9,M.steel,6);B(g,0,.92,0,.6,.16,.42,K.mat(0x2a2a28,{roughness:.6,metalness:.5}));B(g,0,1.0,0,.58,.02,.4,M.steel);}
  for(const s of SOLIDS.filter(q=>q.kind==='barrel')){const g=at(root,s.e,s.n);K.cyl(g,0,.45,0,.3,.9,K.mat(0x3a5a3a,{roughness:.6,metalness:.4}),12);K.cyl(g,0,.9,0,.31,.04,M.steel,12);}
  // ---- the playground: an A-frame swing set (two swings), a slide, a merry-go-round
  {const s=SOLIDS.find(q=>q.kind==='swings'),g=at(root,s.c[0],s.c[1],null,s.a),pipe=K.mat(0x5a7a8a,{roughness:.5,metalness:.4});
   for(const x of [-2.2,2.2])for(const z of [-.9,.9])K.rod(g,[x,0,z],[x*.95,2.5,0],.05,pipe);K.rod(g,[-2.3,2.5,0],[2.3,2.5,0],.06,pipe);
   for(const x of [-.8,.8]){for(const dx of [-.22,.22])K.rod(g,[x+dx,2.45,0],[x+dx,.55,0],.008,M.steel);B(g,x,.52,0,.6,.04,.22,K.mat(0x2a2a2a,{roughness:.7}));}out.anchors.swings=g;}
  {const s=SOLIDS.find(q=>q.kind==='slide'),g=at(root,s.c[0],s.c[1],null,s.a),pipe=K.mat(0xb8401e,{roughness:.6,metalness:.3});
   for(const x of [-.3,.3]){K.rod(g,[x,0,1.6],[x,1.9,1.4],.035,pipe);}for(let k=0;k<6;k++)B(g,0,.3+k*.3,1.55-k*.03,.6,.035,.06,M.steel);B(g,0,1.85,1.2,.7,.06,.6,M.steel);
   const sl=K.quad(g,[-.28,1.85,.9],[.28,1.85,.9],[.28,.25,-1.7],[-.28,.25,-1.7],K.mat(0xc8ccc8,{roughness:.25,metalness:.7}));void sl;for(const x of [-.3,.3])K.rod(g,[x,1.95,.9],[x,.35,-1.7],.02,pipe);}
  {const s=SOLIDS.find(q=>q.kind==='merry'),g=at(root,s.e,s.n);K.cyl(g,0,.42,0,1.25,.06,K.mat(0x3a6a9a,{roughness:.5,metalness:.4}),24);K.cyl(g,0,.25,0,.08,.4,M.steel,8);for(let k=0;k<4;k++){const a=k*Math.PI/2;K.rod(g,[Math.cos(a)*.2,.45,Math.sin(a)*.2],[Math.cos(a)*1.1,.9,Math.sin(a)*1.1],.025,M.steel);}}
  // ---- benches facing the water; the NO SWIMMING sign at the shore; DUSK and CARRY IN by the lot
  for(const [e,n,a] of [[-160,349,hd(-1,.6)],[-130,357,hd(-1,.4)],[-178,330,hd(-.6,.8)]]){const g=at(root,e,n,null,a);for(const x of [-.75,.75])B(g,x,.22,0,.08,.44,.42,M.grey);for(const z of [-.12,.05,.2])B(g,0,.46,z,1.8,.04,.11,M.timber);B(g,0,.78,.27,1.8,.24,.04,M.timber);}
  S(-176,351,hd(.4,-1),PARK_SIGNS.noswim,{h:1.1});S(-90,288,hd(.7,-.4),PARK_SIGNS.dusk,{h:1.2});S(-124,315,Math.PI,PARK_SIGNS.carry,{h:.9,posts:1});
  // ---- the bike rack by the shelter path (where the story parks the bikes)
  {const r=SPOT.rack,g=at(root,r.c[0],r.c[1],null,r.a);for(let k=0;k<5;k++){K.rod(g,[-1.2+k*.6,0,0],[-1.2+k*.6,.75,0],.022,M.steel);}K.rod(g,[-1.25,.75,0],[1.25,.75,0],.024,M.steel);K.rod(g,[-1.25,.05,0],[1.25,.05,0],.024,M.steel);out.anchors.rack=g;}
  // ---- the place in the picture: the old sign (two posts, the board), the yellow swing gate, the pavers, the shed by the water
  {const s=SOLIDS.find(q=>q.kind==='oldsign'),g=at(root,s.c[0],s.c[1],null,s.a);for(const x of [-1.5,1.5])B(g,x,1,0,.14,2,.14,K.mat(0x4a3420,{roughness:1}));
   const uv=paint(640,400,oldSignArt);B(g,0,1.75,.06,3.3,2.1,.08,K.mat(0x3a2818,{roughness:1}));face(g,uv,3.2,2,{y:1.75,z:-.01});out.anchors.oldSign=g;}
  {const g=at(root,SPOT.gate[0],SPOT.gate[1],null,0);for(const x of [-2.8,2.8])K.cyl(g,x,.6,0,.09,1.2,K.mat(0x8a8a6a,{roughness:.5,metalness:.4}),8);
   // (the arm turns, so it stays live: built under the root it would be baked into the merged world where it was drawn)
   const gLive=at(live,SPOT.gate[0],SPOT.gate[1],null,0),arm=new THREE.Group();arm.position.set(-2.8,1.05,0);gLive.add(arm);K.cyl(arm,2.8,0,0,.05,5.6,M.yellowSteel,8,[0,0,Math.PI/2]);B(arm,2.8,-.16,.05,.6,.26,.03,K.mat(0xd83a2a,{roughness:.7}));
   K.rod(g,[2.8,1.05,0],[2.86,.7,0],.008,M.steel);out.anchors.swingGate=arm;out.dyn.swing={arm,G:GATES.swing};
   // the latch at the free end (where a hand opens it): a hasp on the arm over a catch post
   B(arm,5.55,0,.06,.1,.12,.03,M.steel);
   {const rg=new THREE.DodecahedronGeometry(1,0),rm=K.mat(0x7c786c,{roughness:.95});for(const q of SOLIDS.filter(q=>q.kind==='gaterock')){const p=PW(q.e,q.n),m=new THREE.Mesh(rg,rm);m.scale.set(q.r*1.05,q.r*.72,q.r*.95);m.rotation.y=q.e*1.7;m.position.set(p.x,heightAt(p.x,p.z)+q.r*.35,p.z);m.castShadow=true;m.receiveShadow=true;root.add(m);}}
   for(let k=0;k<6;k++){const pg=at(root,-120+k*.9,370.6);B(pg,0,.02,0,.6,.06,.6,M.stone);}}
  {const b=BLD.arshed,g=at(root,b.c[0],b.c[1],b.y,b.a);B(g,0,b.floor/2,0,b.w+.2,b.floor,b.d+.2,M.concrete);B(g,0,b.floor+b.h/2,0,b.w,b.h,b.d,K.mat(0x8a8a7a,{roughness:.9}));B(g,0,b.floor+b.h+.15,0,b.w+.5,.3,b.d+.5,K.mat(0x4a3a32,{roughness:.9}));
   B(g,-.9,b.floor+1.05,-b.d/2-.03,1,2.1,.05,K.mat(0x5a6a62,{roughness:.6,metalness:.4}));B(g,1.2,b.floor+1.7,-b.d/2-.02,.8,.5,.04,K.mat(0x30383a,{roughness:.3}));
   const uv=signOf(PARK_SIGNS.authority);face(g,uv,1.1,.55,{x:1.2,y:b.floor+1.05,z:-b.d/2-.04});}}
 function picnicTable(g){const wd=M.timber,leg=M.grey;for(const x of [-.75,.75]){K.rod(g,[x,0,-.75],[x,.74,.0],.045,leg);K.rod(g,[x,0,.75],[x,.74,0],.045,leg);B(g,x,.42,0,.07,.07,1.55,leg);}
  for(const z of [-.24,-.08,.08,.24])B(g,0,.76,z,1.85,.045,.14,wd);for(const s of [-1,1])for(const z of [-.08,.08])B(g,0,.44,s*.6+z,1.85,.045,.14,wd);}
 out.picnicTable=picnicTable;

 // ============================================== the old road: verges, fences, poles, the farm ========================================
 {const R=ROADS.orr;
  // split-rail fences along the fields, both sides (a gap at the farm's driveway)
  for(const side of [-1,1]){let prev=null;for(let s=44;s<=152;s+=3.1){const p=R.at(s,side*9),q=PL(p.x,p.z);if(side>0&&s>94&&s<106){prev=null;continue;}const y=heightAt(p.x,p.z);
    const post=new THREE.Group();post.position.set(p.x,y,p.z);post.rotation.y=-R.at(s).a;root.add(post);K.cyl(post,0,.55,0,.07,1.1,M.grey,6);
    if(prev){for(const h of [.45,.85]){K.rod(root,[prev.x,prev.y+h,prev.z],[p.x,y+h+(s%6.2<3?.03:-.02),p.z],.05,M.grey,.045,5);}}prev={x:p.x,y,z:p.z};void q;}}
  // the pole line: wooden poles on the west side every ~38 m, three wires; into the park to the booth and the lamp (the camp has none)
  const poles=[];for(let s=12;s<=R.L-6;s+=38){const p=R.at(s,-6.6),y=heightAt(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=-R.at(s).a;root.add(g);
   K.cyl(g,0,4.6,0,.14,9.2,M.brown,7);B(g,0,8.5,0,1.8,.12,.12,M.brown);for(const x of [-.75,0,.75])K.cyl(g,x,8.64,0,.05,.12,0xdedad0,6);poles.push(new THREE.Vector3(p.x,y+8.7,p.z));}
  {const lp=SOLIDS.find(q=>q.kind==='lamp');poles.push(new THREE.Vector3(...(()=>{const p=PW(lp.e,lp.n);return [p.x,gY(lp.e,lp.n)+8.7,p.z];})()));}
  for(let i=0;i<poles.length-1;i++)for(const off of [-.75,0,.75]){const a=poles[i],b=poles[i+1],pts=[];for(let k=0;k<=10;k++){const t=k/10;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*t+off*.0,a.y+(b.y-a.y)*t-1.6*t*(1-t)*4*.4,a.z+(b.z-a.z)*t));}root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x2e2a26})));}
  // signs along it
  const sg=(s,side,spec,{h=1.5,posts=1}={})=>{const p=R.at(s,side*(R.half(s)+1.8)),q=PL(p.x,p.z),g=at(root,q.e,q.n,null,R.at(s).a+(side>0?Math.PI:Math.PI)),uv=signOf(spec);
   for(let k=0;k<posts;k++)K.cyl(g,posts===1?0:(k?1:-1)*(spec.w/2-.1),(h+spec.h)/2,0,.035,h+spec.h,M.steel,6);face(g,uv,spec.w,spec.h,{y:h+spec.h/2,z:-.02});return g;};
  sg(9,1,PARK_SIGNS.road,{h:2.3});sg(32,1,PARK_SIGNS.speed,{h:1.6});sg(118,1,PARK_SIGNS.mile,{h:1.3,posts:2});sg(168,1,PARK_SIGNS.deer,{h:1.7});
  // the farm: a white farmhouse, a red barn, a silo, a mailbox, hay bales in the field
  {const b=BLD.farmhouse,frame2={id:'pine-farm',heading:()=>b.a,point:(u,v)=>{const [e,n]=frameOf(b.c,b.a).to(v,u);const p=PW(e,n);return {...p,y:b.y};},project:(x,z)=>{const q=PL(x,z),[lx,lz]=frameOf(b.c,b.a).of(q.e,q.n);return {u:lz,v:lx};}};
   const P=planHouse(seeded(919),{frame:frame2,frameId:frame2.id,u:0,side:1,setback:0,w:b.w,depth:b.d,style:'colonial',roof:'side',roofColor:0x4a4a48,wall:0xe8e4d8,garage:false,porch:'porch',porchW:6,doorX:0,chimney:'interior',brick:null,lod:'mid',far:true,groundFn:()=>b.y});
   buildHouse({...W,space:{...W.space,rect:()=>{}},farHouses:[],drape:()=>new THREE.Group()},P);const p=PW(b.c[0],b.c[1]);P.g.position.set(p.x,b.y,p.z);P.g.rotation.y=Math.PI-b.a;P.g.name='farmhouse';far.add(P.g);
   K.box(P.g,0,-.4,0,b.w+.2,.8,b.d+.2,M.concrete);}
  {const b=BLD.barn,g=at(far,b.c[0],b.c[1],b.y,b.a),red=K.mat(0x8a2a22,{roughness:.9});B(g,0,2.2,0,b.w,4.4,b.d,red);
   // a gambrel roof
   const prof=[[-b.w/2-.3,4.3],[-b.w/2+1.6,6.2],[0,7.4],[b.w/2-1.6,6.2],[b.w/2+.3,4.3]];for(let k=0;k<4;k++){const [a1,c1]=prof[k],[a2,c2]=prof[k+1];K.quad(g,[a1,c1,b.d/2+.3],[a2,c2,b.d/2+.3],[a2,c2,-b.d/2-.3],[a1,c1,-b.d/2-.3],M.shingle);}
   for(const z of [-b.d/2,b.d/2]){const T=[[-b.w/2,4.4],[b.w/2,4.4],[0,7.3],[-b.w/2,4.4],[-b.w/2+1.6,6.1],[0,7.3],[b.w/2,4.4],[0,7.3],[b.w/2-1.6,6.1]],v=[];for(let k=0;k<T.length;k+=3){let [a,b2,c]=[T[k],T[k+1],T[k+2]];const ar=(b2[0]-a[0])*(c[1]-a[1])-(b2[1]-a[1])*(c[0]-a[0]);if((ar>0)!==(z>0))[b2,c]=[c,b2];for(const [x,y] of [a,b2,c])v.push(x,y,z);}K.tri(g,v,red);}
   B(g,0,1.8,-b.d/2-.03,3.6,3.6,.06,K.mat(0x6a1e1a,{roughness:.9}));for(const s of [-1,1])K.rod(g,[s*1.8,0,-b.d/2-.06],[-s*1.8,3.6,-b.d/2-.06],.06,0xe8e4d8);
   const silo=at(far,b.c[0]+9,b.c[1]+4,b.y);K.cyl(silo,0,5,0,2.2,10,K.mat(0x9a9a92,{roughness:.6,metalness:.3}),16);const dome=new THREE.Mesh(new THREE.SphereGeometry(2.25,16,8,0,Math.PI*2,0,Math.PI/2),K.mat(0x8a8a82,{roughness:.5,metalness:.4}));dome.position.y=10;silo.add(dome);}
  {const g=at(root,-3.4,97,null,-Math.PI/2);K.cyl(g,0,.55,0,.05,1.1,M.grey,6);B(g,0,1.18,0,.26,.24,.5,K.mat(0x2a2a2a,{roughness:.6,metalness:.4}));const uv=signOf(PARK_SIGNS.mailbox);face(g,uv,.36,.12,{x:.135,y:1.18,z:0,ry:Math.PI/2});}
  for(const [e,n] of [[28,78],[34,86],[22,132],[40,140],[-24,92]]){const g=at(far,e,n,null,e*.3);K.cyl(g,0,.6,0,.62,1.2,K.mat(0xb8a060,{roughness:1}),14,[Math.PI/2,0,0]);}}

 // ============================================== the woods ===============================================================================
 {const leafM=c=>W.foliageMat(c,true,leafTexture);
  const n={near:0,mid:0,far:0};for(const t of TREES)n[t.lod]++;
  // Keep the town-facing fringe as authored in Chapters Zero–Four. Beyond it all trees share four prototypes.
  const modern=[];for(const t of TREES){if(t.n>=170){modern.push(t);continue;}const p=PW(t.e,t.n),g=at(t.lod==='far'?far:root,t.e,t.n,heightAt(p.x,p.z)-.06,t.seed*.01);veg.build(g,seeded(t.seed),{size:t.size,kind:t.kind,lod:t.lod==='near'?'full':t.lod});}
  out.forest=createPineForest(modern,live);out.trees=n;
  // Undergrowth: shrubs and ferns along the edges of where you can walk, fallen logs, stumps, rocks.
  const r=seeded(6061),edge=[];for(let i=0;i<GRID.ne;i+=5)for(let j=0;j<GRID.nn;j+=5){const k=i*GRID.nn+j,t=GRID.t[k];if(t!==PS.woods)continue;const e=GRID.e0+(i+.5)*GRID.c,n2=GRID.n0+(j+.5)*GRID.c;
   // a woods cell next to the edge of what is reachable
   let nearNone=false;for(const [di,dj] of [[6,0],[-6,0],[0,6],[0,-6]]){const q=(i+di)*GRID.nn+(j+dj);if(i+di<0||j+dj<0||i+di>=GRID.ne||j+dj>=GRID.nn||GRID.t[q]===PS.none){nearNone=true;break;}}if(nearNone&&r()<.22)edge.push([e,n2]);}
  const fernM=leafM(0x4a6a32);
  for(const [e,n2] of edge){const p=PW(e,n2),g=new THREE.Group();g.position.set(p.x,heightAt(p.x,p.z),p.z);root.add(g);const k=r();
   if(k<.55)veg.shrub(g,0,0,.5+r()*.6,r);else{for(let j=0;j<3;j++){const f=new THREE.Mesh(leafGeometrySmall,fernM);f.position.set((r()-.5)*.8,.2,(r()-.5)*.8);f.scale.set(.5,.22,.5);f.rotation.y=r()*6;g.add(f);}}}
  // fallen logs and stumps in the woods near the camp and the trail; rocks along the shore
  for(let k=0;k<46;k++){const e=-340+r()*220,n2=380+r()*250,c=cellOf(e,n2);if(c<0||GRID.t[c]!==PS.none)continue;const p=PW(e,n2),g=new THREE.Group();g.position.set(p.x,heightAt(p.x,p.z),p.z);g.rotation.y=r()*6;root.add(g);
   if(k%3)K.rod(g,[-1.6-r()*1.4,.22,0],[1.6+r()*1.4,.28,0],.2+r()*.12,M.bark,.18,7);else{K.cyl(g,0,.25,0,.32,.5,M.bark,9);K.cyl(g,0,.51,0,.3,.02,0x9a8060,9);}}
  for(let k=0;k<120;k++){const a=k/120,i=Math.floor(a*SHORE_LINE.length),[e,n2]=SHORE_LINE[i];if(e>-190&&e<-150&&n2>330&&n2<362)continue;if(e<-344&&n2>370&&n2<450)continue;if(r()<.5)continue;
   const p=PW(e+(r()-.5)*2,n2+(r()-.5)*2),g=new THREE.Group();g.position.set(p.x,Math.max(WATER-.1,heightAt(p.x,p.z)-.1),p.z);root.add(g);K.ball(g,0,.1,0,.25+r()*.4,0x7a766a,[1.3,.6,1],false);}
  // reeds and cattails in the shallows (away from the docks, the beach, the dam), lily pads on the still water
  const reedM=K.mat(0x6a7a3a,{roughness:1}),headM=K.mat(0x5a3a22,{roughness:1});
  for(let k=0;k<SHORE_LINE.length;k+=3){const [e,n2]=SHORE_LINE[k];if((e>-190&&e<-150&&n2>330&&n2<362)||(e<-344&&n2>370&&n2<450)||(e>-250&&e<-200&&n2>496)||r()<.45)continue;
   const g=at(root,e+(r()-.5)*1.5,n2+(r()-.5)*1.5,WATER-.25);for(let j=0;j<7;j++){const x=(r()-.5)*1.4,z=(r()-.5)*1.4,h=.9+r()*.8;K.rod(g,[x,0,z],[x+(r()-.5)*.2,h,z+(r()-.5)*.2],.012,reedM,.006,3);if(j%3===0)K.cyl(g,x,h*.85,z,.03,.16,headM,5);}}
  const padM=K.mat(0x3e5a2e,{roughness:.6,side:THREE.DoubleSide});for(let k=0;k<70;k++){const e=-330+r()*170,n2=330+r()*170;const sd=shoreSD(e,n2);if(sd>-2||sd<-14)continue;const p=PW(e,n2);const m=new THREE.Mesh(new THREE.CircleGeometry(.22+r()*.18,8,.3,5.6),padM);m.rotation.set(-Math.PI/2,0,r()*6);m.position.set(p.x,WATER+.012,p.z);root.add(m);}}

 // ============================================== the camp ==================================================================================
 buildCamp(W,out);buildPineDetail(W,out);
 // ============================================== finish ======================================================================================
 const tex=signs.finish();if(tex){signMat.map=tex;signMat.needsUpdate=true;}
 // (painted faces bake with the rest: one material, the atlas)
 for(const f of faces)f.userData.zone=f.userData.zone||null;
 out.signsFull=signs.full;out.signEntries=signs.entries;
 // Per frame: the water's ripples and the sky in it; the lot's lamp.
 const _c=new THREE.Color();
 // The camp's moving parts follow what the story sets (chapter5.js): each door's DOORS[key].open (what nav.js also
 // reads), each building's window glow level, the bell's swing, the gate's left leaf.
 const dmp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
 out.update=(dt,{fog,dusk=0,night=0,time,camera}={})=>{out.forest?.update(dt,camera);const U=out.waterU;U.uTime.value=(time??(U.uTime.value+dt));out.groundU.uTime.value=U.uTime.value;if(fog){_c.copy(fog);U.uSky.value.lerp(_c,1-Math.exp(-3*dt));}
  const L=out.lights.lot;if(L){L.head.material.emissiveIntensity=L.level*2.2;L.pool.intensity=L.level*14;}
  for(const [key,d] of Object.entries(out.doors)){const want=DOORS[key]?.open??0;if(d.posed&&Math.abs(d.cur-want)<1e-4){if(DOORS[key])DOORS[key].cur=d.cur;continue;}d.cur=dt>0?dmp(d.cur,want,d.fast||5,dt):want;if(Math.abs(d.cur-want)<1e-3)d.cur=want;if(DOORS[key])DOORS[key].cur=d.cur;
   d.hinge.rotation.y=-d.inward*d.cur*1.45;if(d.pair)d.pair.hinge.rotation.y=d.inward*d.cur*1.45;d.posed=true;}
  for(const g of Object.values(out.glows)){const lv=clamp(g.level,0,1.5);if(g.shown===lv)continue;g.shown=lv;g.mat.emissiveIntensity=lv*2.6;if(g.see){g.mat.opacity=g.base+Math.min(1,lv)*.55;}}
  const bell=out.dyn.bell;if(bell&&(Math.abs(bell.v)>1e-4||Math.abs(bell.swing)>1e-4)){bell.v+=(-9.8/.45*Math.sin(bell.swing)-bell.v*.9)*dt;bell.swing+=bell.v*dt;bell.yoke.rotation.z=bell.swing;}
  const gate=out.dyn.campGate;if(gate){const want=gate.want??-1.25;gate.left.hinge.rotation.y=dt>0?dmp(gate.left.hinge.rotation.y,want,gate.k||1.4,dt):want;
   GATES.campL.ang=gate.left.hinge.rotation.y;GATES.campL.want=want;GATES.campR.ang=gate.right.hinge.rotation.y;}
  // the yellow arm: turned toward where the story (or a hand) sends it, at a hand's pace; what blocks follows it
  const sw=out.dyn.swing;if(sw){const G=sw.G,a=sw.arm.rotation.y,to=G.want;let v=a;if(G.snap){G.snap=false;v=to;}else if(dt>0){const k=G.k||2.4;v=Math.abs(to-a)<1e-3?to:a+Math.sign(to-a)*Math.min(Math.abs(to-a),dt*k*Math.max(.18,Math.min(1,Math.abs(to-a)*1.6)));}else v=to;sw.arm.rotation.y=v;G.ang=v;}};
 return out;
}
