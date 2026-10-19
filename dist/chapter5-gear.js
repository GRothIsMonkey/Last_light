// Chapter Five: what you carry, used with your hands.
// The flashlight (T): out of your pocket into your hand and switched on, by day as much as by night (in the sun it hardly
// shows; inside a cabin it does); T again switches it off; put away from the inventory. It dies once, in the dark inside
// a cabin, and Sam, who packed spare batteries this morning, gets them out of his bag and holds them out; you take them
// (F) and your hands change them, and it comes back on. Nothing about the light depends on whether it is dark: only on
// whether you have it, have it in your hand, have it switched on, and the batteries.
// Alex's camera: a picture is taken with your hands: the camera comes up in front of you at arm's length (its screen
// showing what it sees), a finger goes down on the shutter, the picture is taken (of what is there, then), the flash
// (the flashlight's wide spill borrowed for a moment, so the scene's light count never changes: bright in the dark,
// next to nothing by day), the picture on its screen, and down again.
// Alex's shirt: Sam takes it off its nail, gathers it up, and puts it in his bag; it is in his bag from then on.
// The inventory (I) lists it all (inventory.js).
import * as THREE from './three.module.js';
import {P as PI,smooth,standPose,copyPose,applyPose} from './rig.js';
import {makeCameraModel} from './alex-camera.js';
import {createInventory} from './inventory.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp3=(p,o,q,w)=>{for(let i=0;i<3;i++)p[o+i]+=(q[i]-p[o+i])*w;};
export function createGear(X){
 const {phys,comp,G5,jamie,sam,camera,foot}=X;
 const S={act:null,onIn:0,dieT:0,batt:null,offerBatt:false,shot:null,shirt:null,log:[]};
 const POCKET=[.21,.84,.04];// (the right front pocket, person-local)
 // ---- the first-person hands for these (drawn over the body by physical.js's arms) ----------------------------------------
 phys.ME.extra.push((p,{toLocal,dt})=>{const A=phys.ME.act;if(!A||A.kind!=='gear')return;A.e+=dt;const o=PI.rh;
  if(A.what==='out'){// down to the pocket, the light in the hand at .28, up to where it is held
   if(A.e<.28)lerp3(p,o,POCKET,smooth(A.e/.28));else{if(!A.flip){A.flip=true;foot.owned=true;foot.on=A.on&&!X.flags().dead;if(foot.on)X.sound('click',camera.position,{gain:.45});}const u=smooth((A.e-.28)/.32),hold=[p[o],p[o+1],p[o+2]];for(let i=0;i<3;i++)p[o+i]=POCKET[i]+(hold[i]-POCKET[i])*u;}
   if(A.e>=.6)end(A);}
  else if(A.what==='in'){// down to the pocket with it, off and in at .3, the hand back
   if(A.e<.3)lerp3(p,o,POCKET,smooth(A.e/.3));else{if(!A.flip){A.flip=true;if(foot.on)X.sound('click',camera.position,{gain:.4});foot.on=false;foot.owned=false;}const u=smooth((A.e-.3)/.25),rest=[p[o],p[o+1],p[o+2]];for(let i=0;i<3;i++)p[o+i]=POCKET[i]+(rest[i]-POCKET[i])*u;}
   if(A.e>=.55)end(A);}
  else if(A.what==='swap'){// the new batteries (left hand) to the flashlight (right): cap off, in, cap on, a click, on
   const u=smooth(A.e/.35)*(1-smooth((A.e-1.15)/.35));lerp3(p,PI.lh,[-.02,1.0,-.34],u);lerp3(p,o,[.06,1.0,-.36],u);p[PI.le]=-.7;p[PI.le+1]=-.4;p[PI.le+2]=.4;
   if(A.e>.55&&!A.in){A.in=true;X.sound('cloth',camera.position,{gain:.25});}if(A.e>.95&&!A.flip){A.flip=true;A.done?.();}if(A.e>=1.5)end(A);}
  else if(A.what==='shoot')shootArms(p,A,toLocal);});
 function end(A){if(phys.ME.act===A)phys.ME.act=null;A.then?.();}
 function busy(){return phys.playerBusy();}
 // ---- the flashlight -------------------------------------------------------------------------------------------------------------
 const has=()=>!!X.inv().flashlight,inHand=()=>!!foot.owned;
 function takeOut(on=true,then=null){if(!has()||inHand()||busy())return false;phys.ME.act={kind:'gear',what:'out',e:0,on,then};S.log.push('out');return true;}
 function putAway(then=null){if(!inHand()||busy())return false;phys.ME.act={kind:'gear',what:'in',e:0,then};S.log.push('in');return true;}
 // T: in your pocket, out and on; in your hand, on or off (dead: the switch clicks and nothing happens)
 function toggle(){if(!has())return false;if(!inHand())return takeOut(true);if(busy())return true;
  if(X.flags().dead&&!X.flags().batteries){X.sound('click',camera.position,{gain:.35});S.log.push('dead-click');return true;}foot.on=!foot.on;X.sound('click',camera.position,{gain:.5});S.log.push(foot.on?'on':'off');return true;}
 // (for the story: in your hand and on without fuss, at dusk; or simply set, for a scene started from the DEV menu)
 function set({have,hand,on}){X.inv().flashlight=!!have;foot.owned=!!(have&&hand);foot.on=!!(have&&hand&&on&&!(X.flags().dead&&!X.flags().batteries));}
 // ---- the batteries --------------------------------------------------------------------------------------------------------------
 // on, in your hand, inside a building by day for a moment and a half: it flickers and goes; Sam's batteries
 function updateBatteries(dt){const F=X.flags();if(F.batteries||!has())return;
  if(!F.dying){if(inHand()&&foot.on&&X.indoors()&&X.canDie()){S.onIn+=dt;if(S.onIn>1.6){F.dying=true;S.dieT=0;X.mark('the flashlight dies');}}else S.onIn=Math.max(0,S.onIn-dt);return;}
  S.dieT+=dt;if(S.dieT>.6&&S.dieT<2&&!F.dead)foot.on=inHand()&&Math.sin(S.dieT*31)+Math.sin(S.dieT*13)>.3;
  if(S.dieT>=2&&!F.dead){F.dead=true;foot.on=false;X.sound('click',camera.position,{gain:.3});samBatteries();}
  if(F.dead&&!F.batteries&&foot.on)foot.on=false;}
 function samBatteries(){X.say([{who:'YOU',text:'“My light’s dead.”',time:1.4},{who:'SAM',text:'“Hang on.”',by:'sam',time:1,face:'concerned'}]);
  const near=X.beside(-1,.1,.8);X.stand(sam,null);
  comp.run(sam,[comp.steps.walkTo(sam,X.walkPath(sam,near),{speed:1.25}),comp.steps.turnTo(sam,()=>X.headingToEye(sam),.35),
   ...G5.bagSteps(sam,{take:()=>G5.packedOf('batteries'),onTake:it=>{S.batt=it;if(it)it.given=true;}}),
   (dt)=>{S.offerBatt=true;return true;},G5.holdOut(sam,()=>X.eye(),{until:()=>S.battTaken})],{then:()=>{X.stand(sam,null);}});
  X.later(14,()=>{if(!S.battTaken&&S.offerBatt&&!X.busy())X.say([{who:'SAM',text:'“Here. Batteries.”',by:'sam',time:1.4}]);});}
 function takeBatteries(){const P=S.batt;if(!P||S.battTaken||busy())return;X.lockWalk(true);
  phys.playerReach({side:'l',at:()=>P.obj.position.clone(),dur:[.45,.15,.35],carry:false,onContact:()=>{phys.handOff(P,X.self,'l');phys.playerHold('l',P,{at:[-.16,.98,-.36]});S.battTaken=true;X.sound('cloth',P.obj.position,{gain:.2});},
   then:()=>{const go=()=>{phys.ME.act={kind:'gear',what:'swap',e:0,done:()=>{P.hide();phys.playerHold('l',null);const F=X.flags();F.batteries=true;X.inv().batteries=true;foot.on=true;X.sound('click',camera.position,{gain:.5});X.mark('Sam’s batteries');
     X.say([{who:'YOU',text:'“You brought batteries?”',time:1.6},{who:'SAM',text:'“I brought batteries for the batteries.”',by:'sam',time:2.2,face:'unimpressed'},{who:'JAMIE',text:'“He probably brought a spare sock too.”',by:'jamie',face:'grin'},{wait:.6},{who:'SAM',text:'“…I did, actually.”',by:'sam',time:1.6,face:'amused'}]);},then:()=>X.lockWalk(false)};};
    if(!inHand()){takeOutThen(go);}else go();}});}
 function takeOutThen(f){phys.ME.act={kind:'gear',what:'out',e:0,on:false,then:f};}
 // ---- the flashlights, out of Sam's bag at the camp gate: one held out to you (F takes it, into your hand, off), one to Jamie
 function handOut(){if(S.torchOut)return;S.torchOut=true;X.stand(sam,null);
  comp.run(sam,[comp.steps.turnTo(sam,()=>X.headingToEye(sam),.35),...G5.bagSteps(sam,{take:()=>G5.packedOf('flashlight'),onTake:it=>{S.torch=it;if(it)it.given=true;}}),
   (dt)=>{S.offerTorch=true;return true;},G5.holdOut(sam,()=>X.eye(),{until:()=>S.torchTaken||!S.torch}),
   // (and Jamie's: Sam gets the next one out, Jamie takes it from his hand and pockets it)
   ...G5.bagSteps(sam,{take:()=>G5.packedOf('flashlight'),onTake:it=>{S.jtorch=it;if(it)it.given=true;}}),G5.holdOut(sam,()=>jamie.person.group.position.clone().add(new THREE.Vector3(0,1.1,0)),{until:()=>S.jtorchTaken||!S.jtorch})],{then:()=>X.stand(sam,null)});
  X.later(9,()=>jamieTakes());
  X.later(22,()=>{if(!S.torchTaken&&S.offerTorch&&!X.busy())X.say([{who:'SAM',text:'“Take it. It’s going to be dark in there.”',by:'sam',time:2}]);});}
 function jamieTakes(){if(S.jtorchTaken)return;if(!S.jtorch||S.jtorch.holder!==sam.person){X.later(1,jamieTakes);return;}const P=S.jtorch;X.stand(jamie,null);
  comp.run(jamie,[comp.steps.walkTo(jamie,X.walkPath(jamie,(()=>{const q=sam.person.group.position,a=sam.pa;return {x:q.x+Math.sin(a)*.75,z:q.z-Math.cos(a)*.75};})()),{speed:1.2}),
   phys.reach(jamie,{at:()=>P.obj.position.clone(),dur:[.45,.15,.35],carry:true,onContact:()=>{phys.handOff(P,jamie.person,'r');S.jtorchTaken=true;X.sound('click',P.obj.position,{gain:.25});}}),
   (()=>{let e=0;return dt=>{e+=dt;return e>.9;};})(),phys.reach(jamie,{at:()=>{const q=jamie.person.group.position.clone();return q.add(new THREE.Vector3(Math.cos(jamie.pa)*-.18,.86,Math.sin(jamie.pa)*-.18));},dur:[.4,.1,.3],carry:false,onContact:()=>{P.hide();}})],{then:()=>X.stand(jamie,null)});}
 function takeTorch(){const P=S.torch;if(!P||S.torchTaken||busy())return;X.lockWalk(true);
  phys.playerReach({at:()=>P.obj.position.clone(),dur:[.45,.15,.4],onContact:()=>{P.hide();S.torchTaken=true;X.inv().flashlight=true;foot.owned=true;foot.on=false;X.sound('click',camera.position,{gain:.25});X.mark('a flashlight, from Sam');},then:()=>X.lockWalk(false)});}
 // ---- the camera: a picture taken with your hands --------------------------------------------------------------------------------
 let model=null,finger=null;const tmpV=new THREE.Vector3(),tmpQ=new THREE.Quaternion();
 function buildModel(){if(model)return;model=makeCameraModel();const g=model.group;g.visible=false;camera.add(g);
  // (the index finger that presses the shutter: a fingertip over the button)
  finger=new THREE.Mesh(new THREE.CapsuleGeometry(.0072,.026,4,8),new THREE.MeshStandardMaterial({color:X.skin?.()??0xc8946e,roughness:.7}));finger.rotation.z=Math.PI/2.3;g.add(finger);}
 // in view: at arm's length, a little below the eye, its back (the screen) to you
 const HOLD=new THREE.Vector3(.0,-.055,-.36);
 function shoot(fn){if(S.shot||busy())return false;buildModel();const g=model.group;g.visible=true;g.position.set(.03,-.32,-.3);g.rotation.set(-.5,Math.PI,0);
  S.shot={e:0,fn,fired:false};foot.hideTorch=true;phys.ME.act={kind:'gear',what:'shoot',e:0};preview();S.log.push('shoot');return true;}
 function shootArms(p,A,toLocal){const Sh=S.shot;if(!Sh){end(A);return;}const e=A.e,g=model.group,up=smooth(e/.38)*(1-smooth((e-1.05)/.35));
  g.position.set(HOLD.x+.03*(1-up),HOLD.y-.24*(1-up),HOLD.z+.04*(1-up));g.rotation.set(-.5*(1-up)+.02,Math.PI,.05*(1-up));
  // the finger: above the shutter, down on it at .42-.5, up
  const press=smooth((e-.4)/.06)*(1-smooth((e-.56)/.08));finger.position.set(-.03,.058/2+.012-.006*press,-.004);
  // the hands at its two ends (the arms reach for where it is)
  g.updateMatrixWorld(true);const R=toLocal(g.localToWorld(tmpV.set(-.06,-.006,.01)).clone()),L=toLocal(g.localToWorld(tmpV.set(.06,-.006,.01)).clone());
  lerp3(p,PI.rh,[R.x,R.y,R.z],up);lerp3(p,PI.lh,[L.x,L.y,L.z],up);p[PI.re]=.7;p[PI.re+1]=-.5;p[PI.re+2]=.3;p[PI.le]=-.7;p[PI.le+1]=-.5;p[PI.le+2]=.3;
  if(!Sh.fired&&e>=.46){Sh.fired=true;const r=Sh.fn?.();flash();if(r&&r.px)toLCD(r);}
  if(e>=1.4){g.visible=false;S.shot=null;foot.hideTorch=false;end(A);}}
 // the flash: the spill light, wide, from the camera, for a moment; strong as the dark is deep
 function flash(){const dark=clamp(X.darkness(),0,1);foot.flash=.6+9*dark*dark;S.flashAt=X.t();S.log.push('flash:'+foot.flash.toFixed(1));}
 function preview(){const r=X.render?.(160,120);if(r)toLCD(r);}
 // (pixels read back from a render, bottom row first, onto the camera's screen)
 function toLCD(r){if(!r||!r.px||!model?.lcdCanvas)return;try{const L=model.lcdCanvas,cv=L.c,g=L.g;if(!g?.createImageData)return;const {px,w,h}=r,off=globalThis.document.createElement('canvas');off.width=w;off.height=h;const og=off.getContext('2d'),im=og.createImageData(w,h);
  for(let y=0;y<h;y++)im.data.set(px.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);og.putImageData(im,0,0);g.drawImage(off,0,0,cv.width,cv.height);model.tex.needsUpdate=true;S.lcd=(S.lcd||0)+1;}catch{}}
 // (the picture itself is rendered without your hands or the camera in it)
 function hidden(fn){const a=X.self.group.visible,b=model?.group.visible;X.self.group.visible=false;if(model)model.group.visible=false;try{return fn();}finally{X.self.group.visible=a;if(model)model.group.visible=b;}}
 // ---- Alex's shirt: off the nail, gathered up, into Sam's bag ---------------------------------------------------------------------
 let shirtP=null;
 function shirtProp(){if(!shirtP){shirtP=phys.prop('alex-shirt',X.shirt,{grip:{p:[0,-.2,.02],r:[0,0,0]}});}return shirtP;}
 function hangShirt(pos,rot){const P=shirtProp();X.shirt.scale.set(1,1,1);P.place(pos,rot);X.shirt.visible=true;}
 function shirtInBag(){const P=shirtProp();X.shirt.scale.set(.5,.4,1.2);P.storeIn(G5.S.bag);X.inv().shirt=true;}
 function samTakesShirt({stand,then}){const P=shirtProp();X.stand(sam,null);let e=0;
  comp.run(sam,[comp.steps.walkTo(sam,X.walkPath(sam,stand()),{speed:1}),comp.steps.turnTo(sam,()=>X.headingTo(sam,P.obj.position),.4),
   phys.reach(sam,{at:()=>P.obj.position.clone().add(new THREE.Vector3(0,.12,0)),dur:[.6,.3,.4],carry:true,onContact:()=>{P.holdBy(sam.person,'r');X.sound('cloth',P.obj.position,{gain:.35});X.mark('Sam takes the shirt off the nail');}}),
   // gathered up in both hands, folded over on itself
   (dt,ctx)=>{e+=dt;const u=smooth(e/.9);X.shirt.scale.set(1-.5*u,1-.6*u,1+.2*u);gather(sam,ctx,u);return e>=1.1;},
   ...G5.bagSteps(sam,{put:P,onPut:()=>{X.inv().shirt=true;X.mark('the shirt in Sam’s bag');}})],{then:()=>then?.()});}
 // (both hands together in front, turning it over on itself)
 function gather(c,ctx,u){standPose(c.tmp,ctx.clock+c.R.phase,{look:0,shift:0});copyPose(c.pose,c.tmp);const k=smooth(Math.min(1,u*2.2));lerp3(c.pose,PI.rh,[.07,1.02,-.3],k);lerp3(c.pose,PI.lh,[-.07,1.0,-.3+.04*Math.sin(u*6)],k);
  c.pose[PI.re]=.6;c.pose[PI.re+1]=-.4;c.pose[PI.le]=-.6;c.pose[PI.le+1]=-.4;c.pose[PI.hp]-=.3*k;comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;}
 // ---- every frame, and the prompts ------------------------------------------------------------------------------------------------
 function update(dt){updateBatteries(dt);if(foot.flash>0){foot.flash*=Math.exp(-dt/.035);if(foot.flash<.02)foot.flash=0;}inv.update();}
 function spots(add){if(S.offerTorch&&!S.torchTaken&&S.torch&&S.torch.holder===sam.person&&!busy())add('c5-torch','Take the flashlight',S.torch.obj.position,S.torch.obj.position,2.4,{look:true,size:.12});
  if(S.offerBatt&&!S.battTaken&&S.batt&&S.batt.holder===sam.person&&!busy())add('c5-batt','Take the batteries',S.batt.obj.position,S.batt.obj.position,2.4,{look:true,size:.12});}
 function act(id){if(id==='c5-batt'){takeBatteries();return true;}if(id==='c5-torch'){takeTorch();return true;}return false;}
 // ---- the inventory ----------------------------------------------------------------------------------------------------------------
 const inv=createInventory({items:()=>X.items({flashlight:{have:has(),hand:inHand(),on:!!foot.on,dead:!!(X.flags().dead&&!X.flags().batteries)}}),
  use:id=>{if(id==='flashlight'){if(inHand())putAway();else takeOut(false);}else X.use?.(id,inv);},onOpen:()=>X.held(true),onClose:()=>X.held(false)});
 function reset(){S.torchOut=S.offerTorch=S.torchTaken=S.jtorchTaken=false;S.torch=S.jtorch=null;S.act=null;S.onIn=0;S.dieT=0;S.batt=null;S.offerBatt=false;S.battTaken=false;S.shot=null;S.log.length=0;foot.flash=0;foot.hideTorch=false;if(model)model.group.visible=false;if(shirtP){X.shirt.scale.set(1,1,1);}inv.reset();}
 return {S,inv,handOut,takeOut,putAway,toggle,set,shoot,hidden,hangShirt,shirtInBag,samTakesShirt,update,spots,act,reset,get inHand(){return inHand();},get on(){return !!foot.on;},get model(){return model;}};
}
