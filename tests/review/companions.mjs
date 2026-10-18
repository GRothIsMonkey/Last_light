// Review frames: Jamie and Sam while you stand still for a minute inside the camp gate (a frame every eight seconds,
// looking at them), then a sudden sprint (looking back over your shoulder at them as they react), and a sudden stop.
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,S=L.chapter.companions.list.sam,W=(e,n)=>C5.W5(e,n);
 const lookAt=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const walkTo=(q,max=12,run=false)=>{for(let t=0;t<max;t+=1/30){const w=L.state.walk,dx=q.x-w.x,dz=q.z-w.z;if(Math.hypot(dx,dz)<.5)break;face(Math.atan2(dx,-dz),0);press('KeyW');if(run)press('ShiftLeft');step(1/30);}release('KeyW');release('ShiftLeft');};
 const mid=()=>({x:(J.px+S.px)/2,y:J.person.group.position.y+1.1,z:(J.pz+S.pz)/2});
 L.jump('c5-camp');step(.5);walkTo(W(-182,523),12);step(4);
 for(let i=0;i<8;i++){step(i?8:.2);lookAt(mid());await cap('c'+String(i+1).padStart(2,'0')+'-standing-still-'+(i*8)+'s');}
 // the sprint: away across the camp; a look back over the shoulder as they react
 const tgt=W(-206,545),back=()=>{const w=L.state.walk;return {x:w.x-(tgt.x-w.x),z:w.z-(tgt.z-w.z)};};
 const sprintFor=async(s,shots)=>{let t=0;for(const at of shots){for(;t<at;t+=1/30){const w=L.state.walk;face(Math.atan2(tgt.x-w.x,-(tgt.z-w.z)),0);press('KeyW');press('ShiftLeft');step(1/30);}
   const w=L.state.walk,b=back();lookAt({x:b.x,y:cam.position.y-.3,z:b.z});step(1/30);await cap('c-sprint-'+at.toFixed(1)+'s');}
  for(;t<s;t+=1/30){const w=L.state.walk;face(Math.atan2(tgt.x-w.x,-(tgt.z-w.z)),0);press('KeyW');press('ShiftLeft');step(1/30);}release('KeyW');release('ShiftLeft');};
 await sprintFor(5,[.3,1.2,2.5,4]);
 // the stop: standing, watching them come up and stop
 for(const at of [.4,1.2,2.5,5]){step(at===.4?.4:at-[.4,1.2,2.5,5][[.4,1.2,2.5,5].indexOf(at)-1]);lookAt(mid());await cap('c-stopped-'+at.toFixed(1)+'s');}
 return {jamie:C5.brain.state(J).goal,sam:C5.brain.state(S).goal};
}
