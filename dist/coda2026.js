// The 2026 coda (Ending A: the gradual camera pullback). After Aftermath II's card ("One more lap →").
//
//  ride     The Prologue: the summer street in the golden light, the three of them riding with you, the date in the corner, the old
//           melody. It is the game's own Prologue (game.js's ride, friends.js, the evening's light), started over: it may look,
//           for a while, as if the game has gone back to the beginning. You can look around; the ride goes on by itself.
//  pull     Then the view starts, very slowly, to move back from it. The street is drawn into a picture (game.js shoot-style: the
//           same scene, the same camera, into a half-float target that three.js tone-maps and encodes exactly as it does the
//           screen), and the picture is the screen of a computer monitor in a room: at the first frame the monitor's screen fills
//           the view exactly, pixel for pixel, the date line and the captions drawn on it where the page drew them. Backing away,
//           its bezel comes into the edges of the view, then the desk, the lamp, the back of a man's head; over his shoulder.
//  room     A small room at night (2026): a desk, a lamp, the monitor with the Prologue on it, the window dark blue. On the desk:
//           Sam's notebook, aged; the photo-booth strip of the four of them propped against the lamp; Jamie's cap only if the save
//           says you kept it. On the wall: a map of Oak Hollow drawn by hand, index cards, the Sunday print. He built it.
//  line     He takes his hands off the keys; on the screen the bike rolls to a stop and the others wait for him up ahead. He looks
//           at the photograph. "I still remember."
//  title    On the monitor: LAST LIGHT. Then the credits (final-credits.js).
// Nothing in it is a dream or a trick: the room is the real one, the notebook and the pictures are the real ones, and what is on
// the screen is his recreation of what happened.
import * as THREE from './three.module.js';
import {createPerson,newPose,applyPose,P,BODY} from './rig.js';
import {createFace} from './faces.js';
import {ACT} from './chapter8-acting.js';
import {YOU26,ageHead} from './aftermath2-actors.js';
import {samNotebook,boothStrip,jamieCap,PAGES} from './aftermath2-props.js';
import {canvas,texOf} from './chapter7-props.js';
import {clamp,damp,smooth,lerp} from './chapter6-kit.js';

export const CODA_STAGES=['coda-start','coda-pullback','coda-room','coda-line','coda-title','coda-credits'];
// (seconds of each stage; the pullback's own path is below)
const T_RIDE=24,T_PULL=46,T_ROOM=13,T_LINE=12,T_TITLE=9.5;

export function createCoda(H){
 const {renderer,scene,camera,$}=H;
 const S={active:false,stage:null,t:0,st:0,keep:null,line:false,said:false,titled:false,swap:false,fov0:64,aspect:16/9,log:[]};
 const mark=w=>{S.log.push([+S.t.toFixed(1),w]);if(S.log.length>80)S.log.shift();};
 // ---- the room (its own scene: the world is on the screen) ---------------------------------------------------------------------------
 const room=new THREE.Scene();room.name='coda-room';room.background=new THREE.Color(0x07080c);
 const R=new THREE.Group();room.add(R);
 const mat=(c,o={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});m.name='coda';return m;};
 const box=(g,w,h,d,m,x,y,z,ry=0)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.rotation.y=ry;b.castShadow=true;b.receiveShadow=true;g.add(b);return b;};
 const W=3.8,DP=3.4,HT=2.5;// the room: x across (the desk on the back wall at z=0), y up, z toward the door
 // walls, floor, ceiling (the desk stands against the wall at z=-.38; the window is on the left wall)
 const wallM=mat(0xcfc6b6,{roughness:.95}),floorT=planks(),floorM=new THREE.MeshStandardMaterial({color:floorT?0xffffff:0x6e5440,map:floorT,roughness:.7});floorM.name='coda-floor';
 {const f=new THREE.Mesh(new THREE.PlaneGeometry(W,DP),floorM);f.rotation.x=-Math.PI/2;f.position.set(0,0,DP/2-.4);f.receiveShadow=true;R.add(f);
  const c=new THREE.Mesh(new THREE.PlaneGeometry(W,DP),mat(0xe2dccf));c.rotation.x=Math.PI/2;c.position.set(0,HT,DP/2-.4);R.add(c);
  const back=new THREE.Mesh(new THREE.PlaneGeometry(W,HT),wallM);back.position.set(0,HT/2,-.4);back.receiveShadow=true;R.add(back);
  const right=new THREE.Mesh(new THREE.PlaneGeometry(DP,HT),wallM);right.rotation.y=-Math.PI/2;right.position.set(W/2,HT/2,DP/2-.4);right.receiveShadow=true;R.add(right);
  const front=new THREE.Mesh(new THREE.PlaneGeometry(W,HT),wallM);front.rotation.y=Math.PI;front.position.set(0,HT/2,DP-.4);R.add(front);
  for(const [x,z,ry,len] of [[0,-.39,0,W],[W/2-.01,DP/2-.4,-Math.PI/2,DP]]){const b=box(R,len,.09,.015,mat(0xe8e2d6),x,.045,z,ry);b.castShadow=false;}}
 // the left wall, with the window: dark blue night, a few windows across the way, a streetlight's glow
 {const wx=-W/2;const L=new THREE.Group();L.position.set(wx,0,0);L.rotation.y=Math.PI/2;R.add(L);// (facing into the room: local x runs along the wall toward -z, so a place at world z is local x = -z)
  const winZ=1.05,winW=1.15,winY=1.45,winH=1.25,X=z=>-z;
  const piece=(z0,z1,y0,y1)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(z1-z0,y1-y0),wallM);m.position.set(X((z0+z1)/2),(y0+y1)/2,0);m.receiveShadow=true;L.add(m);};
  piece(-.4,winZ-winW/2,0,HT);piece(winZ+winW/2,DP-.4,0,HT);piece(winZ-winW/2,winZ+winW/2,0,winY-winH/2);piece(winZ-winW/2,winZ+winW/2,winY+winH/2,HT);
  const nt=nightTex(),night=new THREE.MeshBasicMaterial({map:nt||null,color:nt?0xffffff:0x0f1626});night.name='coda-night';night.toneMapped=false;
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(winW,winH),night);glass.position.set(X(winZ),winY,-.06);L.add(glass);
  const fm=mat(0xe8e2d6,{roughness:.6});for(const [w,h,z,y] of [[winW+.1,.06,winZ,winY+winH/2],[winW+.1,.08,winZ,winY-winH/2],[.06,winH,winZ-winW/2,winY],[.06,winH,winZ+winW/2,winY],[.035,winH,winZ,winY]]){const b=box(L,w,h,.07,fm,X(z),y,0);b.castShadow=false;}
  box(L,winW+.22,.035,.16,fm,X(winZ),winY-winH/2-.03,.06).castShadow=false;
  // the blind, half up
  const bl=mat(0xd8d2c4,{roughness:.9,side:THREE.DoubleSide});for(let i=0;i<9;i++){const sl=box(L,winW-.04,.006,.045,bl,X(winZ),winY+winH/2-.06-i*.045,-.01);sl.rotation.x=.5;sl.castShadow=false;}}
 // ---- the desk and what is on it -------------------------------------------------------------------------------------------------------
 const DESK={y:.74,z:0,w:1.5,d:.72};const deskT=woodTex(),top=new THREE.MeshStandardMaterial({color:deskT?0xffffff:0x9a7a56,map:deskT,roughness:.55});top.name='coda-desk';
 const metal=mat(0x1d1f22,{roughness:.45,metalness:.6});
 box(R,DESK.w,.035,DESK.d,top,0,DESK.y-.0175,DESK.z);for(const sx of [-1,1])for(const sz of [-1,1])box(R,.04,DESK.y-.035,.04,metal,sx*(DESK.w/2-.06),(DESK.y-.035)/2,sz*(DESK.d/2-.06));
 box(R,DESK.w-.12,.04,.04,metal,0,.16,-DESK.d/2+.06);
 // the monitor: its screen's aspect is the window's (so at the first frame it fills the view exactly); a thin bezel, a stand
 const MON={g:new THREE.Group(),h:.335,w:.596,cx:0,cy:DESK.y+.13+.335/2+.02,cz:-.12};
 const scrMat=new THREE.ShaderMaterial({uniforms:{map:{value:null},k:{value:1},vig:{value:0},glare:{value:0},title:{value:0},has:{value:0}},toneMapped:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  // (the picture as the page drew it: the target holds display values already, so nothing is converted again here; k dims it,
  //  vig is a monitor's faint falloff to its corners, glare the lamp's reflection, title fades it under the title)
  fragmentShader:'uniform sampler2D map;uniform float k,vig,glare,title,has;varying vec2 vUv;void main(){vec3 c=has>.5?texture2D(map,vUv).rgb:vec3(.05,.06,.08);vec2 q=vUv-.5;float v=1.-vig*smoothstep(.25,.75,length(q*vec2(1.,.8)));c*=k*v*(1.-.55*title);c+=glare*vec3(.06,.055,.05)*smoothstep(.5,.0,length(vUv-vec2(.82,.86)));gl_FragColor=vec4(c,1.);}'});
 scrMat.name='coda-screen';
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1,1),scrMat);MON.g.add(screen);
 const ovT=document.createElement?.('canvas')||null;let ovG=null,ovTex=null;try{if(ovT?.getContext){ovG=ovT.getContext('2d');ovT.width=1600;ovT.height=900;ovTex=new THREE.CanvasTexture(ovT);ovTex.colorSpace=THREE.SRGBColorSpace;}}catch{ovG=null;}
 const ovM=new THREE.MeshBasicMaterial({map:ovTex,transparent:true,depthWrite:false,toneMapped:false});ovM.name='coda-overlay';const overlay=new THREE.Mesh(new THREE.PlaneGeometry(1,1),ovM);overlay.position.z=.0006;overlay.visible=!!ovTex;MON.g.add(overlay);
 const bezM=mat(0x101113,{roughness:.35,metalness:.15}),bez=[];for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,.022),bezM);b.castShadow=true;MON.g.add(b);bez.push(b);}
 const backM=mat(0x16171a,{roughness:.5});const shell=new THREE.Mesh(new THREE.BoxGeometry(1,1,.03),backM);shell.castShadow=true;MON.g.add(shell);
 const standM=mat(0xa8abae,{roughness:.35,metalness:.75});const neck=box(MON.g,.05,.2,.02,standM,0,-MON.h/2-.06,-.035);const foot=box(MON.g,.22,.012,.16,standM,0,-MON.h/2-.14,.01);void neck;void foot;
 // a sticky note on the bezel, in his writing
 const stickyT=stickyTex(),sticky=new THREE.Mesh(new THREE.PlaneGeometry(.055,.055),new THREE.MeshStandardMaterial({color:stickyT?0xffffff:0xf2df7a,map:stickyT,roughness:.9}));sticky.material.name='coda-sticky';MON.g.add(sticky);
 R.add(MON.g);
 function shapeMonitor(aspect){const h=MON.h,w=h*aspect;MON.w=w;screen.scale.set(w,h,1);overlay.scale.set(w,h,1);const b=.012;
  bez[0].scale.set(w+2*b,b,1);bez[0].position.set(0,h/2+b/2,-.008);bez[1].scale.set(w+2*b,b*1.9,1);bez[1].position.set(0,-h/2-b*.95,-.008);bez[2].scale.set(b,h,1);bez[2].position.set(-w/2-b/2,0,-.008);bez[3].scale.set(b,h,1);bez[3].position.set(w/2+b/2,0,-.008);
  shell.scale.set(w+.02,h+.03,1);shell.position.set(0,-.005,-.03);sticky.position.set(-w/2-.004+.03,-h/2-.03+.005,.012);sticky.rotation.z=.05;
  MON.g.position.set(MON.cx,MON.cy,MON.cz);}
 shapeMonitor(16/9);
 // keyboard, mouse, speakers, a mug, headphones
 const kbT=keysTex(),kb=box(R,.44,.022,.14,new THREE.MeshStandardMaterial({color:kbT?0xffffff:0x1c1d20,map:kbT,roughness:.55}),-.05,DESK.y+.011,.17);kb.material.name='coda-keyboard';
 const mouse=box(R,.06,.03,.1,mat(0x1c1d20,{roughness:.4}),.3,DESK.y+.015,.18);box(R,.26,.003,.22,mat(0x2a2c30,{roughness:1}),.3,DESK.y+.0015,.17).castShadow=false;
 for(const sx of [-1,1]){box(R,.1,.17,.12,mat(0x26282b,{roughness:.6}),sx*.5,DESK.y+.085,-.16);const cone=new THREE.Mesh(new THREE.CircleGeometry(.032,18),mat(0x111214,{roughness:.8}));cone.position.set(sx*.5,DESK.y+.1,-.099);R.add(cone);}
 {const mug=new THREE.Mesh(new THREE.CylinderGeometry(.042,.04,.1,18),mat(0x3f5f6e,{roughness:.5}));mug.position.set(-.5,DESK.y+.05,.12);mug.castShadow=true;R.add(mug);const hd=new THREE.Mesh(new THREE.TorusGeometry(.03,.008,6,14,Math.PI),mug.material);hd.rotation.z=-Math.PI/2;hd.position.set(-.455,DESK.y+.05,.12);R.add(hd);}
 {const hp=new THREE.Mesh(new THREE.TorusGeometry(.085,.012,8,20,Math.PI*1.1),mat(0x202124,{roughness:.6}));hp.rotation.set(-Math.PI/2+.2,0,.4);hp.position.set(-.62,DESK.y+.02,-.08);hp.castShadow=true;R.add(hp);}
 // the lamp (right), its light the room's key
 const lampG=new THREE.Group();lampG.position.set(.58,DESK.y,-.18);R.add(lampG);{const base=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.025,20),metal);base.position.y=.0125;base.castShadow=true;lampG.add(base);
  const a1=box(lampG,.018,.34,.018,metal,0,.18,0);a1.rotation.z=.18;const a2=box(lampG,.018,.3,.018,metal,-.1,.4,.06);a2.rotation.set(.5,0,1.0);
  const shade=new THREE.Mesh(new THREE.ConeGeometry(.075,.12,20,1,true),new THREE.MeshStandardMaterial({color:0x2a2c2e,roughness:.4,metalness:.4,side:THREE.DoubleSide}));shade.position.set(-.22,.47,.12);shade.rotation.z=-.65;shade.castShadow=true;lampG.add(shade);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),new THREE.MeshBasicMaterial({color:0xffe2b0}));bulb.position.set(-.235,.44,.12);lampG.add(bulb);}
 const lamp=new THREE.SpotLight(0xffc690,5.5,4.5,.95,.65,2);lamp.position.set(.36,DESK.y+.44,-.06);lamp.target.position.set(.05,DESK.y,.2);lamp.castShadow=true;lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.0008;lamp.shadow.normalBias=.02;Object.assign(lamp.shadow.camera,{near:.05,far:4});R.add(lamp,lamp.target);
 const lampFill=new THREE.PointLight(0xffb070,.9,3.2,2);lampFill.position.set(.45,DESK.y+.5,.1);R.add(lampFill);
 const glow=new THREE.PointLight(0xc4d6ff,1.1,2.6,2);glow.position.set(0,MON.cy,.25);R.add(glow);
 const hemi=new THREE.HemisphereLight(0x51617f,0x17130f,.42);R.add(hemi);
 const moon=new THREE.DirectionalLight(0x7186b0,.35);moon.position.set(-3,2.4,1.2);moon.target.position.set(0,.8,0);R.add(moon,moon.target);
 // the things he kept: the notebook (fifteen years on it); the four of them in the photo-booth strip, propped against the lamp; his cap
 const notebook=samNotebook({k:1.5});notebook.position.set(.34,DESK.y+.001,.02);notebook.rotation.y=-.3;R.add(notebook);
 const strip=boothStrip({k:1,w:.055,h:.19});strip.position.set(.5,DESK.y+.093,-.08);strip.rotation.set(-.12,-.55,0);R.add(strip);
 const stripStand=box(R,.012,.08,.03,mat(0x6a5038),.505,DESK.y+.04,-.11,-.55);void stripStand;
 const cap=jamieCap({faded:.12});cap.position.set(.66,DESK.y+.001,.16);cap.rotation.set(0,2.4,0);R.add(cap);cap.visible=false;
 // the wall over the desk: a cork board with his map of Oak Hollow, index cards in his writing, the Sunday print
 const board=new THREE.Group();board.position.set(-.05,1.52,-.395);R.add(board);
 {const ck=mat(0xa47c52,{roughness:1});const c=new THREE.Mesh(new THREE.BoxGeometry(1.1,.62,.02),ck);c.receiveShadow=true;board.add(c);const fr=mat(0x5a4632,{roughness:.8});for(const [w,h,x,y] of [[1.14,.025,0,.322],[1.14,.025,0,-.322],[.025,.62,-.557,0],[.025,.62,.557,0]])box(board,w,h,.03,fr,x,y,.005).castShadow=false;
  const mt=mapTex(),map=new THREE.Mesh(new THREE.PlaneGeometry(.42,.32),new THREE.MeshStandardMaterial({color:mt?0xffffff:0xeee8da,map:mt,roughness:.9}));map.material.name='coda-map';map.position.set(-.27,.04,.012);map.rotation.z=-.02;board.add(map);
  const cards=cardTexes();cards.forEach((t,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.125,.075),new THREE.MeshStandardMaterial({color:t?0xffffff:0xf4f0e4,map:t,roughness:.9}));m.material.name='coda-card';
   m.position.set(.06+(i%3)*.135,.2-Math.floor(i/3)*.09,.013+i*.0004);m.rotation.z=(i%2?.03:-.025);board.add(m);});
  const pt=PAGES.sunday(),pr=new THREE.Mesh(new THREE.PlaneGeometry(.16,.12),new THREE.MeshStandardMaterial({color:pt?0xffffff:0xe8d8b8,map:pt,roughness:.6}));pr.material.name='coda-print';pr.position.set(.34,-.17,.014);pr.rotation.z=.04;board.add(pr);board.userData.print=pr;
  for(const [x,y] of [[-.27,.2],[.34,-.11],[.06,.235]]){const pin=new THREE.Mesh(new THREE.SphereGeometry(.006,6,5),mat(0xb8322a));pin.position.set(x,y,.02);board.add(pin);}}
 // a shelf, books, a plant (a lived-in room, no more than that)
 {const sh=box(R,.9,.025,.22,mat(0x9a7a56),.95,1.92,-.3);void sh;const cols=[0x4a5a6a,0x7a3a2e,0xc8b88a,0x2e3a2e,0x5a4a6a,0x8a7a5a,0x2a2c30];for(let i=0;i<11;i++){const h=.16+((i*37)%7)*.012;box(R,.03+((i*13)%3)*.008,h,.15,mat(cols[i%cols.length],{roughness:.8}),.6+i*.04,1.933+h/2,-.3);}
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.07,.055,.12,14),mat(0xb06a48));pot.position.set(1.28,1.993,-.3);R.add(pot);for(let i=0;i<7;i++){const lf=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),mat(0x3d6a34,{roughness:.9}));lf.scale.set(1,.45,1.6);lf.position.set(1.28+Math.sin(i*1.9)*.08,2.06+i*.006,-.3+Math.cos(i*1.9)*.06);lf.rotation.set(.4,i,.2);R.add(lf);}}
 // the chair
 const chair=new THREE.Group();chair.position.set(0,0,.72);R.add(chair);{const cm=mat(0x1e1f22,{roughness:.7});box(chair,.5,.06,.48,cm,0,.47,0);const bk=box(chair,.46,.55,.05,cm,0,.8,.24);bk.rotation.x=-.1;box(chair,.05,.4,.05,metal,0,.25,0);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const leg=box(chair,.3,.025,.04,metal,Math.sin(a)*.15,.05,Math.cos(a)*.15,a+Math.PI/2);void leg;}
  const jk=box(chair,.5,.3,.07,mat(0x4a5a48,{roughness:1}),0,.92,.28);jk.rotation.x=-.12;}// (a jacket over the back of it)
 // ---- him: twenty-seven, at home, at the desk (provisional, derived from the protagonist's own model: aftermath2-actors.js YOU26) -------
 const man=createPerson(YOU26);ageHead(man,{stubble:.1,long:1.05});const face=createFace(man,YOU26);man.face=face;face.rich?.(true);face.enable?.(true);
 man.group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});R.add(man.group);man.group.position.set(0,0,.66);man.group.rotation.y=0;
 const ME={look:0,lookPitch:-.05,want:{look:0,pitch:-.05},hands:'keys',handsK:1,lean:.08,talk:0,speech:null,t:0};
 const pose=newPose(),_v=new THREE.Vector3();
 const KEYS={l:new THREE.Vector3(-.16,DESK.y+.035,.2),r:new THREE.Vector3(.3,DESK.y+.04,.2),lapL:new THREE.Vector3(-.1,.58,.42),lapR:new THREE.Vector3(.12,.6,.44)};
 function poseMan(dt){ME.t+=dt;ME.look=damp(ME.look,ME.want.look,1.6,dt);ME.lookPitch=damp(ME.lookPitch,ME.want.pitch,1.6,dt);ME.handsK=damp(ME.handsK,ME.hands==='keys'?1:0,1.4,dt);
  const s=YOU26.scale,seat=.5/s;ACT.seat(seat,{hands:'knees',look:ME.look,lookPitch:ME.lookPitch,lean:ME.lean})(pose,{clock:ME.t});
  // hands: on the keys and the mouse, or off them, resting
  man.group.updateMatrixWorld(true);for(const [o,e,a,b,sd] of [[P.lh,P.le,KEYS.l,KEYS.lapL,-1],[P.rh,P.re,KEYS.r,KEYS.lapR,1]]){_v.copy(a).lerp(b,1-ME.handsK);man.group.worldToLocal(_v);pose[o]=_v.x;pose[o+1]=_v.y;pose[o+2]=_v.z;pose[e]=sd*.9;pose[e+1]=-.6;pose[e+2]=.3;}
  // a breath; the small movement of someone playing (his left hand on W)
  pose[P.root+1]+=Math.sin(ME.t*1.7)*.002;if(ME.hands==='keys')pose[P.lh+1]+=Math.max(0,Math.sin(ME.t*.9))*.002;
  applyPose(man,pose);if(ME.talk>0)ME.talk-=dt;face.update(dt,{clock:ME.t,talk:ME.talk,speech:ME.speech,visible:true,seed:7});}
 // ---- the picture: the world, drawn into a target exactly as the page draws it --------------------------------------------------------------
 let RT=null;const sz=new THREE.Vector2();
 function ensureRT(){if(typeof renderer.setRenderTarget!=='function')return null;renderer.getDrawingBufferSize?.(sz);const w=Math.max(2,Math.round(sz.x||innerWidth)),h=Math.max(2,Math.round(sz.y||innerHeight));
  if(RT&&RT.width===w&&RT.height===h)return RT;RT?.dispose();
  const ms=renderer.capabilities?.isWebGL2&&renderer.extensions?.has?.('EXT_color_buffer_float')?4:0;
  RT=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,samples:ms,depthBuffer:true});RT.texture.colorSpace=THREE.SRGBColorSpace;RT.isXRRenderTarget=true;// (tone mapping and the sRGB transfer applied as for the screen: see the header)
  RT.texture.minFilter=THREE.LinearFilter;RT.texture.magFilter=THREE.LinearFilter;RT.texture.generateMipmaps=false;scrMat.uniforms.map.value=RT.texture;scrMat.uniforms.has.value=1;return RT;}
 // ---- the camera's way back (in the desk's frame: x right, y up, z out of the screen toward him and the room) ------------------------------------
 const rc=new THREE.PerspectiveCamera(64,16/9,.01,30);room.add(rc);
 let PATH=null;
 function buildPath(){const sc=new THREE.Vector3(MON.cx,MON.cy,MON.cz),d0=(MON.h/2)/Math.tan(THREE.MathUtils.degToRad(S.fov0/2));
  // keys: [t (0..1 of the pullback), position offset from the screen centre, look target offset, fov]
  PATH=[[0,[0,0,d0],[0,0,0],S.fov0],[.16,[0,.004,d0+.11],[0,0,0],S.fov0],[.3,[.14,.12,.46],[0,-.01,0],S.fov0-2],[.46,[.34,.26,.84],[0,-.04,0],S.fov0-6],
   [.62,[.62,.34,1.24],[.03,-.1,.12],S.fov0-10],[.8,[.9,.34,1.6],[.04,-.15,.2],S.fov0-13],[1,[1.08,.31,1.8],[.03,-.16,.24],S.fov0-14]].map(([t,p,l,f])=>({t,p:new THREE.Vector3(...p).add(sc),l:new THREE.Vector3(...l).add(sc),f}));}
 const cr=(a,b,c,d,t)=>{const t2=t*t,t3=t2*t;return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);};
 function along(u){const K=PATH,n=K.length;let i=1;while(i<n-1&&K[i].t<u)i++;const a=K[Math.max(0,i-2)],b=K[i-1],c=K[i],d=K[Math.min(n-1,i+1)],t=clamp((u-b.t)/(c.t-b.t||1),0,1);
  const P2=new THREE.Vector3(cr(a.p.x,b.p.x,c.p.x,d.p.x,t),cr(a.p.y,b.p.y,c.p.y,d.p.y,t),cr(a.p.z,b.p.z,c.p.z,d.p.z,t)),Lk=new THREE.Vector3(cr(a.l.x,b.l.x,c.l.x,d.l.x,t),cr(a.l.y,b.l.y,c.l.y,d.l.y,t),cr(a.l.z,b.l.z,c.l.z,d.l.z,t));
  return {p:P2,l:Lk,f:lerp(b.f,c.f,smooth(t))};}
 // time → how far back: almost nothing for the first seconds (the bezel just entering the edges), then a long glide, easing into rest
 const ease=x=>{x=clamp(x,0,1);return x<.18?.16*smooth(x/.18)**1.6:.16+.84*smooth((x-.18)/.82);};
 function placeCamera(u){const q=along(ease(u));rc.position.copy(q.p);rc.lookAt(q.l);if(Math.abs(rc.fov-q.f)>.01||rc.aspect!==S.aspect){rc.fov=q.f;rc.aspect=S.aspect;rc.updateProjectionMatrix();}}
 // ---- what is drawn on the screen besides the picture: the page's own date line and captions (where the page drew them), then the title ---------
 const OV={date:'',cap:'',who:'',capA:0,title:0,key:'',dr:null,cr:null};
 const rectOf=el=>{try{const r=el?.getBoundingClientRect?.();if(!r||!r.width)return null;const cs=getComputedStyle?.(el);return {x:r.left,y:r.top,w:r.width,h:r.height,fs:parseFloat(cs?.fontSize)||null};}catch{return null;}};
 function readPage(){const d=$('date'),s=$('subtitle');const raw=d?.innerHTML||d?.textContent||'';OV.date=raw.replace(/<[^>]+>/g,'|').replace(/\|+/g,'|').trim();if(!OV.dr)OV.dr=rectOf(d);const cr=rectOf(s);if(cr)OV.cr=cr;
  const small=s?.querySelector?.('small');OV.who=small?.textContent||'';OV.cap=(s?.textContent||'').replace(OV.who,'').trim();OV.capA=+(s?.style?.opacity||0);}
 function drawOverlay(){if(!ovG)return;const key=[OV.date,OV.cap,OV.who,OV.capA.toFixed(2),OV.title.toFixed(3),S.aspect.toFixed(3)].join('|');if(key===OV.key)return;OV.key=key;
  const w=ovT.width=1600,h=ovT.height=Math.round(1600/S.aspect),sx=w/Math.max(1,innerWidth),g=ovG;g.clearRect(0,0,w,h);
  // the date line (the page's own place for it: top-left)
  if(OV.date&&OV.title<.98){g.save();g.globalAlpha=1-OV.title;g.fillStyle='rgba(255,241,211,.73)';const R0=OV.dr||{x:45,y:137,fs:11},fs=(R0.fs||11)*sx;g.font=`${Math.round(fs)}px Arial`;try{g.letterSpacing=(2*sx)+'px';}catch{}
   const [a,b='']=OV.date.split('|').map(t=>t.trim()),x0=R0.x*sx,y0=(R0.y*sx)+fs;g.fillText(a.toUpperCase(),x0,y0);const wa=g.measureText(a.toUpperCase()).width;g.beginPath();g.arc(x0+wa+(12+2)*sx,y0-fs*.33,1.5*sx,0,7);g.fill();g.fillText(b.toUpperCase(),x0+wa+(24+3)*sx,y0);g.restore();}
  // a caption, centred low, light italic over the picture
  if(OV.cap&&OV.capA>.01){g.save();g.globalAlpha=OV.capA*(1-OV.title);g.textAlign='center';g.shadowColor='rgba(21,19,35,.9)';g.shadowBlur=10*sx;const C0=OV.cr||{x:innerWidth/2-325,y:innerHeight*.8-60,w:650,h:60,fs:24},fs=(C0.fs||24)*sx,cx=(C0.x+C0.w/2)*sx;
   g.font=`italic ${Math.round(fs)}px Georgia`;const words=OV.cap.split(' '),ls=[];let ln='';for(const wd of words){const t=ln?ln+' '+wd:wd;if(g.measureText(t).width>C0.w*sx&&ln){ls.push(ln);ln=wd;}else ln=t;}if(ln)ls.push(ln);
   let y=(C0.y+C0.h)*sx-ls.length*fs*1.65+fs*1.2;if(OV.who){g.font=`${Math.round(10*sx)}px Arial`;g.fillStyle='#fbd797';g.fillText(OV.who,cx,y-fs*1.1);}g.font=`italic ${Math.round(fs)}px Georgia`;g.fillStyle='#fff7ea';for(const l of ls){g.fillText(l,cx,y);y+=fs*1.65;}g.restore();}
  // the title (the game's own, as its cards set it)
  if(OV.title>0){g.save();g.globalAlpha=smooth(OV.title);g.textAlign='center';g.fillStyle='#fff3df';g.shadowColor='rgba(10,8,18,.7)';g.shadowBlur=24;g.font=`${Math.round(h*.13)}px Georgia`;try{g.letterSpacing=Math.round(h*.02)+'px';}catch{}g.fillText('LAST LIGHT',w/2,h*.53);g.restore();}
  if(ovTex)ovTex.needsUpdate=true;}
 // ---- the stages ---------------------------------------------------------------------------------------------------------------------------
 const hide=(id,on)=>{const el=$(id);if(el?.style)el.style.visibility=on?'hidden':'';};
 function chrome(on){for(const id of ['date','subtitle','prompt','objective-panel','reflection','ride-ui'])hide(id,on);}
 function setStage(st){S.stage=st;S.st=0;mark('stage '+st);}
 function begin(section='coda-start',{keep=null}={}){const i=Math.max(0,CODA_STAGES.indexOf(section)),kept=keep||S.keep||{};
  // (the world first: the Prologue's own beginning, the friends, the light; that resets the page, so the coda's own state comes after)
  if(section==='coda-credits'){H.prologue(260,{auto:false,lines:false});S.active=false;S.keep=kept;H.credits(kept);return;}
  H.prologue(i<=0?0:i===1?112:i===2?190:i===3?250:300,{auto:i<3,lines:i<=1});
  S.active=true;S.keep=kept;S.t=0;S.line=false;S.said=false;S.titled=false;S.swap=false;S.dated=false;S.pullDone=false;OV.title=0;OV.key='';OV.capA=0;OV.cap='';OV.dr=null;OV.cr=null;
  scrMat.uniforms.title.value=0;scrMat.uniforms.vig.value=i>=2?.28:0;scrMat.uniforms.glare.value=i>=2?1:0;
  cap.visible=S.keep.cap==='you';board.userData.print.visible=S.keep.print!==false;
  ME.hands='keys';ME.handsK=1;ME.want={look:0,pitch:-.05};ME.look=0;ME.lookPitch=-.05;ME.lean=.08;
  S.aspect=Math.max(1.2,Math.min(2.6,innerWidth/Math.max(1,innerHeight)));S.fov0=camera.fov||64;shapeMonitor(S.aspect);buildPath();
  if(i<=0){setStage('ride');chrome(false);}
  else{S.swap=true;chrome(true);readPage();setStage(i===1?'pull':i===2?'room':i===3?'line':'title');
   if(i>=2)S.pullDone=true;if(i>=3){ME.hands='off';ME.handsK=0;H.setAuto?.(false);hide('subtitle',false);}if(i>=4){S.said=true;}H.screenSound?.(1);
   if(i>=2){S.dated=true;H.date?.('AUGUST 21, 2026 <i></i> 11:48 PM',true);}}
  mark('begin '+section);}
 function update(dt){if(!S.active)return;S.t+=dt;S.st+=dt;const g=H.game();
  if(S.stage==='ride'){if(S.st>T_RIDE&&g.captionTimer<1.2){S.swap=true;readPage();chrome(true);setStage('pull');H.checkpoint?.('coda-pullback');H.stopLines?.();}}
  else if(S.stage==='pull'){const u=S.st/T_PULL;H.screenSound?.(smooth(clamp((u-.2)/.5,0,1)));
   scrMat.uniforms.vig.value=.28*smooth((u-.1)/.4);scrMat.uniforms.glare.value=smooth((u-.4)/.4);if(u>=1){setStage('room');S.pullDone=true;H.checkpoint?.('coda-room');}}
  else if(S.stage==='room'){if(S.st>4&&!S.dated){S.dated=true;H.date?.('AUGUST 21, 2026 <i></i> 11:48 PM',true);}
   if(S.st>T_ROOM){setStage('line');H.checkpoint?.('coda-line');}}
  else if(S.stage==='line'){// hands off the keys: the bike on the screen rolls to a stop, the others wait for him up ahead
   if(S.st>.2&&ME.hands==='keys'){ME.hands='off';H.setAuto?.(false);ME.lean=-.04;hide('subtitle',false);}
   if(S.st>3)ME.want={look:-.62,pitch:-.18};// (toward the strip, propped against the lamp: down and to his right)
   if(S.st>6.2&&!S.said){S.said=true;ME.talk=2.6;ME.speech={text:'I still remember.',dur:2.6};H.say('YOU','“I still remember.”',6);mark('the line');}
   if(S.st>T_LINE){setStage('title');H.checkpoint?.('coda-title');}}
  else if(S.stage==='title'){OV.title=Math.min(1,OV.title+dt/3.2);scrMat.uniforms.title.value=OV.title;if(!S.titled&&OV.title>.2){S.titled=true;H.theme?.(true);}
   if(S.st>T_TITLE){setStage('out');S.outT=0;}}
  else if(S.stage==='out'){S.outT+=dt;H.fade(smooth(S.outT/3));if(S.outT>3.4){S.active=false;S.stage='done';chrome(false);H.credits(S.keep);}}
  if(S.stage!=='pull'&&S.stage!=='ride'&&OV.capA>0)OV.capA=Math.max(0,OV.capA-dt*1.2);
  if(S.swap&&S.stage!=='done')placeCamera(S.stage==='pull'?S.st/T_PULL:1);
  poseMan(dt);}
 // every frame, instead of the page's own render: before the swap, the world; after it, the room with the world on its screen
 function render(){const info=renderer.info?.render;
  if(!S.active||!S.swap){renderer.render(scene,camera);return info;}
  const rt=ensureRT();if(!rt){renderer.render(scene,camera);return info;}
  if(S.stage==='pull')readPage();drawOverlay();
  const exp=renderer.toneMappingExposure;
  renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);
  renderer.toneMappingExposure=1.08;try{renderer.render(room,rc);}finally{renderer.toneMappingExposure=exp;}return info;}
 function reset(){S.active=false;S.stage=null;S.swap=false;chrome(false);OV.title=0;scrMat.uniforms.title.value=0;scrMat.uniforms.vig.value=0;scrMat.uniforms.glare.value=0;S.dated=false;S.pullDone=false;}
 return {begin,update,render,reset,room,rc,man,ME,MON,S,
  get active(){return S.active;},get swapped(){return S.swap;},
  state:()=>({active:S.active,stage:S.stage,t:+S.t.toFixed(2),st:+S.st.toFixed(2),swap:S.swap,said:S.said,titled:S.titled,title:+OV.title.toFixed(2),cap:cap.visible,print:board.userData.print.visible,hands:ME.hands,look:+ME.look.toFixed(2),
   camera:{x:+rc.position.x.toFixed(3),y:+rc.position.y.toFixed(3),z:+rc.position.z.toFixed(3),fov:+rc.fov.toFixed(1)},screen:{w:+MON.w.toFixed(3),h:MON.h},rt:RT?{w:RT.width,h:RT.height,samples:RT.samples}:null,log:S.log.slice(-20)})};
}

// ---- the room's own paper and surfaces (canvases; null in tests) -------------------------------------------------------------------------------
function planks(){const cv=canvas(512,512);if(!cv)return null;const {g}=cv;for(let i=0;i<8;i++){const c=110+((i*53)%30);g.fillStyle=`rgb(${c},${c*.74|0},${c*.52|0})`;g.fillRect(0,i*64,512,64);
  for(let k=0;k<40;k++){g.strokeStyle=`rgba(60,40,24,${.05+Math.random()*.08})`;g.beginPath();const y=i*64+Math.random()*64;g.moveTo(0,y);g.bezierCurveTo(170,y+Math.random()*6-3,340,y+Math.random()*6-3,512,y+Math.random()*4-2);g.stroke();}
  g.fillStyle='rgba(30,20,12,.55)';g.fillRect(0,i*64,512,2);g.fillRect(((i*157)%512),i*64,2,64);}const t=texOf(cv);if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3.5);}return t;}
function woodTex(){const cv=canvas(512,256);if(!cv)return null;const {g}=cv;g.fillStyle='#a07c56';g.fillRect(0,0,512,256);for(let k=0;k<90;k++){g.strokeStyle=`rgba(${90+Math.random()*30},${60+Math.random()*20},${36},${.08+Math.random()*.1})`;g.lineWidth=1+Math.random()*2;g.beginPath();const y=Math.random()*256;g.moveTo(0,y);g.bezierCurveTo(170,y+Math.random()*10-5,340,y+Math.random()*10-5,512,y+Math.random()*8-4);g.stroke();}return texOf(cv);}
function keysTex(){const cv=canvas(512,160);if(!cv)return null;const {g}=cv;g.fillStyle='#1a1b1e';g.fillRect(0,0,512,160);for(let r=0;r<5;r++)for(let c=0;c<15;c++){g.fillStyle=r===4&&c>3&&c<11?'#26282c':'#2a2c30';g.fillRect(8+c*33,10+r*29,29,25);}
 g.fillStyle='#3a3d42';for(const c of [1,2,3])g.fillRect(8+c*33,10+2*29,29,25);g.fillRect(8+2*33,10+29,29,25);return texOf(cv);}
function stickyTex(){const cv=canvas(128,128);if(!cv)return null;const {g}=cv;g.fillStyle='#f0dd78';g.fillRect(0,0,128,128);g.fillStyle='#2a2f46';g.font='bold 19px "Comic Sans MS", "Chalkboard SE", sans-serif';g.fillText('AUG 21',14,46);g.fillText('7:42 PM',14,76);g.font='15px "Comic Sans MS", sans-serif';g.fillText('the light',14,104);return texOf(cv);}
function nightTex(){const cv=canvas(256,256);if(!cv)return null;const {g}=cv;const s=g.createLinearGradient(0,0,0,256);s.addColorStop(0,'#0b1222');s.addColorStop(.7,'#182338');s.addColorStop(1,'#2a2c38');g.fillStyle=s;g.fillRect(0,0,256,256);
 g.fillStyle='#10131a';g.fillRect(0,170,256,86);for(const [x,y,w,h] of [[20,150,46,40],[90,130,60,60],[180,145,50,45]]){g.fillStyle='#0d1016';g.fillRect(x,y,w,h);}
 for(const [x,y] of [[30,160],[48,172],[104,142],[128,160],[196,156],[210,170]]){g.fillStyle='rgba(255,196,120,.75)';g.fillRect(x,y,8,9);}
 const r=g.createRadialGradient(150,200,2,150,200,40);r.addColorStop(0,'rgba(220,230,255,.5)');r.addColorStop(1,'rgba(220,230,255,0)');g.fillStyle=r;g.fillRect(100,150,100,100);return texOf(cv);}
// his map of Oak Hollow, from memory: the Drive, Briarwood off it to the right, Summerfield to the left, the oak at the end
function mapTex(){const cv=canvas(640,488);if(!cv)return null;const {g}=cv,w=640,h=488;g.fillStyle='#f0ead8';g.fillRect(0,0,w,h);g.strokeStyle='rgba(120,150,190,.25)';g.lineWidth=1;for(let x=0;x<w;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<h;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
 const ink=(c,wd)=>{g.strokeStyle=c;g.fillStyle=c;g.lineWidth=wd;g.lineCap='round';};ink('#2a2f46',5);
 g.beginPath();g.moveTo(70,450);g.bezierCurveTo(120,330,90,240,150,170);g.bezierCurveTo(200,110,330,90,470,70);g.stroke();// the Drive
 g.beginPath();g.moveTo(160,165);g.bezierCurveTo(230,200,250,260,330,300);g.stroke();// Briarwood
 g.beginPath();g.moveTo(330,86);g.lineTo(350,10);g.stroke();// Summerfield
 ink('#2a2f46',2);g.beginPath();g.arc(500,66,26,0,7);g.stroke();
 g.font='15px "Courier New", monospace';g.fillStyle='#2a2f46';g.fillText('OAK HOLLOW DR',60,300);g.fillText('BRIARWOOD',240,236);g.fillText('SUMMERFIELD',356,30);
 const tag=(x,y,t,c='#2a2f46')=>{g.fillStyle=c;g.beginPath();g.arc(x,y,5,0,7);g.fill();g.font='bold 15px "Courier New", monospace';g.fillText(t,x+9,y+5);};
 tag(108,330,'ME');tag(318,318,'ALEX');tag(250,98,'JAMIE');tag(410,104,'SAM');
 ink('#3d6a34',3);g.beginPath();g.arc(560,52,15,0,7);g.stroke();g.fillStyle='#3d6a34';g.font='bold 15px "Courier New", monospace';g.fillText('THE OAK',520,28);
 ink('#b8322a',2);g.setLineDash([6,5]);g.beginPath();g.moveTo(70,440);g.bezierCurveTo(120,330,90,240,150,170);g.bezierCurveTo(200,110,330,90,520,62);g.stroke();g.setLineDash([]);
 g.font='italic 14px Georgia';g.fillStyle='#b8322a';g.fillText('the long way home',150,420);return texOf(cv);}
function cardTexes(){const T=[['PROLOGUE','The long way home','Aug 21 · 7:42 PM'],['CH. 8','The night Oak Hollow fell','Aug 27, 2011'],['AFTERMATH','What was left','Oct. 2011'],
  ['ALEX','rings twice.','every corner.'],['JAMIE','cap backwards','when he rides'],['SAM','fixes the chain','(backwards, slow)']];
 return T.map(([a,b,c])=>{const cv=canvas(250,150);if(!cv)return null;const {g}=cv;g.fillStyle='#f6f2e6';g.fillRect(0,0,250,150);g.strokeStyle='rgba(190,90,90,.5)';g.beginPath();g.moveTo(0,30);g.lineTo(250,30);g.stroke();g.strokeStyle='rgba(120,150,200,.35)';for(let y=55;y<150;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(250,y);g.stroke();}
  g.fillStyle='#2a2f46';g.font='bold 20px "Comic Sans MS", "Chalkboard SE", sans-serif';g.fillText(a,12,24);g.font='18px "Comic Sans MS", sans-serif';g.fillText(b,12,74);g.fillText(c,12,100);return texOf(cv);});}
