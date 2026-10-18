// Chapter Five: what the camp does at night. Nothing here is a monster and nothing here is explained: lights in rooms
// with no power, lights carried where nobody is, a boy who is standing next to you and also somewhere else. In the code
// it is the Presence again (presence.js has its streetlights downtown); here it has a camp to work with.
//
//  Lamps:    every building with windows (the panes' glow, pine-camp.js) and the office's porch bulb. A lamp has a level
//            and a level it is going to; on the way it can flicker. The three nearest lit lamps get a real light each.
//  Carried:  up to three small lights at hand height, carried along a path (a flashlight's bob and sway). They retrace
//            what the trail recorder kept of where the three of you walked that afternoon.
//  The double: Jamie, his own clothes and his own cap, standing in a room. Nothing more.
//
// Lights join the scene only while Chapter Five is playing (attach): every light in a scene costs every lit material.
import * as THREE from './three.module.js';
import {createPerson,newPose,standPose,walkPose,applyPose,P as PI} from './rig.js';
import {createFace} from './faces.js';
import {CAST} from './cast.js';
import {PW,BLD,frameOf} from './pine-plan.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
// a building's room, at a height over its floor (plan-frame lx, lz: lz out of the front)
export function roomPoint(id,lx=0,lz=0,y=2.0){const b=BLD[id],F=frameOf(b.c,b.a),[e,n]=F.to(lx,lz),p=PW(e,n);return new THREE.Vector3(p.x,b.y+(b.floor||0)+y,p.z);}

export function createCampPresence({scene,world,camera,sfx=()=>{}}){
 const PN=world.pine,G=PN?.glows||{},live=PN?.live;
 const root=new THREE.Group();root.name='camp-presence';
 // ---- the lamps -------------------------------------------------------------------------------------------------------------
 const LAMPS={};
 // (a cabin's bulb hangs from the ridge a little behind the middle of the room: pine-camp.js)
 for(const id of Object.keys(G)){const b=BLD[id];if(!b)continue;LAMPS[id]={id,pos:roomPoint(id,0,b.kind==='lodge'?1.5:-.4,b.kind==='lodge'?2.6:2.05),glow:G[id],level:0,want:0,rate:1.5,flick:0,seed:id.length*1.7,color:0xffbe6a};}
 // the office's porch bulb: a bare bulb under the porch roof, by the door (it has its own small mesh)
 {const b=BLD.office,lz=b.d/2+b.porch*.5,pos=roomPoint('office',b.door[0],lz,b.h-.2);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),new THREE.MeshStandardMaterial({color:0xe8e0c8,emissive:0xffd08a,emissiveIntensity:0,roughness:.3}));bulb.position.copy(pos);bulb.name='office-porch-bulb';root.add(bulb);
  const cord=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.18,5),new THREE.MeshStandardMaterial({color:0x1e1c1a}));cord.position.set(pos.x,pos.y+.12,pos.z);root.add(cord);
  LAMPS['office-porch']={id:'office-porch',pos,bulb,level:0,want:0,rate:2,flick:0,seed:3.1,color:0xffd08a,porch:true};}
 const POOL=[0,1,2].map(i=>{const L=new THREE.PointLight(0xffbe6a,0,11,2);L.name='camp-lamp-'+i;root.add(L);return L;});
 // A lit window seen from far off (across the lake, from the dam, from the lot): a small glow the night's haze does not swallow.
 // (and the porch bulb's own halo, near)
 const glowTex=(()=>{try{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext?.('2d');if(!g)return null;const r=g.createRadialGradient?.(32,32,0,32,32,32);if(!r)return null;
  r.addColorStop(0,'rgba(255,236,190,1)');r.addColorStop(.16,'rgba(255,220,160,.95)');r.addColorStop(.38,'rgba(255,190,110,.4)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})();
 // (far off, a lit window shows through the trees between, the way a light does at night)
 for(const L of Object.values(LAMPS)){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffc890,transparent:true,opacity:0,depthWrite:false,depthTest:!!L.porch,blending:THREE.AdditiveBlending,fog:false}));sp.renderOrder=L.porch?0:5;sp.position.copy(L.pos);if(!L.porch)sp.position.y-=.45;sp.visible=false;sp.name='lamp-glow-'+L.id;root.add(sp);L.sprite=sp;}
 let t=0;
 function set(id,want,{rate=1.5,flick=0}={}){const L=LAMPS[id];if(!L)return;L.want=want;L.rate=rate;L.flick=flick;}
 const level=id=>LAMPS[id]?.level||0;
 function allOff(){for(const L of Object.values(LAMPS)){L.want=0;L.level=0;L.flick=0;}apply();}
 function snap(id,v){const L=LAMPS[id];if(L){L.level=L.want=v;}}
 const lit=()=>Object.values(LAMPS).filter(L=>L.level>.25).map(L=>L.id);
 // ---- the carried lights ------------------------------------------------------------------------------------------------------
 // Flashlights, carried: a small dark body and its lens at hand height, a narrow beam that fades along its length (thin,
 // additive, fogged, so far off it is a pale streak through the trees and near it lights the dust), and a real spot light
 // making the pool on the ground ahead and catching the trunks it passes. The beam points where its carrier walks, down
 // at the path a few metres ahead, swinging a little with each step; aim() turns it on something (on you). No glowing
 // balls. Each has a switch (lit) apart from fading in and out, and a carried height (sitting: lower).
 const beamTex=(()=>{try{const c=document.createElement('canvas');c.width=4;c.height=64;const g=c.getContext?.('2d');if(!g?.createLinearGradient)return null;const r=g.createLinearGradient(0,0,0,64);
  r.addColorStop(0,'rgba(255,240,205,0)');r.addColorStop(.55,'rgba(255,238,200,.35)');r.addColorStop(.9,'rgba(255,236,196,.85)');r.addColorStop(1,'rgba(255,236,196,1)');g.fillStyle=r;g.fillRect(0,0,4,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})();
 const BEAM_L=7,beamGeo=new THREE.ConeGeometry(.95,BEAM_L,14,1,true);beamGeo.translate(0,-BEAM_L/2,0);beamGeo.rotateX(Math.PI/2);// (apex at the lens, opening along +z)
 const bodyGeo=new THREE.CylinderGeometry(.018,.022,.17,8);bodyGeo.rotateX(Math.PI/2);const lensGeo=new THREE.CircleGeometry(.024,12);
 const CARRY=[0,1,2].map(i=>{const g=new THREE.Group();g.name='carried-light-'+i;const aimG=new THREE.Group();g.add(aimG);
  const body=new THREE.Mesh(bodyGeo,new THREE.MeshStandardMaterial({color:0x1c1c1e,roughness:.5,metalness:.4}));body.position.z=-.085;aimG.add(body);
  const head=new THREE.Mesh(lensGeo,new THREE.MeshBasicMaterial({color:0xfff2d0}));head.position.z=.002;aimG.add(head);
  const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xffe8c0,map:beamTex,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));beam.renderOrder=4;aimG.add(beam);
  // (its light stays in the scene at 0 when unlit, so the number of lights never changes during the chapter)
  const L=new THREE.SpotLight(0xffe6b0,0,16,.36,.55,1.6);L.name='carried-light-lamp-'+i;root.add(L,L.target);g.visible=false;root.add(g);
  return {g,aimG,head,beam,halo:beam,L,on:0,want:0,lit:1,litWant:1,path:null,u:0,v:1.25,off:[0,-1.1,1.1][i],lag:[0,1.3,2.4][i],phase:i*2.1,stop:0,done:false,h:1.05,hWant:1.05,aim:null,dir:new THREE.Vector3(0,0,1)};});
 // A path for them all (world points); speed; when it ends, they stop and hold (or go out: out=true).
 function carry(n,pts,{speed=1.25,out=false,from=0}={}){const each=Array.isArray(pts[0]),mk=list=>{const segs=[];let L=0;for(let i=1;i<list.length;i++){const a=list[i-1],b=list[i],l=Math.hypot(b.x-a.x,b.z-a.z);segs.push({a,b,l,s:L,wait:b.wait||0,sit:!!b.sit});L+=l;}return {segs,L};};
  const one=each?null:mk(pts);
  for(let i=0;i<3;i++){const c=CARRY[i];c.path=i<n?(each?mk(pts[i]||pts[0]):one):null;c.off=each?0:[0,-1.1,1.1][i];c.u=from;c.v=speed;c.want=i<n?1:0;c.out=out;c.done=false;c.stop=0;c.wait=0;c.aim=null;c.lit=c.litWant=1;c.hWant=1.05;if(i<n){c.g.visible=true;}}}
 function hold(on){for(const c of CARRY){if(!c.g.visible)continue;if(on){if(c.wait<60)c.wait=1e4;}else if(c.wait>60)c.wait=0;}}
 function carriedOut(dur=.4){for(const c of CARRY){c.want=0;c.fade=dur;}}
 // the switch (a click: no fade), the aim (a point to shine at, or null), the carried height
 function switchLight(i,on){const c=CARRY[i];if(c)c.litWant=on?1:0;}
 function aim(i,pt){const c=CARRY[i];if(c)c.aim=pt||null;}
 function sitDown(i,on){const c=CARRY[i];if(c)c.hWant=on?.62:1.05;}
 const at=(c,u)=>{const P=c.path;if(!P||!P.segs.length)return null;u=clamp(u,0,P.L);let s=P.segs[P.segs.length-1];for(const q of P.segs)if(u<=q.s+q.l){s=q;break;}const f=s.l>0?(u-s.s)/s.l:1;
  return {x:s.a.x+(s.b.x-s.a.x)*f,z:s.a.z+(s.b.z-s.a.z)*f,y:(s.a.y??0)+((s.b.y??0)-(s.a.y??0))*f,dx:(s.b.x-s.a.x)/(s.l||1),dz:(s.b.z-s.a.z)/(s.l||1),seg:s,f};};
 const _t=new THREE.Vector3(),_m=new THREE.Matrix4(),_up=new THREE.Vector3(0,1,0);
 function updateCarry(dt,groundY){for(const [i,c] of CARRY.entries()){if(!c.g.visible){c.L.intensity=0;continue;}c.on=damp(c.on,c.want,c.want>c.on?3:(c.fade?1/Math.max(.05,c.fade)*2:2),dt);
   c.lit=c.litWant;c.h=damp(c.h,c.hWant,2.2,dt);
   if(c.path&&!c.done){if(c.wait>0){c.wait-=dt;if(c.wait<=0&&c.sitting){c.sitting=false;c.hWant=1.05;}}else{const before=c.u;c.u+=c.v*dt;// (they stop where you stopped, as long as you did; where you sat, they sit)
     for(const q of c.path.segs)if(q.wait&&before<q.s+q.l-c.lag&&c.u>=q.s+q.l-c.lag){c.wait=q.wait;c.u=q.s+q.l-c.lag;if(q.sit){c.sitting=true;c.hWant=.62;}break;}}
    if(c.u-c.lag>=c.path.L){c.done=true;if(c.out)c.want=0;}}
   const q=at(c,Math.max(0,c.u-c.lag));if(q){const nx=-q.dz,nz=q.dx,walking=c.wait<=0&&!c.done,bob=walking?Math.sin(t*5.2+c.phase)*.04:Math.sin(t*1.1+c.phase)*.008,sway=Math.sin(t*1.7+c.phase)*.18;const x=q.x+nx*(c.off+sway*.3),z=q.z+nz*(c.off+sway*.3);
    c.g.position.set(x,(groundY?.(x,z)??q.y)+c.h+bob,z);
    // where it points: down the path ahead (with the step's swing), or at what it is aimed at
    if(c.aim){_t.set(c.aim.x-x,(c.aim.y??c.g.position.y)-c.g.position.y,c.aim.z-z).normalize();}else{const sw=walking?Math.sin(t*2.6+c.phase)*.16:Math.sin(t*.7+c.phase)*.05;_t.set(q.dx+nx*sw,-.34,q.dz+nz*sw).normalize();}
    c.dir.lerp(_t,1-Math.exp(-(c.aim?6:3.5)*dt)).normalize();c.aimG.quaternion.setFromRotationMatrix(_m.lookAt(new THREE.Vector3(),c.dir.clone().negate(),_up));
    c.L.position.copy(c.g.position);c.L.target.position.copy(c.g.position).addScaledVector(c.dir,8);}
   const k=c.on*c.lit;c.head.material.color.setScalar(.12+.88*k);c.beam.material.opacity=.32*k;c.L.intensity=9*k;if(c.on<.01&&c.want===0){c.g.visible=false;c.path=null;c.L.intensity=0;}}}
 const carrying=()=>CARRY.filter(c=>c.g.visible).length;
 const carriedAt=i=>CARRY[i]?.g.visible?CARRY[i].g.position:null;
 // ---- the double: Jamie, in a room ----------------------------------------------------------------------------------------------
 const D={person:createPerson({...CAST.jamie,expressive:true}),pose:newPose(),t:0,turn:0,turnTo:0,x:0,z:0,y:0,a:0,path:null,pi:0,v:.85,gait:0,walkV:0};D.person.group.visible=false;D.person.group.name='owl-double';root.add(D.person.group);
 D.face=createFace(D.person,CAST.jamie);
 D.person.group.traverse(q=>{if(q.isMesh)q.castShadow=true;});
 function double(on,{x,y,z,a}={}){D.person.group.visible=!!on;D.path=null;D.walkV=0;if(on){D.x=x;D.y=y;D.z=z;D.a=a;D.turn=0;D.turnTo=0;D.t=0;D.person.group.position.set(x,y,z);D.person.group.rotation.set(0,-a,0);D.face?.set('neutral',{hold:99});}}
 // it walks (world points with y): out of the room, through the door, toward you; its face your friend's, smiling
 function doubleWalk(pts,{speed=.85,smile=true}={}){D.path=pts;D.pi=0;D.v=speed;if(smile)D.face?.set('grin',{hold:99});}
 function updateDouble(dt){if(!D.person.group.visible)return;D.t+=dt;D.turn=damp(D.turn,D.turnTo,1.1,dt);
  const q=D.path?.[D.pi];if(q){const dx=q.x-D.x,dz=q.z-D.z,l=Math.hypot(dx,dz);if(l<.15){D.pi++;if(D.pi>=D.path.length)D.path=null;}else{const want=Math.atan2(dx,-dz);let da=want-D.a;da=Math.atan2(Math.sin(da),Math.cos(da));D.a+=da*(1-Math.exp(-6*dt));D.walkV=damp(D.walkV,D.v,3,dt);const st=Math.min(l,D.walkV*dt);D.x+=dx/l*st;D.z+=dz/l*st;D.y+=((q.y??D.y)-D.y)*Math.min(1,st/Math.max(l,.01));D.gait+=st/1.25;}}
  else D.walkV=damp(D.walkV,0,5,dt);
  D.person.group.position.set(D.x,D.y,D.z);D.person.group.rotation.set(0,-D.a,0);
  // stands the way he stands; breathes; does not shift his weight (that is the only thing wrong with it); walking, it never looks away from you
  if(D.walkV>.08){walkPose(D.pose,D.gait,Math.max(.8,D.walkV),{look:D.turn*.5});D.pose[PI.hy]=D.turn*.6;}else{standPose(D.pose,0,{look:D.turn,shift:0});D.pose[PI.hy]=D.turn;}applyPose(D.person,D.pose);
  D.face?.update(dt,{clock:t,talk:0,visible:true});}
 // ---- every frame ------------------------------------------------------------------------------------------------------------------
 function apply(){for(const L of Object.values(LAMPS)){const v=L.level;if(L.glow)L.glow.level=v;if(L.bulb)L.bulb.material.emissiveIntensity=v*3.2;}}
 function update(dt,{groundY}={}){t+=dt;
  for(const L of Object.values(LAMPS)){const target=L.want;L.level=damp(L.level,target,L.rate,dt);if(Math.abs(L.level-target)<.004)L.level=target;
   if(L.flick>0&&L.level>.05){const n=Math.sin(t*23+L.seed)*Math.sin(t*7.3+L.seed*2)+Math.sin(t*41+L.seed*5)*.4;if(n>1-L.flick)L.level*=.25;}}
  apply();
  // the three nearest lit lamps get the real lights
  const cam=camera.position,best=Object.values(LAMPS).filter(L=>L.level>.03).sort((a,b)=>a.pos.distanceToSquared(cam)/(a.level+.2)-b.pos.distanceToSquared(cam)/(b.level+.2)).slice(0,POOL.length);
  POOL.forEach((P,i)=>{const L=best[i];if(L){P.position.copy(L.pos);P.intensity=L.level*(L.porch?5:7);P.color.setHex(L.color);P.distance=L.porch?9:11;}else P.intensity=0;});
  for(const L of Object.values(LAMPS)){const sp=L.sprite;if(!sp)continue;const d=sp.position.distanceTo(cam),far=L.porch?1:smooth((d-35)/40),o=Math.min(1,L.level)*far;sp.visible=o>.02;if(sp.visible){sp.material.opacity=o*(L.porch?.8:1);const k=L.porch?.55:Math.max(1.2,d*.032);sp.scale.set(k,k,1);}}
  updateCarry(dt,groundY);updateDouble(dt);}
 function attach(on){if(on){if(!root.parent)scene.add(root);const lot=PN?.lights?.lot?.pool;if(lot&&!lot.parent)live?.add(lot);}else{root.removeFromParent();const lot=PN?.lights?.lot?.pool;lot?.removeFromParent();}}
 function reset(){allOff();for(const c of CARRY){c.g.visible=false;c.on=c.want=0;c.path=null;c.L.intensity=0;}D.person.group.visible=false;for(const P of POOL)P.intensity=0;t=0;}
 return {LAMPS,CARRY,D,set,snap,level,allOff,lit,carry,hold,carriedOut,switchLight,aim,sitDown,doubleWalk,carrying,carriedAt,double,update,attach,reset,root,get t(){return t;}};
}
