// Background life: wind, water, a kid shooting hoops, a parent coming home, birds,
// fireflies and the lights of the evening. None of it asks anything of the player.
import * as THREE from './three.module.js';
import {groundPoint,heading,roadFrame} from './route.js';
import {createPerson,newPose,standPose,applyPose,P,smooth} from './rig.js';
import {localToStreet} from './friends.js';
import {LOOKOUT} from './world.js';
import {CAST,FORMATION} from './cast.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
// A soft radial dot without needing a canvas.
function glowTexture(size=64){const data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x+.5)/size*2-1,dy=(y+.5)/size*2-1,r=Math.sqrt(dx*dx+dy*dy),a=Math.max(0,1-r)**2.2;const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=a*255|0;}const t=new THREE.DataTexture(data,size,size);t.needsUpdate=true;return t;}
function flagTexture(){const w=48,h=26,data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const stripe=Math.floor(y/2)%2===0,canton=x<20&&y<14,star=canton&&x%4===1&&y%3===1;const c=canton?(star?[235,235,230]:[40,52,98]):stripe?[170,40,44]:[236,232,222];const i=(y*w+x)*4;data.set([...c,255],i);}const t=new THREE.DataTexture(data,w,h);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;}

export function createAmbient(scene,world,hooks={}){
 const sfx=hooks.sfx||(()=>{}),time={value:0},gust={value:0},tmp=new THREE.Vector3();
 const sources=[];
 // Wind in the leaves and a slow shimmer across the lawns -----------------------------------
 for(const m of world.foliage){m.onBeforeCompile=sh=>{sh.uniforms.uTime=time;sh.uniforms.uGust=gust;
  sh.vertexShader='uniform float uTime,uGust;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float sway=(.05+.05*uGust)*smoothstep(.4,4.,transformed.y-0.)*.6;vec2 ph=transformed.xz*.21;
   transformed.x+=sin(uTime*1.3+ph.x+ph.y)*sway+sin(uTime*3.1+transformed.y*2.)*.012;transformed.z+=cos(uTime*1.1+ph.y*1.3)*sway*.8;transformed.y+=sin(uTime*2.3+ph.x*3.)*.01;`);};m.needsUpdate=true;}
 for(const gm of world.grassMats)gm.onBeforeCompile=sh=>{sh.uniforms.uTime=time;sh.vertexShader='varying vec3 vW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vW=transformed;');
  sh.fragmentShader='uniform float uTime;varying vec3 vW;\nfloat n2(vec2 p){return sin(p.x)*sin(p.y);}\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float lawnPatch=n2(vW.xz*.045)*.5+n2(vW.xz*.11+3.)*.3;float dry=smoothstep(.35,.8,n2(vW.xz*.021+7.)*.6+n2(vW.xz*.07)*.4);
   diffuseColor.rgb*=.93+.09*lawnPatch;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.18,1.05,.72),dry*.45);
   float wave=sin(dot(vW.xz,vec2(.23,.17))-uTime*1.7)*sin(dot(vW.xz,vec2(-.11,.29))-uTime*1.1);diffuseColor.rgb*=1.+.035*wave;`);};for(const gm of world.grassMats)gm.needsUpdate=true;
 const street=world.houses.filter(h=>h.frameId==='main');

 const addAt=(d,lat,y=0)=>world.anchor(d,lat,y);
 const glow=glowTexture();

 // Impact sprinklers on a few lawns, off by the time the streetlights are on -------------------
 const sprinklers=[];
 for(const [dc,side] of [[62,-1],[212,1],[268,-1],[440,1]]){const h=street.filter(x=>x.side===side&&!Object.values(world.homes).includes(x)).sort((a,b)=>Math.abs(a.dc-dc)-Math.abs(b.dc-dc))[0];if(!h)continue;
  const x=-h.gs*h.w*.25,s=h.S(x,h.setback-10.2),y=world.groundY(s.d,s.lat)-groundPoint(s.d,s.lat).y;const root=addAt(s.d,s.lat,y);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,.18,8),world.material(0x5a5d5a));base.position.y=.09;root.add(base);const head=new THREE.Group();head.position.y=.2;root.add(head);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.22),world.material(0x8a8c86));arm.position.set(0,.03,-.08);arm.rotation.x=.4;head.add(arm);
  const N=46,pos=new Float32Array(N*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const jet=new THREE.Points(geo,new THREE.PointsMaterial({color:0xe8f2ff,size:.07,transparent:true,opacity:.55,depthWrite:false}));head.add(jet);jet.frustumCulled=false;
  const spread=[...Array(N)].map((_,i)=>[hash(i+dc)*.3-.15,hash(i*3+dc)*.3-.15,hash(i*7+dc)]);
  sprinklers.push({root,head,jet,pos,spread,d:s.d,lat:s.lat,angle:0,dir:1,tick:0,base:side>0?Math.PI/2:-Math.PI/2,phase:hash(dc)*2,on:1});}
 function updateSprinklers(dt,ctx){for(const s of sprinklers){const near=Math.abs(s.d-ctx.distance)<90;s.on=damp(s.on,ctx.p<.47?1:0,.8,dt);if(!near&&s.on<.02){s.jet.visible=false;continue;}s.jet.visible=s.on>.02;
  if(s.dir>0){s.tick-=dt;if(s.tick<=0){s.tick=.19;s.angle+=.13;if(s.on>.3&&Math.abs(s.d-ctx.distance)<45)sfx('sprinkler',s.root.position,{gain:s.on});if(s.angle>1.1)s.dir=-1;}}else{s.angle-=dt*.9;if(s.angle<-1.1){s.angle=-1.1;s.dir=1;}}
  s.head.rotation.y=s.base+s.angle;const range=5.2*s.on,t=time.value;
  for(let i=0;i<s.pos.length/3;i++){const u=((i/(s.pos.length/3))+t*.9)%1,sp=s.spread[i];const r=u*range,y=.05+Math.tan(.5)*r-9.8*(r*r)/(2*(8.5*8.5)*Math.cos(.5)**2);
   s.pos[i*3]=sp[0]*u*.8;s.pos[i*3+1]=Math.max(-.18,y)+sp[1]*u*.3;s.pos[i*3+2]=-r;}s.jet.geometry.attributes.position.needsUpdate=true;s.jet.material.opacity=.55*s.on;}}

 // A kid shooting hoops in a driveway -------------------------------------------------------
 const hh=world.homes.hoop,ring=hh.S(hh.gx,hh.gfront+.35),spot=hh.S(hh.gx+.6*hh.gs,hh.gfront+4.3);
 const kid={person:createPerson(CAST.kid),pose:newPose(),t:0,phase:'dribble',d:spot.d,lat:spot.lat,psi:Math.atan2(ring.lat-spot.lat,ring.d-spot.d)};scene.add(kid.person.group);
 const ballMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.12,1),world.material(0xc2652f));ballMesh.castShadow=true;scene.add(ballMesh);
 const ringY=world.groundY(ring.d,ring.lat)+3.05;
 function kidToWorld(x,y,z,out){const s=localToStreet(kid.psi,x,z),p=groundPoint(kid.d+s.dd,kid.lat+s.dl);return out.set(p.x,world.groundY(kid.d,kid.lat)+y,p.z);}
 // Later that night none of the evening's own life is out: no hoops, no mower, the van in its garage.
 let nightMode=false;
 function night(on){nightMode=on;if(!on)return;kid.person.group.visible=ballMesh.visible=false;if(car.mode!=='parked'){car.mode='parked';carGroup.visible=false;cg.set(0);}screenPlayed=true;barks=[0,0,0];
  for(const f of flocks){f.t=99;for(const b of f.birds)b.g.visible=false;}for(const sp of sprinklers){sp.on=0;sp.jet.visible=false;}}
 // QA: the van already home if the ride is past the point where it came.
 function skipTo(D){if(D>470&&car.mode!=='parked'){car.mode='parked';carGroup.visible=false;cg.set(0);}}
 function updateKid(dt,ctx){if(nightMode)return;const near=Math.abs(kid.d-ctx.distance);if(near>140&&kid.t>0){kid.person.group.visible=ballMesh.visible=ctx.distance<kid.d+140;if(!kid.person.group.visible)return;}
  kid.t+=dt;const k=kid,p=k.pose,watching=ctx.distance>k.d-26&&ctx.distance<k.d+6&&ctx.state!=='intro';
  const g=k.person.group,gp=groundPoint(k.d,k.lat);g.position.set(gp.x,world.groundY(k.d,k.lat),gp.z);g.rotation.y=-(heading(k.d)+k.psi);
  standPose(p,k.t,{look:watching?clamp(-wrap(Math.atan2(ctx.eye.x-gp.x,-(ctx.eye.z-gp.z))-(heading(k.d)+k.psi)),-1.2,1.2):0});
  if(k.phase==='dribble'){const T=.52,u=(k.t%T)/T,hy=.9-.12*Math.sin(Math.PI*u),by=u<.5?.9-(.9-.12)*(u*2)**2:.12+(.78)*(1-(1-(u-.5)*2)**2);
   p[P.rh]=.28;p[P.rh+1]=Math.max(by+.1,hy);p[P.rh+2]=-.3;p[P.lean]=.18;p[P.root+1]-=.05;kidToWorld(.3,by,-.32,ballMesh.position);
   const bounce=Math.floor(k.t/T);if(bounce!==k.lastBounce){k.lastBounce=bounce;if(near<40)sfx('dribble',ballMesh.position);}
   if(k.t>3.4&&!watching){k.phase='shoot';k.t=0;}}
  else if(k.phase==='shoot'){const up=smooth(k.t/.35),rel=clamp((k.t-.35)/1.05,0,1);p[P.root+1]+=.12*Math.sin(Math.PI*clamp(k.t/.6,0,1));for(const o of [P.lh,P.rh]){p[o+1]=.95+.75*up;p[o+2]=-.25;p[o]=(o===P.lh?-.08:.08);}p[P.hp]=.35*up;
   if(k.t<.35)kidToWorld(0,.95+.9*up,-.3,ballMesh.position);else{const a=kidToWorld(0,1.85,-.3,tmp.clone()),rp=groundPoint(ring.d,ring.lat);ballMesh.position.set(a.x+(rp.x-a.x)*rel,a.y+(ringY+.25-a.y)*rel+2.2*Math.sin(Math.PI*rel)*.9,a.z+(rp.z-a.z)*rel);}
   if(k.t>1.4){k.phase='return';k.t=0;if(near<40)sfx('rim',ballMesh.position);}}
  else{const rel=clamp(k.t/1.3,0,1),rp=groundPoint(ring.d,ring.lat),a=kidToWorld(.25,.95,-.3,tmp.clone());const hop=Math.abs(Math.sin(Math.PI*rel*2.5))*(1-rel)*2.6;
   ballMesh.position.set(rp.x+(a.x-rp.x)*rel,Math.max(world.groundY(k.d,k.lat)+.12,ringY-.3-(ringY-.3-a.y)*rel)*(rel<.15?1:0)+(rel>=.15?world.groundY(k.d,k.lat)+.12+hop*.7+(a.y-world.groundY(k.d,k.lat)-.12)*smooth((rel-.8)/.2):0),rp.z+(a.z-rp.z)*rel);
   const b=Math.floor(rel*2.5);if(b!==k.lastBounce&&rel>.15){k.lastBounce=b;if(near<40)sfx('dribble',ballMesh.position,{gain:.7});}
   p[P.rh+1]=.8+.1*smooth((rel-.8)/.2);if(rel>=1){k.phase='dribble';k.t=0;}}
  if(watching&&k.phase==='dribble'){k.t=Math.min(k.t,3);kidToWorld(.3,.86,-.28,ballMesh.position);p[P.rh+1]=.95;p[P.lh]=.12;p[P.lh+1]=.96;p[P.lh+2]=-.3;}
  applyPose(k.person,p);}
 const wrap=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};

 // A parent's car comes home and the garage door closes behind it --------------------------------
 const ch=world.homes.car,cg=world.garages.car,carGroup=new THREE.Group();scene.add(carGroup);const carParts=world.car(carGroup,'van',0x6f7f8a,{lights:true});carGroup.traverse(o=>{if(o.isMesh)o.castShadow=true;});
 const carGlow=[-1,1].map(s=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xfff0d0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));sp.scale.setScalar(1.4);sp.position.set(s*(carParts.W/2-.3),.78,-carParts.L/2-.12);carGroup.add(sp);return sp;});
 const car={};
 // The parent's minivan comes down Briarwood Lane, turns onto Oak Hollow and pulls into its garage.
 const J1=world.sideFrames[0].junction,lane=J1.d+J1.side*2.1;
 function carPath(){const dr=ch.drivD,pts=[[lane,J1.side*56],[lane,J1.side*30],[lane,J1.side*12],[J1.d-3,J1.side*4],[J1.d-12,-2.2],[dr+14,-2.45],[dr+4.5,-2.7],[dr+.8,-5.4],[dr,-8.2],[cg.mouth.d,cg.mouth.lat],[ch.S(ch.gx,ch.gfront-3.4).d,ch.S(ch.gx,ch.gfront-3.4).lat]];
  const P2=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];for(let k=0;k<14;k++){const t=k/14,t2=t*t,t3=t2*t;const f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);P2.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}P2.push(pts[pts.length-1]);
  const s=[0];for(let i=1;i<P2.length;i++){const a=groundPoint(...P2[i-1]),b=groundPoint(...P2[i]);s.push(s[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}return {pts:P2,s,length:s[s.length-1]};}
 function carAt(u){const {pts,s}=car.path;u=clamp(u,0,car.path.length);let i=1;while(i<s.length-1&&s[i]<u)i++;const t=(u-s[i-1])/((s[i]-s[i-1])||1),a=pts[i-1],b=pts[i];return {d:a[0]+(b[0]-a[0])*t,lat:a[1]+(b[1]-a[1])*t,psi:Math.atan2(b[1]-a[1],b[0]-a[0])};}
 function placeCar(){const q=carAt(car.u);const f=localToStreet(q.psi,0,-1.5);const yF=world.groundY(q.d+f.dd,q.lat+f.dl),yR=world.groundY(q.d-f.dd,q.lat-f.dl),p=groundPoint(q.d,q.lat);
  carGroup.position.set(p.x,(yF+yR)/2,p.z);carGroup.rotation.set(Math.atan2(yF-yR,3),-(heading(q.d)+q.psi),0,'YXZ');car.d=q.d;car.lat=q.lat;}
 function updateCar(dt,ctx){
  if(car.mode==='parked')return;
  if(car.mode==='wait'){carGroup.visible=false;if(ctx.distance>=404&&ctx.state!=='intro'){car.mode='drive';carGroup.visible=true;car.u=0;car.v=7;}else return;}
  if(car.mode==='drive'){const remain=car.path.length-car.u;let v=Math.min(7.5,Math.sqrt(2*1.3*Math.max(0,remain-.3))+.05);const q=carAt(car.u+6);if(Math.abs(q.lat)>4)v=Math.min(v,3);
   // Yield to anyone in the lane ahead.
   const ahead=[{d:ctx.distance,lat:ctx.lateral},...hooks.riders?.()||[]].some(r=>r.d<car.d-1&&r.d>car.d-16&&Math.abs(r.lat-car.lat)<1.9);if(ahead)v=0;
   car.v=car.v+clamp(v-car.v,-4*dt,2*dt);car.u+=car.v*dt;for(const w of carParts.wheels)w.rotation.x-=car.v*dt/.33;
   if(car.path.length-car.u<24&&cg.open<1&&!car.opened){car.opened=true;sfx('garage',cg.panel.getWorldPosition(tmp));}
   if(car.path.length-car.u<.08){car.mode='idle';car.t=0;sfx('engineOff',carGroup.position);}}
  if(car.opened&&car.mode==='drive')cg.set(Math.min(1,cg.open+dt/3));
  if(car.mode==='idle'){car.t+=dt;carParts.head.emissiveIntensity=Math.max(0,1.2-car.t*1.5);for(const s of carGlow)s.material.opacity=Math.max(0,.9-car.t*1.2);if(car.t>1.6){if(!car.closing){car.closing=true;sfx('garage',cg.panel.getWorldPosition(tmp));}cg.set(Math.max(0,cg.open-dt/3.4));if(cg.open<=0){car.mode='parked';carGroup.visible=false;}}}
  placeCar();
  sources.push({kind:'engine',pos:carGroup.position,level:car.mode==='drive'?.6+car.v*.06:car.mode==='idle'?Math.max(0,.5-car.t*.4):0});}

 // Birds crossing the sky early in the evening --------------------------------------------------
 const birdMat=new THREE.MeshBasicMaterial({color:0x2b2528,side:THREE.DoubleSide,fog:false});const wingGeo=new THREE.BufferGeometry();wingGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.12,0,0,.12,.55,0,0],3));
 const flocks=[70,230,395,540].map((at,fi)=>({at,birds:[...Array(5)].map((_,i)=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.36),birdMat);g.add(body);const wings=[-1,1].map(s=>{const w=new THREE.Mesh(wingGeo,birdMat);w.scale.x=s;g.add(w);return w;});scene.add(g);g.visible=false;return {g,wings,off:[(i%2?1:-1)*Math.ceil(i/2)*1.6,hash(i+fi)*1.5,Math.ceil(i/2)*1.3],flap:hash(i*9+fi)*6};}),t:-1,dir:fi%2?1:-1}));
 function updateBirds(dt,ctx){for(const f of flocks){if(f.t<0){if(ctx.distance>=f.at&&ctx.state!=='intro')f.t=0;else continue;}f.t+=dt;const T=16;if(f.t>T){for(const b of f.birds)b.g.visible=false;continue;}
  const rf=roadFrame(f.at+50),u=f.t/T,x=f.dir*(-70+140*u),hgt=26+6*Math.sin(u*3);
  for(const b of f.birds){b.g.visible=true;const lx=x+b.off[2]*-f.dir,ld=f.at+50+b.off[0];const p=groundPoint(ld,lx);b.g.position.set(p.x,rf.y+hgt+b.off[1],p.z);b.g.rotation.y=-(heading(ld))+(f.dir>0?-Math.PI/2:Math.PI/2);
   const flap=Math.sin(f.t*9+b.flap);const glide=(Math.sin(f.t*.7+b.flap)>.3)?.25:1;for(const w of b.wings)w.rotation.z=w.scale.x*flap*.7*glide;}}}

 // Fireflies once the light goes, and the old dust motes before then --------------------------------
 const FN=180,fPos=new Float32Array(FN*3),fPhase=new Float32Array(FN),fData=[];for(let i=0;i<FN;i++){fPhase[i]=hash(i)*40;fData.push({d:0,lat:0,y:0,seed:hash(i*13)});}
 const fGeo=new THREE.BufferGeometry();fGeo.setAttribute('position',new THREE.BufferAttribute(fPos,3));fGeo.setAttribute('phase',new THREE.BufferAttribute(fPhase,1));
 const fMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:time,uAmount:{value:0},uScale:{value:600}},
  vertexShader:'attribute float phase;uniform float uTime,uAmount,uScale;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float b=pow(max(0.,sin(uTime*(.6+fract(phase)*.5)+phase)),10.);vA=b*uAmount;gl_PointSize=uScale*.09/-mv.z*(.6+b);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=length(c)*2.;float a=pow(max(0.,1.-r),2.)*vA;gl_FragColor=vec4(vec3(.92,1.,.45)*a,a);}'});
 const fireflies=new THREE.Points(fGeo,fMat);fireflies.frustumCulled=false;scene.add(fireflies);
 function seedFly(f,D,ahead){f.d=D+(ahead?35+f.seed*40:-10+hash(f.seed*99+D)*70);const side=hash(f.d)<.5?-1:1;f.lat=side*(5.5+hash(f.d*3.1)*18);if(D>1100&&hash(f.d*.7)<.6){f.lat=(hash(f.d*5.3)-.5)*26;f.d=1150+hash(f.d*2.9)*26;}f.y=.35+hash(f.d*7.7)*1.9;}
 function updateFireflies(dt,ctx){const amount=smooth((ctx.p-.42)/.35)*.9+ctx.night*.5;fMat.uniforms.uAmount.value=amount;fireflies.visible=amount>.01;if(!fireflies.visible)return;
  fMat.uniforms.uScale.value=(hooks.renderer?.domElement?.height||900)*.9;const D=ctx.state==='walking'?1140:ctx.distance;
  for(let i=0;i<FN;i++){const f=fData[i];if(f.d===0||f.d<D-14||f.d>D+90)seedFly(f,D,f.d!==0);const t=time.value+fPhase[i];const p=groundPoint(f.d+Math.sin(t*.13)*1.2,f.lat+Math.cos(t*.11)*1.2);fPos[i*3]=p.x;fPos[i*3+1]=p.y+f.y+Math.sin(t*.4)*.3+.12;fPos[i*3+2]=p.z;}
  fGeo.attributes.position.needsUpdate=true;}
 const dustPos=new Float32Array(300*3);for(let i=0;i<300;i++){dustPos[i*3]=(hash(i)-.5)*40;dustPos[i*3+1]=.3+hash(i*2)*7;dustPos[i*3+2]=-hash(i*3)*150;}
 const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dustMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uScale:{value:600},uOpacity:{value:.6}},
  vertexShader:'uniform float uScale;varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vF=smoothstep(.6,2.5,-mv.z);gl_PointSize=min(6.,uScale*.035/-mv.z);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float uOpacity;varying float vF;void main(){float r=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(1.,.9,.68,max(0.,1.-r)*uOpacity*vF);}'});
 const dust=new THREE.Points(dustGeo,dustMat);dust.frustumCulled=false;scene.add(dust);

 // A flag on a porch ----------------------------------------------------------------------------
 const flagHouse=street.filter(h=>h.porch==='porch'&&!Object.values(world.homes).includes(h)).sort((a,b)=>Math.abs(a.dc-250)-Math.abs(b.dc-250))[0];let flag=null;
 if(flagHouse){const h=flagHouse,s=h.S(h.doorX+ (h.gs>0?-1:1)*1.3,h.front+h.pdep-.15);const inner=world.houseAnchor(h,h.doorX+(h.gs>0?-1:1)*1.3,h.front+h.pdep-.15,h.floor+2.1).g;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.8,6),world.material(0xd8d4c8));pole.rotation.x=.7;pole.position.set(0,.55,.5);inner.add(pole);const tip=new THREE.Group();tip.position.set(0,1.28,1.1);inner.add(tip);
  const geo=new THREE.PlaneGeometry(1.2,.7,12,6);geo.translate(.6,-.35,0);const cloth=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:flagTexture(),side:THREE.DoubleSide,roughness:.9}));cloth.castShadow=true;tip.add(cloth);tip.rotation.y=Math.PI/2;
  flag={cloth,base:Float32Array.from(geo.attributes.position.array),d:s.d};}
 function updateFlag(){if(!flag||Math.abs(flag.d-hooksDistance)>120)return;const a=flag.cloth.geometry.attributes.position,t=time.value;for(let i=0;i<a.count;i++){const x=flag.base[i*3],y=flag.base[i*3+1];const w=x/1.2;a.setZ(i,Math.sin(x*4.2-t*4.1)*.09*w+Math.sin(x*7-t*6.3+y*3)*.025*w);a.setY(i,y-w*w*.05);}a.needsUpdate=true;flag.cloth.geometry.computeVertexNormals();}
 let hooksDistance=0;

 // Streetlights come on one by one; porch lights and windows fill in through the evening ------------------
 const lampGlowGeo=new THREE.BufferGeometry(),lampPos=[],lampLevel=[];
 // Lamp heads in world space (side-street lamps carry their own; Oak Hollow's follow the street).
 const lampAt=l=>{if(l.x!==undefined)return {x:l.x,y:l.top,z:l.z};const p=groundPoint(l.d,l.lat);return {x:p.x,y:p.y+l.y,z:p.z};};
 const lamps=world.streetLamps.map((l,i)=>{const p=lampAt(l);lampPos.push(p.x,p.y-.08,p.z);lampLevel.push(0);return {...l,on:571+hash(i*3.3)*32,level:0,i,at:p};});
 const lampLevels=world.lampLit.userData.uniforms.uLevel.value;
 lampGlowGeo.setAttribute('position',new THREE.Float32BufferAttribute(lampPos,3));lampGlowGeo.setAttribute('level',new THREE.Float32BufferAttribute(lampLevel,1));
 const glowMat=size=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uScale:{value:600},uColor:{value:new THREE.Color(0xffb866)},uSize:{value:size}},
  vertexShader:'attribute float level;uniform float uScale,uSize;varying float vL;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vL=level*clamp(1.2-(-mv.z)/260.,0.,1.);gl_PointSize=uScale*uSize/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 uColor;varying float vL;void main(){float r=length(gl_PointCoord-.5)*2.;float a=(pow(max(0.,1.-r),3.)*.7+pow(max(0.,1.-r),14.)*.8)*vL;gl_FragColor=vec4(uColor*a,a);}'});
 const lampGlow=new THREE.Points(lampGlowGeo,glowMat(2.6));lampGlow.frustumCulled=false;scene.add(lampGlow);
 // Two local lamps light nearby pavement, bikes and people; distant lamps remain cheap glows.
 const localLights=Array.from({length:2},()=>{const light=new THREE.PointLight(0xffc58c,0,19,2);scene.add(light);return light;});
 const poolTex=glowTexture(),pools=lamps.map(l=>{const d=l.d,lat=l.lat;const m=new THREE.Mesh(new THREE.CircleGeometry(4.2,24),new THREE.MeshBasicMaterial({map:poolTex,color:0xffa65a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  if(l.pool)m.position.set(l.pool.x,l.pool.y+.09,l.pool.z);else{const p=groundPoint(d,lat*.55);m.position.set(p.x,world.groundY(d,lat*.55)+.04,p.z);}m.rotation.x=-Math.PI/2;scene.add(m);return m;});
 // Porch lights as one set of glows sharing the porch material groups.
 const porchGlowGeo=new THREE.BufferGeometry(),pp=[],pg=[];world.houses.forEach(h=>{const w=h.toWorld(h.porchLight.x,h.porchLight.z+.08);pp.push(w.x,w.ground+h.porchLight.y,w.z);pg.push(h.porchMat===world.homes.jamie?.porchMat?99:world.porchMats.indexOf(h.porchMat));});
 porchGlowGeo.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));porchGlowGeo.setAttribute('level',new THREE.Float32BufferAttribute(new Float32Array(pg.length),1));
 const porchGlow=new THREE.Points(porchGlowGeo,glowMat(.9));porchGlow.material.uniforms.uColor.value.set(0xffc27a);porchGlow.frustumCulled=false;scene.add(porchGlow);
 const porchOn=world.porchMats.map((_,i)=>.2+hash(i*5.1)*.42),windowOn=world.windowMats.map((_,i)=>.08+hash(i*2.7)*.5);
 let jamiePorch=0,jamieLit=false;const JAMIE_PORCH=FORMATION.jamie.leaveAt-29;
 function updateLights(dt,ctx){const p=ctx.p,n=ctx.night,lv=lampGlowGeo.attributes.level;
  for(const l of lamps){const since=ctx.distance-l.on;let target=0;if(since>0){const t=since/4.5;target=t<.25?(Math.sin(t*90+l.i)>.2?.5:.05):Math.min(1,.35+t*.9);}if(ctx.finale>0)target=1;l.level=damp(l.level,target,since>0&&since<1.2?30:2.2,dt);
   lampLevels[l.i]=l.level;lv.setX(l.i,l.level*(.35+.65*smooth((p-.4)/.3)));pools[l.i].material.opacity=l.level*(.14+.2*n)*smooth((p-.45)/.3);}
  lv.needsUpdate=true;
  world.porchMats.forEach((m,i)=>{const on=smooth((p-porchOn[i])/.06);m.emissiveIntensity=.05+on*1.6;});
  const jp=world.homes.jamie.porchMat;if(ctx.distance>=JAMIE_PORCH)jamieLit=true;jamiePorch=damp(jamiePorch,jamieLit?1:0,3,dt);jp.emissiveIntensity=.05+Math.max(jamiePorch,smooth((p-.3)/.06))*1.6;
  const pl=porchGlowGeo.attributes.level;for(let i=0;i<pg.length;i++){const g=pg[i];const lvl=g===99?jamiePorch:smooth((p-porchOn[g])/.06);pl.setX(i,lvl*(.45+.55*smooth((p-.35)/.4)));}pl.needsUpdate=true;
  world.windowMats.forEach((m,i)=>{m.emissiveIntensity=.08+smooth((p-windowOn[i])/.25)*1.05+n*.15;});
  for(const lit of [world.glassLit,world.porchLit])if(lit){lit.userData.uniforms.uP.value=p;lit.userData.uniforms.uNight.value=n;}
  // The rest of the neighborhood lights up a little after the street does.
  if(world.farWindow)world.farWindow.emissiveIntensity=.05+smooth((p-.5)/.3)*1.1+n*.2;
  const scale=(hooks.renderer?.domElement?.height||900);lampGlow.material.uniforms.uScale.value=scale;porchGlow.material.uniforms.uScale.value=scale;}

 // Reuse the two local lights at the friends' homes: porch/garage and bedroom spill.
 // Their permanent props are visible in the prologue as well as on the return at night.
 const homeLamps=['jamie','sam'].flatMap(key=>{const h=world.homes[key],w=h.sneakWin,front=key==='jamie'?{x:h.porchLight.x,z:h.porchLight.z+.5,y:h.porchLight.y}:{x:h.gx,z:h.gfront+.65,y:2.35};return [front,{x:w.s*(h.w/2+.3),z:w.z,y:w.y}].map((a,i)=>{const q=h.toWorld(a.x,a.z);return {p:{x:q.x,y:q.ground+a.y,z:q.z},power:i?2.5:key==='jamie'?6:12,range:i?5:8};});});
 function updateLocalLights(dt,ctx){const distance=p=>Math.hypot(p.x-ctx.eye.x,p.z-ctx.eye.z),nearHomes=homeLamps.filter(l=>distance(l.p)<27),nearest=lamps.map(l=>({p:l.at,power:l.level*19,range:19,score:distance(l.at)}));
  for(const l of nearHomes)nearest.push({...l,score:distance(l.p)*.38});nearest.sort((a,b)=>a.score-b.score);
  localLights.forEach((light,i)=>{const l=nearest[i],p=l.p;light.position.set(p.x,p.y-.15,p.z);light.distance=l.range;light.intensity=damp(light.intensity,l.power*smooth((ctx.p-.45)/.3),4,dt);});}

 // The tire swing at the lookout, and lights of the next town over -------------------------------------------
 const sw=LOOKOUT.swing,oak=LOOKOUT.oak,swingRoot=world.anchor(sw.d,sw.lat,world.groundY(sw.d,sw.lat)-groundPoint(sw.d,sw.lat).y+4.35);
 {const limb=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,1,6),world.material(0x5d4f42));const dl=oak.lat-sw.lat,dd=oak.d-sw.d;limb.scale.y=Math.hypot(dl,dd)+.4;limb.position.set(dl/2,-.05,-dd/2);limb.rotation.set(0,Math.atan2(dl,-dd),Math.PI/2);limb.rotation.order='YXZ';limb.castShadow=true;swingRoot.add(limb);}
 const swing=new THREE.Group();swingRoot.add(swing);const tire=new THREE.Mesh(new THREE.TorusGeometry(.3,.11,8,16),world.material(0x2a2a2b));{const rope=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,3.05,5),world.material(0xb8a57e));rope.position.y=-1.52;swing.add(rope);tire.position.y=-3.35;tire.castShadow=true;swing.add(tire);}
 // A real pendulum (3.35 m of rope): the evening air keeps it turning a little, a push sends it
 // away from you and it swings back, slower each time. th: along the street, ph: across it.
 const pend={th:0,ph:0,wt:0,wp:0,creak:0};
 function pushSwing(from){const dd=sw.d-(from?.d??sw.d-1),dl=sw.lat-(from?.lat??sw.lat),n=Math.hypot(dd,dl)||1;pend.wt+=.62*dd/n;pend.wp+=.62*dl/n;}
 function swingPosition(){swingRoot.updateMatrixWorld(true);return tire.getWorldPosition(new THREE.Vector3());}
 const townGeo=new THREE.BufferGeometry(),tp=[],tl=[];for(let i=0;i<46;i++){const lat=(hash(i*4.4)-.5)*420,d=1480+hash(i*2.2)*120,p=groundPoint(d,lat);tp.push(p.x,p.y-6+hash(i*8.8)*3,p.z);tl.push(.3+hash(i*1.7)*.7);}
 townGeo.setAttribute('position',new THREE.Float32BufferAttribute(tp,3));townGeo.setAttribute('level',new THREE.Float32BufferAttribute(tl,1));
 const townMat=glowMat(5);townMat.fog=false;townMat.uniforms.uColor.value.set(0xffd9a0);const town=new THREE.Points(townGeo,townMat);town.frustumCulled=false;scene.add(town);
 function updateLookout(dt,ctx){const t=time.value,G=9.8/3.35;
  for(const [a,w] of [['th','wt'],['ph','wp']]){pend[w]+=(-G*Math.sin(pend[a])-.22*pend[w])*dt;pend[a]=clamp(pend[a]+pend[w]*dt,-.75,.75);}
  const moving=Math.abs(pend.th)+Math.abs(pend.ph)>.1;if(moving&&Math.sign(pend.wt)!==pend.creak){pend.creak=Math.sign(pend.wt);sfx('creak',swingPosition(),{gain:.25});}
  // At rest the rope still creaks now and then in the breeze, as it always did.
  if(!moving&&ctx.finale>0&&Math.abs(Math.sin(t*.6))>.995&&!pend.idle){pend.idle=true;sfx('creak',swingRoot.position,{gain:.4});}if(Math.abs(Math.sin(t*.6))<.9)pend.idle=false;
  swing.rotation.set(pend.th+.07*Math.sin(t*1.05)+.025*Math.sin(t*.37)*gust.value,0,pend.ph+.04*Math.sin(t*.8+1));
  townMat.uniforms.uScale.value=(hooks.renderer?.domElement?.height||900);const lv=smooth((ctx.p-.8)/.2)*.6+ctx.night*.5;town.visible=lv>.01;townMat.uniforms.uColor.value.setRGB(1*lv,.85*lv,.62*lv);}

 // Heard, not seen: a screen door somewhere, a mower early, a dog now and then.
 const SCREEN_AT=752,screenDoor=street.filter(h=>h.side<0).sort((a,b)=>Math.abs(a.dc-SCREEN_AT)-Math.abs(b.dc-SCREEN_AT))[1];let screenPlayed=false,barks=[418,472,655];
 function updateSounds(ctx){if(!screenPlayed&&ctx.distance>=SCREEN_AT){screenPlayed=true;const s=screenDoor.S(screenDoor.doorX,screenDoor.front),p=groundPoint(s.d,s.lat);sfx('doorSlam',tmp.set(p.x,p.y+1,p.z),{gain:.7});}
  for(let i=0;i<barks.length;i++)if(barks[i]&&ctx.distance>=barks[i]){barks[i]=0;const p=groundPoint(ctx.distance+60,(i%2?1:-1)*45);sfx('dog',tmp.set(p.x,p.y+.5,p.z));}
  const mower=groundPoint(170,-48);if(!nightMode)sources.push({kind:'mower',pos:tmp.clone().set(mower.x,mower.y,mower.z),level:1-smooth((ctx.distance-150)/140)});}

 function reset(){time.value=0;gust.value=0;sources.length=0;Object.assign(pend,{th:0,ph:0,wt:0,wp:0,creak:0,idle:false});
  for(const s of sprinklers){s.on=1;s.angle=0;s.dir=1;s.tick=0;s.jet.visible=true;}kid.t=0;kid.lastBounce=-1;kid.phase='dribble';kid.person.group.visible=ballMesh.visible=true;
  nightMode=false;car.mode='wait';car.u=0;car.v=0;car.t=0;car.opened=false;car.closing=false;car.path=car.path||carPath();cg.set(0);carParts.head.emissiveIntensity=1.2;for(const w of carParts.wheels)w.rotation.x=0;for(const s of carGlow)s.material.opacity=.9;placeCar();carGroup.visible=false;
  for(const f of flocks){f.t=-1;for(const b of f.birds)b.g.visible=false;}for(const f of fData)f.d=0;for(const l of lamps){l.level=0;lampLevels[l.i]=0;}for(const light of localLights)light.intensity=0;screenPlayed=false;barks=[418,472,655];jamiePorch=0;jamieLit=false;}
 function update(dt,ctx){time.value+=dt;gust.value=damp(gust.value,.5+.5*Math.sin(time.value*.13)*Math.sin(time.value*.07),1,dt);hooksDistance=ctx.distance;sources.length=0;
  updateSprinklers(dt,ctx);updateKid(dt,ctx);updateCar(dt,ctx);updateBirds(dt,ctx);updateFireflies(dt,ctx);updateFlag();updateLights(dt,ctx);updateLocalLights(dt,ctx);updateLookout(dt,ctx);updateSounds(ctx);
  const rf=roadFrame(Math.min(ctx.distance,1140));dust.position.set(rf.x,rf.y+Math.sin(time.value*.1)*.2,rf.z);dust.rotation.y=-rf.heading;dustMat.uniforms.uOpacity.value=.6*(1-smooth((ctx.p-.6)/.3));dustMat.uniforms.uScale.value=(hooks.renderer?.domElement?.height||900)*.9;}
 reset();
 // Things in the street a rider should not pass through.
 function blockers(){return carGroup.visible&&car.mode!=='parked'&&Math.abs(car.lat)<5?[{d:car.d,lat:car.lat,half:2.6,width:1.1,speed:car.mode==='drive'?car.v:0}]:[];}
 return {update,reset,sources,time,blockers,pushSwing,swingPosition,night,skipTo,get nightMode(){return nightMode;},get swing(){return {...pend};},get state(){return {sprinklers:sprinklers.map(s=>s.on),kidVisible:kid.person.group.visible,car:car.mode,lamps:lamps.map(l=>l.level),swing:Math.abs(pend.th)+Math.abs(pend.ph)};}};
}
