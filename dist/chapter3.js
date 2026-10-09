// Chapter Three: what Alex heard, and then going after it. It begins a few minutes after Chapter Two,
// at the corner where Alex turned, and ends a little before midnight that same day.
//
//  Day:   "Maybe yesterday wasn't the first time." Alex's house: his mom, tired, remembers that he kept
//         asking her whether she heard a bike bell outside, the last few nights. His room, an ordinary
//         twelve-year-old's mess. His flip phone: four dumb recordings, then one from the night before
//         he disappeared: the fan, insects, a bell outside, twice, "There it is again." His window looks
//         toward the creek. Asking around: nobody heard anything, or they heard kids, or dogs; Mr. Okafor
//         next door heard it too, and mentions the old city road at the end of the street, down to the
//         big storm drain in the woods. At the end of Briarwood: barrier posts, a gate, faded signs; a
//         narrow bicycle track in the dust going in, weeds pushed flat. The road bends away into the trees.
//         Not now. They will come back after dark.
//  Night: the same streets at eleven. The old road, through the field and into the woods, down into the
//         creek valley, lights on handlebars, closer together than they need to be. The outfall: a
//         concrete mouth in the hillside, bigger than a garage door. They leave the bikes and go in. For a
//         long while nothing at all. Then footprints in the silt, and a tire line. A bell, far ahead. The
//         old bike from the oak, leaning on the wall; its bell only clicks. A clear bell farther on. Then,
//         down the long straight, at the edge of the light: a boy, Alex's size, Alex's clothes. "Alex?" He
//         walks around the bend. Past it: nobody. A cable still swinging. A wet footprint. "Jamie?" from
//         ahead. Then, from behind them, the way out: "Guys?" Nothing there. A bell, right beside them.
//         They run. Splashing behind them all the way out. The bikes; the road; the streetlight at the
//         end of Briarwood. "That was him." "No." "You saw him." "I know."
//
// Nothing here explains the bell, the voice, the bike, the boy or Alex. Nothing monstrous is ever shown.
// chapter1.js keeps running the shared systems; chapter2.js hands this file every phase that starts with
// c3-, d3- or n3-. The places are world.woods (the old road, the outfall) and world.drain (the tunnel).
import * as THREE from './three.module.js';
import {heading} from './route.js';
import {smooth} from './kit.js';
import {createActor,ADULTS,headingTo,wrap} from './people.js';
import {createPerson,newPose,standPose,walkPose,applyPose,poseBike,stride,P as PI} from './rig.js';
import {CAST} from './cast.js';
import {createCreature} from './creature.js';
import {makeOldBike} from './old-bike.js';
import {makeHelmet} from './alex-room.js';
import {leafGeometrySmall,leafTexture} from './materials.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
// QA jumps, in story order (names already used by Chapters One and Two get a c3- prefix).
export const SECTIONS3=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day','night-start','c3-road-night','c3-forest-deep','c3-tunnel-entrance','c3-tunnel-inside',
 'c3-tunnel-deep','c3-evidence','c3-first-bell','c3-alex-item','c3-old-bike','c3-broken-bell','c3-bike-gone','c3-figure-reveal','c3-follow-alex','c3-second-sighting','c3-creature-reveal','c3-creature-advance',
 'c3-creature-chase-start','c3-creature-far','c3-creature-side','c3-bike-block','c3-creature-near','c3-creature-barrier','c3-tunnel-exit','c3-bike-remount','c3-road-escape','c3-final-lure','chapter3-end'];
// (older names, and the escalation build's, still work)
const ALIAS3={'phone-recording':'recording','neighbor-investigation':'neighbors','c3-old-bike-tunnel':'c3-old-bike','alex-house-day':'c3-alex-house','c3-figure':'c3-figure-reveal','c3-alex-lure':'c3-figure-reveal',
 'c3-after-figure':'c3-follow-alex','c3-figure-bend':'c3-follow-alex','c3-figure-crossing':'c3-second-sighting','c3-voice':'c3-second-sighting','c3-voice-ahead':'c3-second-sighting','c3-voice-behind':'c3-creature-reveal',
 'c3-close-bell':'c3-creature-reveal','c3-run-start':'c3-creature-chase-start','c3-escape':'c3-creature-chase-start','c3-tunnel-escape':'c3-creature-chase-start','c3-creature-chase':'c3-creature-chase-start',
 'c3-pursuit-far':'c3-creature-far','c3-pursuit-near':'c3-creature-near','c3-bike-escape':'c3-bike-remount','c3-road-pursuit':'c3-road-escape','c3-road-figure':'c3-final-lure'};
// Checkpoints (silent; Continue on the title menu returns to the last one). (Older saves at 'c3-figure', 'c3-voice' or 'c3-escape' still continue.)
export const LABEL3={'chapter3-start':'Where he turned, later','c3-alex-house':'Alex’s house','alex-bedroom':'Alex’s room','phone-recording':'His recordings','neighbor-investigation':'Asking around',
 'c3-road-day':'The end of Briarwood','night-start':'That night','c3-road-night':'The old road','c3-tunnel-entrance':'The outfall','c3-tunnel-deep':'Inside','c3-old-bike':'The bike, down there',
 'c3-alex-lure':'Down the tunnel','c3-creature-reveal':'The junction','c3-creature-chase':'Run','c3-road-escape':'The old road, back','chapter3-end':'Briarwood, after',
 'c3-figure':'Down the tunnel','c3-voice':'Farther in','c3-escape':'Run'};
const DAY={start:'9:16',house:'9:24',room:'9:29',street:'9:41',road:'9:55',leave:'10:12'},NIGHT={home:'11:12',corner:'11:20',road:'11:26',outfall:'11:31',inside:'11:34',bike:'11:41',lure:'11:45',voice:'11:47',creature:'11:47',run:'11:48',safe:'11:54'};
// What the recordings say (captions; the audio is in audio.js, timed to match).
const RECS=[
 {date:'08/07',time:'2:14P',len:'0:08',lines:[{wait:.4},{who:'RECORDING',text:'[Jamie and Sam, cracking up]',time:3.6},{who:'SAM, ON THE PHONE',text:'“Dude, do it again—”',time:2.2},{wait:2}],react:[{who:'SAM',text:'“Oh my God. I forgot about that.”',time:2.4,by:'sam'}]},
 {date:'08/11',time:'6:40P',len:'0:09',lines:[{wait:.3},{who:'RECORDING',text:'[A bike’s freewheel, ticking down]',time:5},{who:'ALEX, ON THE PHONE',text:'“That’s my new ringtone.”',time:2.4},{wait:1}],react:[{who:'JAMIE',text:'“He actually used that. For like a week.”',time:2.8,by:'jamie'}]},
 {date:'08/14',time:'8:02P',len:'0:08',lines:[{wait:.3},{who:'RECORDING',text:'[A TV downstairs. A game show. Applause.]',time:6.6},{wait:1.2}],react:[{who:'SAM',text:'“That’s just his TV.”',time:2,by:'sam'}]},
 {date:'08/18',time:'9:31P',len:'0:09',lines:[{wait:.3},{who:'RECORDING',text:'[Crickets. A sprinkler somewhere.]',time:5},{who:'ALEX, ON THE PHONE',text:'“Summer night. Very exciting.”',time:2.6},{wait:1.4}],react:[]},
 {date:'08/20',time:'11:52P',len:'0:23',lines:[{wait:.5},{who:'RECORDING',text:'[A box fan. Insects outside.]',time:5.6},{wait:1.5},{who:'RECORDING',text:'[A bike bell. Outside.]',time:2.6,mark:'bell1'},{wait:1},
  {who:'RECORDING',text:'[The bell again.]',time:2.4,mark:'bell2'},{wait:1},{who:'ALEX, ON THE PHONE',text:'“There it is again.”',time:2.6,mark:'voice'},{wait:.1},{who:'RECORDING',text:'[The bed creaks. Footsteps. The blinds.]',time:3.8},{wait:2.4}],react:[]}];

export function createChapter3(o,k,ch2){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam,mom,officer,carA,carB}=k,A=k.api,T=o.tension,police=k.police;
 const Wd=world.woods,Dr=world.drain,WS=Wd.spots,DS=Dr.spots,WN=nav.woodsNav,DD=Dr.D,AH=world.homes.alex,R=world.interiors['alex-room'],B=nav.frame,side=k.side,main=k.main,dist=k.dist,me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go;
 for(const [p,v] of Object.entries({'c3-black':0,'d3-corner':0,'d3-street':0,'d3-mom':0,'d3-room':0,'d3-phone':0,'d3-window':0,'d3-neighbors':0,'d3-road':0,'d3-tracks':0,'d3-plan':0,'d3-home':0,
  'c3-night':.82,'n3-home':.78,'n3-corner':.79,'n3-ride':.82,'n3-road':.86,'n3-outfall':.88,'n3-tunnel':.88,'n3-evidence':.88,'n3-bell':.88,'n3-item':.88,'n3-bike':.88,'n3-deeper':.88,'n3-figure':.88,'n3-follow':.88,
  'n3-lure':.88,'n3-creature':.88,'n3-run':.88,'n3-out':.88,'n3-flee':.86,'n3-safe':.82,'n3-end':.82}))k.DEEP[p]=v;
 const date=(t,ampm)=>o.setDate(`AUGUST 22, 2011 <i></i> ${t} ${ampm}`);
 const checkpoint=id=>k.checkpointTo(id,LABEL3[id]);if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL3);
 const where=(p=me())=>nav.locate(p.x,p.z);
 // Where along the way someone is: the road's s in the woods (negative back along Briarwood); in the drain, its s.
 const roadS=(p=me())=>{const L=where(p);if(L.street==='woods')return L.s??(L.w?.patch?Wd.L:-1);if(L.street==='side')return L.u-Wd.U;if(L.street==='drain')return Wd.L+1;return -999;};
 const drainS=(p=me())=>{const L=where(p);return L.street==='drain'?L.s:-1;};
 const cS=c=>{const q=Dr.project(c.px,c.pz);return q&&q.s>-.5&&Math.abs(q.t)<3.2?q.s:-1;};
 const A3={};// the chapter's api (filled in at the end)
 // ---- people on Alex's street the morning after ------------------------------------------------------
 const N=Object.fromEntries(['huang','delaney','pruitt','okafor'].map((key,i)=>[key,createActor(scene,nav,ADULTS[key],{seed:31+i})]));
 const people=Object.values(N);
 const NSPOT={huang:{at:side(126.4,-10.4),face:side(126.4,0),gest:'fold'},delaney:{at:side(73.2,10.8),face:side(73.2,0),gest:'hips'},pruitt:{at:side(47.6,-10.6),face:side(47.6,0),gest:'fold'},okafor:{at:side(147.6,13.2),face:side(144,10),gest:null}};
 // Many small pieces drawn as one: every mesh under a group, baked into a single geometry (one draw call).
 function mergeChildren(group,material,name){group.updateMatrixWorld(true);const pos=[],nor=[],idx=[];const inv=new THREE.Matrix4().copy(group.matrixWorld).invert(),m4=new THREE.Matrix4(),n3=new THREE.Matrix3(),v=new THREE.Vector3();
  const parts=[];group.traverse(o=>{if(o.isMesh&&o.material===material)parts.push(o);});
  for(const o of parts){m4.multiplyMatrices(inv,o.matrixWorld);n3.getNormalMatrix(m4);const g=o.geometry,P=g.attributes.position,N=g.attributes.normal,base=pos.length/3;
   for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m4);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(N,i).applyMatrix3(n3).normalize();nor.push(v.x,v.y,v.z);}
   if(g.index)for(let i=0;i<g.index.count;i++)idx.push(base+g.index.getX(i));else for(let i=0;i<P.count;i++)idx.push(base+i);o.removeFromParent();}
  for(const o of [...group.children])if(o.isGroup&&o.children.length===0)o.removeFromParent();
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));geo.setIndex(idx);geo.computeBoundingSphere();
  const m=new THREE.Mesh(geo,material);m.name=name;group.add(m);return m;}
 // ---- the day's marks on the old road: a narrow tire track in the dust, weeds pushed flat ---------------------
 const marks=new THREE.Group();marks.name='old-road-tracks';scene.add(marks);marks.visible=false;
 {const mud=new THREE.MeshStandardMaterial({color:0x362e25,roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),flat=new THREE.MeshStandardMaterial({color:0x98965f,roughness:1,side:THREE.DoubleSide});
  const line=(pts,w,m)=>{const pos=[],idx=[];for(let i=0;i<pts.length;i++){const [s,t]=pts[i],q=Wd.at(s,t),q2=Wd.at(Math.min(s+.5,Wd.L),t);const a=Math.atan2(q2.x-q.x,-(q2.z-q.z)),rx=Math.cos(a),rz=Math.sin(a);
    for(const e of [-1,1]){const x=q.x+rx*w/2*e,z=q.z+rz*w/2*e;pos.push(x,nav.groundY(x,z)+.012,z);}if(i<pts.length-1){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m2=new THREE.Mesh(g,m);marks.add(m2);return m2;};
  // One tire, wheeled (not ridden: it wanders), along the dusty edge of the asphalt from the gate on.
  const pts=[];for(let s=10;s<=126;s+=.5){const hw=Wd.halfW(s);pts.push([s,hw-.32+.12*Math.sin(s*.31)+.06*Math.sin(s*1.3)]);}line(pts,.06,mud).name='old-road-tire-track';
  // ...where it shows: in the pale skin of road dust along the edge. And small shoes beside it, someone pushing the bike.
  {const dust=new THREE.MeshStandardMaterial({color:0x6d6556,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
   for(const [s0,s1,w] of [[8,70,.62],[70,114,.42]]){const dp=[];for(let s2=s0;s2<=s1;s2+=.5){const hw=Wd.halfW(s2);dp.push([s2,hw-.48+.05*Math.sin(s2*.23)]);}line(dp,w,dust).name='old-road-edge-dust';}
   const shoe=new THREE.MeshStandardMaterial({color:0x3e362c,roughness:1,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
   for(let s2=10.4,i=0;s2<66;s2+=.36,i++){if((i*7)%9===4)continue;const hw=Wd.halfW(s2),t=hw-.66+(i%2?.07:-.07)+.04*Math.sin(s2*.9),q=Wd.at(s2,t),g=new THREE.Group();g.position.set(q.x,nav.groundY(q.x,q.z)+.016,q.z);g.rotation.y=-(q.a+.05*Math.sin(i));marks.add(g);
    for(const [z,r,l] of [[-.07,.042,.06],[.065,.036,.045]]){const e=new THREE.Mesh(new THREE.CircleGeometry(r,10),shoe);e.rotation.x=-Math.PI/2;e.scale.y=l/r*1.4;e.position.set(i%2?.005:-.005,0,z);g.add(e);}}
   mergeChildren(marks,shoe,'old-road-shoeprints');}
  for(let k2=0;k2<40;k2++){const s=11.5+k2*.09,hw=Wd.halfW(s),q=Wd.at(s,hw+.65+Math.sin(k2)*.1),geo=new THREE.PlaneGeometry(.035,.3+((k2*7)%5)*.04);geo.rotateX(-Math.PI/2);const m2=new THREE.Mesh(geo,flat);m2.position.set(q.x,nav.groundY(q.x,q.z)+.03,q.z);m2.rotation.y=-q.a+.9+((k2*13)%7-3)*.08;marks.add(m2);}
  // A thin branch, snapped and hanging, where something went by close to the edge.
  {const q=Wd.at(92,Wd.halfW(92)+1.1),g=new THREE.Group();g.position.set(q.x,nav.groundY(q.x,q.z)+1.05,q.z);g.rotation.y=-q.a;const r=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.9,5),new THREE.MeshStandardMaterial({color:0x8c7a5c,roughness:1}));r.position.set(-.2,-.3,0);r.rotation.z=.9;g.add(r);marks.add(g);}
  mergeChildren(marks,flat,'old-road-flattened-weeds');}
 const tracksAt=Wd.spots.gate;
 // ---- in the drain: silt on the old floor with footprints and a tire line in it ---------------------------------
 // (the silt is banked up just out of the standing water along the left wall, where the water has left it)
 const evidence=new THREE.Group();evidence.name='drain-evidence';scene.add(evidence);evidence.visible=false;
 const siltTop=s=>(Dr.waterAt(s)??Dr.floor(s))+.028;
 {const E=DD.evidence,silt=new THREE.MeshStandardMaterial({color:0x5d4f3c,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),dark=new THREE.MeshStandardMaterial({color:0x332a20,roughness:.85,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});// (double-sided: the strips below are wound facing down)
  // The bar: a low ridge of silt down the left side of the old stretch, just out of the water.
  {const pos=[],idx=[];let n=0;for(let s=E.s0-2;s<=DD.item.s+2.5;s+=.5){const {w}=Dr.sizeAt(s),edge=-(w/2-.05),inner=-(w/2-1.2-.25*Math.sin(s*.4));for(const t of [edge,(edge+inner)/2,inner]){const q=Dr.at(s,t);pos.push(q.x,siltTop(s)+(t===inner?-.04:t===edge?.03:0),q.z);}n++;}
   for(let i=0;i<n-1;i++)for(let j=0;j<2;j++){const a=i*3+j;idx.push(a,a+1,a+3,a+1,a+4,a+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const m2=new THREE.Mesh(g,silt);m2.name='drain-silt-bar';evidence.add(m2);}
  const print=(s,t,a,left)=>{const g=new THREE.Group(),q=Dr.at(s,t);g.position.set(q.x,siltTop(s)+.004,q.z);g.rotation.y=-(q.a+a);evidence.add(g);
   for(const [z,r,l] of [[-.07,.042,.06],[.065,.036,.045]]){const e=new THREE.Mesh(new THREE.CircleGeometry(r,10),dark);e.rotation.x=-Math.PI/2;e.scale.y=l/r*1.4;e.position.set(left?-.005:.005,0,z);g.add(e);}return g;};
  // Small sneakers, walking in (deeper), a stride apart; scuffed in places; one tire beside them.
  for(let s=E.s0,i=0;s<E.s1;s+=.33,i++){const {w}=Dr.sizeAt(s),base=-(w/2-.62);if((i*7)%11===3)continue;print(s,base+(i%2?.09:-.09)+.05*Math.sin(s*.7),.05*Math.sin(i),i%2===0);}
  {const pts=[];for(let s=E.s0-1;s<E.s1;s+=.4){const {w}=Dr.sizeAt(s);pts.push([s,-(w/2-.95)+.08*Math.sin(s*.5)]);}const pos=[],idx=[];pts.forEach(([s,t],i)=>{const q=Dr.at(s,t);for(const e of [-1,1])pos.push(q.x+Math.cos(q.a)*.02*e,siltTop(s)+.005,q.z+Math.sin(q.a)*.02*e);if(i<pts.length-1){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m2=new THREE.Mesh(g,dark);m2.name='drain-tire-line';evidence.add(m2);}
  for(let k2=0;k2<5;k2++){const s=E.s0+5+k2*6.3,{w}=Dr.sizeAt(s),q=Dr.at(s,-(w/2-.7)),m2=new THREE.Mesh(new THREE.PlaneGeometry(.5,.12),dark);m2.rotation.x=-Math.PI/2;m2.rotation.z=.4+k2;m2.position.set(q.x,siltTop(s)+.004,q.z);evidence.add(m2);}
  mergeChildren(evidence,dark,'drain-footprints');}
 const printsAt=(()=>{const s=DD.evidence.s0+5,{w}=Dr.sizeAt(s),q=Dr.at(s,-(w/2-.6));return {x:q.x,z:q.z,y:siltTop(s)+.01};})();
 // ---- his helmet: the one on his desk this morning, upside down on the silt, wet ----------------------------------
 const helmet=makeHelmet();helmet.name='alex-helmet-in-drain';scene.add(helmet);helmet.visible=false;
 helmet.traverse(m=>{if(m.isMesh&&m.material.color&&m.material.color.r>.6&&m.material.color.g<.4){m.material=m.material.clone();m.material.roughness=.16;}});// (the red shell, wet)
 const IT=DD.item,itemAt=(()=>{const q=Dr.at(IT.s,IT.t);return {x:q.x,z:q.z,y:siltTop(IT.s),a:q.a};})();
 helmet.position.set(itemAt.x,itemAt.y+.085,itemAt.z);helmet.rotation.set(Math.PI-.32,-itemAt.a+.7,.22,'YXZ');
 // ---- the old bike: the same one as under the oak. First leaning on the wall far inside; then not there; then lying ----
 // across the way out, near the first bend, where nobody could have put it. (C.bike: none, tunnel, removed, relocated)
 const old=makeOldBike();old.group.name='old-bike-in-drain';scene.add(old.group);old.group.visible=false;let oldCatch=null;// (see catchable: set up once the boy's are)
 const OB=DD.oldBike,oldAt=(()=>{const {w}=Dr.sizeAt(OB.s),t=OB.side*(w/2-.34),q=Dr.at(OB.s,t);return {x:q.x,z:q.z,a:q.a,t};})();
 const RL=DD.relocate,relAt=(()=>{const q=Dr.at(RL.s,-.85);return {x:q.x,z:q.z,a:q.a,t:-.85,h:q.a-.95};})();
 function placeOld(where){const g=old.group;C.bike=where;C.oldFallen=where==='relocated';g.visible=where==='tunnel'||where==='relocated';if(!g.visible)return;
  const rel=where==='relocated',p=rel?relAt:oldAt,s0=rel?RL.s:OB.s,y=Dr.floorAt(s0,p.t);g.position.set(p.x,y,p.z);
  if(rel){g.rotation.set(0,-p.h,1.47,'YXZ');old.steerAngle=.55;}else{g.rotation.set(0,-p.a,.21,'YXZ');old.steerAngle=-.22;}
  old.crankAngle=1.2;old.wheel=.3;old.kickstand=0;poseBike(old);g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);g.position.y+=y+.004-box.min.y;g.updateMatrixWorld(true);}
 const oldParts=()=>{if(C.bike==='relocated'){const fx=Math.sin(relAt.h),fz=-Math.cos(relAt.h);return [-.55,0,.55].map(k2=>({x:relAt.x+fx*k2,z:relAt.z+fz*k2,r:.34,speed:0,low:true}));}
  const fx=Math.sin(oldAt.a),fz=-Math.cos(oldAt.a);return [-.5,0,.5].map(k2=>({x:oldAt.x+fx*k2,z:oldAt.z+fz*k2,r:.36,speed:0}));};
 const oldBellPos=()=>old.steer.localToWorld(old.bell.position.clone());
 const oldSpot={x:oldAt.x,z:oldAt.z,y:Dr.floorAt(OB.s,oldAt.t)+.6};
 // ---- the boy: Alex's size, Alex's clothes, Alex's hair. Nothing about him is wrong. -----------------------------------
 // FG.state: off, unseen (standing far down the deep box), first-reveal (they have stopped; you have not seen him yet),
 // first-seen, turning, leaving-bend, hidden, lure-wait (at the junction, his back to them), lure-walk, lure-step (up
 // into the side culvert), lure-in, lure-gone, road-block, road-leave, gone. In the drain his place is (s,t) and a yaw from its heading
 // (0: facing deeper, PI: facing back toward the way out); on the old road it is FG.road.
 const figure=createPerson({...CAST.alex});figure.group.name='figure';scene.add(figure.group);figure.group.visible=false;
 // He catches the light: his own copies of the materials, and when a beam is on him far down the tunnel (or the road) a
 // little more of their own colour, as a flashlight's hotspot gives. Nothing at all when no light is on him: never a glow.
 const catchable=(group,key)=>{const u={value:0};group.traverse(o2=>{if(!o2.isMesh||!o2.material||Array.isArray(o2.material))return;const m=o2.material.clone();
  m.onBeforeCompile=sh=>{sh.uniforms.uCatch=u;sh.fragmentShader='uniform float uCatch;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n\ttotalEmissiveRadiance+=diffuseColor.rgb*uCatch;');};
  m.customProgramCacheKey=()=>key;o2.material=m;});return u;};
 const figCatch=catchable(figure.group,'figure-catch');oldCatch=catchable(old.group,'old-bike-catch');
 // ---- the thing in the drain (creature.js): loaded in the background, shown only when the story needs it ----------
 const creature=createCreature({scene});
 // Where it is along the drain (s, t), how high above the floor there (y: up in the side culvert), which way it faces (h).
 const CRT0={state:'off',s:0,t:0,y:0,h:0,v:0,phT:0,hidden:0,stride:0,from:null,to:null,pose:null,road:null,lastPh:0},CRT={...CRT0};
 const CUL=DD.junction.side,culW=()=>Dr.sizeAt(CUL.s).w;
 // the side culvert's mouth (d metres in from the junction wall; up: above its sill)
 const culvertAt=(d=0,up=0)=>{const q=Dr.at(CUL.s,-(culW()/2+d));return {x:q.x,z:q.z,y:Dr.floor(CUL.s)+CUL.sill+up,a:q.a};};
 function placeCreature(){if(CRT.road){creature.place(CRT.road.x,CRT.road.y,CRT.road.z,CRT.h);return;}const s=clamp(CRT.s,0,Dr.len),q=Dr.at(s,CRT.t),y=CRT.y>0?Dr.floor(s)+CRT.y:Dr.floorAt(s,CRT.t,{ledge:false});creature.place(q.x,y,q.z,CRT.h);}
 const crChest=()=>{const g=creature.group.position;return {x:g.x,y:g.y+.75,z:g.z};};
 // ---- the maintenance gate at the first bend: a steel bar screen across the drain, two leaves in the middle ---------
 // Open (swung back) on the way in; Jamie slams it behind them on the way out; it holds it for a few seconds.
 const GT={s:74,half:1.1},gate=new THREE.Group();gate.name='drain-gate';scene.add(gate);gate.visible=false;
 const GA={open:1,want:1,rattle:0,burst:false};
 const gateLeaves=[];
 {const q=Dr.at(GT.s,0),{w}=Dr.sizeAt(GT.s),fl=Dr.floor(GT.s),H=2.36;gate.position.set(q.x,fl,q.z);gate.rotation.y=-q.a;
  const steel=new THREE.MeshStandardMaterial({color:0x5b4b3c,roughness:.72,metalness:.45}),rust=new THREE.MeshStandardMaterial({color:0x6e4a32,roughness:.85,metalness:.2});
  const bar=(g,x,y,z,sx,sy,sz,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);b.position.set(x,y,z);g.add(b);return b;};
  const fixed=new THREE.Group();gate.add(fixed);
  for(const e of [-1,1]){bar(fixed,e*GT.half,H/2,0,.1,H,.1,steel);bar(fixed,e*(w/2-.04),H/2,0,.08,H,.08,steel);// posts
   for(let x=GT.half+.16;x<w/2-.06;x+=.17)bar(fixed,e*x,H/2,0,.03,H,.03,rust);bar(fixed,e*(GT.half+w/2)/2,.12,0,w/2-GT.half,.07,.07,steel);bar(fixed,e*(GT.half+w/2)/2,H-.06,0,w/2-GT.half,.07,.07,steel);}
  bar(fixed,0,H+.05,0,w,.12,.14,steel);// header
  mergeChildren(fixed,rust,'drain-gate-bars');mergeChildren(fixed,steel,'drain-gate-frame');
  for(const e of [-1,1]){const pv=new THREE.Group();pv.position.set(e*GT.half,0,0);gate.add(pv);const leaf=new THREE.Group();pv.add(leaf);
   for(let x=.12;x<GT.half-.04;x+=.17)bar(leaf,-e*x,H/2-.04,0,.03,H-.16,.03,rust);bar(leaf,-e*GT.half/2,.14,0,GT.half,.07,.06,steel);bar(leaf,-e*GT.half/2,H-.12,0,GT.half,.07,.06,steel);bar(leaf,-e*(GT.half-.03),H/2,0,.06,H-.1,.06,steel);
   mergeChildren(leaf,rust,'drain-gate-leaf-bars');mergeChildren(leaf,steel,'drain-gate-leaf-frame');gateLeaves.push({pv,e});}}
 // (open: each leaf swung back flat along the drain, deeper side; closed: across the middle)
 function poseGate(dt){const k2=GA.burst?9:5;GA.open=damp(GA.open,GA.want,k2,dt);for(const L of gateLeaves){const ang=L.e*(GA.burst?Math.PI/2*.94+.05*L.e:-Math.PI/2)*GA.open;L.pv.rotation.y=ang+(GA.rattle>0?GA.rattle*.06*Math.sin(C.t*31+L.e*1.7):0);}GA.rattle=Math.max(0,GA.rattle-dt*1.6);}
 function gateBlockers(out){const q=Dr.at(GT.s,0),{w}=Dr.sizeAt(GT.s),a=q.a,rx=Math.cos(a),rz=Math.sin(a),fx=Math.sin(a),fz=-Math.cos(a);
  const put=(t,ds2=0)=>out.push({x:q.x+rx*t+fx*ds2,z:q.z+rz*t+fz*ds2,r:.11,speed:0,gate:true});
  for(const e of [-1,1])for(let t=GT.half;t<=w/2;t+=.24)put(e*t);
  for(const e of [-1,1])for(let k3=.24;k3<=GT.half+.01;k3+=.24){const lx=-e*k3*Math.cos(Math.PI/2*GA.open),lf=(GA.burst?-1:1)*k3*Math.sin(Math.PI/2*GA.open);put(e*GT.half+lx,lf);}}
 // a little more of its own colour where a beam lands on it far off (the material is patched in creature.js)
 const FG={s:DD.figure.s,t:DD.figure.t,v:0,gait:0,yaw:Math.PI,look:0,state:'off',road:null,turnV:0,turnFrom:Math.PI,turnT:0,stepPh:0,hidden:0,lastStride:0,dy:0,pose:newPose()};
 const FG0={...FG,pose:null};
 function placeFigure(dt=0){let x,z,y,h;
  if(FG.road){const q=Wd.at(FG.road.s,FG.road.t);x=q.x;z=q.z;y=nav.groundY(x,z);h=FG.road.h;}
  else{const q=Dr.at(clamp(FG.s,0,Dr.len),FG.t);x=q.x;z=q.z;y=FG.dy?Dr.floor(clamp(FG.s,0,Dr.len))+FG.dy:Dr.floorAt(clamp(FG.s,0,Dr.len),FG.t);h=q.a+FG.yaw;}
  figure.group.position.set(x,y,z);figure.group.rotation.set(0,-h,0);
  if(FG.v>.05){FG.gait+=FG.v*dt/stride(Math.max(FG.v,.8));walkPose(FG.pose,FG.gait,Math.max(FG.v,.8),{look:FG.look});}
  else if(FG.turnV){FG.stepPh+=dt*1.15;walkPose(FG.pose,FG.stepPh,.8,{look:FG.look});}// (small steps, turning round on the spot)
  else standPose(FG.pose,C.t*.6,{look:FG.look,lookPitch:-.06,shift:.22});applyPose(figure,FG.pose);}
 const figHead=()=>({x:figure.group.position.x,y:figure.group.position.y+1.36,z:figure.group.position.z});
 const figChest=()=>({x:figure.group.position.x,y:figure.group.position.y+1.0,z:figure.group.position.z});
 // Can you see him (looking at him, nothing in between)? In the drain the walls are tested; on the road, only how far.
 const camSees=(q,cos=.94)=>{if(!figure.group.visible||!k.camLooksAt(q,cos))return false;const cp=camera.position;
  if(FG.road)return Math.hypot(q.x-cp.x,q.z-cp.z)<40;return Dr.inside(cp.x,cp.z,.2)?Dr.sees(cp,q,.02):Math.hypot(q.x-cp.x,q.z-cp.z)<30;};
 const figInView=()=>figure.group.visible&&(camSees(figChest(),.55)||camSees(figHead(),.55));
 function hideFigure(state){FG.state=state;figure.group.visible=false;FG.v=0;FG.turnV=0;}
 // ---- small physical things: a branch, something far off between the trees, a reflector; then in the drain a
 // cable, ripples, a wet footprint, a leaf on the water, a stone off a lip; and splashing behind them --------------
 const leafMat=new THREE.MeshStandardMaterial({color:0x4d5f36,map:leafTexture,alphaTest:.35,side:THREE.DoubleSide,roughness:1});
 const branch=new THREE.Group();branch.name='road-branch';scene.add(branch);branch.visible=false;
 const BR={s:206,t:Wd.halfW(206)+1.6,phase:-1};
 {const q=Wd.at(BR.s,BR.t);branch.position.set(q.x,nav.groundY(q.x,q.z)+1.3,q.z);branch.rotation.y=-q.a-Math.PI/2;const arm=new THREE.Group();arm.name='arm';branch.add(arm);
  const r=new THREE.Mesh(new THREE.CylinderGeometry(.018,.035,2.4,5),new THREE.MeshStandardMaterial({color:0x4a3c2e,roughness:1}));r.rotation.z=Math.PI/2;r.position.x=1.2;arm.add(r);
  for(const [x,y,s2] of [[1.4,.1,.5],[2,.0,.6],[2.4,.15,.45]]){const l=new THREE.Mesh(leafGeometrySmall,leafMat);l.position.set(x,y,0);l.scale.setScalar(s2);arm.add(l);}}
 const deer=new THREE.Group();deer.name='far-movement';scene.add(deer);deer.visible=false;
 {const m2=new THREE.MeshStandardMaterial({color:0x3a3028,roughness:1});const add=(geo,x,y,z,sx=1,sy=1,sz=1,rz=0)=>{const q=new THREE.Mesh(geo,m2);q.position.set(x,y,z);q.scale.set(sx,sy,sz);q.rotation.z=rz;deer.add(q);};const ball=new THREE.IcosahedronGeometry(1,1),leg=new THREE.CylinderGeometry(.03,.025,.85,5);
  add(ball,0,1.05,0,.62,.3,.24);add(ball,.62,1.38,0,.13,.26,.12,-.5);add(ball,.78,1.6,0,.16,.1,.1);for(const [x,z] of [[-.42,-.1],[-.42,.1],[.42,-.1],[.42,.1]])add(leg,x,.48,z);}
 const DR={phase:-1,t:0};
 const glint=new THREE.Sprite(new THREE.SpriteMaterial({map:k.glint.material.map,color:0xffb04a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));glint.scale.setScalar(.22);glint.visible=false;scene.add(glint);
 const REF=(Wd.reflectors.length?Wd.reflectors:[{s:252,x:0,y:-50,z:0}]).reduce((b,r)=>Math.abs(r.s-252)<Math.abs(b.s-252)?r:b,Wd.reflectors[0]);glint.position.set(REF.x,REF.y,REF.z);
 const cable=new THREE.Group();cable.name='drain-cable';scene.add(cable);cable.visible=false;
 {const c0=Dr.cable;cable.position.set(c0.x,c0.y,c0.z);const r=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,c0.len,5),new THREE.MeshStandardMaterial({color:0x1f1f1d,roughness:.8}));r.position.y=-c0.len/2;cable.add(r);
  const clip=new THREE.Mesh(new THREE.BoxGeometry(.05,.03,.05),new THREE.MeshStandardMaterial({color:0x5c4a3a,roughness:.8}));cable.add(clip);cable.rotation.y=-Dr.at(c0.s).a;}
 const CB={amp:0,t:0};
 const ripple=[...Array(10)].map(()=>{const m2=new THREE.Mesh(new THREE.RingGeometry(.9,1,28),new THREE.MeshBasicMaterial({color:0x9fb0b4,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m2.rotation.x=-Math.PI/2;m2.visible=false;scene.add(m2);return {m:m2,t:-1,life:2.4,size:1};});
 function rippleAt(x,y,z,size=1,life=2.4){const r=ripple.find(q=>q.t<0)||ripple[0];r.t=0;r.life=life;r.size=size;r.m.position.set(x,y+.004,z);r.m.visible=true;}
 const drops=[...Array(90)].map(()=>{const m2=new THREE.Mesh(new THREE.IcosahedronGeometry(.025,0),new THREE.MeshStandardMaterial({color:0xb9c3c4,roughness:.2,metalness:.2}));m2.visible=false;scene.add(m2);return {m:m2,v:new THREE.Vector3(),t:-1};});
 function splashAt(x,y,z,n=7,force=1){for(let i=0;i<n;i++){const d=drops.find(q=>q.t<0);if(!d)break;d.t=0;d.m.visible=true;d.m.position.set(x+(Math.random()-.5)*.3,y+.03,z+(Math.random()-.5)*.3);d.v.set((Math.random()-.5)*1.4,1.2+Math.random()*1.6*force,(Math.random()-.5)*1.4);}rippleAt(x,y,z,.7+.3*force,1.6);}
 const wet=new THREE.Group();wet.name='wet-footprint';scene.add(wet);wet.visible=false;const wetMat=new THREE.MeshStandardMaterial({color:0x1d1e1c,roughness:.08,metalness:.35,transparent:true,opacity:.9,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
 const WET={s:252,t:.95};{const q=Dr.at(WET.s,WET.t);wet.position.set(q.x,Dr.floorAt(WET.s,WET.t)+.006,q.z);wet.rotation.y=-q.a;for(const [x,z,r,l] of [[0,-.07,.042,.065],[0,.068,.036,.048],[.2,-.42,.042,.065],[.2,-.29,.036,.048]]){const e=new THREE.Mesh(new THREE.CircleGeometry(r,10),wetMat);e.rotation.x=-Math.PI/2;e.scale.y=l/r*1.4;e.position.set(x,0,z);wet.add(e);}}
 const wetAt=(()=>{const q=Dr.at(WET.s,WET.t);return {x:q.x,z:q.z,y:Dr.floorAt(WET.s,WET.t)+.02};})();
 const leaf=new THREE.Mesh(new THREE.PlaneGeometry(.09,.06),new THREE.MeshStandardMaterial({color:0x6a5332,roughness:1,side:THREE.DoubleSide}));leaf.rotation.x=-Math.PI/2;leaf.visible=false;scene.add(leaf);const LF={s:-1};
 const stone=new THREE.Mesh(new THREE.IcosahedronGeometry(.035,0),new THREE.MeshStandardMaterial({color:0x6f675c,roughness:1}));stone.visible=false;scene.add(stone);const ST={t:-1,y:0,v:0};
 // Water thrown out of a pipe mouth (something displaced it, somewhere up the pipe): drops out and down, rings below.
 function gushAt(x,y,z,dx,dz,n=14){for(let i=0;i<n;i++){const d=drops.find(q=>q.t<0);if(!d)break;d.t=0;d.m.visible=true;d.m.position.set(x+(Math.random()-.5)*.25,y+(Math.random()-.5)*.25,z+(Math.random()-.5)*.25);
  const sp=1.6+Math.random()*1.8;d.v.set(dx*sp+(Math.random()-.5)*.6,.4+Math.random()*1.4,dz*sp+(Math.random()-.5)*.6);}}
 // The way out, from inside: the night outside is lighter than the drain (sky, the creek valley under the moon). A faint
 // pale haze in the mouth, seen only from inside, and stronger the nearer you are to it running back.
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xa6b7cc,transparent:true,opacity:0,depthWrite:false,fog:false,side:THREE.DoubleSide,map:(()=>{try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=64;c.height=64;
  const gr=g.createRadialGradient(32,26,4,32,30,40);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.55,'rgba(255,255,255,.72)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})()}));
 glow.name='drain-exit-glow';glow.visible=false;scene.add(glow);
 {const q=Dr.at(.4,0),ph=Dr.sizeAt(0);glow.position.set(q.x,Dr.floor(0)+ph.h*.48,q.z);glow.rotation.y=-q.a;glow.scale.set(ph.w*1.15,ph.h*1.05,1);}
 const GL={want:0,o:0};
 // ---- Alex's room ----------------------------------------------------------------------------------------
 const local=(x,z)=>{const q=B.project(x,z,127);return AH.localOf(q.u,q.v);};
 const RW=(x,z,y=0)=>{const w=AH.toWorld(x,z);return {x:w.x,z:w.z,y:w.ground+R.floor+y};};
 const roomZone={inside(x,z){const q=local(x,z);return q.x>R.x0-.03&&q.x<R.x1+.03&&q.z>R.z0-.03&&q.z<R.z1+.03;},
  floorAt(x,z){const q=B.project(x,z,127);return B.point(q.u,q.v).y+R.floor;},
  walkable(x,z,r=.28){const q=local(x,z);if(q.x<R.x0+r||q.x>R.x1-r||q.z<R.z0+r||q.z>R.z1-r)return false;return !R.blocks.some(([x0,x1,z0,z1])=>q.x>x0-r&&q.x<x1+r&&q.z>z0-r&&q.z<z1+r);},heading:0};
 const alexGlass=world.merged.filter(m=>m.material===world.alexWindow);
 function roomOn(on){nav.setRoom(on?roomZone:null);for(const m of alexGlass)m.visible=!on;o.audio()?.indoors?.(on);C.inRoom=on;}
 // The phone on his desk: an old clamshell, open, its screen showing the voice recorder.
 const phone=new THREE.Group();phone.name='alex-phone';scene.add(phone);phone.visible=false;
 const screen=(()=>{try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=128;c.height=112;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return {c,g,t};}catch{return null;}})();
 {const dark=new THREE.MeshStandardMaterial({color:0x2b2d31,roughness:.45,metalness:.4}),silver=new THREE.MeshStandardMaterial({color:0x9a9ea2,roughness:.35,metalness:.6}),keys=new THREE.MeshStandardMaterial({color:0x5a5e64,roughness:.6});
  const base=new THREE.Mesh(new THREE.BoxGeometry(.05,.012,.092),silver);base.position.y=.006;phone.add(base);const pad=new THREE.Mesh(new THREE.BoxGeometry(.04,.002,.06),keys);pad.position.set(0,.0125,.012);phone.add(pad);
  for(let r=0;r<4;r++)for(let c=0;c<3;c++){const kk=new THREE.Mesh(new THREE.BoxGeometry(.01,.002,.007),dark);kk.position.set(-.012+c*.012,.0138,-.006+r*.013);phone.add(kk);}
  const lid=new THREE.Group();lid.position.set(0,.012,-.046);lid.rotation.x=-.32;phone.add(lid);const top=new THREE.Mesh(new THREE.BoxGeometry(.05,.009,.088),silver);top.position.set(0,.0045,-.044);lid.add(top);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(.038,.034),new THREE.MeshBasicMaterial({color:screen?0xffffff:0x6a8aa8,map:screen?.t||null}));scr.rotation.x=-Math.PI/2;scr.position.set(0,.0095,-.05);scr.name='alex-phone-screen';lid.add(scr);
  const p=RW(R.phone.x,R.phone.z,.74+.002);phone.position.set(p.x,p.y,p.z);phone.rotation.y=-(AH.worldRot)+.35;}
 function drawScreen(){if(!screen)return;const {g,t}=screen;g.fillStyle='#b7c8b4';g.fillRect(0,0,128,112);g.fillStyle='#24303a';g.fillRect(0,0,128,16);g.fillStyle='#d8e4d4';g.font='bold 10px Arial';g.fillText('VOICE RECORDER',6,12);
  RECS.map((r,i)=>[r,i]).reverse().forEach(([r,i],row)=>{const y=20+row*17,sel=i===C.recSel;if(sel){g.fillStyle='#24303a';g.fillRect(2,y,124,16);}g.fillStyle=sel?'#d8e4d4':'#24303a';g.font='9px Arial';g.fillText(`Rec ${r.date}  ${r.time}`,6,y+11);g.fillText(r.len,100,y+11);if(C.recPlaying===i){g.fillText('▶',90,y+11);}});t.needsUpdate=true;}
 // ---- state ------------------------------------------------------------------------------------------------
 const C={};
 // Everything transient goes (Start over, a jump, a replay): bells heard, voices, every timer and wait.
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{heardBells:[],voices:[],t:0,pt:0,flags:{},timers:[],inRoom:false,recSel:0,recPlaying:-1,recEnd:0,heard:[],talked:new Set(),cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,pose:null,
  amb:{traffic:1,insects:1,wind:1,life:1,forest:0,tunnel:0,water:0},depth:0,lastEvent:0,leftAt:null,bellTries:0,want:null,wantT:0,loose:false,match:false,dogT:8,role:{jamie:null,sam:null},hold:{},glance:{},back:null,backs:0,maxDs:0,jit:0,
  fig:null,stage:null,waitT:0,runT:0,splashT:0,oldFallen:false,shade:0,bike:'none',purs:null,roadFig:null,frame:null,stumble:null,pointAt:null,glanceT:0});}
 fresh();
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why)T?.note(why);};
 function card(on,title='Chapter Three',eyebrow=''){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2');if(e)e.textContent=eyebrow;if(h)h.textContent=title;el.classList.add('on');}else el.classList.remove('on');C.cardOn=on;}
 const mine=ph=>typeof ph==='string'&&/^(c3|d3|n3)-/.test(ph);
 // (Chapter Four picks up the next afternoon: chapter4.js has its phases, sections and everything in them)
 const owns=ph=>mine(ph)||!!A3.next?.owns(ph),nextOwns=()=>!!A3.next?.owns(S.phase);
 const handles=sec=>SECTIONS3.includes(sec)||!!ALIAS3[sec]||!!A3.next?.handles?.(sec);
 const day=()=>/^(c3-black|d3-)/.test(S.phase);
 const tunnelPhase=()=>/^n3-(tunnel|evidence|bell|item|bike|deeper|figure|follow|lure|creature|run)$/.test(S.phase);
 // ---- poses (a closer look, the window, listening at the desk) -----------------------------------------------
 function pose(at,{y,pitch=0,yaw=null,look=null}){const p=me(),a=yaw??headingTo(at.x,at.z,look.x,look.z);C.pose={w:0,x:at.x,y,z:at.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/1.1);if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);o.roam.walkLock=false;}}
 // ---- Jamie and Sam: with you on the bike or on foot, whichever you are --------------------------------------
 function follow(on,{loose=false}={}){C.match=on;C.loose=loose;}
 function match(dt){if(!C.match)return;const p=me(),want=p.riding?'ride':'walk';C.wantT=C.want===want?C.wantT+dt:0;C.want=want;
  for(const c of [jamie,sam]){if(c.script||!c.active)continue;
   if(want==='ride'){if(c.mode==='ride'){c.follow='ride';continue;}if(C.wantT<.8)continue;
    const fb=Math.hypot(c.bx-c.px,c.bz-c.pz);if(c.bike.group.visible&&fb<40){const s2={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2);
     comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:C.flags.run?3:1.8}),comp.steps.turnTo(c,()=>c.ba,.45),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,C.flags.run?1.9:1.3)],{then:()=>{c.follow='ride';}});}
    else c.follow='walk';}
   else{if(c.mode==='foot'){c.follow=C.loose?'search':'walk';continue;}if(C.wantT<1)continue;
    if(c.mode==='ride')comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)],{then:()=>{c.follow=C.loose?'search':'walk';}});}}}
 const still=(...cs)=>{for(const c of cs){c.follow=null;}};
 // Put both companions somewhere for a scene (bikes stay where they are, standing).
 function putFoot(c,q,a){const bike=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.fall?0:1,fall:c.fall||0}:null;comp.putFoot(c,q.x,q.z,a,{bike});c.follow=null;c.lookAt=null;c.lookPlayer=false;}
 // ---- in the drain: Jamie a few steps ahead, Sam a step or two behind, each on his own -------------------------
 // A role says where each one goes every frame (comp.steps.toward), the chapter changes roles as things happen.
 const tq=(s,t)=>{const q=Dr.at(clamp(s,.3,Dr.len-.6),t);return {x:q.x,z:q.z};};
 const lookAhead=(s,t=0,y=1.2)=>{const q=Dr.at(clamp(s,.3,Dr.len-.4),t);return {x:q.x,z:q.z,y:Dr.floor(s)+y};};
 const GEST={
  recoil:(w)=>(p)=>{p[PI.lean]-=.3*w;p[PI.root+1]-=.05*w;for(const o2 of [PI.lh,PI.rh]){p[o2+1]+=.22*w;p[o2+2]-=.18*w;}},
  crouch:(w)=>(p)=>{p[PI.root+1]-=.32*w;p[PI.lean]+=.7*w;p[PI.hy]=-.2*w;for(const o2 of [PI.lh,PI.rh]){p[o2+1]-=.35*w;p[o2+2]-=.2*w;}},
  tense:(w)=>(p)=>{p[PI.root+1]-=.04*w;p[PI.lean]+=.12*w;p[PI.lh+1]+=.06*w;},
  // the right arm out, pointing (the light in that hand goes where the chapter aims it)
  point:(w)=>(p)=>{const y=p[PI.root+1];p[PI.rh]+=(.16-p[PI.rh])*w;p[PI.rh+1]+=(y+.42-p[PI.rh+1])*w;p[PI.rh+2]+=(-.5-p[PI.rh+2])*w;p[PI.lean]+=.06*w;},
  // a foot caught, down on one hand, up again (w: 0..1..0)
  stumble:(w)=>(p)=>{p[PI.root+1]-=.36*w;p[PI.lean]+=.95*w;p[PI.hy]=-.25*w;for(const o2 of [PI.lh,PI.rh]){p[o2+1]-=.48*w;p[o2+2]-=.38*w;}}};
 function role(c,r){C.role[c.key]=r;C.hold[c.key]=null;if(c.mode!=='foot'||c.script?.roleStep)return;comp.run(c,[comp.steps.toward(c,ctx=>target(c,ctx))],{then:()=>{if(C.role[c.key]==='run')mountUp(c);}});c.script.roleStep=true;}
 // Out of the drain and at the bike: turn to it, kickstand up, on, quickly (but the same movement as ever).
 function mountUp(c){C.role[c.key]='mounted';comp.run(c,[comp.steps.turnTo(c,()=>c.ba,.35),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,1.9)],{then:()=>{c.follow=null;}});}
 // Hold someone where they are for a moment, facing/looking somewhere, with a gesture.
 function hold(c,{face=null,look=null,gesture=null,until=null,turn}={}){C.hold[c.key]={face,look,gesture,until,at:C.t,turn};}
 function target(c,ctx){const p=me(),r=C.role[c.key],h=C.hold[c.key],ps=drainS(p),cs=cS(c);
  if(h&&(h.until===null||C.t<h.until)){const lk=typeof h.look==='function'?h.look():h.look,fc=typeof h.face==='function'?h.face():h.face;
   return {x:c.px,z:c.pz,v:0,look:lk,face:fc!=null?fc:lk?headingTo(c.px,c.pz,lk.x,lk.z):undefined,turn:h.turn||1.6,gesture:h.gesture?.(C.t-h.at)};}
  if(h)C.hold[c.key]=null;
  const glance=C.glance[c.key];const gl=glance&&C.t<glance.until?glance.at:null;
  if(r==='lead'){// a few steps ahead, never too far; waits for you, turned half back
   if(ps<0){const q=tq(1.2,.5);return {x:q.x,z:q.z,look:gl||lookAhead(8),max:2.2};}
   const ahead=cs-ps,want=ps+3.6,q=tq(want,.95),err=want-cs,pv=p.walking?p.speed||0:0;if(ahead>7.5)return {x:c.px,z:c.pz,v:0,look:gl||{x:p.x,z:p.z,y:camera.position.y},face:headingTo(c.px,c.pz,p.x,p.z),turn:.8};
   // (his pace is yours, plus what it takes to get back to his place ahead of you; there, he waits, half turned)
   if(err<.35)return {x:c.px,z:c.pz,v:0,look:gl||lookAhead(cs+8,0,1),face:pv>.3?Dr.at(clamp(cs,0,Dr.len-1)).a:undefined,turn:.7};
   return {x:q.x,z:q.z,v:clamp(pv+err*.85,.7,3+clamp((err-2)*.5,0,1.4)),look:gl||lookAhead(cs+8,0,1)};}// (fallen behind: he jogs to get in front again)
  if(r==='behind'){// a step or two behind you; closer when it is bad
   const close=T&&T.value>.5?1.4:2.3;if(ps<0){return {x:p.x-Math.sin(p.a)*close,z:p.z+Math.cos(p.a)*close,look:gl,max:2.6};}
   const want=ps-close,q=tq(want,-.85),pv=p.walking?p.speed||0:0;if(cs>want+.4||Math.hypot(c.px-p.x,c.pz-p.z)<1)return {x:c.px,z:c.pz,v:0,look:gl||lookAhead(ps+6,0,1.1)};
   return {x:q.x,z:q.z,v:clamp(pv+(want-cs)*.85,.6,3.2),look:gl||lookAhead(ps+6,0,1.1)};}
  if(r==='beside'){// shoulder to shoulder with you (after a scare), turned to whatever they are watching
   const sd=c===jamie?.85:-.85;if(ps<0)return {x:p.x+Math.cos(p.a)*sd,z:p.z+Math.sin(p.a)*sd,look:gl,max:2.4};const q=tq(ps+(c===jamie?.4:-.3),sd);return {x:q.x,z:q.z,look:gl||lookAhead(ps+6),max:2.6,face:gl?headingTo(c.px,c.pz,gl.x,gl.z):undefined,turn:1.4};}
  if(r==='run'){// out: flat out along the drain for the mouth, ahead of you, looking back; then to the bike
   if(cs>=0){const pv=p.walking?(p.speed||0):0;
    if(ps>=0&&ps>cs+7)return {x:c.px,z:c.pz,v:0,look:gl||{x:p.x,z:p.z,y:camera.position.y},face:headingTo(c.px,c.pz,p.x,p.z),turn:2.5};// (you have fallen behind: he waits, turned back to you)
    const isJ=c===jamie,lead=isJ?3.4+1.1*Math.sin(C.t*.73):1.5+.7*Math.sin(C.t*.91+1.3),want=(ps>=0?ps:cs)-lead;
    let t=isJ?.45*Math.sin(C.t*.47):-.55+.3*Math.sin(C.t*.83);if(C.bike==='relocated'&&cs>RL.s-3&&cs<RL.s+8)t=1.25+(isJ?.15:-.1);// (round the bike on the open side)
    const st=C.stumble&&C.stumble.c===c?C.t-C.stumble.at:99,stum=st<1.15,q=cs>5?tq(cs-3.5,t):Wd.fromA(5.5,isJ?.9:-.9);
    let v=clamp(Math.max(pv,3.2)+(cs-want)*1.3,2.8,6.3);if(stum)v=st<.75?.9:3.2;
    return {x:q.x,z:q.z,v,look:gl,gesture:stum?GEST.stumble(Math.sin(Math.PI*clamp(st/1.15,0,1))):undefined};}// (near the mouth: on out onto the apron)
   const b={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43};if(Math.hypot(b.x-c.px,b.z-c.pz)<.45)return null;return {x:b.x,z:b.z,v:3.4,look:gl};}
  if(r==='frame'){// stopped dead, either side of you, a step ahead: both lights on him at the end of the straight
   const f=C.frame?.[c.key];if(!f)return {x:c.px,z:c.pz,v:0,look:gl};const lk=typeof f.look==='function'?f.look():f.look,d=Math.hypot(f.x-c.px,f.z-c.pz);
   const g=c===jamie&&C.pointAt?GEST.point(smooth((C.t-C.pointAt)/.5)*(1-smooth((C.t-C.pointAt-6)/.8))):GEST.tense(1);
   if(d>.3)return {x:f.x,z:f.z,v:Math.min(2.4,.7+d*1.3),look:lk};
   return {x:c.px,z:c.pz,v:0,look:lk,face:f.face,turn:1.6,gesture:g};}
  if(r==='point'){const at=C.point?.[c.key];if(!at)return {x:c.px,z:c.pz,v:0,look:gl};return {x:at.x,z:at.z,look:(typeof at.look==='function'?at.look():at.look)||gl,max:at.max||2,face:at.face};}
  return {x:c.px,z:c.pz,v:0,look:gl};}
 function glance(c,at,secs=2){C.glance[c.key]={at,until:C.t+secs};}
 // ---- the night's ordinary sounds, and their going -------------------------------------------------------------
 const loopsAt={ac:[AH.toWorld(-AH.w/2-.55,-AH.depth*.2),side(46,22),main(600,-20)],tv:main(612,-16),sprinkler:side(62,13)};
 function updateAmb(dt){const ph=S.phase;if(day()||ph==='c3-night'){for(const kk in C.amb)C.amb[kk]=kk==='forest'||kk==='tunnel'||kk==='water'?0:1;return;}
  const s=roadS(),ds=drainS();let want;
  if(ds>=0)want={traffic:0,life:0,insects:0,wind:0,forest:1-smooth(ds/12),tunnel:smooth(ds/10),water:.6};
  else{const d=s<-500?0:s;want={traffic:1-smooth((d+4)/90),life:1-smooth((d-20)/120),insects:1,wind:1-.4*smooth((d-380)/80),forest:smooth((d-30)/120),tunnel:0,water:smooth((d-400)/120)};}
  for(const kk in want){C.amb[kk]=damp(C.amb[kk]??0,want[kk],want[kk]>(C.amb[kk]??0)?.4:.35,dt);}
  C.dogT-=dt;if(C.dogT<=0){C.dogT=22+((C.t*7.3)%14);if(C.amb.life>.6&&/^n3-(home|corner|ride|safe)$/.test(ph)){const p=me();o.sfx('dog',{x:p.x+40,y:2,z:p.z-55},{gain:.5*C.amb.life});}}}
 // ---- scenes ---------------------------------------------------------------------------------------------------
 function dayWorld(){A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);ambient.night?.(false);ambient.morning?.(true);WN?.setLimit(140);
  old.group.visible=false;C.bike='none';helmet.visible=false;evidence.visible=false;marks.visible=true;figure.group.visible=false;A.barLight=false;
  const door=AH.toWorld(AH.doorX+1.15,AH.stepFront+.85);mom.show(true);mom.place(door.x,door.z,headingTo(door.x,door.z,side(127,0).x,side(127,0).z));mom.gest('fold');mom.lookAt=null;
  for(const [key,a] of Object.entries(N)){const q=NSPOT[key];a.show(true);a.place(q.at.x,q.at.z,headingTo(q.at.x,q.at.z,q.face.x,q.face.z));a.gest(q.gest);a.lookAt=null;}
  world.doors.alex?.set(0);}
 function nightWorld(){A.day=0;A.night=1;ch2.day=0;S.deep=A.deep=.8;o.flashShadow?.(true);o.nightRendering?.(true);ambient.morning?.(false);ambient.night?.(true);document.body?.classList?.add('night1');S.flags.night=true;WN?.setLimit(null);
  for(const a of [...k.adults,...ch2.extra,...people])a.show(false);for(const b of ch2.beams){b.on=false;}ch2.found.group.visible=false;ch2.tape.visible=false;ch2.flyers.visible=true;
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;placeOld('tunnel');helmet.visible=true;evidence.visible=true;marks.visible=true;branch.visible=true;
  police.reset?.();carA.show(false);carB.show(false);
  world.alexWindow.emissiveIntensity=.85;world.doors.alex?.set(0);o.setFlashlight?.(true,false);S.flashOn=false;}
 // ---- the day ----------------------------------------------------------------------------------------------------
 function begin(){fresh();go('c3-black');C.cardT=0;o.fade(1);dayWorld();S.lookTarget=null;S.jamieAim=null;S.samAim=null;objective('');T?.reset();
  for(const c of [jamie,sam]){c.lookAt=null;c.lookPlayer=false;}}
 function opening(){go('d3-corner');date(DAY.start,'AM');C.fadeIn=0;
  talk([{wait:1.6},{who:'JAMIE',text:'“If Alex heard it before he left…”',from:jamie,time:2.4,gap:.7},{who:'SAM',text:'“What?”',from:sam,time:1.2,gap:.7},
   {who:'JAMIE',text:'“Maybe yesterday wasn’t the first time.”',from:jamie,time:2.6,gap:.9},
   {who:'YOU',text:'“His mom would know.”',time:1.8,gap:.5},{who:'JAMIE',text:'“She knows us. Come on.”',from:jamie,time:1.8}],
   {then:()=>{go('d3-street');objective('Talk to Alex’s mom.','Down Briarwood, around the bend past the creek.');checkpoint('chapter3-start');follow(true);}});}
 const momSpot=()=>mom.pos;
 function momTalk(){if(C.flags.momTalk)return;C.flags.momTalk=true;go('d3-mom');objective('');const p=me();mom.gest(null);mom.faceTo(p.x,p.z);mom.lookAt=camera.position;
  for(const c of [jamie,sam])c.lookAt=mom.pos;
  talk([{who:'ALEX’S MOM',text:'“Hi, boys.”',from:mom,time:1.6,gap:.6},{who:'JAMIE',text:'“Hi.”',from:jamie,time:1.1,gap:.9},
   {who:'ALEX’S MOM',text:'“I keep thinking he’s going to come around that corner.”',from:mom,time:3.2,gap:1.2,act:()=>{mom.lookAt=side(100,2);}},
   {who:'JAMIE',text:'“Did Alex ever say anything about hearing stuff? At night? Like a bike bell?”',from:jamie,time:3.4,act:()=>{mom.lookAt=camera.position;}},
   {who:'ALEX’S MOM',text:'“He kept asking if I heard a bike bell outside. At night.”',from:mom,time:3.4,gap:.5,act:()=>{T?.set(.08,{why:'his mom: he asked me that'});}},
   {who:'ALEX’S MOM',text:'“Thursday, Friday. Maybe Saturday. I told him it was the neighbor kids, and to go to sleep.”',from:mom,time:4.4,gap:1,act:()=>{jamie.lookAt=sam.pos;sam.lookAt=jamie.pos;}},
   {who:'ALEX’S MOM',text:'“Why?”',from:mom,time:1.2,gap:1.1},{who:'JAMIE',text:'“…No reason.”',from:jamie,time:1.6,gap:.8,act:()=>{for(const c of [jamie,sam])c.lookAt=mom.pos;}},
   {who:'ALEX’S MOM',text:'“Go on up to his room, if you want. Just don’t move anything.”',from:mom,time:3.2,act:()=>{mom.lookAt=AH.porchLight?RW(AH.doorX,AH.front):camera.position;}}],
   {then:()=>{T?.ease(0,{fall:.05});go('d3-mom');C.flags.invited=true;objective('Go up to Alex’s room.','The front door.');world.doors.alex?.set(.55);mom.gest('fold');}});}
 // Into the house (a short fade) and up to his room; out again the same way.
 function toRoom(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>{enterRoom();C.fadeIn=0;};}
 function enterRoom(){roomOn(true);go('d3-room');date(DAY.room,'AM');checkpoint('alex-bedroom');objective('Look around Alex’s room.');mom.show(false);world.doors.alex?.set(0);
  const e=RW(R.enter.x,R.enter.z),c0=RW((R.x0+R.x1)/2,(R.z0+R.z1)/2),r=o.roam;o.placePlayer({x:e.x,z:e.z,a:headingTo(e.x,e.z,c0.x,c0.z),mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});
  const jq=RW(R.standJamie.x,R.standJamie.z),sq=RW(R.standSam.x,R.standSam.z);putFoot(jamie,jq,headingTo(jq.x,jq.z,c0.x,c0.z));putFoot(sam,sq,headingTo(sq.x,sq.z,c0.x,c0.z));follow(false);
  jamie.py=null;sam.py=null;phone.visible=true;C.recSel=RECS.length-1;C.recPlaying=-1;drawScreen();C.roomT=0;
  talk([{wait:1.2},{who:'SAM',text:'“It’s weird being in here without him.”',from:sam,time:2.6,gap:.6}]);}
 function phoneNoticed(){if(C.flags.phoneSeen)return;C.flags.phoneSeen=true;const ph=phone.position;jamie.lookAt=ph;sam.lookAt=ph;C.flags.phoneReady=true;objective('Listen to Alex’s recordings.');
  talk([{who:'JAMIE',text:'“His phone. The cops went through it and gave it back.”',from:jamie,time:2.8,gap:.5},
   {who:'JAMIE',text:'“He records stuff on it. Noises. Check the last one.”',from:jamie,time:2.6}]);}
 // His helmet on the desk: when you look at it (or, if you never do, once the recording has been heard).
 function helmetLines(){if(C.flags.helmetLine)return;C.flags.helmetLine=true;const hp=RW(R.helmet.x,R.helmet.z,R.helmet.y+.08);sam.lookAt=hp;jamie.lookAt=hp;
  talk([{who:'SAM',text:'“His helmet’s still here.”',from:sam,time:1.8},{who:'JAMIE',text:'“He never rides without it. His mom makes him.”',from:jamie,time:2.6,act:()=>{later(2.4,()=>{if(jamie.lookAt===hp)jamie.lookAt=null;if(sam.lookAt===hp)sam.lookAt=null;});}}]);}
 function startPhone(){if(C.flags.phone)return;C.flags.phone=true;go('d3-phone');checkpoint('phone-recording');objective('');C.recSel=RECS.length-1;drawScreen();const ph=phone.position,p=me(),a=headingTo(p.x,p.z,ph.x,ph.z),at={x:ph.x-Math.sin(a)*.4,z:ph.z+Math.cos(a)*.4};
  pose(at,{y:nav.groundY(at.x,at.z)+1.12,pitch:-.74,look:ph});jamie.lookAt=ph;sam.lookAt=ph;}
 function playRec(){if(C.recPlaying>=0)return;const i=C.recSel,R2=RECS[i];if(!R2)return;C.recPlaying=i;drawScreen();const dur=o.audio()?.recording?.(i,phone.position)||[8.6,9,8.2,9.4,23.5][i];C.recEnd=C.t+dur;C.heard.push(i);
  if(i===4){T?.set(.12,{rise:.05,why:'the last recording'});}
  talk(R2.lines.map(l=>l.mark?{...l,act:()=>{if(l.mark==='bell1'){T?.set(.24,{rise:.08,why:'recorded bell'});}else if(l.mark==='bell2')T?.set(.29,{rise:.08,why:'recorded bell again'});else T?.set(.31,{rise:.06,why:'“there it is again”'});}}:l),{interrupt:true});}
 function recDone(){const i=C.recPlaying;C.recPlaying=-1;const R2=RECS[i];
  // (then the next older one not yet heard, if you want it)
  let n=-1;for(let k2=RECS.length-1;k2>=0;k2--)if(!C.heard.includes(k2)){n=k2;break;}C.recSel=n;drawScreen();
  if(i<RECS.length-1){if(R2.react.length)talk(R2.react.map(l=>({...l,from:l.by==='sam'?sam:jamie})));return;}
  // the one that matters: you put the phone down while they talk
  C.flags.recorded=true;T?.ease(.14,{fall:.02,hold:6});unpose();go('d3-window');C.flags.canLeave=true;
  talk([{wait:1.2},{who:'SAM',text:'“That’s a bike bell.”',from:sam,time:1.8},{who:'JAMIE',text:'“That’s the same one. That’s exactly what we heard.”',from:jamie,time:2.8,gap:.8},
   {who:'YOU',text:'“‘There it is again.’ He’d heard it before.”',time:2.6,gap:.9},
   {who:'JAMIE',text:'“He recorded it right there. At his window.”',from:jamie,time:2.6,act:()=>{const w=RW(R.sideWindow.glass.x,R.sideWindow.glass.z,1.4);jamie.lookAt=w;sam.lookAt=w;}}],
   {then:()=>{objective('Look out his window.');}});}
 function lookOut(){if(C.flags.window)return;C.flags.window=true;const creek=side(100,26);
  talk([{wait:.6},{who:'JAMIE',text:'“That’s the creek. Behind the trees.”',from:jamie,time:2.4,act:()=>{jamie.lookAt=creek;}},{who:'YOU',text:'“Where his bike was.”',time:2,gap:.8},
   {who:'SAM',text:'“So that’s where it was coming from. Every night.”',from:sam,time:2.8,gap:1},
   {who:'JAMIE',text:'“Somebody else on his street had to hear it. Mr. Okafor’s up all night.”',from:jamie,time:3.4}],
   {then:()=>{jamie.lookAt=null;sam.lookAt=null;okaforNext();C.flags.canLeave=true;}});}
 // Who on his street would have heard it: the man next door, who is up all night.
 function okaforNext(){C.flags.okaforHint=true;objective('Ask Mr. Okafor.','Next door to Alex’s. He’s up all night.');}
 function leaveRoom(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>{exitRoom();C.fadeIn=0;};}
 function exitRoom(){roomOn(false);phone.visible=false;if(C.recPlaying>=0){C.recPlaying=-1;o.audio()?.stopRecording?.();}go('d3-neighbors');date(DAY.street,'AM');checkpoint('neighbor-investigation');
  const out=AH.toWorld(AH.doorX,AH.stepFront+1.3),street=side(127,0),a=headingTo(out.x,out.z,street.x,street.z),r=o.roam;o.placePlayer({x:out.x,z:out.z,a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});
  const j=AH.toWorld(AH.doorX-1.4,AH.stepFront+1.1),s2=AH.toWorld(AH.doorX+1.3,AH.stepFront+.9);putFoot(jamie,j,a);putFoot(sam,s2,a);follow(true);
  if(!C.flags.okaforHint)talk([{wait:.8},{who:'JAMIE',text:'“Somebody else on his street had to hear it. Mr. Okafor’s up all night.”',from:jamie,time:3.4}]);okaforNext();}
 // ---- asking around ---------------------------------------------------------------------------------------------
 const SAY={huang:[['MR. HUANG','“Morning, boys. I hope they find him. I really do.”']],
  delaney:[['MRS. DELANEY','“You boys shouldn’t be out riding around today.”']],
  pruitt:[['MR. PRUITT','“The dogs were going nuts Saturday night. Every dog on the street.”']],
  okafor:[['MR. OKAFOR','“You’re Alex’s friends.”'],['YOU','“Did you ever hear a bike bell at night?”'],['MR. OKAFOR','“…Yes. A few nights this week. Late. Down toward the end of the street.”'],
   ['MR. OKAFOR','“End of Briarwood, past the last house, there’s a gate. An old city road goes down from there to the big storm drain.”','point'],['MR. OKAFOR','“Your creek ends up down there. All of it does. You boys stay off it.”']]};
 function askNeighbor(key){if(C.talked.has(key)||busy())return;C.talked.add(key);const a=N[key],p=me();a.gest(null);a.faceTo(p.x,p.z);a.lookAt=camera.position;for(const c of [jamie,sam])c.lookAt=a.pos;
  const by={JAMIE:jamie,SAM:sam,YOU:null};
  talk(SAY[key].map(([who,text,g])=>({who,text,from:by[who]===undefined?a:by[who],act:g==='point'?()=>{a.gest('point',side(250,0));}:null,gap:.5})),{range:9,from:a,then:()=>{a.lookAt=null;a.gest(NSPOT[key].gest);for(const c of [jamie,sam])c.lookAt=null;
   if(key==='okafor'){C.flags.okafor=true;go('d3-road');objective('Find the old service road.','The end of Briarwood, past the last house.');}}});}
 // ---- the end of Briarwood, by day -----------------------------------------------------------------------------
 function roadDay(){if(C.flags.roadDay)return;C.flags.roadDay=true;go('d3-tracks');checkpoint('c3-road-day');date(DAY.road,'AM');objective('');
  talk([{who:'JAMIE',text:'“There.”',from:jamie,time:1.2,gap:.8},{who:'SAM',text:'“That’s not a road. That’s a gate into the woods.”',from:sam,time:2.6,gap:1},
   {who:'JAMIE',text:'“It says ‘maintenance access’. It’s a road.”',from:jamie,time:2.6}],{then:()=>{objective('Go through the gate.');}});}
 function tracksSeen(){if(C.flags.tracks)return;C.flags.tracks=true;S.jamieAim=null;const q=Wd.at(16,Wd.halfW(16)-.3);const at={x:q.x,z:q.z,y:nav.groundY(q.x,q.z)};for(const c of [jamie,sam])c.lookAt=at;S.lookTarget=at;T?.set(.12,{rise:.04,why:'a track going in'});
  talk([{who:'JAMIE',text:'“Look. Down there by the edge.”',from:jamie,time:2.2},{who:'YOU',text:'“A bike. One tire.”',time:1.8,gap:.8},{who:'SAM',text:'“Somebody walked it in. It’s all wobbly.”',from:sam,time:2.6,gap:1},
   {who:'JAMIE',text:'“And the weeds by the gate are pushed down. That’s from today. Or last night.”',from:jamie,time:3.4}],{then:()=>{S.lookTarget=null;for(const c of [jamie,sam])c.lookAt=null;objective('See where the tracks lead.');}});}
 function dayStop(){if(C.flags.dayStop)return;C.flags.dayStop=true;go('d3-plan');objective('');still(jamie,sam);const bend=Wd.spots.bend;for(const c of [jamie,sam])c.lookAt={x:bend.x,z:bend.z,y:bend.y+1.4};T?.set(.16,{why:'where it goes into the woods'});
  talk([{wait:.6},{who:'SAM',text:'“Okay. That’s far enough.”',from:sam,time:2},{who:'JAMIE',text:'“It just keeps going. Down into the woods.”',from:jamie,time:2.6,gap:1.4},
   {who:'JAMIE',text:'“We have to come back tonight.”',from:jamie,time:2.2},{who:'SAM',text:'“No.”',from:sam,time:1.2,gap:.8},
   {who:'JAMIE',text:'“He heard it at night. We heard it at night. Whatever it is, it’s not out here in the daytime.”',from:jamie,time:4},
   {who:'SAM',text:'“Alex is missing. Like, actually missing. And you want to come back here in the dark?”',from:sam,time:4.2,gap:1.2},
   {who:'JAMIE',text:'“You don’t have to come.”',from:jamie,time:1.8,gap:2.6},{who:'SAM',text:'“…If anything happens, we leave. Right away. I’m serious.”',from:sam,time:3.4},
   {who:'JAMIE',text:'“Eleven. The corner. Bring a flashlight.”',from:jamie,time:2.6}],
   {then:()=>{for(const c of [jamie,sam])c.lookAt=null;go('d3-home');T?.ease(0,{fall:.05});objective('Go home.','Tonight: the corner of Oak Hollow and Briarwood. Eleven.');date(DAY.leave,'AM');C.leftAt={...me()};C.homeT=0;follow(true);}});}
 // ---- the night ------------------------------------------------------------------------------------------------
 const home=()=>ch2.homeHouse;
 function toNight(){go('c3-night');C.cardT=0;card(true,'That night');}
 function nightStart(){go('n3-home');nightWorld();for(const kk in C.amb)C.amb[kk]=kk==='forest'||kk==='tunnel'||kk==='water'?0:1;T?.reset();T?.set(.04,{why:'night, home'});date(NIGHT.home,'PM');checkpoint('night-start');
  const h=home(),q=main(h.drivD-.4,h.side*10.2),b=main(h.drivD+.5,h.side*9.4),look=main(h.drivD+14,h.side*2),road=main(h.drivD+.5,0);
  o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,look.x,look.z),mode:'walk',bike:{x:b.x,z:b.z,a:headingTo(b.x,b.z,road.x,road.z)}});o.setFlashlight?.(true,false);
  comp.reset();const jq=main(598.5,4.4),sq=main(600.4,2.2);comp.putRiding(jamie,jq.x,jq.z,heading(598.5)+Math.PI*.9,0);comp.putRiding(sam,sq.x,sq.z,heading(600.4)-Math.PI*.3,0);
  for(const c of [jamie,sam]){c.follow=null;c.lookAt=null;}follow(false);
  objective('Meet Jamie and Sam at the corner.','Oak Hollow and Briarwood. Eleven.');C.fadeIn=0;
  talk([{wait:4.5},{who:'',text:'The house was dark. Nobody heard me go.',time:4.2}]);}
 function meet(){if(C.flags.met)return;C.flags.met=true;go('n3-corner');date(NIGHT.corner,'PM');for(const c of [jamie,sam])c.lookPlayer=true;
  talk([{who:'JAMIE',text:'“You came.”',from:jamie,time:1.6},{who:'SAM',text:'“My mom checks on me at like one. We have to be back way before that.”',from:sam,time:3.6},{who:'JAMIE',text:'“We will.”',from:jamie,time:1.4,gap:.8},
   {who:'JAMIE',text:'“Lights off till we’re past his house.”',from:jamie,time:2.2}],
   {then:()=>{for(const c of [jamie,sam])c.lookPlayer=false;go('n3-ride');objective('Ride to the end of Briarwood.','Past Alex’s house, to the old road.');follow(true);T?.set(.08,{rise:.02,why:'riding there'});}});}
 // The old road at night. Lights on (yours taped to your handlebars), and they ride closer than they need to.
 function roadNight(){if(C.flags.roadNight)return;C.flags.roadNight=true;go('n3-road');date(NIGHT.road,'PM');checkpoint('c3-road-night');objective('Follow the old road.');
  o.setFlashlight?.(true,true);S.flashOn=true;ch2.samBeam.on=true;A.barLight=true;o.sfx('click',{...camera.position},{gain:.5});T?.set(.12,{rise:.03,why:'the old road, at night'});
  for(const c of [jamie,sam])c.tight=1;follow(true);
  talk([{wait:1},{who:'SAM',text:'“This is so stupid.”',from:sam,time:1.8,gap:1.2},{who:'JAMIE',text:'“Lights.”',from:jamie,time:1.2,act:()=>{o.sfx('click',{x:jamie.bx,y:1,z:jamie.bz},{gain:.6});}}]);}
 // Arriving at the outfall: off the bikes on the pad, the mouth in their lights.
 function arriveOutfall(){if(C.flags.outfall)return;C.flags.outfall=true;go('n3-outfall');checkpoint('c3-tunnel-entrance');date(NIGHT.outfall,'PM');objective('');mark('the outfall');
  T?.set(.3,{rise:.05,why:'the drain'});const mouth={x:DS.mouth.x,z:DS.mouth.z,y:DS.mouth.y+1.6};S.jamieAim=mouth;S.samAim=mouth;
  talk([{wait:1.2},{who:'SAM',text:'“That’s the drain?”',from:sam,time:1.8,gap:.9},{who:'JAMIE',text:'“That’s where the creek goes. Behind Alex’s. All of it comes out here.”',from:jamie,time:3.4,gap:1.2},
   {who:'SAM',text:'“We are not going in there.”',from:sam,time:2,gap:1.6},{who:'JAMIE',text:'“The tracks went this way.”',from:jamie,time:2.2,gap:.6}],
   {then:()=>{S.jamieAim=null;S.samAim=null;objective('Enter the drain.');C.flags.canEnter=true;}});}
 function enterDrain(){if(C.flags.inside)return;C.flags.inside=true;go('n3-tunnel');date(NIGHT.inside,'PM');objective('');follow(false);A.barLight=false;
  for(const c of [jamie,sam]){c.lookAt=null;c.tight=0;}role(jamie,'lead');role(sam,'behind');T?.set(.32,{rise:.03,why:'inside'});C.inAt=C.t;
  talk([{wait:5},{who:'SAM',text:'“It smells like the creek.”',from:sam,time:2,gap:2.5},{wait:9},{who:'JAMIE',text:'“Don’t touch the walls.”',from:jamie,time:1.8}]);}
 function deepIn(){if(C.flags.deep)return;C.flags.deep=true;checkpoint('c3-tunnel-deep');T?.set(.36,{rise:.03,why:'the way out is out of sight'});glance(sam,lookAhead(80,0,1.4),2.6);
  talk([{wait:.8},{who:'SAM',text:'“I can’t see the way out anymore.”',from:sam,time:2.4,act:()=>{S.samAim=lookAhead(80,0,1.2);}},{who:'JAMIE',text:'“It’s just the bend.”',from:jamie,time:1.6,act:()=>{S.samAim=null;}},
   {wait:6},{who:'SAM',text:'“It’s getting smaller.”',from:sam,time:1.8}]);}
 // Footprints in the silt, and a tire line beside them, going the same way you are.
 function evidenceSeen(){if(C.flags.prints)return;C.flags.prints=true;go('n3-evidence');mark('footprints');T?.set(.42,{rise:.06,why:'footprints'});S.jamieAim=printsAt;S.samAim=printsAt;
  hold(jamie,{look:printsAt,gesture:t=>GEST.crouch(smooth(t/.7)),until:C.t+7});
  talk([{who:'JAMIE',text:'“Look.”',from:jamie,time:1.2,gap:.8},{who:'SAM',text:'“Footprints.”',from:sam,time:1.4,gap:.6},{who:'YOU',text:'“Somebody walked in here.”',time:2},
   {who:'JAMIE',text:'“Pushing a bike. See? One tire.”',from:jamie,time:2.2,gap:1.2},{who:'SAM',text:'“It could be anybody.”',from:sam,time:1.8},{who:'JAMIE',text:'“…Yeah. Could be.”',from:jamie,time:1.6}],
   {then:()=>{S.jamieAim=null;S.samAim=null;go('n3-tunnel');objective('See where the tracks lead.');C.printsAt=C.t;}});}
 // Something knocks on metal, up the manhole shaft. They both look up.
 function knock(){if(C.flags.knock)return;C.flags.knock=true;mark('a knock up the shaft');const up={x:Dr.ladder.x,z:Dr.ladder.z,y:Dr.ladder.y+Dr.sizeAt(Dr.ladder.s).h+2.6};o.sfx('tap',up,{gain:.7});
  hold(jamie,{look:up,until:C.t+3.6});hold(sam,{look:up,gesture:t=>GEST.tense(smooth(t/.3)),until:C.t+3.2});S.jamieAim=up;T?.jolt(.48,{rise:.6,hold:2,why:'a knock, up the shaft'});
  talk([{who:'',text:'[Something taps on metal, high up the shaft.]',time:2.6},{who:'SAM',text:'“What was that?”',from:sam,time:1.6,gap:.9},{who:'JAMIE',text:'“The lid. It’s just the lid.”',from:jamie,time:2}],
   {then:()=>{S.jamieAim=null;T?.ease(.42,{fall:.03});}});}
 // The first bell, far ahead, deeper in.
 const BELL1=lookAhead(262,0,1.1);
 function bellFar(){if(C.flags.bell1)return;C.flags.bell1=true;go('n3-bell');mark('a bell, far ahead');C.bell1At=C.t;o.audio()?.bell3?.(BELL1,1.1,{tunnel:true,ref:9});C.heardBells.push({pos:BELL1,at:C.t,tunnel:true,far:true});
  T?.jolt(.56,{rise:.7,hold:3,why:'a bell, far ahead'});hold(jamie,{look:BELL1,until:C.t+5});hold(sam,{look:BELL1,gesture:t=>GEST.tense(1),until:C.t+5});later(.25,()=>{S.jamieAim=lookAhead(150,0,1.2);});later(.6,()=>{S.samAim=lookAhead(150,0,1.2);});
  talk([{who:'',text:'[A bicycle bell. Far ahead, deeper in.]',time:2.8},{wait:1.4},{who:'SAM',text:'“No.”',from:sam,time:1.2,gap:.8},{who:'JAMIE',text:'“It came from down there.”',from:jamie,time:2},
   {who:'SAM',text:'“Then we go back. Right now.”',from:sam,time:2,gap:1.6},{who:'JAMIE',text:'“Just a little farther.”',from:jamie,time:1.8}],
   {interrupt:true,then:()=>{S.jamieAim=null;S.samAim=null;go('n3-tunnel');role(sam,'behind');objective('Keep going.');T?.ease(.46,{fall:.03});}});}
 // His helmet, from his desk, in the silt: he was here, and not long ago. Jamie goes to it; Sam backs away from it and
 // turns toward the way out. They do not agree about what it means.
 function itemSeen(){if(C.flags.item)return;C.flags.item=true;go('n3-item');mark('his helmet, down here');objective('');const at={x:itemAt.x,y:itemAt.y+.05,z:itemAt.z};
  T?.jolt(.6,{rise:.5,hold:5,why:'his helmet, down here'});S.jamieAim=at;later(.45,()=>{S.samAim=at;});
  C.point={jamie:{...tq(IT.s-1.1,-.35),look:at,max:1.8}};role(jamie,'point');later(1.4,()=>hold(jamie,{look:at,gesture:t=>GEST.crouch(smooth(t/.7)),until:C.t+6}));hold(sam,{look:at,gesture:t=>GEST.tense(1),until:C.t+4});
  const out=()=>lookAhead(clamp(cS(sam)-14,1,Dr.len),0,1.3);
  talk([{wait:1.8},{who:'JAMIE',text:'“…That’s his helmet.”',from:jamie,time:2,gap:1.3},
   {who:'SAM',text:'“That was on his desk. This morning.”',from:sam,time:2.6,gap:1.4,act:()=>{hold(sam,{face:()=>Dr.at(clamp(cS(sam),1,Dr.len-1)).a+Math.PI,look:out,gesture:t=>GEST.recoil(.55*smooth(t/.5)),until:C.t+12});S.samAim=out();T?.jolt(.66,{rise:.4,hold:5,why:'it was on his desk this morning'});}},
   {who:'SAM',text:'“We need to tell somebody. Right now.”',from:sam,time:2.4,gap:.9},{who:'JAMIE',text:'“He was here. Tonight.”',from:jamie,time:2,gap:1},
   {who:'SAM',text:'“Jamie. That’s why.”',from:sam,time:1.8,gap:1.3},{who:'JAMIE',text:'“Just to the end. Then we go.”',from:jamie,time:2.2}],
   {then:()=>{S.jamieAim=null;S.samAim=null;go('n3-tunnel');role(jamie,'lead');objective('Keep going.');T?.ease(.5,{fall:.02});C.itemAt=C.t;
    // (Sam stays turned toward the way out a little longer, then comes)
    later(3.2,()=>{if(C.role.sam!=='behind'||C.hold.sam)role(sam,'behind');});}});}
 // The bike.
 function oldBikeSeen(){if(C.flags.oldBike)return;C.flags.oldBike=true;go('n3-bike');checkpoint('c3-old-bike');date(NIGHT.bike,'PM');objective('');const b=old.group.position,at={x:b.x,y:b.y+.7,z:b.z};mark('the bike');
  S.jamieAim=at;later(.5,()=>{S.samAim=at;});hold(jamie,{look:at,until:C.t+9});hold(sam,{look:at,until:C.t+9});T?.set(.6,{rise:.12,why:'the bike from the oak'});
  talk([{who:'JAMIE',text:'“…No way.”',from:jamie,time:1.6,gap:.9},{who:'SAM',text:'“Is that—”',from:sam,time:1.2,gap:.6},{who:'JAMIE',text:'“That’s the bike. From the oak.”',from:jamie,time:2.2,gap:1.4},
   {who:'SAM',text:'“I see it. I see it this time.”',from:sam,time:2.2,gap:1.6},{who:'YOU',text:'“How did it get down here?”',time:2.2}],
   {then:()=>{objective('Look at the bike.');C.flags.canInspect=true;C.inspectWait=0;}});}
 function inspectOld(){if(C.flags.inspected)return;C.flags.inspected=true;objective('');const b=old.group.position,p=me(),a=headingTo(p.x,p.z,b.x,b.z),at={x:b.x-Math.sin(a)*.85,z:b.z+Math.cos(a)*.85};
  pose(at,{y:nav.groundY(at.x,at.z)+.92,pitch:-.42,look:b});
  talk([{wait:1},{who:'YOU',text:'“The license sticker. Four-one-seven.”',time:2.2},{who:'JAMIE',text:'“It’s wet. It wasn’t wet at the oak.”',from:jamie,time:2.4}],{then:()=>{objective('Try the bell.');C.flags.canBell=true;C.bellWait=0;}});}
 // The bell: the lever moves a little, a dry click. That is all it does.
 function tryBell(by='you'){if(!C.flags.canBell)return;C.bellTries++;const lever=old.bell.lever,bp=oldBellPos();
  lever.rotation.x=-.05;later(.18,()=>{lever.rotation.x=0;});o.sfx('click',{x:bp.x,y:bp.y,z:bp.z},{gain:.9});mark('the bell: a click');
  if(C.bellTries===1)talk([{who:'',text:'[A dry click. The lever barely moves.]',time:2.4},{who:'SAM',text:by==='jamie'?'“Jamie, don’t.”':'“Don’t.”',from:sam,time:1.2}]);
  if(C.bellTries>=2&&!C.flags.belled){C.flags.belled=true;C.flags.canBell=false;objective('');unpose();
   talk([{wait:.8},{who:'JAMIE',text:'“It doesn’t ring. It never did.”',from:jamie,time:2.4},{wait:5.5,act:()=>{T?.ease(.5,{fall:.02});}},{act:bellClean,wait:.1}]);}}
 // After the silence, a clear bell, farther in. Not this one.
 const BELL2=lookAhead(232,-.5,1.1);
 function bellClean(){if(C.flags.bell2)return;C.flags.bell2=true;mark('a clear bell, farther in');o.audio()?.bell3?.(BELL2,1.05,{tunnel:true,ref:7});C.heardBells.push({pos:BELL2,at:C.t,tunnel:true});
  T?.jolt(.66,{rise:.8,hold:4,why:'a clear bell, ahead'});hold(jamie,{look:BELL2,until:C.t+4});hold(sam,{look:BELL2,gesture:t=>GEST.tense(1),until:C.t+4});S.jamieAim=lookAhead(205,0,1.2);
  talk([{who:'',text:'[A bell. Clear. Somewhere ahead.]',time:2.6},{wait:1.2},{who:'JAMIE',text:'“That’s not this one.”',from:jamie,time:1.8,gap:1},{who:'SAM',text:'“Jamie—”',from:sam,time:1}],
   {then:()=>{S.jamieAim=null;go('n3-deeper');role(jamie,'lead');role(sam,'behind');objective('');C.deeperAt=C.t;}});}
 // He is already down there, at the far end of the deep box, standing in the water, facing back up it. Nobody has seen him.
 function figureReady(){FG.road=null;FG.state='unseen';FG.s=DD.figure.s;FG.t=DD.figure.t;FG.v=0;FG.yaw=Math.PI;FG.look=0;FG.turnV=0;FG.hidden=0;figure.group.visible=true;placeFigure(0);}
 // Behind them, where the bike was leaning: nothing. Nobody saw it go (it goes only while nobody is looking).
 function bikeGoneNoticed(by){if(C.flags.bikeGone)return;C.flags.bikeGone=true;C.bikeGoneBy=by;mark('the bike is gone');const at=oldSpot;
  T?.jolt(.64,{rise:.6,hold:4,why:'the bike, gone'});hold(sam,{face:headingTo(sam.px,sam.pz,at.x,at.z),look:at,gesture:t=>GEST.tense(1),until:C.t+5.5,turn:2.2});S.samAim=at;
  later(.8,()=>{hold(jamie,{face:headingTo(jamie.px,jamie.pz,at.x,at.z),look:at,until:C.t+4.2,turn:2});S.jamieAim=at;});
  talk([{who:'SAM',text:by==='you'?'“…Where’s the bike?”':'“Guys. The bike.”',from:sam,time:1.8,gap:1.6},{who:'SAM',text:'“It was right there.”',from:sam,time:1.8,gap:1.4},{who:'JAMIE',text:'“Don’t. Just— keep going.”',from:jamie,time:2.2}],
   {then:()=>{S.jamieAim=null;S.samAim=null;}});}
 // The boy at the end of the light. Jamie stops dead; Sam stops beside you; both lights go to the far end of the straight,
 // and he is standing there. He does not go until you have seen him, and seen him for a while.
 function startReveal(){if(C.flags.figure)return;C.flags.figure=true;go('n3-figure');checkpoint('c3-alex-lure');mark('someone down there');objective('');
  if(FG.state!=='unseen')figureReady();FG.state='first-reveal';
  const ps=Math.max(drainS(),2),a=Dr.at(ps).a,fc=figChest;C.fig={t0:C.t,seenT:0,seenAt:null,nudge:0,alexAt:null,unseenGo:false,distAtSeen:null};
  // (either side of you, a step ahead, about a metre out: Jamie on your right, Sam on your left, so your own line down the
  // tunnel to him stays clear between them; against a wall, the one with no room goes to the other side, a step deeper)
  const pq=Dr.project(me().x,me().z),pt=pq?pq.t:0,lim=Dr.sizeAt(ps).w/2-.38;let tJ=Math.min(pt+.85,lim),tS=Math.max(pt-.85,-lim),sJ=ps+1.5,sS=ps+1.35;
  if(tJ-pt<.7){tJ=Math.max(pt-1.05,-lim);tS=Math.max(pt-.75,-lim);sJ=ps+2.1;sS=ps+1.1;}else if(pt-tS<.7){tS=Math.min(pt+1.05,lim);tJ=Math.min(pt+.75,lim);sS=ps+2.1;sJ=ps+1.1;}
  C.frame={jamie:{...tq(sJ,tJ),face:a,look:fc},sam:{...tq(sS,tS),face:a,look:fc}};role(jamie,'frame');later(.4,()=>role(sam,'frame'));
  S.jamieAim=fc;later(.55,()=>{S.samAim=fc;});C.hold.jamie=null;C.hold.sam=null;
  T?.jolt(.76,{rise:1,hold:10,why:'someone, down the tunnel'});}
 function startTurn(){FG.state='turning';FG.turnFrom=FG.yaw;FG.turnT=0;FG.turnV=1;mark('he turns away');}
 function figureGone(){if(C.flags.figGone)return;C.flags.figGone=true;hideFigure('hidden');go('n3-follow');objective('Follow him.');mark('he walked around the bend');
  wet.visible=true;C.wetT=0;cable.visible=true;CB.amp=.14;CB.t=0;// (a print on the ledge, just now; a hanging cable, still swinging)
  S.jamieAim=null;S.samAim=null;C.hold.jamie=null;C.hold.sam=null;T?.set(.7,{why:'after him'});
  C.point={jamie:{...tq(232,.4),look:lookAhead(252,0,1.2),max:3.2,face:Dr.at(232).a}};role(jamie,'point');role(sam,'beside');
  talk([{who:'JAMIE',text:'“Alex! ALEX! Wait!”',from:jamie,time:1.6,gap:.4},{who:'SAM',text:'“Jamie— wait for us!”',from:sam,time:1.6}],{interrupt:true});C.followAt=C.t;}
 // ---- following him: past the bend, the long last stretch; then him again, farther in, at the junction ------------------
 // He stands by the black side culvert, his back to them. He does not answer. He steps up into it, into the dark.
 const LURE={s:274.6,t:-1.15};
 function lureReady(){FG.road=null;FG.state='lure-wait';FG.s=LURE.s;FG.t=LURE.t;FG.v=0;FG.yaw=0;FG.look=0;FG.turnV=0;FG.hidden=0;FG.dy=0;figure.group.visible=true;placeFigure(0);
  C.lure={t0:C.t,seenT:0,seenAt:null,nudge:0,walkAt:null,stepAt:null,goneAt:null,distAtSeen:null,unseenGo:false};}
 function lureSighted(){if(C.flags.lure)return;C.flags.lure=true;go('n3-lure');date(NIGHT.lure,'PM');
  {const L2=C.lure,ch=figChest();L2.seenAt=C.t;L2.bySight=L2.seenT>.35;L2.distAtSeen=+Math.hypot(ch.x-camera.position.x,ch.z-camera.position.z).toFixed(1);}mark('him again, farther in');objective('');T?.jolt(.8,{rise:1,hold:10,why:'him again, farther in'});
  const fc=figChest;S.jamieAim=fc;later(.5,()=>{S.samAim=fc;});C.hold.jamie=null;C.hold.sam=null;
  C.point={jamie:{...tq(Math.max(cS(jamie)+1.2,252),.35),look:fc,max:1.6}};role(jamie,'point');role(sam,'beside');
  talk([{who:'JAMIE',text:'“There!”',from:jamie,time:1.2,gap:.5},{who:'JAMIE',text:'“ALEX! It’s us! It’s Jamie!”',from:jamie,time:2.4}],{interrupt:true});}
 function lureWalk(){if(!C.lure||C.lure.walkAt!==null)return;C.lure.walkAt=C.t;FG.state='lure-walk';FG.v=0;mark('he walks away from them, to the side culvert');
  C.point={jamie:{...tq(265,.95),look:figChest,max:1.7}};role(jamie,'point');
  talk([{wait:.8},{who:'SAM',text:'“Why isn’t he stopping?”',from:sam,time:1.8,gap:.6},{who:'JAMIE',text:'“He wants us to follow him.”',from:jamie,time:2,gap:.8},{who:'SAM',text:'“Jamie. I don’t like this.”',from:sam,time:1.8}]);}
 // ---- the junction: where he went, something else -----------------------------------------------------------------
 // In the culvert he stepped into, crouched in the dark on the sill: a long pale thing, on all fours. It does not move
 // until you have seen it (Jamie's light is on it; they cue you); then it crawls to the lip, drops into the water, turns
 // to them, and comes. Nothing says what it is, or what it has to do with him.
 function creatureReveal(){if(C.flags.creature)return;C.flags.creature=true;go('n3-creature');checkpoint('c3-creature-reveal');date(NIGHT.creature,'PM');mark('something in the culvert, where he went');objective('');
  // (it comes up out of the dark of the culvert, where nobody down the tunnel can see into it, to the lip)
  Object.assign(CRT,{...CRT0,state:'emerge',s:CUL.s,t:-(culW()/2+3.3),y:CUL.sill,h:Dr.at(CUL.s).a+Math.PI/2,v:.9});creature.show(true);placeCreature();
  C.crt={t0:null,emergeAt:C.t,seenT:0,seenAt:null,nudge:0,creepAt:null,dropAt:null,landedAt:null,unseenGo:false,distAtSeen:null};
  const cm=culvertAt(-.2,.45);S.jamieAim=cm;later(.7,()=>{S.samAim=cm;});hold(jamie,{look:cm,until:null});hold(sam,{look:cm,until:null});
  talk([{who:'JAMIE',text:'“Alex? …Alex, come out. It’s okay.”',from:jamie,time:2.6}],{interrupt:true});T?.set(.8,{why:'the culvert he went into'});}
 function creatureSeen(){const R2=C.crt;if(!R2||R2.seenAt!==null)return;R2.seenAt=C.t;mark('it is there, in the culvert');T?.jolt(1,{rise:1.2,hold:14,why:'something in the culvert'});
  const cc=crChest;S.jamieAim=cc;S.samAim=cc;hold(jamie,{look:cc,gesture:t=>GEST.recoil(.7*smooth(t/.3)),until:null,turn:2});hold(sam,{look:cc,gesture:t=>GEST.recoil(smooth(t/.25)),until:null,turn:2.4});
  talk([{wait:.7},{who:'JAMIE',text:'“…That’s not—”',from:jamie,time:1.4,gap:.5},{who:'SAM',text:'“That’s not Alex.”',from:sam,time:1.6}],{interrupt:true});}
 function creatureDrop(){const R2=C.crt;if(!R2||R2.dropAt!==null)return;R2.dropAt=C.t;CRT.state='drop';CRT.phT=0;CRT.from={t:CRT.t,y:CRT.y};CRT.to={t:-(culW()/2-1.1),y:0};mark('it drops into the water, toward them');}
 function creatureLanded(){const q=Dr.at(CUL.s,CRT.t),wy=Dr.waterAt(CUL.s);splashAt(q.x,(wy??Dr.floor(CUL.s)-.07)+.01,q.z,22,1.6);rippleAt(q.x,(wy??Dr.floor(CUL.s))-.01,q.z,2,2.4);crSound('impact',{x:q.x,y:Dr.floor(CUL.s)+.3,z:q.z},1);
  CRT.state='turn';CRT.phT=0;CRT.from={h:CRT.h};
  talk([{who:'SAM',text:'“RUN!”',from:sam,time:1},{who:'JAMIE',text:'“GO! GO!”',from:jamie,time:1.2}],{interrupt:true});later(.15,run);}
 // From in there, his voice. (Nobody says whose.)
 function lureVoice(){const L2=C.lure;if(!L2||L2.voiceAt!=null)return;L2.voiceAt=C.t;const q=culvertAt(2.6,.7);o.audio()?.voice?.('jamie',q,{gain:.85,tunnel:true,ref:3});
  (C.voices||=[]).push({word:'jamie',pos:q,at:C.t,tunnel:true,where:'culvert'});T?.jolt(.86,{rise:1,hold:8,why:'his voice, from the culvert'});
  talk([{who:'FROM THE CULVERT',text:'“Jamie?”',time:1.4,gap:.6}],{interrupt:true});}
 const _crh=new THREE.Vector3();
 function updateCreatureReveal(dt){const R2=C.crt;if(!R2)return;const w=culW(),cp=camera.position,hp=creature.headPos?.(_crh)||crChest();
  // (seen: its head, out over the lip, in front of you and nothing in between)
  const seen=creature.group.visible&&Dr.sees(cp,culvertAt(-.3,.5),.02)&&Dr.sees(cp,hp,.02)&&k.camLooksAt(hp,.94);
  if(CRT.state==='emerge'){CRT.t=Math.min(-(w/2+.12),CRT.t+.9*dt);CRT.v=.9;CRT.pose={crouch:.55};if(CRT.t>=-(w/2+.12)-1e-6){CRT.state='reveal';CRT.v=0;R2.t0=C.t;mark('something at the lip of the culvert');}}
  if(CRT.state==='reveal'||CRT.state==='creep')if(seen)R2.seenT+=dt;
  if(CRT.state==='reveal'){CRT.v=0;CRT.pose={crouch:1};
   if(R2.seenAt===null){const since=C.t-R2.t0;
    if(R2.seenT>.4){R2.distAtSeen=+Math.hypot(hp.x-cp.x,hp.z-cp.z).toFixed(1);creatureSeen();}
    else{const canSee=Dr.sees(cp,culvertAt(-.3,.5),.02);if(!canSee&&!R2.callUp&&since>1.5&&!busy()){R2.callUp=C.t;talk([{who:'JAMIE',text:'“Come here. Look— in the pipe.”',from:jamie,time:2}]);}
     if(!busy()){if(since>2.5&&R2.nudge===0){R2.nudge=1;talk([{who:'SAM',text:'“Jamie.”',from:sam,time:1}]);}
      else if(since>6&&R2.nudge===1){R2.nudge=2;talk([{who:'SAM',text:'“Jamie. The pipe. Look at the pipe.”',from:sam,time:2.2}]);}
      else if(since>12&&R2.nudge===2){R2.nudge=3;talk([{who:'JAMIE',text:'“Something’s in there.”',from:jamie,time:1.8}]);}
      else if(R2.nudge>=3&&R2.nudge<6&&since>19+(R2.nudge-3)*7){R2.nudge++;talk([{who:'SAM',text:'“The pipe. On the left.”',from:sam,time:1.6}]);}}
     // generous, never silent: never looked at all, after a long while, it comes anyway
     if(since>40){R2.unseenGo=true;creatureSeen();}}}
   else if(C.t-R2.seenAt>1){CRT.state='creep';R2.creepAt=C.t;}}
  if(CRT.state==='creep'){const goal=-(w/2-.15);CRT.t=Math.min(goal,CRT.t+.5*dt);CRT.v=CRT.t<goal-.01?.5:0;CRT.pose={crouch:.7};if(C.t-R2.seenAt>3.8)creatureDrop();}
  if(CRT.state==='drop'){CRT.phT+=dt;const u=clamp(CRT.phT/.6,0,1),f=CRT.from,to=CRT.to;CRT.t=f.t+(to.t-f.t)*smooth(u);CRT.y=Math.max(0,f.y*(1-u)+to.y*u+.28*Math.sin(Math.PI*u));CRT.v=2.4;CRT.pose={rear:.25*(1-u)};
   if(u>=1){CRT.y=0;R2.landedAt=C.t;creatureLanded();}}
  if(CRT.state==='turn'){CRT.phT+=dt;const u=smooth(clamp(CRT.phT/.6,0,1));CRT.h=CRT.from.h+Math.PI/2*u;CRT.v=1.4;CRT.pose=null;if(CRT.phT>=.6){CRT.state='chase';CRT.v=2.5;}}}
 // It, every frame it is shown: where the story has put it and what it is doing; its footfalls in the water.
 const crLook={x:0,y:0,z:0};
 function updateCreature(dt){if(!creature.group.visible)return;const D=creature.drive,W=CRT.pose||{};
  D.speed=CRT.v;D.rear=damp(D.rear,W.rear||0,6,dt);D.claw=damp(D.claw,W.claw||0,8,dt);D.crouch=damp(D.crouch,W.crouch||0,3,dt);
  crLook.x=camera.position.x;crLook.y=camera.position.y;crLook.z=camera.position.z;D.look=W.look||crLook;placeCreature();creature.update(dt);
  if(CRT.v>1.6&&creature.phase<CRT.lastPh){const g=creature.group.position,wy=CRT.road?null:Dr.waterAt(clamp(CRT.s,0,Dr.len));if(wy!==null&&CRT.y<=0)splashAt(g.x,wy+.01,g.z,6,1.1);crSound(wy!==null?'move':'step',{x:g.x,y:g.y+.2,z:g.z},.7);}
  CRT.lastPh=creature.phase;}
 // the placeholder sound hooks for it (future real audio): its movement in the water, its impacts (the gate)
 function crSound(kind,pos,gain=1){C.crSounds=(C.crSounds||0)+1;(C.crKinds||={})[kind]=(C.crKinds[kind]||0)+1;o.sfx(kind==='impact'?'tap':'splash',pos,{gain:kind==='impact'?Math.min(1.4,gain*1.3):gain});}
 // ---- the run -------------------------------------------------------------------------------------------------------
 // A story sprint (game.js asks escapeDir() which way out is): faster than any running, no stamina to lose, the view a
 // little wider; Jamie and Sam flat out ahead of you, looking back. Behind you, it: about 20 m back down the far stretch;
 // gone round the second bend; then out of a hole in the wall much closer; right behind you at the first bend, where the
 // old gate is slammed on it and holds it a few seconds; then at the mouth, low in the dark, watching. It never reaches
 // anyone. (No mesh collision anywhere: it follows the drain's own line, and stops itself.)
 const SIDE={s:194,gap:9},NEAR_S=96,STALL=4.6;
 const newPurs=()=>({stage:'start',farAt:null,farWant:20,farVisAt:null,farSeenT:0,farSeenAt:null,farDist:null,lostAt:null,lostLine:false,sideAt:null,sideSkipped:false,sideSeenT:0,sideSeenAt:null,sideDist:null,
  nearAt:null,nearVisAt:null,nearSeenT:0,nearSeenAt:null,nearDist:null,bikeJamieAt:null,bikeSeenAt:null,stumbleAt:null,pipeAt:null,gateHolder:null,gateHoldAt:null,gateShutAt:null,gateHitAt:null,gateBurstAt:null,gateHits:0,gateSkipped:false,
  mouthAt:null,mouthLine:false,treeAt:null,treeS:null,treeSeenAt:null,treeDist:null,stallT:0,stalls:0,stallMin:99,cue:0,hintAt:null,minGap:99,minGapRun:99,exitSeenAt:null});
 function run(){if(C.flags.run)return;C.flags.run=true;go('n3-run');checkpoint('c3-creature-chase');date(NIGHT.run,'PM');objective('Run.');S.jamieAim=null;S.samAim=null;o.setDrain?.(0);C.runT=0;C.splashT=.6;
  for(const c of [jamie,sam]){C.hold[c.key]=null;c.lookAt=null;}role(sam,'run');later(.25,()=>{if(!C.purs?.gateHoldAt)role(jamie,'run');});
  // (the bike is no longer anywhere they left it: it is lying across the way out, back at the first bend)
  if(C.bike!=='relocated')placeOld('relocated');if(FG.state!=='off')hideFigure('hidden');FG.road=null;
  C.purs=newPurs();A.remountRange=6;A.escape=escapeDir;GA.want=1;GA.burst=false;}
 function escapeDir(){if(!C.flags.run||C.flags.flee||!/^n3-(run|out)$/.test(S.phase||''))return null;const p=me();if(p.riding)return null;const ds=drainS(p);
  if(ds>=0){const s=clamp(ds,0,Dr.len-.5),q=Dr.at(s),{w}=Dr.sizeAt(s),pq=Dr.project(p.x,p.z),
    // (coming up to the gate, the way through is its middle: you are drawn to it, as anyone would be)
    lim=gate.visible&&s>GT.s-1.2&&s<GT.s+7?.35:w/2-.75,ex=pq?pq.t-clamp(pq.t,-lim,lim):0;
   return {dir:q.a+Math.PI,speed:5.25,fov:7,lat:clamp(ex*1.3,-.55,.55)};}
  const b=o.roam;return {dir:headingTo(p.x,p.z,b.x,b.z),speed:4.8,fov:5,bike:true};}
 // Can you see it (the drain's walls in the way; outside, only how far)?
 const crSees=()=>{if(!creature.group.visible)return false;const cp=camera.position,q=crChest();return Dr.inside(cp.x,cp.z,.2)?Dr.sees(cp,q,.02):Math.hypot(q.x-cp.x,q.z-cp.z)<45;};
 const crInView=(cos=.55)=>crSees()&&k.camLooksAt(crChest(),cos);
 function crHide(state='hidden'){CRT.state=state;CRT.v=0;CRT.road=null;CRT.pose=null;creature.show(false);}
 function crAt(s,state='chase',v=5){Object.assign(CRT,{...CRT0,state,s,t:0,y:0,h:Dr.at(clamp(s,0,Dr.len)).a+Math.PI,v});creature.show(true);placeCreature();}
 // It keeps a distance behind you that it chooses (closing it fast if it is farther; never nearer: it catches nobody).
 // Stop, and after a moment it comes on, to a few metres, and rears up there.
 function crChase(dt,ps,pv,want,vmax){const P2=C.purs;P2.stallT=pv<.4?P2.stallT+dt:0;const stall=P2.stallT>1.2;if(stall&&P2.stallT-dt<=1.2)P2.stalls++;
  const w=stall?Math.max(STALL,want-(P2.stallT-1.2)*4):want,gap=CRT.s-ps;
  let v=clamp(pv+(gap-w)*1.15,0,vmax);if(pv<.4)v=Math.max(0,Math.min(v,(gap-w)*.9));
  let lo=ps+Math.max(STALL,w*.75);if(GA.want<.5&&!GA.burst&&CRT.s>GT.s)lo=Math.max(lo,GT.s+1.2);// (the gate shut: no nearer than its bars)
  const s0=CRT.s;CRT.v=damp(CRT.v,v,4,dt);let s1=Math.max(lo,s0-CRT.v*dt);if(s1>s0)s1=Math.min(s1,s0+1.5*dt);CRT.s=s1;CRT.v=dt>0?Math.max(0,(s0-s1)/dt):0;
  // (across the drain a little as it comes; round the bike on its open side; through the middle of the gate)
  const sc=clamp(CRT.s,0,Dr.len);let tw=.35*Math.sin(C.t*.9);if(C.bike==='relocated'&&Math.abs(CRT.s-RL.s)<3.5)tw=1.15;if(Math.abs(CRT.s-GT.s)<3)tw=0;
  const lim=Dr.sizeAt(sc).w/2-.6;tw=clamp(tw,-lim,lim);const t0=CRT.t;CRT.t=damp(CRT.t,tw,1.6,dt);const vt=dt>0?(CRT.t-t0)/dt:0;
  CRT.h=Dr.at(sc).a+Math.PI-Math.atan2(vt,Math.max(CRT.v,.6));CRT.pose=stall&&CRT.s-ps<want-1?{rear:.65*smooth((P2.stallT-1.6)/.8)}:null;
  const g=+(CRT.s-ps).toFixed(2);P2.minGap=Math.min(P2.minGap,g);if(stall)P2.stallMin=Math.min(P2.stallMin,g);else P2.minGapRun=Math.min(P2.minGapRun,g);}
 // Someone looks back over a shoulder (and his light goes back with him) and shouts.
 function cue(kind){const P2=C.purs;P2.cue++;glance(sam,crChest(),2.4);S.samAim=crChest;later(2.4,()=>{if(S.samAim===crChest)S.samAim=null;});later(.35,()=>glance(jamie,crChest(),1.1));
  const L={far:[{who:'SAM',text:'“It’s coming! IT’S COMING!”',from:sam,time:1.6}],again:[{who:'SAM',text:'“BEHIND US!”',from:sam,time:1.1}],
   side:[{who:'SAM',text:'“It came out of the wall— it’s behind us!”',from:sam,time:2}],near:[{who:'SAM',text:'“It’s RIGHT THERE!”',from:sam,time:1.2}]}[kind];
  if(L&&(!busy()||kind==='side'||kind==='near')){talk(L,{interrupt:true});return true;}return false;}
 function stumble(){const P2=C.purs;P2.stumbleAt=C.t;C.stumble={c:jamie,at:C.t};const q={x:jamie.px,z:jamie.pz};splashAt(q.x,Dr.floorAt(Math.max(cS(jamie),0),0)+.05,q.z,10,1.2);T?.jolt(1,{hold:12,why:'Jamie goes down'});
  later(.9,()=>glance(jamie,creature.group.visible?crChest():lookAhead(cS(jamie)+10,0,1.2),1));}
 // The gate at the first bend: whoever is through it first waits at it, holding a leaf; you through; he slams it.
 const gateSound=(g=1)=>{const q=gate.position;C.gateSounds=(C.gateSounds||0)+1;o.sfx('tap',{x:q.x,y:q.y+1.2,z:q.z},{gain:Math.min(1.4,g)});};
 function gateHold(c){const P2=C.purs;P2.gateHoldAt=C.t;P2.gateHolder=c.key;C.point={...(C.point||{}),[c.key]:{...tq(GT.s-1.1,c===jamie?1.35:-1.35),look:atYou,max:5.6,face:Dr.at(GT.s).a}};role(c,'point');
  talk([c===jamie?{who:'JAMIE',text:'“THROUGH! GET THROUGH!”',from:jamie,time:1.4}:{who:'SAM',text:'“THROUGH! GO!”',from:sam,time:1.2}],{interrupt:true});}
 function gateRelease(){const P2=C.purs,c=P2.gateHolder==='sam'?sam:jamie;if(C.role[c.key]==='point')role(c,'run');}
 function gateShut(){const P2=C.purs,c=P2.gateHolder==='sam'?sam:jamie;P2.gateShutAt=C.t;GA.want=0;GA.rattle=.5;gateSound(1.2);mark('the gate slammed shut behind them');T?.jolt(1,{hold:10,why:'the gate'});
  hold(c,{face:Dr.at(GT.s).a,look:crChest,gesture:()=>GEST.tense(1),until:C.t+.8,turn:3});later(.8,gateRelease);}
 function gateHit(){const P2=C.purs;P2.gateHitAt=C.t;P2.stage='gate';CRT.state='gate';CRT.phT=0;CRT.v=0;GA.rattle=1;gateSound(1.3);mark('it hits the gate');T?.jolt(1,{hold:14,why:'it is at the gate'});
  talk([{who:'SAM',text:'“It’s at the gate—”',from:sam,time:1.2,gap:.2},{who:'JAMIE',text:'“It won’t hold! GO! GO!”',from:jamie,time:1.6}],{interrupt:true});}
 function gateBurst(){const P2=C.purs;P2.gateBurstAt=C.t;P2.stage='after';GA.burst=true;GA.want=1;gateSound(1.4);crSound('impact',{x:gate.position.x,y:gate.position.y+1,z:gate.position.z},1.2);CRT.state='chase';CRT.v=3;CRT.pose=null;
  mark('it is through the gate');T?.jolt(1,{hold:16,why:'it is through the gate'});}
 // Out of a hole low in the wall behind them, much closer (it went round, through the side drains).
 function crFromWall(){const P2=C.purs,w=Dr.sizeAt(SIDE.s).w;P2.stage='side';P2.sideAt=C.t;Object.assign(CRT,{...CRT0,state:'side-out',s:SIDE.s,t:-(w/2+.95),y:.05,h:Dr.at(SIDE.s).a+Math.PI/2,v:1.5});creature.show(true);placeCreature();
  const q=Dr.at(SIDE.s,-(w/2-.1)),pos={x:q.x,y:Dr.floor(SIDE.s)+.5,z:q.z};crSound('impact',pos,1);later(.25,()=>crSound('splash',pos,1));later(.5,()=>cue('side'));mark('something in the wall behind them');}
 // Riding away and looking back over your shoulder for it (nothing at the mouth to see from here): when you turn
 // round again it is at the edge of the trees ahead, low, beside the road you are about to ride past. (Placed only
 // while nobody is looking that way; never on the road; a glimpse anyone who does not look back never has.)
 function crToTrees(rs){const P2=C.purs,s=Math.max(4,rs-26),cd=new THREE.Vector3();camera.getWorldDirection(cd);const fw=Wd.at(s,0),rt={x:Math.cos(fw.a),z:Math.sin(fw.a)},side=(cd.x*rt.x+cd.z*rt.z)>0?-1:1;
  const t=side*(Wd.halfW(s)+1.6),q=Wd.at(s,t),c=Wd.at(s,0),y=nav.groundY(q.x,q.z);
  if(k.camLooksAt({x:q.x,y:y+.7,z:q.z},.4))return;
  P2.stage='tree';P2.treeAt=C.t;P2.treeS=+s.toFixed(1);CRT.state='tree';CRT.v=0;CRT.road={x:q.x,y,z:q.z};CRT.h=headingTo(q.x,q.z,c.x,c.z);CRT.pose={rear:.5};creature.show(true);placeCreature();}
 function updateChase(dt,rs){const P2=C.purs;if(!P2)return;const p=me(),ps=drainS(p),pv=p.walking?(p.speed||0):0;
  // a look back now and then, at whatever is behind (it, if it is there)
  C.glanceT-=dt;if(C.glanceT<=0&&ps>=0){C.glanceT=1.8+Math.random()*1.8;const c=Math.random()<.5?jamie:sam,cs2=cS(c);if(cs2>0&&C.t>(C.glance[c.key]?.until||0))glance(c,creature.group.visible?crChest():lookAhead(cs2+10,0,1.2),.75);}
  const seesIt=crSees(),gap=CRT.s-ps,looked=c2=>seesIt&&k.camLooksAt(crChest(),c2);
  if(P2.stage==='start'&&CRT.state==='chase'){P2.stage='far';P2.farAt=C.t;P2.farWant=clamp(CRT.s-Math.max(ps,0),13,21);}
  // 1: back down the far stretch, about 20 m behind them
  if(P2.stage==='far'){if(CRT.state==='chase')crChase(dt,ps,pv,P2.farWant,8.4);
   if(seesIt&&gap<27&&P2.farVisAt===null&&C.t-P2.farAt>1.2){P2.farVisAt=C.t;P2.farLine=cue('far');}
   // (if they were still shouting RUN, Sam's line comes as soon as there is a breath for it)
   if(P2.farVisAt!==null&&!P2.farLine&&!busy()&&C.t-P2.farVisAt<6){P2.farLine=true;talk([{who:'SAM',text:'“It’s coming! IT’S COMING!”',from:sam,time:1.6}]);}
   if(looked(.9)&&gap<27){P2.farSeenT+=dt;if(P2.farSeenAt===null&&P2.farSeenT>.25){P2.farSeenAt=C.t;P2.farDist=+gap.toFixed(1);mark('it is coming after them');T?.jolt(1,{hold:24,why:'it is coming after them'});}}
   if(P2.farVisAt!==null&&P2.farSeenAt===null&&C.t-P2.farVisAt>2.8&&P2.cue<2)cue('again');
   if(P2.farVisAt!==null&&P2.farSeenAt===null&&C.t-P2.farVisAt>2.2&&P2.hintAt===null)P2.hintAt=C.t;
   // 2: round the second bend: the moment nobody can see it, it is not there
   if(ps>=0&&ps<=211&&CRT.state==='chase'&&!crInView()){crHide();P2.stage='lost';P2.lostAt=C.t;mark('round the bend, nothing behind them');}
   else if(ps>=0&&ps<=SIDE.s-SIDE.gap){P2.stage='side';P2.sideAt=C.t;P2.sideSkipped=true;}}// (watched all the way: it simply keeps coming)
  if(P2.stage==='lost'){
   if(!P2.lostLine&&ps>=0&&ps<=205&&!busy()){P2.lostLine=true;talk([{who:'SAM',text:'“Where is it? WHERE IS IT?”',from:sam,time:1.6,gap:.2},{who:'JAMIE',text:'“Just GO!”',from:jamie,time:1.1}]);}
   if(P2.stumbleAt===null&&ps>=0&&ps<=198)stumble();
   // 3: out of the wall behind them, about 12 m back
   if(ps>=0&&ps<=SIDE.s-SIDE.gap)crFromWall();}
  if(P2.stage==='side'){
   if(CRT.state==='side-out'){CRT.phT+=dt;const w=Dr.sizeAt(SIDE.s).w,u=clamp(CRT.phT/.75,0,1);CRT.t=-(w/2+.95)+1.75*u;CRT.y=CRT.t<-w/2+.1?.05:0;CRT.v=2.3;CRT.h=Dr.at(SIDE.s).a+Math.PI/2;CRT.pose={crouch:.5};
    if(u>=1){CRT.state='side-turn';CRT.phT=0;CRT.y=0;}}
   else if(CRT.state==='side-turn'){CRT.phT+=dt;const u=smooth(clamp(CRT.phT/.32,0,1));CRT.h=Dr.at(SIDE.s).a+Math.PI/2+Math.PI/2*u;CRT.v=1.6;CRT.pose=null;if(CRT.phT>=.32){CRT.state='chase';CRT.v=4;}}
   else if(CRT.state==='chase')crChase(dt,ps,pv,12.5,9.4);
   if(looked(.9)&&gap<17){P2.sideSeenT+=dt;if(P2.sideSeenAt===null&&P2.sideSeenT>.2){P2.sideSeenAt=C.t;P2.sideDist=+gap.toFixed(1);mark('it came out of the wall behind them');T?.jolt(1,{hold:20,why:'it came out of the wall'});}}
   // 4: at the first bend, right behind them
   if(ps>=0&&ps<=NEAR_S){P2.stage='near';P2.nearAt=C.t;if(CRT.state!=='chase'){CRT.state='chase';CRT.y=0;CRT.pose=null;}}}
  if(P2.stage==='near'){if(CRT.state==='chase')crChase(dt,ps,pv,8.5,10.2);
   if(seesIt&&gap<11&&P2.nearVisAt===null&&(P2.bikeJamieAt===null||C.t-P2.bikeJamieAt>2.4)){P2.nearVisAt=C.t;cue('near');}
   if(looked(.9)&&gap<11.5){P2.nearSeenT+=dt;if(P2.nearSeenAt===null&&P2.nearSeenT>.2){P2.nearSeenAt=C.t;P2.nearDist=+gap.toFixed(1);mark('it is right behind them');T?.jolt(1,{hold:20,why:'it is right behind them'});}}
   if(P2.gateShutAt!==null&&P2.gateHitAt===null&&CRT.s<=GT.s+1.35)gateHit();
   else if(P2.gateShutAt===null&&ps>=0&&ps<GT.s-6&&(P2.gateSkipped||CRT.s<GT.s+1))P2.stage='after';}
  // 5: the gate. Whoever is through first waits at it; you through, and it is slammed (everyone through, it still back)
  if(gate.visible&&!GA.burst&&P2.gateShutAt===null&&ps>=0&&/^(side|near)$/.test(P2.stage)){
   if(P2.gateHoldAt===null&&ps>GT.s&&ps<GT.s+14){const c=[jamie,sam].find(c2=>{const q=cS(c2);return q>=0&&q<=GT.s-.2&&q<ps;});if(c)gateHold(c);}
   if(P2.gateHoldAt!==null&&!P2.gateSkipped){const behind=[jamie,sam].some(c2=>cS(c2)>GT.s-.9);
    if(ps<=GT.s-1.3&&!behind&&CRT.s>GT.s+2.5)gateShut();else if(CRT.s<=GT.s+2.5||ps<GT.s-12){P2.gateSkipped=true;gateRelease();}}}
  if(P2.stage==='gate'){CRT.phT+=dt;CRT.v=0;CRT.t=damp(CRT.t,0,3,dt);CRT.h=Dr.at(GT.s).a+Math.PI;CRT.pose={rear:.7,claw:1};
   // (each blow: the bars ring and shake)
   const n=Math.floor(CRT.phT/.48);if(n>P2.gateHits){P2.gateHits=n;GA.rattle=1;gateSound(.9+.3*Math.random());crSound('impact',{x:gate.position.x,y:gate.position.y+1.1,z:gate.position.z},.8);}
   if(CRT.phT>3.2||ps<GT.s-28)gateBurst();}
  if(P2.stage==='after'){if(CRT.state==='chase')crChase(dt,ps,pv,16,10);
   if(!P2.mouthLine&&ps>=0&&ps<34&&!busy()){P2.mouthLine=true;talk([{who:'JAMIE',text:'“The bikes! GET TO THE BIKES!”',from:jamie,time:1.6}]);}
   if(ps<9){P2.stage='mouth';P2.mouthAt=C.t;}}
  // 6: at the mouth it stops, low in the dark just inside, and watches them go (it does not come out)
  if(P2.stage==='mouth'){const goal=ps>=0?Math.max(9,ps+12):9,s0=CRT.s;if(s0>goal){CRT.v=damp(CRT.v,clamp((s0-goal)*1.4,0,9),4,dt);CRT.s=Math.max(goal,s0-CRT.v*dt);CRT.v=dt>0?(s0-CRT.s)/dt:0;}else CRT.v=0;
   CRT.t=damp(CRT.t,-.3,1.2,dt);CRT.h=Dr.at(clamp(CRT.s,0,Dr.len)).a+Math.PI;CRT.pose={crouch:1-smooth(CRT.v/3)};if(CRT.state==='chase'&&CRT.v<.2)CRT.state='watch';
   // (riding away: once you are well off and not looking, it is no longer at the mouth)
   if(C.flags.flee&&rs>0){const g=creature.group.position,cp=camera.position;if(Math.hypot(g.x-cp.x,g.z-cp.z)>28&&!crInView()){crHide('away');P2.stage='away';P2.awayAt=C.t;}}}
  if(P2.stage==='away'&&C.flags.flee){const cd=new THREE.Vector3();camera.getWorldDirection(cd);const fw=Wd.at(Math.max(0,rs),0),back=cd.x*Math.sin(fw.a)-cd.z*Math.cos(fw.a);
   // (looking back for it, over your shoulder: see crToTrees; far enough down the road and that is the last of it)
   if(rs>Wd.L-150&&rs<Wd.L-25&&back>.05)crToTrees(rs);else if(rs<Wd.L-150)P2.stage='done';}
  if(P2.stage==='tree'){const sp=crChest(),cp=camera.position,d=Math.hypot(sp.x-cp.x,sp.z-cp.z);
   if(P2.treeSeenAt===null&&creature.group.visible&&k.camLooksAt(sp,.9)&&d<45){P2.treeSeenAt=C.t;P2.treeDist=+d.toFixed(1);mark('it, at the edge of the trees behind them');T?.jolt(.9,{hold:8,why:'it, at the edge of the trees'});glance(sam,sp,1.4);}
   if((rs<P2.treeS-6||C.t-P2.treeAt>14)&&!crInView(.5)){crHide('gone');P2.stage='done';}}
  // the side pipe bursts as you pass it (something has moved, somewhere up it)
  if(P2.pipeAt===null&&ps>0&&ps<=141&&/^(side|near)$/.test(P2.stage)){P2.pipeAt=C.t;const SPp=Dr.sidePipe,a=Dr.at(DD.sidePipe.s).a,dx=-Math.cos(a)*DD.sidePipe.side,dz=-Math.sin(a)*DD.sidePipe.side;
   for(let i=0;i<4;i++)later(i*.14,()=>gushAt(SPp.x,SPp.y,SPp.z,dx,dz,16));later(.35,()=>{const q=Dr.at(DD.sidePipe.s,.9*DD.sidePipe.side);rippleAt(q.x,Dr.waterAt(DD.sidePipe.s)??Dr.floor(DD.sidePipe.s),q.z,1.4,2);});
   o.sfx('splash',{x:SPp.x,y:SPp.y,z:SPp.z},{gain:1});glance(sam,{x:SPp.x,y:SPp.y,z:SPp.z},1.2);C.hold.sam=null;T?.jolt(1,{hold:16,why:'the side pipe'});}
  // the bike, lying across the way out at the first bend (Jamie sees it first)
  if(C.bike==='relocated'&&P2.bikeJamieAt===null&&cS(jamie)>0&&cS(jamie)<=RL.s+9){P2.bikeJamieAt=C.t;const b={x:relAt.x,y:Dr.floorAt(RL.s,-.85)+.3,z:relAt.z};glance(jamie,b,1.4);S.jamieAim=b;later(.3,()=>{glance(sam,b,1.2);S.samAim=b;});later(2.4,()=>{if(S.jamieAim===b)S.jamieAim=null;if(S.samAim===b)S.samAim=null;});
   talk([{who:'JAMIE',text:'“WHAT—”',from:jamie,time:.9,gap:.2},{who:'SAM',text:'“That’s the bike— that’s the BIKE—”',from:sam,time:1.6}],{interrupt:true});T?.jolt(1,{hold:20,why:'the bike, in front of them'});}
  if(C.bike==='relocated'&&P2.bikeSeenAt===null&&ps>0){const b={x:relAt.x,y:Dr.floorAt(RL.s,-.85)+.25,z:relAt.z};if(Math.hypot(b.x-camera.position.x,b.z-camera.position.z)<16&&k.camLooksAt(b,.85)&&Dr.sees(camera.position,b,.02))P2.bikeSeenAt=C.t;}
  if(P2.exitSeenAt===null&&ps>=0&&ps<62&&glow.visible&&k.camLooksAt(glow.position,.9))P2.exitSeenAt=C.t;}
 function outOfDrain(){if(C.flags.out)return;C.flags.out=true;go('n3-out');objective('Get back to the bikes.');T?.set(.94,{hold:20});
  for(const c of [jamie,sam]){if(c.mode==='foot'&&!(c.script&&!c.script.roleStep))role(c,'run');}}
 // On the bikes: the road back up through the woods, faster than anyone has ever ridden it.
 const RF={s:375,t:.45};
 function mounted(){if(C.flags.flee)return;C.flags.flee=true;go('n3-flee');checkpoint('c3-road-escape');objective('Get out of the woods.');A.barLight=true;A.escape=null;A.rideBoost=1.35;A.rideFov=6;
  for(const c of [jamie,sam]){c.tight=1;c.lookAt=null;c.boost=1.42;}follow(true);C.fleeAt=C.t;C.rideGlanceT=3;if(FG.state!=='off'&&FG.state!=='gone'&&!FG.road)hideFigure('gone');}
 // At a bend, in their lights: him. Standing in the road. They do not stop. He walks off it, into the trees.
 function updateRoadFigure(dt,rs){let R=C.roadFig;
  if(!R&&rs>RF.s+22&&rs<=RF.s+58&&!creature.group.visible){R=C.roadFig={stage:'wait',seenT:0,seenAt:null,reactAt:null,leaveAt:null,goneAt:null,spawnRs:+rs.toFixed(1)};FG.road={s:RF.s,t:RF.t,h:Wd.at(RF.s).a};FG.state='road-block';FG.v=0;FG.yaw=0;FG.look=0;FG.turnV=0;FG.hidden=0;figure.group.visible=true;placeFigure(0);}
  if(!R)return;const ch=figChest(),d=rs-FG.road.s;
  if(figure.group.visible&&camSees(ch,.9)&&d<15.5){R.seenT+=dt;if(R.seenAt===null&&R.seenT>.2){R.seenAt=C.t;R.seenDist=+Math.hypot(ch.x-camera.position.x,ch.z-camera.position.z).toFixed(1);mark('him, in the road ahead');}}
  if(R.stage==='wait'&&(d<=14.5||R.seenT>.5)){R.stage='react';R.reactAt=C.t;T?.jolt(1,{hold:20,why:'him, in the road ahead'});jamie.speed*=.85;S.jamieAim=figChest;later(.3,()=>{S.samAim=figChest;});
   for(const c of [jamie,sam])c.lookAt=ch;talk([{who:'SAM',text:'“No— no no no—”',from:sam,time:1.4,gap:.2},{who:'JAMIE',text:'“Don’t stop. DON’T STOP.”',from:jamie,time:1.8}],{interrupt:true});}
  if(R.stage==='react'&&(d<=10.5||C.t-R.reactAt>1.4)){R.stage='leave';R.leaveAt=C.t;R.h0=FG.road.h;FG.state='road-leave';FG.turnT=0;}
  // (off the road and into the trees, half turned away from them: his back, never his face, as they go by)
  if(R.stage==='leave'){FG.turnT+=dt;const side=Math.sign(RF.t)||1,toward=R.h0+side*(Math.PI/2+.5);FG.road.h=FG.road.h+clamp(wrap(toward-FG.road.h),-2.6*dt,2.6*dt);
   if(FG.turnT>.5){FG.v=damp(FG.v,1.3,4,dt);FG.road.t+=side*FG.v*Math.cos(.5)*dt;FG.road.s-=FG.v*Math.sin(.5)*dt;FG.turnV=0;}else FG.turnV=1;
   for(const c of [jamie,sam])c.lookAt=figChest();
   const off=Math.abs(FG.road.t)>Wd.halfW(FG.road.s)+2.6;if(off&&(!figInView()||rs<FG.road.s-3)){hideFigure('gone');R.stage='gone';R.goneAt=C.t;for(const c of [jamie,sam])c.lookAt=null;S.jamieAim=null;S.samAim=null;}}
  if(R.stage!=='gone'&&figure.group.visible){placeFigure(dt);}}
 function safeNow(){if(C.flags.safe)return;C.flags.safe=true;go('n3-safe');date(NIGHT.safe,'PM');checkpoint('chapter3-end');objective('');o.setDrain?.(1);A.remountRange=undefined;A.escape=null;A.rideBoost=undefined;A.rideFov=0;
  T?.ease(.42,{fall:.035,hold:5,why:'the street, the light'});for(const c of [jamie,sam]){c.tight=0;c.boost=1;}
  const gate=Wd.spots.gate,back={x:gate.x,z:gate.z,y:gate.y+1.2};
  talk([{wait:4.6},{who:'SAM',text:'“That wasn’t Alex.”',from:sam,time:2,gap:1.6},{who:'JAMIE',text:'“…I know.”',from:jamie,time:1.6,gap:2.2},{who:'SAM',text:'“Then what did we follow?”',from:sam,time:2.2,gap:3.6},
   {act:()=>{S.lookTarget=back;for(const c of [jamie,sam])c.lookAt=back;S.jamieAim=null;},wait:4.6},{act:()=>{C.endT=0;},wait:.1}]);}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p');if(h)h.innerHTML='Chapter Three';if(pp)pp.textContent='August 22, 2011.';}const nb=$('next-chapter');if(nb)nb.hidden=!A3.next;o.finish();}
 // ---- every frame ------------------------------------------------------------------------------------------
 function update(dt){if(nextOwns()){A3.next.update(dt);return;}C.t+=dt;C.pt+=dt;const ph=S.phase,p=me(),L=where(p),rs=L.street==='woods'?(L.s??Wd.L):L.street==='side'?L.u-Wd.U:L.street==='drain'?Wd.L+1:-999,ds=L.street==='drain'?L.s:-1;
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  // (in the drain you walk carefully: wet concrete, silt, the dark; running for your life is another thing: game.js)
  o.setPace?.(ds>=0&&!C.flags.run?.72*(/^n3-(lure|creature)$/.test(ph)?1-.86*smooth((ds-264)/6):1):1);// (and near the culvert, slower and slower: nobody walks up to that)
  for(const a of people)a.update(dt,{eye:camera.position});updatePose(dt);match(dt);updateAmb(dt);
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.4));if(C.fadeIn>=1.4){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.7));if(C.fadeOut>=.9){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(ph==='c3-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<4.4&&!C.cardOn)card(true);if(C.cardT>4.4&&C.cardOn)card(false);if(C.cardT>5.6)opening();}
  else if(ph==='d3-street'){if(L.street==='side'&&L.u>104&&dist(p,momSpot())<22&&!C.flags.atHouse){C.flags.atHouse=true;checkpoint('c3-alex-house');date(DAY.house,'AM');mom.lookAt=camera.position;}
   if(C.flags.atHouse&&dist(p,momSpot())<6&&!busy()){C.nearMom=(C.nearMom||0)+dt;if(C.nearMom>2.5)momTalk();}}// (close to her and she speaks first)
  else if(ph==='d3-room'){C.roomT+=dt;const ph2=phone.position;if(!C.flags.phoneSeen&&!busy()&&(C.roomT>8||(dist(p,ph2)<1.9&&C.roomT>2)||(C.roomT>2.5&&k.camLooksAt({x:ph2.x,y:ph2.y,z:ph2.z},.92))))phoneNoticed();}
  else if(ph==='d3-window'){const st=RW(R.sideWindow.x,R.sideWindow.z),lk=RW(R.sideWindow.look.x,R.sideWindow.look.z);
   if(!C.flags.window&&dist(p,st)<1.1&&k.camLooksAt({x:lk.x,y:st.y+.2,z:lk.z},.82)){C.winT=(C.winT||0)+dt;if(C.winT>1.1)lookOut();}else C.winT=0;}
  else if(ph==='d3-neighbors'){if(!C.flags.wander&&!busy()&&L.street==='main'&&dist(p,side(20,0))>60){C.flags.wander=true;talk([{who:'JAMIE',text:'“Mr. Okafor. Next door to Alex’s.”',from:jamie,time:2}]);}}
  else if(ph==='d3-road'){if(rs>-16&&rs>-999)roadDay();}
  else if(ph==='d3-tracks'){if(!C.flags.tracks&&!busy()&&(rs>6||(rs>-4&&k.camLooksAt({x:tracksAt.x,y:tracksAt.y,z:tracksAt.z},.9))))tracksSeen();
   if(C.flags.tracks&&rs>100&&!busy())dayStop();
   if(C.flags.tracks&&!C.flags.dayStop&&rs>40&&!C.flags.dayHint&&!busy()){C.flags.dayHint=true;talk([{who:'SAM',text:'“Can you hear the street? I can’t hear the street.”',from:sam,time:2.6}]);}}
  else if(ph==='d3-home'){C.homeT+=dt;const away=dist(p,C.leftAt);if(!C.flags.leaving&&(away>15||C.homeT>45)){C.flags.leaving=true;C.fadeOut=0;C.after=()=>{o.fade(1);toNight();};}}
  else if(ph==='c3-night'){C.cardT+=dt;if(C.cardT>3.6&&C.cardOn)card(false);if(C.cardT>4.8)nightStart();}
  else if(ph==='n3-home'){const jp={x:jamie.bx,z:jamie.bz};if(dist(p,jp)<15&&!busy())meet();}
  else if(ph==='n3-ride'){if(rs>-22&&rs>-999)roadNight();}
  else if(ph==='n3-road')updateRoad(dt,rs);
  else if(ph==='n3-outfall'){if(C.flags.canEnter&&ds>=1.5)enterDrain();
   if(C.flags.canEnter&&!p.riding&&!C.flags.samBack&&sam.mode==='foot'){C.flags.samBack=true;role(sam,'behind');}/* (Sam hangs back behind you, not at your elbow among the bikes) */
   if(C.flags.canEnter&&!p.riding&&!C.flags.jamieToMouth&&jamie.mode==='foot'){C.flags.jamieToMouth=true;C.point={jamie:{...tq(.9,1.45),look:lookAhead(10,0,1.2),max:1.6,face:Dr.at(1).a}};role(jamie,'point');}/* (once he is off his bike: to one side of the mouth, not in the way) */
   if(C.flags.jamieToMouth&&!C.flags.comeOn&&!busy()&&C.t-C.lastEvent>14&&ds<0){C.flags.comeOn=true;talk([{who:'JAMIE',text:'“Come on. Before I change my mind.”',from:jamie,time:2.2}]);}}
  // (a recording finishing, wherever you are in his room: the last one with the phone in your hands, older ones not)
  if(C.inRoom&&C.recPlaying>=0&&C.t>=C.recEnd&&!busy())recDone();
  if(C.inRoom&&C.flags.phoneSeen&&!C.flags.helmetLine&&C.recPlaying<0&&!busy()&&!(C.pose&&!C.pose.release)){const hp=RW(R.helmet.x,R.helmet.z,R.helmet.y+.05);if((dist(p,hp)<3.5&&k.camLooksAt(hp,.9))||C.flags.recorded)helmetLines();}
  if(tunnelPhase())updateTunnel(dt,ds);
  turnBack(ds,p);
  // (whoever has a part to play and nothing running picks it up again; off the bike first, in the drain)
  if(/^n3-/.test(ph))for(const c of [jamie,sam]){const r=C.role[c.key];if(!r||r==='mounted'||c.script)continue;if(c.mode==='foot')role(c,r);else if(c.mode==='ride'&&tunnelPhase())comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)]);}
  if(ph==='n3-run'||ph==='n3-out'){C.runT+=dt;updateChase(dt,rs);if(ph==='n3-run'&&ds<0&&rs>Wd.L-40)outOfDrain();if(p.riding&&(ph==='n3-out'||ph==='n3-run')){if(ph==='n3-run')outOfDrain();mounted();}
   if(!C.flags.comeOn2&&C.runT>9&&ds>=0&&!busy()&&p.walking&&(p.speed||0)<1){C.flags.comeOn2=true;talk([{who:'JAMIE',text:'“Come ON!”',from:jamie,time:1.2}]);}}
  if(ph==='n3-flee'){updateChase(dt,rs);if(!C.flags.bellBehind&&rs<Wd.L-110&&rs>0){C.flags.bellBehind=true;const q={x:Dr.P.x+8,y:Dr.P.floor+1.5,z:Dr.P.z};o.audio()?.bell3?.(q,.9,{ref:30});C.heardBells.push({pos:q,at:C.t,behind:true});
    talk([{who:'',text:'[A bell. Far behind them.]',time:2.2}]);glance(sam,q,2);sam.lookAt={...q};later(2,()=>{sam.lookAt=null;});T?.jolt(.9,{hold:6,why:'a bell, behind them'});}
   updateRoadFigure(dt,rs);
   // riding hard: now and then one of them looks back over his shoulder
   C.rideGlanceT-=dt;if(C.rideGlanceT<=0&&!C.roadFig?.reactAt){C.rideGlanceT=2.6+Math.random()*3;const c=Math.random()<.5?jamie:sam,b={x:c.bx-Math.sin(c.ba)*12,z:c.bz+Math.cos(c.ba)*12,y:1.2};if(!c.lookAt){c.lookAt=b;later(.7,()=>{if(c.lookAt===b)c.lookAt=null;});}}
   if(rs<4&&rs>-40)safeNow();}
  if(ph==='n3-safe'){if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n3-end');end();}}}
  updateProps(dt,p,rs,ds);if(/^n3-/.test(ph))updateBounce();else releaseBounce();
  // How far under the trees (the dark closes in), and whether the handlebar light is wanted.
  const woodsDepth=rs>-999&&rs<=Wd.L+.5?smooth((rs-90)/160):ds>=0?1:0;C.shade=damp(C.shade,(A.night?woodsDepth:.3*woodsDepth),1.5,dt);A.shade=C.shade;
  A.night=day()?0:1;A.day=day()?1:0;if(A.day){S.deep=A.deep=0;}}
 // The old road at night: a few small things, none of them anything.
 function updateRoad(dt,rs){const p=me();
  if(rs>Wd.L-70)for(const c of [jamie,sam])c.tight=0;// (near the end they spread out again, so nobody parks round you at the outfall)
  if(rs>118&&!C.flags.noHouses&&!busy()){C.flags.noHouses=true;glance(jamie,Wd.spots.mouth,2.4);jamie.lookAt={x:Wd.spots.mouth.x,z:Wd.spots.mouth.z,y:4};later(2.4,()=>{jamie.lookAt=null;});
   talk([{who:'SAM',text:'“You can’t even see the houses anymore.”',from:sam,time:2.4}]);T?.set(.16,{why:'out of sight of the houses'});}
  // a branch, swinging back after you have gone by it
  if(rs>BR.s+2.5&&BR.phase===-1){BR.phase=0;later(.9,()=>{BR.phase=.001;const at={x:branch.position.x,z:branch.position.z,y:branch.position.y};sam.lookAt=at;S.samAim=at;later(2.6,()=>{sam.lookAt=null;S.samAim=null;});
    if(!busy())talk([{wait:.8},{who:'SAM',text:'“Did you guys hit that branch?”',from:sam,time:2},{who:'JAMIE',text:'“What branch?”',from:jamie,time:1.4}]);T?.jolt(.24,{rise:.4,hold:2,why:'a branch, behind'});});}
  // a reflector, flaring in your light
  if(!C.flags.glint&&rs>REF.s-28&&rs<REF.s){const L2=o.playerLight,v=new THREE.Vector3(REF.x-L2.position.x,REF.y-L2.position.y,REF.z-L2.position.z),d=v.length();v.normalize();const aim=L2.target.position.clone().sub(L2.position).normalize();
   if(L2.intensity>0&&d<26&&v.dot(aim)>.93){C.flags.glint=true;C.glintT=0;glint.visible=true;sam.lookAt={x:REF.x,z:REF.z,y:REF.y};later(1.6,()=>{sam.lookAt=null;});T?.jolt(.26,{rise:.5,hold:1.5,why:'a reflector'});
    talk([{who:'SAM',text:'“Whoa—”',from:sam,time:1},{who:'JAMIE',text:'“Reflector. Relax.”',from:jamie,time:1.6}]);}}
  // something moving, far off between the trees (a deer, probably)
  if(rs>296&&DR.phase<0){DR.phase=0;DR.t=0;const q=Wd.at(rs+26,-32),q2=Wd.at(rs+30,-26);DR.a={x:q.x,z:q.z},DR.b={x:q2.x,z:q2.z};deer.visible=true;const at=()=>({x:deer.position.x,z:deer.position.z,y:deer.position.y+1});S.jamieAim=at();
   later(.5,()=>{S.jamieAim=at();});later(1.6,()=>{S.jamieAim=null;});jamie.lookAt=at();later(1.8,()=>{jamie.lookAt=null;});mark('something between the trees');T?.jolt(.32,{rise:.5,hold:2,why:'something between the trees'});
   later(1.4,()=>talk([{who:'JAMIE',text:'“Deer.”',from:jamie,time:1.2,gap:1},{who:'SAM',text:'“Since when are there deer here?”',from:sam,time:2}]));}
  if(rs>420&&!C.flags.valley&&!busy()){C.flags.valley=true;talk([{who:'SAM',text:'“I can hear water.”',from:sam,time:1.8}]);T?.set(.22,{why:'the valley'});}
  if(rs>Wd.L-40||where(p).w?.patch){if(!p.riding||p.speed<.5||rs>Wd.L-14||Math.hypot(p.x-WS.pad.x,p.z-WS.pad.z)<9)arriveOutfall();}}// (in sight of it and stopped, or there)
 // Turning back before it is over: Jamie will not come, Sam will not leave him, and the bikes stay where they are.
 // (no wall, no arrow: two lights left behind you in the dark, and a quiet objective)
 const BACK=/^n3-(tunnel|evidence|bell|item|bike|deeper|follow)$/;
 const atYou=()=>{const q=me();return {x:q.x,z:q.z,y:camera.position.y};};
 function turnBack(ds,p){if(ds>=0)C.maxDs=Math.max(C.maxDs||0,ds);
  if(!BACK.test(S.phase)){if(C.back)backDone(false);return;}
  const far=C.maxDs||0,B=C.back;
  if(!B){if(far>40&&ds<far-30&&!busy()&&!C.pose){C.back={obj:S.objective,n:0,bike:false};C.backs=(C.backs||0)+1;hold(jamie,{look:atYou});hold(sam,{look:atYou});
    talk(C.backs===1?[{who:'JAMIE',text:'“Where are you going?”',from:jamie,time:1.8},{who:'SAM',text:'“…Jamie. Come on. Let’s go.”',from:sam,time:2.2},{who:'JAMIE',text:'“I’m not leaving.”',from:jamie,time:1.6}]:[{who:'JAMIE',text:'“Hey!”',from:jamie,time:1}]);
    objective('Go back to Jamie.');if(T)T.set(Math.max(T.value,.4),{why:'alone, going back'});}return;}
  if(B.n===0&&(ds<0||ds<far-70||ds<14)&&!busy()){B.n=1;talk([{who:'JAMIE',text:'“I’m not leaving without him!”',from:jamie,time:2.2}]);}
  if(!B.bike&&ds<0&&dist(p,o.roam)<4.5&&!busy()){B.bike=true;talk([{who:'YOU',text:'“I can’t leave them down there.”',time:2.2}]);}
  if(dist(p,{x:jamie.px,z:jamie.pz})<9)backDone(true);}
 function backDone(back){const B=C.back;C.back=null;C.hold.jamie=null;C.hold.sam=null;if(back){objective(B.obj||'');if(!busy())talk([{who:'SAM',text:'“Okay. Okay.”',from:sam,time:1.4}]);}}
 // In the drain, by where you are and what has happened.
 function updateTunnel(dt,ds){const ph=S.phase,p=me();
  if(ds>=97)deepIn();
  if((ph==='n3-tunnel')&&!C.flags.prints&&(ds>=DD.evidence.s0+1||cS(jamie)>DD.evidence.s0+5))evidenceSeen();
  if(ph==='n3-tunnel'&&C.flags.prints&&!C.flags.knock&&!busy()&&(ds>=DD.ladder.s-4||C.t-(C.printsAt||0)>16))knock();
  if(ph==='n3-tunnel'&&C.flags.knock&&!C.flags.bell1&&!busy()&&C.t-C.lastEvent>6&&ds>=124)bellFar();
  // his helmet, on the silt ahead: you see it in your light, or you are there, or Jamie is
  if(ph==='n3-tunnel'&&C.flags.bell1&&!C.flags.item&&!busy()){const d=Math.hypot(p.x-itemAt.x,p.z-itemAt.z);if(ds>=IT.s-9&&(d<3.2||(d<9&&k.camLooksAt({x:itemAt.x,y:itemAt.y+.05,z:itemAt.z},.93))||ds>IT.s-1||cS(jamie)>IT.s-1))itemSeen();}
  if(ph==='n3-tunnel'&&C.flags.item&&!C.flags.oldBike&&C.bike==='tunnel'){const b=old.group.position,d=Math.hypot(p.x-b.x,p.z-b.z);if(ds>=OB.s-15&&(d<8||(d<17&&k.camLooksAt({x:b.x,y:b.y+.5,z:b.z},.94))||ds>OB.s-4||cS(jamie)>OB.s-11))oldBikeSeen();}
  if(ph==='n3-bike'){if(C.flags.canInspect&&!C.flags.inspected&&!busy()){C.inspectWait=(C.inspectWait||0)+dt;if(C.inspectWait>16){C.flags.inspected=true;C.flags.canBell=true;C.bellWait=10;}}
   if(C.flags.canBell&&!C.flags.belled&&!busy()){C.bellWait+=dt;if(C.bellWait>16&&C.bellTries===0){C.bellWait=-99;const bp=oldBellPos();S.jamieAim={x:bp.x,y:bp.y,z:bp.z};tryBell('jamie');later(1.8,()=>tryBell('jamie'));}}}
  // the bike, gone: well past it, the next time nobody is looking that way (it does not move while anyone watches)
  if(ph==='n3-deeper'&&C.bike==='tunnel'&&ds>OB.s+11&&!k.camLooksAt(oldSpot,.4)&&!(Dr.sees(camera.position,oldSpot,.02)&&k.camLooksAt(oldSpot,.2))){placeOld('removed');C.bikeGoneAt=C.t;}
  if(ph==='n3-deeper'&&C.bike==='removed'&&!C.flags.bikeGone&&!busy()){const look=Math.hypot(p.x-oldSpot.x,p.z-oldSpot.z)<45&&k.camLooksAt(oldSpot,.9)&&Dr.sees(camera.position,oldSpot,.02);
   if(look)C.bikeLookT=(C.bikeLookT||0)+dt;if((C.bikeLookT||0)>.5)bikeGoneNoticed('you');else if(C.t-C.bikeGoneAt>6.5)bikeGoneNoticed('sam');}
  // he is there (standing in the dark at the end of the straight) by the time you could see that far; the moment you
  // do, or Jamie does, or you are close enough, they stop dead
  if(ph==='n3-deeper'&&FG.state==='off'&&ds>=186){const sp=lookAhead(DD.figure.s,DD.figure.t,1);if(!k.camLooksAt(sp,.55)||ds>=190)figureReady();}
  if(ph==='n3-deeper'&&FG.state==='unseen'){const ch=figChest(),near=Math.hypot(ch.x-camera.position.x,ch.z-camera.position.z)<27;
   if((ds>=194||cS(jamie)>=197.5||(near&&camSees(ch,.97)))&&(C.flags.bikeGone||ds>=198||!busy()))startReveal();}
  // after him: the last stretch (a wet print on the ledge, a cable still swinging); then him again, at the junction
  if(ph==='n3-follow'){if(FG.state==='hidden'&&ds>=232)lureReady();
   if(!C.flags.leaveHint&&!busy()&&C.t-(C.followAt||0)>14&&ds<200){C.flags.leaveHint=true;talk([{who:'SAM',text:'“We can’t just leave him down there. Jamie! Come back!”',from:sam,time:2.8}]);}
   if(!C.flags.wetSeen&&wet.visible&&!busy()&&Math.hypot(p.x-wetAt.x,p.z-wetAt.z)<4.2){C.flags.wetSeen=true;glance(jamie,wetAt,2.4);talk([{who:'JAMIE',text:'“It’s wet.”',from:jamie,time:1.4,gap:.8},{who:'YOU',text:'“That’s from just now.”',time:1.8}]);}
   if(!C.flags.cableSeen&&cable.visible&&ds>238&&!busy()&&k.camLooksAt({x:Dr.cable.x,y:Dr.cable.y-.8,z:Dr.cable.z},.95)){C.flags.cableSeen=true;talk([{who:'SAM',text:'“That’s moving.”',from:sam,time:1.4}]);glance(sam,{x:Dr.cable.x,y:Dr.cable.y-.8,z:Dr.cable.z},2);}
   if(FG.state==='lure-wait'){const L2=C.lure,ch=figChest();if(camSees(ch,.94)||camSees(figHead(),.94))L2.seenT+=dt;if(L2.seenT>.35||ds>=254||cS(jamie)>=256)lureSighted();}}
  // he walks to the culvert and goes up into it; his voice from in there; then something at its lip
  if(ph==='n3-lure'){const L2=C.lure;if(L2.walkAt===null&&C.t-L2.seenAt>2.6)lureWalk();
   if(L2.goneAt!==null&&L2.voiceAt==null&&C.t-L2.goneAt>.8)lureVoice();
   if(L2.goneAt!==null&&C.t-L2.goneAt>2.6)creatureReveal();}
  // the run: water breaking behind you (until he is there to be seen: then it is his feet)
  if(ph==='n3-run'&&ds>=0&&!creature.group.visible){C.splashT-=dt;if(C.splashT<=0){C.splashT=.42+Math.random()*.38;const s=Math.max(0,ds+(8.5+Math.random()*4.5)),{w}=Dr.sizeAt(Math.min(s,Dr.len)),t=(Math.random()-.5)*(w-1),q=Dr.at(Math.min(s,Dr.len-.5),t),wy=Dr.waterAt(Math.min(s,Dr.len));
    if(s<Dr.len-.5){if(wy!==null||Math.abs(t)<.4)splashAt(q.x,(wy??Dr.floor(s)-.07)+.01,q.z,wy!==null?8:4,wy!==null?1:.6);else rippleAt(q.x,Dr.floor(s)-.07,q.z,.8,1.2);o.sfx('splash',{x:q.x,y:Dr.floor(s)+.2,z:q.z},{gain:wy!==null?.9:.5});C.splashes=(C.splashes||0)+1;
     if(C.splashes<=3||Math.random()<.3){const c=C.splashes%2?sam:jamie;glance(c,{x:q.x,z:q.z,y:Dr.floor(s)+.6},.8);}}}}}
 function updateProps(dt,p,rs,ds){
  // the branch (a damped swing)
  if(BR.phase>0){BR.phase+=dt;const a=.42*Math.exp(-1.5*BR.phase)*Math.sin(7.5*BR.phase);branch.children[0].rotation.z=a;if(BR.phase>5){BR.phase=-2;branch.children[0].rotation.z=0;}}
  if(DR.phase>=0&&deer.visible){DR.t+=dt;const u=clamp(DR.t/1.3,0,1);deer.position.set(DR.a.x+(DR.b.x-DR.a.x)*u,nav.groundY(DR.a.x+(DR.b.x-DR.a.x)*u,DR.a.z+(DR.b.z-DR.a.z)*u),DR.a.z+(DR.b.z-DR.a.z)*u);deer.rotation.y=-headingTo(DR.a.x,DR.a.z,DR.b.x,DR.b.z)+Math.PI/2;
   deer.position.y=Wd.design(deer.position.x,deer.position.z)+.05*Math.abs(Math.sin(DR.t*14));if(DR.t>1.3){deer.visible=false;DR.phase=9;}}
  if(C.glintT!==undefined&&C.glintT>=0){C.glintT+=dt;const v=Math.sin(Math.PI*clamp(C.glintT/.45,0,1));glint.material.opacity=v*.9;if(C.glintT>.5){glint.visible=false;C.glintT=-1;}}
  if(cable.visible){CB.t+=dt;cable.rotation.z=CB.amp*Math.exp(-CB.t/9)*Math.sin(2.55*CB.t);}
  for(const r of ripple){if(r.t<0)continue;r.t+=dt;const u=r.t/r.life;r.m.scale.setScalar(.05+r.size*u);r.m.material.opacity=.45*(1-u);if(u>=1){r.t=-1;r.m.visible=false;}}
  for(const d of drops){if(d.t<0)continue;d.t+=dt;d.v.y-=9.8*dt;d.m.position.addScaledVector(d.v,dt);if(d.t>.9){d.t=-1;d.m.visible=false;}}
  if(wet.visible&&C.wetT!==undefined){C.wetT+=dt;wetMat.opacity=.9*(1-smooth((C.wetT-6)/40));}
  if(leaf.visible&&LF.s>0){LF.s-=dt*.22;const q=Dr.at(LF.s,.05*Math.sin(LF.s));leaf.position.set(q.x,Dr.floor(LF.s)-.068,q.z);leaf.rotation.z+=dt*.2;if(LF.s<226){leaf.visible=false;LF.s=-1;}}
  // the way out, seen from inside (a little stronger when you are running for it)
  {const cs2=Dr.project(camera.position.x,camera.position.z),inD=Dr.inside(camera.position.x,camera.position.z,.1)&&cs2&&cs2.s>1.2;GL.want=inD&&A.night?(C.flags.run?.5:.3)*smooth((cs2.s-1.2)/5)*(1-smooth((cs2.s-110)/30)):0;
   GL.o=damp(GL.o,GL.want,2,dt);glow.material.opacity=GL.o;glow.visible=GL.o>.004;}
  // the gate at the first bend (there at night, in the drain and in sight of it)
  gate.visible=!!A.night&&/^n3-(outfall|tunnel|evidence|bell|item|bike|deeper|figure|follow|lure|creature|run|out|flee)$/.test(S.phase||'')&&(ds>=0||rs>Wd.L-80);if(gate.visible)poseGate(dt);
  if(/^(emerge|reveal|creep|drop|turn)$/.test(CRT.state))updateCreatureReveal(dt);
  updateFigure(dt);updateCreature(dt);catchLight(dt);}
 // How much light he catches (see figCatch): your beam (where you look) and Jamie's or Sam's when it is on him, more the
 // farther he is (up close the lights themselves are enough).
 const _cf=new THREE.Vector3();
 function catchLight(dt){let want=0;if(figure.group.visible&&A.night){const ch=figChest(),cp=camera.position,dx=ch.x-cp.x,dy=ch.y-cp.y,dz=ch.z-cp.z,d=Math.hypot(dx,dy,dz)||1;camera.getWorldDirection(_cf);
   const cs=(dx*_cf.x+dy*_cf.y+dz*_cf.z)/d,mine=S.flashOn||FG.road?smooth((cs-Math.cos(.42))/(Math.cos(.1)-Math.cos(.42))):0,on=a=>a===figChest||(a&&typeof a==='object'&&Math.hypot(a.x-ch.x,a.z-ch.z)<1.2);
   const theirs=(on(S.jamieAim)?.5:0)+(on(S.samAim)?.5:0);want=Math.min(.5,(.42*mine+.22*theirs)*smooth((d-7)/12));}
  figCatch.value=damp(figCatch.value,want,8,dt);
  // The bike from the oak, in the drain: the same, so it stands out in a beam far off (and lying across the way out ahead).
  let wb=0;if(old.group.visible&&A.night&&C.bike!=='none'){const b=old.group.position,bc={x:b.x,y:b.y+.45,z:b.z},cp=camera.position,dx=bc.x-cp.x,dy=bc.y-cp.y,dz=bc.z-cp.z,d=Math.hypot(dx,dy,dz)||1;camera.getWorldDirection(_cf);
   const cs=(dx*_cf.x+dy*_cf.y+dz*_cf.z)/d,mine=S.flashOn?smooth((cs-Math.cos(.45))/(Math.cos(.12)-Math.cos(.45))):0,on=a=>a&&typeof a==='object'&&Math.hypot(a.x-bc.x,a.z-bc.z)<1.2;
   wb=Math.min(.45,(.36*mine+.2*((on(S.jamieAim)?1:0)+(on(S.samAim)?1:0)))*smooth((d-4)/9));}
  oldCatch.value=damp(oldCatch.value,wb,8,dt);
  // It: the same (a beam on it far off; never a glow of its own)
  let wc=0;if(creature.group.visible&&A.night){const ch=crChest(),cp=camera.position,dx=ch.x-cp.x,dy=ch.y-cp.y,dz=ch.z-cp.z,d=Math.hypot(dx,dy,dz)||1;camera.getWorldDirection(_cf);
   const cs=(dx*_cf.x+dy*_cf.y+dz*_cf.z)/d,mine=S.flashOn||CRT.road?smooth((cs-Math.cos(.42))/(Math.cos(.1)-Math.cos(.42))):0,on=a=>a===crChest||(a&&typeof a==='object'&&Math.hypot(a.x-ch.x,a.z-ch.z)<1.4);
   wc=Math.min(.42,(.36*mine+.2*((on(S.jamieAim)?1:0)+(on(S.samAim)?1:0)))*smooth((d-6)/12));}
  creature.catch.value=damp(creature.catch.value,wc,8,dt);}
 // The boy: what he does in each state (the pursuit and the road move him in their own functions).
 function updateFigure(dt){const st=FG.state;if(st==='off'||st==='gone'||st==='hidden'||st==='pursuit-hidden'||!figure.group.visible){if(!figure.group.visible)return;}
  if(st==='first-reveal'||st==='first-seen'){const F=C.fig,ch=figChest(),seen=camSees(ch,.94)||camSees(figHead(),.94);if(seen)F.seenT+=dt;
   if(st==='first-reveal'){const since=C.t-F.t0,close=drainS()>FG.s-11;if(F.seenT>.5||close){F.seenAt=C.t;F.distAtSeen=+Math.hypot(ch.x-camera.position.x,ch.z-camera.position.z).toFixed(1);FG.state='first-seen';mark('he is there');if(close)F.seenT=Math.max(F.seenT,.6);}
    else{if(!busy()){if(since>2.6&&F.nudge===0){F.nudge=1;talk([{who:'SAM',text:'“Look. Down there.”',from:sam,time:1.6}]);}
      else if(since>7&&F.nudge===1){F.nudge=2;C.pointAt=C.t;talk([{who:'JAMIE',text:'“There. At the end. Somebody’s standing there.”',from:jamie,time:2.6}]);}
      else if(since>14&&F.nudge===2){F.nudge=3;talk([{who:'SAM',text:'“Don’t you see him?”',from:sam,time:1.8}]);}
      else if(F.nudge>=3&&F.nudge<6&&since>22+(F.nudge-3)*7){F.nudge++;talk([{who:'SAM',text:'“Down there.”',from:sam,time:1.2}]);}}
     // Generous, never silent: never looked at all, after a long while (and all of that) he goes anyway.
     if(since>40){F.unseenGo=true;F.seenAt=C.t;FG.state='first-seen';}}}
   else{const since=C.t-F.seenAt;if(F.alexAt===null&&since>1.7&&(F.seenT>1.2||F.unseenGo||since>5)){F.alexAt=C.t;talk([{wait:.2},{who:'JAMIE',text:'“…Alex?”',from:jamie,time:1.6}],{interrupt:true});T?.jolt(.82,{rise:.6,hold:8,why:'“Alex?”'});}
    if(F.alexAt!==null&&C.t-F.alexAt>1.4&&since>=3.4&&(F.seenT>=2.8||since>=8))startTurn();}}
  if(st==='turning'){FG.turnT+=dt;const u=smooth(FG.turnT/2.1);FG.yaw=FG.turnFrom*(1-u);FG.look=-clamp(Math.PI*(1-smooth(FG.turnT/2.9))-FG.yaw,0,1.1);FG.turnV=u<1?1:0;
   if(FG.turnT>=2.1){FG.state='leaving-bend';FG.turnV=0;FG.v=0;}}
  if(st==='leaving-bend'){FG.v=Math.min(1.25,FG.v+dt*2.4);FG.s+=FG.v*dt;FG.look=damp(FG.look,0,1.2,dt);FG.t=damp(FG.t,-.55,.5,dt);
   if(FG.s>216){const vis=Dr.sees(camera.position,figHead(),.02)||Dr.sees(camera.position,figChest(),.02);if(!vis){FG.hidden+=dt;if(FG.hidden>.2)figureGone();}else FG.hidden=0;}
   if(FG.s>234&&FG.state!=='hidden')figureGone();}
  // at the junction: his back to them; then to the side culvert, up over its sill, in, gone into the dark
  if(st==='lure-wait'){FG.v=0;FG.yaw=0;FG.look=damp(FG.look,0,2,dt);}
  if(st==='lure-walk'){const gt=-(culW()/2-.4),d2s=CUL.s-FG.s,d2t=gt-FG.t,d=Math.hypot(d2s,d2t);FG.v=damp(FG.v,d>.15?1.05:0,3,dt);FG.yaw+=clamp(wrap(Math.atan2(d2t,d2s)-FG.yaw),-2*dt,2*dt);
   FG.s+=FG.v*Math.cos(FG.yaw)*dt;FG.t+=FG.v*Math.sin(FG.yaw)*dt;FG.look=damp(FG.look,0,2,dt);if(d<.2){FG.state='lure-step';FG.turnT=0;FG.v=0;C.lure.stepAt=C.t;mark('he steps up into the culvert');}}
  if(st==='lure-step'){FG.turnT+=dt;FG.v=0;FG.yaw+=clamp(wrap(-Math.PI/2-FG.yaw),-3*dt,3*dt);FG.turnV=1;
   if(FG.turnT>.5){const c=smooth(clamp((FG.turnT-.5)/.7,0,1));FG.dy=.8*c;FG.t=-(culW()/2-.4)-.6*c;}
   if(FG.turnT>=1.2){FG.state='lure-in';FG.turnV=0;FG.v=.6;FG.yaw=-Math.PI/2;}}
  if(st==='lure-in'){FG.v=damp(FG.v,1.05,3,dt);FG.t-=FG.v*dt;FG.yaw=-Math.PI/2;const deep=-(FG.t+culW()/2);
   if((deep>1.7&&!k.camLooksAt(figChest(),.55))||deep>4.1){hideFigure('lure-gone');C.lure.goneAt=C.t;}}
  if(figure.group.visible&&FG.state!=='hidden'&&!FG.road)placeFigure(dt);
  // the two lights stay on him while he is there to be seen (and narrow on him: see longThrow)
  if(/^(first-|turning|leaving)/.test(FG.state)&&S.phase==='n3-figure'){S.jamieAim=figChest;if(S.samAim)S.samAim=figChest;}}
 // Jamie's light: where the chapter points it, or ahead of him (along the road, or the tunnel) with a slow sweep.
 const sweepTmp={x:0,y:0,z:0};
 function jamieSweep(t){if(nextOwns())return A3.next.jamieSweep?.(t)??null;const c=jamie,x=c.mode==='foot'?c.px:c.bx,z=c.mode==='foot'?c.pz:c.bz,a=c.mode==='foot'?c.pa:c.ba;const s=cS(c);
  if(s>=0){const run=C.flags.run&&!C.flags.flee,ahead=run?-7:6,q=Dr.at(clamp(s+ahead+2*Math.sin(t*.37),.5,Dr.len-.5),(run?.6:1.3)*Math.sin(t*(run?1.7:.53))),y=Dr.floor(s+ahead)+.15+1.2*(.5+.5*Math.sin(t*(run?2.3:.29)));sweepTmp.x=q.x;sweepTmp.z=q.z;sweepTmp.y=y;return sweepTmp;}
  const d=c.mode==='ride'?10:5+Math.sin(t*.4)*1.5,s2=Math.sin(t*.7)*(c.mode==='ride'?.25:.55);sweepTmp.x=x+Math.sin(a+s2)*d;sweepTmp.z=z-Math.cos(a+s2)*d;sweepTmp.y=nav.groundY(sweepTmp.x,sweepTmp.z);return sweepTmp;}
 // Sam's light: ahead of him, lower and closer than Jamie's; shaking a little when he is scared.
 const samTmp={x:0,y:0,z:0},origSam=ch2.samBeam.target;
 ch2.samBeam.target=()=>{if(!mine(S.phase))return origSam();const jit=T&&T.value>.6?(T.value-.6)*.25:0,n=()=>(Math.random()-.5)*jit;
  if(S.samAim){const q=typeof S.samAim==='function'?S.samAim():S.samAim;samTmp.x=q.x+n();samTmp.z=q.z+n();samTmp.y=(q.y??nav.groundY(q.x,q.z))+n();return samTmp;}
  const c=sam,s=cS(c),t=C.t;if(s>=0){const run=C.flags.run&&!C.flags.flee,ahead=run?-4.5:4.5,q=Dr.at(clamp(s+ahead,.5,Dr.len-.5),.9*Math.sin(t*(run?1.9:.61)+1)),y=Dr.floor(s+ahead)+.1+.8*(.5+.5*Math.sin(t*(run?2.6:.43)));samTmp.x=q.x+n();samTmp.z=q.z+n();samTmp.y=y;return samTmp;}
  const x=c.mode==='foot'?c.px:c.bx,z=c.mode==='foot'?c.pz:c.bz,a=c.mode==='foot'?c.pa:c.ba,d=c.mode==='ride'?8:4.5;samTmp.x=x+Math.sin(a+.25*Math.sin(t*.5))*d;samTmp.z=z-Math.cos(a+.25*Math.sin(t*.5))*d;samTmp.y=nav.groundY(samTmp.x,samTmp.z);return samTmp;};
 // In the drain a flashlight lights more than its spot: the light comes back off the concrete. One of the
 // night's two spare point lights (police.js; no new lights, no new shaders) sits where each beam lands.
 // (deeper in, the concrete is darker and wetter: less comes back)
 const BOUNCE=police.emergency||[],_bd=new THREE.Vector3(),_bh=new THREE.Vector3();
 function updateBounce(){const on=Dr.inside(camera.position.x,camera.position.z,.3),cq=on?Dr.project(camera.position.x,camera.position.z):null,deep=cq?1-.45*smooth((cq.s-95)/60):1;
  [[BOUNCE[0],o.playerLight],[BOUNCE[1],police.head]].forEach(([L,src])=>{if(!L)return;
   if(!on||!src||src.intensity<=0||!Dr.inside(src.position.x,src.position.z,.05)){if(L.userData.borrowed){L.userData.borrowed=false;L.intensity=0;}return;}
   L.userData.borrowed=true;_bd.copy(src.target.position).sub(src.position).normalize();const d=Dr.rayDist(src.position,_bd,40);_bh.copy(src.position).addScaledVector(_bd,Math.max(.3,d-.45));
   L.position.copy(_bh);L.color.setHex(0xffe4c0);L.distance=16;L.decay=2;L.intensity=Math.min(7,src.intensity*.11)/(1+d*.04)*deep;});
  // the flashlight's dim spill, too: wide near the mouth, less and less of it past the first bend
  o.setSpill?.(8*(cq?1-.35*smooth((cq.s-90)/70):1));}
 const releaseBounce=()=>{for(const L of BOUNCE){if(L.userData.borrowed){L.userData.borrowed=false;L.intensity=0;}}o.setSpill?.(6);};
 // A longer throw in the drain (and at its mouth): what the beam lands on sets how strong it can be.
 function longThrow(hand,aim){if(nextOwns())return A3.next.longThrow?.(hand,aim)??null;if(!Dr.inside(hand.x,hand.z,.05))return null;const dir=new THREE.Vector3(aim.x-hand.x,aim.y-hand.y,aim.z-hand.z),d0=dir.length();dir.normalize();const d=Math.min(d0,Dr.rayDist(hand,dir,44));
  // (aimed far down the tunnel at him he narrows the beam, and it reaches: an adjustable flashlight)
  const focus=(figure.group.visible&&/^(first-|turning|leaving|lure)/.test(FG.state))||(creature.group.visible&&/^(emerge|reveal|creep)$/.test(CRT.state));
  return d>12?{d,reach:46,max:focus?300:150,angle:focus?.15:.2}:{d,reach:42,max:72,angle:.31};}
 // ---- what F does here ----------------------------------------------------------------------------------------
 function spots(){if(nextOwns())return A3.next.spots();const out=[],ph=S.phase;if(C.fadeOut>=0||C.pose&&!C.pose.release&&ph!=='d3-phone'&&ph!=='n3-bike')return out;
  if(ph==='d3-street')if(mom.visible&&!C.flags.momTalk)out.push({id:'c3-mom',label:'Talk to Alex’s mom',at:mom.pos,face:mom.pos,r:3.6,ride:true,wide:true});
  if(ph==='d3-mom'&&C.flags.invited){const d=AH.toWorld(AH.doorX,AH.stepFront+.5);out.push({id:'c3-in',label:'Go inside',at:{x:d.x,z:d.z},face:{x:d.x,z:d.z},r:3,wide:true});}
  if(ph==='d3-room'&&C.flags.phoneReady)out.push({id:'c3-phone',label:'Listen to his recordings',at:phone.position,face:phone.position,r:2.3,wide:true});
  if(ph==='d3-phone'&&C.recPlaying<0&&!busy()&&!C.flags.recorded)out.push({id:'c3-play',label:'Play the last one',at:phone.position,face:phone.position,r:3,wide:true});
  if(C.inRoom&&ph!=='d3-phone'&&C.flags.recorded&&C.recPlaying<0&&C.recSel>=0&&!busy())out.push({id:'c3-play',label:'Play an older recording',at:phone.position,face:phone.position,r:2.6,wide:true});
  if(ph==='d3-window'&&!C.flags.window){const st=RW(R.sideWindow.x,R.sideWindow.z),gl=RW(R.sideWindow.glass.x,R.sideWindow.glass.z),p=me(),off=q=>Math.abs(wrap(headingTo(p.x,p.z,q.x,q.z)-p.a));
   // (the desk is beside the window: facing the phone, F is the phone's)
   if(!(C.flags.recorded&&C.recSel>=0&&dist(p,phone.position)<2.6&&off(phone.position)<off(gl)))out.push({id:'c3-window',label:'Look outside',at:st,face:gl,r:1.5,wide:true});}
  if(C.inRoom&&C.flags.canLeave){const d=RW(R.door.x,R.door.z);out.push({id:'c3-out',label:'Go back outside',at:d,face:RW(R.door.face.x,R.door.face.z),r:1.4,wide:true});}
  if(ph==='d3-neighbors')for(const [key,a] of Object.entries(N))if(a.visible&&!C.talked.has(key))out.push({id:'c3-ask-'+key,label:'Talk to '+a.name.replace('MR. ','Mr. ').replace('MRS. ','Mrs. ').replace(/(\w)(\w*)$/,(m,x,y)=>x+y.toLowerCase()),at:a.pos,face:a.pos,r:3.4,ride:true,wide:true});
  if(ph==='n3-bike'&&C.flags.canInspect&&!C.flags.inspected)out.push({id:'c3-inspect',label:'Look at the bike',at:old.group.position,face:old.group.position,r:2.8,wide:true});
  if(ph==='n3-bike'&&C.flags.canBell&&!C.flags.belled)out.push({id:'c3-bell',label:'Try the bell',at:old.group.position,face:old.group.position,r:2.6,wide:true});
  return out;}
 function act(id){if(nextOwns()){A3.next.act(id);return;}if(id==='c3-mom')momTalk();else if(id==='c3-in')toRoom();else if(id==='c3-phone')startPhone();else if(id==='c3-play'){playRec();}else if(id==='c3-window')lookOut();else if(id==='c3-out')leaveRoom();
  else if(id.startsWith('c3-ask-'))askNeighbor(id.slice(7));else if(id==='c3-inspect')inspectOld();else if(id==='c3-bell')tryBell();}
 // A control hint when it matters: running, and he is behind you, and you have not looked.
 function hint(){if(nextOwns())return A3.next.hint?.()??null;const P2=C.purs;if(S.phase==='n3-run'&&P2&&P2.hintAt!==null&&P2.farSeenAt===null&&C.t-P2.hintAt<5)return [['Mouse','Look back']];return null;}
 // Sounds placed in the world (positional loops). (Placeholders for the forest, the tunnel, the creek: hooks.)
 function sources(out){if(nextOwns()){A3.next.sources(out);return;}if(day()){out.push({id:'radio-am',kind:'radio',pos:officer.pos,level:.8});return;}
  const lf=C.amb.life;for(const [i,q] of loopsAt.ac.entries())out.push({id:'ac'+i,kind:'ac',pos:new THREE.Vector3(q.x,(q.ground??q.y??0)+.5,q.z),level:lf});
  out.push({id:'tv3',kind:'tv',pos:new THREE.Vector3(loopsAt.tv.x,loopsAt.tv.y+1.2,loopsAt.tv.z),level:lf},{id:'sprinkler3',kind:'sprinkler',pos:new THREE.Vector3(loopsAt.sprinkler.x,loopsAt.sprinkler.y+.3,loopsAt.sprinkler.z),level:lf});
  if(C.amb.water>.02)out.push({id:'outfall3',kind:'culvert',pos:new THREE.Vector3(Dr.P.x+4,Dr.P.floor+.6,Dr.P.z),level:.8*C.amb.water});
  if(C.amb.tunnel>.02){const s=Math.max(0,drainS()+10);out.push({id:'drain3',kind:'water',pos:new THREE.Vector3(Dr.at(Math.min(s,Dr.len-1)).x,Dr.floor(s)+.3,Dr.at(Math.min(s,Dr.len-1)).z),level:.35*C.amb.tunnel});}}
 function blockers(){if(nextOwns())return A3.next.blockers();const out=[];if(old.group.visible&&S.phase&&/^n3-/.test(S.phase))out.push(...oldParts());if(gate.visible)gateBlockers(out);out.push(...creature.colliders());for(const a of people)if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});return out;}
 // ---- lifecycle --------------------------------------------------------------------------------------------------
 function reset(){A3.next?.reset();const hadPose=C.pose;fresh();figCatch.value=0;oldCatch.value=0;card(false);roomOn(false);phone.visible=false;old.group.visible=false;helmet.visible=false;evidence.visible=false;marks.visible=false;figure.group.visible=false;Object.assign(FG,{...FG0,pose:FG.pose});glint.visible=false;
  creature.reset();Object.assign(CRT,CRT0);gate.visible=false;Object.assign(GA,{open:1,want:1,rattle:0,burst:false});poseGate(10);
  branch.visible=false;branch.children[0].rotation.z=0;BR.phase=-1;deer.visible=false;DR.phase=-1;cable.visible=false;CB.amp=0;wet.visible=false;leaf.visible=false;LF.s=-1;stone.visible=false;ST.t=-1;glow.visible=false;glow.material.opacity=0;GL.o=0;GL.want=0;
  for(const r of ripple){r.t=-1;r.m.visible=false;}for(const d of drops){d.t=-1;d.m.visible=false;}
  releaseBounce();A.shade=0;A.barLight=false;A.remountRange=undefined;A.escape=null;A.rideBoost=undefined;A.rideFov=0;for(const c of [jamie,sam]){c.tight=0;c.boost=1;}WN?.setLimit(null);o.flashShadow?.(false);
  for(const a of people){a.show(false);a.lookAt=null;a.gest(null);a.mode='stand';a.path=null;}o.setDrain?.(1);o.setPace?.(1);T?.reset();o.audio()?.stopRecording?.();if(hadPose&&S.pose===hadPose){k.setPose(null);o.roam.walkLock=false;}}
 // QA jumps and Continue: put the chapter at one of its moments, everything it needs set up.
 function jump(section){if(A3.next?.handles?.(section)&&!SECTIONS3.includes(section)&&!ALIAS3[section]){reset();fresh();A3.next.jump(section);return;}section=ALIAS3[section]||section;reset();fresh();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();
  const dayS=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day'];
  if(dayS.includes(section)){k.nightWorld();ch2.morningWorld();dayWorld();ch2.flyers.visible=true;
   const ride=(c,q,a)=>{comp.putRiding(c,q.x,q.z,a,0);c.follow='ride';};
   if(section==='chapter3-start'){const q=main(593,1.2);o.placePlayer({x:q.x,z:q.z,a:heading(593)+.9,mode:'ride',speed:0});ride(jamie,main(589.5,-.6),heading(589.5)+.4);ride(sam,main(590.5,2.8),heading(590.5)+.7);go('d3-corner');opening();C.fadeIn=-1;return;}
   if(section==='c3-alex-house'){const q=side(114,1.6);o.placePlayer({x:q.x,z:q.z,a:k.ha(114),mode:'ride',speed:1.5});ride(jamie,side(110,-.4),k.ha(110));ride(sam,side(108.5,2.2),k.ha(108.5));go('d3-street');date(DAY.house,'AM');objective('Talk to Alex’s mom.','Down Briarwood, around the bend past the creek.');follow(true);return;}
   const bp=side(122.6,9.2),ba=k.ha(122.6);const jb=side(124.2,9.6),sb=side(120.8,9.4);
   const parkFoot=(c,q,b)=>{comp.putFoot(c,q.x,q.z,0,{bike:{x:b.x,z:b.z,a:ba,kick:1}});c.follow=null;};
   if(section==='alex-bedroom'||section==='recording'){o.placePlayer({x:bp.x,z:bp.z,a:0,mode:'walk',bike:{x:bp.x+.8,z:bp.z,a:ba}});parkFoot(jamie,side(124,11),jb);parkFoot(sam,side(121,11),sb);
    C.flags.atHouse=true;C.flags.momTalk=true;C.flags.invited=true;enterRoom();if(section==='recording'){C.flags.phoneSeen=true;C.flags.phoneReady=true;S.queue.length=0;S.line=null;
     const dsk=RW(R.deskStand.x,R.deskStand.z),ph=phone.position,r=o.roam;o.placePlayer({x:dsk.x,z:dsk.z,a:headingTo(dsk.x,dsk.z,ph.x,ph.z),mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});startPhone();}return;}
   Object.assign(C.flags,{atHouse:true,momTalk:true,invited:true,phoneSeen:true,phoneReady:true,phone:true,recorded:true,canLeave:true});mom.show(false);
   if(section==='neighbors'){o.placePlayer({x:bp.x,z:bp.z,a:0,mode:'walk',bike:{x:bp.x+.8,z:bp.z,a:ba}});parkFoot(jamie,side(124,11),jb);parkFoot(sam,side(121,11),sb);exitRoom();return;}
   // the end of Briarwood, by day, riding up to it
   C.flags.okafor=true;for(const kk of ['huang','okafor'])C.talked.add(kk);const q=side(226,1.2);o.placePlayer({x:q.x,z:q.z,a:k.ha(226),mode:'ride',speed:2});ride(jamie,side(221.5,-.6),k.ha(221.5));ride(sam,side(219.5,2.2),k.ha(219.5));
   go('d3-road');date(DAY.road,'AM');follow(true);objective('Find the old service road.','The end of Briarwood, past the last house.');return;}
  // The night.
  // (the whole day behind them)
  Object.assign(C.flags,{atHouse:true,momTalk:true,invited:true,phoneSeen:true,phoneReady:true,phone:true,recorded:true,canLeave:true,okafor:true,roadDay:true,tracks:true,dayStop:true,leaving:true});
  nightWorld();C.flags.met=true;S.flashOn=true;ch2.samBeam.on=true;o.setFlashlight?.(true,true);for(const kk in C.amb)C.amb[kk]=kk==='traffic'||kk==='life'?0:kk==='forest'?1:kk==='insects'?1:kk==='wind'?.8:0;
  if(section==='night-start'){C.flags.met=false;nightStart();C.fadeIn=-1;S.flashOn=false;ch2.samBeam.on=false;o.setFlashlight?.(true,false);return;}
  const rideRoad=(s,t=0,v=3)=>{const q=Wd.at(s,t);o.placePlayer({x:q.x,z:q.z,a:q.a,mode:'ride',speed:v});const j=Wd.at(Math.max(0,s-3.4),.9),m=Wd.at(Math.max(0,s-5.8),-.9);comp.putRiding(jamie,j.x,j.z,j.a,v);comp.putRiding(sam,m.x,m.z,m.a,v);for(const c of [jamie,sam]){c.follow='ride';c.tight=1;}follow(true);};
  if(section==='c3-road-night'){const q=side(240,1.2),j=side(236,-.4),m=side(234.4,1.8);for(const kk in C.amb)C.amb[kk]=kk==='forest'||kk==='tunnel'||kk==='water'?0:1;o.placePlayer({x:q.x,z:q.z,a:k.ha(240),mode:'ride',speed:2.5});comp.putRiding(jamie,j.x,j.z,k.ha(236),2.5);comp.putRiding(sam,m.x,m.z,k.ha(234.4),2.5);
   for(const c of [jamie,sam])c.follow='ride';follow(true);go('n3-ride');T.value=.08;T?.set(.08);roadNight();return;}
  C.flags.roadNight=true;A.barLight=true;
  if(section==='c3-forest-deep'){C.flags.noHouses=true;BR.phase=-2;C.flags.glint=true;go('n3-road');date(NIGHT.road,'PM');objective('Follow the old road.');rideRoad(332,.2);T.value=.3;T?.set(.3);return;}
  C.flags.noHouses=true;C.flags.glint=true;C.flags.valley=true;BR.phase=-2;DR.phase=9;
  // at the outfall: bikes on the pad, all three on foot
  const bikes={you:Wd.fromA(9.6,10.6),jamie:Wd.fromA(8.4,12.3),sam:Wd.fromA(11.4,8.9)},ba=headingTo(bikes.you.x,bikes.you.z,WS.pad.x,WS.pad.z+8);
  const parkAt=(c,b)=>({x:b.x,z:b.z,a:ba,kick:1});
  const footAt=(c,q,a)=>{comp.putFoot(c,q.x,q.z,a,{bike:parkAt(c,bikes[c.key])});c.follow=null;};
  const youFoot=(q,a)=>o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:{x:bikes.you.x,z:bikes.you.z,a:ba}});
  if(section==='c3-tunnel-entrance'){const q=Wd.fromA(10.6,7.6);youFoot(q,headingTo(q.x,q.z,DS.mouth.x,DS.mouth.z));footAt(jamie,Wd.fromA(9.2,6.2),headingTo(q.x,q.z,DS.mouth.x,DS.mouth.z));footAt(sam,Wd.fromA(11.8,9.4),headingTo(q.x,q.z,DS.mouth.x,DS.mouth.z));
   A.barLight=false;T.value=.26;T?.set(.26);C.flags.outfall=true;go('n3-outfall');date(NIGHT.outfall,'PM');C.lastEvent=C.t;objective('Enter the drain.');C.flags.canEnter=true;follow(true);return;}
  C.flags.outfall=true;C.flags.canEnter=true;A.barLight=false;date(NIGHT.inside,'PM');
  const inTunnel=(s,{j=3.6,m=-2.3,back=false}={})=>{const q=Dr.at(s,.1),a=q.a+(back?Math.PI:0);youFoot({x:q.x,z:q.z},a);const jq=tq(s+j,.6),sq=tq(s+m,-.65);footAt(jamie,jq,a);footAt(sam,sq,a);C.flags.inside=true;C.flags.jamieToMouth=true;C.inAt=C.t;C.maxDs=s;
   role(jamie,'lead');role(sam,'behind');for(const kk in C.amb)C.amb[kk]=kk==='tunnel'?1:kk==='water'?.6:0;};
  if(section==='c3-tunnel-inside'){inTunnel(30);go('n3-tunnel');T.value=.32;T?.set(.32);return;}
  C.flags.deep=true;
  if(section==='c3-tunnel-deep'){inTunnel(98);go('n3-tunnel');T.value=.36;T?.set(.36);return;}
  if(section==='c3-evidence'){inTunnel(100.5);go('n3-tunnel');T.value=.36;T?.set(.36);return;}
  C.flags.prints=true;C.printsAt=C.t-20;
  if(section==='c3-first-bell'){inTunnel(125);go('n3-tunnel');C.flags.knock=true;T.value=.42;T?.set(.42);bellFar();return;}
  C.flags.knock=true;C.flags.bell1=true;C.bell1At=C.t-30;
  if(section==='c3-alex-item'){inTunnel(IT.s-5.5,{j:2.6,m:-1.8});go('n3-tunnel');T.value=.46;T?.set(.46);itemSeen();return;}
  C.flags.item=true;C.itemAt=C.t-20;
  if(section==='c3-old-bike'){inTunnel(OB.s-8);go('n3-tunnel');T.value=.5;T?.set(.5);oldBikeSeen();return;}
  C.flags.oldBike=true;
  if(section==='c3-broken-bell'){const b=old.group.position;inTunnel(OB.s-1.5,{j:2.4,m:-1.6});const p=me();o.placePlayer({x:p.x,z:p.z,a:headingTo(p.x,p.z,b.x,b.z),mode:'walk',bike:{x:bikes.you.x,z:bikes.you.z,a:ba}});
   go('n3-bike');date(NIGHT.bike,'PM');T.value=.55;T?.set(.55);C.flags.canInspect=true;C.flags.inspected=true;C.flags.canBell=true;C.bellWait=0;objective('Try the bell.');hold(jamie,{look:{x:b.x,y:b.y+.7,z:b.z},until:C.t+20});hold(sam,{look:{x:b.x,y:b.y+.7,z:b.z},until:C.t+20});tryBell();return;}
  C.flags.canInspect=true;C.flags.inspected=true;C.flags.belled=true;C.flags.bell2=true;C.bellTries=2;date(NIGHT.bike,'PM');
  if(section==='c3-bike-gone'){inTunnel(OB.s+15,{j:3.2,m:-1.6,back:true});go('n3-deeper');T.value=.62;T?.set(.62);placeOld('removed');C.bikeGoneAt=C.t-10;
   const p=me();o.placePlayer({x:p.x,z:p.z,a:headingTo(p.x,p.z,oldSpot.x,oldSpot.z),mode:'walk',bike:{x:bikes.you.x,z:bikes.you.z,a:ba}});C.bikeLookT=1;bikeGoneNoticed('you');return;}
  placeOld('removed');C.flags.bikeGone=true;C.bikeGoneAt=C.t-20;
  if(section==='c3-figure-reveal'){inTunnel(193.5,{j:3,m:-1.6});go('n3-deeper');T.value=.62;T?.set(.62);figureReady();startReveal();return;}
  C.flags.canInspect=true;C.flags.figure=true;C.flags.figGone=true;C.fig={t0:C.t-40,seenT:5,seenAt:C.t-37,nudge:0,alexAt:C.t-35,unseenGo:false,distAtSeen:19};
  if(section==='c3-follow-alex'){inTunnel(212,{j:5,m:-1.4});go('n3-figure');T.value=.72;T?.set(.72);C.flags.figGone=false;figureGone();return;}
  wet.visible=true;C.wetT=20;cable.visible=true;CB.amp=.14;CB.t=20;C.followAt=C.t-30;C.flags.leaveHint=true;
  if(section==='c3-second-sighting'){inTunnel(240,{j:3.4,m:-1.4});go('n3-follow');objective('Follow him.');T.value=.72;T?.set(.72);
   C.point={jamie:{...tq(244,.4),look:lookAhead(262,0,1.2),max:2.2,face:Dr.at(244).a}};role(jamie,'point');role(sam,'beside');lureReady();return;}
  C.flags.wetSeen=true;C.flags.cableSeen=true;
  // at the junction, him walking away from them to the culvert (the reveal and the run start from here)
  const atJunction=s=>{inTunnel(s,{j:3.4,m:-1.3});go('n3-lure');date(NIGHT.lure,'PM');T.value=.8;T?.set(.8);C.flags.lure=true;lureReady();Object.assign(C.lure,{seenT:2,seenAt:C.t-6,distAtSeen:18,bySight:true});
   C.point={jamie:{...tq(265,.95),look:figChest,max:1.7}};role(jamie,'point');role(sam,'beside');};
  const lureDone=()=>{Object.assign(C.lure,{walkAt:C.t-14,stepAt:C.t-10,goneAt:C.t-9,voiceAt:C.t-8});hideFigure('lure-gone');(C.voices||=[]).push({word:'jamie',pos:culvertAt(2.6,.7),at:C.t-8,tunnel:true,where:'culvert'});};
  if(section==='c3-creature-reveal'){atJunction(258);C.lure.walkAt=C.t-4.5;FG.state='lure-walk';FG.s=CUL.s-1.6;FG.t=-1.9;FG.yaw=-.3;FG.v=1;figure.group.visible=true;placeFigure(0);S.jamieAim=figChest;S.samAim=figChest;return;}
  if(section==='c3-creature-advance'){atJunction(260);lureDone();creatureReveal();S.queue.length=0;S.line=null;CRT.state='reveal';CRT.t=-(culW()/2+.35);CRT.v=0;placeCreature();
   Object.assign(C.crt,{t0:C.t-4,emergeAt:C.t-7,seenT:.5,distAtSeen:17});creatureSeen();return;}
  if(section==='c3-creature-chase-start'){atJunction(260);lureDone();creatureReveal();S.queue.length=0;S.line=null;const w=culW();
   Object.assign(C.crt,{t0:C.t-8,emergeAt:C.t-11,seenT:2,seenAt:C.t-4.4,creepAt:C.t-3.4,dropAt:C.t-.6,distAtSeen:17});
   Object.assign(CRT,{state:'drop',t:-(w/2+.1),y:CUL.sill,phT:.5,from:{t:-(w/2+.1),y:CUL.sill},to:{t:-(w/2-1.1),y:0},v:2.4});placeCreature();
   hold(jamie,{look:crChest,until:null});hold(sam,{look:crChest,until:null});S.jamieAim=crChest;S.samAim=crChest;return;}
  C.flags.creature=true;C.flags.lure=true;C.lure={t0:C.t-60,seenT:2,seenAt:C.t-58,nudge:0,walkAt:C.t-55,stepAt:C.t-50,goneAt:C.t-49,voiceAt:C.t-48,distAtSeen:18,bySight:true,unseenGo:false};
  C.voices=[{word:'jamie',pos:culvertAt(2.6,.7),at:C.t-48,tunnel:true,where:'culvert'}];
  C.crt={t0:C.t-44,emergeAt:C.t-47,seenT:2,seenAt:C.t-40,nudge:0,creepAt:C.t-39,dropAt:C.t-36.2,landedAt:C.t-35.6,unseenGo:false,distAtSeen:17};
  // the run, further on: everyone already running for the way out (and it, where it would be by then)
  const running=(s,{j=-3.6,m=-1.6,stage='far',cr=null}={})=>{const q=Dr.at(s,0),a=q.a+Math.PI;youFoot({x:q.x,z:q.z},a);footAt(jamie,tq(s+j,.4),a);footAt(sam,tq(s+m,-.5),a);C.flags.inside=true;C.flags.jamieToMouth=true;C.maxDs=279;
   for(const kk in C.amb)C.amb[kk]=kk==='tunnel'?1:kk==='water'?.6:0;T.value=.98;T?.jolt(1,{hold:30});run();const P2=C.purs;P2.stage=stage;
   FG.state='hidden';if(cr!==null)crAt(cr,'chase',5);else crHide();for(const c of [jamie,sam]){c.walkV=4.5;}C.runT=10;C.flags.comeOn2=true;return P2;};
  const farDone=P2=>Object.assign(P2,{farAt:C.t-12,farWant:19,farVisAt:C.t-11,farSeenT:2,farSeenAt:C.t-10.5,farDist:19,cue:1});
  const sideDone=P2=>{farDone(P2);Object.assign(P2,{lostAt:C.t-8,lostLine:true,stumbleAt:C.t-7,sideAt:C.t-5,sideSeenT:1,sideSeenAt:C.t-4.4,sideDist:12.2,cue:2});};
  const gateDone=P2=>{Object.assign(P2,{pipeAt:C.t-20,bikeJamieAt:C.t-14,bikeSeenAt:C.t-13,nearAt:C.t-13,nearVisAt:C.t-12,nearSeenT:1,nearSeenAt:C.t-11.8,nearDist:8.8,gateHolder:'jamie',gateHoldAt:C.t-10,gateShutAt:C.t-9,gateHitAt:C.t-8.4,gateBurstAt:C.t-5.2,gateHits:6,minGap:8.2,minGapRun:8.2,cue:3});
   GA.burst=true;GA.want=1;GA.open=1;poseGate(10);};
  if(section==='c3-creature-far'){const P2=running(238,{stage:'far',cr:257});P2.farAt=C.t-3;P2.farWant=19;return;}
  if(section==='c3-creature-side'){const P2=running(188,{stage:'lost'});farDone(P2);Object.assign(P2,{lostAt:C.t-3,lostLine:true,stumbleAt:C.t-2});return;}
  if(section==='c3-bike-block'){const P2=running(104,{stage:'side',cr:116.5});sideDone(P2);P2.pipeAt=C.t-7;return;}
  if(section==='c3-creature-near'){const P2=running(92,{stage:'near',cr:103.5});sideDone(P2);Object.assign(P2,{pipeAt:C.t-10,bikeJamieAt:C.t-2.6,nearAt:C.t-.3});return;}
  if(section==='c3-creature-barrier'){const P2=running(78.5,{stage:'near',cr:87.5,m:-6.4});sideDone(P2);Object.assign(P2,{pipeAt:C.t-14,bikeJamieAt:C.t-5,bikeSeenAt:C.t-4,nearAt:C.t-4,nearVisAt:C.t-3,nearSeenT:1,nearSeenAt:C.t-2.8,nearDist:9.1});
   const jq=tq(GT.s-1.1,1.35);footAt(jamie,jq,Dr.at(GT.s).a);gateHold(jamie);return;}
  if(section==='c3-tunnel-exit'){const P2=running(40,{stage:'after',cr:57,j:-3.4,m:-1.4});sideDone(P2);gateDone(P2);return;}
  C.flags.run=true;C.flags.out=true;C.flags.inside=true;FG.state='hidden';o.setDrain?.(0);placeOld('relocated');GA.burst=true;GA.want=1;GA.open=1;poseGate(10);
  // (out of the drain: it, low at the mouth, watching)
  const outPurs=stage=>{const P2=C.purs=newPurs();sideDone(P2);gateDone(P2);Object.assign(P2,{stage,mouthAt:C.t-6,mouthLine:true,exitSeenAt:C.t-8,cue:4});crAt(9,'watch',0);CRT.t=-.3;CRT.pose={crouch:1};placeCreature();return P2;};
  if(section==='c3-bike-remount'){const r=bikes.you,q=Wd.fromA(5.5,6.5);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,r.x,r.z),mode:'walk',bike:{x:r.x,z:r.z,a:ba}});
   footAt(jamie,Wd.fromA(7.6,9.8),ba);footAt(sam,Wd.fromA(8.8,7.4),ba);go('n3-out');date(NIGHT.run,'PM');objective('Get back to the bikes.');T.value=.95;T?.jolt(1,{hold:20});outPurs('mouth');
   A.remountRange=6;A.escape=escapeDir;for(const c of [jamie,sam])role(c,'run');for(const kk in C.amb)C.amb[kk]=kk==='forest'?1:kk==='water'?1:kk==='insects'?1:0;return;}
  if(section==='c3-road-escape'||section==='c3-final-lure'){const fin=section==='c3-final-lure',s0=fin?RF.s+42:Wd.L-4,pq=Wd.at(s0,0);o.placePlayer({x:pq.x,z:pq.z,a:pq.a+Math.PI,mode:'ride',speed:fin?5.5:0});
   const j=fin?Wd.at(s0-4,.8):Wd.fromA(10.4,9.8),m=fin?Wd.at(s0+3,-.8):Wd.fromA(12.6,10.6);comp.putRiding(jamie,j.x,j.z,pq.a+Math.PI,fin?5.5:0);comp.putRiding(sam,m.x,m.z,pq.a+Math.PI,fin?5.5:0);for(const c of [jamie,sam]){c.follow='ride';c.tight=1;}
   go('n3-out');date(NIGHT.run,'PM');T.value=.95;T?.jolt(1,{hold:20});C.flags.out=true;const P2=outPurs(fin?'done':'mouth');mounted();for(const kk in C.amb)C.amb[kk]=kk==='forest'?1:kk==='water'?1:kk==='insects'?1:0;
   if(fin){crHide('gone');Object.assign(P2,{treeAt:C.t-20,treeS:Wd.L-12});C.flags.bellBehind=true;C.heardBells.push({pos:{x:Dr.P.x+8,y:Dr.P.floor+1.5,z:Dr.P.z},at:C.t-8,behind:true});}return;}
  C.flags.flee=true;C.flags.bellBehind=true;FG.state='gone';C.roadFig={stage:'gone',seenT:2,seenAt:C.t-30,reactAt:C.t-30,leaveAt:C.t-29,goneAt:C.t-27};{const P2=outPurs('done');crHide('gone');Object.assign(P2,{treeAt:C.t-60,treeS:Wd.L-12});}
  if(section==='chapter3-end'){const q=side(241,1),j=side(238.6,-1.2),m=side(237.4,2.1);o.placePlayer({x:q.x,z:q.z,a:k.ha(241)+Math.PI,mode:'ride',speed:0});comp.putRiding(jamie,j.x,j.z,k.ha(238)+Math.PI,0);comp.putRiding(sam,m.x,m.z,k.ha(237)+Math.PI,0);
   for(const c of [jamie,sam])c.follow='ride';follow(true);go('n3-flee');T.value=.9;T?.set(.9);for(const kk in C.amb)C.amb[kk]=kk==='forest'||kk==='tunnel'||kk==='water'?0:1;safeNow();return;}}
 Object.assign(A3,{SECTIONS:SECTIONS3,ALIAS:ALIAS3,LABEL:LABEL3,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,jamieSweep,longThrow,hint,officerAim:()=>nextOwns()?A3.next.officerAim?.()??null:null,
  canDismount:()=>nextOwns()?A3.next.canDismount():!C.pose&&!C.inRoom&&!['c3-black','c3-night'].includes(S.phase),canRemount:()=>nextOwns()?A3.next.canRemount():!C.inRoom&&drainS()<0&&!/^n3-(outfall|tunnel|evidence|bell|item|bike|deeper|figure|follow|lure|creature)$/.test(S.phase)});// (the bikes wait at the mouth until you run)
 Object.defineProperties(A3,{amb:{get:()=>nextOwns()?A3.next.amb:C.amb},state:{get:()=>({phase:S.phase,flags:{...C.flags},inRoom:C.inRoom,recSel:C.recSel,recPlaying:C.recPlaying,heard:[...C.heard],talked:[...C.talked],amb:Object.fromEntries(Object.entries(C.amb).map(([a,b])=>[a,+b.toFixed(3)])),
   bells:(C.heardBells||[]).map(b=>({...b,pos:{x:+b.pos.x.toFixed(2),y:+b.pos.y.toFixed(2),z:+b.pos.z.toFixed(2)}})),voices:(C.voices||[]).map(v=>({word:v.word,at:v.at,tunnel:!!v.tunnel,where:v.where,dot:v.dotFromView,pos:{x:+v.pos.x.toFixed(2),z:+v.pos.z.toFixed(2)}})),
   oldBike:old.group.visible,bike:C.bike,oldFallen:!!C.oldFallen,helmet:helmet.visible,evidence:evidence.visible,marks:marks.visible,phone:phone.visible,
   figure:{state:FG.state,visible:figure.group.visible,s:+FG.s.toFixed(2),t:+FG.t.toFixed(2),v:+FG.v.toFixed(2),road:FG.road?{s:+FG.road.s.toFixed(2),t:+FG.road.t.toFixed(2)}:null,seenAt:C.fig?.seenAt??null,seenT:+(C.fig?.seenT??0).toFixed(2),t0:C.fig?.t0??null,alexAt:C.fig?.alexAt??null,unseenGo:!!C.fig?.unseenGo,distAtSeen:C.fig?.distAtSeen??null},
   purs:C.purs?{...C.purs}:null,roadFig:C.roadFig?{...C.roadFig}:null,lure:C.lure?{...C.lure}:null,crt:C.crt?{...C.crt}:null,
   creature:{state:CRT.state,visible:creature.group.visible,loaded:creature.loaded,error:creature.error?String(creature.error).slice(0,300):null,s:+CRT.s.toFixed(2),t:+CRT.t.toFixed(2),y:+CRT.y.toFixed(2),v:+CRT.v.toFixed(2),road:!!CRT.road},
   gate:{visible:gate.visible,open:+GA.open.toFixed(3),want:GA.want,burst:GA.burst},crSounds:C.crSounds||0,crKinds:{...(C.crKinds||{})},gateSounds:C.gateSounds||0,
   tension:T?.state,pose:!!C.pose,lastEvent:C.lastEvent,t:C.t,roadS:+roadS().toFixed(1),drainS:+drainS().toFixed(1),shade:+C.shade.toFixed(3),splashes:C.splashes||0,roles:{...C.role}})}});
 A.hint=()=>owns(S.phase)?hint():null;
 Object.assign(A3,{old,evidence,marks,phone,figure,helmet,glow,people:N,roomZone,RW,RECS,C,FG,placeOld,itemAt,oldSpot,relAt,RF,creature,CRT,GT,GA,LURE,CUL,SIDE,NEAR_S,gate,crChest,culvertAt});
 Object.defineProperty(A3,'glimpseBike',{get:()=>null});
 return A3;
}
