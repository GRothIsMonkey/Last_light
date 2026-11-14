// Aftermath I: Oak Hollow Drive, days and weeks later. Not a new street: Chapter Eight's own, exactly as it fell (chapter8-town.js
// after(): the trench of the storm line at 1047-1095, the house at 1052 leaning into it, the porch and roof gone at 1081, the
// Kesslers' shell, the Hendersons' yard gone into the ground; chapter8-ruin.js at its morning stage: Summerfield's crater, the
// Kowalskis' burned frame, the pole down at their end), settled: the fires out, the main shut off and the water standing in the
// trench, the wire on the ground dead. Then what people did to it:
//   september  a chain-link line across the drive just below Summerfield with a gate an escort can open; the crater fenced; a
//              second line across at the trench (ROAD CLOSED); the searchers' paint on every door from Summerfield up; UNSAFE and
//              RESTRICTED placards; plywood where the windows blew; an excavator in the trench, a bucket truck at the pole;
//              a dumpster; what people carried out of their houses, at the curb, under tarps
//   october    the line moved down to Summerfield itself, shut; the crater filled with gravel and plated; the Kowalskis' frame
//              taken down to a cleared lot; a new pole, its wood still pale; the paint fading; more plywood
// Walking: chapter8-ruin.js's room answers for the street (its pits, the town's trench and yards, the fallen poles), and the
// fences here are added to what it calls blocked.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {makeShapes,clamp,damp,smooth,lerp,paper} from './chapter6-kit.js';
import {makeCar} from './props.js';
import {createKit} from './kit.js';
import {cutWorld} from './chapter8-ruin.js';
import {tex9} from './aftermath1-props.js';
import {utilityPole} from './chapter7-build.js';

export function createStreet9({scene,world,nav,ch8,STREET}){
 const ruin=ch8?.ruin,town=STREET?.town;
 const root=new THREE.Group();root.name='a1-street';
 const K=makeShapes(),KT=createKit();
 const SP=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)+dy};};
 const RY=d=>-heading(d);
 const MC=new Map();const M=(c,o={})=>{const key=c+JSON.stringify(o);if(!MC.has(key)){const m=new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});m.name='a1-street-'+c.toString(16);MC.set(key,m);}return MC.get(key);};
 const G={sep:new THREE.Group(),oct:new THREE.Group(),both:new THREE.Group()};for(const [k,g] of Object.entries(G)){g.name='a1-street-'+k;root.add(g);}
 const SEG={sep:[],oct:[]};
 // ---- chain-link: posts, rails, a see-through mesh; its line blocks walking ----------------------------------------------------------
 const linkTex=(()=>{const t=paper(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='rgba(176,182,188,.95)';g.lineWidth=3;for(let k=-1;k<=2;k++){g.beginPath();g.moveTo(k*64-32,0);g.lineTo(k*64+96,h);g.stroke();g.beginPath();g.moveTo(k*64+96,0);g.lineTo(k*64-32,h);g.stroke();}});if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;}return t;})();
 const steel=M(0x9aa0a6,{roughness:.45,metalness:.6}),block=M(0x8f8b82,{roughness:1});
 const GATES=[];// (the gates, in the order they were built: a shut one blocks its gap)
 function fence(set,pts,{h=1.85,gap=null,sign=null}={}){const g=G[set],P=pts.map(([d,lat])=>SP(d,lat));
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(L/3)),ang=Math.atan2(b.x-a.x,b.z-a.z);
   for(let j=0;j<n;j++){const u0=j/n,u1=(j+1)/n,x0=lerp(a.x,b.x,u0),z0=lerp(a.z,b.z,u0),x1=lerp(a.x,b.x,u1),z1=lerp(a.z,b.z,u1),y0=lerp(a.y,b.y,u0),y1=lerp(a.y,b.y,u1),len=Math.hypot(x1-x0,z1-z0);
    const isGap=gap&&gap.seg===i&&gap.panel===j;
    K.cyl(g,x0,y0+h/2,z0,.024,h,steel,{sides:8});K.box(g,x0,y0+.08,z0,.6,.16,.22,block,{ry:ang});
    if(isGap){// the gate: a panel on its post, shut along the line until somebody with a key opens it (swing(k): 0 shut, 1 open)
     const gt=new THREE.Group();gt.position.set(x0,y0,z0);gt.rotation.y=ang;g.add(gt);const GT={g:gt,ang,k:0,set(k){GT.k=k;gt.rotation.y=ang+k*1.9;},seg:[x0,z0,x1,z1]};GATES.push(GT);K.pipe(gt,[0,.1,0],[0,.1,len*.96],.02,steel,6);K.pipe(gt,[0,h-.05,0],[0,h-.05,len*.96],.02,steel,6);K.pipe(gt,[0,.1,len*.96],[0,h-.05,len*.96],.02,steel,6);
     const pm=new THREE.Mesh(new THREE.PlaneGeometry(len*.96,h-.15),new THREE.MeshStandardMaterial({map:linkTex,color:linkTex?0xffffff:0xa0a6ac,transparent:true,alphaTest:.3,side:THREE.DoubleSide,opacity:linkTex?1:.25,depthWrite:!!linkTex}));pm.material.name='a1-chainlink';pm.position.set(0,h/2,len*.48);pm.rotation.y=Math.PI/2;if(pm.material.map){pm.material.map=pm.material.map.clone();pm.material.map.repeat.set(len*1.6,h*1.6);pm.material.map.needsUpdate=true;}gt.add(pm);continue;}
    K.pipe(g,[x0,y0+h-.04,z0],[x1,y1+h-.04,z1],.018,steel,6);
    const pm=new THREE.Mesh(new THREE.PlaneGeometry(len,h-.12),new THREE.MeshStandardMaterial({map:linkTex,color:linkTex?0xffffff:0xa0a6ac,transparent:true,alphaTest:.3,side:THREE.DoubleSide,opacity:linkTex?1:.25,depthWrite:!!linkTex}));pm.material.name='a1-chainlink';
    if(pm.material.map){pm.material.map=pm.material.map.clone();pm.material.map.repeat.set(len*1.6,h*1.6);pm.material.map.needsUpdate=true;}pm.position.set((x0+x1)/2,(y0+y1)/2+h/2,(z0+z1)/2);pm.rotation.y=ang+Math.PI/2;g.add(pm);
    SEG[set].push([x0,z0,x1,z1]);}
   const e=P[P.length-1];if(i===P.length-2){K.cyl(g,e.x,e.y+h/2,e.z,.024,h,steel,{sides:8});K.box(g,e.x,e.y+.08,e.z,.6,.16,.22,block,{ry:ang});}}
  if(sign){const [d,lat,face]=sign,q=SP(d,lat);const s=K.plane(g,q.x,q.y+1.25,q.z,.92,.62,new THREE.MeshStandardMaterial({map:tex9('fenceSign'),color:tex9('fenceSign')?0xffffff:0xf4f1e6,roughness:.8,side:THREE.DoubleSide}),{ry:RY(d)+(face||0)});s.name='a1-road-closed';}}
 const segHit=(S,x,z,r)=>{for(const [x0,z0,x1,z1] of S){const dx=x1-x0,dz=z1-z0,l2=dx*dx+dz*dz||1,t=clamp(((x-x0)*dx+(z-z0)*dz)/l2,0,1),px=x0+dx*t-x,pz=z0+dz*t-z;if(px*px+pz*pz<(r+.1)*(r+.1))return true;}return false;};
 // ---- the searchers' paint, placards, plywood ----------------------------------------------------------------------------------------
 const houses=world.houses.filter(h=>h.frameId==='main'&&!h.far&&h.toWorld&&h.u>852&&h.u<1046);
 const homeFrame=(Q,g)=>{const o=Q.toWorld(0,0),f=new THREE.Group();f.position.set(o.x,o.ground,o.z);f.rotation.y=Q.worldRot;g.add(f);return f;};
 const X={},PAINT=[];
 houses.forEach((Q,i)=>{const D2=Q.depth/2+(Q.brick==='front'?.07:0)+.075,fl=Q.floor??.34,dx=Q.doorX??0;
  for(const set of ['sep','oct']){const f=homeFrame(Q,G[set]);
   const t=tex9('xmark',i%3===0?'8/28':'8/27',i%4===1?'CTF-1':'OHFD','0');const m=new THREE.MeshStandardMaterial({map:t,color:t?0xffffff:0xe85c1c,transparent:true,alphaTest:.15,opacity:set==='oct'?.55:.95,roughness:.9,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false});m.name='a1-xmark';
   const p=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),m);p.position.set(dx+(i%2?.85:-.85),fl+1.45,D2+.01);f.add(p);PAINT.push(p);
   if(i%3!==2){const tp=tex9('placard',i%2?'RESTRICTED':'UNSAFE'),pm=new THREE.Mesh(new THREE.PlaneGeometry(.32,.4),new THREE.MeshStandardMaterial({map:tp,color:tp?0xffffff:0xc8281e,roughness:.8,polygonOffset:true,polygonOffsetFactor:-3}));pm.material.name='a1-placard';pm.position.set(dx+(i%2?-.7:.7),fl+1.35,D2+.012);f.add(pm);}}
  X[Q.u.toFixed(1)]=Q;});
 // plywood over the windows that blew (the town module's own list of them)
 const ply=M(0xb8955c,{roughness:.95}),plyOld=M(0xa58449,{roughness:.95});
 function boardUp(set){for(const B of Object.values(town?.BO||{})){if(!B?.Q||!B.wins)continue;const Q=B.Q,two=Q.stories===2,winW=two?1.1:1.3,winH=two?1.35:1.25,D2=Q.depth/2+(Q.brick==='front'?.07:0);const f=homeFrame(Q,G[set]);
  B.wins.forEach((W,j)=>{if(set==='sep'&&j%3===2)return;K.box(f,W.x,W.y,D2+.11,winW+.12,winH+.12,.025,set==='oct'?plyOld:ply);});}}
 // ---- machines, a dumpster, a truck for the lines ----------------------------------------------------------------------------------
 const yel=M(0xe0aa1c,{roughness:.55}),dark=M(0x26282a,{roughness:.8}),glass=M(0x1c262c,{roughness:.1,metalness:.5}),white=M(0xe8e6de,{roughness:.5}),orange=M(0xe2712a,{roughness:.6}),green=M(0x2f5a3a,{roughness:.7});
 function excavator(g,d,lat,face=Math.PI/2,{reach=.6}={}){const q=SP(d,lat),e=new THREE.Group();e.name='a1-excavator';e.position.set(q.x,q.y,q.z);e.rotation.y=RY(d)+face;g.add(e);
  for(const s of [-1,1]){K.box(e,s*1.05,.45,0,.6,.9,3.8,dark);}K.box(e,0,.95,0,2.4,.3,2.6,dark);
  const top=new THREE.Group();top.position.y=1.1;e.add(top);K.box(top,0,.65,.4,2.5,1.1,2.9,yel);K.box(top,-.6,1.55,-.3,1,1.2,1.1,yel);K.box(top,-.6,1.6,-.86,.9,.9,.03,glass);K.box(top,0,.6,1.95,2.3,.9,.4,dark);
  const boom=new THREE.Group();boom.position.set(.45,1,-.9);boom.rotation.x=-.75;top.add(boom);K.box(boom,0,0,-2.4,.45,.55,4.9,yel);
  const arm=new THREE.Group();arm.position.set(0,0,-4.8);arm.rotation.x=1.7+reach*.4;boom.add(arm);K.box(arm,0,0,-1.6,.35,.42,3.2,yel);
  const bk=new THREE.Group();bk.position.set(0,0,-3.2);bk.rotation.x=.9;arm.add(bk);K.box(bk,0,-.25,-.25,.9,.6,.7,dark);for(let i=0;i<4;i++)K.box(bk,-.33+i*.22,-.6,-.55,.07,.1,.14,steel);return e;}
 function bucketTruck(g,d,lat,face){const q=SP(d,lat),t=new THREE.Group();t.name='a1-bucket-truck';t.position.set(q.x,q.y,q.z);t.rotation.y=RY(d)+face;g.add(t);makeCar(KT,t,'pickup',0xe8e6de,{lights:false});
  const b=new THREE.Group();b.position.set(0,1.6,1.2);b.rotation.set(-1.05,.4,0);t.add(b);K.box(b,0,0,-2.6,.3,.3,5.2,white);const bu=K.box(b,0,-.3,-5.3,.9,1,.9,M(0xd9d4c6,{roughness:.6}));void bu;
  K.box(t,0,2.1,-1.1,.9,.12,.25,orange);return t;}
 function dumpster(g,d,lat,face=0){const q=SP(d,lat),t=new THREE.Group();t.name='a1-dumpster';t.position.set(q.x,q.y,q.z);t.rotation.y=RY(d)+face;g.add(t);K.box(t,0,.75,0,2.2,1.5,5.2,green);
  for(let i=0;i<9;i++){const c=[0x7a5a3a,0x6a6e72,0xb7b1a2,0x4a3b2c,0x9a5c46][i%5];K.box(t,-.6+(i%3)*.6,1.55+(i%2)*.15,-2+i*.48,.5+(i%2)*.4,.3,.5,M(c,{roughness:1}),{ry:i*.7,rx:(i%3)*.2});}return t;}
 // what people carried out: a mattress, a chair, boxes, a rolled carpet, under a blue tarp
 const tarpM=M(0x2a5aa8,{roughness:.7,side:THREE.DoubleSide});
 function curbPile(g,d,lat,face=0,{tarp=true}={}){const q=SP(d,lat),t=new THREE.Group();t.name='a1-curb-pile';t.position.set(q.x,q.y,q.z);t.rotation.y=RY(d)+face;g.add(t);
  K.box(t,0,.13,0,.95,.2,1.9,M(0xd8d0bf,{roughness:1}),{rz:.12});K.box(t,1.2,.32,.3,.7,.62,.7,M(0x6a4a3a,{roughness:1}));K.box(t,1.2,.75,.62,.7,.5,.12,M(0x6a4a3a,{roughness:1}));
  for(let i=0;i<4;i++)K.box(t,-1.1+(i%2)*.4,.2+Math.floor(i/2)*.36,-.6+i*.2,.42,.34,.42,M(0xa98556,{roughness:1}),{ry:i*.3});K.cyl(t,.2,.16,1.3,.16,1.6,M(0x8a5a4a,{roughness:1}),{rz:Math.PI/2});
  if(tarp){const tp=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.1,6,5),tarpM);const pa=tp.geometry.attributes.position;for(let i=0;i<pa.count;i++)pa.setZ(i,Math.sin(pa.getX(i)*3.1+pa.getY(i)*2.3)*.08+.5-Math.abs(pa.getY(i))*.2);tp.geometry.computeVertexNormals();tp.rotation.x=-Math.PI/2;tp.position.set(-.5,.35,.4);t.add(tp);}return t;}
 function sawhorse(g,d,lat,face=0){const q=SP(d,lat),t=new THREE.Group();t.position.set(q.x,q.y,q.z);t.rotation.y=RY(d)+face;g.add(t);for(const y of [.55,.95])K.box(t,0,y,0,1.8,.2,.04,M(0xf2efe6,{roughness:.6}));for(let i=0;i<4;i++)K.box(t,-.6+i*.4,.95,.022,.18,.2,.01,orange);for(const s of [-1,1]){K.box(t,s*.75,.45,.15,.05,.95,.05,white,{rx:.3});K.box(t,s*.75,.45,-.15,.05,.95,.05,white,{rx:-.3});}return t;}
 function cone(g,d,lat){const q=SP(d,lat),c=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,10),orange);c.position.set(q.x,q.y+.25,q.z);c.castShadow=true;g.add(c);}
 // ---- september -------------------------------------------------------------------------------------------------------------
 {const S='sep';
  // the line across the drive just below Summerfield, a gate on the east lawn (for escorts); the crater fenced on its east side
  fence(S,[[857,-24],[857,-4.6]]);fence(S,[[857,-4.6],[857,9],[857,12.4],[857,24]],{gap:{seg:1,panel:0,open:1.35},sign:[857,-1.5,0]});
  fence(S,[[857.5,8.6],[886,8.6]]);fence(S,[[886,8.6],[886,-24]]);
  // the line across at the trench (ROAD CLOSED, UNSTABLE GROUND), and along the Hendersons' yard
  fence(S,[[1041,-24],[1041,24]],{sign:[1041,1.5,0]});fence(S,[[1012,6.1],[1038,6.1]],{h:1.2});
  for(const [d,lat] of [[855.5,6],[855.5,-2],[1039,-6],[1039,3]])sawhorse(G[S],d,lat);for(const [d,lat] of [[855,3.2],[855,1.4],[855,-.4],[1039.5,7],[1039.5,9]])cone(G[S],d,lat);
  excavator(G[S],1062,4.6,-Math.PI/2,{reach:.7});bucketTruck(G[S],1070,-15.5,Math.PI);dumpster(G[S],962,-7.3,0);
  curbPile(G[S],984,-7.6,0);curbPile(G[S],1004,7.4,Math.PI);curbPile(G[S],930,-7.6,.2,{tarp:false});
  boardUp(S);}
 // ---- october ---------------------------------------------------------------------------------------------------------------
 const FILL=new THREE.Group();FILL.name='a1-crater-fill';G.oct.add(FILL);
 {const S='oct';
  fence(S,[[858,-24],[858,24]],{sign:[858,-1,0]});for(const [d,lat] of [[856.5,-3],[856.5,3]])sawhorse(G[S],d,lat);for(const [d,lat] of [[856,0],[856,6]])cone(G[S],d,lat);
  // the crater filled: gravel to the road's height, a plate over the middle; the Kowalskis' lot cleared
  const c=SP(872,-.4);const gravel=new THREE.Mesh(new THREE.CircleGeometry(1,28),M(0x8a8478,{roughness:1}));gravel.rotation.x=-Math.PI/2;gravel.scale.set(7.4,9.4,1);gravel.rotation.z=RY(872);gravel.position.set(c.x,c.y+.03,c.z);FILL.add(gravel);
  K.box(FILL,c.x,c.y+.05,c.z,3,.04,2.2,M(0x4a4c4e,{roughness:.6,metalness:.5}),{ry:RY(872)});
  dumpster(G[S],940,-9,Math.PI/2);curbPile(G[S],1004,7.4,Math.PI,{tarp:true});boardUp(S);
}
 // the pole that snapped across from your house (chapter8-ruin.js's): by September a new one where it stood, its wood still pale
 const NEWPOLE=new THREE.Group();NEWPOLE.name='a1-new-pole';G.both.add(NEWPOLE);
 {const b=ruin?.POLE?.base;if(b){const p=utilityPole({h:9.2});p.position.set(b.x,b.y,b.z);p.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.multiplyScalar(1.5);}});NEWPOLE.add(p);
   K.cyl(NEWPOLE,b.x,b.y+.05,b.z,.5,.1,M(0x6a5a44,{roughness:1}));}}// (new dirt round its foot)
 // Sam's dad's pickup (where a scene parks it), and what is in its bed
 const pickup=new THREE.Group();pickup.name='a1-pickup';makeCar(KT,pickup,'pickup',0x4a5a66,{lights:false});pickup.visible=false;root.add(pickup);
 function park(g,d,lat,face=0){const q=SP(d,lat);g.position.set(q.x,q.y,q.z);g.rotation.set(0,RY(d)+face,0);g.visible=true;return g;}
 // ---- the street, settled -----------------------------------------------------------------------------------------------------
 const ST={state:null};
 function settle(){if(!town)return;
  for(const F of town.FIRES||[]){F.want=0;F.level=0;F.m.visible=false;for(const S2 of F.smoke)S2.s.material.opacity=0;}
  for(const c of town.smokeCols||[])c.on=false;town.ash=0;if(town.ASH)town.ASH.material.opacity=0;
  const F=town.FIELD;if(F){F.burst=false;if(F.water){F.water.m.visible=true;F.water.m.position.y=lerp(F.water.y0,F.water.y1,.45);}}
  if(town.POLE)town.POLE.arc=1e12;if(town.CAR)town.CAR.alarm=0;if(town.CAR2)town.CAR2.alarm=0;
  if(ruin){ruin.F.want=0;ruin.F.level=0;for(const f of ruin.F.flames||[])f.m.visible=false;for(const S2 of ruin.F.smoke||[])S2.s.material.opacity=0;if(ruin.F.light)ruin.F.light.intensity=0;
   for(const s of ruin.POLE.sparks||[])s.material.opacity=0;if(ruin.POLE.light)ruin.POLE.light.intensity=0;}}
 // show('september' | 'october' | null)
 function show(state){ST.state=state||null;
  if(!state){pickup.visible=false;for(const g2 of GATES)g2.set(0);STREET?.after?.(false);town?.reset?.();if(ruin){if(nav.room===ruin.room)nav.setRoom(null);ruin.setBlocked(null);ruin.show(false);ruin.reset();ruin.syncCuts();}root.removeFromParent();return;}
  cutWorld(world);ruin.show(true);ruin.stage(2);STREET?.after?.(true);settle();town?.update?.(.05,{});
  const oct=state==='october';town?.district?.settle(oct?'october':'september');
  ruin.POLE.g.visible=false;
  if(oct){const p=ruin.pits.heave;p.g.visible=false;p.cut.on=false;ruin.F.g.visible=false;ruin.syncCuts();}
  for(const g2 of GATES)g2.set(0);
  G.sep.visible=!oct;G.oct.visible=oct;if(!root.parent)scene.add(root);
  ruin.setBlocked((x,z,r)=>(town?.blocked(x,z,r))||segHit(oct?SEG.oct:SEG.sep,x,z,r)||gateHit(x,z,r));nav.setRoom(ruin.room);}
 const gateHit=(x,z,r)=>{for(const g2 of GATES)if(g2.k<.6&&g2.g.parent?.visible!==false&&segHit([g2.seg],x,z,r))return true;return false;};
 function update(dt,{camera=null}={}){if(!ST.state)return;town?.update?.(dt,{camera});}
 return {root,G,SEG,show,update,settle,SP,RY,houses,X,ST,GATES,pickup,park,NEWPOLE,blocked:(x,z,r=.3)=>ST.state?segHit(ST.state==='october'?SEG.oct:SEG.sep,x,z,r):false};
}
