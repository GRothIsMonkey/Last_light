// Chapter Eight: how the boys (and Reyes) hold themselves when it matters. Each is a gesture: (pose, ctx) => void, drawn over a
// companion's pose by its current step (companions.js: toward/idle draw q.gesture over the plain pose every frame, so a gesture
// is never kept in the pose). Poses are person-local: ground at y 0, forward is -z, +x the right hand. A factory that needs to
// know where its person is in the world (to reach for something) takes the companion. Everything here is pure arithmetic on
// the pose array: nothing is allocated while it runs.
//
//  floor      sitting on the floor, back against something, knees up (arms round them, or hands in the lap)
//  seat       on a chair or a bench of a given height
//  kneel      down on one knee (at a door slot, beside someone)
//  hide       crouched low behind something, hands on the floor
//  mouth      a hand pressed over his own mouth (fighting to stay quiet), over whatever else he is doing
//  hug        arms wrapped round himself
//  slump      exhausted: shoulders down, head down, knees soft
//  cower      arms up over his head
//  overhead   both hands up holding something over him (a beam, a door)
//  heave      both hands low on something heavy, leaning back to lift it
//  reach      one hand out to a point in the world (a shoulder, a hand, a lever)
//  limp       a leg that will not take weight, drawn over walking
//  crawl      on hands and knees (a duct, under a door), moving
//  propped    half lying back against a trunk, legs out, one hand on his stomach (Alex at the oak)
//  still      lying on his back on the ground, not moving (Jamie)
import {P,BODY} from './rig.js';
import {Vector3} from './three.module.js';
const set3=(p,o,x,y,z)=>{p[o]=x;p[o+1]=y;p[o+2]=z;};
const mix3=(p,o,x,y,z,w)=>{p[o]+=(x-p[o])*w;p[o+1]+=(y-p[o+1])*w;p[o+2]+=(z-p[o+2])*w;};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const T=ctx=>ctx?.clock??0;
// the world point (x,y,z) in the companion c's own frame
function local(c,x,y,z,out){const a=c.pa,dx=x-c.px,dz=z-c.pz,fx=Math.sin(a),fz=-Math.cos(a),rx=Math.cos(a),rz=Math.sin(a),s=c.person?.group?.scale?.x||1,gy=c.person?.group?.position?.y||0;
 out.x=(dx*rx+dz*rz)/s;out.y=(y-gy)/s;out.z=-(dx*fx+dz*fz)/s;return out;}
const _l={x:0,y:0,z:0},_contact=new Vector3();
export const ACT={
 floor({lean=-.12,arms='knees',look=0,lookPitch=-.1,shiver=0}={}){return (p,ctx)=>{const t=T(ctx),br=Math.sin(t*1.7)*.004;
  set3(p,P.root,0,.11+br,.04);p[P.lean]=lean+Math.sin(t*1.7)*.01;p[P.yaw]=0;p[P.twist]=0;p[P.roll]=0;p[P.hy]=look;p[P.hp]=lookPitch;
  set3(p,P.lf,-.13,BODY.ankle,-.42);set3(p,P.rf,.13,BODY.ankle,-.4);p[P.lfp]=.15;p[P.rfp]=.15;set3(p,P.lk,-.05,1,-.35);set3(p,P.rk,.05,1,-.35);
  const sh=shiver?Math.sin(t*23)*.004*shiver:0;
  if(arms==='knees'){set3(p,P.lh,-.08+sh,.42,-.36);set3(p,P.rh,.08-sh,.41,-.35);set3(p,P.le,-1,0,.3);set3(p,P.re,1,0,.3);}
  else if(arms==='lap'){set3(p,P.lh,-.12,.2,-.22);set3(p,P.rh,.12,.2,-.2);set3(p,P.le,-1,-.3,.4);set3(p,P.re,1,-.3,.4);}
  else{set3(p,P.lh,-.3,.05,.05);set3(p,P.rh,.3,.05,.06);set3(p,P.le,-1,0,.5);set3(p,P.re,1,0,.5);}};},
 seat(h=.45,{hands='knees',look=0,lookPitch=0,lean=.1}={}){return (p,ctx)=>{const t=T(ctx);set3(p,P.root,0,h+.07+Math.sin(t*1.9)*.003,.06);p[P.lean]=lean;p[P.yaw]=0;p[P.twist]=0;p[P.roll]=0;p[P.hy]=look;p[P.hp]=lookPitch;
  set3(p,P.lf,-.12,BODY.ankle,-.44);set3(p,P.rf,.13,BODY.ankle,-.41);p[P.lfp]=0;p[P.rfp]=0;set3(p,P.lk,-.1,1,-.3);set3(p,P.rk,.1,1,-.3);
  if(hands==='table'){set3(p,P.lh,-.16,h+.36,-.42);set3(p,P.rh,.16,h+.36,-.4);}else if(hands==='face'){set3(p,P.lh,-.05,h+.58,-.2);set3(p,P.rh,.05,h+.58,-.19);p[P.lean]=.4;p[P.hp]=-.4;}
  else{set3(p,P.lh,-.14,h+.12,-.3);set3(p,P.rh,.14,h+.12,-.28);}set3(p,P.le,-1,-.2,.2);set3(p,P.re,1,-.2,.2);};},
 kneel({side=1,lookPitch=-.2,look=0,hands='knee'}={}){return (p,ctx)=>{const t=T(ctx),s=side;set3(p,P.root,0,.47+Math.sin(t*1.8)*.003,.02);p[P.lean]=.12;p[P.yaw]=0;p[P.twist]=0;p[P.roll]=0;p[P.hy]=look;p[P.hp]=lookPitch;
  // (the down knee: foot behind, knee on the ground under the hip; the up knee: foot planted ahead)
  const dn=s>0?P.rf:P.lf,up=s>0?P.lf:P.rf,dk=s>0?P.rk:P.lk,uk=s>0?P.lk:P.rk;set3(p,dn,s*.11,.07,.36);set3(p,dk,0,-1,-.3);set3(p,up,-s*.12,BODY.ankle,-.4);set3(p,uk,0,.4,-1);p[P.lfp]=s>0?0:.5;p[P.rfp]=s>0?.5:0;
  if(hands==='knee'){set3(p,s>0?P.lh:P.rh,-s*.12,.5,-.36);set3(p,s>0?P.rh:P.lh,s*.2,.35,-.08);}else{set3(p,P.lh,-.12,.3,-.25);set3(p,P.rh,.12,.3,-.25);}set3(p,P.le,-1,-.2,.2);set3(p,P.re,1,-.2,.2);};},
 hide({low=.5,look=0,lookPitch=.05}={}){return (p,ctx)=>{const t=T(ctx);set3(p,P.root,0,low+Math.sin(t*2.4)*.004,.04);p[P.lean]=.55;p[P.yaw]=0;p[P.twist]=0;p[P.roll]=0;p[P.hy]=look;p[P.hp]=lookPitch+.35;
  set3(p,P.lf,-.17,BODY.ankle,-.06);set3(p,P.rf,.17,BODY.ankle,-.02);p[P.lfp]=-.3;p[P.rfp]=-.3;set3(p,P.lk,-.4,0,-1);set3(p,P.rk,.4,0,-1);
  set3(p,P.lh,-.14,.05,-.38);set3(p,P.rh,.15,.05,-.36);set3(p,P.le,-1,.3,.2);set3(p,P.re,1,.3,.2);};},
 mouth(base=null,{hand='r',w=1}={}){return (p,ctx)=>{base?.(p,ctx);const hy=p[P.root+1]+.57,o=hand==='r'?P.rh:P.lh,e=hand==='r'?P.re:P.le;mix3(p,o,hand==='r'?.03:-.03,hy,p[P.root+2]-.13-p[P.lean]*.3,w);mix3(p,e,hand==='r'?1:-1,-.6,.4,w);p[P.hp]+=.12*w;};},
 hug(base=null){return (p,ctx)=>{base?.(p,ctx);const y=p[P.root+1]+.3;mix3(p,P.lh,.11,y,-.12,1);mix3(p,P.rh,-.11,y-.03,-.1,1);set3(p,P.le,-1,-.4,.2);set3(p,P.re,1,-.4,.2);p[P.hp]-=.15;};},
 slump(base=null){return (p,ctx)=>{base?.(p,ctx);p[P.root+1]-=.035;p[P.lean]+=.16;p[P.hp]-=.35;p[P.lh+1]-=.04;p[P.rh+1]-=.04;p[P.lh+2]-=.02;p[P.rh+2]-=.02;};},
 cower(base=null){return (p,ctx)=>{base?.(p,ctx);const y=p[P.root+1]+.72;set3(p,P.lh,-.1,y,-.1);set3(p,P.rh,.1,y,-.09);set3(p,P.le,-1,.6,0);set3(p,P.re,1,.6,0);p[P.hp]-=.45;p[P.lean]+=.2;};},
 overhead({shake=0,lean=.05}={}){return (p,ctx)=>{const t=T(ctx),s=Math.sin(t*19)*.008*shake;set3(p,P.root,0,BODY.stand-.07+s,.0);p[P.lean]=lean;p[P.hp]=.45;p[P.hy]=0;
  set3(p,P.lf,-.17,BODY.ankle,.05);set3(p,P.rf,.16,BODY.ankle,-.18);p[P.lfp]=0;p[P.rfp]=0;set3(p,P.lk,-.2,0,-1);set3(p,P.rk,.2,0,-1);
  set3(p,P.lh,-.22+s,BODY.stand+.86,-.12);set3(p,P.rh,.22-s,BODY.stand+.86,-.12);set3(p,P.le,-1,-.2,.3);set3(p,P.re,1,-.2,.3);};},
 heave({strain=0}={}){return (p,ctx)=>{const t=T(ctx),s=Math.sin(t*17)*.006*strain;set3(p,P.root,0,.55+s,.12);p[P.lean]=.42;p[P.hp]=.25;set3(p,P.lf,-.2,BODY.ankle,-.08);set3(p,P.rf,.2,BODY.ankle,.02);set3(p,P.lk,-.3,0,-1);set3(p,P.rk,.3,0,-1);
  set3(p,P.lh,-.2,.42+s,-.42);set3(p,P.rh,.2,.42-s,-.42);set3(p,P.le,-1,-.2,.2);set3(p,P.re,1,-.2,.2);};},
 reach(c,get,{hand='r',w=1,base=null}={}){return (p,ctx)=>{base?.(p,ctx);const q=get();if(!q)return;local(c,q.x,q.y,q.z,_l);const o=hand==='r'?P.rh:P.lh,sx=hand==='r'?BODY.shoulder:-BODY.shoulder,sy=p[P.root+1]+BODY.torso-.05;
  let dx=_l.x-sx,dy=_l.y-sy,dz=_l.z,d=Math.hypot(dx,dy,dz);const mx=BODY.upper+BODY.fore-.02;if(d>mx){dx*=mx/d;dy*=mx/d;dz*=mx/d;}mix3(p,o,sx+dx,sy+dy,dz,w);mix3(p,hand==='r'?P.re:P.le,hand==='r'?1:-1,-.5,.3,w);};},
 limp(c,{side=1,k=1}={}){return (p,ctx)=>{const ph=(c.gait||0)%1,stance=side>0?(ph<.5?1:0):(ph>=.5?1:0),u=Math.sin(ph*Math.PI*2);
  p[P.root+1]-=.035*k*Math.max(0,side>0?u:-u);p[P.roll]+=.07*k*side*Math.max(0,side>0?u:-u);p[P.lean]+=.06*k;
  const f=side>0?P.rf:P.lf;p[f+1]=Math.min(p[f+1],BODY.ankle+.04);p[f+2]*=.7;void stance;};},
 crawl({phase=null,speed=0}={}){return (p,ctx)=>{const t=T(ctx),ph=phase?phase():t*speed,a=Math.sin(ph*Math.PI*2),b=Math.cos(ph*Math.PI*2);
  set3(p,P.root,0,.4+Math.abs(b)*.015,.1);p[P.lean]=1.25;p[P.yaw]=0;p[P.twist]=a*.06;p[P.roll]=0;p[P.hp]=1.0;p[P.hy]=0;
  set3(p,P.lf,-.12,.05,.48+a*.06);set3(p,P.rf,.12,.05,.48-a*.06);p[P.lfp]=1.3;p[P.rfp]=1.3;set3(p,P.lk,0,-1,-.4);set3(p,P.rk,0,-1,-.4);
  set3(p,P.lh,-.16,.03+Math.max(0,-a)*.06,-.52+a*.08);set3(p,P.rh,.16,.03+Math.max(0,a)*.06,-.52-a*.08);set3(p,P.le,-1,.2,0);set3(p,P.re,1,.2,0);};},
 propped({lean=-.62,breath=1,head=.25}={}){return (p,ctx)=>{const t=T(ctx),br=breath*(.006*Math.sin(t*1.1)+.003*Math.sin(t*2.9));set3(p,P.root,0,.12,.1);p[P.lean]=lean+br*2;p[P.yaw]=0;p[P.twist]=0;p[P.roll]=.05;p[P.hy]=head*.6;p[P.hp]=.05;
  set3(p,P.lf,-.17,.07,-.78);set3(p,P.rf,.2,.08,-.74);p[P.lfp]=.9;p[P.rfp]=.9;set3(p,P.lk,-.1,1,-.1);set3(p,P.rk,.1,1,-.1);
  set3(p,P.rh,.04,.3+br,-.16);set3(p,P.re,1,-.5,.3);set3(p,P.lh,-.3,.04,-.12);set3(p,P.le,-1,0,.4);};},
 still({look=.6}={}){return (p)=>{set3(p,P.root,0,.1,.0);p[P.lean]=-1.5;p[P.yaw]=0;p[P.twist]=.04;p[P.roll]=.08;p[P.hy]=look;p[P.hp]=.1;
  set3(p,P.lf,-.13,.06,-.8);set3(p,P.rf,.16,.06,-.76);p[P.lfp]=1.2;p[P.rfp]=1.1;set3(p,P.lk,0,1,0);set3(p,P.rk,0,1,0);
  set3(p,P.lh,-.32,.05,.18);set3(p,P.rh,.3,.05,.3);set3(p,P.le,-1,0,0);set3(p,P.re,1,0,0);};},
 // ---- grief ----------------------------------------------------------------------------------------------------------------------
 // crying with the whole body: the shoulders lift with each catch of breath (the face's own sob pulse), the head goes down,
 // the hands to the face (or wrapped round himself, or hanging)
 sob(c,{base=null,hands='face',k=1}={}){return (p,ctx)=>{base?.(p,ctx);const pu=(c?.person?.face?.pulse||0)*k,t=T(ctx);p[P.root+1]+=pu*.02-.018*k;p[P.lean]+=(.1+pu*.07)*k;p[P.hp]-=(.3-pu*.1)*k;p[P.roll]+=(Math.sin(t*1.3)*.014+Math.sin(t*2.7+1)*.006)*k;p[P.hp]+=(Math.sin(t*19)*.003+Math.sin(t*31)*.002)*k;
   if(hands==='face'){const hy=p[P.root+1]+.55+pu*.015,hz=p[P.root+2]-.12-p[P.lean]*.32;mix3(p,P.lh,-.045,hy,hz,k);mix3(p,P.rh,.045,hy-.008,hz,k);mix3(p,P.le,-1,-.7,.25,k);mix3(p,P.re,1,-.7,.25,k);}
   else if(hands==='arms'){const y=p[P.root+1]+.3+pu*.02;mix3(p,P.lh,.11,y,-.12,k);mix3(p,P.rh,-.11,y-.03,-.1,k);}
   else{p[P.lh+1]-=.03*k;p[P.rh+1]-=.03*k;}};},
 // holding on to someone: both hands round to their back, leaning in, head beside theirs (drawn from this one's side)
 embrace(c,other,{k=1,base=null}={}){return (p,ctx)=>{base?.(p,ctx);if(!other?.person)return;const s=other.person.group.scale?.x||1,gy=other.person.group.position.y,oa=other.pa??0,bx=-Math.sin(oa),bz=Math.cos(oa),rx=Math.cos(oa),rz=Math.sin(oa),y=gy+1.12*s;
   for(const [o,e,sd] of [[P.lh,P.le,-1],[P.rh,P.re,1]]){other.person.parts.torso.updateWorldMatrix(true,false);_contact.set(sd*.13,.12,.065).applyMatrix4(other.person.parts.torso.matrixWorld);local(c,_contact.x,_contact.y,_contact.z,_l);mix3(p,o,_l.x,_l.y,_l.z,k);mix3(p,e,sd,.1,.5,k);}
   p[P.lean]+=.14*k;p[P.hp]-=.12*k;p[P.hy]+=.25*k;};},
 // down on his knees beside someone lying on the ground, both hands on him
 kneelOver(c,get,{k=1,rock=0}={}){return (p,ctx)=>{const t=T(ctx);set3(p,P.root,0,.42+Math.sin(t*1.6)*.006*rock,.04);p[P.lean]=.45+Math.sin(t*1.3)*.06*rock;p[P.yaw]=0;p[P.twist]=0;p[P.roll]=0;p[P.hp]=-.55;p[P.hy]=0;
   set3(p,P.lf,-.13,.07,.36);set3(p,P.rf,.13,.07,.36);p[P.lfp]=1.2;p[P.rfp]=1.2;set3(p,P.lk,0,-1,-.4);set3(p,P.rk,0,-1,-.4);
   const q=get?.();if(q){for(const [o,e,sd] of [[P.lh,P.le,-1],[P.rh,P.re,1]]){local(c,q.x+(sd*.12),q.y,q.z,_l);mix3(p,o,_l.x,_l.y,_l.z,k);mix3(p,e,sd,-.3,.3,k);}}
   else{set3(p,P.lh,-.15,.12,-.35);set3(p,P.rh,.15,.12,-.35);}};},
 // shaking: small, fast, irregular, over whatever else
 shake(base=null,{k=1}={}){return (p,ctx)=>{base?.(p,ctx);const t=T(ctx),a=Math.sin(t*41)*.5+Math.sin(t*67+1)*.3+Math.sin(t*23+2)*.2;p[P.root]+=a*.004*k;p[P.lh+1]+=a*.006*k;p[P.rh+1]-=a*.006*k;p[P.lh]+=Math.sin(t*53)*.004*k;p[P.rh]+=Math.sin(t*59)*.004*k;p[P.hp]+=a*.01*k;};},
 // sitting with his head in his hands; rocking a little if asked
 headInHands({seatH=0,rock=0}={}){return (p,ctx)=>{const t=T(ctx);if(seatH>0)ACT.seat(seatH)(p,ctx);else ACT.floor({arms:'knees'})(p,ctx);const r=Math.sin(t*1.2)*.07*rock;p[P.lean]+=.42+r;p[P.hp]=-.5;
   const hy=p[P.root+1]+.47,hz=p[P.root+2]-.22;set3(p,P.lh,-.06,hy,hz);set3(p,P.rh,.06,hy-.01,hz);set3(p,P.le,-1,-.8,.3);set3(p,P.re,1,-.8,.3);};},
 // a hand on someone's shoulder (comfort), over whatever else
 shoulder(c,other,{hand='r',k=1,base=null}={}){return (p,ctx)=>{base?.(p,ctx);if(!other?.person)return;const s=other.person.group.scale?.x||1,gy=other.person.group.position.y,oa=other.pa??0,rx=Math.cos(oa),rz=Math.sin(oa),sd=hand==='r'?-1:1;
   local(c,other.px+rx*sd*.16,gy+1.18*s,other.pz+rz*sd*.16,_l);const o=hand==='r'?P.rh:P.lh;mix3(p,o,_l.x,_l.y,_l.z,k);mix3(p,hand==='r'?P.re:P.le,hand==='r'?1:-1,-.4,.3,k);};},
 // (a run of these, one after another: [[seconds, gesture], ...], holding the last)
 seq(list){let start=null;return (p,ctx)=>{const t=T(ctx);if(start===null)start=t;let e=t-start;for(const [d,g] of list){if(e<d||list[list.length-1][1]===g){g?.(p,ctx);return;}e-=d;}};},
};
// a face, held: the companion's face (faces.js) set and kept while a gesture runs
export function feel(c,expr,hold=4){c?.person?.face?.set?.(expr,{hold});}
