// Chapter Six: the Mill Creek isolation works (Oak Hollow Township, Gate Structure No. 2, 1958). Where the creek that
// comes out of the storm drain in the woods (Chapter Three's outfall) runs north, gathers the rain off the ridge and the
// fields, and meets the old brick sewer from Mill Street (Line Two) before it goes under Old Mill Road to Mill Creek.
// Built so the river can be shut out of town: when Mill Creek floods, the gates go down.
//
//  The yard:      gravel inside a chain-link fence, the vehicle gate off the access track, a light pole, a generator
//                 cabinet, the warning signs, the open channel along its west side with a railing.
//  The gatehouse: block and brick, 1958. The control room (the switchgear, the gate dials, the chart recorder, the desk
//                 and the log), and a stair down through the west wall.
//  The gallery:   a concrete corridor under the deck, three metres down, along the gate chamber: a railing over the
//                 two bays and their sluice gates, the operating bridge across them, the staff gauge, the old intercom at
//                 its dead north end. A second stair at its south end.
//  Below:         the landing (L) at the bottom of that stair; in its south wall gate 2B, the isolation gate (a steel leaf
//                 in guides, held up by a brake; it drops by its own weight when the power goes, so the river cannot come
//                 back up Line Two); beyond it the junction chamber (J): the overflow ports in its west wall from the
//                 channel, a ladder well up to a manhole on the bank, and at its far end the Line Two grille (locked) and the
//                 brick conduit going away under town.
//
// The gate (2B) is the mechanism the chapter's emergency turns on. The leaf rides a rack; a pawl on the rack is the
//  brake. Power holds the pawl in. Power off: the pawl lifts and the leaf comes down, slowly at first (the governor)
//  then, once the dashpot has run out, all the way. The hand brake (the red lever in J, on the leaf's upstream side)
//  pushes the pawl back into the rack by a rod: hold it and the leaf stops where it is; let go and it drops. Its return
//  spring is long gone (the fault Brandt has been asking money for): nothing holds the lever but a hand. The locking pin
//  (on the landing side) goes through the guide into the leaf's frame and holds the leaf by itself, when the holes line
//  up; they line up only with the leaf all the way up.
//
// Walking: every place has one floor (the levels are laid out so none is over another): nav.setRoom(works.nav).
// Local metres: x east, z south (downstream), y up from the yard. The world: x + W0.x, z + W0.z.
import * as THREE from './three.module.js';
import {paper,bake,makeShapes,clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {artSurface} from './art-surfaces.js';
import {pineMaterial} from './pine-materials.js';
import {createPineForest} from './pine-forest.js';
import {seeded} from './kit.js';

export const W0={x:760,z:-930};
// ---- the plan ------------------------------------------------------------------------------------------------------------
export const FLOOR={yard:0,house:.25,gallery:-3,low:-5.8,bed:-5.5,pad:.6};
const R=(x0,x1,z0,z1)=>({x0,x1,z0,z1});
export const ZONES={
 yardA:R(7.3,35.6,-25.6,-14.2),yardB:R(14.25,35.6,-15,21.6),
 house:R(14.3,21.7,-7.7,1.7),
 stair1:R(9.0,14.6,-7.55,-6.25),
 gallery:R(6.45,9.45,-13.75,11.95),bridge:R(-5.75,7.2,-.6,.6),
 stair2:R(7.05,8.95,11.5,16.6),
 L:R(6.45,11.75,16.0,22.8),J:R(6.45,11.75,23.2,35.8),
 gate:R(7.65,10.35,22.3,23.7),
 path:R(14.4,17.6,22.25,31),pad:R(12.4,16.6,30,35.8),
};
export const HOUSE={x0:14,x1:22,z0:-8,z1:2,h:3.4,door:{z0:-4.5,z1:-3.4},stairDoor:{z0:-7.55,z1:-6.25}};
export const GATE={x0:7.6,x1:10.4,z:23,open:2.4,leafH:2.65,lever:{x:10.15,z:23.85},sam:{x:10.55,z:24.45},pin:{x:10.62,z:22.72,y:1.15},stow:{x:11.3,z:22.62,y:1.25},crank:{x:11.25,z:21.4},port:{x:9,y:1.55}};
export const GRILLE={x0:8,x1:10,z:35.95,h:1.9};
export const PORTS=[{z0:25.4,z1:27,y0:-4.3,y1:-3.5},{z0:29.8,z1:31.4,y0:-4.3,y1:-3.5}];
export const MANHOLE={x:12.85,z:33.2};
// where people are put (local x, z)
export const SPOT={
 arrive:[30.5,4.5],cruiser:[26,10.5],truck:[29.5,-6],houseDoor:[22.6,-3.95],houseIn:[20.6,-3.95],helmet:[17.2,1.2],log:[18.6,1.25],panel:[17.2,-7.3],
 stairTop:[15,-6.9],gallerySouth:[8,10.6],galleryMid:[7.8,0],galleryNorth:[8,-12.9],intercom:[8,-13.75],bridgeMid:[2.5,0],gauge:[6.6,-2.5],
 L:[9,19.5],Lgate:[9,22.1],J:[9,27],Jgrille:[9,34.6],Jlamp:[9,34.9],
 yardSouth:[16.5,21],padStand:[14.4,33.6],channel:[8,-20],sign:[34.8,-1.5],
};
export const local=(x,z,y=0)=>({x:W0.x+x,z:W0.z+z,y});
export const toLocal=(wx,wz)=>({x:wx-W0.x,z:wz-W0.z});
const inR=(r,x,z,m=0)=>x>r.x0+m&&x<r.x1-m&&z>r.z0+m&&z<r.z1-m;

// The valley: the yard flat, the channel cut down through it, the banks going up east and west, the road embankment
// across the north end of the culverts, the land beyond rolling a little. (y at local x, z; under the structure: the deck)
export function groundAt(x,z){
 const east=smooth((x-38)/26)*7+smooth((x-70)/60)*9,west=smooth((-x-9)/14)*6+smooth((-x-30)/60)*8;
 const road=smooth(1-Math.abs(z-49)/7)*2.6*smooth((x+30)/8)*smooth((60-x)/8),north=Math.sin(z*.04+x*.02)*.6*smooth((-z-40)/30);
 let y=east+west+road+north+Math.sin(x*.11)*Math.cos(z*.09)*.25*smooth((Math.abs(x-15)-24)/10);
 if(x>-6.3&&x<6.3&&z<46)y=Math.min(y,FLOOR.bed);// the channel's bed
 return y;}

export function createWorks({scene,camera,sfx=()=>{}}){
 const root=new THREE.Group();root.name='chapter6-works';root.position.set(W0.x,0,W0.z);
 const S=makeShapes(),keep=new Set();
 // ---- materials (one of each, shared; metre-scaled patterns from the Chapter Three and Five libraries) -----------------
 const conc=new THREE.MeshStandardMaterial({color:0x8d8a80,roughness:.95});artSurface(conc,'culvert');conc.name='concrete';
 const oldConc=new THREE.MeshStandardMaterial({color:0x6e6a60,roughness:1});artSurface(oldConc,'culvert');oldConc.name='old-concrete';
 const wetConc=new THREE.MeshStandardMaterial({color:0x56544c,roughness:.6});artSurface(wetConc,'culvert');wetConc.name='wet-concrete';
 const brick=pineMaterial(0x7a4334,'stone');brick.name='brick';const block=pineMaterial(0x9aa392,'paint');block.name='painted-block';
 const gravel=pineMaterial(0x7c7568,'gravel',{roughness:.92});gravel.name='gravel';const asphalt=pineMaterial(0x45464a,'asphalt');asphalt.name='asphalt';
 const steel=pineMaterial(0x5d6566,'metal');steel.name='steel';const galv=pineMaterial(0x9ca2a0,'metal',{roughness:.5});galv.name='galvanized';
 const green=pineMaterial(0x3f5a48,'metal',{roughness:.7});green.name='gate-green';const yellow=pineMaterial(0xc9a227,'metal',{roughness:.6});yellow.name='safety-yellow';
 const red=pineMaterial(0xa3271e,'metal',{roughness:.55});red.name='hold-red';const rust=new THREE.MeshStandardMaterial({color:0x6a4a34,roughness:.9,metalness:.3});artSurface(rust,'oxidized');rust.name='rust';
 const wood=pineMaterial(0x6a5a44,'wood');wood.name='wood';const dark=new THREE.MeshStandardMaterial({color:0x1b1c1e,roughness:.7});dark.name='dark';
 const grass=new THREE.MeshStandardMaterial({color:0x56663e,roughness:1});artSurface(grass,'lawn');grass.name='grass';
 const mud=new THREE.MeshStandardMaterial({color:0x4e4536,roughness:.95});artSurface(mud,'litter');mud.name='mud';
 const lampGlass=new THREE.MeshStandardMaterial({color:0xfff2d0,emissive:0xffd890,emissiveIntensity:0,roughness:.3});lampGlass.name='lamp-glass';
 const redLamp=new THREE.MeshStandardMaterial({color:0x7a1010,emissive:0xff2a18,emissiveIntensity:0,roughness:.4});redLamp.name='emergency-lamp';
 // ---- the valley ground -----------------------------------------------------------------------------------------------
 {const N=112,size=280,g=new THREE.PlaneGeometry(size,size,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i)+15,z=p.getZ(i);p.setX(i,x);p.setZ(i,z);let y=groundAt(x,z);
   // (the yard's own gravel and the structure sit on top; under them the ground is just below)
   if(inR({x0:6.5,x1:36.5,z0:-26.5,z1:22.5},x,z))y=Math.min(y,-.04);if(x>-6.5&&x<6.5&&z<46)y=FLOOR.bed-.05;p.setY(i,y);}
  g.computeVertexNormals();const m=new THREE.Mesh(g,grass);m.receiveShadow=true;m.name='works-ground';root.add(m);}
 // the yard: gravel, a worn track to the gatehouse door, puddles
 const slab=(r,y,m,th=.1)=>S.slab(root,(r.x0+r.x1)/2,y-th/2,(r.z0+r.z1)/2,r.x1-r.x0,th,r.z1-r.z0,m);
 slab(R(7,36,-26,-14.5),FLOOR.yard,gravel);slab(R(14,36,-14.5,22),FLOOR.yard,gravel);
 slab(R(22,36,-1,6),FLOOR.yard+.004,asphalt,.02);// the patched apron from the gate
 const puddleM=new THREE.MeshStandardMaterial({color:0x2a2e32,roughness:.08,metalness:.4,transparent:true,opacity:.75,polygonOffset:true,polygonOffsetFactor:-3});puddleM.name='puddles';
 for(const [x,z,w,d] of [[27,2,2.6,1.4],[24.5,-6,1.6,1.1],[31,12,2.2,1.2],[18,6,1.4,.9],[20,15,2.4,1.5],[11,-20,1.8,1]]){const q=S.plane(root,x,FLOOR.yard+.012,z,w,d,puddleM,{rx:-Math.PI/2});q.scale.set(1,1,1);}
 // ---- the channel: concrete walls, the upstream reach, the gate chamber, the downstream reach to the culverts ----------
 const cw=(x,z0,z1,y0,y1,m=conc,t=.4)=>S.slab(root,x,(y0+y1)/2,(z0+z1)/2,t,y1-y0,z1-z0,m);
 cw(-6.2,-70,46,FLOOR.bed-.4,.4);cw(6.2,-70,-14.5,FLOOR.bed-.4,.4);cw(6.2,12,46,FLOOR.bed-.4,FLOOR.gallery+.2);
 S.slab(root,0,FLOOR.bed-.25,-12,12.8,.5,116,oldConc);// the bed
 for(let z=-66;z<44;z+=6)S.slab(root,0,FLOOR.bed+.004,z,12,.02,.08,dark);// joints
 // the coping and railings along the open reaches (the yard side, and the far side)
 const rail=(a,b,{h=1.07,post=1.8,m=galv}={})=>{const L=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.round(L/post));for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;S.pipe(root,[x,y,z],[x,y+h,z],.025,m,6);}
  S.pipe(root,[a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.025,m,6);S.pipe(root,[a[0],a[1]+h*.5,a[2]],[b[0],b[1]+h*.5,b[2]],.02,m,6);};
 rail([6.4,.4,-70],[6.4,.4,-14.6]);rail([-6.4,.4,-70],[-6.4,.4,46]);rail([6.4,.4,12.3],[6.4,.4,46]);
 // the trash rack across the inlet: inclined bars, a walkway over it
 for(let x=-5.8;x<=5.8;x+=.16)S.pipe(root,[x,FLOOR.bed,-9.6],[x,0,-11.6],.018,rust,5);
 for(const y of [-4.5,-3,-1.5])S.pipe(root,[-5.9,y,-9.6-(y-FLOOR.bed)/5.5*2],[5.9,y,-9.6-(y-FLOOR.bed)/5.5*2],.03,rust,6);
 // the gate chamber: under the deck from the rack to the outlet; the pier between the two bays; the two sluice gates
 S.slab(root,4,-.2,4.25,20.8,.4,37.5,conc);// the deck over the chamber, the gallery and the landing (z -14.5..23)
 S.slab(root,0,(FLOOR.bed-.2+0)/2-.2,0,.8,5.3,12,conc);// the pier
 const mainGates=[];
 for(const s of [-1,1]){const leaf=new THREE.Group();leaf.position.set(s*3.2,0,0);root.add(leaf);keep.add(leaf);
  S.slab(leaf,0,0,0,5.5,3.1,.18,green);for(const y of [-1.2,-.4,.4,1.2])S.slab(leaf,0,y,.14,5.5,.12,.12,green);for(const x of [-2.2,-1.1,0,1.1,2.2])S.slab(leaf,x,0,.16,.1,3.1,.1,green);
  for(const e of [-1,1])S.slab(root,s*3.2+e*2.85,FLOOR.bed+2.6,0,.18,5.4,.5,steel);// the guides in the walls and the pier
  const stem=S.cyl(root,s*3.2,FLOOR.gallery+2.1,0,.05,4.2,steel);void stem;mainGates.push({leaf,s,y:FLOOR.bed+1.95});}
 // the operating bridge across the bays (grating on steel), its railings, the two headstocks with their handwheels
 S.slab(root,.35,FLOOR.gallery-.06,0,12.2,.12,1.2,galv);for(let x=-5.7;x<6.4;x+=.5)S.slab(root,x,FLOOR.gallery+.005,0,.03,.01,1.18,dark);
 for(const z of [-.62,.62])rail([-5.8,FLOOR.gallery,z],[6.3,FLOOR.gallery,z]);
 const wheels=[];for(const s of [-1,1]){const x=s*3.2;S.cyl(root,x,FLOOR.gallery+.45,0,.22,.9,green);S.slab(root,x,FLOOR.gallery+.95,0,.5,.2,.5,green);
  const w=new THREE.Group();w.position.set(x,FLOOR.gallery+1.15,.3);w.rotation.x=Math.PI/2;root.add(w);keep.add(w);const torus=new THREE.Mesh(new THREE.TorusGeometry(.42,.03,8,28),yellow);w.add(torus);for(let k=0;k<5;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.84,.03,.03),yellow);sp.rotation.z=k*Math.PI/5;w.add(sp);}wheels.push(w);}
 // the staff gauge on the pier face: feet, black on white, the numbers reading up from the bed
 const gaugeTex=paper(64,512,(g,w,h)=>{g.fillStyle='#f2efe4';g.fillRect(0,0,w,h);g.fillStyle='#111';for(let i=0;i<=40;i++){const y=h-i*(h/40);g.fillRect(0,y-2,i%5===0?w*.7:w*.35,3);if(i%5===0){g.font='bold 22px Arial';g.fillText(String(i/5),w*.72,y+8);}}
  g.fillStyle='#b02020';g.fillRect(0,h*.2,w,5);g.font='bold 13px Arial';g.fillText('FLOOD',2,h*.2-6);});
 const gauge=S.plane(root,.42,FLOOR.bed+2.5,-1.6,.32,5,new THREE.MeshStandardMaterial({map:gaugeTex,color:gaugeTex?0xffffff:0xf2efe4,roughness:.6}),{ry:Math.PI/2,name:'staff-gauge'});void gauge;
 // ---- the gallery ----------------------------------------------------------------------------------------------------
 const G=ZONES.gallery;
 S.slab(root,(6.2+9.7)/2,FLOOR.gallery-.2,(G.z0+G.z1)/2,3.5,.4,G.z1-G.z0+.5,conc);// its floor slab
 cw(9.7,-14,-7.6,FLOOR.gallery,-.4,conc,.4);cw(9.7,-6.2,12.2,FLOOR.gallery,-.4,conc,.4);// east wall (the stair's door between)
 S.slab(root,8,(FLOOR.gallery-.4)/2-.2,-14.2,3.9,3,.4,conc);// north end wall
 rail([6.35,FLOOR.gallery,-14],[6.35,FLOOR.gallery,-.62]);rail([6.35,FLOOR.gallery,.62],[6.35,FLOOR.gallery,12]);
 S.slab(root,6.32,FLOOR.gallery+.06,-1,.08,.12,25.6,yellow);// a painted kerb along the edge
 // the north end: the dead section nobody uses; the 1958 intercom horn on the end wall, its cable cut
 S.cyl(root,8,FLOOR.gallery+2.15,-13.85,.14,.32,galv,{rx:Math.PI/2,r2:.05});S.slab(root,8,FLOOR.gallery+1.85,-13.95,.24,.3,.12,green);
 S.pipe(root,[8,FLOOR.gallery+1.7,-13.95],[8.12,FLOOR.gallery+1.05,-13.9],.008,dark,4);
 for(const z of [-13,-11.6])S.slab(root,9.25,FLOOR.gallery+.45,z,.5,.9,.6,steel);// old junction boxes
 // pipes along the gallery ceiling and wall; conduit runs
 for(const [y,x,r] of [[-.72,9.2,.11],[-.95,9.3,.06],[-1.1,9.35,.04]])S.pipe(root,[x,y,-13.9],[x,y,12],r,y>-.8?rust:steel,10);
 // ---- the stairs ------------------------------------------------------------------------------------------------------
 // stair one: from the control room's west door, down westward to the gallery (each tread steps down from the last)
 {const z0=ZONES.stair1.z0-.05,z1=ZONES.stair1.z1+.05,n=18;for(let i=0;i<n;i++){const xa=14.25-(14.25-9.5)*i/n,xb=14.25-(14.25-9.5)*(i+1)/n,y=FLOOR.house-(FLOOR.house-FLOOR.gallery)*(i+.5)/n;S.slab(root,(xa+xb)/2,(y+FLOOR.gallery-.4)/2,(z0+z1)/2,Math.abs(xb-xa)+.01,y-FLOOR.gallery+.4,z1-z0,conc);}
  for(const z of [z0-.15,z1+.15])S.slab(root,11.9,(FLOOR.gallery+0)/2,z,4.9,3.2,.3,conc);rail([14.2,FLOOR.house+.05,z1-.06],[9.6,FLOOR.gallery+.1,z1-.06],{h:.9,post:2.4});}
 // stair two: from the gallery's south end down to the landing
 {const x0=ZONES.stair2.x0-.05,x1=ZONES.stair2.x1+.05,n=16;for(let i=0;i<n;i++){const za=11.9+(16.25-11.9)*i/n,zb=11.9+(16.25-11.9)*(i+1)/n,y=FLOOR.gallery-(FLOOR.gallery-FLOOR.low)*(i+.5)/n;S.slab(root,(x0+x1)/2,(y+FLOOR.low-.4)/2,(za+zb)/2,x1-x0,y-FLOOR.low+.4,Math.abs(zb-za)+.01,conc);}
  for(const x of [x0-.15,x1+.15])S.slab(root,x,(FLOOR.low+FLOOR.gallery)/2+.3,14.1,.3,3.4,4.5,conc);rail([x1-.06,FLOOR.gallery+.05,12],[x1-.06,FLOOR.low+.1,16.2],{h:.9,post:2.2});
  S.slab(root,8,FLOOR.gallery+1.25,14.2,2.4,.3,4.6,conc);}// its ceiling, stepping down under the gallery's end
 // ---- the landing (L) and the junction chamber (J) ----------------------------------------------------------------------
 const LJ={x0:6.2,x1:12,z0:16.2,z1:36.2,ceil:-2.6};
 S.slab(root,9.1,FLOOR.low-.2,26.2,6.2,.4,20.4,wetConc);// floor
 S.slab(root,9.1,LJ.ceil+.2,26.2,6.2,.4,20.4,oldConc);// ceiling
 // the west wall onto the channel, with J's two overflow ports cut through it (each the gap between wall pieces)
 {const segs=[[16.2,PORTS[0].z0],[PORTS[0].z1,PORTS[1].z0],[PORTS[1].z1,36.4]];for(const [z0,z1] of segs)cw(6.0,z0,z1,FLOOR.low-.2,LJ.ceil+.4,oldConc,.4);for(const p of PORTS){S.slab(root,6.0,(FLOOR.low-.2+p.y0)/2,(p.z0+p.z1)/2,.4,p.y0-FLOOR.low+.2,p.z1-p.z0,oldConc);S.slab(root,6.0,(p.y1+LJ.ceil+.4)/2,(p.z0+p.z1)/2,.4,LJ.ceil+.4-p.y1,p.z1-p.z0,oldConc);
   S.slab(root,6.22,p.y0-.03,(p.z0+p.z1)/2,.1,.06,p.z1-p.z0,rust);for(let z=p.z0+.12;z<p.z1;z+=.22)S.pipe(root,[6.1,p.y0,z],[6.1,p.y1,z],.016,rust,5);}}
 cw(12.2,16.2,32.3,FLOOR.low-.2,LJ.ceil+.4,oldConc,.4);cw(12.2,34.1,36.4,FLOOR.low-.2,LJ.ceil+.4,oldConc,.4);// east wall (the ladder well between)
 // L's north wall: the pieces either side of the stair's opening, and over it
 S.slab(root,6.6,(FLOOR.low+LJ.ceil)/2,16.0,.8,LJ.ceil-FLOOR.low,.4,conc);S.slab(root,10.5,(FLOOR.low+LJ.ceil)/2,16.0,3.1,LJ.ceil-FLOOR.low,.4,conc);S.slab(root,8,FLOOR.gallery-.3,16.0,2.2,.9,.4,conc);
 // the gate wall between L and J, with 2B's opening; the guides; the headstock above the opening (rack, pawl, brake drum)
 S.slab(root,6.9,(FLOOR.low+LJ.ceil)/2,GATE.z,1.4,LJ.ceil-FLOOR.low,.4,conc);S.slab(root,11.2,(FLOOR.low+LJ.ceil)/2,GATE.z,1.6,LJ.ceil-FLOOR.low,.4,conc);
 S.slab(root,9,(FLOOR.low+GATE.open+LJ.ceil)/2,GATE.z,2.8,LJ.ceil-FLOOR.low-GATE.open,.4,conc);
 for(const x of [GATE.x0-.08,GATE.x1+.08])S.slab(root,x,FLOOR.low+1.6,GATE.z,.16,3.2,.5,steel);
 const leaf=new THREE.Group();leaf.name='gate-2b-leaf';root.add(leaf);keep.add(leaf);
 S.slab(leaf,0,0,0,GATE.x1-GATE.x0+.24,GATE.leafH,.14,steel);for(const y of [-.9,-.3,.3,.9])S.slab(leaf,0,y,-.11,GATE.x1-GATE.x0+.2,.1,.1,steel);S.slab(leaf,0,-GATE.leafH/2+.04,0,GATE.x1-GATE.x0+.26,.08,.18,dark);
 for(const s of [-1,1])S.slab(leaf,s*1.25,0,.1,.08,GATE.leafH,.08,steel);
 S.slab(leaf,0,-GATE.leafH/2+.35,.08,2.6,.12,.02,yellow);S.slab(leaf,0,-GATE.leafH/2+.35,-.08,2.6,.12,.02,yellow);// painted stripe, both faces
 // the inspection port: a small round window in the leaf with a hinged steel shutter on the landing side
 const portG=S.cyl(leaf,0,GATE.port.y-GATE.leafH/2,0,.14,.18,steel,{rx:Math.PI/2});void portG;const portGlass=S.cyl(leaf,0,GATE.port.y-GATE.leafH/2,0,.11,.19,new THREE.MeshStandardMaterial({color:0x1a2228,roughness:.05,metalness:.6}),{rx:Math.PI/2});void portGlass;
 const shutter=new THREE.Group();shutter.position.set(.14,GATE.port.y-GATE.leafH/2,-.1);leaf.add(shutter);keep.add(shutter);S.cyl(shutter,-.14,0,0,.135,.02,galv,{rx:Math.PI/2});
 // the rack up the guide, the headstock box, the brake drum, the rod down to the lever in J
 S.slab(root,GATE.x1+.25,LJ.ceil-.35,GATE.z+.25,.5,.5,.5,green);S.cyl(root,GATE.x1+.25,LJ.ceil-.35,GATE.z+.55,.2,.12,steel,{rx:Math.PI/2});
 for(let y=FLOOR.low+.4;y<LJ.ceil-.2;y+=.12)S.slab(root,GATE.x1+.02,y,GATE.z+.2,.04,.05,.06,steel);
 S.pipe(root,[GATE.x1+.25,LJ.ceil-.6,GATE.z+.5],[GATE.lever.x,FLOOR.low+1.05,GATE.lever.z],.016,steel,6);
 // the hand brake: a floor pedestal, a long red handle on a pivot (pull it toward you: the pawl goes in)
 S.cyl(root,GATE.lever.x,FLOOR.low+.45,GATE.lever.z,.09,.9,green);S.slab(root,GATE.lever.x,FLOOR.low+.05,GATE.lever.z,.4,.1,.4,green);
 const lever=new THREE.Group();lever.name='gate-2b-hand-brake';lever.position.set(GATE.lever.x,FLOOR.low+.92,GATE.lever.z);root.add(lever);keep.add(lever);
 S.pipe(lever,[0,0,0],[0,.62,.32],.025,red,8);S.cyl(lever,0,.62,.32,.04,.16,dark,{rz:Math.PI/2});
 const plate=paper(256,160,(g,w,h)=>{g.fillStyle='#c8b070';g.fillRect(0,0,w,h);g.strokeStyle='#3a2a10';g.lineWidth=4;g.strokeRect(4,4,w-8,h-8);g.fillStyle='#2a1a08';g.textAlign='center';g.font='bold 18px Arial';g.fillText('GATE 2B · HAND BRAKE',w/2,30);
  g.font='14px Arial';for(const [i,l] of ['PULL AND HOLD TO STOP LEAF','RELEASE: LEAF LOWERS (FAIL-SAFE)','FOR LOCK-OUT, PIN AT FULL OPEN','DOWNSTREAM SIDE — RED PIN'].entries())g.fillText(l,w/2,62+i*22);});
 S.plane(root,GATE.lever.x+.1,FLOOR.low+1.55,GATE.z+.21,.42,.26,new THREE.MeshStandardMaterial({map:plate,color:plate?0xffffff:0xc8b070,roughness:.5,metalness:.4}),{name:'hand-brake-plate'});
 // the locking pin: stowed on a chain on the landing side; the guide's hole at full-open height
 const pin=new THREE.Group();pin.name='gate-2b-locking-pin';root.add(pin);keep.add(pin);S.pipe(pin,[0,0,-.18],[0,0,.18],.022,steel,8);S.pipe(pin,[-.09,0,-.18],[.09,0,-.18],.018,red,8);
 S.slab(root,GATE.stow.x,FLOOR.low+GATE.stow.y,GATE.stow.z-.02,.12,.18,.03,steel);S.cyl(root,GATE.pin.x+.06,FLOOR.low+GATE.pin.y,GATE.z-.25,.06,.1,steel,{rx:Math.PI/2});
 // the maintenance crank on the landing side: a handwheel on a pedestal, geared down into the wall (a turn a centimetre)
 S.cyl(root,GATE.crank.x,FLOOR.low+.5,GATE.crank.z,.08,1,green);const crank=new THREE.Group();crank.position.set(GATE.crank.x,FLOOR.low+1.05,GATE.crank.z);crank.rotation.x=Math.PI/2;root.add(crank);keep.add(crank);
 {const t=new THREE.Mesh(new THREE.TorusGeometry(.26,.025,8,22),yellow);crank.add(t);for(let k=0;k<4;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.52,.02,.02),yellow);sp.rotation.z=k*Math.PI/4;crank.add(sp);}const knob=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.12,6),dark);knob.position.set(.26,0,.06);knob.rotation.x=Math.PI/2;crank.add(knob);}
 S.pipe(root,[GATE.crank.x,FLOOR.low+1.05,GATE.crank.z],[GATE.crank.x,FLOOR.low+1.05,GATE.z-.2],.03,steel,8);
 // the staff gauge in the landing, by the gate
 S.plane(root,6.45,FLOOR.low+2,22.4,.22,3.2,new THREE.MeshStandardMaterial({map:gaugeTex,color:gaugeTex?0xffffff:0xf2efe4,roughness:.6}),{ry:Math.PI/2,name:'landing-gauge'});
 // the ladder well in J's east wall, up the shaft to the manhole on the bank
 S.slab(root,13.6,(FLOOR.low+.6)/2,33.2,.3,6.6,1.9,oldConc);S.slab(root,12.85,(FLOOR.low+.6)/2,32.3,1.6,6.6,.3,oldConc);S.slab(root,12.85,(FLOOR.low+.6)/2,34.1,1.6,6.6,.3,oldConc);
 for(let y=FLOOR.low+.3;y<.5;y+=.3)S.pipe(root,[13.35,y,32.85],[13.35,y,33.55],.016,rust,5);for(const z of [32.85,33.55])S.pipe(root,[13.35,FLOOR.low+.2,z],[13.35,.55,z],.02,rust,5);
 // the Line Two grille and the brick conduit going away under town
 S.slab(root,7.1,(FLOOR.low+LJ.ceil)/2,36.2,1.8,LJ.ceil-FLOOR.low,.4,brick);S.slab(root,11.1,(FLOOR.low+LJ.ceil)/2,36.2,2.2,LJ.ceil-FLOOR.low,.4,brick);S.slab(root,9,(FLOOR.low+GRILLE.h+LJ.ceil)/2,36.2,2,LJ.ceil-FLOOR.low-GRILLE.h,.4,brick);
 const grille=new THREE.Group();grille.name='line-two-grille';grille.position.set(GRILLE.x0,FLOOR.low,GRILLE.z);root.add(grille);keep.add(grille);// (hinged at its west side)
 for(let x=.1;x<2;x+=.13)S.pipe(grille,[x,0,0],[x,GRILLE.h-.02,0],.016,rust,5);for(const y of [.25,.95,1.7])S.slab(grille,1,y,0,2,.06,.03,rust);
 const lock=S.slab(grille,1.95,1,-.08,.08,.11,.04,galv);void lock;
 // the conduit: brick, egg-shaped, curving away; standing water in it
 {const segs=24;for(let i=0;i<segs;i++){const z=36.4+i*1.0,cx=9+Math.sin(i*.07)*1.2*smooth(i/12),w=2,h=1.95,y0=FLOOR.low+.05+i*.015;
   S.slab(root,cx-w/2-.15,y0+h/2,z+.5,.3,h,1.02,brick);S.slab(root,cx+w/2+.15,y0+h/2,z+.5,.3,h,1.02,brick);S.slab(root,cx,y0+h+.12,z+.5,w+.6,.3,1.02,brick);S.slab(root,cx,y0-.08,z+.5,w+.3,.16,1.02,mud);}}
 // ---- the landing's ordinary things: a sump, a hose reel, a toolbox, conduit, a fire extinguisher, cable trays ------
 S.cyl(root,11.2,FLOOR.low+.02,17.2,.35,.04,rust);S.cyl(root,11.4,FLOOR.low+.6,19.4,.35,.12,red,{rx:Math.PI/2});S.slab(root,6.9,FLOOR.low+.18,19.2,.5,.36,.3,red);
 for(const z of [17,24,29,33.5])S.pipe(root,[11.7,LJ.ceil-.25,z-1.5],[11.7,LJ.ceil-.25,z+1.5],.05,rust,8);S.pipe(root,[6.6,LJ.ceil-.18,16.4],[6.6,LJ.ceil-.18,35.8],.07,steel,10);
 // ---- lamps: caged bulbs on the ceilings; three real lights go to the nearest lit ones -----------------------------------
 const LAMPS={};const cage=(id,x,y,z,{emerg=false,zone='low'}={})=>{const g=new THREE.Group();g.position.set(x,y,z);root.add(g);keep.add(g);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),emerg?redLamp.clone():lampGlass.clone());g.add(bulb);
  for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(.008,.18,.008),galv);b.position.set(Math.cos(k*1.57)*.09,-.02,Math.sin(k*1.57)*.09);g.add(b);}S.cyl(g,0,.08,0,.1,.04,galv);
  LAMPS[id]={id,g,bulb,pos:new THREE.Vector3(W0.x+x,y,W0.z+z),level:0,want:0,rate:4,flick:0,seed:id.length*1.3,emerg,zone,color:emerg?0xff3a28:0xffd9a0};};
 cage('house-a',16.5,FLOOR.house+3.0,-5.5,{zone:'house'});cage('house-b',19.5,FLOOR.house+3.0,-.5,{zone:'house'});
 cage('stair1',12,FLOOR.house-.6,-6.9,{zone:'stair'});
 for(const [i,z] of [-11.5,-6.5,-1.5,3.5,8.5].entries())cage('gal-'+i,8.6,-.75,z,{zone:'gallery'});
 cage('stair2',8,FLOOR.gallery+.85,13.6,{zone:'stair'});cage('L-a',9,LJ.ceil-.18,18.2);cage('L-b',9.5,LJ.ceil-.18,21.6);
 cage('J-a',9,LJ.ceil-.18,26.2);cage('J-b',9,LJ.ceil-.18,30.6);cage('J-c',9,LJ.ceil-.18,34.9);
 cage('em-gal',9.5,-.7,0,{emerg:true,zone:'gallery'});cage('em-L',11.8,LJ.ceil-.3,20,{emerg:true});cage('em-J',11.8,LJ.ceil-.3,28.5,{emerg:true});cage('em-house',21.6,FLOOR.house+2.8,-6,{emerg:true,zone:'house'});
 cage('pole',31.2,6.6,-16.5,{zone:'yard'});
 const POOL=[0,1,2].map(i=>{const L=new THREE.PointLight(0xffd9a0,0,13,2);L.name='works-lamp-'+i;return L;});
 // ---- the gatehouse --------------------------------------------------------------------------------------------------------
 const H=HOUSE;{const wall=(x0,z0,x1,z1,holes=[])=>{const along=Math.abs(x1-x0)>Math.abs(z1-z0),L=along?x1-x0:z1-z0,cut=[...holes].sort((a,b)=>a[0]-b[0]);let u=0;const piece=(u0,u1,y0,y1)=>{if(u1-u0<.01||y1-y0<.01)return;const c=(u0+u1)/2;if(along)S.slab(root,x0+c,(y0+y1)/2,z0,u1-u0,y1-y0,.25,y1<=1.2?brick:block);else S.slab(root,x0,(y0+y1)/2,z0+c,.25,y1-y0,u1-u0,y1<=1.2?brick:block);};
   const band=(u0,u1,y0,y1)=>{piece(u0,u1,y0,Math.min(y1,1.2));piece(u0,u1,Math.max(y0,1.2),y1);};
   for(const [h0,h1,v0,v1] of cut){band(u,h0,0,H.h);band(h0,h1,0,v0);band(h0,h1,v1,H.h);u=h1;}band(u,L,0,H.h);};
  wall(H.x0,H.z0,H.x1,H.z0,[[3.2,5.4,1.3,2.4]]);wall(H.x0,H.z1,H.x1,H.z1,[[1.2,3.2,1.3,2.4]]);
  wall(H.x1,H.z0,H.x1,H.z1,[[H.door.z0-H.z0,H.door.z1-H.z0,0,2.15],[6.4,8.6,1.3,2.4]]);wall(H.x0,H.z0,H.x0,H.z1,[[H.stairDoor.z0-H.z0,H.stairDoor.z1-H.z0,-1,2.1]]);
  S.slab(root,(H.x0+H.x1)/2,H.h+.12,(H.z0+H.z1)/2,H.x1-H.x0+.5,.24,H.z1-H.z0+.5,conc);// roof
  S.slab(root,(H.x0+H.x1)/2,FLOOR.house-.12,(H.z0+H.z1)/2,H.x1-H.x0-.3,.24,H.z1-H.z0-.3,conc);// floor
  S.slab(root,(H.x0+H.x1)/2,H.h-.02,(H.z0+H.z1)/2,H.x1-H.x0-.5,.04,H.z1-H.z0-.5,new THREE.MeshStandardMaterial({color:0xd8d4c8,roughness:.95}));// ceiling
  // window glass: grimy, a little light through it
  const glass=new THREE.MeshStandardMaterial({color:0x8a9a9a,roughness:.15,metalness:.3,transparent:true,opacity:.42});glass.name='gatehouse-glass';
  for(const [x,z,ry,w] of [[18.3,H.z0,0,2.2],[16.2,H.z1,0,2],[H.x1,-.1,Math.PI/2,2.2]])S.plane(root,x,1.85,z,w,1.1,glass,{ry});
  // the steel door, standing open against the wall; the step; the sign over it
  const door=S.slab(root,H.x1+.48,1.07,H.door.z0-.05,.05,2.1,1.05,green);door.rotation.y=-.2;S.slab(root,H.x1+.4,.08,(H.door.z0+H.door.z1)/2,.6,.16,1.4,conc);
  const sign=paper(512,256,(g,w,h)=>{g.fillStyle='#e9e4d6';g.fillRect(0,0,w,h);g.strokeStyle='#1f3a2a';g.lineWidth=10;g.strokeRect(8,8,w-16,h-16);g.fillStyle='#1f3a2a';g.textAlign='center';g.font='bold 30px Arial';g.fillText('OAK HOLLOW TWP. PUBLIC WORKS',w/2,62);
   g.font='bold 40px Arial';g.fillText('MILL CREEK ISOLATION WORKS',w/2,124);g.font='26px Arial';g.fillText('GATE STRUCTURE NO. 2  ·  1958',w/2,172);g.fillStyle='#a02a20';g.font='bold 22px Arial';g.fillText('AUTHORIZED PERSONNEL ONLY',w/2,222);});
  S.plane(root,H.x1+.14,2.75,-1.6,1.9,.95,new THREE.MeshStandardMaterial({map:sign,color:sign?0xffffff:0xe9e4d6,roughness:.6}),{ry:Math.PI/2,name:'works-sign'});
  // inside: the switchgear along the north wall (dials for the three gates, the level chart), the desk, the bin, the log
  const panelTex=paper(1024,384,(g,w,h)=>{g.fillStyle='#4a5e52';g.fillRect(0,0,w,h);g.strokeStyle='#22302a';g.lineWidth=6;for(let i=1;i<4;i++){g.beginPath();g.moveTo(w*i/4,0);g.lineTo(w*i/4,h);g.stroke();}
   const dial=(x,label,v)=>{g.fillStyle='#ece6d4';g.beginPath();g.arc(x,120,70,0,7);g.fill();g.strokeStyle='#111';g.lineWidth=3;g.stroke();for(let k=0;k<=10;k++){const a=Math.PI*(.8+k*.14);g.beginPath();g.moveTo(x+Math.cos(a)*58,120+Math.sin(a)*58);g.lineTo(x+Math.cos(a)*68,120+Math.sin(a)*68);g.stroke();}
    g.fillStyle='#111';g.font='bold 18px Arial';g.textAlign='center';g.fillText(label,x,226);g.font='13px Arial';g.fillText('CLOSED        OPEN',x,248);};
   dial(w*.125,'GATE 1',0);dial(w*.375,'GATE 2',0);dial(w*.625,'GATE 2B',0);
   g.fillStyle='#f4f0e2';g.fillRect(w*.77,40,w*.2,170);g.strokeStyle='#888';for(let i=0;i<12;i++){g.beginPath();g.moveTo(w*.77,40+i*14);g.lineTo(w*.97,40+i*14);g.stroke();}g.strokeStyle='#b02020';g.lineWidth=2;g.beginPath();for(let i=0;i<=40;i++)g.lineTo(w*.77+i*w*.005,190-Math.pow(i/40,2.4)*120-Math.sin(i*.9)*4);g.stroke();
   g.fillStyle='#111';g.font='bold 16px Arial';g.textAlign='center';g.fillText('MILL CREEK LEVEL',w*.87,232);g.fillStyle='#c0b060';for(let i=0;i<8;i++){g.fillRect(40+i*110,300,60,26);}g.fillStyle='#111';g.font='11px Arial';for(let i=0;i<8;i++)g.fillText(['MAIN','GATE 1','GATE 2','2B HOLD','PUMP','LIGHTS','GEN','ALARM'][i],70+i*110,346);});
  S.slab(root,17.6,1.3,H.z0+.42,5.4,2.2,.5,green);S.plane(root,17.6,1.55,H.z0+.68,5.2,1.95,new THREE.MeshStandardMaterial({map:panelTex,color:panelTex?0xffffff:0x4a5e52,roughness:.55,metalness:.2}),{name:'switchgear'});
  S.slab(root,18.6,FLOOR.house+.74,1.3,2.2,.05,.8,wood);for(const [x,z] of [[17.6,1],[19.6,1],[17.6,1.6],[19.6,1.6]])S.slab(root,x,FLOOR.house+.37,z,.05,.72,.05,steel);
  S.slab(root,20.6,FLOOR.house+.6,-1.2,.5,1.2,.6,steel);// a file cabinet
  S.cyl(root,15.3,FLOOR.house+.35,.9,.3,.7,rust);// the debris bin by the desk
  for(const [x,z] of [[14.6,-1.5],[14.6,-.4]])S.slab(root,x,FLOOR.house+.5,z,.3,1,.9,wood);// shelves of parts
  S.slab(root,20.9,FLOOR.house+1.2,-6.6,.4,.6,.3,red);// the alarm horn box
 }
 // ---- the yard: fence, gates, the light pole, the generator cabinet, the signs, the truck -----------------------------------
 const fence=(a,b,{gap=null}={})=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/3));for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;S.pipe(root,[x,0,z],[x,2.1,z],.035,galv,6);}
  S.pipe(root,[a[0],2.05,a[1]],[b[0],2.05,b[1]],.025,galv,6);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(L,1.95),chain);mesh.position.set((a[0]+b[0])/2,1.02,(a[1]+b[1])/2);mesh.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);root.add(mesh);void gap;};
 const chainTex=paper(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(170,176,172,1)';g.lineWidth=3;for(let i=-64;i<128;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.stroke();g.beginPath();g.moveTo(i+64,0);g.lineTo(i,64);g.stroke();}});
 if(chainTex){chainTex.wrapS=chainTex.wrapT=THREE.RepeatWrapping;chainTex.repeat.set(8,4);}
 const chain=new THREE.MeshStandardMaterial({color:0xb0b4b0,map:chainTex,alphaTest:.4,transparent:!chainTex,opacity:chainTex?1:.25,side:THREE.DoubleSide,roughness:.5,metalness:.6});chain.name='chain-link';
 fence([7,-26],[36,-26]);fence([36,-26],[36,-2]);fence([36,5],[36,22]);fence([14,22],[15.5,22]);fence([17.5,22],[36,22]);
 // the south gate (to the bank over the junction chamber): a leaf that swings out; the vehicle gate stands open
 const southGate=new THREE.Group();southGate.position.set(15.5,0,22);root.add(southGate);keep.add(southGate);S.pipe(southGate,[0,0,0],[0,2,0],.03,galv,6);S.pipe(southGate,[2,0,0],[2,2,0],.03,galv,6);S.pipe(southGate,[0,2,0],[2,2,0],.025,galv,6);S.pipe(southGate,[0,.1,0],[2,.1,0],.025,galv,6);
 {const m=new THREE.Mesh(new THREE.PlaneGeometry(2,1.9),chain);m.position.set(1,1.05,0);southGate.add(m);}
 {const g=new THREE.Group();g.position.set(36,0,-2);g.rotation.y=-1.9;root.add(g);S.pipe(g,[0,0,0],[0,2,0],.035,galv,6);S.pipe(g,[3.4,0,0],[3.4,2,0],.03,galv,6);S.pipe(g,[0,2,0],[3.4,2,0],.03,galv,6);S.pipe(g,[0,.2,0],[3.4,.2,0],.03,galv,6);const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.8),chain);m.position.set(1.7,1.1,0);g.add(m);}
 // the bank path from the south gate down to the manhole pad; the pad, the cast-iron cover, the lifting hook
 S.slab(root,16,.28,26.1,3.2,.06,9,mud);S.slab(root,14.5,FLOOR.pad-.05,33.2,4.2,.1,5.2,conc);
 const cover=new THREE.Group();cover.name='junction-manhole-cover';cover.position.set(MANHOLE.x,FLOOR.pad+.02,MANHOLE.z);root.add(cover);keep.add(cover);
 {const c=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.05,24),new THREE.MeshStandardMaterial({color:0x2c2a28,roughness:.6,metalness:.6}));cover.add(c);for(let k=0;k<6;k++){const r=new THREE.Mesh(new THREE.BoxGeometry(.8,.012,.03),dark);r.position.y=.03;r.rotation.y=k*Math.PI/6;cover.add(r);}}
 S.cyl(root,MANHOLE.x,FLOOR.pad-.02,MANHOLE.z,.5,.06,conc);
 // the light pole and its sodium head; the generator cabinet; a pallet of sandbags; two oil drums; a hose reel; the signs
 S.cyl(root,31.2,3.4,-16.5,.09,6.8,galv,{r2:.06});S.slab(root,31.2,6.75,-16.3,.3,.12,.6,galv);
 S.slab(root,24.8,1,-12,1.8,2,1,green);S.slab(root,24.8,2.05,-12,1.9,.1,1.1,galv);const genSign=paper(256,96,(g,w,h)=>{g.fillStyle='#e8e2d0';g.fillRect(0,0,w,h);g.fillStyle='#1f3a2a';g.font='bold 30px Arial';g.textAlign='center';g.fillText('STANDBY GENERATOR',w/2,44);g.fillStyle='#a02a20';g.font='bold 20px Arial';g.fillText('DANGER  480 V',w/2,78);});
 S.plane(root,24.8,1.5,-11.49,1,.38,new THREE.MeshStandardMaterial({map:genSign,color:genSign?0xffffff:0xe8e2d0}),{name:'generator-sign'});
 S.slab(root,33,.45,14,1.2,.9,1.0,wood);for(let i=0;i<9;i++)S.slab(root,32.6+(i%3)*.4,.95+Math.floor(i/3)*.18,13.7+(i%2)*.3,.42,.18,.3,new THREE.MeshStandardMaterial({color:0x8a7a5a,roughness:1}));
 for(const [x,z] of [[34.2,-22],[33.4,-22.7]])S.cyl(root,x,.45,z,.3,.9,new THREE.MeshStandardMaterial({color:0x3a5a7a,roughness:.6,metalness:.3}));
 const warn=paper(384,256,(g,w,h)=>{g.fillStyle='#f2c21a';g.fillRect(0,0,w,h);g.fillStyle='#111';g.fillRect(0,0,w,64);g.fillStyle='#f2c21a';g.font='bold 44px Arial';g.textAlign='center';g.fillText('DANGER',w/2,48);g.fillStyle='#111';g.font='bold 28px Arial';g.fillText('WATER CAN RISE',w/2,118);g.fillText('WITHOUT WARNING',w/2,156);g.font='bold 22px Arial';g.fillText('STAY BEHIND RAILING',w/2,214);});
 for(const [x,z,ry] of [[7.2,-21,Math.PI/2],[7.2,-16,Math.PI/2],[35.9,-6,-Math.PI/2]]){S.pipe(root,[x+(ry>0?.08:-.08),0,z],[x+(ry>0?.08:-.08),1.9,z],.03,galv,6);S.plane(root,x+(ry>0?.11:-.11),1.55,z,.62,.42,new THREE.MeshStandardMaterial({map:warn,color:warn?0xffffff:0xf2c21a,roughness:.6}),{ry});}
 // the road embankment north... (south, here: z 45..52) with its guardrail; the twin culverts under it
 S.slab(root,15,2.35,49,70,.12,7,asphalt);for(let x=-18;x<48;x+=2.2)S.slab(root,x,2.75,45.6,.12,.7,.12,galv);S.slab(root,15,3.05,45.6,66,.3,.06,galv);
 for(const s of [-1,1]){S.slab(root,s*3,-1.2,45.6,5.2,.3,1,conc);S.slab(root,s*3,FLOOR.bed+1.5,46.2,5.4,3.2,.4,dark);}S.slab(root,0,-1,45.4,13,2.4,.8,conc);
 // ---- Brandt's truck: a white Public Works pickup, an amber bar on the cab ------------------------------------------------------
 const truck=new THREE.Group();truck.name='public-works-truck';root.add(truck);
 {const white=new THREE.MeshStandardMaterial({color:0xe8e8e2,roughness:.35,metalness:.3}),glassT=new THREE.MeshStandardMaterial({color:0x1c2228,roughness:.08,metalness:.5}),tire=new THREE.MeshStandardMaterial({color:0x151515,roughness:.9}),amber=new THREE.MeshStandardMaterial({color:0x6a4a10,emissive:0xffa020,emissiveIntensity:0,roughness:.4});
  S.slab(truck,0,.75,0,1.95,.7,5.4,white);S.slab(truck,0,1.45,-.75,1.9,.8,2.0,white);S.slab(truck,0,1.55,-1.72,1.8,.6,.06,glassT,{rx:-.35});for(const s of [-1,1])S.slab(truck,s*.96,1.5,-.75,.04,.5,1.7,glassT);
  S.slab(truck,0,1.18,1.55,1.95,.2,2.3,white);for(const s of [-1,1])S.slab(truck,s*.95,1.25,1.55,.08,.35,2.3,white);S.slab(truck,0,1.98,-.75,1.2,.12,.25,amber);truck.userData.amber=amber;
  for(const [x,z] of [[-.85,-1.65],[.85,-1.65],[-.85,1.7],[.85,1.7]]){const w=S.cyl(truck,x,.38,z,.38,.28,tire,{rz:Math.PI/2});void w;}
  const door=paper(256,128,(g,w,h)=>{g.fillStyle='#e8e8e2';g.fillRect(0,0,w,h);g.fillStyle='#1f5a3a';g.beginPath();g.arc(48,64,36,0,7);g.fill();g.fillStyle='#e8e8e2';g.font='bold 22px Arial';g.textAlign='center';g.fillText('OH',48,72);g.fillStyle='#1f5a3a';g.textAlign='left';g.font='bold 20px Arial';g.fillText('OAK HOLLOW TWP.',94,54);g.fillText('PUBLIC WORKS',94,84);});
  for(const s of [-1,1])S.plane(truck,s*.985,.95,-.75,1.3,.65,new THREE.MeshStandardMaterial({map:door,color:door?0xffffff:0xe8e8e2,roughness:.4}),{ry:s*Math.PI/2});
  truck.position.set(SPOT.truck[0],0,SPOT.truck[1]);truck.rotation.y=Math.PI/2+.15;}
 // ---- the trees around the valley (Chapter Five's forest kit, placed here) ------------------------------------------------
 const rnd=seeded(6160),trees=[];
 for(let i=0;i<900&&trees.length<380;i++){const a=rnd()*Math.PI*2,d=26+rnd()*120,x=15+Math.cos(a)*d,z=10+Math.sin(a)*d;
  if(x>-12&&x<44&&z>-34&&z<40)continue;if(x>-9&&x<9)continue;if(Math.abs(z-49)<8&&x>-34&&x<64)continue;if(x>12&&x<20&&z>20&&z<40)continue;
  trees.push({e:x,n:z,kind:rnd()<.45?'pine':'oak',seed:(rnd()*1e6)|0,size:.85+rnd()*.5});}
 const forestG=new THREE.Group();forestG.name='works-forest';root.add(forestG);
 const forest=createPineForest(trees,forestG,t=>({x:t.e,y:groundAt(t.e,t.n),z:t.n}));
 // ---- water ------------------------------------------------------------------------------------------------------------------------
 // One look for all of it: brown-grey, moving the way it flows (flow: direction and speed), foam where it is fast.
 const waterT={value:0};
 function waterMat(flow,{foam=.3,color=0x51503f,opacity=.9}={}){const m=new THREE.MeshStandardMaterial({color,roughness:.18,metalness:.15,transparent:true,opacity,depthWrite:false});m.userData.flow=new THREE.Vector2(...flow);m.userData.foam={value:foam};
  m.onBeforeCompile=sh=>{sh.uniforms.c6T=waterT;sh.uniforms.c6Flow={value:m.userData.flow};sh.uniforms.c6Foam=m.userData.foam;
   sh.vertexShader='varying vec3 vC6W;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvC6W=(modelMatrix*vec4(position,1.)).xyz;');
   sh.fragmentShader='varying vec3 vC6W;uniform float c6T,c6Foam;uniform vec2 c6Flow;\nfloat c6h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*45758.5);}float c6n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(c6h(i),c6h(i+vec2(1,0)),f.x),mix(c6h(i+vec2(0,1)),c6h(i+1.),f.x),f.y);}\n'+sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    {vec2 q=vC6W.xz-c6Flow*c6T;float a=c6n(q*1.7)+.5*c6n(q*4.1+c6T*.3)+.25*c6n(q*9.3-c6T*.5);float e=.02;
     float ax=c6n((q+vec2(e,0.))*1.7)+.5*c6n((q+vec2(e,0.))*4.1+c6T*.3)+.25*c6n((q+vec2(e,0.))*9.3-c6T*.5);float az=c6n((q+vec2(0.,e))*1.7)+.5*c6n((q+vec2(0.,e))*4.1+c6T*.3)+.25*c6n((q+vec2(0.,e))*9.3-c6T*.5);
     vec3 bump=normalize(vec3((a-ax)*9.,1.,(a-az)*9.));normal=normalize(mix(normal,(viewMatrix*vec4(bump,0.)).xyz,.85));
     float streak=smoothstep(.62,.9,c6n(vec2(dot(q,normalize(c6Flow+1e-4))*.6,dot(q,vec2(-c6Flow.y,c6Flow.x)/(length(c6Flow)+1e-4))*3.)));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.78,.76,.68),streak*c6Foam);}`);};
  m.customProgramCacheKey=()=>'c6-water';return m;}
 const WATER={chan:{y:-4.8,want:-4.8,rate:.05},J:{y:FLOOR.low-.02,want:FLOOR.low-.02,rate:.05},L:{y:FLOOR.low-.03,want:FLOOR.low-.03,rate:.05}};
 const chanM=waterMat([0,1.6],{foam:.35}),jM=waterMat([0,-.25],{foam:.15,color:0x4a4a3a}),lM=waterMat([0,-.4],{foam:.12,color:0x4a4a3a,opacity:.82});
 const wPlane=(w,d,m,name)=>{const g=new THREE.PlaneGeometry(w,d,Math.ceil(w/2),Math.ceil(d/2));g.rotateX(-Math.PI/2);const o=new THREE.Mesh(g,m);o.name=name;o.renderOrder=2;root.add(o);keep.add(o);return o;};
 const chanW=wPlane(12,116,chanM,'channel-water');chanW.position.set(0,0,-12);
 const jW=wPlane(5.8,12.6,jM,'junction-water');jW.position.set(9.1,0,29.5);const lW=wPlane(5.8,6.6,lM,'landing-water');lW.position.set(9.1,0,19.5);
 // falls: the ports spilling into J; the jet under the gate into L; the spill over the trash rack
 const fallTex=paper(64,256,(g,w,h)=>{for(let y=0;y<h;y++){const a=.35+.5*Math.random();g.fillStyle=`rgba(${200+Math.random()*40|0},${196+Math.random()*30|0},${180+Math.random()*30|0},${a})`;g.fillRect(0,y,w,1);}for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,250,.7)';g.fillRect(Math.random()*w,Math.random()*h,2,12+Math.random()*30);}});
 if(fallTex){fallTex.wrapS=fallTex.wrapT=THREE.RepeatWrapping;}
 const fallM=new THREE.MeshStandardMaterial({color:0xb8b4a4,map:fallTex,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,roughness:.3,emissive:0x3a3a34,emissiveIntensity:.3});fallM.name='falling-water';
 const falls=PORTS.map((p,i)=>{const g=new THREE.PlaneGeometry(p.z1-p.z0-.1,1,1,6),pp=g.attributes.position;for(let k=0;k<pp.count;k++){const v=pp.getY(k)+.5;pp.setZ(k,(1-v)*(1-v)*.9);}g.computeVertexNormals();const o=new THREE.Mesh(g,fallM);o.rotation.y=Math.PI/2;o.position.set(6.25,p.y0,(p.z0+p.z1)/2);o.name='port-fall-'+i;o.renderOrder=3;root.add(o);keep.add(o);return o;});
 const jetM=fallM.clone();jetM.name='gate-jet';const jet=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.6,1,8),jetM);jet.rotation.x=-Math.PI/2+.25;jet.position.set(9,FLOOR.low+.1,22.1);jet.renderOrder=3;root.add(jet);keep.add(jet);
 // foam where the channel goes over the bed step at the culverts, and spray (sprites) where the falls land
 const sprayTex=paper(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(240,240,232,.8)');r.addColorStop(1,'rgba(240,240,232,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
 const sprays=[];for(let i=0;i<18;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:sprayTex,color:0xdedcd2,transparent:true,opacity:0,depthWrite:false}));s.scale.setScalar(.6);root.add(s);sprays.push({s,i,p:Math.random()*6});keep.add(s);}
 // floating debris: branches, a pallet, a bucket, a ball (bob on the water where they are, drift with the flow)
 const debris=[];{const branch=()=>{const g=new THREE.Group();S.pipe(g,[-.9,0,0],[.9,0,.1],.05,wood,6);S.pipe(g,[.2,0,.05],[.7,0,.45],.025,wood,5);return g;};
  const add=(o,zone,x,z,v)=>{root.add(o);keep.add(o);debris.push({o,zone,x,z,v,ph:Math.random()*6,spin:(Math.random()-.5)*.4});};
  add(branch(),'chan',-2,-30,1.2);add(branch(),'chan',3,-18,1.4);add(branch(),'chan',-3.5,20,1.6);
  {const p=new THREE.Group();for(let i=0;i<5;i++)S.slab(p,0,0,-.5+i*.25,1.2,.03,.1,wood);S.slab(p,0,-.06,0,1.2,.08,.1,wood);add(p,'J',8.4,31,0);}
  {const b=S.cyl(new THREE.Group(),0,0,0,.14,.3,new THREE.MeshStandardMaterial({color:0xd8d040,roughness:.6}));const g=b.parent;add(g,'J',10.8,27,0);}
  {const g=new THREE.Group();S.cyl(g,0,0,0,.1,.06,new THREE.MeshStandardMaterial({color:0xb02a2a,roughness:.5}));add(g,'L',8,19,0);}}
 // ---- merge what doesn't move -----------------------------------------------------------------------------------------------
 const batches=bake(root,keep);
 for(const L of POOL)root.add(L);
 // ---- state --------------------------------------------------------------------------------------------------------------------------
 const GS={gap:GATE.open,v:0,mode:'up',held:false,pinned:false,slamAt:-1,crankUp:0,port:0,lever:0};// gap: bottom of the leaf over the floor
 const ST={power:true,alarm:0,t:0,storm:0,southGate:0,cover:0,grille:0,grilleShake:0,grilleLock:true,wheelSpin:0};
 function place(){leaf.position.set((GATE.x0+GATE.x1)/2,FLOOR.low+GS.gap+GATE.leafH/2,GATE.z);
  lever.rotation.x=-.55*GS.lever;pin.visible=true;shutter.rotation.y=-1.9*GS.port;
  for(const g of mainGates)g.leaf.position.y=g.y;grille.rotation.y=-1.35*ST.grille+Math.sin(ST.t*55)*.012*ST.grilleShake;
  southGate.rotation.y=1.6*ST.southGate;cover.position.x=MANHOLE.x+ST.cover*.95;cover.rotation.z=ST.cover*.15;
  chanW.position.y=WATER.chan.y;jW.position.y=WATER.J.y;lW.position.y=WATER.L.y;}
 // the pin: in its stowage clip, in your hand (the chapter moves it), or through the guide
 const pinAt={stow:local(GATE.stow.x,GATE.stow.z,FLOOR.low+GATE.stow.y),hole:local(GATE.pin.x,GATE.pin.z-.02,FLOOR.low+GATE.pin.y)};
 function pinTo(where,obj=null){if(where==='hand'&&obj){obj.add(pin);pin.position.set(0,0,0);pin.rotation.set(0,0,0);return;}root.add(pin);
  if(where==='stow'){pin.position.set(GATE.stow.x,FLOOR.low+GATE.stow.y,GATE.stow.z-.06);pin.rotation.set(0,0,Math.PI/2);}
  else{pin.position.set(GATE.pin.x+.02,FLOOR.low+GATE.pin.y,GATE.z-.32+(where==='in'?.18:0));pin.rotation.set(0,0,0);}}
 pinTo('stow');
 // ---- every frame ----------------------------------------------------------------------------------------------------------------------
 const lampOrder=Object.values(LAMPS);
 function update(dt,{eye}={}){ST.t+=dt;waterT.value+=dt;const t=ST.t;
  // the gate: up (power), coming down on the governor, held (the hand brake), dropping, shut
  if(GS.mode==='down'){if(GS.held){GS.v=0;}else{GS.v=Math.min(GS.v+dt*.25,.13);GS.gap=Math.max(0,GS.gap-GS.v*dt);}if(GS.gap<=0){GS.mode='shut';sfx('c6Slam',local(9,GATE.z,FLOOR.low+1));}}
  else if(GS.mode==='drop'){GS.v=Math.min(GS.v+dt*9.8,5);GS.gap=Math.max(0,GS.gap-GS.v*dt);if(GS.gap<=0){GS.mode='shut';GS.slamAt=t;}}
  else if(GS.mode==='raise'){GS.gap=Math.min(GATE.open,GS.gap+dt*.18);if(GS.gap>=GATE.open)GS.mode='up';}
  GS.lever=damp(GS.lever,GS.held?1:0,10,dt);GS.port=damp(GS.port,GS.portOpen?1:0,5,dt);
  // the water: each level eases to where it is going (the chapter says where); the falls and the jet follow the heads
  for(const w of Object.values(WATER))w.y+=clamp(w.want-w.y,-w.rate*dt*3,w.rate*dt);
  const spill=clamp((WATER.chan.y-PORTS[0].y0)/.6,0,1);fallM.opacity=.85*spill;for(const f of falls){f.visible=spill>.02;f.scale.y=clamp((PORTS[0].y0-WATER.J.y)/1,0.05,1.6);f.position.y=PORTS[0].y0;}
  if(fallTex)fallTex.offset.y=-t*1.8;
  const head=WATER.J.y-WATER.L.y,through=GS.gap>.05&&head>.05?clamp(head/.6,0,1)*clamp(GS.gap/.6,0,1):0;jetM.opacity=.8*through;jet.visible=through>.02;jet.position.y=Math.max(WATER.L.y,FLOOR.low)+.04;
  ST.jet=through;ST.spill=spill;
  chanM.userData.foam.value=.25+.5*clamp((WATER.chan.y+4.8)/1.8,0,1);chanM.userData.flow.y=1.4+2.6*clamp((WATER.chan.y+4.8)/1.8,0,1);
  jM.userData.foam.value=.15+.6*spill;lM.userData.foam.value=.12+.6*through;
  for(const p of sprays){const i=p.i;p.p+=dt*(1.2+i%3*.3);let x,z,y,on;if(i<12){const f=PORTS[i%2];x=6.5+(p.p%1)*.9;z=f.z0+.2+((i*.37)%1)*(f.z1-f.z0-.4);y=WATER.J.y+.15+(p.p%1)*.3;on=spill;}else{x=7.8+((i*.53)%1)*2.4;z=22.4-(p.p%1)*1.2;y=Math.max(WATER.L.y,FLOOR.low)+.12+(p.p%1)*.25;on=through;}
   p.s.position.set(x,y,z);p.s.material.opacity=on*.5*(1-(p.p%1));p.s.visible=on>.02;p.s.scale.setScalar(.4+(p.p%1)*.7);}
  for(const d of debris){const w=WATER[d.zone];d.z+=d.v*dt*(d.zone==='chan'?(.6+chanM.userData.flow.y/3):1);if(d.zone==='chan'&&d.z>44)d.z=-60;
   const bob=Math.sin(t*1.7+d.ph)*.03;const y=d.zone==='chan'?w.y:Math.max(w.y,FLOOR.low)+.02;const dryJ=d.zone!=='chan'&&w.y<FLOOR.low+.06;
   d.o.position.set(d.x+Math.sin(t*.4+d.ph)*.15*(dryJ?0:1),y+(dryJ?0:bob),d.z);d.o.rotation.set(dryJ?0:Math.sin(t+d.ph)*.08,d.ph+t*d.spin*(dryJ?0:1),dryJ?0:Math.cos(t*.8+d.ph)*.06);}
  // the main gates' wheels (Brandt turning one), the grille, the cover, the south gate
  ST.grilleShake=Math.max(0,ST.grilleShake-dt*1.6);for(const w of wheels)w.rotation.z+=ST.wheelSpin*dt;
  // lamps: a level and a level they're going to; flicker; power off takes the mains ones, the emergency ones come on
  for(const L of lampOrder){const want=L.emerg?(ST.power?0:L.want):(ST.power?L.want:0);L.level=damp(L.level,want,L.rate,dt);let v=L.level;if(L.flick>0&&v>.05)v*=.55+.45*Math.max(0,Math.sin(t*(23+L.seed)+Math.sin(t*7.3+L.seed)*3));L.shown=v;L.bulb.material.emissiveIntensity=v*(L.emerg?2.2:2.6);}
  if(eye){const lit=lampOrder.filter(L=>L.shown>.04).map(L=>({L,d:L.pos.distanceToSquared(eye)})).sort((a,b)=>a.d-b.d);
   POOL.forEach((P,i)=>{const e=lit[i];if(!e){P.intensity=0;return;}const L=e.L;P.position.set(L.pos.x-W0.x,L.pos.y-.12,L.pos.z-W0.z);P.color.setHex(L.color);P.intensity=L.shown*(L.emerg?5:L.zone==='house'?7:L.zone==='yard'?14:9);P.distance=L.zone==='yard'?24:L.emerg?9:13;});}
  if(truck.userData.amber)truck.userData.amber.emissiveIntensity=ST.amber?(Math.sin(t*9)>0?2:.2):0;
  forest.update(dt,camera);place();}
 // ---- nav ---------------------------------------------------------------------------------------------------------------------------------
 const BOX={x0:-20,x1:48,z0:-40,z1:60};
 const OBST=[{x:SPOT.truck[0],z:SPOT.truck[1],hw:1.2,hd:2.9,a:-.15},{x:24.8,z:-12,hw:1,hd:.6},{x:33,z:14,hw:.75,hd:.65},{x:33.8,z:-22.35,hw:.75,hd:.75},{x:31.2,z:-16.5,hw:.2,hd:.2},
  {x:17.6,z:-7.5,hw:2.8,hd:.35},{x:18.6,z:1.3,hw:1.15,hd:.45},{x:20.6,z:-1.2,hw:.3,hd:.35},{x:15.3,z:.9,hw:.35,hd:.35},{x:14.6,z:-.95,hw:.2,hd:.95},
  {x:GATE.lever.x,z:GATE.lever.z,hw:.22,hd:.22},{x:GATE.crank.x,z:GATE.crank.z,hw:.14,hd:.14},{x:11.2,z:17.2,hw:.2,hd:.2},{x:6.9,z:19.2,hw:.3,hd:.2}];
 const inO=(x,z,r)=>OBST.some(o=>{const c=Math.cos(o.a||0),s=Math.sin(o.a||0),dx=x-o.x,dz=z-o.z,lx=dx*c+dz*s,lz=-dx*s+dz*c;return Math.abs(lx)<o.hw+r&&Math.abs(lz)<o.hd+r;});
 function zoneAt(x,z,r=0){const Z=ZONES;
  if(inR(Z.stair1,x,z,Math.min(r,.2)))return 'stair1';
  if(inR(Z.house,x,z,r))return 'house';
  if(inR(Z.stair2,x,z,Math.min(r,.2)))return 'stair2';
  if(inR(Z.gallery,x,z,r))return 'gallery';if(inR(Z.bridge,x,z,Math.min(r,.25)))return 'bridge';
  if(inR(Z.L,x,z,r))return 'L';if(inR(Z.J,x,z,r))return 'J';
  if(x>Z.gate.x0+r&&x<Z.gate.x1-r&&z>Z.gate.z0&&z<Z.gate.z1)return 'gate';
  if(inR(Z.yardA,x,z,r)||inR(Z.yardB,x,z,r))return(x>HOUSE.x0-r&&x<HOUSE.x1+r&&z>HOUSE.z0-r&&z<HOUSE.z1+r)?(x>HOUSE.x1-.3&&z>HOUSE.door.z0+r&&z<HOUSE.door.z1-r?'door':null):'yard';
  if(x>HOUSE.x1-.3&&x<HOUSE.x1+.2&&z>HOUSE.door.z0+r&&z<HOUSE.door.z1-r)return 'door';
  if(ST.southGate>.5&&x>15.6+r&&x<17.4-r&&z>21&&z<22.6)return 'sgate';
  if(inR(Z.path,x,z,r))return 'path';if(inR(Z.pad,x,z,r))return 'pad';
  return null;}
 function floorAt(x,z){const q=toLocal(x,z),Z=zoneAt(q.x,q.z,0);
  switch(Z){case 'house':case 'door':return FLOOR.house*(Z==='door'?.5:1);case 'stair1':return lerp(FLOOR.gallery,FLOOR.house,clamp((q.x-9.5)/(14.25-9.5),0,1));case 'gallery':case 'bridge':return FLOOR.gallery;
   case 'stair2':return lerp(FLOOR.gallery,FLOOR.low,clamp((q.z-11.9)/(16.25-11.9),0,1));case 'L':case 'J':case 'gate':return FLOOR.low;case 'yard':case 'sgate':return FLOOR.yard;
   case 'path':return lerp(FLOOR.yard,FLOOR.pad,clamp((q.z-21.6)/9,0,1));case 'pad':return FLOOR.pad;}
  return groundAt(q.x,q.z);}
 // (walking: in a place, clear of what stands there; through 2B only with the leaf high enough (low: only ducking); in J and L not
 // where the water is deeper than a kid can stand in)
 const nav={inside:(x,z)=>{const q=toLocal(x,z);return q.x>BOX.x0&&q.x<BOX.x1&&q.z>BOX.z0&&q.z<BOX.z1;},
  walkable:(x,z,r=.28)=>{const q=toLocal(x,z),Z=zoneAt(q.x,q.z,r);if(!Z)return false;if(inO(q.x,q.z,r))return false;
   if(Z==='gate'){if(GS.gap<(nav.ducking?1.02:1.45))return false;}
   if((Z==='J'||Z==='gate')&&WATER.J.y-FLOOR.low>1.05)return false;if(Z==='L'&&WATER.L.y-FLOOR.low>1.05)return false;
   return true;},
  floorAt,heading:0,ducking:false};
 // the dark under the ground (0 outside, 1 below): for the light, the rain and the sound
 function cave(x,z){const q=toLocal(x,z),Z=zoneAt(q.x,q.z,0);if(Z==='house'||Z==='door')return .42;if(Z==='stair1')return lerp(1,.42,clamp((q.x-9.5)/4.75,0,1));if(Z==='gallery'||Z==='bridge'||Z==='stair2'||Z==='L'||Z==='J'||Z==='gate')return 1;return 0;}
 // what stands in the way that moves: the gate's leaf when it is low; the open south gate's leaf
 function blockers(out){if(GS.gap<1.02){const c=local(9,GATE.z);for(const dx of [-1,0,1])out.push({x:c.x+dx,z:c.z,r:.5,speed:0});}}
 function attach(on){if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();}
 function reset(){Object.assign(GS,{gap:GATE.open,v:0,mode:'up',held:false,pinned:false,slamAt:-1,crankUp:0,port:0,portOpen:false,lever:0});Object.assign(ST,{power:true,alarm:0,t:0,southGate:0,cover:0,grille:0,grilleShake:0,grilleLock:true,wheelSpin:0,amber:false});
  for(const w of Object.values(WATER)){w.y=w.want=w===WATER.chan?-4.8:FLOOR.low-.03;w.rate=.05;}for(const L of lampOrder){L.level=L.want=0;L.flick=0;}for(const P of POOL)P.intensity=0;pinTo('stow');nav.ducking=false;place();}
 reset();
 function setLamp(id,want,{rate=4,flick=0}={}){const L=LAMPS[id];if(L){L.want=want;L.rate=rate;L.flick=flick;}}
 function lamps(zone,want,o){for(const L of lampOrder)if(!L.emerg&&(zone==='*'||L.zone===zone||L.id.startsWith(zone)))setLamp(L.id,want,o);}
 return {root,GS,ST,WATER,LAMPS,POOL,nav,cave,zoneAt:(wx,wz,r=0)=>{const q=toLocal(wx,wz);return zoneAt(q.x,q.z,r);},blockers,attach,reset,update,setLamp,lamps,pinTo,pinAt,leaf,lever,pin,crank,grille,cover,southGate,shutter,truck,batches,
  forest,trees:trees.length,mainGates,wheels,local,toLocal,groundAt};
}
