// Chapter Seven: the paper things. Drawn once on canvases (none in the tests: every function returns null there and the
// chapter carries on without the picture), so an art pass can replace any of them by name.
//
//  photoSketch(g,w,h,{who}): the photograph of the four of them at the oak last July, drawn by hand, for when the game cannot
//    render it from the world (the chapter renders the real one: the same camera, the same place, once with all four and
//    once with only you). who: ['player','jamie','sam','alex'] or ['player'].
//  planCanvas / modernCanvas: the township's 1958 storm plan (revised 1974) and its 2009 street map of the same blocks, at
//    the same scale, so one laid on the other lines up. They differ where Old Mill Court was.
//  notebookPage(kind): Sam's spiral notebook: his investigation page, the stub where a page was torn out, the page you write
//    the names on (drawn letter by letter as you write).
//  newspaper1966, calendar1991, samPage: the things in Old Mill Court.
import * as THREE from './three.module.js';
import {CAST} from './cast.js';

const hex=c=>'#'+c.toString(16).padStart(6,'0');
export function canvas(w,h){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;return {c,g};}catch{return null;}}
export function texOf(cv){if(!cv)return null;const t=new THREE.CanvasTexture(cv.c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}

// ---- the photograph -------------------------------------------------------------------------------------------------------------
// The composition both versions share (fractions of the frame): the oak on the right, the bench, the field fence, the sky.
export const PHOTO={w:640,h:480,kids:{player:{x:.33,bike:'player'},jamie:{x:.47,bike:'jamie'},sam:{x:.6,bike:'sam'},alex:{x:.73,bike:'alex'}}};
export function photoSketch(g,w,h,{who=['player','jamie','sam','alex']}={}){
 const sky=g.createLinearGradient(0,0,0,h*.6);sky.addColorStop(0,'#8fa9c4');sky.addColorStop(.6,'#e8c08a');sky.addColorStop(1,'#f0d4a2');g.fillStyle=sky;g.fillRect(0,0,w,h);
 g.fillStyle='#8a9a7a';for(let x=0;x<w;x+=18){g.beginPath();g.ellipse(x,h*.55,16,10+Math.sin(x)*4,0,0,7);g.fill();}// the far treeline
 const grass=g.createLinearGradient(0,h*.55,0,h);grass.addColorStop(0,'#7a8a4a');grass.addColorStop(1,'#4a5a2a');g.fillStyle=grass;g.fillRect(0,h*.56,w,h*.44);
 g.strokeStyle='#5a4a38';g.lineWidth=3;for(const y of [.6,.635]){g.beginPath();g.moveTo(0,h*y);g.lineTo(w,h*y-6);g.stroke();}for(let x=20;x<w;x+=70){g.fillStyle='#5a4a38';g.fillRect(x,h*.56,5,h*.09);}
 // the oak, right
 g.fillStyle='#3a2c20';g.fillRect(w*.84,h*.22,w*.05,h*.48);g.fillStyle='#4a6a34';for(const [x,y,r] of [[.86,.18,.13],[.78,.24,.1],[.94,.26,.1],[.84,.08,.09]]){g.beginPath();g.arc(w*x,h*y,w*r,0,7);g.fill();}
 g.strokeStyle='#4a4038';g.lineWidth=2;g.beginPath();g.moveTo(w*.9,h*.3);g.lineTo(w*.9,h*.55);g.stroke();g.fillStyle='#222';g.beginPath();g.ellipse(w*.9,h*.57,w*.025,h*.012,0,0,7);g.fill();// the swing
 // the bench, left
 g.fillStyle='#6a5440';g.fillRect(w*.08,h*.66,w*.14,h*.02);g.fillRect(w*.08,h*.62,w*.14,h*.015);g.fillStyle='#2a2a28';g.fillRect(w*.09,h*.68,4,h*.05);g.fillRect(w*.2,h*.68,4,h*.05);
 // the kids, each with his bike, standing at the oak
 for(const k of who){const K=PHOTO.kids[k],C=CAST[k],x=w*K.x,base=h*.86;
  g.strokeStyle=hex(C.bike.frame);g.lineWidth=5;g.beginPath();g.arc(x-26,base-12,14,0,7);g.stroke();g.beginPath();g.arc(x+26,base-12,14,0,7);g.stroke();g.beginPath();g.moveTo(x-26,base-12);g.lineTo(x,base-34);g.lineTo(x+26,base-12);g.stroke();
  g.fillStyle=hex(C.clothes.shorts||C.clothes.pants||0x444444);g.fillRect(x-9,base-62,18,22);g.fillStyle=hex(C.clothes.shirt);g.fillRect(x-12,base-98,24,38);
  g.fillStyle=hex(C.face.skin);g.beginPath();g.arc(x,base-110,11,0,7);g.fill();g.fillStyle=hex(C.hair.color);g.beginPath();g.ellipse(x,base-116,12,7,0,Math.PI,0);g.fill();
  if(C.hair.cap){g.fillStyle=hex(C.hair.cap);g.fillRect(x-12,base-121,24,7);g.fillRect(x,base-117,16,3);}
  g.fillStyle=hex(C.face.skin);g.fillRect(x-17,base-95,5,24);g.fillRect(x+12,base-95,5,24);g.fillStyle='#e8e2d4';g.fillRect(x-8,base-40,6,24);g.fillRect(x+2,base-40,6,24);}
 // the print: a little warm, a white border, the date stamped in orange
 g.fillStyle='rgba(255,200,140,.08)';g.fillRect(0,0,w,h);g.fillStyle='#ff8a3a';g.font='bold 16px monospace';g.fillText("'11 7 16",w-96,h-14);}

// ---- the maps (the same scale and frame: north up; Oak Hollow Drive runs up the middle to its end) ---------------------------------
// The frame's anchor points (fractions): where Oak Hollow Drive ends today (the cul-de-sac), the oak, and where the court
// went. The modern map's cul-de-sac is at CUL; the 1958 plan has the street going on past it (no cul-de-sac) into the court.
export const MAP={w:1024,h:768,cul:{x:.5,y:.36},oak:{x:.555,y:.31},court:{x:.6,y:.2},target:{x:.575,y:.27},sams:{x:.465,y:.52},jamie:{x:.535,y:.68}};
function streets(g,w,h,{old=false}={}){g.lineCap='round';g.lineJoin='round';
 const road=(pts,wd)=>{g.lineWidth=wd;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x*w,y*h):g.moveTo(x*w,y*h));g.stroke();};
 // Oak Hollow Drive, up the middle, and its cross streets
 road([[.5,1.02],[.5,.42]],old?16:20);road([[.5,.62],[.74,.6],[.96,.56]],old?12:14);road([[.5,.48],[.28,.47],[.04,.46]],old?12:14);
 if(old){// the old plan: the drive goes on, past the oak, into Old Mill Court (a horseshoe), and an access lane to the mill road
  road([[.5,.42],[.5,.36],[.52,.3],[.58,.24]],16);g.lineWidth=14;g.beginPath();g.ellipse(.63*w,.17*h,.07*w,.08*h,0,Math.PI*.82,Math.PI*2.18);g.stroke();
  g.setLineDash([10,8]);road([[.7,.12],[.86,.06],[1.02,.04]],8);g.setLineDash([]);}
 else{g.lineWidth=0;g.beginPath();g.arc(.5*w,.39*h,.032*w,0,7);g.fill();}}
export function planCanvas(){const cv=canvas(MAP.w,MAP.h);if(!cv)return null;const {g}=cv,w=MAP.w,h=MAP.h;
 g.fillStyle='#e6ecef';g.fillRect(0,0,w,h);g.strokeStyle='rgba(60,90,130,.18)';g.lineWidth=1;for(let x=0;x<w;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
 g.strokeStyle='#2a3e64';streets(g,w,h,{old:true});g.strokeStyle='#e6ecef';g.lineWidth=0;
 // lots along the court (numbered), the oak (a surveyor's tree: TO REMAIN), the storm line (dashed), the stamp
 g.fillStyle='#2a3e64';g.font='bold 13px Courier New';for(let k=0;k<12;k++){const a=Math.PI*.85+k/11*Math.PI*1.3,x=.63*w+Math.cos(a)*.115*w,y=.17*h+Math.sin(a)*.13*h;g.strokeStyle='#2a3e64';g.lineWidth=1;g.strokeRect(x-14,y-10,28,20);g.fillText(String(k+1),x-5,y+5);}
 g.strokeStyle='#2a3e64';g.lineWidth=2;g.beginPath();g.arc(MAP.oak.x*w,MAP.oak.y*h,14,0,7);g.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;g.beginPath();g.moveTo(MAP.oak.x*w+Math.cos(a)*14,MAP.oak.y*h+Math.sin(a)*14);g.lineTo(MAP.oak.x*w+Math.cos(a)*20,MAP.oak.y*h+Math.sin(a)*20);g.stroke();}
 g.font='12px Courier New';g.fillText('EXIST. OAK 30"',MAP.oak.x*w+24,MAP.oak.y*h-2);g.fillText('TO REMAIN',MAP.oak.x*w+24,MAP.oak.y*h+12);
 g.setLineDash([6,5]);g.strokeStyle='#5a7a9a';g.lineWidth=2;g.beginPath();g.moveTo(.6*w,.24*h);g.lineTo(.7*w,.3*h);g.lineTo(.86*w,.34*h);g.stroke();g.setLineDash([]);g.fillStyle='#5a7a9a';g.fillText('LINE 4  24" RCP',.72*w,.32*h);
 g.fillStyle='#2a3e64';g.font='bold 20px Courier New';g.fillText('OLD MILL CT.',.6*w,.105*h);g.font='bold 15px Courier New';g.fillText('OAK HOLLOW DR.',.515*w,.8*h);g.fillText('R.O.W. 50\'',.53*w,.38*h);
 g.font='bold 15px Courier New';g.fillText('OAK HOLLOW TWP. - STORM SEWER PLAN - SHEET 3 OF 7',24,h-50);g.font='13px Courier New';g.fillText('DRAWN 6/1958  W.K.  -  REVISED 4/1974',24,h-28);
 g.save();g.translate(.66*w,.16*h);g.rotate(-.25);g.strokeStyle='rgba(170,40,40,.8)';g.lineWidth=3;g.strokeRect(-110,-26,220,52);g.fillStyle='rgba(170,40,40,.85)';g.font='bold 18px Courier New';g.fillText('VACATED 1974',-82,-4);g.font='12px Courier New';g.fillText('R.O.W. RETAINED - DRAINAGE',-92,16);g.restore();
 return cv;}
export function modernCanvas(){const cv=canvas(MAP.w,MAP.h);if(!cv)return null;const {g}=cv,w=MAP.w,h=MAP.h;
 g.fillStyle='#f2efe4';g.fillRect(0,0,w,h);g.fillStyle='#d8e4c4';g.fillRect(.4*w,0,.4*w,.34*h);// the field past the end of the street
 g.fillStyle='#e4dccc';for(let k=0;k<14;k++){const y=.5+k*.035;if(y>.98)break;g.fillRect(.43*w,y*h,.05*w,.025*h);g.fillRect(.52*w,y*h,.05*w,.025*h);}
 g.strokeStyle='#ffffff';g.fillStyle='#ffffff';streets(g,w,h);g.strokeStyle='#8a8478';g.lineWidth=1.5;streets(g,w,h);g.fillStyle='#8a8478';g.beginPath();g.arc(.5*w,.39*h,.032*w,0,7);g.stroke();
 g.fillStyle='#3a3a36';g.font='bold 15px Arial';g.fillText('OAK HOLLOW DR',.515*w,.8*h);g.fillText('BRIARWOOD LN',.7*w,.585*h);g.fillText('SUMMERFIELD RD',.12*w,.445*h);
 g.font='13px Arial';g.fillStyle='#5a6a4a';g.fillText('OPEN SPACE',.6*w,.18*h);g.fillStyle='#3a3a36';g.font='bold 16px Arial';g.fillText('OAK HOLLOW TOWNSHIP',24,h-48);g.font='13px Arial';g.fillText('STREET MAP  -  2009  -  NOT TO SCALE',24,h-26);
 // Sam's own pencil, already on it: his house, Jamie's, an X at the creek
 g.strokeStyle='#4a4a52';g.lineWidth=2;g.font='italic 14px Georgia';g.fillStyle='#4a4a52';g.beginPath();g.arc(MAP.sams.x*w,MAP.sams.y*h,9,0,7);g.stroke();g.fillText('me',MAP.sams.x*w-34,MAP.sams.y*h+4);
 g.beginPath();g.arc(MAP.jamie.x*w,MAP.jamie.y*h,9,0,7);g.stroke();g.fillText('J',MAP.jamie.x*w+14,MAP.jamie.y*h+5);return cv;}
// the view on the table: the modern map, the plan over it at some opacity, your pencil and its mark
export function drawMapView(cv,{plan,modern,overlay=0,cursor=null,mark=null,hint=0}){if(!cv)return;const {g,c}=cv,w=c.width,h=c.height;g.clearRect(0,0,w,h);
 if(modern)g.drawImage(modern.c,0,0,w,h);if(plan&&overlay>.01){g.globalAlpha=overlay*.82;g.drawImage(plan.c,0,0,w,h);g.globalAlpha=1;}
 if(hint>0){g.strokeStyle=`rgba(200,60,40,${.35*hint})`;g.lineWidth=3;g.beginPath();g.arc(MAP.oak.x*w,MAP.oak.y*h,40,0,7);g.stroke();}
 if(mark){g.strokeStyle='#2a2a30';g.lineWidth=4;g.beginPath();g.moveTo(mark.x*w-12,mark.y*h-12);g.lineTo(mark.x*w+12,mark.y*h+12);g.moveTo(mark.x*w+12,mark.y*h-12);g.lineTo(mark.x*w-12,mark.y*h+12);g.stroke();}
 if(cursor){g.strokeStyle='rgba(40,40,48,.9)';g.lineWidth=2;g.beginPath();g.arc(cursor.x*w,cursor.y*h,7,0,7);g.stroke();g.beginPath();g.moveTo(cursor.x*w,cursor.y*h-14);g.lineTo(cursor.x*w,cursor.y*h-8);g.moveTo(cursor.x*w,cursor.y*h+8);g.lineTo(cursor.x*w,cursor.y*h+14);g.stroke();}}

// ---- Sam's notebook -----------------------------------------------------------------------------------------------------------------
const ruled=(g,w,h,{yellow=0}={})=>{g.fillStyle=yellow?`rgb(${236-yellow*30},${228-yellow*40},${196-yellow*70})`:'#fbfaf4';g.fillRect(0,0,w,h);g.strokeStyle=yellow?'rgba(120,140,170,.35)':'#a8c4e0';g.lineWidth=1;for(let y=44;y<h;y+=22){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.strokeStyle=yellow?'rgba(200,120,120,.4)':'#e8a0a0';g.beginPath();g.moveTo(46,0);g.lineTo(46,h);g.stroke();};
const sam=(g,size=15)=>{g.fillStyle='#2a2f3a';g.font=`${size}px "Courier New", monospace`;};
export function notebookPage(kind,{names=''}={}){const cv=canvas(512,680);if(!cv)return null;const {g}=cv,w=512,h=680;
 if(kind==='notes'){ruled(g,w,h);sam(g,15);
  const L=['THURS 8/25 - FRI 8/26 (NO SLEEP)','','1958 PLAN: LINE 2 (MILL ST, BRICK)','  + LINE 4 (BRIARWOOD CREEK) MEET','  AT THE WORKS. 1966, 1991, NOW.','','? WHY DOES LINE 4 BEND AROUND','  NOTHING? (BEHIND THE OAK)','? ROW = "RIGHT OF WAY" - FOR WHAT','? CULVERT GOES UNDER A STREET','  THAT ISNT THERE','','DOESNT LINE UP W/ NEW MAP.','ASK REYES FOR OLD SHEET 2','','BATTERIES (FOR THE BATTERIES)  X'];
  L.forEach((s,i)=>g.fillText(s,56,40+i*22));
  // his little map: the end of the street, the oak, a dotted line going on past it, a question mark
  g.strokeStyle='#2a2f3a';g.lineWidth=2;g.beginPath();g.moveTo(320,640);g.lineTo(320,520);g.stroke();g.beginPath();g.arc(320,505,15,0,7);g.stroke();
  g.beginPath();g.arc(352,492,8,0,7);g.stroke();g.font='12px "Courier New"';g.fillText('OAK',364,492);g.setLineDash([5,5]);g.beginPath();g.moveTo(330,492);g.lineTo(380,440);g.lineTo(430,420);g.stroke();g.setLineDash([]);g.font='bold 22px "Courier New"';g.fillText('?',436,424);
  g.font='12px "Courier New"';g.fillText('J SAYS TELL REYES EVERYTHING.',56,600);g.fillText('OK. EVERYTHING.',56,620);
  g.save();g.translate(410,600);g.rotate(-.1);g.font='italic 13px Georgia';g.fillText('(J owes me $2)',0,0);g.restore();}
 else if(kind==='stub'){ruled(g,w,h);g.fillStyle='#ddd8c8';g.beginPath();g.moveTo(0,0);for(let y=0;y<=h;y+=12)g.lineTo(18+Math.sin(y*.7)*5+Math.sin(y*.23)*3,y);g.lineTo(0,h);g.fill();
  sam(g,13);g.fillStyle='rgba(42,47,58,.35)';g.fillText('(a page torn out)',150,340);}
 else if(kind==='names'){ruled(g,w,h);g.fillStyle='#2a2a30';g.font='bold 54px "Courier New", monospace';const parts=String(names).split('\n');parts.forEach((s,i)=>g.fillText(s,100,190+i*110));}
 return cv;}
// ---- Old Mill Court's paper ------------------------------------------------------------------------------------------------------
export function newspaper1966(){const cv=canvas(512,680);if(!cv)return null;const {g}=cv,w=512,h=680;
 g.fillStyle='#e6dcc0';g.fillRect(0,0,w,h);g.fillStyle='#1e1a14';g.font='bold 40px Georgia';g.textAlign='center';g.fillText('The Oak Hollow Courier',w/2,58);
 g.font='13px Georgia';g.fillText('TUESDAY, AUGUST 23, 1966  -  TEN CENTS',w/2,82);g.fillRect(24,92,w-48,2);g.font='bold 30px Georgia';g.fillText('HEAT BREAKS; STORMS DUE',w/2,134);
 g.font='bold 20px Georgia';g.fillText('Board Sets School Opening Sept. 6',w/2,172);g.textAlign='left';g.font='12px Georgia';
 for(let k=0;k<20;k++){const y=200+k*17;g.fillStyle=`rgba(30,26,20,${.55+.2*(k%3===0)})`;g.fillRect(28,y,215-(k%5===4?70:0),9);g.fillRect(268,y,215-(k%4===3?60:0),9);}
 g.fillStyle='#1e1a14';g.font='bold 16px Georgia';g.fillText('At the Lyric Tonight:',268,560);g.font='14px Georgia';g.fillText('a Double Feature, 7:30',268,580);g.fillStyle='rgba(120,90,40,.25)';g.fillRect(0,0,w,h);return cv;}
export function calendar1991(){const cv=canvas(420,540);if(!cv)return null;const {g}=cv,w=420,h=540;
 g.fillStyle='#f0ece0';g.fillRect(0,0,w,h);g.fillStyle='#2a4a6a';g.fillRect(0,0,w,200);g.fillStyle='#e8c070';g.beginPath();g.arc(300,110,60,0,7);g.fill();g.fillStyle='#3a6a3a';g.fillRect(0,150,w,50);
 g.fillStyle='#1a1a1a';g.font='bold 30px Arial';g.textAlign='center';g.fillText('AUGUST 1991',w/2,240);g.font='13px Arial';const days=['S','M','T','W','T','F','S'];days.forEach((d,i)=>g.fillText(d,40+i*56,268));
 // August 1, 1991 was a Thursday
 for(let d=1;d<=31;d++){const i=d+3,col=i%7,row=Math.floor(i/7),x=40+col*56,y=300+row*44;g.fillStyle='#1a1a1a';g.font='16px Arial';g.fillText(String(d),x,y);
  if(d<=21){g.strokeStyle='rgba(200,30,30,.8)';g.lineWidth=2.5;g.beginPath();g.moveTo(x-16,y-16);g.lineTo(x+16,y+6);g.moveTo(x+16,y-16);g.lineTo(x-16,y+6);g.stroke();}}
 g.fillStyle='rgba(200,30,30,.9)';g.font='italic 13px Georgia';g.fillText('school 9/3 :(',300,520);g.textAlign='left';return cv;}
// Sam's handwriting, Sam's joke, on a page gone yellow and soft as if it had been here twenty years
export function samPage(){const cv=canvas(512,680);if(!cv)return null;const {g}=cv,w=512,h=680;ruled(g,w,h,{yellow:1});
 g.fillStyle='rgba(120,90,40,.18)';for(let k=0;k<9;k++){g.beginPath();g.arc(Math.random()*w,Math.random()*h,20+Math.random()*60,0,7);g.fill();}
 g.fillStyle='rgba(42,47,58,.8)';g.font='16px "Courier New", monospace';['THURSDAY','','FLASHLIGHT  X','BATTERIES  X','BATTERIES FOR THE BATTERIES  X','','THE WATER GOES BOTH WAYS','','DONT LET J GO FIRST'].forEach((s,i)=>g.fillText(s,60,80+i*28));
 g.strokeStyle='rgba(42,47,58,.7)';g.lineWidth=2;g.beginPath();g.moveTo(60,380);g.lineTo(420,380);g.stroke();g.fillStyle='#d8d0b0';g.beginPath();g.moveTo(w,0);for(let y=0;y<=h;y+=12)g.lineTo(w-14-Math.sin(y*.7)*5,y);g.lineTo(w,h);g.fill();return cv;}
