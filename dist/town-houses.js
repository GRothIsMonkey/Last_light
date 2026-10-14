// Old Mill lots use the same finished architecture as the earlier neighborhood.
// Only these nine lots change; their accepted positions and collision envelopes stay.
import * as THREE from './three.module.js';
import {buildHouse,planHouse} from './houses.js';
import {seeded,hashSeed,lerp,clamp} from './kit.js';
import {CONN_HOUSES,CONN_X,connAt,connProject,connY} from './town-plan.js';
export function buildApproachHouses(W,world){
 const K=W.K,plans=[];
 const frame={id:'old-mill',heading:s=>connAt(s).a,
  point(s,t){const p=connAt(s,t);return {...p,y:connY(s,t)};},
  project(x,z){const p=connProject(x,z);return {u:p.s,v:p.t};}};
 for(const H of CONN_HOUSES){
  const base=connY(H.s,H.side*(H.set+.5));
  const P=planHouse(seeded(hashSeed(441,H.s,H.side)),{frame,frameId:frame.id,u:H.s,side:H.side,
   style:H.kind==='foursquare'?'colonial':H.kind==='cape'?'cape':'ranch',roof:H.kind==='foursquare'?'hip':'side',
   w:H.w,depth:H.d,setback:H.set+H.d/2,wall:H.c,roofColor:H.roof,garage:false,
   porch:H.porch?'porch':'stoop',porchW:H.porch?H.w*.72:1.9,doorX:0,chimney:'interior',brick:null,lod:'full',groundFn:()=>base});
  // Separate town layer means Chapter Three's reversible material swaps and
  // the earlier neighborhood's culling/collisions are unaffected.
  buildHouse({...W,drape:()=>{const q=connAt(H.s),root=new THREE.Group();
   root.position.set(q.x-H.s*Math.sin(q.a),base,q.z+H.s*Math.cos(q.a));root.rotation.y=-q.a;
   W.layers.push({mode:'rigid',group:root,zone:'town'});return root;}},P);
  P.g.name='old-mill-house-'+H.s;
  let low=base;for(const x of [-H.w/2,H.w/2])for(const z of [-H.d/2,H.d/2]){const q=P.toWorld(x,z);low=Math.min(low,connY(q.d,q.lat));}
  const bottom=low-base-.18;K.box(P.g,0,(bottom-.05)/2,0,H.w+.14,-.05-bottom,H.d+.14,0x9b958a);
  // Paths are tessellated and graded to the sidewalk, not floating flat boxes.
  function pathStrip(x,width,z0,z1,atHouse){const pos=[],N=Math.ceil((z1-z0)/.7),M=Math.ceil(width/.8);
   const v=(x,z)=>{const q=P.toWorld(x,z),f=clamp((z-z0)/(z1-z0),0,1),ground=connY(q.d,q.lat);return [q.x,Math.max(ground+.04,atHouse===null?ground+.04:lerp(base+.04,ground+.04,f)),q.z];};
   for(let i=0;i<N;i++)for(let j=0;j<M;j++){const za=lerp(z0,z1,i/N),zb=lerp(z0,z1,(i+1)/N),xa=x-width/2+width*j/M,xb=x-width/2+width*(j+1)/M,a=v(xa,za),b=v(xb,za),c=v(xb,zb),d=v(xa,zb);pos.push(...a,...c,...b,...a,...d,...c);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
   const m=new THREE.Mesh(g,W.surfaceMaterial(K.mat(0xb7b0a0,{roughness:.972}),'c4-walk'));m.name='old-mill-graded-path';world.add(m);
  }
  pathStrip(0,1.35,P.stepFront-.04,P.setback-CONN_X.walk+.08,true);
  pathStrip(H.w/2+2.2,3.0,P.front-2,P.setback-CONN_X.walk+.08,null);
  const q=P.toWorld(-H.w*.42,P.setback-CONN_X.walk-.45),g=new THREE.Group();g.position.set(q.x,connY(q.d,q.lat),q.z);g.rotation.y=P.worldRot;world.add(g);
  K.box(g,0,.47,0,.10,.94,.10,0x70624e);K.rbox(g,0,1.02,0,.34,.26,.44,.07,0x686d65);
  plans.push(P);
 }
 return plans;
}
