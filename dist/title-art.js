// The title screen's artwork: Oak Hollow from under the old oak, looking back down the street at the last of the light,
// and above the houses something in the sky that should not be there. It is title art, not gameplay: a plate repainted
// from the game's own geometry (tools/title-art/, title-art-assets.js), composited live here with
//   * a living sky: the earth's shadow rising cold over the houses, the pink band above it, clouds, and a vast dark
//     absence in the cloud deck that draws the clouds into it and throws dark shafts down toward the street;
//   * depth haze and a slow ground mist; the warm windows and lamps bleeding into the dark (halation);
//   * an analog memory treatment over the picture only (fine grain, softness, slight colour bleed at hard edges,
//     a gentle vignette, gate weave, rare instability), at the strength chosen in Settings; the interface stays sharp;
//   * a few things that happen to a damaged memory: a bike that is gone while its shadow stays, a house that comes
//     apart into the haze, darkness passing through the clouds, the lights flinching after a bell.
// Drawn with the game's own renderer while the title is up (the 3D world is not drawn behind it); nothing here touches
// the game's state. Without a real browser image decoder (the headless harness) it reports unavailable, and the game
// shows the first redesign's live title scene instead.
import * as THREE from './three.module.js';
import {TITLE_ART} from './title-art-assets.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
// Each mood is the same place: what changes is how much of the evening is left, and how much of the sky is wrong.
export const ART_MOODS={
 summer:{shadow:[.30,.33,.46],belt:[.93,.58,.62],low:[.62,.45,.66],high:[.27,.22,.38],cloudLit:[.98,.68,.72],cloudDark:[.34,.26,.42],haze:[.46,.38,.54],
  hazeAmt:.62,void:.95,voidSize:1.0,shafts:.55,crimson:0,warm:1.0,sat:1.05,exposure:1.18,mist:.55},
 search:{shadow:[.20,.23,.36],belt:[.70,.46,.58],low:[.42,.34,.56],high:[.14,.135,.25],cloudLit:[.74,.54,.66],cloudDark:[.20,.17,.30],haze:[.34,.31,.46],
  hazeAmt:.66,void:1.0,voidSize:1.15,shafts:.8,crimson:.06,warm:.85,sat:.85,exposure:1.05,mist:.7},
 after:{shadow:[.12,.12,.17],belt:[.36,.27,.32],low:[.22,.19,.26],high:[.06,.055,.08],cloudLit:[.40,.31,.34],cloudDark:[.10,.09,.12],haze:[.21,.20,.25],
  hazeAmt:.7,void:1.0,voidSize:1.3,shafts:.95,crimson:.3,warm:.55,sat:.5,exposure:1.0,mist:.85}};
const MEMORY={off:0,subtle:.55,standard:1};

const VERT='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const FRAG=`precision highp float;
varying vec2 vUv;
uniform sampler2D uPlate,uAux,uPatch;uniform vec4 uPatchRect;uniform float uPatchMix;
uniform vec2 uRes,uPointer;uniform float uTime,uFrame,uPlateAspect,uFocusX,uPush;
uniform vec3 uShadow,uBelt,uLow,uHigh,uCloudLit,uCloudDark,uHaze;
uniform float uVoid,uVoidSize,uShafts,uCrimson,uHazeAmt,uWarm,uSat,uExposure,uMist;
uniform float uMem,uMotion,uDark,uSlip,uEraseAmt,uLamp,uFade;uniform vec4 uErase;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return v;}
float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.07+vec2(5.3,1.7);a*=.5;}return v;}
const float HZ=.413;// the horizon in the plate (from the capture camera's pitch)
const vec2 VC=vec2(.79,.745);// where the absence sits: over the houses at the far right of the street, clear of the oak
vec3 sky(vec2 pu,float t){
 float e=max(pu.y-HZ,0.),asp=uPlateAspect;
 // the earth's shadow rising cold over the houses, the rose band above it, then a low lavender overcast lit from below
 vec3 c=mix(uShadow,uBelt*1.1,smoothstep(.01,.065,e));c=mix(c,uLow,smoothstep(.08,.26,e));c=mix(c,uHigh,smoothstep(.24,.7,e));
 vec2 q=(pu-VC)*vec2(asp,1.)/uVoidSize;
 float slow=t*.006;
 // the absence: a vast irregular mass in the cloud deck, wider than it is tall, its lower edge hanging toward the street
 float lump=fbm(q*vec2(1.6,2.8)+vec2(31.7+slow,-4.2-slow*.6))-.5,lump2=fbm(q*vec2(4.,7.)-vec2(slow*1.7,-12.3))-.5;
 float hang=q.y<0.?smoothstep(.0,-.2,q.y)*smoothstep(.6,.1,abs(q.x))*(fbm3(vec2(q.x*9.,q.y*.7+slow))-.3):0.;
 float d=length(q*vec2(.6,1.9))+lump*.38+lump2*.16-hang*.5;
 float voidM=(1.-smoothstep(.215,.26,d))*uVoid;
 // clouds: a broken deck compressed toward the horizon, lit rose from below; near the absence they are drawn out and turned toward it
 float pull=exp(-max(d-.22,0.)*3.2);
 float ang=pull*1.1+slow*2.;mat2 R=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
 vec2 cq=R*q;
 vec2 cuv=vec2(pu.x*asp*1.1+t*.004,(1./(e+.1))*.5);
 vec2 pulled=vec2(atan(cq.y,cq.x)*1.6,length(cq)*7.-slow*6.);// streams wound in toward it
 float cl=fbm(mix(cuv*vec2(1.6,2.4),pulled,pull*.85));
 float shade=fbm3(cuv*vec2(3.,5.)+3.1);
 cl=smoothstep(.36,.72,cl+fbm3(cuv*6.)*.12-.03);
 float lit=1.-smoothstep(.0,.55,e);
 // undersides lit rose by the last of the light, the tops gone dark: the deck has form
 vec3 cloud=mix(uCloudDark,uCloudLit,clamp(smoothstep(.2,.6,shade+lit*.45)*(.35+.65*lit),0.,1.)*(1.-pull*.75));
 c=mix(c,cloud,cl*(.6+.3*lit));
 // the light around it is taken: the clouds dim toward it, as if it drew the evening in
 c*=1.-.6*uVoid*pull*(1.-voidM);
 // the dark shafts: the evening light blocked from above, in rays fanning down from the mass onto the street
 vec2 sq=(pu-VC)*vec2(asp,1.);float a=atan(sq.x,-sq.y),below=smoothstep(-.03,-.2,sq.y);
 float rays=smoothstep(.5,.85,noise(vec2(a*8.,slow*3.))*.7+noise(vec2(a*21.,1.7+slow*5.))*.45);
 c*=1.-uShafts*.45*rays*below*(1.-smoothstep(.15,.75,abs(a)))*smoothstep(.0,.04,e);
 // the absence itself: not black, a deep cold violet with slow folds inside; a broken seam of pale light at its edge
 float folds=smoothstep(.3,.75,fbm3(vec2(q.x*3.+slow,q.y*9.-slow*.5)));
 vec3 inner=vec3(.004,.004,.009)+vec3(.022,.015,.034)*folds*(1.-smoothstep(.0,.2,d));
 float rim=exp(-pow((d-.262)/.012,2.))*smoothstep(.4,.72,fbm3(q*6.+slow*2.))*.5*uVoid;
 vec3 seam=mix(vec3(.9,.7,.85),vec3(.6,.07,.1),uCrimson);
 c=mix(c,inner,voidM);c+=seam*rim*(1.-voidM*.6);
 // the crimson memory (after): low, along the lower edge only
 c+=vec3(.32,.03,.05)*uCrimson*smoothstep(.1,.0,abs(d-.33))*smoothstep(.05,-.15,q.y);
 // darkness passing through the clouds (an event)
 float front=smoothstep(.0,.35,uDark)*(1.-smoothstep(.65,1.,uDark));
 float pass=smoothstep(.55,.0,abs(pu.x-mix(VC.x,.1,uDark)))*fbm3(pu*vec2(4.,7.)+t*.05);
 c*=1.-front*pass*.75*step(HZ-.01,pu.y);
 return c;}
vec4 aux(vec2 u){return texture2D(uAux,u);}
vec3 plate(vec2 u){vec3 p=texture2D(uPlate,u).rgb;
 vec2 r=(u-uPatchRect.xy)/uPatchRect.zw;if(uPatchMix>0.&&all(greaterThan(r,vec2(0.)))&&all(lessThan(r,vec2(1.)))){
  float edge=smoothstep(0.,.12,min(min(r.x,1.-r.x),min(r.y,1.-r.y)));p=mix(p,texture2D(uPatch,r).rgb,uPatchMix*edge);}
 return p;}
void main(){
 vec2 res=uRes,uv=vUv;
 // the plate covers the screen (16:9 artwork, cropped toward the street on narrow screens)
 float sa=res.x/res.y;vec2 pu=uv;
 if(sa>uPlateAspect){float k=uPlateAspect/sa;pu.y=(uv.y-.5)*k+.5;}else{float k=sa/uPlateAspect;pu.x=(uv.x-.5)*k+uFocusX;}
 // a held camera: a very slow push, the pointer leaning the view by depth, a breath of gate weave
 pu=(pu-vec2(.5,.45))/(1.+uPush)+vec2(.5,.45);
 float t=uTime;
 vec2 weave=uMotion*uMem*vec2(noise(vec2(t*.9,1.))-.5,noise(vec2(2.,t*.7))-.5)*.0009;
 pu+=weave;
 // memory slip (an event): a band of the picture loses its hold for a moment
 float band=uSlip*exp(-pow((uv.y-fract(.8-t*.07))*14.,2.));
 pu.x+=band*(noise(vec2(uv.y*80.,t*20.))-.5)*.02*uMotion;
 vec4 A=aux(pu);float depth=A.g;
 vec2 par=uPointer*vec2(-.006,.004)*uMotion*(A.r>.5?depth:0.);
 vec2 fu=pu+par;
 vec4 B=aux(fu);
 vec3 fg=plate(fu);
 float fl=dot(fg,vec3(.2126,.7152,.0722)),keep=smoothstep(.42,.7,fl)*step(fg.b*1.08,fg.r);
 vec3 dark=pow(fg,vec3(1.35))*mix(.42,.9,smoothstep(.16,.6,B.g))*vec3(.74,.78,.92);
 fg=mix(dark,fg,keep);
 // softness: an old recording, not a stretched picture
 float soft=uMem*.6+uSlip*.8;
 vec2 px=(sa>uPlateAspect?vec2(1.,uPlateAspect/sa):vec2(sa/uPlateAspect,1.))/res;// (one screen pixel, in the plate's coordinates: the crop magnifies it on narrow screens)
 vec3 blurred=(plate(fu+vec2(px.x,0.)*1.4)+plate(fu-vec2(px.x,0.)*1.4)+plate(fu+vec2(0.,px.y)*1.2)+plate(fu-vec2(0.,px.y)*1.2))*.25;
 fg=mix(fg,mix(pow(blurred,vec3(1.35))*mix(.42,.9,smoothstep(.16,.6,B.g))*vec3(.74,.78,.92),blurred,keep),soft*.7);
 // the far houses and trees sink into the evening's haze; a slow mist moves along the street
 float hz=uHazeAmt*smoothstep(.3,.08,B.g)*B.r;
 vec3 S=sky(pu,t);
 vec3 hazeC=mix(uHaze,S,.35);
 fg=mix(fg,hazeC,hz*.8);
 float mist=uMist*fbm3(vec2(pu.x*5.+t*.012,pu.y*18.))*smoothstep(.2,.4,pu.y)*smoothstep(.5,.42,pu.y)*smoothstep(.62,.25,B.g);
 fg=mix(fg,hazeC*1.05,mist*.32);
 // a house that comes apart into the haze (an event): its silhouette goes, the sky comes through
 vec2 er=(pu-uErase.xy)/uErase.zw;float inE=step(0.,er.x)*step(er.x,1.)*step(0.,er.y)*step(er.y,1.);
 float dis=inE*uEraseAmt*smoothstep(.1,.22,B.g)*(1.-smoothstep(.46,.6,B.g));
 dis*=smoothstep(.25,.75,fbm3(pu*vec2(60.,40.)+t*.3)+uEraseAmt*.6-.3)*smoothstep(0.,.15,min(min(er.x,1.-er.x),min(er.y,1.-er.y)));
 float alpha=B.r*(1.-dis);
 vec3 col=mix(S,fg,alpha);
 // colour bleed at hard edges, like an old tape's chroma
 float cb=uMem*1.6+band*30.;
 if(cb>.01){vec2 o=vec2(px.x*cb,0.);vec4 Br=aux(fu+o),Bb=aux(fu-o);
  col.r=mix(S.r,mix(plate(fu+o).r,hazeC.r,hz*.8),Br.r*(1.-dis));col.b=mix(S.b,mix(plate(fu-o).b,hazeC.b,hz*.8),Bb.r*(1.-dis));}
 // halation: the sky spills over the dark silhouettes' edges; the warm lights bleed into the dark
 col+=S*.32*clamp((1.-B.a)*alpha,0.,1.)*(.6+.4*uMem);
 col+=vec3(1.,.62,.32)*B.b*.62*uWarm*uLamp*mix(.4,1.,alpha);
 // grade: the mood's saturation and exposure, a vignette that closes the edges
 float l=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(l),col,uSat);
 vec2 vv=(uv-vec2(.52,.5))*vec2(sa/1.6,1.);col*=1.-.52*smoothstep(.25,.95,length(vv))*(.75+.25*uMem);
 col*=uExposure*(1.+uMotion*.025*sin(t*.21)*uMem);
 col=mix(col,vec3(dot(col,vec3(.3,.5,.2))),band*.6);
 // fine film grain, strongest in the midtones (fixed in place when motion is reduced)
 float g=hash(gl_FragCoord.xy+fract(uFrame*uMotion*.6180339)*vec2(97.,13.))-.5;
 col+=g*.075*uMem*(.35+.65*smoothstep(.0,.35,l))*(1.-smoothstep(.6,1.,l));
 gl_FragColor=vec4(clamp(col,0.,1.)*uFade,1.);}`;

export function createTitleArt({renderer}){
 const available=typeof Image==='function'&&typeof document!=='undefined'&&typeof document.createElement==='function'&&!!renderer?.capabilities&&typeof renderer.getContext==='function';
 let mat=null,scene=null,cam=null,mood='summer',active=false,ready=false,time=0,frame=0,reduce=false,memory='standard';
 const textures={},handlers={};let loading=null;
 const emit=(n,d)=>{try{handlers[n]?.(d);}catch{}};
 const U={uPlate:{value:null},uAux:{value:null},uPatch:{value:null},uPatchRect:{value:new THREE.Vector4(0,0,1,1)},uPatchMix:{value:0},uRes:{value:new THREE.Vector2(1920,1080)},uPointer:{value:new THREE.Vector2()},
  uTime:{value:0},uFrame:{value:0},uPlateAspect:{value:16/9},uFocusX:{value:.47},uPush:{value:0},uShadow:{value:new THREE.Vector3()},uBelt:{value:new THREE.Vector3()},uLow:{value:new THREE.Vector3()},uHigh:{value:new THREE.Vector3()},
  uCloudLit:{value:new THREE.Vector3()},uCloudDark:{value:new THREE.Vector3()},uHaze:{value:new THREE.Vector3()},uVoid:{value:1},uVoidSize:{value:1},uShafts:{value:.5},uCrimson:{value:0},uHazeAmt:{value:.6},uWarm:{value:1},uSat:{value:1},
  uExposure:{value:1},uMist:{value:.5},uMem:{value:1},uMotion:{value:1},uDark:{value:0},uSlip:{value:0},uEraseAmt:{value:0},uErase:{value:new THREE.Vector4(.672,.39,.125,.125)},uLamp:{value:1},uFade:{value:0}};
 function image(src){return new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=fail;im.src=src;});}
 async function load(m){if(textures[m])return textures[m];const a=TITLE_ART[m];const [p,x,pa]=await Promise.all([image(a.plate),image(a.aux),image(a.patch)]);
  const tex=(im,linear=true)=>{const t=new THREE.Texture(im);t.colorSpace=THREE.NoColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;};
  textures[m]={plate:tex(p),aux:tex(x),patch:tex(pa),rect:a.rect};return textures[m];}
 function build(){if(mat)return;mat=new THREE.ShaderMaterial({vertexShader:VERT,fragmentShader:FRAG,uniforms:U,depthTest:false,depthWrite:false,toneMapped:false});
  scene=new THREE.Scene();const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;scene.add(q);cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);}
 function applyMood(){const M=ART_MOODS[mood];for(const k of ['shadow','belt','low','high','cloudLit','cloudDark','haze'])U['u'+k[0].toUpperCase()+k.slice(1)].value.set(...M[k]);
  U.uVoid.value=M.void;U.uVoidSize.value=M.voidSize;U.uShafts.value=M.shafts;U.uCrimson.value=M.crimson;U.uHazeAmt.value=M.hazeAmt;U.uWarm.value=M.warm;U.uSat.value=M.sat;U.uExposure.value=M.exposure;U.uMist.value=M.mist;
  const T=textures[mood];if(T){U.uPlate.value=T.plate;U.uAux.value=T.aux;U.uPatch.value=T.patch;U.uPatchRect.value.set(T.rect.x,1-T.rect.y-T.rect.h,T.rect.w,T.rect.h);}}
 // ---- what happens to the memory (the event director) ----------------------------------------------------------
 let ev=[],timers=[],seed=0x1ab7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const at=(s,fn)=>timers.push({at:time+s,fn});
 function anim(name,dur,fn,done){ev.push({name,t:0,dur,fn,done});}
 function plan(){timers=[];
  // first: a bike that is not there any more, while its shadow still lies on the grass (summer and search)
  at(14+rnd()*8,function absence(){if(mood!=='after')bikeGone();at(70+rnd()*40,absence);});
  // darkness moving through the clouds, away from the absence
  at(30+rnd()*15,function dark(){anim('dark',14,u=>{U.uDark.value=u;});emit('dark');at(55+rnd()*35,dark);});
  // a house comes apart into the haze and comes back
  at(mood==='after'?20:44+rnd()*20,function erase(){houseGoes();at(80+rnd()*50,erase);});
  // a bell far off, twice; then the evening stops (the menu's sound goes quiet; the lights flinch)
  at(52+rnd()*25,function bell(){bellThenSilence();at(85+rnd()*55,bell);});}
 function bellThenSilence(){emit('bell',{twice:true});at(2.7,()=>{emit('silence',{dur:4.5});anim('lamp',4.8,u=>{U.uLamp.value=1-.55*Math.sin(Math.PI*u);});});}
 function slip(dur=.9){if(reduce)return;anim('slip',dur,u=>{U.uSlip.value=Math.sin(Math.PI*u);});}
 function bikeGone(){slip(.8);at(.45,()=>{U.uPatchMix.value=1;emit('absence',{gone:true});});const hold=7+rnd()*6;at(.45+hold,()=>{slip(.7);at(.35,()=>{U.uPatchMix.value=0;emit('absence',{gone:false});});});}
 function houseGoes(){emit('erase',{});anim('erase',9,u=>{U.uEraseAmt.value=u<.3?smooth(u/.3)*.95:u>.7?.95*(1-smooth((u-.7)/.3)):.95;});}
 // ---- public ---------------------------------------------------------------------------------------------------
 async function show(m='summer'){if(!available)return false;mood=ART_MOODS[m]?m:'summer';build();active=true;
  try{await (loading=load(mood));}catch(e){active=false;return false;}if(!active)return false;
  applyMood();ready=true;time=0;ev=[];U.uPatchMix.value=0;U.uEraseAmt.value=0;U.uDark.value=0;U.uSlip.value=0;U.uLamp.value=1;U.uFade.value=0;plan();emit('ready',{mood});return true;}
 function hide(){active=false;ev=[];timers=[];U.uPatchMix.value=0;U.uEraseAmt.value=0;U.uFade.value=0;}
 function update(dt){if(!active||!ready)return;time+=dt;frame++;U.uTime.value=reduce?0:time;U.uFrame.value=frame;U.uFade.value=Math.min(1,U.uFade.value+dt/1.6);
  U.uPush.value=reduce?0:.035*smooth((Math.sin(time*.025-1.57)+1)/2);
  for(const x of timers.slice())if(time>=x.at){timers.splice(timers.indexOf(x),1);x.fn();}
  for(const e of ev.slice()){e.t+=dt;const u=Math.min(1,e.t/e.dur);e.fn(u);if(u>=1){ev.splice(ev.indexOf(e),1);e.done?.();}}}
 function render(dt=0){if(!active||!ready||!mat)return false;update(dt);const s=renderer.getSize(new THREE.Vector2());const pr=renderer.getPixelRatio();U.uRes.value.set(s.x*pr,s.y*pr);U.uFocusX.value=s.x/Math.max(1,s.y)<1.2?.6:.47;// (narrow screens: crop toward the absence, the oak still at the left)
  const keep=renderer.toneMapping;renderer.toneMapping=THREE.NoToneMapping;try{renderer.setRenderTarget(null);renderer.render(scene,cam);}finally{renderer.toneMapping=keep;}return true;}
 return {show,hide,render,update,
  get available(){return available;},get active(){return active&&ready;},get mood(){return mood;},
  setMood(m){if(!ART_MOODS[m]||m===mood)return;show(m);},
  set memory(v){memory=MEMORY[v]!==undefined?v:'standard';U.uMem.value=MEMORY[memory];},get memory(){return memory;},
  set reduceMotion(v){reduce=!!v;U.uMotion.value=reduce?0:1;},
  pointer(x,y){U.uPointer.value.set(clamp(x,-1,1),clamp(y,-1,1));},
  on(n,fn){handlers[n]=fn;},
  // QA: trigger an event now, or hold one state for a capture
  trigger(name){if(name==='absence')bikeGone();else if(name==='erase')houseGoes();else if(name==='dark'){anim('dark',14,u=>{U.uDark.value=u;});}else if(name==='slip')slip(1.2);else if(name==='bell')bellThenSilence();},
  hold(state={}){for(const [k,v] of Object.entries(state))if(U[k])U[k].value=v;},
  get state(){return {available,active:active&&ready,mood,memory,reduce,time:+time.toFixed(2),patch:U.uPatchMix.value,erase:+U.uEraseAmt.value.toFixed(2),dark:+U.uDark.value.toFixed(2),slip:+U.uSlip.value.toFixed(2),fade:+U.uFade.value.toFixed(2)};},
  uniforms:U};
}
