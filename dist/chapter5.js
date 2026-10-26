// Chapter Five: The Place in the Picture. The next day, Wednesday, August 24, 2011: the afternoon, the evening and the
// night, at Pine Ridge.
//
//  Day:   Sam's garage a little before two. His mother at work until six (she thinks they are at Jamie's). Sam packs:
//         three flashlights, batteries, water, and Alex's camera ("You hold it"). Jamie, late, his backpack holding one
//         sock; Sam hands him two granola bars without a word. Out of town and north on Mill Street past its sawhorse: the
//         Old Reservoir Road, the farm, Jamie's race to the top of the ridge, the reservoir below. Pine Ridge Park: a new
//         sign, not the one in the picture. The bikes locked to the rack. Skipping stones: Jamie's three, Sam's plunk, Sam's
//         six. The end of the dock: Alex, and the shoe he caught and named Gary. Then the picture on Alex's camera, the
//         photograph of a television: Alex walking toward whoever held the camera, the brown wooden sign, the yellow gate,
//         the gray shed. Matched, by looking, at the old lot at the north end of the lawn. The trail map: the road goes to
//         Camp Whippoorwill, closed. The yellow gate: Jamie under it, Sam not; you decide how they go.
//  Camp:  the arch, STAY WITH YOUR BUDDY, a flashlight each. The office (the 1991 register: August 24, twenty years ago
//         today, two bike tracks at the service gate, both leading in, none out; the search grid, the pump house circled),
//         the lodge (the pantry: cans gone from the dust, recently), the cabins (Sam's batteries, without being asked). The
//         campfire: Jamie, who says "when", not "if", and cannot finish a sentence. Then it is almost seven. Three hours,
//         and it felt like ten minutes.
//  Dusk:  Wren's window, lit for a moment (the sun on the glass, Sam says). Owl: Alex's gold shirt on a nail, still wet;
//         JSA cut fresh into the wall, an arrow, four marks. They call his name. A light in the trees going away toward the
//         pump house; it stops; it goes out. Walking back, three lights come in at the gate and walk where the three of
//         them walked that afternoon, stopping where they stopped. The thing from the drain is there, low against the
//         lodge, watching the lights; it runs from them. The lights stop, turn, and go out.
//  Night: The camp that wants them apart: Owl's window lit behind them, the office's porch light ahead (the way out). A
//         voice from Owl that says "Jamie?"; a voice by the office that is Sam's mother's. It pulls at whichever of them you
//         are not with. Sam's compromise: together, from the porch, then go. In Owl, standing where the shirt hung: Jamie,
//         his cap, his shirt. Jamie, next to you: "That's me." The light goes out; every light in the camp comes on. Run:
//         the road (the camp gate, which Sam shuts and which opens again by itself) or the dam (the bell, ringing by
//         itself across the water). Every light goes out at once. The lamp in the lot. A shaky laugh. The shirt in Sam's
//         bag. "It didn't start till we found it." The last picture on Alex's camera, which none of them took: the three
//         of them at the fire, from the trees, at 6:53. "I'm starving." "You brought a sock." Across the water, one light.
//
// Nothing here explains anything. No one fights anything. Every event has a fallback in time, so nothing waits forever on
// the player, and nothing turns the player's view for them. chapter4.js hands this file every phase that starts c5-, d5-,
// e5- or n5-. The place: pine-plan.js (plan and nav), pine-build.js and pine-camp.js (meshes); the camp at night:
// chapter5-presence.js.
import * as THREE from './three.module.js';
import {smooth,seeded} from './kit.js';
import {headingTo,wrap} from './people.js';
import {P as PI} from './rig.js';
import {PW,PL,hd,SPOT,BLD,DOORS,ROADS,DOCKS,SOLIDS,heightAt,WATER,shoreSD,frameOf} from './pine-plan.js';
import {registerPageArt,REGISTER,searchMapArt,freshCarvingArt,kioskMapArt,oldSignArt} from './pine-art.js';
import {createCampPresence,roomPoint} from './chapter5-presence.js';
import {createCompanionBrain} from './companion-brain.js';
import {createPlaces} from './chapter5-places.js';
import {createPhysical,handFrame} from './physical.js';
import {createGarage} from './chapter5-garage.js';
import {createPark} from './chapter5-park.js';
import {createGates} from './chapter5-gates.js';
import {createGear} from './chapter5-gear.js';
import {chapter5Appearance} from './chapter5-models.js';
import {CAST} from './cast.js';
import {clothShirt,flashlightMesh} from './chapter5-props.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),lerp=(a,b,t)=>a+(b-a)*t;
// QA jumps and DEV scenes, in story order.
export const SECTIONS5=['chapter5-start','c5-garage','c5-departure','c5-ride','c5-race','c5-crest','c5-arrival','c5-park','c5-stones','c5-dock-memory','c5-sign-search',
 'c5-photo-match','c5-trail-map','c5-gate-decision','c5-gravel-road','c5-camp-gate','c5-camp','c5-office','c5-register','c5-lodge','c5-pantry','c5-cabins','c5-campfire',
 'c5-golden-hour','c5-owl','c5-calling','c5-three-lights','c5-split','c5-compromise','c5-window','c5-run','c5-route-a','c5-route-c','c5-boundary','c5-aftermath',
 'c5-second-discovery','chapter5-end'];
export const ALIAS5={'c5-start':'chapter5-start','c5-sam-garage':'c5-garage','c5-sock':'c5-departure','c5-old-reservoir-road':'c5-ride','c5-ridge':'c5-crest','c5-memory':'c5-dock-memory',
 'c5-match':'c5-photo-match','c5-map':'c5-trail-map','c5-gate':'c5-gate-decision','c5-road':'c5-gravel-road','c5-arch':'c5-camp-gate','c5-explore':'c5-camp','c5-search-map':'c5-register',
 'c5-batteries':'c5-cabins','c5-fire':'c5-campfire','c5-wren':'c5-golden-hour','c5-shirt':'c5-owl','c5-call':'c5-calling','c5-copy':'c5-three-lights','c5-creature':'c5-three-lights',
 'c5-set-piece':'c5-split','c5-double':'c5-window','c5-escape':'c5-run','c5-gate-scare':'c5-boundary','c5-relief':'c5-aftermath','c5-photo':'c5-second-discovery','c5-end':'chapter5-end'};
// Checkpoints (silent; Continue on the title returns to the last one).
export const LABEL5={'chapter5-start':'The next afternoon','c5-ride':'The Old Reservoir Road','c5-arrival':'Pine Ridge','c5-sign-search':'The place in the picture',
 'c5-gate-decision':'The yellow gate','c5-camp-gate':'Camp Whippoorwill','c5-campfire':'The campfire','c5-owl':'Owl','c5-split':'The camp at night','c5-run':'Run',
 'c5-second-discovery':'The lamp in the lot','chapter5-end':'One light'};
const PHASES=['c5-black','d5-garage','d5-ride','d5-park','d5-stones','d5-dock','d5-sign','d5-map','d5-gate','d5-road','d5-camp','d5-fire','e5-dusk','e5-owl','e5-call',
 'e5-lights','n5-split','n5-window','n5-run','n5-out','n5-final','n5-end'];
// (Wednesday afternoon: out of Sam's garage at twenty to four, Pine Ridge by twenty past four, the camp before six, the fire
// at a quarter to seven, Owl at half past seven, dark a little after eight; the clock runs at its own pace and never skips)
const HOUR={start:15.62,ride:15.95,arrive:16.3,camp:17.72,fire:18.62,golden:18.95,owl:19.5,call:19.72,lights:19.86,split:20.04,window:20.14,run:20.18,out:20.28,final:20.42};
// a time said out loud: “six forty-nine”, “seven o’clock”, “almost seven”
const WORD=['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'],TEENS=['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],TENS=['','','twenty','thirty','forty','fifty'];
const spoken=h=>{const H=Math.floor(h),M=Math.floor((h-H)*60+1e-6),hw=WORD[H%12],mw=M===0?'o’clock':M<10?'oh-'+WORD[M]:M<20?TEENS[M-10]:TENS[Math.floor(M/10)]+(M%10?'-'+WORD[M%10]:'');return hw+' '+mw;};
const roughly=h=>{const H=Math.floor(h),M=(h-H)*60;return M>=40?'almost '+WORD[(H+1)%12]:M<12?'a little after '+WORD[H%12]:'after '+WORD[H%12];};
const fmt=h=>{const H=Math.floor(h),M=Math.floor((h-H)*60+1e-6),h12=((H+11)%12)+1;return `${h12}:${String(M).padStart(2,'0')} ${H>=12?'PM':'AM'}`;};
// Where Alex stood in the picture (the footage set's gate, footage.js: x 0, z -6 from the old lot's middle): the old lot is L0.
const ALEX_STOOD=[SPOT.L0[0]+.4,SPOT.L0[1]+6.2];

export function createChapter5(o,k,ch2,ch3,ch4){
 const {scene,world,nav,camera,ambient,$}=o,{S,comp,jamie,sam}=k,A=k.api,T=o.tension,police=k.police;
 const me=k.me,talk=k.talk,busy=k.busy,objective=k.objective,go=k.go,dist=k.dist,main=k.main;
 for(const p of PHASES)k.DEEP[p]=0;
 if(k.CHECKPOINT)Object.assign(k.CHECKPOINT,LABEL5);
 const PN=world.pine,A5={},photo=ch4.photo,creature=ch3.creature;
 const camp=createCampPresence({scene,world,camera,sfx:(n,p,op)=>sound(n,p,op)});
 // Placeholder sound hooks: every one counted for the tests, handed to the game's sfx (which plays what it knows).
 function sound(name,pos,opts){(C.sounds||={})[name]=(C.sounds[name]||0)+1;o.sfx?.(name,pos,opts);}
 // ---- places ------------------------------------------------------------------------------------------------------------
 const gy=(x,z)=>nav.groundY(x,z)??heightAt(x,z);
 const W5=(e,n,y)=>{const p=PW(e,n);return {x:p.x,z:p.z,y:y??gy(p.x,p.z)};};
 const at=q=>Array.isArray(q)?W5(q[0],q[1]):q;
 const EN=p=>PL(p.x,p.z);
 const where=(p=me())=>nav.locate(p.x,p.z);
 const ha=(e0,n0,e1,n1)=>hd(e1-e0,n1-n0);
 const inside=(id,p=me(),m=0)=>{const b=BLD[id],{e,n}=PL(p.x,p.z),[lx,lz]=b.F.of(e,n);return Math.abs(lx)<b.w/2-.1+m&&Math.abs(lz)<b.d/2-.1+m;};
 const inAny=(p=me())=>['office','lodge','bluejay','cardinal','owl'].find(id=>inside(id,p));
 const near=(q,r,p=me())=>{const w=at(q);return Math.hypot(p.x-w.x,p.z-w.z)<r;};
 const date=h=>o.setDate(`AUGUST 24, 2011 <i></i> ${fmt(h)}`);
 // Jamie and Sam with minds of their own (companion-brain.js): what each place offers them to look at, and the mood
 const brain=createCompanionBrain({nav,comp}),PLACES=createPlaces((e,n)=>{const p=PW(e,n);return {x:p.x,z:p.z,y:heightAt(p.x,p.z)};});
 function minds(){brain.reset();for(const c of [jamie,sam])brain.enable(c,true);C.mindKey=null;}
 const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
 const roomV=(id,lx,lz,y)=>roomPoint(id,lx,lz,y);
 // a building's frame point on the ground (or its floor): plan-frame lx, lz (lz out of the front)
 const bpt=(id,lx,lz)=>{const b=BLD[id],[e,n]=b.F.to(lx,lz);return [e,n];};
 const RACK=(()=>{const r=SPOT.rack,F={to:(lx,lz)=>{const a=r.a;return [r.c[0]+Math.cos(a)*lx+Math.sin(a)*lz,r.c[1]-Math.sin(a)*lx+Math.cos(a)*lz];}};
  // three slots between the uprights; the middle bike the other way round (handlebars clear of each other)
  return [[-.9,.62,r.a+Math.PI],[-.3,-.62,r.a],[.9,.62,r.a+Math.PI]].map(([lx,lz,a])=>{const [e,n]=F.to(lx,lz);return {e,n,a};});})();
 const rackSpot=()=>W5(...SPOT.rack.c);
 const OWLB=BLD.owl,OWL_PORCH=bpt('owl',0,OWLB.d/2+OWLB.porch-.35),OWL_FRONT=bpt('owl',0,OWLB.d/2+OWLB.porch+3.2),OFFICE_FRONT=bpt('office',BLD.office.door[0],BLD.office.d/2+BLD.office.porch+2.6);
 const owlLamp=()=>camp.LAMPS.owl?.pos,officeLamp=()=>camp.LAMPS['office-porch']?.pos;
 // ---- story props: the shirt on the nail, the carving, the register's open page, stones and rings on the water -----------
 const K={mat:(c,o2={})=>new THREE.MeshStandardMaterial({color:c,roughness:.9,...o2})};
 const props=new THREE.Group();props.name='chapter5-props';
 const canvas=(w,h)=>{try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;return {c,g};}catch{return null;}};
 const texOf=cv=>{if(!cv)return null;const t=new THREE.CanvasTexture(cv.c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};
 // Alex's shirt: the gold one with the collar (the one on the flyers), on the nail where Owl's campers hung their towels.
 const shirt=new THREE.Group();shirt.name='alex-shirt';props.add(shirt);
 clothShirt(shirt);
 shirt.visible=false;
 // JSA, cut fresh into the wall boards: pale wood under the gray, an arrow, four marks.
 const carving=new THREE.Group();carving.name='owl-carving';props.add(carving);
 {const cv=canvas(512,330);if(cv)try{freshCarvingArt(cv.g,512,330);}catch{}const q=new THREE.Mesh(new THREE.PlaneGeometry(.52,.34),new THREE.MeshStandardMaterial({map:texOf(cv),color:cv?0xffffff:0xc8b080,roughness:.95,transparent:true,alphaTest:.05}));q.rotation.y=Math.PI;carving.add(q);}
 carving.visible=false;
 // The register's open page, lying on the office counter (drawn when opened).
 const page=canvas(1024,730),pageTex=texOf(page);
 const pageMesh=new THREE.Mesh(new THREE.PlaneGeometry(.42,.3),new THREE.MeshStandardMaterial({map:pageTex,color:page?0xffffff:0xe8e0c8,roughness:.95}));pageMesh.rotation.x=-Math.PI/2;
 const pageG=new THREE.Group();pageG.add(pageMesh);pageG.visible=false;pageG.name='register-page';props.add(pageG);
 // The pantry's middle shelf: dust, and four clean rings in it where cans stood until recently.
 const dust=new THREE.Group();dust.name='pantry-dust';props.add(dust);
 {const R=PN?.anchors?.pantryGap;if(R){const b=BLD.lodge,cv=canvas(256,512);if(cv){const g=cv.g;g.fillStyle='#9a8a70';g.fillRect(0,0,256,512);for(let i=0;i<900;i++){g.fillStyle=`rgba(${200+Math.random()*40|0},${190+Math.random()*30|0},${170+Math.random()*30|0},.25)`;g.fillRect(Math.random()*256,Math.random()*512,2,2);}
    g.globalCompositeOperation='destination-out';for(const [x,y] of [[78,170],[178,170],[78,342],[178,342]]){g.beginPath();g.arc(x,y,40,0,7);g.fill();}}
   const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.0),new THREE.MeshStandardMaterial({map:texOf(cv),color:cv?0xffffff:0xa89a80,transparent:true,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
   m.rotation.x=-Math.PI/2;dust.add(m);const [e,n]=b.F.to(R.x,-R.z),w=W5(e,n);dust.position.set(w.x,b.y+R.y+.018,w.z);dust.rotation.y=-b.a;}}
 // Stones, and the rings they leave on the water.
 const stone=new THREE.Mesh(new THREE.SphereGeometry(.035,8,5),K.mat(0x8a8478));stone.scale.y=.45;stone.visible=false;props.add(stone);
 const RINGS=[...Array(10)].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.12,.17,20),new THREE.MeshBasicMaterial({color:0xe8eef0,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.visible=false;props.add(m);return {m,t:9};});
 function ring(x,z,big=1){const r=RINGS.reduce((a,b)=>b.t>a.t?b:a);r.t=0;r.big=big;r.m.position.set(x,WATER+.025,z);r.m.visible=true;}
 function updateRings(dt){for(const r of RINGS){if(!r.m.visible)continue;r.t+=dt;const s=1+r.t*3.2*r.big;r.m.scale.set(s,s,s);r.m.material.opacity=.5*Math.max(0,1-r.t/1.6);if(r.t>1.6)r.m.visible=false;}}
 // ---- state --------------------------------------------------------------------------------------------------------------
 const C={};
 function fresh(){for(const key of Object.keys(C))delete C[key];Object.assign(C,{t:0,pt:0,h:HOUR.start,flags:{},timers:[],cardT:-1,fadeIn:-1,fadeOut:-1,endT:-1,after:null,pose:null,match:false,want:null,wantT:0,
  spot:{jamie:null,sam:null},sitW:{jamie:0,sam:0},view:null,page:0,read:new Set(),clues:new Set(),seen:new Set(),talked:new Set(),photos:[],dark:0,lastEvent:0,sounds:{},amb:{traffic:0,insects:.4,wind:.8,life:1,forest:.4,tunnel:0,water:.5},
  inv:{camera:false,lead:false,shirt:false,flashlight:false,batteries:false},minute:-1,race:null,st:null,sign:null,trail:[],crt:null,split:null,esc:null,out:null,choice:null,route:null,lapse:null,beat:null,lit:false});}
 fresh();
 const checkpoint=id=>{k.checkpointTo(id,LABEL5[id]);};// (silent: Continue on the title comes back here)
 const later=(sec,fn)=>C.timers.push({at:C.t+sec,fn});
 const mark=why=>{C.lastEvent=C.t;if(why)T?.note?.(why);};
 // (Chapter Six picks up the next morning: chapter6.js has its phases, sections and everything in them)
 const mine=ph=>typeof ph==='string'&&/^(c5|d5|e5|n5)-/.test(ph);
 const owns=ph=>mine(ph)||!!A5.next?.owns(ph),nextOwns=()=>!!A5.next?.owns(S.phase);
 const handles=sec=>SECTIONS5.includes(sec)||!!ALIAS5[sec]||!!A5.next?.handles?.(sec);
 function card(on,title='Chapter Five',eyebrow=''){const el=$('chapter-card');if(!el)return;if(on){const e=el.querySelector?.('.eyebrow'),h=el.querySelector?.('h2');if(e)e.textContent=eyebrow;if(h)h.textContent=title;el.classList.add('on');}else el.classList.remove('on');C.cardOn=on;}
 // (a line can set the speaker's face, face:'amused', and the listeners', faces:{sam:'unimpressed'}: faces.js)
 const by=l=>{if(l.text===undefined&&!l.face&&!l.faces)return l;const from=l.by==='jamie'?jamie:l.by==='sam'?sam:l.from,act0=l.act;
  const act=(l.face||l.faces)?()=>{if(l.face&&from?.person?.face)from.person.face.set(l.face,{hold:Math.max(3,(l.time||2)+1.5)});if(l.faces)for(const [k,f] of Object.entries(l.faces)){const c=k==='jamie'?jamie:sam;c.person.face?.set(f,{hold:4});}act0?.();}:act0;
  if(l.text===undefined)return {...l,act};return {...l,from,act,time:l.time??Math.max(1.4,(typeof l.text==='function'?'a line of about this long':l.text).replace(/[“”]/g,'').length*.056)};};
 function say(lines,opts){talk(lines.map(by),opts);}
 // ---- poses: a closer look, sitting down ---------------------------------------------------------------------------------
 function pose(q,{y,pitch=0,yaw=null,look=null}){const p=me(),a=yaw??headingTo(q.x,q.z,look.x,look.z);C.pose={w:0,x:q.x,y,z:q.z,yaw:a,pitch,from:p.a,fromPitch:p.pitch||0,baseYaw:a,baseY:y,release:false,fx:p.x,fz:p.z};k.setPose(C.pose);o.roam.walkLock=true;}
 function unpose(){if(C.pose)C.pose.release=true;}
 function updatePose(dt){const P2=C.pose;if(!P2)return;P2.w=P2.release?Math.max(0,P2.w-dt*1.5):Math.min(1,P2.w+dt/1.1);if(P2.release&&P2.w<=0){C.pose=null;k.setPose(null);if(!C.view)o.roam.walkLock=false;}}
 const posed=()=>!!C.pose&&!C.pose.release;
 // a look at something close: from where you stand, eye height over the floor, at it
 function closeLook(target,{back=.62,eye=1.42,floor=null}={}){const p=me(),a=headingTo(p.x,p.z,target.x,target.z),q={x:target.x-Math.sin(a)*back,z:target.z+Math.cos(a)*back};const fy=floor??gy(q.x,q.z);
  const dy=target.y-(fy+eye),pitch=Math.atan2(dy,back);pose(q,{y:fy+eye,yaw:a,pitch});}
 // ---- Jamie and Sam: on bikes when you are, on foot when you are; or somewhere the scene puts them --------------------------
 function follow(on){C.match=on;}
 function match(dt){if(!C.match)return;const p=me(),want=p.riding?'ride':'walk';C.wantT=C.want===want?C.wantT+dt:0;C.want=want;
  for(const c of [jamie,sam]){if(c.script||!c.active)continue;
   if(C.spot[c.key]){if(want==='walk'&&c.mode==='ride'&&C.wantT>=1)comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)]);continue;}
   if(want==='ride'){if(c.mode==='ride'){c.follow='ride';continue;}if(C.wantT<.8||C.flags.locked)continue;
    const fb=Math.hypot(c.bx-c.px,c.bz-c.pz);if(c.bike.group.visible&&fb<45){const s2={x:c.bx-Math.cos(c.ba)*.43,z:c.bz-Math.sin(c.ba)*.43},path=nav.walkPath({x:c.px,z:c.pz},s2);
     comp.run(c,[comp.steps.walkTo(c,path.length?path:[[s2.x,s2.z]],{speed:1.8}),comp.steps.turnTo(c,()=>c.ba,.45),comp.steps.act(()=>{c.kick=0;c.fall=0;}),comp.steps.mount(c,1.3)],{then:()=>{c.follow='ride';}});}
    else c.follow='walk';}
   else{if(c.mode==='foot'){c.follow='walk';continue;}if(C.wantT<1)continue;
    if(c.mode==='ride')comp.run(c,[comp.steps.brake(c,.3),comp.steps.dismount(c),comp.steps.kickstand(c)],{then:()=>{c.follow='walk';}});}}}
 // Somewhere to stand: [e,n], or a function giving a world {x,z}; look: a point (or function); null: back to following.
 function stand(c,q,{look=null,face=null,max=3.2,gesture=null,keep=false,leash=14,sit=false}={}){
  // (getting up off a log: back in front of it first, on ground that can be walked)
  if((C.seated||={})[c.key]&&C.seatFront?.[c.key]&&c.mode==='foot'){const f=at(C.seatFront[c.key]),bk=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null;C.seated[c.key]=false;C.sitW[c.key]=0;comp.putFoot(c,f.x,f.z,c.pa,{bike:bk});}
  C.spot[c.key]=q?{q,look,face,max,gesture,keep,leash,sit}:null;if(!q){C.sitW[c.key]=0;C.seated[c.key]=false;if(c.script?.spot5){c.script=null;c.then=null;}if(C.match&&c.mode==='foot')c.follow='walk';return;}
  if(c.mode!=='foot'||c.script?.spot5)return;
  comp.run(c,[comp.steps.toward(c,()=>{const s=C.spot[c.key];if(!s)return null;const w=typeof s.q==='function'?s.q():at(s.q);const lk=typeof s.look==='function'?s.look():s.look;
   const g=s.sit?sitGesture(c,w):s.gesture;return {x:w.x,z:w.z,look:lk,face:typeof s.face==='function'?s.face():s.face??undefined,max:s.max,gesture:g};})],{then:()=>{if(C.match&&c.mode==='foot')c.follow='walk';}});c.script.spot5=true;}
 function standAll(){for(const c of [jamie,sam]){const s=C.spot[c.key];if(s&&c.mode==='foot'&&!c.script)stand(c,s.q,s);}}
 // A seat that is itself in the way (a log round the fire): walk up to the front of it, then onto it (sit: [e,n] of the seat).
 function seatSnap(){for(const c of [jamie,sam]){const sp=C.spot[c.key];if(!sp||!Array.isArray(sp.sit)||(C.seated||={})[c.key]||c.mode!=='foot')continue;const f=at(sp.q);if(Math.hypot(c.px-f.x,c.pz-f.z)>1.1)continue;
   const w=W5(...sp.sit),bk=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null;comp.putFoot(c,w.x,w.z,sp.face??c.pa,{bike:bk});(C.seatFront||={})[c.key]=sp.q;stand(c,sp.sit,{...sp,sit:true});C.seated[c.key]=true;}}
 // Sitting (a log, the dock's boards): down onto the seat once there, hands on the knees.
 function sitGesture(c,w){return p=>{const d=(C.seated||{})[c.key]?0:Math.hypot(c.px-w.x,c.pz-w.z),k2=C.sitW[c.key]=d<.35?Math.min(1,(C.sitW[c.key]||0)+.02):Math.max(0,(C.sitW[c.key]||0)-.05),s=smooth(k2);
  p[PI.root+1]-=.44*s;p[PI.lean]-=.1*s;for(const f of [PI.lf,PI.rf])p[f+2]-=.36*s;for(const h of [PI.lh,PI.rh]){p[h+1]-=.3*s;p[h+2]-=.2*s;}};}
 const GEST={point:w=>p=>{const y=p[PI.root+1];p[PI.rh]+=(.16-p[PI.rh])*w;p[PI.rh+1]+=(y+.42-p[PI.rh+1])*w;p[PI.rh+2]+=(-.5-p[PI.rh+2])*w;},
  tense:w=>p=>{p[PI.root+1]-=.04*w;p[PI.lean]+=.12*w;p[PI.lh+1]+=.06*w;},
  hold:w=>p=>{p[PI.lh]+=(-.12-p[PI.lh])*w;p[PI.lh+1]+=(1.0-p[PI.lh+1])*w;p[PI.lh+2]+=(-.32-p[PI.lh+2])*w;p[PI.rh]+=(.12-p[PI.rh])*w;p[PI.rh+1]+=(1.0-p[PI.rh+1])*w;p[PI.rh+2]+=(-.32-p[PI.rh+2])*w;}};
 const camBeside=(s,back=.38,side=.66)=>()=>{const p=me(),fx=Math.sin(p.a),fz=-Math.cos(p.a),rx=Math.cos(p.a),rz=Math.sin(p.a);return {x:p.x+rx*side*s-fx*back,z:p.z+rz*side*s-fz*back};};
 function glance(c,q,secs=2){c.lookAt=q;later(secs,()=>{if(c.lookAt===q)c.lookAt=null;});}
 // Jamie and Sam stay with you: Chapter Five never loses them (as Chapter Four: chapter4.js guard()). A place the scene gave
 // one to stand that you have since left far behind is let go; a path that has stopped getting anywhere is looked for
 // again; and only when one is truly stuck, far behind and out of sight, is he put, unseen, a little way back along the way
 // you came. C.guardLog counts each, for the tests.
 const GUARD={jamie:{x:0,z:0,t:0,stuck:0},sam:{x:0,z:0,t:0,stuck:0}},TRAIL=[];
 const occluded=(x0,z0,x1,z1)=>{const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.6);for(let i=2;i<n-1;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;if(!nav.walkable(x,z,{r:.05})&&!nav.rideable?.(x,z))return true;}return false;};
 const seenAt=q=>{const e=camera.position,f=new THREE.Vector3();camera.getWorldDirection(f);const dx=q.x-e.x,dz=q.z-e.z,l=Math.hypot(dx,dz)||1;return (dx*f.x+dz*f.z)/l/(Math.hypot(f.x,f.z)||1)>.3&&l<45&&!occluded(e.x,e.z,q.x,q.z);};
 function guard(dt){const ph=S.phase;if(!C.guardLog){C.guardLog={released:0,unstuck:0,recovered:0};TRAIL.length=0;for(const g of Object.values(GUARD))Object.assign(g,{x:0,z:0,t:0,stuck:0});}
  if(!/^(d5-(park|stones|dock|sign|map|gate|road|camp)|e5-|n5-(split|window|run|out))/.test(ph)||C.fadeOut>=0)return;const p=me();
  const tl=TRAIL[TRAIL.length-1];if(!tl||Math.hypot(tl.x-p.x,tl.z-p.z)>1){TRAIL.push({x:p.x,z:p.z});if(TRAIL.length>40)TRAIL.shift();}
  for(const c of [jamie,sam]){if(!c.active)continue;const g=GUARD[c.key],q=c.mode==='ride'?{x:c.bx,z:c.bz}:{x:c.px,z:c.pz},d=Math.hypot(q.x-p.x,q.z-p.z);
   c.footBoost=C.flags.hurry?1.45:1.2;
   const sp=C.spot[c.key];if(sp&&!sp.keep&&c.mode==='foot'&&p.walking&&d>(sp.leash||14)){stand(c,null);C.guardLog.released++;}
   g.t+=dt;if(g.t>=2.5){const mv=Math.hypot(q.x-g.x,q.z-g.z);g.x=q.x;g.z=q.z;g.t=0;g.stuck=d>6&&mv<.4&&c.mode==='foot'&&!sp?g.stuck+2.5:0;if(g.stuck===2.5){c.route=null;C.guardLog.unstuck++;}}
   if(g.stuck>=7.5&&d>9&&c.mode==='foot'&&!c.script&&p.walking&&!C.view&&!seenAt(q)){
    for(let i=TRAIL.length-1;i>=0;i--){const t=TRAIL[i],b=Math.hypot(t.x-p.x,t.z-p.z);if(b<5)continue;if(b>12)break;
     if(nav.walkable(t.x,t.z,{r:.3})&&!seenAt(t)){comp.putFoot(c,t.x,t.z,headingTo(t.x,t.z,p.x,p.z),{bike:c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null});if(C.match)c.follow='walk';g.stuck=0;C.guardLog.recovered++;mark('caught up: '+c.key);break;}}}}
  makeWay(dt,p);}
 // Make way: you are walking (W held) and getting nowhere, with one of them right in front of you in a narrow place (the
 // corner of a porch, a cabin door): he steps aside, the way a friend would, and then goes back to following (or to where the
 // scene had him). (Neither of you walks into the other, so otherwise you could both stand there.)
 // (every quarter metre of the way walkable: no walking through a cabin wall or off the edge of a porch)
 function clearWay(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.25);for(let i=1;i<=n;i++){const t=i/n;if(!nav.walkable(x0+(x1-x0)*t,z0+(z1-z0)*t,{r:.2}))return false;}return true;}
 function makeWay(dt,p){const M=C.makeWay||(C.makeWay={x:p.x,z:p.z,t:0,cool:0});M.cool-=dt;const mv=Math.hypot(p.x-M.x,p.z-M.z);M.x=p.x;M.z=p.z;
  M.t=p.walking&&p.pushing&&mv<Math.max(dt,1e-3)*.3&&!C.view&&!posed()?M.t+dt:0;if(M.t<.6||M.cool>0)return;
  const fx=Math.sin(p.a),fz=-Math.cos(p.a),rx=Math.cos(p.a),rz=Math.sin(p.a);let best=null;
  for(const c of [jamie,sam]){if(!c.active||c.mode!=='foot'||(C.seated||{})[c.key]||(c.script&&!c.script.spot5))continue;/* (not in the middle of something: a throw, a hand-off, his bag) */const dx=c.px-p.x,dz=c.pz-p.z,d=Math.hypot(dx,dz);
   if(d>1.6||dx*fx+dz*fz<.15||Math.abs(dx*rx+dz*rz)>.75)continue;if(!best||d<best.d)best={c,d,side:Math.sign(dx*rx+dz*rz)||1};}
  if(!best)return;const c=best.c,s0=best.side;
  // to his side of the way you are going (or the other side), on ground he can stand on, clear of your next steps
  const q=[1.5,2.2].flatMap(k=>[[s0,0],[s0,-.7],[-s0,0],[-s0,-.7],[s0,.6],[-s0,.6]].map(([sd,bk])=>({x:c.px+rx*sd*k+fx*bk*k,z:c.pz+rz*sd*k+fz*bk*k})))
   .find(q=>nav.walkable(q.x,q.z,{r:.3})&&Math.abs((q.x-p.x)*rx+(q.z-p.z)*rz)>.9&&clearWay(c.px,c.pz,q.x,q.z)&&[jamie,sam].every(o=>o===c||o.mode!=='foot'||Math.hypot(o.px-q.x,o.pz-q.z)>1.1));if(!q)return;// (not onto the other one)
  M.cool=2.5;M.t=0;C.guardLog.madeWay=(C.guardLog.madeWay||0)+1;mark('made way: '+c.key);
  comp.run(c,[comp.steps.walkTo(c,[[q.x,q.z]],{speed:1.7})],{then:()=>{const sp=C.spot[c.key];if(sp){c.script=null;stand(c,sp.q,sp);}else if(C.match&&c.mode==='foot')c.follow='walk';}});c.script.makeWay=true;}
 // ---- the clock, and the light it makes ---------------------------------------------------------------------------------------
 // The afternoon runs at four times real time, the evening at six, the night at three. When something has to happen at a
 // set time the clock catches up to it (a minute a second) rather than the story waiting. At the campfire the afternoon
 // goes by while they sit (the lapse).
 const RATE={day:4/3600,dusk:6/3600,night:3/3600};
 function clock(dt){const ph=S.phase;let r=0;
  if(/^d5-(garage|ride|park|stones|dock|sign|map|gate|road|camp|fire)$/.test(ph))r=RATE.day;else if(/^e5-/.test(ph))r=RATE.dusk;else if(/^n5-/.test(ph))r=RATE.night;
  if(C.lapse){const L=C.lapse;L.t+=dt;C.h=lerp(L.from,L.to,smooth(L.t/L.dur));o.fade(.5*Math.sin(Math.PI*clamp(L.t/L.dur,0,1)));if(L.t>=L.dur){C.lapse=null;o.fade(0);L.then?.();}}
  else{C.h+=r*dt;if(C.hMin!==undefined&&C.h<C.hMin)C.h=Math.min(C.hMin,C.h+dt/60);}
  const m=Math.floor(C.h*60+1e-6);if(m!==C.minute&&ph!=='c5-black'){C.minute=m;date(C.h);}}
 // The sky (as Chapter Four's: a white afternoon, gold, dusk at eight, night by half past); C.dark deepens it where the camp
 // has taken the light; a lit room's own light fills it.
 function sky(h=C.h){const q=(a,b)=>smooth((h-a)/(b-a));
  let day=1-.5*q(16.4,19.25)-.5*q(19.25,19.98),p=.36*q(16.6,19.25)+.64*q(19.25,20.12),night=.6*q(19.95,20.3)+.3*q(20.3,20.9),deep=.18*q(20.2,20.9);
  const d=C.dark;night=lerp(night,.95,d);deep=lerp(deep,.6,d);
  const id=inAny(),fill=id?camp.level(id):0;return {day,p,night,deep,fill};}
 // ---- the world as Chapter Five finds it ------------------------------------------------------------------------------------
 // (friends' garage floors: down to the slab while this chapter walks you into Sam's; as they were for the other chapters)
 // (the faces that show what they feel and move when they talk: this chapter's; the others keep the faces they had)
 const appearances=new Map();let oldTorch=null,newTorch=null;
 function faces(on){const people=new Map();for(const f of o.friends?.list||[])if(f.person)people.set(f.person,CAST[f.key]||CAST[f.name?.toLowerCase()]||CAST.jamie);for(const c of [jamie,sam])people.set(c.person,CAST[c.key]);people.set(o.self,CAST.player);
  for(const [p,cast] of people){if(!p||!cast)continue;if(on){p.face?.enable?.(true);if(!appearances.has(p))appearances.set(p,chapter5Appearance(p,cast));appearances.get(p).enable(true);}else{appearances.get(p)?.enable(false);p.face?.enable?.(false);}}
  const torch=o.foot?.torch;if(torch){if(on&&!oldTorch){oldTorch=[...torch.children];torch.clear();newTorch||=flashlightMesh();newTorch.rotation.y=Math.PI/2;torch.add(newTorch);}else if(!on&&oldTorch){torch.clear();torch.add(...oldTorch);oldTorch=null;}}}
 function slabs(on){for(const P of Object.values(world.homes||{})){const f=P?.garageFoundation;if(f)f.position.y=on?-.18:0;}}
 function common(){document.body?.classList?.add('night1');nav.setTown(true);nav.setPine?.(true);slabs(true);faces(true);o.foot.fpBody=true;camp.attach(true);if(!props.parent)scene.add(props);}
 function dayWorld(){A.day=1;A.night=0;ch2.day=1;S.deep=A.deep=0;o.flashShadow?.(false);o.nightRendering?.(false);o.attachFlashlight?.(true);/* (day rendering takes the flashlight's lights out; they go back in and stay the whole chapter: T only changes how bright) */ambient.night?.(false);ambient.morning?.(true);
  for(const a of [...k.adults,...ch2.extra,...Object.values(ch3.people||{})]){a.show(false);a.lookAt=null;a.gest(null);a.path=null;a.mode='stand';}
  police.reset?.();k.carA.show(false);k.carB.show(false);ch2.flyers.visible=true;ch2.found.group.visible=false;ch2.tape.visible=false;for(const b of ch2.beams)b.on=false;ch2.samBeam&&(ch2.samBeam.on=false);
  k.clue.visible=false;k.glint.visible=false;k.track.visible=false;k.flies.visible=false;k.torch.visible=false;S.flashOn=false;o.setFlashlight?.(false,false);
  world.doors.alex?.set(0);world.alexWindow.emissiveIntensity=.04;
  for(const key of Object.keys(DOORS))DOORS[key].open=0;const gt=PN?.dyn?.campGate;if(gt){gt.want=-1.25;gt.k=1.4;}const bell=PN?.dyn?.bell;if(bell){bell.v=0;bell.swing=0;bell.yoke.rotation.z=0;}
  if(PN?.lights?.lot)PN.lights.lot.level=0;if(PN?.dyn?.fishCar)PN.dyn.fishCar.g.visible=true;}
 // The flashlights Sam brought: yours (T), Jamie's and his own, on from dusk.
 function lightsOut(on){S.flashOn=on;ch2.samBeam&&(ch2.samBeam.on=on);A.barLight=false;if(on)C.inv.flashlight=true;}// (yours stays yours: T)
 // ---- Sam's garage ------------------------------------------------------------------------------------------------------------------
 const SH=world.homes.sam,SG=world.garages.sam,SHW=(x,z,y=0)=>{const p=SH.toWorld(x,z);return {x:p.x,z:p.z,y:p.ground+y};};
 const gxS=SH.gx??(SH.w*.32),gzS=SH.gfront??SH.front;
 const drive=(x,z)=>SHW(gxS+x,gzS+z);
 const driveA=(x,z)=>{const a=drive(x,z),b=drive(x,z+5);return headingTo(a.x,a.z,b.x,b.z);};
 const d0=SH.drivD;
 // The garage scene itself (the table, the supplies, the bags, the sock, the map): chapter5-garage.js. Here: who is
 // where, what is said, and the way out to the bikes.
 const phys=createPhysical({scene,comp});comp.after(()=>phys.sync());
 const G5=createGarage({scene,phys,comp,jamie,sam,drive,driveA,gy,camera,me,self:o.self,busy,later:(t,f)=>later(t,f),t:()=>C.t,
  say:(l,op)=>say(l,op),sound:(n,p,op)=>sound(n,p,op),stand:(c,q,op)=>stand(c,q,op),walkPath:(c,q,obs=[],pad=null)=>nav.walkPath({x:c.px,z:c.pz},q,obs,pad),walkable:(x,z,r=.3)=>nav.walkable(x,z,{r}),eyePos:()=>camera.position.clone().add(new THREE.Vector3(0,-.25,0)),
  lockWalk:on=>{o.roam.walkLock=on||!!C.pose||!!C.view;},gotCamera:()=>{C.inv.camera=true;mark('Alex’s camera, in your hand');},jamieArrives:()=>jamieArrives(),
  lookMap:at=>{closeLook({x:at.x,y:at.y,z:at.z},{back:.62,eye:1.42});C.view='look';C.lookAt=at;C.lookKind='map';later(9,()=>{if(C.view==='look'&&C.lookKind==='map')endLook();});}});
 const BIKE={jamie:()=>drive(-.9,5.6),sam:()=>drive(-2.1,6.4),you:()=>drive(1.3,5.4)};
 const WAITAT={jamie:[-1.15,11.2],sam:[-2.55,9.6]};
 function garageScene(){SG?.set?.(1);G5.build();G5.layTable();const sq=G5.samStand(0),sb=BIKE.sam();
  comp.putFoot(sam,sq.x,sq.z,driveA(0,0),{bike:{x:sb.x,z:sb.z,a:driveA(-2.1,6.4),kick:1}});
  // (Jamie is not here yet: he rides up the street a minute in, his backpack on; he and his bike wait out of sight round the bend)
  const jq=main(d0+46,-2.2);comp.putRiding(jamie,jq.x,jq.z,headingTo(jq.x,jq.z,main(d0,-2).x,main(d0,-2).z),0);jamie.follow=null;jamie.hidden=false;G5.wearBags({samBag:false});
  for(const c of [jamie,sam]){c.lookAt=null;c.lookPlayer=false;}
  const q=drive(-.2,.95),bk=BIKE.you();o.placePlayer({x:q.x,z:q.z,a:headingTo(q.x,q.z,sq.x,sq.z),mode:'walk',bike:{x:bk.x,z:bk.z,a:driveA(1.3,5.4)}});o.foot.arms=phys.arms;}
 // ---- the beginning ---------------------------------------------------------------------------------------------------------------
 function inventory(){C.inv.camera=true;ch4.ensureLead();C.inv.lead=ch4.leadIndex()>=0;}
 function begin(){fresh();go('c5-black');C.cardT=0;o.fade(1);common();dayWorld();comp.reset();minds();phys.reset();GT.setShut('swing');garageScene();objective('');T?.reset?.();C.h=HOUR.start;inventory();C.inv.camera=false;
  for(const c of [jamie,sam]){c.lookAt=null;c.lookPlayer=false;}}
 function opening(){go('d5-garage');date(C.h);C.fadeIn=0;C.g={t:0};
  say([{wait:1.2},{who:'SAM',text:'“Mom’s at work till six. She thinks we’re at Jamie’s.”',by:'sam',time:3},{who:'SAM',text:'“Come help me. I’ve got a list.”',by:'sam',time:2.2,face:'determined'}],
   {then:()=>{checkpoint('chapter5-start');C.flags.packReady=true;G5.startPacking();objective('Help Sam pack.','The supplies on the table. F picks one up; F on the bag puts it in.');}});}
 function jamieArrives(){if(C.flags.jamieComing)return;C.flags.jamieComing=true;C.flags.packed=true;objective('');const stop=BIKE.jamie(),mid=main(d0+8,-1.6);
  comp.run(jamie,[comp.steps.rideTo(jamie,[[mid.x,mid.z],[stop.x,stop.z]],{vmax:5.2,vend:0}),comp.steps.brake(jamie,.3),comp.steps.dismount(jamie),comp.steps.kickstand(jamie)],
   {then:()=>{const w=G5.TL(.86,.22,0);comp.run(jamie,[comp.steps.walkTo(jamie,[[w.x,w.z]],{speed:1.4}),comp.steps.turnTo(jamie,()=>headingTo(jamie.px,jamie.pz,me().x,me().z),.5)],{then:()=>departure()});}});
  later(3.2,()=>sound('curb',BIKE.jamie(),{gain:.6}));}
 const face=(c,f,hold=4)=>c.person.face?.set(f,{hold});
 function departure(){if(C.flags.departure)return;C.flags.departure=true;mark('Jamie’s backpack');const tg=C.t,GS=G5.S;
  stand(sam,G5.samStand(0),{look:()=>({x:jamie.px,z:jamie.pz,y:gy(jamie.px,jamie.pz)+1.3})});
  say([{who:'JAMIE',text:'“Sorry. Sorry, sorry. My mom.”',by:'jamie',face:'embarrassed'},{who:'SAM',text:'“Did you bring food?”',by:'sam',face:'unimpressed'},
   {who:'JAMIE',text:'“Yeah, I packed—”',by:'jamie',time:1.4,act:()=>{C.flags.bagOpen=true;G5.sockScene();}},
   {until:()=>(GS.sockShownAt!=null&&C.t-GS.sockShownAt>.9)||C.t-tg>12},{wait:.5},
   {who:'JAMIE',text:'“…I packed one sock.”',by:'jamie',time:2,face:'embarrassed',faces:{sam:'unimpressed'}},{wait:1.6,act:()=>{C.flags.bagSeen=true;face(sam,'unimpressed',5);mark('one sock');}},
   {wait:.2,act:()=>G5.barsScene()},{until:()=>GS.flags.barsTaken||C.t-tg>24},
   {who:'JAMIE',text:'“…Thanks.”',by:'jamie',time:1.3,face:'embarrassed'},{who:'SAM',text:'“You brought a sock.”',by:'sam',time:1.6,face:'unimpressed'},{who:'JAMIE',text:'“It’s a good sock.”',by:'jamie',time:1.6,face:'grin'},
   {until:()=>GS.flags.jamieReady||C.t-tg>34}],{then:()=>plan()});}
 // Sam opens the map on the table; the three of them work out the way, and why, and the rules
 function plan(){if(C.flags.plan)return;C.flags.plan=true;const tp=C.t;G5.openMap();const pt=(c,w,t)=>()=>comp.run(c,G5.pointAt(c,w,t),{then:()=>stand(c,c===sam?G5.samStand(0):G5.TL(.86,.22,0),{look:()=>G5.TL(0,0)})});
  say([{until:()=>G5.S.flags.mapOpen&&!sam.script||C.t-tp>6},{who:'SAM',text:'“Okay. This is us.”',by:'sam',time:1.4,act:pt(sam,'town',1.2)},
   {who:'SAM',text:'“Mill Street goes out past the sawhorse. Then it’s the Old Reservoir Road. Up over the ridge.”',by:'sam',time:3.6,act:pt(sam,'road',2.6)},
   {who:'JAMIE',text:'“And down to Pine Ridge. Where the TV said.”',by:'jamie',time:2.2,act:pt(jamie,'park',1.6)},{who:'YOU',text:'“Pine Ridge Recreation Area. It was on the sign. In his picture.”',time:2.6},
   {who:'SAM',text:'“Where they looked for Danny Whitcomb. In ninety-one. It was in the paper.”',by:'sam',time:3.2,face:'concerned'},
   {who:'SAM',text:'“My dad took us fishing out there once. It’s like four miles. Big hill.”',by:'sam',time:3},
   {who:'JAMIE',text:'“Alex rode out there. I know he did.”',by:'jamie',time:2.2,face:'determined'},{wait:.6},
   {who:'SAM',text:'“Last night. Under the theater. It said ‘come find him.’”',by:'sam',time:2.8,face:'worried'},{who:'SAM',text:'“What if that’s what it wants? Us. Out there.”',by:'sam',time:2.6,face:'worried'},
   {who:'JAMIE',text:'“Then Alex is out there too.”',by:'jamie',time:2,face:'determined'},{who:'JAMIE',text:'“I’m going.”',by:'jamie',time:1.2,face:'determined'},{wait:.8},
   {who:'SAM',text:'“…I know. I packed, didn’t I?”',by:'sam',time:2,face:'unimpressed'},{who:'SAM',text:'“We stay together. We look. We’re back before dark.”',by:'sam',time:2.8,face:'determined'},
   {who:'JAMIE',text:'“Before dark. Deal.”',by:'jamie',time:1.4,face:'happy'}],
   {then:()=>{C.flags.leave=true;C.g.leaveAt=C.t;objective('Ride to Pine Ridge.','Mill Street north, past the sawhorse. Then the Old Reservoir Road.');toBikes();}});}
 // Out to the bikes, each on his own: Sam folds the map into his bag and shoulders it; Jamie goes first; each walks to
 // his bike, kicks the stand up, gets on, and rolls down to the end of the driveway to wait for you.
 function toBike(c,delay){later(delay,()=>{const b=BIKE[c.key](),a=c.ba,side={x:c.bx-Math.cos(a)*.43,z:c.bz-Math.sin(a)*.43},path=nav.walkPath({x:c.px,z:c.pz},side),w=drive(...WAITAT[c.key]);void b;
  stand(c,null);comp.run(c,[comp.steps.walkTo(c,path.length?path:[[side.x,side.z]],{speed:1.35}),comp.steps.turnTo(c,()=>c.ba,.5),comp.steps.kickUp(c),comp.steps.mount(c,.85),comp.steps.wait(.4),
   comp.steps.rideTo(c,[[w.x,w.z]],{vmax:1.8,vend:0}),comp.steps.brake(c,.3)],{then:()=>{c.follow=null;C.flags['ready-'+c.key]=C.t;mark(c.key+' waiting on his bike');}});});}
 function toBikes(){G5.foldMap();toBike(jamie,1.2);later(.2,()=>{const go2=()=>{if(G5.S.flags.mapAway||C.t-C.g.leaveAt>9)toBike(sam,.4);else later(.25,go2);};go2();});}
 function updateGarage(dt){const X=C.g;X.t+=dt;const p=me();G5.update(dt);
  if(C.flags.leave){const ready=C.flags['ready-jamie']&&C.flags['ready-sam'];
   // you get going: they come with you (each answering when he sees you go)
   if(p.riding&&ready&&!C.flags.rolling&&p.speed>.6){C.flags.rolling=true;follow(true);for(const c of [jamie,sam])c.follow='ride';}
   if(p.riding){C.rideT=(C.rideT||0)+dt;const L=where(p),away=L.street==='main'?Math.abs(L.d-d0)>24:true;if(away||C.rideT>40)toReservoirRoad();}
   const since=C.t-Math.max(C.flags['ready-jamie']||1e9,C.flags['ready-sam']||1e9);
   if(ready&&!p.riding&&since>18&&!C.flags.goNudge&&!busy()){C.flags.goNudge=true;say([{who:'JAMIE',text:'“Come ON. It’s a long ride.”',by:'jamie'}]);}
   if(ready&&!p.riding&&since>55&&!C.flags.goNudge2&&!busy()){C.flags.goNudge2=true;say([{who:'SAM',text:'“You coming? Your bike’s right there.”',by:'sam'}]);}
   if(C.t-(X.leaveAt??C.t)>160&&!p.riding)toReservoirRoad();}}// (counted from "Ride to Pine Ridge.": a bounded recovery, never sooner)
 // Out of Oak Hollow, through town: the next you see of it is Mill Street's end, the sawhorse behind you.
 function toReservoirRoad(){if(C.flags.toRoad||C.fadeOut>=0)return;C.flags.toRoad=true;mark('the ride out');C.fadeOut=0;
  C.after=()=>{go('d5-ride');C.h=Math.max(C.h,HOUR.ride);C.minute=-1;date(C.h);ridePlace(-6.5,3.2);checkpoint('c5-ride');C.fadeIn=0;later(1.2,raceOffer);};}
 // (on Mill Street's last stretch, past its LOCAL TRAFFIC ONLY sawhorse, which stands behind them)
 function ridePlace(n0,speed){const a=0;youRide(W5(.9,n0),a,speed);boyRide(jamie,W5(2.2,n0-3.6),a,speed);boyRide(sam,W5(-.8,n0-5.4),a,speed);follow(true);}
 // ---- the Old Reservoir Road: the race to the top of the ridge ------------------------------------------------------------------
 const ORR=ROADS.orr,CREST_S=213;
 const orrS=(x,z)=>{const q=ORR.project(x,z,9);return q?q.s:null;};
 function raceOffer(){if(C.race)return;C.race={start:C.t,winner:null,you:0,jamie:0,racing:false};
  say([{who:'JAMIE',text:'“Race you to the top. Loser buys slushies.”',by:'jamie',time:2.4},{who:'SAM',text:'“I’m not racing.”',by:'sam',time:1.4},{who:'JAMIE',text:'“Then you’re buying.”',by:'jamie',time:1.4,
   act:()=>{C.race.racing=true;mark('the race');raceLeg(orrS(jamie.bx,jamie.bz)??0);}}]);}
 // Jamie rides it in legs: flat out when you are ahead of him, easing off (looking back) when you are far behind, so it is a race
 function raceLeg(s0){const R=C.race;if(!R||R.winner||jamie.mode!=='ride'){jamie.follow='ride';return;}const p=me(),ys=orrS(p.x,p.z)??0,lead=s0-ys;
  const vmax=lead<0?6.6:lead>24?4.6:lead>10?5.4:5.9,end=Math.min(CREST_S+14,s0+46),pts=[];for(let s=Math.max(4,s0+6);s<=end;s+=8){const q=ORR.at(s,1.1);pts.push([q.x,q.z]);}
  if(lead>24&&!R.lookBack&&!busy()){R.lookBack=true;say([{who:'JAMIE',text:'“Come ON! You’re not even trying!”',by:'jamie'}]);}
  if(!pts.length){jamie.follow='ride';return;}comp.run(jamie,[comp.steps.rideTo(jamie,pts,{vmax,vend:end>=CREST_S+14?2.2:vmax})],{then:()=>{if(end>=CREST_S+14)jamie.follow='ride';else raceLeg(end);}});}
 function updateRide(dt){const p=me(),R=C.race;
  if(S.pt>480&&!C.flags.arrived&&C.fadeOut<0&&!C.flags.rideCarried){C.flags.rideCarried=true;mark('carried on: the ride');C.fadeOut=0;C.after=()=>{placeOnOrr(280,3.2);C.fadeIn=0;arrive();};}
  if(R&&!R.winner&&R.racing){const ys=orrS(p.x,p.z),js=orrS(jamie.bx,jamie.bz);if(ys!=null)R.you=Math.max(R.you,ys);if(js!=null)R.jamie=Math.max(R.jamie,js);
   if(R.you>=CREST_S||R.jamie>=CREST_S){R.winner=R.you>=CREST_S&&R.you>=R.jamie-1?'you':'jamie';R.at=C.t;mark('the race: '+R.winner);
    if(R.winner==='you')say([{who:'JAMIE',text:'“No way. No WAY. You cheated.”',by:'jamie'},{who:'YOU',text:'“How do you cheat at riding a bike?”',time:2},{who:'JAMIE',text:'“…I’ll figure it out.”',by:'jamie'}],{then:crestView});
    else if(R.jamie-R.you>45)say([{who:'JAMIE',text:'“You weren’t even trying!”',by:'jamie'},{who:'JAMIE',text:'“Slushies. You owe me.”',by:'jamie'}],{then:crestView});
    else say([{who:'JAMIE',text:'“Slushies! You owe me slushies!”',by:'jamie'},{who:'YOU',text:'“You started early.”',time:1.5},{who:'JAMIE',text:'“I started GOOD.”',by:'jamie'}],{then:crestView});}}
  // the ridge, by any way of getting there
  const s=orrS(p.x,p.z);if(s!=null&&s>CREST_S+18&&!C.flags.crest)crestView();
  if((s!=null&&s>292)||near(SPOT.entrance,16))arrive();}
 function crestView(){if(C.flags.crest)return;C.flags.crest=true;mark('the reservoir, from the ridge');
  later(.6,()=>say([{who:'SAM',text:'“There it is.”',by:'sam',time:1.6},{who:'JAMIE',text:'“It’s bigger than I remember.”',by:'jamie'}]));}
 function arrive(){if(C.flags.arrived)return;C.flags.arrived=true;go('d5-park');C.h=Math.max(C.h,HOUR.arrive);date(C.h);checkpoint('c5-arrival');mark('Pine Ridge');C.flags.crest=true;
  say([{wait:.6},{who:'SAM',text:'“Pine Ridge Park.”',by:'sam',time:1.6},{who:'JAMIE',text:'“The one in his picture says Recreation Area.”',by:'jamie'},{who:'SAM',text:'“Then it’s an old picture. Or an old sign.”',by:'sam'}],
   {then:()=>{if(!C.flags.locked)objective('Leave the bikes at the rack.','By the parking lot.');}});}
 // ---- the park: the bikes locked to the rack -----------------------------------------------------------------------------------------
 function lockBikes(){if(C.flags.locked)return;C.flags.locked=true;mark('the bikes, locked');objective('');const R=SPOT.rack;
  rackBikes();PK.lay();
  const r=o.roam,mid=W5(RACK[1].e,RACK[1].n);if(Math.hypot(r.x-mid.x,r.z-mid.z)<16){r.x=mid.x;r.z=mid.z;r.a=RACK[1].a;}
  sound('chain',rackSpot(),{gain:.8});void R;
  say([{who:'SAM',text:'“My dad’s cable lock.”',by:'sam',time:1.6},{who:'JAMIE',text:'“Who’s gonna steal THESE?”',by:'jamie'},{who:'SAM',text:'“People steal everything.”',by:'sam'},
   {wait:1.6},{who:'JAMIE',text:'“Bet I can skip a rock farther than both of you.”',by:'jamie'}],
   {then:()=>{go('d5-stones');objective('Skip stones with Jamie.','The flat stones by the shore, past the picnic shelter.');stand(jamie,STONE_J,{look:()=>W5(...STONE_AIM),leash:40});stand(sam,STONE_S,{look:()=>W5(...STONE_AIM),leash:40});}});}
 // ---- skipping stones (chapter5-park.js): three rounds, Jamie, you, Sam; each picks up his own stone and throws it ----------
 const STONES=SPOT.shoreStones,STONE_J=[STONES[0]-2.2,STONES[1]-2.4],STONE_S=[STONES[0]+1.5,STONES[1]],STONE_AIM=[STONES[0]-7.2,STONES[1]+14.2];
 const JAMIE_SKIPS=[3,4,2],SAM_SKIPS=[0,2,6];
 const GT=createGates({phys,comp,sound:(n,p,op)=>sound(n,p,op),lockWalk:on=>{o.roam.walkLock=on||!!C.pose||!!C.view;},walkPath:(c,q)=>{const pth=nav.walkPath({x:c.px,z:c.pz},q);return pth.length?pth:[[q.x,q.z]];},opened:by=>mark('the yellow gate opened: '+by),me:()=>me()});
 const PK=createPark({scene,phys,comp,jamie,sam,camera,W5,BEACH:STONES,self:o.self,ring:(x,z,b)=>ring(x,z,b),sound:(n,p,op)=>sound(n,p,op),held:c=>!!o.held?.(c),
  lockWalk:on=>{o.roam.walkLock=on||!!C.pose||!!C.view;},surface:(x,z)=>nav.surface(x,z),pace:k=>o.setPace?.(k),aimPoint:()=>W5(...STONE_AIM),spotId:()=>A.spot?.()?.id,
  walkPath:(c,q)=>{const pth=nav.walkPath({x:c.px,z:c.pz},q);return pth.length?pth:[[q.x,q.z]];},thrown:(who,n,turn)=>afterThrow(who,n,turn)});
 // what you carry, used with your hands (the flashlight, Sam's batteries, the camera's shutter and flash, the shirt), and the inventory (I)
 let rtS=null;
 const GR=createGear({phys,comp,G5,jamie,sam,camera,foot:o.foot,self:o.self,shirt,sound:(n,p,op)=>sound(n,p,op),say:(l,op)=>say(l,op),later:(t,f)=>later(t,f),stand:(c,q,op)=>stand(c,q,op),busy:()=>busy(),mark:m=>mark(m),t:()=>C.t,
  inv:()=>C.inv,flags:()=>C.flags,lockWalk:on=>{o.roam.walkLock=on||!!C.pose||!!C.view;},held:on=>{C.invOpen=on;o.roam.walkLock=on||!!C.pose||!!C.view;},
  indoors:()=>!!inAny(),canDie:()=>S.phase==='d5-camp',darkness:()=>clamp(1-sky().day,0,1)*.85+(inAny()?.15:0),beside:(sd,f,d)=>camBeside(sd,f,d)(),
  walkPath:(c,q)=>{const pth=nav.walkPath({x:c.px,z:c.pz},q);return pth.length?pth:[[q.x,q.z]];},eye:()=>camera.position.clone(),headingToEye:c=>headingTo(c.px,c.pz,camera.position.x,camera.position.z),headingTo:(c,v)=>headingTo(c.px,c.pz,v.x,v.z),
  render:(w,h)=>{if(!(o.shoot&&o.readPixels&&typeof THREE.WebGLRenderTarget==='function'))return null;try{rtS||=new THREE.WebGLRenderTarget(w,h,{colorSpace:THREE.SRGBColorSpace});const cam=photo.cam||new THREE.PerspectiveCamera(50,4/3,.05,200);
   cam.position.copy(camera.position);cam.quaternion.copy(camera.quaternion);cam.fov=46;cam.aspect=4/3;cam.near=.05;cam.updateProjectionMatrix();cam.updateMatrixWorld();return GR.hidden(()=>o.shoot({cam,target:rtS}))?{px:o.readPixels(rtS,w,h),w,h}:null;}catch{return null;}},
  items:st=>invItems(st),use:(id,inv)=>{if(id==='camera'){inv.close();key('KeyV',false);}}});
 function invItems(st){const carry=[],found=[],F=st.flashlight;
  if(C.inv.camera)carry.push({id:'camera',name:'Alex’s camera',state:'in your pocket',note:'V: his pictures, and the ones you take',action:'Look at the pictures'});
  if(F.have)carry.push({id:'flashlight',name:'Flashlight',state:F.dead?'dead':F.hand?(F.on?'on · in your hand':'off · in your hand'):'in your pocket',note:F.dead?'The batteries are dead.':'T: on and off',action:F.hand?'Put it away':'Take it out'});
  const n=photo.photos?.length||0;if(C.inv.camera&&n)found.push({id:'photos',name:`Alex’s pictures (${n})`,note:C.photos.length?`${C.photos.length} of them taken today, by you`:'The last ones he took. Pine Ridge.'});
  if(G5.S.flags.mapAway||C.flags.departure)found.push({id:'map',name:'The county map',note:'Folded in Sam’s back pocket. His pencil line: Mill Street, the Old Reservoir Road, Pine Ridge.'});
  if(C.clues.has('register'))found.push({id:'register',name:'The camp register, 1991',note:C.photos.includes('register3')?'Photographed. August 24, 1991: two bike tracks at the service gate.':'In the camp office.'});
  if(C.clues.has('searchmap'))found.push({id:'searchmap',name:'The search map',note:'Grid seven circled. The pump house.'});
  if(C.clues.has('pantry'))found.push({id:'pantry',name:'The lodge pantry',note:'Cans gone from the dust. Recently.'});
  if(C.inv.shirt)found.push({id:'shirt',name:'Alex’s shirt',note:'Gold. The one from the flyers. Wet. In Sam’s bag.'});
  if(G5.S.sockShownAt!=null||C.flags.departure)found.push({id:'sock',name:'Jamie’s sock',note:'One. In Jamie’s bag, “for emergencies.”'});
  return {carry,found};}
 const NUM=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve'];
 function stonesStart(){if(C.st)return;C.st={round:0,turn:'jamie',busy:false,t:0,done:false,wait:0};mark('skipping stones');PK.S.turn='jamie';
  say([{who:'JAMIE',text:'“Watch. Flat ones. Watch the master.”',by:'jamie',face:'grin'}],{then:()=>throwBy(jamie)});}
 function throwBy(c){const X2=C.st;if(!X2||X2.busy||X2.done)return;X2.busy=true;PK.S.turn=c.key;const want=(c===jamie?JAMIE_SKIPS:SAM_SKIPS)[X2.round];
  stand(c,null);PK.friendThrow(c,{want,hard:c===jamie?.97:.62+X2.round*.19,low:c===sam&&X2.round>=2?.3:0,at:()=>W5(...(c===jamie?STONE_J:STONE_S)),then:n=>afterThrow(c.key,n,true)});}
 // what they say is what the stone did
 function afterThrow(who,n,turn){const X2=C.st;if(!X2||X2.done)return;// (the game over, a stone still in the air says nothing)
  if(who==='you'&&turn&&(X2.turn!=='you'||X2.youThrew))turn=false;if(who==='you'&&turn)X2.youThrew=true;// (one counts on your turn: the first to come down)
  if(who==='you'&&!turn){if(!C.flags.extraThrow&&!busy()){C.flags.extraThrow=true;say([{who:'JAMIE',text:n>3?'“Hey! That one doesn’t count.”':'“Wait your turn!”',by:'jamie',face:'amused'}]);}return;}
  X2.busy=false;const r=X2.round,num=n<=0?null:NUM[Math.min(n,12)];
  if(who==='jamie'){const L=[[{who:'JAMIE',text:`“${num||'Okay that one'}${num?'. Beat that.':' was a warm-up.'}”`,by:'jamie',face:'grin'}],[{who:'JAMIE',text:n>=4?`“${num.toUpperCase()}. ${num}! Did you see that?”`:`“${num||'Ugh'}. The wind.”`,by:'jamie',face:n>=4?'happy':'frustrated'}],n<=2?[{who:'JAMIE',text:'“That didn’t count. My foot slipped.”',by:'jamie',face:'embarrassed'}]:[{who:'JAMIE',text:`“${num}. Still the master.”`,by:'jamie',face:'grin'}]][r];
   say(L,{then:()=>{X2.turn='you';PK.S.turn='you';X2.wait=0;X2.youThrew=false;stand(jamie,STONE_J,{look:()=>camera.position,leash:40});if(r===0&&!C.flags.throwTip){C.flags.throwTip=true;say([{who:'SAM',text:'“Pick a flat one. Throw it low, sideways. Get down low.”',by:'sam',time:2.8}]);}}});}
  else if(who==='you'){const line=n<0?[{who:'JAMIE',text:'“That was the beach. You threw it at the beach.”',by:'jamie',face:'amused'}]:n===0?[{who:'JAMIE',text:'“That was a rock. That was just a rock.”',by:'jamie',face:'amused'}]:n<=2?[{who:'JAMIE',text:`“${num}. Ehh.”`,by:'jamie',time:1.2}]:n<=4?[{who:'JAMIE',text:`“${num}. Okay. Not bad.”`,by:'jamie',face:'surprised'}]:[{who:'JAMIE',text:`“${num}?! WHOA. Okay. OKAY.”`,by:'jamie',face:'shocked'}];
   say(line,{then:()=>{X2.turn='sam';PK.S.turn='sam';later(.6,()=>throwBy(sam));}});}
  else{const L=[[{who:'SAM',text:'“I don’t really do this.”',by:'sam',face:'embarrassed'},{who:'JAMIE',text:'“That was a rock, Sam. You threw a rock.”',by:'jamie',face:'amused'}],[{who:'SAM',text:`“…${num||'Zero'}.”`,by:'sam'}],
    n>=4?[{who:'JAMIE',text:`“Sam— ${num.toUpperCase()}?”`,by:'jamie',time:1.3,face:'shocked'},{who:'SAM',text:'“…Physics.”',by:'sam',time:1.4,face:'amused'}]:[{who:'SAM',text:`“…${num||'Zero'}. I’m consistent.”`,by:'sam',face:'unimpressed'}]][r];
   say(L,{then:()=>{X2.round++;stand(sam,STONE_S,{look:()=>W5(...STONE_AIM),leash:40});if(X2.round>=3)stonesEnd();else{X2.turn='jamie';PK.S.turn='jamie';later(.8,()=>throwBy(jamie));}}});}}
 function stonesEnd(){const X2=C.st;if(X2.done)return;X2.done=true;C.flags.stones=true;PK.S.done=true;PK.S.free=true;PK.S.turn=null;mark('stones done');const B=PK.S.best,you=B.you;
  say([...(you>B.jamie&&you>B.sam?[{who:'JAMIE',text:'“Okay, you win. This time.”',by:'jamie',face:'frustrated'}]:B.sam>=B.jamie?[{who:'JAMIE',text:'“Sam wins. Sam. That’s so wrong.”',by:'jamie',face:'frustrated'}]:[{who:'JAMIE',text:'“Master. Like I said.”',by:'jamie',face:'grin'}]),
   {wait:1.4},{who:'JAMIE',text:'“Alex could do like ten.”',by:'jamie',time:2,face:'sad'},{wait:1.2},{who:'SAM',text:'“…Remember the shoe?”',by:'sam',time:1.8,face:'hopeful'}],
   {then:()=>{go('d5-dock');objective('Sit at the end of the dock.');for(const c of [jamie,sam])stand(c,null);follow(true);}});}
 function stonesForfeit(){const X2=C.st;if(!X2||X2.done)return;X2.done=true;C.flags.stones=true;C.flags.forfeit=true;PK.S.done=true;PK.S.free=true;
  say([{who:'JAMIE',text:'“Fine. Forfeit. I win.”',by:'jamie',face:'grin'},{wait:1},{who:'SAM',text:'“…Remember the shoe?”',by:'sam'}],{then:()=>{go('d5-dock');objective('Sit at the end of the dock.');for(const c of [jamie,sam])stand(c,null);follow(true);}});}
 function updateStones(dt){const X2=C.st;if(!X2){if(near(STONES,7))stonesStart();else if(S.pt>70&&!C.flags.stoneNudge&&!busy()){C.flags.stoneNudge=true;say([{who:'JAMIE',text:'“Over HERE. By the water. The flat ones.”',by:'jamie'}]);}
   if(S.pt>140&&near(STONES,30))stonesStart();return;}
  X2.t+=dt;if(!X2.done&&!near(STONES,22)&&!PK.holding)stonesForfeit();
  // your turn: hints first, then (if you still have not) Jamie goes again; nothing is thrown for you
  if(X2.turn==='you'&&!X2.busy&&!busy()&&!PK.winding&&!PK.S.flying.length){X2.wait+=dt;
   if(X2.wait>14&&!X2.nudged){X2.nudged=true;say([{who:'JAMIE',text:PK.holding?'“Throw it already. Hold it back, and let go.”':'“Your turn. Grab a rock.”',by:'jamie'}]);}
   if(X2.wait>40){X2.nudged=false;X2.wait=0;S.youSkipped=(S.youSkipped||0)+1;PK.S.you.push(null);X2.turn='sam';PK.S.turn='sam';say([{who:'JAMIE',text:'“You snooze, you lose. Sam.”',by:'jamie'}],{then:()=>throwBy(sam)});}}
  else if(X2.turn!=='you')X2.wait=0;}
 // ---- the end of the dock: Alex and the shoe; the three of you sat on its edge, legs over the water ------------------------
 const DOCK=DOCKS[0],DOCK_END=SPOT.dockEnd,DOCK_F=frameOf(DOCK.root,DOCK.a);
 const dockY=()=>DOCK.y;
 // seats along the end of the dock (lx across it): you in the middle, Jamie on your left, Sam on your right
 const DOCK_SEAT=lx=>{const [e,n]=DOCK_F.to(lx,DOCK.len-.36);return W5(e,n,dockY());};
 const SEAT_X={you:0,jamie:-.5,sam:.5};// (shoulder to shoulder, all three on the deck: up again, nobody stands over the edge)
 function sitDock(){if(C.flags.dock)return;C.flags.dock=true;go('d5-dock');objective('');mark('the dock');const yaw=DOCK.a,sq=DOCK_SEAT(SEAT_X.you),fx=Math.sin(yaw),fz=-Math.cos(yaw);
  // (your eye where a seated kid's is: over the seat and a little forward of it)
  pose({x:sq.x+fx*.09,z:sq.z+fz*.09},{y:dockY()+.69,yaw,pitch:-.12});C.pose.seat={x:sq.x,z:sq.z,y:dockY(),a:yaw,legs:'hang',hands:'deck'};
  for(const c of [jamie,sam]){const q=DOCK_SEAT(SEAT_X[c.key]),front={x:q.x-fx*.55,z:q.z-fz*.55},already=c.seated;stand(c,null);const pth=nav.walkPath({x:c.px,z:c.pz},front);
   comp.run(c,[...(already?[]:[comp.steps.walkTo(c,pth.length?pth:[[front.x,front.z]],{speed:1.1}),comp.steps.turnTo(c,yaw,.5)]),
    phys.sit(c,{seat:()=>({...DOCK_SEAT(SEAT_X[c.key]),a:yaw}),legs:'hang',hands:'deck',until:()=>C.flags.dockUp,look:()=>c===jamie?(sam.talk>0?{x:sam.px,z:sam.pz}:camera.position):(jamie.talk>0?{x:jamie.px,z:jamie.pz}:camera.position)}),
    phys.rise(c,{legs:'hang',h:0,back:-.5}),comp.steps.walkTo(c,[[W5(...DOCK_F.to(0,DOCK.len-2.4)).x,W5(...DOCK_F.to(0,DOCK.len-2.4)).z]],{speed:1})],{then:()=>{stand(c,null);follow(true);}});}
  say([{until:()=>jamie.seated&&sam.seated||C.t-C.dockAt>9},{wait:2.4},{who:'JAMIE',text:'“He fished off this dock for three hours.”',by:'jamie',face:'amused'},{who:'JAMIE',text:'“Three hours. And he caught one shoe.”',by:'jamie',face:'grin'},
   {who:'SAM',text:'“Gary.”',by:'sam',time:1.2,face:'amused'},{who:'YOU',text:'“He named it Gary.”',time:1.6},
   {who:'JAMIE',text:'“‘Guys. Guys. I caught Gary.’ Like it was a fish.”',by:'jamie',time:3,face:'happy'},{who:'SAM',text:'“He kept it. It’s on the shelf in his garage. With the trophies.”',by:'sam',time:3,face:'happy'},
   {who:'JAMIE',text:'“It’s his best trophy.”',by:'jamie',time:1.8,face:'happy'},{wait:2.6},{who:'JAMIE',text:'“We came here like four times last summer.”',by:'jamie',time:2.2,face:'sad'},{who:'SAM',text:'“Five.”',by:'sam',time:1.2,face:'sad'},
   {wait:2},{who:'YOU',text:'“He was here. In the picture, he was here.”',time:2.2},{who:'SAM',text:'“Then let’s find where.”',by:'sam',time:1.6,face:'determined'},{wait:.6,act:()=>{C.flags.dockUp=true;}},{wait:1.4}],
   {then:()=>{unpose();signStart();}});C.dockAt=C.t;}
 // ---- the place in the picture ---------------------------------------------------------------------------------------------------------
 const signHead=()=>{const q=W5(...SPOT.oldSign);return {x:q.x,y:q.y+1.7,z:q.z};};
 function signStart(){go('d5-sign');checkpoint('c5-sign-search');C.sign={t:0,matchT:0,hints:0,opened:false};objective('Find where Alex’s picture was taken.','Alex’s camera: V.');mark('the picture');}
 function updateSign(dt){const X=C.sign;X.t+=dt;const p=me();if(C.view==='camera'&&photo.current?.lead)X.opened=true;
  // (after a while it gets easier to line up: stand near the spot, hold the camera up toward the sign)
  const easy=X.t>240,atVantage=near(SPOT.vantage,easy?7:4.4),looking=k.camLooksAt(signHead(),easy?.86:.93);
  if(C.view==='camera'&&photo.current?.lead&&atVantage&&looking)X.matchT+=dt;else X.matchT=Math.max(0,X.matchT-dt*2);
  if(X.matchT>(easy?.6:1.1)){photoMatch();return;}
  if(near(SPOT.oldSign,9)&&!C.flags.signNear&&!busy()){C.flags.signNear=true;say(C.view==='camera'?[{who:'JAMIE',text:'“Stand where he— where the camera was.”',by:'jamie'}]:[{who:'JAMIE',text:'“Is this it? Check the picture.”',by:'jamie'}]);}
  const hint=(t,lines)=>{if(X.t>t&&X.hints<lines.i&&!busy()){X.hints=lines.i;say(lines.l);}};
  if(!X.opened)hint(30,{i:1,l:[{who:'SAM',text:'“Look at the picture again. On the camera.”',by:'sam'}]});
  hint(60,{i:2,l:[{who:'JAMIE',text:'“The sign in his picture is brown. Wood. Not like the one at the road.”',by:'jamie',time:3}]});
  hint(95,{i:3,l:[{who:'SAM',text:'“There’s a gate behind him. A yellow one.”',by:'sam'}]});
  hint(130,{i:4,l:[{who:'JAMIE',text:'“And a gray shed. Up past the lawn, maybe?”',by:'jamie'}]});
  if(X.t>170&&X.hints<5&&!busy()){X.hints=5;say([{who:'JAMIE',text:'“Over here! Up here!”',by:'jamie'}]);stand(jamie,ALEX_STOOD,{look:()=>camera.position,leash:60});stand(sam,[SPOT.vantage[0]+1.2,SPOT.vantage[1]-.8],{look:()=>signHead(),leash:60});}
  // (and then plainer and plainer, never done for you: the match is yours to see)
  if(X.t>240&&X.hints<6&&!busy()){X.hints=6;objective('Hold up Alex’s camera where Jamie is standing.','V: the camera. Look at the old sign through it.');say([{who:'SAM',text:'“Stand where Jamie is. Hold the camera up. Look at the sign.”',by:'sam',time:3}]);}
  if(X.t>(X.again||330)&&!busy()){X.again=X.t+90;say([{who:'JAMIE',text:near(SPOT.vantage,9)?'“Camera up. Right here.”':'“Up here! By the old sign!”',by:'jamie'}]);}
  // (looking at it without the camera up, at the right spot, long enough: they tell you to compare)
  if(atVantage&&looking&&C.view!=='camera'&&!C.flags.compareTip&&!busy()){C.flags.compareTip=true;say([{who:'SAM',text:'“Hold up the camera. Compare.”',by:'sam'}]);}void p;}
 function photoMatch(){if(C.flags.match)return;C.flags.match=true;const tm=C.t;mark('the place in the picture');T?.set?.(.12,{rise:.02,why:'the place in the picture'});
  stand(jamie,ALEX_STOOD,{look:()=>camera.position,keep:true});stand(sam,[SPOT.vantage[0]+1.3,SPOT.vantage[1]-.6],{look:()=>{const a2=W5(...ALEX_STOOD);return {x:a2.x,y:a2.y+1.3,z:a2.z};},keep:true});
  say([{who:'SAM',text:'“…This is it.”',by:'sam',time:1.6},{who:'JAMIE',text:'“This is exactly it.”',by:'jamie',time:1.6},{wait:1.4},
   {until:()=>Math.hypot(jamie.px-W5(...ALEX_STOOD).x,jamie.pz-W5(...ALEX_STOOD).z)<1.4||C.t-tm>8},{who:'JAMIE',text:'“He was standing right here.”',by:'jamie',time:2},
   {who:'SAM',text:'“Walking toward—”',by:'sam',time:1.3},{who:'YOU',text:'“Toward whoever had the camera.”',time:2},{wait:1.8},
   {who:'SAM',text:'“Where does that road go?”',by:'sam',time:1.8}],
   {then:()=>{go('d5-map');objective('Find out where the road goes.','The trail map, by the parking lot. Or the road itself.');for(const c of [jamie,sam])stand(c,null);follow(true);}});}
 // ---- the trail map; the yellow gate ----------------------------------------------------------------------------------------------------
 const KIOSK=[-108,318.5];
 function readMap(){if(C.flags.map)return;C.flags.map=true;mark('the trail map');const g=PN.anchors.kiosk;g.updateMatrixWorld(true);const c=new THREE.Vector3(0,1.45,-.06).applyMatrix4(g.matrixWorld);closeLook({x:c.x,y:c.y,z:c.z},{back:1.25,eye:1.45});
  stand(jamie,camBeside(1,.2,.9),{look:()=>c});stand(sam,camBeside(-1,.2,.9),{look:()=>c});
  say([{wait:.8},{who:'SAM',text:'“The road goes up the shore. To… Camp Whippoorwill.”',by:'sam',time:2.6},{who:'SAM',text:'“‘Youth camp. Permit only.’”',by:'sam',time:2},
   {who:'JAMIE',text:'“Somebody taped CLOSED on it.”',by:'jamie'},{who:'YOU',text:'“A summer camp.”',time:1.4},{who:'JAMIE',text:'“Why would Alex go to a summer camp?”',by:'jamie'}],
   {then:()=>{unpose();for(const c of [jamie,sam])stand(c,null);follow(true);go('d5-gate');objective('Go up the road.','Through the yellow gate, at the old lot.');}});}
 const GATE=SPOT.gate,GATE_IN=[GATE[0]-.4,GATE[1]+3.2],GATE_OUT=[GATE[0]+.6,GATE[1]-3.4];
 function atGate(){if(C.flags.gate)return;C.flags.gate=true;go('d5-gate');checkpoint('c5-gate-decision');objective('');mark('the yellow gate');C.gt={t:0};
  stand(sam,GATE_OUT,{look:()=>({x:jamie.px,z:jamie.pz,y:gy(jamie.px,jamie.pz)+1.3}),keep:true,leash:40});
  // Jamie doesn't wait to be asked: he goes for the latch and walks the arm round (unless you've opened it), and through
  const through=()=>{if(!C.flags.road)stand(jamie,GATE_IN,{look:()=>camera.position,keep:true,leash:40});};/* (an arm held up past the scene finishes late: then he just follows) */
  if(GT.opening('swing'))through();else{stand(jamie,null);if(!busy())say([{who:'JAMIE',text:'“It’s not even locked.”',by:'jamie',time:1.4,face:'grin'}]);GT.friendOpen(jamie,'swing',{then:through});}
  const tg=C.t;say([{until:()=>GT.isOpen('swing')&&Math.hypot(jamie.px-W5(...GATE_IN).x,jamie.pz-W5(...GATE_IN).z)<1.6||C.t-tg>16},{who:'JAMIE',text:'“Come on.”',by:'jamie',time:1.2},
   {who:'SAM',text:C.flags.map?'“It says closed. It says no access.”':'“It says authorized vehicles only.”',by:'sam'},{who:'JAMIE',text:'“We’re not vehicles.”',by:'jamie',time:1.4},
   {who:'SAM',text:'“Nobody knows we’re here, Jamie. Nobody.”',by:'sam'},{who:'JAMIE',text:'“Alex was HERE.”',by:'jamie',time:1.6}],{then:()=>{C.flags.choose=true;C.gt.t=0;}});}
 function choose(how){if(C.choice||!C.flags.choose)return;C.choice=how;mark('the gate: '+how);
  const end=()=>{go('d5-road');objective('Follow the road.','Along the shore.');for(const c of [jamie,sam])stand(c,null);follow(true);C.flags.road=true;};
  if(how==='jamie')say([{who:'YOU',text:'“We’re just going to look.”',time:1.6},{wait:.8},{who:'SAM',text:'“…Fine. But nobody goes anywhere alone. Okay?”',by:'sam'},{who:'JAMIE',text:'“Buddy system.”',by:'jamie',time:1.4}],{then:end});
  else say([{who:'YOU',text:'“What do you want to do?”',time:1.4},{who:'SAM',text:'“We look. If anything’s weird, we leave. No arguing.”',by:'sam',time:2.6},
   {who:'SAM',text:'“And we’re back at the bikes before dark.”',by:'sam'},{who:'YOU',text:'“Deal.”',time:1},{who:'JAMIE',text:'“Deal. Can we GO now?”',by:'jamie'}],{then:end});}
 function updateGate(dt){if(!C.flags.gate){if(near(GATE,7))atGate();
   else if(S.pt>90&&!C.flags.gateNudge&&!busy()){C.flags.gateNudge=true;say([{who:'JAMIE',text:'“The road. Past the yellow gate.”',by:'jamie'}]);}
   if(S.pt>170&&!C.flags.gateAhead&&!busy()){C.flags.gateAhead=true;say([{who:'JAMIE',text:'“Come ON. The gate. Up past the old lot.”',by:'jamie'}]);stand(jamie,[GATE[0]+1.4,GATE[1]-2.6],{look:()=>camera.position,leash:80});}
   if(S.pt>(C.gateAgain||300)&&!busy()){C.gateAgain=S.pt+120;say([{who:'SAM',text:'“The road’s through the yellow gate. We’re waiting.”',by:'sam'}]);}return;}
  if(C.flags.choose&&!C.choice){C.gt.t+=dt;const p=me(),gi=W5(...GATE_IN);if(Math.hypot(p.x-gi.x,p.z-gi.z)<2.2&&EN(p).n>GATE[1]+.6)choose('jamie');if(C.gt.t>30)choose('jamie');}}
 // ---- the gravel road; the camp gate -------------------------------------------------------------------------------------------------------
 const GRAVEL=ROADS.gravel;
 function updateRoad(dt){const p=me(),q=GRAVEL.project(p.x,p.z,8),s=q?.s??0;
  if(s>48&&!C.flags.r1&&!busy()){C.flags.r1=true;say([{who:'JAMIE',text:'“Why would he come all the way out here?”',by:'jamie'},{who:'SAM',text:'“Why would anybody?”',by:'sam'}]);}
  if(s>104&&!C.flags.r2&&!busy()){C.flags.r2=true;say([{who:'YOU',text:'“Power poles. No wires.”',time:1.6},{who:'SAM',text:'“Nobody’s been out here in forever.”',by:'sam'}]);}
  if(near(SPOT.campGate,7.5))campGate();
  if(S.pt>150&&!C.flags.roadNudge&&!busy()){C.flags.roadNudge=true;say([{who:'SAM',text:'“The camp’s at the end of the road. Along the shore.”',by:'sam'}]);}
  if(S.pt>270&&!C.flags.roadNudge2&&!busy()){C.flags.roadNudge2=true;say([{who:'JAMIE',text:'“Keep going. It can’t be much farther.”',by:'jamie'}]);}
  if(S.pt>480&&!C.flags.campIn)carry('road',[SPOT.campGate[0]+2.4,SPOT.campGate[1]-4],ha(-163.6,508,-170,520));void dt;}
 function campGate(){if(C.flags.campIn)return;C.flags.campIn=true;go('d5-camp');C.hMin=Math.max(C.hMin||0,HOUR.camp);/* (behind, the clock catches up a minute a second: it never skips) */checkpoint('c5-camp-gate');mark('the camp gate');C.trail=[];C.campAt=C.t;
  say([{who:'JAMIE',text:'“Camp Whippoorwill. Established 1961.”',by:'jamie',time:2.2},{who:'SAM',text:'“‘Stay with your buddy.’”',by:'sam',time:1.6},{wait:.8},
   {who:'SAM',text:'“Flashlights. For inside.”',by:'sam',time:1.6,act:()=>GR.handOut()},{who:'JAMIE',text:'“Office first.”',by:'jamie',time:1.2}],
   {then:()=>{objective('Look around the camp.','The office. The lodge. The cabins.');}});}
 // ---- the camp, by day ----------------------------------------------------------------------------------------------------------------------
 // What there is to find: the 1991 register and the search map (the office), the pantry (the lodge), the cabins (and a
 // flashlight with dead batteries). When the three kinds have been found, Jamie wants to sit down; and in time anyway.
 function clue(id){if(C.clues.has(id))return;C.clues.add(id);mark('found: '+id);
  const hist=C.clues.has('register')||C.clues.has('searchmap'),recent=C.clues.has('pantry'),cabin=C.clues.has('cabin');
  if(hist&&recent&&cabin&&!C.flags.fireOffer)later(4,fireOffer);}
 function fireOffer(){if(C.flags.fireOffer)return;C.flags.fireOffer=true;C.fireOfferAt=C.t;C.hMin=Math.max(C.hMin||0,HOUR.fire-.1);// (the clock, a minute a second if it is behind, on the walk down to the fire)
 
  say([{who:'JAMIE',text:'“Can we sit down? Just for a minute.”',by:'jamie'},{who:'SAM',text:'“…Yeah.”',by:'sam',time:1}],{then:()=>{objective('Sit down by the campfire.','The circle of logs, down by the water.');}});}
 // the doors F opens (they creak; nobody has opened them in a long time)
 function openDoor(key){if(DOORS[key]?.open>.5)return;DOORS[key].open=1;const b=BLD[key.replace('-back','')];sound('creak',roomV(b.id,0,b.d/2,1),{gain:.8});mark('opened: '+key);
  const first={office:[{who:'SAM',text:'“It’s not even locked.”',by:'sam'}],lodge:[{who:'JAMIE',text:'“Whoa.”',by:'jamie',time:1},{who:'SAM',text:'“The mess hall.”',by:'sam',time:1.4}],
   bluejay:[{who:'JAMIE',text:'“Bunk beds. Dibs on top.”',by:'jamie'}],cardinal:[{who:'SAM',text:'“They carved their names in everything.”',by:'sam'}],owl:[]}[key];if(first?.length&&!busy())say(first);}
 // the register: its pages, one at a time, on the counter (A / D), read aloud where it matters
 function regPos(){const R=PN.anchors.register,b=BLD.office,[e,n]=b.F.to(R.x+.4,-R.z);const w=W5(e,n);return {x:w.x,y:b.y+R.y+.085,z:w.z};}// (open, on top of its cover)
 function openRegister(){if(C.view)return;go('d5-camp');C.view='register';C.flags.reader=true;const r=regPos(),b=BLD.office,[e,n]=b.F.to(PN.anchors.register.x+.4,-PN.anchors.register.z+.62),q=W5(e,n),yaw=headingTo(q.x,q.z,r.x,r.z);
  pageG.position.set(r.x,r.y,r.z);pageG.rotation.set(0,-yaw,0);pageG.visible=true;const ey=b.y+b.floor+1.48;pose({x:q.x,z:q.z},{y:ey,yaw,pitch:Math.atan2(r.y-ey,Math.hypot(q.x-r.x,q.z-r.z))});showPage(C.page||0);stand(jamie,camBeside(1,.3,.7),{look:()=>r});stand(sam,camBeside(-1,.3,.7),{look:()=>r});mark('the register');}
 function showPage(i){C.page=clamp(i,0,REGISTER.length-1);if(page){page.g.clearRect(0,0,1024,730);try{registerPageArt(page.g,1024,730,C.page);}catch{}pageTex.needsUpdate=true;}
  if(!C.read.has(C.page)){C.read.add(C.page);const L={2:[{who:'SAM',text:'“‘Police called re: missing boy. Mill Street.’”',by:'sam',time:2.6},{who:'JAMIE',text:'“Danny Whitcomb. From the library.”',by:'jamie',time:2.2}],
    3:[{who:'SAM',text:'“August twenty-fourth.”',by:'sam',time:1.6},{who:'JAMIE',text:'“That’s today.”',by:'jamie',time:1.4},{who:'YOU',text:'“Twenty years ago today.”',time:1.8},
     {who:'SAM',text:'“‘Grid seven. Pump house. Two bike tracks at the service gate, fresh.’”',by:'sam',time:3.2},{who:'SAM',text:'“‘Both lead in. None out.’”',by:'sam',time:2.2},{wait:1},{who:'JAMIE',text:'“Two bikes.”',by:'jamie',time:1.4},
     {who:'SAM',text:'“Take a picture of it.”',by:'sam',time:1.4}],4:[{who:'JAMIE',text:'“‘Light in the cabins.’ After it closed.”',by:'jamie',time:2.4},{who:'SAM',text:'“Kids. People sneak in.”',by:'sam',time:1.8}]}[C.page];
   if(L)say(L);if(C.page>=3)clue('register');}}// (read aloud in turn, however fast the pages go)
 function closeRegister(){if(C.view!=='register')return;C.view=null;pageG.visible=false;unpose();if(!C.pose)o.roam.walkLock=false;if(!C.flags.fire)for(const c of [jamie,sam])stand(c,null);}
 function lookSearchMap(){if(C.flags.searchmap)return;C.flags.searchmap=true;const R=PN.anchors.searchMap,b=BLD.office,[e,n]=b.F.to(R.x,-R.z),w=W5(e,n),t={x:w.x,y:b.y+R.y,z:w.z};closeLook(t,{back:1.0,eye:1.42,floor:b.y+b.floor});
  stand(jamie,camBeside(1,.3,.75),{look:()=>t});stand(sam,camBeside(-1,.3,.75),{look:()=>t});C.view='look';C.lookAt=t;C.lookKind='searchmap';
  say([{who:'JAMIE',text:'“That’s a search map. Like in the newspaper.”',by:'jamie'},{who:'SAM',text:'“Grid seven’s circled. The pump house.”',by:'sam'},
   {who:'YOU',text:'“‘Bike tracks at gate. Eight twenty-four. Not followed up?’”',time:3},{who:'SAM',text:'“Nobody followed it up.”',by:'sam',time:1.6}],{then:()=>{clue('searchmap');endLook();}});}
 function endLook(){if(C.view!=='look')return;C.view=null;unpose();for(const c of [jamie,sam])stand(c,null);}
 function pantryPos(){const R=PN.anchors.pantryGap,b=BLD.lodge,[e,n]=b.F.to(R.x,-R.z),w=W5(e,n);return {x:w.x,y:b.y+R.y,z:w.z};}
 function lookPantry(){if(C.flags.pantry)return;C.flags.pantry=true;const t=pantryPos(),b=BLD.lodge,R=PN.anchors.pantryGap,[e,n]=b.F.to(R.x+1.05,-R.z),q=W5(e,n),ey=b.y+b.floor+1.42;
  pose({x:q.x,z:q.z},{y:ey,yaw:headingTo(q.x,q.z,t.x,t.z),pitch:Math.atan2(t.y-ey,Math.hypot(t.x-q.x,t.z-q.z))});C.view='look';C.lookAt=t;C.lookKind='pantry';
  stand(jamie,camBeside(1,.35,.7),{look:()=>t});stand(sam,camBeside(-1,.35,.7),{look:()=>t});T?.set?.(.16,{rise:.02,why:'the pantry'});
  say([{who:'JAMIE',text:'“These aren’t dusty.”',by:'jamie',time:1.6},{who:'SAM',text:'“There were more. You can see where they were. In the dust.”',by:'sam',time:3},
   {who:'JAMIE',text:'“Kids?”',by:'jamie',time:1},{who:'SAM',text:'“Kids don’t take soup.”',by:'sam',time:1.6},{wait:1.2},{who:'YOU',text:'“Somebody’s been eating here.”',time:1.8}],{then:()=>{clue('pantry');endLook();}});}
 function lookPhotos(){if(C.flags.photosLook)return;C.flags.photosLook=true;const b=BLD.lodge,[e,n]=b.F.to(0,-b.d/2+.4),w=W5(e,n),t={x:w.x,y:b.y+b.floor+1.7,z:w.z};closeLook(t,{back:1.6,eye:1.42,floor:b.y+b.floor});C.view='look';C.lookAt=t;C.lookKind='photos';
  say([{who:'SAM',text:'“Every summer. Sixty-four to ninety.”',by:'sam'},{who:'JAMIE',text:'“Look at the shorts. Look at the SHORTS.”',by:'jamie'},{who:'SAM',text:'“Then it just stops.”',by:'sam',time:1.6}],{then:()=>{clue('photos');endLook();}});}
 function lookCampMap(){if(C.flags.campMap)return;C.flags.campMap=true;const g=PN.anchors.mapBoard;g.updateMatrixWorld(true);const c=new THREE.Vector3(0,1.4,-.06).applyMatrix4(g.matrixWorld),t={x:c.x,y:c.y,z:c.z};closeLook(t,{back:1.3,eye:1.45});C.view='look';C.lookAt=t;C.lookKind='campmap';
  say([{who:'SAM',text:'“Office, lodge, the cabins. Robin, Bluejay, Cardinal, Wren, Heron, Owl.”',by:'sam',time:3.4},{who:'JAMIE',text:'“Pump house is down by the water. On the other side.”',by:'jamie',time:2.4}],{then:()=>{clue('campmap');endLook();}});}
 function ringBell(){const b=PN?.dyn?.bell;if(!b)return;b.v+=2.6;sound('oldBell',bellPos(),{gain:1});mark('the bell');
  if(!C.flags.bellRung){C.flags.bellRung=true;say([{who:'SAM',text:'“Don’t.”',by:'sam',time:.9},{who:'JAMIE',text:'“Dinner’s ready!”',by:'jamie',time:1.4},{who:'SAM',text:'“Jamie. Don’t.”',by:'sam',time:1.2}]);}}
 const bellPos=()=>{const s=SPOT.bell;const w=W5(s[0],s[1]);return {x:w.x,y:w.y+2.4,z:w.z};};
 // (the flashlight with dead batteries, and Sam's: chapter5-gear.js)
 // where you walked (for what walks it again later): every metre and a half, and how long you stood anywhere
 function recordTrail(dt){const p=me(),L=C.trail,last=L[L.length-1];if(!last||Math.hypot(last.x-p.x,last.z-p.z)>1.5){if(L.length<600)L.push({x:p.x,z:p.z,wait:0});C.stillT=0;}
  else{C.stillT=(C.stillT||0)+dt;if(C.stillT>2.5&&last)last.wait=Math.min(4,Math.max(last.wait,C.stillT*.5));}}
 function updateCamp(dt){const p=me();recordTrail(dt);
  const id=inAny();if(id&&!C.seen.has(id)){C.seen.add(id);if(id==='bluejay'||id==='cardinal')later(2,()=>{if(inAny()===id)clue('cabin');});}
  if(id&&(id==='bluejay'||id==='cardinal')&&!C.clues.has('cabin')){C.inCabT=(C.inCabT||0)+dt;if(C.inCabT>2)clue('cabin');}
  // (in a dark cabin with the light off: the hint is on the key)
  // (where you haven't looked yet, said by whichever of them would think of it; never found for you)
  const tc=C.t-(C.campAt??C.t);if(!C.flags.fireOffer&&tc>(C.campHintAt||120)&&!busy()&&!C.view){C.campHintAt=tc+110;
   const HINTS={office:[['sam','“The office. Camps keep records.”'],['jamie','“The office, by the gate. Let’s look in there.”'],['sam','“The building by the gate. The one with the porch. Records.”']],
    lodge:[['jamie','“The lodge. The big one. Mess hall.”'],['sam','“What about the lodge? Past the flagpole.”'],['jamie','“The lodge. The big building. Kitchen in the back.”']],
    cabin:[['jamie','“The cabins. Let’s look in one.”'],['sam','“Bluejay. Right there along the lane.”'],['jamie','“One of the cabins. Any of them. Come on.”']]};
   const k=!C.clues.has('register')&&!C.clues.has('searchmap')?'office':!C.clues.has('pantry')?'lodge':!C.clues.has('cabin')?'cabin':null;
   if(k){const n=(C.campHintN||(C.campHintN={}))[k]=((C.campHintN[k]??-1)+1),[w,t]=HINTS[k][Math.min(n,2)];say([{who:w.toUpperCase(),text:t,by:w}]);if(n>=2){stand(w==='sam'?sam:jamie,null);}}}
  // (offered: come and sit; they go and sit down; they call you)
  if(C.flags.fireOffer&&!C.flags.fire&&!busy()&&!C.view&&!posed()){const to=C.t-(C.fireOfferAt??C.t);if(to>(C.fireCallAt||50)){C.fireCallAt=to+80;say([{who:'JAMIE',text:'“Come sit down. Just for a minute.”',by:'jamie'}]);for(const [c,k2] of [[jamie,2],[sam,4]]){const Sk=SEATS[k2];stand(c,Sk.front,{face:Sk.face,sit:Sk.seat,keep:true,look:()=>W5(...FIRE)});}}}void p;}
 // ---- the campfire: the quiet scene, and the afternoon gone ------------------------------------------------------------------------------
 // the six logs round the fire ring (pine-plan.js): each a seat facing the fire, and a place in front of it to walk up to
 const FIRE=SPOT.campfire,SEATS=SOLIDS.filter(q=>q.kind==='log').map(q=>{const de=FIRE[0]-q.c[0],dn=FIRE[1]-q.c[1],l=Math.hypot(de,dn)||1;return {seat:q.c,face:hd(de,dn),front:[q.c[0]+de/l*.8,q.c[1]+dn/l*.8]};});
 const LOGS=()=>SEATS.map(q=>[q.front[0],q.front[1],q.face]);
 function toFire(){if(C.flags.fire)return;C.flags.fire=true;go('d5-fire');objective('');checkpoint('c5-campfire');mark('the campfire');C.fireAt=C.t;C.fireH=C.h;
  sitFire();
  for(const [c,k] of [[jamie,2],[sam,4]]){const Sk=SEATS[k];stand(c,Sk.front,{face:Sk.face,sit:Sk.seat,keep:true,look:()=>W5(...FIRE)});}
  // a rest, not an afternoon: they sit, Sam gets the water out, and they talk; then they go and look at the last cabin
  later(5,fireWater);
  say([{wait:3},{who:'JAMIE',text:'“This is nice.”',by:'jamie',time:1.4,face:'tired'},{who:'JAMIE',text:'“That’s messed up, right? That it’s nice?”',by:'jamie',time:2.4,face:'concerned'},{who:'SAM',text:'“It’s not messed up.”',by:'sam',time:1.6},
   {wait:3.4},{who:'JAMIE',text:'“My mom keeps saying ‘when he comes home.’ Not ‘if.’ ‘When.’”',by:'jamie',time:3.6,face:'sad'},{who:'SAM',text:'“That’s good.”',by:'sam',time:1.2},
   {who:'JAMIE',text:'“I don’t think she believes it. I think she says it so I’ll believe it.”',by:'jamie',time:3.6,face:'sad'},{wait:3.2},
   {who:'JAMIE',text:'“What if we find him and he’s not— what if it’s—”',by:'jamie',time:3,face:'worried'},{wait:1.8,act:()=>fireShot()},{who:'JAMIE',text:'“Never mind.”',by:'jamie',time:1.4},{wait:1.6},
   {who:'YOU',text:'“We’ll find him.”',time:1.6},{who:'SAM',text:'“Yeah.”',by:'sam',time:1,face:'determined'},{wait:1.2},{who:'JAMIE',text:'“…Yeah.”',by:'jamie',time:1.4,face:'hopeful'},{wait:2.4},
   {who:'SAM',text:()=>`“We should keep going. It’s ${roughly(C.h)}.”`,by:'sam',time:2,face:'concerned'},{who:'JAMIE',text:'“Owl. The last cabin. We didn’t look in Owl.”',by:'jamie',time:2.2,face:'determined'},
   {who:'SAM',text:'“Then the bikes. Before dark. That was the deal.”',by:'sam',time:2.2},{who:'JAMIE',text:'“Then the bikes.”',by:'jamie',time:1.2}],
   {then:fireEnd});}
 function sitFire(){const S0=SEATS[0],q=W5(...S0.seat);C.flags.fireStood=false;pose({x:q.x,z:q.z},{y:q.y+1.1,yaw:S0.face,pitch:-.16});}
 // (the water bottles packed this morning: Sam's out of his bag, a drink, passed across to Jamie)
 // (Sam gets up, takes a bottle out of his bag, walks round inside the logs, past the empty one, and puts it in Jamie's
 // hand where he sits; then back to his log. Jamie sets it down beside him after a drink. Nothing crosses the fire.)
 function fireWater(){if(C.flags.fireWater||!G5.packedOf('water'))return;C.flags.fireWater=true;let B=null;
  const J=SEATS[2],Sk=SEATS[4],deg=q=>Math.atan2(q.seat[0]-FIRE[0],q.seat[1]-FIRE[1])*180/Math.PI,ring=(a,r)=>{const t=a*Math.PI/180,q=W5(FIRE[0]+Math.sin(t)*r,FIRE[1]+Math.cos(t)*r);return [q.x,q.z];};
  const a0=deg(Sk),d=((deg(J)-a0+540)%360)-180,there=[[1/3,3.25],[2/3,3.25],[.94,3.4]].map(([f,r])=>ring(a0+d*f,r)),back=[...there.slice(0,2).reverse(),(()=>{const q=W5(...Sk.front);return [q.x,q.z];})()];
  const jHand=()=>{const v=new THREE.Vector3(),q=new THREE.Quaternion();handFrame(jamie.person,'r',v,q);return v;};
  stand(sam,null);
  comp.run(sam,[...G5.bagSteps(sam,{take:()=>G5.packedOf('water'),onTake:it=>{B=it;if(it)it.given=true;}}),phys.reach(sam,{at:()=>{const q=sam.person.group.position.clone();return q.add(new THREE.Vector3(Math.sin(sam.pa)*.08,1.48,-Math.cos(sam.pa)*.08));},dur:[.5,1.1,.5],carry:true}),
   comp.steps.walkTo(sam,there,{speed:1.05}),phys.reach(sam,{at:jHand,dur:[.7,.35,.5],carry:false,lean:.12,onContact:()=>{if(B){phys.handOff(B,jamie.person,'r');mark('Sam gives Jamie the water');}}}),
   comp.steps.walkTo(sam,back,{speed:1.05})],{then:()=>stand(sam,Sk.front,{face:Sk.face,sit:Sk.seat,keep:true,look:()=>W5(...FIRE)})});
  // (a drink, and the bottle down on the ground by his log)
  later(30,()=>{if(B?.holder===jamie.person){const q=W5(...J.seat),f=W5(...J.front),side=new THREE.Vector3(f.z-q.z,0,-(f.x-q.x)).normalize().multiplyScalar(.75);const at=new THREE.Vector3(q.x,0,q.z).add(side).addScaledVector(new THREE.Vector3(f.x-q.x,0,f.z-q.z),.35);at.y=gy(at.x,at.z)+.003;B.place(at,new THREE.Euler(0,1.1,0));}});}
 function fireEnd(){if(C.flags.fireDone)return;C.flags.fireDone=true;C.hMin=Math.max(C.hMin||0,HOUR.golden);if(PN?.dyn?.fishCar)PN.dyn.fishCar.g.visible=false;if(posed())unpose();
  for(const c of [jamie,sam])stand(c,null);follow(true);go('e5-dusk');objective('Check the last cabin.','Owl, past Bluejay and Heron, at the west end.');T?.set?.(.1,{rise:.02,why:'the time'});mark('up from the fire');}
 // The picture none of them took: the three of you at the fire, from the trees behind, at 6:53 (rendered now, while it is
 // true, where the game can render; otherwise drawn). It is put on the camera later, where it is found.
 function fireShot({render=true,h=C.h}={}){if(C.fireShot)return;const f=W5(...FIRE),a=SEATS[3].face+Math.PI,back=W5(FIRE[0]+Math.sin(a)*12,FIRE[1]+Math.cos(a)*12);// (from the trees behind the empty log across from you)
  const cv=canvas(640,480),shot={canvas:cv,rendered:false,time:fmt(h).replace(' ',''),h};C.fireShot=shot;
  try{if(render&&o.shoot&&o.readPixels&&cv&&typeof THREE.WebGLRenderTarget==='function'){const rt=new THREE.WebGLRenderTarget(640,480,{colorSpace:THREE.SRGBColorSpace}),cam=new THREE.PerspectiveCamera(48,640/480,.1,300);
    cam.position.set(back.x,back.y+1.55,back.z);cam.lookAt(f.x,f.y+.6,f.z);cam.updateMatrixWorld();if(o.shoot({cam,target:rt})){const px=o.readPixels(rt,640,480);if(px){photo.toCanvas(cv,px,{blur:true});shot.rendered=true;}}rt.dispose?.();}}catch{}
  if(!shot.rendered&&cv)drawFireSketch(cv.g,640,480);}
 function drawFireSketch(g,w,h){const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#d8a058');sky.addColorStop(.5,'#b06a38');sky.addColorStop(1,'#2a1e16');g.fillStyle=sky;g.fillRect(0,0,w,h);
  g.fillStyle='#4a5a6a';g.fillRect(0,h*.46,w,h*.08);g.fillStyle='#3a2a1c';g.fillRect(0,h*.54,w,h*.46);
  g.fillStyle='#2a2018';g.beginPath();g.ellipse(w*.52,h*.72,w*.11,h*.035,0,0,7);g.fill();
  const kid=(x,c,cap)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,h*.66,w*.03,h*.06,0,0,7);g.fill();g.fillStyle='#2a1c14';g.beginPath();g.arc(x,h*.585,w*.022,0,7);g.fill();if(cap){g.fillStyle=cap;g.fillRect(x-w*.024,h*.565,w*.048,h*.016);}};
  kid(w*.38,'#c8743f','#2d4a7a');kid(w*.52,'#5a6070',null);kid(w*.66,'#6d9a8a',null);
  for(const [x,ww] of [[.03,.06],[.16,.04],[.84,.05],[.95,.07]]){g.fillStyle='#120e0a';g.fillRect(w*x,0,w*ww,h);}g.fillStyle='rgba(10,8,6,.35)';g.fillRect(0,0,w,h);}
 // ---- dusk: Wren's window; Owl ------------------------------------------------------------------------------------------------------
 function updateDusk(dt){const p=me();lightsAtDusk();
  // Wren: lit for a moment, while you are looking (no power out here: the poles have no wires)
  if(!C.flags.wren&&C.h>18.95){const w=camp.LAMPS.wren?.pos;if(w&&k.camLooksAt(w,.97)&&Math.hypot(p.x-w.x,p.z-w.z)<55){C.wrenT=(C.wrenT||0)+dt;if(C.wrenT>.4){C.flags.wren=true;camp.set('wren',.42,{rate:3,flick:.3});later(2.4,()=>camp.set('wren',0,{rate:2}));mark('Wren’s window');
     later(1.2,()=>say([{who:'JAMIE',text:'“Did you see that? Wren. In the window.”',by:'jamie'},{who:'SAM',text:'“It’s the sun. On the glass.”',by:'sam',time:1.8}]));}}}
  if(inside('owl')||near(OWL_PORCH,3.4))owlEnter();
  if(S.pt>120&&!C.flags.owl&&!C.flags.owlLead&&!busy()){C.flags.owlLead=true;say([{who:'JAMIE',text:'“Owl’s the last one. Down here.”',by:'jamie'}]);
   stand(jamie,[OWL_FRONT[0]+1,OWL_FRONT[1]+3],{look:()=>owlLamp(),leash:60});stand(sam,[OWL_FRONT[0]+2,OWL_FRONT[1]+5],{look:()=>owlLamp(),leash:60});}
  if(!C.flags.owl&&S.pt>(C.owlCallAt||210)&&!busy()){C.owlCallAt=S.pt+100;const n=C.owlCalls=(C.owlCalls||0)+1;say([n%2?{who:'SAM',text:'“Owl. The last cabin. Down at the end.”',by:'sam'}:{who:'JAMIE',text:'“Over here! Owl!”',by:'jamie'}]);}}
 function lightsAtDusk(){if(PN?.lights?.lot)PN.lights.lot.level=C.h>19.62?1:0;}
 function owlEnter(){if(C.flags.owl)return;C.flags.owl=true;go('e5-owl');C.hMin=Math.max(C.hMin||0,HOUR.owl);checkpoint('c5-owl');mark('Owl');placeEvidence();carving.visible=true;C.owl={t:0};if(C.flags.owlLead)for(const c of [jamie,sam])stand(c,null);
  if(DOORS.owl.open<.5)objective('Look in Owl.','The door.');}
 // (a nail in the side wall by the back corner, clear of the bunks, the shelf and the windows; JSA on the back wall beside it)
 const SHIRT_AT=[OWLB.w/2-.12-.05,-(OWLB.d/2-.62)];
 function shirtPos(){return roomV('owl',SHIRT_AT[0],SHIRT_AT[1],1.8);}
 function placeEvidence(){const b=OWLB,s=shirtPos();if(!C.inv.shirt)GR.hangShirt(s,new THREE.Euler(0,-(b.a-Math.PI/2),0));const c=roomV('owl',1.95,-(b.d/2-.12-.014),1.25);carving.position.copy(c);carving.rotation.set(0,-b.a,0);}
 function lookShirt(){if(C.flags.shirtSeen)return;C.flags.shirtSeen=true;mark('Alex’s shirt');const t=shirtPos();t.y-=.3;const b=OWLB,[e,n]=b.F.to(SHIRT_AT[0]-1.0,SHIRT_AT[1]+.15),q=W5(e,n),ey=b.y+b.floor+1.42;
  pose({x:q.x,z:q.z},{y:ey,yaw:headingTo(q.x,q.z,t.x,t.z),pitch:Math.atan2(t.y-ey,Math.hypot(t.x-q.x,t.z-q.z))});C.view='look';C.lookAt=t;C.lookKind='shirt';
  T?.set?.(.32,{rise:.06,why:'Alex’s shirt'});stand(jamie,camBeside(1,.4,.75),{look:()=>t,keep:true});stand(sam,camBeside(-1,.4,.75),{look:()=>t,keep:true});
  say([{wait:.8},{who:'JAMIE',text:'“That’s his.”',by:'jamie',time:1.2},{who:'JAMIE',text:'“That’s Alex’s. That’s the one from the flyers.”',by:'jamie',time:2.4},{wait:1},
   {who:'SAM',text:'“It’s wet.”',by:'sam',time:1.2},{wait:1.4},{who:'SAM',text:'“It’s still wet.”',by:'sam',time:1.6},{who:'JAMIE',text:'“He was here. He was HERE.”',by:'jamie',time:2}],{then:()=>{endLook();C.flags.shirtDone=true;owlNext();}});}
 function lookCarving(){if(C.flags.carvingSeen)return;C.flags.carvingSeen=true;mark('the carving');const t=carving.position.clone();closeLook({x:t.x,y:t.y,z:t.z},{back:.7,eye:1.42,floor:OWLB.y+OWLB.floor});C.view='look';C.lookAt=t;C.lookKind='carving';
  say([{who:'SAM',text:'“J. S. A.”',by:'sam',time:1.4},{who:'YOU',text:'“Like at the lookout. Like he wrote in chalk.”',time:2.4},{who:'JAMIE',text:'“It’s new. The wood’s still white.”',by:'jamie'},
   {who:'SAM',text:'“Four marks.”',by:'sam',time:1.2},{who:'SAM',text:'“Sunday. Monday. Tuesday. Today.”',by:'sam',time:2.6},{who:'JAMIE',text:'“And an arrow. Pointing… that way.”',by:'jamie'}],{then:()=>{endLook();C.flags.carvingDone=true;owlNext();}});}
 function owlNext(){if(!(C.flags.shirtDone&&C.flags.carvingDone)||C.flags.owlDone)return;C.flags.owlDone=true;
  const b=OWLB,beside=()=>{const [e,n]=b.F.to(SHIRT_AT[0]-.5,SHIRT_AT[1]+.5);/* (the nearest clear standing room by the nail: from the old spot, too tight, he could not step away after) */for(let r=0;r<=.6;r+=.05)for(let k=0;k<(r?16:1);k++){const a=k/16*Math.PI*2,q=W5(e+Math.sin(a)*r,n+Math.cos(a)*r);if(nav.walkable(q.x,q.z,{r:.32}))return q;}return W5(e,n);};const t0=C.t;
  say([{wait:1},{who:'SAM',text:'“I’m taking it.”',by:'sam',time:1.4,face:'determined',act:()=>GR.samTakesShirt({stand:beside})},{until:()=>C.inv.shirt||C.t-t0>16},
   {who:'JAMIE',text:'“He’s HERE. He’s somewhere here.”',by:'jamie',face:'hopeful'}],{then:callAlex});}
 function updateOwl(dt){const X=C.owl;X.t+=dt;
  if(DOORS.owl.open>.5&&!C.flags.owlLine&&inside('owl')){C.flags.owlLine=true;objective('');}
  if(X.t>110&&!C.flags.owlNudge&&!busy()){C.flags.owlNudge=true;say([{who:'SAM',text:C.flags.shirtSeen?'“The wall. By the hooks.”':'“On the hook. In the back.”',by:'sam'}]);}
  if(X.t>170&&!C.flags.owlPoint&&!busy()){C.flags.owlPoint=true;const b=OWLB,[e,n]=b.F.to(SHIRT_AT[0]-.6,SHIRT_AT[1]+.4);stand(jamie,[e,n],{look:()=>shirtPos(),keep:true,gesture:'point'});say([{who:'JAMIE',text:C.flags.shirtSeen?'“Here. On the wall, there’s something cut in it.”':'“Here. On the wall. Look.”',by:'jamie'}]);}
  if(X.t>(X.again||260)&&!C.flags.owlDone&&!busy()){X.again=X.t+100;say([{who:'SAM',text:C.flags.shirtSeen?'“The wall. Next to where it was hanging.”':'“The back corner. By the hook.”',by:'sam'}]);}}
 // ---- they call his name -------------------------------------------------------------------------------------------------------------------
 function callAlex(){if(C.flags.call)return;C.flags.call=true;go('e5-call');C.hMin=Math.max(C.hMin||0,HOUR.call);C.darkTo=Math.max(C.darkTo||0,.3);/* (the dusk deepens as they call: a light in the trees shows) */mark('they call his name');lightsOut(true);objective('');
  stand(jamie,[OWL_FRONT[0]+.6,OWL_FRONT[1]-.6],{look:()=>W5(-280,540,2),keep:true});stand(sam,[OWL_FRONT[0]-.8,OWL_FRONT[1]+.8],{look:()=>W5(-280,540,2),keep:true});
  // a light in the trees, twenty-odd metres off, going away toward the pump house: somebody with a flashlight, they think
  say([{who:'JAMIE',text:'“ALEX!”',by:'jamie',time:1.4,face:'worried'},{wait:1.6},{who:'JAMIE',text:'“ALEX!”',by:'jamie',time:1.4},{who:'SAM',text:'“ALEX!”',by:'sam',time:1.4},{who:'YOU',text:'“ALEX!”',time:1.4},
   {wait:3.2,act:()=>{movingLight();}},{who:'JAMIE',text:'“There. A light. In the trees.”',by:'jamie',time:2,face:'surprised'},{who:'SAM',text:'“Somebody fishing. Or a ranger.”',by:'sam',time:1.8,face:'concerned'},
   {who:'JAMIE',text:'“ALEX? Is that you?”',by:'jamie',time:1.6,face:'hopeful'},{wait:1.4},{who:'YOU',text:'“Hello?”',time:1.1},
   // it stops; its beam comes round onto the three of you; it goes out
   {wait:1.2,act:()=>{camp.hold(true);camp.aim(0,camera.position);mark('the light turns on you');T?.set?.(.45,{rise:.05,why:'the light turns'});}},{wait:2.2,act:()=>{camp.carriedOut(.2);sound('click',W5(-280,540,2),{gain:.2});mark('the light goes out');}},{wait:1.8},
   {who:'SAM',text:'“A ranger would have said something.”',by:'sam',time:2,face:'afraid'},{who:'JAMIE',text:'“What if it was him?”',by:'jamie',time:1.6,face:'worried'},{who:'SAM',text:'“Then he would have answered.”',by:'sam',time:1.8,face:'afraid'},
   {who:'SAM',text:'“We’re going. Back to the bikes.”',by:'sam',time:1.8,face:'determined'}],
   {then:()=>{go('e5-lights');C.hMin=Math.max(C.hMin||0,HOUR.lights);objective('Back to the bikes.','The way you came in: the camp gate.');C.flags.hurry=false;for(const c of [jamie,sam])stand(c,null);follow(true);C.lt={t:0,started:false};}});}
 // one light in the trees, going away from Owl, toward the pump house; it stops; it turns on you; it goes out
 function movingLight(){const pts=[[-266,551],[-272,546],[-279,540],[-284,535]].map(([e,n])=>{const w=W5(e,n);return {x:w.x,y:w.y,z:w.z};});camp.carry(1,pts,{speed:.9});mark('a light in the trees');T?.set?.(.35,{rise:.05,why:'a light in the trees'});}
 // ---- three lights, walking where you walked ------------------------------------------------------------------------------------------------
 function trailPath(){let L=C.trail.length>8?C.trail.slice(0):[];
  if(L.length<8){L=[[-166,512],[-176,526],[-181,531.5],[-190,541],[-200,556],[-208,566],[-212,575],[-210,560],[-208,548]].map(([e,n],i)=>{const w=W5(e,n);return {x:w.x,z:w.z,wait:i===2||i===6?2.5:0};});}
  // (from the gate, at most a hundred and twenty metres of it)
  const out=[];let len=0;for(let i=0;i<L.length;i++){if(i>0)len+=Math.hypot(L[i].x-L[i-1].x,L[i].z-L[i-1].z);if(len>120)break;out.push({x:L[i].x,y:gy(L[i].x,L[i].z),z:L[i].z,wait:L[i].wait||0});}return out;}
 // Three lights at the gate, the length of the camp away: they walk where you walked this afternoon, in the order you
 // went (the office first, then the map board: they stop where you stood), and one of them does what your flashlight
 // does. Then they go on to the fire and sit where you sat. Nothing a search party would do.
 const MAPFRONT=[SPOT.mapBoard[0]-.8,SPOT.mapBoard[1]-2.2];
 function lightsPath(){const w=(e,n,o={})=>{const q=W5(e,n);return {x:q.x,y:q.y,z:q.z,...o};},common=[w(...SPOT.campGate),w(-171,519),w(...OFFICE_FRONT,{wait:3}),w(-183,525),w(-188.5,530.5),w(...MAPFRONT,{wait:1e4})];// (round the office's west corner, not through it)
  return [0,2,4].map(k=>{const S0=SEATS[k];return [...common,w(-201,529),w(...S0.front),w(...S0.seat,{wait:1e4,sit:true})];});}
 function threeLights(){if(C.lt.started)return;const X=C.lt;X.started=true;X.at=C.t;X.copies=0;X.flips=[];X.lastOn=!!o.foot.on;X.jLast=!!S.flashOn;mark('three lights at the gate');camp.carry(3,lightsPath(),{speed:1.25});T?.set?.(.45,{rise:.05,why:'three lights'});
  for(const c of [jamie,sam])stand(c,null);follow(true);objective('');
  say([{who:'JAMIE',text:'“Wait.”',by:'jamie',time:.9,face:'surprised'},{who:'JAMIE',text:'“There’s a light. At the gate.”',by:'jamie',time:1.8,face:'surprised'},{wait:1.4},{who:'SAM',text:'“Two.”',by:'sam',time:1,face:'concerned'},{wait:.8},{who:'YOU',text:'“Three.”',time:1},
   {who:'JAMIE',text:'“A search party. Somebody saw our bikes.”',by:'jamie',time:2.2,face:'hopeful'},{who:'SAM',text:'“Then why aren’t they calling?”',by:'sam',time:1.8,face:'concerned'}]);}
 function updateLights(dt){const X=C.lt;X.t+=dt;const p=me(),{e}=EN(p);
  if(!X.started&&(e>-262||X.t>22))threeLights();
  if(!X.started){if(X.t>200&&!C.split)splitStart();return;}
  const t=C.t-X.at,L0=camp.CARRY[0],pos=i=>camp.carriedAt(i),near=[0,1,2].some(i=>{const q=pos(i);return q&&Math.hypot(q.x-p.x,q.z-p.z)<12;});
  // (they never let you up close: go at them and they go out)
  if(near&&!X.out){X.out=true;X.close=true;camp.carriedOut(.2);C.darkTo=.55;sound('click',camera.position,{gain:.15});mark('the three lights go out (too close)');say([{who:'SAM',text:'“Where did they go? Where did they GO?”',by:'sam',time:1.8,face:'terrified'}],{interrupt:true});later(3,splitStart);return;}
  // at the office, then the map board: they stop where you stood
  if(!X.office&&L0.u>18){X.office=true;say([{who:'SAM',text:'“They’re going to the office.”',by:'sam',time:1.6,face:'concerned'},{who:'JAMIE',text:'“So? It’s the first building.”',by:'jamie',time:1.6}]);}
  if(!X.board&&L0.wait>60){X.board=true;X.boardAt=C.t;mark('the lights stop at the map board');
   say([{who:'SAM',text:'“They stopped. At the map board.”',by:'sam',time:1.8,face:'worried'},{who:'SAM',text:'“Where we stood.”',by:'sam',time:1.2},
    {who:'JAMIE',text:'“Flash your light at them. If they’re looking for us, they’ll flash back.”',by:'jamie',time:3,face:'determined',act:()=>{X.ask=C.t;}}]);}
  // one of them does what your flashlight does (or Jamie's, if he does it): off when it goes off, on when it comes on
  const on=!!o.foot.on;if(on!==X.lastOn){X.lastOn=on;if(X.board&&!X.went)X.flips.push({t:C.t+.7,on});}
  const jon=!!S.flashOn;if(jon!==X.jLast){X.jLast=jon;if(X.board&&!X.went)X.flips.push({t:C.t+.7,on:jon,j:true});}
  while(X.flips.length&&X.flips[0].t<=C.t){const f=X.flips.shift();camp.switchLight(0,f.on);sound('click',pos(0)||camera.position,{gain:.08});if(!f.on)X.copies++;mark('the light copies: '+(f.on?'on':'off'));}
  const blink=()=>{for(const [d,v] of [[.6,false],[1.1,true]])later(d,()=>{S.flashOn=v;});};// (Jamie's light: one off and on)
  if(X.ask&&!X.jamieFlash&&C.t-X.ask>12&&X.copies===0){X.jamieFlash=true;say([{who:'JAMIE',text:'“Like this.”',by:'jamie',time:1}]);blink();}
  if(X.copies>=1&&!X.react1){X.react1=true;X.react1At=C.t;later(1,()=>say([{who:'JAMIE',text:'“…They flashed back.”',by:'jamie',time:1.6,face:'hopeful'},{who:'SAM',text:'“No. Do it again.”',by:'sam',time:1.4,face:'afraid'}]));}
  // (asked to do it again, nobody does: Jamie does, once)
  if(X.react1&&!X.react2&&!X.jamieAgain&&C.t-X.react1At>13){X.jamieAgain=true;say([{who:'JAMIE',text:'“Okay. Again.”',by:'jamie',time:1.1,face:'worried'}]);blink();}
  if(X.copies>=2&&!X.react2){X.react2=true;X.went=C.t;later(1.4,()=>say([{who:'SAM',text:'“It’s doing what you do. Exactly what you do.”',by:'sam',time:2.4,face:'terrified'},{who:'JAMIE',text:'“That’s not a search party.”',by:'jamie',time:1.6,face:'afraid'}],{then:()=>{camp.switchLight(0,true);camp.hold(false);}}));}
  if(X.board&&!X.went&&C.t-X.boardAt>45){X.went=C.t;camp.switchLight(0,true);camp.hold(false);}
  // at the fire they sit, where you sat
  if(X.went&&!X.sat&&!X.out&&camp.CARRY.some(c=>c.g.visible)&&camp.CARRY.every(c=>!c.g.visible||c.sitting)){X.sat=true;X.satAt=C.t;mark('the lights sit at the fire');
   say([{wait:1},{who:'SAM',text:'“…That’s where we sat.”',by:'sam',time:1.8,face:'terrified'},{who:'YOU',text:'“That’s us. They’re doing what we did.”',time:2.2}]);later(4,crtStart);}
  // they get up, turn their lights on you, and go out, all three at once
  if(X.sat&&!X.turned&&(C.crt?.stage==='gone'||C.t-X.satAt>16)){X.turned=true;X.turnAt=C.t;for(let i=0;i<3;i++){camp.sitDown(i,false);camp.aim(i,camera.position);}mark('the lights turn on you');
   say([{who:'JAMIE',text:'“They’re looking at us.”',by:'jamie',time:1.6,face:'terrified'}]);}
  if(X.turned&&!X.out&&C.t-X.turnAt>3.2){X.out=true;camp.carriedOut(.25);C.darkTo=.55;sound('click',camera.position,{gain:.15});mark('the three lights go out');later(2.6,splitStart);}
  if(X.t>240&&!C.split)splitStart();}
 // The thing from the drain: low against the lodge, watching the three lights, more afraid of them than of you.
 const CRT_AT=[-222,567],CRT_RUN=[[-221,575],[-232,586],[-238,598],[-240,612],[-246,626]];// (clear of the washhouse and the trees)
 const crHead=new THREE.Vector3();
 function crtStart(){if(C.crt)return;C.crt={stage:'watch',t:0,e:CRT_AT[0],n:CRT_AT[1],a:ha(CRT_AT[0],CRT_AT[1],-190,541),wi:0,seenT:0,seenAt:null,stageAt:{watch:C.t}};
  creature.reset();creature.ground=(x,z)=>gy(x,z);creature.show(true);placeCrt();mark('it, by the lodge');
  later(1.4,()=>say([{who:'SAM',text:'“…There. By the lodge. Don’t move.”',by:'sam',time:2},{who:'JAMIE',text:'“It’s the thing. From the tunnel.”',by:'jamie',time:1.8}]));}
 function placeCrt(){const R=C.crt;if(!R)return;const w=W5(R.e,R.n);creature.place(w.x,w.y,w.z,R.a);}
 function updateCrt(dt){const R=C.crt;if(!R||R.stage==='gone')return;R.t+=dt;const D2=creature.drive,p=me(),w=W5(R.e,R.n),dYou=Math.hypot(p.x-w.x,p.z-w.z);creature.headPos?.(crHead);if(!creature.loaded)crHead.set(w.x,w.y+.9,w.z);
  if(k.camLooksAt(crHead,.97)){R.seenT+=dt;if(R.seenT>.4&&R.seenAt===null)R.seenAt=C.t;}
  const lights=[0,1,2].map(i=>camp.carriedAt(i)).filter(Boolean),lk=lights[0]||W5(-190,541);let sp=0,look={x:lk.x,y:(lk.y||w.y)+.5,z:lk.z};const dmp=(k2,to2,r)=>{D2[k2]=damp(D2[k2]||0,to2,r,dt);};
  const face=(e,n,kk=4)=>{R.a+=wrap(ha(R.e,R.n,e,n)-R.a)*(1-Math.exp(-kk*dt));};
  if(R.stage==='watch'){dmp('crouch',.65,3);dmp('cower',.55,2);dmp('alert',.7,3);const q=PL(lk.x,lk.z);face(q.e,q.n,2.5);
   if(R.t>7||!camp.carrying()||dYou<11){R.stage='flee';R.t=0;R.stageAt.flee=C.t;mark('it runs from them');say([{who:'JAMIE',text:'“It’s scared of them.”',by:'jamie',time:1.6},{who:'SAM',text:'“Then why are WE still here.”',by:'sam',time:1.8}],{interrupt:true});}}
  else if(R.stage==='flee'){dmp('cower',.2,6);dmp('crouch',.2,4);const tg=CRT_RUN[R.wi];sp=Math.min(8.2,2+R.t*9);face(tg[0],tg[1],10);const de=tg[0]-R.e,dn=tg[1]-R.n,l=Math.hypot(de,dn);
   if(l<1){R.wi++;if(R.wi>=CRT_RUN.length){R.stage='gone';creature.show(false);creature.ground=null;sound('thud',W5(...CRT_RUN[CRT_RUN.length-1]),{gain:.3});return;}}else{R.e+=de/l*Math.min(l,sp*dt);R.n+=dn/l*Math.min(l,sp*dt);}look=null;}
  D2.speed=sp;D2.look=look;placeCrt();creature.update(dt);}
 // ---- The Camp That Wants Them Apart ---------------------------------------------------------------------------------------------------------
 // Two lights: Owl's window behind them (where the shirt was: Jamie's), the office's porch light ahead (the way out: Sam's).
 // The camp pulls at whichever of them you are not with: walk to one, the other drifts; look at one light, the other
 // brightens and calls. Stay with both (close to both, a few seconds) and Sam finds the compromise. It never takes either
 // of them: a boy pulled too far stops and calls you. Fallback in time: they come back together on their own.
 const OWL_WIN=OWL_FRONT,OFF_FRONT=OFFICE_FRONT;
 function splitStart(){if(C.split)return;go('n5-split');C.hMin=Math.max(C.hMin||0,HOUR.split);checkpoint('c5-split');mark('the camp at night');lightsOut(true);C.flags.hurry=false;
  const P=me(),c=EN(P);C.split={t:0,state:'pull',pull:'sam',pullT:4,drift:{jamie:0,sam:0},look:{owl:0,office:0},together:0,said:{},center:[c.e,c.n],resolved:false,maxSpread:0,events:[]};
  camp.set('owl',1,{rate:.9});camp.set('office-porch',1,{rate:1.4});C.darkTo=.5;T?.set?.(.55,{rise:.04,why:'the camp at night'});
  stand(jamie,()=>driftPos(jamie),{look:()=>owlLamp(),keep:true,max:1.4});stand(sam,()=>driftPos(sam),{look:()=>officeLamp(),keep:true,max:1.4});
  say([{wait:1},{who:'JAMIE',text:'“That’s Owl. That’s Owl’s window.”',by:'jamie',time:1.8},{who:'SAM',text:'“And the office. The porch light.”',by:'sam',time:1.8},
   {who:'JAMIE',text:'“His shirt was in Owl. He’s in there. Alex is in there.”',by:'jamie',time:2.6},{who:'SAM',text:'“The office is the way out. Past it, we’re on the road.”',by:'sam',time:2.6},
   {who:'JAMIE',text:'“I’m not leaving him.”',by:'jamie',time:1.6},{who:'SAM',text:'“That is NOT him.”',by:'sam',time:1.6}],{then:()=>{objective('Keep them together.','Don’t let it split you up.');}});}
 // where a boy stands while the camp pulls at him: from the middle of the three of you toward his light, as far as it has got
 // (drift is in metres, at most DRIFT_MAX: a boy pulled that far stops and calls you; nobody is taken)
 const DRIFT_MAX=13;
 function driftPos(c){const X=C.split,p=me(),pc=EN(p),mid=[(X.center[0]*2+pc.e)/3,(X.center[1]*2+pc.n)/3],tgt=c===jamie?OWL_WIN:OFF_FRONT;
  const side=c===jamie?[-1.6,.6]:[1.6,-.6],e0=mid[0]+side[0],n0=mid[1]+side[1],de=tgt[0]-e0,dn=tgt[1]-n0,l=Math.hypot(de,dn)||1,d=Math.min(X.drift[c.key],Math.max(0,l-3));return W5(e0+de/l*d,n0+dn/l*d);}
 function updateSplit(dt){const X=C.split;if(!X||X.resolved)return;X.t+=dt;const p=me();
  const pos=c=>({x:c.px,z:c.pz}),dJ=dist(p,pos(jamie)),dS=dist(p,pos(sam)),spread=Math.max(dJ,dS,dist(pos(jamie),pos(sam)));X.maxSpread=Math.max(X.maxSpread,spread);
  const lookOwl=k.camLooksAt(owlLamp(),.965),lookOff=k.camLooksAt(officeLamp(),.965);X.look.owl=lookOwl?X.look.owl+dt:0;X.look.office=lookOff?X.look.office+dt:0;
  // whom it pulls: the one you are not near; or, if you look at one light, the other one
  X.pullT-=dt;if(X.pullT<=0){X.pull=dJ>dS+1.5?'jamie':dS>dJ+1.5?'sam':X.pull==='jamie'?'sam':'jamie';X.pullT=6+((X.t*.37)%1)*3;X.events.push({t:+X.t.toFixed(1),pull:X.pull});}
  if(X.look.owl>1.2)X.pull='sam';if(X.look.office>1.2)X.pull='jamie';
  // (you hold a friend by being with him, not by standing beside him staring at one of the lights)
  const staring=X.look.owl>1.2||X.look.office>1.2;
  // and when it calls one of them by name, he goes toward it a little way whatever you are doing (a surge): you have to go
  // and bring him back, and while you do, the other one is the one it works on
  for(const c of [jamie,sam]){const held=dist(p,pos(c))<3.6&&!staring,pulled=X.pull===c.key&&X.t>4,surge=(X.surge?.[c.key]||0)>0;
   if(surge)X.surge[c.key]-=dt;X.drift[c.key]=clamp(X.drift[c.key]+(surge?2.4:held?-2.2:pulled?.55:-.08)*dt,0,DRIFT_MAX);}
  // the lights answer the looking: the one you watch steadies, the other flares
  camp.set('owl',X.pull==='jamie'?1.15:.75,{rate:1.2,flick:X.pull==='jamie'?0:.12});camp.set('office-porch',X.pull==='sam'?1.15:.7,{rate:1.2,flick:X.pull==='sam'?0:.12});
  // voices: Owl says Jamie's name in a voice like Alex's; by the office, Sam's mother calls him in
  const once=(key,t,lines)=>{if(X.t>t&&!X.said[key]&&!busy()){X.said[key]=C.t;say(lines);}};
  const surge=(who,secs)=>{(X.surge||={})[who]=secs;X.events.push({t:+X.t.toFixed(1),surge:who});};
  once('owl',9,[{who:'',text:'“…Jamie?”',time:1.6,act:()=>{sound('creak',owlLamp(),{gain:.3});surge('jamie',2.6);}},{who:'JAMIE',text:'“That’s him. That’s HIM.”',by:'jamie',time:1.6}]);
  once('mom',19,[{who:'',text:'“Sam! Sam, honey, time to come in!”',time:2.2,act:()=>surge('sam',2.6)},{who:'SAM',text:'“That’s my mom. That’s— she’s at work. She’s at WORK.”',by:'sam',time:2.6}]);
  once('bell',29,[{wait:.1,act:()=>{const b=PN?.dyn?.bell;if(b)b.v+=1.6;sound('oldBell',bellPos(),{gain:.8});surge('jamie',1.2);surge('sam',1.2);}},{who:'JAMIE',text:'“The bell.”',by:'jamie',time:1.2}]);
  if(spread>14&&!X.said.far&&!busy()){X.said.far=C.t;const far=dJ>dS?jamie:sam;say([{who:far===jamie?'JAMIE':'SAM',text:far===jamie?'“Come ON. He’s right there!”':'“Come ON. This way. Please.”',by:far.key}]);}
  // together: close to both, a moment
  X.together=dJ<5.2&&dS<5.2?X.together+dt:Math.max(0,X.together-dt*.5);
  // (not before it has called both of them: the compromise is something they come to, not the first thing that happens)
  if((X.together>2.6&&X.t>25&&!(X.surge?.jamie>0||X.surge?.sam>0))||X.t>66)compromise(X.t>66?'time':'together');}
 function compromise(how){const X=C.split;if(X.resolved)return;X.resolved=true;X.how=how;mark('the compromise ('+how+')');go('n5-split');C.flags.compromise=true;
  for(const c of [jamie,sam])X.drift[c.key]=0;stand(jamie,camBeside(1,.2,.8),{look:()=>owlLamp(),keep:true,max:3});stand(sam,camBeside(-1,.2,.8),{look:()=>owlLamp(),keep:true,max:3});
  say([{who:'SAM',text:'“Okay. Okay.”',by:'sam',time:1.2},{who:'SAM',text:'“We look. From the porch. We don’t go in.”',by:'sam',time:2.4},{who:'SAM',text:'“Together. And then we go. Together.”',by:'sam',time:2.4},
   {wait:.8},{who:'JAMIE',text:'“…Together.”',by:'jamie',time:1.4,act:()=>{camp.set('office-porch',0,{rate:5});sound('click',officeLamp(),{gain:.25});}}],
   {then:()=>{objective('Look into Owl. From the porch. Together.');C.flags.toWindow=true;C.winT=0;}});}
 function updateToWindow(dt){C.winT=(C.winT||0)+dt;if(near(OWL_PORCH,5.5))windowStart();
  if(C.winT>70&&!C.flags.winNudge&&!busy()){C.flags.winNudge=true;say([{who:'SAM',text:'“Together. You promised.”',by:'sam'}]);}
  if(C.winT>100&&!C.flags.winLead&&!busy()){C.flags.winLead=true;say([{who:'JAMIE',text:'“Owl. Come on. Together.”',by:'jamie'}]);
   stand(jamie,[OWL_FRONT[0]+1,OWL_FRONT[1]+3],{look:()=>owlLamp(),keep:true,max:2.4});stand(sam,[OWL_FRONT[0]+2,OWL_FRONT[1]+5],{look:()=>owlLamp(),keep:true,max:2.4});}
  if(C.winT>170&&near(OWL_PORCH,12))windowStart();
  if(C.winT>(C.winAgain||200)&&!busy()){C.winAgain=C.winT+90;say([{who:'JAMIE',text:'“Owl. Together. Come on.”',by:'jamie'}]);}}
 // ---- the window: Jamie, in Owl ---------------------------------------------------------------------------------------------------------------
 // (standing where the shirt hung, facing the nail)
 const DOUBLE=()=>{const b=OWLB,[e,n]=b.F.to(SHIRT_AT[0]-1.55,SHIRT_AT[1]+.25);const w=W5(e,n);return {x:w.x,y:b.y+b.floor,z:w.z,a:b.a+Math.PI/2};};
 function windowStart(){if(C.flags.window)return;C.flags.window=true;go('n5-window');C.hMin=Math.max(C.hMin||0,HOUR.window);mark('Owl, from the porch');DOORS.owl.open=1;camp.set('owl',1.1,{rate:3});
  const D=DOUBLE();camp.double(true,D);C.win={t:0,lookT:0,seen:null,stage:'wait'};objective('');
  stand(jamie,camBeside(1,.15,.7),{look:()=>({x:D.x,y:D.y+1.4,z:D.z}),keep:true,max:2.4});stand(sam,camBeside(-1,.15,.7),{look:()=>({x:D.x,y:D.y+1.4,z:D.z}),keep:true,max:2.4});}
 // It is standing where the shirt hung. It turns its head to look at Jamie (who is beside you). Then it comes out:
 // through the door, across the porch, toward the three of you, not fast, smiling with Jamie's face. RUN only then.
 function doublePath(){const b=OWLB,pt=(lx,lz)=>{const [e,n]=b.F.to(lx,lz),w=W5(e,n);return {x:w.x,y:gy(w.x,w.z),z:w.z};};const d=b.door[0];
  return [pt(d,b.d/2-.7),pt(d,b.d/2+.15),pt(d,b.d/2+b.porch*.6),pt(d,b.d/2+b.porch+1.2),pt(d,b.d/2+b.porch+3.6)];}
 function updateWindow(dt){const X=C.win;X.t+=dt;const D=DOUBLE(),dd=camp.D,head={x:dd.x,y:dd.y+1.45,z:dd.z},p=me(),close=near(OWL_PORCH,4.2);
  if(X.stage==='wait'){if(close&&k.camLooksAt(head,.95))X.lookT+=dt;if(X.lookT>.8||X.t>40){X.stage='turn';X.seen=C.t;mark('the double');T?.set?.(.8,{rise:.18,why:'the double'});camp.D.turnTo=1.25;
    say([{wait:2.2},{who:'JAMIE',text:'“…That’s my hat.”',by:'jamie',time:1.6,face:'shocked'},{wait:1},{who:'JAMIE',text:'“That’s me.”',by:'jamie',time:1.4,face:'terrified'},{who:'SAM',text:'“Jamie. Look at me. Don’t look at it.”',by:'sam',time:2,face:'afraid'},
     {wait:1.4,act:()=>{X.stage='come';X.comeAt=C.t;camp.doubleWalk(doublePath(),{speed:1});mark('it comes out');T?.set?.(.95,{rise:.25,why:'it comes out'});}},{wait:1.6},
     {who:'SAM',text:'“Back up. Back UP.”',by:'sam',time:1.4,face:'terrified'}],{interrupt:true});
    stand(sam,camBeside(-1,-.9,.9),{look:()=>head,keep:true,max:3});}}
  else if(X.stage==='come'){const d=Math.hypot(dd.x-p.x,dd.z-p.z),dj=Math.hypot(dd.x-jamie.px,dd.z-jamie.pz);
   // (Jamie can't move; Sam pulls him back by the arm)
   if(!X.pull&&C.t-X.comeAt>2.2){X.pull=true;stand(jamie,camBeside(1,-.8,.8),{look:()=>head,keep:true,max:3});}
   // (out of the door and across the porch toward you first; then, close, every light)
   const out=(dd.pi||0)>=2||!dd.path;if((out&&(d<3.4||dj<3))||C.t-X.comeAt>8.5||(!dd.path&&C.t-X.comeAt>4)){X.stage='run';X.hideAt=C.t;camp.D.v=5.8;camp.D.burst=.65;sound('c5Rush',head,{gain:.65});mark('the porch lunge');wake('it came out');}}
  else if(X.stage==='run'){/* The same physical double follows the player's trail until the boundary. */}
  void p;void D;}
 // Every light in the camp comes on at once. RUN.
 function wake(why){if(C.flags.wake)return;C.flags.wake=true;mark('the camp wakes ('+why+')');
  for(const id of Object.keys(camp.LAMPS))if(id!=='owl')camp.set(id,1,{rate:9,flick:.05});camp.set('owl',0);const b=PN?.dyn?.bell;if(b)b.v+=3;sound('oldBell',bellPos(),{gain:1});
  for(const [i,key] of ['bluejay','cardinal','office','lodge'].entries())later(.2+i*.17,()=>{DOORS[key].open=1;sound('doorSlam',roomV(key,0,BLD[key].d/2,1),{gain:.7});});
  C.darkTo=Math.max(C.darkTo||0,.6);/* (every lamp on, under a sky that does not lighten) */T?.set?.(1,{rise:.3,why:'run'});say([{who:'SAM',text:'“RUN.”',by:'sam',time:1}],{interrupt:true});later(.4,runStart);}
 // ---- run: the road (the camp gate) or the dam (the bell) --------------------------------------------------------------------------------------
 function runStart(){if(C.esc)return;go('n5-run');C.hMin=Math.max(C.hMin||0,HOUR.run);checkpoint('c5-run');C.flags.hurry=true;for(const c of [jamie,sam])stand(c,null);follow(true);
  objective('Get to the gate. Stay together.','The camp road — or the service road to the dam.');const p=me();C.esc={t:0,route:null,still:0,trail:[{x:p.x,z:p.z}],front:0,woke:new Set(),said:{},boundary:false,huntIndex:0,huntReady:false};
  if(!camp.D.person.group.visible){const q=DOUBLE();camp.double(true,q);camp.doubleWalk(doublePath(),{speed:2.4});}camp.D.hunting=true;camp.D.ground=gy;}
 // the lights wake behind you as you go, never quite on top of you
 const ROUTE_A=['heron','bluejay','robin','cardinal','wren','lodge','office','office-porch'],ROUTE_C=['heron','wash','mshed','pump'];
 // The pursuer takes the path the player actually walked. No repositioning on camera turns, no teleporting through buildings.
 function pursue(dt){const X=C.esc,D=camp.D;if(!X||!D.person.group.visible)return;const p=me(),gap=Math.hypot(D.x-p.x,D.z-p.z);X.closest=Math.min(X.closest??999,gap);X.visibleSeconds=(X.visibleSeconds||0)+dt;
  if(!X.huntReady){if(D.path)return;X.huntReady=true;const q=X.trail[0],path=nav.walkPath({x:D.x,z:D.z},q,[],7);if(path.length){camp.doubleWalk(path.map(([x,z])=>({x,z,y:gy(x,z)})),{speed:3.4});return;}}
  if(gap<2.25){D.path=null;D.walkV=0;D.a=headingTo(D.x,D.z,p.x,p.z);if(!X.said.close||C.t-X.said.close>8){X.said.close=C.t;sound('c5Near',new THREE.Vector3(D.x,D.y+1,D.z),{gain:.45});o.foot.stamina=Math.max(.2,o.foot.stamina-.08);}return;}
  if(!D.path){while(X.huntIndex<X.trail.length-1&&Math.hypot(D.x-X.trail[X.huntIndex].x,D.z-X.trail[X.huntIndex].z)<1.3)X.huntIndex++;
   const q=X.trail[X.huntIndex];if(q&&Math.hypot(D.x-q.x,D.z-q.z)>.2)camp.doubleWalk([{x:q.x,z:q.z,y:gy(q.x,q.z)}],{speed:gap>18?4.8:gap>8?3.5:2.7});}
  D.v=gap>18?4.8:gap>8?3.5:2.7;
  if(!X.doorBeat&&X.route==='A'&&near(BLD.lodge.c,25)){X.doorBeat=true;mark('the lodge door strikes');DOORS.lodge.open=0;sound('c5WoodStrike',roomV('lodge',0,BLD.lodge.d/2,1),{gain:.65});camp.set('lodge',1.4,{rate:12,flick:.4});later(.85,()=>DOORS.lodge.open=1);say([{who:'JAMIE',text:'“That was right next to us.”',by:'jamie',time:1.6,face:'terrified'}]);}
  if(!X.serviceBeat&&X.route==='C'&&near(BLD.pump.c,22)){X.serviceBeat=true;mark('the intake answers');sound('c5WoodStrike',roomV('pump',0,0,.5),{gain:.55});camp.set('pump',1.2,{rate:15,flick:.6});say([{who:'SAM',text:'“On the walkway. Don’t go inside.”',by:'sam',time:1.9,face:'afraid'}]);}
 }
 function updateRun(dt){const X=C.esc;if(!X||X.boundary)return;pursue(dt);X.t+=dt;const p=me(),{e,n}=EN(p),v=X.lp?Math.hypot(p.x-X.lp.x,p.z-X.lp.z)/Math.max(dt,1e-3):0;X.lp={x:p.x,z:p.z};// (stopped is not moving: held against a wall counts too)
  const L=X.trail[X.trail.length-1];if(Math.hypot(L.x-p.x,L.z-p.z)>1)X.trail.push({x:p.x,z:p.z});
  // which way out: wherever you are now (the two ways' ground does not overlap, so it never flickers); you can change your mind
  const want=e>-246||(e>-262&&n<548)?'A':e<-304||n<530&&e<-286?'C':null;
  if(want&&want!==X.route){X.route=C.route=want;mark('route '+want);if(!X.said['r'+want]){X.said['r'+want]=C.t;
    say(want==='A'?[{who:'JAMIE',text:'“The road! The gate!”',by:'jamie',time:1.4}]:[{who:'SAM',text:'“The dam! It’s open, it’s open, go!”',by:'sam',time:1.6}]);}}
  // waking: a lamp comes on when you have passed it by a little
  for(const id of X.route==='C'?ROUTE_C:ROUTE_A){if(X.woke.has(id))continue;const q=camp.LAMPS[id]?.pos;if(!q)continue;const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<16&&d>5){X.woke.add(id);camp.set(id,1,{rate:6,flick:.08});sound('doorSlam',q,{gain:.35});}}
  X.still=v<.6?X.still+dt:0;
  if(X.still>3.5&&!X.said.s1&&!busy()){X.said.s1=C.t;say([{who:'SAM',text:'“Don’t stop. Don’t STOP.”',by:'sam'}]);}
  if(X.still>9&&!X.said.s2&&!busy()){X.said.s2=C.t;say([{who:'JAMIE',text:'“Come ON!”',by:'jamie'}]);}
  if(X.route==='A'&&!C.flags.gateShut&&nearGateIn())gateShut();
  if(C.flags.gateShut&&!C.flags.gateOpened&&C.t-C.gateShutAt>18&&!X.said.help){X.said.help=true;say([{who:'SAM',text:'“Grab this side. I’m holding the latch.”',by:'sam',time:2}]);}
  if(C.flags.gateShut&&!C.flags.gateOpened&&C.t-C.gateShutAt>55)shoveGate('recovery');// forgiving recovery after repeated prompts
  if(passedGate()){X.route=C.route='A';gateScare();}
  if(near(SPOT.damN,9)){X.route=C.route='C';damScare();}
  if(X.still>20&&!X.said.s3&&!busy()){X.said.s3=C.t;say([{who:'SAM',text:'“Please. We have to GO.”',by:'sam'}]);}
  if((X.still>75||X.t>210)&&C.fadeOut<0){X.boundary=true;/* (only once the carry can start: a carry refused mid-fade would leave the run with no end) */if(!X.route){X.route=C.route='A';mark('route A (carried)');}if(X.route==='C')carry('dam',DAM_IN,ha(...DAM_IN,...SPOT.damS),{after:damScare});else carry('gate',[SPOT.campGate[0]+3,SPOT.campGate[1]-6],ha(-166,512,-157,493),{after:gateScare});}}
 // (six metres onto the dam, on its centre line: the walkway, inside the parapet)
 const DAM_IN=(()=>{const [a,b]=[SPOT.damN,SPOT.damS],L=Math.hypot(b[0]-a[0],b[1]-a[1]);return [a[0]+(b[0]-a[0])*6/L,a[1]+(b[1]-a[1])*6/L];})();
 const passedGate=()=>{const p=me(),{e,n}=EN(p);return Math.hypot(e-SPOT.campGate[0],n-SPOT.campGate[1])<9&&(n<SPOT.campGate[1]-2.5);};
 // The camp gate slams shut. Sam holds the latch; the player pulls the leaf open, out toward the road.
 // Jamie watches the double; you go through, Jamie, Sam last. Behind you every light in the camp
 // goes out at once.
 const nearGateIn=()=>{const p=me(),{e,n}=EN(p);return Math.hypot(e-SPOT.campGate[0],n-SPOT.campGate[1])<14&&n>SPOT.campGate[1]+1;};
 function shoveGate(by){const gt=PN?.dyn?.campGate;if(C.flags.gateOpened)return;C.flags.gateOpened=by;C.flags.gateHelp=by==='you';if(gt){gt.k=1.6;gt.want=1.15;}sound('c5Gate',W5(...SPOT.campGate),{gain:.7});mark('the gate shoved open: '+by);objective('Through the gate.','Jamie first. Sam is holding it.');
  stand(sam,null);GT.friendPush(sam,'campL',{to:1.15,set:()=>{},then:()=>stand(sam,[SPOT.campGate[0]-.6,SPOT.campGate[1]-1.2],{look:()=>camera.position,keep:true,max:5})});}

 function gateShut(){if(C.flags.gateShut)return;C.flags.gateShut=true;C.gateShutAt=C.t;const gt=PN?.dyn?.campGate;if(gt){gt.k=5;gt.want=.04;}sound('fence',W5(...SPOT.campGate),{gain:1});mark('the gate slams shut');T?.set?.(1,{rise:.15,why:'the gate'});
  objective('Help Sam open the gate.','F at the wooden gate. He holds the latch; you pull.');
  say([{who:'JAMIE',text:'“The gate—!”',by:'jamie',time:1,face:'terrified'},{who:'SAM',text:'“I have the latch. PULL!”',by:'sam',time:1.5,face:'determined'},{who:'JAMIE',text:'“It’s still coming. It’s still ME.”',by:'jamie',time:1.7,face:'terrified'}],{interrupt:true});
  const q=GT.barPoint('campL',.84);stand(sam,()=>({x:q.x+.5,z:q.z-.65}),{look:()=>q,keep:true,max:4,gesture:p=>{sam.person.group.updateMatrixWorld(true);const hand=sam.person.group.worldToLocal(q.clone());p[PI.rh]=hand.x;p[PI.rh+1]=hand.y;p[PI.rh+2]=hand.z;p[PI.re]=.6;}});
  stand(jamie,[SPOT.campGate[0]-2,SPOT.campGate[1]+3],{look:()=>({x:camp.D.x,y:camp.D.y+1.35,z:camp.D.z}),keep:true,max:4});}

 function gateScare(){if(C.flags.boundary)return;C.flags.boundary=true;C.esc&&(C.esc.boundary=true);mark('the gate');go('n5-run');
  stand(jamie,[SPOT.campGate[0]+2.2,SPOT.campGate[1]-5],{look:()=>W5(-190,545,4),keep:true,max:4});
  later(1.2,()=>{stand(sam,[SPOT.campGate[0]+1,SPOT.campGate[1]-4],{look:()=>W5(-190,545,4),keep:true,max:4});});
  say([{who:'SAM',text:'“Go. Go, go.”',by:'sam',time:1.2,face:'terrified'},{wait:1.6,act:()=>{camp.allOff();C.darkTo=.85;const gt=PN?.dyn?.campGate;if(gt){gt.want=.04;gt.k=7;}sound('c5Gate',W5(...SPOT.campGate),{gain:.7});camp.D.burst=.5;later(.3,()=>camp.double(false));mark('every light at once');}},{wait:2},
   {who:'JAMIE',text:'“They all went out.”',by:'jamie',time:1.4,face:'afraid'},{who:'SAM',text:'“Don’t look back. Walk.”',by:'sam',time:1.6,face:'afraid'}],
   {interrupt:true,then:outStart});}
 // The dam: the bell rings once, by itself, across the water. Every light goes out.
 function damScare(){if(C.flags.boundary)return;C.flags.boundary=true;C.esc&&(C.esc.boundary=true);mark('the dam');
  say([{wait:1.2,act:()=>{const b=PN?.dyn?.bell;if(b)b.v+=2.2;sound('oldBell',bellPos(),{gain:.7});}},{who:'JAMIE',text:'“The bell.”',by:'jamie',time:1.2},{who:'JAMIE',text:'“Nobody’s there. Nobody’s at the bell.”',by:'jamie',time:2},
   {wait:1.4,act:()=>{camp.allOff();C.darkTo=.85;camp.double(false);mark('every light at once');}},{wait:2},{who:'SAM',text:'“Keep walking. Don’t look back. Keep walking.”',by:'sam',time:2.2}],{interrupt:true,then:outStart});}
 // ---- after: the lamp in the lot -----------------------------------------------------------------------------------------------------------
 function outStart(){if(C.flags.out)return;C.flags.out=true;go('n5-out');C.hMin=Math.max(C.hMin||0,HOUR.out);C.flags.hurry=false;for(const c of [jamie,sam])stand(c,null);follow(true);T?.set?.(.35,{rise:-.05,why:'away from the camp'});
  objective('Stay with them. Follow the shore.','The danger has passed. The lot is farther along this road.');C.out={t:0,start:{x:me().x,z:me().z},travel:0,lp:{x:me().x,z:me().z},transition:false};}
 function updateOut(dt){const p=me();if(near(SPOT.rack.c,6)){aftermath();return;}const O=C.out||(C.out={t:0,start:{x:p.x,z:p.z},travel:0,lp:{x:p.x,z:p.z},transition:false});O.t+=dt;O.travel+=Math.hypot(p.x-O.lp.x,p.z-O.lp.z);O.lp={x:p.x,z:p.z};
  if(!C.flags.o1&&O.t>2&&!busy()){C.flags.o1=true;say([{who:'JAMIE',text:'“Is it following us?”',by:'jamie',time:1.4,face:'afraid'},{who:'SAM',text:C.route==='C'?'“Across the dam. Follow the shore to the lamp.”':'“Follow the shore. The lamp is just past the yellow gate.”',by:'sam',time:2.8,face:'tired'}]);}
  // The emergency has ended. An announced passage of time replaces 190–300 metres of empty recovery walking.
  if(!O.transition&&((O.t>8&&O.travel>9)||O.t>24)&&!busy()&&C.fadeOut<0){O.transition=true;objective('A few minutes later · Pine Ridge parking lot','Together, along the shore.');mark('shore walk time transition');
   carry('rack',[SPOT.rack.c[0]+2.6,SPOT.rack.c[1]-1.6],ha(-130,316,-133,317.5),{after:()=>{C.h+=3/60;camp.double(false);aftermath();}});}}

 function aftermath(){if(C.flags.after)return;C.flags.after=true;go('n5-final');C.hMin=Math.max(C.hMin||0,HOUR.final);checkpoint('c5-second-discovery');mark('the lamp in the lot');C.darkTo=.3;T?.set?.(.18,{rise:-.1,why:'the lamp'});objective('');
  const r=SPOT.rack.c;stand(jamie,[r[0]+1.6,r[1]+1.4],{look:()=>camera.position,keep:true});stand(sam,[r[0]+.4,r[1]-1.8],{look:()=>camera.position,keep:true});
  if(C.fireShot&&!C.flags.fireOnCamera){C.flags.fireOnCamera=true;const s=C.fireShot;C.fireIdx=photo.capture({id:'c5-campfire',date:'08/24/2011',time:s.time,label:'',source:(g,w,h)=>{if(s.canvas)g.drawImage(s.canvas.c,0,0,w,h);else drawFireSketch(g,w,h);}});photo.V.shutter=0;}
  say([{wait:1.4},{who:'JAMIE',text:'“You—”',by:'jamie',time:.8},{who:'JAMIE',text:'“You ran like a duck.”',by:'jamie',time:1.6},{who:'SAM',text:'“I did not run like a duck.”',by:'sam',time:1.6},
   {who:'JAMIE',text:'“Like a DUCK, Sam.”',by:'jamie',time:1.4},{wait:2.6},
   {who:'SAM',text:'“I took it.”',by:'sam',time:1.2,act:()=>sound('click',{x:sam.px,y:1,z:sam.pz},{gain:.3})},{who:'SAM',text:'“His shirt. It’s in my bag. I don’t know why I took it.”',by:'sam',time:2.8},
   {who:'YOU',text:'“We give it to his mom.”',time:1.6},{who:'SAM',text:'“And tell her what?”',by:'sam',time:1.4},{wait:1.6},
   {who:'SAM',text:'“It didn’t start till we found it. Nothing happened. Then we found the shirt.”',by:'sam',time:3.2},{who:'JAMIE',text:'“Like it was waiting.”',by:'jamie',time:1.6},
   {who:'SAM',text:'“Like it knew we’d come.”',by:'sam',time:1.6},{wait:2.4},{who:'JAMIE',text:'“…I was really scared.”',by:'jamie',time:1.8},{who:'SAM',text:'“Me too.”',by:'sam',time:1},{who:'YOU',text:'“Me too.”',time:1},
   {wait:1.8},{who:'SAM',text:'“Let me see the camera. The register. I want to read it again.”',by:'sam',time:2.6}],
   {then:()=>{C.flags.review=true;C.revT=0;objective('Look at Alex’s camera.','V.');}});}
 function updateFinal(dt){if(C.flags.review&&!C.flags.found){C.revT+=dt;const cur=photo.current;
   if(C.view==='camera'&&photo.V.i===C.fireIdx){C.dwell=(C.dwell||0)+dt;if(C.dwell>1.2)secondDiscovery();}
   if(C.revT>24&&!C.flags.revNudge&&!busy()){C.flags.revNudge=true;say([{who:'SAM',text:C.view==='camera'?'“The last one. Go to the last one.”':'“The camera. Look.”',by:'sam'}]);}
   if(C.revT>(C.revAgain||60)&&!busy()){C.revAgain=C.revT+60;say([{who:'JAMIE',text:C.view==='camera'?'“Go to the last one. The very last.”':'“Look at the camera. The pictures.”',by:'jamie'}]);}void cur;}
  if(C.flags.finalImage&&C.endT<0){C.fiT=(C.fiT||0)+dt;const q=owlLamp();if(q&&k.camLooksAt(q,.985))C.fiLook=(C.fiLook||0)+dt;if(C.fiLook>2.2||C.fiT>20){C.endT=0;mark('one light');}}}
 function secondDiscovery(){if(C.flags.found)return;C.flags.found=true;objective('');mark('the last picture');T?.set?.(.4,{rise:.08,why:'the last picture'});
  say([{wait:.6},{who:'SAM',text:'“…That’s not the register.”',by:'sam',time:1.6},{who:'JAMIE',text:'“That’s us. At the fire.”',by:'jamie',time:1.6},{who:'YOU',text:'“From the trees. Behind us.”',time:1.8},
   {who:'SAM',text:()=>`“${spoken(C.fireShot?.h??HOUR.fire+.2).replace(/^./,c=>c.toUpperCase())}.”`,by:'sam',time:1.4},{who:'SAM',text:'“The camera was in your pocket. The whole time. Nobody took that.”',by:'sam',time:2.8,face:'afraid'},{wait:2},
   {who:'JAMIE',text:'“…Alex?”',by:'jamie',time:1.4},{who:'JAMIE',text:'“It’s his camera. Maybe he— maybe he was right there.”',by:'jamie',time:2.8},{who:'SAM',text:'“Then why didn’t he say anything?”',by:'sam',time:2},
   {who:'JAMIE',text:'“Maybe he couldn’t.”',by:'jamie',time:1.8},{wait:3},
   {who:'JAMIE',text:'“I’m starving.”',by:'jamie',time:1.4,act:()=>{const bar=G5.S.bars.find(b=>b.state==='stored');if(bar){stand(jamie,null);comp.run(jamie,[...G5.bagSteps(jamie,{take:()=>bar,onTake:it=>{if(it)it.given=true;}})],{then:()=>stand(jamie,null)});}}},{wait:3.6},
   {who:'SAM',text:'“You brought a sock.”',by:'sam',time:1.6},{who:'JAMIE',text:'“It’s a good sock.”',by:'jamie',time:1.6},{wait:1.4},
   {who:'SAM',text:'“Tomorrow we tell somebody.”',by:'sam',time:1.8},{who:'JAMIE',text:'“Tell them what?”',by:'jamie',time:1.2},{wait:1.2},{who:'SAM',text:'“…Everything.”',by:'sam',time:1.4},{wait:2.6},
   {who:'JAMIE',text:'“Guys.”',by:'jamie',time:1.2,act:()=>{if(C.view==='camera')closeView();camp.set('owl',.9,{rate:.6});mark('Owl, across the water');finalSpots();}}],
   {then:()=>{C.flags.finalImage=true;C.fiT=0;checkpoint('chapter5-end');}});}
 // where the lawn runs down to the water, looking across it at the camp
 const EDGE_J=[-151,346.5],EDGE_S=[-149.2,344.6];
 function finalSpots(){stand(jamie,EDGE_J,{look:()=>owlLamp(),keep:true,max:1.4,leash:60});stand(sam,EDGE_S,{look:()=>owlLamp(),keep:true,max:1.2,leash:60});}
 function end(){const el=$('ending');if(el){const h=el.querySelector?.('h2'),pp=el.querySelector?.('p'),eb=el.querySelector?.('.eyebrow');if(eb)eb.textContent='LAST LIGHT';if(h)h.innerHTML='Chapter Five';if(pp)pp.textContent='August 24, 2011.';}
  const nb=$('next-chapter');if(nb){nb.hidden=!A5.next;if(A5.next)nb.innerHTML='Chapter Six <span>→</span>';}A5.finished=true;o.finish();}
 // ---- the story never waits forever: a fade, and the three of you a little further on --------------------------------------------------------
 // (a carry puts each of the three on ground they can walk: the nearest such place to the one asked for)
 function landing(e,n){const ok=(a,b)=>{const w=W5(a,b);return nav.walkable(w.x,w.z,{r:.3});};if(ok(e,n))return [e,n];
  for(let r=.5;r<=6;r+=.5)for(let i=0;i<16;i++){const t=i/16*Math.PI*2,a=e+Math.sin(t)*r,b=n+Math.cos(t)*r;if(ok(a,b))return [a,b];}return [e,n];}
 function carry(why,q0,a,{after=null}={}){if(C.fadeOut>=0)return;C.flags['carried-'+why]=true;mark('carried on: '+why);C.fadeOut=0;
  C.after=()=>{const r=o.roam,q=landing(q0[0],q0[1]);youFoot(q[0],q[1],a,null,{x:r.x,z:r.z,a:r.a});const J=landing(q[0]-Math.sin(a)*1.3+Math.cos(a)*.9,q[1]-Math.cos(a)*1.3-Math.sin(a)*.9),Sq=landing(q[0]-Math.sin(a)*1.6-Math.cos(a)*.9,q[1]-Math.cos(a)*1.6+Math.sin(a)*.9);
   for(const [c,w] of [[jamie,J],[sam,Sq]]){const bk=c.bike.group.visible?{x:c.bx,z:c.bz,a:c.ba,kick:c.kick,fall:c.fall}:null,ww=W5(...w);comp.putFoot(c,ww.x,ww.z,a,{bike:bk});c.follow=null;}
   follow(true);standAll();C.fadeIn=0;after?.();};}
 // ---- you, them, the bikes: where a jump puts everyone -------------------------------------------------------------------------------------
 function youFoot(e,n,a,bike=null,bikeW=null){const q=W5(e,n),b=bikeW||(bike?W5(bike.e,bike.n):null);o.placePlayer({x:q.x,z:q.z,a,mode:'walk',bike:b?{x:b.x,z:b.z,a:bikeW?bikeW.a:bike.a??a}:undefined});}
 function youRide(q,a,speed=3){o.placePlayer({x:q.x,z:q.z,a,mode:'ride',speed});}
 function boyFoot(c,e,n,a,bike){const q=W5(e,n),b=bike?W5(bike.e,bike.n):null;comp.putFoot(c,q.x,q.z,a,{bike:b?{x:b.x,z:b.z,a:bike.a??a,kick:bike.kick??1,fall:bike.fall??0}:null});c.follow=null;c.lookAt=null;}
 function boyRide(c,q,a,speed=3){comp.putRiding(c,q.x,q.z,a,speed);c.follow='ride';}
 // the boys' bikes go into the rack as soon as each is off his and on foot (Sam lines them up; his cable lock through all three)
 function rackBikes(){if(!C.flags.locked)return;C.racked||={};for(const [i,c] of [[0,jamie],[2,sam]]){if(C.racked[c.key]||c.mode!=='foot'||(c.script&&!c.script.spot5))continue;const q=W5(RACK[i].e,RACK[i].n),sp=C.spot[c.key];
   comp.putFoot(c,c.px,c.pz,c.pa,{bike:{x:q.x,z:q.z,a:RACK[i].a,kick:1,fall:0}});C.racked[c.key]=true;if(sp)stand(c,sp.q,sp);else if(C.match)c.follow='walk';}}
 // ---- the spots F works on --------------------------------------------------------------------------------------------------------------
 function spots(){if(nextOwns())return A5.next.spots();const out=[],ph=S.phase,p=me();if(C.view||C.fadeOut>=0||posed()||C.lapse)return out;
  const add=(id,label,q,face,r=2.4,o2={})=>out.push({id,label,at:q,face:face||q,r,wide:true,...o2});
  if(ph==='d5-garage')G5.spots(add);
  if(ph==='d5-fire'&&C.flags.fireStood&&!C.pose){const q=W5(...SEATS[0].seat);add('c5-resit','Sit back down',q,W5(...FIRE),3.2);}
  if((ph==='d5-park'||ph==='d5-stones'||ph==='d5-dock'||ph==='d5-sign')&&!C.flags.locked&&p.walking)add('c5-lock','Lock the bikes',rackSpot(),rackSpot(),3.4);
  if(/^d5-(stones|dock|park)$/.test(ph)&&near(STONES,10))PK.spots(add);
  if(S.phase.startsWith('d5')&&near(GATE,6))GT.spots(add);
  GR.spots(add);
  if(C.flags.gateShut&&!C.flags.gateOpened&&near(SPOT.campGate,5)){const q=GT.barPoint('campL',.75);add('c5-shove','Help Sam — pull the gate',q,q,2.6);}
  if(ph==='d5-dock'&&!C.flags.dock)add('c5-sit','Sit down',W5(...DOCK_END,dockY()),W5(...DOCK_END,dockY()),2.6);
  if(ph==='d5-map'&&!C.flags.map){const q=W5(...KIOSK);add('c5-map','Read the trail map',q,q,2.8);}
  if(ph==='d5-gate'&&C.flags.choose&&!C.choice){add('c5-go','Go with Jamie',W5(...GATE),W5(...GATE_IN),3.6);add('c5-hear','Hear Sam out',{x:sam.px,z:sam.pz,y:gy(sam.px,sam.pz)},{x:sam.px,z:sam.pz},3.2);}
  if(ph==='d5-camp'||ph==='e5-dusk'||ph==='e5-owl'){
   for(const key of ['office','lodge','bluejay','cardinal','owl']){if(DOORS[key].open>.5)continue;if(key==='owl'&&ph==='d5-camp'){if(C.flags.owlStuck)continue;const b=BLD.owl,[e,n]=b.F.to(b.door[0],b.d/2+.55),q=W5(e,n,b.y+b.floor);add('c5-owl-stuck','Try the door',q,q,2.1);continue;}const b=BLD[key],[e,n]=b.F.to(b.door[0],b.d/2+.55),q=W5(e,n,b.y+b.floor);add('c5-door-'+key,key==='lodge'?'Open the doors':'Open the door',q,q,Math.max(2.1,(b.porch||0)+1));}
   if(ph==='d5-camp'){if(inside('office')){if(!C.read.size||C.read.size<REGISTER.length)add('c5-register','Read the register',regPos(),regPos(),1.9);if(!C.flags.searchmap){const R=PN.anchors.searchMap,b=BLD.office,[e,n]=b.F.to(R.x,-R.z),w=W5(e,n);add('c5-searchmap','Look at the map on the board',{x:w.x,y:b.y+R.y,z:w.z},null,2.2);}}
    if(inside('lodge')){if(!C.flags.pantry)add('c5-pantry','Look at the shelves',pantryPos(),null,2.4);if(!C.flags.photosLook){const b=BLD.lodge,[e,n]=b.F.to(0,-b.d/2+.4),w=W5(e,n);add('c5-photos','Look at the photographs',{x:w.x,y:b.y+b.floor+1.6,z:w.z},null,2.8);}}
    if(!C.flags.campMap&&near(SPOT.mapBoard,3)){const q=W5(...SPOT.mapBoard);add('c5-campmap','Look at the camp map',q,q,3);}
    if(near(SPOT.bell,2.6)&&!inAny()){const q=W5(...SPOT.bell);add('c5-bell','Ring the bell',q,q,2.6);}
    if(C.flags.fireOffer&&!C.flags.fire){const q=W5(...SEATS[0].seat);add('c5-fire','Sit down',q,W5(...FIRE),3.2);}}
   if(ph==='e5-owl'&&inside('owl')){if(!C.flags.shirtSeen)add('c5-shirt','Look at the shirt',shirtPos(),null,2.6);if(C.flags.shirtDone&&!C.flags.carvingSeen)add('c5-carving','Look at the carving',carving.position,null,2.2);}}
  if(ph==='n5-window'&&C.win?.stage==='wait'&&near(OWL_PORCH,4.2)){const D=DOUBLE();add('c5-window','Look inside',{x:D.x,y:D.y+1.4,z:D.z},null,4.2);}
  return out;}
 function act(id){if(nextOwns()){A5.next.act(id);return;}if(id.startsWith('g5-')&&G5.act(id))return;if(id.startsWith('p5-')&&PK.act(id))return;if(PK.holding)PK.drop();if(id.startsWith('c5-gate:')&&GT.act(id))return;if(GR.act(id))return;if(id==='c5-shove'){phys.playerReach({at:()=>GT.barPoint('campL',.75),dur:[.38,.65,.4],carry:false,onContact:()=>shoveGate('you')});return;}if(id==='c5-resit')sitFire();else if(id==='c5-lock')lockBikes();else if(id==='c5-sit')sitDock();else if(id==='c5-map')readMap();
  else if(id==='c5-go')choose('jamie');else if(id==='c5-hear')choose('sam');else if(id==='c5-owl-stuck'){C.flags.owlStuck=true;sound('thud',roomV('owl',0,BLD.owl.d/2,1),{gain:.5});say([{who:'SAM',text:'“It’s stuck. Swollen shut. Leave it.”',by:'sam'}]);}else if(id.startsWith('c5-door-'))openDoor(id.slice(8));else if(id==='c5-register')openRegister();else if(id==='c5-searchmap')lookSearchMap();
  else if(id==='c5-pantry')lookPantry();else if(id==='c5-photos')lookPhotos();else if(id==='c5-campmap')lookCampMap();else if(id==='c5-bell')ringBell();else if(id==='c5-fire')toFire();
  else if(id==='c5-shirt')lookShirt();else if(id==='c5-carving')lookCarving();else if(id==='c5-window'){if(C.win)C.win.lookT=1;}}
 // ---- Alex's camera: looking at the pictures, and taking new ones of what you find ---------------------------------------------------------
 const canCamera=()=>C.inv.camera&&me().walking&&!C.view&&C.fadeOut<0&&S.phase!=='c5-black'&&!C.lapse&&!(posed()&&!C.lookKind);
 function openCamera(i){photo.open(i);C.view='camera';C.viewT=0;o.roam.walkLock=true;}
 function closeView(){if(C.view==='camera')photo.close();if(C.view==='register')return closeRegister();C.view=null;if(!posed())o.roam.walkLock=false;}
 // a picture of what you are looking at (the register's page, the map, the shelves, the shirt, the carving): rendered where
 // the game can render (what the camera sees), otherwise drawn from the thing itself
 let rt=null;
 function photograph(kind){if(C.photos.includes(kind+(kind==='register'?C.page:'')))return false;const key=kind+(kind==='register'?C.page:'');C.photos.push(key);
  let px=null;try{if(o.shoot&&o.readPixels&&typeof THREE.WebGLRenderTarget==='function'){rt||=new THREE.WebGLRenderTarget(640,480,{colorSpace:THREE.SRGBColorSpace});const cam=photo.cam||new THREE.PerspectiveCamera(50,4/3,.05,200);
   cam.position.copy(camera.position);cam.quaternion.copy(camera.quaternion);cam.fov=46;cam.aspect=4/3;cam.near=.05;cam.updateProjectionMatrix();cam.updateMatrixWorld();if(GR.hidden(()=>o.shoot({cam,target:rt})))px=o.readPixels(rt,640,480);}}catch{px=null;}
  const pg=C.page;photo.capture({id:'c5-'+key,date:'08/24/2011',time:fmt(C.h).replace(' ',''),label:kind.toUpperCase(),source:(g,w,h)=>{if(px){photo.toCanvas({g,c:g.canvas},px,{});return;}drawEvidence(g,w,h,kind,pg);}});
  sound('click',camera.position,{gain:.4});mark('a picture: '+key);return px?{px,w:640,h:480}:true;}
 function drawEvidence(g,w,h,kind,pg){g.fillStyle='#2a2420';g.fillRect(0,0,w,h);g.save();g.translate(w/2,h/2);g.rotate(-.04);
  const sub=(fn,sw,sh)=>{const cv=canvas(sw,sh);if(!cv)return;try{fn(cv.g,sw,sh);}catch{}g.drawImage(cv.c,-w*.42,-h*.4,w*.84,h*.8);};
  if(kind==='register')sub((gg,ww,hh)=>registerPageArt(gg,ww,hh,pg),1024,730);else if(kind==='searchmap')sub(searchMapArt,720,540);else if(kind==='carving')sub(freshCarvingArt,512,330);
  else if(kind==='shirt'){g.fillStyle='#5a4632';g.fillRect(-w*.45,-h*.45,w*.9,h*.9);g.fillStyle='#d4b25a';g.fillRect(-w*.16,-h*.22,w*.32,h*.5);g.fillStyle='#9a8040';g.fillRect(-w*.1,h*.05,w*.14,h*.12);g.fillStyle='#f0e6c8';g.fillRect(-w*.05,-h*.24,w*.1,h*.05);}
  else{g.fillStyle='#4a3a28';g.fillRect(-w*.45,-h*.4,w*.9,h*.8);g.fillStyle='#8a7a5a';for(let i=0;i<9;i++)if(i!==4&&i!==5)g.fillRect(-w*.4+i*w*.09,-h*.05,w*.06,h*.1);}
  g.restore();const v=g.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,h*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(0,0,w,h);}
 function key(code,repeat){if(nextOwns())return A5.next.key(code,repeat);if(!mine(S.phase))return false;
  // the inventory (I): not over a view, a fade or the black; while it is open, every key is its
  if((code==='KeyI'||code==='Tab')&&!GR.inv.isOpen&&(C.view||C.fadeOut>=0||C.endT>=0||S.phase==='c5-black'||C.lapse))return true;if(GR.inv.key(code,repeat))return true;
  // T: the flashlight (out of your pocket and on; on and off in your hand), whenever you have it, day or night
  if(code==='KeyT'&&!C.view){if(!repeat&&C.inv.flashlight)GR.toggle();return !!C.inv.flashlight;}
  if(PK.key(code,repeat))return true;
  if(code==='KeyV'){if(C.view==='camera'){if(!repeat)closeView();return true;}
   if(C.view==='register'){if(!repeat)GR.shoot(()=>photograph('register'));return true;}
   if(C.view==='look'&&C.lookKind){if(!repeat){const k2=C.lookKind;GR.shoot(()=>photograph(k2));}return true;}
   if(canCamera()){if(!repeat){const last=photo.photos.length-1,i=S.phase==='d5-sign'||S.phase==='d5-map'?Math.max(0,ch4.leadIndex()):C.flags.review&&C.fireIdx!=null?C.fireIdx:S.phase.startsWith('n5')||S.phase.startsWith('e5')?last:Math.max(0,ch4.leadIndex());openCamera(i);}return true;}return false;}
  if(C.view==='camera'){if(code==='KeyA'||code==='ArrowLeft'){photo.browse(-1);return true;}if(code==='KeyD'||code==='ArrowRight'){photo.browse(1);return true;}
   if(code==='KeyW'||code==='ArrowUp'){photo.zoomBy(1);return true;}if(code==='KeyS'||code==='ArrowDown'){photo.zoomBy(-1);return true;}return ['Space','KeyQ','KeyE','KeyC','KeyT','KeyF'].includes(code);}
  if(C.view==='register'){if(code==='KeyA'||code==='ArrowLeft'){showPage(C.page-1);return true;}if(code==='KeyD'||code==='ArrowRight'||code==='KeyF'){if(!repeat)showPage(C.page+1);return true;}
   if(code==='KeyS'||code==='ArrowDown'||code==='Escape'){if(!repeat)closeRegister();return true;}return ['KeyW','Space','KeyQ','KeyE','KeyC','KeyT'].includes(code);}
  if(C.view==='look'){if((code==='KeyS'||code==='ArrowDown')&&!busy()){if(!repeat)endLook();return true;}return ['KeyW','KeyA','KeyD','Space','KeyC'].includes(code);}
  if(S.phase==='d5-fire'&&posed()&&!C.lapse&&(code==='KeyS'||code==='ArrowDown')){if(!repeat){unpose();C.flags.fireStood=true;}return true;}
  return false;}
 function pan(dx,dy){if(nextOwns())return A5.next.pan(dx,dy);if(!mine(S.phase))return false;if(C.view==='camera'){photo.pan(dx,dy);return true;}return false;}
 function wheel(dy){if(nextOwns())return A5.next.wheel(dy);if(!mine(S.phase)||C.view!=='camera')return false;photo.zoomBy(dy<0?1:-1);return true;}
 function hint(){if(nextOwns())return A5.next.hint?.()??null;const ph=S.phase;
  if(C.view==='camera')return [['A / D','Previous / next'],['W / S','Zoom'],...(photo.V.zoom>1.05?[['Mouse','Move around']]:[]),['V','Lower the camera']];
  if(C.view==='register')return [['A / D','Turn the page'],['V','Take a picture'],['S','Stand up']];
  if(C.view==='look'&&C.lookKind)return C.photos.includes(C.lookKind)?null:[['V','Take a picture']];
  if(S.phase==='d5-fire'&&posed()&&!C.lapse)return [['S','Stand up']];
  if(PK.holding)return PK.winding?[['Let go of F','Throw']]:[['Hold F','Wind up, then let go'],['C','Get low'],['Mouse','Aim low, across the water']];
  if(canCamera()&&(ph==='d5-sign'||(C.flags.review&&!C.flags.found)))return [['V','Raise Alex’s camera']];
  if(C.inv.flashlight&&!o.foot?.on&&inAny()&&sky().day>.4&&!C.flags.batteries&&!C.flags.dead)return [['T','Flashlight']];
  return null;}
 function updateView(dt){if(C.view==='camera'){C.viewT+=dt;if(photo.current&&!photo.current.canvas&&!photo.current.lead)photo.take(photo.V.i);}}
 // ---- sounds in the world, what is in the way --------------------------------------------------------------------------------------------
 function sources(out){if(nextOwns())A5.next.sources(out);}
 function blockers(){if(nextOwns())return A5.next.blockers();const out=[];out.push(...creature.colliders());if(S.phase==='d5-garage')G5.blockers(out);if(camp.D.person.group.visible)out.push({x:camp.D.x,z:camp.D.z,r:.3,speed:0});return out;}
 function updateAmb(dt){const ph=S.phase,L=sky(),p=me(),pine=where(p).street==='pine',campArea=pine&&EN(p).n>480;let want;
  if(/^n5-(split|window)$/.test(ph))want={traffic:0,life:0,insects:.35,wind:.5,forest:.5,tunnel:0,water:.25};
  else if(ph==='n5-run')want={traffic:0,life:0,insects:.15,wind:.7,forest:.4,tunnel:0,water:.2};
  else want={traffic:pine?0:.6,life:L.day>.3?(campArea?.25:.8):.2,insects:smooth((C.h-19.2)/.8),wind:.8,forest:pine?(campArea?1:.5):0,tunnel:0,water:pine?(EN(p).n>280?.8:.2):0};
  for(const kk in want)C.amb[kk]=damp(C.amb[kk]??0,want[kk],.6,dt);}
 // Jamie's flashlight (when it is on): where he points it
 function jamieSweep(t){if(nextOwns())return A5.next.jamieSweep?.(t)??null;const X=C.split,ph=S.phase;if(ph==='n5-window'){const D=DOUBLE();return {x:D.x,y:D.y+1.2,z:D.z};}if(X&&!X.resolved&&owlLamp())return {x:owlLamp().x,y:owlLamp().y-1,z:owlLamp().z};
  const c=jamie,x=c.mode==='foot'?c.px:c.bx,z=c.mode==='foot'?c.pz:c.bz,a=(c.mode==='foot'?c.pa:c.ba)+Math.sin(t*.6)*.45;return {x:x+Math.sin(a)*6,y:gy(x+Math.sin(a)*6,z-Math.cos(a)*6),z:z-Math.cos(a)*6};}
 // ---- every frame ---------------------------------------------------------------------------------------------------------------------------
 // wading where the water is shallow: slower, and the water rings round your steps (chapter5-park.js)
 function wade(dt){const p=me();if(!p.walking||!/^d5-/.test(S.phase))return;PK.wading(dt,p,(C.wadeGait=(C.wadeGait||0)+(p.speed||0)*dt/1.1));}
 // The dock: a nudge; then Jamie and Sam go and sit at the end themselves, and the memory waits for you to come and sit
 // with them (it starts when you sit, or when you are close); if you never come, the afternoon goes on without it.
 function updateDock(dt){if(C.flags.dock)return;const t=S.pt;
  if(t>40&&!C.flags.dockNudge&&!busy()){C.flags.dockNudge=true;say([{who:'SAM',text:'“Come sit. At the end.”',by:'sam'}]);}
  if(t>95&&!C.flags.dockAhead){C.flags.dockAhead=true;const yaw=DOCK.a,fx=Math.sin(yaw),fz=-Math.cos(yaw);for(const c of [jamie,sam]){const q=DOCK_SEAT(SEAT_X[c.key]),front={x:q.x-fx*.55,z:q.z-fz*.55};const pth=nav.walkPath({x:c.px,z:c.pz},front);stand(c,null);
    comp.run(c,[comp.steps.walkTo(c,pth.length?pth:[[front.x,front.z]],{speed:1.1}),comp.steps.turnTo(c,yaw,.5),phys.sit(c,{seat:()=>({...DOCK_SEAT(SEAT_X[c.key]),a:yaw}),legs:'hang',hands:'deck',until:()=>C.flags.dock,look:()=>camera.position})]);}}
  if(C.flags.dockAhead&&jamie.seated&&near(DOCK_END,5)&&me().walking&&!C.flags.dock&&!busy()&&t>100){/* (close enough: you sit down with them) */}
  // (you never came: they get up off the end as Sam says it, from the sit they are in, a step back onto the boards, and walk in)
  if(t>260&&!C.flags.dockSkip&&!busy()){C.flags.dockSkip=true;C.flags.dock=true;C.flags.dockUp=true;
   for(const c of [jamie,sam]){const sitting=c.seated||(c.sitW||0)>.4,back=W5(...DOCK_F.to(SEAT_X[c.key]*.7,DOCK.len-2.4-(c===sam?.6:0)));comp.run(c,[...(sitting?[phys.rise(c,{back:-.5})]:[]),comp.steps.walkTo(c,[[back.x,back.z]],{speed:1})],{then:()=>{stand(c,null);follow(true);}});}
   say([{who:'SAM',text:'“Okay. Let’s go find where his picture was.”',by:'sam'}],{then:()=>signStart()});}}
 // the mood and what is worth a look, by where the chapter is (set when it changes)
 function mind(){const ph=S.phase,key=ph+(C.flags.hurry?'!':'');if(C.mindKey===key)return;C.mindKey=key;let mood='relaxed',pois=[],goal=null;
  if(/^d5-(park|dock)$/.test(ph))pois=PLACES.PARK;
  else if(/^d5-(sign|map)$/.test(ph)){mood='explore';pois=[...PLACES.PARK,...PLACES.OLDLOT];}
  else if(ph==='d5-gate')pois=PLACES.OLDLOT;
  else if(ph==='d5-road'){mood='explore';pois=PLACES.ROAD;goal=W5(...SPOT.campGate);}
  else if(ph==='d5-camp'||ph==='d5-fire'){mood='explore';pois=PLACES.CAMP;}
  else if(ph==='e5-dusk'){mood='explore';pois=PLACES.CAMP;goal=W5(...OWL_FRONT);}
  else if(/^e5-(owl|call)$/.test(ph))mood='tense';
  else if(ph==='e5-lights'){mood='tense';goal=W5(...SPOT.campGate);}
  else if(/^n5-(split|window)$/.test(ph))mood='danger';
  else if(ph==='n5-run'){mood='escape';goal=W5(...SPOT.campGate);}
  else if(ph==='n5-out'){mood='tense';goal=rackSpot();}
  brain.setScene({mood,pois,goal});}
 function update(dt){if(nextOwns()){A5.next.update(dt);return;}C.t+=dt;C.pt+=dt;const ph=S.phase;mind();
  for(let i=C.timers.length-1;i>=0;i--)if(C.t>=C.timers[i].at){const f=C.timers[i].fn;C.timers.splice(i,1);f();}
  clock(dt);
  updatePose(dt);match(dt);rackBikes();seatSnap();guard(dt);standAll();photo.update(dt);updateView(dt);PK.update(dt);GT.update(dt);GR.update(dt);if(GR.inv.isOpen&&(C.view||posed()||C.fadeOut>=0||C.endT>=0))GR.inv.close();wade(dt);updateRings(dt);updateCrt(dt);camp.update(dt,{groundY:gy});updateAmb(dt);
  C.dark=damp(C.dark,C.darkTo||0,(C.darkTo||0)>C.dark?1.3:.7,dt);
  if(C.fadeIn>=0){C.fadeIn+=dt;o.fade(1-smooth(C.fadeIn/1.6));if(C.fadeIn>=1.6){o.fade(0);C.fadeIn=-1;}}
  if(C.fadeOut>=0){C.fadeOut+=dt;o.fade(smooth(C.fadeOut/.8));if(C.fadeOut>=1){C.fadeOut=-1;const f=C.after;C.after=null;f?.();}}
  if(ph==='c5-black'){C.cardT+=dt;if(C.cardT>.4&&C.cardT<4.6&&!C.cardOn)card(true,'Chapter Five','THE PLACE IN THE PICTURE');if(C.cardT>4.6&&C.cardOn)card(false);if(C.cardT>5.8)opening();}
  else if(ph==='d5-garage')updateGarage(dt);
  else if(ph==='d5-ride')updateRide(dt);
  else if(ph==='d5-park'){if(!C.flags.locked&&S.pt>120&&!C.flags.lockNudge&&!busy()){C.flags.lockNudge=true;say([{who:'SAM',text:'“The rack’s by the lot. Over there.”',by:'sam'}]);}
   // (on foot and still not there: Sam does it himself, and the afternoon goes on)
   if(!C.flags.locked&&S.pt>200&&me().walking&&!C.view&&!busy()){say([{who:'SAM',text:'“Fine. I’ll do it.”',by:'sam',time:1.3}]);lockBikes();}}
  else if(ph==='d5-stones')updateStones(dt);
  else if(ph==='d5-dock')updateDock(dt);
  else if(ph==='d5-sign')updateSign(dt);
  else if(ph==='d5-map'){if(near(GATE,4.6)){go('d5-gate');atGate();}else if(S.pt>150&&!C.flags.map)readMapFallback();if(S.pt>320&&!C.flags.mapAhead&&!busy()){C.flags.mapAhead=true;say([{who:'JAMIE',text:'“Forget the map. The road. Through the gate.”',by:'jamie'}]);}if(false)carry('gate',[GATE[0]+.6,GATE[1]-5],ha(GATE[0]+.6,GATE[1]-5,...GATE),{after:()=>{go('d5-gate');atGate();}});}
  else if(ph==='d5-gate'){if(C.flags.road)go('d5-road');else updateGate(dt);}
  else if(ph==='d5-road')updateRoad(dt);
  else if(ph==='d5-camp')updateCamp(dt);
  else if(ph==='e5-dusk')updateDusk(dt);
  else if(ph==='e5-owl'){updateOwl(dt);lightsAtDusk();}
  else if(ph==='e5-call')lightsAtDusk();
  else if(ph==='e5-lights'){updateLights(dt);lightsAtDusk();}
  else if(ph==='n5-split'){if(C.split&&!C.split.resolved)updateSplit(dt);else if(C.flags.toWindow)updateToWindow(dt);lightsAtDusk();}
  else if(ph==='n5-window'){updateWindow(dt);lightsAtDusk();}
  else if(ph==='n5-run'){updateRun(dt);if(C.win?.stage==='run')updateWindow(dt);lightsAtDusk();}
  else if(ph==='n5-out'){updateOut(dt);lightsAtDusk();}
  else if(ph==='n5-final'){updateFinal(dt);lightsAtDusk();if(C.endT>=0){C.endT+=dt;o.fade(smooth(C.endT/4));if(C.endT>4.6){go('n5-end');end();}}}
  const L5=sky();A.day=L5.day;A.night=L5.night;ch2.day=A.day;A.shade=0;A.barLight=false;}
 function readMapFallback(){if(C.flags.mapNudge)return;C.flags.mapNudge=true;say([{who:'SAM',text:'“The map’s by the bathrooms. Or we just follow the road.”',by:'sam'}]);}
 // ---- lifecycle --------------------------------------------------------------------------------------------------------------------------------
 const DOOR0=Object.fromEntries(Object.entries(DOORS).map(([key,d])=>[key,d.open]));
 function reset(){A5.next?.reset();A5.finished=false;const hadPose=C.pose,hadView=!!C.view;card(false);if(C.view==='camera')photo.close();camp.reset();camp.attach(false);nav.setPine?.(false);slabs(false);faces(false);o.foot.fpBody=false;props.removeFromParent();shirt.visible=false;carving.visible=false;pageG.visible=false;stone.visible=false;G5.reset();PK.reset();GT.reset();GR.reset();o.setPace?.(1);phys.reset();if(o.foot.arms===phys.arms)o.foot.arms=null;
  for(const r of RINGS){r.m.visible=false;r.t=9;}for(const key of Object.keys(DOORS))DOORS[key].open=DOOR0[key]??0;const gt=PN?.dyn?.campGate;if(gt){gt.want=-1.25;gt.k=1.4;}
  const bell=PN?.dyn?.bell;if(bell){bell.v=0;bell.swing=0;bell.yoke.rotation.z=0;}if(PN?.lights?.lot)PN.lights.lot.level=0;
  if(C.crt){creature.reset();creature.show(false);}creature.ground=null;
  if(hadPose&&S.pose===hadPose)k.setPose(null);if(hadPose||hadView)o.roam.walkLock=false;fresh();}
 // QA jumps, DEV scenes and Continue: the chapter at one of its moments, everything it needs set up (the flags of every beat
 // before it set the way playing it sets them).
 // (a scene started from the menu or a checkpoint starts with its doors and gates where it wants them, not swinging there)
 function jump(section){if(A5.next?.handles?.(section)&&!SECTIONS5.includes(section)&&!ALIAS5[section]){reset();A5.next.jump(section);return;}jumpTo(section);try{PN?.update?.(0,{});}catch{}}
 function jumpTo(section){section=ALIAS5[section]||section;reset();S.queue.length=0;S.line=null;S.lookTarget=null;S.jamieAim=null;S.samAim=null;o.fade(0);comp.reset();minds();
  if(section==='chapter5-start'){begin();return;}
  common();dayWorld();objective('');inventory();
  const ix=SECTIONS5.indexOf(section),ff=(...ks)=>{for(const kk of ks)C.flags[kk]=true;},hh=h=>{C.h=h;C.minute=-1;date(h);};
  const quiet=()=>{S.queue.length=0;S.line=null;};
  // ---- Sam's garage ----
  phys.reset();o.foot.arms=phys.arms;
  // (the yellow gate as the boys left it: shut until they come to it, then open, walked round by Jamie)
  if(ix>SECTIONS5.indexOf('c5-gate-decision'))GT.setOpen('swing','jamie');else GT.setShut('swing');
  if(ix<=SECTIONS5.indexOf('c5-departure')){garageScene();hh(HOUR.start+.03);C.inv.camera=false;
   if(section==='c5-garage'){go('d5-garage');C.g={t:0};ff('packReady');G5.startPacking();objective('Help Sam pack.','The supplies on the table. F picks one up; F on the bag puts it in.');return;}
   // (everything packed, the camera in your pocket: Jamie on his way)
   go('d5-garage');C.g={t:0};ff('packReady','packed');for(const P of G5.S.items)P.storeIn(G5.S.bag);G5.S.flags.packing=G5.S.flags.allPacked=G5.S.flags.offer=G5.S.flags.cameraAsked=G5.S.flags.cameraTaken=true;G5.S.cam.hide();G5.wearBags();G5.S.flags.shouldered=true;C.inv.camera=true;quiet();jamieArrives();return;}
  G5.wearBags({after:true});
  ff('packReady','packed','jamieComing','departure','leave','toRoad');C.inv.camera=true;
  // ---- the Old Reservoir Road ----
  if(ix<=SECTIONS5.indexOf('c5-crest')){go('d5-ride');hh(HOUR.ride+(section==='c5-ride'?0:.05));objective('Ride to Pine Ridge.','Through town, then north on Mill Street, past the sawhorse.');
   if(section==='c5-ride'){ridePlace(-6.5,3.2);later(1.2,raceOffer);return;}
   if(section==='c5-race'){placeOnOrr(70,3.6);C.race={start:C.t,winner:null,you:70,jamie:74,racing:true};raceLeg(74);return;}
   placeOnOrr(CREST_S-14,3.4);C.race={start:C.t,winner:'jamie',you:CREST_S-14,jamie:CREST_S,racing:true,at:C.t};return;}
  ff('crest','arrived');
  // ---- the park ----
  if(ix<=SECTIONS5.indexOf('c5-park')){hh(HOUR.arrive);go('d5-park');checkpoint('c5-arrival');
   if(section==='c5-arrival'){placeOnOrr(280,3.2);C.flags.arrived=false;C.flags.crest=true;quiet();arrive();return;}
   youFoot(SPOT.rack.c[0]+2.4,SPOT.rack.c[1]-1.2,ha(-130.6,316.3,-133,317.5),null,{...W5(SPOT.rack.c[0]+3.6,SPOT.rack.c[1]-2.4),a:SPOT.rack.a});
   boyFoot(jamie,SPOT.rack.c[0]+3.4,SPOT.rack.c[1]+.2,SPOT.rack.a+Math.PI,{e:SPOT.rack.c[0]+4.6,n:SPOT.rack.c[1]+1.2,a:SPOT.rack.a});boyFoot(sam,SPOT.rack.c[0]+2.2,SPOT.rack.c[1]-2.8,SPOT.rack.a+Math.PI,{e:SPOT.rack.c[0]+3.4,n:SPOT.rack.c[1]-3.8,a:SPOT.rack.a});
   follow(true);objective('Leave the bikes at the rack.','By the parking lot.');return;}
  ff('locked','lockLine');hh(HOUR.arrive+.08);PK.lay();
  // (each of them on ground he can stand and walk on: the nearest such to where he would be; on a dock, on the deck)
  const ground=(e,n)=>{for(let r=0;r<=3.2;r+=.2)for(let k=0;k<(r?12:1);k++){const a=k/12*Math.PI*2,q=W5(e+Math.sin(a)*r,n+Math.cos(a)*r);if(nav.walkable(q.x,q.z,{r:.32}))return [e+Math.sin(a)*r,n+Math.cos(a)*r];}return [e,n];};
  const rackAll=(pe,pn,pa)=>{youFoot(pe,pn,pa,null,{...W5(RACK[1].e,RACK[1].n),a:RACK[1].a});const J=ground(pe+1.2,pn+1),Sq=ground(pe-1.1,pn-.8);boyFoot(jamie,J[0],J[1],pa,{e:RACK[0].e,n:RACK[0].n,a:RACK[0].a});boyFoot(sam,Sq[0],Sq[1],pa,{e:RACK[2].e,n:RACK[2].n,a:RACK[2].a});follow(true);};
  // ---- stones, the dock ----
  if(section==='c5-stones'){rackAll(STONES[0]+10,STONES[1]-5,ha(STONES[0]+10,STONES[1]-5,...STONES));go('d5-stones');objective('Skip stones with Jamie.','The flat stones by the shore, past the picnic shelter.');stand(jamie,STONE_J,{look:()=>W5(...STONE_AIM),leash:40});stand(sam,STONE_S,{look:()=>W5(...STONE_AIM),leash:40});return;}
  ff('stones');C.st={round:3,turn:null,best:{you:3,jamie:4,sam:6},you:[3,2,3],busy:false,t:0,done:true};hh(HOUR.arrive+.16);
  if(section==='c5-dock-memory'){const [e,n]=[DOCK_END[0]+Math.sin(DOCK.a+Math.PI)*3,DOCK_END[1]+Math.cos(DOCK.a+Math.PI)*3];rackAll(e,n,DOCK.a);go('d5-dock');objective('Sit at the end of the dock.');return;}
  ff('dock');hh(HOUR.arrive+.25);
  // ---- the picture ----
  if(section==='c5-sign-search'){rackAll(DOCK_END[0]+Math.sin(DOCK.a+Math.PI)*2,DOCK_END[1]+Math.cos(DOCK.a+Math.PI)*2,DOCK.a+Math.PI);signStart();return;}
  if(section==='c5-photo-match'){rackAll(SPOT.vantage[0]+1.6,SPOT.vantage[1]-4.6,ha(SPOT.vantage[0]+1.6,SPOT.vantage[1]-4.6,...SPOT.oldSign));signStart();C.sign.t=20;C.sign.opened=true;C.sign.hints=1;return;}
  ff('match','signNear');hh(HOUR.arrive+.33);
  if(section==='c5-trail-map'){rackAll(KIOSK[0]-1,KIOSK[1]+6,ha(KIOSK[0]-1,KIOSK[1]+6,...KIOSK));go('d5-map');objective('Find out where the road goes.','The trail map, by the parking lot. Or the road itself.');return;}
  ff('map');hh(HOUR.arrive+.38);
  if(section==='c5-gate-decision'){rackAll(GATE[0]+.8,GATE[1]-7,ha(GATE[0]+.8,GATE[1]-7,...GATE));go('d5-gate');objective('Go up the road.','Through the yellow gate, at the old lot.');return;}
  ff('gate','choose','road');C.choice='sam';
  // ---- the road, the camp ----
  if(section==='c5-gravel-road'){rackAll(GATE[0]-.6,GATE[1]+6,ha(-118,377,-119,392));go('d5-road');objective('Follow the road.','Along the shore.');return;}
  ff('r1','r2');
  const campAt=(e,n,a,{h=HOUR.camp}={})=>{hh(h);youFoot(e,n,a,null,{...W5(RACK[1].e,RACK[1].n),a:RACK[1].a});boyFoot(jamie,e-Math.sin(a)*1.4+Math.cos(a)*.9,n-Math.cos(a)*1.4-Math.sin(a)*.9,a,{e:RACK[0].e,n:RACK[0].n,a:RACK[0].a});
   boyFoot(sam,e-Math.sin(a)*1.7-Math.cos(a)*.9,n-Math.cos(a)*1.7+Math.sin(a)*.9,a,{e:RACK[2].e,n:RACK[2].n,a:RACK[2].a});follow(true);};
  if(section==='c5-camp-gate'){campAt(SPOT.campGate[0]+5.4,SPOT.campGate[1]-11,ha(-160.6,501,-166,512),{h:HOUR.camp-.02});go('d5-road');objective('Follow the road.','Along the shore.');return;}
  ff('campIn');GR.set({have:true,hand:true,on:false});GR.S.torchOut=GR.S.torchTaken=GR.S.jtorchTaken=true;G5.given('flashlight',2);C.campAt=C.t;
  const campGo=()=>{go('d5-camp');checkpoint('c5-camp-gate');objective('Look around the camp.','The office. The lodge. The cabins.');};
  if(section==='c5-camp'){campAt(SPOT.campGate[0]-3,SPOT.campGate[1]+5,ha(-169,517,-181,531));campGo();return;}
  if(section==='c5-office'||section==='c5-register'){const b=BLD.office,[e,n]=b.F.to(b.door[0],b.d/2+b.porch+2.2);campAt(e,n,ha(e,n,...b.c),{h:HOUR.camp+.06});campGo();
   if(section==='c5-register'){DOORS.office.open=1;const [e2,n2]=b.F.to(PN.anchors.register.x+.4,-PN.anchors.register.z+.75);youFoot(e2,n2,ha(e2,n2,...b.c),null,{...W5(RACK[1].e,RACK[1].n),a:RACK[1].a});C.trail=defaultTrail(3);}return;}
  ff('searchmap');C.clues.add('register');C.clues.add('searchmap');C.read.add(0);C.read.add(1);C.read.add(2);C.read.add(3);DOORS.office.open=1;
  if(section==='c5-lodge'||section==='c5-pantry'){const b=BLD.lodge,[e,n]=b.F.to(0,b.d/2+b.porch+3);campAt(e,n,ha(e,n,...b.c),{h:HOUR.camp+.18});campGo();C.trail=defaultTrail(5);
   if(section==='c5-pantry'){DOORS.lodge.open=1;const t=pantryPos(),[e2,n2]=b.F.to(PN.anchors.pantryGap.x+1.7,-PN.anchors.pantryGap.z+.4);youFoot(e2,n2,ha(e2,n2,...Object.values(PL(t.x,t.z))),null,{...W5(RACK[1].e,RACK[1].n),a:RACK[1].a});}return;}
  ff('pantry');C.clues.add('pantry');DOORS.lodge.open=1;
  if(section==='c5-cabins'){const b=BLD.bluejay,[e,n]=b.F.to(0,b.d/2+b.porch+2.4);campAt(e,n,ha(e,n,...b.c),{h:HOUR.camp+.3});campGo();C.trail=defaultTrail(7);return;}
  ff('dying','dead','batteries');C.inv.batteries=true;G5.given('batteries');GR.set({have:true,hand:true,on:true});C.clues.add('cabin');DOORS.bluejay.open=1;C.seen.add('bluejay');C.trail=defaultTrail(9);
  if(section==='c5-campfire'){const L=SEATS[0];campAt(L.seat[0]-Math.sin(L.face)*1.8,L.seat[1]-Math.cos(L.face)*1.8,L.face,{h:HOUR.fire-.02});go('d5-camp');ff('fireOffer');C.fireOfferAt=C.t;objective('Sit down by the campfire.','The circle of logs, down by the water.');return;}
  ff('fireOffer','fire','fireWater','fireDone');G5.given('water');C.fireShot=null;if(PN?.dyn?.fishCar)PN.dyn.fishCar.g.visible=false;
  // ---- dusk ----
  if(section==='c5-golden-hour'){const L=SEATS[0];campAt(L.seat[0]-Math.sin(L.face)*1.2,L.seat[1]-Math.cos(L.face)*1.2,ha(L.seat[0],L.seat[1],-228,591),{h:HOUR.golden+.02});C.hMin=HOUR.golden;fireShot({render:false,h:HOUR.fire+.14});go('e5-dusk');checkpoint('c5-campfire');objective('Check the last cabin.','Owl, past Bluejay and Heron, at the west end.');return;}
  fireShotQuiet();ff('wren');
  if(section==='c5-owl'){campAt(OWL_FRONT[0]+1,OWL_FRONT[1]+3,ha(OWL_FRONT[0]+1,OWL_FRONT[1]+3,...OWLB.c),{h:HOUR.owl-.03});C.hMin=HOUR.owl-.03;go('e5-dusk');objective('Check the last cabin.','Owl, past Bluejay and Heron, at the west end.');return;}
  ff('owl','shirtSeen','shirtDone','carvingSeen','carvingDone','owlDone','owlLine');C.inv.shirt=true;GR.shirtInBag();DOORS.owl.open=1;placeEvidence();carving.visible=true;
  // ---- night ----
  if(section==='c5-calling'){campAt(OWL_PORCH[0],OWL_PORCH[1]-.2,ha(OWL_PORCH[0],OWL_PORCH[1],-293,525),{h:HOUR.call-.02});C.owl={t:0};go('e5-owl');checkpoint('c5-owl');quiet();callAlex();return;}
  ff('call');lightsOut(true);C.h=HOUR.lights;
  if(section==='c5-three-lights'){campAt(-270,553,ha(-270,553,-208,548),{h:HOUR.lights});go('e5-lights');checkpoint('c5-owl');objective('Go back. Now.','The way you came in: the camp gate.');C.lt={t:0,started:false};lightsOut(true);return;}
  C.lt={t:0,started:true,turned:true,out:true,at:C.t-30};C.crt={stage:'gone'};C.darkTo=C.dark=.55;
  if(section==='c5-split'){campAt(-214,551,ha(-214,551,-190,541),{h:HOUR.split-.02});lightsOut(true);quiet();splitStart();return;}
  if(section==='c5-compromise'){campAt(-214,551,ha(-214,551,-190,541),{h:HOUR.split+.02});lightsOut(true);splitStart();quiet();objective('Keep them together.','Don’t let it split you up.');C.split.t=40;C.split.said={owl:1,mom:1,bell:1};C.split.drift={jamie:5,sam:4};return;}
  ff('compromise','toWindow');
  if(section==='c5-window'){campAt(OWL_FRONT[0]+2,OWL_FRONT[1]+5,ha(OWL_FRONT[0]+2,OWL_FRONT[1]+5,...OWL_PORCH),{h:HOUR.window-.01});lightsOut(true);go('n5-split');checkpoint('c5-split');C.split={t:63,resolved:true,how:'together',drift:{jamie:0,sam:0},said:{},events:[],center:[-214,551],look:{owl:0,office:0},maxSpread:0};camp.set('owl',1,{rate:9});C.winT=0;
   stand(jamie,camBeside(1,.2,.8),{look:()=>owlLamp(),keep:true,max:3});stand(sam,camBeside(-1,.2,.8),{look:()=>owlLamp(),keep:true,max:3});objective('Look into Owl. From the porch. Together.');return;}
  ff('window','wake');C.split={t:63,resolved:true,how:'together',drift:{jamie:0,sam:0},said:{},events:[],center:[-214,551],look:{owl:0,office:0},maxSpread:0};
  const woke=()=>{for(const id of Object.keys(camp.LAMPS))if(id!=='owl')camp.snap(id,1);};
  if(section==='c5-run'||section==='c5-route-a'||section==='c5-route-c'){const at2=section==='c5-route-a'?[-232,546,ha(-232,546,-208,548)]:section==='c5-route-c'?[-300,553,ha(-300,553,-313,563)]:[OWL_FRONT[0]+.5,OWL_FRONT[1]+1.5,ha(OWL_FRONT[0],OWL_FRONT[1],-246,550)];
   campAt(at2[0],at2[1],at2[2],{h:HOUR.run});lightsOut(true);woke();C.darkTo=C.dark=.6;C.flags.hurry=true;go('n5-run');checkpoint('c5-run');runStart();quiet();return;}
  if(section==='c5-boundary'){campAt(SPOT.campGate[0]-4,SPOT.campGate[1]+7,ha(-170,519,-166,512),{h:HOUR.run+.04});lightsOut(true);woke();C.darkTo=C.dark=.6;C.flags.hurry=true;go('n5-run');checkpoint('c5-run');runStart();C.esc.route='A';C.route='A';const q=W5(-180,534);camp.double(true,{x:q.x,y:gy(q.x,q.z),z:q.z,a:ha(-180,534,-170,519)});camp.D.hunting=true;camp.D.ground=gy;quiet();return;}
  ff('boundary','out');C.route='A';C.esc={t:0,route:'A',boundary:true,trail:[],woke:new Set(),said:{},still:0};
  if(section==='c5-aftermath'){campAt(-120,345,ha(-120,345,-133,317.5),{h:HOUR.out+.05});lightsOut(true);C.darkTo=C.dark=.4;go('n5-out');objective('Back to the bikes.','The rack, under the lamp in the lot.');checkpoint('c5-run');return;}
  ff('after');
  const atRack=()=>{const r=SPOT.rack.c;campAt(r[0]+2.6,r[1]-1.4,ha(r[0]+2.6,r[1]-1.4,...r),{h:HOUR.final});lightsOut(true);C.darkTo=C.dark=.3;go('n5-final');checkpoint('c5-second-discovery');
   stand(jamie,[r[0]+1.6,r[1]+1.4],{look:()=>camera.position,keep:true});stand(sam,[r[0]+.4,r[1]-1.8],{look:()=>camera.position,keep:true});
   if(C.fireShot&&!C.flags.fireOnCamera){C.flags.fireOnCamera=true;const s=C.fireShot;C.fireIdx=photo.capture({id:'c5-campfire',date:'08/24/2011',time:s.time,label:'',source:(g,w,h)=>{if(s.canvas)g.drawImage(s.canvas.c,0,0,w,h);else drawFireSketch(g,w,h);}});photo.V.shutter=0;}};
  if(section==='c5-second-discovery'){atRack();ff('review');C.revT=0;objective('Look at Alex’s camera.','V.');return;}
  // chapter5-end: the last of it, across the water
  atRack();ff('review','found','revNudge');C.flags.finalImage=true;C.fiT=0;checkpoint('chapter5-end');camp.set('owl',.9,{rate:9});finalSpots();}
 function placeOnOrr(s,speed){const q=ORR.at(s,.9),a=q.a;const h=Math.atan2(Math.cos(a),-Math.sin(a));void h;const fw=ORR.at(s+2,.9),hdg=headingTo(q.x,q.z,fw.x,fw.z);
  youRide(q,hdg,speed);const j=ORR.at(s-3,2.1),m=ORR.at(s-5,-.6);boyRide(jamie,j,hdg,speed);boyRide(sam,m,hdg,speed);follow(true);}
 // (the trail a jump past the camp's afternoon stands in for: office, lodge, a cabin, as far as the scene)
 function defaultTrail(n){const pts=[[-166,512],[-176,526],[-181,533],[-190,541],[-200,556],[-208,566],[-211,573],[-222,563],[-236,554],[-246,550]].slice(0,Math.max(2,n+1));
  return pts.map(([e,n2],i)=>{const w=W5(e,n2);return {x:w.x,z:w.z,wait:i===2||i===6?3:0};});}
 function fireShotQuiet(){if(!C.fireShot)fireShot({render:false,h:HOUR.fire+.14});}// (a scene started after the fire: the picture as it was taken, during the rest)
 // ---- the api ----------------------------------------------------------------------------------------------------------------------------------
 Object.assign(A5,{SECTIONS:SECTIONS5,ALIAS:ALIAS5,LABEL:LABEL5,owns,handles,begin,update,spots,act,sources,blockers,reset,jump,hint,key,pan,wheel,jamieSweep,
  light:()=>nextOwns()?A5.next.light():mine(S.phase)?sky():null,longThrow:(h,a)=>nextOwns()?A5.next.longThrow?.(h,a)??null:null,officerAim:()=>nextOwns()?A5.next.officerAim?.()??null:null,
  canDismount:()=>nextOwns()?A5.next.canDismount():!posed()&&!C.view&&S.phase!=='c5-black'&&!C.lapse,
  canRemount:()=>nextOwns()?A5.next.canRemount():!C.view&&!posed()&&!C.flags.locked&&!(S.phase==='d5-garage'&&!C.flags.leave),
  C,camp,shirt,carving,props,sky,inside,W5,RACK,photograph,DOUBLE,trailPath,brain,PLACES,G5,phys,PK,GT,GR,inventoryReady:()=>nextOwns()?!!A5.next.inventoryReady?.():mine(S.phase)&&S.phase!=='c5-black'&&(C.inv.camera||C.inv.flashlight),
  // (what Chapter Six borrows to look the same the next morning: the faces, bodies, flashlight and garage floors of this chapter)
  presentation:on=>{faces(on);slabs(on);o.foot.fpBody=on;},closeBag:()=>{if(GR.inv.isOpen){GR.inv.close();return true;}return !!A5.next?.closeBag?.();}});
 Object.defineProperties(A5,{amb:{get:()=>nextOwns()?A5.next.amb:C.amb},viewing:{get:()=>nextOwns()?A5.next.viewing:C.view},
  state:{get:()=>{const p=me();return {phase:S.phase,h:+C.h.toFixed(4),clock:fmt(C.h),t:+C.t.toFixed(2),flags:{...C.flags},view:C.view,inv:{...C.inv},clues:[...C.clues].sort(),read:[...C.read].sort(),photos:[...C.photos],
   choice:C.choice,route:C.route,dark:+C.dark.toFixed(3),where:(()=>{const q=EN(p);return {e:+q.e.toFixed(1),n:+q.n.toFixed(1),street:where(p).street};})(),
   race:C.race?{winner:C.race.winner,you:+(C.race.you||0).toFixed(1),jamie:+(C.race.jamie||0).toFixed(1)}:null,stones:C.st?{round:C.st.round,best:{...C.st.best},you:[...(C.st.you||[])],done:!!C.st.done}:null,
   split:C.split?{t:+C.split.t.toFixed(1),resolved:!!C.split.resolved,how:C.split.how||null,maxSpread:+(C.split.maxSpread||0).toFixed(1),drift:{jamie:+C.split.drift.jamie.toFixed(2),sam:+C.split.drift.sam.toFixed(2)},events:(C.split.events||[]).length,center:C.split.center?[...C.split.center]:null}:null,
   lamps:Object.fromEntries(Object.entries(camp.LAMPS).map(([id,L])=>[id,+L.level.toFixed(2)])),carried:camp.carrying(),double:camp.D.person.group.visible,
   creature:{visible:creature.group.visible,stage:C.crt?.stage??null,seenAt:C.crt?.seenAt??null},trail:C.trail.length,guard:C.guardLog?{...C.guardLog}:null,
   photosOnCamera:photo.photos.length,lead:ch4.leadIndex(),fireIdx:C.fireIdx??null,sounds:{...C.sounds},endT:+C.endT.toFixed(2)};}}});
 return A5;
}
