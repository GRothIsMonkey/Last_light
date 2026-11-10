// Aftermath I, Acts I and II: the school. Played as scripts on the chapter's task runner (aftermath1.js). Acts III and IV (Oak
// Hollow behind its fence, the families, the two remembrances, Sam, October) are in aftermath1-town.js; this file joins them.
//
// What you do here is small on purpose: put a bike in a rack; take Sam's handlebars; take a cup of water or don't; sit down;
// hold out a cap or keep hold of it; say one true thing or look at the grown-up who can say it for you. Nothing you choose changes
// what happened. Nobody is saved in this chapter.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {ACT} from './chapter8-acting.js';
import {ACT9,G,asC} from './aftermath1-acting.js';
import {createSchool} from './aftermath1-places.js';
import {tex9,fresh9} from './aftermath1-props.js';
import {cutWorld} from './chapter8-ruin.js';
import {groundPoint} from './route.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {P as PP,newPose,copyPose,applyPose,sitPose} from './rig.js';
import {townActs} from './aftermath1-town.js';
import {recordActs} from './aftermath1-record.js';

export function scenes9(X){
 const {o,k,C,S,A9,ch8,STREET,phys,comp,brain,sam,jamie,cast,OWN,EVERYONE,FACES,sound,gy,light,lightsOn,checkpoint,later,mark,card,say,SM,Y,N,V,R,JM,AD,AM,SD,SMO,MO,BR,person,
  task,stopTask,wait,until,lines,quiet,offer,unoffer,V3,near,lookingAt,pose,unpose,posed,closeLook,endLook,looking,holding,pageMesh,choosing,me,go,objective,busy,nav,camera,scene,world,
  stand,walkTo,joinFoot,leave,minds,setDay,dayWorld,keep,cry,weep,feel,mood,applyGrief,headOf,end}=X;
 const {reyes,officer,alexDad,alexMom,neighbor,samDad,samMom,jamieMom,brandt,fire,mrsH,mrH,lily,pruitt,davis,mom,vol,medic,extras}=cast;
 const [vol1,vol2,vol3,vol4,vol5,huang,delaney,pruitt3,okafor,run1,run2]=extras;
 const SCH=createSchool({scene}),SP=SCH.SPOT,W=SCH.W;
 const WQ=q=>W(q.x,q.z,q.y??0);// a local spot as a world point
 const VOL=person('VOLUNTEER',vol),MRSH=person('MRS. HENDERSON',mrsH);
 const D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 // ---- people: where they are, what they are doing ------------------------------------------------------------------------------------
 // put(actor, local spot, heading, gesture): shown, placed, doing something
 function put(a,q,h=0,g=null,{noBlock=false}={}){if(!a)return;const w=W(q.x,q.z);a.show(true);a.place(w.x,w.z,h);a.gest(g);a.lookAt=null;a.noBlock=noBlock;a.routine=null;}
 const sitG=(hgt=SCH.COT_H,o2={})=>G(ACT9.sit(hgt,o2)),lieG=(hgt=SCH.COT_H,o2={})=>G(ACT9.lie(hgt,o2),{look:false});
 const KNEEL=G(ACT.kneel({side:1,lookPitch:-.1}));
 const onCot=(a,i,{side=1,hands='knees',lean=.1}={})=>{const s=SCH.cotSeat(i,side);put(a,s,s.a,sitG(SCH.COT_H,{hands,lean}),{noBlock:true});};
 const lieOn=(a,i,flip=false)=>{const s=SCH.cotLie(i,flip);put(a,s,s.a,lieG(),{noBlock:true});};
 // things people wear here: a blanket round the shoulders, a bandage, a splint (taken off again when the chapter resets)
 const WORN=[];
 function blanket(a,color=0x8c8982){if(!a?.person||a.worn?.blanket)return;const g=new THREE.Group();g.name='a1-blanket';const m=new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide});m.name='a1-blanket';
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.205,.27,.5,12,1,true,.5,Math.PI*2-1),m);body.scale.set(1,1,.78);body.position.set(0,-.04,.02);body.rotation.y=Math.PI;g.add(body);
  const top=new THREE.Mesh(new THREE.SphereGeometry(.21,12,6,0,Math.PI*2,0,Math.PI/2.4),m);top.scale.set(1,.42,.8);top.position.set(0,.19,.03);g.add(top);a.person.parts.torso.add(g);(a.worn||={}).blanket=g;WORN.push([a,'blanket',g]);}
 function bandage(a){if(!a?.person||a.worn?.bandage)return;const g=new THREE.Mesh(new THREE.TorusGeometry(.093,.017,6,18),new THREE.MeshStandardMaterial({color:0xf1eee6,roughness:1}));g.material.name='a1-bandage';g.rotation.x=Math.PI/2;g.position.set(0,.052,.004);g.scale.set(1,1.1,1);a.person.parts.head.add(g);(a.worn||={}).bandage=g;WORN.push([a,'bandage',g]);}
 function splint(a){if(!a?.person||a.worn?.splint)return;const g=new THREE.Mesh(new THREE.CylinderGeometry(.062,.058,.36,10),new THREE.MeshStandardMaterial({color:0xe9e6dc,roughness:.9}));g.material.name='a1-splint';a.person.parts.rshin.add(g);(a.worn||={}).splint=g;WORN.push([a,'splint',g]);}
 function unwear(){for(const [a,kk,g] of WORN){g.removeFromParent();if(a.worn)delete a.worn[kk];}WORN.length=0;}
 // a routine: something a person keeps doing by themselves. pace: between points, standing a while at each.
 const ROUT=new Set();
 function pace(a,pts,{speed=.9,pause=[4,9],gest=null}={}){a.routine={kind:'pace',pts:pts.map(q=>W(q.x,q.z)),i:0,t:1+Math.random()*3,speed,pause,gest};ROUT.add(a);}
 // the look: who notices you come in, looks at the two of you, and then past you at the doors
 function notices(a,{after=0}={}){a.notice={state:'idle',t:0,after};ROUT.add(a);}
 const DOORPT=(()=>{const w=W(-5.5,8.2);return new THREE.Vector3(w.x,1.5,w.z);})();
 function updateRoutines(dt){const p=me();for(const a of ROUT){if(!a.visible)continue;const r=a.routine;
   if(r?.kind==='pace'&&!a.walking){r.t-=dt;if(r.t<=0){r.i=(r.i+1)%r.pts.length;const q=r.pts[r.i];a.walk([[q.x,q.z]],{speed:r.speed,then:b=>{b.gest(r.gest);}});r.t=r.pause[0]+Math.random()*(r.pause[1]-r.pause[0]);}}
   const n=a.notice;if(n){n.t+=dt;const d=Math.hypot(p.x-a.x,p.z-a.z);
    if(n.state==='idle'&&C.flags.inGym&&d<8.5&&n.t>n.after){n.state='you';n.t=0;n.dur=1.4+Math.random()*1.4;a.lookAt=camera.position;}
    else if(n.state==='you'&&n.t>n.dur){n.state='doors';n.t=0;n.dur=2.4+Math.random()*1.6;a.lookAt=DOORPT;C.flags.looked=(C.flags.looked||0)+1;}
    else if(n.state==='doors'&&n.t>n.dur){n.state='done';a.lookAt=null;}}}}
 // an actor walks a way and waits for you along it (Reyes taking you somewhere)
 function* leadTo(a,pts,{speed=1.15,ahead=5.5,patience=30}={}){for(const q of pts){const w=W(q.x,q.z);let done=false;a.walk([[w.x,w.z]],{speed,then:()=>{done=true;}});yield* until(()=>done,40);a.lookAt=camera.position;
   yield* until(()=>Math.hypot(me().x-a.x,me().z-a.z)<ahead,patience);a.lookAt=null;}}
 // Sam, held where a scene wants him (sitting on a cot, astride his bike): drawn after the companions' own pass
 const PIN={};
 function pinSam(q,{a=0,gesture=null,blend=.6,follow=true,world=false}={}){if(!q){if(PIN.q){PIN.q=null;
    // (up off whatever he was on: the nearest place he can walk from)
    if(!nav.walkable(sam.px,sam.pz,{r:.3})){let done=false;for(let r=.3;r<=1.5&&!done;r+=.15)for(let i=0;i<12&&!done;i++){const h=sam.pa+i/12*Math.PI*2,x=sam.px+Math.sin(h)*r,z=sam.pz-Math.cos(h)*r;if(nav.walkable(x,z,{r:.3})){sam.px=x;sam.pz=z;done=true;}}}
    if(sam.mode==='foot'&&!sam.gone&&follow){sam.follow='walk';brain.enable(sam,true);}}return;}
  if(sam.mode!=='foot'){comp.putFoot(sam,sam.bx??q.x,sam.bz??q.z,a,{bike:null});}stand(sam,null);sam.follow=null;sam.brain=null;sam.script=null;PIN.q=world?{x:q.x,z:q.z}:W(q.x,q.z);PIN.a=a;PIN.g=gesture;PIN.t=0;PIN.blend=blend;PIN.from={x:sam.px,z:sam.pz,a:sam.pa};}
 const _sp=newPose();
 function updatePin(dt){if(!PIN.q||sam.gone||!sam.person.group.visible)return;PIN.t+=dt;const u=smooth(PIN.t/PIN.blend),x=lerp(PIN.from.x,PIN.q.x,u),z=lerp(PIN.from.z,PIN.q.z,u),a=PIN.from.a+wrap(PIN.a-PIN.from.a)*u;
  sam.px=x;sam.pz=z;sam.pa=a;const g=sam.person.group;g.position.set(x,gy(x,z),z);g.rotation.set(0,-a,0);copyPose(_sp,sam.pose);if(PIN.g&&u>.5)PIN.g(_sp,{clock:C.t});applyPose(sam.person,_sp);sam.posedAt=C.t;}
 // ---- the school as a place to be ------------------------------------------------------------------------------------------------------
 const GL=(x,z,y)=>{const w=W(x,z);return {x:w.x,y,z:w.z};};
 function gymLights(kind='shelter'){lightsOn(true);const I=kind==='memorial'?40:kind==='dawn'?46:44;for(const [i,x,z] of [[0,-7,-3.6],[1,7,-3.6],[2,-7,3.6],[3,7,3.6]])light(i,GL(x,z,5.7),{intensity:I,dist:17,color:kind==='memorial'?0xfff2dc:0xffefd0});light(4,null);light(5,null);}
 function schoolWorld(state,{lot=false,sky='dawn',lightName=null,lights='shelter'}={}){dayWorld();o.hideWorld?.(true);o.bikeAway?.(true);SCH.show(state,{lot,light:lightName||(sky==='dawn'?'dawn':sky==='smoke'?'smoke':'day')});nav.setRoom(SCH.nav);gymLights(lights);C.where='school';C.sky=sky;
  C.amb={traffic:0,insects:0,wind:.25,life:0,forest:0,tunnel:0,water:0};C.cave=.5;C.fill=.78;ROUT.clear();for(const a of EVERYONE){a.routine=null;a.notice=null;}minds('tense');}
 // the lamps that are not the gym's own: whatever room of the wing you are in; the television's light
 function updateSchool(dt){if(!SCH.ST.on)return;const c=camera.position;C.insideWant=SCH.insideK(c.x,c.z);const wh=SCH.where(c.x,c.z);C.flags.inGym=wh==='gym';
  if(wh!==C.area){C.area=wh;if(wh==='nurse')light(4,GL(18.6,-5.6,2.85),{intensity:9,dist:9,color:0xfff3dc});else if(wh==='room')light(4,GL(20.3,2.1,2.85),{intensity:12,dist:11,color:0xfff3dc});else if(wh==='corridor')light(4,GL(14.7,c.z-SCH.O.z,2.85),{intensity:8,dist:10,color:0xfff3dc});
   else if(SCH.ST.state==='shelter')light(4,GL(-8.5,5.6,2.6),{intensity:5,dist:8,color:0xfff0d0});else light(4,null);
   if(wh!=='gym'&&wh!=='vestibule'&&wh!=='lot')light(5,GL(14.7,0,2.85),{intensity:6,dist:12,color:0xfff3dc});else if(SCH.ST.state==='shelter'&&TV.on)light(5,GL(11,5.6,1.5),{intensity:3.2,dist:6,color:0x9db8d8,flicker:.5});else light(5,null);}
  SCH.update(dt,{camera});updateTV(dt);}
 // the television: the street itself, from the air, as it is this morning (rendered from the world once: game.js shoot); where
 // nothing can be rendered (the tests), a blue-grey screen
 const TV={on:false,rt:[],i:0,t:0};
 const SPd=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return {x:p.x,z:p.z,y:world.groundY(d,lat)+dy};};
 function tvFootage(){TV.on=true;if(TV.rt.length||!SP.tvScreen||typeof THREE.WebGLRenderTarget!=='function'||!o.shoot||typeof o.renderer?.setRenderTarget!=='function')return;
  try{cutWorld(world);ch8.ruin.show(true);ch8.ruin.stage(2);STREET?.after?.(true);STREET?.town?.update?.(.05,{camera});
   for(const [from,to] of [[SPd(1034,-40,44),SPd(1068,-2,0)],[SPd(1002,34,38),SPd(1026,2,0)],[SPd(905,30,46),SPd(872,0,0)]]){const rt=new THREE.WebGLRenderTarget(384,216,{colorSpace:THREE.SRGBColorSpace});const cam=new THREE.PerspectiveCamera(46,384/216,1,380);cam.position.set(from.x,from.y,from.z);cam.lookAt(to.x,to.y,to.z);cam.updateMatrixWorld();
    if(o.shoot({cam,target:rt,preset:{day:.4,dusk:.45,night:.12},at:to}))TV.rt.push(rt);else rt.dispose?.();}}
  catch(e){mark('tv footage: '+(e&&e.message));}
  finally{try{STREET?.after?.(false);STREET?.town?.reset?.();ch8.ruin.reset();ch8.ruin.show(false);}catch{}}
  if(TV.rt.length){SP.tvScreen.material.map=TV.rt[0].texture;SP.tvScreen.material.color.setHex(0xd8d8d8);SP.tvScreen.material.needsUpdate=true;}}
 function updateTV(dt){if(!TV.on||TV.rt.length<2)return;TV.t+=dt;if(TV.t>7){TV.t=0;TV.i=(TV.i+1)%TV.rt.length;SP.tvScreen.material.map=TV.rt[TV.i].texture;}}
 // ---- things in hands: Jamie's cap, a paper cup -------------------------------------------------------------------------------------------
 const capG=(()=>{const g=new THREE.Group();g.name='a1-jamie-cap';const m=new THREE.MeshStandardMaterial({color:0x2d4a7a,roughness:.85});m.name='a1-cap';const dome=new THREE.Mesh(new THREE.SphereGeometry(.105,14,8,0,Math.PI*2,0,Math.PI/2),m);dome.scale.set(1,.72,1.1);g.add(dome);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.012,14,1,false,-.9,1.8),m);brim.scale.set(1,1,1.25);brim.position.set(0,.004,-.1);g.add(brim);const btn=new THREE.Mesh(new THREE.SphereGeometry(.012,6,5),m);btn.position.y=.078;g.add(btn);g.traverse(q=>{if(q.isMesh)q.castShadow=true;});return g;})();
 const cupG=(()=>{const g=new THREE.Mesh(new THREE.CylinderGeometry(.036,.027,.095,12),new THREE.MeshStandardMaterial({color:0xf1eee6,roughness:.7}));g.name='a1-cup';g.material.name='a1-cup';return g;})();
 const CAP=phys?.prop('a1-cap',capG,{grip:{p:[0,.06,.03],r:[.5,0,0]}}),CUP=phys?.prop('a1-cup',cupG,{grip:{p:[0,.07,.03],r:[0,0,0]}});
 capG.visible=false;cupG.visible=false;
 // the cap: in your hand (low in view), on a thing (a sill, a table, a chair), in her hands, or away in your pocket
 function capTo(whereTo,q=null){if(!CAP)return;C.capAt=whereTo;if(whereTo==='hand'){CAP.holdBy(o.self,'l');phys.playerHold('l',CAP,{at:[-.17,1.02,-.36]});}
  else{if(phys.ME.hold.l?.prop===CAP)phys.playerHold('l',null);if(whereTo==='away'){CAP.hide();}else if(whereTo==='her'){CAP.holdBy(q.person,'r',{p:[-.03,.05,.05],r:[.9,0,.4]});}else if(whereTo==='place'){const w=q.isVector3?q:new THREE.Vector3(q.x,q.y,q.z);CAP.place(w,new THREE.Euler(0,q.ry||0,0));}}}
 // ---- the state a scene needs, however you came to it (DEV, Continue, or by playing) ------------------------------------------------------
 const ORDER=A9.SECTIONS,after=(sec,than)=>ORDER.indexOf(sec)>=ORDER.indexOf(than);
 // (what the earlier scenes leave in what was kept, when a jump skips them: the plain outcome; a save or a DEV variant says otherwise)
 function canon(section){const K=C.keep;if(after(section,'a1-driveway')&&section!=='a1-driveway'){K.print=true;K.camera='parents';}else if(after(section,'a1-remained'))K.camera=K.camera||'reyes';
  if(after(section,'a1-return'))K.wrote=true;if(after(section,'a1-porch')&&section!=='a1-porch'&&section!=='a1-remained')K.bell=true;if(after(section,'a1-road-out'))K.notebook='you';
  C.grief=after(section,'a1-weeks')?.32:after(section,'a1-sam')?.45:after(section,'a1-return')?.62:after(section,'a1-quiet-room')?.85:1;applyGrief();}
 // ---- Act I, scene 1a: two bikes, the rack -------------------------------------------------------------------------------------------------
 function lotCast(){// who is outside at half past six
  put(officer,{x:-40.2,z:46},Math.PI,'radio');put(fire[0],{x:9.6,z:12.86},Math.PI,sitG(.12,{hands:'knees',lean:.3}),{noBlock:true});put(fire[1],{x:10.7,z:12.86},Math.PI,G(ACT9.cup({base:ACT.seat(.12,{lean:.25})})),{noBlock:true});
  put(vol3,{x:-27.4,z:12.75},Math.PI,sitG(.12,{hands:'face'}),{noBlock:true});blanket(vol3,0x6f5a52);put(vol5,{x:-26.2,z:12.8},Math.PI-.3,sitG(.12,{hands:'knees'}),{noBlock:true});blanket(vol5);
  put(brandt,{x:-12.45,z:15.1},-Math.PI/2,G(ACT9.lie(.68,{turn:-.4}),{look:false}),{noBlock:true});splint(brandt);put(medic,{x:-12.3,z:14.25},Math.PI,'talk');medic.lookAt=brandt.pos;
  const cb=k.carB,cq=W(-38.6,38);cb.show(true);cb.park(cq.x,cq.z,Math.PI*.9);cb.lights=true;police.attach?.(true);}
 const police=k.police;
 function sceneArrive(from='start'){go('a1-arrive');schoolWorld('shelter',{lot:true,sky:'dawn',lights:'dawn'});setDay('AUGUST 27',6.5,'dawn');C.grief=1;applyGrief();C.skyK={};
  lotCast();gymCast('before');o.bikeAway?.(false);
  const st=W(SP.start.x,SP.start.z);o.placePlayer({x:st.x,z:st.z,a:0,mode:'ride',speed:3});const sq=W(SP.start.x+1.7,SP.start.z+2.6);comp.putRiding(sam,sq.x,sq.z,0,3);sam.gone=false;sam.person.group.visible=true;sam.bike.group.visible=true;sam.follow='ride';brain.enable(sam,true);sam.boost=.85;
  checkpoint('a1-arrive');C.fadeIn=0;C.fadeInDur=3.4;cry(.4,8);weep(sam,'grief',20);capTo('away');
  C.amb={traffic:0,insects:.05,wind:.4,life:.1,forest:0,tunnel:0,water:0};
  task('arrive',(function*(){const rack=W(SP.rackSlot.x,SP.rackSlot.z),samAt=W(SP.rackSam.x,SP.rackSam.z);
   yield* lines([{wait:2.6},N('The school. Half past six in the morning.',{time:3}),{wait:1.4},N('The sky isn’t red any more. It’s the brown of a bruise going yellow, and the sun is somewhere behind it.',{time:4.6})]);
   objective('The bike rack.','By the gym doors. Sam is beside you.');
   yield* until(()=>D(me(),rack)<30||me().walking||C.pt>70);
   yield* lines([N('A bus at the curb with its door open. An ambulance. People on the grass in blankets, not saying anything.',{time:4.6})]);
   // Sam rides to the end of the rack, and stops, and that is all he does
   yield* until(()=>D(me(),rack)<15||me().walking||C.pt>110);
   comp.run(sam,[comp.steps.rideTo(sam,[[W(-6,17.4).x,W(-6,17.4).z],[samAt.x,samAt.z]],{vmax:2.6,vend:0}),comp.steps.brake(sam,.5)],{then:()=>{C.flags.samStopped=true;}});
   yield* until(()=>me().walking||C.pt>170);
   if(!me().walking){objective('Get off your bike.','F. The rack is by the doors.');yield* until(()=>me().walking);}
   objective('The bike rack.','Wheel it in. Hold F.');
   offer('rack','Put your bike in the rack',()=>({x:o.roam.x,y:.9,z:o.roam.z}),{r:2.6,hold:1.5,when:()=>D({x:o.roam.x,z:o.roam.z},rack)<7&&D({x:o.roam.x,z:o.roam.z},rack)>.25,
    tick:(dt,v)=>{const f=Math.min(1,dt/Math.max(.04,(1-v)*1.5)),R2=o.roam,you=W(SP.rackYou.x,SP.rackYou.z),p=me();R2.x+=(rack.x-R2.x)*f;R2.z+=(rack.z-R2.z)*f;R2.a+=wrap(SP.rackSlot.a-R2.a)*f;o.shift?.((you.x-p.x)*f,(you.z-p.z)*f,{bike:false});},
    fn:()=>{o.roam.x=rack.x;o.roam.z=rack.z;o.roam.a=SP.rackSlot.a;sound('kickstand',{x:rack.x,y:.4,z:rack.z},{gain:.6});later(.6,()=>{if(!busy())say([N('You put it in the rack. Like it’s a school day.',{time:3.2})]);});}});
   yield* until(()=>C.flags.samStopped||C.pt>200,40);
   yield* until(()=>D(me(),samAt)<9||C.flags.rack||C.pt>230,40);
   yield* lines([N('Sam has stopped. Both feet down, both hands on the grips. He isn’t getting off.',{time:4})]);
   objective('Sam.','');
   offer('sam-bike','Take his handlebars',()=>{const g=sam.bike.group.position;return {x:g.x,y:g.y+1,z:g.z};},{r:2.4,hold:1.4,tick:(dt,v)=>{C.reachSam=v;},release:()=>{C.reachSam=0;},fn:()=>{C.reachSam=0;}});
   // Reyes: he has been behind you the whole way
   const car=k.carA,cf=W(SP.carFrom.x,SP.carFrom.z);car.show(true);car.park(cf.x,cf.z,0);car.lights=true;car.headlights=true;car.siren=false;
   car.go(SP.carIn.map(([x,z])=>{const w=W(x,z);return [w.x,w.z];}),{speed:()=>5.5,then:()=>{car.headlights=false;C.flags.reyesHere=true;}});
   yield* until(()=>C.flags['sam-bike']||(C.flags.reyesHere&&C.pt>C.flags.reyesHereAt+9),70);
   if(C.flags.reyesHere&&!reyes.visible)reyesOut();
   const helped=!!C.flags['sam-bike'];unoffer('sam-bike');
   if(helped)yield* lines([Y('Sam.',{time:1}),{wait:1.2},Y('I’ve got it. You can let go.',{time:2.2}),N('He lets go one hand at a time.',{time:2.6})]);
   else{yield* until(()=>reyes.visible,20);const sb=sam.bike.group.position;reyes.walk([[sb.x-.9,sb.z+.5]],{speed:1.3});yield* until(()=>!reyes.walking,12);yield* lines([R('Sam. Hey. I’ve got the bike. Let go for me.',{time:3}),N('Reyes takes the handlebars. Sam lets go one hand at a time.',{time:3.4})]);}
   comp.run(sam,[comp.steps.dismount(sam),comp.steps.kickstand(sam)],{then:()=>{sam.follow='walk';brain.enable(sam,true);C.flags.samOff=true;}});
   yield* until(()=>C.flags.samOff,8);
   yield* lines([{wait:.6},SM('I can’t feel my hands.',{time:2,face:'numb'})]);
   yield* until(()=>C.flags.reyesHere,40);if(!reyes.visible)reyesOut();
   {const p=me();reyes.walk([[p.x-1.2,p.z+1.1]],{speed:1.4,then:a=>a.faceTo(me().x,me().z)});}
   yield* until(()=>!reyes.walking,14);reyes.lookAt=camera.position;
   yield* lines([R('Inside. Both of you. I’m right here.',{time:2.6}),R('They brought your street out two hours ago. Your folks are in there. Everybody’s in there.',{time:4}),{wait:.8},
    N('Everybody.',{time:1.6})]);
   unoffer('rack');sceneGym('walk');})());}
 function reyesOut(){const q=W(SP.reyesOut.x,SP.reyesOut.z);reyes.show(true);reyes.place(q.x,q.z,0);reyes.gest(null);sound('carDoor',{x:q.x,y:1,z:q.z},{gain:.8});C.flags.reyesHereAt??=C.pt;}
 // ---- Act I, scene 1b: the shelter ---------------------------------------------------------------------------------------------------------
 // who is in the gym. when: 'before' (seen through the doors from the lot), 'walk' (you come in), 'after' (the scenes that follow)
 function gymCast(when='walk'){
  onCot(mrsH,13,{hands:'knees'});blanket(mrsH,0x6f5a52);lieOn(lily,12);put(mrH,SCH.cotSeat(14,1),Math.PI,sitG(SCH.COT_H,{hands:'knees',lean:.32}),{noBlock:true});bandage(mrH);
  lieOn(pruitt,6,true);blanket(pruitt);onCot(vol1,0,{hands:'face',lean:.3});onCot(vol2,1,{side:-1,hands:'knees',lean:.25});blanket(vol2,0x6f5a52);
  onCot(run1,8,{hands:'face',lean:.34});onCot(run2,9,{hands:'knees'});blanket(run2);onCot(neighbor,2,{side:-1,hands:'knees'});onCot(delaney,20,{hands:'knees',lean:.05});blanket(delaney,0x8a5a7a);
  put(vol4,SP.tvSeats[0],Math.PI/2,sitG(.44,{hands:'knees'}),{noBlock:true});put(huang,SP.tvSeats[1],Math.PI/2,sitG(.44,{hands:'knees',lean:.2}),{noBlock:true});
  put(pruitt3,{x:1.6,z:6.2},Math.PI*.9,G(ACT9.cup()));put(okafor,{x:4.9,z:6.35},Math.PI*.85,G(ACT9.cup()));put(davis,{x:-9,z:-6.6},Math.PI/2,'phone');pace(davis,[{x:1.5,z:-6.55},{x:-9,z:-6.6}],{speed:.8,pause:[5,11],gest:'phone'});
  put(vol,{x:-9.6,z:5.45},Math.PI,G(ACT9.clipboard()));put(jamieMom,{x:-11.4,z:7.1},Math.PI*.96,'phone');
  put(alexMom,SCH.cotSeat(3,1),Math.PI,sitG(SCH.COT_H,{hands:'knees',lean:-.02}),{noBlock:true});put(alexDad,{x:.25,z:-4.3},Math.PI*.8,'fold');
  for(const a of [mrsH,mrH,vol2,run2,neighbor,delaney,vol4,huang,pruitt3,okafor,alexMom,alexDad])notices(a,{after:Math.random()*3});
  for(const a of [jamieMom,alexDad,alexMom,mrsH,mrH,run1,vol1])mood(a,a===alexMom?'numb':a===jamieMom?'worried':'tired');mood(mrH,'pain');mood(run1,'numb');
  if(when!=='before'){const dq=W(-7.5,7.2);officer.show(true);officer.place(dq.x,dq.z,Math.PI*.2);officer.gest('radio');}}
 function sceneGym(from='walk'){go('a1-gym');
  if(from!=='walk'){schoolWorld('shelter',{lot:true,sky:'dawn',lights:'dawn'});setDay('AUGUST 27',6.62,'dawn');C.grief=1;applyGrief();lotCast();gymCast('walk');capTo('away');
   const q=W(SP.doorsOut.x,SP.doorsOut.z+.6);o.placePlayer({x:q.x,z:q.z,a:0,mode:'walk',bike:null});joinFoot(sam,W(SP.doorsOut.x+1,SP.doorsOut.z+1.4),0);const rq=W(SP.doorsOut.x-.9,SP.doorsOut.z-.4);reyes.show(true);reyes.place(rq.x,rq.z,0);C.fadeIn=0;weep(sam,'grief',20);}
  else{gymCast('walk');}
  checkpoint('a1-gym');tvFootage();objective('Go inside.','The gym. Reyes is with you.');
  task('gym',(function*(){
   // Reyes to the doors; Sam with you, as far as the doorway
   {const w=W(SP.vest.x-.8,SP.vest.z);reyes.walk([[W(SP.doorsOut.x-.8,SP.doorsOut.z).x,W(SP.doorsOut.x-.8,SP.doorsOut.z).z],[w.x,w.z]],{speed:1.2,then:a=>{a.lookAt=camera.position;}});}
   yield* until(()=>SCH.where(me().x,me().z)==='vestibule'||C.flags.inGym||C.pt>120);
   // the doorway: Sam stops in it
   stand(sam,WQ({x:SP.vest.x+.5,z:SP.vest.z+.3}),{look:()=>DOORPT,face:0,max:1.4,gesture:ACT9.lost()});weep(sam,'afraid',14);
   {const w=W(SP.inside.x-1.1,SP.inside.z-.3);reyes.walk([[w.x,w.z]],{speed:1.1,then:a=>{a.lookAt=camera.position;}});}
   yield* until(()=>C.flags.inGym||C.pt>160);
   yield* lines([{wait:.8},N('The gym. Cots in rows on the court. A television. Lists taped to the wall. It smells like coffee and smoke and wet blankets.',{time:5.2})]);
   yield* until(()=>D(me(),sam.person.group.position)>3.2||C.pt>200,8);
   yield* lines([N('Sam isn’t beside you. He’s stopped in the doorway, and people are going around him.',{time:4})]);
   objective('Sam.','In the doorway.');
   offer('sam-door','Stand with him',()=>headOf(sam),{r:2.2});
   yield* until(()=>C.flags['sam-door'],16);unoffer('sam-door');
   if(C.flags['sam-door'])yield* lines([SM('They’re all going to look.',{time:2.2,face:'afraid'}),Y('I know.',{time:1.2}),{wait:1.4},Y('We don’t have to say anything to anybody.',{time:2.6}),{wait:.8}]);
   else{{const w=sam.person.group.position;reyes.walk([[w.x-.7,w.z-.5]],{speed:1.2});}yield* until(()=>!reyes.walking,10);reyes.gest(G(ACT.shoulder(asC(reyes),sam,{hand:'r'})));yield* lines([R('Take your time, son. Nobody’s in a hurry.',{time:3}),{wait:1.6}]);reyes.gest(null);}
   stand(sam,null);weep(sam,'grief',30);
   // the lists: a volunteer; the board; who looks, and where they look next
   objective('Find somewhere to sit.','Reyes knows where.');
   task('reyes-leads',(function*(){yield* leadTo(reyes,[SP.inside,{x:-3,z:5},SP.aisleS,{x:SP.aisleN.x+.7,z:SP.aisleN.z+.2}],{ahead:6});reyes.faceTo(W(1.8,0).x,W(1.8,0).z);C.flags.reyesAtCots=true;})());
   yield* until(()=>D(me(),W(SP.checkin.x,SP.checkin.z))<5.2||D(me(),W(-3,5))<2.5||C.pt>260,40);
   vol.lookAt=camera.position;feel(vol,'surprised',4);
   yield* lines([VOL('Morning, hon, I just need your— names, and your street, and—',{time:3.4}),R('They’re with me. This one’s Sam.',{time:2.2}),{wait:.6,act:()=>{vol.lookAt=headOf(sam);feel(vol,'shocked',5);}},
    VOL('Sam. Sam from the— he’s on the board. He’s on the missing board.',{time:3.6}),{wait:.5}]);
   // she goes to the board and writes across his flyer
   vol.gest(null);vol.lookAt=null;{const a=W(-7.4,5.2),b=W(-2.1,6.5);vol.walk([[a.x,a.z],[b.x,b.z]],{speed:1.6,then:v2=>{v2.face(Math.PI);later(.9,()=>{boardFound();v2.gest('talk');later(2,()=>v2.gest(null));});}});}
   yield* lines([{wait:1.2},N('People look up. At Sam. At you.',{time:2.4}),{wait:1.6},N('Then past you, at the doors. Waiting to see who else comes in.',{time:3.6}),{wait:2.6},N('Nobody else comes in.',{time:2.4})]);
   // things you can do on the way, or not
   offer('board','Look at the board',()=>WQ(SP.board),{r:3,look:true,size:1.4,cone:.3,once:true,fn:()=>task('look-board',(function*(){yield* looking(WQ(SP.board),[N('ALEX. Since Sunday the twenty-first. SAM. Since Thursday. Somebody has just written FOUND across his.',{time:4.8}),
     N('And a third sheet, in ballpoint. JAMIE. Where the picture should be, the copier printed an empty square. Twice. She gave up and drew the square.',{time:6}),N('The rest is his mother’s handwriting.',{time:2.6})],{back:1.5,eye:1.4,kind:'board'});})())});
   offer('tv','Watch the television',()=>WQ(SP.tv),{r:5.2,look:true,size:1,cone:.3,once:true,fn:()=>task('look-tv',(function*(){yield* lines([V('TELEVISION','...what the county is calling a series of gas explosions and ground collapses along Oak Hollow Drive...',{time:4.6}),
     N('Your street, from a helicopter. It looks small. It looks like something that happened somewhere else.',{time:4.6}),V('TELEVISION','...residents describe a red sky. Officials have not confirmed any of those reports...',{time:4.2})]);})())});
   // water
   yield* until(()=>D(me(),W(SP.water.x,SP.water.z))<4.6||C.flags.reyesAtCots||C.pt>330,60);
   {const q=W(3.1,6.45);okafor.gest(G(ACT9.offer()));okafor.lookAt=camera.position;void q;}
   say([V('MR. OKAFOR','You boys take some water. Go on. There’s plenty.',{from:okafor,time:3})]);
   offer('water','Take a cup of water',()=>WQ({x:SP.water.x+.5,z:SP.water.z-.1,y:.86}),{r:2.6,look:true,size:.5,cone:.3,fn:()=>{CUP.holdBy(o.self,'r');phys.playerHold('r',CUP,{at:[.2,1.0,-.36]});sound('click',camera.position,{gain:.15});later(1,()=>{if(!busy())say([N('It’s cold. You hadn’t noticed you were thirsty. You’re so thirsty.',{time:3.4})]);});}});
   yield* until(()=>C.flags.water||C.flags.reyesAtCots&&D(me(),W(SP.seatYou.x,SP.seatYou.z))<5||C.pt>400,50);
   okafor.gest(G(ACT9.cup()));okafor.lookAt=null;unoffer('water');
   // the cots at the end of the row
   yield* until(()=>C.flags.reyesAtCots&&D(me(),W(SP.seatYou.x,SP.seatYou.z))<4.2||C.pt>470,90);
   yield* lines([R('Here. These two. Sit. I’m going to find out where your people are.',{time:3.6})]);
   offer('sit','Sit down',()=>WQ({x:SP.seatYou.x,z:SP.seatYou.z-.4,y:.6}),{r:2.3});
   {const s=SCH.cotSeat(17,1);pinSam({x:s.x,z:s.z+.06},{a:Math.PI,gesture:ACT.seat(SCH.COT_H,{hands:'knees',lean:.3,lookPitch:-.3})});}
   yield* until(()=>C.flags.sit||C.pt>500,14);
   if(C.flags.sit)sitYou();
   sceneJamieMom('gym');})());}
 function boardFound(){const t=fresh9('board','found');const m=SP.boardMesh?.material;if(m&&t){m.map=t;m.needsUpdate=true;}C.flags.boardFound=true;sound('c7Pencil',WQ(SP.board),{gain:.6});mark('FOUND, across his flyer');}
 function sitYou(){const s=SCH.cotSeat(16,1),w=W(s.x,s.z+.02);pose(w,{y:SCH.COT_H+.62,yaw:Math.PI,pitch:-.06,slow:1.3,seat:{h:SCH.COT_H,y:0}});C.flags.seated=true;if(phys.ME.hold.r?.prop===CUP){later(1.6,()=>{phys.playerHold('r',null);CUP.place(new THREE.Vector3(W(2.5,0).x,SCH.COT_H+.05,W(2.5,.12).z));});}
  offer('stand-up','Stand up',()=>({x:camera.position.x,y:camera.position.y+.3,z:camera.position.z}),{r:9,inPose:true,once:false,when:()=>posed()&&!busy()&&!C.choice,fn:()=>{unpose();C.flags.seated=false;}});}
 // ---- Act I, scene 2: Jamie's mother ----------------------------------------------------------------------------------------------------------
 function afterGymSetup(section){// the gym as the scenes after the walk find it: Sam on the cot, you beside him, Reyes at the cots
  schoolWorld('shelter',{lot:true,sky:'dawn',lights:'dawn'});setDay('AUGUST 27',section==='a1-families'?7.35:section==='a1-alex-parents'?7.05:6.8,'dawn');C.grief=1;applyGrief();lotCast();gymCast('after');boardFound();tvFootage();capTo('away');
  const s=SCH.cotSeat(16,1),w=W(s.x,s.z+.9);o.placePlayer({x:w.x,z:w.z,a:Math.PI,mode:'walk',bike:null});joinFoot(sam,W(5,1.2),Math.PI);{const s2=SCH.cotSeat(17,1);pinSam({x:s2.x,z:s2.z+.06},{a:Math.PI,gesture:ACT.seat(SCH.COT_H,{hands:'knees',lean:.3,lookPitch:-.3}),blend:.01});}
  const rq=W(SP.aisleN.x+.7,SP.aisleN.z+.2);reyes.show(true);reyes.place(rq.x,rq.z,Math.PI*1.4);C.flags.inGym=true;C.fadeIn=0;weep(sam,'grief',30);for(const a of EVERYONE)if(a.notice)a.notice.state='done';}
 const QUIET={jm:{x:7.5,z:1.3},reyes:{x:6.45,z:1.6},hen:{x:7.5,z:2.4}};// two chairs a little way off from the cots
 function sceneJamieMom(from='gym'){go('a1-jamie');if(from!=='gym')afterGymSetup('a1-jamie-mom');checkpoint('a1-jamie-mom');objective('','');
  const jm=jamieMom;C.flags.jm=true;
  task('jamie-mom',(function*(){
   yield* wait(from==='gym'?2.4:2);
   // she has heard "the missing board"; she comes down the aisle fast
   jm.gest(null);jm.lookAt=headOf(sam);feel(jm,'hopeful',8);{const a=W(-8.8,4.9),b=W(SP.aisleS.x-.4,SP.aisleS.z-.1),c=W(2.7,2.15);jm.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z]],{speed:2.3,then:q=>{q.faceTo(W(3.4,0).x,W(3.4,0).z);}});}
   yield* until(()=>!jm.walking,18);
   yield* lines([JM('Sam? Sam— oh my God. Oh, thank God. Thank God.',{time:3,face:'relieved'}),{wait:.5,act:()=>{jm.lookAt=camera.position;}},JM('And you. You’re both—',{time:1.8,face:'relieved'}),
    {wait:2.4,act:()=>{jm.lookAt=DOORPT;feel(jm,'hopeful',4);}},N('She looks past you. At the doors.',{time:2.4}),{wait:1.2,act:()=>{jm.lookAt=camera.position;feel(jm,'worried',8);}},
    JM('Where’s—',{time:1}),{wait:1.6},JM('There were three of you. I know there’s three. I’ve been saying it all night so I wouldn’t—',{time:4.4,face:'afraid'}),
    JM('Jamie. His name’s Jamie. Where’s Jamie?',{time:2.8,face:'afraid'})]);
   const ch=yield* choosing([{id:'start',label:'“He’s—”'},{id:'lily',label:'“He got Lily Henderson out.”'},{id:'reyes',label:'Look at Officer Reyes'}],{timeout:11,fallback:'silent'});
   C.keep.told.jamieMom=ch;keep('told',C.keep.told);
   if(ch==='start')yield* lines([Y('He’s—',{time:1}),N('It stops in your throat. There isn’t a way to say the rest of it.',{time:3.4})]);
   else if(ch==='lily')yield* lines([Y('He got Lily Henderson out. And her dad.',{time:2.6}),JM('He— what? Where is he? Where is he now?',{time:2.6,face:'afraid'}),{wait:1.4}]);
   else if(ch==='reyes')yield* lines([N('You look at Reyes. He is already coming.',{time:2.6})]);
   else yield* lines([N('Your mouth won’t do it.',{time:2.2})]);
   weep(sam,'crying',30);cry(.6,14);
   yield* lines([SM('I’m sorry. I’m so sorry. I’m so sorry—',{time:2.6,face:'crying'}),{wait:.8,act:()=>{feel(jm,'shocked',6);jm.lookAt=headOf(sam);}},JM('No.',{time:1}),{wait:1.2}]);
   // Reyes: not here, not from two boys
   {const w=W(2.2,1.5);reyes.walk([[w.x,w.z]],{speed:1.5,then:a=>a.faceTo(jm.x,jm.z)});}
   yield* lines([R('Ma’am. Come and sit with me. Please. Over here.',{time:3,act:()=>{jm.lookAt=reyes.pos;}})]);
   {const a=W(5.2,1.5),c=W(QUIET.jm.x-.5,QUIET.jm.z);jm.walk([[a.x,a.z],[c.x,c.z]],{speed:1,then:q=>{const w=W(QUIET.jm.x-.06,QUIET.jm.z);q.place(w.x,w.z,-Math.PI/2);q.gest(sitG(.44,{hands:'knees',lean:.05}));q.noBlock=true;q.lookAt=reyes.pos;C.flags.jmSat=true;}});
    const r1=W(5,2.1),r2=W(QUIET.reyes.x,QUIET.reyes.z);reyes.walk([[r1.x,r1.z],[r2.x,r2.z]],{speed:1,then:q=>{q.faceTo(W(QUIET.jm.x,QUIET.jm.z).x,W(QUIET.jm.x,QUIET.jm.z).z);q.gest(KNEEL);}});}
   yield* until(()=>C.flags.jmSat&&!reyes.walking,30);
   yield* lines([{wait:1.4},N('He gets down on one knee in front of her so she doesn’t have to look up.',{time:3.6}),R('I was there. I was with him.',{time:2.2}),
    R('The Hendersons’ house was coming down. He got their little girl out through the window. Then he went back in for her father and held a doorway up so the man could crawl out under it.',{time:7.2}),
    R('He got them both out. Then something came up out of the ground behind him.',{time:3.6}),R('I got to him. I tried, ma’am. I tried for a long time.',{time:3.4}),{wait:2.6,act:()=>{feel(jm,'numb',12);}},
    JM('He’s twelve.',{time:1.4,face:'numb'}),{wait:1.8},JM('He’s twelve. He can’t hold up a doorway.',{time:2.6}),R('He did.',{time:1.2}),{wait:3.4,act:()=>{feel(jm,'crying',40);jm.gest(G(ACT.mouth(ACT.seat(.44,{lean:.3,lookPitch:-.3}))));cry(.75,16);}},
    {wait:3},JM('I couldn’t think of his name last night. For an hour. I stood in his room and I could not—',{time:4.4,face:'crying'}),JM('What kind of a mother—',{time:1.6,face:'sobbing'}),
    R('It was doing that to every one of us. It did it to me. It’s stopped now.',{time:3.6}),{wait:2,act:()=>{jm.gest(G(ACT.headInHands({seatH:.44,rock:.5})));feel(jm,'sobbing',60);}}]);
   // the cap: yours to hold out, or to hold onto
   if(C.keep.cap==='you'){objective('','');capTo('hand');yield* lines([{wait:1.2},N('His cap is in your hand. You don’t remember taking it out.',{time:3.2})]);
    offer('cap','Hold out his cap',()=>headOf(jm),{r:2.4,inPose:false});
    yield* until(()=>C.flags.cap,34);unoffer('cap');
    if(C.flags.cap)yield* capWithHer(jm,'shelter');else{capTo('away');yield* lines([N('You keep hold of it. You put it back inside your shirt.',{time:3})]);}}
   else yield* wait(4);
   // Mrs. Henderson, who does not say anything
   {mrsH.gest(null);mrsH.noBlock=false;const s=SCH.cotSeat(13,1),a=W(s.x,s.z+.8),b=W(-6.2,1.45),c=W(.2,1.5),c2=W(.2,3.6),d=W(6.4,3.5),e=W(QUIET.hen.x-.5,QUIET.hen.z+.1);mrsH.place(a.x,a.z,Math.PI/2);
    mrsH.walk([[b.x,b.z],[c.x,c.z],[c2.x,c2.z],[d.x,d.z],[e.x,e.z]],{speed:1.15,then:q=>{const w=W(QUIET.hen.x-.06,QUIET.hen.z);q.place(w.x,w.z,-Math.PI/2);q.noBlock=true;q.gest(G(ACT.shoulder(asC(q),asC(jm),{hand:'l',base:ACT.seat(.44,{lean:.1})})));feel(q,'grief',60);}});}
   yield* lines([{wait:2},N('Mrs. Henderson gets up off her cot and walks the length of the gym and sits down in the chair next to her. She doesn’t say anything. She takes her hand.',{time:6.6}),{wait:2.4}]);
   reyes.gest(null);sceneAlexParents('gym');})());}
 // you have walked up to her with it. what was said is what she can manage.
 function* capWithHer(jm,when,{base=null}={}){const hp=headOf(jm);feel(jm,'tearful',30);jm.lookAt=camera.position;const seat=base||(when==='shelter'?ACT.seat(.44,{hands:'knees',lean:.12}):null);jm.gest(seat?G(seat):null);
  yield* lines([N('You hold it out. You don’t know what you’re supposed to say, so you don’t say anything.',{time:4}),{wait:1.6},JM('That’s his.',{time:1.4,face:'tearful'}),{wait:1.2}]);void hp;
  const ch=yield* choosing([{id:'give',label:'“It’s yours.”'},{id:'keep',label:'“I can keep it safe. Until you want it.”'}],{timeout:14,fallback:'keep'});
  if(ch==='give'){capTo('her',jm);jm.gest(G(ACT9.clutch({base:seat})));keep('cap','mom');keep('capWhen',when);feel(jm,'crying',40);sound('a1Theme',camera.position,{gain:.5});
   yield* lines([Y('It’s yours.',{time:1.4}),{wait:1.6},N('She takes it in both hands. She turns it over. Then she puts her whole face in it.',{time:4.6}),{wait:2},JM('It smells like him.',{time:2,face:'crying'}),{wait:2.4}]);}
  else{yield* lines([Y('I can keep it safe. Until you want it.',{time:2.8}),{wait:1.4},JM('Yes. You— yes. I can’t. Not yet.',{time:3,face:'crying'}),JM('Don’t lose it.',{time:1.4}),Y('I won’t.',{time:1})]);capTo('away');keep('capWhen',null);}}
 // ---- Act I, scene 3: Alex's parents -----------------------------------------------------------------------------------------------------------
 function sceneAlexParents(from='gym'){go('a1-alex');if(from!=='gym'){afterGymSetup('a1-alex-parents');put(jamieMom,QUIET.jm,-Math.PI/2,G(ACT.headInHands({seatH:.44,rock:.4})),{noBlock:true});feel(jamieMom,'sobbing',99);put(mrsH,QUIET.hen,-Math.PI/2,sitG(.44,{lean:.1}),{noBlock:true});const rq=W(QUIET.reyes.x,QUIET.reyes.z);reyes.place(rq.x,rq.z,Math.PI/2);}
  checkpoint('a1-alex-parents');const ad=alexDad,am=alexMom;
  task('alex-parents',(function*(){
   yield* wait(2.2);
   // his father first; his mother does not move
   ad.gest(null);ad.lookAt=headOf(sam);feel(ad,'hopeful',10);{const a=W(.2,-1.4),b=W(.2,1.5),c=W(2.6,2);ad.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z]],{speed:1.7,then:q=>q.faceTo(W(5,0).x,W(5,0).z)});}am.lookAt=headOf(sam);
   yield* until(()=>!ad.walking,16);
   yield* lines([AD('Sam.',{time:1,face:'hopeful'}),AD('They said you were on that board and now you’re not. They said you walked in here on your own two feet.',{time:4.6}),{wait:.6},
    AD('Was he where you were? Is that where he’s been? Was Alex there?',{time:3.6,face:'afraid'}),{wait:1,act:()=>{weep(sam,'crying',20);}},SM('He—',{time:.8,face:'crying'})]);
   const ch=yield* choosing([{id:'found',label:'“We found him.”'},{id:'out',label:'“He was alive. We got him out.”'},{id:'reyes',label:'Look at Officer Reyes'}],{timeout:11,fallback:'reyes'});C.keep.told.alexDad1=ch;keep('told',C.keep.told);
   if(ch==='reyes')yield* lines([N('You look across the gym at Reyes. Alex’s dad looks where you’re looking.',{time:3.6})]);
   else yield* lines([Y(ch==='found'?'We found him.':'He was alive. We got him out.',{time:2}),{wait:.4,act:()=>{feel(ad,'relieved',5);ad.lookAt=am.pos;}},AD('Out. He’s out— (across the gym) They got him OUT—',{time:2.8}),
    {wait:1.6,act:()=>{ad.lookAt=camera.position;feel(ad,'afraid',8);}},AD('...Why are you looking at me like that.',{time:2.4})]);
   // Reyes takes them to the wall by the bleachers; it is not far; you can hear some of it
   {const w=W(3.6,2.2);reyes.gest(null);reyes.walk([[W(6.4,1.4).x,W(6.4,1.4).z],[w.x,w.z]],{speed:1.5,then:a=>a.faceTo(ad.x,ad.z)});}
   yield* until(()=>!reyes.walking,14);
   yield* lines([R('Sir. I need you and your wife to come with me. Just over here.',{time:3.2})]);
   am.gest(null);am.noBlock=false;{const s=SCH.cotSeat(3,1),a=W(s.x,s.z+.75);am.place(a.x,a.z,Math.PI/2);}
   const side={r:{x:7.6,z:-6.55},d:{x:8.9,z:-6.9},m:{x:8.6,z:-6.05}};
   {const a=W(6.4,1.4),b=W(6.6,-4.2),c=W(side.r.x,side.r.z);reyes.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z]],{speed:1.2,then:q=>q.face(Math.PI/2)});
    const d1=W(6.5,1.6),d2=W(7,-4.4),d3=W(side.d.x,side.d.z);ad.walk([[d1.x,d1.z],[d2.x,d2.z],[d3.x,d3.z]],{speed:1.15,then:q=>q.face(-Math.PI/2)});
    const m1=W(.2,-4.25),m2=W(6.2,-4.3),m3=W(side.m.x,side.m.z);am.walk([[m1.x,m1.z],[m2.x,m2.z],[m3.x,m3.z]],{speed:.95,then:q=>q.face(-Math.PI/2)});}
   yield* lines([{wait:3},N('His mother gets up by herself. She walks very straight.',{time:3.2})]);
   yield* until(()=>!am.walking&&!ad.walking&&!reyes.walking,40);
   yield* lines([{wait:1},R('We got him out. These two got him out. He was alive, and he was talking, and he came up into the air with us.',{time:5.6}),
    R('There was an accident at the hatch. He was hurt, badly. He died about an hour ago. At the oak, at the end of Oak Hollow.',{time:5.4,act:()=>{feel(ad,'shocked',10);feel(am,'numb',60);}}),
    R('An officer is with him. He has not been by himself for one minute.',{time:3.4}),{wait:2.6,act:()=>{ad.gest(G(ACT9.eyes()));feel(ad,'grief',60);}},
    AM('At the oak.',{time:1.4,face:'numb'}),R('Yes, ma’am.',{time:1}),{wait:1.6},AM('He liked that tree.',{time:1.8}),{wait:2.4},AM('I am going to him. Now. Somebody is going to drive me.',{time:3.2}),R('I’ll have a car at the door.',{time:1.8}),{wait:1}]);
   // his mother, on her way to the doors, stops at the two of you
   {const a=W(6.4,-4.3),b=W(6.4,1.5),c=W(4.2,1.55);am.lookAt=null;am.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z]],{speed:1,then:q=>{q.faceTo(W(5,0).x,W(5,0).z);q.lookAt=headOf(sam);}});}
   yield* until(()=>!am.walking,30);
   am.gest(G(ACT9.offer({hand:'r'})));yield* lines([{wait:1.2},N('She stops in front of Sam. She pulls the collar of his shirt straight. Her hands know how to do that.',{time:5}),AM('You’re freezing. Both of you. Why hasn’t anybody—',{time:2.6,face:'numb'}),
    AM('Can somebody get these boys a blanket.',{time:2.2}),{wait:1.4}]);
   am.gest(null);am.lookAt=null;{const a=W(SP.aisleS.x,SP.aisleS.z),b=W(-3,5.2),c=W(SP.gymDoor.x,SP.gymDoor.z+.4),d=W(SP.vest.x,SP.vest.z+.8);am.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z],[d.x,d.z]],{speed:1.05,then:q=>{q.show(false);}});}
   blanket(sam.person?{person:sam.person}:null,0x8c8982);
   // his father comes back, and sits down across from you, and asks
   {const a=W(6.6,-4.3),b=W(6.4,1.5),c=W(3.3,1.75);ad.gest(null);ad.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z]],{speed:.9,then:q=>{const s=SCH.cotSeat(22,-1),w=W(s.x+.9,s.z+.05);q.place(w.x,w.z,0);q.noBlock=true;q.gest(sitG(SCH.COT_H,{hands:'knees',lean:.3}));q.lookAt=camera.position;C.flags.adSat=true;}});}
   yield* until(()=>C.flags.adSat,40);
   yield* lines([{wait:2.2},N('His dad comes back. He sits down on the cot across from you with his elbows on his knees. It’s a while before he can.',{time:5.4}),AD('Officer Reyes says you were with him. At the end.',{time:3,face:'grief'}),{wait:.8},AD('Did he say anything?',{time:1.6})]);
   const c2=yield* choosing([{id:'stop',label:'“He asked if we stopped it.”'},{id:'mad',label:'“He said his mom would be so mad.”'},{id:'bikes',label:'“He talked about our bikes.”'},{id:'silent',label:'Say nothing'}],{timeout:16,fallback:'silent'});C.keep.told.alexDad2=c2;keep('told',C.keep.told);
   if(c2==='stop')yield* lines([Y('He asked if we stopped it. We said yes. He said, “Good.”',{time:3.6}),{wait:1.6},AD('...Good. Yeah. That’s— that’s him.',{time:2.8,face:'crying'})]);
   else if(c2==='mad')yield* lines([Y('He said his mom was going to be so mad.',{time:2.6}),{wait:1.2},N('A sound comes out of him that is almost a laugh.',{time:2.6}),AD('She is. She is going to be so mad at him.',{time:2.8,face:'crying'})]);
   else if(c2==='bikes')yield* lines([Y('He talked about our bikes.',{time:1.8}),{wait:1.4},AD('He rang that bell at every corner. Twice. It drove me up the wall.',{time:3.6,face:'crying'})]);
   else yield* lines([{wait:1.6},AD('That’s all right, son. You don’t have to.',{time:2.6,face:'grief'})]);
   cry(.7,14);
   yield* lines([{wait:2.2},AD('He didn’t die down there. In the dark. You got him up into the daylight.',{time:4.4}),AD('I need you to know that I know that.',{time:2.6}),{wait:2.6}]);
   ad.gest(null);ad.noBlock=false;ad.lookAt=null;{const s=SCH.cotSeat(22,-1),w=W(s.x+.9,s.z+.7);ad.place(w.x,w.z,Math.PI);const a=W(SP.aisleS.x,SP.aisleS.z),b=W(-3,5.2),c=W(SP.gymDoor.x,SP.gymDoor.z+.4),d=W(SP.vest.x,SP.vest.z+.8);ad.walk([[a.x,a.z],[b.x,b.z],[c.x,c.z],[d.x,d.z]],{speed:1,then:q=>q.show(false)});}
   yield* wait(3);sceneFamilies('gym');})());}
 // ---- Act I, scene 4: Sam's father; your mother ----------------------------------------------------------------------------------------------------
 function sceneFamilies(from='gym'){go('a1-family');if(from!=='gym'){afterGymSetup('a1-families');put(jamieMom,QUIET.jm,-Math.PI/2,G(ACT.headInHands({seatH:.44,rock:.3})),{noBlock:true});feel(jamieMom,'crying',99);put(mrsH,QUIET.hen,-Math.PI/2,sitG(.44,{lean:.1}),{noBlock:true});
   alexMom.show(false);alexDad.show(false);const rq=W(8.6,2.4);reyes.place(rq.x,rq.z,-Math.PI/2);reyes.gest('radio');blanket({person:sam.person,worn:(sam.worn||={})},0x8c8982);}
  checkpoint('a1-families');const sd=samDad,sm=samMom;
  task('families',(function*(){
   yield* wait(2.4);
   // the doors: his father stops when he sees him
   {const a=W(SP.gymDoor.x,SP.gymDoor.z-.2),b=W(-3,5.2),c=W(SP.aisleS.x-1.6,SP.aisleS.z-.3);sd.show(true);sd.place(a.x,a.z,0);sd.gest(null);sm.show(true);sm.place(a.x+.8,a.z+.9,0);sm.gest(null);feel(sd,'afraid',12);feel(sm,'afraid',12);
    sd.walk([[b.x,b.z],[c.x,c.z]],{speed:2.2,then:q=>{q.faceTo(W(5,0).x,W(5,0).z);q.lookAt=headOf(sam);}});sm.walk([[b.x+.5,b.z+.9],[c.x-.9,c.z+.6]],{speed:2.1,then:q=>{q.faceTo(W(5,0).x,W(5,0).z);q.lookAt=headOf(sam);q.gest(G(ACT.mouth()));}});}
   yield* until(()=>!sd.walking,16);
   yield* lines([SD('Sam.',{time:1.2,face:'shocked'})]);
   // Sam gets up. He does not go to him.
   pinSam(null);{const w=W(4.6,1.25);stand(sam,w,{look:()=>headOf(sd),face:Math.PI*1.2,max:1.2});}weep(sam,'afraid',14);
   yield* lines([{wait:1.6},N('Sam gets up off the cot. He doesn’t go to him.',{time:3}),SM('Say something.',{time:1.4,face:'afraid'}),SD('Sam, it’s me, it’s—',{time:1.6}),SM('Say something it wouldn’t know.',{time:2.2,face:'afraid'}),{wait:2.4},
    SD('I left your fan on.',{time:1.8,face:'tearful'}),SD('Every night. I kept going in your room and turning it back on, and I didn’t know why I was doing it.',{time:5.2,face:'tearful'}),{wait:1.2,act:()=>{weep(sam,'sobbing',40);}}]);
   // and then he does
   stand(sam,()=>({x:sd.x+Math.sin(sd.a)*1.05,z:sd.z-Math.cos(sd.a)*1.05}),{look:null,face:()=>headingTo(sam.px,sam.pz,sd.x,sd.z),max:2.8});
   yield* until(()=>Math.hypot(sam.px-sd.x,sam.pz-sd.z)<1.5,7);
   {const q=SCH.toL(sd.x+Math.sin(sd.a)*.4,sd.z-Math.cos(sd.a)*.4);pinSam(q,{a:headingTo(sam.px,sam.pz,sd.x,sd.z),gesture:ACT.embrace(sam,asC(sd),{k:1}),blend:.55});}
   yield* until(()=>Math.hypot(sam.px-sd.x,sam.pz-sd.z)<.6,3);
   sd.lookAt=null;sd.gest(G(ACT9.hold(asC(sd),sam,{bend:.3})));feel(sd,'crying',60);sm.lookAt=null;{const w={x:sam.px+.5,z:sam.pz+.45};sm.walk([[w.x,w.z]],{speed:1.6,then:q=>{q.faceTo(sam.px,sam.pz);q.gest(G(ACT9.gather(asC(q),sam,{k:1})));feel(q,'crying',60);}});}
   cry(.5,10);
   yield* lines([{wait:1.4},SD('I’ve got you. I’ve got you. I’ve got you.',{time:3,face:'crying'}),SMO('Look at you. Look at your face. Oh, my baby—',{time:3,face:'crying'}),{wait:2.6},
    SM('Jamie’s dead.',{time:1.4,face:'sobbing'}),SM('Dad. Alex is dead. They’re both— we got them out and they’re both—',{time:4,face:'sobbing'}),{wait:1.6,act:()=>{feel(sd,'grief',60);sd.lookAt=camera.position;}},
    N('His dad looks at you over the top of Sam’s head. Then across the gym, at Jamie’s mother.',{time:4.6}),{wait:1.4,act:()=>{sd.lookAt=null;}},SD('I know. I know. Reyes told us at the door.',{time:3,face:'grief'})]);
   // your mother
   {const a=W(SP.gymDoor.x,SP.gymDoor.z-.2),b=W(-3.2,5.3);mom.show(true);mom.place(a.x,a.z,0);mom.gest(null);feel(mom,'afraid',10);mom.lookAt=camera.position;mom.walk([[b.x,b.z]],{speed:1.5,then:q=>{C.flags.momIn=true;}});}
   yield* until(()=>C.flags.momIn,12);
   if(posed()){unpose();C.flags.seated=false;unoffer('stand-up');}
   yield* lines([{wait:.6},N('And then, at the doors: your mom.',{time:2.4}),{wait:.8},N('She doesn’t call out. She sees you, and stops, and then she’s coming.',{time:3.6})]);
   {const hug=()=>{const p=me(),h=headingTo(mom.x,mom.z,p.x,p.z);return [p.x-Math.sin(h)*.5,p.z+Math.cos(h)*.5];};const [hx,hz]=hug();mom.walk([[W(SP.aisleS.x-1,SP.aisleS.z+.3).x,W(SP.aisleS.x-1,SP.aisleS.z+.3).z],[hx,hz]],{speed:2.6,then:q=>{q.faceTo(me().x,me().z);q.lookAt=null;C.flags.momHere=true;}});}
   yield* until(()=>C.flags.momHere,22);
   // she has you: the view goes into her shoulder
   {const p=me(),h=headingTo(p.x,p.z,mom.x,mom.z);const self={px:p.x,pz:p.z,pa:h,person:o.self};mom.gest(G(ACT9.hold(asC(mom),self,{bend:.42})));feel(mom,'crying',60);
    pose({x:p.x+Math.sin(h)*.16,z:p.z-Math.cos(h)*.16},{y:gy(p.x,p.z)+1.33,yaw:h,pitch:-.34,slow:.9,stand:true});}
   cry(.9,20);sound('a1Cloth',camera.position,{gain:.5});
   yield* lines([{wait:1.6},MO('I’ve got you. I’ve got you. I’ve got you.',{time:3.4,face:'crying'}),{wait:1.6},N('She’s shaking. Or you are.',{time:2.4}),{wait:1.6},
    MO('I went down to that creek with a flashlight. I went up and down that street all night calling—',{time:4.6,face:'crying'}),MO('Never mind. Never mind. You’re here.',{time:2.8}),{wait:2.4}]);
   unpose();mom.gest(G(ACT9.offer({hand:'l'})));mom.lookAt=camera.position;
   if(C.keep.cap==='you'){capTo('hand');yield* lines([{wait:1.2},N('She holds you back at arm’s length to look at you. She sees what’s in your hand.',{time:4}),MO('Whose is—',{time:1}),{wait:1.6,act:()=>feel(mom,'grief',20)},MO('Oh. Oh, honey.',{time:2.2,face:'grief'})]);capTo('away');}
   else yield* lines([{wait:1.2},N('She holds you back at arm’s length to look at you. Then she looks where you’re looking: Jamie’s mother, across the gym, with his cap in her lap.',{time:6}),{wait:1,act:()=>feel(mom,'grief',20)},MO('Oh, no. Oh, no, no.',{time:2.4,face:'grief'})]);
   mom.gest(null);
   yield* lines([{wait:1.2},MO('You don’t have to do one more thing today. Not one. I’m right here.',{time:3.8}),{wait:2.6},
    N('Sam’s dad has Sam. Your mom has you. There are grown-ups everywhere, and it’s their job now.',{time:4.8}),{wait:2},N('It doesn’t feel like it’s over. It feels like the part of a fall before you land.',{time:4.4}),{wait:2.4}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>sceneQuiet('families');})());}
 // ---- Act II: in aftermath1-town.js's sibling below (kept in this file: the school is one place) ----------------------------------------------------
 function sceneQuiet(from='jump'){ACT2.sceneQuiet(from);}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------------------
 function update(dt){const ph=S.phase;updateSchool(dt);updateRoutines(dt);TOWN.update?.(dt);ACT2.update?.(dt);
  if(ph==='a1-arrive'&&C.flags.reyesHere&&C.flags.reyesHereAt===undefined)C.flags.reyesHereAt=C.pt;
  if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/5));if(C.endT>5.6){C.endT=-1;go('a1-end');end();}}}
 function afterActors(dt){updatePin(dt);
  // your hand out to his handlebars, while you hold F
  if(C.reachSam>0&&phys){const g=sam.bike.group;if(!phys.playerBusy()&&!C.reaching){C.reaching=true;phys.playerReach({at:()=>{g.updateMatrixWorld(true);return new THREE.Vector3(-.26,1.0,-.38).applyMatrix4(g.matrixWorld);},dur:[.5,.9,.4],carry:false,low:false,then:()=>{C.reaching=false;}});}}
  TOWN.afterActors?.(dt);ACT2.afterActors?.(dt);}
 function sources(out){const ph=S.phase;
  if(SCH.ST.on){const c=camera.position,wh=SCH.where(c.x,c.z),inside=wh!=='lot';
   if(SCH.ST.state==='shelter'||SCH.ST.state==='thin'){const q=WQ({x:0,z:0,y:2});out.push({id:'a1-murmur',kind:'murmur',pos:V3(q),level:(SCH.ST.state==='shelter'?1:.55)*(inside?1:.35)});out.push({id:'a1-vent',kind:'ac',pos:V3(WQ({x:-8,z:-6,y:6})),level:inside?.5:.1});
    if(TV.on)out.push({id:'a1-tv',kind:'tv',pos:V3(WQ(SP.tv)),level:.55});}
   else if(SCH.ST.state==='memorial'){out.push({id:'a1-murmur',kind:'murmur',pos:V3(WQ({x:0,z:0,y:2})),level:.3*(inside?1:.3)});out.push({id:'a1-vent',kind:'ac',pos:V3(WQ({x:-8,z:-6,y:6})),level:inside?.35:.1});}
   if(SCH.ST.lot){out.push({id:'a1-amb-idle',kind:'idle',pos:V3(WQ({x:SP.truck.x,z:SP.truck.z,y:1})),level:.8});out.push({id:'a1-gen',kind:'generator',pos:V3(WQ({x:SP.tower.x,z:SP.tower.z,y:1})),level:.6});out.push({id:'a1-radio',kind:'radio',pos:V3(WQ({x:-38.6,z:38,y:1.2})),level:.8});
    if(ph==='a1-arrive'||ph==='a1-gym')out.push({id:'a1-siren-far',kind:'siren',pos:V3(WQ({x:260,z:-240,y:8})),level:.2,mode:'wail',pitch:1,muffle:.4});}}
  TOWN.sources?.(out);ACT2.sources?.(out);}
 function blockers(out){ACT2.blockers?.(out);TOWN.blockers?.(out);}
 function key(code,repeat){return !!(TOWN.key?.(code,repeat)||ACT2.key?.(code,repeat));}
 function hint(){return TOWN.hint?.()||ACT2.hint?.()||null;}
 function reset(){SCH.reset();o.hideWorld?.(false);if(nav.room===SCH.nav)nav.setRoom(null);unwear();ROUT.clear();PIN.q=null;TV.on=false;C.area=null;capG.visible=false;cupG.visible=false;if(phys){phys.playerHold('l',null);phys.playerHold('r',null);}
  if(SP.boardMesh?.material&&C.flags?.boardFound){const t=tex9('board','shelter');SP.boardMesh.material.map=t;SP.boardMesh.material.needsUpdate=true;}
  for(const a of EVERYONE){a.routine=null;a.notice=null;a.noBlock=false;}k.carA.show(false);k.carB.show(false);police.attach?.(false);TOWN.reset?.();ACT2.reset?.();}
 // ---- begin, jumps -------------------------------------------------------------------------------------------------------------------------------------
 function begin(){go('a1-black');C.cardT=0;o.fade(1);objective('');minds('tense');task('open',(function*(){yield* wait(6.4);sceneArrive('start');})());}
 const HX={...X,SCH,SP,W,WQ,D,put,sitG,lieG,KNEEL,onCot,lieOn,blanket,bandage,splint,pace,notices,leadTo,pinSam,PIN,schoolWorld,gymLights,GL,capTo,CAP,CUP,capG,cupG,capWithHer,canon,after,SPd,VOL,MRSH,QUIET,gymCast,boardFound,tvFootage,TV,DOORPT,ROUT};
 const ACT2=recordActs(HX);HX.ACT2=ACT2;
 const TOWN=townActs(HX);HX.TOWN=TOWN;
 const SCENE={'aftermath1-start':()=>begin(),'a1-arrive':()=>sceneArrive('jump'),'a1-gym':()=>sceneGym('jump'),'a1-jamie-mom':()=>sceneJamieMom('jump'),'a1-alex-parents':()=>sceneAlexParents('jump'),'a1-families':()=>sceneFamilies('jump'),...ACT2.SCENE,...TOWN.SCENE};
 function jump(section){const f=SCENE[section];if(!f){begin();return;}canon(section);f();if(section!=='aftermath1-start'){o.fade(C.fadeIn>=0?1:0);}}
 return {begin,jump,update,afterActors,key,hint,sources,blockers,reset,canDismount:()=>S.phase==='a1-arrive'||!!TOWN.canDismount?.(),canRemount:()=>!!TOWN.canRemount?.(),SCH,SCENE,TOWN,TV,capTo,PIN};
}
