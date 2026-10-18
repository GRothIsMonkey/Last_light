// Review frames: the dock, all three sat on its edge, legs over the water (and looking down at your own).
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,Sm=L.chapter.companions.list.sam;
 const lookAt=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const head=c=>({x:c.px,y:c.person.group.position.y+1.0,z:c.pz});
 L.jump('c5-dock-memory');step(1);lookAt(head(J));await cap('k01-jamie-and-sam-walk-out');
 L.chapter.act?.('c5-sit')??C5.act('c5-sit');for(let i=0;i<60&&!(J.seated&&Sm.seated);i++)step(.25);step(1.2);
 face(C5.C.pose.yaw,-.12);step(.1);await cap('k02-seated-looking-out');
 const y0=C5.C.pose.yaw;C5.C.pose.yaw=y0-.9;step(.1);await cap('k03-jamie-beside-you');C5.C.pose.yaw=y0+.9;step(.1);await cap('k04-sam-beside-you');
 C5.C.pose.yaw=y0;C5.C.pose.pitch=-1.1;step(.1);await cap('k05-your-legs-over-the-water');C5.C.pose.pitch=-.12;
 for(let i=0;i<60&&!/Gary/.test(document.getElementById('subtitle')?.textContent||'');i++)step(.25);C5.C.pose.yaw=y0-.6;step(.1);await cap('k06-gary');
 return {seated:[J.seated,Sm.seated],w:C5.C.pose?.w};
}
