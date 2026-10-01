// The creek: what the kids call the concrete storm channel that crosses under Briarwood Lane
// just before its curve. A strip of trees and weeds between two lots, chain-link along both
// sides, a culvert under the road with a railing over it, and a grate at the back where the
// water goes under the fence line into the woods. Ordinary on purpose; the dip itself is part
// of the side street's ground (terrain.js), so lawns, trees and fences already follow it.
//
// Placement here uses the side street's frame: u along Briarwood, v across it (+v is the
// inside of the curve). Rigid pieces are local x = across (v), local -z = along (u).
import * as THREE from './three.module.js';
import {seeded} from './kit.js';
import {LAWN} from './terrain.js';

// Triangles of a bent strip must face up in street coordinates (x = v, z = -u), as the roads do.
function upward(p,idx){for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;
  const ex=p[b]-p[a],ez=p[b+2]-p[a+2],fx=p[c]-p[a],fz=p[c+2]-p[a+2];if(ez*fx-ex*fz<0){const k=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=k;}}return idx;}

export function buildCreek(W){
 const {K}=W,f=W.sideFrames.find(f=>f.junction.creek);if(!f)return null;
 const j=f.junction,C=j.creek,veg=W.veg,rand=seeded(2011+C.u);
 const gy=(u,v)=>f.point(u,v).y+W.sideSurface(j,u,v);// lawn level, following the dip
 const bank=(u,v)=>f.point(u,v).y-f.creek(u,v);// the ground as if the creek were not there
 const concrete=W.concrete,dark=K.mat(0x1d1f1f),steel=K.mat(0x9aa0a0),water=K.mat(0x30424a,{roughness:.22,metalness:.42});
 const side=W.bent(f),solid=(u,v,hw,hd,tag)=>{const p=f.point(u,v);W.space.rect(p.x,p.z,hw,hd,-f.heading(u),tag);};
 function mesh(p,idx,material,name){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(upward(p,idx));const m=new THREE.Mesh(g,material);if(name)m.name=name;side.add(m);return m;}
 // A strip along v between two values of u, at a height above the (dipped) ground.
 function strip(u0,u1,v0,v1,y,material,name,n=32){const p=[],idx=[];for(let i=0;i<=n;i++){const v=v0+(v1-v0)*i/n;p.push(v,y,-u0,v,y,-u1);}
  for(let i=0;i<n;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}return mesh(p,idx,material,name);}
 for(const s of [-1,1]){
  const a=s*9.9,b=s*(C.end-.85);
  // The concrete bottom of the channel and a thin trickle down its middle.
  strip(C.u-.95,C.u+.95,a,b,LAWN+.02,concrete,'creek-channel');strip(C.u-.28,C.u+.28,a,b,LAWN+.045,water);
  // Culvert headwall below the sidewalk, holding up the road embankment, with the pipe mouth.
  {const top=bank(C.u,s*7.6)+.32,g=W.place(f,C.u,s*8.55,{y:top});
   K.box(g,0,-1.06,0,.42,2.12,7.4,concrete).name='culvert-headwall';K.box(g,s*.03,.04,0,.5,.08,7.6,concrete);
   for(const k of [-1,1]){const w=K.box(g,s*.95,-1.1,k*3.85,2.1,2,.36,concrete);w.rotation.y=-k*s*.33;}
   K.cyl(g,s*.22,-1.48,0,.58,.06,dark,18,[0,0,Math.PI/2]).name='culvert-mouth';K.cyl(g,s*.25,-1.48,0,.67,.04,concrete,18,[0,0,Math.PI/2]);
   solid(C.u,s*8.55,.3,3.9,'wall');}
  // A plain pipe railing along the sidewalk where it passes over the culvert.
  {const v=s*7.52,us=[];for(let u=C.u-4.8;u<=C.u+4.81;u+=1.2)us.push(u);
   for(const u of us)K.rod(W.place(f,u,v,{y:bank(u,v)+.16}),[0,0,0],[0,1.02,0],.03,steel);
   for(const hh of [.56,1.02])for(let i=0;i<us.length-1;i++){const u0=us[i],u1=us[i+1],g=W.place(f,u0,v,{y:0}),p0=f.point(u0,v),p1=f.point(u1,v);
    const d=new THREE.Vector3(p1.x-p0.x,0,p1.z-p0.z).applyAxisAngle(new THREE.Vector3(0,1,0),-g.rotation.y);K.rod(g,[0,bank(u0,v)+.16+hh,0],[d.x,bank(u1,v)+.16+hh,d.z],.022,steel);}
   solid(C.u,v,.12,4.9,'rail');}
  // Where the channel ends: a low wall and a grate, the water going on under the fence line.
  {const v=s*(C.end-.55),top=bank(C.u,s*(C.end+1.2))+.15,g=W.place(f,C.u,v,{y:top});K.box(g,0,-.75,0,.34,1.5,4.6,concrete).name='creek-grate-wall';
   K.box(g,-s*.19,-1.15,0,.04,.9,1.5,dark);for(let k=-6;k<=6;k++)K.box(g,-s*.22,-1.15,k*.11,.03,.92,.025,steel);for(const yy of [-.75,-1.55])K.box(g,-s*.22,yy,0,.035,.03,1.52,steel);
   solid(C.u,v,.25,2.4,'wall');}
  // Chain-link along both sides of the strip and across the back, pulled loose by the channel.
  const u0=C.u-C.half-.3,u1=C.u+C.half+.3,back=s*31.5;
  W.fenceRun(f,[[u0,s*8.7],[u0,back]],'chain');W.fenceRun(f,[[u1,s*8.7],[u1,back]],'chain');
  W.fenceRun(f,[[u0,back],[C.u-1.5,back]],'chain');W.fenceRun(f,[[C.u+1.9,back],[u1,back]],'chain');
 }
 // Trees along the banks and a wood behind the back fence, where the creek goes on in the dark.
 // The near bank on the inside of the curve stays open: that is the way down from the sidewalk.
 const trees=[];const tree=(u,v,o)=>{const t=veg.tree(f,u,v,gy(u,v),{clearance:1.6,...o});if(t)trees.push([u,v]);};
 const open=(u,v)=>v>0&&u<101.5&&v<19;
 for(const s of [-1,1]){
  for(const [u,v,size,kind] of [[89.2,10.6,.95,'maple'],[90.2,22,1.05,'oak'],[89.6,28.2,.9,'maple'],[95.4,25.6,.8,'young'],[104.6,26.2,1,'maple'],[110.9,11.2,.95,'maple'],[111.6,19.6,1.1,'oak'],[110.2,27.6,.85,'pine'],[106.4,15.8,.75,'young'],[104.3,9.8,.7,'birch']]){
   if(open(u,s*v))continue;tree(u,s*v,{size,kind,lod:'full'});}
  for(let k=0;k<26;k++){const u=C.u-15+rand()*30,v=s*(34+rand()*30);tree(u,v,{size:.9+rand()*.6,kind:rand()<.3?'pine':rand()<.25?'oak':'maple',lod:'mid'});}
  // Saplings and volunteer trees filling in the banks, the way an easement grows wild.
  for(let k=0;k<10;k++){const u=C.u-C.half+1.5+rand()*(2*C.half-3),v=s*(10.5+rand()*18);if(open(u,v)||Math.abs(u-C.u)<1.6)continue;tree(u,v,{size:.55+rand()*.4,kind:rand()<.5?'young':rand()<.5?'birch':'maple',lod:'full',clearance:1.3});}
  // Brush along the fences and around the grate.
  for(let k=0;k<12;k++){const u=k<6?C.u-C.half+.9+rand()*1.2:C.u+C.half-2.1+rand()*1.2,v=s*(10+rand()*20);if(open(u,v))continue;veg.shrub(W.place(f,u,v,{y:gy(u,v)}),0,0,.55+rand()*.4,rand);}
  for(let k=0;k<4;k++){const u=C.u+(rand()<.5?-1:1)*(2.6+rand()*1.6),v=s*(C.end-2-rand()*2);veg.shrub(W.place(f,u,v,{y:gy(u,v)}),0,0,.6+rand()*.3,rand);}
 }
 // Tall weeds on the banks: the same bent blades as the lookout field, swaying with the wind.
 const tall=K.mat(0x8a9263,{side:THREE.DoubleSide,roughness:1});if(!W.foliage.includes(tall))W.foliage.push(tall);
 for(let k=0;k<210;k++){const s=rand()<.5?-1:1,u=C.u-C.half+.6+rand()*(2*C.half-1.2),v=s*(9.4+rand()*(C.end-10.5));if(Math.abs(u-C.u)<1.05)continue;
  const g=W.place(f,u,v,{y:gy(u,v)-.04,rot:rand()*3});for(let b=0;b<6;b++){const hgt=.35+rand()*.55,w=.016+rand()*.02,bend=.08+rand()*.16;
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-w,0,0,w,0,0,-w*.6,hgt*.55,bend*.3,w*.6,hgt*.55,bend*.3,bend*.35,hgt,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
   const c=new THREE.Mesh(geo,tall);c.rotation.y=rand()*Math.PI*2;c.position.set((rand()-.5)*.25,0,(rand()-.5)*.25);g.add(c);}}
 // A worn dirt path on the inside bank: the kids' shortcut along the channel to the fence gap.
 {const pts=[[91.6,8.1],[93.6,11.5],[95.8,16],[96.8,21],[97.6,26.5],[98.9,31.4]],m=K.mat(0x7a7150,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),p=[],idx=[];
  for(let i=0;i<pts.length;i++){const [u,v]=pts[i],n=pts[Math.min(i+1,pts.length-1)],q=pts[Math.max(i-1,0)],du=n[0]-q[0],dv=n[1]-q[1],l=Math.hypot(du,dv)||1,ou=-dv/l*.2,ov=du/l*.2;
   for(const k of [-1,1]){const uu=u+ou*k,vv=v+ov*k;p.push(vv,W.sideSurface(j,uu,vv)+.012,-uu);}}
  for(let i=0;i<pts.length-1;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}mesh(p,idx,m,'creek-path');}
 const info={frame:f,junction:j,u:C.u,half:C.half,end:C.end,trees,
  // Where things are (Briarwood coordinates): the way down, the clue, the dark beyond the fence gap.
  spots:{track:[[91.2,7.55],[93.1,9.6],[95.2,11.6],[97.4,13.3]],clue:[98.65,15.45],bell:[C.u,62],grate:[C.u,C.end-.55],gap:[C.u+.2,31.5]}};
 W.creekInfo=info;return info;
}
