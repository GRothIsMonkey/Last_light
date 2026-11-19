// Dump the old oak's site from the game itself (dist/layout.js LOOKOUT, dist/route.js, the built world's groundY) into
// tools/blender/vegetation/oak_site.json, so the Blender oak is built on exactly the ground, swing, bench, carving and
// story marks the game already uses (nothing is copied by hand).
//
// Oak-local frame (the frame the game places the tree in: props.js W.place(MAIN, oak.d, oak.lat), rotation -heading):
// metres; +x = lateral (toward higher lat), +f = forward (toward higher d), up from the oak's placement height.
// Blender builds the oak with X = x, Y = f, Z = up; the glTF exporter's +Y-up turn then gives the game's local frame
// (glTF x = lat, y = up, -z = forward), the same convention as every rigid prop.
//
// usage: node tools/assets/oak-site.mjs [out.json]
import fs from 'node:fs';
globalThis.document??={createElement:()=>({getContext:()=>null}),getElementById:()=>null};globalThis.window??={};
const THREE=await import('../../dist/three.module.js');
const {buildWorld}=await import('../../dist/world.js');
const {LOOKOUT,BULB,ROAD_END}=await import('../../dist/layout.js');
const {groundPoint,heading}=await import('../../dist/route.js');
const {knoll,MAIN}=await import('../../dist/terrain.js');
const out=process.argv[2]||new URL('../blender/vegetation/oak_site.json',import.meta.url).pathname;
const world=buildWorld(new THREE.Scene());
const o=LOOKOUT.oak,h=heading(o.d),P0=groundPoint(o.d,o.lat);
const baseY=P0.y+knoll(o.d,o.lat)-.02;// exactly where props.js stands the procedural oak
// local axes from the game's own placement: a group at the oak with rotation.y=-heading
const g=new THREE.Group();g.rotation.y=-h;g.updateMatrixWorld();
const ex=new THREE.Vector3(1,0,0).applyQuaternion(g.quaternion),ef=new THREE.Vector3(0,0,-1).applyQuaternion(g.quaternion);
const local=(x,z,y)=>{const dx=x-P0.x,dz=z-P0.z;return [+(dx*ex.x+dz*ex.z).toFixed(4),+(dx*ef.x+dz*ef.z).toFixed(4),+(y-baseY).toFixed(4)];};
const at=(d,lat,dy=0)=>{const p=groundPoint(d,lat);return local(p.x,p.z,world.groundY(d,lat)+dy);};
// ground grid around the oak in local coordinates (each sample projected back to street coordinates)
const R=24,step=.5,grid=[];
for(let f=-R;f<=R+1e-6;f+=step){const row=[];for(let x=-R;x<=R+1e-6;x+=step){const wx=P0.x+x*ex.x+f*ef.x,wz=P0.z+x*ex.z+f*ef.z;const q=MAIN.project(wx,wz,o.d+f);row.push(+(world.groundY(q.u,q.v)-baseY).toFixed(4));}grid.push(row);}
const sw=LOOKOUT.swing,swingTop=at(sw.d,sw.lat,4.35);// ambient.js: the swing's pivot (rope top) at groundY + 4.35
const toward=Math.atan2(-(sw.lat-o.lat),sw.d-o.d);// ending.js: the carving faces the swing and the street
const site={generatedFrom:['dist/layout.js LOOKOUT','dist/route.js','dist/terrain.js knoll','dist/world.js groundY','dist/props.js (oak placement)','dist/ambient.js (swing)','dist/ending.js (carving, old bike)'],
 frame:'oak-local: metres; x = lateral (+lat), f = forward (+d), z = up from the oak placement height (props.js: groundPoint.y + knoll - 0.02). Blender X=x, Y=f, Z=z.',
 oak:{d:o.d,lat:o.lat,heading:+h.toFixed(6),world:[+P0.x.toFixed(4),+baseY.toFixed(4),+P0.z.toFixed(4)],groundAtTrunk:+(world.groundY(o.d,o.lat)-baseY).toFixed(4)},
 axes:{lateral:[+ex.x.toFixed(6),+ex.z.toFixed(6)],forward:[+ef.x.toFixed(6),+ef.z.toFixed(6)]},
 swing:{d:sw.d,lat:sw.lat,ground:at(sw.d,sw.lat),pivot:swingTop,rope:3.05,tireBelowPivot:3.35,tireRadius:.41,note:'ambient.js: rope 3.05 m from the pivot, tire centre 3.35 m below it; pendulum clamped to +-0.75 rad'},
 carving:{height:1.32,letters:[0,.16],radiusInGame:.462,azimuthToward:+toward.toFixed(6),dir:[+(Math.sin(-0)).toFixed(3)],note:'ending.js: centred on the trunk side that faces the swing, 1.32-1.48 m above the trunk ground'},
 bench:{d:LOOKOUT.bench.d,lat:LOOKOUT.bench.lat,at:at(LOOKOUT.bench.d,LOOKOUT.bench.lat),size:[1.9,.9]},
 chalk:{d:LOOKOUT.chalk.d,lat:LOOKOUT.chalk.lat,at:at(LOOKOUT.chalk.d,LOOKOUT.chalk.lat)},
 stop:{at:at(LOOKOUT.stop.d,LOOKOUT.stop.lat)},
 fence:{d:LOOKOUT.fenceD,f:+(LOOKOUT.fenceD-o.d).toFixed(3),lat:[-17,17]},
 bulb:{d:BULB?.d??1142,r:BULB?.r??11,at:at(BULB?.d??1142,0)},roadEnd:ROAD_END,
 // story positions that stand, sit or lie near the trunk (the tree must leave them free)
 marks:{oldBike:{d:o.d+.9,lat:o.lat-1.9,at:at(o.d+.9,o.lat-1.9),note:'ending.js: the other bike on its side'},
  sitAgainstTrunk:{d:o.d-.6,lat:o.lat-1.15,at:at(o.d-.6,o.lat-1.15),note:'chapter8-fall.js / chapter8-finale.js OAK'},
  ch6Stand:{at:at(o.d-1.2,o.lat-1.6)},friendsJamie:{at:at(o.d-2.2,o.lat-1.4)},friendsSam:{at:at(o.d-2.6,o.lat-.2)},
  oakSunsetLook:{at:at(o.d+2,o.lat-4)},photoGroup:{at:at(o.d-3.6,o.lat-6.2)},photoCam:{at:at(o.d-10.5,o.lat-7.5,1.25)}},
 grid:{x0:-R,f0:-R,step,n:grid.length,rows:grid}};
// cross-check: the forward axis is the street direction (groundPoint(d+1)-groundPoint(d))
const a=groundPoint(o.d,o.lat),b=groundPoint(o.d+1,o.lat);site.axes.check=+(((b.x-a.x)*ef.x+(b.z-a.z)*ef.z)).toFixed(5);
fs.writeFileSync(out,JSON.stringify(site,null,1));
console.log('wrote',out,'heading',h.toFixed(4),'axis check (1 = aligned)',site.axes.check,'swing pivot',swingTop,'ground at trunk',site.oak.groundAtTrunk);
