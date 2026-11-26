process.env.LL_TEST_DIST='dist';
const {browserSession}=require('./review-browser.cjs');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const flags='bikes&houses&vegetation&pavement&streetprops&details&player1b&friends1b';
const root='review-capture/footage',qa='assets/review/friends-phase1b/evidence';
fs.mkdirSync(qa,{recursive:true});
browserSession(async(p,url)=>{
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{
   window.AudioContext=class {
     constructor(){const ctx=new OfflineAudioContext(2,48000*280,48000);window.rideAudio=ctx;
       return new Proxy(ctx,{get(target,prop){if(prop==='currentTime')return window.recordTime||0;if(prop==='resume')return ()=>Promise.resolve();if(prop==='state')return 'running';const val=Reflect.get(target,prop,target);return typeof val==='function'?val.bind(target):val;}});}
   };
 });
 await p.goto(url+'/?qa&'+flags,{timeout:180000});
 await p.waitForFunction(()=>window.friends1b&&window.player1b?.flags.ready&&window.__details&&window.__streetprops&&window.__bikes&&window.__pavement&&window.__vegetation&&window.__houses,null,{timeout:150000});
 await p.evaluate(()=>{
   const g=lastLight;g.start();g.ui.closePanels();g.press('KeyW');if(document.getElementById('sound').getAttribute('aria-pressed')!=='true')document.getElementById('sound').click();
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=560;const ctx=canvas.getContext('2d');
   let next=0,prev={},initial=null,alexCam=null,stopAt=null;
   const cam=g.camera.clone(),v=cam.position.clone(),t=v.clone(),camLoc={};
   function jpeg(main=true){
     ctx.drawImage(g.renderer.domElement,0,0,800,560);
     const shade=main?Number(document.getElementById('fade').style.opacity):0;
     if(shade){ctx.fillStyle='rgba(0,0,0,'+shade+')';ctx.fillRect(0,0,800,560);}
     const sub=document.getElementById('subtitle');const text=sub.lastChild?.textContent||'';
     if(text&&Number(sub.style.opacity)>.06){
       ctx.save();ctx.globalAlpha=Number(sub.style.opacity);ctx.font='17px Georgia';ctx.textAlign='center';
       const speaker=sub.querySelector('small')?.textContent||'',lines=[''];
       for(const word of text.split(/\s+/)){let a=lines.at(-1);if(a&&ctx.measureText(a+' '+word).width>655)lines.push(word);else lines[lines.length-1]=(a+' '+word).trim();}
       const h=lines.length*22+(speaker?18:0)+14,y=541-h;
       ctx.fillStyle='rgba(14,17,19,.68)';ctx.fillRect(50,y,700,h);
       if(speaker){ctx.fillStyle='#d9caa5';ctx.font='bold 13px system-ui';ctx.fillText(speaker,400,y+16);}
       ctx.font='17px Georgia';ctx.fillStyle='#fff9e9';lines.forEach((l,i)=>ctx.fillText(l,400,y+(speaker?37:23)+22*i));ctx.restore();
     }
     return canvas.toDataURL('image/jpeg',.85).split(',')[1];
   }
   window.takeRideFrames=()=>{
     const frames=[];for(let count=0;count<12;count++,next++){
       const sec=next/15,st=g.state,km=st.distance;window.recordTime=sec;
       if(st.state==='riding'){
         const hold=(k,on)=>on?g.press(k):g.release(k);
         hold('KeyW',!(sec>13&&sec<16)&&!(sec>38&&sec<42));
         hold('ShiftLeft',(sec>17&&sec<25)||(km>152&&km<178)||(km>255&&km<277));
         hold('KeyS',sec>38&&sec<40.7);
         if(next===130||next===710){g.key('Space');g.release('Space');}
         hold('KeyD',sec>10&&sec<10.35);hold('KeyA',sec>10.40&&sec<10.74);
         const yaw=km>153&&km<203?.32*Math.sin(Math.PI*(km-153)/50):km>250&&km<291?-.41*Math.sin(Math.PI*(km-250)/41):0;
         if(km<520)g.look(yaw,-.095);
       }
       if(st.state==='stopped'&&stopAt===null){stopAt=sec;g.release('KeyW');g.action();}
       if(st.state==='walking'&&st.finaleT>4&&st.finaleT<18)g.look(Math.min(Math.PI,(st.finaleT-4)*.52),-.05);
       if(st.state==='walking'&&st.callDone&&st.finaleT>29)g.action();
       g.step(1/15);g.render();
       const state=g.state,record={i:next,files:{full:jpeg()},done:['c1-ride','ended'].includes(state.state)};
       const seen=[];
       for(const item of friends1b.cast){
         const f=item.f,depart=state.distance>=f.leaveAt-5&&!prev[f.key],show=depart||(sec<9)||(f.key==='jamie'&&sec>18&&sec<23)||(f.key==='sam'&&km>164&&km<185)||(f.key==='alex'&&km>263&&km<282);
         if(show){
           const group=f.person.group,focus=group.localToWorld(t.set(0,.86,0));
           if(f.key==='alex'&&depart&&f.blat>18){
             if(!alexCam)alexCam=(camLoc.alex||g.camera.position).clone();
             cam.position.copy(alexCam);
           }else{
             const delta=depart?(f.mode==='foot'?[2,1.55,-2.8]:[2.35,1.45,2.90]):(sec<9?[4,2.05,5.2]:[1.60,1.36,-2.15]);
             cam.position.copy(group.localToWorld(v.set(...delta)));camLoc[f.key]=cam.position.clone();
           }
           cam.lookAt(focus);cam.fov=depart?53:59;cam.updateProjectionMatrix();
           if(depart||f.key===['alex','jamie','sam'][Math.min(2,Math.floor(sec/3))]||sec>=9){
             g.renderer.render(g.scene,cam);record.files[depart?f.key+'-goodbye':'group']=jpeg(false);
           }
         }
         if(f.gone||f.inside)prev[f.key]=true;
         seen.push({key:f.key,mode:f.mode,step:f.step,inside:!!f.inside,gone:!!f.gone,ring:!!f.rang,waved:!!f.waved,stand:+f.stand.toFixed(3),look:+f.look.toFixed(3),wave:+(f.waveW||0).toFixed(3),crank:+f.crank.toFixed(3),d:+f.bd.toFixed(2),lat:+f.blat.toFixed(2)});
       }
       if(next%15===0||record.done)record.log={sec,state:state.state,d:state.distance,speed:state.speed,caption:state.caption,seen};
       frames.push(record);if(record.done){next++;break;}
     }return frames;
   };
 });
 const logs=[],sizes={},indices={};let done=false;
 while(!done){const rows=await p.evaluate(()=>takeRideFrames());for(const row of rows){
   for(const [n,jpg] of Object.entries(row.files)){const dir=path.join(root,n);if(!sizes[n])fs.mkdirSync(dir,{recursive:true});let i=sizes[n]||0;fs.writeFileSync(path.join(dir,String(i).padStart(5,'0')+'.jpg'),Buffer.from(jpg,'base64'));sizes[n]=i+1;(indices[n]??=[]).push(row.i);}
   if(row.log){logs.push(row.log);if(row.log.sec%15===0||row.done)console.log(row.log.sec,row.log.state,Math.round(row.log.d),JSON.stringify(sizes));}
   if(row.done)done=true;if(row.i>15*650)throw Error('Ride failed to finish');}}
 fs.writeFileSync(path.join(qa,'continuous-ride.json'),JSON.stringify({flags,fps:15,sizes,errors,logs}));assert.equal(errors.length,0);assert(logs.at(-1).seen.every(f=>f.gone||f.inside));assert(sizes['alex-goodbye']&&sizes['sam-goodbye']&&sizes['jamie-goodbye']);
 console.log('Rendering existing game audio graph');await p.evaluate(async()=>{window.rideBuffer=await rideAudio.startRendering();});
 const blocks=[];for(let j=0;j<sizes.full;j+=30){
   const pcm=await p.evaluate(([start,count])=>{const l=rideBuffer.getChannelData(0),r=rideBuffer.getChannelData(1),a=new Int16Array(count*3200*2);
     for(let i=0;i<a.length/2;i++){const n=start*3200+i;a[2*i]=Math.max(-1,Math.min(1,l[n]))*32767;a[2*i+1]=Math.max(-1,Math.min(1,r[n]))*32767;}
     const b=new Uint8Array(a.buffer);let out='';for(let i=0;i<b.length;i+=8192)out+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(out);
   },[j,Math.min(30,sizes.full-j)]);blocks.push(Buffer.from(pcm,'base64'));
 }
 const pcm=Buffer.concat(blocks),bytes=3200*4;
 for(const [key,seq] of Object.entries(indices)){
   const raw=Buffer.concat(seq.map(i=>pcm.subarray(i*bytes,(i+1)*bytes))),header=Buffer.alloc(44);
   header.write('RIFF');header.writeUInt32LE(36+raw.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);
   header.writeUInt32LE(48000,24);header.writeUInt32LE(192000,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(raw.length,40);
   fs.writeFileSync(path.join(root,key,'game.wav'),Buffer.concat([header,raw]));
 }console.log('Stereo gameplay audio saved');
}).catch(e=>{console.error(e);process.exitCode=1});
