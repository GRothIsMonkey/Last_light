// Chapter Six: the people only this chapter has, and the two that are not people.
//
//  Sam's dad:       a quiet man in a navy polo and jeans, Sam's hair going grey; the cable lock, the fishing trip.
//  Mr. Brandt:      Ray Brandt, thirty-one years with the township's Public Works: rain jacket, a hi-vis vest, work boots.
//  Two firefighters (the rescue squad that comes that evening), in turnout coats and helmets.
//  (Officer Reyes is the officer from the easement on Sunday night, the one who said "Okay": Chapter One's second
//  officer. Alex's dad and the other officer are Chapter One's too. All four are the kit's own actors.)
//
//  The figure in Line Two: Alex as everyone has seen him on the flyers, the gold shirt, the olive shorts. It stands. It
//  runs at the grille. It does not come through.
//  The other Sam: Sam, his hair, his shirt, his face, his way of standing, a moment late. It does not get wet.
//
// Both are rig.js people with Chapter Five's faces and bodies (faces.js, chapter5-models.js), so up close they are the
// same as the boys they look like. Neither is ever explained.
import * as THREE from './three.module.js';
import {createActor,ADULTS,headingTo,wrap} from './people.js';
import {createPerson,newPose,standPose,walkPose,applyPose,copyPose,P as PI} from './rig.js';
import {createFace} from './faces.js';
import {chapter5Appearance} from './chapter5-models.js';
import {CAST} from './cast.js';
import {clamp,damp,smooth} from './chapter6-kit.js';

export const ADULTS6={
 samDad:{name:'SAM’S DAD',scale:1.2,
  face:{jaw:.95,cheek:.98,eyeGap:.037,eyeY:.012,browTilt:.06,nose:'straight',mouth:'flat',ears:1,skin:0xd9b394,lips:0xae7462,iris:0x3a3226},
  hair:{style:'swept',color:0x4a4038},build:{bulk:1.08,shoulders:1.04,head:.98,posture:0,hunch:.06},
  clothes:{shirt:0x2c3a58,trim:0x2c3a58,collar:true,sleeves:'short',pants:0x47546a,socks:0x47546a,shoes:0x3a3632,sole:0x2a2826}},
 brandt:{name:'MR. BRANDT',scale:1.2,
  face:{jaw:1,cheek:.95,eyeGap:.038,eyeY:.011,browTilt:-.04,nose:'broad',mouth:'flat',ears:1.04,skin:0xc8957a,lips:0x9a6252,iris:0x3a4a52},
  hair:{style:'cropped',color:0x9a958c},build:{bulk:1.16,shoulders:1.1,head:.99,posture:0,hunch:.08},
  clothes:{shirt:0xd2c232,trim:0xd8d8d0,collar:true,sleeves:'long',pants:0x3e4436,socks:0x3e4436,shoes:0x5a4632,sole:0x2a2620}},
 fire1:{name:'FIREFIGHTER',scale:1.21,
  face:{jaw:.97,cheek:.97,eyeGap:.037,eyeY:.012,browTilt:0,nose:'straight',mouth:'flat',ears:1,skin:0xb98466,lips:0x8e5a4a,iris:0x2a1e16},
  hair:{style:'cropped',color:0x221a14},build:{bulk:1.2,shoulders:1.16,head:.98,posture:0,hunch:.03},
  clothes:{shirt:0xa88a4e,trim:0xd8d040,collar:true,sleeves:'long',pants:0xa88a4e,socks:0xa88a4e,shoes:0x1a1a1a,sole:0x111111}},
 fire2:{name:'FIREFIGHTER',scale:1.18,
  face:{jaw:.9,cheek:1,eyeGap:.036,eyeY:.013,browTilt:.06,nose:'button',mouth:'flat',ears:.97,skin:0xe2b898,lips:0xb07064,iris:0x4a5a6a},
  hair:{style:'cropped',color:0x8a6a48},build:{bulk:1.12,shoulders:1.08,head:.97,posture:0,hunch:.04},
  clothes:{shirt:0xa88a4e,trim:0xd8d040,collar:true,sleeves:'long',pants:0xa88a4e,socks:0xa88a4e,shoes:0x1a1a1a,sole:0x111111}},
};

// A firefighter's helmet and a rain jacket's hood brim: small meshes riding the head.
function helmet(person,color=0x1a1a1a,{brim=.15,shield=null}={}){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.1});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.125,18,10,0,Math.PI*2,0,Math.PI/2),m);dome.scale.set(1,.9,1.15);dome.position.y=.03;g.add(dome);
 const rim=new THREE.Mesh(new THREE.CylinderGeometry(.13+brim,.135+brim,.012,24),m);rim.position.set(0,.03,.04);rim.scale.z=1.15;g.add(rim);
 if(shield){const s=new THREE.Mesh(new THREE.PlaneGeometry(.07,.06),new THREE.MeshStandardMaterial({color:shield,roughness:.5}));s.position.set(0,.08,-.13);s.rotation.x=-.3;g.add(s);}
 person.parts.head.add(g);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}

export function createCast6({scene,nav,camera}){
 const samDad=createActor(scene,nav,ADULTS6.samDad,{seed:61});
 const brandt=createActor(scene,nav,ADULTS6.brandt,{seed:62});
 {// the vest's reflective bands over the yellow (two thin rings round the torso)
  const band=new THREE.MeshStandardMaterial({color:0xe8e8e0,emissive:0x8a8a84,emissiveIntensity:.25,roughness:.4});for(const y of [.03,.1]){const r=new THREE.Mesh(new THREE.TorusGeometry(.135,.008,4,22),band);r.rotation.x=Math.PI/2;r.position.y=y;r.scale.set(1.05,.62,1);brandt.person.parts.torso.add(r);}}
 const fire=[createActor(scene,nav,ADULTS6.fire1,{seed:63}),createActor(scene,nav,ADULTS6.fire2,{seed:64})];
 for(const f of fire){helmet(f.person,0x1e1e20,{shield:0x2a4a8a});const band=new THREE.MeshStandardMaterial({color:0xd8d870,emissive:0x8a8a40,emissiveIntensity:.3});for(const y of [-.12,.02]){const r=new THREE.Mesh(new THREE.TorusGeometry(.145,.012,4,22),band);r.rotation.x=Math.PI/2;r.position.y=y;r.scale.set(1.05,.65,1);f.person.parts.torso.add(r);}}
 const actors=[samDad,brandt,...fire];
 // ---- the two that are not people --------------------------------------------------------------------------------------------
 // A body built as Chapter Five builds the boys, standing somewhere, that can stand, walk, run and stop; and look.
 function figure(cast,name){const person=createPerson({...cast,expressive:true});person.group.name=name;person.group.visible=false;scene.add(person.group);
  const face=createFace(person,cast);person.face=face;const art=chapter5Appearance(person,cast);art.enable(true);person.group.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  const F={person,face,art,pose:newPose(),hold:newPose(),x:0,z:0,y:0,a:0,t:0,v:0,gait:0,mode:'off',path:null,pi:0,speed:0,tilt:0,tiltTo:0,look:0,lookTo:0,ground:null,reach:0,reachTo:0,crouch:0,
   copy:null,lag:.55,ring:[],ringT:0,copyW:0,copyWTo:0,hit:0,still:0,
   show(on,{x,z,a,y}={}){person.group.visible=!!on;F.mode=on?'stand':'off';if(on){F.x=x;F.z=z;F.a=a??F.a;F.y=y??(nav.groundY(x,z));F.v=0;F.path=null;F.t=0;F.tilt=F.tiltTo=0;F.look=F.lookTo=0;F.reach=F.reachTo=0;F.hit=0;F.ring.length=0;face.set('neutral',{hold:99});}},
   // along points [{x,z}], at a speed it reaches with its own acceleration (accel: how fast it gets there: the run)
   go(pts,{speed=1.1,accel=2,then=null}={}){F.path=pts.slice();F.pi=0;F.speed=speed;F.accel=accel;F.then=then;F.mode='walk';},
   stop(){F.path=null;F.mode='stand';F.v=0;},
   lookAt(q){F.lookTo=q?clamp(-wrap(headingTo(F.x,F.z,q.x,q.z)-F.a),-1.1,1.1):0;}};
  return F;}
 const AX=figure(CAST.alex,'line-two-figure');
 const SAM2=figure(CAST.sam,'the-other-sam');
 // (and Jamie, as he was on the stairs of his own house that morning: Chapter Five's double again, in daylight)
 const JAMIE2=figure(CAST.jamie,'jamie-on-the-stairs');
 function updateFigure(F,dt,{eye}={}){if(F.mode==='off')return;F.t+=dt;const p=F.pose;
  if(F.mode==='walk'&&F.path){const q=F.path[F.pi];if(!q){F.mode='stand';F.path=null;const f=F.then;F.then=null;f?.(F);}else{const dx=q.x-F.x,dz=q.z-F.z,d=Math.hypot(dx,dz);
    const want=Math.min(F.speed,Math.sqrt(2*Math.max(3,F.accel)*Math.max(0,d))+.2);F.v+=clamp(want-F.v,-F.accel*2*dt,F.accel*dt);
    const ta=Math.atan2(dx,-dz);F.a+=clamp(wrap(ta-F.a),-6*dt,6*dt);const step=Math.min(d,F.v*dt);F.x+=dx/(d||1)*step;F.z+=dz/(d||1)*step;if(d<.06)F.pi++;}}
  else F.v=damp(F.v,0,8,dt);
  F.tilt=damp(F.tilt,F.tiltTo,2.2,dt);F.look=damp(F.look,F.lookTo,F.mode==='walk'?6:1.6,dt);F.reach=damp(F.reach,F.reachTo,9,dt);F.copyW=damp(F.copyW,F.copyWTo,3,dt);F.hit=Math.max(0,F.hit-dt*1.2);
  if(F.v>.08){F.gait+=F.v*dt/(F.v>2.4?1.6:1.05);walkPose(p,F.gait,Math.max(.8,F.v),{look:F.look*.4});if(F.v>2.4){p[PI.lean]+=.22;p[PI.root+1]-=.03;}}
  else standPose(p,0,{look:F.look,shift:0});
  // the stillness: no breath, no weight shift; a head that tilts a little too far and stays there
  p[PI.hy]=F.look;p[PI.roll]=(p[PI.roll]||0)+F.tilt*.3;p[PI.hp]+=F.tilt*.12;
  // copying: the real one's posture, a moment late (the pose recorded each frame, played back lag seconds on)
  if(F.copy){F.ringT+=dt;F.ring.push({t:F.ringT,p:Float32Array.from(F.copy())});while(F.ring.length>2&&F.ring[1].t<F.ringT-F.lag)F.ring.shift();
   if(F.copyW>.01&&F.ring.length){const old=F.ring[0].p;for(const k of [PI.lh,PI.lh+1,PI.lh+2,PI.rh,PI.rh+1,PI.rh+2,PI.lean,PI.twist])p[k]+=(old[k]-p[k])*F.copyW;}}
  // arms up and forward (at the bars; at the lever) when it reaches
  if(F.reach>.01){const w=F.reach,y=p[PI.root+1];for(const [o,s] of [[PI.lh,-1],[PI.rh,1]]){p[o]+=(s*.2-p[o])*w;p[o+1]+=(y+.38-p[o+1])*w;p[o+2]+=(-.42-p[o+2])*w;}p[PI.lean]+=.12*w;}
  if(F.hit>0)p[PI.lean]-=.25*F.hit;
  if(F.ground)F.y=F.ground(F.x,F.z);F.person.group.position.set(F.x,F.y-F.crouch,F.z);F.person.group.rotation.set(0,-F.a,0);applyPose(F.person,p);
  F.face.update?.(dt,{clock:F.t,talk:0,speech:null,visible:true});}
 function update(dt,ctx){for(const a of actors)if(a.visible)a.update(dt,ctx);for(const F of [AX,SAM2,JAMIE2])updateFigure(F,dt,ctx);}
 function reset(){for(const a of actors){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}for(const F of [AX,SAM2,JAMIE2]){F.show(false);F.copy=null;F.copyW=F.copyWTo=0;F.crouch=0;F.ground=null;}}
 return {samDad,brandt,fire,actors,AX,SAM2,JAMIE2,update,reset,blockers(out){for(const a of actors)if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});for(const F of [AX,SAM2])if(F.mode!=='off'&&F.person.group.visible&&F.blocks)out.push({x:F.x,z:F.z,r:.3,speed:0});}};
}

// A rescue truck (Oak Hollow Fire, Rescue 2): red, a white stripe, a light bar that turns, a scene light on a mast.
export function rescueTruck(){const g=new THREE.Group();g.name='rescue-truck';const red=new THREE.MeshStandardMaterial({color:0x9a1a16,roughness:.35,metalness:.3}),white=new THREE.MeshStandardMaterial({color:0xe8e6dc,roughness:.4}),glass=new THREE.MeshStandardMaterial({color:0x182026,roughness:.08,metalness:.5}),tire=new THREE.MeshStandardMaterial({color:0x141414,roughness:.9});
 const box=(x,y,z,w,h,d,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;};
 box(0,1.35,.9,2.35,2.1,5.2,red);box(0,1.25,-2.5,2.3,1.8,1.8,red);box(0,1.75,-3.38,2.1,.8,.06,glass);box(0,.92,.9,2.37,.18,5.22,white);for(const s of [-1,1])box(s*1.16,1.75,-2.5,.04,.6,1.4,glass);
 const lens=[0xff2a1e,0xffffff,0xff2a1e].map((c,i)=>{const m=new THREE.MeshStandardMaterial({color:0x5a1010,emissive:c,emissiveIntensity:0,roughness:.3});box(-.6+i*.6,2.24,-2.6,.5,.14,.3,m);return m;});
 for(const [x,z] of [[-1,-2.6],[1,-2.6],[-1,1.4],[1,1.4],[-1,2.6],[1,2.6]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.3,16),tire);w.rotation.z=Math.PI/2;w.position.set(x,.46,z);g.add(w);}
 const mast=box(.7,3.1,2.6,.08,1.6,.08,white);void mast;const lamp=new THREE.MeshStandardMaterial({color:0xf8f4e0,emissive:0xfff2d0,emissiveIntensity:0});box(.7,3.95,2.6,.5,.3,.2,lamp);
 return {g,lens,lamp,update(t,on){lens.forEach((m,i)=>{m.emissiveIntensity=on?(Math.sin(t*8+i*2.1)>.2?3:.2):0;});lamp.emissiveIntensity=on?2.2:0;}};}
