// Chapter Four: Alex's camera. A cheap 2009 point-and-shoot (silver front, black back, a 2.7-inch screen, a wrist strap),
// found in the front pocket of his backpack. Its pictures are of an ordinary summer — friends, his bike, a dog, a
// sunset, a lawn by accident — and, in the background of four of them, in four different places, the old bike.
//
// The photographs are real pictures of this world: each is a camera placed in the world with the people, bikes and
// light of that day staged for it, rendered once into a small image when the chapter starts (studio below). Where the
// old bike is in a picture is measured from the picture's own camera, so the game knows when you have zoomed in on it.
// Looking through them is the camera's own playback mode, held up in your hands: A/D (or ←/→) for the previous or
// next picture, W/S (or the wheel) to magnify, the mouse to move round a magnified picture, F to point something out.
import * as THREE from './three.module.js';
import {createPerson,createBike,newPose,standPose,ridePose,applyPose,poseBike,P} from './rig.js';
import {CAST} from './cast.js';
import {makeOldBike} from './old-bike.js';
import {createKit,seeded} from './kit.js';
import {TW,TY} from './town-plan.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const PHOTO_W=640,PHOTO_H=480;
function canvas(w,h){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;return {c,g};}catch{return null;}}
// ---- the camera itself -----------------------------------------------------------------------------------------------
export function makeCameraModel(){const K=createKit(),g=new THREE.Group();g.name='alex-camera';
 const silver=K.mat(0xb8bcbe,{roughness:.32,metalness:.75}),black=K.mat(0x1c1d1f,{roughness:.45,metalness:.2}),grey=K.mat(0x5a5c5e,{roughness:.4,metalness:.5}),glass=K.mat(0x0c1014,{roughness:.05,metalness:.6});
 const W=.096,H=.058,D=.022;
 K.rbox(g,0,0,.004,W,H,D*.55,.008,silver);K.rbox(g,0,0,-.006,W,H,D*.5,.008,black);// front shell, back shell
 // front: lens barrel, flash, AF lamp; top: shutter, power, mode; side: strap lug, the strap; bottom: the battery/SD door
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(.017,.019,.012,24),silver);lens.rotation.x=Math.PI/2;lens.position.set(.016,0,.017);g.add(lens);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.0165,.0015,6,24),grey);ring.position.set(.016,0,.023);g.add(ring);const gl=new THREE.Mesh(new THREE.CircleGeometry(.012,20),glass);gl.position.set(.016,0,.0232);g.add(gl);
 K.box(g,-.028,.017,.016,.022,.009,.002,K.mat(0xf2f0e8,{roughness:.2,emissive:0x000000}));K.ball(g,-.036,.006,.016,.002,K.mat(0xd8a040,{roughness:.3}));
 const sh=new THREE.Mesh(new THREE.CylinderGeometry(.0055,.0055,.003,16),silver);sh.position.set(.03,H/2+.0015,0);g.add(sh);K.box(g,.016,H/2+.001,0,.008,.002,.004,grey);
 K.box(g,-W/2-.002,.012,-.001,.004,.008,.006,grey);
 const strap=new THREE.Mesh(new THREE.TorusGeometry(.016,.0016,5,16),K.mat(0x2a2a2e,{roughness:.9}));strap.position.set(-W/2-.003,-.012,-.001);strap.rotation.set(0,Math.PI/2,0);strap.scale.set(.7,1.5,.7);g.add(strap);// (the wrist loop, hanging edge-on)
 K.box(g,.02,-H/2-.0005,-.001,.03,.002,.014,grey);
 // back: the screen, the four-way pad and its OK button, menu and playback buttons, a zoom rocker
 const lcdC=canvas(PHOTO_W,PHOTO_H),tex=lcdC?new THREE.CanvasTexture(lcdC.c):null;if(tex){tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;}
 const lcd=new THREE.Mesh(new THREE.PlaneGeometry(.0586,.0440),new THREE.MeshBasicMaterial({color:tex?0xffffff:0x2a3a3a,map:tex,toneMapped:false}));lcd.position.set(-.012,0,-.0177);lcd.rotation.y=Math.PI;g.add(lcd);
 K.box(g,-.012,0,-.0168,.062,.048,.001,K.mat(0x0a0a0a,{roughness:.3}));
 const pad=new THREE.Mesh(new THREE.CylinderGeometry(.0085,.0085,.002,20),grey);pad.rotation.x=Math.PI/2;pad.position.set(.033,-.006,-.017);g.add(pad);K.ball(g,.033,-.006,-.018,.003,silver,[1,1,.4],true);
 for(const [x,y] of [[.033,.014],[.026,-.022],[.04,-.022]])K.rbox(g,x,y,-.0172,.006,.003,.002,.001,grey);K.rbox(g,.036,.022,-.016,.012,.004,.003,.0015,silver);
 g.traverse(o=>{if(o.isMesh)o.castShadow=false;});return {group:g,lcd,lcdCanvas:lcdC,tex};}

// ---- the pictures ------------------------------------------------------------------------------------------------------
// bike: is the old bike in it (the studio measures where); hint: how a friend would point it out.
export const PHOTOS=[
 {id:'sam-face',date:'07/02/2011',time:'2:41 PM',hint:null},
 {id:'jamie-hop',date:'07/02/2011',time:'2:44 PM',hint:null},
 {id:'dog',date:'07/04/2011',time:'11:12 AM',hint:null},
 {id:'alex-bike',date:'07/09/2011',time:'6:05 PM',hint:null},
 {id:'lawn',date:'07/15/2011',time:'1:30 PM',hint:null},
 {id:'oak-sunset',date:'07/21/2011',time:'8:06 PM',bike:true,hint:'Back by the field fence. On the left.',place:'the oak'},
 {id:'curb',date:'07/24/2011',time:'3:15 PM',hint:null},
 {id:'briarwood',date:'07/30/2011',time:'8:11 PM',bike:true,hint:'Way down the street. Under the light pole.',place:'Briarwood'},
 {id:'handlebars',date:'08/06/2011',time:'4:52 PM',hint:null},
 {id:'creek',date:'08/11/2011',time:'7:20 PM',bike:true,hint:'Across the creek. In the weeds.',place:'the creek'},
 {id:'lookout',date:'08/14/2011',time:'5:33 PM',hint:null},
 {id:'friends',date:'08/16/2011',time:'7:40 PM',hint:null},
 {id:'mason',date:'08/17/2011',time:'3:22 PM',bike:true,downtown:true,hint:'By the door. The green one.',place:'downtown'},
];
// A picture drawn by hand when there is nothing to render with (the simulation, or a renderer that cannot read back).
function sketch(g,w,h,p){const r=seeded(p.id.length*31+7);g.fillStyle=p.id.includes('sunset')||p.id==='briarwood'?'#c98a6a':'#9ab4c8';g.fillRect(0,0,w,h*.55);g.fillStyle=p.id==='mason'?'#8a5a44':'#6f8a4a';g.fillRect(0,h*.55,w,h*.45);
 for(let k=0;k<8;k++){g.fillStyle=`rgba(${60+r()*80},${60+r()*60},${50+r()*40},.6)`;g.fillRect(r()*w,h*(.3+r()*.4),20+r()*120,20+r()*80);}
 if(p.bikeAt){const x=p.bikeAt.x*w,y=p.bikeAt.y*h,s=p.bikeAt.r*w;g.strokeStyle='#5a6a4e';g.lineWidth=Math.max(1,s*.08);g.beginPath();g.arc(x-s*.45,y+s*.2,s*.32,0,7);g.arc(x+s*.45,y+s*.2,s*.32,0,7);g.stroke();}
 g.fillStyle='rgba(0,0,0,.5)';g.font='14px Arial';g.fillText(p.id,10,h-10);}

export function createAlexCamera({scene,camera,world,nav,shoot,readPixels,renderer,kit,main,side,LOOKOUT}){
 const model=makeCameraModel(),G=model.group;G.visible=false;camera.add(G);
 const photos=PHOTOS.map(p=>({...p,canvas:null,rendered:false,bikeAt:null,seen:0,found:false,shown:false}));
 const V={open:false,raise:0,i:0,zoom:1,zt:1,px:.5,py:.5,dirty:true,mark:-1,markT:0,dwell:0,lastFound:null,shutter:0,flash:0,count:photos.length};
 // ---- the studio: doubles of the three of them, their bikes, the old bike, a dog; hidden except while a picture is taken ----
 const studio=new THREE.Group();studio.name='photo-studio';scene.add(studio);studio.visible=false;
 const who={jamie:createPerson(CAST.jamie),sam:createPerson(CAST.sam),alex:createPerson(CAST.alex)},bikes={jamie:createBike(CAST.jamie.bike),sam:createBike(CAST.sam.bike),alex:createBike(CAST.alex.bike)},old=makeOldBike();
 for(const k of Object.keys(who)){studio.add(who[k].group,bikes[k].group);who[k].group.visible=false;bikes[k].group.visible=false;}studio.add(old.group);old.group.visible=false;
 const dog=(()=>{const K=createKit(),g=new THREE.Group(),c=0xc89a5a,d=0x8a6a3a;K.ball(g,0,.2,0,.3,c,[1,.75,1.6],true);K.ball(g,0,.32,-.42,.15,c,[1,1,1.15],true);K.ball(g,0,.28,-.56,.07,d,[1,.8,1.2],true);K.ball(g,-.09,.36,-.4,.06,d,[.5,1.2,.9],true);K.ball(g,.09,.36,-.4,.06,d,[.5,1.2,.9],true);
  for(const [x,z] of [[-.1,-.35],[.1,-.35]])K.rbox(g,x,.06,z-.12,.07,.07,.3,.03,c);for(const [x,z] of [[-.12,.3],[.12,.3]])K.rbox(g,x,.07,z,.09,.12,.22,.04,c);K.rod(g,[0,.22,.45],[.12,.12,.78],.03,c);g.visible=false;studio.add(g);return g;})();
 const pops=[0xd83a3a,0x3a6ad8].map(c=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.03,.14,.012),new THREE.MeshStandardMaterial({color:c,roughness:.3}));m.visible=false;studio.add(m);return m;});
 const pose=newPose(),cam=new THREE.PerspectiveCamera(52,PHOTO_W/PHOTO_H,.05,400);
 const gy=(x,z)=>nav.groundY(x,z);
 function stand(p,key,x,z,a,{look=0,lookPitch=0,arms=null}={}){const P2=who[key];P2.group.visible=true;if(P2.group.parent!==studio)studio.add(P2.group);standPose(pose,1.3,{look,lookPitch});if(arms)arms(pose);P2.group.position.set(x,gy(x,z),z);P2.group.rotation.set(0,-a,0);applyPose(P2,pose);}
 function bike(key,x,z,a,{lean=.12,kick=1,rider=false,crank=1.2,lift=0}={}){const b=key==='old'?old:bikes[key];b.group.visible=true;b.group.position.set(x,gy(x,z)+lift,z);b.group.rotation.set(0,-a,rider?0:lean,'YXZ');b.kickstand=kick;b.crankAngle=crank;poseBike(b);
  if(rider){const P2=who[key];P2.group.visible=true;b.group.add(P2.group);P2.group.position.set(0,0,0);P2.group.rotation.set(0,0,0);ridePose(pose,crank,{stand:.6,astride:0,steer:0,geom:b.geom});applyPose(P2,pose);}}
 function clearStudio(){studio.traverse(o=>{if(o!==studio&&o.parent===studio)o.visible=false;});for(const k of Object.keys(who)){if(who[k].group.parent!==studio)studio.add(who[k].group);who[k].group.visible=false;}}
 // Where a world point lands in a picture (0–1 across, 0–1 down), and how big something r meters wide looks.
 const proj=(x,y,z,r)=>{const v=new THREE.Vector3(x,y,z).project(cam),d=cam.position.distanceTo(new THREE.Vector3(x,y,z)),px=r/(2*d*Math.tan(cam.fov*Math.PI/360)*cam.aspect);return {x:(v.x+1)/2,y:(1-v.y)/2,r:px};};
 const look=(ex,ey,ez,tx,ty,tz,fov=52,roll=0)=>{cam.fov=fov;cam.updateProjectionMatrix();cam.position.set(ex,ey,ez);cam.up.set(Math.sin(roll),Math.cos(roll),0);cam.lookAt(tx,ty,tz);cam.updateMatrixWorld(true);};
 const DAY={day:1,dusk:0,night:0},GOLD={day:.35,dusk:.65,night:0},SUNSET={day:.12,dusk:.95,night:.05};
 // Each picture: stage it, aim, and say where the old bike is (if it is in it).
 const S2=(u,v)=>side(u,v),M2=(d,l)=>main(d,l);
 const STAGE={
  'sam-face':()=>{const b=M2(LOOKOUT.bench.d,LOOKOUT.bench.lat),c=M2(LOOKOUT.bench.d-1.4,LOOKOUT.bench.lat+.2);stand(null,'sam',b.x,b.z,Math.atan2(c.x-b.x,-(c.z-b.z)),{look:.25,lookPitch:-.05,arms:p=>{p[P.lh]=-.16;p[P.lh+1]=1.42;p[P.lh+2]=-.08;p[P.rh]=.16;p[P.rh+1]=1.42;p[P.rh+2]=-.08;p[P.hy]=.3;p[P.roll]=.08;}});
   look(c.x,gy(c.x,c.z)+1.3,c.z,b.x,gy(b.x,b.z)+1.32,b.z,46,.05);return {preset:DAY,sun:[-50,55,40],at:b};},
  'jamie-hop':()=>{const q=M2(1040,1.2),e=M2(1032,-2.6);bike('jamie',q.x,q.z,Math.atan2(M2(1050,1.2).x-q.x,-(M2(1050,1.2).z-q.z)),{rider:true,lift:.32,crank:2});look(e.x,gy(e.x,e.z)+1.2,e.z,q.x,gy(q.x,q.z)+.9,q.z,58,-.14);return {preset:DAY,sun:[40,60,30],at:q};},
  'dog':()=>{const H=world.homes.alex,s=H.toWorld(H.doorX-2.2,H.stepFront+.6),c=H.toWorld(H.doorX-2.2,H.stepFront+3.6);dog.visible=true;dog.position.set(s.x,gy(s.x,s.z)+.02,s.z);dog.rotation.y=-Math.atan2(c.x-s.x,-(c.z-s.z))+Math.PI;look(c.x,gy(c.x,c.z)+.9,c.z,s.x,gy(s.x,s.z)+.25,s.z,50);return {preset:DAY,sun:[-30,70,50],at:s};},
  'alex-bike':()=>{const H=world.homes.alex,b=H.toWorld(H.gx??(-H.w*.25),H.gfront+2.6),c=H.toWorld((H.gx??(-H.w*.25))+2.2,H.gfront+5.4);bike('alex',b.x,b.z,Math.atan2(c.x-b.x,-(c.z-b.z))+1.2);look(c.x,gy(c.x,c.z)+1.25,c.z,b.x,gy(b.x,b.z)+.55,b.z,50,.03);return {preset:GOLD,sun:[-60,26,30],at:b};},
  'lawn':()=>{const q=M2(456,10.8);look(q.x,gy(q.x,q.z)+1.1,q.z,q.x+.4,gy(q.x,q.z),q.z-.5,62,.5);return {preset:DAY,sun:[20,60,40],at:q};},
  'oak-sunset':()=>{const e=M2(1146,-3),t=M2(LOOKOUT.oak.d+2,LOOKOUT.oak.lat-4),bq=M2(LOOKOUT.fenceD-.9,-6.6);bike('old',bq.x,bq.z,Math.atan2(M2(LOOKOUT.fenceD-.9,0).x-bq.x,-(M2(LOOKOUT.fenceD-.9,0).z-bq.z)),{lean:-.16});
   look(e.x,gy(e.x,e.z)+1.45,e.z,t.x,gy(t.x,t.z)+3.2,t.z,56);return {preset:SUNSET,sun:[60,10,-80],at:t,bike:[bq.x,gy(bq.x,bq.z)+.55,bq.z,1.6]};},
  'curb':()=>{const a=M2(560,5.6),b=M2(561.2,5.7),e=M2(562.6,1.6);for(const [k,q] of [['jamie',a],['sam',b]])stand(null,k,q.x,q.z,Math.atan2(e.x-q.x,-(e.z-q.z)),{arms:p=>{p[P.rh]=.1;p[P.rh+1]=1.36;p[P.rh+2]=-.12;}});
   pops.forEach((m,i)=>{const q=i?b:a;m.visible=true;m.position.set(q.x,gy(q.x,q.z)+1.62,q.z);});look(e.x,gy(e.x,e.z)+1.35,e.z,(a.x+b.x)/2,gy(a.x,a.z)+1.25,(a.z+b.z)/2,50);return {preset:DAY,sun:[-40,60,30],at:a};},
  'briarwood':()=>{const e=S2(30,1.2),t=S2(150,0),pole=(world.poles||[]).find(p=>p.frame===world.sideFrames[0]&&p.u>118&&p.u<150),bq=pole?{x:pole.x+.5,z:pole.z+.4}:S2(132,-6.6);
   bike('old',bq.x,bq.z,world.sideFrames[0].heading(132)+Math.PI/2,{lean:.2});look(e.x,gy(e.x,e.z)+1.4,e.z,t.x,gy(t.x,t.z)+2.4,t.z,54);return {preset:SUNSET,sun:[70,12,-60],at:t,bike:[bq.x,gy(bq.x,bq.z)+.55,bq.z,1.6]};},
  'handlebars':()=>{const q=M2(700,-1.2),a=Math.atan2(M2(720,-1.2).x-q.x,-(M2(720,-1.2).z-q.z));bike('alex',q.x,q.z,a,{lean:0,kick:0});const f={x:q.x+Math.sin(a)*.1,z:q.z-Math.cos(a)*.1};
   look(q.x-Math.sin(a)*.25,gy(q.x,q.z)+1.32,q.z+Math.cos(a)*.25,q.x+Math.sin(a)*8,gy(q.x,q.z)+.8,q.z-Math.cos(a)*8,64,.12);void f;return {preset:GOLD,sun:[-60,30,40],at:q,blur:true};},
  'creek':()=>{const cu=100,e=S2(cu-6,9.8),bq=S2(cu+5,20.5),t=S2(cu+3,18);bike('old',bq.x,bq.z,world.sideFrames[0].heading(105)+.3,{lean:.25});
   look(e.x,gy(e.x,e.z)+1.45,e.z,t.x,gy(t.x,t.z)+.4,t.z,54);return {preset:GOLD,sun:[50,18,-70],at:t,bike:[bq.x,gy(bq.x,bq.z)+.55,bq.z,1.6]};},
  'lookout':()=>{const b=M2(LOOKOUT.bench.d,LOOKOUT.bench.lat),bk=M2(LOOKOUT.bench.d-.4,LOOKOUT.bench.lat+1.1),e=M2(LOOKOUT.bench.d-5,LOOKOUT.bench.lat+2.6);bike('sam',bk.x,bk.z,Math.atan2(b.x-bk.x,-(b.z-bk.z))+1.4);
   look(e.x,gy(e.x,e.z)+1.35,e.z,b.x,gy(b.x,b.z)+.6,b.z,52);return {preset:GOLD,sun:[-50,30,-50],at:b};},
  'friends':()=>{const o=M2(LOOKOUT.oak.d-2.2,LOOKOUT.oak.lat-1.4),e=M2(LOOKOUT.oak.d-8.5,LOOKOUT.oak.lat-3);const a=Math.atan2(e.x-o.x,-(e.z-o.z));
   stand(null,'jamie',o.x,o.z,a,{arms:p=>{p[P.rh]=.3;p[P.rh+1]=1.62;p[P.rh+2]=-.1;}});const o2=M2(LOOKOUT.oak.d-2.6,LOOKOUT.oak.lat-.2);stand(null,'sam',o2.x,o2.z,a,{look:.2});
   look(e.x,gy(e.x,e.z)+1.4,e.z,o.x,gy(o.x,o.z)+1.4,o.z,50);return {preset:GOLD,sun:[60,16,-70],at:o};},
  'mason':()=>{const d=TW(133.4,-11.2),e=TW(136.2,-2.2),dy=TY+.15;old.group.visible=true;old.group.position.set(d.x,dy,d.z);old.group.rotation.set(0,-Math.PI/2+.12,.18,'YXZ');poseBike(old);
   const t=TW(134.2,-11.6);look(e.x,dy+1.5,e.z,t.x,dy+1.7,t.z,54);return {preset:DAY,sun:[-40,55,25],at:e,bike:[d.x,dy+.55,d.z,1.6]};},
 };
 const rt=typeof THREE.WebGLRenderTarget==='function'?new THREE.WebGLRenderTarget(PHOTO_W,PHOTO_H,{colorSpace:THREE.SRGBColorSpace}):null;
 // Render one picture (true if it was rendered, false if only sketched).
 function take(i){const p=photos[i];if(p.canvas&&p.rendered)return true;const cv=p.canvas?.g?p.canvas:canvas(PHOTO_W,PHOTO_H);p.canvas=cv;
  clearStudio();studio.visible=true;let spec=null;try{spec=STAGE[p.id]?.();}catch(e){spec=null;p.error=String(e);}
  if(spec?.bike){const [x,y,z,r]=spec.bike;p.bikeAt=proj(x,y,z,r);}
  let ok=false;if(spec&&cv&&rt&&shoot&&readPixels){try{shoot({cam,target:rt,preset:spec.preset,sun:spec.sun,at:spec.at});const px=readPixels(rt,PHOTO_W,PHOTO_H);if(px){toCanvas(cv,px,{blur:spec.blur});ok=true;}}catch(e){p.error=String(e);}}
  studio.visible=false;clearStudio();if(!ok&&cv)sketch(cv.g,PHOTO_W,PHOTO_H,p);p.rendered=ok;V.dirty=true;return ok;}
 // A rendered frame (rows bottom-up) into a picture: flipped, a little soft, a little noise, the cheap lens's vignette.
 function toCanvas(cv,px,{blur=false,tv=false}={}){const g=cv.g,im=g.createImageData(PHOTO_W,PHOTO_H),r=seeded(17);
  for(let y=0;y<PHOTO_H;y++){const sy=PHOTO_H-1-y;for(let x=0;x<PHOTO_W;x++){const i=(y*PHOTO_W+x)*4,j=(sy*PHOTO_W+x)*4,dx=x/PHOTO_W-.5,dy=y/PHOTO_H-.5,vig=1-.28*(dx*dx+dy*dy)*2.2,n=(r()-.5)*7;
   for(let c=0;c<3;c++)im.data[i+c]=clamp(px[j+c]*vig+n,0,255);im.data[i+3]=255;}}
  g.putImageData(im,0,0);if(blur){g.filter='blur(2px)';g.drawImage(cv.c,0,0);g.filter='none';}}
 // ---- playback on the screen -----------------------------------------------------------------------------------------
 function draw(){const L=model.lcdCanvas;if(!L)return;const g=L.g,w=PHOTO_W,h=PHOTO_H,p=photos[V.i];g.fillStyle='#000';g.fillRect(0,0,w,h);
  if(p?.canvas){const z=V.zoom,sw=w/z,sh=h/z,sx=clamp(V.px*w-sw/2,0,w-sw),sy=clamp(V.py*h-sh/2,0,h-sh);g.drawImage(p.canvas.c,sx,sy,sw,sh,0,0,w,h);
   // the camera's own display: playback mark, file number, count, date, battery; magnification and where you are in it
   g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,w,34);g.fillRect(0,h-34,w,34);g.fillStyle='#f2f2f2';g.font='bold 20px Arial';g.textBaseline='middle';g.fillText('▶',12,17);g.font='18px Arial';g.fillText('100-'+String(V.i+1).padStart(4,'0'),38,17);
   g.textAlign='right';g.fillText(`${V.i+1}/${photos.length}`,w-60,17);g.strokeStyle='#f2f2f2';g.lineWidth=2;g.strokeRect(w-48,9,30,16);g.fillRect(w-18,13,3,8);g.fillRect(w-45,12,18,10);g.textAlign='left';
   g.fillText(p.date+'  '+p.time,12,h-17);if(z>1.01){g.textAlign='right';g.fillText('×'+z.toFixed(1),w-12,h-17);g.textAlign='left';const mw=96,mh=72,mx=w-mw-12,my=44;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(mx,my,mw,mh);g.strokeStyle='#f2f2f2';g.strokeRect(mx,my,mw,mh);g.strokeStyle='#ffd040';g.strokeRect(mx+sx/w*mw,my+sy/h*mh,mw/z,mh/z);}}
  if(V.shutter>0){g.fillStyle=`rgba(255,255,255,${V.shutter})`;g.fillRect(0,0,w,h);}
  if(model.tex)model.tex.needsUpdate=true;V.dirty=false;}
 // Is the old bike in what the screen shows right now, magnified enough to make it out?
 function bikeInView(){const p=photos[V.i];if(!p.bike||!p.bikeAt||V.zoom<1.9)return false;const z=V.zoom,sw=1/z,sx=clamp(V.px-sw/2,0,1-sw),sy=clamp(V.py-sw/2,0,1-sw),b=p.bikeAt;
  return b.x>sx+sw*.15&&b.x<sx+sw*.85&&b.y>sy+sw*.15&&b.y<sy+sw*.85;}
 function open(i=V.i){V.open=true;V.i=clamp(i,0,photos.length-1);V.zoom=V.zt=1;V.px=V.py=.5;V.dirty=true;G.visible=true;}
 function close(){V.open=false;}
 function browse(d){const n=clamp(V.i+d,0,photos.length-1);if(n===V.i)return false;V.i=n;V.zt=1;V.zoom=1;V.px=V.py=.5;V.dwell=0;V.markT=0;V.dirty=true;return true;}
 function zoomBy(d){V.zt=clamp(V.zt*(d>0?1.5:1/1.5),1,4);}
 // Guided: magnify onto the old bike in this picture (a friend's finger on the screen).
 function guide(){const p=photos[V.i];if(!p.bikeAt)return;V.zt=2.6;V.px=p.bikeAt.x;V.py=p.bikeAt.y;}
 function update(dt){const p=photos[V.i];V.raise=clamp(V.raise+(V.open?dt/.45:-dt/.35),0,1);G.visible=V.raise>0;const r=smooth(V.raise);
  // in the hands, below the eye; raised up in front of it to look at the screen
  G.position.set(.004-.016*r,-.2+.194*r,-.24+.135*r);G.rotation.set(-.6*(1-r)+.02,Math.PI,.04*(1-r));
  if(V.open&&p){p.seen+=dt;V.dwell+=dt;const z0=V.zoom;V.zoom+=(V.zt-V.zoom)*(1-Math.exp(-9*dt));if(Math.abs(V.zoom-z0)>1e-4)V.dirty=true;}
  if(V.shutter>0){V.shutter=Math.max(0,V.shutter-dt*2.4);V.dirty=true;}
  if(V.dirty&&V.raise>0)draw();}
 // A new picture from what is in front of it (the television, in the video store): its pixels, or a sketch.
 function capture({id='tv',date='08/23/2011',time='8:24 PM',source=null,label=''}={}){const cv=canvas(PHOTO_W,PHOTO_H);const p={id,date,time,canvas:cv,rendered:!!source,seen:0,found:false,lead:true,label};
  if(cv){if(source)source(cv.g,PHOTO_W,PHOTO_H);else{sketch(cv.g,PHOTO_W,PHOTO_H,p);}}photos.push(p);V.count=photos.length;V.shutter=1;V.dirty=true;return photos.length-1;}
 function reset(){V.open=false;V.raise=0;V.i=0;V.zoom=V.zt=1;V.px=V.py=.5;V.dwell=0;V.mark=-1;V.markT=0;V.shutter=0;G.visible=false;while(photos.length>PHOTOS.length)photos.pop();for(const p of photos){p.seen=0;p.found=false;p.shown=false;}V.count=photos.length;V.dirty=true;}
 return {model,photos,V,take,open,close,browse,zoomBy,guide,update,bikeInView,capture,reset,draw,toCanvas,studio,who,bikes,old,dog,cam,
  pan(dx,dy){if(V.zoom<1.05)return;V.px=clamp(V.px+dx*.0016/V.zoom,0,1);V.py=clamp(V.py+dy*.0016/V.zoom,0,1);V.dirty=true;},
  get current(){return photos[V.i];},get rendered(){return photos.filter(p=>p.rendered).length;}};
}
