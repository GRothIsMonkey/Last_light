import * as THREE from './three.module.js';
import {LENGTH,chapters,memories,chapterAt,finale} from './story.js';
import {LATERAL_LIMIT,roadFrame,groundPoint,roadGrade,heading} from './route.js';
import {buildWorld,LOOKOUT} from './world.js';
import {createPerson,createBike,newPose,ridePose,applyPose,poseBike,headPos,BIKE,smooth} from './rig.js';
import {createFriends,localToStreet} from './friends.js';
import {CAST} from './cast.js';
import {createAmbient} from './ambient.js';
import {createAudio} from './audio.js';
import {createUI} from './ui.js';
import {createNostalgia} from './nostalgia.js';
import {createInteractions} from './interactions.js';
import {createEnding} from './ending.js';

const $=id=>document.getElementById(id), canvas=$('world');
const clamp=THREE.MathUtils.clamp,damp=THREE.MathUtils.damp;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){$('error').hidden=false;throw e;}
renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.06,390);scene.add(camera);
scene.fog=new THREE.FogExp2(0xe3ac8d,.008);
const hemi=new THREE.HemisphereLight(0xe8e3d3,0x68675d,2.0);scene.add(hemi);
const sunlight=new THREE.DirectionalLight(0xffd09b,2.7);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);Object.assign(sunlight.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:1,far:240});sunlight.shadow.bias=-.0005;sunlight.shadow.normalBias=.023;sunlight.shadow.camera.layers.enable(1);scene.add(sunlight,sunlight.target);// layer 1: the world's merged shadow proxies
// A real-time sky, shifting from late afternoon into the blue of a remembered evening; stars wait for the very end.
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{dusk:{value:0},night:{value:0}},vertexShader:'varying vec3 v; void main(){v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec3 v;uniform float dusk,night;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float cloud(vec2 p){return noise(p)*.55+noise(p*2.03)*.27+noise(p*4.07)*.12+noise(p*8.1)*.06;}
 void main(){vec3 n=normalize(v);float h=max(n.y,0.);float blue=smoothstep(.30,1.,dusk);
 vec3 low=mix(vec3(.98,.73,.51),vec3(.73,.48,.53),blue);low=mix(low,vec3(.29,.31,.43),night*.8);
 vec3 high=mix(vec3(.37,.56,.72),vec3(.20,.25,.44),blue);high=mix(high,vec3(.075,.12,.24),night*.8);
 vec3 col=mix(low,high,pow(h,.48));vec3 sun=normalize(vec3(.44,.14-dusk*.14-night*.035,-.85));float a=dot(n,sun);
 col+=vec3(1.,.47,.19)*pow(max(a,0.),36.)*.18*(1.-night*.8);
 col=mix(col,vec3(1.,.92,.73),smoothstep(.99982,.99991,a)*(1.-smoothstep(.82,1.,dusk)));
 vec2 uv=n.xz/(max(n.y,.045)+.28);float field=cloud(uv*vec2(2.2,6.8)+vec2(3.,5.));
 float band=smoothstep(.035,.13,h)*(1.-smoothstep(.32,.52,h));float wisps=smoothstep(.49,.72,field)*band;
 vec3 cloudColor=mix(vec3(.94,.78,.65),vec3(.70,.48,.59),blue);cloudColor=mix(cloudColor,vec3(.22,.25,.36),night);
 col=mix(col,cloudColor,wisps*.65);vec2 cell=floor(n.xz/(h+.1)*180.);float stars=step(.9985,hash(cell))*smoothstep(.2,.5,h);
 col+=vec3(.78,.85,1.)*stars*smoothstep(.4,1.,night)*.35;
 gl_FragColor=vec4(col,1.);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(350,32,20),skyMat);

const world=buildWorld(scene);
// Added after the neighborhood is bent and merged, so the sky stays a sky.
scene.add(sky);const {road,originals,groundY}=world;// road and originals are read by tests/verify.mjs.
const _v=new THREE.Vector3(),_q=new THREE.Quaternion(),_e=new THREE.Euler();
const ctx={distance:0,speed:0,lateral:0,state:'intro',clock:0,speaker:null,eye:new THREE.Vector3(),p:0,night:0,finale:0,push:0};
let audio=null;const sfx=(name,pos,opts)=>audio?.sfx(name,pos,opts);
const friends=createFriends(scene,world,{sfx});
const ambient=createAmbient(scene,world,{sfx,camera,renderer,riders:()=>friends.list.filter(f=>f.mode!=='foot'&&f.bike.group.visible).map(f=>({d:f.bd,lat:f.blat}))});
// The end of the street: what can be touched there, and what does not quite fit.
const ending=createEnding(scene,world),interact=createInteractions({world,ambient,sfx});
// Menus, settings, prompts and memory lines.
const ui=createUI($,{onSetting:applySetting}),nostalgia=createNostalgia(ui);

// The player's bicycle and first-person body -----------------------------------------------------
const bikeRoot=new THREE.Group();scene.add(bikeRoot);const playerBike=createBike(CAST.player.bike);bikeRoot.add(playerBike.group);
// The whole body is there (arms, shoulders, legs, shoes); only the head is left out, the camera sits in it.
const self=createPerson({...CAST.player,firstPerson:true});playerBike.group.add(self.group);const selfPose=newPose();
const eyeRig=new THREE.Object3D();bikeRoot.add(eyeRig);
const cockpit=playerBike.group;

let mouseYaw=0,mousePitch=0,headPitch=0,steerVelocity=0,lean=0,pedalPhase=0,lastMouse=null,lastPauseAt=-Infinity,yawOffset=0,steerAngle=0,astride=0,prevYaw=null,wheelTurn=0,kick=0,bikeLean=0;
let lookInputAt=0,glance=0,manualLook=false,answerBellAt=-1,held=0,stamina=1,push=0,steerIn=0,psiVel=0,bikeY=null,bikePitch=0;
let state='intro',distance=0,speed=0,lateral=-.3,look=0,clock=0,lastStamp=0,nextMemory=0,captionTimer=0,idleTime=0,bellCooldown=0,resumeState='riding';
// Final stop: on foot the player is in street coordinates too.
let tut={},walkHint=0,firstHome=false,finaleT=0,walkD=0,walkLat=0,walkYaw=0,walkPitch=0,gait=0,lastStep=0,moveT=0,transT=0,transFrom=null,callDone=false,callT=-1,lookedBack=0,fade=0,endHint=false,wHint=false,leaveT=0;
const keys=new Set();const touch=matchMedia('(pointer:coarse)').matches;if(touch)document.body.classList.add('touch');
const qa=typeof location!=='undefined'&&/[?&]qa\b/.test(location.search||'');
let muted=true;
const onBike=()=>['riding','arriving','stopped','leaving'].includes(state);
const active=()=>['riding','arriving','stopped','dismounting','walking','remounting','leaving'].includes(state);

function setSound(on){if(!audio){audio=createAudio();audio.setVolume(ui.settings.volume);}audio.ensure();muted=!on;audio.setEnabled(on&&state!=='paused');$('sound').setAttribute('aria-pressed',String(on));$('sound').setAttribute('aria-label',on?'Mute sound':'Enable sound');$('sound').innerHTML=`SOUND <span>${on?'ON':'OFF'}</span>`;}
function bell(){if(!onBike()||bellCooldown>0)return;bellCooldown=2;audio?.bell();friends.hearBell(ctx);const f=friends.answerer();
 if(distance<850&&captionTimer<1&&state==='riding'){showCaption('',f?'A bell answers from up ahead.':'The sound drifts down the street.');if(f)answerBellAt=clock+.65;}}
function showCaption(who,text,time=7.5){$('subtitle').replaceChildren();if(who){const s=document.createElement('small');s.textContent=who;$('subtitle').append(s);}$('subtitle').append(document.createTextNode(text));$('subtitle').style.opacity='1';captionTimer=time;ctx.speaker=who||null;}
// Captions: friends' lines can be switched off in Settings; the game's own few lines stay.
function say(who,text,time){if(who&&!ui.settings.captions){captionTimer=time??7.5;return;}showCaption(who,text,time);}
function start(){if(state!=='intro')return;ui.closePanels();state='riding';requestLook();document.body.classList.add('riding');$('intro').hidden=true;$('ride-ui').hidden=false;$('mobile').hidden=!touch;cockpit.visible=true;self.group.visible=true;if(!audio)setSound(true);else if(!muted)setSound(true);showCaption('','There’s still a little light.',5.5);}
function pause(){if(!active())return;resumeState=state;state='paused';lastPauseAt=performance.now();dragging=false;if(document.pointerLockElement===canvas)document.exitPointerLock?.();lastMouse=null;keys.clear();ui.prompt(null);$('pause').hidden=false;audio?.setEnabled(false);}
function resume(){if(state!=='paused')return;ui.closePanels();state=resumeState;requestLook();$('pause').hidden=true;if(!muted)audio?.setEnabled(true);}
function finish(){state='ended';speed=0;if(document.pointerLockElement===canvas)document.exitPointerLock?.();keys.clear();ui.clear();setAct('');$('ending').hidden=false;$('subtitle').style.opacity=0;$('ride-ui').hidden=true;$('mobile').hidden=true;audio?.ending();}
// Everything a replay needs to start clean: the ride, the finale, the interface and the world's small stories.
function resetState(){glance=0;tut={};walkHint=0;firstHome=false;lookInputAt=0;manualLook=false;answerBellAt=-1;held=0;stamina=1;push=0;ctx.push=0;steerIn=0;psiVel=0;bikeY=null;bikePitch=0;clock=0;bellCooldown=0;gait=lastStep=0;ctx.speaker=null;mouseYaw=mousePitch=headPitch=steerVelocity=lean=pedalPhase=yawOffset=steerAngle=wheelTurn=kick=bikeLean=0;astride=0;prevYaw=null;currentChapter=-1;keys.clear();distance=0;speed=0;lateral=-.3;look=0;nextMemory=0;idleTime=0;captionTimer=0;
 finaleT=0;ctx.finale=0;callDone=false;callT=-1;lookedBack=0;fade=0;endHint=false;wHint=false;leaveT=0;transT=0;moveT=0;$('fade').style.opacity=0;$('ride-ui').style.opacity=1;cockpit.visible=true;self.group.visible=true;
 friends.reset();ambient.reset();ending.reset();interact.reset();nostalgia.reset();ui.clear();setAct('');audio?.reset();$('ending').hidden=true;$('pause').hidden=true;$('subtitle').style.opacity=0;}
function reset(){resetState();state='intro';start();}
// Back to the title: the evening waits, unstarted, behind the menu.
function toTitle(){resetState();state='intro';ui.closePanels();document.body.classList.remove('riding');$('intro').hidden=false;$('ride-ui').hidden=true;$('mobile').hidden=true;if(document.pointerLockElement===canvas)document.exitPointerLock?.();audio?.setEnabled(false);placePlayerBike(0);}

$('start').onclick=start;$('sound').onclick=()=>setSound(muted);$('resume').onclick=resume;$('again').onclick=reset;$('bell').onclick=bell;if($('act'))$('act').onclick=()=>action();
if($('restart'))$('restart').onclick=()=>{$('pause').hidden=true;reset();};if($('to-title'))$('to-title').onclick=toTitle;
// Settings apply at once and are remembered in this browser.
function applyQuality(q){const dpr=globalThis.devicePixelRatio||1,max=renderer.capabilities?.maxTextureSize||4096;
 renderer.setPixelRatio(q==='low'?Math.min(dpr,1):q==='high'?Math.min(dpr,2):Math.min(dpr,1.35));renderer.setSize(innerWidth,innerHeight);
 const size=Math.min(max,q==='low'?1024:q==='high'?3072:2048);if(sunlight.shadow.mapSize.x!==size){sunlight.shadow.mapSize.set(size,size);sunlight.shadow.map?.dispose();sunlight.shadow.map=null;}}
function applySetting(k,v){
 if(k==='volume')audio?.setVolume(v);
 else if(k==='sensitivity')sens=.0022*v;
 else if(k==='quality')applyQuality(v);
 else if(k==='fullscreen'){try{if(v&&!document.fullscreenElement)document.documentElement.requestFullscreen?.()?.catch?.(()=>{});else if(!v&&document.fullscreenElement)document.exitFullscreen?.();}catch{}}
 else if(k==='captions'&&!v&&ctx.speaker){$('subtitle').style.opacity=0;}
 else if(k==='memories'&&!v)ui.clear();}
document.addEventListener('fullscreenchange',()=>{ui.settings.fullscreen=!!document.fullscreenElement;ui.fill();});
// The touch action button carries whatever F would do right now.
let actLabel='';function setAct(label){if(label===actLabel)return;actLabel=label;const act=$('act');if(act){act.hidden=!touch||!label;act.textContent=label.toUpperCase();}}

// F: get off at the end of the street, or get back on and ride home.
function action(){
 if(state==='stopped'){state='dismounting';transT=0;transFrom=eyeWorld();self.group.visible=false;sfx('kickstand',bikeRoot.position);return;}
 if(state!=='walking')return;
 // Sitting on the bench: F stands back up. Crouched at the chalk: it lets you up on its own.
 if(interact.pose){if(interact.pose.id==='bench')interact.release();return;}
 if(nearBike()){state='remounting';transT=0;transFrom={pos:camera.position.clone(),yaw:walkYaw,pitch:walkPitch};mouseYaw=mousePitch=look=headPitch=0;return;}
 const spot=interact.nearest(walkD,walkLat,walkYaw);if(spot)interact.act(spot,{d:walkD,lat:walkLat,yaw:walkYaw,pitch:walkPitch});
}
function leave(){if(state!=='stopped'&&state!=='remounting')return;state='leaving';leaveT=0;nostalgia.mark('leaving',clock);audio?.leaving();}
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(e.code==='KeyM'&&!e.repeat){setSound(muted);return;}
 if(e.code==='Escape'){if(e.repeat)return;if(ui.closePanels())return;if(active())pause();else if(state==='paused'&&performance.now()-lastPauseAt>180)resume();return;}
 if(active()){keys.add(e.code);if(e.code==='KeyR'){mouseYaw=0;mousePitch=0;lookInputAt=clock;glance=0;manualLook=false;}if(e.code==='Space'&&!e.repeat){tut.bell=true;bell();}if(e.code==='KeyF'&&!e.repeat)action();if(e.code.startsWith('Shift'))tut.shift=true;if(['KeyA','KeyD','ArrowLeft','ArrowRight'].includes(e.code))tut.steered=true;
  if((e.code==='KeyW'||e.code==='ArrowUp')&&!e.repeat&&state==='stopped'){if(callDone)leave();else if(!endHint&&captionTimer<1){endHint=true;showCaption('','The street ends here.',4);}}}});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
// Pointer lock is optional. Mouse-drag works if the browser declines it.
function requestLook(){if(touch)return;lastMouse=null;lockAt=clock;try{const result=canvas.requestPointerLock?.();result?.catch?.(()=>{});}catch{}}
let dragging=false,lockAt=-1;
canvas.addEventListener('pointerdown',e=>{if(!active())return;if(e.pointerType!=='touch')requestLook();dragging=true;lastMouse={x:e.clientX,y:e.clientY};
 // Pointer lock can win the race with pointer capture; Chromium then rejects
 // capture because this pointer is no longer active. Drag-look remains optional.
 if(document.pointerLockElement!==canvas)try{canvas.setPointerCapture?.(e.pointerId);}catch{}
});
canvas.addEventListener('pointerup',()=>{dragging=false;lastMouse=null;});canvas.addEventListener('pointercancel',()=>{dragging=false;lastMouse=null;});canvas.addEventListener('lostpointercapture',()=>{dragging=false;lastMouse=null;});
// Head-look limits on the bike: a good look over each shoulder, never all the way round.
const LOOK={yaw:1.85,down:1.2,up:.6};let sens=.0022;
function turnView(dx,dy){if(!dx&&!dy)return;manualLook=true;lookInputAt=clock;glance=0;if(state==='walking'){walkYaw-=dx*sens;walkPitch=clamp(walkPitch-dy*sens,-1.1,.9);}else{mouseYaw=clamp(mouseYaw-dx*sens,-LOOK.yaw,LOOK.yaw);mousePitch=clamp(mousePitch-dy*sens,-LOOK.down,LOOK.up);}}
addEventListener('mousemove',e=>{if(!active()||touch)return;let dx=0,dy=0;
 if(document.pointerLockElement===canvas){dx=e.movementX||0;dy=e.movementY||0;
  // Chromium can report one huge jump right after the lock engages; ignore it.
  if(clock-lockAt<.25&&(Math.abs(dx)>60||Math.abs(dy)>60))return;if(Math.abs(dx)>400||Math.abs(dy)>400)return;}
 else if(dragging){if(lastMouse){dx=e.clientX-lastMouse.x;dy=e.clientY-lastMouse.y;}lastMouse={x:e.clientX,y:e.clientY};}else return;turnView(dx,dy);});
canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!dragging||!active())return;if(lastMouse)turnView((e.clientX-lastMouse.x)*1.4,(e.clientY-lastMouse.y)*1.4);lastMouse={x:e.clientX,y:e.clientY};});
document.addEventListener('pointerlockchange',()=>{lastMouse=null;lockAt=clock;if(!document.pointerLockElement&&active())pause();});
for(const [id,key]of [['pedal','KeyW'],['left','KeyA'],['right','KeyD']]){const b=$(id);b.addEventListener('pointerdown',e=>{if(active()){b.setPointerCapture(e.pointerId);keys.add(key);if(key==='KeyW'&&state==='stopped'&&callDone)leave();}});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(key));}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);
let currentChapter=-1;

// Pacing: the bike slows a touch uphill and eases a little while a friend heads home,
// never so much that the group seems to brake for it.
const bump=(d,a,b)=>smooth((d-a)/8)*(1-smooth((d-b)/10));
const pace=d=>1-PACE[0]*bump(d,312,392)-PACE[1]*bump(d,606,700)-PACE[2]*bump(d,862,995);
const PACE=[.15,.1,.1];
// Cruise speed and how much harder a push can go (6.2 m/s at most, about 22 km/h).
const CRUISE=4.75,PUSH=.3;
// First-person eye relative to the head center, and the resting downward gaze of a rider.
const EYE={up:.03,forward:.06,pitch:-.16};
function eyeWorld(){camera.updateMatrixWorld();return {pos:camera.position.clone(),quat:camera.quaternion.clone(),yaw:-(heading(distance)+yawOffset)+look,pitch:headPitch};}
function nearBike(){const b=groundPoint(distance,lateral),p=groundPoint(walkD,walkLat);return Math.hypot(b.x-p.x,b.z-p.z)<1.9;}

// Riding. W pedals at an easy cruise; holding W a while, or Shift+W, pushes harder,
// as hard as a kid's legs allow: the extra fades as you tire and comes back when you ease
// off. Get well ahead of the others and you naturally stop pushing so hard.
function updateRide(dt){
 const pedal=keys.has('KeyW')||keys.has('ArrowUp'),brake=keys.has('KeyS')||keys.has('ArrowDown'),hard=pedal&&(keys.has('ShiftLeft')||keys.has('ShiftRight'));
 const grade=roadGrade(distance),cruise=CRUISE*clamp(1-3.5*grade,.84,1.12)*pace(distance);
 held=pedal&&state==='riding'?held+dt:0;
 const want=state!=='riding'||!pedal?0:hard?1:smooth((held-5)/5)*.45;
 stamina=clamp(stamina+(want>.35?-(want-.35)*dt/7:dt/6),0,1);
 const ahead=friends.list.filter(f=>f.mode==='ride').reduce((m,f)=>Math.max(m,distance-f.d),-99);
 push=damp(push,want*(.35+.65*smooth(stamina*2.2))*(1-smooth((ahead-9)/8)),2.2,dt);ctx.push=push;
 if(state==='arriving'){const rem=Math.max(0,LOOKOUT.stop.d-distance);speed=Math.min(speed,Math.sqrt(2*.42*rem)+.02);if(rem<.03){speed=0;distance=LOOKOUT.stop.d;}}
 else if(brake)speed=Math.max(0,speed-3.2*dt);
 else if(pedal)speed=damp(speed,cruise*(1+PUSH*push),1.2+push*.4,dt);
 else speed=Math.max(0,speed-(.16+9.8*grade*.8)*dt);
 if(state==='stopped'||state==='leaving')speed=state==='leaving'?Math.min(1.6,speed+.5*dt):0;
 // Nobody rides through a friend's back wheel or a waiting car: ease off behind them.
 if(state==='riding')for(const o of [...friends.list.filter(f=>f.mode!=='foot'&&f.bike.group.visible&&Math.abs(f.blat)<4.8).map(f=>({d:f.bd,lat:f.blat,half:.55,width:.5,speed:f.speed})),...ambient.blockers()]){const gap=o.d-distance-o.half-.6;if(gap>-o.half&&gap<2.2&&Math.abs(o.lat-lateral)<o.width+.35)speed=Math.min(speed,Math.max(0,o.speed+gap*.8));}
 distance=Math.min(state==='riding'?LOOKOUT.stop.d:LOOKOUT.stop.d+8,distance+speed*dt);
 // Steering has weight: the bars ease in and back out, the bike's heading follows them
 // through a critically damped response, and momentum carries on after you let go.
 const input=state==='riding'?(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0):0;
 steerIn=damp(steerIn,input,input?4.5:2.4,dt);
 let psiT=steerIn*clamp(.72-.06*speed,.3,.58);// enough to turn up a driveway cut at riding speed
 if(state==='arriving')psiT=clamp((LOOKOUT.stop.lat-lateral)*.18,-.2,.2)*Math.min(1,speed);
 const w=input||state==='arriving'?3.8:2.5;psiVel+=(w*w*(psiT-yawOffset)-2*w*psiVel)*dt;yawOffset+=psiVel*dt;
 steerVelocity=speed*Math.sin(yawOffset);const next=lateral+steerVelocity*dt;
 if(state==='arriving'||world.rideable(distance,next))lateral=next;
 else{// Curb or grass: the front wheel turns away and the bike runs along the edge.
  steerVelocity=0;yawOffset=damp(yawOffset,0,7,dt);psiVel*=.5;}
 // Rolling straight off the end of a driveway apron: the bike eases down onto the nearest
 // paved band (sidewalk or street) instead of carrying on across the grass strip.
 if(state==='riding'&&speed>.05&&!world.rideable(distance,lateral,.1)){let best=null;
  for(let k=1;k<=25&&best===null;k++)for(const sg of [1,-1]){const l=lateral+sg*k*.1;if(world.rideable(distance,l,.2)){best=l;break;}}
  if(best!==null)lateral=damp(lateral,best,10,dt);}
 const yaw=heading(distance)+yawOffset;if(prevYaw===null)prevYaw=yaw;const yawRate=(yaw-prevYaw)/Math.max(dt,1e-3);prevYaw=yaw;
 const k=yawRate/Math.max(speed,.8);steerAngle=damp(steerAngle,speed>.3?clamp(-Math.atan(k*BIKE.wheelbase)*1.2-steerIn*.05,-.5,.5):clamp(-steerIn*.4,-.5,.5),7,dt);
 lean=damp(lean,speed>.4?clamp(-Math.atan(speed*speed*k/9.8)*1.3,-.2,.2):0,5,dt);
 const coasting=state==='leaving'?false:!pedal||state!=='riding';if(!coasting&&speed>.15)pedalPhase+=speed*dt*1.25*(1+.12*push);else if(speed<.15||state!=='riding'){const level=Math.round((pedalPhase-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2;pedalPhase=damp(pedalPhase,level,2.5,dt);}
 wheelTurn+=speed*dt/playerBike.geom.wheelR;astride=damp(astride,speed<.2&&state!=='riding'?1:speed<.12?1:0,speed<.2?2.5:7,dt);
 if(state==='arriving'&&speed<.02&&distance>=LOOKOUT.stop.d-.05){state='stopped';speed=0;finaleT=0;}
 return {pedal:!coasting&&speed>.15,coasting:coasting&&speed>.3};
}
function placePlayerBike(dt){
 // The bike rides on whatever it is on (road, driveway cut, sidewalk), pitched by its two wheels.
 const rf=roadFrame(distance),p=groundPoint(distance,lateral),yF=groundY(distance+.5,lateral),yR=groundY(distance-.5,lateral),yT=(yF+yR)/2;
 bikeY=bikeY===null||dt===0?yT:damp(bikeY,yT,18,dt);bikePitch=damp(bikePitch,Math.atan2(yF-yR,1),12,dt);const y=bikeY;
 bikeLean=damp(bikeLean,(state==='dismounting'||state==='walking'||state==='remounting')?.13:astride*.035,4,dt);
 bikeRoot.position.set(p.x,y,p.z);bikeRoot.rotation.set(bikePitch,-(rf.heading+yawOffset),lean+bikeLean,'YXZ');
 playerBike.wheel=wheelTurn;playerBike.crankAngle=pedalPhase;playerBike.steerAngle=steerAngle;playerBike.kickstand=kick;poseBike(playerBike);
 const bob=state==='riding'?Math.sin(pedalPhase*2)*Math.min(speed*.0012,.006):0;
 ridePose(selfPose,pedalPhase,{astride,steer:steerAngle,look:0,geom:playerBike.geom,posture:CAST.player.build.posture});applyPose(self,selfPose);
 // The eye sits where eyes are: in the (hidden) head, just behind the face. Looking down finds
 // the chest, arms, hands on the grips, knees and shoes on the pedals, all connected.
 headPos(selfPose,_v);eyeRig.position.set(_v.x,_v.y+EYE.up+bob,_v.z-EYE.forward);eyeRig.rotation.set(EYE.pitch+headPitch,look,-(lean+bikeLean)*.6,'YXZ');
}
function updateWalk(dt){
 let f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
 let s=touch?0:(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
 // Seated or crouched you stay put; stepping off the bench is as good as pressing F.
 if(interact.pose){if((f||s)&&interact.pose.id==='bench')interact.release();f=s=0;}
 const turn=(keys.has('KeyQ')?1:0)-(keys.has('KeyE')?1:0)+(touch||keys.has('ArrowLeft')||keys.has('ArrowRight')?(keys.has('ArrowLeft')||keys.has('KeyA')?1:0)-(keys.has('ArrowRight')||keys.has('KeyD')?1:0):0);
 walkYaw+=turn*1.6*dt;
 const len=Math.hypot(f,s)||1,want=(f||s)?1.35:0;moveT=damp(moveT,want,(f||s)?5:7,dt);
 // walkYaw is relative to the street: 0 looks along the ride, positive turns left.
 const c=Math.cos(walkYaw),sn=Math.sin(walkYaw),step=moveT*dt/len;
 const dd=(f*c+s*sn)*step,dl=(-f*sn+s*c)*step;
 const B=LOOKOUT.bounds;let nd=clamp(walkD+dd,B.d0,B.d1),nl=clamp(walkLat+dl,B.l0,B.l1);
 const blocked=(d,l)=>world.obstacles.some(o=>!o.house&&d>o.d0-.25&&d<o.d1+.25&&l>o.l0-.25&&l<o.l1+.25)||(Math.abs(l-lateral)<.42&&Math.abs(d-distance)<.8);
 if(!blocked(nd,nl)){walkD=nd;walkLat=nl;}else if(!blocked(nd,walkLat))walkD=nd;else if(!blocked(walkD,nl))walkLat=nl;
 const moved=moveT*dt;gait+=moved/1.05;
 if(Math.floor(gait*2)!==lastStep&&moveT>.3){lastStep=Math.floor(gait*2);audio?.footstep(Math.hypot(walkLat,walkD-1142)<11||Math.abs(walkLat)<4.7&&walkD<1140?'asphalt':'grass',moveT);}
 const y=groundY(walkD,walkLat),p=groundPoint(walkD,walkLat),bob=Math.abs(Math.sin(gait*Math.PI))*.028*moveT/1.35;
 camera.position.set(p.x,y+1.42+bob-.014,p.z);camera.rotation.set(walkPitch,-(heading(walkD))+walkYaw,Math.sin(gait*Math.PI)*.004*moveT,'YXZ');
 if(moveT>.3)walkHint=Math.max(walkHint,6);
 // Bench and chalk: the eye eases down into the pose and back up; the mouse still looks around.
 const r=interact.update(dt);
 if(r&&!r.done){const P=r.pose,w=r.w,gp=groundPoint(P.d,P.lat);
  // On the way out, stand up facing wherever you were looking.
  if(r.out&&!P.rebased){P.rebased=true;walkYaw=P.yaw+(walkYaw-P.from.yaw);walkPitch=clamp(P.pitch+(walkPitch-P.from.pitch),-1.1,.9);P.from.yaw=P.yaw;P.from.pitch=P.pitch;}
  const yawP=-heading(P.d)+P.yaw+(walkYaw-P.from.yaw),pitchP=clamp(P.pitch+(walkPitch-P.from.pitch),-1.3,.9),yawW=-heading(walkD)+walkYaw;
  camera.position.lerp(_v.set(gp.x,P.eye,gp.z),w);_e.set(walkPitch+(pitchP-walkPitch)*w,yawW+Math.atan2(Math.sin(yawP-yawW),Math.cos(yawP-yawW))*w,0,'YXZ');camera.quaternion.setFromEuler(_e);}
}
// Smoothly move the eye between the saddle and standing beside the bike.
function standSpot(){const o=localToStreet(yawOffset,-.62,-.05);return {d:distance+o.dd,lat:lateral+o.dl};}
function updateTransition(dt,down){
 transT+=dt;const T=down?1.35:1.05,u=smooth(transT/T);
 if(down){kick=smooth(transT/.6);const s=standSpot(),y=groundY(s.d,s.lat)+1.42,p=groundPoint(s.d,s.lat);const arc=Math.sin(Math.PI*u)*.12;
  camera.position.lerpVectors(transFrom.pos,_v.set(p.x,y,p.z),u);camera.position.y+=arc;
  _e.set(transFrom.pitch*(1-u)-.1*Math.sin(Math.PI*u),transFrom.yaw,0,'YXZ');camera.quaternion.setFromEuler(_e);
  if(transT>=T){state='walking';walkD=s.d;walkLat=s.lat;walkYaw=transFrom.yaw+heading(s.d);walkPitch=transFrom.pitch;gait=0;moveT=0;}}
 else{placePlayerBike(dt);eyeRig.updateMatrixWorld(true);eyeRig.getWorldPosition(_v);camera.position.lerpVectors(transFrom.pos,_v,u);eyeRig.getWorldQuaternion(_q);_e.set(transFrom.pitch,-(heading(walkD))+transFrom.yaw,0,'YXZ');camera.quaternion.setFromEuler(_e).slerp(_q,u);
  kick=1-smooth((transT-.5)/.5);if(transT>.45)self.group.visible=true;if(transT>=T){mouseYaw=0;mousePitch=0;look=0;headPitch=0;kick=0;if(callDone)leave();else state='stopped';}}
}
function updateFinale(dt){
 finaleT+=dt;ctx.finale=finaleT;
 // Looking back down the street for a moment brings the evening's last sound.
 const camYaw=_e.setFromQuaternion(camera.quaternion,'YXZ').y,streetBack=-heading(distance)+Math.PI;let diff=Math.abs(((camYaw-streetBack)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);
 if(diff<.7)lookedBack+=dt;
 if(!callDone&&finaleT>18&&(finaleT>36||lookedBack>1.4)){callDone=true;callT=finaleT;audio?.call();showCaption('',finale.call,8);}
 if(callDone&&!wHint&&finaleT-callT>9&&captionTimer<.5){wHint=true;showCaption('',state==='walking'?finale.hintWalk:finale.hintBike,6);}
 // Leaving is slow: the street goes dark over several seconds, with room for one last thought.
 if(state==='leaving'){leaveT+=dt;fade=smooth(leaveT/6.2);if(leaveT>6.6)finish();}
 else if(finaleT>100){if(!fade)nostalgia.mark('leaving',clock);fade=Math.min(1,fade+dt/6);if(fade>=1)finish();}
 $('fade').style.opacity=fade;
}

function update(dt){if(state==='paused'||state==='ended')return;clock+=dt;
 if(answerBellAt>=0&&clock>=answerBellAt){answerBellAt=-1;const f=friends.answerer();if(f&&onBike())audio?.bell(f.bike.group.position,.55);}ctx.clock=clock;bellCooldown=Math.max(0,bellCooldown-dt);
 let bikeAudio={pedal:false,coasting:false};
 if(onBike()&&state!=='intro'){bikeAudio=updateRide(dt);
  const pedal=keys.has('KeyW')||keys.has('ArrowUp');idleTime=pedal||state!=='riding'?0:idleTime+dt;if(pedal&&held>1.2)tut.pedaled=true;
  if(nextMemory<memories.length&&distance>=memories[nextMemory].at){const m=memories[nextMemory++];say(m.who,m.text);}
  if(state==='riding'&&distance>=LOOKOUT.stop.d-24)state='arriving';
  const ch=chapterAt(distance);if(ch!==currentChapter){currentChapter=ch;$('chapter').innerHTML=`0${ch+1} <span>${chapters[ch].title}</span>`;}$('progress').style.width=`${Math.min(1,distance/LENGTH)*100}%`;$('ride-label').textContent=distance<870?'STAY A LITTLE LONGER':'YOU KNOW THE WAY HOME';
  const keyLook=(keys.has('KeyQ')?1.1:0)-(keys.has('KeyE')?1.1:0);if(keyLook){lookInputAt=clock;manualLook=true;}
  // Manual looking always wins; the automatic glance returns only after a long quiet spell, looking ahead.
  if(manualLook&&clock-lookInputAt>14&&Math.abs(mouseYaw)<.25)manualLook=false;
  // When a friend is heading inside and the player isn't steering the view, the head turns a little toward them.
  const target=state==='riding'&&!manualLook&&clock-lookInputAt>3?friends.attention():null;let want=0;
  if(target){const dx=target.x-bikeRoot.position.x,dz=target.z-bikeRoot.position.z,fwd=-(heading(distance)+yawOffset);let a=Math.atan2(-dx,-dz)-fwd;a=Math.atan2(Math.sin(a),Math.cos(a));want=clamp(a,-.85,.85);}
  glance=damp(glance,want,target?1.1:.9,dt);
  look=damp(look,clamp(mouseYaw+keyLook+glance,-LOOK.yaw,LOOK.yaw),8,dt);headPitch=damp(headPitch,mousePitch,8,dt);}
 if(active()){captionTimer-=dt;if(captionTimer<1){$('subtitle').style.opacity=Math.max(0,captionTimer);if(captionTimer<=0)ctx.speaker=null;}}
 if(['stopped','dismounting','walking','remounting','leaving'].includes(state))updateFinale(dt);
 if(['arriving','stopped','dismounting','walking','remounting','leaving'].includes(state))$('ride-ui').style.opacity=state==='arriving'?1:Math.max(0,1-finaleT/3);
 // Light and atmosphere follow the ride, then the last of the evening at the end of the street.
 const p=Math.min(1,distance/LENGTH),night=Math.min(1,ctx.finale/80);ctx.p=p;ctx.night=night;
 skyMat.uniforms.dusk.value=p;skyMat.uniforms.night.value=night;scene.fog.color.set(0xdbb79b).lerp(_c1.set(0x8f8caa),p*.88).lerp(_c2.set(0x555e7c),night*.75);scene.fog.density=.0058+p*.004+night*.001;
 hemi.intensity=2.0-p*.58-night*.48;hemi.color.set(0xe8e3d3).lerp(_c1.set(0x94afd6),p*.8+night*.2);hemi.groundColor.set(0x68675d).lerp(_c1.set(0x44465e),p);sunlight.color.set(0xffd09b).lerp(_c1.set(0xf9a17f),p);sunlight.intensity=Math.max(.04,2.7-p*2.25-night*.4);const rf=roadFrame(Math.min(distance,1140));sunlight.position.set(rf.x+44,rf.y+30-p*21,rf.z-85);sunlight.target.position.set(rf.x,rf.y,rf.z-12);renderer.toneMappingExposure=1.10-p*.06-night*.06;
 if(onBike()||state==='intro'||state==='ended'||state==='dismounting')placePlayerBike(dt);
 if(state==='dismounting')updateTransition(dt,true);else if(state==='remounting')updateTransition(dt,false);
 else if(state==='walking')updateWalk(dt);
 else{eyeRig.updateMatrixWorld(true);eyeRig.getWorldPosition(camera.position);eyeRig.getWorldQuaternion(camera.quaternion);}
 camera.updateMatrixWorld();ctx.eye.copy(camera.position);ctx.distance=distance;ctx.speed=speed;ctx.lateral=lateral;ctx.state=state;
 friends.update(dt,ctx);ambient.update(dt,ctx);ending.update(dt,{callDone,fade,ended:state==='ended',camera});
 // Memory lines follow the evening (the first friend home, the ride home); prompts follow what you can do.
 if(!firstHome&&friends.list.some(f=>f.inside)){firstHome=true;nostalgia.mark('first-home',clock);}
 if(active())nostalgia.update(dt,{distance,clock},{captionBusy:captionTimer>0,enabled:ui.settings.memories});
 if(state!=='intro'){if(state==='walking')walkHint+=dt;const items=promptItems();ui.prompt(touch?null:items);setAct(items?.find(i=>i[0]==='F')?.[1]||'');}
 ui.update(dt);
 sky.position.copy(camera.position);
 const minute=42+Math.floor(p*18);$('date').innerHTML=p>.83?'AUGUST, 2011 <i></i> AS YOU REMEMBER IT':`AUGUST 21, 2011 <i></i> ${minute<60?'7:':'8:'}${String(minute%60).padStart(2,'0')} PM`;
 if(audio&&!muted&&active()){camera.getWorldDirection(_v);audio.update(dt,{speed,pedal:bikeAudio.pedal,coasting:bikeAudio.coasting,onBike:onBike(),surface:Math.abs(lateral)>4.7?'grass':'asphalt',p,night,finale:ctx.finale,listener:camera.position,forward:_v,friendsLeft:friends.list.filter(f=>!f.inside).length,state,crank:pedalPhase,sources:ambient.sources});}
}
const _c1=new THREE.Color(),_c2=new THREE.Color();
// What the keys would do right now, shown only when it matters: a short riding tutorial,
// then nothing until the end of the street.
function promptItems(){
 if(state==='riding'){
  if(!tut.pedaled)return [['W','Pedal'],['Mouse','Look around']];
  if(idleTime>12)return [['W','Keep riding']];
  if(!tut.steered&&distance>12&&distance<110)return [['A+D','Steer']];
  if(!tut.bell&&distance>45&&distance<85)return [['Space','Ring your bell']];
  if(!tut.shift&&distance>118&&distance<150)return [['Shift','Pedal harder']];
  return null;}
 if(state==='stopped')return callDone?[['W','Ride home'],['F','Get off']]:[['F','Get off']];
 if(state==='walking'){const P=interact.pose;if(P)return P.id==='bench'&&!P.leaving?[['F','Stand up']]:null;
  const walk=walkHint<6?[['W+A+S+D','Walk']]:[];
  if(nearBike())return [...walk,['F',callDone?'Ride home':'Get back on']];
  const spot=interact.nearest(walkD,walkLat,walkYaw);if(spot)return [['F',spot.label]];
  return walk.length?[...walk,['Mouse','Look around']]:null;}
 return null;}
function frame(stamp){const dt=Math.min((stamp-lastStamp)/1000,.05);lastStamp=stamp;if(!qa){if(state!=='paused')update(dt);renderer.render(scene,camera);}requestAnimationFrame(frame);}
// Saved settings take effect before the first frame.
for(const k of ['sensitivity','quality'])applySetting(k,ui.settings[k]);
requestAnimationFrame(frame);
// Optional QA hook (?qa): deterministic stepping and a peek at state for automated checks.
// In QA mode the page is driven only by these calls, so runs are repeatable.
if(qa)window.lastLight={step(sec,h=1/30){for(let t=0;t<sec;t+=h)update(Math.min(h,sec-t));},render(){renderer.render(scene,camera);return renderer.info.render;},press:c=>keys.add(c),release:c=>keys.delete(c),key:c=>dispatchEvent(Object.assign(new Event('keydown'),{code:c})),
 get state(){return {state,distance,speed,lateral,look,finaleT,callDone,fade,clue:ending.state.clue,otherBike:ending.state.otherBike,prompt:ui.promptText,reflection:ui.reflection,pose:interact.pose?.id||null,swing:ambient.state.swing,push,stamina,walkD,walkLat,walkYaw,manualLook,night:ctx.night,friends:friends.list.map(f=>({name:f.name,mode:f.mode,step:f.step,d:f.d,inside:f.inside}))};},start,look(y,p=0){mouseYaw=y;mousePitch=p;look=y;headPitch=p;walkYaw=y;walkPitch=p;},world,friends,camera,ambient,audio:()=>audio,renderer,scene,playerBike,self,reset,toTitle,pause,resume,action,ui,interact,ending,nostalgia,walkTo(d,lat,yaw=0,pitch=0){walkD=d;walkLat=lat;walkYaw=yaw;walkPitch=pitch;},
 // QA only: put the bike somewhere on the street (screenshots of sidewalk riding etc.).
 place(d,lat,v=3){distance=d;lateral=lat;speed=v;yawOffset=0;psiVel=0;steerIn=0;bikeY=null;prevYaw=null;}};
