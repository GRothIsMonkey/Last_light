// Adult-only presentation: the children's riding rig and proportions are untouched.
import * as THREE from './three.module.js';
import {material} from './rig.js';
import {adultHead,animatedAdultLips} from './adult-sculpt.js';
import {mergeArt,artLoft} from './astra-anatomy.js';
import {roundedBoxGeometry} from './kit.js';

const matrix=(x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
function builder(){const p=[],ball=new THREE.SphereGeometry(1,20,14);return {p,
 ell(x,y,z,sx,sy,sz,c){p.push({geo:ball,color:c,matrix:matrix(x,y,z,sx,sy,sz)});},
 box(x,y,z,w,h,d,r,c,rz=0){p.push({geo:roundedBoxGeometry(w,h,d,r),color:c,matrix:matrix(x,y,z,1,1,1,0,0,rz)});},
 geo(){return mergeArt(p);}};}

export function refineAdult(person,spec,seed){
 const pr=person.parts,F=spec.face,H=spec.hair,skin=F.skin,officer=spec.name==='OFFICER',mom=spec.name.includes('MOM'),older=spec.name==='NEIGHBOR';
 pr.head.geometry=adultHead(spec);pr.head.userData.adult=true;
 // Subtle independent mouth opening and brow lifts; no phoneme or voice-acting claim.
 const mouth=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),material(0x50362e));mouth.position.set(0,-.059,-.087);mouth.scale.set(.019,.0025,.0015);pr.head.add(mouth);const lips=animatedAdultLips(pr.head,F.lips);
 const brows=[];for(const s of [-1,1]){const brow=new THREE.Mesh(roundedBoxGeometry(.029,.005,.004,.001),material(H.color));brow.position.set(s*.034,.033,-.086);brow.rotation.z=s*(mom?.14:older?.05:.07);pr.head.add(brow);brows.push(brow);}
 person.lids.forEach((l,i)=>{l.position.set((i?1:-1)*.033,.012,-.088);l.scale.set(.015,.009,.002);});
 // A shirt with a collar, button placket, pockets and cloth folds. A wider shoulder line and
 // flatter lower torso read as an adult without changing IK limb lengths or foot contact.
 const c=spec.clothes,t=builder(),cloth=c.shirt,edge=new THREE.Color(cloth).multiplyScalar(.79).getHex();
 t.p.push({geo:artLoft([[-.204,.126,.077],[-.16,.138,.086],[.04,.15,.089],[.13,.175,.091],[.17,.161,.073],[.20,.045,.041]],36,4,2.7),color:cloth});
 for(const s of [-1,1]){t.box(s*.053,.177,-.054,.063,.024,.074,.006,cloth,s*.23);t.box(s*.078,.027,-.089,.082,.079,.011,.008,cloth);t.box(s*.078,.067,-.098,.084,.012,.005,.003,edge);}
 t.box(0,.035,-.09,.016,.269,.005,.001,edge);for(let i=0;i<5;i++)t.ell(0,.145-i*.054,-.095,.0032,.0032,.002,0xadaeaa);
 for(const s of [-1,1])for(let k=0;k<2;k++)t.box(s*.104,-.12+k*.025,-.068,.055,.006,.007,.002,edge,s*.3);
 if(officer){
  t.box(0,-.184,0,.31,.049,.184,.017,0x191c21);t.box(0,-.184,-.098,.041,.035,.01,.004,0xb3ac89);
  t.ell(-.076,.118,-.103,.018,.023,.005,0xa99c60);t.box(.076,.102,-.102,.045,.011,.003,.001,0xc6c3a7);
  t.box(-.154,-.175,-.004,.052,.09,.06,.011,0x151a20);t.box(.145,-.166,.031,.052,.072,.043,.009,0x151a20);
  t.box(-.122,.133,-.07,.04,.05,.023,.006,0x13191d);
  for(const s of [-1,1])t.box(s*.13,.173,.016,.075,.015,.054,.004,edge);
 }
 pr.torso.geometry=t.geo();pr.torso.userData.adult=true;
 pr.neck.scale.set(1.06,1.05,1.04);
 // Cordless handset used only by Alex's mother.
 const phone=new THREE.Mesh(roundedBoxGeometry(.047,.145,.027,.007),material(0x33363a));phone.position.set(0,.05,-.025);phone.rotation.x=.3;phone.visible=false;pr.rhand.add(phone);
 // Coherent far silhouette: one batch, no tiny moving face or individual finger calls.
 const farB=builder();farB.ell(0,1.382,-.015,.088,.13,.091,skin);farB.ell(0,1.456,.006,.091,.065,.096,H.color);farB.box(0,1.031,0,.32,.445,.18,.045,cloth);
 for(const s of [-1,1]){farB.box(s*.088,.44,.0,.116,.77,.13,.04,c.pants);farB.box(s*.192,1.0,0,.087,.44,.09,.035,cloth);farB.box(s*.192,.756,-.004,.065,.19,.07,.028,skin);farB.box(s*.085,.045,-.054,.09,.09,.21,.018,c.shoes);}
 const far=new THREE.Mesh(farB.geo(),pr.head.material);far.name='adult-distance-silhouette';far.visible=false;person.group.add(far);
 const parts=Object.values(pr),mouthBase=mouth.scale.y,handInv=new THREE.Quaternion();
 return {mouth,brows,phone,far,syncMouth:()=>lips.update(mouth),near:true,update(dt,{talk=0,time=0,eye,gesture}={}){
  const distance=eye?eye.distanceTo(person.group.position):0;this.near=distance<(this.near?49:43);for(const m of parts)m.visible=this.near;far.visible=!this.near;
  phone.visible=gesture==='phone';if(phone.visible){handInv.copy(pr.rhand.quaternion).invert();phone.quaternion.copy(handInv).multiply(pr.head.quaternion);phone.position.set(.107,-.028,.005).applyQuaternion(pr.head.quaternion).add(pr.head.position).sub(pr.rhand.position).applyQuaternion(handInv);}
  mouth.visible=distance<20;brows.forEach((m,i)=>{m.visible=distance<24;m.position.y=.033+(talk>0?.0015*Math.sin(time*3.1+i):0);});
  mouth.scale.y+=(mouthBase*(talk>0?1.6+1.3*Math.abs(Math.sin(time*8.3+seed)):1)-mouth.scale.y)*(1-Math.exp(-18*dt));lips.update(mouth);
 }};
}
