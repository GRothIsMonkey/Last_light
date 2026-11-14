// One authored damage map from the breach to October. Named story homes and routes
// are protected. October clears two condemned shells; it never restores their houses.
import * as THREE from './three.module.js';
import {makeShapes,bake,clamp} from './chapter6-kit.js';
import {surfaceMaterial} from './materials.js';
export const DAMAGE_MAP=Object.freeze([
 {id:'north-east',d:1114.2,side:1,type:'torn',wave:0},
 {id:'north-west',d:1110.2,side:-1,type:'crushed',wave:1},
 {id:'1081-east',d:1081.5,side:1,type:'torn'},
 {id:'1056',d:1056.4,side:1,type:'partial'},
 {id:'opposite-sam',d:995.2,side:1,type:'torn'},
 {id:'968-west',d:968.5,side:-1,type:'burned',clearOctober:true},
 {id:'967-east',d:967.4,side:1,type:'crushed'},
 {id:'937-east',d:937.4,side:1,type:'burned'},
 {id:'907-east',d:907.7,side:1,type:'crushed',clearOctober:true},
 {id:'895-west',d:895,side:-1,type:'torn'},
 {id:'882-east',d:882.6,side:1,type:'partial'},
 {id:'south-of-cordon',d:824,side:-1,type:'partial'},
 {id:'near-jamie',d:764,side:-1,type:'partial'},
 {id:'near-home',d:464,side:-1,type:'partial'},
 {id:'briarwood',d:164,side:-1,type:'partial',frame:'alex'}
]);
const random=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
export function createDistrict({world,root,ruin,proxy,hurt,engage,dust,chunks,sfx}){
 const material=(color,kind)=>surfaceMaterial(new THREE.MeshStandardMaterial({color,roughness:.95}),kind);
 const K=makeShapes(),M={wood:material(0x70533b,'timber'),char:material(0x292321,'timber'),plaster:material(0xb3a68e,'concrete'),brick:material(0x714b3d,'brick'),metal:new THREE.MeshStandardMaterial({color:0x76716a,roughness:.6,metalness:.55}),insul:new THREE.MeshStandardMaterial({color:0x9c8a65,roughness:1}),tarp:new THREE.MeshStandardMaterial({color:0x354c5b,roughness:1,side:THREE.DoubleSide})};
 const records=[],used=new Set(),D={state:null,time:0,wave:false,records};
 for(const [i,entry]of DAMAGE_MAP.entries()){
  const frame=entry.frame==='alex'?world.homes.alex.frameId:'main',candidates=world.houses.filter(q=>q.frameId===frame&&q.side===entry.side&&!q.far&&!q.key);
  candidates.sort((a,b)=>Math.abs(a.u-entry.d)-Math.abs(b.u-entry.d));const Q=candidates[0];if(!Q||used.has(Q)||Math.abs(Q.u-entry.d)>24)continue;used.add(Q);
  const X=proxy('district-'+entry.id,Q,{interior:true,seed:71+i}),r={...entry,X,i,done:false,age:-1,batch:null,cleared:null,at:Q.toWorld(0,0)};r.originals=[];X.G.traverse(o=>r.originals.push({o,visible:o.visible,material:o.material}));records.push(r);
 }
 function decorate(r){const X=r.X,G=X.G,Q=X.Q,R=random(603+r.i*131),w=X.w,d=X.D,h=X.h,fl=Q.floor??.34,burn=r.type==='burned',crushed=r.type==='crushed',partial=r.type==='partial',wood=burn?M.char:M.wood;
  // Missing roof, wall and floor pieces expose the structure and furnished rooms.
  for(const [i,f]of X.roof.entries())if(!partial||i%3===0)f.g.visible=false;
  for(const key of Object.keys(X.parts))if(key.startsWith('gable')||(!partial&&key==='side-1f'))X.parts[key].visible=false;
  if(burn||crushed){for(const f of X.front)if(f.i%2===0)f.g.visible=false;
   for(const m of G.children)if(m.isMesh&&m.position.y>h*.43&&m.position.y<h*.57&&m.geometry?.parameters?.height<.2)m.visible=false;}
  // Exposed studs, headers, floor joists and pitched roof trusses: they still bear weight.
  for(let i=0;i<Math.ceil(w/.65);i++){const x=-w/2+.18+i*.65;if((burn||crushed)&&i%4===1)continue;
   const top=partial?h:h*(.66+R()*.34);K.box(G,x,fl+top/2,d/2-.15,.07,top,.10,wood,{rz:(R()-.5)*.05});
   if(!partial)K.pipe(G,[x,h-.1,-d/2],[x,h+(Q.rise||1.8)*.8,0],.045,wood,5);
   if(Q.stories===2&&!partial)K.box(G,x,h/2+.05,-d*.15,.09,.18,d*.62,wood,{rx:(R()-.5)*.05});
  }
  K.box(G,0,h*.53,d/2-.15,w,.18,.14,wood,{rz:crushed?.06:0});
  K.box(G,-w*.35,h*.24,-d*.1,.10,h*.48,.10,wood,{rz:.13});
  // Torn insulation hangs between the remaining roof members, above the open room.
  for(let j=0;j<5;j++)K.box(G,-w*.38+j*w*.16,h-.22-R()*.32,-d*.18,.42,.24,.9,M.insul,{rx:.35+R()*.5,rz:.1});
  if(X.garage&&!partial){const gg=X.garage;gg.g.children[0].visible=false;
   for(const s of [-1,1])for(let z=-gg.gd/2+.4;z<gg.gd/2;z+=.85)K.box(gg.g,s*(gg.gw/2-.1),1.2,z,.07,2.4,.1,wood,{rz:s*.16});
   K.pipe(gg.g,[-gg.gw/2,2.5,gg.gd/2],[gg.gw/2,1.5,gg.gd/2],.075,M.metal,6);
   K.box(gg.g,0,.52,0,1.7,.55,3.3,M.metal,{rz:.13});K.box(gg.g,0,.9,-.45,1.3,.28,1.2,M.char,{rx:.18});
  }
  // Full-size fallen roof panels, framing and brick piles within each lot, off the walk.
  for(let j=0;j<(partial?18:40);j++){
   const x=(R()-.5)*(w+1.5),z=d/2+.6+R()*2.5,plank=j%3!==0;
   K.box(G,x,.15+R()*.35,z,plank?.08:.32,plank?.12:.23,plank?1.2+R()*2.8:.38,plank?wood:M.brick,{ry:R()*6.28,rx:(R()-.5)*.4,rz:(R()-.5)*.5});
  }
  if(!partial){K.box(G,-w*.22,.45,d*.42,w*.54,.19,d*.5,M.char,{rx:.18,rz:.26});K.box(G,w*.3,.9,-d*.2,w*.35,.16,d*.37,M.plaster,{rx:-.7,rz:.3});}
  // Familiar domestic objects make the opened rooms readable at street distance.
  const chair=new THREE.Group();G.add(chair);chair.position.set(w*.27,.5,d*.37);chair.rotation.z=-.8;
  K.box(chair,0,0,0,.48,.12,.48,wood);K.box(chair,0,.3,.22,.48,.65,.08,wood);for(const x of [-.18,.18])for(const z of [-.18,.18])K.box(chair,x,-.22,z,.05,.45,.05,wood);
  if(partial){const tarp=new THREE.Mesh(new THREE.PlaneGeometry(w*.45,d*.5,12,12),M.tarp),p=tarp.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.08*Math.sin(p.getX(i)*5)+.04*Math.cos(p.getY(i)*4));tarp.geometry.computeVertexNormals();tarp.rotation.x=-Math.PI/2+.13;tarp.position.set(w*.18,h+.15,-d*.25);G.add(tarp);}
  if(burn){const changed=new Map();G.traverse(o=>{if(o.isMesh&&o.material?.color&&o.material!==M.metal){if(!changed.has(o.material)){const m=o.material.clone();m.color.multiplyScalar(.36);m.emissive?.setHex(0);changed.set(o.material,m);}o.material=changed.get(o.material);}});}
 }
 function finish(r){if(r.done)return;r.done=true;const X=r.X;if(r.batch){r.batch.visible=true;X.piv.visible=false;return;}
  hurt(X,'facade',1,{only:r.type==='partial'?[0]:null});hurt(X,'roof',1,{which:r.type==='partial'?'left':'all'});hurt(X,'chimney',1);hurt(X,'porch',r.type==='partial'?.35:1);hurt(X,'garage',r.type==='partial'?.25:1);
  if(!r.decorated){decorate(r);r.decorated=true;}
  const batch=X.piv.clone(true);batch.visible=true;batch.name='persistent-wreck-'+r.id;
  const hidden=[];batch.traverse(o=>{if(o!==batch&&!o.visible)hidden.push(o);});for(const o of hidden)o.removeFromParent();root.add(batch);bake(batch);r.batch=batch;X.piv.visible=false;const originalSet=new Set(r.originals.map(v=>v.o));X.G.traverse(o=>{if(!originalSet.has(o))o.visible=false;});for(const v of r.originals){v.o.visible=v.visible;if(v.material)v.o.material=v.material;}
 }
 function clearLot(r){if(r.cleared)return;const g=new THREE.Group();g.name='october-foundation-'+r.id;g.position.copy(r.X.piv.position);g.rotation.copy(r.X.piv.rotation);root.add(g);
  const w=r.X.w,d=r.X.D;K.box(g,0,.06,0,w,.16,d,M.plaster);for(const x of [-w/2,w/2])K.box(g,x,.28,0,.24,.55,d,M.brick);K.box(g,0,.28,-d/2,w,.55,.24,M.brick);
  for(let i=0;i<12;i++)K.box(g,-w/2+i*w/11,.65,d/2+1,.06,1.3,.06,M.wood);K.box(g,0,.8,d/2+1,w,.08,.04,M.wood);bake(g);r.cleared=g;
 }
 function activate(r,instant=true){const X=r.X;X.on=true;X.cut.on=true;X.piv.visible=true;r.age=0;if(instant)finish(r);}
 function show(on){if(!on){reset();return;}
  if(D.state)return;D.state='catastrophe';D.time=0;D.wave=false;for(const r of records)if(r.wave===undefined)activate(r);ruin.syncCuts();}
 function settle(state='august'){show(true);D.state=state;for(const r of records){if(!r.X.on)activate(r);else finish(r);const clear=state==='october'&&r.clearOctober;if(clear)clearLot(r);if(r.batch)r.batch.visible=!clear;if(r.cleared)r.cleared.visible=clear;}ruin.syncCuts();}
 function update(dt,{impact=false,camera=null}={}){if(!D.state)return;D.time+=dt;
  if(impact&&!D.wave){D.wave=true;D.waveAt=D.time;}
  for(const r of records){if(r.wave!==undefined&&!r.X.on&&D.wave&&D.time-D.waveAt>r.wave*1.4){activate(r,false);ruin.syncCuts();sfx('c8Collapse',r.at,{gain:.65});dust({x:r.at.x,y:r.at.ground+2,z:r.at.z},{n:7,r:5,rise:1,size:[4,13],life:10});}
   if(r.X.on&&!r.done){r.age+=dt;const k=clamp(r.age/3.2,0,1);hurt(r.X,'roof',k,{which:'all'});hurt(r.X,'facade',k);hurt(r.X,'chimney',k);if(k===1)finish(r);}
   if(camera&&r.batch){const near=Math.hypot(camera.position.x-r.at.x,camera.position.z-r.at.z)<310;r.batch.visible=near&&!(D.state==='october'&&r.clearOctober);}
  }
 }
 function reset(){D.state=null;D.wave=false;for(const r of records){r.X.on=false;r.X.cut.on=false;r.X.piv.visible=false;r.done=false;r.age=-1;for(const v of r.originals){v.o.visible=v.visible;if(v.material)v.o.material=v.material;}if(r.batch)r.batch.visible=false;if(r.cleared)r.cleared.visible=false;}ruin.syncCuts();}
 return {show,settle,update,reset,records,get state(){return {phase:D.state,damaged:records.filter(r=>r.X.on).map(r=>({id:r.id,u:r.X.Q.u,frame:r.X.Q.frameId,type:r.type,cleared:D.state==='october'&&!!r.clearOctober}))};}};
}
