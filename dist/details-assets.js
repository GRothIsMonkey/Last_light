// Authored neighborhood details (Prologue neighborhood-details benchmark, DEV only; nothing in the story imports this
// module). Stands the Blender-built street signs, lawn and porch chairs, kettle grills, garden hoses and hose bibs, impact
// sprinklers, yard toys, kiddie pools, trampolines, swing sets, sheds, clotheslines, Briarwood's creek chain link and the
// lookout's field fence (dist/assets/details/details.kit.glb, atlases beside it) exactly where the procedural ones stand:
// world.js records them (buildWorld {details:true}: W.dt, zones 'dt:*') and this module replaces them in place.
//   * Every placement, orientation, collision and story mark comes from the record: nothing moves and nothing is added to
//     the obstacles, the navigation or the occupancy grid. The procedural objects stay baked in batches of their own and
//     come back with setAuthored(false) (the benchmark's '.' key) in the same frame, their shadows with them.
//   * Repeated things are instanced per kind and LOD (one draw per kind, LOD and material in view); near LODs cast
//     shadows. Every object is settled onto the ground it stands on (small things rest on their lowest points; level
//     structures, the trampolines, swing sets, sheds, clotheslines and pools, sink the high-side feet into the lawn
//     rather than float on the low side).
//   * Signs: the posts, the junctions' cross brackets, the street-name blades and the plates are placed from the recorded
//     post and plate groups (the same heights, the same faces); the lettering is in the sign atlas, never in geometry.
//   * Hoses: each coil lies where the procedural coil lay, its tail running to a brass hose bib on the nearest wall of its
//     house; each sprinkler gets its own hose to a bib near the facade's corner. A coil the procedural formula put inside
//     its house (where it was never seen) is left out. On the house benchmark's lots (?houses) no bib is set on the wall.
//   * The four impact sprinklers (ambient.js) keep their jets, timing and sound: only the visible head and stand change.
// Not touched: Jamie's red porch chair, Alex's house and its hose, the lookout bench, the oak and its tire swing, the
// chalk, the old bike, the friends' bikes.
import * as THREE from './three.module.js';
import {loadAsset} from './asset-library.js';
import {MAIN} from './terrain.js';
import {hash,createReflections,LodSet} from './streetprops-assets.js';

export const DT_ASSETS=['details.kit'];
const TEXTURES={
 dt:{map:'assets/details/details_albedo.jpg',orm:'assets/details/details_orm.png',normal:'assets/details/details_normal.png'},
 cut:{map:'assets/details/details_cutout.png'},
 sign:{map:'assets/details/details_signs.jpg'},
};
function urlFor(file){const packed=globalThis.__LL_ASSETS__?.[file];if(packed)return packed;if(globalThis.__LL_OFFLINE__)throw Error(`asset ${file} is not embedded in this offline package (package with PLAYTEST_MODELS=1)`);return new URL('./'+file,import.meta.url).href;}
const lin=hex=>new THREE.Color(hex);
const tintOf=hex=>{const c=lin(hex);return [c.r,c.g,c.b];};
const WHITE=[1,1,1];

async function loadTextures(renderer){
 const loader=new THREE.TextureLoader(),aniso=renderer?.capabilities?.getMaxAnisotropy?.()??1,info={files:[],gpuMB:0,aniso};
 const load=(file,srgb,{anisoMax=8}={})=>new Promise((res,rej)=>{let u;try{u=urlFor(file);}catch(e){rej(e);return;}
  loader.load(u,t=>{t.flipY=false;t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=Math.min(anisoMax,aniso);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.name=file;info.files.push({file,w:t.image.width,h:t.image.height});res(t);},undefined,()=>rej(Error('texture '+file)));});
 const tex={};
 for(const [g,T] of Object.entries(TEXTURES)){tex[g]={};for(const [k,f] of Object.entries(T))tex[g][k]=await load(f,k==='map',{anisoMax:g==='sign'?16:8});}
 info.gpuMB=+(info.files.reduce((s,f)=>s+f.w*f.h*4*4/3,0)/1048576).toFixed(1);
 return {tex,info};
}

// ------------------------------------------------------------------------------------------------ materials
// The street props' shading (streetprops-assets.js propsMaterial), with one more per-object input: iVar.w, how much soil
// shows at the object's foot (none for what lies flat in the grass or stands on a porch or a deck).
const NOISE=`float dtH(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float dtN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(dtH(i),dtH(i+vec3(1,0,0)),f.x),mix(dtH(i+vec3(0,1,0)),dtH(i+vec3(1,1,0)),f.x),f.y),mix(mix(dtH(i+vec3(0,0,1)),dtH(i+vec3(1,0,1)),f.x),mix(dtH(i+vec3(0,1,1)),dtH(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
function detailsMaterial({map,orm,normal}){
 const m=new THREE.MeshStandardMaterial({map,normalMap:normal,roughnessMap:orm,metalnessMap:orm,roughness:1,metalness:1,envMapIntensity:.8});
 m.name='dt:A';
 m.onBeforeCompile=sh=>{
  sh.vertexShader='attribute vec3 iTint;attribute vec4 iVar;varying vec3 vTint;varying vec4 vVar;varying vec3 vOP;varying vec3 vWP;\n'+sh.vertexShader
   .replace('#include <begin_vertex>','#include <begin_vertex>\n vTint=iTint;vVar=iVar;vOP=position;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n #ifdef USE_INSTANCING\n vWP=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n #else\n vWP=(modelMatrix*vec4(transformed,1.)).xyz;\n #endif');
  sh.fragmentShader='varying vec3 vTint;varying vec4 vVar;varying vec3 vOP;varying vec3 vWP;\n'+NOISE+'\n'+sh.fragmentShader
   .replace('#include <map_fragment>',`#include <map_fragment>
    float dtMask=texture2D(roughnessMap,vRoughnessMapUv).r;
    diffuseColor.rgb=mix(diffuseColor.rgb,vTint*diffuseColor.rgb*2.,dtMask);
    float dtNz=dtN(vWP*1.7+vVar.x*13.);
    // each object a little different in value and warmth; older ones duller and a little faded
    diffuseColor.rgb*=(.93+.14*fract(vVar.x*7.31))*mix(vec3(1.),vec3(1.03,1.,.95),fract(vVar.x*3.7));
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(.3,.59,.11))),vVar.y*.25);
    // soil and splash at the foot of what stands in a lawn
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.62,.57,.5),smoothstep(.14,0.,vOP.y)*(.5+.5*dtNz)*.6*vVar.w);`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=min(1.,roughnessFactor+vVar.y*.12*dtNz);`);};
 m.customProgramCacheKey=()=>'ll-dt-props';return m;
}
// Cut-outs: u >= 300 the swing chain's links, u >= 200 the enclosure netting, u >= 100 chain link; each tile repeats on its
// own (sampled with the continuous UV's derivatives, so no seam where it wraps)
function cutoutMaterial({map}){
 const m=new THREE.MeshStandardMaterial({map,alphaTest:.5,side:THREE.DoubleSide,roughness:.55,metalness:.45,envMapIntensity:.6});
 m.name='dt:cut';
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
    vec2 dtUv=vMapUv;
    if(dtUv.x>=300.)dtUv=vec2(fract(dtUv.x)*.5,.5+fract(dtUv.y)*.5);
    else if(dtUv.x>=200.)dtUv=vec2(.5+fract(dtUv.x)*.5,fract(dtUv.y)*.5);
    else if(dtUv.x>=100.)dtUv=vec2(fract(dtUv.x)*.5,fract(dtUv.y)*.5);
    vec4 sampledDiffuseColor=textureGrad(map,dtUv,dFdx(vMapUv)*.5,dFdy(vMapUv)*.5);
    diffuseColor*=sampledDiffuseColor;`);};
 m.customProgramCacheKey=()=>'ll-dt-cut';return m;
}
// Sign faces: the sign atlas (crisp lettering, anisotropic), a semi-gloss sheeting
function signMaterial({map}){const m=new THREE.MeshStandardMaterial({map,roughness:.4,metalness:0,envMapIntensity:.5});m.name='dt:sign';return m;}
// The kiddie pools' water: a thin, slightly reflective layer over the printed floor
function waterMaterial(){const m=new THREE.MeshStandardMaterial({color:0x5c9db3,roughness:.06,metalness:0,transparent:true,opacity:.55,depthWrite:false,envMapIntensity:1.2});m.name='dt:water';return m;}

// ------------------------------------------------------------------------------------------------ GLB access
function primitives(T,name){const node=T.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));if(!node)throw Error(`missing node ${name}`);const out=[];node.updateWorldMatrix(true,true);
 node.traverse(o=>{if(o.isMesh){const g=o.geometry.clone();const m=new THREE.Matrix4().copy(o.matrixWorld);if(!m.equals(new THREE.Matrix4()))g.applyMatrix4(m);out.push({geometry:g,mname:o.material?.name||''});}});return out;}

// ------------------------------------------------------------------------------------------------ hoses (generated)
// A hose as a tube along a path (n sides), every path one mesh: the runs from the coils and sprinklers to the bibs.
function tubeGeometry(paths,r,sides=6){
 const P=[],N=[],I=[];let base=0;const up=new THREE.Vector3(0,1,0),t=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3();
 for(const pts of paths){const n=pts.length;if(n<2)continue;
  for(let i=0;i<n;i++){t.subVectors(pts[Math.min(n-1,i+1)],pts[Math.max(0,i-1)]).normalize();a.crossVectors(t,up);if(a.lengthSq()<1e-6)a.set(1,0,0);a.normalize();b.crossVectors(a,t).normalize();
   for(let k=0;k<sides;k++){const th=k/sides*Math.PI*2,c=Math.cos(th),s=Math.sin(th);const nx=a.x*c+b.x*s,ny=a.y*c+b.y*s,nz=a.z*c+b.z*s;P.push(pts[i].x+nx*r,pts[i].y+ny*r,pts[i].z+nz*r);N.push(nx,ny,nz);}}
  for(let i=0;i<n-1;i++)for(let k=0;k<sides;k++){const j=(k+1)%sides,p0=base+i*sides;I.push(p0+k,p0+j,p0+sides+k,p0+j,p0+sides+j,p0+sides+k);}
  base+=n*sides;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);g.computeBoundingSphere();return g;}

const LODS={small:[18,45,140],furn:[22,55,170],struct:[35,90,280],sign:[40,110,320],fence:[18,52,190],pool:[25,70,200]};

export async function placeDetails({world,scene,renderer,camera,hemi,sun}){
 const R=world.details;if(!R)throw Error('the world was not built with the details flag (?details)');
 const t0=performance.now(),errors=[];
 const env=createReflections(renderer);
 const {tex,info:texInfo}=await loadTextures(renderer);
 const A=await loadAsset('details.kit',{renderer}),T=A.template;
 let attach=null;T.traverse(o=>{if(o.userData?.dt_attach)attach=JSON.parse(o.userData.dt_attach);});if(!attach)throw Error('details.kit.glb: no attachment table');
 const mats={dt_A:detailsMaterial(tex.dt),dt_cut:cutoutMaterial(tex.cut),dt_sign:signMaterial(tex.sign),dt_water:waterMaterial()};
 const plain=new THREE.MeshStandardMaterial({map:tex.dt.map,normalMap:tex.dt.normal,roughnessMap:tex.dt.orm,metalnessMap:tex.dt.orm,roughness:1,metalness:1,envMapIntensity:.8});plain.name='dt:plain';
 const hoseMat=new THREE.MeshStandardMaterial({color:0x32623a,roughness:.5,metalness:0,envMapIntensity:.6});hoseMat.name='dt:hose';
 const has=n=>!!T.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(n));
 const lev=name=>[0,1,2].filter(l=>has(`${name}.lod${l}`)).map(l=>primitives(T,`${name}.lod${l}`).map(p=>({geometry:p.geometry,material:mats[p.mname]||mats.dt_A,noShadow:p.mname==='dt_cut'||p.mname==='dt_water'})));
 const sets={},attrs={iTint:3,iVar:4};
 const set=(key,dist,opt={})=>sets[key]||(sets[key]=new LodSet('dt:'+key,lev(key),{dist,shadow:opt.shadow||[true,true,false],attrs,capacity:opt.capacity||16,scene}));
 const stats={},count=(k,n=1)=>stats[k]=(stats[k]||0)+n;
 const v=new THREE.Vector3(),RY=a=>new THREE.Matrix4().makeRotationY(a),TR=(x,y,z)=>new THREE.Matrix4().makeTranslation(x,y,z);
 const at=g=>{g.updateWorldMatrix(true,false);return g.matrixWorld.clone();};
 const GY=(x,z)=>{const q=MAIN.project(x,z);return world.groundY(q.u,q.v);};
 // ground contact: the lowest vertices of each piece's LOD0 (in its own frame), cached
 const lowCache={};
 const lows=key=>{if(lowCache[key])return lowCache[key];const pts=[];for(const p of primitives(T,`${key}.lod0`)){const a=p.geometry.attributes.position;const step=Math.max(1,Math.floor(a.count/1200));for(let i=0;i<a.count;i+=step)pts.push([a.getX(i),a.getY(i),a.getZ(i)]);}return lowCache[key]=pts;};
 // settle a placement onto the ground: 'rest' lifts or lowers until nothing is below the lawn and the lowest point touches;
 // 'level' (structures) lowers until no foot floats (the feet on the high side sink a little). Never more than 0.3 m.
 const settled=[];
 function settle(m,key,mode='rest',why=''){const pts=lows(key);let ymin=Infinity;const W=[];
  for(const p of pts){v.set(p[0],p[1],p[2]).applyMatrix4(m);W.push([v.x,v.y,v.z]);if(v.y<ymin)ymin=v.y;}
  const low=W.filter(p=>p[1]<ymin+.04);const step=Math.max(1,Math.floor(low.length/48)),pick=low.filter((p,i)=>i%step===0);
  if(!pick.length)return m;let dy=mode==='level'?Infinity:-Infinity;for(const p of pick){const d=GY(p[0],p[2])-p[1];dy=mode==='level'?Math.min(dy,d):Math.max(dy,d);}
  if(!Number.isFinite(dy))return m;dy=Math.max(-.3,Math.min(.3,dy));settled.push({key,dy:+dy.toFixed(3),why});return TR(0,dy,0).multiply(m);}
 const age=(...k)=>.25+.55*hash(...k),seed=(...k)=>hash(...k)*10;

 // ---------------------------------------------------------------------------------------------- signs
 for(const s of R.signs){const M=at(s.g),H=s.height;
  set('sign.post',LODS.sign).add(M.clone().multiply(TR(0,H-attach.post.top,0)),{iTint:WHITE,iVar:[seed(H,s.u||0),.45,0,1],radius:3});
  set('sign.anchor',LODS.small,{shadow:[true,false,false]}).add(M,{iTint:WHITE,iVar:[seed(s.u||0,1),.5,0,1],radius:.3});
  for(const p of s.plates){const rot=p.g.rotation.y,y=p.y;
   if(p.blade){const key='sign.blade.'+p.name.replace(/ /g,'_');set(key,LODS.sign).add(M.clone().multiply(TR(0,y,0)).multiply(RY(rot)),{iTint:WHITE,iVar:[0,0,0,0],radius:.7});count('blades');}
   else{const key={STOP:'sign.stop','SPEED LIMIT 25':'sign.speed','SLOW CHILDREN AT PLAY':'sign.children','NO OUTLET':'sign.outlet'}[p.name];
    if(!key){errors.push('unknown sign '+p.name);continue;}set(key,LODS.sign).add(M.clone().multiply(RY(rot)).multiply(TR(0,y,0)),{iTint:WHITE,iVar:[0,0,0,0],radius:.6});count('plates');}}
  if(s.type==='junction'){set('sign.bracket',LODS.small,{shadow:[true,false,false]}).add(M,{iTint:WHITE,iVar:[0,.4,0,0],radius:.5});}
  count('signs');}

 // ---------------------------------------------------------------------------------------------- chairs, grills
 for(const c of R.chairs){if(c.plan?.benchmarkZone){count('chairs-left-to-the-house-benchmark');continue;}
  const M=at(c.g),k=hash(M.elements[12],M.elements[14]);
  if(c.kind==='porch'){set('chair.resin',LODS.furn).add(M.clone().multiply(RY(Math.PI)),{iTint:WHITE,iVar:[k*10,age(k,1)*.6,0,0],radius:.6});count('porch chairs');}
  else{const resin=c.color===0xf2f0ea,key=resin?'chair.resin':'chair.lawn';
   set(key,LODS.furn).add(settle(M,key,'rest','chair'),{iTint:resin?WHITE:tintOf(c.color),iVar:[k*10,age(k,2),0,1],radius:.6});count('lawn chairs');}}
 for(const g of R.grills){const M=at(g.g);if(g.on==='patio')M.premultiply(TR(0,.1,0));
  set('grill',LODS.furn).add(M,{iTint:WHITE,iVar:[seed(M.elements[12]),age(M.elements[14]),0,0],radius:.6});count('grills');}

 // ---------------------------------------------------------------------------------------------- toys, kiddie pools
 for(const t of R.toys){const M=at(t.g),k=hash(M.elements[12],M.elements[14]);
  if(t.kind==='ball'){const c=new THREE.Vector3(...t.center).applyMatrix4(M),gy=GY(c.x,c.z);const key=t.ball==='basketball'?'toy.basketball':'toy.playball';
   const m=new THREE.Matrix4().compose(new THREE.Vector3(c.x,gy+t.r,c.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(k*3,k*7,k*5)),new THREE.Vector3(t.r,t.r,t.r));
   set(key,LODS.small).add(m,{iTint:WHITE,iVar:[k*10,age(k,3),0,0],radius:.2});count('balls');continue;}
  const key={bigwheel:'toy.bigwheel',wagon:'toy.wagon',kidbike:'toy.kidbike',scooter:'toy.scooter'}[t.kind];if(!key){errors.push('toy '+t.kind);continue;}
  const flat=t.kind==='kidbike'||t.fallen;
  set(key,LODS.small).add(settle(M,key,'rest',t.kind),{iTint:t.color!==undefined?tintOf(t.color):WHITE,iVar:[k*10,age(k,4),0,flat?0:1],radius:.8});count(t.kind);}
 for(const p of R.pools){const M=settle(at(p.g),'pool.kiddie','level','pool');
  set('pool.kiddie',LODS.pool).add(M,{iTint:WHITE,iVar:[seed(M.elements[12]),.35,0,1],radius:1.1});set('pool.water',LODS.pool,{shadow:[false,false,false]}).add(M,{iTint:WHITE,iVar:[0,0,0,0],radius:1.1});count('kiddie pools');}

 // ---------------------------------------------------------------------------------------------- back-yard structures
 for(const t of R.trampolines){const M=settle(at(t.g),'trampoline','level','trampoline'),k=hash(M.elements[12]);
  set('trampoline',LODS.struct).add(M,{iTint:WHITE,iVar:[k*10,age(k,5),0,1],radius:2.4});set('trampoline.net',LODS.struct,{shadow:[false,false,false]}).add(M,{iTint:WHITE,iVar:[0,0,0,0],radius:2.4});count('trampolines');}
 for(const s of R.swings){const M=settle(at(s.g),'swing','level','swing'),k=hash(M.elements[12]);set('swing',LODS.struct).add(M,{iTint:WHITE,iVar:[k*10,age(k,6),0,1],radius:3});count('swing sets');}
 for(const s of R.sheds){const M=at(s.g),small=s.far,k=hash(M.elements[12],M.elements[14]);const body=small?'shed.small':'shed',roof=body+'.roof';
  const Mm=small?M:settle(M,body,'level','shed');
  set(body,LODS.struct).add(Mm,{iTint:tintOf(s.wall),iVar:[k*10,age(k,7),0,1],radius:2.5});set(roof,LODS.struct).add(Mm,{iTint:tintOf(s.roof),iVar:[k*10,age(k,8),0,0],radius:2.5});count(small?'sheds behind the rear fences':'sheds');}
 for(const c of R.clotheslines){const M=settle(at(c.g),'clothesline','level','clothesline');set('clothesline',LODS.struct).add(M,{iTint:WHITE,iVar:[seed(M.elements[12]),.4,0,1],radius:2.6});count('clotheslines');}

 // ---------------------------------------------------------------------------------------------- fences
 // Briarwood's creek chain link: each bay sheared between its two posts on the ground (they follow the dip), posts
 for(const f of R.fences){const fr=f.frame;
  for(const b of f.bays){const A2=fr.point(b.ua,b.va),B2=fr.point(b.ub,b.vb),dx=B2.x-A2.x,dz=B2.z-A2.z,L=Math.hypot(dx,dz)||1;
   const m=new THREE.Matrix4().set(dx,0,-dz/L,(A2.x+B2.x)/2, B2.y-A2.y,b.H/1.2,0,(A2.y+B2.y)/2, dz,0,dx/L,(A2.z+B2.z)/2, 0,0,0,1);
   set('fence.chain',LODS.fence,{capacity:32,shadow:[true,false,false]}).add(m,{iTint:WHITE,iVar:[hash(b.ua,b.va)*10,.5,0,1],radius:1.4});count('creek fence bays');}
  for(const po of f.posts){const P2=fr.point(po.u,po.v),s=(po.H+.04)/1.05;set('post.chain',LODS.fence,{capacity:32,shadow:[true,false,false]}).add(TR(P2.x,P2.y,P2.z).multiply(new THREE.Matrix4().makeScale(1,s,1)),{iTint:WHITE,iVar:[hash(po.u,po.v)*10,.5,0,1],radius:1});count('creek fence posts');}}
 // the lookout's field fence: the same posts and rails, weathered round wood
 {const FF=R.fieldFence;if(FF){for(const p of FF.posts){const q=MAIN.point(FF.d,p.lat);set('ff.post',LODS.fence,{shadow:[true,false,false]}).add(TR(q.x,q.y+p.y,q.z).multiply(RY(hash(p.lat)*6.28)),{iTint:WHITE,iVar:[hash(p.lat)*10,.6,0,1],radius:1});count('field fence posts');}
  const wp=b=>{const q=MAIN.point(-b[2],b[0]);return new THREE.Vector3(q.x,q.y+b[1],q.z);};
  for(const r of FF.rails){const a=wp(r.a),b=wp(r.b),x=new THREE.Vector3().subVectors(b,a),L=x.length();x.divideScalar(L);const y=new THREE.Vector3(0,1,0).addScaledVector(x,-x.y).normalize(),z=new THREE.Vector3().crossVectors(x,y);
   const m=new THREE.Matrix4().makeBasis(x.clone().multiplyScalar(L),y,z).setPosition(a);set('ff.rail',LODS.fence,{shadow:[true,false,false]}).add(m,{iTint:WHITE,iVar:[hash(r.a[0],r.a[1])*10,.6,0,0],radius:1.5});count('field fence rails');}}}

 // ---------------------------------------------------------------------------------------------- hoses, bibs, sprinklers
 const runs=[],hoseInfo=[];
 const local=(P,x,z)=>{const o=P.toWorld(0,0),ex=P.toWorld(1,0),ez=P.toWorld(0,1);const ax=ex.x-o.x,az=ex.z-o.z,bx=ez.x-o.x,bz=ez.z-o.z;return {x:(x-o.x)*ax+(z-o.z)*az,z:(x-o.x)*bx+(z-o.z)*bz};};
 // the wall nearest a house-local point (outside the house box), the point on it (clear of the corners) and its normal
 function wallNear(P,lx,lz,corner=false){const hw=P.w/2,hd=P.depth/2;const c=[];
  if(lx>hw)c.push({d:lx-hw,x:hw,z:Math.max(-hd+.35,Math.min(hd-.35,lz)),n:[1,0]});
  if(lx<-hw)c.push({d:-hw-lx,x:-hw,z:Math.max(-hd+.35,Math.min(hd-.35,lz)),n:[-1,0]});
  if(lz>hd)c.push({d:lz-hd,x:corner?Math.sign(lx||1)*(hw-.35):Math.max(-hw+.35,Math.min(hw-.35,lx)),z:hd,n:[0,1]});
  if(lz<-hd)c.push({d:-hd-lz,x:Math.max(-hw+.35,Math.min(hw-.35,lx)),z:-hd,n:[0,-1]});
  return c.sort((a,b)=>a.d-b.d)[0]||null;}
 // the wall's real surface where a bib would go: a short ray back toward the house at the bib's height (brick veneer and
 // trim stand a little proud of the plan's wall; a chimney, a porch or an AC unit stands far out: then the bib moves along
 // the wall, and with nowhere clear it is left off)
 const rc=new THREE.Raycaster(),solids=world.merged.filter(m=>{const z=String(m.userData.zone||'');return !z.startsWith('dt:')&&!z.startsWith('vg:')&&!z.startsWith('sp:')&&m.geometry.boundingSphere;});
 function surfaceAt(p,n,y){const o=new THREE.Vector3(p.x+n.x*1.2,y,p.z+n.z*1.2);rc.set(o,new THREE.Vector3(-n.x,0,-n.z));rc.far=2.2;
  const c=solids.filter(m=>m.geometry.boundingSphere.center.distanceTo(o)<m.geometry.boundingSphere.radius+2.4);const h=rc.intersectObjects(c,false)[0];return h?1.2-h.distance:null;}
 function bibAt(P,w0){let w=null,off=0;const tz=[0,-.6,.6,-1.2,1.2];
  for(const t of tz){const cand={...w0,x:w0.x+(w0.n[0]?0:t),z:w0.z+(w0.n[0]?t:0)};if(Math.abs(cand.x)>P.w/2+.01||Math.abs(cand.z)>P.depth/2+.01)continue;
   const a=P.toWorld(cand.x,cand.z),b=P.toWorld(cand.x+cand.n[0],cand.z+cand.n[1]),n=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();const s=surfaceAt(a,n,GY(a.x,a.z)+attach.bibHeight);
   if(s!==null&&s>-.03&&s<.16){w=cand;off=s;break;}}
  if(!w){count('hose bibs left off (no clear wall)');return null;}
  const p=P.toWorld(w.x,w.z),q=P.toWorld(w.x+w.n[0],w.z+w.n[1]);const dir=new THREE.Vector3(q.x-p.x,0,q.z-p.z).normalize();p.x+=dir.x*off;p.z+=dir.z*off;const gy=GY(p.x,p.z);
  const M=TR(p.x,gy+attach.bibHeight,p.z).multiply(RY(Math.atan2(dir.x,dir.z)));set('hose.bib',LODS.small,{shadow:[true,false,false]}).add(M,{iTint:WHITE,iVar:[0,.4,0,0],radius:.2});count('hose bibs');
  const out=new THREE.Vector3(...attach.bibOutlet).applyMatrix4(M);return {M,out,dir,wall:new THREE.Vector3(p.x,gy,p.z)};}
 // a hose from a bib's outlet down the wall and across the lawn to a point, lying on the ground with a lazy bend
 function hoseRun(b,end,endDir=null){const r=.0095,pts=[b.out.clone()];const foot=b.wall.clone().addScaledVector(b.dir,.14);foot.y=GY(foot.x,foot.z)+r;
  pts.push(new THREE.Vector3(b.out.x,b.out.y-.12,b.out.z).addScaledVector(b.dir,.03),new THREE.Vector3(foot.x,foot.y+.12,foot.z).addScaledVector(b.dir,-.02),foot);
  const L=Math.hypot(end.x-foot.x,end.z-foot.z),n=Math.max(2,Math.ceil(L/.15)),side=new THREE.Vector3(-(end.z-foot.z),0,end.x-foot.x).normalize(),bow=(hash(end.x,end.z)-.5)*Math.min(.9,L*.25);
  for(let i=1;i<=n;i++){const t=i/n,p=new THREE.Vector3().lerpVectors(foot,end,t).addScaledVector(side,Math.sin(t*Math.PI)*bow);if(endDir&&t>.85)p.addScaledVector(endDir,-(t-.85)*.4);p.y=GY(p.x,p.z)+r+.004;pts.push(p);}
  runs.push(pts);}
 for(const h of R.hoses){const P=h.plan,hw=P.w/2,hd=P.depth/2;
  if(Math.abs(h.x)<hw-.05&&Math.abs(h.z)<hd-.05){count('hose coils inside a house (never seen): left out');continue;}
  const c=at(h.g),cw=new THREE.Vector3(c.elements[12],0,c.elements[14]);cw.y=GY(cw.x,cw.z);
  const w=P.benchmarkZone?null:wallNear(P,h.x,h.z);
  let theta=hash(cw.x,cw.z)*6.28,b=null;
  if(w)b=bibAt(P,w);
  if(b){const d=new THREE.Vector3(b.wall.x-cw.x,0,b.wall.z-cw.z).normalize();theta=Math.atan2(-d.z,d.x);}
  const M=settle(TR(cw.x,cw.y,cw.z).multiply(RY(theta)),'hose.coil','rest','hose');
  set('hose.coil',LODS.small,{shadow:[true,false,false]}).add(M,{iTint:WHITE,iVar:[hash(cw.x)*10,.4,0,0],radius:.5});count('hose coils');
  if(b){const ex=new THREE.Vector3(...attach.hoseExit).applyMatrix4(M);hoseRun(b,ex,new THREE.Vector3(Math.cos(theta),0,-Math.sin(theta)));hoseInfo.push({coil:[+cw.x.toFixed(2),+cw.z.toFixed(2)],bib:[+b.wall.x.toFixed(2),+b.wall.z.toFixed(2)]});}}
 // the sprinklers: an authored impact head on the game's own turning head, a step spike under it, a hose to the house
 const sprinklers=[];
 const headGeo=primitives(T,'sprinkler.head.lod0'),baseGeo=primitives(T,'sprinkler.base.lod0');
 const mk=(prims,name)=>{const g=new THREE.Group();g.name=name;for(const p of prims){const m=new THREE.Mesh(p.geometry,plain);m.castShadow=true;m.receiveShadow=true;g.add(m);}return g;};
 for(const s of R.sprinklers){const base=mk(baseGeo,'dt:sprinkler-base'),head=mk(headGeo,'dt:sprinkler-head');head.position.y=0;
  s.root.add(base);s.head.add(head);base.visible=head.visible=false;sprinklers.push({rec:s,base,head});count('sprinklers');
  const P=s.plan;if(P&&!P.benchmarkZone){const rw=new THREE.Vector3().setFromMatrixPosition(at(s.root)),l=local(P,rw.x,rw.z),w=wallNear(P,l.x,l.z,true);
   const b=w?bibAt(P,w):null;if(b){const barb=new THREE.Vector3(0,.15,.06).applyMatrix4(at(s.root));const pts=[];
    hoseRun(b,new THREE.Vector3(barb.x,GY(barb.x,barb.z)+.0095,barb.z));runs[runs.length-1].push(barb);count('sprinkler hoses');}}}
 const hoseMesh=new THREE.Mesh(tubeGeometry(runs,.0095,6),hoseMat);hoseMesh.name='dt:hoses';hoseMesh.castShadow=false;hoseMesh.receiveShadow=true;hoseMesh.frustumCulled=false;scene.add(hoseMesh);

 // ---------------------------------------------------------------------------------------------- what the comparison swaps
 const zones=new Set(['dt:sign','dt:chair','dt:grill','dt:toy','dt:pool','dt:hose','dt:trampoline','dt:swing','dt:shed','dt:clothesline','dt:fence','dt:fieldfence']);
 const procedural=world.merged.filter(m=>zones.has(m.userData.zone)),proxies=world.shadowProxies.filter(m=>zones.has(m.userData.zone));
 const allMats=[mats.dt_A,mats.dt_cut,mats.dt_sign,mats.dt_water,plain,hoseMat];
 function setEnv(){for(const m of allMats){const first=!m.envMap;m.envMap=env.texture;m.envMapIntensity=(m.userData.envK??=m.envMapIntensity)*env.intensity;if(first)m.needsUpdate=true;}}
 env.update(performance.now(),{hemi,fog:scene.fog?.color,sun,force:true});setEnv();
 let authored=true;
 const api={sets,errors,texInfo,env,attach,settled,hoseInfo,runs,procedural,proxies,sprinklers,hoseMesh,kinds:stats,mats,loadMs:+(performance.now()-t0).toFixed(0),
  get authored(){return authored;},
  setAuthored(on){authored=!!on;for(const s of Object.values(sets))s.setVisible(authored);for(const m of procedural)m.visible=!authored;for(const m of proxies)m.visible=!authored;
   hoseMesh.visible=authored;for(const s of sprinklers){s.base.visible=s.head.visible=authored;s.rec.stand.visible=s.rec.arm.visible=!authored;}if(authored)api.update(camera,true);},
  setLOD(n){for(const s of Object.values(sets))s.forced=n;},
  update(cam,force=false){if(env.update(performance.now(),{hemi,fog:scene.fog?.color,sun}))setEnv();if(!authored)return;for(const s of Object.values(sets))s.update(cam,force);},
  stats(){let tris=0,calls=0,instances=0;const levels=[0,0,0];for(const s of Object.values(sets)){const st=s.stats();tris+=st.tris;calls+=st.calls;instances+=st.items;st.counts.forEach((c,i)=>levels[i]+=c);}
   const hp=hoseMesh.visible?hoseMesh.geometry.index.count/3:0;return {tris:tris+hp,calls:calls+(hoseMesh.visible?1:0),instances,levels,kinds:stats,materials:allMats.length,sets:Object.keys(sets).length};}};
 api.setAuthored(true);
 return api;
}
