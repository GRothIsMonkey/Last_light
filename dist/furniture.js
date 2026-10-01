// Street furniture: streetlights, the utility network, signs, hydrants, drains.
// The power line is one connected network: every wire runs pole to pole (or pole to
// house), sags a little, and ends at a guyed dead-end pole, never in the air.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {MAIN,LAWN,CURB_TOP,roadCrown} from './terrain.js';
import {JUNCTIONS,ROAD_START,STREETS,SECTION} from './layout.js';
import {STREET} from './palette.js';
import {smooth} from './kit.js';

const CF=SECTION.curbFace;
export function buildFurniture(W){
 const {K}=W,mainG=W.bent(MAIN);
 const groundMain=(d,lat)=>groundPoint(d,lat).y+W.surfaceY(d,lat);
 const lines=W.wires=[];const wire=(pts,color=STREET.wire,kind='span')=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color}));W.baked.push(l);lines.push({kind,a:pts[0].clone(),b:pts[pts.length-1].clone(),mid:pts[pts.length>>1].clone()});return l;};
 const sag=(a,b,s,n=14)=>{const pts=[];for(let k=0;k<=n;k++){const t=k/n;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-4*s*t*(1-t),a.z+(b.z-a.z)*t));}return pts;};
 const clearAt=(frame,u,v,r)=>{const p=frame.point(u,v);return W.space.free(p.x,p.z,r);};

 // Streetlights: a tapered pole, a curved mast arm and a cobra head over the street -----------
 function lampPost(frame,u,v,armDir,ground){
  // Every lamp head is drawn by one shared material (W.lampLit); this proxy only carries its index.
  const lm=new THREE.MeshStandardMaterial({color:0xe8d6b8});lm.userData.lamp=W.streetLamps.length;const g=W.place(frame,u,v,{y:ground});
  K.lathe(g,[[.001,0],[.17,0],[.17,.08],[.13,.14],[.11,.5],[.075,7.1],[.06,7.25],[.001,7.25]],0,0,0,STREET.lampPost,8);
  K.rod(g,[0,6.7,0],[armDir*.9,7.2,0],.045,STREET.lampPost,.04,6);K.rod(g,[armDir*.9,7.2,0],[armDir*1.75,7.3,0],.04,STREET.lampPost,.035,6);
  K.rbox(g,armDir*2.05,7.27,0,.72,.17,.34,.07,0x5f5c56);K.rbox(g,armDir*2.08,7.18,0,.5,.05,.24,.02,lm);
  const p=frame.point(u,v);W.space.circle(p.x,p.z,.45,'lamp');if(frame===MAIN)W.obstacles.push({d0:u-.3,d1:u+.3,l0:v-.3,l1:v+.3});
  // World positions too: side-street lamps cannot be found from Oak Hollow coordinates.
  const head=frame.point(u,v+armDir*2.08),pool=frame.point(u,(v+armDir*2.08)*.55);
  W.streetLamps.push({d:u,lat:v+armDir*2.08,y:ground-groundPoint(u,v+armDir*2.08).y+7.15,mat:lm,frame:frame.id,x:head.x,z:head.z,top:ground+7.15,pool});
 }
 const onCut=(frameId,side,u,m=1.2)=>W.cuts.some(c=>c.frame===frameId&&c.side===side&&u>c.u0-m&&u<c.u1+m);
 const inMouth=(u,side,m=3)=>JUNCTIONS.some(j=>j.side===side&&Math.abs(u-j.d)<j.half+j.corner+m);
 for(let d=ROAD_START+5;d<1120;d+=70){let u=d;for(let k=0;k<8&&(onCut('main',1,u)||inMouth(u,1));k++)u+=3;lampPost(MAIN,u,5.62,-1,groundMain(u,5.62));}
 lampPost(MAIN,1150.2,8.9,-1,groundMain(1150.2,8.9));
 // Briarwood's own two lamps: one by the first houses, one past the creek near Alex's house.
 // The creek strip between them stays dark under its trees.
 {const f=W.sideFrames[0],j=f.junction,gy=(u,v)=>f.point(u,v).y+W.sideSurface(j,u,v);for(let u of [40,116]){for(let k=0;k<6&&onCut(f.id,1,u,1);k++)u-=2;lampPost(f,u,j.half+1.42,-1,gy(u,j.half+1.42));}}

 // Utility poles ---------------------------------------------------------------------------
 const poles=[];
 function pole(frame,u,v,{ground=null,arm=0,transformer=false,guy=null}={}){
  const p=frame.point(u,v),y=ground??p.y+LAWN,g=W.place(frame,u,v,{y,rot:arm});
  K.lathe(g,[[.001,-.4],[.16,-.4],[.155,0],[.14,4],[.115,9.3],[.001,9.35]],0,0,0,STREET.pole,7);
  K.box(g,0,8.75,0,2.1,.14,.14,STREET.pole);for(const s of [-.85,.85])K.lathe(g,[[.001,0],[.045,0],[.05,.05],[.03,.18],[.001,.2]],s,8.82,0,0x8a9a8a,6);
  K.box(g,0,7.25,.1,.5,.08,.08,0x5a5a55);if(transformer){K.cyl(g,.32,7.75,0,.24,.75,0x7b7f7c,10);K.cyl(g,.32,8.16,0,.26,.06,0x6b6f6c,10);}
  const pole={frame,u,v,x:p.x,z:p.z,y,rot:-frame.heading(u)+arm,
   at(dx,h){const c=Math.cos(this.rot),s=Math.sin(this.rot);return new THREE.Vector3(this.x+dx*c,this.y+h,this.z-dx*s);}};
  if(guy){const a=pole.at(0,8.6),b=new THREE.Vector3(p.x+guy[0],y-.1,p.z+guy[1]);wire([a,b],0x8a8a86,'guy');const gg=W.placeWorld(b.x,b.z,y,0,false);K.cyl(gg,0,1,0,.05,2,0xd8c040,6);}
  W.space.circle(p.x,p.z,.5,'pole');if(frame===MAIN)W.obstacles.push({d0:u-.3,d1:u+.3,l0:v-.3,l1:v+.3});poles.push(pole);return pole;
 }
 // Wires run along a span; when a crossarm is parallel to the span (a branch leaving the
 // line), the conductors hang one above the other instead, so they never overlap.
 function span(a,b){const A=a.at(0,0),B=b.at(0,0),L=A.distanceTo(B),s=.5+L*.012,dir=new THREE.Vector3().subVectors(B,A).normalize();
  const along=p=>Math.abs(dir.x*Math.cos(p.rot)-dir.z*Math.sin(p.rot))>.5;
  if(along(a)||along(b)){for(const h of [8.95,8.45])wire(sag(a.at(0,h),b.at(0,h),s));}
  else for(const dx of [-.85,.85]){const pa=a.at(dx,8.95),pb=b.at(dx,8.95);wire(sag(pa,pb,s));}
  wire(sag(a.at(0,7.25),b.at(0,7.25),s*1.2));}
 // Main line along the left side, at lot lines behind the sidewalk.
 const left=W.plans.filter(p=>p.side<0).sort((a,b)=>a.u-b.u),lineV=-9.3,main=[];
 const lotLines=[];for(let i=0;i<left.length-1;i++)lotLines.push((left[i].u+left[i+1].u)/2);
 lotLines.unshift(left[0].u-15);
 for(let i=0;i<lotLines.length;i+=2){let u=lotLines[i];
  const j=JUNCTIONS.find(j=>j.side<0&&Math.abs(u-j.d)<j.half+j.corner+6);if(j)u=j.d-(j.half+j.corner+6);
  if(onCut('main',-1,u,.8))u+=2;main.push(u);}
 // The corner of the left-side junction gets its own pole for the branch line.
 const J2=JUNCTIONS.find(j=>j.side<0),cornerU=J2.d-(J2.half+2.5),cornerV=-(CF+2.6);
 for(let i=main.length-1;i>=0;i--)if(Math.abs(main[i]-cornerU)<14)main.splice(i,1);main.push(cornerU);main.sort((a,b)=>a-b);
 const mainPoles=[];for(const [i,u] of main.entries()){const corner=Math.abs(u-cornerU)<.01,first=i===0,last=i===main.length-1;
  mainPoles.push(pole(MAIN,u,corner?cornerV:lineV,{ground:groundMain(u,corner?cornerV:lineV),arm:corner?Math.PI/2:0,transformer:i%3===1,guy:last?[Math.sin(heading(u))*4,-Math.cos(heading(u))*4]:null}));}
 for(let i=0;i<mainPoles.length-1;i++)span(mainPoles[i],mainPoles[i+1]);
 // Branch lines down both side streets; the right-hand one crosses Oak Hollow first.
 JUNCTIONS.forEach((j,ji)=>{const f=W.sideFrames[ji],v=-(j.half+5.2),from=j.side<0?mainPoles.find(p=>Math.abs(p.u-cornerU)<.01):mainPoles.reduce((a,b)=>Math.abs(b.u-j.d)<Math.abs(a.u-j.d)?b:a);
  const branch=[];let prev=from;
  if(j.side>0){const u0=j.d+(j.half+j.corner+3),c=pole(MAIN,u0,CF+.9,{ground:groundMain(u0,CF+.9),arm:Math.PI/2});span(prev,c);prev=c;}
  for(let u=j.corner+22;u<f.length+30;u+=42){let uu=u;if(j.creek&&Math.abs(uu-j.creek.u)<j.creek.half+2)uu=j.creek.u+j.creek.half+3;for(let k=0;k<6&&onCut(f.id,-1,uu,1);k++)uu+=2.5;const p=f.point(uu,v),gy=p.y+LAWN;const pl=pole(f,uu,v,{ground:gy,transformer:branch.length%2===1});span(prev,pl);prev=pl;branch.push(pl);}
 });
 // A sparse selection of service drops; the continuous pole network is unchanged.
 for(const h of [...W.plans,...W.sidePlans.filter(p=>p.lod==='full')]){
  if(h.seedA>.27&&!h.key)continue;
  const q=h.toWorld(h.hasGarage?-h.gs*h.w/2:h.w/2,h.front-1.2),target=new THREE.Vector3(q.x,q.ground+h.h-.35,q.z);
  let best=null,bd=1e9;for(const p of poles){const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<bd){bd=d;best=p;}}
  if(best&&bd<52)wire(sag(best.at(0,7.1),target,.35+bd*.008,10),0x322c28,'drop');
 }

 // Signs --------------------------------------------------------------------------------------
 function paint(w,h,draw){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}catch{return null;}}
 const text=(g,str,x,y,size,color='#1b1b1b')=>{g.fillStyle=color;g.font=`bold ${size}px Arial, Helvetica, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(str,x,y);};
 const signs=W.signs=[];
 // A sign face: front (and optionally a printed back), set in a thin rim so no edge is ever see-through.
 function plate(g,w,h,y,tex,fallback,{back=null,alpha=false,rot=0,shape='rect',name=''}={}){
  const pg=new THREE.Group();pg.position.y=y;pg.position.x=back===true?0:Math.sin(rot)*.065;pg.position.z=back===true?0:Math.cos(rot)*.065;pg.rotation.y=rot;g.add(pg);
  const face=(t,flip)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),t?new THREE.MeshStandardMaterial({map:t,roughness:.55,transparent:alpha,alphaTest:alpha?.5:0}):K.mat(fallback));m.name='sign-face';m.position.z=flip?-.012:.012;if(flip)m.rotation.y=Math.PI;m.userData.sign=name;pg.add(m);return m;};
  face(tex,false);if(back!==null)face(back===true?tex:back,true);else{const r=new THREE.Mesh(new THREE.PlaneGeometry(w*.98,h*.98),K.mat(0x9a9c98));r.rotation.y=Math.PI;r.position.z=-.012;pg.add(r);}
  if(shape==='rect'){const rim=new THREE.Mesh(K.boxGeo,K.mat(0x8d908b));rim.scale.set(w,h,.02);pg.add(rim);}
  return pg;}
 function post(anchorFrame,u,v,height,ground){const g=W.place(anchorFrame,u,v,{y:ground});K.rbox(g,0,height/2,0,.06,height,.06,.01,0x8d908b);K.box(g,0,height+.02,0,.08,.04,.08,0x7d807b);const p=anchorFrame.point(u,v);W.space.circle(p.x,p.z,.3,'sign');if(anchorFrame===MAIN)W.obstacles.push({d0:u-.15,d1:u+.15,l0:v-.15,l1:v+.15});return g;}
 const diamond=(g,w,h,draw)=>{g.translate(w/2,h/2);g.rotate(Math.PI/4);g.fillStyle='#e8c33a';g.strokeStyle='#1b1b1b';g.lineWidth=10;const s=w*.66;g.beginPath();g.rect(-s/2,-s/2,s,s);g.fill();g.stroke();g.rotate(-Math.PI/4);g.translate(-w/2,-h/2);draw(g,w,h);};
 {const g=post(MAIN,36,5.75,2.6,groundMain(36,5.75));plate(g,.9,.9,2.2,paint(256,256,(c,w,h)=>diamond(c,w,h,()=>{text(c,'SLOW',w/2,h*.36,38);text(c,'CHILDREN',w/2,h*.52,27);text(c,'AT PLAY',w/2,h*.64,27);})),0xe8c33a,{alpha:true,shape:'none',name:'SLOW CHILDREN AT PLAY'});}
 {const g=post(MAIN,150,5.75,2.5,groundMain(150,5.75));plate(g,.6,.76,2.1,paint(192,244,(c,w,h)=>{c.fillStyle='#f4f2ea';c.fillRect(0,0,w,h);c.strokeStyle='#1b1b1b';c.lineWidth=6;c.strokeRect(8,8,w-16,h-16);text(c,'SPEED',w/2,h*.2,34);text(c,'LIMIT',w/2,h*.37,34);text(c,'25',w/2,h*.68,96);}),0xf4f2ea,{name:'SPEED LIMIT 25'});}
 {const u=J2.d+J2.half+J2.corner+24,g=post(MAIN,u,5.75,2.5,groundMain(u,5.75));plate(g,.75,.75,2.1,paint(256,256,(c,w,h)=>{c.fillStyle='#e8c33a';c.fillRect(8,8,w-16,h-16);c.strokeStyle='#1b1b1b';c.lineWidth=8;c.strokeRect(14,14,w-28,h-28);text(c,'NO',w/2,h*.38,56);text(c,'OUTLET',w/2,h*.62,50);}),0xe8c33a,{name:'NO OUTLET'});}
 const blade=name=>paint(512,80,(c,w,h)=>{c.fillStyle='#2f6b45';c.fillRect(0,0,w,h);c.strokeStyle='#e8efe6';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);text(c,name,w/2,h/2+2,name.length>12?40:46,STREET.signText);});
 const octagon=paint(128,128,(c,w,h)=>{c.fillStyle='#b8322c';c.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;c.lineTo(w/2+Math.cos(a)*w*.48,h/2+Math.sin(a)*h*.48);}c.closePath();c.fill();c.strokeStyle='#f2efe8';c.lineWidth=5;c.stroke();text(c,'STOP',w/2,h/2+2,34,'#f7f4ee');});
 // At each junction: stop sign for the cross street, both names on double-sided blades above it.
 for(const j of JUNCTIONS){const sg=j.side>0?1:-1,C=[j.d+sg*(j.half+j.corner),j.side*(CF+j.corner)],r=j.corner-1.05,a=Math.PI/4;
  // Keep the assembly clear of the junction utility pole, on the same curb arc.
  const candidates=[a,.22,1.35].map(angle=>{const u=C[0]-sg*r*Math.sin(angle),v=C[1]-j.side*r*Math.cos(angle),p=MAIN.point(u,v);return {u,v,clearance:Math.min(...poles.map(q=>Math.hypot(q.x-p.x,q.z-p.z)))};});
  const {u,v}=candidates.find(p=>p.clearance>2.1)||candidates.sort((a,b)=>b.clearance-a.clearance)[0],g=post(MAIN,u,v,2.59,groundMain(u,v));
  // Double-sided blades sit above the post, joined only through the gaps.
  K.cyl(g,0,2.61,0,.025,.03,0x8d908b,6);K.cyl(g,0,2.85,0,.025,.07,0x8d908b,6);
  // Main-street blade runs along Oak Hollow; the cross-street blade runs along the cross street.
  plate(g,1.2,.19,2.72,blade(STREETS.main),STREET.sign,{back:true,rot:Math.PI/2,name:STREETS.main});
  plate(g,1.2,.19,2.98,blade(j.name),STREET.sign,{back:true,rot:0,name:j.name});
  plate(g,.62,.62,2.1,octagon,0xb8322c,{alpha:true,shape:'none',rot:j.side>0?Math.PI/2:-Math.PI/2,name:'STOP'});
  signs.push({junction:j.name,main:STREETS.main,d:u,lat:v});}

 // Hydrants in the parking strip, and curb inlets along the gutters ----------------------------
 for(let d=80;d<1110;d+=140){const side=(d/140|0)%2?1:-1;let u=d;for(let k=0;k<6&&(onCut('main',side,u,1.5)||inMouth(u,side,2));k++)u+=3;
  const v=side*5.6,g=W.place(MAIN,u,v,{y:groundMain(u,v)});const c=0xc8b53a;
  K.lathe(g,[[.001,0],[.17,0],[.17,.06],[.13,.09],[.12,.55],[.14,.6],[.14,.66],[.11,.7],[.09,.8],[.03,.86],[.001,.88]],0,0,0,c,10);
  for(const s of [-1,1])K.cyl(g,s*.16,.46,0,.05,.12,c,8,[0,0,Math.PI/2]);K.cyl(g,0,.46,.16,.065,.12,c,8,[Math.PI/2,0,0]);K.cyl(g,0,.46,.23,.08,.03,0x8a7a2a,8,[Math.PI/2,0,0]);
  const p=MAIN.point(u,v);W.space.circle(p.x,p.z,.4,'hydrant');}
 for(let d=ROAD_START+60;d<1095;d+=95){const side=(d/95|0)%2?1:-1;let u=d;for(let k=0;k<6&&(onCut('main',side,u,2)||inMouth(u,side,4));k++)u+=4;
  K.box(mainG,side*(CF+.005),.07,-u,.03,.07,.9,0x2a2a2a);const gr=K.box(mainG,side*(CF-.22),.028,-u,.4,.012,.85,0x3a3a38);gr.material=K.mat(0x3a3a38,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  for(let k=0;k<5;k++)K.box(mainG,side*(CF-.22),.034,-u-.34+k*.17,.36,.012,.03,0x2a2a28);}
 // Manholes, patches and cracks in the asphalt.
 const manhole=K.mat(0x4b4a47,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 for(let d=ROAD_START+40;d<1120;d+=95){const m=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.02,16),manhole);m.position.set(((Math.abs(d)/95|0)%2?.8:-1.2),roadCrown(d,1)-.004,-d);mainG.add(m);}
 // Patches share the asphalt's grain, a shade darker; none right where the ride starts.
 const patch=W.surfaceMaterial(K.mat(STREET.patch,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),'asphalt');
 for(let k=0;k<30;k++){const d=ROAD_START+W.rand()*(1100-ROAD_START),x=(W.rand()-.5)*6,w=.8+W.rand()*1.6,l=1.2+W.rand()*2.6;if(d>-14&&d<30)continue;
  const p=[],idx=[];for(const dd of [d,d+l/2,d+l])for(const xx of [x-w/2,x+w/2])p.push(xx,roadCrown(dd,xx)+.002,-dd);idx.push(0,1,2,1,3,2,2,3,4,3,5,4);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);mainG.add(new THREE.Mesh(g,patch));}
 for(let k=0;k<44;k++){const d=ROAD_START+W.rand()*(1110-ROAD_START),x=(W.rand()-.5)*8,pts=[];let px=x,pd=d;for(let j=0;j<5;j++){pts.push([px,roadCrown(pd,px)+.006,-pd]);px+=(W.rand()-.5)*.5;pd+=.3+W.rand()*.5;}K.line(mainG,pts,0x51504c);}
 W.poles=poles;
}
