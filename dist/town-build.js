// Chapter Four: builds Old Mill Road and downtown from town-plan.js. Static pieces go into the world's bake under the
// zone 'town' (outdoors, culled by distance) and 'town-int' (the rooms you can walk into, drawn only near them).
// Everything that changes while you play is built here too, outside the bake: streetlight heads and the light they put
// on the pavement, shop windows and signs that light up and go out, the Lyric's marquee and blade sign, the
// televisions, the doors, ceiling lights. All of those read one array of levels (0–1) — so whoever runs the evening
// (chapter4.js, presence.js) sets numbers, never materials, and putting it all back is filling an array.
import * as THREE from './three.module.js';
import {createKit,seeded,hashSeed,smooth,clamp,lerp} from './kit.js';
import {makeCar} from './props.js';
import {TY,T0,TW,TL,CONN,CONN_X,CONN_HOUSES,connAt,connBase,connY,connStrip,MAIN,mainHalf,mainWalk,mainBase,CROSS,CREEK,CORE,SURF,GRID,
 BUILDINGS,BLD,footprint,INTERIORS,STEPS,SOLIDS,LAMPS,DOORS,REGION,inRegion,landY,townY,SPOT,SUMMERFIELD,connProject} from './town-plan.js';

// ---- the levels every lit thing reads ------------------------------------------------------------------------------------
// 0–63 streetlights (LAMPS ids), 64–95 shops (BUILDINGS lit), 96–127 fixtures indoors, 128–159 marquee, neon, screens' glow.
export const LV={lamp:0,shop:64,fix:96,neon:128,n:160};
export const NEON={marquee:0,bulbs:1,blade:2,dinerSign:3,dinerOpen:4,videoOpen:5,videoSign:6,exitSign:7,lyricUpper:8,vending:9,gasPrice:10,tapNeon:11,barberPole:12,laundrySign:13,pizzaNeon:14,drugNeon:15,churchSign:16,clock:17};
const levelU={value:new Float32Array(LV.n)},timeU={value:0};export const levels=levelU.value;
function lvMat(params,{gain=1,flicker=0,chase=false}={}){const m=new THREE.MeshStandardMaterial(params);
 m.onBeforeCompile=sh=>{sh.uniforms.uLv=levelU;sh.uniforms.uT=timeU;
  sh.vertexShader='attribute float lvl;uniform float uLv['+LV.n+'];varying float vLv;varying float vPh;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLv=uLv[int(floor(lvl+.001))];vPh=fract(lvl+.001);');
  sh.fragmentShader='varying float vLv;varying float vPh;uniform float uT;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance*=vLv*'+gain.toFixed(3)
   +(flicker?'*(1.-'+flicker.toFixed(3)+'*step(.93,fract(sin(floor(uT*14.+vPh*57.)*12.9898)*43758.5)))':'')+(chase?'*(.35+.65*step(.42,fract(uT*1.35-vPh*6.)))':'')+';');};
 m.customProgramCacheKey=()=>'town-lv-'+gain+':'+flicker+':'+chase+(params.map?'m':'')+(params.emissiveMap?'e':'');return m;}
function poolMaterial(){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uLv:levelU},polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,
 vertexShader:'attribute float lvl;attribute vec3 tint;uniform float uLv['+LV.n+'];varying float vA;varying vec2 vUv;varying vec3 vT;void main(){vA=uLv[int(floor(lvl+.001))];vUv=uv;vT=tint;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying float vA;varying vec2 vUv;varying vec3 vT;void main(){float r=length(vUv-.5)*2.;float a=pow(max(0.,1.-r),1.6)*vA;gl_FragColor=vec4(vT*a,a);}'});}
// A television screen: off (dark glass), static, or a picture (a canvas or a render target), with scanlines.
function crtMaterial(){return new THREE.ShaderMaterial({uniforms:{uTex:{value:null},uOn:{value:0},uStatic:{value:0},uT:timeU,uRoll:{value:0},uBright:{value:1},uHas:{value:0},uTint:{value:new THREE.Color(1,1,1)}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec2 vUv;uniform sampler2D uTex;uniform float uOn,uStatic,uT,uRoll,uBright,uHas;uniform vec3 uTint;
 float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec2 c=vUv-.5;float r2=dot(c,c);vec2 uv=.5+c*(1.+.09*r2);float edge=smoothstep(.0,.03,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
  vec3 off=vec3(.05,.065,.06)+vec3(.08)*smoothstep(.5,0.,length(c-vec2(-.18,.2)));
  vec2 st=uv;st.y=fract(st.y+uRoll);vec3 pic=uHas>.5?texture2D(uTex,st).rgb*uTint:vec3(.0);pic=1.-exp(-pic*1.7);pic=pow(pic,vec3(.4545));// (the picture is rendered linear and untoned: tone it and encode it here)
  float n=h(floor(uv*vec2(180.,140.))+floor(uT*24.));vec3 snow=vec3(n*.9);
  vec3 col=mix(pic,snow,uStatic);float scan=.82+.18*sin(uv.y*560.);col*=scan*uBright;col*=1.-.35*r2*2.;
  col+=vec3(.9)*smoothstep(.985,1.,fract(uv.y*.5-uT*.11+uRoll))*.05*uOn;
  gl_FragColor=vec4(mix(off,col,uOn)*edge+off*(1.-edge),1.);}`});}

// ---- canvases: signs, posters, covers, shop interiors ------------------------------------------------------------------
function canvas(w,h){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;return {c,g};}catch{return null;}}
function texOf(cv,{repeat=false}={}){if(!cv)return null;const t=new THREE.CanvasTexture(cv.c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
// A shelf-packed atlas: add(w,h,draw) → texture coordinates of what was drawn.
function atlas(W2,H2){const cv=canvas(W2,H2);let x=2,y=2,row=0;const A={cv,tex:null,full:false,
 add(w,h,draw){if(x+w>W2-2){x=2;y+=row+3;row=0;}const r={x,y,w,h};x+=w+3;row=Math.max(row,h);if(y+h>H2-2){A.full=true;return {u0:0,u1:.001,v0:0,v1:.001};}
  if(cv){const g=cv.g;g.save();g.translate(r.x,r.y);g.beginPath();g.rect(0,0,w,h);g.clip();try{draw(g,w,h);}catch{}g.restore();}
  return {u0:(r.x+.5)/W2,u1:(r.x+w-.5)/W2,v0:1-(r.y+h-.5)/H2,v1:1-(r.y+.5)/H2};},
 finish(){A.tex=texOf(cv);return A.tex;}};return A;}
const FAM={serif:'Georgia, "Times New Roman", serif',sans:'"Arial Narrow", Arial, Helvetica, sans-serif',block:'Impact, "Arial Black", "Helvetica Neue", sans-serif',script:'"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive',mono:'"Courier New", Courier, monospace'};
function fit(g,text,size,w,weight,fam){g.font=`${weight} ${size}px ${fam}`;while(g.measureText(text).width>w&&size>6){size*=.93;g.font=`${weight} ${size}px ${fam}`;}return size;}
export function signArt(g,w,h,{text='',sub='',bg='#2a3a4a',fg='#f0e8d0',font='serif',faded=0,border=true,neon=false,sub2=''}){
 if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h);}else g.clearRect(0,0,w,h);
 if(border&&bg){g.strokeStyle=fg;g.globalAlpha=.7;g.lineWidth=Math.max(2,h*.035);g.strokeRect(h*.07,h*.07,w-h*.14,h-h*.14);g.globalAlpha=1;}
 const fam=FAM[font]||FAM.sans;g.textAlign='center';g.textBaseline='middle';if(neon){g.shadowColor=fg;g.shadowBlur=h*.14;}g.fillStyle=fg;
 const lines=(sub?1:0)+(sub2?1:0);fit(g,text,h*(lines?lines>1?.36:.46:.62),w*.88,'bold',fam);g.fillText(text,w/2,h*(lines?lines>1?.3:.38:.52));
 if(sub){fit(g,sub,h*.19,w*.86,'',fam);g.fillText(sub,w/2,h*(lines>1?.62:.75));}if(sub2){fit(g,sub2,h*.15,w*.86,'',fam);g.fillText(sub2,w/2,h*.84);}g.shadowBlur=0;
 if(faded>0){const r=seeded(hashSeed(text.length,w,h,sub.length));for(let k=0;k<Math.round(300*faded);k++){g.fillStyle=`rgba(205,195,175,${.06+r()*.22*faded})`;g.fillRect(r()*w,r()*h,2+r()*w*.06,1+r()*h*.07);}g.fillStyle=`rgba(190,180,160,${.3*faded})`;g.fillRect(0,0,w,h);}}
// Fictional films only: titles for the video store's cases, posters and the Lyric (nothing real, nobody's brand).
export const FILMS=['THE LONG SUMMER','NIGHT SHIFT','HARBOR LIGHTS','GRIDIRON HEART','THE QUIET HOUSE','STARFALL','RIVER KINGS','DEAD AIR','SUMMER OF THE FOX','MIDNIGHT GARAGE','THE LAST DRIVE-IN','IRON CANYON',
 'COLD OPEN','BACKYARD LEGENDS','THE CELLAR','GALAXY PATROL','SECOND CHANCES','HIGHWAY 9','LOST SIGNAL','THE GOOD NEIGHBOR','FAST LANE 3','MOON DOGS','BLACKWATER','THE ORCHARD','SPEED TRAP','ICE CREAM WARS',
 'STORM CHASER','NO VACANCY','DEEP WOODS','BIG LEAGUE','TOWN SECRETS','FLASHPOINT','THE PIER','RENT DAY','ROBO KID 2','THE WISHING WELL','CAMP WILDCAT','SUBURBIA 2000','THE MUMMY’S CURSE','LASER TAG'];
export function coverArt(g,w,h,i){const r=seeded(hashSeed(i,7)),hue=Math.floor(r()*360),dark=r()<.5;g.fillStyle=`hsl(${hue},${30+r()*40}%,${dark?12+r()*12:40+r()*26}%)`;g.fillRect(0,0,w,h);
 const k=i%6;g.fillStyle=`hsla(${(hue+150+r()*60)%360},${50+r()*30}%,${dark?55+r()*15:18+r()*10}%,.9)`;
 if(k===0){g.beginPath();g.arc(w*.5,h*.5,w*.3,0,7);g.fill();}else if(k===1)g.fillRect(0,h*.55,w,h*.2);else if(k===2){g.beginPath();g.moveTo(0,h);g.lineTo(w*.5,h*.32);g.lineTo(w,h);g.fill();}
 else if(k===3){for(let s=0;s<4;s++)g.fillRect(w*(.1+s*.21),h*(.32+r()*.25),w*.12,h*.5);}else if(k===4){g.beginPath();g.ellipse(w*.5,h*.62,w*.18,h*.26,0,0,7);g.fill();g.fillRect(w*.32,h*.2,w*.36,h*.16);}else{for(let s=0;s<9;s++){g.beginPath();g.arc(r()*w,h*.3+r()*h*.6,2+r()*w*.08,0,7);g.fill();}}
 g.fillStyle=dark?'#f4ecd8':'#141414';const t=FILMS[i%FILMS.length],words=t.split(' '),lines=[];let line='';for(const wd of words){if((line+' '+wd).trim().length>10&&line){lines.push(line.trim());line=wd;}else line+=' '+wd;}lines.push(line.trim());
 g.textAlign='center';g.textBaseline='top';const fs=Math.round(h*.085);g.font=`bold ${fs}px ${FAM.block}`;let y=h*.05;for(const L of lines){fit(g,L,fs,w*.9,'bold',FAM.block);g.fillText(L,w/2,y);y+=fs*1.05;}
 g.fillStyle=dark?'rgba(255,255,255,.45)':'rgba(0,0,0,.4)';g.fillRect(w*.1,h*.91,w*.8,h*.025);}
// What is behind a shop window you cannot walk into (a shallow room: its back wall is painted).
function roomArt(g,w,h,kind){const r=seeded(hashSeed(kind.length*13,w));
 const bg={hardware:'#c3ad86',drug:'#e2ddd0',variety:'#d8cbb0',acetv:'#8f8a80',barber:'#d6d0c2',florist:'#e2e8d6',tap:'#3e2a1e',bridal:'#ece2e0',office:'#cdc5b4',pizza:'#cfae84',gas:'#e6e6dc',hall:'#b5a68e',vacant:'#8e8676',carwash:'#2c3036',bank:'#d8d0bc',dentist:'#dcdcd4',shoe:'#7a6a5a',diner:'#e6dccb'}[kind]||'#c8c0b0';
 g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,h*.8,w,h*.2);g.fillStyle='rgba(255,250,235,.18)';g.fillRect(0,0,w,h*.1);
 const goods=(cols,rows=3)=>{for(let k=0;k<rows;k++){const y=h*(.28+k*.19);g.fillStyle='rgba(70,58,44,.55)';g.fillRect(6,y,w-12,4);for(let x=10;x<w-14;){const bw=5+r()*14,bh=10+r()*h*.1;g.fillStyle=cols[Math.floor(r()*cols.length)];g.fillRect(x,y-bh,bw,bh);x+=bw+1+r()*4;}}};
 if(['hardware','drug','variety','gas','florist','shoe'].includes(kind))goods(kind==='florist'?['#c84a5a','#e8b040','#5a8a3a','#f0f0e8','#a04a8a','#e87a4a']:kind==='hardware'?['#a83a2a','#2a5a8a','#c8a030','#3a6a3a','#e8e4d8','#6a4a2a','#8a8a8a']:['#c84a3a','#2a5a9a','#e8c850','#4a8a5a','#f0ece0','#9a6a3a']);
 if(kind==='acetv'){for(let k=0;k<6;k++){const x=8+k*(w-16)/6;g.fillStyle='#262628';g.fillRect(x,h*.3,(w-16)/6-8,h*.24);g.fillStyle='#3e4c4c';g.fillRect(x+5,h*.33,(w-16)/6-18,h*.17);}g.fillStyle='#6a4a2a';for(let k=0;k<5;k++)g.fillRect(16+k*w/5,h*.6,8,h*.2);}
 if(kind==='barber'){for(let k=0;k<3;k++){g.fillStyle='#9a2a2a';g.fillRect(24+k*w/3,h*.5,w/6,h*.28);g.fillStyle='#b4c4cc';g.fillRect(16+k*w/3,h*.12,w/4,h*.3);}}
 if(kind==='tap'){g.fillStyle='#22160e';g.fillRect(0,h*.55,w,h*.3);for(let k=0;k<16;k++){g.fillStyle=['#7a5a2a','#3a5a3a','#8a2a1a','#c8a040'][k%4];g.fillRect(10+k*(w-20)/16,h*.24,7,h*.14);}}
 if(kind==='bridal'){for(let k=0;k<4;k++){g.fillStyle='#faf6f2';g.beginPath();g.moveTo(w*(.14+k*.24),h*.18);g.lineTo(w*(.06+k*.24),h*.84);g.lineTo(w*(.22+k*.24),h*.84);g.fill();}}
 if(kind==='office'||kind==='hall'||kind==='dentist'||kind==='bank'){for(let y=0;y<h*.8;y+=7){g.fillStyle='rgba(244,240,228,.6)';g.fillRect(0,y,w,3.5);}}
 if(kind==='pizza'){g.fillStyle='#8a2a24';g.fillRect(0,h*.58,w,h*.24);g.fillStyle='#2a2a2a';g.fillRect(w*.6,h*.2,w*.3,h*.28);g.fillStyle='#f0e0b0';g.font=`bold ${h*.09}px ${FAM.sans}`;g.fillText('SLICE $1.75',w*.1,h*.34);}
 if(kind==='vacant'){g.fillStyle='#a69676';g.fillRect(0,0,w,h);for(let k=0;k<50;k++){g.fillStyle=`rgba(110,90,60,${.08+r()*.2})`;g.fillRect(r()*w,r()*h,20+r()*70,2+r()*8);}}
 if(kind==='carwash'){g.fillStyle='#1a1c20';g.fillRect(0,0,w,h);for(let k=0;k<4;k++){g.fillStyle='#2a5a9a';g.fillRect(16+k*w/4,h*.08,10,h*.8);}}
 if(kind==='diner'){g.fillStyle='#b8302a';g.fillRect(0,h*.62,w,h*.06);g.fillStyle='#f4ecd8';g.fillRect(w*.08,h*.12,w*.36,h*.22);g.fillStyle='#2a2a2a';g.font=`bold ${h*.05}px ${FAM.sans}`;for(let k=0;k<5;k++)g.fillText(['EGGS ANY STYLE 3.25','BURGER & FRIES 5.95','BLT 4.50','PIE OF THE DAY 2.75','COFFEE .99'][k],w*.1,h*(.16+k*.04));}}
// Old Main Street, the poster from the 1950s in the library and the flyers (the same flyer as on the poles at home).
export function flyerArt(g,w,h){g.fillStyle='#f4f1e8';g.fillRect(0,0,w,h);g.fillStyle='#161616';g.textAlign='center';g.font=`bold ${h*.155}px Arial`;g.fillText('MISSING',w/2,h*.18);
 g.save();g.beginPath();g.rect(w*.26,h*.24,w*.48,h*.42);g.clip();g.fillStyle='#a7b6ad';g.fillRect(0,0,w,h);g.fillStyle='#d4b25a';g.beginPath();g.ellipse(w*.5,h*.65,w*.17,h*.14,0,0,7);g.fill();g.fillStyle='#e1b38a';g.beginPath();g.ellipse(w*.5,h*.4,w*.11,h*.1,0,0,7);g.fill();g.fillStyle='#7a5230';g.beginPath();g.ellipse(w*.5,h*.32,w*.11,h*.05,-.1,0,7);g.fill();g.restore();
 g.fillStyle='#202020';g.font=`bold ${h*.09}px Arial`;g.fillText('ALEX, 12',w/2,h*.76);g.font=`${h*.046}px Arial`;g.fillText('Last seen Sun. Aug 21, about 8 PM',w/2,h*.84,w*.92);g.fillText('Oak Hollow Dr & Briarwood Ln',w/2,h*.9,w*.92);g.fillText('Green bicycle. Please call.',w/2,h*.96,w*.92);}

// ---- the builder ----------------------------------------------------------------------------------------------------------
export function buildTown(W){
 const K=createKit(),veg=W.veg,R=seeded(4711);
 const surf=(c,kind,rough)=>{const m=K.mat(c,{roughness:rough,metalness:0});if(!m.userData.surface)W.surfaceMaterial(m,kind);return m;};
 const brick=c=>surf(c,'brick',.931),stone=c=>surf(c,'concrete',.952),concrete=c=>surf(c,'concrete',.971),asphalt=c=>surf(c,'asphalt',.991),earth=c=>surf(c,'earth',.981),roofM=c=>surf(c,'roof',.851),
  plaster=c=>surf(c,'plaster',.941),carpet=c=>surf(c,'carpet',.989),timber=c=>surf(c,'timber',.861),siding=c=>surf(c,'siding',.912);
 const metal=c=>K.mat(c,{roughness:.42,metalness:.6}),paint=c=>K.mat(c,{roughness:.62}),dull=c=>K.mat(c,{roughness:.9});
 const grassM=K.mat(0x7a8552,{roughness:.996});W.grassMats.push(grassM);
 const glassClear=new THREE.MeshStandardMaterial({color:0x8fa4ac,roughness:.06,metalness:.3,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});glassClear.userData.keep=true;
 const glassDark=new THREE.MeshStandardMaterial({color:0x252c30,roughness:.14,metalness:.5});
 const upper=i=>W.windowMats[i%W.windowMats.length];// apartments and offices over the shops: lit in the evening with the rest of the township's windows
 const frameRoot=g=>{g.position.set(T0.x,0,T0.z);g.rotation.y=Math.PI;return g;};
 const out=frameRoot(new THREE.Group()),inn=frameRoot(new THREE.Group()),far=frameRoot(new THREE.Group()),live=frameRoot(new THREE.Group());live.name='town-live';W.scene.add(live);for(const r of [out,inn,far,live])r.updateMatrixWorld(true);
 // Triangles (flat list), each turned to face up/out: roofs are authored as lists of corners.
 const upTris=(v,c)=>{const a=v.slice();for(let i=0;i<a.length;i+=9){const ax=a[i+3]-a[i],ay=a[i+4]-a[i+1],az=a[i+5]-a[i+2],bx=a[i+6]-a[i],by=a[i+7]-a[i+1],bz=a[i+8]-a[i+2],ny=az*bx-ax*bz;void ay;void by;if(ny<0)for(let j=0;j<3;j++)[a[i+3+j],a[i+6+j]]=[a[i+6+j],a[i+3+j]];}return a;};
 const world=new THREE.Group();// Old Mill Road's pieces are authored in world coordinates
 W.layers.push({mode:'rigid',group:out,zone:'town'},{mode:'rigid',group:inn,zone:'town-int'},{mode:'rigid',group:far,zone:'town',far:true},{mode:'rigid',group:world,zone:'town'});
 const at=(parent,u,y,v,rot=0)=>{const g=new THREE.Group();g.position.set(u,y,v);g.rotation.y=rot;parent.add(g);return g;};
 const B=(g,x,y,z,w,h,d,m)=>K.box(g,x,y,z,w,h,d,m);
 const signs=atlas(2048,2048),covers=atlas(1024,1024),rooms=atlas(2048,1024);
 const signMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7}),coverMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55}),roomMat=lvMat({color:0xffffff,roughness:.9,emissive:0xffffff,emissiveIntensity:.55});
 const litSignMat=lvMat({color:0xffffff,roughness:.5,emissive:0xffffff,emissiveIntensity:1.25},{flicker:.1});
 // Textured quads (atlas rectangles), in one mesh per material at the end.
 const quads={sign:[],cover:[],lit:[],room:[]};
 function quadInto(list,parent,uv,w,h,{x=0,y=0,z=0,ry=0,rx=0,lvl=0,flip=false}={}){parent.updateMatrixWorld(true);const m=new THREE.Matrix4().makeTranslation(x,y,z).multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx,ry,0,'YXZ')));
  list.push({parent,m,w,h,uv,lvl,flip});}
 const sign=(parent,spec,w,h,o={})=>{const px=Math.max(64,Math.min(1024,Math.round(w*120))),py=Math.max(24,Math.round(px*h/w));const uv=signs.add(px,py,(g,a,b)=>signArt(g,a,b,spec));quadInto(o.lit?quads.lit:quads.sign,parent,uv,w,h,o);return uv;};
 const D={lamps:[],pools:[],tvs:{},doors:{},fixtures:[],lights:[],silhouettes:[],posters:[],marquee:null,bladeUV:null,candidates:[]};
 const nextFix=(()=>{let n=0;return ()=>{if(n>31)return 31;return n++;};})();
 // =========================================================== the ground (one surface grid) ===============================
 {const T=SURF,nu=GRID.nu,nv=GRID.nv,c=GRID.cell,done=new Uint8Array(nu*nv),id=(i,j)=>i*nv+j;
  const inside=(u,v,r)=>u>=r[0]&&u<r[1]&&v>=r[2]&&v<r[3];
  const room=(u,v)=>{for(const [k,I] of Object.entries(INTERIORS))if(inside(u,v,[I.floor[0]-.6,I.floor[1]+.6,I.floor[2]-.6,I.floor[3]+.6]))return k;return null;};
  const matFor=(t,u,v)=>{const r=room(u,v);if(t===T.carpet)return r==='video'?carpet(0x2e3352):carpet(0x3c5552);if(t===T.lino)return concrete(0xd6d8d0);
   return {[T.road]:asphalt(0x5f6264),[T.walk]:concrete(0xbdb7a9),[T.lot]:asphalt(0x6b6b67),[T.grass]:grassM,[T.none]:grassM,[T.gravel]:earth(0x8b7f68),[T.paver]:concrete(0xb3a089),[T.tile]:concrete(0xd8d4c8),[T.wood]:timber(0x8a6844),[T.curb]:concrete(0xb3ae9f)}[t];};
  const draws=t=>t!==T.solid&&t!==T.creek&&t!==T.steps;
  const hOf=k=>{const t=GRID.t[k],f=GRID.floor[k];return Number.isNaN(f)?(t===T.road?0:t===T.grass||t===T.none?.12:t===T.lot?.02:t===T.gravel?.04:t===T.paver?.14:.15):f;};
  const geo=new Map(),put=(m,arr)=>{if(!geo.has(m))geo.set(m,{p:[],inn:false});return geo.get(m);};
  const yAt=(u,h)=>mainBase(u)+h;
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const k=id(i,j);if(done[k])continue;const t=GRID.t[k];if(!draws(t)){done[k]=1;continue;}
   const h=hOf(k),u=GRID.u0+i*c,v=GRID.v0+j*c,m=matFor(t,u+c/2,v+c/2),indoor=!!room(u+c/2,v+c/2)&&!Number.isNaN(GRID.floor[k]);
   const same=(a,b)=>{const q=id(a,b);return !done[q]&&GRID.t[q]===t&&hOf(q)===h&&matFor(t,GRID.u0+a*c+c/2,GRID.v0+b*c+c/2)===m;};
   let j2=j;while(j2+1<nv&&same(i,j2+1))j2++;
   const maxI=u<-10?4:400;let i2=i;outer:while(i2+1<nu&&i2+1-i<maxI){for(let b=j;b<=j2;b++)if(!same(i2+1,b))break outer;i2++;}
   for(let a=i;a<=i2;a++)for(let b=j;b<=j2;b++)done[id(a,b)]=1;
   const u0=u,u1=GRID.u0+(i2+1)*c,v0=v,v1=GRID.v0+(j2+1)*c,G=put(m);G.inn=G.inn||indoor;const yA=yAt(u0,h),yB=yAt(u1,h);
   G.p.push(u0,yA,v0,u0,yA,v1,u1,yB,v1,u0,yA,v0,u1,yB,v1,u1,yB,v0);}
  // Curbs and lawn edges: wherever two drawn neighbours stand at different heights, a vertical face toward the lower one.
  const curb=concrete(0xb0aa9c),edges=[];
  const face=(ua,va,ub,vb,yLo,yHi,nx,nz)=>{if(nx<0||nz<0)edges.push(ua,yLo,va,ub,yLo,vb,ub,yHi,vb,ua,yLo,va,ub,yHi,vb,ua,yHi,va);else edges.push(ua,yLo,va,ua,yHi,va,ub,yHi,vb,ua,yLo,va,ub,yHi,vb,ub,yLo,vb);};
  for(let i=0;i<nu-1;i++)for(let j=0;j<nv-1;j++){const k=id(i,j),t=GRID.t[k];if(!draws(t))continue;const h=hOf(k),u=GRID.u0+i*c,v=GRID.v0+j*c;
   for(const [di,dj] of [[1,0],[0,1]]){const q=id(i+di,j+dj),t2=GRID.t[q];if(!draws(t2))continue;const h2=hOf(q);if(Math.abs(h-h2)<.035)continue;
    const lo=Math.min(h,h2),hi=Math.max(h,h2),y0=mainBase(u+c),hiFirst=h>h2;
    if(di)face(u+c,v,u+c,v+c,y0+lo,y0+hi,hiFirst?1:-1,0);else face(u,v+c,u+c,v+c,y0+lo,y0+hi,0,hiFirst?1:-1);}}
  const mk=(arr,m,parent,name)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.computeVertexNormals();const me=new THREE.Mesh(g,m);me.name=name;parent.add(me);return me;};
  for(const [m,G] of geo)mk(G.p,m,G.inn?inn:out,'town-ground');if(edges.length)mk(edges,curb,out,'town-curbs');}
 // =========================================================== Mill Creek ====================================================
 {const g=out,u0=CORE.u0,u1=CORE.u1,top=TY+.12,bed=CREEK.bed,wall=concrete(0x9c978a),bedM=concrete(0x7d786c),Lc=u1-u0;
  B(g,(u0+u1)/2,(top+bed)/2,CREEK.v1+.15,Lc,top-bed,.3,wall);B(g,(u0+u1)/2,(top+bed)/2,CREEK.v0-.15,Lc,top-bed,.3,wall);B(g,(u0+u1)/2,bed-.1,(CREEK.v0+CREEK.v1)/2,Lc,.2,CREEK.v1-CREEK.v0,bedM);
  B(g,(u0+u1)/2,bed+.05,(CREEK.v0+CREEK.v1)/2,Lc,.1,1.2,concrete(0x8a857a));// (a low-flow channel down the middle)
  const water=new THREE.MeshStandardMaterial({color:0x3e4a44,roughness:.12,metalness:.15});W.surfaceMaterial(water,'drainwater');const wm=B(g,(u0+u1)/2,CREEK.water,(CREEK.v0+CREEK.v1)/2,Lc,.02,2.6,water);wm.name='mill-creek-water';
  // stains, a few weeds on the bed, the storm pipe under Second St's end (where it goes in), the Mill St bridge
  for(let u=u0+6;u<u1;u+=11+R()*9)B(g,u,top-.6-R()*.6,CREEK.v1+.005,1+R()*3,.5+R()*1.2,.02,dull(0x6e6a5e));
  {const p=at(g,SPOT.creatureDive.u,bed+.85,CREEK.v1+.02);const ring=new THREE.Mesh(new THREE.TorusGeometry(.86,.14,8,24),concrete(0x8e8a80));p.add(ring);const hole=new THREE.Mesh(new THREE.CircleGeometry(.84,24),dull(0x050505));hole.position.z=-.01;hole.rotation.y=Math.PI;p.add(hole);p.rotation.y=Math.PI;}
  const deck=concrete(0xa49e90);B(g,0,TY-.35,(CREEK.v0+CREEK.v1)/2,10.4,.7,CREEK.v1-CREEK.v0+.4,deck);
  for(const s of [-1,1])for(let v=CREEK.v0;v<=CREEK.v1+.01;v+=1.5)B(g,s*5.1,TY+.5,v,.08,1,.08,metal(0x8a8e8c));for(const s of [-1,1])B(g,s*5.1,TY+1.02,(CREEK.v0+CREEK.v1)/2,.07,.07,CREEK.v1-CREEK.v0,metal(0x8a8e8c));
  // railings along both banks (galvanized pipe, posts every 2 m), broken at Mill St
  const rail=metal(0x8d918e);for(const v of [CREEK.v1+.02,CREEK.v0-.02])for(const [a,b] of [[u0,-5.2],[5.2,u1]]){B(g,(a+b)/2,TY+1.12,v,b-a,.06,.06,rail);B(g,(a+b)/2,TY+.62,v,b-a,.05,.05,rail);for(let u=a+.2;u<b;u+=2)B(g,u,TY+.6,v,.07,1.1,.07,rail);}}
 // =========================================================== paint on the streets ==========================================
 {const white=K.mat(0xe6e2d6,{roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),yellow=K.mat(0xd8b23a,{roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const strip=(u0,u1,v0,v1,m)=>{const y=mainBase((u0+u1)/2)+.006;B(out,(u0+u1)/2,y,(v0+v1)/2,Math.abs(u1-u0),.01,Math.abs(v1-v0),m);};
  const gaps=CROSS.map(c=>[c.u-c.walk-1,c.u+c.walk+1]),open=u=>!gaps.some(([a,b])=>u>a&&u<b);
  for(let u=-50;u<266;u+=1)if(open(u)&&open(u+1))for(const s of [-1,1])strip(u,u+1,s*.1-.05,s*.1+.05,yellow);
  for(let u=8;u<262;u+=6.6)if(open(u)&&open(u+5.5))for(const s of [-1,1])strip(u,u+.12,s*3.5,s*7,white);// parking stalls
  for(const c of CROSS){for(const s of [-1,1]){const u0=c.u+s*(c.walk+.6),u1=c.u+s*(c.walk+3.4);for(let v=-6.4;v<=6.4;v+=1.1)strip(Math.min(u0,u1),Math.max(u0,u1),v-.25,v+.25,white);
    const v0=s*(MAIN.walk+.6),v1=s*(MAIN.walk+3.4);for(let u=c.u-4.4;u<=c.u+4.4;u+=1.1)strip(u-.25,u+.25,Math.min(v0,v1),Math.max(v0,v1),white);strip(c.u-c.half+.3,c.u-.2,s*(MAIN.walk+3.8),s*(MAIN.walk+4.2),white);}}
  for(const [u0,u1,v0,v1] of [[10,80,-56,-41],[113,147,-56,-41],[10,80,41,64],[190,260,42,64]])for(let u=u0;u<u1;u+=2.8){strip(u,u+.1,v0,v0+5,white);strip(u,u+.1,v1-5,v1,white);}}
 // =========================================================== Old Mill Road ================================================
 {const st=2,N=Math.ceil(CONN.len/st),road=asphalt(0x5e6164),curbM=concrete(0xb3ad9f),walkM=concrete(0xbcb6a8),under=K.mat(0x7a8552,{roughness:.997,polygonOffset:true,polygonOffsetFactor:3,polygonOffsetUnits:3});
  const P=(s,t,y)=>{const q=connAt(s,t);return [q.x,y,q.z];};
  const band=(m,ts,yf,s0=0,s1=CONN.len,name='old-mill-road')=>{const pos=[];for(let i=Math.floor(s0/st);i<Math.ceil(s1/st);i++){const sa=Math.max(s0,i*st),sb=Math.min(s1,(i+1)*st);
    for(let k=0;k<ts.length-1;k++){const ta=ts[k],tb=ts[k+1],a=P(sa,ta,yf(sa,ta)),b=P(sa,tb,yf(sa,tb)),c2=P(sb,tb,yf(sb,tb)),d=P(sb,ta,yf(sb,ta));pos.push(...a,...b,...c2,...a,...c2,...d);}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();const me=new THREE.Mesh(g,m);me.name=name;world.add(me);return me;};
  const h=CONN.half,cx=[-h,-h*.6,-h*.25,0,h*.25,h*.6,h];band(road,cx,(s,t)=>connY(s,t));
  for(const e of [-1,1]){band(curbM,e<0?[-CONN_X.curb,-h]:[h,CONN_X.curb],(s,t)=>connBase(s)+.15);// (top; the face below)
   {const pos=[];for(let i=0;i<N;i++){const sa=i*st,sb=Math.min(CONN.len,(i+1)*st),a=P(sa,e*h,connBase(sa)),b=P(sb,e*h,connBase(sb)),c2=P(sb,e*h,connBase(sb)+.15),d=P(sa,e*h,connBase(sa)+.15);if(e<0)pos.push(...a,...b,...c2,...a,...c2,...d);else pos.push(...a,...c2,...b,...a,...d,...c2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();world.add(new THREE.Mesh(g,curbM));}
   const sa=e<0?[-CONN_X.strip,-CONN_X.curb]:[CONN_X.curb,CONN_X.strip];band(grassM,sa,(s,t)=>connY(s,t),0,CONN.len-30);band(walkM,sa,(s,t)=>connBase(s)+.15,CONN.len-30,CONN.len);
   band(walkM,e<0?[-CONN_X.walk,-CONN_X.strip]:[CONN_X.strip,CONN_X.walk],(s,t)=>connBase(s)+.15);
   // the lawns, out to where the land takes over (laid just under it, so the two can overlap)
   const lt=e<0?[-46,-38,-30,-24,-19,-14,-10,-CONN_X.walk]:[CONN_X.walk,10,14,19,24,30,38,46];band(under,lt,(s,t)=>Math.abs(t)<=24?connY(s,t)-.015:landY(...[connAt(s,t)].map(q=>[q.x,q.z])[0])-.03,CONN.straight,CONN.len,'old-mill-lawn');}
  // center line and edge lines
  {const y=K.mat(0xd2ae3c,{roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),wl=K.mat(0xe2ded2,{roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   for(const off of [-.12,.12])band(y,[off-.05,off+.05],(s,t)=>connY(s,t)+.006,4,CONN.len-2,'center-line');for(const e of [-1,1])band(wl,[e*(h-.45),e*(h-.33)],(s,t)=>connY(s,t)+.006,4,CONN.len-2,'edge-line');}
  // the older houses (1920s–50s), their walks and drives, picket fences, mailboxes; street trees and the pole line
  const houseAt=(H)=>{const q=connAt(H.s,H.side*(H.set+H.d/2)),y=connY(H.s,H.side*H.set)+.1,g=new THREE.Group();g.position.set(q.x,y,q.z);g.rotation.y=-q.a+(H.side>0?Math.PI:0);world.add(g);return {g,y};};
  for(const H of CONN_HOUSES){const {g}=houseAt(H),wall=H.kind==='foursquare'?siding(H.c):H.kind==='cape'?siding(H.c):siding(H.c),trim=paint(0xece6d8),rf=roofM(H.roof),w=H.w,d=H.d,two=H.kind==='foursquare',hh=two?5.8:H.kind==='cape'?3:3.1;
   // (local: x across the house, z toward the street = +z, depth -z)
   B(g,0,-.25,0,w+.2,.6,d+.2,stone(0x9a948a));B(g,0,hh/2+.05,0,w,hh,d,wall);
   if(two){const pts=[[-w/2-.4,hh,d/2+.4],[w/2+.4,hh,d/2+.4],[w/2+.4,hh,-d/2-.4],[-w/2-.4,hh,-d/2-.4]],apex=[0,hh+2.4,0];const v=[];for(let k=0;k<4;k++){const a=pts[k],b=pts[(k+1)%4];v.push(...a,...apex,...b);}K.tri(g,upTris(v),rf);}
   else{const rise=H.kind==='cape'?3.4:2.2,ov=.5,v=[];for(const s of [-1,1]){v.push(-w/2-ov,hh,s*(d/2+ov),0,hh+rise,s*(d/2+ov)*0,w/2+ov,hh,s*(d/2+ov));}
    const r2=[];for(const s of [-1,1])r2.push(-w/2-ov,hh,s*(d/2+ov),-w/2-ov,hh+rise,0,w/2+ov,hh+rise,0,-w/2-ov,hh,s*(d/2+ov),w/2+ov,hh+rise,0,w/2+ov,hh,s*(d/2+ov));
    for(let i=0;i<r2.length;i+=9){const ax=r2[i+3]-r2[i],az=r2[i+5]-r2[i+2],bx=r2[i+6]-r2[i],bz=r2[i+8]-r2[i+2],ay=r2[i+4]-r2[i+1],by=r2[i+7]-r2[i+1];const ny=az*bx-ax*bz;if(ny<0)for(let j=0;j<3;j++)[r2[i+3+j],r2[i+6+j]]=[r2[i+6+j],r2[i+3+j]];void ay;void by;}
    K.tri(g,r2,rf);for(const s of [-1,1])K.tri(g,s<0?[-w/2,hh,d/2,-w/2,hh+rise*.98,0,-w/2,hh,-d/2]:[w/2,hh,-d/2,w/2,hh+rise*.98,0,w/2,hh,d/2],wall);
    if(H.kind==='cape')for(const x of [-w*.25,w*.25]){B(g,x,hh+1.1,d/2-.6,1.4,1.3,1.6,wall);B(g,x,hh+1.15,d/2+.21,.8,.9,.04,glassDark);}}
   for(const fl of two?[1.1,3.9]:[1.1])for(const x of [-w*.32,0,w*.32]){if(fl===1.1&&x===0)continue;B(g,x,fl+.75,d/2+.02,1,1.45,.04,upper(Math.floor(R()*8)));B(g,x,fl+.75,d/2+.04,1.16,1.6,.02,trim);B(g,x-.72,fl+.75,d/2+.03,.3,1.5,.03,paint(0x3a4a3a));B(g,x+.72,fl+.75,d/2+.03,.3,1.5,.03,paint(0x3a4a3a));}
   B(g,0,1.15,d/2+.03,1,2.1,.05,paint([0x7a2f2a,0x2f3d55,0x3d4d3a,0xe8e2d6][Math.floor(R()*4)]));
   if(H.porch){B(g,0,.25,d/2+1.3,w*.72,.4,2.6,timber(0x8a7a64));for(const x of [-w*.34,-w*.12,w*.12,w*.34])B(g,x,1.5,d/2+2.45,.18,2.5,.18,trim);B(g,0,2.8,d/2+1.4,w*.76,.16,2.9,trim);B(g,0,2.95,d/2+1.4,w*.78,.12,3,rf);
    for(const s of [-1,1])B(g,s*w*.23,.75,d/2+2.45,w*.2,.08,.06,trim);B(g,0,.08,d/2+2.9,1.4,.16,.5,stone(0xb0a898));}
   B(g,w*.3,hh+2.1,-d*.15,.6,1.6,.6,brick(0x8a5a48));
   // front walk to the sidewalk, a mailbox, a picket fence on some, a driveway beside
   const yard=new THREE.Group();g.add(yard);const walkLen=H.set-CONN_X.walk-.4;B(g,0,.02,d/2+(H.porch?2.6:0)+walkLen/2,1.1,.06,walkLen,concrete(0xb8b2a4));
   if(R()<.55){for(let x=-w/2-2;x<=w/2+2;x+=.12)if(Math.abs(x)>.7)B(g,x,.45,d/2+walkLen+(H.porch?2.4:0)-.4,.06,.9,.03,paint(0xeee8dc));}
   B(g,w/2+2.6,.03,d/2+walkLen/2+1,2.8,.05,walkLen+6,concrete(0xaaa496));void yard;}
  for(let k=0;;k++){const s=18+k*16;if(s>CONN.len-28)break;for(const e of [-1,1]){const q=connAt(s,e*CONN_X.tree),g=new THREE.Group();g.position.set(q.x,connY(s,e*CONN_X.tree),q.z);world.add(g);veg.build(g,seeded(hashSeed(9,s,e)),{size:1.05+.25*seeded(hashSeed(8,s,e))(),kind:'maple',lod:'full'});}}
  const polesAt=[];for(let k=0;k<4;k++){const s=26+k*40;if(s>CONN.len-10)break;const q=connAt(s,CONN_X.tree),y=connY(s,CONN_X.tree),g=new THREE.Group();g.position.set(q.x,y,q.z);g.rotation.y=-q.a;world.add(g);
   K.cyl(g,0,4.5,0,.14,9.2,dull(0x786551),7);B(g,0,8.6,0,1.9,.12,.12,dull(0x6a5a48));K.rod(g,[0,7.5,0],[-2.1,7.9,0],.05,metal(0x8a8e8c));polesAt.push(new THREE.Vector3(q.x,y+8.7,q.z));}
  for(let i=0;i<polesAt.length-1;i++){const a=polesAt[i],b=polesAt[i+1],pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-2.6*t*(1-t),a.z+(b.z-a.z)*t));}world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x3d3632})));}
  D.connPoles=polesAt;}
 // =========================================================== the land around it all ======================================
 {const step=5,pts=REGION.map(([x,z])=>TL(x,z)),u0=Math.floor(Math.min(...pts.map(p=>p.u))/step)*step,u1=Math.ceil(Math.max(...pts.map(p=>p.u))/step)*step,v0=Math.floor(Math.min(...pts.map(p=>p.v))/step)*step,v1=Math.ceil(Math.max(...pts.map(p=>p.v))/step)*step;
  const nu=(u1-u0)/step+1,nv=(v1-v0)/step+1,H=new Float32Array(nu*nv),pos=[],idx=[],vid=new Int32Array(nu*nv).fill(-1);
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const p=TW(u0+i*step,v0+j*step);H[i*nv+j]=landY(p.x,p.z);}
  const vtx=(i,j)=>{const k=i*nv+j;if(vid[k]<0){vid[k]=pos.length/3;pos.push(u0+i*step,H[k],v0+j*step);}return vid[k];};
  const nearRoad=(u,v)=>{const p=TW(u,v),q=connProject(p.x,p.z);return !!q&&q.s>-2&&q.s<CONN.len+2&&Math.abs(q.t)<CONN_X.walk+.6;};
  const summer=(u,v)=>{const p=TW(u,v),q=SUMMERFIELD.project(p.x,p.z,CONN.u0);return q.u<CONN.u0+24.5&&q.u>CONN.u0-60&&Math.abs(q.v)<44.5||q.u<CONN.u0+8;};
  for(let i=0;i<nu-1;i++)for(let j=0;j<nv-1;j++){const ua=u0+i*step,va=v0+j*step,cu=ua+step/2,cv=va+step/2,c=TW(cu,cv);if(!inRegion(c.x,c.z,4))continue;
   if(ua>=CORE.u0-.01&&ua+step<=CORE.u1+.01&&va>=CORE.v0-.01&&va+step<=CORE.v1+.01)continue;
   const corners=[[ua,va],[ua+step,va],[ua,va+step],[ua+step,va+step]];if(corners.some(([a,b])=>nearRoad(a,b)||summer(a,b)))continue;
   const a=vtx(i,j),b=vtx(i+1,j),c2=vtx(i,j+1),d=vtx(i+1,j+1);idx.push(a,b,d,a,d,c2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const land=new THREE.Mesh(g,grassM);land.name='town-land';far.add(land);D.landTris=idx.length/3;}
 // =========================================================== buildings ======================================================
 const WIN={w:1.05,h:1.75};
 // A wall with rectangular openings (x across, y up), as boxes around them. ops: [x0,x1,y0,y1].
 function wallWith(g,x0,x1,y0,y1,z,th,ops,m){const xs=[...new Set([x0,x1,...ops.flatMap(o=>[o[0],o[1]])])].filter(x=>x>=x0&&x<=x1).sort((a,b)=>a-b),ys=[...new Set([y0,y1,...ops.flatMap(o=>[o[2],o[3]])])].filter(y=>y>=y0&&y<=y1).sort((a,b)=>a-b);
  for(let a=0;a<ys.length-1;a++){let run=null;const flush=()=>{if(run){B(g,(run[0]+run[1])/2,(ys[a]+ys[a+1])/2,z,run[1]-run[0],ys[a+1]-ys[a],th,m);run=null;}};
   for(let b=0;b<xs.length-1;b++){const cx=(xs[b]+xs[b+1])/2,cy=(ys[a]+ys[a+1])/2,hole=ops.some(o=>cx>o[0]&&cx<o[1]&&cy>o[2]&&cy<o[3]);if(hole){flush();continue;}if(run&&Math.abs(run[1]-xs[b])<1e-6)run[1]=xs[b+1];else{flush();run=[xs[b],xs[b+1]];}}flush();}}
 // A window in an opening: reveal, sill, lintel, glass (lit upper windows or dark), sash bars.
 function windowIn(g,x,y,w,h,z,{trim,glass,depth=.2,arch=false,sill=true,lintel=true,bars=true}){B(g,x,y-h/2-.05,z+.04,w+.22,.1,.22,trim);if(lintel)B(g,x,y+h/2+.09,z+.03,w+.3,.2,.12,trim);
  const gm=B(g,x,y,z-depth,w,h,.03,glass);if(bars){B(g,x,y+h*.06,z-depth+.03,w,.045,.03,paint(0xe8e2d4));B(g,x,y,z-depth+.03,.04,h,.03,paint(0xe8e2d4));}
  for(const s of [-1,1])B(g,x+s*(w/2+.005),y,z-depth/2,.01,h,depth,dull(0x8a8478));B(g,x,y+h/2,z-depth/2,w,.01,depth,dull(0x8a8478));if(arch)B(g,x,y+h/2+.32,z+.02,w+.1,.44,.08,trim);return gm;}
 const shopKind=b=>b.vacant?'vacant':b.id==='acetv'?'acetv':b.id==='hardware'?'hardware':b.id==='drug'?'drug':b.id==='variety'?'variety':b.id==='barber'?'barber':b.id==='florist'?'florist':b.id==='tap'?'tap':b.id==='bridal'?'bridal':b.id==='oddfellows'?'pizza':b.id==='shoe'?'shoe':b.kind==='office'?'office':b.kind==='hall'?'hall':b.kind==='gas'?'gas':b.kind==='carwash'?'carwash':b.kind==='bank'?'bank':b.id==='dentist'?'dentist':b.kind;
 const roomUV={};const roomFor=k=>roomUV[k]||(roomUV[k]=rooms.add(480,220,(g,w,h)=>roomArt(g,w,h,k)));
 // The shallow lit room behind a shop window: back wall painted, floor, ceiling.
 function shadowBox(g,x0,x1,y0,y1,zFront,depth,kind,lit){const uv=roomFor(kind),lv=lit>=0?LV.shop+lit:LV.shop+31,w=x1-x0,h=y1-y0;
  quadInto(quads.room,g,uv,w,h,{x:(x0+x1)/2,y:(y0+y1)/2,z:zFront-depth,lvl:lv});
  B(g,(x0+x1)/2,y0+.01,zFront-depth/2,w,.02,depth,dull(0x6a6258));B(g,(x0+x1)/2,y1+.01,zFront-depth/2,w,.02,depth,dull(0xd8d0c0));for(const x of [x0,x1])B(g,x,(y0+y1)/2,zFront-depth/2,.03,h,depth,dull(0xc8c0b0));}
 // A storefront: piers, bulkhead, display windows, transom, sign band, cornice, a door (or a dynamic door), awning.
 function storefront(g,b,w,{sf=4.2,doorX=0,doorW=1.15,doorKind='glass',wall,trim,box=true,lit=-1,signOff=false,papered=false,recess=.32}){
  const piers=.42,x0=-w/2+piers,x1=w/2-piers;B(g,-w/2+piers/2,sf/2,-.15,piers,sf,.3,wall);B(g,w/2-piers/2,sf/2,-.15,piers,sf,.3,wall);
  B(g,0,sf-.22,-.13,w,.44,.26,wall);B(g,0,sf+.08,.04,w+.1,.16,.34,trim);// sign band, cornice ledge
  const dx0=doorX-doorW/2-.06,dx1=doorX+doorW/2+.06;
  for(const [a,c] of [[x0,dx0],[dx1,x1]]){if(c-a<.3)continue;const m=(a+c)/2,ww=c-a;B(g,m,.28,-recess+.06,ww,.56,.16,b.stone?stone(0xb4ac98):paint(new THREE.Color(trim).multiplyScalar(.82).getHex()));
   B(g,m,1.78,-recess,ww-.06,2.36,.03,papered?dull(0xb8a684):glassClear);B(g,m,.58,-recess+.02,ww,.06,.08,metal(0x6a6a64));B(g,m,2.98,-recess+.02,ww,.06,.08,metal(0x6a6a64));
   for(let k=1;k<Math.round(ww/2.4);k++)B(g,a+k*ww/Math.round(ww/2.4),1.78,-recess+.01,.06,2.4,.06,metal(0x6a6a64));
   B(g,m,3.3,-recess+.02,ww,.56,.03,b.vacant?dull(0x5a5246):glassDark);if(box)shadowBox(g,a,c,.56,2.98,-recess-.06,2.6,shopKind(b),lit);}
  // door frame and (static) door
  B(g,doorX,2.6,-recess,doorW+.16,.12,.12,metal(0x5a5a54));for(const s of [-1,1])B(g,doorX+s*(doorW/2+.04),1.3,-recess,.08,2.6,.12,metal(0x5a5a54));B(g,doorX,3.3,-recess,doorW+.1,.56,.03,glassDark);
  if(doorKind==='glass'){B(g,doorX,1.3,-recess-.03,doorW,2.46,.04,metal(0x4a4a46));B(g,doorX,1.42,-recess-.055,doorW-.2,1.9,.02,b.vacant?dull(0xb8a684):glassDark);}
  B(g,0,.02,-recess/2,w-piers*2,.04,recess,stone(0x9a948a));// the threshold under the display, set back
  if(b.awning){const aw=w-piers*2,col=paint(b.awning),out2=1.5;const m=new THREE.Mesh(new THREE.PlaneGeometry(aw,out2*1.08),col);m.position.set(0,2.95,out2/2-.2);m.rotation.x=-Math.PI/2+.5;g.add(m);m.material.side=THREE.DoubleSide;
   B(g,0,2.68,out2-.15,aw,.3,.03,col);if(b.stripe)for(let x=-aw/2+.2;x<aw/2;x+=.5){const s2=new THREE.Mesh(new THREE.PlaneGeometry(.22,out2*1.08),paint(b.stripe));s2.position.set(x,2.951,out2/2-.19);s2.rotation.x=-Math.PI/2+.5;s2.material.side=THREE.DoubleSide;g.add(s2);}
   for(const s of [-1,1])B(g,s*aw/2,2.8,out2/2,.03,.3,out2,metal(0x3a3a3a));}
  if(b.sign&&!signOff){const faded=b.faded?.85:0,bg=b.faded?'#6a5a48':b.id==='hardware'?'#1e3a26':b.id==='drug'?'#1d2e48':b.id==='variety'?'#7a2a1e':b.id==='acetv'?'#121417':b.id==='insurance'?'#24221e':b.id==='florist'?'#2e4a32':b.id==='bridal'?'#f4ecec':b.id==='tap'?'#1c1410':b.id==='shoe'?'#3a2a20':b.id==='oddfellows'?'#6a1a16':b.id==='barber'?'#f2ece0':b.id==='courier'?'#1a1a1a':'#2a2a2a';
   const fg=b.faded?'#d8c8a8':b.id==='bridal'||b.id==='barber'?'#5a2a3a':b.id==='acetv'?'#e8c040':'#efe6cc';
   sign(g,{text:b.sign,sub:b.sub||'',bg,fg,font:b.id==='bridal'||b.id==='florist'?'script':b.id==='acetv'?'block':['bank','courier','insurance','oddfellows'].includes(b.id)||b.faded?'serif':'sans',faded,border:!b.faded},w-piers*2-.2,.62,{y:sf-.22,z:.012});}}
 // Door openings a wall needs (from town-plan DOORS), in the wall's own x: line 'back' (z=-d), 'side+' (x=+w/2), 'side-'.
 function doorOps(b,F,uc,line,d){const out2=[];const toX=u=>(u-uc)*(F.s>0?-1:1),toZ=v=>(v-F.front)*(F.s>0?-1:1);
  for(const D2 of Object.values(DOORS)){const du=[D2.u0,D2.u1],dv=[D2.v0,D2.v1];if(du[1]<b.u0-.3||du[0]>b.u1+.3)continue;
   if(line==='back'){const zb=-d,z0=Math.min(toZ(dv[0]),toZ(dv[1])),z1=Math.max(toZ(dv[0]),toZ(dv[1]));if(zb<z0-.6||zb>z1+.6)continue;const x0=Math.min(toX(du[0]),toX(du[1])),x1=Math.max(toX(du[0]),toX(du[1]));out2.push([x0,x1,0,2.3]);}
   else{const xs=line==='side+'?(b.u1-uc)*(F.s>0?-1:1):(b.u0-uc)*(F.s>0?-1:1),x0=Math.min(toX(du[0]),toX(du[1])),x1=Math.max(toX(du[0]),toX(du[1]));if(xs<x0-.6||xs>x1+.6)continue;
    const z0=Math.min(toZ(dv[0]),toZ(dv[1])),z1=Math.max(toZ(dv[0]),toZ(dv[1]));out2.push([z0,z1,0,2.3]);}}return out2;}
 // A wall along a building's side: x' runs along the wall (= z of the building), openings in z.
 function sideWall(g,x,d,h,ops,m){const sg=at(g,x,0,0,-Math.PI/2);wallWith(sg,-d+.3,-.3,0,h,0,.3,ops.map(([z0,z1,y0,y1])=>[z0,z1,y0,y1]),m);return sg;}
 // An ordinary commercial building: storefront below, windows above, cornice and parapet, back wall with a door.
 function commercial(b){const F=footprint(b),w=b.u1-b.u0,uc=(b.u0+b.u1)/2,y0=mainBase(uc)+.15,g=at(out,uc,y0,F.front,F.s>0?Math.PI:0),d=b.d,h=b.h,trim=paint(b.trim);
  const wall=b.brick?brick(b.c):b.stone?stone(b.c):plaster(b.c),corner=CROSS.some(c=>Math.abs(b.u0-(c.u+c.walk))<.6||Math.abs(b.u1-(c.u-c.walk))<.6),room=!!INTERIORS[b.id];
  B(g,0,-.3,-d/2,w,.6,d,stone(0x8a847a));// foundation (the ground falls away in places)
  const sf=b.floors>1?4.3:Math.min(4.2,h-.6),sfOpts={sf,wall,trim,lit:b.lit,doorX:b.id==='video'?(SPOT.videoDoor.u-uc)*(F.s>0?-1:1):b.id==='laundry'?(162.8-uc):(R()-.5)*w*.3,doorKind:room&&b.id==='video'?'none':'glass',box:!room&&b.id!=='diner',papered:b.vacant&&b.id!=='mason'};
  const front=b.kind!=='bank';if(front)storefront(g,b,w,sfOpts);
  // upper floors: openings in the front wall
  const fh=b.floors>1?(h-sf-.9)/(b.floors-1):0,n=Math.max(1,Math.floor((w-1)/2.5)),ops=[],wins=[];
  for(let f=1;f<b.floors;f++){const y=sf+.55+fh*(f-.5)+.1;for(let k=0;k<n;k++){const x=-w/2+w*(k+.5)/n;ops.push([x-WIN.w/2,x+WIN.w/2,y-WIN.h/2,y+WIN.h/2]);wins.push([x,y]);}}
  if(front){if(b.floors>1){wallWith(g,-w/2,w/2,sf+.16,h,-.15,.3,ops,wall);wins.forEach(([x,y],i)=>windowIn(g,x,y,WIN.w,WIN.h,-.02,{trim,glass:b.vacant&&R()<.6?(R()<.5?dull(0x6a5a48):glassDark):upper(hashSeed(i,b.u0)%8),arch:b.brick&&h>12}));}
   else B(g,0,(sf+.16+h)/2,-.15,w,h-sf-.16,.3,wall);}
  // the rest of the body: back wall (doors where the plan has them), side walls, a rear extension, the roof
  const ext=b.ext?{w0:(b.ext.u0-uc)*(F.s>0?-1:1),dd:Math.abs(b.ext.v-F.back)}:null,fullExt=ext&&Math.abs(b.ext.u0-b.u0)<.3;
  if(!(fullExt&&room))wallWith(g,-w/2,w/2,0,h,-d+.15,.3,room?doorOps(b,F,uc,'back',d):[],wall);
  for(const [sx,line] of [[w/2-.15,'side+'],[-w/2+.15,'side-']]){const ops2=room?doorOps(b,F,uc,line,d):[];if(ops2.length)sideWall(g,sx,d,h,ops2,wall);else B(g,sx,h/2,-d/2,.3,h,d-.3,wall);}
  if(ext){const eh=Math.min(3.8,h-.4),x0=fullExt?-w/2:Math.min(ext.w0,w/2),x1=fullExt?w/2:Math.max(ext.w0,w/2),xm=(x0+x1)/2,ew=x1-x0,ze=-d-ext.dd;
   const backOps=room?doorOps(b,F,uc,'back',d+ext.dd):[];wallWith(g,x0,x1,0,eh,ze+.15,.3,backOps,wall);for(const x of [x0+.15,x1-.15])B(g,x,eh/2,-d-ext.dd/2,.3,eh,ext.dd,wall);B(g,xm,eh-.08,-d-ext.dd/2,ew,.16,ext.dd,dull(0x4a4844));
   if(!room)B(g,xm,1.1,ze-.02,1,2.1,.06,metal(0x5a5a52));B(g,xm+ew*.3,eh+.4,-d-ext.dd/2,.9,.8,.9,metal(0x9a9c98));}
  B(g,0,h-.1,-d/2,w-.4,.2,d-.4,dull(0x4a4844));// roof
  // cornice and parapet
  const ph=b.floors>2?1.1:.8;B(g,0,h+ph/2,-.15,w,ph,.3,wall);B(g,0,h+ph+.08,-.05,w+.2,.16,.5,trim);B(g,0,h+.05,.02,w+.1,.14,.3,trim);
  if(b.brick&&b.floors>1)for(let x=-w/2+.6;x<w/2-.3;x+=1.4)B(g,x,h+ph-.1,.12,.18,.22,.22,trim);// brackets
  for(const s2 of [-1,1])B(g,s2*(w/2-.15),h+ph/2,-d/2,.3,ph,d,wall);B(g,0,h+ph/2,-d+.15,w,ph,.3,wall);
  if(b.plaque)sign(g,{text:b.plaque,bg:'#c8bca0',fg:'#4a3a2a',font:'serif',border:false},2.2,.5,{y:h+ph*.5,z:.02});
  // corner buildings: windows down the side street too
  if(corner&&b.floors>1){const side=CROSS.some(c=>Math.abs(b.u0-(c.u+c.walk))<.6)?(F.s>0?1:-1):(F.s>0?-1:1),m=Math.floor((d-2)/3);for(let f=1;f<b.floors;f++)for(let k=0;k<m;k++){const z=-1.5-k*3,y=sf+.55+fh*(f-.5)+.1;const wg=at(g,side*(w/2),0,z,side*Math.PI/2);windowIn(wg,0,y,WIN.w,WIN.h,.02,{trim,glass:upper(k+f)});}}
  // rooftop units, a chimney, the back door, a fire escape on the tall ones
  for(let k=0;k<1+(w>14?1:0);k++)B(g,(R()-.5)*w*.5,h+.55,-d*(.4+R()*.3),1.6,.9,1.2,metal(0x9a9c98));if(R()<.5)B(g,w*.3,h+1.2,-d*.7,.6,2.2,.6,wall);
  if(!room&&!ext)B(g,(R()-.5)*w*.4,1.1,-d-.02,1,2.1,.06,metal(0x5a5a52));
  if(b.floors>2){const fe=metal(0x2a2a2a);for(let f=1;f<b.floors;f++){const y=sf+fh*(f-1)+.35;B(g,0,y,-d-.65,3.2,.06,1.2,fe);B(g,0,y+.9,-d-1.22,3.2,.04,.04,fe);for(const x of [-1.6,1.6])B(g,x,y+.45,-d-1.22,.04,.9,.04,fe);}}
  return g;}
 for(const b of BUILDINGS){if(['church','theater','library','gas','carwash'].includes(b.kind))continue;const g=commercial(b);b.group=g;}
 // ---- the bank: stone, two columns at the door, tall windows, a clock on the corner ----
 {const b=BLD.bank,F=footprint(b),w=b.u1-b.u0,g=b.group,st=stone(0xc4baa2),tr=paint(0xe4dccb);
  wallWith(g,-w/2,w/2,0,b.h,-.15,.3,[[-1.3,1.3,0,3.4],[-w/2+1.2,-w/2+3.2,.9,4.6],[w/2-3.2,w/2-1.2,.9,4.6]],st);
  for(const x of [-w/2+2.2,w/2-2.2])windowIn(g,x,2.75,2,3.7,-.02,{trim:tr,glass:glassDark,arch:true});
  for(const x of [-1.8,1.8]){K.cyl(g,x,2.1,.35,.28,4.2,stone(0xd8d0bc),16);B(g,x,4.25,.35,.75,.12,.75,tr);B(g,x,.06,.35,.75,.12,.75,tr);}B(g,0,4.55,.3,4.6,.5,.9,tr);
  B(g,0,1.5,-.5,2.4,3,.08,timber(0x5a3a24));sign(g,{text:'OAK HOLLOW SAVINGS',sub:'1911',bg:'#d8d0bc',fg:'#3a3228',font:'serif',border:false},6.4,.9,{y:5.3,z:.03});
  B(g,2.6,1.25,.01,.6,.8,.05,metal(0x6a6e70));sign(g,{text:'ATM',bg:'#2a4a7a',fg:'#ffffff',font:'sans',border:false},.5,.16,{x:2.6,y:1.78,z:.04});
  const clk=at(g,w/2-.3,6.4,.6,0);B(clk,0,0,-.3,.12,.12,.6,metal(0x2a2a2a));const face=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.14,24),paint(0x2a2a2a));face.rotation.x=Math.PI/2;clk.add(face);
  sign(clk,{text:'',bg:'#f2ecdc',fg:'#2a2a2a',border:true},.78,.78,{z:.08,lit:true,lvl:LV.neon+NEON.clock});}
 // ---- the diner: long windows, booths and the counter inside, its neon on the roof ----
 {const b=BLD.diner,w=b.u1-b.u0,g=b.group,chrome=metal(0xc4c8ca),red=paint(0xb3302a);
  for(let x=-w/2+.6;x<w/2-.6;x+=.02){}// (the storefront above already gave it windows; the stainless bands)
  B(g,0,.62,.04,w,.08,.06,chrome);B(g,0,3.05,.04,w,.08,.06,chrome);B(g,0,3.6,.03,w,.5,.05,red);
  // inside: booths along the window, the counter and stools, pie case, menu, ceiling lights (in 'inn')
  const ig=at(inn,(b.u0+b.u1)/2,mainBase(60)+.15,11,Math.PI);
  for(let x=-w/2+1.4;x<w/2-1.5;x+=2.1){B(ig,x,.45,-1.1,1.3,.9,.6,red);B(ig,x-.55,.8,-1.1,.2,.8,.7,red);B(ig,x+.55,.8,-1.1,.2,.8,.7,red);B(ig,x,.74,-1.1,.6,.05,.7,paint(0xe8e2d4));}
  B(ig,0,.55,-5.4,w-3,1.1,.7,paint(0xd8d2c4));B(ig,0,1.12,-5.4,w-2.8,.06,.85,paint(0xe6e2da));for(let x=-w/2+2;x<w/2-2;x+=.9)K.cyl(ig,x,.38,-4.5,.17,.76,red,10);
  B(ig,w/2-3,1.4,-5.6,1.4,.6,.5,glassDark);B(ig,0,1.6,-7.2,w-1,3,.1,dull(0xe6dccb));const uv=roomFor('diner');quadInto(quads.room,ig,uv,w-1.2,2.6,{y:1.7,z:-7.1,lvl:LV.shop+b.lit});
  for(let x=-w/2+2;x<w/2-1.5;x+=2.6){const f=new THREE.Mesh(new THREE.BoxGeometry(1.2,.05,.4),dull(0xf2eee6));f.position.set(x,3.45,-2.6);ig.add(f);D.fixtures.push({group:ig,x,y:3.42,z:-2.6,w:1.2,d:.4,lv:LV.shop+b.lit});}
  // the neon over the roof
  const ng=at(g,0,b.h+.9,-.3,0);B(ng,-2.3,0,0,.08,1.4,.08,metal(0x3a3a3a));B(ng,2.3,0,0,.08,1.4,.08,metal(0x3a3a3a));
  sign(ng,{text:'Starlite',sub:'DINER',bg:'',fg:'#ff5a7a',font:'script',neon:true,border:false},5.2,1.5,{y:.75,z:.05,lit:true,lvl:LV.neon+NEON.dinerSign});
  sign(g,{text:'OPEN',bg:'',fg:'#ff3a2a',font:'sans',neon:true,border:false},1,.4,{x:-w/2+2,y:2.2,z:-.3,lit:true,lvl:LV.neon+NEON.dinerOpen});}
 // ---- the video store: posters in its windows, the lantern sign, OPEN ----
 {const b=BLD.video,w=b.u1-b.u0,g=b.group;
  for(let k=0;k<5;k++){const x=-w/2+1.5+k*(w-3)/4;if(Math.abs(x-(SPOT.videoDoor.u-(b.u0+b.u1)/2))<1.4)continue;const i=k*7+3,uv=covers.add(150,222,(gg,a,c)=>coverArt(gg,a,c,i));quadInto(quads.cover,g,uv,.92,1.36,{x,y:1.75,z:-.34,ry:0});quadInto(quads.cover,g,uv,.92,1.36,{x,y:1.75,z:-.36,ry:Math.PI});}
  sign(g,{text:'THE LANTERN VIDEO',sub:'MOVIES · GAMES · NEW RELEASES TUESDAY',bg:'#1c2440',fg:'#f6d488',font:'serif',border:true},w-1.4,.86,{y:4.55,z:.08,lit:true,lvl:LV.neon+NEON.videoSign});
  B(g,0,4.55,.02,w-1.2,1,.12,metal(0x2a2a30));sign(g,{text:'OPEN',bg:'',fg:'#ff4a3a',font:'sans',neon:true,border:false},.9,.36,{x:w/2-2,y:2.4,z:-.29,lit:true,lvl:LV.neon+NEON.videoOpen});
  sign(g,{text:'RENT 2 GET 1 FREE · TUESDAYS',bg:'#f2e44a',fg:'#1a1a1a',font:'block',border:false},2.2,.42,{x:-w/2+2.4,y:.95,z:-.33});}
 // ---- the old bicycle shop: the faded painted sign on the brick above, papered windows, the poster, FOR LEASE ----
 {const b=BLD.mason,w=b.u1-b.u0,g=b.group;
  sign(g,{text:'MASON CYCLE & SPORT',sub:'SCHWINN-STYLE · RALEIGH-STYLE · REPAIRS',bg:'#7a4a34',fg:'#e8d8b8',font:'serif',faded:.92,border:false},w-1.2,1.5,{y:6.1,z:.01});
  sign(g,{text:'FOR LEASE',sub:'COMMERCIAL · 1,850 SQ FT · 555-0143',bg:'#e8e4d8',fg:'#a01a10',font:'block',border:false},1.2,.8,{x:-w/2+2.4,y:1.6,z:-.33});
  D.masonPoster={group:g,x:1.6,y:1.7,z:-.34,w:.96,h:1.3};}
 // ---- the hardware store's goods out front, the drugstore's PHARMACY, ACE TV's window of televisions ----
 {const b=BLD.acetv,w=b.u1-b.u0,g=b.group;const tvs=[];for(const [x,y,s] of [[-2.7,1.2,1.0],[-1.25,1.2,1.0],[.3,1.2,1.1],[-2.0,2.25,.85],[-.55,2.3,.9],[.95,2.25,.85]])tvs.push(tvSet(g,x,y,-.68,s,{ry:0}));D.tvs.acetv=tvs;
  sign(g,{text:'WE BUY GOLD · TVs · VCRs · GUITARS',bg:'#121417',fg:'#e8c040',font:'block',border:false},2.6,.34,{x:w/2-2.8,y:2.7,z:-.33});}
 {const g=BLD.drug.group;sign(g,{text:'PHARMACY',bg:'',fg:'#7ad0ff',font:'sans',neon:true,border:false},2,.5,{x:2.4,y:3.3,z:-.32,lit:true,lvl:LV.neon+NEON.drugNeon});}
 {const g=BLD.hardware.group,w=BLD.hardware.u1-BLD.hardware.u0;for(const x of [-w/2+1.5,-w/2+2.7]){B(g,x,.45,.9,.9,.7,.6,metal(0x2a6a3a));B(g,x,.12,.9,.92,.08,.62,dull(0x2a2a2a));}B(g,w/2-2,.4,.8,1.2,.8,.8,metal(0x8a2a22));}
 {const g=BLD.barber.group;K.cyl(g,2.8,2.3,.22,.1,.9,paint(0xf0ece4),14);for(let k=0;k<5;k++){const r2=B(g,2.8,1.95+k*.18,.22,.21,.05,.21,paint(k%2?0x2a3a8a:0xb8201a));r2.rotation.y=k*.6;}K.cyl(g,2.8,2.82,.22,.12,.14,metal(0xc8c8c8),12);K.cyl(g,2.8,1.78,.22,.12,.14,metal(0xc8c8c8),12);}
 {const g=BLD.tap.group;sign(g,{text:'COLD BEER',bg:'',fg:'#ff8a3a',font:'sans',neon:true,border:false},1.4,.44,{x:1.6,y:2.1,z:-.3,lit:true,lvl:LV.neon+NEON.tapNeon});}
 {const g=BLD.oddfellows.group;sign(g,{text:'PIZZA',bg:'',fg:'#ff5a3a',font:'sans',neon:true,border:false},1.2,.4,{x:-3.4,y:2.3,z:-.3,lit:true,lvl:LV.neon+NEON.pizzaNeon});}
 {const g=BLD.laundry.group,w=BLD.laundry.u1-BLD.laundry.u0;sign(g,{text:'FRONT DOOR LOCKED AFTER 8 PM',sub:'PLEASE USE SIDE ENTRANCE ON DEPOT ST',bg:'#f4f0e4',fg:'#1a1a1a',font:'sans',border:true},.82,.5,{x:(BLD.laundry.u0+BLD.laundry.u1)/2-163.4,y:1.5,z:-.34});void w;}
 // ---- the Lyric ----
 {const b=BLD.lyric,F=footprint(b),w=b.u1-b.u0,uc=(b.u0+b.u1)/2,y0=TY+.15,g=at(out,uc,y0,F.front,0),d=b.d,h=b.h,wall=brick(b.c),tc=paint(0xe6d8b8),terra=stone(0xd8c8a4);b.group=g;
  B(g,0,-.3,-d/2,w,.6,d,stone(0x8a847a));
  // facade: three tall arched windows above the marquee, terracotta bands and a parapet with a name panel
  const ops=[[-7,-4.4,6.6,10.4],[-1.3,1.3,6.6,10.4],[4.4,7,6.6,10.4]];wallWith(g,-w/2,w/2,4.2,h,-.15,.3,ops,wall);for(const [a,c] of ops)windowIn(g,(a+c)/2,8.5,c-a,3.8,-.02,{trim:terra,glass:glassDark,arch:true,bars:false});
  for(const y of [5.9,11.2])B(g,0,y,.03,w,.22,.12,terra);B(g,0,h+.7,-.15,w,1.4,.3,wall);B(g,0,h+1.45,-.05,w+.2,.2,.5,terra);B(g,0,h+1.9,-.15,7,1.1,.28,terra);
  sign(g,{text:'1927',bg:'#d8c8a4',fg:'#6a4a3a',font:'serif',border:false},2,.6,{y:h+1.9,z:.0});
  // under the marquee: piers, four glass doors, poster cases, the box office
  for(const x of [-w/2+.4,w/2-.4,-4.2,4.2])B(g,x,2.1,-.15,x>-5&&x<5?.6:.8,4.2,.3,wall);B(g,0,3.9,-.15,w,.6,.3,wall);
  for(const x of [-2.7,-.9,.9,2.7]){B(g,x,1.2,-1.6,1.6,2.4,.06,metal(0x8a6a3a));B(g,x,1.3,-1.64,1.2,1.9,.02,glassDark);}B(g,0,2.65,-1.6,7.4,.5,.06,metal(0x8a6a3a));
  B(g,0,2,-1.75,7.6,4,.1,wall);for(const s of [-1,1])B(g,s*3.8,2,-.9,.1,4,1.6,wall);B(g,0,.02,-.8,7.6,.04,1.6,stone(0xb8a890));
  {const bo=at(g,0,0,0,0);B(bo,0,1.2,.25,1.5,.14,1.3,metal(0x8a6a3a));B(bo,0,2.1,.25,1.4,1.6,1.2,glassDark);B(bo,0,3.05,.25,1.6,.25,1.4,metal(0x8a6a3a));B(bo,0,.55,.25,1.5,1.1,1.25,terra);}
  for(const x of [-w/2+2.1,-w/2+3.6,w/2-3.6,w/2-2.1]){B(g,x,1.75,.02,1.2,1.9,.12,metal(0x8a6a3a));const i=Math.floor(R()*40),uv=covers.add(150,222,(gg,a,c)=>coverArt(gg,a,c,i+50));quadInto(quads.lit,g,uv,.98,1.48,{x,y:1.75,z:.09,lvl:LV.neon+NEON.marquee});D.posters.push(i);}
  // the auditorium behind, a little taller, flat roof; the side wall on Depot St with its fire escape, exit doors, four windows high up
  B(g,0,(h-1)/2,-d+.15,w,h-1,.3,wall);B(g,w/2-.15,(h-1)/2,-d/2-1,.3,h-1,d-2,wall);B(g,0,h-1.1,-d/2-1,w-.4,.2,d-2.2,dull(0x4a4844));
  const sx=-w/2+.15,sideOps=[-4,-8,-12,-16].map(z=>[z-.6,z+.6,6.9,8.7]);
  {const sg=at(g,sx,0,0,-Math.PI/2);// (local x runs along the side wall: it is the building's z, 0 at Main, -d at the back)
   wallWith(sg,-d,0,0,h-1,0,.3,[...sideOps,[-21,-19.8,0,2.2],[-30.6,-29.4,0,2.2]],wall);
   for(const [a,c] of sideOps){const x=(a+c)/2;windowIn(sg,x,7.8,1.2,1.8,.16,{trim:terra,glass:K.mat(0x1a1612,{roughness:.3}),bars:false});D.silhouettes.push({group:sg,x,y:7.8,z:-.06,w:1.1,h:1.7});}
   for(const x of [-20.4,-30])B(sg,x,1.1,-.05,1.2,2.2,.06,metal(0x4a3a30));sign(sg,{text:'STAGE DOOR',bg:'#2a2a2a',fg:'#d8d0c0',font:'sans',border:false},.9,.22,{x:-20.4,y:2.45,z:.17});
   const fe=metal(0x252525);for(const y of [3.6,6.6,9.4]){B(sg,-10,y,.75,13,.06,1.1,fe);B(sg,-10,y+.95,1.28,13,.04,.04,fe);for(let x=-16.5;x<=-3.5;x+=1.625)B(sg,x,y+.48,1.28,.04,.95,.04,fe);for(const x of [-16.5,-3.5])B(sg,x,y-1.5,1.28,.07,3,.07,fe);}
   for(const [y,x0,x1] of [[3.6,-4.5,-11],[6.6,-15.5,-9]]){const n=10;for(let k=0;k<n;k++)B(sg,x0+(x1-x0)*k/n,y+3*(k/n),.75,.75,.04,.25,fe);}
   B(sg,-4,2.7,1.28,.05,1.8,.05,fe);for(let k=0;k<6;k++)B(sg,-4,2.0+k*.28,1.1,.4,.03,.03,fe);// (the drop ladder, up)
  }
  // the marquee: a deep box over the sidewalk; its letters and bulbs are live
  const mq=at(g,0,4.4,1.9,0);B(mq,0,.6,0,15,1.25,3.6,metal(0x2a2622));B(mq,0,1.35,0,15.4,.25,3.9,paint(0xc8a050));B(mq,0,-.12,0,15.4,.2,3.9,paint(0xc8a050));
  for(const x of [-5.5,5.5])B(mq,x,2.2,-1.6,.08,3.4,.08,metal(0x2a2a2a));
  D.marquee={group:mq,w:15,h:1.25,d:3.6};
  // the blade sign: up the corner, LYRIC down it
  const bl=at(g,-w/2+1.2,0,.4,0);B(bl,0,9.6,.9,.5,7.2,1.6,metal(0x2a2622));B(bl,0,13.35,.9,.6,.3,1.8,paint(0xc8a050));B(bl,0,5.95,.9,.6,.3,1.8,paint(0xc8a050));for(const y of [6.6,12.6])B(bl,0,y,-.1,.12,.12,.4,metal(0x2a2a2a));
  D.blade={group:bl};}
 // ---- the library: brick and stone, a portico, tall arched windows, PUBLIC LIBRARY in the frieze ----
 {const b=BLD.library,F=footprint(b),w=b.u1-b.u0,uc=(b.u0+b.u1)/2,y0=TY+.75,g=at(out,uc,y0,F.front,Math.PI),d=b.d,h=b.h,wall=brick(b.c),tr=stone(0xddd4c0);b.group=g;
  B(g,0,-.45,-d/2,w+.4,.9,d+.4,stone(0xa8a090));
  const winX=[-14,-10.5,-7,7,10.5,14],ops=[...winX.map(x=>[x-1,x+1,.9,4.9]),[-2,2,0,3.1]];wallWith(g,-w/2,w/2,0,h,-.15,.3,ops,wall);winX.forEach((x,i)=>windowIn(g,x,2.9,2,4,-.02,{trim:tr,glass:glassClear,arch:true}));
  for(const s of [-1,1]){const sg=at(g,s*(w/2-.15),0,-d/2,s*Math.PI/2);const sops=[-5,0,5].map(z=>[z-1,z+1,.9,4.9]);wallWith(sg,-d/2+.15,d/2-.15,0,h,0,.3,sops,wall);for(const [a] of sops)windowIn(sg,a+1,2.9,2,4,.14,{trim:tr,glass:glassClear,arch:true});}
  {const bops=[-11,-5,5,11].map(x=>[x-.9,x+.9,1.2,4.4]);const bg=at(g,0,0,-d+.15,Math.PI);wallWith(bg,-w/2,w/2,0,h,0,.3,bops,wall);for(const [a] of bops)windowIn(bg,a+.9,2.8,1.8,3.2,.14,{trim:tr,glass:glassClear,arch:false});}
  for(const x of [-2.6,-.9,.9,2.6]){K.cyl(g,x,2.15,1.3,.26,4.3,stone(0xe2dac8),18);B(g,x,.05,1.3,.7,.1,.7,tr);B(g,x,4.35,1.3,.7,.14,.7,tr);}
  B(g,0,4.7,1.1,6.6,.6,2.6,tr);K.tri(g,[-3.4,5,2.42,0,6.6,2.42,3.4,5,2.42],tr);B(g,0,5,-.1,6.8,.05,2.6,tr);
  B(g,0,h-.3,.05,w+.3,.6,.4,tr);sign(g,{text:'OAK HOLLOW PUBLIC LIBRARY',bg:'#d8cfba',fg:'#4a3e30',font:'serif',border:false},11,.55,{y:h-.32,z:.27});
  B(g,0,h-.1,-d/2,w-.4,.2,d-.4,dull(0x4a4844));{const pts=[[-w/2-.3,h,.3],[w/2+.3,h,.3],[w/2+.3,h,-d-.3],[-w/2-.3,h,-d-.3]],ap=[[-w/2+6,h+2.6,-d/2],[w/2-6,h+2.6,-d/2]];K.tri(g,[...pts[0],...ap[0],...pts[1],...pts[1],...ap[0],...ap[1],...pts[1],...ap[1],...pts[2],...pts[2],...ap[1],...ap[0],...pts[2],...ap[0],...pts[3],...pts[3],...ap[0],...pts[0]],roofM(0x4a4e52));}
  B(g,0,1.4,-.28,3.6,2.8,.06,timber(0x5a3a24));sign(g,{text:'HOURS  MON–SAT 9–8',sub:'SUMMER READING · AUG 1–27',bg:'#f2eee4',fg:'#2a2a2a',font:'sans',border:true},.8,.55,{x:2.4,y:1.4,z:-.25});}
 // ---- the church: stone, a gable roof, the steeple at the front corner, its sign board on the lawn ----
 {const b=BLD.church,F=footprint(b),w=b.u1-b.u0,uc=(b.u0+b.u1)/2,y0=TY+.15,g=at(out,uc,y0,F.front,Math.PI),d=b.d,h=b.h,st=stone(b.c),tr=stone(0xc8c0b0);b.group=g;
  B(g,0,h/2,-d/2,w,h,d,st);const ridge=h+6.5,v=[];for(const s of [-1,1])v.push(-w/2-.4*s*0-.4,h,.4*0,0,ridge,0,0,ridge,-d,-w/2-.4,h,0,0,ridge,-d,-w/2-.4,h,-d);
  K.tri(g,[-w/2-.4,h,.3,0,ridge,.3,0,ridge,-d-.3,-w/2-.4,h,.3,0,ridge,-d-.3,-w/2-.4,h,-d-.3,w/2+.4,h,.3,0,ridge,-d-.3,0,ridge,.3,w/2+.4,h,.3,w/2+.4,h,-d-.3,0,ridge,-d-.3],roofM(0x3e3a3c));void v;
  K.tri(g,[-w/2,h,.02,w/2,h,.02,0,ridge,.02],st);for(let x=-w/2+2.5;x<w/2-1;x+=3.8){const lg=at(g,x,0,0,0);void lg;}
  for(const s of [-1,1])for(let z=-3;z>-d+2;z-=4){const sg=at(g,s*(w/2),0,z,s*Math.PI/2);B(sg,0,4.6,.03,1.2,3.6,.06,lvMat({color:0x2a2a40,roughness:.3,emissive:0x8a5a3a,emissiveIntensity:.3}));B(sg,0,6.6,.05,1.4,.5,.1,tr);}
  B(g,0,2.2,.04,2.6,4.4,.08,timber(0x5a2a1e));B(g,0,5,.06,3,.6,.12,tr);const rose=new THREE.Mesh(new THREE.CircleGeometry(1.4,24),K.mat(0x3a2a40,{roughness:.3}));rose.position.set(0,7.6,.04);g.add(rose);
  const tw=at(g,-w/2+2.6,0,1.2,0);B(tw,0,9,0,4.2,18,4.2,st);B(tw,0,15.5,0,4.5,.4,4.5,tr);for(const s of [-1,1]){B(tw,s*1.2,14,2.12,.9,2.2,.06,dull(0x1a1a1a));}
  {const sp=new THREE.Mesh(new THREE.ConeGeometry(2.6,11,4),roofM(0x3a3638));sp.position.set(0,23.2,0);sp.rotation.y=Math.PI/4;tw.add(sp);K.rod(tw,[0,28.6,0],[0,30.4,0],.05,metal(0x9a8a5a));K.rod(tw,[-.5,29.8,0],[.5,29.8,0],.04,metal(0x9a8a5a));}
  const bd=at(out,uc+6,TY+.12,13.6,Math.PI);B(bd,0,.5,0,.12,1,.12,timber(0x4a3a2a));B(bd,2.6,.5,0,.12,1,.12,timber(0x4a3a2a));B(bd,1.3,1.3,0,2.9,1.3,.18,timber(0x4a3a2a));
  sign(bd,{text:'GRACE UNITED METHODIST',sub:'SUNDAY WORSHIP 9:30 AM',sub2:'ALL ARE WELCOME · VBS AUG 8–12',bg:'#f2eee6',fg:'#2a2a3a',font:'serif',border:true},2.6,1.1,{x:1.3,y:1.3,z:.1});}
 // ---- Main Street East: the gas station, the car wash, the VFW ----
 {const b=BLD.gas,F=footprint(b),uc=(b.u0+b.u1)/2,y0=mainBase(uc)+.02,g=at(out,uc,y0,F.front,Math.PI),w=b.u1-b.u0;b.group=g;
  B(g,0,b.h/2,-b.d/2,w,b.h,b.d,plaster(0xe8e4da));B(g,0,b.h+.2,-.1,w+.2,.5,.3,paint(0xb83a2a));wallWith(g,-w/2,w/2,.6,2.6,.02,.04,[],glassDark);B(g,0,1.6,.04,w-2,2,.04,glassClear);
  sign(g,{text:'HOLLOW FUEL & FOOD',sub:'COLD DRINKS · ICE · LOTTO',bg:'#b83a2a',fg:'#fff4e8',font:'block',border:false},w-1,.6,{y:b.h+.2,z:.07});
  const cg=at(out,(-58.5-45.5)/2,y0,18,0);B(cg,0,4.8,0,15,.6,9.4,paint(0xe8e4dc));B(cg,0,5.1,0,15.2,.4,9.6,paint(0xb83a2a));for(const [x,z] of [[-6.5,-3.8],[6.5,-3.8],[-6.5,3.8],[6.5,3.8]])B(cg,x,2.3,z,.4,4.6,.4,paint(0xd8d4cc));
  for(const x of [-3,3]){const pg=at(cg,x,0,0,0);B(pg,0,.8,0,.8,1.6,.5,paint(0xe8e2d8));B(pg,0,1.4,.26,.6,.4,.02,glassDark);B(pg,0,.1,0,1.1,.2,1.3,concrete(0xb0aa9c));}
  const ps=at(out,-34,y0,12.4,0);B(ps,0,2.5,0,.25,5,.25,metal(0x6a6a6a));B(ps,0,5.4,0,1.8,1.6,.3,paint(0xb83a2a));sign(ps,{text:'REGULAR  3.59⁹',sub:'PLUS 3.71⁹ · DIESEL 3.89⁹',bg:'#141414',fg:'#ffd040',font:'mono',border:false},1.7,.9,{y:5.2,z:.17,lit:true,lvl:LV.neon+NEON.gasPrice});}
 {const b=BLD.carwash,F=footprint(b),uc=(b.u0+b.u1)/2,y0=mainBase(uc)+.02,g=at(out,uc,y0,F.front,0),w=b.u1-b.u0;b.group=g;
  B(g,0,b.h/2,-b.d/2,w,b.h,b.d,plaster(0xd8dce0));for(const x of [-3.6,3.6])B(g,x,1.9,.01,3.6,3.8,.04,dull(0x16181c));B(g,0,b.h+.3,0,w,.6,.2,paint(0x2a6aaa));
  sign(g,{text:'MILL ROAD CAR WASH',sub:'SELF SERVE · VACUUM · OPEN 24 HRS',bg:'#2a6aaa',fg:'#ffffff',font:'block',border:false},w-1,.55,{y:b.h+.3,z:.11});}
 {const b=BLD.vfw,g=b.group;sign(g,{text:'V.F.W. POST 4417',sub:'BINGO THURSDAYS 7 PM',bg:'#1a2a4a',fg:'#ffffff',font:'serif',border:false},4,.62,{y:4.0,z:.06});K.cyl(g,(b.u1-b.u0)/2+1.4,4,.8,.06,8,metal(0xc8c8c8),8);}
 // =========================================================== the rooms you can walk into ===================================
 // A thin wall inside a room (plaster over the brick), with openings: along u at v (alongU) or along v at u.
 const panel=(alongU,at0,a0,a1,y0,y1,ops,m)=>{const g=alongU?at(inn,0,0,at0,0):at(inn,at0,0,0,-Math.PI/2);wallWith(g,a0,a1,y0,y1,0,.03,ops,m);};
 const doorsOn=(I,edge,y)=>{const [u0,u1,v0,v1]=I.floor,out2=[];for(const d of I.doors){if(edge==='v0'&&d[2]<=v0+.01&&d[3]>=v0-.01||edge==='v1'&&d[2]<=v1+.01&&d[3]>=v1-.01)out2.push([d[0],d[1],y,y+2.3]);if(edge==='u0'&&d[0]<=u0+.01&&d[1]>=u0-.01||edge==='u1'&&d[0]<=u1+.01&&d[1]>=u1-.01)out2.push([d[2],d[3],y,y+2.3]);}return out2;};
 const roomShell=(id,{ceil,wallC,ceilC=0xe8e4da,trim=0x5a4a3a,skip=[],ops={}})=>{const I=INTERIORS[id],[u0,u1,v0,v1]=I.floor,y=TY+I.h,m=plaster(wallC);
  const E={v0:[true,v0+.015,u0,u1],v1:[true,v1-.015,u0,u1],u0:[false,u0+.015,v0,v1],u1:[false,u1-.015,v0,v1]};
  for(const [k,[al,c,a,b2]] of Object.entries(E)){if(skip.includes(k))continue;panel(al,c,a,b2,y,y+ceil,[...doorsOn(I,k,y),...(ops[k]||[])],m);if(!(ops[k]||[]).length)B(inn,al?(a+b2)/2:c,y+.06,al?c:(a+b2)/2,al?b2-a:.04,.12,al?.04:b2-a,paint(trim));}
  B(inn,(u0+u1)/2,y+ceil+.01,(v0+v1)/2,u1-u0,.02,v1-v0,plaster(ceilC));
  for(const w2 of I.walls)if(!I.glass?.some(g2=>g2[0]===w2[0]&&g2[2]===w2[2]))B(inn,(w2[0]+w2[1])/2,y+ceil/2,(w2[2]+w2[3])/2,w2[1]-w2[0],ceil,w2[3]-w2[2],m);return y;};
 const troffers=(u0,u1,v0,v1,y,du,dv,section)=>{for(let u=u0+du/2;u<u1;u+=du)for(let v=v0+dv/2;v<v1;v+=dv){const f=section?section(u,v):nextFix();D.fixtures.push({group:inn,x:u,y:y-.02,z:v,w:1.2,d:.6,lv:LV.fix+f,u,v,y});}};
 // ---- the library ----
 {const I=INTERIORS.library,y=roomShell('library',{ceil:4.6,wallC:0xe6dcc4,trim:0x5a3a24,ops:{v0:[-14,-10.5,-7,7,10.5,14].map(x=>[135-x-1,135-x+1,TY+.75+.9,TY+.75+4.9]),v1:[[145.1,146.9,TY+1.95,TY+5.15],[139.1,140.9,TY+1.95,TY+5.15],[129.1,130.9,TY+1.95,TY+5.15],[123.1,124.9,TY+1.95,TY+5.15]],u0:[[47,49,TY+1.65,TY+5.65],[52,54,TY+1.65,TY+5.65],[57,59,TY+1.65,TY+5.65]],u1:[[47,49,TY+1.65,TY+5.65],[52,54,TY+1.65,TY+5.65],[57,59,TY+1.65,TY+5.65]]}}),wood=timber(0x7a5a3c),books=[0x7a2a22,0x2a4a6a,0x3a5a3a,0x8a6a2a,0x5a3a5a,0x2a2a2a,0xa8402a,0x40607a,0xc8b48a];
  D.libraryFix={};troffers(119.5,151,45,61,y+4.6,3.4,3.2,(u,v)=>{const k=u>142.5&&v>54.5?'history':u<128?'east':u>141?'west':'center';return D.libraryFix[k]??=nextFix();});
  for(const s of SOLIDS.filter(s=>s.inside==='library')){const cu=(s.u0+s.u1)/2,cv=(s.v0+s.v1)/2,w=s.u1-s.u0,d=s.v1-s.v0;
   if(s.kind==='stack'){const hgt=s.wall?2.4:2.1;B(inn,cu,y+hgt/2,cv,w,hgt,d,wood);for(let k=0;k<5;k++){const yy=y+.15+k*.42;for(const side of s.wall?[1]:[-1,1]){let u=s.u0+.05;const r2=seeded(hashSeed(k,cu,cv,side));while(u<s.u1-.1){const bw=.025+r2()*.04,bh=.24+r2()*.12,n=Math.max(1,Math.round(.3/bw));B(inn,u+bw*n/2,yy+bh/2,cv+side*(d/2+.005)-side*.12,bw*n,bh,.22,dull(books[Math.floor(r2()*books.length)]));u+=bw*n+.004;}}}}
   else if(s.kind==='desk-circ'){B(inn,cu,y+.5,cv,w,1,d,wood);B(inn,cu,y+1.02,cv,w+.06,.05,d+.06,paint(0xc8b490));}
   else if(s.kind==='table'){B(inn,cu,y+.74,cv,w,.06,d,wood);for(const [a,c] of [[s.u0+.1,s.v0+.1],[s.u1-.1,s.v0+.1],[s.u0+.1,s.v1-.1],[s.u1-.1,s.v1-.1]])B(inn,a,y+.37,c,.07,.74,.07,wood);for(let u=s.u0+.6;u<s.u1;u+=1.2)for(const e of [-1,1]){B(inn,u,y+.45,cv+e*(d/2+.35),.42,.05,.42,wood);B(inn,u,y+.85,cv+e*(d/2+.55),.42,.8,.05,wood);}}
   else if(s.kind==='computers'){B(inn,cu,y+.72,cv,w,.06,d,paint(0xd8d0c0));B(inn,cu,y+.36,cv,w,.7,d*.9,paint(0xb8b0a0));for(let u=s.u0+1.2;u<s.u1;u+=3.6){B(inn,u,y+1.03,cv+.05,.44,.38,.4,paint(0xd8d2c4));B(inn,u,y+1.03,cv-.16,.34,.27,.02,glassDark);B(inn,u,y+.77,cv-.18,.42,.03,.16,paint(0xd0c8b8));B(inn,u+.5,y+.95,cv,.18,.4,.4,paint(0xd8d2c4));}}
   else if(s.kind==='microfilm'){B(inn,cu,y+.74,cv,w,.06,d,wood);B(inn,cu,y+.37,cv,w,.74,d*.9,wood);const mg=at(inn,148.8,y+.77,60.95,Math.PI);B(mg,0,.32,0,.95,.64,.7,paint(0xc8c2b0));B(mg,0,.9,.05,.85,.62,.55,paint(0xbcb6a4));B(mg,0,1.3,-.05,.7,.28,.4,paint(0xc8c2b0));for(const x of [-.32,.32])K.cyl(mg,x,.68,-.32,.07,.04,dull(0x2a2a2a),12,[Math.PI/2,0,0]);
    D.reader={group:mg,x:0,y:.92,z:-.33,w:.66,h:.5};}
   else if(s.kind==='cabinets'){B(inn,cu,y+.65,cv,w,1.3,d,metal(0x8a8e88));for(let k=0;k<4;k++)B(inn,s.u0-.01,y+.2+k*.3,cv,.02,.03,d*.8,metal(0x5a5a58));}
   else if(s.kind==='kids-shelf'){B(inn,cu,y+.5,cv,w,1,d,paint(0xd8a040));}else if(s.kind==='newspapers'){B(inn,cu,y+.6,cv,w,1.2,d,wood);for(let k=0;k<4;k++)B(inn,s.u0-.02,y+.4+k*.22,cv,.03,.2,d*.85,dull(0xe8e2d0));}}
  // the history room's glass, framed photographs of the old town, the bulletin board, a globe
  for(const g2 of I.glass){B(inn,(g2[0]+g2[1])/2,y+1.5,(g2[2]+g2[3])/2,g2[1]-g2[0],2.8,.04,glassClear);B(inn,(g2[0]+g2[1])/2,y+.06,(g2[2]+g2[3])/2,g2[1]-g2[0],.12,.1,timber(0x5a3a24));B(inn,(g2[0]+g2[1])/2,y+2.95,(g2[2]+g2[3])/2,g2[1]-g2[0],.1,.1,timber(0x5a3a24));}B(inn,146.75,y+3.7,54.75,9,1.8,.3,plaster(0xe6dcc4));
  B(inn,146.75,y+2.95,54.75,1.5,.3,.5,plaster(0xe6dcc4));sign(inn,{text:'LOCAL HISTORY',sub:'MICROFILM · THE COURIER 1879–2009',bg:'#2a3a2a',fg:'#e8e0c8',font:'serif',border:true},1.6,.42,{x:146.75,y:y+3.35,z:54.47,ry:Math.PI});
  for(const [u,v,ry] of [[151.45,57,-Math.PI/2],[151.45,59.2,-Math.PI/2],[145,61.45,Math.PI]]){B(inn,u,y+1.9,v,ry===Math.PI?.9:.04,.7,ry===Math.PI?.04:.9,timber(0x3a2a1e));}
  D.historyFrames=[[151.4,57,-Math.PI/2],[151.4,59.2,-Math.PI/2],[145,61.4,Math.PI]].map(([u,v,ry])=>({u,v,y:y+1.9,ry}));
  B(inn,129.5,y+1.9,44.56,2.4,1.3,.04,timber(0x8a6a44));B(inn,129.5,y+1.9,44.58,2.2,1.1,.02,dull(0xb89a6a));D.bulletin={u:129.5,v:44.62,y:y+1.9};
  {const gl=at(inn,150,y+1.1,46.6,0);const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),paint(0x4a7aaa));ball.position.y=.25;gl.add(ball);B(gl,0,-.2,0,.06,.6,.06,timber(0x3a2a1e));}
  sign(inn,{text:'PLEASE SIGN IN AT THE DESK',bg:'#f2eee4',fg:'#3a3a3a',font:'sans',border:false},.9,.2,{x:135,y:y+1.15,z:48.47,ry:Math.PI});}
 // ---- the video store ----
 {const I=INTERIORS.video,y=roomShell('video',{ceil:3.4,wallC:0x3a3e5a,ceilC:0xd8d6d0,trim:0x1a1a2a,skip:['v1']}),rackM=paint(0x2a2a30),shelfM=paint(0x8a8a90);
  // ceiling lights, in three sections from the front (the street) to the back, and the back room's
  D.videoFix={};troffers(99.5,115,-28,-11.5,y+3.4,3.2,3,(u,v)=>{const k=v>-16.5?'front':v>-22.5?'middle':'rear';return D.videoFix[k]??=nextFix();});troffers(100,115,-34.4,-28.6,y+3.4,4,3,()=>D.videoFix.back??=nextFix());
  let ci=0;const cases=(s,side)=>{const n=Math.floor((s.v1-s.v0)/.17);const len=s.v1-s.v0;for(let r=0;r<5;r++){const yy=y+.35+r*.38;B(inn,(s.u0+s.u1)/2+side*.2,yy-.03,(s.v0+s.v1)/2,.5,.03,len,shelfM);for(let k=0;k<n;k++){const v=s.v0+.1+k*(len-.2)/n,uv=covers.add(60,86,(g,a,c)=>coverArt(g,a,c,(ci++)%120));quadInto(quads.cover,inn,uv,.135,.19,{x:(s.u0+s.u1)/2+side*(s.u1-s.u0)/2+side*.012,y:yy+.11,z:v,ry:side>0?Math.PI/2:-Math.PI/2});}}};
  for(const s of SOLIDS.filter(s=>s.inside==='video')){const cu=(s.u0+s.u1)/2,cv=(s.v0+s.v1)/2,w=s.u1-s.u0,d=s.v1-s.v0;
   if(s.kind==='rack'){B(inn,cu,y+1.05,cv,w,2.1,d,rackM);if(s.island){cases(s,1);cases(s,-1);}else if(s.wall==='w')cases(s,-1);else{const n=Math.floor(w/.17);for(let r=0;r<5;r++){const yy=y+.35+r*.38;for(let k=0;k<n;k++){const u=s.u0+.1+k*(w-.2)/n,uv=covers.add(60,86,(g,a,c)=>coverArt(g,a,c,(ci++)%120));quadInto(quads.cover,inn,uv,.135,.19,{x:u,y:yy+.11,z:s.v1+.012,ry:0});}}}}
   else if(s.kind==='counter'){B(inn,cu,y+.52,cv,w,1.04,d,paint(0x6a4a7a));B(inn,cu,y+1.06,cv,w+.1,.05,d+.1,paint(0xd8d4c8));}
   else if(s.kind==='candy'){B(inn,cu,y+.6,cv,w,1.2,d,metal(0x8a8a8a));for(let k=0;k<4;k++)for(let j=0;j<6;j++)B(inn,s.u0+.1+j*.14,y+.3+k*.25,s.v1+.02,.12,.18,.04,dull([0xc83a2a,0xe8c040,0x3a6aaa,0x5aaa4a,0xe87a2a][Math.floor(R()*5)]));}
   else if(s.kind==='bins'){B(inn,cu,y+.4,cv,w,.8,d,paint(0x4a2a2a));for(let k=0;k<14;k++)B(inn,s.u0+.15+k*.18,y+.86,cv,.1,.19,.13,dull(0x1a1a1a));sign(inn,{text:'VHS $2.99 · 4 FOR $10',bg:'#e8d040',fg:'#1a1a1a',font:'block',border:false},1.4,.26,{x:cu,y:y+.55,z:s.v1+.01});}
   else if(s.kind==='display'){B(inn,cu,y+.9,cv,w,1.8,d,paint(0x2a2a2a));}else if(s.kind==='shelving'){for(let k=0;k<4;k++){B(inn,cu,y+.2+k*.6,cv,w,.04,d,metal(0x8a8e90));for(let j=0;j<3;j++)B(inn,s.u0+.3+j*(w-.4)/3,y+.42+k*.6,cv,(w-.6)/3,.34,d*.8,dull(0xb89a6a));}for(const [a,c] of [[s.u0,s.v0],[s.u1,s.v0],[s.u0,s.v1],[s.u1,s.v1]])B(inn,a,y+1.2,c,.04,2.4,.04,metal(0x8a8e90));}
   else if(s.kind==='emp-desk'){B(inn,cu,y+.74,cv,w,.05,d,paint(0x8a7a64));B(inn,cu,y+.37,cv,w,.74,d*.9,paint(0x6a5a48));B(inn,cu-.4,y+1.0,cv,.4,.42,.4,paint(0xd0c8b8));B(inn,cu+.4,y+.85,cv,.42,.12,.32,paint(0x2a2a2a));}
   else if(s.kind==='boxes'){for(let k=0;k<3;k++)B(inn,cu+(R()-.5)*.3,y+.25+k*.48,cv+(R()-.5)*.2,w*.8,.46,d*.8,dull(0xb89a6a));}else if(s.kind==='cart'){B(inn,cu,y+.6,cv,w,.04,d,metal(0x8a8e90));B(inn,cu,y+.25,cv,w,.04,d,metal(0x8a8e90));for(let k=0;k<6;k++)B(inn,s.u0+.12+k*.14,y+.72,cv,.1,.19,.14,dull(0x1a1a1a));}}
  // the TV over the counter, the register, the phone, the BACK IN 10 sign, genre signs, posters, the security mirror, EXIT
  D.tvs.video=tvSet(inn,99.35,y+2.32,-18,.82,{ry:Math.PI/2,bracket:true});
  B(inn,101,y+1.2,-15.3,.42,.28,.38,paint(0xd8d0c0));B(inn,101,y+1.36,-15.3,.3,.06,.26,paint(0x8a8a8a));
  {const pg=at(inn,SPOT.videoPhone.u,y+1.09,SPOT.videoPhone.v,Math.PI/2);B(pg,0,.04,0,.22,.08,.18,paint(0xd8d0bc));B(pg,0,.11,-.02,.2,.05,.06,paint(0xd8d0bc));D.videoPhone=pg;}
  sign(inn,{text:'BACK IN 10 MIN',sub:'— D.',bg:'#f4f0e4',fg:'#1a1a1a',font:'script',border:false},.3,.2,{x:101.42,y:y+1.21,z:-17,ry:Math.PI/2});
  for(const [u,txt] of [[104.6,'NEW RELEASES'],[108.2,'ACTION · THRILLER'],[111.8,'COMEDY · FAMILY']]){B(inn,u,y+3.05,-19.9,.02,.5,.02,metal(0x8a8a8a));sign(inn,{text:txt,bg:'#c8302a',fg:'#ffffff',font:'block',border:false},1.6,.34,{x:u,y:y+2.75,z:-19.9,ry:Math.PI/2});}
  sign(inn,{text:'HORROR',bg:'#1a1a1a',fg:'#c8302a',font:'block',border:false},1.4,.34,{x:115.4,y:y+2.5,z:-24,ry:-Math.PI/2});sign(inn,{text:'DRAMA · CLASSICS',bg:'#2a3a6a',fg:'#ffffff',font:'block',border:false},1.8,.34,{x:115.4,y:y+2.5,z:-16,ry:-Math.PI/2});
  sign(inn,{text:'EMPLOYEES ONLY',bg:'#f2f2f2',fg:'#c8302a',font:'sans',border:false},.9,.24,{x:111.25,y:y+2.35,z:-28.03});
  for(let k=0;k<4;k++){const uv=covers.add(150,222,(g,a,c)=>coverArt(g,a,c,k*11+5));quadInto(quads.cover,inn,uv,.8,1.18,{x:102.6+k*1.9,y:y+2.5,z:-27.4,ry:0});}
  {const mir=new THREE.Mesh(new THREE.SphereGeometry(.38,20,12,0,Math.PI*2,0,Math.PI/2),K.mat(0xd8dce0,{roughness:.05,metalness:1}));mir.rotation.x=-Math.PI/2;mir.position.set(115.3,y+3.0,-27.7);mir.rotation.set(-Math.PI/2,0,Math.PI*.75);inn.add(mir);}
  sign(inn,{text:'EXIT',bg:'#1a0a0a',fg:'#ff3a2a',font:'sans',neon:true,border:false},.42,.18,{x:SPOT.videoRear.u,y:y+2.5,z:-34.45,lit:true,lvl:LV.neon+NEON.exitSign});
  sign(inn,{text:'PLEASE BE KIND · REWIND',bg:'#2a6aaa',fg:'#ffffff',font:'block',border:false},1.4,.3,{x:99.03,y:y+2.0,z:-13.5,ry:Math.PI/2});}
 // ---- the laundromat ----
 {const I=INTERIORS.laundry,y=roomShell('laundry',{ceil:3.3,wallC:0xe8e4d4,ceilC:0xe8e6e0,trim:0x3a6a8a,skip:['v1']});
  D.laundryFix={};troffers(157,170.6,-36.4,-11.6,y+3.3,3.4,3.2,(u,v)=>{const k=v>-20?'front':v>-28?'middle':'back';return D.laundryFix[k]??=nextFix();});
  for(const s of SOLIDS.filter(s=>s.inside==='laundry')){const cu=(s.u0+s.u1)/2,cv=(s.v0+s.v1)/2,w=s.u1-s.u0,d=s.v1-s.v0;
   if(s.kind==='washers'){const n=Math.round(d/.72);for(let k=0;k<n;k++){const v=s.v0+.36+k*(d/n);for(const side of s.front?[1]:[-1,1]){const u=cu+side*w/4;B(inn,u,y+.48,v,w/2-.04,.96,.66,paint(0xeceae4));const lid=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.02,16),glassDark);lid.position.set(u,y+.97,v);inn.add(lid);B(inn,u+side*.27,y+1.05,v,.08,.16,.6,paint(0xd0ccc4));}}}
   else if(s.kind==='dryers'){const n=Math.round(d/.8);for(let k=0;k<n;k++){const v=s.v0+.4+k*(d/n);for(const yy of [.55,1.4]){B(inn,cu,y+yy,v,w,.82,.76,paint(0xe0ded8));const door=new THREE.Mesh(new THREE.CircleGeometry(.26,18),glassDark);door.position.set(s.u1+.01,y+yy,v);door.rotation.y=-Math.PI/2;inn.add(door);}}}
   else if(s.kind==='folding'){B(inn,cu,y+.86,cv,w,.06,d,paint(0xd8d4c8));for(const v of [s.v0+.2,s.v1-.2])B(inn,cu,y+.43,v,w*.8,.86,.06,metal(0x8a8a8a));}
   else if(s.kind==='chairs'){for(let u=s.u0+.3;u<s.u1;u+=.75){B(inn,u,y+.45,cv,.42,.05,.42,paint(0xe8a030));B(inn,u,y+.75,cv+.2,.42,.55,.04,paint(0xe8a030));}}
   else if(s.kind==='soap'){B(inn,cu,y+.9,cv,w,1.8,d,paint(0x3a6aaa));B(inn,cu,y+1.3,s.v1+.01,w*.7,.5,.02,glassDark);}else if(s.kind==='change'){B(inn,cu,y+.85,cv,w,1.7,d,metal(0x9a9a9a));}}
  D.tvs.laundry=tvSet(inn,170.5,y+2.45,-12.6,.58,{ry:-Math.PI*.75,bracket:true});
  sign(inn,{text:'ATTENDANT ON DUTY 8 AM – 5 PM',sub:'NO DYEING · NOT RESPONSIBLE FOR LOST ITEMS',bg:'#f4f0e4',fg:'#1a2a4a',font:'sans',border:true},1.4,.6,{x:156.53,y:y+1.9,z:-33,ry:Math.PI/2});
  {const pp=at(inn,156.55,y+1.25,-35.2,Math.PI/2);B(pp,0,0,0,.05,.5,.3,metal(0x8a8a8a));B(pp,.06,.05,0,.08,.4,.22,metal(0x5a5a5a));D.laundryPhone=pp;}}
 // the row of old garages along the narrow part of the south alley (their doors face the alley)
 {const gw=4.33;for(let k=0;k<6;k++){const u=148+gw*(k+.5),g=at(out,u,TY+.02,-41,0);B(g,0,1.4,-2.5,gw,2.8,5,brick(0x8a6450));B(g,0,2.85,-2.5,gw+.2,.12,5.3,dull(0x4a4844));
  B(g,0,1.1,.01,gw-.9,2.2,.04,paint([0xd8d2c4,0x8a8a7a,0xa89a7a][k%3]));for(let y=.4;y<2.2;y+=.44)B(g,0,y,.035,gw-.95,.03,.02,dull(0x6a6a62));}}
 // the library's steps (the walking surface: town-plan STEPS)
 for(const st of STEPS){const n=st.n,L=st.v1-st.v0;for(let k=0;k<=n;k++){const v0=st.v0+L*k/(n+1),hh=st.y0+(st.y1-st.y0)*k/n;B(out,(st.u0+st.u1)/2,TY+hh/2,(v0+st.v1)/2,st.u1-st.u0,hh,st.v1-v0,stone(0xc0b8a8));}
  for(const s2 of [-1,1]){const u=s2<0?st.u0-.25:st.u1+.25;B(out,u,TY+st.y1/2+.15,(st.v0+st.v1)/2,.5,st.y1+.3,L,stone(0xb0a898));}}
 // =========================================================== the street furniture ========================================
 const lampPost=new Map();
 for(const s of SOLIDS){const isR=s.r===undefined,cu=isR?(s.u0+s.u1)/2:s.u,cv=isR?(s.v0+s.v1)/2:s.v,w=isR?s.u1-s.u0:2*s.r,d=isR?s.v1-s.v0:2*s.r;if(s.inside)continue;const y=townY(cu,cv),g=out;
  const dir=s.dir?{'v+':0,'v-':Math.PI,'u+':Math.PI/2,'u-':-Math.PI/2}[s.dir]:0;
  switch(s.kind){
   case 'lamp-acorn':{const L=LAMPS[s.lamp];K.cyl(g,cu,y+.15,cv,.18,.3,metal(0x1e2224),12);K.cyl(g,cu,y+2.2,cv,.065,3.9,metal(0x1e2224),10);K.cyl(g,cu,y+4.12,cv,.12,.12,metal(0x1e2224),10);lampPost.set(L.id,{u:cu,v:cv,y:y+4.18});break;}
   case 'lamp-cobra':{const L=LAMPS[s.lamp],arm=(L.arm||1)*(L.cross!==undefined?1:1);K.cyl(g,cu,y+3.9,cv,.11,7.8,metal(0x8a8e8c),8);
    const dirU=L.cross!==undefined?(L.u<L.cross?1:-1):0,dirV=L.cross!==undefined?0:-1;const hx=cu+dirU*2.1,hz=cv+dirV*2.1*(L.side||1);K.rod(g,[cu,y+7.6,cv],[hx,y+7.9,hz],.05,metal(0x8a8e8c));lampPost.set(L.id,{u:hx,v:hz,y:y+7.85});break;}
   case 'lamp-globe':{const L=LAMPS[s.lamp];K.cyl(g,cu,y+1.7,cv,.07,3.4,metal(0x1e2224),10);K.cyl(g,cu,y+.12,cv,.16,.24,metal(0x1e2224),10);lampPost.set(L.id,{u:cu,v:cv,y:y+3.62});break;}
   case 'lamp-pole':{const L=LAMPS[s.lamp];B(g,cu,y+3.6,cv,.18,7.2,.18,metal(0x6a6e6c));B(g,cu,y+.3,cv,.6,.6,.6,concrete(0xa8a296));B(g,cu+.5,y+7.2,cv,1,.08,.08,metal(0x6a6e6c));lampPost.set(L.id,{u:cu+1,v:cv,y:y+7.1});break;}
   case 'tree-grate':{B(g,cu,y+.005,cv,1.3,.02,1.3,metal(0x3a3a38));const tg=at(g,cu,y,cv,R()*6);veg.build(tg,seeded(hashSeed(5,cu,cv)),{size:.75,kind:'maple',lod:'full'});break;}
   case 'tree':{const tg=at(g,cu,y,cv,R()*6);veg.build(tg,seeded(hashSeed(6,cu,cv)),{size:s.size||1,kind:R()<.25?'oak':'maple',lod:'full'});break;}
   case 'bench':{const bg=at(g,cu,y,cv,dir);for(let k=0;k<4;k++)B(bg,0,.44,-.18+k*.1,1.75,.04,.08,timber(0x7a5a3a));for(let k=0;k<3;k++)B(bg,0,.62+k*.12,.22,1.75,.08,.03,timber(0x7a5a3a));for(const x of [-.75,.75]){B(bg,x,.22,0,.06,.44,.5,metal(0x2a2a2a));B(bg,x,.6,.22,.06,.5,.06,metal(0x2a2a2a));}break;}
   case 'trashcan':{K.cyl(g,cu,y+.45,cv,.26,.9,metal(0x2a4a32),12);K.cyl(g,cu,y+.92,cv,.28,.06,metal(0x2a3a2a),12);break;}
   case 'hydrant':{K.cyl(g,cu,y+.32,cv,.13,.64,paint(0xc8b030),10);K.cyl(g,cu,y+.68,cv,.1,.12,paint(0xc8b030),10);B(g,cu,y+.42,cv,.36,.09,.09,paint(0xc8b030));break;}
   case 'meter':{K.cyl(g,cu,y+.55,cv,.035,1.1,metal(0x5a5a5a),6);B(g,cu,y+1.22,cv,.16,.28,.12,metal(0x7a7a72));B(g,cu,y+1.26,cv+.064*(cv>0?-1:1),.1,.08,.01,glassDark);break;}
   case 'newsbox':{const c=s.label==='COURIER'?0x2a4a8a:s.label==='TODAY'?0x2a6aaa:0xc8302a;B(g,cu,y+.55,cv,w*.95,1.1,d*.95,metal(c));B(g,cu,y+.85,s.v0-.01,w*.7,.3,.02,glassDark);sign(at(g,cu,y,s.v0-.015,Math.PI),{text:s.label,bg:'#f2f2f2',fg:'#1a1a1a',font:'sans',border:false},.46,.12,{y:1.03});break;}
   case 'payphone':{const pg=at(g,cu,y,cv,Math.PI);B(pg,0,.6,0,.12,1.2,.12,metal(0x8a8a8a));B(pg,0,1.45,0,.42,.6,.18,metal(0x9a9a9a));B(pg,0,1.85,-.05,.6,.08,.4,metal(0x6a6a6a));sign(pg,{text:'PHONE',bg:'#2a4a8a',fg:'#ffffff',font:'sans',border:false},.4,.1,{y:1.95,z:.16});D.payphone=pg;break;}
   case 'mailbox':{B(g,cu,y+.65,cv,.5,.85,.45,paint(0x23407a));B(g,cu,y+.12,cv,.5,.24,.45,metal(0x1a2a4a));break;}
   case 'vending':{const vg=at(g,cu,y,cv,Math.PI);B(vg,0,.92,0,.9,1.84,.72,paint(0xb8302a));quadInto(quads.lit,vg,signs.add(200,360,(gg,a,c)=>{gg.fillStyle='#d8302a';gg.fillRect(0,0,a,c);gg.fillStyle='#ffffff';gg.font=`bold ${a*.16}px Arial`;gg.textAlign='center';gg.fillText('ICE COLD',a/2,c*.18);for(let k=0;k<6;k++){gg.fillStyle=['#2a5aaa','#f2f2f2','#3aaa4a','#e8c040','#f28a2a','#8a2a6a'][k];gg.fillRect(a*.12,c*(.3+k*.1),a*.76,c*.07);}}),.6,1.1,{y:1.15,z:.37,lvl:LV.neon+NEON.vending});break;}
   case 'planter':{B(g,cu,y+.3,cv,w,.6,d,concrete(0xb8b0a0));veg.shrub(at(g,cu,y+.6,cv),0,0,.42,seeded(hashSeed(2,cu,cv)));break;}
   case 'bikerack':{const n=Math.round(w/.8);for(let k=0;k<n;k++){const x=s.u0+.4+k*(w-.8)/Math.max(1,n-1);K.rod(g,[x,y,cv-.0],[x,y+.82,cv],.025,metal(0x8a8e90));}B(g,cu,y+.82,cv,w-.7,.05,.05,metal(0x8a8e90));break;}
   case 'gazebo':{const gg=at(g,cu,y,cv);const oct=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,.5,8),timber(0xe0d8c8));oct.position.y=.25;gg.add(oct);for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8;K.cyl(gg,Math.cos(a)*4.1,1.9,Math.sin(a)*4.1,.1,2.9,paint(0xf0ece2),8);}
    const rf=new THREE.Mesh(new THREE.ConeGeometry(5,2.2,8),roofM(0x5a3a32));rf.position.y=4.4;gg.add(rf);for(let k=0;k<8;k++){const a=k/8*Math.PI*2,b2=(k+1)/8*Math.PI*2+0;void b2;B(gg,Math.cos(a+Math.PI/8)*4.1,1,Math.sin(a+Math.PI/8)*4.1,.06,.06,.06,paint(0xf0ece2));}const rail=new THREE.Mesh(new THREE.TorusGeometry(4.1,.04,4,8),paint(0xf0ece2));rail.rotation.x=Math.PI/2;rail.position.y=1.4;gg.add(rail);break;}
   case 'memorial':{B(g,cu,y+.4,cv,2.4,.8,2.4,stone(0xb8b2a6));B(g,cu,y+.9,cv,1.6,.3,1.6,stone(0xb8b2a6));const ob=new THREE.Mesh(new THREE.CylinderGeometry(.22,.5,5.2,4),stone(0xcac4b8));ob.position.set(cu,y+3.6,cv);ob.rotation.y=Math.PI/4;g.add(ob);
    sign(at(g,cu,y,cv-1.21,Math.PI),{text:'IN HONOR OF THOSE WHO SERVED',sub:'OAK HOLLOW TOWNSHIP · 1919 · 1946 · 1975',bg:'#5a5a50',fg:'#e8e0c8',font:'serif',border:false},1.5,.5,{y:.42});break;}
   case 'flagpole':{K.cyl(g,cu,y+5,cv,.06,10,metal(0xd0d0d0),8);const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1),K.mat(0xd8d4d0,{side:THREE.DoubleSide}));fl.position.set(cu+.95,y+9.3,cv);g.add(fl);D.flag=fl;break;}
   case 'fountain':{K.cyl(g,cu,y+.45,cv,.18,.9,stone(0xa8a090),8);K.cyl(g,cu,y+.95,cv,.32,.1,metal(0x8a8a8a),12);break;}
   case 'dumpster':{B(g,cu,y+.7,cv,w,1.3,d,metal(0x2a5a3a));B(g,cu,y+1.4,cv-.05,w+.05,.08,d,K.mat(0x1a1a1a,{roughness:.8}));break;}
   case 'ac':{B(g,cu,y+.45,cv,w,.9,d,metal(0xa8aaa6));const fan=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.02,12),dull(0x3a3a3a));fan.position.set(cu,y+.91,cv);g.add(fan);break;}
   case 'pole':{K.cyl(g,cu,y+4.6,cv,.15,9.2,dull(0x786551),7);B(g,cu,y+8.6,cv,.12,.12,1.9,dull(0x6a5a48));(D.alleyPoles||=[]).push(new THREE.Vector3(cu,y+8.7,cv));break;}
   case 'pallets':case 'crates':{for(let k=0;k<3;k++)B(g,cu,y+.07+k*.15,cv,w,.12,d,timber(0x9a8462));break;}
   case 'railing':break;
   case 'barricade':{const bg=at(g,cu,y,cv,s.v1-s.v0>s.u1-s.u0?Math.PI/2:0),L=Math.max(w,d);for(const yy of [.55,1.0]){B(bg,0,yy,0,L,.22,.05,paint(0xe8e4dc));for(let x=-L/2+.2;x<L/2;x+=.6)B(bg,x,yy,.03,.28,.22,.01,paint(0xe86a1a));}for(const x of [-L/2+.3,L/2-.3])B(bg,x,.6,0,.08,1.2,.6,metal(0x8a8a8a));
    sign(bg,{text:s.label,sub:s.label==='ROAD CLOSED'?'BRIDGE OUT · DETOUR VIA MILL ST':'',bg:'#f2f2f2',fg:'#1a1a1a',font:'block',border:true},1.6,s.label==='ROAD CLOSED'?.7:.5,{y:1.65,z:.05});break;}
   case 'sawhorse':{const bg=at(g,cu,y,cv,0);B(bg,0,.8,0,w,.2,.05,paint(0xe8e4dc));for(let x=-w/2+.15;x<w/2;x+=.5)B(bg,x,.8,.03,.24,.2,.01,paint(0xe86a1a));for(const x of [-w/2+.2,w/2-.2])B(bg,x,.4,0,.06,.8,.5,timber(0x9a8462));sign(bg,{text:s.label,bg:'#f2f2f2',fg:'#1a1a1a',font:'block',border:true},1.3,.42,{y:1.25,z:.03});break;}
   case 'pump':case 'canopy-post':break;
   case 'townsign':{const tg=at(g,cu,y,cv,0);for(const x of [-1.6,1.6])B(tg,x,.7,0,.14,1.4,.14,timber(0x5a3a24));B(tg,0,1.55,0,3.6,1.3,.14,timber(0x6a4a2c));sign(tg,{text:'WELCOME TO',sub:'HISTORIC DOWNTOWN OAK HOLLOW',sub2:'EST. 1847',bg:'#2a4a32',fg:'#f0e6c8',font:'serif',border:true},3.4,1.1,{y:1.55,z:.08});sign(tg,{text:'WELCOME TO',sub:'HISTORIC DOWNTOWN OAK HOLLOW',bg:'#2a4a32',fg:'#f0e6c8',font:'serif',border:true},3.4,1.1,{y:1.55,z:-.08,ry:Math.PI});break;}}}
 // wires along the alleys, flyers on a few poles, street signs at the corners
 {const wire=new THREE.LineBasicMaterial({color:0x3a3430}),poles=(D.alleyPoles||[]).sort((a,b)=>a.z-b.z||a.x-b.x);for(const side of [-1,1]){const row=poles.filter(p=>Math.sign(p.z)===side).sort((a,b)=>a.x-b.x);for(let i=0;i<row.length-1;i++){const a=row[i],b=row[i+1];if(Math.abs(b.x-a.x)>70)continue;for(const dz of [-.8,.8]){const pts=[];for(let k=0;k<=10;k++){const t=k/10;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-1.8*t*(1-t),a.z+dz+(b.z-a.z)*t));}out.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wire));}}}
  const fl=signs.add(170,220,(g,w,h)=>flyerArt(g,w,h));for(const [u,v,ry] of [[52,7.55,Math.PI],[128,-7.55,0],[90+6.3,24-.16,Math.PI/2]])quadInto(quads.sign,at(out,u,townY(u,v)+1.5,v,ry),fl,.28,.36,{});
  quadInto(quads.sign,inn,fl,.28,.36,{x:D.bulletin.u-.6,y:D.bulletin.y+.1,z:D.bulletin.v+.02,ry:0});D.flyerUV=fl;
  for(const c of CROSS)for(const [u,v] of [[c.u-6.6,9.2],[c.u+6.6,-9.2]]){const y=townY(u,v),sg=at(out,u,y,v,0);K.cyl(sg,0,1.6,0,.04,3.2,metal(0x6a6e6c),6);
   sign(sg,{text:c.name,bg:'#2f6b45',fg:'#f2f5ef',font:'sans',border:false},1.1,.2,{y:3.2,ry:0});sign(sg,{text:'MAIN ST',bg:'#2f6b45',fg:'#f2f5ef',font:'sans',border:false},1.1,.2,{y:3.0,ry:Math.PI/2});
   if(v>0){B(sg,0,2.5,0,.6,.6,.03,paint(0xb8201a));}}}
 // =========================================================== beyond the edges ==============================================
 // The town goes on past what you can reach: houses on the residential streets north and south, the rail line west,
 // trees, the water tower. All rough and far.
 {const rnd=seeded(77),house=(u,v,rot,c)=>{const g=at(far,u,mainBase(u)+.1,v,rot),w=8+rnd()*3,d=8+rnd()*2,two=rnd()<.5,h=two?5.8:3.2,wall=siding(c),rf=roofM([0x4d4a48,0x5b534d,0x46505a,0x635a52][Math.floor(rnd()*4)]);
   B(g,0,h/2,0,w,h,d,wall);K.tri(g,[-w/2-.3,h,d/2+.3,w/2+.3,h,d/2+.3,0,h+2.2,0, w/2+.3,h,-d/2-.3,-w/2-.3,h,-d/2-.3,0,h+2.2,0, -w/2-.3,h,-d/2-.3,-w/2-.3,h,d/2+.3,0,h+2.2,0, w/2+.3,h,d/2+.3,w/2+.3,h,-d/2-.3,0,h+2.2,0],rf);
   for(const x of [-w*.3,w*.3])B(g,x,1.5,d/2+.02,1.1,1.3,.04,upper(Math.floor(rnd()*8)));if(two)for(const x of [-w*.3,0,w*.3])B(g,x,4.3,d/2+.02,1,1.2,.04,upper(Math.floor(rnd()*8)));};
  for(let u=-60;u<300;u+=16+rnd()*6){for(const [v0,rot] of [[94,Math.PI],[118,0],[-80,0],[-104,Math.PI]]){if(rnd()<.18)continue;house(u,v0+(rnd()-.5)*4,rot+(rnd()-.5)*.1,HOUSE_WALLS[Math.floor(rnd()*HOUSE_WALLS.length)]);}}
  for(let k=0;k<160;k++){const u=-120+rnd()*520,v=(rnd()<.5?1:-1)*(76+rnd()*120);if(Math.abs(v)<80&&u>-80&&u<290)continue;const tg=at(far,u,mainBase(clamp(u,-80,290))+.1,v,rnd()*6);veg.build(tg,rnd,{size:1+rnd()*.8,kind:rnd()<.3?'pine':'maple',lod:'far'});}
  // the rail line past Main's west end, its old depot, and the water tower on the hill beyond
  const rl=at(far,288,TY,0,0);for(const x of [-.75,.75])B(rl,x,.12,0,.08,.12,300,metal(0x6a5a4a));for(let z=-150;z<150;z+=.65)B(rl,0,.04,z,2.4,.08,.22,timber(0x5a4a3a));
  for(const s of [-1,1]){const xb=at(far,284,TY,s*9,0);K.cyl(xb,0,2,0,.06,4,metal(0xe8e8e8),6);const cb=new THREE.Group();cb.position.y=3.6;xb.add(cb);for(const a of [.7,-.7]){const bar=B(cb,0,0,0,1.3,.2,.03,paint(0xf2f2f2));bar.rotation.z=a;}}
  const dp=at(far,300,TY+.1,24,Math.PI/2);B(dp,0,2.2,0,18,4.4,8,siding(0x8a6a4a));K.tri(dp,[-9.5,4.4,4.5,9.5,4.4,4.5,0,6.8,0,9.5,4.4,-4.5,-9.5,4.4,-4.5,0,6.8,0],roofM(0x4a3a32));sign(dp,{text:'OAK HOLLOW',bg:'#e8e0c8',fg:'#3a2a1e',font:'serif',border:true},3.6,.6,{y:3.6,z:4.06});
  const wt=at(far,360,TY+5,-70,0);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;K.rod(wt,[Math.cos(a)*4,0,Math.sin(a)*4],[Math.cos(a)*2.4,24,Math.sin(a)*2.4],.18,metal(0x9aa2a6));}
  const tank=new THREE.Mesh(new THREE.SphereGeometry(5.4,20,14),metal(0xb8c0c4));tank.scale.y=.8;tank.position.y=28;wt.add(tank);sign(wt,{text:'OAK HOLLOW',bg:'',fg:'#2a4a6a',font:'block',border:false},6,1.4,{y:28,z:5.42});}
 // =========================================================== the live parts ================================================
 // Lamp heads (one mesh), pools of light under them (one mesh), lit signs and posters, shop rooms, fixtures, the marquee.
 const live2={lvl:[],pos:[],nor:[]};
 function addGeo(target,geo,matrix,lvl){const g=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(matrix);if(!g.attributes.normal)g.computeVertexNormals();const P=g.attributes.position,N=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<P.count;i++){target.pos.push(P.getX(i),P.getY(i),P.getZ(i));target.nor.push(N.getX(i),N.getY(i),N.getZ(i));target.lvl.push(lvl);if(target.uv)target.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}}
 function liveMesh(T,mat,name,parent=live){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(T.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(T.nor,3));g.setAttribute('lvl',new THREE.Float32BufferAttribute(T.lvl,1));
  if(T.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(T.uv,2));if(T.tint)g.setAttribute('tint',new THREE.Float32BufferAttribute(T.tint,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.name=name;m.frustumCulled=false;parent.add(m);return m;}
 const M4=new THREE.Matrix4(),warm=new THREE.Color(1,.78,.5),cool=new THREE.Color(.82,.9,1);
 {const heads={pos:[],nor:[],lvl:[]},pools={pos:[],nor:[],lvl:[],uv:[],tint:[]};
  const acorn=new THREE.LatheGeometry([[0,0],[.16,.04],[.24,.22],[.25,.42],[.2,.6],[.08,.72],[0,.74]].map(([x,y])=>new THREE.Vector2(x,y)),12),cobra=new THREE.BoxGeometry(.8,.16,.36),globe=new THREE.SphereGeometry(.24,12,8),shoe=new THREE.BoxGeometry(.7,.14,.5),wallp=new THREE.BoxGeometry(.32,.26,.2);
  const poolQuad=(cx,y,cz,r,lvl,tint)=>{for(const [a,b] of [[0,0],[1,1],[1,0],[0,0],[0,1],[1,1]]){pools.pos.push(cx+(a-.5)*2*r,y,cz+(b-.5)*2*r);pools.nor.push(0,1,0);pools.lvl.push(lvl);pools.uv.push(a,b);pools.tint.push(tint.r,tint.g,tint.b);}};
  for(const L of LAMPS){let p=lampPost.get(L.id),geo=acorn,R2=6.5,tint=warm,rot=0,wy=0;
   if(L.kind==='wall'){p={u:L.u,v:L.v+(L.face||1)*.12,y:townY(L.u,L.v)+3.3};geo=wallp;R2=5.5;tint=new THREE.Color(1,.86,.66);}
   if(!p&&L.conn){const q=connAt(L.s,CONN_X.tree-2.1);const t=TL(q.x,q.z);p={u:t.u,v:t.v,y:connY(L.s,CONN_X.tree)+7.9};}
   if(!p){continue;}
   if(L.kind==='cobra'){geo=cobra;R2=9;tint=new THREE.Color(1,.72,.42);}if(L.kind==='globe'){geo=globe;R2=5;}if(L.kind==='pole'){geo=shoe;R2=11;tint=new THREE.Color(1,.82,.6);}if(L.kind==='acorn'){wy=0;}
   M4.makeTranslation(p.u,p.y+wy,p.v);addGeo(heads,geo,M4,LV.lamp+L.id);
   const gy=L.conn?connY(L.s,CONN_X.tree-2.1):L.kind==='wall'?townY(L.u,L.v+(L.face||1)*1.5):townY(p.u,p.v);poolQuad(p.u,gy+.03,p.v+(L.kind==='wall'?(L.face||1)*1.6:0),R2,LV.lamp+L.id,tint);
   D.lamps.push({id:L.id,kind:L.kind,u:p.u,v:p.v,y:p.y,ground:gy,r:R2,color:tint.clone()});void rot;}
  D.headMesh=liveMesh(heads,lvMat({color:0xf4ead8,roughness:.4,emissive:0xffd8a0,emissiveIntensity:2.2},{flicker:.0}),'town-lamp-heads');
  D.poolMesh=liveMesh(pools,poolMaterial(),'town-lamp-pools');}
 // ceiling fixtures (troffers): emissive panels, level by section
 {const T={pos:[],nor:[],lvl:[]},panel=new THREE.BoxGeometry(1,.04,1);for(const f of D.fixtures){f.group.updateMatrixWorld(true);M4.copy(live.matrixWorld).invert().multiply(f.group.matrixWorld).multiply(new THREE.Matrix4().compose(new THREE.Vector3(f.x,f.y,f.z),new THREE.Quaternion(),new THREE.Vector3(f.w,1,f.d)));addGeo(T,panel,M4,f.lv);}
  D.fixMesh=liveMesh(T,lvMat({color:0xf2f2ee,roughness:.5,emissive:0xf4f6ff,emissiveIntensity:1.4},{flicker:.05}),'town-fixtures');}
 // the marquee: its letter boards (both faces and the end), and the rows of bulbs that chase round it
 {const m=D.marquee,g=m.group,uvA=signs.add(1024,128,(gg,w,h)=>{gg.fillStyle='#f6f0e0';gg.fillRect(0,0,w,h);gg.fillStyle='#1a1a1a';gg.textAlign='center';gg.textBaseline='middle';fit(gg,'SUMMER MOVIE NIGHTS · THE LAST DRIVE-IN 7:30',h*.42,w*.94,'bold',FAM.block);gg.fillText('SUMMER MOVIE NIGHTS · THE LAST DRIVE-IN 7:30',w/2,h*.3);fit(gg,'CLOSED TUESDAYS · OPENS THU 8/25',h*.36,w*.9,'bold',FAM.block);gg.fillText('CLOSED TUESDAYS · OPENS THU 8/25',w/2,h*.74);});
  const uvN=signs.add(1024,128,(gg,w,h)=>{gg.fillStyle='#8a2a1e';gg.fillRect(0,0,w,h);gg.fillStyle='#ffe6a8';gg.textAlign='center';gg.textBaseline='middle';gg.shadowColor='#ffd070';gg.shadowBlur=14;fit(gg,'THE LYRIC',h*.7,w*.6,'bold',FAM.serif);gg.fillText('THE LYRIC',w/2,h*.52);});
  quadInto(quads.lit,g,uvA,m.w-.6,.82,{y:.62,z:m.d/2+.02,lvl:LV.neon+NEON.marquee});quadInto(quads.lit,g,uvA,m.w-.6,.82,{y:.62,z:-m.d/2-.02,ry:Math.PI,lvl:LV.neon+NEON.marquee});
  for(const s of [-1,1])quadInto(quads.lit,g,uvN,m.d-.3,.82,{x:s*(m.w/2+.02),y:.62,ry:s*Math.PI/2,lvl:LV.neon+NEON.marquee});
  const bulbs={pos:[],nor:[],lvl:[]},bg=new THREE.SphereGeometry(.045,6,4);g.updateMatrixWorld(true);const toLive=new THREE.Matrix4().copy(live.matrixWorld).invert().multiply(g.matrixWorld);let n=0;
  for(const y of [1.16,.06]){for(let x=-m.w/2+.15;x<=m.w/2-.15;x+=.3){for(const z of [m.d/2+.05,-m.d/2-.05]){M4.copy(toLive).multiply(new THREE.Matrix4().makeTranslation(x,y,z));addGeo(bulbs,bg,M4,LV.neon+NEON.bulbs+((n++%6)/6)*.999);}}}
  {const b=D.blade.group;b.updateMatrixWorld(true);const tb=new THREE.Matrix4().copy(live.matrixWorld).invert().multiply(b.matrixWorld);for(let y=6.3;y<=13;y+=.32)for(const z of [.08,1.72])for(const x of [-.27,.27]){M4.copy(tb).multiply(new THREE.Matrix4().makeTranslation(x,y,z-.0));if(Math.abs(z-.9)>.6)addGeo(bulbs,bg,M4,LV.neon+NEON.bulbs+((n++%6)/6)*.999);}
   const uvB=signs.add(160,1024,(gg,w,h)=>{gg.fillStyle='#8a2a1e';gg.fillRect(0,0,w,h);gg.fillStyle='#fff0c0';gg.textAlign='center';gg.textBaseline='middle';gg.shadowColor='#ffd070';gg.shadowBlur=18;gg.font=`bold ${w*.8}px ${FAM.serif}`;[...'LYRIC'].forEach((ch,i)=>gg.fillText(ch,w/2,h*(.12+i*.19)));});
   for(const s of [-1,1])quadInto(quads.lit,b,uvB,1.3,6.6,{x:s*.26,y:9.6,z:.9,ry:s*Math.PI/2,lvl:LV.neon+NEON.blade});}
  D.bulbMesh=liveMesh(bulbs,lvMat({color:0xfff2d0,roughness:.3,emissive:0xffd890,emissiveIntensity:2.6},{chase:true}),'town-marquee-bulbs');}
 // the theater's upper windows (faint warm light inside, for the silhouettes to stand against: just over the dark glass)
 {const T={pos:[],nor:[],lvl:[]},pl=new THREE.PlaneGeometry(1,1);for(const s of D.silhouettes){s.group.updateMatrixWorld(true);M4.copy(live.matrixWorld).invert().multiply(s.group.matrixWorld).multiply(new THREE.Matrix4().compose(new THREE.Vector3(s.x,s.y,s.z+.04),new THREE.Quaternion(),new THREE.Vector3(s.w,s.h,1)));addGeo(T,pl,M4,LV.neon+NEON.lyricUpper);}
  D.upperGlow=liveMesh(T,lvMat({color:0x1a1410,roughness:1,emissive:0x8a5a34,emissiveIntensity:1}),'lyric-upper-glow');}
 // ---- every textured quad, now that the atlases are drawn ----
 signs.finish();covers.finish();rooms.finish();
 signMat.map=signs.tex;coverMat.map=covers.tex;roomMat.map=rooms.tex;roomMat.emissiveMap=rooms.tex;litSignMat.map=signs.tex;litSignMat.emissiveMap=signs.tex;
 if(!signs.tex){signMat.color.setHex(0x8a8070);litSignMat.color.setHex(0x8a8070);}if(!covers.tex)coverMat.color.setHex(0x5a5a6a);if(!rooms.tex)roomMat.color.setHex(0x9a9282);
 signMat.userData.keep=true;coverMat.userData.keep=true;
 const quadGeo=(list,withLvl,root)=>{const T={pos:[],nor:[],uv:[],lvl:[]};root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  for(const q of list){q.parent.updateMatrixWorld(true);const m=new THREE.Matrix4().copy(inv).multiply(q.parent.matrixWorld).multiply(q.m),w=q.w/2,h=q.h/2;const c=[[-w,-h],[w,-h],[w,h],[-w,h]].map(([x,y])=>new THREE.Vector3(x,y,0).applyMatrix4(m));const n=new THREE.Vector3(0,0,1).transformDirection(m);
   const uv=[[q.uv.u0,q.uv.v0],[q.uv.u1,q.uv.v0],[q.uv.u1,q.uv.v1],[q.uv.u0,q.uv.v1]];for(const i of [0,1,2,0,2,3]){T.pos.push(c[i].x,c[i].y,c[i].z);T.nor.push(n.x,n.y,n.z);T.uv.push(...uv[i]);T.lvl.push(q.lvl||0);}}return T;};
 // painted and printed signs (static, baked): one mesh per root, so it bakes with the rest
 for(const [root,filter] of [[out,q=>!isInside(q.parent)],[inn,q=>isInside(q.parent)]]){const T=quadGeo(quads.sign.filter(filter),false,root);if(T.pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(T.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(T.nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(T.uv,2));root.add(new THREE.Mesh(g,signMat));}
  const C2=quadGeo(quads.cover.filter(filter),false,root);if(C2.pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(C2.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(C2.nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(C2.uv,2));root.add(new THREE.Mesh(g,coverMat));}}
 function isInside(o){for(let p=o;p;p=p.parent)if(p===inn)return true;return false;}
 D.litMesh=liveMesh(quadGeo(quads.lit,true,live),litSignMat,'town-lit-signs');D.roomMesh=liveMesh(quadGeo(quads.room,true,live),roomMat,'town-shop-rooms');
 // the doors that open and shut (their cells are solid while shut: town-plan DOORS)
 for(const [k,d] of Object.entries(DOORS)){const w=Math.max(d.u1-d.u0,d.v1-d.v0),alongU=(d.u1-d.u0)>=(d.v1-d.v0),cu=(d.u0+d.u1)/2,cv=(d.v0+d.v1)/2,y=townY(cu,cv);
  const hinge=new THREE.Group();hinge.position.set(alongU?d.u0+.04:cu,y,alongU?cv:d.v0+.04);live.add(hinge);const steel=k==='video-back'||k==='laundry-back'||k==='laundry-side';
  const leaf=new THREE.Mesh(new THREE.BoxGeometry(alongU?w-.08:.05,2.2,alongU?.05:w-.08),K.mat(steel?0x5a5e5c:0x3a3a36,{roughness:.5,metalness:.4}));leaf.position.set(alongU?(w-.08)/2:0,1.1,alongU?0:(w-.08)/2);hinge.add(leaf);
  if(!steel){const gl=new THREE.Mesh(new THREE.BoxGeometry(alongU?w-.3:.02,1.7,alongU?.02:w-.3),glassDark);gl.position.copy(leaf.position).add(new THREE.Vector3(alongU?0:.02,.1,alongU?.02:0));hinge.add(gl);}
  else{const bar=new THREE.Mesh(new THREE.BoxGeometry(alongU?w-.3:.06,.06,alongU?.06:w-.3),K.mat(0xb8b8b0,{metalness:.6,roughness:.4}));bar.position.copy(leaf.position).add(new THREE.Vector3(0,-.1,0));bar.position[alongU?'z':'x']+=.06;hinge.add(bar);}
  D.doors[k]={hinge,alongU,open:d.open,cur:d.open,sign:k==='video-front'||k==='library-front'?1:-1};}
 // the real lights: a few point lights, given each frame to the lit things nearest the camera (attached only in Chapter Four)
 for(let i=0;i<5;i++){const L=new THREE.PointLight(0xffd8a0,0,12,1.6);L.name='town-light-'+i;D.lights.push({L,src:null,w:0});}
 // ---- what the story moves: a few scene objects it needs ----
 W.town={...W.town,D,live,levels,LV,NEON,out,inn,far,timeU,signsAtlas:signs,coversAtlas:covers,FILMS,flyerArt,coverArt,signArt};
 return W.town;
 // A television: cabinet and a curved screen with its own CRT material. ry turns it to face the room.
 function tvSet(parent,x,y,z,s,{ry=0,bracket=false}={}){const g=at(parent,x,y,z,ry),body=paint(0x2a2a2c);B(g,0,0,-s*.36,s*1.05,s*.8,s*.72,body);B(g,0,0,-s*.05,s*1.08,s*.84,s*.12,body);
  if(bracket){B(g,0,-s*.46,-s*.4,s*.7,.04,s*.7,metal(0x3a3a3a));B(g,0,-s*.2,-s*.85,.06,s*.7,.06,metal(0x3a3a3a));}
  const mat=crtMaterial(),scr=new THREE.Mesh(new THREE.PlaneGeometry(s*.86,s*.64,8,6),mat);const P=scr.geometry.attributes.position;for(let i=0;i<P.count;i++){const px=P.getX(i)/(s*.43),py=P.getY(i)/(s*.32);P.setZ(i,.02*s*(1-px*px*.5-py*py*.5));}P.needsUpdate=true;
  scr.position.set(0,0,.012);g.add(scr);const tv={group:g,screen:scr,mat,s,state:'off',pos:new THREE.Vector3()};scr.removeFromParent();g.add(scr);
  // (the screen is kept out of the bake: it moves to the live root, at the same place)
  g.updateMatrixWorld(true);const m=new THREE.Matrix4().copy(live.matrixWorld).invert().multiply(scr.matrixWorld);scr.removeFromParent();scr.matrix.copy(m);scr.matrix.decompose(scr.position,scr.quaternion,scr.scale);live.add(scr);return tv;}
}
const HOUSE_WALLS=[0xc9bea6,0xb9ab92,0x9ea9a2,0xd4cfc1,0xa9b2b6,0xc6b28c,0x8f9c86,0xb49b84,0xdcd6c8];
