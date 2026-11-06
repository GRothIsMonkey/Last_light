// Chapter Eight: paper and pictures, drawn once on canvases (null without a canvas, as in the tests): Sam's torn-out
// page; the 1959 plan of the court's mouth and the 2009 map, for the field; Roy Mason's 1958 sales slip and the
// township's licence card for Meadowlark No. 0417 (A. ROWAN); her school picture; Danny Whitcomb's 1991 flyer; the
// 1979 log page in cell four; the drawdown procedure; and the 1958 observation film, frame by frame.
import * as THREE from './three.module.js';
import {paper} from './chapter6-kit.js';

const ink='#22201c',faded='#5a5348',blue='#2c3e74',red='#8a2a22';
function lines(c,list,x,y,lh,font){c.font=font;for(let i=0;i<list.length;i++)c.fillText(list[i],x,y+i*lh);}
function aged(c,w,h,base='#ece2c6',k=.12){c.fillStyle=base;c.fillRect(0,0,w,h);c.fillStyle=`rgba(120,90,40,${k})`;c.fillRect(0,0,w,h);for(let i=0;i<500;i++){c.fillStyle=`rgba(90,70,40,${Math.random()*.06})`;c.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*3,2+Math.random()*3);}}
export const PAGES8={
 // Sam's page, torn from his notebook on Thursday: Line Four's bend drawn round an empty box, MH-12, a question
 sheet:{w:512,h:680,draw(c,w,h){c.fillStyle='#f6f3e8';c.fillRect(0,0,w,h);c.strokeStyle='rgba(80,110,170,.4)';for(let y=60;y<h;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  c.fillStyle=ink;c.font='bold 26px "Courier New", monospace';c.fillText('LINE 4',40,80);c.strokeStyle=ink;c.lineWidth=4;c.beginPath();c.moveTo(60,600);c.lineTo(60,420);c.bezierCurveTo(60,300,300,300,300,200);c.lineTo(300,110);c.stroke();
  c.setLineDash([10,8]);c.strokeRect(150,300,190,150);c.setLineDash([]);c.font='22px "Courier New", monospace';c.fillText('?',236,385);c.fillText('MH-12 (1959)',350,330);c.beginPath();c.arc(338,322,9,0,7);c.stroke();
  lines(c,['WHY IS THERE A JUNCTION','NOBODY DREW?','','IT BENDS AROUND IT.','THE DOGS SAT DOWN HERE.','UNDER THE COURT.'],90,500,28,'20px "Courier New", monospace');
  c.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=7)c.fillRect(0,y,7+Math.sin(y)*3,4);}},
 // the 1959 plan of Old Mill Court's mouth (where it met Oak Hollow Drive): the curbs, the oak, MH-12
 plan1959:{w:900,h:680,draw(c,w,h){aged(c,w,h,'#dfe6ea',.05);c.strokeStyle='#3a4e7a';c.fillStyle='#3a4e7a';c.lineWidth=2;
  c.font='bold 20px "Courier New", monospace';c.fillText('OAK HOLLOW TWP. — OLD MILL CT. — ISOLATION WORKS ACCESS — SHEET 2 OF 4 — 1959',24,34);
  c.lineWidth=3;c.beginPath();c.moveTo(80,620);c.lineTo(380,620);c.lineTo(380,250);c.lineTo(820,250);c.stroke();c.beginPath();c.moveTo(80,520);c.lineTo(280,520);c.lineTo(280,150);c.lineTo(820,150);c.stroke();
  c.font='18px "Courier New", monospace';c.fillText('OAK HOLLOW DR.',90,575);c.fillText('OLD MILL CT.',560,210);
  c.beginPath();c.arc(470,330,34,0,7);c.stroke();c.fillText('EXIST. OAK',505,322);c.fillText('TO REMAIN',505,342);
  c.lineWidth=2;c.beginPath();c.arc(410,215,12,0,7);c.stroke();c.beginPath();c.moveTo(398,215);c.lineTo(422,215);c.moveTo(410,203);c.lineTo(410,227);c.stroke();c.font='bold 18px "Courier New", monospace';c.fillText('MH-12',386,190);
  c.font='16px "Courier New", monospace';c.fillText('18\'-0" S.W. OF OAK',426,262);c.setLineDash([6,6]);c.beginPath();c.moveTo(410,215);c.lineTo(470,330);c.stroke();c.setLineDash([]);
  c.fillText('VENT (CAPPED)',300,120);c.beginPath();c.arc(292,138,6,0,7);c.stroke();c.fillText('LINE 4 (EXIST. 1958) →',600,450);c.beginPath();c.moveTo(560,470);c.bezierCurveTo(500,520,430,560,380,640);c.stroke();}},
 // the 2009 township map of the same corner: the cul-de-sac, the lookout, the oak, the bench, the fence; no court
 map2009:{w:900,h:680,draw(c,w,h){c.fillStyle='#f3f1e6';c.fillRect(0,0,w,h);c.fillStyle=ink;c.font='bold 20px Arial';c.fillText('OAK HOLLOW TOWNSHIP — 2009 — SHEET 14',24,34);
  c.fillStyle='#d8d4c4';c.beginPath();c.moveTo(80,620);c.lineTo(380,620);c.lineTo(380,480);c.arc(330,420,95,1.0,-1.0,true);c.lineTo(280,520);c.lineTo(80,520);c.closePath();c.fill();
  c.fillStyle='#bcd2a4';c.fillRect(380,120,440,420);c.fillStyle='#4f7a3a';c.beginPath();c.arc(470,330,34,0,7);c.fill();c.fillStyle=ink;c.font='16px Arial';c.fillText('OAK',455,384);c.fillText('LOOKOUT (TWP. OPEN SPACE)',520,520);
  c.fillRect(420,240,60,10);c.fillText('BENCH',420,232);c.strokeStyle='#6a6a6a';c.setLineDash([4,4]);c.strokeRect(392,130,420,400);c.setLineDash([]);c.fillText('OAK HOLLOW DR.',90,575);}},
 // Mason Cycle & Sport, 214 Main St., June 1958: a carbon sales slip
 receipt:{w:520,h:700,draw(c,w,h){aged(c,w,h,'#f2ebd6',.14);c.fillStyle=ink;c.textAlign='center';c.font='bold 30px Georgia';c.fillText('MASON CYCLE & SPORT',w/2,64);c.font='18px Georgia';c.fillText('214 MAIN ST. · OAK HOLLOW · PHONE 3-4417',w/2,92);
  c.fillRect(30,108,w-60,2);c.textAlign='left';c.font='20px "Courier New", monospace';
  lines(c,['DATE  June 14, 1958','SOLD TO  Annie Rowan','ADDRESS  Mill St.','','1  MEADOWLARK  (green)      34.95','   bell, rack, reflector','   TWP. LICENCE NO. 0417     .50','','           TOTAL          $35.45','','PAID IN FULL — THANK YOU','','First one out the door. — R.M.'],40,150,34,'20px "Courier New", monospace');
  c.fillStyle=blue;c.font='italic 24px "Brush Script MT", cursive';c.fillText('Roy Mason',300,640);}},
 // the township's licence card, 1958: who No. 0417 was issued to
 registration:{w:640,h:400,draw(c,w,h){aged(c,w,h,'#e6dcc0',.1);c.strokeStyle=ink;c.lineWidth=3;c.strokeRect(14,14,w-28,h-28);c.fillStyle=ink;c.font='bold 26px Georgia';c.fillText('TOWNSHIP OF OAK HOLLOW — BICYCLE LICENCE',36,62);
  lines(c,['NO.   0417','ISSUED  6 / 14 / 58','OWNER  ROWAN, A.  (ANNIE)    AGE 12','MAKE   MEADOWLARK   COLOR  GREEN','DEALER  MASON CYCLE & SPORT','','NOTE: owner missing 8/2/58 — see Chief Hollis'],40,112,36,'22px "Courier New", monospace');
  c.fillStyle=red;c.font='bold 28px Georgia';c.save();c.translate(470,330);c.rotate(-.18);c.fillText('LAPSED 1959',0,0);c.restore();}},
 // her school picture, 1957–58, the name written on the back in pencil (front and back on one card)
 annie:{w:512,h:680,draw(c,w,h){aged(c,w,h,'#d8cfb8',.18);const g=c.createLinearGradient(0,0,0,h*.7);g.addColorStop(0,'#8a8f94');g.addColorStop(1,'#5a5e62');c.fillStyle=g;c.fillRect(40,40,w-80,420);
  c.fillStyle='#d8b494';c.beginPath();c.ellipse(w/2,250,82,104,0,0,7);c.fill();c.fillStyle='#4a3626';c.beginPath();c.ellipse(w/2,200,104,92,0,Math.PI,0);c.fill();c.fillRect(w/2-104,200,30,120);c.fillRect(w/2+74,200,30,120);
  c.fillStyle='#2a2422';c.beginPath();c.arc(w/2-30,250,7,0,7);c.arc(w/2+30,250,7,0,7);c.fill();c.strokeStyle='#8a4a3a';c.lineWidth=3;c.beginPath();c.arc(w/2,292,24,.2,Math.PI-.2);c.stroke();c.fillStyle='#e8e4dc';c.fillRect(w/2-110,350,220,110);
  c.fillStyle=ink;c.font='italic 30px Georgia';c.textAlign='center';c.fillText('Annie Rowan — 6th grade',w/2,540);c.font='22px Georgia';c.fillText('Mill Street School, 1957–58',w/2,580);c.font='18px Georgia';c.fillStyle=faded;c.fillText('(pinned to the board in the site office, 1958)',w/2,630);}},
 // Danny Whitcomb's flyer, 1991: the description, the hand
 flyer:{w:520,h:700,draw(c,w,h){c.fillStyle='#f4f2ea';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,100,60,.12)';c.fillRect(0,0,w,h);c.fillStyle=ink;c.textAlign='center';c.font='bold 64px Arial';c.fillText('MISSING',w/2,80);
  c.fillStyle='#7a7e82';c.fillRect(140,110,240,280);c.fillStyle='#caa588';c.beginPath();c.ellipse(w/2,230,70,90,0,0,7);c.fill();c.fillStyle='#3a2a1e';c.beginPath();c.ellipse(w/2,175,80,62,0,Math.PI,0);c.fill();c.fillStyle='#222';c.beginPath();c.arc(w/2-24,226,6,0,7);c.arc(w/2+24,226,6,0,7);c.fill();
  c.fillStyle=ink;c.font='bold 30px Arial';c.fillText('DANIEL "DANNY" WHITCOMB',w/2,436);c.font='22px Arial';lines(c,['Age 12. 4\'11". Brown hair, brown eyes.','Last seen 8/21/91, Mill Street, on a','green bicycle. Blue T-shirt, jean shorts.','IS MISSING THE LAST TWO FINGERS OF','HIS LEFT HAND (1988 accident).','CALL OAK HOLLOW TWP. POLICE  3-1100'],w/2,476,32,'22px Arial');}},
 // cell four, a page from the 1979 Public Works book left on the cot: how it ended for Ruth Ann Carver
 ruth:{w:560,h:700,draw(c,w,h){aged(c,w,h,'#ece4cc',.1);c.strokeStyle='rgba(60,90,140,.3)';for(let y=70;y<h;y+=32){c.beginPath();c.moveTo(20,y);c.lineTo(w-20,y);c.stroke();}c.fillStyle=ink;c.font='bold 22px "Courier New", monospace';c.fillText('O.M.C. ISOLATION — CH. 4 — LOG',24,46);
  lines(c,['8/24/66  CH.4 OCCUPIED. CARVER, R.A. (11).','        ANCHOR READS. BARRIER 3 HOLDS.','6/70    FOOD/WATER BY HATCH. SHE TALKS','        TO THE WALL. ASKS FOR HER MOTHER.','11/74   ANCHOR WEAK. B-3 MOVED 1 IN.','3/12/79 NO RESPONSE. CONNECTION LOST.','        B-3 SHIFTED 2 IN. CH.4 SEALED.','        NO FAMILY CONTACT (PER TWP.)','','  — W. Haskell, Twp. Engr.'],24,96,34,'20px "Courier New", monospace');}},
 // the anchor board (H): the brass tags as they were typed; the 2011 rows left blank
 board:{w:1024,h:512,draw(c,w,h){c.fillStyle='#2f4637';c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<900;i++)c.fillRect(Math.random()*w,Math.random()*h,2,2);c.fillStyle='#e8dcb0';c.font='bold 22px Arial';c.fillText('O.M.C. ISOLATION — ANCHOR POSITIONS — DO NOT OPEN DOORS WHILE READING',24,36);
  const rows=[['CH. 1','A.R.','9/58','CONN. LOST 2/66'],['CH. 4','R.A.C.','8/66','CONN. LOST 3/79'],['CH. 7','E.L. · T.L.','4/74','LOST 6/83'],['CH. 9','—','—','—'],['CH. 14','D.W.','8/91','VACATED 9/91 — BREACH'],['CH. 15','','',''],['CH. 16','','',''],['CH. 17','','','']];
  rows.forEach((r,i)=>{const y=86+i*50,x=24;c.fillStyle='#b89a50';c.fillRect(x,y-26,150,36);c.fillStyle='#1e1a12';c.font='bold 22px "Courier New", monospace';c.fillText(r[0],x+12,y);c.fillStyle='#e8dcb0';c.font='22px "Courier New", monospace';c.fillText(r[1],x+190,y);c.fillText(r[2],x+390,y);c.fillStyle=r[3].includes('LOST')||r[3].includes('BREACH')?'#e08a70':'#e8dcb0';c.fillText(r[3],x+520,y);
   c.strokeStyle='#e8dcb0';c.beginPath();c.arc(x+920,y-8,18,Math.PI,2*Math.PI);c.stroke();});
  c.fillStyle='#e8dcb0';c.font='18px Arial';c.fillText('BARRIER 1  ·  BARRIER 2  ·  BARRIER 3 (ORIGINAL, 1958)',24,h-24);}},
 // the drawdown procedure (Gate Structure No. 2 control room binder): the alternative nobody would use
 procedure:{w:560,h:760,draw(c,w,h){aged(c,w,h,'#f0ead8',.08);c.fillStyle=ink;c.font='bold 24px Georgia';c.fillText('EMERGENCY DRAWDOWN',24,48);c.font='bold 18px Georgia';c.fillText('O.M.C. ISOLATION STRUCTURE (1959) — PROCEDURE 7',24,76);
  lines(c,['1. CLOSE OUTER ROUTES: MAIN GATES 1A / 1B','   (OPERATING BRIDGE); LINE 4 DRAWDOWN GATE','   (GALLERY, NORTH END).','2. OPEN DRAWDOWN PORTS (JUNCTION J, WEST WALL).','   FLOW RUNS LINE TWO TO O.M.C. CENTRAL JCT.','3. AT PLUG PLATFORM: DRIVE OUT LATCH PINS','   A, B, C. PLUG DROPS. CENTRAL JCT. FLOODS','   AND COLLAPSES. RUPTURE ISOLATED.','','NOTE: FATAL TO ANY OCCUPANT OF THE','CHAMBERS. DOES NOT REVERSE.'],24,120,34,'19px "Courier New", monospace');
  c.fillStyle=red;c.font='bold 30px Georgia';c.save();c.translate(70,600);c.rotate(-.12);c.fillText('NOT TO BE OPERATED',0,0);c.fillText('WHILE CHAMBERS OCCUPIED',0,40);c.restore();c.fillStyle=faded;c.font='italic 18px Georgia';c.fillText('— Twp. Engineer, 1959. Approved: no.',24,h-40);}},
};
const cache=new Map();
export function paper8(kind){if(cache.has(kind))return cache.get(kind);const P=PAGES8[kind];const t=P?paper(P.w,P.h,(c,w,h)=>P.draw(c,w,h)):null;cache.set(kind,t);return t;}
// The 1958 observation film, one frame at a time onto the review room's screen (grain, gate weave, a scratch): a chamber
// with ribbed walls, a cot, a small figure; two men in coveralls lift her and carry her out; the far wall bulges and
// cracks and dust comes down; they stop; they carry her back and lay her down; the wall stills. t: seconds into the reel.
export function createFilm(){let cv=null,g=null;try{cv=document.createElement('canvas');cv.width=480;cv.height=360;g=cv.getContext?.('2d')||null;}catch{}
 const tex=g?new THREE.CanvasTexture(cv):null;if(tex)tex.colorSpace=THREE.SRGBColorSpace;const LEN=46;
 function man(x,y,s,lift=0){g.fillStyle='#2a2a2a';g.fillRect(x-9*s,y-62*s,18*s,40*s);g.beginPath();g.arc(x,y-70*s,8*s,0,7);g.fill();g.fillRect(x-8*s,y-22*s,6*s,22*s);g.fillRect(x+2*s,y-22*s,6*s,22*s);g.fillRect(x-14*s,y-58*s+lift,6*s,28*s);g.fillRect(x+8*s,y-58*s+lift,6*s,28*s);}
 function draw(t){if(!g)return;const W=480,Hh=360,jx=Math.sin(t*41)*1.6,jy=Math.cos(t*37)*1.2;g.save();g.fillStyle='#0c0c0c';g.fillRect(0,0,W,Hh);g.translate(jx,jy);
  const fade=Math.min(1,t/2)*Math.min(1,(LEN-t)/1.5);g.globalAlpha=Math.max(0,fade);
  g.fillStyle='#6d6d68';g.fillRect(20,20,W-40,Hh-40);g.fillStyle='#5a5a56';g.fillRect(20,250,W-40,90);// floor
  // the far wall (the barrier): ribs that bulge while she is away from her cot
  const away=t<10?0:t<26?Math.min(1,(t-10)/4):t<34?Math.max(0,1-(t-26)/5):0,shake=away*Math.sin(t*30)*2.5;
  for(let i=0;i<9;i++){const bx=40+i*46,bulge=away*(14+8*Math.sin(i*1.7+t*2))*(1-Math.abs(i-4)/6);g.fillStyle=i%2?'#7a7a74':'#666661';g.fillRect(bx+shake-bulge*.2,40-bulge*.4,38+bulge*.4,200+bulge*.5);}
  if(away>.4){g.strokeStyle='#1c1c1c';g.lineWidth=2;g.beginPath();g.moveTo(200,60);g.lineTo(214,120);g.lineTo(205,170);g.lineTo(226,236);g.stroke();for(let k=0;k<30*away;k++){g.fillStyle='rgba(200,200,190,.5)';g.fillRect(40+((k*97+t*60)%380),40+((k*53+t*120)%200),2,2);}}
  // the cot, and her (a small figure, a white dress): on it, lifted, carried left, stopped, carried back, laid down
  g.fillStyle='#3e3e3a';g.fillRect(250,232,120,14);g.fillRect(256,246,6,20);g.fillRect(358,246,6,20);
  let fx=310,fy=226,lying=1;const P2=t<6?0:t<10?(t-6)/4:t<20?1:t<26?1:t<31?1-(t-26)/5:0;// 0 on the cot .. 1 carried away to the left
  if(t>=6&&t<31){lying=0;fx=310-P2*230;fy=200;man(fx-30,256,1,-8);man(fx+30,256,1,-8);}
  if(t>=31)lying=1;
  g.fillStyle='#e8e8e2';if(lying){g.fillRect(fx-34,fy-8,68,14);g.beginPath();g.arc(fx-40,fy-2,9,0,7);g.fill();}else{g.fillRect(fx-28,fy-6,56,12);g.beginPath();g.arc(fx-32,fy,8,0,7);g.fill();}
  if(t>=31&&t<38){man(fx-60+Math.min(1,(t-31)/2)*-80,256,1);man(fx+60+Math.min(1,(t-31)/2)*80,256,1);}
  g.globalAlpha=1;g.restore();
  // grain, a scratch, the gate, a title card at the start
  for(let i=0;i<260;i++){const v=Math.random()*80+(Math.random()<.5?0:150);g.fillStyle=`rgba(${v},${v},${v},.10)`;g.fillRect(Math.random()*W,Math.random()*Hh,1.5,1.5);}
  g.fillStyle='rgba(230,230,220,.25)';g.fillRect((t*37)%W,0,1.4,Hh);
  if(t<3){g.fillStyle='#0c0c0c';g.fillRect(0,0,W,Hh);g.fillStyle='#d8d8d0';g.font='bold 22px "Courier New", monospace';g.textAlign='center';g.fillText('O.M.C. — TEST 3 — 9/58',W/2,160);g.fillText('SUBJECT A.R. — CH. 1',W/2,196);g.textAlign='left';}
  if(tex)tex.needsUpdate=true;}
 return {tex,draw,LEN,canvas:cv};}
