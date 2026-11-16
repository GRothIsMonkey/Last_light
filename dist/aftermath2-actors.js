// Aftermath II: the people of August 2021.
//
//  SAM21      Sam at twenty-two. PROVISIONAL (art bible A-21, CREATIVE DIRECTOR APPROVAL REQUIRED): not a new face. He is built from
//             twelve-year-old Sam's own identity (cast.js CAST.sam: the closest-set eyes of the four, the highest, the straight
//             nose, the flat thoughtful mouth, his skin, his eyes, his shaggy near-black hair, his slight build and the hunch) with
//             the shared character art (astra-anatomy.js boyModel, faces.js), grown up: taller (×1.165, about 1.78 m), a smaller
//             head for his height (adult proportions), a longer face and a firmer jaw, a shadow of stubble, his own sage-teal in a
//             2021 t-shirt, jeans. To be replaced by the approved age progression in the art reconstruction (Roadmap Phase 7)
//             without changing a line of the story: everything reads SAM21 by its handle.
//  YOU21      the adult protagonist's own body in first person (the same hands, grown; a t-shirt and jeans), and his eye at an
//             adult height (game.js eyeLift). The 2026 body at the desk is coda2026.js's, from the same derivation.
//  neighbours ordinary people on an ordinary evening: a man mowing, a woman and her dog, a boy shooting baskets, somebody's mom
//             on a porch. Background, people.js actors.
//  kids       two children on bikes, who live here now. Not the four of them: a girl and a boy of about ten and eleven, helmets on,
//             2021 bikes. Real kids; their bikes have real bells.
import * as THREE from './three.module.js';
import {createActor,worldPath,headingTo,wrap} from './people.js';
import {createPerson,createBike,newPose,ridePose,applyPose,poseBike,P,copyPose,standPose,walkPose,stride,blinkPerson} from './rig.js';
import {createFace} from './faces.js';
import {CAST} from './cast.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

const tint=(c,k)=>new THREE.Color(c).multiplyScalar(k).getHex();
// ---- Sam, ten years on (derived from CAST.sam; see the header) --------------------------------------------------------------------------
export const SAM21={name:'SAM',scale:1.165,age:22,derivedFrom:'CAST.sam',status:'PROVISIONAL (A-21)',
 face:{...CAST.sam.face,jaw:.99,cheek:.86,browTilt:-.05,ears:.97,lips:0x9a5f47},
 hair:{style:'shaggy',color:0x261a13},
 build:{bulk:1.02,shoulders:1.05,head:.885,posture:.06,hunch:.05},
 clothes:{shirt:0x58796f,trim:null,sleeves:'short',pants:0x343d4b,socks:0x343d4b,shoes:0x6c7076,sole:0xdedbd4}};
// The protagonist at twenty-two, in first person (from CAST.player). And at twenty-seven, at home at night (coda2026.js uses this).
export const YOU21={...CAST.player,name:'YOU',firstPerson:true,scale:1.15,age:22,derivedFrom:'CAST.player',status:'PROVISIONAL (A-20)',
 build:{...CAST.player.build,bulk:1.06,shoulders:1.07,head:.885},
 clothes:{shirt:0x46525e,trim:null,sleeves:'short',pants:0x2e3746,socks:0x2e3746,shoes:0x3a3c40,sole:0xd9d6cf}};
export const YOU26={...CAST.player,name:'YOU',scale:1.16,age:27,derivedFrom:'CAST.player',status:'PROVISIONAL (A-20)',
 face:{...CAST.player.face,jaw:.98,cheek:.88,ears:.98,lips:0xa86c58},
 hair:{style:'cropped',color:0x4b3527},
 build:{...CAST.player.build,bulk:1.05,shoulders:1.06,head:.885,posture:.02,hunch:.04},
 clothes:{shirt:0x5d6268,trim:null,sleeves:'long',pants:0x2f343b,socks:0x6a6d70,shoes:0x6a6d70,sole:0x6a6d70}};

// A grown-up face from a boy's: the head a little longer, the jaw firmer, a shadow of stubble on the lower face (vertex colours),
// for heads built by astra-anatomy.js (rig face: eyes and mouth are faces.js's own, so they move with it).
export function ageHead(person,{stubble=.12,long=1.06}={}){const head=person.parts?.head;if(!head||head.userData.aged)return;
 const g=head.geometry.clone(),p=g.attributes.position,c=g.attributes.color;
 if(c)for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),front=Math.max(0,Math.min(1,(-z-.02)/.05)),jaw=smooth((-.022-y)/.05)*(1-smooth((-.118-y)/.02))*smooth((.09-Math.abs(x))/.03);
  const k=stubble*front*jaw;if(k>0){c.setXYZ(i,c.getX(i)*(1-k*.55),c.getY(i)*(1-k*.58),c.getZ(i)*(1-k*.5));}}
 // (the lower face longer than a child's: below the eyes the head is drawn down a little)
 for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<0)p.setY(i,y*long);}
 if(c)c.needsUpdate=true;p.needsUpdate=true;g.computeVertexNormals();head.geometry=g;head.userData.aged=true;}

// ---- one grown-up friend who walks with you: modes stand / walk / follow / pin ----------------------------------------------------------
export function createFriend21(scene,nav,spec,{seed=11}={}){
 const A=createActor(scene,nav,spec,{seed,refine:false});
 ageHead(A.person,{stubble:.14,long:1.055});
 const face=createFace(A.person,spec);A.person.face=face;A.face=face;face.rich?.(true);face.enable?.(true);
 A.person.group.traverse(o=>{if(o.isMesh)o.castShadow=true;});
 A.person.group.name='a2-sam';
 const base=A.update;A.follow=null;A.pin=null;A.mood='neutral';A.hands=null;A.phoneT=0;
 // retarget: a new end for the walk he is already on, without starting it over (no stutter); a walk if he was standing
 A.retarget=(x,z,speed)=>{if(A.mode==='walk'&&A.path){A.path=worldPath([[A.x,A.z],[x,z]]);A.u=0;A.speed=speed;A.onArrive=null;}else A.walk([[x,z]],{speed});};
 // follow(fn): fn() gives where he wants to be ({x,z,look?,face?}); he walks there, at your pace, and stands when he is there
 A.setFollow=fn=>{A.follow=fn;A.followT=0;};
 A.stopFollow=()=>{A.follow=null;};
 A.update=(dt,ctx)=>{if(!A.visible)return;
  if(A.pin){const q=A.pin;A.x=q.x;A.z=q.z;A.a=q.a??A.a;A.mode='stand';A.path=null;}
  else if(A.follow){A.followT-=dt;const w=A.follow(A);if(w){const d=Math.hypot(w.x-A.x,w.z-A.z),far=d>(A.mode==='walk'?.25:.55);
    if(far&&A.followT<=0){A.followT=.18;const v=clamp(1.1+d*.45,1.1,w.run?3.8:2.5);A.retarget(w.x,w.z,v);}
    if(!far&&A.mode==='stand'){if(w.face!==undefined&&w.face!==null)A.turnTo=w.face;}
    A.lookAt=w.look??null;}}
  base(dt,ctx);
  face.update(dt,{clock:A.t,talk:A.talk,speech:A.speech,visible:A.person.group.visible,seed});};
 return A;}

// ---- your own body at twenty-two (first person): the same model, grown, in 2021 clothes; put back exactly when the chapter ends ----------
export function adultBody(self){const S={on:false,saved:null,adult:null,scale:1};
 function on(spec=YOU21){if(S.on)return;S.on=true;S.adult||=createPerson(spec);S.saved=new Map();S.scale=self.group.scale.x;
  for(const [k,part] of Object.entries(self.parts)){const a=S.adult.parts[k];if(!a||!part?.isMesh)continue;S.saved.set(k,{geometry:part.geometry,material:part.material});part.geometry=a.geometry;part.material=a.material;}
  self.group.scale.setScalar(spec.scale||1.15);}
 function off(){if(!S.on)return;S.on=false;for(const [k,v] of S.saved){const part=self.parts[k];if(part){part.geometry=v.geometry;part.material=v.material;}}S.saved=null;self.group.scale.setScalar(S.scale||1);}
 return {on,off,get active(){return S.on;}};}

// ---- the neighbours --------------------------------------------------------------------------------------------------------------------------
export const NEIGHBOURS={
 mower:{name:'NEIGHBOR',scale:1.18,face:{jaw:.98,cheek:.96,eyeGap:.037,eyeY:.012,browTilt:.02,nose:'broad',mouth:'flat',ears:1.02,skin:0xd2a07c,lips:0xa86a58,iris:0x3a3020},
  hair:{style:'cropped',color:0x8f8a82},build:{bulk:1.12,shoulders:1.08,head:.98,posture:0,hunch:.06},clothes:{shirt:0x6a7a58,trim:null,sleeves:'short',pants:0x7a6e58,socks:0xe8e4da,shoes:0x8a7a62,sole:0x4a4238}},
 walker:{name:'NEIGHBOR',scale:1.12,face:{jaw:.84,cheek:1,eyeGap:.036,eyeY:.013,browTilt:.12,nose:'straight',mouth:'flat',ears:.95,skin:0x8a5c40,lips:0x6a4032,iris:0x22160e},
  hair:{style:'ponytail',color:0x1a1411},build:{bulk:.94,shoulders:.94,head:.95,posture:0,hunch:.02},clothes:{shirt:0xc65a4c,trim:null,sleeves:'short',pants:0x2c3038,socks:0xe8e4da,shoes:0xe8e6e0,sole:0xcfccc4}},
 porch:{name:'SAM’S MOM',scale:1.12,face:{jaw:.84,cheek:.96,eyeGap:.034,eyeY:.015,browTilt:.14,nose:'straight',mouth:'flat',ears:.95,skin:0xc89a76,lips:0xa86a5a,iris:0x2a1c12},
  hair:{style:'ponytail',color:0x3a2c22},build:{bulk:.96,shoulders:.95,head:.95,posture:0,hunch:.04},clothes:{shirt:0x7a94a8,trim:null,sleeves:'short',pants:0x3a4252,socks:0x3a4252,shoes:0x2e2e33,sole:0x5a5a58}},
};
// a kid shooting baskets (the boy who lives in Jamie's house now has a hoop over his garage too: this one is further up)
const HOOPKID={name:'KID',scale:.92,face:{jaw:.95,cheek:1.06,eyeGap:.035,eyeY:.012,browTilt:.1,nose:'button',mouth:'smile',ears:1.04,skin:0xb98466,lips:0x8e5a4a,iris:0x2a1e16},
 hair:{style:'cropped',color:0x2a1f18},build:{bulk:.96,shoulders:.96,head:1.02,posture:0,hunch:0},clothes:{shirt:0x2c5a8a,trim:0xe8e4da,sleeves:'short',shorts:0x2a2c30,socks:0xf0ece2,shoes:0xd8d4ca,sole:0xf0eee8}};
// the two kids on bikes (built with the shared child art from the protagonist's base, as different children: their own faces' numbers,
// hair, clothes, helmets and bikes; never the four of them)
export const KIDS21={
 girl:{...CAST.player,name:'YOU',kid:'girl',face:{jaw:.86,cheek:1.04,eyeGap:.037,eyeY:.014,browTilt:.12,nose:'button',mouth:'smile',ears:.95,skin:0xe7c3a3,lips:0xc07c6a,iris:0x4a5a6a},
  hair:{style:'swept',color:0x9a6a3a},build:{bulk:.92,shoulders:.92,head:1.02,posture:-.08,hunch:0},
  clothes:{shirt:0x6b8fc9,trim:null,sleeves:'short',shorts:0x2f3542,socks:0xf0ece2,shoes:0xe8a0b4,sole:0xf6f3ea},
  bike:{style:'mtb',frame:0x2f8a8a,bars:'flat',wheelR:.3,saddle:0x2a2a2c,grips:0xe8e4da,tire:0x2b2c2e,extras:['bell']},helmet:0xe8e4da,ponytail:0x9a6a3a,
  ride:{cadence:1.02,phase:1.1,sway:1,stand:.8,weave:.9,look:1,reaction:.5}},
 boy:{...CAST.player,name:'YOU',kid:'boy',face:{jaw:.95,cheek:1.08,eyeGap:.035,eyeY:.012,browTilt:.06,nose:'broad',mouth:'grin',ears:1.05,skin:0x9a6a4c,lips:0x7a4a3a,iris:0x1e140e},
  hair:{style:'cropped',color:0x1c1410},build:{bulk:.98,shoulders:.96,head:1.03,posture:.04,hunch:0},
  clothes:{shirt:0xe8c84a,trim:null,sleeves:'short',shorts:0x3a4a2c,socks:0xf0ece2,shoes:0x2c2e33,sole:0xe8e6e0},
  bike:{style:'bmx',frame:0x222428,bars:'bmx',wheelR:.29,saddle:0x262626,grips:0x9ac43a,tire:0x2b2c2e,extras:['pegs']},helmet:0xc0392b,
  ride:{cadence:1.1,phase:3.3,sway:1.2,stand:1.3,weave:1.1,look:1.1,reaction:.4}},
};

function helmet(person,color){const head=person.parts.head,g=new THREE.Group();g.name='a2-helmet';
 const m=new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.05});m.name='a2-helmet';
 const shell=new THREE.Mesh(new THREE.SphereGeometry(1,24,14,0,Math.PI*2,0,Math.PI*.56),m);shell.scale.set(.118,.13,.135);shell.position.set(0,.04,.01);g.add(shell);
 for(let k=0;k<4;k++){const v=new THREE.Mesh(new THREE.BoxGeometry(.012,.006,.11),new THREE.MeshStandardMaterial({color:0x2a2c30,roughness:.6}));v.position.set((k-1.5)*.04,.165-.01*Math.abs(k-1.5),.0);v.rotation.x=-.2;g.add(v);}
 const strap=new THREE.Mesh(new THREE.TorusGeometry(.085,.004,4,18,Math.PI*.9),new THREE.MeshStandardMaterial({color:0x2a2c30}));strap.rotation.set(0,Math.PI/2,Math.PI*1.05);strap.position.set(0,-.02,.0);g.add(strap);
 head.add(g);return g;}
function ponytail(person,color){const g=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.11,4,8),new THREE.MeshStandardMaterial({color,roughness:.8}));g.position.set(0,-.02,.12);g.rotation.x=-.5;person.parts.head.add(g);return g;}

// A child riding a bike along a path; they can stop astride, ring the bell, look round, ride on.
export function createRider21(scene,spec,{seed=1}={}){const bike=createBike(spec.bike),person=createPerson(spec);bike.group.add(person.group);scene.add(bike.group);bike.group.visible=false;
 const face=createFace(person,spec);person.face=face;face.enable?.(true);
 helmet(person,spec.helmet);if(spec.ponytail)ponytail(person,spec.ponytail);bike.group.traverse(o=>{if(o.isMesh)o.castShadow=true;});
 const R={spec,bike,person,face,pose:newPose(),x:0,z:0,a:0,y:0,v:0,vmax:4.2,crank:spec.ride?.phase||0,wheel:0,steer:0,lean:0,astride:0,look:0,lookPitch:0,lookAt:null,path:null,u:0,stopAt:null,then:null,visible:false,t:0,talk:0,speech:null,
  show(on=true){R.visible=on;bike.group.visible=on;},
  ride(pts,{v=4.2,then=null,stopAt=null}={}){R.path=worldPath([[R.x,R.z],...pts]);R.u=0;R.vmax=v;R.then=then;R.stopAt=stopAt;},
  place(x,z,a){R.x=x;R.z=z;R.a=a;R.path=null;}};
 R.update=(dt,{groundY,eye,clock=0}={})=>{if(!R.visible)return;R.t+=dt;const G=bike.geom;
  if(R.path){const remain=R.path.length-R.u,want=R.stopAt===false?R.vmax:Math.min(R.vmax,Math.sqrt(2*1.4*Math.max(0,remain))+.1);R.v=damp(R.v,want,want<R.v?2.6:1.2,dt);
   const q=R.path.at(R.u+Math.min(1.6,remain)),turn=remain>.08?wrap(q.a-R.a):0;R.a+=clamp(turn,-2.2*dt,2.2*dt);R.u+=R.v*dt;const at=R.path.at(R.u);R.x=at.x;R.z=at.z;
   R.steer=damp(R.steer,clamp(turn*.8,-.45,.45),5,dt);if(remain<.05){R.path=null;R.v=0;const f=R.then;R.then=null;f?.(R);}}
  else R.v=damp(R.v,0,3,dt);
  R.lean=damp(R.lean,R.v>.6?clamp(-R.steer*R.v*.12,-.22,.22):0,4,dt);R.astride=damp(R.astride,R.v<.25?1:0,R.v<.25?2.5:6,dt);
  if(R.v>.15)R.crank+=R.v*dt*1.3*(spec.ride?.cadence||1);R.wheel+=R.v*dt/G.wheelR;
  if(R.lookAt){const want=clamp(-wrap(headingTo(R.x,R.z,R.lookAt.x,R.lookAt.z)-R.a),-1.1,1.1);R.look=damp(R.look,want,3,dt);}else R.look=damp(R.look,0,2,dt);
  ridePose(R.pose,R.crank,{astride:R.astride,steer:R.steer,look:R.look,lookPitch:R.lookPitch,geom:G,posture:spec.build?.posture||0,stopSide:1});
  applyPose(person,R.pose);bike.wheel=R.wheel;bike.crankAngle=R.crank;bike.steerAngle=R.steer;bike.kickstand=0;poseBike(bike);
  R.y=groundY?groundY(R.x,R.z):0;bike.group.position.set(R.x,R.y,R.z);bike.group.rotation.set(0,-R.a,R.lean+R.astride*.06,'YXZ');
  if(R.talk>0)R.talk-=dt;face.update(dt,{clock:R.t+seed,talk:R.talk,speech:R.speech,visible:R.visible,seed});};
 return R;}

// a dog on a lead: body, head, ears, legs that trot, a tail that goes
export function createDog(scene,{color=0x8a6a42,scale=1}={}){const g=new THREE.Group();g.name='a2-dog';scene.add(g);g.visible=false;
 const m=new THREE.MeshStandardMaterial({color,roughness:.95}),dark=new THREE.MeshStandardMaterial({color:tint(color,.55),roughness:.95}),nose=new THREE.MeshStandardMaterial({color:0x1a1716,roughness:.4});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.34,6,12),m);body.rotation.x=Math.PI/2;body.position.set(0,.42,0);g.add(body);
 const chest=new THREE.Mesh(new THREE.SphereGeometry(.15,12,10),m);chest.position.set(0,.45,-.2);g.add(chest);
 const neck=new THREE.Group();neck.position.set(0,.55,-.28);g.add(neck);const head=new THREE.Mesh(new THREE.SphereGeometry(.1,12,10),m);head.scale.set(1,.95,1.15);head.position.set(0,.1,-.06);neck.add(head);
 const snout=new THREE.Mesh(new THREE.CapsuleGeometry(.045,.08,4,8),m);snout.rotation.x=Math.PI/2;snout.position.set(0,.07,-.17);neck.add(snout);const nb=new THREE.Mesh(new THREE.SphereGeometry(.024,8,6),nose);nb.position.set(0,.085,-.225);neck.add(nb);
 for(const s of [-1,1]){const ear=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),dark);ear.scale.set(.5,1.1,.9);ear.position.set(s*.075,.13,-.02);ear.rotation.z=s*.4;neck.add(ear);}
 const legs=[];for(const [x,z] of [[-.08,-.2],[.08,-.2],[-.08,.2],[.08,.2]]){const L=new THREE.Group();L.position.set(x,.38,z);g.add(L);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.035,.26,4,8),m);leg.position.y=-.19;L.add(leg);legs.push(L);}
 const tail=new THREE.Group();tail.position.set(0,.5,.25);g.add(tail);const tm=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.2,4,6),m);tm.position.set(0,.1,.04);tm.rotation.x=-.5;tail.add(tm);
 g.scale.setScalar(scale);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
 const D={g,x:0,z:0,a:0,v:0,ph:0,t:0,sniff:0,visible:false,show(on=true){D.visible=on;g.visible=on;},
  update(dt,{x,z,a,v,groundY}){D.t+=dt;D.x=x;D.z=z;D.a=a;D.v=v;D.ph+=v*dt*5.2;const trot=Math.min(1,v/.6);
   legs.forEach((L,i)=>{L.rotation.x=Math.sin(D.ph+(i===0||i===3?0:Math.PI))*.55*trot;});tail.rotation.z=Math.sin(D.t*9)*.5;tail.rotation.x=-.2;neck.rotation.x=v<.1?.35+Math.sin(D.t*1.3)*.1:.05;
   g.position.set(x,(groundY?groundY(x,z):0)+Math.abs(Math.sin(D.ph))*.012*trot,z);g.rotation.y=-a;}};
 return D;}

// a mower (deck, handle, wheels) for the man two doors up
export function createMower(scene){const g=new THREE.Group();g.name='a2-mower';const red=new THREE.MeshStandardMaterial({color:0xa8362c,roughness:.55,metalness:.2}),black=new THREE.MeshStandardMaterial({color:0x202224,roughness:.7}),steel=new THREE.MeshStandardMaterial({color:0x8a8e90,roughness:.4,metalness:.6});
 const deck=new THREE.Mesh(new THREE.CylinderGeometry(.27,.29,.12,16),red);deck.position.set(0,.16,0);g.add(deck);const eng=new THREE.Mesh(new THREE.BoxGeometry(.2,.16,.2),black);eng.position.set(0,.3,-.02);g.add(eng);
 for(const [x,z] of [[-.25,-.22],[.25,-.22],[-.25,.22],[.25,.22]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.05,12),black);w.rotation.z=Math.PI/2;w.position.set(x,.08,z);g.add(w);}
 for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.95,6),steel);h.position.set(s*.2,.5,.48);h.rotation.x=-.85;g.add(h);}
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.44,6),black);bar.rotation.z=Math.PI/2;bar.position.set(0,.84,.79);g.add(bar);const bag=new THREE.Mesh(new THREE.BoxGeometry(.34,.24,.32),new THREE.MeshStandardMaterial({color:0x3a4a3a,roughness:1}));bag.position.set(0,.28,.36);g.add(bag);
 g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);g.visible=false;return g;}

export function createNeighbours21(scene,nav){
 const mower=createActor(scene,nav,NEIGHBOURS.mower,{seed:301}),walker=createActor(scene,nav,NEIGHBOURS.walker,{seed:302}),samMom=createActor(scene,nav,NEIGHBOURS.porch,{seed:303});
 const kid=createActor(scene,nav,HOOPKID,{seed:304});
 const dog=createDog(scene,{color:0x9a7a4a,scale:.95}),mw=createMower(scene);
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10),new THREE.MeshStandardMaterial({color:0xc4622a,roughness:.7}));ball.name='a2-ball';ball.castShadow=true;scene.add(ball);ball.visible=false;
 const lead=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0x2a2a2c}));lead.frustumCulled=false;scene.add(lead);lead.visible=false;
 return {mower,walker,samMom,kid,dog,mw,ball,lead,all:[mower,walker,samMom,kid]};}
