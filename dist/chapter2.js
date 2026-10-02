// Chapter Two: what did Alex hear? It begins seconds after Chapter One, at the creek, and ends the
// next morning at the corner where Alex turned onto Briarwood.
//
//  Night:   the boys decide to go a little farther; through the gap in the back fence into the
//           drainage easement; a tire mark, flattened weeds, a scrape; Alex's green bicycle beside the
//           big culvert, its rear reflector broken off; the bell again, twice, from inside the culvert,
//           away from the bike; flashlights behind them, the police; the bike reported; Alex's dad;
//           sent home. Jamie: "Oak. Tomorrow morning."
//  Morning: August 22. Bright, ordinary, full of searchers and flyers. The oak; the old bike that is
//           not there (and maybe never was); "What if he heard the bell?"; back to Briarwood, where
//           remembering Alex leaving shows him stop and look toward the creek. "He heard it before he
//           left." The end of the chapter.
//
// chapter1.js keeps running the shared systems (dialogue, objectives, cast, cars, companions,
// flashlights, checkpoints) and hands its phases to this file once they start with c2- or m-.
// Nothing here explains the bell, Alex, or the old bike.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {LOOKOUT,EASEMENT} from './layout.js';
import {smooth} from './kit.js';
import {createActor,ADULTS,headingTo,wrap} from './people.js';
import {createBike,poseBike} from './rig.js';
import {CAST} from './cast.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
// QA jumps (and the sections Continue can return to). Checkpoint names from the brief are aliases.
export const SECTIONS2=['chapter2-start','easement','alex-bike','second-bell','police-find','morning','morning-oak','memory-start','memory-reconstruction','chapter2-end'];
const ALIAS={'bike-found':'alex-bike','police-arrival':'police-find','briarwood-memory':'memory-start'};
const LABEL={'chapter2-start':'Behind the creek','bike-found':'Alex’s bike','police-arrival':'The police','morning':'The next morning','morning-oak':'The oak, morning','briarwood-memory':'Where Alex turned','chapter2-end':'Briarwood, morning'};
const NIGHT_TIME={start:'9:34',bike:'9:41',police:'9:46',home:'10:05'},MORNING_TIME={home:'8:52',oak:'9:01',corner:'9:12'};

export function createChapter2(o,k){
 const {scene,world,nav,camera,friends,ambient,ending,$}=o,{S,comp,jamie,sam,police,carA,carB,officer,officer2,dad}=k,F=world.easement,SP=F.spots,roam=o.roam;
 const B=nav.frame,side=k.side,main=k.main,dist=k.dist,me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go;
 // How dark it is (lighting reads this): deep night now, none at all in the morning.
 for(const [p,v] of Object.entries({'c2-black':.84,'c2-decide':.84,'c2-follow':.84,'c2-easement':.86,'c2-bike':.86,'c2-bell':.86,'c2-police':.86,'c2-search':.86,'c2-home':.86,'c2-dawn':.86,'m-home':0,'m-oak':0,'m-briarwood':0,'m-memory':0,'m-after':0,'m-end':0}))k.DEEP[p]=v;
 const A=k.api;
 const W2=(s,t)=>{const p=F.world(s,t);return {x:p.x,z:p.z,y:F.height(s,t)};};
 const date=(day,t,ampm)=>o.setDate(`AUGUST ${day}, 2011 <i></i> ${t} ${ampm}`);
 // ---- Alex's bicycle, where it ended up ------------------------------------------------------------
 // Built from Alex's own bike in the cast (frame, colour, proportions, rack, bell, grips, tyres), with
 // the lens of its rear reflector broken out of the clip: the piece found at the creek.
 const bikeSpec={...CAST.alex.bike,extras:CAST.alex.bike.extras.map(e=>e==='rear-reflector'?'rear-reflector-broken':e)};
 const found=createBike(bikeSpec);found.group.name='alex-bike-found';scene.add(found.group);found.group.visible=false;
 {const mud=new THREE.MeshStandardMaterial({color:0x4a3f2e,roughness:1}),g=found.group;
  // Mud on both tyres, dirt along the down tube and chain stay, a scuff on the pedal.
  for(const [x,y,z,s] of [[.03,.12,-.36,.07],[-.02,.18,-.42,.05],[.02,.12,.42,.08],[-.03,.2,.48,.05],[.04,.36,.05,.04],[-.04,.3,-.1,.035],[.05,.24,.2,.03]]){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),mud);m.position.set(x,y,z);m.scale.set(.5,1,1.4);g.add(m);}
  g.traverse(m=>{if(m.isMesh)m.castShadow=false;});}
 const bikeAt=(()=>{const p=SP.bike,a=F.heading+.32;return {x:p.x,z:p.z,y:p.y,a};})();
 function placeFound(){const g=found.group,p=bikeAt;g.position.set(p.x,nav.groundY(p.x,p.z)+.03,p.z);
  // On its side in the grass at the top of the bank, the bars turned a little, resting on its
  // pedal and the end of the handlebar the way a dropped bike does.
  g.rotation.set(0,-p.a,1.3,'YXZ');found.steerAngle=.42;found.crankAngle=2.1;found.wheel=.8;found.kickstand=0;poseBike(found);
  g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);g.position.y+=nav.groundY(p.x,p.z)+.01-box.min.y;g.updateMatrixWorld(true);
  // What people walk round: the frame from wheel to wheel, not just a point.
  foundParts.length=0;for(const z of [-.55,0,.55]){const q=new THREE.Vector3(0,.3,z).applyMatrix4(g.matrixWorld);foundParts.push({x:q.x,z:q.z,r:.48,speed:0});}}
 const foundParts=[];
 placeFound();
 // Where the inspection looks: the broken reflector mount (world position, updated on demand).
 const mountWorld=new THREE.Vector3();function mountPoint(){found.group.updateMatrixWorld(true);return mountWorld.set(0,.86,.68).applyMatrix4(found.group.matrixWorld);}
 // ---- tape round the bike (once the police are there) ------------------------------------------------
 const tape=new THREE.Group();tape.name='evidence-tape';scene.add(tape);tape.visible=false;
 {const yel=new THREE.MeshStandardMaterial({color:0xe2c23a,roughness:.7,side:THREE.DoubleSide}),stake=new THREE.MeshStandardMaterial({color:0x6a5a44,roughness:1});
  const corners=[[28.3,-6.1],[32.5,-6.3],[32.4,-2.85],[28.4,-2.8]].map(([s,t])=>W2(s,t));// round the bike, across the end of the path
  for(const c of corners){const m=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.1,6),stake);m.position.set(c.x,c.y+.55,c.z);tape.add(m);}
  for(let i=0;i<corners.length;i++){const a=corners[i],b=corners[(i+1)%corners.length],len=Math.hypot(b.x-a.x,b.z-a.z),m=new THREE.Mesh(new THREE.PlaneGeometry(len,.07),yel);
   m.position.set((a.x+b.x)/2,(a.y+b.y)/2+.95,(a.z+b.z)/2);m.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);tape.add(m);}}
 // ---- more people out searching ------------------------------------------------------------------------
 const vol=['vol1','vol2','vol3','vol4','vol5'].map((key,i)=>createActor(scene,nav,ADULTS[key],{seed:11+i}));
 const extra=[...vol];
 // Flashlights for Sam, the second officer and the night searchers: a visible cone each (Jamie's,
 // the officer's and yours are the real lights).
 const beams=[];function beamFor(who,hand,len=6,r=.9){const b=k.makeBeam(len,r),t=new THREE.Mesh(new THREE.CylinderGeometry(.018,.016,.15,8),k.torch.material);t.rotation.x=Math.PI/2;t.position.set(0,.05,-.02);t.visible=false;hand.add(t);const e={who,beam:b,torch:t,on:false,aim:new THREE.Vector3(),ready:false};beams.push(e);return e;}
 const samBeam=beamFor(sam,sam.person.parts.rhand,5,.75),offBeam=beamFor(officer,officer.person.parts.rhand,7,1.1),volBeams=[vol[0],vol[1]].map(v=>beamFor(v,v.person.parts.rhand,6.5,1));
 // ---- flyers on the poles, the morning after ----------------------------------------------------------
 const flyers=new THREE.Group();flyers.name='missing-flyers';scene.add(flyers);flyers.visible=false;
 {const tex=(()=>{try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=170;c.height=220;
   g.fillStyle='#f4f1e8';g.fillRect(0,0,170,220);g.fillStyle='#161616';g.font='bold 34px Arial';g.textAlign='center';g.fillText('MISSING',85,40);
   g.fillStyle='#8f8b84';g.fillRect(45,52,80,92);g.fillStyle='#c9c4ba';g.beginPath();g.arc(85,88,20,0,7);g.fill();g.fillRect(58,112,54,32);
   g.fillStyle='#202020';g.font='bold 20px Arial';g.fillText('ALEX, 12',85,168);g.font='11px Arial';g.fillText('Last seen Sun. Aug 21, about 8 PM',85,186);g.fillText('Oak Hollow Dr & Briarwood Ln',85,199);g.fillText('Green bicycle. Please call.',85,212);
   const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})();
  const paper=new THREE.MeshStandardMaterial({color:0xf2efe6,map:tex,roughness:.92,side:THREE.DoubleSide});
  const poles=(world.poles||[]).filter(p=>(p.frame===world.MAIN||p.frame?.id==='main'||!p.frame?.junction)&&p.u>555&&p.u<760).slice(0,5);
  for(const p of [...poles,...(world.poles||[]).filter(p=>p.frame===B&&p.u<70).slice(0,2)]){const toward=p.frame===B?B.point(p.u,0):groundPoint(p.u,0),a=Math.atan2(toward.x-p.x,toward.z-p.z);
   const m=new THREE.Mesh(new THREE.PlaneGeometry(.28,.36),paper);m.position.set(p.x+Math.sin(a)*.16,p.y+1.55,p.z+Math.cos(a)*.16);m.rotation.y=a;flyers.add(m);}
  // One taped to the lookout's fence post, by the oak.
  {const q=groundPoint(LOOKOUT.fenceD-.6,-3.2),m=new THREE.Mesh(new THREE.PlaneGeometry(.28,.36),paper);m.position.set(q.x,world.groundY(LOOKOUT.fenceD-.6,-3.2)+.95,q.z);m.rotation.y=-heading(LOOKOUT.fenceD)+Math.PI;flyers.add(m);}}
 // ---- state --------------------------------------------------------------------------------------------
 const C={};
 function fresh(){Object.assign(C,{t:0,pt:0,flags:{},card:-1,fadeIn:-1,dawn:-1,endT:-1,memory:null,bellAt:-1,poi:null,lastS:0,lingerT:0,warned:0});}
 fresh();
 const api={SECTIONS:SECTIONS2,day:0,get state(){return {phase:S.phase,flags:{...C.flags},foundVisible:found.group.visible,tape:tape.visible,flyers:flyers.visible,day:api.day,bellAt:C.bellAt,memory:C.memory,
  searchers:extra.filter(a=>a.visible).length,beams:beams.filter(b=>b.on).length};}};
 const owns=ph=>typeof ph==='string'&&(ph.startsWith('c2-')||ph.startsWith('m-'));
 function card(on,{eyebrow='',title='Chapter Two'}={}){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2');if(e)e.textContent=eyebrow;if(h)h.textContent=title;el.classList.add('on');}else el.classList.remove('on');C.cardOn=on;}
 const checkpoint=id=>k.checkpointTo(id,LABEL[id]);
 // Continue knows these from the start (after a reload too), not only once they have been reached.
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL);
 const where=(p=me())=>nav.locate(p.x,p.z);
 const inEase=()=>{const L=where();return L.street==='easement'?L:null;};
 // ---- the companions' flashlights and the points that catch their eye --------------------------------
 // Points of interest in the easement: who stops there, where they stand, what they look at.
 const POI={mud:{who:'jamie',spot:SP.mud,stand:1.1,time:3.2},weeds:{who:'sam',spot:SP.weeds,stand:1,time:2.6},scrape:{who:'jamie',spot:SP.scrape,stand:1.2,time:2.4}};
 S.poiFor=c=>{if(!owns(S.phase)||S.phase!=='c2-easement')return null;const p=me();for(const [id,q] of Object.entries(POI)){if(q.who!==c.key||C.flags['poi-'+id])continue;
   const sp=q.spot,d=Math.hypot(p.x-sp.x,p.z-sp.z);if(d<7.5)return {id,x:sp.x,z:sp.z,y:sp.y,stand:q.stand,time:q.time,done:()=>{C.flags['poi-'+id]=true;}};}return null;};
 function jamieSweep(t){// ahead along the corridor from wherever Jamie is, a little side to side
  const L=nav.locate(jamie.px,jamie.pz),s=L.street==='easement'?L.s:0,ahead=s+5+2*Math.sin(t*.4),tt=F.channelT(ahead)+Math.sin(t*.7)*3-1;return W2(clamp(ahead,1,33),tt);}
 function updateBeams(dt){for(const e of beams){const vis=e.on&&e.who.person.group.visible&&(e.who.active===undefined?e.who.visible:e.who.active);e.torch.visible=vis;e.beam.visible=vis;if(!vis)continue;
   const hand=e.who.person.parts.rhand.getWorldPosition(new THREE.Vector3());let target=e.target?.();if(!target){const a=(e.who.a??e.who.pa??0)+Math.sin(C.t*.6+beams.indexOf(e))*.5;target={x:hand.x+Math.sin(a)*5,y:hand.y-1.4,z:hand.z-Math.cos(a)*5};}
   const aim=new THREE.Vector3(target.x,(target.y??nav.groundY(target.x,target.z))+.05,target.z);if(!e.ready){e.aim.copy(aim);e.ready=true;}else e.aim.lerp(aim,1-Math.exp(-3*dt));
   e.beam.position.copy(hand);e.beam.lookAt(e.aim);e.beam.material.uniforms.uA.value=.028;}}
 samBeam.target=()=>S.samAim||(C.flags.bell?SP.mouth:null)||W2(clamp((nav.locate(sam.px,sam.pz).s||0)+4,1,33),F.channelT(16)+2*Math.sin(C.t*.5));
 offBeam.target=()=>C.flags.reported?found.group.position:null;
 volBeams.forEach((e,i)=>{e.target=()=>W2(10+i*9+4*Math.sin(C.t*.3+i),F.pathT(12)+(i?4:-2));});
 // ---- the night, picking up seconds later ------------------------------------------------------------
 function standAtCreek(){const c=k.clue.position,g=SP.gap,a=headingTo(c.x,c.z,g.x,g.z),q={x:c.x-Math.sin(a)*.9,z:c.z+Math.cos(a)*.9};
  o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:{x:roam.x,z:roam.z,a:roam.a}});}
 function nightSet(){k.nightWorld();found.group.visible=true;placeFound();friends.list[2].bike.group.visible=false;api.day=A.day=0;A.night=1;}
 function begin(){fresh();go('c2-black');C.pt=0;nightSet();roam.walkLock=false;S.pose=null;o.fade(1);S.lookTarget=null;S.jamieAim=null;
  standAtCreek();jamie.lookAt=SP.gap;sam.lookAt=SP.gap;S.flashOn=true;date(21,NIGHT_TIME.start,'PM');objective('');
  talk([{wait:3.2},{who:'JAMIE',text:'“You guys heard that too, right?”',from:jamie,gap:.9},{who:'SAM',text:'“Yeah.”',from:sam,time:1.8,gap:1.6}],{interrupt:true,then:()=>{C.fadeIn=0;}});}
 function decide(){go('c2-decide');checkpoint('chapter2-start');jamie.lookAt=null;sam.lookAt=null;
  for(const c of [jamie,sam])if(c.active&&c.mode==='foot'){c.follow='walk';}
  talk([{who:'SAM',text:'“We should go get the cops.”',from:sam},
   {who:'JAMIE',text:'“And tell them what? We heard a bike bell?”',from:jamie},
   {who:'YOU',text:'“His reflector’s here.”',time:2.3},
   {who:'JAMIE',text:'“Just a little farther.”',from:jamie,time:2.2,gap:.8},
   {who:'SAM',text:'“…Fine. Stay together.”',from:sam,time:2.4}],{then:()=>{go('c2-follow');objective('Follow the sound.');samBeam.on=true;for(const c of [jamie,sam])c.follow='search';}});}
 // ---- the bike, the bell, the police --------------------------------------------------------------------
 function discover(){if(C.flags.found)return;C.flags.found=true;go('c2-bike');checkpoint('bike-found');date(21,NIGHT_TIME.bike,'PM');S.jamieAim=found.group.position;S.samAim=found.group.position;
  for(const c of [jamie,sam])c.lookAt=found.group.position;objective('Look at the bicycle.');C.discT=0;
  talk([{who:'JAMIE',text:'“Guys.”',from:jamie,time:1.8,gap:1.2}],{interrupt:true});}
 function inspect(){if(C.flags.inspected)return;C.flags.inspected=true;go('c2-bell');objective('');const p=me(),m=mountPoint();S.jamieAim=m.clone();S.samAim=m.clone();const a=headingTo(p.x,p.z,m.x,m.z),back={x:m.x-Math.sin(a)*.62,z:m.z+Math.cos(a)*.62};
  if(p.walking){roam.walkLock=true;const gy=nav.groundY(back.x,back.z);k.setPose({w:0,x:back.x,y:gy+.74,z:back.z,yaw:a,pitch:-.62,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:gy+.74});}
  talk([{wait:1.1},{who:'YOU',text:'“That’s his bike.”',time:2.4,gap:.7},
   {who:'JAMIE',text:'“The back reflector’s broken off.”',from:jamie,time:2.8},
   {who:'SAM',text:'“Where is he?”',from:sam,time:2,gap:.9},
   {who:'JAMIE',text:'“Alex?”',from:jamie,time:1.6,act:()=>{S.jamieAim=SP.mouth;jamie.lookAt=SP.mouth;}},
   {wait:3.8},{act:secondBell,wait:3.1},
   {who:'SAM',text:'“Nope.”',from:sam,time:1.6,gap:.6},
   {who:'JAMIE',text:'“That wasn’t his bike.”',from:jamie,time:2.3},
   {wait:4.2},{act:searchersComing,wait:.1}]);}
 function secondBell(){C.bellAt=C.t;C.flags.bell=true;const b=SP.bell;o.audio()?.bell({x:b.x,y:b.y,z:b.z},1.5,{tunnel:true});
  // Everyone freezes and turns to it; the lights snap round; Sam steps in closer.
  S.lookTarget=SP.mouth;S.jamieAim=SP.mouth;S.samAim=SP.mouth;for(const c of [jamie,sam]){c.lookAt=SP.mouth;c.follow=null;}
  const p=me(),side={x:p.x+Math.cos(p.a)*.9-Math.sin(p.a)*.4,z:p.z+Math.sin(p.a)*.9+Math.cos(p.a)*.4};if(sam.mode==='foot'&&nav.walkable(side.x,side.z))comp.run(sam,[comp.steps.walkTo(sam,[[side.x,side.z]],{speed:1.1}),comp.steps.idle(sam,.4)],{then:()=>{sam.lookAt=SP.mouth;}});}
 function searchersComing(){go('c2-police');checkpoint('police-arrival');date(21,NIGHT_TIME.police,'PM');S.pose&&(S.pose.release=true);
  const g=SP.gap,start=W2(-1.2,.2);officer2.show(true);officer2.place(start.x,start.z,F.heading);officer2.gest('flashlight');officer2.lookAt=null;
  o.audio()&&o.sfx('squelch',{x:g.x,y:g.y+1.5,z:g.z});C.callAt=C.t+1.1;C.copT=0;}
 function copApproach(){const p=me(),obs=k.blockers(true).filter(b=>Math.hypot(b.x-officer2.x,b.z-officer2.z)>.1),q=k.conversationalSpot(officer2,p,2.6),path=nav.walkPath(officer2,q,obs);
  officer2.walk(path.length?path:[[q.x,q.z]],{speed:1.45,then:a=>{a.faceTo(me().x,me().z);a.lookAt=camera.position;a.gest(null);C.flags.copThere=true;}});}
 function tell(){C.flags.told=true;S.lookTarget=null;
  talk([{who:'YOU',text:'“It’s Alex’s.”',time:1.9},{who:'OFFICER',text:'“What?”',from:officer2,time:1.4},{who:'JAMIE',text:'“His bike.”',from:jamie,time:1.6,gap:.9,act:()=>{officer2.lookAt=found.group.position;}},
   {act:()=>{const b=found.group.position,p=me(),a=headingTo(b.x,b.z,p.x,p.z),q={x:b.x+Math.sin(a)*1.6,z:b.z-Math.cos(a)*1.6};officer2.gest('flashlight');officer2.walk([[q.x,q.z]],{speed:1.2,then:a=>{a.faceTo(b.x,b.z);a.lookAt=b;}});C.flags.reported=true;},wait:3},
   {who:'OFFICER',text:'“Dispatch, I’ve got a green bicycle in the drainage easement behind Briarwood. I need units back here.”',from:officer2,time:5.4,act:()=>{officer2.gest('radio');o.sfx('squelch',officer2.pos);}},
   {who:'RADIO',text:'“…copy. Units en route.”',time:2.4,act:()=>o.sfx('squelch',officer2.pos)},
   {who:'OFFICER',text:'“Okay. Back up. Over there by the path. Don’t touch anything.”',from:officer2,time:3.6,act:()=>{officer2.gest('flashlight');officer2.faceTo(me().x,me().z);officer2.lookAt=camera.position;}}],
   {then:()=>{go('c2-search');objective('Step back for the police.');stepBack();arrivals();}});}
 function stepBack(){const spot=(s,t)=>W2(s,t);const js=spot(24.4,F.pathT(24.4)+.4),ss=spot(23.6,F.pathT(23.6)-.5);S.jamieAim=null;S.samAim=null;
  for(const [c,q] of [[jamie,js],[sam,ss]])if(c.mode==='foot'){const path=nav.walkPath({x:c.px,z:c.pz},q);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[q.x,q.z]],{speed:1.1}),comp.steps.turnTo(c,()=>headingTo(c.px,c.pz,found.group.position.x,found.group.position.z),.6)],{then:()=>{c.lookAt=found.group.position;}});}}
 function arrivals(){C.arrive=C.t;tape.visible=true;
  // The second officer and two neighbors who were already out looking, with their lights; then Alex's dad.
  const enter=(a,s,t,gest,to)=>{const st=W2(-1.4,0);a.show(true);a.place(st.x,st.z,F.heading);a.gest(gest);const q=W2(s,t),path=nav.walkPath(a,q);a.walk(path.length?path:[[q.x,q.z]],{speed:1.35,then:x=>{x.faceTo(found.group.position.x,found.group.position.z);if(to)to(x);}});};
  setTimeout0(2.5,()=>{enter(officer,29,-4.6,'flashlight');offBeam.on=true;});
  setTimeout0(6,()=>{enter(vol[0],14,F.pathT(14)+.2,'flashlight',x=>loopSearch(x,[[10,-5.6],[20,-6.1],[13,-4.9]]));volBeams[0].on=true;});
  setTimeout0(8.5,()=>{enter(vol[1],19,F.pathT(19)+1.4,'flashlight',x=>loopSearch(x,[[22,-1.8],[16,-2.4],[24,-2]]));volBeams[1].on=true;});
  setTimeout0(13,()=>{dad.show(true);const st=W2(-1.4,.3);dad.place(st.x,st.z,F.heading);dad.gest(null);dad.lookAt=found.group.position;const q=W2(26.2,F.pathT(26.2)+1.2),path=nav.walkPath(dad,q);
   dad.walk(path.length?path:[[q.x,q.z]],{speed:1.75,then:a=>{a.faceTo(found.group.position.x,found.group.position.z);C.flags.dadThere=true;}});
   // The officer steps across to meet him.
   const m=W2(27.4,F.pathT(27.4)+2.2),pp=nav.walkPath(officer2,m);officer2.walk(pp.length?pp:[[m.x,m.z]],{speed:1.3,then:a=>{a.faceTo(dad.x,dad.z);a.lookAt=dad.pos;}});});}
 function loopSearch(a,pts){const ws=pts.map(([s,t])=>W2(s,t)).map(q=>[q.x,q.z]);let i=0;const next=()=>{i=(i+1)%ws.length;a.walk([ws[i]],{speed:.7,then:()=>{a.t=0;setTimeout0(1.5+Math.random(),next);}});};next();}
 // Small timers on the chapter clock (cleared by reset and jumps).
 let timers=[];function setTimeout0(sec,fn){timers.push({at:C.t+sec,fn});}
 function dadScene(){C.flags.dadTalk=true;
  talk([{who:'ALEX’S DAD',text:'“That’s his bike. That’s Alex’s bike.”',from:dad,act:()=>dad.gest('head')},
   {who:'ALEX’S DAD',text:'“Was he here? Is he—”',from:dad,time:2.4},
   {who:'OFFICER',text:'“We don’t know yet. I need you to stay back, sir.”',from:officer2,gap:1.2},
   {who:'SAM',text:'“We heard a bell. In there.”',from:sam,time:2.4,act:()=>{sam.lookAt=officer2.pos;}},
   {who:'OFFICER',text:'“Okay.”',from:officer2,time:1.6,gap:1.6,act:()=>{officer2.lookAt=found.group.position;}},
   {who:'OFFICER',text:'“You three need to go home. Right now. Somebody will talk to your parents in the morning.”',from:officer2,time:5,act:()=>{officer2.faceTo(me().x,me().z);officer2.lookAt=camera.position;}}],
   {then:sentHome});}
 function sentHome(){go('c2-home');objective('Go home.');date(21,NIGHT_TIME.home,'PM');S.lookTarget=null;C.homeFrom={...me()};
  for(const c of [jamie,sam])if(c.mode==='foot'){c.script=null;c.follow='walk';c.lookAt=null;}
  setTimeout0(5,()=>talk([{who:'JAMIE',text:'“Oak. Tomorrow morning.”',from:jamie,time:2.2,gap:.6},{who:'SAM',text:'“Seriously?”',from:sam,time:1.6,gap:.6},{who:'JAMIE',text:'“Nine.”',from:jamie,time:1.6}],{then:()=>{C.flags.plan=true;}}));}
 // ---- the morning ---------------------------------------------------------------------------------------
 const homeHouse=(()=>{const homes=Object.values(world.homes);return world.houses.filter(h=>h.frameId==='main'&&h.side<0&&!homes.includes(h)&&h.drivD).sort((a,b)=>Math.abs(a.dc-455)-Math.abs(b.dc-455))[0];})();
 function morningWorld(){api.day=A.day=1;A.night=0;S.deep=A.deep=0;o.nightRendering?.(false);ambient.night?.(false);ambient.morning?.(true);world.doors.alex?.set(0);world.alexWindow.emissiveIntensity=.06;
  found.group.visible=false;tape.visible=false;flyers.visible=true;k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;S.flashOn=false;k.torch.visible=false;for(const e of beams)e.on=false;
  for(const a of [...k.adults,...extra]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  // Police by the Briarwood corner and at Alex's house, no lights in daylight; people out looking.
  police.reset?.();carA.show(true);{const p=side(17,-2.3);carA.park(p.x,p.z,k.ha(17)+Math.PI);}carA.lights=false;carA.headlights=false;carA.siren=false;
  carB.show(true);{const p=side(133.8,3.05);carB.park(p.x,p.z,k.ha(133.8));}carB.lights=false;carB.headlights=false;
  const put=(a,q,face,gest=null)=>{a.show(true);a.place(q.x,q.z,face);a.gest(gest);return a;};
  put(officer,side(19.5,-5.4),k.ha(19.5)-Math.PI/2,'radio');
  // Someone pinning the last flyer to a pole along Oak Hollow.
  {const f0=flyers.children[0],L=nav.locate(f0.position.x,f0.position.z),q=main(L.d+.45,L.lat+.7);put(vol[2],q,headingTo(q.x,q.z,f0.position.x,f0.position.z),'point');}
  {const a=put(vol[0],main(650,7.1),heading(650)),b=put(vol[1],main(651.4,7.5),heading(651.4));pairWalk(a,b,[[650,7.1],[752,7.1]],[[651.4,7.6],[753.4,7.6]]);}
  put(vol[3],main(706,-15.2),heading(706)-Math.PI/2+.6,'talk');put(k.neighbor,main(707.6,-14.6),heading(707.6)+Math.PI/2-.4,'fold');
  put(vol[4],main(520,10.8),heading(520)+Math.PI/2+Math.PI,'fold');
  {const a=put(officer2,main(668,-11),heading(668)-Math.PI/2);yardCheck(a,[[668,-11],[668.5,-19],[672,-24],[668,-11]]);}
  // Jamie and Sam already at the oak, bikes beside them.
  comp.reset();const jb=main(1145.6,6.8),js=main(1146.6,5.2),sb=main(1143.6,3.4);comp.putFoot(jamie,js.x,js.z,heading(1146)+Math.PI*.8,{bike:{x:jb.x,z:jb.z,a:heading(1145.6)+Math.PI,kick:1}});
  comp.putRiding(sam,sb.x,sb.z,heading(1143.6)+Math.PI*.92,0);jamie.follow=null;sam.follow=null;
  friends.list[2].bike.group.visible=false;ending.otherBike&&(ending.otherBike.visible=false);}
 function pairWalk(a,b,pa,pb){let dir=0;const go1=()=>{dir^=1;const ta=pa[dir],tb=pb[dir];const p1=main(...ta),p2=main(...tb);a.walk([[p1.x,p1.z]],{speed:.95,then:()=>setTimeout0(2,go1)});b.walk([[p2.x,p2.z]],{speed:.95});};go1();}
 function yardCheck(a,pts){let i=0;const next=()=>{i=(i+1)%pts.length;const q=main(...pts[i]);a.walk([[q.x,q.z]],{speed:.8,then:()=>setTimeout0(3,next)});};next();}
 function wakeUp(){go('m-home');C.pt=0;morningWorld();const h=homeHouse,q=main(h.drivD-.4,h.side*10.2),b=main(h.drivD+.5,h.side*9.4),look=main(h.drivD+14,h.side*2),road=main(h.drivD+.5,0);
  o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,look.x,look.z),mode:'walk',bike:{x:b.x,z:b.z,a:headingTo(b.x,b.z,road.x,road.z)}});
  date(22,MORNING_TIME.home,'AM');objective('Meet Jamie and Sam at the oak.');checkpoint('morning');C.fadeIn=0;
  talk([{wait:5.5},{who:'',text:'Everything looked exactly the same.',time:4.6}]);}
 function oakTalk(){C.flags.oakTalk=true;checkpoint('morning-oak');date(22,MORNING_TIME.oak,'AM');jamie.lookPlayer=true;sam.lookPlayer=true;const old=oldBikeSpot();
  talk([{who:'SAM',text:'“My mom almost didn’t let me out.”',from:sam,gap:.9},
   {who:'JAMIE',text:'“Wasn’t there an old bike here last night?”',from:jamie,act:()=>{jamie.lookAt=old;S.lookTarget=old;}},
   {who:'SAM',text:'“What old bike?”',from:sam,time:1.8},
   {who:'YOU',text:'“There was one right there.”',time:2.4},
   {who:'SAM',text:'“No there wasn’t.”',from:sam,time:2},
   {who:'JAMIE',text:'“I… think there was.”',from:jamie,time:2.6,gap:2,act:()=>{sam.lookAt=old;}},
   {who:'SAM',text:'“Why would Alex even go back there?”',from:sam,act:()=>{S.lookTarget=null;jamie.lookAt=null;sam.lookAt=null;}},
   {who:'JAMIE',text:'“On the hill. Before he left. ‘Did you guys hear that?’”',from:jamie,time:3.4},
   {who:'SAM',text:'“So?”',from:sam,time:1.4},
   {who:'JAMIE',text:'“What if he heard the bell?”',from:jamie,time:2.6,gap:2.6},
   {who:'JAMIE',text:'“Come on. Briarwood. Where he turned.”',from:jamie}],
   {then:()=>{go('m-briarwood');objective('Return to Briarwood.');jamie.lookPlayer=false;sam.lookPlayer=false;
    // Back on their bikes and along with you.
    if(jamie.mode==='foot'){const jb={x:jamie.bx-Math.cos(jamie.ba)*.43,z:jamie.bz-Math.sin(jamie.ba)*.43};comp.run(jamie,[comp.steps.walkTo(jamie,[[jb.x,jb.z]],{speed:1.2}),comp.steps.turnTo(jamie,()=>jamie.ba,.5),comp.steps.act(()=>{jamie.kick=0;}),comp.steps.mount(jamie)],{then:()=>{jamie.follow='ride';}});}
    sam.follow='ride';}});}
 function oldBikeSpot(){const p=ending.otherBike?.position||groundPoint(LOOKOUT.oak.d+.9,LOOKOUT.oak.lat-1.9);return {x:p.x,y:p.y+.2,z:p.z};}
 // The corner where Alex turned (the memory is recalled from here, looking down Briarwood).
 const corner={at:main(597,2.6),look:side(40,1)};
 function atCorner(p=me()){const L=where(p);return (L.street==='main'&&Math.abs(L.d-597)<10&&L.lat>-4&&L.lat<9)||(L.street==='side'&&L.u<30);}
 function remember(){if(C.memory)return;const ok=o.memory?.start('alex-turns');if(ok){C.memory='playing';go('m-memory');objective('');checkpoint('briarwood-memory');}}
 function memoryDone(){C.memory='done';go('m-after');checkpoint('chapter2-end');date(22,MORNING_TIME.corner,'AM');
  for(const c of [jamie,sam])c.lookPlayer=true;
  talk([{wait:1.4},{who:'YOU',text:'“Sam was right.”',time:2},{who:'JAMIE',text:'“He stopped.”',from:jamie,time:1.8},
   {who:'YOU',text:'“He was looking toward the creek.”',time:2.6,gap:1.4},
   {who:'JAMIE',text:'“And earlier he asked if we heard something.”',from:jamie,gap:2.4},
   {who:'JAMIE',text:'“He heard it before he left.”',from:jamie,time:3,gap:1,act:()=>{for(const c of [jamie,sam])c.lookPlayer=false;}},
   {act:()=>{S.lookTarget=corner.look;for(const c of [jamie,sam])c.lookAt=corner.look;},wait:5.2},
   {act:()=>{C.endT=0;},wait:.1}]);}
 // ---- every frame (called by chapter1.js for the phases it hands over) ---------------------------------
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase,p=me();
  for(let i=timers.length-1;i>=0;i--)if(C.t>=timers[i].at){const f=timers[i].fn;timers.splice(i,1);f();}
  for(const a of extra)a.update(dt,{eye:camera.position});updateBeams(dt);
  if(ph==='c2-black'){if(C.pt>.8&&C.card<0){C.card=0;card(true);}if(C.card>=0){C.card+=dt;if(C.card>4.3&&C.cardOn)card(false);}
   if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/2.6));if(C.fadeIn>=2.6){o.fade(0);decide();}}}
  else if(ph==='c2-follow'){const L=inEase();if(L&&L.s>1.4){go('c2-easement');objective('Search beyond the fence.');}else{C.lingerT+=dt;if(C.lingerT>24&&!C.flags.nudge&&!busy()){C.flags.nudge=true;talk([{who:'JAMIE',text:'“Through the fence. Come on.”',from:jamie,time:2.2}]);}}}
  if(ph==='c2-easement'){const L=inEase();if(L&&L.s>6&&!C.flags.path){C.flags.path=true;objective('Check the drainage path.');}
   // What they notice on the way (said once each, only when nobody is talking).
   const near=(q,r)=>Math.hypot(p.x-q.x,p.z-q.z)<r;
   if(!C.flags.saidMud&&near(SP.mud,3.4)&&!busy()){C.flags.saidMud=true;S.jamieAim=SP.mud;talk([{who:'JAMIE',text:'“Look. A tire.”',from:jamie,time:2.2},{who:'YOU',text:'“A bike.”',time:1.6}],{then:()=>{S.jamieAim=null;}});}
   if(!C.flags.saidWeeds&&near(SP.weeds,3.2)&&!busy()){C.flags.saidWeeds=true;S.samAim=SP.weeds;talk([{who:'SAM',text:'“Something went through here.”',from:sam,time:2.6}],{then:()=>{S.samAim=null;}});}
   if(!C.flags.scraped&&near(SP.scrape,3.6)){C.flags.scraped=true;S.jamieAim=SP.scrape;setTimeout0(2.6,()=>{if(S.phase==='c2-easement')S.jamieAim=null;});}
   const b=found.group.position,db=Math.hypot(p.x-b.x,p.z-b.z);if(db<4.2||(db<11&&k.camLooksAt({x:b.x,y:b.y,z:b.z},.86)))discover();}
  if(ph==='c2-bike'){C.discT+=dt;if(C.discT>16&&!busy())inspect();}
  if(ph==='c2-bell'&&S.pose){S.pose.w=S.pose.release?Math.max(0,S.pose.w-dt*1.6):Math.min(1,S.pose.w+dt/1.1);if(C.bellAt>=0&&!S.pose.release){const m=SP.mouth,w=smooth((C.t-C.bellAt-.2)/1.6);S.pose.yaw=S.pose.baseYaw+wrap(headingTo(S.pose.x,S.pose.z,m.x,m.z)-S.pose.baseYaw)*w;S.pose.pitch=-.62+.6*w;S.pose.y=S.pose.baseY+.22*w;}}
  if(ph==='c2-police'||ph==='c2-search'||ph==='c2-home'){if(S.pose){S.pose.w=Math.max(0,S.pose.w-dt*1.4);if(S.pose.w<=0){k.setPose(null);roam.walkLock=false;}}}
  if(ph==='c2-police'){C.copT+=dt;if(C.callAt&&C.t>C.callAt&&!C.flags.called){C.flags.called=true;
    talk([{who:'OFFICER',text:'“Hey!”',from:officer2,time:1.3,gap:.5},{who:'OFFICER',text:'“Kids! Stop right there.”',from:officer2,time:2,act:copApproach}],{interrupt:true});
    for(const c of [jamie,sam]){c.lookAt=officer2.pos;}S.lookTarget=officer2.pos;S.jamieAim=officer2.pos;}
   if(C.flags.copThere&&!C.flags.told&&!busy())tell();
   // Wandering off while he walks over: he is a grown-up with a flashlight; he catches up.
   if(C.flags.called&&!C.flags.copThere&&!officer2.walking&&dist(officer2,p)>4.5)copApproach();}
  if(ph==='c2-search'){if(C.flags.dadThere&&!C.flags.dadTalk&&!busy())dadScene();
   const b=found.group.position;if(Math.hypot(p.x-b.x,p.z-b.z)<2.2&&!busy()&&C.t>C.warned){C.warned=C.t+9;talk([{who:'OFFICER',text:'“Back. Now.”',from:officer2,time:1.6}]);}}
  if(ph==='c2-home'){const away=Math.hypot(p.x-C.homeFrom.x,p.z-C.homeFrom.z),L=where(p);
   if(!C.flags.leaving&&C.flags.plan&&(away>13||L.street!=='easement'||C.t-(C.homeAt??=C.t)>40)){C.flags.leaving=true;C.dawn=0;}
   if(C.dawn>=0){C.dawn+=dt;o.fade(smooth(C.dawn/2.6));if(C.dawn>3&&!C.flags.dateCard){C.flags.dateCard=true;go('c2-dawn');C.pt=0;card(true,{eyebrow:'',title:'August 22, 2011'});}}}
  if(ph==='c2-dawn'){if(C.pt>3.4&&C.cardOn)card(false);if(C.pt>4.6)wakeUp();}
  if(ph==='m-home'){if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/3));if(C.fadeIn>=3){o.fade(0);C.fadeIn=-1;}}
   const L=where(p);if(L.street==='main'&&L.d>1124&&Math.hypot(jamie.px-p.x,jamie.pz-p.z)<19&&!busy())oakTalk();}
  if(ph==='m-briarwood'){if(atCorner(p)&&!C.flags.corner){C.flags.corner=true;objective('Remember Alex leaving.');talk([{who:'JAMIE',text:'“This is where he turned.”',from:jamie,time:2.4}]);}}
  if(ph==='m-after'&&C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/3.4));if(C.endT>4){go('m-end');end();}}
  A.night=api.day?0:1;A.day=api.day;if(api.day){S.deep=A.deep=0;}}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p');if(h)h.innerHTML='Chapter Two';if(pp)pp.textContent='August 22, 2011.';}o.finish();}
 // ---- what F does here ---------------------------------------------------------------------------------
 function spots(){const out=[],ph=S.phase;
  if(ph==='c2-bike'){const m=mountPoint();out.push({id:'c2-inspect',label:'Look closer',at:found.group.position,face:m,r:2.4});}
  if(ph==='m-briarwood'&&C.flags.corner&&!C.memory)out.push({id:'c2-remember',label:'Remember',at:corner.at,face:corner.look,r:11,ride:true,wide:true});
  return out;}
 function act(id){if(id==='c2-inspect')inspect();else if(id==='c2-remember')remember();}
 function sources(out){if(api.day){// a sprinkler or two, the mower far off, radio at the corner
   out.push({id:'radio-am',kind:'radio',pos:officer.pos,level:.8});return;}
  if(S.phase.startsWith('c2-')){const w=SP.water,m=SP.mouth;out.push({id:'channel',kind:'water',pos:new THREE.Vector3(w.x,w.y,w.z),level:.7},{id:'culvert',kind:'culvert',pos:new THREE.Vector3(m.x,m.bed+1,m.z),level:1});
   if(officer.visible)out.push({id:'radio2',kind:'radio',pos:officer.pos,level:.8});}}
 function blockers(){const out=[];if(found.group.visible)out.push(...foundParts);for(const a of extra)if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});return out;}
 // ---- lifecycle ------------------------------------------------------------------------------------------
 function reset(){fresh();timers=[];card(false);found.group.visible=false;tape.visible=false;flyers.visible=false;for(const e of beams){e.on=false;e.beam.visible=false;e.torch.visible=false;e.ready=false;}
  for(const a of extra){a.show(false);a.lookAt=null;a.gest(null);a.mode='stand';a.path=null;}S.jamieAim=null;S.samAim=null;api.day=A.day=0;ambient.morning?.(false);
  const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p');if(h)h.innerHTML='Chapter Two';if(pp)pp.textContent='August 22, 2011.';}}
 // QA jumps and Continue.
 function jump(section){section=ALIAS[section]||section;fresh();timers=[];card(false);const k1=k;
  if(['morning','morning-oak','memory-start','memory-reconstruction','chapter2-end'].includes(section)){k1.nightWorld();morningWorld();
   if(section==='morning'){wakeUp();C.fadeIn=-1;o.fade(0);return;}
   C.flags.oakTalk=true;
   if(section==='morning-oak'){go('m-home');const q=main(1126,-1);o.placePlayer({x:q.x,z:q.z,a:heading(1126),mode:'ride',speed:2.2});date(22,MORNING_TIME.oak,'AM');objective('Meet Jamie and Sam at the oak.');C.flags.oakTalk=false;return;}
   // At the Briarwood corner, everyone back on their bikes.
   const q=main(593,1.2);o.placePlayer({x:q.x,z:q.z,a:heading(593)+.9,mode:'ride',speed:0});comp.reset();
   const jq=main(589.5,-.6),sq=main(590.5,2.8);comp.putRiding(jamie,jq.x,jq.z,heading(589.5)+.4,0);comp.putRiding(sam,sq.x,sq.z,heading(590.5)+.7,0);jamie.follow='ride';sam.follow='ride';
   go('m-briarwood');C.flags.corner=true;objective('Remember Alex leaving.');date(22,MORNING_TIME.corner,'AM');
   if(section==='memory-reconstruction')remember();else if(section==='chapter2-end'){C.memory='done';memoryDone();}
   return;}
  // The night.
  nightSet();S.flashOn=true;o.giveFlashlight?.();k1.torch.visible=true;samBeam.on=true;
  const putFoot=(c,s,t,face)=>{const q=W2(s,t);comp.putFoot(c,q.x,q.z,face);c.follow=null;};
  const ride0=side(87.6,6.8),jb=side(89.9,7.4);// the bikes stay by the railing
  if(section==='chapter2-start'){comp.reset();const jbk=side(89.9,7.4),sbk=side(87.6,6.8),c=k.clue.position;
   comp.putFoot(jamie,side(96.6,15.2).x,side(96.6,15.2).z,k.ha(96)+1.2,{bike:{x:jbk.x,z:jbk.z,a:k.ha(89.9),fall:-1.36}});comp.putFoot(sam,side(97.4,13.4).x,side(97.4,13.4).z,k.ha(97)+1,{bike:{x:sbk.x,z:sbk.z,a:k.ha(87.6),kick:1}});
   const pb=side(86.5,5.6);o.placePlayer({x:c.x,z:c.z,a:0,mode:'walk',bike:{x:pb.x,z:pb.z,a:k.ha(86.5)}});
   begin();C.fadeIn=-1;o.fade(0);S.queue.length=0;S.line=null;decide();return;}
  const at=(s,t,a)=>{const q=W2(s,t);o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:{x:ride0.x,z:ride0.z,a:k.ha(87.6)}});};
  comp.reset();
  if(section==='easement'){at(6,F.pathT(6),F.heading);putFoot(jamie,5,F.pathT(5)+1.2,F.heading);putFoot(sam,4,F.pathT(4)-.6,F.heading);for(const c of [jamie,sam])c.follow='search';go('c2-easement');objective('Search beyond the fence.');date(21,NIGHT_TIME.start,'PM');checkpoint('chapter2-start');return;}
  putFoot(jamie,32.2,-5.2,F.heading+2.4);putFoot(sam,27.6,-5.1,F.heading+.5);
  const b=found.group.position;at(28.2,F.pathT(28.2)+.6,headingTo(W2(28.2,F.pathT(28.2)+.6).x,W2(28.2,F.pathT(28.2)+.6).z,b.x,b.z));
  C.flags.found=true;if(section==='alex-bike'){go('c2-bike');C.discT=0;objective('Look at the bicycle.');date(21,NIGHT_TIME.bike,'PM');S.jamieAim=b;for(const c of [jamie,sam])c.lookAt=b;return;}
  C.flags.inspected=true;go('c2-bell');S.jamieAim=SP.mouth;
  if(section==='second-bell'){for(const c of [jamie,sam])c.lookAt=b;talk([{wait:1.2},{act:secondBell,wait:3.1},{who:'SAM',text:'“Nope.”',from:sam,time:1.6,gap:.6},{who:'JAMIE',text:'“That wasn’t his bike.”',from:jamie,time:2.3},{wait:4.2},{act:searchersComing,wait:.1}]);date(21,NIGHT_TIME.bike,'PM');return;}
  C.flags.bell=true;searchersComing();C.callAt=C.t+.4;}
 const presentObjects=()=>[found.group,tape,flyers,...k.adults.map(a=>a.person.group),...extra.map(a=>a.person.group),carA.group,carB.group,...comp.all.flatMap(c=>[c.person.group,c.bike.group])].filter(Boolean);
 let hidden=null;
 // While remembering, the present is not there; afterwards it is exactly as it was.
 function presentVisible(on){if(!on){hidden=presentObjects().filter(g=>g.visible);for(const g of hidden)g.visible=false;}else{for(const g of hidden||[])g.visible=true;hidden=null;}}
 Object.assign(api,{owns,begin,update,spots,act,sources,blockers,reset,jump,memoryDone,presentVisible,jamieSweep,
  canDismount:()=>!['c2-bell','m-memory'].includes(S.phase),canRemount:()=>!S.phase.startsWith('c2-'),
  found,tape,flyers,extra,beams,homeHouse,corner,LABEL,ALIAS});
 return api;
}
