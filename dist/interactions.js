// The few things you can do at the end of the street, on foot: push the tire swing,
// sit on the bench a while, crouch down to look at the chalk. No goals, nothing to
// collect; each simply lets the place be touched. All of it resets on replay.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {LOOKOUT} from './layout.js';
import {smooth} from './kit.js';

export function createInteractions({world,ambient,sfx=()=>{}}){
 const spots=[
  {id:'swing',label:'Push the swing',d:LOOKOUT.swing.d,lat:LOOKOUT.swing.lat,r:1.7},
  {id:'bench',label:'Sit down',d:LOOKOUT.bench.d-.9,lat:LOOKOUT.bench.lat,r:1.5},
  {id:'chalk',label:'Look closer',d:LOOKOUT.chalk.d+.3,lat:LOOKOUT.chalk.lat+.6,r:1.8},
 ];
 let pose=null,t=0,used=new Set();
 const distTo=(s,d,lat)=>{const a=groundPoint(s.d,s.lat),b=groundPoint(d,lat);return Math.hypot(a.x-b.x,a.z-b.z);};
 // The closest spot within reach, if the walker faces it (within ~70 degrees).
 function nearest(d,lat,yaw){let best=null,bd=1e9;for(const s of spots){const r=distTo(s,d,lat);if(r>s.r||r>bd)continue;
  const dir=Math.atan2(-(s.lat-lat),s.d-d);let a=dir-yaw;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)>1.25&&r>.7)continue;best=s;bd=r;}return best;}
 // F on a spot. The swing takes a push; bench and chalk take the camera for a moment.
 function act(s,from){used.add(s.id);t=0;
  if(s.id==='swing'){ambient.pushSwing?.(from);sfx('creak',ambient.swingPosition?.(),{gain:.5});return null;}
  if(s.id==='bench'){const b=LOOKOUT.bench,y=world.groundY(b.d,b.lat);pose={id:'bench',d:b.d+.02,lat:b.lat,eye:y+1.02,yaw:0,pitch:-.05,from};return pose;}
  if(s.id==='chalk'){const c=LOOKOUT.chalk,y=world.groundY(c.d,c.lat);pose={id:'chalk',d:c.d-.55,lat:c.lat+.55,eye:y+.72,yaw:-.3,pitch:-.95,from,hold:3.4};return pose;}
  return null;}
 // Blend from where you stood into the pose and back out (hold = seconds, or until released).
 function update(dt){if(!pose)return null;t+=dt;const inT=smooth(t/.9);let w=inT;if(pose.hold&&t>pose.hold)w=1-smooth((t-pose.hold)/.9);if(pose.leaving){pose.leaveT+=dt;w=Math.min(w,1-smooth(pose.leaveT/.8));}
  if((pose.hold&&t>pose.hold+.9)||(pose.leaving&&pose.leaveT>.8)){const done=pose;pose=null;return {done:true,pose:done};}
  return {w,pose,out:(pose.hold&&t>pose.hold)||!!pose.leaving};}
 function release(){if(pose&&!pose.leaving&&!pose.hold){pose.leaving=true;pose.leaveT=0;}}
 function reset(){pose=null;t=0;used=new Set();}
 return {spots,nearest,act,update,release,reset,get pose(){return pose;},get used(){return [...used];},distTo};
}
