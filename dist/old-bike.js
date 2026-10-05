// The old bicycle that is not supposed to be there: under the oak after the call in the prologue, and
// (Chapter Three) leaning against the wall far inside the storm drain the next night. One build for both, so it is the
// same bike to the last detail: a faded sage-green kid's road bike from decades ago, swept bars, a
// cracked brown saddle, grips worn pale, tires gone hard and grey, rust coming through at every joint,
// a dull bell rusted solid, "AR" scratched into the top tube, and a city bicycle-license sticker on
// the seat tube, its year worn away. Nothing on it explains anything.
import * as THREE from './three.module.js';
import {createBike,poseBike,mergeParts} from './rig.js';
import {seeded} from './kit.js';

export const OLD_BIKE={style:'road-kid',frame:0x7a8a6e,bars:'swept',wheelR:.3,saddle:0x3a2e26,grips:0x8a8272,tire:0x3a3a38,extras:['bell'],bellColor:0x6e5a44};
export function makeOldBike(){const b=createBike(OLD_BIKE),G=b.geom,rand=seeded(1987);
 const V=(x,y,z)=>new THREE.Vector3(x,y,z),bb=V(...G.bb),seat=V(0,G.saddle[1]-.15,G.saddle[2]-.04),head=V(0,G.pivot[1]+.16,G.pivot[2]+.045),rear=V(0,G.wheelR,G.rear);
 // Rust where water sat: the bottom bracket, the dropouts, the joints; dust and faded patches along the tubes.
 const parts=[],speck=(p,r,c,flat=[1,1,1])=>parts.push({geo:new THREE.IcosahedronGeometry(r,0),color:c,matrix:new THREE.Matrix4().compose(p,new THREE.Quaternion(),V(...flat))});
 for(const [a,b2,n,c] of [[bb,seat,8,0x7a4a2c],[bb,head,9,0x8a5a36],[seat,head,7,0x8a5a36],[bb,rear,6,0x6e4228],[seat,rear,6,0x6e4228]])for(let k=0;k<n;k++){const q=a.clone().lerp(b2,rand());q.x+=(rand()<.5?-1:1)*.017;speck(q,.006+rand()*.007,rand()<.7?c:0x9a9686,[.5,1,1]);}
 for(let k=0;k<7;k++){const q=bb.clone().add(V((rand()-.5)*.05,(rand()-.5)*.05,(rand()-.5)*.05));speck(q,.01+rand()*.008,0x6a3e24);}
 for(const q of [rear,V(0,G.wheelR,G.front??(G.pivot[2]+.3))])for(let k=0;k<4;k++)speck(q.clone().add(V((rand()-.5)*.03,(rand()-.5)*.03,(rand()-.5)*.03)),.008,0x5e3820);
 const m=new THREE.Mesh(mergeParts(parts),new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));m.name='old-bike-rust';b.frame.add(m);
 // A crack across the saddle.
 const crack=new THREE.Mesh(new THREE.BoxGeometry(.004,.003,.07),new THREE.MeshStandardMaterial({color:0x8a7a62,roughness:1}));crack.position.set(.01,G.saddle[1]+.028,G.saddle[2]-.02);crack.rotation.y=.4;b.frame.add(crack);
 // The license sticker on the seat tube, washed out (number legible, the year not).
 const tex=(()=>{try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=96;c.height=64;g.fillStyle='#c9c2a2';g.fillRect(0,0,96,64);g.fillStyle='#6e2e26';g.fillRect(0,0,96,14);
  g.fillStyle='#e8e0c8';g.font='bold 10px Arial';g.textAlign='center';g.fillText('BICYCLE LICENSE',48,11);g.fillStyle='#4a3e30';g.font='bold 22px Arial';g.fillText('No 0417',48,38);g.font='9px Arial';g.fillText('OAK HOLLOW TWP.',48,51);g.fillStyle='rgba(201,194,162,.85)';g.fillRect(56,53,40,11);g.fillStyle='#7a6a54';g.fillText('19',36,61);
  for(let k=0;k<40;k++){g.fillStyle=`rgba(150,140,110,${.1+Math.random()*.2})`;g.fillRect(Math.random()*96,Math.random()*64,2+Math.random()*12,1+Math.random()*4);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})();
 const sticker=new THREE.Mesh(new THREE.PlaneGeometry(.056,.037),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xb8b096,map:tex,roughness:.9}));sticker.name='old-bike-license';
 {const q=bb.clone().lerp(seat,.45);sticker.position.set(.0235,q.y,q.z);sticker.rotation.set(-Math.atan2(seat.z-bb.z,seat.y-bb.y),Math.PI/2,0,'YXZ');b.frame.add(sticker);}
 // "AR" scratched into the top tube, as it always was.
 const tag=new THREE.Group();tag.name='other-bike-initials';tag.position.set(.029,.67,-.03);tag.rotation.y=Math.PI/2;const tp=[];
 for(const line of [[[0,0],[.022,.052],[.043,0]],[[.010,.023],[.033,.023]],[[.055,0],[.055,.052],[.086,.052],[.092,.033],[.055,.027],[.093,0]]])for(let i=0;i<line.length-1;i++)for(const [x,y] of [line[i],line[i+1]])tp.push(x,y,0);
 tag.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(tp,3)),new THREE.LineBasicMaterial({color:0xd9d3b9})));b.frame.add(tag);
 b.group.traverse(o=>{if(o.isMesh)o.castShadow=true;});poseBike(b);return b;}
