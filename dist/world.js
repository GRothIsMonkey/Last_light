// The neighborhood: builds the static world, bakes it into world space, merges it by
// material and spatial cell, and answers gameplay ground queries.
//
// Three placement modes keep geometry honest on a curving street:
//  - bent:  ground-hugging surfaces (roads, curbs, sidewalks, lawns) follow a street
//           frame vertex by vertex, so they curve with the street.
//  - drape: houses keep a rigid rectangular footprint (linearized at their lot) but
//           their base follows the terrain, so nothing floats or clips.
//  - rigid: self-contained objects (trees, cars, props, background) are placed whole.
// Builders live in streets.js, houses.js, vegetation.js, props.js and background.js.
import * as THREE from './three.module.js';
import {leafGeometry,leafTexture,surfaceMaterial} from './materials.js';
import {ROAD_HALF,groundPoint,heading,roadFrame} from './route.js';
import {createKit,createSpace,seeded,hashSeed,smooth,clamp} from './kit.js';
import {MAIN,makeSideFrame,LAWN,SIDEWALK,CURB_TOP,knoll,terrainY} from './terrain.js';
import {JUNCTIONS,BULB,ROAD_END,LOOKOUT,SECTION} from './layout.js';
import {buildStreets} from './streets.js';
import {planLots,buildHouses} from './houses.js';
import {buildYards} from './props.js';
import {buildBackground} from './background.js';
import {easementFrame,buildEasement} from './easement.js';
import {basinFrame,buildBasin} from './basin.js';

export {JUNCTIONS,BULB,ROAD_END,LOOKOUT} from './layout.js';
export {LAWN,SIDEWALK,CURB_TOP,knoll,roadCrown} from './terrain.js';

export function buildWorld(scene){
 const K=createKit(),rand=seeded(2011);
 const sideFrames=JUNCTIONS.map(makeSideFrame);
 // Build context shared by every builder.
 const W={K,scene,rand,surfaceMaterial,grassMats:[],hoops:[],lotRand:(...n)=>seeded(hashSeed(...n)),MAIN,sideFrames,space:createSpace(),
  pads:[],obstacles:[],drives:[],houses:[],farHouses:[],homes:{},streetLamps:[],foliage:[],lights:{},named:{},
  layers:[],windowMats:[...Array(8)].map(()=>new THREE.MeshStandardMaterial({color:0x5b6870,emissive:0xffb45a,emissiveIntensity:.08,roughness:.35,metalness:.1})),
  porchMats:[...Array(6)].map(()=>new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:.05})),
  darkGlass:new THREE.MeshStandardMaterial({color:0x4d5a62,roughness:.3,metalness:.15}),
  farWindow:new THREE.MeshStandardMaterial({color:0x56626a,emissive:0xffb45a,emissiveIntensity:.05,roughness:.4})};
 // Layer factories. Children of a bent/drape group are authored in street coordinates
 // (x = lateral, z = -distance, y = height above that frame's ground).
 // Window glass and porch lights: many logical materials (for variety in when they come on),
 // drawn through one shader each. The switch-on point of each rides along as a vertex color.
 const hashF=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 W.windowOn=W.windowMats.map((_,i)=>.08+hashF(i*2.7)*.5);W.porchOn=W.porchMats.map((_,i)=>.2+hashF(i*5.1)*.42);
 W.glassLit=litMaterial(0x5b6870,0xffb45a,{rough:.35,metal:.1,span:.25,base:.08,gain:1.05,night:.15});
 W.porchLit=litMaterial(0xfff0c8,0xffc070,{rough:.9,metal:0,span:.06,base:.05,gain:1.6,night:0});
 W.lampLit=lampMaterial();// all streetlight heads; each one's level comes from a uniform array
 W.bent=(frame=MAIN,opts={})=>{const g=new THREE.Group();W.layers.push({mode:'bent',frame,group:g,...opts});return g;};
 W.drape=(frame,u0,opts={})=>{const g=new THREE.Group();W.layers.push({mode:'drape',frame,u0,group:g,...opts});return g;};
 const rigidRoot=new THREE.Group(),farRoot=new THREE.Group();W.layers.push({mode:'rigid',group:rigidRoot},{mode:'rigid',group:farRoot,far:true});
 W.baked=[];// meshes already in world coordinates
 // Rigid placement at a street position, standing on the given height (absolute).
 W.place=(frame,u,v,{rot=0,y=null,lift=0,far=false}={})=>{const p=frame.point(u,v),g=new THREE.Group();g.position.set(p.x,(y??p.y)+lift,p.z);g.rotation.y=-frame.heading(u)+rot;(far?farRoot:rigidRoot).add(g);return g;};
 W.placeWorld=(x,z,y,rot=0,far=true)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;(far?farRoot:rigidRoot).add(g);return g;};
 W.foliageMat=(()=>{const cache=new Map();return (c,cutout=false,map=null)=>{const key=c+':'+cutout;if(!cache.has(key)){const m=new THREE.MeshStandardMaterial({color:c,map:cutout?map:null,alphaTest:cutout?.35:0,side:cutout?THREE.DoubleSide:THREE.FrontSide,roughness:1});cache.set(key,m);W.foliage.push(m);}return cache.get(key);};})();
 W.reserve=(d0,d1,l0,l1)=>W.obstacles.push({d0:Math.min(d0,d1),d1:Math.max(d0,d1),l0:Math.min(l0,l1),l1:Math.max(l0,l1),soft:true});
 W.pad=(d0,d1,l0,l1,y)=>W.pads.push({d0:Math.min(d0,d1),d1:Math.max(d0,d1),l0:Math.min(l0,l1),l1:Math.max(l0,l1),y});

 W.easement=easementFrame(W);// Chapter Two's drainage easement: its ground leaves holes in the older ground
 W.basin=basinFrame(W);// Chapter Three's access drive and detention basin, downstream of the culvert (same idea)
 W.plans=planLots(W);// every first-row lot decided up front: streets need the driveway cuts
 buildStreets(W);// surfaces, curbs, sidewalks, junctions, cul-de-sac, lookout ground
 buildHouses(W);// first-row houses, friend homes and their interiors, driveways, walks
 buildYards(W);// trees, cars, yard props, fences, street furniture, utility network, signs
 buildEasement(W);// behind the creek's back fence: channel, path, culvert, power line, brush
 buildBasin(W);// behind the yards past Alex's house: the old pond road, the gate, the basin and the outlet
 buildBackground(W);// back yards, second row, side-street houses, far neighborhood and land

 const {merged,originals,shadowProxies}=bakeAndMerge(W,scene);

 // Surface height queries for riders and walkers ------------------------------------------
 // Only Oak Hollow's houses matter to riders and walkers (side-street houses live in their own frames).
 const houseIndex=new Map();for(const h of W.houses){if(!h.localPads?.length||h.frameId!=='main')continue;const k=Math.floor(h.dc/20);for(let i=k-2;i<=k+2;i++){if(!houseIndex.has(i))houseIndex.set(i,[]);houseIndex.get(i).push(h);}}
 function authoredY(d,lat){
  let best=null;
  for(const h of houseIndex.get(Math.floor(d/20))||[]){if(Math.sign(lat)!==h.side)continue;const q=h.localOf(d,lat);for(const p of h.localPads)if(q.x>=p.x0&&q.x<=p.x1&&q.z>=p.z0&&q.z<=p.z1){const y=typeof p.y==='function'?p.y(q.x,q.z):p.y;if(best===null||y>best)best=y;}}
  for(const p of W.pads)if(d>=p.d0&&d<=p.d1&&lat>=p.l0&&lat<=p.l1){const y=typeof p.y==='function'?p.y(d,lat):p.y;if(best===null||y>best)best=y;}
  if(best!==null)return best;
  for(const dr of W.drives)if(dr.contains(d,lat))return dr.y(d,lat);
  return W.surfaceY(d,lat);
 }
 const groundY=(d,lat)=>groundPoint(d,lat).y+authoredY(d,lat);

 // Dynamic pieces placed in the finished world ------------------------------------------------
 function anchor(d,lat,y=0){const g=new THREE.Group(),p=groundPoint(d,lat);g.position.set(p.x,p.y+y,p.z);g.rotation.y=-heading(d);scene.add(g);return g;}
 function houseAnchor(h,x,z,y=0){const w=h.toWorld(x,z),r=new THREE.Group(),root=new THREE.Group();root.position.set(w.x,w.ground+y,w.z);root.rotation.y=h.worldRot;scene.add(root);root.add(r);const s=h.S(x,z);return {root,g:r,d:s.d,lat:s.lat};}
 W.anchor=anchor;W.houseAnchor=houseAnchor;
 const {doors,garages,windows,sideDoors}=W.makeDynamic(W);

 return {scene,road:W.named.road,originals,merged,windowMats:W.windowMats,porchMats:W.porchMats,streetLamps:W.streetLamps,foliage:W.foliage,grassMat:W.grassMat,grassMats:W.grassMats,
  groundY,authoredY,rideable:W.rideable,obstacles:W.obstacles,homes:W.homes,doors,garages,windows,sideDoors,anchor,houseAnchor,alexWindow:W.alexWindow,car:W.car,drivewayOpenings:W.drives,sideDrives:W.sideDrives||[],houses:W.houses,sidePlansAll:W.sidePlans,surfaceY:W.surfaceY,sideSurface:W.sideSurface,junctions:W.junctions,creek:W.creekInfo||null,interiorMats:W.interiorMats,
  material:K.mat,farWindow:W.farWindow,glassLit:W.glassLit,porchLit:W.porchLit,lampLit:W.lampLit,shadowProxies,LOOKOUT,sideFrames,interiors:W.interiors,lights:W.lights,hooks:W.hooks||{},hoops:W.hoops||[],easement:W.easement,basin:W.basin,terrainY,signs:W.signs||[],
  poles:W.poles,wires:W.wires,background:W.background,plans:W.plans,sidePlans:W.sidePlans,farHouses:W.farHouses,space:W.space,fenceSegs:W.fenceSegs||[]};
}

// A material whose emissive level follows the evening: uP is the ride's progress (0..1),
// uNight the end of the evening; each vertex's color.r is the moment its light comes on.
function litMaterial(color,emissive,{rough,metal,span,base,gain,night}){
 const m=new THREE.MeshStandardMaterial({color,emissive,roughness:rough,metalness:metal,vertexColors:true});
 const u=m.userData.uniforms={uP:{value:0},uNight:{value:0}};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
  sh.fragmentShader='uniform float uP,uNight;\n'+sh.fragmentShader.replace('#include <color_fragment>','').replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   #ifdef USE_COLOR
   float lightOn=smoothstep(vColor.r,vColor.r+${span.toFixed(3)},uP);totalEmissiveRadiance*=${base.toFixed(3)}+lightOn*${gain.toFixed(3)}+uNight*${night.toFixed(3)};
   #endif`);};
 m.customProgramCacheKey=()=>'lit'+span+gain;return m;
}
// Streetlight heads: one material for all of them. The vertex color's green channel holds the
// lamp's index; its level (0..1, set by ambient.js as each lamp flickers on) is read from a
// uniform array in the vertex shader, and the head warms from orange to white as it comes up.
function lampMaterial(){const m=new THREE.MeshStandardMaterial({color:0xe8d6b8,emissive:0xffffff,vertexColors:true});
 const u=m.userData.uniforms={uLevel:{value:new Float32Array(32)}};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
  sh.vertexShader='uniform float uLevel[32];\nvarying float vLamp;\n'+sh.vertexShader.replace('#include <color_vertex>','#include <color_vertex>\n #ifdef USE_COLOR\n vLamp=uLevel[int(color.g*255.+.5)];\n #endif');
  sh.fragmentShader='varying float vLamp;\n'+sh.fragmentShader.replace('#include <color_fragment>','').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance=vec3(1.,.55+.2*vLamp,.25+.1*vLamp)*vLamp*2.4;');};
 m.customProgramCacheKey=()=>'lamp-heads';return m;}
// Bake every layer into world space, then merge triangles by material and 110 m cell.
// Shadows are drawn from one position-only proxy per cell (plus one for cut-out leaves),
// which keeps the shadow pass to a few draw calls however many materials a cell holds.
function bakeAndMerge(W,scene){let t0=0;const hashF=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 const colorMaterials=new Map(),batches=new Map(),lineBatches=new Map(),originals=[],merged=[],shadow=new Map(),shadowOnly=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:THREE.DoubleSide});
 const castsShadow=(m,far)=>!far&&!W.grassMats.includes(m)&&m!==W.asphalt&&!m.userData.noShadow&&m!==W.glassLit&&m!==W.porchLit&&m.side!==THREE.BackSide&&!m.transparent;
 const plain=m=>m===W.glassLit||m===W.porchLit||m===W.lampLit||W.grassMats.includes(m)||m===W.asphalt||m.emissive?.getHex()!==0||m.transparent||!m.isMeshStandardMaterial||m.userData.keep;
 function batchMaterial(m){
  if(W.windowMats.includes(m)||m===W.darkGlass||m===W.farWindow)return W.glassLit;if(W.porchMats.includes(m))return W.porchLit;if(m.userData.lamp!==undefined)return W.lampLit;
  if(plain(m))return m;
  const isLeaf=W.foliage.includes(m),kind=m.userData.surface||'',key=[m.roughness,m.metalness,m.side,isLeaf?'leaf':kind,m.alphaTest,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits,m.map?.uuid||'none'].join(':');
  if(!colorMaterials.has(key)){const b=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:m.roughness,metalness:m.metalness,side:m.side,map:m.map,alphaTest:m.alphaTest,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits});
   if(kind)W.surfaceMaterial(b,kind);if(isLeaf)W.foliage.push(b);colorMaterials.set(key,b);}
  return colorMaterials.get(key);
 }
 class Buf{constructor(){this.a=new Float32Array(4096);this.n=0;}push(x,y,z){if(this.n+3>this.a.length){const b=new Float32Array(this.a.length*2);b.set(this.a);this.a=b;}this.a[this.n++]=x;this.a[this.n++]=y;this.a[this.n++]=z;}view(){return this.a.subarray(0,this.n);}}
 const tmpP=new THREE.Vector3(),tmpN=new THREE.Vector3(),nm=new THREE.Matrix3();
 // Transform one mesh's vertices into world space according to its layer.
 function transform(o,layer,height){
  const g=o.geometry,P=g.attributes.position,N=g.attributes.normal,n=P.count,pos=new Float32Array(n*3),nor=new Float32Array(n*3);
  const mw=o.matrixWorld;nm.getNormalMatrix(mw);let recompute=false;
  if(layer.mode==='rigid'||layer.mode==='baked'){for(let i=0;i<n;i++){tmpP.fromBufferAttribute(P,i).applyMatrix4(mw);pos[i*3]=tmpP.x;pos[i*3+1]=tmpP.y;pos[i*3+2]=tmpP.z;if(N){tmpN.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[i*3]=tmpN.x;nor[i*3+1]=tmpN.y;nor[i*3+2]=tmpN.z;}}if(!N)recompute=true;}
  else if(layer.mode==='bent'){const f=layer.frame;for(let i=0;i<n;i++){tmpP.fromBufferAttribute(P,i).applyMatrix4(mw);const q=f.point(-tmpP.z,tmpP.x);pos[i*3]=q.x;pos[i*3+1]=q.y+tmpP.y;pos[i*3+2]=q.z;}recompute=true;}
  else{// drape: rigid in plan (linearized at u0), heights follow the ground
   const L=layer.lin;for(let i=0;i<n;i++){tmpP.fromBufferAttribute(P,i).applyMatrix4(mw);const u=-tmpP.z-layer.u0,v=tmpP.x;const x=L.cx+u*L.fx+v*L.rx,z=L.cz+u*L.fz+v*L.rz;pos[i*3]=x;pos[i*3+1]=height(u,v)+tmpP.y;pos[i*3+2]=z;
    if(N){tmpN.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[i*3]=tmpN.x*L.rx-tmpN.z*L.fx;nor[i*3+1]=tmpN.y;nor[i*3+2]=tmpN.x*L.rz-tmpN.z*L.fz;}}if(!N)recompute=true;}
  if(recompute&&o.isMesh&&o.geometry!==leafGeometry){const idx=g.index;nor.fill(0);const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3();
   const tris=idx?idx.count/3:n/3;for(let t=0;t<tris;t++){const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;a.fromArray(pos,i0*3);b.fromArray(pos,i1*3);c.fromArray(pos,i2*3);e1.subVectors(b,a);e2.subVectors(c,a);e1.cross(e2);for(const k of [i0,i1,i2]){nor[k*3]+=e1.x;nor[k*3+1]+=e1.y;nor[k*3+2]+=e1.z;}}
   for(let i=0;i<n;i++){const l=Math.hypot(nor[i*3],nor[i*3+1],nor[i*3+2])||1;nor[i*3]/=l;nor[i*3+1]/=l;nor[i*3+2]/=l;}}
  return {pos,nor};
 }
 function heightGrid(layer){// sampled ground under a draped group, in its linearized frame
  const box=new THREE.Box3().setFromObject(layer.group),f=layer.frame,u0=layer.u0,L=layer.lin;
  const ua=-box.max.z-u0-1,ub=-box.min.z-u0+1,va=box.min.x-1,vb=box.max.x+1,step=1,nu=Math.ceil((ub-ua)/step)+1,nv=Math.ceil((vb-va)/step)+1,h=new Float32Array(nu*nv);
  let guess=null;for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const u=ua+i*step,v=va+j*step,x=L.cx+u*L.fx+v*L.rx,z=L.cz+u*L.fz+v*L.rz,q=f.project(x,z,guess??u0+u);guess=q.u;h[i*nv+j]=layer.groundFn?layer.groundFn(q.u,q.v,x,z):f.point(q.u,q.v).y;}
  return (u,v)=>{const fu=clamp((u-ua)/step,0,nu-1.001),fv=clamp((v-va)/step,0,nv-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return (h[i*nv+j]*(1-a)+h[(i+1)*nv+j]*a)*(1-b)+(h[i*nv+j+1]*(1-a)+h[(i+1)*nv+j+1]*a)*b;};
 }
 const batchFor=(material,cell,far)=>{const key=material.uuid+':'+cell+(far?':f':'');let b=batches.get(key);if(!b){b={material,far,cell:cell+(far?':f':''),p:new Buf(),n:new Buf(),c:material.vertexColors?new Buf():null,uv:material.map?new Buf():null};batches.set(key,b);}return b;};
 const add=(b,pos,nor,col,uv,i)=>{b.p.push(pos[i*3],pos[i*3+1],pos[i*3+2]);b.n.push(nor[i*3],nor[i*3+1],nor[i*3+2]);if(b.c)b.c.push(col.r,col.g,col.b);if(b.uv)b.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0,0);};
 const layers=[...W.layers,{mode:'baked',group:{children:W.baked,updateMatrixWorld(){for(const m of W.baked)m.updateMatrixWorld(true);},traverse(fn){for(const m of W.baked)m.traverse(fn);}}}];
 for(const layer of layers){
  layer.group.updateMatrixWorld(true);
  if(layer.mode==='drape'){const p=layer.frame.point(layer.u0,0),a=layer.frame.heading(layer.u0);layer.lin={cx:p.x,cz:p.z,fx:Math.sin(a),fz:-Math.cos(a),rx:Math.cos(a),rz:Math.sin(a)};}
  const height=layer.mode==='drape'?heightGrid(layer):null;const objs=[];layer.group.traverse(o=>{if(o.isMesh||o.isLine)objs.push(o);});
  for(const o of objs){const {pos,nor}=transform(o,layer,height);
   if(o.name&&o.isMesh){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));if(o.geometry.index)g.setIndex(o.geometry.index.clone());g.computeBoundingSphere();const m=new THREE.Mesh(g,o.material);m.name=o.name;m.userData={...o.userData};originals.push(m);if(o.userData.ref)W.named[o.userData.ref]=m;}
   if(o.isLine){const key=o.material.color.getHex();if(!lineBatches.has(key))lineBatches.set(key,new Buf());const arr=lineBatches.get(key),segs=o.isLineSegments;for(let i=0;i<pos.length/3-1;i+=segs?2:1)arr.push(pos[i*3],pos[i*3+1],pos[i*3+2]),arr.push(pos[i*3+3],pos[i*3+4],pos[i*3+5]);continue;}
   const material=batchMaterial(o.material),idx=o.geometry.index,uv=o.geometry.attributes.uv,far=!!layer.far||!!o.userData.far,cellSize=far?220:110;
   const wi=W.windowMats.indexOf(o.material),pi=W.porchMats.indexOf(o.material);
   const col=o.material===W.darkGlass?{r:9,g:0,b:0}:wi>=0?{r:W.windowOn[wi],g:0,b:0}:pi>=0?{r:W.porchOn[pi],g:0,b:0}:o.material===W.farWindow?{r:.5+hashF(t0++)*.3,g:0,b:0}:o.material.userData.lamp!==undefined?{r:1,g:o.material.userData.lamp/255,b:0}:o.material.color;
   const tris=idx?idx.count/3:pos.length/9,local=new Map(),caster=castsShadow(material,far),leaf=caster&&!!material.map&&material.alphaTest>0,slocal=new Map();
   for(let t=0;t<tris;t++){const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;
    const cx=(pos[i0*3]+pos[i1*3]+pos[i2*3])/3,cz=(pos[i0*3+2]+pos[i1*3+2]+pos[i2*3+2])/3,cell=Math.floor(cx/cellSize)*1000+Math.floor(cz/cellSize);
    let b=local.get(cell);if(!b){b=batchFor(material,cell,far);local.set(cell,b);}add(b,pos,nor,col,uv,i0);add(b,pos,nor,col,uv,i1);add(b,pos,nor,col,uv,i2);
    if(caster){const sc=(Math.floor(cx/50)*1000+Math.floor(cz/50))*2+(leaf?1:0);let sp=slocal.get(sc);if(!sp){sp=shadow.get(sc);if(!sp){sp={leaf,p:new Buf(),uv:leaf?new Buf():null};shadow.set(sc,sp);}slocal.set(sc,sp);}
     for(const i of [i0,i1,i2]){sp.p.push(pos[i*3],pos[i*3+1],pos[i*3+2]);if(leaf)sp.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0,0);}}}
  }
 }
 for(const b of batches.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(b.p.view().slice(),3));g.setAttribute('normal',new THREE.BufferAttribute(b.n.view().slice(),3));
  if(b.c)g.setAttribute('color',new THREE.BufferAttribute(b.c.view().slice(),3));if(b.uv){const u3=b.uv.view(),u2=new Float32Array(u3.length/3*2);for(let i=0,j=0;i<u3.length;i+=3){u2[j++]=u3[i];u2[j++]=u3[i+1];}g.setAttribute('uv',new THREE.BufferAttribute(u2,2));}
  g.computeBoundingSphere();const mesh=new THREE.Mesh(g,b.material);mesh.castShadow=false;mesh.receiveShadow=true;if(b.far)mesh.userData.far=true;scene.add(mesh);merged.push(mesh);
}
 const shadowProxies=[];
 for(const sp of shadow.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp.p.view().slice(),3));
  if(sp.leaf){const u3=sp.uv.view(),uv=new Float32Array(u3.length/3*2);for(let i=0,j=0;i<u3.length;i+=3){uv[j++]=u3[i];uv[j++]=u3[i+1];}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));}
  g.computeBoundingSphere();const mat=sp.leaf?leafShadowMaterial(W):shadowOnly;const mesh=new THREE.Mesh(g,mat);if(sp.leaf)mesh.customDepthMaterial=leafDepth(W);
  mesh.castShadow=true;mesh.receiveShadow=false;mesh.layers.set(1);mesh.name='shadow-proxy';scene.add(mesh);shadowProxies.push(mesh);}
 for(const [color,arr] of lineBatches){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arr.view().slice(),3));g.computeBoundingSphere();scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color})));}
 return {merged,originals,shadowProxies};
}
let _leafShadow=null,_leafDepth=null;
function leafShadowMaterial(W){return _leafShadow||(_leafShadow=new THREE.MeshBasicMaterial({map:leafTexture,alphaTest:.35,side:THREE.DoubleSide,colorWrite:false,depthWrite:false}));}
function leafDepth(W){return _leafDepth||(_leafDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:leafTexture,alphaTest:.35,side:THREE.DoubleSide}));}
