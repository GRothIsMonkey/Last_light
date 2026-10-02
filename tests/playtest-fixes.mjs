// Regressions for the four confirmed human-playtest bugs found on the Chapter One release:
//  1. a friend's bedroom "fan" sound stuttering (Sam's window),
//  2. the porch flag flying backwards and upside down,
//  3. the curbside basketball hoop facing away from where it is played,
//  4. Jamie and Sam left sitting at the old oak on the first attempt to ride on.
// Called from verify.mjs with the running harness; every check runs the real dist/ modules.
import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import {createAudio} from '../dist/audio.js';

// A recording stand-in for Web Audio: every gain and pan automation call is kept, so loop behavior
// over a long session can be checked deterministically without real time passing.
class Param{constructor(v=0){this.value=v;this.events=[];this.target=v;}
 setTargetAtTime(v,t,tc){this.events.push(['target',v,t,tc]);this.target=v;return this;}
 setValueAtTime(v,t){this.events.push(['set',v,t]);this.value=this.target=v;return this;}
 linearRampToValueAtTime(v,t){this.events.push(['lin',v,t]);return this;}
 exponentialRampToValueAtTime(v,t){this.events.push(['exp',v,t]);return this;}
 cancelScheduledValues(t){this.events.push(['cancel',t]);return this;}}
class Node{constructor(){this.outputs=[];}connect(n){this.outputs.push(n);return n;}disconnect(){this.outputs=[];}}
export function fakeAudioContext(){const ctx={currentTime:0,sampleRate:8000,destination:new Node(),
 createBuffer:(c,len)=>({getChannelData:()=>new Float32Array(len)}),
 createBufferSource(){const n=new Node();n.start=()=>{};n.stop=()=>{};return n;},
 createBiquadFilter(){const n=new Node();n.frequency=new Param();n.Q=new Param();n.gain=new Param();return n;},
 createGain(){const n=new Node();n.gain=new Param(1);return n;},
 createDynamicsCompressor(){const n=new Node();for(const k of ['threshold','knee','ratio','attack','release'])n[k]=new Param();return n;},
 createStereoPanner(){const n=new Node();n.pan=new Param();return n;},
 createOscillator(){const n=new Node();n.frequency=new Param();n.start=()=>{};n.stop=()=>{};n.setPeriodicWave=()=>{};return n;},
 createDelay(){const n=new Node();n.delayTime=new Param();return n;},
 createPeriodicWave:()=>({}),resume(){}};return ctx;}
const seeded=(s=2011)=>()=>{s=(s*16807)%2147483647;return s/2147483647;};
const NIGHT={speed:0,pedal:false,coasting:false,onBike:false,surface:'grass',p:1,night:1,deep:.4,finale:40,friendsLeft:0,state:'walking',crank:0,night1:true};

export function runPlaytestFixChecks({h,advance,press,release,tap,check,element,metrics,W,groundPoint}){
 const C1=()=>h.chapter.state,DT=1/30,Y=new THREE.Vector3(0,1,0);
 // ---------------------------------------------------------------------------------------------
 // 1. The bedroom fan.
 // The sound at Sam's window was a noise loop gated by a speech-like "chatter" envelope whose
 // phase was the audio clock times a wandering rate. The real modulation frequency therefore
 // grew with the clock (about 2,000 rad/s ten minutes in), so by the time a player reaches the
 // friends' houses the gain jumped every frame: a stutter heard as a glitching fan. The phase is
 // now accumulated, the window carries an ordinary steady fan, and the TV is in the front room.
 function chatterStats(kind,T0){const ctx=fakeAudioContext();ctx.currentTime=T0;const audio=createAudio({context:ctx,random:seeded(7)});audio.ensure();audio.setEnabled(true);
  const levels=[];for(let i=0;i<900;i++){ctx.currentTime+=DT;audio.update(DT,{...NIGHT,listener:{x:0,y:1.5,z:0},forward:{x:0,z:-1},sources:[{id:kind,kind,pos:{x:1,y:1.2,z:-2},level:1}]});levels.push(audio.loops.get(kind).gate.level);}
  let ext=0,on=0,jump=0;for(let i=2;i<levels.length;i++){const [a,b,c]=[levels[i-2],levels[i-1],levels[i]];if(a>0&&b>0&&c>0){on+=DT;if((b-a)*(c-b)<0)ext++;jump=Math.max(jump,Math.abs(c-b));}}
  return {rate:+(ext/Math.max(on,1e-3)).toFixed(2),jump:+jump.toFixed(3),on:+on.toFixed(1)};}
 check('human playtest (fan): the voices-through-a-wall gate keeps a speech rate however long the game has run',()=>{
  const out={};for(const kind of ['tv','radio'])for(const T0 of [5,900,3600]){const s=chatterStats(kind,T0);out[kind+'@'+T0]=s;assert.ok(s.on>2,kind+' never spoke at '+T0);
   assert.ok(s.rate<8,`${kind} at ${T0}s: ${s.rate} level turns per second (stutter)`);assert.ok(s.jump<.2,`${kind} at ${T0}s: frame jump ${s.jump}`);}
  for(const kind of ['tv','radio']){const r=[5,900,3600].map(T=>out[kind+'@'+T].rate);assert.ok(Math.max(...r)<Math.min(...r)*1.6+.5,kind+' rate drifts with the clock '+r);}
  metrics['fan/tv chatter (turns per second at 5 s, 15 min, 1 h)']=[5,900,3600].map(T=>out['tv@'+T].rate);});
 function fanRun(ctx,audio,frames,{listener,forward=()=>({x:0,z:-1}),present=()=>true,fan={x:0,y:1.2,z:0}}){const loop=()=>audio.loops.get('fan'),seen=[];
  for(let i=0;i<frames;i++){ctx.currentTime+=DT;const L=listener(i);audio.update(DT,{...NIGHT,listener:L,forward:forward(i),sources:present(i)?[{id:'fan',kind:'fan',pos:fan,level:1}]:[]});
   const l=loop();if(l)seen.push({out:l.out.gain.target,pan:l.pan.pan.target,present:present(i),dist:Math.hypot(L.x-fan.x,L.z-fan.z)});}
  return seen;}
 check('human playtest (fan): an ordinary steady fan at the window, no gate, no level change while you stand still',()=>{
  const ctx=fakeAudioContext(),audio=createAudio({context:ctx,random:seeded(3)});audio.ensure();audio.setEnabled(true);ctx.currentTime=840;
  const seen=fanRun(ctx,audio,180,{listener:()=>({x:0,y:1.5,z:1.5})}).slice(10),l=audio.loops.get('fan');
  assert.equal(l.steady,true);assert.equal(l.gate,undefined,'fan must not be gated');assert.ok(seen[0].out>0,'fan silent');
  assert.ok(Math.max(...seen.map(s=>s.out))-Math.min(...seen.map(s=>s.out))<1e-9,'fan level moved while standing still');});
 check('human playtest (fan): walking round and past the window, turning your head, the fan never jumps or flips ear to ear',()=>{
  const ctx=fakeAudioContext(),audio=createAudio({context:ctx,random:seeded(4)});audio.ensure();audio.setEnabled(true);ctx.currentTime=900;
  // a slow circle at 1.2-3 m, then straight past the glass at 25 cm, walking pace, head sweeping
  const circle=fanRun(ctx,audio,360,{listener:i=>{const a=i/360*Math.PI*2,r=2.1+.9*Math.sin(i/40);return {x:Math.sin(a)*r,y:1.5,z:Math.cos(a)*r};},forward:i=>({x:Math.sin(i*.07),z:-Math.cos(i*.07)})});
  const past=fanRun(ctx,audio,120,{listener:i=>({x:-4+i*DT*2,y:1.5,z:.25})});
  let dPan=0,dOut=0;for(const run of [circle,past])for(let i=1;i<run.length;i++){dPan=Math.max(dPan,Math.abs(run[i].pan-run[i-1].pan));dOut=Math.max(dOut,Math.abs(run[i].out-run[i-1].out)/Math.max(run[i-1].out,1e-4));}
  assert.ok(dPan<.12,'pan jump per frame '+dPan.toFixed(3));assert.ok(dOut<.12,'level jump per frame '+dOut.toFixed(3));metrics['fan max pan change per frame']=+dPan.toFixed(3);});
 check('human playtest (fan): in and out of range twenty times, pause/resume, checkpoint and replay keep one fan that fades, never cuts',()=>{
  const ctx=fakeAudioContext(),audio=createAudio({context:ctx,random:seeded(5)});audio.ensure();audio.setEnabled(true);ctx.currentTime=600;
  fanRun(ctx,audio,600,{listener:()=>({x:0,y:1.5,z:1.6}),present:i=>Math.floor(i/15)%2===0});const first=audio.loops.get('fan');
  audio.setEnabled(false);ctx.currentTime+=5;audio.setEnabled(true);fanRun(ctx,audio,30,{listener:()=>({x:0,y:1.5,z:1.6})});
  audio.reset();fanRun(ctx,audio,60,{listener:()=>({x:0,y:1.5,z:1.6})});// Continue to a checkpoint / Start over
  assert.equal(audio.loops.get('fan'),first,'fan emitter was recreated');assert.equal([...audio.loops.keys()].filter(k=>k==='fan').length,1);
  const ev=first.out.gain.events;assert.equal(ev.filter(e=>e[0]==='set').length,0,'fan level was cut instantly');
  assert.ok(ev.filter(e=>e[0]==='target'&&e[1]===0).every(e=>e[3]>=.02),'fan faded too fast');assert.ok(first.out.gain.target>0,'fan did not come back');});
 {h.jump('jamie');advance(.3);const s=h.chapter.sources,fan=s.find(x=>x.id==='fan'),tv=s.find(x=>x.id==='tv'),glass=h.chapter.windows.sam.glass;
  check('human playtest (fan): Sam\'s fan is at his bedroom window all night; his dad\'s TV is in the front of the house',()=>{
   assert.ok(fan&&fan.kind==='fan');assert.ok(Math.hypot(fan.pos.x-glass.x,fan.pos.z-glass.z)<.01);assert.ok(tv&&Math.hypot(tv.pos.x-glass.x,tv.pos.z-glass.z)>3,'TV still at the bedroom window');
   for(const sec of ['oak','retrace']){h.jump(sec);advance(.2);assert.ok(h.chapter.sources.some(x=>x.id==='fan'),'no fan at '+sec);}
   element('restart').onclick();advance(.1);assert.equal(h.chapter.sources.length,0);});}

 // ---------------------------------------------------------------------------------------------
 // 2. The porch flag: it flew from its pole tip back toward the house, through its own pole, with
 // the canton at the bottom (an upside-down flag). The hoist now runs down the angled pole and the
 // cloth flies outward, canton at the top beside the pole.
 h.place(232,-2,0);advance(1.2);
 check('human playtest (flag): flies out from its angled pole, away from the house, upright, canton top-hoist',()=>{
  const F=h.ambient.flag;assert.ok(F,'no porch flag');h.scene.updateMatrixWorld(true);const P=F.house;
  const out=(()=>{const a=P.toWorld(0,P.front),b=P.toWorld(0,P.front+1);return new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();})();
  const fly=new THREE.Vector3(1,0,0).transformDirection(F.tip.matrixWorld),up=new THREE.Vector3(0,1,0).transformDirection(F.tip.matrixWorld);
  const p0=new THREE.Vector3(0,-.9,0).applyMatrix4(F.pole.matrixWorld),p1=new THREE.Vector3(0,.9,0).applyMatrix4(F.pole.matrixWorld),axis=p1.clone().sub(p0).normalize();
  assert.ok(fly.dot(out)>.6,'flag flies toward the house '+fly.dot(out).toFixed(2));assert.ok(up.y>.5,'flag not upright');assert.ok(up.dot(axis)>.98,'hoist not along the pole');assert.ok(axis.dot(out)>.3&&axis.y>.5,'pole should angle up and out');
  const pos=F.cloth.geometry.attributes.position,v=new THREE.Vector3(),seg=new THREE.Line3(p0,p1),q=new THREE.Vector3();let worstPole=9,worstBack=9;
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(F.cloth.matrixWorld);if(F.base[i*3]>.08)worstPole=Math.min(worstPole,seg.closestPointToPoint(v,true,q).distanceTo(v));worstBack=Math.min(worstBack,v.clone().sub(p0).dot(out));}
  assert.ok(worstPole>.035,'cloth passes through the pole '+worstPole.toFixed(3));assert.ok(worstBack>-.02,'cloth reaches back past the porch beam '+worstBack.toFixed(3));
  const img=F.cloth.material.map.image,px=(x,y)=>Array.from(img.data.slice((y*img.width+x)*4,(y*img.width+x)*4+3));
  const top=px(3,img.height-2),bottom=px(3,1),fly1=px(img.width-3,img.height-2);
  assert.ok(top[2]>top[0],'canton not at the top by the hoist');assert.ok(bottom[0]>bottom[2],'canton at the bottom (upside down)');assert.ok(fly1[0]>fly1[2],'canton on the fly side');});

 // ---------------------------------------------------------------------------------------------
 // 3. Basketball hoops. The curbside portable hoop faced along the curb, its back to the street,
 // the pole between a rider and the rim. Every hoop is now checked against where it is played.
 check('human playtest (hoop): every hoop faces where it is played; pole or wall mount behind the board',()=>{
  const hoops=W.hoops||[];let portable=0,garage=0;
  for(const H of hoops){if(H.kind==='portable'){portable++;const g=H.group,u=g.userData.hoop,toW=l=>new THREE.Vector3(...l).applyAxisAngle(Y,g.rotation.y).add(g.position);
    const board=toW(u.board),rim=toW(u.rim),pole=toW(u.pole),road=groundPoint(H.d,0),play=new THREE.Vector3(road.x-board.x,0,road.z-board.z).normalize();
    assert.ok(rim.clone().sub(board).dot(play)>.2,'portable rim faces away from the street');assert.ok(pole.clone().sub(board).dot(play)<-.2,'pole between the street and the rim');
    const back=toW([0,0,-1]),L=h.nav.locate(back.x,back.z);assert.ok(Math.abs(L.lat)<6.35,'base out onto the sidewalk '+L.lat.toFixed(2));}
   else{garage++;const P=H.plan,w=o=>{const p=P.toWorld(o.x,o.z);return new THREE.Vector3(p.x,0,p.z);},b=w(H.board),r=w(H.rim),m=w(H.mount),play=w(H.play).sub(b).normalize();
    assert.ok(r.clone().sub(b).dot(play)>.15,'garage rim faces the house');assert.ok(m.clone().sub(b).dot(play)<0,'mount in front of the board');}}
  assert.ok(portable>=1&&garage>=2,`hoops found: ${portable} portable, ${garage} garage`);metrics['hoops checked']={portable,garage};});

 // ---------------------------------------------------------------------------------------------
 // 4. The old oak. After the oak conversation the player turns round and rides off. Jamie and
 // Sam, stopped about 1.2 m apart, each turned in place to follow and each fell inside the other's
 // "something ahead" cone; with nothing to go, they also stopped turning, and both waited for the
 // other forever. (A player riding back within ten metres switched them to a side slot that
 // ignored the cone, which is why the second attempt worked.) The friend further along the trail
 // now goes first, a held-up friend keeps walking the bike round, and a stall walks the bike out.
 const M1=(d,l)=>{const p=groundPoint(d,l);return [p.x,p.z];},line1=(d0,d1,l,st=15)=>{const o=[];const n=Math.ceil(Math.abs(d1-d0)/st);for(let i=1;i<=n;i++)o.push(M1(d0+(d1-d0)*i/n,l));return o;};
 const pd=()=>h.nav.locate(h.roam.x,h.roam.z).d,until=(fn,max)=>{let ok=false;advance(max,()=>{if(fn()){ok=true;return false;}});return ok;};
 const rideTo=(pts,max=90)=>{h.drive(pts,{r:2.6});const ok=until(()=>!h.driving,max);h.stopDriving();advance(1.2);return ok;};
 const standAt=(q,face)=>{const r=h.night.roam,a=Math.atan2(face[0]-q[0],-(face[1]-q[1]));h.placePlayer({x:q[0],z:q[1],a,mode:'walk',bike:{x:r.x,z:r.z,a:r.a}});advance(.2);};
 // Ride off toward Briarwood and watch: when does each friend set off, how far behind do they get.
 function rideOff(seconds=25){const cs=h.chapter.companions.all,p0=cs.map(c=>[c.bx,c.bz]),set=cs.map(()=>null);let t=0,worst=0;
  h.drive(line1(pd(),880,-1.2),{r:2.6,stop:false});
  advance(seconds,()=>{t+=DT;cs.forEach((c,i)=>{if(set[i]===null&&Math.hypot(c.bx-p0[i][0],c.bz-p0[i][1])>1)set[i]=+t.toFixed(1);worst=Math.max(worst,Math.hypot(c.bx-h.roam.x,c.bz-h.roam.z));});});
  h.stopDriving();release('KeyW');const gaps=cs.map(c=>+Math.hypot(c.bx-h.roam.x,c.bz-h.roam.z).toFixed(1));return {set,gaps,worst:+worst.toFixed(1),follow:cs.map(c=>c.follow),rode:+(1137-pd()).toFixed(1)};}
 const followed=(r,label)=>{assert.ok(r.rode>60,label+': player did not get away '+JSON.stringify(r));assert.ok(r.set.every(s=>s!==null&&s<=4.5),label+': a friend did not set off '+JSON.stringify(r));
  assert.ok(r.gaps.every(g=>g<14),label+': left behind '+JSON.stringify(r));assert.ok(r.follow.every(f=>f==='ride'),label+': follow state '+JSON.stringify(r));};
 // The configuration captured from the failing run (positions and headings at the oak).
 function capturedOak(){h.jump('retrace');advance(.1);const comp=h.chapter.companions,{jamie,sam}=comp.list;
  h.placePlayer({x:244.60,z:-1033.68,a:.09,mode:'ride',speed:0});comp.putRiding(jamie,245.76,-1033.02,.39,0);comp.putRiding(sam,245.31,-1031.32,.46,0);
  for(const c of [jamie,sam]){c.follow='ride';c.sOn=0;c.formationLag=2.8;c.formationSide=1.5;}jamie.slot=0;sam.slot=3;
  comp.trail.reset();for(let d=1060;d<=1137.6;d+=.4){const p=groundPoint(d,-1+.43*(d-1060)/77.6);comp.trail.push(p.x,p.z);}advance(1);}
 const oakRuns={};
 for(const [key,hold] of [['KeyD',3.6],['KeyA',3.6]]){capturedOak();press(key);advance(hold);release(key);const r=rideOff();oakRuns['captured '+key]=r;
  check(`human playtest (oak): the captured stuck configuration, turning ${key==='KeyD'?'right':'left'} and riding off, both follow on the first attempt`,()=>followed(r,'captured'));}
 // The natural way there: Sam out of his side door, everyone to the oak, the conversation, then go.
 function naturalOak({stopD=1135.4,lat=-.99,wait=5.2,dismount=false}={}){
  h.jump('sam');advance(1);const sw=h.chapter.windows.sam;standAt([sw.stand.x,sw.stand.z],[sw.glass.x,sw.glass.z]);tap('KeyF');until(()=>C1().objective==='Wait by Sam’s garage.',60);
  const sd=h.chapter.sideDoor.outside;standAt([sd.x+1.5,sd.z+1],[sd.x,sd.z]);until(()=>C1().sam.follow==='ride',60);
  {const r=h.night.roam;h.placePlayer({x:r.x,z:r.z,a:r.a,mode:'ride',speed:0});advance(.3);}advance(wait);press('KeyW');rideTo(line1(1000,stopD,lat,20),70);release('KeyW');press('KeyS');advance(1.5);release('KeyS');
  if(dismount){tap('KeyF');until(()=>h.night.state==='c1-walk',4);}
  return until(()=>C1().flags.oakTalk,40);}
 const variants={
  'leaving straight after the conversation (turn round in place)':()=>{until(()=>C1().phase==='retrace',90);press('KeyD');advance(3.6);release('KeyD');},
  'waiting several seconds, then leaving':()=>{until(()=>C1().phase==='retrace',90);advance(7);press('KeyA');advance(3.6);release('KeyA');},
  'getting back on the bike before the conversation has finished':()=>{advance(6);tap('KeyF');until(()=>h.night.state==='c1-ride',4);press('KeyD');advance(3.6);release('KeyD');until(()=>C1().phase==='retrace',90);},
  'turning round wide through the cul-de-sac before leaving':()=>{until(()=>C1().phase==='retrace',90);press('KeyW');press('KeyD');advance(4);release('KeyD');},
 };
 for(const [label,leave] of Object.entries(variants)){const started=naturalOak({dismount:label.startsWith('getting back')});leave();const r=rideOff();oakRuns[label]=r;
  check('human playtest (oak): first attempt, '+label,()=>{assert.ok(started,'the oak conversation never started');assert.equal(C1().phase,'retrace');followed(r,label);});}
 // Checkpoint restore and replay go through the same states.
 for(const section of ['oak','retrace']){localStorage.setItem('lastlight.chapter1',JSON.stringify({section}));element('to-title').onclick();element('continue').onclick();advance(.5);
  if(section==='oak'){press('KeyW');rideTo(line1(1112,1134,-1),40);release('KeyW');press('KeyS');advance(1.5);release('KeyS');until(()=>C1().phase==='retrace',90);}
  if(section==='oak'){press('KeyD');advance(3.6);release('KeyD');}const r=rideOff();oakRuns['continue '+section]=r;check(`human playtest (oak): after Continue from the ${section} checkpoint, both follow on the first attempt`,()=>followed(r,'continue '+section));}
 element('restart').onclick();advance(.2);
 check('human playtest (oak): Start over clears the companions\' trail and stall state',()=>{for(const c of h.chapter.companions.all){assert.equal(c.active,false);assert.equal(c.stall,0);assert.equal(c.unstick,0);}assert.equal(h.chapter.companions.trail.pts.length,0);});
 capturedOak();press('KeyD');advance(3.6);release('KeyD');{const r=rideOff();oakRuns['after replay']=r;check('human playtest (oak): after Start over, the captured configuration still follows on the first attempt',()=>followed(r,'replay'));}
 metrics['oak follow runs (seconds to set off, final gaps m)']=Object.fromEntries(Object.entries(oakRuns).map(([k,r])=>[k,{set:r.set,gaps:r.gaps,worst:r.worst}]));
}
