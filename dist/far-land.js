// The far ground's own level, as one function: what background.js draws beyond the streets (and what the
// regions with their own ground — the woods, the town, Pine Ridge — meet at their edges). Pure; builds nothing.
import {terrainY,streetCoords,nearY,LAWN} from './terrain.js';
import {ROAD_START} from './layout.js';
import {inRegion,edgeDist,landY as townLandY} from './town-plan.js';
import {smooth,lerp} from './kit.js';

export const farT=(x,z)=>terrainY(x,z)+LAWN-.08;// the far ground's lawn level
// Where the far ground slides under authored lawns, keep it just below them.
export const baseLandY=(x,z)=>{const {d,lat}=streetCoords(x,z),a=Math.abs(lat);const t=farT(x,z);return a<86&&d>ROAD_START-6?Math.min(t,nearY(d,lat)+LAWN-.08):t;};
// One ground surface and one grass material across the old/new region boundary.
export const farLandY=(x,z)=>{const base=baseLandY(x,z);return inRegion(x,z,36)?lerp(base,townLandY(x,z),inRegion(x,z)?1:1-smooth(edgeDist(x,z)/36)):base;};
