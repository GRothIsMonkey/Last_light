// Aftermath I, Act II: what they remember. The school's wing, that afternoon and the two days after.
//
//  5. The nurse's room, Saturday afternoon: water that goes grey in the sink; a cut you did not know about; something to eat;
//     the fan Sam's father finds in the office; Sam trying to explain how a hinge works, and then the chain.
//  6. Room 6, Sunday morning: Reyes writing down what he saw, and what you lay out on the table for him, in your own order.
//  7. Monday, the county's list on the gym wall: a line with an age and a street and no name. You know whose. For a moment you
//     cannot reach the word; the names in Sam's notebook, in your own handwriting; a pen on a string.
// Nothing here is the thing under the court doing anything. It is shut away. What it did before is still done.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {ACT} from './chapter8-acting.js';
import {ACT9,G,asC} from './aftermath1-acting.js';
import {tex9,fresh9} from './aftermath1-props.js';
import {paper8} from './chapter8-props.js';
import {notebookPage,texOf} from './chapter7-props.js';
import {makeCameraModel} from './alex-camera.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {P as PP} from './rig.js';

export function recordActs(H){
 const {o,k,C,S,phys,comp,sam,cast,FACES,sound,gy,light,checkpoint,later,mark,say,SM,Y,N,V,R,SD,MO,person,task,wait,until,lines,quiet,offer,unoffer,V3,near,pose,unpose,posed,holding,pageMesh,choosing,me,go,objective,busy,nav,camera,scene,
  stand,joinFoot,minds,setDay,keep,cry,weep,feel,mood,applyGrief,headOf,SCH,W,WQ,D,put,sitG,KNEEL,blanket,pinSam,schoolWorld,capTo,CAP,gymCast,VOL,canon}=H;
 const {reyes,officer,samDad,samMom,jamieMom,alexDad,alexMom,mom,vol,medic,mrsH,mrH,lily,pruitt,davis,extras}=cast;
 const [vol1,vol2,vol3,vol4,vol5,huang,delaney,pruitt3,okafor]=extras;
 const MED=person('PARAMEDIC',medic);
 const NS=SCH.NSPOT,RS=SCH.RSPOT,SP=SCH.SPOT;
 const root=new THREE.Group();root.name='a1-record-props';
 const mat=(c,o2={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.8,...o2});m.name='a1-rec';return m;};
 const box=(g,w,h,d,m,x=0,y=0,z=0)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=true;g.add(b);return b;};
 const WV=(q,y)=>{const w=W(q.x,q.z);return new THREE.Vector3(w.x,y??q.y??0,w.z);};
 // ---- the nurse's room's things ------------------------------------------------------------------------------------------------
 // the box fan from the office (a handle on top: carried by it)
 const fanG=(()=>{const g=new THREE.Group();g.name='a1-box-fan';const frame=mat(0xd9d4c6,{roughness:.6}),grey=mat(0x8a8c8e,{roughness:.4,metalness:.4}),blade=mat(0x9aa6ae,{roughness:.5});
  box(g,.48,.035,.13,frame,0,.47,0);box(g,.48,.035,.13,frame,0,.03,0);box(g,.035,.44,.13,frame,-.2225,.25,0);box(g,.035,.44,.13,frame,.2225,.25,0);
  for(const r of [.07,.13,.19])for(const z of [-.05,.05]){const t=new THREE.Mesh(new THREE.TorusGeometry(r,.0025,4,28),grey);t.position.set(0,.25,z);g.add(t);}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.04,12),grey);hub.rotation.x=Math.PI/2;hub.position.set(0,.25,0);g.add(hub);
  const rot=new THREE.Group();rot.position.set(0,.25,0);g.add(rot);for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.19,.06,.006),blade);b.position.set(Math.cos(i*2.094)*.1,Math.sin(i*2.094)*.1,0);b.rotation.set(.35,0,i*2.094);rot.add(b);}
  box(g,.12,.022,.03,grey,0,.5,0);const knob=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.02,10),grey);knob.rotation.x=Math.PI/2;knob.position.set(.17,.42,.07);g.add(knob);g.userData.rot=rot;return g;})();
 const FAN=phys?.prop('a1-fan',fanG,{grip:{p:[0,-.5,.02],r:[0,0,0],hang:true}});fanG.visible=false;
 // the sink's water (dirty, then clear), the dressing on your hand, a tray of food
 const water=new THREE.Mesh(new THREE.PlaneGeometry(.36,.62),new THREE.MeshStandardMaterial({color:0x5a5248,roughness:.08,metalness:.3,transparent:true,opacity:.85}));water.material.name='a1-sink-water';water.rotation.x=-Math.PI/2;water.visible=false;root.add(water);
 const dressing=box(new THREE.Group(),.075,.03,.07,mat(0xf1eee6,{roughness:1}));dressing.name='a1-dressing';dressing.castShadow=false;
 const tray=new THREE.Group();tray.name='a1-tray-food';root.add(tray);tray.visible=false;
 {const bread=mat(0xe8d2a0),cr=mat(0xd8b070);for(let i=0;i<3;i++)box(tray,.05,.007,.05,cr,-.14+i*.055,.004,.08);
  const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.12,0);sh.lineTo(0,.12);sh.closePath();const sw=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:false}),bread);sw.rotation.x=-Math.PI/2;sw.position.set(.02,.0,.04);sw.name='a1-sandwich';tray.add(sw);tray.userData.sandwich=sw;
  box(tray,.04,.08,.026,mat(0x6aa84f),.18,.04,-.02);const st=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.06,5),mat(0xf2f2ee));st.position.set(.19,.1,-.02);st.rotation.z=.3;tray.add(st);}
 // your mother's chair in the corridor (she is asleep in it)
 const hallChair=new THREE.Group();hallChair.name='a1-hall-chair';root.add(hallChair);hallChair.visible=false;
 {const m=mat(0x7a6a52,{roughness:.6,metalness:.2}),s=mat(0x6f747b,{roughness:.5,metalness:.5});box(hallChair,.4,.025,.38,m,0,.44,0);box(hallChair,.4,.26,.025,m,0,.74,.2);for(const dx of [-.19,.19])for(const dz of [-.17,.2]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.44,5),s);l.position.set(dx,.22,dz);hallChair.add(l);}}
 // ---- Room 6's things: what Reyes kept (and Sam's notebook) ---------------------------------------------------------------------------
 const ITEM={};
 function item(id,{obj,read,flat=null,grip=null}){const P2=phys?.prop('a1-ev-'+id,obj,grip?{grip}:{});obj.visible=false;ITEM[id]={id,obj,P2,read,flat,at:null,placed:-1};if(flat){flat.visible=false;root.add(flat);}return ITEM[id];}
 const planTex=paper8('plan1959'),sketchTex=tex9('sketch'),nbTex=texOf(notebookPage('names',{names:'ALEX\nJAMIE\nSAM'}));
 {const g=new THREE.Group();g.name='a1-plan-rolled';const t=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.62,12),mat(0xdfe6ea,{roughness:.9}));t.rotation.z=Math.PI/2;t.castShadow=true;g.add(t);const band=new THREE.Mesh(new THREE.TorusGeometry(.027,.003,4,12),mat(0xb0482e));band.rotation.y=Math.PI/2;band.position.x=.12;g.add(band);
  const flat=new THREE.Mesh(new THREE.PlaneGeometry(.6,.45),new THREE.MeshStandardMaterial({map:planTex||null,color:planTex?0xffffff:0xdfe6ea,roughness:.9}));flat.material.name='a1-plan-flat';flat.rotation.x=-Math.PI/2;flat.name='a1-plan-flat';
  item('plan',{obj:g,flat,grip:{p:[0,.04,.03],r:[0,0,1.5]},read:()=>pageMesh(planTex,{w:.42,h:.32,color:0xdfe6ea})});}
 const camModel=makeCameraModel();
 {const g=new THREE.Group();g.name='a1-camera-bagged';g.add(camModel.group);camModel.group.rotation.x=-Math.PI/2;const bag=new THREE.Mesh(new THREE.BoxGeometry(.17,.045,.13),new THREE.MeshStandardMaterial({color:0xe8f0f4,roughness:.2,transparent:true,opacity:.25,depthWrite:false}));bag.material.name='a1-bag';g.add(bag);
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(.06,.035),mat(0xd8c08a,{side:THREE.DoubleSide}));tag.rotation.x=-Math.PI/2;tag.position.set(.06,.024,.04);g.add(tag);
  item('camera',{obj:g,grip:{p:[0,.04,.03],r:[-1.2,0,0]},read:()=>{const q=new THREE.Group(),c=makeCameraModel();q.add(c.group);c.group.rotation.y=Math.PI;drawLCD(c);q.scale.setScalar(2.4);return q;}});}
 function drawLCD(c){const src=tex9('three')?.userData?.canvas;if(src&&c.lcdCanvas){c.lcdCanvas.g.drawImage(src,0,0,640,480);c.tex.needsUpdate=true;}}
 drawLCD(camModel);
 {const g=new THREE.Group();g.name='a1-legal-pad';box(g,.22,.012,.3,mat(0xe6dc98,{roughness:1}));const top=new THREE.Mesh(new THREE.PlaneGeometry(.21,.28),new THREE.MeshStandardMaterial({map:sketchTex||null,color:sketchTex?0xffffff:0xf4ecb0,roughness:1}));top.material.name='a1-pad-top';top.rotation.x=-Math.PI/2;top.position.y=.0065;g.add(top);
  box(g,.22,.014,.03,mat(0x8a3a2a),0,.001,-.15);item('sketch',{obj:g,grip:{p:[0,.04,.02],r:[-.3,0,0]},read:()=>pageMesh(sketchTex,{w:.24,h:.32,color:0xf4ecb0})});}
 {const g=new THREE.Group();g.name='a1-notebook';box(g,.15,.016,.2,mat(0x2a3a5a,{roughness:.7}));const lab=new THREE.Mesh(new THREE.PlaneGeometry(.07,.03),mat(0xf1eee6));lab.rotation.x=-Math.PI/2;lab.position.set(0,.0085,-.04);g.add(lab);
  item('notebook',{obj:g,grip:{p:[0,.04,.02],r:[-.3,0,0]},read:()=>pageMesh(nbTex,{w:.17,h:.225})});}
 const ORDER0=['plan','camera','notebook','sketch'];
 const SAYS={plan:'Where it was. A storm line they drew around something in 1959 and never said what.',camera:'Who it took. Sunday at the oak, the four of you. One from the trees that nobody took. And the three of you on Friday night, alive, under the court.',
  notebook:'What it took from the rest of us. Three names in a kid’s handwriting, because everybody else was forgetting them.',sketch:'What it was for. They kept children down there to hold it.'};
 const READ={plan:[N('Brandt’s 1959 sheet, out of his truck. Line Four drawn carefully round a box that nobody drew.',{time:4.2})],
  camera:[N('Alex’s camera, in a bag with a tag on it. The screen still works. The last picture: the three of you in the flash, under the court. Jamie grinning with blood on his face.',{time:6.4})],
  notebook:[N('Sam’s notebook. Your handwriting. ALEX. JAMIE. SAM.',{time:3.4})],
  sketch:[N('Reyes’s legal pad. He drew the board from memory at four in the morning, and he wrote under it: I am writing this twice.',{time:4.8})]};
 // ---- the county's list: the line, and what you write on it ----------------------------------------------------------------------------
 const LISTN={n:0,arm:null};
 const pen=new THREE.Mesh(new THREE.CylinderGeometry(.0045,.0045,.13,6),mat(0x1b2c5a,{roughness:.4}));pen.name='a1-pen';
 function letterAt(i){const m=SP.countyMesh;if(!m)return null;m.updateWorldMatrix(true,false);const u=(58+11+Math.min(i,4)*24)/640,v=(284-12)/820;return m.localToWorld(new THREE.Vector3((u-.5)*.78,(.5-v)*1,.006));}
 function writeArm(p,{toLocal:tl}){if(!LISTN.arm)return;const w=letterAt(LISTN.n);if(!w)return;w.x+=Math.sin(C.t*24)*.004;w.y+=Math.cos(C.t*19)*.003;const L=tl(w.clone());p[PP.rh]=L.x;p[PP.rh+1]=L.y+.02;p[PP.rh+2]=L.z;p[PP.re]=.7;p[PP.re+1]=-.4;p[PP.re+2]=.4;}
 function setList(n){LISTN.n=n;const m=SP.countyMesh?.material;if(!m)return;const t=n?fresh9('county',n):tex9('county',0);if(t){if(m.map&&m.map!==tex9('county',0))m.map.dispose?.();m.map=t;m.needsUpdate=true;}}
 // ---- the state each scene needs, however you came to it ---------------------------------------------------------------------------------
 function quietCast(){// Saturday afternoon: the gym through the corridor door is quieter; who has gone, has gone
  gymCast('after');for(const a of [jamieMom,alexDad,alexMom,samDad,mom,officer,vol]){a?.show(false);}}
 function dressHand(on){const h=o.self?.parts?.lhand;if(!h)return;if(on){if(dressing.parent!==h){h.add(dressing);dressing.position.set(0,.03,-.005);}}else dressing.removeFromParent();}
 const seatNurse={you:{x:19.62,z:-4.5,a:0},sam:{x:19.18,z:-6.98,a:Math.PI},beside:{x:19.78,z:-6.98,a:Math.PI}};
 function sitAt(q,{h,yaw,pitch=-.08,slow=1.2}={}){const w=W(q.x,q.z);pose(w,{y:h+.62,yaw:yaw??q.a,pitch,slow,seat:{h,y:0}});}
 // up from a seat to a place you can walk from (moved while the view is still all the seat's, so nothing jumps)
 function rise(q){if(C.pose&&!C.pose.release){const w=W(q.x,q.z),p=me();o.placePlayer({x:w.x,z:w.z,a:p.a,mode:'walk',bike:null});}unpose();}
 // ---- Scene 5: the nurse's room ---------------------------------------------------------------------------------------------------------
 function sceneQuiet(from='families'){go('a1-quiet');
  schoolWorld('shelter',{lot:false,sky:'smoke',lightName:'smoke'});setDay('AUGUST 27',14.6,'smoke');C.grief=.95;applyGrief();quietCast();if(!root.parent)scene.add(root);
  capTo('away');checkpoint('a1-quiet-room');
  // Sam on the far cot, on his side, to the wall; the paramedic at his ankle; you on the near cot
  joinFoot(sam,W(19.3,-6.6),0);pinSam({x:19.35,z:-7.3},{a:-Math.PI/2,gesture:ACT9.lie(.5,{turn:.9}),blend:.01});weep(sam,'numb',30);
  put(medic,{x:18.3,z:-6.6},headingTo(18.3,-6.6,18.6,-7.3),KNEEL);medic.lookAt=WV({x:18.6,z:-7.3},.6);
  {const w=W(seatNurse.you.x,-4.95);o.placePlayer({x:w.x,z:w.z,a:0,mode:'walk',bike:null});}sitAt(seatNurse.you,{h:.5,slow:.01});C.pose.w=1;
  // your mother asleep in the hall, her coat over her
  {const q=W(15.65,-5.05);hallChair.visible=true;hallChair.position.set(q.x,0,q.z);hallChair.rotation.y=Math.PI/2;put(mom,{x:15.55,z:-5.05},-Math.PI/2,sitG(.44,{hands:'lap',lean:-.05,lookPitch:-.55}),{noBlock:true});blanket(mom,0x3a3f4e);mood(mom,'tired');}
  tray.visible=true;{const t=W(NS.tray.x,NS.tray.z);tray.position.set(t.x,NS.tray.y,t.z);tray.userData.sandwich.visible=true;}
  C.fadeIn=0;C.fadeInDur=3;C.amb={traffic:0,insects:0,wind:.1,life:0,forest:0,tunnel:0,water:0};minds('relaxed');
  task('quiet',(function*(){
   yield* lines([{wait:2.4},N('The nurse’s room. Somebody has pulled the blinds down. It’s the middle of the afternoon, and it doesn’t feel like any time at all.',{time:5.4}),{wait:1.6},
    MED('That ankle’s sprained, not broken.',{time:2}),MED('Somebody wrapped it last night.',{time:1.8}),SM('(to the wall) Figure eight.',{time:1.8}),MED('That’s right. That’s exactly right.',{time:2.2}),{wait:1.2}]);
   rise({x:seatNurse.you.x,z:-4.95});
   objective('Wash up.','The sink, by the door.');
   offer('wash','Wash your hands',()=>WV(NS.sink,.95),{r:1.6,hold:3.4,tick:(dt,v)=>{if(!C.washing){C.washing=true;const s=W(NS.sink.x,NS.sink.z);water.visible=true;water.position.set(s.x,.884,s.z);sound('splash',WV(NS.sink,.9),{gain:.4});
      if(phys&&!phys.playerBusy())phys.playerReach({at:()=>WV({x:NS.sink.x+.12,z:NS.sink.z},.9),dur:[.45,2.6,.4],carry:false,low:false});}
     water.material.color.setHex(0x5a5248).lerp(new THREE.Color(0xaecbd6),smooth((v-.25)/.7));},release:()=>{C.washing=false;},
    fn:()=>{C.washed=true;water.material.color.setHex(0xaecbd6);later(3,()=>{water.visible=false;});}});
   yield* until(()=>C.flags.wash,240);
   yield* lines([N('The water goes grey, and then brown, and you keep washing until it runs clear. There’s dirt in the creases of your knuckles that won’t come out.',{time:5.6}),{wait:.6},
    N('There’s a cut across the back of your hand. You don’t know when that happened.',{time:3.6})]);
   // the paramedic sees it
   medic.gest(null);medic.lookAt=camera.position;{const p=me(),c=W(18.9,-5.8),dx=c.x-p.x,dz=c.z-p.z,l=Math.hypot(dx,dz)||1;medic.walk([[p.x+dx/l*.8,p.z+dz/l*.8]],{speed:1.1,then:a=>a.faceTo(me().x,me().z)});}
   yield* until(()=>!medic.walking,8);
   medic.gest(G(ACT9.offer({hand:'r'})));
   yield* lines([MED('Let me see that.',{time:1.4}),{wait:1.6,act:()=>{dressHand(true);sound('click',camera.position,{gain:.2});}},MED('Hold still. ...There. Keep it dry.',{time:2.6}),{wait:.6}]);
   medic.gest(null);medic.lookAt=null;{const a=W(NS.door.x,NS.door.z),b=W(NS.hall.x,NS.hall.z+1.5);medic.walk([[a.x,a.z],[b.x,b.z]],{speed:1.2,then:q=>q.show(false)});}
   // things you could do, or not: eat; put his cap down somewhere you can see it
   objective('','');
   offer('eat','Eat something',()=>WV(NS.tray,.82),{r:1.8,look:true,size:.2,cone:.12,fn:()=>{tray.userData.sandwich.visible=false;sound('click',WV(NS.tray,.8),{gain:.15});
    say([N('Crackers, and half a sandwich somebody cut corner to corner. You take a bite to be polite. Then you’ve eaten all of it, and you’re still hungry. You didn’t know.',{time:6})]);}});
   if(C.keep.cap==='you')offer('cap-safe','Put his cap where you can see it',()=>WV(NS.sill,1.22),{r:1.9,look:true,size:.22,cone:.14,fn:()=>{const s=W(NS.sill.x,NS.sill.z);capTo('place',{x:s.x,y:NS.sill.y+.005,z:s.z,ry:.4});
    say([N('You put it on the windowsill, where you can see it from the cot.',{time:3.2})]);}});
   // Sam's father, with the fan from the office
   yield* wait(14);yield* quiet(20);
   {const h=W(NS.hall.x,NS.hall.z-1.2),d=W(NS.door.x-.3,NS.door.z),i=W(19.9,-5.45);samDad.show(true);samDad.place(h.x,h.z,Math.PI/2);samDad.gest(null);mood(samDad,'tired');FAN.holdBy(samDad.person,'r');
    samDad.walk([[d.x,d.z],[i.x,i.z]],{speed:1.05,then:a=>{a.faceTo(W(NS.desk.x,NS.desk.z).x,W(NS.desk.x,NS.desk.z).z);C.flags.dadAtDesk=true;}});}
   yield* until(()=>C.flags.dadAtDesk,20);
   {const dq=W(NS.desk.x,NS.desk.z-.1);FAN.place(new THREE.Vector3(dq.x,NS.desk.y,dq.z),new THREE.Euler(0,-Math.PI/2+.25,0));sound('click',V3({x:dq.x,y:1,z:dq.z}),{gain:.4});C.fanOn=true;}
   samDad.lookAt=headOf(sam);
   yield* lines([{wait:.8},N('Sam’s dad. He has a box fan from the office. He puts it on the desk and turns it on, and points it at the cot.',{time:4.6}),SD('He can’t sleep without one. Never could.',{time:2.6}),
    SM('(to the wall) Dad.',{time:1.2}),SD('Humor me.',{time:1.2}),{wait:1,act:()=>{samDad.lookAt=camera.position;}},SD('Your mom’s asleep in the hall. First time since Sunday. Don’t wake her.',{time:3.4}),{wait:.6}]);
   samDad.lookAt=null;{const a=W(NS.door.x,NS.door.z),b=W(NS.hall.x,NS.hall.z+2.4);samDad.walk([[a.x,a.z],[b.x,b.z]],{speed:1,then:q=>q.show(false)});}
   // Sam sits up
   yield* wait(4);pinSam({x:seatNurse.sam.x,z:seatNurse.sam.z},{a:seatNurse.sam.a,gesture:ACT.seat(.5,{hands:'knees',lean:.28,lookPitch:-.3}),blend:1.4});weep(sam,'tired',20);
   yield* wait(2);
   objective('Sam.','');
   offer('beside','Sit beside him',()=>headOf(sam),{r:3.4,fn:()=>{sitAt(seatNurse.beside,{h:.5,yaw:Math.PI-.5});C.flags.besideSam=true;}});
   offer('sit-cot','Sit on your cot',()=>WV(seatNurse.you,.62),{r:2.6,fn:()=>{unoffer('beside');sitAt(seatNurse.you,{h:.5});}});
   yield* until(()=>C.flags.beside||C.flags['sit-cot'],22);unoffer('beside');unoffer('sit-cot');if(!posed())sitAt(seatNurse.you,{h:.5});
   yield* wait(1.6);
   yield* lines([SM('The arm on the hatch. The counterweight arm.',{time:2.4,face:'numb'}),{wait:.8},SM('It was snapped off at the pin. That’s a shear pin. It’s supposed to break before the hinge does. That’s what it’s for.',{time:5}),
    SM('So somebody took the weight off it years ago, and it rusted, and nobody ever— if the arm had been on it, the lid would have stayed up by itself. It would have—',{time:6,face:'frustrated'}),{wait:1.2},
    N('He stops. He holds his hands up in front of him like the rest of it is in them.',{time:3.6}),{wait:1.4},SM('I don’t know what I was saying.',{time:2,face:'numb'}),{wait:2.4},
    SM('I had batteries for the batteries.',{time:2,face:'frustrated'}),SM('I had a list. I wrote down which way the water goes. I wrote it all down so nothing would happen to anybody.',{time:5,face:'frustrated'}),{wait:1.6},
    SM('And he let go of the chain because I yelled at him to.',{time:3,face:'crying'}),{wait:1.6},SM('I said let go. Let go and climb. He did what I said.',{time:3.4,face:'sobbing'})]);
   cry(.55,12);
   const ch=yield* choosing([{id:'caught',label:'“The chain was caught. He couldn’t hold it.”'},{id:'out',label:'“You were trying to get him out.”'},{id:'hand',label:'Put your hand on his back'},{id:'nothing',label:'Say nothing'}],{timeout:16,fallback:'nothing'});
   C.keep.told.samChain=ch;keep('told',C.keep.told);
   if(ch==='caught')yield* lines([Y('The chain was caught. He couldn’t have held it anyway.',{time:2.8}),{wait:1.4},SM('I know.',{time:1.2}),SM('I know that. I know that and it doesn’t do anything.',{time:3,face:'crying'})]);
   else if(ch==='out')yield* lines([Y('You were trying to get him out. We all were.',{time:2.6}),{wait:1.2},SM('...Yeah.',{time:1}),SM('We got them out. We got all three of them out.',{time:2.8,face:'crying'}),{wait:1},SM('And then two hours. It was two hours.',{time:2.6,face:'sobbing'})]);
   else if(ch==='hand'){if(phys&&!phys.playerBusy()){const g=sam.person.group;phys.playerReach({at:()=>{const v=new THREE.Vector3(0,.95,.12);g.updateMatrixWorld(true);return v.applyMatrix4(g.matrixWorld);},dur:[.6,4,.6],carry:false,low:false});}
    yield* lines([{wait:1},N('You put your hand flat on his back. He’s shaking. After a while he isn’t, as much.',{time:4.4}),{wait:2}]);}
   else yield* lines([{wait:1.4},N('You don’t say anything. You stay where you are. You think that’s what he wants. You’re not sure.',{time:4.6}),{wait:1.6}]);
   yield* lines([{wait:2.4},SM('My mom asked if I want to go to my aunt’s tonight.',{time:2.6,face:'tired'}),SM('I said I want to sleep here.',{time:1.8}),{wait:1},SM('Is that weird? Wanting to sleep in the nurse’s room?',{time:2.8})]);
   const c2=yield* choosing([{id:'notweird',label:'“It’s not weird.”'},{id:'metoo',label:'“I want to sleep here too.”'}],{timeout:12,fallback:'notweird'});
   yield* lines([c2==='metoo'?Y('I want to sleep here too.',{time:1.8}):Y('It’s not weird.',{time:1.4}),{wait:1},SM('Okay.',{time:1})]);
   // lying down; the fan; the gym, far off
   pinSam({x:19.35,z:-7.3},{a:-Math.PI/2,gesture:ACT9.lie(.5,{turn:-.5}),blend:1.6});weep(sam,'tired',60);
   objective('Rest.','');offer('lie','Lie down',()=>WV(seatNurse.you,.6),{r:3.4,inPose:true,fn:()=>{}});
   yield* until(()=>C.flags.lie,20);unoffer('lie');
   C.fadeOut=0;C.fadeOutDur=4;let down=false;C.after=()=>{down=true;o.fade(1);};yield* until(()=>down,6);
   yield* lines([N('The fan turns. Somebody in the gym laughs at something, and then stops, like they caught themselves.',{time:4.6}),{wait:1},N('You don’t mean to sleep.',{time:2.4}),{wait:2}]);
   capTo('away');toNext('a1-record');})());}
 // between days: black, then the next scene from its own start (as Continue would put you there)
 // (handled in update(), never from inside a task or a timer: the jump empties the lists those are run from)
 function toNext(section){o.fade(1);C.fadeOut=-1;C.after=null;C.nextScene=section;}
 // ---- Scene 6: Reyes needs a record ---------------------------------------------------------------------------------------------------------
 function sundayGym(){gymCast('after');for(const a of [jamieMom,alexDad,alexMom,samDad,mom,officer,vol,mrsH,lily,mrH]){a?.show(false);}}
 function sceneRecord(from='jump'){go('a1-record');
  schoolWorld('shelter',{lot:false,sky:'smoke',lightName:'smoke'});setDay('AUGUST 28',10.15,'smoke');C.grief=.85;applyGrief();sundayGym();if(!root.parent)scene.add(root);dressHand(true);capTo('away');checkpoint('a1-record');
  // the evidence, on the teacher's desk, in a box with its flaps open; Reyes at the table writing; Sam's dad by the board
  const DESK=[{x:22.45,z:-1},{x:22.9,z:-.92},{x:23.32,z:-1.05},{x:23.7,z:-.95}];
  const have=C.keep.notebook==='you';['plan','camera','sketch'].forEach((id,i)=>{const I=ITEM[id];I.placed=-1;I.at=DESK[i];I.P2?.place(WV(DESK[i],.77+(id==='plan'?.026:.0)),new THREE.Euler(0,.3*(i-1),0));});
  {const I=ITEM.notebook;I.placed=-1;I.at=null;I.P2?.hide();}
  C.ev={slots:[],order:[],carrying:null};
  put(reyes,{x:21,z:.75},Math.PI,sitG(.4,{hands:'table',lean:.2,lookPitch:-.35}),{noBlock:true});mood(reyes,'tired');
  put(samDad,{x:17.6,z:-1.25},headingTo(17.6,-1.25,20.6,2),'fold');mood(samDad,'tired');
  joinFoot(sam,W(19.6,4.3),0);pinSam({x:19.6,z:3.56},{a:0,gesture:ACT.seat(.4,{hands:'table',lean:.2,lookPitch:-.3}),blend:.01});weep(sam,'tired',30);
  put(mom,{x:RS.hall.x,z:RS.hall.z+.4},Math.PI/2,null);
  {const w=W(RS.hall.x,RS.hall.z-.2);o.placePlayer({x:w.x,z:w.z,a:Math.PI/2,mode:'walk',bike:null});}
  C.fadeIn=0;C.fadeInDur=2.6;minds('relaxed');
  task('record',(function*(){
   yield* lines([{wait:1.6},N('Sunday.',{time:1.6}),{wait:.6},N('Room 6. Somebody’s classroom. The chairs are the small kind, and there are cubbies with nobody’s name on them yet.',{time:4.8})]);
   objective('Room 6.','Reyes is waiting. Your mom is with you.');
   {const a=W(RS.in.x,RS.in.z),b=W(18.1,2.1);mom.walk([[a.x,a.z],[b.x,b.z]],{speed:1,then:q=>{const w=W(18.5,2.1);q.place(w.x,w.z,Math.PI/2);q.gest(sitG(.4,{hands:'knees'}));q.noBlock=true;}});}
   yield* until(()=>D(me(),W(RS.in.x,RS.in.z))<1.4||C.pt>60,60);
   reyes.lookAt=camera.position;
   yield* lines([R('Hey. Come on in.',{time:1.4}),R('Sit anywhere. Not that one. That one’s got three legs.',{time:2.6}),{wait:.4}]);
   offer('sit','Sit down',()=>WV(RS.you,.7),{r:1.6});
   yield* until(()=>C.flags.sit,40);sitAt(RS.you,{h:.4,yaw:0});
   yield* lines([{wait:1},R('This isn’t an interview. Nobody’s in trouble. I need to write down what happened while it’s still—',{time:4.4}),{wait:.6},R('While it’s still today.',{time:1.8}),
    R('I’ll go first. What I saw. Then you tell me what you saw, and I write it right next to mine. You don’t have to remember all of it. Nobody does.',{time:6}),{wait:1}]);
   reyes.lookAt=null;
   yield* lines([R('Thursday, August twenty-fifth. The Mill Creek works. I saw Sam in the gallery. And I saw Sam at the gate, at the same time, forty feet away. One of them was standing in the water and it wasn’t touching him.',{time:8}),{wait:.8},
    R('Friday night, late. Under Old Mill Court. A board on a wall with children’s initials on it, and dates going back to 1958. Three rows with no initials. Three needles down.',{time:7}),{wait:1.4},
    R('Saturday, about five in the morning. 1026 Oak Hollow Drive. Jamie.',{time:3.4}),R('I attempted CPR for eleven minutes. I stopped.',{time:3}),{wait:2.4},
    R('About six twenty. The oak at the end of the street. Alex.',{time:3}),{wait:1.6},R('That’s mine. I signed it. Every page.',{time:2.4}),{wait:1.2},
    SD('They’re going to read that and think you lost your mind.',{time:2.8}),R('Probably.',{time:1}),{wait:.8},R('I’m not writing it so they’ll believe it. I’m writing it so it’s written.',{time:3.4})]);
   // what he kept: you lay it out
   reyes.lookAt=camera.position;
   yield* lines([{wait:1},R('I kept some things. I want them in an order that makes sense to somebody who wasn’t there.',{time:4}),R('Will you lay them out for me? On the table. However it went, for you.',{time:3.4})]);
   rise({x:RS.you.x,z:4.15});objective('Lay them out.','On the teacher’s desk. One at a time, onto the table.');
   if(C.keep.notebook==='sam'){const I=ITEM.notebook;I.at={x:19.62,z:2.75};I.P2?.place(WV(I.at,.73),new THREE.Euler(0,.2,0));say([SM('(sliding it over) And this.',{time:1.8,face:'tired'})]);}
   else{const I=ITEM.notebook;I.at='pocket';}
   offerItems();
   yield* until(()=>C.ev.order.length>=4,600);
   unoffer('slot');
   // he reads them back, in your order
   yield* lines([{wait:1.2},R('Okay.',{time:1}),{wait:.8},...C.ev.order.map(id=>R(SAYS[id],{time:Math.max(3,SAYS[id].length*.055)})),{wait:1},
    C.ev.order.join()===ORDER0.join()?R('That’s the order I’d have put them in.',{time:2.4}):R('In that order it makes sense. In any order it’s true.',{time:3})]);
   keep('camera','reyes');C.flags.cameraSeen=true;
   yield* lines([R('Alex’s camera came out with him. It was in his jacket pocket. His folks said I can hold onto it till Wednesday to copy the card. Then it goes home.',{time:6}),
    ...(C.keep.notebook==='sam'?[R('I’ll photocopy the notebook. The book goes back to whose book it is.',{time:3})]:[R('I’ll photocopy the notebook. Then it goes back in your pocket. You’re the one who wrote it.',{time:3.6})])]);
   // and yours
   objective('Sit down.','Your chair.');offer('sit2','Sit down',()=>WV(RS.you,.7),{r:1.8});
   yield* until(()=>C.flags.sit2,40);unoffer('sit2');objective('','');sitAt(RS.you,{h:.4,yaw:0});
   yield* lines([{wait:.8},R('Your turn. Anything you want written down. Anything I didn’t say.',{time:3.4})]);
   const said=[],OPTS=[{id:'biscuit',label:'“Jamie made up a dog so Lily would come out.”',say:'Jamie made up a dog so Lily would come out. He said his name was Biscuit. He doesn’t have a dog.',reply:'Biscuit.'},
    {id:'chain',label:'“Alex held the chain so we could climb.”',say:'Alex held the chain so we could all climb. He said he was the light one.',reply:'He held the chain.'},
    {id:'grille',label:'“Sam held the grille shut while we got Jamie out.”',say:'Sam held the grille shut while we got Jamie’s door open. It hit the grille and he didn’t let go.',reply:'Sam held the grille.'},
    {id:'done',label:'“That’s all.”'}];
   for(let n=0;n<3;n++){const opts=OPTS.filter(q=>!said.includes(q.id));const c=yield* choosing(opts,{timeout:20,fallback:'done'});if(c==='done')break;const q=OPTS.find(x=>x.id===c);said.push(c);
    yield* lines([Y(q.say,{time:Math.max(2.4,q.say.length*.055)}),{wait:.6,act:()=>{sound('c7Pencil',WV({x:21,z:1.4},.76),{gain:.6});}},R(q.reply,{time:1.4}),N('He writes it down. Every word.',{time:2.2}),{wait:.4},R('What else?',{time:1})]);}
   C.keep.told.record=said;keep('told',C.keep.told);
   yield* lines([{wait:1},R('That’s it. That’s all I need today.',{time:2.2}),{wait:1},
    R('Somebody from the state is coming Tuesday. They’ll write infrastructure, and gas, because that’s what their form has boxes for. That’s not a lie. The ground did fall in. The gas did burn. It’s just not all of it.',{time:8.4}),
    R('So I’m keeping all of it. Two copies. One goes in the file. One goes home with me.',{time:3.6}),{wait:.8},MO('And then what?',{time:1.2}),{wait:1},R('Then nobody gets to say it didn’t happen.',{time:2.6}),{wait:2}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-names');})());}
 // the things on the desk: look at one, F; in your hand, its own short look; then onto the next place on the table
 function offerItems(){for(const id of ORDER0){const I=ITEM[id];if(I.placed>=0)continue;
   if(I.at==='pocket')offer('ev-'+id,'Take out Sam’s notebook',()=>new THREE.Vector3(camera.position.x,camera.position.y-.45,camera.position.z),{r:9,once:true,when:()=>!C.ev.carrying,fn:()=>pickItem(id)});
   else offer('ev-'+id,id==='plan'?'Take the 1959 plan':id==='camera'?'Take Alex’s camera':id==='sketch'?'Take Reyes’s drawing':'Take Sam’s notebook',()=>WV(I.at,.8),{r:2.2,look:true,size:.16,cone:.14,once:true,when:()=>!C.ev.carrying,fn:()=>pickItem(id)});}}
 function pickItem(id){const I=ITEM[id];C.ev.carrying=id;for(const q of ORDER0)if(q!==id&&ITEM[q].placed<0)unoffer('ev-'+q);
  const take=()=>{I.P2?.holdBy(o.self,'r');phys?.playerHold('r',I.P2,{at:[.17,1.0,-.34]});sound('click',camera.position,{gain:.15});
   task('read-'+id,(function*(){yield* holding(I.read(),READ[id],{dist:.42,kind:'ev-'+id,min:1.6});offerSlot();})());};
  if(I.at==='pocket'||!phys){take();return;}
  phys.playerReach({at:()=>WV(I.at,.8),dur:[.45,.12,.4],onContact:take,carry:true});}
 const slotAt=n=>RS.slots[n];
 function offerSlot(){const n=C.ev.order.length;const q=slotAt(n);objective('Lay them out.',`On the table. ${n?'Next to the last one.':'Start at the end by the window.'}`);
  offer('slot','Put it on the table',()=>WV(q,.78),{r:1.7,once:true,fn:()=>{const id=C.ev.carrying;if(!id)return;const I=ITEM[id];
   const done=()=>{phys?.playerHold('r',null);if(I.flat){I.P2?.hide();I.flat.visible=true;const w=WV(q,q.y+.004);I.flat.position.copy(w);I.flat.rotation.set(-Math.PI/2,0,(n%2?-.06:.05));}
    else I.P2?.place(WV(q,q.y+(id==='plan'?.026:.0)),new THREE.Euler(0,(n%2?-.08:.06),0));I.placed=n;C.ev.order.push(id);C.ev.carrying=null;sound('click',WV(q,.76),{gain:.2});
    say([R(id==='plan'?'Okay. That’s first?':id==='camera'?'Mm-hm.':id==='notebook'?'Yeah.':'Okay.',{time:1.2})]);if(C.ev.order.length<4){offerItems();objective('Lay them out.','The next one.');}else objective('','');};
   if(phys)phys.playerReach({at:()=>WV(q,.78),dur:[.45,.1,.4],onContact:done,carry:false});else done();}});}
 // ---- Scene 7: the names that changed -----------------------------------------------------------------------------------------------------
 function mondayGym(){const S2=SCH;
  // fewer of them: those who have nowhere else yet
  put(mrsH,S2.cotSeat(2,1),Math.PI,sitG(S2.COT_H,{hands:'knees'}),{noBlock:true});put(mrH,S2.cotSeat(1,1),Math.PI,sitG(S2.COT_H,{hands:'knees',lean:.25}),{noBlock:true});put(lily,S2.cotSeat(3,1),Math.PI,sitG(S2.COT_H,{hands:'knees'}),{noBlock:true});
  put(pruitt,S2.cotSeat(0,1),Math.PI,sitG(S2.COT_H,{hands:'lap'}),{noBlock:true});put(vol1,S2.cotSeat(6,1),Math.PI,sitG(S2.COT_H,{hands:'face',lean:.3}),{noBlock:true});put(delaney,S2.cotSeat(8,1),Math.PI,sitG(S2.COT_H,{hands:'knees'}),{noBlock:true});
  put(okafor,{x:7.6,z:6.25},Math.PI,G(ACT9.cup()));put(davis,{x:-9,z:-6.6},Math.PI/2,'phone');put(huang,SP.tvSeats?.[0]||{x:9.6,z:4.6},Math.PI/2,sitG(.44,{hands:'knees'}),{noBlock:true});
  put(samDad,S2.cotSeat(17,1),Math.PI,sitG(S2.COT_H,{hands:'knees',lean:.2}),{noBlock:true});put(samMom,{x:5.6,z:-.9},0,'fold');
  put(vol,{x:4,z:6.9},Math.PI,G(ACT9.clipboard()));vol.lookAt=WV(SP.county,1.4);
  put(mom,S2.cotSeat(16,1),Math.PI,sitG(S2.COT_H,{hands:'knees',lean:.3}),{noBlock:true});mood(mom,'tired');for(const a of [mrsH,mrH,samDad,samMom])mood(a,'tired');}
 function sceneNames(from='jump'){go('a1-names');
  schoolWorld('thin',{lot:false,sky:'smoke',lightName:'smoke'});setDay('AUGUST 29',9.3,'smoke');C.grief=.85;applyGrief();mondayGym();if(!root.parent)scene.add(root);dressHand(true);capTo('away');checkpoint('a1-names');setList(0);
  joinFoot(sam,W(3.6,5.6),Math.PI);stand(sam,W(3.4,5.7),{look:()=>WV(SP.county,1.45),face:Math.PI,max:1.2});weep(sam,'tired',30);
  {const w=W(2.2,1.2);o.placePlayer({x:w.x,z:w.z,a:Math.PI,mode:'walk',bike:null});}
  C.fadeIn=0;C.fadeInDur=2.6;minds('relaxed');
  task('names',(function*(){
   yield* lines([{wait:1.6},N('Monday.',{time:1.6}),{wait:.6},N('Half the cots are folded. The ones that are left belong to people who have nowhere else to be yet.',{time:4.4}),{wait:.6},
    MO('(packing a bag) They’re letting people below Summerfield go home Wednesday. We’re below Summerfield.',{time:4}),MO('They put lists up this morning. By the doors. The county’s.',{time:2.8}),MO('You don’t have to look at them.',{time:2})]);
   objective('The county’s list.','By the doors. Sam is there.');
   offer('list','Read the list',()=>WV(SP.county,1.45),{r:2.4,look:true,size:.5,cone:.2});
   yield* until(()=>C.flags.list,240);
   // close: standing at it
   {const c=W(SP.county.x,SP.county.z),p=W(SP.county.x,SP.county.z-.62);pose({x:p.x,z:p.z},{y:1.42,yaw:headingTo(p.x,p.z,c.x,c.z),pitch:.02,slow:1,stand:true});}
   yield* lines([{wait:1.2},N('CONFIRMED DECEASED. PRELIMINARY.',{time:2.6}),{wait:.8},N('ALEX. 12. Oak Hollow Drive.',{time:2.6}),{wait:1.4},
    N('And under it, a line with an age and a street on it. 12. Oak Hollow Drive. Where the name goes, nothing.',{time:4.8}),{wait:1.6},N('You know whose line it is.',{time:2.4}),{wait:1.8},
    N('You know his face. His cap. The way he laughs with his whole body, like it surprised him too.',{time:4.6}),{wait:1},
    N('And the word for him isn’t there. Like reaching for a step that isn’t there.',{time:4.2,act:()=>{cry(.45,10);}})]);
   o.ui?.reflect?.('I thought I remembered everyone.',5);mark('memory: I thought I remembered everyone.');
   yield* wait(4.6);
   // the names, in your handwriting
   if(C.keep.notebook==='sam'){stand(sam,()=>{const p=me();return {x:p.x-Math.cos(p.a)*.7+Math.sin(p.a)*.35,z:p.z-Math.sin(p.a)*.7-Math.cos(p.a)*.35};},{look:()=>camera.position,max:1});
    yield* until(()=>D(me(),{x:sam.px,z:sam.pz})<1.4,8);yield* lines([SM('Here.',{time:1,face:'tired'}),SM('You wrote it. Read it.',{time:1.6})]);
    offer('notebook','Take Sam’s notebook',()=>headOf(sam).add(new THREE.Vector3(0,-.55,0)),{r:2.4,inPose:true});}
   else{yield* lines([N('Sam’s notebook is in your back pocket. It’s been there since Friday.',{time:3.4})]);
    offer('notebook','Take out Sam’s notebook',()=>new THREE.Vector3(camera.position.x,camera.position.y-.5,camera.position.z),{r:9,inPose:true});}
   yield* until(()=>C.flags.notebook,60);
   yield* holding(ITEM.notebook.read(),[N('Your handwriting. Friday night, at Sam’s desk, so you wouldn’t lose them.',{time:3.6}),{wait:.6},N('ALEX.',{time:1.4}),N('JAMIE.',{time:1.8}),N('SAM.',{time:1.4}),{wait:1.2},N('Jamie.',{time:1.6}),{wait:.8},N('There he is.',{time:2})],{dist:.4,kind:'names',min:3});
   // a pen on a string
   objective('Write his name.','On the empty line. The pen on the string. Hold F.');
   offer('write','Write his name',()=>letterAt(0)||WV(SP.county,1.57),{r:2.6,inPose:true,hold:3.4,
    tick:(dt,v)=>{if(!LISTN.arm){LISTN.arm=true;SP.penMesh&&(SP.penMesh.visible=false);o.self?.parts?.rhand?.add(pen);pen.position.set(0,.06,.02);pen.rotation.set(.4,0,0);if(phys&&!phys.ME.extra.includes(writeArm))phys.ME.extra.push(writeArm);}
     const n=Math.min(5,1+Math.floor(v*5));if(n>LISTN.n){setList(n);sound('c7Pencil',letterAt(n-1),{gain:.5});}},
    release:()=>{},fn:()=>{setList(5);keep('wrote',true);}});
   yield* until(()=>C.flags.write,120);
   later(1.2,()=>{LISTN.arm=false;const i=phys?.ME.extra.indexOf(writeArm);if(i>=0)phys.ME.extra.splice(i,1);pen.removeFromParent();SP.penMesh&&(SP.penMesh.visible=true);});
   vol.lookAt=WV(SP.county,1.5);feel(vol,'surprised',4);
   yield* lines([{wait:1.4},VOL('Hon— you can’t write on the—',{time:1.8}),{wait:1.6,act:()=>feel(vol,'tearful',12)},VOL('...Jamie.',{time:1.4}),VOL('Jamie. Of course it’s— why couldn’t I—',{time:2.6}),{wait:1},
    N('She copies it onto her clipboard. Then onto the county’s copy. Then she writes it again, slowly, on the back of her hand.',{time:5.2}),{wait:1}]);
   unpose();
   stand(sam,()=>{const p=me();return {x:p.x+Math.cos(p.a)*.75,z:p.z+Math.sin(p.a)*.75};},{look:()=>WV(SP.county,1.45),max:1});
   yield* lines([{wait:1},SM('It isn’t doing it now. It can’t. It’s shut away.',{time:2.6,face:'tired'}),SM('It’s just that what it did is still done.',{time:2.4}),{wait:.8},
    SM('Like a burn. It doesn’t keep burning. It just doesn’t un-burn.',{time:3.4}),{wait:2.2},N('It’s his name again.',{time:2.2}),{wait:.8},N('That doesn’t give him back. It’s only true.',{time:3.2}),{wait:2.4}]);
   C.fadeOut=0;C.fadeOutDur=3.6;C.after=()=>toNext('a1-return');})());}
 // ---- every frame ------------------------------------------------------------------------------------------------------------------------
 function update(dt){if(C.nextScene){const s2=C.nextScene;C.nextScene=null;H.jumpTo(s2);return;}if(C.fanOn&&fanG.visible)fanG.userData.rot.rotation.z-=dt*14;}
 function sources(out){if(C.fanOn&&fanG.visible){const p=fanG.position;out.push({id:'a1-fan',kind:'fan',pos:new THREE.Vector3(p.x,p.y+.25,p.z),level:.8});}
  if(C.washing){const s=W(NS.sink.x,NS.sink.z);out.push({id:'a1-sink',kind:'water',pos:new THREE.Vector3(s.x,.95,s.z),level:.4});}}
 function reset(){root.removeFromParent();water.visible=false;tray.visible=false;hallChair.visible=false;dressHand(false);FAN?.hide();for(const I of Object.values(ITEM)){I.P2?.hide();if(I.flat)I.flat.visible=false;I.placed=-1;}
  LISTN.arm=false;pen.removeFromParent();if(SP.penMesh)SP.penMesh.visible=true;const i=phys?.ME.extra.indexOf(writeArm);if(i>=0)phys.ME.extra.splice(i,1);if(LISTN.n)setList(0);LISTN.n=0;}
 const SCENE={'a1-quiet-room':()=>sceneQuiet('jump'),'a1-record':()=>sceneRecord('jump'),'a1-names':()=>sceneNames('jump')};
 return {SCENE,sceneQuiet,sceneRecord,sceneNames,update,sources,reset,ITEM,fanG,toNext,root};
}
