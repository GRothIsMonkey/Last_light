// Aftermath I, Act IV: leaving Oak Hollow. October.
//
// 13a. Saturday, October 1: on your bikes with Sam, up the street to Summerfield, where the fence is shut for good now. On the way:
//      the leaves turning; Jamie's bike still where you left it; Reyes at the fence, who says what he has done with what he saw,
//      and what the report says, and that the two are not the same thing.
// 13b. Monday, October 3, the kitchen: the township's letter on the table, and your mother's reasons. You are moving on the 15th.
// 14.  Friday, October 14, your room in boxes: a drawer; what goes in the box and what stays with you; the window; tape.
// 15.  Saturday, October 15, the curb: the truck; Sam, who checks your chain and gives you his notebook; rule five; and then he
//      rides off, and stops at the lamp post and waves, and nobody comes round the corner after him.
// 16.  The road out, in your mother's car, at the last of the light: look back, look at what you kept, look ahead when you can.
// Then the card. No Aftermath II here, no 2021, nothing after the card.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {heading} from './route.js';
import {ACT} from './chapter8-acting.js';
import {ACT9,G,asC} from './aftermath1-acting.js';
import {tex9} from './aftermath1-props.js';
import {notebookPage,texOf} from './chapter7-props.js';
import {makeCar} from './props.js';
import {createKit} from './kit.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {poseBike,P as PP,newPose,copyPose,applyPose} from './rig.js';

export function leavingActs(H){
 const {o,k,C,S,ch6,phys,comp,brain,sam,cast,EVERYONE,sound,gy,light,lightsOn,checkpoint,later,mark,say,SM,Y,N,V,R,MO,person,
  task,wait,until,lines,quiet,offer,unoffer,V3,pose,unpose,posed,holding,pageMesh,choosing,me,go,objective,busy,nav,camera,scene,world,
  stand,joinFoot,leave,minds,setDay,dayWorld,keep,cry,weep,feel,mood,applyGrief,headOf,end,pinSam,capTo,CAP,capG,
  ST9,SP,putW,lead,placeMe,streetWorld,hiVis,unwear,JH,JW,toNext,MEM}=H;
 const {reyes,samDad,samMom,jamieMom,mom,vol,extras}=cast;
 const [vol1,vol2,vol3,vol4,vol5,huang,delaney,pruitt3,okafor]=extras;
 const home=ch6.home,HP=home?.P,FL=HP?.floor??.34,HA=a=>a-(HP?.worldRot||0),HW=(x,z,y=0)=>home.toW(x,z,y);
 const D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const KT=createKit();
 const mat=(c,o2={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.85,...o2});m.name='a1-oct';return m;};
 const boxM=mat(0xb48a58,{roughness:.95}),tapeM=mat(0xc8b48a,{roughness:.4});
 // ---- October: the trees turn (the world's own leaf materials, warmed; put back when the chapter resets) ---------------------------
 const LEAF=new Map();
 function autumn(on){for(const m of world.foliage||[]){if(on){if(!LEAF.has(m))LEAF.set(m,m.color.clone());const c=LEAF.get(m);m.color.setRGB(Math.min(1.7,c.r*1.55+.1),c.g*.76,c.b*.45);}else if(LEAF.has(m)){m.color.copy(LEAF.get(m));}}if(!on)LEAF.clear();}
 // ---- 13a: up to Summerfield -----------------------------------------------------------------------------------------------------------
 const HOMEP=HP,DRIVE_D=HP?.drivD??434.5;
 function weeksSetup(){streetWorld('october',{sky:'autumn'});autumn(true);setDay('OCTOBER 1',15.6,'autumn');C.skyK={};C.grief=.34;applyGrief();
  C.amb={traffic:.1,insects:.08,wind:.45,life:.5,forest:0,tunnel:0,water:0};o.bikeAway?.(false);
  const st=SP(DRIVE_D+1.2,-5.4);o.placePlayer({x:st.x,z:st.z,a:heading(DRIVE_D),mode:'ride',speed:0});
  const sq=SP(DRIVE_D+2.4,-2.6);comp.putRiding(sam,sq.x,sq.z,heading(DRIVE_D),0);sam.gone=false;sam.person.group.visible=true;sam.bike.group.visible=true;sam.follow='ride';brain.enable(sam,true);weep(sam,'tired',99);mood(sam,'tired');
  // Jamie's bike, still where you left it; somebody raking; the survey at the fence; Reyes's car
  const where=C.keep.told?.bmx||'rail',T=H.TOWN||null;void T;
  H.showBike?.('jamie',null);
  {const r=where==='walk'?JW(JH.doorX,9.4):JW(JH.doorX+1.32,6.05);H.showBike&&H.BK.jamie&&(H.BK.jamie.group.visible=true,H.BS.jamie={mode:'at',t:0,at:where==='walk'?{x:r.x,y:gy(r.x,r.z),z:r.z,rx:0,ry:-(-Math.PI/2-JH.worldRot)+.5,rz:1.42,steer:.9}:{x:r.x,y:gy(r.x,r.z),z:r.z,rx:0,ry:-(0-JH.worldRot),rz:.2,steer:.3}});}
  {const q=SP(640,-14.5);putW(vol5,q,heading(640)+1.4,G(ACT9.holdOut({k:.6})));}
  {const q=SP(855.5,3.2),q2=SP(855.5,-6.6);putW(reyes,q,heading(855)+Math.PI);reyes.gest('fold');const car=k.carA,cq=SP(848,-3.4),cq2=SP(856,-3.4);car.show(true);car.park(cq.x,cq.z,headingTo(cq.x,cq.z,cq2.x,cq2.z));car.lights=false;car.headlights=false;
   putW(vol2,SP(861.5,-8.4),heading(861)+.6,'fold');hiVis(vol2);void q2;}}
 function sceneWeeks(){go('a1-weeks');weeksSetup();checkpoint('a1-weeks');C.fadeIn=0;C.fadeInDur=2.6;
  task('weeks',(function*(){
   yield* lines([{wait:1.6},N('October. The leaves on Oak Hollow are turning, the way they do every year, like nobody told them.',{time:4.6})]);
   objective('Up to Summerfield.','With Sam. On your bikes.');
   const d=()=>ch8d();let said={};
   while(true){yield;const dd=d();
    if(!said.a&&dd>520&&!busy()){said.a=true;say([SM('They’re busing us to Lincoln now. All the Oak Hollow kids. Mrs. Ochoa’s there too.',{time:3.6,face:'tired'}),SM('She keeps asking if we want to talk to somebody.',{time:2.6}),{wait:.6},SM('I talk to you.',{time:1.6})]);}
    if(!said.b&&dd>600&&dd<640&&!busy()){said.b=true;say([N('Somebody is raking leaves on the corner of Briarwood. He stops and watches you two go past, and lifts his hand.',{time:4.6})]);}
    if(!said.c&&dd>770&&!busy()){said.c=true;say([N(C.keep.told?.bmx==='walk'?'Jamie’s bike is still in the middle of his walk. A month. His mom steps round it.':'Jamie’s bike is still by his rail, where you leaned it. A month. Nobody has moved it.',{time:4.4})]);}
    if(dd>832)break;if(C.pt>420)break;}
   yield* quiet(10);
   yield* lines([N('The fence is down at Summerfield itself now, and there isn’t a gate in it any more. The hole has gravel in it, and a steel plate.',{time:5}),{wait:.6},
    N('Reyes’s car is pulled up on the curb. He’s talking to a man in a vest with a clipboard.',{time:3.6})]);
   objective('Officer Reyes.','At the fence.');
   yield* until(()=>D(me(),reyes)<9||C.pt>480,90);
   reyes.gest(null);reyes.lookAt=camera.position;
   yield* lines([R('Hey, you two.',{time:1.2}),{wait:.6},R('I was going to come by. I wanted you to hear this from me before you read it.',{time:3.6}),{wait:1},
    R('The state engineers put out their report. Old storm lines under the drive. A gas main. Ground that’s been washing out under this street for fifty years.',{time:5.4}),
    R('All of that is true.',{time:1.6}),{wait:1.4},R('It just isn’t all of it.',{time:2})]);
   yield* lines([{wait:.8},R('I wrote down what I saw. All of it. It’s in the file with my name on it, and nobody has asked me to change a word.',{time:4.8}),{wait:.8},
    SM('Does anybody believe you?',{time:1.6,face:'tired'}),{wait:1},R('Some people.',{time:1.2}),R('Mrs. Henderson remembers a red sky. Mr. Henderson remembers a storm. Some days they argue about it.',{time:4.4}),{wait:1.2},
    R('There’s a team from the state looking at the works now. They don’t have words for some of what they’re finding. They write it down anyway.',{time:5}),{wait:1},
    R('Your notebook pages. The camera card. The sheet from fifty-nine. I made copies. Then I made copies of the copies.',{time:4.4}),{wait:1.4},
    R('Nobody is going to make it not have happened. Okay?',{time:2.6})]);
   const ch=yield* choosing([{id:'okay',label:'“Okay.”'},{id:'thanks',label:'“Thank you.”'},{id:'none',label:'Nod'}],{timeout:12,fallback:'none'});keep('told',{...C.keep.told,reyesOct:ch});
   yield* lines([ch==='okay'?Y('Okay.',{time:1}):ch==='thanks'?Y('Thank you.',{time:1.2}):N('You nod.',{time:1.2}),{wait:1},R('Go on home, now. Before it gets dark.',{time:2}),{wait:1.6},
    N('You ride home the long way, round by the school, without either of you saying that’s what you’re doing.',{time:4.6}),{wait:2}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-home');})());}
 const ch8d=()=>H.dNow?H.dNow():0;
 // ---- the house (Chapter Six's own: your room, the hall, the kitchen behind it) -----------------------------------------------------
 const DOM=home?.domestic,KTB=DOM?.KT;
 const inside=new THREE.Group();inside.name='a1-house-october';
 // the kitchen nook's two chairs; the letter on the table
 const TBL=KTB?{x:KTB.x1-.55,z:KTB.z0+.65}:{x:2.6,z:-3.66};
 const kChairs=[];
 function kitchenChair(x,z,a){const g=new THREE.Group();const w=mat(0x8a6a48,{roughness:.6});const s=new THREE.Mesh(new THREE.BoxGeometry(.42,.04,.4),w);s.position.y=.46;g.add(s);const b=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.035),w);b.position.set(0,.7,.19);g.add(b);
  for(const [dx,dz] of [[-.18,-.17],[.18,-.17],[-.18,.17],[.18,.17]]){const l=new THREE.Mesh(new THREE.BoxGeometry(.035,.46,.035),w);l.position.set(dx,.23,dz);g.add(l);}const q=HW(x,z,FL);g.position.set(q.x,q.y,q.z);g.rotation.y=-HA(a);inside.add(g);kChairs.push(g);return g;}
 const MOMSEAT={x:TBL.x-.8,z:TBL.z+.05,a:Math.PI/2},MYSEAT={x:TBL.x+.24,z:TBL.z+.76,a:0};
 kitchenChair(MOMSEAT.x,MOMSEAT.z,MOMSEAT.a);kitchenChair(MYSEAT.x,MYSEAT.z,MYSEAT.a);
 const letterMesh=(()=>{const m=pageMesh(tex9('letter'),{w:.2,h:.265});const q=HW(TBL.x-.12,TBL.z+.08,FL+.756);m.position.set(q.x,q.y,q.z);m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,-HA(0)+.3,0);m.name='a1-letter';inside.add(m);return m;})();
 // your room in boxes: three boxes (one open), a roll of tape; a drawer pulled out of the dresser
 const RB=home?.R||{x0:3.25,x1:7,z0:-.95,z1:4.3};
 const BOXES=[];
 function cbox(x,z,a,{w=.52,h=.42,d=.4,open=false}={}){const g=new THREE.Group();const q=HW(x,z,FL);g.position.set(q.x,q.y,q.z);g.rotation.y=-HA(a);inside.add(g);
  const sides=[[0,h/2,-d/2,w,h,.01],[0,h/2,d/2,w,h,.01],[-w/2,h/2,0,.01,h,d],[w/2,h/2,0,.01,h,d],[0,.005,0,w,.01,d]];for(const [x2,y2,z2,ww,hh,dd] of sides){const b=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,dd),boxM);b.position.set(x2,y2,z2);g.add(b);}
  const flaps=[];for(const [s,ax] of [[-1,'x'],[1,'x']]){const f=new THREE.Group();f.position.set(0,h,s*d/2);g.add(f);const p=new THREE.Mesh(new THREE.BoxGeometry(w,.008,d/2),boxM);p.position.set(0,0,-s*d/4);f.add(p);f.userData.s=s;flaps.push(f);void ax;}
  const tape=new THREE.Mesh(new THREE.BoxGeometry(.05,.004,d+.02),tapeM);tape.position.set(0,h+.006,0);tape.visible=false;g.add(tape);
  const B={g,flaps,tape,h,w,d,open,k:open?1:0,want:open?1:0,set(k){B.k=k;for(const f of flaps)f.rotation.x=f.userData.s*(1-k)*0+f.userData.s*k*-1.9;}};B.set(B.k);BOXES.push(B);return B;}
 const BIGBOX=cbox(RB.x0+1.7,RB.z0+2.1,.2,{open:true});cbox(RB.x0+.75,RB.z0+1.15,-.1,{h:.5});cbox(RB.x0+.82,RB.z0+1.7,.15,{h:.36,w:.46});
 const tapeRoll=(()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.045,.022,8,16),tapeM);const q=HW(RB.x0+2.25,RB.z0+2.2,FL+.024);m.position.set(q.x,q.y,q.z);m.rotation.x=Math.PI/2;inside.add(m);return m;})();
 const DRAWER=(()=>{const g=new THREE.Group();const DRx=RB.x0+.75,DRz=RB.z0+.28;const w=mat(0x6a4a30,{roughness:.7});const front=new THREE.Mesh(new THREE.BoxGeometry(.98,.22,.02),w);front.position.set(0,0,.26);g.add(front);
  const bot=new THREE.Mesh(new THREE.BoxGeometry(.92,.01,.46),mat(0x8a6a48));bot.position.set(0,-.1,.03);g.add(bot);for(const s of [-1,1]){const sd=new THREE.Mesh(new THREE.BoxGeometry(.01,.18,.46),mat(0x8a6a48));sd.position.set(s*.46,-.02,.03);g.add(sd);}
  const q=HW(DRx,DRz,FL+.74);g.position.set(q.x,q.y,q.z);g.rotation.y=-HA(0);g.userData.base=new THREE.Vector3(q.x,q.y,q.z);inside.add(g);return g;})();
 const DR9={k:0,want:0};
 // what is in the drawer, and the other things you might pack
 const booth=pageMesh(tex9('booth'),{w:.05,h:.175,color:0xf4f1ea});booth.name='a1-booth-strip';
 const ITEMS={booth:{name:'The photo-booth strip',held:()=>pageMesh(tex9('booth'),{w:.1,h:.35,color:0xf4f1ea}),ls:[N('The photo booth at the mall, in June. Four frames, four of you, crammed in. Alex is wearing his helmet in every one, because Jamie bet him he wouldn’t.',{time:6})]},
  print:{name:'Sunday at the oak',held:()=>pageMesh(tex9('sunday'),{w:.24,h:.18}),ls:[N('Sunday at the oak. The twenty-first. Four bikes and three of you, because he was the one holding it.',{time:4.6})],when:()=>!!C.keep.print},
  cap:{name:'Jamie’s cap',held:()=>{const g=capG.clone();g.visible=true;g.rotation.set(.3,0,0);return g;},ls:[N('His cap. Blue. It still has the shape of his head in it, sort of. You don’t know what you’d do if it stopped having that.',{time:5.4})],when:()=>C.keep.cap==='you'},
  calendar:{name:'The calendar',held:()=>pageMesh(tex9('calendar'),{w:.21,h:.27}),ls:[N('August. Every day crossed off up to the twenty-fourth. The thirtieth circled: the first day of school.',{time:4.6}),{wait:.6},N('Nobody crossed off the rest.',{time:2.2})]},
  shirt:{name:'Your Tour shirt',held:()=>{const g=new THREE.Group();const m=new THREE.Mesh(new THREE.BoxGeometry(.32,.02,.26),mat(0x3d6a9a,{roughness:1}));g.add(m);const t=pageMesh(tex9('shirt'),{w:.3,h:.24,color:0x3d6a9a});t.rotation.x=-Math.PI/2;t.position.y=.011;g.add(t);g.rotation.x=Math.PI/2.4;return g;},ls:[N('The T-shirt Sam’s mom made for the Tour, iron-on letters. TOUR DE OAK HOLLOW 2010. It’s too small. It was too small in June.',{time:5})]}};
 const SHOWN={};// what is visible where in the room (packed things vanish into the box)
 const itemMeshes={};
 function placeItems(){for(const m of Object.values(itemMeshes))m.removeFromParent();
  const put=(id,m,x,z,y,ry=0,rx=-Math.PI/2)=>{const q=HW(x,z,FL+y);m.position.set(q.x,q.y,q.z);m.rotation.order='YXZ';m.rotation.set(rx,-HA(ry),0);inside.add(m);itemMeshes[id]=m;};
  put('booth',pageMesh(tex9('booth'),{w:.05,h:.175,color:0xf4f1ea}),RB.x0+.75,RB.z0+.38,.66,0);// (in the drawer: placed as it slides)
  if(C.keep.print)put('print',pageMesh(tex9('sunday'),{w:.15,h:.11}),RB.x1-.45,RB.z1-.5,.76,.2);
  if(C.keep.cap==='you'){const g=capG.clone();g.visible=true;const q=HW(RB.x1-.6,1.4,FL+.6);g.position.set(q.x,q.y,q.z);g.rotation.set(0,-HA(.6),0);inside.add(g);itemMeshes.cap=g;}
  put('calendar',pageMesh(tex9('calendar'),{w:.36,h:.45}),RB.x0+.012,RB.z1-.9,1.45,Math.PI/2,0);
  {const m=new THREE.Group();m.add(new THREE.Mesh(new THREE.BoxGeometry(.3,.03,.24),mat(0x3d6a9a,{roughness:1})));const t=pageMesh(tex9('shirt'),{w:.28,h:.22,color:0x3d6a9a});t.rotation.x=-Math.PI/2;t.position.y=.016;m.add(t);const q=HW(RB.x1-.7,.9,FL+.6);m.position.set(q.x,q.y,q.z);m.rotation.y=-HA(.4);inside.add(m);itemMeshes.shirt=m;}}
 const itemAt=id=>{const m=itemMeshes[id];return m?m.getWorldPosition(new THREE.Vector3()):null;};
 function houseOn(on,{room='kitchen'}={}){if(!home)return;if(on){home.show(true);home.reset();home.show(true);home.cameraOnDesk?.(false);nav.setRoom(home.nav);if(!inside.parent)scene.add(inside);
   const bf=home.root.getObjectByName('your-breakfast');if(bf)bf.visible=false;const sp=home.root.getObjectByName('breakfast-spoon');if(sp)sp.visible=false;}
  else{if(nav.room===home.nav)nav.setRoom(null);home.show(false);inside.removeFromParent();const bf=home.root.getObjectByName('your-breakfast');if(bf)bf.visible=true;const sp=home.root.getObjectByName('breakfast-spoon');if(sp)sp.visible=true;}
  for(const g of kChairs)g.visible=on&&room==='kitchen';letterMesh.visible=on&&room==='kitchen';for(const B of BOXES)B.g.visible=on&&room==='room';tapeRoll.visible=on&&room==='room';DRAWER.visible=on&&room==='room';for(const m of Object.values(itemMeshes))m.visible=on&&room==='room';}
 function indoors(sky,h,day){dayWorld({evening:sky==='evening'});o.hideWorld?.(false);o.bikeAway?.(true);ST9.show('october');autumn(true);setDay(day,h,sky);C.where='house';C.inside=1;C.insideWant=1;C.fill=.82;C.cave=.5;lightsOn(true);for(let i=0;i<6;i++)light(i,null);minds('relaxed');leave(sam);}
 // ---- 13b: the letter ---------------------------------------------------------------------------------------------------------------------
 function sceneHome(){go('a1-home');indoors('evening',18.35,'OCTOBER 3');houseOn(true,{room:'kitchen'});C.grief=.32;applyGrief();C.amb={traffic:.04,insects:.05,wind:.2,life:.1,forest:0,tunnel:0,water:0};
  {const q=HW(TBL.x,TBL.z+.4,FL+2.1);light(0,q,{intensity:6,dist:6,color:0xffe2b8});}
  {const w=HW(MOMSEAT.x,MOMSEAT.z);putW(mom,w,HA(MOMSEAT.a),G(ACT9.sit(.47,{hands:'knees',lean:.2})),{noBlock:true});feel(mom,'tired',99);mood(mom,'tired');}
  const st=HW(KTB?KTB.x0+.85:1.3,KTB?KTB.z1-.75:-2.2);placeMe({x:st.x,z:st.z},headingTo(st.x,st.z,letterMesh.position.x,letterMesh.position.z));// (in the kitchen doorway's light, two steps in)
  checkpoint('a1-home');C.fadeIn=0;C.fadeInDur=2.4;
  task('home',(function*(){
   yield* lines([{wait:1.4},N('Monday night. Mom is at the kitchen table with a letter in front of her, not reading it.',{time:4}),{wait:.8},MO('Sit down a minute, honey.',{time:1.8,face:'tired'})]);
   objective('Sit down.','');
   const sitDown=()=>{const w=HW(MYSEAT.x,MYSEAT.z+.04);pose({x:w.x,z:w.z},{y:w.y+FL+1.08,yaw:HA(MYSEAT.a-.55),pitch:-.14,slow:1.2,seat:{h:.47,y:w.y+FL}});};// (turned a little toward her)
   offer('sit','Sit down',()=>V3(HW(MYSEAT.x,MYSEAT.z,FL+.7)),{r:2.6,fn:sitDown});
   yield* until(()=>C.flags.sit,40);if(!C.flags.sit){unoffer('sit');sitDown();}objective('','');
   yield* lines([{wait:1},MO('It came today. From the township.',{time:2.2})]);
   offer('letter','Read the letter',()=>letterMesh.getWorldPosition(new THREE.Vector3()),{r:2.6,inPose:true});
   yield* until(()=>C.flags.letter,24);unoffer('letter');
   if(C.flags.letter){letterMesh.visible=false;yield* holding(pageMesh(tex9('letter'),{w:.3,h:.4}),[N('OAK HOLLOW TOWNSHIP. Office of the Township Engineer. Survey not complete. Cannot certify the ground under any lot on the Drive.',{time:5.4}),
    {wait:.4},N('Somebody has circled “twelve to eighteen months” in pen. You know her circles.',{time:3.6})],{dist:.5,kind:'letter',min:4});letterMesh.visible=true;}
   mom.lookAt=camera.position;
   yield* lines([{wait:.8},MO('They can’t tell us the ground under the street is safe. Not for a year. Maybe a year and a half.',{time:4}),
    MO('And the money they’re giving people to stay runs out at the end of November.',{time:3.4}),{wait:1},
    MO('Your aunt has room for us. And there’s a job there I can start in November.',{time:3.4}),{wait:1.6},
    MO('And I lie awake listening to the floor. Every truck that goes by, I’m sitting up in bed listening.',{time:4.4,face:'tearful'}),MO('I can’t do another year of that. I can’t do it to you.',{time:3,face:'tearful'}),{wait:1.6},
    MO('We’re going to move, honey. In two weeks. The fifteenth.',{time:3,face:'tearful'})]);
   const ch=yield* choosing([{id:'sam',label:'“What about Sam?”'},{id:'no',label:'“I don’t want to go.”'},{id:'okay',label:'“Okay.”'},{id:'none',label:'Say nothing'}],{timeout:18,fallback:'none'});keep('told',{...C.keep.told,move:ch});
   if(ch==='sam')yield* lines([Y('What about Sam?',{time:1.4}),{wait:1.4},MO('Sam can call. You can write to each other. It isn’t the moon.',{time:3.2}),{wait:1},MO('I know it feels like the moon.',{time:2,face:'tearful'})]);
   else if(ch==='no')yield* lines([Y('I don’t want to go.',{time:1.6}),{wait:1.6},MO('I know.',{time:1.2,face:'tearful'}),{wait:1},MO('I don’t either. Not really.',{time:2})]);
   else if(ch==='okay')yield* lines([Y('Okay.',{time:1}),{wait:1.6},MO('...Okay?',{time:1.2}),{wait:1},MO('You don’t have to be okay about it, honey.',{time:2.4,face:'tearful'})]);
   else yield* lines([{wait:2.6},N('You don’t say anything. She doesn’t make you.',{time:2.8})]);
   mom.gest(G(ACT9.offer({hand:'r',base:ACT.seat(.47,{lean:.3})})));
   yield* lines([{wait:1.4},N('She reaches across the table and holds onto your hand. Her hand is cold from outside.',{time:4}),{wait:1.2},MO('I’m so sorry. About all of it.',{time:2.2,face:'crying'}),{wait:2.4}]);
   cry(.4,8);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-packing');})());}
 // ---- 14: your room in boxes ------------------------------------------------------------------------------------------------------------
 function packingSetup(){indoors('autumn',15.5,'OCTOBER 14');houseOn(true,{room:'room'});placeItems();houseOn(true,{room:'room'});C.grief=.3;applyGrief();C.amb={traffic:.08,insects:.04,wind:.4,life:.4,forest:0,tunnel:0,water:0};
  {const q=HW((RB.x0+RB.x1)/2,(RB.z0+RB.z1)/2,FL+2.2);light(0,q,{intensity:5,dist:7,color:0xfff0dc});}
  DR9.k=0;DR9.want=0;BIGBOX.set(1);BIGBOX.want=1;BIGBOX.tape.visible=false;
  const st=home.SPOTS?.wake||HW(RB.x1-1.4,1.3);placeMe({x:st.x,z:st.z},headingTo(st.x,st.z,BIGBOX.g.position.x,BIGBOX.g.position.z));
  try{home.renderView?.();}catch{}}
 function scenePacking(){go('a1-pack');packingSetup();checkpoint('a1-packing');C.fadeIn=0;C.fadeInDur=2.4;C.packed=C.packed||[];
  task('packing',(function*(){
   yield* lines([{wait:1.4},N('Your room, in boxes. Most of it. The bed’s still the bed. The light comes in the window the same as it always did.',{time:4.8})]);
   objective('Pack your room.','What goes in the box is up to you.');
   offer('drawer','Open the drawer',()=>V3(HW(RB.x0+.75,RB.z0+.56,FL+.74)),{r:2.4,look:true,size:.3,cone:.2,fn:()=>{DR9.want=1;sound('c7Drag',DRAWER.position,{gain:.3});}});
   offer('window','Look out the window',()=>home.SPOTS?.window||V3(HW(home.WIN?.x||5,RB.z1-.2,FL+1.2)),{r:2.4,look:true,size:.5,cone:.25,when:()=>!busy(),fn:()=>{say([N('The street. The new pole by the curb, its wood still pale. The maple across the road gone orange.',{time:4.4}),{wait:.8},N('In a month somebody else will look out of this window and not know any of it.',{time:3.8})]);}});
   later(26,()=>{if(S.phase==='a1-pack'&&!busy())say([MO('(from the hall) Honey? The truck’s coming at eight. Anything you want in the car, put by the front door.',{time:4})]);});
   const avail=()=>Object.entries(ITEMS).filter(([id,I])=>(!I.when||I.when())&&!C.packed.includes(id)&&!(C.kept||[]).includes(id));
   for(const [id,I] of Object.entries(ITEMS)){if(I.when&&!I.when())continue;offer('item-'+id,I.name,()=>{if(id==='booth'&&DR9.k<.8)return null;return itemAt(id);},{r:2.4,look:true,size:.22,cone:.2,when:()=>!busy()&&!C.handling&&(id!=='booth'||DR9.k>.8)});}
   let t0=C.pt;
   while(true){yield;
    for(const [id] of Object.entries(ITEMS)){if(C.flags['item-'+id]&&!C['done-'+id]){C['done-'+id]=true;C.handling=true;yield* handle(id);C.handling=false;}}
    const handled=(C.packed.length+(C.kept||[]).length);
    if(!C.flags.tapeOffered&&handled>=2&&!busy()){C.flags.tapeOffered=true;objective('Pack your room.','Tape the box when you’re done.');offer('tape','Tape the box shut',()=>V3({x:BIGBOX.g.position.x,y:BIGBOX.g.position.y+.45,z:BIGBOX.g.position.z}),{r:2.4,look:true,size:.3,cone:.22,hold:1.8,when:()=>!busy()&&!C.handling,
     tick:(dt,v)=>{BIGBOX.want=1-Math.min(1,v*1.6);if(Math.random()<dt*2)sound('a1Tape',BIGBOX.g.position,{gain:.3});},release:()=>{BIGBOX.want=1;},fn:()=>{BIGBOX.want=0;BIGBOX.tape.visible=true;sound('a1Tape',BIGBOX.g.position,{gain:.5});}});}
    if(C.flags.tape)break;if(C.pt-t0>360&&handled>=1&&!busy()){BIGBOX.want=0;BIGBOX.tape.visible=true;break;}}
   for(const id of ['drawer','window','tape',...Object.keys(ITEMS).map(i=>'item-'+i)])unoffer(id);
   keep('boxed',C.packed.slice());keep('told',{...C.keep.told,keptOut:(C.kept||[]).slice()});
   yield* lines([{wait:1},N('You write YOUR ROOM on the top in marker, and then cross it out, and write it again.',{time:4}),{wait:2.2}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-goodbye');})());}
 function* handle(id){const I=ITEMS[id];const m=itemMeshes[id];if(m)m.visible=false;
  yield* holding(I.held(),I.ls,{dist:id==='booth'?.36:.42,kind:'item-'+id,min:3});
  const ch=yield* choosing([{id:'box',label:'Put it in the box'},{id:'keep',label:id==='calendar'?'Leave it on the wall':'Keep it with you'}],{timeout:16,fallback:'box'});
  if(ch==='box'){C.packed.push(id);sound('a1Box',BIGBOX.g.position,{gain:.25});mark('packed: '+id);if(id==='cap'){capTo('away');}}
  else{(C.kept||(C.kept=[])).push(id);mark('kept: '+id);if(m&&id==='calendar')m.visible=true;}
  if(id==='cap')yield* lines([{wait:.4},N(ch==='box'?'You put it in on top, where nothing will squash it.':'You put it in your jacket pocket. It’s going in the car with you.',{time:3.2})]);}
 // ---- 15: Sam, at the curb ------------------------------------------------------------------------------------------------------------------
 const TRUCK=(()=>{const g=new THREE.Group();g.name='a1-moving-truck';const cab=new THREE.Group();makeCar(KT,cab,'van',0xe8e6de,{lights:false});cab.scale.set(1,1.02,.62);cab.position.z=-2.3;g.add(cab);
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.5,5),mat(0xefede6,{roughness:.6}));body.position.set(0,1.75,1.4);g.add(body);const stripe=new THREE.Mesh(new THREE.BoxGeometry(2.32,.3,4.6),mat(0x2f5f8f,{roughness:.6}));stripe.position.set(0,1.2,1.4);g.add(stripe);
  const ramp=new THREE.Mesh(new THREE.BoxGeometry(.9,.04,2.2),mat(0x9a9c9e,{roughness:.4,metalness:.6}));ramp.position.set(0,.3,4.85);ramp.rotation.x=.22;g.add(ramp);g.userData.ramp=ramp;
  for(const z of [-.2,2.8])for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,14),mat(0x222222));w.rotation.z=Math.PI/2;w.position.set(s*1.0,.42,z);g.add(w);}
  g.visible=false;scene.add(g);return g;})();
 const CAR=(()=>{const g=new THREE.Group();g.name='a1-moms-car';makeCar(KT,g,'wagon',0x6a7f8e,{lights:true});const SHELL=[...g.children];g.userData.shell=SHELL;// (the model is solid to the belt with a solid glass block over it: seen from outside only)
  // the inside, from the passenger's seat: a dash, the pillars, the doors, a wheel, a mirror
  const I=new THREE.Group();I.name='a1-car-inside';g.add(I);const dk=mat(0x2c2e30,{roughness:.8}),gr=mat(0x55585a,{roughness:.7});
  const dash=new THREE.Mesh(new THREE.BoxGeometry(1.66,.24,.5),dk);dash.position.set(0,.84,-1.02);I.add(dash);
  for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.07,.62,.07),dk);p.position.set(s*.79,1.16,-.82);p.rotation.x=-.62;I.add(p);
   const door=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,1.9),gr);door.position.set(s*.86,.72,.05);I.add(door);const sill=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,1.9),dk);sill.position.set(s*.83,.98,.05);I.add(sill);
   const roof=new THREE.Mesh(new THREE.BoxGeometry(.08,.05,2.1),dk);roof.position.set(s*.76,1.42,.25);I.add(roof);const bp=new THREE.Mesh(new THREE.BoxGeometry(.08,.46,.08),dk);bp.position.set(s*.78,1.2,.42);I.add(bp);}
  const roofF=new THREE.Mesh(new THREE.BoxGeometry(1.56,.05,.08),dk);roofF.position.set(0,1.42,-.6);I.add(roofF);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.19,.022,8,24),dk);wheel.position.set(-.42,1.0,-.72);wheel.rotation.x=-.45;I.add(wheel);
  const mir=new THREE.Mesh(new THREE.BoxGeometry(.24,.07,.03),dk);mir.position.set(0,1.32,-.62);I.add(mir);
  const console2=new THREE.Mesh(new THREE.BoxGeometry(.24,.3,.8),dk);console2.position.set(0,.55,-.35);I.add(console2);
  for(const s of [-1,1]){const sb=new THREE.Mesh(new THREE.BoxGeometry(.5,.62,.1),gr);sb.position.set(s*.42,.9,.12);sb.rotation.x=-.12;I.add(sb);}
  // the rest of the cabin (shown only from inside, on the road out): the hood beyond the glass, the floor, the roof, the back seat, the wagon's back
  const paintI=mat(0x6a7f8e,{roughness:.38,metalness:.25}),cloth=mat(0x4a4c50,{roughness:1}),head=mat(0x8a8c88,{roughness:.9});
  const hood=new THREE.Mesh(new THREE.BoxGeometry(1.74,.06,1.3),paintI);hood.position.set(0,.88,-1.85);hood.rotation.x=.05;I.add(hood);
  const floor=new THREE.Mesh(new THREE.BoxGeometry(1.6,.04,3.2),dk);floor.position.set(0,.34,.4);I.add(floor);
  const roofI=new THREE.Mesh(new THREE.BoxGeometry(1.56,.03,2.9),head);roofI.position.set(0,1.44,.75);I.add(roofI);
  for(const s of [-1,1]){const seat=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.5),cloth);seat.position.set(s*.42,.5,-.08);I.add(seat);
   const rear=new THREE.Mesh(new THREE.BoxGeometry(.06,.5,1.2),gr);rear.position.set(s*.86,.72,1.6);I.add(rear);const rsill=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,1.2),dk);rsill.position.set(s*.83,.98,1.6);I.add(rsill);
   const cp=new THREE.Mesh(new THREE.BoxGeometry(.08,.46,.08),dk);cp.position.set(s*.78,1.2,1.2);I.add(cp);const dp=new THREE.Mesh(new THREE.BoxGeometry(.08,.46,.1),dk);dp.position.set(s*.76,1.2,2.25);I.add(dp);}
  const bench=new THREE.Mesh(new THREE.BoxGeometry(1.5,.12,.5),cloth);bench.position.set(0,.5,.95);I.add(bench);const bback=new THREE.Mesh(new THREE.BoxGeometry(1.5,.55,.1),cloth);bback.position.set(0,.8,1.18);bback.rotation.x=-.1;I.add(bback);
  const tail=new THREE.Mesh(new THREE.BoxGeometry(1.6,.6,.06),gr);tail.position.set(0,.66,2.3);I.add(tail);const tailTop=new THREE.Mesh(new THREE.BoxGeometry(1.6,.06,.08),dk);tailTop.position.set(0,1.4,2.28);I.add(tailTop);
  for(const m of [hood,floor,roofI,bench,bback,tail])m.castShadow=false;
  I.visible=false;g.userData.inside=I;
  g.visible=false;scene.add(g);return g;})();
 // from inside (the road out) or from outside (the curb): the model's own shell, or the cabin
 function carFrom(inside){for(const m of CAR.userData.shell)m.visible=!inside;CAR.userData.inside.visible=inside;}
 const MOVERS=[vol4,vol5].filter(Boolean),moverBoxes=MOVERS.map(()=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.4),boxM);b.visible=false;scene.add(b);return b;});
 function goodbyeSetup(){streetWorld('october',{sky:'autumn'});autumn(true);setDay('OCTOBER 15',16.6,'autumn');C.skyK={p:.34,day:.6};C.grief=.3;applyGrief();C.amb={traffic:.1,insects:.04,wind:.42,life:.5,forest:0,tunnel:0,water:0};
  // the truck at the curb, its ramp down; your mother's car in the drive; your bike by the ramp
  {const q=SP(DRIVE_D+6.5,-5.2);TRUCK.position.set(q.x,q.y,q.z);TRUCK.rotation.y=-heading(DRIVE_D)+Math.PI;TRUCK.visible=true;}
  {const q=HW(HP.drivX??HP.gx,(HP.drivEnd+HP.endLat)/2-.4);CAR.position.set(q.x,gy(q.x,q.z),q.z);CAR.rotation.y=-HA(0);CAR.visible=true;carFrom(false);}
  {const b=MEM.myBike;MEM.chainSet(1);const q=SP(DRIVE_D+1.4,-6.6);b.group.visible=true;b.group.position.set(q.x,q.y,q.z);b.group.rotation.set(0,-heading(DRIVE_D),.12);b.kickstand=1;b.steerAngle=.3;poseBike(b);}
  {const q=HW((HP.doorX??0)+1.5,HP.stepFront+1.8);putW(mom,q,HA(Math.PI)+.4,G(ACT9.clipboard()));feel(mom,'tired',99);}
  MOVERS.forEach((a,i)=>{const q=SP(DRIVE_D+2+i*1.4,-9-i);putW(a,q,heading(DRIVE_D)+1.2,null);a.moverT=i*3.5;a.moverS='to';});
  const st=SP(DRIVE_D-1.6,-6.2);placeMe(st,headingTo(st.x,st.z,SP(DRIVE_D+30,-3).x,SP(DRIVE_D+30,-3).z));leave(sam);}
 function updateMovers(dt){if(!TRUCK.visible||S.phase!=='a1-bye')return;const door=HW(HP.doorX??0,HP.stepFront+.8),ramp=(()=>{TRUCK.updateMatrixWorld(true);return new THREE.Vector3(0,0,6.2).applyMatrix4(TRUCK.matrixWorld);})();
  MOVERS.forEach((a,i)=>{if(a.walking)return;a.moverT-=dt;if(a.moverT>0)return;const to=a.moverS==='to';a.moverS=to?'back':'to';a.moverT=1.5+Math.random()*2;
   a.gest(to?G(ACT9.holdOut()):null);moverBoxes[i].visible=to;const q=to?ramp:door;a.walk([[q.x+(i?.5:-.5),q.z]],{speed:1.1});});
  MOVERS.forEach((a,i)=>{const b=moverBoxes[i];if(!b.visible)return;a.person.group.updateMatrixWorld(true);const p=a.person.group.localToWorld(new THREE.Vector3(0,1.02,-.32));b.position.copy(p);b.rotation.y=-a.a;});}
 function sceneGoodbye(){go('a1-bye');goodbyeSetup();checkpoint('a1-goodbye');C.fadeIn=0;C.fadeInDur=2.4;
  task('bye',(function*(){
   yield* lines([{wait:1.4},N('The truck came at eight this morning. Two men you don’t know have been carrying your house down the driveway all day, a box at a time.',{time:5.4})]);
   // Sam, down the street
   {const a=SP(DRIVE_D+48,-2.6),b=SP(DRIVE_D+16,-3.2),c=SP(DRIVE_D+2.4,-4.4);sam.gone=false;comp.putRiding(sam,a.x,a.z,heading(DRIVE_D)+Math.PI,3);sam.person.group.visible=true;sam.bike.group.visible=true;sam.follow=null;weep(sam,'tired',99);mood(sam,'tired');
    comp.run(sam,[comp.steps.rideTo(sam,[[b.x,b.z],[c.x,c.z]],{vmax:3.2,vend:0}),comp.steps.brake(sam,.6),comp.steps.dismount(sam)],{then:()=>{C.flags.samHere=true;}});}
   yield* until(()=>C.flags.samHere,40);
   {const b=MEM.myBike.group.position,w={x:b.x+.7,z:b.z+.4};stand(sam,w,{look:()=>V3({x:b.x,y:b.y+.5,z:b.z}),max:1});}
   yield* lines([{wait:.4},SM('Hey.',{time:1}),{wait:1.6},N('He goes straight to your bike, like that’s what he came for. He crouches down and turns the pedal and watches the chain go round.',{time:5})]);
   yield* until(()=>D({x:sam.px,z:sam.pz},MEM.myBike.group.position)<1.4,8);
   {const b=MEM.myBike.group.position;pinSam({x:b.x+.55,z:b.z+.25},{a:headingTo(b.x+.55,b.z+.25,b.x,b.z),gesture:ACT.kneel({side:1,lookPitch:-.4}),blend:1,world:true});}
   C.spinBike=true;
   yield* lines([{wait:1.4},SM('I put a new link in it. On Tuesday, when you weren’t looking.',{time:3}),{wait:.8},SM('It’ll hold.',{time:1.2}),{wait:1.2},SM('Probably.',{time:1.2})]);
   C.spinBike=false;pinSam(null);{const w=SP(DRIVE_D-.4,-5.6);stand(sam,w,{look:()=>camera.position,max:1});}
   yield* wait(1.4);
   // his notebook
   yield* lines([SM('Here.',{time:1}),{wait:.6},SM('You should have it.',{time:1.6})]);
   objective('Sam’s notebook.','');
   offer('notebook','Take the notebook',()=>headOf(sam),{r:2.8});
   yield* until(()=>C.flags.notebook,30);unoffer('notebook');keep('notebook','you');
   yield* holding(pageMesh(texOf(notebookPage('names',{names:'ALEX\nJAMIE\nSAM'}))||tex9('card',['ALEX · JAMIE · SAM','','']),{w:.24,h:.32}),[N('His notebook. The names, in your writing, where you wrote them in the gym that Monday.',{time:4.2}),{wait:.6},
    N('On the inside of the back cover, in his square printing: his aunt’s phone number. His dad’s e-mail. And under that: RULE 6. WRITE BACK.',{time:5.6})],{dist:.42,kind:'notebook',min:4});
   yield* lines([{wait:.8},SM('I’m keeping the Tour. Somebody has to.',{time:2.4}),{wait:1.6},SM('Rule five.',{time:1.4,face:'tearful'}),{wait:2.4}]);
   const r5=yield* choosing([{id:'say',label:'“Nobody gets left behind.”'},{id:'none',label:'Say nothing'}],{timeout:12,fallback:'none'});keep('told',{...C.keep.told,rule5:r5});
   if(r5==='say')yield* lines([Y('Nobody gets left behind.',{time:2}),{wait:2},SM('...Yeah.',{time:1.2,face:'tearful'}),SM('That was always the stupid one. Everybody got left behind. Jamie, every time his chain came off.',{time:4.6}),{wait:1.6},SM('We always went back for him, though.',{time:2.4,face:'crying'})]);
   else yield* lines([{wait:1.6},N('Neither of you says it. Neither of you has to.',{time:3})]);
   cry(.4,8);
   yield* lines([{wait:1.4},SM('Call me when you get there. So I know you got there.',{time:2.8})]);
   const c2=yield* choosing([{id:'will',label:'“I will.”'},{id:'week',label:'“Every Sunday.”'},{id:'write',label:'“You write back. Rule six.”'}],{timeout:14,fallback:'will'});keep('told',{...C.keep.told,call:c2});
   yield* lines([c2==='will'?Y('I will.',{time:1}):c2==='week'?Y('Every Sunday.',{time:1.4}):Y('You write back. Rule six.',{time:1.8}),{wait:1},SM(c2==='write'?'I made it up. It still counts.':'Okay.',{time:c2==='write'?2.2:1})]);
   yield* lines([{wait:1.6},MO('Honey. It’s time.',{time:1.6})]);
   const c3=yield* choosing([{id:'hug',label:'Hug him'},{id:'arm',label:'Punch his arm'},{id:'see',label:'“See you, Sam.”'}],{timeout:14,fallback:'see'});keep('told',{...C.keep.told,bye:c3});
   if(c3==='hug'){const p=me(),h=headingTo(p.x,p.z,sam.px,sam.pz);pinSam({x:p.x+Math.sin(h)*.42,z:p.z-Math.cos(h)*.42},{a:h+Math.PI,gesture:ACT.embrace(sam,{px:p.x,pz:p.z,pa:h,person:o.self},{k:1}),blend:.6,world:true});
    pose({x:p.x+Math.sin(h)*.12,z:p.z-Math.cos(h)*.12},{y:gy(p.x,p.z)+1.3,yaw:h,pitch:-.3,slow:.9,stand:true});sound('a1Cloth',camera.position,{gain:.4});
    yield* lines([{wait:1.6},N('It’s quick, and too hard, and neither of you is any good at it.',{time:3.4}),{wait:1}]);unpose();pinSam(null);}
   else if(c3==='arm')yield* lines([{wait:.4},N('You punch him in the arm. Not hard. He punches you back, harder, and it’s the best thing that’s happened all week.',{time:4.8}),{wait:.8}]);
   else yield* lines([Y('See you, Sam.',{time:1.4}),{wait:1},SM('See you.',{time:1})]);
   // he rides off: up the street, as far as the lamp post; he stops, and puts a foot down, and waves
   {const lamp=SP(485,2.6),b=SP(470,-2.4);stand(sam,null);if(sam.mode==='foot')comp.putRiding(sam,sam.bx??sam.px,sam.bz??sam.pz,heading(DRIVE_D),0);
    comp.run(sam,[comp.steps.rideTo(sam,[[b.x,b.z],[lamp.x,lamp.z]],{vmax:3.4,vend:0}),comp.steps.brake(sam,.6)],{then:()=>{C.flags.samAtLamp=true;}});}
   objective('','');
   yield* until(()=>C.flags.samAtLamp,40);C.samWave=C.t;later(5.5,()=>{C.samWave=null;});
   yield* lines([{wait:.6},N('At the lamp post he stops, and puts a foot down, and turns round, and waves.',{time:3.6}),{wait:2.6},
    N('For a second you wait for the other two. The way you always did. One at Briarwood, ringing his bell. One at his porch light.',{time:5.4}),{wait:2.2},
    N('Nobody comes round the corner after him. Nobody’s going to.',{time:3.6}),{wait:2.6}]);
   cry(.55,10);
   {const a=SP(560,-2.4);comp.run(sam,[comp.steps.rideTo(sam,[[a.x,a.z]],{vmax:3.4,vend:2})],{then:()=>leave(sam)});}
   yield* lines([{wait:2.4},MO('Honey.',{time:1}),{wait:1}]);
   objective('The car.','');
   offer('car','Get in the car',()=>{CAR.updateMatrixWorld(true);return new THREE.Vector3(1.05,1.1,-.3).applyMatrix4(CAR.matrixWorld);},{r:2.6});
   yield* until(()=>C.flags.car,60);
   sound('carDoor',camera.position,{gain:.5});C.fadeOut=0;C.fadeOutDur=2.4;C.after=()=>toNext('a1-road-out');})());}
 // ---- 16: the road out ------------------------------------------------------------------------------------------------------------------------
 const ROAD={d:DRIVE_D+4,v:0,lat:0,on:false,lookedBack:0,kept:false,ahead:0,ended:false};
 const _cf=new THREE.Vector3(),_cb=new THREE.Vector3();
 function laneLat(d){// the right-hand side of the road going down it (toward the start of the street)
  const a=SP(d,0),b=SP(d,1),h=heading(d)+Math.PI,rx=Math.cos(h),rz=Math.sin(h);return ((b.x-a.x)*rx+(b.z-a.z)*rz)>0?2.1:-2.1;}
 function roadSetup(){streetWorld('october',{sky:'last',evening:true});autumn(true);setDay('OCTOBER 15',18.3,'last');C.skyK={};C.grief=.3;applyGrief();C.amb={traffic:.12,insects:.08,wind:.3,life:.3,forest:0,tunnel:0,water:0};
  TRUCK.visible=false;MEM.myBike.group.visible=false;Object.assign(ROAD,{d:DRIVE_D+3,v:0,on:true,lookedBack:0,kept:false,ahead:0,ended:false,t:0});ROAD.lat=laneLat(DRIVE_D);
  CAR.visible=true;carFrom(true);placeCar(0);
  {CAR.updateMatrixWorld(true);const mq=new THREE.Vector3(-.42,0,-.05).applyMatrix4(CAR.matrixWorld);putW(mom,{x:mq.x,z:mq.z},-CAR.rotation.y,G(ACT9.sit(.5,{hands:'knees',lean:.04})),{noBlock:true});}feel(mom,'tired',99);
  // you, in the passenger seat (looking where you like)
  const s=seatWorld();placeMe({x:s.x,z:s.z},s.a);C.roadPose=true;pose({x:s.x,z:s.z},{y:s.y,yaw:s.a,pitch:-.04,slow:.6,seat:{h:.5,y:s.gy}});}
 function seatWorld(){CAR.updateMatrixWorld(true);const p=new THREE.Vector3(.42,1.17,-.12).applyMatrix4(CAR.matrixWorld);return {x:p.x,y:p.y,z:p.z,a:-CAR.rotation.y,gy:CAR.position.y};}
 function placeCar(dt){const d=ROAD.d,q=SP(d,ROAD.lat),a=heading(d)+Math.PI;CAR.position.set(q.x,q.y,q.z);CAR.rotation.y=-a;
  // your mother at the wheel
  CAR.updateMatrixWorld(true);const mq=new THREE.Vector3(-.42,0,-.05).applyMatrix4(CAR.matrixWorld);mom.x=mq.x;mom.z=mq.z;mom.a=a;void dt;}
 function updateRoad(dt){if(!ROAD.on||S.phase!=='a1-road')return;ROAD.t=(ROAD.t||0)+dt;
  const target=ROAD.t<4?0:ROAD.d<-150?3:9.5;ROAD.v=damp(ROAD.v,target,ROAD.t<4?2:.6,dt);const prev=seatWorld();ROAD.d-=ROAD.v*dt;placeCar(dt);const s=seatWorld();
  // (the view and your seated body are placed from this pose on the next frame: lead them by that frame's travel, so you sit in the seat
  //  rather than a hand's width behind it)
  if(C.pose&&C.roadPose){const lead=ROAD.v*dt,px=s.x+Math.sin(s.a)*lead,pz=s.z-Math.cos(s.a)*lead;C.pose.x=px;C.pose.y=s.y;C.pose.z=pz;C.pose.yaw=s.a;C.pose.baseYaw=s.a;
   if(C.pose.seat){C.pose.seat.x=px;C.pose.seat.z=pz;C.pose.seat.a=s.a;C.pose.seat.y=s.gy;}}
  o.shift?.(s.x-prev.x,s.z-prev.z,{bike:false});
  // looking back (the way you came), looking ahead
  camera.getWorldDirection(_cf);_cb.set(Math.sin(s.a),0,-Math.cos(s.a));const dot=_cf.x*_cb.x+_cf.z*_cb.z;
  if(dot<-.45)ROAD.lookedBack+=dt;if(dot>.8)ROAD.ahead+=dt;else ROAD.ahead=0;}
 // what you kept, on your lap in the car (the notebook in the middle; his cap; the picture)
 const LAP={};
 function lapItems(ids){for(const m of Object.values(LAP))m.removeFromParent();for(const kk of Object.keys(LAP))delete LAP[kk];
  const at={notebook:[.42,.6,-.2,0],cap:[.29,.63,-.16,.4],print:[.56,.6,-.24,-.3]};// (on your thighs: you sit with the seat's cushion under you, your knees a little past it)
  for(const id of ids){let m;if(id==='notebook'){m=new THREE.Group();const cv=new THREE.Mesh(new THREE.BoxGeometry(.16,.014,.21),mat(0x2c4a7a,{roughness:.8}));m.add(cv);}
   else if(id==='cap'){m=capG.clone();m.visible=true;m.scale.setScalar(.95);}else{m=pageMesh(tex9('sunday'),{w:.15,h:.11});m.rotation.x=-Math.PI/2+.3;}
   const [x,y,z,r]=at[id];const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=r;g.add(m);g.name='a1-lap-'+id;CAR.add(g);LAP[id]=g;}}
 function sceneRoad(){go('a1-road');roadSetup();checkpoint('a1-road-out');C.fadeIn=0;C.fadeInDur=2.6;
  task('road',(function*(){
   yield* lines([{wait:1.6},N('Mom pulls out from the curb. She doesn’t look at the house. You do.',{time:3.6})]);
   objective('The road out.','Look back if you want.');
   yield* until(()=>ROAD.t>8,12);
   yield* lines([N('Down Oak Hollow, the way you’ve gone ten thousand times on your bike. The new pole. The hoop on the garage at the bottom. The streetlights coming on.',{time:5.4})]);
   // look back
   const t0=C.pt;yield* until(()=>ROAD.lookedBack>1.2||C.pt-t0>24,30);
   if(ROAD.lookedBack>1.2){mark('looked back');yield* lines([N('Behind you, Oak Hollow gets smaller. The lights on, all the way up the hill, as far as you can see. You can’t see the fence from here. You can’t see the oak.',{time:6})]);}
   else yield* lines([N('You don’t look back. You aren’t sure you could.',{time:3})]);
   keep('told',{...C.keep.told,lookedBack:ROAD.lookedBack>1.2});
   // what you kept
   const kept=['notebook',...(C.keep.cap==='you'&&!(C.keep.boxed||[]).includes('cap')?['cap']:[]),...(C.keep.print&&!(C.keep.boxed||[]).includes('print')?['print']:[])];
   const KEPT={notebook:{label:'Look at the notebook',obj:()=>pageMesh(texOf(notebookPage('names',{names:'ALEX\nJAMIE\nSAM'}))||tex9('card',['ALEX · JAMIE · SAM','','']),{w:.24,h:.32})},
    cap:{label:'Jamie’s cap',obj:()=>{const g=capG.clone();g.visible=true;g.rotation.set(.4,0,0);return g;}},print:{label:'The picture',obj:()=>pageMesh(tex9('sunday'),{w:.24,h:.18})}};
   objective('The road out.','What you kept is on your lap.');
   lapItems(kept);
   for(const id of kept)offer('kept-'+id,KEPT[id].label,()=>LAP[id]?.getWorldPosition(new THREE.Vector3())||null,{r:3,inPose:true,ride:true,look:true,size:.12,cone:.22});
   const t1=C.pt;yield* until(()=>kept.some(id=>C.flags['kept-'+id])||C.pt-t1>22,30);
   const which=kept.find(id=>C.flags['kept-'+id]);for(const id of kept)unoffer('kept-'+id);
   if(which){keep('told',{...C.keep.told,lookedAt:which});later(3,()=>sound('a1Theme',camera.position,{gain:.45}));
    yield* holding(KEPT[which].obj(),[N(which==='notebook'?'ALEX · JAMIE · SAM. In your writing.':which==='cap'?'His cap. Blue. On your knee, where you can keep a hand on it.':'Sunday at the oak. Four bikes in the grass.',{time:3.4}),{wait:1.2},
     N('You can’t remember, exactly, what it was like to live here before that week. You try, and it’s like trying to remember a room you’ve only seen in a picture.',{time:6}),{wait:1},
     N('But you know their names. You know what happened. You know it was real.',{time:4.2})],{dist:.42,kind:'kept',min:6});}
   else yield* lines([N('You can’t remember, exactly, what it was like to live here before that week.',{time:3.6}),{wait:1},N('But you know their names. You know it was real.',{time:3.2})]);
   // when you can look ahead (or the road runs out)
   objective('','');
   yield* until(()=>ROAD.ahead>3.2||ROAD.d<-170,90);
   yield* lines([{wait:.8},N(ROAD.ahead>3.2?'You turn round in your seat and look at the road in front of you, because that’s where you’re going.':'The street runs out, and the road goes on.',{time:4}),{wait:2.4}]);
   C.endT=0;})());}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------------
 function update(dt){
  if(DRAWER.visible){DR9.k=damp(DR9.k,DR9.want,4,dt);const b=DRAWER.userData.base;
   const f=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),DRAWER.rotation.y);DRAWER.position.set(b.x+f.x*.36*DR9.k,b.y,b.z+f.z*.36*DR9.k);DRAWER.updateMatrixWorld(true);
   const m=itemMeshes.booth;if(m&&!C['done-booth']){m.visible=DR9.k>.3;const p=new THREE.Vector3(.1,-.085,.05).applyMatrix4(DRAWER.matrixWorld);m.position.copy(p);m.updateMatrixWorld(true);}}
  for(const B of BOXES){if(B.want!==undefined&&Math.abs(B.k-B.want)>.002)B.set(damp(B.k,B.want,6,dt));}
  if(C.spinBike){const b=MEM.myBike;b.crankAngle=(b.crankAngle||0)-dt*2.2;b.wheel=(b.wheel||0)-dt*3;poseBike(b);}
  updateMovers(dt);updateRoad(dt);}
 const _wp=newPose();
 function afterActors(){// Sam's wave (on his bike, a foot down): his right arm up, the hand going side to side
  if(C.samWave!=null&&!sam.gone&&sam.person.group.visible){const t=C.t-C.samWave,k=Math.min(1,t/.5)*Math.min(1,Math.max(0,(5.2-t)/.6));copyPose(_wp,sam.pose);
   const x=.24+Math.sin(t*7)*.07,y=1.72,z=-.04;_wp[PP.rh]+=(x-_wp[PP.rh])*k;_wp[PP.rh+1]+=(y-_wp[PP.rh+1])*k;_wp[PP.rh+2]+=(z-_wp[PP.rh+2])*k;_wp[PP.re]+=(1-_wp[PP.re])*k;_wp[PP.re+1]+=(.3-_wp[PP.re+1])*k;_wp[PP.re+2]+=(.1-_wp[PP.re+2])*k;_wp[PP.hy]=(_wp[PP.hy]||0)+.6*k;
   applyPose(sam.person,_wp);sam.posedAt=C.t;}}
 function sources(out){if(TRUCK.visible&&S.phase==='a1-bye')out.push({id:'a1-truck-idle',kind:'idle',pos:V3({x:TRUCK.position.x,y:1,z:TRUCK.position.z}),level:.35});
  if(ROAD.on&&S.phase==='a1-road'){const s=seatWorld();out.push({id:'a1-car-engine',kind:'idle',pos:new THREE.Vector3(s.x,s.y-.4,s.z),level:.5+ROAD.v*.03});}}
 function reset(){houseOn(false);autumn(false);TRUCK.visible=false;CAR.visible=false;for(const m of Object.values(LAP))m.removeFromParent();for(const kk of Object.keys(LAP))delete LAP[kk];for(const b of moverBoxes)b.visible=false;ROAD.on=false;C.roadPose=false;for(const B of BOXES){B.want=undefined;}DR9.k=0;DR9.want=0;
  for(const m of Object.values(itemMeshes))m.removeFromParent();for(const kk of Object.keys(itemMeshes))delete itemMeshes[kk];}
  // the end card by itself (DEV): black, then the card, as the road out ends it
 function sceneEnd(){go('a1-road');o.fade(1);objective('');C.endT=0;}
 return {SCENE:{'a1-weeks':()=>sceneWeeks(),'a1-home':()=>sceneHome(),'a1-packing':()=>scenePacking(),'a1-goodbye':()=>sceneGoodbye(),'a1-road-out':()=>sceneRoad(),'aftermath1-end':()=>sceneEnd()},
  update,afterActors,sources,reset,TRUCK,CAR,ROAD,BOXES,BIGBOX,DRAWER,DR9,ITEMS,itemMeshes,autumn,home,LAP,
  canDismount:()=>S.phase==='a1-weeks',canRemount:()=>S.phase==='a1-weeks'};
}
