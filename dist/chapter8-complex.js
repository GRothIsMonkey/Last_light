// Chapter Eight: the Old Mill Court isolation works (Oak Hollow Township, 1958-1959, revised 1974 and 1991). Under the
// field past the old oak, where the court used to be, beside the bend in Line Four: what the 1958 drainage crews dug into,
// and what the township built around it afterwards. Reached from MH-12, the 1959 manhole in the grass by the old curb.
//
//  A    the access chamber at the foot of MH-12 (1959): the ladder, the old switch box, the Line Four connector going west
//       under the neighbourhood (L4) with its outer barrier (a crank gate), and the stair down (S1).
//  B    the construction gallery (1958): a long, high concrete hall, shuttering marks, steel columns, the crane rail, the
//       observation window over the deep shaft. Off it the 1958 site office (B1) and the 1974 review room (B2).
//  C    the east service corridor and its alcoves, to a crawl vent nobody grown could use.
//  J    the junction hall (1959): the isolation works proper, behind the bulkhead.
//  D    the isolation wing (flooded): cells D1-D3 and the drain valve room (D0).
//  E    the retrieval wing: cells E1-E3, its grille, and at its end the room it brings them back to (E4).
//  K, G the south corridor and the 1974 crew room; GD the crew room's back way to J.
//  H    the central isolation gallery: the anchor board (1959-1991) and the windows over the main chamber.
//  I    the main chamber (1958): the plug overhead, the throat under it, the original barrier at its far end. Its west
//       catwalk (IW, IP: the plug's release) and the Line Two drawdown culvert that comes in to it (L2).
//  F0, F1, F2   past H's east end: the corridor that does not stay the same, the room that was made in here, and the last
//       chamber, against the main one, where the first contact was.
//
// Everything is in its own frame (x east, z south, y up; metres) at the region origin CX, far from every other place:
// nobody sees it from anywhere else. One table of cells and openings makes the meshes, the walking, the sight lines,
// the doors and the hunter's graphs, so moving a wall moves all of them together.
import * as THREE from './three.module.js';
import {artSurface} from './art-surfaces.js';
import {pineMaterial} from './pine-materials.js';
import {paper,bake,makeShapes,clamp,damp,smooth,lerp} from './chapter6-kit.js';

export const CX={x:-2600,z:2600};
const WT=.22;// wall thickness (each cell's walls stand inside its own bounds)
// [id, x0, x1, z0, z1, floor y, height, opts]
//   opts: ramp {z0,z1,y0,y1} | water y | kind (look) | visual (seen, never walked) | dark
export const CELLS=[
 ['A',-3,3,-6,0,0,3.1,{kind:'1959'}],
 ['L4',-27,-3,-4.2,-1.8,0,2.6,{kind:'line4'}],
 ['S1',-1.15,1.15,0,6,0,2.7,{kind:'1959',ramp:{z0:.3,z1:5.7,y0:0,y1:-3}}],
 ['B',-14,20,6,22,-3,8,{kind:'gallery'}],
 ['B1',-24,-14,7,13.5,-3,3,{kind:'office'}],
 ['B2',-24,-14,14.5,21.5,-3,3,{kind:'review'}],
 ['C',20,44,12,14.4,-3,2.7,{kind:'service'}],
 ['Ca1',25,27,14.4,16.2,-3,2.7,{kind:'service'}],['Ca2',31,33,14.4,16.2,-3,2.7,{kind:'service'}],['Ca3',37,39,14.4,16.2,-3,2.7,{kind:'service'}],
 ['J',-6,14,22,32,-3,4.2,{kind:'1959'}],
 ['D',-27,-6,25,29,-3.45,3.1,{kind:'wing',water:-3.08}],
 ['D0',-31,-27,23.5,30.5,-3.45,3.1,{kind:'wing',water:-3.08}],
 ['D1',-11.2,-7.8,29,33,-3.45,2.6,{kind:'cell',water:-3.08}],['D2',-16.2,-12.8,29,33,-3.45,2.6,{kind:'cell',water:-3.08}],['D3',-21.7,-17.8,29,33.4,-3.45,2.6,{kind:'cell',water:-3.08}],
 ['E',14,34,25,29,-3,3.1,{kind:'wing'}],
 ['E1',16.8,20.2,21,25,-3,2.6,{kind:'cell'}],['E2',23.6,27.4,20.6,25,-3,2.6,{kind:'cell'}],['E3',29.8,33.2,21,25,-3,2.6,{kind:'cell'}],
 ['E4',34,41,23,31.5,-3,3.2,{kind:'den'}],
 ['K',2,5,32,44,-3,3,{kind:'1974'}],
 ['GD',-4,-2.2,32,36,-3,2.6,{kind:'1974'}],
 ['G',-6,2,36,43,-3,2.8,{kind:'crew'}],
 ['H',-8,18,44,52,-3,4.2,{kind:'1959'}],
 ['F0',18,21.6,44,64,-3,2.8,{kind:'shift'}],
 ['F1',16.4,28,64,73.6,-3,2.8,{kind:'made'}],
 ['F2',16.6,24,73.6,80,-3,2.9,{kind:'contact'}],
 ['I',-14,16,52,86,-12,24,{kind:'main',visual:true}],
 ['IW',-13.8,-10.4,56,80,4,3.2,{kind:'catwalk'}],
 ['IP',-13.8,-3.6,76.4,80,4,3.2,{kind:'catwalk'}],
 ['L2',-46,-14,60,63.6,4,2.8,{kind:'brick'}],
 // the reconstruction's additions: the hunter's own way out of its den (a bore, low in places) through to F0; the side passage
 // the corridor makes for itself; the ledge along the main chamber's east wall from F2 to the broken window of H
 ['E5',38.5,40.8,31.5,46.8,-3,2.4,{kind:'bore'}],
 ['E6',21.6,38.5,44.6,46.8,-3,2.4,{kind:'bore'}],
 ['Fa',21.6,25.6,49.6,58,-3,2.7,{kind:'made'}],
 ['IL',13.6,16.6,53,79.6,-3,3,{kind:'ledge'}],
];
// Openings in the walls between two cells: on a shared edge at x (an east/west wall) or z (a north/south wall), over a
// range along it, up to a height. door: a door id (closed doors are walls); window: seen through, never walked through.
export const OPENINGS=[
 {a:'A',b:'L4',x:-3,r:[-4.2,-1.8],h:2.6},
 {a:'A',b:'S1',z:0,r:[-1.15,1.15],h:2.7},
 {a:'S1',b:'B',z:6,r:[-1.15,1.15],h:2.7},
 {a:'B',b:'B1',x:-14,r:[9,10.3],h:2.15,door:'B1'},
 {a:'B',b:'B2',x:-14,r:[17,18.3],h:2.15,door:'B2'},
 {a:'B',b:'C',x:20,r:[12,14.4],h:2.7,door:'C'},
 {a:'C',b:'Ca1',z:14.4,r:[25,27],h:2.7},{a:'C',b:'Ca2',z:14.4,r:[31,33],h:2.7},{a:'C',b:'Ca3',z:14.4,r:[37,39],h:2.7},
 {a:'B',b:'J',z:22,r:[1.6,5.4],h:3.2,door:'bulkhead'},
 {a:'J',b:'D',x:-6,r:[25,29],h:3,door:'dIso'},// (the wing's flood door, 1959: it drops by itself when the wing floods)
 {a:'D',b:'D0',x:-27,r:[25,29],h:3},
 {a:'D',b:'D1',z:29,r:[-10.3,-8.7],h:2.1,door:'D1'},{a:'D',b:'D2',z:29,r:[-15.3,-13.7],h:2.1,door:'D2'},{a:'D',b:'D3',z:29,r:[-20.6,-18.9],h:2.1,door:'samCell'},
 {a:'J',b:'E',x:14,r:[25,29],h:3},
 {a:'E',b:'E1',z:25,r:[17.7,19.3],h:2.1,door:'E1'},{a:'E',b:'E2',z:25,r:[24.6,26.4],h:2.1,door:'jamieCell'},{a:'E',b:'E3',z:25,r:[30.7,32.3],h:2.1,door:'E3'},
 {a:'E',b:'E4',x:34,r:[25,29],h:3,door:'den'},
 {a:'J',b:'K',z:32,r:[2,5],h:3},
 {a:'J',b:'GD',z:32,r:[-4,-2.2],h:2.6},
 {a:'GD',b:'G',z:36,r:[-4,-2.2],h:2.4,door:'Gback'},
 {a:'K',b:'G',x:2,r:[37.6,39.8],h:2.15,door:'G'},// (a double door: the crew came through it in pairs)
 {a:'K',b:'H',z:44,r:[2,5],h:3},
 {a:'H',b:'F0',x:18,r:[45,47],h:2.4,door:'F0'},
 {a:'F0',b:'F1',z:64,r:[18.2,21.4],h:2.4},
 {a:'F1',b:'F2',z:73.6,r:[20.2,22.4],h:2.1,door:'alexCell'},
 {a:'L2',b:'IW',x:-14,r:[60,63.6],h:2.8},
 {a:'E4',b:'E5',z:31.5,r:[38.7,40.6],h:2.2},{a:'E5',b:'E6',x:38.5,r:[44.8,46.6],h:2.2},{a:'E6',b:'F0',x:21.6,r:[44.8,46.6],h:2.2},
 {a:'F0',b:'Fa',x:21.6,r:[50.2,51.6],h:2.4,door:'fa1'},{a:'F0',b:'Fa',x:21.6,r:[56.2,57.6],h:2.4,door:'fa2'},
 {a:'F2',b:'IL',x:16.6,r:[75.8,77.4],h:2.2,door:'breach'},{a:'H',b:'IL',z:52,r:[14.2,15.8],h:2.3,door:'hwin'},
 {a:'IW',b:'IP',z:76.4,r:[-13.8,-10.4],h:3},
 // windows: H over the main chamber; F2 onto it; B2's booth window onto B
 {a:'H',b:'I',z:52,r:[-6,13.8],h:2.6,v0:.95,window:true},
 {a:'B2',b:'B',x:-14,r:[19,21],h:1.8,v0:1.05,window:true},
];
export const SPOT={
 ladder:[0,-5.55],ladderTop:[0,-5.55],arrive:[0,-4.2],barrierCrank:[-2.42,-.4],barrierLeaf:[-7.6,-3],hunterL4:[-25.5,-3],switchbox:[2.6,-3.6],
 stairTop:[0,.6],stairFoot:[0,6.6],galleryW:[-10,14],galleryE:[16,14],galleryMid:[3,14],deepWindow:[19.7,9],craneMid:[3,10],
 officeDesk:[-20.6,12.35],officeCabinet:[-23.5,12.2],officeBoard:[-18.5,7.25],officeIn:[-16,10.6],reviewProj:[-17.5,18.2],reviewScreen:[-23.75,18],reviewIn:[-16.2,19.6],reviewSeat:[-18.6,18],
 cEnd:[43.2,13.2],cMid:[32,13.2],cIn:[21.6,13.2],cVent:[43.9,13.2],cAlcove1:[26,15.4],cAlcove2:[32,15.4],cAlcove3:[38,15.4],dannyFile:[26,15.7],
 bulkhead:[3.5,22],jMid:[4,27],jWest:[-4.5,27],jEast:[12.5,27],
 dWest:[-25,27],dValve:[-29.5,26.6],dHide:[-29.2,28.6],dGauge:[-29.4,28.8],samDoor:[-19.75,28.6],samIn:[-19.75,31.6],samCrank:[-17.2,28.4],d1In:[-9.5,31],d2In:[-14.5,31],dMid:[-15,27],
 eWest:[15.5,27],eMid:[24,27],eEast:[32.5,27],grille:[22,27],grilleLever:[21.2,28.65],jamieDoor:[25.5,25.4],jamieIn:[25.5,22.6],jamieLever:[27.9,25.4],denIn:[37.5,27.3],e1In:[18.5,23],e3In:[31.5,23],
 kMid:[3.5,38],kNorth:[3.5,33.4],kSouth:[3.5,42.6],gIn:[.7,39.6],gTable:[-2.2,39.6],gDoor:[2,38.7],gBack:[-3.1,35.6],gdMid:[-3.1,34],
 hMid:[5,48],hBoard:[5,44.5],hWest:[-6,48],hEast:[16,48],hWindow:[5,51.6],f0Door:[18,46],
 f0In:[19.8,47],f0Mid:[19.8,55],f0End:[19.8,63],f1In:[19.8,65.2],f1Mid:[22,68.8],alexDoor:[21.3,73.3],alexIn:[21,76.8],alexLeverA:[17.6,73],alexLeverB:[25.4,73],f2Window:[16.9,76.8],
 l2End:[-45,61.8],l2Mid:[-30,61.8],iwNorth:[-12.1,58],iwMid:[-12.1,68],iwSouth:[-12.1,77.8],ipPins:[-6.2,78.2],ipLadder:[-4.4,79.3],
 plug:[1,72.5],throat:[1,74],barrier:[1,86],
 // the reconstruction's places
 jPanel:[9.6,22.6],dIsoD:[-6.9,25.4],dIsoJ:[-5.1,28.9],dHorn:[-9.4,25.3],dBreaker:[-7.4,25.3],dCable:[-15.4,28.25],dPipe:[-14.4,31.9],samSlot:[-19.75,28.85],samLook:[-19.75,27.9],d2In:[-14.5,30.6],
 eBolts:[16.4,28.4],eHideW:[18.5,23.4],e2Slot:[25.5,25.35],e2Look:[25.5,26.2],e3Vent:[30.25,22.6],e2Vent:[27.0,22.6],e3Mid:[31.5,23.2],denShelf:[40.3,27.3],denBack:[39.6,32.6],e5Mid:[39.6,39],e6Mid:[30,45.7],e6West:[22.6,45.7],
 fSlide:[19.8,53.6],faMid:[23.6,53.8],faNorth:[23.6,50.9],faSouth:[23.6,56.9],f1Fissure:[22.4,68.6],f1Closet:[21.3,73.0],alexCot:[20.3,78.6],f2Breach:[17.1,76.6],f2Tally:[23.85,77],
 ilSouth:[15.1,76.6],ilMid:[15.1,67],ilGap:[15.1,61.2],ilNorth:[15.1,54.4],hWin:[15,51.4],hWinIn:[15,50.2],
 gCouch:[-3.4,42.35],gCot:[-5.3,41.2],gVend:[-.2,36.55],gAid:[-2.6,36.2],gFloor:[-4.3,38.4],gChair:[-1.1,41.2],
};
export const W8=(x,z,y=0)=>({x:CX.x+x,z:CX.z+z,y});
export const L8=(wx,wz)=>({x:wx-CX.x,z:wz-CX.z});

export function createComplex({scene,sfx=()=>{}}){
 const root=new THREE.Group();root.name='chapter8-complex';root.position.set(CX.x,0,CX.z);
 const K=makeShapes(),keep=new Set();
 // ---- materials -----------------------------------------------------------------------------------------------------
 const MC=new Map(),m=(c,o={},kind=null,name='')=>{const key=c+'|'+name+'|'+kind+'|'+JSON.stringify(o);if(MC.has(key))return MC.get(key);const x=new THREE.MeshStandardMaterial({color:c,roughness:.9,...o});if(kind)artSurface(x,kind);x.name='c8-'+(name||kind||'m');MC.set(key,x);return x;};
 const conc=m(0x7d7a70,{},'culvert','concrete'),conc2=m(0x6a675e,{},'culvert','concrete-old'),wet=m(0x4c4a43,{roughness:.55},'culvert','concrete-wet'),floorM=m(0x57554e,{roughness:.8},'culvert','floor');
 const brick=pineMaterial(0x6e3b2d,'stone');brick.name='c8-brick';const paint=pineMaterial(0x8e9c8a,'paint');paint.name='c8-painted-1959';const paint74=pineMaterial(0xb7a882,'paint');paint74.name='c8-painted-1974';
 const steel=pineMaterial(0x4f5756,'metal');steel.name='c8-steel';const green=pineMaterial(0x34503f,'metal',{roughness:.7});green.name='c8-green';const yellow=pineMaterial(0xb8922a,'metal',{roughness:.6});yellow.name='c8-yellow';
 const red=pineMaterial(0x8e2a20,'metal',{roughness:.55});red.name='c8-red';const rust=m(0x5e3a26,{roughness:.95},null,'rust');const dark=new THREE.MeshBasicMaterial({color:0x020203});dark.name='c8-void';
 const wood=m(0x6a4c32,{roughness:.8},'timber','wood'),lino=m(0x7a7464,{roughness:.7},null,'lino'),glass=new THREE.MeshStandardMaterial({color:0x9fb2b6,roughness:.08,metalness:.2,transparent:true,opacity:.18,depthWrite:false});glass.name='c8-glass';
 const waterM=new THREE.MeshStandardMaterial({color:0x10181a,roughness:.08,metalness:.55,transparent:true,opacity:.86});waterM.name='c8-water';
 const flesh=new THREE.MeshStandardMaterial({color:0x2a1d1d,roughness:.35,metalness:.05});flesh.name='c8-organic';
 const lampOn=new THREE.MeshStandardMaterial({color:0xfff2d0,emissive:0xffd9a0,emissiveIntensity:1.6});lampOn.name='c8-lamp-on';const lampOff=m(0x9a9488,{roughness:.4},null,'lamp-off');
 const wallM=c=>{const k=c[7]?.kind;return k==='bore'?wet:k==='line4'?conc2:k==='brick'?brick:k==='office'||k==='review'||k==='crew'||k==='1974'?paint74:k==='made'?paint74:k==='1959'?paint:k==='wing'||k==='cell'?wet:k==='den'?wet:conc;};
 const floorOf=c=>{const k=c[7]?.kind;return k==='office'||k==='review'||k==='crew'?lino:k==='brick'?brick:k==='catwalk'?steel:floorM;};
 // ---- the table, indexed --------------------------------------------------------------------------------------------
 const cell=new Map(CELLS.map(c=>[c[0],{id:c[0],x0:c[1],x1:c[2],z0:c[3],z1:c[4],y:c[5],h:c[6],o:c[7]||{},row:c}]));
 const doorOpen=new Map();for(const o of OPENINGS)if(o.door)doorOpen.set(o.door,0);
 const cellFloor=(c,x,z)=>{const r=c.o.ramp;if(!r)return c.y;const t=clamp((z-r.z0)/(r.z1-r.z0),0,1);return lerp(r.y0,r.y1,t);};
 // ---- the meshes ----------------------------------------------------------------------------------------------------
 function wallRun(g,c,side){// one inner wall of a cell, with its openings cut out
  const {x0,x1,z0,z1}=c,top=c.h,base=c.o.ramp?Math.min(c.o.ramp.y0,c.o.ramp.y1):c.y,y1=(c.o.ramp?Math.max(c.o.ramp.y0,c.o.ramp.y1):c.y)+top;
  const ew=side==='e'||side==='w',edge=side==='e'?x1:side==='w'?x0:side==='n'?z0:z1,a=ew?z0:x0,b=ew?z1:x1;
  const holes=OPENINGS.filter(o=>(o.a===c.id||o.b===c.id)&&(ew?o.x===edge:o.z===edge)).map(o=>{const fy=o.window?(CELLS.find(r=>r[0]===o.a)?.[5]??c.y):c.y,v0=(o.v0||0)+fy-base,v1=v0+(o.h-(o.v0||0));return [o.r[0],o.r[1],v0,v1,o];});/* (a window is at the height of the room it is looked out of, in both walls: the main chamber's floor is nine metres lower) */
  const inset=WT/2,pos=edge+(side==='e'||side==='s'?-inset:inset),M=wallM(c.row);
  const piece=(u0,u1,v0,v1)=>{if(u1-u0<.02||v1-v0<.02)return;const um=(u0+u1)/2,w=u1-u0,h=v1-v0;if(ew)K.slab(g,pos,base+(v0+v1)/2,um,WT,h,w,M);else K.slab(g,um,base+(v0+v1)/2,pos,w,h,WT,M);};
  let u=a;for(const [h0,h1,v0,v1] of holes.sort((p,q)=>p[0]-q[0])){piece(u,h0,0,y1-base);piece(h0,h1,0,v0);piece(h0,h1,v1,y1-base);u=h1;}piece(u,b,0,y1-base);
  // lintels and frames round the doors (steel, painted), glass in the windows
  for(const [h0,h1,v0,v1,o] of holes){const um=(h0+h1)/2,w=h1-h0;if(o.window){if(ew)K.plane(g,pos,base+(v0+v1)/2,um,w,v1-v0,glass,{ry:Math.PI/2});else K.plane(g,um,base+(v0+v1)/2,pos,w,v1-v0,glass);continue;}
   const fr=o.door?green:steel;if(ew){K.box(g,pos,base+v1+.06,um,WT+.06,.12,w+.16,fr);for(const s of [h0,h1])K.box(g,pos,base+(v0+v1)/2,s,WT+.06,v1-v0,.08,fr);}else{K.box(g,um,base+v1+.06,pos,w+.16,.12,WT+.06,fr);for(const s of [h0,h1])K.box(g,s,base+(v0+v1)/2,pos,.08,v1-v0,WT+.06,fr);}}}
 function buildCell(c){const g=new THREE.Group();g.name='c8-cell-'+c.id;root.add(g);const {x0,x1,z0,z1}=c,w=x1-x0,d=z1-z0;
  if(c.o.ramp){const r=c.o.ramp,n=14;for(let i=0;i<n;i++){const za=lerp(r.z0,r.z1,i/n),zb=lerp(r.z0,r.z1,(i+1)/n),y=lerp(r.y0,r.y1,(i+.5)/n);K.slab(g,(x0+x1)/2,y-.09,(za+zb)/2,w,.18,zb-za+.01,floorOf(c.row));}
   K.slab(g,(x0+x1)/2,r.y0-.06,(z0+r.z0)/2,w,.12,r.z0-z0+.01,floorOf(c.row));K.slab(g,(x0+x1)/2,r.y1-.06,(r.z1+z1)/2,w,.12,z1-r.z1+.01,floorOf(c.row));
   for(const s of [x0+.1,x1-.1])K.pipe(g,[s,r.y0+.95,r.z0],[s,r.y1+.95,r.z1],.025,steel,6);}
  else if(!c.o.visual&&c.o.kind!=='ledge')K.slab(g,(x0+x1)/2,c.y-.08,(z0+z1)/2,w,.16,d,floorOf(c.row));
  const top=(c.o.ramp?Math.max(c.o.ramp.y0,c.o.ramp.y1):c.y)+c.h;if(c.o.kind!=='ledge')K.slab(g,(x0+x1)/2,top+.1,(z0+z1)/2,w,.2,d,c.o.kind==='brick'?brick:conc2,{shadow:false});
  if(c.o.kind!=='catwalk'&&c.o.kind!=='ledge')for(const s of ['n','s','e','w'])wallRun(g,c,s);
  if(c.o.water!=null){const wm=new THREE.Mesh(new THREE.PlaneGeometry(w-WT*2+.02,d-WT*2+.02),waterM);wm.rotation.x=-Math.PI/2;wm.position.set((x0+x1)/2,c.o.water,(z0+z1)/2);wm.name='c8-water-'+c.id;g.add(wm);keep.add(wm);WATER.push({mesh:wm,cell:c,base:c.o.water});}
  return g;}
 const WATER=[],G={};for(const c of cell.values())G[c.id]=buildCell(c);
 // ---- doors: steel leaves that rise (the isolation doors, the bulkhead), hinged doors for the offices --------------------
 const DOORS={};
 for(const o of OPENINGS){if(!o.door)continue;const A=cell.get(o.a),B=cell.get(o.b),ew=o.x!=null,w=o.r[1]-o.r[0],um=(o.r[0]+o.r[1])/2,y=Math.max(A.y,B.y),h=o.h;
  const hinged=['B1','B2','G','Gback','D1','D2','E1','E3','C'].includes(o.door),grp=new THREE.Group();grp.name='c8-door-'+o.door;root.add(grp);keep.add(grp);
  if(['breach','hwin','fa1','fa2'].includes(o.door)){DOORS[o.door]={o,grp,kind:'ghost',open:0,want:0,set(v){this.open=v;}};continue;}// (no leaf: a wall that is broken through, or one that moves; the dressing draws them)
  const edge=ew?o.x:o.z;
  if(hinged){const piv=new THREE.Group();if(ew)piv.position.set(edge,y,o.r[0]);else piv.position.set(o.r[0],y,edge);grp.add(piv);const leaf=new THREE.Mesh(new THREE.BoxGeometry(ew?.05:w,h-.04,ew?w:.05),o.door==='C'?green:paint74);
   leaf.position.set(ew?0:w/2,(h-.04)/2,ew?w/2:0);piv.add(leaf);const kn=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),steel);kn.position.set(ew?.06:w-.08,1.0,ew?w-.08:.06);piv.add(kn);
   DOORS[o.door]={o,grp,piv,kind:'hinge',open:0,want:0,ew,set(v){this.open=v;piv.rotation.y=(ew?-1:1)*v*1.45;}};}
  else{const leaf=new THREE.Group();grp.add(leaf);const bm=o.door==='bulkhead'||o.door==='den'?steel:green;
   if((o.door==='samCell'||o.door==='jamieCell')&&!ew){// (a real slot through it at a boy's eye height, so you can see who is behind it)
    const W=w+.1,sy=1.45-h/2,sw=.42,sh=.2;for(const [x,y,bw,bh] of [[0,(-h/2+sy-sh/2)/2,W,sy-sh/2+h/2],[0,(sy+sh/2+h/2)/2,W,h/2-sy-sh/2],[-(sw/2+(W-sw)/4),sy,(W-sw)/2,sh],[(sw/2+(W-sw)/4),sy,(W-sw)/2,sh]]){const b=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,.14),bm);b.position.set(x,y,0);leaf.add(b);}}
   else{const body=new THREE.Mesh(new THREE.BoxGeometry(ew?.14:w+.1,h,ew?w+.1:.14),bm);leaf.add(body);}
   for(let k=0;k<4;k++){const rib=new THREE.Mesh(new THREE.BoxGeometry(ew?.18:w+.12,.07,ew?w+.12:.18),yellow);rib.position.y=-h/2+.3+k*(h-.6)/3;leaf.add(rib);}
   if(ew)leaf.position.set(edge,y+h/2,um);else leaf.position.set(um,y+h/2,edge);
   DOORS[o.door]={o,grp,leaf,kind:'rise',open:0,want:0,ew,h,y,set(v){this.open=v;leaf.position.y=y+h/2+v*(h-.05);}};}}
 // ---- dressing: one place at a time ----------------------------------------------------------------------------------
 const dg=new THREE.Group();dg.name='c8-dressing';root.add(dg);
 const lampAt=(x,y,z,on=true)=>{const b=K.box(dg,x,y,z,.34,.12,.18,steel);const l=K.box(dg,x,y-.09,z,.26,.05,.12,on?lampOn:lampOff);return l;};
 const cable=(a,b)=>K.pipe(dg,a,b,.018,m(0x1b1b1c,{roughness:.6},null,'cable'),5);
 // A: the ladder (rungs up the shaft), the switch box, signs, the cover's light far up
 for(let k=0;k<14;k++)K.box(dg,0,.35+k*.3,-5.86+(k>9?-.0:0),.48,.035,.035,steel);for(const s of [-.25,.25])K.box(dg,s,2.3,-5.88,.04,4.6,.04,steel);
 K.box(dg,0,3.15,-5.4,1.1,.2,1.1,conc2);K.cyl(dg,0,4.6,-5.4,.42,2.8,conc2,{sides:16});// (the shaft going up)
 K.box(dg,2.75,1.35,-3.6,.25,.8,.55,green);K.box(dg,2.62,1.35,-3.6,.02,.5,.36,yellow);lampAt(0,3.0,-2.2,false);
 // the Line Four connector: older concrete, a channel down its middle, the barrier's guides and leaf, the crank on A's side
 K.box(dg,-15,0.02,-3,24,.04,.5,wet);for(const x of [-9,-15,-21])lampAt(x,2.48,-3,false);
 const leaf=new THREE.Group();leaf.name='c8-outer-barrier';root.add(leaf);keep.add(leaf);{const b=new THREE.Mesh(new THREE.BoxGeometry(.16,2.55,2.5),steel);b.position.y=1.275;leaf.add(b);for(let k=0;k<5;k++){const r2=new THREE.Mesh(new THREE.BoxGeometry(.2,.08,2.54),yellow);r2.position.y=.25+k*.5;leaf.add(r2);}}
 leaf.position.set(-7.6,2.6,-3);for(const s of [-4.12,-1.88])K.box(dg,-7.6,1.3,s,.34,2.6,.12,rust);
 const crank=new THREE.Group();crank.position.set(-2.66,1.15,-.4);crank.rotation.y=Math.PI/2;root.add(crank);keep.add(crank);{const rim=new THREE.Mesh(new THREE.TorusGeometry(.26,.025,8,22),red);crank.add(rim);for(let k=0;k<3;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.5,.02,.02),red);sp.rotation.z=k*Math.PI/3;crank.add(sp);}}
 K.box(dg,-2.74,1.15,-.4,.08,.22,.22,steel);cable([-2.74,1.2,-.4],[-2.74,2.7,-.4]);cable([-2.74,2.7,-.4],[-2.74,2.7,-1.6]);cable([-2.9,2.5,-1.7],[-7.4,2.5,-1.95]);// (the crank's cable along the wall to the barrier's head)
 // B: columns, the crane rail and its trolley, shuttering lines, pipes, the observation window over the deep shaft, 1958 stencils
 for(const x of [-10,-4,2,8,14])for(const z of [10,18]){K.box(dg,x,1,z,.55,8,.55,conc);K.box(dg,x,4.82,z,.7,.3,.7,conc2);}
 for(const z of [9.2,18.8])K.box(dg,3,4.6,z,33.4,.36,.28,steel);const trolley=K.box(dg,-2,4.25,14,1.6,.5,9.9,yellow);trolley.name='c8-crane-trolley';keep.add(trolley);
 const hook=new THREE.Group();hook.position.set(-2,1.4,14);root.add(hook);keep.add(hook);K.pipe(hook,[0,0,0],[0,2.7,0],.03,steel);K.box(hook,0,-.15,0,.3,.3,.18,yellow);
 for(const y of [-1.2,.6,2.4,4.2])K.box(dg,3,y,6.13,33.4,.02,.02,conc2);
 K.pipe(dg,[-13.6,3.6,6.6],[19.6,3.6,6.6],.16,rust);K.pipe(dg,[-13.6,3.9,6.6],[19.6,3.9,6.6],.08,steel);
 K.box(dg,19.85,.1,9,.02,2.4,3.2,glass);K.box(dg,19.95,-.5,9,.3,.1,3.4,steel);// the window (looks into the shaft: a void)
 K.box(dg,21.6,-6,9,3.2,30,4.8,dark);// the deep shaft beyond it, unlit
 for(const x of [-12,-2,8,16])lampAt(x,4.4,14,false);
 // stacked forms, a mixer, barrels, a 1958 site trailer's steps; a long dark streak on the floor toward J (something heavy dragged)
 for(let k=0;k<4;k++)K.box(dg,-11.6,-2.85+k*.18,20.4,2.4,.16,1.2,wood);K.cyl(dg,15.6,-2.2,19.8,.7,1.6,steel,{rz:.15});for(const [x,z] of [[17.8,7.6],[18.6,8.4],[-12.8,7.2]])K.cyl(dg,x,-2.55,z,.3,.9,rust);
 for(let k=0;k<9;k++){const s=K.box(dg,3.6+Math.sin(k)*.25,-2.985,13+k*1.05,.55,.01,1.1,m(0x1e1a17,{roughness:.6},null,'streak'));s.receiveShadow=true;}
 // B1: the 1958 site office: desk, cabinet, the board of site photographs, a lamp
 K.box(dg,-20.6,-2.6,12.35,1.6,.8,.8,wood);K.box(dg,-20.6,-2.19,12.35,1.7,.04,.9,wood);/* (the desk in the corner, out of the door's line) */K.box(dg,-23.55,-2.1,12.2,.6,1.8,.9,green);K.box(dg,-18.5,-1.5,7.33,2.6,1.3,.04,m(0x8a7a5a,{roughness:1},null,'cork'));lampAt(-19,-.15,10.2,true);
 K.box(dg,-15.6,-2.6,12.8,1.1,.8,.6,wood);
 // B2: the 1974 review room: rows of folding chairs, the projector on its stand, the screen, the booth window onto the gallery
 K.box(dg,-17.5,-2.4,18.2,.5,1.2,.5,steel);const proj=K.box(dg,-17.5,-1.65,18.2,.42,.3,.32,m(0x2a2a2c,{roughness:.5},null,'projector'));proj.name='c8-projector';
 for(const s of [-.17,.17])K.cyl(dg,-17.5+s,-1.33,18.2,.11,.04,steel,{rz:Math.PI/2});
 const screenM=new THREE.MeshBasicMaterial({color:0x111111});screenM.name='c8-film-screen';const screen=K.plane(dg,-23.72,-1.4,18,2.6,1.9,screenM,{ry:Math.PI/2});keep.add(screen);
 for(const z of [16.6,17.6,18.6,19.6])for(const x of [-21.4,-20.4])K.box(dg,x,-2.6,z,.45,.08,.45,steel);
 // C: the service corridor: pipes, an old lamp that works, the alcoves, Danny's things in the first one; the vent at the end
 K.pipe(dg,[20.4,1.5,12.3],[43.6,1.5,12.3],.09,rust);K.pipe(dg,[20.4,-.9,14.1],[43.6,-.9,14.1],.05,steel);for(const x of [24,30,36,42])lampAt(x,-.45,13.2,x===24);
 K.box(dg,43.89,-2.6,13.2,.06,.8,.9,dark);for(let k=0;k<4;k++)K.box(dg,43.86,-2.95+k*.22,13.2,.04,.02,.9,steel);
 // J: the junction hall: the 1959 bulkhead frame, valve wheels, a long control desk, the way to the wings
 K.box(dg,4,-2.55,30.9,7,.9,.8,green);for(const x of [1.5,3.5,5.5])K.cyl(dg,x,-2.0,31.2,.18,.06,red,{rx:Math.PI/2});for(const x of [-4,0,8,12])lampAt(x,1.05,27,x===0||x===8);
 K.pipe(dg,[-5.6,.6,22.4],[13.6,.6,22.4],.14,rust);
 // D: the flooded wing: pipes along the wall, the valve room's big wheel and gauge, cell numbers
 K.pipe(dg,[-26.6,-1.2,25.3],[-6.4,-1.2,25.3],.12,rust);const valve=new THREE.Group();valve.position.set(-30.75,-2.15,26.6);root.add(valve);keep.add(valve);
 {const rim=new THREE.Mesh(new THREE.TorusGeometry(.42,.035,8,24),red);rim.rotation.y=Math.PI/2;valve.add(rim);for(let k=0;k<4;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.02,.82,.02),red);sp.rotation.x=k*Math.PI/4;valve.add(sp);}}
 K.box(dg,-30.85,-2.15,26.6,.12,.3,.3,steel);K.box(dg,-30.15,-2.2,29.55,1.1,1.7,1.2,rust);K.pipe(dg,[-30.15,-1.3,29.55],[-30.15,.2,29.55],.3,rust);// (the pipe housing in the end room's corner: somewhere to get down behind)K.cyl(dg,-30.9,-1.1,28.8,.18,.05,m(0xe8e2d0,{roughness:.4},null,'gauge'),{rz:Math.PI/2});for(const x of [-20,-12])lampAt(x,-.5,27,x===-12);
 // E: the retrieval wing: the grille across the corridor (its lever), drag marks along the floor to the cells, the den
 const grille=new THREE.Group();grille.name='c8-grille';grille.position.set(22,-3,27);root.add(grille);keep.add(grille);
 for(let k=0;k<13;k++){const bar=new THREE.Mesh(new THREE.BoxGeometry(.04,2.9,.04),steel);bar.position.set(0,1.45,-1.8+k*.3);grille.add(bar);}for(const y of [.3,1.5,2.7]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,3.7),steel);rail.position.set(0,y,0);grille.add(rail);}
 K.box(dg,21.2,-2.1,28.75,.2,.5,.12,green);const glever=new THREE.Group();glever.position.set(21.2,-1.9,28.65);root.add(glever);keep.add(glever);{const r2=new THREE.Mesh(new THREE.BoxGeometry(.05,.55,.05),red);r2.position.y=.27;glever.add(r2);}
 for(let k=0;k<16;k++){const s=K.box(dg,15+k*1.2,-2.987,26.6+Math.sin(k*.7)*.3,.9,.006,.16,m(0x241c18,{roughness:.6},null,'drag'));void s;}
 K.box(dg,38,-2.9,30.5,3.2,.2,1.4,wet);for(const [x,z,r2] of [[36.2,24.2,.4],[39.6,25.2,.3],[37.4,29.6,.35]])K.cyl(dg,x,-2.95,z,r2,.06,m(0x2a2422,{roughness:.9},null,'remains'));
 K.box(dg,27.85,-1.9,25.25,.16,.36,.1,green);const jlever=new THREE.Group();jlever.position.set(27.9,-1.75,25.38);root.add(jlever);keep.add(jlever);{const r2=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,.05),red);r2.position.y=.25;jlever.add(r2);}
 for(const x of [17,26,33])lampAt(x,-.1,27,x===17);
 // K, G: 1974 paint, a notice board, the crew room's table, lockers, a coffee urn, a calendar
 for(const z of [34,40])lampAt(3.5,-.15,z,true);K.box(dg,-2.2,-2.6,39.6,2.4,.76,1,wood);for(const x of [-3.3,-1.1])for(const z of [38.8,40.4])K.box(dg,x,-2.75,z,.42,.5,.42,steel);
 for(let k=0;k<5;k++)K.box(dg,-5.55,-2,37+k*.62,.5,2,.58,green);K.cyl(dg,1.2,-2.2,42.4,.18,.5,steel);lampAt(-2,-.35,39.6,true);
 // H: the anchor board along the north wall, the gauges, the windows over the main chamber, the 1991 additions in yellow
 K.box(dg,5,-1.2,44.32,14,2.2,.1,green);for(const x of [-6,0,6,12,16])lampAt(x,1.0,48,x===0||x===12);K.box(dg,5,-2.6,51.5,22,.8,.6,steel);
 // I: the plug (a concrete drum on its hangers), the throat under it, the barrier ribs at the far end, the catwalk, L2's mouth
 const plug=new THREE.Group();plug.name='c8-plug';root.add(plug);keep.add(plug);{const body=new THREE.Mesh(new THREE.CylinderGeometry(5.2,5.6,7.5,28),conc2);plug.add(body);
  for(let k=0;k<6;k++){const band=new THREE.Mesh(new THREE.CylinderGeometry(5.35+k*.0,5.35,.18,28),rust);band.position.y=-3.2+k*1.3;plug.add(band);}
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4,h2=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,7,8),steel);h2.position.set(Math.cos(a)*4.2,7.2,Math.sin(a)*4.2);plug.add(h2);}}
 plug.position.set(1,7.4,72.5);
 const throat=new THREE.Mesh(new THREE.CylinderGeometry(6.4,5.4,30,32,1,true),dark);throat.position.set(1,-27,74);root.add(throat);
 K.box(dg,1,-11.95,63,29,.1,22,floorM);K.box(dg,-8.5,-11.95,80,11,.1,12,floorM);K.box(dg,11,-11.95,80,9,.1,12,floorM);
 const barrier=new THREE.Group();barrier.name='c8-barrier';root.add(barrier);keep.add(barrier);for(let k=0;k<9;k++){const rib=new THREE.Mesh(new THREE.BoxGeometry(2.6,23,1.4),k%2?conc:conc2);rib.position.set(-11+k*3,0,85);barrier.add(rib);}
 for(let k=0;k<8;k++){const pl=new THREE.Mesh(new THREE.BoxGeometry(.4,18,.2),steel);pl.position.set(-9.5+k*3,0,84.2);barrier.add(pl);}
 for(let z=56;z<80;z+=1.6){K.box(dg,-10.5,4.6,z,.06,1,.06,yellow);}K.box(dg,-10.5,5.1,68,.05,.05,24,yellow);for(const z of [58,64,70,76])K.box(dg,-12,3.9,z,.15,.4,3.6,steel);
 const pins=[0,1,2].map(i=>{const p=new THREE.Group();p.position.set(-7.6+i*1.4,4.95,78.15);root.add(p);keep.add(p);const b=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.8,10),steel);b.rotation.z=Math.PI/2;p.add(b);const hd=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.12,12),red);hd.rotation.z=Math.PI/2;hd.position.x=.42;p.add(hd);return p;});
 K.box(dg,-6.2,4.9,78.6,4.6,.25,.5,steel);cable([-6.2,5.1,78.4],[1,10,72.5]);cable([-4.8,5.1,78.4],[1,10,72.5]);
 for(let k=0;k<12;k++)K.box(dg,-4.4,4.4+k*.32,79.7,.5,.035,.035,steel);// the service ladder up out of the chamber
 for(const x of [-40,-30,-20])lampAt(x,6.5,61.8,false);
 // F0, F1, F2: the corridor (plain, at first), the room that was made (a boy's bedroom, too clean), the last chamber
 for(const z of [50,58])lampAt(19.8,-.4,z,true);
 const made=new THREE.Group();made.name='c8-made-room';root.add(made);keep.add(made);
 {const bed=new THREE.Group();bed.position.set(26.6,-3,66.4);made.add(bed);K.box(bed,0,.25,0,1,.5,2,wood);K.box(bed,0,.55,0,.95,.14,1.95,m(0x3b5a8a,{roughness:1},null,'quilt'));K.box(bed,0,.68,-.75,.6,.14,.36,m(0xeeeae0,{roughness:1},null,'pillow'));
  const desk=new THREE.Group();desk.position.set(17.6,-3,70.2);made.add(desk);K.box(desk,0,.38,0,.6,.76,1.3,wood);K.box(desk,.1,.95,.2,.3,.3,.4,m(0x222326,{roughness:.4},null,'monitor'));
  const poster=K.plane(made,22.2,-1.4,72.85,1,.7,m(0x7a3a30,{roughness:1},null,'poster'),{ry:Math.PI});poster.name='c8-made-poster';
  const win=K.plane(made,27.75,-1.5,68.8,1.2,1,m(0x0d1418,{roughness:.2,emissive:0x18324a,emissiveIntensity:.25},null,'made-window'),{ry:-Math.PI/2});win.name='c8-made-window';
  K.box(made,22,-2.99,68.8,8,.02,6,m(0x7c6a52,{roughness:1},null,'carpet'));K.box(made,26.6,-2.3,72.6,.8,1.4,.5,wood);
  // (his lamp, a headboard, a shelf of paperbacks and comics, a chair with yesterday's shirt on it: all where his are, all too neat)
  K.box(bed,0,.75,-1.02,1.04,1.0,.08,wood);const lamp=new THREE.Group();lamp.position.set(17.7,-3+.76,70.4);made.add(lamp);K.box(lamp,0,.02,0,.16,.04,.16,m(0x2a2a2a,{roughness:.5},null,'lamp-base'));K.box(lamp,0,.2,0,.03,.36,.03,m(0x2a2a2a,{roughness:.5},null,'lamp-stem'));
  K.box(lamp,0,.42,0,.26,.18,.26,m(0xf2d9a8,{roughness:.8,emissive:0xffc070,emissiveIntensity:.9},null,'lamp-shade'));
  const shelf=new THREE.Group();shelf.position.set(16.62,-3,66.6);made.add(shelf);K.box(shelf,0,.9,0,.3,1.8,1.2,wood);
  for(let r=0;r<3;r++)for(let k=0;k<7;k++){const h=.2+((k*37+r*11)%7)*.018;K.box(shelf,.02,.32+r*.5+h/2,-.5+k*.15,.22,h,.11,m([0x8a2a22,0x2a4a7a,0xd8b04a,0x3a6a3a,0xe8e2d0,0x5a3a6a,0xc86a2a][(k+r*3)%7],{roughness:.9},null,'book'));}
  const chair=new THREE.Group();chair.position.set(18.6,-3,71.1);made.add(chair);K.box(chair,0,.45,0,.45,.05,.45,wood);K.box(chair,0,.75,.2,.45,.6,.05,wood);for(const [x,z] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])K.box(chair,x,.22,z,.04,.45,.04,wood);
  K.box(chair,0,.52,0,.42,.05,.4,m(0x2a5a8a,{roughness:1},null,'shirt'));}
 lampAt(22,-.35,68.8,true);for(const x of [18.6,23.6])K.box(dg,x,-1.9,73.4,.16,.36,.1,green);
 const alexLevers=[17.6,25.4].map(x=>{const g=new THREE.Group();g.position.set(x,-1.75,73.25);root.add(g);keep.add(g);const r2=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,.05),red);r2.position.y=.25;g.add(r2);return g;});
 K.box(dg,20.3,-2.8,78.6,1.6,.4,.8,steel);// the cot in F2
 // the organic growth near the contact point: where the walls stop being walls (F2, the far end of I)
 for(let k=0;k<26;k++){const a=k*2.399,r2=.2+(k%5)*.08;const b=new THREE.Mesh(new THREE.SphereGeometry(r2,10,8),flesh);b.position.set(16.75,-2.7+((k*.37)%1)*2.4,74+((k*.61)%1)*5.6);b.scale.set(.4,1,1.2);dg.add(b);void a;}
 // ---- the reconstruction's dressing: what the rescues use (moving things are kept out of the bake) ----------------------------
 const R8=new THREE.Group();R8.name='c8-rescue-things';root.add(R8);keep.add(R8);
 const dialTex=(label)=>paper(256,256,(g,w,h)=>{g.fillStyle='#e6e1d2';g.beginPath();g.arc(w/2,h/2,w*.47,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=6;g.stroke();
  g.strokeStyle='#8a2a22';g.lineWidth=18;g.beginPath();g.arc(w/2,h/2,w*.36,Math.PI*.95,Math.PI*1.2);g.stroke();g.strokeStyle='#2f5a34';g.beginPath();g.arc(w/2,h/2,w*.36,Math.PI*1.75,Math.PI*1.98);g.stroke();
  g.fillStyle='#222';g.font='bold 30px "Courier New",monospace';g.textAlign='center';g.fillText('LOAD',w/2,h*.7);g.font='bold 44px "Courier New",monospace';g.fillText(label,w/2,h*.88);g.font='bold 18px "Courier New",monospace';g.fillText('NO LOAD',w*.26,h*.62);g.fillText('HELD',w*.78,h*.36);});
 const mk=(tex,c=0xffffff)=>{const m=new THREE.MeshStandardMaterial({map:tex,color:tex?c:0xe6e1d2,roughness:.6});m.name='c8-dial';return m;};
 const lampM=c=>{const m=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.4});m.name='c8-panel-lamp';return m;};
 // J: the BARRIER LOAD panel (1959): one dial and one lamp for each occupied chamber still on the circuit: D3, E2, F2 (the film's gauges)
 const PANEL={g:new THREE.Group(),needles:[],lamps:[],v:[1,1,1],want:[1,1,1]};PANEL.g.name='c8-load-panel';R8.add(PANEL.g);PANEL.g.position.set(9.6,-3,22.25);
 K.box(PANEL.g,0,1.55,.12,5.2,2.3,.24,green);K.box(PANEL.g,0,2.86,.16,5.4,.32,.3,steel);
 {const plate=paper(512,64,(g,w,h)=>{g.fillStyle='#d9d3bf';g.fillRect(0,0,w,h);g.fillStyle='#222';g.font='bold 34px "Courier New",monospace';g.textAlign='center';g.fillText('BARRIER LOAD — CHAMBER CIRCUIT',w/2,44);});
  const pm=new THREE.Mesh(new THREE.PlaneGeometry(4.6,.42),new THREE.MeshStandardMaterial({map:plate,roughness:.7}));pm.position.set(0,2.86,.32);PANEL.g.add(pm);}
 ['D3','E2','F2'].forEach((lab,i)=>{const x=-1.65+i*1.65,dm=new THREE.Mesh(new THREE.CircleGeometry(.55,32),mk(dialTex(lab)));dm.position.set(x,1.7,.25);PANEL.g.add(dm);
  const nd=new THREE.Group();nd.position.set(x,1.7,.27);const bar=new THREE.Mesh(new THREE.BoxGeometry(.035,.46,.012),new THREE.MeshStandardMaterial({color:0x111111}));bar.position.y=.2;nd.add(bar);PANEL.g.add(nd);PANEL.needles.push(nd);
  const lp=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),lampM(0x6aff7a));lp.position.set(x,.75,.27);PANEL.g.add(lp);PANEL.lamps.push(lp);});
 {const P2=PANEL.g.clone(true);P2.name='c8-load-panel-h';P2.position.set(14.4,-3,44.38);R8.add(P2);PANEL.twin=P2;// (the same panel, on H's wall beside the anchor board)
  const nd=[],lp=[];P2.traverse(o=>{if(o.isGroup&&o.children.length===1&&o.children[0].geometry?.parameters?.height===.46)nd.push(o);if(o.isMesh&&o.geometry?.type==='SphereGeometry'){o.material=o.material.clone();lp.push(o);}});PANEL.needles2=nd;PANEL.lamps2=lp;}
 // the crew room's tall locker by its door, that can be pushed across it
 const gLocker=new THREE.Group();gLocker.name='c8-g-locker';R8.add(gLocker);K.box(gLocker,0,.95,0,.55,1.9,.6,green);for(let k=0;k<3;k++)K.box(gLocker,.28,.4+k*.55,0,.01,.3,.4,dark);gLocker.position.set(1.45,-3,41.4);
 // the cell doors that have a boy behind them get a view slot (a steel hood, three bars, the dark behind them)
 for(const id of ['samCell','jamieCell']){const D=DOORS[id];if(!D?.leaf)continue;const sl=new THREE.Group();sl.name='c8-slot-'+id;D.leaf.add(sl);const fz=D.ew?0:-.08;
  for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(.025,.22,.03),steel);b.position.set(-.13+k*.13,1.45-D.h/2,fz-.012);sl.add(b);}
  const hood=new THREE.Mesh(new THREE.BoxGeometry(.5,.05,.1),steel);hood.position.set(0,1.58-D.h/2,fz-.03);sl.add(hood);}
 // D: the horn of the old intercom (1959), the breaker for the wing, the lamp cable down in the water, the pipe in D2, the flood door's brake and chain
 {const hn=new THREE.Group();hn.position.set(-9.4,-1.1,25.32);dg.add(hn);K.cyl(hn,0,0,.12,.07,.22,steel,{rx:Math.PI/2,r2:.16});K.box(hn,0,.18,0,.06,.3,.06,steel);}
 K.box(dg,-7.4,-1.6,25.27,.7,.95,.16,green);const breaker=new THREE.Group();breaker.position.set(-7.4,-1.55,25.4);R8.add(breaker);{const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.42,.05),red);h.position.y=.18;breaker.add(h);}
 {const plate=paper(256,64,(g,w,h)=>{g.fillStyle='#d9d3bf';g.fillRect(0,0,w,h);g.fillStyle='#222';g.font='bold 22px "Courier New",monospace';g.textAlign='center';g.fillText('WING D — LIGHTS / PUMP',w/2,40);});const pm=new THREE.Mesh(new THREE.PlaneGeometry(.66,.17),new THREE.MeshStandardMaterial({map:plate,roughness:.7}));pm.position.set(-7.4,-.98,25.36);dg.add(pm);}
 const liveCable=new THREE.Group();liveCable.name='c8-live-cable';R8.add(liveCable);{const pts=[[-15.6,-.45,28.7],[-15.5,-1.6,28.5],[-15.6,-2.7,28.3],[-15.2,-3.3,28.2]];for(let i=0;i<pts.length-1;i++)K.pipe(liveCable,pts[i],pts[i+1],.02,m(0x1b1b1c,{roughness:.6},null,'cable'),5);lampAt(-15.6,-.45,28.6,false);}
 const pipeWedge=new THREE.Group();pipeWedge.name='c8-wedge-pipe';R8.add(pipeWedge);K.pipe(pipeWedge,[-.55,0,0],[.55,0,0],.045,steel,8);pipeWedge.position.set(-14.4,-3.38,31.9);pipeWedge.rotation.y=.5;
 const isoBrake=new THREE.Group();isoBrake.position.set(-6.9,-1.9,25.35);R8.add(isoBrake);{K.box(dg,-6.9,-2.05,25.25,.22,.5,.12,green);const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,.05),red);h.position.y=.24;isoBrake.add(h);}
 const isoChain=new THREE.Group();isoChain.position.set(-5.1,-3,28.95);R8.add(isoChain);for(let k=0;k<14;k++){const l=new THREE.Mesh(new THREE.TorusGeometry(.05,.012,5,10),steel);l.position.y=.2+k*.2;l.rotation.y=k%2?Math.PI/2:0;isoChain.add(l);}K.box(dg,-5.1,.0,28.95,.3,.2,.3,steel);
 // the drain in D0's floor, the water's way out; a cot and a book in D1 (Ruth Ann's: chapter's own reading), tally marks in D3 (Sam's days)
 for(let k=0;k<5;k++)K.box(dg,-21.6+k*.03,-2.2+k*.0,30.6+k*.16,.01,.18,.02,m(0x2a2622,{roughness:1},null,'tally'));
 // E: claws dragged down the cell doors and the den door, at a height no person reaches; the den: what it brought back, and kept
 const scratch=m(0x1a1714,{roughness:1},null,'scratch');for(const [x,z] of [[18.5,25.1],[25.5,25.1],[31.5,25.1],[33.95,27]])for(let k=0;k<4;k++){const o=K.box(dg,x-.25+k*.11,-.5,z+(x>33?0:-.0),.02,.9,.015,scratch,{rz:.1+k*.03});if(x>33){o.rotation.set(0,Math.PI/2,.1+k*.03);}}
 {const sh=new THREE.Group();sh.position.set(40.5,-3,27.3);dg.add(sh);K.box(sh,0,.5,0,.5,1,2.6,rust);
  for(const [y,z,w,h,d,c] of [[1.08,-.9,.3,.16,.22,0x8a2a22],[1.06,-.4,.24,.12,.3,0x2a4a7a],[1.12,.1,.18,.24,.1,0x3a3a3a],[1.05,.6,.28,.1,.16,0xd8c8a0],[1.07,1.05,.22,.14,.3,0x5a3a6a]])K.box(sh,0,y,z,w,h,d,m(c,{roughness:.8},null,'kept'));
  K.box(sh,.05,1.02,-.9,.32,.04,.24,m(0xd8d0b0,{roughness:.9},null,'lunchbox-lid'));}
 const jamieShoe=K.box(dg,37.2,-2.93,26.6,.12,.1,.27,m(0xd8d8dc,{roughness:.8},null,'shoe'),{ry:.6});void jamieShoe;
 const bolts=new THREE.Group();bolts.name='c8-bolts';R8.add(bolts);for(let k=0;k<7;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.09,6),steel);b.position.set(16.4+((k*.37)%1)*.3,-2.96,28.4+((k*.61)%1)*.3);b.rotation.set(Math.PI/2,k,0);bolts.add(b);}K.box(dg,16.4,-2.97,28.5,.5,.03,.4,wood);
 const vent=new THREE.Group();vent.name='c8-vent-cover';R8.add(vent);vent.position.set(29.86,-2.62,22.6);{const pl=new THREE.Mesh(new THREE.BoxGeometry(.04,.5,.62),steel);vent.add(pl);for(let k=0;k<5;k++){const sl=new THREE.Mesh(new THREE.BoxGeometry(.05,.03,.5),dark);sl.position.set(-.01,-.18+k*.09,0);vent.add(sl);}for(const [y,z] of [[.21,.27],[.21,-.27],[-.21,.27],[-.21,-.27]]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.06,6),rust);b.rotation.z=Math.PI/2;b.position.set(-.03,y,z);vent.add(b);}}
 K.box(dg,29.83,-2.62,22.6,.02,.46,.58,dark);K.box(dg,27.38,-2.62,22.6,.03,.5,.62,dark);// (the duct's mouths, both sides)
 // E5, E6: the bore it made. Low where a pipe crosses it: you get under on your knees
 K.pipe(dg,[38.5,-1.85,36.4],[40.8,-1.85,36.4],.28,rust);K.pipe(dg,[30,-1.9,44.6],[30,-1.9,46.8],.24,rust);for(let k=0;k<10;k++)K.box(dg,39.6+((k*.5)%1-.5)*1.4,-2.95,33+k*1.3,.6,.04,.12,m(0x241c18,{roughness:.6},null,'drag'));
 // F0: the corridor that does not stay the same. The wall that slides across it; the panels over the side passage's mouths;
 // a stretch of it papered like the upstairs hall of a house in Briarwood, with photographs on the wall
 const fWall=new THREE.Group();fWall.name='c8-sliding-wall';R8.add(fWall);K.box(fWall,0,1.4,0,3.4,2.8,.2,paint74);fWall.position.set(19.8+3.6,-3,53.6);
 const faPanels=['fa1','fa2'].map((id,i)=>{const pg=new THREE.Group();pg.name='c8-'+id;R8.add(pg);K.box(pg,0,1.2,0,.2,2.4,1.5,paint74);pg.position.set(21.5,-3,i?56.9:50.9);return pg;});
 const paper74=m(0x8a7a5a,{roughness:1},null,'wallpaper');const papered=m(0x7d8a6e,{roughness:.95},null,'hall-paper');
 for(const z of [54,56,58,60,62])for(const x of [18.13,21.47]){K.box(dg,x,-1.6,z,.02,2.6,1.9,papered);}
 for(const [x,z,c] of [[18.16,55,0x6a5a48],[18.16,58.4,0x4a5a6a],[21.44,57,0x7a4a3a],[21.44,60.6,0x5a6a4a]]){K.box(dg,x,-1.3,z,.03,.5,.4,m(0x2a2522,{roughness:.5},null,'frame'));K.box(dg,x+(x<20?.012:-.012),-1.3,z,.02,.42,.32,m(c,{roughness:.8},null,'photo'));}
 // F1: the room that was made, its walls papered inside (each panel peels off when it comes apart) and the floor that splits
 const madeWalls=[];for(const [x,z,w,ry] of [[22.2,64.15,11.4,0],[22.2,73.45,11.4,Math.PI],[16.55,68.8,9.2,Math.PI/2],[27.85,68.8,9.2,-Math.PI/2]]){const n=Math.round(w/1.9);for(let k=0;k<n;k++){const pg=new THREE.Group();const u=-w/2+(k+.5)*w/n;
   pg.position.set(x+(ry===0||ry===Math.PI?u:0),-3,z+(ry===0||ry===Math.PI?0:u));pg.rotation.y=ry;made.add(pg);const pm=new THREE.Mesh(new THREE.PlaneGeometry(w/n-.02,2.7),m(0x9db0c8,{roughness:.95},null,'boys-wallpaper'));pm.position.y=1.35;pg.add(pm);madeWalls.push({g:pg,ry,k,r:((k*37+z)%10)/10});}}
 const fissure=new THREE.Group();fissure.name='c8-fissure';R8.add(fissure);fissure.visible=false;{const fm=new THREE.Mesh(new THREE.BoxGeometry(7.4,.05,1),dark);fm.position.set(22.6,-2.99,68.6);fissure.add(fm);
  for(let k=0;k<8;k++){const e=K.box(fissure,19.2+k*.95,-2.9,68.05+((k*.43)%1)*.2,.9,.12,.25,floorM,{rx:-.25,ry:(k%3-1)*.15});void e;const e2=K.box(fissure,19.2+k*.95,-2.92,69.15-((k*.61)%1)*.2,.9,.12,.25,floorM,{rx:.25,ry:(k%2-.5)*.2});void e2;}}
 // F2: where Alex has been. His marks on the wall by the cot (days), a map scratched into the paint (the camp, the line out to it, a grate)
 {const tally=paper(256,256,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);g.strokeStyle='rgba(30,26,22,.9)';g.lineWidth=4;for(let i=0;i<5;i++){const x0=30+i*40;for(let k=0;k<4;k++){g.beginPath();g.moveTo(x0+k*7,30);g.lineTo(x0+k*7,80);g.stroke();}if(i<4){g.beginPath();g.moveTo(x0-4,74);g.lineTo(x0+28,36);g.stroke();}}
   g.lineWidth=3;g.beginPath();g.moveTo(40,200);g.lineTo(120,150);g.lineTo(200,160);g.stroke();g.beginPath();g.arc(206,160,10,0,7);g.stroke();g.font='bold 22px sans-serif';g.fillStyle='rgba(30,26,22,.9)';g.fillText('CAMP',150,235);g.fillText('GRATE',160,138);g.fillText('ME',20,225);});
  const tm=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),new THREE.MeshStandardMaterial({map:tally,transparent:true,roughness:1}));tm.position.set(23.86,-1.6,77);tm.rotation.y=-Math.PI/2;dg.add(tm);}
 const breachWall=new THREE.Group();breachWall.name='c8-breach-wall';R8.add(breachWall);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const c=K.box(breachWall,16.66,-3+.38+i*.74,75.9+j*.53+.27,.22,.74,.53,wet);c.userData.home=c.position.clone();c.userData.r=((i*3+j)*.37)%1;}
 // IL: the ledge: a concrete shelf along the main chamber's east wall, a broken rail, and twenty metres in a gap with only the steel beam across it
 for(const [z0,z1] of [[53,60],[62.6,79.6]])K.box(dg,15.1,-3.12,(z0+z1)/2,3,.24,z1-z0,floorM);K.box(dg,15.1,-3.08,61.3,.7,.16,2.6,steel);K.box(dg,15.1,-3.4,61.3,.3,.5,2.6,steel);
 for(let z=54;z<79;z+=1.8){if(z>59&&z<63.4)continue;if((z*7)%5<1.2)continue;K.box(dg,13.75,-2.5,z,.05,1,.05,yellow);}K.box(dg,13.75,-2.0,58,.04,.04,8,yellow);K.box(dg,13.75,-2.0,71,.04,.04,13,yellow);
 K.pipe(dg,[16.4,-1.95,66],[16.4,-1.95,70],.22,rust);K.pipe(dg,[13.7,-1.85,67.6],[16.5,-1.85,67.6],.12,rust);// (a pipe across it at chest height: duck under)
 const ledgeFall=new THREE.Group();ledgeFall.name='c8-ledge-fall';R8.add(ledgeFall);K.box(ledgeFall,15.1,-3.12,74.4,3,.24,3,floorM);// (the piece of shelf that goes, behind them)
 // H: the broken window onto the ledge (glass, and the panel under the sill, both go)
 const hwinG=new THREE.Group();hwinG.name='c8-h-window';R8.add(hwinG);K.box(hwinG,15,-3+.48,52,1.6,.95,.2,paint);const hg2=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),glass);hg2.position.set(15,-3+1.75,51.95);hwinG.add(hg2);
 // G: the crew room, lived in: a couch along the back wall, a cot under the lockers' end, a vending machine, the first-aid box, a radio
 K.box(dg,-3.4,-2.7,42.5,2.6,.42,.85,m(0x5a4a3a,{roughness:1},null,'couch'));K.box(dg,-3.4,-2.25,42.85,2.6,.6,.2,m(0x5a4a3a,{roughness:1},null,'couch'));for(const x of [-4.62,-2.18])K.box(dg,x,-2.5,42.5,.18,.5,.85,m(0x4a3a2a,{roughness:1},null,'couch-arm'));
 K.box(dg,-5.3,-2.68,41.2,.75,.12,1.9,m(0x3a4a3a,{roughness:1},null,'cot'));for(const [dx,dz] of [[-.3,-.85],[.3,-.85],[-.3,.85],[.3,.85]])K.box(dg,-5.3+dx,-2.85,41.2+dz,.04,.3,.04,steel);
 K.box(dg,-.2,-2.15,36.45,.9,1.7,.7,m(0x7a2a24,{roughness:.6},null,'vending'));K.box(dg,-.2,-1.9,36.1,.6,.9,.02,m(0x10141a,{roughness:.2},null,'vending-glass'));
 K.box(dg,-2.6,-1.4,36.1,.45,.35,.12,m(0xd8d2c4,{roughness:.7},null,'first-aid'));K.box(dg,-2.6,-1.4,36.04,.12,.12,.01,red);K.box(dg,-2.6,-1.4,36.04,.04,.24,.012,m(0xf2f2f0,{},null,'cross'));K.box(dg,-2.6,-1.4,36.04,.24,.04,.012,m(0xf2f2f0,{},null,'cross'));
 for(const [x,z] of [[-1.1,41.3],[-3.3,41.6]]){K.box(dg,x,-2.55,z,.42,.05,.42,wood);K.box(dg,x,-2.27,z+.2,.42,.5,.05,wood);for(const [dx,dz] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])K.box(dg,x+dx,-2.8,z+dz,.04,.45,.04,steel);}
 for(const ch of made.children)ch.userData.home={p:ch.position.clone(),r:ch.rotation.clone(),s:ch.scale.clone()};for(const P of madeWalls)P.g.userData.paper=true;
 // ---- bake the static parts ------------------------------------------------------------------------------------------
 const baked=bake(root,keep);
 // ---- lights the complex owns (always the same few, moved to wherever you are) ----------------------------------------
 // ---- walking: a room the nav asks while you are in here --------------------------------------------------------------
 const walkCells=[...cell.values()].filter(c=>!c.o.visual);
 const SOLIDS=[// [x,z,hw,hd]: furniture and machinery you walk round (local)
  [-20.6,12.35,.85,.45],[-23.55,12.2,.32,.48],[-15.6,12.8,.58,.33],[-17.5,18.2,.3,.3],[4,30.9,3.55,.45],[-2.2,39.6,1.25,.55],[-5.55,38.25,.3,1.6],[5,51.5,11,.35],
  [-11.6,20.4,1.25,.65],[-30.15,29.55,.6,.65],[9.6,22.4,2.6,.25],[-3.4,42.5,1.4,.5],[-5.3,41.2,.4,.95],[-.2,36.45,.45,.35],[40.5,27.3,.3,1.3],[15.6,19.8,.75,.75],[17.8,7.6,.32,.32],[18.6,8.4,.32,.32],[-12.8,7.2,.32,.32],[38,30.5,1.6,.7],[20.3,78.6,.85,.45],[26.6,66.4,.55,1.05],[17.6,70.2,.35,.7],[26.6,72.6,.45,.3],
  ...[-10,-4,2,8,14].flatMap(x=>[10,18].map(z=>[x,z,.32,.32])),
 ];
 const extraSolids=[{x:14.1,z:61.3,hw:.5,hd:1.3},{x:16.1,z:61.3,hw:.5,hd:1.3}];// (the chapter's own: debris, a fallen beam, a closed barrier leaf; first: the ledge's gap either side of its beam)
 const baseSolids=extraSolids.length;
 const inCellI=(c,x,z,r)=>x>c.x0+WT+r&&x<c.x1-WT-r&&z>c.z0+WT+r&&z<c.z1-WT-r;
 function openingAt(x,z,r,{walk=true}={}){for(const o of OPENINGS){if(o.window&&walk)continue;if(o.door&&doorOpen.get(o.door)<(walk?(ST.duck?.[o.door]??.62):.3))continue;/* (a door jammed part way: ST.duck says how low it may be and still be got under) */
   if(o.x!=null){if(Math.abs(x-o.x)<WT+.7&&z>o.r[0]+r&&z<o.r[1]-r)return o;}else if(Math.abs(z-o.z)<WT+.7&&x>o.r[0]+r&&x<o.r[1]-r)return o;}return null;}
 function cellAt(x,z,{pad=0}={}){for(const c of cell.values())if(x>=c.x0-pad&&x<=c.x1+pad&&z>=c.z0-pad&&z<=c.z1+pad&&!c.o.visual)return c;for(const c of cell.values())if(x>=c.x0&&x<=c.x1&&z>=c.z0&&z<=c.z1)return c;return null;}
 function solidAt(x,z,r){for(const [sx,sz,hw,hd] of SOLIDS)if(Math.abs(x-sx)<hw+r&&Math.abs(z-sz)<hd+r)return true;
  if(ST.barrier<.6&&Math.abs(x+7.6)<.1+r&&z>-4.3&&z<-1.7)return true;if(ST.locker>.8&&Math.abs(x-1.62)<.35+r&&Math.abs(z-38.7)<1.1+r)return true;if(ST.slide>.75&&Math.abs(z-53.6)<.14+r&&x>17.9&&x<21.7)return true;if(ST.grille>.62&&Math.abs(x-22)<.08+r&&z>25&&z<29)return true;/* (the outer barrier, down; the grille, down) */for(const b of extraSolids)if(b.on!==false&&Math.abs(x-b.x)<b.hw+r&&Math.abs(z-b.z)<b.hd+r)return true;return false;}
 function walkL(x,z,r=.28){if(solidAt(x,z,r*.8))return false;for(const c of walkCells)if(inCellI(c,x,z,r))return true;const o=openingAt(x,z,r);if(o){const A=cell.get(o.a),B=cell.get(o.b);return !A.o.visual&&!B.o.visual;}return false;}
 function floorL(x,z){const o=openingAt(x,z,0);let c=null;for(const cc of walkCells)if(x>=cc.x0&&x<=cc.x1&&z>=cc.z0&&z<=cc.z1){c=cc;break;}if(!c&&o)c=cell.get(o.a);if(!c)return -3;return cellFloor(c,x,z);}
 const BOX={x0:-48,x1:46,z0:-8,z1:88};
 const nav={inside:(wx,wz)=>{const x=wx-CX.x,z=wz-CX.z;return x>BOX.x0&&x<BOX.x1&&z>BOX.z0&&z<BOX.z1;},
  walkable:(wx,wz,r=.28)=>walkL(wx-CX.x,wz-CX.z,typeof r==='object'?r.r??.28:r),floorAt:(wx,wz)=>floorL(wx-CX.x,wz-CX.z),
  rideable:()=>false,surface:(wx,wz)=>{const c=cellAt(wx-CX.x,wz-CX.z);return c?.o.water!=null?'water':c?.o.kind==='catwalk'?'metal':'concrete';}};
 // ---- sight: a line is clear if every point of it is inside a cell (or an open way or a window), between floor and ceiling
 function sightL(ax,ay,az,bx,by,bz){const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.22);for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=ay+(by-ay)*t;
   let ok=false;for(const c of cell.values()){if(x>c.x0+WT&&x<c.x1-WT&&z>c.z0+WT&&z<c.z1-WT){const f=cellFloor(c,x,z);if(y>f-.1&&y<f+c.h){ok=true;break;}}}
   if(!ok){const o=openingAt(x,z,0,{walk:false});if(o){const f=Math.max(cell.get(o.a).y,cell.get(o.b).y)+(o.v0||0);if(y>f&&y<f+o.h-(o.v0||0))ok=true;}}
   if(!ok)return false;for(const [sx,sz,hw,hd] of SOLIDS)if(Math.abs(x-sx)<hw&&Math.abs(z-sz)<hd&&y<floorL(sx,sz)+1.15)return false;}return true;}
 const sight=(ax,ay,az,bx,by,bz)=>sightL(ax-CX.x,ay,az-CX.z,bx-CX.x,by,bz-CX.z);
 // ---- the hunter's graphs: the rooms of one part of the works, their middles and their ways in -----------------------------
 function graph(ids,{extra=[]}={}){const nodes=[],edges=[],set=new Set(ids);let n=0;const add=(x,z,o={})=>{const id='n'+(n++);nodes.push({id,x:CX.x+x,z:CX.z+z,...o});return id;};
  const of=new Map();for(const id of ids){const c=cell.get(id),w=c.x1-c.x0,d=c.z1-c.z0,nx=Math.max(1,Math.round(w/7)),nz=Math.max(1,Math.round(d/7)),list=[];
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){let x=c.x0+w*(i+.5)/nx,z=c.z0+d*(j+.5)/nz;if(!walkL(x,z,.4)){const o2=[[1.2,0],[-1.2,0],[0,1.2],[0,-1.2],[1.2,1.2],[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[2.2,0],[-2.2,0]].find(([a,b])=>walkL(x+a,z+b,.4));if(!o2)continue;x+=o2[0];z+=o2[1];}// (a column where the grid fell: beside it)
    list.push(add(x,z,{cell:id,pause:(i+j)%2?1.4:0}));}
   for(let a=0;a<list.length;a++)for(let b=a+1;b<list.length;b++){const A=nodes.find(q=>q.id===list[a]),B=nodes.find(q=>q.id===list[b]);if(Math.hypot(A.x-B.x,A.z-B.z)<11)edges.push([list[a],list[b]]);}of.set(id,list);}
  for(const o of OPENINGS){if(o.window||!set.has(o.a)||!set.has(o.b))continue;const x=o.x??(o.r[0]+o.r[1])/2,z=o.z??(o.r[0]+o.r[1])/2,door=o.door;
   const id=add(x,z,{door,closed:door?()=>doorOpen.get(door)<.62:null});for(const c of [o.a,o.b])for(const q of of.get(c)||[])edges.push([id,q]);}
  for(const e of extra)nodes.push(e);return {nodes,edges};}
 // ---- doors, levers, the barrier, the plug: the chapter moves them; update eases them --------------------------------------
 const ST={active:false,barrier:1,barrierWant:1,crankV:0,grille:1,grilleWant:1,plugDrop:0,plugWant:0,valve:0,valveV:0,leverJ:0,leverA:[0,0],pins:[0,0,0],water:0,waterWant:0,shift:0,made:0,crane:0,breaker:0,cable:1,wedge:0,vent:0,slide:0,breach:0,ledge:0,hwin:0,madeBreak:0,isoBrake:0,bow:[0,0,0],shear:0,locker:0};
 function setDoor(id,v,{instant=false}={}){const D=DOORS[id];if(!D)return;D.want=v;if(instant){D.set(v);doorOpen.set(id,v);}}
 function update(dt){for(const D of Object.values(DOORS)){if(D.open!==D.want){const sp=D.kind==='rise'?.55:1.6;D.set(D.want>D.open?Math.min(D.want,D.open+dt*sp):Math.max(D.want,D.open-dt*sp));doorOpen.set(D.o.door,D.open);}}
  // the outer barrier: down when barrier=0 (its leaf seated), the crank turns as it goes
  if(ST.barrier!==ST.barrierWant){const v=Math.sign(ST.barrierWant-ST.barrier)*dt*.24;ST.barrier=clamp(ST.barrier+v,Math.min(ST.barrier,ST.barrierWant),Math.max(ST.barrier,ST.barrierWant));crank.rotation.z+=v*-38;}
  leaf.position.y=2.6*ST.barrier;
  if(ST.grille!==ST.grilleWant){ST.grille=ST.grilleWant>ST.grille?Math.min(ST.grilleWant,ST.grille+dt*.7):Math.max(ST.grilleWant,ST.grille-dt*1.8);}grille.position.y=-3+ST.grille*0+(1-ST.grille)*2.95;glever.rotation.x=(1-ST.grille)*1.1;
  jlever.rotation.x=ST.leverJ*1.1;for(let i=0;i<2;i++)alexLevers[i].rotation.x=ST.leverA[i]*1.1;valve.rotation.x+=ST.valveV*dt;ST.valveV=damp(ST.valveV,0,3,dt);
  for(let i=0;i<3;i++){pins[i].position.x=-7.6+i*1.4+ST.pins[i]*.7;pins[i].visible=ST.pins[i]<1.6;}
  if(ST.plugDrop!==ST.plugWant){ST.plugDrop=Math.min(ST.plugWant,ST.plugDrop+dt*(.25+ST.plugDrop*2.2));}plug.position.y=7.4-ST.plugDrop*22;
  ST.water=damp(ST.water,ST.waterWant,.35,dt);for(const w of WATER)w.mesh.position.y=w.base+ST.water;
  trolley.position.x=-2+ST.crane*6;hook.position.x=-2+ST.crane*6;
  // the reconstruction's moving things
  ST.clock=(ST.clock||0)+dt;
  for(let i=0;i<3;i++){PANEL.v[i]=damp(PANEL.v[i],PANEL.want[i],PANEL.want[i]<PANEL.v[i]?2.2:1.2,dt);const jit=PANEL.want[i]<.5&&PANEL.v[i]>.05?Math.sin(ST.clock*3+i)*.04:0;PANEL.needles[i].rotation.z=-(PANEL.v[i]-.5)*2.2+jit;
   PANEL.lamps[i].material.color.setHex(PANEL.want[i]>.5?0x6aff7a:0xff3a2a);PANEL.lamps[i].material.emissive.setHex(PANEL.want[i]>.5?0x3aff5a:0xff2a1a);
   if(PANEL.needles2?.[i]){PANEL.needles2[i].rotation.z=PANEL.needles[i].rotation.z;}if(PANEL.lamps2?.[i]){PANEL.lamps2[i].material.color.copy(PANEL.lamps[i].material.color);PANEL.lamps2[i].material.emissive.copy(PANEL.lamps[i].material.emissive);}}
  // the barrier: each of its three sections bows out (toward the plug) as its anchor goes; at the end they shear and fall
  for(const [k,rib] of barrier.children.entries()){const hx=rib.userData.home?.x??rib.position.x,sec=Math.max(0,Math.min(2,Math.floor((hx+12.5)/8.33))),b=ST.bow[sec]||0,sh=clamp((ST.shear-((k*.37)%1)*.5)/.5,0,1);
   if(rib.userData.home===undefined)rib.userData.home=rib.position.clone();rib.position.copy(rib.userData.home);rib.position.z-=b*1.4+sh*sh*6;rib.rotation.x=-b*.06-sh*1.1*((k%2)?1:.7);rib.position.y-=sh*sh*9;rib.rotation.z=sh*((k%3)-1)*.4+(b>0?Math.sin(ST.clock*7+k)*.004*b:0);}
  gLocker.position.set(lerp(1.45,1.62,ST.locker),-3,lerp(41.4,38.7,ST.locker));gLocker.rotation.y=ST.locker*.04;
  breaker.rotation.x=ST.breaker*1.2;isoBrake.rotation.x=ST.isoBrake*1.1;
  pipeWedge.visible=ST.wedge<2;if(ST.wedge===1){pipeWedge.position.set(-19.75,-3.2,29.12);pipeWedge.rotation.set(0,0,0);}
  bolts.visible=!ST.boltsTaken;vent.visible=ST.vent<1;if(ST.vent>0&&ST.vent<1){vent.rotation.z=ST.vent*1.3;vent.position.x=29.86+ST.vent*.3;vent.position.y=-2.62-ST.vent*.3;}
  fWall.position.x=19.8+3.6*(1-ST.slide);faPanels[0].position.y=-3+(ST.fa||0)*2.5;faPanels[1].position.y=-3+(ST.fa||0)*2.5;
  {const k=ST.madeBreak;for(const P of madeWalls){const e=clamp((k-P.r*.5)/.5,0,1);P.g.children[0].rotation.x=-e*1.25;P.g.children[0].position.y=1.35-e*1.1;P.g.children[0].position.z=e*.6;}fissure.visible=k>.3;fissure.scale.z=1+k*1.6;}
  for(const c of breachWall.children){const e=clamp((ST.breach-c.userData.r*.4)/.6,0,1);c.position.copy(c.userData.home);c.position.x-=e*e*1.8;c.position.y-=e*e*(1.2+c.userData.r*2.5);c.rotation.z=e*(c.userData.r-.5)*2;c.visible=ST.breach<1||c.userData.r>.5;}
  ledgeFall.position.y=-ST.ledge*ST.ledge*14;ledgeFall.rotation.x=ST.ledge*.6;ledgeFall.visible=ST.ledge<1;
  hwinG.children[0].visible=ST.hwin<1;hwinG.children[1].visible=ST.hwin<.5;}
 function reset(){for(const D of Object.values(DOORS)){D.set(0);D.want=0;doorOpen.set(D.o.door,0);}
  for(const id of ['B1','B2','C','G','Gback','D1','D2','E1','E3','bulkhead','F0','den','dIso'])setDoor(id,1,{instant:true});
  Object.assign(ST,{barrier:1,barrierWant:1,grille:1,grilleWant:1,plugDrop:0,plugWant:0,valve:0,valveV:0,leverJ:0,leverA:[0,0],pins:[0,0,0],water:0,waterWant:0,shift:0,made:0,crane:0,duck:{},breaker:0,cable:1,wedge:0,vent:0,slide:0,breach:0,ledge:0,hwin:0,madeBreak:0,isoBrake:0,boltsTaken:false,bow:[0,0,0],shear:0,locker:0});
  extraSolids.length=baseSolids;PANEL.v=[1,1,1];PANEL.want=[1,1,1];for(const ch of made.children){const h=ch.userData.home;if(h){ch.position.copy(h.p);ch.rotation.copy(h.r);ch.scale.copy(h.s);}}made.visible=true;for(const c of made.children)c.visible=true;made.position.set(0,0,0);made.rotation.set(0,0,0);made.scale.set(1,1,1);update(0);}
 function show(on){if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();ST.active=!!on;}
 reset();
 const at=(name,y=null)=>{const s=SPOT[name];const c=cellAt(s[0],s[1]);return {x:CX.x+s[0],z:CX.z+s[1],y:y??(c?cellFloor(c,s[0],s[1]):0)};};
 return {root,nav,sight,graph,cell,cells:cell,DOORS,doorOpen,setDoor,ST,update,reset,show,at,SPOT,W:W8,L:L8,cellAt:(wx,wz)=>cellAt(wx-CX.x,wz-CX.z),cellIdAt:(wx,wz)=>{const x=wx-CX.x,z=wz-CX.z;for(const c of walkCells)if(x>=c.x0&&x<=c.x1&&z>=c.z0&&z<=c.z1)return c.id;const o=openingAt(x,z,0);return o?o.a:null;},
  floorL,walkL,extraSolids,screen,screenM,proj,plug,throat,barrier,pins,made,leaf,crank,grille,valve,WATER,baked,lampAt,K,PANEL,gLocker,breaker,liveCable,pipeWedge,isoBrake,isoChain,bolts,vent,fWall,faPanels,madeWalls,fissure,breachWall,ledgeFall,hwinG,R8,mats:{conc,conc2,wet,steel,green,yellow,red,rust,flesh,dark,brick,wood,glass,waterM,lampOn,lampOff,floorM},
  inCell:(wx,wz,id,r=0)=>{const c=cell.get(id);if(!c)return false;const x=wx-CX.x,z=wz-CX.z;return x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r;}};
}
