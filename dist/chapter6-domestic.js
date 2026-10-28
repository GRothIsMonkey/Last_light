// The rooms behind the original bedroom/hall, inside the same house footprint.
// Everything interactive has a visible physical state and is reset with the home.
import * as THREE from './three.module.js';
import {makeShapes,paper,bake,smooth} from './chapter6-kit.js';
import {roundedBoxGeometry} from './kit.js';
import {artSurface} from './art-surfaces.js';

export function createDomestic({root,FL,H,R,HL,D2,toW,solid}){
 const group=new THREE.Group();group.name='c6-domestic-interior';root.add(group);const K=makeShapes(),keep=new Set();
 const mat=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...o});
 const paint=mat(0xaebbb5),tile=mat(0xe1dfd1),wood=mat(0x97744e),white=mat(0xe9e4d7),chrome=mat(0xa6b0b3,{metalness:.75,roughness:.27}),dark=mat(0x353b3c),cotton=mat(0x7e9798);
 artSurface(paint,'plaster');artSurface(wood,'timber');artSurface(cotton,'textile');
 const round=(x,y,z,w,h,d,m,r=.03)=>{const o=new THREE.Mesh(roundedBoxGeometry(w,h,d,r),m);o.position.set(x,y,z);group.add(o);o.castShadow=o.receiveShadow=true;return o;};
 const B={x0:R.x0,x1:R.x1,z0:-D2+.18,z1:R.z0-.08},KT={x0:HL.x0,x1:HL.x1,z0:-D2+.18,z1:HL.z0-.08};
 const bathDoor=R.x1-.68,kitchenDoor=HL.x1-1;
 for(const [room,m] of [[B,tile],[KT,wood]]){K.box(group,(room.x0+room.x1)/2,FL-.010,(room.z0+room.z1)/2,room.x1-room.x0,.07,room.z1-room.z0,m);
  K.box(group,(room.x0+room.x1)/2,FL+H+.025,(room.z0+room.z1)/2,room.x1-room.x0,.05,room.z1-room.z0,white);
  K.box(group,room.x0-.03,FL+H/2,(room.z0+room.z1)/2,.06,H,room.z1-room.z0,paint);K.box(group,room.x1+.03,FL+H/2,(room.z0+room.z1)/2,.06,H,room.z1-room.z0,paint);
  K.box(group,(room.x0+room.x1)/2,FL+H/2,room.z0-.025,room.x1-room.x0,H,.05,paint);
  for(const x of [room.x0+.015,room.x1-.015])K.box(group,x,FL+.06,(room.z0+room.z1)/2,.025,.12,room.z1-room.z0,white);}
 // Tile grout, shallow enough to walk across. Bath enclosure, toilet, fittings.
 const grout=mat(0x929d99);for(let x=B.x0+.3;x<B.x1;x+=.3)K.box(group,x,FL+.027,(B.z0+B.z1)/2,.005,.002,B.z1-B.z0,grout);for(let z=B.z0+.3;z<B.z1;z+=.3)K.box(group,(B.x0+B.x1)/2,FL+.027,z,B.x1-B.x0,.002,.005,grout);
 const basinX=B.x1-.66,basinZ=B.z0+.32;
 // Hollow vanity: the wooden cabinet must not fill the recessed basin.
 for(const side of [-1,1])round(basinX+side*.49,FL+.40,basinZ,.04,.8,.55,wood,.01);
 round(basinX,FL+.40,basinZ-.255,.94,.8,.04,wood,.01);round(basinX,FL+.37,basinZ+.255,.94,.70,.04,wood,.01);round(basinX,FL+.055,basinZ,.94,.04,.51,wood,.01);
 const counterShape=new THREE.Shape();counterShape.moveTo(-.54,-.305);counterShape.lineTo(.54,-.305);counterShape.lineTo(.54,.305);counterShape.lineTo(-.54,.305);counterShape.closePath();const sinkHole=new THREE.Path();sinkHole.absellipse(0,-.02,.32,.22,0,Math.PI*2,true);counterShape.holes.push(sinkHole);
 const counter=new THREE.Mesh(new THREE.ExtrudeGeometry(counterShape,{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:32}),white);counter.rotation.x=-Math.PI/2;counter.position.set(basinX,FL+.815,basinZ);group.add(counter);solid(basinX,basinZ,.56,.32);
 const bowl=new THREE.Mesh(new THREE.SphereGeometry(1,28,18,0,Math.PI*2,Math.PI/2,Math.PI/2),mat(0xe9e4d7,{side:THREE.DoubleSide}));bowl.scale.set(.32,.13,.22);bowl.position.set(basinX,FL+.85,basinZ+.02);group.add(bowl);
 const basinInside=new THREE.Mesh(new THREE.CircleGeometry(.25,32),mat(0xb7c4c3));basinInside.rotation.x=-Math.PI/2;basinInside.scale.y=.65;basinInside.position.set(basinX,FL+.762,basinZ+.025);group.add(basinInside);
 K.cyl(group,basinX,FL+.764,basinZ+.04,.022,.003,chrome);K.pipe(group,[basinX,FL+.86,basinZ-.19],[basinX,FL+1.04,basinZ-.19],.012,chrome);K.pipe(group,[basinX,FL+1.04,basinZ-.19],[basinX,FL+1.04,basinZ+.015],.012,chrome);
 const tap=K.box(group,basinX+.1,FL+.91,basinZ-.17,.065,.012,.018,chrome);keep.add(tap);
 const stream=K.cyl(group,basinX,FL+.90,basinZ+.015,.006,.28,mat(0xc6e6ee,{transparent:true,opacity:.48,roughness:.12}));stream.visible=false;keep.add(stream);
 round(basinX,FL+1.53,B.z0+.04,.79,.91,.045,wood);K.plane(group,basinX,FL+1.53,B.z0+.069,.73,.85,mat(0x9dacaa,{metalness:.55,roughness:.32})); // frosted, no fake reflected player
 K.pipe(group,[basinX-.36,FL+2.07,B.z0+.12],[basinX+.36,FL+2.07,B.z0+.12],.028,mat(0xe4e0d6,{emissive:0xf0d7b2,emissiveIntensity:.5}));
 K.cyl(group,basinX-.38,FL+.93,basinZ-.05,.044,.14,mat(0x6d8e9b));
 const brush=new THREE.Group();brush.name='your-toothbrush';round(basinX+.38,FL+.88,basinZ+.08,.095,.045,.068,mat(0xccb78e));K.box(brush,0,.02,0,.013,.13,.008,mat(0x3b8a9b));K.box(brush,0,.095,-.001,.018,.037,.009,white);for(let i=0;i<5;i++)K.box(brush,0,.082+i*.006,-.007,.014,.003,.005,white);brush.position.set(basinX-.38,FL+.99,basinZ-.05);group.add(brush);keep.add(brush);
 // Toilet and shower remain background furniture, outside the usable walkway.
 const tx=B.x0+.44,tz=B.z0+.6;round(tx,FL+.2,tz,.38,.38,.52,white,.12);round(tx,FL+.43,tz,.41,.07,.54,white,.045);round(tx,FL+.68,tz-.2,.38,.49,.15,white,.035);solid(tx,tz,.25,.35);
 K.pipe(group,[B.x0+.025,FL+1.2,B.z1-.7],[B.x0+.025,FL+1.2,B.z1-.15],.012,chrome);K.box(group,B.x0+.045,FL+.91,B.z1-.43,.018,.58,.38,cotton);
 // Kitchen: counter, sink, a drying mug, kettle, tiled splashback and breakfast nook.
 const cz=(KT.z0+KT.z1)/2;round(KT.x0+.3,FL+.43,cz,.6,.86,KT.z1-KT.z0-.08,wood);round(KT.x0+.32,FL+.88,cz,.66,.045,KT.z1-KT.z0-.05,mat(0x9eaaa5));solid(KT.x0+.31,cz,.34,(KT.z1-KT.z0)/2);
 for(let z=KT.z0+.36;z<KT.z1-.1;z+=.49){K.box(group,KT.x0+.612,FL+.44,z,.018,.72,.44,white);K.pipe(group,[KT.x0+.63,FL+.72,z-.11],[KT.x0+.63,FL+.72,z+.11],.007,chrome);}
 round(KT.x0+.31,FL+.902,KT.z0+.55,.44,.026,.53,chrome,.03);K.pipe(group,[KT.x0+.16,FL+.92,KT.z0+.48],[KT.x0+.16,FL+1.12,KT.z0+.48],.01,chrome);K.pipe(group,[KT.x0+.16,FL+1.12,KT.z0+.48],[KT.x0+.35,FL+1.12,KT.z0+.48],.01,chrome);
 const kettle=K.cyl(group,KT.x0+.34,FL+1.02,KT.z1-.5,.105,.23,mat(0x8b3031),{r2:.07});K.pipe(group,[KT.x0+.27,FL+1.02,KT.z1-.5],[KT.x0+.16,FL+1.11,KT.z1-.5],.025,chrome);
 const tableX=KT.x1-.55,tableZ=KT.z0+.65;round(tableX,FL+.73,tableZ,.95,.045,.72,wood,.035);for(const x of [-.39,.39])for(const z of [-.27,.27])K.box(group,tableX+x,FL+.355,tableZ+z,.045,.71,.045,wood);solid(tableX,tableZ,.49,.38);
 // Bowl is a curved open vessel, with cereal and milk below its lip.
 const breakfast=new THREE.Group();breakfast.name='your-breakfast';breakfast.position.set(tableX-.07,FL+.755,tableZ+.10);group.add(breakfast);keep.add(breakfast);
 const bowlGeo=new THREE.LatheGeometry([new THREE.Vector2(.055,0),new THREE.Vector2(.085,.02),new THREE.Vector2(.111,.065),new THREE.Vector2(.115,.082),new THREE.Vector2(.108,.082),new THREE.Vector2(.102,.065),new THREE.Vector2(.080,.026)],32);const bm=new THREE.Mesh(bowlGeo,mat(0xc7d9db,{side:THREE.DoubleSide,roughness:.4}));breakfast.add(bm);
 const milk=K.cyl(breakfast,0,.06,0,.099,.006,mat(0xe4dfc9));const cereal=new THREE.Group();breakfast.add(cereal);for(let i=0;i<32;i++){const a=i*2.399,r=.018+Math.sqrt((i+.5)/32)*.07;const c=new THREE.Mesh(new THREE.TorusGeometry(.009,.003,5,9),mat(0xbb8b4e));c.rotation.set(Math.PI/2+.2*Math.sin(i),0,i);c.position.set(Math.cos(a)*r,.066,Math.sin(a)*r);cereal.add(c);}
 const spoon=new THREE.Group();spoon.name='breakfast-spoon';K.box(spoon,0,0,0,.012,.003,.15,chrome);const sb=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),chrome);sb.scale.set(.025,.006,.037);sb.position.z=-.10;spoon.add(sb);spoon.position.set(tableX+.15,FL+.76,tableZ+.1);group.add(spoon);keep.add(spoon);
 K.cyl(group,tableX+.28,FL+.83,tableZ-.16,.045,.15,mat(0xb89e78));K.box(group,tableX-.25,FL+.9,tableZ-.17,.10,.28,.075,mat(0xd0a14c));
 const boxLabel=paper(128,256,(g,w,h)=>{g.fillStyle='#cb9b42';g.fillRect(0,0,w,h);g.fillStyle='#f2e8c8';g.font='bold 19px sans-serif';g.textAlign='center';g.fillText('HONEY',w/2,47);g.fillText('OATS',w/2,72);g.strokeStyle='#8c5c29';g.lineWidth=5;g.beginPath();g.arc(w/2,147,34,0,7);g.stroke();});K.plane(group,tableX-.25,FL+.91,tableZ-.13,.095,.24,new THREE.MeshStandardMaterial({map:boxLabel,roughness:1}));
 // A window gives the nook a cool overcast source; a warm lamp stays local to the kitchen.
 K.box(group,(KT.x0+KT.x1)/2,FL+1.63,KT.z0+.015,1.15,.87,.045,white);K.plane(group,(KT.x0+KT.x1)/2,FL+1.63,KT.z0+.04,1.04,.76,new THREE.MeshBasicMaterial({color:0x9baeb9}));
 K.box(group,(KT.x0+KT.x1)/2,FL+1.63,KT.z0+.05,.025,.76,.018,white);
 const lights=[];for(const [x,z,c,power] of [[basinX,basinZ+.6,0xd7e3e8,3.2],[KT.x0+1.3,cz,0xffd2a0,3.4]]){const l=new THREE.PointLight(c,power,4.5,2);l.position.set(x,FL+2.0,z);group.add(l);lights.push(l);}
 // Door frames and doors open against their own wall, not across the floor path.
 for(const [x,z] of [[bathDoor,R.z0],[kitchenDoor,HL.z0]]){for(const s of [-1,1])K.box(group,x+s*.46,FL+1.04,z,.055,2.08,.13,white);K.box(group,x,FL+2.1,z,.98,.065,.13,white);const door=K.box(group,x+.48,FL+1.02,z-.42,.04,2.02,.83,white);K.cyl(group,x+.45,FL+1.0,z-.76,.024,.05,chrome,{rz:Math.PI/2});}
 const SPOTS={wash:toW(basinX,basinZ+.035,FL+1.02),brush:toW(basinX-.38,basinZ-.05,FL+1.06),breakfast:toW(tableX-.07,tableZ+.1,FL+.83)};
 const ST={tap:false,wash:0,brush:0,breakfast:0},brushHome={p:brush.position.clone(),q:brush.quaternion.clone()},spoonHome={p:spoon.position.clone(),q:spoon.quaternion.clone()};
 function reset(){Object.assign(ST,{tap:false,wash:0,brush:0,breakfast:0});stream.visible=false;tap.rotation.y=0;cereal.visible=true;milk.scale.y=1;for(const [o,h] of [[brush,brushHome],[spoon,spoonHome]]){group.add(o);o.position.copy(h.p);o.quaternion.copy(h.q);o.visible=true;}}
 function update(dt,time){stream.visible=ST.tap;stream.scale.x=1+.12*Math.sin(time*23);tap.rotation.y=ST.tap?.65:0;cereal.visible=ST.breakfast<1;milk.scale.y=1-.65*ST.breakfast;}
 function restoreProp(id){const [o,h]=id==='brush'?[brush,brushHome]:[spoon,spoonHome];group.add(o);o.position.copy(h.p);o.quaternion.copy(h.q);o.visible=true;}
 bake(group,keep);return {root:group,B,KT,bathDoor,kitchenDoor,SPOTS,ST,brush,spoon,reset,restoreProp,update,lights};
}
