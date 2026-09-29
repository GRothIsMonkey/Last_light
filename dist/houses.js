// Houses. Every lot is planned first (planLots), so the streets know where the
// driveway curb cuts go; then each house is built in its own local frame:
// x across the facade, z toward its street (+z = front), y up from the ground.
// Houses are draped (see world.js): rigid footprint, base following the terrain.
//
// Levels of detail: 'full' for the ride's own street, 'mid' for houses seen across
// back yards or down the side streets. Background silhouettes live in background.js.
import * as THREE from './three.module.js';
import {MAIN,LAWN,SIDEWALK} from './terrain.js';
import {JUNCTIONS,FRIEND_HOMES,LOT_FIRST,LOT_LAST,LOT_SPACING,SECTION} from './layout.js';
import {HOUSE,INTERIOR} from './palette.js';
import {smooth,clamp,lerp,pickFrom} from './kit.js';

const CF=SECTION.curbFace,WALK1=SECTION.walk1;
const weighted=(rand,list)=>{let r=rand(),acc=0;for(const [v,p] of list){acc+=p;if(r<acc)return v;}return list[list.length-1][0];};

// Lot frame: maps house-local (x,z) to street coordinates and the world. -----------------
export function lotFrame(P){
 const f=P.facing??1,s=P.side,fr=P.frame;
 const lin=(x,z)=>({u:P.u-s*f*x,v:s*(P.setback-f*z)});
 const p0=fr.point(P.u,0),a=fr.heading(P.u),L={cx:p0.x,cz:p0.z,fx:Math.sin(a),fz:-Math.cos(a),rx:Math.cos(a),rz:Math.sin(a)};
 const xz=(x,z)=>{const q=lin(x,z),du=q.u-P.u;return {x:L.cx+du*L.fx+q.v*L.rx,z:L.cz+du*L.fz+q.v*L.rz,u:q.u};};
 P.lin=lin;P.L=L;P.houseRot=(s>0?-Math.PI/2:Math.PI/2)+(f<0?Math.PI:0);P.worldRot=-a+P.houseRot;
 P.S=(x,z)=>{const w=xz(x,z),q=fr.project(w.x,w.z,w.u);return {d:q.u,lat:q.v};};
 P.toWorld=(x,z)=>{const w=xz(x,z),q=fr.project(w.x,w.z,w.u),p=fr.point(q.u,q.v);return {x:w.x,z:w.z,ground:p.y,d:q.u,lat:q.v};};
 P.localOf=(d,lat)=>{const p=fr.point(d,lat),dx=p.x-L.cx,dz=p.z-L.cz,u=P.u+dx*L.fx+dz*L.fz,v=dx*L.rx+dz*L.rz;return {x:(P.u-u)/(s*f),z:(P.setback-v/s)/f};};
 return P;
}

// Planning ----------------------------------------------------------------------------------
export function planHouse(rand,o){
 const pick=pickFrom(rand),P={lod:'full',facing:1,...o};
 const style=P.style??=weighted(rand,HOUSE.styles);
 P.stories=style==='colonial'||style==='frontgable'?2:1;
 P.w??=style==='ranch'?12.4+rand()*3:style==='colonial'?10+rand()*2.3:style==='cape'?9.6+rand()*2:8.8+rand()*1.4;
 P.depth??=style==='frontgable'?10.2+rand()*1.4:style==='cape'?8.2+rand()*.8:8.4+rand()*1.6;
 P.h=P.stories===2?5.6:style==='ranch'?2.85:2.95;
 P.roof??=style==='ranch'?pick(['hip','side','side']):style==='colonial'?pick(['side','side','hip']):style==='cape'?'side':'front';
 P.rise=style==='cape'?P.depth*.5:style==='frontgable'?2.5:P.roof==='hip'?1.85:style==='ranch'?1.8:2.1;
 P.setback??=18.2+rand()*2.6;P.front=P.depth/2;
 P.wall??=pick(HOUSE.walls);P.roofColor??=pick(HOUSE.roofs);P.door??=pick(HOUSE.doors);P.garageColor??=pick(HOUSE.garageDoors);
 P.shutters??=rand()<(style==='colonial'?.75:.4)?pick(HOUSE.shutters):null;
 P.brick??=rand()<.28?(style==='ranch'?'front':'lower'):null;
 P.garage??=rand()<.84;P.hasGarage=!!P.garage;
 P.gs=P.garageSide==='near'?P.side:P.garageSide==='far'?-P.side:(P.gs??(rand()<.5?1:-1));
 P.gw??=rand()<.5?4:6.4;P.gd=Math.min(P.depth,7);P.gh=2.9;P.gfront=P.front-(P.garageInset??(style==='colonial'&&rand()<.4?.8:0));P.gx=P.gs*(P.w/2+P.gw/2);
 P.garageRoof=P.roof==='front'?'front':P.roof==='hip'?'hip':'side';
 P.porch??=style==='colonial'?pick(['porch','portico','stoop']):style==='cape'?pick(['portico','stoop','stoop']):style==='frontgable'?'porch':pick(['stoop','stoop','porch']);
 // The front eave height decides how a porch roof can meet the house.
 P.eaveFront=P.roof==='front'?null:P.h-.45*P.rise/((P.roof==='hip'?Math.min(P.w,P.depth):P.depth)/2);
 P.lowPorch=P.porch==='porch'&&P.stories===1&&P.eaveFront!==null;
 P.floor=P.lowPorch?.2:P.porch==='porch'?.45:.34;
 P.doorX??=P.hasGarage?-P.gs*(P.stories===2?.2:P.w*.12):(rand()-.5)*P.w*.3;
 P.porchW??=Math.min(P.w-1,P.porch==='porch'?4.5+rand()*3:P.porch==='portico'?2.4:1.9);
 P.pdep=P.porch==='porch'?2.3:P.porch==='portico'?1.5:1.35;
 P.steps=Math.max(2,Math.round(P.floor/.16));P.stepFront=P.front+P.pdep+.3*P.steps;
 P.chimney??=rand()<.34?(rand()<.5?'exterior':'interior'):null;
 P.dormers=style==='cape'?(P.w>10.6?3:2):0;
 P.rear=rand()<.4?'deck':rand()<.6?'patio':null;P.grill=rand()<.45;P.ac=rand()<.8;
 P.leadWalk??=rand()<.3;
 // Driveway: to the garage, or a parking pad beside the house.
 P.drivX=P.hasGarage?P.gx:P.gs*(P.w/2+2);P.drivW=P.hasGarage?Math.max(3.2,P.gw>5?5.6:3.4):3.2;P.drivEnd=P.hasGarage?P.gfront:P.front-3;
 P.endLat=P.setback-P.drivEnd;
 P.seedA=rand();P.seedB=rand();P.seedC=rand();
 return lotFrame(P);
}
// Driveway polygon in street coordinates and the curb cut it needs.
function planCut(P,frameId,cf){
 const a=P.lin(P.drivX-P.drivW/2,0).u,b=P.lin(P.drivX+P.drivW/2,0).u,u0=Math.min(a,b),u1=Math.max(a,b);
 const g0=P.S(P.drivX-P.drivW/2,P.drivEnd),g1=P.S(P.drivX+P.drivW/2,P.drivEnd),s=P.side;
 const poly=[[a,s*(cf-.05)],[b,s*(cf-.05)],[s>0?g1.d:g1.d,g1.lat],[g0.d,g0.lat]];
 const inside=(u,v)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ui,vi]=poly[i],[uj,vj]=poly[j];if((vi>v)!==(vj>v)&&u<(uj-ui)*(v-vi)/(vj-vi)+ui)c=!c;}return c;};
 return {frame:frameId,side:s,u0,u1,poly,inside,plan:P};
}
export function planLots(W){
 const plans=[];W.cuts=[];
 for(let d=LOT_FIRST;d<LOT_LAST;d+=LOT_SPACING)for(const side of [-1,1]){
  const key=Object.keys(FRIEND_HOMES).find(k=>FRIEND_HOMES[k].side===side&&Math.abs(FRIEND_HOMES[k].dc-d)<15);
  const rand=W.lotRand(1,side,d);let dc=key?FRIEND_HOMES[key].dc:d+rand()*5;const o=key?{...FRIEND_HOMES[key].o}:{};
  const j=JUNCTIONS.find(j=>j.side===side&&Math.abs(dc-j.d)<46);
  // Corner lots face Oak Hollow, with the garage on the side away from the cross street.
  if(j){const off=dc-j.d;if(Math.abs(off)<20)continue;dc=j.d+Math.sign(off)*25;o.garageSide=off>0?'far':'near';o.corner=true;}
  const P=planHouse(rand,{frame:MAIN,frameId:'main',u:dc,side,key:key||null,...o});P.dc=P.u;
  if(d<-140)P.lod='mid';
  plans.push(P);
 }
 for(const P of plans){const c=planCut(P,'main',CF);W.cuts.push(c);P.drivD=(c.u0+c.u1)/2;P.drivD0=c.u0;P.drivD1=c.u1;}
 // Side streets: houses face the side street on both sides, from past the corner lots outward.
 W.sidePlans=[];
 JUNCTIONS.forEach((j,i)=>{const f=W.sideFrames[i];
  for(let u=46;u<f.length-10;u+=26)for(const ss of [-1,1]){const rand=W.lotRand(2,i,u,ss);
   const P=planHouse(rand,{frame:f,frameId:f.id,u:u+rand()*4,side:ss,setback:16.6+rand()*2.2,lod:u<80?'full':'mid'});
   W.sidePlans.push(P);W.cuts.push(planCut(P,f.id,j.half));}});
 return plans;
}

// Building -----------------------------------------------------------------------------------
export function buildHouses(W){
 const {K}=W;
 W.alexWindow=new THREE.MeshStandardMaterial({color:0x5b6870,emissive:0xffc46a,emissiveIntensity:0,roughness:.35});
 W.interiors={};
 for(const P of W.plans){buildHouse(W,P);if(P.key){W.homes[P.key]=P;}}
 for(const P of W.sidePlans)buildHouse(W,P);
 for(const P of [...W.plans,...W.sidePlans])buildDrive(W,P);
 W.makeDynamic=makeDynamic;
}

export function buildHouse(W,P){
 // Mid-detail houses trade rounded boxes for plain ones; they are seen from 40 m and more.
 const mid=P.lod!=='full',K=mid?{...W.K,rbox:(g,x,y,z,w,h,d,r,c)=>W.K.box(g,x,y,z,w,h,d,c)}:W.K,rand=seedFrom(P.seedA),pick=pickFrom(rand);W={...W,K};
 const root=W.drape(P.frame,P.u,{far:!!P.far,groundFn:P.groundFn}),g=K.group(root,P.side*P.setback,-P.u,P.houseRot);
 const {w,depth,h,front}=P,W2=w/2,D2=depth/2,T=HOUSE.trim;P.dc??=P.u;
 const siding=W.surfaceMaterial(K.mat(P.wall),'siding'),roofMat=W.surfaceMaterial(K.mat(P.roofColor),'roof'),brick=W.surfaceMaterial(K.mat(HOUSE.brick),'brick');
 const gable=siding;
 P.localPads=[];P.glassList=[];P.g=g;
 const pad=(x0,x1,z0,z1,y)=>P.localPads.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y});

 // Foundation and walls. Friend homes with a working door get a real opening.
 K.rbox(g,0,-.05,0,w+.12,.86,depth+.12,.03,HOUSE.foundation);
 const opening=P.interior==='foyer';
 if(opening){const t=.2,dx=P.doorX,ow=1.02,oh=2.16;
  K.box(g,0,h/2+.14,-D2+t/2,w,h-.28,t,siding);for(const s of [-1,1])K.box(g,s*(W2-t/2),h/2+.14,0,t,h-.28,depth,siding);
  const l=dx-ow/2-(-W2),r=W2-(dx+ow/2);K.box(g,-W2+l/2,h/2+.14,D2-t/2,l,h-.28,t,siding);K.box(g,W2-r/2,h/2+.14,D2-t/2,r,h-.28,t,siding);
  const top=P.floor+oh;K.box(g,dx,(top+h)/2,D2-t/2,ow,h-top,t,siding);K.box(g,dx,(.28+P.floor)/2,D2-t/2,ow,P.floor-.28,t,siding);
  K.box(g,0,h-.02,0,w,.04,depth,siding);
 }else K.rbox(g,0,h/2+.14,0,w,h-.28,depth,.05,siding);
 // Brick: a low wainscot band or a full brick front.
 if(P.brick==='lower'&&!mid)K.rbox(g,0,.62,D2+.025,w+.03,1.05,.05,.015,brick);
 if(P.brick==='front'){K.rbox(g,0,h/2+.1,D2+.03,w+.04,h-.2,.06,.015,brick);}
 // Corner boards.
 if(!mid)for(const [x,z] of [[-1,1],[1,1],[-1,-1],[1,-1]]){K.box(g,x*(W2+.01),h/2+.15,z*(D2+.01),.13,h-.3,.13,T);}
 // Windows on all four walls, avoiding the door and garage.
 const face=(wall,a,y=0)=>wall==='front'?K.group(g,a,D2,0,y):wall==='back'?K.group(g,a,-D2,Math.PI,y):wall==='left'?K.group(g,-W2,a,-Math.PI/2,y):K.group(g,W2,a,Math.PI/2,y);
 const winW=P.stories===2?1.1:1.3,winH=P.stories===2?1.35:1.25,rows=P.stories===2?[1.6,4.3]:[1.55];
 const count=Math.max(2,Math.round(w/3.3));
 function windowUnit(fg,x,y,ww,wh,{shutter=null,glass=null,lit=true,simple=false}={}){
  const gl=glass||(lit&&rand()<.78?pick(W.windowMats):W.darkGlass);K.box(fg,x,y,0,ww,wh,.06,gl);P.glassList.push(gl);const t=.08;
  if(mid||simple){K.box(fg,x,y,-.01,ww+.2,wh+.2,.06,T);if(shutter)for(const s of [-1,1])K.box(fg,x+s*(ww/2+.27),y,.01,.36,wh+.1,.04,shutter);return gl;}
  K.box(fg,x,y+wh/2+t/2,.03,ww+.22,t,.08,T);K.box(fg,x,y-wh/2-t/2,.05,ww+.32,t,.14,T);for(const s of [-1,1])K.box(fg,x+s*(ww/2+t/2),y,.03,t,wh,.08,T);
  if(!mid){K.box(fg,x,y,.035,.035,wh,.025,T);K.box(fg,x,y+wh*.08,.035,ww,.035,.025,T);
   if(rand()<.7){for(const s of [-1,1])K.box(fg,x+s*ww*.34,y+.02,.033,ww*.2,wh-.12,.012,HOUSE.curtain);}}
  if(shutter)for(const s of [-1,1])K.box(fg,x+s*(ww/2+.27),y,.03,.36,wh+.1,.05,shutter);
  return gl;}
 const front1=face('front',0);
 rows.forEach((y,f)=>{for(let i=0;i<count;i++){const x=-W2+w*(i+.5)/count;if(f===0&&Math.abs(x-P.doorX)<1.4)continue;
  const special=P.alexWindow&&f===rows.length-1&&i===count-1?W.alexWindow:null;windowUnit(front1,x,y,winW,winH,{shutter:P.shutters,glass:special});}});
 // Rear windows and a back door.
 const back=face('back',0),rearCount=Math.max(2,Math.round(w/3.8)),backDoorX=(P.seedB-.5)*w*.4;
 rows.forEach((y,f)=>{for(let i=0;i<rearCount;i++){const x=-W2+w*(i+.5)/rearCount;if(f===0&&Math.abs(x+backDoorX)<1.5)continue;windowUnit(back,x,y,winW*.95,winH*.9,{simple:true});}});
 {const x=-backDoorX,bd=back;K.box(bd,x,1.2,0,1.7,2.0,.06,pick(W.windowMats));K.box(bd,x,1.2,.03,.05,2.0,.05,T);for(const s of [-1,1])K.box(bd,x+s*.88,1.2,.03,.08,2.1,.08,T);K.box(bd,x,2.24,.03,1.84,.08,.08,T);K.box(bd,x,.21,.12,1.9,.08,.3,HOUSE.step);}
 // Side windows, except where the garage covers the wall.
 for(const s of [-1,1]){if(P.hasGarage&&s===P.gs)continue;const wall=s<0?'left':'right';rows.forEach(y=>{for(const z of depth>9.4?[-D2*.45,D2*.4]:[0]){windowUnit(face(wall,z),0,y,1,1.2,{simple:true});}});}
 // Front door, porch light and the entry.
 if(!opening){const fd=face('front',P.doorX,P.floor);K.box(fd,0,1.08,.02,1.28,2.3,.07,T);K.rbox(fd,0,1.02,.04,.94,2.04,.05,.01,P.door);
  for(const yy of [.55,1.45])K.rbox(fd,0,yy,.07,.64,.62,.02,.01,P.door);K.ball(fd,-P.gs*.36,1.02,.09,.035,0xc9b27a);if(rand()<.4)K.box(fd,0,1.78,.071,.5,.22,.01,pick(W.windowMats));}
 else{const fd=face('front',P.doorX,P.floor);K.box(fd,0,2.2,.02,1.3,.1,.08,T);for(const s of [-1,1])K.box(fd,s*.58,1.08,.02,.1,2.2,.08,T);}
 // Jamie's porch light is switched on by Jamie's mother, so it gets a material of its own.
 const porchMat=P.porchMat||(P.key==='jamie'?new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:.05}):pick(W.porchMats));P.porchMat=porchMat;
 {const lx=P.doorX+P.gs*.8,lt=face('front',lx,P.floor);K.box(lt,0,1.84,.06,.1,.05,.12,0x2d2d2b);K.box(lt,0,1.72,.1,.15,.22,.15,porchMat);K.box(lt,0,1.86,.1,.19,.04,.19,0x2d2d2b);P.porchLight={x:lx,y:P.floor+1.72,z:D2+.1};}
 buildEntry(W,P,g,rand,mid);
 // Roof, and the garage beside it.
 const roofY=h;
 if(P.roof==='hip')hipRoof(W,g,w,depth,roofY,P.rise,.45,roofMat,{mid});
 else gableRoof(W,g,w,depth,roofY,P.rise,.35,.45,roofMat,gable,P.roof==='side',{mid});
 if(P.dormers)for(let k=0;k<P.dormers;k++){const x=-W2+w*(k+.5)/P.dormers;dormer(W,g,x,D2-.35,roofY,P,roofMat,gable,rand,mid);}
 if(P.chimney==='interior'){const cx=(P.seedC-.5)*w*.5,cz=-depth*.2,top=roofY+P.rise+.9;K.rbox(g,cx,(roofY+top)/2,cz,.9,top-roofY,.8,.03,brick);K.rbox(g,cx,top+.06,cz,1.02,.12,.92,.02,HOUSE.stone);K.cyl(g,cx+.18,top+.25,cz,.09,.3,0x5d5a55,8);}
 if(P.chimney==='exterior'){const cs=P.hasGarage?-P.gs:1,cz=-depth*.12,top=roofY+P.rise+.8,x=cs*(W2+.42);K.rbox(g,x,top/2-.2,cz,.78,top+.4,1.05,.03,brick);K.rbox(g,x,top+.06,cz,.9,.12,1.18,.02,HOUSE.stone);K.rbox(g,x,roofY*.55,cz,.95,.1,1.2,.02,HOUSE.stone);K.cyl(g,x,top+.25,cz+.2,.09,.3,0x5d5a55,8);}
 if(P.hasGarage)buildGarage(W,P,g,rand,mid,siding,roofMat,gable);
 // Everyday things around the house.
 if(!mid){foundationBeds(W,P,g,rand);if(P.ac){const s=P.hasGarage?-P.gs:1;const ac=K.group(g,s*(W2+.55),-D2*.45);K.box(ac,0,.05,0,.9,.1,.9,HOUSE.step);K.rbox(ac,0,.45,0,.75,.72,.75,.04,HOUSE.acUnit);K.cyl(ac,0,.82,0,.28,.03,0x3a3c3c,14);}}
 buildRear(W,P,g,rand,mid);
 if(P.interior==='foyer')buildFoyer(W,P,g);
 // Where people can stand: porch, steps, garage floor.
 const px0=P.doorX-P.porchW/2,px1=P.doorX+P.porchW/2;pad(px0,px1,front,front+P.pdep,P.floor);
 for(let k=0;k<P.steps-1;k++){const z=front+P.pdep+.3*(P.steps-1-k);pad(P.doorX-.8,P.doorX+.8,z,z+.3,P.floor*(k+1)/P.steps);}
 if(P.hasGarage)pad(P.gx-P.gw/2+.15,P.gx+P.gw/2-.15,P.gfront-P.gd+.15,P.gfront,.2);
 // Placement registry: the house, its garage and porch.
 const c=P.toWorld(P.hasGarage?P.gx/2:0,0),hw=W2+(P.hasGarage?P.gw/2:0)+.6,hd=D2+.8;W.space.rect(c.x,c.z,hw,hd+.6,P.worldRot,'house');
 const e=P.toWorld(P.doorX,front+P.pdep/2+.3*P.steps/2);W.space.rect(e.x,e.z,P.porchW/2+.3,P.pdep/2+.3*P.steps/2+.4,P.worldRot,'porch');
 if(P.frame===MAIN){const a=P.S(-W2-(P.hasGarage&&P.gs<0?P.gw:0)-.4,-D2-.4),b=P.S(W2+(P.hasGarage&&P.gs>0?P.gw:0)+.4,P.stepFront+.3);W.obstacles.push({d0:Math.min(a.d,b.d),d1:Math.max(a.d,b.d),l0:Math.min(a.lat,b.lat),l1:Math.max(a.lat,b.lat),house:true});}
 P.info=P;(P.far?W.farHouses:W.houses).push(P);return P;
}
const seedFrom=x=>{let s=Math.floor(x*4294967296)>>>0||7;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};};

// A board between two points: length along A->B, 'up' fixes its roll. -------------------------
// Wind a triangle so its face points along dir.
export function outward(t,dir){const e1=[t[3]-t[0],t[4]-t[1],t[5]-t[2]],e2=[t[6]-t[0],t[7]-t[1],t[8]-t[2]],n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
 return n[0]*dir[0]+n[1]*dir[1]+n[2]*dir[2]<0?[...t.slice(0,3),...t.slice(6,9),...t.slice(3,6)]:t;}
const _m=new THREE.Matrix4(),_x=new THREE.Vector3(),_y=new THREE.Vector3(),_z=new THREE.Vector3();
function board(K,g,A,B,thick,width,up,c){const a=new THREE.Vector3(...A),b=new THREE.Vector3(...B);_x.subVectors(b,a);const len=_x.length();_x.normalize();_y.set(...up);_y.addScaledVector(_x,-_y.dot(_x)).normalize();_z.crossVectors(_x,_y);
 const m=new THREE.Mesh(K.boxGeo,K.M(c));_m.makeBasis(_x,_y,_z);m.quaternion.setFromRotationMatrix(_m);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.set(len,thick,width);g.add(m);return m;}
function roofFaces(K,g,verts,m){
 const faces=[];
 for(let i=0;i<verts.length;i+=9){const ax=verts[i+3]-verts[i],az=verts[i+5]-verts[i+2],bx=verts[i+6]-verts[i],bz=verts[i+8]-verts[i+2];
  if(Math.abs(az*bx-ax*bz)<1e-8)continue;
  if(az*bx-ax*bz<0)for(let j=0;j<3;j++)[verts[i+3+j],verts[i+6+j]]=[verts[i+6+j],verts[i+3+j]];
  faces.push(...verts.slice(i,i+9));}
 const mesh=K.tri(g,faces,m);mesh.name='roof-slope';return mesh;
}
// Gable roof with fascia, rake boards, soffits, ridge cap, gutters and downspouts.
// alongX: the ridge runs across the facade (side gables); otherwise front to back.
export function gableRoof(W,g,Wd,Dd,y0,rise,ox,oz,roofMat,wallMat,alongX=true,{mid=false,gutters=true,vent=true}={}){
 const {K}=W,[a,b]=alongX?[Wd,Dd]:[Dd,Wd],L=a/2+ox,Hb=b/2+oz,ye=y0-oz*rise/(b/2),top=y0+rise;
 const P=(u,y,v)=>alongX?[u,y,v]:[v,y,u],dims=(du,dy,dv)=>alongX?[du,dy,dv]:[dv,dy,du];
 const sl=[];for(const s of [-1,1]){const e0=P(-L,ye,s*Hb),e1=P(L,ye,s*Hb),r0=P(-L,top,0),r1=P(L,top,0);sl.push(...e0,...r1,...e1,...e0,...r0,...r1);}
 roofFaces(K,g,sl,roofMat);
 const gab=[];for(const e of [-1,1]){const x=e*a/2;gab.push(...outward([...P(x,y0,-b/2),...P(x,top,0),...P(x,y0,b/2)],P(e,0,0)));}K.tri(g,gab,wallMat);
 const F=HOUSE.fascia,slopeUp=s=>{const n=P(0,b/2,s*rise);const l=Math.hypot(...n);return n.map(v=>v/l);};
 for(const s of [-1,1]){K.box(g,...P(0,ye-.09,s*(Hb+.03)),...dims(2*L+.06,.2,.06),F);
  K.box(g,...P(0,ye-.19,s*(b/2+oz/2)),...dims(2*L,.03,oz),HOUSE.soffit);
  for(const e of [-1,1]){board(K,g,P(e*(L+.03),ye,s*Hb),P(e*(L+.03),top+.02,0),.2,.06,[0,1,0],F);
   if(!mid)board(K,g,P(e*(a/2+ox/2),ye-.13,s*Hb),P(e*(a/2+ox/2),top-.13,0),.03,ox,slopeUp(s),HOUSE.soffit);}
  if(gutters)gutter(W,g,P,dims,a,b,L,Hb,ye,s,mid);}
 K.box(g,...P(0,top+.03,0),...dims(2*L,.07,.26),0x3d3b39);
 if(vent&&!mid)for(const e of [-1,1]){K.box(g,...P(e*(a/2+.03),y0+rise*.5,0),...dims(.04,.5,.62),HOUSE.trim);K.box(g,...P(e*(a/2+.05),y0+rise*.5,0),...dims(.02,.38,.48),0x6d6a62);}
}
function gutter(W,g,P,dims,a,b,L,Hb,ye,s,mid){const {K}=W;
 K.box(g,...P(0,ye-.13,s*(Hb+.1)),...dims(2*L-.1,.11,.12),HOUSE.gutter);
 if(mid)return;
 for(const e of [-1,1]){const u=e*(a/2-.18),x0=P(u,ye-.17,s*(Hb+.1)),x1=P(u,ye-.5,s*(b/2+.07)),x2=P(u,.34,s*(b/2+.07)),x3=P(u,.1,s*(b/2+.38));
  board(K,g,x0,x1,.07,.07,[0,0,1],HOUSE.downspout);board(K,g,x1,x2,.07,.07,[0,0,1],HOUSE.downspout);board(K,g,x2,x3,.07,.07,[0,1,0],HOUSE.downspout);}
}
// Hip roof: slopes on all four sides, eaves all around.
export function hipRoof(W,g,Wd,Dd,y0,rise,o,roofMat,{mid=false,gutters=true,bare=false}={}){
 const {K}=W,along=Wd>=Dd,[a,b]=along?[Wd,Dd]:[Dd,Wd],P=(u,y,v)=>along?[u,y,v]:[v,y,u],dims=(du,dy,dv)=>along?[du,dy,dv]:[dv,dy,du];
 const L=a/2+o,H=b/2+o,r=Math.max(0,(a-b)/2),ye=y0-o*rise/(b/2),top=y0+rise,E=[P(-L,ye,H),P(L,ye,H),P(L,ye,-H),P(-L,ye,-H)],R0=P(-r,top,0),R1=P(r,top,0),v=[];
 v.push(...E[0],...R1,...E[1],...E[0],...R0,...R1,...E[2],...R0,...E[3],...E[2],...R1,...R0,...E[1],...R1,...E[2],...E[3],...R0,...E[0]);
 roofFaces(K,g,v,roofMat);const F=HOUSE.fascia;if(bare)return;
 for(const s of [-1,1]){K.box(g,...P(0,ye-.09,s*(H+.03)),...dims(2*L+.06,.2,.06),F);K.box(g,...P(s*(L+.03),ye-.09,0),...dims(.06,.2,2*H+.06),F);
  K.box(g,...P(0,ye-.19,s*(b/2+o/2)),...dims(2*L,.03,o),HOUSE.soffit);K.box(g,...P(s*(a/2+o/2),ye-.19,0),...dims(o,.03,2*H),HOUSE.soffit);
  if(gutters)gutter(W,g,P,dims,a,b,L,H,ye,s,mid);}
 const cap=0x3d3b39;if(r>.01)K.box(g,...P(0,top+.03,0),...dims(2*r,.07,.24),cap);
 if(!mid)for(const [c,rr] of [[E[0],R0],[E[1],R1],[E[2],R1],[E[3],R0]]){const cc=[...c];cc[1]+=.04;const r2=[...rr];r2[1]+=.04;board(K,g,cc,r2,.06,.2,[0,1,0],cap);}
}
function dormer(W,g,x,z,roofY,P,roofMat,gable,rand,mid){const {K}=W,dg=K.group(g,x,z-.9,0,roofY+.1);
 K.box(dg,0,.62,0,1.3,1.25,1.8,W.surfaceMaterial(K.mat(P.wall),'siding'));gableRoof(W,dg,1.3,1.8,1.25,.62,.12,.16,roofMat,gable,false,{mid,gutters:false,vent:false});
 const fg=K.group(dg,0,.9,0);K.box(fg,0,.62,0,.7,.8,.06,rand()<.7?W.windowMats[Math.floor(rand()*8)]:W.darkGlass);for(const s of [-1,1])K.box(fg,s*.39,.62,.03,.08,.86,.08,HOUSE.trim);K.box(fg,0,1.06,.03,.86,.08,.08,HOUSE.trim);K.box(fg,0,.18,.05,.9,.08,.12,HOUSE.trim);}

// Porch, portico or stoop; steps reach the ground (local y = 0 is the ground everywhere).
function buildEntry(W,P,g,rand,mid){const {K}=W,{front}=P,dx=P.doorX,fl=P.floor,pw=P.porchW,pd=P.pdep,n=P.steps,F=HOUSE.fascia,col=HOUSE.trim;
 K.rbox(g,dx,fl/2,front+pd/2,pw,fl,pd,.025,HOUSE.porchFloor);
 for(let k=0;k<n-1;k++){const z=front+pd+.15+.3*(n-2-k),y=fl*(k+1)/n;K.box(g,dx,y/2,z,1.6,y,.32,HOUSE.step);}
 if(P.porch==='porch'){const ph=P.lowPorch?P.eaveFront-.12-.25-.24-fl:2.75;
  // Lattice skirt under the porch floor edge.
  if(!mid)K.box(g,dx,fl*.45,front+pd-.03,pw-.1,fl*.8,.04,0x8f8778);
  const cols=[-1,1,...(pw>=5?[0]:[])];
  for(const s of cols){const cx=dx+s*(pw/2-.16);if(s===0)continue;column(K,g,cx,fl,front+pd-.16,ph,mid);}
  if(pw>=5)for(const s of [-.5,.5])column(K,g,dx+s*(pw-.4),fl,front+pd-.16,ph,mid);
  // Porch roof: beam, a shallow shed roof back to the wall, fascia, ceiling.
  K.box(g,dx,fl+ph+.1,front+pd-.16,pw+.1,.22,.2,col);K.box(g,dx,fl+ph+.02,front+pd/2,pw+.1,.03,pd,HOUSE.soffit);
  // Two-story houses: the porch roof meets the wall. One-story: it starts under the main eave.
  const roofRise=P.lowPorch?.25:.5,y1=fl+ph+.24,y2=y1+roofRise,z0=P.lowPorch?front+.47:front,z1=front+pd+.3;
  if(P.lowPorch)K.box(g,dx,y1-.02,front+.25,pw+.1,.03,.5,HOUSE.soffit);
  const verts=[dx-pw/2-.2,y1,z1,dx+pw/2+.2,y1,z1,dx+pw/2+.2,y2,z0,dx-pw/2-.2,y1,z1,dx+pw/2+.2,y2,z0,dx-pw/2-.2,y2,z0];
  roofFaces(K,g,verts,W.surfaceMaterial(K.mat(P.roofColor),'roof'));K.box(g,dx,y1-.07,z1+.03,pw+.46,.18,.06,F);
  for(const s of [-1,1]){const x=dx+s*(pw/2+.2);board(K,g,[x,y1,z1],[x,y2,z0],.16,.06,[0,1,0],F);}
  // Railings between the columns, open at the steps.
  if(!mid)for(const s of [-1,1]){const x0=dx+s*.95,x1=dx+s*(pw/2-.16);if(Math.abs(x1-x0)<.4)continue;
   K.box(g,(x0+x1)/2,fl+.86,front+pd-.16,Math.abs(x1-x0),.06,.08,col);K.box(g,(x0+x1)/2,fl+.1,front+pd-.16,Math.abs(x1-x0),.05,.06,col);
   for(let x=Math.min(x0,x1)+.14;x<Math.max(x0,x1)-.05;x+=.2)K.box(g,x,fl+.48,front+pd-.16,.045,.74,.045,col);}
  // A pair of chairs on some porches.
  if(!mid&&rand()<.55){const cx=dx-P.gs*(pw/2-.9);for(const k of [0,1])chair(K,g,cx+k*.75*-P.gs,fl,front+1.1,0xf1efe9);}
 }else if(P.porch==='portico'){const ph=2.6;for(const s of [-1,1])column(K,g,dx+s*(pw/2-.18),fl,front+pd-.18,ph,mid);
  K.box(g,dx,fl+ph+.1,front+pd/2,pw+.2,.2,pd+.1,col);gableRoof(W,K.group(g,dx,front+pd/2,0,0),pw+.2,pd+.1,fl+ph+.2,.7,.1,.12,W.surfaceMaterial(K.mat(P.roofColor),'roof'),W.surfaceMaterial(K.mat(HOUSE.trim),'siding'),false,{mid,gutters:false,vent:false});}
 else if(P.stories>1||P.eaveFront===null){// Stoop: a small gabled hood on brackets over the door.
  const hood=K.group(g,dx,front+.5,0,0);gableRoof(W,hood,1.7,.95,2.62,.42,.08,.1,W.surfaceMaterial(K.mat(P.roofColor),'roof'),W.surfaceMaterial(K.mat(HOUSE.trim),'siding'),false,{mid,gutters:false,vent:false});
  for(const s of [-1,1])board(K,g,[dx+s*.72,2.2,front+.02],[dx+s*.72,2.6,front+.8],.08,.08,[0,0,1],col);
  if(!mid&&n>=3)for(const s of [-1,1])K.rod(g,[dx+s*.72,fl+.9,front+pd],[dx+s*.72,.9,front+pd+.3*(n-1)],.02,0x2d2d2b);}
 // One-story stoops sit under the main eave, which already covers the door.
}
function column(K,g,x,y,z,hgt,mid){if(mid){K.box(g,x,y+hgt/2,z,.18,hgt,.18,HOUSE.trim);return;}
 K.lathe(g,[[.001,0],[.13,0],[.13,.12],[.1,.16],[.09,.24],[.085,hgt-.3],[.1,hgt-.2],[.12,hgt-.12],[.14,hgt-.08],[.14,hgt],[.001,hgt]],x,y,z,HOUSE.trim,8);}
function chair(K,g,x,y,z,c){const cg=K.group(g,x,z,Math.PI,y);K.box(cg,0,.38,0,.52,.05,.5,c);const b=K.box(cg,0,.72,-.26,.52,.62,.05,c);b.rotation.x=.22;for(const s of [-1,1]){K.box(cg,s*.27,.55,0,.05,.05,.52,c);K.box(cg,s*.24,.18,-.2,.04,.36,.04,c);K.box(cg,s*.24,.18,.2,.04,.36,.04,c);}}

// Attached garage: walls, roof, door (or a real opening with an interior shell for friends).
function buildGarage(W,P,g,rand,mid,siding,roofMat,gable){const {K}=W,{gx,gw,gd,gh,gfront}=P,gz=gfront-gd/2,doorW=gw>5?5.1:2.75,dh=2.15,T=HOUSE.trim;P.garageInfo={x:gx,front:gfront,doorW,doorH:dh,depth:gd,y:.2};
 K.rbox(g,gx,-.05,gz,gw+.1,.86,gd+.1,.03,HOUSE.foundation);
 if(P.dynamicGarage){const t=.16;K.box(g,gx-P.gs*(gw/2-t/2),gh/2+.1,gz,t,gh-.2,gd,siding);K.box(g,gx+P.gs*(gw/2-t/2),gh/2+.1,gz,t,gh-.2,gd,siding);K.box(g,gx,gh/2+.1,gz-gd/2+t/2,gw,gh-.2,t,siding);
  const jw=(gw-doorW)/2;for(const s of [-1,1])K.box(g,gx+s*(doorW/2+jw/2),gh/2+.1,gfront-t/2,jw,gh-.2,t,siding);K.box(g,gx,dh+.2+(gh-dh-.2)/2,gfront-t/2,doorW,gh-dh-.2,t,siding);K.box(g,gx,gh-.02,gz,gw,.04,gd,siding);
  buildGarageInterior(W,P,g,rand,doorW,dh);}
 else{K.rbox(g,gx,gh/2+.1,gz,gw,gh-.2,gd,.04,siding);
  const dg=K.group(g,gx,gfront+.01,0,.2);K.box(dg,0,dh/2,0,doorW,dh,.06,P.garageColor);
  for(let k=1;k<4;k++)K.box(dg,0,k*dh/4,.035,doorW,.035,.02,0xb3ad9f);const cols=doorW>3?8:4;
  if(!mid)for(let k=1;k<cols;k++)K.box(dg,-doorW/2+doorW*k/cols,dh/2,.035,.03,dh,.02,0xc4beb0);
  if(rand()<.4)for(let k=0;k<cols;k++)K.box(dg,-doorW/2+doorW*(k+.5)/cols,dh*.86,.04,doorW/cols*.7,.22,.02,W.darkGlass);}
 K.box(g,gx,dh+.28,gfront+.02,doorW+.3,.12,.08,T);for(const s of [-1,1])K.box(g,gx+s*(doorW/2+.1),dh/2+.2,gfront+.02,.12,dh,.08,T);
 if(!mid)for(const [x,z] of [[1,1],[1,-1]])K.box(g,gx+P.gs*x*(gw/2+.01),gh/2+.1,gz+z*(gd/2+.01),.12,gh-.2,.12,T);
 // Roof matching the house: a lower side gable, a front gable, or a hip.
 const rg=K.group(g,gx,gz,0,0);
 if(P.garageRoof==='hip')hipRoof(W,rg,gw,gd,gh,1.3,.35,roofMat,{mid});
 else if(P.garageRoof==='front')gableRoof(W,rg,gw,gd,gh,1.35,.3,.35,roofMat,gable,false,{mid});
 else gableRoof(W,rg,gw,gd,gh,1.25,.3,.35,roofMat,gable,true,{mid,vent:false});
 // Coach lights, a side window and a service door on the outer wall.
 if(rand()<.65)for(const s of [-1,1]){const lg=K.group(g,gx+s*(doorW/2+.45),gfront+.02,0,0);K.box(lg,0,2.35,.08,.14,.22,.14,P.porchMat);K.box(lg,0,2.48,.08,.18,.04,.18,0x2d2d2b);}
 const og=K.group(g,gx+P.gs*(gw/2),gz+gd*.18,P.gs>0?Math.PI/2:-Math.PI/2,0);
 K.box(og,0,1.02,0,.9,2.0,.05,P.door);K.box(og,0,2.08,.02,1.05,.08,.07,T);for(const s of [-1,1])K.box(og,s*.49,1.02,.02,.08,2.05,.07,T);K.ball(og,.33,1.0,.05,.03,0xc9b27a);
 if(!mid){const wg=K.group(g,gx+P.gs*(gw/2),gz-gd*.25,P.gs>0?Math.PI/2:-Math.PI/2,0);K.box(wg,0,1.6,0,.9,.8,.06,W.darkGlass);K.box(wg,0,2.04,.03,1.05,.08,.08,T);K.rbox(wg,0,1.16,.05,1.1,.08,.13,.015,T);}
 // Driveway basketball hoop on some garages.
 if(!mid&&(P.key==='hoop'||(!P.key&&rand()<.16))){K.rbox(g,gx,3.28,gfront+.06,1.7,1.0,.06,.02,0xefeee8);K.box(g,gx,3.2,gfront+.1,.58,.42,.02,0xba5a44);K.box(g,gx,2.95,gfront+.18,.12,.05,.25,0x8a8c88);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.018,5,16),K.mat(0xc05a33));ring.rotation.x=Math.PI/2;ring.position.set(gx,3.05,gfront+.36);g.add(ring);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;K.rod(g,[gx+Math.cos(a)*.22,3.04,gfront+.36+Math.sin(a)*.22],[gx+Math.cos(a)*.13,2.62,gfront+.36+Math.sin(a)*.13],.004,0xe8e6e0,.004,3);}}
}
function foundationBeds(W,P,g,rand){const {K}=W,pick=pickFrom(rand),{front,w}=P,W2=w/2;
 for(const [x0,x1] of [[-W2+.3,P.doorX-P.porchW/2-.2],[P.doorX+P.porchW/2+.2,W2-.3]]){if(x1-x0<1)continue;
  K.box(g,(x0+x1)/2,.03,front+.55,x1-x0,.06,.9,HOUSE.mulch);
  for(let x=x0+.6;x<x1-.3;x+=1.5+rand()*.6){K.ball(g,x,.42,front+.55,.42+rand()*.2,W.foliageMat(pick([0x5d7048,0x546a43,0x687a4c])),[1.2,.85,1]);
   if(rand()<.5)for(let k=0;k<4;k++)K.ball(g,x+.4+rand()*.4,.2,front+.82+rand()*.2,.07,pick([0xd4665a,0xe8c160,0xd98fb0,0xf0ede0]));}}
}
function buildRear(W,P,g,rand,mid){const {K}=W,D2=P.depth/2,x0=(P.seedB-.5)*P.w*.4;
 if(P.rear==='patio'){K.rbox(g,x0,.05,-D2-1.6,3.6,.1,3,.03,HOUSE.walk);if(P.grill&&!mid){const gr=K.group(g,x0+1.2,-D2-2.2,0,0);K.rbox(gr,0,.75,0,.6,.3,.45,.08,0x2b2b2d);for(const s of [-1,1])K.rod(gr,[s*.25,0,0],[s*.25,.62,0],.02,0x2b2b2d);}}
 if(P.rear==='deck'){const dy=.55,dw=4.4,dd=3.2;K.box(g,x0,dy,-D2-dd/2,dw,.1,dd,HOUSE.deck);for(const [sx,sz] of [[-1,-1],[1,-1]])K.box(g,x0+sx*(dw/2-.1),dy/2,-D2-dd+.1,.12,dy,.12,HOUSE.deck);
  if(!mid){for(const s of [-1,1])K.box(g,x0+s*(dw/2-.04),dy+.5,-D2-dd/2,.05,.05,dd,HOUSE.deck);K.box(g,x0,dy+.5,-D2-dd+.03,dw,.05,.05,HOUSE.deck);
   for(let x=-dw/2+.2;x<dw/2;x+=.18)K.box(g,x0+x,dy+.25,-D2-dd+.03,.035,.5,.035,HOUSE.deck);
   for(let k=0;k<3;k++)K.box(g,x0+dw/2-.6,dy*(k+.5)/3,-D2-dd-.15-.28*(2-k),.9,.05,.28,HOUSE.deck);
   if(P.grill){const gr=K.group(g,x0-dw/2+.7,-D2-1,0,dy+.05);K.rbox(gr,0,.75,0,.6,.3,.45,.08,0x2b2b2d);for(const s of [-1,1])K.rod(gr,[s*.25,0,0],[s*.25,.62,0],.02,0x2b2b2d);}}}
}

// Friend-home foyer: a real doorway into a warm, shallow entry hall -----------------------
function buildFoyer(W,P,g){const {K}=W,{front,h}=P,dx=P.doorX,fl=P.floor,hinge=P.gs,z0=front-.2,depth=3.6,width=2.9,cx=dx-hinge*.25,top=fl+2.62;
 const lit=new THREE.MeshStandardMaterial({color:INTERIOR.wall,emissive:0xffb070,emissiveIntensity:.34,roughness:.95,side:THREE.BackSide});lit.userData.keep=true;
 const floorM=new THREE.MeshStandardMaterial({color:INTERIOR.floor,emissive:0x5a3418,emissiveIntensity:.25,roughness:.7});floorM.userData.keep=true;
 const warm=new THREE.MeshStandardMaterial({color:INTERIOR.lamp,emissive:0xffd49a,emissiveIntensity:1.4});
 const room=K.box(g,cx,(fl+top)/2,z0-depth/2,width,top-fl,depth,lit);room.name='foyer';
 K.box(g,cx,fl+.01,z0-depth/2,width-.02,.02,depth-.02,floorM);K.box(g,cx+hinge*.2,fl+.025,z0-1.5,1.2,.01,1.8,INTERIOR.rug);
 // Threshold, jambs and the reveal through the wall.
 K.box(g,dx,fl+.02,front-.1,1.02,.04,.24,0x9a8a70);for(const s of [-1,1])K.box(g,dx+s*.5,fl+1.08,front-.1,.04,2.16,.22,HOUSE.trim);K.box(g,dx,fl+2.14,front-.1,1.02,.04,.22,HOUSE.trim);
 // Stairs rising along the far wall, a banister, a hall table with a lamp, a lit doorway beyond.
 const sx=cx-hinge*(width/2-.5);for(let k=0;k<9;k++){K.box(g,sx,fl+.09+.18*k,z0-.9-.28*k,.9,.18*(k+1),.28,INTERIOR.stair);}
 K.rod(g,[sx+hinge*.45,fl+1,z0-.8],[sx+hinge*.45,fl+2.6,z0-3.3],.025,0x5a3a24);K.box(g,sx+hinge*.45,fl+.5,z0-.75,.08,1,.08,0x5a3a24);
 const tx=cx+hinge*(width/2-.35);K.box(g,tx,fl+.4,z0-1.7,.4,.05,.9,0x6a4a30);for(const s of [-1,1])K.box(g,tx,fl+.19,z0-1.7+s*.4,.35,.38,.04,0x6a4a30);K.cyl(g,tx,fl+.62,z0-1.7,.1,.28,warm,10);
 K.box(g,cx+hinge*(width/2-.02),fl+1.6,z0-1.7,.02,.5,.4,0x6d5a44);K.box(g,cx,fl+2.58,z0-1.4,.34,.04,.34,warm);
 K.box(g,cx+hinge*.4,fl+1.05,z0-depth+.02,1,2.1,.02,warm);
 P.localPads.push({x0:cx-width/2,x1:cx+width/2,z0:z0-depth,z1:front,y:fl});
 W.interiors[P.key]={kind:'foyer',depth,width,room:room};
}
// Friend-home garage: a real opening, deep enough to drive into, full of ordinary things.
function buildGarageInterior(W,P,g,rand,doorW,dh){const {K}=W,{gx,gw,gd,gh,gfront}=P,gz=gfront-gd/2,s=P.gs,car=P.interior==='garage-car';
 const wallM=new THREE.MeshStandardMaterial({color:INTERIOR.garageWall,emissive:0xffe0a8,emissiveIntensity:.16,roughness:1,side:THREE.BackSide});wallM.userData.keep=true;
 const lamp=new THREE.MeshStandardMaterial({color:0xfff4d8,emissive:0xffe0a0,emissiveIntensity:1});
 const shell=K.box(g,gx,gh/2+.1,gz-.05,gw-.34,gh-.2,gd-.34,wallM);shell.name='garage-interior';
 K.box(g,gx,.21,gz,gw-.34,.02,gd-.3,INTERIOR.garageFloor);if(!car)K.box(g,gx+.3,.222,gz+.4,1.1,.004,1.6,0x6f6a62);
 K.box(g,gx,gh-.12,gz,.9,.05,.4,lamp);K.box(g,gx,gh-.25,gz-gd/2+1.2,.35,.18,.5,0x5a5a58);K.box(g,gx,gh-.22,gz+.4,.05,.05,gd-2.2,0x6a6a68);
 for(const k of [-1,1])K.box(g,gx+k*(doorW/2+.05),gh-.35,gz+.5,.05,.08,gd-1.8,0x6a6a68);
 // Shelving along the wall away from the house, with bins.
 const wx=gx+s*(gw/2-.55);for(const z of [gz-gd/2+.7,gz-gd/2+2.1]){for(const px of [-.25,.25])for(const pz of [-.55,.55])K.box(g,wx+px,1.2,z+pz,.04,2,.04,INTERIOR.shelf);
  for(const y of [.35,.9,1.45,2])K.box(g,wx,y,z,.55,.04,1.15,INTERIOR.shelf);for(const y of [.35,.9,1.45])for(const bz of [-.3,.3])K.rbox(g,wx,y+.18,z+bz,.45,.32,.45,.03,INTERIOR.bins[Math.floor(rand()*5)]);}
 // Workbench and pegboard on the back wall.
 const bz=gz-gd/2+.45,bx=gx-s*.4;K.box(g,bx,.9,bz,1.8,.06,.6,0x7a6040);for(const px of [-.8,.8])K.box(g,bx+px,.45,bz,.06,.9,.5,0x5a4630);K.box(g,bx,1.5,bz-.26,1.8,1,.03,INTERIOR.pegboard);
 for(let k=0;k<6;k++)K.box(g,bx-.7+k*.28,1.5+(k%2)*.2,bz-.23,.05,.3,.03,0x3a3a3a);K.box(g,gx+s*.2,.45,gz-gd/2+.4,.5,.9,.4,0xd8d6ce);
 // Water heater, a lawn mower, a kid's bike on the wall, a basketball.
 K.cyl(g,gx-s*(gw/2-.45),.95,gz-gd/2+.45,.28,1.5,0xd8d6ce,12);
 if(!car){const mx=gx-s*(gw/2-.8),mz=gz+.2;K.rbox(g,mx,.42,mz,.55,.3,.6,.05,0x3a6a3a);K.rod(g,[mx,.5,mz+.3],[mx,1.05,mz+.8],.015,0x2b2b2b);for(const k of [-1,1])for(const kk of [-1,1])K.cyl(g,mx+k*.28,.3,mz+kk*.25,.09,.05,0x222222,10,[0,0,Math.PI/2]);}
 for(const k of [-.3,.3]){const t=new THREE.Mesh(new THREE.TorusGeometry(.26,.025,5,16),K.mat(0x2b2b2b));t.position.set(gx+s*(gw/2-.28),1.7,gz+k);t.rotation.y=Math.PI/2;g.add(t);}
 K.rod(g,[gx+s*(gw/2-.28),1.7,gz-.3],[gx+s*(gw/2-.28),1.95,gz],.02,0xb03a2a);K.rod(g,[gx+s*(gw/2-.28),1.95,gz],[gx+s*(gw/2-.28),1.7,gz+.3],.02,0xb03a2a);
 K.ball(g,gx-s*(gw/2-.6),.33,gz+1,.12,0xc2652f);
 // Door into the house, two steps up, left ajar with light behind it.
 const hx=gx-s*(gw/2-.2),hz=gz-gd/2+1.5;const dg=K.group(g,hx,hz,s>0?Math.PI/2:-Math.PI/2,0);
 K.box(dg,0,1.3,-.05,.95,2.05,.05,new THREE.MeshStandardMaterial({color:0xffe6b8,emissive:0xffc070,emissiveIntensity:.9}));for(const k of [0,1])K.box(dg,0,.2+.09+k*.18,.3-.3*k,1.1,.18,.3,HOUSE.step);
 const leaf=K.box(dg,.3,1.3,.28,.05,2.04,.9,P.door);leaf.rotation.y=.3;
 P.localPads.push({x0:gx-gw/2+.2,x1:gx+gw/2-.2,z0:gfront-gd+.2,z1:gfront,y:.2});
 for(const [a,b,y] of [[.15,.45,.38],[-.15,.15,.56]])P.localPads.push({x0:Math.min(hx+s*a,hx+s*b),x1:Math.max(hx+s*a,hx+s*b),z0:hz-.55,z1:hz+.55,y});
 W.interiors[P.key]={kind:car?'garage-car':'garage',houseDoor:{x:hx+s*.6,z:hz},shell};
}

// Driveways and walks: bent at the curb and sidewalk, draped at the house -----------------------
function buildDrive(W,P){
 const {K}=W,f=P.frame,cf=P.frameId==='main'?CF:JUNCTIONS[W.sideFrames.indexOf(f)].half,walk1=cf+3.15,s=P.side;
 const mat=W.surfaceMaterial(K.mat(0xb4ab95),'concrete');
 const lengthLat=P.endLat,xa=P.drivX-P.drivW/2,xb=P.drivX+P.drivW/2;
 // Apron rises from the gutter to the walk; under the sidewalk it stays just below it; then it climbs to the garage slab.
 const profile=a=>a<cf+1.65?.035+(.152-.035)*smooth((a-cf+.08)/(1.65+.08)):a<=walk1?.152:SIDEWALK+.04*smooth((a-walk1)/Math.max(1,lengthLat-walk1));
 const ts=[],steps=[cf-.05,cf+.2,cf+.5,cf+.8,cf+1.1,cf+1.4,cf+1.65];for(const v of steps)ts.push(v);for(let v=cf+2.4;v<lengthLat;v+=1.2)ts.push(v);ts.push(lengthLat);
 const as=[0,.25,.5,.75,1],pos=[],idx=[],skirt=[];
 const place=(x,v)=>{// street-linear -> world, blending bent to draped
  const q=P.lin(x,0),u=q.u,wt=smooth((v-walk1-.4)/3.5);const b=f.point(u,s*v),L=P.L,du=u-P.u,dx=L.cx+du*L.fx+s*v*L.rx,dz=L.cz+du*L.fz+s*v*L.rz;
  const X=b.x+(dx-b.x)*wt,Z=b.z+(dz-b.z)*wt,pr=f.project(X,Z,u);return {x:X,z:Z,u:pr.u,v:pr.v};};
 for(const v of ts)for(const a of as){const x=xa+(xb-xa)*a,p=place(x,v),y=f.point(p.u,p.v).y+profile(Math.abs(p.v));pos.push(p.x,y,p.z);}
 const na=as.length;for(let j=0;j<ts.length-1;j++)for(let i=0;i<na-1;i++){const a0=j*na+i;idx.push(a0,a0+na,a0+1,a0+1,a0+na,a0+na+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);
 // Face up whatever the side.
 {const p=geo.attributes.position,a=new THREE.Vector3().fromBufferAttribute(p,idx[0]),b=new THREE.Vector3().fromBufferAttribute(p,idx[1]),c=new THREE.Vector3().fromBufferAttribute(p,idx[2]);if(b.sub(a).cross(c.sub(a)).y<0){for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];geo.setIndex(idx);}}
 geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat);mesh.name='driveway';W.baked.push(mesh);
 // Keep trees and toys off the driveway: register it in the placement space, a few meters at a time.
 for(let v=cf;v<lengthLat;v+=2.5){const c=place(P.drivX,Math.min(lengthLat,v+1.25));W.space.rect(c.x,c.z,P.drivW/2+.3,1.6,P.worldRot,'driveway');}
 // Skirts along both long edges past the sidewalk, so no lawn gap shows under a raised edge.
 for(const a of [0,1]){const sp=[];for(const v of ts){if(v<walk1)continue;const x=xa+(xb-xa)*a,p=place(x,v),y=f.point(p.u,p.v).y;sp.push([p.x,y+profile(Math.abs(p.v)),p.z,y+.06]);}
  // Wound to face away from the driveway's center line.
  const sk=[];for(let k=0;k<sp.length-1;k++){const [x0,y0,z0,b0]=sp[k],[x1,y1,z1,b1]=sp[k+1],c=place(P.drivX,ts[Math.min(ts.length-1,k+2)]),dir=[x0-c.x,0,z0-c.z];
   sk.push(...outward([x0,y0,z0,x0,b0,z0,x1,y1,z1],dir),...outward([x1,y1,z1,x0,b0,z0,x1,b1,z1],dir));}
  if(sk.length){const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sk,3));sg.computeVertexNormals();W.baked.push(new THREE.Mesh(sg,K.mat(0xa39a86)));}}
 // Control joints.
 for(let v=walk1+3.2;v<lengthLat-.6;v+=3.4){const a=place(xa+.05,v),b=place(xb-.05,v),ya=f.point(a.u,a.v).y+profile(Math.abs(a.v))+.004,yb=f.point(b.u,b.v).y+profile(Math.abs(b.v))+.004;
  W.baked.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x,ya,a.z),new THREE.Vector3(b.x,yb,b.z)]),new THREE.LineBasicMaterial({color:0x9d9585})));}
 if(P.frameId==='main'){const cut=W.cuts.find(c=>c.plan===P);W.drives.push({d:(cut.u0+cut.u1)/2,side:s,d0:cut.u0,d1:cut.u1,contains:(d,lat)=>Math.sign(lat)===s&&Math.abs(lat)>=cf-.05&&Math.abs(lat)<=lengthLat+.2&&(Math.abs(lat)<walk1+.4?d>=cut.u0&&d<=cut.u1:cut.inside(d,lat)),y:(d,lat)=>profile(Math.abs(lat))});}
 // Walk from the steps: along the house to the driveway, and on some lots out to the sidewalk.
 const {K:k2}=W,g=P.g,zc=P.stepFront+.55,x0=P.doorX,x1=P.drivX-(P.drivX>P.doorX?1:-1)*P.drivW/2;
 k2.box(g,(x0+x1)/2,.1,zc,Math.abs(x1-x0)+1.1,.12,1.05,HOUSE.walk);
 {const c=P.toWorld((x0+x1)/2,zc);W.space.rect(c.x,c.z,Math.abs(x1-x0)/2+.8,.8,P.worldRot,'walk');}
 if(P.leadWalk&&!P.key){const c=P.toWorld(x0,(P.stepFront+P.setback-walk1)/2);W.space.rect(c.x,c.z,.8,(P.setback-walk1-P.stepFront)/2+.3,P.worldRot,'walk');}
 P.localPads.push({x0:Math.min(x0,x1)-.55,x1:Math.max(x0,x1)+.55,z0:zc-.52,z1:zc+.52,y:.16});
 if(P.leadWalk&&!P.key){const zs=P.stepFront+.1,ze=P.setback-walk1+.1;k2.box(g,x0,.1,(zs+ze)/2,1.05,.12,Math.max(.5,ze-zs),HOUSE.walk);}
}

// Doors and garage doors that open --------------------------------------------------------------
function makeDynamic(W){const {K}=W,doors={},garages={};
 function makeDoor(h){const D={x:h.doorX,front:h.front,y:h.floor,width:.94,color:h.door,hinge:h.gs,dirX:-h.gs};
  const hingeX=D.x+D.hinge*.47,{g,d,lat}=W.houseAnchor(h,hingeX,D.front-.06,D.y);const pivot=new THREE.Group();g.add(pivot);
  const leaf=new THREE.Mesh(K.boxGeo,K.mat(D.color));leaf.scale.set(D.width,2.04,.05);leaf.position.set(D.dirX*D.width/2,1.02,0);leaf.castShadow=true;pivot.add(leaf);
  for(const side of [-1,1])for(const yy of [.55,1.45]){const pnl=new THREE.Mesh(K.boxGeo,K.mat(D.color));pnl.scale.set(.64,.62,.02);pnl.position.set(D.dirX*D.width/2,yy,side*.035);pivot.add(pnl);}
  for(const side of [-1,1]){const knob=new THREE.Mesh(K.sphereGeo,K.mat(0xc9b27a));knob.scale.setScalar(.035);knob.position.set(D.dirX*(D.width-.1),1.02,side*.05);pivot.add(knob);}
  const open=h.S(D.x,D.front+.9),inside=h.S(D.x+D.hinge*.15,D.front-2.3),stepOut=h.S(D.x,h.stepFront+.5),porch=h.S(D.x,D.front+.45),latch=h.S(D.x+D.dirX*.42,D.front+Math.min(1.2,h.pdep-.2)),entry=h.S(D.x,D.front-.7);
  // Doors swing inward, about 85 degrees.
  return {pivot,d,lat,open:0,set(t){this.open=t;pivot.rotation.y=D.dirX*t*1.48;},threshold:h.S(D.x,D.front),outside:open,inside,entry,steps:stepOut,porch,latch,floor:D.y,house:h};}
 function makeGarage(h){const G=h.garageInfo,{g,d,lat}=W.houseAnchor(h,G.x,G.front-.1,G.y);const panel=new THREE.Group();g.add(panel);
  const slab=new THREE.Mesh(K.boxGeo,K.mat(0xeeeae0));slab.scale.set(G.doorW-.04,G.doorH,.06);slab.castShadow=true;panel.add(slab);
  for(let k=1;k<4;k++){const gr=new THREE.Mesh(K.boxGeo,K.mat(0xb3ad9f));gr.scale.set(G.doorW-.04,.03,.02);gr.position.set(0,-G.doorH/2+k*G.doorH/4,.035);panel.add(gr);}
  const cols=G.doorW>3?8:4;for(let k=1;k<cols;k++){const gr=new THREE.Mesh(K.boxGeo,K.mat(0xc4beb0));gr.scale.set(.03,G.doorH,.02);gr.position.set(-G.doorW/2+G.doorW*k/cols,0,.035);panel.add(gr);}
  const gar={panel,d,lat,open:0,set(t){this.open=t;const H=G.doorH,by=t*H,tz=-H*Math.sqrt(Math.max(0,1-(1-t)**2));const bot=[by,0],top=[H,tz];panel.position.set(0,(bot[0]+top[0])/2,(bot[1]+top[1])/2);panel.rotation.x=Math.atan2(top[1]-bot[1],top[0]-bot[0])*-1;},
   mouth:h.S(G.x,G.front+.6),inside:h.S(G.x,G.front-G.depth+1.6),back:h.S(G.x,G.front-G.depth+.9),house:h,doorW:G.doorW,houseDoor:W.interiors[h.key]?.houseDoor?h.S(W.interiors[h.key].houseDoor.x,W.interiors[h.key].houseDoor.z):null,
   beyond:W.interiors[h.key]?.houseDoor?h.S(W.interiors[h.key].houseDoor.x-h.gs*1.1,W.interiors[h.key].houseDoor.z):null};gar.set(0);return gar;}
 for(const k of ['jamie','alex'])doors[k]=makeDoor(W.homes[k]);for(const k of ['sam','car'])garages[k]=makeGarage(W.homes[k]);
 return {doors,garages};
}
