// Chapter Seven: Old Mill Court, and the lane behind the oak that goes to it.
//
// The 1958 plan shows Oak Hollow Drive going on past where the cul-de-sac is now, into a short horseshoe of houses called
// Old Mill Court; the 1974 revision vacates it and keeps the right-of-way for the storm line. What is left in the real
// Oak Hollow is a strip of old broken paving across the corner of the lookout and a hedged lane past the end of the field
// fence, the township's right-of-way, that bends twice and comes out in the field.
//
// Three copies of that lane are built from one function, identical in every hedge, lump and crack:
//   the REAL lane, at the lookout (Oak Hollow's own ground);
//   COPY A, far from Oak Hollow, whose far end comes out at the head of Old Mill Court (and whose near end, past its first
//   bend, is shut by a board fence that the real lane does not have);
//   COPY B, the same lane at the head of the court's other leg (also shut past its first bend).
// All three are turned exactly alike. In the middle stretch of a lane, where both bends hide both ends, a crossing (the
// portal) moves whoever crosses it from one copy to the matching point of another, by a pure translation: the view is the
// same before and after. Nothing is ever built, shown or removed in front of the camera: the court is always there, far
// away, and the lane at the lookout is always the lane.
//
// Old Mill Court: a horseshoe. Leg A runs from copy A's mouth past six houses (the dining house, the house with the green
// door) to a bend round a green, and leg B comes back up past six more to copy B's mouth. Houses of the late fifties
// and sixties, a '59 sedan, a wagon, streetlights, poles and wires, mailboxes, a newspaper, a street sign. Beyond leg A's
// back yards a far row of roofs, and behind them, sometimes, something very large (the giant: a staged partial silhouette,
// not a creature model).
//
// Frames: local x/z of the lane frame (the lane runs +z from its mouth; its middle stretch runs toward -x); both the real
// lane's group and the court's group are turned the same (theta) and only translated. nav: one region object (setRoom)
// that answers for the lookout corner, the real lane and its patch of field, and the whole far region. It can be ridden.
import * as THREE from './three.module.js';
import {groundPoint} from './route.js';
import {streetCoords} from './terrain.js';
import {mat,C7,createBuild,houseShell,periodCar,streetlight,streetLamp,mailbox,utilityPole,trashCan,fenceRun,hedgeRun,yardTree,glassLit,porchGlow,paper} from './chapter7-build.js';
import {createHorrorHouse,createDiningRoom,HH,STAIR,PIC} from './chapter7-interiors.js';
import {createPineForest} from './pine-forest.js';
import {bake,inBox,clamp,damp,smooth,makeShapes} from './chapter6-kit.js';
import {seeded} from './kit.js';

export const LANE={d:1171,lat:21.6};             // the lane's mouth, in Oak Hollow Drive's coordinates (past the field fence's end)
export const REGION={x:1500,z:-1000};             // where copy A's mouth is (far beyond anything Oak Hollow draws)
export const SEG=[[0,0],[0,12],[-8,12],[-8,26]],LW=1.4;// the lane's centreline and half width
export const P1={x:-4,z:12};                      // the portal: the middle of the middle stretch
export const COPY_B={x:-60,z:4};                  // copy B's mouth in the court's frame
export const LEG={A:-8,B:-68},BEND={x:-38,z:118,r:30},ROAD=4.2,COURT={x0:-104,x1:28,z0:24,z1:184};
const HEAD_Z=27;// where the court's roads begin, at the lanes' far mouths

export function createCourt({scene,world,sfx=()=>{}}){
 const K=makeShapes();
 // ---- frames -------------------------------------------------------------------------------------------------------------
 const O=groundPoint(LANE.d,LANE.lat),O2=groundPoint(LANE.d+1,LANE.lat),zx=O2.x-O.x,zz=O2.z-O.z,zl=Math.hypot(zx,zz);
 const TH=Math.atan2(zx/zl,zz/zl),cT=Math.cos(TH),sT=Math.sin(TH);
 const rot=(x,z)=>({x:x*cT+z*sT,z:-x*sT+z*cT}),unrot=(x,z)=>({x:x*cT-z*sT,z:x*sT+z*cT});
 const realW=(x,z)=>{const r=rot(x,z);return {x:O.x+r.x,z:O.z+r.z};},realL=(x,z)=>unrot(x-O.x,z-O.z);
 const regW=(x,z)=>{const r=rot(x,z);return {x:REGION.x+r.x,z:REGION.z+r.z};},regL=(x,z)=>unrot(x-REGION.x,z-REGION.z);
 // a world heading (game convention: forward (sin a, -cos a)) for a direction in the frame
 const headingOf=(dx,dz)=>{const r=rot(dx,dz);return Math.atan2(r.x,-r.z);};
 const frameDir=a=>unrot(Math.sin(a),-Math.cos(a));// a world heading's direction in the frame
 // the real ground (Oak Hollow's own: what nav says there without us)
 const realFloor=(x,z)=>{const s=streetCoords(x,z);return world.groundY(s.d,s.lat);};
 // ---- the lane's floor (sampled once from the real lane; the copies use the same numbers) -------------------------------------
 const LG={x0:-12,z0:-3,n:0.5,nx:33,nz:66};LG.h=new Float32Array(LG.nx*LG.nz);
 for(let j=0;j<LG.nz;j++)for(let i=0;i<LG.nx;i++){const w=realW(LG.x0+i*LG.n,LG.z0+j*LG.n);LG.h[j*LG.nx+i]=realFloor(w.x,w.z);}
 function laneFloor(x,z){const fx=clamp((x-LG.x0)/LG.n,0,LG.nx-1.001),fz=clamp((z-LG.z0)/LG.n,0,LG.nz-1.001),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,H=LG.h,n=LG.nx;
  return (H[j*n+i]*(1-u)+H[j*n+i+1]*u)*(1-v)+(H[(j+1)*n+i]*(1-u)+H[(j+1)*n+i+1]*u)*v;}
 const G0=laneFloor(-8,26.5);// the court's ground: the lanes' far mouths
 // ---- the lane (built three times) --------------------------------------------------------------------------------------
 const inLane=(x,z,r=0)=>(Math.abs(x)<LW-r&&z>-.6&&z<12+LW-r)||(x>-8-LW+r&&x<LW-r&&Math.abs(z-12)<LW-r)||(Math.abs(x+8)<LW-r&&z>12-LW+r&&z<26.6);
 const FENCE_Z=3.2;
 function buildLane(name,{fence=false}={}){const g=new THREE.Group();g.name=name;
  const asphalt=mat(0x3e3c38,{roughness:.95},'roadwear'),grassy=mat(0x4f6436,{roughness:1},'lawn');
  // the old surface: a ribbon over the floor, broken at the edges; grass in its cracks
  const rib=(pts)=>{for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/.5),dx=(x1-x0)/L,dz=(z1-z0)/L;
   for(let k=0;k<n;k++){const u0=k*.5,u1=Math.min(L,u0+.52),xa=x0+dx*u0,za=z0+dz*u0,xb=x0+dx*u1,zb=z0+dz*u1,xm=(xa+xb)/2,zm=(za+zb)/2;
    const ya=laneFloor(xa,za),yb=laneFloor(xb,zb),s=K.slab(g,xm,(ya+yb)/2+.012,zm,u1-u0+.02,.03,LW*2-.15,asphalt,{shadow:false});s.rotation.set(0,-Math.atan2(dz,dx),0);s.rotation.z=Math.atan2(yb-ya,u1-u0);s.rotation.order='YZX';}}};
  rib([[0,-.6],[0,12],[-8,12],[-8,26.6]]);
  const r=seeded(4417);for(let k=0;k<70;k++){let x,z;const a=r();if(a<.3){x=(r()-.5)*2.6;z=r()*12;}else if(a<.6){x=-r()*8;z=12+(r()-.5)*2.6;}else{x=-8+(r()-.5)*2.6;z=12+r()*14;}
   const tuft=K.slab(g,x,laneFloor(x,z)+.05,z,.12+r()*.2,.1+r()*.1,.12+r()*.2,grassy,{shadow:false});tuft.rotation.y=r()*3;}
  // the hedges (privet, overgrown): the outer side, then the inner side of the S
  const hedgeAt=(pts,seed)=>{const hg=new THREE.Group();hedgeRun(hg,pts,{h:3.3,w:1.1,seed,c:0x3a5a2a});hg.traverse(o=>{if(o.isMesh){o.position.y+=laneFloor(o.position.x,o.position.z);}});g.add(hg);};
  hedgeAt([[1.95,-.6],[1.95,13.95],[-6.05,13.95],[-6.05,27]],31);hedgeAt([[-1.95,-.6],[-1.95,10.05],[-9.95,10.05],[-9.95,27]],32);
  // the canopy: overgrown lumps meeting over the lane (the light comes down green and broken)
  const leaf=mat(0x34502a,{roughness:1},'lawn');const cr=seeded(4419);
  for(const [x0,z0,x1,z1] of [[0,0,0,12],[0,12,-8,12],[-8,12,-8,26]]){const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/1.1);for(let k=0;k<=n;k++){const u=k/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;
   for(const s of [-1,1]){if(cr()<.25)continue;const b=new THREE.Mesh(new THREE.IcosahedronGeometry(1+cr()*.5,0),leaf);const px=x+(x0===x1?s*(.6+cr()*.5):0),pz=z+(z0===z1?s*(.6+cr()*.5):0);b.position.set(px,laneFloor(x,z)+3.2+cr()*.5,pz);b.scale.set(1.3,.55,1.3);b.castShadow=true;g.add(b);}}}
  // a township marker post at the mouth; the copies' board fence past the first bend
  {const p=K.slab(g,1.75,laneFloor(1.7,.3)+.6,.3,.1,1.2,.1,mat(0xd8d2b0));void p;const tag=K.slab(g,1.75,laneFloor(1.7,.3)+1.12,.24,.12,.16,.02,mat(0x2a6a3a));void tag;}
  let fenceG=null;if(fence){fenceG=new THREE.Group();fenceG.name='lane-fence';fenceRun(fenceG,[[-1.5,FENCE_Z],[1.5,FENCE_Z]],{h:2.3,style:'board',c:0x7a6a54});fenceG.position.y=laneFloor(0,FENCE_Z);g.add(fenceG);}
  // the ground under it (the copies: their own mound, following the lane down to the court)
  return {g,fenceG};}
 // ---- the real lane, at the lookout ----------------------------------------------------------------------------------------
 const real=new THREE.Group();real.name='chapter7-lookout-lane';real.position.set(O.x,0,O.z);real.rotation.y=TH;
 const realLane=buildLane('lane-real');real.add(realLane.g);
 // the old paving across the corner of the lookout (from the cul-de-sac's edge to the lane): broken, grass through it
 const CON=[[15,-20.2],[0,-.4]];
 {const g=new THREE.Group();g.name='old-court-paving';real.add(g);const m=mat(0x4a4842,{roughness:1},'roadwear'),r=seeded(1958);
  const [a,b]=CON,L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,n=Math.ceil(L/.8);
  for(let k=0;k<n;k++){if(r()<.18)continue;const u=(k+.5)*L/n,x=a[0]+dx*u,z=a[1]+dz*u;const w=realW(x,z);const piece=K.slab(g,x+(r()-.5)*.3,0,z,2.4+r()*.8,.025,.75,m,{shadow:false});piece.position.y=realFloor(w.x,w.z)-.005;piece.rotation.y=-Math.atan2(dz,dx)+Math.PI/2+(r()-.5)*.12;}
  // the old curbstones, here and there in the grass along one side (the court's curb; the clue)
  const curb=mat(0x9a968a,{},'mineral');for(let k=0;k<9;k++){const u=2+k*2.3,x=a[0]+dx*u-dz*1.65,z=a[1]+dz*u+dx*1.65;const w=realW(x,z);const c=K.slab(g,x,0,z,1.1,.16,.18,curb);c.position.y=realFloor(w.x,w.z)+.03;c.rotation.y=-Math.atan2(dz,dx)+(r()-.5)*.15;c.rotation.z=(r()-.5)*.1;}}
 // the patch of field the lane comes out in, and the brush along its edges (its natural limits)
 const FIELD={x0:-30,x1:9,z0:24,z1:58};
 {const g=new THREE.Group();g.name='field-brush';real.add(g);const r=seeded(1974);for(const [pts,seed] of [[[[-30,26],[-30,58],[9,58]],41],[[[9,58],[9,30]],42]]){const hg=new THREE.Group();hedgeRun(hg,pts,{h:1.6,w:1.6,seed,c:0x4a5a30});hg.traverse(o=>{if(o.isMesh){const w=realW(o.position.x,o.position.z);o.position.y+=realFloor(w.x,w.z)-.1;}});g.add(hg);}void r;}
 bake(real);
 // ---- the far region: the court ---------------------------------------------------------------------------------------------
 const court=new THREE.Group();court.name='chapter7-old-mill-court';court.position.set(REGION.x,0,REGION.z);court.rotation.y=TH;
 const copyA=buildLane('lane-copy-a',{fence:true});court.add(copyA.g);
 const copyB=buildLane('lane-copy-b',{fence:true});copyB.g.position.set(COPY_B.x,0,COPY_B.z);court.add(copyB.g);
 const B=createBuild(court);
 // the ground: a big lawn at the court's level, and a mound under each lane copy (they come down to it)
 {const geo=new THREE.CircleGeometry(300,48);geo.rotateX(-Math.PI/2);const m=new THREE.Mesh(geo,mat(C7.lawn,{roughness:1},'lawn'));m.position.set(-38,G0-.02,100);m.receiveShadow=true;m.name='court-ground';court.add(m);
  for(const off of [[0,0],[COPY_B.x,COPY_B.z]]){const geo2=new THREE.PlaneGeometry(26,34,26,34);geo2.rotateX(-Math.PI/2);const p=geo2.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i)-4,z=p.getZ(i)+12;const edge=Math.min(1,Math.max(0,Math.min(x+17,9-x,z+5,29-z))/4);p.setX(i,x);p.setZ(i,z);p.setY(i,G0+(laneFloor(clamp(x,-10,2),clamp(z,0,26))-G0)*smooth(edge)-.06);}
   geo2.computeVertexNormals();const mound=new THREE.Mesh(geo2,mat(C7.lawn,{roughness:1},'lawn'));mound.position.set(off[0],0,off[1]);mound.receiveShadow=true;mound.name='lane-mound';court.add(mound);}}
 // roads, curbs, sidewalks (legs and the bend), driveways
 const asphalt=mat(C7.asphalt,{roughness:.95},'roadwear'),concrete=mat(C7.concrete,{},'mineral'),curbM=mat(0xb0ada4,{},'mineral');
 const strip=(x0,z0,x1,z1,w,y,m,h=.04)=>{const L=Math.hypot(x1-x0,z1-z0);const s=K.slab(court,(x0+x1)/2,y-h/2,(z0+z1)/2,w,h,L,m,{shadow:false});s.rotation.y=-Math.atan2(x1-x0,z1-z0);return s;};
 for(const [x,z0,z1] of [[LEG.A,HEAD_Z,BEND.z],[LEG.B,HEAD_Z+2,BEND.z]]){strip(x,z0,x,z1,ROAD*2,G0+.02,asphalt);for(const s of [-1,1]){strip(x+s*(ROAD+.15),z0,x+s*(ROAD+.15),z1,.3,G0+.13,curbM,.16);strip(x+s*5.6,z0,x+s*5.6,z1,1.25,G0+.07,concrete,.06);}}
 {const n=24;for(let k=0;k<n;k++){const a0=k/n*Math.PI,a1=(k+1)/n*Math.PI;
   // (the bend: leg A at angle 0, BEND.x+r = -8; round through the far side to leg B at angle pi)
   const P=(r,a)=>[BEND.x+Math.cos(a)*r,BEND.z+Math.sin(a)*r];
   const [ax,az]=P(BEND.r,a0),[bx,bz]=P(BEND.r,a1);strip(ax,az,bx,bz,ROAD*2,G0+.02,asphalt).scale.z=1.04;
   for(const s of [-1,1]){const [cx0,cz0]=P(BEND.r+s*(ROAD+.15),a0),[cx1,cz1]=P(BEND.r+s*(ROAD+.15),a1);strip(cx0,cz0,cx1,cz1,.3,G0+.13,curbM,.16).scale.z=1.05;
    const [wx0,wz0]=P(BEND.r+s*5.6,a0),[wx1,wz1]=P(BEND.r+s*5.6,a1);strip(wx0,wz0,wx1,wz1,1.25,G0+.07,concrete,.06).scale.z=1.05;}}}
 // the heads of the two legs: a rounded end of paving to the lane mouth
 for(const x of [LEG.A,LEG.B]){strip(x,HEAD_Z-3,x,HEAD_Z+.5,LW*2+.4,G0+.015,asphalt);}
 // ---- the houses ----------------------------------------------------------------------------------------------------------------
 // each: centre (frame), the way its front faces (unit), the shell's options; front yards to the sidewalk, driveways to garages
 const facing=(fx,fz)=>Math.atan2(-fx,-fz);
 const LOTS=[
  {id:'a1',x:10,z:42,f:[-1,0],o:{w:12,d:8.6,wall:0xd8cba8,roof:0x5a4a3e,door:0x6a3a2a,garage:{side:1,w:3.8},lit:.5,seed:11,shutters:0x3a4a3a}},
  {id:'dining',x:10,z:68,f:[-1,0],o:{w:10.5,d:8.6,wall:0xa9b8b0,roof:0x40454a,door:0x8a2a22,lit:.7,seed:12,windows:[[-2.6]],porch:{w:2.6,d:1.6},doorX:-.9,F:.5}},
  {id:'a3',x:10,z:96,f:[-1,0],o:{w:10,d:8.6,stories:1,wall:0xe0dccd,roof:0x4a3a32,door:0x2a3a5a,pitch:.75,chimney:-1,lit:.3,seed:13}},
  {id:'a4',x:-26,z:44,f:[1,0],o:{w:11,d:8.8,stories:2,h:2.6,wall:0xc9a48a,roof:0x3a3a3c,door:0x3a2a1a,garage:{side:-1,w:3.6},lit:.4,seed:14}},
  {id:'a5',x:-26,z:70,f:[1,0],o:{w:12,d:8.6,wall:0x9fb3c2,roof:0x4a4a4c,door:0xd8d2c0,lit:.6,seed:15,shutters:0x2a3a4a}},
  {id:'green',x:-26,z:96,f:[1,0],horror:true},
  {id:'b1',x:-50,z:44,f:[-1,0],o:{w:11,d:8.6,wall:0xb8c4b0,roof:0x45484a,lit:.5,seed:21,garage:{side:-1,w:3.6}}},
  {id:'b2',x:-50,z:72,f:[-1,0],o:{w:10,d:8.6,stories:2,h:2.6,wall:0xd6d0c0,roof:0x3e3a36,lit:.35,seed:22,shutters:0x5a2a2a}},
  {id:'b3',x:-50,z:98,f:[-1,0],o:{w:12,d:8.6,wall:0xc4b49a,roof:0x52463a,lit:.6,seed:23}},
  {id:'b4',x:-86,z:42,f:[1,0],o:{w:11,d:8.6,wall:0xa89c86,roof:0x40403f,lit:.4,seed:24,garage:{side:1,w:3.6}}},
  {id:'b5',x:-86,z:70,f:[1,0],o:{w:10.5,d:8.6,wall:0xe0ddd0,roof:0x4a4038,lit:.55,seed:25,pitch:.7}},
  {id:'b6',x:-86,z:98,f:[1,0],o:{w:12,d:8.6,stories:2,h:2.6,wall:0x9aa5a0,roof:0x3a3f44,lit:.3,seed:26}},
 ];
 for(const [k,a] of [[0,.7],[1,Math.PI/2],[2,Math.PI-.7]]){const x=BEND.x+Math.cos(a)*49,z=BEND.z+Math.sin(a)*49;const fx=BEND.x-x,fz=BEND.z-z,l=Math.hypot(fx,fz);LOTS.push({id:'c'+(k+1),x,z,f:[fx/l,fz/l],o:{w:11,d:8.6,wall:[0xcfc0a0,0xb4beb8,0xd8c0b0][k],roof:[0x4a4a4c,0x3a3a3c,0x564840][k],lit:[.4,.6,.3][k],seed:31+k,garage:k===1?{side:1,w:3.6}:null}});}
 const houses={},solids=[],houseBoxes=[];
 for(const L of LOTS){const a=facing(L.f[0],L.f[1]);L.a=a;
  if(L.horror){continue;}
  const p=houseShell(L.o);p.g.position.set(L.x,G0,L.z);p.g.rotation.y=a;court.add(p.g);houses[L.id]={...L,parts:p};
  const gw=L.o.garage?(L.o.garage.w||3.6):0,gs=L.o.garage?.side||0;houseBoxes.push({x:L.x,z:L.z,a:-a,hw:p.W/2+(gw?gw/2:0)+.05,hd:p.D/2+.05,ox:gs*gw/2});
  // a front walk and a driveway; a mailbox by the walk
  const fw=(u,v)=>({x:L.x+Math.cos(a)*u+Math.sin(a)*v,z:L.z-Math.sin(a)*u+Math.cos(a)*v});
  const dw=fw(p.doorX,-p.D/2-1.2),road=fw(p.doorX,-p.D/2-6.6);strip(dw.x,dw.z,road.x,road.z,1.1,G0+.05,concrete,.04);
  if(gw){const g0=fw(gs*(p.W/2+gw/2),-p.D*.425-.2),g1=fw(gs*(p.W/2+gw/2),-p.D/2-7.6);strip(g0.x,g0.z,g1.x,g1.z,gw-.3,G0+.04,concrete,.04);}
  const mb=mailbox({c:[0x2a2a2c,0x3a5a3a,0x5a2a2a][L.o.seed%3]}),mq=fw(p.doorX+1.6,-p.D/2-6.9);mb.position.set(mq.x,G0,mq.z);mb.rotation.y=a;court.add(mb);solids.push({x:mq.x,z:mq.z,hw:.15,hd:.25,a:-a});}
 // ---- the house with the green door (its own interior) ----------------------------------------------------------------------------
 const GL=LOTS.find(l=>l.horror),HG=createHorrorHouse({wallpaper:paper(256,256,(g,w,h)=>{g.fillStyle='#b9a983';g.fillRect(0,0,w,h);g.fillStyle='rgba(90,70,40,.25)';for(let y=0;y<h;y+=32)for(let x=(y/32)%2*16;x<w;x+=32){g.beginPath();g.ellipse(x,y,6,10,0,0,7);g.fill();}})});
 {const sh=houseShell({w:HH.W,d:HH.D,stories:2,h:2.9,floorY:HH.F,wall:0xb9b4a0,roof:0x3a3634,door:0x2f5a3a,skip:['body','front'],lit:0,seed:50,porch:{w:3.4,d:1.9},doorX:0,pitch:.5});
  sh.g.position.set(GL.x,G0,GL.z);sh.g.rotation.y=GL.a;court.add(sh.g);HG.g.position.set(GL.x,G0,GL.z);HG.g.rotation.y=GL.a;court.add(HG.g);houses.green={...GL,parts:sh,inside:HG};
  // (the shell's own windows sit on the real walls: dark glass; the porch roof is the shell's)
  const fw=(u,v)=>({x:GL.x+Math.cos(GL.a)*u+Math.sin(GL.a)*v,z:GL.z-Math.sin(GL.a)*u+Math.cos(GL.a)*v});const dw=fw(0,-HH.D/2-2.2),road=fw(0,-HH.D/2-6.8);strip(dw.x,dw.z,road.x,road.z,1.1,G0+.05,concrete,.04);
  const mb=mailbox({c:0x2a3a2a}),mq=fw(1.6,-HH.D/2-6.9);mb.position.set(mq.x,G0,mq.z);mb.rotation.y=GL.a;court.add(mb);solids.push({x:mq.x,z:mq.z,hw:.15,hd:.25,a:-GL.a});}
 // house frame <-> court frame for the green door house
 const hToC=(hx,hz)=>({x:GL.x+Math.cos(GL.a)*hx+Math.sin(GL.a)*hz,z:GL.z-Math.sin(GL.a)*hx+Math.cos(GL.a)*hz});
 const cToH=(x,z)=>{const dx=x-GL.x,dz=z-GL.z,c=Math.cos(GL.a),s=Math.sin(GL.a);return {x:dx*c-dz*s,z:dx*s+dz*c};};
 // ---- the dining room (in the dining house's frame) ---------------------------------------------------------------------------------
 const DL=houses.dining,dining=createDiningRoom({D:DL.parts.D,F:DL.parts.F});{dining.g.position.set(DL.x,G0,DL.z);dining.g.rotation.y=DL.a;court.add(dining.g);}
 // (its shell is solid: open the shell's body where the room is, by putting the room in front of it: the shell's front wall
 //  section over the room is replaced by the picture window and its surround)
 {const P=DL.parts;const body=P.g.getObjectByName('walls');if(body){body.visible=false;// the dining house is built of walls instead of a block
   const wall=mat(DL.o.wall,{},'housepaint'),W=P.W,D=P.D,F=P.F,top=F+P.H,G=P.g,b2=createBuild(G);
   b2.wall([-W/2,-D/2],[W/2,-D/2],{y0:F,y1:top,t:.14,m:wall,holes:[[W/2+P.doorX-.5,W/2+P.doorX+.5,0,2.1],[W/2+PIC.x-PIC.w/2,W/2+PIC.x+PIC.w/2,PIC.sill,PIC.sill+PIC.h],[W/2-2.6-.55,W/2-2.6+.55,.9,2.15]]});
   b2.wall([W/2,-D/2],[W/2,D/2],{y0:F,y1:top,t:.14,m:wall});b2.wall([W/2,D/2],[-W/2,D/2],{y0:F,y1:top,t:.14,m:wall});b2.wall([-W/2,D/2],[-W/2,-D/2],{y0:F,y1:top,t:.14,m:wall});
   // the rest of the inside is dark: a box filling the house behind and beside the dining room
   K.slab(G,-W/2+((PIC.x-2.4)-(-W/2))/2,F+P.H/2,0,(PIC.x-2.4)-(-W/2)-.2,P.H-.1,D-.3,mat(0x0e0e10),{name:'dark-inside'});K.slab(G,PIC.x,F+P.H/2,(-D/2+4.4+D/2)/2,4.8,P.H-.1,D/2-4.4-.2+D/2-.15,mat(0x0e0e10),{name:'dark-inside'});
   K.slab(G,(PIC.x+2.4+W/2)/2,F+P.H/2,0,W/2-(PIC.x+2.4)-.2,P.H-.1,D-.3,mat(0x0e0e10),{name:'dark-inside'});
   K.slab(G,0,top+.02,0,W,.06,D,mat(0xd8d0bc),{name:'ceiling'});}}
 // ---- cars, street furniture, trees ------------------------------------------------------------------------------------------------
 const cars={};const carAt=(id,style,x,z,a,o)=>{const c=periodCar(style,o);c.position.set(x,G0,z);c.rotation.y=a;court.add(c);const s=c.userData.size;solids.push({x,z,hw:s.W/2+.05,hd:s.L/2+.05,a:-a,car:id});cars[id]={g:c,x,z,a};return c;};
 carAt('fifty9','59',3.6,41.2,facing(1,0),{body:0x6a9a96,roofC:0xeee8d6});// in a1's driveway, nose to the garage: the bikes are by the lane, just up the street
 carAt('wagon','wagon',-58.6,76.4,facing(-1,0),{body:0x7a5a3a,roofC:0x7a5a3a});carAt('sedan','86',-16.4,48.4,facing(1,0),{body:0x8a8a90,roofC:0x8a8a90});
 carAt('fifty9b','59',-36,159,facing(0,-1),{body:0xc8b48a,roofC:0x6a2a26});
 const lamps=[];const lightAt=(x,z,a)=>{const s=streetlight({});s.position.set(x,G0,z);s.rotation.y=a;court.add(s);solids.push({x,z,hw:.16,hd:.16,a:0});lamps.push({g:s,x,z,a});return s;};
 for(const [x,z,f] of [[LEG.A+5.0,34,-1],[LEG.A-5.0,58,1],[LEG.A+5.0,82,-1],[LEG.A-5.0,108,1],[LEG.B-5.0,36,1],[LEG.B+5.0,60,-1],[LEG.B-5.0,86,1],[LEG.B+5.0,110,-1]])lightAt(x,z,facing(f,0)+Math.PI/2);
 for(const a of [.6,Math.PI-.6]){const x=BEND.x+Math.cos(a)*(BEND.r+5),z=BEND.z+Math.sin(a)*(BEND.r+5);lightAt(x,z,Math.atan2(BEND.x-x,BEND.z-z)+Math.PI);}
 const poles=[];for(const [x,z] of [[LEG.A+6.6,48],[LEG.A+6.6,76],[LEG.A+6.6,104],[LEG.B-6.6,50],[LEG.B-6.6,80],[LEG.B-6.6,106]]){const p=utilityPole({});p.position.set(x,G0,z);court.add(p);solids.push({x,z,hw:.18,hd:.18,a:0});poles.push({g:p,x,z});}
 // the wires between the poles (each leg), sagging
 {const wm=mat(0x1a1a1a);for(const leg of [[0,1,2],[3,4,5]])for(let i=0;i<2;i++){const a=poles[leg[i]],b=poles[leg[i+1]];for(const dx of [-.9,0,.9]){const pts=[];for(let k=0;k<=12;k++){const u=k/12;pts.push(new THREE.Vector3(a.x+dx+(b.x-a.x)*u,G0+8.5-Math.sin(u*Math.PI)*.7,a.z+(b.z-a.z)*u));}
   const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.012,4,false);court.add(new THREE.Mesh(geo,wm));}}}
 const cans=[];for(const [x,z] of [[LEG.A+4.9,50.5],[LEG.A-4.9,64],[LEG.B+4.9,66],[LEG.B-4.9,47]]){const c=trashCan({});c.position.set(x,G0,z);court.add(c);solids.push({x,z,hw:.3,hd:.3,a:0});cans.push(c);}
 // the street sign at the head of leg A: OLD MILL CT
 {const tex=paper(256,64,(g,w,h)=>{g.fillStyle='#1f5a3a';g.fillRect(0,0,w,h);g.strokeStyle='#e8e8e0';g.lineWidth=3;g.strokeRect(4,4,w-8,h-8);g.fillStyle='#e8e8e0';g.font='bold 34px Arial';g.textAlign='center';g.fillText('OLD MILL CT',w/2,45);});
  const s=new THREE.Group();s.name='street-sign';K.cyl(s,0,1.4,0,.04,2.8,mat(0x8a8a86,{metalness:.5}));for(const a of [0,Math.PI/2]){const b=K.slab(s,0,2.75,0,.9,.22,.02,new THREE.MeshStandardMaterial({map:tex,color:tex?0xffffff:0x1f5a3a,roughness:.5}));b.rotation.y=a;}
  s.position.set(LEG.A+5.3,G0,HEAD_Z+1.8);court.add(s);solids.push({x:LEG.A+5.3,z:HEAD_Z+1.8,hw:.1,hd:.1,a:0});}
 // yard trees
 const tr=seeded(707);for(const [x,z,h] of [[18,55,7.5],[19,84,8],[-34,57,7],[-35,84,8.5],[-43,62,7.2],[-42,88,7.6],[-94,56,8],[-95,84,7],[-38,124,9],[-12,140,7],[-64,140,7.4],[21,30,6.5],[-97,32,7]]){
  const t=yardTree({h,seed:(tr()*1e6)|0});t.position.set(x,G0,z);court.add(t);solids.push({x,z,hw:.3,hd:.3,a:0});}
 // fences: back fences down the middle of the inner block, a few side fences; hedges round the whole (its natural limits)
 const walls=[];const fenceW=(pts,o)=>{const g=new THREE.Group();fenceRun(g,pts,o);g.position.y=G0;court.add(g);for(let i=0;i<pts.length-1;i++)walls.push({ax:pts[i][0],az:pts[i][1],bx:pts[i+1][0],bz:pts[i+1][1],t:.12,h:o.h||1.2,fence:true});};
 fenceW([[-38,32],[-38,102]],{h:1.7,style:'board',c:0x8a7a62});
 for(const z of [57,83])fenceW([[-31,z],[-38,z]],{h:1.2,style:'picket'});for(const z of [58,85])fenceW([[-38,z],[-45,z]],{h:1.2,style:'picket',c:0xd8d4c4});
 const hedges=[[[COURT.x0,COURT.z0],[COURT.x0,COURT.z1],[COURT.x1,COURT.z1],[COURT.x1,COURT.z0],[LEG.A+LW+.6,COURT.z0]],[[LEG.A-LW-.6,COURT.z0],[LEG.B+LW+.6,COURT.z0]],[[LEG.B-LW-.6,COURT.z0],[COURT.x0,COURT.z0]]];
 for(const [i,pts] of hedges.entries()){const g=new THREE.Group();hedgeRun(g,pts,{h:3.0,w:1.4,seed:60+i});g.position.y=G0;court.add(g);for(let k=0;k<pts.length-1;k++)walls.push({ax:pts[k][0],az:pts[k][1],bx:pts[k+1][0],bz:pts[k+1][1],t:1.3,h:3});}
 // (the lanes' own hedges where they come out past the head's hedge into the court)
 for(const [x,z1] of [[-6.05,27],[-9.95,27],[COPY_B.x-6.05,COPY_B.z+27],[COPY_B.x-9.95,COPY_B.z+27]])walls.push({ax:x,az:COURT.z0,bx:x,bz:z1,t:1.1,h:3.3});
 // the green in the bend: a big tree, a bench
 // ---- the far row and the giant ------------------------------------------------------------------------------------------------
 const far=[];for(const [z,k] of [[50,0],[82,1],[112,2],[140,3]]){const p=houseShell({w:10,d:8.6,stories:k===1?2:1,h:2.6,wall:[0xb8b0a0,0xa8b0a8,0xc0b098,0xb0a898][k],roof:0x3a3a3c,lit:.15,seed:80+k});p.g.position.set(46,G0,z);p.g.rotation.y=facing(-1,0);court.add(p.g);far.push(p);}
 const giant=new THREE.Group();giant.name='chapter7-the-large-thing';court.add(giant);giant.visible=false;
 const gm=new THREE.MeshStandardMaterial({color:0x14110f,roughness:.55,metalness:.05});gm.name='c7-large-thing';
 {// its back: a long rounded mass behind the far row, mostly below the roofs
  const back=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),gm);back.scale.set(22,15,44);back.position.set(92,G0-6,96);back.name='back';giant.add(back);
  const ridge=new THREE.Group();ridge.name='ridge';giant.add(ridge);for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),gm);r.scale.set(3.2,4.4+Math.sin(k*1.7)*1.2,4);r.position.set(84+Math.sin(k)*2,G0+7.5+Math.sin(k*.9)*1.2,62+k*8.5);ridge.add(r);}
  // a limb: three long segments, jointed, that unfold over the roofs and come down on one of them
  const limb=new THREE.Group();limb.name='limb';limb.position.set(78,G0+4,96);giant.add(limb);const segs=[];let parent=limb;
  for(let k=0;k<3;k++){const j=new THREE.Group();parent.add(j);if(k)j.position.y=16;const m=new THREE.Mesh(new THREE.CylinderGeometry(1.5-k*.35,2.0-k*.35,16,10),gm);m.position.y=8;j.add(m);
   const knob=new THREE.Mesh(new THREE.SphereGeometry(2.1-k*.4,12,10),gm);knob.position.y=16;j.add(knob);segs.push(j);parent=j;}
  giant.userData={back,ridge,limb,segs};}
 // the far house it leans on (its roof is its own group: it tilts, the chimney goes)
 const pressed=far[1];
 // ---- the lights --------------------------------------------------------------------------------------------------------------
 // glow sprites for the streetlights and porch lights (their brightness: dusk); the police lights seen over copy B's hedge
 const glowTex=paper(64,64,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
 const sprite=(c,s)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:c,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,fog:true}));sp.scale.setScalar(s);return sp;};
 const glows=[];for(const L of lamps){const sp=sprite(0xffd8a0,3.2);const q=new THREE.Vector3(L.g.userData.lamp.x,L.g.userData.lamp.y-.05,0);L.g.add(sp);sp.position.copy(q);glows.push(sp);}
 for(const h of Object.values(houses)){const b=h.parts?.porchLight;if(!b)continue;const sp=sprite(0xffe0b0,1.4);sp.position.copy(b.position);b.parent.add(sp);glows.push(sp);}
 const police=new THREE.Group();police.name='police-glow-past-the-hedge';copyB.g.add(police);police.position.set(0,laneFloor(0,1)+2.2,1);const pR=sprite(0xff3a2a,7),pB=sprite(0x3a6aff,7);pR.position.x=-.6;pB.position.x=.6;police.add(pR,pB);police.visible=false;
 // ---- the forest round it all (Chapter Five's kit) ----------------------------------------------------------------------------------------
 const fr=seeded(7417),trees=[];for(let i=0;i<1200&&trees.length<300;i++){const a=fr()*Math.PI*2,d=120+fr()*110,x=-38+Math.cos(a)*d,z=100+Math.sin(a)*d*.95;
  if(x>60&&x<135&&z>40&&z<160)continue;trees.push({e:x,n:z,kind:fr()<.4?'pine':'oak',seed:(fr()*1e6)|0,size:.9+fr()*.5});}
 const forestG=new THREE.Group();forestG.name='court-forest';court.add(forestG);const forest=createPineForest(trees,forestG,t=>({x:t.e,y:G0-.1,z:t.n}));
 // ---- bake the static court -----------------------------------------------------------------------------------------------------
 const keepC=new Set([giant,police,dining.g,HG.g,forestG,copyA.fenceG,copyB.fenceG,pressed.g,...Object.values(cars).map(c=>c.g),...lamps.map(l=>l.g),...poles.map(p=>p.g),...cans,...glows]);
 for(const h of Object.values(houses))if(h.parts?.g)keepC.add(h.parts.g);
 bake(court,keepC);for(const h of Object.values(houses))if(h.parts?.g&&h.id!=='green'&&h.id!=='dining')bake(h.parts.g,new Set([h.parts.roof,h.parts.porchLight]));
 // ---- nav ---------------------------------------------------------------------------------------------------------------------------------
 const segHit=(w,x,z,r)=>{const dx=w.bx-w.ax,dz=w.bz-w.az,l=dx*dx+dz*dz||1,u=clamp(((x-w.ax)*dx+(z-w.az)*dz)/l,0,1);return Math.hypot(x-w.ax-dx*u,z-w.az-dz*u)<r+w.t/2;};
 const houseHit=(x,z,r)=>houseBoxes.some(b=>{const c=Math.cos(b.a),s=Math.sin(b.a),dx=x-b.x,dz=z-b.z,lx=dx*c+dz*s-(b.ox||0),lz=-dx*s+dz*c;return Math.abs(lx)<b.hw+r&&Math.abs(lz)<b.hd+r;});
 const ST={level:'g',porch:true,fenceA:true,fenceB:true,portalA:false,portalB:false,lit:0,dusk:0,giant:0};
 const inHouseBox=(x,z,pad=0)=>{const q=cToH(x,z);return Math.abs(q.x)<HH.W/2+pad&&Math.abs(q.z)<HH.D/2+pad;};
 // the green-door house's porch and front step: walkable, rising to the floor; its doorway when the door is open
 const porch=(q)=>q.x>-1.7&&q.x<1.7&&q.z<-HH.D/2&&q.z>-HH.D/2-2.0;
 const porchY=(q)=>G0+HH.F*clamp((q.z+HH.D/2+2.0)/.7,0,1);
 const doorway=(q,r)=>Math.abs(q.x)<.47-Math.min(r,.2)&&q.z>-HH.D/2-.3&&q.z<-HH.D/2+.35;
 function laneWalk(x,z,r,{fenced=false}={}){if(!inLane(x,z,Math.min(r,.25)))return false;if(fenced&&z<FENCE_Z+.08+r&&Math.abs(x)<LW+.2)return false;return true;}
 function courtWalk(x,z,r,{ride=false}={}){
  if(x<COURT.x0+.7+r||x>COURT.x1-.7-r||z>COURT.z1-.7-r)return false;
  if(z<COURT.z0+.7+r){// the head: only into the two lane mouths
   const a=inLane(x,z,r),b=inLane(x-COPY_B.x,z-COPY_B.z,r);return a||b;}
  // the green-door house: inside it, its own floors; its porch and doorway
  if(inHouseBox(x,z,1.2)){const q=cToH(x,z);if(porch(q)&&!(Math.abs(q.x)<HH.W/2&&q.z>-HH.D/2+.05))return !ride;
   if(doorway(q,r))return !ride&&HG.doors.front.open>.55;
   if(Math.abs(q.x)<HH.W/2+.1&&Math.abs(q.z)<HH.D/2+.1)return !ride&&HG.walkable(q.x,q.z,r,ST.level);
   if(Math.abs(q.x)<HH.W/2+.2+r&&Math.abs(q.z)<HH.D/2+.2+r)return false;}
  if(houseHit(x,z,r))return false;
  for(const s of solids)if(inBox(x,z,s,ride?r*.6:r))return false;
  for(const w of walls)if(segHit(w,x,z,r))return false;
  return true;}
 const inRegion=(q)=>q.x>COURT.x0-14&&q.x<COURT.x1+4&&q.z>-4&&q.z<COURT.z1+4;
 const inRealArea=(q)=>{if(inLane(q.x,q.z))return true;if(q.x>FIELD.x0-1&&q.x<FIELD.x1+1&&q.z>FIELD.z0&&q.z<FIELD.z1+1)return true;
  // the old paving across the lookout's corner: a band 4 m wide from the cul-de-sac's edge to the lane
  const [a,b]=CON,dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,u=clamp(((q.x-a[0])*dx+(q.z-a[1])*dz)/l,0,1);return Math.hypot(q.x-a[0]-dx*u,q.z-a[1]-dz*u)<2.2&&u>0&&u<=1;};
 const nav={kind:'chapter7-region',
  inside(x,z){if(!ST.active)return false;const q=regL(x,z);if(inRegion(q))return true;const r=realL(x,z);return inRealArea(r);},
  walkable(x,z,r=.28){const q=regL(x,z);if(inRegion(q)){if(inLane(q.x,q.z))return laneWalk(q.x,q.z,r,{fenced:ST.fenceA});const b={x:q.x-COPY_B.x,z:q.z-COPY_B.z};if(inLane(b.x,b.z))return laneWalk(b.x,b.z,r,{fenced:ST.fenceB});return courtWalk(q.x,q.z,r);}
   const p=realL(x,z);if(inLane(p.x,p.z))return laneWalk(p.x,p.z,r);if(p.x>FIELD.x0&&p.x<FIELD.x1&&p.z>FIELD.z0&&p.z<FIELD.z1)return p.x>FIELD.x0+.8+r&&p.x<FIELD.x1-.8-r&&p.z<FIELD.z1-.8-r;
   return inRealArea(p)&&realOpen(x,z,r);},
  rideable(x,z,{r=.3}={}){const q=regL(x,z);if(inRegion(q)){if(inLane(q.x,q.z))return laneWalk(q.x,q.z,r,{fenced:ST.fenceA});const b={x:q.x-COPY_B.x,z:q.z-COPY_B.z};if(inLane(b.x,b.z))return laneWalk(b.x,b.z,r,{fenced:ST.fenceB});return courtWalk(q.x,q.z,r,{ride:true});}
   const p=realL(x,z);if(inLane(p.x,p.z))return laneWalk(p.x,p.z,r);if(p.x>FIELD.x0&&p.x<FIELD.x1&&p.z>FIELD.z0&&p.z<FIELD.z1)return p.x>FIELD.x0+.8+r&&p.x<FIELD.x1-.8-r&&p.z<FIELD.z1-.8-r;return inRealArea(p)&&realOpen(x,z,r);},
  floorAt(x,z){const q=regL(x,z);if(inRegion(q)){if(inLane(q.x,q.z,-.8))return laneFloor(q.x,q.z);const b={x:q.x-COPY_B.x,z:q.z-COPY_B.z};if(inLane(b.x,b.z,-.8))return laneFloor(b.x,b.z);
    if(inHouseBox(q.x,q.z,1.2)){const h=cToH(q.x,q.z);if(porch(h)&&!(Math.abs(h.x)<HH.W/2&&h.z>-HH.D/2+.05))return porchY(h);if(Math.abs(h.x)<HH.W/2+.1&&Math.abs(h.z)<HH.D/2+.1)return G0+HG.floorAt(h.x,h.z,ST.level);}
    return G0;}
   const p=realL(x,z);if(inLane(p.x,p.z,-.8))return laneFloor(p.x,p.z);return realFloor(x,z);},
  surface(x,z){const q=regL(x,z);if(inRegion(q)){if(inHouseBox(q.x,q.z,.2))return 'floor';const onRoad=Math.abs(q.x-LEG.A)<ROAD+2.2||Math.abs(q.x-LEG.B)<ROAD+2.2||(q.z>BEND.z&&Math.abs(Math.hypot(q.x-BEND.x,q.z-BEND.z)-BEND.r)<ROAD+2.2);return onRoad?'asphalt':'grass';}
   const p=realL(x,z);return inLane(p.x,p.z)?'asphalt':'grass';},
  // the street's own direction here (the bike settles along it): the legs run along z, the bend round its centre, a lane along its stretch
  headingAt(x,z){const q=regL(x,z),inR=inRegion(q),p=inR?q:realL(x,z);let dx=0,dz=1;
   if(inR&&q.z>BEND.z&&!inLane(q.x,q.z)){const rx=q.x-BEND.x,rz=q.z-BEND.z;dx=-rz;dz=rx;}
   else if(inLane(p.x,p.z)||inLane(p.x-COPY_B.x,p.z-COPY_B.z)){const l=inLane(p.x,p.z)?p:{x:p.x-COPY_B.x,z:p.z-COPY_B.z};if(Math.abs(l.z-12)<LW&&l.x<-.5&&l.x>-7.5){dx=1;dz=0;}}
   return headingOf(dx,dz);},
  heading:headingOf(0,1),ducking:false};
 // (the real side: our band and lane are over Oak Hollow's own lookout; what stands there is still Oak Hollow's)
 let baseNav=null;const realOpen=(x,z,r)=>{if(!baseNav)return true;return !baseNav.nearFence?.(x,z,r);};
 function setBaseNav(n){baseNav=n;}
 // ---- the portal -----------------------------------------------------------------------------------------------------------------
 // a move from (x0,z0) to (x1,z1) in the world: if it crosses a live portal in its direction, the translation to apply
 const DA=(()=>{const a=regW(0,0),b=realW(0,0);return {x:a.x-b.x,z:a.z-b.z};})();// real -> copy A
 const DB=(()=>{const a=realW(0,0),b=regW(COPY_B.x,COPY_B.z);return {x:a.x-b.x,z:a.z-b.z};})();// copy B -> real
 function portal(x0,z0,x1,z1){
  if(ST.portalA){const a=realL(x0,z0),b=realL(x1,z1);if(Math.abs(b.z-P1.z)<LW&&a.x>P1.x&&b.x<=P1.x&&inLane(b.x,b.z))return {to:'A',dx:DA.x,dz:DA.z};}
  if(ST.portalB){const a=regL(x0,z0),b=regL(x1,z1),la={x:a.x-COPY_B.x,z:a.z-COPY_B.z},lb={x:b.x-COPY_B.x,z:b.z-COPY_B.z};if(Math.abs(lb.z-P1.z)<LW&&la.x<P1.x&&lb.x>=P1.x&&inLane(lb.x,lb.z))return {to:'real',dx:DB.x,dz:DB.z};}
  return null;}
 // ---- every frame: the lights at dusk, the giant, the police glow, the house's level -----------------------------------------------------
 const GI={t:-1,stage:'off'};
 function giantStart(){GI.t=0;GI.stage='rise';giant.visible=true;}
 function updateGiant(dt){if(GI.t<0)return;GI.t+=dt;const t=GI.t,U=giant.userData,s=smooth;
  // 0-4 s: the back rises a little behind the roofs; 4-10: the limb unfolds over them and comes down on the far house; 10-13 it
  // presses (the roof gives, the pole leans); 13-18 it lifts away and everything settles lower than it was; 18+: only the back, sinking
  U.back.position.y=G0-6+7*s(t/4)-5*s((t-15)/6);U.ridge.position.y=-1+3*s(t/4)-4*s((t-15)/6);
  const unfold=s((t-3.5)/5)*(1-s((t-13)/4));U.limb.rotation.z=.35+unfold*.95;U.limb.rotation.x=-.2*unfold;U.segs[1].rotation.z=-.4-unfold*.9;U.segs[2].rotation.z=-.5-unfold*.6;U.limb.position.y=G0+4-10*s((t-15)/5);
  const press=s((t-8.5)/1.6)*(1-s((t-13)/2))+.35*s((t-12)/1);const roof=pressed.roof;if(roof){roof.rotation.z=-.09*press;roof.position.y=pressed.top-.4*press;}
  if(t>9.2&&!GI.creaked){GI.creaked=true;sfx('c6Crack',regWorld(46,82,G0+6),{gain:.9});}
  const pole=poles[1];if(pole){pole.g.rotation.z=.12*s((t-9)/1.8);}
  if(t>20){giant.visible=false;GI.stage='done';}}
 function regWorld(x,z,y){const w=regW(x,z);return {x:w.x,y,z:w.z};}
 let polT=0;
 function update(dt,{camera=null,dusk=0}={}){ST.dusk=dusk;streetLamp.emissiveIntensity=2.4*smooth((dusk-.15)/.5);glassLit.emissiveIntensity=1.1*smooth((dusk-.05)/.6);porchGlow.emissiveIntensity=2*smooth((dusk-.2)/.4);
  for(const g of glows)g.material.opacity=.65*smooth((dusk-.25)/.5);
  if(police.visible){polT+=dt;const k=Math.floor(polT*3.2)%2;pR.material.opacity=k?.95:.15;pB.material.opacity=k?.15:.95;}
  updateGiant(dt);forest.update(dt,camera);}
 function setActive(on){ST.active=on;}
 function attach(on){for(const g of [real,court]){if(on&&!g.parent)scene.add(g);else if(!on&&g.parent)g.removeFromParent();}ST.active=on;}
 function reset(){Object.assign(ST,{level:'g',porch:true,fenceA:true,fenceB:true,portalA:false,portalB:false,dusk:0,active:false});HG.reset();GI.t=-1;GI.stage='off';GI.creaked=false;giant.visible=false;police.visible=false;
  const roof=pressed.roof;if(roof){roof.rotation.z=0;roof.position.y=pressed.top;}const pole=poles[1];if(pole)pole.g.rotation.z=0;
  for(const c of cans)c.rotation.set(0,0,0);attach(false);}
 // ---- spots (world points) the chapter stages things at -----------------------------------------------------------------------------
 const W3=(x,z,y=null)=>{const w=regW(x,z);return {x:w.x,y:y??G0,z:w.z};};const R3=(x,z)=>{const w=realW(x,z);return {x:w.x,y:realFloor(w.x,w.z),z:w.z};};
 const L3=(x,z,copy)=>copy==='real'?{...R3(x,z),y:laneFloor(x,z)}:copy==='B'?W3(x+COPY_B.x,z+COPY_B.z,laneFloor(x,z)):W3(x,z,laneFloor(x,z));
 const H3=(hx,hz,y=null,lv='g')=>{const c=hToC(hx,hz);return W3(c.x,c.z,y??G0+HG.floorAt(hx,hz,lv));};
 const SPOT={
  // the lookout side
  cul:R3(15.4,-20.6),mouth:R3(0,-.8),inLane:R3(0,3),bend1:R3(0,12),fieldOut:R3(-8,30),fieldFar:R3(-14,48),reyesField:R3(-12,40),curb:R3(9.6,-11.6),post:R3(1.75,.3),
  // the court
  headA:W3(LEG.A,30),bikes:[W3(LEG.A+4.4,33.2),W3(LEG.A+4.4,34.9)],bikeA:headingOf(0,1),sign:W3(LEG.A+5.3,HEAD_Z+1.8),
  fifty9:W3(3.6,41.2),behindCar:W3(6.6,38.6),newspaper:W3(3.4,63.2),diningWalk:W3(2.2,68),diningWindow:W3(10-4.3-.05,68-PIC.x,G0+DL.parts.F+PIC.sill+PIC.h/2),diningLook:W3(2.6,65.4),
  greenRoad:W3(LEG.A,96),greenWalk:W3(-17,96),greenDoor:H3(0,-HH.D/2-.6,G0+HH.F),porchRoof:H3(0,-HH.D/2-1.0,G0+HH.F+2.55),porchDrop:H3(1.2,-HH.D/2-2.8,G0),
  bendMid:W3(BEND.x,BEND.z+BEND.r),legBTop:W3(LEG.B,32),copyBMouth:W3(LEG.B,30.5),copyBP1:L3(P1.x,P1.z,'B'),copyAP1:L3(P1.x,P1.z,'A'),realP1:L3(P1.x,P1.z,'real'),
  fenceA:L3(0,FENCE_Z+.6,'A'),fenceB:L3(0,FENCE_Z+.6,'B'),cutA:W3(-31,118),cutB:W3(-45,118),
 };
 // the chase: the road from the bikes, down leg A, round the bend, up leg B, into copy B to its portal (frame points)
 const ROUTE=[[LEG.A+1.6,36],[LEG.A+1.2,60],[LEG.A,90],[LEG.A,BEND.z]];for(let k=1;k<=12;k++){const a=k/12*Math.PI;ROUTE.push([BEND.x+Math.cos(a)*BEND.r,BEND.z+Math.sin(a)*BEND.r]);}
 ROUTE.push([LEG.B,90],[LEG.B,60],[LEG.B,36],[LEG.B,30.5],[LEG.B,24+COPY_B.z],[COPY_B.x-8,12+COPY_B.z],[COPY_B.x+P1.x,12+COPY_B.z]);
 const routeWorld=()=>ROUTE.map(([x,z])=>{const w=regW(x,z);return [w.x,w.z];});
 // the creature's shortcut across the inner block (it is seen between the houses, then comes out ahead on leg B)
 const CUT=[[LEG.A-5,104],[-30,108],[-38,110],[-46,108],[LEG.B+5,100]];
 return {real,court,nav,ST,G0,TH,realW,realL,regW,regL,headingOf,frameDir,laneFloor,realFloor,houses,cars,lamps,poles,cans,giant,police,dining,HG,hToC,cToH,H3,W3,R3,L3,SPOT,ROUTE,routeWorld,CUT,
  portal,DA,DB,inLane,attach,setActive,reset,update,giantStart,GI,setBaseNav,FENCE_Z,LOTS,
  get inCourt(){return null;},inRegionAt:(x,z)=>inRegion(regL(x,z)),inRealAt:(x,z)=>inRealArea(realL(x,z)),inHouseAt:(x,z)=>{const q=regL(x,z);return inRegion(q)&&inHouseBox(q.x,q.z,0);}};
}
