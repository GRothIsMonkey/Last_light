// shot definitions for tests/chapter8-dev-shots.mjs (DEFS=tests/chapter8-finale-defs.mjs): the hatch and Alex, the oak, the street
// at sunrise, the last ride; and the faces (Sam, Alex) up close. Functions run in the page; __f is the harness's helper set.
const DEFS8={
 hatch:{note:'the top of the well: Alex on the ladder with the chain; the lid comes down on him; lifting it; out on the grass',setup:()=>{const L=lastLight,F=__f;L.jump('c8-hatch');F.run(2.5);},
  frames:[['well',()=>{const F=__f,L=lastLight,A=L.chapter8,FN=A.SC.FIN,H=FN.HAT;const g=FN.hatch;const p=new (g.position.constructor)(0,0,-1.25);g.localToWorld(p);F.put(p,0);F.run(.3);
     const c=new (g.position.constructor)(0,-2.6,-.25);g.localToWorld(c);F.face(c);F.run(.1);return {mode:FN.F8.mode,y:FN.F8.y};}],
   ['pinned',()=>{const F=__f,L=lastLight,A=L.chapter8,FN=A.SC.FIN,g=FN.hatch;for(let i=0;i<500&&FN.F8.mode!=='pinned';i++)F.run(.1);F.run(2);
     const p=new (g.position.constructor)(-1.2,0,-1.7);g.localToWorld(p);F.put(p,0);F.run(.2);const c=new (g.position.constructor)(0,.15,-.6);g.localToWorld(c);F.face(c);F.run(.1);return {mode:FN.F8.mode,lid:FN.F8.lid};}],
   ['out',()=>{const F=__f,L=lastLight,A=L.chapter8,FN=A.SC.FIN,g=FN.hatch;F.play(()=>A.C.flags['pull-alex'],90);F.run(6);
     const p=new (g.position.constructor)(.9,0,-2.6);g.localToWorld(p);F.put(p,0);F.run(.2);const c=new (g.position.constructor)(0,.2,-1.45);g.localToWorld(c);F.face(c);F.run(.1);return {mode:FN.F8.mode};}]]},
 oak:{note:'the oak: Alex against the trunk, Sam holding his hand; Alex up close; you sitting with him; after',setup:()=>{const L=lastLight,F=__f;L.jump('c8-oak');F.run(4);},
  frames:[['two',()=>{const F=__f,L=lastLight,A=L.chapter8,O=A.SC.FIN.OAK;F.run(2);F.put({x:O.x-2.2,z:O.z+2.4},0);F.run(.3);F.face({x:O.x+.3,y:O.y+.55,z:O.z});F.run(.1);}],
   ['alex',()=>{const F=__f,L=lastLight,A=L.chapter8,a=A.CTX.alex,g=a.person.group,h=a.person.joints?.head?g.localToWorld(a.person.joints.head.clone()):{x:g.position.x,y:g.position.y+.7,z:g.position.z};
     F.put({x:h.x+Math.sin(a.pa)*.9,z:h.z-Math.cos(a.pa)*.9},0);F.run(.2);F.face({x:h.x,y:h.y,z:h.z});F.run(.05);return {expr:a.person.face?.state?.()??null};}],
   ['sit',()=>{const F=__f,L=lastLight,A=L.chapter8,O=A.SC.FIN.OAK;F.put({x:O.x-1.6,z:O.z+1.5},0);F.run(.3);F.play(()=>!!A.C.pose,30);F.run(26);return {pose:!!A.C.pose,cap:L.state.caption.slice(0,80)};}],
   ['sam',()=>{const F=__f,L=lastLight,A=L.chapter8,s=A.CTX.sam;F.play(()=>A.C.flags.alexHand,120);F.run(30);A.CTX.k.setPose(null);A.CTX.o.roam.walkLock=false;const g=s.person.group,h=s.person.joints?.head?g.localToWorld(s.person.joints.head.clone()):{x:g.position.x,y:g.position.y+.7,z:g.position.z};
     F.put({x:h.x+Math.sin(s.pa)*.85,z:h.z-Math.cos(s.pa)*.85},0);F.run(.05);F.face({x:h.x,y:h.y,z:h.z});F.run(.02);return {sob:s.person.face?.sobbing,cry:s.person.face?.crying,cap:L.state.caption.slice(0,80)};}],
   ['after',()=>{const F=__f,L=lastLight,A=L.chapter8,O=A.SC.FIN.OAK;F.play(()=>A.SC.FIN.F8.alexDead,200);F.run(14);A.CTX.k.setPose(null);A.CTX.o.roam.walkLock=false;F.put({x:O.x-1.9,z:O.z+1.9},0);F.run(.05);F.face({x:O.x+.3,y:O.y+.55,z:O.z});F.run(.02);return {dead:A.SC.FIN.F8.alexDead,cap:L.state.caption.slice(0,80)};}]]},
 walk:{note:'the street at sunrise, on foot: the trench, the house that fell, the Kesslers, the Hendersons',setup:()=>{const L=lastLight,F=__f;L.jump('c8-walk');F.run(3);},
  frames:[['trench',()=>{const F=__f,L=lastLight;F.put(F.main(1098,8),0);F.run(.4);const q=F.main(1070,-3);F.face({x:q.x,y:L.camera.position.y-1.2,z:q.z});F.run(.1);}],
   ['lean',()=>{const F=__f,L=lastLight;F.put(F.main(1060,8.5),0);F.run(.3);const q=F.main(1052,-15);F.face({x:q.x,y:L.camera.position.y+1.5,z:q.z});F.run(.1);}],
   ['kesslers',()=>{const F=__f,L=lastLight;F.put(F.main(1036,2),0);F.run(.3);const q=F.main(1026,-15);F.face({x:q.x,y:L.camera.position.y+1,z:q.z});F.run(.1);}],
   ['yard',()=>{const F=__f,L=lastLight;F.put(F.main(1032,3),0);F.run(.3);const q=F.main(1024,12);F.face({x:q.x,y:L.camera.position.y-1,z:q.z});F.run(.1);}]]},
 ride:{note:'the last ride: Sam on his bike beside you; the street; Summerfield; the look back',setup:()=>{const L=lastLight,F=__f;L.jump('c8-ride');F.run(3);},
  frames:[['sam',()=>{const F=__f,L=lastLight,A=L.chapter8,s=A.CTX.sam;F.run(3);const g=s.person.group,h=s.person.joints?.head?g.localToWorld(s.person.joints.head.clone()):{x:s.px,y:1.6,z:s.pz};F.face({x:h.x,y:h.y,z:h.z});F.run(.05);return {sob:s.person.face?.sobbing,cry:s.person.face?.crying,grief:A.C.grief};}],
   ['summerfield',()=>{const F=__f,L=lastLight,A=L.chapter8;F.put(F.main(896,2),0);F.run(.4);const q=F.main(872,0);F.face({x:q.x,y:L.camera.position.y-.6,z:q.z});F.run(.1);}],
   ['back',()=>{const F=__f,L=lastLight;F.put(F.main(990,0),0);F.run(.4);const q=F.main(1100,0);F.face({x:q.x,y:L.camera.position.y+2,z:q.z});F.run(.1);}]]},
};
export default DEFS8;
