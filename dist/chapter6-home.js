// Chapter Six: your room, the next morning. The front corner of your own house (the ranch on Oak Hollow whose driveway
// Chapter Two's morning starts on): a twelve-year-old's bedroom in August 2011, the bed you just woke up in, the desk
// under the front window with Alex's camera on it, the hall outside with the cordless phone on its table, the front
// door. Your mom is in the kitchen with the radio on; you hear her, you don't see her.
//
// Built only for this chapter, in the house's own frame (x across its width, +z toward the street, heights over its
// ground), as one group added while the chapter plays. The window you see out of shows the street as it is: the view
// is rendered once from just outside the glass (shoot) when the room is first seen; elsewhere a bright morning stands in.
// nav: while you are inside, the room answers nav.locate (nav.setRoom) with its own floor and walls.
import * as THREE from './three.module.js';
import {paper,bake,makeShapes,inBox,clamp} from './chapter6-kit.js';
import {artSurface} from './art-surfaces.js';
import {makeCameraModel} from './alex-camera.js';
import {dressCamera} from './chapter5-props.js';

// The house: Chapter Two's (main street, the left side, not a friend's, nearest 455 m along).
export function homeOf(world){const homes=Object.values(world.homes);return world.houses.filter(h=>h.frameId==='main'&&h.side<0&&!homes.includes(h)&&h.drivD).sort((a,b)=>Math.abs(a.dc-455)-Math.abs(b.dc-455))[0];}

export function createHome({scene,world,camera,shoot=null}){
 const P=homeOf(world),W2=P.w/2,D2=P.depth/2,FL=P.floor,t=.15,H=2.42;
 const O=P.toWorld(0,0),A=P.worldRot,cs=Math.cos(A),sn=Math.sin(A);
 // house frame <-> world
 const toW=(x,z,y=0)=>({x:O.x+x*cs+z*sn,z:O.z-x*sn+z*cs,y:O.ground+y});
 const toL=(wx,wz)=>{const dx=wx-O.x,dz=wz-O.z;return {x:dx*cs-dz*sn,z:dx*sn+dz*cs};};
 const heading=a=>a-A;// a heading in the house frame to the world's (forward = (sin a, -cos a))
 // ---- the rooms (house frame) -----------------------------------------------------------------------------------------
 const R={x0:3.25,x1:W2-t,z0:-.95,z1:D2-t};                 // your room: the front corner away from the garage
 const HL={x0:.45,x1:3.15,z0:-1.35,z1:D2-t};               // the hall: the front door, the phone, the kitchen door
 const DOOR={z0:.95,z1:1.85};                              // your door, in the wall between them
 const FRONT={x:P.doorX,w:.94};                            // the front door (the house's own)
 const WIN={x:-W2+P.w*3.5/Math.max(2,Math.round(P.w/3.3)),y:1.55,w:1.3,h:1.25};// the front window over your desk
 const SIDE={z:0,y:1.55,w:1,h:1.2};                        // the side window by the bed
 const root=new THREE.Group();root.name='chapter6-home';root.position.set(O.x,O.ground,O.z);root.rotation.y=A;
 const K=makeShapes();
 const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});
 // (the room lit as a room in the morning: a little of its own light, the way the bounce from the window fills it)
 const paint=mat(0xc9cdb8,{emissive:0x9a9c88,emissiveIntensity:.11,roughness:.95});artSurface(paint,'plaster');paint.userData.keep=true;
 const hallPaint=mat(0xd8cdb4,{emissive:0xa09684,emissiveIntensity:.1,roughness:.95});artSurface(hallPaint,'plaster');
 const ceil=mat(0xece8de,{emissive:0xc2beb2,emissiveIntensity:.14});
 const carpet=mat(0x6f7686,{emissive:0x3c404a,emissiveIntensity:.09,roughness:1});artSurface(carpet,'carpet');
 const boards=mat(0x9a7a56,{emissive:0x4a3a28,emissiveIntensity:.08,roughness:.7});artSurface(boards,'timber');
 const trim=mat(0xefe9dc,{emissive:0x7a776e,emissiveIntensity:.08});
 const wood=mat(0x7a5a3c,{roughness:.6});artSurface(wood,'timber');
 const dark=mat(0x2a2b2e,{roughness:.5});
 const quad=(a,b,c,d,m)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.receiveShadow=true;root.add(o);return o;};
 // A wall seen from inside, along a->b (house frame x,z) with its face toward `into`, and openings [u0,u1,v0,v1].
 function wall(a,b,into,holes,m,y0=FL,y1=FL+H){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,P3=(u,v)=>[a[0]+dx*u+into[0]*.004,v,a[1]+dz*u+into[1]*.004];
  const rect=(u0,u1,v0,v1)=>{if(u1-u0<.004||v1-v0<.004)return;const p=[P3(u0,v0),P3(u1,v0),P3(u1,v1),P3(u0,v1)],n=[-dz,0,dx],flip=n[0]*into[0]+n[2]*into[1]<0;quad(...(flip?[p[0],p[3],p[2],p[1]]:p),m);};
  const hs=(holes||[]).slice().sort((p,q)=>p[0]-q[0]);let u=0;
  for(const [h0,h1,v0,v1] of hs){rect(u,h0,y0,y1);rect(h0,h1,y0,v0);rect(h0,h1,v1,y1);u=h1;}rect(u,L,y0,y1);}
 // your room
 wall([R.x0,R.z1],[R.x1,R.z1],[0,-1],[[WIN.x-WIN.w/2-R.x0,WIN.x+WIN.w/2-R.x0,WIN.y-WIN.h/2,WIN.y+WIN.h/2]],paint);
 wall([R.x1,R.z1],[R.x1,R.z0],[-1,0],[[R.z1-(SIDE.z+SIDE.w/2),R.z1-(SIDE.z-SIDE.w/2),SIDE.y-SIDE.h/2,SIDE.y+SIDE.h/2]],paint);
 wall([R.x1,R.z0],[R.x0,R.z0],[0,1],null,paint);
 wall([R.x0,R.z0],[R.x0,R.z1],[1,0],[[DOOR.z0-R.z0,DOOR.z1-R.z0,FL,FL+2.05]],paint);
 quad([R.x0,FL,R.z0],[R.x0,FL,R.z1],[R.x1,FL,R.z1],[R.x1,FL,R.z0],carpet);quad([R.x0,FL+H,R.z0],[R.x1,FL+H,R.z0],[R.x1,FL+H,R.z1],[R.x0,FL+H,R.z1],ceil);
 // the hall
 wall([HL.x1,HL.z0],[HL.x1,HL.z1],[-1,0],[[DOOR.z0-HL.z0,DOOR.z1-HL.z0,FL,FL+2.05]],hallPaint);
 wall([HL.x0,HL.z1],[HL.x1,HL.z1],[0,-1],[[FRONT.x-FRONT.w/2-HL.x0,FRONT.x+FRONT.w/2-HL.x0,FL,FL+2.04]],hallPaint);
 wall([HL.x0,HL.z0],[HL.x0,HL.z1],[1,0],null,hallPaint);
 wall([HL.x1,HL.z0],[HL.x0,HL.z0],[0,1],[[.55,1.45,FL,FL+2.04]],hallPaint);
 quad([HL.x0,FL,HL.z0],[HL.x0,FL,HL.z1],[HL.x1,FL,HL.z1],[HL.x1,FL,HL.z0],boards);quad([HL.x0,FL+H,HL.z0],[HL.x1,FL+H,HL.z0],[HL.x1,FL+H,HL.z1],[HL.x0,FL+H,HL.z1],ceil);
 // the wall between them has two faces and a thickness; a jamb, a door standing open into your room
 K.box(root,3.2,FL+1.02,DOOR.z0-.02,.1,2.04,.04,trim);K.box(root,3.2,FL+1.02,DOOR.z1+.02,.1,2.04,.04,trim);K.box(root,3.2,FL+2.07,(DOOR.z0+DOOR.z1)/2,.1,.06,DOOR.z1-DOOR.z0+.08,trim);
 const door=K.box(root,R.x0+.42,FL+1.01,DOOR.z1+.02,.84,2.0,.04,mat(0xe6dfcf,{emissive:0x6a665c,emissiveIntensity:.08}),{ry:-1.35,name:'your-door'});door.position.set(R.x0+.12,FL+1.01,DOOR.z1+.4);
 // baseboards
 for(const [x0,z0,x1,z1] of [[R.x0,R.z0+.01,R.x1,R.z0+.01],[R.x1-.01,R.z0,R.x1-.01,R.z1],[R.x0,R.z1-.01,R.x1,R.z1-.01],[HL.x0+.01,HL.z0,HL.x0+.01,HL.z1],[HL.x1-.01,HL.z0,HL.x1-.01,DOOR.z0]])
  K.box(root,(x0+x1)/2,FL+.05,(z0+z1)/2,Math.max(.014,Math.abs(x1-x0)),.1,Math.max(.014,Math.abs(z1-z0)),trim);
 // ---- the windows: reveals, sills, curtains; the street through the glass ---------------------------------------------
 const viewTex=paper(512,384,(g,w,h)=>{const s=g.createLinearGradient(0,0,0,h);s.addColorStop(0,'#cfe0ee');s.addColorStop(.55,'#eef1ea');s.addColorStop(.6,'#97a777');s.addColorStop(1,'#6f8458');g.fillStyle=s;g.fillRect(0,0,w,h);
  g.fillStyle='#d8d0c0';g.fillRect(w*.15,h*.4,w*.32,h*.18);g.fillStyle='#8a6a58';g.beginPath();g.moveTo(w*.12,h*.4);g.lineTo(w*.31,h*.28);g.lineTo(w*.5,h*.4);g.fill();g.fillStyle='#6b6b68';g.fillRect(0,h*.62,w,h*.07);
  g.fillStyle='rgba(255,252,236,.35)';g.fillRect(0,0,w,h);});
 const pane=new THREE.MeshBasicMaterial({map:viewTex,color:viewTex?0xffffff:0xe8eef0,toneMapped:false});
 const front=K.plane(root,WIN.x,WIN.y,R.z1+.06,WIN.w,WIN.h,pane,{ry:Math.PI,name:'your-window-view'});void front;
 const sideTex=paper(256,256,(g,w,h)=>{const s=g.createLinearGradient(0,0,0,h);s.addColorStop(0,'#e8f0f2');s.addColorStop(.7,'#c8d8b0');s.addColorStop(1,'#7f9460');g.fillStyle=s;g.fillRect(0,0,w,h);g.fillStyle='rgba(120,98,70,.55)';for(let i=0;i<9;i++)g.fillRect(i*30,h*.62,6,h*.38);});
 K.plane(root,R.x1+.06,SIDE.y,SIDE.z,SIDE.w,SIDE.h,new THREE.MeshBasicMaterial({map:sideTex,color:sideTex?0xfff6e6:0xf4f0e0,toneMapped:false}),{ry:-Math.PI/2});
 {const r=t+.03;for(const [y,hh] of [[WIN.y-WIN.h/2-.015,.03],[WIN.y+WIN.h/2+.015,.03]])K.box(root,WIN.x,y,R.z1+r/2-.03,WIN.w+.04,hh,r,trim);for(const e of [-1,1])K.box(root,WIN.x+e*(WIN.w/2+.015),WIN.y,R.z1+r/2-.03,.03,WIN.h,r,trim);
  K.box(root,WIN.x,WIN.y-WIN.h/2-.035,R.z1-.07,WIN.w+.18,.03,.15,trim);K.box(root,WIN.x,WIN.y,R.z1+.03,.03,WIN.h,.02,trim);K.box(root,WIN.x,WIN.y+.05,R.z1+.03,WIN.w,.03,.02,trim);
  for(const [y,hh] of [[SIDE.y-SIDE.h/2-.015,.03],[SIDE.y+SIDE.h/2+.015,.03]])K.box(root,R.x1+r/2-.03,y,SIDE.z,r,hh,SIDE.w+.04,trim);for(const e of [-1,1])K.box(root,R.x1+r/2-.03,SIDE.y,SIDE.z+e*(SIDE.w/2+.015),r,SIDE.h,.03,trim);K.box(root,R.x1-.07,SIDE.y-SIDE.h/2-.035,SIDE.z,.15,.03,SIDE.w+.18,trim);}
 // curtains: thin cotton, half drawn on the front window, nearly shut on the side; the sun comes through them
 const curtain=new THREE.MeshStandardMaterial({color:0x8fa6b8,emissive:0xd8e2e8,emissiveIntensity:.28,roughness:1,side:THREE.DoubleSide,transparent:true,opacity:.86});artSurface(curtain,'textile');
 const drape=(w,h)=>{const g=new THREE.PlaneGeometry(w,h,14,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/w*Math.PI*7)*.025);g.computeVertexNormals();return g;};
 for(const e of [-1,1]){const m=new THREE.Mesh(drape(.42,1.75),curtain);m.position.set(WIN.x+e*(WIN.w/2-.02),FL+1.3,R.z1-.09);root.add(m);}
 {const m=new THREE.Mesh(drape(.62,1.75),curtain);m.position.set(R.x1-.09,FL+1.3,SIDE.z-.22);m.rotation.y=Math.PI/2;root.add(m);const m2=m.clone();m2.position.z=SIDE.z+.3;root.add(m2);}
 K.pipe(root,[WIN.x-WIN.w/2-.3,FL+2.2,R.z1-.09],[WIN.x+WIN.w/2+.3,FL+2.2,R.z1-.09],.012,mat(0xb8b0a0,{metalness:.5}));
 // the sun through the front window, across the desk onto the carpet: a shaft of dust and a patch of light
 const shaftTex=paper(64,256,(g,w,h)=>{const s=g.createLinearGradient(0,0,0,h);s.addColorStop(0,'rgba(255,240,200,.55)');s.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=s;g.fillRect(0,0,w,h);});
 const shaftM=new THREE.MeshBasicMaterial({map:shaftTex,color:0xfff2d2,transparent:true,opacity:shaftTex?.32:.08,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
 const shaft=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.2),shaftM);shaft.position.set(WIN.x-.2,FL+.95,R.z1-.75);shaft.rotation.set(-.6,.25,0);shaft.name='your-room-sun';root.add(shaft);
 const patchM=new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2});
 const patch=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.9),patchM);patch.rotation.x=-Math.PI/2;patch.position.set(WIN.x-.35,FL+.006,R.z1-1.55);root.add(patch);
 // ---- your things ------------------------------------------------------------------------------------------------------
 const solids=[];const solid=(x,z,hw,hd)=>solids.push({x,z,hw,hd});
 // the bed along the side wall, under the window: unmade, the sheet kicked down, a pillow pushed up against the wall
 const BED={x:R.x1-.52,z:1.45,w:1,l:2.02};
 K.box(root,BED.x,FL+.17,BED.z,BED.w,.3,BED.l,wood);K.box(root,BED.x,FL+.4,BED.z,BED.w-.04,.18,BED.l-.04,mat(0xe9e6dc,{emissive:0x8a887e,emissiveIntensity:.1}));
 {const blanket=new THREE.PlaneGeometry(1.08,1.3,10,10),p=blanket.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.05+Math.sin(x*6+y*3)*.035+(y<-.4?Math.max(0,-.4-y)*.25:0));}blanket.computeVertexNormals();
  const b=new THREE.Mesh(blanket,mat(0x3d5a7e,{emissive:0x1c2838,emissiveIntensity:.1,side:THREE.DoubleSide}));b.rotation.x=-Math.PI/2;b.position.set(BED.x-.02,FL+.5,BED.z+.32);root.add(b);artSurface(b.material,'textile');}
 K.box(root,BED.x,FL+.56,BED.z-.78,.62,.12,.38,mat(0xf2efe6,{emissive:0x8e8c84,emissiveIntensity:.12}),{rx:-.18});
 K.box(root,BED.x,FL+.48,BED.z-BED.l/2+.02,BED.w+.04,.64,.05,wood);
 solid(BED.x,BED.z,BED.w/2+.04,BED.l/2+.02);
 // the nightstand: an alarm clock (red numbers), a glass of water, a comic face down
 const NS={x:R.x1-.27,z:BED.z-BED.l/2-.3};K.box(root,NS.x,FL+.3,NS.z,.42,.6,.42,wood);solid(NS.x,NS.z,.22,.22);
 const clockTex=paper(128,64,(g,w,h)=>{g.fillStyle='#120c0c';g.fillRect(0,0,w,h);g.fillStyle='#ff3a26';g.font='bold 40px monospace';g.textAlign='center';g.fillText('8:41',w/2,h*.72);});
 K.box(root,NS.x,FL+.66,NS.z,.16,.09,.08,dark,{ry:-.4});K.plane(root,NS.x-.016,FL+.665,NS.z+.042,.13,.065,new THREE.MeshBasicMaterial({map:clockTex,color:clockTex?0xffffff:0xff3a26}),{ry:-.4,name:'alarm-clock'}).position.set(NS.x-.017,FL+.665,NS.z+.04);
 K.cyl(root,NS.x+.1,FL+.66,NS.z-.08,.03,.1,mat(0xd8e8ec,{transparent:true,opacity:.5,roughness:.1}));
 // the desk under the front window: Alex's camera, a lamp, a notebook, pencils, a handheld game
 const DESK={x:WIN.x,z:R.z1-.3,w:1.25,d:.58};const DY=FL+.74;
 K.box(root,DESK.x,DY-.015,DESK.z,DESK.w,.03,DESK.d,wood);for(const [ex,ez] of [[-1,-1],[1,-1],[-1,1],[1,1]])K.box(root,DESK.x+ex*(DESK.w/2-.04),FL+.36,DESK.z+ez*(DESK.d/2-.04),.04,.72,.04,wood);
 K.box(root,DESK.x+.4,FL+.55,DESK.z,.4,.34,DESK.d-.06,wood);solid(DESK.x,DESK.z,DESK.w/2+.02,DESK.d/2+.02);
 K.box(root,DESK.x-.15,DY+.008,DESK.z-.02,.22,.012,.29,mat(0x2e6a9e),{ry:.12});K.box(root,DESK.x-.15,DY+.016,DESK.z-.02,.2,.004,.27,mat(0xf2efe2),{ry:.12});
 for(let i=0;i<3;i++)K.cyl(root,DESK.x+.08+i*.03,DY+.005,DESK.z+.12,.004,.17,mat([0xe0b030,0xe0b030,0xc23a2a][i]),{rz:Math.PI/2,ry:.3+i*.1});
 K.box(root,DESK.x+.38,DY+.012,DESK.z-.1,.14,.022,.085,mat(0x5a4a8e,{roughness:.4}),{ry:-.3});
 K.cyl(root,DESK.x+.48,DY+.012,DESK.z+.14,.07,.02,dark);K.pipe(root,[DESK.x+.48,DY+.02,DESK.z+.14],[DESK.x+.42,DY+.36,DESK.z+.1],.008,dark);K.cyl(root,DESK.x+.38,DY+.36,DESK.z+.07,.06,.09,mat(0xc23a2a,{roughness:.5}),{rx:.6,r2:.03});
 const chair=new THREE.Group();chair.position.set(DESK.x-.15,0,DESK.z-.62);chair.rotation.y=.35;root.add(chair);K.box(chair,0,FL+.45,0,.42,.04,.42,wood);K.box(chair,0,FL+.75,-.2,.42,.55,.04,wood);for(const [ex,ez] of [[-1,-1],[1,-1],[-1,1],[1,1]])K.box(chair,ex*.18,FL+.22,ez*.18,.035,.44,.035,wood);
 solid(DESK.x-.15,DESK.z-.62,.24,.24);
 // Alex's camera, where you put it last night (the same model Chapter Four found in his backpack)
 const cam=dressCamera(makeCameraModel());cam.group.name='desk-alex-camera';cam.group.position.set(DESK.x-.38,DY+.03,DESK.z+.06);cam.group.rotation.set(-Math.PI/2+.02,0,.4);root.add(cam.group);
 const CAMERA_AT=()=>{cam.group.updateMatrixWorld(true);return cam.group.getWorldPosition(new THREE.Vector3());};
 // the dresser on the back wall, a few trophies and a mirror over it; a laundry pile; a poster; the calendar; the corkboard
 const DR={x:R.x0+.75,z:R.z0+.28};K.box(root,DR.x,FL+.47,DR.z,1.05,.94,.5,wood);for(let i=0;i<3;i++)K.box(root,DR.x,FL+.2+i*.27,DR.z+.252,.98,.22,.01,mat(0x6a4a30));solid(DR.x,DR.z,.55,.27);
 for(let i=0;i<3;i++){const x=DR.x-.32+i*.3;K.box(root,x,FL+.98,DR.z,.08,.06,.08,mat(0x3a3a3a));K.cyl(root,x,FL+1.06,DR.z,.012,.12,mat(0xd8b040,{metalness:.7,roughness:.3}));K.cyl(root,x,FL+1.15,DR.z,.03,.05,mat(0xd8b040,{metalness:.7,roughness:.3}));}
 const mirror=K.box(root,DR.x,FL+1.55,R.z0+.02,.6,.7,.02,mat(0xb8c4cc,{metalness:.9,roughness:.08}));void mirror;
 K.box(root,R.x0+.55,FL+.08,R.z0+1.3,.62,.16,.5,mat(0x8a5a4a,{roughness:1}),{ry:.4});K.box(root,R.x0+.45,FL+.12,R.z0+1.2,.3,.08,.3,mat(0x3e6a5a,{roughness:1}),{ry:-.3});
 const poster=paper(256,384,(g,w,h)=>{g.fillStyle='#0c1630';g.fillRect(0,0,w,h);const sun=g.createRadialGradient(w*.2,h*.22,4,w*.2,h*.22,70);sun.addColorStop(0,'#ffe9a0');sun.addColorStop(1,'rgba(255,190,60,0)');g.fillStyle=sun;g.fillRect(0,0,w,h);
  const pl=[['#c8b8a0',8,.35],['#e0c080',12,.45],['#5a8ad0',13,.55],['#c86a40',10,.63],['#d8b088',26,.74],['#e6d4a0',22,.86]];pl.forEach(([c,r,y],i)=>{g.fillStyle=c;g.beginPath();g.arc(w*(.25+i*.1),h*y,r,0,7);g.fill();});
  g.strokeStyle='#e6d4a0';g.lineWidth=2;g.beginPath();g.ellipse(w*.75,h*.86,38,9,0,0,7);g.stroke();g.fillStyle='#f0e8d0';g.font='bold 28px Arial';g.textAlign='center';g.fillText('THE PLANETS',w/2,h*.1);});
 K.plane(root,R.x0+.006,FL+1.5,R.z0+1.45,.6,.9,new THREE.MeshStandardMaterial({map:poster,color:poster?0xffffff:0x223050,roughness:.9}),{ry:Math.PI/2,name:'poster'});
 const calTex=paper(256,320,(g,w,h)=>{g.fillStyle='#f6f2e6';g.fillRect(0,0,w,h);g.fillStyle='#3a6a8a';g.fillRect(0,0,w,64);g.fillStyle='#fff';g.font='bold 26px Arial';g.textAlign='center';g.fillText('AUGUST 2011',w/2,42);
  g.fillStyle='#222';g.font='15px Arial';const d0=1,col=k=>12+(k%7)*33,row=k=>96+Math.floor(k/7)*40;for(let d=1;d<=31;d++){const k=d-d0+1;g.fillStyle='#222';g.fillText(String(d),col(k)+12,row(k));if(d<=24){g.strokeStyle='#c02a2a';g.lineWidth=2;g.beginPath();g.moveTo(col(k)+2,row(k)-14);g.lineTo(col(k)+24,row(k)+6);g.moveTo(col(k)+24,row(k)-14);g.lineTo(col(k)+2,row(k)+6);g.stroke();}}
  const k=31;g.strokeStyle='#2a5aa0';g.lineWidth=2;g.beginPath();g.arc(col(30)+12,row(30)-5,15,0,7);g.stroke();g.fillStyle='#2a5aa0';g.font='bold 11px Arial';g.fillText('SCHOOL',col(30)+12,row(30)+18);void k;});
 K.plane(root,R.x0+.006,FL+1.45,R.z1-.9,.36,.45,new THREE.MeshStandardMaterial({map:calTex,color:calTex?0xffffff:0xf0eadc,roughness:.95}),{ry:Math.PI/2,name:'calendar'});
 // the corkboard by the door: a photo strip from the summer (the four of you, Alex in his red helmet), a schedule, a ticket
 const cork=paper(384,256,(g,w,h)=>{g.fillStyle='#b08a5a';g.fillRect(0,0,w,h);for(let i=0;i<700;i++){g.fillStyle=`rgba(${90+Math.random()*60|0},${60+Math.random()*40|0},30,.25)`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}
  g.save();g.translate(70,40);g.rotate(-.06);g.fillStyle='#fbf8f0';g.fillRect(0,0,110,180);const kid=(x,y,shirt,cap,helm)=>{g.fillStyle='#c8e0f0';g.fillRect(x,y,90,48);g.fillStyle=shirt;g.fillRect(x+30,y+26,30,22);g.fillStyle='#e0b898';g.beginPath();g.arc(x+45,y+20,9,0,7);g.fill();if(cap){g.fillStyle=cap;g.fillRect(x+35,y+9,20,6);}if(helm){g.fillStyle='#c2321f';g.beginPath();g.arc(x+45,y+16,11,Math.PI,0);g.fill();}};
  kid(10,8,'#d4b25a',null,true);kid(10,62,'#c8743f','#2d4a7a',false);kid(10,116,'#6d9a8a',null,false);g.restore();
  g.save();g.translate(220,60);g.rotate(.05);g.fillStyle='#fff';g.fillRect(0,0,120,90);g.fillStyle='#333';g.font='bold 11px Arial';g.fillText('LITTLE LEAGUE 2011',8,18);g.font='10px Arial';for(let i=0;i<5;i++)g.fillText(`Sat ${['6/4','6/11','6/18','6/25','7/2'][i]} — ${['Cubs','Pirates','Reds','Cubs','Mets'][i]}`,8,36+i*12);g.restore();
  g.save();g.translate(230,170);g.rotate(-.12);g.fillStyle='#e8d070';g.fillRect(0,0,100,40);g.fillStyle='#5a3a10';g.font='bold 11px Arial';g.fillText('LYRIC — ADMIT ONE',6,24);g.restore();
  for(const [x,y] of [[125,36],[280,58],[280,170]]){g.fillStyle='#c02a2a';g.beginPath();g.arc(x,y,5,0,7);g.fill();}});
 K.box(root,R.x0+.02,FL+1.42,R.z0+3.15,.02,.6,.9,mat(0x7a5a3a));
 K.plane(root,R.x0+.034,FL+1.42,R.z0+3.15,.86,.56,new THREE.MeshStandardMaterial({map:cork,color:cork?0xffffff:0xb08a5a,roughness:1}),{ry:Math.PI/2,name:'corkboard'});
 // school's coming: a store bag of new notebooks and a backpack by the door, the tags still on
 const bag=new THREE.Group();bag.position.set(R.x0+.45,FL,DOOR.z1+.55);root.add(bag);K.box(bag,0,.22,0,.34,.42,.2,mat(0xe8e4dc,{roughness:.95,emissive:0x6a6862,emissiveIntensity:.1}),{ry:.3});
 for(let i=0;i<3;i++)K.box(bag,.02,.42+i*.012,.0,.24,.011,.3,mat([0x2a8a4a,0xd04030,0x3050a0][i]),{ry:.3+i*.08,rx:-.15});
 K.box(root,R.x0+.4,FL+.28,DOOR.z0-.35,.32,.5,.2,mat(0x2a3e6a,{roughness:.9}),{ry:.6});solid(R.x0+.45,DOOR.z1+.55,.24,.2);
 // the ceiling light (off: it is morning) and a rug
 K.cyl(root,(R.x0+R.x1)/2,FL+H-.04,(R.z0+R.z1)/2,.18,.06,mat(0xf0ece2,{emissive:0x8a867c,emissiveIntensity:.3}));
 K.box(root,(R.x0+R.x1)/2-.2,FL+.006,(R.z0+R.z1)/2+.2,1.5,.008,1.1,mat(0x8a3a3a,{roughness:1,emissive:0x2a1010,emissiveIntensity:.1}));
 // ---- the hall: the phone on its table, coats, the kitchen door with the radio behind it, the front door --------------
 const PHONE_T={x:HL.x0+.25,z:1.75};K.box(root,PHONE_T.x,FL+.4,PHONE_T.z,.36,.8,.7,wood);solid(PHONE_T.x,PHONE_T.z,.2,.36);
 const base=new THREE.Group();base.position.set(PHONE_T.x+.02,FL+.8,PHONE_T.z-.1);root.add(base);K.box(base,0,.02,0,.12,.04,.16,mat(0xd8d4c8,{roughness:.5}));K.box(base,0,.045,.05,.03,.01,.03,mat(0x3a9a3a,{emissive:0x3aff3a,emissiveIntensity:.6}));
 // the handset: a 2011 cordless, beige, a stubby antenna, a small green screen
 function handsetMesh(){const g=new THREE.Group();g.name='cordless-handset';const body=mat(0xdcd6c6,{roughness:.45});K.box(g,0,0,0,.05,.17,.026,body);K.cyl(g,.015,.1,0,.005,.05,dark);
  const scr=paper(64,48,(c,w,h)=>{c.fillStyle='#9ac08a';c.fillRect(0,0,w,h);c.fillStyle='#1a2a1a';c.font='bold 13px monospace';c.fillText('SAM',6,20);c.font='10px monospace';c.fillText('00:12',6,38);});
  K.plane(g,0,.045,.0135,.036,.028,new THREE.MeshBasicMaterial({map:scr,color:scr?0xffffff:0x9ac08a}));for(let i=0;i<12;i++)K.box(g,-.012+(i%3)*.012,-.005-Math.floor(i/3)*.014,.014,.008,.006,.004,mat(0x8a867c));return g;}
 const handset=handsetMesh();handset.position.set(PHONE_T.x+.02,FL+.8+.09,PHONE_T.z-.1);handset.rotation.set(-.15,0,0);root.add(handset);
 const PHONE_AT=()=>toW(PHONE_T.x+.02,PHONE_T.z-.1,FL+.9);
 for(let i=0;i<3;i++){K.box(root,HL.x0+.03,FL+1.65,HL.z0+.5+i*.28,.04,.04,.04,dark);K.box(root,HL.x0+.1,FL+1.25,HL.z0+.5+i*.28,.12,.75,.26,mat([0x3a4a6a,0x8a3a2a,0x5a6a4a][i],{roughness:1}));}
 const kdoor=K.box(root,HL.x0+1.0,FL+1.02,HL.z0+.03,.9,2.04,.04,mat(0xe6dfcf,{emissive:0x6a665c,emissiveIntensity:.08}),{name:'kitchen-door'});void kdoor;
 const glowUnder=new THREE.Mesh(new THREE.PlaneGeometry(.88,.3),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending}));glowUnder.rotation.x=-Math.PI/2;glowUnder.position.set(HL.x0+1.0,FL+.004,HL.z0+.18);root.add(glowUnder);
 const fdoor=K.box(root,FRONT.x,FL+1.02,HL.z1-.03,FRONT.w,2.04,.05,mat(0x6a3a2a,{roughness:.6}),{name:'front-door-inside'});void fdoor;K.cyl(root,FRONT.x-.36,FL+1.0,HL.z1-.07,.025,.04,mat(0xc9b27a,{metalness:.8,roughness:.3}),{rx:Math.PI/2});
 K.box(root,FRONT.x-.75,FL+.03,HL.z1-.4,.6,.03,.4,mat(0x7a6a50,{roughness:1}));for(let i=0;i<4;i++)K.box(root,FRONT.x-.85+i*.17,FL+.06,HL.z1-.45+(i%2)*.08,.1,.07,.26,mat([0xe8e4dc,0x2a2a30,0xc0c0b8,0x5a3a2a][i]),{ry:(i-1.5)*.3});
 const photoTex=paper(128,160,(g,w,h)=>{g.fillStyle='#4a6a8a';g.fillRect(0,0,w,h);g.fillStyle='#e0b898';g.beginPath();g.arc(w/2,h*.4,26,0,7);g.fill();g.fillStyle='#5a6a8a';g.fillRect(w*.25,h*.6,w*.5,h*.4);g.fillStyle='#3a2a20';g.beginPath();g.arc(w/2,h*.33,27,Math.PI,0);g.fill();});
 K.box(root,HL.x1-.01,FL+1.55,HL.z0+1.0,.02,.3,.24,mat(0x2a2a2a));K.plane(root,HL.x1-.022,FL+1.55,HL.z0+1.0,.2,.26,new THREE.MeshStandardMaterial({map:photoTex,color:photoTex?0xffffff:0x4a6a8a}),{ry:-Math.PI/2});
 K.cyl(root,(HL.x0+HL.x1)/2,FL+H-.04,1.4,.14,.05,mat(0xf0ece2,{emissive:0x8a867c,emissiveIntensity:.3}));
 // ---- merged by material (what moves stays apart) ----------------------------------------------------------------------
 bake(root,new Set([handset,cam.group,chair,base]));
 // ---- where things are (world) ----------------------------------------------------------------------------------------
 const SPOTS={
  bed:{...toW(BED.x,BED.z-.55,FL),eye:FL+.62,a:heading(Math.PI*1.5)},                       // lying down, head on the pillow
  wake:{...toW(BED.x-.9,BED.z-.15)},                                                        // standing up beside the bed
  desk:toW(DESK.x-.3,DESK.z-.62),window:toW(WIN.x,R.z1-.2,FL+1.2),cork:toW(R.x0+.04,R.z0+3.15,FL+1.42),calendar:toW(R.x0+.04,R.z1-.9,FL+1.45),poster:toW(R.x0+.04,R.z0+1.45,FL+1.5),
  clock:toW(NS.x,NS.z,FL+.66),trophies:toW(DR.x,DR.z,FL+1.05),bag:toW(R.x0+.45,DOOR.z1+.55,FL+.4),
  door:toW(3.2,(DOOR.z0+DOOR.z1)/2,FL+1),phone:PHONE_AT(),phoneStand:toW(PHONE_T.x+.65,PHONE_T.z),kitchen:toW(HL.x0+1.0,HL.z0+.1,FL+1.2),
  front:toW(FRONT.x,HL.z1-.35,FL+1.1),frontIn:toW(FRONT.x,HL.z1-.6),
  // outside: the stoop, and your bike at the end of the walk
  stoop:toW(FRONT.x,P.stepFront+.55),outA:heading(0),
 };
 // ---- nav: the floor and the walls (house frame) ----------------------------------------------------------------------
 const inRoom=(q,r=0)=>q.x>R.x0+r&&q.x<R.x1-r&&q.z>R.z0+r&&q.z<R.z1-r,inHall=(q,r=0)=>q.x>HL.x0+r&&q.x<HL.x1-r&&q.z>HL.z0+r&&q.z<HL.z1-r;
 const inDoor=(q,r=0)=>q.x>HL.x1-.3&&q.x<R.x0+.3&&q.z>DOOR.z0+r&&q.z<DOOR.z1-r;
 const nav={inside:(x,z)=>{const q=toL(x,z);return q.x>-W2-.2&&q.x<W2+.2&&q.z>-D2-.2&&q.z<D2+.2;},
  walkable:(x,z,r=.28)=>{const q=toL(x,z);if(!(inRoom(q,r)||inHall(q,r)||inDoor(q,Math.min(r,.25))))return false;return !solids.some(b=>inBox(q.x,q.z,b,r));},
  floorAt:()=>O.ground+FL,heading:A};
 // ---- the view out of the front window (rendered once, the street as it is this morning) --------------------------------
 let viewRT=null;
 function renderView(){if(!shoot||viewRT||typeof THREE.WebGLRenderTarget!=='function')return false;try{viewRT=new THREE.WebGLRenderTarget(512,384,{colorSpace:THREE.SRGBColorSpace});const c=new THREE.PerspectiveCamera(62,512/384,.1,300);
  const e=toW(WIN.x,R.z1+.75,1.6),f=toW(WIN.x-1.5,R.z1+16,.9);c.position.set(e.x,e.y,e.z);c.lookAt(f.x,f.y,f.z);c.updateMatrixWorld();root.visible=false;
  const ok=shoot({cam:c,target:viewRT});root.visible=true;if(ok){pane.map=viewRT.texture;pane.color.setHex(0xf6f4ec);pane.needsUpdate=true;}return ok;}catch{root.visible=true;return false;}}
 // ---- the phone in your hand (on the camera, by your ear) -------------------------------------------------------------
 let held=null;
 function holdPhone(on){if(on&&!held){held=handset;camera.add(handset);handset.position.set(-.13,-.075,-.2);handset.rotation.set(.25,.55,.35);}
  else if(!on&&held){root.add(handset);handset.position.set(PHONE_T.x+.02,FL+.8+.09,PHONE_T.z-.1);handset.rotation.set(-.15,0,0);held=null;}}
 // ---- Alex's camera: on the desk, or in your hand (the chapter's photo model takes over from there) ---------------------
 function cameraOnDesk(on){cam.group.visible=on;}
 let ringT=-1;
 function ring(on){ringT=on?0:-1;}
 function update(dt){if(ringT>=0){ringT+=dt;const k=(ringT%3)<1.6;base.children[1].material.emissiveIntensity=k&&Math.sin(ringT*30)>0?1.6:.4;handset.rotation.z=held?handset.rotation.z:k?Math.sin(ringT*70)*.012:0;}}
 function show(on){if(on&&!root.parent)scene.add(root);else if(!on&&root.parent)root.removeFromParent();}
 function reset(){holdPhone(false);ring(false);cameraOnDesk(true);show(false);}
 return {P,root,SPOTS,nav,toW,toL,heading,R,HL,WIN,show,reset,update,renderView,holdPhone,cameraOnDesk,ring,CAMERA_AT,handset,base,
  get ringing(){return ringT>=0;},get viewRendered(){return !!viewRT;},inRoom:(x,z)=>inRoom(toL(x,z)),inHall:(x,z)=>inHall(toL(x,z))};
}
