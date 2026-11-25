// DEV benchmark (?supportcast): the Prologue's two supporting characters as authored Blender characters, driven by the
// game's own controllers. Nothing loads without the flag.
//   Jamie's mother (chr.jamie-mother): friends.js updateMom stays the source of truth for when she appears, where she
//     walks, which way she faces, when she goes back in and when the door closes (and the door's sounds). This module
//     reads that state every frame and gives her an adult body, a face and a performance: anticipation at the door,
//     a planted walk (the clip's phase follows the distance she actually moves), a small wave in the game's own wave
//     window, a silent call (no audio, no subtitle: she has no line), waiting with her weight shifting, her eyes and head
//     on Jamie, blinks, the walk back in.
//   The driveway basketball kid (chr.hoop-kid): ambient.js updateKid stays the source of truth for the dribble, the shot,
//     the ball's flight, the bounce back and the look at the passing boys. This module plays the matching clip at the
//     controller's own phase and puts his hand on the ball the controller places.
// The original procedural meshes are hidden (their groups keep the controllers' visibility, so nothing else changes:
// no duplicate body, no duplicate shadow). Prologue only, as the other benchmarks: past it the originals show.
//   ;  (Semicolon)  AUTHORED <-> ORIGINAL (same frame, same camera)
// (Keys checked against the game, its DEV tools and the other benchmarks: Semicolon is bound nowhere.)
import * as THREE from './three.module.js';
import {instantiate} from './asset-library.js';
import {MAIN} from './terrain.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const _a=V(),_b=V(),_c=V(),_d=V(),_q=Q(),_q2=Q(),_m=new THREE.Matrix4();

// ------------------------------------------------------------------------------------------------ bone helpers
// Every procedural adjustment is a rotation in world space applied on top of what the clip left, so nothing depends on
// a bone's roll.
function worldTurn(bone,delta){const pw=bone.parent.getWorldQuaternion(Q());const w=bone.getWorldQuaternion(Q());bone.quaternion.copy(pw.invert().multiply(delta.multiply(w)));bone.updateWorldMatrix(false,true);}
function aimBone(bone,fromDir,toDir,weight=1){const d=Q().setFromUnitVectors(fromDir.clone().normalize(),toDir.clone().normalize());if(weight<1)d.slerp(Q(),1-weight);worldTurn(bone,d);}
// two-bone IK: move the end of a (upper, lower, end) chain to target, keeping the current bend plane
function reach(a,b,c,target){
 const pa=a.getWorldPosition(V()),pb=b.getWorldPosition(V()),pc=c.getWorldPosition(V());
 const l1=pa.distanceTo(pb),l2=pb.distanceTo(pc);const ray=target.clone().sub(pa);const dist=clamp(ray.length(),Math.abs(l1-l2)+1e-4,l1+l2-1e-4);ray.normalize();
 const bend=pb.clone().sub(pa);let pole=bend.clone().addScaledVector(ray,-bend.dot(ray));
 // a straight limb has no bend plane: bend the way elbows and knees go (the character's back for an elbow, front for a knee)
 if(pole.lengthSq()<1e-8){const back=new THREE.Vector3(0,0,1).applyQuaternion(a.parent.getWorldQuaternion(Q()));pole=back.addScaledVector(ray,-back.dot(ray));if(pole.lengthSq()<1e-10)return;}pole.normalize();
 const x=(l1*l1-l2*l2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,l1*l1-x*x));const mid=pa.clone().addScaledVector(ray,x).addScaledVector(pole,h);
 const endQ=c.getWorldQuaternion(Q());
 aimBone(a,pb.clone().sub(pa),mid.clone().sub(pa));
 const nb=b.getWorldPosition(V()),nc=c.getWorldPosition(V());aimBone(b,nc.clone().sub(nb),target.clone().sub(nb));
 // keep the end bone's world orientation (a foot stays flat, a hand keeps its angle)
 const pw=c.parent.getWorldQuaternion(Q());c.quaternion.copy(pw.invert().multiply(endQ));c.updateWorldMatrix(false,true);}

// A clip set sampled by hand: each action paused at a time we choose, blended by weight (the mixer evaluates once).
function clipSet(inst){const acts=inst.actions,active=new Map();
 for(const a of Object.values(acts)){a.setLoop(THREE.LoopRepeat,Infinity);a.clampWhenFinished=true;}
 return {sample(list){// [[name, time (s), weight], ...]
   // (a paused action never reports isRunning(): which clips are active is tracked here, and a clip no longer wanted is
   // stopped, so it cannot keep blending in)
   const want=new Set();for(const [n,t,w] of list){const a=acts[n];if(!a||w<=1e-4)continue;want.add(n);if(!active.has(n)){a.reset();a.play();active.set(n,a);}a.paused=true;a.enabled=true;const d=a.getClip().duration;a.time=d>0?((t%d)+d)%d:0;a.setEffectiveWeight(w);}
   for(const [n,a] of [...active])if(!want.has(n)){a.stop();active.delete(n);}
   inst.mixer.update(0);},
  duration:n=>acts[n]?.getClip().duration||1,active:()=>[...active.keys()]};}

// Materials: hair cards keep their true coverage at a distance (the details benchmark's cut-out rule), skin a little
// warmer in the shadows (light passing through skin), eyes wet.
function tuneMaterials(inst){const seen=new Set();
 inst.model.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material)){if(seen.has(m))continue;seen.add(m);const n=m.name||'';
  if(/hair_cards/.test(n)){m.transparent=false;m.depthWrite=true;m.alphaTest=.5;m.side=THREE.DoubleSide;
   m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',`
    float scLod=log2(max(max(length(dFdx(vMapUv)),length(dFdy(vMapUv)))*512.,1e-4));
    float scIgn=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
    float scThr=mix(.5,.04+.92*scIgn,smoothstep(.3,1.6,scLod));
    if(diffuseColor.a<scThr)discard;`);};m.customProgramCacheKey=()=>'ll-sc-hair-cards';m.needsUpdate=true;}
  else if(/^hair$/.test(n)){m.transparent=false;m.alphaTest=0;}
  else if(/skin/.test(n)){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    reflectedLight.indirectDiffuse*=vec3(1.04,.98,.95);reflectedLight.directDiffuse+=reflectedLight.directDiffuse*vec3(.06,-.01,-.03);`);};m.customProgramCacheKey=()=>'ll-sc-skin';m.needsUpdate=true;}
  else if(/teeth/.test(n)){m.side=THREE.DoubleSide;}
  else if(/^eye$/.test(n)){m.roughness=.08;}}});}

// The game's ground under a world point (Oak Hollow's frame: the ground the riders and walkers use)
function groundAt(world,x,z){const p=MAIN.project(x,z);return world.groundY(p.u,p.v);}

// ------------------------------------------------------------------------------------------------ Jamie's mother
async function mother({world,friends,renderer}){
 const inst=await instantiate('chr.jamie-mother',{renderer});tuneMaterials(inst);
 const {root,bones}=inst,clips=clipSet(inst),mom=friends.mom,orig=mom.person.group;
 root.name='supportcast:jamie-mother';
 const B=n=>bones[n];const head=B('head'),neck=B('neck'),eyes=[B('eye_l'),B('eye_r')];
 const legs=[['thigh_l','calf_l','foot_l'],['thigh_r','calf_r','foot_r']].map(a=>a.map(B));
 const tail=[B('phys_ponytail_01'),B('phys_ponytail_02'),B('phys_ponytail_03')];
 // bind-pose directions (world, the character facing -Z in her root) for the head and eyes
 root.updateWorldMatrix(true,true);const fwd=new THREE.Vector3(0,0,-1);
 const local=b=>fwd.clone().applyQuaternion(b.getWorldQuaternion(Q()).invert());
 const headFwd=local(head),neckFwd=local(neck),eyeFwd=eyes.map(local);
 const S={mode:'',dist:0,last:null,wave:0,smile:0,call:0,expect:0,blinkT:2.2,blink:0,lookW:0,touch:0,turnFrom:0,clock:0,springs:tail.map(()=>({v:V(),o:V()})),inside:false};
 const face=inst.faceMeshes.length?{set:(k,v)=>{try{inst.setMorph(k,v);}catch{}}}:{set(){}};
 const meshes=[];orig.traverse(o=>{if(o.isMesh)meshes.push([o,o.visible]);});
 let enabled=false;
 function setEnabled(on){if(on===enabled)return;enabled=on;for(const [o,v] of meshes)o.visible=on?false:v;if(!on)root.visible=false;}
 function jamieHead(){const j=friends.list[0];const g=j.mode==='foot'?j.person.group:j.bike.group;return g.getWorldPosition(V()).add(_d.set(0,j.mode==='foot'?1.32:1.45,0));}
 function update(dt,ctx){
  if(!enabled){root.visible=false;return;}
  const vis=orig.visible&&mom.mode!=='waiting'&&mom.mode!=='gone';root.visible=vis;if(!vis){S.mode=mom.mode;S.last=null;S.dist=0;return;}
  S.clock+=dt;
  // place her exactly where the controller has her (its own ground height and facing)
  root.position.copy(orig.position);root.quaternion.copy(orig.quaternion);root.updateWorldMatrix(true,false);
  // walk phase from the distance actually covered (the planted foot does not slide)
  if(S.last)S.dist+=Math.hypot(root.position.x-S.last.x,root.position.z-S.last.z);S.last=(S.last||V()).copy(root.position);
  if(mom.mode!==S.mode){S.mode=mom.mode;S.modeT=0;if(mom.mode==='in')S.dist=0;}S.modeT=(S.modeT||0)+dt;
  const walkT=S.dist/1.30*clips.duration('walk'),t=mom.t,m=mom.mode;
  const list=[];
  if(m==='opening'){list.push(['door_open',Math.min(t,.6),1]);}
  else if(m==='out'||m==='in'){const k=sstep(0,.35,S.modeT);if(m==='out')list.push(['door_open',.6,1-k]);else list.push(['porch_wait',0,1-k]);list.push(['walk',walkT,k]);}
  else if(m==='porch'){const k=sstep(0,.45,t);list.push(['walk',walkT,1-k]);
   // the game's wave window (friends.js: smooth(t/.7)*(1-smooth((t-1.6)/.8))), then waiting
   const wv=t<2.4?1:0;if(wv)list.push(['porch_wave',t,k]);else{const k2=sstep(2.4,2.9,t);list.push(['porch_wave',2.4,k*(1-k2)],['porch_wait',t-2.4,k*k2]);}}
  clips.sample(list);root.updateWorldMatrix(true,true);
  // feet on the actual ground (the threshold step, the porch boards): two-bone IK per leg
  if(m==='out'||m==='in'||m==='opening'||m==='porch'){const g0=root.position.y;for(const [th,ca,ft] of legs){const p=ft.getWorldPosition(V());const g=groundAt(world,p.x,p.z),off=clamp(g-g0,-.12,.25);if(Math.abs(off)>.004){p.y+=off;reach(th,ca,ft,p);}}}
  // the head and eyes on Jamie (limited, eased), a little more when he is close
  const tgt=jamieHead(),hp=head.getWorldPosition(V()),dir=tgt.clone().sub(hp);const dist=dir.length();dir.normalize();
  const fwdW=_a.copy(fwd).applyQuaternion(root.quaternion);const yawOff=Math.atan2(fwdW.x*dir.z-fwdW.z*dir.x,fwdW.x*dir.x+fwdW.z*dir.z);
  const want=(m==='porch'?1:m==='out'?sstep(.5,1.5,S.modeT)*.7:0)*(Math.abs(yawOff)<1.9?1:0);S.lookW=damp(S.lookW,want,2.2,dt);
  if(S.lookW>.01){const cur=headFwd.clone().applyQuaternion(head.getWorldQuaternion(Q()));
   // clamp the turn to what a neck does (yaw 70 deg, pitch 25 deg)
   const lim=dir.clone();const h=Math.hypot(lim.x,lim.z);let pitch=Math.atan2(lim.y,h);pitch=clamp(pitch,-.44,.30);
   const yawC=clamp(yawOff,-1.2,1.2),base=Math.atan2(fwdW.x,-fwdW.z)*0;
   const yw=Math.atan2(fwdW.x,fwdW.z)-yawC*0;// world yaw of the wanted direction
   const ang=Math.atan2(dir.x,dir.z),use=Math.abs(yawOff)>1.2?Math.atan2(fwdW.x,fwdW.z)+Math.sign(yawOff)*1.2*-1:ang;
   const lim2=new THREE.Vector3(Math.sin(use)*Math.cos(pitch),Math.sin(pitch),Math.cos(use)*Math.cos(pitch));
   aimBone(neck,neckFwd.clone().applyQuaternion(neck.getWorldQuaternion(Q())),lim2,.35*S.lookW);
   aimBone(head,headFwd.clone().applyQuaternion(head.getWorldQuaternion(Q())),lim2,.55*S.lookW);
   for(let i=0;i<2;i++){const e=eyes[i];const ep=e.getWorldPosition(V());const ed=tgt.clone().sub(ep).normalize();const ef=eyeFwd[i].clone().applyQuaternion(e.getWorldQuaternion(Q()));
    const d=Q().setFromUnitVectors(ef,ed);const ang2=2*Math.acos(clamp(d.w,-1,1));if(ang2>.45)d.slerp(Q(),1-.45/ang2);d.slerp(Q(),1-S.lookW);worldTurn(e,d);}}
  // ponytail: three damped springs following the head (no collision; small)
  {let prev=head;for(let i=0;i<tail.length;i++){const b=tail[i],sp=S.springs[i];const wp=b.getWorldPosition(V());if(!sp.init){sp.o.copy(wp);sp.init=true;}
    const lag=sp.o.clone().sub(wp);sp.v.addScaledVector(lag,-38*dt).multiplyScalar(Math.exp(-6.5*dt));sp.o.add(sp.v.clone().multiplyScalar(dt)).addScaledVector(lag,-Math.min(1,dt*9));
    const off=sp.o.clone().sub(wp).multiplyScalar(.6);if(off.length()>.04)off.setLength(.04);
    const child=b.children.find(c=>c.isBone);if(child){const cp=child.getWorldPosition(V());aimBone(b,cp.clone().sub(wp),cp.clone().add(off).sub(wp),.8);}
    prev=b;}}
  // (measures for the test suite: the gaze error toward Jamie's head, the lower ankle's height above the ground)
  {const cur=headFwd.clone().applyQuaternion(head.getWorldQuaternion(Q()));S.gazeErr=S.lookW>.9?+(cur.angleTo(dir)*180/Math.PI).toFixed(1):null;
   let lo=1e9;for(const [,,ft] of legs){const p=ft.getWorldPosition(V());lo=Math.min(lo,p.y-groundAt(world,p.x,p.z));}S.ankle=+lo.toFixed(3);}
  // face: blinks; a silent call as she steps out and sees them (the story's 'Jamie's mom calls him in': no voice, no
  // caption); a warm smile through the wave and when he runs up; mild expectation while she waits
  S.blinkT-=dt;if(S.blinkT<=0){S.blink=.16;S.blinkT=2.4+((Math.sin(S.clock*12.9898)*43758.5453)%1+1)%1*3.4;}
  S.blink=Math.max(0,S.blink-dt);const bl=S.blink>0?Math.sin(Math.PI*(1-S.blink/.16)):0;
  const j=friends.list[0],jNear=j.mode==='foot'&&dist<14;
  const callW=m==='porch'?sstep(.05,.2,t)*(1-sstep(.95,1.15,t)):0;
  const syll=callW*(.5+.5*Math.sin(Math.min(1,t/1.1)*Math.PI*2.2-1.2));
  S.smile=damp(S.smile,(m==='porch'&&(t<2.6||jNear))?.62:m==='out'?.18:.12,2.5,dt);
  S.expect=damp(S.expect,m==='porch'&&t>6&&!jNear?.55:0,1.2,dt);
  face.set('eyeBlinkLeft',bl);face.set('eyeBlinkRight',bl);
  face.set('jawOpen',.32*syll);face.set('mouthFunnel',.18*syll);face.set('browInnerUp',.25*callW+.18*S.expect);
  face.set('mouthSmileLeft',S.smile*(1-callW*.6)+.08*S.expect);face.set('mouthSmileRight',S.smile*.92*(1-callW*.6));
  face.set('cheekSquintLeft',S.smile*.35);face.set('cheekSquintRight',S.smile*.3);
  face.set('mouthPressLeft',.35*S.expect);face.set('mouthPressRight',.3*S.expect);face.set('browOuterUpLeft',.2*callW);face.set('browOuterUpRight',.2*callW);
 }
 return {inst,root,update,setEnabled,get state(){return {...S,springs:undefined,mode:mom.mode,visible:root.visible};},meshes,clips};
}

// ------------------------------------------------------------------------------------------------ the hoop kid
async function hoopKid({world,ambient,renderer}){
 const H=ambient.hoopKid;if(!H)throw Error('ambient.js has no hoopKid hook');
 const inst=await instantiate('chr.hoop-kid',{renderer});tuneMaterials(inst);
 const {root,bones}=inst,clips=clipSet(inst),kid=H.kid,orig=kid.person.group,ball=H.ball;
 root.name='supportcast:hoop-kid';
 const B=n=>bones[n];const head=B('head'),neck=B('neck');
 const armR=[B('upperarm_r'),B('lowerarm_r'),B('hand_r')],armL=[B('upperarm_l'),B('lowerarm_l'),B('hand_l')];
 root.updateWorldMatrix(true,true);const fwd=new THREE.Vector3(0,0,-1);const headFwd=fwd.clone().applyQuaternion(head.getWorldQuaternion(Q()).invert());
 const meshes=[];orig.traverse(o=>{if(o.isMesh)meshes.push([o,o.visible]);});
 let enabled=false;const S={look:0,blinkT:1.7,blink:0,clock:0,grip:0};
 function setEnabled(on){if(on===enabled)return;enabled=on;for(const [o,v] of meshes)o.visible=on?false:v;if(!on)root.visible=false;}
 // the palm's contact point: a little in front of the hand bone's head, toward the fingers
 const palm=(hand,out)=>{const c=hand.children.find(b=>b.isBone&&/middle1/.test(b.name));return c?hand.getWorldPosition(out).lerp(c.getWorldPosition(_c),.75):hand.getWorldPosition(out);};
 function update(dt,ctx){
  if(!enabled){root.visible=false;return;}
  root.visible=orig.visible;if(!orig.visible)return;S.clock+=dt;
  root.position.copy(orig.position);root.quaternion.copy(orig.quaternion);root.updateWorldMatrix(true,false);
  const k=kid,T=.52,watching=ctx.distance>k.d-26&&ctx.distance<k.d+6&&ctx.state!=='intro';S.watching=watching;
  const list=[];
  if(k.phase==='dribble'){if(watching&&k.t>=3-1e-6)list.push(['hold',S.clock,1]);else list.push(['dribble',(k.t%T)/T*clips.duration('dribble'),1]);}
  else if(k.phase==='shoot')list.push(['shoot',k.t,1]);
  else list.push(['catch',k.t,1]);
  clips.sample(list);root.updateWorldMatrix(true,true);
  // hands on the ball the controller placed: the right hand while dribbling (when the ball is up at the hand), both
  // hands while shooting until the release (0.35 s) and when holding it
  const bp=ball.position,r=.12;let wR=0,wL=0;
  if(k.phase==='dribble'&&!(watching&&k.t>=3-1e-6)){const u=(k.t%T)/T;wR=1-sstep(.14,.30,u)*(1-sstep(.70,.86,u));}
  else if(k.phase==='shoot'){wR=wL=1-sstep(.33,.38,k.t);}
  else if(k.phase==='return'){const rel=k.t/1.3;wR=wL=sstep(.86,.98,rel);}
  else wR=wL=1;
  if(watching&&k.phase==='dribble'&&k.t>=3-1e-6){wR=1;wL=.8;}
  S.gapR=S.gapL=null;
  const hold=(arm,w,side)=>{if(w<.01)return;const hp=palm(arm[2],V());const want=bp.clone();const toward=hp.clone().sub(bp);toward.y*=.6;want.addScaledVector(toward.normalize(),r);const tgt=hp.clone().lerp(want,w);
   const wr=arm[2].getWorldPosition(V());tgt.add(wr.sub(hp));reach(arm[0],arm[1],arm[2],tgt);
   if(w>.99){const g=palm(arm[2],V()).distanceTo(bp)-r;if(side>0)S.gapR=+g.toFixed(3);else S.gapL=+g.toFixed(3);}};
  hold(armR,wR,1);hold(armL,wL,-1);
  // the look at the passing boys (the controller's own rule), eased
  S.look=damp(S.look,watching?1:0,3,dt);
  if(S.look>.01&&ctx.eye){const hp=head.getWorldPosition(V());const d=ctx.eye.clone().sub(hp).normalize();const cur=headFwd.clone().applyQuaternion(head.getWorldQuaternion(Q()));
   const f=_a.copy(fwd).applyQuaternion(root.quaternion);const yaw=Math.atan2(f.x*d.z-f.z*d.x,f.x*d.x+f.z*d.z);if(Math.abs(yaw)<1.3){aimBone(neck,cur.clone(),d,.3*S.look);aimBone(head,headFwd.clone().applyQuaternion(head.getWorldQuaternion(Q())),d,.5*S.look);}}
  S.blinkT-=dt;if(S.blinkT<=0){S.blink=.15;S.blinkT=2.8+((Math.sin(S.clock*7.13)*9137.5)%1+1)%1*3;}S.blink=Math.max(0,S.blink-dt);
  if(inst.faceMeshes.length){const bl=S.blink>0?Math.sin(Math.PI*(1-S.blink/.15)):0;try{inst.setMorph('eyeBlinkLeft',bl);inst.setMorph('eyeBlinkRight',bl);inst.setMorph('mouthSmileLeft',.25+.2*S.look);inst.setMorph('mouthSmileRight',.22+.2*S.look);}catch{}}
 }
 return {inst,root,update,setEnabled,get state(){return {phase:kid.phase,t:kid.t,visible:root.visible,look:S.look,gapR:S.gapR,gapL:S.gapL,watching:S.watching};},meshes,clips};
}

// ------------------------------------------------------------------------------------------------ mount
export async function mountInGame({scene,camera,renderer,world,friends,ambient,prologue=()=>true}){
 const label=document.createElement('div');label.id='supportcast-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 const place=()=>{let y=8;for(const id of ['bike-benchmark-label','house-benchmark-label','vegetation-benchmark-label','pavement-benchmark-label','streetprops-benchmark-label','details-benchmark-label','envrepair-benchmark-label']){const o=document.getElementById(id);if(o)y=Math.max(y,o.getBoundingClientRect().bottom+6);}label.style.top=Math.round(y)+'px';};
 label.textContent='SUPPORTING CAST (DEV): loading Jamie\'s mother and the driveway kid…';document.body.appendChild(label);place();
 const t0=performance.now(),errors=[],cast={};
 try{cast.mother=await mother({world,friends,renderer});scene.add(cast.mother.root);}catch(e){errors.push('mother: '+String(e?.message||e));console.error('supportcast mother:',e);}
 try{cast.kid=await hoopKid({world,ambient,renderer});scene.add(cast.kid.root);}catch(e){errors.push('kid: '+String(e?.message||e));console.error('supportcast kid:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 let mode='authored',active=null;
 function apply(){const on=mode==='authored'&&prologue();if(on===active)return;active=on;for(const c of Object.values(cast))c.setEnabled(on);updateLabel();}
 function setMode(m){mode=m==='original'?'original':'authored';active=null;apply();return mode;}
 addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='Semicolon')setMode(mode==='authored'?'original':'authored');});
 const tris=c=>{let n=0;c.inst.model.traverse(o=>{if(o.isMesh&&o.visible)n+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});return n;};
 function updateLabel(){place();const inP=prologue();const lines=[`SUPPORTING CAST (DEV) — ${mode==='authored'?(inP?'AUTHORED':'authored, but OUTSIDE THE PROLOGUE: originals shown'):'ORIGINAL (friends.js / ambient.js as before)'} · loaded in ${loadMs} ms`];
  for(const [k,c] of Object.entries(cast)){const i=c.inst.info;lines.push(`${i.id} v${i.version} · ${Math.round(i.triangles).toLocaleString()} tris · ${Object.keys(c.inst.bones).length} bones · ${i.clips.length} clips · ${i.morphTargets.length} face keys · ${(i.bytes/1048576).toFixed(1)} MB · ${c.root.visible?'IN VIEW':'hidden'}`);}
  if(errors.length)lines.push('ERRORS: '+errors.join(' | '));lines.push('; authored/original · original work (procedural Blender build) · approval A-22 open');
  label.textContent=lines.join('\n');label.style.color=errors.length?'#ff8a7a':'#e8e2d0';}
 let last=0;const loop=now=>{apply();if(now-last>700){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);apply();updateLabel();
 const api={cast,errors,loadMs,setMode,get mode(){return mode;},get active(){return !!active;},
  // called from the game's update (game.js), after friends.update and ambient.update, so the pose always matches the
  // controllers' state in the same frame (and QA stepping stays deterministic)
  update(dt,ctx){apply();if(!active)return;for(const c of Object.values(cast))c.update(dt,ctx);},
  tick(){apply();},THREE};
 window.__supportcast=api;return api;
}
