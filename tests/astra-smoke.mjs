import assert from 'node:assert/strict';
import {chapterFiveTools} from './chapter5-sim.mjs';
export default async function(T){const {h,advance,check}=T,X=chapterFiveTools(T),{A5,C5,goEN,go,faceV,act,wait,me,until}=X;
 const out=[];const pass=(name,fn)=>{check(name,fn);out.push(name);console.log('PASS',name);};
 h.jump('oak');advance(.1);const before=new Map(Object.entries(h.self.parts).map(([k,p])=>[k,p.geometry]));
 h.jump('c5-garage');advance(1);
 pass('Chapter Five replaces the player body and both companions',()=>{assert.ok(h.self.art5);assert.notEqual(before.get('torso'),h.self.parts.torso.geometry);for(const c of h.chapter.companions.all.filter(c=>c.active))assert.ok(c.person.art5);});
 pass('new props retain the accepted contact sockets and open bags',()=>{assert.ok(A5.G5.S.bag.opening.y>.3);assert.ok(A5.G5.S.bagParts.hinge);assert.ok(A5.G5.S.cam.obj.getObjectByName('supply-camera'));});
 h.jump('oak');advance(.1);pass('earlier chapter restores every player mesh exactly',()=>{for(const [k,g] of before)assert.equal(h.self.parts[k].geometry,g,k);assert.equal(h.self.art5,false);});
 h.jump('c5-boundary');advance(.6);until(()=>C5().flags.gateShut,10);
 pass('gate closes before the player passes',()=>assert.ok(C5().flags.gateShut));
 advance(10);pass('Sam cannot silently solve the gate instead of the player',()=>assert.ok(!C5().flags.gateOpened));
 const q=A5.GT.barPoint('campL',.75),p=me(),d=Math.hypot(p.x-q.x,p.z-q.z),target={x:q.x+(p.x-q.x)/d*1.15,z:q.z+(p.z-q.z)/d*1.15};go(target,{r:.3,max:25});faceV(q);advance(.2);
 pass('gate action is reachable through normal F interaction',()=>assert.ok(act('c5-shove',6)));advance(1.6);
 pass('player contact opens the same physical gate',()=>{assert.equal(C5().flags.gateOpened,'you');assert.ok(A5.C.flags.gateHelp);});
 goEN(-163,506,{r:1.6,max:30,sprint:true});until(()=>C5().phase==='n5-out',30);
 pass('gate route reaches the recovery scene',()=>{assert.equal(C5().phase,'n5-out');assert.ok(C5().flags.boundary);});
 const start=h.snapshot.clock;until(()=>C5().flags.after,40);
 pass('recovery reaches the lot within forty seconds with an explicit transition',()=>{assert.ok(C5().flags.after);assert.equal(A5.C.out.transition,true);assert.ok(h.snapshot.clock-start<40);});
 for(const sec of ['c5-route-a','c5-route-c']){h.jump(sec);advance(5);pass(sec+' keeps the double physically present',()=>assert.ok(A5.camp.D.person.group.visible));}
 const forest=h.world.pine.forest;pass('forest instance memory remains bounded',()=>{assert.ok(forest.geometryBytes<12e6);assert.ok(forest.trees>3000);});
 console.log(JSON.stringify({passed:out.length,checks:out,forest:{trees:forest.trees,bytes:forest.geometryBytes},buildMs:T.buildMs},null,2));}
