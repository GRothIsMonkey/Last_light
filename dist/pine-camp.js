// Chapter Five: Camp Whippoorwill, built. Board-and-batten cabins on piers under tall pines, the lodge with its stone
// chimney and long porch, the office by the gate, the washhouse, the service yard and the pump house; the clearing with
// its flagpole and bell, the campfire circle and the waterfront. Three cabins, the office and the lodge have rooms you
// can walk into (their furniture stands where pine-plan.js says, so walking and drawing agree). Everything is old,
// closed up since 1992, and ordinary: a place that had children in it every summer for thirty years.
//
// Each building is built in its own frame (x to the right looking out of the front door, -z out of the front, y up
// from its pad); its static parts bake under 'pine' (rooms under 'pine-int'); its doors and window panes are live.
import * as THREE from './three.module.js';
import {seeded,hashSeed,clamp,lerp} from './kit.js';
import {PW,PL,hd,frameOf,BUILDINGS,BLD,SOLIDS,DOORS,SPOT,DOCKS,heightAt,interiorOf} from './pine-plan.js';
import {campMapArt,archArt,cabinBoardArt,CAMP_SIGNS,searchMapArt,groupPhotoArt,plaqueArt,bannerArt,scheduleArt,carvingArt} from './pine-art.js';

export function buildCamp(W,out){
 const {K,M,at,gY,B,face,paint,root,inn,live}=out;
 const sign=(spec)=>paint(Math.min(1024,Math.round(spec.w*240)),Math.max(32,Math.round(spec.h*240)),spec.draw);
 const KS=(c,o={})=>K.mat(c,o).clone();// (a surface kind on its own copy)
 const wallC=0x8a6a48,trimC=0xd8ccb0,M2={
  wall:K.mat(wallC,{roughness:.92}),wallL:K.mat(0x9a7a56,{roughness:.92}),trim:K.mat(trimC,{roughness:.8}),greenTrim:K.mat(0x3e5a3e,{roughness:.8}),
  floor:W.surfaceMaterial(KS(0x8a6a48,{roughness:.9}),'timber'),floorDark:W.surfaceMaterial(KS(0x6a5038,{roughness:.9}),'timber'),
  roof:W.surfaceMaterial(KS(0x445040),'roof'),roofRed:W.surfaceMaterial(KS(0x6a3a2e),'roof'),fascia:K.mat(0x3a3428,{roughness:.9}),
  pier:W.surfaceMaterial(KS(0x8a877c),'mineral'),stone:W.surfaceMaterial(KS(0x8a8072),'mineral'),block:W.surfaceMaterial(KS(0xb0aca0),'mineral'),
  frame:K.mat(0x5a4a38,{roughness:.8}),mattress:K.mat(0x8a8a9a,{roughness:1}),stripe:K.mat(0x5a6a8a,{roughness:1}),metal:K.mat(0x6e7270,{roughness:.5,metalness:.55}),
  corr:K.mat(0x8e928c,{roughness:.55,metalness:.6}),dark:K.mat(0x1e1c1a,{roughness:.9}),door:K.mat(0x5a4632,{roughness:.85}),screen:K.mat(0x3a3e3a,{roughness:.9}),
 };
 // ---- shared pieces -------------------------------------------------------------------------------------------------------
 // A wall with rectangular openings: boxes around them. Runs along x at depth z (thickness th), from y0 to y1. ops [x0,x1,y0,y1].
 function wallX(g,x0,x1,y0,y1,z,th,ops,m){const xs=[...new Set([x0,x1,...ops.flatMap(o=>[o[0],o[1]])])].filter(x=>x>=x0&&x<=x1).sort((a,b)=>a-b),ys=[...new Set([y0,y1,...ops.flatMap(o=>[o[2],o[3]])])].filter(y=>y>=y0&&y<=y1).sort((a,b)=>a-b);
  for(let a=0;a<ys.length-1;a++){let run=null;const flush=()=>{if(run){B(g,(run[0]+run[1])/2,(ys[a]+ys[a+1])/2,z,run[1]-run[0],ys[a+1]-ys[a],th,m);run=null;}};
   for(let b=0;b<xs.length-1;b++){const cx=(xs[b]+xs[b+1])/2,cy=(ys[a]+ys[a+1])/2,hole=ops.some(o=>cx>o[0]&&cx<o[1]&&cy>o[2]&&cy<o[3]);if(hole){flush();continue;}if(run&&Math.abs(run[1]-xs[b])<1e-6)run[1]=xs[b+1];else{flush();run=[xs[b],xs[b+1]];}}flush();}}
 // the same along z (a side wall at x)
 function wallZ(g,z0,z1,y0,y1,x,th,ops,m){const s=new THREE.Group();s.position.x=x;s.rotation.y=Math.PI/2;g.add(s);wallX(s,-z1,-z0,y0,y1,0,th,ops.map(o=>[-o[1],-o[0],o[2],o[3]]),m);}
 // board-and-batten: thin battens over a wall's outside face
 function battens(g,x0,x1,y0,y1,z,out2,m,step=.42){for(let x=x0+step/2;x<x1;x+=step)B(g,x,(y0+y1)/2,z+out2*.03,.05,y1-y0,.04,m);}
 // a window: trim round the opening, a sill, a pane (live: its glow is the story's), sash bars
 const panes={};
 function windowAt(g,b,x,y,w,h,z,out2,{shutter=null,live2=true}={}){B(g,x,y-h/2-.05,z+out2*.06,w+.24,.07,.16,M2.trim);B(g,x,y+h/2+.05,z+out2*.04,w+.24,.09,.08,M2.trim);for(const s of [-1,1])B(g,x+s*(w/2+.05),y,z+out2*.04,.09,h+.1,.08,M2.trim);
  B(g,x,y,z+out2*.02,.035,h,.03,M2.trim);B(g,x,y,z+out2*.02,w,.035,.03,M2.trim);
  if(live2)(panes[b.id]||=[]).push({g,x,y,w,h,z});
  if(shutter==='closed')for(const s of [-1,1])B(g,x+s*w/4,y,z+out2*.09,w/2-.02,h+.04,.035,M2.greenTrim);
  else if(shutter==='open')for(const s of [-1,1]){const sh=B(g,x+s*(w/2+w/4+.1),y,z+out2*.07,w/2,h+.04,.035,M2.greenTrim);void sh;}}
 // a gable roof whose ridge runs along z (front to back), eaves at y, rise r, overhang o, extended forward by fwd (over a porch)
 function gableZ(g,w,d,y,r,o,m,{fwd=0,back=0}={}){const z0=-d/2-o-fwd,z1=d/2+o+back,xh=w/2+o,yy=y-o*r/(w/2);
  K.quad(g,[-xh,yy,z1],[0,y+r,z1],[0,y+r,z0],[-xh,yy,z0],m);K.quad(g,[0,y+r,z1],[xh,yy,z1],[xh,yy,z0],[0,y+r,z0],m);
  // undersides and fascia
  K.quad(g,[-xh,yy-.02,z0],[0,y+r-.02,z0],[0,y+r-.02,z1],[-xh,yy-.02,z1],M2.fascia);K.quad(g,[0,y+r-.02,z0],[xh,yy-.02,z0],[xh,yy-.02,z1],[0,y+r-.02,z1],M2.fascia);
  for(const s of [-1,1])B(g,s*xh,yy-.06,(z0+z1)/2,.05,.14,z1-z0,M2.fascia);B(g,0,y+r+.04,(z0+z1)/2,.18,.08,z1-z0,M2.fascia);}
 // (both faces: the outside, and an inside one a wall's thickness in, so a room is closed under its rafters)
 function gableEnds(g,w,y,r,zs,m){for(const z of zs){const i=z<0?.1:-.1;K.tri(g,z<0?[w/2,y,z,-w/2,y,z,0,y+r,z]:[-w/2,y,z,w/2,y,z,0,y+r,z],m);K.tri(g,z<0?[-w/2,y,z+i,w/2,y,z+i,0,y+r,z+i]:[w/2,y,z+i,-w/2,y,z+i,0,y+r,z+i],m);}}
 // a door: live hinge at its left edge (seen from outside), the leaf swinging inward; F opens it (chapter5.js)
 function doorAt(b,g,x,z,w,h,y,{key=b.id,inward=1,glass=true,frame=true}={}){const hinge=new THREE.Group();hinge.position.set(x-w/2,y,z);g.add(hinge);
  const leaf=new THREE.Group();hinge.add(leaf);B(leaf,w/2,h/2,0,w-.02,h,.045,M2.door);if(glass)B(leaf,w/2,h*.74,-.026,w*.55,h*.28,.01,M2.dark);for(const yy of [h*.32,h*.55])B(leaf,w/2,yy,-.026,w*.75,.04,.01,M2.frame);
  K.ball(leaf,w-.1,h*.47,-.05,.03,M2.metal);K.ball(leaf,w-.1,h*.47,.05,.03,M2.metal);
  // frame
  if(frame){B(g,x,y+h+.05,z,w+.2,.1,.16,M2.trim);for(const s of [-1,1])B(g,x+s*(w/2+.05),y+h/2,z,.1,h,.16,M2.trim);}
  out.doors[key]={hinge,leaf,inward,w,cur:0};return hinge;}
 // the building's two anchors: the static (baked) group, and a live group in the same frame
 function place(b,parent){const g=at(parent,b.c[0],b.c[1],b.y,b.a);g.name='camp-'+b.id;return g;}
 function liveAt(b){const p=PW(b.c[0],b.c[1]),g=new THREE.Group();g.position.set(p.x,b.y,p.z);g.rotation.y=-b.a;live.add(g);g.name='camp-live-'+b.id;return g;}

 // ---- a cabin ---------------------------------------------------------------------------------------------------------------
 function cabin(b){const g=place(b,root),L=liveAt(b),I=b.enter?place(b,inn):null,hw=b.w/2,hd2=b.d/2,f=b.floor,h=b.h,th=.12,r=seeded(hashSeed(17,b.c[0],b.c[1]));
  // piers and the floor platform; skirt boards between the piers
  for(const x of [-hw+.2,0,hw-.2])for(const z of [-hd2+.2,0,hd2-.2])B(g,x,f/2-.1,z,.36,f+.2,.36,M2.pier);
  B(g,0,f-.08,0,b.w+.06,.16,b.d+.06,M2.floorDark);
  // walls with their openings: the door (front), two windows each side, one at the back
  const wy0=f,wy1=f+h,winY=f+1.45,ww=.92,wh=.86,door=b.door,shut=!b.enter&&r()<.5;
  wallX(g,-hw,hw,wy0,wy1,-hd2+th/2,th,[[door[0]-door[1]/2,door[0]+door[1]/2,f,f+2.05]],M2.wall);
  wallX(g,-hw,hw,wy0,wy1,hd2-th/2,th,[[-ww/2,ww/2,winY-wh/2,winY+wh/2]],M2.wall);
  for(const s of [-1,1])wallZ(g,-hd2,hd2,wy0,wy1,s*(hw-th/2),th,[[-2.3-ww/2,-2.3+ww/2,winY-wh/2,winY+wh/2],[1.6-ww/2,1.6+ww/2,winY-wh/2,winY+wh/2]],M2.wall);
  battens(g,-hw,hw,wy0,wy1,-hd2,-1,M2.wallL);battens(g,-hw,hw,wy0,wy1,hd2,1,M2.wallL);
  for(const s of [-1,1]){const sg=new THREE.Group();sg.position.x=s*hw;sg.rotation.y=s*Math.PI/2;g.add(sg);battens(sg,-hd2,hd2,wy0,wy1,0,1,M2.wallL);}
  // corner boards, the sill plate
  for(const x of [-hw,hw])for(const z of [-hd2,hd2])B(g,x,f+h/2,z,.16,h,.16,M2.trim);
  windowAt(g,b,0,winY,ww,wh,hd2,1,{shutter:shut?'closed':null});for(const s of [-1,1])for(const z of [-2.3,1.6]){const sg=new THREE.Group();sg.position.set(s*hw,0,z);sg.rotation.y=s*Math.PI/2;g.add(sg);windowAt(sg,b,0,winY,ww,wh,0,1,{shutter:shut?'closed':r()<.3?'open':null});}
  // the roof (over the porch too), its gable ends
  gableZ(g,b.w,b.d,f+h,1.55,.42,M2.roof,{fwd:b.porch});gableEnds(g,b.w,f+h,1.55,[-hd2,hd2],M2.wall);
  // the porch: a deck at the floor, two posts, side rails, steps down; the name board over the door
  const pz=-hd2-b.porch/2;B(g,0,f-.06,pz,b.w,.12,b.porch,M2.floor);for(const x of [-hw+.12,hw-.12]){B(g,x,f/2,-hd2-b.porch+.12,.14,f,.14,M2.pier);B(g,x,f+h/2+.05,-hd2-b.porch+.12,.14,h+.1,.14,M2.frame);}
  for(const s of [-1,1]){B(g,s*(hw-.12),f+.9,pz,.06,.06,b.porch,M2.frame);B(g,s*(hw-.12),f+.45,pz,.04,.9,.04,M2.frame);}
  const steps=Math.max(1,Math.round(f/.19));for(let k=0;k<steps;k++){const y=f-(k+1)*f/steps;B(g,door[0],y+f/steps/2-.02,-hd2-b.porch-.14-k*.28,1.4,f/steps,.28,M2.floor);}
  const nb=sign({w:1.4,h:.36,draw:cabinBoardArt(b.name)});face(g,nb,1.4,.36,{y:f+h-.32,z:-hd2-.04});
  // the door: live in the cabins you can go into, shut and painted in the others
  if(b.enter)doorAt(b,L,door[0],-hd2+th/2,door[1]-.04,2.0,f);
  else{B(g,door[0],f+1.02,-hd2+.02,door[1]-.04,2.0,.05,M2.door);K.ball(g,door[0]+door[1]/2-.12,f+.95,-hd2-.03,.03,M2.metal);}
  // a few ordinary things outside: a broom against the wall, a towel line, a forgotten sneaker under the porch
  if(r()<.5){K.rod(g,[hw-.35,f,-hd2-.08],[hw-.2,f+1.3,-hd2-.08],.015,M2.frame);B(g,hw-.37,f+.12,-hd2-.08,.25,.24,.05,K.mat(0x9a8040,{roughness:1}));}
  if(r()<.6){const y=f+2.05;K.rod(g,[-hw+.2,y,-hd2-b.porch+.15],[hw-.2,y,-hd2-b.porch+.15],.006,M2.dark);}
  // the room
  if(I){const iz0=-hd2+th,iz1=hd2-th,ix=hw-th;B(I,0,f+.003,0,b.w-2*th,.01,b.d-2*th,M2.floor);
   // rafters and a ridge beam (open ceiling), a bare bulb on a cord, dead
   for(let z=iz0+.6;z<iz1;z+=1.2)for(const s of [-1,1])K.rod(I,[s*ix,f+h,z],[0,f+h+1.4,z],.05,M2.frame);B(I,0,f+h+1.4,0,.12,.14,b.d-.3,M2.frame);B(I,0,f+h-.04,0,b.w-.3,.08,.1,M2.frame);
   K.rod(I,[0,f+h+1.3,.4],[0,f+2.2,.4],.006,M2.dark);K.ball(I,0,f+2.15,.4,.05,K.mat(0xe8e0c8,{roughness:.3}));
   // the bunks (where the plan put them): posts, two frames, two mattresses each; a carved end board
   for(const s of SOLIDS.filter(q=>q.inside===b.id&&q.kind==='bunk')){const [lx,lz]=b.F.of(s.c[0],s.c[1]),bk=new THREE.Group();bk.position.set(lx,f,-lz);I.add(bk);
    for(const x of [-.45,.45])for(const z of [-.98,.98])B(bk,x,.85,z,.07,1.7,.07,M2.frame);
    for(const y of [.32,1.32]){B(bk,0,y,0,.96,.06,2.02,M2.frame);B(bk,0,y+.09,0,.86,.12,1.9,M2.mattress);for(let k=0;k<5;k++)B(bk,0,y+.152,-.8+k*.4,.86,.004,.04,M2.stripe);}
    const cv=sign({w:.9,h:.5,draw:carvingArt([['TODD 84','JEFF + MIKE','BLUEJAY RULES','R.K.'],['DAVE','SUMMER 79','CARDINAL #1','KJ + LM'],['PETE','OWL 88','BEN W.','LIGHTS OUT = LAME']][['bluejay','cardinal','owl'].indexOf(b.id)%3]||['CAMP'],hashSeed(b.c[0],lz))});
    B(bk,0,.62,-1.02,.96,.56,.04,M2.frame);face(bk,cv,.9,.5,{y:.62,z:-1.045});out.anchors['bunk-'+b.id+'-'+(lz>0?'f':'b')+(s.side>0?'r':'l')]={b:b.id,lx,lz,side:s.side};}
   // the shelf at the back, hooks, the schedule on the wall by the door
   const sh=SOLIDS.find(q=>q.inside===b.id&&q.kind==='shelf');if(sh){const [lx,lz]=b.F.of(sh.c[0],sh.c[1]);for(const y of [.9,1.5])B(I,lx,f+y,-lz,2.4,.04,.38,M2.frame);for(const x of [-1.15,1.15])B(I,lx+x,f+.75,-lz,.04,1.5,.36,M2.frame);
    // what campers leave: a flashlight with no batteries, a cup, a paperback swollen with damp, a deflated ball
    K.cyl(I,lx-.7,f+.98,-lz,.03,.16,M2.metal,8,[0,0,Math.PI/2]);K.cyl(I,lx-.1,f+.97,-lz,.05,.1,K.mat(0xc8483a,{roughness:.6}),10);B(I,lx+.5,f+.95,-lz,.14,.05,.2,K.mat(0x6a5a8a,{roughness:1}));}
   for(let k=0;k<5;k++)K.rod(I,[-1.2+k*.6,f+1.85,iz1-.01],[-1.2+k*.6,f+1.85,iz1-.12],.012,M2.metal);
   const sc=sign({w:.42,h:.56,draw:scheduleArt});face(I,sc,.42,.56,{x:hw-th-.01,y:f+1.6,z:-1.2,ry:Math.PI/2});
   out.anchors['room-'+b.id]=I;}
  return g;}

 // ---- the office ------------------------------------------------------------------------------------------------------------
 function office(b){const g=place(b,root),L=liveAt(b),I=place(b,inn),hw=b.w/2,hd2=b.d/2,f=b.floor,h=b.h,th=.12,door=b.door;
  B(g,0,f/2-.05,0,b.w+.1,f+.1,b.d+.1,M2.stone);B(g,0,f-.06,0,b.w,.12,b.d,M2.floorDark);
  wallX(g,-hw,hw,f,f+h,-hd2+th/2,th,[[door[0]-door[1]/2,door[0]+door[1]/2,f,f+2.05],[.9,2.2,f+.95,f+1.85]],M2.wall);wallX(g,-hw,hw,f,f+h,hd2-th/2,th,[[-.6,.6,f+1,f+1.8]],M2.wall);
  for(const s of [-1,1])wallZ(g,-hd2,hd2,f,f+h,s*(hw-th/2),th,[[-.5,.5,f+1,f+1.8]],M2.wall);
  battens(g,-hw,hw,f,f+h,-hd2,-1,M2.wallL);battens(g,-hw,hw,f,f+h,hd2,1,M2.wallL);for(const x of [-hw,hw])for(const z of [-hd2,hd2])B(g,x,f+h/2,z,.16,h,.16,M2.trim);
  windowAt(g,b,1.55,f+1.4,1.3,.9,-hd2,-1);windowAt(g,b,0,f+1.4,1.2,.8,hd2,1);for(const s of [-1,1]){const sg=new THREE.Group();sg.position.set(s*hw,0,0);sg.rotation.y=s*Math.PI/2;g.add(sg);windowAt(sg,b,0,f+1.4,1,.8,0,1);}
  gableZ(g,b.w,b.d,f+h,1.3,.4,M2.roof,{fwd:b.porch});gableEnds(g,b.w,f+h,1.3,[-hd2,hd2],M2.wall);
  B(g,0,f-.06,-hd2-b.porch/2,b.w,.12,b.porch,M2.floor);for(const x of [-hw+.12,hw-.12])B(g,x,f+h/2,-hd2-b.porch+.12,.14,h,.14,M2.frame);
  const steps=Math.max(1,Math.round(f/.19));for(let k=0;k<steps;k++){const y=f-(k+1)*f/steps;B(g,door[0],y+f/steps/2-.02,-hd2-b.porch-.14-k*.28,1.4,f/steps,.28,M2.floor);}
  face(g,sign(CAMP_SIGNS.office),1.1,.3,{y:f+h-.25,z:-hd2-.04});
  // the notice, tacked to the door (it moves with the door)
  const hinge=doorAt(b,L,door[0],-hd2+th/2,door[1]-.04,2.0,f);const leaf=hinge.children[0];face(leaf,sign(CAMP_SIGNS.closed),.38,.5,{x:(door[1]-.04)/2,y:1.3,z:-.03});
  // the room: the counter, the desk and its chair, the filing cabinet, the bench, the board with the search map, the register
  B(I,0,f+.003,0,b.w-2*th,.01,b.d-2*th,M2.floor);B(I,0,f+h-.02,0,b.w-2*th,.04,b.d-2*th,M2.trim);
  const loc=kind=>{const s=SOLIDS.find(q=>q.inside===b.id&&q.kind===kind);const [lx,lz]=b.F.of(s.c[0],s.c[1]);return {x:lx,z:-lz,w:s.w,d:s.d};};
  {const c=loc('counter');B(I,c.x,f+.5,c.z,c.w,1,c.d,M2.frame);B(I,c.x,f+1.02,c.z,c.w+.08,.04,c.d+.08,M2.floor);out.anchors.register={b:b.id,x:c.x,y:f+1.05,z:c.z};
   // the register itself (closed until opened: chapter5.js draws its pages)
   const reg=new THREE.Group();reg.position.set(c.x+.4,f+1.06,c.z);I.add(reg);B(reg,0,.02,0,.42,.04,.3,K.mat(0x2a3a5a,{roughness:.8}));}
  {const c=loc('desk');B(I,c.x,f+.74,c.z,c.w,.05,c.d,M2.floor);for(const x of [-.6,.6])for(const z of [-.3,.3])B(I,c.x+x,f+.37,c.z+z,.05,.74,.05,M2.frame);B(I,c.x+.5,f+.4,c.z,.4,.64,.6,M2.frame);
   K.cyl(I,c.x-.3,f+.82,c.z,.06,.1,K.mat(0x2a2a2a,{roughness:.6}),10);B(I,c.x+.1,f+.78,c.z+.1,.3,.02,.22,K.mat(0xe8e0c8,{roughness:1}));
   // a rotary phone, its cord
   B(I,c.x-.5,f+.8,c.z-.15,.2,.08,.22,K.mat(0x1e1e1e,{roughness:.4}));const ch=new THREE.Group();ch.position.set(c.x-.2,f,c.z+.75);I.add(ch);B(ch,0,.45,0,.42,.05,.42,M2.frame);B(ch,0,.75,.19,.42,.55,.04,M2.frame);for(const x of [-.18,.18])for(const z of [-.18,.18])B(ch,x,.22,z,.04,.45,.04,M2.metal);}
  {const c=loc('cabinet');B(I,c.x,f+.66,c.z,c.w,1.32,c.d,K.mat(0x6a7064,{roughness:.6,metalness:.3}));for(let k=0;k<3;k++)B(I,c.x,f+.3+k*.42,c.z-c.d/2-.01,.3,.03,.02,M2.metal);}
  {const c=loc('bench');B(I,c.x,f+.44,c.z,c.w,.05,c.d,M2.floor);for(const z of [-.6,.6])B(I,c.x,f+.22,c.z+z,c.w-.06,.44,.05,M2.frame);}
  // the board on the back wall: the search map, a calendar (August 1991), a first-aid poster, the staff roster
  const back=hd2-th-.01;B(I,0,f+1.6,back,2.4,1.2,.03,K.mat(0x9a8a6a,{roughness:1}));
  face(I,paint(720,540,searchMapArt),1.1,.82,{x:-.5,y:f+1.6,z:back-.025});
  face(I,paint(240,300,(g2,w,h)=>{g2.fillStyle='#ece6d4';g2.fillRect(0,0,w,h);g2.fillStyle='#2a2a2a';g2.font=`bold ${h*.09}px Georgia`;g2.textAlign='center';g2.fillText('AUGUST 1991',w/2,h*.12);
   for(let k=0;k<35;k++){const x=w*(.08+(k%7)*.13),y=h*(.22+Math.floor(k/7)*.15);g2.strokeStyle='#888';g2.strokeRect(x,y,w*.12,h*.13);const d=k-3;if(d>=1&&d<=31){g2.font=`${h*.045}px Arial`;g2.textAlign='left';g2.fillText(String(d),x+3,y+h*.045);}
    if(d>=21&&d<=31){g2.strokeStyle='rgba(180,30,20,.7)';g2.beginPath();g2.moveTo(x+2,y+2);g2.lineTo(x+w*.12-2,y+h*.13-2);g2.stroke();}}}),.34,.42,{x:.55,y:f+1.75,z:back-.025});
  face(I,paint(200,260,(g2,w,h)=>{g2.fillStyle='#f2efe6';g2.fillRect(0,0,w,h);g2.fillStyle='#b8241e';g2.fillRect(w*.35,h*.08,w*.3,h*.24);g2.fillRect(w*.2,h*.14,w*.6,h*.12);g2.fillStyle='#222';g2.font=`bold ${h*.07}px Arial`;g2.textAlign='center';g2.fillText('FIRST AID',w/2,h*.45);
   g2.font=`${h*.045}px Arial`;['Cuts & scrapes — see nurse','Bee stings — see nurse','Lost? Stay put.','Ring the bell for help.'].forEach((l,i)=>g2.fillText(l,w/2,h*(.58+i*.1)));}),.26,.34,{x:1,y:f+1.5,z:back-.025});
  out.anchors['room-office']=I;out.anchors.searchMap={b:b.id,x:-.5,y:f+1.6,z:back-.03};}

 // ---- the lodge -------------------------------------------------------------------------------------------------------------
 function lodge(b){const g=place(b,root),L=liveAt(b),I=place(b,inn),hw=b.w/2,hd2=b.d/2,f=b.floor,h=b.h,th=.16,door=b.door;
  // a stone foundation, the floor
  B(g,0,f/2-.05,0,b.w+.12,f+.1,b.d+.12,M2.stone);B(g,0,f-.06,0,b.w,.12,b.d,M2.floorDark);
  // walls: the double doors in the middle of the front, three big windows each side of them; side windows; the back with the kitchen door
  const winF=[-7.8,-5.4,-3,3,5.4,7.8].map(x=>[x-.6,x+.6,f+1,f+2.2]);
  wallX(g,-hw,hw,f,f+h,-hd2+th/2,th,[[-door[1]/2,door[1]/2,f,f+2.35],...winF],M2.wall);
  wallX(g,-hw,hw,f,f+h,hd2-th/2,th,[[b.back[0]-b.back[1]/2,b.back[0]+b.back[1]/2,f,f+2.05],[-6-.6,-6+.6,f+1.1,f+2.1],[-2-.6,-2+.6,f+1.1,f+2.1],[2.6-.5,2.6+.5,f+1.3,f+2.1]],M2.wall);
  wallZ(g,-hd2,hd2,f,f+h,-(hw-th/2),th,[[-3-.6,-3+.6,f+1,f+2.1],[3-.6,3+.6,f+1,f+2.1]],M2.wall);wallZ(g,-hd2,hd2,f,f+h,hw-th/2,th,[[-2-.55,-2+.55,f+1.2,f+2.1],[2.2-.55,2.2+.55,f+1.2,f+2.1]],M2.wall);
  battens(g,-hw,hw,f,f+h,-hd2,-1,M2.wallL,.5);battens(g,-hw,hw,f,f+h,hd2,1,M2.wallL,.5);for(const s of [-1,1]){const sg=new THREE.Group();sg.position.x=s*hw;sg.rotation.y=s*Math.PI/2;g.add(sg);battens(sg,-hd2,hd2,f,f+h,0,1,M2.wallL,.5);}
  for(const x of [-hw,hw])for(const z of [-hd2,hd2])B(g,x,f+h/2,z,.2,h,.2,M2.trim);
  for(const o of winF)windowAt(g,b,(o[0]+o[1])/2,(o[2]+o[3])/2,1.2,1.2,-hd2,-1);
  for(const [x,y,w2] of [[-6,f+1.6,1.2],[-2,f+1.6,1.2],[2.6,f+1.7,1]])windowAt(g,b,x,y,w2,.95,hd2,1);
  for(const [s,zs] of [[-1,[-3,3]],[1,[-2,2.2]]])for(const z of zs){const sg=new THREE.Group();sg.position.set(s*hw,0,z);sg.rotation.y=s*Math.PI/2;g.add(sg);windowAt(sg,b,0,f+1.6,1.1,1.0,0,1);}
  // the roof: ridge along the length (x); the porch roof a lower shed roof across the front
  {const grp=new THREE.Group();grp.rotation.y=Math.PI/2;g.add(grp);gableZ(grp,b.d,b.w,f+h,2.6,.55,M2.roofRed);gableEnds(grp,b.d,f+h,2.6,[-hw,hw],M2.wall);}
  const pz=-hd2-b.porch/2,ph=f+2.9;B(g,0,f-.06,pz,b.w,.12,b.porch,M2.floor);
  K.quad(g,[-hw-.3,ph+.05,-hd2-b.porch-.35],[-hw-.3,f+h-.1,-hd2],[hw+.3,f+h-.1,-hd2],[hw+.3,ph+.05,-hd2-b.porch-.35],M2.roofRed);K.quad(g,[-hw-.3,ph,-hd2-b.porch-.35],[hw+.3,ph,-hd2-b.porch-.35],[hw+.3,f+h-.15,-hd2],[-hw-.3,f+h-.15,-hd2],M2.fascia);
  for(let x=-hw+.15;x<=hw-.1;x+=3.3){B(g,x,f+1.45,-hd2-b.porch+.15,.2,2.9,.2,M2.frame);B(g,x,f/2,-hd2-b.porch+.15,.24,f,.24,M2.stone);}
  for(const x of [-hw+.15,hw-.15])B(g,x,f+.85,pz,.08,.08,b.porch,M2.frame);
  for(const [x0,x1] of [[-hw+.15,-2.1],[2.1,hw-.15]]){B(g,(x0+x1)/2,f+.85,-hd2-b.porch+.15,x1-x0,.08,.08,M2.frame);for(let x=x0+.2;x<x1;x+=.25)B(g,x,f+.45,-hd2-b.porch+.15,.04,.8,.04,M2.frame);}
  const steps=Math.max(1,Math.round(f/.19));for(let k=0;k<steps;k++){const y=f-(k+1)*f/steps;B(g,0,y+f/steps/2-.02,-hd2-b.porch-.14-k*.28,3.2,f/steps,.28,M2.stone);}
  face(g,sign(CAMP_SIGNS.lodge),2.4,.5,{y:f+h-.4,z:-hd2-.05});face(g,sign(CAMP_SIGNS.lights),1.0,.62,{x:3.6,y:f+1.6,z:-hd2-.05});
  // the stone chimney at the west end
  {const cx=3;B(g,cx,(f+h+3.6)/2,hd2+.45,1.6,f+h+3.6,.9,M2.stone);B(g,cx,f+h+3.65,hd2+.45,1.7,.15,1.0,M2.block);}
  // double doors (live: they open together), the kitchen's back door
  {const hw2=door[1]/2;doorAt(b,L,-hw2/2,-hd2+th/2,hw2-.02,2.3,f,{key:'lodge',glass:true,frame:false});B(g,0,f+2.4,-hd2+th/2,door[1]+.2,.12,.18,M2.trim);for(const sx of [-1,1])B(g,sx*(hw2+.05),f+1.17,-hd2+th/2,.1,2.34,.18,M2.trim);const right=new THREE.Group();right.position.set(hw2,f,-hd2+th/2);L.add(right);const leaf=new THREE.Group();right.add(leaf);
   B(leaf,-hw2/2,1.15,0,hw2-.04,2.3,.05,M2.door);B(leaf,-hw2/2,1.7,-.03,hw2*.55,.6,.01,M2.dark);K.ball(leaf,-hw2+.1,1.1,-.05,.03,M2.metal);out.doors['lodge'].pair={hinge:right,leaf};}
  doorAt(b,L,b.back[0],hd2-th/2,b.back[1]-.04,2.0,f,{key:'lodge-back',glass:false});
  // ---- the hall
  B(I,0,f+.003,0,b.w-2*th,.01,b.d-2*th,M2.floor);
  for(let x=-hw+1.5;x<hw;x+=2.5){K.rod(I,[x,f+h,-hd2+.2],[x,f+h+2.4,0],.07,M2.frame);K.rod(I,[x,f+h+2.4,0],[x,f+h,hd2-.2],.07,M2.frame);B(I,x,f+h,0,.14,.16,b.d-.4,M2.frame);}
  // the ceiling boards (under the roof), so the hall has a top
  {const grp=new THREE.Group();grp.rotation.y=Math.PI/2;I.add(grp);K.quad(grp,[-hd2+.15,f+h+.02,-hw+.2],[0,f+h+2.55,-hw+.2],[0,f+h+2.55,hw-.2],[-hd2+.15,f+h+.02,hw-.2],M2.floor);K.quad(grp,[0,f+h+2.55,-hw+.2],[hd2-.15,f+h+.02,-hw+.2],[hd2-.15,f+h+.02,hw-.2],[0,f+h+2.55,hw-.2],M2.floor);}
  const loc=(kind)=>SOLIDS.filter(q=>q.inside===b.id&&q.kind===kind).map(s=>{const [lx,lz]=b.F.of(s.c[0],s.c[1]);return {x:lx,z:-lz,w:s.w,d:s.d};});
  for(const t of loc('table')){B(I,t.x,f+.74,t.z,t.w,.06,t.d,M2.floor);for(const x of [-(t.w/2-.18),t.w/2-.18])B(I,t.x+x,f+.37,t.z,.08,.72,t.d-.1,M2.frame);}
  for(const t of loc('bench')){B(I,t.x,f+.43,t.z,t.w,.05,t.d,M2.floor);for(const x of [-(t.w/2-.14),t.w/2-.14])B(I,t.x+x,f+.21,t.z,.06,.42,t.d-.04,M2.frame);}
  for(const t of loc('stage')){B(I,t.x,f+.22,t.z,t.w,.44,t.d,M2.floorDark);B(I,t.x+t.w/2+.15,f+.1,t.z,.3,.2,2.2,M2.floor);
   face(I,paint(1200,140,bannerArt),5.6,.66,{x:hw-th-.03,y:f+2.7,z:t.z,ry:Math.PI/2});
   // an old upright piano at the side of the stage
   B(I,t.x+.1,f+.44+.65,t.z+3.6,.6,1.3,1.5,K.mat(0x3a2418,{roughness:.6}));B(I,t.x+.45,f+.44+.75,t.z+3.6,.12,.05,1.3,K.mat(0xe8e4d8,{roughness:.4}));}
  for(const t of loc('hearth')){B(I,t.x,f+.2,t.z,t.w,.4,t.d,M2.stone);B(I,t.x,f+1.3,t.z+.25,t.w+.6,2.2,.5,M2.stone);B(I,t.x,f+.75,t.z-.02,1,.8,.1,M2.dark);}
  for(const t of loc('kwall')){wallZ(I,t.z-t.d/2,t.z+t.d/2,f,f+h,t.x,.12,[[-.2,1.2,f,f+2.1],[-3.4,-1.6,f+.95,f+1.55]],M2.wall);}
  for(const t of loc('kcounter')){B(I,t.x,f+.45,t.z,t.w,.9,t.d,M2.frame);B(I,t.x,f+.92,t.z,t.w+.05,.04,t.d+.05,M2.metal);K.cyl(I,t.x-1,f+.98,t.z,.22,.1,M2.metal,14);}
  for(const t of loc('pantry')){for(const y of [.5,1.0,1.5,2.0])B(I,t.x,f+y,t.z,t.w,.03,t.d,M2.frame);for(const zz of [-t.d/2,t.d/2])B(I,t.x,f+1.1,t.z+zz,t.w,2.2,.04,M2.frame);
   // cans in rows, dusty; a gap on the middle shelf (chapter5.js marks the clean rings where some were taken)
   const canM=[K.mat(0x9a3a2a,{roughness:.6,metalness:.3}),K.mat(0x3a6a3a,{roughness:.6,metalness:.3}),K.mat(0xd8c060,{roughness:.6,metalness:.3}),K.mat(0x8a8a8a,{roughness:.5,metalness:.5})];
   for(const y of [.5,1.0,1.5])for(let k=0;k<12;k++){if(y===1.0&&k>=4&&k<8)continue;K.cyl(I,t.x-.1+(k%2)*.16,f+y+.09,t.z-t.d/2+.25+Math.floor(k/2)*.6,.055,.16,canM[(k+Math.round(y*3))%4],8);}
   out.anchors.pantryGap={b:b.id,x:t.x-.02,y:f+1.0,z:t.z-t.d/2+2.65};}
  // on the walls: the group photographs, the plaque, a fire extinguisher, the light fixtures
  const years=[1964,1971,1977,1983,1987,1990];years.forEach((y,i)=>{const x=-3+i*1.85;face(I,paint(300,240,groupPhotoArt(y,y)),.86,.68,{x,y:f+2.15,z:hd2-th-.02});});
  face(I,paint(300,400,plaqueArt),.66,.88,{x:2.4,y:f+1.8,z:-hd2+th+.02,ry:Math.PI});
  for(let x=-6;x<=6;x+=4){K.rod(I,[x,f+h+1.6,0],[x,f+2.7,0],.008,M2.dark);K.cyl(I,x,f+2.62,0,.22,.12,K.mat(0x6a6a5a,{roughness:.4,metalness:.4}),12);}
  out.anchors['room-lodge']=I;}

 // ---- the washhouse, the maintenance shed, the pump house ------------------------------------------------------------------------
 function wash(b){const g=place(b,root),hw=b.w/2,hd2=b.d/2,f=b.floor,h=b.h;B(g,0,f/2,0,b.w+.2,f,b.d+.2,M2.pier);B(g,0,f+h/2,0,b.w,h,b.d,M2.block);
  for(const x of [-2.2,2.2]){B(g,x,f+1,-hd2-.02,.9,2,.05,M2.greenTrim);}for(let k=0;k<4;k++)B(g,-3+k*2,f+2.2,hd2+.02,.7,.3,.04,M2.dark);for(let k=0;k<3;k++)B(g,-2.4+k*2.4,f+2.2,-hd2-.02,.6,.28,.04,M2.dark);
  gableZ(g,b.w,b.d,f+h,1.1,.35,M2.roof);gableEnds(g,b.w,f+h,1.1,[-hd2,hd2],M2.block);K.cyl(g,2.6,f+h+1.2,.8,.06,1.6,M2.metal,8);
  face(g,paint(400,90,(g2,w,h2)=>{g2.fillStyle='#2e4a2a';g2.fillRect(0,0,w,h2);g2.fillStyle='#ece0b8';g2.font=`bold ${h2*.55}px Georgia`;g2.textAlign='center';g2.textBaseline='middle';g2.fillText('WASHHOUSE',w/2,h2/2);}),1.6,.36,{y:f+h-.35,z:-hd2-.04});}
 function mshed(b){const g=place(b,root),hw=b.w/2,hd2=b.d/2,f=b.floor,h=b.h;B(g,0,f/2,0,b.w+.2,f,b.d+.2,M2.pier);
  for(const s of [-1,1])for(let x=-hw;x<=hw+1e-6;x+=.3)B(g,x,f+h/2,s*hd2,.3,h,.04,M2.corr);for(const s of [-1,1])for(let z=-hd2;z<=hd2+1e-6;z+=.3)B(g,s*hw,f+h/2,z,.04,h,.3,M2.corr);
  B(g,0,f+h+.06,0,b.w+.5,.1,b.d+.5,M2.corr);B(g,-1,f+1.3,-hd2-.05,2.8,2.6,.05,K.mat(0x7a7e78,{roughness:.6,metalness:.5}));B(g,-1,f+2.66,-hd2-.08,3.4,.08,.08,M2.metal);
  // the fuel tank on its stand, a pile of old lumber, a riding mower with no seat
  const t=at(root,-280,616,null,.2);for(const x of [-.6,.6])B(t,x,.4,0,.08,.8,.6,M2.metal);K.cyl(t,0,1.2,0,.55,2,K.mat(0x8a2e22,{roughness:.6,metalness:.3}),14,[0,0,Math.PI/2]);
  const lp=at(root,-299,598,null,.4);for(let k=0;k<9;k++)B(lp,(k%3)*.25-.25,.06+Math.floor(k/3)*.11,0,.12,.1,3.4,M.grey);
  const mw=at(root,-287,596,null,1.2);B(mw,0,.45,0,.9,.4,1.6,K.mat(0x3a6a2a,{roughness:.6,metalness:.3}));for(const x of [-.45,.45])for(const z of [-.55,.55])K.cyl(mw,x,.2,z,.2,.14,M2.dark,10,[0,0,Math.PI/2]);}
 function pump(b){const g=place(b,root),hw=b.w/2,hd2=b.d/2,f=b.floor,h=b.h;B(g,0,f/2,0,b.w+.3,f,b.d+.3,M2.pier);B(g,0,f+h/2,0,b.w,h,b.d,M2.block);
  B(g,0,f+h+.1,0,b.w+.4,.2,b.d+.4,M2.pier);B(g,.6,f+1.05,-hd2-.03,1,2.1,.05,K.mat(0x5a6a62,{roughness:.55,metalness:.45}));face(g,sign(CAMP_SIGNS.pump),.8,.4,{x:-1.1,y:f+1.6,z:-hd2-.04});
  for(const s of [-1,1])B(g,s*hw,f+2.1,.2,.04,.3,.5,M2.dark);
  // the intake: a pipe from the back wall down the bank into the water, a grated headwall at the shore
  const p0=b.F.to(0,-hd2-.4),p1=[-306,497],gy0=heightAt(PW(...p0).x,PW(...p0).z);K.rod(root,[PW(...p0).x,gy0+.3,PW(...p0).z],[PW(...p1).x,.7,PW(...p1).z],.18,M2.metal);
  const hw2=at(root,p1[0],p1[1],.4,hd(-.6,1)+Math.PI);B(hw2,0,.3,0,2.2,1.2,.4,M2.pier);B(hw2,0,.2,-.21,.8,.6,.02,M2.metal);}

 for(const b of BUILDINGS){if(b.kind==='cabin')cabin(b);else if(b.kind==='office')office(b);else if(b.kind==='lodge')lodge(b);else if(b.kind==='wash')wash(b);else if(b.kind==='mshed')mshed(b);else if(b.kind==='pump')pump(b);}

 // ---- the window panes: one live mesh per building, its glow the story's ---------------------------------------------------------
 for(const [id,list] of Object.entries(panes)){const b=BLD[id],L=new THREE.Group(),p=PW(b.c[0],b.c[1]);L.position.set(p.x,b.y,p.z);L.rotation.y=-b.a;live.add(L);
  const see=b.enter,m=new THREE.MeshStandardMaterial({color:see?0x6a7a80:0x1c2226,roughness:.25,metalness:.1,emissive:0xffc070,emissiveIntensity:0,transparent:see,opacity:see?.28:1,depthWrite:!see,side:THREE.DoubleSide});
  const geos=[];for(const q of list){q.g.updateWorldMatrix(true,false);L.updateWorldMatrix(true,false);const mtx=new THREE.Matrix4().copy(L.matrixWorld).invert().multiply(q.g.matrixWorld).multiply(new THREE.Matrix4().makeTranslation(q.x,q.y,q.z));
   const gg=new THREE.PlaneGeometry(q.w,q.h);gg.applyMatrix4(mtx);geos.push(gg);}
  // merge the panes
  let pos=[],nor=[];for(const gg of geos){const n=gg.toNonIndexed();pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  const mesh=new THREE.Mesh(geo,m);mesh.name='panes-'+id;L.add(mesh);out.glows[id]={mesh,mat:m,level:0,see,base:see?.28:1};}

 // ---- the gate under the arch ---------------------------------------------------------------------------------------------------
 {const c=SPOT.campGate,a=hd(.43,-.9),g=at(root,c[0],c[1],null,a),L=new THREE.Group(),p=PW(c[0],c[1]);L.position.set(p.x,gY(c[0],c[1]),p.z);L.rotation.y=-a;live.add(L);
  for(const s of [-1,1])K.cyl(g,s*2.9,2.1,0,.24,4.4,M.bark,10);K.cyl(g,0,4.05,0,.2,6.6,M.bark,10,[0,0,Math.PI/2]);
  B(g,0,3.55,-.05,4.2,.62,.1,M.brown);face(g,paint(900,140,archArt),4.1,.6,{y:3.55,z:-.11});
  // the two leaves: rails and a diagonal, hung on the posts; the left one open into the camp, the right shut
  const leafG=(s)=>{const hinge=new THREE.Group();hinge.position.set(s*2.75,0,0);L.add(hinge);const leaf=new THREE.Group();hinge.add(leaf);const w=2.7;
   for(const y of [.35,.85,1.35])B(leaf,-s*w/2,y,0,w,.09,.06,M.grey);for(const x of [0,w])B(leaf,-s*x,.85,0,.1,1.2,.07,M.grey);K.rod(leaf,[0,.35,0],[-s*w,1.35,0],.035,M.grey);return {hinge,leaf,s,w};};
  const gl=leafG(-1),gr=leafG(1);gl.hinge.rotation.y=-1.25;gr.hinge.rotation.y=.05;out.dyn.campGate={L,left:gl,right:gr};
  face(g,sign(CAMP_SIGNS.buddy),1.1,.42,{x:-2.9,y:1.6,z:-.26});face(g,sign(CAMP_SIGNS.trespass),.9,.5,{x:2.9,y:1.6,z:-.26});}

 // ---- the clearing: flagpole, bell, tetherball, benches, the map board, the signpost, fire buckets, a ball -------------------------
 {const fp=at(root,SPOT.clearing[0],SPOT.clearing[1]);K.cyl(fp,0,.25,0,.5,.5,M2.stone,10);K.lathe(fp,[[.001,.5],[.09,.5],[.07,4],[.045,10.5],[.001,10.6]],0,0,0,K.mat(0xd8d4c8,{roughness:.4,metalness:.4}),10);K.ball(fp,0,10.7,0,.1,0xd8b040);
  K.rod(fp,[.08,10.4,0],[.08,1.2,0],.006,M2.dark);K.rod(fp,[.1,10.4,0],[.1,1.1,0],.006,M2.dark);B(fp,.1,1.1,0,.04,.12,.04,M2.metal);}
 {const bp=SOLIDS.find(q=>q.kind==='bellpost'),g=at(root,bp.e,bp.n,null,hd(0,-1));for(const x of [-.55,.55])B(g,x,1.25,0,.18,2.5,.18,M.timber);B(g,0,2.55,0,1.4,.2,.24,M.timber);
  const L=new THREE.Group(),p=PW(bp.e,bp.n);L.position.set(p.x,gY(bp.e,bp.n)+2.42,p.z);L.rotation.y=0;live.add(L);const yoke=new THREE.Group();L.add(yoke);
  const bell=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.05,0],[.11,-.06],[.15,-.2],[.2,-.36],[.24,-.42],[.24,-.46],[0,-.44]].map(([x,y])=>new THREE.Vector2(x,y)),16),K.mat(0x6a5a3a,{roughness:.45,metalness:.7}));yoke.add(bell);
  const clap=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),M2.metal);clap.position.y=-.38;yoke.add(clap);K.rod(yoke,[0,0,0],[0,-.38,0],.01,M2.metal);
  // the rope hanging from the yoke's arm
  K.rod(yoke,[.26,0,0],[.26,-1.4,0],.012,K.mat(0xc8b890,{roughness:1}));B(yoke,.13,.02,0,.3,.05,.05,M.timber);out.dyn.bell={L,yoke,swing:0,v:0};}
 {const t=SOLIDS.find(q=>q.kind==='tether'),g=at(root,t.e,t.n);K.cyl(g,0,1.6,0,.04,3.2,K.mat(0xd8d4c8,{roughness:.4,metalness:.4}),8);K.rod(g,[0,3,0],[.12,1.3,.05],.006,K.mat(0xd8d0b0,{roughness:1}));K.ball(g,.13,1.2,.06,.13,K.mat(0xd8c040,{roughness:.7}),[1,.75,1]);}
 for(const s of SOLIDS.filter(q=>q.kind==='bench'&&!q.inside)){const g=at(root,s.c[0],s.c[1],null,s.a);for(const x of [-.75,.75])B(g,x,.21,0,.1,.42,.4,M.grey);B(g,0,.44,0,1.8,.06,.36,M.timber);}
 {const s=SOLIDS.find(q=>q.kind==='mapboard'),g=at(root,s.c[0],s.c[1],null,s.a);for(const x of [-.85,.85])K.cyl(g,x,1.15,0,.07,2.3,M.brown,6);B(g,0,2.3,-.05,2,.08,.5,M.shingle);B(g,0,1.4,.02,1.82,1.3,.06,M.brown);
  face(g,paint(900,640,campMapArt),1.7,1.2,{y:1.4,z:-.02});out.anchors.mapBoard=g;}
 {const s=SOLIDS.find(q=>q.kind==='signpost'),g=at(root,s.e,s.n);K.cyl(g,0,1.3,0,.06,2.6,M.brown,6);
  for(const [t,yaw,y] of [['LODGE',hd(-.2,1),2.2],['CABINS',hd(-1,-.1),1.95],['WATERFRONT',hd(-.6,-1),1.7],['OFFICE',hd(1,-.6),1.45]]){const arm=new THREE.Group();arm.position.y=y;arm.rotation.y=-yaw+Math.PI/2;g.add(arm);B(arm,.5,0,0,.95,.2,.04,M.timber);
   const uv=sign(CAMP_SIGNS.finger(t));face(arm,uv,.95,.2,{x:.5,z:-.025,ry:0});face(arm,uv,.95,.2,{x:.5,z:.025,ry:Math.PI});}}
 {const g=at(root,-196,536,null,hd(1,0));B(g,0,1.1,0,1.2,.08,.08,K.mat(0xb8241e,{roughness:.7}));K.cyl(g,0,.55,0,.05,1.1,M.grey,6);for(const x of [-.4,0,.4]){K.cyl(g,x,.9,0,.12,.24,K.mat(0xb8241e,{roughness:.5,metalness:.3}),10);}}
 {const g=at(root,-215,531);K.ball(g,0,.12,0,.13,K.mat(0xa83a2a,{roughness:.7}),[1,.92,1],true);out.anchors.ball=g;}
 // ---- the campfire circle: the ring of stones, the log benches, the ash; an old song board ----------------------------------------
 {const c=SPOT.campfire,g=at(root,c[0],c[1]);for(let k=0;k<14;k++){const a=k/14*Math.PI*2;K.ball(g,Math.sin(a)*.9,.1,Math.cos(a)*.9,.18,0x6a665e,[1.3,.7,1]);}
  K.cyl(g,0,.03,0,.75,.04,K.mat(0x2a2622,{roughness:1}),14);for(let k=0;k<5;k++){const a=k*1.3;K.rod(g,[Math.sin(a)*.4,.06,Math.cos(a)*.4],[-Math.sin(a)*.3,.12,-Math.cos(a)*.3],.05,K.mat(0x1e1a16,{roughness:1}),.04,5);}
  for(const s of SOLIDS.filter(q=>q.kind==='log')){const l=at(root,s.c[0],s.c[1],null,s.a);K.rod(l,[-1,.22,0],[1,.22,0],.21,M.bark,.2,8);B(l,0,.42,0,1.9,.03,.2,M.timber);}
  const sb=at(root,c[0]-5.4,c[1]+4.2,null,hd(.8,-.6));for(const x of [-.6,.6])K.cyl(sb,x,.8,0,.05,1.6,M.brown,6);B(sb,0,1.25,0,1.4,.8,.05,M.brown);
  face(sb,paint(360,200,(g2,w,h)=>{g2.fillStyle='#e8dcb0';g2.fillRect(0,0,w,h);g2.fillStyle='#3a2616';g2.font=`bold ${h*.12}px Georgia`;g2.textAlign='center';g2.fillText('CAMPFIRE SONGS',w/2,h*.16);g2.font=`${h*.085}px Georgia`;
   ['1. The Whippoorwill Song','2. Kumbaya','3. Taps (stand, hats off)','','Last one to the cabin','turns out the light!'].forEach((l,i)=>g2.fillText(l,w/2,h*(.32+i*.12)));g2.fillStyle='rgba(120,90,50,.25)';g2.fillRect(0,0,w,h);}),1.32,.74,{y:1.25,z:-.03});}
 // ---- the waterfront: canoe rack and canoes, the buddy board with its tags, the lifeguard chair, the swim line -------------------
 {const s=SOLIDS.find(q=>q.kind==='canoerack'),g=at(root,s.c[0],s.c[1],null,s.a);for(const x of [-2.2,2.2])for(const z of [-.6,.6])B(g,x,.7,z,.1,1.4,.1,M.grey);for(const y of [.55,1.2])for(const z of [-.6,.6])B(g,0,y,z,4.7,.08,.1,M.grey);
  for(const [y,z] of [[.66,0],[1.31,0]]){const cn=new THREE.Group();cn.position.set(0,y+.18,z);cn.rotation.z=Math.PI;g.add(cn);const hull=new THREE.Mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),K.mat(0x9aa0a0,{roughness:.4,metalness:.6,side:THREE.DoubleSide}));hull.scale.set(2.4,.38,.42);hull.rotation.z=Math.PI/2;hull.rotation.y=Math.PI/2;cn.add(hull);}}
 {const s=SOLIDS.find(q=>q.kind==='buddyboard'),g=at(root,s.c[0],s.c[1],null,s.a);for(const x of [-1.1,1.1])K.cyl(g,x,.9,0,.06,1.8,M.brown,6);B(g,0,1.15,.02,2.3,1.0,.05,K.mat(0x3a5a7a,{roughness:.9}));
  face(g,sign(CAMP_SIGNS.buddyboard),2.2,.36,{y:1.85,z:-.02});B(g,0,2.08,0,2.4,.06,.2,M.shingle);
  // hooks in rows; old tags on some, in pairs
  const tagM=K.mat(0xe8dcb8,{roughness:1});for(let row=0;row<3;row++)for(let k=0;k<8;k++){const x=-.98+k*.28,y=1.48-row*.3;K.rod(g,[x,y,-.03],[x,y,-.09],.006,M2.metal);if((k+row)%3!==2&&!(row===0&&k<2))B(g,x,y-.08,-.06,.16,.12,.01,tagM);}
  out.anchors.buddyBoard=g;const ws=at(root,-236,514,null,hd(0,-1));for(const x of [-.55,.55])K.cyl(ws,x,.85,0,.04,1.7,M.grey,6);B(ws,0,1.4,.03,1.36,.56,.04,M.brown);face(ws,sign(CAMP_SIGNS.water),1.3,.5,{y:1.4,z:-.01});}
 {const g=at(root,-226,503,null,Math.PI);for(const x of [-.4,.4])for(const z of [-.4,.4])K.rod(g,[x,0,z],[x*.6,1.9,z*.6],.05,M.grey);B(g,0,1.9,0,.7,.06,.6,M.grey);B(g,0,2.25,.3,.7,.7,.05,M.grey);for(let k=0;k<5;k++)B(g,0,.3+k*.35,-.38,.6,.04,.05,M.grey);}
 {const D=DOCKS[1],F=frameOf(D.root,D.a);for(let k=0;k<9;k++){const t=k/8,[e,n]=F.to(lerp(-8,8,t),D.len+4+Math.sin(t*Math.PI)*3),p=PW(e,n);const b2=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),K.mat(k%2?0xe8e4d8:0xd8402a,{roughness:.5}));b2.position.set(p.x,1.03,p.z);b2.scale.y=.7;root.add(b2);}}
 // ---- old power poles at the camp's edge: crossarms, insulators, and no wires (the camp's power cut long ago) -------------------
 for(const [e,n] of [[-158,520],[-176,600],[-232,620],[-312,600]]){const g=at(root,e,n);K.cyl(g,0,4.3,0,.13,8.6,M.brown,7);B(g,0,8,0,1.6,.1,.1,M.brown);for(const x of [-.6,.6])K.cyl(g,x,8.12,0,.045,.14,0xdedad0,6);K.rod(g,[.6,8.1,0],[.9,7.2,.2],.006,M2.dark);}
 return out;
}
