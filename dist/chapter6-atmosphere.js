// Chapter Six set dressing. These groups are owned by the chapter: no town mesh,
// shared material, navigation surface or accepted gate timing is changed.
import * as THREE from './three.module.js';
import {makeShapes,paper,bake,clamp} from './chapter6-kit.js';

export function createThreshold(scene,house){const root=new THREE.Group();root.name='c6-jamie-foyer';const o=house.toWorld(0,0);root.position.set(o.x,o.ground,o.z);root.rotation.y=house.worldRot;
 const K=makeShapes(),x=house.doorX,z=house.front,f=house.floor;
 // Low-reflectance interior surfaces keep the doorway readable against daylight.
 const paint=new THREE.MeshBasicMaterial({color:0x292e2e}),wood=new THREE.MeshBasicMaterial({color:0x322d28}),trim=new THREE.MeshBasicMaterial({color:0x56534a}),runner=new THREE.MeshBasicMaterial({color:0x3a423d});
 K.box(root,x,f-.025,z-1.8,2.5,.05,3.5,wood);K.box(root,x,f+1.2,z-3.4,2.5,2.4,.07,paint);
 for(const s of [-1,1])K.box(root,x+s*1.23,f+1.2,z-1.8,.05,2.4,3.4,paint);
 K.box(root,x,f+2.39,z-1.8,2.5,.05,3.5,paint);
 for(let i=0;i<6;i++){K.box(root,x+.24,f+.085+i*.17,z-2.32-i*.23,1.2,.17,.24,wood);K.box(root,x+.24,f+.174+i*.17,z-2.32-i*.23,.64,.009,.24,runner);}
 for(let i=0;i<5;i++)K.pipe(root,[x-.43,f+i*.17,z-2.15-i*.23],[x-.43,f+.88+i*.17,z-2.15-i*.23],.012,trim);
 K.pipe(root,[x-.43,f+.89,z-2.15],[x-.43,f+1.62,z-3.15],.028,wood);
 // Familiar small domestic objects make the same house recognisable.
 K.box(root,x+.93,f+.48,z-1.70,.43,.96,.32,wood);K.box(root,x+.94,f+1.06,z-1.70,.08,.17,.08,trim);
 const shadeM=new THREE.MeshStandardMaterial({color:0xbcb09a,emissive:0xc8a875,emissiveIntensity:.5,roughness:1});K.cyl(root,x+.94,f+1.23,z-1.70,.14,.25,shadeM,{r2:.085});
 const light=new THREE.PointLight(0xffca8e,1.8,3.1,2);light.position.set(x+.80,f+1.45,z-1.4);root.add(light);
 K.box(root,x-.92,f+1.52,z-2.02,.27,.34,.025,wood);K.box(root,x-.92,f+1.52,z-2.00,.22,.29,.012,new THREE.MeshBasicMaterial({color:0x6a716c}));
 bake(root);let blinkUntil=-1;
 return {root,light,show(on){if(on&&!root.parent)scene.add(root);if(!on)root.removeFromParent();},blink(t){blinkUntil=t+.36;},update(t){const on=t>blinkUntil;light.intensity=on?1.8:0;shadeM.emissiveIntensity=on?.5:0;},reset(){root.removeFromParent();blinkUntil=-1;light.intensity=1.8;}};
}

export function dressWorks(root,{floor,lamps,leaf}){const group=new THREE.Group();group.name='c6-works-weathering';root.add(group);const K=makeShapes();
 const steel=new THREE.MeshStandardMaterial({color:0x747a76,metalness:.65,roughness:.48}),rust=new THREE.MeshStandardMaterial({color:0x634532,metalness:.2,roughness:.94}),grease=new THREE.MeshStandardMaterial({color:0x252a28,roughness:.32});
 const stain=paper(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<75;i++){const x=((i*137)%511),wide=3+(i*17%36),end=.25+(i*29%71)/100;const s=g.createLinearGradient(0,0,0,h*end);s.addColorStop(0,'rgba(39,43,29,.45)');s.addColorStop(.65,'rgba(58,55,33,.2)');s.addColorStop(1,'rgba(42,46,29,0)');g.fillStyle=s;g.fillRect(x,0,wide,h*end);}g.strokeStyle='rgba(186,177,144,.16)';g.lineWidth=2;for(let j=0;j<3;j++){g.beginPath();for(let x=0;x<w;x+=3){const y=h*(.63+j*.024)+Math.sin(x*.035+j)*3; x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}});
 const dampM=new THREE.MeshStandardMaterial({map:stain,color:0x929586,transparent:true,roughness:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 for(const [x,ry] of [[6.205,Math.PI/2],[11.995,-Math.PI/2]])for(const [z,w] of [[18.9,5.0],[24.2,1.6],[28.4,2.4],[34.8,2.5]])K.plane(group,x,floor+1.60,z,w,3.15,dampM,{ry});
 // Anchor bolts, clamp plates, construction joints and greasy gate guides.
 for(const z of [17.5,20.4,24.4,28,31.4,35]){for(const x of [6.6,11.7]){K.box(group,x,-2.82,z,.17,.045,.19,steel);for(const dx of [-.055,.055])K.cyl(group,x+dx,-2.85,z,.013,.016,rust,{sides:6});}K.pipe(group,[12.0,-3.17,z],[11.77,-3.17,z],.018,steel);}
 for(const x of [7.55,10.45]){K.box(group,x,floor+1.32,22.78,.10,2.64,.018,grease);for(const y of [.18,.72,1.26,1.8,2.34]){K.box(group,x,floor+y,22.74,.18,.15,.026,rust);K.cyl(group,x,floor+y,22.71,.024,.03,steel,{sides:6,rx:Math.PI/2});}}
 for(const y of [-.9,0,.9])for(const x of [-1.19,1.19])K.cyl(leaf,x,y,-.094,.024,.018,steel,{sides:6,rx:Math.PI/2});
 const puddle=paper(128,128,(g,w,h)=>{const grad=g.createRadialGradient(64,64,5,64,64,64);grad.addColorStop(0,'rgba(255,255,255,.70)');grad.addColorStop(.7,'rgba(255,255,255,.33)');grad.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=grad;g.beginPath();for(let i=0;i<80;i++){const a=i/80*Math.PI*2,r=51+8*Math.sin(a*7)+4*Math.cos(a*11);const x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();});
 const wet=new THREE.MeshStandardMaterial({color:0x46534f,alphaMap:puddle,transparent:true,opacity:.65,metalness:.3,roughness:.13,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});
 // Landing stays dry for the footprint clue. Damp patches start beyond 2B.
 for(const [x,z,w,d] of [[7.1,27.4,1.5,2.1],[10.5,31.0,2.0,3.1],[8.2,34.7,1.8,.7]])K.plane(group,x,floor+.008,z,w,d,wet,{rx:-Math.PI/2});
 bake(group);
 const glows=[];for(const id of ['em-L','em-J','J-c']){const lamp=lamps[id],m=new THREE.MeshBasicMaterial({color:lamp.color,alphaMap:puddle,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const q=K.plane(root,id==='J-c'?9:11.3,floor+.024,lamp.g.position.z,.45,1.6,m,{rx:-Math.PI/2});q.name='c6-wet-lamp-reflection';glows.push({q,lamp,id});}
 const rings=[];const ringG=new THREE.RingGeometry(.90,1,24),ringM=new THREE.MeshBasicMaterial({color:0xb4c2bd,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false});for(let i=0;i<12;i++){const q=new THREE.Mesh(ringG,ringM.clone());q.rotation.x=-Math.PI/2;root.add(q);q.name='c6-runoff-ring';rings.push(q);}
 return {group,update(t,water){for(const {q,lamp,id} of glows){const w=id==='em-L'?water.L:water.J;q.position.y=Math.max(floor+.024,w.y+.012);q.material.opacity=(lamp.shown||0)*.22*(w.y>floor+.02?1:.2);}
  rings.forEach((q,i)=>{const u=(t*(.8+(i%3)*.13)+i*.618)%1,w=water.J;q.visible=w.y>floor+.035;q.position.set(6.7+(i%3)*.15,Math.max(floor,w.y)+.016,25.6+(i%2)*4.4);q.scale.setScalar(.03+u*.24);q.material.opacity=.16*(1-u);});}};
}
