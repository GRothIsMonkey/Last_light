// Aftermath I, Act III (2): the two remembrances, and Sam.
//
// 11a. Saturday, September 3, at dusk: candles on Jamie's lawn. Not a service: people in the grass, the porch light on, the stories
//      they tell each other (most of them funny); his picture on an easel; notes on the steps; a table of cards. His mother asks you
//      for something about him she doesn't know. You can stand with Sam at the curb. You go home when you are ready.
// 11b. Tuesday, September 6: the school gym again, chairs in rows. Alex's father says a little. Alex's pictures on boards along both
//      walls, two sets. In one of them he is there after all. A box for cards by the doors.
// 12.  Saturday, September 17, your driveway: your chain keeps coming off; Sam, who can fix it; the curb; his gum; what he is angry
//      about; the streetlights coming on, and what the Tour's rule four says to do then.
// No one appears who is not alive. Nobody says anything for the dead.
import * as THREE from './three.module.js';
import {headingTo,wrap} from './people.js';
import {heading} from './route.js';
import {ACT} from './chapter8-acting.js';
import {ACT9,G,asC} from './aftermath1-acting.js';
import {tex9,PRINTS9} from './aftermath1-props.js';
import {homeOf} from './chapter6-home.js';
import {CAST} from './cast.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';
import {createBike,poseBike} from './rig.js';

export function memorialActs(H){
 const {o,k,C,S,phys,comp,brain,sam,cast,EVERYONE,sound,gy,light,lightsOn,checkpoint,later,mark,say,SM,Y,N,V,R,JM,AD,AM,SD,SMO,MO,BR,person,
  task,wait,until,lines,quiet,offer,unoffer,V3,pose,unpose,posed,holding,pageMesh,choosing,me,go,objective,busy,nav,camera,scene,world,
  stand,joinFoot,leave,minds,setDay,keep,cry,weep,feel,mood,applyGrief,headOf,pinSam,PIN,capTo,CAP,MRSH,
  ST9,SP,putW,lead,placeMe,streetWorld,JH,JW,JP,LILY,toNext,SCH,W:SW,schoolWorld,blanket,splint}=H;
 const {reyes,samDad,samMom,jamieMom,alexDad,alexMom,mrsH,mrH,lily,pruitt,davis,mom,vol,medic,brandt,extras}=cast;
 const [vol1,vol2,vol3,vol4,vol5,huang,delaney,pruitt3,okafor]=extras;
 const DAVIS=person('MR. DAVIS',davis),PRUITT=person('MRS. PRUITT',pruitt),MRH=person('MR. HENDERSON',mrH);
 const D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const root=new THREE.Group();root.name='a1-memorials';
 const JA=a=>a-JH.worldRot;
 // ---- 11a: the lawn ---------------------------------------------------------------------------------------------------------------------
 const lawn=new THREE.Group();lawn.name='a1-jamie-lawn';root.add(lawn);lawn.visible=false;
 const jarM=new THREE.MeshStandardMaterial({color:0xfff2d8,emissive:0xffb060,emissiveIntensity:.95,roughness:.3,transparent:true,opacity:.86});jarM.name='a1-candle-jar';
 const flameTex=(()=>{try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=32;c.height=64;const r=g.createRadialGradient(16,40,1,16,36,26);r.addColorStop(0,'rgba(255,250,220,1)');r.addColorStop(.35,'rgba(255,190,90,.9)');r.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=r;g.fillRect(0,0,32,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})();
 const flameM=new THREE.SpriteMaterial({map:flameTex,color:0xffd090,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});flameM.name='a1-candle-flame';
 const FLAMES=[];
 function candle(g,q,{s=1}={}){const j=new THREE.Mesh(new THREE.CylinderGeometry(.034*s,.03*s,.075*s,8),jarM);j.position.set(q.x,q.y+.037*s,q.z);g.add(j);const f=new THREE.Sprite(flameM);f.position.set(q.x,q.y+.09*s,q.z);f.scale.set(.026*s,.05*s,1);g.add(f);FLAMES.push({f,s,ph:Math.random()*9});}
 {let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  // a loose crescent in front of the steps, a line down each side of the walk, a few further out in the grass
  for(let i=0;i<34;i++){const a=-1.25+rnd()*2.5,r=1.4+rnd()*1.4,x=JH.doorX+Math.sin(a)*r,z=6.9+Math.cos(a)*r*.7;const q=JW(x,z);q.y=gy(q.x,q.z);candle(lawn,q,{s:.9+rnd()*.35});}
  for(let i=0;i<18;i++){const sd=i%2?1:-1,z=8.6+Math.floor(i/2)*.55;const q=JW(JH.doorX+sd*(.55+rnd()*.12),z);q.y=gy(q.x,q.z);candle(lawn,q,{s:.9});}
  for(let i=0;i<10;i++){const q=JW(JH.doorX-4+rnd()*8,9.5+rnd()*2.6);q.y=gy(q.x,q.z);candle(lawn,q,{s:1.1});}}
 // his picture (the one from her wallet, enlarged) on a small easel at the foot of the steps; flowers; the notes on the steps
 const wood=new THREE.MeshStandardMaterial({color:0x7a5a3c,roughness:.7});
 const EASEL=JW(JH.doorX+1.15,7.35);
 {const e=new THREE.Group();e.position.set(EASEL.x,gy(EASEL.x,EASEL.z),EASEL.z);e.rotation.y=-JA(Math.PI)+.25;lawn.add(e);
  for(const dx of [-.22,.22]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.3,6),wood);l.position.set(dx*.7,.62,.05);l.rotation.set(-.12,0,-dx*.25);e.add(l);}
  const back=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.3,6),wood);back.position.set(0,.6,-.22);back.rotation.x=.3;e.add(back);
  const fr=new THREE.Mesh(new THREE.BoxGeometry(.46,.56,.025),new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.5}));fr.position.set(0,.98,.08);fr.rotation.x=-.1;e.add(fr);
  const pic=pageMesh(tex9('portrait','jamie'),{w:.4,h:.5,color:0x6f93b8});pic.position.set(0,.98,.095);pic.rotation.x=-.1;e.add(pic);
  for(let i=0;i<14;i++){const c=[0xf3efe4,0xe8c44a,0xd86a5a,0xf0b8c8][i%4];const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.045,0),new THREE.MeshStandardMaterial({color:c,roughness:1}));f.position.set(-.3+(i%7)*.1,.04+Math.floor(i/7)*.06,.28+(i%3)*.05);e.add(f);}}
 const NOTES=[['You still owe me','two dollars.','— S.'],['Thank you for my','groceries. All of them.','— E. Pruitt'],['Jamie — funniest kid','in Room 12.','— Marcus'],['We will never','forget. — the','Hendersons'],['JAMIE','(a dog, in crayon)','']];
 const noteMeshes=NOTES.map((ls,i)=>{const m=pageMesh(tex9('card',ls),{w:.17,h:.106});const q=JW(JH.doorX-.7+i*.34,6.55+(i%2)*.12,.36+.004*i);m.position.set(q.x,q.y,q.z);m.rotation.order='YXZ';m.rotation.set(-Math.PI/2+.04,(-JA(Math.PI))+(i-2)*.1,0);lawn.add(m);return m;});
 // a card table by the sidewalk: blank cards, markers
 const TABLE=JW(JH.doorX-3.4,11.8);
 {const t=new THREE.Group();t.position.set(TABLE.x,gy(TABLE.x,TABLE.z),TABLE.z);t.rotation.y=-JA(Math.PI);lawn.add(t);const top=new THREE.Mesh(new THREE.BoxGeometry(1.2,.03,.6),new THREE.MeshStandardMaterial({color:0x5a5650,roughness:.6}));top.position.y=.72;t.add(top);
  for(const [x,z] of [[-.55,-.25],[.55,-.25],[-.55,.25],[.55,.25]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.72,5),new THREE.MeshStandardMaterial({color:0x8a8c8e,metalness:.5,roughness:.4}));l.position.set(x,.36,z);t.add(l);}
  for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(.15,.004,.1),new THREE.MeshStandardMaterial({color:0xfbfaf4,roughness:.9}));c.position.set(-.4+(i%3)*.18,.74+Math.floor(i/3)*.005,-.05+(i%2)*.06);c.rotation.y=i*.2;t.add(c);}
  for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.13,6),new THREE.MeshStandardMaterial({color:[0x1d1d1d,0x2a4a9a,0xb83a2a,0x2a7a3a][i],roughness:.5}));m.rotation.z=Math.PI/2;m.position.set(.25,.745,-.15+i*.05);t.add(m);}}
 // a lawn chair (Mr. Brandt's leg is in a cast) and his crutches
 const CHAIR=JW(JH.doorX+4.6,10.6);
 const chairG=(()=>{const g=new THREE.Group();g.position.set(CHAIR.x,gy(CHAIR.x,CHAIR.z),CHAIR.z);g.rotation.y=-JA(Math.PI)+.5;lawn.add(g);const al=new THREE.MeshStandardMaterial({color:0xb8bcc0,metalness:.6,roughness:.35}),web=new THREE.MeshStandardMaterial({color:0x3a6a5a,roughness:.9});
  const seat=new THREE.Mesh(new THREE.BoxGeometry(.5,.03,.46),web);seat.position.y=.4;g.add(seat);const bk=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,.03),web);bk.position.set(0,.66,.22);bk.rotation.x=-.2;g.add(bk);
  for(const x of [-.25,.25])for(const z of [-.22,.22]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.42,5),al);l.position.set(x,.2,z);g.add(l);}
  for(const x of [.42,.5]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,1.3,6),al);c.position.set(x,.62,.3);c.rotation.z=.18;g.add(c);}return g;})();
 // who tells what, if you stand near them (each once)
 const TALES=[
  {at:()=>JW(JH.doorX-3.6,10.1),ls:[DAVIS('He mowed my lawn once. Twenty bucks. Diagonal stripes.',{time:3.2}),V('A NEIGHBOR','On purpose?',{time:1}),DAVIS('He said it was “a design.”',{time:2}),{wait:.6},N('Somebody laughs, and then looks round like they shouldn’t have. Nobody minds.',{time:4})]},
  {at:()=>JW(JH.doorX-2.2,9.1),ls:[PRUITT('Every Tuesday he carried my groceries up the steps, and every Tuesday he ate one of my bananas.',{time:4.6}),PRUITT('He thought I didn’t count them.',{time:2.4}),{wait:1},PRUITT('I counted them.',{time:1.6})]},
  {at:()=>JW(JH.doorX-4.8,8.0),ls:[V('A MOTHER','He did the whole Pledge of Allegiance in a duck voice. At the spring assembly.',{time:3.8}),V('ANOTHER MOTHER','Mrs. Ochoa gave him a detention and then had to leave the gym because she was laughing.',{time:4.2})]},
  {at:()=>JW(JH.doorX+3.8,12.2),ls:[SD('He used to walk into our kitchen without knocking and say, “What are we eating?”',{time:3.8}),MO('He did that at ours too.',{time:1.8}),{wait:.8},SD('He did that everywhere.',{time:1.8})]},
  {at:()=>JW(JH.doorX+2.1,9.6),ls:[MRH('He came back in for me. I told him to go. He said, “Mr. Henderson, I’m not leaving you in here, it smells weird.”',{time:5.4}),{wait:1.6},MRH('That’s what he said.',{time:1.8})]},
 ];
 function lawnCast(){const S0=(a,x,z,h,g=null)=>{if(!a)return;const q=JW(x,z);putW(a,q,JA(h),g);};
  const jd=JH.doorX;
  S0(jamieMom,jd+.1,7.15,Math.PI,C.keep.cap==='mom'?G(ACT9.clutch({k:.8})):G(ACT9.cup({look:-.1})));feel(jamieMom,'tearful',60);mood(jamieMom,'grief');if(C.keep.cap==='mom')capTo('her',jamieMom);
  S0(mrsH,jd+1.8,9.6,Math.PI+.5,'fold');S0(mrH,jd+2.4,10.0,Math.PI+.3,null);S0(lily,jd+1.3,9.2,Math.PI+.6,G(ACT9.cup()));feel(mrsH,'grief',60);feel(mrH,'tearful',60);
  S0(pruitt,jd-2.4,9.4,Math.PI-.4,'fold');S0(davis,jd-3.6,10.2,Math.PI-.8,'hips');S0(vol1,jd-4.4,10.8,Math.PI-1.2,'fold');
  S0(vol2,jd-5.2,8.4,Math.PI+.9,'fold');S0(vol3,jd-4.6,7.8,Math.PI+1.4,G(ACT9.cup()));
  S0(samDad,jd+3.6,12.3,Math.PI+.8,'fold');S0(samMom,jd+4.4,12.0,Math.PI+.4,G(ACT9.cup()));S0(mom,jd+3.0,12.6,Math.PI+1.4,'fold');feel(mom,'tearful',60);
  S0(reyes,jd+6.1,11.4,Math.PI+.9,'fold');S0(huang,jd+.9,12.4,Math.PI,'fold');S0(delaney,jd-1.2,12.0,Math.PI-.2,G(ACT9.cup()));S0(okafor,jd+5.2,9.2,Math.PI+1.1,'fold');S0(pruitt3,jd-.6,10.4,Math.PI-.1,'fold');
  if(brandt){putW(brandt,CHAIR,JA(Math.PI)-.5,G(ACT9.castLeg(.42,{side:1})),{noBlock:true});splint(brandt);feel(brandt,'grief',60);}
  for(const a of [mrsH,mrH,pruitt,davis,samDad,samMom,reyes])if(a)feel(a,'tearful',30);}
 const SAMCURB=JW(JH.doorX-.9,14.0),GOHOME=JW(JH.doorX-4.6,15.4);
 function sceneMemJamie(){go('a1-mem1');streetWorld('september',{sky:'evening',evening:true});setDay('SEPTEMBER 3',19.62,'evening');C.skyK={p:.74,day:.18};C.grief=.55;applyGrief();
  C.amb={traffic:.02,insects:.55,wind:.12,life:.2,forest:0,tunnel:0,water:0};lawn.visible=true;if(!root.parent)scene.add(root);C.porchOn=true;
  lightsOn(true);{const c=JW(JH.doorX,7.6,.5);light(0,c,{intensity:7,dist:9,color:0xffb868,flicker:.35});const e=JW(JH.doorX+1.1,7.9,.7);light(1,e,{intensity:3,dist:5,color:0xffc078,flicker:.5});const pl=JH.porchLight;const pq=JW(pl.x,pl.z+.4,pl.y);light(2,pq,{intensity:4,dist:9,color:0xffe0b0});}
  lawnCast();const st=JW(JH.doorX-2.6,15.4);placeMe(st,headingTo(st.x,st.z,JP.step.x,JP.step.z));joinFoot(sam,SAMCURB,headingTo(SAMCURB.x,SAMCURB.z,JP.step.x,JP.step.z));
  stand(sam,SAMCURB,{look:()=>V3({x:EASEL.x,y:EASEL.y+1,z:EASEL.z}),max:1.4});weep(sam,'grief',90);
  checkpoint('a1-memorial-jamie');C.fadeIn=0;C.fadeInDur=3;
  task('mem1',(function*(){
   yield* lines([{wait:2},N('Candles on Jamie’s lawn, in jars, more than you can count. People standing in the grass, not in rows. Nobody is in charge of it.',{time:5.4}),{wait:1.6},
    N('Sam stays at the curb. He doesn’t come any closer than that.',{time:3.4})]);
   objective('Jamie’s lawn.','Stay as long as you want.');
   offer('photo','His picture',()=>V3({x:EASEL.x,y:gy(EASEL.x,EASEL.z)+1,z:EASEL.z}),{r:5,look:true,size:.3,cone:.2,when:()=>!busy(),fn:()=>{say([N('The picture from her wallet. School, last fall. He hated it. He said it made him look like a weatherman.',{time:4.6}),{wait:1},
    N('On the steps under it, notes. YOU STILL OWE ME TWO DOLLARS, in Sam’s square printing.',{time:4.2})]);}});
   offer('cards','Write something',()=>V3({x:TABLE.x,y:gy(TABLE.x,TABLE.z)+.8,z:TABLE.z}),{r:2.4,when:()=>!busy()});
   const told={};let t0=C.pt,samT=0;
   // you can be anywhere on the lawn; what happens happens where you are
   while(true){yield;const p=me();
    for(const [i,T2] of TALES.entries()){if(told[i]||busy())continue;if(D(p,T2.at())<3.2){told[i]=true;say(T2.ls);mark('heard: '+i);break;}}
    if(!C.flags.samNote&&D(p,SAMCURB)<1.9&&!busy()){samT+=C.dt;if(samT>2.2){C.flags.samNote=true;say([{wait:.4},SM('I wrote him a note.',{time:1.4,face:'tired'}),{wait:.8},SM('It’s stupid. It just says he owes me two dollars.',{time:2.6}),{wait:1.6},SM('He does, though.',{time:1.6}),{wait:1.4},N('You stand there with him. That’s all. It’s something.',{time:3})]);keep('told',{...C.keep.told,samCurb:true});}}else samT=0;
    if(C.flags.cards&&!C.noteDone){C.noteDone=true;yield* writeJamie();}
    if(!C.flags.asked&&!busy()&&(D(p,JP.step)<3.4||C.pt-t0>70)){C.flags.asked=true;yield* hisMother();t0=C.pt;}
    if(C.flags.asked&&!C.flags.goOffered&&!busy()){C.flags.goOffered=true;objective('Jamie’s lawn.','Go home when you’re ready.');offer('go','Go home',()=>V3({x:GOHOME.x,y:GOHOME.y+1,z:GOHOME.z}),{r:3.4,when:()=>!busy()});later(45,()=>{if(S.phase==='a1-mem1'&&!C.flags.go&&!busy())say([MO('Whenever you’re ready, honey. No hurry.',{time:2.4})]);});}
    if(C.flags.go)break;}
   for(const id of ['photo','cards','go'])unoffer(id);
   yield* lines([N('You go home. Behind you the candles are still going, and somebody is telling another one, and people are laughing, quietly, in the dark.',{time:5.4}),{wait:2}]);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-memorial-alex');})());}
 function* writeJamie(){unoffer('cards');
  yield* lines([N('Blank cards, and markers. Most of the notes on the steps are one line.',{time:3.4})]);
  const ch=yield* choosing([{id:'medical',label:'“Medical reasons.”'},{id:'biscuit',label:'“Biscuit says hi.”'},{id:'five',label:'“Nobody gets left behind.”'}],{timeout:20,fallback:'medical'});
  const text={medical:['Medical reasons.','',''],biscuit:['Biscuit says hi.','',''],five:['Nobody gets','left behind.','']}[ch];keep('told',{...C.keep.told,jamieNote:ch});
  const m=pageMesh(tex9('card',text),{w:.17,h:.106});const q=JW(JH.doorX+.95,6.7,.364);m.position.set(q.x,q.y,q.z);m.rotation.set(-Math.PI/2+.04,(-JA(Math.PI))-.12,0);m.rotation.order='YXZ';lawn.add(m);C.myNote=m;
  sound('c7Pencil',camera.position,{gain:.4});
  yield* lines([{wait:.6},N(ch==='medical'?'Nobody else will know what it means. That’s the point.':ch==='biscuit'?'You put it on the step with the others.':'You stand there a while with the marker before you put it down on the step.',{time:3.6})]);}
 function* hisMother(){const jm=jamieMom;
  {const p=me(),h=headingTo(jm.x,jm.z,p.x,p.z);if(D(p,jm)>2.6){const q={x:p.x-Math.sin(h)*1.4,z:p.z+Math.cos(h)*1.4};jm.gest(null);jm.walk([[lerp(jm.x,q.x,.95),lerp(jm.z,q.z,.95)]],{speed:.8,then:a=>{a.faceTo(me().x,me().z);}});yield* until(()=>!jm.walking,14);}}
  jm.lookAt=camera.position;jm.gest(C.keep.cap==='mom'?G(ACT9.clutch({k:.7})):null);
  yield* lines([{wait:.4},JM('Hi, honey.',{time:1.2}),{wait:.8},JM('Tell me something about him. Something I don’t know.',{time:2.8,face:'tearful'})]);
  const ch=yield* choosing([{id:'gum',label:'“He took two pieces of gum. He said, ‘Medical reasons.’”'},{id:'chain',label:'“He said his chain was sabotaged. In the Tour. Every time.”'},{id:'laugh',label:'“He made us laugh. Down there. Even then.”'},{id:'none',label:'Say nothing'}],{timeout:20,fallback:'none'});
  keep('told',{...C.keep.told,jamieMom3:ch});
  if(ch==='gum')yield* lines([Y('Sam had gum. Down there. He gave everybody one, and Jamie took two, and he said, “Medical reasons.”',{time:5}),{wait:1.6},JM('Medical reasons.',{time:1.6,face:'tearful'}),N('She laughs. She laughs so hard she has to hold on to your shoulder.',{time:3.6}),JM('Oh, that kid. Oh, that kid.',{time:2.4,face:'crying'})]);
  else if(ch==='chain')yield* lines([Y('In the Tour. He said his chain was sabotaged. Every time it came off.',{time:3.4}),{wait:1.2},JM('Sabotage.',{time:1.4}),JM('His homework was sabotaged. His room was sabotaged. That boy was the most sabotaged person in this town.',{time:4.6,face:'tearful'})]);
  else if(ch==='laugh')yield* lines([Y('He made us laugh. Down there. Even then.',{time:2.4}),{wait:2},JM('Good.',{time:1.2,face:'crying'}),{wait:1},JM('Good. That’s good.',{time:1.8,face:'crying'})]);
  else yield* lines([{wait:2.6},N('You can’t. Not here. You shake your head.',{time:2.8}),{wait:1},JM('That’s okay. You’re here. That’s something.',{time:2.8})]);
  cry(.45,10);jm.lookAt=null;}
 // ---- 11b: Alex's pictures (the school gym) ------------------------------------------------------------------------------------------------
 const PIC=['The oak, from the swing.','The creek grate, close, like he was trying to see in.','Jamie in the air off his curb, tongue out.','Sam in his garage with a wrench, not looking up.',null,
  'Mrs. Delaney’s cat on a car hood, unimpressed.','You, blurred. Under it: “Hold still.”','Mostly his thumb.','The water tower against a white sky.','Oak Hollow at seven in the morning, nobody on it.','A dog in somebody’s yard. NOT OUR DOG.','Rain on a window, the street smeared behind it.'];
 const SHADOW='Four long shadows across the road at sunset. Four bikes. He must have been standing up on his pedals to take it. The fourth shadow is his.';
 const SEAT={you:{x:-1.2,z:.3},sam:{x:-2.3,z:.3},mom:{x:-.1,z:.3}};
 function gymCast2(){const rows=SCH.SPOT.rows||[];const seat=(a,r,c,o2={})=>{const s=rows.find(q=>q.r===r&&q.c===c);if(!a||!s)return;const w=SW(s.x,s.z+.06);putW(a,w,0,G(ACT9.sit(.44,{hands:o2.hands||'knees',lean:o2.lean??.12})),{noBlock:true});};
  seat(alexMom,0,5,{lean:.02});seat(alexDad,0,6,{lean:.2});feel(alexMom,'numb',99);feel(alexDad,'grief',99);mood(alexMom,'numb');
  seat(samDad,1,1);seat(samMom,1,2);seat(jamieMom,4,8,{lean:.24});feel(jamieMom,'grief',99);if(C.keep.cap==='mom')capTo('her',jamieMom);
  seat(mrsH,3,6);seat(mrH,3,7);seat(lily,3,8,{hands:'lap'});seat(pruitt,2,7);seat(davis,2,8);seat(vol1,1,7);seat(vol2,1,8);seat(vol3,4,1);seat(vol4,4,2);seat(huang,5,6);seat(delaney,5,7);seat(okafor,3,2);seat(pruitt3,5,2);
  if(brandt){const s=rows.find(q=>q.r===1&&q.c===9);if(s){const w=SW(s.x,s.z+.06);putW(brandt,w,0,G(ACT9.castLeg(.44,{side:-1})),{noBlock:true});splint(brandt);feel(brandt,'grief',99);}}
  {const w=SW(-11.2,3.4);putW(reyes,w,Math.PI/2+.3,'fold');feel(reyes,'grief',60);}
  {const w=SW(SEAT.mom.x,SEAT.mom.z+.06);putW(mom,w,0,G(ACT9.sit(.44,{lean:.1})),{noBlock:true});feel(mom,'tearful',60);}}
 function sceneMemAlex(){go('a1-mem2');schoolWorld('memorial',{sky:'clear',lightName:'day',lights:'memorial'});setDay('SEPTEMBER 6',13.95,'clear');C.grief=.5;applyGrief();
  C.amb={traffic:.04,insects:.1,wind:.15,life:.12,forest:0,tunnel:0,water:0};gymCast2();
  const dp=SCH.SPOT.gymDoor||{x:-5.5,z:8.2},st=SW(dp.x,dp.z-1.2);placeMe(st,Math.PI*0+0);joinFoot(sam,SW(dp.x+.8,dp.z-1),0);weep(sam,'tired',60);
  checkpoint('a1-memorial-alex');C.fadeIn=0;C.fadeInDur=2.6;
  task('mem2',(function*(){
   yield* lines([{wait:1.6},N('The gym again. The cots are gone. Chairs in rows, and along both walls, on boards, his pictures.',{time:4.6}),{wait:1},N('Somebody has set out more chairs than there are people. Then people keep coming in.',{time:3.8})]);
   objective('Find somewhere to sit.','Or stand at the back.');
   offer('sit','Sit down',()=>V3(SW(SEAT.you.x,SEAT.you.z,.9)),{r:2,fn:()=>{const w=SW(SEAT.you.x,SEAT.you.z+.04);pose(w,{y:gy(w.x,w.z)+1.06,yaw:0,pitch:-.05,slow:1.2,seat:{h:.44,y:gy(w.x,w.z)}});C.flags.seated=true;}});
   // Sam goes to the seat beside yours whether you sit or not
   {const w=SW(SEAT.sam.x,SEAT.sam.z+.5);stand(sam,w,{max:1.2});}
   yield* until(()=>C.flags.sit||C.pt>50,70);unoffer('sit');
   pinSam({x:SW(SEAT.sam.x,SEAT.sam.z+.06).x,z:SW(SEAT.sam.x,SEAT.sam.z+.06).z},{a:0,gesture:ACT9.sit(.44,{lean:.22}),blend:1.4,world:true});
   if(!C.flags.sit)yield* lines([N('You stay standing at the back. Nobody makes you sit.',{time:3})]);
   // his father, at the front
   yield* wait(2);{const a=alexDad,w=SW(-.6,-4.9);a.gest(null);a.noBlock=false;const up=SW(-.9,-3.1);a.place(up.x,up.z,Math.PI);a.walk([[w.x,w.z]],{speed:.8,then:q=>{q.face(Math.PI);q.gest('fold');C.flags.atFront=true;}});}
   yield* until(()=>C.flags.atFront,20);
   yield* lines([{wait:1.4},AD('I’m not good at this. Alex would tell you I’m not good at this. He’d be right.',{time:4}),{wait:1.2},
    AD('He noticed things. Which way the water ran in the gutter. Which car on Briarwood was new. When somebody had a haircut, before they told anybody.',{time:5.6}),
    AD('He’d tell you, and you’d think, how did I not see that.',{time:3}),{wait:1.6},AD('Thank you for looking for him. All of you. For six days.',{time:3.2,face:'crying'}),{wait:1.4},
    AD('He was always the one holding the camera. So we put his pictures up. So you can see what he saw.',{time:4.6}),{wait:2},AD('...That’s all. That’s all I can.',{time:2.4,face:'crying'})]);
   cry(.55,12);
   {const a=alexDad,s=(SCH.SPOT.rows||[]).find(q=>q.r===0&&q.c===6);if(s){const w=SW(s.x,s.z+.06);a.walk([[w.x,w.z+.6]],{speed:.7,then:q=>{q.place(w.x,w.z,0);q.gest(G(ACT9.sit(.44,{lean:.3})));q.noBlock=true;C.flags.dadSat=true;}});}}
   yield* until(()=>C.flags.dadSat,12);yield* wait(3);
   yield* lines([N('For a while nobody gets up. Then somebody does, and goes to the pictures, and then everybody does.',{time:4.6})]);
   if(posed()){unpose();const w=SW(0,SEAT.you.z);later(.9,()=>{if(S.phase==='a1-mem2')o.placePlayer({x:w.x,z:w.z,a:me().a,mode:'walk',bike:null});});}// (up into the aisle)
   pinSam(null);stand(sam,null);
   // people up and walking the boards; his father by the table; the two mothers
   const walkers=[samDad,samMom,mrsH,pruitt,davis,vol1,vol2,huang,delaney];walkers.forEach((a,i)=>{if(!a)return;const b=SCH.SPOT.prints[i%SCH.SPOT.prints.length],w=SW(b.x+(b.x<0?1.3:-1.3),b.z+(i%3-1)*.6);a.noBlock=false;a.gest(null);a.walk([[w.x,w.z]],{speed:.7,then:q=>{q.faceTo(SW(b.x,b.z).x,SW(b.x,b.z).z);q.gest('fold');}});});
   {const w=SW(1.6,-5.2);alexDad.gest(null);alexDad.noBlock=false;alexDad.walk([[w.x,w.z]],{speed:.7,then:q=>{q.faceTo(SW(1,-6.1).x,SW(1,-6.1).z);q.gest(G(ACT9.lost()));}});}
   objective('His pictures.','Along both walls.');
   SCH.SPOT.prints.forEach((b,j)=>{offer('board-'+j,'His pictures',()=>V3(SW(b.x,b.z,b.y)),{r:4,look:true,size:.8,cone:.25,when:()=>!busy(),fn:()=>{C.boardsSeen=(C.boardsSeen||0)+1;const ns=PRINTS9(b.i);const ls=[];
    for(const n of ns){if(n===4){C.flags.shadow=true;ls.push(N(SHADOW,{time:5.4}));}else ls.push(N(PIC[n],{time:2.6}));}if(ns.includes(4))ls.push({wait:1.2},N('His dad said he isn’t in any of them.',{time:2.6}));say(ls);mark('board '+b.i);}});});
   offer('cards','The card box',()=>V3(SW(SCH.SPOT.cards.x,SCH.SPOT.cards.z,SCH.SPOT.cards.y)),{r:2.4,when:()=>!busy()});
   later(14,()=>{if(S.phase!=='a1-mem2')return;const a=alexMom,b=jamieMom,s=(SCH.SPOT.rows||[]).find(q=>q.r===4&&q.c===7);if(!a||!s)return;const w=SW(s.x,s.z+.06);a.gest(null);a.noBlock=false;a.walk([[w.x+.2,w.z+.7],[w.x,w.z+.06]],{speed:.6,then:q=>{q.face(0);q.gest(G(ACT9.sit(.44,{lean:.12})));q.noBlock=true;C.flags.mothers=true;b.gest(G(ACT9.sit(.44,{hands:'lap',lean:.2})));}});});
   let t0=C.pt;
   while(true){yield;
    if(C.flags.mothers&&!C.flags.mothersSaid&&!busy()){C.flags.mothersSaid=true;say([N('Alex’s mom has gone and sat down next to Jamie’s mom, at the back. Neither of them says anything.',{time:4.2}),{wait:2.4},N('After a while, Jamie’s mom takes her hand.',{time:3})]);}
    if(C.flags.shadow&&!C.flags.toldOffered&&!busy()){C.flags.toldOffered=true;offer('tell','Tell his dad',()=>headOf(alexDad),{r:3,when:()=>!busy()});}
    if(C.flags.tell&&!C.flags.toldDad){C.flags.toldDad=true;unoffer('tell');yield* tellDad();}
    if(C.flags.cards&&!C.cardDone){C.cardDone=true;yield* cardBox();}
    if(!C.flags.leaveOffered&&((C.boardsSeen||0)>=2||C.pt-t0>60)&&!busy()){C.flags.leaveOffered=true;const dq=SCH.SPOT.gymDoor||{x:-5.5,z:8.2};offer('leave','Go outside',()=>V3(SW(dq.x,dq.z-.2,1.2)),{r:2.4,when:()=>!busy()});objective('His pictures.','Go when you’re ready.');}
    if(C.flags.leave)break;}
   for(const id of ['tell','cards','leave',...SCH.SPOT.prints.map((b,j)=>'board-'+j)])unoffer(id);
   C.fadeOut=0;C.fadeOutDur=3;C.after=()=>toNext('a1-sam');})());}
 function* tellDad(){const ad=alexDad;ad.lookAt=camera.position;ad.gest(null);
  const ch=yield* choosing([{id:'shadow',label:'“He’s in one. The shadows. The fourth one is him.”'},{id:'not',label:'Don’t'}],{timeout:14,fallback:'not'});
  if(ch==='not'){yield* lines([N('You don’t. Not now. Maybe some other time.',{time:2.6})]);ad.lookAt=null;return;}
  keep('told',{...C.keep.told,shadow:true});
  const b=SCH.SPOT.prints.find(q=>PRINTS9(q.i).includes(4)),bw=SW(b.x+(b.x<0?1.1:-1.1),b.z);
  yield* lines([Y('He’s in one. The one with the shadows. The fourth one is him.',{time:3}),{wait:.8},AD('...Show me.',{time:1.4})]);
  ad.walk([[bw.x,bw.z]],{speed:.8,then:q=>{q.faceTo(SW(b.x,b.z).x,SW(b.x,b.z).z);C.flags.atBoard=true;}});yield* until(()=>C.flags.atBoard,16);
  yield* lines([{wait:1.4},AD('That’s his shadow.',{time:1.6,face:'crying'}),{wait:1.6},AD('Look at that. He got himself in one.',{time:2.6,face:'crying'}),{wait:.8},N('He laughs, and has to sit down on the nearest chair to do it.',{time:3.4})]);cry(.5,10);}
 function* cardBox(){unoffer('cards');
  yield* lines([N('A box with a slot in the lid, and a stack of cards. FOR ALEX’S FAMILY.',{time:3.4})]);
  const ch=yield* choosing([{id:'chain',label:'“Thank you for holding the chain.”'},{id:'bell',label:'“Ding ding.”'},{id:'look',label:'“I’m going to keep noticing things. For you.”'}],{timeout:20,fallback:'look'});
  keep('note',ch);sound('c7Pencil',camera.position,{gain:.4});later(1.4,()=>sound('a1Cloth',camera.position,{gain:.3}));
  yield* lines([{wait:.8},N('You fold it in half and put it through the slot. You hear it land on the others.',{time:3.6})]);}
 // ---- 12: the chain ------------------------------------------------------------------------------------------------------------------------
 const HOME=homeOf(world),HO=HOME.toWorld(0,0),HW=(x,z,y=0)=>{const q=HOME.toWorld(x,z);return {x:q.x,y:HO.ground+y,z:q.z};},HA=a=>a-HOME.worldRot;
 const DRIVE=HW(HOME.drivX??HOME.gx,(HOME.drivEnd+HOME.endLat)/2+.6),CURB=HW((HOME.drivX??HOME.gx)+2.4,HOME.endLat-.25),CURB2=HW((HOME.drivX??HOME.gx)+3.15,HOME.endLat-.25);
 const myBike=(()=>{const b=createBike({...CAST.player.bike,noChain:true});b.group.name='a1-your-bike';b.group.visible=false;scene.add(b.group);return b;})();
 // its chain: a loop of its own, on the rings or hanging off them (k: 0 off, 1 on). The bike is upside down while it is fixed.
 const chainM=new THREE.MeshStandardMaterial({color:0x4a4a46,roughness:.45,metalness:.6});chainM.name='a1-chain';
 const CH={k:0,mesh:null,last:-1};
 function chainCurve(k){const G2=myBike.geom,bb=new THREE.Vector3(...G2.bb),rear=new THREE.Vector3(0,G2.wheelR,G2.rear),x=.06;
  const on=[[bb.y+.085,bb.z],[rear.y+.04,rear.z],[rear.y-.04,rear.z],[bb.y-.085,bb.z]];
  const off=[[rear.y+.17,bb.z+.12],[rear.y+.04,rear.z],[rear.y-.04,rear.z],[bb.y+.2,bb.z+.05]];// (off the ring, hanging toward the ground: upside down, the ground is +y)
  const P=[0,1,2,3].map(i=>new THREE.Vector3(x,lerp(off[i][0],on[i][0],k),lerp(off[i][1],on[i][1],k)));
  const mid=(a,b,s)=>a.clone().lerp(b,.5).add(new THREE.Vector3(0,s,0));
  return new THREE.CatmullRomCurve3([P[0],mid(P[0],P[1],(1-k)*.03),P[1],P[2],mid(P[2],P[3],(1-k)*.16),P[3]],true);}
 function chainSet(k){if(CH.mesh&&Math.abs(k-CH.last)<.01)return;CH.last=k;if(CH.mesh){CH.mesh.geometry.dispose();CH.mesh.removeFromParent();}CH.mesh=new THREE.Mesh(new THREE.TubeGeometry(chainCurve(k),40,.0042,4,true),chainM);CH.mesh.name='a1-chain-loop';myBike.frame.add(CH.mesh);CH.k=k;}
 function bikeUpsideDown(on){const g=myBike.group;g.visible=on;if(!on)return;g.position.set(DRIVE.x,gy(DRIVE.x,DRIVE.z)+1.0,DRIVE.z);g.rotation.set(0,-HA(Math.PI/2),Math.PI,'YXZ');myBike.kickstand=0;myBike.steerAngle=.25;poseBike(myBike);}
 const pedalAt=()=>{myBike.group.updateMatrixWorld(true);return myBike.pedals[1].getWorldPosition(new THREE.Vector3());};
 // the streetlights (rule four): held off until they come on
 const LAMPS=()=>o.ambient?.lamps?.()||[];
 function lampsTo(v){const L=o.ambient?.lampOverride;if(!L)return;for(const l of LAMPS())L.set(l.i,v);}
 function lampsFree(){o.ambient?.lampOverride?.clear?.();}
 function sceneSam(){go('a1-sam');streetWorld('september',{sky:'evening',evening:true});setDay('SEPTEMBER 17',18.55,'evening');C.skyK={p:.5,day:.42};C.grief=.45;applyGrief();
  C.amb={traffic:.06,insects:.5,wind:.15,life:.4,forest:0,tunnel:0,water:0};lampsTo(0);C.lampsOn=false;
  bikeUpsideDown(true);chainSet(0);
  const st=HW((HOME.drivX??HOME.gx)-1.1,(HOME.drivEnd+HOME.endLat)/2+.2);placeMe(st,headingTo(st.x,st.z,DRIVE.x,DRIVE.z));
  // Sam isn't here yet: he rides down from the top of the street
  leave(sam);
  checkpoint('a1-sam');C.fadeIn=0;C.fadeInDur=2.6;
  task('sam',(function*(){
   yield* lines([{wait:1.6},N('Your chain came off at the bottom of the hill. It keeps doing that now. It never used to.',{time:4.2}),{wait:.8},N('You’ve been trying to get it back on for twenty minutes. Your hands are black to the wrist.',{time:3.8})]);
   objective('Your chain.','');
   offer('try','Try the chain again',()=>{const p=pedalAt();return {x:p.x,y:p.y,z:p.z};},{r:2.2,hold:1.6,tick:(dt,v)=>{myBike.crankAngle=(myBike.crankAngle||0)+dt*2.4;poseBike(myBike);if(Math.random()<dt*4)sound('a1Freewheel',pedalAt(),{gain:.25});},
    fn:()=>{sound('chain',pedalAt(),{gain:.5});}});
   yield* until(()=>C.flags.try,40);unoffer('try');
   if(C.flags.try)yield* lines([N('It goes halfway on and falls off again.',{time:2.6})]);
   // Sam: down the street on his bike
   {const a=SP(482,-2.6),b=SP(450,-3.4),c=SP(HOME.drivD+3,-4.2);sam.gone=false;comp.putRiding(sam,a.x,a.z,heading(482)+Math.PI,3.2);sam.person.group.visible=true;sam.bike.group.visible=true;sam.follow=null;
    comp.run(sam,[comp.steps.rideTo(sam,[[b.x,b.z],[c.x,c.z]],{vmax:3.4,vend:0}),comp.steps.brake(sam,.6),comp.steps.dismount(sam)],{then:()=>{C.flags.samHere=true;}});weep(sam,'tired',99);mood(sam,'tired');}
   yield* until(()=>C.flags.samHere,40);
   if(!C.flags.samHere){const c=SP(HOME.drivD+3,-4.2);comp.putFoot(sam,c.x,c.z,heading(434),{bike:{x:c.x+.5,z:c.z,a:heading(434),kick:1}});}
   {const w=HW((HOME.drivX??HOME.gx)+.9,(HOME.drivEnd+HOME.endLat)/2+.5);stand(sam,w,{look:()=>V3({x:DRIVE.x,y:DRIVE.y+.6,z:DRIVE.z}),max:1});}
   yield* lines([{wait:.6},SM('You’re doing it wrong.',{time:1.4}),{wait:.6},SM('You always try to do the front first. You have to do the back first.',{time:3})]);
   yield* until(()=>D({x:sam.px,z:sam.pz},DRIVE)<1.6,10);
   {const w=HW((HOME.drivX??HOME.gx)+.62,(HOME.drivEnd+HOME.endLat)/2+.6);pinSam({x:w.x,z:w.z},{a:headingTo(w.x,w.z,DRIVE.x,DRIVE.z),gesture:ACT.kneel({side:1,lookPitch:-.35}),blend:1,world:true});}
   yield* lines([{wait:1},N('He kneels down by your bike and puts the chain on the back cog without even looking, the way you’d tie a shoe.',{time:4.6}),SM('Okay. Turn the pedal. Backwards. Slow.',{time:2.2})]);
   objective('Turn the pedal.','Hold F. Backwards, slow.');
   offer('pedal','Turn the pedal backwards',()=>{const p=pedalAt();return {x:p.x,y:p.y,z:p.z};},{r:2.4,hold:2.8,
    tick:(dt,v)=>{myBike.crankAngle=(myBike.crankAngle||0)-dt*1.6;poseBike(myBike);chainSet(smooth(clamp((v-.15)/.75,0,1)));C.tickT=(C.tickT||0)-dt;if(C.tickT<=0){C.tickT=.42;sound('a1Freewheel',pedalAt(),{gain:.3});}
     if(v>.05&&phys&&!phys.playerBusy()&&!C.reachP){C.reachP=true;phys.playerReach({at:()=>pedalAt(),dur:[.5,2.4,.4],carry:false,low:true});}},
    release:()=>{C.reachP=false;},fn:()=>{chainSet(1);sound('chain',pedalAt(),{gain:.35});}});
   yield* until(()=>C.flags.pedal,60);if(!C.flags.pedal){unoffer('pedal');chainSet(1);}
   yield* lines([{wait:.6},SM('There.',{time:1}),{wait:.8},N('It goes on like it was never off. The pedal turns free and smooth all the way round.',{time:4}),{wait:1.4},
    SM('Jamie’s did that all the time. He never let me fix it.',{time:2.6}),SM('He said it was “character.”',{time:1.8}),{wait:2}]);
   pinSam(null);
   // the curb
   objective('The curb.','Where you always met.');
   offer('curb','Sit on the curb',()=>V3({x:CURB.x,y:gy(CURB.x,CURB.z)+.3,z:CURB.z}),{r:2.2,fn:()=>{const a=HA(Math.PI);pose({x:CURB.x,z:CURB.z},{y:gy(CURB.x,CURB.z)+.82,yaw:a,pitch:-.08,slow:1.2,seat:{h:.17,y:gy(CURB.x,CURB.z)}});}});
   yield* until(()=>C.flags.curb,60);if(!C.flags.curb){unoffer('curb');const a=HA(Math.PI);pose({x:CURB.x,z:CURB.z},{y:gy(CURB.x,CURB.z)+.82,yaw:a,pitch:-.08,slow:1.2,seat:{h:.17,y:gy(CURB.x,CURB.z)}});}
   pinSam({x:CURB2.x,z:CURB2.z},{a:HA(Math.PI),gesture:ACT.seat(.17,{hands:'knees',lean:.28}),blend:1.4,world:true});
   yield* wait(2.4);
   // his gum (you've still got his pack)
   yield* lines([N('You’ve still got his gum. The pack from down there. You didn’t know you were keeping it.',{time:4})]);
   offer('gum2','Give him the gum',()=>headOf(sam),{r:2.6,inPose:true});
   yield* until(()=>C.flags.gum2,25);unoffer('gum2');
   yield* lines([{wait:.6},N('He takes two.',{time:1.6}),{wait:.6},SM('Medical—',{time:1.2,face:'tearful'}),{wait:2.6},N('He can’t finish it. You can’t either.',{time:2.6}),{wait:2.2},SM('He’d have said it better.',{time:2,face:'tearful'}),{wait:2.4}]);
   // what he's angry about
   yield* lines([SM('My dad says the paper says it was the storm lines. Old pipes and a gas main. “Aged infrastructure.”',{time:4.6,face:'frustrated'}),{wait:1},
    SM('We were down there. We saw it.',{time:2,face:'frustrated'}),{wait:1.4},SM('We got them out. We got all three of them out of those rooms. We did everything right.',{time:4,face:'angry'}),
    SM('And then two hours. Jamie, and then Alex. Two hours.',{time:3,face:'angry'}),{wait:1},SM('So what was the point?',{time:1.8,face:'angry'})]);
   const ch=yield* choosing([{id:'fault',label:'“If we hadn’t let them out, none of it would have happened.”'},{id:'home',label:'“They got to come up. They got to be outside.”'},{id:'dunno',label:'“I don’t know.”'},{id:'none',label:'Say nothing'}],{timeout:20,fallback:'none'});
   keep('told',{...C.keep.told,samWhy:ch});
   if(ch==='fault')yield* lines([Y('If we hadn’t let them out, none of it would have happened.',{time:3}),{wait:.8},SM('Don’t.',{time:1,face:'angry'}),SM('Don’t say that. You don’t get to say that.',{time:2.4,face:'angry'}),{wait:1},
    SM('Brandt said it was coming apart for fifty years. It was already coming apart.',{time:3.6}),SM('If we left them in there they’d still be in there. Is that better?',{time:3.2,face:'angry'}),{wait:1.6},
    Y('It feels like mine.',{time:1.6}),{wait:2},SM('...Yeah.',{time:1.2,face:'tearful'}),SM('Mine too.',{time:1.4,face:'tearful'})]);
   else if(ch==='home')yield* lines([Y('They got to come up. They got to be outside. For two hours.',{time:3}),{wait:1.2},SM('Two hours isn’t—',{time:1.6,face:'angry'}),{wait:2.4},SM('...Jamie got Lily out. In the two hours.',{time:2.6,face:'tearful'}),{wait:1},SM('Okay. Okay.',{time:1.6})]);
   else if(ch==='dunno')yield* lines([Y('I don’t know.',{time:1.4}),{wait:1.4},SM('Me neither.',{time:1.4,face:'tired'})]);
   else yield* lines([{wait:2.6},SM('Sorry. I’m not mad at you.',{time:2}),SM('I’m mad at— I don’t even know what.',{time:2.4,face:'frustrated'})]);
   cry(.4,8);
   yield* lines([{wait:2.4},SM('Sometimes I’m so mad at him. At Jamie. For going back in that yard.',{time:3.4,face:'tearful'}),{wait:1},SM('Is that bad?',{time:1.4})]);
   const c2=yield* choosing([{id:'no',label:'“No.”'},{id:'me',label:'“I’m mad at all of it.”'},{id:'none',label:'Say nothing'}],{timeout:16,fallback:'none'});
   keep('told',{...C.keep.told,samMad:c2});
   if(c2==='no')yield* lines([Y('No.',{time:1}),{wait:1.6},SM('Okay.',{time:1})]);else if(c2==='me')yield* lines([Y('I’m mad at all of it.',{time:1.8}),{wait:1.6},SM('Yeah.',{time:1})]);else yield* lines([{wait:2.4}]);
   // the streetlights
   yield* lines([{wait:2.2},N('It’s getting dark. Somebody down the street calls a dog in. A car pulls into a driveway and its lights go off.',{time:4.6}),{wait:2.4}]);
   C.lampsOn=true;C.lampT=0;sound('click',camera.position,{gain:.05});
   yield* wait(2.2);
   yield* lines([N('The streetlights come on. All of them at once, the way they do. The one across from your drive buzzes for a second, and then it doesn’t.',{time:5}),{wait:1.6,act:()=>{sam.lookAt=V3(SP(415,3.54,5));}},
    SM('...Rule four.',{time:1.4,face:'tearful'}),{wait:1.6},N('When the streetlights come on, you go home.',{time:3}),{wait:2}]);
   sam.lookAt=null;pinSam(null);if(posed())unpose();
   yield* lines([SM('I should go. My mom gets weird now if I’m late.',{time:2.6}),{wait:1},SM('Same time tomorrow?',{time:1.6})]);
   const c3=yield* choosing([{id:'same',label:'“Same time.”'},{id:'yeah',label:'“Yeah.”'}],{timeout:12,fallback:'yeah'});
   yield* lines([c3==='same'?Y('Same time.',{time:1.2}):Y('Yeah.',{time:1})]);
   // he rides home
   {const a=SP(HOME.drivD+5,-3.6),b=SP(470,-2.4),c=SP(520,-2.4);if(sam.mode==='foot'){comp.putRiding(sam,sam.bx??a.x,sam.bz??a.z,heading(450),0);}comp.run(sam,[comp.steps.rideTo(sam,[[b.x,b.z],[c.x,c.z]],{vmax:3.6,vend:2})],{then:()=>{leave(sam);}});}
   yield* wait(4);
   yield* lines([N('At the other end of the street there’s a fence, and a hole, and paint on the doors.',{time:4}),{wait:.6},N('At this end the lights are on, and somebody’s TV is going, and Sam is riding home before his mom gets weird.',{time:5}),{wait:3}]);
   C.fadeOut=0;C.fadeOutDur=3.4;C.after=()=>toNext('a1-weeks');})());}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------------------
 function update(dt){if(lawn.visible){for(const F of FLAMES){const t=C.t*9+F.ph,k=1+Math.sin(t)*.12+Math.sin(t*2.7)*.08;F.f.scale.set(.026*F.s*(1+Math.sin(t*1.3)*.06),.05*F.s*k,1);}}
  if(S.phase==='a1-sam'){// dusk coming on through the scene
   const kk=C.skyK||(C.skyK={});kk.p=Math.min(.8,(kk.p??.5)+dt*.0016);kk.day=Math.max(.14,(kk.day??.42)-dt*.0012);
   if(C.lampsOn){C.lampT+=dt;const t=C.lampT,v=t<.5?(Math.sin(t*70)>.1?.4:.05):Math.min(1,.35+t*.5);lampsTo(v);}}}
 function afterActors(){}
 function sources(out){if(lawn.visible){out.push({id:'a1-lawn-murmur',kind:'murmur',pos:V3(JW(JH.doorX,10,1.4)),level:.32});}}
 function reset(){lawn.visible=false;if(C.myNote){C.myNote.removeFromParent();C.myNote=null;}root.removeFromParent();myBike.group.visible=false;lampsFree();}
 return {SCENE:{'a1-memorial-jamie':()=>sceneMemJamie(),'a1-memorial-alex':()=>sceneMemAlex(),'a1-sam':()=>sceneSam()},update,afterActors,sources,reset,lawn,myBike,chainSet,LAMPS};
}
