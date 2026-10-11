// The thing in the drain (Chapter Three). Model: "Smily horror monster" by Bento (CC BY 4.0; see
// docs/THIRD_PARTY_ASSETS.md), runtime copy assets/creature/creature.glb, read by creature-asset.js.
//
// What the asset gives: one skinned mesh (23,820 triangles), a 46-joint skeleton, and one 3.25 s clip that is an idle
// (jaw, hands and fingers move; the body does not; no root motion). It stands on all fours, faces +Z (turned about 11°),
// is modelled in centimetres. So, here:
//  * it is turned to face +Z exactly, scaled to metres ×1.35 (a little bigger than a man on all fours: about 1 m to the
//    top of the head crouched, 1.3 m long), and set with its lowest point on the ground at the group's origin;
//  * the idle clip keeps playing (the jaw, the fingers), and on top of it the body moves on its own skeleton: the
//    gait comes from how fast it really moved since the last frame (a walk, a trot, a bounding gallop, blended by
//    speed), each hand and foot is planted where it lands and stays there while the body passes over it, then swings
//    (in the body's frame) to where it will next land, by two-bone IK on the shoulder/elbow and hip/knee with the
//    rest pose's own bend as the pole; the body bobs, pitches against acceleration, rolls into turns and flexes its
//    spine with the bound; crouching, cowering (limbs drawn in, a fine shiver), backing away, alertness (the chest
//    and head up) and a fast snap of the head; rearing up and clawing (Chapter Three's gate); the head held level
//    and turned to whatever it is looking at;
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
  // 0–1 (striking at something in front of it), crouch 0–1 (low and still), look (a point it turns its head to);
  // Chapter Four adds cower 0–1 (pulled in low, head down, shivering) and back (1: the gait runs backwards, for backing away)
  drive:{speed:0,rear:0,claw:0,crouch:0,look:null,lift:0,cower:0,back:0},phase:0,bob:0};
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

 // ---- how it moves --------------------------------------------------------------------------------------------------------
 // The asset has only an idle (jaw, hands, fingers). Everything else is made here, on its own skeleton, every frame:
 //  * where it really goes (its position from frame to frame) sets the gait, so whatever the story does with it (a
 //    chase, a stalk, backing away, a turn) the limbs answer the ground speed: a lateral-sequence walk when slow, a trot,
 //    then a bounding gallop (hind pair, then fore pair, a moment of flight) when it runs;
 //  * each hand and foot is planted where it lands and stays there while the body passes over it (no sliding), then
 //    lifts and swings in an arc to where it will next land (predicted from its speed and turning); a two-bone IK puts
 //    the wrist/ankle there, elbows and knees bending the way the model's own pose bends them;
 //  * the body bobs with the steps (rising in the gallop's flight), pitches forward when it accelerates and sits back
 //    when it stops, flexes its spine with the bound, leans into turns, lowers when it crouches or cowers (the limbs fold
 //    under it, the hands drawn in), and its head is held level against all that while it turns to what it watches.
 const _pq=new THREE.Quaternion(),_pqi=new THREE.Quaternion(),_r=new THREE.Quaternion(),_ax=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
 function rotWorld(b,axis,ang){if(!ang||!Number.isFinite(ang))return;b.parent.getWorldQuaternion(_pq);_pqi.copy(_pq).invert();_r.setFromAxisAngle(axis,ang);b.quaternion.premultiply(_pqi.multiply(_r).multiply(_pq));b.updateMatrixWorld(true);}
 const _f1=new THREE.Vector3(),_f2=new THREE.Vector3(),_fx=new THREE.Vector3();
 function rotFromTo(b,from,to,w=1){_f1.copy(from).normalize();_f2.copy(to).normalize();_fx.crossVectors(_f1,_f2);const s=_fx.length();if(s<1e-6)return;rotWorld(b,_fx.multiplyScalar(1/s),Math.atan2(s,_f1.dot(_f2))*w);}
 const right=new THREE.Vector3(),fwd=new THREE.Vector3(),_hv=new THREE.Vector3();
 const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_n=new THREE.Vector3(),_pl=new THREE.Vector3(),_g=new THREE.Vector3();
 // two bones, the end of the second at the target, the middle joint toward the pole (all world space)
 function ik(L,target,pole){L.up.getWorldPosition(_a);L.mid.getWorldPosition(_b);L.end.getWorldPosition(_c);
  const l1=_a.distanceTo(_b),l2=_b.distanceTo(_c),d=clamp(_a.distanceTo(target),Math.abs(l1-l2)+.02,(l1+l2)*.992);
  _v1.subVectors(_a,_b).normalize();_v2.subVectors(_c,_b).normalize();const cur=Math.acos(clamp(_v1.dot(_v2),-1,1)),want=Math.acos(clamp((l1*l1+l2*l2-d*d)/(2*l1*l2),-1,1));
  _n.crossVectors(_v1,_v2);if(_n.lengthSq()<1e-9)_n.copy(pole).cross(_v1);if(_n.lengthSq()>1e-9){_n.normalize();rotWorld(L.mid,_n,want-cur);}
  L.end.getWorldPosition(_c);_v1.subVectors(_c,_a);_v2.subVectors(target,_a);rotFromTo(L.up,_v1,_v2);
  L.mid.getWorldPosition(_b);_n.subVectors(target,_a).normalize();_v1.subVectors(_b,_a);_v1.addScaledVector(_n,-_v1.dot(_n));_pl.copy(pole).addScaledVector(_n,-pole.dot(_n));
  if(_v1.lengthSq()>1e-8&&_pl.lengthSq()>1e-8){_v1.normalize();_pl.normalize();let ang=Math.acos(clamp(_v1.dot(_pl),-1,1));if(_v2.crossVectors(_v1,_pl).dot(_n)<0)ang=-ang;rotWorld(L.up,_n,ang);}}
 // the gaits: the phase each limb starts its stance at (0..1 of a stride)
 const WALK={LH:0,LF:.25,RH:.5,RF:.75},TROT={LH:.5,LF:0,RH:0,RF:.5},GALLOP={LH:0,RH:.09,LF:.53,RF:.62};
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);},wrap=x=>Math.atan2(Math.sin(x),Math.cos(x)),ease=x=>x<.5?2*x*x:1-2*(1-x)*(1-x);
 const LIMBS=[],last={x:0,y:0,z:0,a:0,ok:false},vel=new THREE.Vector3(),velS=new THREE.Vector3();let G=0,yawRate=0,accel=0,spPrev=0;
 const _w=new THREE.Vector3(),_land=new THREE.Vector3(),_rest=new THREE.Vector3(),_pole=new THREE.Vector3(),_tip=new THREE.Vector3(),_tipW=new THREE.Vector3(),_q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_q3=new THREE.Quaternion();
 function initLimbs(){group.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(group.matrixWorld).invert(),loc=b=>b.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
  const tipOf=b=>{let best=null,bd=-1;const o0=b.getWorldPosition(new THREE.Vector3());b.traverse(o=>{if(o.isBone&&o!==b){const d=o.getWorldPosition(new THREE.Vector3()).distanceTo(o0);if(d>bd){bd=d;best=o;}}});return best;};
  for(const [k,up,mid,end,fore] of [['LF','armL','foreL','handL',1],['RF','armR','foreR','handR',1],['LH','legL','shinL','footL',0],['RH','legR','shinR','footR',0]]){
   const U=bones[up],M=bones[mid],E=bones[end],T=tipOf(E),pu=loc(U),pm=loc(M),pe=loc(E),pt=T?loc(T):pe.clone();
   LIMBS.push({k,up:U,mid:M,end:E,tip:T,fore:!!fore,rest:pe,y0:pe.y,reach:(pu.distanceTo(pm)+pm.distanceTo(pe))*.9,pole:pm.clone().sub(pu.clone().add(pe).multiplyScalar(.5)).normalize(),tipDir:pt.clone().sub(pe),
    plant:new THREE.Vector3(),lift:new THREE.Vector3(),pos:new THREE.Vector3(),stance:true,u:0,slip:0});}
  plantAll();}
 // a limb's resting place under the body, in world space, for a body at (p, heading h); drawn in under it when it cowers
 const inward=k=>1-.24*clamp(api.drive.cower,0,1)-.1*clamp(api.drive.crouch,0,1);
 function restAt(L,px,pz,h,out){const k=inward();const lx=L.rest.x*(L.fore?.95:1)*(.55+.45*k),lz=L.rest.z*k,s=Math.sin(h),c=Math.cos(h);
  // (group-local +Z is forward (sin h, −cos h); local +X is (−cos h, −sin h))
  out.set(px+lz*s-lx*c,0,pz-lz*c-lx*s);out.y=groundAt(out.x,out.z,group.position.y)+L.y0;return out;}
 const groundAt=(x,z,y)=>{const g=api.ground?.(x,z);return Number.isFinite(g)?g:y;};
 const nStepping=()=>{let n=0;for(const L of LIMBS)if(L.stepping)n++;return n;};
 function plantAll(){const p=group.position,h=api.heading||0;for(const L of LIMBS){restAt(L,p.x,p.z,h,L.plant);L.pos.copy(L.plant);L.lift.copy(L.plant);L.stance=true;L.u=0;L.stepping=false;}}
 // Place it: ground point, heading (the game's convention: forward is (sin a, −cos a)).
 api.place=(x,y,z,heading)=>{group.position.set(x,y,z);group.rotation.set(0,Math.PI-heading,0);api.heading=heading;};
 api.show=v=>{const was=group.visible;group.visible=!!v&&api.loaded;if(group.visible&&!was)last.ok=false;};
 // Where its head is (world), for whether it has been seen.
 api.headPos=(v=new THREE.Vector3())=>{if(!bones)return null;group.updateMatrixWorld(true);return bones.head.getWorldPosition(v);};
 // Two circles along the body, for the player and the companions to stop against (never the mesh).
 api.colliders=()=>{if(!group.visible)return [];const a=api.heading||0,fx=Math.sin(a),fz=-Math.cos(a),p=group.position;
  return [{x:p.x-fx*.25,z:p.z-fz*.25,r:.42,creature:true},{x:p.x+fx*.45,z:p.z+fz*.45,r:.38,creature:true}];};
 // Every frame while it is shown.
 api.update=(dt)=>{if(!api.loaded||!group.visible)return;const D=api.drive;clock0+=dt;dt=Math.max(1e-4,Math.min(dt,.1));
  for(const r of rest){r.b.quaternion.copy(r.q);r.b.position.copy(r.p);}
  /* (the limbs are measured once, from the model's own rest pose: never from wherever the clip happened to be the
     first time it was shown, which would make where its hands land depend on which chapter showed it first) */
  inner.position.y=api.baseY;if(!LIMBS.length){group.updateMatrixWorld(true);initLimbs();}
  mixer.update(dt);if(clipAction)clipAction.timeScale=1+D.claw*1.5+Math.min(1,(api.sp||0)/4);
  group.updateMatrixWorld(true);
  const a=api.heading||0,p=group.position;fwd.set(Math.sin(a),0,-Math.cos(a));right.set(Math.cos(a),0,Math.sin(a));
  // where it really went since the last frame (a jump: plant everything where it now stands)
  let jumped=!last.ok;if(last.ok){const d=Math.hypot(p.x-last.x,p.z-last.z);if(d>2.5||Math.abs(p.y-last.y)>1.5)jumped=true;else vel.set((p.x-last.x)/dt,0,(p.z-last.z)/dt);}
  if(jumped){vel.set(0,0,0);velS.set(0,0,0);yawRate=0;accel=0;plantAll();}else{velS.lerp(vel,1-Math.exp(-14*dt));yawRate=damp(yawRate,wrap(a-last.a)/dt,10,dt);}
  last.x=p.x;last.y=p.y;last.z=p.z;last.a=a;last.ok=true;
  const sp=Math.hypot(velS.x,velS.z);api.sp=sp;accel=damp(accel,(sp-spPrev)/dt,4,dt);spPrev=sp;const moving=sp>.12||Math.abs(yawRate)>.9;
  // the gait for this speed
  const wG=smooth((sp-3.4)/1.8),wT=smooth((sp-1.1)/.9)*(1-wG),wW=1-wT-wG;
  const f=wW*(.8+sp*.5)+wT*(1.45+(sp-1.4)*.3)+wG*(2.3+Math.max(0,sp-4)*.17),duty=wW*.66+wT*.47+wG*.3;
  if(moving)G=(G+f*dt)%1;api.phase=G;
  // the body: lower when crouched or cowering, a bob with the steps (up through the gallop's flight), pitch with the
  // bound and against acceleration (nose down speeding up, sitting back stopping), a lean into turns
  const T2=2*Math.PI*G,lowK=.17*D.crouch+.23*D.cower+.05*wG;
  const bob=moving?(.012*wW+.03*wT)*(1-Math.cos(2*T2))/2+.045*wG*(.5+.5*Math.sin(T2-1.1)):0;
  const pitch=(moving?.075*wG*Math.sin(T2+.4):0)-clamp(accel*.018,-.14,.16)+.95*D.rear-.06*D.crouch+.14*(D.alert||0)-.1*D.cower;
  const roll=(moving?.03*(wW+wT)*Math.sin(T2):0)+clamp(-yawRate*Math.min(sp,6)*.035,-.22,.22);
  const flex=moving?.16*wG*Math.sin(T2+2.2):0;
  inner.position.y=api.baseY+bob-lowK;group.updateMatrixWorld(true);
  const root=bones.hips.parent;rotWorld(root,right,pitch);rotWorld(root,fwd,roll);
  rotWorld(bones.belly,right,flex*.6-.12*D.cower);rotWorld(bones.chest,right,flex*.4+.3*D.cower+.18*(D.alert||0));
  // the chest turns into a turn first
  rotWorld(bones.chest,_up,clamp(yawRate*.08,-.3,.3));
  // the limbs: stance (planted) or swing (an arc to the next landing); standing still, a step now and then to settle
  const stanceT=duty/Math.max(f,.1),sh=api.heading||0;let slip=0;
  for(const L of LIMBS){const off=wW*WALK[L.k]+wT*TROT[L.k]+wG*GALLOP[L.k],ph=((G+off)%1+1)%1;
   if(moving){L.stepping=false;const inSt=ph<duty;
    if(inSt&&!L.stance){L.stance=true;L.plant.copy(L.pos);L.plant.y=groundAt(L.plant.x,L.plant.z,p.y)+L.y0;}
    else if(!inSt&&L.stance){L.stance=false;L.lift.copy(L.plant);restAt(L,p.x,p.z,sh,_rest);L.liftRel=(L.liftRel||new THREE.Vector3()).subVectors(L.plant,_rest);}
    if(L.stance){restAt(L,p.x,p.z,sh,_rest);const far=_rest.distanceTo(L.plant);if(far>L.reach){_w.subVectors(L.plant,_rest).multiplyScalar((far-L.reach)/far);L.plant.sub(_w);}L.pos.copy(L.plant);}
    else{const u=(ph-duty)/(1-duty),tRem=(1-ph)/f;L.u=u;
     restAt(L,p.x+velS.x*tRem,p.z+velS.z*tRem,sh+yawRate*tRem,_land);_land.x+=velS.x*stanceT*.5;_land.z+=velS.z*stanceT*.5;
     restAt(L,p.x,p.z,sh,_rest);const rr=_land.distanceTo(_rest);if(rr>L.reach*.95){_w.subVectors(_land,_rest).multiplyScalar(L.reach*.95/rr);_land.copy(_rest).add(_w);}
     _land.y=groundAt(_land.x,_land.z,p.y)+L.y0;const e=.35*u+.65*ease(u),hgt=(L.fore?.11:.09)+.11*clamp(sp/7,0,1);
     /* (in the body's frame: from where it pushed off behind to where it will land ahead, so it never runs ahead of the shoulder) */
     if(L.liftRel){restAt(L,p.x,p.z,sh,_rest);_w.subVectors(_land,_rest);_w.y=0;L.pos.copy(_rest).addScaledVector(L.liftRel,1-e).addScaledVector(_w,e);L.pos.y=_rest.y*(1-e)+_land.y*e;}else L.pos.lerpVectors(L.lift,_land,e);L.pos.y+=hgt*Math.sin(Math.PI*u);if(!L.fore)L.pos.addScaledVector(fwd,-.06*Math.sin(Math.PI*Math.min(1,u*2))*wG);}}
   else{// standing: settle a limb that has been left too far from under the body, one at a time
    /* (one at a time when it is only settling; two when it has turned or shifted further; and at once, whatever the
       others are doing, for one it can no longer reach: a planted hand never stays where the arm cannot get to it) */
    restAt(L,p.x,p.z,sh,_rest);if(L.stepping){L.u=Math.min(1,L.u+dt/.28);L.pos.lerpVectors(L.lift,_rest,ease(L.u));L.pos.y+=.07*Math.sin(Math.PI*L.u);if(L.u>=1){L.plant.copy(_rest);L.pos.copy(_rest);L.stance=true;L.stepping=false;}}
    else{if(!L.stance){L.stance=true;L.plant.copy(L.pos);L.plant.y=_rest.y;}const far=L.plant.distanceTo(_rest),n=nStepping();
     if((n<1&&far>.17)||(n<2&&far>.3)||far>.45||L.slip>.08){L.stepping=true;L.stance=false;L.u=0;L.lift.copy(L.plant);}L.pos.copy(L.plant);}}
   // the fore limbs let go when it rears (the claws are below); a shiver through them when it cowers
   const w=L.fore?1-smooth(D.rear*1.6):1;if(D.cower>0)L.pos.y+=Math.sin(clock0*29+(L.fore?0:1.7))*.006*D.cower;
   _pole.copy(L.pole).applyQuaternion(group.getWorldQuaternion(_q3));
   if(w<1){_q1.copy(L.up.quaternion);_q2.copy(L.mid.quaternion);}
   ik(L,L.pos,_pole);
   if(w<1){L.up.quaternion.slerpQuaternions(_q1,L.up.quaternion.clone(),w);L.mid.quaternion.slerpQuaternions(_q2,L.mid.quaternion.clone(),w);L.up.updateMatrixWorld(true);}
   // the hand flat and the foot on its toes while planted; curled back in the swing
   if(L.tip){L.end.getWorldPosition(_a);L.tip.getWorldPosition(_tipW);_tip.copy(L.tipDir).applyQuaternion(group.getWorldQuaternion(_q3));if(!L.stance&&moving){_tip.addScaledVector(fwd,-.12*Math.sin(Math.PI*L.u));_tip.y+=.03*Math.sin(Math.PI*L.u);}
    rotFromTo(L.end,_v1.subVectors(_tipW,_a),_tip,L.stance?.85:.6);}
   if(L.stance&&w>=1){L.end.getWorldPosition(_a);L.slip=_a.distanceTo(L.plant);if(L.slip>slip){slip=L.slip;api.slipInfo={k:L.k,moving,yawRate:+yawRate.toFixed(2),sp:+sp.toFixed(2),far:+L.plant.distanceTo(restAt(L,p.x,p.z,sh,_rest)).toFixed(2)};}}else L.slip=0;}
  api.slip=slip;
  // rearing and clawing (Chapter Three's gate): the arms come up and forward and strike, one after the other
  if(D.claw>0||D.rear>0){const t=clock0,sL=Math.max(0,Math.sin(t*9)),sR=Math.max(0,Math.sin(t*9+2.2));
   rotWorld(bones.armL,right,(1.2*D.rear+.7*D.claw*sL)*(1-smooth(1-D.rear*1.6)));rotWorld(bones.armR,right,(1.2*D.rear+.7*D.claw*sR)*(1-smooth(1-D.rear*1.6)));
   rotWorld(bones.foreL,right,-.6*D.claw*(1-sL));rotWorld(bones.foreR,right,-.6*D.claw*(1-sR));}
  // the head: held level against the body's pitch and bob, turned to what it looks at (fast when it snaps round)
  rotWorld(bones.neck,right,-pitch*.55-flex*.3+.22*(D.alert||0)-.32*D.cower);
  if(D.look){bones.head.getWorldPosition(_hv);const dx=D.look.x-_hv.x,dz=D.look.z-_hv.z,dy=(D.look.y??_hv.y)-_hv.y,h=Math.hypot(dx,dz)||1;
   const yawTo=Math.atan2(dx,-dz),dyaw=clamp(Math.atan2(Math.sin(a-yawTo),Math.cos(a-yawTo)),-1.05,1.05),pt=clamp(Math.atan2(dy,h),-.5,.45),k=D.snap?18:6;
   api.headYaw=damp(api.headYaw||0,-dyaw,k,dt);api.headPitch=damp(api.headPitch||0,pt,k,dt);rotWorld(bones.neck,_up,api.headYaw*.45);rotWorld(bones.head,_up,api.headYaw*.55);_ax.copy(right);rotWorld(bones.head,_ax,api.headPitch);}
  else{api.headYaw=damp(api.headYaw||0,0,3,dt);api.headPitch=damp(api.headPitch||0,0,3,dt);rotWorld(bones.head,_up,api.headYaw);}
  // crouched and waiting: the head tilts, slowly; cowering: the head down and turned aside, a fast shiver
  if(D.crouch>0)rotWorld(bones.head,fwd,.24*D.crouch*Math.sin(clock0*.7));
  if(D.cower>0){const c=D.cower,s2=Math.sin(clock0*31)*.03*c;rotWorld(bones.head,_up,.35*c);rotWorld(bones.head,fwd,s2*1.5);rotWorld(bones.chest,fwd,s2);}
  // never through the floor (whatever the IK could not reach)
  group.updateMatrixWorld(true);let low=0;for(const [k,y0] of contacts){bones[k].getWorldPosition(_hv);const y=_hv.y-groundAt(_hv.x,_hv.z,group.position.y);low=Math.min(low,y-y0*.6);}
  api.bob=bob;api.lift=-low;if(low<0){inner.position.y-=low;group.updateMatrixWorld(true);}};
 const performanceNow=()=>clock0;void performanceNow;
 api.reset=()=>{group.visible=false;if(clipAction)clipAction.time=0;/* (the clip's own clock, and the bones in their rest pose, too: a reset creature is the one the page made) */if(rest)for(const r of rest){r.b.quaternion.copy(r.q);r.b.position.copy(r.p);}if(api.loaded)inner.position.y=api.baseY;api.phase=0;api.headYaw=0;api.headPitch=0;catchU.value=0;clock0=0;G=0;last.ok=false;yawRate=0;accel=0;spPrev=0;api.sp=0;api.slip=0;for(const L of LIMBS){L.stepping=false;L.slip=0;}
  Object.assign(api.drive,{speed:0,rear:0,claw:0,crouch:0,look:null,lift:0,cower:0,back:0,alert:0,snap:0});};
 return api;}
