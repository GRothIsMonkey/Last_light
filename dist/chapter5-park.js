// Chapter Five: the pebble beach by the public dock. Flat stones lie on the shore; you (and Jamie and Sam) pick one up off
// the ground, wind up, and skip it across the water: it flies from the hand on a real arc, touches the water, skips while it
// is flat enough and fast enough, losing a little each time, and sinks. Hold F to wind up and let go to throw: the longer
// the wind-up (to a point) the faster it goes; aim low across the water; crouch (C) to throw from lower down, flatter.
// Jamie and Sam each pick their own stone up and throw it with their own arm; what their stones do is the same physics
// (their throws are chosen so that Jamie's go far and Sam's first is a plunk and his last is six, as the scene has it).
// Wading: where the water is shallow (pine-plan.js WADE) you can walk in; your steps ring the water and splash.
import * as THREE from './three.module.js';
import {PW,PL,WATER,shoreSD,heightAt} from './pine-plan.js';
import {headingTo,wrap} from './people.js';
import {P as PI,smooth,standPose,copyPose,applyPose} from './rig.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const G=9.8;
// A touch on the water: it skips while it comes in flat (under about 24 degrees), fast and spinning; each touch costs it
// speed and spin, and the steeper it came in the more (a flat fast throw skips many times, a steep one twice and goes in).
// Changes the velocity in place; returns the spin left, or 0 if it goes in.
function bounce(v,s,ang,vh,n){if(!(ang<.42&&vh>2.4&&s>.15&&n<14))return 0;const k=clamp(.93-.9*ang,.4,.88);v.y=-v.y*.5+.3;v.x*=k;v.z*=k;return s*(.9-.6*ang);}
// One stone in flight: from a hand, a velocity, a spin; skips on water while flat and fast; ends sunk or on the ground.
export function simulateSkip(p0,v0,spin,{dt=1/120,maxT=8,onEvent=null}={}){const p=p0.clone(),v=v0.clone();let skips=0,t=0,s=spin;const events=[];
 while(t<maxT){v.y-=G*dt;v.multiplyScalar(1-.03*dt);p.addScaledVector(v,dt);t+=dt;const {e,n}=PL(p.x,p.z),sd=shoreSD(e,n),ground=heightAt(p.x,p.z),wet=sd<-.2&&ground<WATER-.04;
  if(wet&&p.y<=WATER){const vh=Math.hypot(v.x,v.z),ang=Math.atan2(-v.y,vh);
   const b=bounce(v,s,ang,vh,skips);if(b){skips++;p.y=WATER+.001;s=b;const ev={t,kind:'skip',x:p.x,z:p.z,n:skips};events.push(ev);onEvent?.(ev);continue;}
   const ev={t,kind:'sink',x:p.x,z:p.z};events.push(ev);onEvent?.(ev);return {skips,events,end:p,t};}
  if(!wet&&p.y<=ground+.02){const ev={t,kind:'land',x:p.x,z:p.z};events.push(ev);onEvent?.(ev);return {skips,events,end:p,t,land:true};}}
 return {skips,events,end:p,t};}
// A throw: from where, which way (heading a, elevation el), how hard (power 0..1), how well (spin)
export function launch(from,a,el,power,spin=1){const sp=6.5+8.5*power;return {p:from.clone(),v:new THREE.Vector3(Math.sin(a)*Math.cos(el)*sp,Math.sin(el)*sp,-Math.cos(a)*Math.cos(el)*sp),spin};}

export function createPark(X){
 const {scene,phys,comp,jamie,sam,camera}=X;
 const root=new THREE.Group();root.name='chapter5-beach';
 const S={built:false,stones:[],flying:[],turn:null,round:0,best:{you:0,jamie:0,sam:0},you:[],jamie:[],sam:[],log:[],holding:null,wind:null,done:false};
 const W5=X.W5;
 // ---- the stones on the beach ------------------------------------------------------------------------------------------------
 const geo=new THREE.SphereGeometry(1,10,6),mats=[0x8a8478,0x9a9286,0x7a756c,0xa49c8e,0x6e6a62].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.85}));
 function stoneMesh(i){const m=new THREE.Mesh(geo,mats[i%mats.length]);const r=.033+((i*37)%9)*.002;m.scale.set(r*1.15,r*.34,r*.92);m.castShadow=true;m.receiveShadow=true;return m;}
 function build(){if(S.built)return;S.built=true;scene.add(root);const c=X.BEACH,rnd=(()=>{let s=9137;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};})();
  for(let i=0,tries=0;i<22&&tries<400;tries++){const e=c[0]+(rnd()-.5)*7,n=c[1]+(rnd()-.5)*6,sd=shoreSD(e,n);if(sd<.15||sd>2.4)continue;const w=PW(e,n),y=heightAt(w.x,w.z);if(y<WATER+.03)continue;
   const P=phys.prop('beach-stone-'+i,stoneMesh(i),{grip:{p:[0,.035,.03],r:[0,0,Math.PI/2]}});P.home0={x:w.x,y:y+.012,z:w.z,r:rnd()*6.28};S.stones.push(P);i++;}
  hide();}
 function hide(){for(const P of S.stones)P.hide();}
 function lay(){build();for(const P of S.stones){const h=P.home0;P.place(new THREE.Vector3(h.x,h.y,h.z),new THREE.Euler(0,h.r,0));P.used=false;P.claimed=null;}}
 const onBeach=P=>P.state==='placed'&&!P.used&&!P.claimed;
 function nearestStone(x,z,except=null){let best=null,bd=1e9;for(const P of S.stones){if(!onBeach(P)||P===except)continue;const d=Math.hypot(P.obj.position.x-x,P.obj.position.z-z);if(d<bd){bd=d;best=P;}}return best;}
 // ---- a stone in the air ---------------------------------------------------------------------------------------------------------
 // Thrown: the same simulation as above, played out in time (a ring and a sound at each touch).
 function fly(P,L,who,onDone){P.hide();const m=P.obj;m.visible=true;if(m.parent!==root)root.attach(m);const run={P,m,p:L.p.clone(),v:L.v.clone(),s:L.spin,skips:0,t:0,who,onDone,alive:true};S.flying.push(run);return run;}
 function step(run,dt){const n=4,h=dt/n;for(let i=0;i<n&&run.alive;i++){run.v.y-=G*h;run.v.multiplyScalar(1-.03*h);run.p.addScaledVector(run.v,h);run.t+=h;
  const {e,n:nn}=PL(run.p.x,run.p.z),sd=shoreSD(e,nn),ground=heightAt(run.p.x,run.p.z),wet=sd<-.2&&ground<WATER-.04;
  if(wet&&run.p.y<=WATER){const vh=Math.hypot(run.v.x,run.v.z),ang=Math.atan2(-run.v.y,vh);
   const b=bounce(run.v,run.s,ang,vh,run.skips);if(b){run.skips++;run.p.y=WATER+.001;run.s=b;X.ring(run.p.x,run.p.z,.8);X.sound('pebble',{x:run.p.x,y:WATER,z:run.p.z},{gain:.3});continue;}
   run.alive=false;X.ring(run.p.x,run.p.z,run.skips?1.2:1.7);X.sound('splash',{x:run.p.x,y:WATER,z:run.p.z},{gain:run.skips?.35:.55});run.sinkT=0;}
  else if(!wet&&run.p.y<=ground+.02){run.alive=false;run.p.y=ground+.012;X.sound('tap',{x:run.p.x,y:ground,z:run.p.z},{gain:.4});run.landed=true;}}
  run.m.position.copy(run.p);run.m.rotation.y+=dt*22*run.s;}
 // ---- your stone ----------------------------------------------------------------------------------------------------------------
 function youPick(P){if(phys.playerBusy()||S.holding||!onBeach(P))return;P.claimed='you';X.lockWalk(true);
  phys.playerReach({at:()=>P.obj.position.clone(),dur:[.55,.15,.45],onContact:()=>{if(P.state==='placed'){P.holdBy(X.self,'r');S.holding=P;phys.playerHold('r',P);X.sound('tap',P.obj.position,{gain:.2});}else P.claimed=null;},then:()=>X.lockWalk(false)});}
 // F held: the arm draws back (further and lower the longer), the body turns and dips; let go: it comes through low and fast
 function windStart(){if(!S.holding||S.wind||phys.playerBusy())return false;S.wind={t:0};phys.ME.act={kind:'throw',e:0,power:0,phase:'wind'};return true;}
 function windUpdate(dt){const A=phys.ME.act;if(!S.wind||!A||A.kind!=='throw')return;if(A.phase==='wind'){S.wind.t+=dt;A.power=clamp(S.wind.t/1.1,0,1);if(S.wind.auto?S.wind.t>=S.wind.auto:!X.held('KeyF'))release();}}
 function release(){const A=phys.ME.act;if(!A||A.phase!=='wind')return;A.phase='release';A.e=0;A.released=false;}
 // (called by the arm, at the moment the hand passes the front)
 function letGo(handPos){const P=S.holding;if(!P)return;S.holding=null;phys.playerHold('r',null);S.wind=null;const A=phys.ME.act,power=A?.power??.6;
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);const a=Math.atan2(dir.x,-dir.z),pitch=Math.asin(clamp(dir.y,-1,1)),el=pitch*.8+.04,spin=power>.45&&power<.98?1:.55;
  const L=launch(handPos,a,el,power,spin);P.used=true;P.claimed=null;X.sound('pebble',handPos,{gain:.15});
  const isTurn=S.turn==='you';fly(P,L,'you',run=>{const n=run.landed?-1:run.skips;S.you.push(n);S.best.you=Math.max(S.best.you,n);S.log.push(['you',n]);X.thrown('you',n,isTurn);});}
 // the first-person arm for a throw (drawn over the body by physical.js's arms)
 // the first-person arm for a throw (drawn over the body by physical.js's arms): a sidearm, kept low. Wound up, the hand
 // goes back and down past the right hip (out of the bottom-right of the view, the stone with it); let go, it comes round
 // at waist height across the front, the stone leaving it there, and follows through to the left; the body barely turns
 // (a turn of the shoulders under a first-person eye sweeps the sleeve through the view)
 const WIND=[.42,.78,.3],REL=[.12,.86,-.5],FOL=[-.28,.92,-.34];
 phys.ME.extra.push((p,{toLocal,dt})=>{const A=phys.ME.act;if(!A||A.kind!=='throw')return;A.e+=dt;const o=PI.rh,e2=PI.re,set=(q,w)=>{for(let i=0;i<3;i++)p[o+i]+=(q[i]-p[o+i])*w;};
  if(A.phase==='wind'){const w=smooth(A.e/.35),k=.55+.45*A.power;set([WIND[0],WIND[1]-.06*k,WIND[2]*k+.05],w);p[e2]=1;p[e2+1]=-.35;p[e2+2]=.1;p[PI.twist]+=.12*w;p[PI.lean]+=.06*w;A.dip=-.08*w;}
  else{const t=A.e,f=smooth(t/.12),ft=smooth((t-.12)/.3),back=smooth((t-.5)/.4),h=[0,0,0];
   for(let i=0;i<3;i++)h[i]=WIND[i]+(REL[i]-WIND[i])*f+(FOL[i]-REL[i])*ft;
   for(let i=0;i<3;i++)p[o+i]=h[i]*(1-back)+p[o+i]*back;p[e2]=.9;p[e2+1]=-.3;p[e2+2]=.2;p[PI.twist]+=.12-.24*f*(1-back);A.dip=-.08*(1-back);
   if(!A.released&&t>=.1){A.released=true;X.self.group.updateMatrixWorld(true);const hp=new THREE.Vector3();X.self.parts.rhand.getWorldPosition(hp);letGo(hp);}
   if(t>1){phys.ME.act=null;}}});
 // ---- Jamie's and Sam's stones -------------------------------------------------------------------------------------------------------
 // A throw that does what the scene needs: try throws from this hand until one skips n times (closest otherwise).
 function planThrow(from,a,want,{hard=.9,el0=-.02}={}){let best=null,bd=1e9;
  // (the hardest throw near how hard he throws first, flattest first; then softer and steeper ones)
  for(const dp of [0,-.08,.05,-.18,-.3,-.45])for(const el of [0,-.04,.04,-.08,.08,.12,.17,.23,.3,.38,-.12]){const pw=clamp(hard+dp,.15,1),L=launch(from,a,el0+el,pw,want===0?.1:1),R=simulateSkip(L.p,L.v,L.spin);
   if(R.land)continue;const d=Math.abs(R.skips-want);if(d<bd){bd=d;best={el:el0+el,pw,spin:L.spin,skips:R.skips};}if(d===0)return best;}
  return best||{el:el0,pw:hard,spin:1};}
 // the step: pick up the nearest stone (bend for it), to the water's edge, a sidearm throw, follow through
 function friendThrow(c,{want,hard,at,then,low=0}){const P=nearestStone(c.px,c.pz);if(!P){then?.(0);return;}P.claimed=c.key;const stand=at();
  comp.run(c,[comp.steps.walkTo(c,X.walkPath(c,{x:P.obj.position.x+.35*Math.sin(c.pa),z:P.obj.position.z-.35*Math.cos(c.pa)}),{speed:1.2}),
   phys.reach(c,{at:()=>P.obj.position.clone(),dur:[.6,.18,.45],onContact:()=>P.holdBy(c.person,'r'),carry:true}),
   comp.steps.walkTo(c,X.walkPath(c,stand),{speed:1.1}),throwStep(c,P,{want,hard,then,low})]);}
 function throwStep(c,P,{want,hard,then,low=0}){let e=0,thrown=false,aim=null;return (dt,ctx)=>{e+=dt;const tg=X.aimPoint();if(aim===null)aim=headingTo(c.px,c.pz,tg.x,tg.z);c.pa+=clamp(wrap(aim-c.pa),-3*dt,3*dt);
   standPose(c.tmp,ctx.clock+c.R.phase,{look:0,shift:0});copyPose(c.pose,c.tmp);const o=PI.rh;
   // back (0-.55), through (.55-.72, letting go at .66), round (.72-1.2)
   const wind=smooth(e/.5)*(1-smooth((e-.55)/.12)),thr=smooth((e-.55)/.14),fol=smooth((e-.7)/.4)*(1-smooth((e-1.1)/.35));
   const crouch=low*smooth(e/.4)*(1-smooth((e-.95)/.4));c.pose[PI.root+1]-=.12*wind+.16*thr*(1-smooth((e-.9)/.4))+crouch;c.pose[PI.lean]+=.25*wind+.45*thr*(1-smooth((e-.9)/.4))+crouch*.8;c.pose[PI.twist]+=.5*wind-.6*thr*(1-smooth((e-1)/.4));
   const hx=.36*wind+(.08)*thr*(1-fol)+(-.24)*fol,hy=.82*wind+.72*thr*(1-fol)+.95*fol,hz=.22*wind+(-.5)*thr*(1-fol)+(-.3)*fol,k=Math.max(wind,thr,fol);
   c.pose[o]+=(hx-c.pose[o])*k;c.pose[o+1]+=(hy-c.pose[o+1])*k;c.pose[o+2]+=(hz-c.pose[o+2])*k;c.pose[PI.re]=1;c.pose[PI.re+1]=-.2;c.pose[PI.re+2]=.2;
   comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;
   if(!thrown&&e>=.66){thrown=true;const hp=new THREE.Vector3();c.person.group.updateMatrixWorld(true);c.person.parts.rhand.getWorldPosition(hp);const a=c.pa;
    const plan=planThrow(hp,a,want,{hard});const L=launch(hp,a,plan.el,plan.pw,plan.spin);P.used=true;P.claimed=null;X.sound('pebble',hp,{gain:.15});
    fly(P,L,c.key,run=>{const n=run.landed?-1:run.skips;S[c.key].push(n);S.best[c.key]=Math.max(S.best[c.key],n);S.log.push([c.key,n]);then?.(n);});}
   return e>=1.35;};}
 // ---- wading ----------------------------------------------------------------------------------------------------------------------
 let wadeStep=0;
 function wading(dt,p,gait){const s=X.surface(p.x,p.z);const wet=s==='water'&&heightAt(p.x,p.z)<WATER-.03;/* (in the water, not on the wet pebbles above it) */X.pace(wet?.58:1);if(!wet){wadeStep=Math.floor(gait*2);return false;}
  const st=Math.floor(gait*2);if(st!==wadeStep){wadeStep=st;X.ring(p.x+(Math.random()-.5)*.2,p.z+(Math.random()-.5)*.2,.5);}return true;}
 // a stone still in your hand when you do something else, or walk away up the beach, is let fall at your feet
 function drop(){const P=S.holding;if(!P||S.wind)return;S.holding=null;phys.playerHold('r',null);const p=camera.position,d=new THREE.Vector3();camera.getWorldDirection(d);const l=Math.hypot(d.x,d.z)||1,x=p.x+d.x/l*.35,z=p.z+d.z/l*.35;
  P.place(new THREE.Vector3(x,heightAt(x,z)+.012,z),new THREE.Euler(0,Math.atan2(d.x,-d.z),0));P.used=true;P.claimed=null;X.sound('tap',P.obj.position,{gain:.2});}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------
 function update(dt){if(!S.built)return;windUpdate(dt);if(S.holding&&!S.wind){const p=camera.position,b=W5(...X.BEACH);if(Math.hypot(p.x-b.x,p.z-b.z)>11)drop();}for(let i=S.flying.length-1;i>=0;i--){const r=S.flying[i];if(r.alive)step(r,dt);else{r.sinkT=(r.sinkT??0)+dt;if(!r.landed){r.m.position.y-=dt*.4;if(r.sinkT>.5){r.m.visible=false;S.flying.splice(i,1);r.onDone?.(r);}}else{S.flying.splice(i,1);r.onDone?.(r);}}}}
 function spots(add){if(!S.built||S.done&&!S.free)return;
  // (a stone in your hand: a throw is one press away too, for a touch screen's button; F held winds it up further)
  if(S.holding&&!S.wind&&!phys.playerBusy()){add('p5-throw','Throw it',camera.position,null,3,{});return;}if(S.holding||phys.playerBusy())return;for(const P of S.stones)if(onBeach(P))add('p5-stone:'+P.name,'Pick up a flat stone',P.obj.position,null,1.05,{look:true,size:.07});}
 function act(id){if(id==='p5-throw'){if(windStart())S.wind.auto=.8;return true;}if(id.startsWith('p5-stone:')){const P=S.stones.find(q=>q.name===id.slice(9));if(P)youPick(P);return true;}return false;}
 function key(code,repeat){if(code==='KeyF'&&S.holding&&!repeat){const sp=X.spotId?.();if(sp&&!sp.startsWith('p5-'))return false;return windStart();}if(code==='KeyF'&&S.wind)return true;return false;}
 function reset(){if(!S.built)return;for(const r of S.flying)r.m.visible=false;S.flying.length=0;S.holding=null;S.wind=null;S.turn=null;S.round=0;S.done=false;S.free=false;S.best={you:0,jamie:0,sam:0};S.you=[];S.jamie=[];S.sam=[];S.log=[];hide();root.removeFromParent();scene.add(root);}
 return {S,build,lay,hide,update,spots,act,key,reset,drop,friendThrow,nearestStone,wading,simulateSkip,planThrow,get holding(){return S.holding;},get winding(){return !!S.wind;}};
}
