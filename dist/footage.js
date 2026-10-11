// Chapter Four: what the televisions show. Nothing here is a recording: every picture is this world seen from a place
// nobody could have filmed it from, rendered live into the screen while it is on.
//  * Alex, before: riding down Briarwood seen from high over the street; in his front yard from low behind a hedge
//    across the road; walking past an unfamiliar sign at dusk — PINE RIDGE RECREATION AREA (a small set of its own:
//    a gravel lot, a brown park sign, a steel gate, pines, the reservoir's maintenance shed); in his room at night,
//    on his bed, seen from up in the corner of the ceiling.
//  * The boys, now: from high up over Main Street, from behind them, and inside the video store from the far corner.
// The CRT look (scanlines, curvature, snow) is the screen's own material (town-build.js crtMaterial).
import * as THREE from './three.module.js';
import {createKit,seeded} from './kit.js';
import {standPose,walkPose,ridePose,applyPose,poseBike,newPose,createPerson,P} from './rig.js';
import {CAST} from './cast.js';
import {TW,TL,TY} from './town-plan.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const SHOTS={'alex-ride':{len:7,label:'ALEX, RIDING, FROM ABOVE'},'alex-yard':{len:5.5,label:'ALEX IN HIS YARD, FROM ACROSS THE STREET'},'pine-ridge':{len:8,hold:true,label:'ALEX AT A SIGN: PINE RIDGE RECREATION AREA'},
 'alex-room':{len:6.5,label:'ALEX IN HIS ROOM AT NIGHT, FROM THE CEILING'},'live-store':{len:Infinity,live:true,label:'THE THREE OF THEM IN THE STORE, FROM BEHIND'},'live-high':{len:Infinity,live:true,label:'THE STREET FROM HIGH ABOVE'},'live-behind':{len:Infinity,live:true,label:'THEM, FROM BEHIND'}};
// The sign: brown, routed yellow letters, the parks department's (legible on the screen and in the photograph).
export function pineSignArt(g,w,h){g.fillStyle='#5a3e24';g.fillRect(0,0,w,h);g.strokeStyle='#e8c068';g.lineWidth=h*.03;g.strokeRect(h*.05,h*.05,w-h*.1,h-h*.1);g.fillStyle='#ecc870';g.textAlign='center';g.textBaseline='middle';
 const t=(s,y,sz,b='bold')=>{let z=sz;g.font=`${b} ${z}px Georgia, serif`;while(g.measureText(s).width>w*.88&&z>8){z*=.94;g.font=`${b} ${z}px Georgia, serif`;}g.fillText(s,w/2,y);};
 t('PINE RIDGE',h*.24,h*.22);t('RECREATION AREA',h*.46,h*.15);t('RESERVOIR ACCESS · GATE CLOSES AT DUSK',h*.66,h*.08,'');t('OAK HOLLOW TWP. PARKS DEPT.',h*.82,h*.07,'');}
export function createFootage({scene,camera,world,nav,shoot,photo,town,renderer,foot,self,side}){
 const K=createKit(),rt={},cams={},clock={};
 const mkRT=(w=400,h=300)=>typeof THREE.WebGLRenderTarget==='function'?new THREE.WebGLRenderTarget(w,h,{colorSpace:THREE.SRGBColorSpace}):null;
 // ---- Pine Ridge: its own little scene, far from everything ----------------------------------------------------------
 const pine=new THREE.Scene();pine.background=new THREE.Color(0x8aa0b8);pine.fog=new THREE.Fog(0xb0a8a0,30,140);
 {const sun=new THREE.DirectionalLight(0xffc890,2.2);sun.position.set(-40,18,30);pine.add(sun,sun.target);pine.add(new THREE.HemisphereLight(0xc8d0e0,0x5a5040,1.3));
  const g=new THREE.Group();pine.add(g);const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),K.mat(0x6a6650,{roughness:1}));ground.rotation.x=-Math.PI/2;g.add(ground);
  const lot=new THREE.Mesh(new THREE.PlaneGeometry(26,18),K.mat(0x9a9080,{roughness:1}));lot.rotation.x=-Math.PI/2;lot.position.set(0,.01,2);g.add(lot);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(5,80),K.mat(0x8a8274,{roughness:1}));road.rotation.x=-Math.PI/2;road.position.set(0,.012,-40);g.add(road);
  // the gate: two steel posts, a swing arm across the road, a chain, the KEEP OUT under it
  for(const x of [-2.8,2.8])K.cyl(g,x,.6,-9,.09,1.2,K.mat(0x8a8a6a,{roughness:.5,metalness:.4}),8);K.cyl(g,0,1.05,-9,.05,5.6,K.mat(0xd8c040,{roughness:.5}),8,[0,0,Math.PI/2]);
  // the sign on two posts at the lot's edge
  const sc=(()=>{try{const c=document.createElement('canvas'),gg=c.getContext?.('2d');if(!gg)return null;c.width=640;c.height=400;pineSignArt(gg,640,400);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}})();
  for(const x of [-1.5,1.5])K.box(g,x+4.6,1,-7,.14,2,.14,K.mat(0x4a3420,{roughness:1}));const sg=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2),new THREE.MeshStandardMaterial({color:sc?0xffffff:0x5a3e24,map:sc,roughness:.8}));sg.position.set(4.6,1.75,-6.9);sg.rotation.y=-.35;g.add(sg);K.box(g,4.6,1.75,-7,3.3,2.1,.08,K.mat(0x3a2818,{roughness:1}));
  // pines, a shed by the water, the reservoir's dark edge beyond the gate, the water tower far off
  const r=seeded(91);for(let k=0;k<70;k++){const a=r()*Math.PI*2,d=10+r()*60,x=Math.cos(a)*d,z=Math.sin(a)*d-20;if(Math.abs(x)<4&&z<0)continue;if(x>-4&&x<15&&z>-15&&z<10)continue;/* (nothing between the shot and the sign) */const t=new THREE.Group();t.position.set(x,0,z);g.add(t);world.vegBuild?.(t,seeded(k+300),{size:1+r()*.6,kind:'pine',lod:'mid'});}
  K.box(g,-9,1.4,-24,5,2.8,4,K.mat(0x7a7a6a,{roughness:.9}));K.box(g,-9,3,-24,5.4,.3,4.4,K.mat(0x4a3a32,{roughness:.9}));const water=new THREE.Mesh(new THREE.PlaneGeometry(90,40),K.mat(0x3a4a5a,{roughness:.1,metalness:.3}));water.rotation.x=-Math.PI/2;water.position.set(0,-.3,-52);g.add(water);
  for(let k=0;k<6;k++)K.box(g,-2+k*.9,.3,-8.6,.6,.06,.6,K.mat(0x9a9080,{roughness:1}));}
 cams.pine=new THREE.PerspectiveCamera(48,4/3,.1,300);
 // ---- the shots ------------------------------------------------------------------------------------------------------
 const pose=newPose(),dbl=createPerson({...CAST.player});dbl.group.visible=false;scene.add(dbl.group);// (you, as the corner of the store sees you)
 const cam=new THREE.PerspectiveCamera(50,4/3,.1,160);
 const DAY={day:1,dusk:0,night:0},GOLD={day:.4,dusk:.6,night:0};
 function stageAlex(id,t){const S=photo.studio,A=photo.who.alex,b=photo.bikes.alex;for(const o of S.children)o.visible=false;S.visible=true;
  if(id==='alex-ride'){const u=58+t*4.6,q=side(u,-1.4),a=world.sideFrames[0].heading(u);if(A.group.parent!==b.group){b.group.add(A.group);A.group.position.set(0,0,0);A.group.rotation.set(0,0,0);}
   b.group.visible=A.group.visible=true;b.group.position.set(q.x,nav.groundY(q.x,q.z),q.z);b.group.rotation.set(0,-a,0);b.crankAngle=t*5.2;b.wheel=t*14;poseBike(b);ridePose(pose,t*5.2,{geom:b.geom});applyPose(A,pose);
   const c=side(88+t*1.8,-16);cam.position.set(c.x,nav.groundY(c.x,c.z)+17,c.z);cam.up.set(0,1,0);cam.lookAt(q.x,q.y+.6,q.z);return {preset:DAY,sun:[-40,60,30],at:q};}
  if(id==='alex-yard'){const H=world.homes.alex,s=H.toWorld(H.doorX+2.8,H.stepFront+3.2),e=side(127.6,-12.4);if(A.group.parent!==S)S.add(A.group);A.group.visible=true;const a=Math.atan2(e.x-s.x,-(e.z-s.z))+Math.sin(t*.6)*.9;
   A.group.position.set(s.x,nav.groundY(s.x,s.z),s.z);A.group.rotation.set(0,-a,0);standPose(pose,t,{look:Math.sin(t*.8)*.3});applyPose(A,pose);cam.position.set(e.x,nav.groundY(e.x,e.z)+.85,e.z);cam.up.set(0,1,0);cam.lookAt(s.x,nav.groundY(s.x,s.z)+1.1,s.z);return {preset:GOLD,sun:[-60,26,30],at:s};}
  if(id==='alex-room'){const R=world.interiors['alex-room'],AH=world.homes.alex,RW=(x,z,y=0)=>{const p=AH.toWorld(x,z);return {x:p.x,y:p.ground+R.floor+y,z:p.z};};
   const bed=RW(R.x0+1.05,R.z0+1.3),win=RW(R.sideWindow.x,R.sideWindow.z),corner=RW(R.x0+.3,R.z1-.3,2.25);
   if(A.group.parent!==S)S.add(A.group);A.group.visible=true;A.group.position.set(bed.x,bed.y-.38,bed.z);A.group.rotation.set(0,-Math.atan2(win.x-bed.x,-(win.z-bed.z)),0);standPose(pose,t*.5,{look:0});pose[P.root+1]-=.42;pose[P.lf+2]-=.3;pose[P.rf+2]-=.3;applyPose(A,pose);
   cam.position.set(corner.x,corner.y,corner.z);cam.up.set(0,1,0);cam.lookAt(bed.x,bed.y+.3,bed.z);return {preset:null,room:true,lamp:{x:win.x,y:win.y+1.6,z:win.z,color:0x9aaccf,intensity:2.2,distance:6}};}
  return null;}
 function stagePine(t){const A=photo.who.alex;pine.add(A.group);A.group.visible=true;const z=-3+t*.55,x=2.6-t*.25;A.group.position.set(x,0,z);A.group.rotation.set(0,-Math.PI+.2,0);walkPose(pose,t*1.6,1.1);applyPose(A,pose);
  // (the shot drifts in on the sign as he walks out of it, and holds there: the sign fills the screen)
  const c=cams.pine,k=smooth((t-1.5)/5.5);c.position.set(9.5-3.1*k,4.2-2.1*k,6.5-7.4*k);c.lookAt(3.4+1.2*k,1.2+.55*k,-6.5-.4*k);}
 // Where the live views look from (no camera anywhere near): the store's far corner, high over Main, right behind you.
 // The store's is from whichever of its four upper corners is farthest from you, looking at the three of you; walk
 // toward that corner and the picture is from another one (never a camera there, either).
 const STORE_CORNERS=[[115,-27.5],[99.6,-27.5],[115,-12.1],[99.6,-12.1]],store={i:0,t:-9,changes:0,last:-1};
 // (kept every frame while the shot is on, drawn or not)
 function track(id,me,t=0){if(id!=='live-store')return;const q=TL(me.x,me.z),far=()=>{let b=0,bd=-1;STORE_CORNERS.forEach((c,i)=>{const d=Math.hypot(c[0]-q.u,c[1]-q.v);if(d>bd){bd=d;b=i;}});return b;};
  if(t<store.last||store.t<-8){store.i=far();store.t=t;}/* (a new shot: from the far corner) */store.last=t;
  const cur=STORE_CORNERS[store.i];if(Math.hypot(cur[0]-q.u,cur[1]-q.v)<7.5&&t-store.t>1.5){const b=far();if(b!==store.i){store.i=b;store.t=t;store.changes++;}}}
 function liveCam(id,me,t=0){if(id==='live-store'){track(id,me,t);
   const c=STORE_CORNERS[store.i],p=TW(c[0]+(c[0]>107?-.35:.35),c[1]+(c[1]>-20?-.35:.35)),pts=[me,...(me.with||[]).filter(w=>Math.hypot(w.x-me.x,w.z-me.z)<9)],cx=pts.reduce((a,w)=>a+w.x,0)/pts.length,cz=pts.reduce((a,w)=>a+w.z,0)/pts.length;
   cam.position.set(p.x,TY+.18+3.15,p.z);cam.lookAt(cx,TY+.9,cz);cam.fov=62;}
  else if(id==='live-high'){const pts=[me,...(me.with||[]).filter(q=>Math.hypot(q.x-me.x,q.z-me.z)<14)],cx=pts.reduce((a,q)=>a+q.x,0)/pts.length,cz=pts.reduce((a,q)=>a+q.z,0)/pts.length,sp=Math.max(...pts.map(q=>Math.hypot(q.x-cx,q.z-cz)));
   /* (high over the middle of Main, as close as it can be with all three of them in it) */const q=TL(cx,cz),p=TW(q.u+3+sp*.8,q.v+Math.max(-3.2,Math.min(3.2,-q.v*.45)));cam.position.set(p.x,me.y+5.6+sp*.8,p.z);cam.lookAt(cx,me.y-.5,cz);cam.fov=30;}
  else{const a=me.a;cam.position.set(me.x-Math.sin(a)*3.4,me.y+1.9,me.z+Math.cos(a)*3.4);cam.lookAt(me.x+Math.sin(a)*3,me.y+1.1,me.z-Math.cos(a)*3);cam.fov=58;}cam.updateProjectionMatrix();}
 // the double: where you are, the way you stand (the first-person body has no head)
 function placeDouble(){if(!self?.group)return;dbl.group.visible=true;self.group.updateMatrixWorld(true);dbl.group.position.setFromMatrixPosition(self.group.matrixWorld);dbl.group.quaternion.setFromRotationMatrix(self.group.matrixWorld);if(foot?.pose)applyPose(dbl,foot.pose);}
 // Render a shot into a television's screen. tv: a town-build tvSet; t: seconds into the shot.
 function render(tv,id,t,me,hide=[]){if(!tv)return;const key=tv.screen.uuid;rt[key]||=mkRT();const target=rt[key];tv.mat.uniforms.uHas.value=target?1:0;if(target)tv.mat.uniforms.uTex.value=target.texture;if(!target||!shoot)return;
  // (a screen is never drawn into its own picture: the live views can see it)
  const off=[tv.screen,...hide].filter(q=>q&&q.visible);for(const q of off)q.visible=false;try{
  if(id==='pine-ridge'){stagePine(t);shoot({cam:cams.pine,target,scene:pine});photo.studio.add(photo.who.alex.group);photo.who.alex.group.visible=false;return;}
  if(SHOTS[id]?.live){liveCam(id,me,t);placeDouble();self.group.visible=false;try{shoot({cam,target,preset:null,quick:true});}finally{self.group.visible=true;dbl.group.visible=false;}return;}
  cam.fov=id==='alex-room'?70:50;cam.updateProjectionMatrix();const spec=stageAlex(id,t);if(!spec)return;try{shoot({cam,target,preset:spec.preset,sun:spec.sun,at:spec.at,room:spec.room,lamp:spec.lamp,quick:true});}finally{photo.studio.visible=false;for(const o of photo.studio.children)o.visible=false;}
  }finally{for(const q of off)q.visible=true;}}
 // For the photograph you take of the screen: what is on it right now, read back (null where it cannot be).
 function grab(tv,readPixels){const key=tv?.screen?.uuid,target=key&&rt[key];if(!target||!readPixels)return null;return {px:readPixels(target,target.width,target.height),w:target.width,h:target.height};}
 function reset(){dbl.group.visible=false;store.i=0;store.t=-9;store.changes=0;store.last=-1;}
 return {render,track,grab,reset,pine,cams,dbl,SHOTS,get storeCorner(){return store.i;},get storeCornerUV(){return STORE_CORNERS[store.i];},get storeCornerChanges(){return store.changes;}};
}
