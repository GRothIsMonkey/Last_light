// Yards and everything in them: cars, mailboxes, bins, toys, fences, back-yard things,
// chalk, and the lookout's bench and field fence. Street furniture is in furniture.js,
// trees in vegetation.js. Everything here is placed whole (rigid) unless it follows the
// ground along a line (fences, chalk), in which case it is bent with the street.
import * as THREE from './three.module.js';
import {groundPoint} from './route.js';
import {MAIN,LAWN,SIDEWALK,knoll} from './terrain.js';
import {JUNCTIONS,LOOKOUT,ROAD_START,SECTION,BULB} from './layout.js';
import {CAR,FENCE,HOUSE,FOLIAGE} from './palette.js';
import {pickFrom,seeded,hashSeed,smooth} from './kit.js';
import {createVegetation} from './vegetation.js';
import {gableRoof} from './houses.js';
import {buildFurniture} from './furniture.js';

// A small chain-link cutout texture, generated locally.
const chainTex=(()=>{const n=32,d=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const a=Math.abs(((x+y)%16)-8),b=Math.abs(((x-y+64)%16)-8),on=a<1.2||b<1.2;const i=(y*n+x)*4;d[i]=d[i+1]=d[i+2]=200;d[i+3]=on?255:0;}
 const t=new THREE.DataTexture(d,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;})();

const tires=new Map(),hubs=new Map();const tireGeo=r=>{if(!tires.has(r))tires.set(r,new THREE.CylinderGeometry(r,r,.23,12,1));return tires.get(r);},hubGeo=r=>{if(!hubs.has(r))hubs.set(r,new THREE.CylinderGeometry(r*.58,r*.58,.24,8,1));return hubs.get(r);};
// Cars: an extruded side profile (hood, windshield, roof, trunk, wheel arches) with a
// glass greenhouse, pillars, bumpers, lights, mirrors and turning wheels.
export function makeCar(K,g,kind,color,{lights=false}={}){
 const S={sedan:{W:1.8,L:4.75,r:.33,belt:.96,roof:1.42,hood:.9,f:[.9,1.35,2.0],b:[1.25,.55]},van:{W:1.95,L:5.1,r:.34,belt:1.08,roof:1.76,hood:1.02,f:[.55,1.05,1.3],b:[.25,.1]},
  suv:{W:1.9,L:4.8,r:.38,belt:1.12,roof:1.8,hood:1.08,f:[.75,1.1,1.55],b:[.35,.12]},pickup:{W:2,L:5.5,r:.38,belt:1.12,roof:1.86,hood:1.1,f:[.85,1.25,1.7],b:[2.55,2.5]},
  wagon:{W:1.82,L:4.9,r:.33,belt:.97,roof:1.45,hood:.9,f:[.9,1.35,2.0],b:[.4,.2]}}[kind]||{};
 const {W,L,r,belt,roof,hood}=S,xw=L/2-.95,clr=.3,arch=r+.07;
 const out=[[-L/2+.06,clr]];for(const cx of [-xw,xw]){out.push([cx-arch,clr]);for(let k=0;k<=6;k++){const a=Math.PI-k/6*Math.PI;out.push([cx+Math.cos(a)*arch,r+Math.sin(a)*arch*.95]);}out.push([cx+arch,clr]);}
 out.push([L/2-.06,clr],[L/2,.5],[L/2-.03,hood-.1],[L/2-.25,hood],[L/2-S.f[0],hood+.05],[-L/2+.25,belt+.02],[-L/2+.02,belt-.08],[-L/2,.52]);
 const paint=K.mat(color,{roughness:.38,metalness:.25});
 const body=K.extrude(g,out,W,.075,paint,{curve:4,bevelSegments:1});body.rotation.y=Math.PI/2;
 // Greenhouse: glass with the roof and pillars in body color.
 const f0=L/2-S.f[0]-.05,f1=L/2-S.f[1],f2=L/2-S.f[2],b0=-L/2+S.b[0],b1=-L/2+S.b[1];
 const gl=kind==='pickup'?[[f0,hood+.05],[f1,roof-.02],[-.2,roof-.02],[-.25,belt]]:[[f0,hood+.05],[f2,roof-.02],[b0,roof-.02],[b1+.1,belt+.02]];
 const glass=K.extrude(g,[...gl,[gl[gl.length-1][0],belt],[f0,belt]],W*.9,.04,K.mat(0x40515b,{roughness:.22,metalness:.42}),{curve:2,bevelSegments:1});glass.rotation.y=Math.PI/2;
 const roofPts=kind==='pickup'?[[f1-.02,roof-.04],[-.18,roof-.04],[-.18,roof+.02],[f1+.04,roof+.02]]:[[f2-.02,roof-.05],[b0+.05,roof-.05],[b0,roof+.02],[f2+.06,roof+.02]];
 const rf=K.extrude(g,roofPts,W*.92,.035,paint,{curve:2,bevelSegments:1});rf.rotation.y=Math.PI/2;
 for(const s of [-1,1]){const x=s*W*.452;// pillars
  for(const z of kind==='pickup'?[f0-.05,(f1-.2)/2,-.22]:[f0-.05,(f2+b0)/2+.1,b0+.18]){const p=K.box(g,x,(belt+roof)/2,-z,.05,roof-belt,.11,color);}
  K.rbox(g,s*(W/2+.07),belt+.02,-(L/2-S.f[0]-.35),.15,.10,.19,.035,paint);// mirror
  K.box(g,s*(W/2+.004),belt-.3,-(L/2-S.f[0]-.6),.01,.5,.012,0x2a2b2c);K.box(g,s*(W/2+.004),belt-.3,-(L/2-S.f[0]-1.55),.01,.5,.012,0x2a2b2c);}
 if(kind==='pickup'){K.rbox(g,0,belt-.02,L/2-S.b[0]/2+.05-2.6,W,.1,.06,.02,color);for(const s of [-1,1])K.rbox(g,s*(W/2-.06),belt-.25,-(-L/2+1.25),.1,.5,2.45,.02,color);K.box(g,0,.62,L/2-.3,W*.9,.05,2.2,0x2b2b2d);}
 // Bumpers, grille, lights, plate.
 for(const z of [-L/2-.02,L/2+.02])K.rbox(g,0,.42,z,W+.04,.2,.14,.05,CAR.bumper);K.box(g,0,.66,-L/2-.005,W*.52,.16,.05,0x232425);
 const head=lights?new THREE.MeshStandardMaterial({color:0xfff4d6,emissive:0xfff0c8,emissiveIntensity:1.2}):K.mat(0xe8e4d6),tail=lights?new THREE.MeshStandardMaterial({color:0xa02a22,emissive:0xff3020,emissiveIntensity:.9}):K.mat(0x9e3a30);
 for(const s of [-1,1]){K.box(g,s*(W/2-.28),.68,-L/2+.005,.36,.14,.06,head);K.box(g,s*(W/2-.14),.72,L/2-.005,.22,.2,.06,tail);}
 K.box(g,0,.45,L/2+.1,.5,.12,.02,0xe8e6de);
 for(let k=0;k<3;k++)K.box(g,0,.61+k*.043,-L/2-.035,W*.49,.012,.018,0x888d8b);
 for(const s of [-1,1]){K.rbox(g,s*(W/2+.012),belt-.13,-.2,.025,.035,.18,.008,0xb0b2ac);K.box(g,s*(W/2+.014),belt+.015,.1,.016,.028,L*.55,0x858a87);}
 const wheels=[];for(const s of [-1,1])for(const z of [-xw,xw]){const wg=new THREE.Group();wg.position.set(s*(W/2-.14),r,z);g.add(wg);
  const t=new THREE.Mesh(tireGeo(r),K.mat(CAR.tire));t.rotation.z=Math.PI/2;wg.add(t);const hc=new THREE.Mesh(hubGeo(r),K.mat(CAR.rim));hc.rotation.z=Math.PI/2;wg.add(hc);
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5;K.rod(wg,[s*.125,Math.sin(a)*r*.18,Math.cos(a)*r*.18],[s*.125,Math.sin(a)*r*.51,Math.cos(a)*r*.51],.018,CAR.rim,.013,3);}
  K.cyl(wg,s*.13,0,0,.07,.025,0x686d70,10,[0,0,Math.PI/2]);wheels.push(wg);}
 return {wheels,head,tail,L,W};
}

export function buildYards(W){
 const {K}=W,veg=W.veg=createVegetation(W);W.car=(g,kind,color,o)=>makeCar(K,g,kind,color,o);
 buildFurniture(W);
 const mainG=W.bent(MAIN),ground=(d,lat)=>groundPoint(d,lat).y+W.surfaceY(d,lat);
 const hooks=W.hooks={};const hook=(name,obj,extra={})=>{(hooks[name]||(hooks[name]=[])).push({object:obj,...extra});};
 const put=(d,lat,rot=0,y=null)=>W.place(MAIN,d,lat,{rot,y:y??ground(d,lat)});
 const free=(d,lat,r)=>{const p=groundPoint(d,lat);return W.space.free(p.x,p.z,r);};
 // Rigid placement square to a house (cars in driveways follow the house, not the curve).
 const atHouse=(h,x,z,y,rot=0)=>{const w=h.toWorld(x,z);return W.placeWorld(w.x,w.z,y,h.worldRot+rot,false);};
 const occupy=(d,lat,r,tag)=>{const p=groundPoint(d,lat);W.space.circle(p.x,p.z,r,tag);W.obstacles.push({d0:d-r,d1:d+r,l0:lat-r,l1:lat+r});};

 // Mailboxes: the classic curbside box on a post, or a brick column.
 function mailbox(frame,u,v,side,y,rand){const g=W.place(frame,u,v,{y,rot:side>0?-Math.PI/2:Math.PI/2}),style=rand();
  if(style<.18){K.rbox(g,0,.66,0,.56,1.32,.56,.03,HOUSE.brick);K.rbox(g,0,1.36,0,.64,.08,.64,.02,0xb9b1a0);K.rbox(g,0,1.02,.28,.3,.22,.03,.02,0x2b2b2b);}
  else{const pc=style<.6?0xece6d8:0x6a5846,c=style<.5?0x2d2f31:pickFrom(rand)([0x3a4d63,0x5e3a33,0xd8d2c4]);K.rbox(g,0,.56,0,.1,1.12,.1,.015,pc);K.rbox(g,0,1.1,0,.14,.06,.4,.015,pc);
   const box=K.extrude(g,[[-.1,0],[.1,0],[.1,.12],...Array.from({length:7},(_,k)=>{const a=k/6*Math.PI;return [Math.cos(a)*.1,.12+Math.sin(a)*.1];}),[-.1,.12]],.46,.012,c,{curve:6});box.position.set(0,1.13,.04);
   K.box(g,.105,1.3,-.08,.012,.18,.035,0xb4352c);K.box(g,.105,1.38,-.03,.012,.035,.1,0xb4352c);K.box(g,0,1.24,.275,.19,.2,.012,c);K.box(g,0,1.3,.285,.06,.02,.02,0xb8b4a8);}
  const p=frame.point(u,v);W.space.circle(p.x,p.z,.35,'mailbox');if(frame===MAIN)W.obstacles.push({d0:u-.3,d1:u+.3,l0:v-.3,l1:v+.3});return g;}
 function bins(d,lat,rand){const g=put(d,lat,rand()*.3-.15),pair=rand()<.6;for(let k=0;k<(pair?2:1);k++){const x=k*.75,c=k?0x33537a:pickFrom(rand)([0x3d4a3c,0x3f4246,0x4b4f4a]);
  K.rbox(g,x,.5,0,.58,.96,.68,.04,c);K.rbox(g,x,1.0,-.02,.64,.06,.74,.02,k?0x2d6db0:c);K.box(g,x,.95,.36,.5,.05,.05,0x2b2b2b);for(const s of [-1,1])K.cyl(g,x+s*.26,.1,.3,.1,.06,0x222222,10,[0,0,Math.PI/2]);}occupy(d,lat,.6,'bins');hook('bins',g);}
 function scooter(g,x,z,rot,c){const sg=K.group(g,x,z,rot);K.rbox(sg,0,.07,0,.12,.03,.52,.01,c);K.rod(sg,[0,.1,-.22],[0,.78,-.26],.014,0xb5b8b5);K.rod(sg,[-.16,.78,-.26],[.16,.78,-.26],.015,0x31393c);for(const zz of [-.22,.22]){const w=new THREE.Mesh(new THREE.TorusGeometry(.045,.016,5,10),K.mat(0x30383a));w.rotation.y=Math.PI/2;w.position.set(0,.06,zz);sg.add(w);}return sg;}
 function bigWheel(g,x,z,rot){const t=K.group(g,x,z,rot);K.cyl(t,0,.28,-.35,.28,.12,0xd8483a,14,[0,0,Math.PI/2]);for(const s of [-1,1])K.cyl(t,s*.28,.12,.3,.12,.08,0x2b2b2b,10,[0,0,Math.PI/2]);K.rbox(t,0,.16,.1,.36,.1,.7,.04,0xe7c23c);K.rbox(t,0,.3,.22,.3,.3,.08,.03,0xd8483a);K.rod(t,[-.2,.5,-.35],[.2,.5,-.35],.02,0xe7c23c);return t;}
 function lawnChair(g,x,z,rot,c){const cg=K.group(g,x,z,rot);K.box(cg,0,.36,0,.52,.05,.5,c);const b=K.box(cg,0,.72,.26,.52,.65,.05,c);b.rotation.x=-.25;for(const s of [-1,1]){K.box(cg,s*.27,.52,0,.05,.05,.52,c);K.box(cg,s*.25,.18,-.2,.04,.36,.04,c);K.box(cg,s*.25,.18,.2,.04,.36,.04,c);}return cg;}
 function wagon(g,x,z,rot){const t=K.group(g,x,z,rot);K.rbox(t,0,.3,0,.45,.18,.85,.02,0xb33a2e);for(const s of [-1,1])for(const zz of [-.3,.3])K.cyl(t,s*.25,.12,zz,.11,.05,0x2b2b2b,10,[0,0,Math.PI/2]);K.rod(t,[0,.3,-.43],[0,.15,-1.05],.012,0x2b2b2b);return t;}
 function kidBike(g,x,z,rot,c){const t=K.group(g,x,z,rot,.02);const wt=new THREE.TorusGeometry(.24,.025,5,16);for(const zz of [-.38,.38]){const w=new THREE.Mesh(wt,K.mat(0x2b2b2b));w.position.set(0,.03,zz);w.rotation.x=Math.PI/2;t.add(w);}K.rod(t,[0,.05,-.38],[0,.08,.38],.02,c);K.rod(t,[0,.08,-.3],[.12,.1,-.1],.02,c);K.rod(t,[-.25,.06,-.38],[.25,.06,-.38],.012,0x9da09a);return t;}
 function pool(g,x,z){const p=K.group(g,x,z);K.cyl(p,0,.13,0,1,.26,0x3d7fb8,18);K.cyl(p,0,.24,0,.93,.02,0x8fc2d6,18);return p;}
 function trampoline(frame,u,v,y){const g=W.place(frame,u,v,{y});const ring=new THREE.Mesh(new THREE.TorusGeometry(1.8,.06,5,28),K.mat(0x2e4c7a));ring.rotation.x=Math.PI/2;ring.position.y=.85;g.add(ring);
  const m=new THREE.Mesh(new THREE.CircleGeometry(1.7,24),K.mat(0x1f2124,{side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.84;g.add(m);
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;K.rod(g,[Math.cos(a)*1.8,0,Math.sin(a)*1.8],[Math.cos(a)*1.8,2.5,Math.sin(a)*1.8],.025,0x3a3d42);K.rod(g,[Math.cos(a)*1.75,0,Math.sin(a)*1.75],[Math.cos(a)*1.8,.85,Math.sin(a)*1.8],.03,0x6a6d72);}
  const top=new THREE.Mesh(new THREE.TorusGeometry(1.8,.02,4,28),K.mat(0x3a3d42));top.rotation.x=Math.PI/2;top.position.y=2.5;g.add(top);
  const net=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,1.6,24,1,true),mats.net);net.position.y=1.7;g.add(net);return g;}
 function swingSet(frame,u,v,y,rot){const g=W.place(frame,u,v,{y,rot});for(const s of [-1,1]){K.rod(g,[s*1.6,0,-.9],[s*1.6,2.3,0],.045,0x4a6a3a);K.rod(g,[s*1.6,0,.9],[s*1.6,2.3,0],.045,0x4a6a3a);}K.rod(g,[-1.75,2.3,0],[1.75,2.3,0],.055,0x4a6a3a);
  for(const x of [-.7,.5]){K.rod(g,[x-.2,2.3,0],[x-.2,.55,0],.008,0x777777);K.rod(g,[x+.2,2.3,0],[x+.2,.55,0],.008,0x777777);K.rbox(g,x,.52,0,.5,.04,.2,.01,0x2a4a8a);}
  const sl=K.rbox(g,2.6,.8,0,.5,.05,2.6,.02,0xd9c340);sl.rotation.z=.55;K.rod(g,[1.8,0,0],[1.8,1.6,0],.03,0x4a6a3a);return g;}
 function shed(frame,u,v,y,rot,rand){const g=W.place(frame,u,v,{y,rot}),c=pickFrom(rand)([0xa89a80,0x9b6a55,0x8d9985]);
  K.rbox(g,0,1.05,0,2.6,2.1,2.2,.03,c);K.rbox(g,0,.05,0,2.7,.12,2.3,.02,0x9a9282);
  gableRoof(W,g,2.6,2.2,2.1,.8,.15,.2,W.surfaceMaterial(K.mat(pickFrom(rand)(HOUSE.roofs)),'roof'),W.surfaceMaterial(K.mat(c),'siding'),true,{mid:true,gutters:false,vent:false});
  K.box(g,0,1,1.11,1,1.9,.04,0xe8e2d6);K.box(g,0,1,1.13,.06,1.9,.02,0xc8c2b6);return g;}
 function clothesline(frame,u,v,y,rot){const g=W.place(frame,u,v,{y,rot});for(const s of [-1,1]){K.rod(g,[s*2.2,0,0],[s*2.2,1.9,0],.035,0x8a8c88);K.rod(g,[s*2.2,1.85,-.45],[s*2.2,1.85,.45],.025,0x8a8c88);}for(const z of [-.4,0,.4])K.rod(g,[-2.2,1.84,z],[2.2,1.8,z],.004,0xd8d6ce,.004,3);
  const cols=[0xd8d2c4,0x8aa0b8,0xc27a6a];for(let k=0;k<3;k++)K.box(g,-1+k*.8,1.5,0,.5,.6,.01,cols[k]);return g;}

 // Fences follow the ground along a line (bent), with posts, rails and boards/pickets/mesh.
 const mats={wood:W.surfaceMaterial(K.mat(FENCE.wood),'fence'),dark:K.mat(FENCE.woodDark),picket:K.mat(FENCE.picket),post:K.mat(0x8a7456),chain:new THREE.MeshStandardMaterial({color:FENCE.chain,map:chainTex,alphaTest:.4,side:THREE.DoubleSide,roughness:.7,metalness:.3})};
 mats.net=new THREE.MeshStandardMaterial({color:0x222428,map:chainTex,alphaTest:.4,side:THREE.DoubleSide,roughness:.7,metalness:.3});
 function fenceRun(frame,pts,style,{lod='full',endPosts=true}={}){const g=W.bent(frame);
  const H=style==='privacy'?1.8:style==='chain'?1.2:style==='rail'?1.05:1.05,postC=style==='chain'?0x8e928f:style==='picket'?FENCE.picket:0x8a7456;
  for(let i=0;i<pts.length-1;i++){const [u0,v0]=pts[i],[u1,v1]=pts[i+1],L=Math.hypot(u1-u0,v1-v0),n=Math.max(1,Math.round(L/2.4));
   for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n,ua=u0+(u1-u0)*a,va=v0+(v1-v0)*a,ub=u0+(u1-u0)*b,vb=v0+(v1-v0)*b,um=(ua+ub)/2,vm=(va+vb)/2,len=L/n,ang=Math.atan2(vb-va,-(ub-ua));
    const bay=K.group(g,vm,-um,ang-Math.PI/2);// local x along the fence
    if(style==='privacy'){K.box(bay,0,H/2+.06,0,len,H,.04,mats.wood);if(lod==='full')K.box(bay,0,H+.08,0,len,.05,.07,mats.dark);}
    else if(style==='picket'){K.box(bay,0,.35,-.03,len,.06,.04,mats.picket);K.box(bay,0,.85,-.03,len,.06,.04,mats.picket);if(lod==='full')for(let x=-len/2+.07;x<len/2;x+=.14)K.box(bay,x,.5,0,.08,.9,.02,mats.picket);else K.box(bay,0,.5,0,len,.9,.02,mats.picket);}
    else if(style==='chain'){K.box(bay,0,H/2+.03,0,len,H,.01,mats.chain);K.box(bay,0,H,0,len,.04,.04,0x8e928f);}
    else{K.box(bay,0,.45,0,len,.1,.07,FENCE.rail);K.box(bay,0,.9,0,len,.1,.07,FENCE.rail);}
    if(k>0||i>0||endPosts){const pb=K.group(g,va,-ua,0);K.box(pb,0,(H+.12)/2,0,style==='chain'?.06:.1,H+.12,style==='chain'?.06:.1,postC);if(lod==='full'&&style==='privacy')K.lathe(pb,[[.001,0],[.09,0],[.09,.025],[.07,.045],[.001,.045]],0,H+.1175,0,postC,4);}}
   if(i===pts.length-2&&endPosts){const pb=K.group(g,v1,-u1,0);K.box(pb,0,(H+.12)/2,0,.1,H+.12,.1,postC);}}
  return g;}
 W.fenceRun=fenceRun;

 // Lots on Oak Hollow: yards, fences, trees, cars ------------------------------------------
 const REAR=SECTION.rearFence,carKinds=['sedan','van','suv','sedan','pickup','wagon'];
 for(const side of [-1,1]){const lots=W.plans.filter(p=>p.side===side).sort((a,b)=>a.u-b.u);
  // Street-coordinate extent of each house (with garage), for lot lines between them.
  const ext=p=>{const a=p.lin(-p.w/2-(p.hasGarage&&p.gs<0?p.gw:0),0).u,b=p.lin(p.w/2+(p.hasGarage&&p.gs>0?p.gw:0),0).u;return [Math.min(a,b),Math.max(a,b)];};
  const lines=[];for(let i=0;i<lots.length-1;i++){const [,a1]=ext(lots[i]),[b0]=ext(lots[i+1]);lines.push({u:(a1+b0)/2,gap:b0-a1,a:lots[i],b:lots[i+1]});}
  // Rear fence along the back of every lot, in runs broken by the cross street.
  const breaks=JUNCTIONS.filter(j=>j.side===side).map(j=>[j.d-34,j.d+34]);let start=ROAD_START+4;const runs=[];for(const [a,b] of breaks){runs.push([start,a]);start=b;}runs.push([start,1112]);
  for(const [a,b] of runs){let u=a;const cuts=lines.filter(l=>l.u>a&&l.u<b).map(l=>l.u);const stops=[a,...cuts,b];
   for(let i=0;i<stops.length-1;i++){const rand=seeded(hashSeed(5,side,stops[i])),r=rand(),style=r<.62?'privacy':r<.86?'chain':'rail';fenceRun(MAIN,[[stops[i],side*REAR],[stops[i+1],side*REAR]],style,{endPosts:i===0});}}
  // Lot-line fences between back yards, and a side-yard gate from each house's rear corner.
  // edgeX: the house-local x of a house's side wall facing toward higher (dir=1) or lower u.
  const edgeX=(h,dir)=>{const xs=-h.side*dir,ext=h.w/2+(h.hasGarage&&h.gs===xs?h.gw:0);return xs*ext;};
  for(const l of lines){if(l.gap<1.6||breaks.some(([a,b])=>l.u>a-6&&l.u<b+6))continue;const rand=seeded(hashSeed(6,side,l.u)),style=rand()<.7?'privacy':rand()<.5?'chain':'picket';
   const corner=h=>h.setback+h.depth/2-1.2,start=Math.min(corner(l.a),corner(l.b));
   fenceRun(MAIN,[[l.u,side*start],[l.u,side*REAR]],style,{endPosts:true});
   for(const [h,dir] of [[l.a,1],[l.b,-1]]){const e=h.S(edgeX(h,dir),-h.depth/2+1.2);if(Math.abs(e.d-l.u)>.6)fenceRun(MAIN,[[e.d,e.lat],[l.u,e.lat]],style==='chain'?'chain':'privacy',{endPosts:true});}}
  for(const h of lots){const rand=seeded(hashSeed(7,side,h.u)),pick=pickFrom(rand),friend=!!h.key,s=side;
   mailbox(MAIN,h.drivD1+.9,s*5.55,s,ground(h.drivD1+.9,s*5.55),rand);
   if(!friend&&rand()<.5)bins(h.drivD0-1.6,s*5.7,rand);
   // A car in the driveway, nose to the garage or backed in.
   const zc=Math.min(3.1,h.endLat-2.45-8.4);// the bumper stays behind the sidewalk
   if(!friend&&h.hasGarage&&rand()<.52&&zc>1.2){const c=h.S(h.drivX,h.drivEnd+zc),q=W.drives.find(v=>v.contains(c.d,c.lat)),y=groundPoint(c.d,c.lat).y+(q?q.y(c.d,c.lat):.17);
    const cg=atHouse(h,h.drivX,h.drivEnd+zc,y,rand()<.3?Math.PI:0);makeCar(K,cg,pick(carKinds),pick(CAR.colors));hook('parked-car',cg);}
   // Front-yard trees on open lawn.
   for(let k=0;k<2;k++){const tl=s*(9.6+rand()*2.6),td=h.u+(rand()<.5?-1:1)*(3.5+rand()*9);if(!friend&&free(td,tl,2.2))veg.tree(MAIN,td,tl,ground(td,tl),{size:.72+rand()*.42,kind:rand()<.18?'young':rand()<.12?'pine':rand()<.18?'birch':'maple',clearance:2.2});}
   // Back-yard trees and things (seen between houses).
   const by=s*(h.setback+h.depth/2+3+rand()*4),bd=h.u+(rand()-.5)*h.w;if(Math.abs(by)<REAR-2&&free(bd,by,2.5))veg.tree(MAIN,bd,by,ground(bd,by),{size:.9+rand()*.5,kind:rand()<.25?'pine':'maple',lod:'mid',clearance:2.4});
   const br=rand(),bl=s*(h.setback+h.depth/2+4.5),bdd=h.u+(rand()<.5?-1:1)*(h.w/2+2.5);
   if(Math.abs(bl)<REAR-2.2&&free(bdd,bl,2.2)){const y=ground(bdd,bl);if(br<.2){trampoline(MAIN,bdd,bl,y);occupy(bdd,bl,2,'trampoline');hook('trampoline',null,{d:bdd,lat:bl});}else if(br<.34){swingSet(MAIN,bdd,bl,y,rand()*3);occupy(bdd,bl,2.4,'swing');}else if(br<.46){shed(MAIN,bdd,bl,y,s>0?-Math.PI/2:Math.PI/2,rand);occupy(bdd,bl,1.8,'shed');}else if(br<.54){clothesline(MAIN,bdd,bl,y,rand()*3);}}
   // A few ordinary things left out before dinner.
   if(!friend){const r=rand(),yd=h.u+(rand()-.5)*14,yl=s*(8.8+rand()*3.8);if(free(yd,yl,.9)){const g=put(yd,yl);let o=null;
    if(r<.14)o=bigWheel(g,0,0,rand()*6);else if(r<.26){lawnChair(g,0,0,rand()*6,pick([0xf2f0ea,0x3f6a4a]));lawnChair(g,.9,.2,rand()*6,pick([0xf2f0ea,0x3f6a4a]));o=g;}
    else if(r<.34){K.ball(g,0,.11,0,.11,0xf2f0ea,[1,1,1],true);o=g;}else if(r<.42)o=pool(g,0,0);else if(r<.5)o=wagon(g,0,0,rand()*6);else if(r<.6)o=kidBike(g,0,0,rand()*6,pick([0xb2553a,0x3a6aa0,0x6a8a3a]));else if(r<.68)o=scooter(g,0,0,rand()*6,pick([0xd04a8a,0x3a8ad0,0x9aa0a0]));
    if(o){occupy(yd,yl,.9,'toy');hook(r<.14?'big-wheel':r<.26?'lawn-chairs':r<.34?'ball':r<.42?'kiddie-pool':r<.5?'wagon':r<.6?'bike-in-yard':'scooter',g);}}
    if(rand()<.4){const c=h.S(h.w/2*(-h.gs)-.5,h.front-1.5);const hg=put(c.d,c.lat);const coil=new THREE.Mesh(new THREE.TorusGeometry(.26,.03,5,18),K.mat(0x3f7a3a));coil.rotation.x=Math.PI/2;coil.position.y=.22;hg.add(coil);const c2=coil.clone();c2.position.y=.28;c2.scale.setScalar(.9);hg.add(c2);K.box(hg,0,.5,-.25,.05,.1,.05,0x9a9a90);hook('hose',hg);}}
  }
 }
 // Side-street lots: mailboxes, trees, a few cars.
 JUNCTIONS.forEach((j,i)=>{const f=W.sideFrames[i];for(const h of W.sidePlans.filter(p=>p.frame===f)){const rand=seeded(hashSeed(8,i,h.u)),s=h.side,gy=(u,v)=>f.point(u,v).y+W.sideSurface(j,u,v);const cut=W.cuts.find(c=>c.plan===h);
  mailbox(f,cut.u1+.9,s*(j.half+.85),s,gy(cut.u1+.9,s*(j.half+.85)),rand);
  // Parked nose-in near the garage, never over the sidewalk (these lots are shallower).
  const zc=Math.min(3.1,h.setback-h.drivEnd-2.45-(j.half+3.15+.45));
  if(h.hasGarage&&rand()<.5&&zc>1.2){const w=h.toWorld(h.drivX,h.drivEnd+zc);makeCar(K,atHouse(h,h.drivX,h.drivEnd+zc,w.ground+.19,0),pickFrom(rand)(carKinds),pickFrom(rand)(CAR.colors));}
  for(let k=0;k<2;k++){const u=h.u+(rand()<.5?-1:1)*(4+rand()*8),v=s*(j.half+5+rand()*3);veg.tree(f,u,v,gy(u,v),{size:.8+rand()*.4,kind:rand()<.2?'pine':'maple',lod:h.lod==='full'?'full':'mid',clearance:2.2});}
  const bu=h.u+(rand()-.5)*8,bv=s*(h.setback+h.depth/2+5);veg.tree(f,bu,bv,gy(bu,bv),{size:1+rand()*.4,lod:'mid',clearance:2.4});}
  // A parked car at the curb, a lamp, lamps down the street.
  for(const [u,s] of [[70,1],[150,-1],[205,1]]){const v=s*(j.half-1.05),cg=W.place(f,u,v,{y:f.point(u,v).y+.03,rot:s>0?Math.PI:0});makeCar(K,cg,carKinds[(u+i)%carKinds.length],CAR.colors[(u/5+i)%CAR.colors.length|0]);}
 });

 // Chalk, the portable hoop, and a toy left near the curb -----------------------------------
 const chalk=(pts,c)=>K.line(mainG,pts,c);
 function hopscotch(lat,d,side,y=.172){const cells=[[0,0],[0,1],[-.5,2],[.5,2],[0,3],[-.5,4],[.5,4],[0,5]];for(const [cx,cz] of cells){const x=lat+cx*side,z=-(d+cz*.5);chalk([[x-.25,y,z],[x+.25,y,z],[x+.25,y,z-.5],[x-.25,y,z-.5],[x-.25,y,z]],0xece0c8);}}
 function chalkSun(lat,d,y,c){const pts=[];for(let k=0;k<=18;k++){const a=k/18*Math.PI*2;pts.push([lat+Math.cos(a)*.35,y,-(d+Math.sin(a)*.35)]);}chalk(pts,c);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;chalk([[lat+Math.cos(a)*.45,y,-(d+Math.sin(a)*.45)],[lat+Math.cos(a)*.7,y,-(d+Math.sin(a)*.7)]],c);}}
 const GLYPH={J:[[[.6,1],[.6,.2],[.4,0],[.15,.1]]],S:[[[.7,.9],[.4,1],[.1,.8],[.3,.55],[.6,.45],[.7,.2],[.4,0],[.05,.15]]],A:[[[0,0],[.35,1],[.7,0]],[[.15,.4],[.55,.4]]],'+':[[[.35,.2],[.35,.8]],[[.05,.5],[.65,.5]]]};
 function chalkText(txt,lat,d,y,c,size=.55){let off=0;for(const ch of txt){for(const stroke of GLYPH[ch]||[])chalk(stroke.map(([u,v])=>[lat+(off+u)*size,y,-(d+v*size)]),c);off+=.95;}}
 hopscotch(-6.8,88,-1);hopscotch(7.1,248,1);chalkSun(-7.1,120,.172,0xf2b5c4);chalkSun(7.2,318,.172,0xb6d7ef);
 for(let d=45;d<250;d+=55)for(let k=0;k<6;k++){const x=-7.1+(k%2)*.5,z=-d-Math.floor(k/2)*.6;chalk([[x,.17,z],[x+.42,.17,z],[x+.42,.17,z-.48],[x,.17,z-.48],[x,.17,z]],[0xedd0a5,0xe3a7b8,0xa8cbe0][k%3]);}
 {const h=W.homes.jamie;chalkSun(h.side*9.5,h.drivD+.4,.2,0xf5e08a);hook('chalk',null,{d:h.drivD,lat:h.side*9.5});}
 {const d=253,lat=5.4,g=put(d,lat,Math.PI);K.rbox(g,0,.16,-.45,.8,.3,1.1,.06,0x2c2d2f);K.rod(g,[0,.3,-.3],[0,3.3,-.3],.055,0x6e6f6c);K.rbox(g,0,3.25,0,1.8,1.05,.06,.02,0xefeee8);K.box(g,0,3.1,.04,.6,.45,.02,0xba5a44);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.02,5,16),K.mat(0xc05a33));ring.rotation.x=Math.PI/2;ring.position.set(0,3.05,.3);g.add(ring);occupy(d,lat,.8,'hoop');hook('portable-hoop',g);}
 {const d=372,lat=-5.3,g=put(d,lat,1.1);K.ball(g,0,.12,0,.12,0xc2652f,[1,1,1],true);hook('toy-at-curb',g);}
 // Dropped on its side in the grass beside the walk, where a kid lets go of it.
 {const d=458,lat=8.9,g=put(d,lat,2.2,ground(d,lat));const sc=scooter(g,0,0,0,0x3a8ad0);sc.rotation.z=1.4;sc.position.y=.055;hook('scooter-in-grass',g);}

 // The end of the street: bench, the old oak, the field fence and tall grass ---------------------
 {const b=LOOKOUT.bench,y=groundPoint(b.d,b.lat).y+knoll(b.d,b.lat),g=W.place(MAIN,b.d,b.lat,{y});
  for(let k=0;k<3;k++)K.rbox(g,0,.46,-.18+k*.14,1.7,.045,.11,.012,0x8e7458);for(let k=0;k<2;k++)K.rbox(g,0,.66+k*.16,.22,1.7,.1,.04,.012,0x8e7458);
  for(const s of [-1,1]){const leg=K.group(g,s*.74,0,0);K.rbox(leg,0,.22,-.12,.07,.46,.07,.015,0x3d3b38);K.rbox(leg,0,.5,.2,.07,1,.07,.015,0x3d3b38);K.rbox(leg,0,.63,.02,.07,.05,.52,.015,0x3d3b38);K.box(leg,0,.03,.04,.1,.06,.6,0x3d3b38);}
  W.obstacles.push({d0:b.d-.45,d1:b.d+.45,l0:b.lat-.95,l1:b.lat+.95});hook('bench',g);}
 {const o=LOOKOUT.oak;veg.tree(MAIN,o.d,o.lat,groundPoint(o.d,o.lat).y+knoll(o.d,o.lat)-.02,{size:1.35,kind:'oak',force:true});hook('old-oak',null,{d:o.d,lat:o.lat});}
 {const fd=LOOKOUT.fenceD,g=W.bent(MAIN);const post=lat=>{const y=knoll(fd,lat)-LAWN;K.lathe(g,[[.001,-.2],[.08,-.2],[.075,1.2],[.06,1.28],[.001,1.3]],lat,y,-fd,0x8a7760,6);};
  for(let lat=-17;lat<=17.1;lat+=2.6)post(lat);
  for(const yy of [.55,1.05])for(let lat=-17;lat<17;lat+=2.6){const r=seeded(hashSeed(9,lat,yy))();K.rod(g,[lat,yy+knoll(fd,lat)-LAWN,-fd+.06],[lat+2.6,yy+knoll(fd,lat+2.6)-LAWN+(r-.5)*.05,-fd+.06],.05,FENCE.rail,.045,5);}
  W.obstacles.push({d0:fd-.3,d1:fd+.3,l0:-18,l1:18});}
 {const tall=K.mat(0x8a9263,{side:THREE.DoubleSide,roughness:1});W.foliage.push(tall);const rand=seeded(77);
  for(let k=0;k<160;k++){const lat=(rand()-.5)*32,d=1167.5+rand()*9.5;if(Math.abs(lat)<1&&d<1172)continue;const g=W.place(MAIN,d,lat,{y:groundPoint(d,lat).y+knoll(d,lat)-.05,rot:rand()*3});for(let blade=0;blade<5;blade++){const h=.20+rand()*.36,w=.016+rand()*.018,bend=.06+rand()*.12;
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-w,0,0,w,0,0,-w*.6,h*.55,bend*.3,w*.6,h*.55,bend*.3,bend*.35,h,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
   const c=new THREE.Mesh(geo,tall);c.rotation.y=rand()*Math.PI*2;c.position.set((rand()-.5)*.19,0,(rand()-.5)*.19);g.add(c);}}}
 {const d=1172.2,lat=-12.5,g=W.place(MAIN,d,lat,{y:groundPoint(d,lat).y+knoll(d,lat)});K.ball(g,0,.12,0,.12,0xb8643a,[1,1,1],true);hook('ball-in-grass',g);}
 chalkSun(3.2,1147.5,.034,0xf2cf7a);chalkText('JSA',LOOKOUT.chalk.lat,LOOKOUT.chalk.d,.034,0xe8e2d0,.6);hopscotch(-5.8,1135,-1,.034);hook('initials',null,{d:LOOKOUT.chalk.d,lat:LOOKOUT.chalk.lat});
 // Trees around the lookout and in the field beyond.
 const rl=seeded(1161);for(let k=0;k<10;k++){const lat=(rl()<.5?-1:1)*(15+rl()*12),d=1120+rl()*34;veg.tree(MAIN,d,lat,groundPoint(d,lat).y+(d>1150?knoll(d,lat):LAWN),{size:.8+rl()*.5,kind:rl()<.3?'young':'maple',clearance:2});}
 for(let k=0;k<70;k++){const lat=(rl()-.5)*160,d=1250+rl()*110;veg.tree(MAIN,d,lat,groundPoint(d,lat).y+knoll(d,lat)-.05,{size:1.2+rl()*.8,kind:rl()<.35?'pine':'maple',lod:'far',clearance:3});}
}
