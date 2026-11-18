// Dump the runtime riding anchors of the four boys' bicycles from dist/rig.js + dist/cast.js (the source of truth) into
// tools/blender/bikes/anchors.json, so the Blender build uses the game's own numbers instead of copies of them.
// Everything is in the game's bike-local frame: metres, origin on the ground between the tyres, +Y up, forward -Z,
// right +X (rig.js side +1). Blender's frame for the same point is (-x, z, y) (BLENDER-PIPELINE.md §3).
// usage: node tools/assets/bike-anchors.mjs [out.json]
import fs from 'node:fs';
import * as THREE from '../../dist/three.module.js';
import {bikeGeometry,gripPos,pedalPos,REFLECTOR} from '../../dist/rig.js';
import {CAST} from '../../dist/cast.js';
const out=process.argv[2]||new URL('../blender/bikes/anchors.json',import.meta.url).pathname;
const V=()=>new THREE.Vector3(),r=v=>+v.toFixed(5),arr=v=>[r(v.x),r(v.y),r(v.z)];
const toSteer=(G,x,y,z)=>new THREE.Vector3(x,y,z).sub(G.pivotV).applyQuaternion(G.rakeInv);
const fromSteer=(G,v)=>v.clone().applyQuaternion(G.rakeQ).add(G.pivotV);
const ids={jamie:'bike.jamie',sam:'bike.sam',alex:'bike.alex',player:'bike.player'};
const res={generatedFrom:['dist/rig.js','dist/cast.js'],frame:'game bike-local: metres, +Y up, forward -Z, right +X',bikes:{}};
for(const [key,id] of Object.entries(ids)){const S=CAST[key].bike,G=bikeGeometry(S.style,S.wheelR),gr=G.grip;
 const bellSL=toSteer(G,-.15,gr[1]+.025,gr[2]);
 res.bikes[id]={cast:key,spec:S,style:G.style,wheelR:G.wheelR,front:G.front,rear:G.rear,bb:G.bb,crank:G.crank,pedalX:G.pedalX,saddle:G.saddle,grip:G.grip,pivot:G.pivot,rake:G.rake,
  axleRear:[0,G.wheelR,G.rear],axleFront:[0,G.wheelR,G.front],
  // the procedural builder's own construction points (rig.js createBike), for reference
  seatCluster:[0,G.saddle[1]-.15,G.saddle[2]-.04],headTop:[0,G.pivot[1]+.16,G.pivot[2]+.045],headLow:[0,G.pivot[1]+.01,G.pivot[2]+.005],
  // contact points the riders' poses use (rig.js gripPos / pedalPos) at steer 0 and crank 0
  gripL:arr(gripPos(0,-1,V(),G)),gripR:arr(gripPos(0,1,V(),G)),pedalL0:arr(pedalPos(0,-1,V(),G)),pedalR0:arr(pedalPos(0,1,V(),G)),
  // rig.js ridePose holds the hand target 1 cm in, 2 cm up and 2 cm back of the grip point, the ankle 3.5 cm out, 6.2 cm above, 5 cm behind the pedal
  bell:arr(fromSteer(G,bellSL)),bellLeverPivot:arr(fromSteer(G,bellSL.clone().add(new THREE.Vector3(-.022,-.008,.012)))),
  frontReflector:arr(fromSteer(G,toSteer(G,0,G.pivot[1]+.12,G.pivot[2]-.06))),
  rearReflector:{center:[0,G.saddle[1]-.15+.015,G.saddle[2]-.04+.455],r:REFLECTOR.r,color:REFLECTOR.color},
  kickPivot:[-.05,G.bb[1]-.02,G.bb[2]+.1],kickLen:.3,kickStowedRotX:-1.2,kickDeployed:{x:-.25,z:-.32}};
}
fs.writeFileSync(out,JSON.stringify(res,null,1)+'\n');console.log('wrote',out);
for(const [id,b] of Object.entries(res.bikes))console.log(id,b.style,'R',b.wheelR,'wb',+(b.rear-b.front).toFixed(3),'bb',b.bb,'saddle',b.saddle,'grip',b.grip,'gripL',b.gripL,'pivot',b.pivot,'bell',b.bell);
