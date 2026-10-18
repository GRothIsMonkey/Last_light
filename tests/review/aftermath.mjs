// Review frames: after the escape, under the lamp in the lot: the shaky laugh, the last picture on Alex's camera,
// Jamie's granola bar out of his own bag, the sock, “Tomorrow we tell somebody.”, one light across the water.
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,S=L.chapter.companions.list.sam;
 const sub=()=>document.getElementById('subtitle')?.textContent||'',until=(f,max=30,dt=.1)=>{for(let t=0;t<max&&!f();t+=dt)step(dt);};
 const lookAt=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const mid=()=>({x:(J.px+S.px)/2,y:J.person.group.position.y+1.1,z:(J.pz+S.pz)/2});
 L.jump('c5-aftermath');step(.6);for(let i=0;i<400&&!C5.C.flags.after;i++){const w=L.state.walk,r=C5.W5(-131,317);face(Math.atan2(r.x-w.x,-(r.z-w.z)),0);press('KeyW');step(1/30);}release('KeyW');
 step(1.5);lookAt(mid());await cap('a01-under-the-lamp');for(let i=0;i<6;i++){step(3);lookAt(mid());await cap('a0'+(i+2)+'-'+(sub().replace(/[^A-Za-z ]/g,'').trim().split(' ').slice(0,4).join('-').toLowerCase()||'quiet'));}
 until(()=>C5.C.flags.review,40);tap('KeyV');step(1);for(let i=0;i<12&&C5.photo?.V?.i!==C5.C.fireIdx;i++){tap('KeyD');step(.4);}step(1.5);await cap('a08-the-last-picture');
 until(()=>/starving/.test(sub()),60);tap('KeyV');step(.6);lookAt({x:J.px,y:J.person.group.position.y+1,z:J.pz});await cap('a09-im-starving');step(1.6);lookAt({x:J.px,y:J.person.group.position.y+1,z:J.pz});await cap('a10-into-his-bag');step(1.6);await cap('a11-a-granola-bar');
 until(()=>/good sock/.test(sub()),20);step(.3);lookAt(mid());await cap('a12-its-a-good-sock');until(()=>/tell somebody/.test(sub()),20);step(.4);await cap('a13-tomorrow-we-tell-somebody');
 return {found:C5.C.flags.found};
}
