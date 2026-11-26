// DEV benchmark (?envrepair): targeted environment repairs on top of the six Prologue benchmarks. Nothing loads without the flag.
//   1. Chain link that does not vanish: the street props' Oak Hollow chain link (the plain 0.5 alpha test, which thins the
//      wire away at a distance) gets the details kit's coverage rule: up close the usual test; once the tile is minified
//      the threshold becomes a fixed screen-space dither on the mip-averaged alpha, so a fence keeps its true average coverage
//      (a faint grey haze, as real chain link reads) without turning opaque or transparent. Same material, same draws.
//   2. Play equipment and toys: the details kit's trampolines, swing sets, big wheels and wagons swapped for the repaired
//      pieces of envrepair.kit.glb (thicker legs with sockets and feet, enclosure poles clamped to the legs, seats with
//      thickness and hangers, moulded toy bodies), in the same places (each instance moved by the difference in its lowest
//      contact, so it still meets the ground).
//   3. Contact shadows: a soft, light occlusion under the things that stand on the ground (cars, chairs, toys, grills,
//      play-equipment feet, mailboxes, bins, hydrants, pole and lamp bases, sheds): the sun's shadow map (5 cm texels) cannot
//      draw the contact itself, so small things looked set down on the lawn instead of on it. Fades out with distance.
//   4. Briarwood creek: the brush (the procedural green balls), the flat reed blades, the hard-edged mud and wet patches and
//      the algae ovals the vegetation benchmark never recorded are replaced by the vegetation library's own shrubs and
//      grasses (the same materials, wind and LODs), soft-edged ground patches, and the creek trees beyond the vegetation
//      record's 95 m scope by its street trees. Terrain, channel, culverts, railing, fences, the path, the clue and every
//      collider are untouched.
//   '  (Quote)  REPAIRED <-> AS THE SIX BENCHMARKS LEFT IT (same frame, same camera)
// (Keys checked against the game, its DEV tools and the other benchmarks' keys: Quote is bound nowhere.)
// The Prologue only, as the other benchmarks.
import * as THREE from './three.module.js';
import {loadAsset} from './asset-library.js';
import {vegUniforms,variantsOf,Field,depthMaterial} from './vegetation-assets.js';
import {MAIN} from './terrain.js';

const hash=(...v)=>{let h=2166136261;for(const x of v){h^=Math.floor(x*1000)|0;h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;};
const waitFor=async(fn,ms=60000)=>{const t0=performance.now();for(;;){const v=fn();if(v)return v;if(performance.now()-t0>ms)return null;await new Promise(r=>setTimeout(r,250));}};
const GY=(world,x,z)=>{const p=MAIN.project(x,z);return world.groundY(p.u,p.v);};

// ------------------------------------------------------------------------------------------------ 1. chain link coverage
function repairChainLink(sp){
 const m=sp?.parts?.props?.mats?.props_cut;if(!m)return null;const U={value:1};
 const before=m.onBeforeCompile,key=m.customProgramCacheKey;
 m.onBeforeCompile=sh=>{before.call(m,sh);sh.uniforms.uErChain=U;
  sh.fragmentShader='uniform float uErChain;\n'+sh.fragmentShader.replace('diffuseColor*=sampledDiffuseColor;',`diffuseColor*=sampledDiffuseColor;
    // (?envrepair) coverage-preserving cut-out for the chain link: the 0.5 test up close; minified, a screen-space dither on
    // the mip-averaged alpha (the details kit's rule), so a distant fence keeps its coverage instead of vanishing
    if(spChain&&uErChain>.5){float erLod=log2(max(max(length(dFdx(vMapUv)),length(dFdy(vMapUv)))*256.,1e-4));
     float erIgn=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
     float erThr=mix(.5,.04+.92*erIgn,smoothstep(.3,1.6,erLod));diffuseColor.a=diffuseColor.a>=erThr?1.:0.;}`);};
 m.customProgramCacheKey=()=>'ll-sp-cutout-er';m.needsUpdate=true;
 return {set:on=>{U.value=on?1:0;},material:m};}

// ------------------------------------------------------------------------------------------------ 2. play equipment, toys
// Stand a structure on every foot: fit a plane to the ground under its feet (least squares), tilt it to that plane (at most 6
// degrees: a trampoline or a swing set in a sloping yard leans with the yard), then lower or raise it so the highest-standing
// foot just touches. The details kit levels them instead (its high-side feet sank into a sloped lawn by up to 0.2 m).
function standOnFeet(M,contacts,gy){const T=THREE;const W=contacts.map(c=>new T.Vector3(c[0],c[1],c[2]).applyMatrix4(M));if(W.length<3)return M;
 let sx=0,sz=0,sxx=0,szz=0,sxz=0,sy=0,sxy=0,szy=0;const n=W.length,cx=W.reduce((a,p)=>a+p.x,0)/n,cz=W.reduce((a,p)=>a+p.z,0)/n;
 for(const p of W){const x=p.x-cx,z=p.z-cz,y=gy(p.x,p.z);sx+=x;sz+=z;sxx+=x*x;szz+=z*z;sxz+=x*z;sy+=y;sxy+=x*y;szy+=z*y;}
 const det=sxx*szz-sxz*sxz;if(Math.abs(det)<1e-9)return M;const a=(sxy*szz-szy*sxz)/det,b=(szy*sxx-sxy*sxz)/det;
 let nrm=new T.Vector3(-a,1,-b).normalize();const max=6*Math.PI/180,ang=Math.acos(Math.min(1,nrm.y));if(ang>max){const h=new T.Vector3(nrm.x,0,nrm.z).normalize();nrm=new T.Vector3(h.x*Math.sin(max),Math.cos(max),h.z*Math.sin(max));}
 const c=new T.Vector3().setFromMatrixPosition(M),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),nrm);
 const R=new T.Matrix4().makeTranslation(c.x,c.y,c.z).multiply(new T.Matrix4().makeRotationFromQuaternion(q)).multiply(new T.Matrix4().makeTranslation(-c.x,-c.y,-c.z)).multiply(M);
 let lift=-Infinity;for(const p0 of contacts){const p=new T.Vector3(p0[0],p0[1],p0[2]).applyMatrix4(R);lift=Math.max(lift,gy(p.x,p.z)-p.y);}
 return new T.Matrix4().makeTranslation(0,Math.max(-.3,Math.min(.3,lift)),0).multiply(R);}
async function repairKit({renderer,dt,world}){
 const A=await loadAsset('envrepair.kit',{renderer}),T=A.template;
 const kitContacts=JSON.parse(T.getObjectByProperty('name','envrepairkit')?.userData?.dt_contacts||(()=>{let c=null;T.traverse(o=>{if(!c&&o.userData?.dt_contacts)c=o.userData.dt_contacts;});return c;})()||'{}');
 let dtContacts={};{const D=await loadAsset('details.kit',{renderer});D.template.traverse(o=>{if(o.userData?.dt_contacts)dtContacts=JSON.parse(o.userData.dt_contacts);});}
 const prims=name=>{const node=T.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));if(!node)return null;const out=[];node.traverse(o=>{if(o.isMesh)out.push({geometry:o.geometry,mname:o.material.name});});return out;};
 const swaps=[];const keys=['trampoline','trampoline.net','swing','toy.bigwheel','toy.wagon'];const report={};
 for(const key of keys){const set=dt.sets[key];if(!set)continue;
  const lowOld=Math.min(...(dtContacts[key.replace('.net','')]||[[0,0,0]]).map(c=>c[1])),lowNew=Math.min(...(kitContacts[key.replace('.net','')]||[[0,0,0]]).map(c=>c[1]));
  const dy=lowOld-lowNew;report[key]={dy:+dy.toFixed(3),items:set.items.length,tris:{}};
  for(const {l,im} of set.meshes){const ps=prims(`${key}.lod${l}`);if(!ps)continue;const mname=im.material===dt.mats.dt_cut?'dt_cut':'dt_A';const p=ps.find(x=>x.mname===mname);if(!p)continue;
   const g=im.geometry,orig={index:g.index,attrs:{}},next={index:p.geometry.index,attrs:{}};
   // every per-vertex attribute of either version (the instanced ones, iTint and iVar, stay)
   for(const [k,a] of Object.entries(g.attributes))if(!a.isInstancedBufferAttribute)orig.attrs[k]=a;
   for(const k of new Set([...Object.keys(orig.attrs),...Object.keys(p.geometry.attributes)]))next.attrs[k]=p.geometry.attributes[k]||null;
   for(const k of Object.keys(next.attrs))if(!(k in orig.attrs))orig.attrs[k]=null;
   swaps.push({g,orig,next});report[key].tris['lod'+l+':'+mname]=(p.geometry.index?p.geometry.index.count:p.geometry.attributes.position.count)/3;}
  const mats=set.items.map(it=>it.matrix.clone()),base=key.replace('.net','');
  const shift=new THREE.Matrix4().makeTranslation(0,dy,0),feet=kitContacts[base]||[];
  const next=mats.map(m=>(base==='trampoline'||base==='swing')&&feet.length?standOnFeet(shift.clone().multiply(m),feet,(x,z)=>GY(world,x,z)):shift.clone().multiply(m));
  swaps.push({set,mats,next});}
 let on=false;
 function setOn(v){if(v===on)return;on=v;for(const s of swaps){
   if(s.g){const src=v?s.next:s.orig;for(const [k,a] of Object.entries(src.attrs)){if(a)s.g.setAttribute(k,a);else s.g.deleteAttribute(k);}s.g.setIndex(src.index);}
   else{s.set.items.forEach((it,i)=>{it.matrix.copy(v?s.next[i]:s.mats[i]);it.pos.setFromMatrixPosition(it.matrix);});s.set._moved=null;}}}
 return {setOn,report,info:A.info,contacts:kitContacts};}

// ------------------------------------------------------------------------------------------------ 3. contact shadows
function blobTexture(size=64){const d=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1,r=Math.sqrt(u*u+v*v);
 const a=Math.max(0,1-r);const val=Math.pow(a,1.6)*(1-.25*Math.pow(Math.max(0,1-r*2.2),2));const i=(y*size+x)*4;d[i]=d[i+1]=d[i+2]=255;d[i+3]=Math.round(255*Math.min(1,val*1.15));}
 const t=new THREE.DataTexture(d,size,size);t.needsUpdate=true;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;return t;}
function contactShadows({scene,world,dt,sp}){
 const recs=[];const M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),E=new THREE.Euler();
 const yawOf=m=>{m.decompose(P,Q,S);E.setFromQuaternion(Q,'YXZ');return E.y;};
 const add=(x,z,rx,rz,yaw,k,kind)=>recs.push({x,z,rx,rz,yaw,k,kind});
 const local=(m,lx,lz)=>new THREE.Vector3(lx,0,lz).applyMatrix4(m);
 const SIZES={'chair.lawn':[.42,.45,.55],'chair.resin':[.4,.42,.5],'grill':[.38,.38,.55],'toy.bigwheel':[.36,.55,.6],'toy.wagon':[.32,.62,.55],'toy.kidbike':[.45,.55,.45],'toy.scooter':[.25,.45,.45],
  'clothesline':null,'sign.post':[.16,.16,.5],'pool.kiddie':[1.12,1.12,.28]};
 if(dt){for(const [key,size] of Object.entries(SIZES)){const set=dt.sets[key];if(!set)continue;for(const it of set.items){const p=P.setFromMatrixPosition(it.matrix).clone();
   if(size)add(p.x,p.z,size[0],size[1],yawOf(it.matrix),size[2],key);}}
  for(const key of ['toy.basketball','toy.playball']){const set=dt.sets[key];if(!set)continue;for(const it of set.items){it.matrix.decompose(P,Q,S);add(P.x,P.z,S.x*1.5,S.x*1.5,0,.6,key);}}
  // trampolines: under each W-leg's feet; swing sets: under the four feet and the slide's foot
  for(const it of dt.sets['trampoline']?.items||[]){const R=1.8;for(let k=0;k<3;k++){const a0=(k*120-15)*Math.PI/180,a1=(k*120+45)*Math.PI/180;
    for(const a of [a0,a1]){const q=local(it.matrix,R*1.015*Math.cos(a),R*1.015*Math.sin(a));add(q.x,q.z,.16,.16,0,.55,'trampoline');}
    const am=(a0+a1)/2,q=local(it.matrix,R*.93*Math.cos(am),R*.93*Math.sin(am));add(q.x,q.z,.5,.14,-am,.4,'trampoline');}}
  for(const it of dt.sets['swing']?.items||[]){for(const [lx,lz] of [[-1.6,-.92],[-1.6,.92],[1.6,-.92],[1.6,.92],[1.22,-.26],[1.22,.26],[3.1,0]]){const q=local(it.matrix,lx,lz);add(q.x,q.z,.15,.15,0,.55,'swing');}}
  for(const it of dt.sets['clothesline']?.items||[]){for(const lx of [-2.2,2.2]){const q=local(it.matrix,lx,0);add(q.x,q.z,.16,.16,0,.5,'clothesline');}}
  for(const key of ['shed','shed.small']){for(const it of dt.sets[key]?.items||[]){const p=P.setFromMatrixPosition(it.matrix).clone();const big=key==='shed';add(p.x,p.z,big?1.7:1.55,big?1.5:1.35,yawOf(it.matrix),.32,key);}}}
 if(sp){const pr=sp.parts?.props,ve=sp.parts?.vehicles;
  for(const set of Object.values(ve?.sets||{}))for(const it of set.items){if(it.data?.dynamic)continue;const p=P.setFromMatrixPosition(it.matrix).clone();const L=/pickup|minivan|suv/.test(set.name)?2.7:2.45;add(p.x,p.z,1.12,L,yawOf(it.matrix),.55,'car');}
  const want=[[/mailbox/,.2,.2,.45],[/hydrant/,.26,.26,.5],[/cart|can/,.34,.34,.45],[/^pole\.shaft$/,.28,.28,.45],[/^lamp$/,.22,.22,.45],[/hoop\.base|portable/,.45,.45,.45]];
  for(const set of Object.values(pr?.sets||{})){const w=want.find(([re])=>re.test(set.name));if(!w)continue;const seen=new Set();for(const it of set.items){const p=P.setFromMatrixPosition(it.matrix);const k=Math.round(p.x*4)+':'+Math.round(p.z*4);if(seen.has(k))continue;seen.add(k);add(p.x,p.z,w[1],w[2],yawOf(it.matrix),w[3],set.name);}}}
 // one instanced quad per record, laid on the ground (tilted to its slope), multiplied onto what is under it
 const geo=new THREE.PlaneGeometry(2,2);geo.rotateX(-Math.PI/2);
 const mat=new THREE.MeshBasicMaterial({map:blobTexture(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:false});
 mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vErK;varying vec3 vErW;').replace('#include <begin_vertex>','#include <begin_vertex>\n vErK=instanceColor.r;vErW=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vErK;varying vec3 vErW;').replace('#include <opaque_fragment>',`
   float erFade=1.-smoothstep(28.,55.,distance(vErW,cameraPosition));
   float erA=diffuseColor.a*vErK*erFade;
   gl_FragColor=vec4(vec3(1.-.62*erA),1.);`);};
 mat.blending=THREE.MultiplyBlending;mat.premultipliedAlpha=true;mat.toneMapped=false;mat.customProgramCacheKey=()=>'ll-er-contact';
 const im=new THREE.InstancedMesh(geo,mat,Math.max(1,recs.length));im.name='envrepair:contact-shadows';im.frustumCulled=false;im.renderOrder=-1;im.castShadow=false;im.receiveShadow=false;
 const up=new THREE.Vector3(0,1,0),n=new THREE.Vector3(),col=new THREE.Color();
 recs.forEach((r,i)=>{const y=GY(world,r.x,r.z),e=.35;const hx=GY(world,r.x+e,r.z)-GY(world,r.x-e,r.z),hz=GY(world,r.x,r.z+e)-GY(world,r.x,r.z-e);n.set(-hx/(2*e),1,-hz/(2*e)).normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(up,n).multiply(new THREE.Quaternion().setFromAxisAngle(up,r.yaw));
  im.setMatrixAt(i,new THREE.Matrix4().compose(new THREE.Vector3(r.x,y+.012,r.z),q,new THREE.Vector3(r.rx,1,r.rz)));im.setColorAt(i,col.setRGB(r.k,0,0));});
 im.count=recs.length;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;scene.add(im);
 const kinds={};for(const r of recs)kinds[r.kind]=(kinds[r.kind]||0)+1;
 return {mesh:im,count:recs.length,kinds};}

// ------------------------------------------------------------------------------------------------ 4. Briarwood creek
function softPatchTexture(size=128,seed=3){const d=new Uint8Array(size*size*4);
 const n=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233+seed*3.1)*43758.5453;return s-Math.floor(s);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1,r=Math.sqrt(u*u+v*v),a=Math.atan2(v,u);
  const edge=.78+.12*Math.sin(a*3+seed)+.08*Math.sin(a*7+seed*2)+.05*(n(x>>3,y>>3)-.5);const al=Math.max(0,Math.min(1,(edge-r)/.22));
  const g=.85+.15*n(x>>1,y>>1);const i=(y*size+x)*4;d[i]=d[i+1]=d[i+2]=Math.round(255*g);d[i+3]=Math.round(255*al*al);}
 const t=new THREE.DataTexture(d,size,size);t.needsUpdate=true;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t;}
async function repairCreek({scene,world,renderer}){
 const R=world.er?.creek;if(!R)return null;const out={shrubs:0,grass:0,trees:0,patches:0,algae:0,skipped:[]};
 const U=vegUniforms();let gameWind=null;try{const m=world.foliage?.find(x=>typeof x.onBeforeCompile==='function');if(m){const fake={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:''};m.onBeforeCompile(fake);if(fake.uniforms.uTime&&fake.uniforms.uGust)gameWind=fake.uniforms;}}catch{}
 const fields=[],shared=new Map();const mat4=(x,y,z,rot,s,sy=s)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rot),new THREE.Vector3(s,sy,s));
 const plants=!!world.vegRecord;
 if(plants){
  const [sh,gr,tr]=await Promise.all(['veg.shrubs','veg.ground','veg.street-trees'].map(id=>loadAsset(id,{renderer})));
  const SV=[...variantsOf(sh.template,U,shared).values()],GV=variantsOf(gr.template,U,shared),TV=[...variantsOf(tr.template,U,shared).values()];
  // brush along the fences and round the grate: the library's natural shrubs (big near the grate, medium and small along the fence)
  const pick=(re)=>SV.filter(v=>re.test(v.id));const big=pick(/natural\.big/),med=pick(/natural\.medium/),small=pick(/natural\.small/);
  const shrubF=new Field(scene,'er-creek-shrubs',{dist:[20,45],hide:220,shadowLods:[0],U});
  for(const s of R.shrubs){const h=hash(s.x,s.z,1),pool=s.where==='grate'?(h<.5?big:med):(h<.45?med:small),v=pool[Math.floor(hash(s.x,s.z,2)*pool.length)];if(!v)continue;
   const w=v.info.ll_size?.[0]||1,sc=THREE.MathUtils.clamp(s.r*2.2/w,.55,1.4);shrubF.add(v,mat4(s.x,s.y-.02,s.z,hash(s.x,s.z,3)*6.28,sc,sc*(.9+.2*hash(s.x,s.z,4))),new THREE.Vector3(s.x,s.y+.5,s.z));out.shrubs++;}
  shrubF.build();fields.push(shrubF);
  // the reeds and tall weeds: tall meadow grass by the channel, long grass and dry tufts up the banks, a seed stalk here and there
  const G=id=>GV.get(id);const near=['meadow.tall.1','meadow.tall.2'],up=['grass.long.1','grass.long.2','meadow.dry.1'],acc=['weed.seedstalk.1','weed.groundcover.1'];
  const grassF=new Field(scene,'er-creek-grass',{dist:[26],hide:150,shadowLods:[],U});
  for(const w of R.weeds){const h=hash(w.x,w.z,5),list=w.bank<2.6?near:h<.12?acc:up,v=G(list[Math.floor(hash(w.x,w.z,6)*list.length)])||G('grass.long.1');if(!v)continue;
   const sc=(w.bank<2.6?1.05:.85)+.35*hash(w.x,w.z,7);grassF.add(v,mat4(w.x,w.y-.03,w.z,hash(w.x,w.z,8)*6.28,sc),new THREE.Vector3(w.x,w.y,w.z));out.grass++;
   // a little groundcover between the clumps so the banks read as continuous growth, not tufts on bare lawn
   if(h>.55){const v2=G('weed.groundcover.1')||G('grass.lawn.1');if(v2){const a=hash(w.x,w.z,9)*6.28,d=.35+.3*hash(w.z,w.x,1);grassF.add(v2,mat4(w.x+Math.cos(a)*d,w.y-.02,w.z+Math.sin(a)*d,a,.9),new THREE.Vector3(w.x,w.y,w.z));out.grass++;}}}
  grassF.build();fields.push(grassF);
  // creek trees beyond the vegetation record's scope: the street-tree library, the same species rule as the vegetation benchmark
  if(R.trees.length){const bySp={};for(const v of TV)(bySp[v.info.ll_species]||(bySp[v.info.ll_species]=[])).push(v);
   const spOf=r=>{const h=hash(r.x,r.z,7);if(r.kind==='pine')return h<.55?'pine':'spruce';if(r.kind==='birch')return 'birch';if(r.kind==='young')return 'young';if(r.kind==='oak')return 'oak';return h<.6?'maple':h<.82?'oak':'ash';};
   const treeF=new Field(scene,'er-creek-trees',{dist:[34,82],hide:900,shadowLods:[0,1],U});
   for(const r of R.trees){const list=bySp[spOf(r)];if(!list?.length){out.skipped.push('tree '+r.kind);continue;}const v=list[Math.floor(hash(r.x,r.z,13)*list.length)],crownV=v.info.ll_crown||4;
    let s=THREE.MathUtils.clamp(3.9*r.size*1.12/crownV,.62,1.3)*(.94+.12*hash(r.x,r.z,3));if(spOf(r)==='young')s=THREE.MathUtils.clamp(r.size*.9,.75,1.1);
    treeF.add(v,mat4(r.x,r.y-.02,r.z,hash(r.x,r.z,5)*6.28,s),new THREE.Vector3(r.x,r.y+4*s,r.z),{lodScale:r.lod==='mid'?.8:1});out.trees++;}
   treeF.build();fields.push(treeF);}
  for(const m of shared.values())for(const k of ['map','normalMap'])if(m[k])m[k].anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()??1);}
 else out.skipped.push('plants need ?vegetation (the creek repair extends its library)');
 // soft ground patches (damp silt, wet mud) and the algae along the channel's edges, in place of the hard-edged polygons
 const patchTex=softPatchTexture();const quad=new THREE.PlaneGeometry(2,2);quad.rotateX(-Math.PI/2);
 const pm=(color,rough)=>{const m=new THREE.MeshStandardMaterial({color,map:patchTex,roughness:rough,metalness:0,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});m.name='er:creek-ground';return m;};
 const groups=[['mud',R.patches.filter(p=>!p.wet),pm(0x7d735a,.95)],['wet',R.patches.filter(p=>p.wet),pm(0x58614b,.6)],['algae',R.algae,Object.assign(pm(0x5a6a48,.55),{opacity:.55})]];
 const meshes=[];
 for(const [name,list,m] of groups){if(!list.length)continue;const im=new THREE.InstancedMesh(quad,m,list.length);im.name='envrepair:creek-'+name;im.receiveShadow=true;im.castShadow=false;
  list.forEach((p,i)=>{const sx=name==='algae'?p.r*1.05:p.r*1.25,sz=name==='algae'?p.r*p.len*1.05:p.r*p.sy*1.25;im.setMatrixAt(i,mat4(p.x,p.y+.006,p.z,p.rot+(name==='algae'?0:hash(p.x,p.z,1)),1).multiply(new THREE.Matrix4().makeScale(sx,1,sz)));});
  im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();scene.add(im);meshes.push(im);out[name==='algae'?'algae':'patches']+=list.length;}
 const zones=new Set(['er:creek-shrub','er:creek-weed','er:creek-patch','er:creek-algae','er:creek-tree']);
 const procedural=world.merged.filter(m=>zones.has(m.userData.zone)),proxies=world.shadowProxies.filter(m=>zones.has(m.userData.zone));
 function setOn(v){for(const f of fields)f.visible=v;for(const m of meshes)m.visible=v;for(const m of procedural)m.visible=!v;for(const m of proxies)m.visible=!v;}
 const tmp=new THREE.Vector3();
 function update(camera,dt=0,sun=null){U.uTime.value=gameWind?gameWind.uTime.value:U.uTime.value+dt;U.uGust.value=gameWind?gameWind.uGust.value:.5;
  if(sun){const d=new THREE.Vector3().copy(sun.position).sub(sun.target.position).normalize().transformDirection(camera.matrixWorldInverse);U.uSunDirV.value.copy(d);U.uSunCol.value.copy(sun.color).multiplyScalar(Math.min(1.2,sun.intensity/2.7));}
  const cp=camera.getWorldPosition(tmp);for(const f of fields)if(f.visible)f.update(cp);}
 const stats=()=>{let tris=0,calls=0;for(const f of fields){const s=f.stats();tris+=s.tris;calls+=s.calls;}for(const m of meshes)if(m.visible){tris+=2*m.count;calls++;}return {tris,calls};};
 return {setOn,update,stats,out,procedural:procedural.length,proxies:proxies.length,records:{shrubs:R.shrubs.length,weeds:R.weeds.length,patches:R.patches.length,algae:R.algae.length,trees:R.trees.length}};}

// ------------------------------------------------------------------------------------------------ mount
export async function mountInGame({scene,camera,renderer,world,hemi,sun,ambient,prologue=()=>true}){
 const label=document.createElement('div');label.id='envrepair-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 const place=()=>{let y=8;for(const id of ['bike-benchmark-label','house-benchmark-label','vegetation-benchmark-label','pavement-benchmark-label','streetprops-benchmark-label','details-benchmark-label']){const o=document.getElementById(id);if(o)y=Math.max(y,o.getBoundingClientRect().bottom+6);}label.style.top=Math.round(y)+'px';};
 label.textContent='ENVIRONMENT REPAIRS (DEV): waiting for the benchmarks they repair…';document.body.appendChild(label);place();
 const t0=performance.now(),errors=[],parts={};
 // the repairs sit on the other benchmarks: wait for those that are on (each says so when it has loaded or failed)
 const on=f=>new RegExp('[?&]'+f+'\\b').test(location.search||'');
 const sp=on('streetprops')?await waitFor(()=>window.__streetprops&&(window.__streetprops.handle||window.__streetprops.error!==undefined)&&window.__streetprops,180000):null;
 const dtb=on('details')?await waitFor(()=>window.__details&&(window.__details.handle||window.__details.error)&&window.__details,180000):null;
 if(on('vegetation'))await waitFor(()=>window.__vegetation,180000);
 try{parts.chain=sp?.handle?repairChainLink(sp.handle):null;if(!parts.chain)errors.push('chain link: needs ?streetprops');}catch(e){errors.push('chain link: '+e.message);}
 try{parts.kit=dtb?.handle?await repairKit({renderer,dt:dtb.handle,world}):null;if(!parts.kit)errors.push('play equipment: needs ?details');}catch(e){errors.push('kit: '+e.message);console.error(e);}
 try{parts.contact=contactShadows({scene,world,dt:dtb?.handle||null,sp:sp?.handle||null});}catch(e){errors.push('contact shadows: '+e.message);console.error(e);}
 try{parts.creek=await repairCreek({scene,world,renderer});}catch(e){errors.push('creek: '+e.message);console.error(e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 let mode='repaired',active=null;
 function apply(){const want=mode==='repaired'&&prologue();if(want===active)return;active=want;
  parts.chain?.set(want);parts.kit?.setOn(want);if(parts.contact)parts.contact.mesh.visible=want;parts.creek?.setOn(want);
  dtb?.tick?.(true);updateLabel();}
 function setMode(m){mode=m==='original'?'original':'repaired';active=null;apply();return mode;}
 addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='Quote')setMode(mode==='repaired'?'original':'repaired');});
 function updateLabel(){place();const inP=prologue();const c=parts.creek,k=parts.kit;
  const lines=[`ENVIRONMENT REPAIRS (DEV) — ${mode==='repaired'?(inP?'REPAIRED':'repaired, but OUTSIDE THE PROLOGUE: as before'):'AS THE SIX BENCHMARKS LEFT IT'} · ready in ${loadMs} ms`,
   `chain link coverage ${parts.chain?'on the street props\' fences':'—'} · play equipment ${k?Object.entries(k.report).map(([n,r])=>`${n} ${r.items}`).join(', '):'—'} · contact shadows ${parts.contact?.count||0}`,
   c?`creek: ${c.out.shrubs} shrubs, ${c.out.grass} grass clumps, ${c.out.trees} trees, ${c.out.patches} ground patches, ${c.out.algae} algae (in place of ${c.records.shrubs} brush, ${c.records.weeds} reed clumps, ${c.records.patches} patches, ${c.records.algae} algae, ${c.records.trees} trees)${c.out.skipped.length?' · '+c.out.skipped.join('; '):''}`:'creek: —'];
  if(errors.length)lines.push('NOTES: '+errors.join(' | '));lines.push('\' repaired/as before · original work; the creek plants are the vegetation benchmark\'s own library');label.textContent=lines.join('\n');}
 let last=0,lastT=performance.now();
 const loop=now=>{apply();const dtt=Math.min(.1,(now-lastT)/1000);lastT=now;if(active)parts.creek?.update(camera,dtt,sun);if(now-last>700){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 apply();updateLabel();
 const api={parts,errors,loadMs,setMode,get mode(){return mode;},get active(){return !!active;},tick(){apply();if(active){parts.creek?.update(camera,0,sun);dtb?.tick?.(true);}},THREE};
 window.__envrepair=api;return api;
}
