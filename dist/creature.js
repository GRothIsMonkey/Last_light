// The thing in the drain (Chapter Three). Model: "Smily horror monster" by Bento (CC BY 4.0; see
// docs/THIRD_PARTY_ASSETS.md), runtime copy assets/creature/creature.glb, read by creature-asset.js.
//
// What the asset gives: one skinned mesh (23,820 triangles), a 46-joint skeleton, and one 3.25 s clip that is an idle
// (jaw, hands and fingers move; the body does not; no root motion). It stands on all fours, faces +Z (turned about 11°),
// is modelled in centimetres. So, here:
//  * it is turned to face +Z exactly, scaled to metres ×1.35 (a little bigger than a man on all fours: about 1 m to the
//    top of the head crouched, 1.3 m long), and set with its lowest point on the ground at the group's origin;
//  * the idle clip keeps playing (the jaw, the fingers), and on top of it the limbs, spine and head are moved
//    procedurally: a low, fast, four-limbed scramble whose cadence follows its speed (arms and legs swing about the
//    body's own side axis, elbows and knees fold as they come forward, the body pitches and bobs with each bound),
//    rearing up and clawing (at a gate), and the head turning to whatever it is looking at;
//  * colliders are two circles along the body (the mesh itself is never used for collision);
//  * like the boy, it catches a little more of its own colour when a beam is on it far off (catch).
// It is loaded in the background when the game starts; `ready` resolves when it can be shown (`loaded`). Without it
// (an error loading) the story still runs and says so in `error`.
import * as THREE from './three.module.js';
import {parseCreature} from './creature-asset.js';

export const CREATURE_SCALE=.0135;// (centimetres to metres, ×1.35)
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const BONES={hips:'spinebase_01',belly:'belly_02',chest:'chest_03',neck:'neck_04',head:'head_05',jaw:'jaw_06',
 armL:'Arm.L_09',armR:'Arm.R_022',foreL:'Forearm.L_010',foreR:'Forearm.R_023',handL:'Hand.L_011',handR:'Hand.R_024',
 legL:'leg.L_036',legR:'leg.R_041',shinL:'sheen.L_037',shinR:'sheen.R_042',footL:'foot.L_038',footR:'foot.R_043'};

async function loadBytes(){const url=new URL('./assets/creature/creature.glb',import.meta.url);
 if(url.protocol==='file:'){const fs=await import('node:fs');const b=fs.readFileSync(url);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}
 const r=await fetch(url);if(!r.ok)throw new Error('creature asset: HTTP '+r.status);return r.arrayBuffer();}

export function createCreature({scene}){
 const group=new THREE.Group();group.name='drain-creature';group.visible=false;scene.add(group);
 const inner=new THREE.Group();inner.name='drain-creature-model';group.add(inner);
 const catchU={value:0};
 const api={group,loaded:false,error:null,catch:catchU,info:null,mesh:null,triangles:0,
  // what it is doing (set by the story every frame): speed m/s along its heading, rear 0–1 (up on its hind legs), claw
  // 0–1 (striking at something in front of it), crouch 0–1 (low and still), look (a point it turns its head to)
  drive:{speed:0,rear:0,claw:0,crouch:0,look:null,lift:0},phase:0,bob:0};
 let mixer=null,bones=null,rest=null,clipAction=null,clock0=0;const contacts=[];
 api.ready=(async()=>{const C=await parseCreature(await loadBytes());
  inner.add(C.root);api.mesh=C.mesh;C.mesh.frustumCulled=false;C.mesh.castShadow=true;C.mesh.receiveShadow=true;C.mesh.name='drain-creature-skin';
  // (catch: a little more of its own colour where a beam lands on it far off; never a glow of its own)
  const m=C.material;m.onBeforeCompile=sh=>{sh.uniforms.uCatch=catchU;sh.fragmentShader='uniform float uCatch;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n\ttotalEmissiveRadiance+=diffuseColor.rgb*uCatch;');};
  m.customProgramCacheKey=()=>'creature-catch';m.needsUpdate=true;
  bones={};for(const [k,n] of Object.entries(BONES)){bones[k]=C.bones[n];if(!bones[k])throw new Error('creature: no bone '+n);}
  rest=C.skeleton.bones.map(b=>({b,q:b.quaternion.clone(),p:b.position.clone()}));
  // face +Z exactly (hips → head), metres, lowest point on the ground at the origin
  C.root.updateMatrixWorld(true);const hp=bones.hips.getWorldPosition(new THREE.Vector3()),hd=bones.head.getWorldPosition(new THREE.Vector3());
  const yaw=Math.atan2(hd.x-hp.x,hd.z-hp.z);inner.rotation.y=-yaw;inner.scale.setScalar(CREATURE_SCALE);inner.updateMatrixWorld(true);group.updateMatrixWorld(true);
  const v=new THREE.Vector3(),box=new THREE.Box3(),inv=new THREE.Matrix4().copy(group.matrixWorld).invert(),pos=C.mesh.geometry.attributes.position;
  for(let i=0;i<pos.count;i+=3){C.mesh.getVertexPosition(i,v);v.applyMatrix4(C.mesh.matrixWorld).applyMatrix4(inv);box.expandByPoint(v);}
  inner.position.set(-(box.min.x+box.max.x)/2,-box.min.y,-(box.min.z+box.max.z)/2);
  api.baseY=inner.position.y;inner.updateMatrixWorld(true);for(const k of ['handL','handR','footL','footR']){bones[k].getWorldPosition(v);contacts.push([k,v.y-group.position.y]);}
  api.size={length:+(box.max.z-box.min.z).toFixed(2),width:+(box.max.x-box.min.x).toFixed(2),height:+(box.max.y-box.min.y).toFixed(2)};
  mixer=new THREE.AnimationMixer(C.root);if(C.clips[0]){clipAction=mixer.clipAction(C.clips[0]);clipAction.play();}
  api.info={...C.info,scale:CREATURE_SCALE,yawCorrection:+yaw.toFixed(4),size:api.size,clip:C.clips[0]?.name};api.triangles=C.info.triangles;api.loaded=true;return api;})()
  .catch(e=>{api.error=String(e&&e.stack||e);if(typeof console!=='undefined')console.error('creature failed to load:',e);return api;});

 // Turn a bone about an axis given in world space (its parent's current orientation taken into account).
 const _pq=new THREE.Quaternion(),_r=new THREE.Quaternion(),_ax=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
 function rotWorld(b,axis,ang){if(!ang)return;b.parent.getWorldQuaternion(_pq);_r.setFromAxisAngle(axis,ang);b.quaternion.premultiply(_pq.clone().invert().multiply(_r).multiply(_pq));b.updateMatrixWorld(true);}
 const right=new THREE.Vector3(),fwd=new THREE.Vector3(),_hv=new THREE.Vector3();
 // Place it: ground point, heading (the game's convention: forward is (sin a, −cos a)).
 api.place=(x,y,z,heading)=>{group.position.set(x,y,z);group.rotation.set(0,Math.PI-heading,0);api.heading=heading;};
 api.show=v=>{group.visible=!!v&&api.loaded;};
 // Where its head is (world), for whether it has been seen.
 api.headPos=(v=new THREE.Vector3())=>{if(!bones)return null;group.updateMatrixWorld(true);return bones.head.getWorldPosition(v);};
 // Two circles along the body, for the player and the companions to stop against (never the mesh).
 api.colliders=()=>{if(!group.visible)return [];const a=api.heading||0,fx=Math.sin(a),fz=-Math.cos(a),p=group.position;
  return [{x:p.x-fx*.25,z:p.z-fz*.25,r:.42,creature:true},{x:p.x+fx*.45,z:p.z+fz*.45,r:.38,creature:true}];};
 // Every frame while it is shown.
 api.update=(dt)=>{if(!api.loaded||!group.visible)return;const D=api.drive;clock0+=dt;
  for(const r of rest){r.b.quaternion.copy(r.q);r.b.position.copy(r.p);}
  mixer.update(dt);if(clipAction)clipAction.timeScale=1+D.claw*1.5+Math.min(1,D.speed/4);
  group.updateMatrixWorld(true);
  const a=api.heading||0;fwd.set(Math.sin(a),0,-Math.cos(a));right.set(Math.cos(a),0,Math.sin(a));
  // the gait: cadence from speed; arms together-ish, legs half a cycle later (a bounding scramble)
  const v=Math.max(0,D.speed),run=clamp(v/1.2,0,1),f=.9+v*.34;api.phase=(api.phase+dt*f*Math.max(run,.0001))%1;const ph=api.phase*2*Math.PI;
  const A=(.34+.26*clamp(v/6,0,1))*run,B=(.55+.25*clamp(v/6,0,1))*run;
  const limb=(upper,lower,off,dir)=>{const s=Math.sin(ph+off*2*Math.PI),c=Math.cos(ph+off*2*Math.PI);rotWorld(upper,right,A*s*dir);rotWorld(lower,right,-B*Math.max(0,c)*dir);};
  // body: pitch with the bound, a little lower and longer the faster it goes
  rotWorld(bones.hips,right,(.08*Math.sin(ph+1.6)-.1*clamp(v/6,0,1))*run+.95*D.rear);
  rotWorld(bones.chest,right,-.06*Math.sin(ph+.6)*run+.2*D.rear);
  limb(bones.armL,bones.foreL,0,1);limb(bones.armR,bones.foreR,.14,1);limb(bones.legL,bones.shinL,.5,1);limb(bones.legR,bones.shinR,.62,1);
  // rearing and clawing: the arms come up and forward and strike, one after the other
  if(D.claw>0||D.rear>0){const t=performanceNow(),sL=Math.max(0,Math.sin(t*9)),sR=Math.max(0,Math.sin(t*9+2.2));
   rotWorld(bones.armL,right,(1.2*D.rear+.7*D.claw*sL));rotWorld(bones.armR,right,(1.2*D.rear+.7*D.claw*sR));
   rotWorld(bones.foreL,right,-.6*D.claw*(1-sL));rotWorld(bones.foreR,right,-.6*D.claw*(1-sR));}
  // the head turns to what it looks at (within what a neck can do)
  if(D.look){bones.head.getWorldPosition(_hv);const dx=D.look.x-_hv.x,dz=D.look.z-_hv.z,dy=(D.look.y??_hv.y)-_hv.y,h=Math.hypot(dx,dz)||1;
   const yawTo=Math.atan2(dx,-dz),dyaw=clamp(Math.atan2(Math.sin(a-yawTo),Math.cos(a-yawTo)),-.75,.75),pitch=clamp(Math.atan2(dy,h),-.5,.45);
   api.headYaw=damp(api.headYaw||0,-dyaw,6,dt);api.headPitch=damp(api.headPitch||0,pitch,6,dt);rotWorld(bones.neck,_up,api.headYaw*.4);rotWorld(bones.head,_up,api.headYaw*.6);_ax.copy(right);rotWorld(bones.head,_ax,api.headPitch);}
  // crouched and waiting: the head tilts, slowly
  if(D.crouch>0)rotWorld(bones.head,fwd,.28*D.crouch*Math.sin(performanceNow()*.7));
  // the bob of each bound (the group's own height is the story's; this rides on it)
  // never through the floor: if a hand or foot has swung below where it rests on the ground, the body rides up on it
  group.updateMatrixWorld(true);let low=0;for(const [k,y0] of contacts){bones[k].getWorldPosition(_hv);const y=_hv.y-group.position.y-(inner.position.y-api.baseY);low=Math.min(low,y-y0);}
  api.bob=.05*run*(1-Math.cos(2*ph))/2;api.lift=-low;inner.position.y=api.baseY+api.bob-low;};
 const performanceNow=()=>clock0;
 api.reset=()=>{group.visible=false;api.phase=0;api.headYaw=0;api.headPitch=0;catchU.value=0;clock0=0;Object.assign(api.drive,{speed:0,rear:0,claw:0,crouch:0,look:null,lift:0});};
 return api;}
