// Chapter Seven: a small building kit for the chapter's own places (Sam's house inside, Old Mill Court and its houses, the
// lane behind the oak). Everything is ordinary geometry in a group's own frame, merged by material afterwards (bake), so a
// later art pass can replace any piece by name without touching the scenes: the scenes only read positions, doors and nav.
//
// Conventions: x across, z along (each place says which way its front is), y up from that place's own floor. Walls are
// boxes (both faces render); a wall's openings are [u0,u1,v0,v1] along it and up it. Doors turn on a pivot (set(0..1)).
import * as THREE from './three.module.js';
import {artSurface} from './art-surfaces.js';
import {paper,makeShapes} from './chapter6-kit.js';
import {seeded} from './kit.js';

const mats=new Map();
// a material, shared by colour and options; kind: an art-surfaces recipe (plaster, timber, carpet, textile, housepaint...)
export function mat(color,o={},kind=null){const key=color+'|'+JSON.stringify(o)+'|'+kind;if(mats.has(key))return mats.get(key);
 const m=new THREE.MeshStandardMaterial({color,roughness:.85,...o});if(kind)artSurface(m,kind);m.name='c7-'+(kind||'m')+'-'+color.toString(16);mats.set(key,m);return m;}
export const C7={
 trim:0xeeeae0,plaster:0xd8d2c2,ceiling:0xe4e0d6,oak:0x8a6440,pine:0xb08a5c,walnut:0x5a3e2a,dark:0x232426,steel:0x9aa0a4,chrome:0xc8ccd0,black:0x151516,
 glassLit:0xffd29a,glassDark:0x1c252c,lawn:0x5d7a3c,asphalt:0x3b3b3d,concrete:0xa9a69c,brick:0x8a4f3c,
};
// window glass: one lit (warm, its brightness a shared uniform the chapter turns up at dusk) and one dark; real glass (see-through)
export const glassLit=new THREE.MeshStandardMaterial({color:0x6a5a40,emissive:C7.glassLit,emissiveIntensity:0,roughness:.3});glassLit.name='c7-glass-lit';
export const glassDark=new THREE.MeshStandardMaterial({color:C7.glassDark,roughness:.12,metalness:.35});glassDark.name='c7-glass-dark';
export const glassClear=new THREE.MeshStandardMaterial({color:0xb8c8d0,roughness:.05,metalness:.1,transparent:true,opacity:.16,depthWrite:false});glassClear.name='c7-glass-clear';
export const porchGlow=new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffd890,emissiveIntensity:0,roughness:.4});porchGlow.name='c7-porch-bulb';

// ---- walls, floors, doors ----------------------------------------------------------------------------------------------------
export function createBuild(root){const K=makeShapes(),g0=root;
 // a straight wall (a box) from a to b, thickness t, from y0 to y1, with openings; returns its parts
 function wall(a,b,{y0=0,y1=2.5,t=.12,m,holes=[],g=g0,name='wall'}={}){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]),out=[];
  const piece=(u0,u1,v0,v1)=>{if(u1-u0<.01||v1-v0<.01)return;const um=(u0+u1)/2,x=a[0]+Math.cos(ang)*um,z=a[1]+Math.sin(ang)*um;out.push(K.slab(g,x,(v0+v1)/2,z,u1-u0,v1-v0,t,m,{ry:-ang,name}));};
  const hs=holes.slice().sort((p,q)=>p[0]-q[0]);let u=0;for(const [h0,h1,v0,v1] of hs){piece(u,h0,y0,y1);piece(h0,h1,y0,y0+v0);piece(h0,h1,y0+v1,y1);u=h1;}piece(u,L,y0,y1);return out;}
 function floor(x0,z0,x1,z1,y,m,{g=g0,t=.06,name='floor'}={}){return K.slab(g,(x0+x1)/2,y-t/2,(z0+z1)/2,x1-x0,t,z1-z0,m,{name,shadow:false});}
 function ceiling(x0,z0,x1,z1,y,m,{g=g0}={}){return K.slab(g,(x0+x1)/2,y+.03,(z0+z1)/2,x1-x0,.06,z1-z0,m,{name:'ceiling',shadow:false});}
 // a door leaf hinged at (x,z); w wide, h high; rot: the closed leaf's angle (radians, about y; 0 = along +x); open swings +swing
 function door(x,z,{w=.86,h=2.03,rot=0,swing=1.45,m=mat(0x8a6a4a,{},'timber'),knob=true,g=g0,name='door',y=0}={}){const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,z);pivot.rotation.y=rot;g.add(pivot);
  const leaf=K.slab(pivot,w/2,h/2,0,w,h,.045,m,{name:name+'-leaf'});for(const s of [-1,1])for(const yy of [.6,1.45])K.slab(pivot,w/2,yy,s*.026,w*.7,.55,.008,m);
  if(knob)for(const s of [-1,1])K.cyl(pivot,w-.08,1,s*.04,.028,.04,mat(0xb89a5a,{metalness:.7,roughness:.35}),{rx:Math.PI/2});
  const D={pivot,leaf,open:0,set(v){D.open=v;pivot.rotation.y=rot+swing*v;}};return D;}
 // a window: frame, sill, mullions and a pane (lit / dark / clear)
 function windowAt(x,y,z,{w=1.1,h=1.25,rot=0,pane=glassDark,frame=mat(C7.trim),mull=true,g=g0,sill=true}={}){const wg=new THREE.Group();wg.position.set(x,y,z);wg.rotation.y=rot;g.add(wg);
  K.slab(wg,0,0,0,w,h,.02,pane,{name:'pane',shadow:false});for(const [px,py,pw,ph] of [[-w/2,0,.06,h+.06],[w/2,0,.06,h+.06],[0,h/2,w+.06,.06],[0,-h/2,w+.06,.06]])K.slab(wg,px,py,.03,pw,ph,.07,frame);
  if(mull){K.slab(wg,0,0,.035,.035,h,.04,frame);K.slab(wg,0,0,.035,w,.035,.04,frame);}if(sill)K.slab(wg,0,-h/2-.04,.07,w+.16,.04,.14,frame);return wg;}
 return {K,wall,floor,ceiling,door,windowAt};}

// ---- furniture (each a group at its own base centre, facing -z: a person using it stands at -z) ----------------------------------
export function createFurniture(){const K=makeShapes();
 const G=(name)=>{const g=new THREE.Group();g.name=name;return g;};
 const wood=mat(C7.oak,{},'timber'),dk=mat(C7.walnut,{},'timber'),pine=mat(C7.pine,{},'timber');
 const F={
  bed({w=1.0,l=2.0,cover=0x4a6a8a,frame=wood,rumpled=true}={}){const g=G('bed');K.box(g,0,.2,0,w+.06,.28,l+.06,frame);K.box(g,0,.43,0,w,.2,l-.02,mat(0xe8e4da,{},'textile'));
   const c=K.box(g,0,.56,.1,w+.04,.08,l*.8,mat(cover,{},'textile'));if(rumpled){c.rotation.z=.02;const r=K.box(g,.12,.62,.2,w*.6,.08,.5,mat(cover,{},'textile'));r.rotation.set(.1,.3,.05);}
   K.box(g,0,.62,-l/2+.25,w*.7,.13,.38,mat(0xf2efe6,{},'textile'));K.box(g,0,.7,-l/2-.02,w+.06,1,.06,frame);return g;},
  desk({w=1.2,d=.6,h=.74,m=wood}={}){const g=G('desk');K.box(g,0,h-.02,0,w,.04,d,m);for(const sx of [-1,1])K.box(g,sx*(w/2-.03),h/2-.02,0,.04,h-.04,d-.02,m);K.box(g,w/2-.25,h-.2,0,.44,.24,d-.04,m);K.box(g,w/2-.25,h-.2,-d/2+.005,.4,.2,.01,mat(0x6a4a30));return g;},
  chair({m=wood,seat=.45}={}){const g=G('chair');K.box(g,0,seat,0,.44,.04,.42,m);for(const [x,z] of [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]])K.box(g,x,seat/2,z,.035,seat,.035,m);K.box(g,0,seat+.36,.19,.44,.5,.035,m);return g;},
  dresser({w=1.1,d=.48,h=.82,m=wood}={}){const g=G('dresser');K.box(g,0,h/2,0,w,h,d,m);for(let k=0;k<3;k++){K.box(g,0,.15+k*.25,-d/2-.005,w-.06,.2,.01,dk);K.box(g,0,.15+k*.25,-d/2-.02,.12,.025,.02,mat(0xb89a5a,{metalness:.6}));}return g;},
  shelf({w=.9,d=.3,h=1.8,n=5,m=wood}={}){const g=G('shelf');for(const sx of [-1,1])K.box(g,sx*(w/2-.02),h/2,0,.03,h,d,m);K.box(g,0,h/2,d/2-.01,w,h,.015,m);for(let k=0;k<n;k++)K.box(g,0,.05+k*(h-.1)/(n-1),0,w-.04,.025,d,m);return g;},
  couch({w=2.1,d=.9,m=mat(0x7a6a52,{},'textile')}={}){const g=G('couch');K.box(g,0,.24,0,w,.3,d,m);K.box(g,0,.62,d/2-.12,w,.5,.24,m);for(const s of [-1,1])K.box(g,s*(w/2-.1),.46,0,.2,.32,d,m);for(let k=0;k<3;k++)K.box(g,(k-1)*w*.3,.43,-.05,w*.3-.03,.1,d-.3,m);return g;},
  armchair({m=mat(0x8a5a3a,{},'textile')}={}){const g=G('armchair');K.box(g,0,.24,0,.85,.3,.8,m);K.box(g,0,.64,.3,.85,.55,.2,m);for(const s of [-1,1])K.box(g,s*.36,.46,0,.14,.3,.8,m);return g;},
  table({w=1.6,d=.9,h=.75,m=wood}={}){const g=G('table');K.box(g,0,h-.025,0,w,.05,d,m);for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]])K.box(g,x*(w/2-.08),(h-.05)/2,z*(d/2-.08),.06,h-.05,.06,m);return g;},
  coffee({w=1.1,d=.55,m=wood}={}){const g=G('coffee-table');K.box(g,0,.4,0,w,.04,d,m);for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]])K.box(g,x*(w/2-.06),.2,z*(d/2-.06),.04,.4,.04,m);return g;},
  rug({w=2,d=1.4,c=0x8a3a30}={}){const g=G('rug');K.slab(g,0,.006,0,w,.01,d,mat(c,{},'carpet'),{shadow:false});return g;},
  lamp({h=1.5,shade=0xe8dcc0,lit=false}={}){const g=G('lamp');K.cyl(g,0,.02,0,.16,.04,mat(0x3a3530));K.cyl(g,0,h/2,0,.015,h,mat(0x9a8a6a,{metalness:.5}));
   const s=K.cyl(g,0,h,0,.2,.26,mat(shade,{emissive:0xffcf8a,emissiveIntensity:lit?.9:0,side:THREE.DoubleSide}),{r2:.13});s.name='lamp-shade';return g;},
  // a box fan on the floor, its blades on their own group (spin it)
  boxFan(){const g=G('box-fan');const body=mat(0xdedad0,{roughness:.6});K.box(g,0,.28,0,.5,.5,.14,body);K.box(g,0,.04,0,.24,.06,.24,body);
   const grill=mat(0x8a8a86,{metalness:.4,roughness:.5});for(let k=-4;k<=4;k++){K.box(g,k*.05,.28,-.075,.006,.44,.006,grill);K.box(g,k*.05,.28,.075,.006,.44,.006,grill);}
   const blades=new THREE.Group();blades.name='fan-blades';blades.position.set(0,.28,0);g.add(blades);for(let k=0;k<5;k++){const b=K.box(blades,0,.1,0,.08,.18,.008,mat(0xc8c4ba,{side:THREE.DoubleSide}));b.position.set(Math.sin(k*1.2566)*.1,Math.cos(k*1.2566)*.1,0);b.rotation.set(.35,0,-k*1.2566);}
   K.cyl(blades,0,0,0,.04,.04,mat(0x6a6a66),{rx:Math.PI/2});K.box(g,.2,.47,-.072,.05,.03,.01,mat(0x4a4a46));g.userData.blades=blades;return g;},
  crt({w=.42,screen=null}={}){const g=G('crt-tv');K.box(g,0,w*.38,.04,w,w*.76,w*.8,mat(0x2e2e30,{roughness:.5}));const sc=K.plane(g,0,w*.4,-w*.36,w*.78,w*.56,screen||mat(0x10141a,{roughness:.2,emissive:0x0,emissiveIntensity:0}));sc.name='screen';return g;},
  // a 1960s console: a wooden cabinet on legs, the screen on the left, the speaker cloth on the right
  console({screen=null}={}){const g=G('console-tv');K.box(g,0,.62,0,1.3,.7,.5,dk);for(const [x,z] of [[-.58,-.2],[.58,-.2],[-.58,.2],[.58,.2]])K.cyl(g,x,.13,z,.025,.26,dk,{r2:.015});
   K.box(g,.32,.62,-.255,.5,.5,.01,mat(0x9a8a6a,{},'textile'));const sc=K.plane(g,-.24,.64,-.257,.56,.44,screen||mat(0x0c0f12,{emissive:0x0}));sc.name='screen';return g;},
  fridge({h=1.7,c=0xd8d4c0}={}){const g=G('fridge');K.box(g,0,h/2,0,.76,h,.7,mat(c,{roughness:.4}));K.box(g,0,h*.66,-.351,.74,.01,.01,mat(0x8a8a86));K.box(g,-.3,h*.8,-.37,.03,.3,.03,mat(C7.chrome,{metalness:.8,roughness:.3}));K.box(g,-.3,h*.4,-.37,.03,.4,.03,mat(C7.chrome,{metalness:.8,roughness:.3}));return g;},
  stove({c=0xe2dccd}={}){const g=G('stove');K.box(g,0,.45,0,.76,.9,.66,mat(c,{roughness:.45}));for(const [x,z] of [[-.18,-.15],[.18,-.15],[-.18,.15],[.18,.15]])K.cyl(g,x,.905,z,.09,.01,mat(0x2a2a2a));K.box(g,0,1.02,.3,.76,.25,.05,mat(c));K.box(g,0,.45,-.335,.62,.5,.01,mat(0x2a2a2c,{roughness:.3}));return g;},
  counter({w=1.8,d=.62,top=0xc8bfa8,body=wood}={}){const g=G('counter');K.box(g,0,.44,0,w,.86,d,body);K.box(g,0,.895,0,w+.03,.035,d+.03,mat(top,{roughness:.5}));for(let x=-w/2+.3;x<w/2;x+=.6)K.box(g,x,.5,-d/2-.005,.55,.7,.01,dk);return g;},
  frame({w=.25,h=.2,art=null,c=0x3a2a1c}={}){const g=G('picture');K.slab(g,0,0,0,w,h,.02,mat(c));const p=K.plane(g,0,0,-.012,w*.82,h*.8,art||mat(0xd0c8b0));p.rotation.y=Math.PI;p.name='picture';return g;},
  poster({w=.6,h=.85,tex=null}={}){const g=G('poster');const m=tex?new THREE.MeshStandardMaterial({map:tex,roughness:.9}):mat(0x8a8a90);const p=K.plane(g,0,0,0,w,h,m);p.name='poster';return g;},
  cabinet({w=.8,d=.35,h=.7,y=1.5,m=wood}={}){const g=G('wall-cabinet');K.box(g,0,y,0,w,h,d,m);K.box(g,0,y,-d/2-.005,w-.05,h-.05,.01,dk);return g;},
  closet({w=1,h=2.05}){const g=G('closet');K.box(g,0,h/2,0,w,h,.04,mat(0xe8e2d4));return g;},
  sink({w=.6}={}){const g=G('sink');K.box(g,0,.9,0,w,.02,.45,mat(0xc8ccd0,{metalness:.6,roughness:.3}));K.cyl(g,0,1.02,.18,.015,.24,mat(C7.chrome,{metalness:.8,roughness:.25}),{rx:-.6});return g;},
 };
 return {K,F,wood,dk,pine};}

// ---- a house seen from outside (the court's houses): body, roof, windows, door, porch, garage ------------------------------------------
// o: {w (along the front), d (deep), stories, h (wall height per story), wall, roof, trim, door, pitch, ridge:'side'|'front',
//     porch:{w,d}, garage:{side:-1|1,w}, chimney:-1|1|0, shutters:color|null, windows:[...], lit:0..1 share of lit windows, seed,
//     floorY (the ground floor above the ground), skip: names not to build (a house that has its own front: 'front')}
// The house's frame: x across the front, front at z=-d/2 facing -z, y from the ground.
export function houseShell(o){const g=new THREE.Group();g.name='c7-house';const K=makeShapes(),r=seeded(o.seed||7);
 const W=o.w||10,D=o.d||9,st=o.stories||1,H=o.h||2.8,F=o.floorY??.45,top=F+st*H,wall=mat(o.wall||0xc9bfa6,{},'housepaint'),trim=mat(o.trim||C7.trim),roof=mat(o.roof||0x47474a,{},'roofgrain');
 const skip=new Set(o.skip||[]),parts={g,windows:[],door:null,porchLight:null};
 // foundation and body
 K.slab(g,0,F/2,0,W+.1,F,D+.1,mat(C7.concrete,{},'mineral'),{name:'foundation'});
 if(!skip.has('body'))K.slab(g,0,F+(top-F)/2,0,W,top-F,D,wall,{name:'walls'});
 // roof: a gable along the front (ridge across) or toward the front (front gable)
 const pitch=o.pitch||.42,front=o.ridge==='front',span=front?W:D,rise=span/2*pitch,len=(front?D:W)+.5,ov=.35;
 const roofG=new THREE.Group();roofG.name='roof';roofG.position.y=top;g.add(roofG);
 for(const s of [-1,1]){const sl=Math.hypot(span/2+ov,rise+ov*pitch),p=K.slab(roofG,0,0,0,front?sl:len,.08,front?len:sl,roof);
  if(front){p.position.set(s*(span/4+ov/2)*.98,rise/2-ov*pitch/2,0);p.rotation.z=-s*Math.atan(pitch);}else{p.position.set(0,rise/2-ov*pitch/2,s*(span/4+ov/2)*.98);p.rotation.x=s*Math.atan(pitch);}}
 // gable ends (triangles)
 {const tri=new THREE.BufferGeometry(),hw=span/2;tri.setAttribute('position',new THREE.Float32BufferAttribute([-hw,0,0,hw,0,0,0,rise,0],3));tri.computeVertexNormals();
  const ends=front?[[0,-D/2],[0,D/2]]:[[-W/2,0],[W/2,0]];for(const [x,z] of ends){for(const flip of [0,Math.PI]){const m=new THREE.Mesh(tri,wall);m.position.set(x,0,z);m.rotation.y=(front?0:Math.PI/2)+flip;m.castShadow=true;roofG.add(m);}}}
 parts.roof=roofG;parts.top=top;parts.rise=rise;
 if(o.chimney){K.slab(g,o.chimney*W*.3,top+rise*.6,D*.15,.6,rise*1.4+.8,.6,mat(C7.brick,{},'mineral'),{name:'chimney'});}
 // windows on the four walls (front: the list, or a default rhythm), lit or dark
 const lit=o.lit??.5,pane=()=>r()<lit?glassLit:glassDark;
 const addWin=(x,y,z,rot,w=1.05,h=1.2)=>{const wg=new THREE.Group();wg.position.set(x,y,z);wg.rotation.y=rot;g.add(wg);const p=pane();K.plane(wg,0,0,0,w,h,p,{});
  for(const [px,py,pw,ph] of [[-w/2,0,.08,h+.08],[w/2,0,.08,h+.08],[0,h/2,w+.08,.08],[0,-h/2,w+.08,.08]])K.slab(wg,px,py,.02,pw,ph,.05,trim);K.slab(wg,0,0,.015,.035,h,.03,trim);K.slab(wg,0,0,.015,w,.035,.03,trim);
  if(o.shutters)for(const s of [-1,1])K.slab(wg,s*(w/2+.22),0,.02,.32,h+.05,.03,mat(o.shutters));parts.windows.push({g:wg,pane:p});return wg;};
 for(let s=0;s<st;s++){const y=F+s*H+1.45;
  const fx=o.windows?.[s]||(s===0?[-W*.3,W*.28]:[-W*.3,0,W*.3]);for(const x of fx)if(!skip.has('front'))addWin(x,y,-D/2-.005,Math.PI);
  for(const x of [-W*.25,W*.25])addWin(x,y,D/2+.005,0);for(const z of [-D*.2,D*.2]){addWin(-W/2-.005,y,z,-Math.PI/2,.9);addWin(W/2+.005,y,z,Math.PI/2,.9);}}
 // the front door, steps, a porch light
 const dx=o.doorX??(W*.08);
 if(!skip.has('front')){const dm=mat(o.door||0x7a3a2a,{roughness:.6});K.slab(g,dx,F+1.02,-D/2-.02,.94,2.04,.06,dm,{name:'front-door'});K.slab(g,dx,F+1.02,-D/2-.03,1.08,2.16,.04,trim);
  K.cyl(g,dx+.35,F+1,-D/2-.07,.03,.05,mat(0xb89a5a,{metalness:.7,roughness:.35}),{rx:Math.PI/2});}
 const steps=Math.max(1,Math.round(F/.18));for(let k=0;k<steps;k++)K.slab(g,dx,(k+.5)*F/steps,-D/2-.35-(steps-1-k)*.3,1.6,F/steps,.3+(steps-1-k)*0,mat(C7.concrete,{},'mineral'));
 if(o.porch){const pw=o.porch.w||3.4,pd=o.porch.d||1.8;K.slab(g,dx,F-.05,-D/2-pd/2,pw,.1,pd,mat(0x9a948a,{},'mineral'));for(const s of [-1,1])K.slab(g,dx+s*(pw/2-.1),F+1.25,-D/2-pd+.12,.12,2.4,.12,trim);
  const pr=K.slab(g,dx,F+2.5,-D/2-pd/2,pw+.3,.1,pd+.2,roof);pr.rotation.x=-.12;parts.porchRoof={x:dx,y:F+2.5,z:-D/2-pd/2,w:pw,d:pd};}
 {const b=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),porchGlow);b.position.set(dx-.75,F+2.05,-D/2-.1);b.name='porch-light';g.add(b);parts.porchLight=b;}
 if(o.garage){const gw=o.garage.w||3.6,gs=o.garage.side||1,gx=gs*(W/2+gw/2);K.slab(g,gx,1.35,0,gw,2.7,D*.85,wall,{name:'garage'});
  const gr=K.slab(g,gx,2.95,0,gw+.4,.1,D*.85+.4,roof);gr.rotation.x=0;K.slab(g,gx,1.1,-D*.425-.02,gw-.5,2.1,.05,mat(o.garageDoor||0xd8d2c4,{roughness:.6}),{name:'garage-door'});
  for(let k=1;k<4;k++)K.slab(g,gx,k*.52,-D*.425-.05,gw-.5,.02,.02,trim);parts.garage={x:gx,w:gw};}
 // gutters along the eaves (front and back)
 if(!front)for(const s of [-1,1])K.slab(g,0,top-.02,s*(D/2+ov*.9),len,.08,.1,trim);
 parts.W=W;parts.D=D;parts.F=F;parts.H=H;parts.doorX=dx;return parts;}

// ---- cars by period ------------------------------------------------------------------------------------------------------------
// style '59: long, low, fins, two-tone; 'wagon': late seventies, wood sides; '86: a boxy sedan. Faces -z. Returns a group.
export function periodCar(style='59',{body=0x7a9a9a,roofC=0xe8e2d0,seed=1}={}){const g=new THREE.Group();g.name='c7-car-'+style;const K=makeShapes();
 const bm=mat(body,{roughness:.35,metalness:.25}),rm=mat(roofC,{roughness:.35,metalness:.2}),chrome=mat(C7.chrome,{metalness:.85,roughness:.25}),tire=mat(0x1a1a1a,{roughness:.9}),glass=mat(0x2a3a44,{roughness:.1,metalness:.3});
 const L=style==='59'?5.4:style==='wagon'?5.2:4.6,Wd=style==='59'?2.0:1.85,h0=style==='59'?.42:.45;
 K.box(g,0,h0+.32,0,Wd,.5,L,bm);
 if(style==='59'){for(const s of [-1,1]){const f=K.box(g,s*(Wd/2-.12),h0+.62,L/2-.55,.12,.22,1.1,bm);f.rotation.x=-.18;}K.box(g,0,h0+.85,-.1,Wd-.14,.42,2.2,rm);K.box(g,0,h0+.85,-.1,Wd-.1,.36,2.1,glass);
  for(const z of [-L/2,L/2])K.box(g,0,h0+.24,z,Wd+.04,.1,.12,chrome);K.box(g,0,h0+.45,-L/2-.01,Wd*.8,.18,.02,chrome);}
 else if(style==='wagon'){K.box(g,0,h0+.9,.35,Wd-.12,.56,3.2,rm);K.box(g,0,h0+.9,.35,Wd-.08,.48,3.1,glass);for(const s of [-1,1])K.box(g,s*(Wd/2+.005),h0+.36,.3,.01,.26,3.6,mat(0x8a5a32,{},'timber'));K.box(g,0,h0+.2,-L/2,Wd+.04,.1,.1,chrome);}
 else{K.box(g,0,h0+.88,.2,Wd-.14,.5,2.2,rm);K.box(g,0,h0+.88,.2,Wd-.1,.44,2.1,glass);K.box(g,0,h0+.22,-L/2,Wd,.12,.1,mat(0x2a2a2a));}
 for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const w=K.cyl(g,x*(Wd/2-.18),.34,z*(L/2-.95),.34,.24,tire,{rz:Math.PI/2});w.name='wheel';K.cyl(g,x*(Wd/2-.05),.34,z*(L/2-.95),.18,.02,chrome,{rz:Math.PI/2});}
 for(const s of [-1,1])K.box(g,s*(Wd/2-.3),h0+.42,-L/2-.005,.3,.16,.01,mat(0xf0ead8,{emissive:0x0}));
 g.userData.size={L,W:Wd};return g;}

// ---- street furniture --------------------------------------------------------------------------------------------------------
// a streetlight (the head's lamp material is shared: brightness by the chapter's dusk), a mailbox, a utility pole, a can
export const streetLamp=new THREE.MeshStandardMaterial({color:0xf6e8c8,emissive:0xffcf88,emissiveIntensity:0,roughness:.4});streetLamp.name='c7-street-lamp';
export function streetlight({h=7.2,arm=1.8}={}){const g=new THREE.Group();g.name='c7-streetlight';const K=makeShapes(),m=mat(0x5a5650,{metalness:.4,roughness:.6});
 K.cyl(g,0,h/2,0,.09,h,m,{r2:.07});K.pipe(g,[0,h-.2,0],[arm,h+.15,0],.04,m,6);const head=K.box(g,arm+.15,h+.1,0,.55,.14,.26,m);void head;const lamp=K.box(g,arm+.15,h+.02,0,.45,.03,.2,streetLamp);lamp.name='lamp';g.userData.lamp=new THREE.Vector3(arm+.15,h,0);return g;}
export function mailbox({c=0x2a2a2c,flag=true}={}){const g=new THREE.Group();g.name='c7-mailbox';const K=makeShapes();K.box(g,0,.55,0,.08,1.1,.08,mat(0x6a5a4a,{},'timber'));K.box(g,0,1.18,0,.22,.24,.46,mat(c,{metalness:.3,roughness:.5}));if(flag)K.box(g,.12,1.25,.1,.02,.18,.05,mat(0xb02a22));return g;}
export function utilityPole({h=9}={}){const g=new THREE.Group();g.name='c7-pole';const K=makeShapes(),m=mat(0x5a4a3a,{},'timber');K.cyl(g,0,h/2,0,.14,h,m,{r2:.11});K.box(g,0,h-.6,0,2.2,.12,.12,m);for(const x of [-.9,0,.9])K.cyl(g,x,h-.5,0,.04,.12,mat(0x5a7a6a,{roughness:.3}));return g;}
export function trashCan({c=0x5a5f62}={}){const g=new THREE.Group();g.name='c7-can';const K=makeShapes(),m=mat(c,{metalness:.45,roughness:.5});K.cyl(g,0,.42,0,.28,.84,m,{r2:.3,sides:16});K.cyl(g,0,.87,0,.31,.06,m,{sides:16});K.cyl(g,0,.92,0,.06,.04,m);return g;}
export function fenceRun(g,pts,{h=1.2,style='picket',c=0xe8e4d8}={}){const K=makeShapes(),m=mat(c,{},style==='board'?'timber':null);
 for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);
  for(const y of style==='board'?[.3,h-.25]:[.35,h-.3])K.slab(g,(x0+x1)/2,y,(z0+z1)/2,L,.08,.04,m,{ry:-a});
  if(style==='board'){const n=Math.ceil(L/.16);for(let k=0;k<n;k++){const u=(k+.5)/n;K.slab(g,x0+(x1-x0)*u,h/2,z0+(z1-z0)*u,.15,h,.025,m,{ry:-a});}}
  else{const n=Math.ceil(L/.14);for(let k=0;k<n;k++){const u=(k+.5)/n;K.slab(g,x0+(x1-x0)*u,h/2-.05,z0+(z1-z0)*u,.07,h-.1,.02,m,{ry:-a});}}
  K.slab(g,x0,h/2,z0,.1,h+.05,.1,m);}const L0=pts[pts.length-1];K.slab(g,L0[0],h/2,L0[1],.1,h+.05,.1,m);}
// a clipped hedge along points: a row of boxes and lumps (privet), h high, w thick
export function hedgeRun(g,pts,{h=2.6,w=1.1,c=0x3d5a2c,seed=3}={}){const K=makeShapes(),r=seeded(seed),m=mat(c,{roughness:1},'lawn'),m2=mat(c-0x060a04,{roughness:1},'lawn');
 for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);
  K.slab(g,(x0+x1)/2,h/2,(z0+z1)/2,L+w*.6,h,w,m,{ry:-a});const n=Math.ceil(L/.9);
  for(let k=0;k<n;k++){const u=(k+r())/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.55+r()*.35,0),r()<.5?m:m2);b.position.set(x+(r()-.5)*w*.6,h-.15+r()*.3,z+(r()-.5)*w*.6);b.scale.set(1.2,.7+r()*.3,1.2);b.castShadow=true;g.add(b);}}}
// a yard tree (deciduous): trunk and a few lumps of crown
export function yardTree({h=7,r0=2.6,seed=1,c=0x4e6a32}={}){const g=new THREE.Group();g.name='c7-tree';const K=makeShapes(),rn=seeded(seed),bark=mat(0x5a4a3a,{},'bark3'),leaf=mat(c,{roughness:1},'lawn'),leaf2=mat(c+0x080a04,{roughness:1},'lawn');
 K.cyl(g,0,h*.3,0,.22,h*.6,bark,{r2:.15});for(let k=0;k<3;k++){const a=k*2.1+rn();K.pipe(g,[0,h*.5,0],[Math.cos(a)*1.2,h*.72,Math.sin(a)*1.2],.09,bark,6);}
 for(let k=0;k<9;k++){const a=rn()*6.28,rr=rn()*r0*.75,b=new THREE.Mesh(new THREE.IcosahedronGeometry(r0*(.45+rn()*.3),1),rn()<.5?leaf:leaf2);b.position.set(Math.cos(a)*rr,h*.68+rn()*h*.3,Math.sin(a)*rr);b.scale.y=.75;b.castShadow=true;b.receiveShadow=true;g.add(b);}return g;}
// canvas helpers
export {paper};
