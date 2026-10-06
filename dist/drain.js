// Chapter Three: the storm sewer trunk behind the outfall. A reinforced concrete box, big enough at the mouth
// to walk in upright with room to spare (a city builds them that size so a crew can get in to clear them),
// running back under the woods toward the neighborhood it drains. From the mouth: the first stretch of
// precast sections with a low-flow channel down the middle and a maintenance walkway along one wall; a long
// bend to the right, after which the way out cannot be seen and the ceiling starts coming down; an older
// cast-in-place stretch, lower and narrower, ankle-deep water across its whole floor, cracked, patched, flood
// lines on the walls, roots through its joints, a manhole shaft with a ladder, black side drains, a side pipe;
// a spillway step up into the oldest, smallest box of all: three meters across, the ceiling just over your
// head, water to the ankles but for a narrow dry lip along one wall, pipes and old brackets overhead, broken
// concrete, rebar showing; a sharp bend to the left; a last, dry stretch with two side drains facing each other
// across it; and a junction chamber, where the smaller culvert from Briarwood's drainage easement (Chapter
// Two's) comes in high on the left wall and the trunk goes on beyond a bar screen. Nothing is impossible here:
// every piece is a thing a public works department builds and forgets.
//
// It has its own frame: s along its centerline from the portal face, t across it (+t to the right looking
// upstream, into it). One height function answers for the floor, for walking and for the rendered floor alike
// (and one more for standing water). Everything static bakes into the merged world under the zone 'tunnel'
// (drawn only when you are near the mouth or inside it; game.js).
import * as THREE from './three.module.js';
import {WOODS,DRAIN as D} from './layout.js';
import {smooth,clamp,lerp,seeded} from './kit.js';
import {signTexture} from './woods.js';

export function drainFrame(W){
 const P=WOODS.portal,step=.25,n=Math.floor(D.len/step)+1,X=new Float64Array(n),Z=new Float64Array(n),A=new Float64Array(n);
 const headingAt=s=>-Math.PI/2+D.turns.reduce((h,[s0,s1,turn])=>h+turn*clamp((s-s0)/(s1-s0),0,1),0);
 X[0]=P.x;Z[0]=P.z;A[0]=headingAt(0);for(let i=1;i<n;i++){const a=headingAt((i-.5)*step);X[i]=X[i-1]+Math.sin(a)*step;Z[i]=Z[i-1]-Math.cos(a)*step;A[i]=headingAt(i*step);}
 // Section sizes, eased over a meter or so where they change (a transition, as built).
 const SEC=D.sections,J=D.junction;
 const sizeAt=s=>{let w=SEC[0][2],h=SEC[0][3];for(let i=0;i<SEC.length;i++){const [s0,s1,ww,hh]=SEC[i];if(s>=s0){w=ww;h=hh;}}
  for(let i=1;i<SEC.length;i++){const b=SEC[i][0],[,,w0,h0]=SEC[i-1],[,,w1,h1]=SEC[i];if(Math.abs(s-b)<.6){const k=smooth((s-b+.6)/1.2);w=lerp(w0,w1,k);h=lerp(h0,h1,k);}}
  const j=smooth((s-J.s0)/1.6);return {w:lerp(w,J.w,j),h:lerp(h,J.h,j)};};
 const kindAt=s=>{let k=SEC[0][4];for(const [s0,,,,kk] of SEC)if(s>=s0)k=kk;return s>=J.s0?'junction':k;};
 const floor=s=>P.floor+D.grade*Math.max(0,s)+D.step.h*smooth((s-D.step.s)/D.step.len);
 const at=(s,t=0)=>{const i=clamp(s/step,0,n-1.0001),k=Math.floor(i),f=i-k,x=X[k]+(X[k+1]-X[k])*f,z=Z[k]+(Z[k+1]-Z[k])*f,a=A[k]+(A[k+1]-A[k])*f;return {x:x+Math.cos(a)*t,z:z+Math.sin(a)*t,a};};
 // Nearest point on the centerline (a hash of samples, then the segments either side).
 const cell=6,grid=new Map(),key=(i,j)=>i*100003+j;for(let i=0;i<n;i++){const k=key(Math.floor(X[i]/cell),Math.floor(Z[i]/cell));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);}
 function project(x,z){const ci=Math.floor(x/cell),cj=Math.floor(z/cell);let bi=-1,bd=1e18;for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++)for(const k of grid.get(key(i,j))||[]){const d=(X[k]-x)**2+(Z[k]-z)**2;if(d<bd){bd=d;bi=k;}}
  if(bi<0)return null;let best=null;for(const k of [bi-1,bi]){if(k<0||k>=n-1)continue;const ax=X[k],az=Z[k],dx=X[k+1]-ax,dz=Z[k+1]-az,l=dx*dx+dz*dz||1,f=clamp(((x-ax)*dx+(z-az)*dz)/l,0,1),px=ax+dx*f,pz=az+dz*f,a=A[k]+(A[k+1]-A[k])*f,d=Math.hypot(x-px,z-pz);
   if(!best||d<best.d)best={s:(k+f)*step,d,a,t:(x-px)*Math.cos(a)+(z-pz)*Math.sin(a)};}
  // Before the mouth (the apron, out in the open), s goes negative along the portal's axis.
  if(best&&best.s<.01){const a0=A[0],along=(x-X[0])*Math.sin(a0)-(z-Z[0])*Math.cos(a0);if(along<0)best={s:along,d:Math.abs((x-X[0])*Math.cos(a0)+(z-Z[0])*Math.sin(a0)),a:a0,t:(x-X[0])*Math.cos(a0)+(z-Z[0])*Math.sin(a0)};}
  return best;}
 // Inside the box (in plan): within its walls, between the portal face and the bar screen.
 const inside=(x,z,m=0)=>{const q=project(x,z);if(!q||q.s<-m||q.s>D.len+m)return false;return Math.abs(q.t)<sizeAt(q.s).w/2+m;};
 // Standing water over the floor here (m), 0 where it only trickles down the channel.
 const wetAt=s=>{const k=kindAt(s),W=D.wet||{};if(s>D.step.s-.3&&s<D.step.s+D.step.len+.3)return .03;return W[k]||0;};
 // A dry ledge along one wall at (s,t): its height (ramped at its ends), or 0.
 const ledgeAt=(s,t)=>{const {w}=sizeAt(s);for(const L of D.ledges||[])if(s>L.s0&&s<L.s1&&t*L.side>w/2-L.w)return L.h*smooth((s-L.s0)/.3)*(1-smooth((s-L.s1+.3)/.3));return 0;};
 // The floor across the box at (s,t): the low-flow channel down the middle (the floor drains toward it) where it
 // is dry; under the standing water a rough, silted floor; the ledges. (ledge:false: the floor under a ledge.)
 function floorAt(s,t,{ledge=true}={}){const y=floor(s),{w}=sizeAt(s),a=Math.abs(t),k=kindAt(s),wet=wetAt(s);let d=0;
  if(!wet)d=-.12*(1-smooth((a-.18)/.27))+.02*smooth((a-.45)/(w/2-.45));
  else d=-wet*.6+.012*Math.sin(s*1.7+t*2.1)+.02*smooth((a-w/2+.6)/.5);
  if(ledge){const lh=ledgeAt(s,t);if(lh>0)d=Math.max(d,lh);}
  return y+d;}
 // The water's surface at s (where there is standing water), else null.
 const waterAt=s=>{const wet=wetAt(s);return wet?floor(s)+wet*.4:null;};
 // Distance along a ray (from a point inside) to the box's walls, floor or ceiling: for the flashlights.
 function rayDist(o,dir,max=40){if(!inside(o.x,o.z,.1))return max;const len=Math.hypot(dir.x,dir.y,dir.z)||1,dx=dir.x/len,dy=dir.y/len,dz=dir.z/len;let d=0,ds=.2;
  for(;d<max;d+=ds){const x=o.x+dx*d,y=o.y+dy*d,z=o.z+dz*d,q=project(x,z);if(!q||q.s<-1||q.s>D.len+.1)return d;const {w,h}=sizeAt(q.s),f=floor(q.s);if(Math.abs(q.t)>w/2||y<f||y>f+h)return d;if(d>4)ds=.35;}
  return max;}
 // Can p see q (both inside)? Steps along the line, testing the walls.
 function sees(p,q,margin=.05){const L=Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z),N=Math.max(2,Math.ceil(L/.3));for(let i=1;i<N;i++){const f=i/N,x=p.x+(q.x-p.x)*f,y=p.y+(q.y-p.y)*f,z=p.z+(q.z-p.z)*f,r=project(x,z);if(!r)return false;
  const {w,h}=sizeAt(r.s),fl=floor(r.s);if(Math.abs(r.t)>w/2-margin||y<fl||y>fl+h)return false;}return true;}
 return {P,step,n,X,Z,A,len:D.len,sizeAt,kindAt,floor,floorAt,waterAt,wetAt,ledgeAt,at,project,inside,rayDist,sees,headingAt,D,zone:'tunnel'};
}

export function buildDrain(W){
 const T=W.drain,{K}=W,rand=seeded(9021),{at,sizeAt,kindAt,floor,floorAt}=T,zone='tunnel';
 const root=new THREE.Group();W.layers.push({mode:'rigid',group:root,zone});
 const bake=m=>{m.userData.zone=zone;m.userData.noShadow=true;W.baked.push(m);return m;};
 const placeAt=(s,t,y,turn=0)=>{const p=at(s,t),g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=-p.a+turn;root.add(g);return g;};// local -z upstream (deeper), +x to the right
 // (its own materials, kept out of the merge's shared ones: no fog in here, so from outside its depths stay black)
 const mat=(c,o={},kind='culvert')=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.9,fog:false,...o});m.userData.noShadow=true;m.userData.keep=true;return kind?W.surfaceMaterial(m,kind):m;};
 const wall=mat(0x6b6a61,{roughness:.88}),floorM=mat(0x55554d,{roughness:.62}),oldWall=mat(0x6c6458,{roughness:.96}),oldFloor=mat(0x4d4a42,{roughness:.55});
 const seam=mat(0x2c2c29,{roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},null),stain=mat(0x47463f,{roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},null);
 const silt=mat(0x5b4d3a,{roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},'earth'),white=mat(0x8f8c80,{roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},null);
 const water=mat(0x1b2629,{roughness:.08,metalness:.45,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4},'water');
 const rust=K.mat(0x6e4430,{roughness:.85,metalness:.3}),steel=K.mat(0x5d5c56,{roughness:.6,metalness:.5}),dark=new THREE.MeshBasicMaterial({color:0x030304});dark.userData.keep=true;dark.userData.noShadow=true;
 const meshOf=(pos,idx,m,name='',inward=null)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  if(inward){const nn=g.attributes.normal,p=g.attributes.position;let ok=0;for(let k=0;k<nn.count;k+=7){const c=inward(p.getX(k),p.getY(k),p.getZ(k));ok+=nn.getX(k)*c.x+nn.getY(k)*c.y+nn.getZ(k)*c.z;}
   if(ok<0){for(let k=0;k<idx.length;k+=3){const q=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=q;}g.setIndex(idx);g.computeVertexNormals();}}
  const o=new THREE.Mesh(g,m);if(name)o.name=name;return bake(o);};
 const toward=(x,y,z)=>{const q=T.project(x,z);if(!q)return {x:0,y:1,z:0};const c=at(q.s,0),fl=floor(q.s),{h}=sizeAt(q.s);return {x:c.x-x,y:fl+h/2-y,z:c.z-z};};
 // ---- the shell: floor, walls, ceiling, swept along the centerline ------------------------------------------
 // Holes: the side culvert at the junction (left wall), the side pipe (right wall), the manhole shaft (ceiling).
 const SJ=D.junction.side,SP=D.sidePipe,LD=D.ladder;
 const rows=[];for(let s=0;s<=D.len+1e-6;s+=.5)rows.push(Math.min(s,D.len));for(const s of [SJ.s-SJ.w/2,SJ.s+SJ.w/2,SP.s-.55,SP.s+.55,LD.s-.45,LD.s+.45,...D.sections.map(q=>q[0]),D.step.s,D.step.s+D.step.len])if(!rows.includes(s))rows.push(s);rows.sort((a,b)=>a-b);
 // Floor columns (t), and the wall-ceiling profile [t, y above the floor's base], left wall up, across, right wall down.
 // (the walls go a little below the floor's base: under standing water the floor is lower)
 const floorCols=w=>[-w/2,-w/2+.35,-.62,-.45,-.3,-.16,0,.16,.3,.45,.62,w/2-.35,w/2];
 const shell=(w,h)=>{const a=Math.min(SJ.sill,h-.6),b=Math.min(SJ.sill+SJ.h,h-.4);return [[-w/2,-.15],[-w/2,a],[-w/2,b],[-w/2,h-.24],[-w/2+.24,h],[-.2,h],[w/2-1.15,h],[w/2-.24,h],[w/2,h-.24],[w/2,Math.min(1.3,h-.5)],[w/2,.2],[w/2,-.15]];};
 const holes=(s0,s1,seg)=>{const m=(s0+s1)/2;if(seg===1&&m>SJ.s-SJ.w/2&&m<SJ.s+SJ.w/2)return true;if(seg===9&&m>SP.s-.55&&m<SP.s+.55)return true;if(seg===6&&m>LD.s-.45&&m<LD.s+.45)return true;return false;};
 // Three ages of concrete: the newer precast (mouth, first bend, the far stretch), the old cast-in-place, the oldest box.
 const deepWall=mat(0x5a554c,{roughness:.97}),deepFloor=mat(0x413e37,{roughness:.5});
 const age=s=>{const k=kindAt(s);return k==='old'?'old':k==='deep'?'deep':'new';},WALL={new:wall,old:oldWall,deep:deepWall},FLOOR={new:floorM,old:oldFloor,deep:deepFloor};
 const groups={};const G=k=>groups[k]||(groups[k]={fp:[],fi:[],wp:[],wi:[]});
 for(let r=0;r<rows.length-1;r++){const s0=rows[r],s1=rows[r+1],kind=age((s0+s1)/2),g=G(kind);
  // floor (under the ledges too: they are drawn on top of it)
  {const base=g.fp.length/3;for(const s of [s0,s1]){const {w}=sizeAt(s);for(const t of floorCols(w)){const p=at(s,t);g.fp.push(p.x,floorAt(s,t,{ledge:false}),p.z);}}const nc=floorCols(1).length;
   for(let j=0;j<nc-1;j++){const a=base+j,b=base+nc+j;g.fi.push(a,b,a+1,a+1,b,b+1);}}
  // walls and ceiling
  {const base=g.wp.length/3;const prof0=shell(sizeAt(s0).w,sizeAt(s0).h),prof1=shell(sizeAt(s1).w,sizeAt(s1).h),np=prof0.length;
   for(const [s,prof] of [[s0,prof0],[s1,prof1]]){const f=floor(s);for(const [t,y] of prof){const p=at(s,t);g.wp.push(p.x,f+y,p.z);}}
   for(let j=0;j<np-1;j++){if(holes(s0,s1,j))continue;const a=base+j,b=base+np+j;g.wi.push(a,b,a+1,a+1,b,b+1);}}}
 for(const [k,g] of Object.entries(groups)){meshOf(g.fp,g.fi,FLOOR[k],'drain-floor-'+k,()=>({x:0,y:1,z:0}));meshOf(g.wp,g.wi,WALL[k],'drain-shell-'+k,toward);}
 // The back of the bar screen: a dark wall a few meters beyond it (the trunk goes on, out of the light).
 {const s=D.len,{w,h}=sizeAt(s),g=placeAt(s,0,floor(s));K.box(g,0,h/2,-3.2,w+.4,h+.4,.1,0x050506).material=dark;
  for(const e of [-1,1])K.box(g,e*(w/2+.05),h/2,-1.6,.1,h,3.2,wall);K.box(g,0,h+.05,-1.6,w,.1,3.2,wall);K.box(g,0,-.05,-1.6,w,.1,3.2,floorM);
  // The screen: vertical bars, rusted, a mat of sticks and leaves caught at the bottom.
  for(let x=-w/2+.12;x<w/2-.05;x+=.16)K.rod(g,[x,-.02,-.05],[x,h,-.05],.016,rust,.016,5);for(const y of [.6,1.6,2.6])K.rod(g,[-w/2,y,-.08],[w/2,y,-.08],.022,rust,.022,5);
  for(let k=0;k<30;k++){const x=(rand()-.5)*(w-.4),a=rand()*3;K.rod(g,[x-Math.cos(a)*.4,.08+rand()*.3,-.02-rand()*.2],[x+Math.cos(a)*.4,.06+rand()*.35,-.02-rand()*.2],.02,0x3e3226,.012,4);}
  T.screen={s,x:at(s,0).x,z:at(s,0).z};}
 // ---- joints, water, silt ---------------------------------------------------------------------------------
 // Precast sections: a dark joint every 2.44 m (8 ft) round the whole box; the old stretch has none.
 {const pos=[],idx=[];const ring=s=>{const {w,h}=sizeAt(s),f=floor(s),prof=shell(w,h);for(let j=0;j<prof.length-1;j++){const [t0,y0]=prof[j],[t1,y1]=prof[j+1],base=pos.length/3;
   for(const [t,y] of [[t0,y0],[t1,y1]])for(const ds of [-.018,.018]){const p=at(s+ds,t*.996);pos.push(p.x,f+y+(y>h-.3?-.004:0),p.z);}idx.push(base,base+1,base+2,base+1,base+3,base+2);}
   const cols=floorCols(w);for(let j=0;j<cols.length-1;j++){const base=pos.length/3;for(const t of [cols[j],cols[j+1]])for(const ds of [-.02,.02]){const p=at(s+ds,t);pos.push(p.x,floorAt(s+ds,t,{ledge:false})+.004,p.z);}idx.push(base,base+1,base+2,base+1,base+3,base+2);}};
  for(let s=2.44;s<D.len-1;s+=2.44){const k=kindAt(s);if(k==='old'||k==='junction')continue;ring(s);}
  meshOf(pos,idx,seam,'drain-joints');}
 // Water: a trickle down the low-flow channel where the floor is dry; standing water wall to wall (or up to a
 // ledge's face) in the old stretch, the deep box and the chamber; sheeting down the step.
 {const pos=[],idx=[];let prev=null,prevWide=null;for(let s=0;s<=D.len+1e-6;s+=.5){const k=kindAt(s),wy=T.waterAt(s),{w}=sizeAt(s);
   let t0,t1,y;if(wy!==null){t0=-w/2+.01;t1=w/2-.01;for(const L of D.ledges||[])if(s>L.s0-.2&&s<L.s1+.2){if(L.side>0)t1=Math.min(t1,w/2-L.w+.01);else t0=Math.max(t0,-w/2+L.w-.01);}y=wy;}
   else{const hw=.2+.04*Math.sin(s*.9);t0=-hw;t1=hw;y=floor(s)-.075;}void k;
   const wide=wy!==null,base=pos.length/3;for(const t of [t0,(t0+t1)/2,t1]){const p=at(s,t);pos.push(p.x,y,p.z);}
   if(prev!==null&&prevWide===wide)idx.push(prev,base,prev+1,prev+1,base,base+1,prev+1,base+1,prev+2,prev+2,base+1,base+2);prev=base;prevWide=wide;}
  meshOf(pos,idx,water,'drain-water',()=>({x:0,y:1,z:0}));}
 // Silt banked against the foot of each wall, leaves and sticks in it; thicker where the water slows.
 {const pos=[],idx=[];for(const e of [-1,1]){let prev=null;for(let s=1;s<=D.len-1;s+=1){const {w}=sizeAt(s),th=.18+.22*Math.abs(Math.sin(s*.13+e))+(kindAt(s)==='bend'?.25:0),base=pos.length/3;
   for(const t of [e*(w/2-.02),e*(w/2-.02-th)]){const p=at(s,t);pos.push(p.x,floorAt(s,t)+(Math.abs(t)>w/2-.1?.035:.006),p.z);}if(prev!==null)idx.push(prev,base,prev+1,prev+1,base,base+1);prev=base;}}
  meshOf(pos,idx,silt,'drain-silt',()=>({x:0,y:1,z:0}));}
 // Stains: streaks down the walls from the joints and the ceiling, darker low where the water stands; and past the
 // first bend the old flood lines: a dark band where high water stood for days, a fainter one above it.
 {const pos=[],idx=[];const quad=(s,t,y0,y1,wd)=>{const e=Math.sign(t),{w}=sizeAt(s),base=pos.length/3,f=floor(s);for(const y of [y0,y1])for(const ds of [-wd/2,wd/2]){const p=at(s+ds,e*(w/2-.006));pos.push(p.x,f+y,p.z);}idx.push(base,base+1,base+2,base+1,base+3,base+2);};
  for(let k=0;k<520;k++){const s=1+rand()*(D.len-2),e=rand()<.5?-1:1,{h}=sizeAt(s),top=h-.3-rand()*.4,len=.4+rand()*(h-.6);quad(s,e,top-len,top,.04+rand()*.12+(s>94?.06:0));}
  for(let s=0;s<D.len-1;s+=1.6)for(const e of [-1,1]){const k=kindAt(s);quad(s,e,-.1,k==='old'||k==='deep'?.38+.08*Math.sin(s):.16+.05*Math.sin(s*.7),1.65);}
  for(let s=80;s<D.len-1;s+=1.2)for(const e of [-1,1]){const {h}=sizeAt(s),fl=Math.min(h-.5,1.32+.05*Math.sin(s*.31+e)),f2=Math.min(h-.3,fl+.42+.04*Math.sin(s*.17));if(rand()<.88)quad(s,e,fl-.04-.03*rand(),fl+.03,1.25);if(rand()<.55)quad(s,e,f2-.02,f2+.015,1.2);}
  const sm=meshOf(pos,idx,stain,'drain-stains',toward);void sm;}
 // ---- the mouth: graffiti a few meters in, the old water mark ------------------------------------------
 const decal=(s,e,y,w,h,tex,name='',m=null)=>{const {w:bw}=sizeAt(s),p=at(s,e*(bw/2-.012)),g=new THREE.Group();g.position.set(p.x,floor(s)+y,p.z);g.rotation.y=-p.a+(e>0?-Math.PI/2:Math.PI/2);root.add(g);
  const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m||new THREE.MeshStandardMaterial({color:tex?0xffffff:0x8a8a80,map:tex,transparent:!!tex,depthWrite:false,roughness:.9,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  if(q.material)q.material.userData.noShadow=true;if(name)q.name=name;g.add(q);return q;};
 for(const [s,e,y,w,h,lines,col] of [[4.2,-1,1.35,1.3,.6,['JT + MR'],'#c9c2b0'],[7.6,1,1.5,1.5,.5,['CLASS OF 09'],'#a3463a'],[11,-1,.9,.9,.5,['DUSTY'],'#4c6a8e'],[15.5,1,1.15,.8,.6,['☺'],'#c9c2b0'],[19.5,-1,1.7,1.2,.5,['NO FISHING'],'#2b2b2b']]){
  decal(s,e,y,w,h,paintTexture(lines,col),'drain-graffiti');}
 decal(122.5,-1,1.55,.7,.32,paintTexture(['D.B. 1987'],'#8f8a7a'),'drain-old-tag');
 // Station marks stenciled every hundred feet, for the crews: STA 1+00 and so on. (lower where the ceiling is)
 for(let ft=100;ft*.3048<D.len-3;ft+=100){const s=ft*.3048,e=1;decal(s,e,Math.min(1.95,sizeAt(s).h-.5),.62,.24,stencilTexture(`STA ${Math.floor(ft/100)}+00`),'drain-station');}
 // The city's own marks: past the first bend a warning nobody reads; the year cast at the oldest box's mouth; pipe numbers.
 decal(76,1,1.85,1.1,.42,stencilTexture('CONFINED SPACE'),'drain-warning');decal(76,1,1.5,.9,.3,stencilTexture('NO ENTRY'),'drain-warning');
 decal(151.2,-1,1.55,.52,.24,stencilTexture('1961'),'drain-year');
 for(const [s,e,y,txt] of [[108,-1,1.15,'SD 7'],[129.5,-1,1.0,'SD 8'],[194,-1,1.3,'SD 11'],[239,1,1.2,'SD 14']])decal(s,e,y,.4,.18,stencilTexture(txt),'drain-pipe-number');
 // ---- the ledges along the right wall (the walkway by the mouth, the narrow lip in the deep box): top, face, ends --------------
 for(const L of D.ledges||[]){const e=L.side,pos=[],idx=[];for(let s=L.s0;s<=L.s1+1e-6;s+=Math.min(1,L.s1-s||1)){const {w}=sizeAt(s),f=floor(s),base=pos.length/3;for(const [t,y] of [[w/2-L.w,-.12],[w/2-L.w,L.h],[w/2,L.h]]){const p=at(s,e*t);pos.push(p.x,f+y+.002,p.z);}if(s>L.s0)idx.push(base-3,base,base-2,base-2,base,base+1,base-2,base+1,base-1,base-1,base+1,base+2);if(s>=L.s1)break;}
  for(const s of [L.s0,L.s1]){const {w}=sizeAt(s),f=floor(s),base=pos.length/3;for(const [t,y] of [[w/2-L.w,-.12],[w/2,-.12],[w/2,L.h],[w/2-L.w,L.h]]){const p=at(s,e*t);pos.push(p.x,f+y,p.z);}idx.push(base,base+1,base+2,base,base+2,base+3);}
  meshOf(pos,idx,L.s0>100?deepFloor:floorM,'drain-ledge',toward);}
 // ...where the lip in the deep box broke off, the pieces still lie in the water.
 {const L0=D.ledges.find(l=>l.s0>100),L1=D.ledges.filter(l=>l.s0>100)[1];if(L0&&L1)for(let k=0;k<9;k++){const s=L0.s1-.2+rand()*(L1.s0-L0.s1+.4),{w}=sizeAt(s),t=w/2-.15-rand()*.7,g=placeAt(s,t,floorAt(s,t,{ledge:false})+.05,rand()*6);
   K.box(g,0,0,0,.18+rand()*.3,.1+rand()*.12,.15+rand()*.25,deepFloor).rotation.set(rand()*.5,0,rand()*.5);}}
 const conduit=(s0,s1,e,y,r=.05)=>{for(let s=s0;s<s1;s+=2.5){const {w}=sizeAt(s),a=at(s,e*(w/2-.09)),b=at(Math.min(s+2.5,s1),e*(sizeAt(Math.min(s+2.5,s1)).w/2-.09));const g=new THREE.Group();root.add(g);K.rod(g,[a.x,floor(s)+y,a.z],[b.x,floor(Math.min(s+2.5,s1))+y,b.z],r,0x55534c,r,7);
  const br=at(s,e*(w/2-.04));K.box(g,br.x,floor(s)+y,br.z,.12,.04,.12,rust);}};
 conduit(6,94,1,2.75);conduit(152,212,1,1.98,.06);conduit(153,211,1,1.84,.035);
 // ---- the deep box: old maintenance brackets, two pipes across the ceiling, a ladder up to a sealed hatch, ------------------
 // spalled concrete with the rebar showing (walls and ceiling), broken concrete heaped against the left wall
 for(let s=153;s<212;s+=3.6){const {w}=sizeAt(s),g=placeAt(s,1*(w/2-.03),floor(s)+1.5,-Math.PI/2);K.box(g,0,0,0,.05,.05,.32,rust);K.box(g,0,-.14,.12,.05,.3,.05,rust);K.box(g,0,.22,0,.06,.16,.08,rust);}
 for(const ps of D.pipes||[]){const {w,h}=sizeAt(ps),a=at(ps,-w/2),b=at(ps,w/2),f=floor(ps),g=new THREE.Group();root.add(g);K.rod(g,[a.x,f+h-.36,a.z],[b.x,f+h-.36,b.z],.085,0x4c4a44,.085,10);
  for(const e of [-1,1]){const q=at(ps,e*(w/2-.05));K.box(g,q.x,f+h-.36,q.z,.14,.22,.14,rust);}K.rod(g,[at(ps,.3).x,f+h-.27,at(ps,.3).z],[at(ps,.3).x,f+h,at(ps,.3).z],.012,rust,.012,4);}
 {const H=D.hatch,{w,h}=sizeAt(H.s),f=floor(H.s),e=H.side,tc=e*(w/2-.55),g=placeAt(H.s,0,f);const lip=deepWall;
  K.box(g,tc,h-.012,0,.86,.025,.86,lip);const hole=K.box(g,tc,h-.026,0,.7,.006,.7,0x020203);hole.material=dark;// (the hatch: black, a square of nothing over the ladder)
  for(let y=.42;y<h-.12;y+=.3)K.rod(g,[e*(w/2-.04),y,-.2],[e*(w/2-.04),y,.2],.014,rust,.014,5);for(const z of [-.22,.22])K.rod(g,[e*(w/2-.07),.35,z],[e*(w/2-.07),h-.05,z],.012,rust,.012,5);
  T.hatch={s:H.s,x:at(H.s,tc).x,z:at(H.s,tc).z,y:f+h};}
 const spall=(s,e,y,pw,ph,ceiling=false)=>{const {w,h}=sizeAt(s),g=ceiling?placeAt(s,e,floor(s)+h-.008):placeAt(s,e*(w/2-.02),floor(s)+y,e>0?-Math.PI/2:Math.PI/2);
  if(ceiling){K.box(g,0,0,0,pw,.016,ph,0x4a4339);for(let j=0;j<4;j++)K.rod(g,[-pw/2+.05,-.012,-ph/2+.08+j*ph/4],[pw/2-.05,-.014,-ph/2+.09+j*ph/4],.008,rust,.008,4);for(let j=0;j<3;j++)K.rod(g,[-pw/2+.1+j*pw/3,-.02,-ph/2+.04],[-pw/2+.1+j*pw/3,-.02,ph/2-.04],.007,rust,.007,4);return;}
  K.box(g,0,0,0,pw,ph,.03,0x4a4339);for(let j=0;j<3;j++)K.rod(g,[-pw/2+.05,-ph/2+.1+j*ph/3,.025],[pw/2-.05,-ph/2+.12+j*ph/3,.025],.008,rust,.008,4);for(let j=0;j<2;j++)K.rod(g,[-pw/2+.15+j*pw/2,-ph/2+.05,.03],[-pw/2+.15+j*pw/2,ph/2-.05,.03],.007,rust,.007,4);};
 for(let k=0;k<14;k++){const s=153+rand()*58,e=rand()<.5?-1:1,{h}=sizeAt(s);spall(s,e,.6+rand()*(h-1.1),.35+rand()*.5,.25+rand()*.4);}
 for(let k=0;k<7;k++){const s=154+rand()*56;spall(s,(rand()-.5)*1.4,0,.4+rand()*.5,.3+rand()*.5,true);}
 for(let k=0;k<16;k++){const s=169+rand()*5,{w}=sizeAt(s),t=-(w/2-.2-rand()*.55),g=placeAt(s,t,floorAt(s,t)+.06,rand()*6);K.box(g,0,0,0,.2+rand()*.35,.12+rand()*.2,.18+rand()*.3,k%3?deepFloor:oldWall).rotation.set(rand()*.6,0,rand()*.6);}
 // ---- the openings: pipes and side drains in the walls, black (a lip of concrete round each) -------------------------
 T.openings=[];for(const O of D.openings||[]){const {w}=sizeAt(O.s),e=O.side,f=floor(O.s),g=placeAt(O.s,e*(w/2-.004),f,e>0?-Math.PI/2:Math.PI/2);// local +z out of the wall (into the box)
  if(O.shape==='round'){const d=new THREE.Mesh(new THREE.CircleGeometry(O.r,20),dark);d.position.set(0,O.y,.002);g.add(d);const lip=new THREE.Mesh(new THREE.RingGeometry(O.r,O.r+.07,20),O.s>150?deepWall:oldWall);lip.position.set(0,O.y,.012);g.add(lip);}
  else{const d=new THREE.Mesh(new THREE.PlaneGeometry(O.w,O.h),dark);d.position.set(0,O.y+O.h/2,.002);g.add(d);const lm=O.s>150&&O.s<226?deepWall:O.s>226?wall:oldWall;
   K.box(g,0,O.y+O.h+.05,.03,O.w+.2,.1,.06,lm);for(const sx of [-1,1])K.box(g,sx*(O.w/2+.05),O.y+O.h/2,.03,.1,O.h,.06,lm);}
  const c=at(O.s,e*(w/2+.35));T.openings.push({...O,x:c.x,z:c.z,y:f+O.y+(O.shape==='round'?0:O.h/2),mouth:{x:at(O.s,e*(w/2-.1)).x,z:at(O.s,e*(w/2-.1)).z}});}
 // ---- bend one: storm debris thrown up against the outside wall ---------------------------------------------
 const debris=(s0,s1,e,n)=>{for(let k=0;k<n;k++){const s=s0+rand()*(s1-s0),{w}=sizeAt(s),t=e*(w/2-.15-rand()*.9),g=placeAt(s,t,floorAt(s,t),rand()*6),l=.6+rand()*1.6,a=rand()*3;
  K.rod(g,[-Math.cos(a)*l/2,.04+rand()*.1,-Math.sin(a)*l/2],[Math.cos(a)*l/2,.04+rand()*.25,Math.sin(a)*l/2],.015+rand()*.03,rand()<.5?0x3f3428:0x544636,.01,5);}};
 debris(74,92,-1,46);debris(214,226,1,24);debris(D.len-8,D.len,0,14);
 {const g=placeAt(90.5,-1.35,floorAt(90.5,-1.35)+.12,.4);const tire=new THREE.Mesh(new THREE.TorusGeometry(.3,.11,8,16),K.mat(0x1d1d1c,{roughness:.9}));tire.rotation.x=Math.PI/2-.25;g.add(tire);}
 for(const [s,t] of [[31,-1.6],[58,.9],[88,-1.7],[166,-1.2],[238,-1.3]]){const g=placeAt(s,t,floorAt(s,t)+.04,rand()*6);K.cyl(g,0,0,0,.035,.2,K.mat(rand()<.5?0x6f8a6a:0xb7b2a2,{roughness:.4}),8,[Math.PI/2,0,0]);}
 // ---- section D: the old cast-in-place stretch --------------------------------------------------------------
 // Cracks across the walls and ceiling, spalled patches with rusted rebar, white lime bleeding out of joints,
 // grey repair patches, roots hanging through the joints.
 {const pos=[],idx=[];const crackOn=(s,e,y,len)=>{let ss=s,yy=y;const pts=[];for(let k=0;k<8;k++){pts.push([ss,yy]);ss+=(rand()-.5)*.25;yy-=len/8;}
   for(let k=0;k<pts.length-1;k++){const [sa,ya]=pts[k],[sb,yb]=pts[k+1],base=pos.length/3,{w}=sizeAt(sa);for(const [s2,y2] of [[sa,ya],[sb,yb]])for(const d of [-.012,.012]){const p=at(s2+d,e*(w/2-.008));pos.push(p.x,floor(s2)+y2,p.z);}idx.push(base,base+1,base+2,base+1,base+3,base+2);}};
  for(let k=0;k<70;k++){const s=95+rand()*117,e=rand()<.5?-1:1,{h}=sizeAt(s);crackOn(s,e,h-.1-rand()*.6,.5+rand()*Math.min(1.6,h-.8));}
  meshOf(pos,idx,seam,'drain-cracks',toward);}
 for(let k=0;k<9;k++){const s=97+rand()*48,e=rand()<.5?-1:1,{w,h}=sizeAt(s),y=.8+rand()*(h-1.4),pw=.4+rand()*.6,ph=.3+rand()*.5;
  const g=placeAt(s,e*(w/2-.02),floor(s)+y,e>0?-Math.PI/2:Math.PI/2);K.box(g,0,0,0,pw,ph,.03,k%3?0x7d7b70:0x5a5348);
  if(k%3===0)for(let j=0;j<3;j++)K.rod(g,[-pw/2+.05,-ph/2+.1+j*ph/3,.02],[pw/2-.05,-ph/2+.12+j*ph/3,.02],.008,rust,.008,4);}
 {const pos=[],idx=[];for(let k=0;k<40;k++){const s=95+rand()*117,e=rand()<.5?-1:1,{w,h}=sizeAt(s),top=h-.05-rand()*.3,len=.3+rand()*1.4,base=pos.length/3;for(const y of [top-len,top])for(const d of [-.06,.06]){const p=at(s+d,e*(w/2-.007));pos.push(p.x,floor(s)+y,p.z);}idx.push(base,base+1,base+2,base+1,base+3,base+2);}
  meshOf(pos,idx,white,'drain-lime',toward);}
 {const bark=K.mat(0x3a3027,{roughness:1});for(let k=0;k<46;k++){const s=k<34?99+rand()*48:152+rand()*58,{w,h}=sizeAt(s),t=(rand()-.5)*(w-.6),f=floor(s)+h,g=new THREE.Group();root.add(g);const p=at(s,t);let prev=[p.x,f+.02,p.z],len=.3+rand()*1.3;
  for(let j=0;j<5;j++){const nx=prev[0]+(rand()-.5)*.12,nz=prev[2]+(rand()-.5)*.12,ny=prev[1]-len/5;K.rod(g,prev,[nx,ny,nz],.012-j*.002,bark,.01-j*.0018,4);prev=[nx,ny,nz];}}}
 // The manhole shaft: up through the ceiling near the right wall, a ladder of rusted rungs from the floor
 // to the lid four meters up (a lid with two small pick holes, dark: it is night, and the road is far).
 {const s=LD.s,{w,h}=sizeAt(s),f=floor(s),tc=w/2-.7,g=placeAt(s,0,f);const S=.9,top=h+4.2;
  for(const [x,z,ww,dd] of [[tc-S/2,0,.06,S],[tc+S/2,0,.06,S],[tc,-S/2,S,.06],[tc,S/2,S,.06]])K.box(g,x,(h+top)/2,z,ww,top-h,dd,oldWall);
  K.box(g,tc,top+.03,0,S,.06,S,0x141412).name='drain-manhole-lid';
  for(let y=.45;y<top-.2;y+=.3)K.rod(g,[w/2-.03,y,-.22],[w/2-.03,y,.22],.014,rust,.014,5);for(const z of [-.24,.24])K.rod(g,[w/2-.06,.4,z],[w/2-.06,top-.2,z],.012,rust,.012,5);
  // (rungs below the shaft run down the right wall; above the ceiling they are inside the shaft)
  T.ladder={s,x:at(s,tc).x,z:at(s,tc).z,y:f};}
 // The side pipe: a 42-inch round pipe coming in through the right wall a little above the floor, a thin
 // trickle from its lip and a stain under it.
 {const s=SP.s,{w}=sizeAt(s),f=floor(s),g=placeAt(s,SP.side*w/2,f,SP.side>0?-Math.PI/2:Math.PI/2);// local -z into the wall (away from the box)
  const shape=new THREE.Shape([new THREE.Vector2(-.56,.2),new THREE.Vector2(.56,.2),new THREE.Vector2(.56,1.31),new THREE.Vector2(-.56,1.31)]);const hole=new THREE.Path();hole.absarc(0,.75,SP.r,0,Math.PI*2,true);shape.holes.push(hole);
  const plate=new THREE.Mesh(new THREE.ShapeGeometry(shape,20),oldWall);plate.position.z=.004;g.add(plate);
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(SP.r,SP.r,3.2,20,1,true),mat(0x58554c,{side:THREE.BackSide,roughness:.9}));pipe.rotation.x=Math.PI/2;pipe.position.set(0,.75,-1.6);g.add(pipe);
  const end=new THREE.Mesh(new THREE.CircleGeometry(SP.r,16),dark);end.position.set(0,.75,-3.15);g.add(end);
  K.box(g,0,.18,.03,.18,.36,.01,0x3c4a44);T.sidePipe={s,x:at(s,SP.side*(w/2-.2)).x,z:at(s,SP.side*(w/2-.2)).z,y:f+.75};}
 // The spillway step: a ramped concrete lip, the water sheeting down it; sticks caught along the top.
 {const s=D.step.s;debris(s-.3,s+.4,0,10);}
 // ---- the junction chamber: the culvert from Briarwood comes in high on the left wall --------------------------
 {const s=SJ.s,{w}=sizeAt(s),f=floor(s),g=placeAt(s,-w/2,f,Math.PI/2);// local -z away from the box, into the side culvert
  const CW=SJ.w,CH=SJ.h,L=5;K.box(g,0,SJ.sill-.06,-L/2,CW,.12,L,floorM);for(const e of [-1,1])K.box(g,e*(CW/2+.06),SJ.sill+CH/2,-L/2,.12,CH,L,wall);K.box(g,0,SJ.sill+CH+.06,-L/2,CW+.24,.12,L,wall);
  const back=K.box(g,0,SJ.sill+CH/2,-L,CW,CH,.08,0x040404);back.material=dark;
  // its lip, worn smooth, a dark stain where its trickle runs down the chamber wall, and silt on its floor
  K.box(g,0,SJ.sill-.02,.02,CW+.2,.08,.08,oldWall);K.box(g,0,SJ.sill/2,.01,.4,SJ.sill,.01,0x2c3530);K.box(g,0,SJ.sill+.02,-1.2,CW-.3,.04,1.8,0x564a38);
  T.sideCulvert={s,x:at(s,-(w/2+.5)).x,z:at(s,-(w/2+.5)).z,y:f+SJ.sill+.9,mouth:{x:at(s,-w/2).x,z:at(s,-w/2).z}};}
 // ---- the cable: an old phone cable come loose from its clips, hanging in section F (it can swing) ------------
 {const s=246,{w,h}=sizeAt(s);T.cable={s,x:at(s,1).x,z:at(s,1).z,y:floor(s)+h-.05,len:1.5};}
 // ---- where the story needs things ---------------------------------------------------------------------
 const spot=(s,t=0)=>{const p=at(s,t);return {s,t,x:p.x,z:p.z,y:floorAt(s,t),a:p.a};};
 T.spots={mouth:spot(1),inside:spot(12),ledge:spot(40,1.6),bend1:spot(83),old:spot(100),ladder:spot(LD.s),pipe:spot(SP.s),step:spot(D.step.s-1),stepTop:spot(D.step.s+D.step.len+.6),bike:spot(D.oldBike.s,D.oldBike.side*1.6),
  long:spot(185),item:spot(D.item.s,D.item.t),relocate:spot(D.relocate.s),deep:spot(151),figure:spot(D.figure.s,D.figure.t),bend2:spot(220),far:spot(240),search:spot(255),junction:spot(SJ.s),screen:spot(D.len-1)};
 return T;
}

// Walking and ground inside the box (nav.js asks for points within it).
export function drainNav(T){const D2=T.D;
 function groundY(x,z,q=T.project(x,z)){if(!q)return T.P.floor;const s=clamp(q.s,0,D2.len),{w}=T.sizeAt(s);return T.floorAt(s,clamp(q.t,-w/2,w/2));}
 function walkable(x,z,r=.28,q=T.project(x,z)){if(!q||q.s<-.05||q.s>D2.len-.35)return false;const {w}=T.sizeAt(Math.max(0,q.s));return Math.abs(q.t)<w/2-r-.05;}
 function surface(x,z,q=T.project(x,z)){if(!q)return 'concrete';const s=clamp(q.s,0,D2.len);return T.wetAt(s)>0&&!T.ledgeAt(s,q.t)?'water':'concrete';}
 return {groundY,walkable,surface,heading:(x,z,q=T.project(x,z))=>q?q.a:0};
}

// Paint on concrete: a few rough letters (graffiti), and stencils.
function paintTexture(lines,color){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=256;c.height=112;g.clearRect(0,0,256,112);
 g.fillStyle=color;g.strokeStyle=color;g.textAlign='center';g.font='bold 54px Arial';g.globalAlpha=.78;lines.forEach((l,i)=>{g.save();g.translate(128,70+i*50);g.rotate(-.05);g.fillText(l,0,0,240);g.restore();});
 g.globalCompositeOperation='destination-out';for(let k=0;k<160;k++){g.globalAlpha=.25+Math.random()*.5;g.fillRect(Math.random()*256,Math.random()*112,2+Math.random()*9,1+Math.random()*4);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
function stencilTexture(text){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=256;c.height=96;g.clearRect(0,0,256,96);g.fillStyle='rgba(222,216,198,.82)';g.font='bold 52px Arial';g.textAlign='center';g.fillText(text,128,68,240);
 g.globalCompositeOperation='destination-out';for(let x=8;x<256;x+=37)g.fillRect(x,0,3,96);for(let k=0;k<90;k++){g.globalAlpha=.3+Math.random()*.6;g.fillRect(Math.random()*256,Math.random()*96,2+Math.random()*12,1+Math.random()*5);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
void signTexture;
