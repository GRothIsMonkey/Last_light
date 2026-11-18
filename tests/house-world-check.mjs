// House benchmark, world bake check (Node, the real world builder, no renderer): proves that without ?houses the baked
// neighborhood is identical to the accepted build's, and that with ?houses the benchmark lots' procedural architecture
// is only regrouped (the same triangles, the same materials) into batches of their own.
// usage: node tests/house-world-check.mjs [baselineDist] [--json out.json]
//   baselineDist: a copy of the accepted dist/ (e.g. `git archive 5f13784 dist | tar -x -C /tmp/base`); optional.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const args=process.argv.slice(2),jsonOut=args.includes('--json')?args[args.indexOf('--json')+1]:null,base=args.find(a=>!a.startsWith('--')&&a!==jsonOut);
// the smallest DOM the world builder touches (canvas sign textures are optional: it falls back without them)
globalThis.document={createElement:()=>({getContext:()=>null}),getElementById:()=>null};globalThis.window={};globalThis.location={search:''};
const fp=async(dist,opts)=>{const THREE=await import(pathToFileURL(path.join(dist,'three.module.js')).href);const {buildWorld}=await import(pathToFileURL(path.join(dist,'world.js')).href);
 const scene=new THREE.Scene();const t0=Date.now();const w=opts?buildWorld(scene,await opts(dist)):buildWorld(scene);const ms=Date.now()-t0;
 const rows=[];let tris=0;const zones={};const posHash=createHash('sha256');
 for(const m of w.merged){const g=m.geometry,p=g.attributes.position;tris+=p.count/3;const z=m.userData.zone||'';zones[z]=(zones[z]||0)+p.count/3;
  const mat=m.material;const key=[mat.type,mat.roughness,mat.metalness,mat.vertexColors,mat.userData?.surface||'',z.startsWith('hb:')?'hb':z,p.count].join('|');
  let sx=0,sy=0,sz=0;for(let i=0;i<p.count;i++){sx+=p.getX(i);sy+=p.getY(i);sz+=p.getZ(i);}rows.push(key+'|'+[sx,sy,sz].map(v=>v.toFixed(2)).join(','));}
 rows.sort();for(const r of rows)posHash.update(r+'\n');
 let shadowTris=0;const shadowZones={};for(const m of w.shadowProxies){const n=m.geometry.attributes.position.count/3;shadowTris+=n;const z=m.userData.zone||'';shadowZones[z.startsWith('hb:')?z:'']=(shadowZones[z.startsWith('hb:')?z:'']||0)+n;}
 // every triangle position of the whole bake, independent of grouping
 const all=[];for(const m of w.merged){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i+=3){let x=0,y=0,z=0;for(let k=0;k<3;k++){x+=p.getX(i+k);y+=p.getY(i+k);z+=p.getZ(i+k);}all.push(`${(x/3).toFixed(3)},${(y/3).toFixed(3)},${(z/3).toFixed(3)}`);}}
 all.sort();const triHash=createHash('sha256').update(all.join('\n')).digest('hex');
 return {ms,merged:w.merged.length,tris,shadowProxies:w.shadowProxies.length,shadowTris,batchHash:posHash.digest('hex'),triHash,hbZones:Object.fromEntries(Object.entries(zones).filter(([k])=>k.startsWith('hb:'))),hbShadow:Object.fromEntries(Object.entries(shadowZones).filter(([k])=>k)),plans:w.plans.length};};
const here=path.resolve('dist');
const split=async dist=>{const {isBenchmarkLot,lotKey}=await import(pathToFileURL(path.join(dist,'house-lots.js')).href);return {splitHouses:P=>isBenchmarkLot(P)?lotKey(P):null};};
const res={};const checks=[],fails=[];const check=(n,ok,d)=>{(ok?checks:fails).push(d===undefined?n:{n,d});console.log((ok?'PASS ':'FAIL ')+n+(d!==undefined?' '+JSON.stringify(d).slice(0,300):''));};
res.branchDefault=await fp(here,null);
res.branchHouses=await fp(here,split);
if(base){res.baseline=await fp(path.resolve(base),null);
 check('default (no ?houses): the baked world is identical to the accepted build (batches, triangles, positions, shadow proxies)',
  res.baseline.batchHash===res.branchDefault.batchHash&&res.baseline.triHash===res.branchDefault.triHash&&res.baseline.shadowTris===res.branchDefault.shadowTris&&res.baseline.merged===res.branchDefault.merged,
  {baseline:{merged:res.baseline.merged,tris:res.baseline.tris,shadowTris:res.baseline.shadowTris},branch:{merged:res.branchDefault.merged,tris:res.branchDefault.tris,shadowTris:res.branchDefault.shadowTris}});}
check('?houses: the same triangles, only regrouped (identical triangle set)',res.branchHouses.triHash===res.branchDefault.triHash&&res.branchHouses.tris===res.branchDefault.tris,{tris:[res.branchDefault.tris,res.branchHouses.tris]});
check('?houses: every benchmark lot has batches of its own (12 lots)',Object.keys(res.branchHouses.hbZones).length===12,Object.keys(res.branchHouses.hbZones));
check('?houses: every benchmark lot has shadow proxies of its own',Object.keys(res.branchHouses.hbShadow).length===12,res.branchHouses.hbShadow);
check('?houses: shadow-casting triangles unchanged in total',res.branchHouses.shadowTris===res.branchDefault.shadowTris,[res.branchDefault.shadowTris,res.branchHouses.shadowTris]);
const out={checks,failures:fails,results:res};if(jsonOut)fs.writeFileSync(jsonOut,JSON.stringify(out,null,1)+'\n');
console.log(`${checks.length} passed, ${fails.length} failed`);process.exit(fails.length?1:0);
