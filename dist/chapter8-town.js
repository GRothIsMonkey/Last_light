// Chapter Eight: Oak Hollow Drive comes apart while the four of them walk down it (Saturday, before five). Not decoration:
// every piece here stands where the street's own pieces stood, replaces them at the moment they break, and leaves the
// street changed for the rest of the chapter (the route round it, the light, the sound, the last ride past it).
//
// The toolkit:
//  field     a stretch of the real street (road, curb, grass strip, sidewalk, lawn edge) remade as slabs over a trench dug
//            under it. The merged street inside is cut out (chapter8-ruin.js cutWorld) and the slabs sit flush where it
//            was, so the swap does not show; then they crack, heave, split, tilt and drop into the trench, staged, from a
//            point outward. The trench has walls of earth, the water main and the storm line broken open in it.
//  proxy     a house of the street rebuilt from its own plan (houses.js: size, style, roof, colours, windows, porch,
//            garage, chimney) as separate pieces with rooms behind the walls, swapped in for the merged one; it can tilt
//            and sink (its foundation going), drop its porch, open its front, cave its roof, lose its chimney, burn.
//  blowout   a real house's front windows burst outward (glass on the lawn), the dark holes left in their place.
//  pole      one of the street's utility poles leans and falls; its wires come with it, one snaps and lies arcing.
//  car       a car at the curb that slides into the trench, its alarm going.
//  power     the street lamps flicker and die, a few at a time (ambient.lampOverride).
//  fx        dust, debris, glass, sparks, spray, smoke, fire: fixed pools, nothing allocated while it runs.
//
// The set pieces (Oak Hollow Drive, from the cul-de-sac down; d is metres along the drive, lat to its right):
//  impacts   d 1105-1145: the first blows under the street. Windows of 1110 and 1114 burst, the lamps go, a crack runs
//            down the road, people come out.
//  trench    d 1050-1092: the road heaves in a long hump, splits, and goes into the storm line under it with the sidewalk
//            and the edge of two front yards; a car slides in; the pole at 1067 falls across the far sidewalk, arcing;
//            the water main bursts. The way on is along the east (right-hand) side.
//  houses    1081 (west): its porch comes down and its roof caves; 1052 (west): its foundation goes, it leans toward the
//            trench and its front opens (a lit bedroom, a living room); 1056 (east): its windows go.
//  (the Hendersons' at 1026 and Summerfield at 870 are chapter8-fall.js's, with chapter8-ruin.js's pits)
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {makeShapes,clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {makeCar} from './props.js';
import {createKit} from './kit.js';
import {utilityPole} from './chapter7-build.js';
import {surfaceMaterial} from './materials.js';
import {puffTexture} from './chapter8-presence.js';
import {HOUSE} from './palette.js';

const TAU=Math.PI*2;
const _v=new THREE.Vector3(),_v2=new THREE.Vector3(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_m=new THREE.Matrix4(),_s=new THREE.Vector3(),_e=new THREE.Euler(),_up=new THREE.Vector3(0,1,0),_ax=new THREE.Vector3();
function rng(seed){let s=(seed*2654435761)>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

export function createTown({scene,world,nav,ruin,ambient=null,sfx=()=>{}}){
 const root=new THREE.Group();root.name='chapter8-town';
 const K=makeShapes(),KT=createKit();
 const SP=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)+dy};};
 const RY=d=>-heading(d);// rotation.y of something laid along the street at d (its local x is the street's right)
 const basis=d=>{const a=heading(d);return {fx:Math.sin(a),fz:-Math.cos(a),rx:Math.cos(a),rz:Math.sin(a)};};
 const MC=new Map();
 function mat(c,o={},kind=null){const key=c+'|'+kind+'|'+JSON.stringify(o);if(MC.has(key))return MC.get(key);let m=new THREE.MeshStandardMaterial({color:c,roughness:.9,...o});if(kind)m=surfaceMaterial(m,kind);m.name='c8-town-'+(kind||'m')+'-'+c.toString(16);MC.set(key,m);return m;}
 const M={asphalt:mat(0x686b6d,{roughness:1},'asphalt'),walk:mat(0xc2bdb0,{},'concrete'),curb:mat(0xb7b3a8,{},'concrete'),grass:mat(0x6b7547,{roughness:1}),earth:mat(0x46382b,{roughness:1},'earth'),
  earthDark:mat(0x2a221b,{roughness:1}),pipe:mat(0x55504a,{roughness:.5,metalness:.4}),culvert:mat(0x6e6a60,{roughness:.95}),dark:new THREE.MeshBasicMaterial({color:0x040404}),
  water:new THREE.MeshStandardMaterial({color:0x1d2a2d,roughness:.05,metalness:.55,transparent:true,opacity:.88}),glassBroken:new THREE.MeshStandardMaterial({color:0x0c0e10,roughness:.3,metalness:.2}),
  trim:mat(HOUSE.trim??0xf2efe6),found:mat(0x9b958a,{},'concrete'),wood:mat(0x7a5a3a,{},'timber'),interior:mat(0xb8ab92,{emissive:0xffc890,emissiveIntensity:.07}),lampShade:mat(0xf6e2b8,{emissive:0xffc070,emissiveIntensity:1.4}),
  tv:mat(0x101418,{emissive:0x5f7fb8,emissiveIntensity:.8}),insul:mat(0xd8b98e,{roughness:1}),rafter:mat(0x8a6a48,{},'timber')};
 M.water.name='c8-town-water';M.glassBroken.name='c8-town-glass-broken';M.dark.name='c8-town-void';
 const P={fields:{},proxies:{},blow:{},poles:{},cars:{},events:{},log:{debris:0,glass:0,dust:0,events:[]}};
 // ==== FX pools ===================================================================================================================
 const puff=puffTexture();
 const DUST=[...Array(64)].map(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puff,color:0x8f897e,transparent:true,opacity:0,depthWrite:false}));s.visible=false;s.material.name='c8-town-dust';root.add(s);return {s,t:0,life:1,v:new THREE.Vector3(),g0:1,g1:4,a:.4};});
 let dI=0;
 function dust(at,{n=6,r=1.5,rise=.5,life=6,size=[2,7],a=.42,color=0x8f897e,spread=.5}={}){P.log.dust+=n;for(let k=0;k<n;k++){const D=DUST[dI];dI=(dI+1)%DUST.length;D.s.visible=true;D.t=0;D.life=life*(.7+Math.random()*.6);D.s.material.color.setHex(color);D.a=a;D.g0=size[0];D.g1=size[1];
   D.s.position.set(at.x+(Math.random()-.5)*2*r,at.y+.3+Math.random()*r*.4,at.z+(Math.random()-.5)*2*r);D.v.set((Math.random()-.5)*spread,rise*(.5+Math.random()),(Math.random()-.5)*spread);D.s.scale.set(D.g0,D.g0,1);}}
 const DN=220,debM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92});debM.name='c8-town-debris';
 const debris=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),debM,DN);debris.name='c8-town-debris';debris.frustumCulled=false;debris.castShadow=true;debris.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(DN*3),3);root.add(debris);
 const DEB=[...Array(DN)].map(()=>({on:false,p:new THREE.Vector3(),v:new THREE.Vector3(),r:.1,rot:new THREE.Euler(),w:new THREE.Vector3(),rest:0,floor:0}));let bI=0;
 const COL={asphalt:0x45474a,concrete:0x9a968c,earth:0x4a3b2c,wood:0x7a5a3a,brick:0x7a3e30,siding:0xc9bea6,roof:0x4d4a48,glass:0x9fb4bc};
 const _c=new THREE.Color();
 function chunks(at,{n=10,power=1,kinds=['asphalt','earth'],size=[.06,.3],up=1,floor=null,dir=null}={}){P.log.debris+=n;const f=floor??floorAt(at.x,at.z);
  for(let k=0;k<n;k++){const D=DEB[bI];debris.setColorAt(bI,_c.setHex(COL[kinds[k%kinds.length]]??0x888888));bI=(bI+1)%DN;D.on=true;D.rest=0;D.floor=f;D.p.set(at.x+(Math.random()-.5)*.8,at.y+.2+Math.random()*.4,at.z+(Math.random()-.5)*.8);
   const a=Math.random()*TAU,sp=(1.5+Math.random()*4.5)*power;D.v.set(Math.cos(a)*sp+(dir?dir.x*sp:0),(2+Math.random()*4)*power*up,Math.sin(a)*sp+(dir?dir.z*sp:0));D.r=size[0]+Math.random()*(size[1]-size[0]);D.w.set(Math.random()*9,Math.random()*9,Math.random()*9);}
  debris.instanceColor.needsUpdate=true;}
 const GN=200,glassM=new THREE.MeshStandardMaterial({color:0xaec4cc,roughness:.04,metalness:.4,side:THREE.DoubleSide,transparent:true,opacity:.75,depthWrite:false});glassM.name='c8-town-shards';
 const shardGeo=new THREE.BufferGeometry();shardGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.4,0,.5,-.5,0,.05,.6,0],3));shardGeo.computeVertexNormals();
 const glass=new THREE.InstancedMesh(shardGeo,glassM,GN);glass.name='c8-town-glass';glass.frustumCulled=false;root.add(glass);
 const GL=[...Array(GN)].map(()=>({on:false,p:new THREE.Vector3(),v:new THREE.Vector3(),r:.1,rot:new THREE.Euler(),w:new THREE.Vector3(),rest:0,floor:0}));let gI=0;
 function shards(at,{n=24,out=null,power=1}={}){P.log.glass+=n;const f=floorAt(at.x,at.z);for(let k=0;k<n;k++){const D=GL[gI];gI=(gI+1)%GN;D.on=true;D.rest=0;D.floor=f;D.p.set(at.x+(Math.random()-.5)*1.1,at.y+(Math.random()-.5)*1.1,at.z+(Math.random()-.5)*1.1);
   const sp=(1.2+Math.random()*3.5)*power;D.v.set((out?out.x:0)*sp+(Math.random()-.5)*1.5,1+Math.random()*2.5,(out?out.z:0)*sp+(Math.random()-.5)*1.5);D.r=.05+Math.random()*.16;D.w.set(Math.random()*14,Math.random()*14,Math.random()*14);}}
 const SPK=[...Array(28)].map(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({color:0xd8ecff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));s.material.name='c8-town-spark';s.visible=false;root.add(s);return {s,t:0,life:.5,v:new THREE.Vector3()};});let sI=0;
 function sparks(at,n=6){for(let k=0;k<n;k++){const S=SPK[sI];sI=(sI+1)%SPK.length;S.s.visible=true;S.t=0;S.life=.25+Math.random()*.5;S.s.position.set(at.x,at.y,at.z);S.v.set((Math.random()-.5)*5,1+Math.random()*4,(Math.random()-.5)*5);const sc=.08+Math.random()*.14;S.s.scale.set(sc,sc,1);}}
 const SPR=[...Array(70)].map(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puff,color:0xcfd8dc,transparent:true,opacity:0,depthWrite:false}));s.material.name='c8-town-spray';s.visible=false;root.add(s);return {s,t:0,life:1,v:new THREE.Vector3(),floor:0};});let wI=0;
 function spray(at,{n=3,up=9,spread=1.2,size=.6}={}){for(let k=0;k<n;k++){const S=SPR[wI];wI=(wI+1)%SPR.length;S.s.visible=true;S.t=0;S.life=1.4+Math.random()*.9;S.floor=at.y-.5;S.s.position.set(at.x+(Math.random()-.5)*.3,at.y,at.z+(Math.random()-.5)*.3);
   S.v.set((Math.random()-.5)*spread,up*(.75+Math.random()*.4),(Math.random()-.5)*spread);S.s.scale.set(size,size,1);}}
 // fire: flame cards (additive, facing you) and smoke (soft dark puffs), at any point a set piece asks for
 const flameM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{t:{value:0},k:{value:1}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 vUv;uniform float t,k;float h(vec2 p){return fract(sin(dot(p,vec2(12.9,78.2)))*43758.5);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}void main(){vec2 p=vUv;float w=1.-abs(p.x-.5)*2.;float fl=n(vec2(p.x*4.,p.y*3.-t*3.2))*.6+n(vec2(p.x*9.,p.y*7.-t*6.))*.4;float a=smoothstep(0.,.35,w)*smoothstep(1.,.15,p.y)*smoothstep(.2,.75,fl+.35*(1.-p.y))*k;vec3 c=mix(vec3(1.,.35,.05),vec3(1.,.85,.4),smoothstep(.5,1.,fl)*(1.-p.y));gl_FragColor=vec4(c*a*1.6,a);}'});
 flameM.name='c8-town-flame';
 const FIRES=[];
 function fire(at,{w=2.4,h=3,level=1,smoke=true}={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),flameM.clone());m.position.set(at.x,at.y+h/2-.3,at.z);m.name='c8-town-flame';root.add(m);
  const F={m,base:m.position.clone(),level:0,want:level,i:FIRES.length,smoke:smoke?[...Array(4)].map((_,k)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puff,color:0x1c1a19,transparent:true,opacity:0,depthWrite:false}));s.material.name='c8-town-smoke';root.add(s);return {s,t:k*2.3,life:9};}):[]};FIRES.push(F);return F;}
 // ==== where the ground is now (the trench floor inside a field that has gone) ====================================================
 function floorAt(x,z){for(const F of Object.values(P.fields)){if(!F.on||F.k<.4)continue;const q=F.local(x,z);if(q){const h=F.hole(q.d,q.lat);if(h>.06)return F.trenchY(q.d,q.lat)+.1;}}return nav.groundY(x,z);}
 // ==== the street remade as slabs over a trench ===================================================================================
 // hole(d,lat) 0 outside the opening .. 1 deepest; origin [d,lat]: where it starts (the slabs go from there outward)
 function field({name,d0,d1,l0,l1,depth=4.8,hole,origin,dc=2.5,lc=2.3,seed=7,water=.8,main=null,storm=null}){
  const R=rng(seed),F={name,d0,d1,l0,l1,depth,hole,origin,k:0,on:false,t:0,stage:'rest',g:new THREE.Group(),slabs:[],cuts:[],water:null,waterLevel:0};F.g.name='c8-field-'+name;root.add(F.g);F.g.visible=false;
  const kindAt=a=>{a=Math.abs(a);return a<4.7?'asphalt':a<5.0?'curb':a<6.35?'grass':a<7.85?'walk':'grass';};
  const edges=[l0,...[-7.85,-6.35,-5.0,-4.7,4.7,5.0,6.35,7.85].filter(e=>e>l0+.05&&e<l1-.05),l1];
  for(let d=d0;d<d1-.05;){const sd=Math.min(d1-d,dc*(.75+R()*.5));
   for(let i=0;i<edges.length-1;i++){const a=edges[i],b=edges[i+1],kind=kindAt((a+b)/2),n=kind==='asphalt'?Math.max(1,Math.round((b-a)/lc)):kind==='grass'&&b-a>2.5?2:1;
    for(let j=0;j<n;j++){const la=a+(b-a)*j/n,lb=a+(b-a)*(j+1)/n,S={kind,d:d+sd/2,lat:(la+lb)/2,sd:sd-.025,sl:lb-la-.025,th:kind==='curb'?.34:kind==='grass'?.32:kind==='walk'?.16:.24,r1:R(),r2:R(),r3:R()};F.slabs.push(S);}}
   d+=sd;}
  F.trenchY=(d,lat)=>{const h=hole(d,lat);return world.groundY(d,lat)-depth*smooth(clamp(h*1.25,0,1))-(h>.6?(Math.sin(d*1.7+lat)*.25):0);};
  // rest pose of each slab: flush with the street's own surface, tilted with it
  for(const S of F.slabs){const B=basis(S.d),c=SP(S.d,S.lat),yA=world.groundY(S.d+S.sd/2,S.lat),yB=world.groundY(S.d-S.sd/2,S.lat),yL=world.groundY(S.d,S.lat-S.sl/2),yR=world.groundY(S.d,S.lat+S.sl/2);
   S.p0=new THREE.Vector3(c.x,(yA+yB+yL+yR)/4-S.th/2+.014,c.z);
   // (the pitch is about the slab's own x (across): front edge up is a negative x rotation, as a box's -z is the street's forward)
   _e.set(-Math.atan2(yA-yB,S.sd),RY(S.d),Math.atan2(yR-yL,S.sl),'YXZ');S.q0=new THREE.Quaternion().setFromEuler(_e);S.B=B;
   S.h=hole(S.d,S.lat);S.dist=Math.hypot(S.d-origin[0],(S.lat-origin[1])*1.3);S.p=S.p0.clone();S.q=S.q0.clone();
   // where it ends up: in the hole (dropped and tumbled), on the rim (hinged down toward it), or where it was
   const gd=(hole(S.d+.6,S.lat)-hole(S.d-.6,S.lat))/1.2,gl=(hole(S.d,S.lat+.6)-hole(S.d,S.lat-.6))/1.2,gx=gd*B.fx+gl*B.rx,gz=gd*B.fz+gl*B.rz,gn=Math.hypot(gx,gz)||1;S.g=[gx/gn,gz/gn];
   if(S.h>.32){const ty=F.trenchY(S.d,S.lat);S.fall=true;S.p1=new THREE.Vector3(c.x+(S.r1-.5)*1.2-S.g[0]*.4,ty+S.th/2+.15+S.r2*.9,c.z+(S.r2-.5)*1.2-S.g[1]*.4);
    _ax.set(S.g[1],0,-S.g[0]);S.q1=new THREE.Quaternion().setFromAxisAngle(_ax,.35+S.r3*.9).multiply(_q2.setFromAxisAngle(_v.set(S.r1-.5,.2,S.r2-.5).normalize(),(S.r3-.5)*1.1)).multiply(S.q0);}
   else if(S.h>.05){S.fall=false;S.rim=true;const drop=.25+S.h*2.6;S.p1=new THREE.Vector3(S.p0.x+S.g[0]*S.h*1.6,S.p0.y-drop,S.p0.z+S.g[1]*S.h*1.6);_ax.set(S.g[1],0,-S.g[0]);S.q1=new THREE.Quaternion().setFromAxisAngle(_ax,.18+S.h*1.9+S.r3*.25).multiply(S.q0);}
   else{S.p1=S.p0.clone().add(_v.set(0,-.02*S.r1,0));S.q1=S.q0.clone();}}
  // instanced by surface
  const by={};for(const kind of ['asphalt','curb','grass','walk']){const list=F.slabs.filter(s=>s.kind===kind);if(!list.length)continue;const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M[kind],list.length);im.name='c8-field-'+name+'-'+kind;im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;F.g.add(im);by[kind]={im,list};
   if(kind==='grass'){/* (a sod slab: grass on top, earth under it: two instanced boxes, the earth slightly below) */const ea=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M.earth,list.length);ea.name='c8-field-'+name+'-sod';ea.frustumCulled=false;F.g.add(ea);by.sod={im:ea,list};}}
  F.by=by;
  // the trench under it: a bowl of earth following hole(), rough walls, the pipes and the storm line broken open in it
  {const nd=Math.ceil((d1-d0)/.9),nl=Math.ceil((l1-l0)/.75),pos=[],col=[],idx=[];for(let i=0;i<=nd;i++)for(let j=0;j<=nl;j++){const d=lerp(d0,d1,i/nd),lat=lerp(l0,l1,j/nl),h=hole(d,lat),p=SP(d,lat),y=h>.02?F.trenchY(d,lat)+(Math.sin(d*3.1+lat*2.3)*.12+Math.sin(d*7.3-lat*5.1)*.06)*smooth(h*3):world.groundY(d,lat)-.4;
    pos.push(p.x,y,p.z);const k=1-smooth(h)*.55,n=.5+.5*Math.sin(d*2.1+lat*1.7);col.push((.27+.05*n)*k,(.21+.04*n)*k,(.16+.03*n)*k);}
   for(let i=0;i<nd;i++)for(let j=0;j<nl;j++){const a=i*(nl+1)+j,b=a+1,c=a+nl+1,d=c+1;idx.push(a,c,b,b,c,d);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
   const tm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});tm.name='c8-trench';const mesh=new THREE.Mesh(geo,tm);mesh.name='c8-trench-'+name;mesh.receiveShadow=true;F.g.add(mesh);F.trench=mesh;}
  // the water main (under the west sidewalk) and the storm line (under the road): both broken where the hole is deepest
  if(main){const [la,y0]=main,dm=(d0+d1)/2;for(const [a,b] of [[d0+1,dm-2.2],[dm+1.6,d1-1]]){const A=SP(a,la),Bq=SP(b,la);K.pipe(F.g,[A.x,A.y-y0,A.z],[Bq.x,Bq.y-y0,Bq.z],.2,M.pipe,12);}F.mainEnd=(()=>{const q=SP(dm-2.2,la);return {x:q.x,y:q.y-y0,z:q.z};})();}
  if(storm){const [la,y0,w]=storm,dm=(d0+d1)/2;for(const [a,b,brk] of [[d0+.5,dm-4,0],[dm+3,d1-.5,1]]){const A=SP((a+b)/2,la);const len=b-a,box=K.box(F.g,A.x,A.y-y0,A.z,w,w*.9,len,M.culvert,{ry:RY((a+b)/2)});box.name='c8-storm-line';
    const vd=K.box(F.g,A.x,A.y-y0,A.z,w*.72,w*.66,len+.02,M.dark,{ry:RY((a+b)/2)});vd.name='c8-storm-void';}
   const mid=SP(dm,la);F.stormMouth={x:mid.x,y:mid.y-y0,z:mid.z};}
  // the water that comes up in the bottom (the main), rising once it bursts
  {const c=SP((d0+d1)/2,origin[1]),wm=new THREE.Mesh(new THREE.PlaneGeometry(1,1),M.water);wm.rotation.x=-Math.PI/2;wm.rotation.z=-RY((d0+d1)/2);wm.scale.set((l1-l0)*.62,(d1-d0)*.78,1);
   const lowest=Math.min(...F.slabs.filter(s=>s.h>.5).map(s=>F.trenchY(s.d,s.lat)),c.y-depth);wm.position.set(c.x,lowest-.4,c.z);wm.visible=false;F.g.add(wm);F.water={m:wm,y0:lowest-.2,y1:lowest+water};}
  // the merged street inside it is cut away (three boxes along the curve; the slabs overlap their edges a little)
  for(let i=0;i<3;i++){const a=lerp(d0,d1,i/3)+.35,b=lerp(d0,d1,(i+1)/3)-.35+(i===2?0:.7),dm=(a+b)/2,lm=(l0+l1)/2,c=SP(dm,lm);
   F.cuts.push(ruin.addCut(0,{x:c.x,y:c.y-2,z:c.z,sx:(l1-l0)/2-.3,sy:3.8,sz:(b-a)/2,rot:RY(dm)}));}
  // (where a point is in the field's own street coordinates, from three short straight frames along it: no allocation)
  F.frames=[0,1,2].map(i=>{const a=lerp(d0,d1,i/3),b=lerp(d0,d1,(i+1)/3),dm=(a+b)/2,c=SP(dm,0),B=basis(dm);return {a,b,dm,cx:c.x,cz:c.z,...B};});
  const LQ={d:0,lat:0};F.localQ=(x,z)=>{let best=null,bd=1e9;for(const fr of F.frames){const al=(x-fr.cx)*fr.fx+(z-fr.cz)*fr.fz,dd=fr.dm+al,e=dd<fr.a?fr.a-dd:dd>fr.b?dd-fr.b:0;if(e<bd){bd=e;best=fr;}}
   const al=(x-best.cx)*best.fx+(z-best.cz)*best.fz;LQ.d=best.dm+al;LQ.lat=(x-best.cx)*best.rx+(z-best.cz)*best.rz;return LQ;};
  F.local=(x,z)=>{const q=F.localQ(x,z);if(q.d<d0-.5||q.d>d1+.5||q.lat<l0-.5||q.lat>l1+.5)return null;return q;};
  F.place=()=>{for(const [kind,{im,list}] of Object.entries(F.by)){for(let i=0;i<list.length;i++){const S=list[i];if(kind==='sod'){_s.set(S.sl*.98,S.th*.8,S.sd*.98);_v.copy(S.p).addScaledVector(_v2.set(0,1,0).applyQuaternion(S.q),-S.th*.55);_m.compose(_v,S.q,_s);}
     else{_s.set(S.sl,kind==='grass'?.06:S.th,S.sd);if(kind==='grass'){_v.copy(S.p).addScaledVector(_v2.set(0,1,0).applyQuaternion(S.q),S.th/2-.03);_m.compose(_v,S.q,_s);}else _m.compose(S.p,S.q,_s);}
     im.setMatrixAt(i,_m);}im.instanceMatrix.needsUpdate=true;}};
  F.place();P.fields[name]=F;return F;}
 // a field's motion, from its stage and the time in it. heave: the hump comes up; split: it tears along its crown;
 // fall: the slabs over the hole go, nearest the origin first; settle: the rim lets go, piece by piece. k (0..1) is how
 // far through the whole thing it is: setting k=1 puts it at its end with nothing in between (a checkpoint resumed).
 function fieldPose(F,t){const T1=2.6,T2=3.6,T3=4.2;
  for(const S of F.slabs){const delay=S.dist/11+S.r1*.35;let lift=0,tilt=0;
   if(t<T1){const k=smooth(t/T1);lift=k*(S.h>.04?.25+S.h*.95:0)*(1-S.r2*.3);tilt=k*S.h*.22;S.p.copy(S.p0);S.p.y+=lift+Math.sin(t*19+S.r1*9)*.012*k;S.q.copy(S.q0).premultiply(_q.setFromAxisAngle(_ax.set(-S.g[1],0,S.g[0]),tilt*(S.r3-.3)));}
   else if(t<T2){const k=smooth((t-T1)/(T2-T1));lift=(S.h>.04?.25+S.h*.95:0)*(1-S.r2*.3)*(1-k*.35);S.p.copy(S.p0);S.p.y+=lift;S.p.x-=S.g[0]*k*S.h*.25;S.p.z-=S.g[1]*k*S.h*.25;
    S.q.copy(S.q0).premultiply(_q.setFromAxisAngle(_ax.set(-S.g[1],0,S.g[0]),S.h*.22*(S.r3-.3)+k*S.h*.35));}
   else{const tl=t-T3-delay*(S.fall?1:1.6)-(S.rim?.8+S.r2*1.6:0);const from=_v.copy(S.p0);from.y+=(S.h>.04?.25+S.h*.95:0)*(1-S.r2*.3)*.65;
    if(tl<=0){S.p.copy(from);S.q.copy(S.q0).premultiply(_q.setFromAxisAngle(_ax.set(-S.g[1],0,S.g[0]),S.h*.57*(S.r3>.3?1:-.4)));continue;}
    const dur=S.fall?Math.sqrt(2*Math.max(.3,from.y-S.p1.y)/9.8)+.25:1.1+S.r1*.6,k=clamp(tl/dur,0,1),kk=S.fall?k*k:ease(k);
    S.p.lerpVectors(from,S.p1,kk);if(S.fall)S.p.y=Math.max(S.p1.y,from.y-.5*9.8*tl*tl);S.q.slerpQuaternions(S.q0,S.q1,S.fall?Math.min(1,k*1.25):kk);
    if(k>=1&&!S.landed){S.landed=true;if(F.fx&&S.fall&&S.r1<.42){chunks(S.p,{n:3,power:.6,kinds:[S.kind==='asphalt'?'asphalt':'concrete','earth']});if(S.r2<.35)dust(S.p,{n:2,r:1.4,rise:.8,size:[2,6],life:5});}}}}
  F.place();}
 // ==== houses of the street, rebuilt from their plans as pieces ===================================================================
 const houseAt=(u,side)=>world.houses.filter(h=>h.frameId==='main'&&h.side===side&&!h.far).sort((a,b)=>Math.abs(a.u-u)-Math.abs(b.u-u))[0];
 function proxy(name,Q,{interior=true,seed=3}={}){if(!Q)return null;const R=rng(seed),w=Q.w,D=Q.depth,W2=w/2,D2=D/2,h=Q.h,fl=Q.floor??.34,two=Q.stories===2;
  const siding=mat(Q.wall,{},'siding'),roofM=mat(Q.roofColor,{},'roof'),doorM=mat(Q.door??0x6b4a33),shut=Q.shutters?mat(Q.shutters):null,brick=mat(0x7a3e30,{},'brick'),gdoor=mat(Q.garageColor??0xe6e2d6);
  const o=Q.toWorld(0,0),G=new THREE.Group();G.name='c8-house-'+name;const piv=new THREE.Group();piv.add(G);root.add(piv);piv.visible=false;
  const base=new THREE.Vector3(o.x,o.ground,o.z);piv.position.copy(base);piv.rotation.y=Q.worldRot;
  const X={name,Q,piv,G,parts:{},hinges:[],k:{},cut:null,on:false,w,D,h};
  const group=(parent,x,y,z,name2)=>{const g=new THREE.Group();g.position.set(x,y,z);if(name2)g.name=name2;parent.add(g);return g;};
  // foundation, and the floor(s) inside
  K.box(G,0,-.05,0,w+.12,.86,D+.12,M.found);
  // walls: the front in bays (each hinged at its foot, so it can fall outward), the sides in halves, the back whole
  const winW=two?1.1:1.3,winH=two?1.35:1.25,rows=two?[1.6,4.3]:[1.55],count=Math.max(2,Math.round(w/3.3)),t=.2;
  const bays=[];const nb=Math.max(2,Math.min(4,count));for(let i=0;i<nb;i++){const x0=-W2+w*i/nb,x1=-W2+w*(i+1)/nb;bays.push([x0,x1]);}
  X.front=[];for(const [i,[x0,x1]] of bays.entries())for(let s=0;s<(two?2:1);s++){const y0=s===0?.14:h/2+.1,y1=s===0?(two?h/2+.1:h):h,hg=group(G,(x0+x1)/2,y0,D2-t/2,'c8-bay');
   const bw=x1-x0;K.box(hg,0,(y1-y0)/2,0,bw,y1-y0,t,siding);X.front.push({g:hg,x:(x0+x1)/2,y0,s,i,r:R()});
   // windows in this bay and storey, at the plan's own places
   for(let k=0;k<count;k++){const x=-W2+w*(k+.5)/count;if(x<x0||x>=x1)continue;const y=rows[s];if(y===undefined)continue;if(s===0&&Math.abs(x-(Q.doorX??0))<1.4)continue;
    const lx=x-(x0+x1)/2,ly=y-y0;const gl=K.box(hg,lx,ly,t/2+.02,winW,winH,.05,M.glassBroken);gl.name='c8-proxy-glass';
    K.box(hg,lx,ly+winH/2+.04,t/2+.04,winW+.22,.08,.08,M.trim);K.box(hg,lx,ly-winH/2-.04,t/2+.06,winW+.32,.08,.12,M.trim);for(const sd of [-1,1])K.box(hg,lx+sd*(winW/2+.04),ly,t/2+.04,.08,winH,.08,M.trim);
    if(shut)for(const sd of [-1,1])K.box(hg,lx+sd*(winW/2+.27),ly,t/2+.05,.36,winH+.1,.05,shut);}
   if(s===0&&Q.doorX!==undefined&&Q.doorX>=x0&&Q.doorX<x1){const lx=Q.doorX-(x0+x1)/2;K.box(hg,lx,fl-y0+1.02,t/2+.03,.94,2.04,.06,doorM);K.box(hg,lx,fl-y0+2.2,t/2+.04,1.3,.1,.08,M.trim);for(const sd of [-1,1])K.box(hg,lx+sd*.58,fl-y0+1.08,t/2+.04,.1,2.2,.08,M.trim);}}
  for(const sd of [-1,1])for(const [z0,z1] of [[-D2,0],[0,D2-t]]){const hg=group(G,sd*(W2-t/2),.14,(z0+z1)/2,'c8-side');K.box(hg,0,(h-.14)/2,0,t,h-.14,z1-z0,siding);X.parts['side'+sd+(z0<0?'b':'f')]=hg;
   if(!(Q.hasGarage&&sd===Q.gs))for(const y of rows){const gl=K.box(hg,sd*(t/2+.02),y-.14,0,.05,1.2,1,M.glassBroken);gl.name='c8-proxy-glass';}}
  {const hg=group(G,0,.14,-D2+t/2,'c8-back');K.box(hg,0,(h-.14)/2,0,w,h-.14,t,siding);X.parts.back=hg;}
  for(const [x,z] of [[-1,1],[1,1],[-1,-1],[1,-1]])K.box(G,x*(W2+.01),h/2+.15,z*(D2+.01),.13,h-.3,.13,M.trim);
  // inside: floors, a dividing wall, a lamp left on, a room upstairs (seen only once the front is open)
  if(interior){K.box(G,0,fl-.04,0,w-.5,.08,D-.5,mat(0x8a7458,{},'timber'));if(two)K.box(G,0,h/2+.04,0,w-.5,.14,D-.5,mat(0x8a7458,{},'timber'));
   K.box(G,0,(two?h/2:h)/2+.1,-D2*.15,w-.5,two?h/2-.1:h-.2,.12,M.interior);K.box(G,-W2+.3,(two?h/2:h)/2+.1,0,.1,two?h/2:h-.2,D-.6,M.interior);K.box(G,W2-.3,(two?h/2:h)/2+.1,0,.1,two?h/2:h-.2,D-.6,M.interior);
   const lr=group(G,-W2*.35,fl,D2*.35,'c8-living');K.box(lr,0,.22,-.4,2,.44,.8,mat(0x5a4a6a));K.box(lr,0,.62,-.75,2,.5,.18,mat(0x5a4a6a));K.box(lr,1.7,.35,.6,.9,.7,.4,M.wood);K.box(lr,1.7,.85,.6,.7,.5,.05,M.tv);
   K.box(lr,-1.4,.7,-.5,.04,1.4,.04,mat(0x2a2a2a));K.box(lr,-1.4,1.45,-.5,.34,.28,.34,M.lampShade);
   if(two){const br=group(G,W2*.3,h/2+.1,D2*.3,'c8-bedroom');K.box(br,0,.25,-.3,1.1,.5,2,mat(0x3b5a8a));K.box(br,0,.55,-1.15,1.1,.6,.1,M.wood);K.box(br,-1.2,.45,.6,.6,.9,.45,M.wood);K.box(br,-1.2,1.05,.6,.3,.3,.3,M.lampShade);
    K.box(br,.4,1.5,-1.3,.7,.5,.02,mat(0x7a3a30));}}
  // the roof: two slopes (or four for a hip), each in two halves, each hinged at its eave
  const roofY=h,rise=Q.rise??(two?2.1:1.8),ov=.4;X.roof=[];
  const slab=(parent,len,run,ang,thick=.14)=>{const m=K.box(parent,0,0,0,len,thick,run,roofM);return m;};
  if(Q.roof==='hip'){const L=Math.hypot(rise,D2+ov),A=Math.atan2(rise,D2+ov);
   for(const fz of [1,-1])for(const sx of [-1,1]){const hg=group(G,sx*(W2+ov)/2,roofY,fz*(D2+ov),'c8-roof');hg.rotation.x=fz*A;K.box(hg,0,0,-fz*L/2,W2+ov,.14,L,roofM);X.roof.push({g:hg,fz,sx,A:fz*A,r:R()});}
   for(const sx of [-1,1]){const L2=Math.hypot(rise,W2+ov),A2=Math.atan2(rise,W2+ov);const hg=group(G,sx*(W2+ov),roofY,0,'c8-roof');hg.rotation.z=-sx*A2;K.box(hg,-sx*L2/2,0,0,L2,.13,D*.55,roofM);X.roof.push({g:hg,fz:0,sx,A:-sx*A2,side:true,r:R()});}}
  else if(Q.roof==='front'){const L=Math.hypot(rise,W2+ov),A=Math.atan2(rise,W2+ov);
   for(const sx of [-1,1])for(const fz of [1,-1]){const hg=group(G,sx*(W2+ov),roofY,fz*(D2+ov)/2,'c8-roof');hg.rotation.z=-sx*A;K.box(hg,-sx*L/2,0,0,L,.14,D2+ov,roofM);X.roof.push({g:hg,fz,sx,A:-sx*A,front:true,r:R()});}
   for(const fz of [1,-1]){const gb=new THREE.Shape();gb.moveTo(-W2,0);gb.lineTo(W2,0);gb.lineTo(0,rise-.05);gb.lineTo(-W2,0);const gm=new THREE.Mesh(new THREE.ShapeGeometry(gb),siding);gm.position.set(0,roofY,fz*(D2-.02));if(fz<0)gm.rotation.y=Math.PI;G.add(gm);X.parts['gable'+fz]=gm;}}
  else{const L=Math.hypot(rise,D2+ov),A=Math.atan2(rise,D2+ov);
   for(const fz of [1,-1])for(const sx of [-1,1]){const hg=group(G,sx*(W2+ov)/2,roofY,fz*(D2+ov),'c8-roof');hg.rotation.x=fz*A;K.box(hg,0,0,-fz*L/2,W2+ov,.14,L,roofM);X.roof.push({g:hg,fz,sx,A:fz*A,r:R()});}
   for(const sx of [-1,1]){const gb=new THREE.Shape();gb.moveTo(-D2,0);gb.lineTo(D2,0);gb.lineTo(0,rise-.05);gb.lineTo(-D2,0);const gm=new THREE.Mesh(new THREE.ShapeGeometry(gb),siding);gm.position.set(sx*(W2-.02),roofY,0);gm.rotation.y=sx*Math.PI/2;G.add(gm);X.parts['gable'+sx]=gm;}}
  // under the roof, seen when it goes: rafters and insulation
  for(let i=0;i<6;i++){const x=-W2+.4+i*(w-.8)/5;K.box(G,x,roofY+rise*.4,0,.08,.14,D*.9,M.rafter);}K.box(G,0,roofY+.05,0,w-.3,.1,D-.3,M.insul);
  // the porch (deck, posts, roof) or the stoop
  if(Q.porch==='porch'){const pw=Q.porchW??w*.6,pd=Q.pdep??2.3,dx=Q.doorX??0,pg=group(G,dx,0,D2,'c8-porch');K.box(pg,0,fl/2,pd/2,pw+.2,fl,pd,M.wood);
   const posts=[];for(const sx of [-1,1]){const pp=group(pg,sx*(pw/2-.1),fl,pd-.15,'c8-post');K.box(pp,0,1.25,0,.16,2.5,.16,M.trim);posts.push(pp);}
   const pr=group(pg,0,fl+2.55,pd,'c8-porch-roof');K.box(pr,0,.1,-pd/2,pw+.5,.18,pd+.3,roofM);X.porch={g:pg,posts,roof:pr,pw,pd};}
  else{const dx=Q.doorX??0,pg=group(G,dx,0,D2,'c8-stoop');for(let s=0;s<3;s++)K.box(pg,0,fl*(1-s/3)/2,.2+s*.3,1.6,fl*(1-s/3),.32,M.found);const aw=group(pg,0,fl+2.55,.1,'c8-awning');K.box(aw,0,0,.4,1.8,.1,.9,roofM);X.porch={g:pg,posts:[],roof:aw,pw:1.6,pd:1};}
  // the garage
  if(Q.hasGarage){const gw=Q.gw,gd=Q.gd??Math.min(D,7),gh=Q.gh??2.9,gx=Q.gx,gf=Q.gfront??D2,gz=gf-gd/2,gg=group(G,gx,0,gz,'c8-garage');
   K.box(gg,0,gh/2,0,gw,gh,gd,siding);K.box(gg,0,1.1,gd/2+.02,gw>5?5.1:2.75,2.15,.05,gdoor);for(let i=1;i<4;i++)K.box(gg,0,.1+i*.54,gd/2+.05,gw>5?5.1:2.75,.03,.03,M.trim);
   const gr=group(gg,0,gh,0,'c8-garage-roof');K.box(gr,0,.45,0,gw+.6,.14,gd+.5,roofM);gr.children[0].rotation.x=.0;X.garage={g:gg,roof:gr,gw,gd,gh,gx,gz};}
  // the chimney
  if(Q.chimney){const cx=Q.chimney==='exterior'?(Q.hasGarage?-Q.gs:1)*(W2+.42):((Q.seedC??.5)-.5)*w*.5,cz=Q.chimney==='exterior'?-D*.12:-D*.2,top=roofY+rise+.8,cg=group(G,cx,Q.chimney==='exterior'?0:roofY,cz,'c8-chimney');
   const hh=Q.chimney==='exterior'?top:top-roofY;K.box(cg,0,hh/2,0,.85,hh,.95,brick);X.chimney={g:cg,h:hh};}
  // shrubs along the front (the merged ones go with the cut)
  for(let i=0;i<5;i++){const x=-W2+.8+i*(w-1.6)/4;if(Math.abs(x-(Q.doorX??0))<1.2)continue;const b=new THREE.Mesh(new THREE.SphereGeometry(.5+R()*.25,8,6),mat(0x3e4f2c,{roughness:1}));b.position.set(x,.35,D2+.55);b.scale.y=.75;G.add(b);}
  // its cut: the whole house, porch, garage and chimney, from just above the lawn (the driveway and the walk stay)
  {const gxs=Q.hasGarage?[Q.gx-Q.gw/2-.3,Q.gx+Q.gw/2+.3]:[0,0],xa=Math.min(-W2-.9,gxs[0]),xb=Math.max(W2+.9,gxs[1]),za=-D2-.7,zb=D2+(Q.pdep??1.4)+.9,cx=(xa+xb)/2,cz=(za+zb)/2,hy=h+rise+2.2;
   const c=Q.toWorld(cx,cz);X.cut=ruin.addCut(0,{x:c.x,y:o.ground+.06+hy/2,z:c.z,sx:(xb-xa)/2,sy:hy/2,sz:(zb-za)/2,rot:Q.worldRot});X.box={xa,xb,za,zb};}
  // where its pieces are in the world, for dust and glass
  X.at=(x,y,z)=>{_v.set(x,y,z);G.localToWorld(_v);return {x:_v.x,y:_v.y,z:_v.z};};
  X.out=()=>{const a=Q.toWorld(0,0),b=Q.toWorld(0,1);return {x:b.x-a.x,z:b.z-a.z};};
  P.proxies[name]=X;return X;}
 function engage(X,on=true){if(!X)return;X.on=on;X.piv.visible=on;if(X.cut){X.cut.on=on;ruin.syncCuts();}}
 // damage, each a function of its own k (0..1) so a checkpoint can set it straight to the end
 const DMG={
  // its foundation going on the street side: the whole house tips toward the street and down
  lean(X,k,{ang=.17,sink=.5}={}){const kk=ease(k);
   // (about its back bottom edge: the street side drops, the top goes over toward the street)
   X.G.position.set(0,-sink*kk,-X.D/2);X.G.rotation.set(ang*kk,0,0);X.G.translateZ(X.D/2);},
  // the front comes off in bays: they lean out and fall flat on the lawn, the upper ones first
  facade(X,k,{only=null}={}){for(const B of X.front){if(only&&!only.includes(B.i))continue;const kb=clamp((k-(B.s===1?0:.15)-B.r*.2)/.6,0,1),e=kb*kb;B.g.rotation.x=e*(1.45+B.r*.2);B.g.position.y=B.y0-(B.s===1?e*X.h*.45:0);B.g.position.z=X.D/2-.1+e*(B.s===1?1.4:.3);}},
  // the roof: the halves over the front sag in, then drop through
  roof(X,k,{which='front'}={}){for(const Rf of X.roof){const hit=which==='all'||(which==='front'?(Rf.fz>0||Rf.front&&Rf.fz>0):which==='left'?Rf.sx<0:Rf.sx>0);if(!hit)continue;const kb=clamp((k-Rf.r*.25)/.75,0,1),e=kb*kb;
    if(Rf.front||Rf.side){Rf.g.rotation.z=(Rf.A||0)+Rf.sx*e*.9;Rf.g.position.y=X.h-e*1.6;}else{Rf.g.rotation.x=Rf.A-Rf.fz*e*.85;Rf.g.position.y=X.h-e*1.4;}}},
  porch(X,k){const Pp=X.porch;if(!Pp)return;const e=ease(k);Pp.roof.rotation.x=e*.55;Pp.roof.position.y=(X.Q.floor??.34)+2.55-e*1.5;for(const [i,p] of Pp.posts.entries()){p.rotation.z=(i?1:-1)*e*.9;p.rotation.x=e*.4;p.position.y=(X.Q.floor??.34)-e*.2;}},
  chimney(X,k){const C=X.chimney;if(!C)return;const kb=clamp(k,0,1),e=kb*kb;C.g.rotation.z=e*1.5*(X.Q.gs||1);C.g.position.y=(X.Q.chimney==='exterior'?0:X.h)-e*(X.Q.chimney==='exterior'?.3:X.h*.6);},
  garage(X,k){const Gg=X.garage;if(!Gg)return;const e=ease(k);Gg.g.rotation.z=e*.12*Math.sign(Gg.gx);Gg.g.position.y=-e*.9;Gg.roof.rotation.x=e*.35;Gg.roof.position.y=Gg.gh-e*1.3;},
 };
 function hurt(X,kind,k,o){if(!X)return;X.k[kind]=k;DMG[kind]?.(X,k,o||X.opts?.[kind]);}
 // ==== a real house's front windows, burst outward ================================================================================
 function blowout(name,Q){if(!Q)return null;const two=Q.stories===2,w=Q.w,W2=w/2,D2=Q.depth/2,winW=two?1.1:1.3,winH=two?1.35:1.25,rows=two?[1.6,4.3]:[1.55],count=Math.max(2,Math.round(w/3.3));
  const g=new THREE.Group();g.name='c8-blowout-'+name;const o=Q.toWorld(0,0);g.position.set(o.x,o.ground,o.z);g.rotation.y=Q.worldRot;g.visible=false;root.add(g);const wins=[];
  rows.forEach((y,f)=>{for(let i=0;i<count;i++){const x=-W2+w*(i+.5)/count;if(f===0&&Math.abs(x-(Q.doorX??0))<1.4)continue;const m=K.box(g,x,y,D2+.06+(Q.brick==='front'?.07:0),winW-.04,winH-.04,.02,M.glassBroken);m.name='c8-broken-window';
   // jagged teeth left in the frame
   for(let j=0;j<3;j++){const tm=new THREE.Mesh(shardGeo,glassM);tm.position.set(x-winW/2+.15+j*.4,y+winH/2-.12,D2+.09);tm.scale.set(.2,.24,1);tm.rotation.z=Math.PI+(j-1)*.4;g.add(tm);}
   wins.push({x,y});}});
  const B={name,Q,g,wins,done:false};P.blow[name]=B;return B;}
 function burst(B,{inst=false}={}){if(!B||B.done)return;B.done=true;B.g.visible=true;if(inst)return;const Q=B.Q,a=Q.toWorld(0,0),b=Q.toWorld(0,1),ox=b.x-a.x,oz=b.z-a.z;
  for(const W of B.wins){const p=Q.toWorld(W.x,Q.depth/2+.2);shards({x:p.x,y:p.ground+W.y,z:p.z},{n:8,out:{x:ox,z:oz},power:1.1});}
  sfx('c8Glass',{x:a.x,y:a.ground+2,z:a.z},{gain:1.1});}
 // ==== a utility pole of the street that leans and falls, its wires with it ==============================================================
 function pole(name,{d,lat,fallTo,neighbour=null}){const base=SP(d,lat),g=new THREE.Group();g.name='c8-pole-'+name;root.add(g);g.visible=false;
  const piv=new THREE.Group();piv.position.set(base.x,base.y,base.z);g.add(piv);const pm=utilityPole({h:9.2});piv.add(pm);
  const tgt=SP(fallTo[0],fallTo[1]),dir=new THREE.Vector3(tgt.x-base.x,0,tgt.z-base.z).normalize(),axis=new THREE.Vector3(dir.z,0,-dir.x);
  // (the crossarm faces along the street, as the street's own poles do)
  pm.rotation.y=RY(d)+Math.PI/2;
  const cut=ruin.addCut(0,{x:base.x,y:base.y+5.4,z:base.z,sx:1.35,sy:5.6,sz:1.35,rot:RY(d)});
  // the street's own wires along that side, from the next pole to this one (cut away while this one stands in)
  const nb=neighbour?SP(neighbour[0],lat):null;let wcut=null;if(nb){const md=(d+neighbour[0])/2,c=SP(md,lat);wcut=ruin.addCut(0,{x:c.x,y:c.y+8,z:c.z,sx:1.4,sy:2.2,sz:Math.abs(d-neighbour[0])/2-1.3,rot:RY(md)});}
  const wires=[-.9,0,.9].map((off,i)=>{const n=16,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array((n+1)*3),3));const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x2b2623}));l.frustumCulled=false;g.add(l);return {l,n,off,i,snapped:false,end:null};});
  const L={name,g,piv,base,dir,axis,cut,wcut,wires,nb,k:0,arc:0,tip:null,lean:0};
  L.top=(off,out=new THREE.Vector3())=>{out.set(off,8.7,0).applyAxisAngle(_up,pm.rotation.y);out.applyQuaternion(piv.quaternion).add(piv.position);return out;};
  L.update=(dt,t)=>{const k=L.k,ang=k<.3?k/.3*.12+Math.sin(t*9)*.01*k:(.12+ease((k-.3)/.7)*(Math.PI/2-.2));piv.quaternion.setFromAxisAngle(axis,ang);
   for(const W of wires){const pos=W.l.geometry.attributes.position,a=L.top(W.off,_v);const far=nb?_v2.set(nb.x+(W.off*Math.cos(RY(neighbour[0])+Math.PI/2)),nb.y+8.7,nb.z+(W.off*-Math.sin(RY(neighbour[0])+Math.PI/2))):_v2.copy(a).add(_s.set(0,-8,0));
    if(W.i!==1&&k>(W.i?.7:.62)&&!W.snapped){W.snapped=true;sparks(a,10);sfx('c8Arc',a,{gain:1});}
    for(let j=0;j<=W.n;j++){const u=j/W.n;let x=lerp(far.x,a.x,u),y=lerp(far.y,a.y,u),z=lerp(far.z,a.z,u);const sagK=Math.hypot(a.x-far.x,a.z-far.z)*.03;y-=4*sagK*u*(1-u)+(k>.3?u*u*(far.y-a.y)*0:0);
     if(W.snapped){/* the snapped one lies from the fallen top across the ground, curling */const gx=lerp(a.x,a.x+dir.x*3.5+Math.sin(j)*.4,u),gz=lerp(a.z,a.z+dir.z*3.5+Math.cos(j)*.4,u);x=gx;z=gz;y=Math.max(nav.groundY(gx,gz)+.05,lerp(a.y,nav.groundY(gx,gz)+.05,Math.min(1,u*3)));}
     y=Math.max(y,floorAt(x,z)+.04);pos.setXYZ(j,x,y,z);}
    pos.needsUpdate=true;if(W.snapped){W.end=W.end||new THREE.Vector3();W.end.set(pos.getX(W.n),pos.getY(W.n),pos.getZ(W.n));}}
   L.tip=L.top(0,new THREE.Vector3());
   if(k>=1){L.arc-=dt;if(L.arc<=0){L.arc=.8+Math.random()*2.2;const e=wires[2].end;if(e){sparks(e,7);sfx('c8Arc',e,{gain:.7});L.flash=.12;}}}if(L.flash>0)L.flash-=dt;};
  // where it lies, once it has fallen: you walk round it (and its live end)
  L.blocks=()=>{if(L.k<.95)return [];const out=[];const tip=L.top(0,_v);for(let j=0;j<=8;j++){const u=j/8;out.push({x:lerp(base.x,tip.x,u),z:lerp(base.z,tip.z,u),r:.35});}const e=wires[2].end;if(e)out.push({x:e.x,z:e.z,r:1.3});return out;};
  P.poles[name]=L;return L;}
 // ==== a car at the curb, slid into the trench ===============================================================================================
 function car(name,{d,lat,kind='sedan',color=0x6a7a8a,to=null}){const g=new THREE.Group();g.name='c8-car-'+name;makeCar(KT,g,kind,color,{lights:false});const p=SP(d,lat);g.position.set(p.x,p.y,p.z);g.rotation.y=RY(d)+(lat<0?Math.PI:0);root.add(g);g.visible=false;
  const C={name,g,p0:new THREE.Vector3(p.x,p.y,p.z),r0:g.rotation.y,to,k:0,alarm:0,blink:0};
  C.pose=k=>{const e=k*k;if(!to){return;}const q=to;g.position.set(lerp(C.p0.x,q.x,ease(k)),lerp(C.p0.y,q.y,e),lerp(C.p0.z,q.z,ease(k)));g.rotation.set(0,C.r0,0,'YXZ');g.rotateX(-(q.pitch||.6)*ease(k));g.rotateZ((q.roll||.25)*ease(k));};
  // its hazards and lights (the alarm: the indicators flashing, the horn)
  const lightM=new THREE.MeshBasicMaterial({color:0xffb030});lightM.name='c8-car-blinker';C.blinkers=[];for(const [x,z] of [[-.78,-2.2],[.78,-2.2],[-.78,2.2],[.78,2.2]]){const b=new THREE.Mesh(new THREE.BoxGeometry(.18,.1,.06),lightM.clone());b.position.set(x,.75,z);g.add(b);C.blinkers.push(b);}
  C.update=(dt,t)=>{if(C.alarm>0){C.alarm-=dt;C.blink+=dt;const on=Math.floor(C.blink*1.6)%2===0;for(const b of C.blinkers)b.material.color.setHex(on?0xffb030:0x2a1a08);if(Math.floor(C.blink*1.6)!==Math.floor((C.blink-dt)*1.6)&&on)sfx('c8Horn',g.position,{gain:.6});}else for(const b of C.blinkers)b.material.color.setHex(0x2a1a08);};
  P.cars[name]=C;return C;}
 // ==== the power going: lamps of the street, by distance along it =====================================================================
 const LAMPS=ambient?.lamps?.()||[];const lampState=new Map();
 function power(dFrom,dTo,{flick=1.2,out=true}={}){for(const l of LAMPS){if(l.frame!=='main'||l.d===undefined||l.d<Math.min(dFrom,dTo)||l.d>Math.max(dFrom,dTo))continue;lampState.set(l.i,{t:0,flick:flick*(.6+Math.random()*.8),out});}}
 function updatePower(dt){if(!ambient?.lampOverride)return;for(const [i,s] of lampState){s.t+=dt;const v=s.t<s.flick?(Math.sin(s.t*61+i)>.1?.9:.05)*(1-s.t/s.flick*.4):s.out?0:1;ambient.lampOverride.set(i,v);}}
 // ==== the set pieces =====================================================================================================================
 // hole shapes: an elongated opening down the road and over the west sidewalk, deepest along the storm line
 const trenchHole=(d,lat)=>{const u=(d-1071)/21.5,v=(lat+2.6)/5.9;const r=Math.sqrt(u*u*(1+.15*Math.sin(lat*.9))+v*v*(1+.1*Math.sin(d*.37)));return clamp(1.15-r*1.12,0,1);};
 const FIELD=field({name:'trench',d0:1047,d1:1095,l0:-8.6,l1:3.25,depth:5.2,hole:trenchHole,origin:[1072,-2.2],seed:11,main:[-6.2,1.4],storm:[-1.8,3.4,1.8],water:.9});
 // the houses: 1052 (west) leans into it; 1081 (west) loses its porch and its roof; 1056 and 1110/1114 lose their windows
 const H1052=houseAt(1052.3,-1),H1081=houseAt(1081.1,-1),H1056=houseAt(1056.4,1),H1110=houseAt(1110.2,-1),H1114=houseAt(1114.2,1),H1081e=houseAt(1081.5,1);
 const PX={lean:proxy('1052',H1052,{seed:21}),porch:proxy('1081',H1081,{seed:22})};
 const BO={b1110:blowout('1110',H1110),b1114:blowout('1114',H1114),b1056:blowout('1056',H1056),b1081e:blowout('1081e',H1081e)};
 const POLE=pole('1067',{d:1066.7,lat:-9.3,fallTo:[1062,6.5],neighbour:[1010,-9.3]});
 const CAR=car('curb',{d:1078,lat:-3.6,kind:'sedan',color:0x7a8a96,to:(()=>{const q=SP(1076.5,-2.6);return {x:q.x,y:FIELD.trenchY(1076.5,-2.6)+1.3,z:q.z,pitch:.75,roll:-.35};})()});
 const CAR2=car('drive',{d:1116,lat:9.2,kind:'wagon',color:0x8a2a26});CAR2.g.rotation.y=RY(1116)+Math.PI/2;
 // the crack that runs down the road ahead of the trench (the first blows): a dark jagged line that grows
 const crack=(()=>{// a crack down the road ahead of the trench, with branches: thin, dark, growing from the cul-de-sac end
  const lines=[];const R=rng(5);const run=(d0,d1,lat0,step,wid)=>{const pts=[];let lat=lat0;for(let d=d0;d>=d1;d-=step){lat+=(Math.sin(d*1.3)*.35+(R()-.5)*.9)*.3;lat=clamp(lat,-3.6,3.6);pts.push([d,lat,wid*(.6+R()*.8)]);}return pts;};
  const main=run(1141,1094,.4,.45,.05);lines.push(main);for(const i of [12,30,52,77]){const [d,lat]=main[Math.min(i,main.length-1)];lines.push(run(d,d-5-R()*6,lat,.35,.03));}
  const pos=[],idx=[];let base=0;for(const L of lines){for(const [d,lat,w] of L){const B=basis(d),p=SP(d,lat,.02);pos.push(p.x-B.rx*w,p.y,p.z-B.rz*w,p.x+B.rx*w,p.y,p.z+B.rz*w);}
   for(let i=0;i<L.length-1;i++){const a=base+i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}base+=L.length*2;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.setDrawRange(0,0);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x0b0a09,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.material.name='c8-crack';m.name='c8-road-crack';m.visible=false;root.add(m);return {m,n:idx.length/6+1,pts:main,k:0};})();
 // ---- the sequences: each a list of [time, step]; the step gets inst=true when a checkpoint skips straight past it ----
 const EV={};
 function ev(name,steps,{dur}={}){EV[name]={name,steps:steps.slice().sort((a,b)=>a[0]-b[0]),t:-1,i:0,dur:dur??steps[steps.length-1][0]+1,done:false};}
 const at=(d,lat,dy=0)=>SP(d,lat,dy);
 ev('impacts',[
  [0,i=>{if(!i){sfx('c8Thud',at(1120,0,-6),{gain:1.3});P.shake=.35;}power(1140,1160,{flick:1.6,out:false});}],
  [1.6,i=>{if(!i){sfx('c8Thud',at(1112,-3,-6),{gain:1.5});P.shake=.5;dust(at(1112,0),{n:4,r:4,rise:.3,size:[1.5,4],life:4,a:.3});}burst(BO.b1110,{inst:i});power(1100,1125,{flick:1.4});}],
  [2.3,i=>{burst(BO.b1114,{inst:i});if(!i){CAR2.alarm=40;}}],
  [3.2,i=>{crack.m.visible=true;if(i)crack.k=1;else sfx('c8Crack',at(1138,0),{gain:1.2});}],
  [3.4,i=>{power(1140,1175,{flick:1.2});}],
  [6.5,i=>{if(!i){sfx('c8Thud',at(1095,-2,-7),{gain:1.6});P.shake=.6;}crack.k=1;power(1030,1100,{flick:2.2});}],
 ]);
 ev('trench',[
  [0,i=>{engage(PX.lean);engage(PX.porch);FIELD.on=true;FIELD.g.visible=true;for(const c of FIELD.cuts)c.on=true;ruin.syncCuts();POLE.g.visible=true;POLE.cut.on=true;if(POLE.wcut)POLE.wcut.on=true;CAR.g.visible=true;ruin.syncCuts();FIELD.fx=!i;
   if(!i){sfx('c8Groan',at(1072,-2,-4),{gain:1.6});sfx('c8Rumble',at(1072,-2,-2),{gain:1.4});P.shake=.8;}}],
  [.3,i=>{FIELD.stage='go';FIELD.t=i?99:0;if(i){fieldPose(FIELD,99);}}],
  [2.4,i=>{if(!i){sfx('c8Crack',at(1072,-1),{gain:1.6});for(let k=0;k<5;k++)dust(at(1060+k*5,-2),{n:2,r:2.5,rise:.6,size:[2,6],life:5,a:.35});}}],
  [3.5,i=>{if(!i){sfx('c8Collapse',at(1072,-2,-2),{gain:1.8});P.shake=1;for(let k=0;k<7;k++)dust(at(1052+k*6,-2.5),{n:3,r:3,rise:1.4,size:[3,10],life:9,a:.5});}}],
  [4.4,i=>{if(!i){chunks(at(1072,-2,.5),{n:30,power:1.4,kinds:['asphalt','earth','concrete']});}}],
  [5.2,i=>{CAR.k=i?1:0;CAR.going=!i;CAR.alarm=i?0:30;if(!i)sfx('c8Metal',CAR.g.position,{gain:1.2});}],
  [5.8,i=>{POLE.going=!i;if(i)POLE.k=1;if(!i)sfx('c8Creak',POLE.base,{gain:1.4});}],
  [6.6,i=>{FIELD.burst=true;if(!i){sfx('c8Burst',FIELD.mainEnd||at(1070,-6),{gain:1.3});}}],
  [7.4,i=>{PX.porch&&(PX.porch.going=i?null:'porch');if(i){hurt(PX.porch,'porch',1);hurt(PX.porch,'roof',1,{which:'front'});}else sfx('c8Collapse',PX.porch?.at(0,2,0)||at(1081,-14),{gain:1.2});
   burst(BO.b1056,{inst:i});}],
  [8.8,i=>{if(!i&&PX.porch){PX.porch.going='roof';dust(PX.porch.at(0,3,2),{n:5,r:3,rise:.8,size:[3,9],life:8,a:.5});}if(i&&PX.porch)hurt(PX.porch,'roof',1,{which:'front'});}],
  [10,i=>{burst(BO.b1081e,{inst:i});if(!i)sfx('c8Thud',at(1080,-4,-6),{gain:1});}],
 ]);
 // the house at 1052 goes later, on its own, while you are passing it (its foundation was over the trench's rim)
 ev('lean',[
  [0,i=>{if(!i){sfx('c8Groan',PX.lean?.at(0,2,0)||at(1052,-16),{gain:1.4});sfx('c8Creak',PX.lean?.at(0,4,2)||at(1052,-16),{gain:1.2});}}],
  [1.2,i=>{PX.lean&&(PX.lean.going=i?null:'lean');if(i&&PX.lean){hurt(PX.lean,'lean',1);}}],
  [3.6,i=>{if(PX.lean)(i?hurt(PX.lean,'chimney',1):(PX.lean.going2='chimney'));if(!i)sfx('c8Collapse',PX.lean?.at(0,6,0)||at(1052,-16),{gain:1.3});}],
  [4.4,i=>{if(PX.lean){if(i){hurt(PX.lean,'facade',1);hurt(PX.lean,'porch',1);}else{PX.lean.going3='facade';sfx('c8Glass',PX.lean.at(0,3,5),{gain:1.2});}}}],
  [6.5,i=>{if(!i&&PX.lean){dust(PX.lean.at(0,2,6),{n:8,r:4,rise:1,size:[3,10],life:10,a:.55});chunks(PX.lean.at(0,2,6),{n:16,kinds:['siding','wood','concrete'],power:.8});}}],
 ]);
 function fireEv(name){const E=EV[name];if(!E||E.t>=0)return;E.t=0;E.i=0;P.log.events.push(name);}
 function skipEv(name){const E=EV[name];if(!E)return;if(E.t<0)E.t=0;for(;E.i<E.steps.length;E.i++)E.steps[E.i][1](true);E.t=E.dur;E.done=true;}
 function runEv(E,dt){if(E.t<0||E.done)return;E.t+=dt;while(E.i<E.steps.length&&E.steps[E.i][0]<=E.t){E.steps[E.i][1](false);E.i++;}if(E.t>=E.dur)E.done=true;}
 // ==== walking: what is gone (called for every walker's probes: nothing allocated) =========================================================
 const _blk=[];
 function blocked(x,z,r=.3){
  if(FIELD.on&&FIELD.k>.15){const c=FIELD.cuts[1];if(c){const dx=x-c.m.elements[12],dz=z-c.m.elements[14];if(dx*dx+dz*dz<40*40){const q=FIELD.localQ(x,z);if(q.d>FIELD.d0-1&&q.d<FIELD.d1+1){const hv=trenchHole(q.d,q.lat+(q.lat>-2.6?-r:r));if(hv>.04)return true;}}}}
  for(const X of [PX.lean,PX.porch]){if(!X?.on)continue;const o=X.Q.toWorld(0,0),dx=x-o.x,dz=z-o.z;if(dx*dx+dz*dz>30*30)continue;const c=Math.cos(X.Q.worldRot),s=Math.sin(X.Q.worldRot),lx=dx*c-dz*s,lz=dx*s+dz*c;
   if(lx>X.box.xa+.6-r&&lx<X.box.xb-.6+r&&lz>X.box.za+.6-r&&lz<X.D/2+(X.k.lean>.5?3.4:(X.porch?(X.Q.pdep??1.4):0))+r)return true;}
  if(POLE.k>.95){const L=POLE.blocks();for(let i=0;i<L.length;i++){const b=L[i];if((x-b.x)**2+(z-b.z)**2<(b.r+r)**2)return true;}}
  return false;}
 // ==== every frame ============================================================================================================================
 let T=0;
 function update(dt,{camera=null}={}){T+=dt;
  for(const E of Object.values(EV))runEv(E,dt);
  if(FIELD.stage==='go'){FIELD.t+=dt;FIELD.k=clamp(FIELD.t/9,0,1);fieldPose(FIELD,FIELD.t);if(FIELD.t>14){FIELD.stage='done';FIELD.k=1;}}
  if(FIELD.burst&&FIELD.water){const W=FIELD.water;W.m.visible=true;FIELD.waterLevel=Math.min(1,FIELD.waterLevel+dt/60);W.m.position.y=lerp(W.y0,W.y1,FIELD.waterLevel);if(FIELD.mainEnd){FIELD.sprayT=(FIELD.sprayT||0)-dt;if(FIELD.sprayT<=0){FIELD.sprayT=.05;spray(FIELD.mainEnd,{n:2,up:FIELD.waterLevel<.08?11:5.5,spread:1.6,size:.7});}}}
  if(CAR.going){CAR.k=Math.min(1,CAR.k+dt/2.6);if(CAR.k>=1){CAR.going=false;sfx('c8Impact',CAR.g.position,{gain:1.1});dust(CAR.g.position,{n:4,r:2,rise:.6,size:[2,6],life:6});}}CAR.pose(CAR.k);CAR.update(dt,T);CAR2.g.visible=FIELD.on||EV.impacts.t>=0;CAR2.update(dt,T);
  if(POLE.going){POLE.k=Math.min(1,POLE.k+dt/(POLE.k<.3?3:1.6));if(POLE.k>=1){POLE.going=false;sfx('c8Impact',POLE.tip||POLE.base,{gain:1.2});dust(POLE.tip||POLE.base,{n:4,r:1.5,rise:.5,size:[2,5],life:5});}}if(POLE.g.visible)POLE.update(dt,T);
  for(const X of Object.values(P.proxies)){if(!X.on)continue;for(const key of ['going','going2','going3']){const kind=X[key];if(!kind)continue;const kk=(X.k[kind]||0)+dt/(kind==='lean'?3.2:kind==='facade'?2.6:kind==='roof'?2.2:1.8);hurt(X,kind,Math.min(1,kk));if(kk>=1)X[key]=null;}}
  if(crack.m.visible&&crack.k<1){crack.k=Math.min(1,crack.k+dt/2.4);}crack.m.geometry.setDrawRange(0,Math.floor(crack.k*(crack.n-1))*6);
  updatePower(dt);
  // fx
  for(const D of DUST){if(!D.s.visible)continue;D.t+=dt;const k=D.t/D.life;if(k>=1){D.s.visible=false;continue;}D.s.position.addScaledVector(D.v,dt);D.v.multiplyScalar(1-dt*.35);const sc=lerp(D.g0,D.g1,1-(1-k)*(1-k));D.s.scale.set(sc,sc,1);D.s.material.opacity=D.a*Math.min(1,k*5)*(1-k)*(1-k*.3);}
  let any=false;for(let k=0;k<DN;k++){const D=DEB[k];if(!D.on){_m.makeScale(0,0,0);debris.setMatrixAt(k,_m);continue;}any=true;
   if(D.rest<1){D.v.y-=9.8*dt;D.p.addScaledVector(D.v,dt);if(D.p.y-D.r<D.floor){D.p.y=D.floor+D.r;if(Math.abs(D.v.y)<1.3){D.v.set(0,0,0);D.rest=1;}else{D.v.y*=-.3;D.v.x*=.5;D.v.z*=.5;}}D.rot.x+=D.w.x*dt;D.rot.y+=D.w.y*dt;}
   _q.setFromEuler(D.rot);_s.set(D.r,D.r*.75,D.r*1.15);_m.compose(D.p,_q,_s);debris.setMatrixAt(k,_m);}if(any)debris.instanceMatrix.needsUpdate=true;
  any=false;for(let k=0;k<GN;k++){const D=GL[k];if(!D.on){_m.makeScale(0,0,0);glass.setMatrixAt(k,_m);continue;}any=true;
   if(D.rest<1){D.v.y-=9.8*dt;D.v.multiplyScalar(1-dt*.8);D.p.addScaledVector(D.v,dt);if(D.p.y<D.floor+.01){D.p.y=D.floor+.01;D.rest=1;D.rot.x=-Math.PI/2+(Math.random()-.5)*.2;}else{D.rot.x+=D.w.x*dt;D.rot.y+=D.w.y*dt;D.rot.z+=D.w.z*dt;}}
   _q.setFromEuler(D.rot);_s.set(D.r,D.r,D.r);_m.compose(D.p,_q,_s);glass.setMatrixAt(k,_m);}if(any)glass.instanceMatrix.needsUpdate=true;
  for(const S of SPK){if(!S.s.visible)continue;S.t+=dt;if(S.t>S.life){S.s.visible=false;continue;}S.v.y-=9.8*dt;S.s.position.addScaledVector(S.v,dt);S.s.material.opacity=1-S.t/S.life;}
  for(const S of SPR){if(!S.s.visible)continue;S.t+=dt;if(S.t>S.life||S.s.position.y<S.floor){S.s.visible=false;continue;}S.v.y-=9.8*dt;S.s.position.addScaledVector(S.v,dt);const k=S.t/S.life;S.s.scale.setScalar(.5+k*1.8);S.s.material.opacity=.55*(1-k);}
  for(const F of FIRES){F.level=damp(F.level,F.want,.5,dt);F.m.material.uniforms.t.value=T+F.i*1.7;F.m.material.uniforms.k.value=F.level;F.m.visible=F.level>.02;if(camera){F.m.quaternion.copy(camera.quaternion);}
   const s=.85+.15*Math.sin(T*7+F.i)+.1*Math.sin(T*13+F.i*2);F.m.scale.set(1,s,1);for(const S of F.smoke){S.t+=dt;if(S.t>S.life)S.t-=S.life;const k=S.t/S.life;S.s.position.set(F.base.x+Math.sin(S.t*.3)*1.2+k*4,F.base.y+2+k*13,F.base.z+Math.cos(S.t*.2));S.s.scale.setScalar(3+k*11);S.s.material.opacity=.5*Math.sin(Math.PI*k)*F.level;}}
  if(P.shake>0)P.shake=Math.max(0,P.shake-dt);}
 // what is making noise (positional loops the chapter mixes): the water main, the wires, the alarm
 function sources(out){if(FIELD.burst&&FIELD.mainEnd)out.push({id:'c8-town-main',kind:'water',pos:new THREE.Vector3(FIELD.mainEnd.x,FIELD.mainEnd.y+1,FIELD.mainEnd.z),level:.6+.6*(1-FIELD.waterLevel)});
  if(POLE.k>=1&&POLE.wires[2].end)out.push({id:'c8-town-wire',kind:'arc',pos:POLE.wires[2].end.clone(),level:.5});
  for(const F of FIRES)if(F.level>.05)out.push({id:'c8-town-fire-'+F.i,kind:'fire',pos:F.base.clone(),level:.4+.5*F.level});}
 function show(on){if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();}
 function reset(){for(const E of Object.values(EV)){E.t=-1;E.i=0;E.done=false;}
  for(const F of Object.values(P.fields)){F.on=false;F.g.visible=false;F.stage='rest';F.t=0;F.k=0;F.burst=false;F.waterLevel=0;F.fx=false;F.sprayT=0;for(const c of F.cuts)c.on=false;for(const S of F.slabs){S.p.copy(S.p0);S.q.copy(S.q0);S.landed=false;}F.place();if(F.water)F.water.m.visible=false;}
  for(const X of Object.values(P.proxies)){X.going=X.going2=X.going3=null;for(const kind of Object.keys(X.k))hurt(X,kind,0);X.k={};engage(X,false);}
  for(const B of Object.values(P.blow)){B.done=false;B.g.visible=false;}
  POLE.k=0;POLE.going=false;POLE.g.visible=false;POLE.cut.on=false;if(POLE.wcut)POLE.wcut.on=false;for(const W of POLE.wires){W.snapped=false;W.end=null;}
  for(const C of Object.values(P.cars)){C.k=0;C.going=false;C.alarm=0;C.g.visible=false;C.g.position.copy(C.p0);C.g.rotation.set(0,C.r0,0);}
  crack.k=0;crack.m.visible=false;lampState.clear();ambient?.lampOverride?.clear();
  for(const D of DUST)D.s.visible=false;for(const D of DEB)D.on=false;for(const D of GL)D.on=false;for(const S of SPK)S.s.visible=false;for(const S of SPR)S.s.visible=false;
  for(const F of FIRES){F.level=0;F.m.visible=false;for(const S of F.smoke)S.s.material.opacity=0;}
  P.shake=0;P.log.events.length=0;ruin.syncCuts();}
 reset();
 Object.assign(P,{root,show,reset,update,sources,blocked,floorAt,fire:fireEv,skip:skipEv,EV,FIELD,PX,BO,POLE,CAR,CAR2,crack,proxy,engage,hurt,blowout,burst,pole,car,field,fieldPose,dust,chunks,shards,sparks,spray,flame:fire,power,SP,houseAt,
});
 Object.defineProperty(P,'stage',{get:()=>Object.fromEntries(Object.entries(EV).map(([kk,E])=>[kk,E.t<0?'waiting':E.done?'done':'running']))});
 return P;
}
