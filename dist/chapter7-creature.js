// Shared Chapter Seven / Eight retrieval hunter. Procedural, articulated reference-led model.
// The existing semantic adapter owns state, sockets and optional GLB replacement. Anatomy, materials,
// continuous surface detail and quadrupedal locomotion are authored in astra-hunter.js and this pose layer.
// Frame: the model faces -Z in its own space (the game's forward for people: heading a looks along (sin a, -cos a)),
// +Y up, +X its right hand side; root.rotation.y = -heading, as for rig.js people.
import * as THREE from './three.module.js';
import {parseCreature} from './creature-asset.js';
import {buildHunter} from './astra-hunter.js';

export const HUNTER_ID='chapter7_hunter';

// The replacement contract. Every field has a working default for the stand-in.
export const HUNTER_ASSET={
 url:null,                       // e.g. './assets/chapter7/hunter.glb' (relative to dist/). null: the stand-in
 scale:1,                        // model units to metres, applied after import
 yaw:0,                          // radians added so the model faces -Z
 groundOffset:0,                 // metres added after the lowest vertex is put on the ground
 height:2.3,                     // standing height in metres (head top): the AI's eye height is 0.88 of it
 radius:.42,                     // collision radius standing; low it is radius*1.35
 // bone names in the asset (sockets are attached to these). grab is the hand that takes hold of someone.
 bones:{hips:'hips',head:'head',handL:'hand_l',handR:'hand_r',footL:'foot_l',footR:'foot_r',grab:'hand_r'},
 // semantic state -> clip name in the asset
 clips:{idle:'Idle',walk:'Walk',stalk:'Stalk',run:'Run',crawl:'Crawl',crouch:'Crouch',alert:'Alert',peek:'Peek',lunge:'Lunge',
  attack:'Attack',grab:'Grab',drag:'Drag',hit:'Hit',retreat:'Retreat'},
 // the ground speed (m/s) each locomotion clip was authored at, so its playback rate follows the real speed
 speeds:{walk:1.1,stalk:.8,run:5.2,crawl:3.4,drag:1.6,retreat:1.0},
 // if a clip is missing, play this state's clip instead (chains are followed; idle is the last resort)
 fallback:{stalk:'walk',run:'crawl',crawl:'run',alert:'idle',peek:'crouch',crouch:'idle',lunge:'attack',hit:'attack',
  grab:'attack',drag:'walk',retreat:'walk',attack:'idle',walk:'idle'},
};
export const HUNTER_STATES=['idle','walk','stalk','run','crawl','crouch','alert','peek','lunge','attack','grab','drag','hit','retreat'];
const LOCO={walk:1,stalk:1,run:1,crawl:1,drag:1,retreat:1};

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const Y=new THREE.Vector3(0,1,0);
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_d=new THREE.Vector3(),_e=new THREE.Vector3(),_q=new THREE.Quaternion(),_m=new THREE.Matrix4();

// Two-bone IK in a plane: from root a toward target t with lengths l1,l2, the middle joint bent toward pole. out: mid.
function ik(a,t,l1,l2,pole,mid,end){_a.subVectors(t,a);let d=_a.length();const max=(l1+l2)*.999;if(d>max){_a.multiplyScalar(max/d);d=max;}if(d<1e-4){_a.set(0,-1e-3,0);d=1e-3;}
 end.copy(a).add(_a);const dir=_b.copy(_a).normalize(),c=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),along=l1*c,up=Math.sqrt(Math.max(0,l1*l1-along*along));
 const p=_c.copy(pole).sub(a);p.addScaledVector(dir,-p.dot(dir));if(p.lengthSq()<1e-8)p.set(0,0,-1).addScaledVector(dir,dir.z);p.normalize();
 mid.copy(a).addScaledVector(dir,along).addScaledVector(p,up);return mid;}

// ---- the stand-in -------------------------------------------------------------------------------------------------------------
// ---- the adapter ------------------------------------------------------------------------------------------------------------
export function createHunterModel({scene,asset=HUNTER_ASSET,loadBytes=null}={}){
 const A=asset,root=new THREE.Group();root.name=HUNTER_ID;root.visible=false;scene?.add(root);
 const body=new THREE.Group();body.name='hunter-body';root.add(body);
 const stand=buildHunter();body.add(stand.g);
 // sockets: plain Object3Ds the chapter can read (world positions) and attach things to
 const sockets={};for(const n of ['head','handL','handR','grab','chest','hips','footL','footR']){const o=new THREE.Object3D();o.name='hunter-socket-'+n;root.add(o);sockets[n]=o;}
 const perceptionOrigin=new THREE.Object3D();perceptionOrigin.name='hunter-perception-origin';root.add(perceptionOrigin);
 const H=A.height||2.3,sc=H/2.3;// (the stand-in is built for 2.3 m; a different height scales it)
 stand.g.scale.setScalar(sc);
 // lengths (stand-in, metres at 2.3 m)
 const L={thigh:.58,shin:.6,upper:.70,fore:.68,hand:.26,spine:.78,neck:.34,shoulder:.31,hip:.13};
 const api={id:HUNTER_ID,root,body,sockets,height:H,source:'stand-in',asset:A,loaded:false,error:null,
  x:0,z:0,y:0,heading:0,state:'idle',stateT:0,prevState:'idle',
  // what it is doing, set by whoever moves it (the AI or a staged beat):
  //  speed  ground speed m/s (sets the gait), low 0..1 (upright .. folded flat on knuckles), look: a world point the head
  //  points at, reach/reachL: world points the right/left hand go to (grab, hit, a doorframe), open 0..1 (the jaw),
  //  tilt: the head's slow roll, lunge 0..1, twitch 0..1 (fingers)
  drive:{speed:0,low:0,look:null,reach:null,reachL:null,open:0,tilt:0,lunge:0,twitch:.3,back:0},
  phase:0,breath:0,
  setState(s){if(!HUNTER_STATES.includes(s))s='idle';if(s!==api.state){api.prevState=api.state;api.state=s;api.stateT=0;playClip(s);}},
  place(x,z,a=api.heading,y=null){api.x=x;api.z=z;api.heading=a;if(y!=null)api.y=y;sync();},
  show(on=true){root.visible=on;},
  get visible(){return root.visible;},
  radius:()=>(A.radius||.42)*sc*(1+.35*api.drive.low),
  eye:(out=new THREE.Vector3())=>(api.source==='asset'?sockets.head:perceptionOrigin).getWorldPosition(out),
  update,reset,useAsset,
 };
 // ---- the stand-in, posed every frame -----------------------------------------------------------------------------------------
 const J={pelvis:new THREE.Vector3(),chest:new THREE.Vector3(),neck:new THREE.Vector3(),head:new THREE.Vector3(),shL:new THREE.Vector3(),shR:new THREE.Vector3(),
  elL:new THREE.Vector3(),elR:new THREE.Vector3(),wrL:new THREE.Vector3(),wrR:new THREE.Vector3(),hipL:new THREE.Vector3(),hipR:new THREE.Vector3(),
  knL:new THREE.Vector3(),knR:new THREE.Vector3(),anL:new THREE.Vector3(),anR:new THREE.Vector3(),toeL:new THREE.Vector3(),toeR:new THREE.Vector3()};
 const W={headYaw:0,headPitch:0,low:0,lean:0,eyeLow:0,eyeLean:0,eyePhase:0,lunge:0,hit:0,swipe:0,grab:0,open:0,tilt:0,stride:0,curl:.5,headLag:new THREE.Vector3()};
 const toLocal=(w,out)=>{root.updateMatrixWorld(true);return out.copy(w).applyMatrix4(_m.copy(root.matrixWorld).invert()).divideScalar(1);};
 function place(m,a,b){_d.subVectors(b,a);const l=_d.length();m.position.copy(a).divideScalar(sc);m.quaternion.setFromUnitVectors(Y,l>1e-6?_d.multiplyScalar(1/l):Y);m.scale.set(1,l/sc,1);}
 function poseStandIn(dt){const D=api.drive,st=api.state,t=api.breath;
  // posture: how folded it is, and the lunge / strike / grab weights, each eased (nothing snaps but the attacks)
  const lowWant=clamp(Math.max(D.low,st==='grab'||st==='hit'?.18:st==='alert'?.52:.82)+(st==='run'||st==='crawl'?.85:st==='crouch'||st==='peek'?.7:st==='drag'?.55:0),0,1);
  W.low=damp(W.low,lowWant,st==='run'||st==='lunge'?7:3.2,dt);
  W.lunge=damp(W.lunge,st==='lunge'?1:D.lunge,st==='lunge'?16:4,dt);
  W.hit=damp(W.hit,st==='hit'?1:0,st==='hit'?18:5,dt);W.swipe=st==='attack'?Math.min(1,W.swipe+dt*3.2):damp(W.swipe,0,4,dt);
  W.grab=damp(W.grab,(st==='grab'||st==='drag'||D.reach)?1:0,8,dt);W.open=damp(W.open,Math.max(D.open,st==='lunge'||st==='attack'||st==='hit'?.85:st==='alert'?.3:0),7,dt);
  const speed=Math.abs(D.speed),quad=W.low>.55;
  // gait phase: one cycle per stride (longer strides when it runs on its knuckles)
  const stride=quad?1.9:1.15;W.stride=damp(W.stride,speed>.05?1:0,6,dt);api.phase+=dt*speed/stride*Math.PI*2*(D.back?-1:1);const ph=api.phase;
  const lean=.30+W.low*1.55+W.lunge*.35;W.lean=damp(W.lean,lean,6,dt);
  // the pelvis: lower as it folds, a heavy bob in its step
  const hipH=(1.17+W.low*.04-W.lunge*.16)*sc,bob=(quad?.06:.035)*W.stride*Math.abs(Math.sin(ph))*sc;
  J.pelvis.set(0,hipH-bob+Math.sin(t*1.7)*.008*sc,W.lunge*.25*sc);
  const sp=_e.set(0,Math.cos(W.lean),-Math.sin(W.lean));// spine direction (up, tipping forward)
  J.chest.copy(J.pelvis).addScaledVector(sp,L.spine*sc*(1+Math.sin(t*1.1)*.012));
  // shoulders across the chest (the right hand is +x); a slow wrongness: the shoulders roll against the hips
  const roll=Math.sin(ph)*.1*W.stride+Math.sin(t*.37)*.04;
  J.shL.set(-L.shoulder*sc,0,0).applyAxisAngle(Y,roll).add(J.chest);J.shR.set(L.shoulder*sc,0,0).applyAxisAngle(Y,roll).add(J.chest);
  J.hipL.set(-L.hip*sc,0,0).add(J.pelvis);J.hipR.set(L.hip*sc,0,0).add(J.pelvis);
  // the neck goes forward out of the chest, long; the head keeps level and points at what it wants
  const nk=_d.copy(sp).lerp(_a.set(0,.35,-1).normalize(),.35+W.low*.55).normalize();J.neck.copy(J.chest).addScaledVector(sp,.06*sc);J.head.copy(J.neck).addScaledVector(nk,L.neck*sc);
  let yaw=0,pitch=0;if(D.look){toLocal(_b.set(D.look.x,D.look.y??0,D.look.z),_c);root.updateMatrixWorld(true);const hw=_a.copy(J.head);_c.sub(hw);
   yaw=clamp(Math.atan2(-_c.x,-_c.z),-1.95,1.95);pitch=clamp(Math.atan2(_c.y,Math.hypot(_c.x,_c.z)),-.9,.75);}
  else{yaw=Math.sin(t*.29)*.35*(1-W.stride);pitch=-.15;}
  // (it turns its head faster than a person, then holds it there)
  W.headYaw=damp(W.headYaw,yaw,st==='alert'?14:5,dt);W.headPitch=damp(W.headPitch,pitch,6,dt);W.tilt=damp(W.tilt,D.tilt+Math.sin(t*.21)*.18*(st==='idle'||st==='stalk'||st==='peek'?1:.3),2,dt);
  // feet: planted cycles under the hips (quad: the hind pair together-ish), a step forward and a lift
  const foot=(s,hip,out,toe)=>{const p=ph+(s<0?0:Math.PI)+(quad?(s<0?0:.6):0),sw=Math.cos(p),lift=Math.max(0,Math.sin(p));
   const reach=(quad?.55:.42)*W.stride*sc;out.set(hip.x+s*(quad?.08:.04)*sc,.09*sc+lift*(quad?.2:.13)*W.stride*sc,hip.z-sw*reach+(quad?.35:.05)*sc*W.low+W.lunge*.35*sc);
   if(st==='crouch'||st==='peek'){out.set(hip.x+s*.12*sc,.09*sc,hip.z+.15*sc);}toe.copy(out).add(_a.set(0,-.06*sc,-.22*sc));};
  foot(-1,J.hipL,J.anL,J.toeL);foot(1,J.hipR,J.anR,J.toeR);
  // hands: hanging (upright), on the ground (folded), reaching (grab/hit), swiping (attack)
  const hand=(s,sh,out)=>{const p=ph+(s<0?Math.PI:0)+(quad?.25:0),sw=Math.cos(p),lift=Math.max(0,Math.sin(p));
   const hang=_a.set(sh.x+s*.06*sc,Math.max(.12*sc,sh.y-(L.upper+L.fore)*.93*sc),sh.z+sw*.12*W.stride*sc+.05*sc);
   const ground=_b.set(sh.x+s*.12*sc,.14*sc+lift*.22*W.stride*sc,sh.z-.35*sc-sw*.62*W.stride*sc);
   out.copy(hang).lerp(ground,smooth((W.low-.25)/.5));
   if(st==='crouch'||st==='peek')out.set(sh.x+s*.18*sc,.05*sc,sh.z-.45*sc);
   // the lunge: both hands forward at chest height, wide
   if(W.lunge>.01)out.lerp(_c.set(sh.x+s*.18*sc,sh.y+.05*sc,sh.z-(L.upper+L.fore)*.95*sc),W.lunge);
   if(W.hit>.01)out.lerp(_c.set(sh.x+s*.14*sc,sh.y+.15*sc,sh.z-(L.upper+L.fore)*.9*sc),W.hit);
   if(s>0&&W.swipe>0){const k=Math.sin(Math.min(1,W.swipe)*Math.PI);out.lerp(_c.set(sh.x+(.9-1.8*W.swipe)*sc,sh.y-.1*sc,sh.z-.95*sc),k);}
   const tgt=s>0?D.reach:D.reachL;if(tgt&&W.grab>.01){toLocal(_c.set(tgt.x,tgt.y,tgt.z),_d);out.lerp(_d,W.grab);}};
  hand(-1,J.shL,J.wrL);hand(1,J.shR,J.wrR);
  // limbs by IK (elbows out and back, knees forward, a little too far for a person)
  ik(J.shL,J.wrL,L.upper*sc,L.fore*sc,_d.copy(J.shL).add(_e.set(-.7,-.2,.6)),J.elL,J.wrL);ik(J.shR,J.wrR,L.upper*sc,L.fore*sc,_d.copy(J.shR).add(_e.set(.7,-.2,.6)),J.elR,J.wrR);
  ik(J.hipL,J.anL,L.thigh*sc,L.shin*sc,_d.copy(J.hipL).add(_e.set(-.1,.2,-1)),J.knL,J.anL);ik(J.hipR,J.anR,L.thigh*sc,L.shin*sc,_d.copy(J.hipR).add(_e.set(.1,.2,-1)),J.knR,J.anR);
  // lay the segments
  const S=stand.S;place(S.thighL,J.hipL,J.knL);place(S.thighR,J.hipR,J.knR);place(S.shinL,J.knL,J.anL);place(S.shinR,J.knR,J.anR);place(S.footL,J.anL,J.toeL);place(S.footR,J.anR,J.toeR);
  place(S.upperL,J.shL,J.elL);place(S.upperR,J.shR,J.elR);place(S.foreL,J.elL,J.wrL);place(S.foreR,J.elR,J.wrR);place(S.spine,J.pelvis,J.chest);place(S.neck,J.chest,J.head);
  place(S.collarL,J.chest,J.shL);place(S.collarR,J.chest,J.shR);
  const slope=_e.copy(J.chest).lerp(J.head,.30);place(S.trapL,slope,J.shL);place(S.trapR,slope,J.shR);
  S.pelvis.position.copy(J.pelvis).divideScalar(sc);S.pelvis.rotation.set(-W.lean*.5,0,0);
  stand.ribs.position.copy(J.pelvis).lerp(J.chest,.68).divideScalar(sc);stand.ribs.quaternion.setFromUnitVectors(Y,_a.subVectors(J.chest,J.pelvis).normalize());stand.ribs.scale.set(1.12,1.34+Math.sin(t*1.7)*.025,1.05);
  for(const b of stand.blades){b.position.copy(J.chest).divideScalar(sc).add(_a.set(b.userData.s*.12,-.05,.11).applyQuaternion(stand.ribs.quaternion));b.quaternion.copy(stand.ribs.quaternion);}
  for(const j of stand.joints){const n=j.userData.n,v=n==='elbowL'?J.elL:n==='elbowR'?J.elR:n==='kneeL'?J.knL:n==='kneeR'?J.knR:n==='shoulderL'?J.shL:J.shR;j.position.copy(v).divideScalar(sc);}
  // hands: the palm along the forearm, fingers long, curled more when it holds something
  W.curl=damp(W.curl,W.grab>.5||W.hit>.5?1.05:quad?.25:.55+Math.sin(t*3.1)*.08*D.twitch,8,dt);
  for(const [s,wr,el] of [['l',J.wrL,J.elL],['r',J.wrR,J.elR]]){const h=stand.hands[s];h.g.position.copy(wr).divideScalar(sc);_a.subVectors(wr,el).normalize();if(quad&&W.grab<.2&&W.lunge<.2&&W.hit<.2)_a.set(0,-.15,-1).normalize();h.g.quaternion.setFromUnitVectors(Y,_a);
   for(let k=0;k<h.fingers.length;k++){const f=h.fingers[k],c=W.curl*(1+.12*Math.sin(t*2.3+k*1.7)*D.twitch);f.f.rotation.x=-c*.75;f.j.rotation.x=-c*.9;}}
  // head: at the top of the neck, its own yaw and pitch (in the body's frame), a slow roll
  stand.head.position.copy(J.head).divideScalar(sc);stand.head.rotation.set(W.headPitch*.9,W.headYaw,W.tilt,'YXZ');
  stand.jaw.rotation.x=-(.12+W.open*.72+Math.sin(t*5.3)*.02*W.open);
  // sockets (in root space): head, hands, the grab point just in front of the right palm, chest, hips, feet
  sockets.head.position.copy(J.head).add(_a.set(0,.05*sc,0));sockets.handL.position.copy(J.wrL);sockets.handR.position.copy(J.wrR);
  sockets.grab.position.copy(J.wrR).addScaledVector(_b.subVectors(J.wrR,J.elR).normalize(),.1*sc);sockets.chest.position.copy(J.chest);sockets.hips.position.copy(J.pelvis);sockets.footL.position.copy(J.anL);sockets.footR.position.copy(J.anR);
  // Preserve the accepted perception origin independently of the longer, lower visual neck.
  // Otherwise the new skull can put the sight ray inside the stair wall and silently disable an encounter.
  const eyeWant=clamp(D.low+(st==='run'||st==='crawl'?.85:st==='crouch'||st==='peek'?.7:st==='drag'?.55:0),0,1);
  W.eyeLow=damp(W.eyeLow,eyeWant,st==='run'||st==='lunge'?7:3.2,dt);W.eyeLean=damp(W.eyeLean,.32+W.eyeLow*1.05+W.lunge*.35,6,dt);
  W.eyePhase+=dt*speed/(W.eyeLow>.55?1.9:1.15)*Math.PI*2*(D.back?-1:1);
  perceptionOrigin.position.set(0,(1.08-W.eyeLow*.42-W.lunge*.12-(W.eyeLow>.55?.06:.035)*W.stride*Math.abs(Math.sin(W.eyePhase))+Math.sin(t*1.7)*.008)*sc,W.lunge*.25*sc);
  _e.set(0,Math.cos(W.eyeLean),-Math.sin(W.eyeLean));perceptionOrigin.position.addScaledVector(_e,(.7*(1+Math.sin(t*1.1)*.012)+.06)*sc);
  _d.copy(_e).lerp(_a.set(0,.35,-1).normalize(),.35+W.eyeLow*.55).normalize();perceptionOrigin.position.addScaledVector(_d,.3*sc).y+=.05*sc;
 }
 // ---- a replacement asset (optional) -------------------------------------------------------------------------------------------
 let mixer=null,actions={},current=null,bones={},assetRoot=null;
 function clipFor(s){const seen=new Set();let k=s;while(k&&!seen.has(k)){seen.add(k);if(actions[k])return actions[k];k=A.fallback?.[k];}return actions.idle||null;}
 function playClip(s){if(!mixer)return;const a=clipFor(s);if(!a||a===current)return;a.reset().setEffectiveWeight(1).fadeIn(.18).play();if(current)current.fadeOut(.18);current=a;current.userData={state:s};}
 async function useAsset(buffer,opts={}){// buffer: an ArrayBuffer of a .glb (or opts.parsed: the reader's result)
  const C=opts.parsed||await parseCreature(buffer,opts);assetRoot=C.root;assetRoot.name='hunter-asset';
  const inner=new THREE.Group();inner.add(assetRoot);inner.rotation.y=A.yaw||0;inner.scale.setScalar(A.scale||1);body.add(inner);
  // the lowest point on the ground, centred on the root
  inner.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(assetRoot);inner.position.set(-(box.min.x+box.max.x)/2,-box.min.y+(A.groundOffset||0),-(box.min.z+box.max.z)/2);
  bones={};for(const [k,n] of Object.entries(A.bones||{}))if(n&&C.bones[n])bones[k]=C.bones[n];
  mixer=new THREE.AnimationMixer(assetRoot);actions={};const byName=new Map(C.clips.map(c=>[c.name,c]));
  for(const [s,n] of Object.entries(A.clips||{})){const c=byName.get(n);if(c)actions[s]=mixer.clipAction(c);}
  stand.g.visible=false;api.source='asset';api.loaded=true;api.missing=HUNTER_STATES.filter(s=>!actions[s]);current=null;playClip(api.state);
  api.assetInfo={...C.info,clips:C.clips.map(c=>c.name),bones:Object.keys(bones),size:{x:+(box.max.x-box.min.x).toFixed(2),y:+(box.max.y-box.min.y).toFixed(2),z:+(box.max.z-box.min.z).toFixed(2)}};return api;}
 function poseAsset(dt){const D=api.drive;if(current&&LOCO[api.state]){const base=A.speeds?.[current.userData?.state]||A.speeds?.[api.state]||1;current.timeScale=clamp(Math.abs(D.speed)/base,.25,2.5)*(D.back?-1:1);}
  mixer.update(dt);assetRoot.updateMatrixWorld(true);root.updateMatrixWorld(true);const inv=_m.copy(root.matrixWorld).invert();
  for(const k of ['head','handL','handR','hips','footL','footR']){const b=bones[k];if(b)sockets[k].position.copy(b.getWorldPosition(_a).applyMatrix4(inv));}
  const gb=bones.grab||bones.handR;if(gb)sockets.grab.position.copy(gb.getWorldPosition(_a).applyMatrix4(inv));
  if(!bones.head)sockets.head.position.set(0,H*.9,-.1);sockets.chest.position.lerpVectors(sockets.hips.position,sockets.head.position,.7);}
 function sync(){root.position.set(api.x,api.y,api.z);root.rotation.set(0,-api.heading,0);}
 function update(dt){api.stateT+=dt;api.breath+=dt;sync();root.updateMatrixWorld(true);if(api.source==='asset'&&mixer)poseAsset(dt);else poseStandIn(dt);root.updateMatrixWorld(true);}
 function reset(){api.drive.speed=0;api.drive.low=0;api.drive.look=null;api.drive.reach=null;api.drive.reachL=null;api.drive.open=0;api.drive.tilt=0;api.drive.lunge=0;api.drive.back=0;api.state='idle';api.stateT=0;
  W.low=0;W.eyeLow=0;W.lunge=0;W.hit=0;W.swipe=0;W.grab=0;W.open=0;root.visible=false;if(mixer){for(const a of Object.values(actions))a.stop();current=null;playClip('idle');}}
 // the asset, if one is configured: loaded in the background like the drain creature; the stand-in until then (and if it fails)
 api.ready=(async()=>{if(!A.url)return api;try{let buf;
   if(loadBytes)buf=await loadBytes(A.url);else{const url=new URL(A.url,import.meta.url);if(url.protocol==='file:'){const fs=await import('node:fs');const b=fs.readFileSync(url);buf=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}else{const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);buf=await r.arrayBuffer();}}
   await useAsset(buf);}catch(e){api.error=String(e&&e.message||e);stand.g.visible=true;api.source='stand-in';}return api;})();
 poseStandIn(0);return api;
}
