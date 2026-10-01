// Jamie and Sam later that night, free of Oak Hollow's street coordinates: they ride where you
// ride (following the path you actually took, so they go round the same corners and up the same
// driveways), stop when you stop, and walk when the chapter asks them to. Scripted moments (a
// window, a side door, the creek) are step lists like the friends' departures in friends.js.
// World space throughout: x, z and a heading a, with forward (sin a, -cos a).
import * as THREE from './three.module.js';
import {newPose,ridePose,walkPose,standPose,addWave,dismountKeys,samplePose,blendPose,copyPose,applyPose,poseBike,pushPose,PUSH_OFFSET,P,smooth,stride,BODY} from './rig.js';
import {worldPath,wrap,headingTo} from './people.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const RAD_PER_M=1.25;

// The way you came: positions of your bike, measured along the ground.
export function createTrail(){const pts=[];let base=0;
 const T={pts,get end(){return pts.length?pts[pts.length-1].s:0;},
  reset(x,z){pts.length=0;base=0;if(x!==undefined)pts.push({x,z,s:0});},
  push(x,z){const l=pts[pts.length-1];if(!l){pts.push({x,z,s:0});return;}const d=Math.hypot(x-l.x,z-l.z);if(d<.3)return;if(d>6){T.reset(x,z);return;}pts.push({x,z,s:l.s+d});if(pts.length>900)pts.splice(0,300);},
  index(s){let lo=0,hi=pts.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(pts[m].s<s)lo=m;else hi=m;}return lo;},
  at(s){if(!pts.length)return null;if(pts.length===1||s<=pts[0].s)return {...pts[0],dx:0,dz:-1};if(s>=T.end){const a=pts[pts.length-2],b=pts[pts.length-1],l=Math.hypot(b.x-a.x,b.z-a.z)||1;return {x:b.x,z:b.z,s:b.s,dx:(b.x-a.x)/l,dz:(b.z-a.z)/l};}
   const i=T.index(s),a=pts[i],b=pts[i+1],t=(s-a.s)/((b.s-a.s)||1),l=Math.hypot(b.x-a.x,b.z-a.z)||1;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,s,dx:(b.x-a.x)/l,dz:(b.z-a.z)/l};},
  // Arc position nearest (x,z), searched between s0 and s1.
  nearest(x,z,s0,s1){if(!pts.length)return null;let i=T.index(Math.max(pts[0].s,s0)),best=null,bd=1e9;for(;i<pts.length&&pts[i].s<=s1;i++){const d=Math.hypot(pts[i].x-x,pts[i].z-z);if(d<bd){bd=d;best=pts[i];}}return best?{s:best.s,dist:bd}:null;},
  start(){return pts.length?pts[0].s:0;}};
 return T;}

export function createCompanions({scene,nav,friends,sfx=()=>{},bell=()=>{}}){
 const trail=createTrail();
 function make(f,{lag,side}){return {key:f.key,name:f.name,f,person:f.person,bike:f.bike,R:f.R,cast:f.cast,geom:f.bike.geom,pose:f.pose,tmp:f.tmp,from:f.from,lag,side};}
 const list={jamie:make(friends.list[0],{lag:3.1,side:1.05}),sam:make(friends.list[1],{lag:5.6,side:-1.05})},all=[list.jamie,list.sam];
 const KEYS=new Map();const keysFor=c=>{if(!KEYS.has(c.key))KEYS.set(c.key,dismountKeys(c.geom));return KEYS.get(c.key);};
 const vTmp=new THREE.Vector3();
 function reset(){for(const c of all)Object.assign(c,{active:false,mode:'ride',follow:null,script:null,step:0,bx:0,bz:0,ba:0,speed:0,omega:0,steer:0,lean:0,fall:0,kick:0,crank:c.R.phase,wheel:0,spin:0,astride:1,stand:0,effort:0,
  bikeY:null,bikePitch:0,px:0,pz:0,pa:0,py:null,gait:0,walkV:0,spinV:0,look:0,lookPitch:0,lookAt:null,lookPlayer:false,holding:false,posed:false,sOn:0,talk:0,glance:2+Math.random()*3,lookT:0,hidden:false,crouch:0,flash:false});trail.reset();}
 // Take a friend over from friends.js (they were inside, or their bike lying where they left it).
 function take(c){if(!c.active){// start from wherever friends.js left the bike
  const g=c.bike.group,f=c.f;c.bx=g.position.x;c.bz=g.position.z;c.ba=-g.rotation.y;c.fall=f.fall||0;c.lean=f.lean||0;c.kick=f.kick||0;c.wheel=f.wheel||0;c.crank=f.crank||0;c.steer=f.steer||0;c.speed=0;c.bikeY=null;}
  c.active=true;c.f.external=true;c.f.inside=false;c.person.group.visible=!c.hidden;}
 function release(c){c.active=false;c.f.external=false;}
 // ---- placement ------------------------------------------------------------------------------
 function placeBike(c,dt){const fx=Math.sin(c.ba),fz=-Math.cos(c.ba),yF=nav.groundY(c.bx+fx*.5,c.bz+fz*.5),yR=nav.groundY(c.bx-fx*.5,c.bz-fz*.5),y=(yF+yR)/2,pitch=Math.atan2(yF-yR,1);
  c.bikeY=c.bikeY===null||!dt?y:damp(c.bikeY,y,16,dt);c.bikePitch=!dt?pitch:damp(c.bikePitch,pitch,14,dt);
  const b=c.bike;b.group.position.set(c.bx,c.bikeY+(c.fall?.02:0),c.bz);b.group.rotation.set(c.bikePitch*(1-Math.abs(c.fall)),-c.ba,c.lean+c.fall,'YXZ');
  b.wheel=c.wheel;b.crankAngle=c.crank;b.steerAngle=c.steer;b.kickstand=c.kick;poseBike(b);b.frontWheel.rotation.x=-c.wheel-c.spin;}
 function placePerson(c,dt){const gy=nav.groundY(c.px,c.pz);c.py=c.py===null||!dt?gy:damp(c.py,gy,14,dt);const g=c.person.group;g.position.set(c.px,c.py-c.crouch,c.pz);g.rotation.set(0,-c.pa,0);}
 // Each foot finds its own ground (steps, curbs, the creek bank).
 function feet(c,p){const c0=Math.cos(c.pa),s0=Math.sin(c.pa);for(const o of [P.lf,P.rf]){const lx=p[o],lz=p[o+2],y=nav.groundY(c.px+lx*c0-lz*s0,c.pz+lx*s0+lz*c0)-c.py;p[o+1]+=clamp(y,-.3,.45);}}
 const toWorld=(x0,z0,a,lx,lz)=>({x:x0+lx*Math.cos(a)-lz*Math.sin(a),z:z0+lx*Math.sin(a)+lz*Math.cos(a)});
 // Put someone straight into a state (for scripted entrances and QA jumps).
 function putRiding(c,x,z,a,speed=0){take(c);if(c.person.group.parent!==c.bike.group)c.bike.group.add(c.person.group);c.person.group.position.set(0,0,0);c.person.group.rotation.set(0,0,0);
  Object.assign(c,{mode:'ride',bx:x,bz:z,ba:a,speed,fall:0,kick:0,astride:speed<.3?1:0,holding:false,bikeY:null,crouch:0});c.bike.group.visible=true;c.person.group.visible=true;placeBike(c,0);}
 function putFoot(c,x,z,a,{bike=null,visible=true}={}){take(c);if(c.person.group.parent!==scene)scene.attach(c.person.group);Object.assign(c,{mode:'foot',px:x,pz:z,pa:a,py:null,holding:false,crouch:0});c.person.group.visible=visible;c.hidden=!visible;
  if(bike){Object.assign(c,{bx:bike.x,bz:bike.z,ba:bike.a,fall:bike.fall||0,kick:bike.kick||0,speed:0,astride:0,lean:bike.kick?.13:0,bikeY:null});c.bike.group.visible=bike.visible!==false;placeBike(c,0);}
  standPose(c.pose,0);placePerson(c,0);applyPose(c.person,c.pose);}
 // ---- riding -----------------------------------------------------------------------------------
 function cycle(c,dt,coast){const v=c.speed,k=c.omega/Math.max(v,.8),R=c.R;c.wheel+=v*dt/c.geom.wheelR;
  if(!coast&&v>.2)c.crank+=v*dt*RAD_PER_M*R.cadence*(1+.1*c.effort);else{const level=Math.round((c.crank-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2;c.crank=damp(c.crank,level,2.5,dt);}
  c.steer=damp(c.steer,v>.3?clamp(-Math.atan(k*1.0),-.55,.55):clamp(-c.omega*.35,-.5,.5),6,dt);
  c.lean=damp(c.lean,v>.5?clamp(-Math.atan(v*v*k/9.8),-.3,.3):(c.astride>.5?.05:0),5,dt);c.astride=damp(c.astride,v<.25?1:0,v<.25?3:7,dt);}
 function rideLook(c,dt,ctx){let target=c.lookT;c.glance-=dt;
  const at=c.lookAt||(c.lookPlayer||ctx.speaker===c.name||(c.speed<.3&&Math.hypot(ctx.eye.x-c.bx,ctx.eye.z-c.bz)<9)?ctx.eye:null);
  if(at)target=clamp(-wrap(headingTo(c.bx,c.bz,at.x,at.z)-c.ba),-1.3,1.3);else if(c.glance<0){c.lookT=(Math.random()-.5)*1.1*c.R.look;c.glance=3+Math.random()*5;}
  c.look=damp(c.look,target,3,dt);}
 function poseRider(c,dt,ctx){rideLook(c,dt,ctx);ridePose(c.pose,c.crank,{stand:c.stand,astride:c.astride,steer:c.steer,look:c.look,lookPitch:-(c.cast.build.hunch||0),geom:c.geom,posture:(c.cast.build.posture||0)+c.effort*.08,stopSide:c.key==='sam'?-1:1});applyPose(c.person,c.pose);}
 // Follow the trail: aim a little ahead along it, off to one side when it runs straight, keep
 // a gap behind you, and never ride into you or each other.
 function followRide(c,dt,ctx){const T=trail,pl=ctx.player;
  if(T.pts.length<2){c.speed=Math.max(0,c.speed-3*dt);cycle(c,dt,true);return;}
  const found=T.nearest(c.bx,c.bz,c.sOn-6,c.sOn+10);if(found&&found.dist<6)c.sOn=found.s;else{const any=T.nearest(c.bx,c.bz,T.start(),T.end);if(any)c.sOn=any.s;}
  // If your path folded back past us (you turned round), take the short way to it.
  const cut=T.nearest(c.bx,c.bz,c.sOn+5,T.end-c.lag*.5);if(cut&&cut.dist<2.8)c.sOn=cut.s;
  const gap=T.end-c.sOn-c.lag,pv=pl.riding?pl.speed:0;let vT=clamp(pv+gap*.5,0,6.6);if(gap<.4&&pv<.4)vT=Math.min(vT,Math.max(0,gap*.8));
  const fx=Math.sin(c.ba),fz=-Math.cos(c.ba);
  for(const o of [{x:pl.bx,z:pl.bz,r:.9},...(pl.walking?[{x:pl.x,z:pl.z,r:.5}]:[]),...all.filter(q=>q!==c&&q.active).map(q=>({x:q.mode==='ride'?q.bx:q.px,z:q.mode==='ride'?q.bz:q.pz,r:.8}))]){const dx=o.x-c.bx,dz=o.z-c.bz,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(ahead>0&&ahead<o.r+2.6&&side<o.r+.5)vT=Math.min(vT,Math.max(0,(ahead-o.r-.8)*1.2));}
  const L=clamp(1.5+.45*c.speed,1.5,3.6),q=T.at(c.sOn+L),q2=T.at(c.sOn+L+6),bend=Math.abs(wrap(Math.atan2(q2.dx,-q2.dz)-Math.atan2(q.dx,-q.dz))),straight=1-smooth(bend/.7);
  const off=c.side*straight*smooth((T.end-c.sOn-1.5)/3);let tx=q.x-q.dz*off,tz=q.z+q.dx*off;if(!nav.rideable(tx,tz))tx=q.x,tz=q.z;
  const err=wrap(headingTo(c.bx,c.bz,tx,tz)-c.ba);
  if(c.speed<.6&&Math.abs(err)>1.2&&Math.hypot(tx-c.bx,tz-c.bz)>.8){c.omega=Math.sign(err)*1.15;vT=Math.min(vT,.15);}// a foot down, the bike walked round
  else c.omega=damp(c.omega,clamp(err*2.4,-(c.speed/1.7+.25),c.speed/1.7+.25),8,dt);
  if(vT<.05&&c.speed<.1)c.omega=0;
  c.ba+=c.omega*dt;c.effort=damp(c.effort,clamp((vT-c.speed)/1.2,0,1),2.5,dt);c.speed+=clamp(vT-c.speed,-3.2*dt,1.5*dt);c.speed=Math.max(0,c.speed);
  // Your path was rideable, so following it needs no checks of its own.
  c.bx+=Math.sin(c.ba)*c.speed*dt;c.bz-=Math.cos(c.ba)*c.speed*dt;
  // Never left behind: fallen far back where you cannot see, they catch up along your path.
  if(T.end-c.sOn>c.lag+40&&!ctx.inView?.(c.bx,c.bz)){const q=T.at(T.end-c.lag-14);c.bx=q.x;c.bz=q.z;c.ba=Math.atan2(q.dx,-q.dz);c.sOn=q.s;c.speed=Math.min(c.speed,pv);c.bikeY=null;}
  cycle(c,dt,vT<c.speed-.3);}
 // Walking after you on foot: stay a step or two behind and to one side.
 function followWalk(c,dt,ctx){const pl=ctx.player;if(!pl.walking){standStill(c,dt,ctx);return;}
  const tx=pl.x-Math.sin(pl.a)*1.4+Math.cos(pl.a)*c.side*1.15,tz=pl.z+Math.cos(pl.a)*1.4+Math.sin(pl.a)*c.side*1.15;
  const dist=Math.hypot(tx-c.px,tz-c.pz),near=Math.hypot(pl.x-c.px,pl.z-c.pz);let v=dist>2.2?1.35:dist>.6?.8:0;if(near<1.1&&dist<1.3)v=0;
  // Too close (you walked into them): a step back out of your way.
  if(near<.85){const k=1.2/(near||1);stepToward(c,dt,ctx,c.px+(c.px-pl.x)*k,c.pz+(c.pz-pl.z)*k,.7);return;}
  stepToward(c,dt,ctx,tx,tz,v);}
 function standStill(c,dt,ctx){c.walkV=damp(c.walkV||0,0,6,dt);standPose(c.tmp,ctx.clock+c.R.phase,{look:footLook(c,ctx)});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-6*dt));feet(c,c.pose);applyPose(c.person,c.pose);}
 function footLook(c,ctx){const at=c.lookAt||(c.lookPlayer||ctx.speaker===c.name||Math.hypot(ctx.eye.x-c.px,ctx.eye.z-c.pz)<6?ctx.eye:null);return at?clamp(-wrap(headingTo(c.px,c.pz,at.x,at.z)-c.pa),-1.3,1.3):0;}
 function stepToward(c,dt,ctx,tx,tz,v){c.walkV=damp(c.walkV||0,v,v>c.walkV?3:6,dt);const want=headingTo(c.px,c.pz,tx,tz),turn=wrap(want-c.pa);if(c.walkV>.05||Math.abs(turn)>.5)c.pa+=clamp(turn,-3*dt,3*dt);
  const step=c.walkV*(Math.abs(turn)>1.2?.3:1)*dt,nx=c.px+Math.sin(c.pa)*step,nz=c.pz-Math.cos(c.pa)*step;if(nav.walkable(nx,nz,{r:.25})){c.px=nx;c.pz=nz;}else if(nav.walkable(nx,c.pz,{r:.25}))c.px=nx;else if(nav.walkable(c.px,nz,{r:.25}))c.pz=nz;
  c.gait+=step/stride(Math.max(c.walkV,.8));const look=footLook(c,ctx);if(c.walkV>.08)walkPose(c.pose,c.gait,Math.max(c.walkV,.8),{look:look*.6});else{standPose(c.tmp,ctx.clock+c.R.phase,{look});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-6*dt));}
  feet(c,c.pose);applyPose(c.person,c.pose);}
 // ---- scripted steps (each returns true when finished) -------------------------------------
 const S={
  wait:t=>{let e=0;return dt=>(e+=dt)>=t;},
  until:fn=>()=>!!fn(),
  act:fn=>()=>{fn();return true;},
  // Ride along world points (from wherever the bike is), easing to vend at the end.
  rideTo(c,pts,{vmax=4.6,vend=0,decel=1.5}={}){let path=null,u=0;return (dt,ctx)=>{if(!path){path=worldPath([[c.bx,c.bz],...pts]);u=0;}
   const remain=path.length-u,kappa=path.curv(u+1.4),v=Math.max(Math.min(.3,remain*2),Math.min(vmax,Math.sqrt(vend*vend+2*decel*Math.max(0,remain-.1)),Math.sqrt(2.3/Math.max(kappa,.02))));
   c.speed+=clamp(v-c.speed,-2.8*dt,1.4*dt);u+=c.speed*dt;const q=path.at(u),prev=c.ba;c.bx=q.x;c.bz=q.z;c.ba+=wrap(q.a-c.ba)*(1-Math.exp(-10*dt));c.omega=wrap(c.ba-prev)/Math.max(dt,1e-3);
   c.effort=damp(c.effort,clamp((v-c.speed)/1.2,0,1),2.5,dt);cycle(c,dt,remain<4&&vend<1);if(remain<.05||(remain<.35&&c.speed<.12)){if(vend<.5)c.speed=0;return true;}};},
  brake(c,t=.5){let e=0;return dt=>{e+=dt;c.speed=Math.max(0,c.speed-3.4*dt);c.omega=0;cycle(c,dt,true);return e>=t&&c.speed<.05;};},
  // Off the bike: the right leg back over the saddle; the hands stay on the bars.
  dismount(c,speed=1.3){const keys=keysFor(c);let e=0;return dt=>{
   if(e===0){c.speed=0;c.px=c.bx;c.pz=c.bz;c.pa=c.ba;c.py=null;scene.attach(c.person.group);c.mode='foot';c.lean=0;c.fall=0;}
   e+=dt*speed;samplePose(c.pose,keys,e);placePerson(c,dt);applyPose(c.person,c.pose);c.posed=true;
   if(e>=keys[keys.length-1][0]){const x0=c.pose[0],z0=c.pose[2],w=toWorld(c.px,c.pz,c.pa,x0,z0);c.px=w.x;c.pz=w.z;for(const o of [P.root,P.lh,P.rh,P.lf,P.rf]){c.pose[o]-=x0;c.pose[o+2]-=z0;}c.holding=true;applyPose(c.person,c.pose);return true;}};},
  // Back on: the same movement the other way round, from beside the bike's left side.
  mount(c,speed=1.3){const keys=keysFor(c),T=keys[keys.length-1][0];let e=0;return dt=>{
   if(e===0){c.bike.group.add(c.person.group);c.person.group.position.set(0,0,0);c.person.group.rotation.set(0,0,0);c.mode='mount';c.kick=0;c.fall=0;c.lean=0;}
   e+=dt*speed;samplePose(c.pose,keys,Math.max(0,T-e));applyPose(c.person,c.pose);c.posed=true;if(e>=T){c.mode='ride';c.astride=1;c.holding=false;c.speed=0;return true;}};},
  drop(c){let e=0,played=false;return dt=>{e+=dt;c.holding=false;const t=clamp(e/.62,0,1);c.fall=-1.36*t*t+(e>.62?.05*Math.sin((e-.62)*18)*Math.exp(-(e-.62)*7):0);c.steer=damp(c.steer,.55,4,dt);
   if(t>=1&&!played){played=true;sfx('bikeDrop',c.bike.group.position,{gain:.7});}return e>=.9;};},
  kickstand(c){let e=0;return dt=>{e+=dt;c.kick=smooth(e/.7);c.lean=.13*smooth((e-.35)/.45);const tap=Math.sin(Math.PI*clamp(e/.7,0,1));c.pose[P.rf]+=(.3-c.pose[P.rf])*tap*.5;c.pose[P.rf+1]=.065+.07*tap;applyPose(c.person,c.pose);c.posed=true;if(e>=.9){c.holding=false;return true;}};},
  // Up off the lawn: crouch, lift it by the bars, stand it up beside you.
  lift(c){let e=0;return dt=>{e+=dt;const down=smooth(e/.35)*(1-smooth((e-.9)/.35));c.fall=-1.36*(1-smooth((e-.3)/.7));standPose(c.pose,e);
   c.pose[P.root+1]-=.25*down;c.pose[P.lean]+=.5*down;for(const o of [P.lh,P.rh]){c.pose[o+1]-=.42*down;c.pose[o+2]-=.18*down;}c.pose[P.rh]+=.25*down;feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;
   if(e>=1.3){c.fall=0;c.holding=true;return true;}};},
  // Walk (or push the bike) along world points.
  walkTo(c,pts,{speed=1.3,push=false,look=null}={}){let path=null,u=0,v=0,e=0;return (dt,ctx)=>{if(!path){path=worldPath([[c.px,c.pz],...pts]);u=0;v=push?.4:.2;copyPose(c.from,c.pose);}e+=dt;
   const remain=path.length-u,target=Math.min(speed,Math.sqrt(2*1.8*Math.max(0,remain))+.15);v+=clamp(target-v,-3*dt,2*dt);
   const q=path.at(u+Math.min(.5,remain));let turn=remain>.05?wrap(q.a-c.pa):0;const max=(push?1.6:3.2)*dt;c.pa+=clamp(turn,-max,max);const slow=Math.abs(turn)>1.2?.35:1,step=v*slow*dt;u+=step;const at=path.at(u);c.px=at.x;c.pz=at.z;
   c.gait+=(step+Math.abs(clamp(turn,-max,max))*.18)/stride(Math.max(v,.8));const lk=look?look(ctx):footLook(c,ctx)*.5;
   if(push){pushPose(c.pose,c.gait,Math.max(v,.8),{look:lk,geom:c.geom});const b=toWorld(c.px,c.pz,c.pa,PUSH_OFFSET.x,PUSH_OFFSET.z);c.bx=b.x;c.bz=b.z;c.ba=c.pa;c.speed=v*slow;c.wheel+=step/c.geom.wheelR;c.steer=damp(c.steer,clamp(turn*.6,-.4,.4),5,dt);c.holding=true;}
   else walkPose(c.pose,c.gait,Math.max(v,.8),{look:lk});
   if(e<.35)blendPose(c.pose,c.from,c.pose,smooth(e/.35));feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;if(remain<.04){if(push)c.speed=0;return true;}};},
  turnTo(c,getA,t=.8){let e=0,start=null;return (dt)=>{if(start===null){start=c.pa;copyPose(c.from,c.pose);}e+=dt;const goal=typeof getA==='function'?getA():getA,diff=wrap(goal-start),prev=c.pa;c.pa=start+diff*smooth(e/t);
   c.gait+=Math.abs(c.pa-prev)*.3;const w=walkPose(c.tmp,c.gait,.8,{}),st=standPose(c.pose,e);blendPose(c.pose,st,w,Math.min(1,Math.abs(diff)*.6)*Math.sin(Math.PI*smooth(e/t)));feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};},
  idle(c,t,{wave=0,gesture=null}={}){let e=0;return (dt,ctx)=>{e+=dt;standPose(c.tmp,ctx.clock+c.R.phase,{look:footLook(c,ctx)});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-8*dt));
   if(wave)addWave(c.pose,e,smooth(e/.35)*(1-smooth((e-(t-.45))/.45))*wave);gesture?.(c.pose,e);feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};},
  // A pebble tossed underhand at a window: crouch for it, wind up, let go (the click comes later).
  pebble(c,target,{onHit=null}={}){let e=0,hit=false;return (dt,ctx)=>{e+=dt;if(e<.05)c.pa+=wrap(headingTo(c.px,c.pz,target.x,target.z)-c.pa);standPose(c.pose,e);
   const dip=Math.sin(Math.PI*clamp(e/.7,0,1));c.pose[P.root+1]-=.28*dip;c.pose[P.lean]+=.45*dip;c.pose[P.rh+1]-=.45*dip;c.pose[P.rh+2]-=.2*dip;
   const sw=clamp((e-.8)/.45,0,1);if(sw>0){c.pose[P.rh]=.2;c.pose[P.rh+1]=.75+.75*Math.sin(sw*Math.PI*.8);c.pose[P.rh+2]=.2-.6*sw;c.pose[P.re]=1;c.pose[P.re+1]=-.3;c.pose[P.re+2]=.3;}
   if(!hit&&e>1.75){hit=true;onHit?.();}feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=2.1;};},
  // Out through a ground-floor window: up onto the sill, legs out, down onto the grass.
  climb(c,win,{onOut=null}={}){let e=0,out=false;const a=headingTo(win.inside.x,win.inside.z,win.outside.x,win.outside.z),T=2.6;const fn=(dt)=>{e+=dt;const u=clamp(e/T,0,1);c.pa=a;
   const inY=win.floorY,sill=win.sill.y,outY=nav.groundY(win.land.x,win.land.z);
   // Along the way out: inside -> the wall (sitting on the sill) -> landed outside.
   const k1=smooth(u/.45),k2=smooth((u-.45)/.55);const x=win.inside.x+(win.wall.x-win.inside.x)*k1+(win.land.x-win.wall.x)*k2,z=win.inside.z+(win.wall.z-win.inside.z)*k1+(win.land.z-win.wall.z)*k2;
   c.px=x;c.pz=z;const base=inY+(sill-inY)*k1+(outY-sill)*k2;c.py=base;c.person.group.position.set(x,base,z);c.person.group.rotation.set(0,-a,0);
   standPose(c.pose,e);const sit=Math.sin(Math.PI*clamp(u,0,1));c.pose[P.root+1]=BODY.stand-(BODY.stand-.12)*sit*.9;c.pose[P.lean]=.05+.25*sit;
   for(const [o,s] of [[P.lf,-1],[P.rf,1]]){c.pose[o]=s*.1;c.pose[o+1]=BODY.ankle+.1*sit;c.pose[o+2]=-.45*sit;}for(const o of [P.lk,P.rk]){c.pose[o+1]=.3*sit;c.pose[o+2]=-1;}
   for(const [o,s] of [[P.lh,-1],[P.rh,1]]){c.pose[o]=s*.3;c.pose[o+1]=c.pose[P.root+1]+.02;c.pose[o+2]=.05;}
   applyPose(c.person,c.pose);c.posed=true;if(!out&&u>.5){out=true;onOut?.();}if(u>=1){c.py=null;return true;}};fn.climbing=true;return fn;},
 };
 // Run a step list for one companion.
 function run(c,steps,{then=null}={}){c.script=steps;c.step=0;c.then=then;c.follow=null;}
 // ---- every frame ----------------------------------------------------------------------------
 function update(dt,ctx){const pl=ctx.player;if(pl.riding)trail.push(pl.bx,pl.bz);
  for(const c of all){if(!c.active)continue;c.posed=false;
   if(c.script){if(c.step<c.script.length){if(c.script[c.step](dt,ctx))c.step++;}if(c.step>=c.script.length){c.script=null;const f=c.then;c.then=null;f?.(c);}}
   else if(c.mode==='ride'&&c.follow==='ride')followRide(c,dt,ctx);
   else if(c.mode==='ride'){c.speed=Math.max(0,c.speed-3*dt);c.omega=0;cycle(c,dt,true);}
   else if(c.mode==='foot'&&c.follow==='walk')followWalk(c,dt,ctx);
   else if(c.mode==='foot'&&!c.posed)standStill(c,dt,ctx);
   if(c.mode==='ride'&&!c.posed)poseRider(c,dt,ctx);
   if(c.spinV>0){c.spin+=c.spinV*dt;c.spinV=Math.max(0,c.spinV-dt*1.6);}
   if(c.bike.group.visible)placeBike(c,dt);if(c.mode==='foot')placePersonIfFree(c,dt);
   if(c.talk>0){c.talk-=dt;}}
 }
 function placePersonIfFree(c,dt){if(c.script&&c.script[c.step]?.climbing)return;placePerson(c,dt);}
 // Bodies and bikes, for the player not to ride or walk through.
 function blockers(){const out=[];for(const c of all){if(!c.active)continue;if(c.bike.group.visible)out.push({x:c.bx,z:c.bz,r:c.mode==='ride'?.55:.5,speed:c.mode==='ride'?c.speed:0});if(c.mode==='foot'&&c.person.group.visible)out.push({x:c.px,z:c.pz,r:.3,speed:0});}return out;}
 // Where each one's head is (for the player's eyes to turn toward whoever is talking).
 function headOf(c){if(c.person.joints.head){c.person.group.updateMatrixWorld(true);return c.person.group.localToWorld(vTmp.copy(c.person.joints.head));}return c.person.group.getWorldPosition(vTmp);}
 reset();
 return {list,all,trail,steps:S,run,update,reset,take,release,putRiding,putFoot,blockers,headOf,placeBike,placePerson,feet};
}
