// Run with ONLY=script SCRIPT=$PWD/tests/chapter7-art-checks.mjs node tests/verify.mjs
// Exercises the real game lifecycle and the actual rendered rig contact points.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export default function run({h,advance,press,release,THREE}) {
 const A=h.chapter7,checks=[],failed=[],metrics={};
 const check=(name,fn)=>{try{fn();checks.push(name);}catch(e){failed.push(name+' — '+e.message);}console.log(failed.at(-1)?.startsWith(name)?'FAIL':'PASS',name);};
 const people=[...new Set([h.self,...h.chapter6.appearances6.keys(),h.chapter4.samMom.person])];
 const parts=()=>people.map(person=>Object.fromEntries(Object.entries(person.parts).map(([name,m])=>[name,{geometry:m.geometry,material:m.material}])));
 for(const section of (process.env.ART_GRIP_ONLY?[]:['alex-departure','jamie','chapter2-start','c3-alex-house','c4-sam-garage','c5-garage','c6-oak'])) {
  h.jump(section);advance(.4);const before=parts();
  h.jump('c7-lange-scare');advance(.4);h.jump('c7-stalk');advance(.4);
  h.jump(section);advance(.4);
  check(section+' restores exact shared geometry and materials',()=>people.forEach((p,i)=>Object.entries(p.parts).forEach(([name,m])=>{
   assert.equal(m.geometry,before[i][name].geometry,name+' geometry');assert.equal(m.material,before[i][name].material,name+' material');
  })));
  check(section+' clears all Chapter Seven scenery, light and wardrobe additions',()=>{
   assert.equal(A.yards.parent,null);assert.equal(A.house.root.parent,null);assert.equal(A.court.court.parent,null);assert.equal(A.court.real.parent,null);
   assert.equal(A.HM.visible,false);assert.equal(A.LF.person.group.visible,false);assert.equal(A.LIGHTS.some(l=>l.parent),false);
   for(const p of people)assert.equal(p.group.getObjectByName('c7-wardrobe'),undefined);
  });
 }
 h.jump('c6-oak');advance(.2);
 const art=h.chapter6.appearances6.get(h.chapter.kit.jamie.person),face=art.face;
 const faceShape=()=>({eyes:face.eyes.map(e=>({pos:e.e.position.toArray(),scale:e.e.scale.toArray(),iris:e.iris.scale.toArray(),browZ:e.brow.position.z})),mouth:face.mouth.position.toArray(),mouthScale:face.mouth.scale.toArray()});
 const original=faceShape();h.jump('c7-curb');advance(.2);h.jump('c6-oak');advance(.2);
 check('Chapter Six facial fitting restores after Chapter Seven',()=>assert.deepEqual(faceShape(),original));
 h.jump('c7-stalk');advance(.2);
 check('Stealth detection retains accepted light values across both floors',()=>{
  const target=A.H.targets.find(t=>t.id==='player'),camera=h.camera.position.clone(),lamps=A.court.HG.lamps;
  const fixtures=[['living',1.8,'g'],['kitchen',1.4,'g'],['boy',1.6,'u']].map(([name,intensity,level])=>{
   const lamp=lamps[name],p=A.court.H3(lamp.x,lamp.z,null,level);return {intensity,p:new THREE.Vector3(p.x,A.court.G0+lamp.y,p.z)};
  });
  const dining=A.court.dining,house=A.court.houses.dining;
  const table=A.court.regW(house.x+Math.sin(house.a)*(-dining.D/2+2.1)+Math.cos(house.a)*2.3,house.z-Math.sin(house.a)*2.3+Math.cos(house.a)*(-dining.D/2+2.1));
  fixtures.push({intensity:2.6,p:new THREE.Vector3(table.x,A.court.G0+dining.F+2.25,table.z)});
  let worst=0,samples=0;
  for(const level of ['g','u'])for(const x of [-4,-1,1,4])for(const z of [-3,0,3]){
   const p=A.court.H3(x,z,null,level);h.camera.position.set(p.x,p.y+1.3,p.z);
   const expected=Math.min(1,.35+fixtures.reduce((sum,f)=>sum+f.intensity*.25/(1+f.p.distanceToSquared(h.camera.position)*.3),0));
   worst=Math.max(worst,Math.abs(target.lit()-expected));samples++;
  }
  h.camera.position.copy(camera);metrics.stealthLight={samples,maxError:worst};assert.ok(worst<1e-12,JSON.stringify(metrics.stealthLight));
 });
 h.jump('c7-green-star');advance(.2);
 check('Green foyer has no added double or reflection encounter',()=>{
  assert.equal(h.scene.getObjectByName('c7-foyer-mirror'),undefined);assert.equal(h.scene.getObjectByName('c7-occupied-glass'),undefined);
 });
 const count=()=>{let n=0;h.scene.traverse(()=>n++);return n;};const first=count();
 for(let i=0;i<4;i++){h.jump('c7-stalk');advance(.2);h.jump('c7-green-star');advance(.2);}
 metrics.replayObjects={first,last:count()};
 check('Repeated Chapter Seven starts do not accumulate scene objects',()=>assert.equal(count(),first));
 h.jump('c7-struggle');advance(.5);press('KeyF');
 let samples=0,worst=0,sum=0;
 for(let i=0;i<390;i++){
  advance(1/30);if(!A.JL.grip||!A.JL.hand)continue;
  const distances=['l','r'].map(side=>h.self.parts[side+'hand'].getWorldPosition(new THREE.Vector3()).distanceTo(A.JL.hand));
  if(i%15===0)(metrics.gripSamples||=[]).push({i,distances,camera:h.camera.position.toArray(),hand:A.JL.hand.toArray(),body:h.self.group.position.toArray()});
  worst=Math.max(worst,...distances);sum+=distances[0]+distances[1];samples+=2;
 }
 release('KeyF');metrics.grip={samples,maxMetres:worst,meanMetres:sum/(samples||1)};
 check('Both rescue hands remain within 6 cm of Jamie’s wrist',()=>{assert.ok(samples>100);assert.ok(worst<.06,JSON.stringify(metrics.grip));});
 const root=new URL('../dist/',import.meta.url),runtimeHashes=Object.fromEntries(fs.readdirSync(root).filter(n=>fs.statSync(new URL(n,root)).isFile()).sort().map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(new URL(n,root))).digest('hex')]));
 const report={passed:checks.length,checks,failed,metrics,runtimeHashes};
 if(process.env.ART_REPORT)fs.writeFileSync(process.env.ART_REPORT,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));if(failed.length)process.exitCode=1;
 if(failed.length)throw new Error(failed.join('\n'));
}
