// Chapter Seven (expanded): the house with its front door standing open in Old Mill Court, the Langes' (No. 5, lot a5,
// across the street from the Carvers' lit window). A small one-storey house that looks as if somebody was getting an
// evening ready a minute ago: the television on in the front room, a cigarette still going in the ashtray, dinner on the
// kitchen table, still warm, a boy's cap on his chair. A few things in it are from the wrong year (a console set from
// 1959, the Courier from April 1974, a calendar from 1983, a clipping from 1991). Down the hall, a boy's room with three
// drawings over the bed; the bathroom door shut, with the light on behind it; the parents' door locked.
//
// Somebody is in the bathroom. It is there before it is seen (the light under the door, a shadow across it, the door
// pushed on from inside, a picture shaken off its nail), then it comes out, fast, and hits whatever is in its way.
//
// Built in the house's own frame (x across, -z the front, y over the court's ground; the floor at F) to sit inside the
// court's house shell for lot a5 (whose own solid body is left out: these walls, painted outside, are the house). Its
// walls, doors and furniture answer walkable() while you are inside; the chapter drives its moving parts.
import * as THREE from './three.module.js';
import {mat,createBuild,createFurniture,paper} from './chapter7-build.js';
import {inBox,clamp,smooth} from './chapter6-kit.js';

import {finish,wallPrintArt} from './chapter7-finishes.js';
import {dressLange} from './chapter7-rooms-art.js';

export const LANGE={W:12,D:8.6,F:.45,doorX:-1.5,H:2.8};

// ---- the pages the chapter holds up (canvas textures; null without a canvas) -----------------------------------------------
function courierPage(c,w,h){c.fillStyle='#e8dcbc';c.fillRect(0,0,w,h);c.fillStyle='rgba(150,120,60,.10)';c.fillRect(0,0,w,h);c.fillStyle='#1a1a1a';c.font='bold 44px Georgia';c.textAlign='center';c.fillText('The Oak Hollow Courier',w/2,60);
 c.font='14px Georgia';c.fillText('THURSDAY, APRIL 11, 1974  -  FIFTEEN CENTS',w/2,88);c.fillRect(20,98,w-40,3);c.font='bold 34px Georgia';c.fillText('TOWNSHIP VACATES',w/2,150);c.fillText('OLD MILL COURT',w/2,192);
 c.font='16px Georgia';c.textAlign='left';['Board votes 4-1 to close the street for','the new storm line and to permit isolation','work at the Line Four junction beneath','it. Residents to be relocated by the end','of summer. “Nobody has lived there for','years,” the supervisor said. Mrs. E. Lange,','of No. 5, could not be reached for comment.'].forEach((s,i)=>c.fillText(s,40,232+i*24));
 c.fillStyle='#8a8478';c.fillRect(300,420,180,150);c.fillStyle='#5a564c';for(let k=0;k<5;k++)c.fillRect(312+k*34,500-k*6,22,70+k*6);c.fillStyle='#1a1a1a';c.font='italic 12px Georgia';c.fillText('The court, from the oak.',300,588);
 c.font='bold 18px Georgia';c.fillText('Storm line to run',40,440);c.fillText('under the old mill race',40,462);c.font='14px Georgia';['Engineers say the line','will follow the mill race','from the oak to the creek.'].forEach((s,i)=>c.fillText(s,40,490+i*20));}
function boardPage(c,w,h){c.fillStyle='#b48a5a';c.fillRect(0,0,w,h);c.fillStyle='rgba(60,40,20,.18)';for(let k=0;k<900;k++){c.fillRect((k*97)%w,(k*53)%h,2,2);}
 c.strokeStyle='#6a4a2a';c.lineWidth=10;c.strokeRect(5,5,w-10,h-10);
 const pin=(x,y,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,6,0,7);c.fill();c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(x-2,y-2,2,0,7);c.fill();};
 // 1966: yellowed nearly brown; a girl's school picture
 c.save();c.translate(30,40);c.rotate(-.04);c.fillStyle='#d8c08a';c.fillRect(0,0,200,230);c.fillStyle='#2a2216';c.font='bold 20px Georgia';c.fillText('GIRL, 11, MISSING',10,30);c.font='11px Georgia';c.fillText('THE COURIER  ·  AUG. 25, 1966',10,48);
 c.fillStyle='#7a6a50';c.fillRect(12,58,64,80);c.fillStyle='#d8c08a';c.beginPath();c.arc(44,90,16,0,7);c.fill();c.fillStyle='#2a2216';c.font='12px Georgia';['Ruth Ann Carver, 11,','has not been seen','since the evening of','Aug. 23, when she','rode her bicycle'].forEach((s,i)=>c.fillText(s,84,72+i*15));
 ['downtown to the Lyric Theater. Her','bicycle has not been found.'].forEach((s,i)=>c.fillText(s,12,156+i*15));c.restore();pin(130,44,'#c83a2a');
 // 1991: newsprint still white
 c.save();c.translate(262,52);c.rotate(.03);c.fillStyle='#ecebe2';c.fillRect(0,0,214,220);c.fillStyle='#1a1a1a';c.font='bold 19px Arial';c.fillText('BOY STILL MISSING',10,30);c.font='11px Arial';c.fillText('THE COURIER  ·  AUG. 30, 1991',10,48);
 c.fillStyle='#8a8a86';c.fillRect(12,58,64,80);c.fillStyle='#ecebe2';c.beginPath();c.arc(44,90,16,0,7);c.fill();c.fillStyle='#1a1a1a';c.font='12px Arial';['Daniel “Danny”','Whitcomb, 12, was last','seen riding a green','bicycle on Mill St.','the evening of Aug. 21.'].forEach((s,i)=>c.fillText(s,84,72+i*15));
 ['Volunteers have searched the creek','and the old rail yard.'].forEach((s,i)=>c.fillText(s,12,156+i*15));c.restore();pin(372,58,'#2a5ac8');
 // the third pin: nothing on it but a torn corner of newsprint
 c.save();c.translate(196,300);c.rotate(.5);c.fillStyle='#f2f1ea';c.beginPath();c.moveTo(0,0);c.lineTo(34,4);c.lineTo(22,18);c.lineTo(8,30);c.closePath();c.fill();c.restore();pin(206,306,'#e8c83a');
 // a grocery list, ordinary
 c.save();c.translate(330,300);c.rotate(-.06);c.fillStyle='#f4efd8';c.fillRect(0,0,140,150);c.fillStyle='#3a3aa0';c.font='italic 15px "Comic Sans MS", cursive';['milk','bread','Sanka','liver','peas','film'].forEach((s,i)=>c.fillText(s,14,28+i*21));c.restore();pin(400,302,'#3a8a3a');}
// Mrs. Lange's note to her boy, taped to his wall where he would see it from his bed: pencil, an adult's hand, pressed hard.
function notePage(c,w,h){c.fillStyle='#efe6cc';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,95,50,.10)';c.fillRect(0,0,w,h);c.strokeStyle='rgba(90,120,170,.35)';c.lineWidth=1;for(let y=34;y<h;y+=22){c.beginPath();c.moveTo(8,y);c.lineTo(w-8,y);c.stroke();}
 c.fillStyle='#2b2a2c';c.font='bold 21px "Comic Sans MS", Georgia';c.textAlign='left';
 ['TOMMY —','STAY IN HERE. KEEP THE','LATCH ON. DON’T OPEN IT FOR','ANYBODY. NOT EVEN IF IT','SOUNDS LIKE ME.','',"I’M RIGHT OUTSIDE.",'— MOM'].forEach((t2,i)=>c.fillText(t2,14,30+i*22));
 c.fillStyle='rgba(200,190,160,.6)';c.fillRect(w/2-26,0,52,10);}
function drawingPage(who,year,{faint=false}={}){return (c,w,h)=>{c.fillStyle=faint?'#fbfbf8':year<1980?'#ecdfc0':'#f4f0e4';c.fillRect(0,0,w,h);if(year<1980){c.fillStyle='rgba(120,90,40,.12)';c.fillRect(0,0,w,h);}
 c.lineCap='round';const col=faint?'rgba(70,70,70,.32)':year<1980?'#2a5aa8':'#c83a2a';c.strokeStyle=col;c.fillStyle=col;c.lineWidth=faint?1.4:3;
 // a streetlight, its light; four bikes in a row under it; nobody on them
 c.beginPath();c.moveTo(200,180);c.lineTo(200,40);c.lineTo(170,40);c.stroke();if(!faint){c.fillStyle=year<1980?'rgba(250,210,80,.55)':'rgba(255,220,90,.6)';c.beginPath();c.moveTo(170,44);c.lineTo(120,170);c.lineTo(230,170);c.fill();}
 c.strokeStyle=col;for(let k=0;k<4;k++){const x=40+k*44;c.beginPath();c.arc(x,160,11,0,7);c.stroke();c.beginPath();c.arc(x+24,160,11,0,7);c.stroke();c.beginPath();c.moveTo(x,160);c.lineTo(x+10,142);c.lineTo(x+24,160);c.moveTo(x+10,142);c.lineTo(x+20,142);c.stroke();}
 c.fillStyle=col;if(faint){c.font='13px Arial';c.fillText('2011',12,36);}else{c.font='bold 15px "Comic Sans MS", sans-serif';c.fillText(who,12,24);c.fillText(String(year),12,42);}};}
export const LANGE_PAGES={courier:courierPage,board:boardPage,drawing:drawingPage};

export function createLangeHouse({W=LANGE.W,D=LANGE.D,F=LANGE.F,doorX=LANGE.doorX,outside=null}={}){
 const g=new THREE.Group();g.name='c7-lange-house';const B=createBuild(g),{K}=B,{F:FN}=createFurniture();const hw=W/2,hd=D/2,t=.12,H=LANGE.H;
 const wallM=finish('rose',0xf2e4cd),hallM=finish('fern',0xcdd3be);
 const boards=finish('oak',0xcdac88),lino=finish('tile',0xd6cbab),tile=finish('tile',0xd8e0d4);
 dressLange(g,{F,W,D,H});
 const duskView=paper(256,256,(c,w,h)=>{
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#263b4a');sky.addColorStop(.7,'#6d797b');sky.addColorStop(1,'#3e4c4b');c.fillStyle=sky;c.fillRect(0,0,w,h);
  c.fillStyle='#24322f';for(let i=0;i<15;i++){const x=i*21-15,y=159+Math.sin(i*2.7)*22;c.beginPath();c.ellipse(x,y,18+Math.sin(i)*6,32,0,0,Math.PI*2);c.fill();c.fillRect(x-2,y,4,120);}
  c.fillStyle='#293738';c.beginPath();c.moveTo(125,211);c.lineTo(185,168);c.lineTo(254,204);c.lineTo(254,256);c.lineTo(125,256);c.fill();c.fillStyle='#6a756d';c.fillRect(184,214,18,24);
 });
 const duskPane=new THREE.MeshStandardMaterial({map:duskView,color:0xaab5b3,emissive:0x738c96,emissiveMap:duskView,emissiveIntensity:.28,roughness:.29,metalness:.04});duskPane.name='c7-lange-dusk-pane';
 // ---- walls: the outside four (plaster in, the house's paint out), then the rooms -----------------------------------------------
 const ti=outside?.1:t,ex=hw-(outside?.02:0)-ti/2,ez=hd-(outside?.02:0)-ti/2,frontHole=u0=>[[doorX+u0-.5,doorX+u0+.5,0,2.1]];
 B.wall([-ex,-ez],[ex,-ez],{y0:F,y1:F+H,t:ti,m:wallM,holes:frontHole(ex)});B.wall([ex,-ez],[ex,ez],{y0:F,y1:F+H,t:ti,m:wallM});B.wall([ex,ez],[-ex,ez],{y0:F,y1:F+H,t:ti,m:wallM});B.wall([-ex,ez],[-ex,-ez],{y0:F,y1:F+H,t:ti,m:wallM});
 if(outside){const sx=hw-.01,sz=hd-.01;B.wall([-hw,-sz],[hw,-sz],{y0:F,y1:F+H,t:.02,m:outside,holes:frontHole(hw),name:'lange-skin'});B.wall([sx,-hd],[sx,hd],{y0:F,y1:F+H,t:.02,m:outside,name:'lange-skin'});
  B.wall([hw,sz],[-hw,sz],{y0:F,y1:F+H,t:.02,m:outside,name:'lange-skin'});B.wall([-sx,hd],[-sx,-hd],{y0:F,y1:F+H,t:.02,m:outside,name:'lange-skin'});
  // (the doorway's reveal: the wall's thickness, painted, round the opening)
  for(const s of [-1,1])K.slab(g,doorX+s*.5,F+1.05,-hd+.07,.02,2.1,.14,outside);K.slab(g,doorX,F+2.1,-hd+.07,1.0,.02,.14,outside);}
 const iz0=-hd+t,iz1=hd-t,ix0=-hw+t,ix1=hw-t;
 B.wall([0,iz0],[0,.4],{y0:F,y1:F+H,t,m:wallM,holes:[[-2.6-iz0,-1.2-iz0,0,2.1]]});// front room | kitchen (a wide opening)
 B.wall([ix0,.4],[ix1,.4],{y0:F,y1:F+H,t,m:hallM,holes:[[-3.0-ix0,-2.0-ix0,0,2.05],[1.4-ix0,2.4-ix0,0,2.05]]});// the front rooms | the hall
 B.wall([ix0,1.6],[ix1,1.6],{y0:F,y1:F+H,t,m:hallM,holes:[[-3.2-ix0,-2.3-ix0,0,2.05],[-.6-ix0,.2-ix0,0,2.05],[2.4-ix0,3.3-ix0,0,2.05]]});// the hall | the back rooms
 B.wall([-1.6,1.6],[-1.6,iz1],{y0:F,y1:F+H,t,m:wallM});B.wall([1.0,1.6],[1.0,iz1],{y0:F,y1:F+H,t,m:wallM});
 // floors and ceilings
 B.floor(ix0,iz0,0,.4,F+.01,boards);B.floor(0,iz0,ix1,.4,F+.01,lino);B.floor(ix0,.4,ix1,1.6,F+.01,boards);B.floor(ix0,1.6,-1.6,iz1,F+.01,boards);B.floor(-1.6,1.6,1.0,iz1,F+.01,tile);B.floor(1.0,1.6,ix1,iz1,F+.01,boards);
 B.ceiling(ix0,iz0,ix1,iz1,F+H-.06,mat(0xe0dccf,{emissive:0x6a665c,emissiveIntensity:.3}));
 // windows, from inside (dark panes: the street at dusk)
 for(const [x,z,ry] of [[-W*.3,-hd+t+.02,Math.PI],[W*.28,-hd+t+.02,Math.PI],[-hw+t+.02,-3.0,-Math.PI/2],[hw-t-.02,-2.6,Math.PI/2],[-hw+t+.02,3.0,-Math.PI/2],[W*.25,hd-t-.02,0],[-W*.25,hd-t-.02,0]])B.windowAt(x,F+1.45,z,{w:1.0,h:1.15,rot:ry,pane:duskPane,sill:false});
 // ---- doors --------------------------------------------------------------------------------------------------------------------
 const doors={front:B.door(doorX-.47,-ez,{w:.94,h:2.05,rot:0,swing:-1.5,y:F,name:'lange-front',m:mat(0xd8d2c0,{roughness:.6})}),
  // (the bathroom's opens out, into the hall; hinged on the far side from the boy's room)
  bath:B.door(.2,1.6,{w:.8,h:2.03,rot:Math.PI,swing:-1.5,y:F,name:'lange-bath'}),boy:B.door(-3.2,1.6,{w:.9,h:2.03,rot:0,swing:-1.4,y:F,name:'lange-boy'}),
  parents:B.door(2.4,1.6,{w:.9,h:2.03,rot:0,swing:-1.4,y:F,name:'lange-parents'})};
 {const lp=doors.boy.pivot,brass=mat(0xc4a560,{metalness:.75,roughness:.3});K.box(lp,.8,1.78,.032,.02,.05,.01,brass).name='lange-latch-eye';K.box(lp,.8,1.71,.034,.012,.11,.008,brass).name='lange-latch-hook';}
 const solids=[];const put=(o,x,z,{a=0,y=F,solid=null}={})=>{o.position.set(x,y,z);o.rotation.y=a;g.add(o);if(solid)solids.push({x,z,hw:solid[0],hd:solid[1],a:-a,o});return o;};
 // ---- the front room: the console set (on: a test card), the couch, the armchair, a lamp; the Courier and an ashtray --------------
 const tvTex=paper(256,192,(c,w,h)=>{c.fillStyle='#202428';c.fillRect(0,0,w,h);const bars=['#c8c8c8','#c8c800','#00c8c8','#00c800','#c800c8','#c80000','#0000c8'];bars.forEach((b,i)=>{c.fillStyle=b;c.fillRect(i*w/7,0,w/7+1,h*.66);});
  c.fillStyle='#e8e8e8';c.font='bold 18px Arial';c.textAlign='center';c.fillText('WOHT  CHANNEL 9',w/2,h*.82);c.font='13px Arial';c.fillText('PLEASE STAND BY',w/2,h*.94);});
 const tvScreen=new THREE.MeshStandardMaterial({color:0x111418,emissive:0xffffff,emissiveIntensity:.55,emissiveMap:tvTex,map:tvTex,roughness:.2});tvScreen.name='c7-lange-tv';
 put(FN.console({screen:tvScreen}),-5.45,-1.8,{a:-Math.PI/2,solid:[.65,.25]});
 const couch=put(FN.couch({w:2.0,m:mat(0x6a7a5a,{},'textile')}),-2.55,-1.8,{a:Math.PI/2,solid:[1.0,.45]});
 const coffee=put(FN.coffee({w:1.0}),-3.9,-1.8,{a:Math.PI/2,solid:[.5,.28]});put(FN.rug({w:2.6,d:1.8,c:0x7a4a3a}),-3.9,-1.8,{a:Math.PI/2});
 const arm=put(FN.armchair({m:mat(0x8a6a4a,{},'textile')}),-4.75,-3.45,{a:2.7,solid:[.43,.4]});
 put(FN.lamp({lit:true}),-5.5,-3.85,{solid:[.18,.18]});
 const courierTex=paper(512,680,courierPage);
 K.plane(g,-3.82,F+.425,-1.62,.3,.4,new THREE.MeshStandardMaterial({map:courierTex,color:courierTex?0xffffff:0xe8dcbc,roughness:.9}),{rx:-Math.PI/2,ry:.3,name:'lange-courier'});
 // the ashtray, and the cigarette in it still going
 K.cyl(g,-4.1,F+.43,-2.05,.07,.02,mat(0x8a9a9a,{roughness:.3,metalness:.4}));const cig=K.box(g,-4.08,F+.445,-2.05,.07,.008,.008,mat(0xf0ece0));cig.rotation.y=.4;
 const ember=K.box(g,-4.045,F+.445,-2.065,.008,.009,.009,new THREE.MeshBasicMaterial({color:0xff6a2a}));ember.name='lange-ember';
 // ---- the kitchen: the table set for three, one plate untouched (still warm), a boy's cap on his chair; the phone and its board
 const TB={x:3.2,z:-2.3};put(FN.table({w:1.4,d:.9,m:mat(0xd8d0b8,{},'timber')}),TB.x,TB.z,{solid:[.7,.45]});
 for(const [x,z,a] of [[TB.x,TB.z-.75,0],[TB.x,TB.z+.75,Math.PI],[TB.x-1.0,TB.z,-Math.PI/2],[TB.x+1.0,TB.z,Math.PI/2]])put(FN.chair({m:mat(0xb88a5c,{},'timber')}),x,z,{a,solid:[.22,.21]});
 const dinner=new THREE.Group();dinner.name='lange-dinner';g.add(dinner);
 for(const [dx,dz,full] of [[0,-.28,0],[0,.28,1],[-.45,0,0]]){K.cyl(dinner,TB.x+dx,F+.76,TB.z+dz,.12,.012,mat(0xf2eee2));if(full){K.cyl(dinner,TB.x+dx-.03,F+.78,TB.z+dz,.05,.03,mat(0x7a4a2a));K.cyl(dinner,TB.x+dx+.04,F+.775,TB.z+dz+.02,.04,.02,mat(0x5a8a3a));K.cyl(dinner,TB.x+dx+.14,F+.82,TB.z+dz+.1,.03,.11,mat(0xf4f2ea,{roughness:.2}));}
  else{K.cyl(dinner,TB.x+dx+.02,F+.775,TB.z+dz,.04,.012,mat(0x7a4a2a));const f=K.box(dinner,TB.x+dx+.12,F+.772,TB.z+dz-.05,.012,.004,.16,mat(0xb8b8b0,{metalness:.7}));f.rotation.y=.6;}}
 K.cyl(dinner,TB.x+.4,F+.8,TB.z,.11,.08,mat(0xc8b890,{roughness:.4}));// the dish
 const cap=new THREE.Group();cap.name='lange-cap';{const blue=mat(0x1a3a7a,{},'textile'),crown=new THREE.Mesh(new THREE.SphereGeometry(.1,16,10,0,Math.PI*2,0,Math.PI/2),blue);crown.scale.set(1,.85,1.1);cap.add(crown);
  const bill=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.008,16,1,false,-Math.PI*.35,Math.PI*.7),blue);bill.position.set(0,.004,-.07);bill.scale.set(1,1,1.2);cap.add(bill);K.box(cap,0,.07,-.085,.06,.035,.004,mat(0xe8e4d8));}put(cap,TB.x,TB.z+.8,{y:F+.47});
 put(FN.counter({w:2.4}),hw-t-.33,-2.9,{a:Math.PI/2,solid:[1.2,.31]});put(FN.stove({}),hw-t-.33,-1.15,{a:Math.PI/2,solid:[.38,.33]});put(FN.fridge({c:0xd8e4d8}),hw-t-.36,-.15,{a:Math.PI/2,solid:[.38,.35]});
 const phone=new THREE.Group();phone.name='lange-phone';K.box(phone,0,0,0,.12,.2,.06,mat(0xd8c8a0));const handset=K.box(phone,0,.02,.045,.05,.18,.04,mat(0xd8c8a0));K.cyl(phone,0,-.2,.06,.008,.3,mat(0xd8c8a0));put(phone,.1,-3.55,{y:F+1.45,a:Math.PI/2});
 const boardTex=paper(512,420,boardPage);K.box(g,.075,F+1.5,-2.95,.03,.42,.5,mat(0x6a4a2a));K.plane(g,.095,F+1.5,-2.95,.48,.394,new THREE.MeshStandardMaterial({map:boardTex,color:boardTex?0xffffff:0xb48a5a,roughness:.9}),{ry:Math.PI/2,name:'lange-board'});
 const cal=paper(256,320,(c,w,h)=>{c.fillStyle='#f4f0e4';c.fillRect(0,0,w,h);c.fillStyle='#3a6a8a';c.fillRect(0,0,w,120);c.fillStyle='#f4f0e4';c.font='bold 26px Georgia';c.textAlign='center';c.fillText('LANGE FUEL & OIL',w/2,70);
  c.fillStyle='#1a1a1a';c.font='bold 30px Georgia';c.fillText('OCTOBER  1983',w/2,160);c.font='14px Arial';for(let k=0;k<31;k++){const x=22+(k%7)*32,y=196+Math.floor(k/7)*26;c.fillText(String(k+1),x+10,y);}});
 K.plane(g,.07,F+1.6,-.6,.28,.35,new THREE.MeshStandardMaterial({map:cal,color:cal?0xffffff:0xf4f0e4,roughness:.9}),{ry:Math.PI/2,name:'lange-calendar'});
 // ---- the hall: a narrow table with a lamp on it against the back wall; a picture by the bathroom door; the light under that door
 const hallT=new THREE.Group();hallT.name='lange-hall-table';K.box(hallT,0,.38,0,.9,.04,.3,mat(0x5a3a26,{},'timber'));for(const [x,z] of [[-.4,-.12],[.4,-.12],[-.4,.12],[.4,.12]])K.box(hallT,x,.18,z,.03,.36,.03,mat(0x5a3a26,{},'timber'));
 const hallLamp=new THREE.Group();K.cyl(hallLamp,0,.06,0,.07,.12,mat(0x8a8a6a));K.cyl(hallLamp,0,.24,0,.13,.16,mat(0xf0e4c8,{emissive:0xffd8a0,emissiveIntensity:.35}),{r2:.08});hallLamp.position.set(-.25,.4,0);hallT.add(hallLamp);
 K.cyl(hallT,.22,.43,0,.09,.05,mat(0xc8b890));put(hallT,-1.45,1.4,{solid:[.45,.15]});
 const pic=new THREE.Group();pic.name='lange-picture';K.slab(pic,0,0,0,.42,.32,.02,mat(0x3a2a1c));K.plane(pic,0,0,.012,.36,.26,wallPrintArt('mill'),{});pic.rotation.order='YXZ';put(pic,.62,1.525,{y:F+1.55,a:Math.PI});
 const glowTex=paper(64,32,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,235,200,0)');gr.addColorStop(.55,'rgba(255,228,180,.55)');gr.addColorStop(1,'rgba(255,236,200,1)');c.fillStyle=gr;c.fillRect(0,0,w,h);const sd=c.createLinearGradient(0,0,w,0);sd.addColorStop(0,'rgba(0,0,0,1)');sd.addColorStop(.12,'rgba(0,0,0,0)');sd.addColorStop(.88,'rgba(0,0,0,0)');sd.addColorStop(1,'rgba(0,0,0,1)');c.globalCompositeOperation='destination-out';c.fillStyle=sd;c.fillRect(0,0,w,h);});
 const feetTex=paper(64,32,(c,w,h)=>{c.clearRect(0,0,w,h);for(const x of [20,44]){const r=c.createRadialGradient(x,h-4,1,x,h-4,13);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=r;c.fillRect(0,0,w,h);}});
 const strip=K.plane(g,-.2,F+.013,1.43,.78,.22,new THREE.MeshBasicMaterial({color:0xffffff,map:glowTex,transparent:true,opacity:.9,depthWrite:false}),{rx:-Math.PI/2,name:'lange-bath-light'});
 const feet=K.plane(g,-.2,F+.014,1.45,.34,.17,new THREE.MeshBasicMaterial({color:0xffffff,map:feetTex,transparent:true,opacity:0,depthWrite:false}),{rx:-Math.PI/2,name:'lange-bath-feet'});
 // ---- the boy's room: the bed along the wall, a desk, the chair pulled out; over the foot of the bed three drawings, taped up ---------
 put(FN.bed({w:.95,l:1.95,cover:0x5a6a3a}),-5.35,3.08,{solid:[.5,1.0]});put(FN.desk({w:1.0}),-1.98,3.45,{a:Math.PI/2,solid:[.5,.3]});
 const chair=put(FN.chair({}),-2.95,2.5,{a:2.3,solid:[.22,.21]});
 K.box(g,-5.2,F+.62,3.55,.22,.08,.2,mat(0x9a6a3a)).rotation.y=.4;// a ball glove on the bed
 const DRW=[{tex:paper(256,192,drawingPage('R.A.C.',1966)),x:-4.4},{tex:paper(256,192,drawingPage('D.W.',1991)),x:-4.85},{tex:paper(256,192,drawingPage('',2011,{faint:true})),x:-5.3}];// (left to right as you face them: 1966, 1991, 2011)
 for(const d of DRW){const p2=K.plane(g,d.x,F+1.45,iz1-.012,.36,.27,new THREE.MeshStandardMaterial({map:d.tex,color:d.tex?0xffffff:0xf4f0e4,roughness:.9}),{ry:Math.PI,name:'lange-drawing'});p2.rotation.z=(d.x+4.85)*.07;}
 // (her note, on the wall across from his door, where he would see it from the bed: she was keeping him in here, from it)
 {const nt=paper(256,192,notePage);K.plane(g,-2.75,F+1.18,iz1-.012,.27,.2,new THREE.MeshStandardMaterial({map:nt,color:nt?0xffffff:0xefe6cc,roughness:.9}),{ry:Math.PI,name:'lange-note'});}
 // a little lamp on the desk (the chapter's light stands at it)
 K.cyl(g,-1.85,F+.76+.12,3.75,.06,.24,mat(0x3a5a3a));K.cyl(g,-1.85,F+1.04,3.75,.11,.14,mat(0xf0e4c8,{emissive:0xffd8a0,emissiveIntensity:.4}),{r2:.07});
 // ---- the bathroom: a tub, a sink (what is in there stands between them) --------------------------------------------------------
 K.box(g,-.3,F+.28,iz1-.42,1.5,.56,.72,mat(0xe8ece8,{roughness:.3}));solids.push({x:-.3,z:iz1-.42,hw:.75,hd:.36,a:0});K.box(g,.6,F+.42,2.3,.4,.84,.35,mat(0xe8ece8,{roughness:.3}));solids.push({x:.6,z:2.3,hw:.2,hd:.18,a:0});
 // ---- light: the lamp in the front room, the kitchen's ceiling light, the boy's desk lamp, the bathroom (the chapter's points stand here)
 const lamps={front:{x:-5.2,y:F+1.55,z:-3.6},kitchen:{x:3.2,y:F+2.6,z:-2.3},boy:{x:-1.95,y:F+1.2,z:3.6},bath:{x:-.3,y:F+2.4,z:2.8},tv:{x:-4.25,y:F+.95,z:-1.8},hall:{x:-1.45,y:F+1.0,z:1.3}};
 K.cyl(g,lamps.kitchen.x,F+H-.12,lamps.kitchen.z,.2,.08,mat(0xf2eadc,{emissive:0xffe6b8,emissiveIntensity:.8}));
 // ---- what is struck (each slides and turns from where it stood; its solid goes with it) ----------------------------------------------
 const props={hall:{o:hallT},couch:{o:couch},coffee:{o:coffee},arm:{o:arm},chair:{o:chair}};
 for(const P of Object.values(props)){P.rest={x:P.o.position.x,z:P.o.position.z,a:P.o.rotation.y};P.solid=solids.find(s=>s.o===P.o);P.hit=null;}
 // ---- where you can stand (rooms; doorways reaching well into the rooms either side) -----------------------------------------------
 const R={front:{x0:ix0,x1:0-t/2,z0:iz0,z1:.4-t/2},kitchen:{x0:t/2,x1:ix1,z0:iz0,z1:.4-t/2},hall:{x0:ix0,x1:ix1,z0:.4+t/2,z1:1.6-t/2},boy:{x0:ix0,x1:-1.6-t/2,z0:1.6+t/2,z1:iz1},bath:{x0:-1.6+t/2,x1:1.0-t/2,z0:1.6+t/2,z1:iz1}};
 const gaps=[{x0:-.5,x1:.5,z0:-2.55,z1:-1.25},{x0:-2.95,x1:-2.05,z0:-.2,z1:1.0},{x0:1.45,x1:2.35,z0:-.2,z1:1.0},{x0:-3.15,x1:-2.35,z0:1.0,z1:2.2},{x0:-.55,x1:.15,z0:1.0,z1:2.2,bath:true},{x0:doorX-.42,x1:doorX+.42,z0:-hd-1.0,z1:-hd+.6,front:true}];
 const inR=(x,z,b,r)=>x>b.x0+r&&x<b.x1-r&&z>b.z0+r&&z<b.z1-r;
 // (the front door, standing open, is in the way of anyone hugging the wall beside the doorway inside)
 const leaf={x:doorX-.44,z:-ez+.47,hw:.05,hd:.47,a:0};
 function walkable(x,z,r=.28){const room=[R.front,R.kitchen,R.hall,R.boy].some(b=>inR(x,z,b,r))||(doors.bath.open>.6&&inR(x,z,R.bath,r))||gaps.some(q=>(!q.bath||doors.bath.open>.6)&&(!q.front||doors.front.open>.5)&&x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1);
  if(!room)return false;if(doors.front.open>.5&&inBox(x,z,leaf,r))return false;return !solids.some(b=>inBox(x,z,b,r));}
 // the floor: the house floor inside; the steps up from the walk at the front door
 const floorAt=(x,z)=>{if(z>-hd)return F;return F*clamp((z+hd+1.1)/.75,0,1);};
 const inside=(x,z,pad=0)=>Math.abs(x)<hw+pad&&Math.abs(z)<hd+pad;
 const room=(x,z)=>inR(x,z,R.front,-.05)?'front':inR(x,z,R.kitchen,-.05)?'kitchen':inR(x,z,R.hall,-.05)?'hall':inR(x,z,R.boy,-.05)?'boy':inR(x,z,R.bath,-.05)?'bath':null;
 // ---- what the chapter makes happen ----------------------------------------------------------------------------------------------
 const ST={t:0,bulge:0,crackT:-1,picT:-1,tvOff:false,feet:0,feetX:-.2,feetGo:null,smoke:true,steam:true};
 const picRest={x:pic.position.x,y:pic.position.y,z:pic.position.z};
 // wisps: the cigarette's smoke, the steam off the one plate (a few soft sprites that rise and thin out)
 const wispTex=paper(32,32,(c,w,h)=>{const r=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=r;c.fillRect(0,0,w,h);});
 const wisps=[];const wisp=(x,y,z,{n=5,rise=.5,life=3.2,size=.08,color=0xd8d8d0,op=.22,drift=.04,key})=>{for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:wispTex,color,transparent:true,opacity:0,depthWrite:false}));s.scale.setScalar(size);g.add(s);wisps.push({s,x,y,z,rise,life,size,op,drift,key,ph:i/n*life});}};
 wisp(-4.045,F+.46,-2.065,{n:6,rise:.55,life:3.6,size:.07,op:.2,drift:.05,key:'smoke'});wisp(TB.x,F+.82,TB.z+.28,{n:4,rise:.28,life:2.4,size:.1,color:0xf0f0ea,op:.12,drift:.02,key:'steam'});
 function strain(v){ST.bulge=v;}// the shut bathroom door, pushed on from inside (0..1)
 function shove(){ST.crackT=0;}// pushed open an inch, hard, and pulled shut again
 function pictureFalls(){ST.picT=0;}
 function feetAt(on,x=-.2){ST.feet=on?1:0;ST.feetX=x;}// a shadow across the light under the door (where it stands behind it)
 function feetTo(x,sec=1.2){ST.feetGo={from:ST.feetX,to:x,t:0,sec};}
 function bathLight(on){strip.visible=on;feet.visible=on;}
 // a thing struck: it slides dist along dir (a unit vector in this frame) and turns by spin; tip: falls over onto its side
 function strike(name,dir,{dist=.5,spin=.5,tip=0}={}){const P=props[name];if(!P)return;P.hit={t:0,dir,dist,spin,tip};}
 function update(dt){ST.t+=dt;
  // the bathroom door: shaking on its latch while it is pushed on; the shove (an inch open, and back)
  const bp=doors.bath.pivot,rest=Math.PI-1.5*doors.bath.open;
  if(ST.crackT>=0){ST.crackT+=dt;const u=ST.crackT,c=u<.12?u/.12:u<.4?1:Math.max(0,1-(u-.4)/.15);bp.rotation.y=rest-.09*c;if(u>.6)ST.crackT=-1;}
  else if(doors.bath.open<.05)bp.rotation.y=rest+Math.sin(ST.t*37)*.012*ST.bulge+Math.sin(ST.t*11)*.006*ST.bulge;
  if(ST.picT>=0&&ST.picT<1.4){ST.picT+=dt;const u=clamp(ST.picT/.42,0,1);pic.position.set(picRest.x,picRest.y-(picRest.y-F-.06)*u*u,picRest.z-.1*u);pic.rotation.set(-u*1.4,Math.PI,u*.35);}
  if(ST.feetGo){const G=ST.feetGo;G.t+=dt;ST.feetX=G.from+(G.to-G.from)*smooth(G.t/G.sec);if(G.t>=G.sec)ST.feetGo=null;}
  feet.position.x=ST.feetX;feet.material.opacity+=((ST.feet?.72:0)-feet.material.opacity)*Math.min(1,dt*6);
  for(const P of Object.values(props)){const H2=P.hit;if(!H2||H2.t>=.9)continue;H2.t+=dt;const u=clamp(H2.t/.28,0,1),e=1-(1-u)*(1-u),r=P.rest;
   P.o.position.x=r.x+H2.dir.x*H2.dist*e;P.o.position.z=r.z+H2.dir.z*H2.dist*e;P.o.rotation.y=r.a+H2.spin*e;
   P.o.rotation.z=H2.tip?H2.tip*smooth((H2.t-.08)/.32):Math.sin(H2.t*30)*.05*(1-u);if(H2.tip)P.o.position.y=F+.07*Math.sin(Math.PI*clamp((H2.t-.05)/.35,0,1));
   if(P.solid){P.solid.x=P.o.position.x;P.solid.z=P.o.position.z;P.solid.a=-P.o.rotation.y;}}
  if(ST.tvOff)tvScreen.emissiveIntensity=Math.max(0,tvScreen.emissiveIntensity-dt*3);else tvScreen.emissiveIntensity=.5+.08*Math.sin(ST.t*9.1)*Math.sin(ST.t*2.3);
  ember.material.color.setHex(Math.sin(ST.t*2.1)>.2?0xff7a3a:0xd8501e);
  for(const w of wisps){const on=ST[w.key];const u=((ST.t+w.ph)%w.life)/w.life;w.s.position.set(w.x+Math.sin(ST.t*.9+w.ph*3)*w.drift*u,w.y+w.rise*u,w.z+Math.cos(ST.t*.7+w.ph*2)*w.drift*u);
   w.s.scale.setScalar(w.size*(1+2.2*u));w.s.material.opacity=on?w.op*Math.sin(Math.PI*u):Math.max(0,w.s.material.opacity-dt);}}
 function reset(){Object.assign(ST,{bulge:0,crackT:-1,picT:-1,tvOff:false,feet:0,feetX:-.2,feetGo:null,smoke:true,steam:true});tvScreen.emissiveIntensity=.55;pic.position.set(picRest.x,picRest.y,picRest.z);pic.rotation.set(0,Math.PI,0);
  for(const P of Object.values(props)){P.hit=null;P.o.position.set(P.rest.x,F,P.rest.z);P.o.rotation.set(0,P.rest.a,0);if(P.solid){P.solid.x=P.rest.x;P.solid.z=P.rest.z;P.solid.a=-P.rest.a;}}
  feet.material.opacity=0;feet.position.x=-.2;bathLight(true);doors.front.set(0);doors.boy.set(.9);doors.bath.set(0);doors.parents.set(0);}
 reset();
 const spots={door:{x:doorX,z:-hd-1.1},inFront:{x:doorX,z:-hd+1.2},tv:{x:-5.2,y:F+.95,z:-1.8},courier:{x:-3.82,y:F+.43,z:-1.62},ashtray:{x:-4.1,y:F+.44,z:-2.05},dinner:{x:TB.x,y:F+.8,z:TB.z+.1},cap:{x:TB.x,y:F+.55,z:TB.z+.8},
  phone:{x:.13,y:F+1.45,z:-3.55},board:{x:.1,y:F+1.5,z:-2.95},calendar:{x:.08,y:F+1.6,z:-.6},drawings:{x:-4.85,y:F+1.45,z:iz1-.02},note:{x:-2.75,y:F+1.18,z:iz1-.02},bathDoor:{x:-.2,y:F+1.1,z:1.6},hallStand:{x:-.4,z:1.0},parentsDoor:{x:2.85,y:F+1.0,z:1.6},
  boyStand:{x:-4.45,z:3.0},boyDoor:{x:-2.75,z:1.6},frontRoom:{x:-1.4,z:-2.6},kitchen:{x:1.6,z:-2.2},
  // the way it comes: out of the bathroom, along the hall (the table), and into the boy's room (the chair) or the front room (the couch)
  bathIn:{x:-.2,z:2.55},bathOut:{x:-.2,z:1.75},hallMid:{x:-.75,z:1.05},hallTable:{x:-1.45,z:1.12},hallWest:{x:-2.55,z:1.05},boyIn:{x:-2.8,z:1.85},boyStop:{x:-3.15,z:2.45},
  frontGap:{x:-2.5,z:.3},frontIn:{x:-2.25,z:-.45},frontStop:{x:-1.55,z:-1.55}};
 // (the moving parts the court must not bake into its own meshes)
 const moving=[doors.front.pivot,doors.bath.pivot,doors.boy.pivot,doors.parents.pivot,pic,hallT,couch,coffee,arm,chair,cap,strip,feet,ember,...wisps.map(w=>w.s)];
 const pages={courier:courierTex,board:boardTex,drawings:DRW.map(d=>d.tex)};
 return {g,doors,spots,walkable,floorAt,inside,room,R,solids,ST,props,update,reset,strain,shove,pictureFalls,feetAt,feetTo,bathLight,strike,lamps,tvScreen,pages,moving,handset,F,W,D,hw,hd,doorX};
}
