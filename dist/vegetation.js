// Trees and shrubs. Every crown hangs from a branch that grows out of the trunk,
// trunks flare into the ground, and each tree is placed whole (never bent by the
// street), so nothing is sliced, stretched or left floating.
// LOD: 'full' airy leaf cards near the street, 'mid' fewer cards, 'far' low blobs.
import * as THREE from './three.module.js';
import {leafGeometry,leafGeometrySmall,leafTexture} from './materials.js';
import {FOLIAGE} from './palette.js';
import {pickFrom,seeded,hashSeed} from './kit.js';

export function createVegetation(W){
 const {K}=W,leaf=c=>W.foliageMat(c,true,leafTexture),solid=c=>W.foliageMat(c,false);
 const blob=new THREE.IcosahedronGeometry(1,1),flat=new THREE.IcosahedronGeometry(1,0);
 function crown(g,x,y,z,R,c,rand,lod,a){
  if(lod==='far'){const m=new THREE.Mesh(flat,solid(c));m.position.set(x,y,z);m.scale.set(R*1.05,R*.85,R*1.05);m.rotation.y=a;g.add(m);return;}
  const cr=new THREE.Mesh(lod==='full'?leafGeometry:leafGeometrySmall,leaf(c));cr.position.set(x,y,z);cr.scale.set(R,R*.8,R);cr.rotation.y=a;g.add(cr);
  const tufts=lod==='full'?2:1;for(let j=0;j<tufts;j++){const b=a+j*2.1+rand(),t=new THREE.Mesh(leafGeometrySmall,leaf(c));t.position.set(x+Math.cos(b)*R*.72,y+Math.sin(b*2)*R*.3,z+Math.sin(b)*R*.72);t.scale.set(R*.45,R*.38,R*.45);t.rotation.y=b;g.add(t);}
 }
 // Build a tree in local coordinates (ground at y = 0) under group g.
 function build(g,rand,{size=1,kind='maple',lod='full'}){
  const pick=pickFrom(rand),bark=pick(FOLIAGE.bark),leafC=pick(FOLIAGE.leaves);
  // Far trees: a trunk and two or three low-poly masses, enough for a skyline in haze.
  if(lod==='far'){const H=(kind==='pine'?6.5:4)*size;K.cyl(g,0,H/2-.3,0,.2*size,H+.6,bark,5);
   if(kind==='pine'){const c=pick(FOLIAGE.pines);for(let k=0;k<3;k++){const m=new THREE.Mesh(new THREE.ConeGeometry((2.2-k*.55)*size,2.6*size,6),solid(c));m.position.y=(2+k*1.6)*size;g.add(m);}return {trunk:.2*size,crown:2.2*size};}
   const c=pick(FOLIAGE.far);crown(g,0,H+1.2*size,0,2.1*size,c,rand,'far',rand()*3);crown(g,(rand()-.5)*2*size,H+.3*size,(rand()-.5)*2*size,1.6*size,c,rand,'far',rand()*3);return {trunk:.2*size,crown:2.2*size};}
  if(kind==='pine'){const H=7.5*size;K.lathe(g,[[.001,-.3],[.26*size,-.3],[.22*size,.2],[.17*size,.6],[.07*size,H]],0,0,0,bark,lod==='far'?5:7);
   const c=pick(FOLIAGE.pines),tiers=lod==='far'?3:5;for(let k=0;k<tiers;k++){const r=(2.4-k*(1.9/tiers))*size,m=new THREE.Mesh(new THREE.ConeGeometry(r,2.5*size,lod==='far'?6:8),solid(c));m.position.set(0,(1.9+k*(5.2/tiers))*size,0);m.rotation.y=rand()*3;g.add(m);}
   return {trunk:.26*size,crown:2.4*size};}
  if(kind==='birch'){const c=pick(FOLIAGE.leaves);for(let k=0;k<3;k++){const a=k*2.1+rand(),lean=.25+rand()*.2,H=(5.5+rand()*1.5)*size,top=[Math.cos(a)*lean*H*.25,H,Math.sin(a)*lean*H*.25];
    K.rod(g,[Math.cos(a)*.12,-.2,Math.sin(a)*.12],top,.09*size,0xe8e4da,.04*size,6);if(lod!=='far'){for(let j=0;j<3;j++){const t=.3+j*.22;K.box(g,top[0]*t,H*t,top[2]*t,.1*size,.03,.1*size,0x3a3632);}}
    crown(g,top[0],top[1]-.4*size,top[2],1.25*size,c,rand,lod,a);crown(g,top[0]*.6,top[1]*.72,top[2]*.6,1*size,c,rand,lod==='full'?'mid':lod,a+1);}
   return {trunk:.3*size,crown:2*size};}
  if(kind==='young'){const H=2.8*size;K.rod(g,[0,-.2,0],[0,H,0],.065,bark,.04);K.rod(g,[.28,-.2,0],[.28,1.4,0],.022,0x9c8a6a);K.rod(g,[.04,1.1,0],[.28,1.2,0],.008,0x2b2b2b);
   for(let k=0;k<3;k++){const a=k*2.1+rand(),x=Math.cos(a)*.35,z=Math.sin(a)*.35,y=H+(k===0?.2:-.2);if(k)K.rod(g,[0,H-.6,0],[x,y,z],.025,bark,.012);crown(g,x,y+.25,z,(.62+rand()*.2)*size,leafC,rand,lod,a);}
   return {trunk:.1,crown:1*size};}
  // Maple and oak: flared trunk, forked limbs, a crown cluster at the end of every limb.
  const oak=kind==='oak',wide=oak?1.35:1,trunkH=(oak?3.2:4.2)*size,tr=(oak?.36:.28)*size;
  const sides=6;K.lathe(g,[[.001,-.35],[tr*1.9,-.35],[tr*1.45,-.05],[tr*1.12,.25],[tr,.7],[tr*.8,trunkH*.75],[tr*.62,trunkH]],0,0,0,bark,sides);
  const n=oak?6:3,top=[0,trunkH,0];
  crown(g,0,trunkH+1.5*size,0,(1.6+rand()*.4)*size*(oak?1.15:1),leafC,rand,lod,0);
  for(let k=0;k<n;k++){const a=k/n*Math.PI*2+rand()*.8,reach=(1.7+rand()*.9)*size*wide,rise=(oak?.8:1.3+rand()*.8)*size,start=[0,trunkH*(.72+rand()*.2),0],end=[Math.cos(a)*reach,trunkH+rise,Math.sin(a)*reach];
   if(lod!=='far'){K.rod(g,start,end,(oak?.16:.11)*size,bark,(oak?.07:.05)*size,5);const mid=[end[0]*.55,end[1]-.2,end[2]*.55];K.rod(g,mid,[end[0]*.8+Math.sin(a)*.6,end[1]+.5*size,end[2]*.8-Math.cos(a)*.6],.05*size,bark,.025*size,4);}
   crown(g,end[0],end[1]+.35*size,end[2],(1.45+rand()*.7)*size*(oak?1.12:1),rand()<.3?pick(FOLIAGE.leaves):leafC,rand,lod,a);}
  if(oak&&lod!=='far')for(let k=0;k<5;k++){const a=k*1.3+rand();K.rod(g,[0,.35,0],[Math.cos(a)*size*1.1,-.12,Math.sin(a)*size*1.1],.13*size,bark,.03,5);}
  return {trunk:tr,crown:(1.7+2.2)*size*wide};
 }
 // Place on a street frame (rigid, upright) at an explicit ground height.
 function tree(frame,u,v,y,opts={}){const p=frame.point(u,v),rand=seeded(hashSeed(3,u,v)),r=opts.clearance??1.2*(opts.size??1);
  if(!opts.force&&!W.space.free(p.x,p.z,r))return null;const g=W.place(frame,u,v,{y,rot:rand()*6,far:opts.lod==='far'});const t=build(g,rand,opts);W.space.circle(p.x,p.z,Math.max(.4,t.trunk+.25),'tree');
  if(frame===W.MAIN)W.obstacles.push({d0:u-t.trunk-.2,d1:u+t.trunk+.2,l0:v-t.trunk-.2,l1:v+t.trunk+.2});return g;}
 function treeWorld(x,z,y,opts={}){const rand=seeded(hashSeed(4,x,z)),r=opts.clearance??1.2*(opts.size??1);if(!opts.force&&!W.space.free(x,z,r))return null;
  const g=W.placeWorld(x,z,y,rand()*6,true);const t=build(g,rand,{lod:'far',...opts});W.space.circle(x,z,Math.max(.4,t.trunk+.3),'tree');return g;}
 function shrub(g,x,z,r,rand){const pick=pickFrom(rand),c=pick(FOLIAGE.shrubs);K.ball(g,x,r*.75,z,r,solid(c),[1.2,.8,1.1]);if(r>.5)K.ball(g,x+r*.5,r*.55,z+r*.2,r*.62,solid(c),[1.1,.8,1]);}
 return {tree,treeWorld,build,shrub};
}
