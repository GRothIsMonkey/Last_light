// A continuous vaulted trunk and descending hollow neck, with unequal load-bearing arches.
// The chapter owns world scale, strikes and sealing; this file owns anatomy only.
import * as THREE from './three.module.js';
import {mergeArt} from './astra-anatomy.js';
const V=p=>new THREE.Vector3(...p),mix=(a,b,t)=>a+(b-a)*t;
function tube(points,radii,sides=12,samples=40){
 const curve=new THREE.CatmullRomCurve3(points.map(V)),f=curve.computeFrenetFrames(samples,false),pos=[],col=[],ix=[];
 for(let i=0;i<=samples;i++){const t=i/samples,p=curve.getPoint(t),j=Math.min(radii.length-2,Math.floor(t*(radii.length-1))),u=t*(radii.length-1)-j,r=mix(radii[j],radii[j+1],u);
  for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2,fold=1+.055*Math.sin(a*5+t*31),q=p.clone().addScaledVector(f.normals[i],Math.cos(a)*r*fold).addScaledVector(f.binormals[i],Math.sin(a)*r*fold);
   pos.push(...q);const c=.64+.24*Math.max(0,Math.cos(a))+.06*Math.sin(t*41+a*3);col.push(c,c*.91,c*.81);
   if(i<samples&&k<sides){const n=i*(sides+1)+k;ix.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
// [z, centre-x, centre-y, horizontal radius, vertical radius]. A continuous skin,
// not overlapping body primitives. The terminal section is deliberately open.
const RINGS=[[1.32,-.06,.92,.008,.016],[1.18,-.07,1.04,.13,.18],[.91,-.05,1.19,.28,.31],[.59,-.02,1.26,.34,.34],[.28,.025,1.30,.29,.30],[-.06,.06,1.28,.24,.25],[-.39,.105,1.25,.18,.17],[-.73,.13,1.23,.13,.125],[-1.02,.16,1.16,.105,.14],[-1.28,.19,.99,.09,.28],[-1.49,.21,.76,.10,.43],[-1.65,.22,.65,.125,.52]];
function trunk(){const curve=new THREE.CatmullRomCurve3(RINGS.map(r=>new THREE.Vector3(r[1],r[2],r[0]))),pos=[],col=[],ix=[],N=110,S=56;
 for(let j=0;j<=N;j++){const t=j/N,u=t*(RINGS.length-1),a=Math.min(RINGS.length-2,Math.floor(u)),f=u-a,c=curve.getPoint(t),rx=mix(RINGS[a][3],RINGS[a+1][3],f),ry=mix(RINGS[a][4],RINGS[a+1][4],f);
  for(let k=0;k<=S;k++){const q=k/S*Math.PI*2,flute=1+.055*Math.sin(q*7+t*17)+.028*Math.cos(q*13-t*31),ridge=.017*Math.sin(t*87+q*2)*Math.sin(Math.PI*t),x=c.x+Math.cos(q)*rx*flute,y=c.y+Math.sin(q)*ry*flute+ridge;
   pos.push(x,y,c.z);const c2=.62+.29*Math.max(0,Math.sin(q))-.08*Math.pow(Math.sin(t*84+q*3),6);col.push(c2,c2*.9,c2*.80);
   if(j<N&&k<S){const n=j*(S+1)+k;ix.push(n,n+S+1,n+1,n+1,n+S+1,n+S+2);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
function pleura(a,b,c,d){const p=[],co=[],ix=[],N=16,M=9;
 for(let j=0;j<=N;j++)for(let k=0;k<=M;k++){const u=j/N,v=k/M,l=V(a).lerp(V(b),u),r=V(c).lerp(V(d),u),q=l.lerp(r,v),edge=Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
  q.y-=edge*(.09+.024*Math.sin(u*40));q.z+=edge*.016*Math.sin(v*36+u*17);p.push(...q);const t=.43+.16*Math.abs(Math.sin(u*31))+.16*(1-v);co.push(t,t*.72,t*.60);
  if(j<N&&k<M){const n=j*(M+1)+k;ix.push(n,n+1,n+M+1,n+1,n+M+2,n+M+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(co,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
export function presenceOrganism({sky=false}={}){
 const group=new THREE.Group();group.name='c8-presence-mass';group.userData.art='astra-colossal-organism';group.userData.design='hollow-vault';
 const skin=new THREE.MeshStandardMaterial({color:sky?0x8a8176:0x9b9080,vertexColors:true,roughness:.77,metalness:.04,side:THREE.DoubleSide});skin.name='astra-presence-dermis';if(sky){skin.emissive.setRGB(.07,.014,.008);skin.emissiveIntensity=1;}
 const time={value:0};group.userData.animate=t=>{time.value=t;};
 skin.onBeforeCompile=s=>{s.uniforms.presenceTime=time;
  s.vertexShader='uniform float presenceTime;varying vec3 organismP;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   organismP=position;float load=smoothstep(.12,1.3,position.y);
   transformed.x+=load*.005*sin(presenceTime*.19+position.z*2.);
   transformed.y+=load*.0035*sin(presenceTime*.23-position.z*3.);`);
  s.fragmentShader='varying vec3 organismP;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float fold=sin(organismP.z*156.+sin(organismP.x*47.)*2.7+organismP.y*32.);
   float grain=sin(organismP.x*397.)*sin(organismP.y*311.)*sin(organismP.z*251.);
   diffuseColor.rgb*=.91+.075*fold+.035*grain;`);
 };skin.customProgramCacheKey=()=>'lastlight-hollow-vault-v2';
 const pieces=[{geo:trunk()}],add=geo=>pieces.push({geo});
 // Six unequal buttresses. Planted ends stay fixed; shoulders share the trunk's motion.
 const legs=[
  [[-.20,1.26,.85],[-.53,1.65,1.01],[-.91,.94,1.13],[-1.08,.30,.91],[-1.12,.008,.72]],
  [[-.25,1.30,.39],[-.68,1.48,.34],[-.96,.71,.19],[-1.14,.02,-.03]],
  [[-.13,1.24,-.12],[-.47,1.52,-.37],[-.79,.64,-.76],[-.88,.01,-.94]],
  [[.21,1.29,.74],[.45,1.39,.97],[.75,.58,1.15],[.90,.006,1.18]],
  [[.25,1.28,.22],[.66,1.60,.02],[1.01,.86,-.20],[1.08,.01,-.55]],
  [[.20,1.23,-.29],[.46,1.40,-.65],[.67,.65,-1.03],[.79,.01,-1.18]]
 ];
 for(const [i,l]of legs.entries()){
  add(tube(l,l.length===5?[.095,.083,.049,.027,.009]:[.092,.08,.039,.008],16,55));
  const tendon=l.map((p,j)=>[p[0]+(i<3?.025:-.025),p[1]-.028,p[2]+.021]);add(tube(tendon,l.length===5?[.025,.023,.020,.009,.002]:[.027,.021,.012,.002],9,38));
  const s=i<3?-1:1,a=l[0],b=l[1],c=[s*.12,1.12,a[2]+.22],d=[s*.19,.86,a[2]-.12];add(pleura(a,b,c,d));
  const foot=l.at(-1);for(const j of [-1,1])add(tube([l.at(-2),foot,[foot[0]+j*.075,.003,foot[2]-.10]],[.025,.012,.001],9,20));
 }
 // Three folded dorsal seams follow the spine; no ornamental spike crown.
 for(let i=0;i<3;i++){
  const z=.95-i*.34,s=i%2?-1:1;
  add(tube([[s*.11,1.25,z+.12],[s*.20,1.51,z],[s*.12,1.65-i*.025,z-.13],[.02,1.43,z-.35]],[.035,.045,.028,.006],12,36));
  add(pleura([s*.11,1.25,z+.12],[s*.12,1.65-i*.025,z-.13],[0,1.22,z+.10],[.02,1.39,z-.35]));
 }
 // The underslung keel leaves an open ribbed space under the torso.
 for(let i=0;i<7;i++){const z=.93-i*.20;for(const s of [-1,1])add(tube([[s*.22,1.22,z],[s*.29,1.05,z-.06],[s*.15,.81,z-.11],[.05,.74,z-.15]],[.026,.029,.017,.006],10,26));}
 const body=new THREE.Mesh(mergeArt(pieces),skin);body.name='presence-arched-carapace';body.castShadow=body.receiveShadow=true;group.add(body);
 // A deep folded funnel; parallax and self-occlusion survive a close look.
 const pos=[],cols=[],idx=[],N=48,R=12;
 for(let j=0;j<=R;j++)for(let i=0;i<=N;i++){const u=j/R,a=i/N*Math.PI*2,w=1-u*.88,fold=1+.065*Math.sin(a*7+u*8),x=.22+Math.cos(a)*.124*w*fold,y=.65+Math.sin(a)*.518*w*fold,z=-1.651+u*.43;
  pos.push(x,y,z);const c=.19*(1-u)+.016;cols.push(c,c*.55,c*.48);if(j<R&&i<N){const n=j*(N+1)+i;idx.push(n,n+1,n+N+1,n+1,n+N+2,n+N+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.setIndex(idx);g.computeVertexNormals();
 const cavity=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,side:THREE.DoubleSide}));cavity.name='presence-aperture-depth';group.add(cavity);
 const voidMesh=new THREE.Mesh(new THREE.CircleGeometry(.07,32),new THREE.MeshBasicMaterial({color:0x020102,side:THREE.DoubleSide}));voidMesh.position.set(.22,.65,-1.20);voidMesh.scale.set(.32,1,1);group.add(voidMesh);
 return group;
}
