// The Prologue house-architecture benchmark's lots (DEV, ?houses): which first-row lots on Oak Hollow Drive get the
// authored Blender houses (dist/assets/house/house.prologue.glb). One list for the game (world.js splits these lots'
// procedural architecture into batches of their own, only with ?houses) and for the Blender build
// (tools/assets/house-plans.mjs dumps exactly these plans). Keys: 'main:<side>:<nominal lot d>' on the 29 m lot grid.
import {LOT_FIRST,LOT_SPACING} from './layout.js';
export const BENCHMARK_LOTS=[
 // the eight houses that open the ride (both sides, d -20..70: ranch, colonial, cape and front-gable)
 ['main:-1:-21','ordinary'],['main:1:-21','ordinary'],['main:-1:8','ordinary'],['main:1:8','ordinary'],
 ['main:-1:37','ordinary'],['main:1:37','ordinary'],['main:-1:66','ordinary'],['main:1:66','ordinary'],
 // the hoop house (d 153) and the house across from it; the car house (d 522, lot 530) and the house across from it
 ['main:-1:153','story:hoop'],['main:1:153','ordinary'],['main:-1:530','story:car'],['main:1:530','ordinary'],
];
// The nominal lot of a first-row plan (planLots jitters d by up to 5 m; friend homes sit on their own d).
export const lotKey=P=>P.frameId==='main'?`main:${P.side}:${LOT_FIRST+LOT_SPACING*Math.round((P.u-LOT_FIRST)/LOT_SPACING)}`:null;
const KEYS=new Set(BENCHMARK_LOTS.map(([k])=>k));
export const isBenchmarkLot=P=>KEYS.has(lotKey(P));
