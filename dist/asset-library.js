// Authored-asset library (Phase 0A): loads Blender-exported glTF 2.0 binaries (.glb) with three.js r160's own GLTFLoader
// (vendored unchanged except its import paths: three-addons-*.js) and hands out instances that share geometry, materials
// and textures. Nothing here replaces any existing character, bike or place: until an asset is approved and a scene asks
// for it by id, the game never loads this module (game.js imports it only with ?pipeline).
//
// Where the bytes come from (never a network fetch in the offline package, never a silent stand-in; browsers only —
// GLTFLoader decodes the embedded images with browser APIs, so the node simulations do not load authored models):
//  1. the offline package: globalThis.__LL_ASSETS__['assets/<domain>/<file>'] (a Blob URL the packager made);
//  2. served dist/: fetch(new URL('./assets/<domain>/<file>', import.meta.url)) — same origin, no CDN;
// A failure rejects with the reason and is kept in status(); nothing falls back to procedural geometry by itself.
//
// Conventions (docs/art/BLENDER-PIPELINE.md): metres, +Y up; a glTF file's front is +Z; the game's front is -Z, so every
// instance is turned half a turn about Y inside its root group. A character's left (bones *_l) is then on the game's -X,
// as rig.js expects (side -1 = left).
import * as THREE from './three.module.js';
import {GLTFLoader} from './three-addons-gltf-loader.js';
import {clone as cloneSkinned} from './three-addons-skeleton-utils.js';

export const ASSETS={
 // id: runtime file (relative to dist/), rig contract, what it is
 'tst.pipeline-probe':{file:'assets/tst/tst.pipeline-probe.glb',rig:'rig.human.child',kind:'test',note:'Phase 0A technical probe; not a character'},
 // Phase 1 bicycle benchmark (DEV, ?bikes): authored bikes awaiting approval; no story scene asks for them yet
 'bike.jamie':{file:'assets/bike/bike.jamie.glb',rig:'rig.bike',kind:'bike',note:'youth BMX; incorporates CC BY 4.0 geometry (THIRD_PARTY_ASSETS.md)'},
 'bike.sam':{file:'assets/bike/bike.sam.glb',rig:'rig.bike',kind:'bike',note:'youth mountain bike'},
 'bike.alex':{file:'assets/bike/bike.alex.glb',rig:'rig.bike',kind:'bike',note:'youth cruiser'},
 'bike.player':{file:'assets/bike/bike.player.glb',rig:'rig.bike',kind:'bike',note:'the protagonist\'s youth hybrid (rig.js road-kid)'},
 // Prologue house-architecture benchmark (DEV, ?houses): twelve authored houses on their lots, awaiting approval
 'house.prologue':{file:'assets/house/house.prologue.glb',rig:'none',kind:'house',note:'Blender house kit: 12 Prologue lots, 3 LODs, shared texture library'},
};
const cache=new Map(),log=[];
let loader=null;
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();

async function bytesFor(file){
 const packed=globalThis.__LL_ASSETS__?.[file];
 if(packed){const r=await fetch(packed);if(!r.ok)throw new Error(`packaged asset ${file}: ${r.status}`);return {buf:await r.arrayBuffer(),from:'package'};}
 if(globalThis.__LL_OFFLINE__)throw new Error(`asset ${file} is not embedded in this offline package (package with PLAYTEST_MODELS=1 to embed dist/assets/tst, chr, …)`);
 const url=new URL('./'+file,import.meta.url);
 const r=await fetch(url);if(!r.ok)throw new Error(`asset ${file}: HTTP ${r.status}`);return {buf:await r.arrayBuffer(),from:'http'};
}

// Load (once) and keep the parsed template. Resolves {id, gltf, template, clips, info}.
export function loadAsset(id,{renderer=null}={}){
 if(cache.has(id))return cache.get(id);
 const def=ASSETS[id];if(!def)return Promise.reject(new Error('unknown asset id '+id));
 const p=(async()=>{const t0=now();const {buf,from}=await bytesFor(def.file);const t1=now();
  loader??=new GLTFLoader();
  const gltf=await loader.parseAsync(buf,'');const t2=now();
  const template=gltf.scene;template.name=id+':template';
  const aniso=renderer?.capabilities?.getMaxAnisotropy?.()??1;
  const geos=new Set(),mats=new Set(),texs=new Set();let tris=0,skinned=0;
  template.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;if(o.isSkinnedMesh){skinned++;o.frustumCulled=false;}
   geos.add(o.geometry);tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
   for(const m of [].concat(o.material)){mats.add(m);for(const k of ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'])if(m[k]){texs.add(m[k]);m[k].anisotropy=Math.min(4,aniso);}}});
  const extras=(()=>{let e=null;template.traverse(o=>{if(!e&&o.userData?.ll_asset_id)e=o.userData;});return e;})();
  if(!extras||extras.ll_asset_id!==id)throw new Error(`${def.file}: extras.ll_asset_id is ${extras?.ll_asset_id} (expected ${id})`);
  const morphs=new Set();template.traverse(o=>{if(o.morphTargetDictionary)for(const k of Object.keys(o.morphTargetDictionary))morphs.add(k);});
  const info={id,file:def.file,from,bytes:buf.byteLength,readMs:+(t1-t0).toFixed(1),parseMs:+(t2-t1).toFixed(1),triangles:tris,skinnedMeshes:skinned,
   geometries:geos.size,materials:mats.size,textures:texs.size,clips:gltf.animations.map(c=>({name:c.name,duration:+c.duration.toFixed(3),tracks:c.tracks.length})),morphTargets:[...morphs],
   version:extras.ll_asset_version,rig:extras.ll_rig,license:extras.ll_license,generator:gltf.asset?.generator};
  log.push({id,ok:true,info});
  return {id,gltf,template,clips:gltf.animations,info,shared:{geos,mats,texs}};})();
 p.catch(e=>log.push({id,ok:false,error:String(e?.message||e)}));
 cache.set(id,p);return p;
}
export function status(){return log.slice();}

// A placed copy: its own skeleton, mixer and morph weights; geometry, materials and textures shared with the template.
export async function instantiate(id,opts={}){
 const A=await loadAsset(id,opts);
 const model=cloneSkinned(A.template);model.name=id+':model';
 model.rotation.y=Math.PI;                       // glTF +Z front -> game -Z front
 const root=new THREE.Group();root.name='asset:'+id;root.add(model);
 // GLTFLoader gives every skinned primitive its own THREE.Skeleton (and bone texture) even when they share one glTF skin;
 // one copy of a character needs one: primitives bound to the same bones and inverse binds share the first skeleton.
 const skels=[];let freed=0;
 model.traverse(o=>{if(!o.isSkinnedMesh)return;const k=o.skeleton;const same=skels.find(s=>s.bones.length===k.bones.length&&s.bones.every((b,i)=>b===k.bones[i])&&s.boneInverses.every((m,i)=>m.equals(k.boneInverses[i])));
  if(same&&same!==k){o.skeleton=same;k.dispose();freed++;}else if(!same)skels.push(k);});
 const bones={},sockets={},faceMeshes=[];
 model.traverse(o=>{if(o.isBone){bones[o.name]=o;if(o.name.startsWith('socket_'))sockets[o.name.slice(7)]=o;}if(o.morphTargetDictionary&&o.morphTargetInfluences)faceMeshes.push(o);});
 const mixer=new THREE.AnimationMixer(model),actions={};
 for(const c of A.clips)actions[c.name]=mixer.clipAction(c);
 const inst={id,root,model,bones,sockets,mixer,actions,faceMeshes,info:A.info,skeletons:skels.length,skeletonsShared:freed,
  play(name,{fade=.25,loop=true,weight=1}={}){const a=actions[name];if(!a)throw new Error(`${id}: no clip ${name}`);for(const [n,b] of Object.entries(actions))if(n!==name&&b.isRunning())b.fadeOut(fade);
   a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.setEffectiveWeight(weight);a.fadeIn(fade).play();return a;},
  stop(){mixer.stopAllAction();},
  update(dt){mixer.update(dt);},
  // morph weights by shape-key name (0..1); unknown names throw so a misnamed key never fails silently
  setMorph(name,v){let hit=false;for(const m of faceMeshes){const i=m.morphTargetDictionary[name];if(i!==undefined){m.morphTargetInfluences[i]=v;hit=true;}}if(!hit)throw new Error(`${id}: no shape key ${name}`);},
  morph(name){for(const m of faceMeshes){const i=m.morphTargetDictionary[name];if(i!==undefined)return m.morphTargetInfluences[i];}return null;},
  // the existing face channels (faces.js EXPRESSIONS: smile, open, tilt, browY, lids, ...) drive the shape keys
  setExpression(e={}){for(const [k,v] of Object.entries(faceWeights(e)))if(this.hasMorph(k))this.setMorph(k,v);},
  hasMorph(name){return faceMeshes.some(m=>m.morphTargetDictionary[name]!==undefined);},
  // put an object at a socket (a hand grip, the cap, the head top, the eye camera...); it follows the bone
  attach(socket,obj){const s=sockets[socket];if(!s)throw new Error(`${id}: no socket_${socket}`);s.add(obj);return obj;},
  socketWorld(socket,out=new THREE.Vector3()){const s=sockets[socket];if(!s)throw new Error(`${id}: no socket_${socket}`);s.updateWorldMatrix(true,false);return s.getWorldPosition(out);},
  dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);root.removeFromParent();}};
 return inst;
}

// faces.js expression channels -> ARKit-style shape keys (the mapping every hero face must honour; BLENDER-PIPELINE.md §6)
export function faceWeights(e={}){const c=(x)=>Math.max(0,Math.min(1,x));const smile=e.smile??0,open=e.open??0,tilt=e.tilt??0,browY=e.browY??0,lids=e.lids??0,knit=e.knit??0,wide=e.wide??1;
 return {jawOpen:c(open),mouthSmileLeft:c(smile),mouthSmileRight:c(smile),mouthFrownLeft:c(-smile),mouthFrownRight:c(-smile),browInnerUp:c(tilt*.8+browY*90),
  browDownLeft:c(knit-browY*60),browDownRight:c(knit-browY*60),eyeBlinkLeft:c(lids),eyeBlinkRight:c(lids),mouthStretchLeft:c((wide-1)*4),mouthStretchRight:c((wide-1)*4),mouthPucker:c((1-wide)*4)};}

// What the library holds, for memory checks: unique GPU-side objects across every instance made so far.
export function sharedStats(root){const g=new Set(),m=new Set(),t=new Set(),sk=new Set();let meshes=0;
 root.traverse(o=>{if(!o.isMesh)return;meshes++;g.add(o.geometry);for(const x of [].concat(o.material)){m.add(x);for(const k of ['map','normalMap','roughnessMap','metalnessMap','aoMap'])if(x[k])t.add(x[k]);}if(o.skeleton)sk.add(o.skeleton);});
 return {meshes,geometries:g.size,materials:m.size,textures:t.size,skeletons:sk.size};}
