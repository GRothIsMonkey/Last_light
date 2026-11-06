// Chapter Eight: the thing itself, as much of it as gets into a room. Never a whole body, never a face: limbs far too big
// for the places they come into, thick as a culvert where they come out of the wall or the ground and narrowing to a
// length of something like a finger as long as a car; a mass behind the original barrier that leans on it; and what
// they do to concrete, steel, asphalt and cars. Nothing glows. It is dark, wet and slow until it is not.
//
// A limb is a chain of overlapping segments (one instanced mesh for all of them) along a curve from its root (where it
// comes through: a wall, the throat, a hole in a road) to its tip. It has a state the chapter sets:
//   hidden    nothing of it in the world
//   emerge    pushing out along its path over a few seconds (the root opens first)
//   probe     its tip moving slowly about a point, feeling for something
//   strike    the tip thrown at a point fast, then held there with its weight on it (the chapter is told when it lands)
//   drag      the tip pulled back along a line toward its root, with whatever it took hold of
//   retract   going back the way it came
// Debris (chunks of concrete or asphalt, instanced) fly from where it lands and bounce on the floor function the chapter
// gives; dust hangs in the air afterwards. The chapter shakes the view by the impact's distance (impact()).
import * as THREE from './three.module.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const SEG=34;// segments per limb
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_d=new THREE.Vector3(),_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);

export function createPresence({scene,sfx=()=>{},floorAt=()=>0}){
 const group=new THREE.Group();group.name='chapter8-presence';
 const U={t:{value:0},wet:{value:1}};
 // the skin: dark, wet, a slow ripple along its length (vertex), a little paler in the folds (fragment): never emissive
 const skin=new THREE.MeshStandardMaterial({color:0x2a2120,roughness:.32,metalness:.08});skin.name='c8-presence-skin';
 skin.onBeforeCompile=sh=>{sh.uniforms.uT=U.t;sh.vertexShader='uniform float uT;\nvarying float vFold;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
   vec3 wpI=(instanceMatrix*vec4(position,1.)).xyz;
  #else
   vec3 wpI=position;
  #endif
  float rip=sin(wpI.x*1.7+wpI.z*1.3+uT*1.6)*sin(wpI.y*2.1-uT*1.1);transformed+=normal*rip*.11;vFold=rip;`);
  sh.fragmentShader='varying float vFold;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=1.0+.35*smoothstep(.3,.9,vFold);');};
 skin.customProgramCacheKey=()=>'c8-presence-skin';
 const N=6,inst=new THREE.InstancedMesh(new THREE.SphereGeometry(1,14,10),skin,N*SEG);inst.name='c8-presence-limbs';inst.frustumCulled=false;inst.castShadow=true;inst.receiveShadow=true;group.add(inst);
 for(let i=0;i<N*SEG;i++){_m.makeScale(0,0,0);inst.setMatrixAt(i,_m);}
 const limbs=[...Array(N)].map((_,i)=>({i,state:'hidden',t:0,ext:0,root:new THREE.Vector3(),dir:new THREE.Vector3(0,1,0),tip:new THREE.Vector3(),tipV:new THREE.Vector3(),want:new THREE.Vector3(),
  r0:1.6,r1:.28,len:14,bend:new THREE.Vector3(),probe:new THREE.Vector3(),probeR:1.2,speed:1,onLand:null,landed:false,hold:0,dragTo:null,phase:Math.random()*6,pts:[],seen:0}));
 // the mass behind the barrier: a huge rounded swell with the ripple, pushed forward by the chapter (lean 0..1)
 const massG=new THREE.SphereGeometry(1,40,28),mass=new THREE.Mesh(massG,skin);mass.name='c8-presence-mass';mass.visible=false;group.add(mass);
 const M={lean:0,leanTo:0,at:new THREE.Vector3(),r:9,squash:new THREE.Vector3(1.3,1,.7)};
 // ---- debris and dust ------------------------------------------------------------------------------------------------
 const chunkM=new THREE.MeshStandardMaterial({color:0x6e6a62,roughness:.95});chunkM.name='c8-debris';const DN=90,chunks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),chunkM,DN);chunks.name='c8-debris';chunks.frustumCulled=false;chunks.castShadow=true;group.add(chunks);
 const deb=[...Array(DN)].map(()=>({on:false,p:new THREE.Vector3(),v:new THREE.Vector3(),r:.2,rot:new THREE.Euler(),w:new THREE.Vector3(),rest:0}));let di=0;
 const dustM=new THREE.SpriteMaterial({color:0x8d887e,transparent:true,opacity:0,depthWrite:false});dustM.name='c8-dust';
 const dust=[...Array(24)].map(()=>{const s=new THREE.Sprite(dustM.clone());s.visible=false;group.add(s);return {s,t:0,life:0,v:new THREE.Vector3()};});let ui=0;
 const P={limbs,mass,M,U,group,debris:deb,impacts:0,log:{strikes:0,lands:0,debris:0,impacts:0}};
 // ---- the curve: root -> a bend point -> tip, sampled at the extension ------------------------------------------------
 function curve(L,u,out){// quadratic bezier through root, bend, tip
  const a=L.root,b=L.bend,c=L.tip,k=1-u;out.set(a.x*k*k+2*b.x*k*u+c.x*u*u,a.y*k*k+2*b.y*k*u+c.y*u*u,a.z*k*k+2*b.z*k*u+c.z*u*u);return out;}
 function place(L){const base=L.i*SEG,ext=L.ext;
  for(let s=0;s<SEG;s++){const u=s/(SEG-1);if(L.state==='hidden'||u>ext+.001){_m.makeScale(0,0,0);inst.setMatrixAt(base+s,_m);continue;}
   const uu=Math.min(u,ext);curve(L,uu,_a);curve(L,Math.min(1,uu+.02),_b);_b.sub(_a);if(_b.lengthSq()<1e-8)_b.set(0,1,0);_b.normalize();
   const r=L.r0+(L.r1-L.r0)*Math.pow(u,.8),wob=1+.08*Math.sin(u*19+L.phase+P.U.t.value*2.2);_q.setFromUnitVectors(_up,_b);_s.set(r*wob,r*1.9,r*wob*.92);_m.compose(_a,_q,_s);inst.setMatrixAt(base+s,_m);}
  inst.instanceMatrix.needsUpdate=true;}
 // ---- what the chapter asks for ----------------------------------------------------------------------------------------
 // root: where it comes through; dir: the way it comes out; len: how far it reaches; r0/r1: thickness at root and tip
 function set(i,{root,dir=[0,1,0],len=14,r0=1.6,r1=.28,state='emerge',probe=null,speed=1}={}){const L=limbs[i];L.root.set(...root);L.dir.set(...dir).normalize();L.len=len;L.r0=r0;L.r1=r1;L.speed=speed;
  L.tip.copy(L.root).addScaledVector(L.dir,len);L.want.copy(L.tip);L.probe.copy(probe?_c.set(...probe):L.tip);L.bend.copy(L.root).addScaledVector(L.dir,len*.55).add(_c.set(0,len*.18,0));L.state=state;L.t=0;L.landed=false;L.ext=state==='emerge'?0:1;return L;}
 function strike(i,at,{speed=1,onLand=null,hold=1.6,sound=true}={}){const L=limbs[i];if(L.state==='hidden')return;L.want.set(at.x,at.y,at.z);L.state='strike';L.t=0;L.landed=false;L.onLand=onLand;L.hold=hold;L.speed=speed;L.sound=sound;P.log.strikes++;}
 function probe(i,at,r=1.2){const L=limbs[i];L.probe.set(at.x,at.y,at.z);L.probeR=r;if(L.state!=='emerge')L.state='probe';}
 function drag(i,to){const L=limbs[i];L.dragTo=new THREE.Vector3(to.x,to.y,to.z);L.state='drag';L.t=0;}
 function retract(i){const L=limbs[i];if(L.state!=='hidden'){L.state='retract';L.t=0;}}
 function hide(i){const L=limbs[i];L.state='hidden';L.ext=0;place(L);}
 function tipOf(i,out=new THREE.Vector3()){return out.copy(limbs[i].tip);}
 // something heavy lands: debris out from the point, dust, a sound (the chapter shakes the view by distance)
 function impact(at,{n=14,power=1,kind='concrete',sound='c8Impact'}={}){P.log.impacts++;sfx(sound,at,{gain:Math.min(1.6,.6+power*.6)});
  for(let k=0;k<n;k++){const D=deb[di];di=(di+1)%DN;D.on=true;D.p.set(at.x+(Math.random()-.5)*.8,at.y+.3+Math.random()*.4,at.z+(Math.random()-.5)*.8);const a=Math.random()*6.283,sp=(2+Math.random()*5)*power;
   D.v.set(Math.cos(a)*sp,(3+Math.random()*5)*power,Math.sin(a)*sp);D.r=(.06+Math.random()*.22)*(kind==='asphalt'?1.2:1);D.w.set(Math.random()*9,Math.random()*9,Math.random()*9);D.rest=0;P.log.debris++;}
  for(let k=0;k<4;k++){const U2=dust[ui];ui=(ui+1)%dust.length;U2.s.visible=true;U2.t=0;U2.life=4+Math.random()*3;U2.s.position.set(at.x+(Math.random()-.5)*2,at.y+.6,at.z+(Math.random()-.5)*2);U2.v.set((Math.random()-.5)*.6,.35+Math.random()*.3,(Math.random()-.5)*.6);}}
 // the warning before something comes down: grit and a thread of dust from overhead, at the place it will land
 function trickle(at,{h=3,n=2}={}){for(let k=0;k<n;k++){const D=deb[di];di=(di+1)%DN;D.on=true;D.p.set(at.x+(Math.random()-.5)*1.6,at.y+h-.1,at.z+(Math.random()-.5)*1.6);
   D.v.set((Math.random()-.5)*.3,-.5-Math.random(),(Math.random()-.5)*.3);D.r=.025+Math.random()*.05;D.w.set(Math.random()*4,Math.random()*4,Math.random()*4);D.rest=0;}
  if(Math.random()<.35){const U2=dust[ui];ui=(ui+1)%dust.length;U2.s.visible=true;U2.t=0;U2.life=1.6+Math.random();U2.s.position.set(at.x+(Math.random()-.5),at.y+h-.6,at.z+(Math.random()-.5));U2.v.set(0,-.45,0);}}
 // ---- every frame ------------------------------------------------------------------------------------------------------
 function update(dt){U.t.value+=dt;
  for(const L of limbs){if(L.state==='hidden')continue;L.t+=dt;const w=L.speed;
   if(L.state==='emerge'){L.ext=Math.min(1,L.ext+dt*.32*w);if(L.ext>=1)L.state='probe';}
   if(L.state==='probe'){const a=U.t.value*.7*w+L.phase;L.want.copy(L.probe).add(_c.set(Math.sin(a)*L.probeR,Math.sin(a*1.3)*L.probeR*.5,Math.cos(a*.8)*L.probeR));L.tip.lerp(L.want,1-Math.exp(-1.6*w*dt));}
   else if(L.state==='strike'){// a draw back, then thrown, then its weight on it
    if(L.t<.45){_c.copy(L.want).sub(L.root).multiplyScalar(-.08);L.tip.lerp(_d.copy(L.tip).add(_c),1-Math.exp(-6*dt));}
    else if(!L.landed){L.tip.lerp(L.want,1-Math.exp(-(9*w)*dt));if(L.tip.distanceTo(L.want)<.5){L.landed=true;L.landT=L.t;P.log.lands++;if(L.sound!==false)impact(L.want,{n:12,power:1});L.onLand?.(L.want.clone());}}
    else if(L.t-L.landT>L.hold)L.state='probe';}
   else if(L.state==='drag'){L.tip.lerp(L.dragTo,1-Math.exp(-1.2*w*dt));if(L.tip.distanceTo(L.dragTo)<.4)L.state='probe';}
   else if(L.state==='retract'){L.ext=Math.max(0,L.ext-dt*.45*w);if(L.ext<=0){L.state='hidden';}}
   // the bend: the root's direction carried out, sagging a little, so it arcs from the wall to wherever its tip is
   _c.copy(L.tip).sub(L.root);const len=_c.length();L.bend.copy(L.root).addScaledVector(L.dir,len*.5).add(_d.set(0,len*.12+Math.sin(U.t.value*.5+L.phase)*.4,0));
   place(L);}
  // the mass leans in and out a little even standing still: it is breathing, or pushing
  if(mass.visible){M.lean=damp(M.lean,M.leanTo,.6,dt);const br=Math.sin(U.t.value*.9)*.03;mass.position.copy(M.at).add(_c.set(0,0,-M.lean*4));mass.scale.set(M.r*M.squash.x*(1+br),M.r*M.squash.y*(1-br*.5),M.r*M.squash.z*(1+M.lean*.3));}
  for(let k=0;k<DN;k++){const D=deb[k];if(!D.on){_m.makeScale(0,0,0);chunks.setMatrixAt(k,_m);continue;}
   if(D.rest<1){D.v.y-=9.8*dt;D.p.addScaledVector(D.v,dt);const f=floorAt(D.p.x,D.p.z);if(D.p.y-D.r<f){D.p.y=f+D.r;if(Math.abs(D.v.y)<1.2){D.v.set(0,0,0);D.rest=1;}else{D.v.y*=-.32;D.v.x*=.55;D.v.z*=.55;}}
    D.rot.x+=D.w.x*dt*(1-D.rest);D.rot.y+=D.w.y*dt*(1-D.rest);}
   _q.setFromEuler(D.rot);_s.set(D.r,D.r*.8,D.r*1.1);_m.compose(D.p,_q,_s);chunks.setMatrixAt(k,_m);}
  chunks.instanceMatrix.needsUpdate=true;
  for(const U2 of dust){if(!U2.s.visible)continue;U2.t+=dt;const k=U2.t/U2.life;if(k>=1){U2.s.visible=false;continue;}U2.s.position.addScaledVector(U2.v,dt);U2.v.multiplyScalar(1-dt*.4);const sc=1.2+k*5;U2.s.scale.set(sc,sc,1);U2.s.material.opacity=.32*Math.sin(Math.PI*Math.min(1,k*1.4))*(1-k);}}
 function show(on){if(on&&!group.parent)scene.add(group);else if(!on&&group.parent)group.removeFromParent();}
 function reset(){for(const L of limbs){L.state='hidden';L.ext=0;place(L);}mass.visible=false;M.lean=M.leanTo=0;for(const D of deb){D.on=false;}for(const U2 of dust)U2.s.visible=false;P.impacts=0;for(const k of Object.keys(P.log))P.log[k]=0;}
 reset();
 Object.assign(P,{set,strike,probe,drag,retract,hide,tipOf,impact,trickle,update,show,reset,setFloor:f=>{floorAt=f;},
  showMass(on,{at=null,r=9,squash=null}={}){mass.visible=!!on;if(at)M.at.set(at.x,at.y,at.z);M.r=r;if(squash)M.squash.set(...squash);},lean(v){M.leanTo=v;},
  get active(){return limbs.some(L=>L.state!=='hidden')||mass.visible;}});
 return P;
}
