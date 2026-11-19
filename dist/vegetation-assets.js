// Authored vegetation (Prologue vegetation benchmark, DEV only; nothing in the story imports this module).
// Stands the Blender-built vegetation (dist/assets/veg/*.glb) exactly where the procedural vegetation of Oak Hollow Drive
// stands: world.js records every tree within 95 m of the street, every foundation-bed shrub and flower and the lookout's
// old grass (buildWorld {vegetation:true}, zones 'vg:*'), and this module replaces them in place:
//   * the old oak (lm.old-oak) on LOOKOUT.oak with the lookout's own frame (the tree was built on the game's ground,
//     swing pivot and carving: tools/assets/oak-site.mjs), its own limb carrying the swing;
//   * street trees (veg.street-trees: 7 species, 44 variants) on each recorded tree: species from the recorded kind
//     (the generic 'maple' spreads over maple, oak and ash; 'pine' over white pine and spruce), the variant chosen so
//     neighbours differ, the size kept to the recorded crown and clear of the nearest house;
//   * shrubs (veg.shrubs) on each recorded bed shrub: each house's beds get one planting style (clipped, natural or
//     mixed), flower clusters become low flowering perennials;
//   * a lawn of real grass blades near the camera (veg.ground; clumps within ~10 m, cards to ~22 m, the ground material
//     beyond), mowing stripes on some lawns, clover on others, ragged edges on the unedged ones; the lawn material itself
//     gains broad colour variation and dry patches;
//   * the lookout's meadow (tall grass, dry tufts, wildflowers, seed stalks; a worn patch under the swing) instead of
//     the old cone tufts.
// Everything is instanced per variant and LOD; one vegetation shader for all of it (baked occlusion from COLOR_0, wind
// from _WIND driven by the game's own breeze in ambient.js, leaf back-light, hue jitter, bark moss and dead wood, alpha
// kept solid with distance). Collisions, pads, obstacles and every story position are untouched: they come from the plan.
import * as THREE from './three.module.js';
import {mergeGeometries} from './three-addons-buffer-geometry-utils.js';
import {loadAsset} from './asset-library.js';
import {LOOKOUT} from './layout.js';
import {groundPoint,heading} from './route.js';
import {MAIN,LAWN} from './terrain.js';

export const VEG_IDS=['lm.old-oak','veg.street-trees','veg.shrubs','veg.ground'];
const hash=(...v)=>{let h=2166136261;for(const x of v){h^=Math.floor(x*1000)|0;h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;};

// ------------------------------------------------------------------------------------------------ the vegetation shader
export function vegUniforms(){return {uTime:{value:0},uGust:{value:.5},uWind:{value:1},uSunDirV:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color(1,.85,.65)},uBack:{value:.4},uSeason:{value:0}};}
const WIND_GLSL=`
 {vec3 ip=vec3(0.);
 #ifdef USE_INSTANCING
  ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
  mat3 rot=mat3(instanceMatrix);
 #else
  mat3 rot=mat3(1.);
 #endif
  vec3 op=(modelMatrix*vec4(ip,1.)).xyz;
  float seed=fract(sin(dot(op.xz,vec2(12.9898,78.233)))*43758.5453);
  mat3 toObj=transpose(mat3(modelMatrix)*rot);
  vec3 wd=normalize(toObj*vec3(.83,0.,.56));vec3 wc=normalize(toObj*vec3(-.56,0.,.83));
  float str=uWind*(.45+.55*uGust),t=uTime,flex=_wind.x,ph=_wind.y*6.2831+seed*6.2831;
  float h=max(transformed.y,0.);
  float trunk=(sin(t*.55+seed*6.28)*.65+sin(t*1.07+seed*2.1)*.35)*str*.0016*h*h;
  float br=(sin(t*1.6+ph)*.6+sin(t*2.7+ph*1.7)*.3+sin(t*.9+ph*.3)*.4)*str*.11*flex*flex;
  float side=sin(t*1.25+ph*1.3)*str*.05*flex*flex;
  transformed+=wd*(trunk+br)+wc*side+vec3(0.,-abs(br)*.18,0.);
  transformed+=objectNormal*sin(t*6.3+ph*3.+transformed.x*1.7+transformed.z*1.3)*.02*str*_wind.z;}
`;
export function vegMaterial(src,kind,U,{shadow=true}={}){
 // kind: 'bark' | 'leaf' | 'ground'
 const m=new THREE.MeshStandardMaterial({map:src.map||null,normalMap:src.normalMap||null,roughnessMap:kind==='bark'?(src.metalnessMap||src.roughnessMap||null):null,
  roughness:kind==='bark'?.92:kind==='leaf'?.74:.85,metalness:0,vertexColors:true,side:kind==='bark'?THREE.FrontSide:THREE.DoubleSide,
  alphaTest:kind==='bark'?0:(src.alphaTest||.42),transparent:false});
 if(src.normalMap)m.normalScale.copy(src.normalScale||new THREE.Vector2(1,1));
 m.name='veg:'+kind+':'+(src.name||'');m.userData.vegKind=kind;
 const foliage=kind!=='bark';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader='attribute vec4 _wind;\nuniform float uTime,uGust,uWind;\nvarying vec4 vWind;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vWind=_wind;'+WIND_GLSL);
  let f='uniform vec3 uSunDirV;uniform vec3 uSunCol;uniform float uBack,uSeason;\nvarying vec4 vWind;\n'+sh.fragmentShader;
  if(foliage){
   // per-card hue jitter (+-6 %), the season tint (0 summer .. 1 October) for later chapters
   f=f.replace('#include <color_fragment>',`#include <color_fragment>
    diffuseColor.rgb*=mix(vec3(.93,1.,.9),vec3(1.07,1.03,.96),vWind.w);
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.55,.95,.45),uSeason*(.55+.45*vWind.w));`);
   // alpha kept solid with distance: scale coverage with the mip level before the cut-out test
   f=f.replace('#include <alphatest_fragment>',`
    #ifdef USE_MAP
     vec2 llDx=dFdx(vMapUv*1024.),llDy=dFdy(vMapUv*1024.);float llLod=max(0.,.5*log2(max(dot(llDx,llDx),dot(llDy,llDy))));
     diffuseColor.a*=1.+llLod*.32;
    #endif
    #include <alphatest_fragment>`);
   // leaves glow when the sun is behind them (thin-leaf transmission, softened where the canopy is deep)
   if(kind==='leaf')f=f.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    float llBack=pow(max(dot(-normalize(vViewPosition),uSunDirV),0.),4.);
    reflectedLight.directDiffuse+=diffuseColor.rgb*uSunCol*llBack*uBack*(.35+.65*vColor.r);`);
   // leaves are lit by their own (crown-shaped) normals from both sides
   f=f.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n normal=normalize(vNormal);');
  }else{
   // bark: moss (vWind.w < 0) in patches, weathered grey dead wood (vWind.w > 0)
   f=f.replace('#include <color_fragment>',`#include <color_fragment>
    {float moss=clamp(-vWind.w,0.,1.),dead=clamp(vWind.w,0.,1.);
     #ifdef USE_MAP
      vec2 mc=floor(vMapUv*vec2(6.,9.));float n=fract(sin(dot(mc,vec2(12.9898,78.233)))*43758.5453);
     #else
      float n=.5;
     #endif
     diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.38,.52,.24),moss*smoothstep(.25,.75,n)*.85);
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.33,.31,.29),dead*.7);}`);
  }
  sh.fragmentShader=f;};
 m.customProgramCacheKey=()=>'ll-veg-'+kind;
 return m;
}
function depthMaterial(map,U){const d=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map,alphaTest:.42,side:THREE.DoubleSide});
 d.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.vertexShader='attribute vec4 _wind;\nuniform float uTime,uGust,uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vec3 objectNormal=vec3(0.,1.,0.);'+WIND_GLSL);};
 d.customProgramCacheKey=()=>'ll-veg-depth';return d;}

// ------------------------------------------------------------------------------------------------ variants from the files
// Each variant node (extras.ll_variant, or the oak's root) holds LOD meshes (extras.ll_lod); every glTF primitive of a LOD
// is merged into one geometry with a group per material, so a variant's LOD is one InstancedMesh.
function variantsOf(template,U,shared){const out=new Map();
 const roots=[];template.traverse(o=>{if(o.userData?.ll_variant||(o.userData?.ll_asset_id==='lm.old-oak'))roots.push(o);});
 for(const r of roots){const id=r.userData.ll_variant||r.userData.ll_asset_id,lods=[];
  for(const c of r.children){const l=c.userData?.ll_lod;if(l===undefined)continue;
   const parts=[];c.traverse(o=>{if(o.isMesh)parts.push(o);});if(!parts.length)continue;
   const geos=parts.map(o=>{const g=o.geometry.clone();for(const k of Object.keys(g.attributes)){if(!['position','normal','uv','color','_wind'].includes(k)){g.deleteAttribute(k);continue;}
     const a=g.attributes[k];if(a.isInterleavedBufferAttribute){// glb_pack.py stores int8 normals 4-byte aligned: de-interleave (still int8 on the GPU)
      const b=new THREE.BufferAttribute(new a.array.constructor(a.count*a.itemSize),a.itemSize,a.normalized);const G=['getX','getY','getZ','getW'],St=['setX','setY','setZ','setW'];for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++)b[St[c]](i,a[G[c]](i));g.setAttribute(k,b);}}return g;});
   const geo=geos.length>1?mergeGeometries(geos,true):geos[0];if(geos.length===1){geo.clearGroups();geo.addGroup(0,geo.index?geo.index.count:geo.attributes.position.count,0);}
   const mats=parts.map(o=>{const src=o.material,key=src.uuid;if(!shared.has(key)){const kind=/foliage/.test(src.name)?(/ground/.test(src.name)?'ground':'leaf'):'bark';shared.set(key,vegMaterial(src,kind,U));}return shared.get(key);});
   geo.computeBoundingSphere();lods[l]={geo,mats,tris:(geo.index?geo.index.count:geo.attributes.position.count)/3};}
  out.set(id,{id,lods,info:{...r.userData}});}
 return out;}

// ------------------------------------------------------------------------------------------------ instanced LOD fields
class Field{
 constructor(scene,name,{dist,hide=Infinity,shadowLods=[0,1],U}){this.scene=scene;this.name=name;this.dist=dist;this.hide=hide;this.shadowLods=shadowLods;this.U=U;
  this.root=new THREE.Group();this.root.name='authored-veg:'+name;scene.add(this.root);this.items=[];this.meshes=new Map();this.forced=null;this.dirty=true;}
 add(variant,matrix,pos,extra={}){this.items.push({variant,matrix,pos,level:-1,...extra});}
 build(){const by=new Map();for(const it of this.items){if(!by.has(it.variant.id))by.set(it.variant.id,[]);by.get(it.variant.id).push(it);}
  for(const [id,list] of by){const v=list[0].variant,ims=[];
   v.lods.forEach((L,l)=>{if(!L)return;const im=new THREE.InstancedMesh(L.geo,L.mats,list.length);im.count=0;im.name=`${this.name}:${id}:lod${l}`;
    im.castShadow=this.shadowLods.includes(l);im.receiveShadow=true;im.frustumCulled=true;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const leaf=L.mats.find(m=>m.userData.vegKind!=='bark');if(leaf?.map&&im.castShadow)im.customDepthMaterial=depthMaterial(leaf.map,this.U);
    this.root.add(im);ims[l]=im;});
   this.meshes.set(id,{list,ims});}
  return this;}
 update(camPos){let changed=false;const D=this.dist;
  for(const it of this.items){const d=it.pos.distanceTo(camPos)/(it.lodScale||1);let l;
   if(this.forced!==null)l=Math.min(this.forced,it.variant.lods.length-1);
   else if(d>this.hide)l=-2;
   else{l=0;for(let k=0;k<D.length;k++)if(d>D[k]*(it.level===k?1.1:it.level===k+1?.9:1))l=k+1;l=Math.min(l,it.variant.lods.length-1);}
   if(l!==it.level){it.level=l;changed=true;}}
  if(!changed&&!this.dirty)return;this.dirty=false;
  for(const {list,ims} of this.meshes.values()){const n=ims.map(()=>0);
   for(const it of list){if(it.level<0)continue;const im=ims[it.level];if(!im)continue;im.setMatrixAt(n[it.level],it.matrix);if(it.color&&im.instanceColor!==undefined)im.setColorAt(n[it.level],it.color);n[it.level]++;}
   ims.forEach((im,l)=>{if(!im)return;im.count=n[l];im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere();});}}
 stats(){let tris=0,calls=0;const levels=[0,0,0];for(const {ims,list} of this.meshes.values()){ims.forEach((im,l)=>{if(!im||!im.count)return;tris+=im.count*(im.geometry.index?im.geometry.index.count:im.geometry.attributes.position.count)/3;calls+=im.geometry.groups.length;});for(const it of list)if(it.level>=0)levels[it.level]++;}
  return {tris,calls,levels,items:this.items.length};}
 set visible(v){this.root.visible=v;}
}

// ------------------------------------------------------------------------------------------------ species and placement
const SPECIES_OF=(rec)=>{const h=hash(rec.x,rec.z,7);
 if(rec.kind==='pine')return h<.55?'pine':'spruce';
 if(rec.kind==='birch')return 'birch';if(rec.kind==='young')return 'young';if(rec.kind==='oak')return 'oak';
 return h<.6?'maple':h<.82?'oak':'ash';};

function houseClearance(world,x,z){// distance from (x,z) to the nearest Oak Hollow house footprint (house-local rectangle), metres
 const q=MAIN.project(x,z);let best=Infinity;
 for(const h of world.houses||[]){if(h.frameId!=='main'||Math.abs((h.dc??h.u)-q.u)>45)continue;const L=h.localOf(q.u,q.v);
  const hw=h.w/2,hd=h.depth/2;let dx=Math.max(0,Math.abs(L.x)-hw),dz=Math.max(0,Math.abs(L.z)-hd);let d=Math.hypot(dx,dz);
  if(h.hasGarage){const gx=L.x-h.gx,gz=L.z-(h.gfront-h.gd/2);const ddx=Math.max(0,Math.abs(gx)-h.gw/2),ddz=Math.max(0,Math.abs(gz)-h.gd/2);d=Math.min(d,Math.hypot(ddx,ddz));}
  best=Math.min(best,d);}
 return best;}

export async function placeVegetation({world,scene,renderer,ambient=null}){
 const R=world.vegRecord;if(!R)throw new Error('the world was not built with {vegetation:true} (?vegetation)');
 const t0=performance.now();const U=vegUniforms();
 // the game's own breeze (ambient.js): read its time and gust uniforms through a procedural foliage material's hook
 let gameWind=null;try{const m=world.foliage?.find(x=>typeof x.onBeforeCompile==='function');if(m){const fake={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:''};m.onBeforeCompile(fake);if(fake.uniforms.uTime&&fake.uniforms.uGust)gameWind=fake.uniforms;}}catch{}
 const assets={},info={bytes:0,readMs:0,parseMs:0,files:{}};
 for(const id of VEG_IDS){const a=await loadAsset(id,{renderer});assets[id]=a;info.bytes+=a.info.bytes;info.files[id]=a.info;}
 const shared=new Map();
 const V={};for(const id of VEG_IDS)V[id]=variantsOf(assets[id].template,U,shared);
 const aniso=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()??1);for(const m of shared.values())for(const k of ['map','normalMap'])if(m[k])m[k].anisotropy=aniso;
 const trees=[...V['veg.street-trees'].values()],shrubs=[...V['veg.shrubs'].values()],ground=V['veg.ground'];
 const bySpecies={};for(const v of trees)(bySpecies[v.info.ll_species]||(bySpecies[v.info.ll_species]=[])).push(v);
 const errors=[];const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),P=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
 const mat=(x,y,z,rot,s)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(Y,rot),new THREE.Vector3(s,s,s));

 // ---- the old oak: one instance, its own LODs, on the lookout's frame
 const oakRec=R.trees.find(t=>t.landmark);const oakV=V['lm.old-oak'].get('lm.old-oak');
 const oak=new THREE.Group();oak.name='authored-veg:lm.old-oak';
 {const o=LOOKOUT.oak,p=groundPoint(o.d,o.lat);oak.position.set(p.x,oakRec?oakRec.y:world.groundY(o.d,o.lat)-.02,p.z);oak.rotation.y=-heading(o.d);
  oakV.lods.forEach((L,l)=>{const m=new THREE.Mesh(L.geo,L.mats);m.name='lm.old-oak:lod'+l;m.castShadow=true;m.receiveShadow=true;m.visible=l===0;
   const leaf=L.mats.find(x=>x.userData.vegKind!=='bark');if(leaf?.map)m.customDepthMaterial=depthMaterial(leaf.map,U);oak.add(m);});
  scene.add(oak);}
 const oakLod={level:0,forced:null,dist:[85,210]};
 const oakAnchors=(()=>{try{return JSON.parse(oakV.info.ll_anchors||'{}');}catch{return {};}})();

 // ---- street trees
 const treeField=new Field(scene,'trees',{dist:[34,82],hide:900,shadowLods:[0,1],U});
 // far background trees were stood on a coarser terrain function than the far land that is drawn: ground each one on the
 // visible surface (a ray down onto the world's own batches, the vegetation's excluded)
 const groundMeshes=world.merged.filter(m=>!(m.userData.zone||'').startsWith('vg:'));const rc=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
 const groundAt=(x,y,z)=>{const near=groundMeshes.filter(m=>{const b=m.geometry.boundingSphere;return b&&Math.hypot(b.center.x-x,b.center.z-z)<b.radius+1;});
  rc.set(new THREE.Vector3(x,y+6,z),down);rc.far=14;const h=rc.intersectObjects(near,false).filter(q=>q.face&&q.face.normal.y>.5);if(!h.length)return y;
  let best=h[0].point.y;for(const q of h)if(Math.abs(q.point.y-y)<Math.abs(best-y))best=q.point.y;return Math.abs(best-y)<1.5?best:y;};
 const placed=[];
 for(const rec of R.trees){if(rec.landmark)continue;const sp=SPECIES_OF(rec),list=bySpecies[sp];if(!list?.length){errors.push('no variants for '+sp);continue;}
  // a variant unlike its nearest placed neighbours (no clones in one view)
  let k=Math.floor(hash(rec.x,rec.z,13)*list.length);const near=placed.filter(p=>p.sp===sp&&(p.x-rec.x)**2+(p.z-rec.z)**2<30*30).map(p=>p.k);
  for(let j=0;j<list.length&&near.includes(k);j++)k=(k+1)%list.length;
  const v=list[k];const crownV=v.info.ll_crown||4;
  let s=THREE.MathUtils.clamp(rec.crown*1.12/crownV,.62,1.3)*(.94+.12*hash(rec.x,rec.z,3));
  if(sp==='young')s=THREE.MathUtils.clamp(rec.size*.9,.75,1.1);
  // keep the crown clear of the nearest house (a little overhang over a lawn-side eave is natural, through a wall is not)
  const clear=houseClearance(world,rec.x,rec.z);if(clear<Infinity&&crownV*s>clear+.4)s=Math.max(.5,(clear+.4)/crownV);
  const rot=hash(rec.x,rec.z,5)*Math.PI*2;
  const y=rec.lod==='far'?groundAt(rec.x,rec.y,rec.z):rec.y;
  treeField.add(v,mat(rec.x,y-.02,rec.z,rot,s),new THREE.Vector3(rec.x,y+4*s,rec.z),{rec,s,lodScale:rec.lod==='far'?.7:1});
  placed.push({sp,k,x:rec.x,z:rec.z});}
 treeField.build();

 // ---- shrubs: beds grouped per house, one planting style per house
 const shrubField=new Field(scene,'shrubs',{dist:[20,45],hide:170,shadowLods:[0],U});
 const shrubV={globe:shrubs.filter(v=>/globe/.test(v.id)),hedge:shrubs.filter(v=>/hedge/.test(v.id)),big:shrubs.filter(v=>/natural\.big/.test(v.id)),medium:shrubs.filter(v=>/natural\.medium/.test(v.id)),small:shrubs.filter(v=>/natural\.small/.test(v.id)),flower:shrubs.filter(v=>/flowering/.test(v.id))};
 const beds=R.beds.filter(b=>b.kind==='shrub'),flowers=R.beds.filter(b=>b.kind==='flower');
 const houseKey=b=>Math.round(b.x/14)+':'+Math.round(b.z/14);
 for(const b of beds){const st=hash(...houseKey(b).split(':').map(Number),9),style=st<.36?'clipped':st<.78?'natural':'mixed';const hh=hash(b.x,b.z,2);
  let pool=style==='clipped'?(hh<.25?shrubV.hedge:shrubV.globe):style==='natural'?(b.r>.46?shrubV.big:shrubV.medium):(hh<.5?shrubV.globe:shrubV.big);
  const v=pool[Math.floor(hash(b.x,b.z,4)*pool.length)];const w=v.info.ll_size?.[0]||1;
  const target=b.r*2*(style==='natural'?1.25:1.12),s=THREE.MathUtils.clamp(target/w,.55,1.35);
  const rot=/hedge/.test(v.id)?(b.rot??0)+Math.PI/2*(hh<.5?0:2):hash(b.x,b.z,6)*Math.PI*2;
  shrubField.add(v,mat(b.x,b.ground,b.z,rot,s),new THREE.Vector3(b.x,b.ground+.5,b.z));}
 // flower balls (4 per cluster) -> one low perennial at each cluster
 const used=new Set();for(let i=0;i<flowers.length;i++){if(used.has(i))continue;const c=[i];used.add(i);for(let j=i+1;j<flowers.length;j++)if(!used.has(j)&&(flowers[j].x-flowers[i].x)**2+(flowers[j].z-flowers[i].z)**2<.9)c.push(j),used.add(j);
  const x=c.reduce((a,k)=>a+flowers[k].x,0)/c.length,z=c.reduce((a,k)=>a+flowers[k].z,0)/c.length,g=Math.min(...c.map(k=>flowers[k].ground));
  const v=shrubV.flower[Math.floor(hash(x,z,8)*shrubV.flower.length)];shrubField.add(v,mat(x,g,z,hash(x,z,1)*6.28,.8+.35*hash(x,z,2)),new THREE.Vector3(x,g+.3,z));}
 shrubField.build();

 // ---- the lookout meadow (static) and the worn patch under the swing
 const meadowField=new Field(scene,'meadow',{dist:[34],hide:160,shadowLods:[],U});
 const meadow=meadowPoints(world);for(const m of meadow){const v=ground.get(m.id);if(!v){errors.push('no ground variant '+m.id);continue;}meadowField.add(v,mat(m.x,m.y,m.z,m.rot,m.s),new THREE.Vector3(m.x,m.y,m.z));}
 meadowField.build();
 const worn=wornPatch(world);scene.add(worn);

 // ---- the near lawn (rebuilt around the camera)
 const lawn=new LawnRing(scene,world,ground,U,{beds:R.beds,trees:R.trees});

 // ---- the lawn material: broad colour variation and dry patches (a uniform switches it back off)
 const lawnU={uVegLawn:{value:1}};
 for(const m of world.grassMats||[]){const prev=m.onBeforeCompile,prevKey=m.customProgramCacheKey?.bind(m);
  m.onBeforeCompile=(sh,r)=>{prev?.call(m,sh,r);Object.assign(sh.uniforms,lawnU);
   sh.vertexShader='varying vec3 vVegW;\n'+sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n vVegW=(modelMatrix*vec4(transformed,1.)).xyz;');
   sh.fragmentShader='uniform float uVegLawn;varying vec3 vVegW;\nfloat vegN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5),b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5),c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5),d=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}\n'+
    sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    if(uVegLawn>.5){vec2 p=vVegW.xz;float big=vegN(p*.045)*.6+vegN(p*.13)*.4,fine=vegN(p*.9)*.5+vegN(p*2.3)*.5;
     float dry=smoothstep(.62,.8,vegN(p*.07+17.)*.7+vegN(p*.31)*.3);
     diffuseColor.rgb*=.86+.24*big+.08*(fine-.5);
     diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.28,1.1,.62),dry*.55);
     diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.9,1.04,.86),smoothstep(.55,.75,vegN(p*.2+3.))*.35);}`);};
  m.customProgramCacheKey=()=>(prevKey?prevKey():'')+'|ll-veg-lawn';m.needsUpdate=true;}

 // ---- what the authored set replaces (shown again in procedural mode)
 const procedural=[...world.merged.filter(m=>(m.userData.zone||'').startsWith('vg:')),...world.shadowProxies.filter(m=>(m.userData.zone||'').startsWith('vg:'))];
 const swingLimb=scene.getObjectByName('swing-limb'),carving=scene.getObjectByName('oak-carving');
 const loadMs=+(performance.now()-t0).toFixed(0);
 let authored=true,windScale=1;
 function setAuthored(on){authored=on;for(const m of procedural)m.visible=!on;oak.visible=on;treeField.visible=on;shrubField.visible=on;meadowField.visible=on;worn.visible=on;lawn.visible=on;lawnU.uVegLawn.value=on?1:0;
  if(swingLimb)swingLimb.visible=!on;if(carving){if(on){carving.userData.vegWasVisible=carving.visible;carving.visible=false;}else carving.visible=carving.userData.vegWasVisible??true;}}
 setAuthored(true);
 const sunDir=new THREE.Vector3(),tmp=new THREE.Vector3();
 function update(camera,{dt=0,sun=null}={}){const cp=camera.getWorldPosition(tmp.clone());
  U.uTime.value=gameWind?gameWind.uTime.value:U.uTime.value+dt;U.uGust.value=gameWind?gameWind.uGust.value:.5;U.uWind.value=windScale;
  if(sun){sunDir.copy(sun.position).sub(sun.target.position).normalize().transformDirection(camera.matrixWorldInverse);U.uSunDirV.value.copy(sunDir);U.uSunCol.value.copy(sun.color).multiplyScalar(Math.min(1.2,sun.intensity/2.7));}
  if(!authored)return;
  // oak LOD
  const od=oak.position.distanceTo(cp);let l=oakLod.forced??(od>oakLod.dist[1]*(oakLod.level===2?.9:1)?2:od>oakLod.dist[0]*(oakLod.level>=1?.9:1)?1:0);
  if(l!==oakLod.level){oakLod.level=l;oak.children.forEach((m,i)=>m.visible=i===l);}
  treeField.update(cp);shrubField.update(cp);meadowField.update(cp);lawn.update(cp);}
 function setLOD(n){oakLod.forced=n;treeField.forced=n;shrubField.forced=n===null?null:Math.min(n,2);meadowField.forced=n===null?null:Math.min(n,1);for(const f of [treeField,shrubField,meadowField])f.dirty=true;}
 function stats(){const f=[treeField.stats(),shrubField.stats(),meadowField.stats(),lawn.stats()];const oakTris=oakV.lods[oakLod.level]?.tris||0;
  return {oak:{level:oakLod.level,tris:oakTris},trees:f[0],shrubs:f[1],meadow:f[2],lawn:f[3],tris:oakTris+f.reduce((a,x)=>a+x.tris,0),calls:3+f.reduce((a,x)=>a+x.calls,0)};}
 const tex=new Set();for(const m of shared.values())for(const k of ['map','normalMap','roughnessMap'])if(m[k])tex.add(m[k]);
 let gpuBytes=0;for(const t of tex){const im=t.image;if(im?.width)gpuBytes+=im.width*im.height*4*4/3;}
 Object.assign(info,{loadMs,materials:shared.size,textures:tex.size,gpuTextureMB:+(gpuBytes/1048576).toFixed(1),trees:treeField.items.length,shrubs:shrubField.items.length,meadow:meadowField.items.length,
  speciesCount:Object.fromEntries(Object.entries(treeField.items.reduce((a,it)=>{const s=it.variant.info.ll_species;a[s]=(a[s]||0)+1;return a;},{}))),variantsUsed:new Set(treeField.items.map(i=>i.variant.id)).size});
 return {oak,oakAnchors,treeField,shrubField,meadowField,lawn,update,setAuthored,get authored(){return authored;},setLOD,setWind:w=>{windScale=w;},get wind(){return windScale;},stats,info,errors,uniforms:U,gameWind:!!gameWind,procedural};
}

// ------------------------------------------------------------------------------------------------ the lookout meadow
function meadowPoints(world){const out=[],L=LOOKOUT,rng=(()=>{let s=1958;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();
 const o=L.oak,sw=L.swing,b=L.bench;
 const keep=(d,lat)=>{
  if(Math.hypot(d-o.d,lat-o.lat)<1.7)return false;                       // the trunk and its flare
  if(Math.hypot(d-sw.d,lat-sw.lat)<1.6)return false;                     // the worn patch under the swing
  if(Math.abs(d-b.d)<1.3&&Math.abs(lat-b.lat)<1.6)return false;          // the bench
  if(Math.hypot(d-(o.d+.9),lat-(o.lat-1.9))<1.2)return false;             // where the old bike lies
  if(d>1145&&d<1153.5&&lat>-3.6&&lat<1.6)return false;                   // the chalk
  if(d<1173.6){const pathLat=-.9+(d-1136.5)*.12;if(Math.abs(lat-pathLat)<1.15&&d<1169)return false;}// the trodden way from the stop
  const gy=world.surfaceY?world.surfaceY(d,lat):0;return gy>.1;};// lawn and knoll, never the bulb's asphalt
 const add=(id,d,lat,s)=>{const p=groundPoint(d,lat);out.push({id,x:p.x,y:world.groundY(d,lat)-.01,z:p.z,rot:rng()*6.283,s});};
 // beyond the field fence: the tall late-summer meadow with wildflowers and seed heads
 for(let d=1173.6;d<1200;d+=.42)for(let lat=-38;lat<38;lat+=.42){const dd=d+(rng()-.5)*.42,ll=lat+(rng()-.5)*.42,r=rng();if(rng()<Math.max(0,(Math.abs(ll)-28)/10,(dd-1192)/8))continue;// thinning out at the edges
  const id=r<.38?'meadow.tall.'+(rng()<.5?1:2):r<.46?'meadow.dry.1':r<.51?'weed.seedstalk.1':r<.56?'flower.lace.1':r<.6?'flower.susan.1':r<.97?'grass.long.'+(rng()<.5?1:2):'weed.groundcover.1';
  add(id,dd,ll,.8+rng()*.55);}
 // the knoll inside the fence: uneven longer grass, clover and weeds, taller toward the fence and the field edges
 for(let d=1146;d<1173.3;d+=.42)for(let lat=-16;lat<22;lat+=.42){const dd=d+(rng()-.5)*.4,ll=lat+(rng()-.5)*.4;if(!keep(dd,ll))continue;
  const edge=Math.max(0,(dd-1168)/5)+Math.max(0,(Math.abs(ll-3)-11)/5),r=rng(),under=Math.hypot(dd-o.d,ll-o.lat)<9;
  if(r>(.72+edge*.25)*(under?.8:1))continue;
  const id=r<.08+edge*.25?'meadow.tall.'+(rng()<.5?1:2):r<.14?'meadow.dry.1':r<.22?'weed.clover.1':r<.27&&!under?'flower.susan.1':'grass.long.'+(rng()<.5?1:2);
  add(id,dd,ll,(under?.7:.85)+rng()*.45);}
 return out;}

function wornPatch(world){const sw=LOOKOUT.swing,p=groundPoint(sw.d,sw.lat),y=world.groundY(sw.d,sw.lat);
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const id=g.createImageData(128,128);
 for(let j=0;j<128;j++)for(let i=0;i<128;i++){const dx=(i-64)/64,dy=(j-64)/64,r=Math.hypot(dx*1.15,dy),n=(Math.sin(i*.37)+Math.sin(j*.29+i*.11)+Math.sin((i+j)*.53))*.06;
  const a=Math.max(0,Math.min(1,(1-r+n)*2.2)),k=(j*128+i)*4,t=.85+.3*Math.random();id.data[k]=95*t;id.data[k+1]=74*t;id.data[k+2]=52*t;id.data[k+3]=a*235;}
 g.putImageData(id,0,0);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.6),new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
 m.rotation.x=-Math.PI/2;m.rotation.z=-heading(sw.d)+.4;m.position.set(p.x,y+.012,p.z);m.receiveShadow=true;m.name='authored-veg:worn-patch';return m;}

// ------------------------------------------------------------------------------------------------ the near lawn
// Candidate clumps are generated once per 10 m of street (lazily, as the camera nears): every lawn point (not a pad,
// driveway, walk, curb or road; not a bed, not a trunk) on a jittered 0.42 m grid. Each update keeps the clumps within
// 22 m: blades (LOD0) within 10 m, cards beyond, thinning and shrinking to nothing at the edge (no visible line).
const LAWN_BLOCK=new Set(['walk','house','porch','shed','trampoline','pole','mailbox','bins','sign','lamp','hoop']);
class LawnRing{
 constructor(scene,world,ground,U,{beds,trees}){this.world=world;this.buckets=new Map();this.root=new THREE.Group();this.root.name='authored-veg:lawn';scene.add(this.root);this.last=null;this.t=0;
  this.beds=beds;this.trees=trees;
  this.vars=['grass.lawn.1','grass.lawn.2','grass.lawn.3','grass.long.1','grass.long.2','weed.clover.1'].map(id=>ground.get(id));
  this.cap=[8000,12000];this.ims=this.vars.map(v=>[0,1].map(l=>{const L=v.lods[l];const im=new THREE.InstancedMesh(L.geo,L.mats,this.cap[l]);im.count=0;im.receiveShadow=true;im.castShadow=false;
   im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.setColorAt(0,new THREE.Color(1,1,1));im.frustumCulled=false;this.root.add(im);return im;}));
  this.R=[10,22];this.count=0;}
 isLawn(d,lat){const w=this.world;if(Math.abs(lat)<5.0||d>1140||d<-430)return false;const s=w.surfaceY(d,lat),a=w.authoredY(d,lat);
  if(Math.abs(a-s)>.004)return false;return Math.abs(s-LAWN)<.012;}
 bucket(k){if(this.buckets.has(k))return this.buckets.get(k);const pts=[];let seed=(k*2654435761)>>>0;const r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const d0=k*10,beds=this.beds.filter(b=>{const q=MAIN.project(b.x,b.z,d0+5);return q.u>d0-3&&q.u<d0+13;}),trees=this.trees.filter(t=>t.frame==='main'&&t.u>d0-3&&t.u<d0+13);
  for(let d=d0;d<d0+10;d+=.36)for(const side of [-1,1])for(let a=5.05;a<34;a+=.36){const dd=d+(r()-.5)*.5,lat=side*(a+(r()-.5)*.5);if(!this.isLawn(dd,lat))continue;
   const p=groundPoint(dd,lat);if(beds.some(b=>(b.x-p.x)**2+(b.z-p.z)**2<1.15))continue;if(this.world.space?.blocked(p.x,p.z,.06,LAWN_BLOCK))continue;// walks, porches, houses, sheds, postsif(trees.some(t=>(t.u-dd)**2+(t.v-lat)**2<(t.trunk+.25)**2))continue;
   // lots: a lot is 29 m of street; its owner mows in stripes or not, edges the walk or not, has clover or not
   const lot=Math.floor((dd+430)/29)*2+(side>0?1:0),own=hash(lot,3),al=Math.abs(lat),edge=(al>7.85&&al<8.2)||(al>5&&al<5.28);// the unedged rim along the walk and the curb
   const ragged=own<.35&&edge&&r()<.7,clover=own>.72&&r()<.12;const v=clover?5:ragged?(r()<.5?3:4):Math.floor(r()*3);
   const stripe=own>.45&&own<.8?(Math.floor(Math.abs(lat)/.7)%2?1.07:.93):1;const dry=.94+.12*r();
   pts.push(p.x,this.world.groundY(dd,lat)-.005,p.z,r()*6.283,(ragged?.5+.25*r():.85+.35*r()),v,stripe*dry,d0);}
  const f=new Float32Array(pts);this.buckets.set(k,f);if(this.buckets.size>40){const far=[...this.buckets.keys()].sort((a,b)=>Math.abs(b-k)-Math.abs(a-k))[0];this.buckets.delete(far);}return f;}
 update(cp){if(!this.root.visible)return;if(this.last&&this.last.distanceToSquared(cp)<1.2&&this.t++%20)return;this.last=(this.last||new THREE.Vector3()).copy(cp);
  const q=MAIN.project(cp.x,cp.z);if(q.u>1145||q.u<-445||Math.abs(q.v)>60){for(const a of this.ims)for(const im of a)im.count=0;this.count=0;return;}
  const k0=Math.floor((q.u-this.R[1])/10),k1=Math.floor((q.u+this.R[1])/10),n=this.ims.map(()=>[0,0]),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),P=new THREE.Vector3(),C=new THREE.Color(),Y=new THREE.Vector3(0,1,0);
  for(let k=k0;k<=k1;k++){const f=this.bucket(k);for(let i=0;i<f.length;i+=8){const dx=f[i]-cp.x,dz=f[i+2]-cp.z,d=Math.sqrt(dx*dx+dz*dz);if(d>this.R[1])continue;
   const l=d<this.R[0]?0:1;if(l===1&&((i/8)%3===1))continue;// thinner as cards
   const fade=1-Math.max(0,(d-this.R[1]*.78)/(this.R[1]*.22));const v=f[i+5],ims=this.ims[v][l];const c=n[v][l];if(c>=this.cap[l])continue;
   S.setScalar(f[i+4]*(l?1.15:1)*Math.max(.05,fade));Q.setFromAxisAngle(Y,f[i+3]);P.set(f[i],f[i+1],f[i+2]);M.compose(P,Q,S);ims.setMatrixAt(c,M);C.setScalar(f[i+6]);ims.setColorAt(c,C);n[v][l]++;}}
  let total=0;this.ims.forEach((a,v)=>a.forEach((im,l)=>{im.count=n[v][l];total+=n[v][l];im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;}));this.count=total;}
 stats(){let tris=0,calls=0;for(const a of this.ims)for(const im of a){if(!im.count)continue;tris+=im.count*(im.geometry.index?im.geometry.index.count:im.geometry.attributes.position.count)/3;calls+=1;}return {tris,calls,clumps:this.count,levels:[0,0,0],items:this.count};}
 set visible(v){this.root.visible=v;}get visible(){return this.root.visible;}
}
