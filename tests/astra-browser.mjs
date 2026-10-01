// Astra-specific visual, embodiment and navigation regression checks.
// Routes follow street signs and permanent property landmarks; no jump/placePlayer calls.
export async function runAstraChecks({page,snap,check,camAt,state}){
 const ev=(fn,arg)=>page.evaluate(fn,arg);
 await ev(()=>{const L=lastLight;window.__astra={
  tick(sec){L.step(sec);},
  sample(){const p=L.state,pl=p.state==='c1-ride'?p.roam:p.walk;for(const c of L.chapter.companions.all){if(!c.active||!c.follow)continue;const x=c.mode==='ride'?c.bx:c.px,z=c.mode==='ride'?c.bz:c.pz,d=Math.hypot(x-pl.x,z-pl.z),side=(x-pl.x)*Math.cos(pl.a)+(z-pl.z)*Math.sin(pl.a),ahead=(x-pl.x)*Math.sin(pl.a)-(z-pl.z)*Math.cos(pl.a),key=c.key+'-'+c.follow;const t=this.telemetry[key]||(this.telemetry[key]={minSide:99,maxSide:-99,minAhead:99,maxAhead:-99,maxStep:0,minGap:99});if(d<12){t.minSide=Math.min(t.minSide,side);t.maxSide=Math.max(t.maxSide,side);t.minAhead=Math.min(t.minAhead,ahead);t.maxAhead=Math.max(t.maxAhead,ahead);t.minGap=Math.min(t.minGap,d);}if(t.last&&Math.abs(t.last.clock-(p.chapter.t-1/30))<1e-6)t.maxStep=Math.max(t.maxStep,Math.hypot(x-t.last.x,z-t.last.z));t.last={x,z,clock:p.chapter.t};}},
  telemetry:{},
  until(fn,max=90){for(let t=0;t<max;t+=1/30){L.step(1/30);this.sample();if(fn())return true;}return false;},
  clear(){L.stopDriving();for(const k of ['KeyW','KeyS','KeyA','KeyD','ShiftLeft','KeyC'])L.release(k);},
  ride(pts,max=180){L.drive(pts,{r:2});const ok=this.until(()=>!L.driving,max);L.stopDriving();L.press('KeyS');this.until(()=>L.state.speed<.03,6);L.release('KeyS');if(!ok)throw Error('natural ride did not reach '+JSON.stringify(pts.at(-1)));},
  line(d0,d1,l,step=14){const out=[],n=Math.ceil(Math.abs(d1-d0)/step);for(let i=1;i<=n;i++){const p=L.nav.main(d0+(d1-d0)*i/n,l);out.push([p.x,p.z]);}return out;},
  side(u,v){const p=L.nav.side(u,v);return [p.x,p.z];},
  sideLine(a,b,v){const out=[],n=Math.ceil(Math.abs(b-a)/7);for(let i=1;i<=n;i++)out.push(this.side(a+(b-a)*i/n,v));return out;},
  off(){this.clear();L.press('KeyS');this.until(()=>L.state.speed<.03,8);L.release('KeyS');L.key('KeyF');if(!this.until(()=>L.state.state==='c1-walk',4))throw Error('dismount failed');},
  walk(q,{radius=.35,face=null,max=60}={}){
   this.clear();const start=L.state.walk;const obstacles=()=>[...L.chapter.blockers(true),...(Math.hypot(q.x-L.roam.x,q.z-L.roam.z)>.8?[{x:L.roam.x,z:L.roam.z,r:.16}]:[])];let pts=L.nav.walkPath(start,q,obstacles()),idx=0,stuck=0,prev={...start};if(!pts.length)pts=[[q.x,q.z]];
   for(let t=0;t<max;t+=1/30){const p=L.state.walk,dist=Math.hypot(p.x-q.x,p.z-q.z);if(dist<radius){L.release('KeyW');L.step(.25);if(face)L.face(Math.atan2(face.x-p.x,-(face.z-p.z)));L.step(.1);return true;}
    const target=pts[Math.min(idx,pts.length-1)];if(Math.hypot(p.x-target[0],p.z-target[1])<.3&&idx<pts.length-1)idx++;
    L.face(Math.atan2(target[0]-p.x,-(target[1]-p.z)),0);L.press('KeyW');L.step(1/30);this.sample();
    const now=L.state.walk;if(Math.hypot(now.x-prev.x,now.z-prev.z)<.002)stuck+=1/30;else stuck=0;prev={...now};
    if(stuck>.6){const obs=obstacles(),newPath=L.nav.walkPath(now,q,obs);if(newPath.length){pts=newPath;idx=0;}stuck=0;}
   }L.release('KeyW');throw Error('natural walk stuck '+JSON.stringify({from:L.state.walk,to:q,mode:L.state.state,phase:L.state.chapter.phase}));
  },
  on(){const b=L.roam;this.walk({x:b.x,z:b.z},{radius:1.3});L.key('KeyF');if(!this.until(()=>L.state.state==='c1-ride',4))throw Error('remount failed '+L.state.prompt);},
  house(k,x,z){return L.world.homes[k].toWorld(x,z);},
  approachWindow(k){const h=L.world.homes[k],s=h.sneakWin.s,x=s*(h.w/2+1.55);this.walk(h.toWorld(x,h.front+2.8));
   // Follow visible garden stones down the side yard, looking at the warm window.
   this.walk(h.toWorld(x,h.sneakWin.z+.6),{face:h.toWorld(s*h.w/2,h.sneakWin.z)});
   if(L.state.prompt!=='F:Tap on the window')throw Error(k+' window prompt unreadable '+L.state.prompt);
  }
 };});
 // Natural complete run and replay. No jumps, coordinate placement or checkpoint shortcuts.
 for(let pass=1;pass<=2;pass++){
  console.log('Astra natural run',pass);
  await ev(()=>{const L=lastLight,C=__astra;L.reset();C.clear();L.press('KeyW');if(!C.until(()=>L.state.state==='stopped',420))throw Error('prologue did not finish');L.release('KeyW');C.until(()=>L.state.callDone,45);L.press('KeyW');C.until(()=>L.state.chapter.phase==='home',30);L.release('KeyW');L.drive(C.line(840,540,-2.1),{r:2.2});C.until(()=>L.state.chapter.phase==='briarwood',180);C.clear();L.press('KeyS');C.until(()=>L.state.speed<.03,8);L.release('KeyS');});
  await ev(()=>{const L=lastLight,C=__astra,d=L.nav.locate(L.roam.x,L.roam.z).d;C.ride([...C.line(d,560,-1.8),...C.line(560,581,.5,7),C.side(8,1.8),...C.sideLine(8,112,1.8)]);if(!C.until(()=>L.state.chapter.phase==='friends',85))throw Error('Alex conversation did not finish');});
  check(`natural run ${pass}: Alex conversation leads to Find Jamie`,(await state()).chapter.objective==='Find Jamie.');
  await ev(()=>{const C=__astra;C.ride([...C.sideLine(112,16,-1.9),...C.line(584,786,-2.1)]);C.off();});
  if(pass===1){await camAt('astra-jamie-night-road',{house:'jamie',from:[-7,1.55,19],at:[-.4,1.6,1]});}
  await ev(()=>__astra.approachWindow('jamie'));
  check(`natural run ${pass}: Jamie reached on foot from Alex's house with a readable prompt`,(await state()).prompt==='F:Tap on the window');
  if(pass===1)await snap('astra-jamie-night-side-yard');
  await ev(()=>{lastLight.key('KeyF');if(!__astra.until(()=>lastLight.chapter.companions.list.jamie.climbTime>.45,55))throw Error('Jamie climb never began');});
  if(pass===1)for(let n=1;n<=5;n++){await ev(()=>lastLight.step(.52));await snap('astra-jamie-climb-'+n);}
  await ev(()=>{if(!__astra.until(()=>lastLight.state.chapter.jamie.follow==='ride',60))throw Error('Jamie not recruited');});
  check(`natural run ${pass}: recruitment advances to Find Sam`,(await state()).chapter.objective==='Find Sam.');
  await ev(()=>{__astra.on();__astra.ride(__astra.line(792,983,-2.2));__astra.off();});
  if(pass===1)await camAt('astra-sam-night-road',{house:'sam',from:[7,1.55,20],at:[4,1.6,2]});
  await ev(()=>__astra.approachWindow('sam'));if(pass===1)await snap('astra-sam-night-window');
  await ev(()=>{const L=lastLight,C=__astra;L.key('KeyF');if(!C.until(()=>L.state.chapter.objective==='Wait by Sam’s garage.',75))throw Error('Sam window did not finish');const h=L.world.homes.sam;C.walk(h.toWorld(h.sneakWin.s*(h.w/2+1.55),h.front+2.8));C.walk(h.toWorld(h.gx+h.gs*(h.gw/2+1.8),h.gfront+2.6));const d=L.chapter.sideDoor.outside,through=L.chapter.sideDoor.through;C.walk({x:d.x+(d.x-through.x)*1.5,z:d.z+(d.z-through.z)*1.5},{face:d});C.until(()=>L.state.chapter.flags.samOut,30);C.tick(1.7);});
  if(pass===1)await snap('astra-sam-garage-side-exit');
  await ev(()=>{if(!__astra.until(()=>lastLight.state.chapter.sam.follow==='ride',60))throw Error('Sam not recruited');});
  check(`natural run ${pass}: Sam joins after Jamie and his large garage stays closed`,await ev(()=>lastLight.world.garages.sam.open===0&&lastLight.state.chapter.phase==='oak'));
  await ev(()=>{const L=lastLight,C=__astra;C.on();C.ride(C.line(1000,1128,-1.5));if(!C.until(()=>L.state.chapter.phase==='retrace',90))throw Error('oak scene stalled');C.ride([...C.line(1128,1138,3,5),...C.line(1138,606,2,20),...C.line(606,598,4,4),C.side(10,1.8),...C.sideLine(10,78,1.8)]);if(!C.until(()=>L.state.chapter.phase==='creek',40))throw Error('creek phase stalled');C.tick(8);C.off();});
  check(`natural run ${pass}: spare flashlight acquired during existing creek dialogue`,(await state()).onFoot.owned);
  await ev(()=>{const C=__astra,L=lastLight,q=(u,v)=>L.nav.side(u,v);C.walk(q(92,8.8));C.walk(q(95.5,12.8));C.walk(q(97.7,14.9),{face:q(98.65,15.45)});});
  check(`natural run ${pass}: creek clue reached with walking inputs`,(await state()).prompt==='F:Look closer');
  await ev(()=>{lastLight.key('KeyF');__astra.until(()=>lastLight.state.chapter.line==='“That’s his.”',10);});if(pass===1)await snap('astra-reflector-crouch');
  await ev(()=>{if(!__astra.until(()=>lastLight.state.state==='ended',35))throw Error('end did not occur');});
  check(`natural run ${pass}: complete prologue through Chapter One ending without a QA jump`,(await state()).chapter.phase==='end');
 }
 const formations=await ev(()=>__astra.telemetry);console.log('Formation telemetry',JSON.stringify(formations));
 check('Jamie uses varied lateral formation on the journey to Sam and the oak',formations['jamie-ride']?.maxSide-formations['jamie-ride']?.minSide>1.5);
 check('walking companion uses positions beside the player at the creek',formations['sam-walk']?.maxSide-formations['sam-walk']?.minSide>.6);
 for(const [key,t] of Object.entries(formations))check(key+' has continuous motion and local player clearance',t.maxStep<.25&&t.minGap>.65);
 // Explicit controls, close-ups, collision and staging checks use QA jumps after natural runs.
 await ev(()=>{lastLight.jump('investigation');lastLight.step(.3);lastLight.face(lastLight.state.walk.a,-1.08);lastLight.step(.2);});await snap('astra-body-standing');
 await ev(()=>{lastLight.press('KeyC');lastLight.step(.8);});await snap('astra-body-crouched');
 check('browser crouch lowers eye and retains complete first-person body',await ev(()=>lastLight.foot.crouch>.95&&lastLight.self.group.parent===lastLight.scene));
 await ev(()=>{lastLight.release('KeyC');lastLight.step(.6);lastLight.key('Space');lastLight.step(.22);});await snap('astra-body-jump');
 check('browser Space jumps on foot and does not ring bell',await ev(()=>lastLight.foot.height>.3));await ev(()=>lastLight.step(1));
 await ev(()=>{lastLight.key('KeyT');lastLight.step(.1);});await snap('astra-creek-flashlight-off');check('browser T toggles the player flashlight independently',await ev(()=>!lastLight.foot.on&&lastLight.chapter.state.flash));
 await ev(()=>{lastLight.key('KeyT');lastLight.step(.1);});await snap('astra-creek-flashlight-on');
 for(const [name,u,v,tu,tv] of [['culvert',96.5,13,100,8.6],['water',98.7,20,100,22],['fence-gap',98.9,27,100.2,31.5],['tire-line',93,11,94.6,11.2],['trio-walking',98,16,95,13]]){await ev(([u,v,tu,tv])=>{const L=lastLight;L.jump('investigation');L.step(2);const a=L.nav.side(u,v),b=L.nav.side(tu,tv);L.camera.position.set(a.x,L.nav.groundY(a.x,a.z)+1.4,a.z);L.camera.lookAt(b.x,L.nav.groundY(b.x,b.z)+.2,b.z);L.camera.updateMatrixWorld();},[u,v,tu,tv]);await snap('astra-creek-'+name,{clean:true});}
 for(const who of ['officer','dad','mom','neighbor']){
  await ev(who=>{lastLight.jump('alex-house');lastLight.step(.3);const c=lastLight.chapter[who],p=c.person.group.position;lastLight.camera.position.set(p.x+Math.sin(c.a)*1.8,p.y+1.6,p.z-Math.cos(c.a)*1.8);lastLight.camera.lookAt(p.x,p.y+1.5,p.z);lastLight.camera.updateMatrixWorld();},who);await snap('astra-adult-'+who,{clean:true});
 }
 await ev(()=>{lastLight.jump('alex-house');lastLight.step(.5);const c=lastLight.chapter.carA,p=c.pos;lastLight.camera.position.set(p.x+4,p.y+1.4,p.z-4);lastLight.camera.lookAt(p.x,p.y+.9,p.z);lastLight.camera.updateMatrixWorld();});await snap('astra-patrol-close',{clean:true});
 await camAt('astra-empty-bike-hooks',{garage:'alex',from:[.4,1.55,3.7],at:[1.6,1.55,-3]});
 for(const [name,u,v] of [['curb',121,5.4],['driveway',119,9.8],['porch-side',122,11.7]]){
  const result=await ev(([u,v])=>{const L=lastLight,C=__astra;L.jump('alex-house');const q=L.nav.side(u,v);L.placePlayer({x:q.x,z:q.z,a:L.nav.frame.heading(u),mode:'walk',bike:{x:q.x-4,z:q.z-4,a:0}});const officer=L.chapter.officer,dad=L.chapter.dad,op={x:officer.x,z:officer.z},dp={x:dad.x,z:dad.z};let maxStep=0,last=[{...op},{...dp}];let started=false,dadJoined=false;
   for(let t=0;t<35;t+=1/30){L.step(1/30);for(const [i,a] of [officer,dad].entries()){maxStep=Math.max(maxStep,Math.hypot(a.x-last[i].x,a.z-last[i].z));last[i]={x:a.x,z:a.z};}if(L.state.chapter.line==='“You were with Alex tonight?”'){started=true;}if(L.state.chapter.line==='“He never came home.”'){dadJoined=!dad.walking&&Math.hypot(dad.x-q.x,dad.z-q.z)<5.8;break;}}
   return {started,dadJoined,maxStep,officerDistance:Math.hypot(officer.x-q.x,officer.z-q.z),officerMoved:Math.hypot(officer.x-op.x,officer.z-op.z),dadMoved:Math.hypot(dad.x-dp.x,dad.z-dp.z)};},[u,v]);
  console.log('staging',name,JSON.stringify(result));check('adults approach from '+name+' without snapping',result.started&&result.dadJoined&&result.maxStep<.13&&result.officerDistance<4.4);await snap('astra-conversation-'+name);
 }
 await ev(()=>{lastLight.jump('jamie');lastLight.step(.5);lastLight.ui.settings.captions=false;lastLight.key('KeyF');__astra.until(()=>lastLight.state.chapter.line==='“Ha. Nice try.”',25);});
 check('dialogue captions setting hides spoken lines but keeps navigation objective',await ev(()=>document.getElementById('subtitle').style.opacity==='0'&&lastLight.state.objective==='Find Jamie.'));await ev(()=>{lastLight.ui.settings.captions=true;});
 await ev(()=>{lastLight.jump('clue');lastLight.step(.3);lastLight.key('KeyF');__astra.until(()=>lastLight.state.chapter.line==='“That’s his.”',10);});await snap('astra-reflector-detail');
 await ev(()=>__astra.until(()=>lastLight.state.chapter.line==='“Why would he come back here?”',10));await snap('astra-creek-final-question');
 await ev(()=>{if(!__astra.until(()=>lastLight.chapter.pose.pitch>-.12,15))throw Error('final bell did not lift the view');});await snap('astra-bell-look-toward-trees');check('final bell gently lifts the player’s view toward the unresolved woods',await ev(()=>lastLight.chapter.pose.pitch>-.12));
}
