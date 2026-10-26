// Chapter Six: what is handled, read and handed over. Every page here is drawn by the game (canvas), every object is a
// prop physical.js can put in a hand (a grip) or on a table.
//
//  planArt:      the township's storm sewer plan, sheet 3 of 7 (1958, revised 1974), as Reyes unrolls it on Sam's card
//                table; Sam's pencil marks on it as he works it out (marks: the set of them drawn so far).
//  fileArt:      photocopies from the 1991 Whitcomb file and the 1966 blotter, in Reyes's folder.
//  logArt:       the gate log in the works' control room, Brandt's hand, 1991 to yesterday.
//  evidence bag, Reyes's notebook, the handheld radio (Sam carries it at the works), a weather radio, Alex's helmet.
import * as THREE from './three.module.js';
import {paper,makeShapes} from './chapter6-kit.js';
import {makeHelmet} from './alex-room.js';

const ink='#26357a',inkL='rgba(38,53,122,.55)',pencil='rgba(60,60,64,.88)';
function hand(g,txt,x,y,{size=18,color=pencil,rot=0,font='Comic Sans MS, Segoe Print, cursive'}={}){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=color;g.font=`${size}px ${font}`;g.fillText(txt,0,0);g.restore();}
// (where things are on the plan, in its own 0..1 coordinates: what Sam circles, what the camera can zoom onto)
export const PLAN={briarwood:[.62,.68],culvert:[.57,.6],outfall:[.66,.43],works:[.48,.24],bridge:[.22,.3],mill:[.11,.29],rack:[.5,.29]};
export function planArt(g,w,h,marks=new Set()){
 g.fillStyle='#ebe6d2';g.fillRect(0,0,w,h);for(let i=0;i<2200;i++){g.fillStyle=`rgba(120,110,80,${Math.random()*.05})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}
 // folds and a coffee ring nobody admits to
 g.strokeStyle='rgba(90,80,60,.15)';g.lineWidth=2;for(const x of [w/3,w*2/3]){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();
 g.strokeStyle='rgba(120,80,40,.18)';g.lineWidth=5;g.beginPath();g.arc(w*.86,h*.18,34,0,6);g.stroke();
 const X=v=>v*w,Y=v=>v*h,line=(pts,{width=3,dash=null,color=ink}={})=>{g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash||[]);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y)));g.stroke();g.setLineDash([]);};
 const label=(t,x,y,{size=15,rot=0,bold=false,color=ink}={})=>{g.save();g.translate(X(x),Y(y));g.rotate(rot);g.fillStyle=color;g.font=`${bold?'bold ':''}${size}px Courier New, monospace`;g.fillText(t,0,0);g.restore();};
 // the streets (thin double lines), the neighbourhood's blocks
 const street=(pts,name,lx,ly,rot=0)=>{line(pts,{width:9,color:inkL});line(pts,{width:5,color:'#ebe6d2'});label(name,lx,ly,{size:13,rot});};
 street([[.98,.86],[.8,.8],[.66,.74],[.46,.76],[.3,.82]],'OAK HOLLOW DR.',.7,.83,-.05);street([[.66,.74],[.62,.66],[.6,.58]],'BRIARWOOD LN.',.63,.73,-1.2);street([[.46,.76],[.38,.6],[.33,.46],[.3,.32]],'SUMMERFIELD RD.',.37,.66,-1.15);
 street([[.3,.32],[.2,.3],[.06,.29]],'MILL ST.',.07,.27);street([[.06,.2],[.3,.2],[.62,.18],[.98,.17]],'OLD MILL RD.',.7,.16);label('DOWNTOWN',.03,.33,{size:12});g.fillStyle=ink;g.fillRect(X(.205),Y(.285),22,6);label('MILL ST. BR.',.19,.26,{size:11});
 // Line 4: the Briarwood channel, under the yards, the trunk through the woods, the outfall
 line([[.64,.69],[.6,.64],[.57,.6]],{width:4});label('BRIARWOOD CH.',.53,.66,{size:12});
 line([[.57,.6],[.6,.53],[.64,.47],[.66,.43]],{width:6,dash:[14,8]});label('LINE 4  (66" RCP)',.62,.55,{size:13,bold:true,rot:-1.05});
 g.fillStyle=ink;g.fillRect(X(.655),Y(.425),14,10);label('OUTFALL 4',.68,.43,{size:13});
 // the creek, natural channel, north to the works
 line([[.66,.43],[.63,.38],[.6,.34],[.55,.3],[.5,.26]],{width:3,dash:[4,5]});label('CREEK (NAT. CH.)',.6,.37,{size:12,rot:-.7});
 // Line 2 from Mill Street, brick
 line([[.2,.3],[.3,.3],[.4,.27],[.47,.25]],{width:6,dash:[3,4]});label('LINE 2 — MILL ST.',.25,.34,{size:13,bold:true});label('BRICK 1908  42"',.26,.37,{size:12});
 // the works: the structure, its gates, the trash rack
 g.strokeStyle=ink;g.lineWidth=3;g.strokeRect(X(.465),Y(.215),40,30);g.fillStyle=ink;for(const dx of [8,22])g.fillRect(X(.465)+dx,Y(.215),3,30);g.fillRect(X(.465)+30,Y(.215)+12,8,3);
 label('MILL CREEK ISOLATION WORKS',.39,.205,{size:14,bold:true});label('GATE STRUCTURE NO. 2',.42,.235,{size:12});label('GATES 1, 2 · ISOL. GATE 2B',.505,.26,{size:11});
 line([[.49,.28],[.5,.3]],{width:2});label('TRASH RACK',.5,.32,{size:11});
 line([[.5,.215],[.5,.17],[.52,.08],[.55,0]],{width:4});label('TO MILL CREEK',.53,.06,{size:12});
 // north arrow, scale, title block
 g.save();g.translate(X(.92),Y(.32));g.fillStyle=ink;g.beginPath();g.moveTo(0,-40);g.lineTo(10,0);g.lineTo(-10,0);g.fill();g.font='bold 18px Courier New';g.fillText('N',-6,22);g.restore();
 g.strokeStyle=ink;g.lineWidth=2;g.strokeRect(X(.7),Y(.88),X(.28),Y(.1));label('OAK HOLLOW TOWNSHIP',.71,.91,{size:13,bold:true});label('DEPT. OF PUBLIC WORKS',.71,.935,{size:12});
 label('STORM SEWER SYSTEM · SHEET 3 OF 7',.71,.958,{size:12});label('1958 · REV. 1974',.71,.978,{size:11});
 // Sam's pencil (as he says it)
 const ring=(p,r=22)=>{g.strokeStyle=pencil;g.lineWidth=2.5;g.beginPath();g.ellipse(X(p[0]),Y(p[1]),r,r*.8,.2,0,6.6);g.stroke();};
 if(marks.has('alex')){ring(PLAN.briarwood,20);hand(g,'Alex 8/20',X(PLAN.briarwood[0])+18,Y(PLAN.briarwood[1])+30,{size:17});}
 if(marks.has('line4')){g.strokeStyle=pencil;g.lineWidth=2;g.beginPath();g.moveTo(X(.585),Y(.6));g.lineTo(X(.66),Y(.44));g.stroke();hand(g,'helmet 8/22',X(.66),Y(.5),{size:15});}
 if(marks.has('dw')){ring(PLAN.bridge,26);hand(g,"'91 D.W. culvert",X(.15),Y(.42),{size:16});}
 if(marks.has('rac')){ring(PLAN.mill,22);hand(g,"'66 R.A.C. bell",X(.02),Y(.2),{size:16});}
 if(marks.has('meet')){g.strokeStyle=pencil;g.lineWidth=2;for(const [a,b] of [[[.3,.3],[.47,.25]],[[.62,.4],[.5,.26]]]){g.beginPath();g.moveTo(X(a[0]),Y(a[1]));g.lineTo(X(b[0]),Y(b[1]));g.stroke();}}
 if(marks.has('works')){g.strokeStyle=pencil;g.lineWidth=3;g.beginPath();g.ellipse(X(PLAN.works[0])+18,Y(PLAN.works[1])+6,62,40,0,0,6.6);g.stroke();hand(g,'?',X(.58),Y(.2),{size:34});}
 if(marks.has('rack')){g.strokeStyle=pencil;g.lineWidth=2;g.beginPath();g.moveTo(X(.5),Y(.3));g.lineTo(X(.56),Y(.36));g.stroke();hand(g,'helmet → here?',X(.53),Y(.39),{size:15});}}
export function fileArt(g,w,h,page=0){g.fillStyle='#f2f0ea';g.fillRect(0,0,w,h);for(let i=0;i<1800;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,1,1);}
 g.fillStyle='#1a1a1a';g.font='bold 22px Courier New';g.textAlign='left';
 const L=page===0?['OAK HOLLOW POLICE DEPARTMENT','SUPPLEMENTARY REPORT — CASE 91-0821','SUBJECT: WHITCOMB, DANIEL J. (12)','','08/21/91  LAST SEEN RIDING GREEN BICYCLE, MILL ST.','08/24/91  SEARCH BASE CAMP WHIPPOORWILL. GRID 7:','          TWO BICYCLE TRACKS AT SERVICE GATE.','          SGT. PRUITT: "KIDS, CUTTING THROUGH."','08/27/91  0640 PUBLIC WORKS (R. BRANDT): ISOLATION','          GATE 2B, MILL CREEK WORKS, FOUND OPEN.','          PADLOCK MISSING. K-9 WOULD NOT ENTER','          LINE 2. NEGATIVE.','09/09/91  2340 PALE PERSON IN STORM CULVERT UNDER','          MILL ST. BRIDGE (LINE 2 OUTLET). BELL.']
  :['OAK HOLLOW TWP. POLICE — DAILY BLOTTER','AUGUST 23, 1966','','2130  CARVER, RUTH ANN (11). REPORTED MISSING.','      RODE BICYCLE DOWNTOWN TO THE LYRIC 1830.','      DID NOT RETURN.','2245  SEARCHERS ALONG MILL ST. AND THE CREEK','      TO THE NEW GATE WORKS. NEGATIVE.','2350  BICYCLE BELL HEARD AT MILL ST. CULVERT','      BY SEARCHER (W. KELLER). NOT LOCATED.'];
 L.forEach((t,i)=>{g.font=(i<3?'bold ':'')+(i<3?20:17)+'px Courier New';g.fillText(t,40,60+i*32);});
 g.fillStyle='rgba(180,30,30,.75)';g.font='bold 22px Courier New';g.save();g.translate(w*.68,h*.88);g.rotate(-.12);g.fillText('COPY',0,0);g.restore();}
export function logArt(g,w,h){g.fillStyle='#ece6cf';g.fillRect(0,0,w,h);g.strokeStyle='rgba(60,90,160,.3)';g.lineWidth=1;for(let y=70;y<h;y+=30){g.beginPath();g.moveTo(20,y);g.lineTo(w-20,y);g.stroke();}
 g.strokeStyle='rgba(170,40,40,.4)';g.beginPath();g.moveTo(110,0);g.lineTo(110,h);g.stroke();
 g.fillStyle='#1a1a1a';g.font='bold 20px Courier New';g.fillText('MILL CREEK WORKS — GATE LOG',24,40);
 const E=[['8/22/91','rain 1.4". gates 1+2 at 2 ft.  RB'],['8/27/91','0610 2B FOUND OPEN. padlock gone.'],['','hasp ok, no tool marks. called OHPD.  RB'],['8/28/91','new padlock 2B + Line 2 grille.  RB'],
  ['4/2/98','2B brake spring replaced.  RB'],['3/14/11','new lock, Line 2 grille.  RB'],['6/2/11','2B brake spring broken AGAIN. hand'],['','brake only. parts req. #4471 (again)'],['8/24/11','bar screen cleaned. kid’s bike helmet'],['','(red, "17") in rack. kept in bin.  RB']];
 E.forEach(([d,t],i)=>{hand(g,d,24,92+i*30,{size:17,color:'#1e2a5a'});hand(g,t,120,92+i*30,{size:17,color:'#1e2a5a'});});}
function canvasMat(w,h,draw,{rough=.9,side=THREE.FrontSide}={}){const t=paper(w,h,draw);return new THREE.MeshStandardMaterial({map:t,color:t?0xffffff:0xe8e2cc,roughness:rough,side});}

export function createProps6(){
 const S=makeShapes();const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
 // the plan: a rolled sheet (when carried) or a flat one (on the table), its texture redrawn when Sam marks it
 const planMarks=new Set();let planTex=null;const planCanvas=(()=>{const t=paper(1024,768,(g,w,h)=>planArt(g,w,h,planMarks));planTex=t;return t?.userData?.canvas||null;})();
 const planM=new THREE.MeshStandardMaterial({map:planTex,color:planTex?0xffffff:0xe8e2cc,roughness:.92,side:THREE.DoubleSide});
 const plan=new THREE.Group();plan.name='drainage-plan';const sheet=new THREE.Mesh(new THREE.PlaneGeometry(.92,.69),planM);sheet.rotation.x=-Math.PI/2;sheet.position.y=.003;plan.add(sheet);
 const roll=S.cyl(plan,0,.035,0,.035,.92,mat(0xe6e0c8),{rz:Math.PI/2});roll.visible=false;
 function mark(id){if(planMarks.has(id))return false;planMarks.add(id);if(planCanvas){const g=planCanvas.getContext('2d');planArt(g,planCanvas.width,planCanvas.height,planMarks);planTex.needsUpdate=true;}return true;}
 function rolled(on){roll.visible=on;sheet.visible=!on;}
 // the folder: a manila folder, open, two photocopied pages
 const folder=new THREE.Group();folder.name='whitcomb-file';S.box(folder,0,.004,0,.24,.006,.31,mat(0xd8b878));
 const pages=[0,1].map(i=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.215,.28),canvasMat(768,1000,(g,w,h)=>fileArt(g,w,h,i)));m.rotation.set(-Math.PI/2,0,i?.06:-.03);m.position.set(i?.05:-.02,.009+i*.002,i?.03:0);folder.add(m);return m;});void pages;
 // the evidence bag: brown paper, folded over, its label filled in (Reyes writes it at the table)
 const bag=new THREE.Group();bag.name='evidence-bag';S.box(bag,0,.15,0,.26,.3,.07,mat(0xa88a5c,{roughness:1}));S.box(bag,0,.31,0,.26,.03,.075,mat(0x98784c,{roughness:1}));
 const label=new THREE.Mesh(new THREE.PlaneGeometry(.2,.13),canvasMat(256,170,(g,w,h)=>{g.fillStyle='#f4f2ea';g.fillRect(0,0,w,h);g.fillStyle='#b02020';g.font='bold 18px Arial';g.fillText('EVIDENCE  · OHPD',8,22);g.fillStyle='#222';g.font='12px Arial';
  ['CASE 11-0821   ITEM 3','DESC: shirt, gold, boys, collar','FROM: Camp Whippoorwill, "Owl"','DATE: 8/24/11  ~1930 (per wit.)','OFC: REYES  #212'].forEach((t,i)=>g.fillText(t,8,48+i*24));}));label.position.set(0,.16,.037);bag.add(label);
 // Reyes's notebook and pen
 const notebook=new THREE.Group();notebook.name='reyes-notebook';S.box(notebook,0,0,0,.09,.012,.14,mat(0x2a2a2e));S.box(notebook,0,.007,0,.085,.002,.135,mat(0xf2f0e6));
 // a handheld radio (the township's: grey, a stubby antenna, a belt clip); a weather radio for the workbench
 function radioMesh(color=0x2a2c2e){const g=new THREE.Group();g.name='handheld-radio';S.box(g,0,0,0,.06,.13,.035,mat(color,{roughness:.6}));S.cyl(g,.018,.1,0,.008,.08,mat(0x111111));S.box(g,0,.035,.018,.04,.03,.002,mat(0x9ab08a,{emissive:0x3a5a2a,emissiveIntensity:.4}));for(let i=0;i<5;i++)S.box(g,0,-.02-i*.009,.018,.04,.003,.002,mat(0x111111));return g;}
 const radio=radioMesh(0x3a3c3a);
 const wxRadio=new THREE.Group();wxRadio.name='weather-radio';S.box(wxRadio,0,.06,0,.24,.12,.09,mat(0xd8d2c0,{roughness:.5}));S.box(wxRadio,-.05,.065,.046,.1,.07,.002,mat(0x3a3a3a));S.box(wxRadio,.07,.08,.046,.06,.025,.002,mat(0xc0402a,{emissive:0xff3a20,emissiveIntensity:.8}));S.cyl(wxRadio,.1,.2,0,.004,.2,mat(0x9a9a9a,{metalness:.7}));
 // Alex's helmet: the same one (17), found in the bar screen; its strap broken where it caught on a fence in June
 const helmet=makeHelmet();helmet.name='alex-helmet-found';
 // the bin it was kept in
 const bin=new THREE.Group();bin.name='debris-bin';S.box(bin,0,.11,0,.46,.22,.34,mat(0x2a4a7a,{roughness:.6}));S.box(bin,0,.005,0,.42,.01,.3,mat(0x3a3020));
 // the gate log, open on the desk
 const log=new THREE.Group();log.name='gate-log';S.box(log,0,.006,0,.44,.012,.3,mat(0x2a3a2a));const pg=new THREE.Mesh(new THREE.PlaneGeometry(.2,.28),canvasMat(512,720,logArt));pg.rotation.x=-Math.PI/2;pg.position.set(.11,.014,0);log.add(pg);const pg2=new THREE.Mesh(new THREE.PlaneGeometry(.2,.28),mat(0xece6cf));pg2.rotation.x=-Math.PI/2;pg2.position.set(-.11,.014,0);log.add(pg2);
 // a grey blanket (a firefighter puts it round Jamie)
 const blanket=new THREE.Mesh((()=>{const g=new THREE.PlaneGeometry(1.1,.9,8,8),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*7)*.03+Math.cos(p.getY(i)*5)*.02);g.computeVertexNormals();return g;})(),mat(0x6a6e72,{roughness:1,side:THREE.DoubleSide}));blanket.name='blanket';
 // Sam's notebook: spiral-bound, open flat; his week on the left page, WATER and its arrows on the right
 const samNotes=new THREE.Group();samNotes.name='sam-notebook';
 {const hand=(g,lines,x0,y0,lh,font)=>{g.fillStyle='#24324a';g.font=font;lines.forEach((t,i)=>{if(t)g.fillText(t,x0+(i%3)*.6,y0+i*lh);});};
  const ruled=(g,w,h)=>{g.fillStyle='#f6f3e8';g.fillRect(0,0,w,h);g.strokeStyle='rgba(90,130,190,.35)';g.lineWidth=2;for(let y=86;y<h;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.strokeStyle='rgba(200,80,80,.45)';g.beginPath();g.moveTo(52,0);g.lineTo(52,h);g.stroke();};
  const left=canvasMat(512,720,(g,w,h)=>{ruled(g,w,h);const f='bold 21px "Comic Sans MS","Bradley Hand","Segoe Print",cursive';
   hand(g,['WHAT HAPPENED','SUN 8/21  8:02pm  Alex down Briarwood.','  rang twice. Gone. Bell at the creek.','  his BIKE. police (Reyes: "okay")','MON 8/22  the recording. night: tunnel.','  HELMET on a ledge. DRY.','  the old bike. we ran.','TUE 8/23  downtown. TV = Alex at','  Pine Ridge. phone "Jamie?" Lyric.','WED 8/24  camp. J S A + 4 marks.','  shirt (Owl). JAMIE x2','THU 8/25  2am "Jamie" calls me','  from our yard. NOT JAMIE.'],60,78,40,f);});
  const right=canvasMat(512,720,(g,w,h)=>{ruled(g,w,h);g.strokeStyle='#24324a';g.lineWidth=3;g.strokeRect(150,44,200,58);g.fillStyle='#24324a';g.font='bold 40px "Comic Sans MS","Bradley Hand",cursive';g.fillText('WATER',178,90);
   const f='20px "Comic Sans MS","Bradley Hand","Segoe Print",cursive';hand(g,['creek (Briarwood) -> culvert','  -> Line 4 -> woods -> outfall','Pine Ridge = reservoir','dogs sit down at culverts','1966 bell @ Mill St culvert','1991 "pale" in Mill St culvert','  (Line 2?)','','where does it all GO?'],60,158,40,f);
   g.strokeStyle='#24324a';g.lineWidth=2;g.beginPath();g.moveTo(250,104);g.lineTo(250,140);g.stroke();g.beginPath();g.moveTo(60,500);g.lineTo(300,500);g.stroke();});
  for(const [i,m] of [[0,left],[1,right]]){const pg=new THREE.Mesh(new THREE.PlaneGeometry(.15,.21),m);pg.rotation.set(-Math.PI/2,0,(i?1:-1)*.02);pg.position.set(i?.077:-.077,.006,0);samNotes.add(pg);}
  S.box(samNotes,0,.002,0,.31,.004,.215,mat(0x2c4a7a));for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.007,.0015,4,10),mat(0x9a9a9a,{metalness:.7,roughness:.3}));r.position.set(0,.008,-.095+k*.024);r.rotation.y=Math.PI/2;samNotes.add(r);}}
 for(const o of [plan,folder,bag,notebook,radio,wxRadio,helmet,bin,log,blanket,samNotes])o.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});
 return {plan,planM,mark,rolled,planMarks,folder,bag,notebook,radio,radioMesh,wxRadio,helmet,bin,log,blanket,samNotes};
}
