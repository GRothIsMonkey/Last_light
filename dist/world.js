// The neighborhood. Everything static is authored in flat street coordinates
// (x = lateral offset, z = -distance), bent onto the route, then merged by material.
import * as THREE from './three.module.js';
import {surfaceMaterial,leafGeometry,leafTexture} from './materials.js';
import {ROAD_HALF,groundPoint,heading} from './route.js';

export const JUNCTIONS=[{d:475,side:1},{d:740,side:-1}];
export const BULB={d:1142,r:11};
export const ROAD_END=1140;
export const LAWN=.12,SIDEWALK=.16,CURB_TOP=.15;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const roadCrown=(d,x)=>.025+.035*Math.max(0,1-(x/ROAD_HALF)**2)*(1-smooth((d-1127)/12))+.005*smooth((d-1127)/12);
// Final lookout: a small grassy rise past the cul-de-sac, then the field falls away.
export const knoll=(d,lat)=>LAWN+.5*smooth((d-1151)/11)*(1-.4*smooth((Math.abs(lat)-9)/8))-5.5*smooth((d-1176)/48);
export const LOOKOUT={stop:{d:1136.5,lat:-.9},fenceD:1173,bounds:{d0:1121,d1:1171.2,l0:-12.2,l1:12.2},swing:{d:1161.5,lat:5.2},bench:{d:1166,lat:-4.2},oak:{d:1162,lat:7.6}};

export function buildWorld(scene){
 let seed=2011;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rand()*a.length)];
 const mats=new Map();
 function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.9,...extra}));return mats.get(key);}
 const boxGeo=new THREE.BoxGeometry(1,1,1),sphereGeo=new THREE.IcosahedronGeometry(1,1),tinyGeo=new THREE.IcosahedronGeometry(1,0);
 const M=c=>typeof c==='object'?c:mat(c);
 function box(g,x,y,z,w,h,d,c){const m=new THREE.Mesh(boxGeo,M(c));m.position.set(x,y,z);m.scale.set(w,h,d);g.add(m);return m;}
 function ball(g,x,y,z,r,c,s=[1,1,1]){const m=new THREE.Mesh(r<.13?tinyGeo:sphereGeo,M(c));m.position.set(x,y,z);m.scale.set(r*s[0],r*s[1],r*s[2]);g.add(m);return m;}
 function rod(g,a,b,r,c,r2=r,sides=6){const A=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(A);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,v.length(),sides),M(c));m.position.copy(A).addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());g.add(m);return m;}
 function tri(g,verts,c){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,M(c));g.add(m);return m;}
 function line(g,pts,color){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color}));g.add(l);return l;}
 function group(x,z,rotY=0,parent=scene){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;parent.add(g);return g;}
 // Grid surface from explicit lateral and distance samples; skip(x,d) removes cells.
 function grid(xs,ds,y,color,skip){const p=[],idx=[],nx=xs.length;
  for(const d of ds)for(const x of xs)p.push(x,typeof y==='function'?y(d,x):y,-d);
  for(let j=0;j<ds.length-1;j++)for(let i=0;i<nx-1;i++){if(skip&&skip((xs[i]+xs[i+1])/2,(ds[j]+ds[j+1])/2))continue;const a=j*nx+i,b=a+1,c=a+nx;idx.push(a,b,c,b,c+1,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);const mesh=new THREE.Mesh(g,M(color));scene.add(mesh);return mesh;}
 const range=(a,b,step)=>{const r=[];const n=Math.max(1,Math.ceil((b-a)/step));for(let i=0;i<=n;i++)r.push(a+(b-a)*i/n);return r;};
 function surface(x0,x1,d0,d1,y,color,dx=3,dd=2){return grid(range(x0,x1,dx),range(d0,d1,dd),y,color);}

 // Registries used by gameplay: raised walkable pads, reserved lots, lights.
 const pads=[],reserved=[],obstacles=[],drivewayOpenings=[],houses=[];
 const windowMats=[...Array(8)].map((_,i)=>new THREE.MeshStandardMaterial({color:0x5b6870,emissive:0xffb45a,emissiveIntensity:.08,roughness:.35,metalness:.1}));
 const darkGlass=new THREE.MeshStandardMaterial({color:0x4d5a62,roughness:.3,metalness:.15});
 const porchMats=[...Array(6)].map(()=>new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:.05}));
 const doorway=new THREE.MeshStandardMaterial({color:0x2c2018,emissive:0xff9a4a,emissiveIntensity:.55,roughness:1});
 const garageInside=new THREE.MeshStandardMaterial({color:0x6e665d,roughness:1,side:THREE.BackSide});
 const foliage=[];
 const leafMats=new Map();
 const foliageMat=(c,cutout=false)=>{const key=c+':'+cutout;if(!leafMats.has(key)){const m=new THREE.MeshStandardMaterial({color:c,map:cutout?leafTexture:null,alphaTest:cutout?.35:0,side:cutout?THREE.DoubleSide:THREE.FrontSide,roughness:1});leafMats.set(key,m);foliage.push(m);}return leafMats.get(key);};
 const isFree=(d,lat,r=0)=>!reserved.some(q=>d>q.d0-r&&d<q.d1+r&&lat>q.l0-r&&lat<q.l1+r);
 const reserve=(d0,d1,l0,l1)=>reserved.push({d0:Math.min(d0,d1),d1:Math.max(d0,d1),l0:Math.min(l0,l1),l1:Math.max(l0,l1)});
 const pad=(d0,d1,l0,l1,y)=>pads.push({d0:Math.min(d0,d1),d1:Math.max(d0,d1),l0:Math.min(l0,l1),l1:Math.max(l0,l1),y});
 const atJunction=(d,side,margin=5)=>JUNCTIONS.some(j=>j.side===side&&Math.abs(j.d-d)<margin);
 const inSideStreet=(x,d)=>JUNCTIONS.some(j=>(j.side*x>4.6&&j.side*x<47&&Math.abs(d-j.d)<4.3)||Math.hypot(x-j.side*47,d-j.d)<9.3);
 const inBulb=(x,d)=>Math.hypot(x,d-BULB.d)<BULB.r+.3;

 // Ground, road, side streets ---------------------------------------------------
 surface(-80,80,-130,1420,-.06,0x6f6a4c,8,8);
 const grassMat=mat(0x7f8a55);
 const asphalt=surfaceMaterial(mat(0x686b6d,{roughness:1}),'asphalt');
 const road=surface(-ROAD_HALF,ROAD_HALF,-120,ROAD_END,(d,x)=>roadCrown(d,x),asphalt,1.175,1);road.name='main-road';
 {const p=[],ix=[],R=[0,2.2,4.4,6.6,8.8,BULB.r],A=64;for(const r of R)for(let k=0;k<A;k++){const a=k/A*Math.PI*2;p.push(Math.cos(a)*r,.03,-BULB.d+Math.sin(a)*r);}
  for(let i=0;i<R.length-1;i++)for(let k=0;k<A;k++){const a=i*A+k,b=i*A+(k+1)%A,c=a+A,d=b+A;ix.push(a,b,c,b,d,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);const m=new THREE.Mesh(geo,asphalt);m.name='cul-de-sac';scene.add(m);}
 const concrete=surfaceMaterial(mat(0xc2bdb0),'concrete'),curbC=surfaceMaterial(mat(0xb7b3a8),'concrete');
 for(const j of JUNCTIONS){const a=j.side>0?4.5:-49,b=j.side>0?49:-4.5;surface(a,b,j.d-4.15,j.d+4.15,.03,asphalt,2,1);
  for(const edge of [-1,1]){surface(a,b,j.d+edge*5.5-.75,j.d+edge*5.5+.75,SIDEWALK,concrete,2,1);for(let x=5.2;x<38.5;x+=2)box(scene,j.side*x,.045,-(j.d+edge*4.3),2,.21,.3,curbC);}
  const p=[j.side*47,.03,-j.d],ix=[];for(let k=0;k<=48;k++){const angle=k*Math.PI/24;p.push(j.side*47+Math.cos(angle)*9,.03,-j.d+Math.sin(angle)*9);if(k<48)ix.push(0,k+2,k+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);const cul=new THREE.Mesh(geo,asphalt);scene.add(cul);
  for(let k=0;k<40;k++){const angle=k/40*Math.PI*2,x=j.side*47+Math.cos(angle)*9.15,dd=j.d+Math.sin(angle)*9.15;if(j.side*x<38.5&&Math.abs(dd-j.d)<4.6)continue;const c=box(scene,x,.045,-dd,.3,.21,1.6,curbC);c.rotation.y=angle;}
  reserve(j.d-10,j.d+10,j.side*4.5,j.side*57);
 }

 // Houses -------------------------------------------------------------------------
 const WALLS=[0xc9bea6,0xb9ab92,0x9ea9a2,0xd4cfc1,0xa9b2b6,0xc6b28c,0x8f9c86,0xb49b84,0xdcd6c8,0x999a92,0xc7b9a0,0xa89c8a];
 const ROOFS=[0x4d4a48,0x5b534d,0x46505a,0x635a52,0x3f4245,0x584e48];
 const DOORS=[0x7a2f2a,0x2f3d55,0x3d4d3a,0xe8e2d6,0x6b4a33,0x2b2b2b,0x5a3440];
 const SHUTTERS=[0x3a4a5a,0x2d3a30,0x5a3a33,0x3b3b3b,0x4a4235];
 function roofFaces(g,verts,c){
  const faces=[];
  for(let i=0;i<verts.length;i+=9){const ax=verts[i+3]-verts[i],az=verts[i+5]-verts[i+2],bx=verts[i+6]-verts[i],bz=verts[i+8]-verts[i+2];
   // A square hip roof has one apex: omit its zero-area ridge triangles.
   if(Math.abs(az*bx-ax*bz)<1e-8)continue;
   if(az*bx-ax*bz<0)for(let j=0;j<3;j++)[verts[i+3+j],verts[i+6+j]]=[verts[i+6+j],verts[i+3+j]];
   faces.push(...verts.slice(i,i+9));}
  const m=tri(g,faces,surfaceMaterial(mat(c),'roof'));m.name='roof-slope';return m;
 }
 function gableRoof(g,W,D,y0,rise,ox,oz,c,wallC,alongX=true){
  // alongX: ridge parallel to x (side gable). Otherwise ridge runs front to back.
  const [a,b,oa,ob]=alongX?[W,D,ox,oz]:[D,W,oz,ox];const L=a/2+oa,H=b/2+ob;const P=(u,y,v)=>alongX?[u,y,v]:[v,y,u];
  const slopes=[];for(const s of [-1,1]){const e0=P(-L,y0-ob*rise/(b/2),s*H),e1=P(L,y0-ob*rise/(b/2),s*H),r0=P(-L,y0+rise,0),r1=P(L,y0+rise,0);slopes.push(...e0,...r1,...e1,...e0,...r0,...r1);}
  // Orient every roof face toward the sky (including front-facing gables).
  roofFaces(g,slopes,c);
  const gab=[];for(const s of [-1,1]){const x=s*a/2;gab.push(...P(x,y0,-b/2),...P(x,y0+rise,0),...P(x,y0,b/2));}const gm=tri(g,gab,wallC);gm.material=mat(wallC,{side:THREE.DoubleSide});
  for(const s of [-1,1])box(g,...P(0,y0-ob*rise/(b/2)-.08,s*H),...(alongX?[W+2*ox,.16,.07]:[.07,.16,W+2*ox]),0xe6dfd0);
 }
 function hipRoof(g,W,D,y0,rise,o,c){
  const L=W/2+o,H=D/2+o,r=Math.max(0,(W-D)/2),ye=y0-o*rise/(D/2),v=[];
  const E=[[-L,ye,H],[L,ye,H],[L,ye,-H],[-L,ye,-H]],R0=[-r,y0+rise,0],R1=[r,y0+rise,0];
  v.push(...E[0],...R1,...E[1],...E[0],...R0,...R1, ...E[2],...R0,...E[3],...E[2],...R1,...R0, ...E[1],...R1,...E[2], ...E[3],...R0,...E[0]);
  roofFaces(g,v,c);for(const s of [-1,1]){box(g,0,ye-.08,s*H,W+2*o,.16,.07,0xe6dfd0);box(g,s*L,ye-.08,0,.07,.16,D+2*o,0xe6dfd0);}
 }
 function windowUnit(g,x,y,z,w,h,shutter,lit=true,m=null){
  const glass=m||(lit&&rand()<.78?windowMats[Math.floor(rand()*windowMats.length)]:darkGlass);
  box(g,x,y,z,w,h,.08,glass);const t=.07;
  // A partially drawn curtain gives each window depth without another light.
  const curtain=mat(0xc2b9a7,{roughness:1});
  if(Math.abs(x*3+y)%1>.27){box(g,x-w*.34,y,z+.047,w*.19,h-.05,.016,curtain);box(g,x+w*.34,y,z+.047,w*.19,h-.05,.016,curtain);}

  box(g,x,y+h/2+t/2,z+.02,w+.2,t,.1,0xeee8da);box(g,x,y-h/2-t/2,z+.03,w+.26,t,.14,0xeee8da);for(const s of [-1,1])box(g,x+s*(w/2+t/2),y,z+.02,t,h,.1,0xeee8da);
  box(g,x,y,z+.045,.035,h,.03,0xeee8da);box(g,x,y+h*.08,z+.045,w,.035,.03,0xeee8da);
  if(shutter)for(const s of [-1,1])box(g,x+s*(w/2+.26),y,z+.03,.34,h+.1,.06,shutter);
  return glass;
 }
 function house(dc,side,o={}){
  const stories=o.stories??(rand()<.42?2:1),w=o.w??(stories===2?10+rand()*2.5:12+rand()*3.5),depth=o.depth??(8.4+rand()*1.6);
  const h=stories===2?5.6:2.95,setback=o.setback??(18.2+rand()*2.6),front=depth/2;
  const wall=o.wall??pick(WALLS),roofC=o.roofColor??pick(ROOFS),doorC=o.door??pick(DOORS),shutter=o.shutters??(rand()<.55?pick(SHUTTERS):null);
  const roofType=o.roof??(stories===2?pick(['side','side','hip','front']):pick(['side','hip','front','side']));
  const g=group(side*setback,-dc,side>0?-Math.PI/2:Math.PI/2);
  const S=(x,z)=>({d:dc-side*x,lat:side*(setback-z)});
  // Garage side in local x. 'near' is the side toward the start of the ride.
  const hasGarage=o.garage!==false&&(o.garage===true||rand()<.8);
  const gs=o.garageSide==='near'?side:o.garageSide==='far'?-side:(rand()<.5?1:-1);
  const gw=o.gw??(rand()<.5?4:6.4),gh=2.9,gd=Math.min(depth,7),gx=gs*(w/2+gw/2),gfront=front-(o.garageInset??0);
  // Main body, foundation, siding.
  box(g,0,h/2,0,w,h,depth,surfaceMaterial(mat(wall),'siding'));box(g,0,.2,0,w+.08,.42,depth+.08,o.brick?0x93604c:0xa59d8d);
  if(o.brick||rand()<.25){box(g,0,.55,front+.03,w,1.1,.06,0x93604c);}
  for(let yy=.95;yy<h-.1;yy+=.36)box(g,0,yy,front+.012,w,.022,.02,0x8f887a);
  for(const s of [-1,1])for(let yy=.95;yy<h-.1;yy+=.36)box(g,s*(w/2+.012),yy,0,.02,.022,depth,0x8f887a);
  // Corner boards, gutters and downspouts give walls and eaves a built silhouette.
  for(const q of [-1,1]){box(g,q*(w/2-.06),h/2,front+.03,.12,h,.07,0xe3ded2);
   box(g,q*(w/2+.05),h/2,front-.08,.065,h,.065,0xc9c5b9);}
  box(g,0,h-.04,front+.42,w+.7,.10,.10,0xb9b8b0);
  // Roof.
  const rise=roofType==='front'?2.3:stories===2?2:2.2;
  if(roofType==='hip')hipRoof(g,w,depth,h,rise,.45,roofC);else gableRoof(g,w,depth,h,rise,.35,.5,roofC,wall,roofType==='side');
  if(o.chimney||rand()<.3){const cx=(rand()-.5)*w*.6;box(g,cx,h+rise*.6,-depth*.2,.9,rise*1.4,.9,0x8b5a48);box(g,cx,h+rise*1.32,-depth*.2,1,.12,1,0x6f6a60);}
  if(stories===1&&roofType==='side'&&rand()<.35)for(const s of [-1,1]){const dg=group(s*w*.22,front*.4,0,g);dg.position.y=h+.45;box(dg,0,.5,0,1.3,1.1,1.6,wall);gableRoof(dg,1.3,1.6,1.05,.55,.12,.2,roofC,wall,false);windowUnit(dg,0,.55,.82,.7,.75,null);}
  // Front door, porch or stoop.
  const porch=o.porch??(rand()<.4?'porch':'stoop');const doorX=o.doorX??(hasGarage?-gs*(stories===2?.2:w*.12):(rand()-.5)*w*.3);
  const floor=porch==='porch'?.45:.32,pw=o.porchW??Math.min(w-1,porch==='porch'?4.5+rand()*3:1.9),pdep=porch==='porch'?2.3:1.35;
  box(g,doorX,floor/2,front+pdep/2,pw,floor,pdep,0xb8ae9c);const p0=S(doorX-pw/2,front),p1=S(doorX+pw/2,front+pdep);pad(p0.d,p1.d,p0.lat,p1.lat,floor);
  const steps=porch==='porch'?3:2,rise1=floor/steps;
  for(let k=0;k<steps;k++){const z=front+pdep+.17+.34*(steps-1-k),y=rise1*(k+.5);box(g,doorX,y/2+rise1*k/2,z,1.5,y+rise1*k,.34,0xbdb4a2);const a=S(doorX-.75,z-.17),b=S(doorX+.75,z+.17);pad(a.d,b.d,a.lat,b.lat,rise1*(k+1));}
  if(porch==='porch'){const ph=2.75;
   for(const s of [-1,0,1]){if(s===0&&pw<5)continue;const cx=doorX+s*(pw/2-.15);box(g,cx,floor+ph/2,front+pdep-.15,.18,ph,.18,0xece6d8);}
   const pr=box(g,doorX,floor+ph+.12,front+pdep/2,pw+.5,.12,pdep+.4,roofC);pr.rotation.x=.12;box(g,doorX,floor+ph-.02,front+pdep+.02,pw+.3,.2,.08,0xe6dfd0);
   for(const s of [-1,1]){const x0=doorX+s*.95,x1=doorX+s*(pw/2-.15);if(Math.abs(x1-x0)<.4)continue;box(g,(x0+x1)/2,floor+.85,front+pdep-.15,Math.abs(x1-x0),.06,.07,0xece6d8);for(let x=Math.min(x0,x1)+.15;x<Math.max(x0,x1);x+=.16)box(g,x,floor+.45,front+pdep-.15,.035,.8,.035,0xece6d8);}
  }else{box(g,doorX,2.72,front+.45,1.7,.1,.95,roofC).rotation.x=.18;for(const s of [-1,1])box(g,doorX+s*.72,2.45,front+.14,.08,.35,.2,0xe6dfd0);}
  const door={x:doorX,y:floor,front,S,g,width:.94,height:2.05,color:doorC,hingeX:doorX+gs*.47,dirX:-gs};
  box(g,doorX,floor+1.08,front+.02,1.26,2.28,.06,0xeee8da);
  if(o.dynamicDoor){box(g,doorX,floor+1.02,front+.036,.96,2.06,.01,doorway);}
  else{box(g,doorX,floor+1.02,front+.05,.94,2.04,.06,doorC);for(const yy of [.55,1.45])box(g,doorX,floor+yy,front+.085,.64,.62,.02,doorC);ball(g,doorX-gs*.36,floor+1.02,front+.1,.035,0xc9b27a);}
  const porchMat=o.porchMat||pick(porchMats);box(g,doorX+gs*.78,floor+1.75,front+.1,.14,.24,.14,porchMat);
  if(porch==='porch'&&rand()<.6){box(g,doorX-gs*(pw/2-.9),floor+.22,front+1.2,.6,.06,.55,0xf1efe9);for(const s of [-1,1])box(g,doorX-gs*(pw/2-.9),floor+.12,front+1.2+s*.24,.6,.24,.04,0xf1efe9);box(g,doorX-gs*(pw/2-.9),floor+.48,front+.97,.6,.5,.05,0xf1efe9);}
  // Windows, avoiding the door and garage.
  const winW=stories===2?1.1:1.35,winH=stories===2?1.35:1.25,count=Math.max(2,Math.round(w/3.3));
  const glassList=[];
  for(let f=0;f<stories;f++){const y=f===0?1.55:4.25;for(let i=0;i<count;i++){const x=-w/2+w*(i+.5)/count;if(f===0&&Math.abs(x-doorX)<1.35)continue;glassList.push(windowUnit(g,x,y,front+.03,winW,winH,shutter,true,o.windowMat&&f===stories-1&&i===count-1?o.windowMat:null));}}
  for(const s of [-1,1]){if(hasGarage&&s===gs)continue;for(let f=0;f<stories;f++){const wg=group(s*(w/2+.03),0,s*Math.PI/2,g);windowUnit(wg,0,f===0?1.55:4.25,0,1,1.2,null);}}
  // Attached garage.
  let garage=null;
  if(hasGarage){const doorW=gw>5?5.1:2.75,dh=2.15,gz=gfront-gd/2;
   if(o.dynamicGarage){const t=.15;box(g,gx-gs*(gw/2-t/2),gh/2,gz,t,gh,gd,wall);box(g,gx+gs*(gw/2-t/2),gh/2,gz,t,gh,gd,wall);box(g,gx,gh/2,gz-gd/2+t/2,gw,gh,t,wall);
    const jw=(gw-doorW)/2;for(const s of [-1,1])box(g,gx+s*(doorW/2+jw/2),gh/2,gfront-.08,jw,gh,.16,wall);box(g,gx,dh+(gh-dh)/2,gfront-.08,doorW,gh-dh,.16,wall);
    box(g,gx,gh/2,gz,gw-.34,gh-.02,gd-.3,garageInside);box(g,gx,gh-.08,gz,.5,.06,.9,new THREE.MeshStandardMaterial({color:0xfff4d8,emissive:0xffe0a0,emissiveIntensity:.8}));
    box(g,gx-gs*(gw/2-.6),.9,gz-gd/2+.55,.9,1.6,.5,0x7d6c58);box(g,gx+gs*(gw/2-.5),.5,gz-gd/2+.8,.5,.9,.5,0x55606a);box(g,gx,1.4,gz-gd/2+.3,1.6,.9,.12,0x8a7f70);
    box(g,gx,.19,gz,gw-.3,.04,gd-.3,0x9d978b);
    garage={x:gx,front:gfront,doorW,doorH:dh,g,S,depth:gd,y:.2};}
   else{box(g,gx,gh/2,gz,gw,gh,gd,wall);const panel=o.garageColor??pick([0xf0ece2,0xe4dccb,0xd9d2c3,0xcfc6b2]);box(g,gx,dh/2+.2,gfront+.03,doorW,dh,.06,panel);for(let k=1;k<4;k++)box(g,gx,.2+k*dh/4,gfront+.065,doorW,.03,.02,0xb3ad9f);if(rand()<.4)for(let k=0;k<(doorW>3?8:4);k++)box(g,gx-doorW/2+doorW*(k+.5)/(doorW>3?8:4),.2+dh*.86,gfront+.07,doorW/(doorW>3?8:4)*.7,.22,.02,darkGlass);}
   box(g,gx,dh+.28,gfront+.02,doorW+.3,.12,.08,0xeee8da);for(const s of [-1,1])box(g,gx+s*(doorW/2+.1),dh/2+.2,gfront+.02,.12,dh,.08,0xeee8da);
   hipRoof(group(gx,gz,0,g),gw,gd,gh,1.3,.35,roofC);
   if(rand()<.6)for(const s of [-1,1])box(g,gx+s*(doorW/2+.45),2.35,gfront+.08,.14,.22,.12,porchMat);
  }
  // Driveway to the garage, or a short parking pad beside the house.
  const drivX=hasGarage?gx:gs*(w/2+2),drivW=hasGarage?Math.max(3.2,(gw>5?5.6:3.4)):3.2,drivEnd=hasGarage?gfront:front-3;
  const a=S(drivX-drivW/2,0),b=S(drivX+drivW/2,0),dD0=Math.min(a.d,b.d),dD1=Math.max(a.d,b.d),endLat=Math.abs(S(0,drivEnd).lat);
  const apron=(dd,x)=>{const t=smooth((Math.abs(x)-4.62)/1.9);return .035+.14*t;};
  grid(side>0?[4.6,5,5.5,6,6.5,7.2,8,...range(9,endLat,2)]:[...range(-endLat,-9,2),-8,-7.2,-6.5,-6,-5.5,-5,-4.6],range(dD0,dD1,.8),apron,0xb4ab95);
  pad(dD0,dD1,side*4.6,side*endLat,(dd,lat)=>apron(dd,lat));drivewayOpenings.push({d:(dD0+dD1)/2,side,d0:dD0,d1:dD1});reserve(dD0-.4,dD1+.4,side*4.6,side*(endLat+.2));
  for(let dd=dD0+2;dd<dD1-1;dd+=3.5)line(scene,[[side*6.6,.18,-(dd)],[side*endLat,.18,-(dd)]].map(v=>v),0x9d9585);
  // Walkway from the steps to the driveway.
  const stepFront=front+pdep+.34*steps;
  {const x0=doorX,x1=drivX-(drivX>doorX?1:-1)*drivW/2,zc=stepFront+.6;box(g,(x0+x1)/2,.14,zc,Math.abs(x1-x0)+1.1,.08,1.1,0xc5bba6);const q0=S(Math.min(x0,x1)-.55,zc-.55),q1=S(Math.max(x0,x1)+.55,zc+.55);pad(q0.d,q1.d,q0.lat,q1.lat,.18);reserve(q0.d,q1.d,q0.lat,q1.lat);}
  const hb0=S(-w/2-(hasGarage&&gs<0?gw:0)-.5,-depth/2-.5),hb1=S(w/2+(hasGarage&&gs>0?gw:0)+.5,front+pdep+.34*steps+.3);reserve(hb0.d,hb1.d,hb0.lat,hb1.lat);
  obstacles.push({d0:Math.min(hb0.d,hb1.d),d1:Math.max(hb0.d,hb1.d),l0:Math.min(hb0.lat,hb1.lat),l1:Math.max(hb0.lat,hb1.lat),house:true});
  // Foundation beds.
  for(const [x0,x1] of [[-w/2+.3,doorX-1.05],[doorX+1.05,w/2-.3]]){if(x1-x0<1)continue;if(hasGarage&&((gs>0&&x0>w/2-1)||(gs<0&&x1<-w/2+1)))continue;box(g,(x0+x1)/2,.14,front+.55,x1-x0,.06,.9,0x5a4432);
   for(let x=x0+.5;x<x1-.3;x+=1.25+rand()*.5){ball(g,x,.45,front+.55,.45+rand()*.25,foliageMat(pick([0x5d7048,0x546a43,0x687a4c])),[1.2,.85,1]);if(rand()<.5)for(let k=0;k<4;k++)ball(g,x+.4+rand()*.4,.26,front+.8+rand()*.3,.07,pick([0xd4665a,0xe8c160,0xd98fb0,0xf0ede0]));}}
  // Side-yard privacy fence with a gate.
  if(o.fence!==false&&rand()<.7){const fs=hasGarage?-gs:(rand()<.5?1:-1),fx0=fs*(w/2),fx1=fs*(w/2+4.5);for(let x=Math.min(fx0,fx1);x<Math.max(fx0,fx1)-.1;x+=.3)box(g,x+.15,.95,-1,.27,1.8,.04,0xa8916f);box(g,(fx0+fx1)/2,.4,-1.03,4.5,.08,.05,0x8d785a);box(g,(fx0+fx1)/2,1.5,-1.03,4.5,.08,.05,0x8d785a);}
  const info={dc,side,setback,w,depth,front,stories,S,g,door,garage,hasGarage,gs,gx,gw,gfront,drivX,drivW,drivD:(dD0+dD1)/2,endLat,stepFront,porch,pdep,floor,doorX,glassList,porchMat,wall,drivD0:dD0,drivD1:dD1};
  houses.push(info);return info;
 }

 // Cars, trees and yard props ---------------------------------------------------------
 function prism(g,wb,wt,zb0,zb1,zt0,zt1,y0,y1,c){const B=[[-wb/2,y0,zb0],[wb/2,y0,zb0],[wb/2,y0,zb1],[-wb/2,y0,zb1]],T=[[-wt/2,y1,zt0],[wt/2,y1,zt0],[wt/2,y1,zt1],[-wt/2,y1,zt1]],v=[];
  const q=(a,b,c2,d)=>v.push(...a,...b,...c2,...a,...c2,...d);q(T[0],T[3],T[2],T[1]);q(B[0],B[1],T[1],T[0]);q(B[2],B[3],T[3],T[2]);q(B[3],B[0],T[0],T[3]);q(B[1],B[2],T[2],T[1]);return tri(g,v,c);}
 const glassC=0x39434b;
 function car(g,kind,color,{lights=false}={}){
  const K={sedan:[1.8,4.75,1.43],van:[1.95,5.1,1.76],suv:[1.9,4.8,1.8],pickup:[2,5.5,1.86]}[kind],[W,L,H]=K,r=kind==='sedan'||kind==='van'?.33:.38;
  const bodyTop=kind==='sedan'?.9:1.02;box(g,0,(bodyTop+.3)/2,0,W,bodyTop-.3,L,color);
  if(kind==='sedan'){prism(g,W*.96,W*.82,-1.05,1.35,-.4,.8,bodyTop,H,glassC);box(g,0,H+.015,.2,W*.8,.03,1.18,color);}
  else if(kind==='van'){prism(g,W*.97,W*.9,-1.75,L/2-.05,-.95,L/2-.2,bodyTop,H,glassC);box(g,0,H+.015,(L/2-.2-.95)/2,W*.88,.04,L/2-.2+.95,color);box(g,W*.49,bodyTop+.33,.6,.02,.5,1.9,color);}
  else if(kind==='suv'){prism(g,W*.97,W*.9,-1.2,L/2-.1,-.65,L/2-.25,bodyTop,H,glassC);box(g,0,H+.015,(L/2-.25-.65)/2,W*.88,.04,L/2-.25+.65,color);}
  else{prism(g,W*.97,W*.9,-1.25,.35,-.8,.3,bodyTop,H,glassC);box(g,0,H+.015,-.25,W*.88,.04,1.08,color);for(const s of [-1,1])box(g,s*(W/2-.05),bodyTop+.25,1.55,.1,.5,2.35,color);box(g,0,bodyTop+.25,L/2-.05,W,.5,.1,color);}
  for(const z of [-L/2+.02,L/2-.02]){box(g,0,.42,z,W+.04,.22,.12,0x3a3b3c);}
  const wheels=[];for(const s of [-1,1])for(const z of [-(L/2-.95),L/2-.95]){const wg=new THREE.Group();wg.position.set(s*(W/2-.12),r,z);g.add(wg);const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.24,12),mat(0x262728));t.rotation.z=Math.PI/2;wg.add(t);const hc=new THREE.Mesh(new THREE.CylinderGeometry(r*.6,r*.6,.25,10),mat(0x9a9d9a));hc.rotation.z=Math.PI/2;wg.add(hc);box(wg,0,r*.4,0,.26,.08,.04,0x6d706d);wheels.push(wg);box(g,s*(W/2+.001),r+.12,z,.02,.08,r*2.3,0x2c2d2e);}
  const head=lights?new THREE.MeshStandardMaterial({color:0xfff4d6,emissive:0xfff0c8,emissiveIntensity:1.2}):mat(0xe8e4d6),tail=lights?new THREE.MeshStandardMaterial({color:0xa02a22,emissive:0xff3020,emissiveIntensity:.9}):mat(0x9e3a30);
  for(const s of [-1,1]){box(g,s*(W/2-.3),bodyTop-.15,-L/2-.01,.38,.16,.05,head);box(g,s*(W/2-.18),bodyTop-.15,L/2+.01,.24,.2,.05,tail);box(g,s*(W/2+.07),bodyTop+.12,-1.0,.14,.1,.18,color);}
  return {wheels,head,tail,L,W};
 }
 const LEAVES=[0x687c4b,0x7b8650,0x86905a,0x596e4b,0x6f7f47,0x5f7450];
 function tree(x,z,size=1,kind='maple'){const d=-z;if(inSideStreet(x,d)||inBulb(x,d)||Math.hypot(x,d-BULB.d)<15)return;const g=group(x,z,rand()*6);const bark=pick([0x665647,0x5d4f42,0x716052]);
  if(kind==='pine'){rod(g,[0,0,0],[0,7*size,0],.2*size,bark,.08*size);const c=pick([0x3f5a45,0x46604a,0x3b5240]);for(let k=0;k<4;k++){const m=new THREE.Mesh(new THREE.ConeGeometry((2.3-k*.45)*size,2.6*size,7),foliageMat(c));m.position.y=(2.2+k*1.35)*size;g.add(m);}obstacles.push({d0:d-.4,d1:d+.4,l0:x-.4,l1:x+.4});return;}
  if(kind==='young'){rod(g,[0,0,0],[0,2.6*size,0],.06,bark,.045);rod(g,[.25,0,0],[.25,1.4,0],.025,0x9c8a6a);for(let k=0;k<3;k++)ball(g,(rand()-.5)*.8,(2.7+rand()*.6)*size,(rand()-.5)*.8,(.65+rand()*.3)*size,foliageMat(pick(LEAVES)),[1,.9,1]);obstacles.push({d0:d-.2,d1:d+.2,l0:x-.2,l1:x+.2});return;}
  const wide=kind==='oak'?1.35:1,trunkH=(kind==='oak'?3.6:4.6)*size;rod(g,[0,0,0],[.2,trunkH,0],.3*size*wide,bark,.17*size);
  for(let k=0;k<3;k++){const a=k*2.1+rand();rod(g,[.1,trunkH*.7,0],[Math.cos(a)*1.6*size*wide,trunkH+.9*size,Math.sin(a)*1.6*size*wide],.1*size,bark,.05*size);}
  const n=kind==='oak'?8:6;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+rand(),r=(k===0?0:1.5+rand()*.9)*size*wide;
   const cx=Math.cos(a)*r,cy=trunkH+(1.4+rand()*1.5)*size-(r>0?.3:0),cz=Math.sin(a)*r,R=(1.55+rand()*.8)*size*(kind==='oak'?1.1:1),leaf=foliageMat(pick(LEAVES),true);
   const crown=new THREE.Mesh(leafGeometry,leaf);crown.position.set(cx,cy,cz);crown.scale.set(R,R*.79,R);crown.rotation.y=a;g.add(crown);
   for(let j=0;j<3;j++){const b=a+j*2.1,tuft=new THREE.Mesh(leafGeometry,leaf);tuft.position.set(cx+Math.cos(b)*R*.76,cy+Math.sin(b*2)*R*.35,cz+Math.sin(b)*R*.76);tuft.scale.set(R*.43,R*.38,R*.46);tuft.rotation.y=b;g.add(tuft);}
  }
  if(kind==='oak')for(let k=0;k<4;k++){const a=k*1.7;rod(g,[0,.3,0],[Math.cos(a)*size*.9,.03,Math.sin(a)*size*.9],.11*size,bark,.025);}
  obstacles.push({d0:d-.45*size,d1:d+.45*size,l0:x-.45*size,l1:x+.45*size});
 }
 function mailbox(lat,d,side){const g=group(lat,-d,side>0?-Math.PI/2:Math.PI/2),style=rand();
  if(style<.2){box(g,0,.65,0,.55,1.3,.55,0x93604c);box(g,0,1.34,0,.62,.08,.62,0xb9b1a0);box(g,0,.95,.28,.3,.22,.02,0x2b2b2b);}
  else{box(g,0,.55,0,.1,1.1,.1,style<.6?0xece6d8:0x6a5846);const c=style<.5?0x2d2f31:pick([0x3a4d63,0x5e3a33,0xd8d2c4]);box(g,0,1.18,.05,.2,.2,.48,c);const top=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.48,8,1,false,0,Math.PI),mat(c));top.rotation.x=Math.PI/2;top.rotation.z=Math.PI/2;top.position.set(0,1.28,.05);g.add(top);box(g,.11,1.3,-.05,.02,.16,.04,0xb4352c);}
  obstacles.push({d0:d-.3,d1:d+.3,l0:lat-.3,l1:lat+.3});}
 function bins(lat,d){const g=group(lat,-d,rand()*.3);const pair=rand()<.6;for(let k=0;k<(pair?2:1);k++){const x=k*.75,c=k?0x33537a:pick([0x3d4a3c,0x3f4246,0x4b4f4a]);box(g,x,.5,0,.58,.95,.68,c);box(g,x,1.0,-.02,.64,.06,.74,k?0x2d6db0:c);for(const s of [-1,1])ball(g,x+s*.26,.1,.3,.1,0x222222);}obstacles.push({d0:d-.5,d1:d+.9,l0:lat-.5,l1:lat+.5});}
 function hose(g,x,z){const coil=new THREE.Mesh(new THREE.TorusGeometry(.26,.03,4,16),mat(0x3f7a3a));coil.rotation.x=Math.PI/2;coil.position.set(x,.2,z);g.add(coil);const c2=coil.clone();c2.position.y=.26;c2.scale.setScalar(.9);g.add(c2);box(g,x,.5,z-.25,.05,.1,.05,0x9a9a90);}
 function lawnChair(g,x,z,rot,c){const cg=group(x,z,rot,g);box(cg,0,.36,0,.52,.05,.5,c);const b=box(cg,0,.72,.26,.52,.65,.05,c);b.rotation.x=-.25;for(const s of [-1,1]){box(cg,s*.27,.52,0,.05,.05,.52,c);box(cg,s*.25,.18,-.2,.04,.36,.04,c);box(cg,s*.25,.18,.2,.04,.36,.04,c);}}
 function bigWheel(g,x,z,rot){const t=group(x,z,rot,g);const fw=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.12,12),mat(0xd8483a));fw.rotation.z=Math.PI/2;fw.position.set(0,.28,-.35);t.add(fw);for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.08,10),mat(0x2b2b2b));w.rotation.z=Math.PI/2;w.position.set(s*.28,.12,.3);t.add(w);}box(t,0,.16,.1,.36,.1,.7,0xe7c23c);box(t,0,.3,.22,.3,.3,.08,0xd8483a);box(t,0,.5,-.35,.4,.04,.04,0xe7c23c);}
 function flamingo(g,x,z){const f=group(x,z,rand()*3,g);rod(f,[0,0,0],[0,.55,0],.008,0x333333);ball(f,0,.66,0,.14,0xe98aa6,[1,.7,1.5]);rod(f,[0,.7,-.15],[0,.95,-.15],.018,0xe98aa6);ball(f,0,.97,-.2,.045,0xe98aa6);}
 function hopscotch(lat,d,side){const x0=lat,cells=[[0,0],[0,1],[-.5,2],[.5,2],[0,3],[-.5,4],[.5,4],[0,5]];for(const [cx,cz] of cells){const x=x0+cx*side*1,z=-(d+cz*.5);line(scene,[[x-.25,.172,z],[x+.25,.172,z],[x+.25,.172,z-.5],[x-.25,.172,z-.5],[x-.25,.172,z]],0xece0c8);}}
 function chalkSun(lat,d,y,c){const pts=[];for(let k=0;k<=18;k++){const a=k/18*Math.PI*2;pts.push([lat+Math.cos(a)*.35,y,-(d+Math.sin(a)*.35)]);}line(scene,pts,c);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;line(scene,[[lat+Math.cos(a)*.45,y,-(d+Math.sin(a)*.45)],[lat+Math.cos(a)*.7,y,-(d+Math.sin(a)*.7)]],c);}}
 // Stroke letters for chalk initials.
 const GLYPH={J:[[[.6,1],[.6,.2],[.4,0],[.15,.1]]],S:[[[.7,.9],[.4,1],[.1,.8],[.3,.55],[.6,.45],[.7,.2],[.4,0],[.05,.15]]],A:[[[0,0],[.35,1],[.7,0]],[[.15,.4],[.55,.4]]],'+':[[[.35,.2],[.35,.8]],[[.05,.5],[.65,.5]]]};
 function chalkText(txt,lat,d,y,c,size=.55){let off=0;for(const ch of txt){for(const stroke of GLYPH[ch]||[])line(scene,stroke.map(([u,v])=>[lat+(off+u)*size,y,-(d+v*size)]),c);off+=.95;}}
 function hoop(lat,d,side,onGarage=null){const g=group(lat,-d,side>0?-Math.PI/2:Math.PI/2);if(onGarage){box(g,0,3.25,0,1.8,1.05,.06,0xefeee8);box(g,0,3.1,.04,.6,.45,.02,0xba5a44);}else{rod(g,[0,0,-.3],[0,3.3,-.3],.06,0x6e6f6c);box(g,0,3.25,0,1.8,1.05,.06,0xefeee8);box(g,0,3.1,.04,.6,.45,.02,0xba5a44);box(g,0,.15,-.5,.8,.3,1.2,0x2c2d2f);}const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.02,5,14),mat(0xc05a33));ring.rotation.x=Math.PI/2;ring.position.set(0,3.05,.3);g.add(ring);return g;}
 function trampoline(lat,d){const g=group(lat,-d);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.8,.06,5,24),mat(0x2e4c7a));ring.rotation.x=Math.PI/2;ring.position.y=.85;g.add(ring);const mat2=new THREE.Mesh(new THREE.CircleGeometry(1.7,20),mat(0x1f2124,{side:THREE.DoubleSide}));mat2.rotation.x=-Math.PI/2;mat2.position.y=.84;g.add(mat2);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;rod(g,[Math.cos(a)*1.8,0,Math.sin(a)*1.8],[Math.cos(a)*1.8,2.5,Math.sin(a)*1.8],.025,0x3a3d42);}const top=new THREE.Mesh(new THREE.TorusGeometry(1.8,.02,4,24),mat(0x3a3d42));top.rotation.x=Math.PI/2;top.position.y=2.5;g.add(top);}
 function swingSet(lat,d,rot){const g=group(lat,-d,rot);for(const s of [-1,1]){rod(g,[s*1.6,0,-.8],[s*1.6,2.3,0],.04,0x4a6a3a);rod(g,[s*1.6,0,.8],[s*1.6,2.3,0],.04,0x4a6a3a);}rod(g,[-1.7,2.3,0],[1.7,2.3,0],.05,0x4a6a3a);for(const x of [-.7,.5]){rod(g,[x-.2,2.3,0],[x-.2,.55,0],.008,0x777777);rod(g,[x+.2,2.3,0],[x+.2,.55,0],.008,0x777777);box(g,x,.52,0,.5,.04,.2,0x2a4a8a);}const sl=box(g,2.6,.8,0,.5,.05,2.6,0xd9c340);sl.rotation.z=.55;}
 function shed(lat,d,rot){const g=group(lat,-d,rot);box(g,0,1.05,0,2.6,2.1,2.2,pick([0xa89a80,0x9b6a55,0x8d9985]));gableRoof(g,2.6,2.2,2.1,.8,.15,.2,pick(ROOFS),0xa89a80,true);box(g,0,.95,1.11,.9,1.8,.04,0xe8e2d6);}

 // Neighborhood layout ---------------------------------------------------------------
 const alexWindow=new THREE.MeshStandardMaterial({color:0x5b6870,emissive:0xffc46a,emissiveIntensity:0,roughness:.35});
 const FRIEND_HOMES={
  jamie:{dc:410,side:1,o:{garageSide:'near',dynamicDoor:true,porch:'stoop',stories:2,setback:18.4,w:10.6,gw:4,garage:true,fence:false,door:0x7a2f2a,wall:0xc6b28c,porchMat:new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:.05})}},
  sam:{dc:704,side:-1,o:{garageSide:'near',dynamicGarage:true,porch:'stoop',stories:1,setback:19,w:12.6,gw:4.4,garage:true,fence:false,wall:0x9ea9a2}},
  alex:{dc:994,side:1,o:{garageSide:'near',dynamicDoor:true,porch:'porch',porchW:5.2,stories:2,setback:19.2,w:11.4,gw:4,garage:true,fence:false,wall:0xd4cfc1,door:0x2f3d55,windowMat:alexWindow,shutters:0x3a4a5a}},
  car:{dc:522,side:-1,o:{garageSide:'far',dynamicGarage:true,stories:2,gw:6.4,garage:true,porch:'porch',wall:0xb9ab92}},
  hoop:{dc:153,side:-1,o:{garageSide:'near',gw:6.4,garage:true,stories:1,porch:'stoop',wall:0xa9b2b6}},
 };
 const homes={};const homeClear=h=>{const a=h.S(0,h.front);reserve(h.drivD0-1.5,a.d+h.side*0+4,h.side*4.6,h.side*(h.setback-h.front));};
 for(let d=-50;d<1120;d+=29)for(const side of [-1,1]){
  if(atJunction(d,side,24))continue;
  const key=Object.keys(FRIEND_HOMES).find(k=>FRIEND_HOMES[k].side===side&&Math.abs(FRIEND_HOMES[k].dc-d)<15);
  const dc=key?FRIEND_HOMES[key].dc:d+rand()*5;const h=house(dc,side,key?FRIEND_HOMES[key].o:{});if(key){homes[key]=h;homeClear(h);}
 }
 // Yard life around each house.
 const carKinds=['sedan','van','suv','sedan','pickup'],carColors=[0x9d7064,0x7d9294,0xcbc0a1,0x4a5560,0x8c8f8e,0xe0ddd4,0x5a2f2f,0x2f3f55];
 for(const h of houses){
  const {side,dc,S}=h,isHome=Object.values(homes).includes(h);
  mailbox(side*5.55,h.drivD1+.9,side);
  if(!isHome&&rand()<.55)bins(side*5.6,h.drivD0-1.6);
  if(!isHome&&h.hasGarage&&rand()<.5){const cg=group(side*(h.endLat-3.2),-h.drivD,side>0?Math.PI/2:-Math.PI/2);car(cg,pick(carKinds),pick(carColors));}
  // Front-yard tree and extras placed only on open lawn.
  for(let k=0;k<2;k++){const tlat=side*(9.3+rand()*2.4),td=dc+(rand()<.5?-1:1)*(3+rand()*9);if(!isHome&&isFree(td,tlat,1.6))tree(tlat,-td,.72+rand()*.4,rand()<.22?'young':(rand()<.15?'pine':'maple'));}
  const yard=[];for(let k=0;k<5;k++){const ld=dc+(rand()-.5)*22,ll=side*(8.6+rand()*4.6);if(isFree(ld,ll,.8))yard.push([ld,ll]);}
  if(!isHome){const r=rand();const [yd,yl]=yard[0]||[];if(yd!==undefined){const g=group(yl,-yd,0);
   if(r<.18)bigWheel(g,0,0,rand()*6);else if(r<.3){lawnChair(g,0,0,rand()*6,pick([0xf2f0ea,0x3f6a4a]));lawnChair(g,.9,.2,rand()*6,pick([0xf2f0ea,0x3f6a4a]));}else if(r<.38)flamingo(g,0,0);else if(r<.45){ball(g,0,.11,0,.11,0xf2f0ea);}else if(r<.52){const pool=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.25,16),mat(0x3d7fb8));pool.position.y=.12;g.add(pool);const wtr=new THREE.Mesh(new THREE.CylinderGeometry(.92,.92,.02,16),mat(0x8fc2d6,{roughness:.2}));wtr.position.y=.23;g.add(wtr);}
    obstacles.push({d0:yd-.6,d1:yd+.6,l0:yl-.6,l1:yl+.6});reserve(yd-.6,yd+.6,yl-.6,yl+.6);}}
  if(rand()<.45){const c=S(h.w/2*(-h.gs)-.4,h.front-1.5);hose(group(c.lat,-c.d,0),0,0);}
  // Backyard glimpses between houses.
  const br=rand(),bd=dc+(rand()<.5?-1:1)*(h.w/2+3.5),bl=side*(h.setback+h.depth/2+4+rand()*4);
  if(br<.18)trampoline(bl,bd);else if(br<.3)swingSet(bl,bd,rand()*3);else if(br<.42)shed(bl,bd,side>0?-Math.PI/2:Math.PI/2);
 }
 {const h=homes.hoop,c=h.S(h.gx,h.gfront+.05);hoop(c.lat,c.d,h.side,true);}
 // Portable hoop at the curb and sidewalk chalk.
 hoop(5.4,-253,1);hopscotch(-6.8,88,-1);hopscotch(7.1,248,1);chalkSun(-7.1,120,.172,0xf2b5c4);chalkSun(7.2,318,.172,0xb6d7ef);
 for(let d=45;d<250;d+=55)for(let k=0;k<6;k++){const x=-7.1+(k%2)*.5,z=-d-Math.floor(k/2)*.6;line(scene,[[x,.17,z],[x+.42,.17,z],[x+.42,.17,z-.48],[x,.17,z-.48],[x,.17,z]],pick([0xedd0a5,0xe3a7b8,0xa8cbe0]));}
 // Front-yard chalk in Jamie's driveway and the flag on a porch.
 {const h=homes.jamie;chalkSun(h.side*9.5,h.drivD+.4,.19,0xf5e08a);}

 // A few ordinary things left out before dinner; no new interaction systems.
 for(const [i,h] of houses.entries()){if(Object.values(homes).includes(h))continue;
  if(i%19===4){const a=h.S(h.drivX-h.gs*(h.drivW/2-.4),h.front+3),g=group(a.lat,-a.d,-h.side*.7);g.position.y=.175;
   box(g,0,.07,0,.11,.035,.5,0x919b9c);rod(g,[0,.12,-.22],[0,.72,-.22],.015,0xb5b8b5);rod(g,[-.15,.73,-.22],[.15,.73,-.22],.016,0x31393c);
   for(const z of [-.21,.21]){const m=new THREE.Mesh(new THREE.TorusGeometry(.047,.014,5,10),mat(0x30383a));m.rotation.y=Math.PI/2;m.position.set(0,.05,z);g.add(m);}}
  if(i%23===7){const a=h.S(h.doorX,h.front+h.pdep-.35);const g=group(a.lat,-a.d,0);g.position.y=h.floor;box(g,0,.012,0,.7,.024,.42,0x6e6048);}
 }
 // Street furniture --------------------------------------------------------------------
 const streetLamps=[];
 const lampPost=(lat,d,armDir)=>{const lm=new THREE.MeshStandardMaterial({color:0xe8d6b8,emissive:0xffb35c,emissiveIntensity:0});const g=group(lat,-d,0);
  rod(g,[0,0,0],[0,7.2,0],.11,0x6b675e,.08);rod(g,[0,7.1,0],[armDir*1.7,7.35,0],.05,0x6b675e);box(g,armDir*1.9,7.28,0,.8,.16,.36,0x5f5c56);box(g,armDir*1.9,7.19,0,.6,.05,.26,lm);
  streetLamps.push({d,lat:lat+armDir*1.9,y:7.15,mat:lm});obstacles.push({d0:d-.3,d1:d+.3,l0:lat-.3,l1:lat+.3});};
 for(let d=5;d<1120;d+=70){if(atJunction(d,1,6)||drivewayOpenings.some(o=>o.side>0&&d>o.d0-1&&d<o.d1+1))d+=6;lampPost(5.62,d,-1);}
 lampPost(8.9,1150.2,-1);
 for(let d=0;d<1125;d+=58){const x=-10.3;if(!isFree(d,x,.3))continue;rod(scene,[x,0,-d],[x,9.2,-d],.14,0x786551,.12);box(scene,x,8.7,-d,1.9,.13,.13,0x786551);for(const s of [-.8,.8])box(scene,x+s,8.82,-d,.06,.12,.06,0xd8d4c8);
  if(d%116===0){const t=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.7,8),mat(0x7b7f7c));t.position.set(x+.35,7.6,-d);scene.add(t);}
  for(const s of [-.8,.8]){const pts=[];for(let j=0;j<=12;j++){const t=j/12;pts.push([x+s,8.85-Math.sin(t*Math.PI)*.6,-d-58*t]);}if(d<1120)line(scene,pts,0x5a504a);}}
 for(let d=80;d<1110;d+=140){const side=(d/140|0)%2?1:-1;if(!isFree(d,side*5.6,.5))continue;const g=group(side*5.6,-d,0);box(g,0,.35,0,.26,.7,.26,0xc8b53a);box(g,0,.74,0,.3,.1,.3,0xc8b53a);ball(g,0,.82,0,.1,0xc8b53a);for(const s of [-1,1])box(g,s*.18,.5,0,.1,.1,.1,0xc8b53a);}
 const manhole=mat(0x4b4a47,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 for(let d=60;d<1120;d+=95){const m=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.02,14),manhole);m.position.set(((d/95|0)%2?.8:-1.2),roadCrown(d,1)-.004,-d);scene.add(m);}
 const patch=mat(0x5a5a57,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 for(let k=0;k<22;k++){const d=rand()*1100,x=(rand()-.5)*6,w=.8+rand()*1.6,l=1.2+rand()*2.6;surface(x-w/2,x+w/2,d,d+l,(dd,xx)=>roadCrown(dd,xx)+.002,patch,w,l/2);}
 for(let k=0;k<34;k++){const d=rand()*1110,x=(rand()-.5)*8,pts=[];let px=x,pd=d;for(let j=0;j<5;j++){pts.push([px,roadCrown(pd,px)+.006,-pd]);px+=(rand()-.5)*.5;pd+=.3+rand()*.5;}line(scene,pts,0x51504c);}

 // Curbs, sidewalks, lawns ---------------------------------------------------------------
 const onDrive=(side,d0,d1)=>drivewayOpenings.some(o=>o.side===side&&d1>o.d0&&d0<o.d1);
 const inDrive=(x,d)=>drivewayOpenings.some(o=>Math.sign(x)===o.side&&d>o.d0&&d<o.d1&&Math.abs(x)<houses.find(h=>h.side===o.side&&h.drivD0===o.d0).endLat+.05);
 for(const side of [-1,1]){
  for(let d=-120;d<1132;d+=2){if(atJunction(d+1,side,4.6)||onDrive(side,d,d+2))continue;box(scene,side*4.85,.045,-d-1,.3,.21,2,curbC);}
  for(let d=10;d<1120;d+=48){if(atJunction(d,side,6)||onDrive(side,d-1,d+1))continue;box(scene,side*4.72,.08,-d,.02,.07,.9,0x2a2a2a);}
  const breaks=[];for(const o of drivewayOpenings)if(o.side===side)breaks.push(o.d0,o.d1);for(const j of JUNCTIONS)if(j.side===side)breaks.push(j.d-10,j.d-9.3,j.d-6.25,j.d-4.3,j.d+4.3,j.d+6.25,j.d+9.3,j.d+10,...range(j.d-10,j.d+10,1));
  const ds=[...new Set([...range(-120,1131.8,2),...breaks.filter(b=>b>-120&&b<1131.8)].map(v=>+v.toFixed(3)))].sort((a,b)=>a-b);
  grid(side>0?[6.35,7.1,7.85]:[-7.85,-7.1,-6.35],ds,SIDEWALK,concrete,(x,d)=>inDrive(x,d)||atJunction(d,side,6.25));
  for(let d=-120;d<1130;d+=4){if(onDrive(side,d-.2,d+.2)||atJunction(d,side,6.4))continue;line(scene,[[side*6.35,SIDEWALK+.006,-d],[side*7.85,SIDEWALK+.006,-d]],0xa79f8d);}
  const lawnDs=[...new Set([...range(-120,1150,2),...breaks,...range(1124,1150,.5)].filter(v=>v>=-120&&v<=1150).map(v=>+v.toFixed(3)))].sort((a,b)=>a-b);
  const xs=[5,5.35,5.7,6,6.35,7.1,7.85,8.6,9.5,10.5,11.5,12.5,13.5,14.5,15.5,17,19,21,23,26,29,32,36,40,45,50,56,62,70,80];
  grid(xs.map(x=>x*side).sort((a,b)=>a-b),lawnDs,LAWN,grassMat,(x,d)=>inDrive(x,d)||inSideStreet(x,d)||inBulb(x,d));
 }
 // Cul-de-sac curb and sidewalk ring.
 for(let k=0;k<64;k++){const a=k/64*Math.PI*2,r=BULB.r+.15;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.45)continue;const c=box(scene,Math.sin(a)*r,.045,-(BULB.d-Math.cos(a)*r),.3,.21,1.3,curbC);c.rotation.y=Math.PI/2+a;}
 {const p=[],ix=[],A=48,a0=.573;for(const r of [12.4,13.9])for(let k=0;k<=A;k++){const a=a0+(Math.PI*2-2*a0)*k/A;const lat=Math.sin(a)*r,d=BULB.d-Math.cos(a)*r;p.push(lat,d>1150?Math.max(SIDEWALK,knoll(d,lat)+.04):SIDEWALK,-d);}for(let k=0;k<A;k++)ix.push(k,k+A+1,k+1,k+1,k+A+1,k+A+2);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(ix);const ring=new THREE.Mesh(geo,M(concrete));ring.name='lookout-walk';scene.add(ring);}
 // The lookout rise and the field beyond it.
 {const xs=[...new Set([...range(-80,-16,8),...range(-16,16,.5),...range(16,80,8)].map(v=>+v.toFixed(2)))].sort((a,b)=>a-b);
  const ds=[...new Set([...range(1150,1157,.5),...range(1157,1182,1),...range(1182,1260,4),...range(1260,1650,15)].map(v=>+v.toFixed(2)))].sort((a,b)=>a-b);
  grid(xs,ds,(d,x)=>knoll(d,x),grassMat,(x,d)=>inBulb(x,d)&&d<1154);
  const tall=mat(0x8e8a55,{flatShading:true});foliage.push(tall);
  for(let k=0;k<140;k++){const lat=(rand()-.5)*30,d=1168+rand()*9;if(Math.abs(lat)<1&&d<1172)continue;const c=new THREE.Mesh(new THREE.ConeGeometry(.12+rand()*.1,.5+rand()*.5,4),tall);c.position.set(lat,knoll(d,lat)+.2,-d);c.rotation.set((rand()-.5)*.3,rand()*3,(rand()-.5)*.3);scene.add(c);}
  for(let lat=-17;lat<=17.1;lat+=2.6){rod(scene,[lat,0,-LOOKOUT.fenceD],[lat,1.25+knoll(LOOKOUT.fenceD,lat),-LOOKOUT.fenceD],.07,0x8a7760,.06);}
  for(const y of [.55,1.05]){for(let lat=-17;lat<17;lat+=2.6){rod(scene,[lat,y+knoll(LOOKOUT.fenceD,lat),-LOOKOUT.fenceD+.05],[lat+2.6,y+knoll(LOOKOUT.fenceD,lat+2.6)+(rand()-.5)*.05,-LOOKOUT.fenceD+.05],.055,0x9a856b,.05);}}
  obstacles.push({d0:LOOKOUT.fenceD-.3,d1:LOOKOUT.fenceD+.3,l0:-18,l1:18});
  // A bench facing the sunset, and the oak everyone used to meet under.
  {const b=LOOKOUT.bench,g=group(b.lat,-b.d,0),y=knoll(b.d,b.lat)-LAWN;g.position.y=y;for(let k=0;k<3;k++)box(g,0,.46,-.18+k*.14,1.6,.04,.11,0x8e7458);for(let k=0;k<2;k++)box(g,0,.66+k*.16,.2,1.6,.1,.04,0x8e7458);for(const s of [-1,1]){box(g,s*.7,.23,-.1,.07,.46,.07,0x3d3b38);box(g,s*.7,.5,.2,.07,1,.07,0x3d3b38);box(g,s*.7,.6,0,.07,.05,.5,0x3d3b38);}obstacles.push({d0:b.d-.45,d1:b.d+.45,l0:b.lat-.95,l1:b.lat+.95});}
  {const o=LOOKOUT.oak;tree(o.lat,-o.d,1.35,'oak');}
  {const g=group(-12.5,-1172.2,0);g.position.y=knoll(1172.2,-12.5)-LAWN;ball(g,0,.24,0,.12,0xb8643a);}
  chalkSun(3.2,1147.5,.034,0xf2cf7a);chalkText('JSA',-1.4,1149.5,.034,0xe8e2d0,.6);hopscotch(-5.8,1135,-1);
  for(let k=0;k<70;k++){const lat=(rand()-.5)*160,d=1250+rand()*110;tree(lat,-d,1.2+rand()*.8,rand()<.35?'pine':'maple');}
  for(let k=0;k<8;k++)tree((rand()<.5?-1:1)*(15+rand()*10),-(1122+rand()*30),.8+rand()*.5,rand()<.3?'young':'maple');
 }
 for(let d=-40;d<1128;d+=26){for(const side of [-1,1]){const lat=side*(39+rand()*22);if(isFree(d,lat,2))tree(lat,-d,1.35+rand()*.4,rand()<.28?'pine':(rand()<.3?'oak':'maple'));}}

 // Bend everything onto the route, then merge by material --------------------------------
 scene.updateMatrixWorld(true);
 const statics=[];scene.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints)statics.push(o);});
 const v=new THREE.Vector3();
 for(const o of statics){const smoothLeaf=o.geometry===leafGeometry,g=o.geometry.clone(),p=g.attributes.position,n=g.attributes.normal,nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld),nv=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);const q=groundPoint(-v.z,v.x);
   if(smoothLeaf){nv.fromBufferAttribute(n,i).applyMatrix3(nm).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),-heading(-v.z));n.setXYZ(i,nv.x,nv.y,nv.z);}
   p.setXYZ(i,q.x,q.y+v.y,q.z);}g.computeBoundingSphere();if(o.isMesh&&!smoothLeaf)g.computeVertexNormals();o.geometry=g;o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);scene.add(o);o.updateMatrixWorld(true);}
 for(const o of scene.children.slice())if(o.isGroup&&o.children.length===0)scene.remove(o);
 const batches=new Map(),lineBatches=new Map(),originals=[],colorMaterials=new Map();
 function batchMaterial(m){
  if(m===grassMat||m===asphalt||m.emissive?.getHex()!==0||m.transparent||!m.isMeshStandardMaterial)return m;
  const isLeaf=foliage.includes(m),kind=m.userData.surface||'',key=[m.roughness,m.metalness,m.side,isLeaf?'leaf':kind,m.alphaTest,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits].join(':');
  if(!colorMaterials.has(key)){const b=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:m.roughness,metalness:m.metalness,side:m.side,map:m.map,alphaTest:m.alphaTest,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits});if(kind)surfaceMaterial(b,kind);if(isLeaf)foliage.push(b);colorMaterials.set(key,b);}
  return colorMaterials.get(key);
 }
 for(const o of statics){
  if(o.isLine){const key=o.material.color.getHex();if(!lineBatches.has(key))lineBatches.set(key,[]);const arr=lineBatches.get(key),pos=o.geometry.attributes.position;const segs=o.isLineSegments;for(let i=0;i<pos.count-1;i+=segs?2:1){arr.push(pos.getX(i),pos.getY(i),pos.getZ(i),pos.getX(i+1),pos.getY(i+1),pos.getZ(i+1));}o.removeFromParent();continue;}
  if(!o.isMesh)continue;const material=batchMaterial(o.material),geo=o.geometry,index=geo.index,pos=geo.attributes.position,norm=geo.attributes.normal,uv=geo.attributes.uv,col=o.material.color;
  for(let i=0;i<(index?index.count:pos.count);i+=3){const js=[0,1,2].map(k=>index?index.getX(i+k):i+k),x=js.reduce((a,j)=>a+pos.getX(j),0)/3,z=js.reduce((a,j)=>a+pos.getZ(j),0)/3;
   const key=material.uuid+':'+Math.floor(x/110)+':'+Math.floor(z/110);if(!batches.has(key))batches.set(key,{material,p:[],n:[],c:[],uv:[]});const b=batches.get(key);
   for(const j of js){b.p.push(pos.getX(j),pos.getY(j),pos.getZ(j));b.n.push(norm.getX(j),norm.getY(j),norm.getZ(j));if(material.vertexColors)b.c.push(col.r,col.g,col.b);if(material.map)b.uv.push(uv?uv.getX(j):0,uv?uv.getY(j):0);}}

  originals.push(o);o.removeFromParent();
 }
 const merged=[];
 for(const b of batches.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));if(b.c.length)g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));if(b.uv.length)g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const mesh=new THREE.Mesh(g,b.material);mesh.castShadow=b.material!==grassMat&&b.material!==asphalt;mesh.receiveShadow=true;scene.add(mesh);merged.push(mesh);}
 for(const [color,arr] of lineBatches){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.computeBoundingSphere();scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color})));}

 // Surface height queries for riders and walkers -----------------------------------------
 function authoredY(d,lat){
  let best=null;for(const p of pads)if(d>=p.d0&&d<=p.d1&&lat>=p.l0&&lat<=p.l1){const y=typeof p.y==='function'?p.y(d,lat):p.y;if(best===null||y>best)best=y;}
  if(best!==null)return best;const a=Math.abs(lat),rb=Math.hypot(lat,d-BULB.d);
  if(a<=ROAD_HALF&&d<=ROAD_END)return Math.max(roadCrown(d,lat),rb<=BULB.r?.03:0);
  if(rb<=BULB.r)return .03;
  if(inSideStreet(lat,d))return .03;
  if(rb>=12.4&&rb<=13.9&&d>1131)return d>1150?Math.max(SIDEWALK,knoll(d,lat)+.04):SIDEWALK;
  if(d>1150)return knoll(d,lat);
  if(a<5&&d<1132&&!atJunction(d,Math.sign(lat),4.6))return CURB_TOP;

  if(a>=6.35&&a<=7.85&&d<1131.8&&!atJunction(d,Math.sign(lat),6.25))return SIDEWALK;
  return LAWN;
 }
 const groundY=(d,lat)=>groundPoint(d,lat).y+authoredY(d,lat);

 // Dynamic pieces placed in the bent world -------------------------------------------------
 function anchor(d,lat,y=0){const g=new THREE.Group(),p=groundPoint(d,lat),a=groundPoint(d-.5,lat),b=groundPoint(d+.5,lat);g.position.set(p.x,p.y+y,p.z);g.rotation.y=-heading(d);g.scale.z=Math.hypot(b.x-a.x,b.z-a.z);scene.add(g);return g;}
 function houseAnchor(h,x,z,y=0){const s=h.S(x,z),a=anchor(s.d,s.lat,y),r=new THREE.Group();r.rotation.y=h.side>0?-Math.PI/2:Math.PI/2;a.add(r);return {root:a,g:r,d:s.d,lat:s.lat};}
 function makeDoor(h){const D=h.door,{g,d,lat}=houseAnchor(h,D.hingeX,D.front+.04,D.y);const pivot=new THREE.Group();g.add(pivot);
  const leaf=new THREE.Mesh(boxGeo,mat(D.color));leaf.scale.set(D.width,2.04,.05);leaf.position.set(D.dirX*D.width/2,1.02,0);leaf.castShadow=true;pivot.add(leaf);
  for(const yy of [.55,1.45]){const pnl=new THREE.Mesh(boxGeo,mat(D.color));pnl.scale.set(.64,.62,.02);pnl.position.set(D.dirX*D.width/2,yy,.035);pivot.add(pnl);}
  const knob=new THREE.Mesh(sphereGeo,mat(0xc9b27a));knob.scale.setScalar(.035);knob.position.set(D.dirX*(D.width-.1),1.02,.06);pivot.add(knob);
  const open=h.S(D.x,D.front+.9),inside=h.S(D.x,D.front-1.2),stepOut=h.S(D.x,h.stepFront+.5),porch=h.S(D.x,D.front+.4),latch=h.S(D.x+D.dirX*.42,D.front+Math.min(1.2,h.pdep-.2));
  return {pivot,d,lat,open:0,set(t){this.open=t;pivot.rotation.y=-D.dirX*t*1.75;},threshold:h.S(D.x,D.front),outside:open,inside,steps:stepOut,porch,latch,floor:D.y,house:h};}
 function makeGarage(h){const G=h.garage,{g,d,lat}=houseAnchor(h,G.x,G.front-.22,G.y);const panel=new THREE.Group();g.add(panel);
  const c=0xeeeae0;const slab=new THREE.Mesh(boxGeo,mat(c));slab.scale.set(G.doorW-.04,G.doorH,.06);slab.castShadow=true;panel.add(slab);for(let k=1;k<4;k++){const gr=new THREE.Mesh(boxGeo,mat(0xb3ad9f));gr.scale.set(G.doorW-.04,.03,.02);gr.position.set(0,-G.doorH/2+k*G.doorH/4,.035);panel.add(gr);}
  const gar={panel,d,lat,open:0,set(t){this.open=t;const H=G.doorH,by=t*H,tz=-H*Math.sqrt(Math.max(0,1-(1-t)**2));const bot=[by,0],top=[H,tz];panel.position.set(0,(bot[0]+top[0])/2,(bot[1]+top[1])/2);panel.rotation.x=Math.atan2(top[1]-bot[1],top[0]-bot[0])*-1;},
   mouth:h.S(G.x,G.front+.6),inside:h.S(G.x,G.front-G.depth+1.6),back:h.S(G.x,G.front-G.depth+.9),house:h,doorW:G.doorW};gar.set(0);return gar;}
 const doors={},garages={};
 for(const k of ['jamie','alex'])doors[k]=makeDoor(homes[k]);for(const k of ['sam','car'])garages[k]=makeGarage(homes[k]);
 // Street signs, painted once into small textures when a canvas is available.
 function paint(w,h,draw){try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=w;c.height=h;draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}catch{return null;}}
 const text=(g,str,x,y,size,color='#1b1b1b')=>{g.fillStyle=color;g.font=`bold ${size}px Arial, Helvetica, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(str,x,y);};
 function signPost(d,lat,y,w,h,tex,fallback,{face=0,back=0x9a9c98,alpha=false}={}){const a=anchor(d,lat,0),g=new THREE.Group();g.rotation.y=face;a.add(g);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,y+h/2,6),mat(0x8d908b));pole.position.y=(y+h/2)/2;pole.castShadow=true;g.add(pole);
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(w,h),tex?new THREE.MeshStandardMaterial({map:tex,roughness:.55,transparent:alpha,alphaTest:alpha?.5:0}):mat(fallback));plate.position.set(0,y,.03);g.add(plate);
  const rear=new THREE.Mesh(new THREE.PlaneGeometry(w*.98,h*.98),mat(back,{side:THREE.BackSide}));rear.position.set(0,y,.025);g.add(rear);obstacles.push({d0:d-.15,d1:d+.15,l0:lat-.15,l1:lat+.15});return g;}
 const diamond=(g,w,h,draw)=>{g.translate(w/2,h/2);g.rotate(Math.PI/4);g.fillStyle='#e8c33a';g.strokeStyle='#1b1b1b';g.lineWidth=10;const s=w*.66;g.beginPath();g.rect(-s/2,-s/2,s,s);g.fill();g.stroke();g.rotate(-Math.PI/4);g.translate(-w/2,-h/2);draw(g,w,h);};
 signPost(36,5.75,2.2,.9,.9,paint(256,256,(g,w,h)=>diamond(g,w,h,()=>{text(g,'SLOW',w/2,h*.36,38);text(g,'CHILDREN',w/2,h*.52,27);text(g,'AT PLAY',w/2,h*.64,27);})),0xe8c33a,{alpha:true});
 signPost(1004,5.75,2.1,.75,.75,paint(256,256,(g,w,h)=>{g.fillStyle='#e8c33a';g.fillRect(8,8,w-16,h-16);g.strokeStyle='#1b1b1b';g.lineWidth=8;g.strokeRect(14,14,w-28,h-28);text(g,'NO',w/2,h*.38,56);text(g,'OUTLET',w/2,h*.62,50);}),0xe8c33a);
 const blade=(name)=>paint(256,48,(g,w,h)=>{g.fillStyle='#2f6b45';g.fillRect(0,0,w,h);g.strokeStyle='#e8efe6';g.lineWidth=3;g.strokeRect(4,4,w-8,h-8);text(g,name,w/2,h/2+1,26,'#f2f5ef');});
 for(const [j,name] of [[JUNCTIONS[0],'MAPLE CT'],[JUNCTIONS[1],'BIRCH LN']]){const d=j.d-5.9,lat=j.side*5.6;const g=signPost(d,lat,2.65,1.1,.2,blade(name),0x2f6b45,{face:j.side*Math.PI/2});
  const main=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.2),(()=>{const t=blade('LINDEN DR');return t?new THREE.MeshStandardMaterial({map:t,roughness:.55,side:THREE.DoubleSide}):mat(0x2f6b45);})());main.position.set(0,2.9,0);main.rotation.y=-j.side*Math.PI/2;g.add(main);
  const oct=paint(128,128,(g2,w,h)=>{g2.fillStyle='#b8322c';g2.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;g2.lineTo(w/2+Math.cos(a)*w*.48,h/2+Math.sin(a)*h*.48);}g2.closePath();g2.fill();g2.strokeStyle='#f2efe8';g2.lineWidth=5;g2.stroke();text(g2,'STOP',w/2,h/2+2,34,'#f7f4ee');});
  signPost(j.d+5.9,j.side*5.7,2.1,.62,.62,oct,0xb8322c,{face:j.side*Math.PI/2,alpha:true});}
 return {scene,road,originals,merged,windowMats,porchMats,streetLamps,foliage,grassMat,groundY,authoredY,obstacles,homes,doors,garages,anchor,houseAnchor,alexWindow,car,drivewayOpenings,houses,material:mat,LOOKOUT};
}
