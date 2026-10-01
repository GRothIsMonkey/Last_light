// Friends ride with the player as independent riders, then each goes home in
// a small readable sequence: ride in, stop, get off, deal with the bike, walk inside.
import * as THREE from './three.module.js';
import {createPerson,blinkPerson,createBike,newPose,ridePose,walkPose,standPose,addWave,dismountKeys,samplePose,blendPose,copyPose,applyPose,poseBike,pushPose,PUSH_OFFSET,P,smooth,stride} from './rig.js';
import {groundPoint,heading,roadFrame} from './route.js';
import {CAST,FORMATION} from './cast.js';
import {seeded,hashSeed} from './kit.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const RAD_PER_M=1.25,SPRINT=6.3;
// Street-frame helpers: psi is yaw relative to the road (0 = along the ride, +pi/2 = toward +lateral).
export function localToStreet(psi,x,z){const c=Math.cos(psi),s=Math.sin(psi);return {dd:-z*c-x*s,dl:-z*s+x*c};}
function wrapAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}

// Formation keys ([player distance, lead, lateral]) and departure points live in cast.js.
const ORDER=['jamie','sam','alex'];
function formation(keys,D){if(D<=keys[0][0])return [keys[0][1],keys[0][2]];for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(D<b[0]){const t=smooth((D-a[0])/(b[0]-a[0]));return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}}const l=keys[keys.length-1];return [l[1],l[2]];}

// A path through street-coordinate control points, measured in world meters.
function makePath(ctrl){const pts=[];for(let i=0;i<ctrl.length-1;i++){const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(ctrl.length-1,i+2)];
  for(let k=0;k<12;k++){const t=k/12,t2=t*t,t3=t2*t;const f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);pts.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 pts.push(ctrl[ctrl.length-1]);const s=[0];let prev=groundPoint(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++){const q=groundPoint(pts[i][0],pts[i][1]);s.push(s[i-1]+Math.hypot(q.x-prev.x,q.z-prev.z));prev=q;}
 const length=s[s.length-1];
 const at=(u)=>{u=clamp(u,0,length);let i=1;while(i<s.length-1&&s[i]<u)i++;const t=(u-s[i-1])/((s[i]-s[i-1])||1);const a=pts[i-1],b=pts[i];return {d:a[0]+(b[0]-a[0])*t,lat:a[1]+(b[1]-a[1])*t,psi:Math.atan2(b[1]-a[1],b[0]-a[0])};};
 const curv=(u)=>{const a=at(u-.6),b=at(u+.6);return Math.abs(wrapAngle(b.psi-a.psi))/1.2;};
 return {length,at,curv};
}

export function createFriends(scene,world,hooks={}){
 const sfx=hooks.sfx||(()=>{}),bell=hooks.bell||(()=>{});
 // Jamie's mother comes out a little before he says goodbye.
 const MOM_AT=FORMATION.jamie.leaveAt-15;
 const list=ORDER.map((key,slot)=>{const c=CAST[key],bike=createBike(c.bike),person=createPerson(c);scene.add(bike.group);bike.group.add(person.group);
  return {...FORMATION[key],key,name:c.name,cast:c,R:c.ride,slot,bike,person,pose:newPose(),tmp:newPose(),from:newPose(),rest:newPose(),home:world.homes[key]};});
 // Jamie's mother comes to the door; she is a small part of the scene, not a character.
 const mom={person:createPerson(CAST.mom),pose:newPose()};scene.add(mom.person.group);
 const tmpV=new THREE.Vector3();

 function placeBike(f){const b=f.bike,fw=localToStreet(f.bpsi,0,-.5);
  const yF=world.groundY(f.bd+fw.dd,f.blat+fw.dl),yR=world.groundY(f.bd-fw.dd,f.blat-fw.dl),p=groundPoint(f.bd,f.blat);
  b.group.position.set(p.x,(yF+yR)/2,p.z);b.group.rotation.set(Math.atan2(yF-yR,1),-(heading(f.bd)+f.bpsi),f.lean+f.fall,'YXZ');
  b.wheel=f.wheel;b.crankAngle=f.crank;b.steerAngle=f.steer;b.kickstand=f.kick;poseBike(b);b.frontWheel.rotation.x=-f.wheel-f.spin;}
 function placePerson(f,dt){const g=f.person.group,p=groundPoint(f.pd,f.plat);const gy=world.groundY(f.pd,f.plat);f.py=f.py===null?gy:damp(f.py,gy,14,dt);
  g.position.set(p.x,f.py,p.z);g.rotation.set(0,-(heading(f.pd)+f.ppsi),0);}
 // Adjust walking feet for steps and slopes relative to the ground under the pelvis.
 function footGround(f,pose){for(const o of [P.lf,P.rf]){const s=localToStreet(f.ppsi,pose[o],pose[o+2]);const y=world.groundY(f.pd+s.dd,f.plat+s.dl)-f.py;pose[o+1]+=clamp(y,-.3,.5);}}
 function lookAt(f,d,lat,psi,wx,wz){const p=groundPoint(d,lat),yaw=heading(d)+psi;const dx=wx-p.x,dz=wz-p.z;const target=Math.atan2(dx,-dz);return clamp(wrapAngle(-(target-yaw)),-1.25,1.25);}

 function reset(){
  for(const f of list){const rand=seeded(hashSeed(21,f.slot));Object.assign(f,{d:f.keys[0][1],lat:f.keys[0][2],speed:0,latVel:0,crank:f.R.phase,wheel:0,steer:0,lean:0,fall:0,kick:0,spin:0,spinV:0,psi:0,mode:'ride',astride:1,stand:0,look:0,lookT:0,
    bd:0,blat:0,bpsi:0,pd:0,plat:0,ppsi:0,py:null,gait:0,script:null,step:0,prevYaw:null,inside:false,glance:1+rand()*4,garageClosing:false,windowOn:false,holding:false,waved:false,posed:false,
    rand,seen:0,yield:0,effort:0,standHold:0,standWait:0,standDelay:.2+rand()*2.8,standRest:.4+rand()*1.6,rock:0,bellLook:0,weaveA:rand()*6.3,weaveB:rand()*6.3,gone:false,homeward:false,external:false,waveW:0,rang:false});
   f.bd=f.d;f.blat=f.lat;if(f.person.group.parent!==f.bike.group){f.bike.group.add(f.person.group);}f.person.group.position.set(0,0,0);f.person.group.rotation.set(0,0,0);
   f.person.group.visible=true;f.bike.group.visible=true;}
  Object.assign(mom,{mode:'waiting',t:0,pd:0,plat:0,ppsi:0,py:null,gait:0,look:0,slammed:false,closeT:0,u:0});mom.person.group.visible=false;
  world.doors.jamie.set(0);world.doors.alex.set(0);world.garages.sam.set(1);world.garages.alex?.set(0);world.alexWindow.emissiveIntensity=0;
 }

 // Group riding -----------------------------------------------------------------------
 // Each friend reads your speed with their own lag, has their own gear and legs, stands
 // up on the pedals on their own schedule and drifts in their own line. While you push
 // ahead they gradually let you lead; when you ease off they re-form around you.
 function ride(f,dt,ctx){
  const R=f.R,D=ctx.distance,[lead0,latKey]=formation(f.keys,D);
  f.seen=damp(f.seen,ctx.speed,1/Math.max(.2,R.reaction),dt);
  f.yield=damp(f.yield,ctx.push>.4?1:0,ctx.push>.4?.3:.1,dt);
  const lead=lead0+(-1.2-f.slot*1.6-lead0)*f.yield,gap=D+lead-f.d;
  let latT=latKey+R.weave*(.13*Math.sin(ctx.clock*.29+f.weaveA)+.06*Math.sin(ctx.clock*.71+f.weaveB));
  const stopped=ctx.speed<.35&&ctx.state!=='intro';
  let vCmd=f.seen+clamp(gap*.42,-2.2,2.3);if(stopped)vCmd=clamp(gap*.35,0,1.6);if(ctx.state==='intro')vCmd=0;vCmd=Math.min(vCmd,SPRINT);
  if(Math.abs(f.d-D)<3&&Math.abs(f.lat-ctx.lateral)<1.4)latT=ctx.lateral+Math.sign(f.lat-ctx.lateral||1)*1.6;
  // Never brake right in front of you: a friend in your line keeps rolling at your pace and
  // moves aside first, even while letting you take the lead.
  const inLine=!stopped&&ctx.state!=='intro'&&f.d-D>-.4&&f.d-D<4.5&&Math.abs(f.lat-ctx.lateral)<1.3;
  if(inLine)vCmd=Math.min(Math.max(vCmd,f.seen+.45,ctx.speed+.3),SPRINT);
  for(const o of list)if(o!==f&&o.mode==='ride'&&Math.abs(o.d-f.d)<2.2&&Math.abs(o.lat-f.lat)<1)latT+=Math.sign(f.lat-o.lat||1)*.6;
  const accel=vCmd>f.speed?1.05+.3*R.stand:2.5;f.speed=Math.max(0,f.speed+clamp(vCmd-f.speed,-accel*dt,accel*dt));
  f.d+=f.speed*dt;const latCap=.32*Math.max(f.speed,inLine?2.2:0);f.latVel=damp(f.latVel,clamp((latT-f.lat)*(inLine?1.2:.7),-latCap,latCap),4,dt);f.lat=clamp(f.lat+f.latVel*dt,-3.7,3.7);
  f.psi=Math.atan2(f.latVel,Math.max(f.speed,.6));f.bd=f.d;f.blat=f.lat;f.bpsi=f.psi;
  // Effort: how hard they are pushing right now. Standing comes in their own bursts.
  f.effort=damp(f.effort,clamp((vCmd-f.speed)/1.1+(f.speed-4.9)/1.6,0,1),2.5,dt);f.standHold-=dt;
  // Each rider gets up out of the saddle after their own beat (drawn fresh for every surge),
  // so a push never has everyone standing in unison.
  if(f.effort>.6/R.stand&&f.standHold<-f.standRest&&f.speed>1.8){f.standWait+=dt;if(f.standWait>f.standDelay){
    // Not every push gets everyone out of the saddle: some stay seated this time.
    const up=f.rand()<Math.min(1,.2+.45*R.stand);f.standHold=up?.8+f.rand()*1.4*R.stand:0;f.standRest=up?.4+f.rand()*1.6:2+f.rand()*2;f.standWait=0;f.standDelay=.2+f.rand()*2.8;}}
  else if(f.effort<.45/R.stand)f.standWait=0;
  f.stand=damp(f.stand,f.standHold>0?1:0,f.standHold>0?3.5:2,dt);
  f.astride=damp(f.astride,f.speed<.25?1:0,f.speed<.25?3:7,dt);
  cycle(f,dt,vCmd<f.speed-.4);
 }
 // Wheels, cranks, steering and lean follow actual motion; each bike has its own gearing.
 function cycle(f,dt,coast){
  const yaw=heading(f.bd)+f.bpsi;if(f.prevYaw===null)f.prevYaw=yaw;const yawRate=wrapAngle(yaw-f.prevYaw)/Math.max(dt,1e-3);f.prevYaw=yaw;
  const v=f.speed,k=yawRate/Math.max(v,.8),R=f.R||{cadence:1,sway:1};f.wheel+=v*dt/f.bike.geom.wheelR;
  if(!coast&&v>.2)f.crank+=v*dt*RAD_PER_M*R.cadence*(1+.1*(f.effort||0));else{const level=Math.round((f.crank-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2;f.crank=damp(f.crank,level,2.5,dt);}
  f.steer=damp(f.steer,v>.3?clamp(-Math.atan(k*1.0)+Math.sin(f.wheel*.35+(f.weaveA||0))*.012,-.55,.55):f.steer,6,dt);
  // Standing riders rock the bike under them with each stroke while the body stays nearly
  // upright (ridePose rolls the torso back against the bike); seated riders barely rock at all.
  f.rock=(f.stand*.9+(f.effort||0)*.15)*Math.sin(f.crank)*R.sway;
  const targetLean=v>.5?clamp(-Math.atan(v*v*k/9.8),-.32,.32):(f.astride>.5?.05*Math.sign(f.lat||1):0);
  f.lean=damp(f.lean,targetLean+f.rock*.14,5,dt);
 }
 const rideOpts=f=>({stopSide:f.mode==='ride'?[-1,1,0][f.slot]:0,stand:f.stand,astride:f.astride,steer:f.steer,look:f.look,lookPitch:0,rock:f.rock,geom:f.bike.geom,posture:(f.cast.build.posture||0)+(f.effort||0)*.08,shoulder:f.rock*.14});
 function rideLook(f,ctx,dt){
  let target=0,pitch=0;f.glance-=dt;f.bellLook-=dt;
  if(ctx.speaker===f.name||(f.bellLook>0&&f.bellLook<1.6)||(f.speed<.3&&f.mode==='ride')){target=lookAt(f,f.bd,f.blat,f.bpsi,ctx.eye.x,ctx.eye.z);}
  else if(f.glance<0){f.lookT=(f.rand()-.5)*1.2*f.R.look;f.glance=(3+f.rand()*6)/Math.max(.4,f.R.look);}
  if(f.glance>2.2&&ctx.speaker!==f.name)target=f.lookT;
  f.look=damp(f.look,target,3,dt);return pitch-(f.cast.build.hunch||0);
 }

 // Scripted departure -------------------------------------------------------------------
 function rideIn(f,ctrl,{vmax=5,vend=0,decel=1.4,each=null,cap=null}={}){let path=null,u=0;return (dt,ctx)=>{
   if(!path){path=makePath([[f.d,f.lat],...ctrl]);u=0;}
   const remain=path.length-u,kappa=path.curv(u+1.5);let v=Math.max(Math.min(.3,remain*2),Math.min(vmax,cap?cap(f):vmax,Math.sqrt(vend*vend+2*decel*Math.max(0,remain-.1)),Math.sqrt(2.3/Math.max(kappa,.02))));
   f.speed=f.speed+clamp(v-f.speed,-2.6*dt,1.4*dt);u+=f.speed*dt;const q=path.at(u);f.d=f.bd=q.d;f.lat=f.blat=q.lat;f.bpsi+=wrapAngle(q.psi-f.bpsi)*(1-Math.exp(-10*dt));
   f.effort=damp(f.effort||0,clamp((v-f.speed)/1.2,0,1),2.5,dt);f.stand=damp(f.stand,v-f.speed>1.2&&f.speed<4?1:0,3,dt);cycle(f,dt,(v<f.speed-.3||remain<5)&&vend<1);f.astride=damp(f.astride,f.speed<.35&&remain<.8&&vend<1?1:0,6,dt);each?.(dt,ctx,u,path);
   if(remain<.05||(remain<.35&&f.speed<.12)){f.speed=0;return true;}}}
 function easeIn(f,e){if(e<.35)blendPose(f.pose,f.from,f.pose,smooth(e/.35));}
 function wait(t){let e=0;return dt=>(e+=dt)>=t;}
 function until(test){return ()=>test();}
 function act(fn){return (dt,ctx)=>{fn(ctx);return true;}}
 function settleAstride(f,t=.45){let e=0;return (dt)=>{e+=dt;f.speed=0;cycle(f,dt,true);f.astride=damp(f.astride,1,8,dt);f.lean=damp(f.lean,0,8,dt);f.steer=damp(f.steer,.08,4,dt);return e>=t;};}
 // Hand the rider over from the bike to the ground, preserving the pose exactly.
 function dismount(f,speed=1){const keys=dismountKeys(f.bike.geom);let e=0;return (dt)=>{
   if(e===0){f.pd=f.bd;f.plat=f.blat;f.ppsi=f.bpsi;f.py=null;scene.attach(f.person.group);f.mode='foot';f.fall=0;f.lean=0;}
   e+=dt*speed;samplePose(f.pose,keys,e);applyPose(f.person,f.pose);f.person.group.visible=true;
   f.posed=true;if(e>=keys[keys.length-1][0]){const x0=f.pose[0],z0=f.pose[2],r=localToStreet(f.ppsi,x0,z0);f.pd+=r.dd;f.plat+=r.dl;for(const o of [P.root,P.lh,P.rh,P.lf,P.rf]){f.pose[o]-=x0;f.pose[o+2]-=z0;}applyPose(f.person,f.pose);f.holding=true;return true;}}}
 function kickstand(f){let e=0;return (dt)=>{e+=dt;const t=smooth(e/.7);f.kick=t;f.lean=.13*smooth((e-.35)/.45);
   // A small tap of the right foot on the stand.
   const tap=Math.sin(Math.PI*clamp(e/.7,0,1));f.pose[P.rf]+=(.3-f.pose[P.rf])*tap*.5;f.pose[P.rf+1]=.065+.07*tap;f.pose[P.rf+2]+=(.2-f.pose[P.rf+2])*tap*.5;applyPose(f.person,f.pose);f.posed=true;return e>=.9;};}
 function dropBike(f){let e=0,played=false;return (dt)=>{e+=dt;f.holding=false;const t=clamp(e/.62,0,1);f.fall=-1.36*t*t+(e>.62?.06*Math.sin((e-.62)*18)*Math.exp(-(e-.62)*7):0);f.steer=damp(f.steer,.55,4,dt);
   if(t>=1&&!played){played=true;f.spinV=7;sfx('bikeDrop',f.bike.group.position);}return e>=.9;};}
 // Walk (or run) along street-coordinate points; optionally pushing the bike.
 function walkTo(f,pts,{speed:sp=1.3,push=false,look=null}={}){let path=null,u=0,v=0,e=0;return (dt,ctx)=>{
   if(!path){path=makePath([[f.pd,f.plat],...pts]);u=0;v=push?.4:.2;copyPose(f.from,f.pose);}e+=dt;
   const remain=path.length-u;const target=Math.min(sp,Math.sqrt(2*1.8*Math.max(0,remain))+.15);v=v+clamp(target-v,-3*dt,2*dt);
   const q=path.at(u+Math.min(.5,remain)),want=Math.atan2(q.lat-f.plat,q.d-f.pd);let turn=wrapAngle(want-f.ppsi);if(remain<.05)turn=0;
   const maxTurn=(push?1.6:3.2)*dt;f.ppsi+=clamp(turn,-maxTurn,maxTurn);const slow=Math.abs(turn)>1.2?.35:1;
   const step=v*slow*dt;u+=step;const at=path.at(u);const before=groundPoint(f.pd,f.plat);f.pd=at.d;f.plat=at.lat;const after=groundPoint(f.pd,f.plat);
   const moved=Math.hypot(after.x-before.x,after.z-before.z)+Math.abs(clamp(turn,-maxTurn,maxTurn))*.18;f.gait+=moved/stride(Math.max(v,.8));
   const lk=look?look(ctx):0;if(push){pushPose(f.pose,f.gait,Math.max(v,.8),{look:lk,geom:f.bike.geom});const o=localToStreet(f.ppsi,PUSH_OFFSET.x,PUSH_OFFSET.z);f.bd=f.pd+o.dd;f.blat=f.plat+o.dl;f.bpsi=f.ppsi;f.speed=v*slow;f.wheel+=step/.31;f.steer=damp(f.steer,clamp(turn*.6,-.4,.4),5,dt);}
   else walkPose(f.pose,f.gait,Math.max(v,.8),{look:lk});
   easeIn(f,e);footGround(f,f.pose);applyPose(f.person,f.pose);f.posed=true;
   if(remain<.04){if(push)f.speed=0;return true;}}}
 function turnTo(f,getPsi,t=.8){let e=0,start=null;return (dt)=>{if(start===null){start=f.ppsi;copyPose(f.from,f.pose);}e+=dt;const goal=getPsi();const diff=wrapAngle(goal-start);const prev=f.ppsi;f.ppsi=start+diff*smooth(e/t);
   f.gait+=Math.abs(f.ppsi-prev)*.3;const tmp=walkPose(f.tmp,f.gait,.8,{}),st=standPose(f.pose,e);blendPose(f.pose,st,tmp,Math.min(1,Math.abs(diff)*.6)*Math.sin(Math.PI*smooth(e/t)));easeIn(f,e);footGround(f,f.pose);applyPose(f.person,f.pose);f.posed=true;return e>=t;};}
 function idle(f,t,{wave=0,look=null}={}){let e=0;return (dt,ctx)=>{if(e===0)copyPose(f.from,f.pose);e+=dt;const lk=look?look(ctx):0;standPose(f.pose,e+f.keys[0][1],{look:lk});
   if(wave){const w=smooth(e/.35)*(1-smooth((e-(t-.45))/.45));addWave(f.pose,e,w*wave);if(e>.3&&!f.waved){f.waved=true;}}
   easeIn(f,e);footGround(f,f.pose);applyPose(f.person,f.pose);f.posed=true;return e>=t;};}
 function doorOpen(door,t=.6,sound='doorOpen'){let e=0;return (dt)=>{if(e===0)sfx(sound,door.pivot.getWorldPosition(tmpV));e+=dt;door.set(smooth(e/t));return e>=t;};}
 function doorClose(door,delay=.2){let e=-delay,played=false;return (dt)=>{e+=dt;if(e<0)return false;const t=clamp(e/.45,0,1);door.set((1-t*t)+(t>=1?0:0));if(t>=1&&!played){played=true;door.set(0);sfx('doorSlam',door.pivot.getWorldPosition(tmpV));}return e>=.9;};}
 function hide(f,what='person'){return ()=>{if(what!=='bike'){f.person.group.visible=false;f.inside=true;}if(what!=='person')f.bike.group.visible=false;return true;};}
 const lookPlayer=f=>ctx=>lookAt(f,f.pd,f.plat,f.ppsi,ctx.eye.x,ctx.eye.z);
 function worldPsiTo(f,ctx){const p=groundPoint(f.pd,f.plat);return Math.atan2(ctx.eye.x-p.x,-(ctx.eye.z-p.z))-heading(f.pd);}

 function plan(f,ctx){const h=f.home,s=h.side;
  if(f.key==='jamie'){const dr=h.drivD,door=world.doors.jamie;
   // Kids race home: fast in, off the bike, bike on the lawn, a run to the door.
   return [rideIn(f,[[dr-15,s*2.9],[dr-4.5,s*3.4],[dr-.6,s*5.6],[dr+.2,s*8.3],[dr+2.4,s*10.1],[dr+3.6,s*10.7]],{vmax:7.4,decel:2.3}),
    settleAstride(f,.2),dismount(f,1.65),dropBike(f),turnTo(f,()=>worldPsiTo(f,ctx),.45),idle(f,.9,{wave:1,look:lookPlayer(f)}),
    walkTo(f,[[door.steps.d-1.2,door.steps.lat-s*.2],[door.steps.d,door.steps.lat],[door.porch.d,door.porch.lat]],{speed:3.4,look:ctx2=>0}),
    idle(f,.5,{wave:1,look:lookPlayer(f)}),walkTo(f,[[door.inside.d,door.inside.lat]],{speed:1.4}),hide(f,'person')];}
  if(f.key==='sam'){const dr=h.drivD,gar=world.garages.sam;
   // Sam rides straight up the driveway into the open garage, the way kids do.
   const park=h.S(h.gx,h.gfront-2.6);
   // After the wave the garage door starts down while Sam goes in through the door to the house.
   return [rideIn(f,[[dr-16,s*2.8],[dr-5,s*3.2],[dr-.6,s*5.8],[dr,s*8.5],[gar.mouth.d,gar.mouth.lat-s*1.2],[park.d,park.lat]],{vmax:7.2,decel:2.2}),
    settleAstride(f,.2),dismount(f,1.55),kickstand(f),act(()=>{f.holding=false;}),turnTo(f,()=>worldPsiTo(f,ctx),.6),idle(f,1.6,{wave:1,look:lookPlayer(f)}),
    act(()=>{f.garageClosing=true;sfx('garage',gar.panel.getWorldPosition(tmpV));}),idle(f,.5,{look:lookPlayer(f)}),
    walkTo(f,[[gar.houseDoor.d,gar.houseDoor.lat],[gar.beyond.d,gar.beyond.lat]],{speed:1.15}),hide(f,'person'),until(()=>gar.open<.02),hide(f,'bike')];}
  // Alex heads home first. He has said so; he eases off, turns onto Briarwood Lane, rings his
  // bell and waves back over his shoulder, and rides on down his own street until its curve,
  // by the creek and the trees, takes him out of sight. Nothing happens that anyone sees.
  const B=world.sideFrames[0],J=B.junction,O=roadFrame(J.d),fx=Math.sin(O.heading),fz=-Math.cos(O.heading);
  // Oak Hollow runs straight past the junction, so its coordinates stay exact well down Briarwood.
  const flat=(u,v)=>{const p=B.point(u,v),dx=p.x-O.x,dz=p.z-O.z;return [J.d+dx*fx+dz*fz,dx*O.rightX+dz*O.rightZ];};
  const lane=1.55,turn=[[J.d-9.6,2.85],[J.d-5.5,3.75],[J.d-2.7,6.1],[J.d-1.75,9.6]],down=[13,19,27,37,49,61,72,82,91,99,106].map(u=>flat(u,lane));
  // Just inside his street he all but stops: a look back, a wave, two rings of the bell.
  return [rideIn(f,[...turn,...down],{vmax:4.8,vend:4.4,decel:1.1,cap:f=>f.blat>7.6&&f.blat<11.2?1.3:4.8,each:(dt,ctx)=>{const u=f.blat;
    if(!f.rang&&u>8.4){f.rang=true;bell(f.bike.group.position,.75);f.bellLook=1.55;}
    f.waveW=damp(f.waveW,u>8.2&&u<17?1:0,u>8.2&&u<17?5:3,dt);if(u>40)f.homeward=true;}}),
   ()=>{f.waveW=0;f.person.group.visible=false;f.bike.group.visible=false;f.gone=true;return true;}];
 }

 // Jamie's mother: opens the door and waits on the stoop, then follows Jamie inside.
 function updateMom(dt,ctx){const door=world.doors.jamie,h=world.homes.jamie,m=mom;m.t+=dt;
  const place=()=>{const g=m.person.group,p=groundPoint(m.pd,m.plat),gy=world.groundY(m.pd,m.plat);m.py=m.py===null?gy:damp(m.py,gy,14,dt);g.position.set(p.x,m.py,p.z);g.rotation.set(0,-(heading(m.pd)+m.ppsi),0);};
  const toward=(d,lat)=>Math.atan2(lat-m.plat,d-m.pd);const jamie=list[0];
  if(m.mode==='waiting'){if(ctx.distance>=MOM_AT){m.mode='opening';m.t=0;m.pd=door.inside.d;m.plat=door.inside.lat;m.ppsi=toward(door.porch.d,door.porch.lat);m.person.group.visible=true;sfx('doorOpen',door.pivot.getWorldPosition(tmpV));}else return;}
  if(m.mode==='opening'){door.set(smooth(m.t/.6));standPose(m.pose,m.t);if(m.t>.5){m.mode='out';m.t=0;m.path=makePath([[m.pd,m.plat],[door.outside.d,door.outside.lat],[door.outside.d-h.gs*h.side*-.55,door.outside.lat+0]]);m.u=0;}}
  else if(m.mode==='out'||m.mode==='in'){const step=1.1*dt;m.u+=step;const q=m.path.at(m.u);const want=Math.atan2(q.lat-m.plat,q.d-m.pd);if(m.path.length-m.u>.05)m.ppsi+=clamp(wrapAngle(want-m.ppsi),-3*dt,3*dt);m.pd=q.d;m.plat=q.lat;m.gait+=step/stride(1.1);walkPose(m.pose,m.gait,1.1,{});
   if(m.u>=m.path.length){if(m.mode==='out'){m.mode='porch';m.t=0;}else{m.person.group.visible=false;m.mode='gone';m.closeT=0;}}}
  else if(m.mode==='porch'){m.ppsi+=clamp(wrapAngle(Math.PI/2*-h.side-m.ppsi),-2*dt,2*dt);const jp=jamie.mode==='foot'?jamie.person.group.position:jamie.bike.group.position;standPose(m.pose,m.t,{look:lookAt(null,m.pd,m.plat,m.ppsi,jp.x,jp.z)});addWave(m.pose,m.t,smooth(m.t/.7)*(1-smooth((m.t-1.6)/.8))*.45);
   if(jamie.inside||(jamie.mode==='foot'&&jamie.person.group.visible===false)){m.mode='in';m.path=makePath([[m.pd,m.plat],[door.inside.d,door.inside.lat]]);m.u=0;}}
  else if(m.mode==='gone'){m.closeT+=dt;const t=clamp((m.closeT-.15)/.45,0,1);door.set(1-t*t);if(t>=1&&!m.slammed){m.slammed=true;sfx('doorSlam',door.pivot.getWorldPosition(tmpV));}return;}
  if(m.mode!=='gone'){place();footGround(m,m.pose);applyPose(m.person,m.pose);}
 }

 function update(dt,ctx){
  for(const f of list){
   blinkPerson(f.person,ctx.clock,f.slot+1);if(f.external)continue;
   if(f.mode==='ride'&&ctx.distance>=f.leaveAt&&ctx.state!=='intro'){f.mode='leave';f.script=plan(f,ctx);f.step=0;}
   if(f.mode==='ride')ride(f,dt,ctx);
   f.posed=false;if(f.script&&f.step<f.script.length){if(f.script[f.step](dt,ctx))f.step++;}
   // Between explicit actions a person on foot settles into a relaxed stance.
   if(f.mode==='foot'&&!f.posed&&f.person.group.visible&&!f.holding){standPose(f.rest,ctx.clock);blendPose(f.pose,f.pose,f.rest,1-Math.exp(-6*dt));footGround(f,f.pose);applyPose(f.person,f.pose);}
   if((f.mode==='leave'&&f.person.group.parent===f.bike.group)||f.mode==='ride'){const lp=rideLook(f,ctx,dt);ridePose(f.pose,f.crank,{...rideOpts(f),lookPitch:lp});if(f.waveW>.01)addWave(f.pose,ctx.clock,f.waveW*.9);applyPose(f.person,f.pose);}
   if(f.spinV>0){f.spin+=f.spinV*dt;f.spinV=Math.max(0,f.spinV-dt*1.6);}
   if(f.garageClosing){const g=world.garages.sam;g.set(Math.max(0,g.open-dt/3));}
   if(f.windowOn)world.alexWindow.emissiveIntensity=Math.min(.9,world.alexWindow.emissiveIntensity+dt*.5);
   if(f.bike.group.visible)placeBike(f);if(f.mode==='foot'&&f.person.group.visible)placePerson(f,dt);
  }
  updateMom(dt,ctx);
 }
 // A friend on their way inside, worth a glance from the player.
 function attention(){for(const f of list){if(f.inside||f.gone||f.external)continue;if(f.key==='alex'&&f.mode==='leave'&&f.blat>4&&f.blat<42)return f.bike.group.position;if(f.mode==='foot'&&f.person.group.visible)return f.person.group.position;if(f.mode==='leave'&&f.speed<2.2&&Math.abs(f.blat)>4.8)return f.bike.group.position;}return null;}
 // Nearest friend still riding with you, for the answering bell.
 function answerer(){return list.find(f=>f.mode==='ride')||null;}
 // Your bell: friends still riding nearby look back at you, each after their own moment.
 function hearBell(ctx){for(const f of list)if(f.mode==='ride'&&Math.abs(f.d-ctx.distance)<30)f.bellLook=1.6+.2+f.R.reaction*.6+f.rand()*.3;}
 reset();
 return {list,mom,update,reset,answerer,attention,hearBell};
}
