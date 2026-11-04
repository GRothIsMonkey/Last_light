// Chapter Seven: Sam's house, inside, the morning after (and that night). The low ranch on Oak Hollow with the blue garage
// trim: you come in at the front door into the living room; the kitchen behind it with the table where Reyes spreads
// his maps; the hall; Sam's room in the front corner by the garage, which nobody has touched since Thursday.
//
// Sam's room is the chapter's emotional centre and is built to be handled: the box fan by the bed (on: it is always on), the
// photograph of the four of them in its frame on the desk (the same object the chapter comes back to that night), his
// spiral notebook, a pack of gum on the nightstand, batteries and flashlights on the shelf (batteries for the batteries),
// his hoodie on the chair, his helmet on the doorknob, the pump, a stack of game cases, a fishing poster, a little wooden
// fish from Pine Ridge. The rest of the house is his parents': the TV on with the sound off, coffee nobody drinks, flyers.
//
// Built in the house's own frame (x across, +z toward the street, y over its ground) like Chapter Six's room, as one group
// added while the chapter is here; its walls, floors and furniture answer nav (setRoom) while you are inside.
import * as THREE from './three.module.js';
import {mat,C7,createBuild,createFurniture,glassLit,paper} from './chapter7-build.js';
import {bake,inBox,clamp} from './chapter6-kit.js';

export function createSamHouse({scene,world,shoot=null}){
 const P=world.homes.sam,W2=P.w/2,D2=P.depth/2,FL=P.floor,t=.15,H=2.42;
 const O=P.toWorld(0,0),A=P.worldRot,cs=Math.cos(A),sn=Math.sin(A);
 const toW=(x,z,y=0)=>({x:O.x+x*cs+z*sn,z:O.z-x*sn+z*cs,y:O.ground+y});
 const toL=(wx,wz)=>{const dx=wx-O.x,dz=wz-O.z;return {x:dx*cs-dz*sn,z:dx*sn+dz*cs};};
 const heading=a=>a-A;// a heading in the house frame to the world's
 const root=new THREE.Group();root.name='chapter7-sam-house';root.position.set(O.x,O.ground,O.z);root.rotation.y=A;
 const B=createBuild(root),{K}=B,{F:FN}=createFurniture();
 // ---- rooms (house frame) ----
 const R={living:{x0:-W2+t,x1:.6,z0:.8,z1:D2-t},hall:{x0:.6,x1:2.2,z0:-1.0,z1:D2-t},sam:{x0:2.2,x1:W2-t,z0:1.2,z1:D2-t},
  kitchen:{x0:-W2+t,x1:.6,z0:-D2+t,z1:.8},back:{x0:2.2,x1:W2-t,z0:-.4,z1:1.2}};
 const DOOR={front:{x:P.doorX,w:.94},sam:{z0:2.0,z1:2.9},arch:{x0:-3.7,x1:-1.0},kitchenHall:{z0:-.8,z1:.5},back:{z0:-.25,z1:1.05}};
 const plaster=mat(0xd6cfbd,{emissive:0x8a8474,emissiveIntensity:.1,roughness:.95},'plaster'),samWall=mat(0x9fb0b8,{emissive:0x56646a,emissiveIntensity:.1,roughness:.95},'plaster');
 const carpet=mat(0x7a7262,{emissive:0x302c26,emissiveIntensity:.08,roughness:1},'carpet'),samCarpet=mat(0x5a6470,{roughness:1},'carpet'),vinyl=mat(0xc8bfa4,{roughness:.6},'mineral'),ceil=mat(0xe0ddd3,{emissive:0x9aa0a4,emissiveIntensity:.42});
 const win=(u,w=1.2,sill=.85,h=1.25)=>[u-w/2,u+w/2,sill,sill+h];
 // outer walls (inside faces), with the front door, windows (each with a view pane)
 const panes=[];
 const pane=(x,z,ry,w=1.2,h=1.25,sill=.85,name='pane')=>{const m=new THREE.MeshStandardMaterial({color:0xdde6ee,emissive:0xb8c8d6,emissiveIntensity:.55,roughness:.4});const p=K.plane(root,x,FL+sill+h/2,z,w,h,m,{ry,name});panes.push({mesh:p,m,x,z,ry});return p;};
 B.wall([-W2+t,D2-t],[W2-t,D2-t],{y0:FL,y1:FL+H,m:plaster,holes:[[DOOR.front.x-.48+W2-t,DOOR.front.x+.48+W2-t,0,2.08],win(W2-t-4.0),win(W2-t+4.2,1.3)]});
 // (the panes stand a little in from the wall: the street house's own glass, the house these rooms are inside, is set into the
 // same wall a few centimetres in from its face, and in front of a pane at the wall it covered the view with its own)
 const PIN=.09;
 pane(-4.0,D2-t-PIN,Math.PI,1.2,1.25,.85,'living-window');const samWin=pane(4.2,D2-t-PIN,Math.PI,1.3,1.25,.85,'sam-window');
 B.wall([W2-t,D2-t],[W2-t,-D2+t],{y0:FL,y1:FL+H,m:plaster});B.wall([W2-t,-D2+t],[-W2+t,-D2+t],{y0:FL,y1:FL+H,m:plaster,holes:[win(W2-t+3.6,1.4,1.0,1.0),win(W2-t+1.2,.9)]});
 pane(-3.6,-D2+t+PIN,0,1.4,1.0,1.0,'kitchen-window');
 B.wall([-W2+t,-D2+t],[-W2+t,D2-t],{y0:FL,y1:FL+H,m:plaster,holes:[win(D2-t+2.6,1.2)]});pane(-W2+t+PIN,2.6,-Math.PI/2,1.2,1.25,.85,'side-window');
 // inside walls: living|kitchen (an arch), the hall's two sides, Sam's door, the back corridor, the closed doors
 B.wall([-W2+t,.8],[.6,.8],{y0:FL,y1:FL+H,m:plaster,holes:[[DOOR.arch.x0+W2-t,DOOR.arch.x1+W2-t,0,2.1]]});
 B.wall([.6,-1.0],[.6,D2-t],{y0:FL,y1:FL+H,m:plaster,holes:[[DOOR.kitchenHall.z0+1.0,DOOR.kitchenHall.z1+1.0,0,2.05],[3.95,5.6,0,2.1]]});// (the hall opens to the living room at its front end)
 B.wall([.6,-D2+t],[.6,-1.0],{y0:FL,y1:FL+H,m:plaster});
 B.wall([2.2,1.2],[2.2,D2-t],{y0:FL,y1:FL+H,m:samWall,holes:[[DOOR.sam.z0-1.2,DOOR.sam.z1-1.2,0,2.05]]});B.wall([2.2,1.2],[W2-t,1.2],{y0:FL,y1:FL+H,m:samWall});
 B.wall([2.2,-.4],[W2-t,-.4],{y0:FL,y1:FL+H,m:plaster});B.wall([2.2,-1.0],[2.2,1.2],{y0:FL,y1:FL+H,m:plaster,holes:[[.6,1.45,0,2.05]]});B.wall([.6,-1.0],[2.2,-1.0],{y0:FL,y1:FL+H,m:plaster});
 // floors and ceilings
 B.floor(R.living.x0,R.living.z0,R.hall.x1,R.living.z1,FL+.02,carpet);B.floor(R.hall.x0,R.hall.z0,R.hall.x1,R.living.z0,FL+.02,carpet);B.floor(R.kitchen.x0,R.kitchen.z0,R.kitchen.x1,R.kitchen.z1,FL+.02,vinyl);
 B.floor(R.sam.x0,R.sam.z0,R.sam.x1,R.sam.z1,FL+.02,samCarpet);B.floor(R.back.x0,R.back.z0,R.back.x1,R.back.z1,FL+.02,carpet);
 B.ceiling(-W2+t,-D2+t,W2-t,D2-t,FL+H-.18,ceil);// (a little under the street house's own ceiling, which would otherwise show through dark)
 // doors: Sam's (open a little), the parents' and the bathroom (shut), the closet; the front door's inside
 const doors={sam:B.door(2.21,DOOR.sam.z0,{w:.88,rot:-Math.PI/2,swing:1.3,y:FL,name:'sam-door'}),parents:B.door(3.0,-.39,{w:.86,rot:0,swing:0,y:FL,name:'parents-door'}),
  bath:B.door(1.0,-.99,{w:.82,rot:0,swing:0,y:FL,name:'bath-door'}),laundry:B.door(W2-t-.02,DOOR.back.z0,{w:.86,rot:-Math.PI/2,swing:0,y:FL,name:'laundry-door'})};
 doors.sam.set(.55);
 K.slab(root,DOOR.front.x,FL+1.04,D2-t-.03,.94,2.08,.05,mat(0x3a4a6a,{roughness:.6}),{name:'front-door-inside'});K.cyl(root,DOOR.front.x+.36,FL+1.0,D2-t-.07,.025,.04,mat(0xc9b27a,{metalness:.8,roughness:.3}),{rx:Math.PI/2});
 // ---- the living room: Dad's couch, the TV with the sound off, the coffee, the search map, family pictures ----
 const solids=[];const put=(o,x,z,{a=0,y=FL+.02,solid=null}={})=>{o.position.set(x,y,z);o.rotation.y=a;root.add(o);if(solid)solids.push({x,z,hw:solid[0],hd:solid[1],a:-a});return o;};
 const tvScreen=new THREE.MeshStandardMaterial({color:0x101418,emissive:0x8ab0d0,emissiveIntensity:.5,roughness:.2});tvScreen.name='c7-sam-tv';
 put(FN.couch({w:2.1,m:mat(0x5a5048,{},'textile')}),-3.2,1.75,{a:Math.PI,solid:[1.08,.48]});put(FN.coffee({w:1.1}),-3.2,3.0,{solid:[.58,.3]});
 {const st=new THREE.Group();K.box(st,0,.3,0,1.1,.6,.45,mat(C7.walnut,{},'timber'));const tv=FN.crt({w:.62,screen:tvScreen});tv.position.y=.6;st.add(tv);put(st,-3.2,4.35,{a:0,solid:[.58,.26]});}
 put(FN.armchair({m:mat(0x6a5a3a,{},'textile')}),-5.4,3.2,{a:-Math.PI/2,solid:[.45,.42]});put(FN.lamp({lit:false}),-5.6,1.4,{solid:[.2,.2]});put(FN.rug({w:2.6,d:1.8,c:0x6a4a3a}),-3.2,3.0);
 for(const [x,c] of [[-3.5,0xe8e4d8],[-3.0,0xd8d4c8]])K.cyl(root,x,FL+.47,3.0,.045,.1,mat(c));// two mugs, cold
 const searchMap=K.plane(root,-2.9,FL+.445,2.95,.55,.4,mat(0xe8e2cc),{rx:-Math.PI/2,ry:.2,name:'search-map'});void searchMap;
 const flyer=paper(256,330,(g,w,h)=>{g.fillStyle='#f4f1e8';g.fillRect(0,0,w,h);g.fillStyle='#b01e1e';g.font='bold 40px Arial';g.textAlign='center';g.fillText('MISSING',w/2,46);
  g.fillStyle='#3a3a3a';g.fillRect(58,62,140,160);g.fillStyle='#c4906a';g.beginPath();g.ellipse(128,128,38,46,0,0,7);g.fill();g.fillStyle='#2a1c14';g.beginPath();g.ellipse(128,100,44,30,0,Math.PI,0);g.fill();g.fillRect(84,96,88,16);
  g.fillStyle='#6d9a8a';g.fillRect(80,178,96,44);g.fillStyle='#1a1a1a';g.font='bold 30px Arial';g.fillText('SAM',w/2,256);g.font='15px Arial';g.fillText('Age 12 · Last seen Aug. 25',w/2,282);g.fillText('Mill Creek / Old Mill Rd.',w/2,302);g.fillText('Oak Hollow Police Dept.',w/2,322);});
 const flyerM=new THREE.MeshStandardMaterial({map:flyer,color:flyer?0xffffff:0xe8e4d8,roughness:.9});
 // ---- the kitchen: the table (the maps go here), counters, the coffee maker, a stack of flyers, the phone ----
 put(FN.table({w:1.5,d:1.0,m:mat(0xb08a5c,{},'timber')}),-3.0,-2.0,{solid:[.76,.52]});
 const CHAIRS=[[-3.0,-1.25,0],[-3.0,-2.75,Math.PI],[-4.05,-2.0,-Math.PI/2],[-1.95,-2.0,Math.PI/2]];for(const [x,z,a] of CHAIRS)put(FN.chair({m:mat(0xb08a5c,{},'timber')}),x,z,{a,solid:[.22,.22]});
 put(FN.counter({w:3.4}),-3.9,-4.35,{a:Math.PI,solid:[1.7,.33]});put(FN.sink({}),-3.6,-4.35,{a:Math.PI});put(FN.stove({}),-1.6,-4.35,{a:Math.PI,solid:[.38,.33]});put(FN.fridge({c:0xe6e2d8}),-.15,-4.15,{a:Math.PI,solid:[.38,.36]});
 put(FN.cabinet({w:3.0,y:1.75}),-3.9,-4.5,{a:Math.PI});
 for(let k=0;k<6;k++)K.plane(root,-2.2+(k%3)*.06,FL+.77+k*.004,-1.75-(k>2?.2:0),.2,.26,flyerM,{rx:-Math.PI/2,ry:.1*k});
 {const ph=new THREE.Group();K.box(ph,0,.03,0,.12,.05,.2,mat(0x2a2a2c));K.box(ph,0,.08,0,.05,.16,.04,mat(0x1a1a1c));put(ph,-1.2,-4.35,{y:FL+.92});}
 K.cyl(root,-2.4,FL+.95,-4.35,.08,.25,mat(0x1a1a1a,{roughness:.4}));// the coffee maker
 // the fridge door: a list in his mother's writing, magnets, a school calendar
 const list=paper(200,260,(g,w,h)=>{g.fillStyle='#fffdf2';g.fillRect(0,0,w,h);g.strokeStyle='#9ab8d8';for(let y=30;y<h;y+=18){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.fillStyle='#1a2a4a';g.font='italic 15px Georgia';
  ['Fri 8/26','- call Det. office 9:00','- flyers: library, Kroger,','  the pool, church','- Brandt / Public Works?','- call Grandma back','- feed the cat','- SAM'].forEach((s,i)=>g.fillText(s,10,26+i*18));});
 K.plane(root,-.15,FL+1.25,-3.795,.2,.26,new THREE.MeshStandardMaterial({map:list,color:list?0xffffff:0xfffdf2,roughness:.9}),{name:'fridge-list'});
 // ---- the hall: pictures; the closed doors ----
 for(const [z,c] of [[3.6,0x5a4a3a],[2.4,0x3a3a3a],[.4,0x5a4a3a]])put(FN.frame({w:.3,h:.24,c}),.66,z,{a:-Math.PI/2,y:FL+1.55});
 // ---- Sam's room ----
 const S=R.sam;
 const bed=put(FN.bed({w:1.0,l:2.0,cover:0x3a5a6a}),W2-t-.55,2.45,{a:Math.PI,solid:[.53,1.03]});void bed;
 const night=new THREE.Group();K.box(night,0,.27,0,.42,.54,.38,mat(C7.pine,{},'timber'));put(night,W2-t-.3,4.0,{solid:[.21,.19]});
 // (the fan on the floor at the foot of the bed, blowing across it)
 const fan=FN.boxFan();put(fan,W2-t-1.35,1.6,{a:-2.06,solid:[.27,.1]});const blades=fan.userData.blades;
 const desk=put(FN.desk({w:1.2,m:mat(C7.pine,{},'timber')}),3.55,D2-t-.33,{a:0,solid:[.62,.31]});void desk;
 put(FN.chair({m:mat(C7.pine,{},'timber')}),3.55,D2-t-.95,{a:Math.PI,solid:[.22,.22]});
 const shelf=put(FN.shelf({w:.9,h:1.6,n:4,m:mat(C7.pine,{},'timber')}),2.38,3.8,{a:-Math.PI/2,solid:[.46,.16]});void shelf;
 put(FN.dresser({w:.95,m:mat(C7.pine,{},'timber')}),3.3,1.48,{a:Math.PI,solid:[.48,.25]});
 // the things on them
 const items={};
 // the photograph (in a wooden frame, on the desk: the four of them at the oak, last July)
 const photoMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});photoMat.name='c7-group-photo';
 {const g=new THREE.Group();g.name='group-photo';K.slab(g,0,0,0,.26,.2,.02,mat(0x5a3e28,{},'timber'));const p=K.plane(g,0,0,.012,.22,.165,photoMat,{name:'photo'});void p;K.slab(g,0,-.04,-.08,.02,.14,.1,mat(0x5a3e28,{},'timber')).rotation.x=.4;// (the stand, tilted, wholly behind the frame: further forward its top corner came through the picture)
  g.position.set(3.95,FL+.86,D2-t-.25);g.rotation.set(-.12,Math.PI,0);root.add(g);items.photo=g;}
 // his notebook (spiral, green), open a little; a pencil
 {const g=new THREE.Group();g.name='sam-notebook';K.box(g,0,.006,0,.17,.012,.23,mat(0x3a6a4a,{roughness:.7}));for(let k=0;k<12;k++)K.cyl(g,-.085,.012,-.1+k*.018,.006,.02,mat(0x9a9a9a,{metalness:.6}),{rz:Math.PI/2});
  K.box(g,.12,.006,.02,.008,.008,.17,mat(0xd8b040));g.position.set(3.4,FL+.765,D2-t-.32);g.rotation.y=.25;root.add(g);items.notebook=g;}
 // the gum: a green pack of spearmint (the same pack Jamie takes, and drops)
 {const g=new THREE.Group();g.name='gum';const gumTex=paper(64,32,(c,w,h)=>{c.fillStyle='#2e8a4a';c.fillRect(0,0,w,h);c.fillStyle='#f2f0e8';c.fillRect(0,11,w,10);c.fillStyle='#1d5a30';c.font='bold 9px Arial';c.fillText('SPEARMINT',6,19);});
  K.box(g,0,.01,0,.076,.02,.033,new THREE.MeshStandardMaterial({map:gumTex,color:gumTex?0xffffff:0x2e8a4a,roughness:.5}));g.position.set(W2-t-.3,FL+.565,4.02);g.rotation.y=.4;root.add(g);items.gum=g;}
 // batteries and flashlights on the shelf
 for(let k=0;k<3;k++)K.cyl(root,2.4,FL+1.1,3.55+k*.13,.022,.15,mat([0x2a2a2a,0xb03020,0x2a3a6a][k],{roughness:.4}),{rx:Math.PI/2});
 for(let k=0;k<8;k++)K.cyl(root,2.42,FL+.65,3.55+k*.05,.008,.05,mat(k%2?0xc8a838:0x1a1a1a,{metalness:.5}));items.batteries={x:2.4,y:FL+1.0,z:3.75};
 // game cases, a little stack on the dresser; the helmet on the doorknob; the hoodie over the chair
 for(let k=0;k<5;k++)K.box(root,3.0,FL+.84+k*.016,1.5,.14,.015,.19,mat([0x2a5aa8,0x1a1a1a,0xb02a20,0x2a8a3a,0xe8e2d0][k]));items.games={x:3.0,y:FL+.9,z:1.5};
 {const h=new THREE.Mesh(new THREE.SphereGeometry(.14,14,10,0,Math.PI*2,0,Math.PI*.55),mat(0x1a5a9a,{roughness:.4}));h.position.set(2.18,FL+.92,DOOR.sam.z1-.02);h.rotation.x=-.4;root.add(h);items.helmet={x:2.1,y:FL+.95,z:DOOR.sam.z1};}
 {const hd=K.box(root,3.55,FL+.75,D2-t-1.08,.42,.1,.3,mat(0x4a5a6a,{},'textile'));hd.rotation.x=.2;K.box(root,3.55,FL+.62,D2-t-1.22,.4,.3,.06,mat(0x4a5a6a,{},'textile'));items.hoodie={x:3.55,y:FL+.7,z:D2-t-1.1};}
 // the pump by the closet, a poster (a bass, jumping), the wooden fish on the nightstand
 K.cyl(root,W2-t-.15,FL+.35,1.35,.02,.62,mat(0x2a2a2a));
 const poster=paper(240,320,(g,w,h)=>{g.fillStyle='#1d3a52';g.fillRect(0,0,w,h);g.fillStyle='#3a6a5a';g.beginPath();g.ellipse(120,180,90,40,-.3,0,7);g.fill();g.fillStyle='#d8d0b0';g.font='bold 24px Arial';g.textAlign='center';g.fillText('BIG BASS',120,48);g.font='14px Arial';g.fillText('PINE RIDGE · 2009',120,300);});
 {const p=FN.poster({w:.5,h:.66,tex:poster});put(p,W2-t-.015,2.9,{a:-Math.PI/2,y:FL+1.55});}
 {const f=new THREE.Group();f.name='wooden-fish';K.box(f,0,.025,0,.1,.03,.025,mat(0x9a6a3a,{},'timber'));const tl=K.box(f,.06,.025,0,.03,.04,.02,mat(0x9a6a3a,{},'timber'));tl.rotation.z=.6;put(f,W2-t-.38,4.0,{y:FL+.55});items.fish={x:W2-t-.38,y:FL+.58,z:4.0};}
 // ---- spots (house frame, then world) ----
 const L=(x,z,y=0)=>toW(x,z,FL+y);
 const SPOTS={
  front:L(DOOR.front.x,D2-t-.5),door:L(DOOR.front.x,D2-t-.04,1.1),stoop:toW(DOOR.front.x,P.stepFront+.55,0),enter:L(DOOR.front.x,D2-t-.75),
  couch:L(-3.2,1.75),tv:L(-3.2,4.3,1),kitchenTable:L(-3.0,-2.0,.78),chairs:CHAIRS.map(([x,z,a])=>({...L(x,z),a:heading(-a)})),
  samDoor:L(1.5,2.45),samIn:L(3.2,2.6),fan:L(W2-t-1.35,1.6,.3),photo:L(3.95,D2-t-.25,.86),notebook:L(3.4,D2-t-.32,.77),gum:L(W2-t-.3,4.02,.57),
  shelf:L(2.4,3.75,1.05),games:L(3.0,1.5,.9),helmet:L(2.1,DOOR.sam.z1,.95),hoodie:L(3.55,D2-t-1.1,.7),fish:L(W2-t-.38,4.0,.58),window:L(4.2,D2-t-.05,1.45),bed:L(W2-t-.55,2.45,.5),
  bedEdge:L(W2-t-1.1,2.6),desk:L(3.55,D2-t-.95),hall:L(1.4,1.2),kitchen:L(-2.0,-.6),fridge:L(-.15,-3.7,1.25),dadStand:L(1.6,2.55),momStand:L(-1.4,-2.6),
 };
 // ---- the window views (rendered from just outside the glass, the street as it is: once by day, once at night) ----
 const viewRT={};
 // (from: a world point to look from; look: a world point to look at. By default from just outside the glass toward the
 //  street; the last look of the chapter passes its own, past the garage's corner, at the streetlight across the street)
 function renderView(which='day',{staged=null,from=null,look=null,bright=null}={}){if(!shoot||typeof THREE.WebGLRenderTarget!=='function')return false;try{
   const rt=viewRT[which]||(viewRT[which]=new THREE.WebGLRenderTarget(768,576,{colorSpace:THREE.SRGBColorSpace}));
   const c=new THREE.PerspectiveCamera(50,768/576,.1,300),e=from||toW(4.2,D2+.8,FL+1.45),f=look||toW(4.2-2.2,D2+18,FL+.8);c.position.set(e.x,e.y,e.z);c.lookAt(f.x,f.y,f.z);c.updateMatrixWorld();
   const was=root.visible;root.visible=false;staged?.(true);const ok=shoot({cam:c,target:rt});staged?.(false);root.visible=was;
   // (the view shows as itself, by its own light: lit by the room's daylight as well, the morning street burned out to white)
   if(ok){const m=panes.find(p=>p.mesh===samWin).m;m.userData.view=which;m.map=rt.texture;m.color.setHex(0x0b0b0b);m.emissiveIntensity=bright??(which==='night'?.45:.92);m.emissive.setHex(0xffffff);m.emissiveMap=rt.texture;m.needsUpdate=true;}return ok;}catch{root.visible=true;return false;}}
 // (at night the morning's view comes off his window: the plain dark glass, until the last look out of it renders the night)
 function lightsOut(night){for(const p of panes){if(night&&p.m.userData.view==='day'){p.m.map=null;p.m.emissiveMap=null;p.m.emissive.setHex(0xb8c8d6);p.m.userData.view=null;p.m.needsUpdate=true;}if(p.m.map)continue;p.m.emissiveIntensity=night?.03:.55;p.m.color.setHex(night?0x10141c:0xdde6ee);}tvScreen.emissiveIntensity=night?.2:.5;}
 // ---- nav ----
 const inR=(q,b,r=0)=>q.x>b.x0+r&&q.x<b.x1-r&&q.z>b.z0+r&&q.z<b.z1-r;
 const gaps=[// doorways between rooms (x0,x1,z0,z1 in the house frame)
  {x0:DOOR.arch.x0+.1,x1:DOOR.arch.x1-.1,z0:.4,z1:1.2},{x0:.3,x1:.9,z0:DOOR.kitchenHall.z0+.1,z1:DOOR.kitchenHall.z1-.1},{x0:.3,x1:.9,z0:2.95,z1:D2-t-.1},{x0:1.9,x1:2.5,z0:DOOR.sam.z0+.1,z1:DOOR.sam.z1-.1},{x0:1.9,x1:2.5,z0:-.3,z1:.4}];
 const inside=(x,z)=>{const q=toL(x,z);return q.x>-W2-.25&&q.x<W2+.1&&q.z>-D2-.25&&q.z<D2+.25;};
 const nav={inside,
  walkable:(x,z,r=.28)=>{const q=toL(x,z);const room=[R.living,R.hall,R.sam,R.kitchen,R.back].some(b=>inR(q,b,r))||gaps.some(g=>q.x>g.x0&&q.x<g.x1&&q.z>g.z0&&q.z<g.z1);if(!room)return false;return !solids.some(b=>inBox(q.x,q.z,b,r));},
  floorAt:()=>O.ground+FL+.02,heading:A,surface:()=>'floor'};
 // ---- moving parts, every frame ----
 const ST={fan:true,spin:0,t:0};
 function update(dt){ST.t+=dt;ST.spin=clamp(ST.spin+(ST.fan?1:-1)*dt*1.4,0,1);blades.rotation.z-=dt*ST.spin*22;}
 // The street's own stand-in room behind Sam's side window (houses.js buildRoom: a lit box with a bed, a lamp and a poster, so
 // the window shows something from the road) stands where this kitchen is. While these rooms are shown its triangles are
 // folded to nothing (every triangle wholly inside its box, in the merged street meshes), and given back after.
 const fake=world.interiors?.[P.key+'-room']||world.interiors?.['sam-room'];let fold=null;
 function foldFake(on){if(!fake)return;
  if(!fold){fold=[];const s=Math.sign(fake.x0)||1,xa=Math.min(fake.x0,fake.x0-s*fake.depth)-.03,xb=Math.max(fake.x0,fake.x0-s*fake.depth)+.03,za=fake.zc-fake.width/2-.03,zb=fake.zc+fake.width/2+.03;
   const inBoxW=(wx,wy,wz)=>{const q=toL(wx,wz),y=wy-O.ground;return q.x>=xa&&q.x<=xb&&q.z>=za&&q.z<=zb&&y>=P.floor-.05&&y<=P.floor+2.6;};
   const v=new THREE.Vector3(),c=new THREE.Vector3();
   scene.traverse(o=>{if(!o.isMesh||!o.geometry?.attributes?.position)return;for(let q=o;q;q=q.parent)if(q===root)return;
    o.updateMatrixWorld();const g=o.geometry;g.boundingBox||g.computeBoundingBox();if(!g.boundingBox)return;c.copy(g.boundingBox.min).add(g.boundingBox.max).multiplyScalar(.5).applyMatrix4(o.matrixWorld);
    const half=g.boundingBox.max.clone().sub(g.boundingBox.min).length()/2;if(Math.hypot(c.x-O.x,c.z-O.z)>half+P.w+P.depth)return;
    const pos=g.attributes.position,idx=g.index,n=idx?idx.count:pos.count,inside=i=>{v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);return inBoxW(v.x,v.y,v.z);};const tris=[];
    for(let t=0;t<n;t+=3){const a=idx?idx.getX(t):t,b=idx?idx.getX(t+1):t+1,d=idx?idx.getX(t+2):t+2;if(inside(a)&&inside(b)&&inside(d))tris.push(t);}
    if(tris.length)fold.push({g,tris,saved:tris.map(t=>idx?[idx.getX(t),idx.getX(t+1),idx.getX(t+2)]:[0,1,2].map(k=>[pos.getX(t+k),pos.getY(t+k),pos.getZ(t+k)]))});});}
  for(const F of fold){const g=F.g,idx=g.index,pos=g.attributes.position;
   F.tris.forEach((t,i)=>{const sv=F.saved[i];if(idx){if(on){idx.setX(t+1,sv[0]);idx.setX(t+2,sv[0]);}else{idx.setX(t+1,sv[1]);idx.setX(t+2,sv[2]);}}
    else{for(let k=1;k<3;k++){const src=on?sv[0]:sv[k];pos.setXYZ(t+k,src[0],src[1],src[2]);}}});
   if(idx)idx.needsUpdate=true;else pos.needsUpdate=true;}}
 function show(on){if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();foldFake(on);}
 const keep=new Set([...Object.values(doors).map(d=>d.pivot),fan,items.photo,items.notebook,items.gum]);bake(root,keep);
 function reset(){ST.fan=true;ST.spin=1;doors.sam.set(.55);items.gum.visible=true;items.notebook.visible=true;items.photo.visible=true;lightsOut(false);show(false);}
 const home=(x,z)=>{const q=toL(x,z);return inR(q,R.sam,-.05)?'sam':inR(q,R.kitchen,-.05)?'kitchen':inR(q,R.living,-.05)?'living':inR(q,R.hall,-.05)?'hall':null;};
 return {P,root,toW,toL,heading,R,SPOTS,nav,doors,items,photoMat,fan,ST,update,show,reset,renderView,lightsOut,room:home,tvScreen,FL,solids,
  inHouse:(x,z)=>{const q=toL(x,z);return q.x>-W2&&q.x<W2&&q.z>-D2&&q.z<D2;}};
}
