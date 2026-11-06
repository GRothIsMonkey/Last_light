// All shared rigs borrow an appearance when Seven starts and return the same
// geometry, material and facial transforms when it ends.
import * as THREE from './three.module.js';
import {paper,clamp,damp} from './chapter6-kit.js';
import {EXPRESSIONS} from './faces.js';
import {seeded} from './kit.js';

const caps=new WeakMap(),faceCache=new WeakMap(), clothCache=new WeakMap(), handCache=new WeakMap();
const grain=(x,y,z)=>Math.sin(251*x+367*y+313*z)*Math.cos(173*x-411*y);
const bell=(x,y,ox,oy,wx,wy)=>Math.exp(-(((x-ox)/wx)**2+((y-oy)/wy)**2));
function portraitSkin(src,elder=false) {
 if(faceCache.has(src))return faceCache.get(src);
 const g=src.clone(),p=g.attributes.position,col=g.attributes.color;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),side=Math.abs(x),front=clamp((-z-.018)/.052,0,1);
  const eye=bell(side,y,.036,.014,.022,.015),cheek=bell(side,y,.055,-.024,.022,.018);
  const nose=bell(x,y,0,-.028,.015,.009),chin=bell(x,y,0,-.082,.027,.013);
  const hollow=elder?bell(side,y,.050,-.046,.020,.026)*.16:0;
  const fold=elder?(.10*bell(side,y,.023,-.040,.004,.023)+.08*bell(side,y,.035,.003,.022,.003)):0;
  const shade=.985-front*(.19*eye+.15*bell(x,y,0,-.041,.017,.005)+.12*bell(x,y,.001,-.066,.022,.006)+hollow+fold)+.013*grain(x,y,z);
  col.setXYZ(i,col.getX(i)*(shade+cheek*.065+nose*.037),col.getY(i)*(shade-cheek*.055),col.getZ(i)*(shade-cheek*.042+eye*.07));
  p.setZ(i,z+front*(.0027*eye-.0022*cheek-.002*chin+(elder?.007*hollow:0)));
  if(elder){p.setY(i,y*1.045-.006*bell(side,y,.063,-.064,.021,.024));p.setX(i,x*(1-front*hollow*.16));}
 }
 faceCache.set(src,g);return g;
}
function capShape(src){
 if(caps.has(src))return caps.get(src);
 const g=src.clone(),p=g.attributes.position,c=g.attributes.color;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  // Move the whole binding and lift the curved bill off the eyebrows, keeping
  // its stitched seams attached. Hair and ear-level locks stay where they are.
  if(y>.010&&(c.getZ(i)>c.getX(i)*1.15||y>.065))
   p.setY(i,y+.008+.016*clamp((-z-.082)/.088,0,1)-.005*clamp((y-.045)/.11,0,1));
 }
 caps.set(src,g);return g;
}
function garment(src) {
 if(clothCache.has(src))return clothCache.get(src);
 const g=src.clone(),pos=g.attributes.position,c=g.attributes.color;
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),hem=Math.max(0,1-Math.abs(y+.13)*7);
  const fold=.94+.045*Math.sin(y*56+Math.sin(x*27)*1.7)*hem+.025*grain(x,y,z);
  c.setXYZ(i,c.getX(i)*fold,c.getY(i)*fold,c.getZ(i)*fold);
  pos.setZ(i,z+Math.sign(z)*hem*.003*Math.sin(x*42+y*51));
 }
 clothCache.set(src,g);return g;
}
function weatherHand(src){
 if(handCache.has(src))return handCache.get(src);
 const g=src.clone(),p=g.attributes.position,c=g.attributes.color;
 for(let i=0;i<p.count;i++){
  const y=p.getY(i),z=p.getZ(i),crease=.08*bell(z,y,.014,.041,.016,.006)+.11*bell(z,y,.030,.035,.009,.005);
  c.setXYZ(i,c.getX(i)*(1-crease*.44),c.getY(i)*(1-crease),c.getZ(i)*(1-crease*.85));
 }
 handCache.set(src,g);return g;
}
const dotMat=new THREE.MeshStandardMaterial({color:0x795746,roughness:.84});
const eyeDot=new THREE.SphereGeometry(1,10,8);
function feature(parent,mat,x,y,z,w,h,d){
 const mesh=new THREE.Mesh(eyeDot,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
}
let club;
function clubInk(){
 if(club)return club;
 const tx=paper(256,128,(c,w,h)=>{
  c.fillStyle='#3e514d';c.beginPath();c.ellipse(128,64,106,45,-.035,0,Math.PI*2);c.fill();
  c.strokeStyle='#e0ca9c';c.lineWidth=4;c.stroke();c.textAlign='center';c.fillStyle='#e9d7ab';
  c.font='italic bold 43px Georgia';c.fillText('Oaks',127,73);c.font='bold 12px Georgia';c.fillText('B I C Y C L E   C L U B',128,93);
  const r=seeded(271);c.globalCompositeOperation='destination-out';for(let i=0;i<1400;i++)c.fillRect(r()*256,r()*128,1,1);
 });
 club=new THREE.MeshStandardMaterial({map:tx,transparent:true,alphaTest:.34,depthWrite:false,roughness:.96,color:0xe4dbbd,polygonOffset:true,polygonOffsetFactor:-2});return club;
}
function shirtTransfer(parent) {
 const g=new THREE.PlaneGeometry(.19,.094,16,5),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-.093+Math.pow(Math.abs(x)/.142,2.5)*.028+.001*Math.cos(y*40));p.setX(i,-x);}
 g.computeVertexNormals();const mesh=new THREE.Mesh(g,clubInk());mesh.name='c7-faded-club-shirt';mesh.position.y=.061;parent.add(mesh);
}
function wristband(parent){
 const t=new THREE.Mesh(new THREE.TorusGeometry(.0268,.0027,6,30),new THREE.MeshStandardMaterial({color:0x536b64,roughness:.96}));
 t.scale.set(1,.75,1);t.rotation.x=Math.PI/2;t.position.y=-.006;parent.add(t);
}
function housecoat(parent,spec){
 const geo=new THREE.CylinderGeometry(.112,.184,.44,36,12,true),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),y=p.getY(i),a=Math.atan2(z,x),wave=.005*Math.sin(a*12+y*8)*(1-(y+.22)/.60);
  p.setXYZ(i,x+Math.cos(a)*wave,y-.36,z*.68+Math.sin(a)*wave);
 }
 geo.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({color:spec.clothes.shirt,roughness:.98,side:THREE.DoubleSide});
 const robe=new THREE.Mesh(geo,material);robe.castShadow=true;parent.add(robe);
 const seam=new THREE.Mesh(new THREE.CylinderGeometry(.0018,.0018,.41,6),new THREE.MeshStandardMaterial({color:0x7d8974,roughness:1}));
 seam.position.set(.027,-.36,-.097);seam.rotation.x=-.08;parent.add(seam);
}
export function portrait(person,spec,base) {
 const elder=spec.name==='MRS. LANGE';
 const face=base.face,details=new THREE.Group(),chest=new THREE.Group(),wrist=new THREE.Group();
 details.name='c7-face-details';chest.name='c7-wardrobe';wrist.name='c7-wrist';
 const dark=new THREE.MeshStandardMaterial({color:new THREE.Color(spec.face.skin).multiplyScalar(.37),roughness:.90});
 for(const side of [-1,1]){
  feature(details,dark,side*.008,-.031,-.103,.0037,.00145,.0014);
  if(spec.name==='JAMIE')for(let k=0;k<6;k++){
   const x=.036+k*.0046,y=-.011-.004*Math.sin(k*2+side),z=-.085+Math.pow(x/.085,2)*.037;
   feature(details,dotMat,side*x,y,z,.00095,.00065,.0007);
  }
 }
 if(spec.name==='JAMIE'){
  shirtTransfer(chest);
  const thread=new THREE.MeshStandardMaterial({color:0xc6c8a7,roughness:.90});
  const badge=new THREE.Mesh(new THREE.TorusGeometry(.008,.0016,6,18),thread);
  badge.scale.set(.82,1,1);badge.position.set(0,.090,-.106);details.add(badge);
 }

 if(person.firstPerson)wristband(wrist);
 if(elder){
  const pin=new THREE.MeshStandardMaterial({color:0xb9ac85,roughness:.44,metalness:.24});
  const bun=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),new THREE.MeshStandardMaterial({color:0x918d82,roughness:.88}));
  bun.position.set(0,.016,.087);bun.scale.set(.050,.046,.030);details.add(bun);
  for(const s of [-1,1]){const clip=feature(details,pin,s*.022,.029,.112,.023,.0018,.001);clip.rotation.z=s*.45;}
  feature(chest,pin,.060,.131,-.066,.012,.008,.004);
  housecoat(chest,spec);
  const crease=new THREE.MeshStandardMaterial({color:0xa2917e,roughness:.93});
  for(let row=0;row<3;row++)for(const side of [-1,1]){
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.012,.049+row*.008,-.078),new THREE.Vector3(side*.032,.052+row*.008,-.077),new THREE.Vector3(side*.054,.047+row*.008,-.070)]);
   details.add(new THREE.Mesh(new THREE.TubeGeometry(curve,10,.00055,4),crease));
  }
 }
 const teeth=feature(details,new THREE.MeshStandardMaterial({color:elder?0xb4ae90:0xd6ceba,roughness:.69}),0,-.058,-.087,.015,.0015,.0015);teeth.visible=false;
 if(person.firstPerson)details.traverse(n=>n.layers.set(1));
 let active=false,original=null;
 const savedFace=new Map();
 function enable(on) {
  if(active===on)return;active=on;
  const h=person.parts.head,t=person.parts.torso,r=person.parts.rhand,l=person.parts.lhand;
  const hair=base.face.g.parent.getObjectByName('c6-hair');
  if(!on){
   h.geometry=original.head;t.geometry=original.torso;if(hair)hair.geometry=original.hair;r.geometry=original.r;l.geometry=original.l;
   for(let i=0;i<face.eyes.length;i++){face.eyes[i].e.position.copy(original.eye[i]);face.eyes[i].e.scale.copy(original.scale[i]);face.eyes[i].brow.position.z=original.brow[i];}
   face.mouth.position.copy(original.mouth);face.mouth.scale.copy(original.mouthScale);
   for(const [node,v] of savedFace){node.position.copy(v.p);node.quaternion.copy(v.q);node.scale.copy(v.s);node.visible=v.v;}savedFace.clear();
   details.removeFromParent();chest.removeFromParent();wrist.removeFromParent();original=null;open=0;return;
  }
  face.g.traverse(node=>savedFace.set(node,{p:node.position.clone(),q:node.quaternion.clone(),s:node.scale.clone(),v:node.visible}));
  original={head:h.geometry,torso:t.geometry,hair:hair?.geometry,brow:face.eyes.map(e=>e.brow.position.z),l:l.geometry,r:r.geometry,eye:face.eyes.map(e=>e.e.position.clone()),scale:face.eyes.map(e=>e.e.scale.clone()),mouth:face.mouth.position.clone(),mouthScale:face.mouth.scale.clone()};
  if(hair&&spec.hair.style==='cap')hair.geometry=capShape(hair.geometry);
  h.geometry=portraitSkin(h.geometry,elder);t.geometry=garment(t.geometry);l.geometry=weatherHand(l.geometry);r.geometry=weatherHand(r.geometry);
  face.g.add(details);t.add(chest);l.add(wrist);
  for(const e of face.eyes){e.e.position.z-=.0060;e.e.scale.set(1.12,1.08,1);e.brow.position.z-=.008;}
  face.mouth.position.z-=.0038;face.mouth.scale.set(1.06,1.22,1);
 }
 let open=0;
 function update(dt,{clock=0}={}){
  if(!active||!person.group.visible)return;
  const expression=person.face?.expression||'neutral',ex=EXPRESSIONS[expression]||{},spoken=person.face?.openness||0;
  open=damp(open,clamp(spoken,0,1),18,dt);
  const [cavity,top,bottom,...corners]=face.mouth.children;
  // The same caption-driven mouth envelope reaches the reconstructed face.
  // A held fear expression must still read during pauses between words.
  const k=elder?Math.max(.68,open):open;
  cavity.scale.y=.001+k*(elder?.027:.012);cavity.scale.x=elder?.014:.020*(ex.wide||1);
  top.position.y=.002+k*(elder?.009:.003);
  bottom.position.y=-.003-k*(elder?.035:.015);
  bottom.scale.x=elder?.014:.019*(ex.wide||1);
  top.scale.x=elder?.015:.021*(ex.wide||1);
  corners.forEach((corner,i)=>{corner.position.y=(ex.smile||0)*.0035-k*(elder?.012:.002);corner.position.x=(i?1:-1)*(elder?.014:.019);});
  teeth.visible=k>.19;teeth.position.y=face.mouth.position.y+top.position.y-.0015;
  teeth.scale.x=elder?.010:.014;teeth.scale.y=elder?.0025:.0013;teeth.position.z=face.mouth.position.z-.004;
  for(const eye of face.eyes){
   eye.brow.rotation.z=eye.s*(.08+(ex.tilt||0)*.38-(ex.knit||0)*.17);
   eye.brow.position.y=.019+(ex.browY||0)*.8;
   if(elder){
    eye.whites.scale.y=.0063;eye.iris.scale.set(.0039,.0046,.0017);eye.pupil.scale.set(.002,.0028,.0008);
    eye.upper.position.y=.0056;eye.upper.scale.y=.0013;eye.glint.visible=true;
    eye.brow.rotation.z=eye.s*.08+(eye.s<0?.11:-.04);
   }
  }
 }
 return {enable,update,person};
}

