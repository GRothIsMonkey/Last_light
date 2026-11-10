// Aftermath I: the school. Oak Hollow Elementary (its name is on the boys' class pictures; the building was never seen): the
// evacuation point on the morning of August 27, a shelter for the days after, and nine days later the room where Alex's
// pictures are hung.
//
// It stands by itself, far from Oak Hollow's own ground (nothing of the neighbourhood is drawn while you are here: game.js
// hideWorld), on flat ground of its own:
//   the lot      the drive in from the south-west, the drop-off lane along the front, the walk, a bike rack by the doors, the
//                school's sign, a bus that brought people out, an ambulance, a tent with water
//   the gym      26 m by 16: the court, the folded bleachers, banners; as a shelter, four rows of cots, the lists by the doors,
//                the board of the missing, a first-aid corner behind screens, a television on a cart
//   the wing     a corridor (WELCOME BACK on its board, for a first day that did not come), the nurse's room, Room 6
// Dressing is by state: 'shelter' (Saturday), 'thin' (Monday: half the cots folded, a county list where the board was),
// 'memorial' (September 5: chairs in rows, an easel, his pictures on boards along the walls). The shell is the same room.
//
// Local frame: +x east, +z south (the lot is south of the building), y up, the floor at 0. nav: one region (nav.setRoom) that
// answers for the whole place; the lot can be ridden.
import * as THREE from './three.module.js';
import {makeShapes,bake,inBox,clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {puffTexture} from './chapter8-presence.js';
import {rescueTruck} from './chapter6-cast.js';
import {tex9} from './aftermath1-props.js';

export const SCHOOL={x:1500,z:300};
const GYM={x0:-13,x1:13,z0:-8,z1:8,h:7},VEST={x0:-7,x1:-4,z0:8.3,z1:10.4},CORR={x0:13.45,x1:15.95,z0:-8.15,z1:8.15},NURSE={x0:16.25,x1:21,z0:-8.15,z1:-3.1},CLASS={x0:16.25,x1:24.5,z0:-1.9,z1:6.1};
const DOORS={gym:{x0:-6.5,x1:-4.5,z0:7.3,z1:9},out:{x0:-6.6,x1:-4.4,z0:9.8,z1:11.2},east:{x0:12.4,x1:14,z0:1.95,z1:3.25},nurse:{x0:15.6,x1:16.8,z0:-6.65,z1:-5.35},room:{x0:15.6,x1:16.8,z0:.35,z1:1.65}};
const LOT={x0:-47.5,x1:37.5,z0:10.45,z1:49.5},DRIVE={x0:-47.5,x1:-40.5,z0:49,z1:118};
// cots: four rows of six. COT[i]: centre, long along x.
const COTS=[];for(const z of [-5.6,-2.8,0,2.8])for(const x of [-11,-7.8,-4.6,-1.4,1.8,5])COTS.push({x,z,row:Math.round((z+5.6)/2.8),col:Math.round((x+11)/3.2)});
const COT_H=.42;

export function createSchool({scene}){
 const O=SCHOOL,root=new THREE.Group();root.name='a1-school';root.position.set(O.x,0,O.z);
 const K=makeShapes(),MC=new Map();
 const M=(c,o={})=>{const key=c+JSON.stringify(o);if(!MC.has(key)){const m=new THREE.MeshStandardMaterial({color:c,roughness:.88,...o});m.name='a1-'+c.toString(16);MC.set(key,m);}return MC.get(key);};
 const TM=(name,args=[],fallback=0xe8e4d8,o={})=>{const t=tex9(name,...args);const m=new THREE.MeshStandardMaterial({map:t,color:t?0xffffff:fallback,roughness:.9,...o});m.name='a1-paper-'+name;return m;};
 const W=(x,z,y=0)=>({x:O.x+x,z:O.z+z,y});
 const toL=(wx,wz)=>({x:wx-O.x,z:wz-O.z});
 const box=(g,x0,x1,y0,y1,z0,z1,m,o)=>K.box(g,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.abs(x1-x0),Math.abs(y1-y0),Math.abs(z1-z0),m,o);
 const flat=(g,x0,x1,z0,z1,y,m)=>{const p=K.plane(g,(x0+x1)/2,y,(z0+z1)/2,x1-x0,z1-z0,m,{rx:-Math.PI/2});p.receiveShadow=true;return p;};
 // a wall along x at z (or along z at x), with openings [[from, to, top]]
 function wallX(g,z,x0,x1,h,m,t=.15,gaps=[],y0=0){let x=x0;for(const [a,b,top] of gaps.slice().sort((p,q)=>p[0]-q[0])){if(a>x)box(g,x,a,y0,h,z-t/2,z+t/2,m);if(top<h)box(g,a,b,top,h,z-t/2,z+t/2,m);x=b;}if(x<x1)box(g,x,x1,y0,h,z-t/2,z+t/2,m);}
 function wallZ(g,x,z0,z1,h,m,t=.15,gaps=[],y0=0){let z=z0;for(const [a,b,top] of gaps.slice().sort((p,q)=>p[0]-q[0])){if(a>z)box(g,x-t/2,x+t/2,y0,h,z,a,m);if(top<h)box(g,x-t/2,x+t/2,top,h,a,b,m);z=b;}if(z<z1)box(g,x-t/2,x+t/2,y0,h,z,z1,m);}
 // a sheet of paper on a wall: facing (0: +z, into a room from its north wall; PI: -z; +-PI/2: along x)
 const paperOn=(g,x,y,z,w,h,m,ry=0,name='')=>{const p=K.plane(g,x,y,z,w,h,m,{ry,name});return p;};
 const SOLID={shell:[],shelter:[],thin:[],memorial:[],lot:[]};
 const solid=(set,x,z,hw,hd,a=0)=>{SOLID[set].push({x,z,hw,hd,a});};
 // ---- materials ---------------------------------------------------------------------------------------------------------------------
 const grass=M(0x66744a,{roughness:1}),asphalt=M(0x4a4c4f,{roughness:.96}),concrete=M(0xbdb8ab),curbM=M(0xa9a59a),paint=M(0xe9e6da,{roughness:.8}),yellow=M(0xd9b12e,{roughness:.7});
 const brick=M(0x9a5c46),panel=M(0xcfc8b7,{roughness:.7}),block=M(0xdad3bf,{roughness:.95}),blockUp=M(0xe6e0d0,{roughness:.95}),stripe=M(0x2f4f86,{roughness:.7}),deck=M(0x7c7a74),steel=M(0x6f747b,{roughness:.5,metalness:.5});
 const doorM=M(0x56606c,{roughness:.55,metalness:.3}),glass=new THREE.MeshStandardMaterial({color:0x9fb6c2,roughness:.08,metalness:.2,transparent:true,opacity:.28,depthWrite:false});glass.name='a1-glass';
 const darkGlass=M(0x1c262c,{roughness:.1,metalness:.5}),tile=M(0xbfb7a3,{roughness:.6}),mat8=M(0x45474a,{roughness:1}),wood=M(0x9a6a3c,{roughness:.7}),pad=M(0x2d4a7e,{roughness:.8}),white=M(0xf0ede4,{roughness:.6}),black=M(0x1c1d1f,{roughness:.6});
 const courtM=TM('court',[],0xc9a46c,{roughness:.42});
 const lampM=new THREE.MeshBasicMaterial({color:0xfff3d6});lampM.name='a1-lamp';const skyM=new THREE.MeshBasicMaterial({color:0xd9a074});skyM.name='a1-window-sky';const exitM=new THREE.MeshBasicMaterial({color:0x35c26a});exitM.name='a1-exit';
 const cotCanvas=M(0x4d5f4a,{roughness:1}),cotFrame=M(0xb4b8bc,{roughness:.4,metalness:.6}),wool=M(0x8c8982,{roughness:1}),wool2=M(0x6f5a52,{roughness:1}),pillow=M(0xe9e6de,{roughness:1}),tableTop=M(0xc9b89c,{roughness:.7}),chairM=M(0x7a6a52,{roughness:.6,metalness:.2});
 const card=M(0xa98556,{roughness:1}),plastic=new THREE.MeshStandardMaterial({color:0xa9cfe0,roughness:.15,transparent:true,opacity:.62});plastic.name='a1-water';const red=M(0xb5261e,{roughness:.6}),orange=M(0xe2712a,{roughness:.6}),green=M(0x2f6b45,{roughness:.6});
 const busY=M(0xe0aa1c,{roughness:.5}),tent=M(0xeeeae0,{roughness:.9,side:THREE.DoubleSide}),cork=M(0xb88a58,{roughness:1}),screen=M(0xe8e6de,{roughness:1}),vinyl=M(0x5a7a8a,{roughness:.7});
 // ---- the ground, the lot ------------------------------------------------------------------------------------------------------------
 const shell=new THREE.Group();shell.name='a1-school-shell';root.add(shell);
 flat(shell,-300,300,-260,340,-.03,grass);flat(shell,LOT.x0-.5,LOT.x1+.5,13,LOT.z1+.5,0,asphalt);flat(shell,DRIVE.x0-.5,DRIVE.x1+.5,LOT.z1,DRIVE.z1+90,.002,asphalt);flat(shell,-30,35,10.4,13,.012,concrete);
 box(shell,-30,35,0,.11,12.96,13.12,curbM);
 for(let x=-36;x<=34;x+=2.7){box(shell,x-.06,x+.06,.003,.012,24,29.4,paint);box(shell,x-.06,x+.06,.003,.012,36,41.4,paint);}
 box(shell,-36,34,.003,.012,13.3,13.42,yellow);// (the no-parking line along the drop-off lane)
 for(const x of [-38,-24,-10,4,18,30])for(const z of [21.2,32.7,44.6]){/* tar seams */box(shell,x,x+5+((x*7)%3),.004,.01,z,z+.07,M(0x38393b,{roughness:1}));}
 // ---- the building's outside ----------------------------------------------------------------------------------------------------------
 const gymGaps=[[DOORS.gym.x0,DOORS.gym.x1,2.25]];
 wallX(shell,GYM.z1+.3,-13.45,13.45,3,brick,.16,gymGaps);box(shell,-13.45,13.45,3,7.5,GYM.z1+.22,GYM.z1+.38,panel);
 wallX(shell,GYM.z0-.3,-13.45,13.45,7.5,brick,.16);wallZ(shell,GYM.x0-.3,-8.45,8.45,7.5,brick,.16);box(shell,13.22,13.38,3.5,7.5,-8.45,8.45,panel);
 box(shell,-13.6,13.6,7.5,7.72,-8.6,8.6,deck);// roof
 // the wing: brick, a band of windows, a flat roof
 wallX(shell,8.38,13.38,34.2,3.5,brick,.16);wallX(shell,-8.38,13.38,34.2,3.5,brick,.16);wallZ(shell,34.2,-8.45,8.45,3.5,brick,.16);box(shell,13.3,34.3,3.5,3.72,-8.6,8.6,deck);
 for(let x=17.4;x<33;x+=3.3){box(shell,x,x+2.3,1.1,2.5,8.44,8.5,darkGlass);box(shell,x-.05,x+2.35,1.04,1.1,8.42,8.54,concrete);}
 box(shell,14.2,15.2,0,2.2,8.42,8.5,doorM);// (the wing's own door: shut)
 // the entrance: glass vestibule, canopy, doors propped open
 for(const x of [VEST.x0-.08,VEST.x1+.08]){for(const z of [8.5,9.45,10.4])box(shell,x-.04,x+.04,0,2.9,z-.04,z+.04,steel);box(shell,x-.04,x+.04,2.82,2.9,8.46,10.44,steel);box(shell,x-.04,x+.04,0,.12,8.46,10.44,steel);const g2=K.box(shell,x,1.47,9.45,.03,2.7,1.85,glass);g2.castShadow=false;}
 box(shell,VEST.x0-.1,DOORS.out.x0,0,2.9,10.36,10.46,steel);box(shell,DOORS.out.x1,VEST.x1+.1,0,2.9,10.36,10.46,steel);box(shell,VEST.x0-.1,VEST.x1+.1,2.3,2.9,10.36,10.46,steel);box(shell,VEST.x0-.2,VEST.x1+.2,2.9,3.02,8.3,10.5,deck);
 for(const [x,ry] of [[DOORS.out.x0-.02,-1.45],[DOORS.out.x1+.02,1.45]]){const d=new THREE.Group();d.position.set(x,0,10.42);d.rotation.y=ry;shell.add(d);const s=Math.sign(ry);K.box(d,-s*.5,1.1,0,1,2.2,.05,doorM);K.box(d,-s*.5,1.45,.03,.7,1.1,.02,darkGlass);}
 box(shell,-9.2,-1.8,3.05,3.25,8.3,13.4,deck);for(const x of [-8.9,-2.1])K.cyl(shell,x,1.52,13.15,.09,3.05,steel);
 box(shell,-8.6,-2.4,3.25,3.9,13.18,13.3,stripe);paperOn(shell,-5.5,3.57,13.31,5.6,.5,TM('sign',['OAK HOLLOW ELEMENTARY'],0x2f4f86),0,'a1-entrance-name');for(const x of [-8.9,-2.1])solid('shell',x,13.15,.12,.12);
 // the sign on the lawn; the flagpole; the rack
 box(shell,-22.6,-18.4,0,.5,15.2,15.8,brick);box(shell,-22.4,-18.6,.5,1.7,15.35,15.65,white);paperOn(shell,-20.5,1.1,15.66,3.7,1.15,TM('welcome',[],0x3f6b4a),0,'a1-sign');box(shell,-22.6,-18.4,1.7,1.84,15.2,15.8,brick);solid('shell',-20.5,15.5,2.2,.5);
 K.cyl(shell,-15.2,4.2,15.4,.05,8.4,steel);K.box(shell,-14.6,7.7,15.4,1.1,.7,.02,M(0x8a2a2a,{roughness:1,side:THREE.DoubleSide}));
 const RACK={x0:-.9,x1:2.9,z:11.55};K.pipe(shell,[RACK.x0,.78,RACK.z],[RACK.x1,.78,RACK.z],.022,steel);for(let x=RACK.x0;x<=RACK.x1+.01;x+=.475){K.pipe(shell,[x,0,RACK.z],[x,.78,RACK.z],.018,steel);K.pipe(shell,[x,0,RACK.z+.5],[x,.36,RACK.z+.5],.014,steel);K.pipe(shell,[x,.36,RACK.z+.5],[x,.78,RACK.z],.014,steel);}
 solid('shell',(RACK.x0+RACK.x1)/2,RACK.z+.1,(RACK.x1-RACK.x0)/2+.1,.2);
 // a line of trees and the ballfield's backstop: the edge of what there is
 {const leaf=M(0x4d6238,{roughness:1}),leaf2=M(0x5b6f3c,{roughness:1}),trunk=M(0x4a3a2a,{roughness:1});let s=7;const R=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  for(let i=0;i<64;i++){const a=i/64*Math.PI*2+R()*.06,r=78+R()*36,x=Math.cos(a)*r*1.25-4,z=Math.sin(a)*r+24;if(Math.abs(x+44)<9&&z>48)continue;const h=7+R()*6;K.cyl(shell,x,h*.25,z,.28,h*.5,trunk,{sides:6});const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),R()<.5?leaf:leaf2);c.position.set(x,h*.72,z);c.scale.set(2.6+R()*1.6,h*.42,2.6+R()*1.6);c.castShadow=true;shell.add(c);}
  for(let x=44;x<=58;x+=2)K.pipe(shell,[x,0,-4],[x,4.2,-4],.03,steel,6);K.pipe(shell,[44,4.2,-4],[58,4.2,-4],.03,steel,6);const net=new THREE.Mesh(new THREE.PlaneGeometry(14,4.2),new THREE.MeshBasicMaterial({color:0x6f747b,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));net.material.name='a1-backstop';net.position.set(51,2.1,-4);shell.add(net);}
 // ---- the gym, inside ---------------------------------------------------------------------------------------------------------------
 flat(shell,GYM.x0,GYM.x1,GYM.z0,GYM.z1,.006,courtM);
 wallX(shell,GYM.z1+.08,-13.1,13.1,2.4,block,.14,gymGaps);box(shell,-13.1,13.1,2.4,GYM.h,GYM.z1+.01,GYM.z1+.15,blockUp);
 wallX(shell,GYM.z0-.08,-13.1,13.1,2.4,block,.14);box(shell,-13.1,13.1,2.4,GYM.h,GYM.z0-.15,GYM.z0-.01,blockUp);
 wallZ(shell,GYM.x0-.08,-8.1,8.1,2.4,block,.14);box(shell,GYM.x0-.15,GYM.x0-.01,2.4,GYM.h,-8.1,8.1,blockUp);
 wallZ(shell,GYM.x1+.08,-8.1,8.1,2.4,block,.14,[[DOORS.east.z0+.05,DOORS.east.z1-.05,2.1]]);box(shell,GYM.x1+.01,GYM.x1+.15,2.4,GYM.h,-8.1,8.1,blockUp);
 for(const [x0,x1,z0,z1] of [[-13,13,7.96,8],[-13,13,-8,-7.96],[-13,-12.96,-8,8],[12.96,13,-8,8]])box(shell,x0,x1,2.36,2.52,z0,z1,stripe);
 box(shell,-13.1,13.1,GYM.h,GYM.h+.1,-8.1,8.1,deck);for(const x of [-9.6,-4.8,0,4.8,9.6]){box(shell,x-.09,x+.09,6.42,6.9,-8,8,steel);}
 const LAMPS=[];for(const z of [-4,4])for(const x of [-9.6,-3.2,3.2,9.6]){const l=K.box(shell,x,6.3,z,1.25,.1,.5,lampM,{name:'a1-gym-lamp'});l.castShadow=false;LAMPS.push({x,z});K.pipe(shell,[x,6.36,z],[x,6.98,z],.012,steel,5);}
 const WINS=[];for(let x=-11;x<=11;x+=4.4){const wn=K.box(shell,x,5.5,GYM.z0+.02,2.6,1.15,.04,skyM,{name:'a1-gym-window'});wn.castShadow=false;WINS.push(wn);box(shell,x-1.36,x+1.36,4.86,4.92,GYM.z0,GYM.z0+.08,steel);}
 // hoops, pads, the folded bleachers, the scoreboard, banners, a clock, a ball cart
 for(const s of [-1,1]){const x=s*12.5;K.box(shell,x,3.55,0,.06,1.05,1.8,white);K.box(shell,x-s*.03,3.4,0,.02,.45,.6,M(0xd9623e,{roughness:.6}));const rim=new THREE.Mesh(new THREE.TorusGeometry(.23,.012,6,18),orange);rim.rotation.x=Math.PI/2;rim.position.set(x-s*.3,3.05,0);shell.add(rim);K.pipe(shell,[x,3.3,0],[x-s*.08,3.05,0],.012,steel,5);box(shell,x+(s>0?-.02:.02)-.03,x+(s>0?-.02:.02)+.03,.1,1.9,-3,3,pad);}
 box(shell,-12,5,0,2.5,GYM.z0+.02,GYM.z0+.85,wood);for(let y=.2;y<2.5;y+=.21)box(shell,-12.02,5.02,y,y+.04,GYM.z0+.84,GYM.z0+.88,M(0x5a3a22,{roughness:.8}));solid('shell',-3.5,GYM.z0+.45,8.6,.5);
 K.box(shell,12.9,5.1,-4.6,.1,1.1,2.6,black);for(const [z,c] of [[-5.4,0xff3a22],[-3.8,0xff3a22]])K.box(shell,12.84,5.1,z,.02,.42,.7,new THREE.MeshBasicMaterial({color:0x3a0c08}));
 const BANNERS=[['FIELD DAY|CHAMPS','6TH GRADE|2011'],['READ-A-THON','1,204 BOOKS|2010–11','#7a2e2e','#e9c44a'],['OAK HOLLOW|ELEMENTARY','EST. 1961'],['SCIENCE|FAIR','DISTRICT|FINALS 2010','#2f6b45','#f3efe4']];
 BANNERS.forEach((b,i)=>{const x=-1.5+i*3.4;paperOn(shell,x,5.1,GYM.z1-.02,1.5,2.25,TM('banner',b,0x2f4f86),Math.PI,'a1-banner');});
 {const c=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.04,24),white);c.rotation.z=Math.PI/2;c.position.set(GYM.x1-.03,3.1,2.6);shell.add(c);K.box(shell,GYM.x1-.06,3.15,2.6,.01,.13,.012,black,{rx:.5});K.box(shell,GYM.x1-.06,3.1,2.64,.01,.012,.1,black);}
 K.box(shell,DOORS.gym.x0+1,2.42,GYM.z1-.04,.5,.2,.05,exitM).castShadow=false;K.box(shell,GYM.x1-.04,2.3,2.6,.05,.2,.5,exitM).castShadow=false;
 {const g2=new THREE.Group();g2.position.set(-11.6,0,6.6);shell.add(g2);for(const y of [.25,.62])for(const x of [-.5,0,.5]){K.pipe(g2,[x,y,-.3],[x,y,.3],.012,steel,5);}for(const x of [-.6,.6])for(const z of [-.3,.3])K.pipe(g2,[x,0,z],[x,.75,z],.014,steel,5);
  for(let i=0;i<7;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.12,1),M(0xc8642a,{roughness:.8}));b.position.set(-.45+(i%4)*.3,i<4?.4:.76,(i%2)*.22-.11);g2.add(b);}solid('shell',-11.6,6.6,.7,.4);}
 // the doors between: the gym's own (propped open with a fire extinguisher), the east door to the wing
 for(const [x,ry] of [[DOORS.gym.x0,1.5],[DOORS.gym.x1,-1.5]]){const d=new THREE.Group();d.position.set(x,0,GYM.z1+.12);d.rotation.y=ry;shell.add(d);const s=Math.sign(ry);K.box(d,s*.5,1.1,0,.98,2.2,.05,doorM);K.box(d,s*.5,1.5,.03,.2,.7,.02,darkGlass);}
 K.cyl(shell,DOORS.gym.x1+.5,.25,GYM.z1+.5,.07,.5,red);
 {const d=new THREE.Group();d.position.set(GYM.x1+.25,0,DOORS.east.z0+.05);d.rotation.y=-.2;shell.add(d);K.box(d,0,1.05,.58,.05,2.1,1.15,doorM);K.box(d,.03,1.5,.58,.02,.6,.22,darkGlass);}
 // ---- the wing: corridor, nurse, Room 6 ------------------------------------------------------------------------------------------------
 flat(shell,13.3,24.6,-8.2,8.2,.006,tile);flat(shell,VEST.x0,VEST.x1,GYM.z1+.2,VEST.z1,.008,mat8);
 box(shell,13.3,24.7,3.2,3.3,-8.3,8.3,white);// ceiling
 wallZ(shell,16.1,-8.2,8.2,3.2,blockUp,.14,[[DOORS.nurse.z0+.05,DOORS.nurse.z1-.05,2.1],[DOORS.room.z0+.05,DOORS.room.z1-.05,2.1]]);
 wallX(shell,-8.22,13.4,21.1,3.2,blockUp,.12);wallX(shell,8.22,13.4,16.2,3.2,blockUp,.12,[[14.2,15.2,2.2]]);
 wallX(shell,NURSE.z1+.08,16.1,21.1,3.2,blockUp,.14);wallZ(shell,NURSE.x1+.08,-8.3,NURSE.z1+.1,3.2,blockUp,.14);
 wallX(shell,CLASS.z0-.08,16.1,24.6,3.2,blockUp,.14);wallX(shell,CLASS.z1+.08,16.1,24.6,3.2,blockUp,.14);wallZ(shell,CLASS.x1+.08,CLASS.z0-.1,CLASS.z1+.1,3.2,blockUp,.14);
 for(const z of [-5,0,5]){const l=K.box(shell,14.7,3.17,z,.4,.05,1.3,lampM);l.castShadow=false;}for(const [x,z] of [[18.6,-5.6],[19,.4],[21.6,3.6]]){const l=K.box(shell,x,3.17,z,1.3,.05,.4,lampM);l.castShadow=false;}
 // the corridor: the board for a first day that did not come; coat hooks; a water fountain; children's paper suns
 paperOn(shell,13.47,1.75,-4.6,2.6,1.3,TM('welcome',[],0x3f6b4a),Math.PI/2,'a1-welcome');for(let i=0;i<9;i++){const c=[0xe9c44a,0xd9623e,0x6fa8d8,0x8fbf6a][i%4];const s=new THREE.Mesh(new THREE.CircleGeometry(.13,10),new THREE.MeshBasicMaterial({color:c}));s.material.name='a1-paper-sun';s.position.set(13.48,1.2+((i*7)%5)*.22,-7.4+i*.55+(i>4?3.4:0));s.rotation.y=Math.PI/2;shell.add(s);}
 box(shell,13.46,13.52,1.2,1.24,4.2,7.6,wood);for(let z=4.4;z<7.6;z+=.4)K.box(shell,13.52,1.2,z,.06,.02,.02,steel);box(shell,13.5,13.86,.6,.92,-.4,.1,steel);solid('shell',13.68,-.15,.2,.3);
 // the nurse's room: two cots, a sink, a cabinet, a desk, a window with the blinds down, a scale
 const NSPOT={};
 {const g2=shell;const nx=NURSE.x0,nz=NURSE.z0;
  for(const [i,z] of [[0,-7.3],[1,-4.2]]){const x=19.4;box(g2,x-.95,x+.95,.42,.5,z-.36,z+.36,vinyl);box(g2,x-.95,x+.95,0,.42,z-.36,z+.36,M(0xd9d5c9,{roughness:.7}));box(g2,x+.55,x+.93,.5,.6,z-.3,z+.3,pillow);solid('shell',x,z,1,.4);NSPOT['cot'+i]={x,z};}
  box(g2,nx,nx+.55,0,.86,nz,nz+1.3,white);box(g2,nx+.06,nx+.5,.8,.88,nz+.25,nz+1.05,steel);K.pipe(g2,[nx+.12,.88,nz+.65],[nx+.12,1.12,nz+.65],.014,steel,6);K.pipe(g2,[nx+.12,1.12,nz+.65],[nx+.3,1.1,nz+.65],.012,steel,6);
  box(g2,nx,nx+.04,1.2,1.75,nz+.3,nz+1,M(0xaec0c8,{roughness:.08,metalness:.6}));solid('shell',nx+.3,nz+.65,.32,.7);NSPOT.sink={x:nx+.3,z:nz+.65,y:.9};
  box(g2,nx,nx+.45,0,1.9,nz+1.5,nz+2.6,white);box(g2,nx+.44,nx+.46,1,1.85,nz+1.55,nz+2.55,glass);solid('shell',nx+.25,nz+2.05,.28,.6);
  box(g2,NURSE.x1-.6,NURSE.x1,.72,.76,-6.4,-5,tableTop);for(const z of [-6.3,-5.1])K.pipe(g2,[NURSE.x1-.5,0,z],[NURSE.x1-.5,.72,z],.02,steel,6);solid('shell',NURSE.x1-.3,-5.7,.32,.75);NSPOT.desk={x:NURSE.x1-.3,z:-5.7,y:.78};
  // (a box fan on the desk: Sam's father brings it; its blades are the scene's own to turn)
  const wn=K.box(g2,18.6,1.75,NURSE.z0+.02,1.5,1.1,.03,skyM,{name:'a1-nurse-window'});wn.castShadow=false;WINS.push(wn);for(let y=1.24;y<2.3;y+=.07)box(g2,17.84,19.36,y,y+.035,NURSE.z0+.04,NURSE.z0+.06,white);
  box(g2,NURSE.x1-.5,NURSE.x1-.1,0,.08,-3.9,-3.5,steel);K.pipe(g2,[NURSE.x1-.3,.08,-3.7],[NURSE.x1-.3,1.3,-3.7],.02,steel,6);
  NSPOT.tray={x:18.2,z:-5.75,y:.78};box(g2,17.85,18.55,.74,.78,-6.05,-5.45,white);K.pipe(g2,[18.2,0,-5.75],[18.2,.74,-5.75],.025,steel,6);solid('shell',18.2,-5.75,.36,.32);
  NSPOT.sill={x:18.6,z:NURSE.z0+.16,y:1.19};box(g2,17.8,19.4,1.14,1.18,NURSE.z0+.02,NURSE.z0+.3,white);NSPOT.door={x:16.9,z:-6};NSPOT.in={x:17.3,z:-5.9};NSPOT.hall={x:14.7,z:-6};}
 // Room 6: tables pushed together, small chairs, the teacher's desk, a chalkboard, windows, cubbies
 const RSPOT={};
 {const g2=shell;box(g2,19,22.6,.68,.72,1.2,3,tableTop);for(const [x,z] of [[19.15,1.35],[22.45,1.35],[19.15,2.85],[22.45,2.85],[20.8,2.1]])K.pipe(g2,[x,0,z],[x,.68,z],.022,steel,6);solid('shell',20.8,2.1,1.85,.95);RSPOT.table={x:20.8,z:2.1,y:.725};
  const chair=(x,z,ry)=>{const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=ry;g2.add(c);K.box(c,0,.4,0,.38,.03,.36,M(0x3f6a8a,{roughness:.6}));K.box(c,0,.66,.17,.36,.3,.03,M(0x3f6a8a,{roughness:.6}));for(const [dx,dz] of [[-.16,-.15],[.16,-.15],[-.16,.15],[.16,.15]])K.pipe(c,[dx,0,dz],[dx,.4,dz],.012,steel,5);};
  for(const [x,z,ry] of [[19.6,.75,0],[21,.75,0],[22.2,.75,0],[19.6,3.5,Math.PI],[22.3,3.5,Math.PI],[18.5,2.1,-Math.PI/2]])chair(x,z,ry);
  box(g2,22.2,23.9,.72,.76,-1.4,-.6,wood);box(g2,22.3,23.8,0,.72,-1.35,-.65,M(0x7a5a3a,{roughness:.8}));solid('shell',23.05,-1,.9,.45);
  box(g2,17.2,23.4,.95,2.15,CLASS.z0+.02,CLASS.z0+.06,M(0x2f4a3a,{roughness:.9}));box(g2,17.15,23.45,.9,.95,CLASS.z0+.02,CLASS.z0+.12,wood);paperOn(g2,20.3,1.6,CLASS.z0+.07,2.6,1.1,TM('welcome',[],0x2f4a3a,{transparent:true,opacity:.9}),0,'a1-chalk');
  for(let z=-1;z<5.6;z+=2.2){const wn=K.box(g2,CLASS.x1-.02,1.8,z+.8,.03,1.3,1.7,skyM,{name:'a1-room-window'});wn.castShadow=false;WINS.push(wn);}
  box(g2,16.3,16.7,0,1.2,3.4,6,wood);for(let z=3.6;z<6;z+=.5)box(g2,16.69,16.72,.1,1.15,z,z+.02,M(0x5a3a22));solid('shell',16.5,4.7,.25,1.35);
  RSPOT.you={x:20.4,z:3.75};RSPOT.sam={x:21.5,z:3.8};RSPOT.reyes={x:20.8,z:.55};RSPOT.mom={x:17.6,z:4.9};RSPOT.dad={x:18,z:-.9};RSPOT.door={x:16.9,z:1};RSPOT.in={x:17.4,z:1.2};RSPOT.hall={x:14.7,z:1};
  RSPOT.slots=[0,1,2,3].map(i=>({x:19.55+i*.83,z:2.1,y:.728}));RSPOT.box={x:22.9,z:-1,y:.77};}
 bake(shell);
 // ---- dressing by state ---------------------------------------------------------------------------------------------------------------
 const G={shelter:new THREE.Group(),thin:new THREE.Group(),memorial:new THREE.Group(),lot:new THREE.Group()};for(const [kk,g2] of Object.entries(G)){g2.name='a1-school-'+kk;root.add(g2);g2.visible=false;}
 function cot(g2,x,z,{blanket=0,made=true,set='shelter'}={}){box(g2,x-.95,x+.95,COT_H-.03,COT_H,z-.36,z+.36,cotCanvas);for(const zz of [z-.36,z+.36])K.pipe(g2,[x-.95,COT_H-.02,zz],[x+.95,COT_H-.02,zz],.016,cotFrame,6);
  for(const xx of [x-.7,x,x+.7]){K.pipe(g2,[xx,0,z-.34],[xx,COT_H-.03,z+.34],.012,cotFrame,5);K.pipe(g2,[xx,0,z+.34],[xx,COT_H-.03,z-.34],.012,cotFrame,5);}
  if(made){box(g2,x+.52,x+.9,COT_H,COT_H+.09,z-.26,z+.26,pillow);if(blanket===1)box(g2,x-.9,x+.3,COT_H,COT_H+.035,z-.34,z+.34,wool);else if(blanket===2)box(g2,x-.9,x-.4,COT_H,COT_H+.12,z-.3,z+.3,wool2);}solid(set,x,z,.98,.38);}
 function table(g2,x,z,w,d,{set='shelter',ry=0}={}){const t=new THREE.Group();t.position.set(x,0,z);t.rotation.y=ry;g2.add(t);K.box(t,0,.74,0,w,.04,d,tableTop);for(const [dx,dz] of [[-w/2+.1,-d/2+.1],[w/2-.1,-d/2+.1],[-w/2+.1,d/2-.1],[w/2-.1,d/2-.1]])K.pipe(t,[dx,0,dz],[dx,.72,dz],.016,steel,5);
  solid(set,x,z,(ry?d:w)/2+.03,(ry?w:d)/2+.03);return t;}
 function fchair(g2,x,z,ry=0,{set=null}={}){const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=ry;g2.add(c);K.box(c,0,.44,0,.4,.025,.38,chairM);K.box(c,0,.74,.2,.4,.26,.025,chairM);for(const dx of [-.19,.19]){K.pipe(c,[dx,0,-.17],[dx,.88,.21],.011,steel,5);K.pipe(c,[dx,0,.2],[dx,.44,-.15],.011,steel,5);}if(set)solid(set,x,z,.24,.24);return c;}
 // (the board on wheels: cork, a frame, casters)
 function standBoard(g2,x,z,w,h,m,{ry=Math.PI,set='shelter',name='a1-board'}={}){const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=ry;g2.add(b);K.box(b,0,1.3,-.02,w+.08,h+.08,.03,wood);const p=K.plane(b,0,1.3,0,w,h,m,{name});p.castShadow=false;for(const dx of [-w/2,w/2]){K.pipe(b,[dx,0,-.02],[dx,1.3+h/2,-.02],.02,steel,6);K.box(b,dx,.03,-.02,.06,.06,.6,steel);}
  solid(set,x,z,ry%Math.PI?.22:w/2+.1,ry%Math.PI?w/2+.1:.22);return p;}
 const SPOT={};
 // -- Saturday: the shelter --
 {const g2=G.shelter;COTS.forEach((c,i)=>cot(g2,c.x,c.z,{blanket:[1,2,0,1,1,2,0,1][i%8]}));
  table(g2,-9.6,6.2,2.4,.75);SPOT.checkin={x:-9.6,z:6.2,y:.78};for(const [x,c] of [[-10.4,0x2f4f86],[-9.5,0xc8281e],[-8.8,0x1d1d1d]]){K.box(g2,x,.775,6.2,.24,.012,.32,white);K.box(g2,x,.787,6.05,.1,.012,.03,M(c));}K.box(g2,-10.3,.86,6.42,.3,.16,.22,card);
  paperOn(g2,-10.3,1.55,GYM.z1-.02,4.4,2.1,TM('lists',[],0xd8d1bd),Math.PI,'a1-lists');SPOT.lists={x:-10.3,z:GYM.z1-.1,y:1.55};
  SPOT.boardMesh=standBoard(g2,-1.6,7.45,3.2,2,TM('board',['shelter'],0xb88a58));SPOT.board={x:-1.6,z:7.42,y:1.35};
  // water: a table of bottles and cups, a pallet under it, a coffee urn
  table(g2,3.6,7.25,2.6,.7);SPOT.water={x:3.6,z:7.25,y:.8};for(let i=0;i<3;i++)K.box(g2,2.7+i*.42,.86,7.3,.36,.2,.26,plastic);for(let i=0;i<6;i++)K.cyl(g2,3.95+(i%3)*.11,.82,7.12+Math.floor(i/3)*.11,.035,.1,white,{sides:10});K.cyl(g2,4.6,.94,7.3,.13,.36,steel,{sides:14});
  for(let i=0;i<4;i++)K.box(g2,3.2+(i%2)*.8,.14+Math.floor(i/2)*.26,7.55,.74,.25,.4,plastic);
  // donated clothes; blankets on a pallet; folded cots; a power strip with too many phones
  table(g2,-12.25,1.4,.8,2.6);for(let i=0;i<7;i++)K.box(g2,-12.25+((i%2)-.5)*.3,.8+(i%3)*.05,.4+i*.32,.34,.07+(i%2)*.04,.28,M([0x8a5a7a,0x5c7a5a,0x2f4a6a,0xc9a8a0,0x7b7f78,0x9a3a32,0xe6e0cc][i],{roughness:1}));
  box(g2,-12.7,-11.5,0,.14,-2.6,-1.4,wood);for(let i=0;i<5;i++)box(g2,-12.6,-11.6,.14+i*.1,.23+i*.1,-2.5,-1.5,i%2?wool:wool2);solid('shelter',-12.1,-2,.62,.62);
  for(let i=0;i<4;i++)box(g2,-12.9,-12.74,0,1.9,-6.8+i*.12,-6.72+i*.12,cotCanvas);
  K.box(g2,-12.86,.2,3.6,.06,.05,.5,white);for(let i=0;i<7;i++)K.box(g2,-12.7,.012,3.38+i*.07,.11,.012,.055,black);SPOT.phones={x:-12.7,z:3.6,y:.05};
  // first aid: screens, a gurney, bags, an oxygen bottle
  for(let i=0;i<4;i++){const x=7.6+i*1.4;K.box(g2,x,1,-3.25,1.3,1.6,.02,screen);for(const dx of [-.66,.66])K.pipe(g2,[x+dx,0,-3.25],[x+dx,1.85,-3.25],.014,steel,5);}solid('shelter',9.7,-3.25,2.9,.12);
  box(g2,8.3,10.2,.62,.7,-6.4,-5.7,M(0xd9d5c9,{roughness:.7}));for(const x of [8.5,10])for(const z of [-6.3,-5.8])K.pipe(g2,[x,0,z],[x,.62,z],.018,steel,5);solid('shelter',9.25,-6.05,1,.4);SPOT.gurney={x:9.25,z:-6.05,y:.7};
  K.box(g2,11.6,.2,-6.9,.6,.4,.34,red);K.box(g2,12.3,.16,-5.8,.5,.32,.3,orange);K.cyl(g2,12.5,.42,-4.3,.09,.84,green,{sides:10});box(g2,11.2,12.7,.74,.78,-7.7,-7.2,white);solid('shelter',11.95,-7.45,.8,.3);SPOT.aid={x:10.4,z:-4.6};
  // the television, on a cart; chairs in front of it
  {const tv=new THREE.Group();tv.position.set(12.1,0,5.6);tv.rotation.y=-Math.PI/2;g2.add(tv);K.box(tv,0,.55,0,.9,.04,.5,steel);K.box(tv,0,1.0,0,.9,.04,.5,steel);for(const [dx,dz] of [[-.42,-.22],[.42,-.22],[-.42,.22],[.42,.22]])K.pipe(tv,[dx,0,dz],[dx,1,dz],.014,steel,5);
   K.box(tv,0,1.45,0,1.12,.72,.09,black);const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.04,.62),new THREE.MeshBasicMaterial({color:0x4a5a66}));scr.name='a1-tv-screen';scr.material.name='a1-tv-screen';scr.position.set(0,1.45,.05);tv.add(scr);SPOT.tvScreen=scr;
   const cap=new THREE.Mesh(new THREE.PlaneGeometry(1.04,.2),new THREE.MeshBasicMaterial({map:tex9('news'),transparent:true,opacity:tex9('news')?1:0,depthWrite:false}));cap.material.name='a1-tv-caption';cap.position.set(0,1.26,.056);tv.add(cap);solid('shelter',12.1,5.6,.3,.5);}
  SPOT.tv={x:12.05,z:5.6,y:1.45};SPOT.tvSeats=[];for(const [x,z] of [[9.6,4.6],[9.6,5.5],[9.6,6.4],[8.5,5],[8.5,5.9],[8.5,6.8]]){fchair(g2,x,z,Math.PI/2,{set:'shelter'});SPOT.tvSeats.push({x,z,a:Math.PI/2});}
  K.cyl(g2,-3.9,.4,7.4,.24,.8,M(0x4a4e52,{roughness:.7}),{sides:12});solid('shelter',-3.9,7.4,.26,.26);}
 // -- Monday: thinner --
 {const g2=G.thin;COTS.forEach((c,i)=>{if(c.row<2&&!(c.row===1&&c.col>3))cot(g2,c.x,c.z,{blanket:[1,2,1,0][i%4],set:'thin'});});cot(g2,1.8,0,{blanket:1,set:'thin'});cot(g2,5,0,{blanket:1,set:'thin'});
  for(let i=0;i<12;i++)box(g2,-12.9,-12.74,0,1.9,-4+i*.12,-3.92+i*.12,cotCanvas);for(let i=0;i<5;i++)box(g2,-12.6,-11.6,.14+i*.1,.23+i*.1,2.5,3.5,i%2?wool:wool2);solid('thin',-12.3,-3.3,.5,.9);solid('thin',-12.1,3,.62,.62);
  table(g2,-9.6,6.2,2.4,.75,{set:'thin'});K.box(g2,-9.5,.775,6.2,.24,.012,.32,white);paperOn(g2,-10.3,1.55,GYM.z1-.02,4.4,2.1,TM('lists',[],0xd8d1bd),Math.PI,'a1-lists-2');
  standBoard(g2,-1.6,7.45,3.2,2,TM('board',['monday'],0xb88a58),{set:'thin',name:'a1-board-2'});
  // the county's list: on the wall east of the doors, at a height a grown-up reads; a pen on a string
  SPOT.countyMesh=paperOn(g2,2.6,1.42,GYM.z1-.02,.78,1,TM('county',[0],0xfbfaf4),Math.PI,'a1-county');SPOT.county={x:2.6,z:GYM.z1-.06,y:1.42};paperOn(g2,3.55,1.42,GYM.z1-.02,.78,1,M(0xf4f1e6),Math.PI);paperOn(g2,4.5,1.42,GYM.z1-.02,.78,1,M(0xf4f1e6),Math.PI);
  K.pipe(g2,[3.02,1.62,GYM.z1-.03],[3.06,1.16,GYM.z1-.05],.003,black,4);SPOT.penMesh=K.cyl(g2,3.06,1.1,GYM.z1-.05,.006,.13,M(0x1b2c5a,{roughness:.4}),{sides:6});
  table(g2,3.6,6.4,2.6,.7,{set:'thin'});for(let i=0;i<2;i++)K.box(g2,2.9+i*.5,.86,6.4,.36,.2,.26,plastic);K.cyl(g2,4.6,.94,6.4,.13,.36,steel,{sides:14});
  for(const [x,z] of [[9.6,4.6],[9.6,5.5],[8.5,5]])fchair(g2,x,z,Math.PI/2,{set:'thin'});{const tv=new THREE.Group();tv.position.set(12.1,0,5.6);tv.rotation.y=-Math.PI/2;g2.add(tv);K.box(tv,0,1,0,.9,.04,.5,steel);for(const [dx,dz] of [[-.42,-.22],[.42,-.22],[-.42,.22],[.42,.22]])K.pipe(tv,[dx,0,dz],[dx,1,dz],.014,steel,5);K.box(tv,0,1.45,0,1.12,.72,.09,black);solid('thin',12.1,5.6,.3,.5);}}
 // -- September 5: Alex's pictures --
 {const g2=G.memorial;SPOT.rows=[];for(let r=0;r<6;r++)for(let c=0;c<10;c++){const x=(c<5?-5.6:1.2)+(c%5)*1.1,z=-2.2+r*1.25;fchair(g2,x,z,0);SPOT.rows.push({x,z,r,c});}
  for(let r=0;r<6;r++){solid('memorial',-3.4,-2.2+r*1.25,2.5,.26);solid('memorial',3.4,-2.2+r*1.25,2.5,.26);}
  // the front: an easel with his picture; a table, a white cloth, his camera, flowers
  {const e=new THREE.Group();e.position.set(-1.9,0,-5.9);e.rotation.y=.18;g2.add(e);for(const dx of [-.3,.3])K.pipe(e,[dx,0,.12],[dx*.3,1.9,-.06],.016,wood,6);K.pipe(e,[0,0,-.4],[0,1.85,-.07],.016,wood,6);K.box(e,0,.95,.08,.72,.03,.06,wood);
   const fr=K.box(e,0,1.4,.09,.66,.82,.03,M(0x2a2420,{roughness:.5}));fr.rotation.x=-.08;const pp=K.plane(e,0,1.4,.112,.58,.74,TM('portrait',['alex'],0x8aa38f),{name:'a1-alex-portrait'});pp.rotation.x=-.08;solid('memorial',-1.9,-5.9,.45,.4);}
  SPOT.portrait={x:-1.9,z:-5.8,y:1.4};box(g2,-.6,2.6,0,.74,-6.5,-5.7,white);solid('memorial',1,-6.1,1.65,.45);SPOT.table={x:1,z:-6.1,y:.78};SPOT.camera={x:.6,z:-6,y:.8};
  for(const [x,c] of [[-.3,0xe8d8e0],[2.3,0xf1ede2]]){K.cyl(g2,x,.86,-6.2,.07,.24,M(0x8fa6bd,{roughness:.3}),{sides:10});for(let i=0;i<7;i++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.055,0),M(c,{roughness:1}));f.position.set(x+Math.cos(i)*.09,1.05+(i%3)*.05,-6.2+Math.sin(i)*.09);g2.add(f);K.pipe(g2,[x,.95,-6.2],[f.position.x,f.position.y,f.position.z],.004,green,4);}}
  // his pictures, on boards along both walls (three a side), each with a lamp clipped to it
  SPOT.prints=[];for(const s of [-1,1])for(let i=0;i<3;i++){const z=-4.4+i*3.6,x=s*12.2;const p=standBoard(g2,x,z,1.9,1.4,TM('prints',[i+(s>0?3:0)],0x2b2f36),{ry:s>0?-Math.PI/2:Math.PI/2,set:'memorial',name:'a1-prints'});void p;SPOT.prints.push({x:x-s*.1,z,y:1.3,i:i+(s>0?3:0)});}
  // by the doors: a table with a book, cards and pens (leave something, or do not)
  table(g2,-9.6,6.2,2.2,.75,{set:'memorial'});K.box(g2,-9.9,.78,6.2,.42,.03,.3,M(0x3a2a22,{roughness:.6}));K.box(g2,-9.9,.797,6.2,.38,.006,.27,white);for(let i=0;i<5;i++)K.box(g2,-9.2+(i%2)*.02,.775+i*.004,6.15+(i%2)*.03,.16,.004,.1,white);K.cyl(g2,-8.85,.82,6.35,.035,.09,black,{sides:8});
  SPOT.book={x:-9.6,z:6.2,y:.82};SPOT.cardBox=K.box(g2,-10.6,.83,6.2,.26,.13,.2,wood);SPOT.cards={x:-10.6,z:6.2,y:.9};
  // (your seats: third row, the aisle; Sam's beside you)
  SPOT.seatYou={x:-1.2,z:.3,a:0};SPOT.seatSam={x:-2.3,z:.3,a:0};}
 // -- the lot on the first morning: the bus, the ambulance, a tent, cones --
 const truck=rescueTruck();
 {const g2=G.lot;const bus=new THREE.Group();bus.position.set(14.5,0,15.3);bus.rotation.y=Math.PI/2;g2.add(bus);K.box(bus,0,1.55,0,2.5,2.3,9.4,busY);K.box(bus,0,1.0,-5.3,2.3,1.2,1.3,busY);K.box(bus,0,2.74,0,2.3,.1,9,white);
  for(const s of [-1,1]){for(let z=-3.9;z<4.4;z+=1.05)K.box(bus,s*1.26,2.05,z,.02,.62,.82,darkGlass);K.box(bus,s*1.26,1.25,0,.02,.09,9.3,black);K.box(bus,s*1.26,.82,0,.02,.07,9.3,black);for(const z of [-3.6,3.1])K.cyl(bus,s*1.1,.5,z,.5,.3,black,{sides:14,rz:Math.PI/2});}
  K.box(bus,0,2.0,-4.72,2.2,.75,.03,darkGlass);K.box(bus,0,2.55,-4.7,1.3,.24,.03,black);solid('lot',14.5,15.3,4.9,1.4);SPOT.bus={x:14.5,z:15.3};
  truck.g.position.set(-17,0,16.2);truck.g.rotation.y=-Math.PI/2;g2.add(truck.g);solid('lot',-17,16.2,3.6,1.35);SPOT.truck={x:-17,z:16.2,y:1.4};SPOT.gurneyOut={x:-12.4,z:15.1};
  box(g2,-13.4,-11.5,.62,.7,14.75,15.45,M(0xd9d5c9,{roughness:.7}));for(const x of [-13.2,-11.7])for(const z of [14.85,15.35])K.pipe(g2,[x,0,z],[x,.62,z],.018,steel,5);solid('lot',-12.45,15.1,1,.42);
  // the tent: four poles, a white top; a table of water under it
  for(const [x,z] of [[5.2,10.9],[8.8,10.9],[5.2,12.8],[8.8,12.8]])K.pipe(g2,[x,0,z],[x,2.3,z],.02,steel,6);for(const [a,b] of [[[5.2,2.3,10.9],[7,2.95,11.85]],[[8.8,2.3,10.9],[7,2.95,11.85]],[[5.2,2.3,12.8],[7,2.95,11.85]],[[8.8,2.3,12.8],[7,2.95,11.85]]])K.pipe(g2,a,b,.014,steel,5);
  {const top=new THREE.Mesh(new THREE.ConeGeometry(2.65,.7,4,1,true),tent);top.rotation.y=Math.PI/4;top.position.set(7,2.62,11.85);top.scale.set(1,1,.56);g2.add(top);}
  table(g2,7,11.6,2.4,.7,{set:'lot'});for(let i=0;i<4;i++)K.box(g2,6.2+i*.42,.86,11.6,.36,.2,.26,plastic);for(let i=0;i<5;i++)K.box(g2,5.6+(i%3)*.8,.14,12.5,.74,.25,.4,plastic);SPOT.tent={x:7,z:11.6,y:.8};
  for(const [x,z] of [[-30,13.8],[-27,13.8],[-24,13.8],[22,13.8],[25,13.8]]){const c=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,10),orange);c.position.set(x,.25,z);g2.add(c);}
  // a light tower by the lot's far side, a generator under it (it has been dark for four hours; it is not now)
  K.box(g2,-30,.5,30,1.6,1,1,M(0xd9b12e,{roughness:.6}));K.pipe(g2,[-30,1,30],[-30,6.4,30],.05,steel,6);K.box(g2,-30,6.5,30,1.3,.4,.2,white);solid('lot',-30,30,.9,.6);SPOT.tower={x:-30,z:30,y:6.5};}
 for(const g2 of [G.shelter,G.thin,G.memorial])bake(g2,new Set([SPOT.tvScreen,SPOT.boardMesh,SPOT.countyMesh,SPOT.penMesh,SPOT.cardBox].filter(Boolean)));
 bake(G.lot,new Set([truck.g]));
 // smoke on the horizon to the north-east, where Oak Hollow is: four columns, leaning the way the morning's air goes
 const SMOKE=[];{const puff=puffTexture();for(const [x,z,sz,c] of [[150,-210,34,0x2a2220],[96,-250,26,0x35302c],[210,-150,30,0x2c2826],[30,-270,22,0x3a3531]]){const sp=[...Array(6)].map((_,k)=>{const m=new THREE.SpriteMaterial({map:puff,color:c,transparent:true,opacity:0,depthWrite:false,fog:false});m.name='a1-smoke';const s=new THREE.Sprite(m);root.add(s);return {s,t:k*2.3};});SMOKE.push({x,z,sz,sp});}}
 // ---- places people use -----------------------------------------------------------------------------------------------------------------
 Object.assign(SPOT,{start:{x:-44,z:60,a:0},turn:{x:-43.6,z:17.2},lane:{x:-12,z:15.6},rackYou:{x:.2,z:12.55,a:Math.PI/2+.5},rackSlot:{x:.55,z:12.02,a:.12},rackSam:{x:3.6,z:13.55,a:Math.PI/2},rackSamSlot:{x:2.4,z:12.05,a:.1},
  doorsOut:{x:-5.5,z:11.6},vest:{x:-5.5,z:9.3},inside:{x:-5.5,z:6.6},aisleS:{x:3.4,z:4.9},aisleN:{x:3.4,z:1.45},seatYou:{x:1.8,z:.62,a:Math.PI,cot:14},seatSam:{x:5,z:.62,a:Math.PI,cot:15},
  reyesCar:{x:-8,z:16.7,a:Math.PI/2},reyesOut:{x:-7.2,z:15.2},carFrom:{x:-44,z:96,a:0},carIn:[[-44,70],[-44,30],[-40,21.6],[-24,20.8],[-13,18.2],[-8,16.7]],way:[[-44,24],[-39,20.6],[-10,20.4],[-3,16.4],[.4,14.3]],
  eastDoor:{x:12.2,z:2.6},corrE:{x:14.7,z:2.6},
  jmFrom:{x:-8.2,z:4.6},dadFrom:{x:-11.4,z:-4.2},momFrom:{x:-9.4,z:-4.1},gymDoor:{x:-5.5,z:7.3}});
 const cotSeat=(i,side=1)=>({x:COTS[i].x,z:COTS[i].z+side*.2,a:side>0?Math.PI:0,y:COT_H});// sitting on its long edge, facing away from it
 const cotLie=(i,flip=false)=>({x:COTS[i].x-.05,z:COTS[i].z,a:flip?Math.PI/2:-Math.PI/2,y:COT_H});
 // ---- nav ---------------------------------------------------------------------------------------------------------------------------------
 const ST={on:false,state:null,lot:false,t:0,light:'dawn'};
 const inR=(q,R,r=0)=>q.x>R.x0+r&&q.x<R.x1-r&&q.z>R.z0+r&&q.z<R.z1-r;
 const doorway=(q,D,r,alongZ)=>alongZ?(q.x>D.x0+r&&q.x<D.x1-r&&q.z>D.z0&&q.z<D.z1):(q.z>D.z0+r&&q.z<D.z1-r&&q.x>D.x0&&q.x<D.x1);
 const solids=()=>[SOLID.shell,ST.state?SOLID[ST.state]:null,ST.lot?SOLID.lot:null];
 const hits=(q,r)=>{for(const L of solids()){if(!L)continue;for(let i=0;i<L.length;i++)if(inBox(q.x,q.z,L[i],r))return true;}return false;};
 const indoors=q=>inR(q,GYM)||inR(q,CORR)||inR(q,NURSE)||inR(q,CLASS)||inR(q,VEST)||inR(q,{x0:12.9,x1:13.5,z0:1.95,z1:3.25})||inR(q,{x0:15.9,x1:16.3,z0:-6.65,z1:1.65});
 const outside=(q,r=0)=>inR(q,LOT,r)||inR(q,DRIVE,r);
 function walkL(q,r){const rd=Math.min(r,.3);
  if(!(inR(q,GYM,r)||inR(q,CORR,r)||inR(q,NURSE,r)||inR(q,CLASS,r)||inR(q,VEST,r)||outside(q,r)||doorway(q,DOORS.gym,rd,true)||doorway(q,DOORS.out,rd,true)||doorway(q,DOORS.east,rd,false)||doorway(q,DOORS.nurse,rd,false)||doorway(q,DOORS.room,rd,false)))return false;
  return !hits(q,r);}
 const nav={kind:'aftermath1-school',inside:(x,z)=>ST.on&&Math.abs(x-O.x)<340&&Math.abs(z-O.z-40)<300,
  walkable:(x,z,r=.28)=>walkL(toL(x,z),r),rideable:(x,z,{r=.3}={})=>{const q=toL(x,z);return (inR(q,LOT,r)&&q.z>13.25+r||inR(q,DRIVE,r))&&!hits(q,r+.1);},
  floorAt:()=>0,surface:(x,z)=>{const q=toL(x,z);return inR(q,GYM)?'gym':indoors(q)?'floor':outside(q)?'asphalt':'grass';},
  headingAt:(x,z)=>{const q=toL(x,z);return q.z<22&&q.x>-40?Math.PI/2:0;}};
 const where=(x,z)=>{const q=toL(x,z);return inR(q,GYM)?'gym':inR(q,CORR)?'corridor':inR(q,NURSE)?'nurse':inR(q,CLASS)?'room':inR(q,VEST)||q.z<10.45&&q.z>8&&Math.abs(q.x+5.5)<1.6?'vestibule':'lot';};
 // how much of a room you are in (the light: 1 inside, 0 out on the lot; the vestibule between)
 const insideK=(x,z)=>{const q=toL(x,z);if(inR(q,GYM)||inR(q,CORR,-.4)||inR(q,NURSE)||inR(q,CLASS))return 1;if(q.z<10.6&&q.z>7.6&&Math.abs(q.x+5.5)<2)return clamp((10.6-q.z)/2.4,0,1);return 0;};
 // ---- the light in it, by the hour: the windows, the lamps, the horizon's smoke -------------------------------------------------------------
 const LIGHT={dawn:{win:0xc98a5c,lamp:0xffefc8,smoke:.7},smoke:{win:0xd8c8a8,lamp:0xfff3d6,smoke:.4},day:{win:0xdfe6ea,lamp:0xfff6e2,smoke:0}};
 function setLight(name){ST.light=name;const L=LIGHT[name]||LIGHT.day;skyM.color.setHex(L.win);lampM.color.setHex(L.lamp);for(const c of SMOKE)for(const S2 of c.sp)S2.s.visible=L.smoke>0;}
 function update(dt,{camera=null}={}){if(!ST.on)return;ST.t+=dt;const L=LIGHT[ST.light]||LIGHT.day;
  if(L.smoke>0)for(const c of SMOKE)for(const S2 of c.sp){S2.t+=dt;const life=14,k2=(S2.t%life)/life;S2.s.position.set(c.x+k2*30,6+k2*c.sz*2.6,c.z-k2*14);const sc=c.sz*(.7+k2*1.7);S2.s.scale.set(sc,sc,1);S2.s.material.opacity=.5*L.smoke*Math.sin(Math.PI*k2);}
  truck.update(ST.t,ST.lot&&ST.truckOn);}
 // show(state, {lot}): 'shelter' | 'thin' | 'memorial' | 'empty' | null (gone)
 function show(state,{lot=false,light='dawn',truckOn=true}={}){const on=!!state;ST.on=on;ST.state=state&&state!=='empty'?state:null;ST.lot=on&&lot;ST.truckOn=truckOn;if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();
  for(const [kk,g2] of Object.entries(G))g2.visible=kk==='lot'?ST.lot:kk===ST.state;if(on)setLight(light);}
 function reset(){show(null);ST.t=0;}
 return {root,O,W,toL,nav,SPOT,NSPOT,RSPOT,COTS,COT_H,cotSeat,cotLie,GYM,DOORS,RACK,LAMPS,show,reset,update,setLight,where,insideK,ST,truck,G,TM,M,K};
}
