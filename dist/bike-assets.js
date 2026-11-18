// Authored bicycles (benchmark only, feature-flagged; nothing in the story imports this module).
// Upgrades one of the game's procedural rig.js bikes IN PLACE with its Blender model (dist/assets/bike/bike.<id>.glb):
// the authored parts are hung under the very groups rig.js already animates (frame, steer, frontWheel, rearWheel, crank,
// pedals, kickPivot, bell.lever), so poseBike(), ridePose(), the companions, the first-person body and the bell keep
// driving the bike exactly as before. The procedural meshes are only hidden, so restore() puts the bike back as it was.
//
// The GLB is the bike in its rest pose (wheel 0, crank 0 = right arm up, steer 0, kickstand stowed) in the game's
// bike-local frame (glTF +Z front, turned half a turn like every authored asset). Each part's wrapper gets the inverse
// of its target group's rest transform, so the part sits where it was modelled and turns about the group's pivot.
// One deliberate difference from rig.js: the authored front axle sits ahead of the steering axis (a real fork offset);
// rig.js puts it behind. The front-wheel group is moved to the authored axle while upgraded (and back on restore()).
import * as THREE from './three.module.js';
import {loadAsset} from './asset-library.js';
import {poseBike,gripPos,pedalPos} from './rig.js';

export const BIKE_IDS={jamie:'bike.jamie',sam:'bike.sam',alex:'bike.alex',player:'bike.player'};
const NODE_TARGET={frame:b=>b.frame,chain:b=>b.frame,steer:b=>b.steer,wheel_front:b=>b.frontWheel,wheel_rear:b=>b.rearWheel,crank:b=>b.crank,
 pedal_l:b=>b.pedals[0],pedal_r:b=>b.pedals[1],kickstand:b=>b.kickPivot,bell_lever:b=>b.bell?.lever};
const EMPTY=new THREE.BufferGeometry();
const TURN=new THREE.Matrix4().makeRotationY(Math.PI);   // glTF +Z front -> game -Z front
// LOD switch distances (metres from the camera), with hysteresis
export const LOD_DIST=[14,36];

let envTex=null;
// A small image-based light for the authored bike materials only (approval item A-47 is open, so the game itself gets no
// environment map): a warm golden-hour gradient sky over a dusky lawn, prefiltered once. Scoped to these materials.
export function bikeEnvironment(renderer,{sky=0x9fb4c8,horizon=0xf0c79a,ground=0x4d4a3a,sun=0xffd09b}={}){
 if(envTex||!renderer)return envTex;
 const s=new THREE.Scene(),g=new THREE.SphereGeometry(50,32,16),c=new THREE.Color(),cols=[];const P=g.attributes.position;
 const top=new THREE.Color(sky),hor=new THREE.Color(horizon),gr=new THREE.Color(ground);
 for(let i=0;i<P.count;i++){const y=P.getY(i)/50;if(y>0)c.copy(hor).lerp(top,Math.pow(y,.55));else c.copy(hor).lerp(gr,Math.min(1,-y*3.5));cols.push(c.r,c.g,c.b);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
 const disc=new THREE.Mesh(new THREE.SphereGeometry(3,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(sun).multiplyScalar(6)}));disc.position.set(-30,9,-38);s.add(disc);
 const pm=new THREE.PMREMGenerator(renderer);envTex=pm.fromScene(s,.02).texture;pm.dispose();g.dispose();return envTex;
}

function partsOf(template){const out=[];template.traverse(o=>{const u=o.userData||{};if(u.ll_node&&o!==template)out.push({obj:o,node:u.ll_node,lod:u.ll_lod|0});});return out;}

// Load (once) and return the asset with its anchors record (extras.ll_anchors written by tools/blender/bikes/build_bike.py).
export async function loadBike(id,{renderer=null}={}){
 const A=await loadAsset(id,{renderer});
 if(!A.bike){let rootX=null;A.template.traverse(o=>{if(!rootX&&o.userData?.ll_asset_id===id)rootX=o.userData;});
  const anchors=rootX?.ll_anchors?JSON.parse(rootX.ll_anchors):null;
  A.bike={anchors,parts:partsOf(A.template),lods:rootX?.ll_lods?JSON.parse(rootX.ll_lods):null,license:rootX?.ll_license};}
 return A;
}

// Compare the GLB's recorded anchors with this procedural bike's rig.js geometry (metres; all must be ~0).
export function anchorReport(bike,anchors){const G=bike.geom,d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),r={};
 r.bb=d(anchors.bb,G.bb);r.saddle=d(anchors.saddle,G.saddle);r.grip=d(anchors.grip,G.grip);r.pivot=d(anchors.pivot,G.pivot);
 r.rear=Math.abs(anchors.rear-G.rear);r.wheelR=Math.abs(anchors.wheelR-G.wheelR);r.rake=Math.abs(anchors.rake-G.rake);r.crank=Math.abs(anchors.crank-G.crank);r.pedalX=Math.abs(anchors.pedalX-G.pedalX);
 r.frontAxleMovedBy=Math.abs(anchors.axleFront[2]-G.front);return r;}

// Upgrade a procedural bike. Returns a handle: {restore(), setLOD(n|null), update(camera), stats(), anchors}.
export async function upgradeBike(bike,id,{renderer=null,env=true,envIntensity=.85}={}){
 const A=await loadBike(id,{renderer});const {anchors,parts}=A.bike;
 if(!anchors)throw new Error(`${id}: no ll_anchors in the file`);
 const report=anchorReport(bike,anchors);
 const bad=Object.entries(report).filter(([k,v])=>k!=='frontAxleMovedBy'&&v>.002);
 if(bad.length)throw new Error(`${id}: authored anchors differ from rig.js: ${bad.map(([k,v])=>k+' '+(v*1000).toFixed(1)+' mm').join(', ')}`);
 const save={wheel:bike.wheel,crank:bike.crankAngle,steer:bike.steerAngle,kick:bike.kickstand,front:bike.frontWheel.position.clone()};
 // rest pose, and the front wheel on the authored axle (steer-local: undo the pivot and the rake)
 bike.wheel=0;bike.crankAngle=0;bike.steerAngle=0;bike.kickstand=0;poseBike(bike);
 const G=bike.geom,ax=new THREE.Vector3(...anchors.axleFront).sub(G.pivotV).applyQuaternion(G.rakeInv);bike.frontWheel.position.copy(ax);
 bike.group.updateMatrixWorld(true);
 const inv=bike.group.matrixWorld.clone().invert();
 // hide what rig.js drew (leaf meshes only; animated meshes keep their transform with an empty geometry)
 const hidden=[],swapped=[];
 const hideLeaves=g=>{for(const c of g.children)if((c.isMesh||c.isLineSegments)&&!c.userData.authored){if(c===bike.bell?.lever||bike.pedals.includes(c))continue;hidden.push([c,c.visible]);c.visible=false;}};
 for(const g of [bike.frame,bike.steer,bike.frontWheel,bike.rearWheel,bike.crank,bike.kickPivot])hideLeaves(g);
 for(const m of [...bike.pedals,bike.bell?.lever].filter(Boolean)){swapped.push([m,m.geometry,m.castShadow]);m.geometry=EMPTY;}
 const wrappers=[],byLod=[[],[],[]],mats=new Set();
 for(const p of parts){const target=NODE_TARGET[p.node]?.(bike);if(!target)continue;
  const rel=inv.clone().multiply(target.matrixWorld);
  const w=new THREE.Group();w.name=`authored:${id}:${p.node}:lod${p.lod}`;w.userData.authored=true;w.matrixAutoUpdate=false;
  w.matrix.copy(rel.invert()).multiply(TURN);
  const part=p.obj.clone(true);part.position.set(0,0,0);part.quaternion.identity();part.scale.set(1,1,1);// (nodes carry no transform; parents' are folded into the wrapper)
  part.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of [].concat(o.material))mats.add(m);}});
  w.add(part);target.add(w);wrappers.push(w);byLod[p.lod].push(w);}
 if(env&&renderer){const e=bikeEnvironment(renderer);for(const m of mats){m.envMap=e;m.envMapIntensity=envIntensity;m.needsUpdate=true;}}
 bike.wheel=save.wheel;bike.crankAngle=save.crank;bike.steerAngle=save.steer;bike.kickstand=save.kick;poseBike(bike);
 let level=0,forced=null;
 const show=n=>{for(let l=0;l<3;l++)for(const w of byLod[l])w.visible=l===n;level=n;};show(0);
 const _p=new THREE.Vector3(),_c=new THREE.Vector3();
 const handle={id,bike,anchors,report,license:A.bike.license,info:A.info,materials:mats,get level(){return level;},
  setLOD(n){forced=n;if(n!==null)show(n);},
  update(camera){if(forced!==null)return level;bike.group.getWorldPosition(_p);camera.getWorldPosition(_c);const d=_p.distanceTo(_c);
   const want=d<LOD_DIST[0]-(level>0?1.5:0)?0:d<LOD_DIST[1]-(level>1?3:0)?1:2;if(want!==level)show(want);return level;},
  restore(){for(const w of wrappers)w.removeFromParent();for(const [c,v] of hidden)c.visible=v;for(const [m,g,s] of swapped){m.geometry=g;m.castShadow=s;}
   bike.frontWheel.position.copy(save.front);poseBike(bike);bike.authored=null;},
  stats(){const s={tris:[0,0,0],meshes:[0,0,0]};for(let l=0;l<3;l++)for(const w of byLod[l])w.traverse(o=>{if(o.isMesh){s.meshes[l]++;s.tris[l]+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}});return s;},
  // contact points the riders use, in bike-local coordinates (rig.js), for measuring against the authored grips/pedals
  contacts(){const G=bike.geom;return {gripL:gripPos(bike.steerAngle,-1,new THREE.Vector3(),G),gripR:gripPos(bike.steerAngle,1,new THREE.Vector3(),G),
   pedalL:pedalPos(bike.crankAngle,-1,new THREE.Vector3(),G),pedalR:pedalPos(bike.crankAngle,1,new THREE.Vector3(),G)};}};
 bike.authored=handle;return handle;
}
