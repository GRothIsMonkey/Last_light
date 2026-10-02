// Chapter Two in the simulation harness: played through the way a player would (walking with the
// keys and the mouse, riding, pressing F where the prompt says), plus focused checks of each beat,
// the checkpoints, every QA jump, Continue and Start over. Called from verify.mjs with the running
// harness; everything runs the real dist/ modules.
import assert from 'node:assert/strict';

export function chapterTwoTools(T){
 const {h,advance,press,release,tap}=T,DT=1/30;
 const C1=()=>h.chapter.state,C2=()=>h.chapter2.state,F=h.world.easement,SP=F.spots;
 const log={said:[],objectives:[],phases:[],bad:[],captions:[]};let last='',lastObj='',lastPhase='',lastCap='';
 const watch=()=>{const s=C1();if(s.line&&s.line!==last){last=s.line;log.said.push((s.speaker||'')+': '+s.line);}if(s.objective&&s.objective!==lastObj){lastObj=s.objective;log.objectives.push(s.objective);}if(s.phase!==lastPhase){lastPhase=s.phase;log.phases.push(s.phase);}
  const cap=(T.element('subtitle').children||[]).map(c=>c.textContent).join(' ');if(cap&&cap!==lastCap){lastCap=cap;log.captions.push(cap);}
  const n=h.night;for(const v of [n.roam.x,n.roam.z,h.camera.position.x,h.camera.position.y,h.camera.position.z])if(!Number.isFinite(v))log.bad.push('player');
  for(const c of h.chapter.companions.all)if(c.active&&!Number.isFinite(c.bx+c.bz+c.px+c.pz))log.bad.push(c.key);};
 // Runs until fn() is true (checked every frame) or max seconds pass.
 const until=(fn,max)=>{for(let i=0;i<Math.ceil(max/DT);i++){advance(DT);watch();if(fn())return true;}return false;};
 const wait=s=>until(()=>false,s);
 const me=()=>{const n=h.night;return n.state==='c1-walk'?{x:n.wx,z:n.wz,a:n.wa,walking:true}:{x:n.roam.x,z:n.roam.z,a:n.roam.a,walking:false};};
 const faceTo=(x,z,pitch=0)=>{const p=me();h.face(Math.atan2(x-p.x,-(z-p.z)),pitch);};
 // Walking: turn toward the next point (as with the mouse) and hold W.
 function walkTo(pts,{r=.6,max=90,sprint=false,stop=null}={}){let i=0;const ok=until(()=>{if(stop?.())return true;const p=me();while(i<pts.length&&Math.hypot(pts[i][0]-p.x,pts[i][1]-p.z)<r)i++;if(i>=pts.length)return true;faceTo(pts[i][0],pts[i][1]);press('KeyW');if(sprint)press('ShiftLeft');return false;},max);release('KeyW');release('ShiftLeft');advance(.3);return ok;}
 function walkPath(to,o){const p=me(),path=h.nav.walkPath({x:p.x,z:p.z},{x:to.x,z:to.z});return walkTo(path.length?path:[[to.x,to.z]],o);}
 function rideTo(pts,max=150,r=2.6){h.drive(pts,{r});const ok=until(()=>!h.driving,max);h.stopDriving();return ok;}
 const brake=()=>{release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');};
 const W2=(s,t)=>{const p=F.world(s,t);return {x:p.x,z:p.z};};
 return {C1,C2,F,SP,log,watch,until,wait,me,faceTo,walkTo,walkPath,rideTo,brake,W2,DT};
}

// From the black screen after Chapter One to the end of Chapter Two.
export function playChapterTwo(T,label){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterTwoTools(T),{C1,C2,F,SP,log,until,wait,me,faceTo,walkTo,walkPath,rideTo,brake,W2}=X;
 const said=()=>log.said;
 // ---- the transition ----------------------------------------------------------------------------
 let cardSeen=false,blackAtCard=1;until(()=>{if(element('chapter-card').classList.contains('on')){cardSeen=true;blackAtCard=Math.min(blackAtCard,+element('fade').style.opacity);}return C1().phase==='c2-decide';},20);
 check(`${label}: black, a quiet CHAPTER TWO card, then the same creek moments later`,()=>{assert.ok(cardSeen,'card');assert.ok(blackAtCard>.99,'card over black '+blackAtCard);assert.equal(element('chapter-card').classList.contains('on'),false);assert.ok(+element('fade').style.opacity<.01);
  assert.equal(h.snapshot.state,'c1-walk');assert.equal(element('ending').hidden,true);const L=h.nav.locate(me().x,me().z);assert.ok(L.street==='side'||L.street==='creek'||L.street==='easement',JSON.stringify(L));
  assert.deepEqual(said().slice(0,2),['JAMIE: “You guys heard that too, right?”','SAM: “Yeah.”'],'the first words after Chapter One');});
 until(()=>C1().phase==='c2-follow',40);
 check(`${label}: they argue (cops, a bike bell, the reflector), and go a little farther`,()=>{for(const l of ['SAM: “We should go get the cops.”','JAMIE: “And tell them what? We heard a bike bell?”','YOU: “His reflector’s here.”','JAMIE: “Just a little farther.”'])assert.ok(said().includes(l),l);
  assert.equal(C1().objective,'Follow the sound.');assert.ok(h.foot.owned,'you still have the flashlight');assert.equal(C1().jamie.follow,'search');assert.equal(C1().sam.follow,'search');});
 // ---- through the fence, into the easement ------------------------------------------------------
 // The flashlight on; to the gap in the back fence.
 if(!h.foot.on)tap('KeyT');
 const gap=SP.gap,onPath=s=>{const p=W2(s,F.pathT(s));return [p.x,p.z];};walkPath(gap,{max:60});walkTo([.6,1.4,2.4,3.6,5,6.5].map(onPath),{max:30});
 check(`${label}: through the gap in the back fence and into the drainage easement`,()=>{assert.equal(C1().phase,'c2-easement');assert.equal(h.nav.locate(me().x,me().z).street,'easement');assert.equal(C1().objective,'Search beyond the fence.');});
 // Down the path, past each sign of a bike going through.
 const companionsNear=[];const along=(s)=>{const p=W2(s,F.pathT(s));return [p.x,p.z];};
 for(const [s,stop] of [[9.2,'mud'],[17,'weeds'],[25.8,'scrape']]){walkTo([along(s-1.5)],{max:40});const q=SP[stop];faceTo(q.x,q.z,-.5);wait(2.2);
  companionsNear.push(Math.max(...h.chapter.companions.all.map(c=>Math.hypot(c.px-me().x,c.pz-me().z))));}
 check(`${label}: a tire mark in the mud, flattened weeds, a scrape; the others search with you`,()=>{assert.ok(said().includes('JAMIE: “Look. A tire.”'));assert.ok(said().includes('SAM: “Something went through here.”'));assert.ok(C1().objective==='Check the drainage path.'||C2().flags.found,'objective '+C1().objective);
  assert.ok(companionsNear.every(d=>d<9),'companions stayed close '+companionsNear);for(const id of ['evidence-tire-mark','evidence-flattened-weeds','evidence-scrape'])assert.ok((h.originals||h.world.originals).some(o=>o.name===id),id);});
 // The bicycle by the culvert.
 const bike=h.chapter2.found.group.position;walkTo([along(28.6)],{max:30});faceTo(bike.x,bike.z,-.3);until(()=>C2().flags.found,10);
 check(`${label}: Alex's green bike lies beside the big culvert`,()=>{assert.ok(C2().flags.found);assert.equal(C1().phase,'c2-bike');assert.ok(C2().foundVisible);assert.ok(said().includes('JAMIE: “Guys.”'));assert.equal(C1().objective,'Look at the bicycle.');});
 walkTo([[bike.x+(me().x-bike.x)*.55,bike.z+(me().z-bike.z)*.55]],{r:.25,max:12});faceTo(bike.x,bike.z,-.4);wait(.3);
 check(`${label}: F looks closer at the bike`,()=>assert.equal(h.ui.promptText,'F:Look closer'));
 tap('KeyF');let bellPhase=null;until(()=>{if(C2().flags.bell&&!bellPhase)bellPhase={t:C2().bellAt,cam:{x:h.camera.position.x,z:h.camera.position.z}};return C1().phase==='c2-police';},60);
 check(`${label}: "That’s his bike." The reflector is broken off. Then the bell again, twice, from inside the culvert`,()=>{for(const l of ['YOU: “That’s his bike.”','JAMIE: “The back reflector’s broken off.”','SAM: “Where is he?”','JAMIE: “Alex?”','SAM: “Nope.”','JAMIE: “That wasn’t his bike.”'])assert.ok(said().includes(l),l);
  assert.ok(bellPhase,'the bell rang');const i=said().indexOf('JAMIE: “Alex?”'),j=said().indexOf('SAM: “Nope.”');assert.ok(j===i+1,'silence, then Sam');});
 // The police.
 until(()=>C1().phase==='c2-search',60);
 check(`${label}: a flashlight behind them: "Hey!" "Kids! Stop right there."; they show him the bike; he radios it in`,()=>{for(const l of ['OFFICER: “Hey!”','OFFICER: “Kids! Stop right there.”','YOU: “It’s Alex’s.”','OFFICER: “What?”','JAMIE: “His bike.”'])assert.ok(said().includes(l),l);assert.ok(said().some(l=>l.startsWith('RADIO:')));assert.ok(C2().flags.reported);});
 until(()=>C1().phase==='c2-home',80);
 check(`${label}: more adults, tape, Alex's dad; nobody takes the bell seriously; sent home`,()=>{assert.ok(C2().tape);assert.ok(C2().searchers>=2,'searchers '+C2().searchers);assert.ok(said().includes('ALEX’S DAD: “That’s his bike. That’s Alex’s bike.”'));
  const k=said().indexOf('SAM: “We heard a bell. In there.”');assert.ok(k>=0);assert.equal(said()[k+1],'OFFICER: “Okay.”');assert.equal(C1().objective,'Go home.');});
 until(()=>C2().flags.plan,30);
 check(`${label}: "Oak. Tomorrow morning." "Seriously?" "Nine."`,()=>{const a=said().indexOf('JAMIE: “Oak. Tomorrow morning.”');assert.ok(a>=0);assert.deepEqual(said().slice(a,a+3),['JAMIE: “Oak. Tomorrow morning.”','SAM: “Seriously?”','JAMIE: “Nine.”']);});
 // Home: back out through the fence.
 const leaving=()=>C1().phase!=='c2-home';walkPath(W2(14,F.pathT(14)),{max:40,stop:leaving});walkPath(SP.gap,{max:40,stop:leaving});until(()=>C1().phase==='m-home',30);
 check(`${label}: walking away is enough: the night fades out, AUGUST 22, 2011, and the morning fades in`,()=>{assert.ok(log.phases.includes('c2-dawn'));assert.equal(C1().phase,'m-home');});
 // ---- the morning --------------------------------------------------------------------------------
 until(()=>+element('fade').style.opacity<.01,8);
 check(`${label}: August 22, morning: bright, the same street, people out looking`,()=>{assert.equal(C2().day,1);assert.equal(h.chapter.day,1);assert.equal(h.skyMat.uniforms.day.value,1);assert.ok(h.skyMat.uniforms.night.value<.01);assert.ok(element('date').innerHTML.startsWith('AUGUST 22, 2011'));
  assert.equal(C1().objective,'Meet Jamie and Sam at the oak.');assert.ok(C2().flyers);assert.ok(C2().searchers>=4,'searchers '+C2().searchers);assert.equal(C2().foundVisible,false);assert.equal(h.chapter.carA.active,true);assert.equal(C2().beams,0);});
 // On the bike and up to the oak.
 const r=h.night.roam;walkTo([[r.x,r.z]],{r:1.2,max:20});faceTo(r.x,r.z);wait(.2);tap('KeyF');until(()=>h.night.state==='c1-ride',4);
 const ML=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];},line=(d0,d1,l,st=20)=>{const o=[];const n=Math.ceil(Math.abs(d1-d0)/st);for(let i=1;i<=n;i++)o.push(ML(d0+(d1-d0)*i/n,l));return o;};
 const L0=h.nav.locate(me().x,me().z);rideTo([ML(L0.d+3,-2.4),...line(L0.d+3,1128,-2.2)],200);brake();until(()=>C2().flags.oakTalk,20);until(()=>C1().phase==='m-briarwood',80);
 check(`${label}: at the oak: the old bike is gone, and maybe was never there; "What if he heard the bell?"`,()=>{for(const l of ['JAMIE: “Wasn’t there an old bike here last night?”','SAM: “What old bike?”','YOU: “There was one right there.”','SAM: “No there wasn’t.”','JAMIE: “I… think there was.”','JAMIE: “What if he heard the bell?”'])assert.ok(said().includes(l),l);
  assert.equal(h.ending.otherBike.visible,false);assert.equal(C1().objective,'Return to Briarwood.');});
 // Back along Oak Hollow to the corner where Alex turned.
 press('KeyW');rideTo([ML(1131,3),...line(1131,600,2.2,25),ML(596,2.4)],200);brake();faceTo(...(()=>{const q=h.chapter2.corner.look;return [q.x,q.z];})());until(()=>C2().flags.corner,10);wait(2.5);
 check(`${label}: at the corner, "Remember" (F)`,()=>{assert.ok(said().includes('JAMIE: “This is where he turned.”'));assert.equal(C1().objective,'Remember Alex leaving.');assert.equal(h.ui.promptText,'F:Remember');});
 const before={x:me().x,z:me().z,a:me().a,jamie:[C1().jamie.x,C1().jamie.z],sam:[C1().sam.x,C1().sam.z],visible:h.chapter2.presentVisible?h.scene.children.filter(c=>c.visible).length:0};
 tap('KeyF');let inMemory=false,memAlex={paused:false,looked:0,minSpeed:9,rang:false},warm=false,muffled=0;
 until(()=>{if(element('fade').classList.contains('warm'))warm=true;if(h.snapshot.state==='memory'){inMemory=true;const a=h.memCast.list.find(f=>f.key==='alex');if(a.lookWorld)memAlex.looked+=1/30;if(a.paused)memAlex.paused=true;if(a.mode==='leave'&&a.blat>8&&!a.paused)memAlex.minSpeed=Math.min(memAlex.minSpeed,a.speed);if(a.rang)memAlex.rang=true;}return C1().phase==='m-after';},90);
 const after={x:me().x,z:me().z,a:me().a,jamie:[C1().jamie.x,C1().jamie.z],sam:[C1().sam.x,C1().sam.z]};
 check(`${label}: remembering: a warm fade into the evening ride; Alex stops and looks off toward the creek before he waves`,()=>{assert.ok(inMemory,'memory played');assert.ok(warm,'warm fade');assert.ok(memAlex.looked>2.4,'looked '+memAlex.looked);assert.ok(memAlex.paused);assert.ok(memAlex.minSpeed<.45,'stopped '+memAlex.minSpeed);assert.ok(memAlex.rang,'then the wave and the bell');
  assert.ok(log.captions.some(c=>c.includes('Alright, I’m this way…')));});
 check(`${label}: back in the morning exactly where you were; nothing in the present changed`,()=>{assert.ok(Math.hypot(after.x-before.x,after.z-before.z)<.05,'player moved');assert.ok(Math.abs(after.a-before.a)<.01);for(const k of ['jamie','sam'])assert.ok(Math.hypot(after[k][0]-before[k][0],after[k][1]-before[k][1])<.05,k+' moved');
  assert.equal(h.snapshot.state.startsWith('c1-'),true);assert.equal(h.memCast.list.some(f=>f.person.group.visible||f.bike.group.visible),false);assert.equal(C2().flyers,true);assert.ok(!document.body.classList.contains('remembering'));});
 until(()=>h.snapshot.state==='ended',40);
 check(`${label}: "Sam was right." ... "He heard it before he left." Then LAST LIGHT / Chapter Two`,()=>{for(const l of ['YOU: “Sam was right.”','JAMIE: “He stopped.”','YOU: “He was looking toward the creek.”','JAMIE: “And earlier he asked if we heard something.”','JAMIE: “He heard it before he left.”'])assert.ok(said().includes(l),l);
  assert.equal(h.snapshot.state,'ended');assert.equal(element('ending').hidden,false);});
 check(`${label}: Chapter Two ran through its phases in order`,()=>assert.deepEqual(log.phases.filter(p=>p.startsWith('c2-')||p.startsWith('m-')),['c2-black','c2-decide','c2-follow','c2-easement','c2-bike','c2-bell','c2-police','c2-search','c2-home','c2-dawn','m-home','m-briarwood','m-memory','m-after','m-end']));
 check(`${label}: nothing went missing or non-finite in Chapter Two`,()=>assert.deepEqual(log.bad,[]));
 metrics['chapter2 lines spoken']=log.said.length;metrics['chapter2 objectives']=log.objectives;
 return log;
}

// Focused checks: each beat on its own, the checkpoints, every QA jump, Continue, Start over.
export async function runChapterTwoChecks(T){
 const {h,advance,press,release,tap,check,element,metrics}=T,X=chapterTwoTools(T),{C1,C2,F,SP,until,wait,me,faceTo,walkTo}=X;
 const {CAST}=await import('../dist/cast.js'),{REFLECTOR}=await import('../dist/rig.js'),{createAudio}=await import('../dist/audio.js'),{fakeAudioContext}=await import('./playtest-fixes.mjs'),THREE=await import('../dist/three.module.js');
 const finite=()=>{const c=h.camera.position;return Number.isFinite(c.x+c.y+c.z)&&Number.isFinite(h.night.roam.x+h.night.roam.z);};
 // ---- Alex's bicycle and the reflector ----------------------------------------------------------
 h.jump('alex-bike');advance(1);
 const colorsOf=(g,skip=null)=>{const out=new Set();g.traverse(m=>{if(!m.isMesh)return;for(let p=m;p;p=p.parent)if(p===skip)return;const c=m.geometry.attributes.color;if(m.material.vertexColors&&c){for(let i=0;i<c.count;i+=3)out.add(new THREE.Color(c.getX(i),c.getY(i),c.getZ(i)).getHexString());}else if(m.material.color&&!m.material.map)out.add(m.material.color.getHexString());});return out;};
 check('chapter two: the bike by the culvert is Alex’s bike, the same bike he rode in the prologue',()=>{const found=h.chapter2.found,alex=h.friends.list.find(f=>f.key==='alex'),his=alex.bike;
  assert.deepEqual(JSON.parse(JSON.stringify(found.geom)),JSON.parse(JSON.stringify(his.geom)),'same frame geometry');const a=colorsOf(found.group),b=colorsOf(his.group,alex.person.group);
  for(const c of b)assert.ok(a.has(c),'colour '+c+' missing on the found bike');assert.equal(CAST.alex.bike.frame,0x8a8f3f);assert.ok(a.has(new THREE.Color(CAST.alex.bike.frame).getHexString()),'green frame');});
 check('chapter two: its rear reflector is broken out of the clip, and the creek piece is that reflector',()=>{assert.ok(CAST.alex.bike.extras.includes('rear-reflector'));const red=new THREE.Color(REFLECTOR.color).getHexString();
  assert.ok(colorsOf(h.chapter2.found.group).has(red),'a red sliver left in the clip');const clue=h.chapter.clue,lens=[];clue.traverse(m=>{if(m.isMesh&&m.material.emissive)lens.push(m);});
  assert.ok(lens.some(m=>m.material.color.getHexString()===red),'the piece is the same red');
  const g=lens.find(m=>m.material.color.getHexString()===red).geometry;g.computeBoundingBox();const s=g.boundingBox.getSize(new THREE.Vector3());assert.ok(Math.max(s.x,s.z)<=REFLECTOR.r*2+.004,'the piece fits the lens '+JSON.stringify(s));});
 check('chapter two: the bike lies on the bank beside the big culvert, not in the water',()=>{const b=h.chapter2.found.group.position,L=h.nav.locate(b.x,b.z);assert.equal(L.street,'easement');assert.ok(Math.hypot(b.x-SP.mouth.x,b.z-SP.mouth.z)<5.5,'near the culvert');
  assert.ok(Math.abs(L.t-F.channelT(L.s))>1.2,'out of the channel');assert.ok(Math.abs(h.chapter2.found.group.rotation.z)>1.2,'on its side');});
 // ---- the culvert and the second bell ---------------------------------------------------------
 check('chapter two: the culvert is big and dark but not a place to go: a step inside at most',()=>{const at=(s,t)=>{const p=F.world(s,t);return h.nav.walkable(p.x,p.z,{r:.28});};const t=F.channelT(33.6);assert.ok(at(33.4,t),'the mouth');assert.ok(!at(35.5,t),'two metres in');assert.ok(!at(40,t));});
 const calls=[];const o=h.chapter.kit.o,orig=o.audio;o.audio=()=>new Proxy({},{get:(_,k)=>k==='bell'?(pos,g,opt)=>calls.push({pos,g,opt}):()=>{}});
 h.jump('second-bell');until(()=>C2().flags.bell,8);o.audio=orig;
 check('chapter two: the second bell comes from deep inside the culvert, away from the bike, with the tunnel on it',()=>{assert.equal(calls.length,1);const c=calls[0],b=h.chapter2.found.group.position,L=h.nav.locate(c.pos.x,c.pos.z),q=F.local(c.pos.x,c.pos.z);
  assert.ok(q.s>40,'inside the culvert, s='+q.s);assert.ok(Math.hypot(c.pos.x-b.x,c.pos.z-b.z)>15,'well away from the bike');assert.equal(c.opt?.tunnel,true);void L;});
 {const ctx=fakeAudioContext(),filters=[],delays=[];const cf=ctx.createBiquadFilter.bind(ctx),cd=ctx.createDelay.bind(ctx);ctx.createBiquadFilter=()=>{const n=cf();filters.push(n);return n;};ctx.createDelay=()=>{const n=cd();delays.push(n);return n;};
  const a=createAudio({context:ctx});a.ensure();a.setEnabled(true);filters.length=0;a.bell({x:0,y:1,z:-20},1.5,{tunnel:true});
  check('audio: the bell from the culvert is the ordinary bell, darkened and with a short echo (signal check, not listening)',()=>{assert.ok(filters.some(f=>f.type==='lowpass'&&f.frequency.value===2900),'darkened');assert.equal(delays.length,2,'two short echoes');assert.deepEqual(delays.map(d=>d.delayTime.value),[.09,.21]);});}
 // ---- the police, sent home ---------------------------------------------------------------------
 h.jump('police-find');until(()=>C2().flags.called,6);
 check('QA jump police-find: the officer calls out, the bike is there, and the night is dark',()=>{assert.equal(C1().phase,'c2-police');assert.ok(h.chapter.officer2.visible);assert.ok(finite());assert.equal(h.chapter.day,0);assert.ok(h.skyMat.uniforms.night.value>.9);});
 // ---- the morning -------------------------------------------------------------------------------
 const mergedVisible=()=>h.world.merged.map(m=>m.visible!==false);
 h.jump('easement');advance(1);const nightWorld=mergedVisible();
 h.jump('morning');advance(4);
 check('morning: exactly the same neighborhood (nothing in the world changed overnight), in daylight',()=>{assert.deepEqual(mergedVisible(),nightWorld);assert.equal(h.chapter.day,1);assert.equal(h.skyMat.uniforms.day.value,1);assert.equal(h.sunlight.castShadow,true);assert.ok(h.sunlight.intensity>2.5);assert.ok(h.hemi.intensity>1.8);
  assert.equal(h.ambient.morningMode,true);assert.ok(h.ambient.state.lamps.every(l=>l<.05),'street lights off');});
 check('morning: the search is on (police, neighbors, flyers on the poles), and no school',()=>{assert.ok(C2().searchers>=4);assert.equal(h.chapter.carA.active,true);assert.ok(h.chapter.carA.lights===false);assert.ok(C2().flyers);assert.ok(h.chapter2.flyers.children.length>=5,'flyers '+h.chapter2.flyers.children.length);});
 check('morning: you start by your bike near home; no flashlight prompt in daylight; no map, no arrows',()=>{const r=h.night.roam;assert.ok(Math.hypot(me().x-r.x,me().z-r.z)<3);assert.ok(!(h.prompt||[]).some(i=>i[0]==='T'));assert.equal(C1().objective,'Meet Jamie and Sam at the oak.');});
 h.jump('morning-oak');advance(1);until(()=>C2().flags.oakTalk,12);
 check('QA jump morning-oak: riding up to Jamie and Sam at the oak starts the talk; the old bike is not there',()=>{assert.ok(C2().flags.oakTalk);assert.equal(h.ending.otherBike.visible,false);assert.ok(finite());});
 until(()=>C1().phase==='m-briarwood',80);advance(6);
 check('after the oak, Jamie and Sam ride with you again',()=>{assert.equal(C1().jamie.follow,'ride');assert.equal(C1().sam.follow,'ride');assert.equal(C1().jamie.mode,'ride');});
 // ---- the memory --------------------------------------------------------------------------------
 h.jump('memory-start');advance(1.5);
 check('QA jump memory-start: at the corner, on the bike, F: Remember',()=>{assert.equal(C1().phase,'m-briarwood');assert.equal(h.ui.promptText,'F:Remember');assert.equal(h.snapshot.state,'c1-ride');});
 // On foot works too.
 h.jump('memory-reconstruction');let sawMemory=false,maxYaw=0,headClamp=true;until(()=>{if(h.snapshot.state==='memory'){sawMemory=true;h.look(3,2);maxYaw=Math.max(maxYaw,Math.abs(h.snapshot.look));}return h.memory.state?.phase==='play';},12);
 advance(2);check('memory: first person, from the saddle, head look limited, no glitch effects',()=>{assert.ok(sawMemory);assert.equal(h.snapshot.state,'memory');assert.ok(document.body.classList.contains('remembering'));assert.ok(h.self.group.visible,'your own arms and bike');assert.ok(Math.abs(h.snapshot.look)<=1.351,'look '+h.snapshot.look);
  const alex=h.memCast.list.find(f=>f.key==='alex');assert.ok(alex.bike.group.visible);assert.equal(h.skyMat.uniforms.day.value,0,'the evening light');assert.ok(h.skyMat.uniforms.dusk.value>.4);h.look(0,0);});
 // Start over in the middle of a memory: back to a clean start.
 element('restart').onclick?.();advance(.2);
 check('Start over from inside a memory leaves nothing of it behind',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.memory.active,false);assert.ok(h.memCast.list.every(f=>!f.person.group.visible&&!f.bike.group.visible));assert.ok(!document.body.classList.contains('remembering'));assert.equal(element('fade').classList.contains('warm'),false);
  assert.equal(C2().day,0);assert.equal(C2().flyers,false);for(const c of h.chapter.companions.all)assert.equal(c.active,false);});
 // ---- every QA jump --------------------------------------------------------------------------------
 const expect={'chapter2-start':'c2-decide','easement':'c2-easement','alex-bike':'c2-bike','second-bell':'c2-bell','police-find':'c2-police','morning':'m-home','morning-oak':'m-home','memory-start':'m-briarwood','memory-reconstruction':'m-memory','chapter2-end':'m-after'};
 for(const [sec,phase] of Object.entries(expect)){h.jump(sec);advance(.5);
  check(`QA jump ${sec}: lands in ${phase}, everything finite, the night (or the morning) set up`,()=>{assert.equal(C1().phase,phase);assert.ok(finite());assert.ok(h.snapshot.state.startsWith('c1-')||h.snapshot.state==='memory');const day=['m-home','m-briarwood','m-memory','m-after'].includes(phase);assert.equal(h.chapter.day,day?1:0);
   assert.ok(document.body.classList.contains('night1'),'chapter interface');assert.equal(!!h.foot.light.parent,!day,'your flashlight is in the scene at night only');assert.equal(h.chapter.police.attached,!day);assert.equal(h.sunlight.castShadow,day);});}
 // ---- checkpoints and Continue ----------------------------------------------------------------------
 const ids=['chapter2-start','bike-found','police-arrival','morning','morning-oak','briarwood-memory','chapter2-end'];
 for(const id of ids){h.jump(id);advance(.5);h.chapter.kit.checkpointTo(id,h.chapter2.LABEL[id]);const s=h.chapter.saved();
  check(`checkpoint ${id}: saved silently, Continue knows it ("${h.chapter2.LABEL[id]}") and returns to it`,()=>{assert.equal(s.section,id);assert.equal(s.label,h.chapter2.LABEL[id]);h.jump(s.section);advance(.5);assert.ok(finite());assert.ok(C1().phase.startsWith('c2-')||C1().phase.startsWith('m-'),C1().phase);});}
 check('Chapter Two checkpoint names are known before they are reached (Continue after a reload)',()=>{for(const id of ids)assert.ok(h.chapter.kit.CHECKPOINT[id],id);});
 metrics['chapter2 jumps']=Object.keys(expect).length;metrics['chapter2 checkpoints']=ids.length;
}
