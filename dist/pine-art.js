// Chapter Five: everything at Pine Ridge that is paint, print or handwriting, drawn on canvases at load (no image files).
// The maps are drawn from the plan itself (pine-plan.js), so what they show is where things really are.
import {SHORE_LINE,ROADS,BUILDINGS,PATHS,DOCKS,PADS,PL,DAM} from './pine-plan.js';
import {pineSignArt} from './footage.js';
import {seeded} from './kit.js';

const FAM={serif:'Georgia, "Times New Roman", serif',sans:'Arial, Helvetica, sans-serif',narrow:'"Arial Narrow", Arial, sans-serif',block:'Impact, "Arial Black", sans-serif',hand:'"Comic Sans MS", "Segoe Print", "Bradley Hand", cursive',type:'"Courier New", Courier, monospace'};
export function fit(g,text,size,w,weight='bold',fam=FAM.sans){g.font=`${weight} ${size}px ${fam}`;while(g.measureText(text).width>w&&size>5){size*=.93;g.font=`${weight} ${size}px ${fam}`;}return size;}
function grain(g,w,h,n,a,seed=7){const r=seeded(seed);for(let i=0;i<n;i++){g.fillStyle=`rgba(${r()<.5?255:0},${r()<.5?240:20},${r()<.5?220:10},${r()*a})`;g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}}
function weather(g,w,h,{fade=.18,stain=.25,seed=3}={}){const r=seeded(seed);g.fillStyle=`rgba(235,225,200,${fade})`;g.fillRect(0,0,w,h);
 for(let i=0;i<14;i++){const x=r()*w,y=r()*h,R=(.05+r()*.18)*Math.min(w,h),gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,`rgba(60,48,30,${stain*r()})`);gr.addColorStop(1,'rgba(60,48,30,0)');g.fillStyle=gr;g.fillRect(x-R,y-R,R*2,R*2);}
 grain(g,w,h,w*h/90,.18,seed+1);}
function wood(g,w,h,base,{seed=5,lines=true}={}){g.fillStyle=base;g.fillRect(0,0,w,h);const r=seeded(seed);
 if(lines)for(let y=0;y<h;y+=2+r()*3){g.strokeStyle=`rgba(30,18,8,${.05+r()*.1})`;g.lineWidth=.6+r();g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=w/8)g.lineTo(x,y+Math.sin(x*.03+y)*1.5);g.stroke();}}
function text(g,s,x,y,size,{w=9999,weight='bold',fam=FAM.sans,color='#fff',align='center',base='middle'}={}){fit(g,s,size,w,weight,fam);g.fillStyle=color;g.textAlign=align;g.textBaseline=base;g.fillText(s,x,y);}

// ---- the park --------------------------------------------------------------------------------------------------------------
// The original sign (as on the television, years older in daylight): the same board, faded and stained.
export function oldSignArt(g,w,h){pineSignArt(g,w,h);weather(g,w,h,{fade:.16,stain:.32,seed:11});
 // the varnish gone grey along the top, a long check in the wood, lichen low on the left
 const gr=g.createLinearGradient(0,0,0,h*.25);gr.addColorStop(0,'rgba(200,190,170,.28)');gr.addColorStop(1,'rgba(200,190,170,0)');g.fillStyle=gr;g.fillRect(0,0,w,h*.25);
 g.strokeStyle='rgba(30,20,10,.55)';g.lineWidth=2;g.beginPath();g.moveTo(w*.08,h*.58);g.bezierCurveTo(w*.3,h*.56,w*.5,h*.6,w*.74,h*.57);g.stroke();
 const r=seeded(4);for(let i=0;i<60;i++){g.fillStyle=`rgba(${120+r()*40},${130+r()*30},${80+r()*20},${.3+r()*.4})`;g.beginPath();g.arc(w*.02+r()*w*.16,h*.75+r()*h*.22,1+r()*4,0,7);g.fill();}}
// The newer entrance sign: routed letters on a stained plank between stone piers.
export function newSignArt(g,w,h){wood(g,w,h,'#4a3322',{seed:21});g.strokeStyle='#d8ccb0';g.lineWidth=h*.025;g.strokeRect(h*.06,h*.06,w-h*.12,h-h*.12);
 // a pine emblem
 g.fillStyle='#dcd0b2';const cx=w*.12,cy=h*.5;for(let k=0;k<3;k++){g.beginPath();g.moveTo(cx,cy-h*.32+k*h*.13);g.lineTo(cx-h*(.12+k*.05),cy-h*.08+k*h*.13);g.lineTo(cx+h*(.12+k*.05),cy-h*.08+k*h*.13);g.closePath();g.fill();}g.fillRect(cx-h*.025,cy+h*.2,h*.05,h*.12);
 text(g,'PINE RIDGE PARK',w*.58,h*.34,h*.27,{w:w*.72,fam:FAM.serif,color:'#e8dcc0'});text(g,'PICNIC  ·  FISHING  ·  TRAILS',w*.58,h*.6,h*.12,{w:w*.7,weight:'normal',color:'#d8ccb0'});
 text(g,'OPEN DAWN TO DUSK  ·  OAK HOLLOW TOWNSHIP',w*.58,h*.8,h*.085,{w:w*.7,weight:'normal',color:'#c8bca0'});grain(g,w,h,w*h/120,.12,22);}
export function simpleSign(g,w,h,{bg='#5a3e24',fg='#ecdcb8',lines=[],border=true,fam=FAM.sans,weather:wx=.1,seed=1}){g.fillStyle=bg;g.fillRect(0,0,w,h);if(border){g.strokeStyle=fg;g.lineWidth=Math.max(2,h*.03);g.strokeRect(h*.05,h*.05,w-h*.1,h-h*.1);}
 const n=lines.length;lines.forEach((l,i)=>{const s=typeof l==='string'?{t:l}:l;text(g,s.t,w/2,h*(n===1?.5:.22+.62*i/(n-1)),(s.size||(n===1?.5:.62/n))*h,{w:w*.88,fam:s.fam||fam,weight:s.weight||'bold',color:s.color||fg});});
 if(wx)weather(g,w,h,{fade:wx,stain:wx*1.6,seed});}
// The trail kiosk's map: the park, the shore, the trails, and, crossed out with tape, the old camp.
const project=(w,h,box)=>(e,n)=>[(e-box.e0)/(box.e1-box.e0)*w,(1-(n-box.n0)/(box.n1-box.n0))*h];
function drawShore(g,P,{fill='#7ea6b8',edge='#4f7a8a'}={}){g.beginPath();SHORE_LINE.forEach(([e,n],i)=>{const [x,y]=P(e,n);if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=edge;g.lineWidth=2;g.stroke();}
function drawRoad(g,P,R,{color,width,dash=null}){g.beginPath();for(let s=0;s<=R.L;s+=4){const p=R.at(s),q=PL(p.x,p.z),[x,y]=P(q.e,q.n);if(s)g.lineTo(x,y);else g.moveTo(x,y);}g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash||[]);g.stroke();g.setLineDash([]);}
export function kioskMapArt(g,w,h){g.fillStyle='#e8e0c8';g.fillRect(0,0,w,h);g.fillStyle='#3e5a3a';g.fillRect(0,0,w,h*.13);text(g,'PINE RIDGE PARK  ·  TRAILS & RESERVOIR',w/2,h*.065,h*.07,{w:w*.92,fam:FAM.serif});
 const box={e0:-420,e1:-30,n0:255,n1:660},mh=h*.8,P=project(w*.98,mh,box),off=(e,n)=>{const [x,y]=P(e,n);return [x+w*.01,y+h*.15];};
 g.save();g.translate(0,0);g.fillStyle='#cfd8b8';g.fillRect(w*.01,h*.15,w*.98,mh);
 // woods (a green wash) everywhere but the lawn
 g.fillStyle='rgba(90,130,80,.35)';g.fillRect(w*.01,h*.15,w*.98,mh);drawShore(g,off);
 drawRoad(g,off,ROADS.orr,{color:'#6a6a6a',width:5});drawRoad(g,off,ROADS.gravel,{color:'#b09060',width:3});drawRoad(g,off,ROADS.service,{color:'#9a8060',width:2,dash:[6,4]});drawRoad(g,off,ROADS.lane,{color:'#b09060',width:2});
 // the lot, the shelter, the dock
 const box2=(c,ww,hh,col)=>{const [x,y]=off(c[0],c[1]);g.fillStyle=col;g.fillRect(x-ww/2,y-hh/2,ww,hh);};box2([-112,302],w*.11,h*.05,'#7a7a7a');box2([-148,331],w*.03,h*.025,'#8a5a3a');
 g.font=`bold ${h*.026}px ${FAM.sans}`;g.fillStyle='#2a2a2a';g.textAlign='left';const lab=(t,e,n,dx=6,dy=0)=>{const [x,y]=off(e,n);g.fillText(t,x+dx,y+dy);};
 lab('PARKING',-112,295);lab('PICNIC SHELTER',-148,326,8,6);lab('DOCK',-168,350,-40);lab('PINE RIDGE RESERVOIR',-300,420,-10);lab('DAM',-372,412,-36);lab('RESERVOIR RD',-30,250,4);
 // the old camp: there, and taped over
 const [cx,cy]=off(-225,560);g.fillStyle='rgba(120,90,60,.5)';g.fillRect(cx-w*.1,cy-h*.07,w*.2,h*.14);g.fillStyle='#3a2a1a';g.font=`bold ${h*.024}px ${FAM.sans}`;g.textAlign='center';g.fillText('CAMP WHIPPOORWILL',cx,cy-h*.02);g.font=`${h*.02}px ${FAM.sans}`;g.fillText('(Youth Camp · Permit Only)',cx,cy+h*.012);
 g.save();g.translate(cx,cy);g.rotate(-.18);g.fillStyle='rgba(225,215,170,.92)';g.fillRect(-w*.14,-h*.022,w*.28,h*.044);g.fillStyle='#8a2a1a';g.font=`bold ${h*.026}px ${FAM.sans}`;g.fillText('CLOSED — NO ACCESS',0,h*.008);g.restore();
 // you are here
 const [yx,yy]=off(-108,318);g.fillStyle='#c0301e';g.beginPath();g.arc(yx,yy,h*.012,0,7);g.fill();g.fillStyle='#c0301e';g.font=`bold ${h*.024}px ${FAM.sans}`;g.textAlign='left';g.fillText('YOU ARE HERE',yx+8,yy+h*.03);
 g.restore();g.fillStyle='#3e5a3a';g.fillRect(0,h*.95,w,h*.05);text(g,'NO SWIMMING  ·  PARK CLOSES AT DUSK  ·  OAK HOLLOW TWP. PARKS DEPT.',w/2,h*.975,h*.026,{w:w*.94});
 weather(g,w,h,{fade:.22,stain:.3,seed:31});}
// The camp's own map board: painted on plywood a long time ago, re-painted once, peeling.
export function campMapArt(g,w,h){wood(g,w,h,'#9a7a52',{seed:41});g.fillStyle='rgba(232,222,190,.9)';g.fillRect(w*.04,h*.04,w*.92,h*.92);
 text(g,'CAMP WHIPPOORWILL',w/2,h*.1,h*.075,{w:w*.8,fam:FAM.serif,color:'#2e4a2a'});
 const box={e0:-338,e1:-148,n0:478,n1:628},P0=project(w*.86,h*.7,box),P=(e,n)=>{const [x,y]=P0(e,n);return [x+w*.07,y+h*.16];};
 g.save();g.beginPath();g.rect(w*.07,h*.16,w*.86,h*.7);g.clip();g.fillStyle='#b8c49a';g.fillRect(w*.07,h*.16,w*.86,h*.7);drawShore(g,P,{fill:'#6f9fb6',edge:'#3e6e82'});
 drawRoad(g,P,ROADS.lane,{color:'#a08458',width:4});drawRoad(g,P,ROADS.gravel,{color:'#a08458',width:5});drawRoad(g,P,ROADS.service,{color:'#8a7450',width:3,dash:[7,5]});
 g.strokeStyle='#8a6a40';g.lineWidth=2;g.setLineDash([4,4]);for(const p of PATHS){if(p.pts[0][1]<480)continue;g.beginPath();p.pts.forEach(([e,n],i)=>{const [x,y]=P(e,n);if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.stroke();}g.setLineDash([]);
 const [cx,cy]=P(-208,548);g.fillStyle='#d8c890';g.beginPath();g.arc(cx,cy,w*.045,0,7);g.fill();g.fillStyle='#3a2a1a';g.font=`bold ${h*.022}px ${FAM.sans}`;g.textAlign='center';g.fillText('FLAG',cx,cy+4);
 for(const b of BUILDINGS){if(PL(0,0)&&b.c[1]<470)continue;const [x,y]=P(b.c[0],b.c[1]),bw=b.w/(box.e1-box.e0)*w*.86,bd=b.d/(box.n1-box.n0)*h*.7;g.save();g.translate(x,y);g.rotate(b.a);g.fillStyle=b.kind==='cabin'?'#a0452e':b.kind==='lodge'?'#7a3a26':'#6a5a4a';g.fillRect(-bw/2,-bd/2,bw,bd);g.restore();
  g.fillStyle='#2a1a10';g.font=`bold ${h*.024}px ${FAM.sans}`;g.fillText(b.name||'',x,y-bd*.5-6);}
 for(const D of DOCKS){if(D.root[1]<480)continue;const [x,y]=P(D.root[0],D.root[1]);g.strokeStyle='#5a4028';g.lineWidth=5;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(D.a)*D.len*3.2,y-Math.cos(D.a)*D.len*3.2);g.stroke();}
 const lab=(t,e,n)=>{const [x,y]=P(e,n);g.fillStyle='#1e3a4a';g.font=`bold ${h*.024}px ${FAM.sans}`;g.fillText(t,x,y);};lab('WATERFRONT',-238,496);lab('CAMPFIRE',-212,523);lab('PUMP HOUSE',-303,518);lab('SERVICE RD',-322,560);lab('TO PARK',-150,500);
 g.restore();text(g,'STAY WITH YOUR BUDDY!',w/2,h*.92,h*.06,{w:w*.8,fam:FAM.serif,color:'#8a2a1a'});
 // peeling paint
 const r=seeded(43);for(let i=0;i<34;i++){const x=r()*w,y=r()*h,ww=8+r()*40,hh=4+r()*16;g.fillStyle=`rgba(150,118,80,${.5+r()*.4})`;g.beginPath();g.ellipse(x,y,ww,hh,r()*3,0,7);g.fill();}
 weather(g,w,h,{fade:.2,stain:.35,seed:44});}
// Letters on the camp's arch: burned into a split log.
export function archArt(g,w,h){wood(g,w,h,'#6a4a2c',{seed:51});text(g,'CAMP WHIPPOORWILL',w/2,h*.47,h*.56,{w:w*.92,fam:FAM.serif,color:'#2a1a0e'});text(g,'EST. 1961',w/2,h*.88,h*.16,{w:w*.4,fam:FAM.serif,color:'#3a2616'});weather(g,w,h,{fade:.12,stain:.2,seed:52});}
// A cabin's name board: the name and its bird, painted by campers.
const BIRD={ROBIN:'#c0582e',BLUEJAY:'#3a6aa8',CARDINAL:'#b8241e',WREN:'#8a6a44',HERON:'#7a8a98',OWL:'#6a5238'};
export function cabinBoardArt(name){return (g,w,h)=>{wood(g,w,h,'#d8c8a0',{seed:name.length*7});g.strokeStyle='#5a4028';g.lineWidth=h*.06;g.strokeRect(h*.05,h*.05,w-h*.1,h-h*.1);
 // the bird: a round body, a head, a tail, a beak
 const c=BIRD[name]||'#6a5a4a',bx=w*.16,by=h*.52,s=h*.22;g.fillStyle=c;g.beginPath();g.ellipse(bx,by,s*1.1,s*.8,-.2,0,7);g.fill();g.beginPath();g.arc(bx+s*.9,by-s*.55,s*.5,0,7);g.fill();g.beginPath();g.moveTo(bx-s*.9,by-s*.1);g.lineTo(bx-s*1.8,by-s*.5);g.lineTo(bx-s*1.6,by+s*.2);g.closePath();g.fill();
 g.fillStyle='#e8b030';g.beginPath();g.moveTo(bx+s*1.35,by-s*.6);g.lineTo(bx+s*1.75,by-s*.5);g.lineTo(bx+s*1.35,by-s*.4);g.fill();g.fillStyle='#111';g.beginPath();g.arc(bx+s*1.05,by-s*.65,s*.09,0,7);g.fill();
 text(g,name,w*.6,h*.54,h*.5,{w:w*.62,fam:FAM.serif,color:'#3a2616'});weather(g,w,h,{fade:.18,stain:.3,seed:name.length});};}
// Small signs round the camp.
export const CAMP_SIGNS={
 buddy:{w:1.1,h:.42,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#e8dcb0',fg:'#8a2a1a',lines:[{t:'STAY WITH',size:.3},{t:'YOUR BUDDY',size:.36}],fam:FAM.serif,weather:.16,seed:61})},
 trespass:{w:.9,h:.5,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#e8e4d8',fg:'#a4241a',lines:[{t:'NO TRESPASSING',size:.2},{t:'PROPERTY OF',size:.12,weight:'normal',color:'#222'},{t:'PINE RIDGE RESERVOIR AUTHORITY',size:.1,color:'#222'}],weather:.22,seed:62})},
 closed:{w:.43,h:.56,draw:(g,w,h)=>{g.fillStyle='#ece6d4';g.fillRect(0,0,w,h);g.fillStyle='#1e1e1e';g.textAlign='center';text(g,'NOTICE',w/2,h*.1,h*.07,{color:'#1e1e1e'});
  const lines=['Camp Whippoorwill','will not open for','the 1992 season.','','Inquiries:','Pine Ridge Reservoir','Authority, Route 9','','— March 2, 1992'];lines.forEach((l,i)=>text(g,l,w/2,h*(.2+i*.075),h*.048,{w:w*.9,weight:'normal',fam:FAM.type,color:'#2a2a2a'}));
  g.fillStyle='rgba(120,90,40,.25)';g.fillRect(0,h*.8,w,h*.2);weather(g,w,h,{fade:.08,stain:.45,seed:63});
  for(const [x,y] of [[.06,.04],[.94,.04],[.06,.96],[.94,.96]]){g.fillStyle='#8a8070';g.beginPath();g.arc(w*x,h*y,3,0,7);g.fill();}}},
 lights:{w:1.0,h:.62,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#2e4a2a',fg:'#ece0b8',lines:[{t:'TAPS 9:00',size:.2},{t:'LIGHTS OUT 9:15',size:.24},{t:'QUIET IN THE CABINS',size:.12,weight:'normal'}],fam:FAM.serif,weather:.18,seed:64})},
 office:{w:1.1,h:.3,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#d8c8a0',fg:'#3a2616',lines:[{t:'CAMP OFFICE',size:.62}],fam:FAM.serif,weather:.2,seed:65})},
 lodge:{w:2.4,h:.5,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#5a3a22',fg:'#ecd8a8',lines:[{t:'WHIPPOORWILL LODGE',size:.58}],fam:FAM.serif,weather:.18,seed:66})},
 water:{w:1.3,h:.5,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#e8e0c8',fg:'#1e3a6a',lines:[{t:'NO SWIMMING',size:.26},{t:'WITHOUT A BUDDY',size:.2},{t:'CHECK IN AT THE BUDDY BOARD',size:.11,weight:'normal'}],weather:.2,seed:67})},
 buddyboard:{w:2.2,h:.36,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#3a5a7a',fg:'#ece0c0',lines:[{t:'BUDDY BOARD',size:.6}],fam:FAM.serif,weather:.2,seed:68})},
 finger:(t)=>({w:.95,h:.2,draw:(g,w,h)=>{wood(g,w,h,'#c8b080',{seed:t.length});g.fillStyle='#3a2616';text(g,t,w*.46,h*.55,h*.62,{w:w*.8,fam:FAM.serif,color:'#3a2616'});weather(g,w,h,{fade:.14,stain:.25,seed:t.length+3});}}),
 pump:{w:.8,h:.4,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#ece8dc',fg:'#a4241a',lines:[{t:'DANGER',size:.24},{t:'HIGH VOLTAGE — KEEP OUT',size:.12,color:'#222'},{t:'P.R.R.A. PUMP STATION 2',size:.1,weight:'normal',color:'#222'}],weather:.26,seed:69})},
};
export const PARK_SIGNS={
 noswim:{w:1.2,h:.8,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#ece8dc',fg:'#a4241a',lines:[{t:'NO SWIMMING',size:.2},{t:'PUBLIC WATER SUPPLY',size:.12,color:'#222'},{t:'NO WADING · NO PETS IN WATER',size:.09,weight:'normal',color:'#222'},{t:'PINE RIDGE RESERVOIR AUTHORITY',size:.08,weight:'normal',color:'#222'}],weather:.12,seed:71})},
 dusk:{w:.9,h:.6,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#4a3322',fg:'#ece0c0',lines:[{t:'PARK CLOSES',size:.22},{t:'AT DUSK',size:.26},{t:'GATE LOCKED NIGHTLY',size:.12,weight:'normal'}],weather:.1,seed:72})},
 carry:{w:.7,h:.45,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#4a3322',fg:'#ece0c0',lines:[{t:'PLEASE',size:.18},{t:'CARRY IN',size:.2},{t:'CARRY OUT',size:.2}],weather:.12,seed:73})},
 fee:{w:.8,h:.5,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#ece6d4',fg:'#2a2a2a',lines:[{t:'DAILY PARKING $2',size:.18},{t:'WEEKENDS & HOLIDAYS',size:.12,weight:'normal'},{t:'PAY AT BOOTH',size:.14}],border:false,weather:.12,seed:74})},
 shelter:{w:1.4,h:.32,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#4a3322',fg:'#ece0c0',lines:[{t:'SHELTER 1',size:.5}],weather:.1,seed:75})},
 restroom:{w:.9,h:.3,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#4a3322',fg:'#ece0c0',lines:[{t:'RESTROOMS',size:.56}],weather:.1,seed:76})},
 mile:{w:1.5,h:.75,draw:(g,w,h)=>{simpleSign(g,w,h,{bg:'#5a3e24',fg:'#ecdcb8',lines:[{t:'PINE RIDGE PARK',size:.26},{t:'½ MILE',size:.24}],weather:.08,seed:77});g.fillStyle='#ecdcb8';g.beginPath();g.moveTo(w*.86,h*.5);g.lineTo(w*.76,h*.35);g.lineTo(w*.76,h*.65);g.fill();}},
 speed:{w:.6,h:.75,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#f2f0e8',fg:'#1a1a1a',lines:[{t:'SPEED',size:.16},{t:'LIMIT',size:.16},{t:'30',size:.38}],weather:.1,seed:78})},
 road:{w:1.2,h:.24,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#2e6a3a',fg:'#ffffff',lines:[{t:'RESERVOIR RD',size:.6}],weather:.06,seed:79})},
 authority:{w:1.1,h:.55,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#e8e4d8',fg:'#1e3a6a',lines:[{t:'PINE RIDGE RESERVOIR AUTHORITY',size:.12},{t:'MAINTENANCE',size:.2},{t:'AUTHORIZED PERSONNEL ONLY',size:.1,weight:'normal',color:'#a4241a'}],weather:.24,seed:80})},
 mailbox:{w:.36,h:.12,draw:(g,w,h)=>simpleSign(g,w,h,{bg:'#e8e4d8',fg:'#1a1a1a',lines:[{t:'MILLER  1170',size:.7}],border:false,weather:.08,seed:81})},
 deer:{w:.7,h:.7,draw:(g,w,h)=>{g.fillStyle='#e8c430';g.fillRect(0,0,w,h);g.fillStyle='#1a1a1a';g.beginPath();g.ellipse(w*.5,h*.55,w*.22,h*.12,0,0,7);g.fill();g.fillRect(w*.32,h*.6,w*.04,h*.2);g.fillRect(w*.62,h*.6,w*.04,h*.2);g.beginPath();g.ellipse(w*.72,h*.36,w*.06,h*.09,.4,0,7);g.fill();g.fillRect(w*.66,h*.36,w*.04,h*.14);
  g.strokeStyle='#1a1a1a';g.lineWidth=3;g.beginPath();g.moveTo(w*.72,h*.27);g.lineTo(w*.8,h*.12);g.moveTo(w*.74,h*.27);g.lineTo(w*.66,h*.12);g.stroke();weather(g,w,h,{fade:.08,stain:.15,seed:82});}},
};

// ---- the office -----------------------------------------------------------------------------------------------------------------
// August 1991: the volunteer search for Danny Whitcomb used the camp (closed that week) as its base. Their map is still on the board.
export function searchMapArt(g,w,h){g.fillStyle='#f0ead8';g.fillRect(0,0,w,h);text(g,'PINE RIDGE RESERVOIR — VOLUNTEER SEARCH',w/2,h*.05,h*.04,{w:w*.92,fam:FAM.narrow,color:'#1e1e1e'});
 text(g,'BASE: CAMP WHIPPOORWILL LODGE  ·  SIGN IN AT OFFICE  ·  NO ONE SEARCHES ALONE',w/2,h*.095,h*.026,{w:w*.92,weight:'normal',fam:FAM.narrow,color:'#1e1e1e'});
 const box={e0:-420,e1:-40,n0:250,n1:660},P0=project(w*.92,h*.8,box),P=(e,n)=>{const [x,y]=P0(e,n);return [x+w*.04,y+h*.13];};
 g.fillStyle='#e6e2cc';g.fillRect(w*.04,h*.13,w*.92,h*.8);drawShore(g,P,{fill:'#c8d8de',edge:'#5a6e78'});
 drawRoad(g,P,ROADS.orr,{color:'#555',width:3});drawRoad(g,P,ROADS.gravel,{color:'#777',width:2});drawRoad(g,P,ROADS.service,{color:'#777',width:1.5,dash:[5,4]});drawRoad(g,P,ROADS.lane,{color:'#777',width:1.5});
 // the grid, numbered; checked squares crossed; one circled in red pen
 const cols=6,rows=5,gx=w*.04,gy=h*.13,cw=w*.92/cols,ch=h*.8/rows;g.strokeStyle='rgba(40,40,140,.7)';g.lineWidth=1.5;
 for(let i=0;i<=cols;i++){g.beginPath();g.moveTo(gx+i*cw,gy);g.lineTo(gx+i*cw,gy+h*.8);g.stroke();}for(let j=0;j<=rows;j++){g.beginPath();g.moveTo(gx,gy+j*ch);g.lineTo(gx+w*.92,gy+j*ch);g.stroke();}
 let k=1;const done=new Set([1,2,3,4,5,8,9,10,11,14,15,16,20,21,22,26,27]);for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=gx+i*cw,y=gy+j*ch;g.fillStyle='rgba(40,40,140,.8)';g.font=`bold ${h*.028}px ${FAM.narrow}`;g.textAlign='left';g.textBaseline='top';g.fillText(String(k),x+4,y+3);
  if(done.has(k)){g.strokeStyle='rgba(30,30,30,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x+6,y+6);g.lineTo(x+cw-6,y+ch-6);g.moveTo(x+cw-6,y+6);g.lineTo(x+6,y+ch-6);g.stroke();}k++;}
 // the pump house square: circled, and a note in the margin
 const [px,py]=P(-303,509);g.strokeStyle='rgba(190,30,20,.85)';g.lineWidth=3;g.beginPath();g.ellipse(px,py,w*.06,h*.05,.2,0,7);g.stroke();
 g.font=`${h*.032}px ${FAM.hand}`;g.fillStyle='rgba(190,30,20,.9)';g.textAlign='left';g.fillText('7 — pump hse / svc rd',px+w*.07,py-h*.04);g.fillText('bike tracks at gate',px+w*.07,py-h*.005);g.fillText('8/24 — not followed up?',px+w*.07,py+h*.03);
 const [lx,ly]=P(-208,579);g.fillStyle='#1e1e1e';g.font=`bold ${h*.026}px ${FAM.narrow}`;g.textAlign='center';g.fillText('BASE',lx,ly);
 g.font=`${h*.03}px ${FAM.hand}`;g.fillStyle='rgba(30,30,120,.85)';g.textAlign='right';g.fillText('Aug 24 1991',w*.95,h*.97);
 grain(g,w,h,w*h/60,.12,91);g.fillStyle='rgba(180,150,90,.18)';g.fillRect(0,0,w,h);// years of sun through the window
 for(const [x,y] of [[.03,.02],[.97,.02],[.03,.98],[.97,.98]]){g.fillStyle='#b8302a';g.beginPath();g.arc(w*x,h*y,5,0,7);g.fill();}}
// The register: its pages (drawn on demand when you turn them).
export const REGISTER=[
 {date:'',head:'CAMP WHIPPOORWILL — OFFICE LOG',lines:['Season 1991','','Staff sign in and out.','Visitors sign in at the office.','','— R. Delaney, Director']},
 {date:'AUG 12–16 1991',head:'',lines:['8/12  Session 3 arrives. 64 campers. Bus late (rain).','8/13  Owl cabin roof leaking over bunk 2. Tarped.','8/14  Canoe tipped at waterfront, everyone fine.','8/15  Skit night. Cardinal wins (again).','8/16  Session 3 closing campfire. Rain held off.']},
 {date:'AUG 17–23 1991',head:'',lines:['8/17  Buses 9:00. Camp closed for season.','8/18  D. & staff winterizing. Pump house shut down.','8/21  —','8/22  Twp. police called re: missing boy (Mill St.).','     Search to use lodge as base. Opened kitchen.','8/23  Volunteers 41. Grids 1–6 (south shore, dam).']},
 {date:'AUG 24 1991',head:'',lines:['8/24  Volunteers 33. Grids 7–12.','     Grid 7 (pump house / service rd):','     two bike tracks at the service gate, fresh.','     Searchers say both lead in. None out.','     Told Sgt. Pruitt. He says kids, cutting through.','8/25  Rain. Search called at 4:00.']},
 {date:'SEPT 1991',head:'',lines:['9/3   Lodge locked. Key to Authority.','9/9   Someone in the camp at night (light in','     the cabins), per Mrs. Carr on Route 9.','     Checked: nobody. Doors locked.','9/10  Same. Checked: nothing.','9/11  Asked Authority for a gate on the service rd.']},
 {date:'',head:'',lines:['','','','     (the rest of the pages are empty)','','']},
];
export function registerPageArt(g,w,h,i){const R=REGISTER[i]||REGISTER[0];g.fillStyle='#ece4cc';g.fillRect(0,0,w,h);g.strokeStyle='rgba(80,100,160,.35)';g.lineWidth=1;for(let y=h*.16;y<h;y+=h*.062){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
 g.strokeStyle='rgba(180,60,60,.45)';g.beginPath();g.moveTo(w*.1,0);g.lineTo(w*.1,h);g.stroke();
 if(R.head)text(g,R.head,w*.55,h*.08,h*.045,{w:w*.8,fam:FAM.narrow,color:'#1e1e1e'});if(R.date)text(g,R.date,w*.88,h*.08,h*.035,{w:w*.3,fam:FAM.narrow,color:'#3a3a3a',align:'right'});
 R.lines.forEach((l,k)=>{g.font=`${h*.038}px ${FAM.hand}`;g.fillStyle=k%2?'rgba(30,30,90,.9)':'rgba(20,20,60,.92)';g.textAlign='left';g.textBaseline='alphabetic';g.fillText(l,w*.12,h*(.205+k*.124));});
 g.fillStyle='rgba(170,140,90,.14)';g.fillRect(0,0,w,h);grain(g,w,h,w*h/90,.08,100+i);
 g.fillStyle='#8a8070';g.font=`${h*.03}px ${FAM.narrow}`;g.textAlign='center';g.fillText(String(i+1),w/2,h*.97);}
// A camp group photograph (the lodge wall): rows of kids, a year, a sun-faded print behind glass.
export function groupPhotoArt(year,seed){return (g,w,h)=>{const r=seeded(seed);g.fillStyle='#2a2218';g.fillRect(0,0,w,h);g.fillStyle='#e8dfc8';g.fillRect(w*.05,h*.06,w*.9,h*.78);
 const ph={x:w*.08,y:h*.09,w:w*.84,h:h*.62};const sky=g.createLinearGradient(0,ph.y,0,ph.y+ph.h);sky.addColorStop(0,year<1975?'#9ab0a8':'#8ab0c8');sky.addColorStop(.5,'#6a8a5a');sky.addColorStop(1,'#5a6a3a');g.fillStyle=sky;g.fillRect(ph.x,ph.y,ph.w,ph.h);
 // the lodge behind them
 g.fillStyle='#5a3a26';g.fillRect(ph.x+ph.w*.1,ph.y+ph.h*.18,ph.w*.8,ph.h*.34);g.fillStyle='#3a2a1e';g.beginPath();g.moveTo(ph.x+ph.w*.05,ph.y+ph.h*.2);g.lineTo(ph.x+ph.w*.5,ph.y+ph.h*.02);g.lineTo(ph.x+ph.w*.95,ph.y+ph.h*.2);g.fill();
 // three rows of campers, the counselors at the ends
 const shirts=year<1975?['#c8b890','#a8a088','#b8a070','#d0c8b0']:['#c8483a','#3a6aa8','#e8d048','#e8e4d8','#3a8a5a','#d07030'];
 for(let row=0;row<3;row++){const n=11+row,y=ph.y+ph.h*(.48+row*.16),s=ph.w/(n+1);for(let k=0;k<n;k++){const x=ph.x+s*(k+1)+(r()-.5)*3;g.fillStyle=shirts[Math.floor(r()*shirts.length)];g.fillRect(x-s*.32,y,s*.64,ph.h*.16);
  g.fillStyle=['#e0b490','#c89070','#8a5a3a','#f0c8a0'][Math.floor(r()*4)];g.beginPath();g.arc(x,y-s*.12,s*.22,0,7);g.fill();g.fillStyle=['#3a2a1a','#7a5230','#d8b070','#1e1610'][Math.floor(r()*4)];g.beginPath();g.arc(x,y-s*.22,s*.22,Math.PI,0);g.fill();}}
 g.fillStyle=year<1980?'rgba(200,160,90,.32)':'rgba(220,170,120,.22)';g.fillRect(ph.x,ph.y,ph.w,ph.h);
 text(g,`CAMP WHIPPOORWILL  ·  ${year}`,w/2,h*.78,h*.06,{w:w*.8,fam:FAM.serif,color:'#2a2218'});grain(g,w,h,w*h/50,.1,seed+9);
 g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(0,0);g.lineTo(w*.45,0);g.lineTo(0,h*.6);g.fill();};}
export function plaqueArt(g,w,h){wood(g,w,h,'#5a3a22',{seed:121});text(g,'CABIN OF THE WEEK',w/2,h*.09,h*.06,{w:w*.85,fam:FAM.serif,color:'#e8d8a8'});
 const rows=[['1984','CARDINAL'],['1985','ROBIN'],['1986','CARDINAL'],['1987','OWL'],['1988','BLUEJAY'],['1989','CARDINAL'],['1990','WREN'],['1991','CARDINAL']];
 rows.forEach(([y,n],i)=>{g.fillStyle='#c8a860';g.fillRect(w*.12,h*(.17+i*.098),w*.76,h*.075);text(g,`${y}  —  ${n}`,w/2,h*(.207+i*.098),h*.05,{w:w*.7,fam:FAM.serif,color:'#3a2616'});});grain(g,w,h,w*h/80,.1,122);}
export function bannerArt(g,w,h){g.fillStyle='#e8dcb8';g.fillRect(0,0,w,h);const cols=['#c8483a','#3a6aa8','#e8a030','#3a8a5a'];[...'WHIPPOORWILL'].forEach((ch,i)=>{text(g,ch,w*(.06+i*.08),h*.5,h*.62,{fam:FAM.block,color:cols[i%4]});});weather(g,w,h,{fade:.18,stain:.3,seed:131});}
export function scheduleArt(g,w,h){g.fillStyle='#ece6d0';g.fillRect(0,0,w,h);text(g,'CABIN SCHEDULE',w/2,h*.07,h*.06,{w:w*.8,fam:FAM.serif,color:'#2a2a2a'});
 const L=['7:00  Reveille','7:30  Flag & Breakfast','8:30  Cabin Clean-Up','9:30  Activity 1','10:30 Swim (BUDDIES!)','12:00 Lunch','1:00  Rest Hour','2:00  Activity 2','4:00  Free Swim','5:30  Flag & Supper','7:00  Evening Program','8:30  Cabins','9:00  Taps','9:15  LIGHTS OUT'];
 L.forEach((l,i)=>text(g,l,w*.1,h*(.15+i*.06),h*.042,{w:w*.85,weight:i===13?'bold':'normal',fam:FAM.type,color:'#2a2a2a',align:'left'}));weather(g,w,h,{fade:.16,stain:.4,seed:141});}
// Names carved into a bunk's end board over the years (and, in Owl, three letters that are new).
export function carvingArt(names,seed){return (g,w,h)=>{wood(g,w,h,'#a07a4e',{seed});const r=seeded(seed);g.lineCap='round';
 for(const n of names){const x=w*(.08+r()*.5),y=h*(.15+r()*.75),s=h*(.1+r()*.06),a=(r()-.5)*.3;g.save();g.translate(x,y);g.rotate(a);g.font=`bold ${s}px ${FAM.narrow}`;g.fillStyle='rgba(50,30,14,.75)';g.fillText(n,0,0);g.fillStyle='rgba(230,200,150,.35)';g.fillText(n,1,1);g.restore();}};}
export function freshCarvingArt(g,w,h){g.clearRect(0,0,w,h);g.lineCap='round';g.lineJoin='round';
 // J S A, gouged with something small and sharp, the wood under it pale and new; under them an arrow, and four short strokes
 const pale='rgba(238,214,168,.95)',edge='rgba(60,36,16,.6)';const stroke=(pts,lw)=>{for(const [c,wid,dx] of [[edge,lw+2,1],[pale,lw,0]]){g.strokeStyle=c;g.lineWidth=wid;g.beginPath();pts.forEach(([x,y],i)=>{const X=x*w+dx,Y=y*h+dx;if(i)g.lineTo(X,Y);else g.moveTo(X,Y);});g.stroke();}};
 const L=5;stroke([[.16,.12],[.2,.12],[.2,.42],[.16,.48],[.11,.44]],L);
 stroke([[.42,.16],[.34,.12],[.29,.2],[.36,.28],[.43,.34],[.39,.45],[.3,.43]],L);
 stroke([[.5,.48],[.58,.1],[.66,.48]],L);stroke([[.53,.34],[.63,.34]],L);
 stroke([[.18,.68],[.6,.68]],L-1);stroke([[.52,.6],[.62,.68],[.52,.76]],L-1);
 for(let k=0;k<4;k++)stroke([[.72+k*.045,.58],[.73+k*.045,.8]],L-1.5);}
