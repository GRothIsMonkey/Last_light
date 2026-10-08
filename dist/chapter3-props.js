// Close-view prop work. No interaction bounds, destinations, or story timing live here.
import * as THREE from './three.module.js';
import {mergeParts} from './rig.js';
import {artSurface} from './art-surfaces.js';
import {seeded,roundedBoxGeometry} from './kit.js';

function batch(group,name,material){
 group.updateMatrixWorld(true);const inv=group.matrixWorld.clone().invert(),parts=[];
 group.traverse(o=>{if(o.isMesh)parts.push({geo:o.geometry,color:o.material.color,matrix:inv.clone().multiply(o.matrixWorld)});});
 const mesh=new THREE.Mesh(mergeParts(parts),material||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:.12}));mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;
 group.clear();group.add(mesh);return mesh;
}
function wheelGeometry(K,bike,aged){
 const R=bike.geom.wheelR,g=new THREE.Group(),tire=aged?0x383932:(bike.spec.tire??0x292a29),rubber=K.mat(tire),metal=K.mat(aged?0x7c8072:0xb2b5af);
 const tor=(r,t,m)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,64),m);o.rotation.y=Math.PI/2;g.add(o);};
 tor(R-.025,.027,rubber);tor(R-.052,.009,metal);
 for(const e of [-1,1]){const o=new THREE.Mesh(new THREE.TorusGeometry(R-.039,.002,5,64),K.mat(aged?0x686a57:0x4c4f48));o.rotation.y=Math.PI/2;o.position.x=e*.024;g.add(o);}
 K.cyl(g,0,0,0,.019,.1,metal,16,[0,0,Math.PI/2]);
 if(bike.spec.extras?.includes('knobby'))for(let k=0;k<56;k++){const a=k/56*Math.PI*2,o=K.rbox(g,0,Math.sin(a)*(R-.001),Math.cos(a)*(R-.001),.043,.008,.018,.003,tire);o.rotation.x=-a;}
 const m=batch(g,'wheel');return m.geometry;
}
export function refineChapterThreeProps({C,companions,K,swaps,details}){
 const old=C.old,G=old.geom,rnd=seeded(40717);
 for(const bike of [old,...companions.map(c=>c.bike)]){
  const aged=bike===old;
  for(const wheel of [bike.frontWheel,bike.rearWheel]){const mesh=wheel.children.find(o=>o.isMesh);swaps.push({o:mesh,prop:'geometry',old:mesh.geometry,next:wheelGeometry(K,bike,aged)});}
  const detail=new THREE.Group();detail.name=aged?'old-bike-hardware':'chapter3-bike-hardware';bike.frame.add(detail);details.push(detail);detail.visible=false;
  const gb=bike.geom,metal=aged?0x787567:0x929891;
  // Seat rails, cable clips, bottom bracket, a small rear brake caliper.
  for(const e of [-1,1]){K.rod(detail,[e*.026,gb.saddle[1]-.035,gb.saddle[2]-.07],[e*.026,gb.saddle[1]-.035,gb.saddle[2]+.07],.004,metal,.004,8);
   K.rod(detail,[e*.07,gb.wheelR+.11,gb.rear],[e*.032,gb.wheelR+.22,gb.rear-.02],.008,metal,.006,9);
   K.rbox(detail,e*.051,gb.wheelR+.09,gb.rear,.014,.026,.05,.004,0x292a24);}
  K.cyl(detail,0,gb.bb[1],gb.bb[2],.037,.12,metal,20,[0,0,Math.PI/2]);
  batch(detail,detail.name);
 }
 // Aged coatings act on the original vertex colours, keeping its sage paint identity.
 old.group.traverse(o=>{if(!o.isMesh||!o.material?.isMeshStandardMaterial)return;o.material.roughness=Math.max(.64,o.material.roughness);o.material.metalness=Math.min(.12,o.material.metalness);artSurface(o.material,'oxidized');});
 const wear=new THREE.Group();old.frame.add(wear);wear.name='old-bike-worn-fittings';
 const seat=new THREE.Vector3(0,G.saddle[1]-.15,G.saddle[2]-.04),head=new THREE.Vector3(0,G.pivot[1]+.16,G.pivot[2]+.045),bb=new THREE.Vector3(...G.bb);
 for(const [a,b,r] of [[seat,head,.024],[bb,seat,.024],[bb,head,.028]]){
  const dir=b.clone().sub(a).normalize(),u=new THREE.Vector3(1,0,0),v=new THREE.Vector3().crossVectors(dir,u).normalize();
  for(let k=0;k<22;k++){const t=rnd(),p=a.clone().lerp(b,t),ang=rnd()*Math.PI*2,n=u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v,Math.sin(ang));p.addScaledVector(n,r+.0005);
   const flake=new THREE.Mesh(new THREE.CircleGeometry(.003+rnd()*.006,7),K.mat(rnd()<.58?0x785034:0x9ba18a));flake.position.copy(p);flake.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);flake.scale.y=.45+rnd();wear.add(flake);}}
 // Cracked leather, contrasting stitched edge; no supernatural marks or new clue.
 for(const e of [-1,1])for(let k=0;k<10;k++)K.rod(wear,[e*.05,G.saddle[1]+.025,G.saddle[2]-.07+k*.016],[e*.05,G.saddle[1]+.025,G.saddle[2]-.065+k*.016],.0012,0x85755d,.0012,5);
 const chain=new THREE.CatmullRomCurve3([new THREE.Vector3(.064,G.bb[1]+.081,G.bb[2]),new THREE.Vector3(.064,G.wheelR+.037,G.rear),new THREE.Vector3(.064,G.wheelR-.037,G.rear),new THREE.Vector3(.064,G.bb[1]-.081,G.bb[2])],true,'centripetal');
 for(let i=0;i<78;i++){const p=chain.getPoint(i/78),o=new THREE.Mesh(new THREE.TorusGeometry(.004,.0015,4,8),K.mat(i%5?0x494638:0x796343));o.rotation.y=Math.PI/2;o.position.copy(p);wear.add(o);}
 batch(wear,'old-bike-worn-fittings',artSurface(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:.08}),'oxidized'));
 const bell=new THREE.Group();old.steer.add(bell);bell.position.copy(old.bell.position);
 K.cyl(bell,0,-.004,0,.028,.012,0x554b3b,24);K.ball(bell,0,.007,0,.027,0x8c795b,[1,.55,1],true);
 K.cyl(bell,0,.023,0,.004,.003,0x484235,8);K.rod(bell,[-.018,.012,.015],[-.006,.019,.02],.0012,0x4a3726,.0012,5);
 batch(bell,'old-bike-broken-bell',artSurface(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.12}),'oxidized'));
 // The existing screen and recorder remain. Only the plastic shell and hardware change.
 const phone=C.phone,screen=phone.getObjectByName('alex-phone-screen'),lid=screen.parent;
 const base=phone.children.find(o=>o.isMesh),top=lid.children.find(o=>o.isMesh&&o!==screen);
 base.geometry=roundedBoxGeometry(.052,.013,.094,.006);top.geometry=roundedBoxGeometry(.052,.009,.088,.004);
 base.material.metalness=.12;base.material.roughness=.54;top.material=base.material;
 const phoneDetail=new THREE.Group();phone.add(phoneDetail);
 K.cyl(phoneDetail,0,.013,-.043,.007,.053,0x60656b,24,[0,0,Math.PI/2]);
 for(const e of [-1,1])K.cyl(phoneDetail,e*.0255,.013,-.043,.005,.002,0xa8aaab,16,[0,0,Math.PI/2]);
 K.rbox(phoneDetail,0,.014,-.027,.014,.003,.013,.003,0x9fa6a8);K.rbox(phoneDetail,0,.016,-.027,.008,.002,.007,.002,0x343940);
 for(const e of [-1,1])K.rbox(phoneDetail,e*.017,.014,-.027,.007,.002,.009,.002,e<0?0x536959:0x864f4a);
 batch(phoneDetail,'phone-hinge-and-controls');
 const lidDetail=new THREE.Group();lid.add(lidDetail);
 for(let i=0;i<5;i++)K.box(lidDetail,-.008+i*.004,.01,-.077,.002,.001,.003,0x202529);
 K.box(lidDetail,0,.01,-.021,.024,.001,.004,0x4e5358);batch(lidDetail,'phone-earpiece');
 // Hinges, anchor plates, bolt heads, and the latch move with the existing gate pivots.
 const gate=C.gate,fixed=new THREE.Group();gate.add(fixed);
 for(const e of [-1,1])for(const y of [.23,1.14,2.11]){K.rbox(fixed,e*1.1,y,0,.15,.15,.025,.012,0x625d4c);
  K.cyl(fixed,e*1.1,y,.04,.033,.14,0x82765e,16);for(const dy of [-.048,.048])K.cyl(fixed,e*1.1,y+dy,.019,.012,.012,0x9e8d6b,6,[Math.PI/2,0,0]);}
 batch(fixed,'gate-hinges-and-anchors',artSurface(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:.18}),'oxidized'));
 const leaves=gate.children.filter(g=>g.isGroup&&Math.abs(g.position.x)>1);
 for(const pivot of leaves){const e=Math.sign(pivot.position.x),g=new THREE.Group();pivot.add(g);K.rbox(g,-e*1.04,1.04,.047,.15,.1,.026,.007,0x827662);K.cyl(g,-e*1.04,1.04,.065,.011,.014,0xa29476,6,[Math.PI/2,0,0]);batch(g,'gate-latch-hardware');}
 return {update(on){/* Shader swaps are owned by chapter3-art; scene props follow their story parents. */}};
}
