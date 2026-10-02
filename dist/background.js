// The neighborhood beyond the street. Nothing here is playable; it exists so that any
// glance between houses, down a cross street or toward the horizon finds a place that
// keeps going: the backs of the next street's houses over the rear fences, their yards
// and trees, pole lines, and farther out roofs and tree clumps fading into haze on
// gently rising land. Cheap by construction: mid/low detail, no shadows, 220 m batches.
import * as THREE from './three.module.js';
import {groundPoint,heading,roadFrame} from './route.js';
import {MAIN,LAWN,terrainY,streetCoords,nearY} from './terrain.js';
import {JUNCTIONS,ROAD_START,SECTION} from './layout.js';
import {HOUSE,FOLIAGE,STREET} from './palette.js';
import {seeded,hashSeed,pickFrom,smooth} from './kit.js';
import {planHouse,buildHouse,hipRoof,gableRoof,outward} from './houses.js';

export function buildBackground(W){
 const {K}=W,veg=W.veg,REAR=SECTION.rearFence;
 const T=(x,z)=>terrainY(x,z)+LAWN-.08;// the far ground's lawn level
 // Where the far ground slides under authored lawns, keep it just below them.
 const landY=(x,z)=>{const {d,lat}=streetCoords(x,z),a=Math.abs(lat);const t=T(x,z);return a<86&&d>ROAD_START-6?Math.min(t,nearY(d,lat)+LAWN-.08):t;};
 const inSide=(x,z,margin=0)=>W.sideFrames.find(f=>{const q=f.project(x,z);return q.u>-2&&q.u<f.length+14+margin&&Math.abs(q.v)<40+margin;});

 // Second row: the next street's houses, backs toward us, with their own back yards ------------
 const row2=[];
 for(const side of [-1,1])for(let d=ROAD_START+10;d<1135;d+=27){const rand=W.lotRand(10,side,d),u=d+rand()*6;
  if(JUNCTIONS.some(j=>j.side===side&&Math.abs(u-j.d)<56))continue;
  const P=planHouse(rand,{frame:MAIN,frameId:'main',u,side,setback:47+rand()*3,facing:-1,lod:'mid',far:true,garage:rand()<.7,porch:'stoop'});
  P.groundFn=(uu,vv,x,z)=>T(x,z)-LAWN+.08;
  const c=P.toWorld(0,0);if(!W.space.free(c.x,c.z,6))continue;
  buildHouse(W,P);row2.push(P);
  // A back yard between the shared rear fence and the house: a tree, sometimes a swing set or a shed.
  const by=side*(REAR+2.5+rand()*3),bd=u+(rand()-.5)*10,p=groundPoint(bd,by);
  if(rand()<.75)veg.tree(MAIN,bd,by,T(p.x,p.z),{size:.9+rand()*.6,kind:rand()<.3?'pine':'maple',lod:'mid',clearance:2.2});
  if(rand()<.3){const sd=u+(rand()<.5?-1:1)*(P.w/2+1.5),sl=side*(REAR+3.2),q=groundPoint(sd,sl),g=W.place(MAIN,sd,sl,{y:T(q.x,q.z),rot:side>0?Math.PI/2:-Math.PI/2,far:true});
   K.rbox(g,0,1.05,0,2.4,2.1,2,.03,pickFrom(rand)([0xa89a80,0x9b6a55,0x8d9985]));gableRoof(W,g,2.4,2,2.1,.7,.12,.18,W.surfaceMaterial(K.mat(pickFrom(rand)(HOUSE.roofs)),'roof'),W.surfaceMaterial(K.mat(0xa89a80),'siding'),true,{mid:true,gutters:false,vent:false});}
 }
 // Their lot lines, back to the shared rear fence.
 for(const side of [-1,1]){const lots=row2.filter(p=>p.side===side).sort((a,b)=>a.u-b.u);
  for(let i=0;i<lots.length-1;i++){const a=lots[i],b=lots[i+1];if(b.u-a.u>40)continue;const u=(a.u+b.u)/2;
   W.fenceRun(MAIN,[[u,side*(REAR+.1)],[u,side*(Math.min(a.setback,b.setback)-a.depth/2+1)]],seeded(hashSeed(11,side,u))()<.7?'privacy':'chain',{lod:'mid'});}}

 // Pole lines along the next streets over, spaced by real distance along the offset curve ----------
 for(const side of [-1,1]){let last=null,acc=0,prev=null;const lat=side*68;
  for(let d=ROAD_START;d<1130;d+=2){const p=groundPoint(d,lat);if(prev)acc+=Math.hypot(p.x-prev.x,p.z-prev.z);prev=p;
   if(acc<42&&last)continue;if(inSide(p.x,p.z,6)){last=null;acc=0;continue;}acc=0;
   const y=T(p.x,p.z),g=W.placeWorld(p.x,p.z,y,-heading(d),true);K.cyl(g,0,4.4,0,.13,9.2,STREET.pole,6);K.box(g,0,8.7,0,1.8,.12,.12,STREET.pole);
   const top=new THREE.Vector3(p.x,y+8.8,p.z);
   if(last){for(const dx of [-.8,.8]){const a=last.clone(),b=top.clone(),r=heading(d);a.x+=dx*Math.cos(r);a.z+=dx*Math.sin(r);b.x+=dx*Math.cos(r);b.z+=dx*Math.sin(r);
    const pts=[];for(let k=0;k<=10;k++){const t=k/10;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-3.2*t*(1-t),a.z+(b.z-a.z)*t));}
    W.baked.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:STREET.wire})));}}
   last=top;}}

 // Far field: houses and tree clumps across the land, facing the local street grain --------------
 let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;for(let d=ROAD_START;d<=1700;d+=20){const p=roadFrame(d);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}
 const R=340;minX-=R;maxX+=R;minZ-=R;maxZ+=R;
 const walls=HOUSE.walls,roofs=HOUSE.roofs,winQuad=new THREE.PlaneGeometry(1.1,1.2);
 const farHouse=(x,z,rot,rand)=>{const pick=pickFrom(rand),y=T(x,z),g=W.placeWorld(x,z,y,rot,true),two=rand()<.45,w=9+rand()*5,dp=8+rand()*2,h=two?5.5:2.9,wall=pick(walls),roofC=pick(roofs);
  K.box(g,0,h/2-.5,0,w,h+1,dp,W.surfaceMaterial(K.mat(wall),'siding'));const rm=W.surfaceMaterial(K.mat(roofC),'roof');
  const rise=two?2:1.8,o=.4,ye=h-o*rise/(dp/2);
  if(rand()<.6){const v=[];for(const s of [-1,1])v.push(-w/2-o,ye,s*(dp/2+o),w/2+o,ye,s*(dp/2+o),w/2+o,h+rise,0,-w/2-o,ye,s*(dp/2+o),w/2+o,h+rise,0,-w/2-o,h+rise,0);
   for(let i=0;i<v.length;i+=9){const ax=v[i+3]-v[i],az=v[i+5]-v[i+2],bx=v[i+6]-v[i],bz=v[i+8]-v[i+2];if(az*bx-ax*bz<0)for(let j=0;j<3;j++)[v[i+3+j],v[i+6+j]]=[v[i+6+j],v[i+3+j]];}
   K.tri(g,v,rm).name='roof-slope';K.tri(g,[...outward([-w/2,h,-dp/2,-w/2,h+rise,0,-w/2,h,dp/2],[-1,0,0]),...outward([w/2,h,-dp/2,w/2,h+rise,0,w/2,h,dp/2],[1,0,0])],W.surfaceMaterial(K.mat(wall),'siding'));}
  else hipRoof(W,g,w,dp,h,rise,o,rm,{mid:true,gutters:false,bare:true});
  // Lit windows on the two long walls: they come on with the rest of the neighborhood.
  for(const s of [-1,1])for(const fy of two?[1.5,4.2]:[1.5])for(let k=0;k<3;k++){const q=new THREE.Mesh(winQuad,rand()<.72?W.farWindow:W.darkGlass);q.position.set(-w/2+w*(k+.5)/3,fy,s*(dp/2+.03));if(s<0)q.rotation.y=Math.PI;g.add(q);}
  if(rand()<.6){const gx=(rand()<.5?-1:1)*(w/2+2);K.box(g,gx,.8,.5,4,3.6,dp-1,W.surfaceMaterial(K.mat(wall),'siding'));hipRoof(W,K.group(g,gx,.5,0,0),4,dp-1,2.6,1.1,.3,rm,{mid:true,gutters:false,bare:true});}
  W.space.rect(x,z,w/2+2.5,dp/2+1,rot,'far-house');};
 const cell=34;let houses=0,trees=0;
 for(let x=minX;x<maxX;x+=cell)for(let z=minZ;z<maxZ;z+=cell){const rand=seeded(hashSeed(12,x,z)),px=x+(rand()-.5)*cell*.6,pz=z+(rand()-.5)*cell*.6;
  const {d,lat}=streetCoords(px,pz),a=Math.abs(lat);
  if(a>R||d<ROAD_START-360||d>1700)continue;
  if(a<62&&d>ROAD_START-12&&d<1140)continue;// the street, its lots and the second row
  if(d>1100&&a<175)continue;// the open field in front of the lookout
  if(inSide(px,pz,8))continue;
  const rot=-heading(d)+(lat>0?-Math.PI/2:Math.PI/2)+(rand()<.5?Math.PI:0)+(rand()-.5)*.25;
  if(rand()<.62&&W.space.free(px,pz,9)){farHouse(px,pz,rot,rand);houses++;}
  const nt=rand()<.7?1+Math.floor(rand()*2):0;for(let k=0;k<nt;k++){const tx=px+(rand()-.5)*26,tz=pz+(rand()-.5)*26;if(W.easement?.inside(tx,tz,3))continue;if(veg.treeWorld(tx,tz,T(tx,tz),{size:.9+rand()*.8,kind:rand()<.3?'pine':'maple',clearance:3}))trees++;}
 }
 // Tree lines on the far rise, so the horizon is trees in haze rather than a bare edge.
 for(let x=minX;x<maxX;x+=14)for(let z=minZ;z<maxZ;z+=14){const {d,lat}=streetCoords(x,z),a=Math.abs(lat);if(a<R-60||a>R+10||d<ROAD_START-360||d>1700)continue;const rand=seeded(hashSeed(13,x,z));if(rand()<.62)continue;
  const tx=x+(rand()-.5)*10,tz=z+(rand()-.5)*10;if(veg.treeWorld(tx,tz,T(tx,tz),{size:1.3+rand()*.9,kind:rand()<.35?'pine':'maple',clearance:3.5}))trees++;}

 // The far ground itself, meeting the street's lawns under the rear fences --------------------
 const step=8,nx=Math.ceil((maxX-minX+40)/step)+1,nz=Math.ceil((maxZ-minZ+40)/step)+1,x0=minX-20,z0=minZ-20;
 const H=new Float32Array(nx*nz),keep=new Uint8Array(nx*nz);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const x=x0+i*step,z=z0+j*step,{d,lat}=streetCoords(x,z),a=Math.abs(lat);
  H[i*nz+j]=landY(x,z);
  // Cells the authored street ground already covers: the lot corridor, the side streets, the lookout field.
  const covered=(a<30&&d>ROAD_START+4&&d<1150)||(d>1149&&d<1645&&a<76)||!!inSide(x,z,-6);
  keep[i*nz+j]=a>R+40||covered?0:1;}
 const pos=[],idx=[];const vid=new Int32Array(nx*nz).fill(-1);
 const v=(i,j)=>{const k=i*nz+j;if(vid[k]<0){vid[k]=pos.length/3;pos.push(x0+i*step,H[k],z0+j*step);}return vid[k];};
 // The drainage easement has its own ground; leave out far cells that would roof over its trench.
 const ez=W.easement,overTrench=(i,j)=>{if(!ez)return false;for(let a=0;a<=4;a++)for(let b=0;b<=4;b++){const x=x0+(i+a/4)*step,z=z0+(j+b/4)*step;if(ez.trench(x,z,1.5))return true;}return false;};
 for(let i=0;i<nx-1;i++)for(let j=0;j<nz-1;j++){if(!(keep[i*nz+j]||keep[(i+1)*nz+j]||keep[i*nz+j+1]||keep[(i+1)*nz+j+1]))continue;if(overTrench(i,j))continue;
  const a=v(i,j),b=v(i+1,j),c=v(i,j+1),e=v(i+1,j+1);idx.push(a,c,b,b,c,e);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
 const land=new THREE.Mesh(geo,W.grassMat);land.name='far-land';land.userData.far=true;W.baked.push(land);
 W.background={row2:row2.length,farHouses:houses,trees,landTris:idx.length/3};
}
