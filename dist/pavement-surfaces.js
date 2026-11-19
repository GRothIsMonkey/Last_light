// Pavement reconstruction (Prologue benchmark, DEV flag ?pavement; nothing imports this module without it).
//
// The roads, gutters, curbs, sidewalks and driveways keep their procedural geometry (streets.js, houses.js: the Art
// Bible's "keep the procedural sweeps") and get physically based surface materials:
//   * micro-structure from CC0 photogrammetry (Poly Haven asphalt_07: stone aggregate in binder; gravel_concrete_04: aged
//     sidewalk concrete), processed by tools/materials/roads/build_pavement_textures.py into albedo DETAIL (mean 1, broad
//     variation removed), normal and height/roughness/AO maps; sampled in world metres at two scales (the second turned
//     37 degrees) blended by height, so neither tile period shows; mipmapped, anisotropic;
//   * everything that makes a street a lived-in place is analytic and tied to the real layout through the street
//     coordinates each vertex carries (uv: across/along in metres; pv: the along direction, curb-cut factor, row/id):
//     resurfacing sections, wheel paths and the oil-drip line of each lane, the paving seam at the crown and its crack
//     sealant, sparse transverse cracks (most sealed), utility patches with saw-cut seams, repairs round the manholes,
//     edge raveling and the asphalt/gutter joint, oil where cars park; tooled sidewalk panels (edger margins, broom
//     finish, control and expansion joints, per-panel age and tone, a few cracks, leaf stains, a heaved panel by a big
//     tree, grass in a joint at the lawn edge); curb joints, nose wear and chips, base staining, tire scuffs at the
//     driveway cuts; gutter pans with their joints, flow line, sediment and leaves near the inlets; driveway slabs with
//     joints, broom finish, tire tracks, oil under the car, age per house, chalk and ball scuffs where kids play.
//   * a 2048 x 8 "street layout map" (one texel per metre along each side of Oak Hollow Drive, Briarwood and
//     Summerfield) says where the driveway cuts, inlets, parking and front-yard trees are; a 256 x 1 table says how each
//     driveway is kept.
// One shared uniform switches every pavement material between the ORIGINAL look (the exact shader the default game
// uses: roadwear / concrete, untouched) and the RECONSTRUCTED look, so the comparison key shows both in one frame and the
// same material objects stay in the merged world (Chapter Eight's ground cuts patch them like any other).
import * as THREE from './three.module.js';

export const PAVE={
 on:{value:0},             // 0 original, 1 reconstructed (stays 0 until the textures have loaded)
 tune:{value:new THREE.Vector4(1,1,1,0)},// x micro-normal strength, y macro variation, z wear amount, w unused
 debug:{value:0},          // QA: 1 = flat albedo (no lighting detail check), 0 = normal
 wet:{value:0},            // FOUNDATION for later chapters (rain, the storm): 0 dry (the Prologue: always 0) .. 1 soaked; not used yet
 asA:{value:null},asN:{value:null},asH:{value:null},coA:{value:null},coN:{value:null},coH:{value:null},
 layout:{value:null},drive:{value:null},
 inlets:{value:Array.from({length:24},()=>new THREE.Vector4(-1e4,0,0,0))},
};
const flat=(r,g,b,a=255)=>{const t=new THREE.DataTexture(new Uint8Array([r,g,b,a]),1,1);t.needsUpdate=true;return t;};
PAVE.asA.value=PAVE.coA.value=flat(128,128,128);PAVE.asN.value=PAVE.coN.value=flat(128,128,255);PAVE.asH.value=PAVE.coH.value=flat(128,230,230);
PAVE.layout.value=flat(0,0,0,0);PAVE.drive.value=flat(128,0,0,128);

export const KINDS={asphalt:0,gutter:1,curb:2,walk:3,drive:4,path:5,iron:6};
export const TEXTURES={
 asphalt:{albedo:'assets/pavement/pv.asphalt.albedo.jpg',normal:'assets/pavement/pv.asphalt.normal.jpg',hra:'assets/pavement/pv.asphalt.hra.jpg'},
 concrete:{albedo:'assets/pavement/pv.concrete.albedo.jpg',normal:'assets/pavement/pv.concrete.normal.jpg',hra:'assets/pavement/pv.concrete.hra.jpg'},
};

// ------------------------------------------------------------------------------------------------------------- GLSL
const COMMON=`
uniform float uPvOn,uPvDebug,uPvWet;uniform vec4 uPvTune;
uniform sampler2D uPvAsA,uPvAsN,uPvAsH,uPvCoA,uPvCoN,uPvCoH,uPvLayout,uPvDrive;
uniform vec4 uPvInlet[24];
varying vec3 vPvW;varying vec2 vPvUv;varying vec4 vPvD;
float pvH(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float pvH1(float n){return pvH(vec2(n,n*.618034+17.13));}
float pvN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(pvH(i),pvH(i+vec2(1,0)),f.x),mix(pvH(i+vec2(0,1)),pvH(i+vec2(1,1)),f.x),f.y);}
float pvF(vec2 p){return .5*pvN(p)+.27*pvN(p*2.03+7.1)+.15*pvN(p*4.11+3.3)+.08*pvN(p*8.3+1.7);}
// exact box-filtered coverage of a band of width w centred on 0, at signed distance x, pixel footprint e
float pvLine(float x,float w,float e){e=max(e,1e-5);return clamp((min(x+e*.5,w*.5)-max(x-e*.5,-w*.5))/e,0.,1.);}
// a soft step that stays one pixel wide
float pvStep(float x,float e){return clamp(x/max(e,1e-5)+.5,0.,1.);}
struct PvS{vec3 a;vec3 n;vec3 h;};
// micro-structure in world metres (p = (x,-z): right-handed with +y up), two scales blended by height
PvS pvSample(sampler2D A,sampler2D N,sampler2D H,vec2 p,float tile,float seed,float bias){
 vec2 u1=p/tile+seed*vec2(.13,.71);
 const float ca=.79864,sa=.60181;
 vec2 q=vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y)/(tile*1.37)+vec2(.31,.17)+seed;
 vec3 h1=texture(H,u1).rgb,h2=texture(H,q).rgb;
 float sel=pvF(p*.23+seed*3.1)-.5;
 float w=smoothstep(-.07,.07,(h1.r+sel*1.15)-(h2.r-sel*1.15));
 PvS s;s.a=mix(texture(A,q,bias).rgb,texture(A,u1,bias).rgb,w)*2.;
 vec3 n1=texture(N,u1).xyz*2.-1.,n2=texture(N,q).xyz*2.-1.;
 n2.xy=vec2(ca*n2.x+sa*n2.y,-sa*n2.x+ca*n2.y);
 s.n=normalize(mix(n2,n1,w));s.h=mix(h2,h1,w);return s;}
// one scale only (small surfaces), optional triplanar for curbs
PvS pvSample1(sampler2D A,sampler2D N,sampler2D H,vec2 p,float tile){PvS s;vec2 u=p/tile;s.a=texture(A,u,.7).rgb*2.;s.n=texture(N,u).xyz*2.-1.;s.h=texture(H,u).rgb;return s;}
// the street frame of this fragment, in view space: T across (+uv.x), B along (+uv.y), N up
vec3 pvView(vec3 w){return normalize((viewMatrix*vec4(w,0.)).xyz);}
mat3 pvFrame(vec3 N){vec2 f=normalize(vPvD.xy+vec2(1e-6));float hs=vPvD.z<0.?-1.:1.;
 vec3 B=pvView(vec3(f.x,0.,f.y)),T=pvView(vec3(-f.y,0.,f.x))*hs;
 B=normalize(B-N*dot(N,B));T=normalize(T-N*dot(N,T)-B*dot(B,T));return mat3(T,B,N);}
mat3 pvWorldFrame(vec3 N){vec3 T=pvView(vec3(1,0,0)),B=pvView(vec3(0,0,-1));T=normalize(T-N*dot(N,T));B=normalize(B-N*dot(N,B)-T*dot(T,B));return mat3(T,B,N);}
vec3 pvLum(vec3 c,float s){float l=dot(c,vec3(.2126,.7152,.0722));return mix(vec3(l),c,s);}
`;

// The surfaces. Each returns: col (linear albedo), rough, nm (tangent-space micro normal in the world frame), g (height
// gradient across/along, applied in the street frame), ao (cavity: scales the indirect light).
const SURF=`
struct PvOut{vec3 col;float rough;vec3 nm;vec2 g;float ao;float nmStr;float metal;float low;};
// --------------------------------------------------------------------------------------------------- asphalt
#if PV_KIND==0
PvOut pvShade(vec3 base){PvOut o;o.metal=0.;o.low=0.;
 vec2 p=vec2(vPvW.x,-vPvW.z);float lat=vPvUv.x,d=vPvUv.y;float frame=floor(vPvD.w*.5+.01);float side=lat>0.?1.:-1.,a=abs(lat);
 float e=max(1e-4,max(length(vec2(dFdx(d),dFdy(d))),length(vec2(dFdx(lat),dFdy(lat)))));// pixel footprint (m)
 float seed=frame*101.;float D=d+seed*37.;
 // -- where the edge is: the asphalt/gutter joint on straight runs; the curb face round the corners and the bulb
 float edge=(frame<.5?(d>1100.?4.7:4.32):3.82)-a;
 float mouth=0.;
 if(frame<.5){
  // the junction mouths (Briarwood d 595 right, Summerfield d 870 left): the asphalt runs on into the side street
  for(int k=0;k<2;k++){float jd=k==0?595.:870.,js=k==0?1.:-1.;if(side!=js||abs(d-jd)>11.4)continue;
   float t=abs(d-jd);if(t<4.2){mouth=1.;edge=max(edge,3.);}
   else{vec2 C=vec2(jd+sign(d-jd)*10.7,js*11.2);float r=length(vec2(d,lat)-C);if(a>4.3)edge=min(max(edge,0.),r-6.5);}}
  // the cul-de-sac: straight curb to 1128.79, a reverse curve (r 6) and the bulb (r 11 about d 1142)
  if(d>1128.79){float ar=length(vec2(d-1128.79,a-10.7))-6.,br=11.-length(vec2(d-1142.,lat));edge=d<1133.45?ar:br;}
 }else{if(d<4.75)mouth=1.;}
 float culK=frame<.5?smoothstep(1118.,1132.,d):0.;
 // -- layout (this side of this street, by the metre)
 float row=vPvD.w+(lat>0.?1.:0.);vec4 L=texture(uPvLayout,vec2((d+500.)/2048.,(row+.5)/8.));
 // -- the micro-structure
 PvS s=pvSample(uPvAsA,uPvAsN,uPvAsH,p,2.5,0.,0.);
 // -- resurfacing sections: the street was overlaid in pieces; each has its own tone and aggregate exposure
 float sc=floor((D+pvH1(floor(D/170.))*60.)/170.);float sh=pvH1(sc*7.3+frame);
 float secTone=1.+(sh-.5)*.075*uPvTune.y,secExp=.85+.3*pvH1(sc*3.1+5.);
 // broad, restrained variation (a few percent; no blotches)
 float broad=pvF(p*.045)*.6+pvF(p*.17+11.)*.4;
 float tone=secTone*(.955+.09*broad*uPvTune.y);
 // -- traffic: two wheel paths per lane and the oil-drip line between them; round the bulb, cars turn in a loop
 float wl=.0,drip=.0;
 {float wv=.12*sin(D*.021+side)+.06*sin(D*.067);float lane=frame<.5?2.2:1.9;
  float t1=abs(a-(lane-.82)-wv),t2=abs(a-(lane+.82)-wv);wl=exp(-t1*t1/.11)+exp(-t2*t2/.11);
  float dd=abs(a-lane-wv*.7);drip=exp(-dd*dd/.035)*(.55+.45*pvF(vec2(D*.9,lat*3.)));
  if(culK>0.){float rr=length(vec2(d-1142.,lat));float c1=abs(rr-6.9),c2=abs(rr-8.5);float wc=exp(-c1*c1/.14)+exp(-c2*c2/.14);
   wl=mix(wl,wc*.7,culK);drip*=1.-culK;}
  wl*=(1.-mouth*.4)*smoothstep(.1,.6,edge);}
 // -- the edge: lighter, dusty, coarse aggregate exposed, raveled (stones lost) in the last 15-25 cm
 float edgeK=1.-smoothstep(.0,.55,edge),rav=(1.-smoothstep(.0,.2,edge))*(1.-mouth);
 float lost=smoothstep(.62,.9,pvF(p*9.+3.))*rav;
 // -- the crown's paving seam: a construction joint, cracked along much of its length, sealed in places
 float seamX=lat-.04*sin(D*.05)-.015*sin(D*.31);
 float crk=0.,seal=0.,sealEdge=0.;
 {float on=smoothstep(.5,.56,pvF(vec2(D*.031,frame)));float jag=(pvN(vec2(D*3.1,1.))-.5)*.006;
  float lc=pvLine(seamX+jag,.0035,e)*on*(1.-culK)*(1.-mouth);crk=max(crk,lc);
  float sOn=smoothstep(.6,.66,pvF(vec2(D*.045+frame*3.,7.)));float sw=.045+.02*pvN(vec2(D*1.7,3.));
  float sb=pvLine(seamX+(pvN(vec2(D*4.,5.))-.5)*.012,sw,e)*sOn*(1.-culK)*(1.-mouth);seal=max(seal,sb*(.6+.4*pvN(vec2(D*6.,9.))));}
 // -- transverse cracks: about one in three 7 m cells, wandering, most of them sealed
 {float cc=floor(D/7.);float hc=pvH1(cc*1.7+frame*3.);
  if(hc<.36*uPvTune.z){float dc=cc*7.+1.+pvH1(cc+.3)*5.;float l0=-4.4+pvH1(cc+.7)*3.,l1=l0+2.5+pvH1(cc+.9)*6.;
   float path=dc+.22*sin(lat*.9+cc)+.07*sin(lat*3.7+cc*2.)+(pvN(vec2(lat*7.,cc))-.5)*.03;float dd=D-path;
   float span=smoothstep(l0,l0+.4,lat)*(1.-smoothstep(l1-.4,l1,lat))*(1.-culK)*(1.-mouth);
   float isSealed=step(.4,pvH1(cc+.11));
   crk=max(crk,pvLine(dd,.003+.002*pvN(vec2(lat*5.,cc)),e)*span*(1.-isSealed*.7));
   seal=max(seal,pvLine(dd,.05+.015*pvN(vec2(lat*2.,cc)),e)*span*isSealed*(.7+.3*pvN(vec2(lat*8.,cc))));}}
 crk*=1.-smoothstep(.012,.05,e);
 // -- patches: a service cut from the curb in front of a house (one lot in four or five), the manholes' surrounds
 float pch=0.,pEdge=0.;
 {float pc=floor((D+11.)/29.);float hp=pvH1(pc*2.9+frame*5.);
  if(hp<.24){float dc=pc*29.-11.+4.+pvH1(pc+.4)*20.,ps=pvH1(pc+.8)<.5?-1.:1.;float len=.9+pvH1(pc+.2)*.5,reach=1.3+pvH1(pc+.6)*2.6;
   float hal=frame<.5?4.32:3.82;
   vec2 q=vec2(abs(D-dc)-len*.5,max(hal-reach-lat*ps,lat*ps-hal-1.));float sd=max(q.x,q.y);
   sd+=(pvN(vec2(D*9.,lat*9.))-.5)*.006;if(lat*ps>0.){pch=max(pch,1.-pvStep(sd,e));pEdge=max(pEdge,pvLine(sd,.007,e)*(.6+.4*pvN(vec2(D*13.,lat*13.))));}}
  if(frame<.5&&d<1121.){float k=floor((d+390.+47.5)/95.),md=-390.+95.*k,mx=mod(abs(md)/95.,2.)>=1.?.8:-1.2;
   float rot=pvH1(k)*.5-.25;vec2 r=vec2(d-md,lat-mx);r=vec2(cos(rot)*r.x-sin(rot)*r.y,sin(rot)*r.x+cos(rot)*r.y);
   vec2 q=abs(r)-vec2(.62);float sd=length(max(q,0.))+min(max(q.x,q.y),0.)-.14+(pvN(r*9.)-.5)*.008;pch=max(pch,1.-pvStep(sd,e));pEdge=max(pEdge,pvLine(sd,.007,e)*(.6+.4*pvN(r*13.)));}}
 // -- oil: where cars park along the curb (layout B), now and then in the lanes
 float oil=0.;
 {vec2 oc=floor(vec2(D/2.3,lat/1.1));float ho=pvH(oc+frame*13.);
  float park=L.b*smoothstep(.25,1.2,edge)*(1.-smoothstep(2.,2.9,edge));
  float pr=.10+.55*park;
  if(ho<pr){vec2 cpos=(oc+.25+.5*vec2(pvH(oc+.3),pvH(oc+.7)))*vec2(2.3,1.1);vec2 r=(vec2(D,lat)-cpos)/vec2(.42,.3)*(1.+.35*(pvF(p*3.)-.5));
   float sp=1.-smoothstep(.55,1.,length(r));oil=max(oil,sp*(.35+.65*pvH(oc+.9)));}
  oil=max(oil,drip*.35);}
 // -- the ground shape: gentle depressions and the joints' lips (normal only)
 vec2 g=vec2(0.);
 {vec2 uq=vec2(lat,D)*.9;float h0=pvF(uq),hx=pvF(uq+vec2(.08,0.)),hy=pvF(uq+vec2(0.,.08));g+=vec2(hx-h0,hy-h0)/.08*.9*.012;}
 // -- compose
 vec3 alb=s.a;
 float expo=mix(1.,secExp,.5)*(1.+edgeK*.25)*(1.-wl*.18);
 alb=mix(vec3(1.),alb,expo);
 vec3 c=base*vec3(1.035,1.,.965)*alb*tone;
 c*=1.-wl*.15*uPvTune.z;c*=1.-drip*.12*uPvTune.z;
 c=mix(c,c*vec3(1.08,1.06,1.0),edgeK*.55);                 // dust and sand at the edge
 c=mix(c,base*vec3(.9,.91,.92)*mix(vec3(1.),s.a,.8),pch*.9);// patch: younger binder, darker, finer, less oxidized
 c*=1.-pch*.17;
 c=mix(c,vec3(.03,.029,.028),seal*.9);                     // crack sealant (rubberized: near black)
 c=mix(c,c*.35,crk);
 c=mix(c,c*vec3(.5,.5,.52),oil*.55*uPvTune.z);
 c=mix(c,c*.42,lost);
 c*=1.-pEdge*.22;
 float rough=clamp(mix(.88,.97,s.h.g)+edgeK*.03-wl*.06,.6,1.);
 rough=mix(rough,.86,pch);rough=mix(rough,.92,seal);rough=mix(rough,.74,oil*.6);
 o.low=clamp(wl*.35+edgeK*.55+smoothstep(.55,.75,pvF(vec2(lat,D)*.9))*.6-pch*.2,0.,1.);
 o.col=c;o.rough=rough;o.nm=s.n;o.nmStr=(1.+edgeK*.4)*(1.-seal*.45)*uPvTune.x;
 // sealant bands are slightly proud; the seam of a patch is a fine groove
 o.g=g;o.ao=(1.-crk*.6)*(1.-lost*.5)*(1.-pEdge*.4)*mix(1.,s.h.b,.6);
 return o;}
#endif
// --------------------------------------------------------------------------------------------------- concrete kinds
#if PV_KIND>=1
// a tooled joint across the 'along' axis at x (signed distance, m): dark core, rounded tooled lips (normal), AO
void pvJoint(float x,float w,float e,inout float dark,inout float gAlong,inout float ao,float lip){
 float core=pvLine(x,w,e);dark=max(dark,core);
 float r=abs(x)-w*.5;if(r>0.&&r<lip){float k=1.-r/lip;gAlong+=sign(x)*-k*k*.35;}// the lip rounds down into the groove
 ao*=1.-core*.75-(1.-smoothstep(0.,lip*1.4,abs(x)-w*.5))*.18;}
#endif
#if PV_KIND==1
PvOut pvShade(vec3 base){PvOut o;o.metal=0.;o.low=0.;// gutter pan: uv = (lateral, d); 0.38 m wide, at the curb face
 vec2 p=vec2(vPvW.x,-vPvW.z);float lat=vPvUv.x,d=vPvUv.y,frame=floor(vPvD.w*.5+.01),side=lat>0.?1.:-1.;
 float cf=frame<.5?4.7:4.2,ec=cf-abs(lat);// distance from the curb face (0 .. .38)
 float e=max(1e-4,max(length(vec2(dFdx(d),dFdy(d))),length(vec2(dFdx(lat),dFdy(lat)))));
 float D=d+frame*1013.;
 float row=vPvD.w+(lat>0.?1.:0.);vec4 L=texture(uPvLayout,vec2((d+500.)/2048.,(row+.5)/8.));
 PvS s=pvSample(uPvCoA,uPvCoN,uPvCoH,p,1.6,.37,.7);
 float panel=floor(D/3.04);float ph=pvH1(panel*1.3+frame);
 float dark=0.,gA=0.,ao=1.;
 float jx=D-floor(D/3.04+.5)*3.04;pvJoint(jx,.008,e,dark,gA,ao,.012);
 // the flow line by the curb: sediment, fine grit, a darker band; more near the inlets and under the trees
 float inlet=L.g,trees=L.a,cut=L.r;
 float flow=(1.-smoothstep(.02,.16+.1*inlet,ec))*(.55+.45*pvF(vec2(D*1.3,ec*9.)));
 float sed=flow*(.45+.55*inlet);
 // the joint with the asphalt (the gutter's lip), dark and a little broken
 float lip=pvLine(ec-.38,.012+.006*pvN(vec2(D*4.,1.)),e);
 // leaves: a few, mostly dry, gathered by the curb, near trees and at the inlets
 float leaf=0.;vec3 leafC=vec3(0.);
 {vec2 lc=floor(vec2(D,ec)/vec2(.21,.13));float hl=pvH(lc+frame*7.);
  float pr=(.035+.18*trees+.22*inlet)*(1.-smoothstep(.12,.3,ec))*uPvTune.z;
  if(hl<pr){vec2 cpos=(lc+.5+.35*vec2(pvH(lc+.2)-.5,pvH(lc+.6)-.5))*vec2(.21,.13);float an=pvH(lc+.9)*6.283;
   vec2 r=vec2(D,ec)-cpos;r=vec2(cos(an)*r.x-sin(an)*r.y,sin(an)*r.x+cos(an)*r.y)/vec2(.045+.03*pvH(lc+.4),.022+.012*pvH(lc+.5));
   float l=1.-smoothstep(.75,1.,length(r));leaf=l;float tint=pvH(lc+1.3);
   leafC=tint<.55?vec3(.30,.20,.09):tint<.8?vec3(.38,.30,.12):tint<.93?vec3(.17,.20,.07):vec3(.42,.17,.06);}}
 // tire scuffs where cars cross into a driveway
 float scuff=cut*smoothstep(.55,.8,pvF(vec2(D*2.,ec*6.)))*.6;
 vec3 c=base*vec3(.97,.975,1.)*mix(vec3(1.),s.a,.5);
 c*=.95+.09*(ph-.5)+.05*(pvF(p*.25)-.5);
 c=mix(c,c*vec3(.74,.70,.62),sed*.75);
 c=mix(c,c*vec3(.62,.62,.6),(1.-smoothstep(0.,.05,ec))*.5);  // the base of the curb, always a little dirty
 c=mix(c,c*.5,scuff);
 c=mix(c,vec3(.10,.095,.09),lip*.8);
 c=mix(c,c*.35,dark);
 c=mix(c,leafC,leaf*.92);
 o.low=clamp(flow*1.2+inlet*.3,0.,1.);
 o.col=c;o.rough=clamp(mix(.82,.95,s.h.g)-sed*.05+leaf*.05,.6,1.);o.nm=s.n;o.nmStr=.75*uPvTune.x*(1.-leaf);o.g=vec2(0.,gA);o.ao=ao*(1.-lip*.5)*mix(1.,s.h.b,.5)*(1.-leaf*.1);
 return o;}
#endif
#if PV_KIND==2
PvOut pvShade(vec3 base){PvOut o;o.metal=0.;o.low=0.;// curb: uv = (profile offset 0 .. .3, along); pv.z = curb-cut factor (1 full height)
 float off=vPvUv.x,al=vPvUv.y,k=abs(vPvD.z),id=vPvD.w;float frame=floor(id*.5+.01);
 float e=max(1e-4,max(length(vec2(dFdx(al),dFdy(al))),length(vec2(dFdx(off),dFdy(off)))*4.));
 float A=al+id*517.;
 // triplanar concrete (the face is near vertical)
 vec3 wn=normalize(cross(dFdx(vPvW),dFdy(vPvW)));if(wn.y<0.)wn=-wn;vec3 bw=pow(abs(wn),vec3(4.));bw/=bw.x+bw.y+bw.z;
 PvS sy=pvSample1(uPvCoA,uPvCoN,uPvCoH,vec2(vPvW.x,-vPvW.z),1.3),sx=pvSample1(uPvCoA,uPvCoN,uPvCoH,vec2(-vPvW.z,vPvW.y)+3.1,1.3),sz=pvSample1(uPvCoA,uPvCoN,uPvCoH,vec2(vPvW.x,vPvW.y)+7.7,1.3);
 vec3 alb=sx.a*bw.x+sy.a*bw.y+sz.a*bw.z;vec3 hra=sx.h*bw.x+sy.h*bw.y+sz.h*bw.z;
 // the parts of the profile: face (0 .. .02), rounded nose (.02 .. .07), top (.07 .. .27), back (.27 .. .3)
 float face=1.-smoothstep(.015,.025,off),nose=smoothstep(.015,.03,off)*(1.-smoothstep(.06,.08,off)),top=smoothstep(.06,.08,off)*(1.-smoothstep(.26,.28,off)),back=smoothstep(.26,.28,off);
 float seg=floor(A/3.04),sh=pvH1(seg*2.3);
 float dark=0.,gA=0.,ao=1.;float jx=A-floor(A/3.04+.5)*3.04;pvJoint(jx,.006,e,dark,gA,ao,.01);
 // the nose: worn lighter, aggregate showing, a few chips (more where cars cross)
 float cutK=1.-smoothstep(.85,.99,k);
 float chip=smoothstep(.78,.93,pvF(vec2(A*7.,off*40.)+3.))*nose*(.5+cutK);
 float scuff=cutK*smoothstep(.45,.75,pvF(vec2(A*1.7,off*20.)))*(nose+face);
 vec3 c=base*vec3(.985,.985,1.)*mix(vec3(1.),alb,.42+nose*.2);
 c*=.96+.08*(sh-.5);
 c=mix(c,c*1.06,nose*(.6+.4*cutK));
 c=mix(c,c*vec3(.70,.68,.62),face*(.35+.4*(1.-smoothstep(0.,.012,off))));// splash and grime up the face from the gutter
 c=mix(c,c*vec3(.82,.84,.74),back*.5+top*smoothstep(.2,.27,off)*.35);    // the lawn side: soil and a little green
 c=mix(c,c*.55,chip);c=mix(c,c*.6,scuff);c=mix(c,c*.35,dark);
 o.col=c;o.rough=clamp(mix(.8,.95,hra.g)-nose*.04,.6,1.);
 vec3 nm=sx.n*bw.x+sy.n*bw.y+sz.n*bw.z;o.nm=normalize(nm);o.nmStr=.55*uPvTune.x*(1.-face*.5);
 o.g=vec2(0.,gA);o.ao=ao*(1.-chip*.4)*mix(1.,hra.b,.5);return o;}
#endif
#if PV_KIND==3
PvOut pvShade(vec3 base){PvOut o;o.metal=0.;o.low=0.;// sidewalk: uv = (offset across 0 .. 1.5, along); pv.z = cut factor (driveway crossing)
 vec2 p=vec2(vPvW.x,-vPvW.z);float x=vPvUv.x,al=vPvUv.y,k=abs(vPvD.z),id=vPvD.w;
 float e=max(1e-4,max(length(vec2(dFdx(al),dFdy(al))),length(vec2(dFdx(x),dFdy(x)))));
 float A=al+id*311.;
 float row=id;vec4 L=id<5.5?texture(uPvLayout,vec2((al+500.)/2048.,(row+.5)/8.)):vec4(0.);
 PvS s=pvSample(uPvCoA,uPvCoN,uPvCoH,p,2.,.0,.9);
 float P=1.52,pi=floor(A/P),px=A-pi*P;// panel index, position along the panel
 float h1=pvH1(pi*1.31+id*7.),h2=pvH1(pi*2.17+3.+id),h3=pvH1(pi*.73+9.+id*3.);
 float age=pvH1(floor(A/30.)*4.1+id)*.7+h1*.3;        // stretches poured together, then panel by panel
 bool fresh=h2<.06;                                   // a replaced panel: newer, lighter, crisp
 float jd=min(px,P-px);                               // distance to the nearest transverse joint
 float ex=min(x,1.5-x);                               // distance to the walk's long edges
 // tooled margins (the edger's smooth band) round each panel
 float margin=max(1.-smoothstep(.03,.045,jd),1.-smoothstep(.07,.085,ex));
 // broom finish: fine striations across the walk (pulled across: they run along x), fading before they would shimmer
 float bf=1.-smoothstep(.0012,.004,e);
 float st=pvN(vec2(A*260.,x*3.+pi*7.))*.6+pvN(vec2(A*520.,x*6.))*.4;
 float sc=pvN(vec2(A*48.,x*1.3+pi*7.))*.7+pvN(vec2(A*95.,x*2.1+pi*3.))*.3;float bc=1.-smoothstep(.006,.02,e);
 float broom=((st-.5)*bf+(sc-.5)*bc*.8)*(1.-margin)*(fresh?1.25:1.-age*.45);
 // joints: control joints every panel; an expansion joint (wider, dark filler) every ten
 float dark=0.,gA=0.,ao=1.;float jx=px<P*.5?px:px-P;
 bool expan=mod(floor(A/P+.5),10.)<.5;
 pvJoint(jx,expan?.013:.007,e,dark,gA,ao,.012);
 // a heaved panel (roots of a big front-yard tree): tilted up toward its far joint, the joint opened into a lit step
 float heave=step(.62,L.a*h3)*(1.-step(.5,float(fresh)));
 float tilt=heave*.018*(px/P);
 float riser=heave*pvLine(px-P+.004,.008,e);
 // cracks: a few panels, corner to edge or straight across, hairline
 float crk=0.;
 if(h3<.05*uPvTune.z||(heave>.5&&h3<.9)){float cx=x/1.5;float path=mix(.2,.8,h2)+(cx-.5)*(h1-.5)*1.2+.025*sin(x*9.+pi);
  crk=pvLine(px/P-path,.0025/P*1.,e/P)*(1.-margin*.5);}
 // stains: leaf tannin under trees; a few old dark spots; efflorescence rarely
 float tannin=L.a*smoothstep(.6,.85,pvF(p*1.7+pi))*(1.-float(fresh))*.6;
 float spot=smoothstep(.83,.95,pvF(p*4.3+11.))*(.3+age*.7)*.5;
 // the lawn edge: soil in the last few cm, grass in a joint now and then
 float soil=(1.-smoothstep(.0,.035,ex))*.6;
 float grass=0.;{float gj=pvH1(pi*5.7+id);if(gj<.18&&ex<.25)grass=pvLine(jx,.012,e)*(1.-smoothstep(.06,.25,ex))*smoothstep(.45,.65,pvN(vec2(x*60.,pi)));}
 // where the walk crosses a driveway: tire wear and a darker, more trafficked surface
 float cutK=1.-smoothstep(.85,.99,k);
 vec3 c=base*mix(vec3(1.),s.a,fresh?.32:.4);
 c*=.975+.05*pvF(p*2.3+pi*.37)+.025*(pvN(p*9.)-.5);// cement paste: a hand-sized mottle, never even
 c*=1.+(h1-.5)*.06*uPvTune.y-age*.035*uPvTune.y+(fresh?.06:0.);
 c*=mix(vec3(1.),vec3(1.012,1.,.975),h2*2.-.5);
 c*=1.+broom*.09;c=mix(c,c*1.035,margin*.8);
 c=mix(c,c*vec3(.86,.78,.66),tannin*uPvTune.z);c=mix(c,c*.78,spot*uPvTune.z);
 c=mix(c,c*vec3(.8,.78,.72),cutK*(.35+.35*pvF(vec2(x*2.,A*.6))));
 c=mix(c,c*vec3(.72,.68,.6),soil);c=mix(c,vec3(.13,.18,.06),grass*.85);
 c=mix(c,c*.4,crk);c=mix(c,c*.38,dark);c=mix(c,c*1.25,riser);
 o.col=c;o.rough=clamp(mix(.82,.96,s.h.g)-margin*.07-cutK*.04+broom*.08,.6,1.);
 o.nm=s.n;o.nmStr=.45*uPvTune.x*(fresh?.85:1.)*(1.-margin*.35);
 o.g=vec2(0.,gA+broom*.9+tilt*1.);o.ao=ao*(1.-crk*.5)*(1.-soil*.25)*mix(1.,s.h.b,.55);return o;}
#endif
#if PV_KIND==4
PvOut pvShade(vec3 base){PvOut o;o.metal=0.;o.low=0.;// driveway: uv = (across from its centre, from the curb face); pv.z = width; pv.w = id
 vec2 p=vec2(vPvW.x,-vPvW.z);float x=vPvUv.x,v=vPvUv.y,W=abs(vPvD.z),id=vPvD.w;
 float e=max(1e-4,max(length(vec2(dFdx(v),dFdy(v))),length(vec2(dFdx(x),dFdy(x)))));
 vec4 T=texture(uPvDrive,vec2((id+.5)/256.,.5));float cond=T.r,car=T.g,kids=T.b,sd=pvH1(id*1.7)*97.,vEnd=T.a*60.;
 PvS s=pvSample(uPvCoA,uPvCoN,uPvCoH,p,2.,.53+sd,.9);
 // slabs: the apron (to 1.65 m), under the sidewalk (to 3.15), then control joints every 3.4 m from 6.35; a centre
 // joint on wide drives
 float dark=0.,gA=0.,ao=1.,gX=0.;
 float vj=v<6.35?(v<2.4?v-1.65:v-3.15):v-6.35-floor((v-6.35)/3.4+.5)*3.4;
 pvJoint(vj,v<4.?.012:.007+cond*.004,e,dark,gA,ao,.012);
 if(W>4.5){float d0=0.,a0=1.;pvJoint(x,.007+cond*.004,e,d0,gX,a0,.012);dark=max(dark,d0);ao*=a0;}
 float slab=v<1.65?0.:v<3.15?1.:2.+floor((v-6.35)/3.4+.5)+(W>4.5&&x>0.?20.:0.);float sh=pvH1(slab*1.7+id*3.1);
 // edges of the drive: tooled margins
 float ex=W*.5-abs(x);float margin=1.-smoothstep(.05,.07,ex);
 // broom finish across the drive
 float bf=1.-smoothstep(.0012,.004,e);
 float bcs=1.-smoothstep(.006,.02,e);
 float broom=(((pvN(vec2(v*240.,x*2.5+slab*3.))*.6+pvN(vec2(v*470.,x*5.))*.4)-.5)*bf+((pvN(vec2(v*46.,x*1.2+slab*5.))*.7+pvN(vec2(v*90.,x*2.))*.3)-.5)*bcs*.8)*(1.-margin)*(1.-cond*.5);
 // tire tracks: one car centred, or two on a double drive; darker toward the garage where cars stop and turn
 float track=0.;{float tw=.2;for(int i=0;i<2;i++){float cx=W>4.5?(i==0?-1.4:1.4):0.;if(W<=4.5&&i>0)break;
   float t1=abs(x-cx-.78),t2=abs(x-cx+.78);track+=exp(-t1*t1/(tw*tw))+exp(-t2*t2/(tw*tw));}}
 track*=(.35+.4*car+.25*cond)*smoothstep(.0,2.5,v)*(.7+.3*pvF(vec2(x*3.,v*.8)));
 // oil under where the car stands (its engine, 1-3 m out from the garage) and older ghosts on worn drives
 float oil=0.;{vec2 r=vec2(x-(W>4.5?(sd>48.?1.4:-1.4):0.),v-(vEnd-2.)-.6*(pvH1(id)-.5))/vec2(.45,.6);
  oil=(1.-smoothstep(.4,1.,length(r)*(1.+.3*(pvF(p*4.)-.5))))*(car*.8+cond*.3);
  oil=max(oil,smoothstep(.78,.92,pvF(p*2.2+id))*cond*.5*step(6.,v));}
 // cracks and discolouration on older drives
 float crk=0.;{float hc=pvH1(slab*3.7+id);if(hc<cond*.45){float path=mix(-W*.4,W*.4,pvH1(slab+id*.3))+(v-floor(v))*0.+.18*sin(v*1.7+slab)+.05*sin(v*7.);crk=pvLine(x-path,.003,e)*step(3.2,v);}}
 float disc=cond*smoothstep(.55,.8,pvF(p*.7+id*.1))*.5;
 // where kids play: ball scuffs under the hoop and faint, rained-on chalk near the street end
 float scuff=kids*smoothstep(.7,.9,pvF(p*6.))*smoothstep(4.,8.,v)*.5;
 vec3 chalk=vec3(0.);float ch=0.;
 if(kids>.5&&pvH1(id+4.)<.6){vec2 q=vec2(x,v-4.6);float blob=smoothstep(.62,.8,pvF(q*1.6+id))*(1.-smoothstep(1.,2.2,length(q*vec2(.9,.7))));
  float hue=pvH(floor(q*2.2+id));ch=blob*.22;chalk=hue<.33?vec3(.95,.62,.70):hue<.66?vec3(.62,.80,.95):vec3(.96,.88,.55);}
 vec3 c=pvLum(base,.72)*mix(vec3(1.),s.a,.4);
 c*=.975+.05*pvF(p*2.1+id)+.025*(pvN(p*9.)-.5);
 c*=1.+(sh-.5)*.07*uPvTune.y-cond*.05+(1.-cond)*.03;
 c*=1.+broom*.08;c=mix(c,c*1.03,margin);
 c=mix(c,c*vec3(.86,.84,.8),disc);
 c=mix(c,c*vec3(.62,.6,.57),track*.32*uPvTune.z);
 c=mix(c,c*vec3(.42,.41,.38),oil*.7*uPvTune.z);
 c=mix(c,c*.7,scuff);c=mix(c,chalk,ch);
 c=mix(c,c*.4,crk);c=mix(c,c*(.4-cond*.12),dark);
 o.col=c;o.rough=clamp(mix(.8,.95,s.h.g)-margin*.06-track*.05-oil*.15+broom*.06,.55,1.);
 o.nm=s.n;o.nmStr=.5*uPvTune.x*(1.-margin*.3);o.g=vec2(gX,gA+broom*.7);o.ao=ao*(1.-crk*.5)*mix(1.,s.h.b,.5);return o;}
#endif
#if PV_KIND==6
PvOut pvShade(vec3 base){PvOut o;o.low=0.;// a cast-iron manhole cover (the cylinder's cap: uv 0..1 across its diameter, 0.72 m)
 vec2 q=(vPvUv-.5)*.72;float r=length(q);float e=max(1e-4,length(vec2(dFdx(r),dFdy(r)))*1.5);vec2 p=vec2(vPvW.x,-vPvW.z);
 // raised parts: the rim, a ring, a waffle of bosses; recesses between
 vec2 gq=q/.042;vec2 gc=fract(gq)-.5;float bx=max(abs(gc.x),abs(gc.y));
 float inner=1.-smoothstep(.255,.262,r),rim=smoothstep(.296,.302,r),ring=pvLine(r-.278,.012,e);
 float boss=(1.-smoothstep(.27,.33,bx))*inner;
 float hole=0.;for(int i=0;i<2;i++){vec2 c=vec2(i==0?.19:-.19,0.);hole=max(hole,1.-smoothstep(.009,.013,length(q-c)));}
 float raised=max(max(boss,rim),ring)*(1.-hole);
 // worn: the tops polished by tires (lighter, metallic, smoother); rust and grit in the recesses
 float rust=smoothstep(.45,.75,pvF(p*14.))*(1.-raised);
 vec3 iron=vec3(.055,.052,.048),top=vec3(.13,.125,.115),rc=vec3(.16,.085,.04);
 vec3 c=mix(iron,top,raised*.85);c=mix(c,rc,rust*.6);c=mix(c,vec3(.015),hole);
 c*=.9+.2*pvF(p*6.);
 // the height field's slope (the bosses' bevels): screen-space bump of a small height
 float h=raised*.003-hole*.01;o.g=vec2(dFdx(h),dFdy(h))*0.;
 o.col=c;o.rough=mix(.82,.42,raised*(1.-rust));o.metal=raised*.55;o.nm=vec3(0.,0.,1.);o.nmStr=0.;o.ao=1.-hole*.8-(1.-raised)*.2;
 o.g=vec2(0.);return o;}
#endif
#if PV_KIND==5
PvOut pvShade(vec3 base){PvOut o;o.metal=0.;o.low=0.;// a house's front walk (uv = metres in the house frame: x across, y along)
 vec2 p=vec2(vPvW.x,-vPvW.z);float x=vPvUv.x,y=vPvUv.y;float e=max(1e-4,max(length(vec2(dFdx(y),dFdy(y))),length(vec2(dFdx(x),dFdy(x)))));
 PvS s=pvSample(uPvCoA,uPvCoN,uPvCoH,p,2.,.21,.9);
 float dark=0.,gA=0.,ao=1.;float jx=y-floor(y/1.2+.5)*1.2;pvJoint(jx,.007,e,dark,gA,ao,.012);
 vec3 c=base*mix(vec3(1.),s.a,.4);c*=1.+(pvH1(floor(y/1.2))-.5)*.06;c=mix(c,c*.4,dark);
 o.col=c;o.rough=clamp(mix(.82,.96,s.h.g),.6,1.);o.nm=s.n;o.nmStr=.75*uPvTune.x;o.g=vec2(0.,gA);o.ao=ao*mix(1.,s.h.b,.5);return o;}
#endif
`;

const shaderHooks=new Set();
// Wrap a material (already carrying its ORIGINAL treatment: surfaceMaterial(...,'asphalt'|'concrete')) with the
// reconstructed pavement. The original look is untouched while PAVE.on is 0.
export function pavementMaterial(m,kind){
 const K=KINDS[kind];if(K===undefined)throw Error('unknown pavement kind '+kind);
 if(m.userData.pvKind!==undefined)return m;
 m.userData.pvKind=kind;m.userData.pvUv=true;m.userData.keep=true;// keep: batched as itself, uv and pv carried by the bake
 const prev=m.onBeforeCompile,prevKey=m.customProgramCacheKey?.bind(m);
 m.onBeforeCompile=(sh,r)=>{prev?.call(m,sh,r);
  Object.assign(sh.uniforms,{uPvOn:PAVE.on,uPvTune:PAVE.tune,uPvDebug:PAVE.debug,uPvWet:PAVE.wet,uPvAsA:PAVE.asA,uPvAsN:PAVE.asN,uPvAsH:PAVE.asH,uPvCoA:PAVE.coA,uPvCoN:PAVE.coN,uPvCoH:PAVE.coH,uPvLayout:PAVE.layout,uPvDrive:PAVE.drive,uPvInlet:PAVE.inlets});
  sh.vertexShader='attribute vec4 pv;\nvarying vec3 vPvW;varying vec2 vPvUv;varying vec4 vPvD;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPvUv=uv;vPvD=pv;vPvW=(modelMatrix*vec4(transformed,1.)).xyz;');
  let f=sh.fragmentShader;
  f='#define PV_KIND '+K+'\n'+COMMON+SURF+f;
  // the reconstructed surface replaces colour, roughness and normal just before the lights read them
  f=f.replace('#include <emissivemap_fragment>',`float pvAO=1.;
  if(uPvOn>.5){PvOut pv=pvShade(diffuse);
   if(uPvWet>.001){float wt=clamp(uPvWet,0.,1.),pud=smoothstep(.55,.85,pv.low)*smoothstep(.5,1.,wt);pv.col*=mix(1.,.58,wt);pv.rough=mix(pv.rough,mix(.42,.08,pud),wt);pv.nmStr*=1.-pud*.9;pv.g*=1.-pud;}
   mat3 TW=pvWorldFrame(nonPerturbedNormal),TS=pvFrame(nonPerturbedNormal);
   vec3 nm=pv.nm;nm.xy*=pv.nmStr;
   vec3 n=normalize(TW*nm);
   n=normalize(n-TS[0]*pv.g.x-TS[1]*pv.g.y);
   metalnessFactor=max(metalnessFactor,pv.metal);normal=n;diffuseColor.rgb=uPvDebug>.5?pv.col*0.+vec3(dot(pv.col,vec3(.3333))):pv.col;roughnessFactor=pv.rough;pvAO=pv.ao;}
  #include <emissivemap_fragment>`);
  f=f.replace('#include <aomap_fragment>','#include <aomap_fragment>\n reflectedLight.indirectDiffuse*=pvAO;reflectedLight.indirectSpecular*=pvAO;reflectedLight.directDiffuse*=mix(1.,pvAO,.45);');
  sh.fragmentShader=f;shaderHooks.add(kind);};
 m.customProgramCacheKey=()=>(prevKey?prevKey():'')+'|ll-pave-'+K;m.needsUpdate=true;return m;
}

// ------------------------------------------------------------------------------------------------- textures (async)
function urlFor(file){const packed=globalThis.__LL_ASSETS__?.[file];if(packed)return packed;if(globalThis.__LL_OFFLINE__)throw Error(`asset ${file} is not embedded in this offline package (package with PLAYTEST_MODELS=1)`);return new URL('./'+file,import.meta.url).href;}
export async function loadPavementTextures(renderer){
 const loader=new THREE.TextureLoader(),aniso=renderer?.capabilities?.getMaxAnisotropy?.()??1,t0=performance.now(),info={files:[],bytes:0,aniso};
 const load=file=>new Promise((res,rej)=>{let u;try{u=urlFor(file);}catch(e){rej(e);return;}loader.load(u,t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;t.anisotropy=aniso;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.name=file;info.files.push({file,w:t.image.width,h:t.image.height});res(t);},undefined,()=>rej(Error('could not load '+file)));});
 const [aA,aN,aH,cA,cN,cH]=await Promise.all([TEXTURES.asphalt.albedo,TEXTURES.asphalt.normal,TEXTURES.asphalt.hra,TEXTURES.concrete.albedo,TEXTURES.concrete.normal,TEXTURES.concrete.hra].map(load));
 Object.assign(info,{ms:+(performance.now()-t0).toFixed(0)});
 PAVE.asA.value=aA;PAVE.asN.value=aN;PAVE.asH.value=aH;PAVE.coA.value=cA;PAVE.coN.value=cN;PAVE.coH.value=cH;
 // GPU estimate: RGBA8 + full mip chain
 info.gpuMB=+(info.files.reduce((s,f)=>s+f.w*f.h*4*4/3,0)/1048576).toFixed(1);
 return info;
}

// ------------------------------------------------------------------------------------------- the street layout map
// rows: 0/1 Oak Hollow Drive left/right (lat < 0 / > 0), 2/3 Briarwood (v < 0 / > 0), 4/5 Summerfield; x = d (or u) + 500,
// one texel per metre. R driveway cut (1 inside), G storm inlet nearby, B where cars park at the curb, A front-yard
// trees near the street.
export function buildLayoutMap(info){
 const Wd=2048,H=8,data=new Float32Array(Wd*H*4);const at=(row,d)=>{const i=Math.round(d+500);return i>=0&&i<Wd?(row*Wd+i)*4:-1;};
 const add=(row,d0,d1,ch,fn)=>{for(let d=Math.floor(d0);d<=Math.ceil(d1);d++){const k=at(row,d);if(k>=0)data[k+ch]=Math.max(data[k+ch],fn(d));}};
 for(const c of info.cuts){const row=c.row;add(row,c.u0-1.5,c.u1+1.5,0,d=>d>=c.u0-.3&&d<=c.u1+.3?1:.4);}
 for(const n of info.inlets){add(n.row,n.d-12,n.d+12,1,d=>Math.max(0,1-Math.abs(d-n.d)/12)**1.5);}
 // parking: everywhere along the curb except at the cuts, the junction mouths and near hydrants, with a slow
 // occupancy (some stretches are where people park, others not)
 for(let row=0;row<6;row++){const len=row<2?1640:260;for(let i=0;i<len;i++){const d=(row<2?-470:0)+i;const k=at(row,d);if(k<0)continue;
  const occ=.5+.5*Math.sin(d*.037+row*1.7)*Math.sin(d*.011+row);data[k+2]=Math.max(0,occ)*(1-data[k]);}}
 for(const m of info.mouths){add(m.row,m.d0,m.d1,2,()=>0);for(let d=Math.floor(m.d0);d<=Math.ceil(m.d1);d++){const k=at(m.row,d);if(k>=0)data[k+2]=0;}}
 for(const t of info.trees){add(t.row,t.d-t.r,t.d+t.r,3,d=>Math.max(0,1-Math.abs(d-t.d)/t.r)*t.w);}
 const u8=new Uint8Array(Wd*H*4);for(let i=0;i<u8.length;i++)u8[i]=Math.round(Math.min(1,Math.max(0,data[i]))*255);
 const tex=new THREE.DataTexture(u8,Wd,H,THREE.RGBAFormat);tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;tex.needsUpdate=true;tex.name='pavement-layout';
 PAVE.layout.value=tex;
 // driveways: R condition (0 kept .. 1 old), G a car parks there, B kids (a hoop, chalk), A the drive's length / 60
 const dt=new Uint8Array(256*4);for(const d of info.drives){if(d.id<0||d.id>255)continue;dt[d.id*4]=Math.round(d.cond*255);dt[d.id*4+1]=d.car?255:0;dt[d.id*4+2]=d.kids?255:0;dt[d.id*4+3]=Math.round(Math.min(1,d.len/60)*255);}
 const dtex=new THREE.DataTexture(dt,256,1,THREE.RGBAFormat);dtex.minFilter=dtex.magFilter=THREE.NearestFilter;dtex.needsUpdate=true;dtex.name='pavement-drives';PAVE.drive.value=dtex;
 return {layoutBytes:u8.length,drives:info.drives.length};
}

// ---------------------------------------------------------------------------------------------- geometry helpers
// (used by streets.js / houses.js only when the world is built with the pavement flag)
// uv: surface coordinates in metres; pv: (along direction x, z in the world; handedness * curb-cut factor; row or id)
export function setPv(geo,uv,pv){geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('pv',new THREE.Float32BufferAttribute(pv,4));return geo;}
