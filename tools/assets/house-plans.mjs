// Dump the game's own lot plans (dist/houses.js planLots over dist/layout.js) for the houses of the Prologue
// architecture benchmark into tools/blender/houses/plans.json, so the Blender kit builds each house on exactly the lot,
// footprint, door, porch, steps, garage and colours the game already uses (nothing is copied by hand).
//
// Frame (houses.js "house-local"): metres; x across the facade (+x to the right seen from the street), +z toward the
// street (front), y up from the ground at the lot. Blender builds the same house facing -Y (BLENDER-PIPELINE.md §3):
// Blender (X, Y, Z) = (x, -z, y); after the glTF exporter's +Y-up conversion the file's coordinates ARE house-local.
//
// usage: node tools/assets/house-plans.mjs [out.json]
import fs from 'node:fs';
import {planLots} from '../../dist/houses.js';
import {seeded,hashSeed} from '../../dist/kit.js';
import {MAIN,makeSideFrame} from '../../dist/terrain.js';
import {JUNCTIONS,FRIEND_HOMES} from '../../dist/layout.js';
import {HOUSE} from '../../dist/palette.js';

const out=process.argv[2]||new URL('../blender/houses/plans.json',import.meta.url).pathname;
// The benchmark's lots: one list shared with the game (dist/house-lots.js; world.js splits exactly these with ?houses).
import {BENCHMARK_LOTS,lotKey} from '../../dist/house-lots.js';
const W={lotRand:(...n)=>seeded(hashSeed(...n)),sideFrames:JUNCTIONS.map(makeSideFrame),MAIN};
const plans=planLots(W);
// Driveway hoops are decided while houses.js builds a garage (a random 16 % of garages, and the hoop house's), so they are
// read from the real world build: every benchmark lot keeps the hoop it has in the game (the kid's and Aftermath II's).
globalThis.document??={createElement:()=>({getContext:()=>null}),getElementById:()=>null};globalThis.window??={};
const THREE=await import('../../dist/three.module.js');const {buildWorld}=await import('../../dist/world.js');
const built=buildWorld(new THREE.Scene());const hoopOf=new Map();
for(const x of built.hoops||[])if(x.kind==='garage'&&x.plan?.frameId==='main')hoopOf.set(lotKey(x.plan),x);
const hex=c=>c==null?null:'#'+c.toString(16).padStart(6,'0');
const r=x=>typeof x==='number'?+x.toFixed(5):x;
// nominal lot of a plan (the planner jitters d by up to 5 m; friend homes sit on their own dc)
const lotOf=P=>+lotKey(P).split(':')[2];
const pick=new Map();
for(const P of plans)pick.set(lotKey(P),P);
const res={generatedFrom:['dist/houses.js planLots','dist/layout.js','dist/palette.js'],frame:'houses.js house-local: metres, x across the facade (+x right seen from the street), +z toward the street, y up from the lot ground',
 palette:{trim:hex(HOUSE.trim),fascia:hex(HOUSE.fascia),soffit:hex(HOUSE.soffit),gutter:hex(HOUSE.gutter),downspout:hex(HOUSE.downspout),foundation:hex(HOUSE.foundation),brick:hex(HOUSE.brick),brickDark:hex(HOUSE.brickDark),stone:hex(HOUSE.stone),porchFloor:hex(HOUSE.porchFloor),step:hex(HOUSE.step),walk:hex(HOUSE.walk),curtain:hex(HOUSE.curtain),acUnit:hex(HOUSE.acUnit),deck:hex(HOUSE.deck),mulch:hex(HOUSE.mulch)},
 houses:[]};
for(const [key,role] of BENCHMARK_LOTS){const P=pick.get(key);if(!P)throw new Error('no plan for lot '+key);
 // derived exactly as houses.js buildHouse / buildGarage compute them
 const garageInfo=P.hasGarage?{x:P.gx,front:P.gfront,doorW:P.gw>5?5.1:2.75,doorH:2.15,depth:P.gd,y:.2}:null;
 const brickOut=P.brick==='front'?.065:P.brick==='lower'?.055:0;
 const hx=hoopOf.get(key),hoop=hx?{board:[hx.board.x,hx.board.y,hx.board.z],rim:[hx.rim.x,hx.rim.y,hx.rim.z],rimR:.23}:null;
 const id=`house.${P.key||('lot'+(P.side<0?'L':'R')+String(lotOf(P)).replace('-','m'))}`;
 res.houses.push({id,lot:key,role,key:P.key||null,d:r(P.u),side:P.side,setback:r(P.setback),style:P.style,stories:P.stories,w:r(P.w),depth:r(P.depth),h:r(P.h),roof:P.roof,rise:r(P.rise),
  front:r(P.front),wall:hex(P.wall),roofColor:hex(P.roofColor),door:hex(P.door),garageColor:hex(P.garageColor),shutters:hex(P.shutters),brick:P.brick,brickOut,
  hasGarage:P.hasGarage,gs:P.gs,gw:r(P.gw),gd:r(P.gd),gh:r(P.gh),gfront:r(P.gfront),gx:r(P.gx),garageRoof:P.garageRoof,garageRise:r(P.garageRise??null),garageInfo,dynamicGarage:!!P.dynamicGarage,interior:P.interior||null,
  porch:P.porch,eaveFront:r(P.eaveFront),lowPorch:P.lowPorch,floor:r(P.floor),doorX:r(P.doorX),porchW:r(P.porchW),pdep:r(P.pdep),steps:P.steps,stepFront:r(P.stepFront),
  chimney:P.chimney,dormers:P.dormers,rear:P.rear,grill:P.grill,ac:P.ac,leadWalk:P.leadWalk,drivX:r(P.drivX),drivW:r(P.drivW),drivEnd:r(P.drivEnd),
  seeds:[r(P.seedA),r(P.seedB),r(P.seedC)],corner:!!P.corner,hoop});
}
fs.mkdirSync(new URL('.',`file://${out}`).pathname,{recursive:true});
fs.writeFileSync(out,JSON.stringify(res,null,1)+'\n');console.log('wrote',out,res.houses.length,'houses');
for(const h of res.houses)console.log(h.id.padEnd(16),h.lot.padEnd(12),h.style.padEnd(10),h.roof.padEnd(5),'w',h.w,'d',h.depth,'garage',h.hasGarage?`${h.gw}@${h.gs}`:'-','porch',h.porch,h.porchW,'chimney',h.chimney,'brick',h.brick,'wall',h.wall,'door',h.door);
