import fs from 'node:fs';
import path from 'node:path';
import {prepareFriend,solveFriend} from '../../../../dist/friends-1b-pose.js';
import {newPose,standPose,walkPose,ridePose,addWave,pushPose,bikeGeometry,dismountKeys,samplePose,smooth,gripPos,pedalPos} from '../../../../dist/rig.js';
import {CAST} from '../../../../dist/cast.js';
import {Vector3} from '../../../../dist/three.module.js';
const [key,folder,out]=process.argv.slice(2),profile=JSON.parse(fs.readFileSync(path.join(folder,'profile.json')));
const c=prepareFriend(profile),cast=CAST[key],g=bikeGeometry(cast.bike.style,cast.bike.wheelR);
const data={bones:Object.keys(c.pose),fps:24,geometry:{saddle:g.saddle,grip:g.grip,pivot:g.pivot,rake:g.rake,bb:g.bb,crank:g.crank,pedalX:g.pedalX},clips:{}};
const plans={Idle:48,Walk:32,Run:24,Cycle:32,Steer:72,StandPedal:64,Brake:48,Dismount:42,Wave:52,RideWave:64,Look:64,Smile:40,Talk:45,HandleBike:64};
for(const [name,span] of Object.entries(plans)){
 const rows=[],meta=[];for(let i=0;i<=span;i++){
   const t=i/24,u=i/span,w=Math.sin(Math.PI*u)**2,phase=u,go=['Cycle','Steer','StandPedal','Brake','RideWave','Dismount'].includes(name);
   const x={clock:t,gait:phase,ride:go?1:0,geom:g,crank:Math.PI*2*u*(name==='Steer'||name==='StandPedal'?2:1),steer:name==='Steer'?.43*Math.sin(2*Math.PI*u):0,astride:name==='Brake'?smooth((u-.42)/.58):0,stopSide:-1,wave:0,smile:0,blink:0,speech:0};
   let p=newPose();if(name==='Dismount'){samplePose(p,dismountKeys(g),u*1.42);x.ride=1-smooth(u/.35);x.crank=0;x.astride=1;}
   else if(go){if(name==='Brake')x.crank=Math.PI*(2*u-u*u);
     const stand=name==='StandPedal'?smooth(u/.33)*(1-smooth((u-.70)/.30)):0;
     ridePose(p,x.crank,{geom:g,steer:x.steer,astride:x.astride,stand,stopSide:-1,posture:cast.build.posture,rock:cast.ride.sway*stand*.3*Math.sin(x.crank)});}
   else if(name==='Walk'||name==='Run'){x.speed=name==='Run'?3.35:1.65;walkPose(p,phase,x.speed);}
   else if(name==='HandleBike'){pushPose(p,phase,1.15,{geom:g});x.hold=1;x.speed=1.15;x.heldGrip=new Vector3().fromArray(p,9);}
   else standPose(p,.55*Math.sin(u*2*Math.PI),{shift:.4});
   if(name==='Wave'||name==='RideWave'){x.wave=smooth(u/.28)*(1-smooth((u-.67)/.33));p[7]=.65*x.wave;addWave(p,t,x.wave);x.smile=.7*x.wave;}
   if(name==='Look'){p[7]=.83*Math.sin(u*2*Math.PI);x.attention=w;x.blink=Math.max(0,1-Math.abs(u-.51)/.035);}
   if(name==='Smile')x.smile=w;if(name==='Talk'){x.speech=w*(.5+.5*Math.sin(t*14));x.smile=.36*w;}
   const pose=solveFriend(c,p,x);const round=n=>Math.round(n*1e6)/1e6;
   rows.push(data.bones.flatMap(n=>[...pose[n].p.toArray(),...pose[n].q.toArray()].map(round)));
   meta.push([x.crank,x.steer,x.astride,x.wave]);
 }
 data.clips[name]={rows,meta};
}
fs.writeFileSync(out,JSON.stringify(data));
