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
import {makeOldBike} from './old-bike.js';
import {leafGeometrySmall,leafTexture} from './materials.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
// QA jumps, in story order (names already used by Chapters One and Two get a c3- prefix).
export const SECTIONS3=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day','night-start','c3-road-night','c3-forest-deep','c3-tunnel-entrance','c3-tunnel-inside',
 'c3-evidence','c3-first-bell','c3-old-bike-tunnel','c3-broken-bell','c3-figure','c3-figure-bend','c3-voice-ahead','c3-voice-behind','c3-close-bell','c3-tunnel-escape','c3-bike-escape','chapter3-end'];
const ALIAS3={'phone-recording':'recording','neighbor-investigation':'neighbors','c3-tunnel-deep':'c3-tunnel-inside','c3-old-bike':'c3-old-bike-tunnel','c3-voice':'c3-voice-ahead','c3-escape':'c3-tunnel-escape','alex-house-day':'c3-alex-house'};
// Checkpoints (silent; Continue on the title menu returns to the last one).
export const LABEL3={'chapter3-start':'Where he turned, later','c3-alex-house':'Alex’s house','alex-bedroom':'Alex’s room','phone-recording':'His recordings','neighbor-investigation':'Asking around',
 'c3-road-day':'The end of Briarwood','night-start':'That night','c3-road-night':'The old road','c3-tunnel-entrance':'The outfall','c3-tunnel-deep':'Inside','c3-old-bike':'The bike, down there',
 'c3-figure':'Down the tunnel','c3-voice':'His voice','c3-escape':'Run','chapter3-end':'Briarwood, after'};
const DAY={start:'9:16',house:'9:24',room:'9:31',street:'9:58',road:'10:21',leave:'10:41'},NIGHT={home:'11:12',corner:'11:20',road:'11:26',outfall:'11:31',inside:'11:34',bike:'11:41',voice:'11:47',safe:'11:54'};
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
  'c3-night':.82,'n3-home':.78,'n3-corner':.79,'n3-ride':.82,'n3-road':.86,'n3-outfall':.88,'n3-tunnel':.88,'n3-evidence':.88,'n3-bell':.88,'n3-bike':.88,'n3-deeper':.88,'n3-figure':.88,'n3-follow':.88,
  'n3-search':.88,'n3-voice':.88,'n3-behind':.88,'n3-close':.88,'n3-run':.88,'n3-out':.88,'n3-flee':.86,'n3-safe':.82,'n3-end':.82}))k.DEEP[p]=v;
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
 {const mud=new THREE.MeshStandardMaterial({color:0x4b4134,roughness:.95,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),flat=new THREE.MeshStandardMaterial({color:0x98965f,roughness:1,side:THREE.DoubleSide});
  const line=(pts,w,m)=>{const pos=[],idx=[];for(let i=0;i<pts.length;i++){const [s,t]=pts[i],q=Wd.at(s,t),q2=Wd.at(Math.min(s+.5,Wd.L),t);const a=Math.atan2(q2.x-q.x,-(q2.z-q.z)),rx=Math.cos(a),rz=Math.sin(a);
    for(const e of [-1,1]){const x=q.x+rx*w/2*e,z=q.z+rz*w/2*e;pos.push(x,nav.groundY(x,z)+.012,z);}if(i<pts.length-1){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m2=new THREE.Mesh(g,m);marks.add(m2);return m2;};
  // One tire, wheeled (not ridden: it wanders), along the dusty edge of the asphalt from the gate on.
  const pts=[];for(let s=10;s<=126;s+=.5){const hw=Wd.halfW(s);pts.push([s,hw-.32+.12*Math.sin(s*.31)+.06*Math.sin(s*1.3)]);}line(pts,.06,mud).name='old-road-tire-track';
  // ...where it shows: in the pale skin of road dust along the edge. And small shoes beside it, someone pushing the bike.
  {const dust=new THREE.MeshStandardMaterial({color:0x9c907a,roughness:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
   for(const [s0,s1,w] of [[8,70,.8],[70,114,.55]]){const dp=[];for(let s2=s0;s2<=s1;s2+=.5){const hw=Wd.halfW(s2);dp.push([s2,hw-.48+.05*Math.sin(s2*.23)]);}line(dp,w,dust).name='old-road-edge-dust';}
   const shoe=new THREE.MeshStandardMaterial({color:0x5a5043,roughness:1,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
   for(let s2=10.4,i=0;s2<66;s2+=.36,i++){if((i*7)%9===4)continue;const hw=Wd.halfW(s2),t=hw-.74+(i%2?.08:-.08)+.04*Math.sin(s2*.9),q=Wd.at(s2,t),g=new THREE.Group();g.position.set(q.x,nav.groundY(q.x,q.z)+.016,q.z);g.rotation.y=-(q.a+.05*Math.sin(i));marks.add(g);
    for(const [z,r,l] of [[-.07,.042,.06],[.065,.036,.045]]){const e=new THREE.Mesh(new THREE.CircleGeometry(r,10),shoe);e.rotation.x=-Math.PI/2;e.scale.y=l/r*1.4;e.position.set(i%2?.005:-.005,0,z);g.add(e);}}
   mergeChildren(marks,shoe,'old-road-shoeprints');}
  for(let k2=0;k2<40;k2++){const s=11.5+k2*.09,hw=Wd.halfW(s),q=Wd.at(s,hw+.65+Math.sin(k2)*.1),geo=new THREE.PlaneGeometry(.035,.3+((k2*7)%5)*.04);geo.rotateX(-Math.PI/2);const m2=new THREE.Mesh(geo,flat);m2.position.set(q.x,nav.groundY(q.x,q.z)+.03,q.z);m2.rotation.y=-q.a+.9+((k2*13)%7-3)*.08;marks.add(m2);}
  // A thin branch, snapped and hanging, where something went by close to the edge.
  {const q=Wd.at(92,Wd.halfW(92)+1.1),g=new THREE.Group();g.position.set(q.x,nav.groundY(q.x,q.z)+1.05,q.z);g.rotation.y=-q.a;const r=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.9,5),new THREE.MeshStandardMaterial({color:0x8c7a5c,roughness:1}));r.position.set(-.2,-.3,0);r.rotation.z=.9;g.add(r);marks.add(g);}
  mergeChildren(marks,flat,'old-road-flattened-weeds');}
 const tracksAt=Wd.spots.gate;
 // ---- in the drain: silt on the old floor with footprints and a tire line in it ---------------------------------
 const evidence=new THREE.Group();evidence.name='drain-evidence';scene.add(evidence);evidence.visible=false;
 {const E=DD.evidence,silt=new THREE.MeshStandardMaterial({color:0x5d4f3c,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),dark=new THREE.MeshStandardMaterial({color:0x332a20,roughness:.85,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
  // The bar: a low ridge of silt down the left side of the old stretch, just out of the water.
  {const pos=[],idx=[];let n=0;for(let s=E.s0-2;s<=E.s1+1;s+=.5){const {w}=Dr.sizeAt(s),edge=-(w/2-.05),inner=-(w/2-1.2-.25*Math.sin(s*.4));for(const t of [edge,(edge+inner)/2,inner]){const q=Dr.at(s,t);pos.push(q.x,Dr.floorAt(s,t)+(t===inner?.03:.065),q.z);}n++;}
   for(let i=0;i<n-1;i++)for(let j=0;j<2;j++){const a=i*3+j;idx.push(a,a+1,a+3,a+1,a+4,a+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const m2=new THREE.Mesh(g,silt);m2.name='drain-silt-bar';evidence.add(m2);}
  const print=(s,t,a,left)=>{const g=new THREE.Group(),q=Dr.at(s,t);g.position.set(q.x,Dr.floorAt(s,t)+.068,q.z);g.rotation.y=-(q.a+a);evidence.add(g);
   for(const [z,r,l] of [[-.07,.042,.06],[.065,.036,.045]]){const e=new THREE.Mesh(new THREE.CircleGeometry(r,10),dark);e.rotation.x=-Math.PI/2;e.scale.y=l/r*1.4;e.position.set(left?-.005:.005,0,z);g.add(e);}return g;};
  // Small sneakers, walking in (deeper), a stride apart; scuffed in places; one tire beside them.
  for(let s=E.s0,i=0;s<E.s1;s+=.33,i++){const {w}=Dr.sizeAt(s),base=-(w/2-.62);if((i*7)%11===3)continue;print(s,base+(i%2?.09:-.09)+.05*Math.sin(s*.7),.05*Math.sin(i),i%2===0);}
  {const pts=[];for(let s=E.s0-1;s<E.s1;s+=.4){const {w}=Dr.sizeAt(s);pts.push([s,-(w/2-.95)+.08*Math.sin(s*.5)]);}const pos=[],idx=[];pts.forEach(([s,t],i)=>{const q=Dr.at(s,t);for(const e of [-1,1])pos.push(q.x+Math.cos(q.a)*.02*e,Dr.floorAt(s,t)+.069,q.z+Math.sin(q.a)*.02*e);if(i<pts.length-1){const b=i*2;idx.push(b,b+2,b+1,b+1,b+2,b+3);}});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m2=new THREE.Mesh(g,dark);m2.name='drain-tire-line';evidence.add(m2);}
  for(let k2=0;k2<5;k2++){const s=E.s0+5+k2*8.3,{w}=Dr.sizeAt(s),q=Dr.at(s,-(w/2-.7)),m2=new THREE.Mesh(new THREE.PlaneGeometry(.5,.12),dark);m2.rotation.x=-Math.PI/2;m2.rotation.z=.4+k2;m2.position.set(q.x,Dr.floorAt(s,-(w/2-.7))+.067,q.z);evidence.add(m2);}
  mergeChildren(evidence,dark,'drain-footprints');}
 const printsAt=(()=>{const s=DD.evidence.s0+5,{w}=Dr.sizeAt(s),q=Dr.at(s,-(w/2-.6));return {x:q.x,z:q.z,y:Dr.floorAt(s,-1)+.07};})();
 // ---- the old bike: the same one as under the oak, leaning on the wall far inside ------------------------------
 const old=makeOldBike();old.group.name='old-bike-in-drain';scene.add(old.group);old.group.visible=false;
 const OB=DD.oldBike,oldAt=(()=>{const {w}=Dr.sizeAt(OB.s),q=Dr.at(OB.s,OB.side*(w/2-.34));return {x:q.x,z:q.z,a:q.a};})();
 function placeOld(fallen=false){const g=old.group,p=oldAt,y=Dr.floorAt(OB.s,OB.side*1.9);g.position.set(p.x,y,p.z);
  if(fallen){g.position.x+=Math.cos(p.a)*.35;g.position.z+=Math.sin(p.a)*.35;g.rotation.set(0,-p.a+.25,1.42,'YXZ');old.steerAngle=.5;}else{g.rotation.set(0,-p.a,.21,'YXZ');old.steerAngle=-.22;}
  old.crankAngle=1.2;old.wheel=.3;old.kickstand=0;poseBike(old);g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);g.position.y+=y+.004-box.min.y;g.updateMatrixWorld(true);C.oldFallen=fallen;}
 const oldParts=()=>{const fx=Math.sin(oldAt.a),fz=-Math.cos(oldAt.a);return [-.5,0,.5].map(k2=>({x:oldAt.x+fx*k2,z:oldAt.z+fz*k2,r:.36,speed:0}));};
 const oldBellPos=()=>old.steer.localToWorld(old.bell.position.clone());
 // ---- the boy at the end of the light: Alex's size, Alex's clothes. Nothing about him is wrong. ----------------
 const figure=createPerson({...CAST.alex});figure.group.name='figure';scene.add(figure.group);figure.group.visible=false;
 const FG={s:DD.figure.s,t:DD.figure.t,v:0,gait:0,look:0,state:'off',pose:newPose()};
 function placeFigure(dt=0){const q=Dr.at(FG.s,FG.t),y=Dr.floorAt(FG.s,FG.t);figure.group.position.set(q.x,y,q.z);figure.group.rotation.set(0,-q.a,0);
  if(FG.v>.05){FG.gait+=FG.v*dt/stride(Math.max(FG.v,.8));walkPose(FG.pose,FG.gait,Math.max(FG.v,.8),{look:FG.look});}else standPose(FG.pose,C.t*.6,{look:FG.look,lookPitch:-.12,shift:.3});applyPose(figure,FG.pose);}
 const figHead=()=>({x:figure.group.position.x,y:figure.group.position.y+1.42,z:figure.group.position.z});
 const figChest=()=>({x:figure.group.position.x,y:figure.group.position.y+1.05,z:figure.group.position.z});
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
 const drops=[...Array(36)].map(()=>{const m2=new THREE.Mesh(new THREE.IcosahedronGeometry(.025,0),new THREE.MeshStandardMaterial({color:0xb9c3c4,roughness:.2,metalness:.2}));m2.visible=false;scene.add(m2);return {m:m2,v:new THREE.Vector3(),t:-1};});
 function splashAt(x,y,z,n=7,force=1){for(let i=0;i<n;i++){const d=drops.find(q=>q.t<0);if(!d)break;d.t=0;d.m.visible=true;d.m.position.set(x+(Math.random()-.5)*.3,y+.03,z+(Math.random()-.5)*.3);d.v.set((Math.random()-.5)*1.4,1.2+Math.random()*1.6*force,(Math.random()-.5)*1.4);}rippleAt(x,y,z,.7+.3*force,1.6);}
 const wet=new THREE.Group();wet.name='wet-footprint';scene.add(wet);wet.visible=false;const wetMat=new THREE.MeshStandardMaterial({color:0x1d1e1c,roughness:.08,metalness:.35,transparent:true,opacity:.9,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
 const WET={s:252,t:.95};{const q=Dr.at(WET.s,WET.t);wet.position.set(q.x,Dr.floorAt(WET.s,WET.t)+.006,q.z);wet.rotation.y=-q.a;for(const [x,z,r,l] of [[0,-.07,.042,.065],[0,.068,.036,.048],[.2,-.42,.042,.065],[.2,-.29,.036,.048]]){const e=new THREE.Mesh(new THREE.CircleGeometry(r,10),wetMat);e.rotation.x=-Math.PI/2;e.scale.y=l/r*1.4;e.position.set(x,0,z);wet.add(e);}}
 const wetAt=(()=>{const q=Dr.at(WET.s,WET.t);return {x:q.x,z:q.z,y:Dr.floorAt(WET.s,WET.t)+.02};})();
 const leaf=new THREE.Mesh(new THREE.PlaneGeometry(.09,.06),new THREE.MeshStandardMaterial({color:0x6a5332,roughness:1,side:THREE.DoubleSide}));leaf.rotation.x=-Math.PI/2;leaf.visible=false;scene.add(leaf);const LF={s:-1};
 const stone=new THREE.Mesh(new THREE.IcosahedronGeometry(.035,0),new THREE.MeshStandardMaterial({color:0x6f675c,roughness:1}));stone.visible=false;scene.add(stone);const ST={t:-1,y:0,v:0};
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
  RECS.forEach((r,i)=>{const y=20+i*17,sel=i===C.recSel;if(sel){g.fillStyle='#24303a';g.fillRect(2,y,124,16);}g.fillStyle=sel?'#d8e4d4':'#24303a';g.font='9px Arial';g.fillText(`Rec ${r.date}  ${r.time}`,6,y+11);g.fillText(r.len,100,y+11);if(C.recPlaying===i){g.fillText('▶',90,y+11);}});t.needsUpdate=true;}
 // ---- state ------------------------------------------------------------------------------------------------
 const C={};
 // Everything transient goes (Start over, a jump, a replay): bells heard, voices, every timer and wait.
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{heardBells:[],voices:[],t:0,pt:0,flags:{},timers:[],inRoom:false,recSel:0,recPlaying:-1,recEnd:0,heard:[],talked:new Set(),cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,pose:null,
  amb:{traffic:1,insects:1,wind:1,life:1,forest:0,tunnel:0,water:0},depth:0,lastEvent:0,leftAt:null,bellTries:0,want:null,wantT:0,loose:false,match:false,dogT:8,role:{jamie:null,sam:null},hold:{},glance:{},back:null,backs:0,maxDs:0,jit:0,
  fig:null,stage:null,waitT:0,runT:0,splashT:0,oldFallen:false,shade:0});}
 fresh();
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why)T?.note(why);};
 function card(on,title='Chapter Three',eyebrow=''){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2');if(e)e.textContent=eyebrow;if(h)h.textContent=title;el.classList.add('on');}else el.classList.remove('on');C.cardOn=on;}
 const owns=ph=>typeof ph==='string'&&/^(c3|d3|n3)-/.test(ph);
 const handles=sec=>SECTIONS3.includes(sec)||!!ALIAS3[sec];
 const day=()=>/^(c3-black|d3-)/.test(S.phase);
 const tunnelPhase=()=>/^n3-(tunnel|evidence|bell|bike|deeper|figure|follow|search|voice|behind|close|run)$/.test(S.phase);
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
  tense:(w)=>(p)=>{p[PI.root+1]-=.04*w;p[PI.lean]+=.12*w;p[PI.lh+1]+=.06*w;}};
 function role(c,r){C.role[c.key]=r;C.hold[c.key]=null;if(c.mode!=='foot'||c.script?.roleStep)return;comp.run(c,[comp.steps.toward(c,ctx=>target(c,ctx))],{then:()=>{if(C.role[c.key]==='run')mountUp(c);}});c.script.roleStep=true;}
 // Out of the drain and at the bike: turn to it, kickstand up, on, quickly (but the same movement as ever).
 function mountUp(c){C.role[c.key]='mounted';comp.run(c,[comp.steps.turnTo(c,()=>c.ba,.35),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,1.9)],{then:()=>{c.follow=null;}});}
 // Hold someone where they are for a moment, facing/looking somewhere, with a gesture.
 function hold(c,{face=null,look=null,gesture=null,until=null}={}){C.hold[c.key]={face,look,gesture,until,at:C.t};}
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
  if(r==='run'){// out: along the drain toward the mouth, then to the bike; waiting for you if you fall behind
   if(cs>=0){const lag=cs<ps-.5?0:Math.max(0,cs-ps);const back=ps>cs+7;if(back){return {x:c.px,z:c.pz,v:0,look:{x:p.x,z:p.z,y:camera.position.y},face:headingTo(c.px,c.pz,p.x,p.z),turn:2.5};}
    const q=cs>5?tq(cs-4,c===jamie?.5:-.5):Wd.fromA(5.5,c===jamie?.9:-.9);void lag;return {x:q.x,z:q.z,v:c===jamie?3.55:3.4,look:gl};}// (near the mouth: on out onto the apron)
   const b={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43};if(Math.hypot(b.x-c.px,b.z-c.pz)<.45)return null;return {x:b.x,z:b.z,v:3.1,look:gl};}
  if(r==='point'){const at=C.point?.[c.key];if(!at)return {x:c.px,z:c.pz,v:0,look:gl};return {x:at.x,z:at.z,look:at.look||gl,max:at.max||2,face:at.face};}
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
  old.group.visible=false;evidence.visible=false;marks.visible=true;figure.group.visible=false;A.barLight=false;
  const door=AH.toWorld(AH.doorX+1.15,AH.stepFront+.85);mom.show(true);mom.place(door.x,door.z,headingTo(door.x,door.z,side(127,0).x,side(127,0).z));mom.gest('fold');mom.lookAt=null;
  for(const [key,a] of Object.entries(N)){const q=NSPOT[key];a.show(true);a.place(q.at.x,q.at.z,headingTo(q.at.x,q.at.z,q.face.x,q.face.z));a.gest(q.gest);a.lookAt=null;}
  world.doors.alex?.set(0);}
 function nightWorld(){A.day=0;A.night=1;ch2.day=0;S.deep=A.deep=.8;o.flashShadow?.(true);o.nightRendering?.(true);ambient.morning?.(false);ambient.night?.(true);document.body?.classList?.add('night1');S.flags.night=true;WN?.setLimit(null);
  for(const a of [...k.adults,...ch2.extra,...people])a.show(false);for(const b of ch2.beams){b.on=false;}ch2.found.group.visible=false;ch2.tape.visible=false;ch2.flyers.visible=true;
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;old.group.visible=true;placeOld(false);evidence.visible=true;marks.visible=true;branch.visible=true;
  police.reset?.();carA.show(false);carB.show(false);
  world.alexWindow.emissiveIntensity=.85;world.doors.alex?.set(0);o.setFlashlight?.(true,false);S.flashOn=false;}
 // ---- the day ----------------------------------------------------------------------------------------------------
 function begin(){fresh();go('c3-black');C.cardT=0;o.fade(1);dayWorld();S.lookTarget=null;S.jamieAim=null;S.samAim=null;objective('');T?.reset();
  for(const c of [jamie,sam]){c.lookAt=null;c.lookPlayer=false;}}
 function opening(){go('d3-corner');date(DAY.start,'AM');C.fadeIn=0;
  talk([{wait:2.6},{who:'JAMIE',text:'“If Alex heard it before he left…”',from:jamie,time:2.6,gap:.9},{who:'SAM',text:'“What?”',from:sam,time:1.4,gap:1},
   {who:'JAMIE',text:'“Maybe yesterday wasn’t the first time.”',from:jamie,time:2.8,gap:1.6},
   {who:'SAM',text:'“Like… he heard it other nights?”',from:sam,time:2.4},{who:'JAMIE',text:'“I don’t know.”',from:jamie,time:1.6,gap:.8},
   {who:'YOU',text:'“His mom would know.”',time:2},{who:'SAM',text:'“We can’t just go bug his mom right now.”',from:sam,time:2.6},
   {who:'JAMIE',text:'“She knows us. Come on.”',from:jamie,time:2}],
   {then:()=>{go('d3-street');objective('Talk to Alex’s mom.','Down Briarwood, around the bend past the creek.');checkpoint('chapter3-start');follow(true);}});}
 const momSpot=()=>mom.pos;
 function momTalk(){if(C.flags.momTalk)return;C.flags.momTalk=true;go('d3-mom');objective('');const p=me();mom.gest(null);mom.faceTo(p.x,p.z);mom.lookAt=camera.position;
  for(const c of [jamie,sam])c.lookAt=mom.pos;
  talk([{who:'ALEX’S MOM',text:'“Hi, boys.”',from:mom,time:1.8,gap:.9},{who:'JAMIE',text:'“Hi.”',from:jamie,time:1.2,gap:1.2},
   {who:'ALEX’S MOM',text:'“I keep thinking he’s going to come around that corner.”',from:mom,time:3.4,gap:1.8,act:()=>{mom.lookAt=side(100,2);}},
   {who:'JAMIE',text:'“Did Alex ever say anything about… hearing stuff? At night?”',from:jamie,time:3.4,act:()=>{mom.lookAt=camera.position;}},
   {who:'ALEX’S MOM',text:'“Hearing what?”',from:mom,time:1.6},{who:'YOU',text:'“Like a bike bell.”',time:1.8,gap:2},
   {who:'ALEX’S MOM',text:'“…He asked me that.”',from:mom,time:2.2,gap:.6,act:()=>{T?.set(.08,{why:'his mom: he asked me that'});}},
   {who:'ALEX’S MOM',text:'“He kept asking if I heard a bike bell outside. At night.”',from:mom,time:3.4},
   {who:'ALEX’S MOM',text:'“Thursday, I think. And again Friday. Maybe Saturday.”',from:mom,time:3.2},
   {who:'ALEX’S MOM',text:'“I figured it was one of the neighbor kids riding around late. I told him to go to sleep.”',from:mom,time:4.6,gap:1.2,act:()=>{jamie.lookAt=sam.pos;sam.lookAt=jamie.pos;}},
   {who:'ALEX’S MOM',text:'“Why?”',from:mom,time:1.4,gap:1.4},{who:'JAMIE',text:'“…No reason.”',from:jamie,time:1.8,gap:1.4,act:()=>{for(const c of [jamie,sam])c.lookAt=mom.pos;}},
   {who:'ALEX’S MOM',text:'“You can go up to his room, if you want. I keep going in there.”',from:mom,time:3.6,act:()=>{mom.lookAt=AH.porchLight?RW(AH.doorX,AH.front):null;}},
   {who:'ALEX’S MOM',text:'“Just don’t move anything. The detective might come back.”',from:mom,time:3.2,act:()=>{mom.lookAt=camera.position;}}],
   {then:()=>{T?.ease(0,{fall:.05});go('d3-mom');C.flags.invited=true;objective('Go up to Alex’s room.','The front door.');world.doors.alex?.set(.55);mom.gest('fold');}});}
 // Into the house (a short fade) and up to his room; out again the same way.
 function toRoom(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>{enterRoom();C.fadeIn=0;};}
 function enterRoom(){roomOn(true);go('d3-room');date(DAY.room,'AM');checkpoint('alex-bedroom');objective('Look around Alex’s room.');mom.show(false);world.doors.alex?.set(0);
  const e=RW(R.enter.x,R.enter.z),c0=RW((R.x0+R.x1)/2,(R.z0+R.z1)/2),r=o.roam;o.placePlayer({x:e.x,z:e.z,a:headingTo(e.x,e.z,c0.x,c0.z),mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});
  const jq=RW(R.standJamie.x,R.standJamie.z),sq=RW(R.standSam.x,R.standSam.z);putFoot(jamie,jq,headingTo(jq.x,jq.z,c0.x,c0.z));putFoot(sam,sq,headingTo(sq.x,sq.z,c0.x,c0.z));follow(false);
  jamie.py=null;sam.py=null;phone.visible=true;C.recSel=0;C.recPlaying=-1;drawScreen();C.roomT=0;
  talk([{wait:3.2},{who:'SAM',text:'“It’s weird being in here without him.”',from:sam,time:2.8,gap:1}]);}
 function phoneNoticed(){if(C.flags.phoneSeen)return;C.flags.phoneSeen=true;const ph=phone.position;jamie.lookAt=ph;sam.lookAt=ph;
  talk([{who:'JAMIE',text:'“His phone.”',from:jamie,time:1.6},{who:'SAM',text:'“The cops didn’t take it?”',from:sam,time:2},
   {who:'JAMIE',text:'“His mom said they went through it and gave it back.”',from:jamie,time:3},{who:'JAMIE',text:'“Did they listen to his recordings?”',from:jamie,time:2.4},
   {who:'YOU',text:'“What recordings?”',time:1.8},{who:'JAMIE',text:'“He records dumb stuff on it. Noises. He made a fart my ringtone for a week.”',from:jamie,time:4}],
   {then:()=>{objective('Listen to Alex’s recordings.');C.flags.phoneReady=true;}});}
 function startPhone(){if(C.flags.phone)return;C.flags.phone=true;go('d3-phone');checkpoint('phone-recording');objective('');const ph=phone.position,p=me(),a=headingTo(p.x,p.z,ph.x,ph.z),at={x:ph.x-Math.sin(a)*.4,z:ph.z+Math.cos(a)*.4};
  pose(at,{y:nav.groundY(at.x,at.z)+1.12,pitch:-.74,look:ph});jamie.lookAt=ph;sam.lookAt=ph;}
 function playRec(){if(C.recPlaying>=0)return;const i=C.recSel,R2=RECS[i];if(!R2)return;C.recPlaying=i;drawScreen();const dur=o.audio()?.recording?.(i,phone.position)||[8.6,9,8.2,9.4,23.5][i];C.recEnd=C.t+dur;C.heard.push(i);
  if(i===4){T?.set(.12,{rise:.05,why:'the last recording'});}
  talk(R2.lines.map(l=>l.mark?{...l,act:()=>{if(l.mark==='bell1'){T?.set(.24,{rise:.08,why:'recorded bell'});}else if(l.mark==='bell2')T?.set(.29,{rise:.08,why:'recorded bell again'});else T?.set(.31,{rise:.06,why:'“there it is again”'});}}:l),{interrupt:true});}
 function recDone(){const i=C.recPlaying;C.recPlaying=-1;C.recSel=Math.min(RECS.length-1,i+1);drawScreen();const R2=RECS[i];
  if(i<4){if(R2.react.length)talk(R2.react.map(l=>({...l,from:l.by==='sam'?sam:jamie})));if(i===3)C.recSel=4;drawScreen();return;}
  C.flags.recorded=true;T?.ease(.14,{fall:.02,hold:6});
  talk([{wait:2.2},{who:'SAM',text:'“That’s a bike bell.”',from:sam,time:2},{who:'JAMIE',text:'“That’s the same one. That’s exactly what we heard.”',from:jamie,time:3},
   {who:'YOU',text:'“‘There it is again.’”',time:2.4,gap:1.2},{who:'JAMIE',text:'“He’d heard it before. Like, a bunch of times.”',from:jamie,time:3,gap:1.6},
   {who:'SAM',text:'“Where was he when he recorded that?”',from:sam,time:2.6,gap:.8},
   {who:'JAMIE',text:'“…Right there.”',from:jamie,time:1.8,act:()=>{const w=RW(R.sideWindow.glass.x,R.sideWindow.glass.z,1.4);jamie.lookAt=w;sam.lookAt=w;}}],
   {then:()=>{unpose();go('d3-window');objective('Look out his window.');}});}
 function lookOut(){if(C.flags.window)return;C.flags.window=true;const st=RW(R.sideWindow.x,R.sideWindow.z),lk=RW(R.sideWindow.look.x,R.sideWindow.look.z);lk.y=nav.groundY(st.x,st.z)+.6;
  pose(st,{y:nav.groundY(st.x,st.z)+1.42,pitch:-.16,look:lk});
  const creek=side(100,26);
  talk([{wait:1.6},{who:'JAMIE',text:'“That’s the creek. Behind the trees.”',from:jamie,time:2.6,act:()=>{jamie.lookAt=creek;}},{who:'YOU',text:'“Where his bike was.”',time:2.2,gap:1},
   {who:'SAM',text:'“So that’s where it was coming from.”',from:sam,time:2.6,gap:2.2},{who:'JAMIE',text:'“Every night. And he just… listened to it.”',from:jamie,time:3.2,gap:1.8},
   {who:'SAM',text:'“Can we go? I don’t like being in here.”',from:sam,time:2.6},{who:'JAMIE',text:'“Somebody else on his street had to hear it.”',from:jamie,time:2.8}],
   {then:()=>{unpose();objective('Ask the neighbors.','His street. Somebody else had to hear it.');C.flags.canLeave=true;}});}
 function leaveRoom(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>{exitRoom();C.fadeIn=0;};}
 function exitRoom(){roomOn(false);phone.visible=false;if(C.recPlaying>=0){C.recPlaying=-1;o.audio()?.stopRecording?.();}go('d3-neighbors');date(DAY.street,'AM');checkpoint('neighbor-investigation');
  const out=AH.toWorld(AH.doorX,AH.stepFront+1.3),street=side(127,0),a=headingTo(out.x,out.z,street.x,street.z),r=o.roam;o.placePlayer({x:out.x,z:out.z,a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});
  const j=AH.toWorld(AH.doorX-1.4,AH.stepFront+1.1),s2=AH.toWorld(AH.doorX+1.3,AH.stepFront+.9);putFoot(jamie,j,a);putFoot(sam,s2,a);follow(true);
  objective('Ask the neighbors.','His street. Somebody else had to hear it.');}
 // ---- asking around ---------------------------------------------------------------------------------------------
 const SAY={huang:[['MR. HUANG','“Morning, boys. Any news?”'],['JAMIE','“No.”'],['YOU','“Did you ever hear a bike bell? At night, the last few nights?”'],['MR. HUANG','“A bell? No. I’m asleep by ten. Earplugs.”'],['MR. HUANG','“I hope they find him. I really do.”']],
  delaney:[['MRS. DELANEY','“You boys shouldn’t be out riding around today.”'],['YOU','“Did you hear a bike bell at night? Like, late?”'],['MRS. DELANEY','“There’s always somebody out there late. Teenagers, cutting through by the creek.”'],['MRS. DELANEY','“I’ve called the city about it twice.”'],['SAM','“Okay. Thanks.”']],
  pruitt:[['MR. PRUITT','“Hey, guys.”'],['JAMIE','“Did you hear anything Saturday night? Like a bike bell?”'],['MR. PRUITT','“A bell, no. The dogs were going nuts around midnight, though. Every dog on the street.”'],['MR. PRUITT','“Probably a raccoon.”']],
  okafor:[['MR. OKAFOR','“You’re Alex’s friends.”'],['YOU','“Did you ever hear a bike bell at night?”'],['MR. OKAFOR','“…Yes. A few nights this week. Late. Down the street, toward the end.”'],['MR. OKAFOR','“I figured it was some kid out on the old drainage road.”'],['JAMIE','“The what?”'],
   ['MR. OKAFOR','“End of Briarwood, past the last house. There’s a gate. An old city road goes down from there.”','point'],['MR. OKAFOR','“Down to the big storm drain in the woods. Your creek ends up down there. All of it does.”'],['MR. OKAFOR','“Nobody’s used it in years. You boys stay off it.”']]};
 function askNeighbor(key){if(C.talked.has(key)||busy())return;C.talked.add(key);const a=N[key],p=me();a.gest(null);a.faceTo(p.x,p.z);a.lookAt=camera.position;for(const c of [jamie,sam])c.lookAt=a.pos;
  const by={JAMIE:jamie,SAM:sam,YOU:null};
  talk(SAY[key].map(([who,text,g])=>({who,text,from:by[who]===undefined?a:by[who],act:g==='point'?()=>{a.gest('point',side(250,0));}:null,gap:.5})),{range:9,from:a,then:()=>{a.lookAt=null;a.gest(NSPOT[key].gest);for(const c of [jamie,sam])c.lookAt=null;
   if(key==='okafor'){C.flags.okafor=true;go('d3-road');objective('Find the old service road.','The end of Briarwood, past the last house.');}
   else if(!C.flags.okafor&&C.talked.size>=2&&!C.flags.nudgeOkafor){C.flags.nudgeOkafor=true;talk([{wait:1.2},{who:'JAMIE',text:'“What about Mr. Okafor? Next door. He’s always up late.”',from:jamie,time:3}]);objective('Ask the neighbors.','Mr. Okafor, next door to Alex.');}}});}
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
   {who:'SAM',text:'“There are cops everywhere today. Somebody sees us, we’re dead.”',from:sam,time:3},{who:'JAMIE',text:'“That’s why. Tonight nobody’s looking.”',from:jamie,time:2.6,gap:1.2},
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
  talk([{wait:.8},{who:'SAM',text:'“I can’t see the way out anymore.”',from:sam,time:2.4,act:()=>{S.samAim=lookAhead(80,0,1.2);}},{who:'JAMIE',text:'“It’s just the bend.”',from:jamie,time:1.6,act:()=>{S.samAim=null;}}]);}
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
 // The bike.
 function oldBikeSeen(){if(C.flags.oldBike)return;C.flags.oldBike=true;go('n3-bike');checkpoint('c3-old-bike');date(NIGHT.bike,'PM');objective('');const b=old.group.position,at={x:b.x,y:b.y+.7,z:b.z};mark('the bike');
  S.jamieAim=at;later(.5,()=>{S.samAim=at;});hold(jamie,{look:at,until:C.t+9});hold(sam,{look:at,until:C.t+9});T?.set(.58,{rise:.12,why:'the bike from the oak'});
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
   {then:()=>{S.jamieAim=null;go('n3-deeper');role(jamie,'lead');role(sam,'behind');objective('');FG.state='waiting';FG.s=DD.figure.s;FG.t=DD.figure.t;FG.v=0;FG.look=0;figure.group.visible=true;placeFigure(0);}});}
 // The boy at the end of the light.
 function startFigure(){if(C.flags.figure)return;C.flags.figure=true;go('n3-figure');checkpoint('c3-figure');mark('someone down there');C.fig={t0:C.t,seenT:0,seenAt:null,nudge:0,walked:false};
  const fc=figChest;S.jamieAim=fc();hold(jamie,{look:fc,gesture:t=>GEST.tense(1),until:null});later(.55,()=>{S.samAim=fc();hold(sam,{look:fc,gesture:t=>GEST.tense(1),until:null});});
  T?.jolt(.74,{rise:1,hold:6,why:'someone, down the tunnel'});}
 function figureSeen(){const F=C.fig;if(F.seenAt!==null)return;F.seenAt=C.t;
  talk([{wait:.35},{who:'JAMIE',text:'“…Alex?”',from:jamie,time:1.5}],{interrupt:true});later(.45,()=>{FG.state='turn';});later(.75,()=>{FG.state='walk';});}
 function figureGone(){if(C.flags.figGone)return;C.flags.figGone=true;FG.state='gone';figure.group.visible=false;go('n3-follow');objective('Follow Jamie.');mark('he walked around the bend');
  S.jamieAim=null;S.samAim=null;C.hold.jamie=null;C.hold.sam=null;T?.set(.7,{why:'after him'});
  C.point={jamie:{...tq(229,.4),look:lookAhead(250,0,1.2),max:2.5,face:Dr.at(229).a}};role(jamie,'point');role(sam,'beside');
  talk([{who:'JAMIE',text:'“Alex! ALEX!”',from:jamie,time:1.6,gap:.4},{who:'SAM',text:'“Jamie, wait! Jamie!”',from:sam,time:1.6}],{interrupt:true});C.followAt=C.t;}
 // Past the bend: nobody. Things that have just been moved.
 function searchF(){if(C.flags.search)return;C.flags.search=true;go('n3-search');objective('');mark('nobody there');T?.set(.72,{why:'nobody there'});C.searchAt=C.t;
  CB.amp=.32;CB.t=0;cable.visible=true;for(let i=0;i<3;i++)later(i*.55,()=>{const q=Dr.at(250,0);rippleAt(q.x,Dr.floor(250)-.07,q.z,1.1,2.6);});LF.s=264;leaf.visible=true;
  wet.visible=true;wetMat.opacity=.9;C.wetT=0;
  C.point={jamie:{...tq(258,.6),look:lookAhead(268,0,1),max:1.3}};role(jamie,'point');role(sam,'beside');
  talk([{who:'JAMIE',text:'“He was right here.”',from:jamie,time:1.8,gap:1.4},{who:'SAM',text:'“There’s nobody down here.”',from:sam,time:2}]);}
 // From ahead: "Jamie?"
 const VA=()=>({x:Dr.sideCulvert.x,y:Dr.sideCulvert.y,z:Dr.sideCulvert.z});
 function voiceAhead(){if(C.flags.voice1)return;C.flags.voice1=true;go('n3-voice');checkpoint('c3-voice');date(NIGHT.voice,'PM');mark('his voice, ahead');const q=VA();C.v1At=C.t;
  o.audio()?.voice?.('jamie',q,{gain:1,tunnel:true,ref:3});C.voices=[{word:'jamie',pos:q,at:C.t,tunnel:true,where:'ahead'}];T?.jolt(.86,{rise:1,hold:8,why:'Alex’s voice, ahead'});
  const mouth={x:Dr.sideCulvert.mouth.x,z:Dr.sideCulvert.mouth.z,y:q.y};S.jamieAim=mouth;later(.4,()=>{S.samAim=mouth;});
  hold(jamie,{look:q,until:C.t+1.4});later(1.4,()=>{C.point={jamie:{...tq(Dr.sideCulvert?DD.junction.side.s-2.5:270,-.9),look:q,max:.9}};role(jamie,'point');});hold(sam,{look:q,gesture:t=>GEST.recoil(.5*smooth(t/.4)),until:null});
  talk([{who:'ALEX’S VOICE, AHEAD',text:'“Jamie?”',time:1.6,gap:2.2},{who:'JAMIE',text:'“…Alex?”',from:jamie,time:1.6,gap:1},{who:'SAM',text:'“Don’t. Jamie, don’t.”',from:sam,time:1.8}],{interrupt:true,then:()=>{C.waitV2=0;}});}
 // Then from behind them, back the way they came: "Guys?"
 const VB=()=>lookAhead(224,0,1.3);
 function voiceBehind(){if(C.flags.voice2)return;C.flags.voice2=true;go('n3-behind');mark('his voice, behind them');const q=VB();C.v2At=C.t;
  const f=new THREE.Vector3();camera.getWorldDirection(f);const dx=q.x-camera.position.x,dz=q.z-camera.position.z,l=Math.hypot(dx,dz)||1;const dot=(dx*f.x+dz*f.z)/l/(Math.hypot(f.x,f.z)||1);
  o.audio()?.voice?.('guys',q,{gain:1.05,tunnel:true,ref:4});C.voices.push({word:'guys',pos:q,at:C.t,tunnel:true,where:'behind',dotFromView:dot});T?.jolt(.94,{rise:1.4,hold:10,why:'his voice, behind them'});
  // Sam whips round first, his light swinging back; Jamie a moment later.
  C.hold.sam={face:headingTo(sam.px,sam.pz,q.x,q.z),look:q,gesture:t=>GEST.recoil(smooth(t/.25)),until:null,at:C.t,turn:3.4};S.samAim=q;
  later(.55,()=>{C.hold.jamie={face:headingTo(jamie.px,jamie.pz,q.x,q.z),look:q,gesture:t=>GEST.tense(1),until:null,at:C.t,turn:2.4};S.jamieAim=q;});
  talk([{who:'ALEX’S VOICE, BEHIND THEM',text:'“Guys?”',time:1.4}],{interrupt:true,then:()=>{go('n3-close');C.waitT=0;}});}
 // A bell, a few feet away. Nothing there.
 function closeBell(){if(C.flags.close)return;C.flags.close=true;mark('the bell, right beside them');const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();
  const p=camera.position,ps=drainS(),r=new THREE.Vector3(Math.cos(Math.atan2(f.x,-f.z)),0,Math.sin(Math.atan2(f.x,-f.z)));
  // just behind your shoulder, on the side away from the nearer wall
  const q0=Dr.project(p.x,p.z),sd=q0&&q0.t>0?-1:1;let q={x:p.x-f.x*1.0+r.x*.7*sd,y:p.y-.2,z:p.z-f.z*1.0+r.z*.7*sd};if(!Dr.inside(q.x,q.z,-.2)){q={x:p.x-f.x*1.2,y:p.y-.2,z:p.z-f.z*1.2};}void ps;
  C.closeAt=q;C.closeT=C.t;o.audio()?.bell3?.(q,.62,{tunnel:true,ref:1});C.heardBells.push({pos:q,at:C.t,close:true});
  T?.jolt(1,{rise:2,hold:30,why:'the bell, right beside them'});
  for(const c of [jamie,sam])C.hold[c.key]={face:headingTo(c.px,c.pz,q.x,q.z),look:q,gesture:t=>GEST.recoil(smooth(t/.18)),until:null,at:C.t,turn:3.6};S.jamieAim=q;S.samAim=q;
  talk([{who:'',text:'[A bicycle bell. Right beside them.]',time:1.6},{wait:.15},{who:'SAM',text:'“RUN!”',from:sam,time:1},{who:'JAMIE',text:'“GO! GO!”',from:jamie,time:1.2,act:run}],{interrupt:true});}
 // ---- the escape -------------------------------------------------------------------------------------------------
 function run(){if(C.flags.run)return;C.flags.run=true;go('n3-run');checkpoint('c3-escape');objective('Run.');S.jamieAim=null;S.samAim=null;o.setDrain?.(.14);C.runT=0;C.splashT=.6;
  for(const c of [jamie,sam]){C.hold[c.key]=null;c.lookAt=null;}role(sam,'run');later(.35,()=>role(jamie,'run'));
  // (the bike, far back down the tunnel, is not where they left it: it is lying on the floor)
  later(1,()=>{if(!k.camLooksAt(old.group.position,.5))placeOld(true);});
  A.remountRange=3.6;}
 function outOfDrain(){if(C.flags.out)return;C.flags.out=true;go('n3-out');objective('Get back to the bikes.');T?.set(.92,{hold:20});
  for(const c of [jamie,sam]){if(c.mode==='foot'&&!(c.script&&!c.script.roleStep))role(c,'run');}}
 function mounted(){if(C.flags.flee)return;C.flags.flee=true;go('n3-flee');objective('Get out of the woods.');A.barLight=true;
  for(const c of [jamie,sam]){c.tight=1;c.lookAt=null;}follow(true);C.fleeAt=C.t;}
 function safeNow(){if(C.flags.safe)return;C.flags.safe=true;go('n3-safe');date(NIGHT.safe,'PM');checkpoint('chapter3-end');objective('');o.setDrain?.(1);A.remountRange=undefined;
  T?.ease(.42,{fall:.035,hold:5,why:'the street, the light'});for(const c of [jamie,sam])c.tight=0;
  const gate=Wd.spots.gate,back={x:gate.x,z:gate.z,y:gate.y+1.2};
  talk([{wait:4.6},{who:'SAM',text:'“That was him.”',from:sam,time:2,gap:1.4},{who:'JAMIE',text:'“No.”',from:jamie,time:1.2,gap:1.6},{who:'SAM',text:'“You saw him.”',from:sam,time:1.8,gap:2},
   {who:'JAMIE',text:'“I know.”',from:jamie,time:1.6,gap:3.2},
   {act:()=>{S.lookTarget=back;for(const c of [jamie,sam])c.lookAt=back;S.jamieAim=null;},wait:4.6},{act:()=>{C.endT=0;},wait:.1}]);}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p');if(h)h.innerHTML='Chapter Three';if(pp)pp.textContent='August 22, 2011.';}o.finish();}
 // ---- every frame ------------------------------------------------------------------------------------------
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase,p=me(),L=where(p),rs=L.street==='woods'?(L.s??Wd.L):L.street==='side'?L.u-Wd.U:L.street==='drain'?Wd.L+1:-999,ds=L.street==='drain'?L.s:-1;
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  // (in the drain you walk carefully: wet concrete, silt, the dark; running is as fast as ever)
  o.setPace?.(ds>=0&&!C.flags.run?.72:1);
  for(const a of people)a.update(dt,{eye:camera.position});updatePose(dt);match(dt);updateAmb(dt);
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.4));if(C.fadeIn>=1.4){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.7));if(C.fadeOut>=.9){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(ph==='c3-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<4.4&&!C.cardOn)card(true);if(C.cardT>4.4&&C.cardOn)card(false);if(C.cardT>5.6)opening();}
  else if(ph==='d3-street'){if(L.street==='side'&&L.u>104&&dist(p,momSpot())<22&&!C.flags.atHouse){C.flags.atHouse=true;checkpoint('c3-alex-house');date(DAY.house,'AM');mom.lookAt=camera.position;}
   if(C.flags.atHouse&&dist(p,momSpot())<6&&!busy()){C.nearMom=(C.nearMom||0)+dt;if(C.nearMom>7)momTalk();}}
  else if(ph==='d3-room'){C.roomT+=dt;const ph2=phone.position;if(!C.flags.phoneSeen&&!busy()&&(C.roomT>18||(dist(p,ph2)<1.9&&C.roomT>4)||(C.roomT>5&&k.camLooksAt({x:ph2.x,y:ph2.y,z:ph2.z},.92))))phoneNoticed();}
  else if(ph==='d3-phone'){if(C.recPlaying>=0&&C.t>=C.recEnd&&!busy())recDone();}
  else if(ph==='d3-window'){const st=RW(R.sideWindow.x,R.sideWindow.z),lk=RW(R.sideWindow.look.x,R.sideWindow.look.z);
   if(!C.flags.window&&dist(p,st)<1.1&&k.camLooksAt({x:lk.x,y:st.y+.2,z:lk.z},.82)){C.winT=(C.winT||0)+dt;if(C.winT>1.1)lookOut();}else C.winT=0;}
  else if(ph==='d3-neighbors'){if(!C.flags.wander&&!busy()&&L.street==='main'&&dist(p,side(20,0))>60){C.flags.wander=true;talk([{who:'JAMIE',text:'“His street. Somebody on his street.”',from:jamie,time:2.4}]);}}
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
   if(C.flags.canEnter&&!p.riding&&!C.flags.jamieToMouth&&jamie.mode==='foot'){C.flags.jamieToMouth=true;C.point={jamie:{...tq(.9,1.45),look:lookAhead(10,0,1.2),max:1.6,face:Dr.at(1).a}};role(jamie,'point');}/* (once he is off his bike: to one side of the mouth, not in the way) */
   if(C.flags.jamieToMouth&&!C.flags.comeOn&&!busy()&&C.t-C.lastEvent>14&&ds<0){C.flags.comeOn=true;talk([{who:'JAMIE',text:'“Come on. Before I change my mind.”',from:jamie,time:2.2}]);}}
  if(tunnelPhase())updateTunnel(dt,ds);
  turnBack(ds,p);
  // (whoever has a part to play and nothing running picks it up again; off the bike first, in the drain)
  if(/^n3-/.test(ph))for(const c of [jamie,sam]){const r=C.role[c.key];if(!r||r==='mounted'||c.script)continue;if(c.mode==='foot')role(c,r);else if(c.mode==='ride'&&tunnelPhase())comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)]);}
  if(ph==='n3-run'||ph==='n3-out'){C.runT+=dt;if(ph==='n3-run'&&ds<0&&rs>Wd.L-40)outOfDrain();if(p.riding&&ph==='n3-out')mounted();
   if(!C.flags.comeOn2&&C.runT>9&&ds>=0&&!busy()){C.flags.comeOn2=true;talk([{who:'JAMIE',text:'“Come ON!”',from:jamie,time:1.2}]);}}
  if(ph==='n3-flee'){if(!C.flags.bellBehind&&rs<Wd.L-110&&rs>0){C.flags.bellBehind=true;const q={x:Dr.P.x+8,y:Dr.P.floor+1.5,z:Dr.P.z};o.audio()?.bell3?.(q,.9,{ref:30});C.heardBells.push({pos:q,at:C.t,behind:true});
    talk([{who:'',text:'[A bell. Far behind them.]',time:2.2}]);glance(sam,q,2);sam.lookAt={...q};later(2,()=>{sam.lookAt=null;});T?.jolt(.9,{hold:6,why:'a bell, behind them'});}
   if(rs<4&&rs>-40)safeNow();}
  if(ph==='n3-safe'){if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n3-end');end();}}}
  updateProps(dt,p,rs,ds);if(/^n3-/.test(ph))updateBounce();else releaseBounce();
  // How far under the trees (the dark closes in), and whether the handlebar light is wanted.
  const woodsDepth=rs>-999&&rs<=Wd.L+.5?smooth((rs-90)/160):ds>=0?1:0;C.shade=damp(C.shade,(A.night?woodsDepth:.3*woodsDepth),1.5,dt);A.shade=C.shade;
  A.night=day()?0:1;A.day=day()?1:0;if(A.day){S.deep=A.deep=0;}}
 // The old road at night: a few small things, none of them anything.
 function updateRoad(dt,rs){const p=me();
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
 const BACK=/^n3-(tunnel|evidence|bell|bike|deeper|follow|search)$/;
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
  if(ph==='n3-tunnel'&&C.flags.knock&&!C.flags.bell1&&!busy()&&C.t-C.lastEvent>6&&ds>=126)bellFar();
  if(ph==='n3-tunnel'&&C.flags.bell1&&!C.flags.oldBike){const b=old.group.position,d=Math.hypot(p.x-b.x,p.z-b.z);if(ds>=DD.oldBike.s-14&&(d<8||(d<17&&k.camLooksAt({x:b.x,y:b.y+.5,z:b.z},.94))||ds>DD.oldBike.s-4||cS(jamie)>DD.oldBike.s-11))oldBikeSeen();}
  if(ph==='n3-bike'){if(C.flags.canInspect&&!C.flags.inspected&&!busy()){C.inspectWait=(C.inspectWait||0)+dt;if(C.inspectWait>16){C.flags.inspected=true;C.flags.canBell=true;C.bellWait=10;}}
   if(C.flags.canBell&&!C.flags.belled&&!busy()){C.bellWait+=dt;if(C.bellWait>16&&C.bellTries===0){C.bellWait=-99;const bp=oldBellPos();S.jamieAim={x:bp.x,y:bp.y,z:bp.z};tryBell('jamie');later(1.8,()=>tryBell('jamie'));}}}
  if(ph==='n3-deeper'&&FG.state==='waiting'&&(ds>=195||cS(jamie)>=199))startFigure();
  if(ph==='n3-figure'){const F=C.fig;F.t=(F.t||0)+dt;const ch=figChest(),seen=k.camLooksAt(ch,.965)&&Dr.sees(camera.position,ch);if(seen)F.seenT+=dt;
   if(F.seenAt===null&&(F.seenT>.5||C.t-F.t0>40)){figureSeen();}
   if(F.seenAt===null&&!busy()){const since=C.t-F.t0;if(since>3.5&&F.nudge===0){F.nudge=1;talk([{who:'SAM',text:'“Look. Down there.”',from:sam,time:1.6}]);}else if(since>9&&F.nudge===1){F.nudge=2;talk([{who:'JAMIE',text:'“Down there. By the bend.”',from:jamie,time:2}]);}else if(since>17+F.nudge*7&&F.nudge<4){F.nudge++;talk([{who:'SAM',text:'“Down there.”',from:sam,time:1.2}]);}}
   // too close, and he goes anyway
   if(F.seenAt===null&&ds>DD.figure.s-18)figureSeen();}
  if(ph==='n3-follow'){if(ds>=225)searchF();if(!C.flags.leaveHint&&!busy()&&C.t-(C.followAt||0)>14&&ds<200){C.flags.leaveHint=true;talk([{who:'SAM',text:'“We can’t just leave him down there. Jamie! Come back!”',from:sam,time:2.8}]);}}
  if(ph==='n3-search'){const sinceS=C.t-C.searchAt;
   if(!C.flags.cableSeen&&ds>238&&k.camLooksAt({x:Dr.cable.x,y:Dr.cable.y-.8,z:Dr.cable.z},.95)&&!busy()){C.flags.cableSeen=true;talk([{who:'SAM',text:'“That’s moving.”',from:sam,time:1.4}]);glance(sam,{x:Dr.cable.x,y:Dr.cable.y-.8,z:Dr.cable.z},2);}
   if(!C.flags.wetSeen&&(Math.hypot(p.x-wetAt.x,p.z-wetAt.z)<4.5||sinceS>12)&&!busy()){C.flags.wetSeen=true;S.jamieAim=wetAt;C.point={jamie:{...tq(WET.s-.6,.3),look:wetAt,max:1.6}};role(jamie,'point');
    later(1.4,()=>hold(jamie,{look:wetAt,gesture:t=>GEST.crouch(smooth(t/.6)),until:C.t+4.5}));talk([{wait:1.8},{who:'JAMIE',text:'“It’s wet.”',from:jamie,time:1.4,gap:1},{who:'YOU',text:'“That’s from just now.”',time:2}],{then:()=>{S.jamieAim=null;C.point={jamie:{...tq(266,-.4),look:lookAhead(280,-1.5,1.2),max:1.1}};role(jamie,'point');C.wetDone=C.t;}});}
   if(C.wetDone&&!C.flags.stone&&C.t-C.wetDone>3.2){C.flags.stone=true;ST.t=0;const lip=Dr.sideCulvert.mouth;ST.x=lip.x;ST.z=lip.z;ST.y=Dr.sideCulvert.y-.85;stone.position.set(lip.x,ST.y,lip.z);stone.visible=true;ST.v=0;S.jamieAim={x:lip.x,y:ST.y,z:lip.z};}
   if(C.flags.stone&&!C.flags.voice1&&!busy()&&C.t-C.lastEvent>5&&(ds>=256||sinceS>30))voiceAhead();}
  if(ph==='n3-voice'&&C.waitV2!==undefined&&!busy()){C.waitV2+=dt;if(C.waitV2>5.5&&(k.camLooksAt(VA(),.35)||C.waitV2>9))voiceBehind();}
  if(ph==='n3-close'){C.waitT+=dt;// nobody moves but to come closer together; both lights stay on the empty bend
   if(C.waitT>1.2&&!C.flags.cluster){C.flags.cluster=true;const q=VB();role(sam,'beside');glance(sam,q,9);later(.8,()=>{role(jamie,'beside');glance(jamie,q,9);});}if(!C.flags.close&&C.waitT>6.2)closeBell();}
  // pursuit: water moving behind you as you run
  if(ph==='n3-run'&&ds>=0){C.splashT-=dt;if(C.splashT<=0){C.splashT=.42+Math.random()*.38;const s=Math.max(0,ds-(8.5+Math.random()*4.5)),{w}=Dr.sizeAt(s),t=(Math.random()-.5)*(w-1),q=Dr.at(s,t),y=Dr.floorAt(s,t);
    if(s>.5){const wetFloor=['old','junction'].includes(Dr.kindAt(s));if(wetFloor||Math.abs(t)<.4)splashAt(q.x,y+(wetFloor?.03:-.07),q.z,wetFloor?8:4,wetFloor?1:.6);else rippleAt(q.x,Dr.floor(s)-.07,q.z,.8,1.2);o.sfx('splash',{x:q.x,y:y+.2,z:q.z},{gain:wetFloor?.9:.5});C.splashes=(C.splashes||0)+1;
     if(C.splashes<=3||Math.random()<.3){const c=C.splashes%2?sam:jamie;glance(c,{x:q.x,z:q.z,y:y+.6},.8);}}}}}// (the first splashes always turn a head)
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
  if(stone.visible&&ST.t>=0){ST.t+=dt;ST.v-=9.8*dt;ST.y+=ST.v*dt;const fl=Dr.floor(DD.junction.side.s)+.02;if(ST.y<=fl){ST.y=fl;stone.visible=false;ST.t=-1;splashAt(ST.x,fl,ST.z,6,.7);o.sfx('pebble',{x:ST.x,y:fl,z:ST.z},{gain:.8});T?.jolt(.82,{rise:.6,hold:3,why:'a stone off the lip'});glance(sam,{x:ST.x,y:fl+.4,z:ST.z},1.6);}stone.position.y=ST.y;}
  // the boy: still, then a small turn of the head, then walking into the bend like anyone would; gone once out of sight
  if(FG.state!=='off'&&FG.state!=='gone'){if(FG.state==='turn')FG.look=damp(FG.look,.42,3,dt);if(S.phase==='n3-figure'&&FG.state!=='waiting'){S.jamieAim=figChest();if(S.samAim)S.samAim=figChest();}
   if(FG.state==='walk'){FG.v=Math.min(1.45,FG.v+dt*3);FG.s+=FG.v*dt;FG.look=damp(FG.look,0,2,dt);FG.t=damp(FG.t,-.7,.6,dt);
    if(FG.s>221){const vis=Dr.sees(camera.position,figHead(),.02)||Dr.sees(camera.position,figChest(),.02);if(!vis){FG.hidden=(FG.hidden||0)+dt;if(FG.hidden>.15)figureGone();}else FG.hidden=0;}
    if(FG.s>246&&FG.state!=='gone')figureGone();}
   if(FG.state!=='gone')placeFigure(dt);}}
 // Jamie's light: where the chapter points it, or ahead of him (along the road, or the tunnel) with a slow sweep.
 const sweepTmp={x:0,y:0,z:0};
 function jamieSweep(t){const c=jamie,x=c.mode==='foot'?c.px:c.bx,z=c.mode==='foot'?c.pz:c.bz,a=c.mode==='foot'?c.pa:c.ba;const s=cS(c);
  if(s>=0){const q=Dr.at(clamp(s+6+2*Math.sin(t*.37),.5,Dr.len-.5),1.3*Math.sin(t*.53)),y=Dr.floor(s+6)+.15+1.4*(.5+.5*Math.sin(t*.29));sweepTmp.x=q.x;sweepTmp.z=q.z;sweepTmp.y=y;return sweepTmp;}
  const d=c.mode==='ride'?10:5+Math.sin(t*.4)*1.5,s2=Math.sin(t*.7)*(c.mode==='ride'?.25:.55);sweepTmp.x=x+Math.sin(a+s2)*d;sweepTmp.z=z-Math.cos(a+s2)*d;sweepTmp.y=nav.groundY(sweepTmp.x,sweepTmp.z);return sweepTmp;}
 // Sam's light: ahead of him, lower and closer than Jamie's; shaking a little when he is scared.
 const samTmp={x:0,y:0,z:0},origSam=ch2.samBeam.target;
 ch2.samBeam.target=()=>{if(!owns(S.phase))return origSam();const jit=T&&T.value>.6?(T.value-.6)*.25:0,n=()=>(Math.random()-.5)*jit;
  if(S.samAim){const q=typeof S.samAim==='function'?S.samAim():S.samAim;samTmp.x=q.x+n();samTmp.z=q.z+n();samTmp.y=(q.y??nav.groundY(q.x,q.z))+n();return samTmp;}
  const c=sam,s=cS(c),t=C.t;if(s>=0){const q=Dr.at(clamp(s+4.5,.5,Dr.len-.5),.9*Math.sin(t*.61+1)),y=Dr.floor(s+4.5)+.1+.8*(.5+.5*Math.sin(t*.43));samTmp.x=q.x+n();samTmp.z=q.z+n();samTmp.y=y;return samTmp;}
  const x=c.mode==='foot'?c.px:c.bx,z=c.mode==='foot'?c.pz:c.bz,a=c.mode==='foot'?c.pa:c.ba,d=c.mode==='ride'?8:4.5;samTmp.x=x+Math.sin(a+.25*Math.sin(t*.5))*d;samTmp.z=z-Math.cos(a+.25*Math.sin(t*.5))*d;samTmp.y=nav.groundY(samTmp.x,samTmp.z);return samTmp;};
 // In the drain a flashlight lights more than its spot: the light comes back off the concrete. One of the
 // night's two spare point lights (police.js; no new lights, no new shaders) sits where each beam lands.
 const BOUNCE=police.emergency||[],_bd=new THREE.Vector3(),_bh=new THREE.Vector3();
 function updateBounce(){const on=Dr.inside(camera.position.x,camera.position.z,.3);
  [[BOUNCE[0],o.playerLight],[BOUNCE[1],police.head]].forEach(([L,src])=>{if(!L)return;
   if(!on||!src||src.intensity<=0||!Dr.inside(src.position.x,src.position.z,.05)){if(L.userData.borrowed){L.userData.borrowed=false;L.intensity=0;}return;}
   L.userData.borrowed=true;_bd.copy(src.target.position).sub(src.position).normalize();const d=Dr.rayDist(src.position,_bd,40);_bh.copy(src.position).addScaledVector(_bd,Math.max(.3,d-.45));
   L.position.copy(_bh);L.color.setHex(0xffe4c0);L.distance=16;L.decay=2;L.intensity=Math.min(7,src.intensity*.11)/(1+d*.04);});}
 const releaseBounce=()=>{for(const L of BOUNCE){if(L.userData.borrowed){L.userData.borrowed=false;L.intensity=0;}}};
 // A longer throw in the drain (and at its mouth): what the beam lands on sets how strong it can be.
 function longThrow(hand,aim){if(!Dr.inside(hand.x,hand.z,.05))return null;const dir=new THREE.Vector3(aim.x-hand.x,aim.y-hand.y,aim.z-hand.z),d0=dir.length();dir.normalize();const d=Math.min(d0,Dr.rayDist(hand,dir,44));
  // (aimed far down the tunnel he narrows the beam, and it reaches: an adjustable flashlight)
  const focus=S.phase==='n3-figure'&&FG.state!=='gone'&&figure.group.visible;
  return d>12?{d,reach:46,max:focus?300:150,angle:focus?.15:.2}:{d,reach:42,max:72,angle:.31};}
 // ---- what F does here ----------------------------------------------------------------------------------------
 function spots(){const out=[],ph=S.phase;if(C.fadeOut>=0||C.pose&&!C.pose.release&&ph!=='d3-phone'&&ph!=='n3-bike')return out;
  if(ph==='d3-street')if(mom.visible&&!C.flags.momTalk)out.push({id:'c3-mom',label:'Talk to Alex’s mom',at:mom.pos,face:mom.pos,r:3.6,ride:true,wide:true});
  if(ph==='d3-mom'&&C.flags.invited){const d=AH.toWorld(AH.doorX,AH.stepFront+.5);out.push({id:'c3-in',label:'Go inside',at:{x:d.x,z:d.z},face:{x:d.x,z:d.z},r:3,wide:true});}
  if(ph==='d3-room'&&C.flags.phoneReady)out.push({id:'c3-phone',label:'Listen to his recordings',at:phone.position,face:phone.position,r:2.3,wide:true});
  if(ph==='d3-phone'&&C.recPlaying<0&&!busy()&&C.recSel<RECS.length&&!C.flags.recorded)out.push({id:'c3-play',label:C.heard.length?'Next recording':'Play',at:phone.position,face:phone.position,r:3,wide:true});
  if(ph==='d3-window'&&!C.flags.window){const st=RW(R.sideWindow.x,R.sideWindow.z),gl=RW(R.sideWindow.glass.x,R.sideWindow.glass.z);out.push({id:'c3-window',label:'Look outside',at:st,face:gl,r:1.5,wide:true});}
  if(C.inRoom&&C.flags.canLeave){const d=RW(R.door.x,R.door.z);out.push({id:'c3-out',label:'Go back outside',at:d,face:RW(R.door.face.x,R.door.face.z),r:1.4,wide:true});}
  if(ph==='d3-neighbors')for(const [key,a] of Object.entries(N))if(a.visible&&!C.talked.has(key))out.push({id:'c3-ask-'+key,label:'Talk to '+a.name.replace('MR. ','Mr. ').replace('MRS. ','Mrs. ').replace(/(\w)(\w*)$/,(m,x,y)=>x+y.toLowerCase()),at:a.pos,face:a.pos,r:3.4,ride:true,wide:true});
  if(ph==='n3-bike'&&C.flags.canInspect&&!C.flags.inspected)out.push({id:'c3-inspect',label:'Look at the bike',at:old.group.position,face:old.group.position,r:2.8,wide:true});
  if(ph==='n3-bike'&&C.flags.canBell&&!C.flags.belled)out.push({id:'c3-bell',label:'Try the bell',at:old.group.position,face:old.group.position,r:2.6,wide:true});
  return out;}
 function act(id){if(id==='c3-mom')momTalk();else if(id==='c3-in')toRoom();else if(id==='c3-phone')startPhone();else if(id==='c3-play'){playRec();}else if(id==='c3-window')lookOut();else if(id==='c3-out')leaveRoom();
  else if(id.startsWith('c3-ask-'))askNeighbor(id.slice(7));else if(id==='c3-inspect')inspectOld();else if(id==='c3-bell')tryBell();}
 // Sounds placed in the world (positional loops). (Placeholders for the forest, the tunnel, the creek: hooks.)
 function sources(out){if(day()){out.push({id:'radio-am',kind:'radio',pos:officer.pos,level:.8});return;}
  const lf=C.amb.life;for(const [i,q] of loopsAt.ac.entries())out.push({id:'ac'+i,kind:'ac',pos:new THREE.Vector3(q.x,(q.ground??q.y??0)+.5,q.z),level:lf});
  out.push({id:'tv3',kind:'tv',pos:new THREE.Vector3(loopsAt.tv.x,loopsAt.tv.y+1.2,loopsAt.tv.z),level:lf},{id:'sprinkler3',kind:'sprinkler',pos:new THREE.Vector3(loopsAt.sprinkler.x,loopsAt.sprinkler.y+.3,loopsAt.sprinkler.z),level:lf});
  if(C.amb.water>.02)out.push({id:'outfall3',kind:'culvert',pos:new THREE.Vector3(Dr.P.x+4,Dr.P.floor+.6,Dr.P.z),level:.8*C.amb.water});
  if(C.amb.tunnel>.02){const s=Math.max(0,drainS()+10);out.push({id:'drain3',kind:'water',pos:new THREE.Vector3(Dr.at(Math.min(s,Dr.len-1)).x,Dr.floor(s)+.3,Dr.at(Math.min(s,Dr.len-1)).z),level:.35*C.amb.tunnel});}}
 function blockers(){const out=[];if(old.group.visible&&!C.oldFallen&&S.phase&&/^n3-/.test(S.phase))out.push(...oldParts());for(const a of people)if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});return out;}
 // ---- lifecycle --------------------------------------------------------------------------------------------------
 function reset(){const hadPose=C.pose;fresh();card(false);roomOn(false);phone.visible=false;old.group.visible=false;evidence.visible=false;marks.visible=false;figure.group.visible=false;Object.assign(FG,{s:DD.figure.s,t:DD.figure.t,v:0,gait:0,look:0,state:'off'});glint.visible=false;
  branch.visible=false;branch.children[0].rotation.z=0;BR.phase=-1;deer.visible=false;DR.phase=-1;cable.visible=false;CB.amp=0;wet.visible=false;leaf.visible=false;LF.s=-1;stone.visible=false;ST.t=-1;
  for(const r of ripple){r.t=-1;r.m.visible=false;}for(const d of drops){d.t=-1;d.m.visible=false;}
  releaseBounce();A.shade=0;A.barLight=false;A.remountRange=undefined;for(const c of [jamie,sam])c.tight=0;WN?.setLimit(null);o.flashShadow?.(false);
  for(const a of people){a.show(false);a.lookAt=null;a.gest(null);a.mode='stand';a.path=null;}o.setDrain?.(1);o.setPace?.(1);T?.reset();o.audio()?.stopRecording?.();if(hadPose&&S.pose===hadPose){k.setPose(null);o.roam.walkLock=false;}}
 // QA jumps and Continue: put the chapter at one of its moments, everything it needs set up.
 function jump(section){section=ALIAS3[section]||section;reset();fresh();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();
  const dayS=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','c3-road-day'];
  if(dayS.includes(section)){k.nightWorld();ch2.morningWorld();dayWorld();ch2.flyers.visible=true;
   const ride=(c,q,a)=>{comp.putRiding(c,q.x,q.z,a,0);c.follow='ride';};
   if(section==='chapter3-start'){const q=main(593,1.2);o.placePlayer({x:q.x,z:q.z,a:heading(593)+.9,mode:'ride',speed:0});ride(jamie,main(589.5,-.6),heading(589.5)+.4);ride(sam,main(590.5,2.8),heading(590.5)+.7);go('d3-corner');opening();C.fadeIn=-1;return;}
   if(section==='c3-alex-house'){const q=side(114,1.6);o.placePlayer({x:q.x,z:q.z,a:k.ha(114),mode:'ride',speed:1.5});ride(jamie,side(110,-.4),k.ha(110));ride(sam,side(108.5,2.2),k.ha(108.5));go('d3-street');date(DAY.house,'AM');objective('Talk to Alex’s mom.','Down Briarwood, around the bend past the creek.');follow(true);return;}
   const bp=side(122.6,9.2),ba=k.ha(122.6);const jb=side(124.2,9.6),sb=side(120.8,9.4);
   const parkFoot=(c,q,b)=>{comp.putFoot(c,q.x,q.z,0,{bike:{x:b.x,z:b.z,a:ba,kick:1}});c.follow=null;};
   if(section==='alex-bedroom'||section==='recording'){o.placePlayer({x:bp.x,z:bp.z,a:0,mode:'walk',bike:{x:bp.x+.8,z:bp.z,a:ba}});parkFoot(jamie,side(124,11),jb);parkFoot(sam,side(121,11),sb);
    C.flags.momTalk=true;C.flags.invited=true;enterRoom();if(section==='recording'){C.flags.phoneSeen=true;C.flags.phoneReady=true;S.queue.length=0;S.line=null;startPhone();C.recSel=4;C.heard=[0,1,2,3];drawScreen();}return;}
   C.flags.momTalk=true;C.flags.invited=true;mom.show(false);
   if(section==='neighbors'){o.placePlayer({x:bp.x,z:bp.z,a:0,mode:'walk',bike:{x:bp.x+.8,z:bp.z,a:ba}});parkFoot(jamie,side(124,11),jb);parkFoot(sam,side(121,11),sb);exitRoom();return;}
   // the end of Briarwood, by day, riding up to it
   C.flags.okafor=true;for(const kk of ['huang','okafor'])C.talked.add(kk);const q=side(226,1.2);o.placePlayer({x:q.x,z:q.z,a:k.ha(226),mode:'ride',speed:2});ride(jamie,side(221.5,-.6),k.ha(221.5));ride(sam,side(219.5,2.2),k.ha(219.5));
   go('d3-road');follow(true);objective('Find the old service road.','The end of Briarwood, past the last house.');return;}
  // The night.
  nightWorld();C.flags.met=true;S.flashOn=true;ch2.samBeam.on=true;o.setFlashlight?.(true,true);for(const kk in C.amb)C.amb[kk]=kk==='traffic'||kk==='life'?0:kk==='forest'?1:kk==='insects'?1:kk==='wind'?.8:0;
  if(section==='night-start'){nightStart();C.fadeIn=-1;S.flashOn=false;ch2.samBeam.on=false;o.setFlashlight?.(true,false);return;}
  const rideRoad=(s,t=0)=>{const q=Wd.at(s,t);o.placePlayer({x:q.x,z:q.z,a:q.a,mode:'ride',speed:3});const j=Wd.at(Math.max(0,s-3.4),.9),m=Wd.at(Math.max(0,s-5.8),-.9);comp.putRiding(jamie,j.x,j.z,j.a,3);comp.putRiding(sam,m.x,m.z,m.a,3);for(const c of [jamie,sam]){c.follow='ride';c.tight=1;}follow(true);};
  if(section==='c3-road-night'){const q=side(240,1.2),j=side(236,-.4),m=side(234.4,1.8);for(const kk in C.amb)C.amb[kk]=kk==='forest'||kk==='tunnel'||kk==='water'?0:1;o.placePlayer({x:q.x,z:q.z,a:k.ha(240),mode:'ride',speed:2.5});comp.putRiding(jamie,j.x,j.z,k.ha(236),2.5);comp.putRiding(sam,m.x,m.z,k.ha(234.4),2.5);
   for(const c of [jamie,sam])c.follow='ride';follow(true);go('n3-ride');T.value=.08;T?.set(.08);roadNight();return;}
  C.flags.roadNight=true;A.barLight=true;
  if(section==='c3-forest-deep'){C.flags.noHouses=true;BR.phase=-2;C.flags.glint=true;go('n3-road');date(NIGHT.road,'PM');objective('Follow the old road.');rideRoad(332,.2);T.value=.3;T?.set(.3);return;}
  C.flags.noHouses=true;C.flags.glint=true;C.flags.valley=true;BR.phase=-2;DR.phase=9;
  // at the outfall: bikes on the pad, all three on foot
  const pad=(c,a,b,face)=>{const q=Wd.fromA(a,b),bk=Wd.fromA(a+.4,b+1.4);return {q:{x:q.x,z:q.z},bike:{x:bk.x,z:bk.z,a:headingTo(bk.x,bk.z,WS.pad.x,WS.pad.z+6),kick:1},face};};
  const bikes={you:Wd.fromA(9.6,10.6),jamie:Wd.fromA(8.4,12.3),sam:Wd.fromA(11.4,8.9)},ba=headingTo(bikes.you.x,bikes.you.z,WS.pad.x,WS.pad.z+8);
  const parkAt=(c,b)=>({x:b.x,z:b.z,a:ba,kick:1});
  const footAt=(c,q,a)=>{comp.putFoot(c,q.x,q.z,a,{bike:parkAt(c,bikes[c.key])});c.follow=null;};
  const youFoot=(q,a)=>o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:{x:bikes.you.x,z:bikes.you.z,a:ba}});
  void pad;
  if(section==='c3-tunnel-entrance'){const q=Wd.fromA(10.6,7.6);youFoot(q,headingTo(q.x,q.z,DS.mouth.x,DS.mouth.z));footAt(jamie,Wd.fromA(9.2,6.2),headingTo(q.x,q.z,DS.mouth.x,DS.mouth.z));footAt(sam,Wd.fromA(11.8,9.4),headingTo(q.x,q.z,DS.mouth.x,DS.mouth.z));
   A.barLight=false;T.value=.26;T?.set(.26);C.flags.outfall=true;go('n3-outfall');date(NIGHT.outfall,'PM');C.lastEvent=C.t;objective('Enter the drain.');C.flags.canEnter=true;follow(true);return;}
  C.flags.outfall=true;C.flags.canEnter=true;A.barLight=false;date(NIGHT.inside,'PM');
  const inTunnel=(s,{j=3.6,m=-2.3}={})=>{const q=Dr.at(s,.1),a=q.a;youFoot({x:q.x,z:q.z},a);const jq=tq(s+j,.6),sq=tq(s+m,-.65);footAt(jamie,jq,a);footAt(sam,sq,a);C.flags.inside=true;C.flags.jamieToMouth=true;C.inAt=C.t;
   role(jamie,'lead');role(sam,'behind');for(const kk in C.amb)C.amb[kk]=kk==='tunnel'?1:kk==='water'?.6:0;};
  if(section==='c3-tunnel-inside'){inTunnel(98);go('n3-tunnel');T.value=.34;T?.set(.34);C.flags.deep=true;return;}
  C.flags.deep=true;
  if(section==='c3-evidence'){inTunnel(100.5);go('n3-tunnel');T.value=.36;T?.set(.36);return;}
  C.flags.prints=true;C.printsAt=C.t-20;
  if(section==='c3-first-bell'){inTunnel(127);go('n3-tunnel');C.flags.knock=true;T.value=.42;T?.set(.42);bellFar();return;}
  C.flags.knock=true;C.flags.bell1=true;C.bell1At=C.t-30;
  if(section==='c3-old-bike-tunnel'){inTunnel(158);go('n3-tunnel');T.value=.46;T?.set(.46);oldBikeSeen();return;}
  C.flags.oldBike=true;
  if(section==='c3-broken-bell'){const b=old.group.position;inTunnel(OB.s-2.6,{j:2.4,m:-1.6});const p=me();o.placePlayer({x:p.x,z:p.z,a:headingTo(p.x,p.z,b.x,b.z),mode:'walk',bike:{x:bikes.you.x,z:bikes.you.z,a:ba}});
   go('n3-bike');date(NIGHT.bike,'PM');T.value=.55;T?.set(.55);C.flags.canInspect=true;C.flags.inspected=true;C.flags.canBell=true;C.bellWait=0;objective('Try the bell.');hold(jamie,{look:{x:b.x,y:b.y+.7,z:b.z},until:C.t+20});hold(sam,{look:{x:b.x,y:b.y+.7,z:b.z},until:C.t+20});tryBell();return;}
  C.flags.inspected=true;C.flags.belled=true;C.flags.bell2=true;C.bellTries=2;
  const figureReady=()=>{FG.state='waiting';FG.s=DD.figure.s;FG.t=DD.figure.t;FG.v=0;FG.look=0;figure.group.visible=true;placeFigure(0);};
  if(section==='c3-figure'||section==='c3-figure-bend'){inTunnel(section==='c3-figure'?196.5:202.5);go('n3-deeper');date(NIGHT.bike,'PM');T.value=.6;T?.set(.6);figureReady();startFigure();
   if(section==='c3-figure-bend'){C.fig.seenT=1;figureSeen();FG.state='walk';FG.v=1.2;FG.s=DD.figure.s+.9;FG.t=-.6;placeFigure(0);}return;}
  C.flags.figure=true;C.flags.figGone=true;C.flags.search=true;C.searchAt=C.t-30;C.flags.wetSeen=true;C.flags.stone=true;C.wetDone=C.t-20;C.flags.cableSeen=true;cable.visible=true;wet.visible=true;C.wetT=30;
  if(section==='c3-voice-ahead'){inTunnel(258,{j:6.5,m:-1.6});go('n3-search');date(NIGHT.voice,'PM');T.value=.72;T?.set(.72);C.lastEvent=C.t-10;voiceAhead();return;}
  C.flags.voice1=true;C.voices=[{word:'jamie',pos:VA(),at:C.t-8,tunnel:true,where:'ahead'}];
  if(section==='c3-voice-behind'){inTunnel(258,{j:6.5,m:-1.6});go('n3-voice');date(NIGHT.voice,'PM');T.value=.86;T?.set(.86);C.waitV2=10;voiceBehind();return;}
  C.flags.voice2=true;C.voices.push({word:'guys',pos:VB(),at:C.t-2,tunnel:true,where:'behind'});
  if(section==='c3-close-bell'){inTunnel(258,{j:2.2,m:-1.2});go('n3-close');date(NIGHT.voice,'PM');T.value=.93;T?.set(.93);C.waitT=6.1;return;}
  C.flags.close=true;
  if(section==='c3-tunnel-escape'){inTunnel(256,{j:2,m:-1.2});date(NIGHT.voice,'PM');T.value=.98;T?.jolt(1,{hold:30});run();return;}
  C.flags.run=true;C.flags.out=true;o.setDrain?.(.14);
  if(section==='c3-bike-escape'){const pq=Wd.at(Wd.L-4,0);o.placePlayer({x:pq.x,z:pq.z,a:pq.a+Math.PI,mode:'ride',speed:0});
   const j=Wd.fromA(10.4,9.8),m=Wd.fromA(12.6,10.6);comp.putRiding(jamie,j.x,j.z,pq.a+Math.PI,0);comp.putRiding(sam,m.x,m.z,pq.a+Math.PI,0);for(const c of [jamie,sam]){c.follow='ride';c.tight=1;}
   placeOld(true);go('n3-out');T.value=.95;T?.jolt(1,{hold:20});C.flags.out=true;mounted();for(const kk in C.amb)C.amb[kk]=kk==='forest'?1:kk==='water'?1:kk==='insects'?1:0;return;}
  C.flags.flee=true;
  if(section==='chapter3-end'){const q=side(241,1),j=side(238.6,-1.2),m=side(237.4,2.1);o.placePlayer({x:q.x,z:q.z,a:k.ha(241)+Math.PI,mode:'ride',speed:0});comp.putRiding(jamie,j.x,j.z,k.ha(238)+Math.PI,0);comp.putRiding(sam,m.x,m.z,k.ha(237)+Math.PI,0);
   for(const c of [jamie,sam])c.follow='ride';follow(true);placeOld(true);go('n3-flee');T.value=.9;T?.set(.9);for(const kk in C.amb)C.amb[kk]=kk==='forest'||kk==='tunnel'||kk==='water'?0:1;safeNow();return;}}
 Object.assign(A3,{SECTIONS:SECTIONS3,ALIAS:ALIAS3,LABEL:LABEL3,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,jamieSweep,longThrow,officerAim:()=>null,
  canDismount:()=>!C.pose&&!C.inRoom&&!['c3-black','c3-night'].includes(S.phase),canRemount:()=>!C.inRoom&&drainS()<0&&!/^n3-(outfall|tunnel|evidence|bell|bike|deeper|figure|follow|search|voice|behind|close|run)$/.test(S.phase)});// (the bikes wait at the mouth until you run)
 Object.defineProperties(A3,{amb:{get:()=>C.amb},state:{get:()=>({phase:S.phase,flags:{...C.flags},inRoom:C.inRoom,recSel:C.recSel,recPlaying:C.recPlaying,heard:[...C.heard],talked:[...C.talked],amb:Object.fromEntries(Object.entries(C.amb).map(([a,b])=>[a,+b.toFixed(3)])),
   bells:(C.heardBells||[]).map(b=>({...b,pos:{x:+b.pos.x.toFixed(2),y:+b.pos.y.toFixed(2),z:+b.pos.z.toFixed(2)}})),voices:(C.voices||[]).map(v=>({word:v.word,at:v.at,tunnel:!!v.tunnel,where:v.where,dot:v.dotFromView,pos:{x:+v.pos.x.toFixed(2),z:+v.pos.z.toFixed(2)}})),
   oldBike:old.group.visible,oldFallen:!!C.oldFallen,evidence:evidence.visible,marks:marks.visible,phone:phone.visible,figure:{state:FG.state,visible:figure.group.visible,s:+FG.s.toFixed(2),seenAt:C.fig?.seenAt??null,t0:C.fig?.t0??null},
   tension:T?.state,pose:!!C.pose,lastEvent:C.lastEvent,t:C.t,roadS:+roadS().toFixed(1),drainS:+drainS().toFixed(1),shade:+C.shade.toFixed(3),splashes:C.splashes||0,roles:{...C.role}})}});
 Object.assign(A3,{old,evidence,marks,phone,figure,people:N,roomZone,RW,RECS,C,FG,placeOld});
 Object.defineProperty(A3,'glimpseBike',{get:()=>null});
 return A3;
}
