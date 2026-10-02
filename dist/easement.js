// Behind the creek's back fence: the drainage easement. Neighborhood kids know it is there and
// nobody else thinks about it. Through the loose gap in the chain-link the storm water comes out of
// its pipe at a small headwall into an open concrete channel, which runs about thirty meters between
// the back yards, under a power line, to a big box culvert set into a wooded rise, where it goes
// under the neighborhood. A dirt maintenance path follows the left bank. Ordinary infrastructure.
//
// The easement has its own straight frame (Briarwood's frame folds over itself this far inside its
// curve): s along the corridor from the fence gap, t across it (+t to the right looking in). Its
// ground is one explicit height grid that the rendered patch and the walking queries share, laid a
// little above the land already there; only the cells of older ground that would cover the trench or
// the culvert are left out (streets.js, background.js). Static pieces bake into the merged world.
import * as THREE from './three.module.js';
import {EASEMENT as E,easementChannelT as TC} from './layout.js';
import {LAWN,terrainY,nearY,streetCoords} from './terrain.js';
import {smooth,clamp,lerp,seeded} from './kit.js';

// The frame alone: needed before the streets are built (they leave a hole for the trench).
export function easementFrame(W){
 const B=W.sideFrames[0],O=B.point(E.gap.u,E.gap.v),h=B.heading(E.gap.u);
 const out={x:Math.cos(h),z:Math.sin(h)},right={x:-Math.sin(h),z:Math.cos(h)},c=Math.cos(E.turn),sn=Math.sin(E.turn);
 const A={x:out.x*c+right.x*sn,z:out.z*c+right.z*sn},C={x:right.x*c-out.x*sn,z:right.z*c-out.z*sn};
 const local=(x,z)=>{const dx=x-O.x,dz=z-O.z;return {s:dx*A.x+dz*A.z,t:dx*C.x+dz*C.z};};
 const world=(s,t)=>({x:O.x+A.x*s+C.x*t,z:O.z+A.z*s+C.z*t});
 // The dirt path: out of the gap, round the outfall to the left bank, along it to the culvert.
 const pathT=s=>{const along=TC(s)+E.path.offset;return s<5.5?lerp(0,along,smooth((s-.2)/5.3)):along;};// straight in through the gap, then along the left bank
 const inside=(x,z,m=0)=>{const q=local(x,z);return q.s>-.8-m&&q.s<E.len+m&&Math.abs(q.t)<E.half+m;};
 // Where older ground must not cover: the channel trench, the mouth and the tunnel under the rise.
 const trench=(x,z,m=0)=>{const q=local(x,z),a=Math.abs(q.t-TC(q.s));return q.s>E.channel.s0-1.5-m&&q.s<E.culvert.s+E.culvert.inside+1+m&&a<E.channel.top+.6+m;};
 // A heading whose forward is the corridor's +s (for rigid pieces built with local -z along s, +x along t).
 const rot=Math.atan2(-A.x,-A.z),heading=Math.atan2(A.x,-A.z);
 return {O,A,C,local,world,pathT,channelT:TC,inside,trench,rot,heading,E};
}

export function buildEasement(W){
 const F=W.easement,{K}=W,veg=W.veg,B=W.sideFrames[0],rand=seeded(4242),ch=E.channel,cu=E.culvert,hl=E.hill;
 // The ground already there (what the patch sits just above): Briarwood's own lawn near the fence,
 // the far land beyond, whichever is higher.
 const sideLawn=(x,z)=>{const q=B.project(x,z,E.gap.u);if(q.u<24||Math.abs(q.v)>44)return null;const p=B.point(q.u,q.v);return Math.hypot(p.x-x,p.z-z)>.08?null:p.y+LAWN;};
 const farLawn=(x,z)=>{const {d,lat}=streetCoords(x,z),t=terrainY(x,z)+LAWN;return Math.abs(lat)<86?Math.min(t,nearY(d,lat)+LAWN):t;};
 const base=(x,z)=>{const s=sideLawn(x,z),f=farLawn(x,z);return s===null?f:Math.max(s,f);};
 // The channel bed falls evenly from the outfall to the culvert (and on into it).
 const bankAt=s=>{const p=F.world(s,TC(s));return base(p.x,p.z);};
 const bed0=bankAt(ch.s0)-ch.depth0,bed1=Math.min(bankAt(ch.s1)-ch.depth1,bed0-.25),bedY=s=>bed0+(bed1-bed0)*(s-ch.s0)/(ch.s1-ch.s0);
 const hill=(s,t)=>hl.h*smooth((s-hl.s0)/(hl.s1-hl.s0))*(1-smooth((s-hl.s2)/(hl.s3-hl.s2)))*(1-smooth((Math.abs(t-TC(s))-7)/6));
 // ---- the height grid: one surface for the rendered patch and for walking ----------------------
 const S0=-.8,S1=E.len,T0=-E.half,T1=E.half,DS=.5,DT=.5,ns=Math.round((S1-S0)/DS)+1,nt=Math.round((T1-T0)/DT)+1,Hs=new Float32Array(ns*nt);
 const carveEnd=cu.s+.42;// the trench stops behind the headwall; the tunnel is its own piece
 function design(s,t){const p=F.world(s,t);let y=base(p.x,p.z)+.012+hill(s,t);
  const a=Math.abs(t-TC(s));
  if(s>ch.s0-.4&&s<carveEnd){const bed=bedY(Math.min(s,cu.s)),prof=a<ch.bottom?1:a<ch.top?1-(a-ch.bottom)/(ch.top-ch.bottom):0,along=smooth((s-ch.s0+.4)/.4);y=lerp(y,bed,prof*along);}
  // Round the edges of the patch down under the land around it.
  const edge=Math.min(E.half-Math.abs(t),E.len-s);y-=.14*(1-smooth(edge/1.8));// (it meets the creek strip's lawn level at the gap)
  return y;}
 for(let i=0;i<ns;i++)for(let j=0;j<nt;j++)Hs[i*nt+j]=design(S0+i*DS,T0+j*DT);
 // Exactly the patch's triangles (split the same way as the mesh below).
 function height(s,t){const fs=clamp((s-S0)/DS,0,ns-1.001),ft=clamp((t-T0)/DT,0,nt-1.001),i=Math.floor(fs),j=Math.floor(ft),fx=fs-i,fy=ft-j;
  const h00=Hs[i*nt+j],h10=Hs[(i+1)*nt+j],h01=Hs[i*nt+j+1],h11=Hs[(i+1)*nt+j+1];
  return fx+fy<=1?h00+(h10-h00)*fx+(h01-h00)*fy:h11+(h01-h11)*(1-fx)+(h10-h11)*(1-fy);}
 // Over the tunnel the ground is a separate cap at the rise's height, so nothing of the patch
 // ever stands inside the culvert's opening (its cells are left out of the patch below).
 const hillTop=(s,t)=>{const p=F.world(s,t);return base(p.x,p.z)+.012+hill(s,t);};
 const capT=cu.w/2+1.3,inCap=(s,t)=>s>=cu.s-.26&&s<=cu.s+cu.inside+.8&&Math.abs(t-TC(s))<=capT;
 function ground(cells,yAt,name){const pos=[],idx=[],vid=new Map(),v=(i,j)=>{const k=i*nt+j;if(!vid.has(k)){vid.set(k,pos.length/3);const s=S0+i*DS,t=T0+j*DT,p=F.world(s,t);pos.push(p.x,yAt(i,j,s,t),p.z);}return vid.get(k);};
  for(let i=0;i<ns-1;i++)for(let j=0;j<nt-1;j++){if(!cells(i,j))continue;const a=v(i,j),b=v(i+1,j),c=v(i,j+1),d=v(i+1,j+1);idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  // Faces must point up (the frame's handedness decides the winding).
  {const n=geo.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}geo.setIndex(idx);geo.computeVertexNormals();}}
  const m=new THREE.Mesh(geo,W.lawnTop);m.name=name;W.baked.push(m);return m;}
 const cellCap=(i,j)=>inCap(S0+(i+.5)*DS,T0+(j+.5)*DT);
 // Under the concrete lining there is no grass to show through it.
 const underLining=(i,j)=>{for(const [a,b] of [[i,j],[i+1,j],[i,j+1],[i+1,j+1]]){const ss=S0+a*DS,tt=T0+b*DT;if(ss<ch.s0+.3||ss>carveEnd-.1||Math.abs(tt-TC(ss))>ch.top-.25)return false;}return true;};
 ground((i,j)=>!cellCap(i,j)&&!underLining(i,j),(i,j)=>Hs[i*nt+j],'easement-ground');
 ground(cellCap,(i,j,s,t)=>hillTop(s,t)-.004,'easement-culvert-cap');
 // A strip laid on the ground along a centerline [s,t] list: width w, lifted a little.
 function strip(pts,w,lift,material,name){const pos=[],idx=[];
  for(let k=0;k<pts.length;k++){const [s,t]=pts[k],[s2,t2]=pts[Math.min(k+1,pts.length-1)],[s0,t0]=pts[Math.max(k-1,0)],ds=s2-s0,dt=t2-t0,l=Math.hypot(ds,dt)||1,ns_=-dt/l,nt_=ds/l;
   for(const e of [-1,1]){const ss=s+ns_*w/2*e,tt=t+nt_*w/2*e,p=F.world(ss,tt);pos.push(p.x,height(ss,tt)+lift,p.z);}}
  for(let k=0;k<pts.length-1;k++){const a=k*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  {const n=geo.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}geo.setIndex(idx);geo.computeVertexNormals();}}
  const m=new THREE.Mesh(geo,material);if(name)m.name=name;W.baked.push(m);return m;}
 const concrete=W.surfaceMaterial(K.mat(0x8f8e80,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),'concrete');
 const darkConcrete=W.surfaceMaterial(K.mat(0x55564f),'concrete'),wetConcrete=W.surfaceMaterial(K.mat(0x4a4f49,{roughness:.55}),'concrete');
 const earth=W.surfaceMaterial(K.mat(0x7a6f58,{roughness:.95,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),'earth');
 const mud=W.surfaceMaterial(K.mat(0x5a4936,{roughness:.6,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),'earth');
 const water=W.surfaceMaterial(K.mat(0x2c3d43,{roughness:.2,metalness:.35,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),'water');
 // ---- the channel: concrete lining over the carved trench, a trickle down the middle ------------
 {const pts=[];for(let s=ch.s0;s<=carveEnd+.001;s+=.25)pts.push(s);
  // Lining as cross-section rows following the carve (bottom and both slopes).
  // Dense enough to follow the patch's own triangles closely (it is sampled from the same heights).
  const across=[...Array(27)].map((_,k)=>-ch.top+k*ch.top*2/26),pos=[],idx=[];
  for(const s of pts)for(const a of across){const t=TC(s)+a,p=F.world(s,t);pos.push(p.x,height(s,t)+.02,p.z);}
  const n=across.length;for(let i=0;i<pts.length-1;i++)for(let k=0;k<n-1;k++){const a=i*n+k,b=a+n,c=a+1,d=b+1;idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  {const nn=geo.attributes.normal;let up=0;for(let k=0;k<nn.count;k++)up+=nn.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}geo.setIndex(idx);geo.computeVertexNormals();}}
  const m=new THREE.Mesh(geo,concrete);m.name='easement-channel';W.baked.push(m);
  strip(pts.map(s=>[s,TC(s)+.05*Math.sin(s*.7)]),.42,.04,water,'easement-trickle');}
 // ---- the dirt path, worn into the left bank -----------------------------------------------------
 {const pts=[];for(let s=-.6;s<=31.6;s+=.6)pts.push([s,F.pathT(s)]);strip(pts,E.path.half*2,.014,earth,'easement-path');}
 // ---- the outfall: a small headwall where the pipe from the creek's grate comes out ---------------
 const place=(s,t,y,turn=0)=>{const p=F.world(s,t);return W.placeWorld(p.x,p.z,y,F.rot+turn,false);};
 const solid=(s,t,hw,hd,tag='wall',turn=0)=>{const p=F.world(s,t);W.space.rect(p.x,p.z,hw,hd,F.rot+turn,tag);};// hw across (t), hd along (s)
 {const s=ch.s0-.2,t=TC(ch.s0),b=bedY(ch.s0),g=place(s,t,b);K.box(g,0,.75,.18,3.8,1.75,.36,darkConcrete).name='easement-outfall';
  K.cyl(g,0,.55,-.02,.42,.05,0x161818,18,[Math.PI/2,0,0]);K.cyl(g,0,.55,0,.5,.04,darkConcrete,18,[Math.PI/2,0,0]);
  for(const e of [-1,1]){const w=K.box(g,e*2.25,.55,-.55,.3,1.35,1.5,darkConcrete);w.rotation.y=e*.42;}solid(s+.15,t,2.0,.3);}
 // ---- the culvert: a big concrete box set into the wooded rise ---------------------------------
 const mouth={s:cu.s,t:TC(cu.s),bed:bedY(cu.s)};
 {const g=place(cu.s,mouth.t,mouth.bed),W2=cu.w/2,H=cu.h,top=H+.78,wall=7.6;
  // Headwall face with its opening, a cap along the top, wingwalls retaining the rise.
  K.box(g,-(W2+(wall/2-W2)/2),top/2,-.2,wall/2-W2,top,.42,darkConcrete).name='culvert-headwall';K.box(g,W2+(wall/2-W2)/2,top/2,-.2,wall/2-W2,top,.42,darkConcrete);
  K.box(g,0,(H+top)/2,-.2,cu.w+.02,top-H,.42,darkConcrete);K.box(g,0,top+.08,-.32,wall+.3,.16,.75,concrete);
  // Wingwalls hold the trench's slopes beside the headwall, flaring out toward the channel.
  for(const e of [-1,1]){const bank=height(cu.s-1,mouth.t+e*(ch.top+.15))-mouth.bed+.32;K.box(g,e*(ch.top+.15),bank/2-.05,1.05,.3,bank+.1,2.1,darkConcrete);solid(cu.s-1.05,mouth.t+e*(ch.top+.15),.2,1.05);}
  // The inside: walls, ceiling, a floor running on down into the dark, and darkness.
  const L=cu.inside;K.box(g,0,-.04,-L/2-.4,cu.w,.08,L,wetConcrete).name='culvert-floor';
  for(const e of [-1,1])K.box(g,e*(W2+.1),H/2,-L/2-.4,.2,H,L,0x2a2b28);K.box(g,0,H+.1,-L/2-.4,cu.w+.4,.2,L,0x232421);
  const back=K.box(g,0,H/2,-L-.35,cu.w,H,.1,0x050506);back.material=new THREE.MeshBasicMaterial({color:0x040405});back.material.userData.keep=true;back.name='culvert-dark';
  // Standing water in the mouth, deepening inside; leaves and branches the last storm left.
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(cu.w-.1,L+.6),W.surfaceMaterial(K.mat(0x1d2a2e,{roughness:.12,metalness:.45}),'water'));pool.rotation.x=-Math.PI/2;pool.position.set(0,.05,-L/2-.1);g.add(pool);
  for(const [x,z,a,l] of [[-.6,.6,.4,1.6],[.5,.2,-.3,1.2],[.1,-.9,.15,1.4],[-.9,-1.6,.6,.9]])K.rod(g,[x-Math.cos(a)*l/2,.1,z-Math.sin(a)*l/2],[x+Math.cos(a)*l/2,.16,z+Math.sin(a)*l/2],.035,0x4a3c2c,.02,5);
  solid(cu.s-.2,mouth.t-(W2+(wall/2-W2)/2),(wall/2-W2)/2,.3);solid(cu.s-.2,mouth.t+(W2+(wall/2-W2)/2),(wall/2-W2)/2,.3);}
 // ---- a power line overhead: two poles on the right bank and wires running on out of sight ----------
 const poles=[[7.5,6.4],[27.5,6.9]].map(([s,t])=>{const p=F.world(s,t),y=height(s,t),g=place(s,t,y);
  K.rod(g,[0,0,0],[0,9.4,0],.14,0x5a4a3a,.11,7).name='easement-pole';K.box(g,0,8.9,0,2.2,.12,.12,0x4e4234);for(const x of [-.95,0,.95])K.cyl(g,x,9.05,0,.045,.16,0x8e9a96,6);
  solid(s,t,.2,.2,'pole');return {x:p.x,y:y+9.1,z:p.z};});
 {const sag=(a,b,k)=>{const pts=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u-k*4*u*(1-u),a.z+(b.z-a.z)*u]);}return pts;};
  const far0=F.world(-14,5.6),far1=F.world(E.len+16,7.6),ends=[{x:far0.x,y:poles[0].y+.6,z:far0.z},poles[0],poles[1],{x:far1.x,y:poles[1].y-.4,z:far1.z}];
  const g=W.placeWorld(0,0,0,0,false),r=new THREE.Vector3(F.C.x,0,F.C.z);
  for(const off of [-.95,0,.95])for(let i=0;i<ends.length-1;i++){const a=ends[i],b=ends[i+1],pts=sag({x:a.x+r.x*off,y:a.y,z:a.z+r.z*off},{x:b.x+r.x*off,y:b.y,z:b.z+r.z*off},.55);for(let k=0;k<pts.length-1;k++)K.rod(g,pts[k],pts[k+1],.011,0x1c1d1e,.011,3);}}
 // ---- what a bicycle left: a tire mark in the mud, weeds pressed flat, a scrape over the bank edge ----
 // Small, ordinary marks, each lying on the ground's own shape (patches are rings of points draped on
 // the terrain, not flat discs), readable in a flashlight beam and plain in daylight.
 const ev=E.evidence,spots={};
 const flipUp=(geo,idx)=>{geo.setIndex(idx);geo.computeVertexNormals();const n=geo.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}geo.setIndex(idx);geo.computeVertexNormals();}};
 const blob=(s0,t0,rs,rt,material,lift,name='',seed=1)=>{const n=20,pos=[],idx=[],put=(ss,tt)=>{const p=F.world(ss,tt);pos.push(p.x,height(ss,tt)+lift,p.z);};put(s0,t0);
  const wob=k=>1+.1*Math.sin(k*2.3+seed)+.045*Math.sin(k*5.1+seed*2.7);for(const r of [.55,1])for(let k=0;k<n;k++){const a=k/n*Math.PI*2,w=r*wob(k);put(s0+Math.cos(a)*rs*w,t0+Math.sin(a)*rt*w);}
  for(let k=0;k<n;k++){const a=1+k,b=1+(k+1)%n,c=a+n,d=b+n;idx.push(0,a,b,a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));flipUp(geo,idx);const m=new THREE.Mesh(geo,material);if(name)m.name=name;W.baked.push(m);return m;};
 const tread=W.surfaceMaterial(K.mat(0x2b231a,{roughness:.5,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),'earth');
 const wetMud=W.surfaceMaterial(K.mat(0x4b3d2c,{roughness:.42,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}),'earth');
 // A puddle-sized patch of mud on the path, and across it one narrow tire track: a groove with its tread.
 {const s=ev.mud,t=F.pathT(s)+.2,p=F.world(s,t);blob(s,t,1.0,.62,mud,.022,'',1.3);blob(s+.1,t-.05,.55,.34,wetMud,.026,'',4.1);
  const track=[];for(let k=0;k<=18;k++){const ss=s-1.15+k*.13;track.push([ss,t+.05*Math.sin(ss*1.7)-.06*(ss-s)]);}
  strip(track,.05,.034,tread,'evidence-tire-mark');
  for(let k=1;k<track.length-1;k++)for(const f of [.33,.66]){const [a,b]=[track[k],track[k+1]],ss=a[0]+(b[0]-a[0])*f,tt=a[1]+(b[1]-a[1])*f;strip([[ss,tt-.032],[ss,tt+.032]],.012,.036,tread);}
  spots.mud={s,t,x:p.x,z:p.z,y:height(s,t)};}
 // Weeds between the path and the channel, waist-high to a kid, with one lane pressed flat through them.
 {const s=ev.weeds,t0=F.pathT(s)+E.path.half+.15,t1=TC(s)-ch.top-.08,stand=K.mat(0x7c8752,{side:THREE.DoubleSide,roughness:1}),flat=K.mat(0x9d9a62,{side:THREE.DoubleSide,roughness:1});
  for(const m of [stand,flat])if(!W.foliage.includes(m))W.foliage.push(m);
  const blade=(g,len,w,bend,mat,lying,name='')=>{const geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.Float32BufferAttribute(lying?[-w,0,0,w,0,0,-w*.7,.045,len*.5,w*.7,.05,len*.5,0,.03,len]:[-w,0,0,w,0,0,-w*.6,len*.55,bend*.3,w*.6,len*.55,bend*.3,bend*.35,len,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
   const m=new THREE.Mesh(geo,mat);if(name)m.name=name;g.add(m);return m;};
  // Standing on both sides of the lane.
  for(const side of [-1,1])for(let k=0;k<34;k++){const ss=s+side*(.42+rand()*1.25),tt=t0+(t1-t0)*rand(),g=place(ss,tt,height(ss,tt)-.03,rand()*3);
   for(let b=0;b<6;b++){const m=blade(g,.45+rand()*.42,.016+rand()*.014,.06+rand()*.14,stand,false);m.rotation.y=rand()*Math.PI*2;m.position.set((rand()-.5)*.18,0,(rand()-.5)*.18);}}
  // The lane: stems laid over the way the bike went, toward the channel, a few snapped half up.
  for(let k=0;k<30;k++){const tt=t0+(t1-t0)*(k/29),ss=s+(rand()-.5)*.5,g=place(ss,tt,height(ss,tt)+.015,0);
   for(let b=0;b<4;b++){const m=blade(g,.32+rand()*.32,.018+rand()*.012,0,b===3&&rand()<.4?stand:flat,true,!k&&!b?'evidence-flattened-weeds':'');m.rotation.y=Math.PI/2+(rand()-.5)*.6;m.position.set((rand()-.5)*.16,0,(rand()-.5)*.2);}}
  const p=F.world(s,(t0+t1)/2);spots.weeds={s,t:(t0+t1)/2,x:p.x,z:p.z,y:height(s,(t0+t1)/2)};}
 // Over the lip of the channel: a pale scuff down the concrete, a smear of dirt where the bank was
 // torn, two dark rubber lines, a few clods knocked loose.
 {const s=ev.scrape,top=TC(s)-ch.top,t=top+.15,p=F.world(s,t);
  const scuff=W.surfaceMaterial(K.mat(0xa6a294,{roughness:.9,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}),'concrete');
  const line=[];for(let k=0;k<=8;k++){const u=k/8;line.push([s+.35*u+.05*Math.sin(u*5),top-.35+u*(ch.top-ch.bottom+.25)]);}
  // Scratches in the concrete (fine, pale, not quite parallel) and the rubber marks between them.
  for(const [o,w,k0] of [[-.11,.018,1],[-.05,.026,0],[.02,.014,2],[.09,.02,1],[.14,.012,3]])strip(line.slice(k0).map(([a,b],k)=>[a+o*(.7+.5*(k+k0)/8),b]),w,.034,scuff,o===-.05?'evidence-scrape':'');
  for(const o of [-.08,.06])strip(line.slice(0,7).map(([a,b],k)=>[a+o*(.6+.4*k/8),b]),.02,.04,tread);
  blob(s-.15,top-.55,.5,.38,mud,.024,'',7.7);
  for(let k=0;k<7;k++){const ss=s+(rand()-.5)*.8,tt=top-.2+(rand()-.3)*.9,g=place(ss,tt,height(ss,tt)+.01,rand()*3);K.ball(g,0,.015,0,.03+rand()*.045,0x6d6048,[1.3,.55,1]);}
  spots.scrape={s,t,x:p.x,z:p.z,y:height(s,t)};}
 // ---- weeds, brush and trees: the easement's walls ------------------------------------------------
 const tall=K.mat(0x8a9263,{side:THREE.DoubleSide,roughness:1});if(!W.foliage.includes(tall))W.foliage.push(tall);
 const nearPath=(s,t)=>Math.abs(t-F.pathT(s))<E.path.half+.3,inTrench=(s,t)=>s>ch.s0-.5&&s<cu.s+.5&&Math.abs(t-TC(s))<ch.top+.1;
 for(let k=0;k<420;k++){const s=rand()*(cu.s-1),t=-11+rand()*22;if(nearPath(s,t)||inTrench(s,t)||(s<1.5&&Math.abs(t)<3))continue;if(Math.abs(s-ev.weeds)<.8&&t>F.pathT(s)&&t<TC(s))continue;
  const g=place(s,t,height(s,t)-.04,rand()*3);for(let b=0;b<5;b++){const hgt=.3+rand()*.6,w=.016+rand()*.02,bend=.08+rand()*.16,geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.Float32BufferAttribute([-w,0,0,w,0,0,-w*.6,hgt*.55,bend*.3,w*.6,hgt*.55,bend*.3,bend*.35,hgt,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
   const c=new THREE.Mesh(geo,tall);c.rotation.y=rand()*Math.PI*2;c.position.set((rand()-.5)*.25,0,(rand()-.5)*.25);g.add(c);}}
 // Brush lines just outside the walkable corridor, both sides, and round the culvert's rise.
 const walkLeft=s=>F.pathT(s)-1.7,walkRight=s=>TC(s)+4.4;
 for(let s=1.6;s<cu.s+2;s+=1.35){for(const [edge,dir] of [[walkLeft(s),-1],[walkRight(s),1]]){const t=edge+dir*(.7+rand()*.6),g=place(s,t,height(s,t));veg.shrub(g,0,0,.55+rand()*.45,rand);
   if(rand()<.6){const t2=t+dir*(1.1+rand()*1.4),g2=place(s+rand()*.6,t2,height(s,t2));veg.shrub(g2,0,0,.6+rand()*.5,rand);}}}
 const trees=[];for(const [s,t,size,kind] of [[4,-9.5,1.05,'maple'],[11,-11.2,.95,'oak'],[16,-8.8,.8,'young'],[22,-10.6,1.1,'maple'],[29,-9.4,.9,'birch'],[35.5,-6.5,1,'maple'],[38,2,1.15,'oak'],[39,-3,.9,'pine'],[36,9.5,.95,'maple'],
  [12,10.6,.9,'maple'],[19,11.6,1,'oak'],[24.5,9.8,.75,'young'],[33.5,11,.95,'pine'],[42,6,1.05,'maple'],[43.5,-7,.9,'oak'],[6,12,.85,'birch']]){const p=F.world(s,t);if(veg.treeWorld(p.x,p.z,height(s,t)-.03,{size,kind,lod:'full',clearance:1.4}))trees.push([s,t]);}
 // Where the story needs things (easement frame, plus world positions).
 const at=(s,t,y=null)=>{const p=F.world(s,t);return {s,t,x:p.x,z:p.z,y:y??height(s,t)};};
 Object.assign(spots,{gap:at(-.3,0),outfall:at(ch.s0,TC(ch.s0)),pathEnd:at(31.2,F.pathT(31.2)),mouth:{...at(cu.s,mouth.t,mouth.bed),bed:mouth.bed},
  bike:at(E.bike.s,TC(E.bike.s)-ch.top-.95),bell:at(E.bell.s,TC(cu.s),bedY(E.bell.s)+E.bell.y),water:at(16,TC(16),bedY(16)+.1),clearing:at(29.5,F.pathT(29.5)+1.4)});
 Object.assign(F,{height,bedY,base,spots,mouth,trees,walkLeft,walkRight});
 return F;
}

// Walking and ground queries in the easement (nav.js calls these when a point is inside it).
export function easementNav(F){const ch=E.channel,cu=E.culvert;
 // Standing in the culvert's mouth: the floor of the box, not the rise over it.
 const inMouth=(s,t)=>s>cu.s-.25&&s<cu.s+cu.inside&&Math.abs(t-TC(s))<cu.w/2+.05;
 function groundY(s,t){return inMouth(s,t)?F.bedY(Math.min(s,cu.s+cu.inside))+.02:F.height(s,t)+(Math.abs(t-TC(s))<ch.top&&s>ch.s0&&s<cu.s?.02:0);}
 function walkable(s,t){if(s<-.8||s>cu.s+1.25)return false;
  if(s>cu.s-.25)return Math.abs(t-TC(s))<cu.w/2-.3;// a step or two into the mouth; the water deepens after that
  if(s<1.2)return Math.abs(t)<3.2;// through the gap (the fence does the rest)
  return t>F.walkLeft(s)&&t<F.walkRight(s);}
 function surface(s,t){return Math.abs(t-TC(s))<ch.top&&s>ch.s0||inMouth(s,t)?'asphalt':'grass';}
 return {groundY,walkable,surface,inMouth};
}
