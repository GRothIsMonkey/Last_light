// Chapter Four: Main Street. The next day, Tuesday, August 23, 2011: the afternoon, then the evening, downtown.
//
//  Day:   Sam's house a little before two. His mother, tired and careful: the police called again, nothing new; be home
//         before the streetlights. She found Alex's backpack in their garage this morning (he left it Saturday) and
//         wants it taken back to his mom. In its front pocket: his camera. His pictures of an ordinary summer — and,
//         in the background of four of them, in four places, the old bike. The last one is downtown, leaning by the
//         door of Mason Cycle & Sport, a shop that has been closed for twelve years. They ride there: Summerfield Road,
//         then Old Mill Road over the rise and down into town. An ordinary Tuesday on Main Street: the barber outside
//         his shop, a delivery truck, the florist's buckets, cars parking and leaving. The shop: dusty, empty, a faded
//         poster of a green bike in the window. The florist next door: Roy Mason died in ninety-nine; the library has
//         the old Courier on microfilm. The library: the local history room, the reader, and five things on film —
//         Mason's thirtieth anniversary in 1988 with the bike (its license sticker, No. 0417); a boy, Danny Whitcomb,
//         missing since the evening of August 21, 1991, the reservoir at Pine Ridge searched; neighbors who saw him on
//         the Mill Street bridge two weeks after; a police blotter, a pale person in the culvert and a bell; a girl in
//         1966, the case still open. They read until the librarian closes.
//  Dusk:  Ten to eight. Across Main from the bike rack, in the gangway by Mason's: Alex. Then not. They do not follow.
//         The streetlights come on one by one. At Second Street, at the end of the block by the creek, the thing from the
//         drain: it watches them, comes a little way, stops dead, looks past them up the street, cowers, backs away, and
//         runs. Then the lights go out, one after another, coming down Main toward them; in the closed TV shop's window
//         every set comes on at once and shows the three of them, from high above, now. The video store is still lit.
//  Night: Nobody behind the counter. The TV over it: Alex riding Briarwood seen from the air; in his yard from behind a
//         hedge; walking past a sign — PINE RIDGE RECREATION AREA — (a picture of the screen with his camera); in his
//         room at night from the corner of the ceiling. The phone rings: static, and "…Jamie?". The TV: the three of
//         them in the store, from the far corner, now. "That's us." The lights go from the front. Out the back, the
//         alley, the lot, the narrow way behind the shops where the thing comes running past them and does not look at
//         them; the laundromat, still open, empty; out its side door onto Depot Street, under the old theater's upper
//         windows, where someone is standing in each, and then is not. At the corner, under the only light left on
//         Main, the Lyric's marquee: Alex. "Jamie." "Where is he?" "I know where he is." "Don't listen to him." "Come
//         find him." The marquee goes out. When the lights come back, he is gone. The bikes; the picture of the screen;
//         the ride home; the old oak. "That thing in the tunnel…" "It was scared." "Of what?"
//
// Nothing here explains anything. The darkness that takes the lights is never shown and never named (in the code it
// is the Presence: presence.js). No one fights anything. Every event has a fallback in time, so nothing waits forever
// on the player, and nothing turns the player's view for them. chapter3.js hands this file every phase that starts
// c4-, d4-, e4- or n4-. The town: town-plan.js (plan and nav), town-build.js (meshes), town-life.js (people and cars).
import * as THREE from './three.module.js';
import {heading} from './route.js';
import {smooth,createKit} from './kit.js';
import {createActor,ADULTS,headingTo,wrap} from './people.js';
import {createPerson,newPose,standPose,walkPose,applyPose,P as PI} from './rig.js';
import {CAST} from './cast.js';
import {LOOKOUT} from './layout.js';
import {TW,TL,TY,townY,SPOT,DOORS,INTERIORS,LAMPS,BUILDINGS,MAIN,CONN,connAt} from './town-plan.js';
import {createTownLights} from './presence.js';
import {createTownLife} from './town-life.js';
import {createAlexCamera,PHOTOS} from './alex-camera.js';
import {createFootage,pineSignArt} from './footage.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),lerp=(a,b,t)=>a+(b-a)*t;
// QA jumps and DEV scenes, in story order.
export const SECTIONS4=['chapter4-start','c4-sam-house','c4-backpack','c4-camera','c4-photo-bike','c4-photo-mason','c4-ride','c4-old-mill-road','c4-downtown-arrival','c4-main-street','c4-mason',
 'c4-florist','c4-library','c4-microfilm','c4-historical-clue','c4-closing','c4-dusk','c4-alex-across','c4-creature','c4-creature-notices','c4-creature-hiding','c4-presence','c4-tv-window','c4-video-store','c4-store-footage','c4-pine-ridge',
 'c4-store-phone','c4-store-live','c4-back-door','c4-escape','c4-route-a','c4-route-b','c4-alley-creature','c4-laundromat','c4-depot-st','c4-theater','c4-marquee','c4-power-returns','c4-final-clue','c4-ride-home','c4-oak','chapter4-end'];
export const ALIAS4={'c4-start':'chapter4-start','c4-photos':'c4-camera','c4-downtown':'c4-downtown-arrival','c4-bike-shop':'c4-mason','c4-archive':'c4-microfilm','c4-streetlights':'c4-presence',
 'c4-cascade':'c4-presence','c4-store':'c4-video-store','c4-alley':'c4-escape','c4-lyric':'c4-theater','c4-alex-marquee':'c4-marquee','c4-lead':'c4-final-clue','c4-end':'chapter4-end'};
// Checkpoints (silent; Continue on the title returns to the last one).
export const LABEL4={'chapter4-start':'The next afternoon','c4-camera':'Alex’s camera','c4-downtown-arrival':'Main Street','c4-library':'The library','c4-historical-clue':'The microfilm',
 'c4-dusk':'Ten to eight','c4-presence':'The streetlights','c4-video-store':'The Lantern Video','c4-escape':'Out the back','c4-theater':'The Lyric','c4-final-clue':'The picture','chapter4-end':'The old oak'};
const SAVE4='lastlight.chapter4';// what you carry: the camera, and whether the picture of the screen is on it
// Phases (all of them, for the shared depth table).
const PHASES=['c4-black','d4-sam','d4-bag','d4-photos','d4-ride','d4-town','d4-library','d4-archive','d4-closing','e4-dusk','e4-alex','e4-ride','e4-creature','e4-cascade','n4-store','n4-back',
 'n4-alley','n4-laundry','n4-depot','n4-marquee','n4-return','n4-clue','n4-ride','n4-oak','n4-end'];
// The microfilm: five things on the reels (fictional; the township's own paper).
export const ARCHIVE=[
 {id:'mason-1988',paper:'THE OAK HOLLOW COURIER',date:'TUESDAY, JUNE 14, 1988',page:'PAGE 3',head:'MASON CYCLE MARKS 30 YEARS ON MAIN',
  body:'Roy Mason, 61, outside his shop at 214 Main St. with the 1958 Meadowlark he built from parts the year he opened. “First bike I ever sold, and I bought it back,” Mason said. It still wears the township’s original license sticker, No. 0417.',
  pic:'mason',cap:'Roy Mason and the shop’s first bicycle.',h:15.3,
  react:[{who:'JAMIE',text:'“Zero four one seven.”',by:'jamie',time:2},{who:'SAM',text:'“That’s the sticker. On the bike.”',by:'sam',time:2.2},{who:'YOU',text:'“It’s the same bike.”',time:1.8}]},
 {id:'whitcomb-1991',paper:'THE OAK HOLLOW COURIER',date:'MONDAY, AUGUST 26, 1991',page:'PAGE 1',head:'SEARCH FOR MISSING BOY ENTERS FIFTH DAY',
  body:'Daniel “Danny” Whitcomb, 12, was last seen riding a green bicycle on Mill Street the evening of August 21. Volunteers have searched the creek, the old rail yard and the shoreline of the Pine Ridge reservoir. Anyone with information is asked to call the township police.',
  pic:'portrait',cap:'Danny Whitcomb, in his school picture.',h:16.5,
  react:[{who:'SAM',text:'“August twenty-first.”',by:'sam',time:2},{who:'JAMIE',text:'“…Twenty years ago.”',by:'jamie',time:2.2}]},
 {id:'bridge-1991',paper:'THE OAK HOLLOW COURIER',date:'WEDNESDAY, SEPTEMBER 4, 1991',page:'PAGE 1',head:'‘IT WAS HIM,’ NEIGHBORS SAY',
  body:'Two Mill Street residents say they saw a boy matching Danny Whitcomb’s description on the Mill Street bridge at dusk Monday, almost two weeks after he disappeared. “I called his name,” one said. “He didn’t answer. He looked at me, and then he walked off toward the creek.” Police say the sighting has not been confirmed.',
  pic:'bridge',cap:'The Mill Street bridge.',h:17.6,
  react:[{who:'YOU',text:'“People saw him. After.”',time:2},{who:'JAMIE',text:'“Like we did.”',by:'jamie',time:1.8}]},
 {id:'blotter-1991',paper:'THE OAK HOLLOW COURIER',date:'WEDNESDAY, SEPTEMBER 11, 1991',page:'POLICE BLOTTER',head:'POLICE BLOTTER',
  body:'Sept. 9, 11:40 p.m. — A Depot St. resident reported a pale person crouched in the storm culvert under the Mill Street bridge. The resident also reported a bicycle bell ringing repeatedly. Officers checked the area and found nothing.\nSept. 10, 2:15 a.m. — Streetlights out on Main St. between Second and Depot. Utility notified. Restored by morning.',
  pic:null,cap:'',h:18.7,
  react:[{who:'SAM',text:'“A bell.”',by:'sam',time:1.6},{who:'JAMIE',text:'“Pale.”',by:'jamie',time:1.4},{who:'SAM',text:'“Don’t.”',by:'sam',time:1.2}]},
 {id:'carver-1966',paper:'THE OAK HOLLOW COURIER',date:'TUESDAY, AUGUST 30, 1966',page:'PAGE 1',head:'GIRL, 11, STILL MISSING',
  body:'Ruth Ann Carver, 11, has not been seen since the evening of August 23, when she rode her bicycle downtown to the Lyric Theater. Her bicycle has not been found. Chief Hollis said yesterday the department has “no new information.” The case remains open.',
  pic:'portrait-old',cap:'Ruth Ann Carver.',h:19.55,
  react:[{who:'SAM',text:'“Nineteen sixty-six.”',by:'sam',time:1.8},{who:'JAMIE',text:'“August twenty-third.”',by:'jamie',time:2},{who:'SAM',text:'“That’s today.”',by:'sam',time:1.6}]}];
// The town clock: hours (14.0 = 2:00 PM). The chapter's own times.
const HOUR={start:13.87,ride:14.05,arrive:14.3,library:15.0,closing:19.83,exit:19.87,alex:19.9,lamps:19.93,creature:20.06,cascade:20.1,store:20.14,back:20.22,theater:20.3,marquee:20.33,ret:20.38,ride2:20.45,oak:20.6};
const fmt=h=>{const H=Math.floor(h),M=Math.floor((h-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};

export function createChapter4(o,k,ch2,ch3){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam}=k,A=k.api,T=o.tension,police=k.police;
 const T4=world.town,D=T4.D,me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go,dist=k.dist,main=k.main,side=k.side;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL4);
 const K=createKit(),A4={};// the chapter's api (filled in at the end)
 // places in the town frame: (u,v) to world, with the ground (or a given height over the street)
 const at=(u,v,y)=>{const w=TW(u,v);return {x:w.x,z:w.z,y:y??townY(u,v)};};
 const UV=p=>TL(p.x,p.z);
 const where=(p=me())=>nav.locate(p.x,p.z);
 const inside=(name,p=me(),m=0)=>{const I=INTERIORS[name],{u,v}=UV(p);return u>I.floor[0]-m&&u<I.floor[1]+m&&v>I.floor[2]-m&&v<I.floor[3]+m;};
 const date=h=>o.setDate(`AUGUST 23, 2011 <i></i> ${fmt(h)}`);
 // ---- the town's systems ---------------------------------------------------------------------------------------------
 const lights=createTownLights({town:T4,sfx:(n,pos,op)=>sound(n,pos,op),scene,camera});
 const life=createTownLife({scene,nav,sfx:(n,pos,op)=>sound(n,pos,op)});
 const photo=createAlexCamera({scene,camera,world,nav,shoot:o.shoot,readPixels:o.readPixels,renderer:o.renderer,kit:k,main,side,LOOKOUT});
 const footage=createFootage({scene,camera,world,nav,shoot:o.shoot,photo,town:T4,renderer:o.renderer,foot:o.foot,self:o.self,side});
 const creature=ch3.creature;
 // Placeholder sound hooks (the real sounds come later): every one is counted for the tests, and handed to the game's
 // sfx (which plays what it knows and ignores the rest).
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos,opts);}
 // ---- Sam's house: his mother, Alex's backpack in the garage ---------------------------------------------------------
 const SH=world.homes.sam,SG=world.garages.sam,SHW=(x,z,y=0)=>{const p=SH.toWorld(x,z);return {x:p.x,z:p.z,y:p.ground+y};};
 const gxS=SH.gx??(SH.w*.32),gzS=SH.gfront??SH.front;
 const samMom=createActor(scene,nav,{...ADULTS.mom,name:'SAM’S MOM',hair:{...ADULTS.mom.hair,color:0x4a3626,style:ADULTS.mom.hair?.style||'ponytail'},clothes:{...ADULTS.mom.clothes,shirt:0x7a94a8,pants:0x3e4450}},{seed:84});
 const bag=new THREE.Group();bag.name='alex-backpack';scene.add(bag);bag.visible=false;
 {const navy=K.mat(0x23345a,{roughness:.85}),dark=K.mat(0x161d2e,{roughness:.9}),zip=K.mat(0x8a8a8a,{roughness:.4,metalness:.6}),red=K.mat(0xb3352e,{roughness:.8});
  K.rbox(bag,0,.21,0,.34,.42,.18,.06,navy);K.rbox(bag,0,.14,.1,.28,.2,.06,.03,dark);K.box(bag,0,.25,.131,.22,.006,.004,zip);K.rbox(bag,0,.4,-.02,.2,.05,.12,.02,dark);
  for(const x of [-.1,.1])K.rbox(bag,x,.22,-.1,.05,.36,.02,.01,dark);K.box(bag,.12,.06,.131,.03,.03,.005,red);bag.traverse(q=>{if(q.isMesh)q.castShadow=true;});}
 const bagAt=()=>SHW(gxS-.9,gzS-1.1,.0);
 // ---- in the town: what the story puts in it ---------------------------------------------------------------------------
 const canvas=(w,h)=>{try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;return {c,g};}catch{return null;}};
 const texOf=cv=>{if(!cv)return null;const t=new THREE.CanvasTexture(cv.c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};
 const plane=(parent,w,h,{map=null,color=0xffffff,basic=false,alpha=false}={})=>{const m=basic?new THREE.MeshBasicMaterial({color,map,transparent:alpha,alphaTest:alpha?.45:0,toneMapped:!basic||!!map}):new THREE.MeshStandardMaterial({color,map,roughness:.9,transparent:alpha,alphaTest:alpha?.45:0});
  const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);parent.add(q);return q;};
 // (a picture placed on a building, kept out of the bake: it moves to the live root, at the same place, as the TV screens do)
 const toLive=q=>{q.parent.updateMatrixWorld(true);const m=new THREE.Matrix4().copy(T4.live.matrixWorld).invert().multiply(q.matrixWorld);q.removeFromParent();m.decompose(q.position,q.quaternion,q.scale);T4.live.add(q);return q;};
 // The poster in Mason's window: a green bicycle, sun-faded nearly white.
 let masonPoster=null;
 {const P2=D.masonPoster;if(P2){const cv=canvas(384,520);if(cv){const g=cv.g;g.fillStyle='#e8e0cc';g.fillRect(0,0,384,520);g.fillStyle='#b8b49a';g.fillRect(14,14,356,492);g.fillStyle='#efe8d4';g.fillRect(22,22,340,476);
    g.fillStyle='#8a9a86';g.font='bold 46px Georgia';g.textAlign='center';g.fillText('MEADOWLARK',192,92);g.font='22px Georgia';g.fillText('BUILT TO LAST · RIDE THE HOLLOW',192,124);
    g.strokeStyle='#9aab92';g.lineWidth=7;g.beginPath();g.arc(110,330,62,0,7);g.arc(276,330,62,0,7);g.stroke();g.beginPath();g.moveTo(110,330);g.lineTo(170,250);g.lineTo(250,250);g.lineTo(276,330);g.moveTo(170,250);g.lineTo(192,330);g.lineTo(110,330);g.moveTo(192,330);g.lineTo(250,250);g.moveTo(170,250);g.lineTo(160,226);g.moveTo(140,226);g.lineTo(180,226);g.moveTo(250,250);g.lineTo(244,214);g.quadraticCurveTo(262,200,284,214);g.stroke();
    g.font='20px Georgia';g.fillStyle='#a49a82';g.fillText('MASON CYCLE & SPORT · 214 MAIN',192,446);g.fillText('SALES · SERVICE',192,472);
    g.fillStyle='rgba(255,250,235,.35)';g.fillRect(0,0,384,520);}
   const q=plane(P2.group,P2.w,P2.h,{map:texOf(cv),color:cv?0xffffff:0xd8d2c0});q.position.set(P2.x,P2.y,P2.z+.03);q.name='mason-poster';masonPoster=toLive(q);}}
 // The microfilm reader's screen (what is on it is drawn on demand), and the room's framed pictures, and the
 // community board's flyers (one is Alex's).
 const reel=canvas(1024,768),reelTex=texOf(reel);let readerScreen=null;
 if(D.reader){const R=D.reader;readerScreen=plane(R.group,R.w,R.h,{map:reelTex,color:reel?0xffffff:0x2a2a28,basic:true});readerScreen.position.set(R.x,R.y,.335);readerScreen.name='microfilm-screen';readerScreen.material.toneMapped=false;toLive(readerScreen);}
 const frames=new THREE.Group();frames.name='history-frames';scene.add(frames);
 for(const [i,F] of (D.historyFrames||[]).entries()){const cv=canvas(320,240);if(cv){const g=cv.g;g.fillStyle='#d8ccb0';g.fillRect(0,0,320,240);g.fillStyle='#6a5a44';
   if(i===0){g.fillRect(20,90,280,110);for(let x=30;x<300;x+=34)g.fillRect(x,60,24,30);g.font='bold 22px Georgia';g.fillText('MAIN ST. 1952',90,40);}
   else if(i===1){g.fillRect(90,50,140,170);g.fillStyle='#d8ccb0';g.fillRect(100,120,120,30);g.fillStyle='#6a5a44';g.font='bold 20px Georgia';g.fillText('THE LYRIC',110,142);g.fillText('1938',140,36);}
   else{g.beginPath();g.moveTo(10,200);g.quadraticCurveTo(160,120,310,200);g.lineWidth=12;g.strokeStyle='#6a5a44';g.stroke();g.font='bold 20px Georgia';g.fillText('MILL STREET BRIDGE',60,40);}
   g.fillStyle='rgba(120,90,50,.18)';g.fillRect(0,0,320,240);}
  const w=TW(F.u,F.v),fr=new THREE.Group();fr.position.set(w.x,F.y,w.z);fr.rotation.y=F.ry+Math.PI;frames.add(fr);K.box(fr,0,0,-.02,.86,.66,.03,K.mat(0x3a2a1c,{roughness:.6}));const q=plane(fr,.76,.56,{map:texOf(cv),color:cv?0xffffff:0xb8ab90});q.position.z=.001;}
 if(D.bulletin&&T4.flyerArt){const cv=canvas(256,330);if(cv){try{T4.flyerArt(cv.g,256,330);}catch{}}const w=TW(D.bulletin.u,D.bulletin.v),fr=new THREE.Group();fr.position.set(w.x,D.bulletin.y,w.z);frames.add(fr);
  const q=plane(fr,.34,.44,{map:texOf(cv),color:cv?0xffffff:0xe8e4da});q.position.set(.3,.05,0);q.rotation.y=Math.PI;q.name='library-flyer-alex';}
 // The theater's upper windows: someone standing in each (a shape against the faint light inside; no more than that).
 const SIL=[];{const cv=canvas(128,256);if(cv){const g=cv.g;g.clearRect(0,0,128,256);g.fillStyle='#000';g.beginPath();g.ellipse(64,38,13,17,.08,0,7);g.fill();
   g.beginPath();g.moveTo(52,58);g.quadraticCurveTo(64,52,76,58);g.lineTo(86,74);g.lineTo(90,190);g.lineTo(82,190);g.lineTo(80,96);g.lineTo(76,250);g.lineTo(52,250);g.lineTo(48,96);g.lineTo(46,190);g.lineTo(38,190);g.lineTo(42,74);g.closePath();g.fill();}
  const tex=texOf(cv);for(const s of D.silhouettes||[]){const q=plane(s.group,s.w*.82,s.h*.96,{map:tex,color:0x070505,basic:true,alpha:!!tex});q.position.set(s.x,s.y,s.z+.05);q.visible=false;q.name='lyric-window-figure';toLive(q);
   const wp=new THREE.Vector3();q.updateMatrixWorld(true);q.getWorldPosition(wp);SIL.push({q,pos:wp,state:'off',seenT:0,t:0});}}
 // Alex (or what looks like him): his own clothes, his own walk. No more than a boy across the street.
 const AX={person:createPerson(CAST.alex),talk:0,pose:newPose(),x:0,z:0,a:0,v:0,gait:0,state:'off',t:0,path:null};scene.add(AX.person.group);AX.person.group.visible=false;AX.person.group.name='alex-across';
 AX.person.group.traverse(q=>{if(q.isMesh)q.castShadow=true;});
 // A camera flash: a moment of light where you are (and its afterglow on the screen).
 const flashL=new THREE.PointLight(0xf4f2ff,0,14,1.4);flashL.name='camera-flash';
 // ---- state ------------------------------------------------------------------------------------------------------------
 const C={};
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,h:HOUR.start,rate:0,flags:{},timers:[],cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,match:false,want:null,wantT:0,
  spot:{jamie:null,sam:null},view:null,rec:0,read:new Set(),seenRec:{},talked:new Set(),photoLines:new Set(),found:new Set(),dark:0,darkT:0,lastEvent:0,sounds:{},amb:{traffic:0,insects:1,wind:1,life:1,forest:0,tunnel:0,water:0},
  crt:null,cas:null,store:null,esc:null,mq:null,inv:{camera:false,lead:false},minute:-1,lightsOn:false,townLife:false,bikes:null,nudgeT:0,lastH:0});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL4[id]);saveInv();};// (silent: Continue on the title comes back here)
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why)T?.note?.(why);};
 const owns=ph=>typeof ph==='string'&&/^(c4|d4|e4|n4)-/.test(ph);
 const handles=sec=>SECTIONS4.includes(sec)||!!ALIAS4[sec];
 function card(on,title='Chapter Four',eyebrow=''){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2');if(e)e.textContent=eyebrow;if(h)h.textContent=title;el.classList.add('on');}else el.classList.remove('on');C.cardOn=on;}
 function saveInv(){try{localStorage.setItem(SAVE4,JSON.stringify({camera:!!C.inv.camera,lead:!!C.inv.lead,found:[...C.found]}));}catch{}}
 // ---- poses: a closer look (the backpack, the shop window, the reader, the phone) ---------------------------------------
 function pose(q,{y,pitch=0,yaw=null,look=null}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/1.1);if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 // ---- Jamie and Sam: on bikes when you are, on foot when you are; or standing somewhere the scene puts them ---------------
 function follow(on){C.match=on;}
 function match(dt){if(!C.match)return;const p=me(),want=p.riding?'ride':'walk';C.wantT=C.want===want?C.wantT+dt:0;C.want=want;
  for(const c of [jamie,sam]){if(c.script||!c.active)continue;
   // (someone the scene has put somewhere still gets off his bike when you are on foot; then he goes there)
   if(C.spot[c.key]){if(want==='walk'&&c.mode==='ride'&&C.wantT>=1)comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)]);continue;}
   if(want==='ride'){if(c.mode==='ride'){c.follow='ride';continue;}if(C.wantT<.8)continue;
    const fb=Math.hypot(c.bx-c.px,c.bz-c.pz);if(c.bike.group.visible&&fb<45){const s2={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2);
     comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:C.flags.hurry?3:1.8}),comp.steps.turnTo(c,()=>c.ba,.45),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,C.flags.hurry?1.9:1.3)],{then:()=>{c.follow='ride';}});}
    else c.follow='walk';}
   else{if(c.mode==='foot'){c.follow='walk';continue;}if(C.wantT<1)continue;
    if(c.mode==='ride')comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)],{then:()=>{c.follow='walk';}});}}}
 // Somewhere to stand: (u,v) or a function giving a world {x,z}; look: a point (or function); max: pace. null: back to following.
 function stand(c,q,{look=null,face=null,max=3.2,gesture=null}={}){C.spot[c.key]=q?{q,look,face,max,gesture}:null;if(!q){if(c.script?.spot4){c.script=null;c.then=null;}if(C.match&&c.mode==='foot')c.follow='walk';return;}
  if(c.mode!=='foot'||c.script?.spot4)return;
  comp.run(c,[comp.steps.toward(c,()=>{const s=C.spot[c.key];if(!s)return null;const w=typeof s.q==='function'?s.q():at(s.q.u,s.q.v);const lk=typeof s.look==='function'?s.look():s.look;
   return {x:w.x,z:w.z,look:lk,face:typeof s.face==='function'?s.face():s.face??undefined,max:s.max,gesture:s.gesture};})],{then:()=>{if(C.match&&c.mode==='foot')c.follow='walk';}});c.script.spot4=true;}
 // Jamie and Sam stay with you: Chapter Four never loses them. They run to keep up when you run (footBoost); a place
 // the scene gave one to stand that you have since left far behind is let go (he comes after you); a path that has
 // stopped getting anywhere is looked for again; and only when one is truly stuck, far behind and out of sight, is he
 // put, unseen, a little way back along the way you came (C.guardLog keeps a count of each, for the tests).
 const GUARD={jamie:{x:0,z:0,t:0,stuck:0},sam:{x:0,z:0,t:0,stuck:0}},TRAIL=[];
 const occluded=(x0,z0,x1,z1)=>{const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.6);for(let i=2;i<n-1;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;if(!nav.walkable(x,z,{r:.05})&&!nav.rideable?.(x,z))return true;}return false;};
 const seenAt=q=>{const e=camera.position,f=new THREE.Vector3();camera.getWorldDirection(f);const dx=q.x-e.x,dz=q.z-e.z,l=Math.hypot(dx,dz)||1;return (dx*f.x+dz*f.z)/l/(Math.hypot(f.x,f.z)||1)>.3&&l<45&&!occluded(e.x,e.z,q.x,q.z);};
 function guard(dt){const ph=S.phase;if(!C.guardLog){C.guardLog={released:0,unstuck:0,recovered:0};TRAIL.length=0;for(const g of Object.values(GUARD))Object.assign(g,{x:0,z:0,t:0,stuck:0});}if(!/^(d4-town|d4-library|d4-closing|e4-|n4-)/.test(ph)||C.fadeOut>=0)return;const p=me();
  const tl=TRAIL[TRAIL.length-1];if(!tl||Math.hypot(tl.x-p.x,tl.z-p.z)>1){TRAIL.push({x:p.x,z:p.z});if(TRAIL.length>40)TRAIL.shift();}
  for(const c of [jamie,sam]){if(!c.active)continue;const g=GUARD[c.key],q=c.mode==='ride'?{x:c.bx,z:c.bz}:{x:c.px,z:c.pz},d=Math.hypot(q.x-p.x,q.z-p.z);
   c.footBoost=C.flags.hurry?1.45:1.2;
   const sp=C.spot[c.key];if(sp&&!sp.keep&&c.mode==='foot'&&p.walking&&d>(sp.leash||12)){stand(c,null);C.guardLog.released++;}
   g.t+=dt;if(g.t>=2.5){const mv=Math.hypot(q.x-g.x,q.z-g.z);g.x=q.x;g.z=q.z;g.t=0;g.stuck=d>6&&mv<.4&&c.mode==='foot'&&!sp?g.stuck+2.5:0;if(g.stuck===2.5){c.route=null;C.guardLog.unstuck++;}}
   if(g.stuck>=7.5&&d>9&&c.mode==='foot'&&!c.script&&p.walking&&!C.view&&!seenAt(q)){
    for(let i=TRAIL.length-1;i>=0;i--){const t=TRAIL[i],b=Math.hypot(t.x-p.x,t.z-p.z);if(b<5)continue;if(b>12)break;
     if(nav.walkable(t.x,t.z,{r:.3})&&!seenAt(t)){comp.putFoot(c,t.x,t.z,headingTo(t.x,t.z,p.x,p.z),{bike:c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null});if(C.match)c.follow='walk';g.stuck=0;C.guardLog.recovered++;mark('caught up: '+c.key);break;}}}}}
 function standAll(){for(const c of [jamie,sam]){const s=C.spot[c.key];if(s&&c.mode==='foot'&&!c.script)stand(c,s.q,s);}}
 // a short look at something, then back
 function glance(c,q,secs=2){c.lookAt=q;later(secs,()=>{if(c.lookAt===q)c.lookAt=null;});}
 const GEST={press:w=>p=>{p[PI.root+1]-=.04*w;p[PI.lean]-=.18*w;for(const o2 of [PI.lh,PI.rh]){p[o2+1]-=.12*w;p[o2+2]+=.12*w;}},
  grab:w=>p=>{p[PI.rh]+=(-.32-p[PI.rh])*w;p[PI.rh+1]+=(1.0-p[PI.rh+1])*w;p[PI.rh+2]+=(-.3-p[PI.rh+2])*w;},
  point:w=>p=>{const y=p[PI.root+1];p[PI.rh]+=(.16-p[PI.rh])*w;p[PI.rh+1]+=(y+.42-p[PI.rh+1])*w;p[PI.rh+2]+=(-.5-p[PI.rh+2])*w;},
  tense:w=>p=>{p[PI.root+1]-=.04*w;p[PI.lean]+=.12*w;p[PI.lh+1]+=.06*w;}};
 // ---- the clock, and the light it makes ---------------------------------------------------------------------------------
 // The afternoon runs at four times real time (a game minute every fifteen seconds), the night at twice. Reading the
 // microfilm, the hours go by a reel at a time. When something has to happen at a set time, the clock catches up to it
 // (a minute a second) rather than the story waiting.
 const RATE={day:4/3600,dusk:4/3600,night:2/3600};
 function clock(dt){const ph=S.phase;let r=0;
  if(/^d4-(sam|bag|photos|ride|town|library)$/.test(ph))r=RATE.day;else if(/^(d4-closing|e4-)/.test(ph))r=RATE.dusk;else if(/^n4-/.test(ph))r=RATE.night;
  C.h+=r*dt;if(C.hMin!==undefined&&C.h<C.hMin)C.h=Math.min(C.hMin,C.h+dt/60);
  const m=Math.floor(C.h*60+1e-6);if(m!==C.minute&&ph!=='c4-black'){C.minute=m;date(C.h);}}
 // The sky over the afternoon and evening: day 1 (a high white sun) easing into the gold of six o'clock, dusk at eight,
 // night by half past. Where the lights have been taken, the dark is deeper (C.dark).
 function sky(h=C.h){const q=(a,b)=>smooth((h-a)/(b-a));
  let day=1-.5*q(16.4,19.25)-.5*q(19.25,19.98),p=.36*q(16.6,19.25)+.64*q(19.25,20.12),night=.6*q(19.95,20.3)+.3*q(20.3,20.9),deep=.18*q(20.2,20.9);
  const d=C.dark;night=lerp(night,.95,d);deep=lerp(deep,.6,d);
  // inside a lit room: its own fixtures light it (fill 0–1), whatever the sky outside is doing
  const room=inside('video')?fixIdx(D.videoFix):inside('library')?fixIdx(D.libraryFix):inside('laundry')?fixIdx(D.laundryFix):null,fill=room&&room.length&&C.lightsOn?room.reduce((a,i)=>a+lights.level(i),0)/room.length:0;
  return {day,p,night,deep,fill};}
 // ---- the world as Chapter Four finds it --------------------------------------------------------------------------------
 const DOOR0=Object.fromEntries(Object.entries(DOORS).map(([key,d])=>[key,d.open]));
 function common(){document.body?.classList?.add('night1');nav.setTown(true);if(!C.lightsOn){lights.attach(true);C.lightsOn=true;}if(!flashL.parent)scene.add(flashL);}
 // The afternoon: last night's police and searchers gone home, the flyers still up.
 function dayWorld(){A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);ambient.night?.(false);ambient.morning?.(true);
  for(const a of [...k.adults,...ch2.extra,...Object.values(ch3.people||{})]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  police.reset?.();k.carA.show(false);k.carB.show(false);ch2.flyers.visible=true;ch2.found.group.visible=false;ch2.tape.visible=false;for(const b of ch2.beams)b.on=false;ch2.samBeam&&(ch2.samBeam.on=false);
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;k.torch.visible=false;S.flashOn=false;o.setFlashlight?.(false,false);
  world.doors.alex?.set(0);world.alexWindow.emissiveIntensity=.04;}
 // The evening, back in the neighborhood: porch lights and streetlights on (the ride home).
 function homeNight(){ambient.morning?.(false);ambient.night?.(true);}
 // Sam's driveway: his garage open, the three bikes on the driveway, his mother in the garage door.
 const drive=(x,z)=>SHW(gxS+x,gzS+z);
 const driveA=(x,z)=>{const a=drive(x,z),b=drive(x,z+5);return headingTo(a.x,a.z,b.x,b.z);};
 function samHouse({mom=true}={}){SG?.set?.(1);bag.visible=true;const b=bagAt();bag.position.set(b.x,nav.groundY(b.x,b.z)+.002,b.z);bag.rotation.y=driveA(0,0)+.4;
  if(mom){samMom.show(true);const m=drive(.7,-.5);samMom.place(m.x,m.z,driveA(.7,-.5));samMom.gest('fold');samMom.lookAt=camera.position;}else samMom.show(false);}
 function boysAtSam(){const jb=drive(-.7,4.6),sb=drive(-1.9,6.2),jq=drive(-1.5,2.9),sq=drive(1.9,3.3);
  comp.putFoot(jamie,jq.x,jq.z,driveA(0,0)+Math.PI*.8,{bike:{x:jb.x,z:jb.z,a:driveA(-.7,4.6),kick:1}});comp.putFoot(sam,sq.x,sq.z,driveA(0,0)-Math.PI*.8,{bike:{x:sb.x,z:sb.z,a:driveA(-1.9,6.2),kick:1}});
  for(const c of [jamie,sam]){c.follow=null;c.lookAt=null;c.lookPlayer=false;}}
 function youAtSam(){const q=drive(.3,2.4),bk=drive(.9,5.4);o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,bagAt().x,bagAt().z),mode:'walk',bike:{x:bk.x,z:bk.z,a:driveA(.9,5.4)}});}
 // ---- the day ------------------------------------------------------------------------------------------------------------
 function begin(){fresh();go('c4-black');C.cardT=0;o.fade(1);common();dayWorld();comp.reset();samHouse();boysAtSam();youAtSam();objective('');T?.reset();C.h=HOUR.start;
  C.renderQ=photo.photos.map((p,i)=>i);for(const c of [jamie,sam]){c.lookAt=null;c.lookPlayer=false;}}
 function opening(){go('d4-sam');date(C.h);C.fadeIn=0;
  talk([{wait:1.4},{who:'SAM’S MOM',text:'“Officer Reyes called again. Nothing new.”',from:samMom,time:2.8,gap:.7},
   {who:'SAM’S MOM',text:'“I found Alex’s backpack in the garage this morning. He must have left it here Saturday.”',from:samMom,time:3.8,gap:.4},
   {who:'SAM’S MOM',text:'“His mom said you can bring it by. Will you do that for me?”',from:samMom,time:3.2,gap:.5},
   {who:'JAMIE',text:'“Yeah. We’ll take it.”',from:jamie,time:1.8,gap:.7},
   {who:'SAM’S MOM',text:'“And I want all three of you home before the streetlights come on. I mean it.”',from:samMom,time:3.6,gap:.5},
   {who:'SAM',text:'“Okay.”',from:sam,time:1.2}],
   {then:()=>{momIn();bagReady();checkpoint('chapter4-start');}});}
 function momIn(){if(!samMom.visible)return;samMom.gest(null);samMom.lookAt=null;const d=drive(.7,-3.4);samMom.walk([[d.x,d.z]],{speed:1,then:a=>a.show(false)});}
 function bagReady(){C.flags.bagReady=true;objective('Look in Alex’s backpack.','Just inside Sam’s garage.');}
 function openBag(){if(C.flags.bag)return;C.flags.bag=true;go('d4-bag');objective('');const b=bag.position,p=me(),a=headingTo(p.x,p.z,b.x,b.z);
  const st={x:b.x-Math.sin(a)*.85,z:b.z+Math.cos(a)*.85};pose(st,{y:nav.groundY(st.x,st.z)+.92,pitch:-.72,yaw:a});
  stand(jamie,()=>({x:b.x+Math.cos(a)*1.05-Math.sin(a)*.3,z:b.z+Math.sin(a)*1.05+Math.cos(a)*.3}),{look:{x:b.x,y:b.y+.2,z:b.z}});stand(sam,()=>({x:b.x-Math.cos(a)*1.1-Math.sin(a)*.6,z:b.z-Math.sin(a)*1.1+Math.cos(a)*.6}),{look:{x:b.x,y:b.y+.2,z:b.z}});
  talk([{wait:.8},{who:'',text:'[The zipper on the front pocket.]',time:1.8},{who:'JAMIE',text:'“His camera.”',from:jamie,time:1.6,gap:.5},{who:'SAM',text:'“He took that thing everywhere.”',from:sam,time:2.2,gap:.4},
   {who:'SAM',text:'“Is it on?”',from:sam,time:1.2}],{then:()=>{C.inv.camera=true;saveInv();unpose();openCamera(0);go('d4-photos');checkpoint('c4-camera');objective('Look through Alex’s pictures.');
    for(const c of [jamie,sam])stand(c,null);later(.1,()=>{stand(jamie,camBeside(1));stand(sam,camBeside(-1));});}});}
 // where each of them stands to see the little screen: at your shoulder
 const camBeside=s=>()=>{const p=me(),fx=Math.sin(p.a),fz=-Math.cos(p.a),rx=Math.cos(p.a),rz=Math.sin(p.a);return {x:p.x+rx*.62*s-fx*.38,z:p.z+rz*.62*s-fz*.38};};
 // ---- Alex's camera: playback in your hands -------------------------------------------------------------------------------
 function openCamera(i=photo.V.i){photo.open(i);C.view='camera';C.pi=-1;C.viewT=0;o.roam.walkLock=true;}
 function openShoot(){photo.open(photo.V.i);C.view='shoot';C.viewT=0;o.roam.walkLock=true;}
 function closeView(){if(C.view==='camera'||C.view==='shoot')photo.close();C.view=null;if(!posed())o.roam.walkLock=false;}
 const PLINES={'sam-face':[{who:'SAM',text:'“Delete that one.”',by:'sam'},{who:'JAMIE',text:'“No way.”',by:'jamie'}],'jamie-hop':[{who:'JAMIE',text:'“That was a sick bunny hop.”',by:'jamie'},{who:'SAM',text:'“You fell off right after.”',by:'sam'}],
  'dog':[{who:'SAM',text:'“Biscuit!”',by:'sam'}],'alex-bike':[{who:'JAMIE',text:'“His bike.”',by:'jamie'}],'lawn':[{who:'SAM',text:'“He took a picture of grass.”',by:'sam'}],
  'curb':[{who:'SAM',text:'“The ice cream truck. The good day.”',by:'sam'}],'lookout':[{who:'JAMIE',text:'“The end of Oak Hollow.”',by:'jamie'}],'friends':[{who:'SAM',text:'“…That was last week.”',by:'sam'}],
  'mason':[{who:'SAM',text:'“Where is that?”',by:'sam'},{who:'JAMIE',text:'“Downtown. That’s Main Street.”',by:'jamie'}]};
 const by=l=>l.text===undefined?l:({...l,from:l.by==='jamie'?jamie:l.by==='sam'?sam:l.from,time:l.time??Math.max(1.4,l.text.length*.055)});
 function say(lines,opts){talk(lines.map(by),opts);}
 function updatePhotos(dt){if(C.view!=='camera')return;C.viewT+=dt;const V=photo.V,cur=photo.photos[V.i];
  if(C.pi!==V.i){C.pi=V.i;C.dwell=0;C.hinted=0;if(!C.photoLines.has(cur.id)&&PLINES[cur.id]&&!busy()&&!cur.lead){C.photoLines.add(cur.id);say(PLINES[cur.id]);}}
  C.dwell+=dt;
  // the old bike in the background: found when it is magnified on the screen
  if(cur.bike&&!C.found.has(cur.id)&&photo.bikeInView()){C.found.add(cur.id);cur.found=true;saveInv();mark('the old bike, in '+cur.place);bikeFound(cur);}
  if(cur.bike&&!C.found.has(cur.id)&&!busy()){if(C.dwell>6&&C.hinted===0){C.hinted=1;say([{who:cur.id==='mason'?'JAMIE':'SAM',text:`“Zoom in. ${cur.hint}”`,by:cur.id==='mason'?'jamie':'sam'}]);}
   else if(C.dwell>12&&C.hinted===1){C.hinted=2;photo.guide();}}
  // nudges, so nobody browses forever
  if(!C.flags.lead1&&C.viewT>95&&!C.flags.nudgeLast&&!busy()){C.flags.nudgeLast=true;say([{who:'JAMIE',text:'“Go to the last one.”',by:'jamie'}]);}
  if(!C.flags.lead1&&C.viewT>120&&C.flags.nudgeLast&&!C.flags.jumpLast&&!busy()){C.flags.jumpLast=true;say([{who:'JAMIE',text:'“Here—”',by:'jamie'}]);photo.V.i=PHOTOS.length-2;photo.browse(1);}}
 function bikeFound(p){const n=[...C.found].filter(id=>id!=='mason').length;
  if(p.id==='mason'){say([{who:'JAMIE',text:'“Mason’s. The old bike shop.”',by:'jamie'},{who:'YOU',text:'“That place has been closed forever.”'},{who:'SAM',text:'“August seventeenth. That’s last Wednesday.”',by:'sam'},
    ...(n<2?[{who:'JAMIE',text:'“It’s in the other ones too. By the oak. On Briarwood.”',by:'jamie'}]:[]),{who:'JAMIE',text:'“We’re going.”',by:'jamie'},{who:'SAM',text:'“My mom said—”',by:'sam'},{who:'JAMIE',text:'“Before the streetlights. We’ve got hours.”',by:'jamie'}],
    {then:()=>{C.flags.lead1=true;objective('Ride downtown.','Summerfield Road, then Old Mill Road into town.');go('d4-ride');checkpoint('c4-camera');}});return;}
  if(n===1)say([{who:'JAMIE',text:'“Wait. That’s the bike. The old one.”',by:'jamie'},{who:'SAM',text:'“…It’s just sitting there.”',by:'sam'}]);
  else if(n===2)say([{who:'SAM',text:'“It’s in this one too.”',by:'sam'}]);
  else say([{who:'JAMIE',text:'“It’s in all of them.”',by:'jamie'},{who:'SAM',text:'“He never said anything.”',by:'sam'}]);}
 // ---- the ride downtown ----------------------------------------------------------------------------------------------------
 function updateRide(dt){const p=me(),L=where(p);
  if(!C.flags.rideStart&&!C.view){C.flags.rideStart=true;follow(true);for(const c of [jamie,sam])stand(c,null);}
  if(L.street==='main'&&!C.flags.wrongWay&&L.d>1014&&S.pt>6){C.flags.wrongWay=true;say([{who:'JAMIE',text:'“Other way. Summerfield.”',by:'jamie'}]);}
  if(L.street==='side2'&&L.u>30&&!C.flags.r1&&!busy()){C.flags.r1=true;say([{who:'SAM',text:'“I haven’t been downtown since the Fourth.”',by:'sam'},{who:'JAMIE',text:'“There’s nothing down there.”',by:'jamie'},{who:'SAM',text:'“There’s the pizza place.”',by:'sam'}]);}
  if(L.street==='town'&&L.w.zone==='conn'){if(!C.townLife){life.start(C.h);C.townLife=true;}if(!C.flags.r2&&!busy()){C.flags.r2=true;say([{who:'JAMIE',text:'“Old Mill Road. All the way down.”',by:'jamie'}]);}
   if(L.w.s>112&&!C.flags.r3&&!busy()){C.flags.r3=true;say([{who:'SAM',text:'“You can see the water tower.”',by:'sam'}]);}}
  if(L.street==='town'&&L.w.zone==='core'&&L.w.u>-46)arrive();
  if(S.pt>150&&!C.flags.rideNudge&&!busy()&&L.street!=='town'){C.flags.rideNudge=true;say([{who:'SAM',text:'“Summerfield’s back by the stop sign. Then Old Mill.”',by:'sam'}]);}}
 function arrive(){if(C.flags.arrived)return;C.flags.arrived=true;go('d4-town');C.h=Math.max(C.h,HOUR.arrive);date(C.h);checkpoint('c4-downtown-arrival');if(!C.townLife){life.start(C.h);C.townLife=true;}
  objective('Find Mason Cycle & Sport.','On Main Street, past Second Street.');later(1.5,()=>{if(!busy())say([{who:'JAMIE',text:'“Mason’s is down past Second Street. Across from the square.”',by:'jamie'}]);});}
 // ---- Main Street by day ----------------------------------------------------------------------------------------------------
 const P4=k=>life.people[k];
 function updateTown(dt){const p=me(),{u,v}=UV(p);
  if(!C.flags.mason&&Math.hypot(u-SPOT.masonWindow.u,v-SPOT.masonWindow.v)<7.5)atMason();
  if(!C.flags.mason&&S.pt>130&&!C.flags.masonNudge&&!busy()){C.flags.masonNudge=true;say([{who:'JAMIE',text:'“It’s past Second Street. The left side, going toward the theater.”',by:'jamie'}]);}
  if(C.flags.mason&&!C.flags.window&&!C.flags.florist&&C.t-C.masonAt>24&&!busy())florist();
  if(inside('library',p,-.2))enterLibrary();}
 function atMason(){C.flags.mason=true;C.masonAt=C.t;mark('Mason’s');const w=SPOT.masonWindow;
  stand(jamie,{u:132.4,v:-9.4},{look:at(131,-11.4,TY+1.2)});stand(sam,{u:137.2,v:-9.2},{look:at(134.4,-11.6,TY+1.6)});
  say([{who:'SAM',text:'“This is it. This is where he took it.”',by:'sam'},{who:'JAMIE',text:'“It was right there. By the door.”',by:'jamie'}],{then:()=>{if(!C.flags.window)objective('Look in the window.');}});void w;}
 function lookWindow(){if(C.flags.window)return;C.flags.window=true;objective('');const w=SPOT.masonWindow;let pu=w.look.u,pv=w.look.v,py=TY+w.look.y;
  /* (a step back from the glass, square to the poster: the room behind it, and the poster in the middle) */if(masonPoster){const wp=new THREE.Vector3();masonPoster.getWorldPosition(wp);({u:pu,v:pv}=UV(wp));py=wp.y;}
  const st=at(pu,pv+1.75),lk=at(pu,pv,py),ey=TY+.15+1.38;pose(st,{y:ey,pitch:Math.atan2(py-ey,1.75)*.8,yaw:headingTo(st.x,st.z,lk.x,lk.z)});
  say([{wait:1.2},{who:'',text:'[Dust. Empty hooks on the wall. A counter. A poster, faded almost white.]',time:3.4},{who:'JAMIE',text:'“Nobody’s been in there in years.”',by:'jamie'},{who:'SAM',text:'“Look. The poster.”',by:'sam'},{who:'YOU',text:'“That’s the bike.”'}],
   {then:()=>{unpose();later(1.2,florist);}});}
 function florist(){if(C.flags.florist)return;C.flags.florist=true;const f=P4('florist');
  if(f?.visible&&C.h<17.4){const q=at(141.6,-10.4);f.walk([[q.x,q.z]],{speed:1.1,then:a=>{const p=me();a.faceTo(p.x,p.z);a.lookAt=camera.position;
    say([{who:'MRS. KOWALSKI',text:'“Can I help you boys?”',from:a},{who:'MRS. KOWALSKI',text:'“There’s nobody in there, hon. Not since Roy Mason died.”',from:a},{who:'YOU',text:'“When was that?”'},
     {who:'MRS. KOWALSKI',text:'“Oh… ninety-nine? It’s been empty ever since.”',from:a},{who:'JAMIE',text:'“Did he have an old green bike?”',by:'jamie'},{who:'MRS. KOWALSKI',text:'“Roy had a lot of bikes.”',from:a,time:2.2,gap:1},
     {who:'MRS. KOWALSKI',text:'“If you want the old days, the library has the Courier on microfilm. Every issue. Ask Carol at the desk.”',from:a,time:4.4}].map(l=>l.from?{...l,time:l.time??Math.max(1.6,l.text.length*.052)}:by(l)),
     {then:()=>{toLibrary();const back=at(150.6,-10.2);a.lookAt=null;a.walk([[back.x,back.z]],{speed:1});}});}});return;}
  say([{who:'JAMIE',text:'“The library. They’ve got all the old newspapers.”',by:'jamie'}],{then:toLibrary});}
 function toLibrary(){C.flags.toLibrary=true;objective('Go to the library.','On the square, across Main Street.');for(const c of [jamie,sam])stand(c,null);}
 function talkVic(){if(C.talked.has('vic'))return;C.talked.add('vic');const a=P4('vic');const p=me();a.lookAt=camera.position;
  say([{who:'VIC',text:'“Afternoon, boys.”',from:a},{who:'JAMIE',text:'“Do you know Mason’s? The bike shop?”',by:'jamie'},{who:'VIC',text:'“Roy Mason’s place? Closed up in ninety-nine, when Roy passed.”',from:a},
   {who:'VIC',text:'“Nice man. Sold me my first bike. Nineteen fifty-nine.”',from:a},{who:'VIC',text:'“Library’s got all the old Couriers, if it’s for school.”',from:a}].map(l=>l.from&&l.from===a?{...l,time:Math.max(1.6,l.text.length*.052)}:by(l)),{then:()=>{a.lookAt=null;C.flags.libraryHint=true;}});void p;}
 // ---- the library -------------------------------------------------------------------------------------------------------------
 function enterLibrary(){if(C.flags.library)return;C.flags.library=true;go('d4-library');checkpoint('c4-library');objective('');follow(true);for(const c of [jamie,sam])stand(c,null);mark('the library');}
 function updateLibrary(dt){const p=me(),lib=P4('librarian');
  if(!C.flags.albright&&lib?.visible&&dist(p,lib.pos)<5.5&&!busy())talkLibrarian();
  if(!C.flags.albright&&!lib?.visible&&S.pt>4)talkLibrarian();}
 function talkLibrarian(){if(C.flags.albright)return;C.flags.albright=true;const a=P4('librarian');if(a){a.lookAt=camera.position;}
  const L2=[{who:'MRS. ALBRIGHT',text:'“Can I help you find something?”',from:a},{who:'JAMIE',text:'“Do you have old newspapers? The Courier?”',by:'jamie'},{who:'MRS. ALBRIGHT',text:'“On microfilm. The local history room, in the back.”',from:a},
   {who:'MRS. ALBRIGHT',text:'“What are you looking for?”',from:a},{who:'SAM',text:'“Mason’s. The bike shop.”',by:'sam'},{who:'MRS. ALBRIGHT',text:'“Roy Mason… try 1988. The shop’s anniversary. The reel’s already on the machine.”',from:a,time:3.8},
   {who:'MRS. ALBRIGHT',text:'“I close at eight, boys.”',from:a}];
  talk(L2.map(l=>l.from===a&&a?{...l,time:l.time??Math.max(1.6,l.text.length*.052)}:by(l)),{then:()=>{if(a)a.lookAt=null;C.flags.reel=true;objective('Use the microfilm reader.','The local history room, in the back.');}});}
 // The reader: a hood, a screen, a crank. A/D winds the film to the next thing on it.
 function startArchive(){if(C.view==='reader')return;go('d4-archive');C.view='reader';C.flags.reader=true;const R=SPOT.reader,st=at(R.u,R.v),lk=at(R.look.u,R.look.v,TY+R.look.y);
  {const e=at(R.u,60.0);pose(e,{y:TY+.75+1.5,pitch:.29,yaw:HN});}o.roam.walkLock=true;/* standing at it, close: the page fills the view */C.recT=0;C.recIdle=0;showRecord(C.rec||0);checkpoint('c4-historical-clue');objective('');
  stand(jamie,{u:147.4,v:58.4},{look:lk});stand(sam,{u:150.3,v:58.2},{look:lk});
  // (while you read, Jamie walked the bikes to the rack out front)
  bikesTo('rack');}
 function leaveArchive(){if(C.view!=='reader')return;C.view=null;unpose();if(!C.flags.closing)go('d4-library');for(const c of [jamie,sam])stand(c,null);}
 function showRecord(i){C.rec=clamp(i,0,ARCHIVE.length-1);C.recT=0;C.recIdle=0;drawRecord(ARCHIVE[C.rec]);const R2=ARCHIVE[C.rec];
  if(!C.read.has(C.rec)){C.read.add(C.rec);mark('the microfilm: '+R2.id);C.h=Math.max(C.h,R2.h);date(C.h);
   const cap=[{who:R2.paper.replace('THE ','')+' · '+R2.date.split(', ').slice(1).join(', '),text:'“'+R2.head+'”',time:3.2,gap:.8}];
   talk([...cap,...R2.react.map(by)],{interrupt:true,then:()=>{if(C.read.size>=ARCHIVE.length&&!C.flags.closing)later(2.2,closing);}});}}
 function updateArchive(dt){if(C.view!=='reader')return;C.recT+=dt;C.recIdle+=dt;
  if(C.recIdle>22&&!busy()&&C.read.size<ARCHIVE.length){C.recIdle=0;C.nudges=(C.nudges||0)+1;if(C.nudges<3)say([{who:'JAMIE',text:'“Next one.”',by:'jamie'}]);else{const n=[...Array(ARCHIVE.length).keys()].find(i=>!C.read.has(i));if(n!==undefined)showRecord(n);}}}
 function closing(){if(C.flags.closing)return;C.flags.closing=true;const a=P4('librarian');C.h=Math.max(C.h,HOUR.closing);date(C.h);
  if(a){a.show(true);const q=at(146.4,57.2);a.walk([[at(140,53).x,at(140,53).z],[q.x,q.z]],{speed:1,then:b=>{b.lookAt=camera.position;}});}
  talk([{wait:1.6},{who:'MRS. ALBRIGHT',text:'“Boys? I’m sorry. I’m closing up.”',from:a,time:2.6},{who:'SAM',text:'“What time is it?”',from:sam,time:1.6},{who:'MRS. ALBRIGHT',text:'“Ten to eight.”',from:a,time:1.8,gap:.4},{who:'SAM',text:'“Eight?”',from:sam,time:1.2}],
   {then:()=>{leaveArchive();go('d4-closing');objective('Go home.','Before the streetlights. Sam’s mom said.');C.flags.hurry=true;if(a){a.lookAt=null;const d=at(135,47);a.walk([[d.x,d.z]],{speed:1.1,then:b=>b.faceTo(at(135,40).x,at(135,40).z)});}}});}
 // ---- the reels: a page of the Courier as the reader shows it -------------------------------------------------------------------
 function wrapText(g,text,x,y,w,lh){for(const para of text.split('\n')){let line='';for(const word of para.split(' ')){const t=line?line+' '+word:word;if(g.measureText(t).width>w&&line){g.fillText(line,x,y);y+=lh;line=word;}else line=t;}if(line){g.fillText(line,x,y);y+=lh;}y+=lh*.4;}return y;}
 function drawRecord(R2){C.recDrawn=R2.id;if(!reel)return;const g=reel.g,w=1024,h=768;g.fillStyle='#d9d4c4';g.fillRect(0,0,w,h);
  // the page: masthead, the date line, a headline, a picture (halftone), the story in a column
  g.fillStyle='#24221e';g.textAlign='center';g.font='bold 54px Georgia, serif';g.fillText(R2.paper,w/2,82);g.fillRect(60,100,w-120,3);g.font='20px Georgia, serif';g.fillText(R2.date+'   ·   '+R2.page,w/2,128);g.fillRect(60,140,w-120,1.5);
  g.font='bold 44px Georgia, serif';let y=200;{const words=R2.head.split(' ');let line='';for(const wd of words){const t=line?line+' '+wd:wd;if(g.measureText(t).width>w-140&&line){g.fillText(line,w/2,y);y+=50;line=wd;}else line=t;}g.fillText(line,w/2,y);y+=34;}
  g.textAlign='left';const px=R2.pic?60:0,colX=R2.pic?520:80,colW=R2.pic?w-colX-60:w-160;
  if(R2.pic){drawPic(g,R2.pic,60,y,430,320);g.font='italic 18px Georgia, serif';g.fillText(R2.cap,64,y+346);}
  g.font='24px Georgia, serif';wrapText(g,R2.body,colX,y+24,colW,32);void px;
  // film: grain, a scratch or two, the hood's falloff
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(40,36,30,${Math.random()*.18})`;g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}
  g.strokeStyle='rgba(250,248,240,.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(w*.31,0);g.lineTo(w*.29,h);g.moveTo(w*.77,0);g.lineTo(w*.78,h*.6);g.stroke();
  const rg=g.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,h*.85);rg.addColorStop(0,'rgba(0,0,0,0)');rg.addColorStop(1,'rgba(0,0,0,.42)');g.fillStyle=rg;g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.75)';g.font='16px Arial';g.fillText('REEL '+(R2.id.endsWith('1966')?'1966-C':R2.id.endsWith('1988')?'1988-B':'1991-D')+'   ·   FRAME '+(ARCHIVE.indexOf(R2)*137+412),24,h-20);
  if(reelTex)reelTex.needsUpdate=true;}
 function drawPic(g,kind,x,y,w,h){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.fillStyle='#8e8a7e';g.fillRect(x,y,w,h);const dark='#2c2a26',mid='#5e5a52',lite='#b8b2a2';
  if(kind==='mason'){g.fillStyle=mid;g.fillRect(x,y,w,h*.62);g.fillStyle=dark;g.fillRect(x+w*.06,y+h*.06,w*.88,h*.1);g.fillStyle=lite;g.font='bold 24px Georgia';g.fillText('MASON CYCLE & SPORT',x+w*.14,y+h*.14);
   g.fillStyle='#3a3832';g.fillRect(x+w*.1,y+h*.24,w*.34,h*.38);g.fillRect(x+w*.56,y+h*.24,w*.34,h*.38);g.fillStyle='#7a766c';g.fillRect(x,y+h*.62,w,h*.38);
   // Roy, standing; the bike beside him
   g.fillStyle=dark;g.beginPath();g.ellipse(x+w*.28,y+h*.33,w*.035,h*.055,0,0,7);g.fill();g.fillRect(x+w*.24,y+h*.38,w*.08,h*.3);g.fillRect(x+w*.245,y+h*.68,w*.03,h*.2);g.fillRect(x+w*.285,y+h*.68,w*.03,h*.2);
   g.strokeStyle=dark;g.lineWidth=5;g.beginPath();g.arc(x+w*.46,y+h*.8,h*.1,0,7);g.arc(x+w*.72,y+h*.8,h*.1,0,7);g.stroke();g.beginPath();g.moveTo(x+w*.46,y+h*.8);g.lineTo(x+w*.54,y+h*.64);g.lineTo(x+w*.68,y+h*.64);g.lineTo(x+w*.72,y+h*.8);g.moveTo(x+w*.54,y+h*.64);g.lineTo(x+w*.58,y+h*.8);g.lineTo(x+w*.46,y+h*.8);g.moveTo(x+w*.68,y+h*.64);g.lineTo(x+w*.66,y+h*.56);g.quadraticCurveTo(x+w*.7,y+h*.52,x+w*.74,y+h*.56);g.stroke();
   g.fillStyle=lite;g.fillRect(x+w*.585,y+h*.69,w*.04,h*.03);}
  else if(kind==='portrait'||kind==='portrait-old'){g.fillStyle=kind==='portrait'?'#a6a296':'#9a9282';g.fillRect(x,y,w,h);g.fillStyle=dark;g.beginPath();g.ellipse(x+w*.5,y+h*.42,w*.13,h*.2,0,0,7);g.fill();g.beginPath();g.ellipse(x+w*.5,y+h*1.02,w*.34,h*.36,0,0,7);g.fill();
   g.fillStyle=mid;g.beginPath();g.ellipse(x+w*.5,y+h*.46,w*.1,h*.15,0,0,7);g.fill();if(kind==='portrait-old'){g.fillStyle=dark;g.fillRect(x+w*.36,y+h*.26,w*.28,h*.1);}}
  else if(kind==='bridge'){g.fillStyle='#a8a498';g.fillRect(x,y,w,h*.5);g.fillStyle=mid;g.fillRect(x,y+h*.5,w,h*.5);g.strokeStyle=dark;g.lineWidth=6;g.beginPath();g.moveTo(x,y+h*.62);g.quadraticCurveTo(x+w/2,y+h*.42,x+w,y+h*.62);g.stroke();
   for(let i=0;i<14;i++){const t=i/13,bx=x+t*w,by=y+h*.62-Math.sin(t*Math.PI)*h*.18;g.fillRect(bx-2,by-h*.12,4,h*.12);}g.fillRect(x,y+h*.48,w,4);g.fillStyle=dark;g.fillRect(x+w*.62,y+h*.36,w*.025,h*.1);}
  // halftone
  for(let yy=y;yy<y+h;yy+=6)for(let xx=x;xx<x+w;xx+=6){g.fillStyle=`rgba(217,212,196,${.18+.12*Math.sin(xx*.7+yy*.3)})`;g.fillRect(xx,yy,2.4,2.4);}g.restore();}
 // Moving the bikes (while nobody is looking): to the rack on the square, or where they were dropped at the video store.
 const RACK=[{u:127.2,v:11.5},{u:128.5,v:11.5},{u:129.8,v:11.5}],STORE=[{u:112.6,v:-9.4,a:.3},{u:110.8,v:-8.9,a:-.4},{u:114.4,v:-9.6,a:.9}];
 function bikesTo(where){const set=where==='rack'?RACK:STORE,ha=q=>{const a=at(q.u,q.v),b=at(q.u,q.v+(where==='rack'?2:-2));return headingTo(a.x,a.z,b.x,b.z)+(q.a||0);};
  const yb=at(set[0].u,set[0].v),r=o.roam;if(!me().riding){r.x=yb.x;r.z=yb.z;r.a=ha(set[0]);}
  for(const [i,c] of [[1,jamie],[2,sam]]){if(c.mode==='ride')continue;const q=at(set[i].u,set[i].v);c.bx=q.x;c.bz=q.z;c.ba=ha(set[i]);c.kick=where==='rack'?1:0;c.fall=where==='rack'?0:-1.3;c.bike.group.visible=true;}
  C.bikes=where;}
 // ---- what the Presence takes, and in what order ---------------------------------------------------------------------------
 const LV=T4.LV,NEON=T4.NEON,shopIdx=id=>{const b=BUILDINGS.find(q=>q.id===id);return b&&b.lit>=0?LV.shop+b.lit:-1;};
 const fixIdx=o2=>Object.values(o2||{});
 const LYRIC=[LV.neon+NEON.marquee,LV.neon+NEON.bulbs,LV.neon+NEON.blade,LV.neon+NEON.lyricUpper,shopIdx('lyric')].filter(i=>i>=0);
 const VIDEO=[shopIdx('video'),LV.neon+NEON.videoOpen,LV.neon+NEON.videoSign,LV.neon+NEON.exitSign,...fixIdx(D.videoFix)].filter(i=>i>=0);
 const LAUNDRY=[shopIdx('laundry'),LV.neon+NEON.laundrySign,...fixIdx(D.laundryFix)].filter(i=>i>=0);
 const lampsWhere=f=>D.lamps.filter(f).map(L=>LV.lamp+L.id);
 const LAUNDRY_LAMP=lampsWhere(L=>L.kind==='wall'&&Math.abs(L.u-163.75)<.5),VIDEO_LAMP=lampsWhere(L=>L.kind==='wall'&&Math.abs(L.u-103.75)<.5);
 const posU=i=>lights.posOf(i)?.u;const TV_HOLD=60;/* (where the dark waits: just past the TV shop) */
 const EAST=[...lampsWhere(L=>L.u<98||L.u===undefined),...BUILDINGS.filter(b=>b.lit>=0&&b.u1<98).map(b=>LV.shop+b.lit),...['dinerSign','dinerOpen','tapNeon','pizzaNeon','drugNeon','barberPole','vending','gasPrice','clock'].map(n=>LV.neon+NEON[n]).filter(i=>(posU(i)??0)<98)];
 const KEEP=new Set([...LYRIC,...VIDEO,...LAUNDRY,...LAUNDRY_LAMP,...VIDEO_LAMP]);
 const WEST=[...lampsWhere(L=>!(L.u<98)),...BUILDINGS.filter(b=>b.lit>=0&&!(b.u1<98)).map(b=>LV.shop+b.lit),...Object.keys(NEON).map(n=>LV.neon+NEON[n])].filter(i=>!KEEP.has(i)&&!EAST.includes(i));
 // A cascade of our own (lights.cascade, but one that can start part way through, for the jumps: what would already be
 // out goes out at once, quietly).
 function cascade(list,{from,dir=null,speed=6,delay=.8,skip=0,quiet=false}){const now=lights.S.t,t0=now+delay-skip;let last=now;
  const items=list.map(i=>{const q=lights.posOf(i);if(!q)return {i,d:0};const du=q.u-from.u,dv=q.v-from.v;return {i,d:dir?du*dir.u+dv*dir.v:Math.hypot(du,dv)};}).sort((a,b)=>a.d-b.d);
  for(const q of items){const t=t0+(dir?q.d:Math.max(0,q.d))/speed;/* (behind the start of a directed wave: already out) */if(t<=now){lights.hold[q.i]=0;lights.mask[q.i]=0;}else{lights.kill(q.i,t,{quiet});last=Math.max(last,t);}}return last;}
 const outNow=list=>{for(const i of list){lights.hold[i]=0;lights.mask[i]=0;}};
 // ---- dusk: out of the library ------------------------------------------------------------------------------------------------
 function updateClosing(dt){const p=me(),{v}=UV(p);if(!inside('library',p,.3)&&v<44.3&&!C.flags.outside)outside();}
 function outside(){if(C.flags.outside)return;C.flags.outside=true;go('e4-dusk');C.h=Math.max(C.h,HOUR.exit);C.hMin=HOUR.exit;date(C.h);checkpoint('c4-dusk');objective('Get your bikes.','At the rack, across the square.');
  for(const c of [jamie,sam])stand(c,null);follow(true);if(C.bikes!=='rack')bikesTo('rack');
  say([{who:'JAMIE',text:'“The bikes are on the rack out front.”',by:'jamie'},{who:'SAM',text:'“My mom is going to kill me.”',by:'sam'},{who:'JAMIE',text:'“It’s not even dark yet. If we ride fast—”',by:'jamie'}]);}
 function updateDusk(dt){const p=me(),{u,v}=UV(p);
  if(!C.flags.alex&&(Math.hypot(u-128.4,v-11)<7||S.pt>80))alexAcross();
  if(!C.flags.alex&&S.pt>45&&!C.flags.duskNudge&&!busy()){C.flags.duskNudge=true;say([{who:'JAMIE',text:'“The rack. By the street.”',by:'jamie'}]);}}
 // ---- Alex, across the street ----------------------------------------------------------------------------------------------------
 const HN=Math.PI*0,HS=Math.PI,HE=Math.PI/2,HWst=-Math.PI/2;// north (+v), south, east (-u), west (+u)
 const axHead=new THREE.Vector3(),crHead=new THREE.Vector3();
 function placeAX(u,v,a){const q=at(u,v);AX.x=q.x;AX.z=q.z;AX.a=a;AX.person.group.position.set(q.x,townY(u,v),q.z);AX.person.group.rotation.set(0,-a,0);AX.person.group.visible=true;}
 function alexAcross(){if(C.flags.alex)return;C.flags.alex=true;go('e4-alex');C.hMin=Math.max(C.hMin||0,HOUR.alex);mark('Alex, across the street');
  placeAX(126.8,-10.5,HN);AX.state='stand';AX.t=0;C.ax={t0:C.t,seenT:0,seenAt:null,walkAt:null,goneAt:null};S.lookTarget=axHead;
  for(const c of [jamie,sam])stand(c,null);stand(jamie,{u:127.8,v:10.2},{look:()=>axHead});stand(sam,{u:129.7,v:10.7},{look:()=>axHead});
  say([{wait:.8},{who:'JAMIE',text:'“…Alex?”',by:'jamie',time:1.8}]);}
 function updateAlexScene(dt){const X=C.ax;if(!X)return;const p=me(),{u,v}=UV(p);
  if(AX.state==='stand'){if(k.camLooksAt(axHead,.97)){X.seenT+=dt;if(X.seenT>.5&&X.seenAt===null){X.seenAt=C.t;mark('you see him');}}
   if(X.walkAt===null&&((X.seenT>1.6&&C.t-X.t0>3.4)||C.t-X.t0>9)){X.walkAt=C.t;AX.state='walk';AX.a=HS;AX.v=0;AX.t=0;
    stand(jamie,{u:127.6,v:7.9},{look:()=>axHead,max:1.6});stand(sam,{u:128.4,v:8.8},{look:()=>({x:jamie.px,y:1.3+townY(127.6,7.9),z:jamie.pz}),gesture:GEST.grab(1)});
    say([{who:'SAM',text:'“Jamie. Don’t.”',by:'sam',time:1.6}]);}}
  if(AX.state==='gone'&&X.goneAt!==null&&!C.flags.alexLines&&C.t-X.goneAt>1.2){C.flags.alexLines=true;S.lookTarget=null;
   const off=Math.hypot(u-126.8,v+12)<5;
   say([...(off?[{who:'SAM',text:'“Come back. Please.”',by:'sam'}]:[]),{who:'JAMIE',text:'“That was him.”',by:'jamie'},{who:'SAM',text:'“It wasn’t. It wasn’t him in the tunnel either.”',by:'sam',time:2.6,gap:1.4},{who:'JAMIE',text:'“…I know.”',by:'jamie',time:1.6}],
    {then:()=>{go('e4-ride');C.hMin=Math.max(C.hMin||0,19.98);objective('Go home.','East on Main Street, then up Old Mill Road.');for(const c of [jamie,sam])stand(c,null);follow(true);}});}}
 // His walk: into the gangway between the shoe repair and Mason's, and then he is not there.
 function updateAX(dt){if(!AX.person.group.visible)return;AX.t+=dt;const P2=AX.pose;
  if(AX.state==='walk'){AX.v=damp(AX.v,1.05,2.5,dt);AX.x+=Math.sin(AX.a)*AX.v*dt;AX.z-=Math.cos(AX.a)*AX.v*dt;AX.gait+=AX.v*dt/1.2;walkPose(P2,AX.gait,Math.max(AX.v,.8),{look:0});
   const {u,v}=TL(AX.x,AX.z);AX.person.group.position.set(AX.x,townY(u,v),AX.z);AX.person.group.rotation.set(0,-AX.a,0);
   if(AX.t>3.3||v<-17.5){AX.person.group.visible=false;AX.state='gone';if(C.ax)C.ax.goneAt=C.t;mark('he is gone');}}
  else{const p=me(),la=clamp(-wrap(headingTo(AX.x,AX.z,p.x,p.z)-AX.a),-1.1,1.1);AX.lk=damp(AX.lk??la*.8,AX.turn?AX.turn:la*.8,AX.still?1.2:4,dt);standPose(P2,AX.still?0:AX.t*.6,{look:AX.lk});}/* (still: not breathing, not shifting; the head turns, slowly) */
  applyPose(AX.person,P2);AX.person.group.updateMatrixWorld(true);AX.person.group.getWorldPosition(axHead);axHead.y+=1.42;if(AX.talk>0)AX.talk-=dt;}
 // ---- the thing from the drain, at the end of Second Street --------------------------------------------------------------------
 function updateDuskRide(dt){const p=me(),{u,v}=UV(p);
  if(!C.flags.crt&&u<99.6&&u>76&&Math.abs(v)<60)creatureDusk();
  if(!C.flags.crt&&u>150&&!C.flags.westNudge&&!busy()){C.flags.westNudge=true;say([{who:'SAM',text:'“Home’s the other way.”',by:'sam'}]);}
  if(!C.flags.crt&&S.pt>100&&!C.flags.ride2Nudge&&!busy()){C.flags.ride2Nudge=true;say([{who:'JAMIE',text:'“Come on. That way. Up Main.”',by:'jamie'}]);}
  if(!C.flags.crt&&S.pt>170)carry('dusk',99,2.8,HE,{ride:me().riding});}
 // ---- the creature at dusk: it comes for them, stops, looks at nothing, and is afraid -------------------------------------
 // From the far end of Second Street it sees them and comes, low, up the middle of the street, closer than anyone wants.
 // It stops dead and looks past them at the TV shop's corner, the way they were going, where nobody is standing. That
 // corner's light dies, slowly. It backs away from it and makes itself small against the lit corner of the video store,
 // nearer the boys than it has been, still turned to the corner, shaking. Then, far up Main, the streetlights begin to go
 // out one after another, coming this way, and it bolts back down Second Street for the creek, the light over the street
 // dying as it passes under it. The boys only ever see the lights. Each stage waits (within limits) for you to have seen
 // it; nothing turns your head.
 const CORNER={u:76,v:-7},HIDE={u:97.85,v:-13.7};
 const lampAt=(u,v)=>{let b=null,bd=1e9;for(const L of D.lamps){const d=Math.hypot(L.u-u,L.v-v);if(d<bd){bd=d;b=L;}}return b?LV.lamp+b.id:-1;};
 /* (any light, a shop's included: the one over the TV shop's door is the corner's) */
 const lightAt=(u,v)=>{let b=-1,bd=1.5;for(let i=0;i<600;i++){const q=lights.posOf(i);if(!q)continue;const d=Math.hypot(q.u-u,q.v-v);if(d<bd){bd=d;b=i;}}return b>=0?b:lampAt(u,v);};
 const lampPos=i=>{const q=lights.posOf(i);return q?at(q.u,q.v,q.y??TY+4.5):null;};
 function creatureDusk(){if(C.flags.crt)return;C.flags.crt=true;go('e4-creature');C.hMin=Math.max(C.hMin||0,HOUR.creature);mark('something at the end of Second Street');
  C.crt={stage:'watch',t:0,seenT:0,seenAt:null,u:90,v:-36,a:HN,y:null,vy:0,dive:0,stageAt:{watch:C.t},hideSeen:0,glance:0,gi:0,fs:0,k:{},
   lit:{corner:lightAt(72.8,-12),corner2:lampAt(66,-7.7),side:lampAt(94.2,-24),far:lampAt(94.2,-46)}};
  creature.ground=(x,z)=>{const R=C.crt;if(R?.vy>0)return R.y;/* (in the air, its feet go with it) */const q=TL(x,z);return townY(q.u,q.v)-(R?.dive||0);};creature.show(true);placeCrt();S.lookTarget=crHead;
  for(const c of [jamie,sam]){if(c.mode==='ride'&&!c.script)comp.run(c,[comp.steps.brake(c,.5)]);c.lookAt=crHead;}
  T?.set?.(.4,{rise:.08,why:'it, at the end of the street'});
  say([{who:'SAM',text:'“Stop. Stop.”',by:'sam',time:1.4},{who:'JAMIE',text:'“Is that—”',by:'jamie',time:1.4},{who:'SAM',text:'“Don’t move.”',by:'sam',time:1.4}]);}
 function placeCrt(dt=0){const R=C.crt;if(!R)return;const q=at(R.u,R.v),tgt=townY(R.u,R.v)-R.dive;
  /* (off the creek bank it falls, it does not drop a storey in one frame) */if(dt>0&&R.y!=null&&tgt<R.y-.05){R.vy=(R.vy||0)+9.8*dt;R.y=Math.max(tgt,R.y-R.vy*dt);}else{R.vy=0;R.y=tgt;}creature.place(q.x,R.y,q.z,R.a);}
 function crStage(s){const R=C.crt;R.stage=s;R.t=0;R.stageAt[s]=C.t;mark('it: '+s);}
 const crKill=(name,o)=>{const R=C.crt;if(R.k[name])return;R.k[name]=C.t;const i=R.lit[name];if(i>=0&&lights.hold[i]>0)lights.kill(i,lights.S.t,o);};
 function updateCrt(dt){const D2=creature.drive;
  if(C.crt&&C.crt.stage!=='gone'&&S.phase.startsWith('e4-')){const R2=C.crt;R2.t+=dt;let sp=0,look=camera.position;D2.snap=0;
   creature.headPos?.(crHead);if(!creature.loaded){const q=at(R2.u,R2.v);crHead.set(q.x,(R2.y??TY)+.9,q.z);}
   const p=me(),cw=at(R2.u,R2.v),dYou=Math.hypot(p.x-cw.x,p.z-cw.z),seen=k.camLooksAt(crHead,.985);if(seen)R2.seenT+=dt;
   const to=(u,v,s2)=>{const du=u-R2.u,dv=v-R2.v,l=Math.hypot(du,dv);if(l<.06)return true;const st=Math.min(l,s2*dt);R2.u+=du/l*st;R2.v+=dv/l*st;return l<.35;};
   const face=(u,v,kk=4)=>{const w=at(u,v);R2.a+=wrap(headingTo(cw.x,cw.z,w.x,w.z)-R2.a)*(1-Math.exp(-kk*dt));};
   const cornerW=at(CORNER.u,CORNER.v,TY+1.4),upMain=at(-20,1,TY+3),dmp=(k2,to2,r)=>{D2[k2]=damp(D2[k2]||0,to2,r,dt);};
   /* (it looks from one thing to the next, fast, the way a frightened animal does) */
   const glanceAt=list=>{R2.glance-=dt;if(R2.glance<=0){R2.gi=(R2.gi+1)%list.length;R2.glance=.7+((R2.gi*.37)%1)*.9;R2.snapT=.25;}if((R2.snapT-=dt)>0)D2.snap=1;return list[R2.gi]||cornerW;};
   if(R2.stage==='watch'){dmp('crouch',.7,3);dmp('alert',0,3);if(R2.seenT>.4&&R2.seenAt===null)R2.seenAt=C.t;if((R2.seenT>1.2&&R2.t>2.2)||R2.t>6.5){crStage('stalk');say([{who:'JAMIE',text:'“It’s coming.”',by:'jamie',time:1.3},{who:'SAM',text:'“Don’t run. Don’t run.”',by:'sam',time:1.6}],{interrupt:true});}}
   else if(R2.stage==='stalk'){/* low and deliberate, straight at them, a little quicker as it comes; once, under the light, it stops and holds still */
    const hold=R2.v>-25.2&&R2.v<-24.2&&!R2.k.paused;if(hold){R2.pauseT=(R2.pauseT||0)+dt;if(R2.pauseT>1.3)R2.k.paused=C.t;dmp('crouch',.65,4);}
    else{sp=1.7+.7*clamp((R2.v+36)/22,0,1);dmp('crouch',.42,3);R2.v+=sp*dt;R2.u=90+.45*Math.sin(R2.t*.8);face(R2.u+.6*Math.sin(R2.t*.8),R2.v+6,3);}
    if(R2.v>=-14||dYou<12||R2.t>20)crStage('freeze');}
   else if(R2.stage==='freeze'){/* mid-stride, dead still; the head snaps round, past them, to the corner */
    if(R2.t<dt*1.5){say([{who:'YOU',text:'“Why’d it stop?”',time:1.6}],{interrupt:true});glance(sam,cornerW,3.2);}
    D2.snap=R2.t<.3?1:0;look=cornerW;dmp('alert',1,5);dmp('crouch',.05,5);if(R2.t>2.2)crStage('look');if(dYou<6)crStage('flinch');}
   else if(R2.stage==='look'){/* its whole body turns to it; the corner's light dies, slowly */
    face(CORNER.u,CORNER.v,2.2);look=cornerW;dmp('alert',1,4);if(R2.t<dt*1.5)say([{who:'JAMIE',text:'“What’s it looking at?”',by:'jamie',time:1.6},{wait:.6},{who:'SAM',text:'“There’s nothing there.”',by:'sam',time:1.6}],{interrupt:true});
    if(R2.t>1.1)crKill('corner',{dur:1.8,flick:.97});if(R2.t>2.3)crKill('corner2',{dur:.9,flick:.9});if(R2.t>3.2)crStage('back');if(dYou<6.5&&R2.t>.3)crStage('flinch');}
   else if(R2.stage==='back'){/* it backs away from it, low, never taking its eyes off it */
    D2.back=1;dmp('alert',0,3);dmp('cower',.55,4);sp=.9;to(HIDE.u,HIDE.v,.9);face(CORNER.u,CORNER.v,3);look=glanceAt([cornerW,upMain,cornerW]);
    if(R2.t<dt*1.5)say([{who:'JAMIE',text:'“It’s backing up.”',by:'jamie',time:1.4}],{interrupt:true});if(R2.t>2.4)crStage(Math.hypot(p.x-at(HIDE.u,HIDE.v).x,p.z-at(HIDE.u,HIDE.v).z)<9?'flinch':'scurry');if(dYou<6.5)crStage('flinch');}
   else if(R2.stage==='scurry'){/* then turns and scrambles for the lit corner of the store: toward them, away from it */
    D2.back=0;dmp('cower',.35,6);sp=3.2;face(HIDE.u,HIDE.v,9);look=cornerW;if(to(HIDE.u,HIDE.v,3.2)||R2.t>4)crStage('hide');if(dYou<6)crStage('flinch');}
   else if(R2.stage==='hide'){/* pressed into the corner of the store, in its light, made small, turned to the corner, looking and looking */
    dmp('cower',1,3);dmp('crouch',.35,3);face(CORNER.u,CORNER.v-3,2.5);look=glanceAt([cornerW,upMain,cornerW,camera.position,cornerW]);if(seen)R2.hideSeen+=dt;
    if(R2.t>.7&&!R2.k.hideLine){R2.k.hideLine=C.t;say([{who:'SAM',text:'“It’s hiding.”',by:'sam',time:1.5},{wait:.7},{who:'JAMIE',text:'“…From what?”',by:'jamie',time:1.6}],{interrupt:true});}
    /* the answer: far up Main the lights begin to go out, one after another, coming this way */
    if(!C.flags.cascade&&((R2.hideSeen>1.5&&R2.t>4.4)||R2.t>8))cascadeStart(0,{quiet:true});
    const fr=C.cas?.front??-99;if((C.cas&&((fr>-64&&R2.hideSeen>2)||fr>-44))||(dYou<6.5&&R2.t>.4))crStage('flinch');}
   else if(R2.stage==='flinch'){/* it recoils, all of it at once, then runs (the corner's light goes with it, if it had not) */
    crKill('corner',{dur:.7,flick:.9});crKill('corner2',{dur:.5,flick:.9});D2.snap=1;D2.back=1;dmp('cower',.6,10);look=upMain;to(HIDE.u-.2,HIDE.v-.8,2.6);if(R2.t>.5){D2.back=0;crStage('flee');}}
   else if(R2.stage==='flee'){/* back down Second Street for the creek; the light over the street dies as it passes under it */
    if(R2.t<dt*1.5)say([{who:'SAM',text:'“It ran.”',by:'sam',time:1.4}],{interrupt:true});dmp('cower',0,6);R2.fs=Math.min(8.4,R2.fs+15*dt);sp=R2.fs;
    const wp=R2.v>-30?{u:92.4,v:-34}:{u:91,v:-62};face(wp.u,wp.v,10);to(wp.u,wp.v,sp);look=null;
    if(R2.v<-23)crKill('side',{dur:.35,flick:.85});if(R2.v<-43)crKill('far',{dur:.35,flick:.8});if(R2.v<-56.2){R2.dive=Math.min(2.4,R2.dive+dt*5.5);}
    if(R2.v<-58.6||R2.t>8){crStage('gone');creature.show(false);creature.ground=null;S.lookTarget=null;for(const c of [jamie,sam])if(c.lookAt===crHead)c.lookAt=null;sound('splash',at(90,-58.6,TY-2),{gain:.8});later(1.4,()=>cascadeStart());}}
   if(R2.stage!=='gone'){/* (never through one of them: it goes round) */for(const c of [p,{x:jamie.px,z:jamie.pz},{x:sam.px,z:sam.pz}]){const w=at(R2.u,R2.v),dx=w.x-c.x,dz=w.z-c.z,l=Math.hypot(dx,dz);if(l<1.6&&l>1e-3){const q2=TL(w.x+dx/l*(1.6-l),w.z+dz/l*(1.6-l));R2.u=q2.u;R2.v=q2.v;}}
    D2.speed=sp;D2.look=look;placeCrt(dt);creature.update(dt);}}
  else if(C.esc?.pass&&C.esc.pass.stage!=='gone')updatePass(dt);}
 // ---- the streetlights ----------------------------------------------------------------------------------------------------------
 function cascadeStart(skip=0,{quiet=false}={}){if(C.flags.cascade)return;C.flags.cascade=true;go('e4-cascade');checkpoint('c4-presence');C.hMin=Math.max(C.hMin||0,HOUR.cascade);
  /* (it goes as far as the TV shop and waits there while the sets in its window are on; the rest goes when it moves on) */
  C.cas={t:skip,start:lights.S.t+.8-skip,speed:6,tvAt:null,nearAt:null,darkT:0,pulled:false,watch:0,saidAt:null,resumeT:null,rest:EAST.filter(i=>posU(i)>=TV_HOLD+2)};cascade(EAST.filter(i=>!(posU(i)>=TV_HOLD+2)),{from:{u:-80,v:0},dir:{u:1,v:0},speed:6,skip});
  mark('the lights going out');T?.set?.(.55,{rise:.04,why:'the lights going out, coming closer'});C.amb.traffic=0;
  for(const c of [jamie,sam]){if(c.mode==='ride'&&!c.script)c.follow=null;c.lookAt=at(-10,2,TY+4);}
  /* (from the hiding creature: no question first, the lights are the answer to the one just asked) */
  if(!skip)say([...(quiet?[{wait:.4}]:[{who:'JAMIE',text:'“Why would it—”',by:'jamie',time:1.2},{wait:1.6}]),{who:'',text:'[Far up Main Street, a streetlight goes out. Then the next one.]',time:3.4}]);}
 function updateCascade(dt){const X=C.cas;if(!X)return;X.t+=dt;const p=me(),{u}=UV(p),front=X.resumeT===null?Math.min(TV_HOLD,-80+X.speed*Math.max(0,lights.S.t-X.start)):TV_HOLD+X.speed*Math.max(0,lights.S.t-X.resumeT);X.front=front;
  C.darkTo=.55*smooth((front-(u-34))/30);
  if(X.tvAt===null&&front>=TV_HOLD)tvWindow();
  if(X.tvAt!==null&&X.resumeT===null){const w=at(72.8,-11.6,TY+1.6);if(Math.hypot(p.x-w.x,p.z-w.z)<13&&k.camLooksAt(w,.94))X.watch+=dt;
   if(X.saidAt===null&&((X.watch>1.5&&!busy())||C.t-X.tvAt>16)){X.saidAt=C.t;say([{who:'SAM',text:'“That’s us. That’s us, right now.”',by:'sam',time:2.2}],{interrupt:true,then:()=>later(3,()=>{if(X.resumeT===null){X.resumeT=lights.S.t;cascade(X.rest,{from:{u:TV_HOLD,v:0},dir:{u:1,v:0},speed:X.speed,delay:.2});}})});}}
  if(X.nearAt===null&&front>=u-16){X.nearAt=C.t;C.flags.hurry=true;objective('Get inside.','The video store. It’s still lit.');for(const c of [jamie,sam])c.lookAt=null;
   say([{who:'JAMIE',text:'“The video store. Go. GO!”',by:'jamie',time:1.6}],{interrupt:true});for(const [c,i] of [[jamie,1],[sam,2]])runToStore(c,i);}
  if(front>u+2&&!inside('video',p)){X.darkT+=dt;if(X.darkT>8&&!C.flags.d1){C.flags.d1=true;say([{who:'SAM',text:'“Come on!”',by:'sam',time:1.2}]);}
   if(X.darkT>18&&!C.flags.d2){C.flags.d2=true;say([{who:'JAMIE',text:'“Please. In here!”',by:'jamie',time:1.6}]);}
   if(X.darkT>32&&!X.pulled&&C.fadeOut<0){X.pulled=true;C.fadeOut=0;C.after=()=>{const q=SPOT.videoIn;youFoot(q.u,q.v-.6,HS,STORE[0]);enterStore();C.fadeIn=0;};}}
  if(inside('video',p,-.3))enterStore();}
 // the two of them: ride to the store's front, drop the bikes, run in
 function runToStore(c,i){const q=at(STORE[i].u,STORE[i].v),door=at(106.5,-12.6),inS=at(i===1?103.2:102.4,-13.4);
  const inside2=[comp.steps.walkTo(c,[[door.x,door.z],[inS.x,inS.z]],{speed:3.2})];
  if(c.mode==='ride')comp.run(c,[comp.steps.rideTo(c,[[q.x,q.z]],{vmax:5.5}),comp.steps.brake(c,.2),comp.steps.dismount(c,1.8),comp.steps.drop(c),...inside2],{then:()=>{stand(c,{u:i===1?103.6:102.6,v:i===1?-17.9:-13.5},{look:()=>tvPos()});}});
  else comp.run(c,inside2,{then:()=>{stand(c,{u:i===1?103.6:102.6,v:i===1?-17.9:-13.5},{look:()=>tvPos()});}});}
 // The TV shop's window, closed since six: every set comes on at once, and shows the three of them from high above.
 function tvWindow(){if(C.cas.tvAt!==null)return;C.cas.tvAt=C.t;tvShow('acetv','live-high');mark('the TVs in the window');sound('static',at(72.8,-11.6,TY+1.4),{gain:.6});
  for(const c of [jamie,sam])c.lookAt=at(72.8,-11.6,TY+1.4);say([{who:'JAMIE',text:'“Look. The TVs.”',by:'jamie',time:1.6}],{interrupt:true});
  /* (they stay with you, wherever you go now; they look at it) */}
 // ---- the televisions --------------------------------------------------------------------------------------------------------------
 const TVS={video:{tv:D.tvs.video,share:[]},laundry:{tv:D.tvs.laundry,share:[]},acetv:{tv:D.tvs.acetv?.[0],share:D.tvs.acetv?.slice(1)||[]}};
 for(const T2 of Object.values(TVS))Object.assign(T2,{on:0,shot:null,t:0,stat:1,rt:0,frames:0});
 const tvPos=()=>{const q=SPOT.videoTV;return at(q.u,q.v,TY+.18+2.32);};
 const storeCorner=()=>{const c=footage.storeCornerUV||[115,-27.5];return at(c[0],c[1],TY+.18+3.1);};
 function tvShow(key,shot){const T2=TVS[key];if(!T2?.tv)return;T2.on=1;T2.shot=shot;T2.t=0;T2.stat=shot?1:1;T2.rt=0;(C.shots||=[]).push({key,shot,at:+C.t.toFixed(2)});}
 function tvOff(key){const T2=TVS[key];if(T2){T2.on=0;T2.shot=null;}}
 const meNow=()=>{const p=me();return {x:p.x,z:p.z,a:p.a,y:nav.groundY(p.x,p.z)??TY,with:[jamie,sam].filter(c=>c.active).map(c=>c.mode==='ride'?{x:c.bx,z:c.bz}:{x:c.px,z:c.pz})};};
 const _tv=new THREE.Vector3();
 function shotT(T2){const S2=footage.SHOTS[T2.shot];if(!S2)return T2.t;if(S2.hold)return Math.min(T2.t,S2.len);return T2.t;}
 function updateTVs(dt){const tl=[];for(const T2 of Object.values(TVS)){if(!T2.tv)continue;T2.t+=dt;if(T2.on&&footage.SHOTS[T2.shot]?.live)footage.track(T2.shot,meNow(),T2.t);
   T2.stat=T2.shot?Math.max(.0,T2.stat-dt*1.4):1;const sets=[T2.tv,...T2.share];T2.tv.screen.getWorldPosition(_tv);const near=_tv.distanceTo(camera.position)<45&&(T2.frames===0||k.camLooksAt(_tv,.15));/* (drawn only while it can be seen) */
   if(T2.on&&T2.shot&&near){T2.rt-=dt;if(T2.rt<=0){T2.rt=1/12;T2.frames++;footage.render(T2.tv,T2.shot,shotT(T2),meNow(),T2.share.map(q=>q.screen));const u0=T2.tv.mat.uniforms;for(const s of T2.share){s.mat.uniforms.uTex.value=u0.uTex.value;s.mat.uniforms.uHas.value=u0.uHas.value;}}}
   for(const tv of sets){const U=tv.mat.uniforms;U.uOn.value=damp(U.uOn.value,T2.on,12,dt);U.uStatic.value=T2.shot?T2.stat*.9+.06*Math.random()*T2.on:1;U.uRoll.value=T2.stat>.3?(U.uRoll.value+dt*.8)%1:damp(U.uRoll.value,0,6,dt);U.uBright.value=footage.SHOTS[T2.shot]?.live?2.2:1.3;}
   if(T2.on){const {u,v}=TL(_tv.x,_tv.z);tl.push({u,v,y:_tv.y,lv:1,k:2.6,r:6.5,c:TVC});}}
  lights.S.tvLights=tl;}
 const TVC=new THREE.Color(.62,.72,1);
 // ---- the camera's flash, and the picture of the screen ------------------------------------------------------------------------------
 let flashT=0;function flash(at2=camera.position){flashT=.14;flashL.position.copy(at2);sound('flash',at2,{gain:.5});}
 function updateFlash(dt){if(flashT>0){flashT=Math.max(0,flashT-dt);flashL.intensity=flashT>0?60*flashT/.14:0;}else flashL.intensity=0;}
 const leadIndex=()=>photo.photos.findIndex(p=>p.lead);
 function takePicture(by='you',{quiet=false}={}){if(C.inv.lead)return leadIndex();const T2=TVS.video,g=footage.grab(T2.tv,o.readPixels);
  const idx=photo.capture({id:'pine-ridge-tv',date:'08/23/2011',time:fmt(Math.max(C.h,HOUR.store+.03)).replace(' ',''),source:(gg,w,h)=>drawLead(gg,w,h,g),label:'PINE RIDGE'});
  C.inv.lead=true;C.leadBy=by;saveInv();mark('a picture of the screen');if(!quiet){flash(by==='jamie'?new THREE.Vector3(jamie.px,camera.position.y,jamie.pz):camera.position);sound('shutter',camera.position,{gain:.6});}return idx;}
 function drawLead(g,w,h,grab){g.fillStyle='#0a0a0b';g.fillRect(0,0,w,h);const sx=w*.13,sy=h*.13,sw=w*.74,sh=h*.7;
  g.fillStyle='#141416';g.beginPath();g.roundRect?.(sx-w*.05,sy-h*.06,sw+w*.1,sh+h*.12,18);g.fill();
  let drew=false;if(grab?.px){try{const c=document.createElement('canvas');c.width=grab.w;c.height=grab.h;const tg=c.getContext('2d'),im=tg.createImageData(grab.w,grab.h);
   for(let y=0;y<grab.h;y++){const sy2=grab.h-1-y;for(let x=0;x<grab.w;x++){const i=(y*grab.w+x)*4,j=(sy2*grab.w+x)*4;for(let ch=0;ch<3;ch++)im.data[i+ch]=Math.min(255,grab.px[j+ch]*1.08);im.data[i+3]=255;}}
   tg.putImageData(im,0,0);g.drawImage(c,sx,sy,sw,sh);drew=true;}catch{}}
  if(!drew){g.fillStyle='#4a4e5a';g.fillRect(sx,sy,sw,sh);g.fillStyle='#3a3a30';g.fillRect(sx,sy+sh*.62,sw,sh*.38);try{const c=document.createElement('canvas');c.width=320;c.height=200;pineSignArt(c.getContext('2d'),320,200);g.drawImage(c,sx+sw*.18,sy+sh*.16,sw*.64,sh*.5);}catch{}}
  for(let y=sy;y<sy+sh;y+=3){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(sx,y,sw,1.2);}
  const rg=g.createRadialGradient?.(sx+sw*.86,sy+sh*.12,2,sx+sw*.86,sy+sh*.12,w*.09);if(rg){rg.addColorStop(0,'rgba(255,255,255,.75)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(sx,sy,sw,sh);}}
 // Making sure the picture exists (a jump past the store, a Continue): the shot rendered once more and photographed.
 function ensureLead(){if(C.inv.lead&&leadIndex()>=0)return;C.inv.lead=false;if(o.shoot&&TVS.video.tv)try{footage.render(TVS.video.tv,'pine-ridge',8,meNow());}catch{}takePicture('auto',{quiet:true});}
 // ---- the video store -------------------------------------------------------------------------------------------------------------
 function enterStore(){if(C.flags.store)return;C.flags.store=true;go('n4-store');checkpoint('c4-video-store');objective('');C.hMin=Math.max(C.hMin||0,HOUR.store);C.darkTo=.42;C.flags.hurry=false;
  C.store={t:0,shotAt:null,stage:'in',shot:null,ringAt:null,ring:false,answered:null,live:null,dark:null,doorShut:null,pineAt:null,leadAsk:null,lines:new Set()};tvShow('video',null);
  for(const [c,i] of [[jamie,1],[sam,2]])if(!c.script&&!inside('video',{x:c.px,z:c.pz})&&c.mode==='foot')runToStore(c,i);else if(c.mode==='ride'&&!c.script)runToStore(c,i);
  say([{wait:.6},{who:'SAM',text:'“Hello?”',by:'sam',time:1.2},{wait:.8},{who:'JAMIE',text:'“Nobody’s here.”',by:'jamie',time:1.6},{who:'',text:'[A sign on the counter: BACK IN 10 MIN — D.]',time:2.6}]);}
 const SEQ=['alex-ride','alex-yard','pine-ridge','alex-room'];
 const SHOT_LINES={'alex-ride':[{who:'JAMIE',text:'“That’s Alex.”',by:'jamie'},{who:'SAM',text:'“That’s Briarwood. That’s from— up in the air.”',by:'sam'}],'alex-yard':[{who:'SAM',text:'“Who’s filming this?”',by:'sam'}],
  'pine-ridge':[{who:'JAMIE',text:'“Where is that?”',by:'jamie'}],'alex-room':[{who:'SAM',text:'“That’s his room.”',by:'sam'},{wait:.8},{who:'SAM',text:'“That’s his room.”',by:'sam'}]};
 function storeShot(id){const X=C.store;X.shot=id;X.shotAt=C.t;X.shotSeen=0;tvShow('video',id);if(SHOT_LINES[id]&&!X.lines.has(id)){X.lines.add(id);say(SHOT_LINES[id],{interrupt:id==='alex-room'});}mark('the TV: '+id);}
 function updateStore(dt){const X=C.store;if(!X)return;X.t+=dt;const p=me(),inS=inside('video',p,-.2);if(X.shot&&k.camLooksAt(tvPos(),.93))X.shotSeen=(X.shotSeen||0)+dt;
  // the front door, once all three are in
  if(X.doorShut===null&&inS&&UV(p).v<-12.9/* (past the doorway: it never shuts on you) */&&((inside('video',{x:jamie.px,z:jamie.pz})&&inside('video',{x:sam.px,z:sam.pz}))||X.t>7)){X.doorShut=C.t;DOORS['video-front'].open=0;sound('door',at(106.5,-11.4,TY+1),{gain:.7});
   for(const c of [jamie,sam])if(!inside('video',{x:c.px,z:c.pz})&&c.mode==='foot'){const q=at(c===jamie?103.6:102.6,c===jamie?-17.9:-13.5);comp.putFoot(c,q.x,q.z,HS,{bike:c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:0,fall:-1.3}:null});stand(c,{u:c===jamie?103.6:102.6,v:c===jamie?-17.9:-13.5},{look:()=>tvPos()});}}
  // the tape: one shot after another (the picture of the sign holds until it is photographed)
  if(X.shot===null&&X.t>4.2)storeShot(SEQ[0]);
  else if(X.shot&&SEQ.includes(X.shot)){const S2=footage.SHOTS[X.shot],e=C.t-X.shotAt;
   if(X.shot==='pine-ridge'){if(X.pineAt===null)X.pineAt=C.t;
    if(e>3.2&&X.leadAsk===null&&!C.inv.lead){X.leadAsk=C.t;objective('Take a picture of the screen.','With Alex’s camera.');say([{who:'JAMIE',text:'“Take a picture. Take a picture of it!”',by:'jamie'}]);}
    if(C.inv.lead&&!X.gotIt){X.gotIt=C.t;objective('');if(C.leadBy==='you')say([{who:'YOU',text:'“Got it.”'}]);}
    if(!C.inv.lead&&X.leadAsk!==null&&C.t-X.leadAsk>15&&!C.view){X.gotIt=C.t;objective('');say([{who:'JAMIE',text:'“Give it—”',by:'jamie',time:1}],{then:()=>{takePicture('jamie');}});}
    if(C.inv.lead&&X.gotIt&&C.t-X.gotIt>2.6&&!busy())storeShot('alex-room');}
   /* (a shot nobody has looked at yet holds: it waits for you, a while) */else if(e>S2.len&&(X.shotSeen>=Math.min(2,S2.len*.4)||e>S2.len+9)){const i=SEQ.indexOf(X.shot);if(i<SEQ.length-1)storeShot(SEQ[i+1]);else{X.shot='static';X.shotAt=C.t;tvShow('video',null);}}}
  else if(X.shot==='static'&&X.ringAt===null&&C.t-X.shotAt>1.6&&!busy()){X.ringAt=C.t;X.ring=true;mark('the phone rings');}
  if(X.ring&&!X.answered){const q=at(SPOT.videoPhone.u,SPOT.videoPhone.v,TY+1.1);X.ringT=(X.ringT||0)-dt;if(X.ringT<=0){X.ringT=2.8;sound('phone',q,{gain:.9});}
   if(C.t-X.ringAt>14)answerPhone('sam');}
  if(X.answered&&X.live===null&&X.callDone&&!busy()){X.live=C.t;tvShow('video','live-store');mark('the TV: live');say([{who:'SAM',text:'“That’s us.”',by:'sam',time:1.6},{wait:1.2},{who:'JAMIE',text:'“Where’s the camera? There’s no camera.”',by:'jamie'}]);
   /* (Sam looks up at where it would have to be; Jamie turns round, looking for it) */later(.4,()=>glance(sam,storeCorner(),3.4));later(2.2,()=>glance(jamie,storeCorner(),2.6));X.corner0=footage.storeCornerChanges;}
  if(X.live!==null&&footage.storeCornerChanges>X.corner0&&!X.k?.moved){(X.k||={}).moved=C.t;glance(sam,storeCorner(),2.2);say([{who:'SAM',text:'“It moved. It’s— from over there now.”',by:'sam',time:2}]);}
  if(X.dark!==null&&!X.k?.front&&Math.hypot(p.x-at(106.5,-12.6).x,p.z-at(106.5,-12.6).z)<2.4){(X.k||={}).front=C.t;glance(sam,at(106.5,-9,TY+1.4),2);say([{who:'SAM',text:'“Not out there.”',by:'sam',time:1.4},{who:'JAMIE',text:'“The back. Come on.”',by:'jamie',time:1.4}]);}
  if(X.live!==null&&X.dark===null&&C.t-X.live>6.5){X.dark=C.t;C.darkTo=.72;mark('the store lights going');const F=D.videoFix||{};
   lights.kill(shopIdx('video'),lights.S.t+.1);lights.kill(LV.neon+NEON.videoOpen,lights.S.t+.1);lights.kill(LV.neon+NEON.videoSign,lights.S.t+.2);
   /* (the tubes go from the one over you outward; that one stutters a long time first) */const fx=['front','middle','rear'].map(n=>F[n]).filter(i=>i!==undefined).map(i=>{const q=lights.posOf(i),w=q?at(q.u,q.v):p;return {i,d:Math.hypot(w.x-p.x,w.z-p.z)};}).sort((a,b)=>a.d-b.d);
   fx.forEach((f,n)=>lights.kill(f.i,lights.S.t+[.3,2.6,3.9][n],n===0?{flick:.98,dur:1.9}:{flick:.8,dur:.5}));X.firstTube=fx[0]?.i??null;
   later(4,()=>{objective('Get out the back.','Through the back room.');say([{who:'JAMIE',text:'“The back. There’s a back door.”',by:'jamie'}]);stand(jamie,{u:103.2,v:-33},{look:at(103.75,-35,TY+1.2),max:3.2});stand(sam,{u:105.6,v:-32.6},{look:()=>camera.position,max:3.2});});}
  if(X.dark!==null&&DOORS['video-back'].open<.5){const e=C.t-X.dark;if(e>26&&!C.flags.s1){C.flags.s1=true;say([{who:'JAMIE',text:'“Come ON.”',by:'jamie'}]);}
   if(e>44&&!C.flags.s2){C.flags.s2=true;openBack('jamie');}}
  if(DOORS['video-back'].open>.5&&!inS&&UV(p).v<-34.6)outBack();
  if(X.dark!==null&&C.t-X.dark>80&&!C.flags.out&&C.fadeOut<0){C.fadeOut=0;C.after=()=>{openBack('jamie');youFoot(103.75,-36.6,HWst);outBack();C.fadeIn=0;};}}
 function answerPhone(by='you'){const X=C.store;if(!X||X.answered)return;X.answered=by;X.ring=false;mark('the phone, answered by '+by);const q=at(SPOT.videoPhone.u,SPOT.videoPhone.v,TY+1.1);
  if(by==='you'){const st=at(SPOT.videoPhone.u+1.15,SPOT.videoPhone.v+.1);pose(st,{y:TY+.18+1.45,pitch:-.08,yaw:headingTo(st.x,st.z,q.x,q.z)});}
  else{stand(sam,{u:SPOT.videoPhone.u+1.05,v:SPOT.videoPhone.v+.3},{look:q,max:3});}
  const who=by==='you'?'ON THE PHONE':'ON THE PHONE (SAM HOLDS IT OUT)';
  talk([{wait:.6},{who:'',text:by==='you'?'[Static. Something like wind.]':'[Sam picks it up. Static, something like wind.]',time:2.8,gap:.8},{who,text:'“…Jamie?”',time:2,gap:1.4},{who,text:'“Jamie?”',time:1.6,gap:.4},
   {act:()=>sound('click',q,{gain:.6}),wait:.3},{who:'',text:'[The line goes dead.]',time:2.2},{who:'JAMIE',text:'“Alex? ALEX!”',from:jamie,time:1.6}],{then:()=>{X.callDone=true;if(by==='you')unpose();else stand(sam,{u:102.6,v:-13.5},{look:()=>tvPos()});}});}
 function openBack(by){if(DOORS['video-back'].open>.5)return;DOORS['video-back'].open=1;sound('door',at(103.75,-35,TY+1),{gain:.9});mark('the back door, opened by '+by);}
 // ---- out the back: the dark comes after them, whichever way they go ------------------------------------------------------------------
 // Behind the shops there is more than one way to the Lyric: through the laundromat; on along the narrow way between the
 // garages to Depot Street; up the passage (or the gangway) between the shops to Main; or along the creek behind the
 // garages. Every way comes out at the corner of Main and Depot, under the theater. The dark comes after them along the way
 // they actually went: a point that follows their trail, the lights near it dying as it reaches them. Stand still and it
 // closes; keep moving and it falls back, but never more than a street behind; it never catches them, and nobody dies of
 // it. Jamie runs ahead to each turning they are heading for and calls them on; Sam keeps looking back.
 const JUNC=[{id:'narrow',u:150.6,v:-38.9,line:'“This way. Through here.”'},{id:'passage',u:143.2,v:-33.6,line:'“Up here. It comes out on Main.”'},
  {id:'laundry',u:163.75,v:-36,line:'“The laundromat. In here!”'},{id:'depot',u:175.8,v:-38.9,line:'“Depot Street. Up to Main.”'},{id:'corner',u:178.6,v:-13.4,line:'“The Lyric. It’s still lit.”'}];
 const ROOF={u0:148.3,u1:173.7,v0:-45.7,v1:-41.3,y:2.91};
 const roofH=(u,v)=>{const e=Math.min(u-ROOF.u0,ROOF.u1-u,v-ROOF.v0,ROOF.v1-v);return e<=0?0:ROOF.y*smooth(e/.9);};
 function escInit(){const p=me();C.esc={t:0,pass:null,passAt:null,route:null,routes:[],seen:{},lead:null,led:new Set(),vel:{x:0,z:0},last:{x:p.x,z:p.z},still:0,samT:3,said:{},nudges:0,
   P:{x:p.x,z:p.z,i:0,trail:[{x:p.x,z:p.z}],gap:0,gapMin:99,gapMax:0,wait:3.2,min:2.6,r:9,out:0,closeT:0,closeAt:-99,
    L:WEST.map(i=>{const q=lights.posOf(i);if(!q||!(q.u>98))return null;const w=at(q.u,q.v);return {i,x:w.x,z:w.z};}).filter(Boolean)}};}
 function outBack(){if(C.flags.out)return;C.flags.out=true;if(C.view)closeView();go('n4-alley');checkpoint('c4-escape');C.hMin=Math.max(C.hMin||0,HOUR.back);C.darkTo=.7;escInit();
  lights.kill(VIDEO_LAMP[0],lights.S.t+.5);/* (the light over the door, as you come out under it) */cascade(fixIdx(D.videoFix).filter(i=>lights.hold[i]>0),{from:{u:100,v:-36},speed:10,delay:.2,quiet:true});
  objective('Get away from the dark.','The laundromat’s open till ten. Or out to Main, to the Lyric.');for(const c of [jamie,sam])stand(c,null);follow(true);C.flags.hurry=true;
  say([{who:'JAMIE',text:'“The laundromat. It’s open till ten.”',by:'jamie'},{who:'SAM',text:'“Go. Go.”',by:'sam',time:1.2}]);}
 // (for the jumps: the dark already some way down the alley behind them, everything it passed already out)
 function darkBehind(u0,gap=9){const X=C.esc,p=me(),P=X.P;outNow(P.L.filter(L=>{const q=TL(L.x,L.z);return q.v<-11.5&&q.u<u0;}).map(L=>L.i));
  const {u,v}=UV(p),b=at(u-gap,v);P.x=b.x;P.z=b.z;P.trail=[{x:b.x,z:b.z},{x:p.x,z:p.z}];P.i=1;P.wait=0;X.seen.alley=true;}
 // the dark: along their trail, at a walking pace that grows; held back while the creature is there; never closer than
 // P.min, never farther than about a street (it hurries to close the distance)
 function darkStep(dt){const X=C.esc,P=X.P,p=me();if(!X||C.fadeOut>=0)return;
  const tl=P.trail[P.trail.length-1];if(Math.hypot(tl.x-p.x,tl.z-p.z)>.8){P.trail.push({x:p.x,z:p.z});if(P.trail.length>700){P.trail.shift();P.i=Math.max(0,P.i-1);}}
  let gap=Math.hypot(P.x-p.x,P.z-p.z);const passOn=X.pass&&X.pass.stage!=='gone'&&X.pass.stage!=='bolt';
  if(P.wait>0)P.wait-=dt;else{let v=(passOn?.4:1.9+.5*smooth(X.t/120))*(gap>22?2.6:gap>16?1.4:1);if(inside('laundry',p))v*=.85;let step=v*dt;
   while(step>0&&P.i<P.trail.length){const t=P.trail[P.i];if(Math.hypot(t.x-p.x,t.z-p.z)<P.min)break;const dx=t.x-P.x,dz=t.z-P.z,l=Math.hypot(dx,dz);
    if(l<=step){P.x=t.x;P.z=t.z;P.i++;step-=l;}else{P.x+=dx/l*step;P.z+=dz/l*step;step=0;}}}
  gap=Math.hypot(P.x-p.x,P.z-p.z);P.gap=gap;if(X.t>4){P.gapMin=Math.min(P.gapMin,gap);P.gapMax=Math.max(P.gapMax,gap);}
  for(const L of P.L){if(lights.hold[L.i]<=0)continue;if(Math.hypot(L.x-P.x,L.z-P.z)<P.r){lights.kill(L.i,lights.S.t,{flick:.7,dur:.45});P.out++;}}
  // right behind them: the light over them goes, one at a time
  if(gap<5&&P.wait<=0){P.closeT+=dt;if(P.closeT>1.2&&C.t-P.closeAt>5){let b=null,bd=9;for(const L of P.L){if(lights.hold[L.i]<=0)continue;const d=Math.hypot(L.x-p.x,L.z-p.z);if(d<bd){bd=d;b=L;}}
    if(b){lights.kill(b.i,lights.S.t,{flick:.85,dur:.3});P.closeAt=C.t;}}}else P.closeT=0;
  C.darkTo=.62+.22*smooth((16-gap)/12);}
 const darkPos=()=>new THREE.Vector3(C.esc.P.x,TY+1.3,C.esc.P.z);
 function updateEscape(dt){const X=C.esc;if(!X)return;X.t+=dt;const p=me(),{u,v}=UV(p),P=X.P;
  const vx=(p.x-X.last.x)/Math.max(dt,1e-3),vz=(p.z-X.last.z)/Math.max(dt,1e-3);X.last={x:p.x,z:p.z};X.vel={x:damp(X.vel.x,vx,4,dt),z:damp(X.vel.z,vz,4,dt)};const spd=Math.hypot(X.vel.x,X.vel.z);
  X.still=spd<.35?X.still+dt:0;darkStep(dt);
  // which way they went (a log, for the tests and the report)
  const reg=inside('laundry',p)?'laundromat':v>-11.5?'main':u>141.4&&u<145&&v>-34.6?'passage':u>126.2&&u<127.8&&v>-34.6?'gangway':v<-46?'creek':u>148&&v<-37.2&&v>-40.8&&u<173?'narrow':u>173?'depot':'alley';
  if(X.routes[X.routes.length-1]!==reg){X.routes.push(reg);if(!X.route&&reg!=='alley')X.route=reg;X.seen[reg]=true;mark('the way: '+reg);}
  // Jamie ahead, Sam looking back
  leadOn();samBack(dt);pressureLines();
  // the creature, if it comes, comes at them from ahead (once)
  if(!X.pass){const ahead=TL(p.x+X.vel.x,p.z+X.vel.z).u-u;/* (+: on toward the Lyric) */
   if(reg==='narrow'&&u>148.6&&u<154&&!X.seen.depot)creaturePass('narrow');
   else if(reg==='creek'&&u>146&&u<162&&ahead>-.2)creaturePass('creek');
   else if(reg==='main'&&u>146&&u<160&&v<6&&ahead>-.2)creaturePass('main');}
  // onward, whichever way: the laundromat; Depot Street; Main, toward the Lyric
  if(inside('laundry',p,-.2)&&!C.flags.laundry)enterLaundry();
  if(!C.flags.depot&&((u>171.8&&v<-12&&!inside('laundry',p))||(v>-11.5&&u>150)))depot(v>-11.5?'main':'depot');
  if(S.phase==='n4-depot'&&u<190&&u>168&&v>-12.6&&!(X.pass&&X.pass.stage!=='gone'))marquee();/* (at the corner, where the sidewalk under the marquee can be seen down; once it has gone) */
  // nobody waits forever: standing still a long time with it right there, the boys pull you on
  if(X.still>40&&P.gap<4.5&&!X.pass?.stage?.match?.(/come|stop|look|afraid|bolt/))nudge();}
 function nudge(){const X=C.esc,p=me(),{u,v}=UV(p);X.nudges++;X.still=0;
  if(v>-11.5)carry('main',clamp(u+12,150,176),-6.4,HWst);
  else if(inside('laundry',p))carry('laundromat',173.2,-26.75,HWst,{jq:{u:173.4,v:-25.2},sq:{u:174.2,v:-28.2}});
  else if(u>172.5)carry('depot',178.6,-8.4,HWst,{jq:{u:179.8,v:-7},sq:{u:179.6,v:-10.2}});
  else if(v<-44)carry('creek',clamp(u+14,150,178),-50.5,HWst);
  else if(u>146)carry('narrow',clamp(u+12,152,176),-38.9,HWst);
  else carry('alley',149.4,-38.1,HWst,{jq:{u:147.8,v:-37.7},sq:{u:146.6,v:-39.2}});}
 // Jamie: to the turning you are heading for, ahead of you, pointing the way; let go when you get there (or go elsewhere)
 function leadOn(){const X=C.esc,p=me(),vel=X.vel,s=Math.hypot(vel.x,vel.z);if(jamie.mode!=='foot')return;
  const passOn=X.pass&&X.pass.stage!=='gone';const cur=X.lead&&JUNC.find(j=>j.id===X.lead);
  if(cur){const w=at(cur.u,cur.v),d=Math.hypot(w.x-p.x,w.z-p.z);if(d<3.4||d>15||passOn){X.lead=null;X.led.add(cur.id);if(!passOn)stand(jamie,null);}return;}
  if(passOn||s<.8)return;
  for(const j of JUNC){if(X.led.has(j.id))continue;const w=at(j.u,j.v),dx=w.x-p.x,dz=w.z-p.z,d=Math.hypot(dx,dz);if(d<5||d>13)continue;
   if((dx*vel.x+dz*vel.z)/(d*s)<.78)continue;/* (only a turning you are already heading for) */
   X.lead=j.id;stand(jamie,{u:j.u,v:j.v},{look:()=>camera.position,max:3.8,gesture:GEST.point(1)});if(!busy())say([{who:'JAMIE',text:j.line,by:'jamie',time:1.5}]);break;}}
 // Sam: looks back at it, more often the closer it is
 function samBack(dt){const X=C.esc;X.samT-=dt;if(X.samT>0||sam.mode!=='foot'||(X.pass&&X.pass.stage!=='gone'))return;glance(sam,darkPos(),1.1);X.samT=X.P.gap<7?1.8:3.6+((X.t*.37)%1)*2.4;}
 function pressureLines(){const X=C.esc,P=X.P,once=(k,lines)=>{if(X.said[k]||busy())return;X.said[k]=C.t;say(lines);};if(X.pass&&X.pass.stage!=='gone'||P.wait>0)return;
  if(P.gap<8&&X.t>6)once('behind',[{who:'SAM',text:'“It’s still behind us.”',by:'sam',time:1.5}]);
  if(P.gap<4.6&&X.t>6)once('close',[{who:'JAMIE',text:'“Don’t stop. Don’t stop!”',by:'jamie',time:1.4}]);
  if(P.closeT>3)once('run',[{who:'SAM',text:'“Run!”',by:'sam',time:1}]);
  if(X.still>18)once('still1',[{who:'JAMIE',text:'“Come ON!”',by:'jamie',time:1.2}]);if(X.still>30)once('still2',[{who:'SAM',text:'“Please.”',by:'sam',time:1.2}]);
  const p=me(),toDark=(P.x-p.x)*X.vel.x+(P.z-p.z)*X.vel.z;if(toDark>0&&P.gap<6&&Math.hypot(X.vel.x,X.vel.z)>.9)once('notThat',[{who:'SAM',text:'“Not that way!”',by:'sam',time:1.2}]);}
 // The creature, ahead of them, coming: it stops. Behind them a light goes out. It looks past them at whatever is there
 // and is afraid of it; the light at its own end goes too; and with nowhere else to go it bolts past them, close, and away
 // through the nearest way out on their side. It never touches them; in the narrow way, if there is no room, it goes
 // over the garage roofs. It never looks at them again.
 const PASS={
  narrow:{from:{u:176.6,v:-38.9},axis:-1,cv:-38.9,lane:p=>p>-38.9?-40.25:-37.6,wall:l=>l<-39?-37.55:-40.45,far:[{u:170.4,v:-37.12},{u:184.2,v:-40}],
   exit:(R,pu)=>R.roof?[[Math.min(R.u,pu+5)-1.4,-42.4],[pu-1,-43.6],[149.4,-43.6],[146.4,-40],[143.2,-35.6],[143.2,-26],[143.2,-16]]:[[pu-3.4,R.lane],[146.8,R.lane>-39?-37.7:-39.7],[143.2,-35.4],[143.2,-26],[143.2,-16]],gone:q=>q.v>-22},
  creek:{from:{u:184,v:-51.4},axis:-1,cv:-51.4,lane:p=>clamp(p>-51.4?p-4.2:p+4.2,-56.4,-46.8),wall:null,far:[{u:176,v:-43.5}],
   exit:(R,pu)=>[[pu-2.6,R.lane],[pu-7.5,-55.6],[pu-9.4,-57.4],[pu-10,-61]],gone:q=>q.v<-58.6,dive:true},
  main:{from:{u:183,v:-3.2},axis:-1,cv:-3.2,lane:p=>clamp(p>-3.2?p-4.4:p+4.4,-10.2,6.2),wall:null,far:[{u:168,v:7.7},{u:160,v:-7.7}],
   exit:(R,pu)=>[[pu-2.8,R.lane],[pu-7,7.5],[pu-9,15],[pu-10,27]],gone:q=>q.v>23}};
 function creaturePass(kind){const X=C.esc;if(X.pass)return;const K=PASS[kind],p=me(),{u:pu,v:pv}=UV(p);
  X.pass={kind,stage:'come',t:0,u:Math.max(K.from.u,pu+18),v:K.cv,a:HE,y:null,vy:0,dive:0,lane:null,roof:false,passedAt:null,seenT:0,fs:0,path:null,pi:0,k:{},stageAt:{come:C.t},minD:99};X.passAt=C.t;
  const R=X.pass;creature.ground=(x,z)=>{if(R.vy>0)return R.y;const q=TL(x,z);return townY(q.u,q.v)+(R.roof?roofH(q.u,q.v):0)-R.dive;};creature.show(true);placePass(0);
  mark('something ahead of them: '+kind);T?.jolt?.(.9,{hold:8,why:'something ahead of them'});
  for(const c of [jamie,sam]){if(X.lead)X.lead=null;stand(c,()=>{const q=UV(me()),w=K.wall?K.wall(R.lane??K.lane(q.v)):q.v+(c===jamie?.9:-.9);return at(clamp(q.u+(c===jamie?-.9:-1.8),q.u-3,q.u),w);},{look:()=>crHead,max:3.4,gesture:K.wall?GEST.press(1):GEST.tense(1)});}
  say(kind==='narrow'?[{who:'SAM',text:'“Something’s— in front of us.”',by:'sam',time:1.4},{who:'JAMIE',text:'“The wall! Get against the wall!”',by:'jamie',time:1.6}]:[{who:'SAM',text:'“Stop.”',by:'sam',time:1},{who:'JAMIE',text:'“Don’t move. Don’t move.”',by:'jamie',time:1.6}],{interrupt:true});
  sound('step',at(R.u,R.v,TY+.3),{gain:.7});}
 function passStage(s){const R=C.esc.pass;R.stage=s;R.t=0;R.stageAt[s]=C.t;mark('it: '+s);}
 function placePass(dt){const R=C.esc.pass,q=at(R.u,R.v),tgt=townY(R.u,R.v)+(R.roof?roofH(R.u,R.v):0)-R.dive;
  if(R.y==null||dt<=0){R.y=tgt;R.vy=0;}else if(tgt<R.y-.05){R.vy+=9.8*dt;R.y=Math.max(tgt,R.y-R.vy*dt);}/* (it falls) */else{R.vy=0;R.y=tgt>R.y?Math.min(tgt,R.y+7*dt):tgt;}/* (it leaps up, it does not appear up there) */
  creature.place(q.x,R.y,q.z,R.a);}
 function updatePass(dt){const X=C.esc,R=X.pass,K=PASS[R.kind],D2=creature.drive;R.t+=dt;const p=me(),{u:pu,v:pv}=UV(p),cw=at(R.u,R.v),dYou=Math.hypot(p.x-cw.x,p.z-cw.z);R.minD=Math.min(R.minD,dYou);
  let sp=0,look=camera.position;D2.snap=0;D2.back=0;
  const to=(u,v,s2)=>{const du=u-R.u,dv=v-R.v,l=Math.hypot(du,dv);if(l<.06)return true;const st=Math.min(l,s2*dt);R.u+=du/l*st;R.v+=dv/l*st;return l<.5;};
  const face=(u,v,kk=6)=>{const w=at(u,v);R.a+=wrap(headingTo(cw.x,cw.z,w.x,w.z)-R.a)*(1-Math.exp(-kk*dt));},dmp=(k2,t2,r)=>{D2[k2]=damp(D2[k2]||0,t2,r,dt);};
  const killNear=(name,list,o)=>{if(R.k[name])return;R.k[name]=C.t;for(const f of list){let b=null,bd=3;for(const L of X.P.L){const q=TL(L.x,L.z),d=Math.hypot(q.u-f.u,q.v-f.v);if(d<bd){bd=d;b=L;}}if(b&&lights.hold[b.i]>0)lights.kill(b.i,lights.S.t+(o.delay||0),o);}};
  if(R.stage==='come'){/* low, quick, straight at them up the middle */sp=2.7;dmp('crouch',.45,3);dmp('alert',0,3);to(R.u+K.axis*5,K.cv,sp);face(R.u+K.axis*5,K.cv,5);
   if(k.camLooksAt(crHead,.97))R.seenT+=dt;if(Math.abs(R.u-pu)<11.5||dYou<10||R.t>14)passStage('stop');}
  else if(R.stage==='stop'){/* it stops; behind them, a light goes out */dmp('crouch',.55,4);
   if(R.t>.45&&!R.k.behind){R.k.behind=C.t;const P=X.P;let b=null,bd=1e9;/* (the nearest one behind them, not right over them; one this side of the dark first) */
    for(const L of P.L){if(lights.hold[L.i]<=0)continue;const q=TL(L.x,L.z);const back=(q.u-pu)*K.axis;/* (+: behind them) */if(back<3)continue;const d=Math.hypot(L.x-p.x,L.z-p.z);if(d<4||d>34)continue;const sc=d+(d>P.gap+2?40:0);if(sc<bd){bd=sc;b=L;}}
    if(b){lights.kill(b.i,lights.S.t,{flick:.9,dur:.6});R.behindLight=b;say([{who:'',text:'[Behind them, a light goes out.]',time:2.2}],{interrupt:true});
     /* (and the dark is there now, where it went: only ever nearer) */const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<P.gap){P.x=b.x;P.z=b.z;let bi=P.i,bdd=1e9;for(let i=P.i;i<P.trail.length;i++){const e=Math.hypot(P.trail[i].x-b.x,P.trail[i].z-b.z);if(e<bdd){bdd=e;bi=i;}}P.i=bi;}}}
   if(R.t>1.1)passStage('look');}
  else if(R.stage==='look'){/* past them: at the dark behind them */look=R.behindLight?new THREE.Vector3(R.behindLight.x,TY+2.4,R.behindLight.z):darkPos();D2.snap=R.t<.3?1:0;dmp('alert',1,5);dmp('crouch',.1,4);
   if(R.t<dt*1.5){say([{who:'JAMIE',text:'“It’s not looking at us.”',by:'jamie',time:1.5}]);glance(sam,look.clone(),2.2);}if(R.t>1.9)passStage('afraid');}
  else if(R.stage==='afraid'){/* it shrinks from it and backs away the way it came; then its own end goes dark */look=R.t<.9?(R.behindLight?new THREE.Vector3(R.behindLight.x,TY+2.4,R.behindLight.z):darkPos()):at((K.far[0]||K.from).u,(K.far[0]||K.from).v,TY+2);
   D2.back=1;dmp('alert',0,3);dmp('cower',.75,5);sp=.8;to(R.u-K.axis*1.2,R.v,.8);face(R.u+K.axis*5,R.v,4);
   if(R.t>.8){killNear('far',K.far,{flick:.85,dur:.4});if(R.t<.8+dt*1.5){D2.snap=1;if(R.kind==='narrow')say([{who:'SAM',text:'“The other end—”',by:'sam',time:1.2}]);}}
   if(R.t>1.7||dYou<5.5){R.lane=K.lane(pv);if(R.kind==='narrow'){const near=[p,{x:jamie.px,z:jamie.pz},{x:sam.px,z:sam.pz}].some(c=>{const q=TL(c.x,c.z);return Math.abs(q.v-R.lane)<1.25&&q.u>146&&q.u<176;});R.roof=near;}
    R.path=K.exit(R,pu);R.pi=0;passStage('bolt');}}
  else if(R.stage==='bolt'){/* past them, flat out, and away */dmp('cower',0,6);R.fs=Math.min(8.6,R.fs+16*dt);sp=R.fs;look=null;
   const w=R.path[R.pi];if(w){face(w[0],w[1],11);if(to(w[0],w[1],sp))R.pi++;}
   if(R.passedAt===null&&(R.u-pu)*K.axis>1.5){R.passedAt=C.t;mark('it went past them');}
   if(K.dive&&R.v<-56.2)R.dive=Math.min(2.4,R.dive+dt*5.5);
   if(K.gone(R)||!w||R.t>7){passStage('gone');creature.show(false);creature.ground=null;for(const c of [jamie,sam])stand(c,null);follow(true);if(K.dive)sound('splash',at(R.u,-58.6,TY-2),{gain:.8});
    if(/^n4-(alley|laundry|depot)$/.test(S.phase))say([{wait:.6},{who:'JAMIE',text:'“It went right past us.”',by:'jamie'},{who:'SAM',text:'“It didn’t even look at us.”',by:'sam'},{who:'JAMIE',text:'“Keep going.”',by:'jamie',time:1.2}]);return;}}
  if(R.stage!=='bolt'||!R.roof){for(const c of [p,{x:jamie.px,z:jamie.pz},{x:sam.px,z:sam.pz}]){const w=at(R.u,R.v),dx=w.x-c.x,dz=w.z-c.z,l=Math.hypot(dx,dz);if(l<1.6&&l>1e-3){const q2=TL(w.x+dx/l*(1.6-l),w.z+dz/l*(1.6-l));R.u=q2.u;R.v=q2.v;}}}
  D2.speed=sp;D2.look=look;placePass(dt);creature.update(dt);creature.headPos?.(crHead);if(R.stage==='bolt'&&k.camLooksAt(crHead,.96))R.seenT+=dt;}
 function enterLaundry(){if(C.flags.laundry)return;C.flags.laundry=true;go('n4-laundry');objective('Out the side door.','Onto Depot Street.');C.lt={t:0};
  tvShow('laundry','live-behind');later(3.2,()=>tvShow('laundry',null));
  const F=D.laundryFix||{};if(F.back!==undefined)lights.kill(F.back,lights.S.t+3);if(F.middle!==undefined)lights.kill(F.middle,lights.S.t+7);if(F.front!==undefined)lights.kill(F.front,lights.S.t+11.5);
  say([{who:'SAM',text:'“Hello?”',by:'sam',time:1.2},{wait:1},{who:'JAMIE',text:'“Side door. There.”',by:'jamie',time:1.6}]);}
 function updateLaundry(dt){updateEscape(dt);C.lt.t+=dt;
  if(C.lt.t>30&&!C.flags.l1&&!busy()){C.flags.l1=true;say([{who:'JAMIE',text:'“The side door. Come on.”',by:'jamie'}]);}}
 // ---- Depot Street (or Main): the theater's upper windows ------------------------------------------------------------------------
 function depot(way='depot'){if(C.flags.depot)return;C.flags.depot=true;go('n4-depot');checkpoint('c4-theater');C.hMin=Math.max(C.hMin||0,HOUR.theater);
  if(C.flags.laundry){outNow([...LAUNDRY_LAMP]);cascade(LAUNDRY,{from:{u:171,v:-27},speed:12,delay:.4,quiet:true});}
  outNow(lampsWhere(L=>LAMPS[L.id]?.cross===180||(L.kind==='pole'&&Math.abs(L.u-176)<1)));
  objective('Keep going.',way==='main'?'Along Main, to the Lyric.':'Up Depot Street, to Main.');C.dp={t:0,first:null,way};
  {const door=at(way==='main'?176:171.4,way==='main'?-8:-26.75,TY+1.5),dv=new THREE.Vector3(door.x,door.y,door.z),order=[...SIL].sort((a,b)=>a.pos.distanceToSquared(dv)-b.pos.distanceToSquared(dv));order.forEach((s,i)=>{s.state='wait';s.t=-(.9+i*2.4);s.seenT=0;});}
  if(!C.esc?.pass||C.esc.pass.stage==='gone'){for(const c of [jamie,sam])stand(c,null);follow(true);}}
 function updateDepot(dt){if(C.esc)updateEscape(dt);else{const p=me(),{u,v}=UV(p);if(u<190&&u>168&&v>-12.6)marquee();}C.dp.t+=dt;
  if(C.dp.t>45&&!C.flags.dp1&&!busy()){C.flags.dp1=true;say([{who:'SAM',text:'“Up to Main. Please.”',by:'sam'}]);}
  if(C.dp.t>110&&S.phase==='n4-depot'&&C.dp.way!=='main')carry('depot',178.6,-8.4,HWst,{jq:{u:179.8,v:-7},sq:{u:179.6,v:-10.2}});
  if(C.dp.t>110&&S.phase==='n4-depot'&&C.dp.way==='main'){const {u}=UV(me());carry('main',Math.max(u,172),-6.4,HWst,{jq:{u:Math.max(u,172)+1.2,v:-5.2},sq:{u:Math.max(u,172)+1,v:-7.8}});}}
 function updateSil(dt){if(!SIL.length)return;const ph=S.phase,live=ph==='n4-depot';
  for(const s of SIL){if(!live){if(s.q.visible)s.q.visible=false;continue;}s.t+=dt;
   if(s.state==='wait'&&s.t>0&&camera.position.distanceTo(s.pos)<34&&lights.level(LV.neon+NEON.lyricUpper)>.05){s.state='on';s.t=0;s.q.visible=true;mark('someone in an upper window');
    if(C.dp&&C.dp.first===null){C.dp.first=C.t;say([{who:'SAM',text:'“Jamie. The windows.”',by:'sam',time:1.6},{who:'JAMIE',text:'“Don’t look at them. Keep walking.”',by:'jamie'}]);}}
   else if(s.state==='on'){if(k.camLooksAt(s.pos,.993))s.seenT+=dt;if(s.seenT>.8||s.t>14){s.state='gone';s.q.visible=false;mark('the window is empty');}}}}
 // ---- the marquee ----------------------------------------------------------------------------------------------------------------------
 // Under the marquee, in its light, the one who looks like Alex. When they reach the corner everything stops: no wind,
 // no insects, nothing going out, nobody in the windows; he does not sway or breathe. He says what Alex said, word for
 // word, the last evening on the hill, and Jamie answers the way he answered then before he can stop himself; then
 // what Sam said tonight, on Second Street, where he was not. Then the goodbye at the corner of Briarwood, and the
 // lights go. It is said as they come nearer (each line waits for a step closer, or a while): nothing holds them, nothing
 // turns their head; come at him and he is gone before he finishes.
 const MQ=[{d:99,t:1.2,lines:[{who:'JAMIE',text:'“…Alex?”',from:jamie,time:1.4,gap:.9},{who:'SAM',text:'“Jamie. Don’t.”',from:sam,time:1.4}],act:()=>{stand(jamie,{u:181.6,v:-7.6},{look:()=>axHead,max:1.4});stand(sam,{u:180.6,v:-9.2},{look:()=>axHead,max:1.6,gesture:GEST.grab(1)});}},
  {d:19,t:5,lines:[{who:'ALEX',text:'“Did you guys hear that?”',from:AX,time:2,gap:1.6},{who:'JAMIE',text:'“…Hear what?”',from:jamie,time:1.4,gap:1.4},{who:'ALEX',text:'“Never mind.”',from:AX,time:1.6,gap:1.2}]},
  {d:0,t:1.6,lines:[{who:'SAM',text:'“That’s what he said. On the hill. That’s exactly—”',from:sam,time:2.4}]},
  {d:13,t:6,lines:[{who:'ALEX',text:'“Don’t run. Don’t run.”',from:AX,time:1.9,gap:1.8},{who:'SAM',text:'“…That’s what I said.”',from:sam,time:1.8}]},
  {d:9.5,t:6,lines:[{who:'ALEX',text:'“Alright, I’m this way.”',from:AX,time:1.8,gap:1.2},{who:'ALEX',text:'“See you tomorrow.”',from:AX,time:1.8,gap:1.1}],act:()=>{AX.turn=-.9;},end:true}];
 function marquee(){if(C.flags.mq)return;C.flags.mq=true;go('n4-marquee');C.hMin=Math.max(C.hMin||0,HOUR.marquee);C.darkTo=.88;
  outNow(D.lamps.map(L=>LV.lamp+L.id).filter(i=>!KEEP.has(i)));/* (whatever was still on along Main) */for(const s2 of SIL){s2.q.visible=false;if(s2.state!=='gone')s2.state='off';}
  C.mq={t:0,out:null,back:null,rush:false,still:true,step:0,stepAt:C.t,doneAt:null,lines:[]};placeAX(195.6,-9.6,HE);/* (under the near end of the marquee, in its light) */AX.state='stand';AX.t=0;AX.still=true;AX.turn=0;S.lookTarget=axHead;
  for(const kk in C.amb)C.amb[kk]=0;/* (all at once: that is what is wrong with it) */
  for(const [c,q] of [[jamie,{u:179.8,v:-7.0}],[sam,{u:179.6,v:-10.2}]])stand(c,q,{look:()=>axHead,max:2.4});
  say([{who:'',text:'[It goes quiet. No wind. Nothing.]',time:2.4}],{interrupt:true});mark('Alex under the marquee');}
 function updateMarquee(dt){const X=C.mq;if(!X)return;X.t+=dt;const p=me(),d=Math.hypot(p.x-AX.x,p.z-AX.z);if(X.out!==null)return;
  if(X.step>=1&&!X.rush&&d<6.5&&AX.person.group.visible){X.rush=true;mark('too close');talk([{who:'ALEX',text:'“See you—”',from:AX,time:.7}],{interrupt:true,then:blackout});return;}
  if(X.rush||busy())return;if(X.doneAt===null&&X.step>=MQ.length){X.doneAt=C.t;}if(X.doneAt!==null){if(C.t-X.doneAt>1.1)blackout();return;}
  const st=MQ[X.step];if(d<st.d||C.t-X.stepAt>st.t){X.step++;X.stepAt=C.t;st.act?.();for(const l of st.lines)X.lines.push(l.who+': '+l.text);talk(st.lines,{then:()=>{C.mq.stepAt=C.t;}});mark('under the marquee: '+X.step);}}
 function blackout(){const X=C.mq;if(!X||X.out!==null)return;X.out=C.t;const t=lights.S.t;mark('the marquee goes out');
  lights.kill(LV.neon+NEON.bulbs,t+.05,{flick:.9});lights.kill(LV.neon+NEON.marquee,t+.55,{flick:.8});lights.kill(LV.neon+NEON.blade,t+.8);lights.kill(LV.neon+NEON.lyricUpper,t+.9,{quiet:true});if(shopIdx('lyric')>=0)lights.kill(shopIdx('lyric'),t+.9,{quiet:true});
  C.mq.still=false;later(1.05,()=>{AX.person.group.visible=false;AX.state='gone';AX.still=false;C.darkTo=1;C.dark=Math.max(C.dark,.97);S.lookTarget=null;T?.jolt?.(1,{hold:6,why:'dark'});});later(3.7,powerBack);}
 function powerBack(){if(C.mq.back!==null)return;C.mq.back=C.t;go('n4-return');C.darkTo=0;mark('the power comes back');
  const all=[];for(let i=0;i<lights.hold.length;i++)if(lights.hold[i]<.5)all.push(i);lights.wave(all,{from:{u:200,v:-9},speed:28});sound('relay',at(200,-9.4,TY+5),{gain:1});
  DOORS['video-front'].open=1;if(Math.hypot(...(()=>{const r=o.roam,q=at(STORE[0].u,STORE[0].v);return [r.x-q.x,r.z-q.z];})())>22)bikesTo('store');
  for(const c of [jamie,sam])stand(c,null);follow(true);T?.ease?.(.5,{fall:.03,hold:4,why:'the lights again'});
  later(2.4,()=>say([{who:'JAMIE',text:'“He’s gone.”',by:'jamie',time:1.4},{who:'SAM',text:'“The bikes. Let’s just get the bikes.”',by:'sam'}],{then:()=>objective('Get the bikes.','In front of the video store.')}));}
 // ---- the bikes, the picture, home ---------------------------------------------------------------------------------------------------
 function updateReturn(dt){const p=me(),r=o.roam;if(dist(p,{x:r.x,z:r.z})<4.2&&C.mq?.back!==null&&C.t-C.mq.back>2)finalClue();
  if(C.mq?.back!=null&&C.t-C.mq.back>140){const {u,v}=TL(r.x,r.z);carry('return',u+1.4,v-1.2,HE);}}
 function finalClue(){if(C.flags.clue)return;C.flags.clue=true;go('n4-clue');checkpoint('c4-final-clue');ensureLead();objective('');stand(jamie,camBeside(1));stand(sam,camBeside(-1));
  say([{who:'JAMIE',text:'“The picture. Did it come out?”',by:'jamie'}],{then:()=>{openCamera(Math.max(0,leadIndex()));C.flags.leadOpen=true;
   say([{wait:1.4},{who:'SAM',text:'“Pine Ridge Recreation Area.”',by:'sam'},{who:'JAMIE',text:'“That’s the reservoir. Out past the county road.”',by:'jamie'},{who:'SAM',text:'“That’s where they looked for Danny Whitcomb. In the paper.”',by:'sam',time:2.8},
    {wait:1.2},{who:'JAMIE',text:'“Tomorrow.”',by:'jamie',time:1.4,gap:1},{who:'SAM',text:'“…Tomorrow.”',by:'sam',time:1.4}],
    {then:()=>{go('n4-ride');objective('Go home.','The old oak, at the end of Oak Hollow.');for(const c of [jamie,sam])stand(c,null);follow(true);homeNight();C.flags.hurry=false;}});}});}
 function updateRideHome(dt){const p=me(),L=where(p);
  if(L.street==='town'&&L.w.zone==='conn'&&!C.flags.h1&&!busy()){C.flags.h1=true;say([{who:'SAM',text:'“Don’t look back.”',by:'sam'}]);}
  if(L.street==='side2'&&!C.flags.h2&&!busy()){C.flags.h2=true;say([{who:'JAMIE',text:'“My mom’s going to call your mom.”',by:'jamie'},{who:'SAM',text:'“I don’t care. I really don’t.”',by:'sam'}]);}
  if(L.street==='main'&&L.d<860&&!C.flags.h3&&!busy()){C.flags.h3=true;say([{who:'JAMIE',text:'“The oak. Just for a minute.”',by:'jamie'}]);}
  if(L.street==='main'&&L.d>1126)atOak();}
 function atOak(){if(C.flags.oak)return;C.flags.oak=true;go('n4-oak');checkpoint('chapter4-end');C.hMin=Math.max(C.hMin||0,HOUR.oak);C.oak={t:0,started:false};objective('');mark('the old oak');}
 function updateOak(dt){const X=C.oak;X.t+=dt;const p=me();
  if(!X.started&&((p.speed||0)<.6||X.t>7)){X.started=true;const oak=main(LOOKOUT.oak.d,LOOKOUT.oak.lat);S.lookTarget={x:oak.x,y:oak.y+3,z:oak.z};
   talk([{wait:2.2},{who:'JAMIE',text:'“That thing in the tunnel…”',from:jamie,time:2.4,gap:1.8},{who:'SAM',text:'“It was scared.”',from:sam,time:1.8,gap:2},{who:'YOU',text:'“Of what?”',time:1.6,gap:.4},
    {wait:3.2},{act:()=>{C.blink=ambient.blink?.(me(),{back:46,dur:1.9});mark('a streetlight, down the street');},wait:3.6},{act:()=>{C.endT=0;S.lookTarget=null;},wait:.1}]);}}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p');if(h)h.innerHTML='Chapter Four';if(pp)pp.textContent='August 23, 2011.';}const nb=$('next-chapter');if(nb)nb.hidden=true;o.finish();}
 // ---- doors, the dark, the night's sounds ----------------------------------------------------------------------------------------
 const SWING={'video-front':1,'library-front':-1,'video-back':1,'video-office':1,'laundry-back':1,'laundry-side':1};// (shop doors swing in, the back doors out)
 function updateDoors(dt){for(const [key,d] of Object.entries(D.doors||{})){const want=DOORS[key]?.open??1;if(d.posed&&Math.abs(d.cur-want)<1e-3)continue;d.cur=damp(d.cur,want,6,dt);if(Math.abs(d.cur-want)<2e-3)d.cur=want;
  d.hinge.rotation.y=(SWING[key]??1)*d.cur*1.45;d.posed=true;}}
 function updateDark(dt){const to=C.darkTo||0;C.dark=damp(C.dark,to,to>C.dark?1.3:.7,dt);if(Math.abs(C.dark-to)<1e-3)C.dark=to;}
 function updateAmb(dt){const ph=S.phase,day=sky().day,town=where().street==='town';let want;if(C.mq?.still&&ph==='n4-marquee'){for(const kk in C.amb)C.amb[kk]=0;return;}
  if(/^(e4-cascade|n4-(store|back|alley|laundry|depot|marquee))$/.test(ph))want={traffic:0,life:0,insects:.12,wind:.45,forest:0,tunnel:0,water:0};
  else want={traffic:town&&C.h<19.8?1:.15,life:day>.3?1:.35,insects:smooth((C.h-19.4)/.6),wind:.8,forest:0,tunnel:0,water:0};
  for(const kk in want)C.amb[kk]=damp(C.amb[kk]??0,want[kk],.6,dt);}
 // ---- you, them, the bikes: where a jump puts everyone ---------------------------------------------------------------------------
 function youFoot(u,v,a,bike){const q=at(u,v),b=bike?at(bike.u,bike.v):null;o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:b?{x:b.x,z:b.z,a:bike.a??HN}:undefined});}
 function youRide(q,a,speed=3){o.placePlayer({x:q.x,z:q.z,a,mode:'ride',speed});}
 function boyFoot(c,u,v,a,bike){const q=at(u,v),b=bike?at(bike.u,bike.v):null;comp.putFoot(c,q.x,q.z,a,{bike:b?{x:b.x,z:b.z,a:bike.a??HN,kick:bike.kick??1,fall:bike.fall??0}:null});c.follow=null;c.lookAt=null;}
 function boyRide(c,q,a,speed=3){comp.putRiding(c,q.x,q.z,a,speed);c.follow='ride';}
 const tq=(u,v)=>at(u,v),hd=(u0,v0,u1,v1)=>{const a=at(u0,v0),b=at(u1,v1);return headingTo(a.x,a.z,b.x,b.z);};
 // The story never waits forever on someone standing still: after a long while, a fade, and the three of them a little
 // further on (the boys pulled you along); the same place a player who kept walking would have reached.
 function carry(why,u,v,a,{ride=false,jq=null,sq=null}={}){if(C.fadeOut>=0)return;C.flags['carried-'+why]=true;mark('carried on: '+why);C.fadeOut=0;
  C.after=()=>{if(ride){youRide(at(u,v),a,0);}else{const r=o.roam,b=TL(r.x,r.z);youFoot(u,v,a,{u:b.u,v:b.v,a:r.a});}// (your bike stays where you left it)
   const J=jq||{u:u-Math.sin(a)*1.4+Math.cos(a)*.8,v:v},Sq=sq||{u:u-Math.sin(a)*1.6-Math.cos(a)*.9,v:v-.6};
   for(const [c,q] of [[jamie,J],[sam,Sq]]){if(ride){boyRide(c,at(q.u,q.v),a,0);c.follow=null;}else{const bk=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null,w=at(q.u,q.v);comp.putFoot(c,w.x,w.z,a,{bike:bk});c.follow=null;}}
   follow(true);C.fadeIn=0;};}
 // ---- the spots F works on, and the camera's keys -------------------------------------------------------------------------------
 function spots(){const out=[],ph=S.phase;if(C.view||C.fadeOut>=0||posed())return out;
  if(ph==='d4-sam'&&C.flags.bagReady&&!C.flags.bag)out.push({id:'c4-bag',label:'Look in Alex’s backpack',at:bag.position,face:bag.position,r:2.6,wide:true});
  if(ph==='d4-town'){const v=P4('vic');if(v?.visible&&!v.walking&&!C.talked.has('vic'))out.push({id:'c4-vic',label:'Talk to Vic',at:v.pos,face:v.pos,r:3.2,wide:true,ride:true});
   if(C.flags.mason&&!C.flags.window){const w=at(SPOT.masonWindow.u,SPOT.masonWindow.v);out.push({id:'c4-window',label:'Look in the window',at:w,face:at(SPOT.masonWindow.look.u,SPOT.masonWindow.look.v),r:2.4,wide:true});}
   const f=P4('florist');if(f?.visible&&!f.walking&&C.flags.mason&&!C.flags.florist&&!busy())out.push({id:'c4-florist',label:'Talk to the florist',at:f.pos,face:f.pos,r:3,wide:true});}
  if(ph==='d4-library'&&!C.flags.albright){const a=P4('librarian');if(a?.visible)out.push({id:'c4-librarian',label:'Talk to the librarian',at:a.pos,face:a.pos,r:3.6,wide:true});}
  if((ph==='d4-library'||ph==='d4-archive')&&C.flags.reel&&!C.flags.closing){const R=at(SPOT.reader.u,SPOT.reader.v);out.push({id:'c4-reader',label:C.read.size?'Sit back down at the reader':'Sit at the microfilm reader',at:R,face:at(SPOT.reader.look.u,SPOT.reader.look.v),r:1.9,wide:true});}
  if(ph==='n4-store'&&C.store?.ring&&!C.store.answered){const q=at(SPOT.videoPhone.u,SPOT.videoPhone.v,TY+1.1);out.push({id:'c4-phone',label:'Answer the phone',at:q,face:q,r:2.4,wide:true});}
  if(ph==='n4-store'&&C.store?.dark!==null&&C.store?.dark!==undefined&&DOORS['video-back'].open<.5){const q=at(103.75,-33.9);out.push({id:'c4-backdoor',label:'Push the door open',at:q,face:at(103.75,-35.6),r:1.9,wide:true});}
  return out;}
 function act(id){if(id==='c4-bag')openBag();else if(id==='c4-vic')talkVic();else if(id==='c4-window')lookWindow();else if(id==='c4-florist')florist();else if(id==='c4-librarian')talkLibrarian();
  else if(id==='c4-reader')startArchive();else if(id==='c4-phone')answerPhone('you');else if(id==='c4-backdoor'){openBack('you');}}
 const canCamera=()=>C.inv.camera&&me().walking&&!posed()&&!C.view&&C.fadeOut<0&&!['c4-black','d4-bag','d4-archive'].includes(S.phase);
 const shootWanted=()=>S.phase==='n4-store'&&C.store?.shot==='pine-ridge'&&!C.inv.lead;
 function key(code,repeat){if(!owns(S.phase))return false;
  if(code==='KeyV'){if(C.view==='camera'||C.view==='shoot'){if(!repeat)closeView();return true;}if(C.view==='reader'){if(!repeat&&!C.flags.closing)leaveArchive();return true;}
   if(canCamera()){if(!repeat){if(shootWanted())openShoot();else openCamera(S.phase==='n4-clue'||C.inv.lead&&/^n4-/.test(S.phase)?Math.max(0,leadIndex()):photo.V.i);}return true;}return false;}
  if(C.view==='camera'){if(code==='KeyA'||code==='ArrowLeft'){photo.browse(-1);return true;}if(code==='KeyD'||code==='ArrowRight'){photo.browse(1);return true;}
   if(code==='KeyW'||code==='ArrowUp'){photo.zoomBy(1);return true;}if(code==='KeyS'||code==='ArrowDown'){photo.zoomBy(-1);return true;}
   if(code==='KeyF'){const cur=photo.current;if(!repeat&&cur?.bike&&!C.found.has(cur.id)&&photo.V.zoom<1.9)photo.guide();return true;}return ['Space','KeyQ','KeyE','KeyC','KeyT'].includes(code);}
  if(C.view==='shoot'){if(code==='KeyF'){if(!repeat){if(C.aim&&!C.inv.lead){takePicture('you');later(1.3,()=>{if(C.view==='shoot')closeView();});}else{flash();photo.V.shutter=1;sound('shutter',camera.position,{gain:.5});}}return true;}
   return ['KeyW','KeyA','KeyS','KeyD','Space','KeyC'].includes(code);}
  if(C.view==='reader'){if(code==='KeyA'||code==='ArrowLeft'){showRecord(C.rec-1);return true;}if(code==='KeyD'||code==='ArrowRight'||code==='KeyF'){if(!repeat)showRecord(C.rec+1);return true;}
   if(code==='KeyS'||code==='ArrowDown'){if(!repeat&&!C.flags.closing)leaveArchive();return true;}return ['KeyW','Space','KeyQ','KeyE','KeyC','KeyT'].includes(code);}
  return false;}
 function pan(dx,dy){if(!owns(S.phase))return false;if(C.view==='camera'){photo.pan(dx,dy);return true;}if(C.view==='reader')return true;return false;}
 function wheel(dy){if(!owns(S.phase)||C.view!=='camera')return false;photo.zoomBy(dy<0?1:-1);return true;}
 function hint(){const ph=S.phase;
  if(C.view==='camera')return [['A / D','Previous / next'],['W / S','Zoom'],...(photo.V.zoom>1.05?[['Mouse','Move around']]:[]),['V','Lower the camera']];
  if(C.view==='shoot')return C.aim&&!C.inv.lead?[['F','Take a picture'],['V','Lower the camera']]:[['V','Lower the camera']];
  if(C.view==='reader')return [['A / D','Previous / next'],...(C.flags.closing?[]:[['S','Get up']])];
  if(canCamera()&&((ph==='d4-photos'&&!C.flags.lead1)||shootWanted()||ph==='n4-clue'))return [['V','Raise the camera']];
  return null;}
 // The viewfinder (taking the picture of the screen): the camera held up a little lower, its screen showing what it sees.
 let vfT=0;function drawViewfinder(dt){vfT-=dt;if(vfT>0)return;vfT=.1;const L2=photo.model.lcdCanvas;if(!L2)return;const g=L2.g,w=640,h=480;g.fillStyle='#101214';g.fillRect(0,0,w,h);
  if(C.aim){g.fillStyle='#2a3240';g.fillRect(w*.18,h*.18,w*.64,h*.6);try{if(!C.vfSign){C.vfSign=canvas(320,200);if(C.vfSign)pineSignArt(C.vfSign.g,320,200);}if(C.vfSign)g.drawImage(C.vfSign.c,w*.3,h*.28,w*.4,h*.32);}catch{}
   for(let y=h*.18;y<h*.78;y+=4){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(w*.18,y,w*.64,1.4);}}
  g.strokeStyle=C.aim?'#52e052':'#f2f2f2';g.lineWidth=3;const bx=w*.38,by=h*.36,bw=w*.24,bh=h*.28;for(const [x,y,sx,sy] of [[bx,by,1,1],[bx+bw,by,-1,1],[bx,by+bh,1,-1],[bx+bw,by+bh,-1,-1]]){g.beginPath();g.moveTo(x,y+sy*22);g.lineTo(x,y);g.lineTo(x+sx*22,y);g.stroke();}
  g.fillStyle='#f2f2f2';g.font='20px Arial';g.textBaseline='middle';g.fillText('AUTO',14,20);g.fillText('⚡A',w-70,20);g.fillText(String(Math.max(0,987-photo.photos.length)),w-70,h-20);if(photo.model.tex)photo.model.tex.needsUpdate=true;}
 function updateView(dt){if(C.view==='camera'){if(photo.current&&!photo.current.canvas&&!photo.current.lead)photo.take(photo.V.i);updatePhotos(dt);}
  else if(C.view==='shoot'){C.viewT+=dt;C.aim=inside('video')&&TVS.video.shot==='pine-ridge'&&k.camLooksAt(tvPos(),.955);photo.V.dirty=false;drawViewfinder(dt);const G=photo.model.group;G.position.y-=.085*smooth(photo.V.raise);G.position.x+=.035*smooth(photo.V.raise);}
  else if(C.view==='reader')updateArchive(dt);}
 // ---- sounds in the world (placeholders), what is in the way ----------------------------------------------------------------------
 function sources(out){const f=fixIdx(D.laundryFix)[0];if(f!==undefined&&lights.level(f)>.3&&C.lightsOn){const q=at(157.2,-24,TY+1);if(camera.position.distanceTo(new THREE.Vector3(q.x,q.y,q.z))<30)out.push({id:'dryers4',kind:'fan',pos:new THREE.Vector3(q.x,q.y,q.z),level:.6});}}
 function blockers(){const out=[...life.blockers];if(samMom.visible)out.push({x:samMom.x,z:samMom.z,r:.34,speed:0});if(AX.person.group.visible)out.push({x:AX.x,z:AX.z,r:.3,speed:0});out.push(...creature.colliders());return out;}
 // ---- every frame -------------------------------------------------------------------------------------------------------------------
 const others=()=>{const p=me();return [{x:p.x,z:p.z},...[jamie,sam].filter(c=>c.active).map(c=>c.mode==='foot'?{x:c.px,z:c.pz}:{x:c.bx,z:c.bz})];};
 function update(dt){C.t+=dt;C.pt+=dt;const ph=S.phase,p=me();
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  clock(dt);
  if(C.lightsOn){lights.S.fixOn={...Object.fromEntries(fixIdx(D.libraryFix).map(i=>[i,C.h<20.02?1:0]))};lights.update(dt,C.h);lights.lights(dt,camera.position,{indoors:inside('library')||inside('video')||inside('laundry')});}
  if(C.townLife)life.update(dt,C.h,{eye:camera.position,others:others()});
  if(samMom.visible)samMom.update(dt,{eye:camera.position});
  updatePose(dt);match(dt);guard(dt);standAll();updateDoors(dt);photo.update(dt);updateView(dt);updateTVs(dt);updateCrt(dt);updateAX(dt);updateSil(dt);updateFlash(dt);updateDark(dt);updateAmb(dt);
  // Alex's pictures, rendered a few at a time while nobody is looking at them
  if(C.renderQ?.length&&!C.view){C.renderT=(C.renderT||0)-dt;if(C.renderT<=0){C.renderT=.15;const i=C.renderQ.shift();if(!photo.photos[i].rendered)photo.take(i);}}
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.6));if(C.fadeIn>=1.6){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.8));if(C.fadeOut>=1){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(ph==='c4-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<4.4&&!C.cardOn)card(true,'Chapter Four','MAIN STREET');if(C.cardT>4.4&&C.cardOn)card(false);if(C.cardT>5.6)opening();}
  else if(ph==='d4-sam'){if(C.flags.bagReady&&!C.flags.bag&&S.pt>50&&!C.flags.bagNudge&&!busy()){C.flags.bagNudge=true;say([{who:'SAM',text:'“It’s right there. By the door.”',by:'sam'}]);}}
  else if(ph==='d4-photos'){if(!C.view&&!C.flags.lead1){C.downT=(C.downT||0)+dt;if(C.downT>22&&!busy()){C.downT=0;say([{who:'JAMIE',text:'“Keep going. There’s more on there.”',by:'jamie'}]);}}else C.downT=0;}
  else if(ph==='d4-ride')updateRide(dt);
  else if(ph==='d4-town')updateTown(dt);
  else if(ph==='d4-library'){updateLibrary(dt);if(!inside('library',p,1)&&!C.flags.reader){C.flags.library=false;go('d4-town');}}
  else if(ph==='d4-closing')updateClosing(dt);
  else if(ph==='e4-dusk')updateDusk(dt);
  else if(ph==='e4-alex')updateAlexScene(dt);
  else if(ph==='e4-ride')updateDuskRide(dt);
  else if(ph==='e4-cascade')updateCascade(dt);
  else if(ph==='n4-store')updateStore(dt);
  else if(ph==='n4-alley')updateEscape(dt);
  else if(ph==='n4-laundry')updateLaundry(dt);
  else if(ph==='n4-depot')updateDepot(dt);
  else if(ph==='n4-marquee')updateMarquee(dt);
  else if(ph==='n4-return')updateReturn(dt);
  else if(ph==='n4-ride')updateRideHome(dt);
  else if(ph==='n4-oak'){updateOak(dt);if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n4-end');end();}}}
  const L4=sky();A.day=L4.day;A.night=L4.night;ch2.day=A.day;A.shade=0;A.barLight=false;}
 // ---- lifecycle -----------------------------------------------------------------------------------------------------------------------
 const SG0=SG?.open;
 function reset(){const hadPose=C.pose,hadView=!!C.view;card(false);life.clear();lights.reset();if(lights.S.attached)lights.attach(false);flashL.removeFromParent();flashL.intensity=0;flashT=0;photo.reset();footage.reset();
  for(const T2 of Object.values(TVS)){T2.on=0;T2.shot=null;T2.t=0;T2.frames=0;T2.rt=0;T2.stat=1;for(const tv of [T2.tv,...T2.share])if(tv){tv.mat.uniforms.uOn.value=0;tv.mat.uniforms.uStatic.value=1;}}
  for(const key of Object.keys(DOORS)){DOORS[key].open=DOOR0[key];const d=D.doors?.[key];if(d){d.cur=DOOR0[key];d.posed=false;}}updateDoors(0);
  nav.setTown(false);samMom.show(false);samMom.lookAt=null;bag.visible=false;AX.person.group.visible=false;AX.state='off';AX.still=false;AX.turn=0;AX.lk=undefined;for(const s of SIL){s.q.visible=false;s.state='off';}
  if(C.crt||C.esc?.pass)creature.show(false);creature.ground=null;Object.assign(creature.drive,{cower:0,back:0,alert:0,snap:0});if(SG0!==undefined&&C.flags?.bagReady)SG?.set?.(SG0);ambient.blinkReset?.();
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView)o.roam.walkLock=false;fresh();}
 // QA jumps, DEV scenes and Continue: the chapter at one of its moments, everything it needs set up.
 function jump(section){section=ALIAS4[section]||section;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();
  if(section==='chapter4-start'){begin();return;}
  common();dayWorld();objective('');C.renderQ=photo.photos.map((p,i)=>i);C.inv.camera=true;
  const ix=SECTIONS4.indexOf(section),past=s=>ix>SECTIONS4.indexOf(s),ff=(...ks)=>{for(const kk of ks)C.flags[kk]=true;};
  const town=h=>{C.h=h;life.start(h);C.townLife=true;C.minute=-1;date(h);};
  // ---- at Sam's ----
  if(ix<=SECTIONS4.indexOf('c4-photo-mason')){samHouse({mom:section==='c4-sam-house'});boysAtSam();youAtSam();C.h=HOUR.start;date(C.h);
   if(section==='c4-sam-house'){opening();C.fadeIn=-1;return;}
   bagReady();go('d4-sam');samMom.show(false);
   if(section==='c4-backpack'){C.h=13.94;C.inv.camera=false;const b=bag.position,q={x:b.x+Math.sin(driveA(0,0))*1.4,z:b.z-Math.cos(driveA(0,0))*1.4},bk=drive(.9,5.4);
    o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,b.x,b.z),mode:'walk',bike:{x:bk.x,z:bk.z,a:driveA(.9,5.4)}});openBag();return;}
   ff('bag');C.h=13.98;date(C.h);go('d4-photos');objective('Look through Alex’s pictures.');stand(jamie,camBeside(1));stand(sam,camBeside(-1));
   if(section==='c4-photo-mason')for(const id of ['oak-sunset','briarwood','creek']){C.found.add(id);C.photoLines.add(id);const ph=photo.photos.find(q=>q.id===id);if(ph)ph.found=true;}
   for(const id of Object.keys(PLINES))C.photoLines.add(id);if(section==='c4-camera')C.photoLines.delete('sam-face');
   openCamera(section==='c4-camera'?0:section==='c4-photo-bike'?5:12);saveInv();return;}
  ff('bagReady','bag','lead1','rideStart');for(const id of ['oak-sunset','briarwood','creek','mason']){C.found.add(id);const ph=photo.photos.find(q=>q.id===id);if(ph)ph.found=true;}saveInv();
  // ---- the ride ----
  const d0=SH.drivD;
  if(section==='c4-ride'){samHouse({mom:false});C.h=HOUR.ride;date(C.h);go('d4-ride');objective('Ride downtown.','Summerfield Road, then Old Mill Road into town.');
   const q=main(d0-5,-2.2);youRide(q,heading(d0-5)+Math.PI,2.6);boyRide(jamie,main(d0-1.4,-1.2),heading(d0)+Math.PI,2.4);boyRide(sam,main(d0+1.6,-2.9),heading(d0)+Math.PI,2.4);follow(true);return;}
  ff('r1');
  if(section==='c4-old-mill-road'){town(14.18);go('d4-ride');objective('Ride downtown.','Summerfield Road, then Old Mill Road into town.');ff('r2');
   const q=connAt(14,1.1);youRide(q,q.a,3.4);const j=connAt(9.6,-.6),m=connAt(6.8,1.8);boyRide(jamie,j,j.a,3.4);boyRide(sam,m,m.a,3.4);follow(true);return;}
  ff('r2','r3');
  if(section==='c4-downtown-arrival'){town(14.28);go('d4-ride');youRide(tq(-45,2.4),HWst,3.2);boyRide(jamie,tq(-49.5,1),HWst,3.2);boyRide(sam,tq(-52,3.6),HWst,3.2);follow(true);arrive();return;}
  ff('arrived');
  if(section==='c4-main-street'){town(14.36);go('d4-town');objective('Find Mason Cycle & Sport.','On Main Street, past Second Street.');youRide(tq(38,-3.2),HWst,3.4);boyRide(jamie,tq(33.5,-1.6),HWst,3.4);boyRide(sam,tq(31,-4.4),HWst,3.4);follow(true);return;}
  // ---- Mason's, the florist, the library ----
  if(section==='c4-mason'||section==='c4-florist'){town(14.45);go('d4-town');const bk={u:134.4,v:-5.4,a:HWst};youFoot(134.4,-7.6,HS,bk);
   boyFoot(jamie,132.4,-8.6,HS,{u:131.2,v:-5.4,a:HWst});boyFoot(sam,137.2,-8.4,HS,{u:137.6,v:-5.4,a:HWst});follow(true);atMason();if(section==='c4-florist'){S.queue.length=0;S.line=null;ff('window');florist();}return;}
  ff('mason','window','florist','toLibrary','libraryHint');
  if(ix<=SECTIONS4.indexOf('c4-closing')){town(14.9);bikesTo('rack');
   youFoot(135,46.8,HN,RACK[0]);bikesTo('rack');boyFoot(jamie,133.6,45.8,HN,{...RACK[1],a:HN});boyFoot(sam,136.6,45.6,HN,{...RACK[2],a:HN});follow(true);
   if(section==='c4-library'){enterLibrary();return;}
   ff('library','albright','reel');go('d4-library');objective('Use the microfilm reader.','The local history room, in the back.');C.h=15.0;date(C.h);
   youFoot(148.6,57.8,HN,RACK[0]);bikesTo('rack');boyFoot(jamie,147.2,57.6,HN);boyFoot(sam,150.2,57.2,HN);for(const c of [jamie,sam])c.bike.group.visible=true;bikesTo('rack');
   if(section==='c4-microfilm')return;
   if(section==='c4-historical-clue'){startArchive();return;}
   for(let i=0;i<ARCHIVE.length-1;i++)C.read.add(i);C.rec=ARCHIVE.length-1;C.h=ARCHIVE[3].h;startArchive();S.queue.length=0;S.line=null;showRecord(ARCHIVE.length-1);S.queue.length=0;S.line=null;closing();return;}
  ff('library','albright','reel','reader','closing');for(let i=0;i<ARCHIVE.length;i++)C.read.add(i);
  // ---- dusk ----
  if(section==='c4-dusk'){town(HOUR.exit);go('d4-closing');youFoot(135,42,HS,RACK[0]);bikesTo('rack');boyFoot(jamie,133.6,42.8,HS,{...RACK[1],a:HN});boyFoot(sam,136.4,43,HS,{...RACK[2],a:HN});bikesTo('rack');outside();return;}
  ff('outside');
  if(section==='c4-alex-across'){town(HOUR.alex);go('e4-dusk');youFoot(127.6,10.3,HS,RACK[0]);boyFoot(jamie,127.2,10.6,HS,{...RACK[1],a:HN});boyFoot(sam,130,10.9,HS,{...RACK[2],a:HN});bikesTo('rack');follow(true);alexAcross();return;}
  ff('alex','alexLines');
  if(section==='c4-creature-notices'||section==='c4-creature-hiding'){town(20.05);go('e4-ride');objective('Go home.','East on Main Street, then up Old Mill Road.');youRide(tq(97.4,2.8),HE,0);boyRide(jamie,tq(99.6,1.4),HE,0);boyRide(sam,tq(100.8,3.9),HE,0);follow(true);
   creatureDusk();S.queue.length=0;S.line=null;const R=C.crt;R.seenT=2;R.seenAt=C.t;R.stageAt.stalk=C.t;R.k.paused=C.t;
   if(section==='c4-creature-notices'){R.stage='stalk';R.v=-17.6;}
   else{for(const s2 of ['freeze','look','back','scurry'])R.stageAt[s2]=C.t;R.k.corner=R.k.corner2=C.t;outNow([R.lit.corner,R.lit.corner2].filter(i=>i>=0));R.stage='hide';R.u=HIDE.u;R.v=HIDE.v;R.a=hd(HIDE.u,HIDE.v,CORNER.u,CORNER.v-3);Object.assign(creature.drive,{cower:1,crouch:.35});}
   R.t=0;placeCrt();return;}
  if(section==='c4-creature'){town(20.04);go('e4-ride');objective('Go home.','East on Main Street, then up Old Mill Road.');youRide(tq(97.4,2.8),HE,3.2);boyRide(jamie,tq(101.5,1.6),HE,3.2);boyRide(sam,tq(103.4,4.2),HE,3.2);follow(true);creatureDusk();return;}
  ff('crt');
  const atCorner=()=>{youRide(tq(93,2.9),HE,0);boyRide(jamie,tq(95.6,1.5),HE,0);boyRide(sam,tq(96.4,4.4),HE,0);for(const c of [jamie,sam])c.follow=null;follow(true);};
  if(section==='c4-presence'||section==='c4-tv-window'){town(20.08);go('e4-creature');atCorner();cascadeStart(section==='c4-tv-window'?24:0);C.dark=C.darkTo=section==='c4-tv-window'?.2:0;return;}
  ff('cascade');outNow(EAST);DOORS['video-front'].open=0;
  // ---- the video store ----
  if(ix<=SECTIONS4.indexOf('c4-back-door')){town(HOUR.store);go('e4-cascade');ff('hurry');youFoot(103.0,-15.4,hd(103,-15.4,99.35,-18),STORE[0]);bikesTo('store');boyFoot(jamie,103.6,-17.9,hd(103.6,-17.9,99.35,-18),{...STORE[1],kick:0,fall:-1.3});boyFoot(sam,102.6,-13.5,hd(102.6,-13.5,99.35,-18),{...STORE[2],kick:0,fall:-1.3});bikesTo('store');
   enterStore();S.queue.length=0;S.line=null;const X=C.store;X.doorShut=C.t;for(const c of [jamie,sam])stand(c,{u:c===jamie?103.6:102.6,v:c===jamie?-17.9:-13.5},{look:()=>tvPos()});C.dark=C.darkTo;
   if(section==='c4-video-store')return;
   if(section==='c4-store-footage'){X.t=4.2;storeShot('alex-ride');return;}
   for(const id of SEQ)X.lines.add(id);
   if(section==='c4-pine-ridge'){X.t=20;storeShot('pine-ridge');return;}
   ensureLead();X.gotIt=C.t-10;X.t=34;X.shot='static';X.shotAt=C.t-1;tvShow('video',null);
   if(section==='c4-store-phone')return;
   X.ringAt=C.t-4;X.answered='you';X.callDone=true;
   if(section==='c4-store-live'){X.callDone=false;later(1.6,()=>{if(C.store===X)X.callDone=true;});return;}/* (a moment after the line goes dead) */
   X.live=C.t-8;tvShow('video','live-store');X.dark=C.t-6;C.darkTo=C.dark=.72;outNow([shopIdx('video'),LV.neon+NEON.videoOpen,LV.neon+NEON.videoSign,D.videoFix?.front,D.videoFix?.middle,D.videoFix?.rear].filter(i=>i!==undefined&&i>=0));
   objective('Get out the back.','Through the back room.');youFoot(104.4,-31.6,HS,STORE[0]);bikesTo('store');stand(jamie,{u:103.2,v:-33},{look:at(103.75,-35,TY+1.2)});stand(sam,{u:105.6,v:-32.6},{look:()=>camera.position});return;}
  ff('store','out');ensureLead();
  // ---- out the back ----
  if(ix<=SECTIONS4.indexOf('c4-laundromat')){town(HOUR.back);DOORS['video-back'].open=1;outNow(VIDEO);bikesTo('store');
   youFoot(103.75,-36.6,HWst,STORE[0]);bikesTo('store');boyFoot(jamie,102.4,-37.4,HWst,{...STORE[1],kick:0,fall:-1.3});boyFoot(sam,105.2,-37.8,HWst,{...STORE[2],kick:0,fall:-1.3});bikesTo('store');
   C.flags.out=false;outBack();C.dark=C.darkTo;
   if(section==='c4-escape'){S.queue.length=0;S.line=null;say([{who:'JAMIE',text:'“The laundromat. It’s open till ten.”',by:'jamie'}]);return;}
   S.queue.length=0;S.line=null;
   /* (where the ways part: on along the alley to the narrow way (A), or up the passage to Main (B); the dark ten metres back) */
   if(section==='c4-route-a'||section==='c4-route-b'){const A2=section==='c4-route-a';youFoot(A2?136:136.4,A2?-40.2:-37.4,A2?HWst:hd(136.4,-37.4,143.2,-35.2),STORE[0]);bikesTo('store');boyFoot(jamie,A2?134.6:135,A2?-39.2:-36.6,HWst);boyFoot(sam,A2?133.8:134.6,A2?-40.6:-38.4,HWst);for(const c of [jamie,sam])c.bike.group.visible=true;bikesTo('store');darkBehind(126,10);C.esc.t=25;return;}
   if(section==='c4-alley-creature'){youFoot(146.6,-38.4,HWst,STORE[0]);bikesTo('store');boyFoot(jamie,145.4,-37.6,HWst);boyFoot(sam,144.2,-39.2,HWst);for(const c of [jamie,sam])c.bike.group.visible=true;bikesTo('store');darkBehind(137,10);C.esc.t=40;return;}
   C.esc.pass={kind:'narrow',stage:'gone'};youFoot(163.75,-35.4,HN,STORE[0]);bikesTo('store');boyFoot(jamie,162.6,-36.2,HN);boyFoot(sam,165,-36.3,HN);for(const c of [jamie,sam])c.bike.group.visible=true;bikesTo('store');darkBehind(158,8);C.esc.t=60;C.esc.routes=['alley','narrow'];C.esc.route='narrow';enterLaundry();S.queue.length=0;S.line=null;return;}
  ff('laundry');outNow([...VIDEO,...WEST]);
  // ---- Depot Street, the Lyric ----
  if(ix<=SECTIONS4.indexOf('c4-power-returns')){town(HOUR.theater);bikesTo('store');DOORS['video-back'].open=1;escInit();C.esc.pass={kind:'narrow',stage:'gone'};C.flags.out=true;C.flags.hurry=true;
   const put=(u,v,a)=>{youFoot(u,v,a,STORE[0]);bikesTo('store');};
   if(section==='c4-depot-st'||section==='c4-theater'){put(...(section==='c4-depot-st'?[172.8,-26.75,HWst]:[176.2,-23.4,HWst+.35]));boyFoot(jamie,section==='c4-depot-st'?172.4:178.6,section==='c4-depot-st'?-25.4:-24.4,HN);boyFoot(sam,section==='c4-depot-st'?173.6:180.6,section==='c4-depot-st'?-28.2:-25.2,HN);
    for(const c of [jamie,sam])c.bike.group.visible=true;bikesTo('store');C.flags.laundry=true;darkBehind(section==='c4-depot-st'?166:170,9);C.esc.t=80;C.esc.routes=['alley','narrow','laundromat'];C.esc.route='narrow';depot();if(section==='c4-theater')SIL.forEach((s,i)=>{s.t=-(.3+i*1.6);});C.darkTo=.7;C.dark=C.darkTo;return;}
   ff('depot');outNow([...LAUNDRY,...LAUNDRY_LAMP]);put(178.6,-8.4,HWst);boyFoot(jamie,179.8,-7.0,HWst);boyFoot(sam,179.6,-10.2,HWst);for(const c of [jamie,sam])c.bike.group.visible=true;bikesTo('store');
   C.flags.depot=true;go('n4-depot');checkpoint('c4-theater');C.dp={t:0,first:C.t};marquee();C.dark=C.darkTo;
   if(section==='c4-marquee')return;
   S.queue.length=0;S.line=null;blackout();return;}
  ff('depot','mq');
  // ---- the bikes, home ----
  if(section==='c4-final-clue'){town(HOUR.ret);go('n4-return');C.mq={t:0,out:C.t-6,back:C.t-3,rush:false};youFoot(111.6,-8.9,HE,STORE[0]);bikesTo('store');boyFoot(jamie,112.2,-7.8,HE,{...STORE[1],kick:0,fall:-1.3});boyFoot(sam,109.4,-9,HE,{...STORE[2],kick:0,fall:-1.3});bikesTo('store');
   follow(true);finalClue();return;}
  ff('clue','leadOpen');homeNight();
  if(section==='c4-ride-home'){C.h=HOUR.ride2;date(C.h);go('n4-ride');objective('Go home.','The old oak, at the end of Oak Hollow.');const q=connAt(128,-1.2),a=q.a+Math.PI;youRide(q,a,3.6);
   const j=connAt(132.5,.4),m=connAt(135,-2);boyRide(jamie,j,a,3.6);boyRide(sam,m,a,3.6);follow(true);return;}
  ff('h1','h2','h3');
  if(section==='c4-oak'){C.h=20.55;date(C.h);go('n4-ride');objective('Go home.','The old oak, at the end of Oak Hollow.');youRide(main(1096,-1.6),heading(1096),3.6);boyRide(jamie,main(1091.6,-.4),heading(1091.6),3.6);boyRide(sam,main(1089.4,-2.8),heading(1089.4),3.6);follow(true);return;}
  // chapter4-end: at the oak
  C.h=HOUR.oak;date(C.h);go('n4-ride');youRide(main(1130,-1.1),heading(1130),.4);boyRide(jamie,main(1127.6,.8),heading(1127.6),.3);boyRide(sam,main(1126.4,-2.8),heading(1126.4),.3);follow(true);atOak();}
 // ---- the api ---------------------------------------------------------------------------------------------------------------------------
 Object.assign(A4,{SECTIONS:SECTIONS4,ALIAS:ALIAS4,LABEL:LABEL4,ARCHIVE,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,
  light:()=>owns(S.phase)?sky():null,jamieSweep:()=>null,longThrow:()=>null,officerAim:()=>null,
  canDismount:()=>!posed()&&!C.view&&S.phase!=='c4-black',
  canRemount:()=>!C.view&&!posed()&&!/^(d4-(sam|bag|library|archive)|n4-(store|laundry))$/.test(S.phase)&&!(S.phase==='d4-photos'&&!C.flags.lead1),
  C,lights,life,photo,footage,TVS,AX,SIL,bag,samMom,EAST,WEST,KEEP,LYRIC,VIDEO,LAUNDRY,sky,drawRecord,takePicture,ensureLead,leadIndex,inside,at});
 Object.defineProperties(A4,{amb:{get:()=>C.amb},viewing:{get:()=>C.view},
  state:{get:()=>({phase:S.phase,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,inv:{...C.inv},found:[...C.found],read:[...C.read].sort(),rec:C.rec,dark:+C.dark.toFixed(3),darkTo:C.darkTo||0,
   photos:{count:photo.photos.length,rendered:photo.rendered,index:photo.V.i,zoom:+photo.V.zoom.toFixed(2),open:photo.V.open,lead:leadIndex()},shots:[...(C.shots||[])],sounds:{...C.sounds},
   tvs:Object.fromEntries(Object.entries(TVS).map(([key,T2])=>[key,{on:T2.on,shot:T2.shot,frames:T2.frames}])),
   creature:{visible:creature.group.visible,loaded:creature.loaded,stage:C.crt?.stage??null,seenAt:C.crt?.seenAt??null,pass:C.esc?.pass?{kind:C.esc.pass.kind??null,stage:C.esc.pass.stage,lane:C.esc.pass.lane??null,roof:!!C.esc.pass.roof,passedAt:C.esc.pass.passedAt??null,seenT:+(C.esc.pass.seenT||0).toFixed(2),closest:C.esc.pass.minD!=null?+C.esc.pass.minD.toFixed(2):null}:null},
   escape:C.esc?.P?{route:C.esc.route,routes:[...C.esc.routes],gap:+C.esc.P.gap.toFixed(2),gapMin:+Math.min(99,C.esc.P.gapMin).toFixed(2),gapMax:+C.esc.P.gapMax.toFixed(2),lightsOut:C.esc.P.out,nudges:C.esc.nudges}:null,
   alex:{state:AX.state,visible:AX.person.group.visible,seenAt:C.ax?.seenAt??null,walkAt:C.ax?.walkAt??null,goneAt:C.ax?.goneAt??null},
   silhouettes:SIL.map(s=>s.state),store:C.store?{t:+C.store.t.toFixed(2),shot:C.store.shot,ring:C.store.ring,answered:C.store.answered,live:C.store.live,dark:C.store.dark,doorShut:C.store.doorShut}:null,
   cascade:C.cas?{front:+(C.cas.front??-80).toFixed(1),tvAt:C.cas.tvAt,nearAt:C.cas.nearAt,darkT:+C.cas.darkT.toFixed(1),pulled:C.cas.pulled}:null,mq:C.mq?{out:C.mq.out,back:C.mq.back,rush:C.mq.rush}:null,
   presence:lights.state,life:life.state,doors:Object.fromEntries(Object.entries(DOORS).map(([key,d])=>[key,d.open])),townOpen:nav.townOpen,pose:!!C.pose,lastEvent:C.lastEvent,
   objective:S.objective,spots:spots().map(s=>s.id)})}});
 return A4;
}
