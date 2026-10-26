// Chapter Six: the thunderstorm that comes in over the ridge in the afternoon. The sky's cover and the light are game.js's
// (the chapter's light() says how much storm); here: the rain (streaks falling round wherever you are, slanted by the wind,
// thinned to nothing indoors), lightning (a flash the light and the sky both take, then the thunder, later the farther
// it is) and the drip of it all off the edges afterwards.
import * as THREE from './three.module.js';
import {clamp,damp} from './chapter6-kit.js';

export function createStorm({scene,camera,sfx=()=>{},random=Math.random}){
 const N=2600,BOX={w:34,h:16},pos=new Float32Array(N*2*3),seed=new Float32Array(N*2);
 for(let i=0;i<N;i++){const x=(random()-.5)*BOX.w,y=random()*BOX.h,z=(random()-.5)*BOX.w,s=random();for(const k of [0,1]){pos.set([x,y,z],(i*2+k)*3);seed[i*2+k]=s+k*10;}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('seed',new THREE.BufferAttribute(seed,1));
 const U={uT:{value:0},uC:{value:new THREE.Vector3()},uRain:{value:0},uWind:{value:new THREE.Vector2(.9,.25)},uFlash:{value:0}};
 const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:false,
  vertexShader:`attribute float seed;uniform float uT,uRain;uniform vec3 uC;uniform vec2 uWind;varying float vA;
   void main(){float s=fract(seed),tail=step(5.,seed);vec3 p=position;float fall=9.5+s*3.;p.y=mod(p.y-uT*fall,${BOX.h.toFixed(1)});
    p.xz+=uWind*(${BOX.h.toFixed(1)}-p.y)*.08;p.xz=mod(p.xz-uC.xz+${(BOX.w/2).toFixed(1)},${BOX.w.toFixed(1)})-${(BOX.w/2).toFixed(1)}+uC.xz;p.y+=uC.y-4.;
    p.y+=tail*.55;p.xz-=tail*uWind*.045;vA=uRain*step(s,uRain*1.05)*(1.-tail*.85);
    vec4 mv=modelViewMatrix*vec4(p,1.);vA*=smoothstep(30.,6.,-mv.z)*smoothstep(.3,1.2,-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;uniform float uFlash;void main(){gl_FragColor=vec4(vec3(.72,.76,.8)+uFlash*.6,vA*.42);}`});
 const rain=new THREE.LineSegments(geo,mat);rain.frustumCulled=false;rain.name='chapter6-rain';rain.renderOrder=6;
 const S={t:0,storm:0,rain:0,flash:0,next:8,strikes:[],thunder:[],indoor:0,count:0};
 function strike(dist=null){const d=dist??(random()<.3?300+random()*500:900+random()*2400);S.strikes.push({t:0,peak:clamp(1.6-d/1800,.25,1)});S.thunder.push({at:S.t+d/343,d});S.count++;}
 function update(dt,{storm=0,rain:wet=0,indoor=0,lightning=true}={}){S.t+=dt;S.storm=storm;S.rain=damp(S.rain,wet,.6,dt);S.indoor=damp(S.indoor,indoor,6,dt);
  U.uT.value=S.t;U.uC.value.copy(camera.position);U.uRain.value=S.rain*(1-S.indoor);rain.visible=U.uRain.value>.01;
  if(lightning&&storm>.45){S.next-=dt;if(S.next<=0){strike();S.next=(storm>.8?7:16)+random()*(storm>.8?10:22);}}
  let f=0;for(let i=S.strikes.length-1;i>=0;i--){const s=S.strikes[i];s.t+=dt;const k=s.t<.08?1:s.t<.16?.25:s.t<.26?.8:Math.max(0,1-(s.t-.26)/.5);f=Math.max(f,k*s.peak);if(s.t>.8)S.strikes.splice(i,1);}
  S.flash=f;U.uFlash.value=f;
  for(let i=S.thunder.length-1;i>=0;i--){const q=S.thunder[i];if(S.t>=q.at){sfx(q.d<700?'c6Crack':'c6Thunder',null,{gain:clamp(1.25-q.d/2600,.25,1)*(1-S.indoor*.55)});S.thunder.splice(i,1);}}}
 function attach(on){if(on&&!rain.parent)scene.add(rain);else if(!on&&rain.parent)rain.removeFromParent();}
 function reset(){S.t=0;S.storm=0;S.rain=0;S.flash=0;S.next=8;S.strikes.length=0;S.thunder.length=0;S.indoor=0;S.count=0;U.uRain.value=0;U.uFlash.value=0;rain.visible=false;}
 return {S,rain,strike,update,attach,reset,get flash(){return S.flash;}};
}
