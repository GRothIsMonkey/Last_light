// Authored houses (Prologue architecture benchmark, DEV only; nothing in the story imports this module).
// Places the Blender-built houses of dist/assets/house/house.prologue.glb on their own lots: each house node carries the
// lot it was built for (extras.ll_lot, from the game's planLots via tools/assets/house-plans.mjs), so the house-local
// frame of houses.js (x across the facade, +z toward the street, y up from the lot ground) maps straight onto the plan:
// the same rigid placement as the procedural house (P.toWorld, P.worldRot), and every vertex draped onto the ground the
// way world.js drapes a house (its height follows the terrain under it; nothing floats on a sloping lot).
//
// The procedural house of a benchmark lot stays in the world, in batches of its own (world.js splitHouses, zone
// 'hb:<lot>'), so the authored and procedural houses can be swapped in the same frame. Pads, obstacles, driveways, the
// hoop and the car house's working garage door keep coming from the plan: the authored houses were built on exactly
// those numbers.
//
// Two authored sets can be placed side by side for comparison: the refined houses (house.prologue, version 2, the
// realism pass) and the first benchmark (house.prologue.v1, kept byte for byte). `refined` selects the house-only
// material treatment of the realism pass (below); the v1 set keeps the treatment it was approved with.
import * as THREE from './three.module.js';
import {loadAsset} from './asset-library.js';
import {bikeEnvironment} from './bike-assets.js';

export const HOUSE_ASSET='house.prologue';
export const HOUSE_ASSET_V1='house.prologue.v1';
export const LOD_DIST=[48,115];   // metres from the camera to the house (hysteresis below)
const shadowOnly=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false});

// glass: a dark, tinted pane that turns into a mirror of the surroundings at grazing angles (Fresnel), over the room
function glassPatch(m,env,{opacity=.16,intensity=1.25,power=3,gain=.8,key='ll-house-glass'}={}){m.transparent=true;m.depthWrite=false;m.opacity=opacity;m.roughness=.06;m.metalness=0;m.envMap=env;m.envMapIntensity=intensity;m.side=THREE.FrontSide;
 m.userData.glassBase=intensity;
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
  float llF=pow(1.-clamp(abs(dot(normalize(vViewPosition),normal)),0.,1.),${power.toFixed(1)});gl_FragColor.a=clamp(gl_FragColor.a+llF*${gain.toFixed(2)},0.,.94);`);};
 m.customProgramCacheKey=()=>key;m.needsUpdate=true;}

// What a window reflects on Oak Hollow Drive at golden hour (realism pass; scoped to the refined houses' glass): the
// warm sky, and below it a ragged band of the houses and trees across the street, then lawn. A window that reflects
// only an empty gradient reads as a sticker; one that carries a dark horizon line reads as glass. Prefiltered once.
let streetEnv=null;
export function houseGlassEnvironment(renderer){
 if(streetEnv||!renderer)return streetEnv;
 const s=new THREE.Scene(),g=new THREE.SphereGeometry(50,192,96),c=new THREE.Color(),cols=[],P=g.attributes.position;
 const zen=new THREE.Color(0x8ea4bd),hor=new THREE.Color(0xf0c49c),trees=new THREE.Color(0x2c3128),roofs=new THREE.Color(0x46423f),walls=new THREE.Color(0x8a8172),lawn=new THREE.Color(0x4b5236);
 for(let i=0;i<P.count;i++){const x=P.getX(i)/50,y=P.getY(i)/50,z=P.getZ(i)/50,a=Math.atan2(z,x);
  // the skyline across the street: rooftops (gables every ~25°) and tree crowns between them
  const roof=.045+.05*Math.max(0,1-Math.abs(((a*7.2)%(2*Math.PI))-Math.PI)/1.2),tree=.07+.05*Math.sin(a*23+1.3)*Math.sin(a*9.1)+.03*Math.sin(a*57);
  const top=Math.max(roof,tree);
  if(y>top)c.copy(hor).lerp(zen,Math.pow((y-top)/(1-top),.55));
  else if(y>.0){c.copy(tree>roof?trees:roofs);if(tree<=roof&&y<roof*.55)c.copy(walls);}
  else c.copy(lawn).lerp(trees,Math.min(1,-y*2));
  cols.push(c.r,c.g,c.b);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
 const sun=new THREE.Mesh(new THREE.SphereGeometry(3,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(0xffd09b).multiplyScalar(5)}));sun.position.set(-30,8,-38);s.add(sun);
 const pm=new THREE.PMREMGenerator(renderer);streetEnv=pm.fromScene(s,.01).texture;pm.dispose();g.dispose();return streetEnv;
}

// Lot plans by key, exactly as dist/house-lots.js names them.
function planFor(world,lot,lotKey){return world.plans.find(P=>lotKey(P)===lot)||null;}

// The terrain under a house, sampled on a 1 m grid in house-local x/z (as world.js heightGrid does for a draped layer).
function groundGrid(P,box){const x0=box.min.x-1,x1=box.max.x+1,z0=box.min.z-1,z1=box.max.z+1,nx=Math.ceil(x1-x0)+1,nz=Math.ceil(z1-z0)+1,h=new Float32Array(nx*nz);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)h[i*nz+j]=P.toWorld(x0+i,z0+j).ground;
 return (x,z)=>{const fx=Math.min(nx-1.001,Math.max(0,x-x0)),fz=Math.min(nz-1.001,Math.max(0,z-z0)),i=Math.floor(fx),j=Math.floor(fz),a=fx-i,b=fz-j;
  return (h[i*nz+j]*(1-a)+h[(i+1)*nz+j]*a)*(1-b)+(h[i*nz+j+1]*(1-a)+h[(i+1)*nz+j+1]*a)*b;};}

const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return ((h>>>0)%10007)/10007;};
// Upkeep (ll_meta.care, from the Blender build) as surface response: fresh paint and vinyl a little glossier, a tired
// house's chalky paint and older roof rougher. Factors on the materials' own roughness maps (refined set only).
const CARE={fresh:{siding:1.0,paint:1.0,roof:.97,brick:1.0},average:{siding:1.15,paint:1.12,roof:1.0,brick:1.0},tired:{siding:1.32,paint:1.28,roof:1.06,brick:1.04}};

// Load once and place every house of one asset. Returns a handle:
// {houses, errors, info, proc, showOwn(on), setProcedural(on), setAuthored(on), setLOD(n|null), update(camera, light), stats(), restore()}
export async function placeHouses({world,scene,renderer,lotKey,assetId=HOUSE_ASSET,refined=assetId===HOUSE_ASSET}){
 const A=await loadAsset(assetId,{renderer});
 const env=renderer?bikeEnvironment(renderer):null,glassEnv=refined&&renderer?houseGlassEnvironment(renderer):env;
 const aniso=Math.min(16,renderer?.capabilities?.getMaxAnisotropy?.()??1);
 const nodes=[];A.template.traverse(o=>{if(o.userData?.ll_house)nodes.push(o);});
 if(!nodes.length)throw new Error(`${assetId}: no house nodes`);
 const houses=[],errors=[];
 const shared={glass:new Set(),interior:new Map(),light:new Map(),all:new Set(),care:new Map()};
 for(const node of nodes){const u=node.userData,P=planFor(world,u.ll_lot,lotKey);
  if(!P){errors.push(`${u.ll_house}: no plan for lot ${u.ll_lot}`);continue;}
  if(Math.abs(P.u-u.ll_d)>.01||P.side!==u.ll_side){errors.push(`${u.ll_house}: lot ${u.ll_lot} is at d ${P.u.toFixed(2)} side ${P.side} in the game, the file was built for d ${u.ll_d} side ${u.ll_side}`);continue;}
  const meta=JSON.parse(u.ll_meta||'{}');
  // rigid placement (what P.toWorld does in plan), checked against the plan at the footprint's corners
  const o=P.toWorld(0,0),root=new THREE.Group();root.name='authored:'+u.ll_house+(refined?'':':v1');root.position.set(o.x,o.ground,o.z);root.rotation.y=P.worldRot;scene.add(root);root.updateMatrixWorld(true);
  let placeErr=0;for(const [x,z] of [[-P.w/2,-P.depth/2],[P.w/2,P.depth/2],[P.w/2,-P.depth/2]]){const w=P.toWorld(x,z),v=root.localToWorld(new THREE.Vector3(x,0,z));placeErr=Math.max(placeErr,Math.hypot(v.x-w.x,v.z-w.z));}
  if(placeErr>.002){errors.push(`${u.ll_house}: placement differs from the plan by ${(placeErr*1000).toFixed(1)} mm`);root.removeFromParent();continue;}
  const parts={house:[[],[],[]],garage_door:[[],[],[]]};
  const box=new THREE.Box3();node.traverse(c=>{if(c.isMesh){c.geometry.computeBoundingBox();box.union(c.geometry.boundingBox);}});
  const ground=groundGrid(P,box),g0=o.ground;
  const id=u.ll_house,on=.1+hash(id)*.42,porchOn=.2+hash(id+'p')*.38,care=CARE[meta.care]||CARE.average;
  // per-house clones of the two materials that light up in the evening (the textures stay shared)
  const own=m=>{const n=m.name||'';if(/mat\.interior\//.test(n)){if(!shared.interior.has(id+n)){const c=m.clone();c.emissive=new THREE.Color(1,.86,.62);c.emissiveIntensity=0;c.color.setScalar(refined?.7:.62);
     if(refined&&c.emissiveMap)c.emissiveMap.anisotropy=aniso;shared.interior.set(id+n,c);}return shared.interior.get(id+n);}
   if(/mat\.light\//.test(n)){if(!shared.light.has(id)){const c=new THREE.MeshStandardMaterial({color:0xf3e6c8,emissive:0xffc070,emissiveIntensity:.05,roughness:.5,vertexColors:false});c.name=n;shared.light.set(id,c);}return shared.light.get(id);}
   if(/mat\.glass\//.test(n)){if(!shared.glass.has(m)){refined?glassPatch(m,glassEnv,{opacity:.2,intensity:1.35,power:3.4,gain:.82,key:'ll-house-glass-2'}):glassPatch(m,env);shared.glass.add(m);}return m;}
   if(!m.userData.llLit){m.userData.llLit=true;
    // the scoped golden-hour sky (the bike benchmark's, approval item A-47) gives semi-gloss paint, vinyl and metal the
    // reflection they need at grazing angles; without it three.js darkens them there (no environment to reflect)
    if(env){m.envMap=env;m.envMapIntensity=/metal\.bare/.test(n)?.8:.45;}
    if(/siding|wood\.painted|metal\.painted/.test(n))m.roughness=1.2;   // (factor on the ORM's roughness: vinyl and paint read satin, not wet)
    if(refined)refine(m);
    m.userData.envBase=m.envMapIntensity;m.needsUpdate=true;}
   // refined set: the family's upkeep on its own clone of siding, paint, roof and brick (shared textures, same shader)
   const fam=refined&&(/siding/.test(n)?'siding':/wood\.painted/.test(n)?'paint':/roof\.shingle/.test(n)?'roof':/mat\.brick\//.test(n)?'brick':null);
   if(fam){const key=id+n;if(!shared.care.has(key)){const c=m.clone();c.roughness=m.roughness*care[fam];c.userData={...m.userData};shared.care.set(key,c);}return shared.care.get(key);}
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
 // The realism pass's house-only material treatment (reversible: the v1 set and the rest of the game never get it):
 //  - the ORM texture's occlusion channel as the ambient-occlusion map (three.js only uses it if asked: lap shadows,
 //    mortar joints and shingle butts darken the sky light the game's hemisphere gives every surface);
 //  - anisotropic filtering up to 16x (siding and roofs are seen at grazing angles from the street, where 4x blurs them);
 //  - normal detail a little stronger on siding and shingles, which the game's softer light otherwise flattens.
 function refine(m){const n=m.name||'';
  for(const k of ['map','normalMap','roughnessMap','metalnessMap'])if(m[k])m[k].anisotropy=aniso;
  if(m.roughnessMap&&/siding|brick|roof\.shingle|concrete|wood\.painted/.test(n)){m.aoMap=m.roughnessMap;m.aoMapIntensity=/roof/.test(n)?1.0:.9;}
  if(m.normalMap&&/siding|roof\.shingle/.test(n))m.normalScale.multiplyScalar(1.35);}
 // the procedural architecture of these lots (batches and shadow proxies of their own, world.js splitHouses)
 const zones=new Set(houses.map(h=>h.zone));
 const proc=[...world.merged.filter(m=>zones.has(m.userData.zone)),...world.shadowProxies.filter(m=>zones.has(m.userData.zone))];
 // the car house: its working garage door gets the authored door (hung under the very group world.js animates); the
 // garage footing world.js draws live is the procedural house's (the authored garage has its own slab at the same height)
 const car=houses.find(h=>h.parts.garage_door.some(l=>l.length));
 const garage=world.garages?.car,carHome=world.homes?.car,doorLods=[];
 const procDoor=garage?garage.panel.children.filter(c=>!/^authored:/.test(c.name||'')):[];
 if(car&&garage){for(let l=0;l<3;l++){const g=new THREE.Group();g.name=`authored:${car.id}:garage_door:lod${l}${refined?'':':v1'}`;for(const c of car.parts.garage_door[l])g.add(c);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});garage.panel.add(g);doorLods.push(g);}}
 let own=true,forced=null;
 const show=(h,n)=>{for(let l=0;l<3;l++)for(const c of h.parts.house[l])c.visible=l===n;if(h===car)doorLods.forEach((g,l)=>{g.visible=own&&l===n;});h.level=n;};
 // this set on/off (its houses and its garage door); the procedural houses on/off (shared by every set)
 function showOwn(on){own=on;for(const h of houses)h.root.visible=on;doorLods.forEach((g,l)=>{g.visible=on&&!!car&&l===car.level;});}
 function setProcedural(on){for(const m of proc)m.visible=on;for(const m of procDoor)m.visible=on;if(carHome?.garageFoundation)carHome.garageFoundation.visible=on;}
 function setAuthored(on){showOwn(on);setProcedural(!on);}
 for(const h of houses)show(h,0);setAuthored(true);
 const _c=new THREE.Vector3();
 function update(camera,{uP=0,uNight=0,uDim=0,hemi=null}={}){camera.getWorldPosition(_c);
  if(hemi){const k=Math.max(.05,Math.min(1.4,hemi/2));for(const m of shared.all)if(m.userData.envBase!==undefined)m.envMapIntensity=m.userData.envBase*k;for(const m of shared.glass)m.envMapIntensity=(m.userData.glassBase??1.25)*k;}
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
 function restore(){setAuthored(false);for(const h of houses)h.root.removeFromParent();for(const g of doorLods)g.removeFromParent();setProcedural(true);}
 return {assetId,refined,houses,errors,info:A.info,proc,showOwn,setProcedural,setAuthored,get authored(){return own;},setLOD(n){forced=n;for(const h of houses)if(n!==null)show(h,n);},get forced(){return forced;},update,stats,restore,materials:shared};
}
