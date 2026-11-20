// Authored vehicles and street props (Prologue vehicles & street-props benchmark, DEV only; nothing in the story imports
// this module). Stands the Blender-built cars, utility hardware and wires, cobra-head streetlights, mailboxes, hydrants,
// bins, hoops and fences (dist/assets/street/*.glb, atlases beside them) exactly where the procedural ones stand: world.js
// records them (buildWorld {streetprops:true}: W.sp, zones 'sp:*') and this module replaces them in place.
//   * Every placement, orientation, collision and story mark comes from the record: nothing moves, nothing is added to
//     the obstacles, the navigation or the occupancy grid. The procedural objects stay baked in batches of their own and
//     come back with setAuthored(false) (the benchmark's X key) in the same frame.
//   * Repeated things are instanced per kind, variant and LOD (one draw per kind and LOD in view); distances pick the LOD
//     per instance every frame the camera moves. Near LODs cast shadows; the far ones do not.
//   * Cars: the six US-market bodies of street.vehicles.glb (from Comrade1280's CC BY 4.0 pack, refined) on the recorded
//     car of each kind ('sedan' -> sedan or, for about one in three, the hatchback; 'van' -> minivan; 'suv'; 'pickup';
//     'wagon'); one paint shader for all of them: the atlas's paint mask takes a restrained period colour per car (the
//     recorded colour's period equivalent), a clear coat reflecting a small evening environment, and per-car age and dirt
//     (sun-faded tops, road film low on the body, dust). Tyres stand on the driveway: each car is pitched and rolled to
//     the four contact points (the procedural cars are level and can float by a few centimetres on sloped drives).
//   * The parent's minivan that comes home during the ride (ambient.js) is upgraded in place: same group, same path, same
//     garage; its wheels keep turning and its headlamps keep the game's own lamp material.
import * as THREE from './three.module.js';
import {loadAsset} from './asset-library.js';
import {MAIN} from './terrain.js';

export const SP_ASSETS=['street.vehicles','street.props'];
const TEXTURES={
 vehA:{map:'assets/street/veh_a_albedo.jpg',orm:'assets/street/veh_a_orm.png'},
 vehB:{map:'assets/street/veh_b_albedo.jpg',orm:'assets/street/veh_b_orm.png'},
 propsA:{map:'assets/street/props_albedo.jpg',orm:'assets/street/props_orm.png',normal:'assets/street/props_normal.png'},
 chain:{map:'assets/street/props_cutout.png'},
};
function urlFor(file){const packed=globalThis.__LL_ASSETS__?.[file];if(packed)return packed;if(globalThis.__LL_OFFLINE__)throw Error(`asset ${file} is not embedded in this offline package (package with PLAYTEST_MODELS=1)`);return new URL('./'+file,import.meta.url).href;}
export const hash=(...v)=>{let h=2166136261;for(const x of v){h^=Math.floor(x*1000)|0;h=Math.imul(h,16777619);}h^=h>>>13;h=Math.imul(h,1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
const lin=hex=>new THREE.Color(hex);// (THREE.Color.setHex converts sRGB to the working linear space)

// The procedural palette (palette.js CAR.colors) -> the period paint each colour stands for: restrained 1997-2010 US
// colours, [sRGB hex, metallic flake 0..1]. The hue family of every recorded car is kept.
const PAINT=new Map([[0x9d7064,[0x6e302b,.55]],[0x7d9294,[0x6c807e,.5]],[0xcbc0a1,[0xb3a689,.6]],[0x4a5560,[0x4b535c,.55]],[0x8c8f8e,[0x9a9d9e,.75]],
 [0xe0ddd4,[0xdedbd2,0]],[0x5a2f2f,[0x4a2124,.45]],[0x2f3f55,[0x222d42,.45]],[0x6f7f8a,[0x66737d,.55]],[0x3b4a3a,[0x2b3a2e,.4]]]);
export function paintFor(hex){const p=PAINT.get(hex)||[hex,.3];return {color:lin(p[0]),flake:p[1]};}
const KIND={sedan:'sedan',van:'minivan',suv:'suv',pickup:'pickup',wagon:'wagon'};

// ------------------------------------------------------------------------------------------------ textures
export async function loadTextures(renderer,groups){
 const loader=new THREE.TextureLoader(),aniso=renderer?.capabilities?.getMaxAnisotropy?.()??1,info={files:[],gpuMB:0,aniso};
 const load=(file,srgb)=>new Promise((res,rej)=>{let u;try{u=urlFor(file);}catch(e){rej(e);return;}
  loader.load(u,t=>{t.flipY=false;t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=Math.min(8,aniso);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.name=file;info.files.push({file,w:t.image.width,h:t.image.height});res(t);},undefined,()=>rej(Error('could not load '+file)));});
 const out={};
 for(const g of groups){const T=TEXTURES[g];out[g]={};for(const [k,f] of Object.entries(T))out[g][k]=await load(f,k==='map');}
 info.gpuMB=+(info.files.reduce((s,f)=>s+f.w*f.h*4*4/3,0)/1048576).toFixed(1);
 return {tex:out,info};
}

// ------------------------------------------------------------------------------------------------ reflections
// A small environment for the cars' paint and glass and the props' metal: the evening sky (from the hemisphere light and
// the fog the game sets every frame), a warm band where the sun is, the street below. Rebuilt every few seconds as the
// evening changes; one PMREM target shared by every street-props material. Nothing else in the scene uses it.
export function createReflections(renderer){
 const W=64,H=32,data=new Uint8Array(W*H*4),tex=new THREE.DataTexture(data,W,H);tex.mapping=THREE.EquirectangularReflectionMapping;tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=tex.minFilter=THREE.LinearFilter;
 const pmrem=new THREE.PMREMGenerator(renderer);let target=null,last=-1e9,key='';
 const c=new THREE.Color(),sky=new THREE.Color(),hor=new THREE.Color(),gnd=new THREE.Color(),sunC=new THREE.Color(),tmp=new THREE.Vector3();
 const api={texture:null,intensity:1,
  update(now,{hemi,fog,sun,force=false}={}){
   if(!force&&now-last<2500)return false;
   sky.copy(hemi?.color||c.set(0xbfd0e0)).multiplyScalar(.62);hor.copy(fog||c.set(0xe0b294));gnd.copy(hemi?.groundColor||c.set(0x68675d)).multiplyScalar(.55);
   sunC.copy(sun?.color||c.set(0xffd09b));const sd=sun?tmp.subVectors(sun.position,sun.target.position).normalize():tmp.set(.3,.25,-.9).normalize();
   const k=[sky,hor,gnd,sunC].map(x=>x.getHexString()).join('')+sd.x.toFixed(2)+sd.z.toFixed(2)+(hemi?.intensity||0).toFixed(2);
   if(!force&&k===key){last=now;return false;}key=k;last=now;
   const sAz=Math.atan2(sd.x,-sd.z),sEl=Math.asin(Math.max(-1,Math.min(1,sd.y)));
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){const el=(.5-(y+.5)/H)*Math.PI,az=((x+.5)/W)*Math.PI*2-Math.PI;
    if(el>=0){const t=Math.pow(el/(Math.PI/2),.55);c.copy(hor).lerp(sky,t);}else{const t=Math.min(1,-el/.35);c.copy(hor).multiplyScalar(.55).lerp(gnd,t);}
    const da=Math.acos(Math.max(-1,Math.min(1,Math.cos(el)*Math.cos(sEl)*Math.cos(az-sAz)+Math.sin(el)*Math.sin(sEl))));
    c.lerp(sunC,Math.max(0,1-da/.6)**3*.7);
    const i=(y*W+x)*4;c.convertLinearToSRGB();data[i]=Math.min(255,c.r*255);data[i+1]=Math.min(255,c.g*255);data[i+2]=Math.min(255,c.b*255);data[i+3]=255;}
   tex.needsUpdate=true;const old=target;target=pmrem.fromEquirectangular(tex,target||undefined);api.texture=target.texture;
   if(old&&old!==target)old.dispose();
   api.intensity=.55+.45*Math.min(1,(hemi?.intensity||2)/2);return true;},
  dispose(){target?.dispose();pmrem.dispose();tex.dispose();}};
 return api;
}

// ------------------------------------------------------------------------------------------------ materials
const NOISE=`
 float spH(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
 float spN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(spH(i),spH(i+vec3(1,0,0)),f.x),mix(spH(i+vec3(0,1,0)),spH(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(spH(i+vec3(0,0,1)),spH(i+vec3(1,0,1)),f.x),mix(spH(i+vec3(0,1,1)),spH(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
// The cars: atlas albedo, ORM (R paint mask, G roughness, B metalness); per instance iPaint (linear colour) and iWear
// (age, dirt, seed, flake). Clear coat: a sharp, Fresnel-weighted reflection of the environment over the painted panels.
export function vehicleMaterial({map,orm},shared){
 const m=new THREE.MeshStandardMaterial({map,roughnessMap:orm,metalnessMap:orm,roughness:1,metalness:1,envMapIntensity:1});
 m.name='sp:vehicle';m.userData.spShared=shared;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,shared.uniforms);
  sh.vertexShader='attribute vec3 iPaint;attribute vec4 iWear;varying vec3 vPaint;varying vec4 vWear;varying vec3 vOP;varying vec3 vON;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vPaint=iPaint;vWear=iWear;vOP=position;vON=normal;');
  sh.fragmentShader='uniform float uClear;varying vec3 vPaint;varying vec4 vWear;varying vec3 vOP;varying vec3 vON;\n'+NOISE+'\n'+sh.fragmentShader
   .replace('#include <map_fragment>',`#include <map_fragment>
    float spPaint=texture2D(roughnessMap,vRoughnessMapUv).r;
    float spUp=smoothstep(.55,.95,normalize(vON).y);
    float spNz=spN(vOP*vec3(2.3,4.1,2.3)+vWear.z*31.);float spFine=spN(vOP*31.+vWear.z*7.);
    // paint: the panel's own shading (0.5 = its median) times the car's colour
    vec3 spCol=vPaint*diffuseColor.rgb*2.;
    // sun-faded clear coat and paint on the tops of older cars
    spCol=mix(spCol,spCol*.82+vec3(.035),spUp*vWear.x*(.45+.55*spNz));
    diffuseColor.rgb=mix(diffuseColor.rgb,spCol,spPaint);
    // road film low on the body and round the wheels; summer dust on the horizontal panels and the glass line
    float spLow=smoothstep(.62,.08,vOP.y)*(.55+.45*spNz);
    float spGrime=spLow*vWear.y;
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.105,.092,.078),spGrime*.55);
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.88+vec3(.045,.041,.034),spUp*vWear.y*.6*(.4+.6*spFine));`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=mix(roughnessFactor,.30+.26*vWear.x*spUp+.08*spNz*vWear.x,spPaint);
    roughnessFactor=min(1.,roughnessFactor+spGrime*.35+spUp*vWear.y*.18);`)
   .replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
    metalnessFactor=mix(metalnessFactor,vWear.w*(.42-.2*vWear.x),spPaint);`)
   .replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    #ifdef USE_ENVMAP
    {float spCo=spPaint*(1.-vWear.x*.55)*(1.-spGrime)*uClear;
     float spF=.045+.955*pow(1.-clamp(dot(geometryNormal,geometryViewDir),0.,1.),5.);
     reflectedLight.indirectSpecular+=getIBLRadiance(geometryViewDir,geometryNormal,.035+.12*vWear.x*spUp)*spF*spCo*envMapIntensity;}
    #endif`);};
 m.customProgramCacheKey=()=>'ll-sp-vehicle';return m;
}
// Window glass: tinted, reflective (more opaque at a glancing angle), the cabin seen through it.
export function glassMaterial(shared,{far=false}={}){
 const m=new THREE.MeshStandardMaterial({color:far?0x161d21:0x1c2427,roughness:.05,metalness:0,transparent:!far,opacity:far?1:.58,envMapIntensity:1.15,depthWrite:far});
 m.name=far?'sp:glass-far':'sp:glass';m.userData.spShared=shared;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,shared.uniforms);
  sh.vertexShader='attribute vec3 iPaint;attribute vec4 iWear;varying vec4 vWear;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vWear=iWear;');
  sh.fragmentShader='varying vec4 vWear;\n'+sh.fragmentShader.replace('#include <opaque_fragment>',`
    {float spF=pow(1.-clamp(dot(normalize(vNormal),normalize(vViewPosition)),0.,1.),3.);diffuseColor.a=mix(diffuseColor.a,1.,spF*.75);}
    outgoingLight=mix(outgoingLight,outgoingLight*.8+vec3(.05,.047,.04),vWear.y*.35);
    #include <opaque_fragment>`);};
 m.customProgramCacheKey=()=>'ll-sp-glass'+(far?'-far':'');return m;
}

// ------------------------------------------------------------------------------------------------ instancing with LOD
// One InstancedMesh per LOD level and primitive; instances are bucketed by distance each time the camera moves.
// attrs: {name: itemSize} per-instance attributes copied from each item's own arrays.
export class LodSet{
 constructor(name,levels,{dist=[30,80,320],shadow=[true,true,false],attrs={},capacity=64,scene}){
  this.name=name;this.levels=levels;this.dist=dist;this.items=[];this.attrs=attrs;this.forced=null;this.visible=true;this.scene=scene;this.capacity=capacity;this.meshes=[];this.counts=levels.map(()=>0);
  levels.forEach((prims,l)=>{for(const p of prims){const g=new THREE.BufferGeometry();for(const [k,a] of Object.entries(p.geometry.attributes))g.setAttribute(k,a);if(p.geometry.index)g.setIndex(p.geometry.index);
   for(const [k,n] of Object.entries(attrs))g.setAttribute(k,new THREE.InstancedBufferAttribute(new Float32Array(capacity*n),n));
   g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e5);const im=new THREE.InstancedMesh(g,p.material,capacity);im.count=0;im.frustumCulled=false;im.castShadow=!!shadow[l]&&!p.noShadow;im.receiveShadow=true;
   im.name=`sp:${name}:lod${l}:${p.material.name||''}`;im.userData.spLevel=l;im.userData.spSet=name;scene.add(im);this.meshes.push({l,im});}});
  this._p=new THREE.Vector3();this._moved=null;}
 add(matrix,data={}){const p=new THREE.Vector3().setFromMatrixPosition(matrix);this.items.push({matrix:matrix.clone(),pos:p,data,r:data.radius||2});if(this.items.length>this.capacity)this.grow(this.capacity*2);return this.items.length-1;}
 grow(n){this.capacity=n;for(const {im} of this.meshes){const g=im.geometry,old=im.instanceMatrix;im.instanceMatrix=new THREE.InstancedBufferAttribute(new Float32Array(n*16),16);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  for(const [k,s] of Object.entries(this.attrs))g.setAttribute(k,new THREE.InstancedBufferAttribute(new Float32Array(n*s),s));im.dispose?.();}this._moved=null;}
 setVisible(v){this.visible=v;for(const {im} of this.meshes)im.visible=v&&im.count>0;}
 update(cam,force=false){const c=cam.position;if(!force&&this._moved&&this._moved.distanceToSquared(c)<.04&&this._forced===this.forced)return;this._moved=(this._moved||new THREE.Vector3()).copy(c);this._forced=this.forced;
  const L=this.levels.length,buckets=Array.from({length:L},()=>[]);
  for(const it of this.items){const d=it.pos.distanceTo(c)-it.r*.25;let l=this.forced??(d<this.dist[0]?0:d<this.dist[1]?1:d<this.dist[2]?2:-1);if(l>=L)l=L-1;if(l>=0)buckets[l].push(it);}
  this.counts=buckets.map(b=>b.length);
  for(const {l,im} of this.meshes){const b=buckets[l];im.count=b.length;const g=im.geometry;
   for(let i=0;i<b.length;i++){im.setMatrixAt(i,b[i].matrix);for(const [k,n] of Object.entries(this.attrs)){const a=g.attributes[k],v=b[i].data[k];if(v)for(let j=0;j<n;j++)a.array[i*n+j]=v[j];}}
   im.instanceMatrix.needsUpdate=true;for(const k of Object.keys(this.attrs))g.attributes[k].needsUpdate=true;im.visible=this.visible&&b.length>0;}}
 stats(){let tris=0,calls=0;for(const {l,im} of this.meshes){if(!im.visible||!im.count)continue;calls++;const g=im.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3*im.count;}return {tris,calls,counts:this.counts.slice(),items:this.items.length};}
}

// ------------------------------------------------------------------------------------------------ GLB access
// (GLTFLoader names nodes through PropertyBinding.sanitizeNodeName: the dots of 'veh.sedan.lod0' are dropped)
function primitives(template,name){const node=template.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));if(!node)throw Error(`missing node ${name}`);const out=[];node.updateWorldMatrix(true,true);
 node.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();const m=new THREE.Matrix4().copy(o.matrixWorld);if(!m.equals(new THREE.Matrix4()))g.applyMatrix4(m);out.push({geometry:g,mname:o.material?.name||''});}});return out;}
const ROT_PI=new THREE.Matrix4().makeRotationY(Math.PI);// glTF front (+Z) -> the game's front (-Z)
const gl=b=>[b[0],b[2],-b[1]];// a point measured in Blender (z up) -> glTF / three.js (y up)

// ------------------------------------------------------------------------------------------------ vehicles
export async function placeVehicles({world,scene,renderer,camera,shared,tex,errors}){
 const R=world.streetProps,A=await loadAsset('street.vehicles',{renderer}),T=A.template;
 const info={};T.traverse(o=>{for(const [k,v] of Object.entries(o.userData||{}))if(k.startsWith('veh_'))info[k.slice(4)]=JSON.parse(v);});
 const mats={veh_A:vehicleMaterial(tex.vehA,shared),veh_B:vehicleMaterial(tex.vehB,shared),glass:glassMaterial(shared),glassFar:glassMaterial(shared,{far:true})};
 const matFor=(n,l)=>n==='veh_glass'?(l===2?mats.glassFar:mats.glass):mats[n]||mats.veh_B;
 const sets={};
 for(const t of Object.keys(info)){const levels=[0,1,2].map(l=>[...primitives(T,`veh.${t}.lod${l}`),...primitives(T,`veh.${t}.lod${l}.glass`)].map(p=>({geometry:p.geometry,material:matFor(p.mname,l),noShadow:p.mname==='veh_glass'})));
  sets[t]=new LodSet('car:'+t,levels,{dist:[26,75,420],shadow:[true,true,false],attrs:{iPaint:3,iWear:4},capacity:16,scene});}
 const q=new THREE.Quaternion(),s=new THREE.Vector3(1,1,1),m4=new THREE.Matrix4(),tmp=new THREE.Vector3();
 const placed=[];let tilted=0,maxGap=0;
 for(const rec of R.cars){const g=rec.g;g.updateWorldMatrix(true,false);
  const h=hash(g.matrixWorld.elements[12],g.matrixWorld.elements[14]);
  let t=KIND[rec.kind]||'sedan';if(t==='sedan'&&h<.34)t='hatchback';
  const I=info[t],M=new THREE.Matrix4().copy(g.matrixWorld).multiply(ROT_PI);
  // stand the four tyres on the ground the riders use (Oak Hollow's drives): pitch and roll to the contact points
  if(rec.frame==='main'&&world.groundY){const W4=I.wheels.map(gl),ys=W4.map(w=>{tmp.set(w[0],0,w[2]).applyMatrix4(M);const p=MAIN.project(tmp.x,tmp.z);return world.groundY(p.u,p.v);});
   const y0=new THREE.Vector3().setFromMatrixPosition(M).y,avg=f=>{const k=W4.map((w,i)=>f(w)?i:-1).filter(i=>i>=0);return [k.reduce((a,i)=>a+ys[i],0)/k.length,k.reduce((a,i)=>a+W4[i][0],0)/k.length];};
   const [front]=avg(w=>w[2]>0),[rear]=avg(w=>w[2]<0),[left,lx]=avg(w=>w[0]>0),[right,rx]=avg(w=>w[0]<0);
   const pitch=Math.atan2(front-rear,I.wheelbase),roll=Math.atan2(left-right,lx-rx),dy=(front+rear)/2-y0;
   const gap=Math.max(...ys.map(y=>Math.abs(y-y0)));maxGap=Math.max(maxGap,gap);
   if(Math.abs(dy)<.25&&Math.abs(pitch)<.12&&Math.abs(roll)<.08&&gap>.004){M.multiply(m4.makeRotationX(-pitch)).multiply(m4.makeRotationZ(roll));M.elements[13]+=dy;tilted++;}}
  const p=paintFor(rec.color),w=hash(h*7.3),age=w<.32?.12+w*.4:w<.8?.38+(w-.32)*.45:.72+(w-.8)*1.2;
  const data={iPaint:[p.color.r,p.color.g,p.color.b],iWear:[Math.min(1,age),Math.min(1,.15+age*.55+hash(h*3.1)*.25),hash(h*5.7)*10,p.flake],radius:2.6};
  const id=sets[t].add(M,data);placed.push({rec,type:t,id,paint:rec.color,age:+data.iWear[0].toFixed(2),dirt:+data.iWear[1].toFixed(2)});}
 // the parent's minivan (ambient.js: the first car the running game asks world.car for): upgraded in place
 const dyn=(R.dynCars||[]).find(d=>d.kind==='van'&&d.group.parent===scene)||null;let dynamic=null;
 if(dyn){const I=info.minivan,root=new THREE.Group();root.name='sp:dynamic-car';root.rotation.y=Math.PI;dyn.group.add(root);
  const p=paintFor(dyn.color),data={iPaint:[p.color.r,p.color.g,p.color.b],iWear:[.3,.35,3.3,p.flake]};
  const one=(geometry,material,shadow=true)=>{const g=new THREE.BufferGeometry();for(const [k,a] of Object.entries(geometry.attributes))g.setAttribute(k,a);if(geometry.index)g.setIndex(geometry.index);
   g.setAttribute('iPaint',new THREE.InstancedBufferAttribute(new Float32Array(data.iPaint),3));g.setAttribute('iWear',new THREE.InstancedBufferAttribute(new Float32Array(data.iWear),4));
   const im=new THREE.InstancedMesh(g,material,1);im.setMatrixAt(0,new THREE.Matrix4());im.castShadow=shadow;im.receiveShadow=true;im.frustumCulled=false;return im;};
  for(const pr of [...primitives(T,'veh.minivan.shell'),...primitives(T,'veh.minivan.lod0.glass')])root.add(one(pr.geometry,matFor(pr.mname,0),pr.mname!=='veh_glass'));
  const wheelGeo=primitives(T,'veh.minivan.wheel')[0],pivots=I.wheels.map(gl).map(w=>{const pv=new THREE.Group();pv.position.set(...w);root.add(pv);pv.add(one(wheelGeo.geometry,mats.veh_B));return pv;});
  // its headlamps: quads in the game's own lamp material (ambient.js dims it as the engine stops)
  for(const h of (I.lamps?.head||[]).map(gl)){const q=new THREE.Mesh(new THREE.PlaneGeometry(.26,.13),dyn.parts.head);q.position.set(h[0],h[1],h[2]+.02);root.add(q);}// (facing +Z: the model's front)
  const proc=[];dyn.group.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!root.getObjectById(o.id)&&o.parent!==root)proc.push(o);});
  dynamic={root,pivots,proc,parts:dyn.parts,set(on){root.visible=on;for(const o of proc)o.visible=!on;},
   tick(){const a=dyn.parts.wheels[0]?.rotation.x||0;for(const pv of pivots)pv.rotation.x=-a;}};}
 else errors.push('the moving minivan was not found (ambient.js); left procedural');
 const procedural=world.merged.filter(m=>m.userData.zone==='sp:car'),proxies=world.shadowProxies.filter(m=>m.userData.zone==='sp:car');
 return {sets,mats,info,placed,dynamic,tilted,maxGap,
  setAuthored(on){for(const s of Object.values(sets))s.setVisible(on);for(const m of procedural)m.visible=!on;for(const m of proxies)m.visible=!on;dynamic?.set(on);},
  update(cam,force){for(const s of Object.values(sets))s.update(cam,force);dynamic?.tick();},
  stats(){const o={tris:0,calls:0,instances:0,levels:[0,0,0]};for(const s of Object.values(sets)){const st=s.stats();o.tris+=st.tris;o.calls+=st.calls;o.instances+=st.items;st.counts.forEach((c,i)=>o.levels[i]+=c);}return o;}};
}

// ------------------------------------------------------------------------------------------------ props materials
// The props atlas: albedo, tangent normals, ORM (R tint mask, G roughness, B metalness). Per instance iTint (linear colour
// for the masked paint: mailboxes, carts) and iVar (seed, age 0..1, kind: 1 wood pole, 2 fence wood, 0 other; spare).
export function propsMaterial({map,orm,normal},shared){
 const m=new THREE.MeshStandardMaterial({map,normalMap:normal,roughnessMap:orm,metalnessMap:orm,roughness:1,metalness:1,envMapIntensity:.8});
 m.name='sp:props';m.userData.spShared=shared;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,shared.uniforms);
  sh.vertexShader='attribute vec3 iTint;attribute vec4 iVar;varying vec3 vTint;varying vec4 vVar;varying vec3 vOP;varying vec3 vWP;\n'+sh.vertexShader
   .replace('#include <begin_vertex>','#include <begin_vertex>\n vTint=iTint;vVar=iVar;vOP=position;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n #ifdef USE_INSTANCING\n vWP=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n #else\n vWP=(modelMatrix*vec4(transformed,1.)).xyz;\n #endif');
  sh.fragmentShader='varying vec3 vTint;varying vec4 vVar;varying vec3 vOP;varying vec3 vWP;\n'+NOISE+'\n'+sh.fragmentShader
   .replace('#include <map_fragment>',`#include <map_fragment>
    float spMask=texture2D(roughnessMap,vRoughnessMapUv).r;
    diffuseColor.rgb=mix(diffuseColor.rgb,vTint*diffuseColor.rgb*2.,spMask);
    float spNz=spN(vWP*1.7+vVar.x*13.);
    // each object a little different in value and warmth; older ones duller
    diffuseColor.rgb*=(.93+.14*fract(vVar.x*7.31))*mix(vec3(1.),vec3(1.03,1.,.95),fract(vVar.x*3.7));
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(.3,.59,.11))),vVar.y*.25);
    // wood poles: creosote dark at the ground line, silvered higher up on the old ones
    if(vVar.z>.5&&vVar.z<1.5){float g=smoothstep(1.6,.1,vOP.y);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.55,.5,.45),g*(.6+.4*spNz));
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(.3,.59,.11)))*1.15,smoothstep(2.,8.,vOP.y)*vVar.y*.45);}
    // soil and splash at the foot of anything standing in a lawn or a bed
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.62,.57,.5),smoothstep(.16,0.,vOP.y)*(.5+.5*spNz)*.7);`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=min(1.,roughnessFactor+vVar.y*.12*spNz);`);};
 m.customProgramCacheKey=()=>'ll-sp-props';return m;
}
// Chain link and the hoops' nets: cut-outs. Chain-link UVs are in 0.4 m tiles offset by 10 in u (the tile repeats on its own).
export function cutoutMaterial({map},shared){
 const m=new THREE.MeshStandardMaterial({map,alphaTest:.5,side:THREE.DoubleSide,roughness:.55,metalness:.6,envMapIntensity:.6});
 m.name='sp:cutout';m.userData.spShared=shared;
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
    vec2 spUv=vMapUv;bool spChain=spUv.x>9.;if(spChain)spUv=vec2(fract(spUv.x)*.5,fract(spUv.y)*.5);
    vec4 sampledDiffuseColor=spChain?textureGrad(map,spUv,dFdx(vMapUv)*.5,dFdy(vMapUv)*.5):texture2D(map,spUv);
    diffuseColor*=sampledDiffuseColor;`);};
 m.customProgramCacheKey=()=>'ll-sp-cutout';return m;
}
// The cobra heads' HPS refractors: lit by the game's own lamp levels (world.lampLit's uniform array, set by ambient.js as
// each lamp comes on), the same colour ramp as the original heads (orange as it strikes, warmer white when up).
export function lensMaterial({map},shared,lampUniform){
 const m=new THREE.MeshStandardMaterial({map,roughness:.22,metalness:0,emissive:0xffffff,envMapIntensity:.8});
 m.name='sp:lens';m.userData.spShared=shared;
 m.onBeforeCompile=sh=>{sh.uniforms.uLevel=lampUniform;
  sh.vertexShader='uniform float uLevel[32];attribute float iLamp;varying float vLamp;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vLamp=uLevel[int(iLamp+.5)];');
  sh.fragmentShader='varying float vLamp;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    totalEmissiveRadiance=vec3(1.,.55+.2*vLamp,.25+.1*vLamp)*vLamp*2.4*(.75+.5*diffuseColor.g);
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.82,.4);`);};
 m.customProgramCacheKey=()=>'ll-sp-lens';return m;
}

// ------------------------------------------------------------------------------------------------ overhead wires
// Every recorded wire, on the authored hardware's attachment points, as a ribbon that keeps its true thickness near the
// camera (12-18 mm conductors, a thicker service drop) and never thins below about a pixel far away (its coverage fades
// instead of aliasing). One draw for the whole network; no shadow.
function wireMaterial(){
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
  uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uPx:{value:.001},uLight:{value:new THREE.Color(1,1,1)},uSun:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color(1,.8,.6)}}]),
  vertexShader:`attribute vec3 aDir;attribute float aSide;attribute float aRad;attribute vec3 aCol;uniform float uPx;varying float vCov;varying float vS;varying vec3 vCol;varying vec3 vT;
   #include <fog_pars_vertex>
   void main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.);vec3 dv=normalize((modelViewMatrix*vec4(aDir,0.)).xyz);
    vec3 sd=normalize(cross(dv,normalize(mvPosition.xyz)));float dist=-mvPosition.z;float w=max(aRad,uPx*dist*.7);
    vCov=clamp(aRad/w,.12,1.);vS=aSide;vCol=aCol;vT=normalize((modelMatrix*vec4(aDir,0.)).xyz);
    mvPosition.xyz+=sd*aSide*w;gl_Position=projectionMatrix*mvPosition;
    #include <fog_vertex>
   }`,
  fragmentShader:`uniform vec3 uLight;uniform vec3 uSun;uniform vec3 uSunCol;varying float vCov;varying float vS;varying vec3 vCol;varying vec3 vT;
   #include <fog_pars_fragment>
   void main(){float sh=.72+.28*(1.-vS*vS);float gl=pow(max(0.,1.-abs(dot(vT,uSun))),24.)*.6;
    vec3 c=vCol*(uLight*sh+uSunCol*gl*(1.-vS*vS));gl_FragColor=vec4(c,min(1.,vCov*1.6)*(1.-pow(abs(vS),6.)*.5));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
   }`});
 m.name='sp:wires';return m;}
function wireGeometry(list){
 const P=[],D=[],S=[],R=[],C=[],I=[];let base=0;
 for(const w of list){const n=w.pts.length;for(let i=0;i<n;i++){const p=w.pts[i],a=w.pts[Math.max(0,i-1)],b=w.pts[Math.min(n-1,i+1)];const d=new THREE.Vector3().subVectors(b,a).normalize();
   for(const s of [-1,1]){P.push(p.x,p.y,p.z);D.push(d.x,d.y,d.z);S.push(s);R.push(w.r);C.push(w.c.r,w.c.g,w.c.b);}}
  for(let i=0;i<n-1;i++){const k=base+i*2;I.push(k,k+2,k+1,k+1,k+2,k+3);}base+=n*2;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aDir',new THREE.Float32BufferAttribute(D,3));g.setAttribute('aSide',new THREE.Float32BufferAttribute(S,1));
 g.setAttribute('aRad',new THREE.Float32BufferAttribute(R,1));g.setAttribute('aCol',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();return g;}
const sagPts=(a,b,s,n=24)=>{const out=[];for(let k=0;k<=n;k++){const t=k/n;out.push(new THREE.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-4*s*t*(1-t),a.z+(b.z-a.z)*t));}return out;};

// ------------------------------------------------------------------------------------------------ props
const PROP_LODS={pole:[40,110,420],arm:[35,95,300],small:[22,55,170],fence:[18,52,190],lamp:[40,110,420]};
// the procedural colours -> their period equivalents (carts; mailbox boxes)
const CART_TINT=new Map([[0x3d4a3c,0x2f3d33],[0x3f4246,0x3a3c3f],[0x4b4f4a,0x46504a],[0x33537a,0x2b4a78]]);
const BOX_TINT=new Map([[0x2d2f31,0x262729],[0x3a4d63,0x34475d],[0x5e3a33,0x5a2e2a],[0xd8d2c4,0xd2ccbc]]);
export async function placeProps({world,scene,renderer,shared,tex,errors}){
 const R=world.streetProps,A=await loadAsset('street.props',{renderer}),T=A.template;
 let attach=null;T.traverse(o=>{if(o.userData?.sp_attach)attach=JSON.parse(o.userData.sp_attach);});if(!attach)throw Error('street.props.glb: no attachment table');
 const lampU=world.lampLit?.userData?.uniforms?.uLevel;if(!lampU)errors.push('no lamp level uniform: lamp lenses stay dark');
 const mats={props_A:propsMaterial(tex.propsA,shared),props_cut:cutoutMaterial(tex.chain,shared),props_lens:lensMaterial(tex.propsA,shared,lampU||{value:new Float32Array(32)})};
 const wiresMat=wireMaterial();
 const has=n=>!!T.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(n));
 const lev=name=>[0,1,2].filter(l=>has(`${name}.lod${l}`)).map(l=>primitives(T,`${name}.lod${l}`).map(p=>({geometry:p.geometry,material:mats[p.mname]||mats.props_A,noShadow:p.mname==='props_cut'})));
 const sets={},attrs={iTint:3,iVar:4};
 const set=(key,dist,opt={})=>sets[key]||(sets[key]=new LodSet(key,lev(key),{dist,shadow:opt.shadow||[true,true,false],attrs:opt.attrs||attrs,capacity:opt.capacity||32,scene}));
 const tmp=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion();
 const white=[1,1,1],tintOf=hex=>{const c=lin(hex);return [c.r,c.g,c.b];};
 const at=(g,x=0,y=0,z=0,ry=0)=>{g.updateWorldMatrix(true,false);return new THREE.Matrix4().copy(g.matrixWorld).multiply(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(1,1,1)));};
 const stats={};const count=k=>stats[k]=(stats[k]||0)+1;
 // utility poles: shaft, crossarm, transformer bank, secondary rack, side pins where the conductors run along the arm
 const poleM=[];
 for(const p of R.poles){const h=hash(p.x,p.z),age=.3+.6*hash(p.z,p.x),pm=at(p.g);poleM[p.index]=pm;
  set('pole.shaft',PROP_LODS.pole).add(pm,{iTint:white,iVar:[h*10,age,1,0],radius:5});
  set('pole.arm',PROP_LODS.arm).add(pm,{iTint:white,iVar:[h*10,age,0,0],radius:1.2});
  set('pole.rack',PROP_LODS.small,{shadow:[true,false,false]}).add(pm,{iTint:white,iVar:[h*10,age,0,0],radius:.3});
  if(p.transformer){set('pole.xfmr',PROP_LODS.arm).add(pm,{iTint:white,iVar:[h*10,age,0,0],radius:1});count('transformers');}
  count('poles');}
 // where each wire meets its pole on the authored hardware (the original's attachment, moved onto an insulator):
 // primaries onto the crossarm's insulators; the neutral and the service drops onto the secondary rack under the
 // transformers; where the conductors run along a turned crossarm (the junction pole), onto side pins above and below it
 const sideAt=new Set();
 const local=(e,role)=>{if(e.dx!==0)return [Math.sign(e.dx)*attach.primary[0],attach.primary[1],0];
  if(role==='neutral')return [attach.neutral[0],attach.neutral[1],0];
  if(role==='drop')return [attach.drop[0],attach.drop[1],0];
  if(role==='primary-top'){sideAt.add(e.pole+':top');return [0,9.05,.2];}
  if(role==='primary-low'){sideAt.add(e.pole+':low');return [0,8.1,-.2];}
  return [0,e.h,0];};
 const W=(pole,l)=>new THREE.Vector3(...l).applyMatrix4(poleM[pole]);
 const wires=[];
 for(const s of R.spans){const A2=W(s.a.pole,local(s.a,s.role)),B2=W(s.b.pole,local(s.b,s.role));
  wires.push({pts:sagPts(A2,B2,s.sag),r:s.role==='neutral'?.0075:.0065,c:lin(s.role==='neutral'?0x6e6c66:0x7c7a73),kind:s.role});}
 for(const d of R.drops){const A2=W(d.a.pole,local(d.a,'drop')),B2=new THREE.Vector3(d.house.x,d.house.y,d.house.z);wires.push({pts:sagPts(A2,B2,d.sag,18),r:.009,c:lin(0x232120),kind:'drop'});}
 for(const gy of R.guys){const pm=poleM[gy.pole??gy.a?.pole],P0=new THREE.Vector3().setFromMatrixPosition(pm),B2=new THREE.Vector3(...gy.pts[gy.pts.length-1]);
  const dir=new THREE.Vector3(B2.x-P0.x,0,B2.z-P0.z).normalize(),A2=new THREE.Vector3(P0.x,P0.y+8.6,P0.z).addScaledVector(dir,.12);
  wires.push({pts:sagPts(A2,B2,.02,6),r:.006,c:lin(0x8a8a86),kind:'guy'});
  const up=new THREE.Vector3().subVectors(A2,B2).normalize(),gm=new THREE.Matrix4().compose(B2,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),up),new THREE.Vector3(1,1,1));
  set('pole.guard',PROP_LODS.small,{shadow:[true,false,false]}).add(gm,{iTint:white,iVar:[1,.4,0,0],radius:1.2});count('guys');}
 for(const k of sideAt){const [pole,which]=k.split(':'),pm=poleM[+pole],y=which==='top'?9.05:8.1,top=which==='top';
  const sm=new THREE.Matrix4().copy(pm).multiply(tmp.compose(v.set(0,y,0),q.setFromEuler(new THREE.Euler(0,top?0:Math.PI,0)),new THREE.Vector3(1,1,1)).clone());
  // (the side pin's own origin is its tie point 0.16 m off the axis; the wire meets it 0.2 m out: move it out 4 cm)
  sm.multiply(tmp.makeTranslation(0,0,.04));
  set('pole.sidepin',PROP_LODS.small).add(sm,{iTint:white,iVar:[1,.4,0,0],radius:.3});count('sidepins');}
 const wireMesh=new THREE.Mesh(wireGeometry(wires),wiresMat);wireMesh.frustumCulled=false;wireMesh.name='sp:wires';wireMesh.renderOrder=2;scene.add(wireMesh);
 stats.wires=wires.length;
 // streetlights (cobra heads), their lenses lit per lamp
 for(const l of R.lamps){const m=at(l.g),h=hash(m.elements[12],m.elements[14]);
  set('lamp',PROP_LODS.lamp).add(m,{iTint:white,iVar:[h*10,.3+.4*h,0,0],radius:4});
  set('lamp.lens',PROP_LODS.lamp,{attrs:{iLamp:1},shadow:[false,false,false]}).add(m,{iLamp:[l.index],radius:4});count('lamps');}
 // mailboxes: the procedural style and colours decide the mount and the box's paint
 for(const mb of R.mailboxes){const m=at(mb.g),s=mb.seed,kind=mb.style==='brick'?'brick':s<.40?'white':s<.6?'deco':'wood';
  set('mailbox.'+kind,PROP_LODS.small).add(m,{iTint:tintOf(BOX_TINT.get(mb.box)||0x262729),iVar:[s*10,.2+.5*hash(s),0,0],radius:.6});count('mailbox.'+kind);}
 // hydrants
 for(const hy of R.hydrants){set('hydrant',PROP_LODS.small).add(at(hy.g),{iTint:white,iVar:[hash(hy.u)*10,.5,0,0],radius:.5});count('hydrants');}
 // bins: the recorded pair or single bin; about one single-bin household in four keeps an old galvanized can
 for(const b of R.bins){const n=b.pair?2:1,old=!b.pair&&hash(b.d,b.lat)<.25;
  for(let k=0;k<n;k++){const m=at(b.g,k*.75,0,0,(hash(b.d+k,b.lat)-.5)*.12);
   if(old){set('can',PROP_LODS.small).add(m,{iTint:white,iVar:[hash(b.d)*10,.6,0,0],radius:.4});count('cans');}
   else{set('cart',PROP_LODS.small).add(m,{iTint:tintOf(CART_TINT.get(b.colors[k])||b.colors[k]),iVar:[hash(b.d,k)*10,.3+.4*hash(k,b.d),0,0],radius:.5});count('carts');}}}
 // hoops: the portable one at the curb, the garage boards (not on a lot the house benchmark has taken over)
 const hoopParts=[];
 for(const hp of R.hoops){if(hp.kind==='portable'){set('hoop.portable',PROP_LODS.small).add(at(hp.g),{iTint:white,iVar:[3,.35,0,0],radius:2});count('hoops');continue;}
  const P=hp.plan;if(P.benchmarkZone){count('hoops-on-house-benchmark-lots');continue;}
  const a=P.toWorld(hp.board.x,hp.board.z),b2=P.toWorld(hp.board.x,hp.board.z+1),yaw=Math.atan2(b2.x-a.x,b2.z-a.z);
  const m=new THREE.Matrix4().compose(new THREE.Vector3(a.x,a.ground+hp.board.y,a.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1));
  const key=hp.old?'hoop.old':'hoop.garage';set(key,PROP_LODS.small).add(m,{iTint:white,iVar:[hash(a.x)*10,hp.old?.8:.35,0,0],radius:1.2});count('hoops');}
 // fences: each bay sheared between its two posts on the ground (they follow the slope); a gate where a side yard meets
 // the house; posts of the run's style
 const FENCE={privacy:{post:'post.wood'},chain:{post:'post.chain'},picket:{post:'post.white'},rail:{post:'post.wood'}};
 for(const f of R.fences){const sty=f.style,F=FENCE[sty]||FENCE.rail,grey=sty==='privacy'&&hash(f.pts[0][0],f.pts[0][1])<.45;
  const bayName=sty==='privacy'?(grey?'fence.privacy_grey':'fence.privacy'):'fence.'+sty;
  for(const b of f.bays){const A2=MAIN.point(b.ua,b.va),B2=MAIN.point(b.ub,b.vb),dx=B2.x-A2.x,dz=B2.z-A2.z,L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;
   const isGate=f.gate&&b.run===0&&b.k===0&&b.len<3.2,name=isGate?'fence.gate':bayName,sy=sty==='picket'?1.05:1;
   const m=new THREE.Matrix4().set(dx,0,nx,(A2.x+B2.x)/2, B2.y-A2.y,sy,0,(A2.y+B2.y)/2, dz,0,nz,(A2.z+B2.z)/2, 0,0,0,1);
   set(name,PROP_LODS.fence,{capacity:128,shadow:[true,false,false]}).add(m,{iTint:white,iVar:[hash(b.ua,b.va)*10,.5,2,0],radius:1.4});count(isGate?'gates':'bays');}
  for(const po of f.posts){const P2=MAIN.point(po.u,po.v),m=new THREE.Matrix4().makeTranslation(P2.x,P2.y-.25,P2.z).multiply(new THREE.Matrix4().makeScale(1,po.H+.12+.25,1));
   set(F.post,PROP_LODS.fence,{capacity:128,shadow:[true,false,false]}).add(m,{iTint:white,iVar:[hash(po.u,po.v)*10,.5,2,0],radius:1});count('posts');}}
 // what the comparison swaps
 const zones=['sp:pole','sp:lamp','sp:mailbox','sp:bins','sp:hydrant','sp:hoop','sp:fence'];
 const procedural=world.merged.filter(m=>zones.includes(m.userData.zone)),proxies=world.shadowProxies.filter(m=>zones.includes(m.userData.zone));
 const lines=[];scene.traverse(o=>{if(o.isLineSegments&&o.userData.spLine)lines.push(o);});
 const lightC=new THREE.Color(),sunDir=new THREE.Vector3();
 return {sets,mats:{...mats,wires:wiresMat},wireMesh,stats,attach,procedural,lines,
  setAuthored(on){for(const s of Object.values(sets))s.setVisible(on);wireMesh.visible=on;for(const m of procedural)m.visible=!on;for(const m of proxies)m.visible=!on;for(const l of lines)l.visible=!on;},
  update(cam,force,{hemi,sun,renderer}={}){for(const s of Object.values(sets))s.update(cam,force);
   const U=wiresMat.uniforms,hgt=renderer?.domElement?.height||900;U.uPx.value=2*Math.tan((cam.fov||60)*Math.PI/360)/hgt;
   if(hemi){lightC.copy(hemi.color).multiplyScalar(hemi.intensity*.32);U.uLight.value.copy(lightC);}
   if(sun){sunDir.subVectors(sun.position,sun.target.position).normalize();U.uSun.value.copy(sunDir);U.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity*.25);}},
  stats(){const o={tris:0,calls:0,instances:0,levels:[0,0,0],kinds:{...stats}};for(const s of Object.values(sets)){const st=s.stats();o.tris+=st.tris;o.calls+=st.calls;o.instances+=st.items;st.counts.forEach((c,i)=>o.levels[i]=(o.levels[i]||0)+c);}
   if(wireMesh.visible){o.calls+=1;o.tris+=wireMesh.geometry.index.count/3;}return o;}};
}

// ------------------------------------------------------------------------------------------------ everything
export async function placeStreetProps({world,scene,renderer,camera,hemi,sun}){
 if(!world.streetProps)throw Error('the world was not built with the street-props flag (?streetprops)');
 const t0=performance.now(),errors=[];
 const env=createReflections(renderer);
 const shared={uniforms:{uClear:{value:1}},env};
 const groups=['vehA','vehB','propsA','chain'];
 const {tex,info:texInfo}=await loadTextures(renderer,groups);
 tex.chain.map.wrapS=tex.chain.map.wrapT=THREE.RepeatWrapping;
 const parts={};
 parts.vehicles=await placeVehicles({world,scene,renderer,camera,shared,tex,errors});
 try{parts.props=await placeProps({world,scene,renderer,shared,tex,errors});}catch(e){errors.push('props: '+String(e?.message||e));console.error('street props:',e);}
 const allMats=[...Object.values(parts.vehicles.mats),...Object.values(parts.props?.mats||{}).filter(m=>m.isMeshStandardMaterial)];
 function setEnv(){for(const m of allMats){const first=!m.envMap;m.envMap=env.texture;m.envMapIntensity=(m.userData.envK??=m.envMapIntensity)*env.intensity;if(first)m.needsUpdate=true;}}
 env.update(performance.now(),{hemi,fog:scene.fog?.color,sun,force:true});setEnv();
 let authored=true;
 const api={parts,errors,texInfo,env,loadMs:+(performance.now()-t0).toFixed(0),
  get authored(){return authored;},
  setAuthored(on){authored=!!on;for(const p of Object.values(parts))p.setAuthored(authored);if(authored)api.update(camera,true);},
  setLOD(n){for(const p of Object.values(parts))for(const s of Object.values(p.sets||{}))s.forced=n;},
  update(cam,force=false){if(env.update(performance.now(),{hemi,fog:scene.fog?.color,sun}))setEnv();if(!authored)return;for(const p of Object.values(parts))p.update(cam,force,{hemi,sun,renderer});},
  stats(){const o={};for(const [k,p] of Object.entries(parts))o[k]=p.stats();return o;}};
 api.setAuthored(true);
 return api;
}
