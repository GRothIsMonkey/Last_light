// Chapter Eight: Oak Hollow Drive before dawn on Saturday, after the old works under the court gave way. Staged damage
// on the real street, each piece with its cause, each one changing where a kid can walk or ride:
//
//  sams      the road between Sam's house and the Hendersons' gone into the storm line under it: a hole the width of
//            the street, the asphalt broken off in slabs round its rim, a water main torn open in the side of it,
//            the Hendersons' sedan nose-down in it. It runs on under the Hendersons' front: their garage corner and
//            porch have dropped into it (the house the boys get the family out of).
//  fire      at the Kowalskis' end of the block the gas service line torn out of the ground by the heave: a jet of fire at
//            the curb that has caught the house beside it; it spreads to the garage while you are there.
//  pole      a utility pole snapped at its base where the ground went out from under it, lying across the sidewalk and
//            into the street, its wires down and arcing.
//  heave     Summerfield and Oak Hollow: the intersection lifts, splits and goes down (staged once, in front of you),
//            and a car that was stopped in it goes with it.
//
// The merged neighbourhood is not rebuilt: its materials are given a small cut (cutWorld) that leaves out what is
// inside a few volumes (a hole in the road, a pole's base, a house's corner) and the ruin's own meshes stand in
// for what is left. The cut is installed only when this chapter's surface first needs it and costs nothing elsewhere.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {makeShapes,clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {makeCar} from './props.js';
import {createKit} from './kit.js';
import {utilityPole} from './chapter7-build.js';
import {rescueTruck} from './chapter6-cast.js';
import {puffTexture} from './chapter8-presence.js';

const MAXCUT=32;
const CUT={n:{value:0},inv:{value:[...Array(MAXCUT)].map(()=>new THREE.Matrix4())},kind:{value:new Float32Array(MAXCUT)}};
let installed=false;
// Every material of the merged world, once: fragments inside an active cut volume are not drawn. Box (kind 0) or
// upright elliptic cylinder (kind 1) in the volume's own unit frame. With no cut active it is one loop that exits.
export function cutWorld(world){if(installed)return 0;installed=true;let n=0;const done=new Set();
 // (the merged neighbourhood, and its wires: those are LineSegments merged by colour and added straight to the scene)
 const lines=[];world.scene?.children?.forEach(o=>{if(o.isLineSegments&&o.material?.isLineBasicMaterial&&!o.name)lines.push(o);});
 for(const mesh of [...world.merged,...lines]){const m=mesh.material;if(!m||done.has(m)||Array.isArray(m))continue;done.add(m);n++;
  const prev=m.onBeforeCompile,prevKey=m.customProgramCacheKey?.bind(m);
  m.onBeforeCompile=(sh,r)=>{prev?.call(m,sh,r);sh.uniforms.uCutN=CUT.n;sh.uniforms.uCutInv=CUT.inv;sh.uniforms.uCutK=CUT.kind;
   sh.vertexShader='varying vec3 vCutW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n{vec4 cw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\ncw=instanceMatrix*cw;\n#endif\nvCutW=(modelMatrix*cw).xyz;}');
   sh.fragmentShader='uniform int uCutN;\nuniform mat4 uCutInv['+MAXCUT+'];\nuniform float uCutK['+MAXCUT+'];\nvarying vec3 vCutW;\n'+sh.fragmentShader.replace('void main() {','void main() {\n for(int i=0;i<'+MAXCUT+';i++){if(i>=uCutN)break;vec3 q=(uCutInv[i]*vec4(vCutW,1.)).xyz;bool inside=uCutK[i]<.5?(abs(q.x)<1.&&abs(q.y)<1.&&abs(q.z)<1.):(q.x*q.x+q.z*q.z<1.&&abs(q.y)<1.);if(inside)discard;}');};
  m.customProgramCacheKey=()=>(prevKey?prevKey():'')+'|c8cut';m.needsUpdate=true;}
 return n;}

export function createRuin({scene,world,nav,sfx=()=>{}}){
 const root=new THREE.Group();root.name='chapter8-ruin';
 const K=makeShapes(),KT=createKit();
 const P=(d,lat)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)};};
 const hd=d=>heading(d);// the street's heading at d (its forward: sin, -cos)
 const mat=(c,o={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.9,...o});m.name='c8-ruin-'+c.toString(16);return m;};
 const earth=mat(0x3d3127),earthDark=mat(0x251d17),asphalt=mat(0x3a3a3c,{roughness:.85}),curb=mat(0x8e8b82),pipeM=mat(0x55504a,{roughness:.5,metalness:.4}),ironM=mat(0x2d2a28,{roughness:.6,metalness:.5});
 const waterM=new THREE.MeshStandardMaterial({color:0x1b2a2e,roughness:.06,metalness:.5,transparent:true,opacity:.9});
 const sootM=mat(0x161412),houseM=mat(0xc9bfa8),roofM=mat(0x4a4744),timber=mat(0x7a5a3a),pink=mat(0xd99aa0),glassM=new THREE.MeshStandardMaterial({color:0x14181a,roughness:.1,metalness:.5});
 // ---- the cut volumes ---------------------------------------------------------------------------------------------------
 const cuts=[];// {kind:0 box|1 cyl, m: matrix (unit frame -> world), on}
 function addCut(kind,{x,y,z,sx,sy,sz,rot=0}){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rot),new THREE.Vector3(sx,sy,sz));const c={kind,m,inv:m.clone().invert(),on:false};cuts.push(c);return c;}
 function syncCuts(){let n=0;for(const c of cuts){if(!c.on||n>=MAXCUT)continue;CUT.inv.value[n].copy(c.inv);CUT.kind.value[n]=c.kind;n++;}CUT.n.value=n;}
 // ---- a crater in the ground: an elliptic hole, its wall of earth going down and in, broken slabs round its rim -----------
 function crater({d,lat,a,b,depth,water=null,rot=0,name}){const c=P(d,lat),g=new THREE.Group();g.name='c8-pit-'+name;root.add(g);const h0=hd(d)+rot,ca=Math.cos(h0),sa=Math.sin(h0);
  // (a along the street, b across it; local u along, v across)
  const W=(u,v)=>({x:c.x+Math.sin(h0)*u+Math.cos(h0)*v,z:c.z-Math.cos(h0)*u+Math.sin(h0)*v});void ca;void sa;
  const rings=6,seg=40,pos=[],col=[],idx=[];
  for(let r=0;r<=rings;r++){const k=r/rings,sh=1-k*.55,y0=-depth*Math.pow(k,1.25);for(let s=0;s<seg;s++){const t=s/seg*Math.PI*2,n=1+.09*Math.sin(t*5+d)+.06*Math.sin(t*11+lat);const u=Math.cos(t)*a*sh*n,v=Math.sin(t)*b*sh*n,w=W(u,v);
    const gy=k===0?nav.groundY(w.x,w.z)-.02:c.y;pos.push(w.x,gy+y0+(k>0?Math.sin(t*7+r)*.18:0),w.z);const sh2=.5+.5*Math.sin(t*3+r*1.7);col.push(.24*(1-k*.5)+.05*sh2,.19*(1-k*.5)+.04*sh2,.15*(1-k*.5)+.03*sh2);}}
  for(let r=0;r<rings;r++)for(let s=0;s<seg;s++){const a0=r*seg+s,a1=r*seg+(s+1)%seg,b0=a0+seg,b1=a1+seg;idx.push(a0,b0,a1,a1,b0,b1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
  const wallM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});wallM.name='c8-pit-wall';const wall=new THREE.Mesh(geo,wallM);wall.receiveShadow=true;g.add(wall);
  const fl=new THREE.Mesh(new THREE.CircleGeometry(1,24),earthDark);fl.rotation.x=-Math.PI/2;fl.scale.set(a*.46,b*.46,1);const fw=W(0,0);fl.position.set(fw.x,c.y-depth+.05,fw.z);fl.rotation.z=-h0;g.add(fl);
  if(water!=null){const wm=new THREE.Mesh(new THREE.CircleGeometry(1,24),waterM);wm.rotation.x=-Math.PI/2;wm.scale.set(a*.5,b*.5,1);wm.position.set(fw.x,c.y-depth+water,fw.z);g.add(wm);}
  // slabs of what was on top, broken off and tipped in round the rim (asphalt on the road, sidewalk concrete past the curb)
  for(let s=0;s<16;s++){const t=s/16*Math.PI*2+.2,u=Math.cos(t)*a*.86,v=Math.sin(t)*b*.86,w=W(u,v),onRoad=Math.abs(lat+v)<4.7,sz=1.1+((s*.37)%1)*1.4;
   const slab=K.box(g,w.x,nav.groundY(w.x,w.z)-.35,w.z,sz,.16,sz*.8,onRoad?asphalt:curb,{ry:-h0+t,rx:.5+((s*.61)%1)*.5});slab.rotation.order='YXZ';slab.rotation.set(.45+((s*.61)%1)*.55,-h0-t+Math.PI/2,0);}
  // a broken pipe in the side wall (the main), a culvert's lip far down: what was under the street
  const pw=W(-a*.55,b*.15);K.pipe(g,[pw.x,c.y-depth*.45,pw.z],[W(-a*.2,b*.1).x,c.y-depth*.5,W(-a*.2,b*.1).z],.22,pipeM);
  const box=W(a*.18,-b*.12);K.box(g,box.x,c.y-depth+.6,box.z,3.2,1.4,2.2,mat(0x6a675e),{ry:-h0});
  return {g,c,a,b,depth,h0,W,wall};}
 // ---- where things are --------------------------------------------------------------------------------------------------
 const houseNear=(u,side)=>world.houses.filter(p=>p.frameId==='main'&&p.side===side&&!p.far).sort((p,q)=>Math.abs(p.u-u)-Math.abs(q.u-u))[0];
 const HEND=houseNear(1026,1),BURN=houseNear(939,-1);
 const pits={sams:crater({d:1019,lat:1.6,a:9.6,b:6.4,depth:4.4,water:.5,name:'sams'}),under:crater({d:1023.5,lat:11.6,a:5.4,b:4.2,depth:3.6,name:'hendersons'}),heave:crater({d:872,lat:-.4,a:8.6,b:7.2,depth:5.4,water:.35,name:'summerfield'})};
 for(const k of ['sams','under','heave']){const p=pits[k];p.cut=addCut(1,{x:p.c.x,y:p.c.y-.2,z:p.c.z,sx:p.b*.985,sy:1.6,sz:p.a*.985,rot:Math.PI-p.h0});p.g.visible=false;}
 // (the cut cylinder's local x is across, z along: rot turns its z to the street's forward)
 // the Hendersons' house: its street-facing corner on the pit's side cut away up to the roof, the wreck in its place
 const H={P:HEND,g:new THREE.Group(),door:null,garage:null,front:null};H.g.name='c8-hendersons';root.add(H.g);H.g.visible=false;
 if(HEND){const Q=HEND,front=(()=>{const a=Q.toWorld(0,-Q.depth/2),b=Q.toWorld(0,Q.depth/2),r=P(Q.u,0);return Math.hypot(a.x-r.x,a.z-r.z)<Math.hypot(b.x-r.x,b.z-r.z)?-1:1;})(),toward=Q.toWorld(-Q.w/2,0),away=Q.toWorld(Q.w/2,0),sideK=Math.hypot(toward.x-pits.under.c.x,toward.z-pits.under.c.z)<Math.hypot(away.x-pits.under.c.x,away.z-pits.under.c.z)?-1:1;
  H.front=front;H.sideK=sideK;const L=(x,z)=>Q.toWorld(x,z),gy0=nav.groundY(L(0,0).x,L(0,0).z),ry=-Math.atan2(-(L(1,0).z-L(0,0).z),L(1,0).x-L(0,0).x);// (so rotation.y=-ry turns a box's x to the house's own x)
  const cc=L(sideK*(Q.w/2-1.6),front*(Q.depth/2-1.4));H.cut=addCut(0,{x:cc.x,y:gy0+3,z:cc.z,sx:1.9,sy:4,sz:1.7,rot:-ry});
  // the broken edge: wall slabs hanging, the floor joists out over the hole, a roof plane come down, a dangling porch light
  const ex=sideK*(Q.w/2-3.4),ez=front*(Q.depth/2);const at=(x,z,y)=>{const w=L(x,z);return [w.x,gy0+y,w.z];};
  for(const [x,z,y,w,h,rx,rz] of [[ex,ez-front*.1,1.4,.16,2.6,0,.05],[ex+sideK*.6,ez-front*1.2,1.1,.16,2.1,.12,.35],[ex+sideK*1.8,ez-front*.4,.2,2.4,.16,.6,.1]]){const p=at(x,z,y),o=K.box(H.g,p[0],p[1],p[2],w,h,2.6,houseM,{ry:-ry});o.rotation.set(rx,-ry,rz,'YXZ');}
  for(let k=0;k<5;k++){const p=at(sideK*(Q.w/2-3.2+k*.0),front*(Q.depth/2-.6-k*.5),.32);K.box(H.g,p[0]+Math.sin(ry)*sideK*1.1,p[1]-k*.02,p[2],2.4,.2,.05,timber,{ry:-ry+sideK*.25});}
  {const p=at(sideK*(Q.w/2-1.6),front*(Q.depth/2-1.2),2.2),r2=K.box(H.g,p[0],p[1],p[2],3.8,.12,3.6,roofM,{ry:-ry});r2.rotation.set(-front*.62,-ry,sideK*.45,'YXZ');}
  for(let k=0;k<7;k++){const p=at(sideK*(Q.w/2-1.4+((k*.43)%1)*1.6),front*(Q.depth/2-1.6+((k*.71)%1)*1.4),-.4-((k*.3)%1)*1.6);K.box(H.g,p[0],p[1],p[2],.6+((k*.5)%1)*.7,.35,.5,k%3?houseM:pink,{ry:k});}
  // the front door (jammed: the header over it has come down at one end) and the garage door (sagged, a gap under it)
  const dz=front*(Q.depth/2+.02),dx=-sideK*(Q.w/2-2.6),dp=at(dx,dz,1.05);H.doorAt={x:dp[0],y:dp[1],z:dp[2]};
  const hdr=at(dx,dz+front*.05,2.15);H.header=K.box(H.g,hdr[0],hdr[1],hdr[2],1.6,.22,.24,timber,{ry:-ry});H.header.rotation.set(0,-ry,sideK*.32,'YXZ');
  H.door=K.box(H.g,dp[0],dp[1],dp[2],.95,2.05,.06,mat(0x5a2f22),{ry:-ry});
  const gp=Q.hasGarage?at(Q.gx??sideK*(Q.w/2-2),(Q.gfront??front*Q.depth/2)+front*.04,.95):at(sideK*(Q.w/2-2.4),dz,.95);H.garageAt={x:gp[0],y:gp[1],z:gp[2]};
  H.garage=K.box(H.g,gp[0],gp[1]+.2,gp[2],2.6,1.5,.08,mat(0xd8d2c4),{ry:-ry});H.garage.rotation.set(front*.14,-ry,0,'YXZ');
  // (the yard between the door and the garage is the hole now: the door is got at from the east side of the house, where the
  // header's low end is; the jack goes under that end; her car is at the curb past the lawn, its trunk toward the house)
  H.at=(x,z,y=0)=>{const p=at(x,z,y);return {x:p[0],y:p[1],z:p[2]};};
  H.jackAt=H.at(dx-sideK*.8,dz+front*.55,0);H.jamb=H.at(dx-sideK*1.35,dz+front*.85,0);H.lawn=P(Q.u+7.6,11.6);H.street=P(Q.u+8,-6.4);H.inside=H.at(dx,dz-front*1.2,0);
  {const c=P(Q.u+14,7.7),c2=P(Q.u+15,7.7),tx=c2.x-c.x,tz=c2.z-c.z,tl=Math.hypot(tx,tz)||1,ux=tx/tl,uz=tz/tl,car=new THREE.Group();car.name='c8-henderson-car';makeCar(KT,car,'wagon',0x8a8a92);
   car.position.set(c.x,nav.groundY(c.x,c.z),c.z);car.rotation.y=Math.atan2(-ux,-uz);H.g.add(car);H.car=car;
   H.trunkAt={x:c.x-ux*2.75,y:car.position.y,z:c.z-uz*2.75};H.carBlocks=[-1.7,-.6,.6,1.7].map(k=>({x:c.x+ux*k,z:c.z+uz*k,r:.95}));
   const lid=K.box(car,0,1.38,2.62,1.62,.05,.92,KT.mat(0x8a8a92,{roughness:.38,metalness:.25}));lid.rotation.x=-1.1;lid.name='c8-trunk-lid';H.trunkLid=lid;}
  const jk=new THREE.Group();jk.name='c8-jack';const r=H.jackAt;jk.position.set(r.x,r.y,r.z);H.g.add(jk);K.box(jk,0,.1,0,.3,.2,.5,mat(0xb83a2a,{roughness:.5,metalness:.4}));K.pipe(jk,[0,.2,0],[0,.6,0],.04,pipeM);H.jack=jk;
  H.post=K.box(H.g,r.x,r.y+1.1,r.z,.09,.08,.09,timber);}
 // the burning house and the gas line at its curb; the fire grows and takes the garage after a while
 const F={P:BURN,g:new THREE.Group(),level:0,want:0,spread:0,light:null,flames:[],smoke:[]};F.g.name='c8-fire';root.add(F.g);F.g.visible=false;
 const flameM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},k:{value:1}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 vUv;uniform float t,k;float h(vec2 p){return fract(sin(dot(p,vec2(12.9,78.2)))*43758.5);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}void main(){vec2 p=vUv;float w=1.-abs(p.x-.5)*2.;float fl=n(vec2(p.x*4.,p.y*3.-t*3.2))*.6+n(vec2(p.x*9.,p.y*7.-t*6.))*.4;float a=smoothstep(0.,.35,w)*smoothstep(1.,.15,p.y)*smoothstep(.2,.75,fl+.35*(1.-p.y))*k;vec3 c=mix(vec3(1.,.35,.05),vec3(1.,.85,.4),smoothstep(.5,1.,fl)*(1.-p.y));gl_FragColor=vec4(c*a*1.6,a);}'});
 flameM.name='c8-flame';
 const smokeM=new THREE.SpriteMaterial({color:0x1d1b1a,map:puffTexture(),transparent:true,opacity:.0,depthWrite:false});smokeM.name='c8-smoke';/* (soft puffs: untextured sprites are hard squares) */
 if(BURN){const Q=BURN,L=(x,z)=>Q.toWorld(x,z),gy0=nav.groundY(L(0,0).x,L(0,0).z);
  const front=(()=>{const a=Q.toWorld(0,-Q.depth/2),b=Q.toWorld(0,Q.depth/2),r=P(Q.u,0);return Math.hypot(a.x-r.x,a.z-r.z)<Math.hypot(b.x-r.x,b.z-r.z)?-1:1;})();F.front=front;const fry=-Math.atan2(-(L(1,0).z-L(0,0).z),L(1,0).x-L(0,0).x);
  const spots=[[0,front*(Q.depth/2+.2),1.2,4.5,5],[-Q.w*.3,front*(Q.depth/2+.2),.9,3.4,4],[Q.w*.32,front*(Q.depth/2+.25),1.4,3,3.6],[Q.w*.42,0,4.2,3.5,4.6]];
  for(const [i,[x,z,y,w,h]] of spots.entries()){const p=L(x,z),pl=new THREE.Mesh(new THREE.PlaneGeometry(w,h),flameM.clone());pl.position.set(p.x,gy0+y+h/2-.6,p.z);pl.name='c8-flame-'+i;F.g.add(pl);F.flames.push({m:pl,base:pl.position.clone(),h,i,spread:i>=2});}
  for(const [x,z] of [[0,front*(Q.depth/2-.1)],[-Q.w*.3,front*(Q.depth/2-.1)],[Q.w*.32,front*(Q.depth/2-.1)]]){const p=L(x,z);K.box(F.g,p.x,gy0+1.6,p.z,1.2,1.1,.05,sootM,{ry:-fry});}
  const cp=P(Q.u+2,-5.6),gas=new THREE.Mesh(new THREE.PlaneGeometry(1.2,3.4),flameM.clone());gas.position.set(cp.x,cp.y+1.6,cp.z);gas.name='c8-gas-jet';F.g.add(gas);F.flames.push({m:gas,base:gas.position.clone(),h:3.4,i:9,gas:true});F.gasAt={x:cp.x,y:cp.y+.6,z:cp.z};
  K.pipe(F.g,[cp.x,cp.y-.3,cp.z],[cp.x+.25,cp.y+.25,cp.z+.2],.06,pipeM);
  const pc=crater({d:Q.u+2,lat:-5.8,a:1.7,b:1.4,depth:.9,name:'gas'});pc.g.visible=true;F.g.attach(pc.g);F.pit=pc;F.cut=addCut(1,{x:pc.c.x,y:pc.c.y,z:pc.c.z,sx:1.38,sy:.9,sz:1.68,rot:Math.PI-pc.h0});
  for(let k=0;k<10;k++){const s=new THREE.Sprite(smokeM.clone());s.position.set(L(0,0).x,gy0+4,L(0,0).z);F.g.add(s);F.smoke.push({s,t:k*1.1,life:11});}
  F.center={...L(0,0),y:gy0};F.light=new THREE.PointLight(0xff8a3a,0,26,1.6);F.light.position.set(L(0,front*(Q.depth/2+1.5)).x,gy0+3,L(0,front*(Q.depth/2+1.5)).z);/* (not added to the scene: a new light would recompile every lit material in town; the chapter's light pool carries the glow) */
  F.blocks=[{x:cp.x,z:cp.z,r:2.4},{x:L(0,front*(Q.depth/2+1.2)).x,z:L(0,front*(Q.depth/2+1.2)).z,r:3.4}];}
 // the snapped pole: lying from its stump on the lawn side across the sidewalk into the street, wires down and arcing
 const POLE={g:new THREE.Group(),sparks:[],t:0};POLE.g.name='c8-pole';root.add(POLE.g);POLE.g.visible=false;
 {const near=(world.poles||[]).filter(p=>p.frame?.id==='main'||!p.frame).map(p=>({p,d:Math.abs((p.z??0)-962)})).sort((a,b)=>a.d-b.d)[0]?.p;const pd=near?.z??962,plat=near?.x??9.3;
  const base=P(pd,plat),tip=P(pd+2.5,plat>0?-3.2:3.2);POLE.base=base;POLE.tip=tip;
  POLE.cut=addCut(0,{x:base.x,y:base.y+5.5,z:base.z,sx:.6,sy:5.6,sz:.6});
  const pole=utilityPole({h:9});pole.position.set(base.x,base.y+.25,base.z);const dx=tip.x-base.x,dz=tip.z-base.z,a=Math.atan2(dx,dz);pole.rotation.set(0,a,0,'YXZ');pole.rotateX(Math.PI/2-.07);POLE.g.add(pole);
  K.cyl(POLE.g,base.x,base.y+.3,base.z,.16,.6,timber,{r2:.18});
  const wm=new THREE.MeshBasicMaterial({color:0x111111});for(const off of [-.9,0,.9]){const pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector3(lerp(base.x,tip.x+off,t),base.y+.15+Math.sin(t*Math.PI)*.5+(1-t)*8.5*(1-t)*.0+.1,lerp(base.z,tip.z+off*.4,t)));}
   const c=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.012,4,false),wm);POLE.g.add(c);}
  const sparkM=new THREE.SpriteMaterial({color:0xcfe4ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});for(let k=0;k<6;k++){const s=new THREE.Sprite(sparkM.clone());s.position.set(tip.x,tip.y+.15,tip.z);s.scale.set(.25,.25,1);POLE.g.add(s);POLE.sparks.push(s);}
  POLE.light=new THREE.PointLight(0xbcd8ff,0,9,2);POLE.light.position.set(tip.x,tip.y+.4,tip.z);/* (likewise: its arc is carried by a pool light, see the chapter) */
  POLE.blocks=[];for(let k=0;k<=6;k++){const t=k/6;POLE.blocks.push({x:lerp(base.x,tip.x,t),z:lerp(base.z,tip.z,t),r:.45});}POLE.blocks.push({x:tip.x,z:tip.z,r:1.6});}
 // the sedan in the Hendersons' hole, nose down; the car in the intersection that goes in with it (staged)
 const sedan=new THREE.Group();sedan.name='c8-sunk-sedan';makeCar(KT,sedan,'sedan',0x6a7a8a);root.add(sedan);sedan.visible=false;
 {const p=pits.sams,w=p.W(-2.2,.8);sedan.position.set(w.x,p.c.y-2.1,w.z);sedan.rotation.set(0,-p.h0+.3,0,'YXZ');sedan.rotateX(-.62);}
 const heaveCar=new THREE.Group();heaveCar.name='c8-heave-car';makeCar(KT,heaveCar,'suv',0x7a2a26,{lights:true});root.add(heaveCar);heaveCar.visible=false;
 const HV={t:-1,stage:'flat',car0:null,road:null,slabs:[]};
 {const p=pits.heave,w=p.W(1.2,-.8);HV.car0={x:w.x,y:p.c.y,z:w.z,a:-p.h0+.2};heaveCar.position.set(w.x,p.c.y,w.z);heaveCar.rotation.set(0,HV.car0.a,0);
  // the road over it before it goes: a flat patch of asphalt that lifts and splits (stands in for the street inside the cut)
  const rg=new THREE.Group();rg.name='c8-heave-road';root.add(rg);rg.visible=false;HV.road=rg;
  for(let i=0;i<4;i++)for(let j=0;j<3;j++){const u=(i-1.5)*3.6,v=(j-1)*3.6,q=p.W(u,v),sl=K.box(rg,q.x,nav.groundY(q.x,q.z)-.06,q.z,3.5,.2,3.5,asphalt,{ry:-p.h0});HV.slabs.push({m:sl,u,v,y0:sl.position.y,ph:i*1.3+j*.7});}}
 // the rescue truck and the police at the corner (the chapter switches them on); the evacuation point down the street
 const truck=rescueTruck();truck.g.visible=false;root.add(truck.g);{const t=P(905,-2.6),t2=P(915,-2.6);truck.g.position.set(t.x,t.y,t.z);truck.g.rotation.y=-Math.atan2(t2.x-t.x,-(t2.z-t.z))+Math.PI;}
 const ST={stage:0,heave:0};
 // ---- walking and riding: what is not there any more ---------------------------------------------------------------------

 // (called for every walkability probe of everyone on the street: nothing here allocates)
 const PITS=['sams','under','heave'].map(k=>pits[k]),_cq=new THREE.Vector3(),_wopt={r:.28};
 function inPit(x,z,r=0){for(let i=0;i<PITS.length;i++){const p=PITS[i];if(!p.g.visible)continue;const dx=x-p.c.x,dz=z-p.c.z,u=dx*Math.sin(p.h0)-dz*Math.cos(p.h0),v=dx*Math.cos(p.h0)+dz*Math.sin(p.h0);if((u/(p.a+r))**2+(v/(p.b+r))**2<1)return p;}return null;}
 const near=(L,x,z,r)=>{if(!L)return false;for(let i=0;i<L.length;i++){const b=L[i];if(Math.hypot(x-b.x,z-b.z)<b.r+r)return true;}return false;};
 function blocked(x,z,r=.3){if(inPit(x,z,r+.25))return true;if(ST.stage>=1&&(near(F.blocks,x,z,r)||near(POLE.blocks,x,z,r)||(H.g.visible&&near(H.carBlocks,x,z,r))))return true;
  if(HEND&&H.g.visible&&H.cut){const q=_cq.set(x,H.cut.m.elements[13],z).applyMatrix4(H.cut.inv);if(Math.abs(q.x)<1.25&&Math.abs(q.z)<1.25)return true;}return false;}
 const BB=(()=>{const a=P(850,-40),b=P(1060,40);return {x0:Math.min(a.x,b.x)-30,x1:Math.max(a.x,b.x)+30,z0:Math.min(a.z,b.z)-30,z1:Math.max(a.z,b.z)+30};})();
 let inner=false;const base=(f)=>{const r=nav.room;nav.setRoom(null);inner=true;try{return f();}finally{inner=false;nav.setRoom(r);}};
 const room={inside:(x,z)=>!inner&&ST.stage>=1&&x>BB.x0&&x<BB.x1&&z>BB.z0&&z<BB.z1,
  walkable:(x,z,r=.28)=>{const rr=typeof r==='object'?r.r??.28:r;if(blocked(x,z,rr))return false;const prev=nav.room;nav.setRoom(null);inner=true;try{_wopt.r=rr;return nav.walkable(x,z,_wopt);}finally{inner=false;nav.setRoom(prev);}},
  rideable:(x,z,o={})=>{if(blocked(x,z,(o.r??.3)+.1))return false;return base(()=>nav.rideable(x,z,o));},
  floorAt:(x,z)=>base(()=>nav.groundY(x,z)),surface:(x,z)=>base(()=>nav.surface(x,z)),headingAt:null};
 // ---- stages: 0 untouched; 1 the breach (everything above, the fire spreading); 2 morning (the fire mostly out, smoke) ------
 function stage(s){ST.stage=s;const on=s>=1;for(const k of ['sams','under'])pits[k].g.visible=on;pits.sams.cut.on=pits.under.cut.on=on;
  if(H.cut){H.cut.on=on;H.g.visible=on;}if(F.cut){F.cut.on=on;F.g.visible=on;}if(POLE.cut){POLE.cut.on=on;POLE.g.visible=on;}sedan.visible=on;
  F.want=s===1?1:s===2?.22:0;if(!on){F.level=0;ST.heave=0;HV.stage='flat';HV.t=-1;pits.heave.g.visible=false;pits.heave.cut.on=false;HV.road.visible=false;heaveCar.visible=false;}
  if(s===2){HV.stage='down';pits.heave.g.visible=true;pits.heave.cut.on=true;HV.road.visible=false;heaveCar.visible=false;}
  syncCuts();}
 // the intersection: it lifts (the slabs ride up and tilt), splits, and goes down with the car; once
 function heave(){if(HV.stage!=='flat')return;HV.stage='lift';HV.t=0;pits.heave.cut.on=true;syncCuts();HV.road.visible=true;heaveCar.visible=true;const c=HV.car0;heaveCar.position.set(c.x,c.y,c.z);heaveCar.rotation.set(0,c.a,0);
  sfx('c8Rumble',pits.heave.c,{gain:1.2});}
 function update(dt,{camera=null,t=0}={}){
  F.level=damp(F.level,F.want,.25,dt);if(F.want>0)F.spread=Math.min(1,F.spread+dt/90);
  for(const f of F.flames){const on=f.spread?F.spread>.35:true,k=(f.gas?1:F.level)*(on?1:0)*(f.spread?smooth((F.spread-.35)/.4):1);f.m.material.uniforms.t.value=t+f.i*1.7;f.m.material.uniforms.k.value=k;f.m.visible=k>.02;
   if(camera){f.m.quaternion.copy(camera.quaternion);f.m.rotation.x=0;f.m.rotation.z=0;}const s=.85+.15*Math.sin(t*7+f.i)+.1*Math.sin(t*13+f.i*2);f.m.scale.set(1,s*(.6+.4*k),1);}
  if(F.light)F.light.intensity=F.g.visible?(60+30*Math.sin(t*11)+18*Math.sin(t*23))*F.level:0;
  for(const S2 of F.smoke){S2.t+=dt;if(S2.t>S2.life)S2.t-=S2.life;const k=S2.t/S2.life,c=F.center||{x:0,y:0,z:0};S2.s.position.set(c.x+Math.sin(S2.t*.3)*1.5+k*6,c.y+5+k*16,c.z+Math.cos(S2.t*.2)*1.2);const sc=4+k*14;S2.s.scale.set(sc,sc,1);S2.s.material.opacity=(F.g.visible?.55:0)*Math.sin(Math.PI*k)*Math.max(.35,F.level);}
  POLE.t+=dt;if(POLE.g.visible){const arc=Math.sin(POLE.t*31)>.55&&Math.sin(POLE.t*3.1)>-.2;for(const [i,s] of POLE.sparks.entries()){s.material.opacity=arc?.9:0;if(arc)s.position.set(POLE.tip.x+Math.sin(POLE.t*40+i)*.3,POLE.tip.y+.2+((POLE.t*7+i)%1)*.5,POLE.tip.z+Math.cos(POLE.t*37+i)*.3);}POLE.light.intensity=arc?14:0;if(arc&&Math.random()<dt*3)sfx('c8Arc',POLE.tip,{gain:.6});}
  if(HV.stage==='lift'||HV.stage==='split'||HV.stage==='fall'){HV.t+=dt;const p=pits.heave;
   if(HV.stage==='lift'){const k=smooth(HV.t/3.2);for(const s of HV.slabs){s.m.position.y=s.y0+k*(1.6-Math.hypot(s.u,s.v)*.12)+Math.sin(t*9+s.ph)*.03*k;s.m.rotation.z=k*.12*Math.sin(s.ph*2);s.m.rotation.x=k*.1*Math.cos(s.ph*3);}heaveCar.position.y=HV.car0.y+k*1.2;heaveCar.rotation.z=k*.15;if(HV.t>3.2){HV.stage='split';HV.t=0;sfx('c8Crack',p.c,{gain:1.3});}}
   else if(HV.stage==='split'){for(const s of HV.slabs){s.m.position.y-=dt*(1+HV.t*6);s.m.rotation.z+=dt*Math.sign(s.u||1)*.5;s.m.rotation.x+=dt*Math.sign(s.v||1)*.4;}if(HV.t>.35&&!p.g.visible){p.g.visible=true;}
    if(HV.t>.6){HV.stage='fall';HV.t=0;sfx('c8Collapse',p.c,{gain:1.4});}}
   else if(HV.stage==='fall'){const k=Math.min(1,HV.t/1.6);heaveCar.position.y=HV.car0.y+1.2-k*k*(p.depth+.4);heaveCar.rotation.z=.15+k*.5;heaveCar.rotation.x=-k*.7;for(const s of HV.slabs)s.m.position.y-=dt*(4+HV.t*8);if(HV.t>1.6){HV.stage='down';HV.road.visible=false;sfx('c8Impact',{x:heaveCar.position.x,y:p.c.y-p.depth,z:heaveCar.position.z},{gain:1.2});}}}
  truck.update(t,truck.g.visible);}
 // what is making noise: the fire, the gas, the main, the wires (positional loops)
 function sources(out){if(ST.stage<1)return;if(F.center)out.push({id:'c8-fire',kind:'fire',pos:new THREE.Vector3(F.center.x,F.center.y+2,F.center.z),level:.6+.6*F.level});if(F.gasAt)out.push({id:'c8-gas',kind:'gas',pos:new THREE.Vector3(F.gasAt.x,F.gasAt.y,F.gasAt.z),level:.9*F.level});
  const w=pits.sams.W(-pits.sams.a*.55,pits.sams.b*.15);out.push({id:'c8-main',kind:'water',pos:new THREE.Vector3(w.x,pits.sams.c.y-2,w.z),level:.9});}
 function show(on){if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();if(!on){stage(0);}}
 function reset(){stage(0);F.spread=0;truck.g.visible=false;if(H.jack){H.jack.position.y=H.jackAt.y;}if(H.header){H.header.rotation.z=(H.sideK||1)*.32;}if(H.door)H.door.visible=true;if(H.garage){H.garage.position.y=H.garageAt.y+.2;}}
 reset();
 // (where on the town's streets a point is, the ruin room being over all of it: the street name, d along, lat across)
 const locate=(x,z)=>room.inside(x,z)?base(()=>nav.locate(x,z)):nav.locate(x,z);
 return {root,pits,H,F,POLE,HV,sedan,heaveCar,truck,ST,room,stage,heave,update,sources,show,reset,inPit,blocked,cuts,syncCuts,addCut,P,BB,locate,base};
}
