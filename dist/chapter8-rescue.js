// Chapter Eight, Act III, rebuilt: bring them home. Three rescues, each its own set piece with an approach, a recognition, a
// mechanism that needs the friend inside as much as you outside, an escape that is a second problem, and a change in the works
// that the boys see and cannot explain yet (the BARRIER LOAD panel in the junction hall: D3, E2, F2).
//
//  Sam     the flooded wing. A voice from the old speaker on the wall (his, too clean) and knocking from a cell (his, real).
//          The water is live where a lamp cable hangs in it. Trust: his own notebook, wet, real, in his hands (a copy only ever
//          talks; it has never once handed him anything). The breaker; the drain wheel (loud: it comes); the crank, which
//          needs Sam on the catch inside at the moment you turn it; the frame is bent: a pipe under the door; he crawls out.
//          When he is out the wing floods back and its flood door comes down: you hold its brake for him, he holds its chain
//          for you.
//  Jamie   the hunter's retrieval wing. It brings Jamie back to his cell, in front of you, and bends the bar on his door.
//          Sam holds the grille up; you go under. It walks the wing, puts its face to every door, goes where it hears
//          things (bolts thrown, G). Jamie at his slot, both hands over his mouth. The duct from his cell to the next one:
//          you unbolt its cover, he squeezes through, sticks; you pull. It finds his cell empty and tears the door out. The
//          den, its bore, F0, H, the crew room; Jamie wedges the door with a locker while it hits it.
//  Alex    the corridor that does not stay the same (it closes ahead of you; a papered passage opens beside it and shuts
//          behind you), the room it made for him, his voice behind the closet that is his cell door: he has had his
//          friends brought to him before. Proof: his camera. A picture of the three of you, now, under the door: Jamie's face
//          is cut. "They're never hurt." Two levers, two people. Jamie goes in to him. When he steps out the room it made
//          comes apart, the floor splits behind you, the wall breaks through onto the ledge along the main chamber, where the
//          last barrier is giving way; along it to H's broken window.
//  four    the crew room: all four of them, for a while.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {newPose,copyPose,applyPose} from './rig.js';
import {ACT,feel} from './chapter8-acting.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {CX} from './chapter8-complex.js';

export function rescueActs(X){
 const {o,k,C,S,presence,H,HM,reyes,jamie,sam,comp,sound,gy,light,lightsOn,checkpoint,later,mark,say,J,SM,AL,R,RR,Y,N,V,task,stopTask,wait,until,lines,quiet,offer,unoffer,V3,near,lookingAt,
  closeLook,endLook,looking,choosing,fail,hazard,huntStart,huntStop,noise,me,go,objective,busy,nav,camera,scene,stand,walkTo,joinFoot,leave,minds,date,HOUR,CM,enterComplex,lightsBelow,hide,pose,unpose}=X;
 const W=(x,z,y)=>({x:CX.x+x,z:CX.z+z,y});
 const at=(n,y)=>CM.at(n,y);
 const cell=()=>CM.cellIdAt(me().x,me().z);
 const lit=(i,x,z,y,o2)=>light(i,W(x,z,y),o2);
 const playerAt=(n,a,dx=0,dz=0)=>{const q=at(n);o.placePlayer({x:q.x+dx,z:q.z+dz,a,mode:'walk',bike:null});};
 const crouched=()=>(o.foot.crouch??0)>.45;
 const hold=(c,q,g,look)=>stand(c,q,{gesture:g,look:look||null,max:1.4});
 const face=(c,expr,t=5)=>feel(c,expr,t);
 // ---- the wing's own lights (the old circuit, on its breaker): on, flickering; off, nothing but your flashlight ------------------------
 function wingLights(on){C.areaLock=true;for(let i=0;i<6;i++)light(i,null);lit(0,0,27,.9,{intensity:4,dist:12});lit(1,8,27,.9,{intensity:4,dist:12});
  if(on){lit(2,-12,27,-.6,{intensity:2.6,dist:9,color:0xd8e0c0,flicker:.35});lit(3,-20,27,-.6,{intensity:2.2,dist:9,color:0xd8e0c0,flicker:.5});lit(4,-29,27,-.8,{intensity:1.6,dist:7,color:0xc8d0b0,flicker:.6});}
  C.area='D*';}
 function eLights(){C.areaLock=true;for(let i=0;i<6;i++)light(i,null);lit(0,4,27,.9,{intensity:3.5,dist:12});lit(1,17,27,-.2,{intensity:3,dist:10,color:0xffd6a0});lit(2,26,27,-.4,{intensity:1.6,dist:8,color:0xffc890,flicker:.4});
  lit(3,37.5,27,-1,{intensity:1.1,dist:7,color:0xb08070,flicker:.2});C.area='E*';}
 // ---- Sam, in the flooded wing ---------------------------------------------------------------------------------------------------------------------
 const SAMIN=()=>{const q=at('samIn');return {x:q.x,z:q.z-1.9};};// (just behind his door, at its slot)
 function samBehindDoor(g){joinFoot(sam,SAMIN(),0);sam.boost=1;hold(sam,SAMIN(),g||ACT.slump(),()=>camera.position);}
 function sceneWing(from='wing'){go('e8-sam');C.where==='below'||enterComplex('jMid',-Math.PI/2);if(from!=='wing-cont'){C.where='below';}
  C.h=Math.max(C.h,HOUR.wing);C.hMin=HOUR.wing;date(C.h);leave(jamie);CM.setDoor('dIso',1,{instant:true});
  const dry=from==='door'||from==='out',out=from==='out';CM.ST.breaker=dry?1:0;CM.ST.waterWant=dry&&!out?-.33:0;CM.ST.water=CM.ST.waterWant;wingLights(!dry);
  if(from==='wing'){playerAt('jMid',-Math.PI/2,2,1);checkpoint('c8-wing');}
  else if(from==='sam'){playerAt('samLook',Math.PI,0,-.4);checkpoint('c8-sam');Object.assign(C.flags,{samVoice:true,samKnock:true});}
  else if(from==='door'){playerAt('samLook',Math.PI,.5,-.6);checkpoint('c8-sam-door');Object.assign(C.flags,{samVoice:true,samKnock:true,samTrust:true,breakerOff:true,drained:true,wingHunt:true});}
  else if(out){playerAt('samLook',Math.PI,.6,-.9);checkpoint('c8-sam-out');Object.assign(C.flags,{samVoice:true,samKnock:true,samTrust:true,breakerOff:true,drained:true,wingHunt:true,samFree:true});}
  if(!out)samBehindDoor();else{joinFoot(sam,{x:at('samLook').x-.6,z:at('samLook').z-.4},0);}
  CM.setDoor('samCell',out?.45:0,{instant:true});
  task('sam',(function*(){
   // -- the approach: the panel, then the wing; two Sams --------------------------------------------------------------------
   if(from==='wing'){objective('Find Sam.','The flooded wing: west of the junction hall.');
    offer('panel','Look at the panel',()=>at('jPanel',1.75),{r:2.6,look:true,size:.9,cone:.2,fn:()=>task('panel',(function*(){yield* looking(at('jPanel',1.75),[N('A steel cabinet, 1959. BARRIER LOAD — CHAMBER CIRCUIT. Three dials like the ones in the film. D3. E2. F2.',{time:4.6}),
      N('All three needles are up, in HELD. Three green lamps.',{time:2.6})],{back:1.7,eye:1.55});C.flags.panelSeen=true;mark('the load panel');})())});
    yield* until(()=>/^D/.test(cell()||'')||C.pt>300);
    sound('c8Spark',at('dCable',-.9),{gain:1});
    yield* lines([N('The wing is flooded to your shins. Its old lights buzz and stutter. Halfway down, a ceiling lamp has come off its fixing: its cable hangs down the far wall into the water, and spits.',{time:5.4})]);
    C.flags.samVoice=true;}
   if(!C.flags.samTrust){
    // the voice from the horn, the knocking from the cell (the chapter's update repeats both while you are in the wing)
    if(from==='wing'){yield* wait(1.2);
     yield* lines([V('SAM’S VOICE — FROM THE SPEAKER ON THE WALL','Hey! Over here! I’m in the end room, by the big wheel. Come on, hurry!',{time:3.6}),N('Sam’s voice. Clear and calm. It comes out of the grey speaker horn on the wall, not from down the wing.',{time:4.2})]);
     yield* wait(2.4);sound('c8Knock',at('samSlot',-1.5),{gain:.9});
     yield* lines([N('Under the buzzing, from one of the cells: knocking. Three. Then three again. Weak.',{time:3.6})]);C.flags.samKnock=true;}
    objective('Find Sam.','The voice says the end room. The knocking is from a cell.');
    // the slot in his door: him, at last, and a choice of what to give him
    offer('slot','Look through the slot',()=>at('samSlot',1.45),{r:1.6,look:true,size:.35,cone:.18,once:false,when:()=>!C.flags.samTrust&&!busy(),fn:()=>task('slot',(function*(){
     closeLook(at('samSlot',1.45),{back:.42,eye:1.45,floor:-3.45,kind:'slot'});face(sam,'afraid',8);
     yield* lines([N('Eyes, right there behind the bars. Sam. His face is grey with dirt, his lips cracked. He pulls back from the light.',{time:4.2}),
      SM('Don’t. Don’t talk. It does voices. It did you before. It did my mom.',{time:3.6,face:'terrified'})]);
     let got=null,tries=0;while(!got){const opts=[{id:'say',label:'“Sam, it’s me.”'},{id:'knock',label:'Knock back: three, and three'}];if(C.inv.notebook==='have')opts.push({id:'book',label:'Push his notebook under the door'});
      const ch=yield* choosing(opts,{timeout:60,fallback:C.inv.notebook==='have'?'book':'say'});tries++;
      if(ch==='say')yield* lines([SM('That’s what it says. Every time. That’s exactly what it says.',{time:3,face:'afraid'})]);
      else if(ch==='knock'){sound('c8Knock',at('samSlot',-1.5),{gain:.6});yield* lines([SM('Anybody can knock.',{time:2})]);}
      else got=ch;if(tries>4&&!got)break;}
     if(got==='book'){C.inv.notebook='given';sound('window',at('samSlot',-3.3),{gain:.4});
      yield* lines([N('You push it through the gap under the door. Wet, swollen, his. A long silence on the other side.',{time:4}),N('Then the pages turning.',{time:2})]);
      yield* lines([SM('This is my notebook.',{time:2}),SM('It’s wet. It’s real. It— it talks, it never gives you anything. Not once.',{time:3.6}),
       N('He’s reading. The last page: your writing, from Friday night. ALEX. JAMIE. SAM. And under it: JAMIE — FRIDAY. THE THING FROM THE COURT.',{time:5}),
       SM('...Jamie? It got Jamie too?',{time:2.4,face:'shocked'}),Y('Last night. It’s down here. We’re getting him. We’re getting all of you.',{time:3}),
       SM('Okay. Okay.',{time:1.6,face:'relieved'}),N('His fingers come through the bars. They’re freezing. You hold on to them.',{time:3.4})]);
      C.flags.samTrust=true;mark('Sam trusts you');
      yield* lines([SM('At the gate. Two-B. The brake was already gone. You didn’t do anything wrong, okay? It came up the channel and it just— took me under.',{time:5.2,face:'sad'}),
       SM('The crank for this door is on the wall out there. The water’s in its gears. And the light— don’t go near that cable. The water’s live there.',{time:5,face:'worried'}),
       SM('Kill the breaker by the door you came in. Then the big wheel in the end room: it drains the wing. It’s loud. It’ll hear.',{time:4.4,face:'determined'})]);}
     endLook();})())});
    yield* until(()=>C.flags.samTrust);unoffer('slot');checkpoint('c8-sam');}
   // -- the breaker: the lights go, the cable goes quiet ----------------------------------------------------------------------
   if(!C.flags.breakerOff){objective('Cut the power.','The breaker on the wall by the junction hall.');
    offer('breaker','Pull the breaker',()=>at('dBreaker',-1.4),{r:1.8,hold:1.1,fn:()=>{C.flags.breakerOff=true;CM.ST.breaker=1;sound('c8SteelDoor',at('dBreaker',-1.4),{gain:.5});sound('c8Spark',at('dCable',-.9),{gain:.7});wingLights(false);o.setFlashlight?.(true,true);mark('breaker off');}});
    yield* until(()=>C.flags.breakerOff);
    yield* lines([N('Everything in the wing goes out at once. The buzz stops. The cable hangs dead in the water. Just your flashlight now.',{time:4.2}),SM('(through the door) Good. Now the wheel. Be quick.',{time:2.4})]);}
   // -- the drain: loud; it comes ---------------------------------------------------------------------------------------------
   if(!C.flags.drained){objective('Drain the wing.','The big wheel in the end room. Hold F.');
    offer('drain','Turn the drain wheel',()=>at('dValve',-2.15),{r:1.9,hold:6,noise:1.4,when:()=>!C.hunt,tick:()=>{CM.ST.valveV=4;if(Math.random()<.06)sound('c8Scrape',at('dValve',-2),{gain:.4});},fn:()=>{C.flags.drained=true;CM.ST.waterWant=-.33;sound('c8Wave',at('dValve',-3),{gain:.9});mark('drained');}});
    yield* until(()=>C.flags.drained||(C.hold.drain||0)>.55);
    // it heard the wheel. It comes in from the junction hall and walks the wing
    if(!C.flags.wingHunt){C.flags.wingHunt=true;yield* lines([{wait:.3},SM('(far behind you, through his door) Stop. STOP. It’s coming. Get down— behind the pipes!',{time:3.4,face:'terrified'})]);
     huntStart({ids:['D','D0','D1','D2','J'],cells:['D'],at:at('jWest'),catchTo:'c8-sam',range:11,fov:1.15,speedK:.85});
     H.script([{to:()=>[at('dWest').x+18,at('dWest').z],speed:1.1,state:'walk'},{wait:1.6,state:'alert',look:()=>at('dValve',-1.6),sound:'c8Sniff'},{to:()=>[at('samDoor').x,at('samDoor').z-.9],speed:.9,state:'stalk'},
      {face:[at('samDoor').x,at('samDoor').z],state:'peek'},{wait:2.2,state:'peek',sound:'c8Sniff'},{to:()=>[at('dWest').x-.5,at('dWest').z],speed:.9,state:'stalk'},{wait:2.4,state:'idle',look:()=>at('dHide',0)},
      {to:()=>[at('jWest').x,at('jWest').z],speed:1.3,state:'walk'},{act:()=>{huntStop();C.flags.wingClear=true;mark('it left the wing');}}]);
     offer('hide-D0','Get down behind the pipes',()=>at('dHide',-2.4),{r:2,once:false,when:()=>!C.hiding,fn:()=>hide('D0',at('dHide'))});
     offer('hide-D2','Get into the empty cell',()=>at('d2In',-2.4),{r:1.8,once:false,when:()=>!C.hiding,fn:()=>hide('D2',at('d2In'))});
     yield* until(()=>C.flags.wingClear||!C.hunt&&H.mode==='off');unoffer('hide-D0');unoffer('hide-D2');
     yield* lines([N('The long, heavy footfalls go back up the wing, out into the junction hall, and away east. Toward the other wing.',{time:4.2}),SM('...It’s gone. It always goes back that way.',{time:2.6})]);}
    if(!C.flags.drained)yield* until(()=>C.flags.drained);
    yield* lines([N('The water drops away from your legs, down into the floor with a long gargle. The floor of the wing is there again, black and slick.',{time:4.4})]);
    checkpoint('c8-sam-door');}
   // -- the door: the crank, the catch inside (Sam's), the bent frame, the pipe ---------------------------------------------------------
   if(!C.flags.samFree){objective('Open Sam’s door.','The crank on the wall beside it.');
    offer('crank1','Turn the crank',()=>at('samCrank',-2),{r:1.7,hold:2.2,noise:.5,tick:()=>{if(Math.random()<.1)sound('c8Chain',at('samDoor',-1.5),{gain:.3});},fn:()=>{CM.setDoor('samCell',.18);sound('c8SteelDoor',at('samDoor',-1.5),{gain:.6});C.flags.crank1=true;}});
    yield* until(()=>C.flags.crank1);yield* wait(.8);
    yield* lines([N('It comes up a hand’s width and stops dead with a clank.',{time:2.6}),SM('The catch. It’s on my side, low down. I can get my fingers on it.',{time:3}),SM('When I lift it, you crank. Not before. Ready?',{time:2.8,face:'determined'})]);
    let done=false,early=0;while(!done){yield* wait(1.2+Math.random()*1.6);say([SM('...NOW!',{time:1.2,face:'determined'})]);hold(sam,SAMIN(),ACT.kneel({side:1,lookPitch:-.4}));C.catchT=C.t;
     offer('crank2','Turn the crank',()=>at('samCrank',-2),{r:1.7,hold:1.6,noise:.5,can:()=>C.t-C.catchT<4.5,blocked:()=>{},fn:()=>{done=true;}});
     yield* until(()=>done||C.t-C.catchT>4.5);unoffer('crank2');hold(sam,SAMIN(),ACT.slump());if(!done){early++;yield* lines([SM(early>1?'I can’t hold it long. Watch me. When I say.':'Too slow. Again. When I say.',{time:2.4})]);}}
    CM.setDoor('samCell',.45);sound('c8Chain',at('samDoor',-1.5),{gain:.7});sound('c8Metal',at('samDoor',-1.5),{gain:.6});yield* wait(1.4);
    yield* lines([N('It grinds up to the height of your knees and jams. The frame is bent. It won’t go further.',{time:3.6}),SM('There’s a pipe. In the next cell, on the floor. I heard it come down when the water rose. Put it under the edge.',{time:4.2})]);
    objective('Hold the door open.','The pipe in the next cell. Then under the door’s edge.');
    offer('pipe','Pick up the pipe',()=>at('dPipe',-3.3),{r:1.5,fn:()=>{CM.ST.wedge=2;C.inv.pipe='have';sound('c8Metal',at('dPipe',-3.3),{gain:.3});}});
    yield* until(()=>C.inv.pipe==='have');
    offer('wedge','Wedge the pipe under the door',()=>at('samDoor',-3),{r:1.8,hold:1.2,fn:()=>{CM.ST.wedge=1;C.inv.pipe=null;sound('c8Metal',at('samDoor',-3),{gain:.5});}});
    yield* until(()=>CM.ST.wedge===1);
    // he comes out under it, on his stomach, and the anchor that was him lets go
    CM.ST.duck={samCell:.4};yield* lines([SM('Okay. Okay. Coming.',{time:1.6})]);
    const inQ=SAMIN(),outQ={x:at('samDoor').x+.3,z:at('samDoor').z-1.6};let cr=0;C.samCrawl={t:0};
    stand(sam,()=>{const k2=smooth(C.samCrawl.t/4);return {x:lerp(inQ.x,outQ.x,k2),z:lerp(inQ.z,outQ.z,k2)};},{gesture:ACT.crawl({phase:()=>C.samCrawl.t*1.1}),max:.5,look:()=>camera.position});
    while(C.samCrawl.t<4.2){yield;C.samCrawl.t+=C.dt;cr+=C.dt;}C.samCrawl=null;C.flags.samFree=true;mark('Sam is out');
    anchorLets(0);checkpoint('c8-sam-out');}
   // -- out: he stands, he holds on to you --------------------------------------------------------------------------------------------------
   stand(sam,()=>{const p=me();return {x:p.x+Math.sin(p.a)*.62,z:p.z-Math.cos(p.a)*.62};},{look:()=>camera.position,gesture:ACT.reach(sam,()=>{const p=me();return {x:p.x+Math.cos(p.a)*.18,y:camera.position.y-.45,z:p.z+Math.sin(p.a)*.18};},{hand:'r',base:ACT.slump()}),max:1});
   face(sam,'relieved',8);
   if(from!=='out')yield* lines([N('He gets up on the second try and stands there in front of you, swaying, and grabs your arm with both hands like you might not be real either.',{time:5}),
    SM('...You came.',{time:1.8}),Y('Course I came.',{time:1.6}),{wait:1.2},SM('You look terrible.',{time:1.8,face:'amused'}),Y('You smell terrible.',{time:1.6}),N('He laughs. It cracks in the middle and turns into something else, and he puts his forehead on your shoulder for a second, and then he lets go.',{time:5.2})]);
   // -- and the wing floods back: the drain reverses, its flood door starts down --------------------------------------------------------
   C.flags.surge=true;CM.ST.waterWant=.85;sound('c8Burst',at('dValve',-2),{gain:1.3});sound('c8Groan',at('dMid',-1),{gain:1.3});C.shake=.5;CM.setDoor('dIso',.92);C.isoClose=true;C.isoT=0;
   presence.trickle(at('dMid',-3.4),{h:3,n:4});
   objective('Get out of the wing.','The flood door is coming down and Sam can’t run. Hold its brake (F) while he gets under.');
   C.samLimp=true;sam.boost=.62;stand(sam,at('dIsoD'),{look:()=>camera.position,max:1.2});C.samToDoor=true;
   // the door: hold its brake and it stops; he goes under; then he hangs on its chain for you
   offer('isoBrake','Hold the door’s brake',()=>at('dIsoD',-1.4),{r:1.6,hold:99,once:false,when:()=>!C.flags.samThrough,tick:()=>{C.isoHeld=C.t;CM.ST.isoBrake=1;},release:()=>{CM.ST.isoBrake=0;}});
   say([N('Behind you, in the end room, the drain coughs— and water comes back up out of it, hard, a fountain of it. Something under the floor groans, long.',{time:4.6}),
    SM('The flood door— it comes down by itself when the wing fills! Hold it— I can’t run!',{time:3,face:'terrified'})]);
   // (he limps for the door on his own; when the door is high enough, or you are holding it, he goes under)
   yield* until(()=>{if(C.samToDoor&&Math.hypot(sam.px-at('dIsoD').x,sam.pz-at('dIsoD').z)<1.6&&CM.DOORS.dIso.open>.3){C.samToDoor=false;stand(sam,at('dIsoJ'),{max:1.2});}return samThroughDoor()||C.failing;});if(C.failing)return;C.flags.samThrough=true;unoffer('isoBrake');CM.ST.isoBrake=0;
   stand(sam,at('dIsoJ'),{gesture:ACT.heave({strain:1}),look:()=>camera.position});face(sam,'determined',6);
   yield* lines([SM('I’ve got it— I’ve got the chain— come ON!',{time:2.6})]);C.isoHeldBySam=true;
   yield* until(()=>me().x-CX.x>-5.6||C.failing);if(C.failing)return;C.isoHeldBySam=false;C.isoClose=false;CM.setDoor('dIso',0);sound('c8SteelDoor',at('dIsoJ',-1.5),{gain:1.3});C.shake=.4;stand(sam,null);
   yield* lines([N('It slams down behind you. Water sprays out round its edges and runs across the junction floor.',{time:3.6})]);
   // the panel: D3 is down
   yield* until(()=>near(at('jPanel'),6)||C.pt>30,30);
   yield* lines([N('On the panel by the bulkhead, the first dial’s needle is lying in the red. NO LOAD. Its lamp is red.',{time:4}),SM('D-three. That’s... that’s my cell.',{time:2.2,face:'worried'}),SM('Why would that go down when I got out?',{time:2.4})]);
   C.flags.samDone=true;mark('Sam rescued');C.samLimp=true;sam.boost=.8;
   yield* lines([{wait:.8},V('JAMIE (FAR OFF, EAST)','LET GO OF ME! LET GO!',{time:2.4}),SM('That’s Jamie.',{time:1.4,face:'shocked'})]);
   sceneRetrieval('r');})());}
 function samThroughDoor(){const sx=sam.px-CX.x;return sx>-5.4;}
 // the moment an anchor lets go: the needle, the lamp, a sound from below, and the room you are in shakes
 function anchorLets(i){CM.PANEL.want[i]=0;sound('c8Groan',at('jPanel',-1),{gain:1.2});sound('c8Thud',at('jMid',-6),{gain:1.1+i*.3});C.shake=Math.max(C.shake,.35+i*.2);mark('anchor '+['D3','E2','F2'][i]+' let go');
  presence.trickle(V3(camera.position),{h:3,n:3});}
 // ---- Jamie, in the retrieval wing ---------------------------------------------------------------------------------------------------------------
 const E2SLOT=()=>{const q=at('e2Slot');return {x:q.x,z:q.z-.75};};// (just inside his door, at its slot, facing out)
 const DOORSPOT={E1:[18.5,25.9],E2:[25.5,25.9],E3:[31.5,25.9]};
 function jamieIn(q,g,look){joinFoot(jamie,q,Math.PI);hold(jamie,q,g,look||(()=>camera.position));}
 function startEHunt(){huntStart({ids:['E','E1','E2','E3','E4'],cells:['E','E4'],filter:n=>n.x>CX.x+22.6,at:at('denIn'),catchTo:C.flags.jamieOut?'c8-jamie-run':'c8-jamie',range:12,fov:1.15,speedK:.9});
  // (the grille is between you and it while you are on Sam's side of it: it can see you through the bars, come and stand at them, but not reach you)
  for(const T of H.targets)Object.defineProperty(T,'catchable',{get:()=>!(me().x-CX.x<21.85&&CM.ST.grille>.15),configurable:true});
  // its routine: in its room a long while (its back to the door, moving things), then up the wing looking into each cell, a while at the grille, back
  const G=H.graph;if(G){for(const n of G.nodes){if(n.door)continue;const lx=n.x-CX.x;n.pause=lx>34?24:lx<25.2?3:0;}}
  C.eRoute=H.patrolRoute.slice();C.eHunt=true;C.doorCheck={E1:-99,E2:-99,E3:-99};mark('it walks the retrieval wing');}
 function sceneRetrieval(from='r'){go('e8-jamie');if(C.where!=='below'){enterComplex('jMid',Math.PI/2);}
  C.h=Math.max(C.h,HOUR.retrieval);C.hMin=HOUR.retrieval;date(C.h);CM.PANEL.want=[0,1,1];CM.setDoor('dIso',0,{instant:true});CM.ST.water=CM.ST.waterWant=.85;
  CM.setDoor('jamieCell',0,{instant:true});CM.setDoor('den',1,{instant:true});CM.ST.grille=CM.ST.grilleWant=1;CM.ST.vent=0;CM.ST.boltsTaken=false;CM.ST.locker=0;
  C.hunterBlock=(x,z)=>{const lx=x-CX.x,lz=z-CX.z;return lx>21.5&&lx<22.5&&lz>24.8&&lz<29.2&&CM.ST.grille>.15;};// (it never comes under the grille: Sam is on the other side of it)
  eLights();C.samLimp=true;
  if(from==='r'){if(sam.gone||!sam.person.group.visible){const q=at('jEast');joinFoot(sam,{x:q.x-1,z:q.z+.8},Math.PI/2);}leave(jamie);objective('Jamie.','East. The retrieval wing.');}
  else{Object.assign(C.flags,{samDone:true,jamieSeen:true,retrieved:true});const g=at('grilleLever');joinFoot(sam,{x:g.x-.5,z:g.z-.3},Math.PI/2);jamieIn(E2SLOT(),ACT.mouth(ACT.slump()));CM.setDoor('jamieCell',0,{instant:true});}
  if(from==='slot'){playerAt('eWest',Math.PI/2,1,.5);checkpoint('c8-jamie');}
  if(from==='run'){Object.assign(C.flags,{grilleHeld:true,jamieTalk:true,ventOpen:true,jamieOut:true});CM.ST.vent=1;CM.ST.grille=CM.ST.grilleWant=.5;playerAt('e3Mid',-Math.PI/2,0,1.2);leave(jamie);joinFoot(jamie,at('e3Vent'),-Math.PI/2);checkpoint('c8-jamie-run');}
  task('jamie',(function*(){
   if(from==='r'){yield* until(()=>me().x-CX.x>13.4||C.pt>90);
    // it brings him back: out of its den with him over its shoulder, to his cell, in; the bar bent so it won't open again
    const den=at('denIn');HM.show(true);H.reset();HM.show(true);H.place(den.x,den.z,-Math.PI/2);joinFoot(jamie,den,0);C.carryJamie=true;sound('c8SteelDoor',den,{gain:.8});
    say([V('JAMIE','LET GO! LET GO OF ME! LET— GO—',{time:2.6}),N('Out of the dark room at the far end of the wing: the long thing from the court, stooped, and over its shoulder, kicking, Jamie.',{time:4.6})]);
    stand(sam,()=>{const p=me();return {x:p.x-.7,z:p.z+.5};},{gesture:ACT.hide({low:.55}),look:()=>({x:HM.x,y:HM.y+1.4,z:HM.z})});
    const e2=DOORSPOT.E2;let thrown=false;
    H.script([{to:()=>[CX.x+e2[0],CX.z+e2[1]],speed:1.05,state:'walk'},{face:[CX.x+e2[0],CX.z+24],turn:3},{act:()=>{CM.setDoor('jamieCell',1);sound('c8SteelDoor',at('e2Slot',-1.5),{gain:1});}},{wait:1.5,state:'idle'},
     {act:()=>{C.carryJamie=false;thrown=true;jamieIn(at('jamieIn'),ACT.floor({arms:'hug',lean:-.3}));sound('c8Fall',at('jamieIn',-2.6),{gain:1});}},{wait:.7,state:'alert'},
     {act:()=>{CM.setDoor('jamieCell',0);sound('c8SteelDoor',at('e2Slot',-1.5),{gain:1.3});}},{wait:1.1,state:'grab',reach:()=>at('e2Slot',-1.2)},{act:()=>{sound('c8Rip',at('e2Slot',-1.4),{gain:.7});C.flags.latchBent=true;}},
     {wait:1.4,state:'peek',look:()=>at('grille',-1.4)},{to:()=>[at('grille').x+.9,at('grille').z],speed:.85,state:'stalk'},{wait:2.6,state:'peek',sound:'c8Sniff',look:()=>camera.position},
     {act:()=>{const p=me(),d=Math.hypot(p.x-HM.x,p.z-HM.z);if(d<7&&!crouched()&&o.foot.on){sound('c8SteelDoor',at('grille',-1.5),{gain:1.4});sound('c7Snarl',{x:HM.x,y:HM.y+1.8,z:HM.z},{gain:1.2});C.shake=.5;C.flags.seenAtGrille=true;mark('it saw you through the grille');}}},
     {wait:1.4,state:'alert'},{to:()=>[den.x,den.z],speed:1,state:'walk'},{act:()=>{startEHunt();}}]);
    yield* wait(3);yield* lines([SM('(beside you, flat on the floor) Get down. Get DOWN. Light off.',{time:3,face:'terrified'})]);
    yield* until(()=>thrown||C.pt>60);yield* wait(2.4);
    yield* lines([N('It shuts him in. Then it takes the bar of the door in its hand and bends it, slowly, until the metal shrieks.',{time:4.4})]);
    yield* until(()=>C.eHunt||C.pt>120);
    if(C.flags.seenAtGrille)yield* lines([N('It saw you. It hit the grille and stood there with its face in the bars. Then it went back into its room. It knows where you are now.',{time:4.6})]);
    yield* lines([SM('It took him there, to that room, and brought him back. Like it’s done it before. Look at the floor.',{time:4,face:'sad'}),N('Grooves, worn into the concrete, from the dark room to the cells. Claw marks down every door, higher than a man.',{time:4.4})]);
    C.flags.retrieved=true;checkpoint('c8-jamie');}
   else if(from==='slot'||from==='run'){if(!C.eHunt)startEHunt();if(from==='run'){H.place(at('e2Slot').x,at('e2Slot').z+1,Math.PI);}}
   if(!C.flags.jamieOut){
    // the grille: Sam holds it up (he can't walk far, but he can do that)
    objective('Get to Jamie.','The grille: Sam can hold it up. Stay low. G throws a bolt.');
    offer('bolts','Pick up the bolts',()=>at('eBolts',-2.9),{r:1.6,fn:()=>{CM.ST.boltsTaken=true;C.inv.bolts=(C.inv.bolts||0)+5;say([N('A handful of loose bolts. Something to throw. (G)',{time:2.6})]);}});
    if(!C.flags.grilleHeld){offer('grille','Lift the grille (with Sam)',()=>at('grilleLever',-1.6),{r:2,fn:()=>{C.flags.grilleHeld=true;}});
     yield* until(()=>C.flags.grilleHeld);}
    const gl=at('grilleLever');stand(sam,{x:gl.x-.35,z:gl.z-.15},{gesture:ACT.heave({strain:.6}),face:Math.PI/2,max:1});CM.ST.grilleWant=.5;sound('c8Chain',at('grille',-1.5),{gain:.6});
    C.duck=[25.4,26.2,27,27.8,28.6].map(z=>W(22,z));// (under it on your knees: crouch, C)
    if(!C.flags.grilleTalk){C.flags.grilleTalk=true;yield* lines([SM('Go under. I’ve got it. I can’t run, but I can hang on to a lever.',{time:3.2,face:'determined'}),SM('Watch it. It goes in that room at the end and stays a while. When it goes in, go.',{time:3.6,face:'worried'})]);}
    // at his slot
    offer('jslot','Look through the slot',()=>at('e2Slot',1.45),{r:1.6,look:true,size:.35,cone:.18,once:false,when:()=>!C.flags.jamieTalk&&!busy(),fn:()=>task('jslot',(function*(){
     closeLook(at('e2Slot',1.45),{back:.42,eye:1.45,floor:-3,kind:'slot'});jamieIn(E2SLOT(),ACT.slump());face(jamie,'afraid',6);
     yield* lines([N('Jamie, right behind the bars. One eye swollen half shut, blood dried down his cheek.',{time:3.2}),J('...No. No, no—',{time:1.4,face:'terrified'}),J('You came. You actually—',{time:1.6,face:'shocked'})]);
     jamieIn(E2SLOT(),ACT.mouth(ACT.slump(),{hand:'r'}));face(jamie,'relieved',10);
     yield* lines([N('Both his hands go over his mouth. He’s laughing or crying, without a sound.',{time:2.8}),J('(a whisper) Took you long enough.',{time:1.8}),J('Next cell. Go. It comes back—',{time:1.8,face:'afraid'})]);
     C.flags.jamieTalk=true;endLook();})())});
    yield* until(()=>C.flags.jamieTalk);unoffer('jslot');
    offer('hide-E3','Get behind the door',()=>W(30.25,24.3,-2.2),{r:1.6,once:false,when:()=>!C.hiding&&HM.root.visible&&HM.x-CX.x<34&&Math.hypot(HM.x-W(31.5,26).x,HM.z-W(31.5,26).z)<7.5&&!(C.hold.vent>0),fn:()=>hide('E3',W(30.25,24.3))});// (only while it is coming: the duct cover is right there too)
    yield* until(()=>cell()==='E3'||C.pt>900);
    yield* lines([N('From low on the wall, through the slots of a steel cover: Jamie’s whisper.',{time:3}),J('You there? Okay. It bent the bar on my door. It knows. I got out yesterday— the duct, under my bunk. You’re looking at the other end.',{time:5,face:'frustrated'}),
     J('I almost made it. It was waiting when I came out. The bolts are on your side.',{time:3.4}),Y('Sam’s at the grille. He’s holding it up.',{time:2.2}),J('Sam’s here? SAM’S— (a hand over his mouth, you can hear it) okay. Okay.',{time:3,face:'happy'})]);
    if(C.inv.radio==='have')yield* lines([J('You got the radio? I dropped it when it grabbed me.',{time:2.4})]);
    // the duct's cover in E3: four bolts, loud; Jamie, if it comes for you, makes it come for him
    objective('Open the duct.','In the next cell, low on the wall: four bolts. Hold F.');
    offer('vent','Undo the duct’s bolts',()=>at('e3Vent',-2.6),{r:1.4,hold:5,noise:.75,tick:()=>{if(Math.random()<.08)sound('c8Scrape',at('e3Vent',-2.6),{gain:.25});},fn:()=>{C.flags.ventOpen=true;}});
    yield* until(()=>C.flags.ventOpen);
    CM.ST.ventFall=true;sound('c8Metal',at('e3Vent',-2.6),{gain:.6});
    if(!C.flags.jamieDistract&&H.mode!=='off'){const e2=DOORSPOT.E2;H.script([{to:()=>[CX.x+e2[0],CX.z+e2[1]],speed:1.2,state:'walk'},{face:[CX.x+e2[0],CX.z+24],turn:3},{wait:600,state:'peek',sound:'c8Sniff',look:()=>at('e2Slot',-1.5)}]);
     say([N('Out in the corridor: its footfalls, coming. They stop outside Jamie’s door.',{time:3})]);}
    yield* lines([N('The cover comes away in your hands. Behind it, the duct, black, the width of a boy’s shoulders.',{time:3.6}),J('(from the duct, very close) Okay. Okay. Here I come.',{time:2.4})]);
    // he comes through: crawling, then stuck
    leave(jamie);joinFoot(jamie,at('e2Vent'),Math.PI/2);C.jamieCrawl={t:0,stuck:false};const a=at('e2Vent'),b=at('e3Vent');
    stand(jamie,()=>{const k2=Math.min(C.jamieCrawl.t/5,C.jamieCrawl.stuck?.55:1);return {x:lerp(a.x,b.x,k2),z:lerp(a.z,b.z,k2)};},{gesture:ACT.crawl({phase:()=>C.jamieCrawl.t*1.2}),max:.4,look:()=>camera.position});
    yield* until(()=>{C.jamieCrawl.t+=C.dt;return C.jamieCrawl.t>2.8;});C.jamieCrawl.stuck=true;
    yield* lines([J('I’m stuck— my shirt’s caught on something— pull me!',{time:2.4,face:'terrified'})]);
    // it is coming down the wing to look at his door
    if(H.mode!=='off'){H.script([{wait:1.2,state:'alert',look:()=>at('e3Vent',-2.4),sound:'c8Sniff'},{to:()=>[W(29.6,26.4).x,W(29.6,26.4).z],speed:.35,state:'stalk',look:()=>at('e3Mid',-1.6)},{wait:60,state:'peek',look:()=>at('e3Mid',-1.6)}]);
     say([N('Outside, it has stopped sniffing at his door. Its head turns toward this cell.',{time:3})]);}
    objective('Pull Jamie out.','Hold F.');
    offer('pull','Pull Jamie',()=>({x:b.x-.2,y:-2.6,z:b.z}),{r:1.5,hold:2.6,tick:()=>{if(Math.random()<.05)sound('c8Breath',at('e3Vent',-2.6),{gain:.4});},fn:()=>{C.jamieCrawl.stuck=false;C.jamieCrawl.t=Math.max(C.jamieCrawl.t,3.4);}});
    yield* until(()=>!C.jamieCrawl.stuck);yield* until(()=>{C.jamieCrawl.t+=C.dt;return C.jamieCrawl.t>=5;});C.jamieCrawl=null;
    stand(jamie,{x:b.x+.6,z:b.z+.4},{look:()=>camera.position,max:1});C.flags.jamieOut=true;mark('Jamie is out');anchorLets(1);checkpoint('c8-jamie-run');}
   // -- it knows: the door torn out; the den, its bore, F0, H, the crew room ------------------------------------------------------------------
   sound('c7Snarl',{x:HM.x,y:HM.y+1.8,z:HM.z},{gain:1.5});C.shake=.5;
   const e2d=at('e2Slot');H.onCatch=()=>fail('c8-jamie-run','caught');if(C.hunt)C.hunt.catchTo='c8-jamie-run';
   H.script([{to:()=>[e2d.x,e2d.z+.8],speed:2.4,state:'run'},{face:[e2d.x,e2d.z-1],turn:4},{wait:.5,state:'grab',reach:()=>at('e2Slot',-1.4)},{act:()=>{sound('c8Metal',at('e2Slot',-1.4),{gain:1.3});C.shake=.3;}},{wait:.9,state:'grab',reach:()=>at('e2Slot',-1.2)},{act:()=>{sound('c8Metal',at('e2Slot',-1.4),{gain:1.5});C.shake=.4;}},{wait:.7,state:'grab',reach:()=>at('e2Slot',-1)},{act:()=>{ripDoor();}},{wait:1.1,state:'alert',look:()=>at('jamieIn',-2)}],
    {then:()=>{H.setGraph(CM.graph(['E','E1','E2','E3','E4','E5','E6','F0','H','K','G']));H.setTargets([{id:'you',pos:()=>({x:camera.position.x,y:camera.position.y,z:camera.position.z}),crouch:()=>o.foot.crouch??0,hidden:()=>false,moving:()=>me().speed||0,lit:()=>1}]);H.lastKnown={x:me().x,z:me().z,id:'you'};H.setMode('search');C.eChase=true;}});
   say([J('It knows. IT KNOWS— this way! Its room’s got a back way— I saw it— RUN!',{time:3.2,face:'terrified'})]);
   say([J('(shouting back up the wing) SAM! GO ROUND! THE CREW ROOM!',{time:2.4})]);
   stand(sam,null);C.samLimp=true;walkTo(sam,at('gIn'),{speed:1.0});CM.ST.grilleWant=1;C.duck=null;
   walkTo(jamie,at('denBack'),{speed:3.3,then:()=>walkTo(jamie,at('e6West'),{speed:3.3,then:()=>walkTo(jamie,at('gIn'),{speed:3.4})})});
   objective('RUN.','Follow Jamie: through its room and out the back. The crew room.');
   C.duck2=[37.4,38,38.6,39.2,39.8].map(x=>W(x,36.4));// (the pipe across the bore: under it, low)
   yield* until(()=>cell()==='G'||C.failing);if(C.failing)return;
   // in: the locker across the door, it hits the door
   offer('locker','Push the locker across the door',()=>({x:W(1.45,41.4).x,y:-2,z:W(1.45,41.4).z}),{r:2.6,hold:1.1,fn:()=>{CM.ST.lockerWant=1;CM.setDoor('G',0);sound('c8Metal',at('gDoor',-1.5),{gain:.8});}});
   say([J('THE LOCKER! Push! PUSH!',{time:2,face:'terrified'})]);stand(jamie,()=>W(1.1,40.6),{gesture:ACT.heave({strain:1}),face:Math.PI/2,max:.8});
   // it is coming up the corridor after you: the locker has to be across the door before it gets there
   C.eChase=false;C.lockerLate=false;const gd=at('gDoor');
   H.script([{to:()=>[gd.x+1.3,gd.z],speed:3.3,state:'run'},{act:()=>{if(CM.ST.lockerWant!==1)C.lockerLate=true;}},{face:[gd.x,gd.z],turn:5},
    {wait:.5,state:'attack'},{act:()=>doorHit()},{wait:1.4,state:'alert'},{act:()=>doorHit()},{wait:.9,state:'attack'},{act:()=>doorHit(1.4)},{wait:3,state:'idle',sound:'c8Sniff'},
    {to:()=>[at('kSouth').x,at('kSouth').z],speed:1.2,state:'walk'},{act:()=>{huntStop();C.eHunt=false;mark('it went away from the crew room door');}}]);
   yield* until(()=>CM.ST.lockerWant===1||C.lockerLate||C.failing);if(C.failing)return;
   if(C.lockerLate&&CM.ST.lockerWant!==1){fail('c8-jamie-run','the crew room door');return;}
   unoffer('locker');
   stand(jamie,()=>W(.8,40.2),{gesture:ACT.overhead({shake:1,lean:-.1}),face:Math.PI/2,max:.6});
   yield* until(()=>!C.hunt&&HM.root.visible===false||C.pt>200,40);
   // quiet: they slide down the wall
   CM.setDoor('Gback',1);hold(jamie,W(-.4,40.8),ACT.floor({arms:'knees',shiver:1}));face(jamie,'tired',8);
   yield* lines([{wait:1},N('Nothing. Footfalls, going away, up the corridor. Then nothing at all.',{time:3.4}),J('(sliding down the wall) ...Ha. Haha. Oh man.',{time:2.4,face:'happy'}),{wait:.8},
    J('Oh man oh man oh man.',{time:1.8,face:'sad'})]);
   yield* until(()=>near(sam,4,{x:jamie.px,z:jamie.pz})||C.pt>260,50);if(!near({x:sam.px,z:sam.pz},6))joinFoot(sam,at('gBack'),Math.PI);
   sound('doorOpen',at('gBack',-1.6),{gain:.6});
   yield* lines([N('The back door opens. Both of you jump a foot. It’s Sam, hopping on one leg, grey in the face.',{time:3.6}),J('SAM!',{time:1,face:'grin'}),SM('Shh— hi. Hi.',{time:1.6,face:'relieved'}),
    N('Jamie gets up and grabs him, and Sam yelps because of his ankle, and Jamie lets go and then grabs him again anyway.',{time:4.6}),
    SM('Your face.',{time:1.4}),J('My face is fine. My face is awesome.',{time:2,face:'amused'}),SM('You lost a shoe.',{time:1.6}),J('It TOOK my shoe. Who does that.',{time:2,face:'frustrated'}),{wait:1.4}]);
   hold(sam,W(-1.6,40.2),ACT.seat(.45,{hands:'knees'}));hold(jamie,W(-.6,41),ACT.floor({arms:'lap'}));
   // the second one: bigger. The corridor outside comes down
   yield* wait(2.2);sound('c8Thud',at('kMid',-8),{gain:1.6});sound('c8Collapse',at('kNorth',0),{gain:1.6});C.shake=1;C.kDown=true;CM.extraSolids.push({x:3.5,z:34.2,hw:1.6,hd:1.8,on:true,id:'kDown'});
   presence.impact(at('kNorth',-2.6),{n:24,power:1.1});presence.trickle(V3(camera.position),{h:2.8,n:5});for(let i=0;i<6;i++)light(i,null);lit(0,-2,39.6,-.5,{intensity:1.2,dist:6,color:0xffd0a0,flicker:.6});
   face(jamie,'terrified',6);face(sam,'terrified',6);
   yield* lines([N('The floor jumps. The lights go out. Out in the corridor, the ceiling comes down, a whole length of it, with a roar, and dust rolls in under the door.',{time:5}),
    {wait:1},N('Somewhere far underneath, something long and heavy settles, and keeps settling.',{time:3.4}),SM('That’s twice.',{time:1.6,face:'worried'}),J('Twice what?',{time:1.4}),
    SM('When I got out, something gave. Now you. Every time one of us gets out...',{time:3.6})]);
   CM.ST.lockerWant=0;CM.setDoor('G',1);CM.ST.bow=[CM.ST.bow[0],.55,CM.ST.bow[2]];CM.ST.bow[0]=Math.max(CM.ST.bow[0],.35);
   objective('The way out of here.','The corridor’s down to the north. South: the long hall with the windows.');
   yield* until(()=>cell()==='H'||C.pt>400);
   // H: the windows, the barrier bowed; the board's twin: two needles down, one up
   yield* lines([N('The long hall. Its windows look down into the main chamber: the drum of concrete hanging over its black hole, and at the far end, the wall of ribs.',{time:4.8}),
    N('The middle of that wall has bowed out toward you. Cracks run up it. Dust pours out of the cracks like water.',{time:4.4})]);
   yield* until(()=>near(at('hBoard'),9)||C.pt>460,40);
   yield* lines([N('Beside the long board on the north wall, the same panel as the one in the junction hall. D3: down. E2: down. F2: up. One green lamp left.',{time:5}),
    SM('That’s my cell. And that’s Jamie’s. They both dropped when we got out.',{time:3.4,face:'worried'}),J('So what’s F-two?',{time:1.6}),{wait:1.6},J('...Who’s in F-two.',{time:1.8,face:'shocked'}),
    {wait:1.4},SM('Alex.',{time:1.2,face:'sad'})]);
   C.flags.jamieDone=true;mark('Jamie rescued');sceneAlex('shift');})());}
 function ripDoor(){const D=CM.DOORS.jamieCell;if(!D)return;D.open=D.want=1;CM.doorOpen.set('jamieCell',1);C.ripT=0;sound('c8Rip',at('e2Slot',-1.4),{gain:1.6});sound('c8SteelDoor',at('e2Slot',-1.4),{gain:1.4});C.shake=.6;mark('it tore his door out');}
 function doorHit(k=1){sound('c8SteelDoor',at('gDoor',-1.4),{gain:1.3*k});sound('c8Metal',at('gDoor',-1.4),{gain:.6*k});C.shake=Math.max(C.shake,.4*k);presence.trickle(at('gDoor',-3),{h:2.8,n:3});C.lockerJolt=.4;}
 // ---- Alex: the corridor that does not stay the same, the room it made, his door, the ledge ----------------------------------------------------------
 function photoTex(){if(C.photoTex!==undefined)return C.photoTex;let t=null;try{const c=document.createElement('canvas');c.width=320;c.height=240;const g=c.getContext?.('2d');if(g){
   g.fillStyle='#0a0908';g.fillRect(0,0,320,240);const r=g.createRadialGradient(160,110,10,160,110,190);r.addColorStop(0,'rgba(255,248,232,.55)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,320,240);
   const head=(x,y,s,c,hair)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,26*s,32*s,0,0,7);g.fill();g.fillStyle=hair;g.beginPath();g.ellipse(x,y-20*s,28*s,16*s,0,Math.PI,0);g.fill();g.fillStyle='#d03030';g.beginPath();g.arc(x-9*s,y-3*s,3*s,0,7);g.arc(x+9*s,y-3*s,3*s,0,7);g.fill();g.fillStyle='#3a2a20';g.fillRect(x-32*s,y+30*s,64*s,60*s);};
   head(90,120,1,'#c08e6c','#2a1e16');head(165,112,1.08,'#b78a6a','#3a2a1a');head(242,124,1,'#d8a888','#5a3a22');
   g.strokeStyle='#7a1a14';g.lineWidth=3;g.beginPath();g.moveTo(150,88);g.lineTo(172,98);g.stroke();g.beginPath();g.moveTo(160,94);g.lineTo(162,124);g.stroke();// (Jamie: the cut over his eye, the blood down his cheek)
   g.fillStyle='rgba(30,30,30,.6)';g.fillRect(0,214,320,26);g.fillStyle='#e8a030';g.font='bold 15px monospace';g.fillText('08 27 2011  1:58',190,232);
   t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;}}catch{}C.photoTex=t;return t;}
 function sceneAlex(from='shift'){go('e8-alex');const A2=X.enlistAlex();leave(A2);if(C.where!=='below')enterComplex('hMid',Math.PI/2);
  C.h=Math.max(C.h,HOUR.alex);C.hMin=HOUR.alex;date(C.h);CM.PANEL.want=[0,0,1];CM.ST.bow=[.35,.55,0];C.samLimp=true;C.kDown=true;if(!CM.extraSolids.some(b=>b.id==='kDown'))CM.extraSolids.push({x:3.5,z:34.2,hw:1.6,hd:1.8,on:true,id:'kDown'});
  CM.made.visible=true;CM.ST.madeBreak=0;CM.ST.slide=0;CM.setDoor('fa1',0,{instant:true});CM.setDoor('fa2',0,{instant:true});CM.setDoor('alexCell',0,{instant:true});CM.setDoor('F0',1,{instant:true});CM.setDoor('breach',0,{instant:true});CM.setDoor('hwin',0,{instant:true});CM.ST.breach=0;CM.ST.hwin=0;CM.ST.ledge=0;
  lightsBelow('F');C.areaLock=false;
  const two=(q,a)=>{joinFoot(sam,{x:q.x-.8,z:q.z+.6},a);joinFoot(jamie,{x:q.x+.7,z:q.z+.5},a);};
  if(from==='shift'){if(sam.gone||jamie.gone)two(at('hMid'),Math.PI/2);if(C.where!=='below'||cell()!=='H')playerAt('hEast',Math.PI/2,-1,0);checkpoint('c8-shift');}
  else if(from==='made'){CM.ST.slide=1;C.flags.slid=true;C.flags.passage=true;playerAt('f1In',Math.PI,0,0);two(at('f1In'),Math.PI);checkpoint('c8-made');}
  else if(from==='alex'){CM.ST.slide=1;Object.assign(C.flags,{slid:true,passage:true,madeSeen:true,alexVoice:true});playerAt('f1Closet',0,1.3,-1.6);two(at('f1Mid'),Math.PI);checkpoint('c8-alex');}
  else if(from==='ledge'){CM.ST.slide=1;Object.assign(C.flags,{slid:true,passage:true,madeSeen:true,alexVoice:true,alexTrust:true,alexDoor:true,alexOut:true});CM.made.visible=false;CM.ST.madeBreak=1;CM.setDoor('breach',1,{instant:true});CM.ST.breach=1;CM.setDoor('alexCell',1,{instant:true});
   playerAt('f2Breach',Math.PI,.6,0);two(at('alexIn'),Math.PI);joinFoot(A2,{x:at('alexIn').x+.4,z:at('alexIn').z-.6},Math.PI);CM.PANEL.want=[0,0,0];CM.ST.bow=[.45,.7,.85];C.alexLimp=true;checkpoint('c8-ledge');}
  // (Alex, inside his cell, sitting on the cot, knees up)
  const COTEDGE=()=>{const q=at('alexCot');return {x:q.x,z:q.z-.72};};// (on the edge of his cot, his feet on the floor: not inside it)
  if(!C.flags.alexOut){joinFoot(A2,COTEDGE(),0);hold(A2,COTEDGE(),ACT.seat(.4,{hands:'knees',lean:.32,lookPitch:-.3}),()=>at('alexDoor',-1.6));}
  task('alex',(function*(){
   if(!C.flags.slid){objective('F-two.','South, past the long hall: the corridor beyond its east door.');
    yield* until(()=>me().z-CX.z>49.4&&cell()==='F0'||C.pt>300);
    // ahead of you, the wall moves across the corridor; beside you the wall opens on a passage that wasn't there
    C.flags.slid=true;CM.ST.slideWant=1;sound('c8Groan',at('fSlide',-1.5),{gain:1.2});sound('c8Scrape',at('fSlide',-1.5),{gain:.9});
    yield* lines([N('Ahead of you, with a long grinding sound, a section of the corridor wall slides out across the corridor and shuts it.',{time:4.2}),J('What— no. NO. That was a corridor. That was a corridor a second ago.',{time:3.2,face:'shocked'})]);
    CM.setDoor('fa1',1);CM.setDoor('fa2',1);CM.ST.faOpen=1;sound('c8Scrape',at('faNorth',-1.5),{gain:.8});
    yield* lines([N('Beside you, a panel of the east wall lifts away. Behind it a passage, papered, carpeted, lit by a lamp with a fringed shade. It smells like someone’s house.',{time:4.8}),
     SM('It’s making it. It’s making it while we watch.',{time:2.6,face:'afraid'})]);
    objective('Through the passage.','It’s the only way on.');
    yield* until(()=>C.flags.wasFa||C.pt>360);yield* until(()=>(me().z-CX.z>57.4&&cell()!=='Fa')||C.pt>420,60);
    CM.setDoor('fa1',0);CM.setDoor('fa2',0);CM.ST.faOpen=0;sound('c8SteelDoor',at('faSouth',-1.5),{gain:.6});C.flags.passage=true;
    yield* lines([N('Behind you the passage closes. There’s only wall there now.',{time:2.8})]);
    // the stretch papered like the hall upstairs at Alex's: the photos on the wall
    yield* until(()=>me().z-CX.z>58.6||C.pt>440,30);
    yield* lines([J('These are Alex’s. These are from his house. That’s his mom. That’s us at the pool.',{time:3.6,face:'afraid'}),N('Framed photographs, the right ones, in the right order. But the faces in them are a little wrong, the way a word is when you say it too many times.',{time:5})]);}
   if(!C.flags.madeSeen){yield* until(()=>cell()==='F1'||C.pt>500);checkpoint('c8-made');C.flags.madeSeen=true;
    yield* lines([N('Alex’s room. His real room, here: his bed, his desk, his shelf of comics, his lamp on. Clean. Too clean, like nobody has ever slept in it.',{time:4.8}),
     SM('Don’t touch anything.',{time:1.6}),N('The calendar over the desk says AUGUST 21. The clock says 9:41 and doesn’t move. On the desk, a bicycle bell, by itself.',{time:4.6})]);
    sound('c8Knock',at('alexDoor',-1.4),{gain:.8});C.flags.alexVoice=true;
    yield* lines([N('Knocking. From the closet door in the far wall: but it isn’t a closet door. It’s steel, painted to look like one.',{time:4.2}),
     AL('(behind it, hoarse) Go away. Go away. You’re not real.',{time:2.8}),checkpointLine('c8-alex')]);mark('alex: the voice behind the door');}
   if(!C.flags.alexTrust){objective('Alex.','Behind the closet door.');mark('alex: go to his door');
    yield* until(()=>near(at('alexDoor'),2.4)||C.pt>600);mark('alex: at his door');
    yield* lines([Y('Alex. It’s us. It’s really—',{time:1.8}),AL('It’s always you. It brings you every day. You stand there and say my name and say it’s you. Always the three of you.',{time:5,face:'afraid'}),
     AL('Always perfect. Exactly like I remember.',{time:2.6}),{wait:1.2},AL('...You’ve got my camera?',{time:1.8}),Y('I’ve had it all week.',{time:1.6}),
     AL('Then take a picture. Of you. All three of you, right now. And put it under the door.',{time:3.6,face:'determined'})]);
    objective('Take a picture.','All three of you. Then under the door.');
    offer('photo','Take a picture of the three of you',()=>V3(camera.position).add(new THREE.Vector3(0,-.2,0)),{r:9,fn:()=>{C.flags.photo=true;}});
    stand(sam,()=>{const p=me();return {x:p.x-Math.cos(p.a)*.7+Math.sin(p.a)*1.4,z:p.z-Math.sin(p.a)*.7-Math.cos(p.a)*1.4};},{look:()=>camera.position,max:1});
    stand(jamie,()=>{const p=me();return {x:p.x+Math.cos(p.a)*.7+Math.sin(p.a)*1.4,z:p.z+Math.sin(p.a)*.7-Math.cos(p.a)*1.4};},{look:()=>camera.position,max:1});
    yield* until(()=>C.flags.photo);sound('c8Flash',camera.position,{gain:.8});C.flash=.35;
    yield* lines([N('The flash. For a second the room is white. On the little screen: the three of you, red-eyed, filthy. Jamie’s face, cut and bloody.',{time:4.6})]);
    offer('under','Push the camera under the door',()=>at('alexDoor',-2.8),{r:1.7,fn:()=>{C.inv.camera='given';sound('window',at('alexDoor',-2.9),{gain:.4});}});
    yield* until(()=>C.inv.camera==='given');
    yield* lines([{wait:1.6},N('A long time.',{time:1.6}),AL('...Jamie’s bleeding.',{time:2}),AL('They never bleed. They’re never hurt. They’re always— perfect.',{time:3.4,face:'sad'}),{wait:1.2},
     AL('Sam, your face—',{time:1.4}),SM('Thanks.',{time:1}),J('(at the door) It’s us, Alex. We’re the ugly ones.',{time:2.4,face:'happy'}),{wait:1},AL('...Okay.',{time:1.4})]);
    C.flags.alexTrust=true;mark('Alex believes it is them');}
   if(!C.flags.alexDoor){objective('Open his door.','Two levers, either side. Two people, at once.');
    stand(jamie,at('alexLeverA'),{gesture:ACT.reach(jamie,()=>at('alexLeverA',-1.55),{hand:'r'}),face:Math.PI,max:.8});
    yield* lines([J('I got this one. You get that one. Together.',{time:2.4})]);
    offer('leverB','Pull the lever (with Jamie)',()=>at('alexLeverB',-1.55),{r:1.6,hold:2.6,tick:(dt,k2)=>{CM.ST.leverA[1]=k2;CM.ST.leverA[0]=k2;},release:()=>{CM.ST.leverA=[0,0];},fn:()=>{C.flags.alexDoor=true;}});
    yield* until(()=>C.flags.alexDoor);CM.setDoor('alexCell',1);sound('c8SteelDoor',at('alexDoor',-1.5),{gain:1});sound('c8Chain',at('alexDoor',-1.5),{gain:.6});}
   if(!C.flags.alexOut){yield* wait(1.2);
    yield* lines([N('Alex, on a cot against the far wall, his knees up, his arms round them. His Sunday clothes, black with dirt. On the wall by the cot, scratched marks, five to a gate. And a map, scratched into the paint: CAMP. GRATE. ME.',{time:6.2})]);
    yield* lines([AL('I got out once. The old water line. All the way to the camp. I could see the trees through the grate.',{time:4.4,face:'sad'}),AL('...It brought me back.',{time:2})]);
    // Jamie goes in to him
    stand(jamie,{x:COTEDGE().x+.1,z:COTEDGE().z-.78},{gesture:ACT.kneel({side:1,lookPitch:-.1}),face:Math.PI,look:()=>({x:X.alex.px,y:-2.3,z:X.alex.pz}),max:.5});
    yield* until(()=>Math.hypot(jamie.px-COTEDGE().x,jamie.pz-COTEDGE().z)<1.2||C.pt>700,20);
    yield* lines([J('Hey. Hey, Alex. It’s us. We came to get you. That’s all.',{time:3,face:'concerned'})]);
    hold(X.alex,COTEDGE(),ACT.reach(X.alex,()=>{const q=jamie.person.joints?.head;return q?jamie.person.group.localToWorld(q.clone()):null;},{hand:'r',base:ACT.seat(.4,{hands:'knees',lean:.25})}));
    yield* lines([N('Alex reaches out and touches Jamie’s face, where it’s cut. Like he’s checking. Then he starts to cry, and Jamie just sits there and lets him.',{time:5.2}),{wait:1.6},AL('Can we go home?',{time:1.6}),J('Yeah. Yeah. Come on.',{time:1.6})]);
    // he stands, Jamie under his arm; they come out, and the last one lets go
    stand(X.alex,{x:at('alexDoor').x,z:at('alexDoor').z-.8},{gesture:ACT.slump(),max:.8,look:()=>camera.position});stand(jamie,()=>({x:X.alex.px+.45,z:X.alex.pz+.2}),{gesture:ACT.reach(jamie,()=>({x:X.alex.px,y:-1.8,z:X.alex.pz}),{hand:'l'}),max:.5});
    yield* until(()=>X.alex.pz-CX.z<73.4||C.pt>760,20);C.flags.alexOut=true;mark('Alex is out');anchorLets(2);madeBreaks();checkpoint('c8-ledge');}
   yield* ledge();})());}
 function checkpointLine(id){return {act:()=>checkpoint(id),wait:.01};}
 // the room it made comes apart: paper peels off concrete; the furniture sinks; the floor opens behind you; the light goes cold; the wall breaks through
 function madeBreaks(){C.flags.madeBreak=true;C.madeT=0;CM.ST.madeBreakWant=1;sound('c8Groan',at('f1Mid',-1),{gain:1.6});sound('c8Rip',at('f1Mid',-1.5),{gain:1.2});C.shake=.8;
  CM.extraSolids.push({x:22.6,z:68.6,hw:4,hd:.9,on:true,id:'fissure'});later(1.2,()=>{CM.setDoor('breach',1);CM.ST.breachWant=1;sound('c8Collapse',at('f2Breach',-1),{gain:1.3});presence.impact(at('f2Breach',-2.2),{n:18,power:.9});});
  presence.reset();presence.show(true);presence.showMass(true,{at:W(1,90,-2),r:12,squash:[1.4,1.1,.8],fog:.9,fogDir:-1});presence.lean(.55);CM.ST.bowWant=[.45,.7,.85];
  for(let i=0;i<6;i++)light(i,null);lit(0,17.5,76.6,-1.2,{intensity:2.6,dist:10,color:0x9fb2cc,flicker:.2});lit(1,1,70,4,{intensity:180,dist:40,color:0x9fb2cc,flicker:.1});lit(2,1,82,2,{intensity:140,dist:36,color:0xa8bcd8,flicker:.2});C.areaLock=true;}
 function* ledge(){const A2=X.alex;C.alexLimp=true;
  yield* lines([N('The paper comes off the walls in sheets. There’s concrete under it, wet, and something grown over the concrete, pale, like the inside of a shell. The lamp goes out.',{time:5}),
   N('Behind you the floor splits across the room and drops away into dark. And the wall of Alex’s cell breaks outward, into the open air of the main chamber.',{time:4.8}),
   SM('There— through the wall. There’s a ledge!',{time:2,face:'determined'})]);
  objective('Along the ledge.','North, along the chamber wall, to the long hall’s windows.');
  stand(jamie,null);stand(sam,null);stand(A2,null);A2.follow='walk';A2.boost=.75;
  // the chamber: the last wall, giving way; the thing behind it pushing
  yield* until(()=>cell()==='IL'||C.pt>900);
  sound('c8Thud',at('barrier',-8),{gain:1.6});C.shake=.5;
  yield* lines([N('The main chamber, open beneath you, twenty feet down to its floor. At its far end the wall of ribs is bending toward you like a door with someone leaning on it.',{time:5}),
   N('Through the gaps: something wet and huge, moving. Folds of it. It is the size of a building, and it is awake.',{time:4.6}),AL('Don’t look at it. It learns you if you look at it.',{time:3,face:'terrified'})]);
  // behind you the shelf you came along goes: a limb out through the ribs, onto it
  yield* until(()=>me().z-CX.z<72||C.pt>960,60);
  presence.set(0,{root:[W(9,84.6,-6).x,-6,W(9,84.6,-6).z],dir:[.3,.5,-1],len:15,r0:1.8,r1:.3,state:'emerge',probe:[W(15,74.4,-1).x,-1,W(15,74.4,-1).z],speed:1.4});
  hazard({at:W(15.1,74.4,-3),r:1.9,warn:2.6,section:'c8-ledge',onFall:()=>{CM.ST.ledgeWant=1;presence.strike(0,W(15.1,74.4,-3),{speed:1.4,hold:1.2});sound('c8Collapse',at('ilSouth',-2),{gain:1.4});}});
  yield* lines([J('MOVE! It’s coming out!',{time:1.6,face:'terrified'})]);
  // the pipe across it: under it on your knees
  C.duck=[14.1,14.6,15.1,15.6,16.1].map(x=>W(x,67.6));
  yield* until(()=>me().z-CX.z<65.2||C.pt>1100,120);
  // the gap: a beam across it. Alex stops. Behind you, a voice
  stand(jamie,W(15.1,58.6),{look:()=>({x:A2.px,y:-1.6,z:A2.pz}),max:.6,gesture:ACT.reach(jamie,()=>({x:A2.px,y:-1.9,z:A2.pz}),{hand:'r'})});
  stand(A2,W(15.1,63.4),{gesture:ACT.hug(ACT.slump()),max:.6,look:()=>W(17,76,-1.4)});face(A2,'terrified',8);
  yield* lines([N('Jamie goes across the beam without looking down and turns round on the far side with his hand out.',{time:3.6}),{wait:1},
   V('ALEX’S MOTHER — FROM BACK THE WAY YOU CAME','Alex? Alex, honey. Come back to bed. It’s late.',{time:3.6}),AL('Mom?',{time:1.2,face:'sad'}),SM('It’s not her. Alex. It’s not her.',{time:2.2,face:'afraid'})]);
  objective('Alex.','Take his hand.');
  mark('alex: his hand offered');offer('alexHand','Take Alex’s hand',()=>({x:A2.px,y:-1.9,z:A2.pz}),{r:1.8,fn:()=>{C.flags.alexHand=true;}});
  yield* until(()=>C.flags.alexHand);face(A2,'afraid',6);
  stand(A2,()=>{const p=me();return {x:p.x+Math.sin(p.a)*-.9,z:p.z-Math.cos(p.a)*-.9};},{gesture:ACT.reach(A2,()=>{const p=me();return {x:p.x+Math.cos(p.a)*.2,y:camera.position.y-.55,z:p.z+Math.sin(p.a)*.2};},{hand:'r',base:ACT.slump()}),max:.5});
  yield* lines([AL('...Okay. Okay. Don’t let go.',{time:2.2}),Y('I won’t.',{time:1.2})]);
  yield* until(()=>me().z-CX.z<58.8||C.pt>1200,120);stand(A2,null);stand(jamie,null);A2.follow='walk';
  // the window: glass between you and the hall
  objective('The window.','The long hall, through the window at the end of the ledge.');
  offer('hwin','Kick out the glass',()=>W(15,52.25,-1.75),{r:2.6,hold:.8,fn:()=>{CM.setDoor('hwin',1);CM.ST.hwinWant=1;sound('c8Glass',at('hWin',-1.5),{gain:1.1});}});
  yield* until(()=>cell()==='H'||C.pt>1300);
  for(const c of [sam,jamie,A2])stand(c,null);
  // the last one gives way: the ribs shear, it comes into the chamber; the windows behind you craze
  yield* until(()=>[sam,jamie,A2].every(c=>CM.cellIdAt(c.px,c.pz)==='H')||C.pt>1360,20);
  CM.ST.shearWant=1;presence.lean(1.15);sound('c8Collapse',at('barrier',-6),{gain:2});sound('c8Thud',at('barrier',-10),{gain:2});C.shake=1.2;
  for(const [i,dx] of [[1,-8],[2,8]].entries())later(.8+i*.7,()=>{presence.set(dx>0?2:1,{root:[W(dx,84,-8).x,-8,W(dx,84,-8).z],dir:[0,.3,-1],len:18,r0:2.2,r1:.34,state:'emerge',probe:[W(dx*.6,66,-4).x,-4,W(dx*.6,66,-4).z],speed:1.6});});
  yield* lines([N('At the far end of the chamber the ribs break. Not one: all of them, one after another, top to bottom, like teeth coming out.',{time:4.4}),
   N('And it comes in. Folds of it, as big as houses, shouldering through, pushing the broken ribs ahead of it across the floor, and the light goes grey with dust.',{time:5}),
   SM('RUN. The crew room. RUN!',{time:1.6,face:'terrified'})]);
  later(3,()=>{sound('c8Glass',at('hWindow',-1),{gain:1.3});C.shake=.6;});
  objective('Run.','The crew room. North through the corridor.');
  for(const c of [sam,jamie,A2])walkTo(c,at('gIn'),{speed:c===sam?1.6:2.6});
  yield* until(()=>cell()==='G'||C.pt>1500);
  yield* until(()=>[sam,jamie,A2].every(c=>CM.cellIdAt(c.px,c.pz)==='G')||C.pt>1560,30);
  CM.setDoor('G',0);CM.ST.lockerWant=1;sound('c8SteelDoor',at('gDoor',-1.5),{gain:1});
  C.flags.alexDone=true;mark('Alex rescued');sceneReunion('r');}
 // ---- all four of them: the crew room ------------------------------------------------------------------------------------------------------------------
 function sceneReunion(from='r'){go('e8-reunion');const A2=X.enlistAlex();if(C.where!=='below')enterComplex('gIn',-Math.PI/2);
  C.h=Math.max(C.h,HOUR.reunion);C.hMin=HOUR.reunion;date(C.h);CM.PANEL.want=[0,0,0];CM.ST.bow=[.45,.7,.85];CM.ST.shear=1;CM.ST.locker=1;CM.setDoor('G',0,{instant:true});
  for(let i=0;i<6;i++)light(i,null);lit(0,-2,39.6,-.5,{intensity:3.4,dist:8,color:0xffd8a8,flicker:.05});lit(1,-4.6,41.8,-1.2,{intensity:1.4,dist:5,color:0xffc890});C.areaLock=true;
  // (the door shuts behind you: if you came in by it and are standing in it, you are in the room, not in the door; the low
  //  places you crawled under on the way are behind you)
  C.duck=null;C.duck2=null;{const p0=me();if(from!=='r'||cell()!=='G'||!nav.walkable(p0.x,p0.z,{r:.3}))playerAt('gIn',-Math.PI/2,-.6,.4);}
  joinFoot(sam,at('gChair'),0);joinFoot(jamie,at('gFloor'),0);joinFoot(A2,at('gCouch'),0);checkpoint('c8-reunion');
  // where they settle: Alex on the couch in a crew jacket, Sam on a chair with his foot up, Jamie on the floor against the lockers
  hold(A2,at('gCouch'),ACT.seat(.45,{hands:'knees',lean:.18}),()=>camera.position);hold(sam,at('gChair'),ACT.seat(.45,{hands:'knees'}),()=>camera.position);hold(jamie,{x:at('gFloor').x,z:at('gFloor').z},ACT.floor({arms:'knees',lean:-.15}),()=>camera.position);
  face(A2,'tired',30);face(sam,'tired',30);face(jamie,'relieved',30);
  task('reunion',(function*(){
   yield* lines([N('The crew room. The door shut, the locker across it. A lamp on the table with a cracked shade. For the first time in five days, all four of you in the same room.',{time:5.2}),{wait:1.5},
    N('Nobody says anything for a while. Somewhere under everything, very far off, something enormous is moving. In here, it’s just the lamp, and four people breathing.',{time:5})]);
   objective('All four of you.','Take a minute. (Talk to them, sit with them. When you’re ready: the radio.)');
   const done=new Set();const beat=(id,label,q,ls,o2={})=>offer(id,label,q,{r:2.5,...o2,fn:()=>task('beat-'+id,(function*(){yield* lines(typeof ls==='function'?ls():ls);done.add(id);mark('reunion: '+id);o2.then?.();})())});
   beat('gum','Hand round Sam’s gum',()=>({x:jamie.px,y:-2.4,z:jamie.pz}),[N('You get out the pack of spearmint. Sam’s. Eleven pieces left. You hand it round.',{time:3.6}),SM('That’s my gum.',{time:1.4}),Y('It’s been in my pocket since Thursday.',{time:2}),
    J('(taking two) Medical reasons.',{time:1.6,face:'grin'}),AL('(taking one, slowly) ...It still tastes like gum.',{time:2.4,face:'relieved'}),N('That shouldn’t be funny. Jamie laughs so hard he has to put his head on his knees, and then all of you are.',{time:4.6})],{then:()=>{C.inv.gum='shared';face(jamie,'happy',8);face(A2,'amused',6);face(sam,'amused',6);}});
   beat('ankle','Wrap Sam’s ankle',()=>at('gAid',-1.4),[N('The first-aid box on the wall: 1974, a roll of crepe bandage gone yellow, a tin of aspirin.',{time:3.4}),SM('Figure eight. Round the heel, then over. Tighter. Okay. Okay, that’s good.',{time:3.6,face:'tired'}),
    SM('My dad would’ve done it better.',{time:2,face:'sad'}),Y('Your dad’s up there right now looking for you.',{time:2.4}),SM('...Yeah.',{time:1.2})],{then:()=>{C.flags.ankle=true;}});
   // Alex: one prompt, his beats in order (the camera and tomorrow, his bike, how he got through it)
   const alexBeats=[['camera','Give Alex back his camera',[N('He goes through the pictures slowly, backwards. The three of you tonight. Then the week he wasn’t there for. Then Sunday.',{time:4.4}),
    AL('That’s the oak. That’s Sunday. We were going to the reservoir. Tomorrow, I said. Remember?',{time:4,face:'sad'}),J('Tomorrow’s Saturday.',{time:1.4}),AL('...So?',{time:1}),J('So we’re going. All of us. I call the front.',{time:2.4,face:'grin'}),
    AL('There’s no front on a bike.',{time:1.6,face:'amused'}),J('There is if I’m on it.',{time:1.6}),{wait:1},AL('...Okay. Tomorrow.',{time:1.6,face:'hopeful'})],()=>{C.flags.tomorrow=true;C.inv.camera='alex';}],
    ['bike','Tell Alex about his bike',[AL('Did anybody... find my bike?',{time:2}),Y('It’s up at Sam’s. With ours. Under the streetlight. All four.',{time:3}),{wait:1},
    AL('The bell still work?',{time:1.4}),Y('Yeah.',{time:.8}),N('He smiles. It looks like it hurts his face, like he hasn’t done it in a long time.',{time:3.4})],()=>{face(A2,'hopeful',8);}],
    ['alexStory','Ask Alex how he got through it',[AL('It kept bringing me my room. My mom. You guys. Every day, the same. I stopped answering.',{time:4.2,face:'sad'}),
    AL('I counted days on the wall. I got out once. Down the old water line, the one to the camp. I could see the trees through the grate.',{time:4.6}),AL('It was waiting at the grate.',{time:2}),{wait:1.4},
    AL('There were other kids. Before us. It still has their... it keeps things.',{time:3.4,face:'afraid'})],null]];
   const nextAlex=()=>{const b2=alexBeats.find(q=>!done.has(q[0]));if(!b2)return;beat(b2[0],b2[1],()=>({x:A2.px,y:-2.2,z:A2.pz}),b2[2],{then:()=>{b2[3]?.();later(.4,nextAlex);}});};nextAlex();
   beat('sit','Sit down with them',()=>W(-4.5,37.35,-2.6),[{act:()=>{pose(V3(W(-4.5,37.35,-1.95)),{y:-2.05,yaw:me().a,pitch:-.1,look:null,slow:1.3});},wait:1.4},
    N('You sit down on the floor next to Jamie with your back against the lockers. The cold of the floor comes up through your jeans.',{time:4}),{wait:2.4},
    J('...This is the worst sleepover ever.',{time:2,face:'tired'}),{wait:1.2},SM('Top three.',{time:1.4,face:'amused'}),{wait:2.4},
    AL('I kept thinking about the fire. Sunday. You guys arguing about whether marshmallows are a food.',{time:4,face:'sad'}),J('They’re not. They’re a texture.',{time:1.8}),{wait:3},{act:()=>unpose(),wait:1.2}]);
   // when you've been with them a while: the radio (Reyes)
   yield* until(()=>done.size>=3||C.pt>420);yield* quiet(30);
   yield* lines([{wait:1.4},V('THE RADIO (IN YOUR POCKET)','...kkkhh... anybody... copy... kids, if you can hear me...',{time:3.4}),J('REYES!',{time:1,face:'grin'})]);
   C.inv.radio='have';yield* lines([RR('Who is— Jamie? Is that— okay. Okay. Listen to me. Is everybody with you? Say their names.',{time:4}),Y('Sam. Jamie. Alex. All of us.',{time:2.4}),{wait:1.2},
    RR('...All three. Jesus. Okay.',{time:2}),RR('I’m in a long room with windows over the big chamber. There’s a board in here you need to see. And then we are getting out. Come to me. Slow.',{time:4.6})]);
   objective('Reyes.','The long hall with the windows.');
   for(const c of [sam,jamie,A2]){stand(c,null);}C.flags.reunionDone=true;CM.ST.lockerWant=0;CM.setDoor('G',1);
   yield* until(()=>cell()==='H'||C.pt>900);X.sceneTruth?.('truth');})());}

 // ---- every frame -----------------------------------------------------------------------------------------------------------------------------------
 function update(dt){
  const ph=S.phase;if(ph!=='e8-sam'&&ph!=='e8-jamie'&&ph!=='e8-alex'&&ph!=='e8-reunion')return;
  // the wing: the voice from the horn, the knocking, the live water (until the breaker is off)
  if(ph==='e8-sam'&&!C.flags.samTrust&&C.flags.samVoice){C.hornT=(C.hornT??8)-dt;if(C.hornT<=0&&!busy()){C.hornT=14+Math.random()*8;const ls=['Come on! The end room! Why aren’t you coming?','It’s okay down here. Come to the wheel. Come on.','Hey. It’s me. Down at the end.'];say([V('SAM’S VOICE — FROM THE SPEAKER',ls[Math.floor(Math.random()*ls.length)],{time:3})]);}
   C.knockT=(C.knockT??5)-dt;if(C.knockT<=0){C.knockT=7+Math.random()*4;sound('c8Knock',at('samSlot',-1.5),{gain:.7});}}
  if(ph==='e8-sam'&&!C.flags.breakerOff&&/^D/.test(cell()||'')){const q=at('dCable'),p=me(),d=Math.hypot(p.x-q.x,p.z-q.z);C.sparkT=(C.sparkT||0)-dt;if(C.sparkT<=0){C.sparkT=.4+Math.random()*1.2;sound('c8Spark',at('dCable',-3.1),{gain:.5});}
   if(d<2.7&&!C.flags.zapWarn){C.flags.zapWarn=true;say([N('The water round the cable fizzes. Your skin prickles from here. Keep to the far wall.',{time:3.4})]);}
   if(d<1.15)fail(C.lastCheckpoint||'c8-wing','the water was live');}
  // the flood door, coming down on its own while the wing fills; the brake (yours) or the chain (Sam's) stops it
  if(C.isoClose){const held=(C.t-(C.isoHeld||-9)<.15)||C.isoHeldBySam;const D=CM.DOORS.dIso;if(!held){D.want=Math.max(0,D.open-dt*.055);}else D.want=D.open;
   if(D.open<.42){CM.ST.duck={...(CM.ST.duck||{}),dIso:.2};C.duck=[...[25.6,26.4,27.2,28,28.8].map(z=>W(-6,z))];}
   if(D.open<.12&&/^D/.test(cell()||'')){fail('c8-sam-out','the flood door');}}
  if(C.samLimp&&sam.mode==='foot'){sam.boost=C.flags.samThrough?.8:.62;}
  if(S.phase==='e8-alex'&&cell()==='Fa')C.flags.wasFa=true;// (remembered: a quick player is through it before the scene has finished talking about it)
  // the levels the scenes ask for, eased (the complex draws them)
  const ST=CM.ST,ease=(k,want,rate)=>{if(ST[want]===undefined)return;ST[k]=ST[k]<ST[want]?Math.min(ST[want],ST[k]+dt*rate):Math.max(ST[want],ST[k]-dt*rate);};
  ease('slide','slideWant',.45);ease('fa','faOpen',.6);ease('madeBreak','madeBreakWant',.18);ease('breach','breachWant',.7);ease('ledge','ledgeWant',.9);ease('hwin','hwinWant',2);ease('shear','shearWant',.2);ease('locker','lockerWant',1.2);
  if(ST.bowWant)for(let i=0;i<3;i++)ST.bow[i]=damp(ST.bow[i],ST.bowWant[i],.5,dt);
  if(ST.ventFall&&ST.vent<1)ST.vent=Math.min(1,ST.vent+dt*1.6);
  if(C.lockerJolt>0){C.lockerJolt-=dt;CM.gLocker.position.x+=Math.sin(C.t*60)*.02*C.lockerJolt;}
  if(C.flash>0)C.flash=Math.max(0,C.flash-dt);
  // the retrieval wing: it puts its face to each door it passes; in its own bore it is slow
  if(C.eHunt&&H.mode==='patrol'){for(const [id,[x,z]] of Object.entries(DOORSPOT)){if(C.t-(C.doorCheck[id]??-99)<45)continue;if(Math.hypot(HM.x-(CX.x+x),HM.z-(CX.z+z))<1.3){C.doorCheck[id]=C.t;
    H.script([{face:[CX.x+x,CX.z+z-1.5],turn:3,state:'idle'},{wait:1,state:'peek',sound:'c8Sniff',look:()=>W(x,z-1.6,-1.4)},{act:()=>{if(id==='E2'&&!C.flags.jamieOut)sound('c8Breath',at('jamieIn',-2.4),{gain:.25});
      // (it puts its head in: if you are in there and not out of its sight, it has you)
      if(cell()===id&&!C.hiding){const p=me(),lx=p.x-CX.x,lz=p.z-CX.z,dark=!o.foot.on&&crouched()&&lz<23.3&&Math.abs(lx-x)>.7;if(!dark){mark('it looked into the cell');fail(C.lastCheckpoint||'c8-jamie','it looked in');}}}},{wait:1.2,state:'peek'}],{then:()=>H.setMode('patrol')});break;}}}
  if(H.mode==='pursue'||H.mode==='search'){const id=CM.cellIdAt(HM.x,HM.z);H.runSpeed=(id==='E5'||id==='E6')?1.6:C.eChase?3.45:4.1*.92;}
  // Jamie hears it coming before you see it: if it is about to look into the cell you are in, he says so
  if(S.phase==='e8-jamie'&&C.eHunt&&!C.flags.jamieOut&&cell()==='E3'&&!C.hiding&&(H.mode==='patrol'||H.mode==='search')){const v=W(31.5,25.9),d=Math.hypot(HM.x-v.x,HM.z-v.z);
   if(d<7&&C.t-(C.e3Warn||-99)>20){C.e3Warn=C.t;say([J('(through the duct, fast) It’s coming— get behind the door! Behind the door!',{time:2.4,face:'terrified'})]);}}
  // Jamie, if it goes for you while you are at the duct, makes it come for him
  if(S.phase==='e8-jamie'&&C.eHunt&&!C.flags.jamieDistract&&!C.flags.ventOpen&&(C.hold.vent||0)>.15&&(H.mode==='search'||H.mode==='patrol')){const v=at('e3Mid');if(Math.hypot(HM.x-v.x,HM.z-v.z)<8.5){C.flags.jamieDistract=true;
    say([V('JAMIE','HEY! HEY, UGLY! I’M RIGHT HERE! OVER HERE!',{time:2.4})]);sound('c8Knock',at('e2Slot',-1.5),{gain:1.6});later(.4,()=>sound('c8Knock',at('e2Slot',-1.5),{gain:1.6}));
    const e2=DOORSPOT.E2;H.script([{to:()=>[CX.x+e2[0],CX.z+e2[1]],speed:2.6,state:'run'},{face:[CX.x+e2[0],CX.z+24],turn:4},{wait:.3,state:'attack'},{act:()=>{sound('c8SteelDoor',at('e2Slot',-1.4),{gain:1.6});C.shake=.3;}},{wait:2.4,state:'peek',sound:'c8Sniff'},{wait:600,state:'peek',look:()=>at('e2Slot',-1.5)}],{then:()=>H.setMode('patrol')});mark('Jamie drew it off');}}
  // its door, torn out, thrown down the corridor
  if(C.ripT!=null&&C.ripT<1.2){C.ripT+=dt;const D=CM.DOORS.jamieCell,k2=Math.min(1,C.ripT/.9);if(D?.leaf){const y0=D.y+D.h/2;D.leaf.position.set(at('e2Slot').x-CX.x+k2*1.6,y0+Math.sin(k2*Math.PI)*.9-k2*(D.h/2-.08),25+k2*2.2);D.leaf.rotation.set(k2*1.45,k2*.6,0);}}
  // bolts in the air
  for(let i=THROWN.length-1;i>=0;i--){const b=THROWN[i];b.t+=dt;if(!b.landed){b.v.y-=9.8*dt;const nx=b.p.x+b.v.x*dt,nz=b.p.z+b.v.z*dt;if(!CM.nav.walkable(nx,nz,.04)){b.v.x*=-.35;b.v.z*=-.35;}else{b.p.x=nx;b.p.z=nz;}b.p.y+=b.v.y*dt;
    const f=CM.nav.floorAt(b.p.x,b.p.z);if(b.p.y<f+.03){b.p.y=f+.03;b.landed=true;b.t=0;sound('c8Knock',b.p,{gain:.35});sound('pebble',b.p,{gain:1});noise({x:b.p.x,y:b.p.y,z:b.p.z},2.2,'a bolt');mark('bolt landed');}b.m.position.copy(b.p);b.m.rotation.x+=dt*14;}
   else if(b.t>4){b.m.removeFromParent();THROWN.splice(i,1);}}

  }
 const _lp=newPose(),limpG=ACT.limp(sam,{side:1,k:1});
 function afterActors(dt){
  if(C.samLimp&&sam.person.group.visible&&sam.mode==='foot'&&!sam.script&&(sam.speed||0)>.15){copyPose(_lp,sam.pose);limpG(_lp,{clock:C.t});applyPose(sam.person,_lp);}
  if(C.alexLimp&&X.alex&&X.alex.person.group.visible&&X.alex.mode==='foot'&&!X.alex.script&&(X.alex.speed||0)>.15){copyPose(_lp,X.alex.pose);ACT.slump()(_lp,{clock:C.t});applyPose(X.alex.person,_lp);}
}
 function sources(out){const ph=S.phase;if(ph==='e8-alex'&&C.flags.alexOut)out.push({id:'c8-it',kind:'presence',pos:V3(at('barrier',-4)),level:1});if(ph==='e8-reunion')out.push({id:'c8-it-far',kind:'presence',pos:V3(at('barrier',-8)),level:.6});
  if(ph==='e8-sam'){if(!C.flags.breakerOff)out.push({id:'c8-cable-arc',kind:'arc',pos:V3(at('dCable',-3)),level:.7});if(C.flags.surge)out.push({id:'c8-surge',kind:'surge',pos:V3(at('dValve',-2)),level:.8});
  if(!C.flags.breakerOff)out.push({id:'c8-wing-pump',kind:'pump',pos:V3(at('dValve',-2)),level:.5});}}
 const THROWN=[],boltM=new THREE.MeshStandardMaterial({color:0x6a6a66,roughness:.45,metalness:.6}),boltG=new THREE.CylinderGeometry(.018,.018,.09,6);boltM.name='c8-bolt';
 function throwBolt(){if(!(C.inv.bolts>0)||C.view||busy()&&C.hiding)return false;C.inv.bolts--;const f=new THREE.Vector3();camera.getWorldDirection(f);const p=camera.position.clone().addScaledVector(f,.35);
  const v=f.clone().multiplyScalar(10).add(new THREE.Vector3(0,1.6,0)),m=new THREE.Mesh(boltG,boltM);m.position.copy(p);scene.add(m);THROWN.push({m,p,v,t:0,landed:false});sound('click',p,{gain:.2});mark('threw a bolt');return true;}
 function blockers(out){if(C.duck2&&!crouched())for(const q of C.duck2)out.push({x:q.x,z:q.z,r:.3,speed:0});}
 function key(code,repeat){if(code==='KeyG'&&!repeat&&S.phase==='e8-jamie'&&C.inv.bolts>0){throwBolt();return true;}return false;}
 function hint(){if(S.phase==='e8-jamie'&&C.inv.bolts>0&&!C.view&&!C.choice)return [['G','Throw a bolt ('+C.inv.bolts+')'],['C','Crouch'],['T','Flashlight']];return null;}
 function reset(){C.isoClose=false;C.samLimp=false;C.alexLimp=false;C.samCrawl=null;C.jamieCrawl=null;C.areaLock=false;sam.boost=1;jamie.boost=1;C.eHunt=false;C.eChase=false;C.hunterBlock=null;C.duck2=null;C.kDown=false;C.ripT=null;C.flash=0;
  for(const b of THROWN)b.m.removeFromParent();THROWN.length=0;for(const k2 of ['slideWant','faOpen','madeBreakWant','breachWant','ledgeWant','hwinWant','shearWant','lockerWant','bowWant','ventFall'])delete CM.ST[k2];CM.ST.fa=0;}
 const SC={sceneWing,sceneRetrieval,sceneAlex,sceneReunion,anchorLets,wingLights,eLights,throwBolt};
 const SCENE={'c8-wing':()=>sceneWing('wing'),'c8-ruth':()=>sceneWing('wing'),'c8-sam':()=>sceneWing('sam'),'c8-sam-door':()=>sceneWing('door'),'c8-sam-out':()=>sceneWing('out'),
  'c8-retrieval':()=>sceneRetrieval('r'),'c8-jamie':()=>sceneRetrieval('slot'),'c8-jamie-door':()=>sceneRetrieval('slot'),'c8-jamie-run':()=>sceneRetrieval('run'),
  'c8-shift':()=>sceneAlex('shift'),'c8-made':()=>sceneAlex('made'),'c8-alex':()=>sceneAlex('alex'),'c8-alex-free':()=>sceneAlex('alex'),'c8-ledge':()=>sceneAlex('ledge'),
  'c8-reunion':()=>sceneReunion('r'),'c8-alarm':()=>sceneReunion('r')};
 return {SCENE,SC,update,afterActors,sources,blockers,key,hint,reset};
}
