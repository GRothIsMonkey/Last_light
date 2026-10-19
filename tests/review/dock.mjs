// Review frames: the dock, all three sat on its edge, legs over the water (and looking down at your own).
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,Sm=L.chapter.companions.list.sam;
 // (the view turns on the next step: one step taken, then aimed again, so the frame shows where it was aimed)
 const aim=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));},lookAt=v=>{aim(v);step(1/30);aim(v);step(1/30);};
 const head=c=>({x:c.px,y:c.person.group.position.y+1.0,z:c.pz});
 L.jump('c5-dock-memory');step(1);lookAt(head(J));await cap('k01-jamie-and-sam-walk-out');
 L.chapter.act?.('c5-sit')??C5.act('c5-sit');for(let i=0;i<60&&!(J.seated&&Sm.seated);i++)step(.25);step(1.2);
 // (seated, the view is the seat's heading plus how far you have turned from where you sat down: aim relative to it)
 const P=()=>C5.C.pose,hdTo=v=>Math.atan2(v.x-cam.position.x,-(v.z-cam.position.z)),ptTo=v=>Math.atan2(v.y-cam.position.y,Math.hypot(v.x-cam.position.x,v.z-cam.position.z));
 const seatLook=(h,p)=>{for(let i=0;i<2;i++){face(P().from+(h-P().yaw),(P().fromPitch||0)+(p-P().pitch));step(1/30);}};
 seatLook(P().yaw,-.12);step(.1);await cap('k02-seated-looking-out');
 seatLook(hdTo(head(J)),ptTo(head(J)));await cap('k03-jamie-beside-you');seatLook(hdTo(head(Sm)),ptTo(head(Sm)));await cap('k04-sam-beside-you');
 seatLook(P().yaw,-1.05);await cap('k05-your-legs-over-the-water');
 for(let i=0;i<60&&!/Gary/.test(document.getElementById('subtitle')?.textContent||'');i++)step(.25);seatLook(hdTo(head(J)),ptTo(head(J)));await cap('k06-gary');
 return {seated:[J.seated,Sm.seated],w:C5.C.pose?.w};
}
