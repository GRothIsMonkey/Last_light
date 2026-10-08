// Chapter Three: past the end of Briarwood Lane. The street stops a little past its last house; through
// the gap in its end curb an old municipal stormwater access road goes on: barrier posts, a yellow pipe
// gate (one leaf swung open long ago), a Public Works sign, a flood warning. It crosses an overgrown
// field with an old pole line, enters the woods, and winds down through them, narrower and rougher as
// it goes (cracked asphalt, then patches and gravel, then two ruts with grass between), the trees
// closing over it, until it comes out on the floor of a creek valley at the outfall, where the
// neighborhood's storm sewer trunk comes out of the hillside: a concrete box under a headwall, with
// wingwalls, an apron and riprap, the low flow trickling out across it into the creek. Ordinary public
// works, a long way from anybody's house. Nothing here is strange.
//
// World coordinates throughout (the road has its own frame: s along it, t across it, +t to the right
// looking along it; the outfall has another: a east from the portal face, b south). The ground is one
// designed height function, sampled into three explicit grids that the rendered ground and walking
// share: a ribbon along the road, one along the creek, and a fine patch round the outfall; a coarse
// grid covers the rest of the woods. Older ground leaves the region out (streets.js, background.js).
// The static pieces bake into the merged world under the zone 'woods' (culled by distance, game.js);
// the evidence and everything else the story moves are Chapter Three's own (chapter3.js).
import * as THREE from './three.module.js';
import {leafGeometrySmall,leafTexture} from './materials.js';
import {WOODS as E,DRAIN} from './layout.js';
import {LAWN,terrainY} from './terrain.js';
import {smooth,clamp,lerp,seeded,hashSeed} from './kit.js';

const smin=(a,b,k)=>{const h=clamp(.5+.5*(b-a)/k,0,1);return lerp(b,a,h)-k*h*(1-h);};
// Monotone cubic through [x,y] keys (no overshoot between them).
function pchip(keys){const n=keys.length,xs=keys.map(k=>k[0]),ys=keys.map(k=>k[1]),d=[],m=[];
 for(let i=0;i<n-1;i++)d.push((ys[i+1]-ys[i])/(xs[i+1]-xs[i]));
 for(let i=0;i<n;i++){if(i===0)m.push(d[0]);else if(i===n-1)m.push(d[n-2]);else m.push(d[i-1]*d[i]<=0?0:2/(1/d[i-1]+1/d[i]));}
 return x=>{if(x<=xs[0])return ys[0];if(x>=xs[n-1])return ys[n-1];let i=0;while(i<n-2&&x>xs[i+1])i++;const h=xs[i+1]-xs[i],t=(x-xs[i])/h,t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*ys[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*ys[i+1]+(t3-t2)*h*m[i+1];};}
// A Catmull-Rom curve through world points, resampled every `step` meters: x, z, s, heading.
function curve(P,step){const Q=[[2*P[0][0]-P[1][0],2*P[0][1]-P[1][1]],...P,[2*P[P.length-1][0]-P[P.length-2][0],2*P[P.length-1][1]-P[P.length-2][1]]],raw=[];
 for(let i=1;i<Q.length-2;i++){const [a,b,c,d]=[Q[i-1],Q[i],Q[i+1],Q[i+2]];for(let k=0;k<40;k++){const t=k/40,t2=t*t,t3=t2*t;raw.push([0,1].map(j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3)));}}
 raw.push(P[P.length-1]);const acc=[0];for(let i=1;i<raw.length;i++)acc.push(acc[i-1]+Math.hypot(raw[i][0]-raw[i-1][0],raw[i][1]-raw[i-1][1]));
 const L=acc[acc.length-1],n=Math.floor(L/step)+1,X=new Float64Array(n),Z=new Float64Array(n),A=new Float64Array(n);let j=0;
 for(let i=0;i<n;i++){const s=Math.min(L,i*step);while(j<acc.length-2&&acc[j+1]<s)j++;const f=(s-acc[j])/((acc[j+1]-acc[j])||1);X[i]=raw[j][0]+(raw[j+1][0]-raw[j][0])*f;Z[i]=raw[j][1]+(raw[j+1][1]-raw[j][1])*f;}
 for(let i=0;i<n;i++){const a=Math.max(0,i-1),b=Math.min(n-1,i+1);A[i]=Math.atan2(X[b]-X[a],-(Z[b]-Z[a]));}
 return {X,Z,A,n,step,length:(n-1)*step};}
// Nearest point on a sampled curve (a coarse hash of its samples, then the two segments either side).
function nearest(C,cell=8,reach=3){const grid=new Map(),key=(i,j)=>i*100003+j;
 for(let i=0;i<C.n;i++){const k=key(Math.floor(C.X[i]/cell),Math.floor(C.Z[i]/cell));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);}
 return (x,z,r=reach)=>{const ci=Math.floor(x/cell),cj=Math.floor(z/cell);let bi=-1,bd=1e18;
  for(let i=ci-r;i<=ci+r;i++)for(let j=cj-r;j<=cj+r;j++)for(const k of grid.get(key(i,j))||[]){const d=(C.X[k]-x)**2+(C.Z[k]-z)**2;if(d<bd){bd=d;bi=k;}}
  if(bi<0)return null;let best=null;
  for(const k of [bi-1,bi]){if(k<0||k>=C.n-1)continue;const ax=C.X[k],az=C.Z[k],dx=C.X[k+1]-ax,dz=C.Z[k+1]-az,l=dx*dx+dz*dz||1,fr=((x-ax)*dx+(z-az)*dz)/l,f=clamp(fr,0,1),px=ax+dx*f,pz=az+dz*f,d=Math.hypot(x-px,z-pz);
   // (past either end of the curve: out, and s runs on past the end along its last direction)
   if(!best||d<best.d){const a=C.A[k]+(((C.A[k+1]-C.A[k]+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI)*f,out=(k===0&&fr<0)||(k===C.n-2&&fr>1);best={s:(k+(out?fr:f))*C.step,d,px,pz,a,out,t:(x-px)*Math.cos(a)+(z-pz)*Math.sin(a)};}}
  if(!best){const k=bi;best={s:k*C.step,d:Math.sqrt(bd),px:C.X[k],pz:C.Z[k],a:C.A[k],t:(x-C.X[k])*Math.cos(C.A[k])+(z-C.Z[k])*Math.sin(C.A[k])};}
  return best;};}
const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,zi]=P[i],[xj,zj]=P[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
const polyDist=(P,x,z)=>{let best=1e18;for(let i=0,j=P.length-1;i<P.length;j=i++){const [ax,az]=P[j],[bx,bz]=P[i],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz||1,f=clamp(((x-ax)*dx+(z-az)*dz)/l,0,1);best=Math.min(best,Math.hypot(x-ax-dx*f,z-az-dz*f));}return best;};

// The frame alone: needed before the streets and the background are built (they leave room for it),
// and by walking. Builds nothing.
export function woodsFrame(W){
 const B=W.sideFrames[0],U=E.startU,p0=B.point(U,0),p1=B.point(U+15,0),a0=B.heading(U);
 const road=curve([[p0.x,p0.z],[p1.x,p1.z],...E.road.pts],.5),L=road.length;
 const keys=E.road.profile.map(([s,y])=>[Math.min(s,L),y]).filter((k,i,a)=>i===a.length-1||k[0]<L-1);keys[0][1]=p0.y+.03;
 const roadY=pchip(keys),halfW=s=>{const H=E.road.half;let i=0;while(i<H.length-2&&s>H[i+1][0])i++;const [s0,h0]=H[i],[s1,h1]=H[i+1];return lerp(h0,h1,smooth((Math.min(s,L)-s0)/(Math.min(s1,L)-s0)));};
 const near=nearest(road,8,3);
 // s, t of a point near the road (null farther than about 24 m from it).
 const project=(x,z)=>{const q=near(x,z);return q&&q.d<26&&!q.out?q:null;};
 const at=(s,t=0)=>{const i=clamp(s/road.step,0,road.n-1.0001),k=Math.floor(i),f=i-k,x=road.X[k]+(road.X[k+1]-road.X[k])*f,z=road.Z[k]+(road.Z[k+1]-road.Z[k])*f,a=road.A[k]+(road.A[k+1]-road.A[k])*f;return {x:x+Math.cos(a)*t,z:z+Math.sin(a)*t,a};};
 // The creek on the valley floor.
 const creekC=curve(E.creek.pts,1),creekNear=nearest(creekC,12,4),bedZ=pchip([...E.creek.bed].sort((p,q)=>p[0]-q[0]));
 const creek=(x,z)=>{const q=creekNear(x,z,6);const d=q?q.d:200;return {d,bed:bedZ(q?q.pz:z),q};};
 // The outfall frame.
 const P=E.portal,O={x:P.x,z:P.z},toA=(x,z)=>({a:x-O.x,b:z-O.z}),fromA=(a,b)=>({x:O.x+a,z:O.z+b});
 const capY=P.floor+P.h+P.cap,apronY=a=>P.floor-.004*Math.max(0,a)-.008*Math.max(0,a-9);
 const wingB=a=>P.w/2+.28+clamp(a,0,P.wing)*P.flare;
 const R=E.region.map(p=>[...p]);{const e0=B.point(U,50),e1=B.point(U,-50);R[0]=[e0.x,e0.z];R[1]=[e1.x,e1.z];}
 const box={x0:Math.min(...R.map(p=>p[0])),x1:Math.max(...R.map(p=>p[0])),z0:Math.min(...R.map(p=>p[1])),z1:Math.max(...R.map(p=>p[1]))};
 // Inside the woods' land: the outline (m > 0 grows it).
 const inside=(x,z,m=0)=>{if(x<box.x0-m||x>box.x1+m||z<box.z0-m||z>box.z1+m)return false;const i=inPoly(R,x,z);if(m===0)return i;return i?(m>0||polyDist(R,x,z)>-m):(m>0&&polyDist(R,x,z)<m);};
 // ---- the land: what was there, sagging down toward the creek, the road cut into it ----------------------
 const T0=(x,z)=>terrainY(x,z)+LAWN-.08;// the far ground's own level at the region's edge
 function reference(x,z){const t=T0(x,z),q=B.project(x,z,U+10);if(q.u>U-12&&q.u<U+34&&Math.abs(q.v)<58){const w=(1-smooth((q.u-U)/30))*(1-smooth((Math.abs(q.v)-42)/14));if(w>0)return lerp(t,B.point(q.u,q.v).y+LAWN,w);}return t;}
 function natural(x,z){const S=E.sag,c=creek(x,z),C=E.creek;
  let y=T0(x,z)-S.depth*smooth((x-S.x0)/(S.x1-S.x0))+.6*Math.sin(x*.043+1.1)*Math.sin(z*.051-.3);
  const floor=c.bed+.85+Math.min(c.d,C.floor)*.02,valley=floor+Math.max(0,c.d-C.floor)*C.side;y=smin(y,valley,4);
  if(c.d<3.2)y=Math.min(y,c.bed+.15+Math.max(0,c.d-1)*.42+.12*smooth(c.d/3.2));// the creek's own channel
  return y;}
 function roadShape(x,z,y,q=project(x,z)){if(!q)return y;const a=Math.abs(q.t),Y=roadY(q.s),hw=halfW(q.s);
  const bank=a<hw+.35?0:a<hw+1.9?-.4*Math.sin(Math.PI*(a-hw-.35)/1.55)*smooth(q.s/30):(a-hw-1.9)*.46;
  let r=smin(y,Y-.03+bank,1.2);// cut: banks rise from the ditches
  r=Math.max(r,Y-.03-Math.max(0,a-hw-.35)*.85);// fill: an embankment where the land falls away
  return a<hw+.35?Y-.03:r;}
 function portalShape(x,z,y){const {a,b}=toA(x,z),ab=Math.abs(b);if(a<-40||a>40||b<-40||b>40)return y;
  // The hill behind the headwall is never lower than its cap (it rises gently back into the woods).
  if(a<.4){const k=1-smooth((ab-(P.w/2+9))/7);y=Math.max(y,lerp(y,capY+(-a)*.1,k*(1-smooth((-a-30)/10))));}
  // In front: riprap fill slopes down from the wingwalls; between them, the apron.
  if(a>=0&&a<=P.wing+.01){const wb=wingB(a);if(ab<wb)return apronY(a);y=Math.max(y,capY-.3-(capY-P.floor-.95)*(a/P.wing)-(ab-wb)*.8);}
  if(a>P.wing&&a<16){const k=1-smooth((ab-(wingB(P.wing)+.4))/3.5);y=lerp(y,Math.min(y,apronY(a)+.04*Math.max(0,a-12)),k);}
  // The pad: a flat gravel turnaround at the road's end.
  const pd=Math.hypot(a-E.pad.a,b-E.pad.b);if(pd<E.pad.r+5){const py=roadY(L)-.03;y=lerp(y,py,1-smooth((pd-E.pad.r)/5));}
  return y;}
 function design(x,z){const q=project(x,z);let y=roadShape(x,z,natural(x,z),q);y=portalShape(x,z,y);
  // Fade to what is outside at the region's edge (but the road meets Briarwood's own end).
  let w=smooth(polyDist(R,x,z)/48);if(!inPoly(R,x,z))w=0;if(q&&q.s<40)w=Math.max(w,1-smooth((Math.abs(q.t)-halfW(q.s)-2)/6));
  return w>=1?y:lerp(reference(x,z),y,w);}
 // Keep trees, far houses, yard props and the like off the road and away from the region.
 {const c=B.point(U+17,0);W.space.rect(c.x,c.z,17,46,Math.atan2(Math.cos(a0),Math.sin(a0)),'woods');}
 const Wd={B,U,road,L,roadY,halfW,project,at,creek,creekC,P,O,toA,fromA,capY,apronY,wingB,inside,design,natural,reference,T0,region:R,box,zone:'woods'};
 return Wd;
}

export function buildWoods(W){
 const Wd=W.woods,{K}=W,veg=W.veg,rand=seeded(5150),{road,L,roadY,halfW,at,P,toA,fromA,capY,apronY,wingB,design}=Wd;
 const zone='woods',root=new THREE.Group(),farRoot=new THREE.Group();W.layers.push({mode:'rigid',group:root,zone},{mode:'rigid',group:farRoot,far:true,zone});
 const placeAt=(x,z,y,rot=0,far=false)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;(far?farRoot:root).add(g);return g;};
 const bake=m=>{m.userData.zone=zone;W.baked.push(m);return m;};
 // ---- materials -------------------------------------------------------------------------------------------
 const mat=(c,o={},kind=null)=>{const m=K.mat(c,o);return kind?W.surfaceMaterial(m,kind):m;};
 const litter=mat(0x5a5038,{},'litter'),meadow=mat(0x7c7f4c,{},'litter'),ditch=mat(0x3f3a2c,{roughness:.95},'litter');
 // The overgrown field at the street's end (grass), and the woods past it (leaf litter): by distance from the end of Briarwood.
 const P0=road.X[0],Z0=road.Z[0],fieldR=(x,z)=>Math.hypot(x-P0,z-Z0)-(14*Math.sin(x*.05+1)+9*Math.sin(z*.07));const inField=(x,z)=>fieldR(x,z)<100;void ditch;
 const asphalt=mat(0x57554f,{roughness:.96,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},'roadwear');
 const patchA=mat(0x3f3e3b,{roughness:.9,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},'roadwear');
 const crack=mat(0x34322e,{roughness:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4},'roadwear');
 const gravel=mat(0x7e7666,{roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1},'litter');
 const rut=mat(0x645a49,{roughness:.92,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},'litter');
 const concrete=mat(0x8a897d,{},'mineral'),oldConcrete=mat(0x6f6e64,{},'mineral'),stained=mat(0x5b5c54,{},'mineral');
 const water=mat(0x26343a,{roughness:.18,metalness:.4,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5},'water');
 const steel=K.mat(0x6b6a62,{roughness:.6,metalness:.5}),rust=K.mat(0x734a30,{roughness:.9,metalness:.25}),yellow=K.mat(0xb59a3a,{roughness:.8,metalness:.2});
 const flipUp=(geo,idx)=>{geo.setIndex(idx);geo.computeVertexNormals();const n=geo.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}geo.setIndex(idx);geo.computeVertexNormals();}};
 const meshOf=(pos,idx,m,name='')=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));flipUp(g,idx);const o=new THREE.Mesh(g,m);if(name)o.name=name;return bake(o);};
 // Ground split between field grass and woods litter, triangle by triangle.
 const groundMesh=(pos,idx,name,far=false)=>{const a=[],b=[];for(let k=0;k<idx.length;k+=3){const i0=idx[k]*3,i1=idx[k+1]*3,i2=idx[k+2]*3,cx=(pos[i0]+pos[i1]+pos[i2])/3,cz=(pos[i0+2]+pos[i1+2]+pos[i2+2])/3;(inField(cx,cz)?a:b).push(idx[k],idx[k+1],idx[k+2]);}
  const out=[];for(const [list,m,suffix] of [[a,meadow,'-field'],[b,litter,'']])if(list.length){const o=meshOf(pos,list,m,name+suffix);if(far)o.userData.far=true;out.push(o);}return out;};
 // ---- the three walking grids (and the rendered ground they share) ---------------------------------------
 // Road ribbon: one row per meter, columns measured from the road's edge so the ditches line up.
 const OFF=[.35,.9,1.5,1.9,2.6,3.6,5,7,9.5,13],cols=hw=>[...OFF.slice().reverse().map(o=>-(hw+o)),-hw,-hw/2,0,hw/2,hw,...OFF.map(o=>hw+o)],NC=OFF.length*2+5;
 const RS=1,NR=Math.floor(L/RS)+1,RY=new Float32Array(NR*NC),RX=new Float32Array(NR*NC),RZ=new Float32Array(NR*NC);
 for(let i=0;i<NR;i++){const s=Math.min(L,i*RS),c=cols(halfW(s));for(let j=0;j<NC;j++){const p=at(s,c[j]);RX[i*NC+j]=p.x;RZ[i*NC+j]=p.z;RY[i*NC+j]=design(p.x,p.z);}}
 // Outfall patch: half-meter cells in the outfall frame.
 const PA=E.patch,PD=.5,NA=Math.round((PA.a1-PA.a0)/PD)+1,NB=Math.round((PA.b1-PA.b0)/PD)+1,PY=new Float32Array(NA*NB);
 for(let i=0;i<NA;i++)for(let j=0;j<NB;j++){const p=fromA(PA.a0+i*PD,PA.b0+j*PD);PY[i*NB+j]=design(p.x,p.z);}
 const inPatch=(a,b,m=0)=>a>PA.a0+m&&a<PA.a1-m&&b>PA.b0+m&&b<PA.b1-m;
 // Creek ribbon: the channel and its banks, from where the road first sees the valley to past the outfall.
 const CC=Wd.creekC,COFF=[-7,-4.5,-3,-2,-1.3,-.6,0,.6,1.3,2,3,4.5,7],CS=1.5,cs0=40,cs1=Math.min(CC.length,430),CR=Math.floor((cs1-cs0)/CS)+1,CY=new Float32Array(CR*COFF.length),CX=new Float32Array(CR*COFF.length),CZ=new Float32Array(CR*COFF.length);
 const cAt=(s,t)=>{const i=clamp(s/CC.step,0,CC.n-1.0001),k=Math.floor(i),f=i-k,x=CC.X[k]+(CC.X[k+1]-CC.X[k])*f,z=CC.Z[k]+(CC.Z[k+1]-CC.Z[k])*f,a=CC.A[k];return {x:x+Math.cos(a)*t,z:z+Math.sin(a)*t};};
 for(let i=0;i<CR;i++)for(let j=0;j<COFF.length;j++){const p=cAt(cs0+i*CS,COFF[j]),k=i*COFF.length+j;CX[k]=p.x;CZ[k]=p.z;CY[k]=design(p.x,p.z);}
 // Height on the road ribbon at (s,t), the way the mesh draws it.
 function ribbonY(s,t){const fi=clamp(s/RS,0,NR-1.0001),i=Math.floor(fi),f=fi-i,c0=cols(halfW(i*RS)),c1=cols(halfW((i+1)*RS));
  const row=(ii,c)=>{if(t<=c[0])return RY[ii*NC];if(t>=c[NC-1])return RY[ii*NC+NC-1];let j=0;while(j<NC-2&&t>c[j+1])j++;const g=(t-c[j])/(c[j+1]-c[j]);return RY[ii*NC+j]*(1-g)+RY[ii*NC+j+1]*g;};
  return row(i,c0)*(1-f)+row(i+1,c1)*f;}
 function patchY(a,b){const fa=clamp((a-PA.a0)/PD,0,NA-1.001),fb=clamp((b-PA.b0)/PD,0,NB-1.001),i=Math.floor(fa),j=Math.floor(fb),x=fa-i,y=fb-j;
  const h00=PY[i*NB+j],h10=PY[(i+1)*NB+j],h01=PY[i*NB+j+1],h11=PY[(i+1)*NB+j+1];return x+y<=1?h00+(h10-h00)*x+(h01-h00)*y:h11+(h01-h11)*(1-x)+(h10-h11)*(1-y);}
 // Rendered: the road ribbon (rows inside the outfall patch dip under it), the patch, the creek ribbon.
 {const pos=[],idx=[];for(let k=0;k<NR*NC;k++){const {a,b}=toA(RX[k],RZ[k]);pos.push(RX[k],RY[k]-(inPatch(a,b,-.4)?.05:0),RZ[k]);}
  for(let i=0;i<NR-1;i++)for(let j=0;j<NC-1;j++){const q=[i*NC+j,(i+1)*NC+j,i*NC+j+1,(i+1)*NC+j+1];if(q.every(k=>{const {a,b}=toA(RX[k],RZ[k]);return inPatch(a,b,.3);}))continue;idx.push(q[0],q[2],q[1],q[1],q[2],q[3]);}
  groundMesh(pos,idx,'woods-road-ground');}
 {const pos=[],idx=[];for(let i=0;i<NA;i++)for(let j=0;j<NB;j++){const p=fromA(PA.a0+i*PD,PA.b0+j*PD);pos.push(p.x,PY[i*NB+j],p.z);}
  // Over the tunnel's box the patch leaves a hole (the box's own roof and the headwall are there).
  const overBox=(a,b)=>a<.45&&Math.abs(b)<P.w/2+.55&&a>-1.2;
  for(let i=0;i<NA-1;i++)for(let j=0;j<NB-1;j++){const a=PA.a0+(i+.5)*PD,b=PA.b0+(j+.5)*PD;if(overBox(a,b))continue;const k=i*NB+j;idx.push(k,k+1,k+NB,k+NB,k+1,k+NB+1);}
  meshOf(pos,idx,litter,'outfall-ground');}
 {const n=COFF.length,pos=[],idx=[];for(let k=0;k<CR*n;k++){const {a,b}=toA(CX[k],CZ[k]);pos.push(CX[k],CY[k]-(inPatch(a,b,-.4)?.05:0),CZ[k]);}
  for(let i=0;i<CR-1;i++)for(let j=0;j<n-1;j++){const q=[i*n+j,(i+1)*n+j,i*n+j+1,(i+1)*n+j+1];if(q.every(k=>{const {a,b}=toA(CX[k],CZ[k]);return inPatch(a,b,.3);}))continue;idx.push(q[0],q[2],q[1],q[1],q[2],q[3]);}
  meshOf(pos,idx,litter,'creek-ground');
  // The water: a ribbon a little above the bed, along the channel.
  const wp=[],wi=[];for(let i=0;i<CR;i++){const s=cs0+i*CS;for(const t of [-.95,.95]){const p=cAt(s,t);wp.push(p.x,Wd.creek(p.x,p.z).bed+.24,p.z);}if(i<CR-1){const a=i*2;wi.push(a,a+2,a+1,a+1,a+2,a+3);}}
  meshOf(wp,wi,water,'creek-water');}
 // Coarse ground over the rest of the woods (cells the ribbons and the patch cover are left out).
 const covered=(x,z,m)=>{const q=Wd.project(x,z);if(q&&q.s>-.5&&q.s<L+.5&&Math.abs(q.t)<halfW(q.s)+13-m)return true;const {a,b}=toA(x,z);if(inPatch(a,b,m))return true;
  const c=Wd.creek(x,z);return !!c.q&&c.q.s>cs0+1&&c.q.s<cs1-1&&c.d<7-m;};
 {const G=3,bx=Wd.box,nx=Math.ceil((bx.x1-bx.x0)/G)+1,nz=Math.ceil((bx.z1-bx.z0)/G)+1,H=new Float32Array(nx*nz),keep=new Uint8Array(nx*nz),vid=new Int32Array(nx*nz).fill(-1),pos=[],idx=[];
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const x=bx.x0+i*G,z=bx.z0+j*G;keep[i*nz+j]=Wd.inside(x,z,4)?1:0;if(!keep[i*nz+j])continue;H[i*nz+j]=design(x,z)-(covered(x,z,-1.2)?.07:0)-(Wd.inside(x,z)?0:.12);}
  const v=(i,j)=>{const k=i*nz+j;if(vid[k]<0){vid[k]=pos.length/3;pos.push(bx.x0+i*G,H[k],bx.z0+j*G);}return vid[k];};
  for(let i=0;i<nx-1;i++)for(let j=0;j<nz-1;j++){const ks=[i*nz+j,(i+1)*nz+j,i*nz+j+1,(i+1)*nz+j+1];if(!ks.every(k=>keep[k]))continue;
   const pts=[[i,j],[i+1,j],[i,j+1],[i+1,j+1]].map(([a,b])=>[bx.x0+a*G,bx.z0+b*G]);if(pts.every(([x,z])=>covered(x,z,.3)))continue;
   if(!pts.some(([x,z])=>Wd.inside(x,z)))continue;idx.push(v(i,j),v(i,j+1),v(i+1,j),v(i+1,j),v(i,j+1),v(i+1,j+1));}
  groundMesh(pos,idx,'woods-ground',true);}
 // ---- the road surface ---------------------------------------------------------------------------------------
 // Strips laid along the road at offsets t (from the centerline), between s0 and s1.
 function band(s0,s1,t0,t1,m,{lift=.02,step=1,name='',crown=0,tw=null}={}){const pos=[],idx=[];let n=0;
  for(let s=s0;s<=s1+1e-6;s+=step){const ss=Math.min(s,s1),hw=halfW(ss),a=typeof t0==='function'?t0(ss,hw):t0,b=typeof t1==='function'?t1(ss,hw):t1;
   for(const t of [a,(a+b)/2,b]){const p=at(ss,t);pos.push(p.x,ribbonY(ss,t)+lift+crown*Math.max(0,1-(t/hw)**2),p.z);}n++;}
  for(let i=0;i<n-1;i++)for(let j=0;j<2;j++){const q=i*3+j;idx.push(q,q+3,q+1,q+1,q+3,q+4);}
  return meshOf(pos,idx,m,name);}
 const S1=150,S2=330;// cracked asphalt; then broken asphalt over gravel; then two ruts
 band(0,S2+12,(s,hw)=>-hw-.25,(s,hw)=>hw+.25,gravel,{lift:.012,name:'woods-road-gravel'});
 band(S2,L,(s,hw)=>-hw-.1,(s,hw)=>hw+.1,gravel,{lift:.012,step:1});
 {// Asphalt: whole to S1, then in pieces with more and more of the gravel showing between them.
  let s=0;while(s<S2+8){const whole=s<S1,len=whole?S1-s:3+rand()*7,gap=whole?0:(1.2+rand()*4)*smooth((s-S1)/(S2-S1))+.4*rand();
   const e0=whole?0:(rand()-.5)*.5,e1=whole?0:(rand()-.5)*.5,sh=whole?0:rand()*.6*smooth((s-S1)/120);
   band(s,Math.min(s+len,S2+8),(ss,hw)=>-hw+sh+e0*Math.sin(ss),(ss,hw)=>hw-sh*.6+e1*Math.cos(ss*.7),asphalt,{lift:.022,crown:.03,name:whole?'woods-road-asphalt':''});s+=len+gap;}}
 // Cracks, a wandering center joint, transverse joints; dark patches where the city once filled potholes.
 const crackLine=(pts,w=.025)=>{const pos=[],idx=[];for(let k=0;k<pts.length;k++){const [s,t]=pts[k],[s2,t2]=pts[Math.min(k+1,pts.length-1)],[s0,t0]=pts[Math.max(k-1,0)],ds=s2-s0,dt=t2-t0,l=Math.hypot(ds,dt)||1;
  for(const e of [-1,1]){const tt=t+ds/l*w/2*e,ss=s-dt/l*w/2*e,p=at(ss,tt);pos.push(p.x,ribbonY(ss,tt)+.026,p.z);}}for(let k=0;k<pts.length-1;k++){const a=k*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}meshOf(pos,idx,crack);};
 {const j=[];for(let s=.6;s<S1;s+=.7)j.push([s,.16*Math.sin(s*.8)+.07*Math.sin(s*2.3)]);crackLine(j);
  for(let s=4;s<S1;s+=5+rand()*5){const hw=halfW(s),a=[];for(let k=0;k<=6;k++)a.push([s+.15*Math.sin(k*1.9+s),-hw+.1+k*(2*hw-.2)/6]);crackLine(a);}
  for(let k=0;k<70;k++){const s=10+rand()*(S1+40),t=(rand()-.5)*2*halfW(s)*.85,a=[[s,t]];for(let m=0;m<3;m++)a.push([a[m][0]+(rand()-.3)*.7,a[m][1]+(rand()-.5)*.5]);crackLine(a,.02);}
  for(let k=0;k<16;k++){const s=20+rand()*(S1+60),t=(rand()-.5)*halfW(s),l=.8+rand()*1.6,w=.6+rand()*1.1;band(s,s+l,t-w/2,t+w/2,patchA,{lift:.028,step:l/2});}}
 // Ruts and the grass strip between them, where the road is only gravel.
 // Wheels compact the same earth; irregular edges, leaf-filled gaps, no painted ribbons.
 rut.color.setHex(0x726b5d);
 for(const e of [-1,1])for(let s=S2-25;s<L-1;){const len=6+rand()*13,sw=.15+rand()*.1;
  band(s,Math.min(s+len,L-1),ss=>e*.82-sw+.035*Math.sin(ss*3.7)+.035*Math.sin(ss*.3),ss=>e*.82+sw+.045*Math.sin(ss*4.3)+.035*Math.sin(ss*.3),rut,{lift:.014,step:.35});s+=len+.5+rand()*1.8;}
 // ---- grass, weeds and brush along the edges -----------------------------------------------------------------
 const weed=K.mat(0x75804c,{side:THREE.DoubleSide,roughness:1}),dry=K.mat(0x9a9566,{side:THREE.DoubleSide,roughness:1}),fern=K.mat(0x3f5a32,{side:THREE.DoubleSide,roughness:1});for(const m of [weed,dry,fern])if(!W.foliage.includes(m))W.foliage.push(m);
 const tuft=(x,z,y,s,m,blades=5)=>{const g=placeAt(x,z,y-.02,rand()*6);for(let k=0;k<blades;k++){const h=(.18+rand()*.45)*s,w=.014+rand()*.014,bend=.05+rand()*.14,geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([-w,0,0,w,0,0,-w*.6,h*.55,bend*.3,w*.6,h*.55,bend*.3,bend*.35,h,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
  const c=new THREE.Mesh(geo,m);c.rotation.y=rand()*6;c.position.set((rand()-.5)*.2*s,0,(rand()-.5)*.2*s);g.add(c);}};
 const frond=(x,z,y,s)=>{const g=placeAt(x,z,y-.02,rand()*6);for(let k=0;k<6;k++){const a=k/6*Math.PI*2+rand()*.4,l=(.45+rand()*.3)*s,geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.07*s,.22*s,l*.45,.07*s,.22*s,l*.45,0,.12*s,l],3));geo.setIndex([0,2,1,1,2,3]);geo.computeVertexNormals();const m=new THREE.Mesh(geo,fern);m.rotation.y=a;g.add(m);}};
 const groundAt=(x,z)=>{const q=Wd.project(x,z);if(q&&q.s>=0&&q.s<=L&&Math.abs(q.t)<halfW(q.s)+12.9)return ribbonY(q.s,q.t);const {a,b}=toA(x,z);if(inPatch(a,b))return patchY(a,b);return design(x,z);};
 for(let s=1;s<L;s+=.9){const hw=halfW(s),early=1-smooth((s-90)/80),deep=smooth((s-S2)/80);
  for(const e of [-1,1]){if(rand()<.7){const t=e*(hw+.12+rand()*.5),p=at(s,t);tuft(p.x,p.z,ribbonY(s,t),.9+early*.8,rand()<.35*(1-deep)?dry:weed,4);}
   if(rand()<.55){const t=e*(hw+2.4+rand()*4),p=at(s,t);if(deep>.3&&rand()<.6)frond(p.x,p.z,ribbonY(s,t),.8+rand()*.6);else tuft(p.x,p.z,ribbonY(s,t),1.4+early*1.2,rand()<.3?dry:weed,6);}}
  if(s>S1&&rand()<.35*smooth((s-S1)/60)){const t=(rand()-.5)*.5,p=at(s,t);tuft(p.x,p.z,ribbonY(s,t)+.02,.6,weed,3);}// up through the broken asphalt, the grass between the ruts
 }
 // ---- the way in from Briarwood: posts, the gate, signs -------------------------------------------------------
 const solid=(x,z,r,tag='pole')=>W.space.circle(x,z,r,tag);
 const onRoad=(s,t,y=null,turn=0)=>{const p=at(s,t);return placeAt(p.x,p.z,y??ribbonY(s,t),-p.a+turn);};// local -z along the road, +x to its right
 // Concrete-filled steel bollards at the street's end, chipped yellow.
 for(const e of [-1,1])for(const o of [.55,1.75]){const t=e*(halfW(1.2)+o),g=onRoad(1.2,t);K.cyl(g,0,.5,0,.11,1,yellow,10);K.cyl(g,0,1.01,0,.1,.03,rust,10);const p=at(1.2,t);solid(p.x,p.z,.16);}
 // An end-of-road marker on the left: a red diamond with reflectors.
 {const t=-(halfW(2)+2.6),g=onRoad(2.4,t);K.cyl(g,0,.8,0,.03,1.6,steel,8);const tex=markerTexture(),m=new THREE.Mesh(new THREE.PlaneGeometry(.46,.46),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xa83a2a,map:tex,roughness:.5}));
  m.position.set(0,1.45,.03);m.rotation.z=Math.PI/4;m.name='woods-end-marker';g.add(m);K.box(g,0,1.45,.015,.33,.33,.012,0x8a8a84).rotation.z=Math.PI/4;const p=at(2.4,t);solid(p.x,p.z,.08,'sign');}
 // The gate: a pipe swing gate on two posts; the leaf hangs open, swung back into the weeds; the chain
 // that used to hold it hangs from the other post, the lock still on it.
 const GS=E.gate.s,gw=halfW(GS)+.5;
 {for(const e of [-1,1]){const g=onRoad(GS,e*gw);K.cyl(g,0,.62,0,.085,1.24,yellow,10);K.cyl(g,0,1.25,0,.095,.03,rust,10);const p=at(GS,e*gw);solid(p.x,p.z,.12);}
  const hinge=onRoad(GS,gw),leaf=new THREE.Group();hinge.add(leaf);leaf.rotation.y=-1.72;const len=2*gw-.25;// open: swung away from the street, toward the road's right edge
  K.rod(leaf,[0,.98,0],[-len,.98,0],.045,yellow,.045,8);K.rod(leaf,[0,.42,0],[-len*.94,.5,0],.035,yellow,.035,8);K.rod(leaf,[-len,.45,0],[-len,.99,0],.035,yellow,.035,8);
  for(let k=1;k<5;k++)K.rod(leaf,[-k*len/5,.44+.02*k,0],[-k*len/5,.98,0],.018,yellow,.018,6);K.rod(leaf,[0,.2,0],[-len*.55,.98,0],.022,yellow,.022,6);
  for(let k=0;k<5;k++)K.box(leaf,-len*(.12+k*.2),.98,0,.12,.1,.1,0x8a6a3a);// rust blooms
  // Fence segment for walking along the open leaf.
  {const a=new THREE.Vector3(0,0,0),b=new THREE.Vector3(-len,0,0);hinge.updateMatrixWorld(true);leaf.updateMatrixWorld(true);leaf.localToWorld(a);leaf.localToWorld(b);(W.fenceSegs||(W.fenceSegs=[])).push([a.x,a.z,b.x,b.z]);}
  const post=onRoad(GS,-gw);for(let k=0;k<11;k++){const l=new THREE.Mesh(new THREE.TorusGeometry(.022,.006,4,8),rust);l.position.set(.1+.01*Math.sin(k),1.0-k*.075,.02*Math.cos(k*1.3));l.rotation.y=k%2?Math.PI/2:0;post.add(l);}
  K.rbox(post,.1,.12,.03,.07,.08,.03,.008,0x6a5634);}
 // The Public Works sign at the gate, and the flood warning a little way in.
 {const t=gw+1.15,g=onRoad(GS-.6,t,null,0);K.cyl(g,0,1.1,0,.03,2.2,steel,8);K.box(g,0,2.02,0,.04,.04,.04,steel);
  const tex=signTexture(['PUBLIC WORKS','STORMWATER','MAINTENANCE ACCESS','AUTHORIZED','VEHICLES ONLY','NO DUMPING'],{bg:'#e2ddcc',fg:'#24324a',accent:'#24324a',faded:.38,w:256,h:300});
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.66,.78),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xd8d4c8,map:tex,roughness:.85}));s.name='woods-gate-sign';s.position.set(0,1.62,.03);s.rotation.y=Math.PI;g.add(s);
  K.box(g,0,1.62,.012,.68,.8,.015,0x8f8c82);const p=at(GS-.6,t);solid(p.x,p.z,.08,'sign');}
 {const s=E.signs.flood,t=halfW(s)+1.25,g=onRoad(s,t);K.cyl(g,0,1.05,0,.03,2.1,steel,8);
  const tex=signTexture(['FLOOD','CONTROL AREA','WATER MAY','RISE RAPIDLY','STAY OUT OF','DRAIN STRUCTURES'],{bg:'#ddd7c4',fg:'#2a2a28',accent:'#9b2b22',faded:.45,w:256,h:300});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(.56,.66),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xd8d4c8,map:tex,roughness:.85}));m.name='woods-flood-sign';m.position.set(0,1.6,.03);m.rotation.set(0,Math.PI+.12,.035);g.add(m);
  K.box(g,0,1.6,.012,.58,.68,.015,0x8f8c82).rotation.set(0,.12,.035);const p=at(s,t);solid(p.x,p.z,.08,'sign');}
 // A storm-sewer marker post (orange, cracked), and much farther on a bent sign nobody has read in years.
 {const s=21,t=-(halfW(s)+1.1),g=onRoad(s,t);K.box(g,0,.62,0,.1,1.24,.05,0xc06a2a).name='woods-sewer-marker';K.box(g,0,1.08,.027,.09,.2,.004,0xe8e2d2);const p=at(s,t);solid(p.x,p.z,.07,'sign');}
 {const s=E.signs.end,t=-(halfW(s)+1.3),g=onRoad(s,t,null,.3);g.rotation.z=.16;K.cyl(g,0,.95,0,.03,1.9,rust,8);
  const tex=signTexture(['ROAD','NOT','MAINTAINED'],{bg:'#d6cfb8',fg:'#2a2a28',faded:.55,w:256,h:200});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,.4),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xccc4ae,map:tex,roughness:.9}));m.position.set(0,1.62,.03);m.rotation.y=Math.PI;m.name='woods-old-sign';g.add(m);const p=at(s,t);solid(p.x,p.z,.07,'sign');}
 // Delineator posts with small reflectors along the edges (fewer, leaning, deeper in).
 Wd.reflectors=[];
 for(let s=40,e=1;s<L-30;s+=22+rand()*14,e=-e){const deep=smooth((s-S2)/60);if(rand()<deep*.45)continue;const t=e*(halfW(s)+.75),g=onRoad(s,t,null,0);const lean=deep*(rand()-.5)*.5;g.rotation.z=lean;g.rotation.x=(rand()-.5)*.12*deep;
  K.box(g,0,.6,0,.07,1.2,.03,0x8a8070);const r=K.box(g,0,1.08,-.017,.05,.11,.004,0xd8a33a);r.material=K.mat(0xd8a33a,{roughness:.25,metalness:.55});const p=at(s,t);solid(p.x,p.z,.06,'sign');Wd.reflectors.push({x:p.x,y:ribbonY(s,t)+1.08,z:p.z,s,e});}
 // The old pole line across the field: wooden poles on the right, the wires sagging between them; it
 // ends at the last pole before the trees, its wires cut and coiled.
 {const tops=[];for(let s=6;s<E.poles.to;s+=42){const t=halfW(s)+3.2,p=at(s,t),y=ribbonY(s,t),g=placeAt(p.x,p.z,y,-p.a);
   K.lathe(g,[[.001,-.4],[.16,-.4],[.155,0],[.14,4],[.115,9.1],[.001,9.15]],0,0,0,0x5a4a3a,7);K.box(g,0,8.6,0,1.9,.12,.12,0x4e4234);for(const x of [-.8,.8])K.cyl(g,x,8.74,0,.045,.16,0x8e9a96,6);
   solid(p.x,p.z,.2);tops.push({x:p.x,y:y+8.8,z:p.z,a:p.a});}
  const gw2=placeAt(0,0,0);for(let i=0;i<tops.length-1;i++){const A=tops[i],Bq=tops[i+1];for(const off of [-.8,.8]){const ax=A.x+Math.cos(A.a)*off,az=A.z+Math.sin(A.a)*off,bx=Bq.x+Math.cos(Bq.a)*off,bz=Bq.z+Math.sin(Bq.a)*off;
    let prev=null;for(let k=0;k<=10;k++){const f=k/10,pt=[ax+(bx-ax)*f,A.y+(Bq.y-A.y)*f-1.1*4*f*(1-f),az+(bz-az)*f];if(prev)K.rod(gw2,prev,pt,.009,0x1c1d1e,.009,3);prev=pt;}}}
  const last=tops[tops.length-1];if(last){for(let k=0;k<7;k++){const a=k/7*Math.PI*2;K.rod(gw2,[last.x+.15+Math.cos(a)*.25,last.y-6.4+Math.sin(a)*.25,last.z],[last.x+.15+Math.cos(a+.9)*.25,last.y-6.4+Math.sin(a+.9)*.25,last.z],.008,0x1c1d1e,.008,3);}}}
 // ---- the forest -----------------------------------------------------------------------------------------------
 // Near the road: real trees (mid detail) that close over it as it goes in; beyond, a wall of far trees.
 const trees=[],treeAt=(x,z,opts)=>{const y=groundAt(x,z)-.04;const t=veg.treeWorld(x,z,y,{...opts,natural:true});if(t){t.removeFromParent();(opts.lod==='far'?farRoot:root).add(t);trees.push({x,z});}return t;};
 const kinds=s=>{const r=rand();if(s<90)return r<.5?'young':r<.75?'maple':'birch';return r<.38?'oak':r<.72?'maple':r<.84?'young':r<.94?'pine':'birch';};
 let nearCount=0;
 for(let s=8;s<L-4;s+=1.1){const hw=halfW(s),dens=s<60?.18:s<130?.18+.5*smooth((s-60)/70):.72;
  for(const e of [-1,1]){if(rand()>dens)continue;const close=s>110&&rand()<.45,t=e*(hw+(close?2.7+rand()*2.6:5.2+rand()*17)),p=at(s,t);
   if(!Wd.inside(p.x,p.z,-2))continue;const {a,b}=toA(p.x,p.z);if(Math.hypot(a-E.pad.a,b-E.pad.b)<E.pad.r+2||(a>-2&&a<16&&Math.abs(b)<wingB(Math.min(a,P.wing))+3))continue;
   const big=s>150&&rand()<.4,kind=kinds(s);if(treeAt(p.x,p.z,{size:(big?1.25+rand()*.4:.85+rand()*.4)*(kind==='young'?1.2:1),kind,lod:close?'full':'mid',clearance:big?2.4:1.6}))nearCount++;}}
 // Round the pad and along the creek.
 for(let k=0;k<70;k++){const a=-6+rand()*36,b=-14+rand()*38,p=fromA(a,b);if(Math.hypot(a-E.pad.a,b-E.pad.b)<E.pad.r+1.5||(a>-3&&a<17&&Math.abs(b)<wingB(Math.min(a,P.wing))+2.5)||Math.abs(a-26.4)<3||(Math.abs(b)<7&&a>-1&&a<28))continue;
  const q=Wd.project(p.x,p.z);if(q&&q.s>0&&Math.abs(q.t)<halfW(q.s)+2.6)continue;if(treeAt(p.x,p.z,{size:1+rand()*.5,kind:rand()<.4?'oak':'maple',lod:'mid',clearance:2}))nearCount++;}
 let farCount=0;{const bx=Wd.box;for(let x=bx.x0;x<bx.x1;x+=7)for(let z=bx.z0;z<bx.z1;z+=7){const r=seeded(hashSeed(77,x,z)),tx=x+(r()-.5)*6,tz=z+(r()-.5)*6;if(!Wd.inside(tx,tz,-1))continue;
  const q=Wd.project(tx,tz);if(q&&q.s>-2&&q.s<L+2&&Math.abs(q.t)<halfW(q.s)+20)continue;const {a,b}=toA(tx,tz);if(inPatch(a,b,-2))continue;if(r()<.12)continue;
  if(inField(tx,tz)&&r()<.9)continue;// (the field: a tree here and there)
  if(treeAt(tx,tz,{size:1.05+r()*.8,kind:r()<.22?'pine':'maple',lod:'far',clearance:2.6}))farCount++;}}
 // The field itself: tall grass and weeds standing in it, thinning toward the trees.
 for(let k=0;k<1500;k++){const a=rand()*Math.PI*2,r=8+rand()*105,x=P0+Math.cos(a)*r,z=Z0+Math.sin(a)*r;if(!Wd.inside(x,z,-1)||!inField(x,z))continue;const q=Wd.project(x,z);if(q&&Math.abs(q.t)<halfW(q.s)+1.2)continue;
  tuft(x,z,groundAt(x,z),1.3+rand()*1.3,rand()<.4?dry:weed,6);}
 // Brush and fallen wood among the near trees.
 for(let k=0;k<520;k++){const s=10+rand()*(L-14),hw=halfW(s),t=(rand()<.5?-1:1)*(hw+2.2+rand()*14),p=at(s,t);if(!W.space.free(p.x,p.z,.6))continue;const y=groundAt(p.x,p.z),g=placeAt(p.x,p.z,y-.05,rand()*6);const r=.35+rand()*.55;for(let j=0;j<3;j++){const a=j*2.1+rand(),leaf=new THREE.Mesh(leafGeometrySmall,W.foliageMat(0x556b3d,true,leafTexture));leaf.position.set(Math.cos(a)*r*.35,r*.64,Math.sin(a)*r*.35);leaf.scale.set(r,r*.72,r);leaf.rotation.y=a;g.add(leaf);K.rod(g,[0,0,0],[Math.cos(a)*r*.3,r*.75,Math.sin(a)*r*.3],.016,0x4b4532,.006,5);}}
 for(let k=0;k<46;k++){const s=120+rand()*(L-130),hw=halfW(s),e=rand()<.5?-1:1,t=e*(hw+3+rand()*10),p=at(s,t);if(!W.space.free(p.x,p.z,1.4))continue;const y=groundAt(p.x,p.z),len=2.5+rand()*4,a=rand()*6,r=.12+rand()*.16,g=placeAt(p.x,p.z,y,a);
  K.rod(g,[-len/2,r*.8,0],[len/2,r*.7,0],r,0x4a3e30,r*.85,7);if(rand()<.5)K.rod(g,[len*.2,r,0],[len*.35,r+.5,.4],.04,0x4a3e30,.02,5);W.space.circle(p.x,p.z,.5,'log');}
 // ---- the outfall: headwall, wingwalls, apron, riprap, a rusted rail along the top ---------------------------------
 {const g=placeAt(P.x,P.z,P.floor,-Math.PI/2);// local -z runs east, out of the mouth (+a); +x is north (-b)
  const W2=P.w/2,H=P.h,top=capY-P.floor,wallT=.45,headW=P.w+2*1.9;
  const box=(x,y,z,w,h,d,m)=>K.box(g,x,y,z,w,h,d,m);
  // The headwall: one slab, the mouth through it, a cap along the top.
  for(const sd of [-1,1])box(sd*(W2+(headW/2-W2)/2),top/2-.1,wallT/2,headW/2-W2,top+.2,wallT,concrete).name=sd<0?'outfall-headwall':'';
  box(0,(H+top)/2,wallT/2,P.w+.02,top-H,wallT,concrete);box(0,top+.07,wallT/2-.04,headW+.3,.14,wallT+.25,oldConcrete);
  // Wingwalls: flaring out from the headwall's ends, stepping down toward their ends.
  const wingLen=P.wing/Math.cos(Math.atan(P.flare)),ang=Math.atan(P.flare);
  for(const sd of [-1,1]){const wg=new THREE.Group();wg.position.set(sd*(W2+.28),0,0);wg.rotation.y=-sd*ang;g.add(wg);// (flaring outward, away from the mouth)
   // one wall, its top sloping down from the headwall's cap to knee height at its end; thick enough that the
   // fill behind it meets it inside the concrete
   {const geo=new THREE.BoxGeometry(.86,1,wingLen,1,1,6),P2=geo.attributes.position;for(let i=0;i<P2.count;i++){const z=P2.getZ(i)-wingLen/2,u=-z/wingLen;P2.setZ(i,z);P2.setY(i,P2.getY(i)>0?top-.05-(top-.95)*u:-.15);}geo.computeVertexNormals();
    const w=new THREE.Mesh(geo,concrete);w.position.x=0;wg.add(w);const cap=new THREE.BoxGeometry(.94,.1,wingLen),C2=cap.attributes.position;for(let i=0;i<C2.count;i++){const z=C2.getZ(i)-wingLen/2,u=-z/wingLen;C2.setZ(i,z);C2.setY(i,C2.getY(i)+top-.05-(top-.95)*u);}cap.computeVertexNormals();wg.add(new THREE.Mesh(cap,oldConcrete));}}
  // Stains: rust and runoff streaks down the face, a green-black line where the water stands in wet years.
  for(let j=0;j<48;j++){const sd=j%2?1:-1,x=sd*(W2+.25+rand()*(headW/2-W2-.4)),len=.3+rand()*1.6;box(x,top-len/2-.05,wallT+.006,.04+rand()*.08,len,.008,j%3?0x4e5048:0x6a5a44);}
  box(0,.45,wallT+.007,headW,.5,.008,0x2f3a2e).name='outfall-waterline';
  // The rail along the cap: pipe posts and two rails, rusted, one post bent.
  // Form ties and chipped edges give the portal a human construction scale.
  for(const sd of [-1,1])for(const y of [.8,1.8,2.8])for(const xx of [.43,1.19]){const x=sd*(W2+xx);K.cyl(g,x,y,-.012,.029,.013,0x4d5048,12,[Math.PI/2,0,0]);}
  for(const sd of [-1,1]){for(let k=0;k<12;k++){const y=.25+k*(H-.3)/12;K.rbox(g,sd*(W2+.012),y,-.016,.06,.09,.055,.016,stained);}
   const x=sd*(headW/2-.25);K.rbox(g,x,top+.15,wallT/2,.18,.035,.18,.012,steel);for(const off of [-.06,.06])K.cyl(g,x+off,top+.18,wallT/2,.015,.016,rust,6);}
  for(let k=0;k<=8;k++){const x=-headW/2+.2+k*(headW-.4)/8,lean=k===6?.25:0;K.rod(g,[x,top+.14,wallT/2],[x+lean*.3,top+1.1,wallT/2-lean*.1],.024,rust,.022,6);}
  for(const y of [.62,1.08])K.rod(g,[-headW/2+.2,top+y,wallT/2],[headW/2-.2,top+y-(y>1?.06:0),wallT/2],.02,rust,.02,6);
  // The apron: a concrete slab out from the mouth, cracked, silt and leaves on it; the low flow down its middle.
  const AL=9.2;box(0,-.11,-AL/2,P.w+2*(.28+P.flare*P.wing)+.2,.2,AL,stained).name='outfall-apron';
  const wp=[],wi=[];for(let k=0;k<=12;k++){const a=k/12*26.4;for(const e of [-1,1]){const p=fromA(a,e*(.45+.1*Math.sin(a*.7))+.3*Math.sin(a*.21));wp.push(p.x,(a<AL?apronY(a)+.02:Math.min(patchY(a,0),apronY(a))+.03),p.z);}if(k<12){const q=k*2;wi.push(q,q+2,q+1,q+1,q+2,q+3);}}
  meshOf(wp,wi,water,'outfall-trickle');
  // Riprap: broken stone round the apron's end and up the slopes beside the wings.
  for(let k=0;k<240;k++){const a=rand()<.6?AL-.6+rand()*6:1+rand()*8,b=(rand()-.5)*2*(rand()<.6?6:wingB(P.wing)+3),pa=a,pb=b;
   if(a<P.wing&&Math.abs(b)<wingB(a)+.25)continue;const p=fromA(pa,pb),y=groundAt(p.x,p.z),s=placeAt(p.x,p.z,y,rand()*6);K.ball(s,0,.04,0,.12+rand()*.2,rand()<.5?0x77736a:0x8c877a,[1.2,.55+rand()*.3,1]);}
  // Debris the last storm pushed out: sticks, a plank, leaves banked against the wing.
  for(const [x,z,a,l] of [[-1,-2.6,.4,1.6],[.8,-3.4,-.3,1.2],[.3,-5.8,.15,2.1],[-1.4,-6.6,.7,1]])K.rod(g,[x-Math.cos(a)*l/2,.06,z-Math.sin(a)*l/2],[x+Math.cos(a)*l/2,.1,z+Math.sin(a)*l/2],.035,0x4a3c2c,.02,5);
  K.box(g,-.9,.03,-4.4,.24,.03,1.9,0x6e5a40).rotation.y=.3;}
 // Walls for walking: the headwall's two sides and the wingwalls (the mouth itself is open).
 {const segs=W.fenceSegs||(W.fenceSegs=[]),p=(a,b)=>fromA(a,b);
  for(const e of [-1,1]){const h0=p(.1,e*(P.w/2+.12)),h1=p(.1,e*(P.w/2+1.9+.3));segs.push([h0.x,h0.z,h1.x,h1.z]);const w1=p(P.wing,e*(wingB(P.wing)-.05));segs.push([h0.x,h0.z,w1.x,w1.z]);}}
 // ---- where the story needs things ---------------------------------------------------------------------------------
 const spot=(s,t=0)=>{const p=at(s,t);return {s,t,x:p.x,z:p.z,y:ribbonY(s,t),a:p.a};};
 const outA=(a,b)=>{const p=fromA(a,b);return {a,b,x:p.x,z:p.z,y:groundAt(p.x,p.z)};};
 Wd.spots={mouth:spot(0),gate:spot(GS),flood:spot(E.signs.flood),bend:spot(118),tracksEnd:spot(126),middle:spot(230),deep:spot(400),valley:spot(460),
  pad:outA(E.pad.a,E.pad.b),padNorth:outA(E.pad.a-1.5,E.pad.b-4.6),bikes:outA(E.pad.a-2.2,E.pad.b-3.2),wingEnd:outA(P.wing+2.6,wingB(P.wing)+1.6),apron:outA(5.2,0),portal:outA(.6,0),creek:outA(26.4,-2)};
 Object.assign(Wd,{ribbonY,patchY,inPatch,groundAt,trees,nearTrees:nearCount,farTrees:farCount,cols,NC});
 W.background=W.background||{};
 return Wd;
}

// Walking, riding and ground for points inside the woods (nav.js asks).
export function woodsNav(Wd){const E2=E,P=Wd.P,{L,halfW}=Wd;let limit=Infinity;
 function where(x,z){const {a,b}=Wd.toA(x,z);if(Wd.inPatch(a,b,.05))return {patch:true,a,b,q:null};const q=Wd.project(x,z);return {patch:false,a,b,q};}
 function groundY(x,z,w=where(x,z)){if(w.patch)return Wd.patchY(w.a,w.b);const q=w.q;if(q&&q.s>=-.5&&q.s<=L+.5&&Math.abs(q.t)<halfW(q.s)+12.9)return Wd.ribbonY(q.s,q.t);return Wd.design(x,z);}
 const surfaceLift=(x,z,w)=>{const q=w.q;if(!w.patch&&q&&q.s>=0&&q.s<=L&&Math.abs(q.t)<halfW(q.s)+.2)return q.s<150?.05:.03;if(w.patch&&w.a<P.wing&&w.a>-.1&&Math.abs(w.b)<Wd.wingB(w.a))return .0;return 0;};
 const onPad=(a,b,m=0)=>Math.hypot(a-E2.pad.a,b-E2.pad.b)<E2.pad.r-m;
 // Where a kid can walk: the road and its ditches and verges, the pad, round the end of the south wingwall,
 // the apron between the wings (and on into the mouth; the drain answers from there).
 function walkable(x,z,w=where(x,z)){
  if(w.patch){const {a,b}=w;if(onPad(a,b,.3))return true;if(a>-.05&&a<P.wing&&Math.abs(b)<Wd.wingB(a)-.75)return true;if(a>=P.wing&&a<14.5&&b>-6.5&&b<9.2)return true;if(a>4&&a<16&&b>4&&b<10)return true;
   const q=Wd.project(x,z);return !!q&&q.s>L-30&&q.s<=L+.5&&Math.abs(q.t)<halfW(q.s)+3.4&&q.s<limit;}
  const q=w.q;if(!q||q.s<0||q.s>L+.5||q.s>limit)return false;return Math.abs(q.t)<halfW(q.s)+(q.s<60?7.5:4.9);}
 function rideable(x,z,w=where(x,z)){if(w.patch){if(onPad(w.a,w.b,.6))return true;const q=Wd.project(x,z);return !!q&&q.s>L-30&&q.s<=L&&Math.abs(q.t)<halfW(q.s)+.35&&q.s<limit;}
  const q=w.q;if(!q||q.s<-.2||q.s>L||q.s>limit)return false;return Math.abs(q.t)<halfW(q.s)+.4;}
 function surface(x,z,w=where(x,z)){if(w.patch){if(w.a<P.wing+3&&Math.abs(w.b)<Wd.wingB(Math.min(w.a,P.wing))+.1)return 'concrete';return onPad(w.a,w.b)?'gravel':'grass';}
  const q=w.q;if(!q)return 'grass';const a=Math.abs(q.t),hw=halfW(q.s);if(a<hw)return q.s<150?'asphalt':q.s<330?'gravel':'earth';return a<hw+1.9?'gravel':'grass';}
 const heading=(x,z,w=where(x,z))=>w.q?w.q.a:Math.PI/2;
 return {where,groundY:(x,z,w)=>groundY(x,z,w)+surfaceLift(x,z,w||where(x,z)),baseY:groundY,walkable,rideable,surface,heading,setLimit:s=>{limit=s??Infinity;},get limit(){return limit;}};
}

// Small canvas textures for signs (nothing is downloaded). Faded: washed toward the board.
export function signTexture(lines,{bg='#ddd',fg='#222',accent=null,faded=0,w=256,h=200}={}){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;
 g.fillStyle=bg;g.fillRect(0,0,w,h);g.textAlign='center';const n=lines.length;
 lines.forEach((l,i)=>{const big=i<2;g.fillStyle=accent&&i<2?accent:fg;g.font=`bold ${big?Math.round(w*.13):Math.round(w*.09)}px Arial`;g.fillText(l,w/2,h*.17+i*((h*.78)/n),w-20);});
 g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(6,6,w-12,h-12);
 if(faded){g.fillStyle=bg;g.globalAlpha=faded;g.fillRect(0,0,w,h);g.globalAlpha=1;for(let k=0;k<70;k++){g.fillStyle=`rgba(120,110,90,${.05+Math.random()*.08})`;g.fillRect(Math.random()*w,Math.random()*h,4+Math.random()*30,2+Math.random()*8);}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
function markerTexture(){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=c.height=96;g.fillStyle='#a8322a';g.fillRect(0,0,96,96);g.fillStyle='#d9d2c4';
 for(const [x,y] of [[24,24],[72,24],[24,72],[72,72],[48,48]]){g.beginPath();g.arc(x,y,9,0,7);g.fill();}g.strokeStyle='#2a1a18';g.lineWidth=4;g.strokeRect(3,3,90,90);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
