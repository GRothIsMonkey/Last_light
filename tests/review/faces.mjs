// Review frames: faces while they talk, at player height, the view narrowed (a closer look, as a player leaning in):
// Gary at the dock (laughing), the fire (Jamie's mother), Owl's porch (“That's me.”), the lot afterward (relief).
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,S=L.chapter.companions.list.sam,act=id=>(L.chapter.act?L.chapter.act(id):C5.act(id));
 const sub=()=>document.getElementById('subtitle')?.textContent||'',until=(f,max=30,dt=.1)=>{for(let t=0;t<max&&!f();t+=dt)step(dt);};
 const zoom=on=>{cam.fov=on?24:cam.userData.fov0||(cam.userData.fov0=cam.fov);if(!on)cam.fov=cam.userData.fov0;cam.updateProjectionMatrix();};cam.userData.fov0=cam.fov;
 const headOf=c=>{const v=new (cam.position.constructor)();c.person.parts.head.getWorldPosition(v);return v;};
 const aim=c=>{const h=headOf(c),p=cam.position;if(C5.C.pose){C5.C.pose.yaw=Math.atan2(h.x-p.x,-(h.z-p.z));C5.C.pose.pitch=Math.atan2(h.y-p.y,Math.hypot(h.x-p.x,h.z-p.z));}else{const w=L.state.walk;face(Math.atan2(h.x-w.x,-(h.z-w.z)),Math.atan2(h.y-p.y,Math.hypot(h.x-p.x,h.z-p.z)));}};
 const shot=async(name,c)=>{aim(c);step(1/30);aim(c);zoom(true);await cap(name);zoom(false);};
 // the dock: Gary
 L.jump('c5-dock-memory');step(.6);act('c5-sit');until(()=>J.seated&&S.seated,20);until(()=>/Gary/.test(sub()),30);step(.4);await shot('f01-sam-gary',S);until(()=>/I caught Gary/.test(sub()),12);step(.8);await shot('f02-jamie-laughing',J);until(()=>/trophies/.test(sub()),12);step(.5);await shot('f03-sam-happy',S);
 until(()=>/four times/.test(sub()),15);step(.6);await shot('f04-jamie-quieter',J);
 // the fire
 L.jump('c5-campfire');step(.5);act('c5-fire');until(()=>/My mom/.test(sub()),40);step(1);await shot('f05-jamie-sad',J);until(()=>/what if it’s/.test(sub()),30);step(.8);await shot('f06-jamie-worried',J);until(()=>/We’ll find him/.test(sub()),20);step(1.6);await shot('f07-sam-determined',S);
 // Owl's porch
 L.jump('c5-window');step(.6);const D=C5.DOUBLE();until(()=>C5.C.win?.stage==='turn',45);until(()=>/That’s me/.test(sub()),12);step(.4);await shot('f08-jamie-terrified',J);until(()=>/Look at me/.test(sub()),8);step(.4);await shot('f09-sam-afraid',S);
 // the lot, after
 L.jump('c5-aftermath');step(.6);for(let i=0;i<300&&!C5.C.flags.after;i++){const w=L.state.walk,r=C5.W5(-131,317);face(Math.atan2(r.x-w.x,-(r.z-w.z)),0);press('KeyW');step(1/30);}release('KeyW');
 for(let i=0;i<5;i++){step(2.2);await shot('f1'+i+'-after-'+(i%2?'sam':'jamie'),i%2?S:J);}
 return {said:sub()};
}
