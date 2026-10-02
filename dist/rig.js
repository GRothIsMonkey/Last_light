// Kid-scale people and bicycles. A pose is a small array of IK targets, so any
// two poses blend without stretching limbs, and feet can be planted exactly.
// Looks come from cast.js: each head (face, ears, hair or cap) is one merged mesh,
// each bicycle a handful of merged rigid assemblies (frame, steering, wheels, crank).
import * as THREE from './three.module.js';
import {roundedBoxGeometry} from './kit.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const BODY={hip:.085,thigh:.38,shin:.37,ankle:.065,torso:.44,shoulder:.155,upper:.25,fore:.23,neck:.07,head:.105,stand:.80};
// Bicycle frame, bike-local: origin on the ground between the tyres, forward is -z.
// Every bike carries its own copy (see bikeGeometry); this is the default one.
export const BIKE={wheelR:.31,front:-.52,rear:.48,bb:[0,.30,.03],crank:.15,pedalX:.12,saddle:[0,.88,.21],grip:[.28,1.02,-.40],pivot:[0,.69,-.42],rake:.286,wheelbase:1.0};
const STYLES={
 'road-kid':{},
 bmx:{wheelR:.29,bb:[0,.29,.03],saddle:[0,.85,.23],grip:[.3,1.06,-.38],pivot:[0,.66,-.43],front:-.5,rear:.46},
 mtb:{wheelR:.32,bb:[0,.31,.02],saddle:[0,.89,.22],grip:[.31,1.0,-.43],pivot:[0,.7,-.43],front:-.53,rear:.49},
 cruiser:{wheelR:.31,saddle:[0,.88,.24],grip:[.3,1.04,-.36],pivot:[0,.7,-.44]},
};
export function bikeGeometry(style='road-kid',wheelR=null){const G={...BIKE,...(STYLES[style]||{})};if(wheelR)G.wheelR=wheelR;G.style=style;
 G.pivotV=new THREE.Vector3(...G.pivot);G.rakeQ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),G.rake);G.rakeInv=G.rakeQ.clone().invert();return G;}
const DEFAULT_G=bikeGeometry();

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
const vcMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),vcMetal=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.38});
const geos=new Map();
function capsule(r,len){const key=r.toFixed(4)+':'+len;if(!geos.has(key))geos.set(key,new THREE.CapsuleGeometry(r,len,4,12));return geos.get(key);}
// Icosahedra come out flat-shaded; a unit sphere's normals are just its positions.
function sphereGeo(detail){const g=new THREE.IcosahedronGeometry(1,detail);g.setAttribute('normal',g.attributes.position.clone());return g;}
const ball=sphereGeo(2);
function mesh(parent,geo,color,shadow=true){const m=new THREE.Mesh(geo,typeof color==='object'?color:material(color));m.castShadow=shadow;parent.add(m);return m;}
// Merge rigid parts ({geo,color,matrix}) into one vertex-colored geometry.
const _c=new THREE.Color();
// Alex's rear reflector: the broken piece found by the creek is a large part of this lens.
export const REFLECTOR={r:.049,color:0x8a1a14};
export function mergeParts(parts){let n=0;const list=parts.map(({geo,color,matrix})=>{const g=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(matrix||new THREE.Matrix4());if(!g.attributes.normal)g.computeVertexNormals();n+=g.attributes.position.count;return {g,color};});
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
 for(const {g,color} of list){_c.set(color);const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++,o++){pos[o*3]=P.getX(i);pos[o*3+1]=P.getY(i);pos[o*3+2]=P.getZ(i);nor[o*3]=N.getX(i);nor[o*3+1]=N.getY(i);nor[o*3+2]=N.getZ(i);col[o*3]=_c.r;col[o*3+1]=_c.g;col[o*3+2]=_c.b;}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeBoundingSphere();return g;}
const M4=(x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));

// People ---------------------------------------------------------------------------
// Normalize either a cast entry or the old flat options into one description.
function describe(s={}){
 if(s.face||s.clothes)return {scale:s.scale??1,firstPerson:!!s.firstPerson,face:s.face||{},hair:s.hair||{style:'cropped',color:0x4a3528},build:s.build||{},clothes:s.clothes||{}};
 const hair=s.cap!=null?{style:'cap',color:s.hair??0x4a3528,cap:s.cap}:{style:s.longHair?(s.scale>1.05?'ponytail':'shaggy'):'cropped',color:s.hair??0x4a3528};
 return {scale:s.scale??1,firstPerson:!!s.firstPerson,face:{skin:s.skin??0xd6a57f},hair,build:{},clothes:{shirt:s.shirt??0x7a8fa6,trim:s.stripe??null,shorts:s.shorts??0x4e5566,pants:s.pants||null,shoes:s.shoes??0xe6e0d0,socks:s.pants||0xf0ece2,sleeves:s.sleeves?'long':'short'}};
}
// A head with a softened jaw, ears, eyes, brows, nose and mouth, and hair or a cap:
// one merged, vertex-colored geometry in head-local meters (face toward -z).
const headCache=new Map();
export function headGeometry(face={},hair={},size=1){
 const key=JSON.stringify([face,hair,size]);if(headCache.has(key))return headCache.get(key);
 const F={jaw:.92,cheek:1,eyeGap:.036,eyeY:.012,browTilt:0,nose:'button',mouth:'flat',ears:1,skin:0xd6a57f,lips:0xb87a62,iris:0x3a2a1c,...face},H={style:'cropped',color:0x4a3528,...hair};
 const skull=sphereGeo(3),p=skull.attributes.position,nrm=skull.attributes.normal;
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const low=smooth(-y*1.4),jx=1-(1-F.jaw)*low,jz=1-.12*low;x*=jx;z*=jz;
  if(y<.1&&y>-.6&&z<0)x*=1+(F.cheek-1)*.6*(1-Math.abs(y+.25)*2.5);if(y<-.7&&z<-.2)z-=.04;// chin
  p.setXYZ(i,x*.1,y*.112,z*.104);const nx=x/.1/jx,ny=y/.112,nz=z/.104/jz,l=Math.hypot(nx,ny,nz)||1;nrm.setXYZ(i,nx/l,ny/l,nz/l);}
 const parts=[{geo:skull,color:F.skin}],sph=sphereGeo(1),box=new THREE.BoxGeometry(1,1,1),S=(x,y,z,sx,sy,sz,c,rx=0,ry=0,rz=0,g=sph)=>parts.push({geo:g,color:c,matrix:M4(x,y,z,sx,sy,sz,rx,ry,rz)});
 for(const s of [-1,1]){S(s*.096,-.006,.006,.009*F.ears,.026*F.ears,.018*F.ears,F.skin,0,s*.2,0);// ears
  S(s*F.eyeGap,F.eyeY,-.088,.017,.012,.009,0xf1ede4);S(s*F.eyeGap,F.eyeY-.001,-.095,.0085,.0095,.005,F.iris);S(s*F.eyeGap+.002,F.eyeY+.003,-.0985,.0022,.0022,.002,0xffffff);// eyes
  S(s*(F.eyeGap+.002),F.eyeY+.026,-.093,.032,.007,.009,H.color,0,s*-.12,s*-F.browTilt,box);}// brows
 if(F.nose==='straight')S(0,-.016,-.1,.011,.02,.014,F.skin,-.25);else if(F.nose==='broad')S(0,-.02,-.101,.018,.017,.016,F.skin);else S(0,-.017,-.102,.013,.016,.015,F.skin);
 if(F.mouth==='flat')S(0,-.05,-.092,.024,.0055,.008,F.lips,0,0,0,box);
 else{const w=F.mouth==='grin'?.03:.024;S(0,-.051,-.091,w,.006,.008,F.lips,0,0,0,box);for(const s of [-1,1])S(s*w*.55,-.047,-.09,.012,.005,.007,F.lips,0,0,s*.45,box);if(F.mouth==='grin')S(0,-.0485,-.092,w*.8,.004,.006,0xf4f0e6,0,0,0,box);}
 // Hair: a cap shell plus a style-specific shape.
 const c=H.color;
 if(H.style==='cap'){S(0,.052,.006,.113,.068,.116,H.cap);S(0,.036,-.118,.078,.008,.055,H.cap,.12,0,0,box);S(0,.12,.006,.012,.008,.012,H.cap);
  for(const s of [-1,1])S(s*.085,.0,.03,.025,.045,.05,c);S(0,-.005,.075,.08,.06,.045,c);}
 else if(H.style==='messy'){S(0,.035,.008,.108,.09,.112,c);const tufts=[[.02,.105,-.02],[-.03,.1,.01],[.05,.09,.04],[-.06,.085,-.03],[0,.1,.05],[.04,.08,-.07],[-.02,.075,-.085],[.07,.06,-.04]];for(const [x,y,z] of tufts)S(x,y,z,.03,.024,.03,c,x*6,0,z*5);}
 else if(H.style==='swept'){S(0,.036,.01,.108,.09,.113,c);S(.018,.08,-.07,.078,.03,.045,c,.2,0,.32);S(-.05,.07,-.06,.03,.025,.035,c,0,0,.4);for(const s of [-1,1])S(s*.09,.02,.02,.022,.05,.06,c);}
 else if(H.style==='shaggy'){S(0,.036,.012,.111,.092,.116,c);S(0,-.018,.066,.092,.065,.05,c);for(const x of [-.04,0,.04])S(x,.066,-.088,.03,.024,.018,c,.35,0,x*4);for(const s of [-1,1])S(s*.093,.004,.018,.022,.05,.06,c);}
 else if(H.style==='ponytail'){S(0,.04,.012,.11,.09,.115,c);S(0,.0,.1,.035,.03,.04,c);S(0,-.08,.125,.04,.1,.04,c,.25);for(const s of [-1,1])S(s*.09,.0,.02,.02,.055,.065,c);}
 else{S(0,.042,.012,.105,.083,.11,c);}// cropped
 if(H.style!=='cap')for(let i=0;i<9;i++){
  const a=i*2.39996+(H.style==='swept'?.6:0),r=.038+(i%3)*.019;
  const shade=new THREE.Color(c).multiplyScalar(.9+(i%4)*.05).getHex();
  S(Math.cos(a)*r,.085+(i%3)*.008,Math.sin(a)*r,.022,.018,.044,shade,.20+Math.sin(a)*.2,a,.18,ball);
 }
 const g=mergeParts(parts.map(q=>({...q,matrix:(q.matrix||new THREE.Matrix4()).premultiply(new THREE.Matrix4().makeScale(size,size,size))})));headCache.set(key,g);return g;
}
function shoeGeometry(upper,sole){const parts=[{geo:new THREE.CapsuleGeometry(.044,.13,3,8),color:upper,matrix:M4(0,.006,0,1.05,1,.86,Math.PI/2)},{geo:roundedBoxGeometry(.084,.024,.215,.01),color:sole,matrix:M4(0,-.03,0)},{geo:new THREE.BoxGeometry(.028,.01,.075),color:sole,matrix:M4(0,.043,-.035)}];for(let i=0;i<3;i++)parts.push({geo:roundedBoxGeometry(.035,.006,.006,.002),color:sole,matrix:M4(0,.048,-.055+i*.018)});return mergeParts(parts);}
// A loose fist: palm and curled fingers along local y, thumb on the inside.
const HAND_CURL=-.9;
function handGeometry(skin,bulk){const parts=[{geo:roundedBoxGeometry(.064*bulk,.05,.042,.018),color:skin,matrix:M4(0,.02,0)},{geo:roundedBoxGeometry(.06*bulk,.04,.034,.015),color:skin,matrix:M4(0,.05,.012,1,1,1,.7)},{geo:new THREE.CapsuleGeometry(.012,.028,2,6),color:skin,matrix:M4(-.03,.03,-.014,1,1,1,.3,0,.5)}];
 for(let i=0;i<4;i++)parts.push({geo:new THREE.CapsuleGeometry(.007,.019,3,8),color:skin,matrix:M4((i-1.5)*.014,.049,.028,1,1,1,.55)});return mergeParts(parts);}
function torsoGeometry(c,b){const parts=[{geo:new THREE.CapsuleGeometry(.105*(b.bulk??1),.25,3,10),color:c.shirt,matrix:M4(0,0,0,1.22*(b.shoulders??1),1,.8*(b.bulk??1))}];
 if(c.trim!=null&&!c.collar)parts.push({geo:new THREE.TorusGeometry(.05,.008,4,16),color:c.trim,matrix:M4(0,.206,-.004,1.2,1,.55,Math.PI/2)});
 if(c.collar)for(const s of [-1,1])parts.push({geo:roundedBoxGeometry(.05,.012,.045,.005),color:c.trim??c.shirt,matrix:M4(s*.03,.212,-.045,1,1,1,-.5,s*.5,s*.25)});
 for(const s of [-1,1])parts.push({geo:ball,color:c.shirt,matrix:M4(s*.12,.16,0,.055,.047,.057)});
 const seam=new THREE.Color(c.shirt).multiplyScalar(.85).getHex();
 parts.push({geo:new THREE.TorusGeometry(.096,.003,3,20),color:seam,matrix:M4(0,-.13,0,1.27,1,.8,Math.PI/2)});
 for(const s of [-1,1])parts.push({geo:new THREE.CapsuleGeometry(.004,.09,2,5),color:seam,matrix:M4(s*.11,-.035,-.035,1,1,1,0,0,s*.12)});
 return mergeParts(parts);}
export function createPerson(spec={}){
 const d=describe(spec),{face,hair,build,clothes:c}=d,bulk=build.bulk??1,group=new THREE.Group(),B=BODY,parts={};group.scale.setScalar(d.scale);
 const lower=c.pants||c.shorts||0x4e5566,skin=face.skin??0xd6a57f;
 parts.pelvis=mesh(group,capsule(.085*bulk,.1),lower);parts.pelvis.scale.set(1,1,.82);
 parts.torso=mesh(group,torsoGeometry(c,build),vcMat);
 parts.neck=mesh(group,capsule(.036*bulk,.05),skin,false);parts.head=mesh(group,headGeometry(face,hair,build.head??1),vcMat);
 const lids=[];
 if(!d.firstPerson)for(const side of [-1,1]){const lid=new THREE.Mesh(ball,material(skin));const size=build.head??1;lid.position.set(side*(face.eyeGap??.036)*size,(face.eyeY??.012)*size,-.100*size);lid.scale.set(.018*size,.013*size,.005*size);lid.visible=false;parts.head.add(lid);lids.push(lid);}
 // In first person the head is only a shadow: the camera sits inside it (layer 1 is drawn by the sun only).
 if(d.firstPerson){parts.head.layers.set(1);parts.neck.layers.set(1);parts.neck.castShadow=true;}
 const shoe=shoeGeometry(c.shoes??0xe6e0d0,c.sole??0xf2efe6),hand=handGeometry(skin,bulk);
 for(const s of ['l','r']){
  parts[s+'sleeve']=mesh(group,capsule(.043*bulk,c.sleeves==='long'?.2:.085),c.shirt);
  parts[s+'upper']=mesh(group,capsule(.036*bulk,B.upper),skin);
  parts[s+'fore']=mesh(group,capsule(.031*bulk,B.fore),c.sleeves==='long'?c.shirt:skin);
  parts[s+'hand']=mesh(group,hand,vcMat,false);
  parts[s+'thigh']=mesh(group,capsule(.063*bulk,B.thigh),lower);
  parts[s+'shin']=mesh(group,capsule(.044*bulk,B.shin),c.pants||skin);
  parts[s+'sock']=mesh(group,capsule(.047*bulk,.03),c.socks??0xf0ece2,false);
  parts[s+'shoe']=mesh(group,shoe,vcMat);
 }
 const person={group,parts,lids,pose:newPose(),scale:d.scale,firstPerson:d.firstPerson,joints:{},build};
 applyPose(person,person.pose);return person;
}
export function blinkPerson(person,time,seed=0){
 const phase=(time+seed*1.37)%(3.7+seed*.43),close=phase<.14?Math.sin(phase/.14*Math.PI):0;
 for(const lid of person.lids){lid.visible=close>.08;lid.scale.y=.014*(person.build.head??1)*close;}
}
const _v=[...Array(12)].map(()=>new THREE.Vector3()),_q=[...Array(7)].map(()=>new THREE.Quaternion()),_e=new THREE.Euler(),UP=new THREE.Vector3(0,1,0);
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
export function headQuat(p,q){return q.setFromEuler(_e.set(p[P.hp],p[P.yaw]+p[P.twist]+p[P.hy],-p[P.roll]*.3,'YXZ'));}
export function headPos(p,out){const q=spineQuat(p,_q[5]);out.set(0,BODY.torso,0).applyQuaternion(q).add(_v[8].set(p[0],p[1],p[2]));headQuat(p,_q[4]);return out.add(_v[7].set(0,BODY.neck*.6+BODY.head,-.012).applyQuaternion(_q[4]));}
// Pose the meshes from the pose array. Joint positions are kept for gameplay use.
export function applyPose(person,p){
 const B=BODY,pr=person.parts,J=person.joints,root=_v[0].set(p[0],p[1],p[2]);
 const qp=_q[0].setFromEuler(_e.set(0,p[P.yaw],0)),qs=spineQuat(p,_q[1]),qh=headQuat(p,_q[2]);
 pr.pelvis.position.copy(root);pr.pelvis.quaternion.copy(qp).multiply(_q[3].setFromAxisAngle(_v[1].set(0,0,1),Math.PI/2));
 pr.torso.position.set(0,.23,0).applyQuaternion(qs).add(root);pr.torso.quaternion.copy(qs);
 const neck=_v[2].set(0,B.torso,0).applyQuaternion(qs).add(root);
 const head=_v[3].set(0,B.neck*.6+B.head,-.012).applyQuaternion(qh).add(neck);
 if(pr.neck){pr.neck.position.set(0,.035,0).applyQuaternion(qs).add(neck);pr.neck.quaternion.copy(qs);pr.head.position.copy(head);pr.head.quaternion.copy(qh);}
 (J.head||(J.head=new THREE.Vector3())).copy(head);(J.headQ||(J.headQ=new THREE.Quaternion())).copy(qh);
 for(const [s,side] of [['l',-1],['r',1]]){
  const sh=_v[4].set(side*B.shoulder,B.torso-.045,.01).applyQuaternion(qs).add(root);
  const hand=_v[5].fromArray(p,s==='l'?P.lh:P.rh),pole=_v[6].fromArray(p,s==='l'?P.le:P.re),elbow=_v[1],wrist=_v[7];
  solveIK(sh,hand,B.upper,B.fore,pole,elbow,wrist);
  placeAlong(pr[s+'sleeve'],sh,elbow,-.01,pr[s+'sleeve'].geometry.parameters.length+.02);place(pr[s+'upper'],sh,elbow);place(pr[s+'fore'],elbow,wrist);
  // The hand continues the forearm, palm turned in toward the grip.
  // The hand continues the forearm with the fingers curled down, as around a grip or at rest.
  _v[11].subVectors(wrist,elbow).normalize();pr[s+'hand'].position.copy(wrist).addScaledVector(_v[11],.012);pr[s+'hand'].quaternion.copy(pr[s+'fore'].quaternion).multiply(_q[6].setFromAxisAngle(_v[10].set(1,0,0),HAND_CURL));
  if(side<0)pr[s+'hand'].scale.set(-1,1,1);(J[s+'wrist']||(J[s+'wrist']=new THREE.Vector3())).copy(wrist);(J[s+'elbow']||(J[s+'elbow']=new THREE.Vector3())).copy(elbow);
  const hip=_v[4].set(side*B.hip,-.03,0).applyQuaternion(qp).add(root);
  const foot=_v[5].fromArray(p,s==='l'?P.lf:P.rf),kpole=_v[6].fromArray(p,s==='l'?P.lk:P.rk),knee=_v[1],ankle=_v[7];
  solveIK(hip,foot,B.thigh,B.shin,kpole,knee,ankle);
  place(pr[s+'thigh'],hip,knee);place(pr[s+'shin'],knee,ankle);placeAlong(pr[s+'sock'],ankle,knee,.02,.03);
  const shoe=pr[s+'shoe'];shoe.quaternion.setFromEuler(_e.set(p[s==='l'?P.lfp:P.rfp],p[P.yaw]+side*.08,0,'YXZ'));
  shoe.position.set(0,-B.ankle*.45,-.055).applyQuaternion(shoe.quaternion).add(ankle);
  (J[s+'ankle']||(J[s+'ankle']=new THREE.Vector3())).copy(ankle);(J[s+'knee']||(J[s+'knee']=new THREE.Vector3())).copy(knee);
 }
}

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
const V=(...a)=>new THREE.Vector3(...a);
const toSteer=(G,x,y,z)=>V(x,y,z).sub(G.pivotV).applyQuaternion(G.rakeInv);
function tube(parts,a,b,r,color,sides=10){const A=a.isVector3?a:V(...a),Bv=b.isVector3?b:V(...b),len=A.distanceTo(Bv);const m=new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(UP,Bv.clone().sub(A).normalize()),V(1,1,1));parts.push({geo:new THREE.CylinderGeometry(r,r,len,sides,1),color,matrix:m});}
function wheelGeometry(G,tire,knobby){const R=G.wheelR,parts=[{geo:new THREE.TorusGeometry(R-.025,knobby?.032:.026,6,28),color:tire,matrix:M4(0,0,0,1,1,1,0,Math.PI/2)},{geo:new THREE.TorusGeometry(R-.05,.009,4,28),color:0xb8bbb4,matrix:M4(0,0,0,1,1,1,0,Math.PI/2)},{geo:new THREE.CylinderGeometry(.022,.022,.1,8),color:0x9fa39c,matrix:M4(0,0,0,1,1,1,0,0,Math.PI/2)}];
 if(knobby)for(let k=0;k<18;k++){const a=k/18*Math.PI*2;parts.push({geo:new THREE.BoxGeometry(.05,.018,.03),color:tire,matrix:M4(0,Math.sin(a)*(R-.0),Math.cos(a)*(R-.0),1,1,1,a)});}
 return mergeParts(parts);}
function spokes(G){const pts=[];for(let k=0;k<18;k++){const a=k/18*Math.PI*2,side=k%2?.035:-.035;pts.push(side,0,0,0,Math.sin(a)*(G.wheelR-.055),Math.cos(a)*(G.wheelR-.055));}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xc9cbc2}));}
// spec: a cast bike entry ({style, frame, bars, wheelR, saddle, grips, tire, extras}) or a frame color.
export function createBike(spec,{grips=0x2b2b2d}={}){
 const S=typeof spec==='object'&&spec!==null?spec:{frame:spec,grips},G=bikeGeometry(S.style||'road-kid',S.wheelR),color=S.frame??0x5f8f93,extras=S.extras||[];
 const group=new THREE.Group(),frame=new THREE.Group();group.add(frame);const fp=[],sp=[];
 const bb=V(...G.bb),seat=V(0,G.saddle[1]-.15,G.saddle[2]-.04),head=V(0,G.pivot[1]+.16,G.pivot[2]+.045),low=V(0,G.pivot[1]+.01,G.pivot[2]+.005),rear=V(0,G.wheelR,G.rear);
 // Frame shapes: standard diamond, a low BMX frame, a sloping mountain frame, a curved cruiser.
 if(G.style==='cruiser'){const bend=V(0,seat.y-.08,(seat.z+head.z)/2+.05);tube(fp,seat,bend,.022,color);tube(fp,bend,head,.022,color);tube(fp,bb,low,.028,color);tube(fp,V(0,bb.y+.12,bb.z-.05),V(0,low.y-.05,low.z+.12),.018,color);}
 else if(G.style==='bmx'){tube(fp,V(0,seat.y-.06,seat.z),V(0,head.y-.02,head.z),.024,color);tube(fp,bb,low,.028,color);tube(fp,V(0,seat.y-.12,seat.z-.05),V(0,head.y-.12,head.z+.05),.012,color);}
 else if(G.style==='mtb'){tube(fp,seat,V(0,head.y+.02,head.z),.026,color);tube(fp,bb,low,.034,color);}
 else{tube(fp,seat,head,.024,color);tube(fp,bb,low,.028,color);}
 tube(fp,bb,seat,.024,color);tube(fp,low,V(0,head.y+.03,head.z+.005),.032,color);
 for(const s of [-1,1]){tube(fp,bb,V(s*.05,rear.y,rear.z),.013,color);tube(fp,seat.clone().add(V(s*.012,-.02,.01)),V(s*.05,rear.y,rear.z),.012,color);}
 tube(fp,seat,V(0,G.saddle[1]-.01,G.saddle[2]-.01),.014,0x9da09a);
 fp.push({geo:roundedBoxGeometry(.11,.045,.25,.02),color:S.saddle??0x262626,matrix:M4(0,G.saddle[1]+.005,G.saddle[2]+.005)},{geo:roundedBoxGeometry(.06,.035,.09,.015),color:S.saddle??0x262626,matrix:M4(0,G.saddle[1],G.saddle[2]-.12)});
 fp.push({geo:new THREE.BoxGeometry(.05,.03,.012),color:0xb2352c,matrix:M4(0,G.saddle[1]-.08,G.saddle[2]+.13)});
 fp.push({geo:new THREE.CylinderGeometry(.04,.04,.012,10),color:0x77796f,matrix:M4(.055,rear.y,rear.z,1,1,1,0,0,Math.PI/2)});
 fp.push({geo:new THREE.BoxGeometry(.012,.05,.18),color:0x55575a,matrix:M4(.07,bb.y+.06,(bb.z+rear.z)/2)});// chain guard
 if(extras.includes('pegs'))for(const s of [-1,1])fp.push({geo:new THREE.CylinderGeometry(.018,.018,.1,8),color:0x9da09a,matrix:M4(s*.09,rear.y,rear.z,1,1,1,0,0,Math.PI/2)});
 if(extras.includes('bottle')){const a=V(0,bb.y+.12,bb.z-.09),b=V(0,low.y-.08,low.z+.14);tube(fp,a,b,.028,0x3a86c8,10);}
 if(extras.includes('rack')){for(const s of [-1,1])tube(fp,V(s*.07,rear.y+.04,rear.z),V(s*.07,seat.y+.05,seat.z+.22),.008,0x9da09a);fp.push({geo:new THREE.BoxGeometry(.14,.012,.3),color:0x9da09a,matrix:M4(0,seat.y+.06,seat.z+.3)});}
 // A round red reflector on the back of the rack, its cracked bracket held on with black tape. Its
 // size and red are the piece found at the creek (chapter1.js), so the two can be matched up.
 // The same mount after the lens has broken away (Chapter Two): the bracket bent down a little,
 // the black tape still round it, a jagged red sliver of the lens left in the clip.
 if(extras.includes('rear-reflector-broken')){const z=seat.z+.455,y=seat.y+.015,bent=M4(0,y+.035,z-.012,1,1,1,.32);
  fp.push({geo:new THREE.BoxGeometry(.03,.05,.012),color:0x9da09a,matrix:bent},{geo:new THREE.BoxGeometry(.036,.018,.02),color:0x161617,matrix:M4(0,y+.047,z-.006,1,1,1,.32)},
   {geo:new THREE.CylinderGeometry(REFLECTOR.r,REFLECTOR.r,.012,14,1,false,.4,1.05),color:REFLECTOR.color,matrix:M4(0,y+.006,z-.004,1,1,1,Math.PI/2+.32)},
   {geo:new THREE.BoxGeometry(.006,.012,.006),color:0x9da09a,matrix:M4(.009,y+.017,z-.008)});}
 if(extras.includes('rear-reflector')){const z=seat.z+.455,y=seat.y+.015;fp.push({geo:new THREE.CylinderGeometry(REFLECTOR.r,REFLECTOR.r,.012,14),color:REFLECTOR.color,matrix:M4(0,y,z,1,1,1,Math.PI/2)},{geo:new THREE.BoxGeometry(.03,.05,.012),color:0x9da09a,matrix:M4(0,y+.035,z-.012)},{geo:new THREE.BoxGeometry(.036,.018,.02),color:0x161617,matrix:M4(0,y+.047,z-.01)});}
 const frameMesh=new THREE.Mesh(mergeParts(fp),vcMetal);frameMesh.castShadow=true;frame.add(frameMesh);
 const chainPts=[.06,bb.y+.085,bb.z,.06,rear.y+.04,rear.z,.06,bb.y-.085,bb.z,.06,rear.y-.04,rear.z],cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(chainPts,3));frame.add(new THREE.LineSegments(cg,new THREE.LineBasicMaterial({color:0x444440})));
 const tire=S.tire??0x2f3133,knobby=extras.includes('knobby');
 const rearWheel=new THREE.Group();rearWheel.position.copy(rear);frame.add(rearWheel);const rw=new THREE.Mesh(wheelGeometry(G,tire,knobby),vcMat);rw.castShadow=true;rearWheel.add(rw,spokes(G));
 // Steering assembly, rotating about the raked head tube.
 const steerPivot=new THREE.Group();steerPivot.position.copy(G.pivotV);steerPivot.quaternion.copy(G.rakeQ);frame.add(steerPivot);const steer=new THREE.Group();steerPivot.add(steer);
 const axle=toSteer(G,0,G.wheelR,G.front),gr=G.grip,fork=G.style==='mtb'?.018:.013;
 for(const s of [-1,1])tube(sp,toSteer(G,s*.03,G.pivot[1]-.03,G.pivot[2]+.005),axle.clone().add(V(s*.048,0,0)),fork,color);
 tube(sp,toSteer(G,0,G.pivot[1]-.03,G.pivot[2]+.005),toSteer(G,0,G.pivot[1]+.03,G.pivot[2]+.01),.026,color);
 const stemTop=toSteer(G,0,gr[1]-.02,gr[2]+.005);tube(sp,toSteer(G,0,G.pivot[1]+.17,G.pivot[2]+.05),stemTop,.017,0x6c6e69);
 const barC=0x9da09a;
 if(S.bars==='swept'){for(const s of [-1,1]){tube(sp,stemTop,toSteer(G,s*.12,gr[1],gr[2]-.04),.012,barC);tube(sp,toSteer(G,s*.12,gr[1],gr[2]-.04),toSteer(G,s*(gr[0]-.05),gr[1],gr[2]+.02),.012,barC);}}
 else if(S.bars==='bmx'||S.bars==='riser'){const rise=S.bars==='bmx'?.07:.035;for(const s of [-1,1]){tube(sp,stemTop,toSteer(G,s*.09,gr[1]-rise,gr[2]),.012,barC);tube(sp,toSteer(G,s*.09,gr[1]-rise,gr[2]),toSteer(G,s*.15,gr[1],gr[2]),.012,barC);tube(sp,toSteer(G,s*.15,gr[1],gr[2]),toSteer(G,s*(gr[0]-.05),gr[1],gr[2]),.012,barC);}
  if(S.bars==='bmx'){tube(sp,toSteer(G,-.13,gr[1]-.02,gr[2]),toSteer(G,.13,gr[1]-.02,gr[2]),.01,barC);if(extras.includes('pad'))tube(sp,toSteer(G,-.1,gr[1]-.02,gr[2]),toSteer(G,.1,gr[1]-.02,gr[2]),.024,0x2d4a7a,10);}}
 else tube(sp,toSteer(G,-(gr[0]-.05),gr[1],gr[2]),toSteer(G,gr[0]-.05,gr[1],gr[2]),.012,barC);
 for(const s of [-1,1])tube(sp,toSteer(G,s*(gr[0]-.07),gr[1],gr[2]),toSteer(G,s*(gr[0]+.045),gr[1],gr[2]),.019,S.grips??grips,8);
 if(extras.includes('bell')||!S.style)sp.push({geo:ball,color:0xc8c6bc,matrix:new THREE.Matrix4().compose(toSteer(G,-.15,gr[1]+.025,gr[2]),new THREE.Quaternion(),V(.026,.018,.026))});
 if(extras.includes('reflector'))sp.push({geo:new THREE.BoxGeometry(.05,.07,.012),color:0xe8e4d8,matrix:new THREE.Matrix4().setPosition(toSteer(G,0,G.pivot[1]+.12,G.pivot[2]-.06))});
 // Brake levers and curved cable housings follow the steering assembly.
 for(const s of [-1,1]){
  tube(sp,toSteer(G,s*(gr[0]-.085),gr[1],gr[2]),toSteer(G,s*(gr[0]-.025),gr[1]-.023,gr[2]-.055),.007,0x777c7d,8);
  tube(sp,toSteer(G,s*(gr[0]-.085),gr[1],gr[2]),toSteer(G,s*(gr[0]-.10),gr[1]-.01,gr[2]-.04),.008,0x303437,6);
  const curve=new THREE.QuadraticBezierCurve3(toSteer(G,s*(gr[0]-.10),gr[1]-.01,gr[2]-.04),toSteer(G,s*.13,gr[1]-.18,gr[2]-.24),toSteer(G,s*.03,G.wheelR+.12,G.front+.04));
  sp.push({geo:new THREE.TubeGeometry(curve,10,.003,4,false),color:0x303437});
 }
 const steerMesh=new THREE.Mesh(mergeParts(sp),vcMetal);steerMesh.castShadow=true;steer.add(steerMesh);
 const frontWheel=new THREE.Group();frontWheel.position.copy(axle);steer.add(frontWheel);const fw=new THREE.Mesh(wheelGeometry(G,tire,knobby),vcMat);fw.castShadow=true;frontWheel.add(fw,spokes(G));
 const bell={position:toSteer(G,-.15,gr[1]+.025,gr[2])};
 bell.lever=new THREE.Mesh(roundedBoxGeometry(.026,.013,.036,.005),material(0x35393b,{roughness:.4,metalness:.45}));
 bell.lever.position.copy(bell.position).add(V(-.022,-.008,.012));bell.lever.name='bell-lever';steer.add(bell.lever);
 // Cranks turn; pedals stay level.
 const crank=new THREE.Group();crank.position.copy(bb);frame.add(crank);
 const cp=[{geo:new THREE.TorusGeometry(.085,.008,4,20),color:0x8e908a,matrix:M4(.055,0,0,1,1,1,0,Math.PI/2)}];for(const s of [-1,1])cp.push({geo:new THREE.BoxGeometry(.016,G.crank,.024),color:0x55575a,matrix:M4(s*.075,s*G.crank/2,0)});
 const crankMesh=new THREE.Mesh(mergeParts(cp),vcMetal);crankMesh.castShadow=false;crank.add(crankMesh);
 const pedalGeo=mergeParts([{geo:new THREE.BoxGeometry(.085,.022,.06),color:0x3b3d3e},{geo:new THREE.BoxGeometry(.086,.012,.012),color:0xd89a3a,matrix:M4(0,0,.031)}]);
 const pedals=[-1,1].map(()=>{const pd=new THREE.Mesh(pedalGeo,vcMat);pd.castShadow=true;frame.add(pd);return pd;});
 const kickPivot=new THREE.Group();kickPivot.position.set(-.05,G.bb[1]-.02,G.bb[2]+.1);frame.add(kickPivot);const kick=mesh(kickPivot,new THREE.CylinderGeometry(.011,.009,.3,5),0x77797a,false);kick.position.y=-.15;
 const bike={group,frame,steer,frontWheel,rearWheel,crank,pedals,kickPivot,color,geom:G,spec:S,bell,wheel:0,crankAngle:0,steerAngle:0,kickstand:0};
 poseBike(bike);return bike;
}
export function pedalPos(crank,side,out=new THREE.Vector3(),G=DEFAULT_G){const a=crank+(side<0?Math.PI:0);return out.set(side*G.pedalX,G.bb[1]+Math.cos(a)*G.crank,G.bb[2]-Math.sin(a)*G.crank);}
export function gripPos(steerAngle,side,out=new THREE.Vector3(),G=DEFAULT_G){const g=G.grip;out.set(side*g[0],g[1],g[2]).sub(G.pivotV).applyQuaternion(G.rakeInv).applyAxisAngle(UP,steerAngle).applyQuaternion(G.rakeQ).add(G.pivotV);return out;}
export function poseBike(bike){const G=bike.geom||DEFAULT_G;
 bike.frontWheel.rotation.x=bike.rearWheel.rotation.x=-bike.wheel;bike.crank.rotation.x=-bike.crankAngle;bike.steer.rotation.y=bike.steerAngle;
 pedalPos(bike.crankAngle,-1,bike.pedals[0].position,G);pedalPos(bike.crankAngle,1,bike.pedals[1].position,G);
 // Stowed along the chainstay, deployed down and out to meet the ground.
 const k=bike.kickstand;bike.kickPivot.rotation.set(-1.2*(1-k)-.25*k,0,-.32*k);
}
// Rider on a bicycle: seated, standing on the pedals, or stopped astride the frame.
// posture tips the torso forward (+) or upright (-); geom is the rider's own bike.
const _p=new THREE.Vector3();
export function ridePose(p,crank,{stand=0,astride=0,steer=0,look=0,lookPitch=0,rock=0,geom=DEFAULT_G,posture=0,shoulder=0,stopSide=0}={}){
 const G=geom,lean=.62+posture+.12*stand-.40*astride+Math.abs(steer)*.1*(1-astride);
 set3(p,P.root,rock*.02+stopSide*.025*astride,G.saddle[1]+.045+.1*stand-.20*astride,G.saddle[2]-.17*stand-.13*astride);p[P.yaw]=0;p[P.lean]=lean;p[P.roll]=-rock*.2;p[P.twist]=steer*.95*(1-astride)+shoulder;p[P.hy]=look;p[P.hp]=lookPitch;
 for(const [o,side,po] of [[P.lf,-1,P.lfp],[P.rf,1,P.rfp]]){
  pedalPos(crank,side,_p,G);const a=crank+(side<0?Math.PI:0);
  const px=side*(G.pedalX+.035),py=_p.y+.062,pz=_p.z+.05,gx=side*.23,gy=BODY.ankle,gz=.06;
  const plant=astride*(stopSide===0||side===stopSide?1:0);
  set3(p,o,px+(gx-px)*plant,py+(gy-py)*plant,pz+(gz-pz)*plant);p[po]=(.12*Math.sin(a)-.05)*(1-plant);
 }
 gripPos(steer,-1,_p,G);set3(p,P.lh,_p.x+.01,_p.y+.02,_p.z+.02);gripPos(steer,1,_p,G);set3(p,P.rh,_p.x-.01,_p.y+.02,_p.z+.02);
 set3(p,P.lk,-.12,0,-1);set3(p,P.rk,.12,0,-1);set3(p,P.le,-.7,-.3,.6);set3(p,P.re,.7,-.3,.6);return p;
}
// Keyframed dismount from astride: the right leg swings back over the saddle.
export function dismountKeys(G=DEFAULT_G){
 const k0=ridePose(newPose(),0,{astride:1,geom:G});
 const k1=copyPose(newPose(),k0);set3(k1,P.root,-.07,.8,.1);k1[P.lean]=.3;set3(k1,P.rf,.24,.3,.32);k1[P.rfp]=-.3;set3(k1,P.rk,.3,0,-1);
 const k2=copyPose(newPose(),k1);set3(k2,P.root,-.22,.8,.13);k2[P.yaw]=-.45;k2[P.lean]=.42;set3(k2,P.rf,.02,.72,.58);set3(k2,P.lf,-.24,BODY.ankle,.07);set3(k2,P.rk,.4,.6,.4);
 const k3=copyPose(newPose(),k2);set3(k3,P.root,-.36,.8,.08);k3[P.yaw]=-.25;k3[P.lean]=.22;set3(k3,P.rf,-.5,.24,.22);set3(k3,P.rk,-.2,0,-1);
 const k4=copyPose(newPose(),k3);set3(k4,P.root,-.43,BODY.stand,-.08);k4[P.yaw]=0;k4[P.lean]=.1;set3(k4,P.rf,-.33,BODY.ankle,-.02);set3(k4,P.lf,-.54,BODY.ankle,-.1);k4[P.rfp]=0;set3(k4,P.lk,-.05,0,-1);set3(k4,P.rk,.05,0,-1);
 gripPos(0,-1,_p,G);set3(k4,P.lh,_p.x+.01,_p.y+.02,_p.z+.02);set3(k4,P.rh,-.02,G.saddle[1]+.04,G.saddle[2]);set3(k4,P.re,.4,-.4,.4);
 set3(k3,P.rh,.1,G.saddle[1]+.06,.05);
 return [[0,k0],[.3,k1],[.62,k2],[.95,k3],[1.3,k4]];
}
// Walking a bike: the bike is on the person's right; left hand on the left grip, right on the saddle.
export const PUSH_OFFSET={x:.43,z:.12};
export function pushPose(p,phase,speed,opts={}){const G=opts.geom||DEFAULT_G;walkPose(p,phase,speed,opts);p[P.twist]*=.3;p[P.yaw]*=.4;p[P.lean]+=.06;
 gripPos(0,-1,_p,G);set3(p,P.lh,_p.x+PUSH_OFFSET.x+.01,_p.y+.02,_p.z+PUSH_OFFSET.z+.02);set3(p,P.rh,PUSH_OFFSET.x-.01,G.saddle[1]+.03,.09+PUSH_OFFSET.z);set3(p,P.le,-.5,-.3,.6);set3(p,P.re,.4,-.4,.4);return p;}
