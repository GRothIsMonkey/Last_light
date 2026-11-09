// shot definitions for tests/chapter8-dev-shots.mjs (DEFS=tests/chapter8-street-defs.mjs): the surface, Oak Hollow falling,
// the things in the street, the Hendersons', Jamie. Functions run in the page; __f is the harness's helper set.
const LOC=()=>{const A=lastLight.chapter8,p=lastLight.camera.position,L=A.ruin.locate(p.x,p.z);return {d:+L.d.toFixed(1),lat:+L.lat.toFixed(1)};};
const DEFS8={
 probe:{note:'the street module: places, walkability of the way round, creatures',setup:()=>{const L=lastLight,F=__f;L.jump('c8-hendersons');F.run(1.5);},
  frames:[['hend',()=>{const L=lastLight,A=L.chapter8,ST=A.SC.STREET,HD=ST.HD,loc=(q)=>{const l=A.ruin.locate(q.x,q.z);return [+l.d.toFixed(1),+l.lat.toFixed(1)];};
    const out={phase:A.state.phase,marks:A.C.marks.slice(-8).map(m=>m[1]),HD:Object.fromEntries(Object.entries(HD).filter(([k,v])=>v&&typeof v==='object').map(([k,v])=>{const l=loc(v),Y=ST.town.YARD;return [k,[...l,L.nav.walkable(v.x,v.z,{r:.3})?'w':'-',+Y.hole(l[0],l[1]).toFixed(2)]];})),gs:HD.gs,ow:HD.ow,gf:HD.gf};
    // walk the way round: from the street north of the yard to Jamie's place
    const P=(d,lat)=>__f.main(d,lat),pts=[[1036,3],[1038,6],[1039,9],[1039.5,12],[1039.5,15],[1037,16.5],[1034,17]];out.walk=pts.map(([d,lat])=>{const q=P(d,lat);return [d,lat,L.nav.walkable(q.x,q.z,{r:.3})];});
    out.bodyWalk=L.nav.walkable(HD.body.x,HD.body.z,{r:.3});out.sideWalk=L.nav.walkable(HD.side.x,HD.side.z,{r:.3});
    const F2=__f;F2.put(F2.main(1040,2),F2.heading(1030)+Math.PI);F2.run(.3);F2.face({x:HD.body.x,y:HD.body.y+1,z:HD.body.z});F2.run(.1);out.you=(()=>{const p=L.camera.position,l=A.ruin.locate(p.x,p.z);return [+l.d.toFixed(1),+l.lat.toFixed(1)];})();
    return out;}]]},
 surface:{note:'up out of MH-12: the sky, the thing on the skyline, the drive',setup:()=>{const L=lastLight,F=__f;L.jump('c8-surface');F.run(3);},
  frames:[['sky',()=>{const F=__f,L=lastLight,A=L.chapter8;F.run(4);const ST=A.SC.STREET;F.face({x:L.camera.position.x+(ST.SKY.mass?.position?.x??0)*0,y:L.camera.position.y+8,z:L.camera.position.z});
     const b=F.main(1262,46);F.face({x:b.x,y:L.camera.position.y+14,z:b.z});F.run(.1);return {apoc:+A.C.apoc.toFixed(2),caption:L.state.caption.slice(0,80)};}],
   ['drive',()=>{const F=__f,L=lastLight;const q=F.main(1100,0);F.face({x:q.x,y:L.camera.position.y+1.5,z:q.z});F.run(.1);}],
   ['impacts',()=>{const F=__f,L=lastLight,A=L.chapter8;F.put(F.main(1142,2),F.heading(1140)+Math.PI);F.run(9);const q=F.main(1112,-6);F.face({x:q.x,y:L.camera.position.y+.5,z:q.z});F.run(.1);return {events:A.SC.STREET.town.log?.events};}],
   ['made',()=>{const F=__f,L=lastLight,A=L.chapter8;F.run(14);const c=A.SC.STREET.CR.a.M;F.face({x:c.x,y:(c.y||0)+1.4,z:c.z});F.run(.1);return {mode:A.SC.STREET.CR.a.mode,offers:[...A.C.offers.keys()]};}]]},
 trench:{note:'the road goes into the storm line; the hunter out of it',setup:()=>{const L=lastLight,F=__f;L.jump('c8-trench');F.run(2);F.put(F.main(1106,3.5),F.heading(1100)+Math.PI);F.run(1);},
  frames:[['go',()=>{const F=__f,L=lastLight,A=L.chapter8;F.put(F.main(1101,3.5),F.heading(1100)+Math.PI);F.run(7);const q=F.main(1072,-2);F.face({x:q.x,y:L.camera.position.y-1,z:q.z});F.run(.1);}],
   ['hunter',()=>{const F=__f,L=lastLight,A=L.chapter8;F.run(9);const c=A.SC.STREET.CR.h2.M;F.face({x:c.x,y:(c.y||0)+1,z:c.z});F.run(.1);return {mode:A.SC.STREET.CR.h2.mode,x:c.x};}],
   ['lean',()=>{const F=__f,L=lastLight,A=L.chapter8;F.put(F.main(1066,6),F.heading(1060)+Math.PI);F.run(8);const q=F.main(1052,-16);F.face({x:q.x,y:L.camera.position.y+2,z:q.z});F.run(.1);}]]},
 limb:{note:'Mrs. Pruitt; the limb comes down on the house across from the Hendersons',setup:()=>{const L=lastLight,F=__f;L.jump('c8-street');F.run(2);},
  frames:[['pruitt',()=>{const F=__f,L=lastLight,A=L.chapter8;F.run(4);const q=F.main(1056.3,12.4);F.face({x:q.x,y:L.camera.position.y-.6,z:q.z});F.run(.1);return {offers:[...A.C.offers.keys()]};}],
   ['limb',()=>{const F=__f,L=lastLight,A=L.chapter8;F.play(()=>A.C.flags.pruitt,30);F.put(F.main(1045,4),F.heading(1040)+Math.PI);F.run(5);const q=F.main(1030,-10);F.face({x:q.x,y:L.camera.position.y+12,z:q.z});F.run(.1);}],
   ['hit',()=>{const F=__f,L=lastLight,A=L.chapter8;F.run(5);const q=F.main(1026,-14);F.face({x:q.x,y:L.camera.position.y+1,z:q.z});F.run(.1);return {across:A.SC.STREET.town.EV.across.t};}]]},
};
// (more: the Hendersons' side yard and Jamie; the grief after; the sky from several streets)
Object.assign(DEFS8,{
 hend:{note:'the side yard: Jamie holding the header; it comes up; it takes him; he is down',setup:()=>{const L=lastLight,F=__f;L.jump('c8-yard');F.run(2);const HD=L.chapter8.SC.STREET.HD;F.put(F.main(1012,10.5),0);F.run(.5);},
  frames:[['door',()=>{const F=__f,L=lastLight,A=L.chapter8,HD=A.SC.STREET.HD;F.run(9);F.face({x:HD.sideDoor.x,y:HD.sideDoor.y+1.3,z:HD.sideDoor.z});F.run(.1);return {cap:L.state.caption.slice(0,80)};}],
   ['hunter',()=>{const F=__f,L=lastLight,A=L.chapter8;F.run(5);F.face({x:A.HM.x,y:(A.HM.y||0)+1.2,z:A.HM.z});F.run(.1);return {mode:A.H.mode,vis:A.HM.root.visible};}],
   ['drag',()=>{const F=__f,L=lastLight,A=L.chapter8;for(let i=0;i<300&&A.C.jamieHeld==null;i++)F.run(.1);F.run(.9);F.face({x:A.HM.x,y:(A.HM.y||0)+1,z:A.HM.z});F.run(.1);return {held:A.C.jamieHeld};}],
   ['down',()=>{const F=__f,L=lastLight,A=L.chapter8,HD=A.SC.STREET.HD;for(let i=0;i<200&&!(A.C.jamieThrown>=1);i++)F.run(.1);F.run(2.5);F.face({x:HD.body.x,y:HD.body.y+.2,z:HD.body.z});F.run(.1);return {cap:L.state.caption.slice(0,80)};}]]},
 death:{note:'after: Reyes working on him; Sam on his knees; Alex; you holding his hand; the faces',setup:()=>{const L=lastLight,F=__f;L.jump('c8-jamie-death');F.run(2);},
  frames:[['reyes',()=>{const F=__f,L=lastLight,A=L.chapter8,HD=A.SC.STREET.HD;F.put({x:HD.body.x+1.6,z:HD.body.z-2.6},0);F.run(6);F.face({x:HD.body.x,y:HD.body.y+.4,z:HD.body.z});F.run(.1);return {cap:L.state.caption.slice(0,80)};}],
   ['sam',()=>{const F=__f,L=lastLight,A=L.chapter8,HD=A.SC.STREET.HD,s=A.CTX.sam;F.run(16);const g=s.person.group,h=s.person.joints?.head?g.localToWorld(s.person.joints.head.clone()):{x:s.px,y:HD.body.y+1,z:s.pz};
     F.put({x:h.x+Math.sin(s.pa)*1.1,z:h.z-Math.cos(s.pa)*1.1},0);F.run(.3);F.face({x:h.x,y:h.y+.02,z:h.z});F.run(.05);return {expr:s.person.face?.state?.()||null,sob:s.person.face?.sobbing,cry:s.person.face?.crying};}],
   ['alex',()=>{const F=__f,L=lastLight,A=L.chapter8,a=A.CTX.alex;F.run(10);const g=a.person.group,h=a.person.joints?.head?g.localToWorld(a.person.joints.head.clone()):{x:a.px,y:2,z:a.pz};
     F.put({x:h.x+Math.sin(a.pa)*1.1,z:h.z-Math.cos(a.pa)*1.1},0);F.run(.3);F.face({x:h.x,y:h.y,z:h.z});F.run(.05);return {sob:a.person.face?.sobbing,cry:a.person.face?.crying};}],
   ['covered',()=>{const F=__f,L=lastLight,A=L.chapter8,HD=A.SC.STREET.HD;F.play(()=>A.C.flags.covered,200);F.run(3);F.put({x:HD.body.x+2.2,z:HD.body.z-2.4},0);F.run(.3);F.face({x:HD.body.x,y:HD.body.y+.3,z:HD.body.z});F.run(.1);return {cap:L.state.caption.slice(0,80)};}]]},
 sky:{note:'the red sky and the thing on the skyline, from several streets',setup:()=>{const L=lastLight,F=__f;L.jump('c8-flee');F.run(4);},
  frames:[['cul',()=>{const F=__f,L=lastLight;F.put(F.main(1150,0),0);F.run(.4);const b=F.main(1262,46);F.face({x:b.x,y:L.camera.position.y+22,z:b.z});F.run(.1);}],
   ['hend',()=>{const F=__f,L=lastLight;F.put(F.main(1030,-2),0);F.run(.4);const b=F.main(1262,46);F.face({x:b.x,y:L.camera.position.y+30,z:b.z});F.run(.1);}],
   ['sams',()=>{const F=__f,L=lastLight;F.put(F.main(990,0),0);F.run(.4);const b=F.main(1262,46);F.face({x:b.x,y:L.camera.position.y+30,z:b.z});F.run(.1);}],
   ['south',()=>{const F=__f,L=lastLight;F.put(F.main(930,0),0);F.run(.4);const b=F.main(900,0);F.face({x:b.x,y:L.camera.position.y+4,z:b.z});F.run(.1);}]]},
});
export default DEFS8;
