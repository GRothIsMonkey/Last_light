// Authored houses (Prologue architecture benchmark, DEV only; nothing in the story imports this module).
// Places the Blender-built houses of dist/assets/house/house.prologue.glb on their own lots: each house node carries the
// lot it was built for (extras.ll_lot, from the game's planLots via tools/assets/house-plans.mjs), so the house-local
// frame of houses.js (x across the facade, +z toward the street, y up from the lot ground) maps straight onto the plan:
// the same rigid placement as the procedural house (P.toWorld, P.worldRot), and every vertex draped onto the ground the
// way world.js drapes a house (its height follows the terrain under it; nothing floats on a sloping lot).
//
// The procedural house of a benchmark lot stays in the world, in batches of its own (world.js splitHouses, zone
// 'hb:<lot>'), so the two can be swapped in the same frame. Pads, obstacles, driveways, the hoop and the car house's
// working garage door keep coming from the plan: the authored houses were built on exactly those numbers.
import * as THREE from './three.module.js';
import {loadAsset} from './asset-library.js';
import {bikeEnvironment} from './bike-assets.js';

export const HOUSE_ASSET='house.prologue';
export const LOD_DIST=[48,115];   // metres from the camera to the house (hysteresis below)
const shadowOnly=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false});

// glass: a dark, tinted pane that turns into a mirror of the sky at grazing angles (Fresnel), over the room behind it
function glassPatch(m,env){m.transparent=true;m.depthWrite=false;m.opacity=.16;m.roughness=.06;m.metalness=0;m.envMap=env;m.envMapIntensity=1.25;m.side=THREE.FrontSide;
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
  float llF=pow(1.-clamp(abs(dot(normalize(vViewPosition),normal)),0.,1.),3.);gl_FragColor.a=clamp(gl_FragColor.a+llF*.8,0.,.94);`);};
 m.customProgramCacheKey=()=>'ll-house-glass';m.needsUpdate=true;}

// Lot plans by key, exactly as dist/house-lots.js names them.
function planFor(world,lot,lotKey){return world.plans.find(P=>lotKey(P)===lot)||null;}

// The terrain under a house, sampled on a 1 m grid in house-local x/z (as world.js heightGrid does for a draped layer).
function groundGrid(P,box){const x0=box.min.x-1,x1=box.max.x+1,z0=box.min.z-1,z1=box.max.z+1,nx=Math.ceil(x1-x0)+1,nz=Math.ceil(z1-z0)+1,h=new Float32Array(nx*nz);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)h[i*nz+j]=P.toWorld(x0+i,z0+j).ground;
 return (x,z)=>{const fx=Math.min(nx-1.001,Math.max(0,x-x0)),fz=Math.min(nz-1.001,Math.max(0,z-z0)),i=Math.floor(fx),j=Math.floor(fz),a=fx-i,b=fz-j;
  return (h[i*nz+j]*(1-a)+h[(i+1)*nz+j]*a)*(1-b)+(h[i*nz+j+1]*(1-a)+h[(i+1)*nz+j+1]*a)*b;};}

const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return ((h>>>0)%10007)/10007;};

// Load once and place every house. Returns a handle: {houses, setAuthored(on), update(camera, light), stats(), restore()}
export async function placeHouses({world,scene,renderer,lotKey}){
 const A=await loadAsset(HOUSE_ASSET,{renderer});
 const env=renderer?bikeEnvironment(renderer):null;
 const nodes=[];A.template.traverse(o=>{if(o.userData?.ll_house)nodes.push(o);});
 if(!nodes.length)throw new Error(`${HOUSE_ASSET}: no house nodes`);
 const houses=[],errors=[];
 const shared={glass:new Set(),interior:new Map(),light:new Map(),all:new Set()};
 for(const node of nodes){const u=node.userData,P=planFor(world,u.ll_lot,lotKey);
  if(!P){errors.push(`${u.ll_house}: no plan for lot ${u.ll_lot}`);continue;}
  if(Math.abs(P.u-u.ll_d)>.01||P.side!==u.ll_side){errors.push(`${u.ll_house}: lot ${u.ll_lot} is at d ${P.u.toFixed(2)} side ${P.side} in the game, the file was built for d ${u.ll_d} side ${u.ll_side}`);continue;}
  const meta=JSON.parse(u.ll_meta||'{}');
  // rigid placement (what P.toWorld does in plan), checked against the plan at the footprint's corners
  const o=P.toWorld(0,0),root=new THREE.Group();root.name='authored:'+u.ll_house;root.position.set(o.x,o.ground,o.z);root.rotation.y=P.worldRot;scene.add(root);root.updateMatrixWorld(true);
  let placeErr=0;for(const [x,z] of [[-P.w/2,-P.depth/2],[P.w/2,P.depth/2],[P.w/2,-P.depth/2]]){const w=P.toWorld(x,z),v=root.localToWorld(new THREE.Vector3(x,0,z));placeErr=Math.max(placeErr,Math.hypot(v.x-w.x,v.z-w.z));}
  if(placeErr>.002){errors.push(`${u.ll_house}: placement differs from the plan by ${(placeErr*1000).toFixed(1)} mm`);root.removeFromParent();continue;}
  const parts={house:[[],[],[]],garage_door:[[],[],[]]};
  const box=new THREE.Box3();node.traverse(c=>{if(c.isMesh){c.geometry.computeBoundingBox();box.union(c.geometry.boundingBox);}});
  const ground=groundGrid(P,box),g0=o.ground;
  const id=u.ll_house,on=.1+hash(id)*.42,porchOn=.2+hash(id+'p')*.38;
  // per-house clones of the two materials that light up in the evening (the textures stay shared)
  const own=m=>{const n=m.name||'';if(/mat\.interior\//.test(n)){if(!shared.interior.has(id+n)){const c=m.clone();c.emissive=new THREE.Color(1,.86,.62);c.emissiveIntensity=0;c.color.setScalar(.62);shared.interior.set(id+n,c);}return shared.interior.get(id+n);}
   if(/mat\.light\//.test(n)){if(!shared.light.has(id)){const c=new THREE.MeshStandardMaterial({color:0xf3e6c8,emissive:0xffc070,emissiveIntensity:.05,roughness:.5,vertexColors:false});c.name=n;shared.light.set(id,c);}return shared.light.get(id);}
   if(/mat\.glass\//.test(n)){if(!shared.glass.has(m)){glassPatch(m,env);shared.glass.add(m);}}
   else if(!m.userData.llLit){m.userData.llLit=true;
    // the scoped golden-hour sky (the bike benchmark's, approval item A-47) gives semi-gloss paint, vinyl and metal the
    // reflection they need at grazing angles; without it three.js darkens them there (no environment to reflect)
    if(env){m.envMap=env;m.envMapIntensity=/metal\.bare/.test(n)?.8:.45;}
    if(/siding|wood\.painted|metal\.painted/.test(n))m.roughness=1.2;   // (factor on the ORM's roughness: vinyl and paint read satin, not wet)
    m.userData.envBase=m.envMapIntensity;m.needsUpdate=true;}
   if(m.side!==THREE.FrontSide){m.side=THREE.FrontSide;m.needsUpdate=true;}
   return m;};
  for(const child of node.children){const cu=child.userData||{};const lod=cu.ll_lod|0,part=cu.ll_part||'house';
   const copy=child.clone(true);copy.position.set(0,0,0);copy.quaternion.identity();copy.scale.set(1,1,1);
   copy.traverse(m=>{if(!m.isMesh)return;
    if(part==='house'){// drape: each vertex onto the lot's ground (heights relative to the house origin's ground)
     const g=m.geometry.clone(),p=g.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,p.getY(i)+ground(p.getX(i),p.getZ(i))-g0);}p.needsUpdate=true;g.computeBoundingSphere();g.computeBoundingBox();m.geometry=g;}
    m.material=Array.isArray(m.material)?m.material.map(own):own(m.material);
    m.castShadow=false;m.receiveShadow=true;for(const k of [].concat(m.material))shared.all.add(k);
    m.userData.authoredHouse=id;});
   copy.name=`authored:${id}:${part}:lod${lod}`;(parts[part]||(parts[part]=[[],[],[]]))[lod].push(copy);
   if(part==='house')root.add(copy);}
  // one shadow caster per house: its LOD1 shell (no glass, rooms or lamps), position only, drawn into the sun's map only
  const pos=[];for(const c of parts.house[1])c.traverse(m=>{if(!m.isMesh)return;const mat=m.material;if(/glass|interior|light/.test(mat.name||''))return;
   const g=m.geometry,p=g.attributes.position,idx=g.index;const n=idx?idx.count:p.count;for(let i=0;i<n;i++){const k=idx?idx.getX(i):i;pos.push(p.getX(k),p.getY(k),p.getZ(k));}});
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sg.computeBoundingSphere();
  const proxy=new THREE.Mesh(sg,shadowOnly);proxy.castShadow=true;proxy.receiveShadow=false;proxy.layers.set(1);proxy.name=`authored:${id}:shadow`;root.add(proxy);
  const centre=root.localToWorld(new THREE.Vector3((box.min.x+box.max.x)/2,2,(box.min.z+box.max.z)/2));
  houses.push({id,lot:u.ll_lot,role:u.ll_role,plan:P,root,parts,proxy,centre,level:-1,meta,on,porchOn,zone:'hb:'+u.ll_lot,placeErr});}
 // the procedural architecture of these lots (batches and shadow proxies of their own, world.js splitHouses)
 const zones=new Set(houses.map(h=>h.zone));
 const proc=[...world.merged.filter(m=>zones.has(m.userData.zone)),...world.shadowProxies.filter(m=>zones.has(m.userData.zone))];
 // the car house: its working garage door gets the authored door (hung under the very group world.js animates); the
 // garage footing world.js draws live is the procedural house's (the authored garage has its own slab at the same height)
 const car=houses.find(h=>h.parts.garage_door.some(l=>l.length));
 const garage=world.garages?.car,carHome=world.homes?.car,doorLods=[];
 const procDoor=garage?garage.panel.children.slice():[];
 if(car&&garage){for(let l=0;l<3;l++){const g=new THREE.Group();g.name=`authored:${car.id}:garage_door:lod${l}`;for(const c of car.parts.garage_door[l])g.add(c);c0(g);garage.panel.add(g);doorLods.push(g);}}
 function c0(g){g.traverse(m=>{if(m.isMesh){m.castShadow=true;}});}
 let authored=true,forced=null;
 const show=(h,n)=>{for(let l=0;l<3;l++)for(const c of h.parts.house[l])c.visible=l===n;if(h===car)doorLods.forEach((g,l)=>{g.visible=authored&&l===n;});h.level=n;};
 function setAuthored(on){authored=on;for(const h of houses){h.root.visible=on;}for(const m of proc)m.visible=!on;
  for(const m of procDoor)m.visible=!on;doorLods.forEach((g,l)=>{g.visible=on&&car&&l===car.level;});if(carHome?.garageFoundation)carHome.garageFoundation.visible=!on;}
 for(const h of houses)show(h,0);setAuthored(true);
 const _c=new THREE.Vector3();
 function update(camera,{uP=0,uNight=0,uDim=0,hemi=null}={}){camera.getWorldPosition(_c);
  if(hemi){const k=Math.max(.05,Math.min(1.4,hemi/2));for(const m of shared.all)if(m.userData.envBase!==undefined)m.envMapIntensity=m.userData.envBase*k;for(const m of shared.glass)m.envMapIntensity=1.25*k;}
  for(const h of houses){const d=_c.distanceTo(h.centre),cur=h.level;
   const want=forced!==null?forced:d<LOD_DIST[0]-(cur>0?3:0)?0:d<LOD_DIST[1]-(cur>1?6:0)?1:2;if(want!==cur)show(h,want);}
  // rooms light up one house after another as the ride goes on (the procedural windows' own schedule), porch lights later
  const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
  for(const h of houses){const lit=(sm(h.on,h.on+.25,uP)*1.15+uNight*.5)*(1-uDim);
   for(const [k,m] of shared.interior)if(k.startsWith(h.id))m.emissiveIntensity=lit;
   const pl=shared.light.get(h.id);if(pl)pl.emissiveIntensity=(.05+sm(h.porchOn,h.porchOn+.06,uP)*1.6)*(1-uDim);}}
 function stats(){const s={houses:houses.length,levels:{},tris:0,drawn:0,meshes:0};for(const h of houses){s.levels[h.id]=h.level;for(const c of h.parts.house[h.level])c.traverse(m=>{if(m.isMesh){s.meshes++;s.tris+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;}});}
  s.allLevels=[0,1,2].map(l=>houses.reduce((a,h)=>{let t=0;for(const c of h.parts.house[l])c.traverse(m=>{if(m.isMesh)t+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;});return a+t;},0));
  s.materials=shared.all.size;return s;}
 function restore(){setAuthored(false);for(const h of houses)h.root.removeFromParent();for(const g of doorLods)g.removeFromParent();for(const m of procDoor)m.visible=true;}
 return {houses,errors,info:A.info,proc,setAuthored,get authored(){return authored;},setLOD(n){forced=n;for(const h of houses)if(n!==null)show(h,n);},get forced(){return forced;},update,stats,restore,materials:shared};
}
