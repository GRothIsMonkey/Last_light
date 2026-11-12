// Chapter Six's reversible cast reconstruction. Same IK skeleton, contact sockets and
// character identities; new surfaces. No shared cast/rig material is mutated.
import * as THREE from './three.module.js';
import {mergeParts} from './rig.js';
import {loft} from './chapter5-models.js';
import {roundedBoxGeometry} from './kit.js';
import {paper,clamp,damp} from './chapter6-kit.js';
import {EXPRESSIONS} from './faces.js';

const ball=new THREE.SphereGeometry(1,20,14),cache=new Map();
const mix=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();
const shade=(c,k)=>new THREE.Color(c).multiplyScalar(k).getHex();
const xf=(p=[0,0,0],s=[1,1,1],r=[0,0,0])=>new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),new THREE.Vector3(...s));
function build(){const a=[];return {add(geo,color,p,s,r){a.push({geo,color,matrix:xf(p,s,r)});},ell(c,p,s,r){this.add(ball,c,p,s,r);},box(c,p,s,r=.004,rot){this.add(roundedBoxGeometry(...s,r),c,p,undefined,rot);},done(){return mergeParts(a);}};}
function smoothRings(rings,steps=4){const out=[];for(let j=0;j<rings.length-1;j++)for(let n=0;n<steps;n++){const u=n/steps,p0=rings[Math.max(0,j-1)],p1=rings[j],p2=rings[j+1],p3=rings[Math.min(rings.length-1,j+2)];out.push(p1.map((v,k)=>k===0?v+(p2[k]-v)*u:.5*(2*v+(-p0[k]+p2[k])*u+(2*p0[k]-5*v+4*p2[k]-p3[k])*u*u+(-p0[k]+3*v-3*p2[k]+p3[k])*u*u*u)));}out.push(rings.at(-1));return out;}
const gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));
function skinHead(spec){const F=spec.face,b=spec.build||{},adult=(spec.scale||1)>1.1;
 const rings=smoothRings([[-.119,.015,.023,-.003],[-.108,.038,.040,-.009],[-.085,.060*(F.jaw||1),.064,-.003],[-.052,.077,.077,0],[-.015,.087,.087,.002],[.02,.086,.087,.004],[.057,.085,.083,.008],[.091,.071,.067,.012],[.117,.044,.043,.012],[.129,.003,.004,.012]],4);
 const g=loft(rings,48,2),p=g.attributes.position,col=[];
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const front=clamp((-z-.012)/.055,0,1);
  // One continuous face: nose bridge, tip, philtrum, chin, cheek and eye socket.
  z+=front*(.009*(gauss(x,y,-.034,.018,.023,.019)+gauss(x,y,.034,.018,.023,.019))-.017*gauss(x,y,0,-.012,.012,.034)-.017*gauss(x,y,0,-.030,.016,.012)-.003*gauss(x,y,0,-.087,.031,.019));
  p.setXYZ(i,x,y*(adult?1.035:1),z);
  const blush=front*(gauss(x,y,-.056,-.022,.025,.025)+gauss(x,y,.056,-.022,.025,.025))*.10;
  const c=new THREE.Color(F.skin).lerp(new THREE.Color(0xc27f70),blush);c.multiplyScalar(1-.035*gauss(x,y,0,-.070,.07,.02));col.push(c.r,c.g,c.b);
 }
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const ears=build();for(const s of [-1,1]){ears.ell(F.skin,[s*.086,-.005,.005],[.011,.022,.014]);ears.ell(shade(F.skin,.88),[s*.092,-.004,-.004],[.004,.012,.006]);}
 const earG=ears.done(),body=g.toNonIndexed(),ep=earG.attributes.position,en=earG.attributes.normal,ec=earG.attributes.color;
 const join=new THREE.BufferGeometry();for(const k of ['position','normal','color']){const x=body.attributes[k].array,y=earG.attributes[k].array,arr=new Float32Array(x.length+y.length);arr.set(x);arr.set(y,x.length);join.setAttribute(k,new THREE.BufferAttribute(arr,3));}join.computeBoundingSphere();body.dispose();g.dispose();earG.dispose();return join;
}
function ribbon(points,width,color,a){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),pos=[],idx=[];
 for(let i=0;i<=20;i++){const t=i/20,c=curve.getPoint(t),w=width*(.22+.78*Math.sin(Math.PI*Math.pow(t,.72)))*(1-t*.56);for(let k=0;k<=4;k++){const u=k/2-1;pos.push(c.x+u*w,c.y+.0035*(1-u*u),c.z);}if(i<20)for(let k=0;k<4;k++){const n=i*5+k;idx.push(n,n+5,n+1,n+5,n+6,n+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();a.add(g,color);
}
function hair(spec){const H=spec.hair,a=build(),c=H.color,cap=H.style==='cap',cropped=H.style==='cropped',shag=H.style==='shaggy';
 // A closed scalp shell. The swept shape and shallow grooves belong to one
 // surface, avoiding floating strips or gaps at the temples in grazing light.
 const cols=96,rows=36,pos=[],colors=[],idx=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
  const phi=i/cols*Math.PI*2,front=Math.max(0,-Math.sin(phi)),back=Math.max(0,Math.sin(phi));
  const edge=1.73-.56*front+.25*back+(shag?.08*Math.sin(phi*7):.018*Math.sin(phi*5))-.10*front*Math.cos(phi);
  const theta=.001+j/rows*edge,groove=.00065*Math.sin(phi*37+theta*5)*Math.sin(theta),quiff=(cap||cropped?0:.006)*front*Math.sin(theta*1.6);
  const x=Math.cos(phi)*Math.sin(theta)*(.098+groove),y=.024+Math.cos(theta)*(.119+quiff),z=.012+Math.sin(phi)*Math.sin(theta)*(.105+groove);
  pos.push(x,y,z);const cc=new THREE.Color(c).multiplyScalar(.94+.045*Math.sin(phi*37+theta*5)+.035*Math.cos(phi*3));colors.push(cc.r,cc.g,cc.b);
  if(j<rows&&i<cols){const n=j*(cols+1)+i;idx.push(n,n+cols+1,n+1,n+1,n+cols+1,n+cols+2);}
 }
 const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));shell.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));shell.setIndex(idx);shell.computeVertexNormals();
 // mergeParts applies its own vertex tint: keep the subtle geometry grooves,
 // a soft single colour, and the recognisable silhouette of each identity.
 a.add(shell,c);
 for(const side of [-1,1])a.ell(c,[side*.084,.008,.026],[.012,.030,.035]);
 if(cap){const blue=H.cap||0x2d4a7a;a.add(new THREE.SphereGeometry(1,36,18,0,Math.PI*2,0,Math.PI*.52),blue,[0,.040,.006],[.105,.105,.115]);
  const brim=new THREE.PlaneGeometry(.190,.108,22,10),p=brim.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),v=(p.getY(i)+.054)/.108;p.setXYZ(i,x*(.83+.17*Math.sin(Math.PI*v)),.039-.016*(x/.095)**2-.007*v,-.070-v*.10*Math.sqrt(Math.max(.15,1-(x/.110)**2)));}brim.computeVertexNormals();a.add(brim,blue);
  for(let k=0;k<6;k++){const ang=k/6*Math.PI*2,pts=[];for(let j=0;j<14;j++){const v=j/13*1.53;pts.push(new THREE.Vector3(Math.cos(ang)*Math.sin(v)*.106,.040+Math.cos(v)*.106,.006+Math.sin(ang)*Math.sin(v)*.116));}a.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.0005,4),shade(blue,1.15));}
  a.ell(shade(blue,.9),[0,.146,.006],[.006,.003,.006]);a.box(0xc6c7b9,[0,.082,-.104],[.018,.017,.0018],.002);
 }
 return a.done();
}
let contactMap=null;
function shadowMap(){if(contactMap)return contactMap;contactMap=paper(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(0,0,0,.55)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});return contactMap;}
let fabric=null;
function clothMap(){if(fabric)return fabric;fabric=paper(128,128,(g,w,h)=>{g.fillStyle='#cccccc';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){g.fillStyle=(x+y)%4?'#c8c8c8':'#d3d3d3';g.fillRect(x,y,1,2);}});if(fabric){fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(3,3);}return fabric;}
function torso(spec){const a=build(),c=spec.clothes,b=spec.build||{},bulk=b.bulk||1,officer=spec.name==='OFFICER',adult=(spec.scale||1)>1.1,w=.151*(b.shoulders||1);
 const g=loft(smoothRings([[-.225,.108,.066,0],[-.204,.116,.070,0],[-.13,.111,.073,0],[-.04,.116,.079,0],[.07,.129,.078,.003],[.135,w,.070,.003],[.168,w*.96,.063,.002],[.201,.044,.036,0]],3),32,2.5),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=Math.sin(y*49+x*23)*.0025+Math.sin(x*62+y*16)*.0015;p.setXYZ(i,x*bulk,y,z*bulk+f*(.35+Math.abs(x)*4));}g.computeVertexNormals();a.add(g,c.shirt);
 const edge=mix(c.shirt,0x222731,.26),seam=mix(c.shirt,0xc4c0af,.17);
 const neck=new THREE.TorusGeometry(.039,.0038,8,28);a.add(neck,c.trim||edge,[0,.200,0],[1.15,1,.86],[Math.PI/2,0,0]);
 if(c.collar||adult){for(const s of [-1,1])a.box(c.shirt,[s*.038,.174,-.044],[.054,.009,.054],.003,[0,s*.23,s*.23]);a.box(edge,[0,.093,-.082],[.010,.16,.003],.001);for(let i=0;i<3;i++)a.ell(0xb7b4a5,[0,.15-i*.047,-.084],[.0023,.0023,.0015]);}
 for(const s of [-1,1]){a.box(seam,[s*.111,-.119,-.054],[.002,.17,.002],.0006,[0,0,s*.03]);if(adult){a.box(c.shirt,[s*.072,.046,-.080],[.067,.064,.003],.004);a.box(edge,[s*.072,.078,-.083],[.067,.002,.0015],.0005);}}
 if(officer){a.box(0x181c23,[0,-.203,0],[.254,.031,.154],.009);a.box(0x999282,[0,-.204,-.080],[.033,.027,.006],.002);a.ell(0xb4a26a,[-.069,.119,-.085],[.014,.020,.002]);a.box(0xc0c2b5,[.064,.105,-.083],[.037,.009,.002],.001);}
 return a.done();
}
function models(spec){const key=JSON.stringify(spec);if(cache.has(key))return cache.get(key);const F=spec.face,c=spec.clothes,b=spec.build||{},bulk=b.bulk||1;
 const lengthLimb=(L,r0,r1,r2,cloth=false)=>{const rings=smoothRings([[-L/2-.026,r0*.35,r0*.32,0],[-L/2-.003,r0*.84,r0*.78,0],[-L/2+.026,r0,r0*.86,0],[0,r1,r1*.88,0],[L/2-.02,r2,r2*.85,0],[L/2+.003,r2*.86,r2*.75,0],[L/2+.026,r2*.35,r2*.32,0]],2),g=loft(rings,20,2.2);if(cloth){const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i)),k=1+.045*Math.sin(y*64+a*3)*Math.exp(-Math.abs(y+L*.4)*14);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}g.computeVertexNormals();}g.rotateZ(Math.PI);return g;};
 const body={head:skinHead(spec),torso:torso(spec),neck:loft(smoothRings([[-.037,.038,.031,0],[0,.034,.031,0],[.038,.032,.028,0],[.060,.041,.034,0]],2),24),
 upper:lengthLimb(.25,.031*bulk,.039*bulk,.041*bulk),fore:lengthLimb(.23,.022*bulk,.031*bulk,.033*bulk),
 thigh:lengthLimb(.38,.050*bulk,.062*bulk,.072*bulk,true),shin:lengthLimb(.37,.030*bulk,.041*bulk,.050*bulk,!!c.pants),
 sleeve:lengthLimb(c.sleeves==='long'?.22:.135,.043*bulk,.050*bulk,.050*bulk,true),pelvis:loft(smoothRings([[-.076,.100,.066,0],[-.048,.119,.072,0],[.041,.116,.073,0],[.071,.108,.064,0]],2),24,2.6)};
 body.pelvis.rotateZ(-Math.PI/2);body.sleeve.parameters={length:c.sleeves==='long'?.2:.115};
 const hand=build();hand.add(loft(smoothRings([[-.022,.019,.011,0],[.003,.026,.014,0],[.029,.028,.014,0],[.044,.021,.012,0]],2),16,2.4),F.skin);
 for(let i=0;i<4;i++){const x=(i-1.5)*.013,len=[.032,.040,.037,.028][i];const curve=new THREE.CatmullRomCurve3([[x,.032,0],[x,.047,.012],[x,.046+len*.3,.026],[x,.031,.032]].map(p=>new THREE.Vector3(...p)));hand.add(new THREE.TubeGeometry(curve,10,.0057,8),F.skin);hand.ell(F.skin,[x,.031,.032],[.0059,.0065,.006]);hand.ell(mix(F.skin,0xdfc8b8,.2),[x,.032,.038],[.0035,.004,.0007]);}
 hand.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-.023,.001,-.003],[-.034,.019,.006],[-.028,.036,.020]].map(p=>new THREE.Vector3(...p))),10,.008,8),F.skin);hand.ell(F.skin,[-.028,.036,.020],[.008,.008,.008]);body.hand=hand.done();
 const shoe=build(),sc=c.shoes||0xe0dbce;shoe.box(c.sole||0xdddace,[0,-.028,-.008],[.085,.022,.207],.009);shoe.add(loft(smoothRings([[-.020,.040,.096,-.011],[.004,.042,.094,-.013],[.026,.036,.065,.001],[.053,.030,.039,.029],[.061,.027,.032,.031]],2),24,2.8),sc);for(let i=0;i<4;i++)shoe.box(0xc9c8bd,[0,.042-i*.002,-.003-i*.011],[.043,.0025,.003],.001,[0,0,i%2?.15:-.15]);body.shoe=shoe.done();
 const m={body,hair:hair(spec),vc:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.79,side:THREE.DoubleSide}),skin:new THREE.MeshStandardMaterial({color:F.skin,roughness:.78}),cloth:new THREE.MeshStandardMaterial({color:c.shirt,roughness:.96,map:clothMap()}),lower:new THREE.MeshStandardMaterial({color:c.pants||c.shorts,roughness:.95,map:clothMap()})};cache.set(key,m);return m;
}
const sphere=(mat,scale,pos,parent)=>{const q=new THREE.Mesh(ball,mat);q.scale.set(...scale);q.position.set(...pos);parent.add(q);return q;};
// A fitted face rig. Skin lids occlude inset eyes; pupils follow a world-space gaze.
// Cursed figures use these same features, without a second monster mesh.
function faceRig(person,spec){const g=new THREE.Group();g.name='c6-face';const F=spec.face,skin=new THREE.MeshStandardMaterial({color:F.skin,roughness:.82}),lip=new THREE.MeshStandardMaterial({color:mix(F.skin,F.lips,.46),roughness:.8}),dark=new THREE.MeshStandardMaterial({color:0x382825,roughness:1}),white=new THREE.MeshStandardMaterial({color:0xc9c4b5,roughness:.53}),irisMat=new THREE.MeshStandardMaterial({color:F.iris,roughness:.43}),hairMat=new THREE.MeshStandardMaterial({color:spec.hair.color,roughness:1});
 const eyes=[];for(const s of [-1,1]){const e=new THREE.Group();e.position.set(s*(F.eyeGap||.035),.017,-.0685);g.add(e);
  const whites=sphere(white,[.014,.0055,.0025],[0,0,-.002],e),iris=sphere(irisMat,[.0054,.0055,.0017],[0,0,-.004],e),pupil=sphere(dark,[.0026,.0032,.0008],[0,0,-.0056],e);
  const glint=sphere(new THREE.MeshBasicMaterial({color:0xe3dfcf}),[.0008,.0008,.0004],[-.0015,.0018,-.0062],e);
  const upper=sphere(skin,[.015,.0013,.002],[0,.0055,-.0015],e),lower=sphere(skin,[.015,.0009,.0018],[0,-.0055,-.0015],e);
  const brow=sphere(hairMat,[.017,.0022,.0025],[s*.001,.019,-.003],e);brow.rotation.z=s*.08;eyes.push({s,e,whites,iris,pupil,glint,upper,lower,brow});}
 const mouth=new THREE.Group();mouth.position.set(0,-.058,-.080);g.add(mouth);
 const cavity=sphere(dark,[.020,.0015,.002],[0,0,-.003],mouth),top=sphere(lip,[.021,.0012,.002],[0,.002,-.003],mouth),bottom=sphere(lip,[.019,.0015,.0025],[0,-.003,-.003],mouth);
 const corners=[-1,1].map(s=>sphere(lip,[.004,.0014,.002],[s*.019,0,-.001],mouth));
 const gaze=new THREE.Vector3(),q=new THREE.Quaternion(),target=new THREE.Vector3();let openness=0,smile=0,tilt=0;
 function update(dt,{clock=0,actor=null,eye=null,cursed=false,phase='',line=null}={}){
  const expression=person.face?.expression||(spec.name.includes('DAD')?'sad':'concerned'),ex=EXPRESSIONS[expression]||{};
  const talking=(actor?.talk||0)>0;let speechOpen=person.face?.openness||0;
  if(talking&&!person.face){const t=actor.t||clock;speechOpen=(.22+.55*Math.abs(Math.sin(t*10.2)))*Math.max(0,Math.sin(t*3.7+.8));}
  openness=damp(openness,cursed?.035:clamp(speechOpen,0,.72),18,dt);smile=damp(smile,cursed?.52:(ex.smile||0)*.42,3,dt);tilt=damp(tilt,cursed?0:(ex.tilt||0),4,dt);
  const ph=(clock+(spec.name.length*1.31))%(4.1+spec.name.length*.19),blink=cursed?0:(ph<.15?Math.sin(ph/.15*Math.PI):0),tired=ex.lids||0;
  let gx=0,gy=0;const at=actor?.lookAt||eye;
  if(at){person.parts.head.getWorldPosition(gaze);person.parts.head.getWorldQuaternion(q).invert();target.copy(at).sub(gaze).applyQuaternion(q);if(target.z<0){gx=clamp(target.x/Math.max(.3,-target.z),-1,1)*.0024;gy=clamp(target.y/Math.max(.3,-target.z),-1,1)*.0014;}}
  for(const e of eyes){const shut=Math.max(blink,tired*.7),k=Math.max(.04,1-shut);e.whites.scale.y=.006*k;e.iris.scale.y=.0055*k;e.pupil.scale.y=.0032*k;e.glint.visible=shut<.6;
   e.iris.position.x=e.pupil.position.x=gx+(cursed?e.s*.00035:0);e.iris.position.y=e.pupil.position.y=gy;e.upper.position.y=.0055-shut*.0055;e.upper.scale.y=.0013+shut*.003;e.lower.position.y=-.0055+shut*.0015;
   e.brow.position.y=.019+(ex.browY||0)*.55;e.brow.rotation.z=e.s*(.08+tilt*.26)+(cursed&&e.s<0?.07:0);}
  cavity.scale.y=.001+openness*.009;top.position.y=.002+openness*.002;bottom.position.y=-.003-openness*.012;bottom.scale.x=.019*(1-openness*.12);corners.forEach((c,i)=>{c.position.y=smile*.005+(cursed&&i===1?.002:0);});
  if(cursed){top.rotation.z=.035;bottom.rotation.z=.025;eyes[0].upper.position.y+=.0007;}
 }
 return {g,update,eyes,mouth};
}

export function chapter6Appearance(person,spec,{actor=null,cursed=false}={}){if(person.artBoy&&!cursed){let on=false;return {enable(v){on=!!v;person.art6=on;},update(){},get enabled(){return on;}};}const m=models(spec),head=person.parts.head,face=faceRig(person,spec),hairMesh=new THREE.Mesh(m.hair,m.vc);hairMesh.name='c6-hair';const detail=new THREE.Group();detail.name='c6-character-detail';detail.add(face.g,hairMesh);detail.visible=false;head.add(detail);
 if(person.firstPerson)detail.traverse(q=>q.layers.set(1));
 const shadow=new THREE.Group();shadow.name='c6-foot-contact';shadow.visible=false;person.group.add(shadow);const shadowM=new THREE.MeshBasicMaterial({map:shadowMap(),color:0x000000,transparent:true,opacity:.34,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});const feet=['l','r'].map(s=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.20,.30),shadowM);m.rotation.x=-Math.PI/2;shadow.add(m);return {s,m};});
 let enabled=false;const saved=new Map(),hidden=new Map();
 function enable(on){if(enabled===!!on)return;enabled=!!on;person.art6=enabled;detail.visible=enabled;shadow.visible=enabled;
  if(!on){for(const [p,v] of saved){p.geometry=v.g;p.material=v.m;p.scale.copy(v.s);}for(const [c,v] of hidden)c.visible=v;saved.clear();hidden.clear();return;}
  for(const [name,p] of Object.entries(person.parts)){const key=/^[lr](hand|shoe|upper|fore|thigh|shin|sleeve)$/.test(name)?name.slice(1):name;if(!m.body[key])continue;saved.set(p,{g:p.geometry,m:p.material,s:p.scale.clone()});p.geometry=m.body[key];
   p.material=['head','torso','hand','shoe'].includes(key)?m.vc:['thigh','pelvis'].includes(key)||key==='shin'&&spec.clothes.pants?m.lower:key==='sleeve'||key==='fore'&&spec.clothes.sleeves==='long'?m.cloth:m.skin;
   if(key==='neck')p.scale.set(1,1,1);}
  for(const c of head.children)if(c!==detail&&!c.userData.c6Equipment){hidden.set(c,c.visible);c.visible=false;}
 }
 function update(dt,ctx={}){if(!enabled)return;for(const {s,m} of feet){const shoe=person.parts[s+'shoe'];m.position.set(shoe.position.x,.009,shoe.position.z);m.material.opacity=.32*Math.max(0,1-Math.abs(shoe.position.y-.03)*3);m.rotation.z=-person.pose[3];}for(const c of head.children)if(c!==detail&&!c.userData.c6Equipment)c.visible=false;face.update(dt,{...ctx,actor,cursed});}
 return {enable,update,face,get enabled(){return enabled;},get model(){return m;}};
}
