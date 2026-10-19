// Jamie and Sam as two more people in the same place, not two followers on a string (Chapter Five first; any chapter
// can switch it on). Each friend keeps one short-term goal at a time, with its own clock, and changes it only for a
// reason: you walked off (he notices, finishes what he is doing, then comes, at his own pace); you stopped (he arrives,
// slows, and stands somewhere sensible, and stays there); something nearby is worth a look (he goes and looks, then comes
// back); you walked into him (he steps aside, once). Nothing here copies the player's keys or view: where you look never
// moves them, and your speed reaches them only through where you are.
//
// Priorities, highest first: a scripted scene (the chapter's comp.run / stand(): this file does nothing while one runs),
// staying with you (follow, regroup), making room, then looking at things, then standing about. Hysteresis everywhere:
// a place to stand is kept until it stops being a good place; a goal is kept for at least a moment; a new idle place is
// only looked for when the old one is wrong.
//
// Personalities (PERSON): Jamie notices later sometimes but moves sooner, goes ahead, likes odd things and the water, and
// fidgets; Sam is slower to start and quicker to look back, likes maps, signs and records, and stands still.
// World space: x, z, heading a with forward (sin a, -cos a), as companions.js.
import {walkPose,standPose,blendPose,copyPose,applyPose,newPose,P,stride,smooth} from './rig.js';
import {headingTo,wrap} from './people.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const hyp=Math.hypot;
// How each of them is: reaction (s, before noticing you have gone), side (+ your left, - your right, as they like to
// walk), lag (m behind), curious (how soon a nearby thing gets looked at), likes (kinds of things), acc/dec (m/s²), top
// speeds on foot, glance (how often he looks back at you / around), gestures he uses standing about.
export const PERSON={
 jamie:{react:[.35,.85],side:1,lag:2.0,lead:.32,curious:[7,13],likes:{odd:1.6,water:1.5,climb:1.4,view:1,sign:.6,map:.5,records:.3,supplies:.4},acc:1.7,dec:2.6,walk:1.45,brisk:2.05,jog:3.1,run:3.9,
  lookBack:[6,10],lookAround:[2.5,5],gestures:{hips:1.2,pockets:.8,scratch:1,stretch:.8,shift:1.4,cross:.4,lookAround:1.4},ride:{react:[.35,.7],acc:1.75,brake:3.2,lag:[1.4,3.2]}},
 sam:{react:[.65,1.25],side:-1,lag:2.6,lead:0,curious:[10,17],likes:{map:1.7,sign:1.5,records:1.7,supplies:1.4,view:.8,water:.5,odd:.6,climb:.2},acc:1.35,dec:2.3,walk:1.35,brisk:1.9,jog:2.9,run:3.75,
  lookBack:[3,6],lookAround:[4,7],gestures:{cross:1.4,pockets:1,hips:.6,scratch:.5,stretch:.3,shift:1,lookAround:.7},ride:{react:[.6,1.1],acc:1.3,brake:2.7,lag:[4.2,6.4]}},
};
// How far apart the group stays, by mood: far (beyond this he comes after you), near (within this, stopped, he is
// with you), space (closest he chooses to stand to you), max (the most he lets you get before running).
const MOOD={relaxed:{far:5.6,near:3.4,space:1.55,react:1,poi:1,lag:1},explore:{far:5.2,near:3.2,space:1.45,react:1,poi:1,lag:1},
 tense:{far:3.6,near:2.6,space:1.25,react:.6,poi:0,lag:.8},danger:{far:2.8,near:2.2,space:1.1,react:.3,poi:0,lag:.7},escape:{far:2.4,near:2.0,space:1.0,react:.15,poi:0,lag:.6}};

export function createCompanionBrain({nav,comp}){
 const M=comp.motion,all=comp.all;
 const scene={mood:'relaxed',pois:[],goal:null,lead:true,seat:null};
 // the player, as seen from outside: where, how fast, which way (from movement, never from the view)
 const PL={x:0,z:0,vx:0,vz:0,v:0,dir:0,still:0,init:false,trail:[],t:0};
 let rnd=(()=>{let s=0x5eed;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();
 const range=([a,b])=>a+(b-a)*rnd();
 const LOG={goals:0,steps:0,asides:0,inspects:0,recover:0,leads:0};
 function state(c){if(!c.B)c.B=fresh(c);return c.B;}
 function fresh(c){const K=PERSON[c.key]||PERSON.sam;return {K,goal:'idle',gt:0,dwell:range(K.curious),spot:null,react:-1,poi:null,cool:{},gesture:null,gW:0,gT:range([3,6]),glT:range(K.lookAround),gaze:null,gazeT:0,
  v:0,face:null,blocked:0,lastX:null,lastZ:null,noProgress:0,aside:null,think:rnd()*.25,lead:null,leadT:0,log:[],held:0};}
 function enable(c,on=true){c.brain=on?api:null;if(on){c.B=fresh(c);}}
 function reset(){for(const c of all){c.B=null;}PL.init=false;PL.trail.length=0;scene.mood='relaxed';scene.pois=[];scene.goal=null;scene.seat=null;rnd=(()=>{let s=0x5eed;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();for(const k of Object.keys(LOG))LOG[k]=0;}
 function setScene(o={}){Object.assign(scene,{mood:'relaxed',pois:[],goal:null,lead:true,...o});}
 const mood=()=>MOOD[scene.mood]||MOOD.relaxed;
 // ---- the player, tracked ------------------------------------------------------------------------------------------------
 function track(dt,pl){if(!PL.init||hyp(pl.x-PL.x,pl.z-PL.z)>6){Object.assign(PL,{x:pl.x,z:pl.z,vx:0,vz:0,v:0,dir:pl.a,still:0,init:true});PL.trail.length=0;}
  if(hyp(pl.x-PL.x,pl.z-PL.z)/Math.max(dt,1e-3)>12){PL.x=pl.x;PL.z=pl.z;return;}// (a step off the bike in one frame is not a heading)
  const vx=(pl.x-PL.x)/Math.max(dt,1e-3),vz=(pl.z-PL.z)/Math.max(dt,1e-3);PL.vx=damp(PL.vx,vx,4,dt);PL.vz=damp(PL.vz,vz,4,dt);PL.x=pl.x;PL.z=pl.z;PL.v=hyp(PL.vx,PL.vz);
  if(PL.v>.45)PL.dir=Math.atan2(PL.vx,-PL.vz);PL.still=PL.v<.3?PL.still+dt:0;PL.t+=dt;
  const L=PL.trail[PL.trail.length-1];if(!L||hyp(L.x-pl.x,L.z-pl.z)>.5){PL.trail.push({x:pl.x,z:pl.z});if(PL.trail.length>120)PL.trail.shift();}}
 // a point on your way, s metres back along where you walked
 function trailBack(s){const T=PL.trail;let acc=0,x=PL.x,z=PL.z;for(let i=T.length-1;i>=0;i--){const d=hyp(T[i].x-x,T[i].z-z);if(acc+d>=s){const f=(s-acc)/(d||1);return {x:x+(T[i].x-x)*f,z:z+(T[i].z-z)*f};}acc+=d;x=T[i].x;z=T[i].z;}return {x,z};}
 const other=c=>all.find(q=>q!==c&&q.active);
 const posOf=q=>q.mode==='ride'?{x:q.bx,z:q.bz}:{x:q.px,z:q.pz};
 const ok=(x,z,r=.3)=>!!nav.walkable(x,z,{r});
 // ---- choosing where to stand ------------------------------------------------------------------------------------------
 // A good place: not in your way or your face, not on top of the other one, on ground, not far; the nearest such place
 // to where he already is (so a friend already standing well does not move at all).
 function spotScore(c,x,z,{forOther=null}={}){const B=state(c),m=mood(),dP=hyp(x-PL.x,z-PL.z);if(dP<m.space-.05||dP>m.near+.6)return Infinity;if(!ok(x,z,.3))return Infinity;
  const o=other(c);let s=hyp(x-c.px,z-c.pz)*1.0;
  if(o&&o.mode==='foot'){const op=o.B?.spot&&o.B.goal==='idle'?o.B.spot:posOf(o),dO=hyp(x-op.x,z-op.z);if(dO<1.05)return Infinity;s+=Math.max(0,1.7-dO)*2.2;}
  // (in front of you and close: in the way of where you are going and of what you are looking at)
  const fa=PL.dir,fx=Math.sin(fa),fz=-Math.cos(fa),ahead=((x-PL.x)*fx+(z-PL.z)*fz)/(dP||1);if(ahead>.82&&dP<2.6)s+=3;
  // (his side of you, as he likes it: Jamie on your left, Sam on your right)
  const side=((x-PL.x)*Math.cos(fa)+(z-PL.z)*Math.sin(fa))*-1;if(Math.sign(side)!==Math.sign(B.K.side))s+=.6;
  if(!M.lineClear(x,z,PL.x,PL.z))s+=2.5;void forOther;return s;}
 function chooseSpot(c){const m=mood(),B=state(c);let best=null,bs=Infinity;
  // where he is now, if it is fine
  const here=spotScore(c,c.px,c.pz);if(here<1.2){best={x:c.px,z:c.pz};bs=here;}
  if(!best){for(const r of [m.space+.35,(m.space+m.near)/2,m.near-.2])for(let i=0;i<14;i++){const a=i/14*Math.PI*2,x=PL.x+Math.sin(a)*r,z=PL.z-Math.cos(a)*r,s=spotScore(c,x,z);if(s<bs){bs=s;best={x,z};}}}
  if(!best)best={x:c.px,z:c.pz};return {x:best.x,z:best.z,px:PL.x,pz:PL.z,at:B.gt};}
 // ---- goals ---------------------------------------------------------------------------------------------------------------
 function setGoal(c,g,extra={}){const B=state(c);if(B.goal!==g){B.log.push(g);if(B.log.length>40)B.log.shift();LOG.goals++;}B.goal=g;B.gt=0;Object.assign(B,extra);}
 // Every quarter second (each on his own beat), he decides whether what he is doing still makes sense.
 function think(c,pl){const B=state(c),m=mood(),d=hyp(PL.x-c.px,PL.z-c.pz),o=other(c),dO=o&&o.mode==='foot'?hyp(o.px-c.px,o.pz-c.pz):9;
  const closing=((PL.x-c.px)*-PL.vx+(PL.z-c.pz)*-PL.vz)/(d||1);// (how fast you are coming toward him)
  const wantFollow=d>m.far||(d>m.near+.8&&PL.v>.5&&closing<.2&&PL.still<.1);
  if(B.goal==='inspect'&&!m.poi){B.poi=null;setGoal(c,'idle');}
  if(B.goal==='idle'&&!B.spot)B.spot={x:c.px,z:c.pz,px:PL.x,pz:PL.z};
  if(B.goal==='idle'||B.goal==='inspect'||B.goal==='aside'){
   // you are going: he notices after his own moment (and finishes a look first, a little)
   // (looking at something near you while you stand there is not being left behind; and a look is finished, a little)
   const looking=B.goal==='inspect'&&B.poi&&PL.still>.8&&hyp(B.poi.x-PL.x,B.poi.z-PL.z)<m.far+2.5,finishing=B.goal==='inspect'&&B.poi&&B.poi.t>0&&B.poi.t<Math.min(1.2,B.poi.time)&&d<m.far+3;
   if(wantFollow&&!(looking||finishing)){if(B.react<0)B.react=range(B.K.react)*m.react*(B.goal==='inspect'?1.4:1);}
   else if(!wantFollow)B.react=-1;
   if(B.react===0){B.react=-1;B.poi=null;setGoal(c,'follow');return;}
   if(B.goal==='idle'){
    // walked into: he makes room (once; then he is where he stands)
    if(d<m.space-.5&&PL.v<1.6&&B.gt>.5){const a=headingTo(PL.x,PL.z,c.px,c.pz);for(const k of [0,.5,-.5,1,-1]){const x=PL.x+Math.sin(a+k)*(m.space+.4),z=PL.z-Math.cos(a+k)*(m.space+.4);if(ok(x,z)&&M.lineClear(c.px,c.pz,x,z)){setGoal(c,'aside',{aside:{x,z}});LOG.asides++;return;}}}
    // the two of them on top of each other: the one who got there second moves
    if(o&&o.mode==='foot'&&dO<.85&&o.B?.goal==='idle'&&B.gt<o.B.gt){B.spot=chooseSpot(c);setGoal(c,'aside',{aside:{x:B.spot.x,z:B.spot.z}});return;}
    // something nearby to look at
    if(m.poi&&B.gt>B.dwell&&PL.still>1.5&&!scene.seat){const q=pickPoi(c);if(q){setGoal(c,'inspect',{poi:{...q,t:0,at:null,time:Array.isArray(q.time)?range(q.time):(q.time||range([4,7]))}});LOG.inspects++;return;}B.dwell=B.gt+range(B.K.curious);}
    // where he stands has stopped being a good place (you moved off a little, without going)
    if(B.spot&&(hyp(B.spot.px-PL.x,B.spot.pz-PL.z)>2.2||d>m.near+.9)&&PL.still>.7){const s=chooseSpot(c);if(hyp(s.x-c.px,s.z-c.pz)>.6){B.spot=s;setGoal(c,'aside',{aside:{x:s.x,z:s.z}});}else B.spot=s;}}
   return;}
  if(B.goal==='follow'||B.goal==='lead'){
   // with you again, and you have stopped: stand
   if(d<m.near&&PL.still>.6){B.spot=chooseSpot(c);setGoal(c,hyp(B.spot.x-c.px,B.spot.z-c.pz)>.5?'aside':'idle',{aside:{x:B.spot.x,z:B.spot.z},dwell:range(B.K.curious)});return;}
   // you are coming back toward him: he waits for you rather than walking at you
   if(closing>.5&&d<m.far+2){setGoal(c,'wait');return;}
   // Jamie goes on ahead now and then when it is clear where you are all going
   if(B.goal==='follow'&&scene.lead&&scene.goal&&B.K.lead>0&&PL.v>.9&&B.gt>2.5&&rnd()<B.K.lead*.05){const g=scene.goal,gd=hyp(g.x-PL.x,g.z-PL.z),ga=headingTo(PL.x,PL.z,g.x,g.z);
    if(gd>12&&Math.abs(wrap(ga-PL.dir))<.6){setGoal(c,'lead',{lead:{until:range([6,12])}});LOG.leads++;return;}}
   if(B.goal==='lead'&&(B.gt>(B.lead?.until||8)||!scene.goal||PL.still>.4))setGoal(c,'follow');
   return;}
  if(B.goal==='wait'){if(d<m.near&&PL.still>.4){B.spot=chooseSpot(c);setGoal(c,hyp(B.spot.x-c.px,B.spot.z-c.pz)>.5?'aside':'idle',{aside:{x:B.spot.x,z:B.spot.z}});return;}
   if(closing<.1&&d>m.near+.5||d>m.far+1.5){if(B.gt>.4)setGoal(c,'follow');}return;}}
 // something near you both, of a kind he likes, not looked at lately
 function pickPoi(c){const B=state(c);let best=null,bs=0;for(const q of scene.pois){if(q.who&&q.who!==c.key)continue;if((B.cool[q.id]||-99)>PL.t-45)continue;if(hyp(q.x-PL.x,q.z-PL.z)>Math.min(q.reach||10,mood().far+2))continue;/* (near enough to you that looking at it is still being with you) */const dC=hyp(q.x-c.px,q.z-c.pz);if(dC>13)continue;
   const o=other(c);if(o?.B?.poi?.id===q.id)continue;const s=(B.K.likes[q.kind]||.5)*(1.2-dC/16)*(.6+rnd()*.8);if(s>bs){bs=s;best=q;}}
  if(best)B.cool[best.id]=PL.t;return best;}
 // ---- moving -------------------------------------------------------------------------------------------------------------
 // Toward a point at a pace, starting and stopping like a person (his own acceleration), round things by a path, and
 // easing past the others rather than bumping. Returns the distance still to go.
 function move(c,dt,ctx,tx,tz,vmax,{arrive=.28,look=null}={}){const B=state(c),K=B.K,d=hyp(tx-c.px,tz-c.pz);
  const [rx,rz]=M.routeTo(c,dt,tx,tz,ctx.player);
  const vT=d<arrive?0:Math.min(vmax,Math.sqrt(2*K.dec*Math.max(0,d-arrive))+.12);B.v+=clamp(vT-B.v,-K.dec*dt,K.acc*dt*(c.footBoost||1));B.v=Math.max(0,B.v);
  let want=headingTo(c.px,c.pz,rx,rz);
  // (easing round the others: a little to the side, early, not a stop)
  const fx=Math.sin(want),fz=-Math.cos(want);let bias=0;
  for(const q of [{x:ctx.player.x,z:ctx.player.z,r:.75},...all.filter(q=>q!==c&&q.active&&q.mode==='foot').map(q=>({x:q.px,z:q.pz,r:.7}))]){const dx=q.x-c.px,dz=q.z-c.pz,dd=hyp(dx,dz),ah=dx*fx+dz*fz;if(dd<1.8&&ah>0&&dd<d+.4){const sd=dx*Math.cos(want)+dz*Math.sin(want);bias+=-(Math.sign(sd)||1)*(1.8-dd)*.55;}}
  want+=clamp(bias,-.9,.9);
  const turn=wrap(want-c.pa),rate=B.v>1.5?3.2:4.2;if(B.v>.04||Math.abs(turn)>.3)c.pa+=clamp(turn,-rate*dt,rate*dt);
  const slow=Math.abs(turn)>1.3?.25:Math.abs(turn)>.7?.65:1,step=B.v*slow*dt;
  const peers=[{x:ctx.player.x,z:ctx.player.z,r:.62},...(ctx.obstacles||[]),...all.filter(q=>q!==c&&q.active&&q.mode==='foot').map(q=>({x:q.px,z:q.pz,r:.6}))];
  const free=(x,z)=>nav.walkable(x,z,{r:.26})&&!peers.some(o=>{const dd=hyp(o.x-x,o.z-z);return dd<o.r&&dd<hyp(o.x-c.px,o.z-c.pz);});
  const ox=c.px,oz=c.pz;let moved=false;
  for(const k of [0,.45,-.45,.9,-.9]){const a=c.pa+k,x=c.px+Math.sin(a)*step,z=c.pz-Math.cos(a)*step;if(free(x,z)){c.px=x;c.pz=z;moved=true;break;}}
  if(!moved&&step>0){B.v=Math.max(0,B.v-4*dt);B.blocked+=dt;}else B.blocked=Math.max(0,B.blocked-dt*2);
  const mv=hyp(c.px-ox,c.pz-oz);c.gait+=mv/stride(Math.max(B.v,.8));c.walkV=B.v;
  pose(c,dt,ctx,look);return d;}
 // The pose: walking blended into standing by speed (no pop at a start or a stop), the head where his attention is,
 // a gesture over it when standing.
 function pose(c,dt,ctx,look){const B=state(c),v=B.v,w=smooth(v/.55);const lk=attention(c,dt,ctx,look);
  // (the plain pose is smoothed on its own; a gesture is laid over a copy of it each frame, so nothing builds up)
  if(!B.base){B.base=newPose();copyPose(B.base,c.pose);}if(ctx.clock-(B.frameAt??-9)>.12)copyPose(B.base,c.pose);B.frameAt=ctx.clock;
  standPose(c.tmp,ctx.clock*.8+c.R.phase,{look:lk,shift:.7});
  if(w>.01){walkPose(c.from,c.gait,Math.max(v,.8),{look:lk*.7});blendPose(c.tmp,c.tmp,c.from,w);}
  blendPose(B.base,B.base,c.tmp,1-Math.exp(-14*dt));copyPose(c.pose,B.base);gestures(c,dt,ctx,1-w);
  M.feet(c,c.pose);applyPose(c.person,c.pose);}
 // where he is looking: whoever is talking, what he is looking at, you when you are close and facing him, now and
 // then a look round (Jamie) or back at you (Sam)
 function attention(c,dt,ctx,look){const B=state(c),o=other(c);let at=look||c.lookAt||null;
  // (whoever is talking: the other one, or you; and when he is talking himself, to you)
  if(!at&&o&&o.talk>0&&o.person.group.visible)at=M.headOf(o).clone();
  if(!at&&(ctx.speaker==='YOU'||c.talk>0))at=ctx.eye;
  if(!at&&B.poi?.t>0)at={x:B.poi.x,y:B.poi.y,z:B.poi.z};
  B.glT-=dt;if(B.glT<0){B.glT=range(B.goal==='follow'?B.K.lookBack:B.K.lookAround);B.gaze=rnd()<.5?{yaw:(rnd()-.5)*1.6,t:range([.8,1.8])}:null;}
  if(B.gaze){B.gaze.t-=dt;if(B.gaze.t<0)B.gaze=null;}
  if(!at&&hyp(ctx.eye.x-c.px,ctx.eye.z-c.pz)<5.5)at=ctx.eye;
  let yaw=at?clamp(-wrap(headingTo(c.px,c.pz,at.x,at.z)-c.pa),-1.25,1.25):0;if(B.gaze&&!c.lookAt&&!(c.talk>0)&&!(o&&o.talk>0))yaw=clamp(B.gaze.yaw,-1.2,1.2);
  // (Sam, walking after you, looks back to see you are there)
  if(B.goal==='lead'||B.goal==='follow'&&c.key==='sam'&&B.gaze)yaw=clamp(-wrap(headingTo(c.px,c.pz,PL.x,PL.z)-c.pa),-1.3,1.3);
  B.yaw=damp(B.yaw??0,yaw,3.2,dt);return B.yaw;}
 // Standing about: now and then a hand on a hip, arms folded, a scratch, a stretch, a shift of weight; never two at once,
 // never constantly. In a tense place, hands stay close.
 const G={
  hips:(p,w)=>{for(const [o,e,s] of [[P.lh,P.le,-1],[P.rh,P.re,1]]){p[o]+=(s*.17-p[o])*w;p[o+1]+=(.92-p[o+1])*w;p[o+2]+=(.03-p[o+2])*w;p[e]+=(s*1-p[e])*w;p[e+2]+=(.2-p[e+2])*w;}},
  cross:(p,w)=>{for(const [o,e,s] of [[P.lh,P.le,-1],[P.rh,P.re,1]]){p[o]+=(s*-.05-p[o])*w;p[o+1]+=(1.07+(s>0?.025:0)-p[o+1])*w;p[o+2]+=(-.15-p[o+2])*w;p[e]+=(s*.6-p[e])*w;p[e+1]+=(-.6-p[e+1])*w;p[e+2]+=(.3-p[e+2])*w;}},
  pockets:(p,w)=>{for(const [o,s] of [[P.lh,-1],[P.rh,1]]){p[o]+=(s*.16-p[o])*w;p[o+1]+=(.8-p[o+1])*w;p[o+2]+=(.0-p[o+2])*w;}},
  scratch:(p,w,t)=>{p[P.rh]+=(.1-p[P.rh])*w;p[P.rh+1]+=(1.47+Math.sin(t*14)*.012-p[P.rh+1])*w;p[P.rh+2]+=(.02-p[P.rh+2])*w;p[P.re]+=(1-p[P.re])*w;p[P.re+1]+=(.4-p[P.re+1])*w;p[P.hp]-=.12*w;},
  stretch:(p,w)=>{for(const [o,s] of [[P.lh,-1],[P.rh,1]]){p[o]+=(s*.12-p[o])*w;p[o+1]+=(1.78-p[o+1])*w;p[o+2]+=(.05-p[o+2])*w;}p[P.hp]+=.25*w;p[P.lean]-=.08*w;},
  shift:(p,w)=>{p[P.root]+=.04*w;p[P.roll]-=.06*w;p[P.lf+1]+=.0*w;p[P.rf]+=.06*w;},
  lookAround:(p,w,t)=>{p[P.hy]+=Math.sin(t*.9)*.6*w;p[P.twist]+=Math.sin(t*.9)*.15*w;},
  inspect:(p,w)=>{p[P.root+1]-=.2*w;p[P.lean]+=.55*w;p[P.hp]-=.3*w;for(const [o,s] of [[P.lh,-1],[P.rh,1]]){p[o]+=(s*.13-p[o])*w;p[o+1]+=(.55-p[o+1])*w;p[o+2]+=(-.16-p[o+2])*w;}},
  crouch:(p,w)=>{p[P.root+1]-=.36*w;p[P.root+2]+=.1*w;p[P.lean]+=.45*w;p[P.hp]-=.25*w;for(const f of [P.lf,P.rf])p[f+2]-=.02*w;p[P.rh+1]-=.35*w;p[P.rh+2]-=.25*w;p[P.lh+1]-=.32*w;p[P.lh+2]-=.18*w;},
  point:(p,w)=>{const y=p[P.root+1];p[P.rh]+=(.18-p[P.rh])*w;p[P.rh+1]+=(y+.5-p[P.rh+1])*w;p[P.rh+2]+=(-.48-p[P.rh+2])*w;p[P.re]+=(1-p[P.re])*w;},
  look:(p,w)=>{p[P.lean]+=.12*w;p[P.hp]-=.12*w;},
  tense:(p,w)=>{p[P.root+1]-=.035*w;p[P.lean]+=.1*w;for(const [o,s] of [[P.lh,-1],[P.rh,1]]){p[o]+=(s*.14-p[o])*w*.6;p[o+1]+=(.86-p[o+1])*w*.6;p[o+2]+=(-.06-p[o+2])*w*.6;}},
 };
 function gestures(c,dt,ctx,standing){const B=state(c);
  // a gesture the scene or a look asks for wins; otherwise his own, now and then, when standing still a while
  let want=B.force||null;
  if(!want&&B.goal==='inspect'&&B.poi?.t>0)want=B.poi.gesture||'inspect';
  if(!want&&(scene.mood==='tense'||scene.mood==='danger')&&standing>.6)want='tense';
  if(!want&&B.goal==='idle'&&standing>.8){B.gT-=dt;if(B.gT<0){if(B.gesture){B.gesture=null;B.gT=range([3.5,8]);}else{const W=B.K.gestures,ks=Object.keys(W),tot=ks.reduce((s,k)=>s+W[k],0);let r=rnd()*tot,k=ks[0];for(const q of ks){r-=W[q];if(r<=0){k=q;break;}}B.gesture=k;B.gT=k==='scratch'?range([1.4,2.4]):k==='stretch'?range([1.6,2.4]):k==='lookAround'?range([2.5,4]):range([4,9]);}}want=B.gesture;}
  else if(B.goal!=='idle')B.gesture=null;
  if(want!==B.gName){B.gPrev=B.gName;B.gPrevW=B.gW;B.gName=want;B.gW=0;}
  B.gW=Math.min(1,B.gW+dt/.55);B.gPrevW=Math.max(0,(B.gPrevW||0)-dt/.45);
  const t=ctx.clock+c.R.phase;if(B.gPrev&&B.gPrevW>0&&G[B.gPrev])G[B.gPrev](c.pose,smooth(B.gPrevW)*standing,t);if(B.gName&&G[B.gName])G[B.gName](c.pose,smooth(B.gW)*(B.force?1:standing),t);}
 // ---- every frame, on foot ------------------------------------------------------------------------------------------------
 function walk(c,dt,ctx){const B=state(c),m=mood(),pl=ctx.player;
  // (back from a scene the chapter ran, or a while away: what he was about to do before it is forgotten, not resumed)
  if(B.lastWalk!=null&&ctx.clock-B.lastWalk>.5){B.poi=null;B.react=-1;B.spot=null;B.aside=null;setGoal(c,hyp(PL.x-c.px,PL.z-c.pz)>m.far?'follow':'idle',{dwell:range(B.K.curious)});}B.lastWalk=ctx.clock;
  if(!pl.walking&&!pl.riding){idle(c,dt,ctx);return;}
  B.think-=dt;if(B.think<=0){B.think=.25;think(c,pl);}
  if(B.react>0)B.react=Math.max(0,B.react-dt);
  B.gt+=dt;
  // progress watch: wanting to go and not getting anywhere: a fresh path (counted), and then a different way round
  if(B.lastX!==null){const mv=hyp(c.px-B.lastX,c.pz-B.lastZ);if(B.v>.3||B.goal==='follow'&&hyp(PL.x-c.px,PL.z-c.pz)>m.far)B.noProgress=mv<.15*dt?B.noProgress+dt:Math.max(0,B.noProgress-dt);}B.lastX=c.px;B.lastZ=c.pz;
  if(B.noProgress>2.2){B.noProgress=0;c.route=null;c.routeT=0;LOG.recover++;if(B.goal==='aside'||B.goal==='inspect')setGoal(c,'idle');}
  const g=B.goal;
  if(g==='follow'||g==='lead'){const tgt=followTarget(c,g),d=hyp(tgt.x-c.px,tgt.z-c.pz),dP=hyp(PL.x-c.px,PL.z-c.pz);
   // pace by how far behind he is (with a little memory, so it does not flicker between walking and running)
   const K=B.K,want=dP>12||d>9?K.run:dP>7.5||d>5.5?K.jog:d>2.4||PL.v>1.6?K.brisk:K.walk;if(!B.pace||want>B.pace+.9)B.pace=want;else if(want!==B.pace){B.paceT=(B.paceT||0)+dt;if(B.paceT>.7){B.pace=want;B.paceT=0;}}else B.paceT=0;// (a new pace once it has been wanted a moment: no flicker, but no sticking either)
   const fast=scene.mood==='escape'||scene.mood==='danger'?1.08:1;move(c,dt,ctx,tgt.x,tgt.z,B.pace*fast,{arrive:.4});return;}
  if(g==='aside'){const a=B.aside;if(!a){setGoal(c,'idle');idle(c,dt,ctx);return;}const d=move(c,dt,ctx,a.x,a.z,B.K.walk,{arrive:.22});if(d<.25&&B.v<.08){B.spot={x:c.px,z:c.pz,px:PL.x,pz:PL.z};setGoal(c,'idle',{dwell:range(B.K.curious)});}
   else if(B.gt>6){B.spot={x:c.px,z:c.pz,px:PL.x,pz:PL.z};setGoal(c,'idle');}return;}
  if(g==='inspect'){const q=B.poi;if(!q){setGoal(c,'idle');idle(c,dt,ctx);return;}
   // (where to stand to look: clear of the other one and of you; if he is standing there by the time I get there, elsewhere)
   const o=other(c),free=(x,z)=>!(o&&o.mode==='foot'&&hyp(o.px-x,o.pz-z)<1)&&hyp(PL.x-x,PL.z-z)>1;if(q.at&&q.t===0&&!free(q.at.x,q.at.z))q.at=null;
   if(!q.at){const a0=headingTo(PL.x,PL.z,q.x,q.z),st=q.stand??.8;for(const k of [0,.7,-.7,1.4,-1.4,Math.PI]){const a=a0+k,x=q.x-Math.sin(a)*st,z=q.z+Math.cos(a)*st;if(ok(x,z,.3)&&free(x,z)){q.at={x,z};break;}}if(!q.at){B.poi=null;setGoal(c,'idle');return;}}
   if(q.t===0){const d=move(c,dt,ctx,q.at.x,q.at.z,B.K.walk*.92,{arrive:.25,look:{x:q.x,y:q.y,z:q.z}});if(d<.3&&B.v<.1)q.t=1e-3;if(B.gt>14)setGoal(c,'idle');return;}
   q.t+=dt;B.v=damp(B.v,0,8,dt);c.pa+=clamp(wrap(headingTo(c.px,c.pz,q.x,q.z)-c.pa),-2.5*dt,2.5*dt);pose(c,dt,ctx,{x:q.x,y:q.y??0,z:q.z});
   if(q.t>q.time){B.poi=null;B.spot=null;setGoal(c,'idle',{dwell:range(B.K.curious)*1.3});
    // back near you, if he wandered off a way to look
    if(hyp(PL.x-c.px,PL.z-c.pz)>m.near+.6){B.spot=chooseSpot(c);setGoal(c,'aside',{aside:{x:B.spot.x,z:B.spot.z}});}}return;}
  if(g==='wait'){B.v=damp(B.v,0,6,dt);faceToward(c,dt,PL.x,PL.z,.4);pose(c,dt,ctx,null);return;}
  idle(c,dt,ctx);}
 // where a friend walking with you aims: a little behind you and to his side of the way you are going (from where you
 // have been walking, not where you look); in the open, beside you; going ahead, in front toward where you are going
 function followTarget(c,g){const B=state(c),m=mood(),fa=PL.dir,fx=Math.sin(fa),fz=-Math.cos(fa),rx=Math.cos(fa),rz=Math.sin(fa),side=-B.K.side*1.05;
  if(g==='lead'&&scene.goal){const ga=headingTo(PL.x,PL.z,scene.goal.x,scene.goal.z),x=PL.x+Math.sin(ga)*3.6+Math.cos(ga)*side*.6,z=PL.z-Math.cos(ga)*3.6+Math.sin(ga)*side*.6;if(ok(x,z))return {x,z};}
  if(scene.mood==='escape'&&scene.goal){const ga=headingTo(PL.x,PL.z,scene.goal.x,scene.goal.z),x=PL.x+Math.sin(ga)*1.2+Math.cos(ga)*side,z=PL.z-Math.cos(ga)*1.2+Math.sin(ga)*side;if(ok(x,z))return {x,z};}
  const lag=B.K.lag*m.lag;let x=PL.x-fx*lag+rx*side,z=PL.z-fz*lag+rz*side;
  if(!ok(x,z)||!M.lineClear(x,z,PL.x,PL.z)){const q=trailBack(lag+.6);x=q.x;z=q.z;}
  return {x,z};}
 function faceToward(c,dt,x,z,dead=.45){const B=state(c),want=headingTo(c.px,c.pz,x,z),diff=wrap(want-c.pa);if(Math.abs(diff)>dead||B.turning){B.turning=Math.abs(diff)>.08;c.pa+=clamp(diff,-2.2*dt,2.2*dt);c.gait+=Math.min(Math.abs(diff),2.2*dt)*.25;}}
 // Standing with you: facing the middle of the group (you, or between you and the other one), turning only when it has
 // drifted well off; small movements in the pose; no stepping about.
 function idle(c,dt,ctx){const B=state(c),o=other(c);B.v=damp(B.v,0,7,dt);
  let fx=PL.x,fz=PL.z;if(o&&o.mode==='foot'&&hyp(o.px-PL.x,o.pz-PL.z)<4.5){fx=(PL.x*2+o.px)/3;fz=(PL.z*2+o.pz)/3;}
  if(hyp(fx-c.px,fz-c.pz)>.5)faceToward(c,dt,fx,fz,.55);
  pose(c,dt,ctx,null);}
 // ---- on the bike ---------------------------------------------------------------------------------------------------------------
 // What a rider can know about you: how fast you were going a moment ago (his reaction time), not right now.
 function seenSpeed(c,pl,dt,clock){const B=state(c),R=B.K.ride,v=pl.riding?pl.speed:0;(B.sp||(B.sp=[])).push([clock,v]);while(B.sp.length>2&&B.sp[1][0]<clock-(B.rr??(B.rr=range(R.react))))B.sp.shift();
  const seen=B.sp[0][1];B.seenV=damp(B.seenV??seen,seen,3,dt);return B.seenV;}
 const rideStyle=c=>{const B=state(c),R=B.K.ride;if(!B.lagT||B.lagT<0){B.lagT=range([8,16]);B.lagWant=range(R.lag);}return {acc:R.acc,brake:R.brake,lag:B.lagWant};};
 function rideTick(c,dt){const B=state(c);B.lagT=(B.lagT||0)-dt;}
 // ---- the tests' view ---------------------------------------------------------------------------------------------------------
 const view=c=>{const B=state(c);return {goal:B.goal,gt:+B.gt.toFixed(2),v:+B.v.toFixed(2),spot:B.spot?{x:+B.spot.x.toFixed(2),z:+B.spot.z.toFixed(2)}:null,gesture:B.gName||null,poi:B.poi?.id||null,changes:B.log.length,log:[...B.log]};};
 // A gesture the chapter wants held (pointing, tense) over whatever he is doing; null lets it go.
 function force(c,g){state(c).force=g;}
 const api={enable,reset,setScene,walk,idle,seenSpeed,rideStyle,rideTick,state:view,force,track,scene,PL,LOG,PERSON,MOOD,get mood(){return scene.mood;}};
 return api;
}
