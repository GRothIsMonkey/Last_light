// Chapter Four: the people and cars of an ordinary Tuesday downtown, kept small and staged (no traffic simulator).
// Each person has a short day of their own, keyed to the town clock: a shopkeeper carrying boxes in from the truck,
// two men talking outside the diner, a woman looking in windows on her way to the drugstore, the barber on his chair,
// the florist with her buckets, the librarian at her desk, a waitress inside the diner. As the afternoon goes they go
// in, lock up, drive off; by dark there is nobody. Cars park and leave, and now and then one goes up Main Street; they
// stop for anyone in front of them, so nobody is ever hit, and they are gone by evening.
import * as THREE from './three.module.js';
import {createActor,worldPath,headingTo,wrap} from './people.js';
import {makeCar} from './props.js';
import {createKit} from './kit.js';
import {standPose,applyPose,P} from './rig.js';
import {TW,TL,TY,townY,mainBase} from './town-plan.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const man=(shirt,pants,hair,skin,o={})=>({name:o.name||'',scale:o.scale||1.18,face:{jaw:.94,cheek:.98,eyeGap:.037,eyeY:.012,browTilt:.04,nose:o.nose||'straight',mouth:'flat',ears:1,skin,lips:0xa86a58,iris:0x3a2a1c},
 hair:{style:o.style||'cropped',color:hair},build:{bulk:o.bulk||1.08,shoulders:1.06,head:.97,posture:0,hunch:o.hunch||.04},clothes:{shirt,trim:o.trim??null,collar:!!o.collar,sleeves:o.sleeves||'short',pants,socks:pants,shoes:0x3a3632,sole:0x2a2826}});
const woman=(shirt,pants,hair,skin,o={})=>({name:o.name||'',scale:o.scale||1.12,face:{jaw:.84,cheek:1,eyeGap:.036,eyeY:.013,browTilt:.12,nose:'button',mouth:'flat',ears:.95,skin,lips:0xb57466,iris:0x3a4a5a},
 hair:{style:o.style||'ponytail',color:hair},build:{bulk:.95,shoulders:.94,head:.95,posture:0,hunch:o.hunch||.04},clothes:{shirt,trim:null,sleeves:o.sleeves||'short',pants,socks:pants,shoes:0x5a4c40,sole:0x3a332c}});
// The cast of the town (the story's own speakers are here too: the florist, the librarian, the waitress).
export const TOWNSFOLK={
 vic:man(0xf0ece2,0x3a3a42,0x8a8a88,0xd8b090,{name:'VIC',hunch:.12,collar:true}),dutton:man(0x6a3a2a,0x4a4a3a,0x5a4a3a,0xc8946a,{name:'MR. DUTTON',bulk:1.15}),
 florist:woman(0x6a8a5a,0x4a4a5a,0x9a8a7a,0xe8c4a8,{name:'MRS. KOWALSKI',hunch:.1}),librarian:woman(0x8a5a6a,0x3a3a4a,0x6a5a4a,0xe2b898,{name:'MRS. ALBRIGHT',sleeves:'long'}),
 waitress:woman(0xd8e0e8,0x2a2a32,0x3a2a22,0xb88466,{name:'WAITRESS'}),talker1:man(0x4a6a8a,0x5a5446,0x2a221c,0x9a6a4c,{name:'',nose:'broad'}),talker2:man(0xc8b48a,0x3a4252,0x9a948a,0xe0b898,{name:'',hunch:.1,style:'swept'}),
 shopper:woman(0xc84a5a,0x2a3a5a,0x2a1e18,0xd8a888,{name:''}),walker:man(0x2a2a2a,0x6a6a6a,0x1a1612,0x6e4a34,{name:'',style:'cropped'}),patron:man(0x8a8a6a,0x3a3a3a,0xc8c4bc,0xe0c0a0,{name:'',hunch:.16}),
 reader:woman(0x5a6a8a,0x6a5a4a,0xb8b0a8,0xecc8ae,{name:'',hunch:.14,sleeves:'long'}),counter:man(0x7a2a24,0x2a2a32,0x3a2e24,0xc8906a,{name:''})};
// u,v helpers into world and headings
const W2=(u,v)=>TW(u,v),hd=(u0,v0,u1,v1)=>{const a=W2(u0,v0),b=W2(u1,v1);return headingTo(a.x,a.z,b.x,b.z);};
export function createTownLife({scene,nav,sfx=()=>{}}){
 const K=createKit(),people={},cars=[],chairs=[];
 for(const [k,spec] of Object.entries(TOWNSFOLK))people[k]=createActor(scene,nav,spec,{seed:60+Object.keys(people).length});
 // a folding chair for Vic, boxes for Mr. Dutton, the florist's buckets
 const chair=new THREE.Group();K.box(chair,0,.45,0,.46,.04,.44,K.mat(0x8a8a8a,{metalness:.4,roughness:.5}));K.box(chair,0,.75,.2,.46,.5,.04,K.mat(0x8a8a8a,{metalness:.4,roughness:.5}));for(const [x,z] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]])K.box(chair,x,.22,z,.03,.45,.03,K.mat(0x6a6a6a));scene.add(chair);chair.visible=false;
 const box=new THREE.Mesh(new THREE.BoxGeometry(.5,.36,.4),K.mat(0xb89a6a,{roughness:1}));scene.add(box);box.visible=false;
 const buckets=new THREE.Group();for(let k=0;k<4;k++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.13,.36,10),K.mat(0x5a6a7a,{metalness:.4,roughness:.5}));b.position.set(k*.42,.18,0);buckets.add(b);const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,0),K.mat([0xd84a5a,0xe8c040,0xf0ece0,0xa04a8a][k],{roughness:.9}));f.position.set(k*.42,.48,0);f.scale.y=.8;buckets.add(f);}scene.add(buckets);buckets.visible=false;
 // ---- cars ------------------------------------------------------------------------------------------------------------
 function car(kind,color,{name}={}){const g=new THREE.Group();g.name='town-car-'+(name||kind);scene.add(g);const inner=new THREE.Group();g.add(inner);const parts=makeCar(K,inner,kind,color,{lights:false});g.visible=false;
  const C={g,kind,parts,L:parts.L,W:parts.W,x:0,z:0,a:0,v:0,path:null,s:0,mode:'off',name,wait:0,leaveAt:null,at:null};cars.push(C);return C;}
 const park=(C,u,v,a)=>{const w=W2(u,v);Object.assign(C,{x:w.x,z:w.z,a,v:0,mode:'parked',path:null});C.g.visible=true;place(C);};
 function place(C){const y=nav.groundY(C.x,C.z)??TY;C.g.position.set(C.x,y,C.z);C.g.rotation.set(0,-C.a+Math.PI,0);}
 const N=HUa=>HUa;void N;
 const HU=-Math.PI/2,HE=Math.PI/2;// heading west (+u) and east (-u) along Main
 // Parked cars (u,v,heading,leaves at): along Main's parking lanes, a couple in the lots. Some leave as the day ends.
 const PARK=[['sedan',0x7d9294,20,-5.3,HE,17.2],['wagon',0xcbc0a1,40,5.3,HU,18.1],['suv',0x4a5560,58,-5.3,HE,19.4],['sedan',0x5a2f2f,73,5.3,HU,20.15],['van',0x8c8f8e,112,-5.3,HE,18.6],['sedan',0x2f3f55,150,-5.3,HE,17.8],
  ['pickup',0x6f7f8a,206,5.3,HU,19.2],['sedan',0xe0ddd4,236,-5.3,HE,null],['suv',0x3b4a3a,20,-46,0,null],['sedan',0x9d7064,58,48,Math.PI,18.5],['wagon',0x8a6a4a,-52,30,Math.PI,21.5]];
 for(const [k,c,u,v,a,leave] of PARK){const C=car(k,c);C.home={u,v,a};C.leaveAt=leave;}
 const truck=car('van',0xe8e4da,{name:'delivery'});{const box2=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.3,3.4),K.mat(0xf0ece4,{roughness:.8}));box2.position.set(0,1.75,.7);truck.g.children[0].add(box2);}
 truck.home={u:44,v:5.3,a:HU};truck.leaveAt=16.9;
 const waitressCar=car('sedan',0x8a3a3a,{name:'waitress'});waitressCar.home={u:66,v:46,a:Math.PI};waitressCar.leaveAt=null;// (she drives it away when she has locked up)
 const movers=[car('sedan',0x6f7f8a,{name:'through-1'}),car('wagon',0xb9ab92,{name:'through-2'})];
 // Through traffic: in from Mill St (north), along Main, out past the approach; or in along Old Mill and up Depot St.
 const ROUTES=[[[0,90],[0,40],[0,9],[-4,3.4],[-20,3.4],[-80,3.4],[-100,3.4]],[[-100,-3.4],[-80,-3.4],[60,-3.4],[176,-3.4],[180.5,-9],[180.5,40],[180.5,95]]];
 function drive(C,route,{v=8,then=null}={}){const pts=route.map(([u,v2])=>{const w=W2(u,v2);return [w.x,w.z];});C.path=worldPath(pts);C.s=0;C.mode='drive';C.vmax=v;C.then=then;C.g.visible=true;const p=C.path.at(0);C.x=p.x;C.z=p.z;C.a=p.a;place(C);}
 // ---- people's days ---------------------------------------------------------------------------------------------------
 // A small plan per person: {at:[from,to] hours, do:fn(actor, local time)} steps, run once each as the clock passes.
 const S={h:14,last:-1,hidden:true,blockers:[],log:[]};
 const put=(a,u,v,face,gest=null)=>{const w=W2(u,v);a.show(true);a.place(w.x,w.z,face);a.gest(gest);a.lookAt=null;};
 const walkTo=(a,pts,{speed=1.15,then=null}={})=>a.walk(pts.map(([u,v])=>{const w=W2(u,v);return [w.x,w.z];}),{speed,then});
 const hide=a=>{a.show(false);a.path=null;a.mode='stand';};
 function morning(){// where everyone is at the start of the afternoon
  put(people.vic,30.6,10.15,hd(30.6,10.15,30.6,4),null);chair.visible=true;{const w=W2(30.6,10.35);chair.position.set(w.x,TY+.15,w.z);chair.rotation.y=-hd(30.6,10.35,30.6,4)+Math.PI;}
  put(people.dutton,44,8.4,hd(44,8.4,44,4));put(people.florist,150.6,-10.2,hd(150.6,-10.2,150.6,-6),null);buckets.visible=true;{const w=W2(149.2,-10.4);buckets.position.set(w.x,TY+.15,w.z);buckets.rotation.y=Math.PI;}
  put(people.talker1,61.2,9.6,hd(61.2,9.6,62.6,9.4),'talk');put(people.talker2,62.6,9.4,hd(62.6,9.4,61.2,9.6),'fold');
  put(people.shopper,20,-9.2,hd(20,-9.2,40,-9.2));put(people.walker,120,9.2,hd(120,9.2,100,9.2));
  put(people.librarian,135,50.8,hd(135,50.8,135,47),null);put(people.reader,143,52.9,hd(143,52.9,143,51.5),null);put(people.patron,59,15.8,hd(59,15.8,59,12),null);put(people.waitress,57,16.4,hd(57,16.4,62,16.4),null);put(people.counter,63,15.6,hd(63,15.6,63,18),null);
  truck.g.visible=true;park(truck,truck.home.u,truck.home.v,truck.home.a);for(const C of cars)if(C.home&&C!==truck)park(C,C.home.u,C.home.v,C.home.a);for(const C of movers){C.mode='off';C.g.visible=false;}
  S.trafficAt=S.h+.05;S.trafficK=0;}
 // what happens, in order, through the afternoon and evening (hours)
 const PLAN=[
  [14.02,()=>{walkTo(people.shopper,[[40,-9.2],[62,-9.3],[70,-10.2]],{then:a=>{a.faceTo(...xz(72,-12));}});}],
  [14.1,()=>{walkTo(people.dutton,[[44,7.6],[44.5,6.2]],{then:a=>{a.gest('brace');box.visible=true;S.carry=a;}});}],
  [14.2,()=>{walkTo(people.walker,[[100,9.3],[86,9.4],[84,12],[84,30]],{then:a=>hide(a)});}],
  [14.35,()=>{if(S.carry){S.carry=null;box.visible=false;}walkTo(people.dutton,[[44,10.3],[44,11.6]],{then:a=>{hide(a);setTimeout0(14.6,()=>{put(a,44,11.4,0);walkTo(a,[[44,8],[44.5,6.4]],{then:b=>b.gest('brace')});});}});}],
  [14.55,()=>{walkTo(people.shopper,[[60,-9.6],[30,-9.6],[23,-10.6]],{then:a=>hide(a)});}],
  [15.4,()=>{put(people.walker,8,40,hd(8,40,0,36));walkTo(people.walker,[[2,30],[2,9.5],[30,9.4],[51,9.5],[52,11.6]],{then:a=>hide(a)});}],
  [15.9,()=>{put(people.shopper,23,-11,0);walkTo(people.shopper,[[23,-9.4],[0,-9.4],[-6,-14],[-6,-40]],{then:a=>hide(a)});}],
  [16.85,()=>{hide(people.dutton);}],[16.9,()=>{leave(truck,[[44,3.4],[-80,3.4],[-110,3.4]]);}],
  [17.4,()=>{walkTo(people.florist,[[150.6,-11.2]],{then:a=>{hide(a);buckets.visible=false;}});}],
  [17.9,()=>{walkTo(people.talker1,[[62,9],[66,9],[67,5.6]],{then:a=>hide(a)});walkTo(people.talker2,[[56,9.6],[40,9.6],[34,9.8]],{then:a=>hide(a)});}],
  [18.0,()=>{walkTo(people.vic,[[29,10.5],[28.4,11.3]],{then:a=>{hide(a);chair.visible=false;}});put(people.dutton,44,11.2,Math.PI);walkTo(people.dutton,[[44,9.8]],{then:a=>{a.faceTo(...xz(44,12));a.gest('point');setTimeout0(18.1,()=>{a.gest(null);walkTo(a,[[44,9.6],[50,9.6],[58,40],[58,47]],{then:b=>hide(b)});});}});}],
  [18.3,()=>{hide(people.patron);hide(people.counter);}],
  [19.95,()=>{hide(people.reader);}],
  [20.15,()=>{// the diner closes: she turns the sign off, locks the door, walks to her car behind the block, and drives away
   const a=people.waitress;put(a,59.5,11.4,Math.PI);walkTo(a,[[59.5,10],[66,9.6],[82.6,9.6],[83,38],[67,42.5],[66,44.6]],{speed:1.2,then:b=>{hide(b);leave(waitressCar,[[66,42],[60,38],[40,37.5],[8,37.5],[2,38],[2,70],[2,96]]);}});}],
 ];
 const timers=[];function setTimeout0(h,fn){timers.push({h,fn});}
 const xz=(u,v)=>{const w=W2(u,v);return [w.x,w.z];};
 function leave(C,route){if(!C.g.visible)return;drive(C,[[TL(C.x,C.z).u,TL(C.x,C.z).v],...route],{v:6.5,then:()=>{C.mode='off';C.g.visible=false;}});}
 function start(h){S.h=h;S.last=h;S.hidden=false;for(const a of Object.values(people))hide(a);chair.visible=false;box.visible=false;buckets.visible=false;for(const C of cars){C.mode='off';C.g.visible=false;}timers.length=0;
  morning();S.done=new Set();
  // (starting later than the afternoon: everything that would have happened by now already has)
  for(const [t,fn] of PLAN){if(t<h){S.done.add(t);settle(t);}}
  for(const C of cars)if(C.leaveAt!=null&&C.leaveAt<=h){C.mode='off';C.g.visible=false;}}
 // the end state of a planned step (for starting the town at a later hour)
 function settle(t){const P2={14.35:()=>{box.visible=false;},14.55:()=>hide(people.shopper),15.9:()=>hide(people.shopper),16.85:()=>hide(people.dutton),16.9:()=>{truck.mode='off';truck.g.visible=false;},17.4:()=>{hide(people.florist);buckets.visible=false;},
  17.9:()=>{hide(people.talker1);hide(people.talker2);},18.0:()=>{hide(people.vic);chair.visible=false;hide(people.dutton);},18.3:()=>{hide(people.patron);hide(people.counter);},19.95:()=>hide(people.reader),20.15:()=>{hide(people.waitress);waitressCar.mode='off';waitressCar.g.visible=false;},14.2:()=>hide(people.walker),15.4:()=>hide(people.walker)}[t];P2?.();}
 // ---- every frame ------------------------------------------------------------------------------------------------------
 function update(dt,h,{eye,others=[]}={}){if(S.hidden)return;S.h=h;
  for(const [t,fn] of PLAN)if(!S.done.has(t)&&h>=t){S.done.add(t);try{fn();}catch(e){S.log.push(String(e));}}
  for(let i=timers.length-1;i>=0;i--)if(h>=timers[i].h){const f=timers[i].fn;timers.splice(i,1);f();}
  for(const C of cars)if(C.leaveAt!=null&&C.mode==='parked'&&h>=C.leaveAt&&C!==waitressCar)leave(C,[[TL(C.x,C.z).u,Math.sign(TL(C.x,C.z).v)*3.4||3.4],[-80,3.4],[-110,3.4]]);
  // through traffic, thinner as the day goes on, none after eight
  if(h<19.8&&h>=S.trafficAt){S.trafficAt=h+(h<18?.32:.6);const C=movers.find(c=>c.mode==='off');if(C){drive(C,ROUTES[S.trafficK++%2],{v:8.5,then:()=>{C.mode='off';C.g.visible=false;}});}}
  for(const C of cars){if(C.mode!=='drive')continue;
   // stop for anyone in front (you, Jamie, Sam, anyone walking): never closer than a few meters
   const fx=Math.sin(C.a),fz=-Math.cos(C.a);let want=C.vmax;for(const o of others){const dx=o.x-C.x,dz=o.z-C.z,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(ahead>0&&ahead<C.L/2+9&&side<C.W/2+1.4)want=Math.min(want,Math.max(0,(ahead-C.L/2-3.2)*.9));}
   for(const a of Object.values(people)){if(!a.visible)continue;const dx=a.x-C.x,dz=a.z-C.z,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);if(ahead>0&&ahead<C.L/2+7&&side<C.W/2+.9)want=Math.min(want,Math.max(0,(ahead-C.L/2-2.5)*.9));}
   const curve=C.path.curv(C.s+4);want=Math.min(want,curve>.08?3.2:want);C.v+=clamp(want-C.v,-6*dt,2.2*dt);C.v=Math.max(0,C.v);C.s+=C.v*dt;const p=C.path.at(C.s);C.x=p.x;C.z=p.z;C.a=p.a;place(C);
   for(const w of C.parts.wheels)w.rotation.x-=C.v*dt/.33;if(C.s>=C.path.length-.05){const f=C.then;C.then=null;C.mode='parked';f?.();}}
  for(const a of Object.values(people))if(a.visible)a.update(dt,{eye});
  // Vic sits; the reader sits at her table; the diner's patrons on their stool and booth
  for(const k of ['vic','reader','patron','counter']){const a=people[k];if(!a.visible||a.walking)continue;const p=a.pose;p[P.root+1]-=.4;p[P.lf+2]-=.34;p[P.rf+2]-=.34;applyPose(a.person,p);}
  if(S.carry&&box.visible){const hp=new THREE.Vector3();S.carry.person.parts.rhand.getWorldPosition(hp);box.position.set(hp.x,hp.y+.05,hp.z);box.rotation.y=-S.carry.a;}
  // what they block: people and cars
  S.blockers.length=0;for(const a of Object.values(people))if(a.visible)S.blockers.push({x:a.x,z:a.z,r:.34,speed:a.walking?1:0});
  for(const C of cars){if(!C.g.visible)continue;const fx=Math.sin(C.a),fz=-Math.cos(C.a);for(const k of [-C.L*.3,0,C.L*.3])S.blockers.push({x:C.x+fx*k,z:C.z+fz*k,r:1.05,speed:C.mode==='drive'?C.v:0});}}
 function clear(){S.hidden=true;for(const a of Object.values(people))hide(a);chair.visible=false;box.visible=false;buckets.visible=false;for(const C of cars){C.mode='off';C.g.visible=false;}timers.length=0;S.blockers.length=0;S.carry=null;}
 return {people,cars,start,update,clear,S,get blockers(){return S.blockers;},chair,buckets,
  get state(){return {hidden:S.hidden,people:Object.entries(people).filter(([,a])=>a.visible).map(([k])=>k),cars:cars.filter(c=>c.g.visible).map(c=>c.name||c.kind),moving:cars.filter(c=>c.mode==='drive').length};}};
}
