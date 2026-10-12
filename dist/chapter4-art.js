// Chapter Four presentation only. No movement, story timers, creature pose or interaction bounds.
import * as THREE from './three.module.js';
import {createKit} from './kit.js';
import {artSurface} from './art-surfaces.js';
import {childHead,shirtGeometry} from './chapter3-art.js';
import {CAST} from './cast.js';
import {mergeDirect} from './town-props.js';

export function createChapterFourArt({scene,world,chapter,chapter3,chapter4,camera,nav}){
 const K=createKit(),C=chapter4,details=new THREE.Group();details.name='chapter4-domestic-detail';details.visible=false;scene.add(details);
 const H=world.homes.sam,x=H.gx??H.w*.32,z=H.gfront??H.front,p=H.toWorld(x,z),p2=H.toWorld(x,z+1),garage=new THREE.Group();details.add(garage);garage.position.set(p.x,p.ground,p.z);garage.rotation.y=Math.atan2(p2.x-p.x,p2.z-p.z);
 const shelf=K.mat(0x6e6757,{roughness:.84}),steel=K.mat(0x787e79,{roughness:.63,metalness:.2});
 // Shallow storage at the back of the existing garage, clear of Mom and the backpack.
 for(const xx of [-1.6,1.55])for(let k=0;k<3;k++){K.box(garage,xx,.45+k*.65,-4.05,.78,.06,.5,shelf);for(const e of [-1,1])K.box(garage,xx+e*.35,1.05,-4.05,.04,2.1,.5,steel);}
 for(let j=0;j<5;j++){K.rbox(garage,-1.8+(j%2)*.32,.64+Math.floor(j/2)*.65,-4.06,.27,.3,.3,.025,[0xb1946c,0x526b77,0x8c7060][j%3]);K.box(garage,-1.8+(j%2)*.32,.67+Math.floor(j/2)*.65,-3.901,.16,.08,.005,0xc4baa0);}
 K.rbox(garage,1.55,.62,-4.02,.65,.28,.4,.035,0x54717d);K.box(garage,1.55,.78,-4.02,.66,.05,.41,0xc6c6b8);
 // Folded lawn chair and a basketball, tucked under the back shelf.
 for(const e of [-1,1])K.rod(garage,[1.55+e*.23,.05,-3.87],[1.55+e*.23,1.05,-3.93],.018,steel);K.box(garage,1.55,.77,-3.93,.47,.45,.025,0x948971);K.ball(garage,-1.46,.13,-3.7,.13,0x9e663d,[1,1,1],true);
 mergeDirect(garage,'sam-garage-storage');
 // Improve only Chapter Four's separate apparent-Alex and photo performers.
 for(const [key,person] of [['alex',C.AX.person],...Object.entries(C.photo.who)]){
  person.parts.head.geometry=childHead(CAST[key]);person.parts.torso.geometry=shirtGeometry(CAST[key]);
  for(const n of ['torso','lsleeve','rsleeve','pelvis','lthigh','rthigh'])person.parts[n].material=artSurface(person.parts[n].material.clone(),'textile');
  for(const lid of person.lids)lid.position.set(Math.sign(lid.position.x)*.033,.014,-.09);
 }
 // The camera's fabric wrist strap and backpack retain their original geometry and colours.
 C.bag.traverse(o=>{if(o.isMesh&&o.material.roughness>.7)o.material=artSurface(o.material.clone(),'textile');});
 for(const n of ['torso','lsleeve','rsleeve','lthigh','rthigh','lshin','rshin'])C.samMom.person.parts[n].material=artSurface(C.samMom.person.parts[n].material.clone(),'textile');
 const companions=[chapter.kit.jamie,chapter.kit.sam],stitches=[];
 for(const c of companions){const g=new THREE.Group(),shade=new THREE.Color(CAST[c.key].clothes.shirt).multiplyScalar(.76).getHex();g.name='chapter4-clothing-detail';g.visible=false;c.person.parts.torso.add(g);stitches.push(g);
  for(const side of [-1,1])K.rod(g,[side*.104,-.13,-.043],[side*.129,.1,-.045],.0011,shade,.0011,5);
  K.rod(g,[-.09,-.143,-.066],[.09,-.143,-.066],.0011,shade,.0011,5);mergeDirect(g,'chapter4-shirt-seams');}
 // Contact for the separate apparent Alex. The shared companion/creature contacts remain owned by Chapter Three art.
 const n=48,pixels=new Uint8Array(n*n*4);for(let j=0;j<n;j++)for(let i=0;i<n;i++){const r=Math.hypot((i+.5)/n*2-1,(j+.5)/n*2-1),k=(j*n+i)*4;pixels[k]=pixels[k+1]=pixels[k+2]=4;pixels[k+3]=Math.max(0,1-r)**2*180;}
 const tex=new THREE.DataTexture(pixels,n,n);tex.needsUpdate=true;
 const contact=new THREE.Mesh(new THREE.PlaneGeometry(.68,.75),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:.48,polygonOffset:true,polygonOffsetFactor:-6}));contact.rotation.x=-Math.PI/2;contact.visible=false;contact.name='apparent-alex-contact';scene.add(contact);
 const momContact=contact.clone();momContact.name='chapter4-mom-contact';scene.add(momContact);
 let bikeCopied=false;
 function photoBike(){if(bikeCopied)return;bikeCopied=true;const src=chapter3.old,dst=C.photo.old;
  for(const [a,b] of [[src.frontWheel,dst.frontWheel],[src.rearWheel,dst.rearWheel]]){const sm=a.children.find(o=>o.isMesh),dm=b.children.find(o=>o.isMesh);dm.geometry=sm.geometry;}
  for(const [a,b] of [[src.frame,dst.frame],[src.steer,dst.steer]])for(const ch of a.children){if(ch.isGroup&&(ch.name.startsWith('old-bike')||ch.getObjectByName('old-bike-worn-fittings')||ch.getObjectByName('old-bike-broken-bell'))){const c=ch.clone(true);c.visible=true;b.add(c);}}
  dst.group.traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial){const m=o.material.clone();m.roughness=Math.max(.64,m.roughness);m.metalness=Math.min(.12,m.metalness);o.material=artSurface(m,'oxidized');}});
 }
 return {update(){const on=/^(c4|d4|e4|n4)-/.test(chapter.phase());details.visible=on&&camera.position.distanceTo(garage.position)<85;if(on)photoBike();
  contact.visible=on&&C.AX.person.group.visible;if(contact.visible){const p=C.AX.person.group.position;contact.position.set(p.x,nav.groundY(p.x,p.z)+.012,p.z);}
  momContact.visible=on&&C.samMom.visible;if(momContact.visible){const p=C.samMom.person.group.position;momContact.position.set(p.x,nav.groundY(p.x,p.z)+.012,p.z);}
  for(const g of stitches)g.visible=on;
  // Tiny breathing offsets follow the Chapter Four clock; feet and the established reaction poses stay authoritative.
  if(on)for(const c of companions)if(c.active&&c.mode==='foot'&&c.walkV<.08){const t=C.C.t+(c.key==='sam'?1.8:0),fear=/^(e4|n4)-/.test(chapter.phase());c.person.parts.torso.position.y+=Math.sin(t*(fear?4.5:2.5))*(fear?.0022:.0012);}
 },get state(){return {active:details.visible,photoBikeMatched:bikeCopied,apparentContact:contact.visible};}};
}
