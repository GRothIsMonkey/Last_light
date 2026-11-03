// Chapter Seven: the people only this chapter has.
//
//  The family at the table in Old Mill Court (father, mother, a girl, a boy), dressed the way people dressed in the
//  sixties, sitting at their dinner with the television on. They do not move: no breath, no blink. Then, one by one, they
//  turn their heads to the window. Then the father gets up and comes at the glass, and hits it, and stays against it with
//  his mouth open, and then goes back and sits down again with his head still turned to you. They are rig.js people with
//  faces (faces.js) like everyone else in the game: what is wrong with them is what they do.
//  Jamie's mom, that night (an actor like the others).
//  The studio: the four friends and their bikes, used once to render the photograph of them at the oak from the world
//  itself (and once more with only you in it).
import * as THREE from './three.module.js';
import {createActor,ADULTS} from './people.js';
import {createPerson,createBike,newPose,standPose,sitPose,applyPose,copyPose,blendPose,P as PI} from './rig.js';
import {createFace} from './faces.js';
import {CAST} from './cast.js';
import {clamp,damp,smooth} from './chapter6-kit.js';

const FAMILY={
 father:{name:'FATHER',scale:1.2,face:{jaw:.97,cheek:.95,eyeGap:.037,eyeY:.012,browTilt:-.04,nose:'straight',mouth:'flat',ears:1,skin:0xd8b496,lips:0xa8705c,iris:0x2a2620},
  hair:{style:'cropped',color:0x2a221a},build:{bulk:1.04,shoulders:1.06,head:.98,posture:.06,hunch:0},clothes:{shirt:0xeeeae0,trim:0xeeeae0,collar:true,sleeves:'short',pants:0x3a3a42,socks:0x2a2a2a,shoes:0x1a1a1a,sole:0x1a1a1a}},
 mother:{name:'MOTHER',scale:1.13,face:{jaw:.84,cheek:.97,eyeGap:.036,eyeY:.013,browTilt:.12,nose:'button',mouth:'smile',ears:.95,skin:0xe6c2a4,lips:0xb4605a,iris:0x3a4a5a},
  hair:{style:'ponytail',color:0x8a6a3a},build:{bulk:.94,shoulders:.95,head:.95,posture:.04,hunch:0},clothes:{shirt:0x7aa0a8,trim:0xe8e0d0,collar:true,sleeves:'short',pants:0x7aa0a8,socks:0xe6c2a4,shoes:0x3a2a2a,sole:0x2a2020}},
 girl:{name:'GIRL',scale:.92,face:{jaw:.86,cheek:1.04,eyeGap:.035,eyeY:.012,browTilt:.1,nose:'button',mouth:'flat',ears:.95,skin:0xe8c8aa,lips:0xc07468,iris:0x3a5a7a},
  hair:{style:'ponytail',color:0x9a7a4a},build:{bulk:.9,shoulders:.92,head:1.04,posture:0,hunch:0},clothes:{shirt:0xd8a0a8,trim:0xf0e8e0,collar:true,sleeves:'short',shorts:0x5a6a8a,socks:0xf0ece2,shoes:0x3a2a2a,sole:0x2a2020}},
 boy:{name:'BOY',scale:.95,face:{jaw:.92,cheek:1.04,eyeGap:.035,eyeY:.012,browTilt:.06,nose:'button',mouth:'flat',ears:1.04,skin:0xdcb090,lips:0xb07060,iris:0x3a2a1c},
  hair:{style:'cropped',color:0x4a3220},build:{bulk:.96,shoulders:.96,head:1.03,posture:0,hunch:0},clothes:{shirt:0xc8c0a0,trim:0x8a3a2a,sleeves:'short',shorts:0x6a5a40,socks:0xf0ece2,shoes:0x3a2a1a,sole:0x2a2018}},
};
export const JAMIE_MOM={...ADULTS.mom,name:'JAMIE’S MOM',hair:{...ADULTS.mom.hair,color:0x5a3a22,style:'ponytail'},face:{...ADULTS.mom.face,skin:0xd6a57f,iris:0x3a2a1c,browTilt:.2},clothes:{...ADULTS.mom.clothes,shirt:0x8a5a7a,pants:0x2e3442}};

export function createCast7({scene,nav}){
 // ---- the family -------------------------------------------------------------------------------------------------------
 const fam={};for(const [k,spec] of Object.entries(FAMILY)){const p=createPerson({...spec,expressive:true});p.group.visible=false;p.group.name='c7-family-'+k;scene.add(p.group);
  const f=createFace(p,spec);p.face=f;f.update(1/30,{clock:0});p.group.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  fam[k]={key:k,person:p,spec,face:f,pose:newPose(),tmp:newPose(),head:0,want:0,turnAt:-1,seat:null,stand:0,x:0,z:0,y:0,a:0,s:spec.scale};}
 const D={on:false,t:0,stage:'still',lunge:null,frame:null,toWorld:null,heading:null};
 // seat a person (the dining room's seat, in its frame; toWorld maps (x,z,y) to the world; heading a frame heading to the world)
 function seatAll(seats,{toWorld,heading,floorY}){D.toWorld=toWorld;D.heading=heading;D.floorY=floorY;
  for(const s of seats){const m=fam[s.id];if(!m)continue;m.seat=s;const w=toWorld(s.x,s.z);m.x=w.x;m.z=w.z;m.y=floorY;m.a=heading(s.a);m.stand=0;m.head=0;m.want=0;m.turnAt=-1;}}
 function show(on){D.on=on;for(const m of Object.values(fam))m.person.group.visible=on;if(!on){D.stage='still';D.lunge=null;}}
 // the turn: each head round to a point (the window: you), one after another (order, seconds apart)
 function turnHeads(target,order=['mother','girl','boy','father'],gap=.9){D.target=target;order.forEach((k,i)=>{fam[k].turnAt=D.t+i*gap;});D.stage='turning';}
 // the lunge: the father up, two strides to the glass (glass: a world point on it, normal: the way out of the room), the hit, held, back
 function lunge(glass,normal,{onHit=null}={}){const m=fam.father;D.lunge={t:0,glass,normal,onHit,hit:false,from:{x:m.x,z:m.z,a:m.a}};D.stage='lunge';}
 function headTo(m,target0){const target=typeof target0==='function'?target0():target0;const dx=target.x-m.x,dz=target.z-m.z;let a=Math.atan2(dx,-dz)-m.a;a=Math.atan2(Math.sin(a),Math.cos(a));return clamp(-a,-1.55,1.55);}
 function update(dt,{eye=null}={}){if(!D.on)return;D.t+=dt;
  for(const m of Object.values(fam)){const p=m.pose;
   // seated and still: no breath, no sway (the wrongness); the head where it was put
   if(m.turnAt>=0&&D.t>=m.turnAt&&D.target)m.want=headTo(m,D.target);
   m.head=damp(m.head,m.want,m.key==='father'&&D.stage==='lunge'?9:2.6,dt);
   if(m.key==='father'&&D.lunge)continue;
   sitPose(p,{seat:.45/m.s,legs:'bent',t:0,look:0,hands:'knees'});p[PI.hy]=m.head;p[PI.hp]=-.05;
   // hands on the table edge, not the knees: they were eating
   for(const [o,s] of [[PI.lh,-1],[PI.rh,1]]){p[o]=s*.18;p[o+1]=.62/m.s+.14;p[o+2]=-.3;}
   m.person.group.position.set(m.x,m.y,m.z);m.person.group.rotation.set(0,-m.a,0);applyPose(m.person,p);m.face.update(dt,{clock:D.t,look:null});}
  const L=D.lunge;if(L){const m=fam.father,p=m.pose;L.t+=dt;const t=L.t;
   // 0-.25 s up; .25-.62 two strides to the glass; .62 the hit; held to 3.1; then slowly back to the chair by 5.4, and sit
   const gx=L.glass.x-L.normal.x*.32,gz=L.glass.z-L.normal.z*.32,toGlass=Math.atan2(L.normal.x,-L.normal.z);
   const up=smooth(t/.25),go=smooth((t-.22)/.4),back=smooth((t-3.1)/2.0),sit=smooth((t-5.0)/.6);
   const x=L.from.x+(gx-L.from.x)*go*(1-back),z=L.from.z+(gz-L.from.z)*go*(1-back);
   m.a=L.from.a+Math.atan2(Math.sin(toGlass-L.from.a),Math.cos(toGlass-L.from.a))*Math.min(1,up*1.4)*(1-sit);m.x=x;m.z=z;
   standPose(m.tmp,0,{});sitPose(p,{seat:.45/m.s,legs:'bent',hands:'knees'});blendPose(p,p,m.tmp,up*(1-sit));
   // arms: up and at the glass, palms flat, spread; the face against it
   const reach=go*(1-back*1.2);if(reach>0){for(const [o,s,e] of [[PI.lh,-1,PI.le],[PI.rh,1,PI.re]]){p[o]+=(s*.32-p[o])*reach;p[o+1]+=(1.36-p[o+1])*reach;p[o+2]+=(-.42-p[o+2])*reach;p[e]=s*.9;p[e+1]=.2;p[e+2]=.6;}p[PI.lean]+=.32*reach;p[PI.hp]=.15*reach;}
   p[PI.hy]=m.head*(1-reach);if(t>.62&&!L.hit){L.hit=true;m.face.set('shocked',{hold:3.2});L.onHit?.();}
   if(t>.62&&t<3.1){p[PI.root]+=Math.sin(t*41)*.004*(1-smooth((t-.7)/.4));}
   if(t>3.1)m.want=headTo(m,D.target||eye||{x:m.x,z:m.z-1});
   m.person.group.position.set(m.x,m.y,m.z);m.person.group.rotation.set(0,-m.a,0);applyPose(m.person,p);m.face.update(dt,{clock:D.t});
   if(t>5.6){m.x=L.from.x;m.z=L.from.z;m.a=L.from.a;D.lunge=null;D.stage='after';}}}
 function reset(){show(false);D.t=0;D.target=null;for(const m of Object.values(fam)){m.head=0;m.want=0;m.turnAt=-1;m.face.set?.('neutral',{hold:0});}}
 // ---- Jamie's mom ----------------------------------------------------------------------------------------------------------
 const jamieMom=createActor(scene,nav,JAMIE_MOM,{seed:91});
 // ---- the studio: the four of them and their bikes (for the photograph) ----------------------------------------------------
 const studio={};for(const k of ['player','jamie','sam','alex']){const p=createPerson({...CAST[k],expressive:true});p.group.visible=false;p.group.name='c7-studio-'+k;scene.add(p.group);
  const f=createFace(p,CAST[k]);p.face=f;f.update(1/30,{clock:0});const b=createBike(CAST[k].bike);b.group.visible=false;b.group.name='c7-studio-bike-'+k;scene.add(b.group);studio[k]={person:p,bike:b,pose:newPose()};}
 return {fam,D,seatAll,show,turnHeads,lunge,update,reset,jamieMom,studio,actors:[jamieMom]};
}
