// shot definitions for tests/chapter8-dev-shots.mjs: {name:{note, setup(), frames:[[frameName, fn()], ...]}}; functions run in the page
export default {
 sam:{note:'Sam: the wing, his eyes at the slot, crawling out, the flood door',setup:()=>{const L=lastLight,F=__f;L.jump('c8-sam');F.run(2);},
  frames:[['wing',()=>{const F=__f,A=lastLight.chapter8;F.put(F.W(-8.5,26.2),Math.PI/2);F.run(.4);F.face(F.W(-20,27.5,-1.6));F.run(.1);return {cell:A.state.cell};}],
   ['slot',()=>{const F=__f;F.put(F.W(-19.75,28.05),Math.PI);F.run(.6);F.face(F.W(-19.75,29.4,-2.0));F.run(.1);}],
   ['crawl',()=>{const F=__f,A=lastLight.chapter8,C=A.C;Object.assign(C.flags,{samTrust:true,breakerOff:true,drained:true,wingHunt:true});A.X.ST.waterWant=-.33;A.X.setDoor('samCell',.45);A.X.ST.wedge=1;A.X.ST.duck={samCell:.4};
     const s=A.CTX.sam;C.samCrawl={t:2};F.put(F.W(-18.4,26.6),Math.PI);F.run(1.2);F.face(F.W(-19.75,29.2,-3.1));F.run(.1);}]]},
 jamie:{note:'Jamie: carried back by the hunter; at his slot; the hunter at the grille',setup:()=>{const L=lastLight,F=__f;L.jump('c8-retrieval');F.run(1);F.put(F.W(14.6,27.3),Math.PI/2);F.run(.5);},
  frames:[['carried',()=>{const F=__f;F.run(5);F.face({x:lastLight.chapter8.HM.x,y:-1.4,z:lastLight.chapter8.HM.z});F.run(.1);}],
   ['grille',()=>{const F=__f;F.run(9);F.put(F.W(19.8,27.2),Math.PI/2);F.run(.3);F.face(F.W(23,27,-1.4));F.run(.1);}],
   ['slot',()=>{const F=__f,A=lastLight.chapter8;F.run(12);F.put(F.W(25.5,25.9),0);F.run(.6);F.face(F.W(25.5,24.4,-1.55));F.run(.1);}]]},
 alex:{note:'Alex: the passage, the made room, his cell, the room coming apart, the ledge, the barrier giving way',setup:()=>{const L=lastLight,F=__f;L.jump('c8-made');F.run(2);},
  frames:[['room',()=>{const F=__f;F.put(F.W(19.6,65.4),Math.PI);F.run(.4);F.face(F.W(23,70,-2));F.run(.1);}],
   ['cell',()=>{const F=__f,A=lastLight.chapter8;A.X.setDoor('alexCell',1,{instant:true});F.put(F.W(21.3,72.4),Math.PI);F.run(.6);F.face(F.W(20.5,77.6,-2.4));F.run(.1);}],
   ['breaks',()=>{const F=__f,A=lastLight.chapter8;A.SC&&0;const R=A.C;R.flags.madeBreak=true;R.madeT=0;A.X.ST.madeBreakWant=1;A.X.setDoor('breach',1);A.X.ST.breachWant=1;A.presence.reset();A.presence.show(true);A.presence.showMass(true,{at:F.W(1,90,-2),r:12,squash:[1.4,1.1,.8],fog:.9});A.presence.lean(.55);A.X.ST.bowWant=[.45,.7,.85];
     F.put(F.W(21.6,72.6),-Math.PI/2);F.run(3.5);F.face(F.W(17.5,72,-1.6));F.run(.1);}],
   ['ledge',()=>{const F=__f;F.run(2);F.put(F.W(15.1,70),0);F.run(.6);F.face(F.W(2,84,-4));F.run(.1);}],
   ['shear',()=>{const F=__f,A=lastLight.chapter8;A.X.ST.shearWant=1;A.presence.lean(1.15);F.put(F.W(14.5,50.6),Math.PI);F.run(6);F.face(F.W(2,82,-6));F.run(.1);}]]},
 crew:{note:'the crew room: all four of them',setup:()=>{const L=lastLight,F=__f;L.jump('c8-reunion');F.run(4);},
  frames:[['room',()=>{const F=__f;F.put(F.W(.9,38.6),-Math.PI/2);F.run(.5);F.face(F.W(-3.6,40.4,-2.2));F.run(.1);}],
   ['jamie',()=>{const F=__f;F.put(F.W(-2.6,38.2),-Math.PI/2);F.run(.5);F.face(F.W(-4.3,38.4,-2.5));F.run(.1);}]]},
};
