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
// The benchmark's lots on Oak Hollow Drive (Phase One area, d -50..620): the eight houses that open the ride (both
// sides, d -20..70: all four styles), the hoop house (d 153) and the house across from it, the car house (d 522, lot 530) and
// the house across from it. Keys are 'main:<side>:<lot d>' with the lot's nominal 29 m position.
export const BENCHMARK_LOTS=[
 ['main:-1:-21','ordinary'],['main:1:-21','ordinary'],['main:-1:8','ordinary'],['main:1:8','ordinary'],
 ['main:-1:37','ordinary'],['main:1:37','ordinary'],['main:-1:66','ordinary'],['main:1:66','ordinary'],
 ['main:-1:153','story:hoop'],['main:1:153','ordinary'],['main:-1:530','story:car'],['main:1:530','ordinary'],
];
const W={lotRand:(...n)=>seeded(hashSeed(...n)),sideFrames:JUNCTIONS.map(makeSideFrame),MAIN};
const plans=planLots(W);
const hex=c=>c==null?null:'#'+c.toString(16).padStart(6,'0');
const r=x=>typeof x==='number'?+x.toFixed(5):x;
// nominal lot of a plan (the planner jitters d by up to 5 m; friend homes sit on their own dc)
const lotOf=P=>{const k=Math.round((P.u-(-427))/29);return -427+29*k;};
const pick=new Map();
for(const P of plans){const nominal=lotOf(P);const key=`main:${P.side}:${nominal}`;pick.set(key,P);}
const res={generatedFrom:['dist/houses.js planLots','dist/layout.js','dist/palette.js'],frame:'houses.js house-local: metres, x across the facade (+x right seen from the street), +z toward the street, y up from the lot ground',
 palette:{trim:hex(HOUSE.trim),fascia:hex(HOUSE.fascia),soffit:hex(HOUSE.soffit),gutter:hex(HOUSE.gutter),downspout:hex(HOUSE.downspout),foundation:hex(HOUSE.foundation),brick:hex(HOUSE.brick),brickDark:hex(HOUSE.brickDark),stone:hex(HOUSE.stone),porchFloor:hex(HOUSE.porchFloor),step:hex(HOUSE.step),walk:hex(HOUSE.walk),curtain:hex(HOUSE.curtain),acUnit:hex(HOUSE.acUnit),deck:hex(HOUSE.deck),mulch:hex(HOUSE.mulch)},
 houses:[]};
for(const [key,role] of BENCHMARK_LOTS){const P=pick.get(key);if(!P)throw new Error('no plan for lot '+key);
 // derived exactly as houses.js buildHouse / buildGarage compute them
 const garageInfo=P.hasGarage?{x:P.gx,front:P.gfront,doorW:P.gw>5?5.1:2.75,doorH:2.15,depth:P.gd,y:.2}:null;
 const brickOut=P.brick==='front'?.065:P.brick==='lower'?.055:0;
 const hoop=P.key==='hoop'?{board:[P.gx,3.28,P.gfront+.06],rim:[P.gx,3.05,P.gfront+.36],rimR:.23}:null;
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
