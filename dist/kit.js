// Geometry kit shared by the world builders. Everything here is plain data or
// small Three.js meshes that world.js later bakes, bends and merges by material.
import * as THREE from './three.module.js';

export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
// Deterministic randomness. Each lot gets its own stream, so editing one house
// never reshuffles the rest of the street.
export function seeded(seed){let s=(seed>>>0)||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
export const hashSeed=(...n)=>{let h=2166136261;for(const v of n){h^=Math.round(v*1000)|0;h=Math.imul(h,16777619);}return h>>>0;};
export const pickFrom=rand=>a=>a[Math.floor(rand()*a.length)];

// A box with rounded edges: the Minkowski sum of an inner box and a sphere of radius r,
// sampled so each face gets one bevel step per edge. Normals point along the bevel,
// so shading reads as a softened edge rather than a raw primitive corner.
const rbCache=new Map();
export function roundedBoxGeometry(w,h,d,r){
 r=Math.min(r,w/2-1e-3,h/2-1e-3,d/2-1e-3);if(r<.004)return new THREE.BoxGeometry(w,h,d);
 const key=[w,h,d,r].map(v=>v.toFixed(3)).join(':');if(rbCache.has(key))return rbCache.get(key);
 const H=[w/2,h/2,d/2],I=H.map(v=>v-r),pos=[],nor=[],idx=[];
 for(const [a,s] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]]){
  const b=(a+1)%3,c=(a+2)%3,base=pos.length/3,co=k=>[-H[k],-I[k],I[k],H[k]],B=co(b),C=co(c);
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){const p=[0,0,0];p[a]=s*H[a];p[b]=B[i];p[c]=C[j];
   const q=p.map((v,k)=>clamp(v,-I[k],I[k])),n=p.map((v,k)=>v-q[k]),L=Math.hypot(...n)||1;
   for(let k=0;k<3;k++){n[k]/=L;pos.push(q[k]+n[k]*r);nor.push(n[k]);}}
  for(let j=0;j<3;j++)for(let i=0;i<3;i++){const v0=base+j*4+i,v1=v0+1,v2=v0+4,v3=v0+5;
   if(s>0)idx.push(v0,v1,v3,v0,v3,v2);else idx.push(v0,v3,v1,v0,v2,v3);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);
 rbCache.set(key,g);return g;
}

// Material cache and primitive helpers. Colors become vertex colors at merge time.
export function createKit(){
 const mats=new Map();
 function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.9,...extra}));return mats.get(key);}
 const M=c=>typeof c==='object'?c:mat(c);
 const boxGeo=new THREE.BoxGeometry(1,1,1),sphereGeo=new THREE.IcosahedronGeometry(1,1),tinyGeo=new THREE.IcosahedronGeometry(1,0),smoothSphere=new THREE.IcosahedronGeometry(1,2);
 const add=(g,m)=>{g.add(m);return m;};
 const K={mat,M,boxGeo,sphereGeo,
  group(parent,x=0,z=0,rotY=0,y=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotY;parent.add(g);return g;},
  box(g,x,y,z,w,h,d,c){const m=new THREE.Mesh(boxGeo,M(c));m.position.set(x,y,z);m.scale.set(w,h,d);return add(g,m);},
  // Rounded box: r is the edge radius in meters.
  rbox(g,x,y,z,w,h,d,r,c){const m=new THREE.Mesh(roundedBoxGeometry(w,h,d,r),M(c));m.position.set(x,y,z);return add(g,m);},
  ball(g,x,y,z,r,c,s=[1,1,1],fine=false){const m=new THREE.Mesh(fine?smoothSphere:r<.13?tinyGeo:sphereGeo,M(c));m.position.set(x,y,z);m.scale.set(r*s[0],r*s[1],r*s[2]);return add(g,m);},
  rod(g,a,b,r,c,r2=r,sides=6){const A=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(A);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,v.length(),sides),M(c));m.position.copy(A).addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return add(g,m);},
  cyl(g,x,y,z,r,h,c,sides=12,rot=null){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,sides),M(c));m.position.set(x,y,z);if(rot)m.rotation.set(...rot);return add(g,m);},
  tri(g,verts,c,normals=null){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));if(normals)geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));else geo.computeVertexNormals();return add(g,new THREE.Mesh(geo,M(c)));},
  // Quad from four corners (counter-clockwise seen from the front).
  quad(g,a,b,c2,d,c){return K.tri(g,[...a,...b,...c2,...a,...c2,...d],c);},
  // Surface of revolution around local y (posts, finials, bollards, lamp heads).
  lathe(g,pts,x,y,z,c,segs=10){const m=new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),segs),M(c));m.position.set(x,y,z);return add(g,m);},
  // Extruded 2D outline (x,y) with rounded extrusion edges; depth runs along local z, centered.
  extrude(g,outline,depth,bevel,c,{holes=[],curve=6,bevelSegments=2}={}){const s=new THREE.Shape(outline.map(([x,y])=>new THREE.Vector2(x,y)));for(const hole of holes)s.holes.push(new THREE.Path(hole.map(([x,y])=>new THREE.Vector2(x,y))));
   const geo=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,depth-2*bevel),bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments,curveSegments:curve});geo.translate(0,0,-depth/2+bevel);return add(g,new THREE.Mesh(geo,M(c)));},
  line(g,pts,color){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color}));g.add(l);return l;},
 };
 return K;
}

// A sampled outline in 2D with smooth, consistent normals: used for curbs,
// sidewalks and gutters around corners and the cul-de-sac. pts are [u,v] pairs.
export function pathNormals(pts,closed=false){const n=pts.length,out=[];
 for(let i=0;i<n;i++){const a=pts[closed?(i-1+n)%n:Math.max(0,i-1)],b=pts[closed?(i+1)%n:Math.min(n-1,i+1)];const du=b[0]-a[0],dv=b[1]-a[1],L=Math.hypot(du,dv)||1;out.push([dv/L,-du/L]);}
 return out;}
// Sweep a cross-section profile [[offset,height],...] along a 2D path in street
// coordinates (u = distance, v = lateral). Offsets move along the path normal.
// scale(i) can squash the profile height (curb cuts at driveways).
export function sweepGeometry(pts,normals,profile,{closed=false,heightScale=null,side=1}={}){
 const pos=[],idx=[],np=profile.length,n=pts.length;
 for(let i=0;i<n;i++){const [u,v]=pts[i],[nu,nv]=normals[i],k=heightScale?heightScale(i,u,v):1;
  for(const [o,h] of profile){const uu=u+nu*o*side,vv=v+nv*o*side,hh=typeof h==='function'?h(i,uu,vv,k):h*k;pos.push(vv,hh,-uu);}}
 // Profiles run from the road side outward; side=-1 mirrors them, so the winding flips too.
 const segs=closed?n:n-1;
 for(let i=0;i<segs;i++)for(let j=0;j<np-1;j++){const a=i*np+j,b=((i+1)%n)*np+j;if(side>0)idx.push(a,b,a+1,b,b+1,a+1);else idx.push(a,a+1,b,b,a+1,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);return g;
}

// World-space occupancy for placement: oriented rectangles and circles.
// Background scatter asks free() before placing anything.
export function createSpace(cell=40){
 const grid=new Map(),key=(i,j)=>i+','+j;
 function add(shape){const r=shape.r??Math.hypot(shape.hw,shape.hd);shape.R=r;
  for(let i=Math.floor((shape.x-r)/cell);i<=Math.floor((shape.x+r)/cell);i++)for(let j=Math.floor((shape.z-r)/cell);j<=Math.floor((shape.z+r)/cell);j++){const k=key(i,j);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(shape);}return shape;}
 function hits(s,x,z,r){if(Math.hypot(x-s.x,z-s.z)>s.R+r)return false;if(s.r!==undefined)return true;
  const c=Math.cos(s.rot),sn=Math.sin(s.rot),dx=x-s.x,dz=z-s.z,lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<s.hw+r&&Math.abs(lz)<s.hd+r;}
 function free(x,z,r=0){for(let i=Math.floor((x-r)/cell)-1;i<=Math.floor((x+r)/cell)+1;i++)for(let j=Math.floor((z-r)/cell)-1;j<=Math.floor((z+r)/cell)+1;j++){for(const s of grid.get(key(i,j))||[])if(hits(s,x,z,r))return false;}return true;}
 const items=tag=>{const out=new Set();for(const list of grid.values())for(const s of list)if(s.tag===tag)out.add(s);return [...out];};
 // Is anything with one of these tags within r of (x,z)? (navigation: houses, trunks, posts...)
 function blocked(x,z,r,tags){for(let i=Math.floor((x-r)/cell)-1;i<=Math.floor((x+r)/cell)+1;i++)for(let j=Math.floor((z-r)/cell)-1;j<=Math.floor((z+r)/cell)+1;j++){for(const s of grid.get(key(i,j))||[])if(tags.has(s.tag)&&hits(s,x,z,r))return s;}return null;}
 return {rect:(x,z,hw,hd,rot=0,tag='')=>add({x,z,hw,hd,rot,tag}),circle:(x,z,r,tag='')=>add({x,z,r,tag}),free,items,blocked};
}
