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
import {artSurface} from './art-surfaces.js';

// Alex's bike helmet: the same one on his desk in the morning and, that night, somewhere it cannot be (chapter3.js).
// Red shell, a white stripe down the middle, black vents, his number (17) in white on both sides, the straps hanging.
let helmetTex=null;
export function makeHelmet(){const g=new THREE.Group();g.name='alex-helmet';const red=new THREE.MeshStandardMaterial({color:0xc2321f,roughness:.42,metalness:.05}),black=new THREE.MeshStandardMaterial({color:0x18181a,roughness:.7}),white=new THREE.MeshStandardMaterial({color:0xece8de,roughness:.5});
 const shell=new THREE.Mesh(new THREE.SphereGeometry(.135,40,20,0,Math.PI*2,0,Math.PI/2),red);shell.scale.set(1,.86,1.24);g.add(shell);
 const foam=new THREE.Mesh(new THREE.SphereGeometry(.123,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x353637,roughness:1,side:THREE.BackSide}));foam.scale.copy(shell.scale);g.add(foam);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.135,.012,6,24),black);rim.rotation.x=Math.PI/2;rim.scale.set(1,1.24,1);rim.position.y=.004;g.add(rim);
 const stripe=new THREE.Mesh(new THREE.SphereGeometry(.137,6,10,Math.PI/2-.11,.22,0,Math.PI/2),white);stripe.scale.set(1,.86,1.24);g.add(stripe);
 for(const x of [-.07,.07])for(const z of [-.05,.06]){const v=new THREE.Mesh(new THREE.BoxGeometry(.022,.02,.075),black);v.position.set(x*.8,.104,z);v.rotation.z=-x*2.2;g.add(v);}
 const peak=new THREE.Mesh(new THREE.BoxGeometry(.17,.012,.05),black);peak.position.set(0,.03,-.17);peak.rotation.x=-.25;g.add(peak);
 if(helmetTex===undefined||helmetTex===null){try{const c=document.createElement('canvas'),x=c.getContext?.('2d');if(x){c.width=64;c.height=64;x.clearRect(0,0,64,64);x.fillStyle='#f1ede2';x.beginPath();x.arc(32,32,29,0,7);x.fill();x.fillStyle='#1c1c1e';x.font='bold 34px Arial';x.textAlign='center';x.fillText('17',32,44);
   helmetTex=new THREE.CanvasTexture(c);helmetTex.colorSpace=THREE.SRGBColorSpace;}else helmetTex=false;}catch{helmetTex=false;}}
 for(const e of [-1,1]){const d=new THREE.Mesh(new THREE.CircleGeometry(.045,16),helmetTex?new THREE.MeshStandardMaterial({map:helmetTex,transparent:true,roughness:.5}):white);d.position.set(e*.118,.06,0);d.rotation.y=e*Math.PI/2;d.rotation.x=0;g.add(d);
  const strap=new THREE.Mesh(new THREE.BoxGeometry(.008,.11,.014),black);strap.position.set(e*.11,-.05,.01);strap.rotation.z=e*.2;g.add(strap);}
 const buckle=new THREE.Mesh(new THREE.BoxGeometry(.033,.014,.021),black);buckle.position.set(.073,-.097,.011);g.add(buckle);
 for(const e of [-1,1]){const pad=new THREE.Mesh(new THREE.SphereGeometry(.03,16,10),black);pad.position.set(e*.065,.035,.019);pad.scale.set(.35,.45,2.9);g.add(pad);}
 return g;}
export function buildAlexRoom(W,P,g,{t,win,side}){const {K}=W,roomBefore=new Set(g.children),rand=seeded(1919),W2=P.w/2,D2=P.depth/2,F=R.floor,H=R.height;
 const x0=R.x0,x1=W2-t,zf=D2-t,zb=zf-R.depth,y0=F,y1=F+H;
 // Paint and carpet carry a little light of their own: the room is in the house's shadow, lit by the sky
 // through two windows; this stands in for that bounce until the art pass lights it properly.
 const paint=new THREE.MeshStandardMaterial({color:0xb7c3c8,emissive:0x8d969a,emissiveIntensity:.065,roughness:.95});paint.userData.keep=true;artSurface(paint,'plaster');
 const ceiling=new THREE.MeshStandardMaterial({color:0xe8e4da,emissive:0xb8b4aa,emissiveIntensity:.09,roughness:.95});ceiling.userData.keep=true;
 const carpet=new THREE.MeshStandardMaterial({color:0x7d7462,emissive:0x4a453a,emissiveIntensity:.065,roughness:1});carpet.userData.keep=true;artSurface(carpet,'carpet');
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
 K.cyl(g,(x0+x1)/2,y1-.025,(zb+zf)/2,.23,.05,0xb8b9b3,40);
 K.ball(g,(x0+x1)/2,y1-.055,(zb+zf)/2,.215,0xf1ece0,[1,.18,1],true);
 // ---- furniture ------------------------------------------------------------------------------------
 const wood=0x5f4a36,box=(x,y,z,w,h,d,c)=>K.box(g,x,y,z,w,h,d,c),rbox=(x,y,z,w,h,d,r,c)=>K.rbox(g,x,y,z,w,h,d,r,c);
 // The bed, along the back wall with its head against the outside wall; sheets kicked down, the
 // comforter half on the floor, the pillow pushed into the corner.
 const bx0=x1-1.98,bz0=zb+.04,bx1=x1-.03,bz1=zb+1.04;
 box((bx0+bx1)/2,y0+.17,(bz0+bz1)/2,bx1-bx0,.24,bz1-bz0,wood);box(bx1-.03,y0+.45,(bz0+bz1)/2,.06,.78,bz1-bz0+.04,wood);
 rbox((bx0+bx1)/2-.02,y0+.36,(bz0+bz1)/2,bx1-bx0-.1,.16,bz1-bz0-.06,.05,0xd8d3c6);
 rbox(bx1-.33,y0+.5,bz0+.35,.5,.13,.36,.05,0xeae5d8).rotation.y=.35;
 // A continuous cloth surface: kicked-down duvet, folded sheet, a weighted hem.
 const fabric=artSurface(new THREE.MeshStandardMaterial({color:0x3c5578,roughness:.98,side:THREE.DoubleSide}),'textile');fabric.userData.keep=true;
 const cloth=(xa,xb,za,zb2,height,drop,material)=>{const nx=48,nz=32,pts=[],uv=[],idx=[];
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const u=i/nx,v=j/nz,x=xa+(xb-xa)*u,z=za+(zb2-za)*v;
   const fold=(material===linen?.08:1)*(.018*Math.sin(u*23+v*8)+.012*Math.sin(u*47-v*19)+.009*Math.sin(v*38+u*7));
   const hang=Math.max(0,z-bz1+.015)/Math.max(.01,zb2-bz1+.015);
   pts.push(x+.007*Math.sin(v*21),height+fold-.31*hang*hang*drop,z);uv.push(u,v);
   if(i<nx&&j<nz){const a=i*(nz+1)+j,b=a+nz+1;idx.push(a,b,a+1,a+1,b,b+1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,material);m.name='alex-room-draped-bedding';g.add(m);
  const edge=[];for(let i=0;i<=nx;i++){const k=(i*(nz+1)+nz)*3;edge.push(new THREE.Vector3(pts[k],pts[k+1]+.004,pts[k+2]));}
  const hem=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge),60,.004,5,false),material);g.add(hem);};
 const linen=artSurface(new THREE.MeshStandardMaterial({color:0xd6dce0,roughness:1,side:THREE.DoubleSide}),'textile');linen.userData.keep=true;
 cloth(bx0+.05,bx1-.06,bz0+.04,bz1+.09,y0+.452,.4,linen);
 cloth(bx0+.03,bx1-.58,bz0+.025,bz1+.32,y0+.515,1,fabric);
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
 {const cx=win.x-.15,cz=dz0-.45,chair=K.group(g,cx,cz,.4,y0),cloth=artSurface(new THREE.MeshStandardMaterial({color:0x343b43,roughness:.93}),'textile');cloth.userData.keep=true;
  K.cyl(chair,0,.27,0,.024,.39,0x727979,20);K.cyl(chair,0,.15,0,.041,.18,0x282d30,20);
  for(let k=0;k<5;k++){const a=k*1.257,x=Math.sin(a)*.26,z=Math.cos(a)*.26;K.rod(chair,[0,.09,0],[x,.055,z],.018,0x33383a,.012,10);K.cyl(chair,x,.033,z,.03,.032,0x202426,14,[Math.PI/2,a,0]);}
  K.rbox(chair,0,.47,0,.45,.08,.42,.037,cloth);K.rod(chair,[0,.43,-.16],[0,.76,-.22],.018,0x33383a,.014,12);
  K.rbox(chair,0,.78,-.215,.39,.39,.07,.033,cloth).rotation.x=-.09;
  for(const e of [-1,1]){K.rod(chair,[e*.21,.46,-.09],[e*.235,.65,-.06],.011,0x343a3e,.011,10);K.rbox(chair,e*.235,.65,0,.045,.031,.22,.013,0x292e32);}}
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
 {const cx=bx0+.5,cz=bz1-.2,cy=y0+.555;rbox(cx,cy,cz,.15,.04,.1,.02,0xe6e6e0).rotation.y=.6;for(const e of [-1,1])K.ball(g,cx+e*.05,cy+.005,cz+.04,.035,0xe6e6e0,[1,.6,1]);
  for(const e of [-1,1])K.cyl(g,cx+e*.029,cy+.027,cz+.012,.009,.009,0x414548,12);
  box(cx-.043,cy+.023,cz-.018,.025,.004,.007,0x414548);box(cx-.043,cy+.023,cz-.018,.007,.004,.025,0x414548);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;K.cyl(g,cx+.045+Math.cos(a)*.01,cy+.023,cz-.018+Math.sin(a)*.01,.0038,.004,[0x92a952,0xa94f48,0x5593b5,0xcbba58][k],8);}
  const pts=[[cx-.05,cy,cz],[bx0-.02,y0+.3,cz+.2],[bx0-.2,y0+.02,cz+.6],[rx0+.6,y0+.02,rz0+.2],[rx0+.5,y0+.95,rz0+.22]];for(let k=0;k<pts.length-1;k++)K.rod(g,pts[k],pts[k+1],.004,0x2a2a2a,.004,3);}
 // The box fan on the floor by the side window, turned toward the bed.
 {const f=K.group(g,x1-.42,(side.z-side.w/2-.45),-2.3,y0);K.rbox(f,0,.28,0,.52,.52,.13,.025,0xd9d4c6);const grill=K.box(f,0,.28,.068,.44,.44,.005,0x4a4c4c);grill.name='alex-room-fan';
  for(let k=0;k<19;k++){K.box(f,0,.07+k*.023,.079,.44,.003,.004,0xc6c6bd);K.box(f,-.21+k*.023,.28,.080,.003,.44,.004,0xc6c6bd);}for(let k=0;k<3;k++){const a=k*2.094,b=K.ball(f,Math.sin(a)*.11,.28+Math.cos(a)*.11,.075,.105,0xaaa99f,[.5,1,.08],true);b.rotation.z=-a;}K.box(f,-.16,.017,0,.075,.035,.22,0xaaa99f);K.box(f,.16,.017,0,.075,.035,.22,0xaaa99f);K.cyl(f,0,.28,.07,.05,.01,0x9a9a96,10,[Math.PI/2,0,0]);K.box(f,.17,.53,0,.1,.03,.08,0x6a6a66);}
 // Floor: jeans and t-shirts by the bed, sneakers by the door, a backpack against the wall, his
 // helmet, a stack of comics, socks, a basketball under the desk.
 for(const [x,z,a,c] of [[bx0-.05,bz1+.5,.7,0x3e5f8a],[bx0-.3,bz1+.35,-.4,0x8a2f2a]]){
  const garment=K.group(g,x,z,a,y0+.025),mat=artSurface(new THREE.MeshStandardMaterial({color:c,roughness:1,side:THREE.DoubleSide}),'textile');mat.userData.keep=true;
  const pos=[],idx=[],nx=24,nz=28;for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const u=i/nx,v=j/nz,xx=(u-.5)*.46,zz=(v-.5)*.48;pos.push(xx,.016+.012*Math.sin(u*19+v*7)+.009*Math.sin(v*23),zz);}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const u=(i+.5)/nx,v=(j+.5)/nz;if((u<.2||u>.8)&&v>.32)continue;if(Math.abs(u-.5)<.11&&v<.12)continue;const a=i*(nz+1)+j,b=a+nz+1;idx.push(a,a+1,b,a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();garment.add(new THREE.Mesh(geo,mat));}
 {const jeans=K.group(g,bx0+.2,bz1+.72,-.3,y0+.024);K.rbox(jeans,0,.026,0,.26,.038,.2,.012,0x344f70);
  for(const e of [-1,1]){K.rbox(jeans,e*.066,.017,.2,.12,.032,.33,.014,0x2f4a6a).rotation.y=e*.12;K.rod(jeans,[e*.062,.037,.07],[e*.088,.035,.35],.0017,0x8290a0,.0017,5);}}
 for(const [x,z,a] of [[x0+.35,zb+1.3,.3],[x0+.52,zb+1.42,.1]]){const s=K.group(g,x,z,a,y0);K.rbox(s,0,.045,0,.11,.09,.27,.03,0xe8e6de);K.box(s,0,.012,0,.115,.025,.28,0x9a9a96);K.box(s,0,.07,.05,.09,.02,.12,0x3a5a8a);for(let j=0;j<4;j++)K.rod(s,[-.035,.09,-.045+j*.023],[.035,.09,-.035+j*.023],.003,0xcac7bd,.003,5);}
 {const p=rbox(x0+.2,y0+.25,zb+1.85,.3,.45,.18,.06,0x2f4f7a);p.rotation.y=.2;p.rotation.z=-.15;box(x0+.32,y0+.33,zb+1.85,.04,.25,.12,0x24405f);}
 // His bike helmet, on the desk beside the phone: red, a white stripe down the middle, his number on the sides.
 {const hm=makeHelmet();hm.position.set(win.x-.13,dy+.002,dz0+.24);hm.rotation.y=2.5;g.add(hm);}
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
 // Small construction detail at eye height: door panels, outlets, furniture joinery.
 for(const z of [door.z-.22,door.z+.22])for(const yy of [.5,1.42]){K.rbox(g,x0+.032,y0+yy,z,.016,yy<1?.62:.79,.34,.008,0xd2cec3);}
 for(const z of [zb+2.6,zf-.5]){K.rbox(g,x0+.018,y0+.3,z,.022,.11,.073,.008,0xe5e1d7);for(const y of [-.025,.025])for(const dz of [-.012,.012])K.box(g,x0+.032,y0+.3+y,z+dz,.002,.014,.004,0x686761);}
 for(const x of [dx0+.03,dx1-.03])K.box(g,x,dy-.075,(dz0+dz1)/2,.025,.12,dz1-dz0-.04,0x5f4a36);
 for(let i=0;i<3;i++){const z=(dz0+dz1)/2;K.box(g,dx1-.22,y0+.22+i*.17,z-.27,.32,.145,.022,0x7a6248);K.rod(g,[dx1-.29,y0+.22+i*.17,z-.286],[dx1-.15,y0+.22+i*.17,z-.286],.007,0xa6a49a,.007,8);}
 // Pin heads and curled paper corners keep the corkboard from reading as four coloured squares.
 for(const [z,y] of [[side.z+side.w/2+.48,y0+1.55],[side.z+side.w/2+.69,y0+1.52],[side.z+side.w/2+.79,y0+1.39]])K.ball(g,x1-.033,y,z,.009,0xa83324,[.4,1,1],true);
 const woodColors=new Set([0x5f4a36,0x6b5236,0x7a6248,0x6b5539,0x8a6c4a]),clothColors=new Set([0xeae5d8,0x3e5f8a,0x6c6c6a,0x8a2f2a,0xd8d4c4,0x2f4a6a,0x2f4f7a]);
 const materials=new Map();for(const obj of g.children){if(roomBefore.has(obj))continue;obj.traverse(o=>{if(!o.isMesh||o.material.userData.artSurface)return;const color=o.material.color?.getHex(),kind=woodColors.has(color)?'timber':clothColors.has(color)?'textile':null;if(kind){const key=color+kind;if(!materials.has(key)){const m=o.material.clone();m.userData.keep=true;artSurface(m,kind);materials.set(key,m);}o.material=materials.get(key);}});}
 // Soft baked contact under furniture. The feathered edge only darkens the carpet.
 const shadowTex=roomShadow();const contact=(x,z,w,d,opacity)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.rotation.x=-Math.PI/2;m.position.set(x,y0+.004,z);m.name='alex-room-contact';g.add(m);};
 contact((bx0+bx1)/2,(bz0+bz1)/2,2.35,1.32,.34);contact((dx0+dx1)/2,(dz0+dz1)/2,1.9,.85,.25);contact(win.x-.15,dz0-.45,.85,.8,.24);contact(rx0+.25,(rz0+rz1)/2,.85,1.5,.3);
 for(const obj of g.children)if(!roomBefore.has(obj))obj.traverse(o=>{if(o.isMesh)o.userData.zone='alex-room';});
 // Things you cannot walk through (house frame rectangles), and where the story's moments happen.
 const blocks=[[bx0-.05,x1,zb,bz1+.06],[bx0-.53,bx0-.05,zb,zb+.52],[dx0-.04,dx1+.04,dz0-.04,zf],[win.x-.55,win.x+.25,dz0-.72,dz0-.15],[rx0-.05,rx0+.56,rz0-.03,rz1+.03],[x1-.72,x1,side.z-side.w/2-.62,side.z-side.w/2-.24]];
 W.interiors['alex-room']={P,x0,x1,z0:zb,z1:zf,floor:F,height:H,blocks,
  door:{x:x0+.55,z:door.z,face:{x:x0,z:door.z}},phone:{x:win.x-.42,y:dy+.012,z:dz0+.3},
  sideWindow:{x:x1-.62,z:side.z,look:{x:x1+8,z:side.z-3,y:side.y-.6},glass:{x:x1,z:side.z,y:side.y}},frontWindow:{x:win.x,z:dz0-.55,glass:{x:win.x,z:zf,y:win.y}},
  standJamie:{x:dx0-.3,z:dz0-.55},standSam:{x:x0+.75,z:zb+1.9},enter:{x:x0+.7,z:door.z+.1},deskStand:{x:win.x+.55,z:dz0-.45},helmet:{x:win.x-.13,z:dz0+.24,y:dy-F}};
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

let shadowTexture=null;
function roomShadow(){if(shadowTexture)return shadowTexture;const n=64,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.max(Math.abs(x/(n-1)*2-1),Math.abs(y/(n-1)*2-1)),i=(y*n+x)*4;a[i]=a[i+1]=a[i+2]=12;a[i+3]=255*Math.pow(Math.max(0,1-r*r),1.8);}shadowTexture=new THREE.DataTexture(a,n,n);shadowTexture.magFilter=THREE.LinearFilter;shadowTexture.needsUpdate=true;return shadowTexture;}
