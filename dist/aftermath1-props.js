// Aftermath I: paper. Everything here is drawn once on a canvas (chapter6-kit.js paper(): null where there is no canvas, as in the
// tests, and whatever uses it falls back to a plain colour). Nothing is a document you must read: each is a thing in a room.
//
//  the gym      the court's lines; banners; the board of the missing (Alex's flyer, Sam's, and a sheet with a name and an empty
//               square where a picture would not print); the lists by street; the television's caption; WELCOME BACK
//  the record   Reyes's own drawing of the anchor board; the 1959 sheet (Chapter Eight's own); Sam's names (Chapter Seven's own)
//  the list     the county's list of the dead: a line with an age and a street and no name; what you write on it
//  pictures     Sunday at the oak (four bikes); the three of you at Alex's door; Jamie; Alex; Lily's dog; the photo booth strip
//  the rest     paint on a door; an UNSAFE placard; the township's letter; a note card; the Courier in September
import {paper} from './chapter6-kit.js';
import {CAST} from './cast.js';

const hex=c=>'#'+c.toString(16).padStart(6,'0');
const cache=new Map();
export function tex9(name,...a){const key=name+'|'+JSON.stringify(a);if(!cache.has(key)){const d=P9[name];cache.set(key,d?paper(d.w,d.h,(g,w,h)=>d.draw(g,w,h,...a)):null);}return cache.get(key);}
export const PRINTS9=which=>[0,1,2,3].map(i=>which<3?(which*4+i)%12:(which*4+i*5+1)%12);// (which pictures a board of Alex's has, in order)
export function fresh9(name,...a){const d=P9[name];return d?paper(d.w,d.h,(g,w,h)=>d.draw(g,w,h,...a)):null;}
const sheet=(g,w,h,c='#f6f3ea')=>{g.fillStyle=c;g.fillRect(0,0,w,h);};
const hand=(g,px,c='#1f2a44')=>{g.fillStyle=c;g.font=`${px}px "Comic Sans MS","Segoe Print","Bradley Hand",cursive`;};
const type=(g,px,c='#1d1d1d',wt='')=>{g.fillStyle=c;g.font=`${wt} ${px}px "Courier New",monospace`;};
const sans=(g,px,c='#1d1d1d',wt='bold')=>{g.fillStyle=c;g.font=`${wt} ${px}px Arial,Helvetica,sans-serif`;};
// a boy as the game draws him, small: head, hair, shirt (a school picture, a flyer, a figure in a photograph)
function kid(g,x,y,s,cast,{cap=false,smile=.5}={}){const F=cast.face,H=cast.hair,C2=cast.clothes;
 g.fillStyle=hex(C2.shirt);g.beginPath();g.moveTo(x-s*.62,y+s*1.5);g.quadraticCurveTo(x-s*.6,y+s*.62,x,y+s*.6);g.quadraticCurveTo(x+s*.6,y+s*.62,x+s*.62,y+s*1.5);g.fill();
 g.fillStyle=hex(F.skin);g.fillRect(x-s*.13,y+s*.4,s*.26,s*.3);g.beginPath();g.ellipse(x,y,s*.4,s*.5,0,0,7);g.fill();
 g.fillStyle=hex(cap?(H.cap??0x2d4a7a):H.color);g.beginPath();g.ellipse(x,y-s*.2,s*.43,s*.36,0,Math.PI,0);g.fill();if(cap){g.fillRect(x-s*.5,y-s*.24,s*.66,s*.1);}
 g.fillStyle='#17130f';g.beginPath();g.arc(x-s*.15,y+s*.02,s*.04,0,7);g.arc(x+s*.15,y+s*.02,s*.04,0,7);g.fill();
 g.strokeStyle='#7a4638';g.lineWidth=Math.max(1,s*.04);g.beginPath();if(smile>0)g.arc(x,y+s*.14,s*.17,.25,Math.PI-.25);else{g.moveTo(x-s*.12,y+s*.26);g.lineTo(x+s*.12,y+s*.26);}g.stroke();}
function bike(g,x,y,s,c){g.strokeStyle=c;g.lineWidth=Math.max(1.5,s*.07);g.beginPath();g.arc(x-s*.5,y,s*.3,0,7);g.moveTo(x+s*.8,y);g.arc(x+s*.5,y,s*.3,0,7);g.moveTo(x-s*.5,y);g.lineTo(x-s*.1,y-s*.45);g.lineTo(x+s*.35,y-s*.45);g.lineTo(x+s*.5,y);g.moveTo(x-s*.1,y-s*.45);g.lineTo(x+.02*s,y);g.lineTo(x-s*.5,y);g.moveTo(x+s*.35,y-s*.45);g.lineTo(x+s*.3,y-s*.62);g.lineTo(x+s*.46,y-s*.66);g.stroke();}
function oak(g,x,y,s){g.fillStyle='#4a3626';g.fillRect(x-s*.09,y-s*.55,s*.18,s*.55);g.fillStyle='#4f6b35';for(const [dx,dy,r] of [[0,-.95,.5],[-.36,-.75,.36],[.38,-.78,.38],[-.1,-1.2,.34],[.2,-1.15,.3]]){g.beginPath();g.arc(x+dx*s,y+dy*s,r*s,0,7);g.fill();}}
function grey(g,w,h,a=.22){g.fillStyle=`rgba(80,80,80,${a})`;g.fillRect(0,0,w,h);}
function tape(g,x,y,r=0){g.save();g.translate(x,y);g.rotate(r);g.fillStyle='rgba(226,214,160,.75)';g.fillRect(-22,-7,44,14);g.restore();}
const ROWS=[['CH. 1','A.R.','9/58','—'],['CH. 4','R.A.C.','8/66','3/79'],['CH. 9','E.L. · T.L.','4/74','6/83'],['CH. 14','D.W.','8/91','VACATED 9/91']];

export const P9={
 // ---- the gym ----------------------------------------------------------------------------------------------------------------
 court:{w:1024,h:630,draw(g,w,h){g.fillStyle='#c9a46c';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${90+(y*7)%40},${60+(y*5)%30},30,${.05+((y*13)%7)*.012})`;g.fillRect(0,y,w,8);}
  for(let k=0;k<160;k++){g.fillStyle='rgba(70,45,20,.1)';g.fillRect((k*197)%w,((k*89)%70)*9,2,9);}
  g.strokeStyle='#f1ede2';g.lineWidth=5;const mx=64,my=40;g.strokeRect(mx,my,w-2*mx,h-2*my);g.beginPath();g.moveTo(w/2,my);g.lineTo(w/2,h-my);g.stroke();g.beginPath();g.arc(w/2,h/2,70,0,7);g.stroke();
  g.strokeStyle='#2f4f86';for(const s of [0,1]){const x=s?w-mx:mx,d=s?-1:1;g.strokeRect(s?x-190:x,h/2-76,190,152);g.beginPath();g.arc(x+d*190,h/2,76,s?Math.PI/2:-Math.PI/2,s?-Math.PI/2:Math.PI/2,!!s);g.stroke();g.beginPath();g.arc(x+d*52,h/2,250,s?Math.PI*.62:-Math.PI*.38,s?Math.PI*1.38:Math.PI*.38);g.stroke();}
  g.fillStyle='rgba(47,79,134,.5)';g.font='bold 54px Arial';g.textAlign='center';g.fillText('OAK HOLLOW',w/2,h/2-96);g.textAlign='left';}},
 banner:{w:256,h:384,draw(g,w,h,title,sub,c='#2f4f86',c2='#e9c44a'){g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle=c2;g.fillRect(0,0,w,14);g.beginPath();g.moveTo(0,h);g.lineTo(w/2,h-46);g.lineTo(w,h);g.fill();
  g.textAlign='center';g.fillStyle=c2;g.font='bold 30px Georgia';String(title).split('|').forEach((t,i)=>g.fillText(t,w/2,70+i*38));g.fillStyle='#f3efe4';g.font='bold 22px Arial';String(sub).split('|').forEach((t,i)=>g.fillText(t,w/2,210+i*30));g.textAlign='left';}},
 sign:{w:1024,h:96,draw(g,w,h,text='',c='#2f4f86',c2='#f3efe4'){g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle=c2;g.font='bold 58px Georgia';g.textAlign='center';g.fillText(text,w/2,68);g.textAlign='left';}},
 welcome:{w:512,h:256,draw(g,w,h){g.fillStyle='#3f6b4a';g.fillRect(0,0,w,h);g.strokeStyle='#c8a25a';g.lineWidth=14;g.strokeRect(7,7,w-14,h-14);
  const cols=['#e9c44a','#d9623e','#f1ede2','#6fa8d8','#e9c44a','#d9623e','#f1ede2'];g.font='bold 62px "Comic Sans MS",cursive';'WELCOME'.split('').forEach((ch,i)=>{g.fillStyle=cols[i%7];g.fillText(ch,62+i*56,104);});
  g.font='bold 62px "Comic Sans MS",cursive';'BACK!'.split('').forEach((ch,i)=>{g.fillStyle=cols[(i+3)%7];g.fillText(ch,130+i*56,178);});hand(g,22,'#f1ede2');g.fillText('First day: Tuesday, August 30',104,226);}},
 // the board by the doors: who is being looked for. kind 'shelter' (Saturday) | 'monday' (Sam's says FOUND; two are gone from it)
 board:{w:1024,h:640,draw(g,w,h,kind='shelter'){g.fillStyle='#b88a58';g.fillRect(0,0,w,h);for(let k=0;k<900;k++){g.fillStyle=`rgba(${60+(k*31)%60},${40+(k*17)%40},20,.16)`;g.fillRect((k*193)%w,(k*71)%h,3,2);}
  sans(g,34,'#f6f1e2');g.fillRect(0,0,w,58);g.fillStyle='#2a2a2a';g.font='bold 34px Arial';g.fillText('LOOKING FOR SOMEONE?  POST IT HERE.',28,42);
  const flyer=(x,y,name,sub,cast,o={})=>{g.save();g.translate(x,y);g.rotate(o.r||0);g.fillStyle='#fbfaf4';g.fillRect(0,0,230,300);tape(g,115,0);
   g.fillStyle='#b3261e';g.font='bold 40px Arial';g.textAlign='center';g.fillText('MISSING',115,48);
   if(o.blank){g.strokeStyle='#c9c5b8';g.setLineDash([6,5]);g.strokeRect(50,62,130,130);g.setLineDash([]);g.fillStyle='#efede6';g.fillRect(52,64,126,126);}
   else{g.fillStyle='#8fa6bd';g.fillRect(50,62,130,130);g.save();g.beginPath();g.rect(50,62,130,130);g.clip();kid(g,115,118,58,cast,{cap:o.cap});g.restore();grey(g,230,300,.12);}
   if(o.hand){hand(g,44,'#1b2c5a');g.fillText(name,115,236);hand(g,19,'#1b2c5a');String(sub).split('|').forEach((t,i)=>g.fillText(t,115,262+i*22));}
   else{g.fillStyle='#1d1d1d';g.font='bold 34px Arial';g.fillText(name,115,232);g.font='16px Arial';String(sub).split('|').forEach((t,i)=>g.fillText(t,115,256+i*19));}
   if(o.found){g.rotate(-.22);g.strokeStyle='#1e7a3a';g.lineWidth=6;g.strokeRect(-6,112,236,62);g.fillStyle='#1e7a3a';g.font='bold 52px Arial';g.fillText('FOUND',112,160);}
   g.textAlign='left';g.restore();};
  const note=(x,y,ww,hh,c,ls,r=0)=>{g.save();g.translate(x,y);g.rotate(r);g.fillStyle=c;g.fillRect(0,0,ww,hh);hand(g,19,'#22262e');ls.forEach((t,i)=>g.fillText(t,10,28+i*24));g.restore();};
  if(kind==='shelter'){flyer(40,84,'ALEX','Age 12. Since Sun., Aug. 21.|Briarwood Lane.',CAST.alex,{r:-.03});flyer(296,96,'SAM','Age 12. Since Thurs., Aug. 25.|Mill Creek works.',CAST.sam,{r:.025});
   flyer(552,80,'JAMIE','12. Blue cap, orange shirt.|Oak Hollow Dr. PLEASE.',CAST.jamie,{r:-.015,blank:true,hand:true});}
  else{flyer(296,96,'SAM','Age 12. Since Thurs., Aug. 25.|Mill Creek works.',CAST.sam,{r:.025,found:true});g.fillStyle='rgba(120,84,48,.55)';g.fillRect(40,84,230,300);g.fillRect(552,80,230,300);for(const [x,y] of [[60,90],[250,92],[572,86],[762,88]]){g.fillStyle='#8a8a84';g.beginPath();g.arc(x,y,4,0,7);g.fill();}}
  note(812,96,190,104,'#f4e9a8',['DAVIS family','all OK. At my','sister’s. — Ed'],.03);note(820,220,180,128,'#cfe3f2',['E. PRUITT','is HERE.','Cot 14. Ask','the nurse.'],-.04);
  note(60,420,214,96,'#f6d6d0',['HENDERSON ×3','HERE. Thank you.'],.02);note(300,430,240,128,'#f4e9a8',['Grey cat, white feet.','“Dusty.” 1081 Oak','Hollow. Call the','school office.'],-.025);
  note(574,416,210,150,'#e3f0d4',['KOWALSKI:','Marta + kids at','St. Anne’s hall.','Tell Pete. He was','on shift.'],.03);note(810,380,190,84,'#fbfaf4',['Dog found:','beagle, no collar'],.05);
  note(806,490,196,120,'#cfe3f2',['Kesslers:','we are at the','Motor Lodge.','Rm 9.'],-.03);}},
 // the lists by street, taped by the check-in table
 lists:{w:768,h:512,draw(g,w,h){g.fillStyle='#d8d1bd';g.fillRect(0,0,w,h);const streets=[['OAK HOLLOW DR. 1000–1150',18],['OAK HOLLOW DR. 850–999',16],['SUMMERFIELD RD.',14],['BRIARWOOD LN.',9]];
  streets.forEach(([nm,n],i)=>{const x=14+i*188;g.fillStyle='#fbfaf4';g.fillRect(x,24,176,460);tape(g,x+88,24);sans(g,13,'#1d1d1d');g.fillText('ACCOUNTED FOR',x+10,50);g.font='bold 11px Arial';g.fillText(nm,x+10,68);
   for(let k=0;k<n;k++){const y=90+k*21;g.fillStyle='rgba(30,30,30,.72)';g.fillRect(x+10,y,84+((k*37+i*11)%60),7);g.strokeStyle='#1e7a3a';g.lineWidth=2.5;if((k+i)%5!==3){g.beginPath();g.moveTo(x+150,y+2);g.lineTo(x+155,y+8);g.lineTo(x+165,y-4);g.stroke();}else{g.strokeStyle='#8a8a84';g.strokeRect(x+150,y-3,12,12);}}});}},
 news:{w:512,h:96,draw(g,w,h,line='GAS EXPLOSIONS, GROUND COLLAPSE IN OAK HOLLOW TWP.'){g.clearRect(0,0,w,h);g.fillStyle='rgba(150,20,20,.94)';g.fillRect(0,18,150,34);g.fillStyle='#fff';g.font='bold 22px Arial';g.fillText('BREAKING',16,43);
  g.fillStyle='rgba(18,26,44,.92)';g.fillRect(0,52,w,36);g.fillStyle='#f1f1ee';g.font='bold 19px Arial';g.fillText(line,12,77);g.fillStyle='rgba(255,255,255,.85)';g.font='bold 15px Arial';g.fillText('LIVE',w-58,40);g.fillStyle='#d22';g.beginPath();g.arc(w-72,35,6,0,7);g.fill();}},
 // ---- the record ----------------------------------------------------------------------------------------------------------------
 // Reyes's drawing of the board, from memory, on a legal pad, at four in the morning
 sketch:{w:512,h:680,draw(g,w,h){sheet(g,w,h,'#f4ecb0');g.strokeStyle='rgba(60,90,160,.3)';g.lineWidth=1;for(let y=70;y<h;y+=30){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.strokeStyle='rgba(190,60,60,.5)';g.beginPath();g.moveTo(56,0);g.lineTo(56,h);g.stroke();
  hand(g,22,'#1b2c5a');g.fillText('THE BOARD — long room, north wall — as I saw it',68,44);g.fillText('Sat 8/27, approx 0215.  A. Reyes',68,66);g.strokeStyle='#1b2c5a';g.lineWidth=2.5;g.strokeRect(70,96,400,330);
  ROWS.forEach((r,i)=>{const y=134+i*38;hand(g,21,'#1b2c5a');g.fillText(r[0],82,y);g.fillText(r[1],172,y);g.fillText(r[2],312,y);g.fillText(r[3],372,y);g.beginPath();g.moveTo(70,y+10);g.lineTo(470,y+10);g.stroke();});
  for(let i=0;i<3;i++){const y=134+(4+i)*38;g.fillText('CH. '+(15+i),82,y);g.fillText('8/11',312,y);g.beginPath();g.moveTo(172,y+2);g.lineTo(290,y+2);g.stroke();g.beginPath();g.moveTo(70,y+10);g.lineTo(470,y+10);g.stroke();}
  hand(g,20,'#8a1f1f');g.fillText('← three rows, no initials. Tags blank.',150,404);g.fillText('Needles on all three: DOWN.',150,446);hand(g,21,'#1b2c5a');
  ['Initials = children. Dates = taken / lost.','Gauges under each said LOAD.','They were holding it with them.','The three blank ones are ours.'].forEach((t,i)=>g.fillText(t,70,496+i*34));hand(g,19,'#1b2c5a');g.fillText('(I am writing this twice.)',70,650);}},
 // ---- the list ----------------------------------------------------------------------------------------------------------------
 // the county's list: wrote: how much of JAMIE is written on the empty line (0..5 letters), in your hand
 county:{w:640,h:820,draw(g,w,h,wrote=0){sheet(g,w,h,'#fbfaf4');g.fillStyle='#1d1d1d';g.font='bold 22px Arial';g.fillText('COUNTY EMERGENCY MANAGEMENT',40,56);g.font='15px Arial';g.fillText('OAK HOLLOW TOWNSHIP INCIDENT — Mon., Aug. 29, 2011 — 0700',40,80);
  g.font='bold 26px Arial';g.fillText('CONFIRMED DECEASED (PRELIMINARY)',40,128);g.fillRect(40,138,560,3);type(g,15,'#1d1d1d','bold');g.fillText('NAME',52,170);g.fillText('AGE',318,170);g.fillText('LAST KNOWN',386,170);g.fillRect(40,180,560,1);
  type(g,19,'#1d1d1d');g.fillText('ALEX',52,222);g.fillStyle='rgba(30,30,30,.7)';g.fillRect(120,208,128,13);type(g,19,'#1d1d1d');g.fillText('12',322,222);g.fillText('OAK HOLLOW DR.',386,222);
  g.fillRect(40,238,560,1);g.fillText('12',322,282);g.fillText('OAK HOLLOW DR.',386,282);g.fillStyle='#1d1d1d';g.fillRect(52,288,236,1.5);
  if(wrote>0){hand(g,36,'#1b2c5a');g.fillText('JAMIE'.slice(0,wrote),58,284);}
  g.fillRect(40,298,560,1);type(g,13,'#555');g.fillText('2 of 2. Injured: see sheet B. Unaccounted for: see sheet C.',52,330);
  type(g,13,'#555');['Names are taken from county and school records.','Where a record cannot be matched the line is left open.','Corrections: see the clerk, Room 2, with identification.'].forEach((t,i)=>g.fillText(t,52,372+i*22));
  g.strokeStyle='#9aa0a8';g.strokeRect(40,460,560,300);type(g,13,'#777');g.fillText('SHEET B / C CONTINUE ON THE NEXT BOARD',52,486);for(let k=0;k<10;k++){g.fillStyle='rgba(30,30,30,.28)';g.fillRect(52,510+k*23,200+(k*53)%220,8);}}},
 // ---- pictures ------------------------------------------------------------------------------------------------------------------
 // Sunday, at the oak, from Alex's camera: four bikes on the grass, three of them looking at whoever is holding it
 sunday:{w:640,h:480,draw(g,w,h){const sk=g.createLinearGradient(0,0,0,h*.62);sk.addColorStop(0,'#e8b98a');sk.addColorStop(1,'#f3d9b0');g.fillStyle=sk;g.fillRect(0,0,w,h);g.fillStyle='#7c8a4e';g.fillRect(0,h*.6,w,h*.4);g.fillStyle='#6b7a44';g.fillRect(0,h*.6,w,10);
  oak(g,470,300,170);for(const [x,c] of [[110,'#8a8f3f'],[230,'#b2553a'],[350,'#4d7f8f'],[540,'#5f8f93']])bike(g,x,400,62,c);
  kid(g,150,300,44,CAST.jamie,{cap:true});kid(g,270,306,42,CAST.sam,{smile:0});kid(g,560,300,43,CAST.player);g.fillStyle='rgba(255,236,200,.16)';g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,180,90,.9)';g.font='bold 20px "Courier New"';g.fillText('08/21/2011  19:26',w-222,h-18);}},
 // Friday night, under the court: the three of you in the flash (you held it out at arm's length); Jamie's face cut, and grinning
 three:{w:640,h:480,draw(g,w,h){g.fillStyle='#14110f';g.fillRect(0,0,w,h);const r=g.createRadialGradient(w/2,h*.45,30,w/2,h*.45,430);r.addColorStop(0,'rgba(255,246,226,.5)');r.addColorStop(1,'rgba(20,16,14,0)');g.fillStyle=r;g.fillRect(0,0,w,h);
  kid(g,170,230,96,CAST.sam,{smile:0});kid(g,470,222,100,CAST.jamie,{cap:true});kid(g,320,262,112,CAST.player,{smile:0});
  g.strokeStyle='#8a1a14';g.lineWidth=5;g.beginPath();g.moveTo(498,176);g.lineTo(516,214);g.stroke();g.fillStyle='rgba(60,40,30,.35)';for(let k=0;k<26;k++){g.beginPath();g.arc((k*97)%w,90+(k*53)%300,6+(k%4)*3,0,7);g.fill();}
  for(const [x,y] of [[150,236],[190,236],[300,270],[340,270],[452,228],[490,228]]){g.fillStyle='rgba(220,60,40,.55)';g.beginPath();g.arc(x,y,5,0,7);g.fill();}
  g.fillStyle='rgba(255,180,90,.9)';g.font='bold 20px "Courier New"';g.fillText('08/27/2011  01:38',w-222,h-18);}},
 // a portrait for a table: who 'jamie' | 'alex' (the school's picture, enlarged; Jamie's is the one from his mother's wallet)
 portrait:{w:384,h:480,draw(g,w,h,whoKey='jamie'){const c=CAST[whoKey];g.fillStyle=whoKey==='jamie'?'#6f93b8':'#8aa38f';g.fillRect(0,0,w,h);const v=g.createRadialGradient(w/2,h*.4,40,w/2,h*.4,340);v.addColorStop(0,'rgba(255,255,255,.22)');v.addColorStop(1,'rgba(0,0,0,.2)');g.fillStyle=v;g.fillRect(0,0,w,h);
  kid(g,w/2,h*.44,150,c,{cap:false,smile:1});if(whoKey==='jamie'){g.strokeStyle='#f3efe4';g.lineWidth=3;g.beginPath();g.moveTo(w/2-32,h*.44+34);g.lineTo(w/2-10,h*.44+30);g.stroke();}}},
 // a board of Alex's own pictures (which: 0..5), the way his father printed them: four to a board
 prints:{w:768,h:560,draw(g,w,h,which=0){g.fillStyle='#2b2f36';g.fillRect(0,0,w,h);const pic=(i,draw)=>{const x=24+(i%2)*372,y=20+Math.floor(i/2)*268;g.fillStyle='#fbfaf4';g.fillRect(x,y,348,252);g.save();g.beginPath();g.rect(x+10,y+10,328,214);g.clip();g.translate(x+10,y+10);draw();g.restore();};
  const sky2=(a,b)=>{const s=g.createLinearGradient(0,0,0,214);s.addColorStop(0,a);s.addColorStop(1,b);g.fillStyle=s;g.fillRect(0,0,328,214);};
  const S=[()=>{sky2('#e8b98a','#f3d9b0');g.fillStyle='#7c8a4e';g.fillRect(0,150,328,64);oak(g,200,170,120);},
   ()=>{sky2('#9cc0dc','#d9e6ea');g.fillStyle='#6f7a54';g.fillRect(0,140,328,74);g.fillStyle='#5d7f8a';g.fillRect(0,168,328,22);g.fillStyle='#8c8a82';g.fillRect(120,120,90,60);g.fillStyle='#1a1a1a';g.beginPath();g.arc(165,160,22,0,7);g.fill();},
   ()=>{sky2('#c9d8e2','#e6ecea');g.fillStyle='#8a8f86';g.fillRect(0,170,328,44);kid(g,150,96,40,CAST.jamie,{cap:true});bike(g,160,150,44,'#b2553a');g.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<7;k++)g.fillRect(40+k*12,188-k*5,26,3);},
   ()=>{sky2('#d9c8a8','#efe2c8');g.fillStyle='#b9b2a0';g.fillRect(0,60,328,154);g.fillStyle='#7a7468';g.fillRect(30,80,268,110);kid(g,236,128,38,CAST.sam,{smile:0});g.fillStyle='#4d7f8f';g.fillRect(60,150,90,6);bike(g,110,176,40,'#4d7f8f');},
   ()=>{sky2('#f0c58a','#f6dfb4');g.fillStyle='#8c8a82';g.fillRect(0,172,328,42);for(let k=0;k<4;k++){g.fillStyle='rgba(40,34,30,.75)';g.fillRect(30+k*76,60,3,116);g.beginPath();g.ellipse(46+k*76,182,34,7,0,0,7);g.fill();}},
   ()=>{sky2('#b8d0e0','#e0e8e8');g.fillStyle='#6b7a44';g.fillRect(0,150,328,64);g.fillStyle='#a8742a';g.fillRect(40,120,248,8);g.fillStyle='#8a8f86';g.beginPath();g.ellipse(170,104,26,16,0,0,7);g.fill();g.beginPath();g.arc(196,94,10,0,7);g.fill();},
   ()=>{sky2('#e4b488','#f1d3a8');g.fillStyle='#7c8a4e';g.fillRect(0,150,328,64);bike(g,90,176,44,'#5f8f93');kid(g,220,110,46,CAST.player,{smile:1});},
   ()=>{g.fillStyle='#e8d8c4';g.fillRect(0,0,328,214);g.fillStyle='#d8a078';g.beginPath();g.ellipse(250,170,150,90,-.4,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(0,0,328,60);},
   ()=>{sky2('#e6e8e6','#f4f4f0');g.fillStyle='#6f7a54';g.fillRect(0,176,328,38);g.fillStyle='#9aa4aa';g.fillRect(150,40,14,120);g.fillRect(186,40,14,120);g.beginPath();g.ellipse(175,44,52,30,0,0,7);g.fill();g.fillStyle='#7a848a';g.fillRect(118,40,114,8);},
   ()=>{sky2('#f2d8b8','#f6ead6');g.fillStyle='#8c8a82';g.beginPath();g.moveTo(130,214);g.lineTo(198,214);g.lineTo(172,96);g.lineTo(156,96);g.fill();for(const [x,c] of [[40,'#c9bfa8'],[250,'#b8a890']]){g.fillStyle=c;g.fillRect(x,80,60,70);g.fillStyle='#5a4a3a';g.beginPath();g.moveTo(x-6,82);g.lineTo(x+30,58);g.lineTo(x+66,82);g.fill();}},
   ()=>{sky2('#c8d8b8','#e0e8d0');g.fillStyle='#6b7a44';g.fillRect(0,120,328,94);g.fillStyle='#8a6a48';g.beginPath();g.ellipse(170,150,46,24,0,0,7);g.fill();g.beginPath();g.arc(214,128,16,0,7);g.fill();for(const x of [140,156,184,200])g.fillRect(x,164,6,26);hand(g,15,'#22262e');g.fillText('NOT OUR DOG',100,206);},
   ()=>{g.fillStyle='#6a7a88';g.fillRect(0,0,328,214);g.fillStyle='rgba(200,214,224,.5)';for(let k=0;k<40;k++){const x=(k*67)%328,y=(k*41)%214;g.beginPath();g.ellipse(x,y,3,5+(k%3),0,0,7);g.fill();g.fillRect(x-1,y,2,10+(k%5)*3);}g.fillStyle='rgba(60,70,80,.5)';g.fillRect(0,150,328,64);}];
  const cap=['The oak. Aug.','The creek grate','Jamie, the curb','Sam’s garage','Four shadows','Mrs. Delaney’s cat','“Hold still”','(his thumb)','The water tower','Our street, 7 a.m.','Not our dog','Rain'];
  // (the left wall's three boards carry all twelve; the right wall's three, all twelve again, in another order)
  for(let i=0;i<4;i++){const n=which<3?(which*4+i)%S.length:(which*4+i*5+1)%S.length;pic(i,S[n]);hand(g,19,'#22262e');g.fillText(cap[n],34+(i%2)*372,258+Math.floor(i/2)*268);}}},
 // Lily Henderson's drawing, crayon: a dog. She has never seen him. BISCUIT.
 biscuit:{w:384,h:300,draw(g,w,h){sheet(g,w,h,'#fbfaf4');g.strokeStyle='#8a5a2a';g.lineWidth=9;g.lineCap='round';g.beginPath();g.ellipse(190,160,96,50,0,0,7);g.stroke();g.beginPath();g.arc(300,112,36,0,7);g.stroke();
  for(const x of [120,160,224,262]){g.beginPath();g.moveTo(x,204);g.lineTo(x,256);g.stroke();}g.beginPath();g.moveTo(94,150);g.quadraticCurveTo(50,110,64,84);g.stroke();g.beginPath();g.moveTo(280,84);g.lineTo(270,58);g.moveTo(318,82);g.lineTo(330,56);g.stroke();
  g.fillStyle='#1d1d1d';g.beginPath();g.arc(292,106,5,0,7);g.arc(312,106,5,0,7);g.fill();g.strokeStyle='#c0392b';g.lineWidth=6;g.beginPath();g.arc(302,122,12,.2,Math.PI-.2);g.stroke();
  g.fillStyle='#2a6a2a';g.font='bold 44px "Comic Sans MS",cursive';g.fillText('BISCUIT',92,54);g.fillStyle='#7a2a8a';g.font='22px "Comic Sans MS",cursive';g.fillText('for Jamie  love Lily',96,288);}},
 // June, the photo booth at the mall: four frames, four boys, one helmet
 booth:{w:160,h:560,draw(g,w,h){sheet(g,w,h,'#f4f1ea');for(let i=0;i<4;i++){const y=14+i*134;g.fillStyle='#b8402e';g.fillRect(14,y,132,122);kid(g,48,y+50,30,CAST.jamie,{cap:true,smile:1});kid(g,112,y+50,29,CAST.sam,{smile:i%2});kid(g,48,y+92,30,CAST.player,{smile:1});
   kid(g,112,y+92,30,CAST.alex,{smile:1});g.fillStyle='#d8d4c8';g.beginPath();g.ellipse(112,y+80,15,11,0,Math.PI,0);g.fill();}}},
 // ---- the rest ----------------------------------------------------------------------------------------------------------------
 // the searchers' paint on a door: an X, the date, who, what was found (0)
 xmark:{w:256,h:256,draw(g,w,h,date='8/27',who='OHFD',n='0'){g.clearRect(0,0,w,h);g.strokeStyle='rgba(232,92,28,.92)';g.lineWidth=13;g.lineCap='round';g.beginPath();g.moveTo(26,26);g.lineTo(230,230);g.moveTo(230,26);g.lineTo(26,230);g.stroke();
  g.fillStyle='rgba(232,92,28,.95)';g.font='bold 38px Arial';g.textAlign='center';g.fillText(date,128,54);g.fillText(who,54,140);g.fillText(n,128,236);g.textAlign='left';}},
 placard:{w:256,h:320,draw(g,w,h,kind='UNSAFE'){const red=kind==='UNSAFE';g.fillStyle=red?'#c8281e':'#e6c22e';g.fillRect(0,0,w,h);g.fillStyle=red?'#fff':'#1d1d1d';g.font='bold 50px Arial';g.textAlign='center';g.fillText(kind,128,70);g.font='bold 17px Arial';
  (red?['DO NOT ENTER OR OCCUPY','Oak Hollow Twp.','Building Dept.','Inspected 8/29/11']:['RESTRICTED USE','Entry for belongings','by escort only','Inspected 8/30/11']).forEach((t,i)=>g.fillText(t,128,120+i*30));g.textAlign='left';}},
 fenceSign:{w:384,h:256,draw(g,w,h){g.fillStyle='#f4f1e6';g.fillRect(0,0,w,h);g.fillStyle='#c8281e';g.fillRect(0,0,w,64);g.fillStyle='#fff';g.font='bold 40px Arial';g.textAlign='center';g.fillText('ROAD CLOSED',192,46);g.fillStyle='#1d1d1d';g.font='bold 22px Arial';
  ['OAK HOLLOW TOWNSHIP','UNSTABLE GROUND','Residents: escort only','Twp. Engineer · 555-0116'].forEach((t,i)=>g.fillText(t,192,104+i*36));g.textAlign='left';}},
 // the township's letter, on the kitchen table in October
 letter:{w:512,h:680,draw(g,w,h){sheet(g,w,h,'#fbfaf4');g.fillStyle='#1d1d1d';g.font='bold 20px Georgia';g.fillText('OAK HOLLOW TOWNSHIP',40,56);g.font='14px Georgia';g.fillText('Office of the Township Engineer',40,78);g.fillText('October 3, 2011',40,118);g.fillText('To the residents of Oak Hollow Drive, 400–850:',40,160);
  g.font='15px Georgia';['Survey of the storm lines under the Drive (Line 2, 1908;','Line 4, 1958) is not complete. Until grouting and','monitoring are finished the Township cannot certify the','ground under any lot on the Drive.','','Present estimate: twelve to eighteen months.','','Occupancy below Summerfield Road remains permitted','at the owner’s discretion. Temporary housing assistance','ends November 30.'].forEach((t,i)=>g.fillText(t,40,204+i*26));
  g.font='italic 15px Georgia';g.fillText('We regret that we cannot say more than this.',40,500);hand(g,20,'#1b2c5a');g.fillText('12–18 MONTHS',300,356);g.strokeStyle='#1b2c5a';g.lineWidth=2;g.beginPath();g.ellipse(360,350,86,20,0,0,7);g.stroke();}},
 card:{w:320,h:200,draw(g,w,h,ls=['']){sheet(g,w,h,'#fbfaf4');g.strokeStyle='rgba(60,90,160,.25)';for(let y=52;y<h;y+=30){g.beginPath();g.moveTo(14,y);g.lineTo(w-14,y);g.stroke();}hand(g,24,'#1b2c5a');ls.forEach((t,i)=>g.fillText(t,22,46+i*30));}},
 courier:{w:512,h:680,draw(g,w,h){g.fillStyle='#e9e4d4';g.fillRect(0,0,w,h);g.fillStyle='#1e1a14';g.font='bold 40px Georgia';g.textAlign='center';g.fillText('The Oak Hollow Courier',w/2,58);g.font='13px Georgia';g.fillText('WEDNESDAY, SEPTEMBER 28, 2011',w/2,82);g.fillRect(24,92,w-48,2);
  g.font='bold 27px Georgia';g.fillText('STATE: AGED STORM LINES,',w/2,132);g.fillText('GAS MAIN BEHIND COLLAPSE',w/2,164);g.font='bold 17px Georgia';g.fillText('Residents’ Accounts Differ; Two Boys Mourned',w/2,196);g.textAlign='left';
  for(let k=0;k<22;k++){const y=222+k*17;g.fillStyle=`rgba(30,26,20,${.5+.2*(k%3===0)})`;g.fillRect(28,y,215-(k%5===4?70:0),9);g.fillRect(268,y,215-(k%4===3?60:0),9);}g.fillStyle='#8a8f86';g.fillRect(28,604,215,58);g.fillStyle='rgba(30,26,20,.6)';g.fillRect(268,604,215,9);g.fillRect(268,622,160,9);}},
 calendar:{w:420,h:540,draw(g,w,h){g.fillStyle='#f0ece0';g.fillRect(0,0,w,h);g.fillStyle='#3a6a8a';g.fillRect(0,0,w,190);g.fillStyle='#e8c070';g.beginPath();g.arc(320,96,52,0,7);g.fill();g.fillStyle='#1a1a1a';g.font='bold 30px Arial';g.textAlign='center';g.fillText('AUGUST 2011',w/2,236);
  g.font='13px Arial';['S','M','T','W','T','F','S'].forEach((d,i)=>g.fillText(d,40+i*56,264));for(let d=1;d<=31;d++){const i=d,col=i%7,row=Math.floor(i/7),x=40+col*56,y=296+row*44;g.fillStyle='#1a1a1a';g.font='16px Arial';g.fillText(String(d),x,y);
   if(d<=24){g.strokeStyle='rgba(40,60,160,.8)';g.lineWidth=2.5;g.beginPath();g.moveTo(x-15,y-16);g.lineTo(x+15,y+5);g.stroke();}if(d===30){g.strokeStyle='rgba(200,30,30,.9)';g.lineWidth=2.5;g.beginPath();g.arc(x,y-5,17,0,7);g.stroke();}}g.textAlign='left';}},
};
