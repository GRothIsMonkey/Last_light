// Kid-scale people and bicycles. A pose is a small array of IK targets, so any
// two poses blend without stretching limbs, and feet can be planted exactly.
import * as THREE from './three.module.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const BODY={hip:.085,thigh:.38,shin:.37,ankle:.065,torso:.44,shoulder:.155,upper:.25,fore:.23,neck:.07,head:.105,stand:.80};
// Bicycle frame, bike-local: origin on the ground between the tyres, forward is -z.
export const BIKE={wheelR:.31,front:-.52,rear:.48,bb:[0,.30,.03],crank:.15,pedalX:.12,saddle:[0,.88,.21],grip:[.28,1.02,-.40],pivot:[0,.69,-.42],rake:.286,wheelbase:1.0};

// Pose layout ------------------------------------------------------------------
export const P={root:0,yaw:3,lean:4,roll:5,twist:6,hy:7,hp:8,lh:9,rh:12,lf:15,rf:18,lfp:21,rfp:22,lk:23,rk:26,le:29,re:32};
export const POSE_SIZE=35;
export function newPose(){const p=new Float32Array(POSE_SIZE);standPose(p,0);return p;}
const set3=(p,o,x,y,z)=>{p[o]=x;p[o+1]=y;p[o+2]=z;};
export function blendPose(out,a,b,t){for(let i=0;i<POSE_SIZE;i++)out[i]=a[i]+(b[i]-a[i])*t;return out;}
export function copyPose(out,a){out.set(a);return out;}
// Uniform Catmull-Rom through timed keyframes [[t,pose],...].
export function samplePose(out,keys,t){
 if(t<=keys[0][0])return copyPose(out,keys[0][1]);const n=keys.length;if(t>=keys[n-1][0])return copyPose(out,keys[n-1][1]);
 let i=0;while(i<n-2&&t>=keys[i+1][0])i++;const u=smooth((t-keys[i][0])/(keys[i+1][0]-keys[i][0]));
 const p0=keys[Math.max(0,i-1)][1],p1=keys[i][1],p2=keys[i+1][1],p3=keys[Math.min(n-1,i+2)][1],u2=u*u,u3=u2*u;
 for(let k=0;k<POSE_SIZE;k++)out[k]=.5*((2*p1[k])+(-p0[k]+p2[k])*u+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*u2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*u3);
 return out;
}

// Shared geometry and materials --------------------------------------------------
const mats=new Map();
export function material(color,extra={}){const key=color+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.85,...extra}));return mats.get(key);}
const geos=new Map();
function capsule(r,len){const key=r+':'+len;if(!geos.has(key))geos.set(key,new THREE.CapsuleGeometry(r,len,3,8));return geos.get(key);}
const ball=new THREE.IcosahedronGeometry(1,2),cube=new THREE.BoxGeometry(1,1,1),sneaker=new THREE.CapsuleGeometry(.042,.14,3,8).rotateX(Math.PI/2).scale(1.05,.85,1);
function mesh(parent,geo,color,shadow=true){const m=new THREE.Mesh(geo,typeof color==='object'?color:material(color));m.castShadow=shadow;parent.add(m);return m;}

// People ---------------------------------------------------------------------------
export function createPerson({shirt=0x7a8fa6,shorts=0x4e5566,skin=0xd6a57f,hair=0x4a3528,shoes=0xe6e0d0,cap=null,longHair=false,pants=false,sleeves=false,scale=1,firstPerson=false,stripe=null}={}){
 const group=new THREE.Group(),B=BODY,parts={};group.scale.setScalar(scale);
 parts.pelvis=mesh(group,capsule(.085,.1),pants||shorts);parts.pelvis.scale.set(1,1,.82);
 parts.torso=mesh(group,capsule(.105,firstPerson?.08:.25),shirt);parts.torso.scale.set(1.22,1,.8);
 if(stripe!==null){parts.stripe=mesh(group,capsule(.107,.03),stripe);parts.stripe.scale.set(1.22,1,.8);}
 if(!firstPerson){
  parts.neck=mesh(group,capsule(.036,.05),skin,false);
  parts.head=mesh(group,ball,skin);parts.head.scale.set(.1,.112,.104);
  parts.hair=mesh(group,ball,hair);parts.hair.scale.set(.108,.09,.112);
  if(longHair){parts.tail=mesh(group,capsule(.06,.1),hair);}
  if(cap!==null){parts.cap=mesh(group,ball,cap);parts.cap.scale.set(.113,.07,.115);parts.brim=mesh(group,cube,cap);parts.brim.scale.set(.15,.015,.1);}
 }
 for(const s of ['l','r']){
  parts[s+'sleeve']=mesh(group,capsule(.047,sleeves?.2:.07),shirt);
  parts[s+'upper']=mesh(group,capsule(.035,B.upper),skin);
  parts[s+'fore']=mesh(group,capsule(.03,B.fore),sleeves?shirt:skin);
  parts[s+'hand']=mesh(group,ball,skin,false);parts[s+'hand'].scale.set(.036,.042,.038);
  parts[s+'thigh']=mesh(group,capsule(.062,B.thigh),pants||shorts);
  parts[s+'shin']=mesh(group,capsule(.043,B.shin),pants||skin);
  parts[s+'sock']=mesh(group,capsule(.046,.03),pants||0xf0ece2,false);
  parts[s+'shoe']=mesh(group,sneaker,shoes);
 }
 const person={group,parts,pose:newPose(),scale,firstPerson,joints:{}};
 applyPose(person,person.pose);return person;
}
const _v=[...Array(12)].map(()=>new THREE.Vector3()),_q=[...Array(6)].map(()=>new THREE.Quaternion()),_e=new THREE.Euler(),UP=new THREE.Vector3(0,1,0);
function place(m,a,b){m.position.addVectors(a,b).multiplyScalar(.5);_v[11].subVectors(b,a).normalize();m.quaternion.setFromUnitVectors(UP,_v[11]);}
function placeAlong(m,a,b,from,len){_v[11].subVectors(b,a).normalize();m.position.copy(a).addScaledVector(_v[11],from+len/2);m.quaternion.setFromUnitVectors(UP,_v[11]);}
// Two-bone IK in a plane chosen by a pole direction; returns the clamped reach.
export function solveIK(a,t,l1,l2,pole,mid,end){
 const dir=_v[9].subVectors(t,a);let len=dir.length();dir.divideScalar(len||1);len=clamp(len,Math.abs(l1-l2)+1e-3,l1+l2-1e-4);
 end.copy(a).addScaledVector(dir,len);const x=(l1*l1-l2*l2+len*len)/(2*len),h=Math.sqrt(Math.max(0,l1*l1-x*x));
 const perp=_v[10].copy(pole).addScaledVector(dir,-pole.dot(dir));if(perp.lengthSq()<1e-8)perp.set(0,0,-1);perp.normalize();
 mid.copy(a).addScaledVector(dir,x).addScaledVector(perp,h);return len;
}
export function spineQuat(p,q){return q.setFromEuler(_e.set(-p[P.lean],p[P.yaw]+p[P.twist],-p[P.roll],'YXZ'));}
export function shoulderPos(p,side,out){const q=spineQuat(p,_q[5]);return out.set(side*BODY.shoulder,BODY.torso-.045,.01).applyQuaternion(q).add(_v[8].set(p[0],p[1],p[2]));}
export function headPos(p,out){const q=spineQuat(p,_q[5]);out.set(0,BODY.torso,0).applyQuaternion(q).add(_v[8].set(p[0],p[1],p[2]));_q[4].setFromEuler(_e.set(p[P.hp],p[P.yaw]+p[P.twist]+p[P.hy],-p[P.roll]*.3,'YXZ'));return out.add(_v[7].set(0,BODY.neck*.6+BODY.head,-.012).applyQuaternion(_q[4]));}
// Pose the meshes from the pose array. Joint positions are kept for gameplay use.
export function applyPose(person,p){
 const B=BODY,pr=person.parts,J=person.joints,root=_v[0].set(p[0],p[1],p[2]);
 const qp=_q[0].setFromEuler(_e.set(0,p[P.yaw],0)),qs=spineQuat(p,_q[1]),qh=_q[2].setFromEuler(_e.set(p[P.hp],p[P.yaw]+p[P.twist]+p[P.hy],-p[P.roll]*.3,'YXZ'));
 pr.pelvis.position.copy(root);pr.pelvis.quaternion.copy(qp).multiply(_q[3].setFromAxisAngle(_v[1].set(0,0,1),Math.PI/2));
 pr.torso.position.set(0,person.firstPerson?.12:.23,0).applyQuaternion(qs).add(root);pr.torso.quaternion.copy(qs);
 if(pr.stripe){pr.stripe.position.set(0,.3,0).applyQuaternion(qs).add(root);pr.stripe.quaternion.copy(qs);}
 const neck=_v[2].set(0,B.torso,0).applyQuaternion(qs).add(root);
 if(pr.neck){pr.neck.position.set(0,.035,0).applyQuaternion(qs).add(neck);pr.neck.quaternion.copy(qs);
  const head=_v[3].set(0,B.neck*.6+B.head,-.012).applyQuaternion(qh).add(neck);pr.head.position.copy(head);pr.head.quaternion.copy(qh);
  pr.hair.position.set(0,.035,.012).applyQuaternion(qh).add(head);pr.hair.quaternion.copy(qh);
  if(pr.tail){pr.tail.position.set(0,-.07,.085).applyQuaternion(qh).add(head);pr.tail.quaternion.copy(qh);}
  if(pr.cap){pr.cap.position.set(0,.05,.005).applyQuaternion(qh).add(head);pr.cap.quaternion.copy(qh);pr.brim.position.set(0,.045,-.11).applyQuaternion(qh).add(head);pr.brim.quaternion.copy(qh);}
  (J.head||(J.head=new THREE.Vector3())).copy(head);
 }
 for(const [s,side] of [['l',-1],['r',1]]){
  const sh=_v[4].set(side*B.shoulder,B.torso-.045,.01).applyQuaternion(qs).add(root);
  const hand=_v[5].fromArray(p,s==='l'?P.lh:P.rh),pole=_v[6].fromArray(p,s==='l'?P.le:P.re),elbow=_v[1],wrist=_v[7];
  solveIK(sh,hand,B.upper,B.fore,pole,elbow,wrist);
  placeAlong(pr[s+'sleeve'],sh,elbow,-.01,sleevesLen(pr[s+'sleeve']));place(pr[s+'upper'],sh,elbow);place(pr[s+'fore'],elbow,wrist);
  _v[11].subVectors(wrist,elbow).normalize();pr[s+'hand'].position.copy(wrist).addScaledVector(_v[11],.035);pr[s+'hand'].quaternion.copy(pr[s+'fore'].quaternion);(J[s+'wrist']||(J[s+'wrist']=new THREE.Vector3())).copy(wrist);
  const hip=_v[4].set(side*B.hip,-.03,0).applyQuaternion(qp).add(root);
  const foot=_v[5].fromArray(p,s==='l'?P.lf:P.rf),kpole=_v[6].fromArray(p,s==='l'?P.lk:P.rk),knee=_v[1],ankle=_v[7];
  solveIK(hip,foot,B.thigh,B.shin,kpole,knee,ankle);
  place(pr[s+'thigh'],hip,knee);place(pr[s+'shin'],knee,ankle);placeAlong(pr[s+'sock'],ankle,knee,.02,.03);
  const shoe=pr[s+'shoe'];shoe.quaternion.setFromEuler(_e.set(p[s==='l'?P.lfp:P.rfp],p[P.yaw]+side*.08,0,'YXZ'));
  shoe.position.set(0,-B.ankle*.45,-.055).applyQuaternion(shoe.quaternion).add(ankle);
  (J[s+'ankle']||(J[s+'ankle']=new THREE.Vector3())).copy(ankle);
 }
}
function sleevesLen(m){return m.geometry.parameters.length+.02;}

// Pose generators (person-local: ground at y=0, forward is -z) -------------------
export function standPose(p,t=0,{look=0,lookPitch=0,shift=1}={}){
 const sway=Math.sin(t*.7)*.018*shift,breath=Math.sin(t*1.9)*.004;
 set3(p,P.root,sway,BODY.stand+breath-.004*Math.abs(Math.sin(t*.7))*shift,0);p[P.yaw]=Math.sin(t*.37)*.05*shift;p[P.lean]=.03;p[P.roll]=-sway*1.4;p[P.twist]=0;p[P.hy]=look;p[P.hp]=lookPitch;
 set3(p,P.lf,-.1,BODY.ankle,.02);set3(p,P.rf,.11,BODY.ankle,-.03);p[P.lfp]=0;p[P.rfp]=0;
 set3(p,P.lh,-.19+sway,BODY.stand-.075+breath,.03);set3(p,P.rh,.19+sway,BODY.stand-.075+breath,.02);
 set3(p,P.lk,-.05,0,-1);set3(p,P.rk,.05,0,-1);set3(p,P.le,-.3,0,1);set3(p,P.re,.3,0,1);return p;
}
// Walking and running with planted stance feet. phase advances by distance/stride.
export function stride(speed){return clamp(.62+.42*speed,.8,2.3);}
export function walkPose(p,phase,speed,{look=0,lookPitch=0}={}){
 const run=smooth((speed-1.7)/1.3),beta=.58-.2*run,S=stride(speed),lift=.08+.13*run,tau=Math.PI*2;
 const ph=phase-Math.floor(phase);
 const foot=(o,side)=>{const u=(ph+(side>0?.5:0))%1;let f,y=BODY.ankle,pitch=0;
  if(u<beta){f=beta*S/2-S*u;pitch=.25*(1-smooth(u/(beta*.25)))-.45*smooth((u-beta*.7)/(beta*.3));}
  else{const w=(u-beta)/(1-beta);f=beta*S/2+S*(w-Math.sin(tau*w)/tau)-S*u;y+=lift*Math.sin(Math.PI*w);pitch=-.5*(1-smooth(w*2.5))+.2*smooth((w-.6)/.4);}
  set3(p,o,side*(BODY.hip*1.05-.02*run),y,-f);return pitch;};
 p[P.lfp]=foot(P.lf,-1);p[P.rfp]=foot(P.rf,1);
 const bob=(1-run)*(.018*Math.cos(tau*2*ph))+run*(-.035*Math.cos(tau*2*ph));
 set3(p,P.root,.016*Math.sin(tau*ph)*(1-run),BODY.stand-.03-.04*run+bob,0);
 p[P.yaw]=.1*Math.sin(tau*ph);p[P.twist]=-.18*Math.sin(tau*ph);p[P.lean]=.05+.22*run;p[P.roll]=-.02*Math.sin(tau*ph);
 p[P.hy]=look;p[P.hp]=lookPitch;
 const swing=Math.sin(tau*ph),y=p[1];
 set3(p,P.lh,-.19+.03*run,y-.07+.2*run+.08*run*Math.max(0,swing),-(.15+.1*run)*swing-.02);set3(p,P.rh,.19-.03*run,y-.07+.2*run+.08*run*Math.max(0,-swing),(.15+.1*run)*swing-.02);
 set3(p,P.lk,0,0,-1);set3(p,P.rk,0,0,-1);set3(p,P.le,-.2,-.2*run,1);set3(p,P.re,.2,-.2*run,1);return p;
}
// Right-hand wave layered over any pose.
export function addWave(p,t,w){if(w<=0)return p;const sh=shoulderPos(p,1,_v[3]);
 const x=sh.x+.12+Math.sin(t*9)*.07,y=sh.y+.36+Math.cos(t*9)*.015,z=sh.z-.05;
 p[P.rh]+= (x-p[P.rh])*w;p[P.rh+1]+=(y-p[P.rh+1])*w;p[P.rh+2]+=(z-p[P.rh+2])*w;
 p[P.re]+=(1-p[P.re])*w;p[P.re+1]+=(-.3-p[P.re+1])*w;p[P.re+2]+=(.2-p[P.re+2])*w;return p;}

// Bicycles -----------------------------------------------------------------------
const pivot=new THREE.Vector3(...BIKE.pivot),rakeQ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),BIKE.rake),rakeInv=rakeQ.clone().invert();
const toSteer=(x,y,z)=>new THREE.Vector3(x,y,z).sub(pivot).applyQuaternion(rakeInv);
function rod(parent,a,b,r,color){const m=mesh(parent,new THREE.CylinderGeometry(r,r,1,6),color);const A=a.isVector3?a:new THREE.Vector3(...a),Bv=b.isVector3?b:new THREE.Vector3(...b);place(m,A,Bv);m.scale.y=A.distanceTo(Bv);return m;}
function wheel(color){const g=new THREE.Group();const tyre=mesh(g,new THREE.TorusGeometry(BIKE.wheelR-.025,.026,6,28),0x2f3133);tyre.rotation.y=Math.PI/2;
 const rim=mesh(g,new THREE.TorusGeometry(BIKE.wheelR-.05,.009,4,28),0xb8bbb4,false);rim.rotation.y=Math.PI/2;
 const hub=mesh(g,new THREE.CylinderGeometry(.022,.022,.1,8),0x9fa39c,false);hub.rotation.z=Math.PI/2;
 const pts=[];for(let k=0;k<18;k++){const a=k/18*Math.PI*2,side=k%2?.035:-.035;pts.push(side,0,0,0,Math.sin(a)*(BIKE.wheelR-.055),Math.cos(a)*(BIKE.wheelR-.055));}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.add(new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xc9cbc2})));
 if(color){const refl=mesh(g,cube,color,false);refl.scale.set(.012,.05,.025);refl.position.set(0,.16,0);}return g;}
export function createBike(color,{rider=true,grips=0x2b2b2d}={}){
 const group=new THREE.Group(),frame=new THREE.Group();group.add(frame);
 const bb=new THREE.Vector3(...BIKE.bb),seat=new THREE.Vector3(0,.73,.17),top=new THREE.Vector3(0,.85,-.37),low=new THREE.Vector3(0,.70,-.415),rear=new THREE.Vector3(0,BIKE.wheelR,BIKE.rear);
 rod(frame,seat,top,.024,color);rod(frame,bb,low,.028,color);rod(frame,bb,seat,.024,color);rod(frame,low,top.clone().add(new THREE.Vector3(0,.02,.005)),.032,color);
 for(const s of [-1,1]){rod(frame,bb,new THREE.Vector3(s*.05,rear.y,rear.z),.013,color);rod(frame,seat.clone().add(new THREE.Vector3(s*.012,-.02,.01)),new THREE.Vector3(s*.05,rear.y,rear.z),.012,color);}
 rod(frame,seat,[0,.87,.20],.014,0x9da09a);const saddle=mesh(frame,cube,0x262626);saddle.scale.set(.1,.045,.24);saddle.position.set(0,.885,.215);const nose=mesh(frame,cube,0x262626);nose.scale.set(.06,.035,.08);nose.position.set(0,.88,.09);
 const reflector=mesh(frame,cube,0xb2352c,false);reflector.scale.set(.05,.03,.012);reflector.position.set(0,.8,.34);
 const rearWheel=wheel(0xd9a13a);rearWheel.position.copy(rear);frame.add(rearWheel);
 const cog=mesh(frame,new THREE.CylinderGeometry(.04,.04,.012,10),0x77796f,false);cog.rotation.z=Math.PI/2;cog.position.set(.055,rear.y,rear.z);
 const chainPts=[.06,bb.y+.085,bb.z,.06,rear.y+.04,rear.z,.06,bb.y-.085,bb.z,.06,rear.y-.04,rear.z],cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(chainPts,3));frame.add(new THREE.LineSegments(cg,new THREE.LineBasicMaterial({color:0x444440})));
 // Steering assembly, rotating about the raked head tube.
 const steerPivot=new THREE.Group();steerPivot.position.copy(pivot);steerPivot.quaternion.copy(rakeQ);frame.add(steerPivot);const steer=new THREE.Group();steerPivot.add(steer);
 const axle=toSteer(0,BIKE.wheelR,BIKE.front);for(const s of [-1,1])rod(steer,toSteer(s*.03,.66,-.415),axle.clone().add(new THREE.Vector3(s*.048,0,0)),.013,color);rod(steer,toSteer(0,.66,-.415),toSteer(0,.72,-.41),.026,color);
 const stemTop=toSteer(0,1.0,-.395);rod(steer,toSteer(0,.86,-.37),stemTop,.017,0x6c6e69);
 const g=BIKE.grip;rod(steer,toSteer(-g[0]+.06,g[1],g[2]),toSteer(g[0]-.06,g[1],g[2]),.012,0x9da09a);rod(steer,toSteer(-.06,g[1],g[2]),stemTop,.012,0x9da09a);rod(steer,toSteer(.06,g[1],g[2]),stemTop,.012,0x9da09a);
 for(const s of [-1,1]){rod(steer,toSteer(s*(g[0]-.07),g[1],g[2]),toSteer(s*(g[0]+.04),g[1],g[2]),.019,grips);}
 const frontWheel=wheel(0xe0dcd0);frontWheel.position.copy(axle);steer.add(frontWheel);
 const bell=mesh(steer,ball,0xc8c6bc,false);bell.scale.set(.026,.018,.026);bell.position.copy(toSteer(-.15,g[1]+.025,g[2]));
 // Cranks turn; pedals stay level.
 const crank=new THREE.Group();crank.position.copy(bb);frame.add(crank);
 const ring=mesh(crank,new THREE.TorusGeometry(.085,.008,4,20),0x8e908a,false);ring.rotation.y=Math.PI/2;ring.position.x=.055;
 for(const s of [-1,1]){const arm=mesh(crank,cube,0x55575a,false);arm.scale.set(.016,BIKE.crank,.024);arm.position.set(s*.075,s*BIKE.crank/2,0);}
 const pedals=[-1,1].map(s=>{const pd=mesh(frame,cube,0x3b3d3e);pd.scale.set(.085,.022,.06);return pd;});
 const kickPivot=new THREE.Group();kickPivot.position.set(-.05,.28,.13);frame.add(kickPivot);const kick=mesh(kickPivot,new THREE.CylinderGeometry(.011,.009,.3,5),0x77797a,false);kick.position.y=-.15;
 const bike={group,frame,steer,frontWheel,rearWheel,crank,pedals,kickPivot,color,wheel:0,crankAngle:0,steerAngle:0,kickstand:0};
 poseBike(bike);return bike;
}
export function pedalPos(crank,side,out=new THREE.Vector3()){const a=crank+(side<0?Math.PI:0);return out.set(side*BIKE.pedalX,BIKE.bb[1]+Math.cos(a)*BIKE.crank,BIKE.bb[2]-Math.sin(a)*BIKE.crank);}
export function gripPos(steerAngle,side,out=new THREE.Vector3()){const g=BIKE.grip;out.set(side*g[0],g[1],g[2]).sub(pivot).applyQuaternion(rakeInv).applyAxisAngle(UP,steerAngle).applyQuaternion(rakeQ).add(pivot);return out;}
export function poseBike(bike){
 bike.frontWheel.rotation.x=bike.rearWheel.rotation.x=-bike.wheel;bike.crank.rotation.x=-bike.crankAngle;bike.steer.rotation.y=bike.steerAngle;
 pedalPos(bike.crankAngle,-1,bike.pedals[0].position);pedalPos(bike.crankAngle,1,bike.pedals[1].position);
 // Stowed along the chainstay, deployed down and out to meet the ground.
 const k=bike.kickstand;bike.kickPivot.rotation.set(-1.2*(1-k)-.25*k,0,-.32*k);
}
// Rider on a bicycle: seated, standing on the pedals, or stopped astride the frame.
const _p=new THREE.Vector3();
export function ridePose(p,crank,{stand=0,astride=0,steer=0,look=0,lookPitch=0,rock=0}={}){
 const lean=.62+.12*stand-.40*astride+Math.abs(steer)*.1*(1-astride);
 set3(p,P.root,rock*.02,.925+.1*stand-.12*astride,.21-.17*stand-.13*astride);p[P.yaw]=0;p[P.lean]=lean;p[P.roll]=-rock*.6;p[P.twist]=steer*.95*(1-astride);p[P.hy]=look;p[P.hp]=lookPitch;
 for(const [o,side,po] of [[P.lf,-1,P.lfp],[P.rf,1,P.rfp]]){
  pedalPos(crank,side,_p);const a=crank+(side<0?Math.PI:0);
  const px=side*(BIKE.pedalX+.035),py=_p.y+.062,pz=_p.z+.05,gx=side*.23,gy=BODY.ankle,gz=.06;
  set3(p,o,px+(gx-px)*astride,py+(gy-py)*astride,pz+(gz-pz)*astride);p[po]=(.12*Math.sin(a)-.05)*(1-astride);
 }
 gripPos(steer,-1,_p);set3(p,P.lh,_p.x+.01,_p.y+.02,_p.z+.02);gripPos(steer,1,_p);set3(p,P.rh,_p.x-.01,_p.y+.02,_p.z+.02);
 set3(p,P.lk,-.12,0,-1);set3(p,P.rk,.12,0,-1);set3(p,P.le,-.7,-.3,.6);set3(p,P.re,.7,-.3,.6);return p;
}
// Keyframed dismount from astride: the right leg swings back over the saddle.
export function dismountKeys(){
 const k0=ridePose(newPose(),0,{astride:1});
 const k1=copyPose(newPose(),k0);set3(k1,P.root,-.07,.8,.1);k1[P.lean]=.3;set3(k1,P.rf,.24,.3,.32);k1[P.rfp]=-.3;set3(k1,P.rk,.3,0,-1);
 const k2=copyPose(newPose(),k1);set3(k2,P.root,-.22,.8,.13);k2[P.yaw]=-.45;k2[P.lean]=.42;set3(k2,P.rf,.02,.72,.58);set3(k2,P.lf,-.24,BODY.ankle,.07);set3(k2,P.rk,.4,.6,.4);
 const k3=copyPose(newPose(),k2);set3(k3,P.root,-.36,.8,.08);k3[P.yaw]=-.25;k3[P.lean]=.22;set3(k3,P.rf,-.5,.24,.22);set3(k3,P.rk,-.2,0,-1);
 const k4=copyPose(newPose(),k3);set3(k4,P.root,-.43,BODY.stand,-.08);k4[P.yaw]=0;k4[P.lean]=.1;set3(k4,P.rf,-.33,BODY.ankle,-.02);set3(k4,P.lf,-.54,BODY.ankle,-.1);k4[P.rfp]=0;set3(k4,P.lk,-.05,0,-1);set3(k4,P.rk,.05,0,-1);
 gripPos(0,-1,_p);set3(k4,P.lh,_p.x+.01,_p.y+.02,_p.z+.02);set3(k4,P.rh,-.02,BIKE.saddle[1]+.04,BIKE.saddle[2]);set3(k4,P.re,.4,-.4,.4);
 set3(k3,P.rh,.1,BIKE.saddle[1]+.06,.05);
 return [[0,k0],[.3,k1],[.62,k2],[.95,k3],[1.3,k4]];
}
// Walking a bike: the bike is on the person's right; left hand on the left grip, right on the saddle.
export const PUSH_OFFSET={x:.43,z:.12};
export function pushPose(p,phase,speed,opts){walkPose(p,phase,speed,opts);p[P.twist]*=.3;p[P.yaw]*=.4;p[P.lean]+=.06;
 gripPos(0,-1,_p);set3(p,P.lh,_p.x+PUSH_OFFSET.x+.01,_p.y+.02,_p.z+PUSH_OFFSET.z+.02);set3(p,P.rh,PUSH_OFFSET.x-.01,BIKE.saddle[1]+.03,.09+PUSH_OFFSET.z);set3(p,P.le,-.5,-.3,.6);set3(p,P.re,.4,-.4,.4);return p;}
