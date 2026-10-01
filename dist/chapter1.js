// Chapter One: the night after the ride. "Go home" no longer ends the memory. You ride home alone,
// a police car passes you and turns onto Briarwood Lane, and the evening becomes the night Alex
// did not come home. You hear it from an officer in his driveway, wake Jamie and then Sam, meet
// at the old oak, and go back the way he went, down to the creek, where the first thing anyone
// finds is the broken reflector off the back of his bike. A bell, somewhere deeper in. It stops.
//
// This file directs: phases, objectives, who says what, the title card, checkpoints and QA jumps.
// The cars and grown-ups (police.js, people.js) and Jamie and Sam (companions.js) do their own
// moving. Everything is in world space (x, z, heading a with forward (sin a, -cos a)); Briarwood
// places are written in its own street frame (u along it, v across, +v the inside of its curve).
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {LOOKOUT} from './layout.js';
import {smooth} from './kit.js';
import {createPolice} from './police.js';
import {createActor,ADULTS,wrap,headingTo} from './people.js';
import {createCompanions} from './companions.js';
import {mergeParts} from './rig.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const SAVE='lastlight.chapter1';
// QA jumps in story order (the prologue's own, alex-departure, is in game.js). Checkpoints are
// the ones marked; Continue on the title menu goes back to the last one reached.
export const SECTIONS=['ride-home','police','title','alex-house','jamie','sam','oak','retrace','investigation','clue'];
const CHECKPOINT={'alex-house':'Briarwood Lane','jamie':'Jamie’s house','sam':'Sam’s house','oak':'The old oak','retrace':'The way he went','investigation':'The creek'};
// The time on the date line as the night goes on.
const CLOCK={home:'8:44',briarwood:'8:47',friends:'8:58',sam:'9:06',oak:'9:15',retrace:'9:22',creek:'9:31'};
// How dark it has become (lighting reads this through game.js).
const DEEP={leave:0,home:.12,cruiser:.18,title:.22,briarwood:.28,friends:.42,oak:.55,retrace:.68,creek:.8,clue:.82,end:.82};

export function createChapter1(o){
 const {scene,world,nav,friends,ambient,camera,sfx,say,player,roam,setDate,finish,fade,$,placePlayer,nightRendering}=o;
 const B=nav.frame,J=nav.junction,CR=world.creek,spotsC=CR.spots;
 const side=(u,v)=>{const p=B.point(u,v);return {x:p.x,z:p.z,y:p.y};},main=(d,lat)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:p.y};};
 const ha=u=>B.heading(u);// Briarwood's direction at u
 const at=(h,s)=>h.frameId==='main'?main(s.d,s.lat):side(s.d,s.lat);
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 // ---- the cast ------------------------------------------------------------------------------
 const police=createPolice(scene,world,nav,{sfx}),carA=police.makeCar('arriving'),carB=police.makeCar('first');
 const officer=createActor(scene,nav,ADULTS.officer,{seed:1}),officer2=createActor(scene,nav,ADULTS.officer2,{seed:2}),dad=createActor(scene,nav,ADULTS.dad,{seed:3}),mom=createActor(scene,nav,ADULTS.mom,{seed:4}),neighbor=createActor(scene,nav,ADULTS.neighbor,{seed:5});
 const adults=[officer,officer2,dad,mom,neighbor];
 const comp=createCompanions({scene,nav,friends,sfx}),jamie=comp.list.jamie,sam=comp.list.sam;
 const AH=world.homes.alex,AD=world.doors.alex,AG=world.garages.alex;
 const JH=world.homes.jamie,JW=world.windows.jamie,SH=world.homes.sam,SW=world.windows.sam,SD=world.sideDoors.sam;
 // Windows in world space, with what the climb needs.
 function windowInfo(h,w){const wall=h.toWorld(w.wallX,w.z),land=h.toWorld(w.wallX+w.s*.95,w.z+.95);return {stand:at(h,w.stand),inside:at(h,w.inside),outside:at(h,w.outside),sill:w.sill,wall:{x:wall.x,z:wall.z},land:{x:land.x,z:land.z},floorY:wall.ground+h.floor,glass:{x:w.sill.x,y:w.sill.y+.6,z:w.sill.z},win:w};}
 const JWin=windowInfo(JH,JW),SWin=windowInfo(SH,SW);
 const sideDoor={outside:at(SH,SD.outside),inside:at(SH,SD.inside),through:at(SH,SD.through)};
 // ---- small props of the night: the clue, a tire track, flashlight beams, fireflies ------------
 const clue=new THREE.Group();clue.name='alex-reflector';scene.add(clue);clue.visible=false;
 const lens=new THREE.MeshStandardMaterial({color:0x8a1a14,emissive:0xff2a18,emissiveIntensity:0,roughness:.3,metalness:.1});
 {const shape=new THREE.Shape(),outline=[[-.046,-.033],[.024,-.034],[.044,-.019],[.037,.002],[.048,.016],[.014,.022],[.005,.034],[-.043,.029]];outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.002,bevelThickness:.0015,bevelSegments:1,steps:1});geo.rotateX(-Math.PI/2);
  const rim=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x382824,roughness:.65}));rim.scale.set(1.08,1,1.08);clue.add(rim);
  const piece=new THREE.Mesh(geo,lens);piece.position.y=.003;clue.add(piece);
  // Molded prismatic lens faces catch the beam; the chipped corner breaks the regular pattern.
  const facets=new THREE.Group();for(let x=-.033;x<.032;x+=.012)for(let z=-.018;z<.023;z+=.012){if(x>.016&&z<-.006)continue;const tri=new THREE.Mesh(new THREE.ConeGeometry(.006,.003,4),lens);tri.position.set(x,.015,z);tri.rotation.y=Math.PI/4;facets.add(tri);}facets.updateMatrixWorld(true);const faces=[];facets.traverse(m=>{if(m.isMesh)faces.push({geo:m.geometry,matrix:m.matrixWorld,color:0xffffff});});clue.add(new THREE.Mesh(mergeParts(faces),lens));
  const tape=new THREE.Mesh(new THREE.BoxGeometry(.02,.008,.067),new THREE.MeshStandardMaterial({color:0x161718,roughness:.93}));tape.position.set(-.015,.016,0);tape.rotation.y=.07;clue.add(tape);
  const bracket=new THREE.Mesh(new THREE.BoxGeometry(.017,.007,.035),new THREE.MeshStandardMaterial({color:0x8c9290,roughness:.5,metalness:.55}));bracket.position.set(.006,.002,.04);clue.add(bracket);
  const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.008,8),bracket.material);bolt.position.set(.006,.008,.047);clue.add(bolt);
  const scratches=new THREE.BufferGeometry();scratches.setAttribute('position',new THREE.Float32BufferAttribute([-.031,.018,-.008,-.023,.018,.01,.014,.016,-.018,.024,.016,-.008],3));const mark=new THREE.LineSegments(scratches,new THREE.LineBasicMaterial({color:0x512d28}));clue.add(mark);
  const p=side(...spotsC.clue),gy=nav.groundY(p.x,p.z);clue.position.set(p.x,gy+.012,p.z);clue.rotation.set(.12,ha(spotsC.clue[0])+2.1,-.08);}
 const glint=new THREE.Sprite(new THREE.SpriteMaterial({map:police.cars[0].glowR.material.map,color:0xff3a22,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));glint.scale.setScalar(.1);glint.position.copy(clue.position).add(new THREE.Vector3(0,.03,0));scene.add(glint);glint.visible=false;
 // A thin tire line in the soft ground of the path, going down toward the channel.
 const track=(()=>{const pts=[[91.5,7.95],[92.7,9.3],[94,10.6],[95.3,11.8],[96.6,13],[97.7,14.2]],p=[],idx=[];
  for(let i=0;i<pts.length;i++){const [u,v]=pts[i],n=pts[Math.min(i+1,pts.length-1)],q=pts[Math.max(i-1,0)],du=n[0]-q[0],dv=n[1]-q[1],l=Math.hypot(du,dv)||1,w=.028,wob=Math.sin(i*1.7)*.05;
   for(const k of [-1,1]){const uu=u+(-dv/l)*(w*k+wob),vv=v+(du/l)*(w*k+wob),pt=side(uu,vv);p.push(pt.x,nav.groundY(pt.x,pt.z)+.016,pt.z);}}
  for(let i=0;i<pts.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({roughness:1,color:0x393326,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.name='tire-track';scene.add(m);m.visible=false;return m;})();
 const trackMid=side(94.6,11.2);
 // Flashlight beams: a soft cone you can see in the dark (Jamie's also lights things for real).
 const beamMat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uA:{value:0}},
  vertexShader:'varying float vT;void main(){vT=uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float uA;varying float vT;void main(){float a=pow(vT,2.2)*uA;gl_FragColor=vec4(vec3(1.,.93,.78)*a,a);}'});
 function makeBeam(len=5.5,r=.85){const g=new THREE.ConeGeometry(r,len,18,1,true);g.translate(0,-len/2,0);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,beamMat());m.frustumCulled=false;m.visible=false;scene.add(m);return m;}
 const beamJ=makeBeam(6,.95),beamO=makeBeam(7,1.1);
 const torch=new THREE.Mesh(new THREE.CylinderGeometry(.018,.016,.15,8),new THREE.MeshStandardMaterial({color:0x202224,roughness:.5,metalness:.5}));torch.rotation.x=Math.PI/2;torch.visible=false;
 jamie.person.parts.rhand.add(torch);torch.position.set(0,.05,-.02);
 const torchO=new THREE.Mesh(new THREE.CylinderGeometry(.02,.018,.2,8),torch.material);torchO.rotation.x=Math.PI/2;officer2.person.parts.rhand.add(torchO);torchO.position.set(0,.05,-.03);
 // Fireflies down in the creek strip.
 const FN=26,fly=new Float32Array(FN*3),flyPhase=new Float32Array(FN),flyHome=[];for(let i=0;i<FN;i++){const s=i%2?1:-1,u=CR.u-11+((i*7.31)%22),v=s*(10+((i*3.17)%17));flyHome.push(side(u,v));flyPhase[i]=i*1.37;}
 const flyGeo=new THREE.BufferGeometry();flyGeo.setAttribute('position',new THREE.BufferAttribute(fly,3));flyGeo.setAttribute('phase',new THREE.BufferAttribute(flyPhase,1));
 const flyMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uScale:{value:600}},
  vertexShader:'attribute float phase;uniform float uTime,uScale;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float b=pow(max(0.,sin(uTime*(.5+fract(phase*.37)*.4)+phase)),12.);vA=b;gl_PointSize=uScale*.08/-mv.z*(.6+b);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-r),2.)*vA;gl_FragColor=vec4(vec3(.9,1.,.45)*a,a);}'});
 const flies=new THREE.Points(flyGeo,flyMat);flies.frustumCulled=false;flies.visible=false;scene.add(flies);
 // ---- state ------------------------------------------------------------------------------------
 const S={};
 function fresh(){Object.assign(S,{phase:'off',t:0,pt:0,flags:{},deep:0,line:null,queue:[],lineT:0,gap:0,objective:'',objT:0,titleT:-1,siren:null,sirenOff:-1,
  pass:null,vLock:0,committed:false,alexScene:false,jamieIn:false,samIn:false,talking:null,pose:null,poseT:0,clueT:-1,bellAt:-1,endT:-1,flash:null,flashT:0,flashOn:false,
  officerWalk:0,dadCall:-1,radioT:4,lastDp:null,brakeT:0,fadeV:0,overheard:new Set(),cruiserSeen:false,jamieTap:0,samTap:0,samWait:-1,hint:-1,lookTarget:null,glintV:0,searchT:0});}
 fresh();
 const api={night:1,deep:0,arPlain:false,sources:[],urgent:false,glanceMax:.85,hideBell:true,pose:null,phase:()=>S.phase};
 // ---- objective, title card, date ----------------------------------------------------------------
 function objective(text){const note=$('objective-note');if(note){note.textContent=text==='Find Jamie.'?'Back on Oak Hollow. The red chair on his porch.':text==='Find Sam.'?'Farther toward the oak. His garage with the old hoop.':'';note.style.opacity=note.textContent?'1':'0';}if(text===S.objective)return;S.objective=text;const el=$('objective');if(!el)return;el.classList.remove('on');S.objT=text?.9:0;if(!text)el.textContent='';}
 function updateObjective(dt){if(S.objT>0){S.objT-=dt;if(S.objT<=0){const el=$('objective');if(el){el.textContent=S.objective;if(S.objective)el.classList.add('on');}}}}
 function title(on){const el=$('title-card');if(!el)return;if(on)el.classList.add('on');else el.classList.remove('on');S.titleOn=on;}
 const date=k=>setDate(`AUGUST 21, 2011 <i></i> ${CLOCK[k]} PM`);
 function checkpoint(id){if(!CHECKPOINT[id])return;try{localStorage.setItem(SAVE,JSON.stringify({section:id,at:Date.now()}));}catch{}}
 // ---- dialogue ----------------------------------------------------------------------------------
 // Lines play one after another: {who, text, time?, from? (who is speaking: for heads), act?, wait?}.
 const P={x:0,z:0};
 function talk(lines,{then=null,interrupt=false,range=null,from=null}={}){if(interrupt){S.queue=[];S.line=null;}for(const l of lines)S.queue.push({...l,range,anchor:from});if(then)S.queue.push({then});}
 const busy=()=>!!S.line||S.queue.length>0;
 function lineTime(l){return l.time??clamp(1.5+l.text.replace(/[“”]/g,'').length*.058,2,6.5);}
 function updateTalk(dt){
  if(S.line){S.lineT+=dt;const l=S.line;
   // Walk away from a conversation and it ends, the way they do.
   if(l.range&&l.anchor&&dist(player(),l.anchor.pos)>l.range){S.queue=[];S.line=null;S.talking=null;if(S.phase==='briarwood'){S.flags.talked=false;S.flags.approaching=false;officer.lookAt=dad.lookAt=null;}say('','',.01);return;}
   if(l.until&&!l.until())return;
   if(S.lineT>=l.dur){S.line=null;S.talking=null;S.gap=l.gap??.35;}return;}
  if(S.gap>0){S.gap-=dt;return;}
  const l=S.queue.shift();if(!l)return;
  if(l.then){l.then();return;}if(l.act)l.act();if(l.wait||l.until){S.line={...l,dur:l.wait||.01,text:''};S.lineT=0;return;}
  l.dur=lineTime(l);S.line=l;S.lineT=0;S.talking=l.from||null;if(l.from)l.from.talk=l.dur;say(l.who,l.text,l.dur+.6);}
 const speaking=()=>S.line&&S.line.text?S.line.who:null;
 // ---- helpers for places ---------------------------------------------------------------------------
 const me=()=>{const p=player();return p;};
 function onBriarwood(p=me()){const L=nav.locate(p.x,p.z);return L.street==='side'?L:null;}
 function mainD(p=me()){const L=nav.locate(p.x,p.z);return L.street==='main'?L.d:null;}
 const headPos=a=>{const g=a.person?.group||a;return new THREE.Vector3(g.position.x,g.position.y+1.6*(a.spec?.scale||1),g.position.z);};
 // ---- night set-up shared by the story and every QA jump ------------------------------------------
 function nightWorld(){if(S.flags.night)return;S.flags.night=true;nightRendering?.(true);ambient.night?.(true);document.body?.classList?.add('night1');
  world.alexWindow.emissiveIntensity=.85;AD.set(.82);AG.set(1);
  // Alex's street: the first car already there, its officer at the car with his radio; Alex's
  // mother on the porch with the phone; his father in the driveway; a neighbor across the street.
  carB.show(true);carB.park(side(133.8,3.05).x,side(133.8,3.05).z,ha(133.8));carB.lights=true;carB.headlights=false;
  officer2.show(true);officer2.place(side(134.2,.95).x,side(134.2,.95).z,ha(134.2)+Math.PI/2);officer2.gest('radio');
  dad.show(true);dad.place(side(119.3,10.1).x,side(119.3,10.1).z,headingTo(side(119.3,10.1).x,side(119.3,10.1).z,side(121,7).x,side(121,7).z));dad.gest('fold');
  mom.show(true);mom.place(side(126.6,12.7).x,side(126.6,12.7).z,headingTo(side(126.6,12.7).x,side(126.6,12.7).z,side(126,4).x,side(126,4).z));mom.gest('phone');
  neighbor.show(true);neighbor.place(side(131.2,-9.4).x,side(131.2,-9.4).z,headingTo(side(131.2,-9.4).x,side(131.2,-9.4).z,side(124,9).x,side(124,9).z));neighbor.gest('fold');
  clue.visible=true;track.visible=true;flies.visible=true;}
 // The arriving car parked and its officer at the end of the driveway, talking to Alex's dad.
 function arrivedScene(){carA.show(true);const p=side(125.4,3.05);carA.park(p.x,p.z,ha(125.4));carA.lights=true;carA.headlights=true;carA.siren=false;
  officer.show(true);const q=side(120.7,8.4);officer.place(q.x,q.z,headingTo(q.x,q.z,dad.x,dad.z));officer.gest(null);dad.faceTo(q.x,q.z);S.alexScene=true;}
 // ---- phases -----------------------------------------------------------------------------------------
 function go(phase){S.phase=phase;S.pt=0;}
 function begin(how){fresh();api.pose=null;comp.reset();objective('');title(false);
  if(how==='wake'){toRideHome();go('home');return;}go('leave');}
 // After the last memory line, the picture fades and comes back a little way along the ride home.
 function toRideHome(){nightWorld();const d=840,lat=-2.1,p=main(d,lat);placePlayer({x:p.x,z:p.z,a:heading(d)+Math.PI,mode:'ride',speed:4.2});comp.trail.reset();date('home');}
 // The police car: comes from the town end of Oak Hollow toward you, passes, brakes, and turns
 // onto Briarwood behind you; it drives down past the creek, round the bend, to Alex's house.
 function sendCruiser(gap=720){const dp=mainD()??700,c0=Math.max(-405,dp-gap),lane=2.2,pts=[];
  for(let d=c0+30;d<J.d-24;d+=40)pts.push(main(d,lane));
  for(const [d,l] of [[J.d-15,2.25],[J.d-8.5,2.7],[J.d-5,4.2],[J.d-3.1,6.6],[J.d-2.4,9.4]])pts.push(main(d,l));
  for(const u of [14,22,34,48,62,74,86,98,108,116,121.5])pts.push(side(u,2.2));pts.push(side(125.4,3.05));
  const start=main(c0,lane);carA.show(true);carA.park(start.x,start.z,heading(c0));carA.lights=true;carA.siren=true;carA.headlights=true;police.spotUser.who=carA;
  carA.go(pts.map(q=>[q.x,q.z]),{speed:cruiserSpeed,accel:3,brake:4.2,then:()=>{carA.siren=false;if(S.sirenOff<0)S.sirenOff=S.t;police.spotUser.who=null;arrivedOfficer();}});S.siren={mode:'wail',pitch:1,lastDist:null,muffle:0,active:true};}
 function cruiserSpeed(c){const L=nav.locate(c.x,c.z);
  if(L.street==='side'){if(L.u>78&&S.siren&&S.siren.mode!=='down'){S.siren.mode='down';S.sirenOff=S.t;}return L.u<98?11:7;}
  const dp=mainD();if(S.committed||dp===null)return S.vLock||13;
  // Timed to pass you just after you cross Briarwood, but only while you are riding toward it:
  // a car with its siren on does not wait for anyone.
  const M=566,rate=-(S.dpRate||0);let v=13;if(rate>1&&dp>M)v=clamp((M-L.d)/Math.max((dp-M)/rate,.5),8,15);
  if(dp-L.d<170||L.d>J.d-70){S.committed=true;S.vLock=clamp(Math.max(v,c.v),11,15);}
  return v;}
 // The officer from the arriving car gets out and walks to the end of the driveway.
 function arrivedOfficer(){if(S.alexScene)return;S.alexScene=true;const door=side(124.6,1.2),q=side(120.7,8.4);officer.show(true);officer.place(door.x,door.z,ha(124.6));officer.walk([side(122.3,.9),side(121.6,5.6),q].map(p=>[p.x,p.z]),{speed:1.4,then:a=>{a.faceTo(dad.x,dad.z);}});}
 // ---- the briarwood conversation ------------------------------------------------------------------
 function conversationalSpot(actor,p,r,angle=0){const a=headingTo(p.x,p.z,actor.x,actor.z)+angle;
  for(const off of [0,.4,-.4,.8,-.8,1.2,-1.2]){const h=a+off,q={x:p.x+Math.sin(h)*r,z:p.z-Math.cos(h)*r};if(nav.walkable(q.x,q.z)&&!blockers(true).some(b=>Math.hypot(b.x-actor.x,b.z-actor.z)>.1&&Math.hypot(b.x-q.x,b.z-q.z)<b.r+.5))return q;}return {x:actor.x,z:actor.z};}
 function approach(actor,q){const obs=blockers(true).filter(b=>Math.hypot(b.x-actor.x,b.z-actor.z)>.1),path=nav.walkPath(actor,q,obs);if(path.length)actor.walk(path,{speed:1.35,then:a=>{a.faceTo(me().x,me().z);a.lookAt=camera.position;}});}
 function startAlexTalk(){S.flags.talked=true;S.flags.approaching=true;S.flags.dadJoining=false;S.approachT=0;S.talkOrigin={x:me().x,z:me().z};officer.gest(null);dad.gest(null);officer.lookAt=camera.position;dad.lookAt=officer.pos;mom.lookAt=null;
  approach(officer,conversationalSpot(officer,me(),2.35));}
 function beginAlexLines(){S.flags.approaching=false;
  talk([{who:'OFFICER',text:'“You were with Alex tonight?”',from:officer},
   {who:'YOU',text:'“Yeah.”',time:1.7},
   {who:'OFFICER',text:'“When did he leave you?”',from:officer},
   {who:'YOU',text:'“At Oak Hollow. He turned here.”'},
   {until:()=>!dad.walking&&dist(dad,me())<5.8},
   {who:'ALEX’S DAD',text:'“He never came home.”',from:dad,act:()=>dad.gest('head')},
   {who:'OFFICER',text:'“Was anyone with him?”',from:officer},
   {who:'YOU',text:'“No.”',time:1.8},
   {who:'OFFICER',text:'“Okay. Thank you. Head on home now, alright? We’ll call your folks if we need anything.”',from:officer,time:5.2,gap:1.2}],
   {range:12,from:officer,then:afterAlexTalk});}
 function stageAlex(dt){if(S.phase!=='briarwood'||!S.flags.talked||S.flags.alexDone)return;
  const p=me();if(dist(p,S.talkOrigin)>13){S.queue=[];S.line=null;S.flags.talked=S.flags.approaching=false;say('','',.01);return;}
  S.approachT+=dt;officer.lookAt=S.line?.who==='ALEX’S DAD'?dad.pos:camera.position;dad.lookAt=S.line?.who==='OFFICER'?officer.pos:camera.position;
  if(!officer.walking)officer.faceTo(p.x,p.z);if(!dad.walking)dad.faceTo(p.x,p.z);
  if(S.approachT>1&&!S.flags.dadJoining){S.flags.dadJoining=true;approach(dad,conversationalSpot(dad,p,3.35,.58));}
  if(S.approachT>2.5&&Math.floor(S.approachT)%2===0){if(!officer.walking&&dist(officer,p)>4.4)approach(officer,conversationalSpot(officer,p,2.35));if(!dad.walking&&dist(dad,p)>5.4)approach(dad,conversationalSpot(dad,p,3.35,.58));}
  if(S.flags.approaching&&!officer.walking&&dist(officer,p)<4.4)beginAlexLines();}
 function afterAlexTalk(){S.flags.alexDone=true;officer.lookAt=null;dad.lookAt=null;officer.gest('radio');dad.gest('fold');go('friends');objective('Find Jamie.');date('friends');checkpoint('jamie');
  // What you hear as you go: the radio, and his father calling his name down the street.
  talk([{wait:2.2},{who:'RADIO',text:'“…twelve-year-old male, last seen on Oak Hollow around eight, riding a green bicycle…”',time:4.6,act:()=>sfx('squelch',officer.pos)}]);S.dadCall=S.t+9;}
 // ---- Jamie ------------------------------------------------------------------------------------------
 function tapJamie(){S.flags.jamieTapped=true;sfx('tap',JWin.glass);roam.walkLock=true;S.jamieTap=0;jamie.hidden=true;comp.take(jamie);
  const a=headingTo(JWin.inside.x,JWin.inside.z,JWin.stand.x,JWin.stand.z);
  comp.run(jamie,[comp.steps.wait(1.1),comp.steps.act(()=>{comp.putFoot(jamie,JWin.inside.x,JWin.inside.z,a);jamie.py=JWin.floorY;jamie.lookPlayer=true;}),comp.steps.idle(jamie,.7),
   comp.steps.act(()=>{S.flags.jamieWindow=true;sfx('window',JWin.glass);}),comp.steps.idle(jamie,.9)],{then:()=>{
   talk([{who:'JAMIE',text:'“Dude. What are you doing?”',from:jamie},
    {who:'YOU',text:'“Alex never got home.”'},
    {who:'JAMIE',text:'“Ha. Nice try.”',from:jamie,time:2},
    {who:'YOU',text:'“I’m serious. There’s police at his house.”'},
    {who:'JAMIE',text:'“…Wait. For real?”',from:jamie,gap:.9},
    {who:'JAMIE',text:'“Okay. Hang on. Don’t go anywhere.”',from:jamie}],{then:jamieOut});}});}
 function jamieOut(){roam.walkLock=false;const back={x:JWin.inside.x+(JWin.inside.x-JWin.wall.x)*1.6,z:JWin.inside.z+(JWin.inside.z-JWin.wall.z)*1.6};
  comp.run(jamie,[comp.steps.walkTo(jamie,[[back.x,back.z]],{speed:1}),comp.steps.act(()=>{jamie.person.group.visible=false;}),comp.steps.wait(3.4),
   comp.steps.act(()=>{jamie.px=JWin.inside.x;jamie.pz=JWin.inside.z;jamie.person.group.visible=true;}),
   comp.steps.climb(jamie,JWin,{onOut:()=>sfx('kickstand',JWin.glass,{gain:.4})}),
   comp.steps.act(()=>{jamie.lookPlayer=true;}),comp.steps.idle(jamie,.5),comp.steps.act(()=>{S.flags.jamieClosing=true;}),comp.steps.idle(jamie,.8)],{then:()=>{
   talk([{who:'JAMIE',text:'“Is his mom okay? Did they say anything?”',from:jamie},{who:'YOU',text:'“Just that he never came home.”'},
    {who:'JAMIE',text:'“Okay. We have to help look. Come on, we’ll get Sam.”',from:jamie}]);jamieToBike();}});}
 // To the bike he dropped on the lawn: stand it up, get on, and come along.
 function jamieToBike(){const f=jamie.f,bp=main(f.bd,f.blat),ba=heading(f.bd)+f.bpsi;jamie.bx=bp.x;jamie.bz=bp.z;jamie.ba=ba;jamie.fall=f.fall;jamie.kick=0;
  const sideP={x:bp.x-Math.cos(ba)*.43+Math.sin(ba)*.1,z:bp.z-Math.sin(ba)*.43-Math.cos(ba)*.1};
  const path=nav.walkPath({x:jamie.px,z:jamie.pz},sideP),corner=JH.toWorld(JW.s*(JH.w/2+1.65),JH.front+2.8);
  comp.run(jamie,[comp.steps.walkTo(jamie,path.length?path:[[corner.x,corner.z],[sideP.x,sideP.z]],{speed:1.5}),comp.steps.turnTo(jamie,ba,.6),comp.steps.lift(jamie),comp.steps.mount(jamie)],{then:()=>{S.jamieIn=true;jamie.follow='ride';jamie.lookPlayer=false;
   objective('Find Sam.');date('sam');checkpoint('sam');}});}
 // ---- Sam ---------------------------------------------------------------------------------------------
 function tapSam(){sfx('tap',SWin.glass);S.samTap++;
  if(!S.jamieIn){S.samTap=0;talk([{who:'',text:'I should get Jamie first.',time:3.5}]);objective('Find Jamie.');return;}
  S.flags.samSignal=true;roam.walkLock=false;
  talk([{wait:1.6},{who:'JAMIE',text:'“He sleeps with a fan on. He can’t hear anything. Watch.”',from:jamie}]);
  const stand=SWin.stand,away={x:stand.x+(stand.x-SWin.wall.x)*1.2+Math.sin(headingTo(SWin.wall.x,SWin.wall.z,stand.x,stand.z)+Math.PI/2)*1.4,z:stand.z+(stand.z-SWin.wall.z)*1.2-Math.cos(headingTo(SWin.wall.x,SWin.wall.z,stand.x,stand.z)+Math.PI/2)*1.4};
  const spot=nav.walkable(away.x,away.z)?away:{x:stand.x+(stand.x-SWin.wall.x)*1.5,z:stand.z+(stand.z-SWin.wall.z)*1.5};
  const steps=[];if(jamie.mode==='ride')steps.push(comp.steps.brake(jamie,.3),comp.steps.dismount(jamie),comp.steps.kickstand(jamie));
  steps.push(comp.steps.walkTo(jamie,[[spot.x,spot.z]],{speed:1.4}),comp.steps.pebble(jamie,SWin.glass,{onHit:()=>sfx('pebble',SWin.glass)}),comp.steps.wait(.6),comp.steps.pebble(jamie,SWin.glass,{onHit:()=>sfx('pebble',SWin.glass)}),comp.steps.act(()=>{jamie.lookPlayer=true;}));
  comp.run(jamie,steps,{then:samAtWindow});}
 function samAtWindow(){const a=headingTo(SWin.inside.x,SWin.inside.z,SWin.stand.x,SWin.stand.z);comp.putFoot(sam,SWin.inside.x,SWin.inside.z,a);sam.py=SWin.floorY;sam.lookPlayer=true;
  comp.run(sam,[comp.steps.idle(sam,.6),comp.steps.act(()=>{S.flags.samWindow=true;sfx('window',SWin.glass);}),comp.steps.idle(sam,.8)],{then:()=>{
   talk([{who:'SAM',text:'“What? My dad’s still up.”',from:sam},
    {who:'JAMIE',text:'“Alex is missing. Like, actually missing.”',from:jamie},
    {who:'SAM',text:'“That’s not funny.”',from:sam,time:2.2},
    {who:'YOU',text:'“It’s not a joke. The police are at his house.”'},
    {who:'SAM',text:'“…Seriously?”',from:sam,time:2},
    {who:'JAMIE',text:'“Get your bike.”',from:jamie,time:1.9},
    {who:'SAM',text:'“This is so dumb. Okay. Side door. Two minutes.”',from:sam}],{then:samGoes});}});}
 function samGoes(){S.flags.samWindow=false;sfx('window',SWin.glass,{gain:.6});sam.person.group.visible=false;sam.hidden=true;S.samWait=S.t;objective('Wait by Sam’s garage.');
  // Jamie goes round the front of the house to the garage's side door and waits there.
  const front=at(SH,{d:SH.S(0,SH.front+3.2).d,lat:SH.S(0,SH.front+3.2).lat}),door=sideDoor.outside,by={x:door.x+(door.x-sideDoor.through.x)*1.6,z:door.z+(door.z-sideDoor.through.z)*1.6};
  const corner=at(SH,SH.S(SWin.win.wallX+SWin.win.s*1.6,SH.front+2.2)),corner2=at(SH,SH.S(SH.gx+SH.gs*(SH.gw/2+1.6),SH.gfront+2));
  comp.run(jamie,[comp.steps.walkTo(jamie,[[corner.x,corner.z],[front.x,front.z],[corner2.x,corner2.z],[by.x,by.z]],{speed:1.35}),comp.steps.act(()=>{jamie.lookPlayer=true;})]);}
 function samOut(){S.flags.samOut=true;sfx('doorOpen',sideDoor.through,{gain:.5});SD.set(0);S.flags.sideDoorOpen=true;
  const a=headingTo(sideDoor.inside.x,sideDoor.inside.z,sideDoor.outside.x,sideDoor.outside.z),bike={x:sideDoor.inside.x+Math.cos(a)*.43+Math.sin(a)*.12,z:sideDoor.inside.z+Math.sin(a)*.43-Math.cos(a)*.12,a};
  comp.putFoot(sam,sideDoor.inside.x,sideDoor.inside.z,a,{bike});sam.holding=true;sam.lookPlayer=false;
  const drive=at(SH,SH.S(SH.gx,SH.gfront+3.4)),out2={x:sideDoor.outside.x+Math.sin(a)*.9,z:sideDoor.outside.z-Math.cos(a)*.9};
  comp.run(sam,[comp.steps.wait(.7),comp.steps.walkTo(sam,[[sideDoor.through.x,sideDoor.through.z],[out2.x,out2.z]],{speed:.9,push:true}),comp.steps.act(()=>{S.flags.sideDoorClosing=true;sfx('doorSlam',sideDoor.through,{gain:.17});}),
   comp.steps.walkTo(sam,[[drive.x,drive.z]],{speed:1.1,push:true}),comp.steps.act(()=>{sam.lookPlayer=true;
    talk([{who:'SAM',text:'“If my dad finds out, I’m dead.”',from:sam},{who:'JAMIE',text:'“He won’t.”',from:jamie,time:1.8},{who:'JAMIE',text:'“Not here. The oak.”',from:jamie,time:2.4}]);}),
   comp.steps.idle(sam,1.4),comp.steps.mount(sam)],{then:()=>{S.samIn=true;sam.follow='ride';sam.lookPlayer=false;go('oak');objective('Go to the old oak.');date('oak');checkpoint('oak');}});
  // Jamie back to his bike, and on.
  const jb={x:jamie.bx-Math.cos(jamie.ba)*.43+Math.sin(jamie.ba)*.08,z:jamie.bz-Math.sin(jamie.ba)*.43-Math.cos(jamie.ba)*.08};
  if(jamie.mode==='foot')comp.run(jamie,[comp.steps.wait(2.5),comp.steps.walkTo(jamie,[[jb.x,jb.z]],{speed:1.3}),comp.steps.turnTo(jamie,()=>jamie.ba,.5),comp.steps.act(()=>{jamie.kick=0;}),comp.steps.mount(jamie)],{then:()=>{jamie.follow='ride';jamie.lookPlayer=false;}});}
 // ---- the old oak --------------------------------------------------------------------------------------
 function oakTalk(){S.flags.oakTalk=true;for(const c of comp.all){c.lookPlayer=true;}
  talk([{who:'JAMIE',text:'“Okay. He turned onto Briarwood. We all saw him.”',from:jamie},
   {who:'YOU',text:'“He waved. He rang his bell.”'},
   {who:'SAM',text:'“He stopped first.”',from:sam,time:2.2},
   {who:'YOU',text:'“No he didn’t.”',time:2},
   {who:'SAM',text:'“Yeah, he did. For a second.”',from:sam,gap:1.3},
   {who:'JAMIE',text:'“Back on the hill he asked if we heard something. Remember?”',from:jamie},
   {who:'SAM',text:'“That was nothing.”',from:sam,time:2.2,gap:.9},
   {who:'JAMIE',text:'“Then let’s go the way he went.”',from:jamie}],{then:()=>{for(const c of comp.all)c.lookPlayer=false;go('retrace');objective('Go the way Alex went.');date('retrace');checkpoint('retrace');}});}
 // ---- the creek ------------------------------------------------------------------------------------------
 function copsAhead(){S.flags.cops=true;roam.brake=.6;S.brakeT=1.6;
  talk([{who:'JAMIE',text:'“Wait—stop. Cops.”',from:jamie,time:2},{who:'JAMIE',text:'“If they see us, we’re done.”',from:jamie},
   {who:'SAM',text:'“So let’s go home.”',from:sam,time:2},{who:'JAMIE',text:'“The creek. We always cut through the creek.”',from:jamie},{who:'JAMIE',text:'“Here. Take the spare.”',from:jamie,time:2.2,act:()=>{o.giveFlashlight?.();say('','T — Flashlight',2.2);}}],{then:()=>{go('creek');objective('Look around the creek.');date('creek');checkpoint('investigation');}});
  // They pull up on the sidewalk by the railing and leave the bikes there.
  comp.run(jamie,[comp.steps.rideTo(jamie,[[side(84,4.6).x,side(84,4.6).z],[side(88.6,6.6).x,side(88.6,6.6).z],[side(90.3,6.9).x,side(90.3,6.9).z]],{vmax:3.2}),comp.steps.brake(jamie,.3),comp.steps.dismount(jamie),comp.steps.drop(jamie),
   comp.steps.act(()=>{S.flashOn=true;sfx('click',jamie.person.group.position);torch.visible=true;}),comp.steps.walkTo(jamie,[[side(91.7,8.5).x,side(91.7,8.5).z],[side(93.5,11.2).x,side(93.5,11.2).z],[side(95.3,14.3).x,side(95.3,14.3).z]],{speed:.9})],{then:()=>{jamie.follow=null;S.flags.jamieSearching=true;}});
  comp.run(sam,[comp.steps.rideTo(sam,[[side(82,4).x,side(82,4).z],[side(86.2,6.5).x,side(86.2,6.5).z],[side(87.6,6.8).x,side(87.6,6.8).z]],{vmax:3}),comp.steps.brake(sam,.3),comp.steps.dismount(sam),comp.steps.kickstand(sam)],{then:()=>{sam.follow='walk';}});}
 function findClue(){go('clue');S.clueT=0;roam.walkLock=true;const c=clue.position,p=me(),a=headingTo(p.x,p.z,c.x,c.z),back={x:c.x-Math.sin(a)*.5,z:c.z+Math.cos(a)*.5};
  objective('');S.pose={w:0,x:back.x,y:nav.groundY(back.x,back.z)+.68,z:back.z,yaw:a,pitch:-.86,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:nav.groundY(back.x,back.z)+.68};api.pose=S.pose;
  jamie.lookAt=c;sam.lookAt=c;S.lookTarget=c;
  talk([{wait:1.4},{who:'YOU',text:'“That’s his.”',time:2.6,gap:.8},{who:'SAM',text:'“Why would he come back here?”',from:sam,time:3},{wait:3.6},
   {act:()=>{S.bellAt=S.t;const b=side(...spotsC.bell);o.audio()?.bell({x:b.x,y:b.y+1,z:b.z},1.8);S.lookTarget=b;jamie.lookAt=b;sam.lookAt=b;},wait:3.4},
   {act:()=>{S.endT=0;},wait:.1}]);}
 // ---- the spots F works on ---------------------------------------------------------------------------------
 function spots(){const out=[];const ph=S.phase;
  if((ph==='friends')&&!S.flags.jamieTapped)out.push({id:'tap-jamie',label:'Tap on the window',at:JWin.stand,face:JWin.glass,r:2.6});
  if((ph==='friends')&&!S.flags.samSignal&&S.samTap<3)out.push({id:'tap-sam',label:'Tap on the window',at:SWin.stand,face:SWin.glass,r:2.5});
  if(ph==='creek'){const c=clue.position;out.push({id:'reflector',label:'Look closer',at:c,face:c,r:1.9});}
  return out;}
 function spot(){if(busy()&&S.phase==='friends'&&(S.flags.jamieTapped||S.flags.samSignal))return null;const p=me();if(!p.walking)return null;let best=null,bd=1e9;for(const s of spots()){const d=dist(p,s.at);if(d>s.r||d>bd)continue;const a=wrap(headingTo(p.x,p.z,s.face.x,s.face.z)-p.a);if(Math.abs(a)>1.25&&d>.8)continue;best=s;bd=d;}return best;}
 function act(id){if(id==='tap-jamie')tapJamie();else if(id==='tap-sam')tapSam();else if(id==='reflector'&&S.phase==='creek')findClue();}
 // ---- every frame -----------------------------------------------------------------------------------------
 const eye=new THREE.Vector3();
 function update(dt){if(S.phase==='off')return;S.t+=dt;S.pt+=dt;const p=me();eye.copy(camera.position);P.x=p.x;P.z=p.z;
  {const d=mainD(p);if(d!==null&&S.lastDp!==null&&dt>0)S.dpRate=damp(S.dpRate||0,(d-S.lastDp)/dt,2,dt);S.lastDp=d;}
  const ph=S.phase;S.deep=damp(S.deep,DEEP[ph]??S.deep,.25,dt);api.deep=S.deep;
  if(ph==='leave'){// two memory lines while you ride out, then the picture goes for a moment
   const T0=10.6;if(S.pt>T0){S.fadeV=smooth((S.pt-T0)/2.4);fade(S.fadeV);if(S.pt>T0+1.6)roam.lock=true;}
   if(S.pt>T0+2.6&&!S.flags.moved){S.flags.moved=true;toRideHome();}
   if(S.pt>T0+3.8){S.fadeV=1-smooth((S.pt-T0-3.8)/2.6);fade(S.fadeV);roam.lock=false;if(S.fadeV<=0){fade(0);go('home');}}}
  else if(ph==='home'){const d=mainD();if(!S.siren&&(S.pt>28||(d!==null&&d<700)))sendCruiser(560);if(S.siren)go('cruiser');}
  // A second or two of quiet once the siren has wound down round the bend, then the title.
  else if(ph==='cruiser'){if(S.titleT<0&&S.sirenOff>=0&&!S.siren?.active&&S.t-S.sirenOff>3.6){S.titleT=0;go('title');}}
  if(S.titleT>=0){S.titleT+=dt;if(S.titleT>.2&&S.titleT<5.2)title(true);else title(false);if(S.titleT>7.4&&S.phase==='title'){S.titleT=-2;go('briarwood');objective('See what’s happening on Briarwood.');date('briarwood');checkpoint('alex-house');}}
  if(S.phase==='briarwood'&&!S.flags.talked&&S.alexScene&&officer.visible&&dist(p,officer.pos)<13.5&&!busy())startAlexTalk();
  stageAlex(dt);
  // Jamie and Sam.
  if(S.phase==='friends'&&S.samWait>=0&&!S.flags.samOut&&S.t-S.samWait>9&&dist(p,sideDoor.outside)<7)samOut();
  if(S.flags.jamieWindow&&!S.flags.jamieClosing)JW.set(Math.min(.82,JW.open+dt*1.1));if(S.flags.jamieClosing)JW.set(Math.max(.12,JW.open-dt*.8));
  if(S.flags.samWindow)SW.set(Math.min(.55,SW.open+dt*.9));else if(SW.open>0)SW.set(Math.max(0,SW.open-dt*.9));
  if(S.flags.sideDoorOpen&&!S.flags.sideDoorClosing)SD.set(Math.min(1,SD.open+dt*1.4));if(S.flags.sideDoorClosing)SD.set(Math.max(0,SD.open-dt*.9));
  // The oak, and back down the street.
  if(S.phase==='oak'&&!S.flags.oakTalk&&!busy()){const d=mainD();if(d!==null&&d>1124&&comp.all.every(c=>Math.hypot(c.bx-p.x,c.bz-p.z)<16))oakTalk();}
  if(S.phase==='retrace'&&!busy()){const d=mainD(),L=onBriarwood();
   if(!S.flags.r1&&d!==null&&d<1000){S.flags.r1=true;talk([{who:'SAM',text:'“What if he’s just at somebody’s house?”',from:sam},{who:'JAMIE',text:'“Whose? We’re his friends.”',from:jamie}]);}
   else if(!S.flags.r2&&d!==null&&d<640){S.flags.r2=true;talk([{who:'JAMIE',text:'“He said see you tomorrow. Right back there.”',from:jamie}]);}
   else if(!S.flags.r3&&L&&L.u>28){S.flags.r3=true;talk([{who:'SAM',text:'“It’s so dark down here.”',from:sam,time:2.4}]);}
   if(!S.flags.cops&&L&&L.u>72)copsAhead();}
  // The flashlight officer working his way along the far sidewalk, and anyone riding on past him.
  if((S.phase==='retrace'||S.phase==='creek'||S.phase==='clue')&&!S.flags.patrol){S.flags.patrol=true;const a=side(138,-6.9);officer2.place(a.x,a.z,ha(138)+Math.PI);officer2.gest('flashlight');patrol();}
  if(S.phase==='creek'){S.searchT+=dt;const L=onBriarwood();
   if(L&&L.u>107&&!S.flags.shooed&&!busy()){S.flags.shooed=true;talk([{who:'OFFICER',text:'“Hey—you kids need to be home. Go on.”',from:officer2},{who:'JAMIE',text:'“Come back! This way.”',from:jamie,time:2.4}]);}
   if(!S.flags.nervous&&S.searchT>9&&!busy()){S.flags.nervous=true;talk([{who:'SAM',text:'“This is a bad idea.”',from:sam,time:2.4}]);}
   if(!S.flags.trackSeen&&dist(p,trackMid)<2.4&&p.walking&&camLooksAt(trackMid,.5)&&!busy()){S.flags.trackSeen=true;talk([{who:'SAM',text:'“Somebody rode down here.”',from:sam,time:2.6}]);}
   if(!S.flags.pointed&&S.searchT>38&&!busy()){S.flags.pointed=true;S.lookTarget=clue.position;talk([{who:'JAMIE',text:'“Wait. What’s that?”',from:jamie,time:2.4}]);}}
  if(S.phase==='clue'){S.clueT+=dt;S.pose.w=smooth(S.clueT/1.1);if(S.bellAt>=0){const b=side(...spotsC.bell),w=smooth((S.t-S.bellAt-.2)/1.6);S.pose.yaw=S.pose.baseYaw+wrap(headingTo(S.pose.x,S.pose.z,b.x,b.z)-S.pose.baseYaw)*w;S.pose.pitch=-.86+.82*w;S.pose.y=S.pose.baseY+.28*w;}if(S.endT>=0){S.endT+=dt;fade(smooth(S.endT/3.6));if(S.endT>4.2){go('end');finish();}}}
  // Alex's dad, out at the end of the driveway, calling his name.
  // Ordinary search sounds, heard only near his street and never down at the creek.
  if(S.dadCall>0&&S.t>S.dadCall&&['friends','oak','retrace'].includes(S.phase)&&dist(me(),dad)<110){S.dadCall=S.t+38+Math.random()*12;const q=side(119.4,6.4);if(!dad.walking){dad.walk([[q.x,q.z]],{speed:1.1,then:a=>{a.face(ha(119.4)+Math.PI*.5);a.gest(null);
   o.audio()?.callName({x:a.x,y:a.pos.y+1.7,z:a.z},{gain:.7});S.flags.dadBack=S.t+6;}});}}
  if(S.flags.dadBack&&S.t>S.flags.dadBack){S.flags.dadBack=0;const q=side(119.3,10.1);dad.walk([[q.x,q.z]],{speed:1,then:a=>{a.faceTo(officer.x,officer.z);a.gest('fold');}});}
  updateTalk(dt);updateObjective(dt);
  if(S.brakeT>0){S.brakeT-=dt;if(S.brakeT<=0)roam.brake=0;}
  // Cast and cars.
  for(const a of adults)a.update(dt,{eye});police.update(dt,eye);updateSiren(dt);
  comp.update(dt,{player:{...p,bx:p.bike.x,bz:p.bike.z},eye,clock:S.t,speaker:speaking(),inView,obstacles:blockers().filter(b=>!comp.all.some(c=>Math.hypot(c.bx-b.x,c.bz-b.z)<.01||Math.hypot(c.px-b.x,c.pz-b.z)<.01))});
  updateFlashlights(dt);updateClue(dt);flyMat.uniforms.uTime.value=S.t;flyMat.uniforms.uScale.value=(o.renderer?.domElement?.height||900)*.9;
  for(let i=0;i<FN;i++){const h=flyHome[i],t=S.t*.3+i;fly[i*3]=h.x+Math.sin(t*.7)*1.2;fly[i*3+1]=nav.baseY?.(h.x,h.z)+.5+Math.sin(t*.5)*.4+(i%3)*.35;fly[i*3+2]=h.z+Math.cos(t*.6)*1.2;}flyGeo.attributes.position.needsUpdate=true;
  sources();attention();}
 const fwd=new THREE.Vector3();function inView(x,z){camera.getWorldDirection(fwd);const dx=x-eye.x,dz=z-eye.z,l=Math.hypot(dx,dz)||1;return (dx*fwd.x+dz*fwd.z)/l/Math.hypot(fwd.x,fwd.z)>.35&&l<120;}
 function camLooksAt(q,cos){const d=new THREE.Vector3(q.x-camera.position.x,(q.y??nav.groundY(q.x,q.z))-camera.position.y,q.z-camera.position.z).normalize(),f=new THREE.Vector3();camera.getWorldDirection(f);return f.dot(d)>cos;}
 // The officer with the flashlight: slowly along the far sidewalk and back, looking into yards.
 function patrol(){const pts=[[138,-6.9],[124,-6.8],[112,-6.6],[106,-6.5]].map(([u,v])=>side(u,v)).map(q=>[q.x,q.z]);
  officer2.walk(pts,{speed:.6,then:a=>{const back=[[112,-6.6],[126,-6.8],[138,-6.9]].map(([u,v])=>side(u,v)).map(q=>[q.x,q.z]);a.walk(back,{speed:.6,then:()=>patrol()});}});}
 // ---- sounds ---------------------------------------------------------------------------------------------------
 function updateSiren(dt){const s=S.siren;if(!s)return;s.active=carA.active&&(carA.siren||s.mode==='down');if(s.mode==='down'&&S.t-S.sirenOff>1.8){s.active=false;}
  const d=Math.hypot(carA.x-eye.x,carA.z-eye.z);if(s.lastDist!==null&&dt>0){const vr=(d-s.lastDist)/dt;s.vr=damp(s.vr??vr,vr,6,dt);s.pitch=343/(343+clamp(s.vr,-40,40));}s.lastDist=d;
  // Behind a house it goes dull: look along the line to the car for walls in between.
  let hidden=0;for(let k=1;k<9;k++){const t=k/9,x=eye.x+(carA.x-eye.x)*t,z=eye.z+(carA.z-eye.z)*t;if(nav.wallAt?.(x,z)){hidden=1;break;}}s.muffle=damp(s.muffle,hidden,1.8,dt);}
 function sources(){const out=api.sources;out.length=0;
  if(S.siren?.active)out.push({id:'siren',kind:'siren',pos:carA.pos,level:1,pitch:S.siren.pitch,mode:S.siren.mode,muffle:S.siren.muffle});
  for(const c of [carA,carB])if(c.active)out.push({id:'idle-'+c.name,kind:'idle',pos:c.pos,level:c.parked?.8:1});
  if(officer2.visible)out.push({id:'radio',kind:'radio',pos:officer2.pos,level:1});
  if(S.flags.night){const w=side(CR.u,CR.end-6);out.push({id:'water',kind:'water',pos:new THREE.Vector3(w.x,w.y,w.z),level:1});}
  if(S.phase==='friends'&&!S.samIn)out.push({id:'tv',kind:'tv',pos:SWin.glass,level:1});}
 // ---- where your eyes go (riding) ------------------------------------------------------------------------------------
 const att=new THREE.Vector3();
 function attention(){api.urgent=false;api.glanceMax=.85;let t=null;
  if(carA.active&&!carA.parked&&(S.phase==='cruiser'||S.phase==='home')){const d=Math.hypot(carA.x-eye.x,carA.z-eye.z),L=nav.locate(carA.x,carA.z);
   if(d<150&&(L.street==='main'||L.u<70)){t=att.set(carA.x,carA.y+1,carA.z);api.urgent=d<45;api.glanceMax=1.75;S.cruiserSeen=true;
    if(d<14&&!S.flags.braked&&me().riding){S.flags.braked=true;roam.brake=.5;S.brakeT=1.5;}}}
  if(!t&&S.line&&S.line.from){const f=S.line.from;t=f.person?att.copy(f.person.group.position).setY(f.person.group.position.y+1.3):null;}
  if(!t&&S.lookTarget&&S.phase==='clue')t=S.lookTarget;
  api.target=t;}
 // ---- flashlights and the glint ------------------------------------------------------------------------------------
 const hand=new THREE.Vector3(),aim=new THREE.Vector3(),aimS=new THREE.Vector3(),tmp=new THREE.Vector3();let sweep=0;
 function updateFlashlights(dt){const H=police.head;
  if(S.flashOn&&jamie.active){police.spotUser.who=jamie;torch.visible=true;jamie.person.parts.rhand.getWorldPosition(hand);
   // Where Jamie points it: around the bank and the channel, at what you are looking at, at the sound.
   sweep+=dt;let target=S.lookTarget;if(!target){const k=Math.floor(sweep/3.2)%4,pts=[[97.2,14.8],[99.1,18.6],[98,12.6],[96.4,19.4]];target=side(...pts[k]);target.y=nav.groundY(target.x,target.z);}
   aim.set(target.x,(target.y??nav.groundY(target.x,target.z))+.05,target.z);if(!S.flags.aimReady){aimS.copy(aim);S.flags.aimReady=true;}else aimS.lerp(aim,1-Math.exp(-3.5*dt));jamie.lookAt={x:aimS.x,z:aimS.z,y:aimS.y};
   H.position.copy(hand);H.target.position.copy(aimS);H.angle=.31;H.penumbra=.8;H.distance=18;H.decay=2;H.intensity=clamp(hand.distanceTo(aimS)*3.3,8,25);H.color.setHex(0xfff0d6);
   beamJ.visible=true;beamJ.position.copy(hand);beamJ.lookAt(aimS);beamJ.material.uniforms.uA.value=.035;}
  else{beamJ.visible=false;if(police.spotUser.who===jamie){police.spotUser.who=null;H.intensity=0;}}
  if(officer2.visible&&officer2.gesture==='flashlight'){officer2.person.parts.rhand.getWorldPosition(tmp);const a=officer2.a+Math.sin(S.t*.7)*.6+.5,dir=new THREE.Vector3(Math.sin(a),-.32,-Math.cos(a));
   beamO.visible=true;beamO.position.copy(tmp);beamO.lookAt(tmp.x+dir.x*5,tmp.y+dir.y*5,tmp.z+dir.z*5);beamO.material.uniforms.uA.value=.03;}else beamO.visible=false;}
 function updateClue(dt){if(!clue.visible)return;let g=0;
  // Retroreflective: it lights up when a light shines on it from about where you are looking.
  if(S.flashOn){const H=police.head,L=tmp.copy(clue.position).sub(H.position),dl=L.length();L.normalize();const beam=aim.copy(H.target.position).sub(H.position).normalize();const on=beam.dot(L);
   if(on>.94&&dl<14)g=Math.max(g,smooth((on-.94)/.05)*clamp(1.4-dl/12,0,1)*Math.max(.25,smooth((camera.position.distanceTo(H.position)<4?1:0))));}
  const pl=o.playerLight;if(pl?.intensity>0){const L=tmp.copy(clue.position).sub(pl.position),dl=L.length();L.normalize();const dir=aim.copy(pl.target.position).sub(pl.position).normalize();g=Math.max(g,smooth((dir.dot(L)-Math.cos(pl.angle))/.045)*clamp(1-dl/15,0,1));}const dc=camera.position.distanceTo(clue.position);
  S.glintV=damp(S.glintV,g,8,dt);lens.emissiveIntensity=.025+S.glintV*(dc<1.6?.32:.95);glint.visible=S.glintV>.02&&dc>1.6;glint.material.opacity=S.glintV*.8*clamp(dc-1.6,0,1);}
 // ---- lifecycle ---------------------------------------------------------------------------------------------------------
 function reset(){fresh();api.pose=null;api.sources.length=0;api.deep=0;comp.reset();for(const c of comp.all)comp.release(c);police.reset();police.attach(false);
  for(const a of adults){a.show(false);a.lookAt=null;a.gest(null);a.mode='stand';a.path=null;}
  JW.set(0);SW.set(0);SD.set(0);world.alexWindow.emissiveIntensity=0;AD.set(0);AG.set(0);title(false);objective('');const el=$('objective');if(el){el.textContent='';el.classList.remove('on');}
  clue.visible=false;track.visible=false;flies.visible=false;beamJ.visible=false;beamO.visible=false;torch.visible=false;glint.visible=false;lens.emissiveIntensity=0;
  document.body?.classList?.remove('night1');ambient.night?.(false);nightRendering?.(false);roam.lock=false;roam.walkLock=false;roam.brake=0;}
 // QA and Continue: put the night exactly at one of its moments.
 function jump(section){fresh();comp.reset();nightWorld();S.flags.night=true;const put=(q,a,mode='ride',speed=0)=>placePlayer({x:q.x,z:q.z,a,mode,speed});
  const ride=(c,q,a)=>{comp.putRiding(c,q.x,q.z,a,0);c.follow='ride';};
  if(section==='ride-home'){toRideHome();go('home');}
  else if(section==='police'){const q=main(652,-2.1);put(q,heading(652)+Math.PI,'ride',4.4);date('home');go('home');S.flags.qaPolice=true;sendCruiser(300);}
  else if(section==='title'){arrivedScene();const q=main(560,-1.8);put(q,heading(560),'ride',0);date('home');go('title');S.titleT=0;}
  else if(section==='alex-house'){arrivedScene();const q=side(104,1.4);put(q,ha(104),'ride',2.5);go('briarwood');objective('See what’s happening on Briarwood.');date('briarwood');}
  else{arrivedScene();S.flags.talked=true;S.flags.alexDone=true;officer.gest('radio');
   if(section==='jamie'){const q=JWin.stand,a=headingTo(q.x,q.z,JWin.glass.x,JWin.glass.z),b=main(JH.drivD-3,-2.2);placePlayer({x:q.x-Math.sin(a)*1.4,z:q.z+Math.cos(a)*1.4,a,mode:'walk',bike:{x:b.x,z:b.z,a:heading(JH.drivD)}});go('friends');objective('Find Jamie.');date('friends');}
   else{// Jamie is with you from here on.
    S.jamieIn=true;S.flags.jamieTapped=true;
    if(section==='sam'){const q=SWin.stand,a=headingTo(q.x,q.z,SWin.glass.x,SWin.glass.z),b=main(SH.drivD+4,-2.4);placePlayer({x:q.x-Math.sin(a)*1.2,z:q.z+Math.cos(a)*1.2,a,mode:'walk',bike:{x:b.x,z:b.z,a:heading(SH.drivD)+Math.PI}});
     ride(jamie,main(SH.drivD+7.5,-2.6),heading(SH.drivD)+Math.PI);jamie.follow='ride';go('friends');objective('Find Sam.');date('sam');}
    else{S.samIn=true;S.flags.samSignal=true;S.flags.samOut=true;
     if(section==='oak'){const q=main(1112,-1.5);put(q,heading(1112),'ride',3.6);ride(jamie,main(1109,-.4),heading(1109));ride(sam,main(1106.5,-1.9),heading(1106.5));go('oak');objective('Go to the old oak.');date('oak');}
     else if(section==='retrace'){S.flags.oakTalk=true;const q=main(1128,-1.2);put(q,heading(1128)+Math.PI,'ride',2);ride(jamie,main(1131,-.2),heading(1131)+Math.PI);ride(sam,main(1133.5,-2),heading(1133.5)+Math.PI);go('retrace');objective('Go the way Alex went.');date('retrace');}
     else{S.flags.oakTalk=true;S.flags.cops=true;S.flags.r1=S.flags.r2=S.flags.r3=true;
      // At the creek: bikes left by the railing, Jamie down the bank with his flashlight, Sam with you.
      const jb=side(89.9,7.4),sb=side(87.6,6.8);comp.putFoot(jamie,side(95.3,14.3).x,side(95.3,14.3).z,ha(95)+1.2,{bike:{x:jb.x,z:jb.z,a:ha(89.9),fall:-1.36}});comp.putFoot(sam,side(90.2,10.2).x,side(90.2,10.2).z,ha(91)+1,{bike:{x:sb.x,z:sb.z,a:ha(87.6),kick:1}});
      sam.follow='walk';o.giveFlashlight?.();S.flashOn=true;S.flags.jamieSearching=true;go('creek');objective('Look around the creek.');date('creek');
      const pb=side(86.5,5.6);
      if(section==='investigation'){const q=side(91.6,8.2);placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,side(95,13).x,side(95,13).z),mode:'walk',bike:{x:pb.x,z:pb.z,a:ha(86.5)}});}
      else{const c=clue.position,q=side(97.6,14.1);placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,c.x,c.z),mode:'walk',bike:{x:pb.x,z:pb.z,a:ha(86.5)}});S.searchT=10;}}}}}
  if(!['ride-home','police','title'].includes(section))title(false);S.deep=DEEP[S.phase]??.4;api.deep=S.deep;}
 function saved(){try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');return s&&CHECKPOINT[s.section]?{section:s.section,label:CHECKPOINT[s.section]}:null;}catch{return null;}}
 // Things the player should not ride or walk through.
 function blockers(walk=false){const out=comp.blockers();for(const a of adults)if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});
  for(const c of [carA,carB])if(c.active){const fx=Math.sin(c.a),fz=-Math.cos(c.a);for(const k of [-1.55,0,1.55])out.push({x:c.x+fx*k,z:c.z+fz*k,r:1.05,speed:c.parked?0:c.v});}
  const f=jamie.f;if(!jamie.active&&f.bike.group.visible&&f.fall)out.push({x:f.bike.group.position.x,z:f.bike.group.position.z,r:.55,speed:0});return out;}
 Object.assign(api,{begin,update,reset,jump,saved,spot,act,blockers,
  attention:()=>api.target||null,canDismount:()=>!roam.lock,canRemount:()=>S.phase!=='clue',onFoot(){},
  police,carA,carB,officer,officer2,dad,mom,neighbor,adults,companions:comp,clue,track,windows:{jamie:JWin,sam:SWin},sideDoor,SECTIONS});
 Object.defineProperty(api,'state',{get(){return {phase:S.phase,t:S.t,objective:S.objective,title:S.titleT,flags:{...S.flags},siren:S.siren?{active:!!S.siren.active,mode:S.siren.mode,pitch:+(S.siren.pitch||1).toFixed(3),muffle:+(S.siren.muffle||0).toFixed(2)}:null,
   carA:{active:carA.active,parked:carA.parked,x:carA.x,z:carA.z,v:carA.v,lights:carA.lights},carB:{active:carB.active},lights:police.emergency.map(l=>+l.intensity.toFixed(1)),attached:police.attached,
   line:S.line?.text||null,speaker:speaking(),queue:S.queue.length,jamie:{active:jamie.active,mode:jamie.mode,follow:jamie.follow,x:jamie.bx,z:jamie.bz,px:jamie.px,pz:jamie.pz,visible:jamie.person.group.visible},
   sam:{active:sam.active,mode:sam.mode,follow:sam.follow,x:sam.bx,z:sam.bz,px:sam.px,pz:sam.pz,visible:sam.person.group.visible},glint:+S.glintV.toFixed(2),flash:S.flashOn,deep:+S.deep.toFixed(2),pose:!!api.pose};}});
 return api;
}
