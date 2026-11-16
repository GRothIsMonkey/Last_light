// Aftermath II: Oak Hollow Drive, August 2021. The world's own street and houses, ten years on (the art bible's dmg.F: rebuilt;
// same streets and lots; matured landscaping; traces of the past only where the story allows).
//
//  rebuilt    the houses the catastrophe took (Chapter Eight's own story houses and the shared damage map's torn, crushed and
//             burned lots) are gone: the merged originals are cut out with the same per-lot volumes Chapter Eight uses
//             (chapter8-town.js proxies, catastrophe-district.js records), and new houses stand on the same lots, built by the
//             world's own builder (houses.js) from new plans: the same footprints, driveways and walks, newer colours, younger
//             trees, a 2020-era car in some drives. Lots that were only partly damaged were repaired: they are the 2011 houses.
//  your house the house you left in October 2011, re-sided by the people who live there now.
//  the road   newer asphalt where the storm line opened the Drive (d 1047-1095), new curb and sidewalk panels on the side it took;
//             a newer square of pavement at Summerfield, where the intersection went down; the patch in front of Sam's.
//  traffic    a car now and then, driving the right side, slowing for people; one turns into a driveway.
//  lamps      the streetlights, which come on at the very end (rule four).
// Nothing here is supernatural. Nothing is under the ground.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {MAIN} from './terrain.js';
import {planHouse,buildHouse} from './houses.js';
import {createKit,createSpace,seeded,hashSeed} from './kit.js';
import {surfaceMaterial} from './materials.js';
import {makeCar} from './props.js';
import {homeOf} from './chapter6-home.js';
import {HOUSE} from './palette.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

// The lots that were lost, and what stands on them now. style: the new house's style (same footprint, garage, door and porch as
// the old one so the drive and the walk still meet it); wall/roof/door: newer colours than the street's 2011 palette.
export const REBUILT=[
 {id:'895w',u:895,side:-1,style:'colonial',wall:0xa9aea8,roof:0x3d3f42,door:0x2c3e50},
 {id:'907e',u:907.7,side:1,style:'ranch',wall:0xc9c4b6,roof:0x45484b,door:0x23282c},
 {id:'937e',u:937.4,side:1,style:'frontgable',wall:0x8e9a9e,roof:0x3a3c3f,door:0x7a3b2e},
 {id:'939w',u:939,side:-1,style:'colonial',wall:0xd8d4c8,roof:0x404346,door:0x2a2f35,story:'the Kowalskis’'},
 {id:'967e',u:967.4,side:1,style:'cape',wall:0x9ea79a,roof:0x45484a,door:0x3a4a3a},
 {id:'968w',u:968.5,side:-1,style:'ranch',wall:0xb6ada0,roof:0x3e4043,door:0x23282c},
 {id:'995e',u:995.2,side:1,style:'colonial',wall:0x7f8e97,roof:0x383a3d,door:0xe8e4da},
 {id:'1026w',u:1026,side:-1,style:'frontgable',wall:0xc4c2b9,roof:0x3c3e40,door:0x2c3e50,story:'the Kesslers’'},
 {id:'1026e',u:1025.9,side:1,style:null,wall:0xb3b8b2,roof:0x414447,door:0x6b2f2a,story:'the Hendersons’'},
 {id:'1052w',u:1052.3,side:-1,style:'colonial',wall:0xd2cdbf,roof:0x3b3d40,door:0x1f2326},
 {id:'1081w',u:1081.1,side:-1,style:'ranch',wall:0x99a3a6,roof:0x404244,door:0x2c3e50},
 {id:'1081e',u:1081.5,side:1,style:'frontgable',wall:0xbab3a5,roof:0x3d3f42,door:0x2a2f35},
 {id:'1110w',u:1110.2,side:-1,style:'colonial',wall:0x8f9b93,roof:0x3e4043,door:0xe8e4da},
 {id:'1114e',u:1114.2,side:1,style:'ranch',wall:0xcfcabd,roof:0x45484b,door:0x7a3b2e},
];
// Your house: the same house, a different colour (blue now), a different door; somebody else's car in the drive.
export const YOUR_HOUSE={id:'home',wall:0x7d93a6,roof:null,door:0xf2efe6,shutters:0x2b2f33};
const KINDS=['suv','suv','sedan','wagon','pickup','suv'];
const CAR21=[0x2e3a46,0x8a8f92,0xd9dad6,0x4a2f2c,0x1d2023,0x6d7a86,0xb8b2a6,0x3e4a3c];

export function createTown2021({scene,world,nav,ch8,ambient}){
 const root=new THREE.Group();root.name='a2-town';
 const KT=createKit(),ruin=ch8?.ruin,T8=ch8?.SC?.STREET?.town||null;
 const SP=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)+dy};};
 const houseAt=(u,side)=>world.houses.filter(h=>h.frameId==='main'&&h.side===side&&!h.far).sort((a,b)=>Math.abs(a.u-u)-Math.abs(b.u-u))[0];
 const ST={built:false,on:false,log:[],houses:[],cuts:[],lamps:false,lampT:0,errors:[]};
 const mat=(c,o={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.9,...o});m.name='a2-town';return m;};
 // ---- a world-building context for the house builder, at runtime (houses.js reads only these) -------------------------------------
 const darkGlass=new THREE.MeshStandardMaterial({color:0x4d5a62,roughness:.3,metalness:.15});
 const foliage=new Map();
 const WR=()=>({K:createKit(),scene,surfaceMaterial,windowMats:world.windowMats,porchMats:world.porchMats,darkGlass,alexWindow:world.alexWindow||darkGlass,space:createSpace(),obstacles:[],houses:[],farHouses:[],
  homes:{},hoops:[],interiors:{},baked:[],drives:[],cuts:[],plans:[],sidePlans:[],sideFrames:world.sideFrames,lotRand:(...n)=>seeded(hashSeed(...n)),houseAnchor:()=>null,
  foliageMat:(c,cutout=false,map=null)=>{const key=c+':'+cutout;if(!foliage.has(key))foliage.set(key,new THREE.MeshStandardMaterial({color:c,map:cutout?map:null,alphaTest:cutout?.35:0,side:cutout?THREE.DoubleSide:THREE.FrontSide,roughness:1}));return foliage.get(key);},
  drape:()=>new THREE.Group()});
 // ---- merging what is built here the way the world merges its own (one vertex-coloured material per surface kind) -----------------
 const BATCH=new Map(),batches=[];
 const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};let hk=0;
 function batchMat(m){if(world.windowMats.includes(m)||m===darkGlass)return world.glassLit||m;if(world.porchMats.includes(m))return world.porchLit||m;
  if(!m.isMeshStandardMaterial||m.transparent||m.map||m.emissive?.getHex()!==0||m.userData.keep||m.vertexColors)return m;
  const kind=m.userData.surface||'',key=[m.roughness,m.metalness,m.side,kind,m.alphaTest,m.polygonOffset].join(':');
  if(!BATCH.has(key)){let b=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:m.roughness,metalness:m.metalness,side:m.side,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits});
   if(kind)b=surfaceMaterial(b,kind);b.name='a2-batch-'+(kind||'plain');BATCH.set(key,b);}return BATCH.get(key);}
 const bins=new Map();
 function collect(group){group.updateMatrixWorld(true);const meshes=[];group.traverse(o=>{if(o.isMesh&&o.visible!==false)meshes.push(o);});
  for(const o of meshes){const src=o.material;if(Array.isArray(src))continue;const bm=batchMat(src);
   const vc=bm.vertexColors,glassish=bm===world.glassLit||bm===world.porchLit;
   const col=src===darkGlass?[9,0,0]:world.windowMats.includes(src)?[.12+hash(hk++)*.46,0,0]:world.porchMats.includes(src)?[.22+hash(hk++)*.4,0,0]:[src.color?.r??1,src.color?.g??1,src.color?.b??1];
   let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(!g.attributes.normal)g.computeVertexNormals();
   const key=bm.uuid+(o.castShadow===false?':ns':'');if(!bins.has(key))bins.set(key,{m:bm,p:[],n:[],c:[],uv:[],shadow:o.castShadow!==false&&!glassish,useUV:!!bm.map});const B=bins.get(key);
   const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;for(let i=0;i<P.count;i++){B.p.push(P.getX(i),P.getY(i),P.getZ(i));B.n.push(N.getX(i),N.getY(i),N.getZ(i));if(vc||glassish)B.c.push(col[0],col[1],col[2]);if(B.useUV)B.uv.push(U?U.getX(i):0,U?U.getY(i):0);}
   g.dispose();}}
 function flush(){for(const B of bins.values()){if(!B.p.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.n,3));
   if(B.c.length)g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));if(B.useUV)g.setAttribute('uv',new THREE.Float32BufferAttribute(B.uv,2));g.computeBoundingSphere();
   const m=new THREE.Mesh(g,B.m);m.name='a2-rebuilt-'+(B.m.name||'m');m.castShadow=B.shadow;m.receiveShadow=true;root.add(m);batches.push(m);}bins.clear();}
 // ---- one new house on an old lot ---------------------------------------------------------------------------------------------------
 function cutFor(Q){// the volume Chapter Eight already uses for this house, or a new one of the same shape
  for(const X of Object.values(T8?.proxies||{}))if(X?.Q===Q&&X.cut)return {c:X.cut,shared:true};
  for(const r of T8?.district?.records||[])if(r.X?.Q===Q&&r.X.cut)return {c:r.X.cut,shared:true};
  if(!ruin?.addCut)return null;const W2=Q.w/2,D2=Q.depth/2,gxs=Q.hasGarage?[Q.gx-Q.gw/2-.3,Q.gx+Q.gw/2+.3]:[0,0],xa=Math.min(-W2-.9,gxs[0]),xb=Math.max(W2+.9,gxs[1]),za=-D2-.7,zb=D2+(Q.pdep??1.4)+.9,hy=Q.h+(Q.rise??2)+2.2,o=Q.toWorld(0,0),c=Q.toWorld((xa+xb)/2,(za+zb)/2);
  return {c:ruin.addCut(0,{x:c.x,y:o.ground+.06+hy/2,z:c.z,sx:(xb-xa)/2,sy:hy/2,sz:(zb-za)/2,rot:Q.worldRot,physical:true}),shared:false};}
 function rebuild(spec,Q,{same=false}={}){const W=WR(),rand=seeded(hashSeed(2021,Math.round(Q.u*10),Q.side));
  const opts={frame:MAIN,frameId:'main',u:Q.u,side:Q.side,setback:Q.setback,w:Q.w,depth:Q.depth,doorX:Q.doorX,garage:Q.hasGarage,gs:Q.gs,gw:Q.gw,porch:Q.porch,porchW:Q.porchW,lod:'full',
   wall:spec.wall,roofColor:spec.roof??Q.roofColor,door:spec.door??Q.door,garageColor:0xf2f0ea,shutters:spec.shutters===undefined?null:spec.shutters,brick:null,chimney:same?Q.chimney:null,leadWalk:false};
  if(same){opts.style=Q.style;opts.roof=Q.roof;opts.garageInset=Q.front-Q.gfront;}else{opts.style=spec.style||Q.style;if(opts.style!==Q.style)opts.roof=null;}
  if(opts.roof===null)delete opts.roof;
  const P=planHouse(rand,opts);
  buildHouse(W,P);
  const hold=new THREE.Group();hold.name='a2-house-'+spec.id;const o=Q.toWorld(0,0);hold.position.set(o.x,o.ground,o.z);hold.rotation.y=Q.worldRot;P.g.removeFromParent();P.g.position.set(0,0,0);P.g.rotation.set(0,0,0);hold.add(P.g);
  // the new garden: a young tree with a stake, fresh mulch, a mailbox at the curb (not on your old house: they kept the maple)
  if(!same){const yard=new THREE.Group();hold.add(yard);const tx=(Q.hasGarage?-Q.gs:1)*(Q.w*.25),tz=Q.depth/2+(Q.setback-Q.depth/2)*.55;
   try{const tg=new THREE.Group();tg.position.set(tx,0,tz);yard.add(tg);world.vegBuild(tg,seeded(hashSeed(77,Math.round(Q.u))),{size:.42+rand()*.12,kind:rand()<.5?'maple':'oak',lod:'full'});}catch(e){ST.errors.push('tree '+spec.id+': '+e.message);}
   KT.box(yard,tx+.14,.8,tz,.04,1.6,.04,0x8a6a48);KT.box(yard,tx,.02,tz,1.5,.04,1.5,HOUSE.mulch);
   const mx=(Q.doorX??0)+(Q.hasGarage?-Q.gs*1.4:1.4),mz=Q.setback-5.6;KT.box(yard,mx,.55,mz,.1,1.1,.1,0x2a2c2e);KT.rbox(yard,mx,1.15,mz,.22,.24,.46,.05,0x23262a);}
  root.add(hold);collect(hold);hold.removeFromParent();
  // a car of the decade in some drives
  if(Q.hasGarage&&(same||rand()<.62)){const cg=new THREE.Group();const kind=same?'suv':KINDS[Math.floor(rand()*KINDS.length)],color=same?0x8a2f2b:CAR21[Math.floor(rand()*CAR21.length)];makeCar(KT,cg,kind,color);
   const q=Q.toWorld(Q.gx,Q.depth/2+3.4),b=Q.toWorld(Q.gx,Q.depth/2+8);cg.position.set(q.x,nav.groundY(q.x,q.z),q.z);cg.rotation.y=-Math.atan2(b.x-q.x,-(b.z-q.z))+Math.PI;root.add(cg);collect(cg);cg.removeFromParent();
   ST.cars.push({x:q.x,z:q.z,r:2.6});}
  const cut=cutFor(Q);if(cut)ST.cuts.push(cut);ST.houses.push({id:spec.id,u:Q.u,side:Q.side,style:P.style,story:spec.story||null,at:{x:o.x,z:o.z},plan:P,old:Q});return P;}
 // ---- what else is different: Jamie's house (somebody else's now), your old house (somebody's kid) -----------------------------------------
 function carInDrive(Q,kind,color){const cg=new THREE.Group();makeCar(KT,cg,kind,color);const q=Q.toWorld(Q.hasGarage?Q.gx:Q.drivX??0,Q.depth/2+3.4),b=Q.toWorld(Q.hasGarage?Q.gx:Q.drivX??0,Q.depth/2+8);
  cg.position.set(q.x,nav.groundY(q.x,q.z),q.z);cg.rotation.y=-Math.atan2(b.x-q.x,-(b.z-q.z))+Math.PI;root.add(cg);collect(cg);cg.removeFromParent();ST.cars.push({x:q.x,z:q.z,r:2.6});}
 function extras(){
  // Jamie's: a different car in the drive; a summer wreath on the red door (not hers)
  const JH=world.homes?.jamie;
  if(JH){carInDrive(JH,'suv',0x8a8f92);
   const f=new THREE.Group(),wr=new THREE.Group(),wq=JH.toWorld(JH.doorX??0,JH.depth/2+.15);wr.position.set(wq.x,wq.ground+(JH.floor??.45)+1.47,wq.z);wr.rotation.y=JH.worldRot;f.add(wr);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.19,.045,7,22),mat(0x4f6b3a,{roughness:1}));wr.add(ring);
   for(let i=0;i<9;i++){const a=i/9*Math.PI*2+.3,c=[0xd98aa0,0xf0e2b0,0xe9b04a][i%3],fl=new THREE.Mesh(new THREE.SphereGeometry(.03,7,5),mat(c,{roughness:.9}));fl.position.set(Math.cos(a)*.19,Math.sin(a)*.19,.035);wr.add(fl);}
   const bow=new THREE.Mesh(new THREE.BoxGeometry(.1,.05,.02),mat(0xe8e2d0,{roughness:.9}));bow.position.set(0,-.2,.045);wr.add(bow);
   root.add(f);collect(f);f.removeFromParent();ST.jamie={car:true,wreath:true};}
  // your old house: a scooter dropped on the grass by the front walk, a hopscotch on the sidewalk past the drive (pink, fresh)
  const H=homeOf(world);
  if(H){const f=new THREE.Group(),sc=new THREE.Group();const x0=(H.doorX??0)+(H.hasGarage?-H.gs:1)*1.05,z0=H.depth/2+(H.pdep??1.4)+2.6,sq=H.toWorld(x0,z0);sc.position.set(sq.x,nav.groundY(sq.x,sq.z)+.06,sq.z);sc.rotation.set(0,H.worldRot+.7,0);f.add(sc);
    const tilt=new THREE.Group();tilt.rotation.z=1.42;sc.add(tilt);const deckM=mat(0x2a2c2f,{roughness:.6}),bodyM=mat(0x7ac043,{roughness:.5}),wheelM=mat(0x1a1b1d,{roughness:.8});
    const deck=new THREE.Mesh(new THREE.BoxGeometry(.12,.035,.52),bodyM);tilt.add(deck);const grip=new THREE.Mesh(new THREE.BoxGeometry(.105,.004,.42),deckM);grip.position.y=.019;tilt.add(grip);
    for(const z of [-.26,.27]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.03,12),wheelM);w.rotation.z=Math.PI/2;w.position.set(0,-.02,z);tilt.add(w);}
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.72,8),mat(0xb8bcc0,{metalness:.6,roughness:.35}));stem.position.set(0,.34,-.3);stem.rotation.x=.12;tilt.add(stem);
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.013,.013,.36,8),stem.material);bar.rotation.z=Math.PI/2;bar.position.set(0,.69,-.26);tilt.add(bar);for(const s2 of [-1,1]){const gp=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.09,8),deckM);gp.rotation.z=Math.PI/2;gp.position.set(s2*.16,.69,-.26);tilt.add(gp);}
    root.add(f);collect(f);f.removeFromParent();
    // the hopscotch: cells along the sidewalk just past the drive, on the house's side of the street
    const side=H.side||-1,d0=(H.drivD??H.u)+(H.drivW??3.4)/2+1.1,lat=side*7.1,pts=[];const cells=[[0,0],[0,1],[-.5,2],[.5,2],[0,3],[-.5,4],[.5,4],[0,5],[0,6]];
    const P3=(d,l)=>{const p=groundPoint(d,l);return [p.x,world.groundY(d,l)+.174,p.z];};
    for(const [cx,cz] of cells){const a=d0+cz*.5,b=a+.5,l0=lat+(cx-.25)*side,l1=lat+(cx+.25)*side;const c=[P3(a,l0),P3(b,l0),P3(b,l1),P3(a,l1)];for(let i=0;i<4;i++)pts.push(...c[i],...c[(i+1)%4]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const ln=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xf2b5c4}));ln.name='a2-hopscotch';root.add(ln);ST.home2021={scooter:true,hopscotch:true};}}
 // the chalk at the end of the street in 2011 (the four of you's: the sun, the initials, the hopscotch) washed away a long time ago. The
 // world draws all its chalk as a few merged line batches; while 2021 is shown, the segments lying on the ground at the end of the street
 // are folded to nothing (their places kept), and put back exactly when it is not. Nothing else (wires, other chalk) is touched.
 const CHALK={folded:null};
 function oldChalk(restore){if(restore){for(const F of CHALK.folded||[]){const A=F.attr;for(let k=0;k<6;k++)A.array[F.i*6+k]=F.o[k];A.needsUpdate=true;}CHALK.folded=null;return;}
  if(CHALK.folded)return;CHALK.folded=[];const corners=[SP(1124,-13),SP(1124,13),SP(1164,-13),SP(1164,13)],x0=Math.min(...corners.map(c=>c.x))-2,x1=Math.max(...corners.map(c=>c.x))+2,z0=Math.min(...corners.map(c=>c.z))-2,z1=Math.max(...corners.map(c=>c.z))+2;
  for(const o of scene.children){if(!o.isLineSegments||o.parent!==scene||o.name)continue;// (the world's own merged batches are unnamed; the ending's clue is named, and left alone)
  const A=o.geometry?.attributes?.position;if(!A)continue;const arr=A.array;let any=false;
   for(let i=0;i<A.count/2;i++){const j=i*6,mx=(arr[j]+arr[j+3])/2,my=(arr[j+1]+arr[j+4])/2,mz=(arr[j+2]+arr[j+5])/2;if(mx<x0||mx>x1||mz<z0||mz>z1)continue;
    const L=nav.locate?.(mx,mz);if(!L||L.street!=='main'||L.d<1124||L.d>1164)continue;if(Math.abs(my-world.groundY(L.d,L.lat))>.35)continue;
    CHALK.folded.push({attr:A,i,o:Array.from(arr.slice(j,j+6))});arr[j+3]=arr[j];arr[j+4]=arr[j+1];arr[j+5]=arr[j+2];any=true;}
   if(any)A.needsUpdate=true;}
  ST.chalkFolded=CHALK.folded.length;}
 // ---- the road ---------------------------------------------------------------------------------------------------------------------
 const asphaltNew=surfaceMaterial(mat(0x4a4d50,{roughness:.96,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),'asphalt');asphaltNew.name='a2-asphalt-new';
 const concreteNew=surfaceMaterial(mat(0xcfcac0,{roughness:.9,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),'concrete');concreteNew.name='a2-concrete-new';
 const sod=mat(0x5f7a3c,{roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});sod.name='a2-sod';
 const seamM=mat(0x262626,{roughness:.45,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});seamM.name='a2-seam';// (tar sealant: a thin dark line where new meets old)
 const paintM=mat(0xe9e4d2,{roughness:.7,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});paintM.name='a2-paint';
 // a strip draped on the street's own ground, d0..d1 by lat0..lat1 (in street coordinates), lift metres above it
 function strip(g,d0,d1,l0,l1,m,{lift=.012,step=1.5,stepL=1}={}){const nu=Math.max(1,Math.ceil((d1-d0)/step)),nv=Math.max(1,Math.ceil((l1-l0)/stepL)),pos=[],uv=[],idx=[];
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const d=lerp(d0,d1,i/nu),l=lerp(l0,l1,j/nv),p=groundPoint(d,l);pos.push(p.x,world.groundY(d,l)+lift,p.z);uv.push(d*.25,l*.25);if(i<nu&&j<nv){const a=i*(nv+1)+j;idx.push(a,a+1,a+nv+1,a+1,a+nv+2,a+nv+1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  // (wound so the face looks up whichever way the street turns)
  if(geo.attributes.normal.getY(0)<0){for(let t=0;t<idx.length;t+=3){const x=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=x;}geo.setIndex(idx);geo.computeVertexNormals();}
  const m2=new THREE.Mesh(geo,m);m2.receiveShadow=true;m2.name='a2-strip-'+(m.name||'');g.add(m2);return m2;}
 function road(){const g=new THREE.Group();g.name='a2-road';
  // the storm line: the Drive from 1047 to 1095 repaved curb to curb on its west half, a seam where the new meets the old
  strip(g,1047,1095,-4.7,3.25,asphaltNew);strip(g,1046.95,1047.05,-4.7,3.25,seamM,{lift:.016,step:.1});strip(g,1094.95,1095.05,-4.7,3.25,seamM,{lift:.016,step:.1});strip(g,1047,1095,3.2,3.28,seamM,{lift:.016,stepL:.08});
  // new curb and sidewalk panels on the west side, new sod where the yards were regraded
  strip(g,1047,1095,-5.0,-4.7,concreteNew,{lift:.02,stepL:.3});strip(g,1047,1095,-7.85,-6.35,concreteNew,{lift:.015,stepL:.5});
  for(let d=1048.5;d<1095;d+=1.5)strip(g,d,d+.04,-7.85,-6.35,seamM,{lift:.02,step:.04,stepL:.5});
  strip(g,1048,1094,-15,-8.2,sod,{lift:.02,step:2,stepL:1.4});
  // Summerfield: the intersection, a newer square of pavement and fresh crosswalk paint
  strip(g,861,883,-4.7,4.7,asphaltNew);for(const d of [861,883])strip(g,d-.05,d+.05,-4.7,4.7,seamM,{lift:.016,step:.1});
  for(let l=-4;l<4.2;l+=1.1)strip(g,858.6,860.4,l,l+.55,paintM,{lift:.018,step:.9,stepL:.55});
  // in front of Sam's: where the road went down at 1019, a patch
  strip(g,1010,1029,-1.8,4.7,asphaltNew);for(const d of [1010,1029])strip(g,d-.05,d+.05,-1.8,4.7,seamM,{lift:.016,step:.1});strip(g,1010,1029,-1.85,-1.77,seamM,{lift:.016,stepL:.08});
  // the Hendersons' front yard, regraded and re-seeded (it went into the ground)
  strip(g,1014,1036,7.9,15.5,sod,{lift:.02,step:2,stepL:1.4});
  root.add(g);ST.road=g;}
 // ---- build once ---------------------------------------------------------------------------------------------------------------------
 function build(){if(ST.built)return;ST.built=true;ST.cars=[];const t0=performance?.now?.()??0;
  for(const spec of REBUILT){const Q=houseAt(spec.u,spec.side);if(!Q||Math.abs(Q.u-spec.u)>14){ST.errors.push('no lot at '+spec.id);continue;}
   try{rebuild(spec,Q,{same:spec.style===null});}catch(e){ST.errors.push('house '+spec.id+': '+e.message);}}
  {const Q=homeOf(world);if(Q)try{ST.home=rebuild(YOUR_HOUSE,Q,{same:true});ST.homeQ=Q;}catch(e){ST.errors.push('home: '+e.message);}}
  try{extras();}catch(e){ST.errors.push('extras: '+e.message);}
  flush();road();
  ST.buildMs=Math.round((performance?.now?.()??0)-t0);}
 // ---- traffic: a car now and then (driving on the right; it slows for anyone in its way; one may turn into a drive and park) ---------
 const TRAFFIC=[0,1].map(i=>{const g=new THREE.Group();g.name='a2-traffic-'+i;const C=makeCar(KT,g,i?'suv':'sedan',i?0x6d7a86:0x2e3a46,{lights:false});g.visible=false;root.add(g);return {g,i,C,on:false,d:0,v:0,dir:1,lat:2.1,to:0,park:null,parked:false,wheel:0,x:0,z:0};});
 function drive(i,{from,to,dir=from<to?1:-1,v=8.5,park=null}={}){const T=TRAFFIC[i];Object.assign(T,{on:true,d:from,to,dir,v:0,vmax:v,park,parked:false,lat:dir>0?2.15:-2.15,turn:0});T.g.visible=true;placeCar(T,0);return T;}
 function placeCar(T,dt){let q=SP(T.d,T.lat),a=heading(T.d)+(T.dir>0?0:Math.PI);
  if(T.turn>0&&T.park){const P2=T.park,u=smooth(T.turn),dp=SP(P2.d,P2.lat);q={x:lerp(q.x,dp.x,u),z:lerp(q.z,dp.z,u),y:lerp(q.y,dp.y,u)};a=a+wrap2((P2.a??a)-a)*u;}
  T.g.position.set(q.x,q.y,q.z);T.g.rotation.y=-a;T.x=q.x;T.z=q.z;T.a=a;T.wheel+=T.v*dt/.33;for(const w of T.C.wheels)w.rotation.x=T.dir>0?-T.wheel:T.wheel;}
 const wrap2=a=>Math.atan2(Math.sin(a),Math.cos(a));
 function updateTraffic(dt,people){for(const T of TRAFFIC){if(!T.on||T.parked)continue;
   // anyone in the lane ahead: slow, stop, wait
   const fx=Math.sin(T.a),fz=-Math.cos(T.a);let room=99;for(const p of people){if(!p)continue;const dx=p.x-T.x,dz=p.z-T.z,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(ahead>0&&side<2.1)room=Math.min(room,ahead);}
   const want=room<5.5?0:room<14?T.vmax*(room-5.5)/8.5:T.vmax;T.v=damp(T.v,want,want<T.v?3.2:.9,dt);
   if(T.park&&Math.abs(T.d-T.park.at)<.6&&T.turn===0)T.turn=.0001;
   if(T.turn>0){T.turn=Math.min(1,T.turn+dt*.42);T.v=Math.min(T.v,2.4);if(T.turn>=1){T.parked=true;T.v=0;T.engineOff=true;}}
   else T.d+=T.dir*T.v*dt;
   placeCar(T,dt);if(!T.park&&(T.dir>0?T.d>=T.to:T.d<=T.to)){T.on=false;T.g.visible=false;}}}
 // ---- the streetlights: off by day; at the end they come on, one after another (ambient.js's own lamps, by override) -------------------
 function lampsOn(on){ST.lamps=on;ST.lampT=0;if(!on)ambient?.lampOverride?.clear?.();}
 function updateLamps(dt){if(!ST.lamps||!ambient?.lamps)return;ST.lampT+=dt;const list=ambient.lamps();for(const l of list){if(l.frame&&l.frame!=='main'&&l.frame!==0)continue;
   const delay=((l.i*37)%11)*.18+Math.max(0,1162-(l.d??1000))*.004,t=ST.lampT-delay;let v=0;if(t>0)v=t<.22?(Math.sin(t*80+l.i)>.1?.45:.04):Math.min(1,.4+t*.8);ambient.lampOverride.set(l.i,v);}}
 // ---- every frame --------------------------------------------------------------------------------------------------------------------
 // the end of the street's 2011 chalk and what the Prologue's ending keeps there (ending.js: the four riders, the AR clue, the other
 // bike): none of it is there in 2021. The ending's own per-frame logic runs before the chapter's, so this hides them after it, every frame.
 const END={found:false,drawing:null,clue:null,bike:null};
 function endingAway(on){if(!END.found){END.found=true;END.drawing=scene.getObjectByName('remembered-riders');END.clue=scene.getObjectByName('last-chalk');END.bike=scene.getObjectByName('the-other-bike');}
  if(on){for(const o of [END.drawing,END.clue,END.bike])if(o)o.visible=false;END.hid=true;}else if(END.hid){END.hid=false;if(END.drawing)END.drawing.visible=true;}}// (the riders are always shown otherwise; the clue and the bike are the ending's own to show)
 function update(dt,{people=[]}={}){if(!ST.on)return;endingAway(true);updateTraffic(dt,people);updateLamps(dt);}
 function sources(out){if(!ST.on)return;for(const T of TRAFFIC)if(T.on&&!T.engineOff)out.push({id:'a2-car-'+T.i,kind:'idle',pos:new THREE.Vector3(T.x,.6,T.z),level:.35+T.v*.06});}
 function blockers(out){if(!ST.on)return;for(const T of TRAFFIC)if(T.on)out.push({x:T.x,z:T.z,r:2.4,speed:T.v});for(const c of ST.cars||[])out.push({x:c.x,z:c.z,r:1.4,speed:0});}
 function show(on){if(on){build();if(!root.parent)scene.add(root);for(const c of ST.cuts)c.c.on=true;}else{if(root.parent)root.removeFromParent();for(const c of ST.cuts)c.c.on=false;}ST.on=on;oldChalk(!on);endingAway(on);try{ruin?.syncCuts?.();}catch(e){ST.errors.push('cuts: '+e.message);}}
 function reset(){for(const T of TRAFFIC){T.on=false;T.parked=false;T.engineOff=false;T.g.visible=false;}lampsOn(false);show(false);}
 return {root,show,update,sources,blockers,reset,drive,lampsOn,SP,houseAt,TRAFFIC,ST,REBUILT,
  state:()=>({on:ST.on,built:ST.built,jamie:ST.jamie||null,home2021:ST.home2021||null,chalkFolded:ST.chalkFolded??null,houses:ST.houses.map(h=>({id:h.id,u:h.u,side:h.side,style:h.style,story:h.story})),cuts:ST.cuts.length,cutsOn:ST.cuts.filter(c=>c.c.on).length,batches:batches.length,errors:ST.errors.slice(),buildMs:ST.buildMs,lamps:ST.lamps,
   traffic:TRAFFIC.map(T=>({on:T.on,d:+T.d.toFixed(1),v:+T.v.toFixed(2),parked:T.parked}))})};
}
