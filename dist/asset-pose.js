// The existing pose contract (rig.js: 35 floats of root, lean/twist/yaw, head, hand/foot IK targets and elbow/knee poles)
// driving an authored skinned skeleton (rig.human.child bone names). Every scene that poses a procedural person today
// can pose a Blender character the same way: same targets, same IK (rig.js solveIK), same bone lengths (rig.js BODY).
// Phase 0A proves it on the probe; nothing in the story uses it yet.
//
// How: the joint positions are solved exactly as rig.js applyPose solves them; then each skeleton bone is turned from its
// bind pose so that it points at its solved child joint, with the limb's hinge axis matching the IK bend plane (so an
// elbow or knee bends the way the pole says, with no twist guessing). Spine, neck and head take rig.js's own spine and
// head rotations. The hips bone is moved to the pose root. Bones not named here keep their animation (jaw, eyes, fingers).
import * as THREE from './three.module.js';
import {BODY,P,spineQuat,headQuat,shoulderPos,solveIK} from './rig.js';

const _e=new THREE.Euler();
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const LIMBS=[['l',-1],['r',1]];

// Bind-pose data in "person space" (the instance's root group: ground y=0, front -Z, the pose contract's own space).
export function bindPose(inst){
 const {root,bones}=inst;root.updateWorldMatrix(true,true);
 const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),m=new THREE.Matrix4(),rest={};
 for(const [n,b] of Object.entries(bones)){m.multiplyMatrices(inv,b.matrixWorld);const p=V(),q=Q(),s=V();m.decompose(p,q,s);rest[n]={p,q,localQ:b.quaternion.clone(),localP:b.position.clone()};}
 const top=bones.root.parent;m.multiplyMatrices(inv,top.matrixWorld);const tp=V(),tq=Q(),ts=V();m.decompose(tp,tq,ts);
 const dir=(a,b)=>V().subVectors(rest[b].p,rest[a].p).normalize();
 // hinge axis at rest: cross(bone direction, the way the middle joint moves when the limb bends)
 const fwd=new THREE.Vector3(0,0,-1),back=new THREE.Vector3(0,0,1),limb={};
 for(const [s] of LIMBS){
  limb['upperarm_'+s]={d:dir('upperarm_'+s,'lowerarm_'+s),bend:back};limb['lowerarm_'+s]={d:dir('lowerarm_'+s,'hand_'+s),bend:back};
  limb['thigh_'+s]={d:dir('thigh_'+s,'calf_'+s),bend:fwd};limb['calf_'+s]={d:dir('calf_'+s,'foot_'+s),bend:fwd};}
 for(const L of Object.values(limb))L.h=V().crossVectors(L.d,L.bend).normalize();
 const lens={upper:rest['upperarm_l'].p.distanceTo(rest['lowerarm_l'].p),fore:rest['lowerarm_l'].p.distanceTo(rest['hand_l'].p),thigh:rest['thigh_l'].p.distanceTo(rest['calf_l'].p),shin:rest['calf_l'].p.distanceTo(rest['foot_l'].p)};
 // hierarchy order for the top-down pass
 const order=[];(function walk(b){if(b.isBone){order.push(b.name);for(const c of b.children)walk(c);}})(bones.root);
 inst.bind={rest,top:{p:tp,q:tq},limb,lens,order,parent:Object.fromEntries(order.map(n=>[n,bones[n].parent?.isBone?bones[n].parent.name:null]))};
 return inst.bind;
}

// rotation taking (d0, h0) to (d1, h1): both pairs orthonormalized
const _m0=new THREE.Matrix4(),_m1=new THREE.Matrix4();
function aim(d0,h0,d1,h1,out){const a=V().copy(d0),c=V().crossVectors(a,h0).normalize(),b=V().crossVectors(c,a);
 const a1=V().copy(d1),c1=V().crossVectors(a1,h1).normalize(),b1=V().crossVectors(c1,a1);
 _m0.makeBasis(a,b,c);_m1.makeBasis(a1,b1,c1);_m0.transpose();_m1.multiply(_m0);return out.setFromRotationMatrix(_m1);}

// Solve the joints from a pose array exactly as rig.js applyPose does (person space).
export function solveJoints(p,J={}){
 const B=BODY,root=V().set(p[0],p[1],p[2]),qp=Q().setFromEuler(_e.set(0,p[P.yaw],0)),qs=spineQuat(p,Q()),qh=headQuat(p,Q());
 Object.assign(J,{root,qp,qs,qh});
 for(const [s,side] of LIMBS){
  const sh=shoulderPos(p,side,V()),hand=V().fromArray(p,s==='l'?P.lh:P.rh),pole=V().fromArray(p,s==='l'?P.le:P.re),elbow=V(),wrist=V();
  solveIK(sh,hand,B.upper,B.fore,pole,elbow,wrist);
  const hip=V().set(side*B.hip,-.03,0).applyQuaternion(qp).add(root),foot=V().fromArray(p,s==='l'?P.lf:P.rf),kp=V().fromArray(p,s==='l'?P.lk:P.rk),knee=V(),ankle=V();
  solveIK(hip,foot,B.thigh,B.shin,kp,knee,ankle);
  J[s]={sh,elbow,wrist,hip,knee,ankle,footQ:Q().setFromEuler(_e.set(p[s==='l'?P.lfp:P.rfp],p[P.yaw]+side*.08,0,'YXZ'))};}
 return J;}

// Pose the skeleton. Returns the solved joints (person space) so callers can check contacts.
export function drivePose(inst,p){
 const K=inst.bind||bindPose(inst),R=K.rest,bones=inst.bones,J=solveJoints(p);
 const target={};// person-space rotation per driven bone
 const spineDelta=Q().copy(J.qs);
 target.hips=Q().multiplyQuaternions(J.qp,R.hips.q);
 for(const n of ['spine_01','spine_02','chest','neck','clavicle_l','clavicle_r'])target[n]=Q().multiplyQuaternions(spineDelta,R[n].q);
 target.head=Q().multiplyQuaternions(J.qh,R.head.q);
 const tmp=Q();
 for(const [s] of LIMBS){const j=J[s];
  for(const [up,lo,a,m,b,pole] of [['upperarm_'+s,'lowerarm_'+s,j.sh,j.elbow,j.wrist,V().fromArray(p,s==='l'?P.le:P.re)],['thigh_'+s,'calf_'+s,j.hip,j.knee,j.ankle,V().fromArray(p,s==='l'?P.lk:P.rk)]]){
   const d1=V().subVectors(m,a).normalize(),d2=V().subVectors(b,m).normalize(),line=V().subVectors(b,a).normalize();
   // bend side: from the root-to-end line out to the middle joint (straight limb: the pole's side), as at rest
   const bend=V().subVectors(m,a).addScaledVector(line,-V().subVectors(m,a).dot(line));
   if(bend.lengthSq()<1e-8)bend.copy(pole).addScaledVector(line,-pole.dot(line));
   const h=V().crossVectors(d1,bend.normalize()).normalize();// same plane for both bones, so the same hinge
   target[up]=aim(K.limb[up].d,K.limb[up].h,d1,h,Q()).multiply(R[up].q);
   target[lo]=aim(K.limb[lo].d,K.limb[lo].h,d2,h,Q()).multiply(R[lo].q);
  }
  // the hand continues the forearm; the foot takes rig.js's shoe rotation
  target['hand_'+s]=Q().multiplyQuaternions(tmp.multiplyQuaternions(target['lowerarm_'+s],Q().copy(R['lowerarm_'+s].q).invert()),R['hand_'+s].q);
  target['foot_'+s]=Q().multiplyQuaternions(j.footQ,R['foot_'+s].q);
 }
 // top-down: local = parentPerson^-1 * person
 const person={};const inv=Q();
 for(const n of K.order){const par=K.parent[n],pq=par?person[par]:K.top.q,b=bones[n];
  person[n]=target[n]||Q().multiplyQuaternions(pq,b.quaternion);
  if(target[n])b.quaternion.copy(inv.copy(pq).invert().multiply(target[n]));}
 // hips to the pose root (person space -> the root bone's space)
 const rootM=new THREE.Matrix4().compose(R.root.p,R.root.q,V().set(1,1,1)).invert();
 bones.hips.position.copy(J.root).applyMatrix4(rootM);
 // rig.js turns the whole torso about the pose root (the pelvis), not about the top of the hips bone: place spine_01's
 // head where that rotation puts it, in the hips bone's space
 const sp=V().subVectors(R.spine_01.p,R.hips.p).applyQuaternion(J.qs).add(J.root);
 const hipsM=new THREE.Matrix4().compose(J.root,person.hips,V().set(1,1,1)).invert();
 bones.spine_01.position.copy(sp.applyMatrix4(hipsM));
 inst.root.updateMatrixWorld(true);
 return J;
}

// Contact check: where the skeleton's joints and sockets ended up versus the pose's own targets (person space, metres).
export function contactReport(inst,J,extra={}){
 const inv=new THREE.Matrix4().copy(inst.root.matrixWorld).invert(),w=V();
 const at=n=>{const o=inst.bones[n]||inst.bones['socket_'+n];o.updateWorldMatrix(true,false);return o.getWorldPosition(V()).applyMatrix4(inv);};
 const out={};for(const [s] of LIMBS){const j=J[s];
  out['wrist_'+s]=+at('hand_'+s).distanceTo(j.wrist).toFixed(4);out['elbow_'+s]=+at('lowerarm_'+s).distanceTo(j.elbow).toFixed(4);
  out['knee_'+s]=+at('calf_'+s).distanceTo(j.knee).toFixed(4);out['ankle_'+s]=+at('foot_'+s).distanceTo(j.ankle).toFixed(4);out['shoulder_'+s]=+at('upperarm_'+s).distanceTo(j.sh).toFixed(4);}
 for(const [k,v] of Object.entries(extra))out[k]=+at(v.socket).distanceTo(v.point).toFixed(4);
 return out;}
