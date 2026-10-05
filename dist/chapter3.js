// Chapter Three: what Alex heard, and then hearing it yourself. It begins a few minutes after Chapter
// Two, at the corner where Alex turned, and ends a little before midnight that same day.
//
//  Day:   "Maybe yesterday wasn't the first time." Alex's house: his mom, tired, remembers that he
//         kept asking her whether she heard a bike bell outside, the last few nights. His room, an
//         ordinary twelve-year-old's mess. His flip phone: four dumb recordings, then one from the night
//         before he disappeared: the fan, insects, a bell outside, twice, "There it is again." His
//         window looks toward the creek. Asking around: nobody heard anything, or they heard kids, or
//         dogs; Mr. Okafor next door mentions the old access road, "the pond road". At its chained gate:
//         the old bike from the oak. Sam sees it too. Its bell is rusted solid. The grass is still flat
//         where somebody wheeled it in. They will come back after dark.
//  Night: the same street at eleven, ordinary night sounds. Down the pond road the sounds go one by one,
//         until even the insects stop. The bike is gone. A bell, far off; another, somewhere else. The
//         flashlight catches something for a moment, or nothing. At the culvert's mouth, Alex's voice from
//         inside it: "Jamie?" Then from behind them: "Guys?" Then a bell right behind you, and nobody
//         there. They run. Under the streetlight on Briarwood: "That was him." "No." "You heard it." "I know."
//
// Nothing here explains the bell, the voice, the bike or Alex. chapter1.js keeps running the shared
// systems; chapter2.js hands this file every phase that starts with c3-, d3- or n3-.
import * as THREE from './three.module.js';
import {heading} from './route.js';
import {BASIN} from './layout.js';
import {smooth} from './kit.js';
import {createActor,ADULTS,headingTo,wrap} from './people.js';
import {createPerson,newPose,standPose,applyPose,poseBike,P as PI} from './rig.js';
import {CAST} from './cast.js';
import {makeOldBike} from './old-bike.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
// QA jumps, in story order (names already used by Chapters One and Two get a c3- prefix).
export const SECTIONS3=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','service-access-day','old-bike','night-start','old-bike-gone','first-bell','c3-second-bell','alex-voice','close-bell','escape','chapter3-end'];
const ALIAS3={'phone-recording':'recording','neighbor-investigation':'neighbors','service-access-night':'old-bike-gone','drainage-search':'c3-second-bell','alex-house-day':'c3-alex-house'};
// Checkpoints (silent; Continue on the title menu returns to the last one).
export const LABEL3={'chapter3-start':'Where he turned, later','c3-alex-house':'Alex’s house','alex-bedroom':'Alex’s room','phone-recording':'His recordings','neighbor-investigation':'Asking around',
 'service-access-day':'The pond road','old-bike':'The old bike','night-start':'That night','service-access-night':'The gate, at night','first-bell':'The first bell','drainage-search':'In the basin','alex-voice':'In the dark','escape':'Run','chapter3-end':'Briarwood, after'};
const DAY={start:'9:16',house:'9:24',room:'9:31',street:'9:58',road:'10:21',leave:'10:41'},NIGHT={home:'11:12',corner:'11:20',drive:'11:27',gate:'11:30',bell:'11:32',voice:'11:38',safe:'11:41'};
// What the recordings say (captions; the audio is in audio.js, timed to match).
const RECS=[
 {date:'08/07',time:'2:14P',len:'0:08',lines:[{wait:.4},{who:'RECORDING',text:'[Jamie and Sam, cracking up]',time:3.6},{who:'SAM, ON THE PHONE',text:'“Dude, do it again—”',time:2.2},{wait:2}],react:[{who:'SAM',text:'“Oh my God. I forgot about that.”',time:2.4,by:'sam'}]},
 {date:'08/11',time:'6:40P',len:'0:09',lines:[{wait:.3},{who:'RECORDING',text:'[A bike’s freewheel, ticking down]',time:5},{who:'ALEX, ON THE PHONE',text:'“That’s my new ringtone.”',time:2.4},{wait:1}],react:[{who:'JAMIE',text:'“He actually used that. For like a week.”',time:2.8,by:'jamie'}]},
 {date:'08/14',time:'8:02P',len:'0:08',lines:[{wait:.3},{who:'RECORDING',text:'[A TV downstairs. A game show. Applause.]',time:6.6},{wait:1.2}],react:[{who:'SAM',text:'“That’s just his TV.”',time:2,by:'sam'}]},
 {date:'08/18',time:'9:31P',len:'0:09',lines:[{wait:.3},{who:'RECORDING',text:'[Crickets. A sprinkler somewhere.]',time:5},{who:'ALEX, ON THE PHONE',text:'“Summer night. Very exciting.”',time:2.6},{wait:1.4}],react:[]},
 {date:'08/20',time:'11:52P',len:'0:23',lines:[{wait:.5},{who:'RECORDING',text:'[A box fan. Insects outside.]',time:5.6},{wait:1.5},{who:'RECORDING',text:'[A bike bell. Outside.]',time:2.6,mark:'bell1'},{wait:1},
  {who:'RECORDING',text:'[The bell again.]',time:2.4,mark:'bell2'},{wait:1},{who:'ALEX, ON THE PHONE',text:'“There it is again.”',time:2.6,mark:'voice'},{wait:.1},{who:'RECORDING',text:'[The bed creaks. Footsteps. The blinds.]',time:3.8},{wait:2.4}],react:[]}];

export function createChapter3(o,k,ch2){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam,mom,officer,officer2,carA,carB}=k,A=k.api,T=o.tension,police=k.police;
 const Q=world.basin,SP=Q.spots,E=BASIN,AH=world.homes.alex,R=world.interiors['alex-room'],B=nav.frame,side=k.side,main=k.main,dist=k.dist,me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go;
 for(const [p,v] of Object.entries({'c3-black':0,'d3-corner':0,'d3-street':0,'d3-mom':0,'d3-room':0,'d3-phone':0,'d3-window':0,'d3-neighbors':0,'d3-road':0,'d3-oldbike':0,'d3-plan':0,'d3-home':0,
  'c3-night':.82,'n3-home':.78,'n3-corner':.79,'n3-ride':.82,'n3-drive':.85,'n3-gate':.86,'n3-bell':.87,'n3-search':.87,'n3-culvert':.87,'n3-voice':.87,'n3-close':.87,'n3-run':.86,'n3-safe':.82,'n3-end':.82}))k.DEEP[p]=v;
 const date=(t,ampm)=>o.setDate(`AUGUST 22, 2011 <i></i> ${t} ${ampm}`);
 const checkpoint=id=>k.checkpointTo(id,LABEL3[id]);if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL3);
 const where=(p=me())=>nav.locate(p.x,p.z);
 const A3={};// the chapter's api (filled in at the end)
 // ---- people on Alex's street the morning after ------------------------------------------------------
 const N=Object.fromEntries(['huang','delaney','pruitt','okafor'].map((key,i)=>[key,createActor(scene,nav,ADULTS[key],{seed:31+i})]));
 const people=Object.values(N);
 const NSPOT={huang:{at:side(126.4,-10.4),face:side(126.4,0),gest:'fold'},delaney:{at:side(73.2,10.8),face:side(73.2,0),gest:'hips'},pruitt:{at:side(47.6,-10.6),face:side(47.6,0),gest:'fold'},okafor:{at:side(147.6,13.2),face:side(144,10),gest:null}};
 // ---- the old bike at the gate, and the marks it left ------------------------------------------------
 const old=makeOldBike();old.group.name='old-bike-at-gate';scene.add(old.group);old.group.visible=false;
 const oldAt=(()=>{const a=Q.heading-Math.PI/2;return {x:SP.bike.x,z:SP.bike.z,a};})();
 function placeOld(){const g=old.group,p=oldAt;g.position.set(p.x,nav.groundY(p.x,p.z),p.z);g.rotation.set(0,-p.a,-.2,'YXZ');old.steerAngle=-.28;old.crankAngle=1.2;old.wheel=.3;old.kickstand=0;
  poseBike(old);g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(g);g.position.y+=nav.groundY(p.x,p.z)+.005-box.min.y;g.updateMatrixWorld(true);}
 placeOld();
 const oldParts=()=>{const fx=Math.sin(oldAt.a),fz=-Math.cos(oldAt.a);return [-.5,0,.5].map(k2=>({x:oldAt.x+fx*k2,z:oldAt.z+fz*k2,r:.36,speed:0}));};
 const evidence=new THREE.Group();evidence.name='old-bike-evidence';scene.add(evidence);evidence.visible=false;
 {const flat=new THREE.MeshStandardMaterial({color:0x9a9862,roughness:1,side:THREE.DoubleSide}),mud=new THREE.MeshStandardMaterial({color:0x4a3e2e,roughness:.9,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
  // Weeds laid over along the fence where the bike stands, and a narrow tread mark from the asphalt's edge to it.
  for(let k2=0;k2<26;k2++){const u=E.bike.u-.6+k2*.06,v=E.bike.v-.35-Math.sin(k2*.7)*.12,p=Q.world(u,v),geo=new THREE.PlaneGeometry(.035,.32+((k2*7)%5)*.04);geo.rotateX(-Math.PI/2);const m=new THREE.Mesh(geo,flat);m.position.set(p.x,Q.groundAt(u,v)+.02,p.z);m.rotation.y=Q.heading+.9+((k2*13)%7-3)*.08;evidence.add(m);}
  const pts=[];for(let k2=0;k2<=16;k2++){const t=k2/16,u=E.drive.u+.9+t*(E.bike.u-E.drive.u-1)-.15*Math.sin(t*3),v=E.bike.v-4.6+t*4.3;pts.push([u,v]);}
  const pos=[],idx=[];for(let k2=0;k2<pts.length;k2++){const [u,v]=pts[k2],[u2,v2]=pts[Math.min(k2+1,pts.length-1)],[u0,v0]=pts[Math.max(k2-1,0)],du=u2-u0,dv=v2-v0,l=Math.hypot(du,dv)||1;for(const e of [-1,1]){const uu=u-dv/l*.025*e,vv=v+du/l*.025*e,p=Q.world(uu,vv);pos.push(p.x,Q.groundAt(uu,vv)+.03,p.z);}if(k2<pts.length-1){const a=k2*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mud);m.name='old-bike-tire-mark';evidence.add(m);}
 const evidenceAt=(()=>{const p=Q.world(E.bike.u-.2,E.bike.v-1.4);return {x:p.x,z:p.z,y:Q.groundAt(E.bike.u-.2,E.bike.v-1.4)};})();
 // ---- something at the edge of the light (night, for a moment; maybe nothing) ------------------------------
 const figure=createPerson({...CAST.alex,clothes:{...CAST.alex.clothes,shirt:0x3a3c3e,trim:0x3a3c3e,shorts:0x2a2c30,socks:0x3a3a3a,shoes:0x222226},hair:{...CAST.alex.hair,color:0x2a221c}});
 figure.group.name='glimpse';scene.add(figure.group);figure.group.visible=false;{const p=newPose();standPose(p,0);applyPose(figure,p);}
 const glimpseBike=makeOldBike();glimpseBike.group.name='glimpse-bike';scene.add(glimpseBike.group);glimpseBike.group.visible=false;
 const glimpseAt=(()=>{const u=163.4,v=61.1,p=Q.world(u,v);return {x:p.x,z:p.z,y:Q.groundAt(u,v)};})();
 {const a=headingTo(glimpseAt.x,glimpseAt.z,SP.outlet.x,SP.outlet.z);figure.group.position.set(glimpseAt.x,glimpseAt.y,glimpseAt.z);figure.group.rotation.y=-a;
  const b=glimpseBike.group;b.position.set(glimpseAt.x+Math.cos(a)*.55,glimpseAt.y,glimpseAt.z+Math.sin(a)*.55);b.rotation.set(0,-a,.12,'YXZ');b.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(b);b.position.y+=glimpseAt.y-box.min.y;
  figure.group.traverse(m=>{if(m.isMesh)m.castShadow=false;});}
 // A bicycle reflector catching the streetlight, far down the pond road, for an instant (the very end).
 const glint=new THREE.Sprite(new THREE.SpriteMaterial({map:k.glint.material.map,color:0xff3a22,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));glint.scale.setScalar(.16);glint.position.set(SP.gapIn.x,SP.gapIn.y+.45,SP.gapIn.z);glint.visible=false;scene.add(glint);
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
 function fresh(){Object.assign(C,{t:0,pt:0,flags:{},timers:[],inRoom:false,recSel:0,recPlaying:-1,recEnd:0,heard:[],talked:new Set(),cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,pose:null,rush:false,
  amb:{traffic:1,insects:1,wind:1,life:1},depth:0,lastEvent:0,nearT:0,glimpse:'off',glT:0,behind:null,want:null,wantT:0,loose:false,match:false,dogT:8,leftAt:null,bellTries:0,lagT:0,waitT:0});}
 fresh();
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why)T?.note(why);};
 function card(on,title='Chapter Three',eyebrow=''){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2');if(e)e.textContent=eyebrow;if(h)h.textContent=title;el.classList.add('on');}else el.classList.remove('on');C.cardOn=on;}
 const owns=ph=>typeof ph==='string'&&/^(c3|d3|n3)-/.test(ph);
 const handles=sec=>SECTIONS3.includes(sec)||!!ALIAS3[sec];
 const day=()=>/^(c3-black|d3-)/.test(S.phase);
 // ---- poses (a closer look, the window, listening at the desk) -----------------------------------------------
 function pose(at,{y,pitch=0,yaw=null,look=null}){const p=me(),a=yaw??headingTo(at.x,at.z,look.x,look.z);C.pose={w:0,x:at.x,y,z:at.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/1.1);if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);o.roam.walkLock=false;}}
 // ---- Jamie and Sam: with you on the bike or on foot, whichever you are --------------------------------------
 function follow(on,{loose=false}={}){C.match=on;C.loose=loose;}
 function match(dt){if(!C.match)return;const p=me(),want=p.riding?'ride':'walk';C.wantT=C.want===want?C.wantT+dt:0;C.want=want;
  for(const c of [jamie,sam]){if(c.script||!c.active)continue;
   if(want==='ride'){if(c.mode==='ride'){c.follow='ride';continue;}if(C.wantT<.8)continue;
    const fb=Math.hypot(c.bx-c.px,c.bz-c.pz);if(c.bike.group.visible&&fb<32){const s2={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2);
     comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:1.8}),comp.steps.turnTo(c,()=>c.ba,.45),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c)],{then:()=>{c.follow='ride';}});}
    else c.follow='walk';}
   else{if(c.mode==='foot'){c.follow=C.loose?'search':'walk';continue;}if(C.wantT<1)continue;
    // (Still rolling: they brake to a stop first, wherever they are, then get off and walk over.)
    if(c.mode==='ride')comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)],{then:()=>{c.follow=C.loose?'search':'walk';}});}}}
 const still=(...cs)=>{for(const c of cs){c.follow=null;}};
 // Put both companions somewhere for a scene (bikes stay where they are, standing).
 function putFoot(c,q,a){const bike=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.fall?0:1,fall:c.fall||0}:null;comp.putFoot(c,q.x,q.z,a,{bike});c.follow=null;c.lookAt=null;c.lookPlayer=false;}
 // ---- the night's ordinary sounds, and their going -------------------------------------------------------------
 const loopsAt={ac:[AH.toWorld(-AH.w/2-.55,-AH.depth*.2),side(46,22),main(600,-20)],tv:main(612,-16),sprinkler:side(62,13),hum:SP.pole};
 function updateAmb(dt){const ph=S.phase;if(day()||ph==='c3-night'){for(const kk in C.amb)C.amb[kk]=1;return;}
  const L=where();let d=0;if(L.street==='basin')d=clamp((L.v-9)/25,0,1);else if(L.street==='side'&&Math.abs(L.u-E.drive.u)<E.drive.fence+.5&&L.v>E.drive.v0)d=clamp((L.v-9)/25,0,1);
  if(C.rush)d=Math.max(d,1);
  const latched=['n3-drive','n3-gate','n3-bell','n3-search','n3-culvert','n3-voice','n3-close'].includes(ph);C.depth=latched?Math.max(C.depth,d):d;const D=C.depth;
  const want={traffic:1-smooth((D-.04)/.36),life:1-smooth((D-.18)/.42),insects:1-smooth((D-.34)/.5),wind:1-.55*smooth((D-.5)/.4)};
  for(const kk in want){const up=want[kk]>C.amb[kk];C.amb[kk]=damp(C.amb[kk],want[kk],up?.35:C.rush?.9:.3,dt);}
  // A dog now and then, far off, while the street still sounds like itself.
  C.dogT-=dt;if(C.dogT<=0){C.dogT=22+((C.t*7.3)%14);if(C.amb.life>.6&&/^n3-(home|corner|ride|safe)$/.test(ph)){const p=me();o.sfx('dog',{x:p.x+40,y:2,z:p.z-55},{gain:.5*C.amb.life});}}}
 // ---- scenes ---------------------------------------------------------------------------------------------------
 function dayWorld(){A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.nightRendering?.(false);ambient.night?.(false);ambient.morning?.(true);
  old.group.visible=true;placeOld();evidence.visible=true;figure.group.visible=false;glimpseBike.group.visible=false;
  // Alex's mom on the porch; the neighbors in their yards.
  const door=AH.toWorld(AH.doorX+1.15,AH.stepFront+.85);mom.show(true);mom.place(door.x,door.z,headingTo(door.x,door.z,side(127,0).x,side(127,0).z));mom.gest('fold');mom.lookAt=null;// at the foot of the porch steps
  for(const [key,a] of Object.entries(N)){const q=NSPOT[key];a.show(true);a.place(q.at.x,q.at.z,headingTo(q.at.x,q.at.z,q.face.x,q.face.z));a.gest(q.gest);a.lookAt=null;}
  world.doors.alex?.set(0);}
 function nightWorld(){A.day=0;A.night=1;ch2.day=0;S.deep=A.deep=.8;o.nightRendering?.(true);ambient.morning?.(false);ambient.night?.(true);document.body?.classList?.add('night1');S.flags.night=true;
  for(const a of [...k.adults,...ch2.extra,...people])a.show(false);for(const b of ch2.beams){b.on=false;}ch2.found.group.visible=false;ch2.tape.visible=false;ch2.flyers.visible=true;
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;old.group.visible=false;evidence.visible=true;
  // The police have gone for the night; only his window is lit.
  police.reset?.();carA.show(false);carB.show(false);
  world.alexWindow.emissiveIntensity=.85;world.doors.alex?.set(0);o.setFlashlight?.(true,false);S.flashOn=true;}
 // ---- the day ----------------------------------------------------------------------------------------------------
 function begin(){fresh();go('c3-black');C.cardT=0;o.fade(1);dayWorld();S.lookTarget=null;S.jamieAim=null;S.samAim=null;objective('');T?.reset();
  for(const c of [jamie,sam]){c.lookAt=null;c.lookPlayer=false;}}
 function opening(){go('d3-corner');date(DAY.start,'AM');C.fadeIn=0;
  talk([{wait:2.6},{who:'JAMIE',text:'“If Alex heard it before he left…”',from:jamie,time:2.6,gap:.9},{who:'SAM',text:'“What?”',from:sam,time:1.4,gap:1},
   {who:'JAMIE',text:'“Maybe yesterday wasn’t the first time.”',from:jamie,time:2.8,gap:1.6},
   {who:'SAM',text:'“Like… he heard it other nights?”',from:sam,time:2.4},{who:'JAMIE',text:'“I don’t know.”',from:jamie,time:1.6,gap:.8},
   {who:'YOU',text:'“His mom would know.”',time:2},{who:'SAM',text:'“We can’t just go bug his mom right now.”',from:sam,time:2.6},
   {who:'JAMIE',text:'“She knows us. Come on.”',from:jamie,time:2}],
   {then:()=>{go('d3-street');objective('Go to Alex’s house.','Down Briarwood, around the bend past the creek.');checkpoint('chapter3-start');follow(true);}});}
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
  // Leaning over the desk, close enough to read the little screen.
  pose(at,{y:nav.groundY(at.x,at.z)+1.12,pitch:-.74,look:ph});jamie.lookAt=ph;sam.lookAt=ph;}
 function playRec(){if(C.recPlaying>=0)return;const i=C.recSel,R2=RECS[i];if(!R2)return;C.recPlaying=i;drawScreen();const dur=o.audio()?.recording?.(i,phone.position)||[8.6,9,8.2,9.4,23.5][i];C.recEnd=C.t+dur;C.heard.push(i);
  if(i===4){T?.set(.12,{rise:.05,why:'the last recording'});}
  talk(R2.lines.map(l=>l.mark?{...l,act:()=>{if(l.mark==='bell1'){T?.set(.24,{rise:.08,why:'recorded bell'});}else if(l.mark==='bell2')T?.set(.29,{rise:.08,why:'recorded bell again'});else T?.set(.31,{rise:.06,why:'“there it is again”'});}}:l),{interrupt:true});}
 function recDone(){const i=C.recPlaying;C.recPlaying=-1;C.recSel=Math.min(RECS.length-1,i+1);drawScreen();const R2=RECS[i];
  if(i<4){if(R2.react.length)talk(R2.react.map(l=>({...l,from:l.by==='sam'?sam:jamie})));if(i===3)C.recSel=4;drawScreen();return;}
  // The last one.
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
   {then:()=>{unpose();objective('Ask around near the creek.','His street. Somebody else had to hear it.');C.flags.canLeave=true;}});}
 function leaveRoom(){if(C.fadeOut>=0)return;C.fadeOut=0;C.after=()=>{exitRoom();C.fadeIn=0;};}
 function exitRoom(){roomOn(false);phone.visible=false;if(C.recPlaying>=0){C.recPlaying=-1;o.audio()?.stopRecording?.();}go('d3-neighbors');date(DAY.street,'AM');checkpoint('neighbor-investigation');
  const out=AH.toWorld(AH.doorX,AH.stepFront+1.3),street=side(127,0),a=headingTo(out.x,out.z,street.x,street.z),r=o.roam;o.placePlayer({x:out.x,z:out.z,a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});
  const j=AH.toWorld(AH.doorX-1.4,AH.stepFront+1.1),s2=AH.toWorld(AH.doorX+1.3,AH.stepFront+.9);putFoot(jamie,j,a);putFoot(sam,s2,a);follow(true);
  objective('Ask around near the creek.','His street. Somebody else had to hear it.');}
 // ---- asking around ---------------------------------------------------------------------------------------------
 const SAY={huang:[['MR. HUANG','“Morning, boys. Any news?”'],['JAMIE','“No.”'],['YOU','“Did you ever hear a bike bell? At night, the last few nights?”'],['MR. HUANG','“A bell? No. I’m asleep by ten. Earplugs.”'],['MR. HUANG','“I hope they find him. I really do.”']],
  delaney:[['MRS. DELANEY','“You boys shouldn’t be out riding around today.”'],['YOU','“Did you hear a bike bell at night? Like, late?”'],['MRS. DELANEY','“There’s always somebody out there late. Teenagers, cutting through by the creek.”'],['MRS. DELANEY','“I’ve called the city about it twice.”'],['SAM','“Okay. Thanks.”']],
  pruitt:[['MR. PRUITT','“Hey, guys.”'],['JAMIE','“Did you hear anything Saturday night? Like a bike bell?”'],['MR. PRUITT','“A bell, no. The dogs were going nuts around midnight, though. Every dog on the street.”'],['MR. PRUITT','“Probably a raccoon.”']],
  okafor:[['MR. OKAFOR','“You’re Alex’s friends.”'],['YOU','“Did you ever hear a bike bell at night?”'],['MR. OKAFOR','“…Yes. A few nights this week. Late.”'],['MR. OKAFOR','“I figured it was some kid out on the pond road.”'],['JAMIE','“The what?”'],
   ['MR. OKAFOR','“The old access road. Right there, between my yard and theirs.”','point'],['MR. OKAFOR','“It runs back to the retention pond. The big drain from the creek comes out back there.”'],['MR. OKAFOR','“The city used to mow it. Not anymore. You boys stay out of there.”']]};
 function askNeighbor(key){if(C.talked.has(key)||busy())return;C.talked.add(key);const a=N[key],p=me();a.gest(null);a.faceTo(p.x,p.z);a.lookAt=camera.position;for(const c of [jamie,sam])c.lookAt=a.pos;
  const by={JAMIE:jamie,SAM:sam,YOU:null};
  talk(SAY[key].map(([who,text,g])=>({who,text,from:by[who]===undefined?a:by[who],act:g==='point'?()=>{a.gest('point',SP.driveMouth);}:null,gap:.5})),{range:9,from:a,then:()=>{a.lookAt=null;a.gest(NSPOT[key].gest);for(const c of [jamie,sam])c.lookAt=null;
   if(key==='okafor'){C.flags.okafor=true;go('d3-road');objective('Find the old pond road.','Between Alex’s yard and Mr. Okafor’s.');}
   else if(!C.flags.okafor&&C.talked.size>=2&&!C.flags.nudgeOkafor){C.flags.nudgeOkafor=true;talk([{wait:1.2},{who:'JAMIE',text:'“What about Mr. Okafor? Next door. His yard goes way back.”',from:jamie,time:3}]);objective('Ask around near the creek.','Mr. Okafor, next door to Alex.');}}});
}
 // ---- the pond road and the old bike -----------------------------------------------------------------------------
 const onDrive=(L=where())=>(L.street==='basin'&&L.v<E.fence.v0)||(L.street==='side'&&Math.abs(L.u-E.drive.u)<E.drive.fence&&L.v>E.drive.v0-1);
 function oldBikeSeen(){if(C.flags.oldBike)return;C.flags.oldBike=true;go('d3-oldbike');checkpoint('old-bike');objective('');const b=old.group.position;
  for(const c of [jamie,sam]){c.lookAt=b;}still(jamie,sam);T?.set(.22,{rise:.12,why:'the old bike'});
  talk([{who:'JAMIE',text:'“That’s it.”',from:jamie,time:1.6,gap:.9},{who:'SAM',text:'“What?”',from:sam,time:1.2,gap:.8},{who:'JAMIE',text:'“The bike. From the oak.”',from:jamie,time:2.2,gap:2.2},
   {who:'JAMIE',text:'“You said it wasn’t there.”',from:jamie,time:2,gap:.6},{who:'SAM',text:'“I said I didn’t remember it.”',from:sam,time:2.4,gap:1.6},
   {who:'SAM',text:'“…That’s not the same bike.”',from:sam,time:2.2,gap:.8},{who:'YOU',text:'“It’s the same bike.”',time:2}],
   {then:()=>{objective('Look at the bicycle.');C.flags.canInspect=true;follow(true);}});}
 function inspectOld(){if(C.flags.inspected)return;C.flags.inspected=true;objective('');const b=old.group.position,p=me(),a=headingTo(p.x,p.z,b.x,b.z),at={x:b.x-Math.sin(a)*.85,z:b.z+Math.cos(a)*.85};
  pose(at,{y:nav.groundY(at.x,at.z)+.92,pitch:-.42,look:b});still(jamie,sam);
  talk([{wait:1},{who:'YOU',text:'“It’s old. Like, really old.”',time:2.2},{who:'JAMIE',text:'“There’s a sticker. ‘Bicycle license.’ Number four-one-seven.”',from:jamie,time:3.4},
   {who:'SAM',text:'“The year’s rubbed off.”',from:sam,time:2}],{then:()=>{objective('Try the bell.');C.flags.canBell=true;C.bellWait=0;}});}
 function tryBell(by='you'){if(!C.flags.canBell)return;C.bellTries++;const lever=old.bell.lever,bp=old.steer.localToWorld(old.bell.position.clone());
  lever.rotation.x=-.07;later(.16,()=>{lever.rotation.x=0;});o.sfx('oldBell',{x:bp.x,y:bp.y,z:bp.z},{gain:.9});
  if(C.bellTries===1)talk([{wait:.9},{who:'JAMIE',text:by==='jamie'?'“Huh.”':'“Again.”',from:jamie,time:1.4}]);
  if(C.bellTries>=2&&!C.flags.belled){C.flags.belled=true;C.flags.canBell=false;objective('');
   talk([{wait:.8},{who:'SAM',text:'“It doesn’t even ring.”',from:sam,time:2},{who:'JAMIE',text:'“It’s rusted solid. The thing barely moves.”',from:jamie,time:2.8,gap:1.4},
    {who:'SAM',text:'“So it wasn’t this one.”',from:sam,time:2.2,gap:1.6},{who:'JAMIE',text:'“Then what was it?”',from:jamie,time:2,gap:2},
    {who:'SAM',text:'“Look. The grass.”',from:sam,time:1.8,act:()=>{S.lookTarget=evidenceAt;sam.lookAt=evidenceAt;jamie.lookAt=evidenceAt;unpose();}},
    {who:'JAMIE',text:'“Somebody wheeled it in here. Like, today.”',from:jamie,time:2.6},{who:'YOU',text:'“From the road.”',time:1.8,gap:2.4,act:()=>{S.lookTarget=null;}}],
    {then:plan});}}
 function plan(){go('d3-plan');for(const c of [jamie,sam])c.lookAt=null;T?.ease(0,{fall:.06});
  talk([{who:'JAMIE',text:'“We have to come back tonight.”',from:jamie,time:2.2},{who:'SAM',text:'“No.”',from:sam,time:1.2,gap:.8},
   {who:'JAMIE',text:'“He recorded it at night. We heard it at night.”',from:jamie,time:2.8},{who:'SAM',text:'“The police literally drove us home last night.”',from:sam,time:2.8},
   {who:'JAMIE',text:'“So we don’t get caught.”',from:jamie,time:1.8},{who:'SAM',text:'“Alex is missing. Like, actually missing. And you want to come back here in the dark?”',from:sam,time:4.2,gap:1.2},
   {who:'JAMIE',text:'“You don’t have to come.”',from:jamie,time:1.8,gap:2.6},{who:'SAM',text:'“…If anything happens, we leave. Right away. I’m serious.”',from:sam,time:3.4},
   {who:'JAMIE',text:'“Eleven. The corner. Bring a flashlight.”',from:jamie,time:2.6}],
   {then:()=>{go('d3-home');objective('Go home.','Tonight: the corner of Oak Hollow and Briarwood.');date(DAY.leave,'AM');C.leftAt={...me()};C.homeT=0;follow(true);}});}
 // ---- the night ------------------------------------------------------------------------------------------------
 const home=()=>ch2.homeHouse;
 function toNight(){go('c3-night');C.cardT=0;card(true,'That night');}
 function nightStart(){go('n3-home');nightWorld();C.amb={traffic:1,insects:1,wind:1,life:1};C.depth=0;T?.reset();T?.set(.04,{why:'night, home'});date(NIGHT.home,'PM');checkpoint('night-start');
  const h=home(),q=main(h.drivD-.4,h.side*10.2),b=main(h.drivD+.5,h.side*9.4),look=main(h.drivD+14,h.side*2),road=main(h.drivD+.5,0);
  o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,look.x,look.z),mode:'walk',bike:{x:b.x,z:b.z,a:headingTo(b.x,b.z,road.x,road.z)}});o.setFlashlight?.(true,false);
  comp.reset();const jq=main(598.5,4.4),sq=main(600.4,2.2);comp.putRiding(jamie,jq.x,jq.z,heading(598.5)+Math.PI*.9,0);comp.putRiding(sam,sq.x,sq.z,heading(600.4)-Math.PI*.3,0);
  for(const c of [jamie,sam]){c.follow=null;c.lookAt=null;}follow(false);
  objective('Meet Jamie and Sam at the corner.','Oak Hollow and Briarwood. Eleven.');C.fadeIn=0;
  talk([{wait:4.5},{who:'',text:'The house was dark. Nobody heard me go.',time:4.2}]);}
 function meet(){if(C.flags.met)return;C.flags.met=true;go('n3-corner');date(NIGHT.corner,'PM');for(const c of [jamie,sam])c.lookPlayer=true;
  talk([{who:'JAMIE',text:'“You came.”',from:jamie,time:1.6},{who:'SAM',text:'“My mom checks on me at like one. We have to be back way before that.”',from:sam,time:3.6},{who:'JAMIE',text:'“We will.”',from:jamie,time:1.4,gap:.8},
   {who:'JAMIE',text:'“Come on. Lights off till we’re past his house.”',from:jamie,time:2.6}],
   {then:()=>{for(const c of [jamie,sam])c.lookPlayer=false;go('n3-ride');objective('Go to the pond road.','Past Alex’s house.');follow(true);T?.set(.08,{rise:.02,why:'riding there'});}});}
 function driveIn(){if(C.flags.drive)return;C.flags.drive=true;go('n3-drive');date(NIGHT.drive,'PM');objective('Go down the pond road.');T?.set(.14,{rise:.03,why:'the pond road'});
  ch2.samBeam.on=true;follow(true);}
 function quiet(){C.flags.quiet=true;T?.set(.3,{rise:.04,why:'everything stopped'});
  talk([{who:'SAM',text:'“Why’d everything stop?”',from:sam,time:2.2,gap:1},{who:'JAMIE',text:'“Stop what?”',from:jamie,time:1.4,gap:.9},{who:'SAM',text:'“The bugs. Listen.”',from:sam,time:2}]);}
 function gateEmpty(){if(C.flags.gone)return;C.flags.gone=true;go('n3-gate');date(NIGHT.gate,'PM');checkpoint('service-access-night');objective('');const b=SP.bike;
  for(const c of [jamie,sam])c.lookAt=b;S.jamieAim=b;still(jamie,sam);T?.set(.38,{rise:.08,why:'the bike is gone'});
  // Whoever is behind comes up beside you at the gate (the first line waits for them, a few seconds at most).
  let late=.6;{const p=me(),a=headingTo(p.x,p.z,b.x,b.z),rx=Math.cos(a),rz=Math.sin(a);
   for(const [c,sd,bk] of [[jamie,-1.1,.5],[sam,1.2,1.1]]){if(c.mode!=='foot'||c.script)continue;const q={x:p.x+rx*sd-Math.sin(a)*bk,z:p.z+rz*sd+Math.cos(a)*bk},far=Math.hypot(q.x-c.px,q.z-c.pz);if(far<1.2||!nav.walkable(q.x,q.z,{r:.3}))continue;
    const path=nav.walkPath({x:c.px,z:c.pz},q);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[q.x,q.z]],{speed:far>5?2.6:1.6}),comp.steps.turnTo(c,()=>headingTo(c.px,c.pz,b.x,b.z),.4)],{then:()=>{c.lookAt=b;}});late=Math.max(late,Math.min(5,far/(far>5?2.4:1.5)));}}
  talk([{wait:late},{who:'JAMIE',text:'“It was right here.”',from:jamie,time:2,gap:2.4},{who:'SAM',text:'“Okay. I saw it this time.”',from:sam,time:2.4,gap:1.8},
   {who:'JAMIE',text:'“Somebody moved it again.”',from:jamie,time:2.2,gap:.4},{who:'SAM',text:'“Or it moved itself, and we go home.”',from:sam,time:2.6}],
   {then:()=>{S.jamieAim=null;for(const c of [jamie,sam])c.lookAt=null;follow(true,{loose:true});C.waitFrom=C.t;}});}
 // Bells: the ordinary bell, somewhere it should not be. Where each one rings from.
 const at3=(u,v,y)=>{const p=Q.world(u,v);return {x:p.x,z:p.z,y:(y??Q.groundAt(u,v))+1.1};};
 const BELL1=at3(E.outlet.u-5,E.outlet.v,E.bottom.y),BELL2=[at3(E.outlet.u-2.6,E.outlet.v+7.5,Q.topY),at3(163.4,61.2)];
 function bellOne(){if(C.flags.bell1)return;C.flags.bell1=true;go('n3-bell');date(NIGHT.bell,'PM');checkpoint('first-bell');mark('first bell');C.bell1At=C.t;
  o.audio()?.bell3?.(BELL1,1.35,{tunnel:true,ref:5});C.heardBells=(C.heardBells||[]).concat([{pos:BELL1,at:C.t,tunnel:true}]);T?.jolt(.52,{rise:.7,hold:3,why:'a bell, far off'});
  still(jamie,sam);for(const c of [jamie,sam])c.lookAt=BELL1;S.jamieAim=null;later(.3,()=>{S.jamieAim=SP.outlet;});
  talk([{wait:2.2},{who:'JAMIE',text:'“Did you hear that?”',from:jamie,time:1.8,gap:.6},{who:'SAM',text:'“No. No, I didn’t.”',from:sam,time:1.8,gap:1},
   {who:'JAMIE',text:'“It came from over there. In the pond.”',from:jamie,time:2.4},{who:'SAM',text:'“Then we go the other way.”',from:sam,time:2}],
   {interrupt:true,then:()=>{S.jamieAim=null;for(const c of [jamie,sam])c.lookAt=null;objective('Find where the bell came from.');go('n3-search');follow(true,{loose:true});T?.ease(.46,{fall:.03});}});}
 function bellTwo(){if(C.flags.bell2)return;C.flags.bell2=true;checkpoint('drainage-search');mark('second bell');o.audio()?.bell3?.(BELL2[0],.95,{ref:5});C.heardBells=(C.heardBells||[]).concat([{pos:BELL2[0],at:C.t}]);
  T?.jolt(.6,{rise:.6,hold:3,why:'closer bell'});still(jamie,sam);for(const c of [jamie,sam])c.lookAt=BELL2[0];
  later(2.8,()=>{o.audio()?.bell3?.(BELL2[1],.85,{ref:5});C.heardBells.push({pos:BELL2[1],at:C.t});T?.set(.62,{why:'the bell, somewhere else'});for(const c of [jamie,sam])c.lookAt=BELL2[1];S.jamieAim=BELL2[1];});
  talk([{wait:4.6},{who:'JAMIE',text:'“It moved.”',from:jamie,time:1.6,gap:.8},{who:'SAM',text:'“Bells don’t move.”',from:sam,time:1.8}],{then:()=>{S.jamieAim=null;for(const c of [jamie,sam])c.lookAt=null;follow(true,{loose:true});C.glimpse='armed';C.glimpseFrom=C.t;}});}
 function voiceOne(){if(C.flags.voice1)return;C.flags.voice1=true;go('n3-voice');date(NIGHT.voice,'PM');checkpoint('alex-voice');mark('Alex’s voice');C.v1At=C.t;C.glimpse=C.glimpse==='showing'?'gone':C.glimpse==='armed'?'off':C.glimpse;
  o.audio()?.voice?.('jamie',SP.deep,{gain:1,tunnel:true,ref:3});C.voices=[{word:'jamie',pos:SP.deep,at:C.t,tunnel:true}];T?.jolt(.84,{rise:.9,hold:6,why:'Alex’s voice, inside'});
  still(jamie,sam);for(const c of [jamie,sam])c.lookAt=SP.outlet;S.jamieAim=SP.outlet;S.samAim=SP.outlet;
  // Sam takes a step back from the pipe.
  {const sp={x:sam.px,z:sam.pz},a=headingTo(SP.outlet.x,SP.outlet.z,sp.x,sp.z),q={x:sp.x+Math.sin(a)*.9,z:sp.z-Math.cos(a)*.9};if(sam.mode==='foot'&&nav.walkable(q.x,q.z))comp.run(sam,[comp.steps.walkTo(sam,[[q.x,q.z]],{speed:.9}),comp.steps.idle(sam,.3)],{then:()=>{sam.lookAt=SP.outlet;}});}
  talk([{who:'ALEX’S VOICE',text:'“Jamie?”',time:1.6,gap:1.8},{who:'JAMIE',text:'“…Alex?”',from:jamie,time:1.6,gap:.7},{who:'SAM',text:'“No. No no no.”',from:sam,time:1.8,gap:.9},
   {who:'JAMIE',text:'“Alex! It’s us! Alex?”',from:jamie,time:2.4}],{interrupt:true,then:()=>{C.waitV2=0;}});}
 function behindPoint(){const p=camera.position,f=new THREE.Vector3();camera.getWorldDirection(f);const cands=[SP.gapIn,at3(163,44.6),at3(165.1,53),SP.gap,at3(152,44.2)];let best=null,bd=1e9;
  for(const q of cands){const dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz);if(l<8)continue;const dot=(dx*f.x+dz*f.z)/l/Math.hypot(f.x,f.z);if(dot<bd){bd=dot;best=q;}}
  best=best||SP.gapIn;return {x:best.x,y:(best.y??nav.groundY(best.x,best.z))+(best.y?0:1.3),z:best.z,dot:bd};}
 function voiceTwo(){if(C.flags.voice2)return;C.flags.voice2=true;mark('Alex’s voice, behind');const q=behindPoint();C.behind=q;C.v2At=C.t;
  o.audio()?.voice?.('guys',q,{gain:1.05,ref:3});C.voices.push({word:'guys',pos:q,at:C.t,dotFromView:q.dot});T?.jolt(.93,{rise:1.2,hold:8,why:'his voice, behind them'});
  for(const c of [jamie,sam]){c.lookAt=q;c.script=null;}S.jamieAim=q;S.samAim=q;
  talk([{who:'ALEX’S VOICE',text:'“Guys?”',time:1.4,gap:1.6},{who:'SAM',text:'“That came from back there.”',from:sam,time:2}],{interrupt:true,then:()=>{go('n3-close');C.closeWait=0;}});}
 function closeBell(){if(C.flags.close)return;C.flags.close=true;mark('the bell, right behind');const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();
  const p=camera.position,q={x:p.x-f.x*1.15,y:p.y-.25,z:p.z-f.z*1.15};C.closeAt=q;C.closeT=C.t;o.audio()?.bell3?.(q,.62,{ref:1});C.heardBells.push({pos:q,at:C.t,close:true});
  T?.jolt(1,{rise:2,hold:30,why:'the bell, right behind'});for(const c of [jamie,sam])c.lookAt=q;S.jamieAim=q;S.samAim=q;
  talk([{wait:.35},{who:'SAM',text:'“RUN!”',from:sam,time:1},{who:'JAMIE',text:'“Go! Go!”',from:jamie,time:1.2,act:run}],{interrupt:true});}
 // ---- the escape ---------------------------------------------------------------------------------------------
 const exitPath=[SP.gapIn,SP.gap,SP.gapOut,SP.driveEnd,SP.driveMid,SP.driveMouth];
 function run(){if(C.flags.run)return;C.flags.run=true;go('n3-run');checkpoint('escape');objective('Run.');S.jamieAim=null;S.samAim=null;o.setDrain?.(.42);follow(false);C.runT=0;
  const safe=[side(E.drive.u-2.4,3.4),side(E.drive.u+2.2,2.2)];
  [jamie,sam].forEach((c,i)=>{c.lookAt=null;const start={x:c.px,z:c.pz},inside=where(start).street==='basin'&&where(start).v>E.fence.v0;const lead=inside?nav.walkPath(start,SP.gapIn):[];
   const pts=[...(inside?(lead.length?lead:[[SP.gapIn.x,SP.gapIn.z]]):[]),...exitPath.slice(inside?1:2).map(q=>[q.x,q.z]),[safe[i].x,safe[i].z]];
   const inner=comp.steps.walkTo(c,pts,{speed:i?3.25:3.5});c.fled=false;
   comp.run(c,[comp.steps.wait(i?.45:.1),(dt,ctx)=>{const p=ctx.player,ahead=Math.hypot(c.px-p.x,c.pz-p.z),Lc=where({x:c.px,z:c.pz}),Lp=where(p);
    // Out ahead of you and you are not coming: slow down and look back (never leave you behind).
    const lag=ahead>8&&((Lp.v??0)>(Lc.v??0)||Lc.street!=='basin');const k2=lag?.25:1;if(lag)c.lookAt=camera.position;else c.lookAt=null;
    if(!c.fled&&Lc.street==='basin'&&Lc.v<E.fence.v0-.2&&Math.abs(Lc.u-SP.gap.u)<1.4){c.fled=true;o.sfx('fence',SP.gap,{gain:.8});}return inner(dt*k2,ctx);},comp.steps.idle(c,.4)],{then:()=>{c.lookAt=camera.position;}});});}
 function safeNow(){if(C.flags.safe)return;C.flags.safe=true;go('n3-safe');date(NIGHT.safe,'PM');checkpoint('chapter3-end');objective('');o.setDrain?.(1);
  T?.ease(.42,{fall:.035,hold:5,why:'the street, the light'});
  for(const [c,dx] of [[jamie,-1.4],[sam,1.3]]){const p=me(),q={x:p.x+Math.cos(p.a)*dx+Math.sin(p.a)*.6,z:p.z+Math.sin(p.a)*dx-Math.cos(p.a)*.6};if(c.mode==='foot'){const path=nav.walkPath({x:c.px,z:c.pz},q);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[q.x,q.z]],{speed:2}),bentOver(c,9)],{then:()=>{c.lookAt=SP.gate;}});}}
  talk([{wait:4.2},{who:'SAM',text:'“That was him.”',from:sam,time:2,gap:1.2},{who:'JAMIE',text:'“No.”',from:jamie,time:1.2,gap:1.4},{who:'SAM',text:'“You heard it. It said your name.”',from:sam,time:2.6,gap:1.2},
   {who:'JAMIE',text:'“I know.”',from:jamie,time:1.6,gap:3.2},{who:'YOU',text:'“It was right behind us.”',time:2.4,gap:2.6},
   {act:()=>{S.lookTarget=SP.gate;for(const c of [jamie,sam])c.lookAt=SP.gate;S.jamieAim=SP.gate;},wait:3.4},{act:()=>{C.glintT=0;},wait:2.8},{act:()=>{C.endT=0;},wait:.1}]);}
 // Hands on knees, catching their breath, then standing.
 function bentOver(c,t){let e=0;return (dt,ctx)=>{e+=dt;standPose(c.pose,ctx.clock+c.R.phase,{look:0});const w=smooth(e/.5)*(1-smooth((e-t+1)/1));c.pose[PI.root+1]-=.12*w;c.pose[PI.lean]+=.55*w;for(const o2 of [PI.lh,PI.rh]){c.pose[o2+1]-=.38*w;c.pose[o2+2]-=.18*w;}
  c.pose[PI.root+1]+=Math.sin(e*5.5)*.008*w;comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p');if(h)h.innerHTML='Chapter Three';if(pp)pp.textContent='August 22, 2011.';}o.finish();}
 // ---- every frame ------------------------------------------------------------------------------------------
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase,p=me(),L=where(p);
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  for(const a of people)a.update(dt,{eye:camera.position});updatePose(dt);match(dt);updateAmb(dt);
  // fades: in, out (then whatever comes after)
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.4));if(C.fadeIn>=1.4){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.7));if(C.fadeOut>=.9){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(ph==='c3-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<4.4&&!C.cardOn)card(true);if(C.cardT>4.4&&C.cardOn)card(false);if(C.cardT>5.6)opening();}
  else if(ph==='d3-street'){if(L.street==='side'&&L.u>104&&dist(p,momSpot())<22&&!C.flags.atHouse){C.flags.atHouse=true;checkpoint('c3-alex-house');date(DAY.house,'AM');objective('Talk to Alex’s mom.');mom.lookAt=camera.position;}
   if(C.flags.atHouse&&dist(p,momSpot())<6&&!busy()){C.nearMom=(C.nearMom||0)+dt;if(C.nearMom>7)momTalk();}}
  else if(ph==='d3-room'){C.roomT+=dt;const ph2=phone.position;if(!C.flags.phoneSeen&&!busy()&&(C.roomT>18||(dist(p,ph2)<1.9&&C.roomT>4)||(C.roomT>5&&k.camLooksAt({x:ph2.x,y:ph2.y,z:ph2.z},.92))))phoneNoticed();}
  else if(ph==='d3-phone'){if(C.recPlaying>=0&&C.t>=C.recEnd&&!busy())recDone();}
  else if(ph==='d3-window'){const st=RW(R.sideWindow.x,R.sideWindow.z),lk=RW(R.sideWindow.look.x,R.sideWindow.look.z);
   if(!C.flags.window&&dist(p,st)<1.1&&k.camLooksAt({x:lk.x,y:st.y+.2,z:lk.z},.82)){C.winT=(C.winT||0)+dt;if(C.winT>1.1)lookOut();}else C.winT=0;}
  else if(ph==='d3-neighbors'){if(!C.flags.wander&&!busy()&&L.street==='main'&&dist(p,side(20,0))>60){C.flags.wander=true;talk([{who:'JAMIE',text:'“His street. Somebody on his street.”',from:jamie,time:2.4}]);}}
  else if(ph==='d3-road'){if(onDrive(L)&&!C.flags.onRoad){C.flags.onRoad=true;checkpoint('service-access-day');date(DAY.road,'AM');objective('Follow it back.');talk([{who:'JAMIE',text:'“I always thought this was just somebody’s driveway.”',from:jamie,time:2.6}]);}
   const b=old.group.position,db=dist(p,b);if(C.flags.onRoad&&(db<7||(db<16&&k.camLooksAt({x:b.x,y:b.y+.4,z:b.z},.93))))oldBikeSeen();}
  else if(ph==='d3-oldbike'){if(C.flags.canBell&&!C.flags.belled&&!busy()){C.bellWait+=dt;if(C.bellWait>16&&C.bellTries===0){C.bellWait=-99;jamie.lookAt=old.group.position;tryBell('jamie');later(1.6,()=>tryBell('jamie'));}}}
  else if(ph==='d3-home'){C.homeT+=dt;const away=dist(p,C.leftAt);if(!C.flags.leaving&&(away>15||C.homeT>45)){C.flags.leaving=true;C.fadeOut=0;C.after=()=>{o.fade(1);toNight();};}}
  else if(ph==='c3-night'){C.cardT+=dt;if(C.cardT>3.6&&C.cardOn)card(false);if(C.cardT>4.8)nightStart();}
  else if(ph==='n3-home'){const jp={x:jamie.bx,z:jamie.bz};if(dist(p,jp)<15&&!busy())meet();}
  else if(ph==='n3-ride'){if(onDrive(L)||(L.street==='side'&&Math.abs(L.u-E.drive.u)<9&&L.v>-.5)||dist(p,SP.driveMouth)<6)driveIn();}
  if(['n3-drive','n3-gate'].includes(ph)&&!C.flags.quiet&&C.amb.insects<.4&&!busy())quiet();
  // At the gate: if the quiet has not been noticed yet (somebody ran), it is now, and then the empty gate.
  if(ph==='n3-drive'){if(L.street==='basin'&&L.v>E.fence.v0-7&&(dist(p,SP.bike)<6.5||L.v>E.fence.v0)){if(!C.flags.quiet){C.rush=true;if(!busy())quiet();}else if(!busy())gateEmpty();}}
  if(ph==='n3-gate'&&C.waitFrom!==undefined&&!busy()&&C.t-C.waitFrom>6.5&&(L.street==='basin'&&L.v>E.fence.v0-8))bellOne();
  if(ph==='n3-search'){const inside=L.street==='basin'&&L.v>E.fence.v0+.4;if(inside)C.inT=(C.inT||0)+dt;
   if(!inside&&!busy()&&!C.flags.gapHint&&C.t-C.bell1At>14){C.flags.gapHint=true;talk([{who:'JAMIE',text:'“Here. The fence is bent back by the gate.”',from:jamie,time:2.6,act:()=>{S.jamieAim=SP.gap;}},{act:()=>{S.jamieAim=null;},wait:.1}]);}
   if(!C.flags.bell2&&!busy()&&C.t-C.bell1At>14&&inside&&(dist(p,SP.apron)<17||C.inT>22))bellTwo();
   if(C.flags.bell2&&!C.flags.voice1&&C.t-C.lastEvent>6.5&&!busy()&&inside&&dist(p,SP.apron)<9.5){C.nearT+=dt;if(!C.flags.expect){C.flags.expect=true;T?.set(.66,{rise:.05,why:'the culvert mouth, waiting'});}
    if(C.nearT>4.5&&(k.camLooksAt(SP.outlet,.55)||C.nearT>9))voiceOne();}else if(C.flags.bell2&&!C.flags.voice1)C.nearT=Math.max(0,C.nearT-dt*.5);
   // The temporary quiet after the second bell and whatever the light caught.
   if(C.flags.bell2&&!C.flags.eased&&C.t-C.lastEvent>9&&!C.flags.expect){C.flags.eased=true;T?.ease(.55,{fall:.04,why:'nothing, for a while'});}}
  if(ph==='n3-voice'&&C.waitV2!==undefined&&!busy()){C.waitV2+=dt;if(C.waitV2>3.4&&(k.camLooksAt(SP.outlet,.5)||C.waitV2>7.5))voiceTwo();}
  if(ph==='n3-close'){C.closeWait+=dt;const q=C.behind,turned=q&&k.camLooksAt({x:q.x,y:q.y,z:q.z},.5);if(turned&&!C.turnedAt)C.turnedAt=C.t;if(!C.flags.close&&((C.turnedAt&&C.t-C.turnedAt>1.7)||C.closeWait>4.6))closeBell();}
  if(ph==='n3-run'){C.runT+=dt;const out=L.street==='main'||(L.street==='side'&&L.v<9);if(out)safeNow();
   const thru=L.street==='basin'&&L.v<E.fence.v0;if(thru&&!C.flags.through){C.flags.through=true;o.sfx('fence',SP.gap,{gain:1});later(1.9,()=>o.sfx('chain',SP.gate,{gain:.7}));}
   if(!C.flags.callBack&&C.runT>7&&L.street==='basin'&&L.v>E.fence.v0&&!busy()){C.flags.callBack=true;talk([{who:'JAMIE',text:'“Come ON!”',from:jamie,time:1.4}]);}}
  if(ph==='n3-safe'){if(C.glintT!==undefined&&C.glintT>=0){C.glintT+=dt;const v=Math.sin(Math.PI*clamp(C.glintT/.32,0,1));glint.visible=v>.01;glint.material.opacity=v*.85;if(C.glintT>.4){glint.visible=false;C.glintT=-1;}}
   if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n3-end');end();}}}
  updateGlimpse(dt);updateJamieLight();
  // Tension follows exertion a little (a sprint takes your breath).
  A.night=day()?0:1;A.day=day()?1:0;if(A.day){S.deep=A.deep=0;}}
 function updateGlimpse(dt){if(C.glimpse==='armed'){if(C.t-C.glimpseFrom>40||C.flags.voice1){C.glimpse='off';return;}
   const d=dist(camera.position,glimpseAt),lit=o.playerLight?.intensity>0||C.sweepFig,looks=k.camLooksAt({x:glimpseAt.x,y:glimpseAt.y+.9,z:glimpseAt.z},.984);
   if(d>9&&d<30&&looks&&lit){C.glimpse='showing';C.glT=0;figure.group.visible=true;glimpseBike.group.visible=true;mark('a shape at the edge of the light');}}
  else if(C.glimpse==='showing'){C.glT+=dt;if(C.glT>.3||!k.camLooksAt({x:glimpseAt.x,y:glimpseAt.y+.9,z:glimpseAt.z},.96)){figure.group.visible=false;glimpseBike.group.visible=false;C.glimpse='gone';C.flags.glimpsed=true;
    T?.jolt(.72,{rise:.8,hold:3,why:'something in the light'});later(1.5,()=>{if(!busy()&&!C.flags.voice1)talk([{who:'SAM',text:'“What? What is it?”',from:sam,time:1.8,gap:.8},{who:'YOU',text:'“…Nothing. I thought…”',time:2.2}]);});}}}
 // Jamie's light: where the chapter points it, or ahead of him, now and then across the far corner of the basin.
 const sweepTmp={x:0,y:0,z:0};
 function updateJamieLight(){C.sweepFig=false;}
 function jamieSweep(t){if(C.glimpse==='armed'&&Math.floor(t/7)%3===1){C.sweepFig=true;return glimpseAt;}const a=jamie.mode==='foot'?jamie.pa:jamie.ba,d=5+Math.sin(t*.4)*1.5,s2=Math.sin(t*.7)*.55;
  sweepTmp.x=jamie.px+Math.sin(a+s2)*d;sweepTmp.z=jamie.pz-Math.cos(a+s2)*d;sweepTmp.y=nav.groundY(sweepTmp.x,sweepTmp.z);return sweepTmp;}
 // ---- what F does here ----------------------------------------------------------------------------------------
 function spots(){const out=[],ph=S.phase;if(C.fadeOut>=0||C.pose&&!C.pose.release&&ph!=='d3-phone'&&ph!=='d3-oldbike')return out;
  if((ph==='d3-street'&&C.flags.atHouse)||ph==='d3-street')if(mom.visible&&!C.flags.momTalk)out.push({id:'c3-mom',label:'Talk to Alex’s mom',at:mom.pos,face:mom.pos,r:3.6,ride:true,wide:true});
  if(ph==='d3-mom'&&C.flags.invited){const d=AH.toWorld(AH.doorX,AH.stepFront+.5);out.push({id:'c3-in',label:'Go inside',at:{x:d.x,z:d.z},face:{x:d.x,z:d.z},r:3,wide:true});}
  if(ph==='d3-room'&&C.flags.phoneReady)out.push({id:'c3-phone',label:'Listen to his recordings',at:phone.position,face:phone.position,r:2.3,wide:true});
  if(ph==='d3-phone'&&C.recPlaying<0&&!busy()&&C.recSel<RECS.length&&!C.flags.recorded)out.push({id:'c3-play',label:C.heard.length?'Next recording':'Play',at:phone.position,face:phone.position,r:3,wide:true});
  if(ph==='d3-window'&&!C.flags.window){const st=RW(R.sideWindow.x,R.sideWindow.z),gl=RW(R.sideWindow.glass.x,R.sideWindow.glass.z);out.push({id:'c3-window',label:'Look outside',at:st,face:gl,r:1.5,wide:true});}
  if(C.inRoom&&C.flags.canLeave){const d=RW(R.door.x,R.door.z);out.push({id:'c3-out',label:'Go back outside',at:d,face:RW(R.door.face.x,R.door.face.z),r:1.4,wide:true});}
  if(ph==='d3-neighbors'||(ph==='d3-road'&&false))for(const [key,a] of Object.entries(N))if(a.visible&&!C.talked.has(key))out.push({id:'c3-ask-'+key,label:'Talk to '+a.name.replace('MR. ','Mr. ').replace('MRS. ','Mrs. ').replace(/(\w)(\w*)$/,(m,x,y)=>x+y.toLowerCase()),at:a.pos,face:a.pos,r:3.4,ride:true,wide:true});
  if(ph==='d3-oldbike'&&C.flags.canInspect&&!C.flags.inspected)out.push({id:'c3-inspect',label:'Look at the bike',at:old.group.position,face:old.group.position,r:2.8,wide:true});
  if(ph==='d3-oldbike'&&C.flags.canBell&&!C.flags.belled)out.push({id:'c3-bell',label:'Try the bell',at:old.group.position,face:old.group.position,r:2.6,wide:true});
  return out;}
 function act(id){if(id==='c3-mom')momTalk();else if(id==='c3-in')toRoom();else if(id==='c3-phone')startPhone();else if(id==='c3-play'){playRec();}else if(id==='c3-window')lookOut();else if(id==='c3-out')leaveRoom();
  else if(id.startsWith('c3-ask-'))askNeighbor(id.slice(7));else if(id==='c3-inspect')inspectOld();else if(id==='c3-bell')tryBell();}
 // Sounds placed in the world (positional loops).
 function sources(out){if(day()){out.push({id:'radio-am',kind:'radio',pos:officer.pos,level:.8});return;}
  const lf=C.amb.life;for(const [i,q] of loopsAt.ac.entries())out.push({id:'ac'+i,kind:'ac',pos:new THREE.Vector3(q.x,(q.ground??q.y??0)+.5,q.z),level:lf});
  out.push({id:'tv3',kind:'tv',pos:new THREE.Vector3(loopsAt.tv.x,loopsAt.tv.y+1.2,loopsAt.tv.z),level:lf},{id:'sprinkler3',kind:'sprinkler',pos:new THREE.Vector3(loopsAt.sprinkler.x,loopsAt.sprinkler.y+.3,loopsAt.sprinkler.z),level:lf},
   {id:'hum3',kind:'hum',pos:new THREE.Vector3(SP.pole.x,SP.pole.y+7.4,SP.pole.z),level:1},{id:'outlet3',kind:'culvert',pos:new THREE.Vector3(SP.outlet.x,SP.outlet.y+1,SP.outlet.z),level:.8});}
 function blockers(){const out=[];if(old.group.visible)out.push(...oldParts());for(const a of people)if(a.visible)out.push({x:a.x,z:a.z,r:.34,speed:0});return out;}
 // ---- lifecycle --------------------------------------------------------------------------------------------------
 function reset(){const hadPose=C.pose;fresh();card(false);roomOn(false);phone.visible=false;old.group.visible=false;evidence.visible=false;figure.group.visible=false;glimpseBike.group.visible=false;glint.visible=false;
  for(const a of people){a.show(false);a.lookAt=null;a.gest(null);a.mode='stand';a.path=null;}o.setDrain?.(1);T?.reset();o.audio()?.stopRecording?.();if(hadPose&&S.pose===hadPose){k.setPose(null);o.roam.walkLock=false;}}
 // QA jumps and Continue: put the chapter at one of its moments, everything it needs set up.
 function jump(section){section=ALIAS3[section]||section;reset();fresh();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();
  const dayS=['chapter3-start','c3-alex-house','alex-bedroom','recording','neighbors','service-access-day','old-bike'];
  if(dayS.includes(section)){k.nightWorld();ch2.morningWorld();dayWorld();ch2.flyers.visible=true;
   const ride=(c,q,a)=>{comp.putRiding(c,q.x,q.z,a,0);c.follow='ride';};
   if(section==='chapter3-start'){const q=main(593,1.2);o.placePlayer({x:q.x,z:q.z,a:heading(593)+.9,mode:'ride',speed:0});ride(jamie,main(589.5,-.6),heading(589.5)+.4);ride(sam,main(590.5,2.8),heading(590.5)+.7);go('d3-corner');opening();C.fadeIn=-1;return;}
   if(section==='c3-alex-house'){const q=side(114,1.6);o.placePlayer({x:q.x,z:q.z,a:k.ha(114),mode:'ride',speed:1.5});ride(jamie,side(110,-.4),k.ha(110));ride(sam,side(108.5,2.2),k.ha(108.5));go('d3-street');date(DAY.house,'AM');objective('Go to Alex’s house.','Down Briarwood, around the bend past the creek.');follow(true);return;}
   // At the house: bikes left on the front walk.
   const bp=side(122.6,9.2),ba=k.ha(122.6);const jb=side(124.2,9.6),sb=side(120.8,9.4);
   const parkFoot=(c,q,b)=>{comp.putFoot(c,q.x,q.z,0,{bike:{x:b.x,z:b.z,a:ba,kick:1}});c.follow=null;};
   if(section==='alex-bedroom'||section==='recording'){o.placePlayer({x:bp.x,z:bp.z,a:0,mode:'walk',bike:{x:bp.x+.8,z:bp.z,a:ba}});parkFoot(jamie,side(124,11),jb);parkFoot(sam,side(121,11),sb);
    C.flags.momTalk=true;C.flags.invited=true;enterRoom();if(section==='recording'){C.flags.phoneSeen=true;C.flags.phoneReady=true;S.queue.length=0;S.line=null;startPhone();C.recSel=4;C.heard=[0,1,2,3];drawScreen();}return;}
   C.flags.momTalk=true;C.flags.invited=true;mom.show(false);
   if(section==='neighbors'){o.placePlayer({x:bp.x,z:bp.z,a:0,mode:'walk',bike:{x:bp.x+.8,z:bp.z,a:ba}});parkFoot(jamie,side(124,11),jb);parkFoot(sam,side(121,11),sb);exitRoom();return;}
   C.flags.okafor=true;for(const kk of ['huang','okafor'])C.talked.add(kk);
   const q=side(E.drive.u-.2,section==='old-bike'?34:6.2),a=k.ha(E.drive.u)+Math.PI/2*(1),dv=Math.PI;
   o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,SP.gate.x,SP.gate.z),mode:'walk',bike:{x:side(E.drive.u+2.6,3.2).x,z:side(E.drive.u+2.6,3.2).z,a:ba}});void a;void dv;
   parkFoot(jamie,side(E.drive.u+.9,section==='old-bike'?32.5:4.6),side(E.drive.u+3.4,3.6));parkFoot(sam,side(E.drive.u-.8,section==='old-bike'?31.8:4),side(E.drive.u+4.6,3.4));
   go('d3-road');follow(true);objective('Find the old pond road.','Between Alex’s yard and Mr. Okafor’s.');
   if(section==='service-access-day'){C.flags.onRoad=false;return;}
   C.flags.onRoad=true;oldBikeSeen();return;}
  // The night.
  nightWorld();const parked=[[E.drive.u+2.4,3.4],[E.drive.u+3.6,3.8],[E.drive.u+1.4,3]].map(([u,v])=>side(u,v));
  const foot=(c,q,b,a)=>{comp.putFoot(c,q.x,q.z,a,{bike:{x:b.x,z:b.z,a:k.ha(E.drive.u)+Math.PI/2,kick:1}});c.follow=null;};
  const place=(u,v,face)=>{const p=Q.world(u,v);o.placePlayer({x:p.x,z:p.z,a:headingTo(p.x,p.z,face.x,face.z),mode:'walk',bike:{x:parked[0].x,z:parked[0].z,a:k.ha(E.drive.u)+Math.PI/2}});};
  C.flags.met=true;C.flags.drive=true;ch2.samBeam.on=true;S.flashOn=true;
  if(section==='night-start'){nightStart();C.fadeIn=-1;return;}
  const W2=(u,v)=>{const p=Q.world(u,v);return {x:p.x,z:p.z};};
  if(section==='old-bike-gone'){place(E.drive.u,37.6,SP.gate);foot(jamie,W2(E.drive.u+.8,36.2),parked[1],Q.heading);foot(sam,W2(E.drive.u-.9,35.4),parked[2],Q.heading);go('n3-drive');C.depth=1;for(const kk in C.amb)C.amb[kk]=.05;C.flags.quiet=true;T?.set(.32);T.value=.3;gateEmpty();return;}
  if(section==='first-bell'){place(E.drive.u+.3,40.6,SP.gate);foot(jamie,W2(E.drive.u+1,39.6),parked[1],Q.heading);foot(sam,W2(E.drive.u-.7,39),parked[2],Q.heading);go('n3-gate');C.depth=1;for(const kk in C.amb)C.amb[kk]=.03;C.flags.quiet=true;C.flags.gone=true;T.value=.38;T?.set(.38);bellOne();return;}
  C.flags.quiet=true;C.flags.gone=true;C.flags.bell1=true;C.bell1At=-20;C.depth=1;for(const kk in C.amb)C.amb[kk]=.02;
  if(section==='c3-second-bell'){place(150,47.5,SP.apron);foot(jamie,W2(151.6,46.4),parked[1],Q.heading);foot(sam,W2(149.2,45.8),parked[2],Q.heading);go('n3-search');follow(true,{loose:true});T.value=.48;T?.set(.48);bellTwo();return;}
  C.flags.bell2=true;C.flags.eased=true;C.flags.expect=true;
  if(section==='alex-voice'){place(E.outlet.u+5.2,E.outlet.v-.6,SP.outlet);foot(jamie,W2(E.outlet.u+4.6,E.outlet.v+1.4),parked[1],Q.heading+Math.PI/2);foot(sam,W2(E.outlet.u+6.6,E.outlet.v+1),parked[2],Q.heading+Math.PI/2);go('n3-search');T.value=.66;T?.set(.66);voiceOne();return;}
  C.flags.voice1=true;C.voices=[{word:'jamie',pos:SP.deep,at:-5,tunnel:true}];
  if(section==='close-bell'){place(E.outlet.u+5.2,E.outlet.v-.6,SP.gapIn);foot(jamie,W2(E.outlet.u+4.6,E.outlet.v+1.4),parked[1],Q.heading);foot(sam,W2(E.outlet.u+6.6,E.outlet.v+1),parked[2],Q.heading);go('n3-voice');T.value=.9;T?.set(.92);C.flags.voice2=true;C.behind=behindPoint();C.voices.push({word:'guys',pos:C.behind,at:-1});go('n3-close');C.closeWait=0;C.turnedAt=C.t-.2;return;}
  C.flags.voice2=true;C.flags.close=true;C.heardBells=[];
  if(section==='escape'){place(E.outlet.u+5.2,E.outlet.v-.6,SP.gapIn);foot(jamie,W2(E.outlet.u+4.6,E.outlet.v+1.4),parked[1],Q.heading);foot(sam,W2(E.outlet.u+6.6,E.outlet.v+1),parked[2],Q.heading);T.value=.98;T?.jolt(1,{hold:30});run();return;}
  if(section==='chapter3-end'){C.flags.run=true;C.flags.through=true;const q=side(E.drive.u+.6,4.6);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,SP.gate.x,SP.gate.z),mode:'walk',bike:{x:parked[0].x,z:parked[0].z,a:k.ha(E.drive.u)+Math.PI/2}});
   foot(jamie,side(E.drive.u-1.2,4.2),parked[1],Q.heading);foot(sam,side(E.drive.u+2.2,4.4),parked[2],Q.heading);go('n3-run');T.value=.9;T?.set(.9);safeNow();return;}}
 Object.assign(A3,{SECTIONS:SECTIONS3,ALIAS:ALIAS3,LABEL:LABEL3,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,jamieSweep,officerAim:()=>null,
  canDismount:()=>!C.pose&&!C.inRoom&&!['c3-black','c3-night'].includes(S.phase),canRemount:()=>!C.inRoom&&!(where().street==='basin'&&where().v>E.fence.v0)&&!['n3-run'].includes(S.phase)||S.phase==='n3-safe',
  });
 Object.defineProperties(A3,{amb:{get:()=>C.amb},state:{get:()=>({phase:S.phase,flags:{...C.flags},inRoom:C.inRoom,recSel:C.recSel,recPlaying:C.recPlaying,heard:[...C.heard],talked:[...C.talked],amb:Object.fromEntries(Object.entries(C.amb).map(([a,b])=>[a,+b.toFixed(3)])),depth:+C.depth.toFixed(3),
   glimpse:C.glimpse,bells:(C.heardBells||[]).map(b=>({...b,pos:{x:+b.pos.x.toFixed(2),y:+b.pos.y.toFixed(2),z:+b.pos.z.toFixed(2)}})),voices:(C.voices||[]).map(v=>({word:v.word,at:v.at,tunnel:!!v.tunnel,dot:v.dotFromView,pos:{x:+v.pos.x.toFixed(2),z:+v.pos.z.toFixed(2)}})),
   oldBike:old.group.visible,evidence:evidence.visible,phone:phone.visible,tension:T?.state,pose:!!C.pose,lastEvent:C.lastEvent,t:C.t})}});
 Object.assign(A3,{old,evidence,phone,figure,glimpseBike,glimpseAt,people:N,roomZone,RW,RECS,BELL1,BELL2,C});
 return A3;
}
