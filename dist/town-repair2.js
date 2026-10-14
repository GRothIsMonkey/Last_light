// Targeted Chapter Four continuation: civic entry, green, roadside businesses and backdrop homes.
// Navigation, lot envelopes and the story remain owned by town-plan/chapter4.
import * as THREE from './three.module.js';
import {seeded,hashSeed} from './kit.js';
import {planHouse,buildHouse} from './houses.js';
import {TY,TW,TL,BLD,footprint,mainBase,landY,DOORS,townY} from './town-plan.js';

export function parkLawnMaterial(W){
 const n=128,data=new Uint8Array(n*n*4),r=seeded(7421);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,v=Math.round(210+22*Math.sin(x*Math.PI*4/n)*Math.cos(y*Math.PI*2/n)+r()*19);data.set([v,v,Math.round(v*.94),255],i);}
 const tex=new THREE.DataTexture(data,n,n);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.generateMipmaps=true;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.magFilter=THREE.LinearFilter;tex.needsUpdate=true;
 const m=new THREE.MeshStandardMaterial({color:0x899360,roughness:.996,map:tex});m.userData.keep=true;m.userData.surface='park-lawn';
 m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=(modelMatrix*vec4(position,1.)).xz/7.;');};m.customProgramCacheKey=()=> 'park-lawn-world-uv';W.grassMats.push(m);return m;
}

export function libraryEntry({g,B,K,stone,metal,glassClear,sign}){
 const st=stone(0xd8ceba),br=metal(0x65523a);
 for(const x of [-2.08,2.08]){B(g,x,1.56,-.1,.22,3.12,.42,st);B(g,x*.935,1.14,-.18,.08,2.28,.10,br);}
 B(g,0,3.03,-.1,4.38,.18,.42,st);B(g,0,2.29,-.18,3.92,.09,.10,br);
 B(g,0,2.63,-.18,3.86,.59,.035,glassClear);B(g,0,.015,-.13,3.93,.03,.65,stone(0xa9a395));
 sign(g,{text:'PUBLIC LIBRARY',bg:'',fg:'#e7dcc1',font:'serif',border:false},2.9,.30,{y:2.63,z:-.14});
 for(const x of [-4.16,4.16]){K.rod(g,[x,.35,3.3],[x,.98,.3],.035,br);for(const z of [.4,1.8,3.2])K.rod(g,[x,-.72+(.72*(3.3-z)/3),z],[x,.35+.63*(3.3-z)/3,z],.025,br);}
}
export function libraryDoors({live,D,at,B,metal,timber,glassClear}){
 const spec=DOORS['library-front'],leaves=[],br=metal(0x65523a),wood=timber(0x735337),h=2.24,w=1.91;
 for(const side of [-1,1]){const hinge=at(live,135+side*1.96,TY+.75,44.25,0),x=-side*w/2;
  hinge.name='library-double-door';for(const dx of [-w/2+.045,w/2-.045])B(hinge,x+dx,h/2,0,.09,h,.09,br);
  for(const [y,hh] of [[.12,.24],[.52,.09],[h-.045,.09]])B(hinge,x,y,0,w,hh,.09,y<.3?wood:br);
  B(hinge,x,1.36,0,w-.18,1.58,.025,glassClear);
  for(const z of [-.075,.075]){B(hinge,x,1.02,z,w-.27,.045,.035,br);B(hinge,x-side*.54,1.12,z,.035,.38,.035,br);}
  leaves.push({hinge,sign:side});
 }
 D.doors['library-front']={leaves,open:spec.open,cur:spec.open};
}

export function parkDetails({out,K,B,stone,earth,dull}){
 const edge=stone(0xb3aa93),soil=earth(0x70634d),green=dull(0x68764a),dry=earth(0x9b9273),base=townY(120,20);
 for(const u of [132.9,137.1])B(out,u,base+.015,25.5,.14,.035,24.9,edge);
 for(const v of [25.9,28.1])for(const [a,b] of [[99,132.8],[137.2,171]])B(out,(a+b)/2,base+.015,v,b-a,.035,.14,edge);
 for(const [u,v,w,d] of [[104,14.5,8,1.6],[166,14.5,8,1.6],[104,37.4,8,1.8],[167,36.6,5,1.8]]){
  B(out,u,base+.014,v,w,.024,d,soil);for(const s of [-1,1])B(out,u,base+.037,v+s*d/2,w+.12,.07,.12,edge);
  for(const s of [-1,1])B(out,u+s*w/2,base+.037,v,.12,.07,d,edge);
  const r=seeded(hashSeed(22,u,v));for(let i=0;i<w*4;i++){const x=u+(r()-.5)*(w-.4),z=v+(r()-.5)*(d-.3);K.ball(out,x,base+.08,z,.17,green,[1,.5,1]);if(i%4===0)K.ball(out,x,base+.14,z,.045,dull(0xb4a66b));}
 }
 // A paired low perennial bed marks the main path without blocking the green.
 for(const u of [128.5,141.5]){const v=16.5,w=5,d=2.4,ring=new THREE.Mesh(new THREE.RingGeometry(.89,1,32),edge),bed=new THREE.Mesh(new THREE.CircleGeometry(.89,32),soil);
  for(const m of [ring,bed]){m.rotation.x=-Math.PI/2;m.scale.set(w/2,d/2,1);m.position.set(u,base+.022,v);out.add(m);}
  const r=seeded(hashSeed(743,u));for(let i=0;i<28;i++){const a=r()*Math.PI*2,rr=Math.sqrt(r())*.78,x=u+Math.cos(a)*rr*w/2,z=v+Math.sin(a)*rr*d/2;K.ball(out,x,base+.13,z,.25,green,[1,.55,1]);if(i%2===0){K.rod(out,[x,base+.12,z],[x,base+.31,z],.012,green);K.ball(out,x,base+.32,z,.065,dull(i%4?0xcbb87a:0x9d8f9c),[1,.4,1]);}}
 }
 for(const [u,v] of [[104,18],[166,18],[104,33],[166,31],[124,31],[146,22]]){const m=new THREE.Mesh(new THREE.CircleGeometry(.96,16),soil);m.rotation.x=-Math.PI/2;m.position.set(u,base+.013,v);out.add(m);}
 for(const [u,v] of [[131.4,20],[138.6,20],[131.4,33],[138.6,33]]){const m=new THREE.Mesh(new THREE.CircleGeometry(.8,16),dry);m.rotation.x=-Math.PI/2;m.scale.set(1,.52,1);m.position.set(u,base+.012,v);out.add(m);}
}

export function serviceBuildings(A){
 const {out,at,B,K,sign,brick,stone,concrete,plaster,metal,paint,dull,glassDark,glassClear,D,LV,NEON,quadInto,quads}=A;
 const cream=paint(0xe1ddd0),red=paint(0xa63528),steel=metal(0x8a8b83),blue=paint(0x38647f),dark=dull(0x353b3a);
 {const b=BLD.gas,F=footprint(b),u=(b.u0+b.u1)/2,y=mainBase(u)+.02,g=at(out,u,y,F.front,Math.PI),w=b.u1-b.u0;b.group=g;
  B(g,0,b.h/2,-b.d/2,w,b.h,b.d,plaster(0xded9c8));B(g,0,.1,-b.d/2,w+.02,1.2,b.d+.12,brick(0x8d6550));
  B(g,0,3.45,.18,w+.3,.16,.65,cream);B(g,0,4.15,.16,w+.4,.6,.48,red);B(g,0,4.52,-b.d/2,w+.4,.12,b.d+.4,steel);
  for(const x of [-5.35,-2.7,2.7,5.35]){B(g,x,1.95,.11,2.45,2.35,.07,glassDark);B(g,x,1.95,.16,2.3,2.2,.02,glassClear);for(const dx of [-1.22,1.22])B(g,x+dx,1.95,.18,.07,2.4,.09,cream);B(g,x,1.95,.19,2.45,.045,.06,cream);}
  B(g,0,1.3,.13,1.6,2.6,.09,steel);B(g,0,1.46,.19,1.37,2.16,.025,glassDark);B(g,.51,1.12,.25,.04,.5,.055,cream);
  sign(g,{text:'HOLLOW FUEL & FOOD',sub:'COLD DRINKS · ICE · LOTTO',bg:'#a63528',fg:'#f3ebd9',font:'block',border:false},13,.57,{y:4.15,z:.41});
  sign(g,{text:'OPEN',sub:'6 AM — 11 PM',bg:'#e4dcc6',fg:'#4b514e',font:'sans',border:true},.62,.52,{x:.03,y:1.6,z:.22});
  B(g,6.8,.74,.85,1.8,1.48,1.25,cream);for(const x of [6.38,7.22])B(g,x,.76,1.49,.75,1.28,.025,steel);sign(g,{text:'ICE',bg:'#e1ddd0',fg:'#38647f',font:'block',border:false},1.35,.33,{x:6.8,y:1.23,z:1.51});
  const canopy=at(out,-52,y,18);B(canopy,0,4.66,0,15,.22,9.4,cream);B(canopy,0,5.02,0,15.2,.5,9.6,red);B(canopy,0,5.31,0,15.25,.08,9.65,steel);
  for(const [x,z] of [[-6.5,-3.8],[6.5,-3.8],[-6.5,3.8],[6.5,3.8]]){B(canopy,x,2.29,z,.32,4.58,.32,cream);B(canopy,x,.27,z,.5,.54,.5,concrete(0xaaa494));}
  for(const x of [-6.5,6.5])B(canopy,x,4.44,0,.25,.28,8,steel);
  const brand=sign(canopy,{text:'HOLLOW',bg:'#a63528',fg:'#f3ebd9',font:'block',border:false},4,.35,{y:5.02,z:-4.81,ry:Math.PI});quadInto(quads.sign,canopy,brand,4,.35,{y:5.02,z:4.81});
  for(const [i,x] of [-3,3].entries()){const p=at(canopy,x,0,0);B(p,0,.1,0,1.3,.2,1.7,concrete(0xb4ac9a));B(p,0,.69,0,.85,1.18,.6,red);B(p,0,1.51,0,1.02,.66,.66,cream);B(p,0,1.88,0,1.08,.08,.72,red);
   for(const s of [-1,1]){const f=at(p,0,0,s*.34,s<0?Math.PI:0);B(f,0,1.58,.01,.72,.33,.025,glassDark);sign(f,{text:'8.88  8.88',bg:'#bec4a0',fg:'#313b33',font:'mono',border:false},.65,.16,{y:1.62,z:.029});for(const dx of [-.25,0,.25])B(f,dx,1.25,.03,.16,.11,.04,paint(dx===0?0xafa35a:0x79836b));}
   for(const s of [-1,1]){const pts=[[s*.55,1.7,0],[s*.76,1.3,0],[s*.78,.44,0],[s*.6,.32,0],[s*.56,.94,0]];for(let j=1;j<pts.length;j++)K.rod(p,pts[j-1],pts[j],.025,dark);B(p,s*.57,1.02,0,.08,.26,.1,dark);}
   sign(canopy,{text:String(i+1),bg:'#e1ddd0',fg:'#a63528',font:'block',border:false},.35,.38,{x,y:4.4,z:-.1,ry:Math.PI});D.fixtures.push({group:canopy,x,y:4.52,z:0,w:1.4,d:.5,lv:LV.shop+17});
  }
  const ps=at(out,-34,y,12.4);B(ps,0,2.5,0,.25,5,.25,steel);B(ps,0,5.4,0,2.3,1.6,.32,red);const uv=sign(ps,{text:'REGULAR  3.59⁹',sub:'PLUS 3.71⁹ · DIESEL 3.89⁹',bg:'#202725',fg:'#e4c86e',font:'mono',border:false},2.1,1.1,{y:5.4,z:.17,lit:true,lvl:LV.neon+NEON.gasPrice});quadInto(quads.lit,ps,uv,2.1,1.1,{y:5.4,z:-.17,ry:Math.PI,lvl:LV.neon+NEON.gasPrice});
 }
 {const b=BLD.carwash,F=footprint(b),u=(b.u0+b.u1)/2,y=mainBase(u)+.02,g=at(out,u,y,F.front),w=b.u1-b.u0;b.group=g;
  const wall=plaster(0xc8ceca),base=stone(0x8d9592);
  B(g,0,b.h/2,-13,w,b.h,18,wall);B(g,0,4.45,-2,w,1.1,4,wall);
  for(const [x,ww] of [[-7.1,1.8],[0,3.2],[7.1,1.8]]){B(g,x,2,-2,ww,4,4,wall);B(g,x,.19,-1.97,ww,1.38,4.12,base);}
  for(const x of [-3.9,3.9]){B(g,x,-.18,-1.9,4.6,.43,4.1,concrete(0xa1a5a0));B(g,x,1.9,-3.99,4.6,3.8,.03,dark);B(g,x,3.85,.06,4.8,.12,.22,blue);
   for(const s of [-1,1])B(g,x+s*2.35,1.95,.06,.12,3.8,.22,blue);
   B(g,x,.08,-.25,4,.025,.23,metal(0x4d5554));for(let k=0;k<16;k++)B(g,x-1.9+k*.25,.095,-.25,.025,.01,.23,dark);
   K.rod(g,[x,3.72,-2.7],[x+.7,3.72,-.6],.035,steel);K.rod(g,[x+.7,3.72,-.6],[x+.7,1.12,-.6],.025,dark);B(g,x+.7,1.1,-.58,.07,.4,.12,dark);
   sign(g,{text:x<0?'WASH 1':'WASH 2',bg:'#38647f',fg:'#eceadd',font:'sans',border:false},1.4,.27,{x,y:4.05,z:.19});
  }
  B(g,0,5.03,-.01,w+.3,.58,.4,blue);B(g,0,5.38,-11,w+.4,.12,22.4,steel);
  sign(g,{text:'MILL ROAD CAR WASH',sub:'SELF SERVE · VACUUM · OPEN 24 HRS',bg:'#38647f',fg:'#eceadd',font:'block',border:false},13,.54,{y:5.03,z:.2});
  B(g,0,1.4,.27,.75,1,.4,steel);B(g,0,1.52,.48,.47,.26,.025,glassDark);sign(g,{text:'QUARTERS',sub:'$1.50 TO START',bg:'#d8d9cc',fg:'#34494e',font:'sans',border:false},.7,.32,{y:2.2,z:.12});
  for(const x of [-7.75,7.75])B(g,x,2.15,.16,.14,4.3,.15,cream);
 }
}

export function backdropHouse(W,far,{u,v,rot,w,d,two,c,roof}){
 const frame={id:'town-background',heading:()=>0,point:(u,v)=>{const p=TW(u,v);return {...p,y:landY(p.x,p.z)};},project:(x,z)=>TL(x,z)};
 const q=TW(u,v),y=landY(q.x,q.z),P=planHouse(seeded(hashSeed(91,u,v)),{frame,frameId:frame.id,u,side:1,setback:0,w,depth:d,style:two?'colonial':'ranch',roof:two?'hip':'side',roofColor:roof,wall:c,garage:false,porch:'stoop',chimney:'interior',brick:null,lod:'mid',far:true,groundFn:()=>y});
 buildHouse({...W,space:{...W.space,rect:()=>{}},farHouses:[],drape:()=>new THREE.Group()},P);
 P.g.position.set(u,y,v);P.g.rotation.y=rot;P.g.name='downtown-backdrop-house';far.add(P.g);
 let low=y;for(const x of [-w/2,w/2])for(const z of [-d/2,d/2]){const p=TW(u+x*Math.cos(rot)+z*Math.sin(rot),v-x*Math.sin(rot)+z*Math.cos(rot));low=Math.min(low,landY(p.x,p.z));}
 W.K.box(P.g,0,(low-y-.4)/2,0,w+.12,y-low+.4,d+.12,0x99958a);
}
