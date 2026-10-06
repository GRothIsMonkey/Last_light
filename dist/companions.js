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
 const pebble=new THREE.Mesh(new THREE.IcosahedronGeometry(.016,0),new THREE.MeshStandardMaterial({color:0x969187,roughness:1}));scene.add(pebble);pebble.visible=false;
 function reset(){pebble.visible=false;for(const c of all)Object.assign(c,{active:false,boost:1,mode:'ride',follow:null,script:null,step:0,bx:0,bz:0,ba:0,speed:0,omega:0,steer:0,lean:0,fall:0,kick:0,crank:c.R.phase,wheel:0,spin:0,astride:1,stand:0,effort:0,
  bikeY:null,bikePitch:0,px:0,pz:0,pa:0,py:null,gait:0,walkV:0,spinV:0,look:0,lookPitch:0,lookAt:null,lookPlayer:false,holding:false,posed:false,sOn:0,talk:0,glance:2+Math.random()*3,lookT:0,hidden:false,crouch:0,flash:false,slot:0,slotAt:0,formationLag:c.lag,formationSide:c.side,stall:0,unstick:0,wayT:0,waySide:1,poi:null,gaze:null,route:null,routeT:0,turnHold:0,turnDir:0,tight:0});trail.reset();}
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
  Object.assign(c,{mode:'ride',bx:x,bz:z,ba:a,speed,fall:0,kick:0,astride:speed<.3?1:0,holding:false,bikeY:null,crouch:0,stall:0,unstick:0,wayT:0,turnHold:0,turnDir:0});c.bike.group.visible=true;c.person.group.visible=true;placeBike(c,0);}
 function putFoot(c,x,z,a,{bike=null,visible=true}={}){take(c);if(c.person.group.parent!==scene)scene.attach(c.person.group);Object.assign(c,{mode:'foot',px:x,pz:z,pa:a,py:null,holding:false,crouch:0,poi:null,gaze:null,walkV:0,route:null,routeT:0});c.person.group.visible=visible;c.hidden=!visible;
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
  const pv=pl.riding?pl.speed:0;
  if(pv>.8&&ctx.clock>c.slotAt){c.slot=(c.slot+1)%4;c.slotAt=ctx.clock+9+(c.key==='sam'?3:0);}
  const slots=c.key==='jamie'?[[.2,1.5],[-1.1,1.6],[2.6,-1.35],[.5,-1.55]]:[[2.8,-1.5],[.6,-1.65],[-.9,1.7],[2.4,1.5]];
  // Changing sides, a friend drops back and crosses behind you, never across your front wheel.
  // (Tight: the woods at night in Chapter Three; they ride closer in, nearer behind you.)
  const tight=c.tight||0,raw=slots[c.slot],selected=tight?[raw[0]*(1-.35*tight)+.4*tight,raw[1]*(1-.38*tight)]:raw,crossing=Math.sign(c.formationSide)!==Math.sign(selected[1])&&Math.abs(c.formationSide)>.25;
  c.formationLag=damp(c.formationLag,pv>.6?(crossing?Math.max(selected[0],2.8):selected[0]):2.8,1.2,dt);c.formationSide=damp(c.formationSide,crossing&&c.formationLag<2.3?c.formationSide:selected[1],.55,dt);
  const gap=T.end-c.sOn-c.formationLag;let vT=clamp(pv+gap*.5,0,6.6*(c.boost||1));if(gap<.4&&pv<.4)vT=Math.min(vT,Math.max(0,gap*.8));
  const want=vT,fx=Math.sin(c.ba),fz=-Math.cos(c.ba);
  // Ease off behind whatever is in the way. Two friends stopped close together and both turning
  // round to follow you can each be "in front of" the other (the old oak, when you turn and ride
  // off): the one further along the ridden trail goes first (Jamie, if level) and the other waits
  // for him, instead of both waiting for each other forever.
  for(const o of [{x:pl.bx,z:pl.bz,r:.9},...(pl.walking?[{x:pl.x,z:pl.z,r:.5}]:[]),...(ctx.obstacles||[]).map(o=>o.speed>.3?o:{...o,still:true}),...all.filter(q=>q!==c&&q.active).map(q=>({x:q.mode==='ride'?q.bx:q.px,z:q.mode==='ride'?q.bz:q.pz,r:.8,peer:q}))]){
   if(o.peer&&(c.unstick>0||!yieldsTo(c,o.peer)))continue;if(o.still&&c.unstick>0)continue;// (stuck behind a parked thing a while: work out along your line; the sweep below still never enters it)
   const dx=o.x-c.bx,dz=o.z-c.bz,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(ahead>0&&ahead<o.r+2.6&&side<o.r+.5)vT=Math.min(vT,Math.max(0,(ahead-o.r-.8)*1.2));}
  const L=clamp(1.5+.45*c.speed,1.5,3.6),q=T.at(c.sOn+L),q2=T.at(c.sOn+L+6),bend=Math.abs(wrap(Math.atan2(q2.dx,-q2.dz)-Math.atan2(q.dx,-q.dz))),straight=1-smooth(bend/.7);
  // Check the whole wheel corridor, including the next corner, before using a side offset.
  const safe=(x,z,a)=>[-.54,0,.54].every(k=>nav.rideable(x+Math.sin(a)*k,z-Math.cos(a)*k,{r:.38}));
  // A side slot next to something parked (a car at the curb) is not a slot: ride your line past it instead (you got by).
  const clear=(x,z)=>!(ctx.obstacles||[]).some(o=>!(o.speed>.3)&&Math.hypot(o.x-x,o.z-z)<o.r+.65);
  const off=c.unstick>0?0:c.formationSide*straight;let tx=q.x-q.dz*off,tz=q.z+q.dx*off;
  // Close and on a straight: a slot relative to the player's heading lets a friend ride beside
  // or briefly ahead. At turns or obstacles we return to the actual ridden trail.
  if(pv>.6&&straight>.85&&Math.hypot(c.bx-pl.bx,c.bz-pl.bz)<10){const h=pl.a,lag=c.formationLag,ax=pl.bx-Math.sin(h)*lag+Math.cos(h)*off,az=pl.bz+Math.cos(h)*lag+Math.sin(h)*off;
   const corridor=[0,.25,.5,.75,1].every(t=>safe(c.bx+(ax-c.bx)*t,c.bz+(az-c.bz)*t,h)&&clear(c.bx+(ax-c.bx)*t,c.bz+(az-c.bz)*t));if(corridor&&safe(ax+Math.sin(h)*2,az-Math.cos(h)*2,h)&&clear(ax+Math.sin(h)*2,az-Math.cos(h)*2)){tx=ax+Math.sin(h)*1.5;tz=az-Math.cos(h)*1.5;const along=(ax-c.bx)*Math.sin(h)-(az-c.bz)*Math.cos(h);vT=clamp(pv+along*.65,0,6.5*(c.boost||1));}}
  const qa=Math.atan2(q.dx,-q.dz);if(!safe(tx,tz,qa)||!clear(tx,tz)||!safe(q2.x-q2.dz*off,q2.z+q2.dx*off,Math.atan2(q2.dx,-q2.dz))||!clear(q2.x-q2.dz*off,q2.z+q2.dx*off))tx=q.x,tz=q.z;
  const err=wrap(headingTo(c.bx,c.bz,tx,tz)-c.ba);
  if(c.speed<.6&&Math.abs(err)>1.2&&Math.hypot(tx-c.bx,tz-c.bz)>.8){c.omega=Math.sign(err)*1.5;vT=Math.min(vT,.15);}// a foot down, the bike walked round
  else c.omega=damp(c.omega,clamp(err*2.4,-(c.speed/1.7+.25),c.speed/1.7+.25),8,dt);
  // Nowhere to go: stand still. Held up while still wanting to go on: keep walking the bike
  // round toward the way on (never freeze facing whoever is in the way).
  // You have turned your bike round while stopped: we turn ours round too, feet down, so we are
  // ready to go the way you are facing (instead of starting to turn only once you ride off).
  if(vT<.05&&c.speed<.1){const off=wrap(pl.a-c.ba),near=Math.hypot(pl.bx-c.bx,pl.bz-c.bz)<9,stopped=pl.riding&&pv<.3&&near;
   c.turnHold=stopped&&(Math.abs(off)>1.4||(c.turnHold>.7&&Math.abs(off)>.35))?(c.turnHold||0)+dt:0;
   // Round by your side (the way you will ride past), not away from you.
   if(c.turnHold>.7&&!c.turnDir)c.turnDir=Math.sign(wrap(headingTo(c.bx,c.bz,pl.bx,pl.bz)-c.ba))||1;if(c.turnHold<=.7)c.turnDir=0;
   c.omega=want>.3&&Math.abs(err)>.06?Math.sign(err)*Math.min(1.5,Math.abs(err)*2.4):c.turnHold>.7?c.turnDir*1.2:0;}
  else{c.turnHold=0;c.turnDir=0;}
  c.ba+=c.omega*dt;c.effort=damp(c.effort,clamp((vT-c.speed)/1.2,0,1),2.5,dt);c.speed+=clamp(vT-c.speed,-3.2*dt,1.5*dt*(c.boost||1));c.speed=Math.max(0,c.speed);
  // You are pushing your bike at me and I am standing in its way: feet down, I shuffle my bike
  // sideways out of your line (instead of each of us waiting for the other).
  {const pfx=Math.sin(pl.a),pfz=-Math.cos(pl.a),ox=c.bx-pl.bx,oz=c.bz-pl.bz,pa=ox*pfx+oz*pfz,ps=ox*Math.cos(pl.a)+oz*Math.sin(pl.a);// ahead of you, and to your right
   if(pl.riding&&pl.pushing&&pl.speed<1.2&&c.speed<.8&&pa>-.4&&pa<3.4&&Math.abs(ps)<1.4){const room=sg=>{const h=pl.a+sg*Math.PI/2,x=c.bx+Math.sin(h)*.6,z=c.bz-Math.cos(h)*.6;return nav.rideable(x,z,{r:.3});};
    let sg=Math.abs(ps)>.15?Math.sign(ps):(c.key==='jamie'?1:-1);if(!room(sg)&&room(-sg))sg=-sg;c.wayT=.6;c.waySide=sg;}}
  if(c.wayT>0){c.wayT-=dt;const h=pl.a+c.waySide*Math.PI/2,step=.55*dt,x=c.bx+Math.sin(h)*step,z=c.bz-Math.cos(h)*step;
   if(nav.rideable(x,z,{r:.3})&&!all.some(q=>q!==c&&q.active&&Math.hypot((q.mode==='ride'?q.bx:q.px)-x,(q.mode==='ride'?q.bz:q.pz)-z)<.9)){c.bx=x;c.bz=z;}c.speed=Math.min(c.speed,.1);c.omega=0;cycle(c,dt,true);return;}
  // Sweep both wheels. If an offset clips a fence or a curb corner, slide toward the
  // actual trail instead of letting the bicycle enter a non-rideable patch.
  const x0=c.bx,z0=c.bz,nx=c.bx+Math.sin(c.ba)*c.speed*dt,nz=c.bz-Math.cos(c.ba)*c.speed*dt;
  const peers=[{x:pl.bx,z:pl.bz,r:.95},...(ctx.obstacles||[]),...all.filter(q=>q!==c&&q.active).map(q=>({x:q.mode==='ride'?q.bx:q.px,z:q.mode==='ride'?q.bz:q.pz,r:.85}))];const open=(x,z)=>!peers.some(o=>{const d=Math.hypot(o.x-x,o.z-z);return d<o.r+.35&&d<Math.hypot(o.x-c.bx,o.z-c.bz);});
  // Already partly off the rideable edge (turning in place can swing a wheel over a lawn edge):
  // any step that keeps the bike's middle on rideable ground is allowed, so it can work its way back.
  // On your own line (narrow places you rode through, like the ring of sidewalk round the
  // cul-de-sac) the rule is the one your bike rides by: its middle on rideable ground.
  const onLine=(x,z)=>{const n=T.nearest(x,z,c.sOn-3,c.sOn+8);return !!n&&n.dist<.6&&nav.rideable(x,z,{r:.3});};
  const here=safe(c.bx,c.bz,c.ba),pass=(x,z,a)=>here?safe(x,z,a)||onLine(x,z):nav.rideable(x,z,{r:.3});
  if(pass(nx,nz,c.ba)&&open(nx,nz)){c.bx=nx;c.bz=nz;}
  else{const center=T.at(c.sOn+Math.max(.45,c.speed*dt)),a=headingTo(c.bx,c.bz,center.x,center.z),sx=c.bx+Math.sin(a)*c.speed*dt,sz=c.bz-Math.cos(a)*c.speed*dt;
   if(pass(sx,sz,a)&&open(sx,sz)){c.bx=sx;c.bz=sz;c.ba+=wrap(a-c.ba)*(1-Math.exp(-5*dt));}
   else{// Curve round whoever is in the way, the clear way nearest to where he is going; stuck a
    // while, walk the bike out of it slowly, even back the way he came.
    const reach=c.unstick>0?10:4,aim=headingTo(c.bx,c.bz,tx,tz),ways=[];for(let k=1;k<=reach;k++)for(const sg of [1,-1])ways.push(c.ba+sg*k*.3);ways.sort((p,q)=>Math.abs(wrap(p-aim))-Math.abs(wrap(q-aim)));
    let moved=false;for(const h of ways){const v=Math.min(Math.max(c.speed,.35),Math.abs(wrap(h-c.ba))>.35?1.5:9)*dt,x=c.bx+Math.sin(h)*v,z=c.bz-Math.cos(h)*v;if(pass(x,z,h)&&open(x,z)){c.bx=x;c.bz=z;c.ba+=wrap(h-c.ba)*(1-Math.exp(-4*dt));moved=true;break;}}
    if(!moved)c.speed=Math.max(0,c.speed-5*dt);}}
  // Wanting to go on but not getting anywhere for a couple of seconds: stop deferring to the
  // other friend and walk out of the tight spot. Movement stays continuous; nobody is moved.
  if(want>.6&&Math.hypot(c.bx-x0,c.bz-z0)<.1*dt)c.stall+=dt;else c.stall=Math.max(0,c.stall-2*dt);
  if(c.stall>2){c.stall=0;c.unstick=2.5;}c.unstick=Math.max(0,c.unstick-dt);
  // Catch-up is continuous at the bounded riding speed; no position reset.
  cycle(c,dt,vT<c.speed-.3);}
 // Who waits when two friends are in each other's way: the one behind on the ridden trail
 // (Sam, if they are level). A friend who is not following (on foot, in a scripted moment) is
 // always waited for.
 function yieldsTo(c,q){if(q.mode!=='ride'||q.follow!=='ride'||q.script)return true;if(Math.abs((q.sOn||0)-(c.sOn||0))>.3)return q.sOn>c.sOn;return c.key==='sam';}
 // Walking after you on foot: stay a step or two behind and to one side.
 function followWalk(c,dt,ctx,loose=null){const pl=ctx.player;if(!pl.walking){standStill(c,dt,ctx);return;}
  const slot=Math.floor((ctx.clock+(c.key==='sam'?6:0))/(loose?9:11))%4,slots=loose||(c.key==='sam'?[[.4,-1.5],[-.7,-1.4],[1.7,1.5],[.3,1.55]]:[[.2,1.5],[1.8,1.3],[-.6,-1.4],[.3,-1.5]]);
  const [lag,side]=slots[slot];c.formationLag=damp(c.formationLag,lag,.7,dt);c.formationSide=damp(c.formationSide,side,.5,dt);
  const tx=pl.x-Math.sin(pl.a)*c.formationLag+Math.cos(pl.a)*c.formationSide,tz=pl.z+Math.cos(pl.a)*c.formationLag+Math.sin(pl.a)*c.formationSide;
  const dist=Math.hypot(tx-c.px,tz-c.pz),near=Math.hypot(pl.x-c.px,pl.z-c.pz);let v=dist>2.2?Math.min(3,Math.max(1.9,pl.speed+.3)):dist>.65?Math.min(1.5,dist):0;if(near<1.1&&dist<1.3)v=0;
  // Too close (you walked into them): a step back out of your way.
  if(near<.85){const k=1.2/(near||1);stepToward(c,dt,ctx,c.px+(c.px-pl.x)*k,c.pz+(c.pz-pl.z)*k,.7);return;}
  const [rx,rz]=routeTo(c,dt,tx,tz,pl);stepToward(c,dt,ctx,rx,rz,v);}
 // Where a straight line does not reach (round a fence end, through a gap in a fence, past a wall):
 // a short walking path, refreshed now and then, and the next point on it is what a step aims at.
 // In the open the straight line is used, as before.
 function lineClear(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.35);for(let i=1;i<=n;i++)if(!nav.walkable(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,{r:.26}))return false;return true;}
 function routeTo(c,dt,tx,tz,pl){c.routeT=(c.routeT||0)-dt;
  if(c.routeT<=0){c.routeT=.35;
   // A spot nobody can stand on (inside a hedge, past a fence): aim at where you are instead.
   if(!nav.walkable(tx,tz,{r:.26})){tx=pl.x;tz=pl.z;}
   if(lineClear(c.px,c.pz,tx,tz))c.route=null;
   else if(!c.route||Math.hypot(c.route.goal[0]-tx,c.route.goal[1]-tz)>1.2||c.route.age>2.5){const path=nav.walkPath({x:c.px,z:c.pz},{x:tx,z:tz});c.route=path.length?{pts:path,goal:[tx,tz],age:0}:null;}}
  if(!c.route)return [tx,tz];c.route.age+=dt;const pts=c.route.pts;while(pts.length>1&&Math.hypot(pts[0][0]-c.px,pts[0][1]-c.pz)<.45)pts.shift();return pts[0];}
 // Searching together on foot (Chapter Two): looser than walking after you. Jamie is often a step
 // ahead along the way you face, Sam more often a step behind; they cross to your other side now and
 // then, and stop to bend over whatever catches their eye (the chapter says what, and when).
 const LOOSE={jamie:[[-1.7,1.3],[.2,1.6],[-1.2,-1.5],[1.1,1.4]],sam:[[1.6,-1.4],[.6,-1.7],[2.1,1.2],[.3,1.7]]};
 function followSearch(c,dt,ctx){if(!c.poi){const q=ctx.poi?.(c);if(q)c.poi={...q,t:0};}
  if(c.poi){const q=c.poi,away=Math.hypot(q.x-c.px,q.z-c.pz);c.gaze=q;
   // Where to stand: across it from you if there is ground there (so you see both it and them), else beside it.
   if(!q.at){const a0=headingTo(ctx.player.x,ctx.player.z,q.x,q.z);for(const d of [0,.6,-.6,1.2,-1.2,Math.PI/2,-Math.PI/2,Math.PI]){const a=a0+d,x=q.x+Math.sin(a)*q.stand,z=q.z-Math.cos(a)*q.stand;if(nav.walkable(x,z,{r:.3})){q.at={x,z};break;}}q.at??={x:c.px,z:c.pz};}
   const there=Math.hypot(q.at.x-c.px,q.at.z-c.pz);
   if(q.t===0&&there>.35){if(away>13){c.poi=null;c.gaze=null;}else{const [rx,rz]=routeTo(c,dt,q.at.x,q.at.z,ctx.player);stepToward(c,dt,ctx,rx,rz,Math.min(1.5,there+.3));}
    return;}
   // Turn to face it while bending down.
   if(q.t<.6)c.pa+=wrap(headingTo(c.px,c.pz,q.x,q.z)-c.pa)*Math.min(1,dt*6);
   q.t+=dt;const bend=smooth(q.t/.6)*(1-smooth((q.t-q.time+.6)/.6));standPose(c.tmp,ctx.clock+c.R.phase,{look:footLook(c,ctx)});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-6*dt));
   // Bent over it, hands down toward it (one holding the light), as in lifting a bike off the lawn.
   c.pose[P.root+1]-=.3*bend;c.pose[P.lean]+=.8*bend;c.pose[P.hy]=-.22*bend;for(const o of [P.lh,P.rh]){c.pose[o+1]-=.4*bend;c.pose[o+2]-=.24*bend;}c.walkV=0;feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;
   if(q.t>=q.time){q.done?.();c.poi=null;c.gaze=null;}return;}
  followWalk(c,dt,ctx,LOOSE[c.key]||LOOSE.jamie);}
 function standStill(c,dt,ctx){c.walkV=damp(c.walkV||0,0,6,dt);standPose(c.tmp,ctx.clock+c.R.phase,{look:footLook(c,ctx)});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-6*dt));feet(c,c.pose);applyPose(c.person,c.pose);}
 function footLook(c,ctx){const at=c.gaze||c.lookAt||(c.lookPlayer||ctx.speaker===c.name||Math.hypot(ctx.eye.x-c.px,ctx.eye.z-c.pz)<6?ctx.eye:null);return at?clamp(-wrap(headingTo(c.px,c.pz,at.x,at.z)-c.pa),-1.3,1.3):0;}
 function stepToward(c,dt,ctx,tx,tz,v){c.walkV=damp(c.walkV||0,v,v>c.walkV?3:6,dt);const want=headingTo(c.px,c.pz,tx,tz),turn=wrap(want-c.pa);if(c.walkV>.05||Math.abs(turn)>.5)c.pa+=clamp(turn,-3*dt,3*dt);
  const step=c.walkV*(Math.abs(turn)>1.2?.3:1)*dt,nx=c.px+Math.sin(c.pa)*step,nz=c.pz-Math.cos(c.pa)*step;const oldX=c.px,oldZ=c.pz,peers=[{x:ctx.player.x,z:ctx.player.z,r:.7},...(ctx.obstacles||[]),...all.filter(q=>q!==c&&q.active&&q.mode==='foot').map(q=>({x:q.px,z:q.pz,r:.7}))],free=(x,z)=>nav.walkable(x,z,{r:.28})&&!peers.some(o=>Math.hypot(o.x-x,o.z-z)<o.r&&Math.hypot(o.x-x,o.z-z)<Math.hypot(o.x-c.px,o.z-c.pz));
  // Blocked: a step to either side, then (pressed against a parked car or a fence end) a step along it.
  if(free(nx,nz)){c.px=nx;c.pz=nz;}else{let moved=false;for(const off of [.6,-.6,1,-1,1.6,-1.6]){const a=c.pa+off,x=c.px+Math.sin(a)*step,z=c.pz-Math.cos(a)*step;if(free(x,z)){c.px=x;c.pz=z;moved=true;break;}}if(!moved)c.walkV=0;}
  c.gait+=Math.hypot(c.px-oldX,c.pz-oldZ)/stride(Math.max(c.walkV,.8));const look=footLook(c,ctx);if(c.walkV>.08)walkPose(c.pose,c.gait,Math.max(c.walkV,.8),{look:look*.6});else{standPose(c.tmp,ctx.clock+c.R.phase,{look});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-6*dt));}
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
  lift(c){let e=0;const target=new THREE.Vector3();return dt=>{e+=dt;const lift=smooth((e-.52)/1.05),down=smooth(e/.5)*(1-smooth((e-1.15)/.65));c.fall=-1.36*(1-lift);c.steer=.35*(1-lift);placeBike(c,0);standPose(c.pose,e);
   c.pose[P.root+1]-=.29*down;c.pose[P.lean]+=.86*down;c.pose[P.hy]=-.25*down;placePerson(c,0);c.person.group.updateMatrixWorld(true);c.bike.group.updateMatrixWorld(true);
   const reach=smooth(e/.48)*(1-smooth((e-1.68)/.38));
   for(const [o,pt] of [[P.lh,[c.geom.grip[0],c.geom.grip[1],c.geom.grip[2]]],[P.rh,[0,c.geom.saddle[1],c.geom.saddle[2]]]]){
    target.set(...pt).applyMatrix4(c.bike.group.matrixWorld);c.person.group.worldToLocal(target);for(let k=0;k<3;k++)c.pose[o+k]+=(target.getComponent(k)-c.pose[o+k])*reach;}
   feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;
   if(e>=2.06){c.fall=0;c.holding=false;c.kick=1;return true;}};},
  // Walk (or push the bike) along world points.
  walkTo(c,pts,{speed=1.3,push=false,look=null}={}){let path=null,u=0,v=0,e=0;return (dt,ctx)=>{if(!path){path=worldPath([[c.px,c.pz],...pts]);u=0;v=push?.4:.2;copyPose(c.from,c.pose);}e+=dt;
   const remain=path.length-u,target=Math.min(speed,Math.sqrt(2*1.8*Math.max(0,remain))+.15);v+=clamp(target-v,-3*dt,2*dt);
   const q=path.at(u+Math.min(.5,remain));let turn=remain>.05?wrap(q.a-c.pa):0;const max=(push?1.6:3.2)*dt;c.pa+=clamp(turn,-max,max);const slow=Math.abs(turn)>1.2?.35:1,step=v*slow*dt;u+=step;const at=path.at(u);c.px=at.x;c.pz=at.z;
   c.gait+=(step+Math.abs(clamp(turn,-max,max))*.18)/stride(Math.max(v,.8));const lk=look?look(ctx):footLook(c,ctx)*.5;
   if(push){pushPose(c.pose,c.gait,Math.max(v,.8),{look:lk,geom:c.geom});const b=toWorld(c.px,c.pz,c.pa,PUSH_OFFSET.x,PUSH_OFFSET.z);c.bx=b.x;c.bz=b.z;c.ba=c.pa;c.speed=v*slow;c.wheel+=step/c.geom.wheelR;c.steer=damp(c.steer,clamp(turn*.6,-.4,.4),5,dt);c.holding=true;}
   else walkPose(c.pose,c.gait,Math.max(v,.8),{look:lk});
   if(e<.35)blendPose(c.pose,c.from,c.pose,smooth(e/.35));feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;if(remain<.04){if(push)c.speed=0;return true;}};},
  // Walk (or run) toward a target the chapter moves every frame: {x, z, v? (pace), max?, look?, face?};
  // null ends the step. Without a pace they keep up with it; arrived, they stand, turn to face where it
  // says and look where it says.
  toward(c,get){return (dt,ctx)=>{const q=get(ctx);if(!q)return true;c.gaze=q.look||null;const d=Math.hypot(q.x-c.px,q.z-c.pz);
   // You walked into them: a step back out of your way first (as when following).
   // (only when you are walking into them, in front of you: they sidestep off your line, not back into your way)
   {const pl=ctx.player,dx=c.px-pl.x,dz=c.pz-pl.z,near=Math.hypot(dx,dz),fx=Math.sin(pl.a),fz=-Math.cos(pl.a),ahead=dx*fx+dz*fz,side=dx*Math.cos(pl.a)+dz*Math.sin(pl.a);
    if(pl.walking&&(pl.speed||0)>.3&&near<.85&&ahead>.05&&Math.abs(side)<.55){const sg=Math.sign(side)||(c.key==='sam'?-1:1),h=pl.a+sg*Math.PI/2;stepToward(c,dt,ctx,c.px+Math.sin(h)*1.2,c.pz-Math.cos(h)*1.2,1);c.posed=true;return false;}}
   const v=q.v!==undefined?(d>.3?q.v:0):d>2.5?Math.min(q.max||3.2,1.5+d*.4):d>.4?Math.min(1.4,d+.25):0;
   if(v<=0){if(q.face!==undefined)c.pa+=clamp(wrap(q.face-c.pa),-3*dt*(q.turn||1),3*dt*(q.turn||1));standStill(c,dt,ctx);}
   else{const [rx,rz]=routeTo(c,dt,q.x,q.z,ctx.player);stepToward(c,dt,ctx,rx,rz,v);}// (round walls and fence ends by a short path, as when following)
   // (a gesture is drawn over the pose, never kept in it: next frame starts from the plain pose again)
   if(q.gesture){copyPose(c.tmp,c.pose);q.gesture(c.tmp,ctx);feet(c,c.tmp);applyPose(c.person,c.tmp);}c.posed=true;return false;};},
  turnTo(c,getA,t=.8){let e=0,start=null;return (dt)=>{if(start===null){start=c.pa;copyPose(c.from,c.pose);}e+=dt;const goal=typeof getA==='function'?getA():getA,diff=wrap(goal-start),prev=c.pa;c.pa=start+diff*smooth(e/t);
   c.gait+=Math.abs(c.pa-prev)*.3;const w=walkPose(c.tmp,c.gait,.8,{}),st=standPose(c.pose,e);blendPose(c.pose,st,w,Math.min(1,Math.abs(diff)*.6)*Math.sin(Math.PI*smooth(e/t)));feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};},
  idle(c,t,{wave=0,gesture=null}={}){let e=0;return (dt,ctx)=>{e+=dt;standPose(c.tmp,ctx.clock+c.R.phase,{look:footLook(c,ctx)});blendPose(c.pose,c.pose,c.tmp,1-Math.exp(-8*dt));
   if(wave)addWave(c.pose,e,smooth(e/.35)*(1-smooth((e-(t-.45))/.45))*wave);gesture?.(c.pose,e);feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};},
  // A pebble tossed underhand at a window: crouch for it, wind up, let go (the click comes later).
  pebble(c,target,{onHit=null}={}){let e=0,hit=false,start=null;return (dt,ctx)=>{e+=dt;if(e<.05)c.pa+=wrap(headingTo(c.px,c.pz,target.x,target.z)-c.pa);standPose(c.pose,e);
   const dip=Math.sin(Math.PI*clamp(e/.7,0,1));c.pose[P.root+1]-=.28*dip;c.pose[P.lean]+=.45*dip;c.pose[P.rh+1]-=.45*dip;c.pose[P.rh+2]-=.2*dip;
   const sw=clamp((e-.8)/.45,0,1);if(sw>0){c.pose[P.rh]=.2;c.pose[P.rh+1]=.75+.75*Math.sin(sw*Math.PI*.8);c.pose[P.rh+2]=.2-.6*sw;c.pose[P.re]=1;c.pose[P.re+1]=-.3;c.pose[P.re+2]=.3;}
   if(e>=1.05&&e<1.75){if(!start){c.person.group.updateMatrixWorld(true);start=c.person.parts.rhand.getWorldPosition(new THREE.Vector3());}const u=clamp((e-1.05)/.7,0,1);pebble.visible=true;pebble.position.lerpVectors(start,target,u);pebble.position.y+=.42*4*u*(1-u);}if(!hit&&e>1.75){hit=true;pebble.visible=false;onHit?.();}feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=2.1;};},
  // Out through a ground-floor window: up onto the sill, legs out, down onto the grass.
  climb(c,win,{onOut=null}={}){let e=0,out=false;const a=headingTo(win.inside.x,win.inside.z,win.outside.x,win.outside.z),T=3.8,scale=c.person.scale||1;
   const floor=win.floorY,ground=nav.groundY(win.land.x,win.land.z),sill=win.sill.y,keys=[];
   // The upper body ducks through the actual half-window opening. One foot clears first,
   // then the other; hands remain on the sill until the controlled drop.
   const key=(t,rootY,lean,lfY,lfZ,rfY,rfZ)=>{const p=newPose();p[P.root+1]=(rootY-ground)/scale;p[P.lean]=lean;p[P.hp]=.12;
    for(const [o,s,y,z] of [[P.lf,-1,lfY,lfZ],[P.rf,1,rfY,rfZ]]){p[o]=s*.13;p[o+1]=(y-ground)/scale;p[o+2]=z;}
    p[P.lk+2]=p[P.rk+2]=-1;keys.push([t,p]);};
   key(0,floor+BODY.stand,.05,floor+.065,0,floor+.065,0);
   key(.55,floor+.52,.8,floor+.065,-.05,floor+.065,.2);
   key(1.35,sill+.085,1.12,sill+.075,-.37,floor+.12,.24);
   key(2.05,sill+.07,1.12,sill+.065,-.37,sill+.065,-.06);
   key(2.5,sill+.12,.85,sill+.02,-.24,sill+.025,-.08);
   key(2.95,ground+.57,.5,ground+.065,-.09,ground+.065,.06);
   key(T,ground+BODY.stand,.04,ground+.065,0,ground+.065,0);
   const fn=dt=>{e+=dt;const approach=smooth(e/1.3),exit=smooth((e-2.05)/.9),wx=win.wall.x+Math.sin(a)*.09,wz=win.wall.z-Math.cos(a)*.09;
    c.px=win.inside.x+(wx-win.inside.x)*approach+(win.land.x-wx)*exit;c.pz=win.inside.z+(wz-win.inside.z)*approach+(win.land.z-wz)*exit;c.pa=a;c.py=ground;
    c.person.group.position.set(c.px,ground,c.pz);c.person.group.rotation.set(0,-a,0);samplePose(c.pose,keys,e);
    const hold=smooth(e/.5)*(1-smooth((e-2.35)/.3));for(const [o,s] of [[P.lh,-1],[P.rh,1]]){const dx=win.sill.x+Math.cos(a)*s*.27-c.px,dz=win.sill.z+Math.sin(a)*s*.27-c.pz;
     const hand=[(dx*Math.cos(a)+dz*Math.sin(a))/scale,(sill+.048-ground)/scale,(-dx*Math.sin(a)+dz*Math.cos(a))/scale];for(let k=0;k<3;k++)c.pose[o+k]+=(hand[k]-c.pose[o+k])*hold;}
    c.pose[P.hy]=e<.7?Math.sin(e*7)*.22:0;applyPose(c.person,c.pose);c.posed=true;c.climbTime=e;
    if(!out&&e>2.35){out=true;onOut?.();}if(e>=T){c.py=null;c.climbTime=null;return true;}};fn.climbing=true;return fn;},
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
   else if(c.mode==='foot'&&c.follow==='search')followSearch(c,dt,ctx);
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
