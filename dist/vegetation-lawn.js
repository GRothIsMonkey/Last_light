// Lawns and ground: the grass-and-ground repair of the Prologue vegetation benchmark (DEV only, with ?vegetation).
//
// Why the first benchmark's lawns read as "a flat green slab with clumps on it": the ground was one flat colour with a few
// large noise blotches, and the 3D grass was ~3,000 separate tufts of big blades, each a little bush standing on that
// colour; nothing tied the two together, so every tuft read as an island. This module:
//   * makes the GROUND grass: the lawn material (streets.js grassMats) gets a world-space grass surface: authored top-down
//     blade textures (veg.lawn.glb, 0.5 m and 1.37 m tiles, the second turned 37 degrees, blended by their height so
//     neither tiling shows), their normal maps, a fine mottling, and only very restrained broad variation; per house lot
//     a care level (mown short and even with faint mowing stripes / average with clover and thin spots / longer and drier),
//     the lookout's long grass, its trodden way, the swing's bare patch and the root zone under the oak;
//   * grows CONTINUOUS short blades out of it near the camera: 1 m world-aligned tiles of ~780 fine blades (veg.lawn
//     lawn.tile) instanced on every lawn cell within 13 m; each blade takes its colour from the ground under its own root
//     (the same GLSL as the ground), so blades and ground are one material; blades thin out with distance by a fixed
//     per-blade rank (blue-noise ordered), each shrinking smoothly to nothing, so there is no ring, no line, no popping,
//     and a sparser tile LOD is just a prefix of the same blades; edge cells carry an 8 x 8 mask (12.5 cm) so blades stop
//     at walks, porches, beds, posts and trunks without a stamped edge;
//   * keeps the first benchmark's lawn (mode B) and the original procedural lawn (mode A) selectable in the same frame.
import * as THREE from './three.module.js';
import {roadFrame} from './route.js';
import {MAIN,LAWN} from './terrain.js';
import {LOOKOUT} from './layout.js';

const hash=(...v)=>{let h=2166136261;for(const x of v){h^=Math.floor(x*1000)|0;h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;};
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
function vnoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const h=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
 return (h(ix,iy)*(1-u)+h(ix+1,iy)*u)*(1-v)+(h(ix,iy+1)*(1-u)+h(ix+1,iy+1)*u)*v;}

// ------------------------------------------------------------------------------------------------ the shared GLSL
// lawnPlace(xz): the lawn's own colour and state at a place, before the fine blade detail. The ground multiplies it by
// the detail textures (mean 1); every blade takes it at its root. Broad variation is kept to a few percent.
export const LAWN_GLSL=`
uniform sampler2D uCareMap,uLookMap;uniform vec4 uCareBox,uLookBox;uniform vec3 uLawnKeep,uLawnRough,uLawnWild,uLawnSoil,uLawnStraw,uLawnClover;
float lhash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float lnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(lhash(i),lhash(i+vec2(1,0)),f.x),mix(lhash(i+vec2(0,1)),lhash(i+vec2(1,1)),f.x),f.y);}
float lfbm(vec2 p){return .5*lnoise(p)+.3*lnoise(p*2.03+7.1)+.2*lnoise(p*4.07+3.3);}
struct LawnPlace{vec3 col;float care;float wild;float wear;float trample;float shade;float clover;float dry;float thin;float stripe;vec2 sdir;};
LawnPlace lawnPlace(vec2 xz){LawnPlace L;
 vec2 cu=(xz-uCareBox.xy)*uCareBox.zw;vec4 c=(cu.x>0.&&cu.y>0.&&cu.x<1.&&cu.y<1.)?texture(uCareMap,cu):vec4(.45,0.,0.,.3);
 vec2 lu=(xz-uLookBox.xy)*uLookBox.zw;vec4 k=(lu.x>0.&&lu.y>0.&&lu.x<1.&&lu.y<1.)?texture(uLookMap,lu):vec4(0.);
 L.care=c.r;L.wild=k.a;L.wear=k.r;L.trample=k.g;L.shade=k.b;
 float ang=c.b*3.14159265;L.sdir=vec2(cos(ang),sin(ang));
 // mowing stripes (a mower's width, alternate directions; how bright depends on the view, so this is only the sign)
 L.stripe=c.g*(step(.5,fract(dot(xz,L.sdir)/1.1))*2.-1.);
 // the lot's grass: kept short and even .. longer, lighter and yellower; the lookout's long grass
 vec3 col=mix(uLawnKeep,uLawnRough,smoothstep(0.,1.,c.r));
 // broad variation: a few percent only (no blotches)
 float b1=lfbm(xz*.06),b2=lfbm(xz*.23+11.);
 col*=.965+.07*b1;col=mix(col,col*vec3(1.05,1.02,.9),(b2-.5)*.5);
 // small dry spots and thin spots, rarer and fainter on kept lawns
 L.dry=smoothstep(.70,.86,lfbm(xz*.33+5.))*(.15+.85*c.r);
 L.thin=smoothstep(.72,.88,lfbm(xz*.55+9.))*(.1+.9*c.r);
 col=mix(col,uLawnStraw,L.dry*.32);
 // clover patches on the lots that have it
 L.clover=c.a*smoothstep(.56,.74,lfbm(xz*.8+c.a*40.));
 col=mix(col,uLawnClover,L.clover*.45);
 // the lookout: long grass, trodden flat and lighter where walked, darker and thinner in the oak's shade
 vec3 wild=uLawnWild*(.93+.14*lfbm(xz*.31+2.));
 col=mix(col,wild,L.wild);
 col=mix(col,col*vec3(1.1,1.06,.82),L.trample*.55);
 col*=1.-.18*L.shade;
 L.col=col;return L;}
`;

// ------------------------------------------------------------------------------------------------ the maps
// care map (Oak Hollow Drive and its yards, 1 m texels): R care (0 kept .. 1 rough), G stripe strength, B stripe angle / pi,
// A clover. Lots: each house's lot runs halfway to its neighbours on the same side.
function careMap(world){
 const houses=(world.houses||[]).filter(h=>h.frameId==='main'),sides={'-1':[],'1':[]};
 for(const h of houses)sides[h.side>0?'1':'-1'].push(h.dc??h.u);for(const k in sides)sides[k].sort((a,b)=>a-b);
 const lotOf=(d,lat)=>{const L=sides[lat>0?'1':'-1'];let i=0;while(i<L.length-1&&d>(L[i]+L[i+1])/2)i++;return (lat>0?1000:0)+i;};
 const params=new Map();
 const P=lot=>{if(params.has(lot))return params.get(lot);const h1=hash(lot,1.7),h2=hash(lot,2.9),h3=hash(lot,4.3);let p;
  if(h1<.38)p={care:.04+.14*h2,stripe:h3<.62?.75+.25*h2:0,clover:.04,along:h3<.3};
  else if(h1<.82)p={care:.34+.26*h2,stripe:h3<.12?.45:0,clover:.25+.4*h3,along:false};
  else p={care:.74+.22*h2,stripe:0,clover:.5+.35*h3,along:false};
  params.set(lot,p);return p;};
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 for(let d=-470;d<=1215;d+=5){const f=roadFrame(d);for(const l of [-46,46]){const x=f.x+l*f.rightX,z=f.z+l*f.rightZ;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}}
 x0=Math.floor(x0-2);z0=Math.floor(z0-2);const W=Math.ceil(x1+2-x0),H=Math.ceil(z1+2-z0);
 const data=new Uint8Array(W*H*4);for(let i=0;i<W*H;i++){data[i*4]=115;data[i*4+3]=77;}
 for(let d=-470;d<=1215;d+=.5){const f=roadFrame(d),sa=Math.atan2(f.rightZ,f.rightX),fa=Math.atan2(-f.rightX,f.rightZ),pl=P(lotOf(d,-1)),pr=P(lotOf(d,1));
  for(let lat=-46;lat<=46;lat+=.5){const x=f.x+lat*f.rightX,z=f.z+lat*f.rightZ,i=Math.floor(x-x0),j=Math.floor(z-z0);if(i<0||j<0||i>=W||j>=H)continue;
   const p=lat>0?pr:pl,k=(j*W+i)*4;let care=p.care,clover=p.clover,stripe=p.stripe;
   if(d>1138){const w=smooth(1138,1150,d);care=care*(1-w)+.9*w;stripe*=1-w;clover=clover*(1-w)+.15*w;}
   let a=(p.along?fa:sa)%Math.PI;if(a<0)a+=Math.PI;
   data[k]=Math.round(care*255);data[k+1]=Math.round(stripe*255);data[k+2]=Math.round(a/Math.PI*255);data[k+3]=Math.round(clover*255);}}
 const tex=new THREE.DataTexture(data,W,H,THREE.RGBAFormat);tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearFilter;tex.needsUpdate=true;
 return {tex,box:new THREE.Vector4(x0,z0,1/W,1/H),lots:params,lotOf,P,W,H};}

// lookout map (72 m around the oak, 25 cm texels): R wear (bare earth), G trample (walked flat), B shade (the oak's),
// A wild (the knoll's long grass). The trodden way from the stop, the swing's patch, the bench, the root zone.
function lookoutMap(world){
 const o=LOOKOUT.oak,sw=LOOKOUT.swing,b=LOOKOUT.bench,po=MAIN.point(o.d,o.lat),S=72,N=288,x0=po.x-S/2,z0=po.z-S/2;
 const data=new Uint8Array(N*N*4);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+(i+.5)*S/N,z=z0+(j+.5)*S/N,q=MAIN.project(x,z,o.d),d=q.u,lat=q.v;
  const n1=vnoise(x*1.3,z*1.3),n2=vnoise(x*4.1+7,z*4.1-3);
  const wild=smooth(1140,1150,d)*(Math.abs(lat)<60?1:0);
  // the swing's patch: bare in the middle, ragged at the edge (the old decal's ellipse, turned like it)
  const ca=Math.cos(.4),sa=Math.sin(.4),dd=d-sw.d,dl=lat-sw.lat,u=(dd*ca-dl*sa)/1.75,v=(dd*sa+dl*ca)/1.35,re=Math.hypot(u,v);
  let wear=1-smooth(.45,1.15,re+(n1-.5)*.45+(n2-.5)*.2);
  // the trodden way from the stop to the oak and the bench
  if(d>1134&&d<1170){const pl=-.9+(d-1136.5)*.12+(vnoise(d*.35,3)-.5)*.5,w=Math.abs(lat-pl);const path=(1-smooth(.12,.5,w+(n2-.5)*.18))*smooth(1134,1139,d)*(1-smooth(1165,1170,d));wear=Math.max(wear,path*.5);}
  // in front of the bench, and the root zone right at the trunk
  const be=Math.hypot((d-b.d)/1.2,(lat-(b.lat+.9))/.9);wear=Math.max(wear,(1-smooth(.5,1.2,be+(n2-.5)*.3))*.7);
  const r=Math.hypot(d-o.d,lat-o.lat);wear=Math.max(wear,(1-smooth(1.05,1.9,r+(n1-.5)*.5))*.75);
  // walked flat: around the patch and the path, where the old bike lies, where the friends stand
  let tr=Math.max(1-smooth(.9,2.2,re),0)*.8;const bike=Math.hypot(d-(o.d+.9),lat-(o.lat-1.9));tr=Math.max(tr,(1-smooth(.4,1.2,bike))*.85);
  if(d>1134&&d<1170){const pl=-.9+(d-1136.5)*.12+(vnoise(d*.35,3)-.5)*.5;tr=Math.max(tr,(1-smooth(.35,1.3,Math.abs(lat-pl)+(n1-.5)*.25))*.85*smooth(1134,1139,d)*(1-smooth(1165,1171,d)));}
  const shade=(1-smooth(3,12.5,r))*.85;
  const k=(j*N+i)*4;data[k]=Math.round(Math.min(1,wear)*255*wild);data[k+1]=Math.round(Math.min(1,tr)*255*wild);data[k+2]=Math.round(shade*255*wild);data[k+3]=Math.round(wild*255);}
 const tex=new THREE.DataTexture(data,N,N,THREE.RGBAFormat);tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearFilter;tex.needsUpdate=true;
 return {tex,box:new THREE.Vector4(x0,z0,1/S,1/S)};}

// ------------------------------------------------------------------------------------------------ the lawn colours
// linear RGB; anchored on the street palette's lawn (0x7f8a55) and the foliage grade (late August, a little tired)
const COLOURS={uLawnKeep:[.158,.205,.066],uLawnRough:[.195,.214,.076],uLawnWild:[.200,.198,.076],uLawnSoil:[.150,.118,.078],uLawnStraw:[.285,.250,.125],uLawnClover:[.118,.172,.072]};

// ------------------------------------------------------------------------------------------------ the ground material
// Mode (uVegLawn): 0 the original lawn (ambient.js only), 1 the first benchmark's treatment (kept for comparison), 2 the
// repaired ground (this module).
function patchGround(world,U,T){
 const B1=`if(uVegLawn>.5&&uVegLawn<1.5){vec2 p=vVegW.xz;float big=vegN(p*.045)*.6+vegN(p*.13)*.4,fine=vegN(p*.9)*.5+vegN(p*2.3)*.5;
     float dry=smoothstep(.62,.8,vegN(p*.07+17.)*.7+vegN(p*.31)*.3);
     diffuseColor.rgb*=.86+.24*big+.08*(fine-.5);
     diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.28,1.1,.62),dry*.55);
     diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.9,1.04,.86),smoothstep(.55,.75,vegN(p*.2+3.))*.35);}`;
 const C=`
 if(uVegLawn>1.5){vec2 p=vVegW.xz;LawnPlace L=lawnPlace(p);
  // the fine grass: two scales of the mown-lawn texture (0.5 m, and 1.37 m turned 37 degrees), blended by height
  vec4 a1=texture(uLwA,p*2.);vec2 q=mat2(.7986,-.6018,.6018,.7986)*p*.73+vec2(.31,.17);vec4 a2=texture(uLwA,q);
  float sel=lfbm(p*.45)-.5;float w=smoothstep(-.06,.06,(a1.a+sel*.9)-(a2.a-sel*.9));
  vec3 det=mix(a2.rgb,a1.rgb,w)/uLwMean;vec3 n1=texture(uLwN,p*2.).xyz*2.-1.,n2=texture(uLwN,q).xyz*2.-1.;
  n2.xy=mat2(.7986,.6018,-.6018,.7986)*n2.xy;llN=normalize(mix(n2,n1,w));
  // long grass at the lookout and on the roughest lots: the meadow texture
  float wl=max(L.wild,smoothstep(.85,1.,L.care)*.35);
  if(wl>.001){vec4 m1=texture(uMdA,p*1.);vec3 md=m1.rgb/uMdMean;det=mix(det,md,wl);llN=normalize(mix(llN,texture(uMdN,p).xyz*2.-1.,wl));}
  det=mix(vec3(1.),det,uLawnDetail);
  // clover: the clover texture's own leaves over the grass, where the lot has clover
  vec4 cl=texture(uClA,p*2.);float ca=cl.a*L.clover;det=mix(det,cl.rgb/uClMean,ca*.8);
  // mottling at the scale of a few blades .. a hand (real lawns are never even)
  float mot=lfbm(p*3.1)*.6+lfbm(p*11.)*.4;det*=.93+.14*mot;
  vec3 col=L.col*det;
  // mowing stripes: blades laid one way look lighter from one side and darker from the other
  vec3 vd=normalize(cameraPosition-vVegW);col*=1.+.045*L.stripe*dot(normalize(vd.xz+1e-4),L.sdir);
  // bare earth: thin spots on rough lots, the lookout's trodden way, the swing's patch, the root zone
  float soilA=max(L.thin*.3,smoothstep(.2,.8,L.wear+(lfbm(p*1.7)-.5)*.22));
  if(soilA>.001){vec4 s1=texture(uSoA,p*.83+.5);vec3 sc=uLawnSoil*(s1.rgb/uSoMean);
   col=mix(col,sc,soilA);llN=normalize(mix(llN,texture(uSoN,p*.83+.5).xyz*2.-1.,soilA));}
  // the evening breeze running over the grass (the procedural lawn has it too)
  col*=1.+.02*sin(dot(p,vec2(.23,.17))-uLawnTime*1.7)*sin(dot(p,vec2(-.11,.29))-uLawnTime*1.1);
  diffuseColor.rgb=col;llR=mix(.95,.9,soilA);llUse=1.;}`;
 const hooked=[];
 for(const m of world.grassMats||[]){const prev=m.onBeforeCompile,prevKey=m.customProgramCacheKey?.bind(m);
  m.onBeforeCompile=(sh,r)=>{prev?.call(m,sh,r);Object.assign(sh.uniforms,U);
   sh.vertexShader='varying vec3 vVegW;\n'+sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n vVegW=(modelMatrix*vec4(transformed,1.)).xyz;');
   let f=sh.fragmentShader;
   f='uniform float uVegLawn,uLawnTime,uLawnDetail;uniform sampler2D uLwA,uLwN,uMdA,uMdN,uSoA,uSoN,uClA;uniform vec3 uLwMean,uMdMean,uSoMean,uClMean;varying vec3 vVegW;\n'+
    'float vegN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5),b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5),c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5),d=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}\n'+
    LAWN_GLSL+'vec3 llN=vec3(0.,0.,1.);float llR=.92,llUse=0.;\n'+f;
   f=f.replace('#include <color_fragment>','#include <color_fragment>\n'+B1);
   // the repaired ground runs after ambient.js's own lawn tint (it replaces it: no large dry blotches)
   f=f.replace('#include <alphamap_fragment>',C+'\n#include <alphamap_fragment>');
   f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n if(llUse>.5)roughnessFactor=llR;');
   // the grass normal, in the ground's own frame (world x along u, world z along v)
   f=f.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    if(llUse>.5){vec3 T=normalize((viewMatrix*vec4(1.,0.,0.,0.)).xyz),Bv=normalize((viewMatrix*vec4(0.,0.,1.,0.)).xyz);
     T=normalize(T-normal*dot(normal,T));Bv=normalize(Bv-normal*dot(normal,Bv)-T*dot(T,Bv));
     normal=normalize(T*llN.x*uLawnNormal+Bv*llN.y*uLawnNormal+normal*llN.z);}`);
   f='uniform float uLawnNormal;\n'+f;
   sh.fragmentShader=f;};
  m.customProgramCacheKey=()=>(prevKey?prevKey():'')+'|ll-veg-lawn2';m.needsUpdate=true;hooked.push(m);}
 return hooked;}

// ------------------------------------------------------------------------------------------------ the blade material
function bladeMaterial(U){
 const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.82,metalness:0,side:THREE.DoubleSide});m.name='veg:lawn-blade';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=`attribute vec4 _lawn;attribute vec4 _blade;attribute vec3 _wdir;attribute vec4 aMask;attribute vec4 aCell;
uniform float uTime,uGust,uWind,uBladeGain,uBladeOn;uniform vec3 uCam;uniform vec4 uFade;
varying vec3 vBladeCol;
${LAWN_GLSL}
`+sh.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal=normalize(mix(vec3(0.,1.,0.),normal,.3));\n#ifdef USE_TANGENT\n vec3 objectTangent=vec3(tangent.xyz);\n#endif')
   .replace('#include <begin_vertex>',`vec3 transformed=vec3(position);
 {mat4 IM=instanceMatrix;vec3 rootL=vec3(_lawn.x,0.,_lawn.y);vec3 rootW=(modelMatrix*IM*vec4(rootL,1.)).xyz;
  // the cell's mask: 8 x 8 sub-cells of 12.5 cm in world space (a whole lawn cell has every bit set)
  vec2 rel=rootW.xz-(vec2(IM[3][0],IM[3][2])-.5);ivec2 sc=clamp(ivec2(floor(rel*8.)),ivec2(0),ivec2(7));int bit=sc.y*8+sc.x;
  float word=bit<16?aMask.x:bit<32?aMask.y:bit<48?aMask.z:aMask.w;float on=mod(floor(word/exp2(float(bit-(bit/16)*16))),2.);
  LawnPlace L=lawnPlace(rootW.xz);
  // how many of the tile's blades stand here: all of them close by, fewer with distance; each blade by its own rank
  float dist=distance(rootW,uCam);
  float f=clamp(exp(-(dist-uFade.x)/uFade.y),0.,1.)*(1.-smoothstep(uFade.z-3.,uFade.z,dist));
  f*=(1.-smoothstep(.28,.72,L.wear+(lhash(rootW.xz*7.3)-.5)*.3))*(1.-.45*L.shade)*(1.-.5*L.thin);
  float vis=clamp((f-_lawn.z)/uFade.w,0.,1.)*on*uBladeOn;
  // blade height: the lot's mowing height and a little unevenness; the lookout's grass long and uneven
  float hs=mix(.86,1.42,L.care)*(.8+.4*lnoise(rootW.xz*1.9));
  hs=mix(hs,2.4+1.6*lnoise(rootW.xz*.8+4.),L.wild)*(1.-.6*L.trample)*(1.-.25*L.shade);
  hs*=1.+aCell.x*.4*smoothstep(.45,.85,L.care);                         // unedged lawns grow over their edges
  float widen=(1.2+1.1*clamp((dist-3.)/8.,0.,1.))*mix(1.,1.3,L.wild);    // a blade never thinner than a pixel or so
  vec3 off=position-rootL-_wdir;
  vec3 loc=rootL+off*hs*vis+_wdir*vis*widen;
  // the breeze (the game's own time and gusts) and the mowing lean, in world space
  float t=_blade.x;float sway=(sin(uTime*1.7+dot(rootW.xz,vec2(.43,.31))+_lawn.w*6.28)*.6+sin(uTime*3.3+_lawn.w*12.)*.25+uGust*.45)*uWind;
  vec3 wo=vec3(.8,0.,.6)*sway*.010*hs*hs*t*t;
  wo.xz+=L.sdir*L.stripe*.022*t*hs;
  loc+=inverse(mat3(IM))*(wo*vis);
  transformed=loc;
  vec3 c=L.col*mix(vec3(.95,1.02,.92),vec3(1.06,.98,1.05),_lawn.w)*(.9+.2*fract(_lawn.w*7.13));
  vBladeCol=c*mix(.6,1.16,t)*uBladeGain;}`);
  sh.fragmentShader='varying vec3 vBladeCol;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb=vBladeCol;')
   .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n normal=normalize(vNormal);');};
 m.customProgramCacheKey=()=>'ll-lawn-blade';
 return m;}

// ------------------------------------------------------------------------------------------------ where the lawn is
const BLOCK=new Set(['walk','house','porch','shed','trampoline','pole','mailbox','bins','sign','lamp','hoop','fence','hydrant','driveway','tree']);
const CH=16;// chunk size (m)
class BladeField{
 constructor(scene,world,U,{beds,trees,tile,counts,mat}){this.world=world;this.U=U;this.beds=beds;this.trees=trees;this.chunks=new Map();this.queue=[];this.R=13;
  this.oak=MAIN.point(LOOKOUT.oak.d,LOOKOUT.oak.lat);
  this.root=new THREE.Group();this.root.name='authored-veg:lawn-blades';scene.add(this.root);
  this.cap=[900,900,1500];this.lodRank=[1,.34,.13];this.counts=[counts.lod0,counts.lod1,counts.lod2];
  this.meshes=[0,1,2].map(l=>{const g=new THREE.BufferGeometry();for(const k of Object.keys(tile.attributes))g.setAttribute(k,tile.attributes[k]);g.setIndex(tile.index);
   g.setDrawRange(0,this.counts[l]);g.setAttribute('aMask',new THREE.InstancedBufferAttribute(new Float32Array(this.cap[l]*4),4).setUsage(THREE.DynamicDrawUsage));
   g.setAttribute('aCell',new THREE.InstancedBufferAttribute(new Float32Array(this.cap[l]*4),4).setUsage(THREE.DynamicDrawUsage));
   g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e5);
   const im=new THREE.InstancedMesh(g,mat,this.cap[l]);im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;im.name='lawn-blades:lod'+l;
   im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.root.add(im);return im;});
  this.last=null;this.lastYaw=0;this.stat={tiles:[0,0,0],cells:0,chunks:0,pending:0,evalMs:0,evals:0};}
 // a lawn point? (street coordinates from the hint; the same tests the first benchmark's lawn used, plus the lookout's knoll)
 lawnAt(x,z,hint){const w=this.world,q=MAIN.project(x,z,hint),d=q.u,lat=q.v;this.stat.evals++;
  // the street: lawns start past the curb; around the cul-de-sac and on the knoll the surface alone tells grass from asphalt
  if(d<-440||d>1175||Math.abs(lat)>40||(d<1121&&Math.abs(lat)<5))return null;
  let y;if(d>1140){const s=w.surfaceY(d,lat);if(s<.1)return null;y=w.groundY(d,lat);if(Math.hypot(x-this.oak.x,z-this.oak.z)<.95)return null;}
  else{const s=w.surfaceY(d,lat),a=w.authoredY(d,lat);if(Math.abs(a-s)>.004||Math.abs(s-LAWN)>.012)return null;y=w.groundY(d,lat);}
  for(const b of this.nearBeds)if((b.x-x)**2+(b.z-z)**2<1.1)return null;
  for(const t of this.nearTrees)if((t.x-x)**2+(t.z-z)**2<(t.trunk+.1)**2)return null;
  if(w.space?.blocked(x,z,.03,BLOCK))return null;
  return y;}
 lawnPoint(x,z,hint){const near=o=>Math.abs(o.x-x)<4&&Math.abs(o.z-z)<4;this.nearBeds=this.beds.filter(near);this.nearTrees=this.trees.filter(near);return this.lawnAt(x,z,hint);}
 buildChunk(cx,cz){const t0=performance.now(),x0=cx*CH,z0=cz*CH,hint=MAIN.project(x0+CH/2,z0+CH/2).u;
  const near=(o)=>o.x>x0-3&&o.x<x0+CH+3&&o.z>z0-3&&o.z<z0+CH+3;this.nearBeds=this.beds.filter(near);this.nearTrees=this.trees.filter(near);
  const cells=[];const Y=new Float32Array((CH+1)*(CH+1));const ok=new Uint8Array((CH+1)*(CH+1));
  // a quick rejection: chunks far from Oak Hollow Drive's lawns and the lookout
  const q=MAIN.project(x0+CH/2,z0+CH/2,hint);if(Math.abs(q.v)>40+CH||q.u<-460||q.u>1195){this.stat.evalMs+=performance.now()-t0;return cells;}
  for(let j=0;j<=CH;j++)for(let i=0;i<=CH;i++){const y=this.lawnAt(x0+i,z0+j,hint);ok[j*(CH+1)+i]=y!==null?1:0;Y[j*(CH+1)+i]=y??NaN;}
  for(let j=0;j<CH;j++)for(let i=0;i<CH;i++){const a=j*(CH+1)+i,c4=[a,a+1,a+CH+1,a+CH+2],n=c4.reduce((s,k)=>s+ok[k],0);
   const xc=x0+i+.5,zc=z0+j+.5;const yc=this.lawnAt(xc,zc,hint);
   if(n===0&&yc===null)continue;
   let mask=[65535,65535,65535,65535],edge=0;
   if(n<4||yc===null){edge=1;mask=[0,0,0,0];let any=0;
    for(let sj=0;sj<8;sj++)for(let si=0;si<8;si++){const y=this.lawnAt(x0+i+(si+.5)/8,z0+j+(sj+.5)/8,hint);if(y!==null){const b=sj*8+si;mask[b>>4]|=1<<(b&15);any++;}}
    if(!any)continue;}
   // the ground under the cell: a plane through its known heights (the centre and the corners that are lawn)
   const ys=c4.map(k=>Y[k]);const yy=[...ys.filter(v=>!Number.isNaN(v)),...(yc!==null?[yc]:[])];const ym=yy.reduce((s,v)=>s+v,0)/yy.length;
   const f=k=>Number.isNaN(ys[k])?ym:ys[k];const gx=((f(1)+f(3))-(f(0)+f(2)))/2,gz=((f(2)+f(3))-(f(0)+f(1)))/2;
   cells.push({x:xc,z:zc,y:(yc??ym),gx,gz,mask,edge,r:hash(xc,zc,5)});}
  this.stat.evalMs+=performance.now()-t0;return cells;}
 ensure(cp,radius,budgetMs){const t0=performance.now();const c0x=Math.floor((cp.x-radius)/CH),c1x=Math.floor((cp.x+radius)/CH),c0z=Math.floor((cp.z-radius)/CH),c1z=Math.floor((cp.z+radius)/CH);
  const want=[];for(let cz=c0z;cz<=c1z;cz++)for(let cx=c0x;cx<=c1x;cx++){const k=cx+','+cz;if(this.chunks.has(k))continue;
   const dx=Math.max(0,Math.abs(cp.x-(cx+.5)*CH)-CH/2),dz=Math.max(0,Math.abs(cp.z-(cz+.5)*CH)-CH/2);const d=Math.hypot(dx,dz);if(d<=radius)want.push([d,cx,cz,k]);}
  want.sort((a,b)=>a[0]-b[0]);let built=0;
  for(const [d,cx,cz,k] of want){if(budgetMs!==Infinity&&performance.now()-t0>budgetMs&&built>0)break;this.chunks.set(k,this.buildChunk(cx,cz));built++;}
  this.stat.pending=want.length-built;
  if(this.chunks.size>160){const far=[...this.chunks.keys()].map(k=>{const [x,z]=k.split(',').map(Number);return [Math.hypot((x+.5)*CH-cp.x,(z+.5)*CH-cp.z),k];}).sort((a,b)=>b[0]-a[0]);for(let i=0;i<this.chunks.size-120;i++)this.chunks.delete(far[i][1]);}
  return built;}
 update(camera,{sync=false}={}){if(!this.root.visible)return;const cp=camera.getWorldPosition(new THREE.Vector3());this.U.uCam.value.copy(cp);
  const built=this.ensure(cp,sync?this.R+2:26,sync?Infinity:3.5);
  const fw=new THREE.Vector3();camera.getWorldDirection(fw);const yaw=Math.atan2(fw.x,fw.z);
  if(!built&&this.last&&this.last.distanceToSquared(cp)<.16&&Math.abs(Math.atan2(Math.sin(yaw-this.lastYaw),Math.cos(yaw-this.lastYaw)))<.12)return;
  this.last=(this.last||new THREE.Vector3()).copy(cp);this.lastYaw=yaw;
  const fx=fw.x,fz=fw.z,fl=Math.hypot(fx,fz)||1,cone=fl>.35,half=THREE.MathUtils.degToRad((camera.fov||60)*Math.max(1,camera.aspect||1)*.5)+.45,cosH=Math.cos(Math.min(Math.PI,half));
  const n=[0,0,0],M=this.meshes,R=this.R,D=this.U.uFade.value;
  // the distance at which the visible share of blades falls under a LOD's ranks (so the LOD drops only blades already gone)
  const dl=[D.x+D.y*Math.log(1/this.lodRank[1]),D.x+D.y*Math.log(1/this.lodRank[2])];
  const c0x=Math.floor((cp.x-R)/CH),c1x=Math.floor((cp.x+R)/CH),c0z=Math.floor((cp.z-R)/CH),c1z=Math.floor((cp.z+R)/CH);let cells=0;
  for(let cz=c0z;cz<=c1z;cz++)for(let cx=c0x;cx<=c1x;cx++){const list=this.chunks.get(cx+','+cz);if(!list)continue;
   for(const c of list){const dx=c.x-cp.x,dz=c.z-cp.z,dc=Math.hypot(dx,dz),dn=Math.max(0,dc-.71);if(dn>R)continue;
    if(cone&&dc>2.5&&(dx*fx+dz*fz)/(dc*fl)<cosH)continue;// behind the camera (a generous cone)
    const dy=Math.abs(c.y-cp.y),dn3=Math.hypot(dn,Math.max(0,dy-.1));const l=dn3<dl[0]?0:dn3<dl[1]?1:2;if(n[l]>=this.cap[l])continue;
    const im=M[l],i=n[l]++;cells++;
    // the tile turned a quarter (and mirrored) by cell, sheared onto the ground's plane
    const k=Math.floor(c.r*8),a=(k&3)*Math.PI/2,s=k&4?-1:1,ca=Math.cos(a),sa=Math.sin(a);
    const e=im.instanceMatrix.array,o=i*16;
    // columns: M3 = Shear * RotY(a) * diag(s,1,1)
    e[o]=ca*s;e[o+1]=c.gx*ca*s+c.gz*(-sa)*s;e[o+2]=-sa*s;e[o+3]=0;
    e[o+4]=0;e[o+5]=1;e[o+6]=0;e[o+7]=0;
    e[o+8]=sa;e[o+9]=c.gx*sa+c.gz*ca;e[o+10]=ca;e[o+11]=0;
    e[o+12]=c.x;e[o+13]=c.y-.008;e[o+14]=c.z;e[o+15]=1;
    const mk=im.geometry.attributes.aMask.array,ce=im.geometry.attributes.aCell.array;mk[i*4]=c.mask[0];mk[i*4+1]=c.mask[1];mk[i*4+2]=c.mask[2];mk[i*4+3]=c.mask[3];
    ce[i*4]=c.edge;ce[i*4+1]=c.r;}}
  M.forEach((im,l)=>{im.count=n[l];im.instanceMatrix.needsUpdate=true;im.geometry.attributes.aMask.needsUpdate=true;im.geometry.attributes.aCell.needsUpdate=true;});
  this.stat.tiles=n;this.stat.cells=cells;this.stat.chunks=this.chunks.size;}
 stats(){let tris=0,calls=0;this.meshes.forEach((im,l)=>{if(im.count){tris+=im.count*this.counts[l]/3;calls++;}});return {tris,calls,tiles:this.stat.tiles.slice(),cells:this.stat.cells,chunks:this.stat.chunks,pending:this.stat.pending,evalMs:+this.stat.evalMs.toFixed(1),evals:this.stat.evals};}
 set visible(v){this.root.visible=v;}get visible(){return this.root.visible;}
}

// ------------------------------------------------------------------------------------------------ weeds
// A few weeds by the lots' care: rosettes and seed stalks on the rough lots, the odd one on average lots, none on kept ones
// (front yards and the curb strip of Oak Hollow Drive; every point passes the same lawn test as the blades).
function weedPoints(care,field){const out=[];let seed=4242;const r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let d=-430;d<1118;d+=3)for(const side of [-1,1])for(let a=5.4;a<21;a+=3){const dd=d+r()*3,lat=side*(a+r()*3);if(Math.abs(lat)>6.1&&Math.abs(lat)<8.1)continue;
  const p=care.P(care.lotOf(dd,lat)),dens=p.care>.7?.05:p.care>.3?.012:0;if(r()>dens*9)continue;
  const f=roadFrame(dd),x=f.x+lat*f.rightX,z=f.z+lat*f.rightZ;const y=field.lawnPoint(x,z,dd);if(y===null)continue;
  out.push({id:r()<.62?'weed.groundcover.1':'weed.seedstalk.1',x,y:y-.01,z,rot:r()*6.283,s:.55+r()*.4});}
 return out;}

// ------------------------------------------------------------------------------------------------ the lawn, assembled
export function buildLawn({world,scene,U,asset,beds,trees,renderer}){
 const tex={};let tile=null,counts=null;
 asset.template.traverse(o=>{if(o.isMesh&&o.userData?.ll_lawn_swatch){const m=o.material;tex[o.userData.ll_lawn_swatch]={map:m.map,normal:m.normalMap,mean:m.userData?.ll_mean_linear};}
  if(o.isMesh&&o.userData?.ll_lawn_tile){tile=o.geometry;counts=o.userData.ll_lod_index_counts;}});
 if(!tile||!tex.lawn)throw new Error('veg.lawn: no lawn.tile or ground textures');
 const aniso=Math.min(16,renderer?.capabilities?.getMaxAnisotropy?.()??1);
 for(const t of Object.values(tex))for(const k of ['map','normal']){const x=t[k];if(!x)continue;x.wrapS=x.wrapT=THREE.RepeatWrapping;x.anisotropy=aniso;x.needsUpdate=true;}
 // the textures carry linear data in alpha (height / cover) and colour in RGB (sRGB); normals are linear
 const mean=n=>new THREE.Vector3(...(tex[n].mean||[.1,.15,.05]));
 const care=careMap(world),look=lookoutMap(world);
 const LU={uVegLawn:{value:2},uLawnTime:U.uTime,uLawnDetail:{value:.9},uLawnNormal:{value:.8},
  uLwA:{value:tex.lawn.map},uLwN:{value:tex.lawn.normal},uMdA:{value:tex.meadow.map},uMdN:{value:tex.meadow.normal},uSoA:{value:tex.soil.map},uSoN:{value:tex.soil.normal},uClA:{value:tex.clover.map},
  uLwMean:{value:mean('lawn')},uMdMean:{value:mean('meadow')},uSoMean:{value:mean('soil')},uClMean:{value:mean('clover')},
  uCareMap:{value:care.tex},uCareBox:{value:care.box},uLookMap:{value:look.tex},uLookBox:{value:look.box},
  ...Object.fromEntries(Object.entries(COLOURS).map(([k,v])=>[k,{value:new THREE.Vector3(...v)}]))};
 const BU={...LU,uTime:U.uTime,uGust:U.uGust,uWind:U.uWind,uCam:{value:new THREE.Vector3()},uFade:{value:new THREE.Vector4(2.5,3.0,13,.06)},uBladeGain:{value:1},uBladeOn:{value:1}};
 const ground=patchGround(world,LU,tex);
 const blades=new BladeField(scene,world,BU,{beds,trees,tile,counts,mat:bladeMaterial(BU)});
 const weeds=weedPoints(care,blades);
 return {blades,ground,care,look,weeds,uniforms:LU,bladeUniforms:BU,
  setGround(mode){LU.uVegLawn.value=mode;},
  update(camera,o){blades.update(camera,o);},
  stats(){return blades.stats();},
  info:{tileBlades:asset.template.getObjectByName?.('lawn.tile')?.userData?.ll_blades,lots:care.lots.size,careMap:[care.W,care.H],lookMap:288,textures:Object.keys(tex).length*2}};
}
