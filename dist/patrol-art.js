// Close-range municipal sedan. The director still owns the original route and timing.
import * as THREE from './three.module.js';
import {createKit} from './kit.js';
import {mergeParts} from './rig.js';

export function patrolBody(group){
 const K=createKit(),L=5.02,W=1.88,roof=1.49,r=.345,axle=1.48;
 const body=new THREE.Group(),near=new THREE.Group(),far=new THREE.Group();group.add(body);body.add(near,far);far.visible=false;
 const paint=K.mat(0xe0e2de,{roughness:.32,metalness:.3}),trim=K.mat(0x1b2228,{roughness:.58}),rubber=K.mat(0x202225,{roughness:.92}),metal=K.mat(0x929b9f,{roughness:.32,metalness:.65});
 // An arched lower body, with a separately crowned hood and trunk rather than a box roof.
 const outline=[[-L/2+.08,.31]];
 for(const z of [-axle,axle]){outline.push([z-.405,.31]);for(let i=0;i<=16;i++){const a=Math.PI-i*Math.PI/16;outline.push([z+Math.cos(a)*.405,r+Math.sin(a)*.405]);}outline.push([z+.405,.31]);}
 outline.push([L/2-.09,.31],[L/2,.57],[L/2-.06,.87],[L/2-.35,.94],[-L/2+.34,.94],[-L/2,.82],[-L/2,.52]);
 const shell=K.extrude(near,outline,W-.08,.045,paint,{bevelSegments:3});shell.rotation.y=Math.PI/2;
 K.rbox(near,0,.94,-1.81,W-.17,.105,1.22,.048,paint);
 K.rbox(near,0,.945,1.89,W-.16,.09,1.06,.043,paint);
 K.rbox(near,0,roof,.04,1.4,.08,1.51,.035,paint);
 K.rbox(near,0,.42,0,1.6,.12,4.43,.05,trim);
 // Six glass panels in one draw, with seats, headrests and a driver silhouette behind them.
 const glassParts=[],glassQuad=(a,b,c,d)=>{const q=K.quad(new THREE.Group(),a,b,c,d,0x8b9eae);glassParts.push({geo:q.geometry,color:0x8b9eae});};
 glassQuad([-.82,.98,-1.3],[.82,.98,-1.3],[.68,1.46,-.65],[-.68,1.46,-.65]);
 glassQuad([.8,.99,1.3],[-.8,.99,1.3],[-.68,1.46,.73],[.68,1.46,.73]);
 for(const s of [-1,1]){
  const x=s*.86,xt=s*.7;
  glassQuad([x,.97,-1.23],[x,.97,.03],[xt,1.45,.03],[xt,1.45,-.63]);
  glassQuad([x,.97,.1],[x,.97,1.25],[xt,1.45,.71],[xt,1.45,.1]);
  for(const [z0,z1] of [[-1.3,-.65],[.065,.065],[1.3,.73]])K.rod(near,[s*.865,.98,z0],[s*.71,1.47,z1],z0===.065?.033:.04,paint,.035,8);
  K.rod(near,[s*.89,.96,-1.28],[s*.89,.96,1.29],.014,metal);
  for(const z of [-1.12,.08,1.22])K.box(near,s*.922,.735,z,.008,.41,.009,trim);
  for(const z of [-.22,.9]){K.rbox(near,s*.938,.862,z,.025,.033,.19,.012,metal);K.rbox(near,s*.935,.851,z,.011,.035,.23,.008,trim);}
  K.rod(near,[s*.85,.985,-1.12],[s*1.01,1.02,-1.02],.026,trim);K.rbox(near,s*1.03,1.055,-1.02,.19,.105,.24,.042,paint);
  K.rbox(near,s*.4,.81,.25,.43,.4,.62,.06,trim);K.rbox(near,s*.4,1.08,.55,.39,.52,.16,.07,trim);K.rbox(near,s*.4,1.36,.55,.23,.17,.105,.05,trim);
 }
 const glass=new THREE.Mesh(mergeParts(glassParts),K.mat(0x506571,{roughness:.19,metalness:.25,transparent:true,opacity:.56,side:THREE.DoubleSide,depthWrite:false}));near.add(glass);
 K.rbox(near,0,1.025,-.92,1.5,.15,.38,.05,trim);
 K.ball(near,-.4,1.285,-.23,.103,0x68564b,[.78,1.12,.88],true);
 K.rbox(near,-.4,1.055,-.14,.33,.33,.21,.07,K.mat(0x252f40));
 const steeringWheel=new THREE.Mesh(new THREE.TorusGeometry(.14,.014,6,20),trim);steeringWheel.position.set(-.4,1.085,-.66);steeringWheel.rotation.x=-.8;near.add(steeringWheel);
 // Grille, bumper seams, plate recess, lamp housings, wipers and steel wheel hardware.
 for(const s of [-1,1]){K.rbox(near,0,.46,s*2.48,1.83,.2,.14,.035,paint);K.box(near,0,.375,s*2.53,1.73,.05,.035,trim);}
 K.rbox(near,0,.735,-2.513,.88,.235,.055,.024,trim);
 for(let i=0;i<6;i++)K.box(near,0,.64+i*.036,-2.548,.81,.009,.012,metal);
 for(const s of [-1,1]){K.rod(near,[s*.07,1.005,-1.28],[s*.55,1.025,-1.2],.007,trim);K.rbox(near,s*.66,.755,-2.492,.39,.21,.07,.03,trim);}
 const head=K.mat(0xf4e9cd,{emissive:0xffefd2,emissiveIntensity:1.1,roughness:.25}),tail=K.mat(0x6b1817,{emissive:0xf63722,emissiveIntensity:.45,roughness:.3});
 for(const s of [-1,1]){K.rbox(near,s*.66,.755,-2.537,.35,.165,.018,.008,head);K.rbox(near,s*.72,.775,2.518,.31,.17,.035,.016,tail);
  for(let i=0;i<4;i++)K.box(near,s*.66+(i-1.5)*.07,.755,-2.549,.009,.15,.006,metal);K.box(near,s*.888,.738,-2.32,.018,.105,.14,K.mat(0xb77838,{roughness:.3}));}
 K.rbox(near,0,.62,2.52,.53,.18,.038,.012,trim);K.box(near,0,.62,2.544,.43,.11,.008,0xc9cbbd);
 K.rod(near,[.55,.29,2.1],[.55,.29,2.53],.045,metal);
 // Far shape retains the same silhouette; all tiny seams and the cabin disappear together.
 K.rbox(far,0,.68,0,1.85,.56,4.96,.08,paint);K.rbox(far,0,1.17,.06,1.52,.55,2.15,.12,K.mat(0x3c4c59,{roughness:.35}));K.rbox(far,0,1.49,.06,1.4,.07,1.55,.025,paint);
 const wheels=[],steering=[];
 for(const s of [-1,1])for(const z of [-axle,axle]){const pivot=new THREE.Group(),spin=new THREE.Group();pivot.position.set(s*.84,r,z);group.add(pivot);pivot.add(spin);
  const tire=new THREE.Mesh(new THREE.TorusGeometry(.259,.086,12,32),rubber);tire.rotation.y=Math.PI/2;spin.add(tire);
  K.cyl(spin,0,0,0,.23,.185,trim,28,[0,0,Math.PI/2]);K.cyl(spin,s*.11,0,0,.185,.026,metal,24,[0,0,Math.PI/2]);
  for(let k=0;k<10;k++){const a=k*Math.PI/5;K.cyl(spin,s*.126,Math.sin(a)*.132,Math.cos(a)*.132,.023,.005,trim,8,[0,0,Math.PI/2]);}
  K.cyl(spin,s*.132,0,0,.078,.022,metal,16,[0,0,Math.PI/2]);
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5;K.ball(spin,s*.15,Math.sin(a)*.048,Math.cos(a)*.048,.009,0xc7c9bf);}
  wheels.push(spin);if(z<0)steering.push(pivot);
 }
 return {L,W,roof,body,near,far,wheels,steering,head,tail};
}
