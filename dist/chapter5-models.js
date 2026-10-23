// Chapter Five model kit. All dimensions are metres; grip sockets and the accepted IK skeleton stay intact.
import * as THREE from './three.module.js';
import {mergeParts} from './rig.js';
import {roundedBoxGeometry} from './kit.js';
import {pineMaterial} from './pine-materials.js';

// Elliptical, softly squared loft. Rings are [height, half width, half depth, forward offset].
export function loft(rings,sides=16,square=2){const pos=[],uv=[],idx=[];
 for(let j=0;j<rings.length;j++){const [y,x,z,dz=0]=rings[j];for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,c=Math.cos(a),s=Math.sin(a);pos.push(Math.sign(c)*Math.pow(Math.abs(c),2/square)*x,y,Math.sign(s)*Math.pow(Math.abs(s),2/square)*z+dz);uv.push(i/sides,j/(rings.length-1));}}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+sides+1;idx.push(a,b,a+1,b,b+1,a+1);}
 for(const [j,flip] of [[0,false],[rings.length-1,true]]){const c=pos.length/3;pos.push(0,rings[j][0],rings[j][3]||0);uv.push(.5,.5);for(let i=0;i<sides;i++){const a=j*(sides+1)+i;idx.push(c,flip?a+1:a,flip?a:a+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
const matrix=(p=[0,0,0],s=[1,1,1],r=[0,0,0])=>new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),new THREE.Vector3(...s));
const sphere=new THREE.SphereGeometry(1,16,12);
function assembly(){const pieces=[];return {add(geo,color,p,s,r){pieces.push({geo,color,matrix:matrix(p,s,r)});},ball(color,p,s,r){this.add(sphere,color,p,s,r);},finish(){return mergeParts(pieces);}};}
const shade=(c,k)=>new THREE.Color(c).multiplyScalar(k).getHex();
function torso(c,b){const a=assembly(),bulk=b.bulk||1,w=.159*(b.shoulders||1);
 a.add(loft([[-.22,.111,.071],[-.205,.122,.076],[-.12,.116,.077],[.03,.126,.083],[.135,w,.078],[.17,w*.9,.065],[.204,.052,.041]],20,2.65),c.shirt,[0,0,0],[bulk,1,bulk]);
 // Neck binding conforms to the neckline; no floating rings at the waist.
 const neck=new THREE.TorusGeometry(.043,.005,6,24);a.add(neck,c.trim||shade(c.shirt,.72),[0,.202,-.002],[1.13,1,.84],[Math.PI/2,0,0]);
 for(const side of [-1,1]){a.add(loft([[-.19,.002,.002],[-.03,.003,.002],[.05,.001,.001]],6),shade(c.shirt,.82),[side*.106,-.006,-.063],[1,1,1],[0,0,side*.1]);}
 return a.finish();
}
function hand(skin,bulk){const a=assembly();a.add(loft([[-.014,.021,.016],[.009,.029,.018],[.038,.029,.017],[.05,.022,.014]],12,2.5),skin,[0,0,0],[bulk,1,1]);
 // Four distinct bent fingers. Their continuous swept tubes keep the tips joined to their knuckles.
 for(let i=0;i<4;i++){const x=(i-1.5)*.0145,len=[.039,.046,.043,.034][i],curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.038,.003),new THREE.Vector3(x,.057,.014),new THREE.Vector3(x,.055+len*.2,.032),new THREE.Vector3(x,.039,.034)]);
  a.add(new THREE.TubeGeometry(curve,7,.0064,6,false),skin);a.ball(shade(skin,.97),[x,.055,.015],[.0075,.007,.008]);}
 const thumb=new THREE.CatmullRomCurve3([new THREE.Vector3(-.025,.009,-.006),new THREE.Vector3(-.039,.026,.005),new THREE.Vector3(-.031,.043,.017)]);a.add(new THREE.TubeGeometry(thumb,8,.009,8,false),skin);
 return a.finish();}
function shoe(c){const a=assembly(),upper=c.shoes||0xded8cb,sole=c.sole||0xeae6da;
 a.add(roundedBoxGeometry(.087,.021,.218,.009),sole,[0,-.027,-.006]);
 a.add(loft([[-.02,.041,.102,-.01],[.005,.043,.098,-.012],[.025,.039,.079,-.005],[.055,.031,.039,.032],[.065,.027,.031,.034]],16,2.8),upper);
 a.add(roundedBoxGeometry(.057,.007,.055,.006),shade(upper,.8),[0,.04,-.028],[1,1,1],[-.32,0,0]);
 for(let i=0;i<4;i++)a.add(roundedBoxGeometry(.046,.004,.004,.001),sole,[0,.046-i*.003,-.007-i*.013],[1,1,1],[0,0,(i%2?.07:-.07)]);
 a.add(roundedBoxGeometry(.048,.024,.006,.003),shade(upper,.72),[0,.013,.101]);return a.finish();
}
function head(c){const F=c.face||{},H=c.hair||{},size=c.build?.head||1,a=assembly(),skin=F.skin||0xd6a57f;
 const skull=loft([[-.106,.026,.037,-.009],[-.091,.052,.059,-.008],[-.056,.076*(F.jaw||.92),.084,-.005],[-.015,.094,.097],[.031,.095,.099],[.075,.080,.085,.006],[.106,.046,.055,.009],[.115,.008,.012,.01]],24,2.15);a.add(skull,skin);
 for(const s of [-1,1]){const ex=s*(F.eyeGap||.036),ey=F.eyeY||.012;
  a.ball(skin,[s*.094,-.004,.005],[.012,.024,.015]);a.ball(shade(skin,.78),[s*.103,-.003,-.003],[.004,.013,.009]);
  a.ball(0xe3dfd3,[ex,ey,-.092],[.0165,.0085,.007]);a.ball(F.iris||0x34261d,[ex,ey,-.098],[.007,.0072,.0028]);a.ball(0x151513,[ex,ey,-.1003],[.0032,.004,.001]);
  a.ball(0xd9dcd0,[ex-.002,ey+.002,-.1015],[.0015,.0015,.0007]);
  // Upper/lower orbital contours keep the eyes seated in the face.
  a.ball(skin,[ex,ey+.009,-.090],[.018,.005,.008],[0,0,s*.07]);a.ball(shade(skin,.94),[ex,ey-.009,-.091],[.016,.003,.005]);}
 a.ball(skin,[0,-.013,-.101],[.010,.021,.011],[-.15,0,0]);a.ball(skin,[0,-.026,-.110],[.012,.009,.009]);
 for(const s of [-1,1])a.ball(shade(skin,.78),[s*.007,-.032,-.110],[.003,.002,.003]);
 const hc=H.color||0x38281f;
 if(H.style==='cap'){a.add(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.53),H.cap||0x2d4a7a,[0,.031,.006],[.108,.086,.110]);a.add(roundedBoxGeometry(.155,.009,.096,.025),H.cap||0x2d4a7a,[0,.034,-.117],[1,1,1],[.12,0,0]);a.ball(shade(H.cap||0x2d4a7a,.7),[0,.117,.006],[.009,.005,.009]);
  for(const s of [-1,1])a.ball(hc,[s*.085,.006,.034],[.018,.035,.048]);a.ball(hc,[0,.005,.077],[.075,.041,.035]);
 }else{
  a.add(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.57),hc,[0,.024,.012],[.102,.098,.108]);
  for(let i=0;i<17;i++){const u=i/16,x=(u-.5)*.177,y=.055+.013*Math.sin(i*2.4),z=-.066+.011*Math.cos(i);a.ball(shade(hc,.88+(i%4)*.07),[x,y,z],[.018,.039,.023],[.4,0,-.35+x*2]);}
  for(const s of [-1,1])a.ball(hc,[s*.091,.004,.032],[.018,.043,.055]);}
 const geo=a.finish();geo.scale(size,size,size);return geo;
}
const cache=new Map();
function models(c){const key=JSON.stringify(c);if(cache.has(key))return cache.get(key);const b=c.build||{},cl=c.clothes||{},bulk=b.bulk||1,skin=c.face?.skin||0xd6a57f,lower=cl.pants||cl.shorts||0x4e5566;
 const body={torso:torso(cl,b),head:head(c),hand:hand(skin,bulk),shoe:shoe(cl)};
 // Overlapping rounded joint ends cover an elbow through its full bend without separate ball joints.
 const limb=(L,r0,r1,r2)=>loft([[-L/2-.025,r0*.25,r0*.25],[-L/2-.006,r0*.9,r0*.8],[-L/2+.025,r0,r0*.9],[0,r1,r1*.87],[L/2-.025,r2,r2*.88],[L/2+.006,r2*.9,r2*.8],[L/2+.025,r2*.25,r2*.25]],16,2.1);
 body.upper=limb(.25,.031*bulk,.038*bulk,.041*bulk);body.fore=limb(.23,.023*bulk,.029*bulk,.035*bulk);
 body.thigh=limb(.38,.047*bulk,.064*bulk,.073*bulk);body.shin=limb(.37,.027*bulk,.039*bulk,.043*bulk);
 body.sleeve=limb(cl.sleeves==='long'?.22:.125,.045*bulk,.051*bulk,.054*bulk);body.sleeve.parameters={length:cl.sleeves==='long'?.2:.105};
 body.pelvis=loft([[-.074,.105,.071],[-.045,.123,.078],[.04,.120,.076],[.075,.108,.069]],16,2.8);body.pelvis.rotateZ(-Math.PI/2);
 const skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.65}),cloth=pineMaterial(cl.shirt,'fabric'),pants=pineMaterial(lower,'fabric');
 const result={body,skinMat,cloth,pants};cache.set(key,result);return result;
}
export function chapter5Appearance(person,cast){const saved=new Map(),m=models(cast);let on=false;
 return {get enabled(){return on;},enable(value){if(on===!!value)return;on=!!value;person.art5=on;if(!on){for(const [part,old] of saved){part.geometry=old.geometry;part.material=old.material;}saved.clear();for(const n of ['mouth','brows']){const q=person.face?.[n];if(q?.userData.c5Base){q.position.copy(q.userData.c5Base.p);q.scale.copy(q.userData.c5Base.s);delete q.userData.c5Base;}}return;}
  for(const [name,part] of Object.entries(person.parts)){const key=/^[lr](hand|shoe|upper|fore|thigh|shin|sleeve)$/.test(name)?name.slice(1):name,geo=m.body[key];if(!geo)continue;saved.set(part,{geometry:part.geometry,material:part.material});part.geometry=geo;
   if(['upper','fore','shin'].includes(key))part.material=key==='shin'&&cast.clothes?.pants?m.pants:m.skinMat;
   if(['thigh','pelvis'].includes(key))part.material=m.pants;if(key==='sleeve')part.material=m.cloth;}
  for(const n of ['mouth','brows']){const q=person.face?.[n];if(!q)continue;q.userData.c5Base={p:q.position.clone(),s:q.scale.clone()};if(n==='mouth'){q.position.z=.007;q.scale.x=1.18;}else q.position.y=-.009;}
 }};
}
