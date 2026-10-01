// Adult-only presentation: the children's riding rig and proportions are untouched.
import * as THREE from './three.module.js';
import {mergeParts,material} from './rig.js';
import {roundedBoxGeometry} from './kit.js';

const matrix=(x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
function builder(){const p=[],ball=new THREE.SphereGeometry(1,20,14);return {p,
 ell(x,y,z,sx,sy,sz,c){p.push({geo:ball,color:c,matrix:matrix(x,y,z,sx,sy,sz)});},
 box(x,y,z,w,h,d,r,c,rz=0){p.push({geo:roundedBoxGeometry(w,h,d,r),color:c,matrix:matrix(x,y,z,1,1,1,0,0,rz)});},
 geo(){return mergeParts(p);}};}

export function refineAdult(person,spec,seed){
 const pr=person.parts,F=spec.face,H=spec.hair,skin=F.skin,officer=spec.name==='OFFICER',mom=spec.name.includes('MOM'),older=spec.name==='NEIGHBOR';
 const b=builder(),skull=new THREE.SphereGeometry(1,32,24),P=skull.attributes.position;
 for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const jaw=1-.21*Math.max(0,-y),width=mom?.083:.089;
  x*=width*jaw;y*=.126;z*=z<0?.097:.1;
  // A flatter front plane and narrower lower jaw, with cheek and chin planes.
  if(z<-.05)z=-.05+(z+.05)*.68;
  if(y<-.067&&z<-.04)z-=.006;
  P.setXYZ(i,x,y,z);}
 skull.computeVertexNormals();b.p.push({geo:skull,color:skin});
 const shade=new THREE.Color(skin).multiplyScalar(.91).getHex();
 for(const s of [-1,1]){
  b.ell(s*.086,-.008,.008,.012,.029,.019,skin);b.ell(s*.093,-.011,-.001,.004,.016,.009,shade);
  b.ell(s*.033,.012,-.081,.014,.008,.005,0xdad7cb);b.ell(s*.033,.012,-.085,.0058,.007,.003,F.iris);b.ell(s*.033,.013,-.087,.0025,.004,.0015,0x17191b);
  b.ell(s*.039,-.012,-.079,.019,.014,.006,skin);
  b.ell(s*.013,-.034,-.104,.009,.009,.01,skin);
  b.box(s*.039,-.004,-.085,.019,.002,.001,.0003,shade,s*.12);
  if(older)b.box(s*.047,.034,-.082,.026,.0017,.001,.0003,shade,s*.08);
 }
 b.ell(0,-.008,-.093,.010,.027,.013,skin);b.ell(0,-.032,-.108,.012,.011,.011,skin);
 b.ell(0,-.091,-.067,mom?.026:.033,.019,.012,skin);
 b.ell(0,-.055,-.084,.024,.0035,.004,F.lips);b.ell(0,-.063,-.083,.022,.004,.005,F.lips);
 // Hair cap, sideburns, a natural hairline and modest gray at the temples.
 const hair=new THREE.SphereGeometry(1,28,16,0,Math.PI*2,0,1.36);b.p.push({geo:hair,color:H.color,matrix:matrix(0,.007,.011,.091,.129,.103)});
 for(const s of [-1,1]){b.ell(s*.08,.034,.025,.013,.048,.045,H.color);b.box(s*.084,.006,.0,.013,.038,.023,.005,H.color);}
 if(mom){b.ell(0,.005,.112,.031,.035,.033,H.color);b.ell(0,-.065,.134,.031,.079,.031,H.color);}
 else if(H.style==='swept'){b.ell(.014,.103,-.048,.058,.022,.04,H.color);for(const s of [-1,1])b.ell(s*.084,.027,.012,.004,.026,.018,0x96877a);}
 for(let k=0;k<8;k++){const a=k*.62;const c=new THREE.Color(H.color).multiplyScalar(1.02+(k%3)*.045).getHex();b.ell(Math.sin(a)*.067,.113-Math.abs(Math.sin(a))*.012,Math.cos(a)*.067,.018,.01,.028,c);}
 pr.head.geometry=b.geo();pr.head.userData.adult=true;
 // Subtle independent mouth opening and brow lifts; no phoneme or voice-acting claim.
 const mouth=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),material(0x50362e));mouth.position.set(0,-.059,-.087);mouth.scale.set(.019,.0025,.0015);pr.head.add(mouth);
 const brows=[];for(const s of [-1,1]){const brow=new THREE.Mesh(roundedBoxGeometry(.029,.005,.004,.001),material(H.color));brow.position.set(s*.034,.033,-.086);brow.rotation.z=s*(mom?.14:older?.05:.07);pr.head.add(brow);brows.push(brow);}
 person.lids.forEach((l,i)=>{l.position.set((i?1:-1)*.033,.012,-.088);l.scale.set(.015,.009,.002);});
 // A shirt with a collar, button placket, pockets and cloth folds. A wider shoulder line and
 // flatter lower torso read as an adult without changing IK limb lengths or foot contact.
 const c=spec.clothes,t=builder(),cloth=c.shirt,edge=new THREE.Color(cloth).multiplyScalar(.79).getHex();
 t.box(0,-.01,0,.285,.365,.174,.065,cloth);t.ell(0,.133,.004,.176,.085,.094,cloth);
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
 const parts=Object.values(pr),mouthBase=mouth.scale.y;
 return {mouth,brows,phone,far,near:true,update(dt,{talk=0,time=0,eye,gesture}={}){
  const distance=eye?eye.distanceTo(person.group.position):0;this.near=distance<(this.near?49:43);for(const m of parts)m.visible=this.near;far.visible=!this.near;
  phone.visible=gesture==='phone';mouth.visible=distance<20;brows.forEach((m,i)=>{m.visible=distance<24;m.position.y=.033+(talk>0?.0015*Math.sin(time*3.1+i):0);});
  mouth.scale.y+=(mouthBase*(talk>0?1.6+1.3*Math.abs(Math.sin(time*8.3+seed)):1)-mouth.scale.y)*(1-Math.exp(-18*dt));
 }};
}
