// Alex's room (Chapter Three): upstairs, the front corner over the garage. The window that was lit all
// of Chapter One's night is its front window; a second window looks west over the garage roof toward
// the creek's trees and the easement behind the yards. An ordinary twelve-year-old's room in 2011:
// unmade bed, a box fan, a small TV and a console on the dresser, posters, a desk under the window,
// clothes on the floor, a helmet, a backpack, cords. Nothing in it explains anything.
//
// Built into the house's own (draped) group, in the house frame: x across the width, +z toward the
// street, heights above the lot's ground. Only seen from inside: from outside the windows are glass.
import * as THREE from './three.module.js';
import {ALEX_ROOM as R} from './layout.js';
import {seeded} from './kit.js';

export function buildAlexRoom(W,P,g,{t,win,side}){const {K}=W,rand=seeded(1919),W2=P.w/2,D2=P.depth/2,F=R.floor,H=R.height;
 const x0=R.x0,x1=W2-t,zf=D2-t,zb=zf-R.depth,y0=F,y1=F+H;
 // Paint and carpet carry a little light of their own: the room is in the house's shadow, lit by the sky
 // through two windows; this stands in for that bounce until the art pass lights it properly.
 const paint=new THREE.MeshStandardMaterial({color:0xb7c3c8,emissive:0x8d969a,emissiveIntensity:.2,roughness:.95});paint.userData.keep=true;
 const ceiling=new THREE.MeshStandardMaterial({color:0xe8e4da,emissive:0xb8b4aa,emissiveIntensity:.22,roughness:.95});ceiling.userData.keep=true;
 const carpet=new THREE.MeshStandardMaterial({color:0x7d7462,emissive:0x4a453a,emissiveIntensity:.22,roughness:1});carpet.userData.keep=true;
 const quad=(a,b,c,d,m,name='')=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);if(name)mesh.name=name;g.add(mesh);return mesh;};
 // A wall facing into the room with one rectangular opening: up to four quads round it. (u: along the
 // wall from a to b, measured in meters; v: height.) Normal faces `into`.
 function wall(a,b,into,hole,m){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,P3=(u,v)=>[a[0]+dx*u+into[0]*.006,v,a[1]+dz*u+into[1]*.006];
  const rect=(u0,u1,v0,v1)=>{if(u1-u0<.005||v1-v0<.005)return;const p=[P3(u0,v0),P3(u1,v0),P3(u1,v1),P3(u0,v1)];
   // Winding so the face points `into` the room.
   const n=[-(dz),0,dx];const flip=n[0]*into[0]+n[2]*into[1]<0;quad(...(flip?[p[0],p[3],p[2],p[1]]:p),m);};
  if(!hole){rect(0,L,y0,y1);return;}
  rect(0,hole[0],y0,y1);rect(hole[1],L,y0,y1);rect(hole[0],hole[1],y0,hole[2]);rect(hole[0],hole[1],hole[3],y1);}
 // Front wall (z = zf) along x from x0 to x1, the front window's opening in it; side wall (x = x1) along z.
 wall([x0,zf],[x1,zf],[0,-1],[win.x-win.w/2-x0,win.x+win.w/2-x0,win.y-win.h/2,win.y+win.h/2],paint);
 wall([x1,zf],[x1,zb],[-1,0],[zf-(side.z+side.w/2),zf-(side.z-side.w/2),side.y-side.h/2,side.y+side.h/2],paint);
 wall([x1,zb],[x0,zb],[0,1],null,paint);wall([x0,zb],[x0,zf],[1,0],null,paint);
 quad([x0,y0,zb],[x0,y0,zf],[x1,y0,zf],[x1,y0,zb],carpet,'alex-room-floor');quad([x0,y1,zb],[x1,y1,zb],[x1,y1,zf],[x0,y1,zf],ceiling);
 // Baseboards, the window reveals and sills, a flush ceiling light.
 const trim=0xe9e4d6;for(const [ax,az,bx,bz] of [[x0,zb+.01,x1,zb+.01],[x0+.01,zb,x0+.01,zf]]){K.box(g,(ax+bx)/2,y0+.05,(az+bz)/2,Math.max(.012,Math.abs(bx-ax)),.1,Math.max(.012,Math.abs(bz-az)),trim);}
 K.box(g,(x0+x1)/2,y0+.05,zf-.01,x1-x0,.1,.012,trim);K.box(g,x1-.01,y0+.05,(zb+zf)/2,.012,.1,zf-zb,trim);
 {const r=t+.02;// reveals through the wall's thickness, a sill inside
  K.box(g,win.x,win.y-win.h/2-.01,zf+r/2-.02,win.w+.04,.03,r,trim);K.box(g,win.x,win.y+win.h/2+.01,zf+r/2-.02,win.w+.04,.03,r,trim);for(const e of [-1,1])K.box(g,win.x+e*(win.w/2+.01),win.y,zf+r/2-.02,.03,win.h,r,trim);
  K.box(g,win.x,win.y-win.h/2-.03,zf-.06,win.w+.16,.03,.14,trim);
  K.box(g,x1+r/2-.02,side.y-side.h/2-.01,side.z,r,.03,side.w+.04,trim);K.box(g,x1+r/2-.02,side.y+side.h/2+.01,side.z,r,.03,side.w+.04,trim);for(const e of [-1,1])K.box(g,x1+r/2-.02,side.y,side.z+e*(side.w/2+.01),r,side.h,.03,trim);
  K.box(g,x1-.06,side.y-side.h/2-.03,side.z,.14,.03,side.w+.16,trim);}
 // Glass seen from inside: faint, so the street and the trees read through it.
 const glass=new THREE.MeshStandardMaterial({color:0xcfe0e6,transparent:true,opacity:.1,roughness:.1,metalness:.1,depthWrite:false,side:THREE.DoubleSide});
 {const a=new THREE.Mesh(new THREE.PlaneGeometry(win.w-.02,win.h-.02),glass);a.position.set(win.x,win.y,zf+t*.55);a.rotation.y=Math.PI;g.add(a);
  const b=new THREE.Mesh(new THREE.PlaneGeometry(side.w-.02,side.h-.02),glass);b.position.set(x1+t*.55,side.y,side.z);b.rotation.y=-Math.PI/2;g.add(b);}
 // Blinds pulled most of the way up, bunched under the head of each window; the side one hangs a little crooked.
 for(let k=0;k<6;k++){K.box(g,win.x,win.y+win.h/2-.05-k*.024,zf-.03,win.w-.04,.018,.05,0xe2ddcf);K.box(g,x1-.03,side.y+side.h/2-.05-k*.024-k*.004,side.z,.05,.018,side.w-.04,0xe2ddcf);}
 K.rod(g,[win.x+.4,win.y+win.h/2-.18,zf-.05],[win.x+.4,win.y-.2,zf-.05],.003,0xd8d2c4,.003,3);
 K.cyl(g,(x0+x1)/2,y1-.03,(zb+zf)/2,.22,.05,0xf1ece0,16);
 // ---- furniture ------------------------------------------------------------------------------------
 const wood=0x5f4a36,box=(x,y,z,w,h,d,c)=>K.box(g,x,y,z,w,h,d,c),rbox=(x,y,z,w,h,d,r,c)=>K.rbox(g,x,y,z,w,h,d,r,c);
 // The bed, along the back wall with its head against the outside wall; sheets kicked down, the
 // comforter half on the floor, the pillow pushed into the corner.
 const bx0=x1-1.98,bz0=zb+.04,bx1=x1-.03,bz1=zb+1.04;
 box((bx0+bx1)/2,y0+.17,(bz0+bz1)/2,bx1-bx0,.24,bz1-bz0,wood);box(bx1-.03,y0+.45,(bz0+bz1)/2,.06,.78,bz1-bz0+.04,wood);
 rbox((bx0+bx1)/2-.02,y0+.36,(bz0+bz1)/2,bx1-bx0-.1,.16,bz1-bz0-.06,.05,0xd8d3c6);
 rbox(bx1-.33,y0+.5,bz0+.35,.5,.13,.36,.05,0xeae5d8).rotation.y=.35;
 for(const [x,z,w,d,ry,c] of [[-.15,.06,1.1,.82,.08,0x34507a],[.3,-.12,.62,.5,-.3,0x34507a],[-.62,.18,.5,.42,.5,0x2e4669]])rbox((bx0+bx1)/2+x,y0+.48+rand()*.05,(bz0+bz1)/2+z,w,.09+rand()*.04,d,.04,c).rotation.y=ry;
 rbox(bx0+.55,y0+.22,bz1+.12,.75,.28,.26,.05,0x34507a).rotation.z=.25;// the comforter slid over the edge
 rbox((bx0+bx1)/2+.1,y0+.465,(bz0+bz1)/2-.1,.95,.03,.7,.01,0xc9cfd6);
 // Nightstand: a lamp, a cheap alarm clock, a glass with a little water in it.
 {const nx=bx0-.28,nz=zb+.3;box(nx,y0+.28,nz,.44,.56,.4,0x6b5236);box(nx,y0+.4,nz+.205,.36,.01,.01,0x3a2d22);
  K.cyl(g,nx-.1,y0+.6,nz-.05,.06,.06,0x3a3a3a,10);K.rod(g,[nx-.1,y0+.6,nz-.05],[nx-.1,y0+.86,nz-.05],.01,0x8a8a86,.01,5);K.cyl(g,nx-.1,y0+.92,nz-.05,.12,.14,0xe9dfc4,12);
  box(nx+.1,y0+.6,nz+.06,.15,.075,.07,0x1d1d1f);
  const tex=clockTexture(),face=new THREE.Mesh(new THREE.PlaneGeometry(.12,.045),new THREE.MeshBasicMaterial({map:tex,color:tex?0xffffff:0x5a1210}));face.position.set(nx+.1,y0+.6,nz+.097);g.add(face);
  K.cyl(g,nx+.05,y0+.63,nz-.1,.03,.09,0xd7e2e6,10);}
 // The desk under the front window and its chair, pushed back as if he got up from it.
 const dx0=win.x-.95,dx1=win.x+.75,dz0=zf-.6,dz1=zf-.02,dy=y0+.74;
 box((dx0+dx1)/2,dy-.02,(dz0+dz1)/2,dx1-dx0,.04,dz1-dz0,0x7a6248);for(const [x,z] of [[dx0+.04,dz0+.04],[dx1-.04,dz0+.04],[dx0+.04,dz1-.04],[dx1-.04,dz1-.04]])box(x,y0+.36,z,.04,.72,.04,0x6b5539);
 box(dx1-.22,y0+.42,(dz0+dz1)/2,.38,.6,dz1-dz0-.04,0x6b5539);
 {const cx=win.x-.15,cz=dz0-.45;K.cyl(g,cx,y0+.05,cz,.28,.03,0x2a2a2c,5);K.cyl(g,cx,y0+.25,cz,.025,.4,0x3a3a3c,8);rbox(cx,y0+.48,cz,.46,.08,.44,.03,0x2d2f33).rotation.y=.4;const back=rbox(cx-.08,y0+.82,cz-.2,.42,.5,.06,.03,0x2d2f33);back.rotation.y=.4;}
 // On the desk: a spiral notebook, pencils in a cup, a stack of game cases, a sports-drink bottle, a
 // desk lamp, a charger cord running off the back, a jar of coins. (The phone is the story's: chapter3.js.)
 box(win.x+.3,dy+.006,dz0+.28,.22,.012,.28,0xe6e1d4);box(win.x+.3-.11,dy+.012,dz0+.28,.01,.014,.28,0x9a9a96);
 K.cyl(g,dx0+.18,dy+.06,dz1-.12,.04,.12,0x3d5a7a,10);for(const [x,z,c] of [[.01,0,0xd8b23a],[-.012,.01,0x2d5a8a],[0,-.012,0xc23a2a]])K.rod(g,[dx0+.18+x,dy+.06,dz1-.12+z],[dx0+.18+x*2.5,dy+.2,dz1-.12+z*2.5],.004,c,.004,5);
 for(let k=0;k<5;k++)box(dx0+.42,dy+.008+k*.016,dz1-.2,.14,.014,.19,[0x2c5d34,0x1f3b6a,0x2c5d34,0x1d1d1f,0x2c5d34][k]).rotation.y=(rand()-.5)*.3;
 K.cyl(g,dx1-.12,dy+.1,dz1-.15,.032,.2,0x6aa0c8,10);K.cyl(g,dx1-.12,dy+.21,dz1-.15,.022,.025,0xe9a12a,10);
 K.cyl(g,dx1-.35,dy+.01,dz1-.12,.07,.02,0x2a2a2c,12);K.rod(g,[dx1-.35,dy+.02,dz1-.12],[dx1-.42,dy+.32,dz1-.2],.01,0x2a2a2c,.01,5);K.rod(g,[dx1-.42,dy+.32,dz1-.2],[dx1-.25,dy+.42,dz1-.32],.01,0x2a2a2c,.01,5);K.cyl(g,dx1-.25,dy+.38,dz1-.34,.07,.1,0x2a2a2c,10);
 K.cyl(g,dx0+.32,dy+.06,dz1-.38,.045,.12,0xc8d6d8,10);for(let k=0;k<6;k++)K.cyl(g,dx0+.32+(rand()-.5)*.04,dy+.01+k*.008,dz1-.38+(rand()-.5)*.04,.011,.004,0xb08a3a,8);
 K.rod(g,[win.x-.2,dy+.004,dz1-.05],[win.x-.4,dy+.004,dz1-.3],.004,0x1a1a1a,.004,3);K.rod(g,[win.x-.4,dy+.004,dz1-.3],[dx1,dy-.3,dz1-.1],.004,0x1a1a1a,.004,3);
 // A shelf over the desk: a little-league trophy, a model car, a paperback.
 {const sy=y0+1.6,sz=zf-.12;box(dx0+.4,sy,sz,.9,.025,.2,0x7a6248);K.cyl(g,dx0+.1,sy+.08,sz,.03,.12,0xc9a64a,8);box(dx0+.1,sy+.02,sz,.07,.02,.07,0x2a2a2c);box(dx0+.4,sy+.04,sz,.17,.05,.07,0xb83a2a);box(dx0+.68,sy+.07,sz,.04,.12,.09,0x3a6a5a);}
 // The dresser on the inside wall: a small TV, the console, a controller, a cup of coins and caps.
 const rx0=x0+.02,rz0=zf-1.82,rz1=zf-.55;
 box(rx0+.25,y0+.47,(rz0+rz1)/2,.5,.94,rz1-rz0,0x8a6c4a);for(let k=0;k<3;k++){box(rx0+.505,y0+.2+k*.28,(rz0+rz1)/2,.012,.22,rz1-rz0-.08,0x6b5236);K.cyl(g,rx0+.52,y0+.3+k*.28-.02,(rz0+rz1)/2,.012,.02,0xc9b27a,6,[0,0,Math.PI/2]);}
 {const tz=(rz0+rz1)/2+.1;rbox(rx0+.26,y0+1.17,tz,.44,.44,.48,.04,0x2b2c2e);const scr=box(rx0+.485,y0+1.18,tz,.01,.32,.38,0x1c2226);scr.name='alex-room-tv';
  box(rx0+.26,y0+.985,rz0+.22,.25,.07,.3,0xe8e7e1);box(rx0+.395,y0+.99,rz0+.22,.005,.02,.12,0x6aa84a);}
 // The controller on the bed with its cord trailing to the console.
 {const cx=bx0+.5,cz=bz1-.2,cy=y0+.47;rbox(cx,cy,cz,.15,.04,.1,.02,0xe6e6e0).rotation.y=.6;for(const e of [-1,1])K.ball(g,cx+e*.05,cy+.005,cz+.04,.035,0xe6e6e0,[1,.6,1]);
  const pts=[[cx-.05,cy,cz],[bx0-.02,y0+.3,cz+.2],[bx0-.2,y0+.02,cz+.6],[rx0+.6,y0+.02,rz0+.2],[rx0+.5,y0+.95,rz0+.22]];for(let k=0;k<pts.length-1;k++)K.rod(g,pts[k],pts[k+1],.004,0x2a2a2a,.004,3);}
 // The box fan on the floor by the side window, turned toward the bed.
 {const f=K.group(g,x1-.42,(side.z-side.w/2-.45),-2.3,y0);rbox(0,.28,0,.52,.52,.13,.02,0xd9d4c6);const grill=box(0,.28,.068,.44,.44,.005,0x4a4c4c);grill.name='alex-room-fan';
  for(let k=0;k<5;k++)K.box(f,0,.12+k*.08,.072,.44,.006,.004,0x9a9a96);K.cyl(f,0,.28,.07,.05,.01,0x9a9a96,10,[Math.PI/2,0,0]);K.box(f,.17,.53,0,.1,.03,.08,0x6a6a66);}
 // Floor: jeans and t-shirts by the bed, sneakers by the door, a backpack against the wall, his
 // helmet, a stack of comics, socks, a basketball under the desk.
 for(const [x,z,s,c] of [[bx0-.05,bz1+.5,.22,0x3e5f8a],[bx0+.2,bz1+.62,.18,0x6c6c6a],[bx0-.3,bz1+.35,.16,0x8a2f2a],[bx0+.05,bz1+.32,.14,0xd8d4c4]])K.ball(g,x,y0+s*.25,z,s,c,[1.6,.45,1.2]);
 box(bx0-.2,y0+.03,bz1+.75,.55,.05,.2,0x2f4a6a).rotation.y=.4;
 for(const [x,z,a] of [[x0+.35,zb+1.3,.3],[x0+.52,zb+1.42,.1]]){const s=K.group(g,x,z,a,y0);rbox(0,.045,0,.11,.09,.27,.03,0xe8e6de);box(0,.012,0,.115,.025,.28,0x9a9a96);box(0,.07,.05,.09,.02,.12,0x3a5a8a);}
 {const p=rbox(x0+.2,y0+.25,zb+1.85,.3,.45,.18,.06,0x2f4f7a);p.rotation.y=.2;p.rotation.z=-.15;box(x0+.32,y0+.33,zb+1.85,.04,.25,.12,0x24405f);}
 {const hx=rx0+.75,hz=rz1-.15;const m=new THREE.Mesh(new THREE.SphereGeometry(.14,12,6,0,Math.PI*2,0,Math.PI/2),K.mat(0xc23f2c,{roughness:.5}));m.position.set(hx,y0,hz);m.scale.set(1,.9,1.25);m.rotation.y=.7;g.add(m);
  for(let k=0;k<3;k++)box(hx+(k-1)*.05,y0+.1,hz,.02,.06,.2,0x1d1d1f);}
 for(let k=0;k<6;k++)box(dx0-.25,y0+.01+k*.012,dz0-.25,.2,.01,.28,[0xd84a2a,0x3a6aa8,0xe8d23a,0x5a8a3a,0xd84a2a,0xe6e2d6][k]).rotation.y=rand()*.4;
 K.ball(g,dx1-.3,y0+.12,dz0+.25,.12,0xc8642a,[1,1,1],true);
 K.ball(g,x0+1.2,y0+.02,zb+2.4,.05,0xe6e2d8,[1.6,.3,.8]);
 // Walls: posters (a shuttle launch, a BMX rider, a band-tee-style skull nobody would let him hang
 // downstairs), a calendar on August, a corkboard with ticket stubs.
 const poster=(x,y,z,ry,w,h,kind)=>{const tex=posterTexture(kind),m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({color:tex?0xffffff:0x8a8a86,map:tex,roughness:.9,emissive:0x303030,emissiveMap:tex,emissiveIntensity:.35}));m.position.set(x,y,z);m.rotation.y=ry;m.name='alex-room-poster';g.add(m);return m;};
 poster(bx0+.9,y0+1.55,zb+.012,0,.6,.86,'shuttle');poster(bx0+.12,y0+1.48,zb+.012,0,.5,.7,'bmx');
 poster(x0+.012,y0+1.55,(rz0+rz1)/2+.05,Math.PI/2,.62,.46,'calendar');poster(x0+.012,y0+1.42,zb+2.1,Math.PI/2,.5,.66,'band');
 {const cb=K.group(g,x1-.012,side.z+side.w/2+.62,-Math.PI/2,y0+1.45);K.box(cb,0,0,0,.6,.44,.02,0xa8875a);for(const [x,y,w,h,c] of [[-.15,.08,.12,.07,0xe6c84a],[.05,.1,.16,.1,0xe8e4d8],[.18,-.08,.1,.14,0x8ac0e0],[-.12,-.1,.18,.08,0xd8a8a0]])K.box(cb,x,y,.012,w,h,.004,c);}
 // The door to the hall, shut, on the inside wall near the bed.
 const door={z:zb+1.08,w:.86};box(x0+.012,y0+1.02,door.z,.03,2.04,door.w,0xe6e1d4);for(const e of [-1,1])box(x0+.02,y0+1.04,door.z+e*(door.w/2+.03),.035,2.1,.05,trim);box(x0+.02,y0+2.1,door.z,.035,.05,door.w+.1,trim);
 K.ball(g,x0+.05,y0+.98,door.z+door.w/2-.1,.03,0xc9b27a);
 // Things you cannot walk through (house frame rectangles), and where the story's moments happen.
 const blocks=[[bx0-.05,x1,zb,bz1+.06],[bx0-.53,bx0-.05,zb,zb+.52],[dx0-.04,dx1+.04,dz0-.04,zf],[win.x-.55,win.x+.25,dz0-.72,dz0-.15],[rx0-.05,rx0+.56,rz0-.03,rz1+.03],[x1-.72,x1,side.z-side.w/2-.62,side.z-side.w/2-.24]];
 W.interiors['alex-room']={P,x0,x1,z0:zb,z1:zf,floor:F,height:H,blocks,
  door:{x:x0+.55,z:door.z,face:{x:x0,z:door.z}},phone:{x:win.x-.42,y:dy+.012,z:dz0+.3},
  sideWindow:{x:x1-.62,z:side.z,look:{x:x1+8,z:side.z-3,y:side.y-.6},glass:{x:x1,z:side.z,y:side.y}},frontWindow:{x:win.x,z:dz0-.55,glass:{x:win.x,z:zf,y:win.y}},
  standJamie:{x:dx0-.3,z:dz0-.55},standSam:{x:x0+.75,z:zb+1.9},enter:{x:x0+.7,z:door.z+.1},deskStand:{x:win.x+.55,z:dz0-.45}};
}

function canvas(w,h,draw){try{const c=document.createElement('canvas'),g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}catch{return null;}}
function clockTexture(){return canvas(96,36,(g,w,h)=>{g.fillStyle='#1a0504';g.fillRect(0,0,w,h);g.fillStyle='#ff3a24';g.font='bold 28px monospace';g.textAlign='center';g.fillText('9:47',w/2,28);});}
function posterTexture(kind){return canvas(128,176,(g,w,h)=>{
 if(kind==='shuttle'){const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#1a2a4a');sky.addColorStop(1,'#d27a3a');g.fillStyle=sky;g.fillRect(0,0,w,h);g.fillStyle='#e8e4dc';g.fillRect(58,40,12,70);g.beginPath();g.moveTo(58,40);g.lineTo(64,24);g.lineTo(70,40);g.fill();g.fillStyle='#c25a2a';g.fillRect(52,62,8,46);g.fillRect(68,62,8,46);
  g.fillStyle='rgba(255,230,180,.85)';g.beginPath();g.ellipse(64,128,26,22,0,0,7);g.fill();g.fillStyle='rgba(240,240,236,.5)';g.beginPath();g.ellipse(64,150,50,20,0,0,7);g.fill();g.fillStyle='#f2efe6';g.font='bold 15px Arial';g.textAlign='center';g.fillText('LIFTOFF',64,170);}
 else if(kind==='bmx'){g.fillStyle='#e8d23a';g.fillRect(0,0,w,h);g.strokeStyle='#161616';g.lineWidth=5;g.beginPath();g.arc(38,112,20,0,7);g.stroke();g.beginPath();g.arc(92,112,20,0,7);g.stroke();g.beginPath();g.moveTo(38,112);g.lineTo(62,96);g.lineTo(92,112);g.moveTo(62,96);g.lineTo(80,80);g.stroke();
  g.fillStyle='#161616';g.beginPath();g.arc(66,52,9,0,7);g.fill();g.fillRect(58,60,14,26);g.font='bold 22px Arial';g.textAlign='center';g.fillText('RIDE',64,160);}
 else if(kind==='band'){g.fillStyle='#141414';g.fillRect(0,0,w,h);g.fillStyle='#d8d4c8';g.beginPath();g.ellipse(64,72,30,34,0,0,7);g.fill();g.fillStyle='#141414';g.beginPath();g.ellipse(52,70,8,10,0,0,7);g.ellipse(76,70,8,10,0,0,7);g.fill();g.fillRect(56,96,4,10);g.fillRect(64,96,4,10);
  g.fillStyle='#c23a2a';g.font='bold 20px Impact, Arial';g.textAlign='center';g.fillText('STATIC',64,138);g.fillText('NOISE',64,160);}
 else{g.fillStyle='#f4f1e8';g.fillRect(0,0,w,h);g.fillStyle='#2a5a8a';g.fillRect(0,0,w,40);g.fillStyle='#f4f1e8';g.font='bold 17px Arial';g.textAlign='center';g.fillText('AUGUST 2011',64,27);
  g.fillStyle='#3a3a3a';g.font='9px Arial';const days='SMTWTFS';for(let i=0;i<7;i++)g.fillText(days[i],10+i*18,54);let d=1;for(let r=0;r<5;r++)for(let c=0;c<7;c++){if(r===0&&c<1)continue;if(d>31)break;g.fillText(String(d++),10+c*18,72+r*20);}
  g.strokeStyle='#bbb';g.lineWidth=1;for(let r=0;r<6;r++){g.beginPath();g.moveTo(2,60+r*20);g.lineTo(126,60+r*20);g.stroke();}}});}
