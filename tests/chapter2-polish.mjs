// Presentation regressions deliberately inspect computed CSS and rendered scenes, not just strings.
export async function runChapterTwoPolish({page,snap,check}){
 const ev=(fn,arg)=>page.evaluate(fn,arg);
 const cases=[['oak','old-oak',4],['retrace','dark-road',2],['alex-house','police-house',4],['jamie','jamie-house',1],['sam','sam-house',1],['investigation','creek',3],['easement','easement',2],['alex-bike','bicycle',2],['police-find','police-search',5],['morning','morning',4],['memory-reconstruction','memory',5]];
 for(const [jump,name,time] of cases){
  await ev(([jump,time])=>{const L=lastLight;L.jump(jump);L.step(time);},[jump,time]);
  // A fixed diagnostic line gives identical contrast/line-wrap coverage at each real scene.
  // It is a capture fixture, not dialogue added to the game.
  await ev(()=>{const el=document.getElementById('subtitle');el.replaceChildren();const who=document.createElement('small');who.textContent='JAMIE';el.append(who,document.createTextNode('“Try to remember exactly what he did.”'));el.style.opacity='1';});
  // Since Chapter Three the charcoal backing is gone: the words take a light or dark tone from the picture
  // behind them (captions.js). The tone is given a moment of drawn frames to measure this scene first.
  await ev(()=>new Promise(res=>{const L=lastLight;let i=0;const f=()=>{L.render();L.captionTone.update(.15,{fade:L.state.fade||0});if(++i<12)requestAnimationFrame(f);else res();};requestAnimationFrame(f);}));
  check('caption '+name+': structured, no box, legible against this scene and clear of navigation',await ev(()=>{const el=document.getElementById('subtitle'),s=getComputedStyle(el),r=el.getBoundingClientRect(),o=document.getElementById('objective-panel').getBoundingClientRect(),p=document.getElementById('prompt').getBoundingClientRect(),t=lastLight.captionTone.state;return el.classList.contains('dialogue-caption')&&el.querySelector('small')?.textContent==='JAMIE'&&/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)&&s.borderTopWidth==='0px'&&t.source==='frame'&&(t.contrast>=3||t.halo>=.7||t.scrim>=.5)&&r.top>o.bottom+12&&r.bottom<p.top-12&&r.left>=0&&r.right<=innerWidth;}));
  await snap('readability-'+name);
 }
 // Change only the view while keeping the caption: the worst bright/dark contrast backgrounds.
 for(const [name,pitch] of [['sky',.95],['asphalt',-.7]]){await ev(p=>{const L=lastLight;L.jump('morning');L.step(3);L.face(L.state.walk.a,p);L.step(.1);const el=document.getElementById('subtitle');el.innerHTML='<small>JAMIE</small>“Briarwood. Where he left us last night.”';el.style.opacity='1';},pitch);await snap('readability-'+name);}
 for(const size of [{width:1280,height:720},{width:700,height:900}]){
  await page.setViewportSize(size);await ev(()=>{const L=lastLight;L.jump('memory-start');L.step(2);const el=document.getElementById('subtitle');el.innerHTML='<small>JAMIE</small>“Try to remember exactly what he did.”';el.style.opacity='1';});
  check('caption/objective/prompt do not overlap at '+size.width+'x'+size.height,await ev(()=>{const r=document.getElementById('subtitle').getBoundingClientRect(),o=document.getElementById('objective-panel').getBoundingClientRect(),p=document.getElementById('prompt').getBoundingClientRect();return r.top>o.bottom+12&&r.bottom<p.top-12;}));await snap('readability-'+size.width);
 }
 await page.setViewportSize({width:1440,height:900});
 await ev(()=>{const L=lastLight;L.jump('memory-start');L.step(2);L.face(L.roam.a+Math.PI);L.step(14);});
 check('Remember persists facing away after a 14-second pause',await ev(()=>lastLight.state.prompt==='F:Remember'&&lastLight.state.chapter2.flags.rememberReminder));
 await ev(()=>lastLight.step(30));
 check('Remember still available after reminder finishes',await ev(()=>lastLight.state.prompt==='F:Remember'&&lastLight.state.chapter.phase==='m-briarwood'));
 await snap('memory-reminder-finished');
 // Detached art cameras hide the intentionally headless first-person body. Natural walkthroughs retain it.
 // Close-range art review cameras, separately from the uninterrupted player walkthroughs.
 const detail=async(name,fn)=>{await ev(async fn=>{const T=await import('./three.module.js'),L=lastLight;const q=(new Function('L','T','return ('+fn+')(L,T)'))(L,T);L.scene.updateMatrixWorld(true);L.self.group.visible=false;L.camera.position.copy(q.from);L.camera.lookAt(q.at);L.camera.updateMatrixWorld();L.scene.children.find(o=>o.isMesh&&o.geometry?.parameters?.radius===350)?.position.copy(L.camera.position);},String(fn));await snap(name);await ev(()=>{lastLight.self.group.visible=true;});};
 await ev(()=>{lastLight.jump('alex-bike');lastLight.step(2);});
 await detail('polish-c2-reflector',(L,T)=>{const b=L.chapter2.found,g=b.geom,at=new T.Vector3(0,g.saddle[1]-.11,g.saddle[2]+.42).applyMatrix4(b.group.matrixWorld);return {at,from:at.clone().add(new T.Vector3(.65,.38,.25))};});
 await ev(()=>{lastLight.jump('second-bell');lastLight.step(3);});
 await detail('polish-c2-culvert-depth',(L,T)=>{const F=L.world.easement,m=F.spots.mouth,p=F.world(30.5,F.channelT(33)-.35);return {from:new T.Vector3(p.x,m.bed+1.4,p.z),at:new T.Vector3(m.x,m.bed+1,m.z)};});
 await ev(()=>{lastLight.chapter2.day=1;lastLight.step(.1);});
 await detail('polish-c2-concrete-daylight-diagnostic',(L,T)=>{const F=L.world.easement,m=F.spots.mouth,p=F.world(27.5,F.channelT(33)-2.4);return {from:new T.Vector3(p.x,m.bed+2.7,p.z),at:new T.Vector3(m.x,m.bed+1.2,m.z)};});
 await ev(()=>{lastLight.jump('police-find');for(let t=0;t<100&&!lastLight.state.chapter2.tape;t+=.5)lastLight.step(.5);lastLight.step(9);});
 await detail('polish-c2-tape-search',(L,T)=>{const F=L.world.easement,b=L.chapter2.found.group.position,p=F.world(26.7,F.pathT(27)-.8);return {from:new T.Vector3(p.x,L.nav.groundY(p.x,p.z)+1.55,p.z),at:b.clone().add(new T.Vector3(0,.6,0))};});
 await ev(()=>{lastLight.jump('morning');lastLight.step(3);});
 await detail('polish-c2-flyer',(L,T)=>{const f=L.chapter2.flyers.children[0],at=f.position.clone(),n=new T.Vector3(0,0,1).applyQuaternion(f.quaternion);return {from:at.clone().addScaledVector(n,.75),at};});

}
