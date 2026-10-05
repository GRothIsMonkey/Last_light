// Police cars for the night chapter: an ordinary white patrol sedan with a navy stripe, POLICE on
// the front doors, a push bar and a lightbar. Reusable: any number of cars, each driven along a
// world-space path or parked. Emergency lighting is shared: two point lights (red and blue, pooled
// to the nearest flashing cars) and one spot light for headlights, created once and switched by
// intensity so the shaders never change while you play. Static parts are merged per material so a
// car costs about a dozen draw calls.
import * as THREE from './three.module.js';
import {worldPath,wrap} from './people.js';
import {patrolBody} from './patrol-art.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
function glowTexture(size=64){const data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x+.5)/size*2-1,dy=(y+.5)/size*2-1,r=Math.sqrt(dx*dx+dy*dy),a=Math.max(0,1-r)**2.2;const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=a*255|0;}const t=new THREE.DataTexture(data,size,size);t.needsUpdate=true;return t;}
// "POLICE" in a plain block face, generated here (no fonts, no canvas).
function letteringTexture(){const G={P:['11110','10001','10001','11110','10000','10000','10000'],O:['01110','10001','10001','10001','10001','10001','01110'],L:['10000','10000','10000','10000','10000','10000','11111'],
  I:['11111','00100','00100','00100','00100','00100','11111'],C:['01111','10000','10000','10000','10000','10000','01111'],E:['11111','10000','10000','11110','10000','10000','11111']};
 const word='POLICE',S=4,w=(word.length*6+1)*S,h=9*S,data=new Uint8Array(w*h*4);
 [...word].forEach((ch,k)=>G[ch].forEach((row,ry)=>[...row].forEach((b,rx)=>{if(b!=='1')return;for(let yy=0;yy<S;yy++)for(let xx=0;xx<S;xx++){const x=(1+k*6+rx)*S+xx,y=(h-1)-((1+ry)*S+yy),i=(y*w+x)*4;data[i]=31;data[i+1]=42;data[i+2]=72;data[i+3]=255;}})));
 const t=new THREE.DataTexture(data,w,h);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;}
// Merge every mesh under root (except the kept ones) into one vertex-colored mesh per surface kind.
function bake(root,keep=new Set()){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),m=new THREE.Matrix4(),nm=new THREE.Matrix3(),groups=new Map(),drop=[];
 const kept=o=>{for(let q=o;q&&q!==root;q=q.parent)if(keep.has(q))return true;return false;};
 root.traverse(o=>{if(!o.isMesh||kept(o))return;const mat=o.material;if(mat.emissive?.getHex()||mat.map||mat.transparent){return;}
  const key=mat.roughness.toFixed(2)+':'+mat.metalness.toFixed(2);if(!groups.has(key))groups.set(key,{mat,parts:[]});m.multiplyMatrices(inv,o.matrixWorld);groups.get(key).parts.push({geo:o.geometry,matrix:m.clone(),color:mat.color.clone()});drop.push(o);});
 for(const o of drop)o.parent.remove(o);
 for(const {mat,parts} of groups.values()){let n=0;const list=parts.map(p=>{const g=(p.geo.index?p.geo.toNonIndexed():p.geo.clone());g.applyMatrix4(p.matrix);if(!g.attributes.normal)g.computeVertexNormals();n+=g.attributes.position.count;return {g,c:p.color};});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const {g,c} of list){const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++,o++){pos.set([P.getX(i),P.getY(i),P.getZ(i)],o*3);nor.set([N.getX(i),N.getY(i),N.getZ(i)],o*3);col.set([c.r,c.g,c.b],o*3);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:mat.roughness,metalness:mat.metalness}));root.add(mesh);}
}

export function createPolice(scene,world,nav,{sfx=()=>{}}={}){
 const glow=glowTexture(),lettering=letteringTexture(),cars=[];
 const K={mat:(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.9,...o})};
 function makeCar(name){
  const group=new THREE.Group();group.name='police-'+name;scene.add(group);group.visible=false;
  const parts=patrolBody(group),{L,W,roof,body}=parts;
  const box=(x,y,z,w,h,d,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);body.add(m);return m;};
  const navy=K.mat(0x1f2a48,{roughness:.45,metalness:.2}),black=K.mat(0x17181a,{roughness:.7}),chrome=K.mat(0xb8bcbc,{roughness:.3,metalness:.7});
  // Livery: a navy stripe along both sides and POLICE on the front doors.
  for(const s of [-1,1]){box(s*(W/2+.012),.66,.05,.012,.13,L*.78,navy);
   const t=new THREE.Mesh(new THREE.PlaneGeometry(.86,.18),new THREE.MeshStandardMaterial({map:lettering,transparent:true,alphaTest:.5,roughness:.5,depthWrite:true}));t.position.set(s*(W/2+.005),.82,-.43);t.rotation.y=s*Math.PI/2;body.add(t);}
  // Push bar, roof antenna and the spotlight on the driver's pillar.
  for(const s of [-1,1])box(s*.42,.55,-L/2-.17,.07,.42,.07,black);box(0,.72,-L/2-.17,.95,.06,.07,black);box(0,.45,-L/2-.17,.95,.06,.07,black);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(.005,.008,.55,8),black);ant.position.set(.3,roof+.3,.65);body.add(ant);
  const spot=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.13,16),chrome);spot.rotation.x=Math.PI/2;spot.position.set(-W/2-.06,1.18,-.72);body.add(spot);
  // Lightbar: a dark base, a red lens on the driver's side and a blue one on the other.
  box(0,roof+.05,.15,W*.78,.06,.3,black);
  const red=new THREE.MeshStandardMaterial({color:0x6a1414,emissive:0xff2a1e,emissiveIntensity:0,roughness:.3}),blue=new THREE.MeshStandardMaterial({color:0x141c5a,emissive:0x2c5cff,emissiveIntensity:0,roughness:.3});
  const lensL=box(-W*.21,roof+.13,.15,W*.34,.1,.26,red),lensR=box(W*.21,roof+.13,.15,W*.34,.1,.26,blue);box(0,roof+.13,.15,W*.08,.09,.22,K.mat(0xd9d9d0,{roughness:.3}));
  for(const s of [-1,1]){box(s*.52,roof+.005,.15,.12,.07,.19,black);for(let k=0;k<7;k++)box(s*W*.21+(k-3)*.082,roof+.13,.15,.01,.106,.27,chrome);}
  const sprite=(c,x,y,z,s)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:c,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,fog:false}));sp.position.set(x,y,z);sp.scale.setScalar(s);body.add(sp);return sp;};
  const glowR=sprite(0xff3a2a,-W*.21,roof+.16,.15,2.4),glowB=sprite(0x3a6aff,W*.21,roof+.16,.15,2.4);
  const heads=[-1,1].map(s=>sprite(0xfff1d6,s*(W/2-.28),.68,-L/2-.15,1.5)),tails=[-1,1].map(s=>sprite(0xff3020,s*(W/2-.14),.72,L/2+.1,.8));
  group.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  const keep=new Set([parts.near,parts.far,lensL,lensR,glowR,glowB,...heads,...tails]);bake(body,keep);bake(parts.near);bake(parts.far);
  // Each wheel becomes one mesh too.
  for(const w of parts.wheels)bake(w);
  const car={name,group,parts,L,W,red,blue,glowR,glowB,heads,tails,lights:false,headlights:true,siren:false,sirenMode:'wail',flash:0,phase:Math.random(),
   x:0,z:0,a:0,y:null,pitch:0,v:0,path:null,u:0,drive:null,onArrive:null,parked:true,active:false,idle:0,acceleration:0,turnRate:0,bodyPitch:0,bodyRoll:0,
   show(on=true){car.active=on;group.visible=on;},
   park(x,z,a){car.x=x;car.z=z;car.a=a;car.v=0;car.path=null;car.parked=true;car.y=null;car.acceleration=car.turnRate=car.bodyPitch=car.bodyRoll=0;place(car,0);},
   // Drive along world points; speed(car, remaining) gives the wanted speed each frame.
   go(points,{speed=()=>10,then=null,accel=2.6,brake=4}={}){car.path=worldPath([[car.x,car.z],...points]);car.u=0;car.parked=false;car.drive={speed,accel,brake};car.onArrive=then;
    // How fast it can go at each meter: no more than 3 m/s² sideways in a turn, braking in time for it.
    const P=car.path,n=Math.ceil(P.length)+1,prof=new Float32Array(n);for(let i=0;i<n;i++)prof[i]=Math.sqrt(3/Math.max(P.curv(i),1e-4));for(let i=n-2;i>=0;i--)prof[i]=Math.min(prof[i],Math.sqrt(prof[i+1]**2+2*brake*.75));car.profile=prof;},
   get remaining(){return car.path?car.path.length-car.u:0;},
   get pos(){return group.position;}};
  cars.push(car);return car;}
 // Ground contact: front and rear axles on whatever is underneath.
 function place(c,dt){const fx=Math.sin(c.a),fz=-Math.cos(c.a),h=1.45;
  const yF=nav.groundY(c.x+fx*h,c.z+fz*h),yR=nav.groundY(c.x-fx*h,c.z-fz*h),y=(yF+yR)/2;c.y=c.y===null||!dt?y:damp(c.y,y,14,dt);c.pitch=c.pitch===undefined||!dt?Math.atan2(yF-yR,2*h):damp(c.pitch,Math.atan2(yF-yR,2*h),10,dt);
  c.group.position.set(c.x,c.y,c.z);c.group.rotation.set(c.pitch,-c.a,0,'YXZ');
  c.bodyPitch=damp(c.bodyPitch,clamp(c.acceleration*.006,-.025,.018),7,dt);c.bodyRoll=damp(c.bodyRoll,clamp(-c.turnRate*c.v*.007,-.035,.035),6,dt);
  c.parts.body.rotation.set(c.bodyPitch,0,c.bodyRoll);for(const pivot of c.parts.steering)pivot.rotation.y=damp(pivot.rotation.y,clamp(-Math.atan(2.96*c.turnRate/Math.max(c.v,.5)),-.55,.55),9,dt);}
 function drive(c,dt){if(!c.path)return;const D=c.drive,remain=c.path.length-c.u,i=Math.min(c.profile.length-1,Math.floor(c.u)),f=c.u-i,prof=c.profile[i]+(c.profile[Math.min(i+1,c.profile.length-1)]-c.profile[i])*f;
  let want=Math.min(D.speed(c,remain),Math.sqrt(2*D.brake*Math.max(0,remain-.05))+.02,prof);
  const oldV=c.v,oldA=c.a;c.v+=clamp(want-c.v,-D.brake*dt,D.accel*dt);c.v=Math.max(0,c.v);c.u+=c.v*dt;const q=c.path.at(c.u);c.x=q.x;c.z=q.z;c.a+=wrap(q.a-c.a)*(1-Math.exp(-9*dt));c.acceleration=(c.v-oldV)/Math.max(dt,.001);c.turnRate=wrap(c.a-oldA)/Math.max(dt,.001);
  for(const w of c.parts.wheels)w.rotation.x-=c.v*dt/.33;
  if(remain<.04&&c.v<.2){c.v=0;c.path=null;c.parked=true;const f=c.onArrive;c.onArrive=null;f?.(c);}}
 // Lights shared by every car: created now, placed and switched each frame.
 const emergency=[new THREE.PointLight(0xff5441,0,20,2),new THREE.PointLight(0x527eff,0,20,2)],head=new THREE.SpotLight(0xfff0d8,0,60,.42,.55,1.6);
 const lightGroup=new THREE.Group();lightGroup.name='night-lights';lightGroup.add(...emergency,head,head.target);let attached=false;
 // A spot light for whoever needs one right now: a car's headlights, then later a flashlight.
 const spotUser={who:null};
 function attach(on){if(on&&!attached){scene.add(lightGroup);attached=true;}else if(!on&&attached){scene.remove(lightGroup);attached=false;}}
 // Wig-wag: red, then blue, each with a double flash, about twice a second.
 const pattern=(t,off)=>{const u=((t*2.1+off)%1+1)%1;return u<.11||(u>.2&&u<.31)?1:0;};
 let clock=0;
 function update(dt,eye){clock+=dt;const live=[];
  for(const c of cars){if(!c.active)continue;if(!c.parked)drive(c,dt);else c.acceleration=c.turnRate=0;place(c,dt);
   const r=c.lights?pattern(clock+c.phase,0):0,b=c.lights?pattern(clock+c.phase,.5):0;c.red.emissiveIntensity=r*3.2;c.blue.emissiveIntensity=b*3.4;
   const dist=Math.hypot(c.x-eye.x,c.z-eye.z),far=clamp(1.25-dist/320,.15,1);c.parts.near.visible=dist<(c.parts.near.visible?72:65);c.parts.far.visible=!c.parts.near.visible;c.glowR.material.opacity=r*.78*far;c.glowB.material.opacity=b*.78*far;c.glowR.scale.setScalar(1.15+dist*.006);c.glowB.scale.setScalar(1.15+dist*.006);
   c.parts.head.emissiveIntensity=c.headlights?1.6:0;c.parts.tail.emissiveIntensity=c.acceleration<-.7?1.4:.4;for(const s of c.heads)s.material.opacity=c.headlights?.7*clamp(1.2-dist/280,.2,1):0;for(const s of c.tails)s.material.opacity=c.headlights?(c.acceleration<-.7?.65:.3):0;
   if(c.lights)live.push({c,dist,r,b});}
  // The two emergency lights go to the nearest flashing cars (both to one car if it is alone nearby).
  live.sort((p,q)=>p.dist-q.dist);const n=live.length;
  emergency.forEach((L,i)=>{if(L.userData.borrowed)return;// (lent out for a moment: chapter3.js, the light a flashlight throws back off the walls of the drain)
   const e=n?live[Math.min(i,n-1)]:null;if(!e||e.dist>150){L.intensity=0;return;}const c=e.c,alone=n===1||live[1].dist>60;const side=alone?(i===0?-1:1):0;
   const fx=Math.sin(c.a),fz=-Math.cos(c.a),rx=Math.cos(c.a),rz=Math.sin(c.a);L.position.set(c.x+rx*side*.45+fx*.1,c.y+1.9,c.z+rz*side*.45+fz*.1);
   const on=alone?(i===0?e.r:e.b):Math.max(e.r,e.b);L.color.setHex(alone?(i===0?0xff5441:0x527eff):e.r?0xff5441:0x527eff);L.intensity=on*29;});
  // Headlights: the spot goes with the car that asked for it.
  if(spotUser.who&&spotUser.who.group){const c=spotUser.who,fx=Math.sin(c.a),fz=-Math.cos(c.a);head.position.set(c.x+fx*2.6,c.y+.75,c.z+fz*2.6);head.target.position.set(c.x+fx*20,c.y-.6,c.z+fz*20);head.angle=.5;head.penumbra=.6;head.distance=55;head.intensity=c.headlights?140:0;head.color.setHex(0xfff0d8);}
  else if(!spotUser.who)head.intensity=0;
 }
 function reset(){for(const c of cars){c.show(false);c.lights=false;c.siren=false;c.headlights=true;c.path=null;c.parked=true;c.v=0;c.red.emissiveIntensity=0;c.blue.emissiveIntensity=0;}
  for(const L of emergency){L.intensity=0;L.userData.borrowed=false;}head.intensity=0;spotUser.who=null;}
 return {makeCar,cars,update,reset,attach,emergency,head,spotUser,get attached(){return attached;}};
}
