// Chapter Seven: the two houses on Old Mill Court that have insides.
//
//  The dining house: only its dining room is built, behind a picture window on the front: a table laid for four, four
//  people at it, a console television playing, a hutch, a hanging lamp. Nobody inside moves. (The people are the cast's;
//  this is the room and where they sit.)
//  The house with the green door: two storeys, a real interior, the stealth encounter's map.
//   Ground: the foyer (the front door, the foot of an open stair that climbs toward the back), the living room (1960s:
//   a console set, a starburst clock, plastic on the lampshades), the den (a closet), the back hall behind the stair (the
//   closet under the stair), the kitchen (a pantry; the back door, locked), the dining room. The rooms make a loop around
//   the stair's core, so something walking it can be avoided by going the other way round.
//   Upstairs: a hall round the stairwell (a railing), at its front end the window over the porch roof (the way out),
//   a boy's room from August 1991 (back-left: its side window looks north, to the head of the court), his parents' room
//   from the sixties (front-right), a storeroom (front-left: the old green bike), and a shut bathroom.
//
// House frame (both): x across the front, front wall at z=-D/2 facing -z, y up from the ground; the ground floor is F up.
// nav: walkable(x,z,r,level) and floorAt(x,z,level) in this frame; level 'g' (ground) or 'u' (upstairs); the stair is
// both. sight(x0,y0,z0,x1,y1,z1): false if a wall, a shut door, or furniture taller than the line is in the way.
import * as THREE from './three.module.js';
import {mat,C7,createBuild,createFurniture,glassClear,paper} from './chapter7-build.js';
import {bake,inBox,clamp} from './chapter6-kit.js';
import {seeded} from './kit.js';

// ---- the house with the green door --------------------------------------------------------------------------------------------
export const HH={W:10,D:9,F:.6,H1:2.75,UP:3.5,H2:2.5,UCX:1.65};// ground floor at F; upstairs floor at UP; the upstairs hall's half width (wider than the core below: a way past the stairwell on each side)
export const STAIR={x0:-.5,x1:.5,z0:-1.6,z1:2.6};// rising toward the back (+z), F at z0 to UP at z1
export function createHorrorHouse({wallpaper=null}={}){
 const g=new THREE.Group();g.name='c7-green-door-house';const B=createBuild(g),{K}=B,{F:FN}=createFurniture();const {W,D,F,H1,UP,H2,UCX:ucx}=HH,hw=W/2,hd=D/2,t=.14;
 const ext=mat(0xb9b4a0,{},'housepaint'),plaster=mat(0xcfc6b0,{},'plaster'),paperM=wallpaper?new THREE.MeshStandardMaterial({map:wallpaper,roughness:.92}):mat(0xb8a888,{},'plaster');
 const boards=mat(0x7a5a3a,{},'timber'),carpet=mat(0x6a5a44,{},'carpet'),ceil=mat(0xd8d2c2),trim=mat(C7.trim),green=mat(0x2f5a3a,{roughness:.55},'timber'),kitchenTile=mat(0xc8c2a8,{roughness:.6},'mineral');
 const walls=[],solids=[],doors={},hides={},spots={};
 // a wall in the plan (both floors): from a to b at a level; holes along it; it also blocks the nav and sight
 const W2=(a,b,{lv='g',holes=[],m=plaster,th=t,ext:outside=false}={})=>{const y0=lv==='g'?F:UP,y1=lv==='g'?F+H1:UP+H2;B.wall(a,b,{y0,y1,t:th,m,holes,name:outside?'outer-wall':'wall'});
  // (nav: the solid stretches between holes)
  const L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;let u=0;const hs=holes.filter(h=>h[2]<.2).sort((p,q)=>p[0]-q[0]);
  for(const [h0,h1] of hs){if(h0>u)walls.push({lv,ax:a[0]+dx*u,az:a[1]+dz*u,bx:a[0]+dx*h0,bz:a[1]+dz*h0,t:th});u=h1;}if(u<L)walls.push({lv,ax:a[0]+dx*u,az:a[1]+dz*u,bx:b[0],bz:b[1],t:th});
  // windows and the like still block sight below their sill and above their head (walls array is for walking; sight uses holes too)
  for(const h of holes)if(h[2]>=.2)walls.push({lv,ax:a[0]+dx*h[0],az:a[1]+dz*h[0],bx:a[0]+dx*h[1],bz:a[1]+dz*h[1],t:th,win:true});};
 // outer walls (both floors), with the front door, windows; the back door
 const win=(u,w=1.0,sill=.9,h=1.25)=>[u-w/2,u+w/2,sill,sill+h];
 W2([-hw,-hd],[hw,-hd],{holes:[[-.5,.5,0,2.08].map((v,i)=>i<2?v+hw:v),win(hw-3.2),win(hw+3.2)],m:ext,ext:true});// front (door at x=0; windows living/dining)
 W2([hw,-hd],[hw,hd],{holes:[win(2.4),win(6.6)],m:ext,ext:true});W2([hw,hd],[-hw,hd],{holes:[[hw-3.4,hw-2.5,0,2.05],win(5.8)],m:ext,ext:true});W2([-hw,hd],[-hw,-hd],{holes:[win(2.4),win(6.6)],m:ext,ext:true});
 W2([-hw,-hd],[hw,-hd],{lv:'u',holes:[win(hw-3.2),[hw-.55,hw+.55,.75,2.05],win(hw+3.2)],m:ext,ext:true});// upstairs front: the hall window in the middle (low sill: the porch roof)
 W2([hw,-hd],[hw,hd],{lv:'u',holes:[win(2.4)],m:ext,ext:true});W2([hw,hd],[-hw,hd],{lv:'u',holes:[win(2.0),win(7.6)],m:ext,ext:true});W2([-hw,hd],[-hw,-hd],{lv:'u',holes:[win(2.2),win(6.8)],m:ext,ext:true});
 // the interior (ground): the core round the stair (x -1.2..1.2, z -1..3), room partitions with their openings
 const cx=1.2;W2([-cx,-1],[-cx,3],{});W2([cx,-1],[cx,3],{});W2([-cx,-1],[-.55,-1],{});W2([.55,-1],[cx,-1],{});W2([-cx,3],[cx,3],{holes:[[.8,1.6,0,2.0]]});// (the closet under the stair: its door from the back hall)
 W2([-hw,0],[-cx,0],{holes:[[.8,2.4,0,2.05]]});W2([cx,0],[hw,0],{holes:[[1.4,3.0,0,2.05]]});// living|den, dining|kitchen
 W2([-cx,-hd],[-cx,-1],{holes:[[.7,2.7,0,2.2]]});W2([cx,-hd],[cx,-1],{holes:[[.7,2.7,0,2.2]]});// foyer|living, foyer|dining (wide openings)
 W2([-cx,3],[-cx,hd],{holes:[[.1,1.35,0,2.05]]});W2([cx,3],[cx,hd],{holes:[[.1,1.35,0,2.05]]});// back hall|den, back hall|kitchen
 W2([3.6,3.2],[hw,3.2],{holes:[[.15,.95,0,2.0]]});W2([3.6,3.2],[3.6,hd],{});// the pantry
 W2([-hw,3.4],[-3.8,3.4],{holes:[[.15,.95,0,2.0]]});W2([-3.8,3.4],[-3.8,hd],{});// the den closet
 // upstairs: the hall round the stairwell (x -1.2..1.2 whole depth), the rooms either side
 W2([-ucx,-hd],[-ucx,0],{lv:'u',holes:[[2.85,3.85,0,2.05]]});W2([-ucx,0],[-ucx,hd],{lv:'u',holes:[[2.8,3.8,0,2.05]]});// storeroom door (z -1.65..-.65), the boy's room door (z 2.8..3.8)
 W2([ucx,-hd],[ucx,0],{lv:'u',holes:[[2.85,3.85,0,2.05]]});W2([ucx,0],[ucx,hd],{lv:'u',holes:[]});// parents' room door; the bathroom is shut (its door is drawn)
 W2([-hw,0],[-ucx,0],{lv:'u'});W2([ucx,0],[hw,0],{lv:'u'});
 // floors and ceilings
 B.floor(-hw,-hd,hw,hd,F,boards);B.floor(cx,0,hw,hd,F+.005,kitchenTile);for(const [x0,z0,x1,z1] of [[-hw,-hd,-cx,0],[cx,-hd,hw,0]])K.slab(g,(x0+x1)/2,F+.005,(z0+z1)/2,x1-x0-.6,.01,z1-z0-.6,carpet,{shadow:false});
 // the ground floor's ceiling with the stairwell hole; upstairs floor the same
 for(const [x0,z0,x1,z1] of [[-hw,-hd,-.5,hd],[.5,-hd,hw,hd],[-.5,-hd,.5,-1.0],[-.5,2.6,.5,hd]]){B.ceiling(x0,z0,x1,z1,F+H1,ceil);B.floor(x0,z0,x1,z1,UP,boards);}
 B.ceiling(-hw,-hd,hw,hd,UP+H2,ceil);
 // the stair: treads up the run, a stringer, the railing round the hole upstairs
 {const n=16;for(let k=0;k<n;k++){const u=(k+.5)/n,z=STAIR.z0+u*(STAIR.z1-STAIR.z0),y=F+(k+1)*(UP-F)/n;K.slab(g,0,y-.04,z,1.0,.06,(STAIR.z1-STAIR.z0)/n+.03,boards);K.slab(g,0,y-.15,z-.12,1.0,.2,.025,trim);}
  for(const s of [-1,1]){const a=new THREE.Vector3(s*.53,F+.25,STAIR.z0),b=new THREE.Vector3(s*.53,UP+.05,STAIR.z1);K.pipe(g,[a.x,a.y-.1,a.z],[b.x,b.y-.1,b.z],.06,boards,4);}
  K.pipe(g,[.62,F+1.0,STAIR.z0],[.62,UP+.95,STAIR.z1-.2],.03,boards,6);K.cyl(g,.62,F+.55,STAIR.z0,.05,1.1,boards);
  for(const [a,b] of [[[-.55,-1],[-.55,2.6]],[[.55,-1],[.55,2.6]],[[-.55,-1],[.55,-1]]]){K.pipe(g,[a[0],UP+.95,a[1]],[b[0],UP+.95,b[1]],.03,boards,6);const n2=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.14);for(let k=0;k<=n2;k++){const u=k/n2;K.slab(g,a[0]+(b[0]-a[0])*u,UP+.48,a[1]+(b[1]-a[1])*u,.03,.94,.03,boards);}}}
 // doors (real leaves on pivots): front (green), the closets, the pantry, the back door (locked), upstairs
 doors.front=B.door(-.47,-hd+.02,{w:.94,h:2.06,rot:0,swing:-1.5,m:green,y:F,name:'front-door'});
 doors.closet=B.door(-.4,3.02,{w:.8,h:2,rot:0,swing:1.4,y:F,name:'stair-closet'});doors.pantry=B.door(3.75,3.18,{w:.8,h:2,rot:0,swing:-1.4,y:F,name:'pantry'});
 doors.den=B.door(-4.85,3.42,{w:.8,h:2,rot:0,swing:-1.4,y:F,name:'den-closet'});doors.back=B.door(2.5,hd-.02,{w:.86,h:2.03,rot:0,swing:0,y:F,name:'back-door'});
 doors.boy=B.door(-ucx-.02,2.8,{w:.98,h:2.03,rot:-Math.PI/2,swing:-1.45,y:UP,name:'boy-door'});doors.store=B.door(-ucx-.02,-1.65,{w:.98,h:2.03,rot:-Math.PI/2,swing:-1.45,y:UP,name:'store-door'});
 doors.parents=B.door(ucx+.02,-.65,{w:.98,h:2.03,rot:Math.PI/2,swing:1.45,y:UP,name:'parents-door'});K.slab(g,ucx+.03,UP+1.02,2.2,.04,2.03,.86,mat(0x8a6a4a,{},'timber'),{name:'bath-door'});
 for(const d of Object.values(doors))d.set(0);
 // ---- furniture (ground) ----
 const put=(o,x,z,{a=0,y=F,solid=null,h=null}={})=>{o.position.set(x,y,z);o.rotation.y=a;g.add(o);if(solid){const s={x,z,hw:solid[0],hd:solid[1],a:-a,h:h??1,lv:y>=UP-.1?'u':'g'};solids.push(s);}return o;};
 // living room: 1960s (a console set playing, a couch with a plastic cover, a starburst clock, a floor lamp)
 const tvScreen=new THREE.MeshStandardMaterial({color:0x111418,emissive:0x8a9aa8,emissiveIntensity:0,roughness:.2});tvScreen.name='c7-console-screen';
 // (laid out round the way through: the arch from the foyer, across the rug, out the door to the den; the set against the
 //  core wall, the couch along the side wall facing it, the armchair under the clock)
 put(FN.console({screen:tvScreen}),-1.55,-.9,{a:Math.PI/2,solid:[.66,.27],h:1.0});put(FN.couch({w:2.0,m:mat(0x6a7a5a,{},'textile')}),-4.5,-1.7,{a:-Math.PI/2,solid:[1.02,.46],h:.85});
 put(FN.lamp({lit:true}),-4.6,-.35,{solid:[.2,.2],h:1.6});put(FN.armchair(),-2.5,-4.0,{a:Math.PI,solid:[.42,.42],h:.9});put(FN.rug({w:2.4,d:1.8,c:0x7a4a32}),-3,-1.8);
 const clock=new THREE.Group();clock.name='starburst-clock';for(let k=0;k<12;k++){const r=K.slab(clock,0,0,0,.02,.36,.01,mat(0xb89a4a,{metalness:.6,roughness:.4}));r.rotation.z=k*Math.PI/6;}K.cyl(clock,0,0,0,.08,.03,mat(0xd8cfa8),{rx:Math.PI/2});put(clock,-2.2,-4.42,{y:F+1.9});
 // den: a desk, a closet (hide), shelves
 put(FN.desk({w:1.1}),-4.3,1.4,{a:-Math.PI/2,solid:[.56,.31],h:.78});put(FN.chair(),-3.7,1.4,{a:-Math.PI/2,solid:[.22,.22],h:.9});put(FN.shelf({w:.9,h:1.9}),-1.75,.3,{a:Math.PI,solid:[.45,.17],h:1.9});
 // kitchen: counters along the back and right, a stove, a fridge (tall), a table
 put(FN.counter({w:1.25}),2.95,4.15,{a:Math.PI,solid:[.63,.33],h:.92});put(FN.fridge({c:0xd8c88a}),4.6,1.0,{a:-Math.PI/2,solid:[.38,.36],h:1.7});put(FN.stove({c:0xd8c88a}),4.65,2.1,{a:-Math.PI/2,solid:[.38,.34],h:1.0});
 // (no table in here: the dining room is through the wide doorway)
 // dining room: the table toward the front window, its chairs, the hutch on the side wall (tall); the way round it to the kitchen
 put(FN.table({w:1.4,d:.85}),3.3,-2.9,{solid:[.72,.45],h:.76});for(const [x,z,a] of [[2.95,-3.55,0],[3.65,-3.55,0],[2.95,-2.25,Math.PI],[3.65,-2.25,Math.PI]])put(FN.chair({}),x,z,{a,solid:[.22,.22],h:.95});
 {const hutch=new THREE.Group();hutch.name='hutch';K.box(hutch,0,.45,0,1.4,.9,.48,mat(C7.walnut,{},'timber'));K.box(hutch,0,1.4,.1,1.4,1.0,.3,mat(C7.walnut,{},'timber'));for(let k=0;k<5;k++)K.cyl(hutch,-.5+k*.25,1.25,0,.09,.012,mat(0xe8e2d0),{rx:Math.PI/2-.2});put(hutch,4.72,-1.2,{a:-Math.PI/2,solid:[.72,.25],h:1.9});}
 put(FN.rug({w:1.2,d:2.2,c:0x5a3a2a}),0,-3.0);
 // ---- upstairs ----
 // the boy's room, August 1991: bed, desk under the side window, a calendar, a poster, a small TV and console, clothes
 put(FN.bed({cover:0x2a4a6a}),-3.95,3.1,{a:-Math.PI/2,solid:[.53,1.03],h:.75,y:UP});put(FN.desk({w:1.2}),-4.55,.95,{a:Math.PI/2,solid:[.62,.31],h:.78,y:UP});
 put(FN.chair(),-4.0,.95,{a:Math.PI/2,solid:[.22,.22],h:.9,y:UP});
 // (the dresser Jamie pushes against the door: its own group, never baked, its solid moved with it; the little set on top)
 const dresser=FN.dresser({w:1.0});dresser.name='boy-dresser';const crt=FN.crt({w:.36});crt.position.y=.83;dresser.add(crt);put(dresser,-ucx-.55,1.0,{a:Math.PI/2,solid:[.52,.26],h:.85,y:UP});const dresserSolid=solids[solids.length-1];put(FN.rug({w:1.6,d:1.2,c:0x2a3a5a}),-3,2.2,{y:UP});
 // parents' room (sixties): a bed, a vanity, a lamp; storeroom: boxes, a sewing table, the old bike's spot
 put(FN.bed({w:1.5,cover:0xb89a7a,rumpled:false}),3.5,-2.4,{a:Math.PI/2,solid:[.78,1.03],h:.8,y:UP});put(FN.dresser({w:1.3,m:mat(0xd8cfba)}),4.6,-.6,{a:-Math.PI/2,solid:[.66,.26],h:.85,y:UP});
 put(FN.lamp({h:.6,lit:false}),4.55,-4.1,{y:UP+.0});
 for(const [x,z,s] of [[-4.5,-4.1,.5],[-4.4,-3.4,.45],[-3.9,-4.15,.4],[-4.55,-1.0,.5]]){const b=new THREE.Group();K.box(b,0,s/2,0,s*1.1,s,s*.9,mat(0xb89a6a,{},'textile'));put(b,x,z,{y:UP,solid:[s*.55,s*.45],h:s});}
 put(FN.table({w:.9,d:.5}),-2.0,-4.0,{y:UP,solid:[.46,.26],h:.76});
 // ---- hiding places (where a hidden kid stands), the stair top, the window over the porch ----
 hides.pantry={x:4.3,z:3.9,door:'pantry',lv:'g',label:'Hide in the pantry'};hides.den={x:-4.4,z:3.95,door:'den',lv:'g',label:'Hide in the closet'};hides.stair={x:0,z:3.75,door:'closet',lv:'g',label:'Hide in the closet under the stairs',inner:{x:0,z:2.4}};
 spots.foyer={x:0,z:-3.6};spots.stairFoot={x:0,z:-2.2};spots.stairTop={x:0,z:3.1};spots.boyDoor={x:-ucx-.4,z:3.3};spots.boyIn={x:-3,z:2.4};spots.hallWindow={x:0,z:-4.1};spots.porchRoof={x:0,z:-5.6};
 spots.kitchen={x:2.6,z:3.0};spots.calendar={x:-5,y:UP+1.55,z:2.05};spots.desk={x:-4.6,y:UP+.8,z:.95};spots.sideWindow={x:-2.8,y:UP+1.5,z:hd};spots.bike={x:-3.6,z:-2.5};
 spots.dresserStart={x:-ucx-.55,z:1.0};spots.dresserBlock={x:-ucx-.4,z:3.3};spots.dresserAfter={x:-ucx-.55,z:1.25};// (dragged back off the door afterwards: near where it stood, clear of the bed's foot)
 // the creature's map of the ground floor: rooms and doorways (house frame), and the loop it walks
 const graph={nodes:[{id:'foyer',x:0,z:-3.2},{id:'stairFoot',x:0,z:-2.0},{id:'livingArch',x:-1.7,z:-2.6,pause:1.4},{id:'living',x:-3.2,z:-2.4},{id:'livingDoor',x:-3.3,z:-.35,pause:1.2},
  {id:'den',x:-2.7,z:1.9},{id:'denDoor',x:-1.7,z:3.7,pause:1.5},{id:'backHall',x:0,z:3.7},{id:'kitchenDoor',x:1.7,z:3.7,pause:1.2},{id:'kitchen',x:2.6,z:2.5},
  {id:'kitchenDining',x:3.4,z:-.3,pause:1.4},{id:'dining',x:2.0,z:-1.3},{id:'diningArch',x:1.7,z:-2.6,pause:1.3},{id:'pantryFront',x:3.2,z:2.5},{id:'denCloset',x:-4.4,z:2.8}],
  edges:[['foyer','stairFoot'],['foyer','livingArch'],['livingArch','living'],['living','livingDoor'],['livingDoor','den'],['den','denDoor'],['denDoor','backHall'],['backHall','kitchenDoor'],
   ['kitchenDoor','kitchen'],['kitchen','kitchenDining'],['kitchenDining','dining'],['dining','diningArch'],['diningArch','foyer'],['kitchen','pantryFront'],['den','denCloset']],
  loop:['foyer','livingArch','living','livingDoor','den','denDoor','backHall','kitchenDoor','kitchen','kitchenDining','dining','diningArch']};
 // practical lights' positions (the chapter's pool lights go here): the living room lamp, the kitchen, the upstairs hall
 const lamps={living:{x:-4.5,y:F+1.55,z:-.75},kitchen:{x:2.6,y:F+2.5,z:2.2},hall:{x:0,y:UP+2.3,z:-2.5},boy:{x:-3.2,y:UP+2.3,z:2.4}};
 // ---- nav --------------------------------------------------------------------------------------------------------------------
 const inStair=(x,z,r=0)=>x>STAIR.x0+r&&x<STAIR.x1-r&&z>STAIR.z0-.3&&z<STAIR.z1+.3;
 const stairY=z=>F+clamp((z-STAIR.z0)/(STAIR.z1-STAIR.z0),0,1)*(UP-F);
 const segHit=(w,x,z,r)=>{const dx=w.bx-w.ax,dz=w.bz-w.az,l=dx*dx+dz*dz||1,u=clamp(((x-w.ax)*dx+(z-w.az)*dz)/l,0,1),px=w.ax+dx*u,pz=w.az+dz*u;return Math.hypot(x-px,z-pz)<r+w.t/2;};
 const doorBlock=(lv,x,z,r)=>{for(const [k,d] of Object.entries(doors)){if((k==='boy'||k==='store'||k==='parents')!==(lv==='u'))continue;if(d.open>.6)continue;const p=d.pivot,a=p.rotation.y,w=d.leaf.scale.x||.86,c=Math.cos(a),s=Math.sin(a);
  // the leaf as a segment from the pivot along its own x
  if(segHit({ax:p.position.x,az:p.position.z,bx:p.position.x+c*.9,bz:p.position.z-s*.9,t:.06},x,z,r))return true;}return false;};
 function walkable(x,z,r=.28,lv='g'){if(Math.abs(x)>hw-t/2-r+.001||Math.abs(z)>hd-t/2-r+.001){// (outside the walls: only the front doorway, and the porch roof from the hall window)
   return false;}
  if(inStair(x,z,.1)){return true;}
  // the stairwell hole upstairs, and the stair's own side walls below
  if(lv==='u'&&x>-.55-r&&x<.55+r&&z>-1.0-r&&z<2.6)return false;
  if(lv==='g'&&x>-cx-r&&x<cx+r&&z>-1.0-r&&z<3.0+r&&!inStair(x,z,.1))return false;// (the core is solid but for the stair)
  for(const w of walls)if(w.lv===lv&&!w.win&&segHit(w,x,z,r))return false;
  for(const s of solids)if(s.lv===lv&&inBox(x,z,s,r))return false;
  if(doorBlock(lv,x,z,r))return false;return true;}
 function floorAt(x,z,lv='g'){if(inStair(x,z))return stairY(z);return lv==='u'?UP:F;}
 // which floor a point on the stair hands you to as you leave it
 function levelAfter(z,lv){if(z>=STAIR.z1-.05)return 'u';if(z<=STAIR.z0+.05)return 'g';return lv;}
 // sight: walls (and window walls below the sill/above the head), shut doors, furniture taller than the line
 function sight(x0,y0,z0,x1,y1,z1){
  // between floors only through the stairwell: where the line crosses the upstairs floor, it must be in the opening
  const crossesUp=(y0<UP-.05)!==(y1<UP-.05);if(crossesUp){const u=(UP-.05-y0)/(y1-y0),x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;if(!(x>-.55&&x<.55&&z>-1.0&&z<2.6))return false;}
  const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.15);for(let i=1;i<n;i++){const u=i/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u,y=y0+(y1-y0)*u;
   const lv=y>UP-.05?'u':'g',base=lv==='u'?UP:F;
   for(const w of walls)if(w.lv===lv&&segHit(w,x,z,.01)){if(!w.win)return false;const v=y-base;if(v<.9||v>2.15)return false;}
   if(doorBlock(lv,x,z,.01))return false;
   for(const s of solids)if(s.lv===lv&&inBox(x,z,s,.01)&&y-base<s.h)return false;
   if(lv==='g'&&x>-cx&&x<cx&&z>-1.0&&z<3.0&&!(x>-.5&&x<.5&&y>stairY(z)-.05))return false;}
  return true;}
 const keep=new Set([...Object.values(doors).flatMap(d=>[d.pivot]),clock,dresser]);bake(g,keep);
 const dresser0={x:dresser.position.x,z:dresser.position.z,a:dresser.rotation.y};
 function moveDresser(x,z,a){dresser.position.set(x,UP,z);dresser.rotation.y=a;dresserSolid.x=x;dresserSolid.z=z;dresserSolid.a=-a;}
 function reset(){for(const d of Object.values(doors))d.set(0);moveDresser(dresser0.x,dresser0.z,dresser0.a);tvScreen.emissiveIntensity=0;}
 return {g,doors,hides,spots,graph,lamps,walls,solids,walkable,floorAt,levelAfter,sight,inStair,stairY,tvScreen,dresser,moveDresser,reset,HH};
}

// ---- the dining house's dining room ----------------------------------------------------------------------------------------------
// The room is in the dining house's frame: the picture window in the front wall (z=-D/2) at x=PIC.x, the room behind it.
export const PIC={x:2.3,w:2.3,h:1.45,sill:.95};
export function createDiningRoom({D=8.6,F=.5,tvTex=null}={}){const g=new THREE.Group();g.name='c7-dining-room';const B=createBuild(g),{K}=B,{F:FN}=createFurniture();const hd=D/2;
 const paperM=mat(0xa8a078,{},'plaster'),boards=mat(0x6a4a30,{},'timber');
 const R={x0:PIC.x-2.4,x1:PIC.x+2.4,z0:-hd+.12,z1:-hd+4.4};
 // its own three walls and ceiling (the house's front wall, with the picture window, is the house's)
 B.wall([R.x0,R.z0],[R.x0,R.z1],{y0:F,y1:F+2.6,m:paperM});B.wall([R.x1,R.z0],[R.x1,R.z1],{y0:F,y1:F+2.6,m:paperM});B.wall([R.x0,R.z1],[R.x1,R.z1],{y0:F,y1:F+2.6,m:paperM,holes:[[3.1,4.0,0,2.05]]});
 B.floor(R.x0,R.z0,R.x1,R.z1,F,boards);B.ceiling(R.x0,R.z0,R.x1,R.z1,F+2.6,mat(0xd8d0bc));
 const table=FN.table({w:1.9,d:1.0});table.position.set(PIC.x,F,-hd+2.1);table.rotation.y=Math.PI/2;g.add(table);
 // the places: four plates, glasses, a dish in the middle
 for(const [dx,dz] of [[0,-.7],[0,.7],[-.32,0],[.32,0]]){K.cyl(g,PIC.x+dx,F+.76,-hd+2.1+dz,.12,.01,mat(0xf2eee2));}
 K.cyl(g,PIC.x,F+.79,-hd+2.1,.16,.06,mat(0xc8b890,{roughness:.4}));
 // the chairs where they sit: north head, south head, two along the far side (facing the window)
 const seats=[{id:'father',x:PIC.x,z:-hd+2.1+1.15,a:Math.PI},{id:'mother',x:PIC.x,z:-hd+2.1-1.15,a:0},{id:'girl',x:PIC.x-.55,z:-hd+2.1+.0,a:Math.PI/2},{id:'boy',x:PIC.x+.55,z:-hd+2.1,a:Math.PI/2}];
 // (the room's frame: the picture window faces -z; seats' a is the heading in this frame)
 seats[0]={id:'father',x:PIC.x+1.15,z:-hd+2.1,a:-Math.PI/2};seats[1]={id:'mother',x:PIC.x-1.15,z:-hd+2.1,a:Math.PI/2};seats[2]={id:'girl',x:PIC.x-.42,z:-hd+2.75,a:0};seats[3]={id:'boy',x:PIC.x+.42,z:-hd+2.75,a:0};
 for(const s of seats){const c=FN.chair({});c.position.set(s.x,F,s.z);c.rotation.y=-s.a;g.add(c);}
 const tvScreen=new THREE.MeshStandardMaterial({color:0x111418,emissive:0x9aaab8,emissiveIntensity:0,roughness:.2,map:tvTex||null});tvScreen.name='c7-dining-tv';
 const tv=FN.console({screen:tvScreen});tv.position.set(R.x0+.45,F,-hd+3.6);tv.rotation.y=Math.PI*.75;g.add(tv);
 const hutch=new THREE.Group();K.box(hutch,0,.95,0,1.5,1.9,.45,mat(0x5a3a26,{},'timber'));hutch.position.set(PIC.x+.6,F,R.z1-.3);hutch.rotation.y=Math.PI;g.add(hutch);
 const lamp=new THREE.Group();lamp.name='hanging-lamp';K.cyl(lamp,0,0,0,.004,.7,mat(0x2a2a2a));K.cyl(lamp,0,-.4,0,.28,.22,mat(0xe8d8b0,{emissive:0xffcf8a,emissiveIntensity:.9,side:THREE.DoubleSide}),{r2:.1});lamp.position.set(PIC.x,F+2.6,-hd+2.1);g.add(lamp);
 // the glass: real, see-through; the crack (hidden until it is struck), on the outside face
 const glass=K.plane(g,PIC.x,F+PIC.sill+PIC.h/2,-hd-.02,PIC.w,PIC.h,glassClear);glass.rotation.y=Math.PI;glass.name='picture-glass';
 const crackTex=paper(512,320,(c,w,h)=>{c.clearRect(0,0,w,h);const r=seeded(66);c.strokeStyle='rgba(235,240,245,.85)';c.lineCap='round';
  const cx=w*.48,cy=h*.42;for(let k=0;k<17;k++){let x=cx,y=cy,a=k/17*Math.PI*2+r()*.3;c.lineWidth=1.4+r()*1.4;c.beginPath();c.moveTo(x,y);for(let s=0;s<7;s++){const L=12+r()*34;x+=Math.cos(a)*L;y+=Math.sin(a)*L;a+=(r()-.5)*.6;c.lineTo(x,y);}c.stroke();}
  for(let ring=1;ring<4;ring++){c.lineWidth=1;c.beginPath();for(let k=0;k<=24;k++){const a=k/24*Math.PI*2,rr=ring*(22+r()*10);const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.85;k?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
  c.fillStyle='rgba(240,245,250,.5)';c.beginPath();c.arc(cx,cy,9,0,7);c.fill();});
 const crack=K.plane(g,PIC.x,F+PIC.sill+PIC.h/2,-hd-.035,PIC.w,PIC.h,new THREE.MeshBasicMaterial({map:crackTex,transparent:true,opacity:0,depthWrite:false,color:0xdde4ea}));crack.rotation.y=Math.PI;crack.name='picture-crack';crack.visible=!!crackTex;
 const frame=new THREE.Group();frame.name='picture-frame';g.add(frame);for(const [px,py,pw,ph] of [[-PIC.w/2,0,.1,PIC.h+.1],[PIC.w/2,0,.1,PIC.h+.1],[0,PIC.h/2,PIC.w+.1,.1],[0,-PIC.h/2,PIC.w+.1,.1],[-PIC.w/6,0,.05,PIC.h],[PIC.w/6,0,.05,PIC.h]])K.slab(frame,px,py,0,pw,ph,.08,mat(C7.trim));
 frame.position.set(PIC.x,F+PIC.sill+PIC.h/2,-hd-.03);
 const keep=new Set([table,tv,hutch,lamp,glass,crack,frame]);bake(g,keep);
 return {g,R,seats,glass,crack,frame,tvScreen,lamp,table,F,D};
}
