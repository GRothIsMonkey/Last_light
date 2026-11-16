// Renders the title screen's sound (dist/menu-audio.js) offline, faster than real time, to a WAV file, with the title
// art's events at fixed times, and reports its level second by second. For review and for checks: nobody has to wait,
// and the same seconds can be listened to by anyone.
//   node tools/title-art/render-menu-sound.mjs <out.wav> [mood=summer] [seconds=90]
// Needs Chromium (Playwright) and a static server for dist/ at BASE (default http://localhost:8123/).
import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let pw;for(const p of [null,'/opt/node-tools/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const [out,mood='summer',secs='90']=process.argv.slice(2);
const EVENTS=[[30,'absence',{gone:true}],[40,'absence',{gone:false}],[48,'dark',{}],[62,'bell',{twice:true,wrong:true}],[64.7,'silence',{dur:4.5}],[76,'erase',{}]];
const b=await pw.chromium.launch({args:['--no-sandbox']});const p=await b.newPage();p.on('console',m=>{if(m.type()==='error')console.error(m.text());});
await p.goto((process.env.BASE||'http://localhost:8123/')+'menu-audio.js');
const r=await p.evaluate(async([mood,DUR,EVENTS])=>{const SR=44100,off=new OfflineAudioContext(2,SR*DUR,SR);
 window.AudioContext=function(){return off;};const {createMenuAudio}=await import('/menu-audio.js');const s=createMenuAudio();
 s.setMood(mood);s.unlock({volume:1,music:1,sfx:1,muted:false});const dt=.05;let ei=0;
 for(let k=1;k*dt<DUR-.1;k++){const t=k*dt;off.suspend(t).then(()=>{while(ei<EVENTS.length&&EVENTS[ei][0]<=t){s.event(EVENTS[ei][1],EVENTS[ei][2]);ei++;}s.frame(dt);off.resume();});}
 const buf=await off.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1);const per=[];let peak=0,sum=0;
 for(let sec=0;sec<DUR;sec++){let ss=0,pk=0;for(let i=sec*SR;i<(sec+1)*SR;i++){const x=Math.max(Math.abs(L[i]),Math.abs(R[i]));ss+=L[i]*L[i]+R[i]*R[i];pk=Math.max(pk,x);}per.push([+Math.sqrt(ss/(2*SR)).toFixed(4),+pk.toFixed(3)]);peak=Math.max(peak,pk);sum+=ss;}
 const pcm=new Int16Array(L.length*2);for(let i=0;i<L.length;i++){pcm[2*i]=Math.max(-1,Math.min(1,L[i]))*32767;pcm[2*i+1]=Math.max(-1,Math.min(1,R[i]))*32767;}
 const u8=new Uint8Array(pcm.buffer);let bin='';for(let i=0;i<u8.length;i+=0x8000)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));
 return {per,peak,rms:Math.sqrt(sum/(2*L.length)),pcm:btoa(bin),SR};},[mood,+secs,EVENTS]);
await b.close();
const data=Buffer.from(r.pcm,'base64'),h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+data.length,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(2,22);
h.writeUInt32LE(r.SR,24);h.writeUInt32LE(r.SR*4,28);h.writeUInt16LE(4,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);fs.writeFileSync(out,Buffer.concat([h,data]));
console.log(JSON.stringify({mood,seconds:+secs,rms:+r.rms.toFixed(4),peak:+r.peak.toFixed(3),events:EVENTS.map(e=>e[0]+'s '+e[1]),perSecond:r.per}));
