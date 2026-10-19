// Chapter Five: gates opened by a hand. The yellow arm across the gravel road (pine-plan.js GATES.swing) is shut and in
// the way (boulders either side of its posts): F at its latch end lifts the latch and pushes it round, or Jamie, who gets
// there first if you let him, lifts it and walks it round on its post until it lies along the road's edge. What blocks is
// the arm where it is drawn (pine-plan.js gateAt), so the way opens as it swings clear, not before; nobody opens it twice.
import * as THREE from './three.module.js';
import {GATES,gateBar,PW,PL,heightAt} from './pine-plan.js';
import {headingTo,wrap} from './people.js';
import {P as PI,applyPose} from './rig.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function createGates(X){
 const {phys,comp,sound}=X;
 const S={by:{},log:[],stop:{}};
 // a point on a gate's bar (u: 0 at the hinge, 1 at the latch end), in the world, at the bar's height
 const H={swing:1.05};
 function barPoint(id,u=1,ang){const G=GATES[id],[a0,b0,a1,b1]=gateBar(G,ang??G.ang),e=a0+(a1-a0)*u,n=b0+(b1-b0)*u,w=PW(e,n),c=PW(...G.c);return new THREE.Vector3(w.x,heightAt(c.x,c.z)+(H[id]??.9),w.z);}
 const isOpen=id=>{const G=GATES[id];return Math.abs(G.ang-G.open)<.06;};
 const opening=id=>{const G=GATES[id];return G.want!==G.shut;};
 function setShut(id){const G=GATES[id];G.want=G.ang=G.shut;G.snap=true;S.by[id]=null;S.stop[id]=null;}
 function setOpen(id,by=null){const G=GATES[id];G.want=G.ang=G.open;G.snap=true;S.by[id]=by;S.stop[id]=null;}
 // the latch lifted (a clank), the arm sent round at the pace it is pushed
 function unlatch(id,by,pace){const G=GATES[id];if(opening(id))return false;G.want=G.open;G.k=pace;S.by[id]=by;S.log.push([id,by]);sound('fence',barPoint(id,1),{gain:.55});later(.5,()=>sound('creak',barPoint(id,.5),{gain:.5}));return true;}
 const timers=[];function later(t,f){timers.push({t,f});}
 // ---- you ---------------------------------------------------------------------------------------------------------------------------
 function spots(add){const G=GATES.swing;if(opening('swing')||phys.playerBusy())return;const p=barPoint('swing',.96);add('c5-gate:swing','Open the gate',p,p,2.4,{look:true,size:.25});}
 function act(id){if(id!=='c5-gate:swing'||opening('swing'))return false;X.lockWalk(true);
  phys.playerReach({at:()=>barPoint('swing',.97),dur:[.45,.25,.45],onContact:()=>{if(unlatch('swing','you',1.5))X.opened?.('you');},then:()=>X.lockWalk(false)});return true;}
 // ---- a friend ----------------------------------------------------------------------------------------------------------------------
 // to the latch end (on this side), the latch lifted, then the arm walked round: his hand on the bar a little in from
 // its end, his feet behind it on the arc, as fast as a gate that weight goes
 function friendOpen(c,id,{then}={}){if(opening(id)){then?.(false);return;}const G=GATES[id];const side=(()=>{const a=barPoint(id,.9,G.shut),b=barPoint(id,.9,G.shut+.3);return {x:a.x+(a.x-b.x)*.45,z:a.z+(a.z-b.z)*.45};})();
  const path=X.walkPath(c,side);let lifted=false,began=false;
  // (if you get it open while he is on his way, he just goes through: he doesn't open it again)
  const unless=f=>(dt,ctx)=>{if(!began&&opening(id))return true;return f(dt,ctx);},walk=comp.steps.walkTo(c,path,{speed:1.25}),turn=comp.steps.turnTo(c,headingTo(side.x,side.z,barPoint(id,.9).x,barPoint(id,.9).z),.35),
   R=phys.reach(c,{at:()=>barPoint(id,.96),dur:[.5,.3,.05],keep:false,carry:false,onContact:()=>{lifted=unlatch(id,c.key,.3);if(lifted)X.opened?.(c.key);}});
  comp.run(c,[unless(walk),unless(turn),(dt,ctx)=>{if(!began&&opening(id))return true;began=true;return R(dt,ctx);},(dt,ctx)=>lifted?push(c,id,dt,ctx):true],{then:()=>then?.(lifted)});}
 function push(c,id,dt,ctx,sg=1,to=null){const G=GATES[id],grip=barPoint(id,.82),ahead=barPoint(id,.82,G.ang+.22*sg),tx=grip.x+(grip.x-ahead.x)*.55,tz=grip.z+(grip.z-ahead.z)*.55;
  // (behind the bar, walking it round; the hand on it)
  const d=Math.hypot(tx-c.px,tz-c.pz);if(d>.08)comp.motion.stepToward(c,dt,ctx,tx,tz,clamp(d*2.2,.25,1.5));else comp.motion.standStill(c,dt,ctx);
  const o=PI.rh,L=toLocal(c,grip),k=1;c.pose[o]+=(L.x-c.pose[o])*k;c.pose[o+1]+=(L.y-c.pose[o+1])*k;c.pose[o+2]+=(L.z-c.pose[o+2])*k;c.pose[PI.re]=.6;c.pose[PI.re+1]=-.3;c.pose[PI.re+2]=.5;
  applyPose(c.person,c.pose);c.posed=true;
  if(to!=null)return Math.abs(G.ang-to)<.14;if(isOpen(id)||Math.abs(G.ang-G.open)<.12){return true;}return false;}
 // a gate leaf shoved open by a friend in a hurry (the camp gate, slammed shut in front of you): to the leaf on this side,
 // both hands on it, and through with it as it swings; set() moves the leaf the builder draws (and so what blocks)
 function friendPush(c,id,{to,set,from=null,then}={}){const G=GATES[id],sg=Math.sign(to-G.ang)||1;let done=false;
  const side=()=>{const a=barPoint(id,.8),b=barPoint(id,.8,G.ang+.3*sg);return {x:a.x+(a.x-b.x)*.5,z:a.z+(a.z-b.z)*.5};};
  comp.run(c,[comp.steps.walkTo(c,X.walkPath(c,side()),{speed:2.6}),
   phys.reach(c,{at:()=>barPoint(id,.82),dur:[.3,.12,.05],carry:false,both:true,onContact:()=>{set(to);done=true;sound('fence',barPoint(id,.8),{gain:.7});S.log.push([id,c.key,'shoved']);X.opened?.(c.key+' (shoved)');}}),
   (dt,ctx)=>done?push(c,id,dt,ctx,sg,to):true],{then:()=>then?.(done)});}
 function toLocal(c,w){const dx=w.x-c.px,dz=w.z-c.pz,s=Math.sin(c.pa),co=Math.cos(c.pa);return {x:dx*co+dz*s,y:w.y-c.person.group.position.y,z:-(dx*s-dz*co)};}
 // (the arm swinging round onto you stops against you, as a real one would, and goes on once you are out of its way)
 function barNear(G,ang,p,r){const [a0,b0,a1,b1]=gateBar(G,ang),{e,n}=PL(p.x,p.z),de=a1-a0,dn=b1-b0,t=clamp(((e-a0)*de+(n-b0)*dn)/(de*de+dn*dn),0,1);return Math.hypot(e-a0-de*t,n-b0-dn*t)<r;}
 function blocking(){const G=GATES.swing,p=X.me?.();if(!G||!p)return;const look=to=>G.ang+Math.sign(to-G.ang)*Math.min(Math.abs(to-G.ang),.1);
  if(S.stop.swing==null){if(Math.abs(G.want-G.ang)>1e-3&&barNear(G,look(G.want),p,.42)){S.stop.swing=G.want;G.want=G.ang;S.log.push(['swing','stopped against you']);}}
  else if(!barNear(G,look(S.stop.swing),p,.5)){G.want=S.stop.swing;S.stop.swing=null;}}
 function update(dt){for(let i=timers.length-1;i>=0;i--){const T=timers[i];T.t-=dt;if(T.t<=0){timers.splice(i,1);T.f();}}blocking();}
 function reset(){timers.length=0;S.stop={};for(const id of Object.keys(GATES))if(GATES[id].open!=null)setShut(id);S.log.length=0;}
 return {S,spots,act,friendOpen,friendPush,barPoint,isOpen,opening,setShut,setOpen,update,reset};
}
