// Review frames: the pebble beach (Jamie's stone picked up and thrown, yours picked up, wound up and let go, the skips),
// the shallows waded, and the three of you sat on the dock.
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,PK=C5.PK,S=PK.S,cam=L.camera,J=L.chapter.companions.list.jamie,Sm=L.chapter.companions.list.sam;
 // (the view turns on the next step: one step taken, then aimed again, so the frame shows where it was aimed)
 const aim=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));},lookAt=v=>{aim(v);step(1/30);aim(v);step(1/30);};
 const walkTo=(q,max=12)=>{for(let t=0;t<max;t+=1/30){const w=L.state.walk,dx=q.x-w.x,dz=q.z-w.z;if(Math.hypot(dx,dz)<.35)break;face(Math.atan2(dx,-dz),0);press('KeyW');step(1/30);}release('KeyW');};
 const head=c=>({x:c.px,y:c.person.group.position.y+1.2,z:c.pz}),hand=c=>{const v=c.person.parts.rhand.getWorldPosition(new (cam.position.constructor)());return v;};
 const B=C5.W5(-178,338),AIM=C5.W5(-178-7.2,338+14.2);
 L.jump('c5-stones');step(.5);walkTo({x:B.x+.3,z:B.z-.9});
 for(let i=0;i<80&&!C5.C.st;i++)step(.25);
 // Jamie: to his stone, bends, picks it up
 for(let i=0;i<120&&!(J.script&&S.stones.some(P=>P.holder===J.person));i++){step(.1);lookAt(head(J));if(J.person.sitW==null&&J.script?.[J.step]&&!globalThis.__jb&&S.stones.some(P=>P.claimed==='jamie')){const P=S.stones.find(P=>P.claimed==='jamie');if(Math.hypot(J.px-P.obj.position.x,J.pz-P.obj.position.z)<.7){globalThis.__jb=1;lookAt(P.obj.position);await cap('s01-jamie-bends-for-a-stone');}}}
 lookAt(hand(J));await cap('s02-jamie-has-it');
 for(let i=0;i<120&&!S.flying.length;i++){step(1/30);if(i%6===0)lookAt(head(J));}
 await cap('s03-jamie-lets-go');step(.25);lookAt(S.flying[0]?.m.position||AIM);await cap('s04-jamie-stone-in-the-air');
 for(let i=0;i<60&&S.flying.length;i++){step(.1);if(S.flying[0]?.skips===1&&!globalThis.__r1){globalThis.__r1=1;lookAt(S.flying[0].m.position);await cap('s05-first-skip-ring');}}
 // your turn: a stone at your feet
 for(let i=0;i<120&&C5.C.st.turn!=='you';i++)step(.25);step(.5);
 const P=PK.nearestStone(L.state.walk.x,L.state.walk.z);walkTo({x:P.obj.position.x+.25,z:P.obj.position.z-.45});lookAt(P.obj.position);step(.1);await cap('s06-a-flat-stone-at-your-feet');
 tap('KeyF');step(.4);await cap('s07-your-hand-reaching');step(.4);await cap('s08-stone-in-hand');step(.5);
 lookAt({x:AIM.x,y:cam.position.y-1.2,z:AIM.z});step(.1);press('KeyC');step(.5);press('KeyF');step(.45);await cap('s09-winding-up-crouched');step(.4);await cap('s10-wound-back');
 release('KeyF');step(4/30);await cap('s11-let-go');step(.2);await cap('s12-your-stone-flying');
 for(let i=0;i<60&&S.flying.length;i++){step(.1);if(S.flying[0]?.skips===2&&!globalThis.__r2){globalThis.__r2=1;await cap('s13-skipping');}}release('KeyC');
 // the rest of the game played out (your turns thrown the same way); Sam's last, crouched
 const throwYours=async()=>{const P=PK.nearestStone(L.state.walk.x,L.state.walk.z);if(!P)return;walkTo({x:P.obj.position.x+.25,z:P.obj.position.z-.45});lookAt(P.obj.position);step(.1);tap('KeyF');step(1.3);
  lookAt({x:AIM.x,y:cam.position.y-1.2,z:AIM.z});press('KeyC');step(.5);press('KeyF');step(.85);release('KeyF');step(.4);release('KeyC');for(let i=0;i<60&&S.flying.length;i++)step(.1);};
 for(let i=0;i<900&&!C5.C.st.done;i++){step(.1);const s=C5.C.st;if(s.turn==='you'&&!s.busy&&!S.flying.length&&!PK.holding&&!L.chapter.kit?.busy?.())await throwYours();
  if(s.round>=2&&s.turn==='sam'&&S.stones.some(P=>P.holder===Sm.person)&&!globalThis.__sl){const st=C5.W5(-178+1.5,338);if(Math.hypot(Sm.px-st.x,Sm.pz-st.z)<.5){globalThis.__sl=1;lookAt(head(Sm));step(.3);lookAt(head(Sm));await cap('s14-sam-gets-down-low');step(.3);await cap('s14b-sam-throws');}}}
 // the shallows
 const Wd=C5.W5(-178-1.2,338+1.6);walkTo(Wd,8);lookAt({x:Wd.x,y:cam.position.y-1.4,z:Wd.z-.6});step(.4);await cap('s15-wading-the-shallows');
 return {you:S.you,jamie:S.jamie,sam:S.sam,log:S.log};
}
