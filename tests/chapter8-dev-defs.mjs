// shot definitions for tests/chapter8-dev-shots.mjs: {name:{note, setup(), frames:[[frameName, fn()], ...]}}; functions run in the page
export default {
 presence:{note:'the Presence: mass behind the barrier and limbs in the main chamber',setup:()=>{const L=lastLight,A=L.chapter8,F=__f;L.jump('c8-breach');F.run(1);
   A.presence.reset();A.presence.show(true);A.presence.showMass(true,{at:F.W(1,88,-1),r:11,squash:[1.35,1.05,.75],fog:.9,fogDir:-1});A.presence.lean(.3);
   A.presence.set(0,{root:[F.W(-6,84.5,-6).x,-6,F.W(-6,84.5,-6).z],dir:[0,.4,-1],len:16,r0:1.9,r1:.3,state:'probe',probe:[F.W(-4,70,0).x,1,F.W(-4,70,0).z]});
   A.presence.set(1,{root:[F.W(9,84.5,-9).x,-9,F.W(9,84.5,-9).z],dir:[-.2,.6,-1],len:14,r0:1.6,r1:.26,state:'probe',probe:[F.W(6,72,0).x,0,F.W(6,72,0).z]});
   F.put(F.W(5,50.5),Math.PI);F.run(3);},
  frames:[['window',()=>{const F=__f;F.face(F.W(2,80,-3));F.run(.1);}],
   ['catwalk',()=>{const F=__f;F.put(F.W(-12.1,66),Math.PI);F.run(.3);F.face(F.W(-2,78,0));F.run(.1);}],
   ['close',()=>{const F=__f;F.put(F.W(-12.1,72),Math.PI);F.run(.3);F.face(F.W(-5,73,1.5));F.run(.1);}]]},
};
