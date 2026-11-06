// Fixed dressing is baked with its own house. Animated lamps, photographs, doors,
// drawers and clues stay on their original pivots and retain their interaction bounds.
import * as THREE from './three.module.js';
import {makeShapes,paper} from './chapter6-kit.js';
import {roundedBoxGeometry} from './kit.js';
import {finish,wallPrintArt} from './chapter7-finishes.js';

const K=makeShapes(), paint=new Map();
function coat(color,roughness=.83) {
 const id=color+'/'+roughness;
 if(!paint.has(id))paint.set(id,new THREE.MeshStandardMaterial({color,roughness}));
 return paint.get(id);
}
const cream=coat(0xe4d9be), brass=coat(0xa48855,.4), walnut=coat(0x614838);
const softGeometry=new Map();
export function cushion(g,x,y,z,w,h,d,m,r=.035) {
 const key=[w,h,d,r].join('/');
 if(!softGeometry.has(key))softGeometry.set(key,roundedBoxGeometry(w,h,d,Math.min(r,w*.45,h*.45,d*.45)));
 const o=new THREE.Mesh(softGeometry.get(key),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
}

export function dressWindow(parent,x,y,z,angle,w,h,cloth,{clearPane=false}={}) {
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);
 for(const side of [-1,1]){
  K.box(g,side*(w/2+.028),0,0,.065,h+.14,.077,cream);
  const geo=new THREE.PlaneGeometry(1,1,18,6),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
   const u=p.getX(i)+.5, v=p.getY(i)+.5, gather=.8+.24*Math.cos(v*Math.PI*1.6);
   p.setXYZ(i,side*(w*.5-.02+(u-.48)*w*.31*gather),(.51-v)*h*1.23-.025+.018*Math.sin(u*20)*(1-v),.09+.043*Math.cos(u*32+.32*Math.sin(v*5)));
  }
  geo.computeVertexNormals();const panel=new THREE.Mesh(geo,cloth);panel.castShadow=true;panel.receiveShadow=true;g.add(panel);
 }
 K.box(g,0,h*.5+.06,0,w+.19,.085,.083,cream);
 K.box(g,0,-h*.5-.025,.041,w+.2,.065,.16,cream);
 if(clearPane)K.box(g,0,h*.33,.026,w,.028,.035,cream);
 else {K.box(g,0,0,.026,w,.028,.035,cream);K.box(g,0,0,.025,.032,h,.038,cream);}
 K.pipe(g,[-w*.66,h*.62,.105],[w*.66,h*.62,.105],.014,brass);
}
const curtainColors=new Map();
export function curtain(color) {
 if(!curtainColors.has(color)){const m=finish('weave',color).clone();m.side=THREE.DoubleSide;m.name='c7-curtain-'+color;curtainColors.set(color,m);}
 return curtainColors.get(color);
}

function framed(parent,x,y,z,angle,w,h,kind) {
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);
 K.box(g,0,0,0,w+.045,h+.045,.038,walnut);K.box(g,0,0,.021,w,h,.012,cream);
 K.plane(g,0,0,.029,w-.054,h-.06,wallPrintArt(kind));
}
function books(g,x,y,z,dir,count) {
 const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=dir;g.add(group);
 const colors=[0x68736b,0xbb9d64,0x706663,0x956c4f,0x38576a];
 for(let k=0;k<count;k++) {
  const h=.15+.065*Math.abs(Math.sin(k*9)),m=coat(colors[k%5]),cx=.042*k;
  K.box(group,cx,h/2,0,.038,h,.14,m);
  K.box(group,cx,h-.006,0,.033,.009,.129,cream);
  K.box(group,cx,h*.7,.071,.031,.008,.0015,cream);
 }
}
const washes=new Map();
function lightCard(kind) {
 if(washes.has(kind))return washes.get(kind);
 const tex=paper(256,256,(c,w,h)=>{
  const rgb=kind==='day'?'255,221,153':kind==='lamp'?'247,174,95':'146,181,185';
  const gr=c.createRadialGradient(125,122,7,125,122,123);gr.addColorStop(0,'rgba('+rgb+',.68)');gr.addColorStop(.53,'rgba('+rgb+',.34)');gr.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=gr;c.fillRect(0,0,w,h);
  if(kind==='day'){c.globalCompositeOperation='destination-out';c.fillStyle='rgba(0,0,0,.68)';c.fillRect(121,0,6,256);c.fillRect(0,125,256,5);for(let k=0;k<8;k++)c.fillRect(0,40+k*21,256,2);}
 });
 const m=new THREE.MeshBasicMaterial({map:tex,color:0xffffff,transparent:true,opacity:tex ? .64 : 0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,toneMapped:false});
 washes.set(kind,m);return m;
}
function pool(g,x,y,z,w,d,kind,angle=0) {
 const o=K.plane(g,x,y,z,w,d,lightCard(kind),{rx:-Math.PI/2,ry:angle,name:'c7-'+kind+'-spill'});return o;
}
function sconce(g,x,y,z,face=0) {
 const t=new THREE.Group();t.position.set(x,y,z);t.rotation.y=face;g.add(t);
 K.cyl(t,0,0,0,.09,.035,brass,{rx:Math.PI/2});K.pipe(t,[0,-.04,.01],[0,-.08,.14],.016,brass);
 K.cyl(t,0,.025,.14,.065,.19,coat(0xe2c59c),{r2:.1,sides:14});
 K.cyl(t,0,.115,.14,.098,.012,brass);K.cyl(t,0,-.075,.14,.063,.015,brass);
}
function shelfOfTins(g,x,y,z,angle) {
 const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;g.add(group);
 const label=[0x647660,0xad6650,0xccb987,0x6e8590];
 for(let row=0;row<3;row++){const h=row*.37;
  K.box(group,0,h,0,.81,.028,.19,walnut);
  for(let k=0;k<(row===1?3:4);k++){const cx=-.31+k*.165,ht=.13+(k%2)*.047;
   K.cyl(group,cx,h+.02+ht*.5,0,.052,ht,coat(label[(k+row)%4]));K.cyl(group,cx,h+.024+ht,0,.054,.01,brass);
   K.box(group,cx,h+ht*.55,.05,.052,.038,.003,cream);}
 }
}
function vent(g,x,y,z,angle) {
 const p=new THREE.Group();p.position.set(x,y,z);p.rotation.y=angle;g.add(p);
 K.box(p,0,0,0,.36,.17,.015,coat(0x806f58));
 for(let n=0;n<7;n++)K.box(p,0,-.066+n*.022,.012,.326,.009,.009,cream);
}
function pendant(g,x,ceiling,z,drop,col) {
 K.cyl(g,x,ceiling-.028,z,.12,.05,brass);K.cyl(g,x,ceiling-drop*.5,z,.007,drop,walnut);
 const m=new THREE.MeshStandardMaterial({color:col,emissive:0xe8ba79,emissiveIntensity:.28,side:THREE.DoubleSide});
 K.cyl(g,x,ceiling-drop-.09,z,.205,.19,m,{r2:.052,sides:20});K.cyl(g,x,ceiling-drop-.189,z,.192,.012,cream);
}
export function dressSam(g,{F,W,D,H}) {
 const inner=D-.15;
 const morning=new THREE.Group();morning.name='c7-morning-window-light';g.add(morning);
 pool(morning,4.28,F+.034,inner-1.1,1.45,2.4,'day',-.19);
 pool(morning,-3.45,F+.038,-2.9,1.3,2.4,'day',.28);
 dressWindow(g,4.2,F+1.475,inner-.1,Math.PI,1.3,1.25,curtain(0x9dafa8),{clearPane:true});
 dressWindow(g,-4,F+1.475,inner-.1,Math.PI,1.2,1.25,curtain(0xe1cba7));
 dressWindow(g,-3.6,F+1.51,-inner+.1,0,1.4,1,curtain(0xc6ba9d));
 framed(g,2.96,F+1.52,inner-.085,Math.PI,.48,.59,'summer');
 framed(g,-4.98,F+1.56,.895,0,.72,.56,'field');
 books(g,2.42,F+.58,3.6,Math.PI/2,7);
 // Pencil cup, school pencils, eraser and a rolled bicycle route on the desk.
 K.cyl(g,3.14,F+.819,inner-.29,.047,.14,coat(0x56736e),{r2:.050});
 for(let k=0;k<5;k++){const q=K.cyl(g,3.115+k*.011,F+.90+(k%2)*.016,inner-.29,.004,.13,coat([0xc49b50,0x697479,0xab6b54][k%3]),{sides:6});q.rotation.z=(k-2)*.085;}
 K.box(g,3.08,F+.777,inner-.45,.065,.018,.025,coat(0xba8779));
 vent(g,W-.26,F+.20,2.3,-Math.PI/2);pendant(g,-3,F+H-.19,-2,.35,0xe7dbc0);
 return morning;
}

export function dressLange(g,{F,W,D,H}) {
 const x=W/2-.28,z=D/2-.28;
 for(const [px,pz,ang] of [[-W*.3,-z,0],[W*.28,-z,0],[-x,-3,Math.PI/2],[x,-2.6,-Math.PI/2],[-x,3,Math.PI/2],[W*.25,z,Math.PI],[-W*.25,z,Math.PI]])
  dressWindow(g,px,F+1.45,pz,ang,1,1.15,curtain(0xd5b89f));
 framed(g,-4.3,F+1.56,.315,Math.PI,.66,.50,'mill');
 framed(g,4.3,F+1.62,.315,Math.PI,.49,.60,'field');
 sconce(g,-1.2,F+1.93,1.51,Math.PI);vent(g,.74,F+.22,1.51,Math.PI);
 pendant(g,3.2,F+H-.07,-2.3,.43,0xd5bd92);
 // Tea towel and place mats: these stay on the existing cabinet/table footprints.
 const towel=cushion(g,5.34,F+.77,-2.88,.025,.28,.22,finish('weave',0xb49377),.01);towel.rotation.z=.055;
 for(const [x0,z0] of [[3.20,-2.56],[3.2,-2.02],[2.77,-2.30]]){
  K.box(g,x0,F+.751,z0,.34,.002,.24,coat(0x8a8a69));K.box(g,x0+.11,F+.758,z0,.036,.002,.15,cream);
 }
 pool(g,-4.8,F+.03,-2.3,1.8,2.3,'cold');pool(g,-.2,F+.024,1.02,.77,.92,'lamp');
}
export function dressGreen(g,{F,UP,H2}) {
 for(const [x,y,z,a] of [[-3.2,F,-4.38,0],[3.2,F,-4.38,0],[-3.2,UP,-4.38,0],[3.2,UP,-4.38,0]])dressWindow(g,x,y+1.525,z,a,1,1.25,curtain(0xa5a287));
 framed(g,-1.565,UP+1.50,.72,Math.PI/2,.34,.44,'mill');
 framed(g,-1.57,UP+1.52,-2.90,Math.PI/2,.42,.54,'field');
 sconce(g,-1.11,F+2.14,-.45,Math.PI/2);sconce(g,.99,UP+1.79,4.39,Math.PI);
 // Amber glass at the landing gives the hunter a real backlight and a fixed reference in the dark.
 const win=new THREE.Group();win.position.set(-.05,UP+1.42,4.38);win.rotation.y=Math.PI;g.add(win);
 const glass=new THREE.MeshStandardMaterial({color:0x9faaa0,emissive:0xa8b7a1,emissiveIntensity:.56,roughness:.39});
 K.box(win,0,0,0,.76,.96,.04,walnut);K.box(win,0,0,.024,.69,.89,.01,glass);
 for(const xx of [-.21,0,.21])K.box(win,xx,0,.033,.016,.88,.014,brass);
 for(const yy of [-.26,.22])K.box(win,0,yy,.033,.69,.014,.014,brass);
 // Closets read as shelving and worn paint at arm's length, including from the hiding camera.
 shelfOfTins(g,4.33,F+.67,4.36,Math.PI);
 books(g,-1.96,F+.61,.32,0,5);
 for(let k=0;k<16;k++){
  const z=-1.6+(k+.5)*4.2/16,y=F+(k+1)*(UP-F)/16;
  K.box(g,0,y-.004,z-.128,.93,.012,.032,coat(0xc1a778));
  if(k%3===0)K.cyl(g,.62,y+.40,z,.018,.78,walnut,{sides:8});
 }
 pool(g,0,UP+.014,3.35,1.65,2.1,'cold');
 pool(g,3.4,F+.016,2.44,1.6,2.15,'lamp',.4);
 pendant(g,3.3,F+2.75,-2.9,.48,0xc4be99);pendant(g,-3.15,UP+H2,2.6,.16,0xbeba9f);
}
