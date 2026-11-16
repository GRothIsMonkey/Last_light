// Aftermath II and 2026: the things that came out of 2011 with you, and a few of 2021's.
//
//  notebook     Sam's spiral notebook (prop.sam-notebook): ONE builder here for 2021 and 2026. Spiral-bound as Chapter Seven has it
//               and the canon says; the blue cover it had on your lap on the road out of Oak Hollow (aftermath1-leaving.js
//               0x2c4a7a); the same size (Aftermath I's 0.16 × 0.21 m); the same pages (chapter7-props.js notebookPage: the names in
//               your writing, ALEX · JAMIE · SAM). Inside the back cover, in Sam's square printing: his aunt's number, his dad's
//               e-mail (the line rubbed away by ten years of a thumb), and RULE 6. WRITE BACK. Aged: the cover faded and worn pale at
//               the corners, a crease, the pages yellowed a little. (Chapter Seven's room shows a green cover: a continuity
//               conflict that predates this work, recorded in docs/FINAL_CODA_HANDOFF.md for the art pass.)
//  print        the Sunday print from Alex's father (aftermath1-props.js tex9('sunday')): four bikes in the grass, three of you,
//               because he was the one holding it. It lives in the back of the notebook now.
//  booth        the photo-booth strip from the mall in June (tex9('booth')): four frames, four of you; Alex in his helmet in every one.
//               The one picture of all four. Yours since your room in October (in the box, or kept out).
//  cap          Jamie's cap, only where the save says you kept it (the same builder as aftermath1-scenes.js capG: one design).
//  phone        your phone, on the dash: Sam's texts.
//  car          your car (a used compact, 2021): the world's car model with a cabin to sit in, the notebook (and the cap) on the
//               passenger seat.
import * as THREE from './three.module.js';
import {tex9} from './aftermath1-props.js';
import {notebookPage,texOf,canvas} from './chapter7-props.js';
import {makeCar} from './props.js';
import {createKit} from './kit.js';

const mat=(c,o={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});m.name='a2-prop';return m;};
// ---- the pages ----------------------------------------------------------------------------------------------------------------------
// aged: ten (or fifteen) years on a page: a warmer, yellower sheet, faded ink, foxing at the edges
function age(cv,k=1){if(!cv)return cv;const {g,c}=cv,w=c.width,h=c.height;g.save();g.globalCompositeOperation='multiply';g.fillStyle=`rgba(244,226,186,${.32*k})`;g.fillRect(0,0,w,h);
 const r=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.7);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(1,`rgba(170,140,96,${.35*k})`);g.fillStyle=r;g.fillRect(0,0,w,h);
 for(let i=0;i<30*k;i++){const x=Math.random()*w,y=Math.random()*h,s=1+Math.random()*3;g.fillStyle=`rgba(150,112,70,${.08+Math.random()*.1})`;g.beginPath();g.arc(x,y,s,0,7);g.fill();}g.restore();return cv;}
export function namesPage(k=1){return age(notebookPage('names',{names:'ALEX\nJAMIE\nSAM'}),k);}
// inside the back cover: Sam's square printing (Courier, like his pages in Chapter Seven)
export function backCover(k=1){const cv=canvas(512,680);if(!cv)return null;const {g}=cv,w=512,h=680;
 g.fillStyle='#d9cdb4';g.fillRect(0,0,w,h);// the board inside the cover, not ruled
 for(let i=0;i<4000;i++){g.fillStyle=`rgba(${120+Math.random()*60},${100+Math.random()*50},${70+Math.random()*40},.06)`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}
 g.fillStyle='#24293a';g.font='26px "Courier New", monospace';
 g.fillText('MY AUNT’S #',56,120);g.font='bold 30px "Courier New", monospace';g.fillText('(555) 555-0143',56,162);
 g.font='26px "Courier New", monospace';g.fillText('MY DAD’S EMAIL',56,250);
 // (the e-mail line, where a thumb holds the cover: rubbed down to a grey smear and an @)
 g.fillStyle='rgba(36,41,58,.5)';g.font='26px "Courier New", monospace';g.fillText('  ',56,292);const sm=g.createLinearGradient(56,0,440,0);sm.addColorStop(0,'rgba(60,64,80,.55)');sm.addColorStop(.45,'rgba(70,72,84,.18)');sm.addColorStop(1,'rgba(70,72,84,.05)');
 g.fillStyle=sm;g.fillRect(56,272,380,26);g.fillStyle='rgba(36,41,58,.62)';g.fillText('@',222,294);
 g.strokeStyle='#24293a';g.lineWidth=3;g.beginPath();g.moveTo(52,360);g.lineTo(460,360);g.stroke();
 g.fillStyle='#1e2333';g.font='bold 40px "Courier New", monospace';g.fillText('RULE 6.',56,430);g.fillText('WRITE BACK.',56,482);
 g.font='italic 18px Georgia';g.fillStyle='rgba(36,41,58,.8)';g.fillText('- S.',380,520);
 return age(cv,k*.9);}
export function frontCover(k=1){const cv=canvas(512,680);if(!cv)return null;const {g}=cv,w=512,h=680;
 g.fillStyle='#2c4a7a';g.fillRect(0,0,w,h);
 // worn: lighter at the corners and the edges, a crease, scuffs
 const e=g.createRadialGradient(w/2,h/2,w*.25,w/2,h/2,w*.8);e.addColorStop(0,'rgba(255,255,255,0)');e.addColorStop(1,`rgba(214,220,226,${.38*k})`);g.fillStyle=e;g.fillRect(0,0,w,h);
 for(const [x,y] of [[0,0],[w,0],[0,h],[w,h]]){const c2=g.createRadialGradient(x,y,0,x,y,90);c2.addColorStop(0,`rgba(225,226,220,${.55*k})`);c2.addColorStop(1,'rgba(225,226,220,0)');g.fillStyle=c2;g.fillRect(0,0,w,h);}
 g.strokeStyle=`rgba(200,206,214,${.35*k})`;g.lineWidth=2;g.beginPath();g.moveTo(40,h*.62);g.bezierCurveTo(200,h*.6,300,h*.66,w-30,h*.63);g.stroke();
 for(let i=0;i<60;i++){g.strokeStyle=`rgba(210,214,220,${Math.random()*.18*k})`;g.lineWidth=1;const x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.random()*30-15,y+Math.random()*6-3);g.stroke();}
 // the label: what he wrote on it in August 2011
 g.fillStyle='#ede6d2';g.fillRect(150,120,240,110);g.strokeStyle='#8a7a5a';g.lineWidth=2;g.strokeRect(150,120,240,110);
 g.fillStyle='#2a2f3a';g.font='22px "Courier New", monospace';g.fillText('SAM',172,165);g.font='16px "Courier New", monospace';g.fillText('PRIVATE (MOSTLY)',172,200);
 return cv;}
const TEX=new Map();
function tex(key,fn){if(!TEX.has(key))TEX.set(key,texOf(fn())||null);return TEX.get(key);}
export const PAGES={front:k=>tex('front'+k,()=>frontCover(k)),names:k=>tex('names'+k,()=>namesPage(k)),back:k=>tex('back'+k,()=>backCover(k)),
 sunday:()=>{if(!TEX.has('sunday'))TEX.set('sunday',tex9('sunday')||null);return TEX.get('sunday');},booth:()=>{if(!TEX.has('booth'))TEX.set('booth',tex9('booth')||null);return TEX.get('booth');}};

// ---- the notebook (closed, lying down: its local y is up, the spine on its left) ------------------------------------------------------
export function samNotebook({k=1,open=false}={}){const g=new THREE.Group();g.name='sam-notebook';const W=.16,D=.21,T=.014;
 const coverTex=PAGES.front(k),cover=new THREE.MeshStandardMaterial({color:coverTex?0xffffff:0x2c4a7a,map:coverTex,roughness:.78});cover.name='sam-notebook-cover';
 const edge=mat(0xe4dcc8,{roughness:.95}),back=mat(0x253f69,{roughness:.8}),wire=mat(0x9a9a9a,{metalness:.65,roughness:.35});
 const pages=new THREE.Mesh(new THREE.BoxGeometry(W-.004,T-.004,D-.004),edge);pages.position.y=T/2;g.add(pages);
 const top=new THREE.Mesh(new THREE.PlaneGeometry(W,D),cover);top.rotation.x=-Math.PI/2;top.position.y=T+.0005;g.add(top);
 const bot=new THREE.Mesh(new THREE.PlaneGeometry(W,D),back);bot.rotation.x=Math.PI/2;bot.position.y=-.0002;g.add(bot);
 for(let i=0;i<13;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.0075,.0012,5,12),wire);r.rotation.y=Math.PI/2;r.position.set(-W/2+.002,T/2,-D/2+.012+i*(D-.024)/12);g.add(r);}
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});g.userData.size={W,D,T};return g;}
// the notebook held up and open: a page you can turn (Q/E). pages: 'front' (the cover), 'names', 'back' (inside the back cover, the print in it)
export function notebookHeld({k=1,print=true}={}){const g=new THREE.Group();g.name='sam-notebook-held';const W=.24,H=.32;
 const sheet=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});sheet.toneMapped=true;sheet.name='a2-page';
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(W,H),sheet);g.add(plane);
 const spine=new THREE.Mesh(new THREE.BoxGeometry(.012,H,.01),mat(0x9a9a9a,{metalness:.6}));spine.position.set(-W/2-.006,0,0);g.add(spine);
 // the Sunday print, tucked in the back cover (shown on that page only)
 const pt=PAGES.sunday(),pm=new THREE.MeshBasicMaterial({map:pt||null,color:pt?0xffffff:0xe8d8b8,side:THREE.DoubleSide});pm.name='a2-print';const pr=new THREE.Mesh(new THREE.PlaneGeometry(.13,.098),pm);pr.position.set(.045,-.152,.002);pr.rotation.z=-.07;// (its top edge below “- S.”: sticking out of the bottom of the cover, RULE 6 clear above it)
 g.add(pr);pr.visible=false;
 const order=['front','names','back'],S={i:0,turns:0,seen:new Set(['front'])};
 function show(){const key=order[S.i],t=PAGES[key](k);sheet.map=t||null;sheet.color.setHex(t?0xffffff:key==='front'?0x2c4a7a:0xf4efe2);sheet.needsUpdate=true;pr.visible=key==='back'&&print;S.seen.add(key);}
 show();
 const pages={turn(dir){const n=Math.max(0,Math.min(order.length-1,S.i+dir));if(n!==S.i){S.i=n;S.turns++;show();}},get page(){return order[S.i];},get seen(){return [...S.seen];},go(key){const i=order.indexOf(key);if(i>=0){S.i=i;show();}},S};
 return {g,pages};}
export function printHeld(){const t=PAGES.sunday();const m=new THREE.MeshBasicMaterial({map:t||null,color:t?0xffffff:0xe8d8b8,side:THREE.DoubleSide});m.name='a2-print-held';const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(.24,.18),m));
 // the back of it: his father's pencil, "Sunday 8/21 7:26"
 return g;}
export function boothStrip({k=1,w=.05,h=.175}={}){const t=PAGES.booth();const m=new THREE.MeshStandardMaterial({map:t||null,color:t?0xffffff:0xf4f1ea,roughness:.55,side:THREE.DoubleSide});m.name='a2-booth';
 if(t&&k>0){/* (fifteen years: the colours a little warmer and lower) */m.color.setRGB(1,.96,.88);}const g=new THREE.Group();g.name='booth-strip';const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.castShadow=true;p.receiveShadow=true;g.add(p);return g;}
// Jamie's cap: aftermath1-scenes.js capG's design exactly (the same dome, brim and button, the same blue)
export function jamieCap({faded=0}={}){const g=new THREE.Group();g.name='jamie-cap';const c=new THREE.Color(0x2d4a7a).lerp(new THREE.Color(0x56668a),faded);const m=new THREE.MeshStandardMaterial({color:c,roughness:.85});m.name='jamie-cap';
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.105,14,8,0,Math.PI*2,0,Math.PI/2),m);dome.scale.set(1,.72,1.1);g.add(dome);
 const brim=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.012,14,1,false,-.9,1.8),m);brim.scale.set(1,1,1.25);brim.position.set(0,.004,-.1);g.add(brim);
 const btn=new THREE.Mesh(new THREE.SphereGeometry(.012,6,5),m);btn.position.y=.078;g.add(btn);g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return g;}

// ---- your phone: Sam's texts (2021; no brand, no logo) --------------------------------------------------------------------------------
export function phoneScreen(msgs){const cv=canvas(360,720);if(!cv)return null;const {g}=cv,w=360,h=720;g.fillStyle='#0d1014';g.fillRect(0,0,w,h);
 g.fillStyle='#c8ccd2';g.font='600 22px Arial';g.fillText('Sam',w/2-22,58);g.fillStyle='#5a6068';g.font='14px Arial';g.fillText('Today',w/2-20,92);
 let y=130;for(const [from,text,time] of msgs){const mine=from==='you',lines=wrapText(g,text,230,'19px Arial');const bh=lines.length*26+18,bw=Math.min(250,Math.max(...lines.map(l=>g.measureText(l).width))+30);
  g.fillStyle=mine?'#3d6fb6':'#2a2e34';const x=mine?w-bw-18:18;roundRect(g,x,y,bw,bh,16);g.fill();g.fillStyle=mine?'#f2f4f8':'#e2e4e8';g.font='19px Arial';lines.forEach((l,i)=>g.fillText(l,x+15,y+30+i*26));
  if(time){g.fillStyle='#5a6068';g.font='12px Arial';g.fillText(time,mine?w-62:22,y+bh+16);}y+=bh+30;}
 return cv;}
function wrapText(g,text,max,font){g.font=font;const words=text.split(' '),out=[];let line='';for(const wd of words){const t=line?line+' '+wd:wd;if(g.measureText(t).width>max&&line){out.push(line);line=wd;}else line=t;}if(line)out.push(line);return out;}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
export const TEXTS0=[['sam','text me when youre close','3:12 PM'],['you','Leaving now. 2 hrs','3:40 PM'],['sam','ok','3:41 PM']];
export const TEXTS1=[...TEXTS0,['sam','at the curb. the old one','5:38 PM']];
export function phoneModel(){const g=new THREE.Group();g.name='a2-phone';const body=new THREE.Mesh(new THREE.BoxGeometry(.072,.15,.009),mat(0x16181b,{roughness:.4,metalness:.3}));g.add(body);
 const sm=new THREE.MeshBasicMaterial({color:0x0d1014});sm.name='a2-phone-screen';const sc=new THREE.Mesh(new THREE.PlaneGeometry(.066,.138),sm);sc.position.z=.0047;g.add(sc);
 const set=msgs=>{const t=texOf(phoneScreen(msgs));if(t){sm.map=t;sm.color.setHex(0xffffff);sm.needsUpdate=true;}};set(TEXTS0);
 const mount=new THREE.Mesh(new THREE.BoxGeometry(.05,.03,.04),mat(0x1c1e20));mount.position.set(0,-.06,-.02);g.add(mount);return {g,set,screen:sc};}

// ---- your car: a used compact (the world's sedan, in a 2020-ish blue-grey), with a cabin to sit in --------------------------------------
// local frame: +x your right, -z forward; the driver's seat on the left (x -.42)
export function createCar21(){const KT=createKit(),g=new THREE.Group();g.name='a2-car';makeCar(KT,g,'sedan',0x3b4a5c,{lights:false});const SHELL=[...g.children];
 const I=new THREE.Group();I.name='a2-car-inside';g.add(I);const dk=mat(0x2a2c2f,{roughness:.8}),gr=mat(0x4e5256,{roughness:.75}),cloth=mat(0x3c3f44,{roughness:1}),trim=mat(0x8a8e90,{metalness:.4,roughness:.5});
 const box=(w,h,d,m,x,y,z,rx=0,ry=0)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.rotation.set(rx,ry,0);I.add(b);return b;};
 box(1.62,.26,.52,dk,0,.82,-1.0);box(1.5,.06,.3,dk,0,.97,-.86,-.25);// the dash and its top
 for(const s of [-1,1]){box(.07,.64,.07,dk,s*.78,1.16,-.8,-.62);box(.05,.5,1.9,gr,s*.86,.72,.05);box(.1,.04,1.9,dk,s*.83,.98,.05);box(.08,.05,2.1,dk,s*.76,1.42,.25);box(.08,.46,.08,dk,s*.78,1.2,.42);}
 box(1.56,.05,.08,dk,0,1.42,-.6);{const hl=mat(0x9c9a94,{roughness:1,emissive:0x2c2b28});box(1.5,.03,2.1,hl,0,1.46,.28);}// the roof's edge and the headliner (light cloth: in shade, but a car's ceiling is never black)
 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.19,.022,8,28),dk);wheel.position.set(-.42,.97,-.56);wheel.rotation.x=-.45;I.add(wheel);g.userData.wheel=wheel;// (about .45 m ahead of the shoulders: elbows bent)
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.05,12),dk);hub.rotation.x=Math.PI/2-.45;hub.position.set(-.42,.97,-.56);I.add(hub);
 box(.025,.025,.22,dk,-.42,.97,-.48,-.45);box(.36,.025,.025,dk,-.42,.96,-.56,-.45);box(.07,.07,.32,dk,-.42,.9,-.74,-.45);// spokes, the column
 box(.24,.07,.03,dk,0,1.32,-.62);box(.24,.3,.8,dk,0,.55,-.35);// mirror, console
 for(const s of [-1,1]){const sb=box(.5,.62,.1,cloth,s*.42,.8,.15,-.12);void sb;box(.5,.12,.5,cloth,s*.42,.44,-.08);box(.26,.18,.07,cloth,s*.42,1.27,.2);}// seats, cushions, headrests (a car seat: low, the eye at 1.25)
 box(1.5,.3,.55,cloth,0,.72,.92,-.08);// the back seat
 const floor=box(1.6,.04,3.0,dk,0,.28,.3);void floor;
 // the instrument cluster and the radio (no brand), the vents
 box(.36,.13,.03,mat(0x0e1012,{roughness:.3}),-.42,.95,-.83,-.3);box(.24,.12,.03,mat(0x0e1012,{roughness:.3}),.02,.9,-.79,-.2);
 for(const x of [-.7,.25,.62]){box(.18,.07,.03,dk,x,.9,-.76);}
 // the hood beyond the glass
 const paintI=mat(0x3b4a5c,{roughness:.38,metalness:.25});box(1.74,.06,1.3,paintI,0,.88,-1.85,.05);
 // the phone, on a vent mount right of the wheel
 const ph=phoneModel();ph.g.position.set(-.06,1.02,-.8);ph.g.rotation.set(-.3,.25,0);I.add(ph.g);
 // on the passenger seat: the notebook (and his cap, if it is yours); a coffee from the last gas station in the cupholder
 const seat=new THREE.Group();seat.position.set(.42,.51,-.1);I.add(seat);const nb=samNotebook({k:1});nb.rotation.y=.35;nb.position.set(0,0,-.1);seat.add(nb);
 const cap=jamieCap();cap.position.set(-.02,.012,.3);cap.rotation.set(0,-.8,0);cap.scale.setScalar(.95);seat.add(cap);cap.visible=false;
 const cup=new THREE.Mesh(new THREE.CylinderGeometry(.043,.034,.15,12),mat(0xe8e2d4));cup.position.set(.1,.72,-.48);I.add(cup);const lid=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.015,12),mat(0x2a2a2c));lid.position.set(.1,.802,-.48);I.add(lid);
 I.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 I.visible=false;g.visible=false;
 const api={g,I,SHELL,wheel,phone:ph,seat,notebook:nb,cap,
  // (inside, the world's sedan body is not drawn: it is a solid extrusion whose top is a lid across the cabin at the belt line. The
  //  cabin has its own doors, dash, pillars, roof and hood; only what stands outside the doors stays: the mirrors, the trim)
  inside(on){I.visible=on;for(const m of SHELL)m.visible=!on||Math.abs(m.position.x)>.9;},
  seatWorld(side=-1){g.updateMatrixWorld(true);const p=new THREE.Vector3(side*.42,1.25,-.1).applyMatrix4(g.matrixWorld);return {x:p.x,y:p.y,z:p.z,a:-g.rotation.y,gy:g.position.y};},
  doorWorld(){g.updateMatrixWorld(true);return new THREE.Vector3(-1.25,0,-.1).applyMatrix4(g.matrixWorld);},
  wheelWorld(side){g.updateMatrixWorld(true);return new THREE.Vector3(-.42+side*.16,.99,-.52).applyMatrix4(g.matrixWorld);}};
 return api;}
