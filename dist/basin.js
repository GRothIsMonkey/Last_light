// Chapter Three: downstream. Between Alex's house and the next one an old city access drive, the
// "pond road" the neighbors half remember, runs back past the side yards between two chain-link
// fences, down the bank behind the houses, to a fenced stormwater detention basin. The big culvert
// from the easement empties into it through a concrete headwall on its west side, under the edge of
// the same wooded rise; a concrete low-flow channel crosses the grass bottom to an outlet riser with a
// trash rack on the east side. Ordinary public works, neglected: cracked asphalt with weeds in the
// joints, faded signs, a chained double gate, a staff gauge nobody reads. Nothing here is strange.
//
// Everything is laid out in Briarwood's frame (u along the street, v across it), which is straight
// this far along, so the frame is a plain linear map. The basin's ground is one height grid shared
// by the rendered patch and by walking (like the easement's); older ground leaves out the cells it
// covers (streets.js, background.js). Static pieces bake into the merged world; the old bicycle and
// the marks it left are Chapter Three's own (chapter3.js), shown only when the story puts them here.
import * as THREE from './three.module.js';
import {BASIN as E,JUNCTIONS} from './layout.js';
import {LAWN,terrainY,nearY,streetCoords} from './terrain.js';
import {smooth,clamp,lerp,seeded} from './kit.js';

// The frame alone: needed before the streets and the background are built (they leave room for it).
export function basinFrame(W){
 const B=W.sideFrames[0],U=140,P0=B.point(U,0),h=B.heading(U),f={x:Math.sin(h),z:-Math.cos(h)},r={x:Math.cos(h),z:Math.sin(h)};
 const world=(u,v)=>({x:P0.x+f.x*(u-U)+r.x*v,z:P0.z+f.z*(u-U)+r.z*v});
 const local=(x,z)=>{const dx=x-P0.x,dz=z-P0.z;return {u:U+dx*f.x+dz*f.z,v:dx*r.x+dz*r.z};};
 const Z=E.zone,F=E.fence,D=E.drive;
 // The part of the world the basin answers for (walking, ground): the drive past the yards and the fenced basin.
 const inside=(x,z,m=0)=>{const q=local(x,z);return q.u>Z.u0-m&&q.u<Z.u1+m&&q.v>Z.v0-m&&q.v<Z.v1+m;};
 // Older ground leaves out cells wholly inside the patch (the patch covers them, a hair above or the bowl below).
 const covers=(u,v,m=.35)=>u>Z.u0+m&&u<Z.u1-m&&v>Z.v0+m&&v<Z.v1-m;
 const coversXZ=(x,z,m=.35)=>{const q=local(x,z);return covers(q.u,q.v,m);};
 // Near the bowl (the fence and a margin): older ground must not be there at all.
 const near=(u,v,m=1.5)=>u>F.u0-m&&u<F.u1+m&&v>F.v0-m&&v<F.v1+m,nearXZ=(x,z,m=1.5)=>{const q=local(x,z);return near(q.u,q.v,m);};
 // Keep trees, sheds, far houses and the like out of the drive and the basin (not solid: nobody walks into it).
 const reserve=(u0,u1,v0,v1,tag='basin')=>{const c=world((u0+u1)/2,(v0+v1)/2);W.space.rect(c.x,c.z,(u1-u0)/2,(v1-v0)/2,Math.atan2(r.x,r.z),tag);};// half-widths: along u, then along v
 reserve(D.u-D.fence-.4,D.u+D.fence+.4,D.v0-.4,F.v0+.2);reserve(F.u0-.6,F.u1+.6,F.v0-.6,F.v1+.6);
 // A heading whose forward is +v (into the basin) and the rotation for rigid pieces built with local -z along +v.
 const rot=Math.atan2(-r.x,-r.z),heading=Math.atan2(r.x,-r.z),uRot=Math.atan2(-f.x,-f.z);
 return {B,P0,f,r,world,local,inside,covers,coversXZ,near,nearXZ,rot,heading,uRot,E};
}

export function buildBasin(W){
 const Q=W.basin,{K}=W,veg=W.veg,B=Q.B,J=JUNCTIONS[0],rand=seeded(3311),F=E.fence,D=E.drive,BT=E.bottom,O=E.outlet,R=E.riser,Z=E.zone;
 // The land already there: the side street's lawns (they run down the bank behind the yards) and the
 // far land beyond them, whichever is higher, as the easement does.
 const farLawn=(x,z)=>{const {d,lat}=streetCoords(x,z),t=terrainY(x,z)+LAWN;return Math.abs(lat)<86?Math.min(t,nearY(d,lat)+LAWN):t;};
 const base=(u,v)=>{const p=Q.world(u,v),side=v<44.5?B.point(u,v).y+LAWN:-1e9;return Math.max(side,farLawn(p.x,p.z));};
 const sideGround=(u,v)=>B.point(u,v).y+W.sideSurface(J,u,v);
 // The bowl: a flat bottom (and the outlet's apron), 1:3 grass slopes up to the rim, the headwall's
 // backfill behind it, a shallow low-flow channel across the bottom.
 // The west side is a long concrete retaining wall with the culvert's mouth in it; the bottom runs right
 // up to it, and the grass slopes rise from the bottom on the other three sides.
 const rects=[[O.u,BT.u1,BT.v0,BT.v1]];
 const outside=(u,v)=>Math.min(...rects.map(([u0,u1,v0,v1])=>Math.hypot(Math.max(u0-u,0,u-u1),Math.max(v0-v,0,v-v1))));
 const topY=BT.y+O.h+.26,inFence=(u,v)=>u>F.u0&&u<F.u1&&v>F.v0&&v<F.v1;
 const lowA={u:O.u,v:O.v},lowB={u:R.u-R.size/2,v:R.v};
 const lowDist=(u,v)=>{const dx=lowB.u-lowA.u,dv=lowB.v-lowA.v,l=dx*dx+dv*dv,t=clamp(((u-lowA.u)*dx+(v-lowA.v)*dv)/l,0,1);return {d:Math.hypot(u-lowA.u-dx*t,v-lowA.v-dv*t),t};};
 function design(u,v){let y=base(u,v)+.012;
  if(inFence(u,v)){const bowl=BT.y+outside(u,v)/E.slope;y=Math.min(y,bowl);
   // Behind the wall the bank is held up level with its cap: a flat strip along the west fence.
   if(u<O.u){const k=smooth((v-(O.v-O.north-1.8))/1.8);y=y+(Math.max(base(u,v)+.012,topY-.02)-y)*k;}
   const L=lowDist(u,v);if(outside(u,v)<.01&&L.d<.55)y-=.09*(1-(L.d/.55)**2);}
  return y;}
 // The patch reaches well past the fence (to the easement's own ground on the west) so that older ground
 // can leave out every cell that touches the bowl without leaving a hole. It starts on a row of the side
 // street's lawn grid (31.2 = its half width + 27) so the two never overlap in a sliver.
 const DS=.5,U0=Z.u0-14,U1=Z.u1+12.4,V0=31.2,V1=Z.v1+12,nu=Math.round((U1-U0)/DS)+1,nv=Math.round((V1-V0)/DS)+1,Hs=new Float32Array(nu*nv);
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++)Hs[i*nv+j]=design(U0+i*DS,V0+j*DS);
 function height(u,v){const fu=clamp((u-U0)/DS,0,nu-1.001),fv=clamp((v-V0)/DS,0,nv-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;
  const h00=Hs[i*nv+j],h10=Hs[(i+1)*nv+j],h01=Hs[i*nv+j+1],h11=Hs[(i+1)*nv+j+1];
  return a+b<=1?h00+(h10-h00)*a+(h01-h00)*b:h11+(h01-h11)*(1-a)+(h10-h11)*(1-b);}
 // Where you stand anywhere along the drive: Briarwood's own lawn before the patch, the patch after.
 const groundAt=(u,v)=>v<Z.v0?sideGround(u,v):height(u,v);
 const flipUp=(geo,idx)=>{geo.setIndex(idx);geo.computeVertexNormals();const n=geo.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}geo.setIndex(idx);geo.computeVertexNormals();}};
 {const pos=[],idx=[];for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const u=U0+i*DS,v=V0+j*DS,p=Q.world(u,v);pos.push(p.x,Hs[i*nv+j],p.z);}
  // Cells over the culvert's box are left out: a separate cap roofs it, so nothing of the ground stands in its mouth.
  const overBox=(u,v)=>u>O.u-O.inside-.75&&u<O.u+.3&&Math.abs(v-O.v)<O.w/2+.3;
  const ez=W.easement;for(let i=0;i<nu-1;i++)for(let j=0;j<nv-1;j++){const uc=U0+(i+.5)*DS,vc=V0+(j+.5)*DS,c0=Q.world(uc,vc);if(ez?.inside(c0.x,c0.z,.4)||overBox(uc,vc))continue;const a=i*nv+j,b=(i+1)*nv+j,c=a+1,d=b+1;idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));flipUp(geo,idx);const m=new THREE.Mesh(geo,W.lawnTop||W.grassMat);m.name='basin-ground';W.baked.push(m);
  const cp=[],ci=[],cu0=O.u-O.inside-.75,cu1=O.u-.4,cv0=O.v-O.w/2-.3,cv1=O.v+O.w/2+.3;for(const [u,v] of [[cu0,cv0],[cu1,cv0],[cu0,cv1],[cu1,cv1]]){const p=Q.world(u,v);cp.push(p.x,topY-.012,p.z);}ci.push(0,2,1,1,2,3);
  const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));flipUp(cg,ci);const cap=new THREE.Mesh(cg,W.lawnTop||W.grassMat);cap.name='basin-culvert-cap';W.baked.push(cap);}
 // Strips laid on the ground along a centerline [u,v] list.
 function strip(pts,w,lift,material,name='',yAt=groundAt){const pos=[],idx=[];
  for(let k=0;k<pts.length;k++){const [u,v]=pts[k],[u2,v2]=pts[Math.min(k+1,pts.length-1)],[u0,v0]=pts[Math.max(k-1,0)],du=u2-u0,dv=v2-v0,l=Math.hypot(du,dv)||1,nu_=-dv/l,nv_=du/l;
   for(const e of [-1,1]){const uu=u+nu_*w/2*e,vv=v+nv_*w/2*e,p=Q.world(uu,vv);pos.push(p.x,yAt(uu,vv)+lift,p.z);}}
  for(let k=0;k<pts.length-1;k++){const a=k*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));flipUp(geo,idx);const m=new THREE.Mesh(geo,material);if(name)m.name=name;W.baked.push(m);return m;}
 const place=(u,v,y,turn=0,far=false)=>{const p=Q.world(u,v);return W.placeWorld(p.x,p.z,y,Q.rot+turn,far);};// local -z points into the basin (+v), +x toward -u
 const solid=(u,v,hu,hv,tag='wall')=>{const p=Q.world(u,v);W.space.rect(p.x,p.z,hu,hv,Math.atan2(Q.r.x,Q.r.z),tag);};// hu along u, hv along v
 const concrete=W.surfaceMaterial(K.mat(0x8c8b7e,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),'concrete');
 const oldConcrete=W.surfaceMaterial(K.mat(0x7c7b70),'concrete'),darkConcrete=W.surfaceMaterial(K.mat(0x55564f),'concrete'),wetConcrete=W.surfaceMaterial(K.mat(0x4a4f49,{roughness:.55}),'concrete');
 const asphalt=W.surfaceMaterial(K.mat(0x55534e,{roughness:.96,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),'asphalt');
 const crack=W.surfaceMaterial(K.mat(0x3d3b37,{roughness:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),'asphalt');
 const gravel=W.surfaceMaterial(K.mat(0x8a8170,{roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),'earth');
 const earth=W.surfaceMaterial(K.mat(0x6f6450,{roughness:.95,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),'earth');
 const water=W.surfaceMaterial(K.mat(0x2c3d43,{roughness:.2,metalness:.35,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}),'water');
 const steel=K.mat(0x6b6a62,{roughness:.6,metalness:.5}),rust=K.mat(0x7a4e32,{roughness:.9,metalness:.2});
 // ---- the drive: cracked asphalt between the side yards, gravel shoulders, weeds in the joints ----------
 {const pts=[];for(let v=D.v0;v<=D.v1+.001;v+=.6)pts.push([D.u+.06*Math.sin(v*.21),v]);
  strip(pts,D.half*2,.014,asphalt,'basin-drive');
  for(const e of [-1,1])strip(pts.map(([u,v])=>[u+e*(D.half+.18),v]),.42,.01,gravel);
  // Cracks: a wandering center joint, transverse joints every few meters, alligator patches near the end.
  const joint=[];for(let v=D.v0+.3;v<D.v1-.2;v+=.5)joint.push([D.u+.18*Math.sin(v*.9)+.08*Math.sin(v*2.7),v]);strip(joint,.022,.022,crack);
  for(let v=D.v0+2.1;v<D.v1-1;v+=2.6+rand()*1.6){const a=[];for(let k=0;k<=6;k++){const u=D.u-D.half+.1+k*(D.half*2-.2)/6;a.push([u,v+.12*Math.sin(k*1.9+v)]);}strip(a,.025,.022,crack);}
  for(let k=0;k<26;k++){const v=D.v1-1-rand()*8,u=D.u+(rand()-.5)*2.4,a=[[u,v],[u+(rand()-.5)*.5,v+.2+rand()*.3],[u+(rand()-.5)*.6,v+.5+rand()*.3]];strip(a,.02,.023,crack);}
  // Weeds standing up out of the joints and along both edges.
  const weed=K.mat(0x7f8a55,{side:THREE.DoubleSide,roughness:1});if(!W.foliage.includes(weed))W.foliage.push(weed);
  const tuft=(u,v,s=1)=>{const g=place(u,v,groundAt(u,v)-.01,rand()*6);for(let b=0;b<4;b++){const hgt=(.12+rand()*.28)*s,w=.012+rand()*.01,bend=.04+rand()*.1,geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.Float32BufferAttribute([-w,0,0,w,0,0,-w*.6,hgt*.55,bend*.3,w*.6,hgt*.55,bend*.3,bend*.35,hgt,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
   const c=new THREE.Mesh(geo,weed);c.rotation.y=rand()*6;c.position.set((rand()-.5)*.12,0,(rand()-.5)*.12);g.add(c);}};
  for(const [u,v] of joint)if(rand()<.3)tuft(u,v,.7);for(let k=0;k<70;k++){const e=rand()<.5?-1:1,v=D.v0+1+rand()*(D.v1-D.v0-1);tuft(D.u+e*(D.half+.05+rand()*.4),v,1+rand()*.8);}}
 // ---- fences: along both sides of the drive, round the basin; the gate stays chained -----------------
 const DF=D.fence;
 W.fenceRun(B,[[D.u-DF,D.fenceFrom],[D.u-DF,F.v0]],'chain');W.fenceRun(B,[[D.u+DF,D.fenceFrom],[D.u+DF,F.v0]],'chain');
 W.fenceRun(B,[[D.u-DF,F.v0],[F.u0,F.v0],[F.u0,F.v1],[F.u1,F.v1],[F.u1,F.v0],[E.gap.u1,F.v0]],'chain');
 // The double gate: pipe frames, mesh, a rusted chain and padlock through both leaves.
 const meshTex=(()=>{const n=32,d=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const a=Math.abs(((x+y)%16)-8),b=Math.abs(((x-y+64)%16)-8),on=a<1.3||b<1.3;const i=(y*n+x)*4;d[i]=d[i+1]=d[i+2]=200;d[i+3]=on?255:0;}
  const t=new THREE.DataTexture(d,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t;})();
 const gateMesh=new THREE.MeshStandardMaterial({color:0x8e928f,map:meshTex,alphaTest:.4,side:THREE.DoubleSide,roughness:.7,metalness:.3});
 const gu0=D.u-DF,gu1=E.gap.u0,gc=(gu0+gu1)/2,gw=(gu1-gu0)/2,gateY=groundAt(gc,F.v0);
 {const g=place(gc,F.v0,gateY,0,false);// local x across the drive (toward -u), -z into the basin
  const leafW=gw-.05,H=1.55;
  for(const e of [-1,1]){const x0=e*gw;// hinge posts, taller than the fence
   K.cyl(g,x0,(H+.3)/2,0,.045,H+.3,steel,10);K.cyl(g,x0,H+.31,0,.05,.03,steel,10);
   const leaf=K.group(g,x0,0,0);const lx=-e*leafW;// closed, the leaves meet in the middle
   for(const y of [.12,H/2,H-.04])K.rod(leaf,[0,y,0],[lx,y,0],.022,steel,.022,6);for(const x of [0,lx])K.rod(leaf,[x*.98,.1,0],[x*.98,H-.02,0],.022,steel,.022,6);
   K.rod(leaf,[0,.12,0],[lx*.98,H-.04,0],.015,steel,.015,5);
   const panel=new THREE.Mesh(new THREE.PlaneGeometry(leafW-.06,H-.2),gateMesh);panel.position.set(lx/2,H/2+.04,0);const uv=panel.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(leafW-.06)*7,uv.getY(i)*(H-.2)*7);leaf.add(panel);}
  // Chain looped through both leaves where they meet, a padlock hanging off it.
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2,x=Math.cos(a)*.07,y=.82+Math.sin(a)*.05;const l=new THREE.Mesh(new THREE.TorusGeometry(.016,.005,4,8),rust);l.position.set(x,y,.01*Math.sin(a));l.rotation.y=k%2?Math.PI/2:0;g.add(l);}
  for(let k=0;k<5;k++){const l=new THREE.Mesh(new THREE.TorusGeometry(.016,.005,4,8),rust);l.position.set(.05+k*.006,.74-k*.03,.02);l.rotation.y=k%2?Math.PI/2:0;g.add(l);}
  K.rbox(g,.07,.58,.025,.06,.07,.025,.008,0x6c5a3a);K.rod(g,[.05,.62,.025],[.09,.62,.025],.007,steel,.007,5);
  // The sign wired to the gate, sun-bleached: DETENTION BASIN / KEEP OUT / WATER MAY RISE RAPIDLY.
  const tex=signTexture(['DETENTION','BASIN','KEEP OUT','WATER MAY','RISE RAPIDLY'],{bg:'#d9d3c0',fg:'#7c2a22',faded:.42});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(.62,.46),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xc9c2ac,map:tex,roughness:.9}));sign.name='basin-gate-sign';sign.position.set(-.8,1.05,.03);g.add(sign);
  const back=new THREE.Mesh(new THREE.PlaneGeometry(.62,.46),K.mat(0x8f8b7c));back.position.set(-.8,1.05,.024);back.rotation.y=Math.PI;g.add(back);}
 // Where the gate leaves are, for walking (the gap beside the east post stays open).
 {const segs=W.fenceSegs||(W.fenceSegs=[]);const a=B.point(gu0,F.v0),b=B.point(gu1,F.v0);segs.push([a.x,a.z,b.x,b.z]);}
 // Between the gate and the corner post the narrow panel of chain-link has been pulled off its
 // post and pushed back into the basin, where it hangs, bent, from the corner post: a kid-wide gap.
 {const u=E.gap.u1,g=place(u,F.v0,groundAt(u,F.v0),0,false),L=E.gap.u1-E.gap.u0,geo=new THREE.PlaneGeometry(L,1.18,8,4),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const s=p.getX(i)+L/2,y=p.getY(i)+.62,k=s/L;p.setXYZ(i,-.09*Math.sin(k*3)-.06*k*(y/1.2),y-.07*k*k,-s*.97);}
  geo.computeVertexNormals();const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L*7,uv.getY(i)*8.3);const flap=new THREE.Mesh(geo,gateMesh);flap.name='basin-fence-flap';g.add(flap);
  K.rod(g,[0,.04,0],[0,1.3,0],.032,0x8e928f,.032,6);for(const y of [.25,.7,1.1])K.rod(g,[-.03,y,-L*.97],[.05,y-.2,-L*.97-.12],.004,0x8e928f,.004,3);
  const segs=W.fenceSegs;const a=B.point(u,F.v0+.05),b=B.point(u+.05,F.v0+L*.97);segs.push([a.x,a.z,b.x,b.z]);}
 // ---- the outlet: the culvert from the easement comes out of the bank in a concrete headwall --------------
 const box=(g,x,y,z,w,h,d,m)=>K.box(g,x,y,z,w,h,d,m);
 {const g=place(O.u,O.v,BT.y,-Math.PI/2,false);// local -z runs back into the bank (-u), +z out over the basin; x across (-v)
  const W2=O.w/2,H=O.h,top=topY-BT.y,wall=O.wall,half=sd=>sd>0?O.north:wall/2;// +x (north) is the shorter wing: the bank comes down round its end
  // One long retaining wall along the whole west side, the box culvert's mouth in the middle of it.
  for(const sd of [-1,1]){const b=box(g,sd*(W2+(half(sd)-W2)/2),top/2-.05,-.2,half(sd)-W2,top+.1,.42,concrete);if(sd<0)b.name='basin-headwall';}
  box(g,0,(H+top)/2,-.2,O.w+.02,top-H,.42,concrete);K.box(g,(O.north-wall/2)/2,top+.06,-.25,wall/2+O.north+.1,.14,.62,oldConcrete);
  // Construction joints every few meters and a thicker collar round the mouth.
  for(let x=-wall/2+2.4;x<O.north-1;x+=2.45)if(Math.abs(x)>W2+.4)box(g,x,top/2,.012,.03,top,.012,0x5d6058);
  for(const e of [-1,1])box(g,e*(W2+.16),H/2+.05,.03,.3,H+.1,.06,oldConcrete);box(g,0,H+.18,.03,O.w+.62,.24,.06,oldConcrete);
  // The box going back under the bank: floor, walls, ceiling, and the dark a few meters in.
  const L=O.inside;box(g,0,-.04,-(L/2+.4)+.35,O.w+.4,.08,L+.7,wetConcrete).name='basin-culvert-floor';
  for(const e of [-1,1])box(g,e*(W2+.1),H/2,-(L/2+.4),.2,H,L,wetConcrete);box(g,0,H+.1,-(L/2+.4),O.w+.4,.2,L,darkConcrete);
  const back=box(g,0,H/2,-(L+.35),O.w,H,.1,0x050506);back.material=new THREE.MeshBasicMaterial({color:0x040405});back.material.userData.keep=true;back.name='basin-culvert-dark';
  for(const z of [-1.8,-3.9])for(const e of [-1,1])box(g,e*(W2-.022),H/2,z,.045,H,.075,0x464b43);
  // Weathering: runoff stains under the cap, a sediment line, chipped corners.
  for(const side of [-1,1]){for(let j=0;j<34;j++){const x=side*(W2+.4+rand()*(half(side)-W2-.6)),len=.15+rand()*.9;box(g,x,top-len/2-.05,.017,.03+rand()*.06,len,.01,j%3?0x676b60:0x898c7e);}
   box(g,side*(half(side)/2+W2/2),.3,.02,half(side)-W2,.14,.012,0x676b60);}
  for(let j=0;j<16;j++){const e=j%2?1:-1;K.ball(g,e*(W2+.02),.15+(j>>1)*.22,.012,.022+rand()*.016,0x828475,[.7,1.7,.5]);}
  // Standing water in the mouth; leaves and sticks the last storm pushed out.
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(O.w-.1,L+.4),W.surfaceMaterial(K.mat(0x1d2a2e,{roughness:.12,metalness:.45}),'water'));pool.rotation.x=-Math.PI/2;pool.position.set(0,.05,-(L/2+.3));g.add(pool);
  for(const [x,z,a,l] of [[-.5,.6,.4,1.4],[.6,1.1,-.3,1.1],[.1,1.8,.15,1.6],[-.8,-.4,.6,.8]])K.rod(g,[x-Math.cos(a)*l/2,.08,z-Math.sin(a)*l/2],[x+Math.cos(a)*l/2,.13,z+Math.sin(a)*l/2],.03,0x4a3c2c,.018,5);}
 // Solid for walking: the wall (you cannot step off its top or walk through it); the strip behind it is
 // not walkable at all (basinNav), only the first step into the mouth from the front.
 solid(O.u-.2,O.v-(O.w/2+(O.north-O.w/2)/2),.25,(O.north-O.w/2)/2);solid(O.u-.2,O.v+(O.w/2+(O.wall/2-O.w/2)/2),.25,(O.wall/2-O.w/2)/2);
 // Riprap: broken stone laid in front of the mouth so the water does not dig a hole.
 for(let k=0;k<80;k++){const u=O.u+.3+rand()*2.2,v=O.v+(rand()-.5)*5.2,g=place(u,v,height(u,v)+.02,rand()*6);K.ball(g,0,.04,0,.08+rand()*.12,rand()<.5?0x7b776c:0x8f8a7b,[1.2,.55+rand()*.3,1]);}
 // ---- the low-flow channel across the bottom, and its trickle --------------------------------------------
 {const pts=[];for(let k=0;k<=24;k++){const t=k/24;pts.push([lowA.u+.3+(lowB.u-lowA.u-.3)*t,lowA.v+(lowB.v-lowA.v)*t+.12*Math.sin(t*9)]);}
  strip(pts,1.05,.012,concrete,'basin-lowflow');strip(pts.map(([u,v])=>[u,v]),.32,.03,water,'basin-trickle',height);
  for(let k=2;k<pts.length-1;k+=4){const [u,v]=pts[k];strip([[u-.02,v-.5],[u,v],[u+.02,v+.5]],.025,.02,darkConcrete);}}
 // ---- the outlet riser: a concrete box with a trash rack on top and a slot for low flows -------------------
 {const g=place(R.u,R.v,BT.y-.05,0,false),S=R.size;
  K.rbox(g,0,R.h/2,0,S,R.h,S,.03,concrete).name='basin-riser';box(g,0,R.h+.04,0,S+.12,.08,S+.12,oldConcrete);
  for(let k=0;k<9;k++){const x=-S/2+.12+k*(S-.24)/8;K.rod(g,[x,R.h+.1,-S/2+.06],[x,R.h+.1,S/2-.06],.018,rust,.018,5);}
  for(const z of [-.45,.2])K.rod(g,[-S/2+.06,R.h+.12,z],[S/2-.06,R.h+.12,z],.02,rust,.02,5);
  box(g,0,.32,S/2+.01,.5,.34,.02,0x0a0b0b);// the low-flow slot
  for(let j=0;j<10;j++)box(g,-S/2+.1+rand()*(S-.2),R.h-.2-rand()*.6,S/2+.012,.03,.2+rand()*.5,.008,0x676b60);
  solid(R.u,R.v,S/2+.05,S/2+.05);}
 // A staff gauge on its post, white with black feet marks, mostly peeled.
 {const u=R.u-2.1,v=R.v+2.3,g=place(u,v,height(u,v),0,false);K.box(g,0,1.1,0,.09,2.2,.09,0x6b6a62);
  const tex=gaugeTexture(),pl=new THREE.Mesh(new THREE.PlaneGeometry(.12,1.9),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xd8d4c8,map:tex,roughness:.85}));pl.position.set(0,1.12,-.05);pl.rotation.y=Math.PI;g.add(pl);solid(u,v,.12,.12,'pole');}
 // ---- the sign at the street end of the drive, and a pole with a transformer by the gate ------------------
 {const u=D.u+D.half+.65,v=D.v0+1.1,g=place(u,v,groundAt(u,v),0,false);K.cyl(g,0,1.1,0,.03,2.2,steel,8);
  const tex=signTexture(['NO','PARKING','DRAINAGE','ACCESS','PUBLIC WORKS'],{bg:'#e3dfd2',fg:'#2a2a28',accent:'#9b2b22',faded:.3});
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.42,.56),new THREE.MeshStandardMaterial({color:tex?0xffffff:0xd8d4c8,map:tex,roughness:.9}));s.name='basin-street-sign';s.position.set(0,1.85,.042);g.add(s);// faces the street
  K.box(g,0,1.85,.02,.44,.58,.02,0x9c9a92);solid(u,v,.08,.08,'pole');}
 const poleAt={u:D.u+DF+2.1,v:F.v0-3.6};
 {const y=groundAt(poleAt.u,poleAt.v),g=place(poleAt.u,poleAt.v,y,0,false);K.rod(g,[0,0,0],[0,9.2,0],.14,0x5a4a3a,.11,7).name='basin-pole';K.box(g,0,8.7,0,1.9,.12,.12,0x4e4234);for(const x of [-.8,.8])K.cyl(g,x,8.86,0,.045,.16,0x8e9a96,6);
  K.cyl(g,.32,7.4,0,.26,.85,0x7f8580,12);K.cyl(g,.32,7.87,0,.27,.06,0x6b706c,12);K.cyl(g,.32,8.02,0,.04,.24,0x8e9a96,6);
  solid(poleAt.u,poleAt.v,.2,.2,'pole');
  // Its line runs back out to the pole across Briarwood.
  const pole=(W.poles||[]).filter(p=>p.frame===B).map(p=>({p,d:Math.hypot(p.x-Q.world(poleAt.u,0).x,p.z-Q.world(poleAt.u,0).z)})).sort((a,b)=>a.d-b.d)[0]?.p;
  if(pole){const top=Q.world(poleAt.u,poleAt.v),a={x:top.x,y:y+8.86,z:top.z},b={x:pole.x,y:(pole.y??y)+8.9,z:pole.z},gw=W.placeWorld(0,0,0,0,false);
   for(const off of [-.8,.8]){const ox=Q.f.x*off,oz=Q.f.z*off,pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push([a.x+ox+(b.x-a.x)*t,a.y+(b.y-a.y)*t-.9*4*t*(1-t),a.z+oz+(b.z-a.z)*t]);}for(let k=0;k<pts.length-1;k++)K.rod(gw,pts[k],pts[k+1],.01,0x1c1d1e,.01,3);}}}
 // ---- tall grass on the slopes, weeds along the fence, brush and trees beyond it ------------------------
 const tall=K.mat(0x8a9263,{side:THREE.DoubleSide,roughness:1}),dry=K.mat(0xa39f6c,{side:THREE.DoubleSide,roughness:1});for(const m of [tall,dry])if(!W.foliage.includes(m))W.foliage.push(m);
 const clump=(u,v,s,mat)=>{const g=place(u,v,height(u,v)-.03,rand()*6);for(let b=0;b<5;b++){const hgt=(.3+rand()*.55)*s,w=.016+rand()*.02,bend=.08+rand()*.16,geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([-w,0,0,w,0,0,-w*.6,hgt*.55,bend*.3,w*.6,hgt*.55,bend*.3,bend*.35,hgt,bend],3));geo.setIndex([0,1,2,1,3,2,2,3,4]);geo.computeVertexNormals();
  const c=new THREE.Mesh(geo,mat);c.rotation.y=rand()*6;c.position.set((rand()-.5)*.25,0,(rand()-.5)*.25);g.add(c);}};
 const nearLow=(u,v)=>lowDist(u,v).d<.9,clearOf=(u,v)=>Math.hypot(u-R.u,v-R.v)>1.6&&!(u>O.u-.6&&u<O.u+2.8&&Math.abs(v-O.v)<O.w/2+1.4)&&!(u>O.u-.6&&u<O.u+.5)&&!nearLow(u,v)&&!(u<E.gap.u1+1&&v<F.v0+2.4);
 for(let k=0;k<300;k++){const u=F.u0+.5+rand()*(F.u1-F.u0-1),v=F.v0+.5+rand()*(F.v1-F.v0-1);if(!clearOf(u,v))continue;const slope=outside(u,v);clump(u,v,slope>.2?1.1:.75,rand()<.3?dry:tall);}
 for(let k=0;k<70;k++){const side=k%4,t=rand();const [u,v]=side===0?[F.u0+t*(F.u1-F.u0),F.v1-.35]:side===1?[F.u1-.35,F.v0+t*(F.v1-F.v0)]:side===2?[F.u0+.35,F.v0+t*(F.v1-F.v0)]:[E.gap.u1+1+t*(F.u1-E.gap.u1-1),F.v0+.35];if(!clearOf(u,v))continue;clump(u,v,1.3,tall);}
 for(let k=0;k<44;k++){const side=k%3,t=rand();const [u,v]=side===0?[F.u0+t*(F.u1-F.u0),F.v1+.9+rand()*1.6]:side===1?[F.u1+.9+rand()*1.5,F.v0+t*(F.v1-F.v0)]:[F.u0-.7-rand()*.4,F.v0+4+t*(F.v1-F.v0-4)];const g=place(u,v,height(u,v));veg.shrub(g,0,0,.4+rand()*.5,rand);}
 const trees=[];for(const [u,v,size,kind] of [[141.5,67.5,1.05,'maple'],[150,68.2,.95,'oak'],[158,67.4,1.1,'maple'],[165.5,68.4,.9,'pine'],[169.2,60,1,'oak'],[169.6,49.5,.85,'young'],[136.4,46,1,'maple'],[147.2,38.3,.8,'young'],[163,38.7,.95,'maple']]){const p=Q.world(u,v);if(veg.treeWorld(p.x,p.z,height(u,v)-.03,{size,kind,lod:'full',clearance:1.4}))trees.push([u,v]);}
 // ---- where the story needs things ---------------------------------------------------------------------
 const at=(u,v,y=null)=>{const p=Q.world(u,v);return {u,v,x:p.x,z:p.z,y:y??groundAt(u,v)};};
 const spots={driveMouth:at(D.u,D.v0+.8),driveMid:at(D.u,26),driveEnd:at(D.u,F.v0-1.6),gate:at(D.u,F.v0),gapOut:at((E.gap.u0+E.gap.u1)/2,F.v0-1.2),gap:at((E.gap.u0+E.gap.u1)/2,F.v0),gapIn:at((E.gap.u0+E.gap.u1)/2,F.v0+1.4),
  bike:at(E.bike.u,E.bike.v),rim:at(148.5,44.6),bottom:at((O.u+BT.u1)/2,(BT.v0+BT.v1)/2),outlet:at(O.u+.2,O.v,BT.y),apron:at(O.u+2.6,O.v),riser:at(R.u,R.v,BT.y+R.h),gauge:at(R.u-2.1,R.v+2.3),
  deep:at(O.u-11.5,O.v,BT.y+1.05),pole:at(poleAt.u,poleAt.v),street:at(D.u+2.6,2.2),corner:at(D.u,-1)};
 Object.assign(Q,{height,groundAt,design,spots,topY,lowA,lowB,trees,outside,inFence,patch:{u0:U0,u1:U1,v0:V0,v1:V1}});
 return Q;
}

// Walking and ground queries (nav.js asks these for points inside the basin's zone).
export function basinNav(Q){const F=E.fence,D=E.drive,O=E.outlet,R=E.riser;
 const inMouth=(u,v)=>u<O.u+.1&&u>O.u-O.inside&&Math.abs(v-O.v)<O.w/2+.05;
 function groundY(u,v){return inMouth(u,v)?E.bottom.y+.02:Q.groundAt(u,v);}
 function walkable(u,v){if(v<F.v0+.05)return Math.abs(u-D.u)<D.fence-.1&&v<D.v1;
  if(u<F.u0+.15||u>F.u1-.15||v>F.v1-.15)return false;
  // Over the culvert's box: only the first step into the mouth, and only from the front. The strip
  // behind the wall (where the gate opens) is level ground; the wall itself is solid.
  if(u<O.u+.1&&u>O.u-O.inside-.9&&Math.abs(v-O.v)<O.w/2+.6)return u>O.u-.85&&Math.abs(v-O.v)<O.w/2-.3;
  return true;}
 function surface(u,v){if(Math.abs(u-D.u)<D.half+.05&&v<D.v1)return 'asphalt';if(Q.outside(u,v)<.05&&Math.hypot(u-R.u,v-R.v)>1)return Math.abs(v-(Q.lowA.v+(Q.lowB.v-Q.lowA.v)*clamp((u-Q.lowA.u)/(Q.lowB.u-Q.lowA.u),0,1)))<.55?'asphalt':'grass';return inMouth(u,v)?'asphalt':'grass';}
 const onDrive=(u,v)=>Math.abs(u-D.u)<D.half-.25&&v>D.v0-.3&&v<F.v0-.6,rideable=onDrive;
 return {groundY,walkable,surface,inMouth,rideable,onDrive};
}

// Small canvas textures for signs (nothing is downloaded). Faded: washed toward the board.
function signTexture(lines,{bg='#ddd',fg='#222',accent=null,faded=0}={}){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=256;c.height=200;
 g.fillStyle=bg;g.fillRect(0,0,256,200);g.textAlign='center';const n=lines.length;
 lines.forEach((l,i)=>{const big=i<2;g.fillStyle=accent&&i<2?accent:fg;g.font=`bold ${big?34:24}px Arial`;g.fillText(l,128,38+i*(170/n),236);});
 g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(6,6,244,188);
 if(faded){g.fillStyle=bg;g.globalAlpha=faded;g.fillRect(0,0,256,200);g.globalAlpha=1;for(let k=0;k<60;k++){g.fillStyle=`rgba(120,110,90,${.05+Math.random()*.08})`;g.fillRect(Math.random()*256,Math.random()*200,4+Math.random()*30,2+Math.random()*8);}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
function gaugeTexture(){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=32;c.height=256;g.fillStyle='#e7e3d6';g.fillRect(0,0,32,256);g.fillStyle='#1a1a1a';
 for(let k=0;k<40;k++){const y=256-k*6.4;g.fillRect(0,y-2,k%5===0?24:12,2.4);if(k%10===0){g.font='bold 11px Arial';g.fillText(String(k/10),18,y-4);}}
 g.fillStyle='rgba(120,100,70,.55)';g.fillRect(0,170,32,86);for(let k=0;k<30;k++){g.fillStyle=`rgba(90,80,60,${.1+Math.random()*.2})`;g.fillRect(Math.random()*32,Math.random()*256,3+Math.random()*10,2+Math.random()*6);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
