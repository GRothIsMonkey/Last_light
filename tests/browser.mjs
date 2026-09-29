// Browser release checks. npm install --no-save playwright; npx playwright install chromium.
// BROWSER_PATH can select an existing Chromium. SOFTWARE_GL=1 uses SwiftShader.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage'];if(process.env.SOFTWARE_GL)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu');
const browser=await playwright.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[],frames=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE',m.text());}});
const base=`http://127.0.0.1:${server.address().port}`;
const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const state=()=>page.evaluate(()=>lastLight.state);
const snap=async name=>{const info=await page.evaluate(()=>({...lastLight.render()}));await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:90});frames.push({name,...info});console.log('Captured',name);};
const advanceTo=async d=>{await page.evaluate(d=>{let frames=0;while(lastLight.state.distance<d&&frames++<14000)lastLight.step(1/30);},d);check('reached '+d,(await state()).distance>=d);};
try{
 await page.goto(base+'/index.html?qa');await page.waitForFunction(()=>window.lastLight);await page.evaluate(()=>lastLight.step(.04));await snap('01-opening');
 await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
 check('audio starts from a user gesture',await page.evaluate(()=>lastLight.audio()?.ctx?.state==='running'));
 check('mouse captured in Chromium',await page.evaluate(()=>document.pointerLockElement===document.querySelector('#world')));
 await page.mouse.click(720,450);await page.keyboard.press('r');check('click while locked keeps capture',await page.evaluate(()=>document.pointerLockElement===document.querySelector('#world')));
 await page.keyboard.down('w');await page.evaluate(()=>lastLight.step(3));await page.keyboard.up('w');check('W key pedals',(await state()).distance>5);
 await page.keyboard.press('Space');check('bell schedules real Web Audio sources',await page.evaluate(()=>lastLight.audio().activeShots>0));
 // Headless audio still runs in real time; accelerate only after muting.
 await page.keyboard.press('m');check('M mutes sound under pointer lock',await page.evaluate(()=>!lastLight.audio().enabled));await page.evaluate(()=>lastLight.look(0,-.7));await page.evaluate(()=>lastLight.step(.25));await snap('02-pedaling');
 await page.evaluate(()=>lastLight.look(0,0));await page.keyboard.press('Escape');const paused=await state();await page.evaluate(()=>lastLight.step(5));check('QA pause freezes simulation',(await state()).distance===paused.distance&&(await state()).state==='paused');
 await page.click('#resume');await page.evaluate(()=>lastLight.press('KeyW'));await advanceTo(85);await snap('03-group-ride');await advanceTo(180);await snap('04-first-hill');
 for(const [name,d] of [['05-jamie-runs-home',398],['06-jamie-at-door',407],['07-sam-parks',685],['08-sam-garage-closes',698],['09-alex-waves',967],['10-alex-porch',979],['11-alex-upstairs-light',1005],['12-late-sunset',1060],['13-final-arrival',1136.5]]){await advanceTo(d);await snap(name);}
 check('every friend is inside',(await state()).friends.every(f=>f.inside));check('no clue during main ride',!(await state()).clue);
 await page.evaluate(()=>{lastLight.release('KeyW');lastLight.step(2);lastLight.key('KeyF');lastLight.step(2);});check('dismount reaches walking',(await state()).state==='walking');
 await page.evaluate(()=>{lastLight.press('KeyW');lastLight.step(12);lastLight.release('KeyW');lastLight.step(.4);lastLight.look(-.4,.12);});await snap('14-oak-and-bench');
 await page.evaluate(()=>{lastLight.look(Math.PI,0);lastLight.step(3);});await snap('15-looking-home');
 await page.evaluate(()=>lastLight.step(10));check('distant call triggers',(await state()).callDone);check('clue remains absent after call',!(await state()).clue);
 // Return by walking; no teleport/set-distance hooks.
 await page.evaluate(()=>{for(let i=0;i<1400;i++){const s=lastLight.state;if(Math.hypot(s.walkD-s.distance,s.walkLat-s.lateral)<1.5)break;lastLight.look(Math.atan2(-(s.lateral+.75-s.walkLat),s.distance-s.walkD),0);lastLight.press('KeyW');lastLight.step(1/30);}lastLight.release('KeyW');lastLight.step(.3);lastLight.key('KeyF');lastLight.step(1.6);});
 check('return to bike starts leaving',(await state()).state==='leaving');await page.evaluate(()=>lastLight.step(.35));check('single clue appears only in last fade',(await state()).clue&&(await state()).fade>0);await snap('16-final-fade');
 // Diagnostic view of the same subtle mark, without altering gameplay state.
 await page.evaluate(async()=>{const T=await import('./three.module.js');lastLight.camera.position.add(new T.Vector3(1,1,-7));const p=lastLight.ambient.clue.geometry.attributes.position;lastLight.camera.lookAt(p.getX(0),p.getY(0),p.getZ(0));});await snap('17-ending-clue-detail');
 await page.evaluate(()=>lastLight.step(6));
 // Simulation stepping does not advance the ending card's real-time CSS fade.
 await page.waitForFunction(()=>!document.querySelector('#ending').hidden&&Number(getComputedStyle(document.querySelector('#ending')).opacity)>.99);
 await snap('18-ending');check('ending card shown',(await state()).state==='ended'&&await page.locator('#ending').isVisible());
 const ended=await state();await page.evaluate(()=>lastLight.step(20));check('ending clock does not advance',(await state()).finaleT===ended.finaleT);
 await page.click('#again');await page.evaluate(()=>lastLight.step(.1));const replay=await state();check('replay resets story and clue',replay.distance===0&&!replay.clue&&replay.friends.every(f=>!f.inside&&f.mode==='ride'));
 check('replay resets environment',await page.evaluate(()=>lastLight.ambient.state.kidVisible&&lastLight.ambient.state.car==='wait'&&lastLight.ambient.state.sprinklers.every(v=>v>.99)&&!lastLight.friends.mom.slammed));
 await page.evaluate(()=>lastLight.press('KeyW'));await advanceTo(1136.5);await page.evaluate(()=>{lastLight.release('KeyW');lastLight.step(95.8);});check('idle route reveals same clue',(await state()).clue);await snap('19-idle-clue');await page.evaluate(()=>lastLight.step(8));check('second complete playthrough ends',(await state()).state==='ended');
 const gpu=await page.evaluate(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});
 // Real Web Audio renders of every important synthesized sound, retained for listening.
 const audioReport=await page.evaluate(async()=>{
  const {createAudio}=await import('./audio.js');const clips=[];
  for(const name of ['rolling','grass','coasting','footstep-asphalt','footstep-grass','bell','sprinkler','dribble','rim','doorOpen','doorSlam','garage','bikeDrop','kickstand','engineOff','dog','creak','bird','call','morning-neighborhood','evening-neighborhood','ending']){
   const ctx=new OfflineAudioContext(2,48000*(name==='ending'?10:7),48000);let seed=2011;const audio=createAudio({context:ctx,random:()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}});audio.ensure();audio.setEnabled(true);
   const ready=ctx.suspend(.75),rendering=ctx.startRendering();await ready;
   const ride={speed:4.5,pedal:true,coasting:false,onBike:true,surface:'asphalt',p:.2,night:0,finale:0,listener:{x:0,y:1.5,z:0},forward:{x:0,z:-1},friendsLeft:3,state:'riding',crank:2,sources:[]};
   if(name==='rolling'||name==='grass'||name==='coasting'){audio.update(1/30,{...ride,surface:name==='grass'?'grass':'asphalt',coasting:name==='coasting',p:1,night:0,finale:2});}
   else if(name.startsWith('footstep-'))audio.footstep(name.slice(9),1.1);
   else if(name==='morning-neighborhood'||name==='evening-neighborhood')audio.update(1/30,{...ride,p:name.startsWith('evening')?1:.1,night:name.startsWith('evening')?.8:0,speed:0,onBike:false,friendsLeft:name.startsWith('evening')?0:3,sources:name.startsWith('evening')?[]:[{kind:'mower',pos:{x:-25,y:0,z:-20},level:1},{kind:'engine',pos:{x:14,y:0,z:-10},level:.6}]});
   else if(['bell','call','ending'].includes(name))audio[name]();else audio.sfx(name,null);
   await ctx.resume();const b=await rendering,channels=[b.getChannelData(0),b.getChannelData(1)];let peak=0,sum=0,nonFinite=0,jump=0;
   for(const a of channels)for(let i=0;i<a.length;i++){peak=Math.max(peak,Math.abs(a[i]));sum+=a[i]*a[i];if(!Number.isFinite(a[i]))nonFinite++;if(i)jump=Math.max(jump,Math.abs(a[i]-a[i-1]));}
   const pcm=new Int16Array(b.length*2);for(let i=0;i<b.length;i++)for(let c=0;c<2;c++)pcm[i*2+c]=Math.round(Math.max(-1,Math.min(1,channels[c][i]))*32767);
   const bytes=new Uint8Array(pcm.buffer);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   clips.push({name,peak,rms:Math.sqrt(sum/(b.length*2)),nonFinite,maxSampleJump:jump,pcm:btoa(binary)});
  }
  return clips;
 });
 function wav(pcm){const b=Buffer.alloc(44+pcm.length);b.write('RIFF',0);b.writeUInt32LE(36+pcm.length,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(48000,24);b.writeUInt32LE(192000,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(pcm.length,40);pcm.copy(b,44);return b;}
 const audioDir=path.join(out,'audio');fs.mkdirSync(audioDir,{recursive:true});for(const c of audioReport){fs.writeFileSync(path.join(audioDir,c.name+'.wav'),wav(Buffer.from(c.pcm,'base64')));delete c.pcm;check('audio finite and unclipped: '+c.name,c.nonFinite===0&&c.peak<.95&&c.peak>1e-5);}
 fs.writeFileSync(path.join(out,'errors.json'),JSON.stringify(errors,null,2));check('no JavaScript or shader errors',errors.length===0);
 const report={browser:browser.version(),gpu,passed:checks.length,checks,frames,audio:audioReport,errors,audioLimitation:'Offline Web Audio signal checks and recorded clips; no claim of perceptual listening.'};fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();server.close();}
