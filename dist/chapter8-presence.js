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
import {presenceOrganism} from './astra-presence.js';
import {paper} from './chapter6-kit.js';
// a soft round puff (white, alpha falling off to the edge) for smoke and dust sprites: without it a sprite is a hard square
let PUFF;
export function puffTexture(){if(PUFF!==undefined)return PUFF;PUFF=paper(64,64,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.45,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);
  for(let k=0;k<14;k++){const x=w/2+(Math.sin(k*2.4)*.3)*w,y=h/2+(Math.cos(k*1.7)*.3)*h,rr=w*(.08+((k*37)%10)/100);const q=g.createRadialGradient(x,y,0,x,y,rr);q.addColorStop(0,'rgba(255,255,255,.18)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(0,0,w,h);}});
 if(PUFF)PUFF.colorSpace=THREE.NoColorSpace;return PUFF;}

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const SEG=34;// segments per limb
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_d=new THREE.Vector3(),_e2=new THREE.Vector3(),_f=new THREE.Vector3(),_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_s=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);

export function createPresence({scene,sfx=()=>{},floorAt=()=>0,sky=false}){
 const group=new THREE.Group();group.name='chapter8-presence';
 const U={t:{value:0},wet:{value:1},glow:{value:sky?1:0}};
 // (sky: the instance on the skyline, seen from the street at dawn: a silhouette against the deck, lit from underneath by the fires
 //  and the open ground: dark, a red under-glow, a hot rim. Its own programs: the one under the court is never lit this way)
 const GLOW=sky?`{vec3 wN=inverseTransformDirection(normal,viewMatrix);float under=clamp(-wN.y*.9+.05,0.,1.);float frg=pow(1.-clamp(dot(normalize(vViewPosition),normal),0.,1.),3.5);
   totalEmissiveRadiance+=uGlow*(vec3(.34,.045,.016)*under*under+vec3(.42,.08,.025)*frg*.55);}`:'';
 // the skin: dark, wet, a slow ripple along its length (vertex), a little paler in the folds (fragment): never emissive
 const skin=new THREE.MeshStandardMaterial({color:sky?0x140e0d:0x2a2120,roughness:.65,metalness:.025});skin.name='c8-presence-skin';
 skin.onBeforeCompile=sh=>{sh.uniforms.uT=U.t;sh.vertexShader='uniform float uT;\nvarying float vFold;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
   vec3 wpI=(instanceMatrix*vec4(position,1.)).xyz;
  #else
   vec3 wpI=position;
  #endif
  float rip=sin(wpI.x*1.7+wpI.z*1.3+uT*1.6)*sin(wpI.y*2.1-uT*1.1);transformed+=normal*rip*.11;vFold=rip;`);
  sh.uniforms.uGlow=U.glow;sh.fragmentShader='uniform float uGlow;\nvarying float vFold;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=1.0+.35*smoothstep(.3,.9,vFold);').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+GLOW);};
 skin.customProgramCacheKey=()=>'c8-presence-skin'+(sky?'-sky':'');
 // (a segment: an ellipsoid with a ridge round its middle and a keel down its back (local +x), dark on the back and pale and
 // soft-looking underneath; the instances overlap, so the limb reads as one long jointed thing, not a string of beads)
 const segGeo=(()=>{const g=new THREE.SphereGeometry(1,18,12),pos=g.attributes.position,col=new Float32Array(pos.count*3),v=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const ring=1+.13*Math.exp(-((v.y*3.2)**2)),keel=1+.32*Math.pow(Math.max(0,v.x),4)*(1-Math.abs(v.y)),belly=1-.08*Math.max(0,-v.x);
   v.x*=ring*keel*belly;v.z*=ring*(1+.04*Math.sin(v.y*9));pos.setXYZ(i,v.x,v.y,v.z);const back=Math.max(0,Math.min(1,(v.x+.25)/.9)),c0=[.42,.33,.31],c1=[.1,.075,.07];
   for(let k=0;k<3;k++)col[i*3+k]=c0[k]+(c1[k]-c0[k])*back;}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();return g;})();
 skin.vertexColors=true;skin.color.setHex(0xb8a8a4);
 const N=6,inst=new THREE.InstancedMesh(segGeo,skin,N*SEG);inst.name='c8-presence-limbs';inst.frustumCulled=false;inst.castShadow=true;inst.receiveShadow=true;group.add(inst);
 // barbs down the back of each limb (hooked, pointing back toward the root) and three long fingers at each tip that spread when it reaches
 const barbM=new THREE.MeshStandardMaterial({color:0x140f0e,roughness:.4,metalness:.1});barbM.name='c8-presence-barb';
 const barbs=new THREE.InstancedMesh(new THREE.ConeGeometry(.5,1,6),barbM,N*SEG);barbs.name='c8-presence-barbs';barbs.frustumCulled=false;group.add(barbs);barbs.visible=!sky;
 const FIN=3,FSEG=7,fingers=new THREE.InstancedMesh(segGeo,skin,N*FIN*FSEG);fingers.name='c8-presence-fingers';fingers.frustumCulled=false;fingers.castShadow=true;group.add(fingers);
 for(let i=0;i<N*SEG;i++){_m.makeScale(0,0,0);inst.setMatrixAt(i,_m);barbs.setMatrixAt(i,_m);}for(let i=0;i<N*FIN*FSEG;i++)fingers.setMatrixAt(i,_m.makeScale(0,0,0));
 const FR=17,FS=8,fp=new Float32Array(N*FIN*FR*(FS+1)*3),fn=new Float32Array(fp.length),fi=[];
 for(let f=0;f<N*FIN;f++)for(let r=0;r<FR-1;r++)for(let j=0;j<FS;j++){const n=(f*FR+r)*(FS+1)+j;fi.push(n,n+FS+1,n+1,n+1,n+FS+1,n+FS+2);}
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));fg.setAttribute('normal',new THREE.BufferAttribute(fn,3));fg.setIndex(fi);
 const fm=skin.clone();fm.vertexColors=false;fm.color.setHex(sky?0x4c3930:0x65594b);
 const feelers=new THREE.Mesh(fg,fm);feelers.name='presence-tapered-feelers';feelers.frustumCulled=false;feelers.castShadow=true;group.add(feelers);fingers.visible=false;
 const tubes=Array.from({length:N},(_,i)=>{const geo=new THREE.BufferGeometry(),positions=new Float32Array(SEG*11*3),indices=[];for(let r=0;r<SEG-1;r++)for(let s=0;s<10;s++){const a=r*11+s;indices.push(a,a+11,a+1,a+1,a+11,a+12);}geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setIndex(indices);const tm=skin.clone();tm.vertexColors=false;tm.color.setHex(sky?0x4c3930:0x65594b);const m=new THREE.Mesh(geo,tm);m.name='presence-continuous-limb-'+i;m.frustumCulled=false;m.castShadow=true;group.add(m);return m;});inst.visible=false;
 const limbs=[...Array(N)].map((_,i)=>({i,state:'hidden',t:0,ext:0,root:new THREE.Vector3(),dir:new THREE.Vector3(0,1,0),tip:new THREE.Vector3(),tipV:new THREE.Vector3(),want:new THREE.Vector3(),
  r0:1.6,r1:.28,len:14,bend:new THREE.Vector3(),probe:new THREE.Vector3(),probeR:1.2,speed:1,onLand:null,landed:false,hold:0,dragTo:null,phase:Math.random()*6,pts:[],seen:0,splay:.2}));
 // the mass behind the barrier: a huge rounded swell with the ripple, pushed forward by the chapter (lean 0..1)
 // the mass: not a ball. A cluster of lobes of different sizes, pressed together (one merged mesh, about a unit across, scaled
 // by the chapter), their surfaces moved by slow noise so they fold and swell; deep folds dark, the swellings pale and wet
 U.press={value:0};
 const mass=presenceOrganism({sky});mass.visible=false;group.add(mass);
 // fog in front of it, in layers, so it has depth and its edges are lost
 const fogM=[];const FOG=[...Array(9)].map((_,k)=>{const m=new THREE.SpriteMaterial({map:null,color:0x23201e,transparent:true,opacity:0,depthWrite:false});m.name='c8-presence-fog';fogM.push(m);const s2=new THREE.Sprite(m);s2.visible=false;group.add(s2);return {s:s2,k,ph:k*1.7};});
 for(const m of fogM)m.map=puffTexture();
 const M={lean:0,leanTo:0,at:new THREE.Vector3(),r:9,squash:new THREE.Vector3(1.3,1,.7),fog:0};
 // ---- debris and dust ------------------------------------------------------------------------------------------------
 const chunkM=new THREE.MeshStandardMaterial({color:0x6e6a62,roughness:.95});chunkM.name='c8-debris';const DN=90,chunks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),chunkM,DN);chunks.name='c8-debris';chunks.frustumCulled=false;chunks.castShadow=true;group.add(chunks);
 const deb=[...Array(DN)].map(()=>({on:false,p:new THREE.Vector3(),v:new THREE.Vector3(),r:.2,rot:new THREE.Euler(),w:new THREE.Vector3(),rest:0}));let di=0;
 const dustM=new THREE.SpriteMaterial({color:0x8d887e,map:puffTexture(),transparent:true,opacity:0,depthWrite:false});dustM.name='c8-dust';
 const dust=[...Array(24)].map(()=>{const s=new THREE.Sprite(dustM.clone());s.visible=false;group.add(s);return {s,t:0,life:0,v:new THREE.Vector3()};});let ui=0;
 const P={limbs,mass,M,U,group,debris:deb,impacts:0,log:{strikes:0,lands:0,debris:0,impacts:0}};
 // ---- the curve: root -> a bend point -> tip, sampled at the extension ------------------------------------------------
 function curve(L,u,out){// quadratic bezier through root, bend, tip
  const a=L.root,b=L.bend,c=L.tip,k=1-u;out.set(a.x*k*k+2*b.x*k*u+c.x*u*u,a.y*k*k+2*b.y*k*u+c.y*u*u,a.z*k*k+2*b.z*k*u+c.z*u*u);return out;}
 function place(L){const base=L.i*SEG,ext=L.ext;
  const tube=tubes[L.i];tube.visible=L.state!=='hidden'&&ext>.015;
  if(tube.visible){const pos=tube.geometry.attributes.position;for(let r=0;r<SEG;r++){const u=r/(SEG-1)*ext;curve(L,u,_a);curve(L,Math.min(1,u+.003),_b);if(u>.997)curve(L,u-.003,_b).sub(_a).negate();else _b.sub(_a);_b.normalize();_c.set(1,0,0);if(Math.abs(_b.x)>.9)_c.set(0,0,1);_d.crossVectors(_b,_c).normalize();_c.crossVectors(_d,_b).normalize();const rad=(L.r0+(L.r1-L.r0)*Math.pow(u,.8))*(1+.045*Math.sin(u*54));for(let k=0;k<=10;k++){const a=k/10*Math.PI*2;pos.setXYZ(r*11+k,_a.x+(_c.x*Math.cos(a)+_d.x*Math.sin(a))*rad,_a.y+(_c.y*Math.cos(a)+_d.y*Math.sin(a))*rad,_a.z+(_c.z*Math.cos(a)+_d.z*Math.sin(a))*rad);}}pos.needsUpdate=true;tube.geometry.computeVertexNormals();}

  for(let s=0;s<SEG;s++){const u=s/(SEG-1);if(L.state==='hidden'||u>ext+.001){_m.makeScale(0,0,0);inst.setMatrixAt(base+s,_m);continue;}
   const uu=Math.min(u,ext);curve(L,uu,_a);curve(L,Math.min(1,uu+.02),_b);_b.sub(_a);if(_b.lengthSq()<1e-8)_b.set(0,1,0);_b.normalize();
   const r=L.r0+(L.r1-L.r0)*Math.pow(u,.8),wob=1+.08*Math.sin(u*19+L.phase+P.U.t.value*2.2);_q.setFromUnitVectors(_up,_b);_s.set(r*wob,r*1.9,r*wob*.92);_m.compose(_a,_q,_s);inst.setMatrixAt(base+s,_m);
   // a barb on its back, every other segment, raked back toward the root
   if(s%2===0&&u<.92){_c.set(1,0,0).applyQuaternion(_q);_d.copy(_a).addScaledVector(_c,r*1.05);_q2.setFromUnitVectors(_up,_c.addScaledVector(_b,-1.1).normalize());_s.set(r*.22,r*.85,r*.22);_m.compose(_d,_q2,_s);barbs.setMatrixAt(base+s,_m);}
   else{_m.makeScale(0,0,0);barbs.setMatrixAt(base+s,_m);}}
  // the fingers: from the tip, three ways round its axis, spread by splay, curling in toward each other at their ends
  const offset=L.i*FIN*FR*(FS+1)*3;
  if(L.state==='hidden'||ext<.98){fp.fill(0,offset,offset+FIN*FR*(FS+1)*3);fn.fill(0,offset,offset+FIN*FR*(FS+1)*3);}
  else{curve(L,1,_a);curve(L,.97,_b);_b.subVectors(_a,_b).normalize();_c.set(0,1,0);if(Math.abs(_c.dot(_b))>.9)_c.set(1,0,0);_c.cross(_b).normalize();_d.crossVectors(_b,_c);
   const fl=Math.max(1.2,L.r1*7),fr=Math.max(.05,L.r1*.50);
   for(let f=0;f<FIN;f++){const ang=f/FIN*Math.PI*2+L.phase,ox=Math.cos(ang),oy=Math.sin(ang),spread=L.splay+.06*Math.sin(P.U.t.value*1.7+f*2);let px=_a.x,py=_a.y,pz=_a.z;
    for(let r=0;r<FR;r++){const u=r/(FR-1),bend=spread*(1-u*1.6),dx=_b.x+(_c.x*ox+_d.x*oy)*bend,dy=_b.y+(_c.y*ox+_d.y*oy)*bend,dz=_b.z+(_c.z*ox+_d.z*oy)*bend,dl=Math.hypot(dx,dy,dz)||1;
     if(r){const step=fl/(FR-1);px+=dx/dl*step;py+=dy/dl*step;pz+=dz/dl*step;}_f.set(dx/dl,dy/dl,dz/dl);_q.setFromUnitVectors(_up,_f);const rad=fr*(.04+.96*Math.pow(1-u,.8));
     for(let j=0;j<=FS;j++){const a=j/FS*Math.PI*2;_e2.set(Math.cos(a),0,Math.sin(a)).applyQuaternion(_q);const n=offset+((f*FR+r)*(FS+1)+j)*3;fp[n]=px+_e2.x*rad;fp[n+1]=py+_e2.y*rad;fp[n+2]=pz+_e2.z*rad;fn[n]=_e2.x;fn[n+1]=_e2.y;fn[n+2]=_e2.z;}
    }}}
  fg.attributes.position.needsUpdate=true;fg.attributes.normal.needsUpdate=true;
  inst.instanceMatrix.needsUpdate=true;barbs.instanceMatrix.needsUpdate=true;fingers.instanceMatrix.needsUpdate=true;}
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
   L.splay=damp(L.splay,L.state==='strike'?.9:L.state==='probe'?.45:L.state==='drag'?.05:.2,3,dt);
   place(L);}
  // the mass leans in and out a little even standing still: it is breathing, or pushing
  if(mass.visible){M.lean=damp(M.lean,M.leanTo,.35,dt);mass.position.copy(M.at).add(_c.set(0,0,sky?0:-M.lean*4));mass.scale.set(M.r*M.squash.x,M.r*M.squash.y,M.r*M.squash.z*(1+(sky?0:M.lean*.18)));mass.userData.animate?.(U.t.value);
   U.press.value=M.lean;mass.rotation.y=M.rot||0;
   for(const F of FOG){F.s.visible=M.fog>0;if(!F.s.visible)continue;const a=F.ph+U.t.value*.05,sp=M.r*(1.1+.25*Math.sin(F.ph)),fx=Math.sin(F.ph*2.3)*M.r*M.squash.x*.9,fy=Math.cos(F.ph*1.7)*M.r*M.squash.y*.55;
    F.s.position.set(mass.position.x+fx+Math.sin(a)*1.5,mass.position.y+fy,mass.position.z+(M.fogDir||-1)*(M.r*M.squash.z*.6+F.k*.9));F.s.scale.set(sp,sp*.7,1);F.s.material.opacity=M.fog*(.22+.1*Math.sin(a*1.3));}}
  else for(const F of FOG)F.s.visible=false;
  for(let k=0;k<DN;k++){const D=deb[k];if(!D.on){_m.makeScale(0,0,0);chunks.setMatrixAt(k,_m);continue;}
   if(D.rest<1){D.v.y-=9.8*dt;D.p.addScaledVector(D.v,dt);const f=floorAt(D.p.x,D.p.z);if(D.p.y-D.r<f){D.p.y=f+D.r;if(Math.abs(D.v.y)<1.2){D.v.set(0,0,0);D.rest=1;}else{D.v.y*=-.32;D.v.x*=.55;D.v.z*=.55;}}
    D.rot.x+=D.w.x*dt*(1-D.rest);D.rot.y+=D.w.y*dt*(1-D.rest);}
   _q.setFromEuler(D.rot);_s.set(D.r,D.r*.8,D.r*1.1);_m.compose(D.p,_q,_s);chunks.setMatrixAt(k,_m);}
  chunks.instanceMatrix.needsUpdate=true;
  for(const U2 of dust){if(!U2.s.visible)continue;U2.t+=dt;const k=U2.t/U2.life;if(k>=1){U2.s.visible=false;continue;}U2.s.position.addScaledVector(U2.v,dt);U2.v.multiplyScalar(1-dt*.4);const sc=1.2+k*5;U2.s.scale.set(sc,sc,1);U2.s.material.opacity=.32*Math.sin(Math.PI*Math.min(1,k*1.4))*(1-k);}}
 function show(on){if(on&&!group.parent)scene.add(group);else if(!on&&group.parent)group.removeFromParent();}
 function reset(){for(const L of limbs){L.state='hidden';L.ext=0;place(L);}mass.visible=false;M.fog=0;for(const F of FOG)F.s.visible=false;M.lean=M.leanTo=0;for(const D of deb){D.on=false;}for(const U2 of dust)U2.s.visible=false;P.impacts=0;for(const k of Object.keys(P.log))P.log[k]=0;}
 reset();
 Object.assign(P,{set,strike,probe,drag,retract,hide,tipOf,impact,trickle,update,show,reset,setFloor:f=>{floorAt=f;},
  showMass(on,{at=null,r=9,squash=null,fog=.8,fogDir=-1,rot=0}={}){mass.visible=!!on;if(at)M.at.set(at.x,at.y,at.z);M.r=r;if(squash)M.squash.set(...squash);M.fog=fog;M.fogDir=fogDir;M.rot=rot;},lean(v){M.leanTo=v;},
  get active(){return limbs.some(L=>L.state!=='hidden')||mass.visible;}});
 return P;
}
