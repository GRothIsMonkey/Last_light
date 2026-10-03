// Render the complete morning-oak → Briarwood approach in stages. One initial checkpoint only;
// every metre afterward is travelled using the existing input-driven steering helper.
export async function runMemoryUsability({page,snap,check}){
 const ev=(fn,arg)=>page.evaluate(fn,arg);
 await ev(()=>{const L=lastLight;L.jump('morning-oak');const entry=L.nav.main(1132,-1);L.drive([[entry.x,entry.z]],{r:1});for(let t=0;t<15&&L.driving;t+=1/30)L.step(1/30);L.stopDriving();L.press('KeyS');L.step(2);L.release('KeyS');for(let t=0;t<90&&L.state.chapter.phase!=='m-briarwood';t+=.1)L.step(.1);L.step(2);});
 check('morning usability: oak conversation gives the destination and memory context',await ev(()=>lastLight.state.objective==='Go back to where Alex turned.'&&document.getElementById('objective-note').textContent==='Briarwood. Where he left us last night.'));
 await snap('usability-01-oak-objective');
 let from=1131;
 for(const [index,d] of [1060,960,860,760,660,596].entries()){
  const result=await ev(([from,d,first])=>{const L=lastLight,pts=[];if(first){const p=L.nav.main(1131,3);pts.push([p.x,p.z]);}for(let x=from-10;x>d;x-=10){const p=L.nav.main(x,2.2);pts.push([p.x,p.z]);}const p=L.nav.main(d,d===596?2.4:2.2);pts.push([p.x,p.z]);L.drive(pts,{r:2.6});let reached=false;for(let t=0;t<65;t+=1/30){L.step(1/30);if(!L.driving){reached=true;break;}}L.stopDriving();L.press('KeyS');L.step(2);L.release('KeyS');return reached;},[from,d,index===0]);
  check('morning usability: input-driven route segment '+(index+1),result);from=d;
  await snap('usability-0'+(index+2)+'-briarwood-approach');
 }
 await ev(()=>{const L=lastLight,q=L.chapter2.corner.look;L.face(Math.atan2(q.x-L.roam.x,-(q.z-L.roam.z)));L.step(3);});
 check('morning usability: arrival changes objective and presents Remember from the saddle',await ev(()=>lastLight.state.objective==='Remember Alex leaving.'&&lastLight.state.prompt==='F:Remember'&&lastLight.state.state==='c1-ride'));
 await snap('usability-08-briarwood-sign-and-prompt');
 await ev(()=>{lastLight.key('KeyF');lastLight.step(6);});
 check('morning usability: pressing the displayed interaction starts the reconstruction',await ev(()=>lastLight.state.state==='memory'));
 await snap('usability-09-memory-entry');
}
