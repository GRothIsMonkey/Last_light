// Chapter Seven: what the hunter does (its mind), on top of the asset adapter (chapter7-creature.js). It knows nothing about
// meshes: it moves a position and heading over the ground the region's nav gives it, sets a semantic state and the drive
// values, and reads the adapter's sockets. A replacement model therefore changes nothing here.
//
// Modes:
//  off      not in the world.
//  script   a staged beat: a queue of steps (go somewhere at a speed in a state, wait, look, face, act). Set pieces use this
//           (the garage, the doorframe, the door it hammers, the car it waits behind, the lane it drags Jamie into).
//  patrol   walks a loop of graph nodes, stopping at doorways to listen, head turning.
//  search   goes to where it last saw or heard something, looks round, tries a couple of nearby nodes, then patrols again.
//  pursue   runs at what it saw; loses it if it cannot see it for a while (then searches there).
//  attack   in reach: a lunge and a strike; contact is reported (the chapter decides what it means).
//  chase    outdoors, after the bikes, along a route (a polyline), keeping a distance the rider's own speed earns;
//           closes in on a rider who slows down.
//
// Perception (patrol/search/pursue): sight needs a clear line from its head to the target's eye (sightClear: walls, shut
// doors, and furniture taller than a crouching eye), range and a field of view centred on where its head points; a
// target that moves, stands, is near or is lit fills its detection faster. Detection fills a meter: a little (alert) and
// it stops and turns its head; full and it comes. Hidden targets (in a closet) cannot be seen unless it watched them go in.
// Hearing: the chapter reports noises (a sprint, a door, something knocked over); within range it goes to look.
import * as THREE from './three.module.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),headingTo=(x,z,tx,tz)=>Math.atan2(tx-x,-(tz-z));
const _v=new THREE.Vector3();

export function createHunterAI({model,nav,sightClear=()=>true,sfx=()=>{},mark=()=>{}}){
 const M=model,D=M.drive;
 const AI={mode:'off',t:0,modeT:0,speed:0,radius:.3,nav,graph:null,route:null,steps:[],step:null,stepT:0,path:[],pathI:0,goal:null,
  targets:[],meter:new Map(),lastKnown:null,lastSeenT:-99,alertT:0,lookT:0,searchLeft:0,patrolI:0,patrolRoute:[],pauseT:0,
  onCatch:null,onSpot:null,catchR:1.25,sightRange:15,fov:1.25,runSpeed:4.1,walkSpeed:1.25,stalkSpeed:.9,stepAcc:0,breathT:3,
  chase:null,log:{spotted:0,alerts:0,searches:0,caught:0,heard:0,lost:0,blocked:0,stuck:0,steps:0},trace:[],
 };
 // ---- moving over the ground -------------------------------------------------------------------------------------------------
 const ok=(x,z,r=AI.radius)=>!nav||nav.walkable(x,z,r);
 function floorAt(x,z){return nav?.floorAt?nav.floorAt(x,z):0;}
 // one step toward (tx,tz) at speed; slides along walls; returns the distance left
 function stepToward(tx,tz,speed,dt,{turnRate=5,free=false}={}){const dx=tx-M.x,dz=tz-M.z,d=Math.hypot(dx,dz);if(d<1e-3)return 0;
  const want=headingTo(M.x,M.z,tx,tz);M.heading+=clamp(wrap(want-M.heading),-turnRate*dt,turnRate*dt);
  // (it moves where it faces, a little: a hard turn slows it; it never slides sideways much)
  const align=Math.max(.25,Math.cos(wrap(want-M.heading))),v=Math.min(speed*align,d/dt),nx=M.x+Math.sin(M.heading)*v*dt,nz=M.z-Math.cos(M.heading)*v*dt;
  // (squeezed somewhere tighter than its size, a corner it came round too close: it may move on a narrower body, never through a wall)
  const okk=ok(M.x,M.z)?(x,z)=>ok(x,z):(x,z)=>ok(x,z,AI.radius*.5);
  if(free||okk(nx,nz)){M.x=nx;M.z=nz;}
  else if(okk(nx,M.z)){M.x=nx;}else if(okk(M.x,nz)){M.z=nz;}
  else{let moved=false;for(const k of [0,.5,-.5,1.0,-1.0]){const a=want+k,sx=M.x+Math.sin(a)*v*dt*.8,sz=M.z-Math.cos(a)*v*dt*.8;if(okk(sx,sz)){M.x=sx;M.z=sz;moved=true;break;}}if(!moved)AI.log.blocked++;}
  AI.speed=damp(AI.speed,v,8,dt);return d;}
 // ---- the graph (rooms, doorways): A* between nodes -------------------------------------------------------------------------
 function setGraph(G){AI.graph=G?{nodes:G.nodes.map(n=>({...n})),adj:new Map()}:null;AI.bounds=null;if(!G)return;for(const n of AI.graph.nodes)AI.graph.adj.set(n.id,[]);
  for(const [a,b] of G.edges){AI.graph.adj.get(a)?.push(b);AI.graph.adj.get(b)?.push(a);}}
 const node=id=>AI.graph?.nodes.find(n=>n.id===id);
 function nearestNode(x,z,{visible=false}={}){let best=null,bd=1e9;for(const n of AI.graph?.nodes||[]){const d=Math.hypot(n.x-x,n.z-z);if(d<bd&&(!visible||lineClear(x,z,n.x,n.z))){bd=d;best=n;}}return best;}
 function lineClear(x0,z0,x1,z1,r=.25){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.2);for(let i=1;i<n;i++)if(!ok(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,r))return false;return true;}
 // Indoors the rooms are small and the doorways narrow for something its size: a fine grid over the house (the nav's own
 // walkable, at its radius), searched from where it stands to the goal, then pulled straight wherever a line is clear.
 // The graph's nodes only bound the grid (and are the fallback if the grid finds nothing).
 function gridPath(x0,z0,x1,z1){const G=AI.graph;if(!G||!nav)return null;
  const b=AI.bounds||(AI.bounds=(()=>{let a=1e9,c=-1e9,e=1e9,f=-1e9;for(const n of G.nodes){a=Math.min(a,n.x);c=Math.max(c,n.x);e=Math.min(e,n.z);f=Math.max(f,n.z);}return {x0:a-2.5,x1:c+2.5,z0:e-2.5,z1:f+2.5};})());
  const st=.2,nx=Math.ceil((b.x1-b.x0)/st)+1,nz=Math.ceil((b.z1-b.z0)/st)+1,cell=new Uint8Array(nx*nz),prev=new Int32Array(nx*nz).fill(-1);
  const P=k=>({x:b.x0+(k%nx)*st,z:b.z0+Math.floor(k/nx)*st}),K=(x,z)=>{const i=Math.round((x-b.x0)/st),j=Math.round((z-b.z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i;};
  const free=k=>{if(!cell[k]){const q=P(k);cell[k]=ok(q.x,q.z)?1:2;}return cell[k]===1;};
  const s0=K(x0,z0);if(s0<0)return null;const q=[s0];prev[s0]=s0;let end=-1,best=s0,bd=1e9;
  for(let n=0;n<q.length;n++){const k=q[n],c=P(k),d=Math.hypot(c.x-x1,c.z-z1);if(d<bd){bd=d;best=k;}if(d<=.22){end=k;break;}const i=k%nx,j=Math.floor(k/nx);
   for(const [a,bb] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ii=i+a,jj=j+bb;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const kk=jj*nx+ii;if(prev[kk]>=0)continue;
    if(!free(kk)&&Math.hypot(P(kk).x-x0,P(kk).z-z0)>.5)continue;// (standing somewhere tight: out of it first)
    if(a&&bb&&(!free(j*nx+ii)||!free(jj*nx+i)))continue;prev[kk]=k;q.push(kk);}}
  const tail=end>=0?end:best;if(bd>1.2&&end<0)return null;const pts=[];for(let k=tail;;k=prev[k]){pts.unshift(P(k));if(k===s0)break;}
  const out=[];let i=0;while(i<pts.length-1){let j=pts.length-1;while(j>i+1&&!lineClear(pts[i].x,pts[i].z,pts[j].x,pts[j].z,AI.radius))j--;out.push([pts[j].x,pts[j].z]);i=j;}
  if(end>=0)out.push([x1,z1]);return out.length?out:null;}
 function planTo(x,z){AI.path=[];AI.pathI=0;AI.goal={x,z};
  if(lineClear(M.x,M.z,x,z,AI.radius)||!AI.graph){AI.path=[[x,z]];return;}
  const gp=gridPath(M.x,M.z,x,z);if(gp){AI.path=gp;return;}
  const a=nearestNode(M.x,M.z,{visible:true})||nearestNode(M.x,M.z),b=nearestNode(x,z,{visible:true})||nearestNode(x,z);if(!a||!b){AI.path=[[x,z]];return;}
  const open=[{id:a.id,g:0,f:0,p:null}],seen=new Map([[a.id,open[0]]]);let end=null;
  while(open.length){open.sort((p,q)=>p.f-q.f);const c=open.shift();if(c.id===b.id){end=c;break;}const cn=node(c.id);
   for(const nb of AI.graph.adj.get(c.id)||[]){const nn=node(nb);if(!nn||nn.closed?.())continue;const g=c.g+Math.hypot(nn.x-cn.x,nn.z-cn.z),old=seen.get(nb);if(old&&old.g<=g)continue;const v={id:nb,g,f:g+Math.hypot(nn.x-b.x,nn.z-b.z),p:c};seen.set(nb,v);open.push(v);}}
  const ids=[];for(let c=end;c;c=c.p)ids.unshift(c.id);
  // skip the first node if we can already see the second
  const pts=ids.map(id=>{const n=node(id);return [n.x,n.z];});if(pts.length>1&&lineClear(M.x,M.z,pts[1][0],pts[1][1],AI.radius*.8))pts.shift();
  AI.path=[...pts,[x,z]];}
 function followPath(speed,dt){if(!AI.path.length)return true;const [px,pz]=AI.path[AI.pathI];const x0=M.x,z0=M.z,d=stepToward(px,pz,speed,dt);
  // (held up on a corner or a doorframe: plan again from where it is; held up again and again, give that point up)
  AI.stuckT=Math.hypot(M.x-x0,M.z-z0)<speed*dt*.15?(AI.stuckT||0)+dt:0;
  if(AI.stuckT>.6){AI.stuckT=0;AI.stuckN=(AI.stuckN||0)+1;AI.log.stuck=(AI.log.stuck||0)+1;if(AI.stuckN>3||!AI.goal){AI.stuckN=0;AI.path=[];return true;}planTo(AI.goal.x,AI.goal.z);return false;}
  if(d<.35){AI.stuckN=0;AI.pathI++;if(AI.pathI>=AI.path.length){AI.path=[];return true;}}return false;}
 // ---- perception ---------------------------------------------------------------------------------------------------------
 // a target: {id, pos:()=>({x,y,z} eye), crouch:()=>0..1, hidden:()=>bool, moving:()=>speed, lit:()=>0..1, catchable}
 function setTargets(list){AI.targets=list||[];for(const T of AI.targets)if(!AI.meter.has(T.id))AI.meter.set(T.id,0);}
 function headForward(){const a=M.heading;return {x:Math.sin(a),z:-Math.cos(a)};}
 function sees(T){const e=M.eye(_v),p=T.pos();const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);if(d>AI.sightRange)return 0;
  if(T.hidden?.()&&!(T.watchedIn?.()))return 0;
  // where the head points: the body's heading turned by where it is looking (it tracks its look target)
  const f=headForward(),cos=(dx*f.x+dz*f.z)/(d||1),ang=Math.acos(clamp(cos,-1,1));const near=d<2.2;
  if(ang>AI.fov+(near?.6:0))return 0;
  if(!sightClear(e.x,e.y,e.z,p.x,p.y,p.z))return 0;
  const centre=ang<AI.fov*.55?1:.55,distK=clamp(1.6-d/AI.sightRange,.25,1.6),crouch=1-.55*(T.crouch?.()||0),move=.55+.75*clamp((T.moving?.()||0)/2.5,0,1),lit=.55+.45*(T.lit?.()??1);
  return centre*distK*crouch*move*lit;}
 function perceive(dt){let best=null,bm=0;
  for(const T of AI.targets){const s=sees(T);let m=AI.meter.get(T.id)||0;
   if(s>0){m=Math.min(1.2,m+dt*s*(AI.mode==='pursue'?3:1.35));if(T.catchable!==false){AI.lastKnown={x:T.pos().x,z:T.pos().z,id:T.id};AI.lastSeenT=AI.t;}}
   else m=Math.max(0,m-dt*.32);AI.meter.set(T.id,m);if(m>bm){bm=m;best=T;}}
  return {best,level:bm};}
 // (force: something thrown on purpose, close and loud: it turns to that even mid-pursuit, and loses who it was after)
 function hear(pos,loud=1,{id='noise',force=false}={}){if(AI.mode==='off'||AI.mode==='script'||AI.mode==='chase'||AI.mode==='attack')return false;const d=Math.hypot(pos.x-M.x,pos.z-M.z);
  if(d>9*loud)return false;AI.log.heard++;mark('it heard '+id);if(AI.mode==='pursue'&&AI.t-AI.lastSeenT<1.5&&!force)return true;
  if(force){for(const k of AI.meter.keys())AI.meter.set(k,Math.min(AI.meter.get(k),.2));AI.chasing=null;AI.lastSeenT=-99;AI.alerted=false;}
  AI.lastKnown={x:pos.x,z:pos.z,id};setMode('search');D.look={x:pos.x,y:floorAt(pos.x,pos.z)+1,z:pos.z};M.setState('alert');AI.alertT=.6;return true;}
 // ---- modes -------------------------------------------------------------------------------------------------------------
 function setMode(m){if(AI.mode===m)return;AI.trace.push([+AI.t.toFixed(2),m]);if(AI.trace.length>60)AI.trace.shift();AI.mode=m;AI.modeT=0;AI.path=[];AI.pathI=0;
  if(m==='search'){AI.log.searches++;AI.searchLeft=2;AI.lookT=0;}if(m==='off'){M.show(false);}else M.show(true);}
 function place(x,z,a=0){M.place(x,z,a,floorAt(x,z));AI.speed=0;}
 function patrol(route){AI.patrolRoute=route||[];AI.patrolI=0;setMode('patrol');}
 // a staged beat: steps are {to:[x,z]|fn, speed, state, low, look, free, turn}, {wait, state, look, low}, {face:a|[x,z]}, {act:fn}, {until:fn, state}
 function script(steps,{then=null}={}){AI.steps=steps.slice();AI.step=null;AI.stepT=0;AI.then=then;setMode('script');}
 function runScript(dt){if(!AI.step){AI.step=AI.steps.shift()||null;AI.stepT=0;if(!AI.step){const t=AI.then;AI.then=null;if(t)t();else if(AI.mode==='script'){M.setState('idle');AI.speed=0;}return;}
   const s=AI.step;if(s.state)M.setState(s.state);if(s.low!=null)D.low=s.low;if('look' in s)D.look=typeof s.look==='function'?null:s.look;if('reach' in s)D.reach=s.reach;if(s.sound)sfx(s.sound,{x:M.x,y:M.y+1,z:M.z},{gain:s.gain??1});}
  const s=AI.step;AI.stepT+=dt;if(typeof s.look==='function')D.look=s.look();if(typeof s.reach==='function')D.reach=s.reach();
  let done=false;
  if(s.to){const q=typeof s.to==='function'?s.to():s.to;
   // (on the nav, not free: the way round walls to it, planned once, then walked; free steps go straight: stairs, set pieces)
   if(!s.free&&AI.graph&&!s._plan){s._plan=true;planTo(q[0],q[1]);}
   if(!s.free&&AI.path.length&&s._plan){followPath(s.speed??AI.walkSpeed,dt);done=!AI.path.length||Math.hypot(q[0]-M.x,q[1]-M.z)<(s.near??.3);}
   else{const d=stepToward(q[0],q[1],s.speed??AI.walkSpeed,dt,{turnRate:s.turn??5,free:!!s.free});done=d<(s.near??.3);}D.speed=AI.speed;}
  else if(s.wait!=null){D.speed=damp(D.speed,0,6,dt);AI.speed=0;done=AI.stepT>=s.wait;}
  else if(s.face!=null){const a=Array.isArray(s.face)?headingTo(M.x,M.z,s.face[0],s.face[1]):s.face;M.heading+=clamp(wrap(a-M.heading),-(s.turn??3)*dt,(s.turn??3)*dt);done=Math.abs(wrap(a-M.heading))<.03||AI.stepT>2;}
  else if(s.act){s.act();done=true;}else if(s.until){D.speed=damp(D.speed,0,6,dt);done=!!s.until();}
  else done=true;
  if(s.max&&AI.stepT>s.max)done=true;if(done){AI.step=null;}}
 function think(dt){const P=perceive(dt),lvl=P.level,T=P.best;
  // spotted: it comes (after a beat in which it is seen to see you)
  if(T&&lvl>=1&&AI.mode!=='pursue'&&AI.mode!=='attack'&&T.catchable!==false){AI.log.spotted++;mark('it saw '+T.id);setMode('pursue');AI.chasing=T;M.setState('alert');AI.alertT=.45;sfx('c7Snarl',{x:M.x,y:M.y+1.8,z:M.z},{gain:1});AI.onSpot?.(T);return;}
  if(T&&lvl>.32&&lvl<1&&(AI.mode==='patrol'||AI.mode==='search')&&AI.alertT<=0&&!AI.alerted){AI.alerted=true;AI.log.alerts++;M.setState('alert');AI.alertT=.9;D.look={...T.pos()};mark('alert');}
  if(lvl<.15)AI.alerted=false;
  if(AI.alertT>0){AI.alertT-=dt;D.speed=damp(D.speed,0,8,dt);AI.speed=0;if(AI.mode==='pursue'&&AI.chasing)D.look=AI.chasing.pos();return;}
  if(AI.mode==='patrol'){D.low=.12;const r=AI.patrolRoute;if(!r.length){M.setState('idle');return;}
   if(AI.pauseT>0){AI.pauseT-=dt;M.setState('idle');D.speed=damp(D.speed,0,6,dt);AI.speed=0;D.look=null;D.tilt=Math.sin(AI.t*.7)*.35;return;}
   const n=node(r[AI.patrolI%r.length]);if(!AI.path.length)planTo(n.x,n.z);M.setState('stalk');D.look=null;
   if(followPath(AI.stalkSpeed,dt)){if(n.pause)AI.pauseT=n.pause;AI.patrolI++;}D.speed=AI.speed;return;}
  if(AI.mode==='search'){D.low=.2;const L=AI.lastKnown;if(!L){patrol(AI.patrolRoute);return;}
   if(!AI.path.length&&AI.lookT<=0&&Math.hypot(L.x-M.x,L.z-M.z)>.6)planTo(L.x,L.z);
   if(AI.path.length){M.setState('walk');followPath(AI.walkSpeed,dt);D.speed=AI.speed;D.look={x:L.x,y:floorAt(L.x,L.z)+1.1,z:L.z};if(!AI.path.length)AI.lookT=2.2;return;}
   // there: look round, then try a nearby node, then give up
   if(AI.lookT>0){AI.lookT-=dt;M.setState('idle');D.speed=0;AI.speed=0;const a=M.heading+Math.sin(AI.t*1.3)*1.4;D.look={x:M.x+Math.sin(a)*4,y:M.y+1.2,z:M.z-Math.cos(a)*4};if(AI.lookT<=0){
     if(AI.searchLeft-->0&&AI.graph){const ns=AI.graph.nodes.filter(n=>Math.hypot(n.x-M.x,n.z-M.z)<6&&Math.hypot(n.x-M.x,n.z-M.z)>1.2);const n=ns[Math.floor((AI.t*7.31)%1*ns.length)];if(n){AI.lastKnown={x:n.x,z:n.z,id:'node'};}}
     else{AI.log.lost++;mark('lost them');patrol(AI.patrolRoute);}}}return;}
  if(AI.mode==='pursue'){const C=AI.chasing;D.low=.75;M.setState('run');
   const seen=C&&(AI.meter.get(C.id)||0)>.5&&AI.t-AI.lastSeenT<.25;
   if(seen){const p=C.pos();D.look=p;const d=Math.hypot(p.x-M.x,p.z-M.z);
    if(d<AI.catchR+.35&&C.catchable!==false){attack(C);return;}
    if(AI.modeT%.4<dt||!AI.path.length)planTo(p.x,p.z);}
   else if(AI.t-AI.lastSeenT>1.6){setMode('search');return;}
   followPath(AI.runSpeed,dt);D.speed=AI.speed;return;}}
 function attack(T){setMode('attack');AI.target=T;M.setState('lunge');AI.hit=false;sfx('c7Snarl',{x:M.x,y:M.y+1.6,z:M.z},{gain:1.2});}
 function runAttack(dt){const T=AI.target,p=T?.pos?.();if(p){D.look=p;D.reach=p;stepToward(p.x,p.z,5.5,dt,{turnRate:9});}D.speed=AI.speed;
  if(!AI.hit&&AI.modeT>.28){AI.hit=true;const d=p?Math.hypot(p.x-M.x,p.z-M.z):9;if(d<AI.catchR+.6){AI.log.caught++;mark('caught '+T.id);sfx('c7Strike',{x:M.x,y:M.y+1.4,z:M.z},{gain:1.2});AI.onCatch?.(T);}else{setMode('pursue');}}}
 // ---- the chase (outdoors, along a route) -----------------------------------------------------------------------------------
 // route: [[x,z],...]; rider(): {x,z,speed}; gap(): the distance it keeps behind (it closes on a slow rider)
 function chaseStart(route,{rider,gap=()=>8,s0=0,onCatch=null,lat=()=>0,grace=0}){const pts=route.map(([x,z])=>({x,z}));let s=0;for(let i=0;i<pts.length;i++){if(i)s+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);pts[i].s=s;}
  AI.chase={pts,len:s,s:s0,rider,gap,onCatch,lat,slowT:0,v:0,grace};setMode('chase');M.setState('run');D.low=1;}
 function routeAt(s){const P=AI.chase.pts;if(s<=0)return {x:P[0].x,z:P[0].z,a:headingTo(P[0].x,P[0].z,P[1].x,P[1].z)};for(let i=1;i<P.length;i++)if(P[i].s>=s){const a=P[i-1],b=P[i],t=(s-a.s)/((b.s-a.s)||1);return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,a:headingTo(a.x,a.z,b.x,b.z)};}const L=P[P.length-1];return {x:L.x,z:L.z,a:0};}
 function project(x,z){const P=AI.chase.pts;let best=0,bd=1e9;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/l2,0,1),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);if(d<bd){bd=d;best=a.s+(b.s-a.s)*t;}}return best;}
 function runChase(dt){const C=AI.chase,R=C.rider(),sp=project(R.x,R.z);
  // it runs at the rider's own speed plus what it takes to hold its distance; a rider who slows is caught up with: the
  // distance it keeps closes to nothing over a second and a half once you have been slow for more than a second
  C.slowT=AI.modeT<C.grace?0:R.speed<2.2?C.slowT+dt:Math.max(0,C.slowT-dt*2);const close=clamp((C.slowT-1.2)/1.5,0,1),cl=close*close*(3-2*close);
  const want=sp-C.gap(R)*(1-cl)+cl*.6;
  const v=clamp(R.speed+(want-C.s)*1.1+cl*3,0,12.5);C.v=damp(C.v,v,4,dt);C.s=Math.min(C.len,C.s+C.v*dt);
  const q=routeAt(C.s),lat=C.lat(C.s);M.x=q.x+Math.cos(q.a)*lat;M.z=q.z+Math.sin(q.a)*lat;M.heading=q.a;
  // (closing on a rider who has stopped, wherever on the road: it leaves its line and goes straight at them)
  if(cl>0){const dx=M.x-R.x,dz=M.z-R.z,dl=Math.hypot(dx,dz)||1,tx=R.x+dx/dl*1.0,tz=R.z+dz/dl*1.0;// (to an arm's length from you, on its side)
   M.x+=(tx-M.x)*cl;M.z+=(tz-M.z)*cl;const a=headingTo(M.x,M.z,R.x,R.z);M.heading=q.a+wrap(a-q.a)*cl;}
  M.y=floorAt(M.x,M.z);AI.speed=C.v;D.speed=C.v;D.look={x:R.x,y:M.y+1,z:R.z};
  // (the first moments are the rider's: feet on the pedals; after that a rider it reaches who is not getting away is caught)
  const d=Math.hypot(R.x-M.x,R.z-M.z);C.dist=d;if(AI.modeT>C.grace&&d<1.6&&R.speed<3.2&&!C.caught){C.caught=true;AI.log.caught++;mark('chase: caught');C.onCatch?.();}}
 // ---- every frame --------------------------------------------------------------------------------------------------------
 function update(dt){AI.t+=dt;AI.modeT+=dt;if(AI.mode==='off')return;
  if(AI.mode==='script')runScript(dt);else if(AI.mode==='chase')runChase(dt);else if(AI.mode==='attack')runAttack(dt);else think(dt);
  if(AI.mode!=='chase'&&AI.mode!=='off'&&!(AI.step&&AI.step.keepY))M.y=damp(M.y,floorAt(M.x,M.z),14,dt);
  // footfalls (heavy: you hear it before you see it), and its breath when it is still
  if(AI.speed>.25){AI.stepAcc+=dt*AI.speed/(D.low>.5?.95:.62);if(AI.stepAcc>=1){AI.stepAcc=0;AI.log.steps++;sfx(D.low>.5?'c7Gallop':'c7Step',{x:M.x,y:M.y,z:M.z},{gain:D.low>.5?1:.85});}}
  else{AI.breathT-=dt;if(AI.breathT<=0){AI.breathT=2.6+(AI.t*3.7%1)*2;sfx('c7Breath',{x:M.x,y:M.y+1.8,z:M.z},{gain:.7});}}
  M.update(dt);}
 function reset(){AI.mode='off';AI.t=0;AI.modeT=0;AI.steps=[];AI.step=null;AI.then=null;AI.path=[];AI.lastKnown=null;AI.meter.clear();AI.chasing=null;AI.chase=null;AI.alertT=0;AI.pauseT=0;AI.alerted=false;AI.target=null;
  AI.speed=0;AI.trace.length=0;for(const k of Object.keys(AI.log))AI.log[k]=0;M.reset();}
 Object.assign(AI,{update,reset,place,script,patrol,setMode,setGraph,setTargets,hear,chaseStart,planTo,stepToward,lineClear,routeAt,project,perceive,sees,node,
  get model(){return M;},get x(){return M.x;},get z(){return M.z;}});
 return AI;
}
