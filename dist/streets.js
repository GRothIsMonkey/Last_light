// Street surfaces: asphalt, gutters, curbs, sidewalks, lawns, the two junctions with
// their continuing side streets, the cul-de-sac and the grassy lookout. Also answers
// "what is the authored surface here?" and "may the player ride here?".
import * as THREE from './three.module.js';
import {surfaceMaterial} from './materials.js';
import {ROAD_HALF,groundPoint} from './route.js';
import {sweepGeometry,pathNormals,smooth,clamp} from './kit.js';
import {MAIN,LAWN,SIDEWALK,CURB_TOP,knoll,roadCrown} from './terrain.js';
import {JUNCTIONS,BULB,ROAD_START,SECTION} from './layout.js';
import {STREET} from './palette.js';

const CF=SECTION.curbFace;// 4.7
// Cross-section relative to the curb face, measured toward the lots.
export const XS={curb:.3,strip:1.65,walk:3.15};
// Rounded curb: battered face, rounded nose, flat top, back edge below the lawn.
const CURB=[[0,.018],[.02,.12],[.07,.155],[.27,.155],[.3,.10]];
const cutProfile=(h,k)=>.018+(h-.018)*k;
export const range=(a,b,step)=>{const r=[];const n=Math.max(1,Math.ceil((b-a)/step));for(let i=0;i<=n;i++)r.push(a+(b-a)*i/n);return r;};
const uniq=a=>[...new Set(a.map(v=>+v.toFixed(3)))].sort((x,y)=>x-y);

export function buildStreets(W){
 const {K}=W,mat=K.mat,main=W.bent(MAIN);
 const asphalt=W.asphalt=surfaceMaterial(mat(STREET.asphalt,{roughness:1}),'asphalt');
 const grass=W.grassMat=mat(STREET.grass);
 const concrete=W.concrete=surfaceMaterial(mat(STREET.concrete),'concrete'),curbC=surfaceMaterial(mat(STREET.curb),'concrete');
 const gutterC=surfaceMaterial(mat(STREET.gutter),'concrete');
 const lawnTop=mat(STREET.grass,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});W.lawnTop=lawnTop;
 W.grassMats=[grass,lawnTop];

 function grid(parent,xs,ds,y,material,skip,name=null){const p=[],idx=[],nx=xs.length;
  for(const d of ds)for(const x of xs)p.push(x,typeof y==='function'?y(d,x):y,-d);
  for(let j=0;j<ds.length-1;j++)for(let i=0;i<nx-1;i++){if(skip&&skip((xs[i]+xs[i+1])/2,(ds[j]+ds[j+1])/2,xs[i],xs[i+1],ds[j],ds[j+1]))continue;const a=j*nx+i,b=a+1,c=a+nx;idx.push(a,b,c,b,c+1,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);const m=new THREE.Mesh(g,material);if(name)m.name=name;parent.add(m);return m;}
 function sweep(parent,pts,profile,material,{side=1,closed=false,heightScale=null,name=null}={}){const m=new THREE.Mesh(sweepGeometry(pts,pathNormals(pts,closed),profile,{closed,heightScale,side}),material);if(name)m.name=name;parent.add(m);return m;}
 // Choose the sweep side so profile offsets run toward (sign=1) or away from (sign=-1) a point.
 function sideToward(pts,[tu,tv],sign=1){const n=pathNormals(pts),i=pts.length>>1;return Math.sign(((tu-pts[i][0])*n[i][0]+(tv-pts[i][1])*n[i][1])*sign)||1;}
 function fan(parent,center,ring,y,material){const p=[center[1],y(...center),-center[0]],idx=[];for(const q of ring)p.push(q[1],y(...q),-q[0]);
  for(let k=0;k<ring.length-1;k++)idx.push(0,k+1,k+2);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);
  // Face up regardless of the ring's direction.
  const a=ring[0],b=ring[1];if((a[1]-center[1])*(-(b[0]-center[0]))-(-(a[0]-center[0]))*(b[1]-center[1])>0)g.setIndex(idx.map((v,i)=>i%3===1?idx[i+1]:i%3===2?idx[i-1]:v));
  const m=new THREE.Mesh(g,material);parent.add(m);return m;}

 // Driveway curb cuts, per frame and side: [{u0,u1}]
 const cutsFor=(frameId,side)=>W.cuts.filter(c=>c.frame===frameId&&c.side===side);
 const cutK=(cuts,u)=>{let k=1;for(const c of cuts){const t=smooth((u-(c.u0-.7))/.7)*(1-smooth((u-c.u1)/.7));k=Math.min(k,1-.82*t);}return k;};
 function edgeSamples(u0,u1,cuts){const us=range(u0,u1,2);for(const c of cuts){if(c.u1<u0-1||c.u0>u1+1)continue;us.push(c.u0-.75,c.u0-.35,c.u0,c.u1,c.u1+.35,c.u1+.75);}return uniq(us.filter(u=>u>=u0&&u<=u1));}
 // Curb, gutter pan, sidewalk and joints along one side of a straight street run.
 function edgeRun(parent,side,cf,u0,u1,cuts,roadY){
  const us=edgeSamples(u0,u1,cuts),k=(i,u)=>cutK(cuts,u);
  sweep(parent,us.map(u=>[u,side*cf]),CURB.map(([o,h])=>[o,(i,uu,vv,kk)=>cutProfile(h,kk)]),curbC,{side:-side,heightScale:k});
  const walk=[[0,(i,u,v,kk)=>kk<.99?SIDEWALK:.10],[.04,SIDEWALK],[1.46,SIDEWALK],[1.5,(i,u,v,kk)=>kk<.99?SIDEWALK:.10]];
  sweep(parent,us.map(u=>[u,side*(cf+XS.strip)]),walk.map(([o,h])=>[o,typeof h==='function'?h:()=>h]),concrete,{side:-side,heightScale:k});
  grid(parent,side>0?[cf-.38,cf]:[-cf,-cf+.38],range(u0,u1,1),(d,x)=>roadY(d,x),gutterC);
  for(let u=Math.ceil(u0/1.52)*1.52;u<u1;u+=1.52){const joint=K.box(parent,side*(cf+(XS.strip+XS.walk)/2),SIDEWALK+.002,-u,XS.walk-XS.strip-.04,.003,.014,K.mat(0x726d61,{roughness:1}));joint.name='sidewalk-joint';}
 }

 // Main road ------------------------------------------------------------------------
 const culStart=1100,roadEndD=1127;
 const road=grid(main,range(-(ROAD_HALF-.38),ROAD_HALF-.38,1.105),range(ROAD_START,roadEndD,1),(d,x)=>roadCrown(d,x),asphalt,null,'main-road');road.userData.ref='road';
 // Junction mouths interrupt the main edges; corners are arcs.
 const J=JUNCTIONS.map((j,i)=>({...j,frame:W.sideFrames[i],R:j.corner,mouth:j.half+j.corner}));
 W.junctions=J;
 for(const side of [-1,1]){
  const breaks=J.filter(j=>j.side===side).map(j=>[j.d-j.mouth,j.d+j.mouth]).sort((a,b)=>a[0]-b[0]);
  let u=ROAD_START;const runs=[];for(const [a,b] of breaks){runs.push([u,a]);u=b;}runs.push([u,culStart]);
  for(const [a,b] of runs)edgeRun(main,side,CF,a,b,cutsFor('main',side),roadCrown);
  // Across the junction mouths and into the cul-de-sac the edge strip is asphalt, not gutter.
  for(const [a,b] of [...breaks,[culStart,roadEndD]])grid(main,side>0?[CF-.38,CF]:[-CF,-CF+.38],range(a,b,1),(d,x)=>roadCrown(d,x),asphalt,null,'road-edge');
 }
 // Base ground under everything in the corridor (a safety net, mostly hidden).
 const inCorridor=(d,lat,margin=0)=>J.find(j=>Math.sign(lat)===j.side&&Math.abs(d-j.d)<44+margin&&Math.abs(lat)>CF-.01);
 grid(main,range(-34,34,8),range(ROAD_START-10,culStart,8),-.06,mat(STREET.ground),(x,d)=>!!inCorridor(d,x,-4)&&Math.abs(x)>20);

 // Cul-de-sac: straight curb lines flare through reverse curves into the bulb ------------
 const B=BULB,rf=6,R0=B.r,Fd=B.d-Math.sqrt((R0+rf)**2-(CF+rf)**2),aT2=Math.atan2(-(CF+rf),B.d-Fd),bA=Math.atan2(CF+rf,Fd-B.d);
 const right=range(culStart,Fd,Math.ceil(Fd-culStart)).map(u=>[u,CF]);
 for(let k=1;k<=12;k++){const a=-Math.PI/2+(aT2+Math.PI/2)*k/12;right.push([Fd+rf*Math.cos(a),CF+rf+rf*Math.sin(a)]);}
 const bulb=[];for(let k=1;k<64;k++){const a=bA-2*bA*k/64;bulb.push([B.d+R0*Math.cos(a),R0*Math.sin(a)]);}
 // From (culStart,+CF) along the right curb, around the far end, back along the left curb.
 const outline=[...right,...bulb,...right.map(([u,v])=>[u,-v]).reverse()];W.culOutline=outline;
 const inPoly=(d,lat,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ui,vi]=poly[i],[uj,vj]=poly[j];if((vi>lat)!==(vj>lat)&&d<(uj-ui)*(lat-vi)/(vj-vi)+ui)c=!c;}return c;};
 const segDist=(d,lat)=>{let best=1e9;for(let i=0;i<outline.length-1;i++){const [a,b]=outline[i],[c,e]=outline[i+1],du=c-a,dv=e-b,t=clamp(((d-a)*du+(lat-b)*dv)/(du*du+dv*dv||1),0,1);best=Math.min(best,Math.hypot(d-a-du*t,lat-b-dv*t));}return best;};
 // Signed distance from the cul-de-sac's curb face: negative on the asphalt.
 const culDist=W.culDist=(d,lat)=>d<culStart?1e9:(inPoly(d,lat,outline)?-segDist(d,lat):segDist(d,lat));
 {const ring=outline.filter(([u])=>u>=roadEndD);const closing=range(-CF,CF,1.175).map(v=>[roadEndD,v]);
  fan(main,[B.d,0],[...ring,...closing,ring[0]],(d,lat)=>roadCrown(d,lat),asphalt).name='cul-de-sac';}
 const outward=-sideToward(outline,[B.d,0]);// profile offsets away from the bulb center
 sweep(main,outline,CURB,curbC,{side:outward});
 const culWalkY=(u,v)=>u>1150?Math.max(SIDEWALK,knoll(u,v)+.04):SIDEWALK;
 const lawnY=(u,v)=>u>1150?Math.max(LAWN,knoll(u,v)):LAWN;
 sweep(main,outline,[[XS.strip,(i,u,v)=>culWalkY(u,v)-.05],[XS.strip+.02,(i,u,v)=>culWalkY(u,v)-.008],[XS.strip+.05,(i,u,v)=>culWalkY(u,v)],[XS.walk-.05,(i,u,v)=>culWalkY(u,v)],[XS.walk-.02,(i,u,v)=>culWalkY(u,v)-.008],[XS.walk,(i,u,v)=>culWalkY(u,v)-.05]],concrete,{side:outward,name:'lookout-walk'});
 sweep(main,outline,[[XS.curb-.01,(i,u,v)=>lawnY(u,v)+.003],[XS.strip+.01,(i,u,v)=>lawnY(u,v)+.003]],lawnTop,{side:outward});
 // Grid lawns near curved curbs: drop a cell if it reaches the curb or lies wholly under the sidewalk.
 const culSkip=(xa,xb,da,db)=>{if(db<=culStart)return false;const c=[culDist(da,xa),culDist(da,xb),culDist(db,xa),culDist(db,xb)];return Math.min(...c)<XS.curb+.02||Math.max(...c)<XS.walk-.05;};

 // Lawns (main): from the curb back to just past the rear fences --------------------------
 const drivesOn=(frame,side)=>W.cuts.filter(c=>c.frame===frame&&c.side===side);
 for(const side of [-1,1]){
  const cuts=drivesOn('main',side),brk=[];for(const c of cuts)brk.push(c.u0,c.u1);for(const j of J)if(j.side===side)brk.push(j.d-44,j.d+44);
  const ds=uniq([...range(ROAD_START,1096,2),...range(1096,1150,.5),...brk.filter(b=>b>ROAD_START&&b<1150)]);
  const xs=[5.0,5.7,6.35,7.1,7.85,8.6,9.5,10.5,11.5,12.5,13.5,14.5,15.5,17,19].map(x=>x*side).sort((a,b)=>a-b);
  const outer=[19,21,23,26,29,32,34,36].map(x=>x*side).sort((a,b)=>a-b),dsOuter=uniq([...range(ROAD_START,1096,6),...range(1096,1150,.5),...J.filter(j=>j.side===side).flatMap(j=>[j.d-44,j.d+44])]);
  grid(main,outer,dsOuter,LAWN,grass,(x,d,xa,xb,da,db)=>!!inCorridor(d,x)||culSkip(xa,xb,da,db));
  grid(main,xs,ds,LAWN,grass,(x,d,xa,xb,da,db)=>{
   if(inCorridor(d,x))return true;
   for(const c of cuts){if(d>c.u0&&d<c.u1){const ax=Math.abs(x);if(ax<SECTION.walk1)return true;if(c.inside(da+.02,xa)&&c.inside(db-.02,xa)&&c.inside(da+.02,xb)&&c.inside(db-.02,xb))return true;}}
   return culSkip(xa,xb,da,db);});
 }
 // The lookout rise and the field beyond it.
 {const xs=uniq([...range(-80,-16,8),...range(-16,16,.5),...range(16,80,8)]);
  const ds=uniq([...range(1150,1157,.5),...range(1157,1182,1),...range(1182,1260,4),...range(1260,1650,15)]);
  grid(main,xs,ds,(d,x)=>knoll(d,x),grass,(x,d,xa,xb,da,db)=>culSkip(xa,xb,da,db));}

 // Junctions: curved corners, then the side streets themselves ------------------------------
 for(const j of J){const s=j.side,h=j.half,R=j.R,f=j.frame,sb=W.bent(f);
  for(const sg of [-1,1]){const C=[j.d+sg*(h+R),s*(CF+R)],arc=[];for(let k=0;k<=16;k++){const t=k/16*Math.PI/2;arc.push([C[0]-sg*R*Math.sin(t),C[1]-s*R*Math.cos(t)]);}
   const Q=[j.d+sg*h,s*CF];fan(main,Q,arc,(d,lat)=>.025,asphalt).name='corner';
   const toward=sideToward(arc,C);
   sweep(main,arc,CURB,curbC,{side:toward});
   sweep(main,arc,[[XS.curb-.01,LAWN],[XS.strip+.01,LAWN]],grass,{side:toward});
   sweep(main,arc,[[XS.strip,.10],[XS.strip+.02,.15],[XS.strip+.05,SIDEWALK],[XS.walk-.05,SIDEWALK],[XS.walk-.02,.15],[XS.walk,.10]],concrete,{side:toward});
   sweep(main,arc,[[XS.walk-.01,LAWN+.004],[R*.5,LAWN+.004],[R-.02,LAWN+.004]],lawnTop,{side:toward});
  }
  // Side street, in its own frame (u from the main curb line outward).
  const L=f.length,u0=CF+R,crown=(u,v)=>.025+.028*Math.max(0,1-(v/h)**2)*smooth((u-7)/8);
  const sroad=grid(sb,range(-(h-.38),h-.38,.95),range(CF,L,1),(u,v)=>crown(u,v),asphalt);sroad.name='side-road';
  for(const ss of [-1,1])grid(sb,ss>0?[h-.38,h]:[-h,-h+.38],range(CF,u0,1),(u,v)=>crown(u,v),asphalt,null,'side-road-edge');
  for(const ss of [-1,1])edgeRun(sb,ss,h,u0,L,cutsFor(f.id,ss),crown);
  // Stop bar where the side street meets Oak Hollow.
  grid(sb,[-(h-.35),-.15],[CF+2.2,CF+2.65],(u,v)=>crown(u,v)+.006,mat(0xe8e4d8,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  const sc=cutsFor(f.id,1).concat(cutsFor(f.id,-1));
  for(const ss of [-1,1]){const cuts=cutsFor(f.id,ss),brk=[];for(const c of cuts)brk.push(c.u0,c.u1);
   const ck=j.creek?range(j.creek.u-7,j.creek.u+7,.5):[],us=uniq([...range(5,L+24,2),u0,...brk,...ck,...(W.woods&&f===W.sideFrames[0]?[W.woods.U]:[])]),vs=[...(W.town&&f===W.sideFrames[1]?[W.town.walk]:[]),h+.3,h+1,h+1.65,h+2.4,h+3.15,h+4,h+5,h+6.5,h+8,h+10,h+12,h+15,h+18,h+21,h+24,h+27,h+30,h+34,h+38,44,...(j.creek?[8.6,9,9.4,9.8,10.2,j.creek.end-1.2,j.creek.end-.4,j.creek.end+.4,j.creek.end+1.2]:[])].map(v=>v*ss).sort((a,b)=>a-b);
   // (Cells that would roof over the easement's trench or culvert are left out; its own ground is there.)
   const ez=W.easement,overTrench=(ua,ub,va,vb)=>ez&&ss>0&&Math.max(Math.abs(va),Math.abs(vb))>28&&[[ua,va],[ub,va],[ua,vb],[ub,vb],[(ua+ub)/2,(va+vb)/2]].some(([uu,vv])=>{const p=f.point(uu,vv);return ez.trench(p.x,p.z,1);})||(ez&&ss>0&&(()=>{const p=f.point((ua+ub)/2,(va+vb)/2);return ez.inside(p.x,p.z,-.3);})());
   // (Chapter Three: past Briarwood's end the woods lay their own ground.)
   const wz=W.woods&&f===W.sideFrames[0]?W.woods:null,underBasin=(ua,ub,va,vb)=>!!wz&&ua>=wz.U-.02;
   // (Chapter Four: past Summerfield's end Old Mill Road goes on; its pavement is its own, so the lawn leaves the road out.)
   const tz=W.town&&f===W.sideFrames[1]?W.town:null,overRoad=(ua,ub,va,vb)=>!!tz&&ua>L-.02&&Math.min(Math.abs(va),Math.abs(vb))<tz.walk-.01;
   grid(sb,vs,us,LAWN,grass,(v,u,va,vb,ua,ub)=>{if(overTrench(ua,ub,va,vb)||underBasin(ua,ub,va,vb)||overRoad(ua,ub,va,vb))return true;if(u<u0&&Math.abs(v)<h+R)return true;for(const c of cuts)if(u>c.u0&&u<c.u1){if(Math.abs(v)<h+XS.walk)return true;if(c.inside(ua+.02,va)&&c.inside(ub-.02,va)&&c.inside(ua+.02,vb)&&c.inside(ub-.02,vb))return true;}return false;});}
  // Asphalt ends where the land beyond the crest takes over: finish it with a curb line.
  // (On Briarwood the middle of it is left out: the old access road goes on from there; chapter three.)
  if(W.woods&&f===W.sideFrames[0]){const gap=W.woods.halfW(0)+.12,len=h+.3-gap;for(const e of [-1,1])K.box(sb,e*(gap+len/2),.02,-(L+.15),len,.1,.3,curbC);}
  else if(!(W.town&&f===W.sideFrames[1]))K.box(sb,0,.02,-(L+.15),2*h+.6,.1,.3,curbC);// (Summerfield: Old Mill Road goes on from here)
 }

 // What surface is authored here (height above the street's ground)? -----------------------------
 const sideSurface=(jj,u,v)=>{const j=J.find(x=>x.d===jj.d),a=Math.abs(v),h=j.half;if(a<=h&&u>=CF-.05)return .025+.028*Math.max(0,1-(v/h)**2)*smooth((u-7)/8);
  const o=a-h,cut=cutsFor(j.frame.id,Math.sign(v)).find(c=>u>c.u0&&u<c.u1);
  if(o<XS.curb)return cut?.045:CURB_TOP;if(o>=XS.strip&&o<=XS.walk)return SIDEWALK;return LAWN;};
 W.sideSurface=sideSurface;
 W.surfaceY=(d,lat)=>{
  const a=Math.abs(lat);
  if(d>=culStart-.5){const cd=culDist(d,lat);if(cd<0||(a<=ROAD_HALF&&d<=roadEndD))return roadCrown(d,lat);
   if(cd<XS.curb)return CURB_TOP;if(cd>=XS.strip&&cd<=XS.walk)return culWalkY(d,lat);return lawnY(d,lat);}
  if(a<=ROAD_HALF)return roadCrown(d,lat);
  const j=inCorridor(d,lat);
  if(j){const u=a,v=(j.d-d)*j.side,s=j.side;
   // Corner arcs.
   for(const sg of [-1,1]){const C=[j.d+sg*(j.half+j.R),s*(CF+j.R)];if(sg*(d-j.d)>=j.half-.01&&sg*(d-j.d)<=j.half+j.R&&a<=CF+j.R){const r=Math.hypot(d-C[0],lat-C[1]);if(r>=j.R)return .025;const o=j.R-r;if(o<XS.curb)return CURB_TOP;if(o>=XS.strip&&o<=XS.walk)return SIDEWALK;return LAWN;}}
   // Past 24 m the side street has its own ground (and its own curve): measure in its frame.
   if(u>24){const g=groundPoint(d,lat),q=u>j.bendAt-6?j.frame.project(g.x,g.z,u):{u,v},p=j.frame.point(q.u,q.v);return p.y-g.y+sideSurface(j,q.u,q.v);}
   if(Math.abs(d-j.d)<j.half+.01)return sideSurface(j,u,v);
  }
  if(a<CF+XS.curb){const cut=W.cuts.find(c=>c.frame==='main'&&c.side===Math.sign(lat)&&d>c.u0&&d<c.u1);return cut?.045:CURB_TOP;}
  if(a>=CF+XS.strip&&a<=CF+XS.walk)return SIDEWALK;
  return LAWN;
 };
 // Where the bicycle may go: the asphalt, sidewalks, and the driveway cuts between them.
 // (The mouths of the side streets are open a few meters; the story continues straight on.)
 W.rideable=(d,lat,margin=.04)=>{
  const a=Math.abs(lat);
  if(W.obstacles.some(o=>d>o.d0-.12&&d<o.d1+.12&&lat>o.l0-.12&&lat<o.l1+.12))return false;
  if(d>=culStart-.5){const cd=culDist(d,lat);if(cd<-margin&&d>=culStart)return true;if(a<=ROAD_HALF-margin&&d<=roadEndD+2)return true;
   return cd>=-margin&&cd<=XS.walk-.025;}
  if(a<=ROAD_HALF-margin)return true;
  const j=J.find(j=>Math.sign(lat)===j.side&&Math.abs(d-j.d)<j.half+j.R+1);
  if(j){if(Math.abs(d-j.d)<=j.half-margin&&a<=CF+j.R+2)return true;for(const sg of [-1,1]){const C=[j.d+sg*(j.half+j.R),j.side*(CF+j.R)];if(sg*(d-j.d)>=j.half-.01&&a<=CF+j.R&&Math.hypot(d-C[0],lat-C[1])>=j.R+margin)return true;}}
  if(a<=CF+XS.walk-.025&&!(j&&Math.abs(d-j.d)<j.half+j.R))return true;
  if(j)for(const sg of [-1,1]){const C=[j.d+sg*(j.half+j.R),j.side*(CF+j.R)],o=j.R-Math.hypot(d-C[0],lat-C[1]);if(sg*(d-j.d)>=j.half-.01&&a<=CF+j.R&&o>=0&&o<=XS.walk-.025)return true;}
  const cut=W.cuts.find(c=>c.frame==='main'&&c.side===Math.sign(lat)&&d>c.u0+margin&&d<c.u1-margin);
  return !!cut&&a<=CF+XS.walk;
 };
}
