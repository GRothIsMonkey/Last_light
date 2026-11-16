// The title screen's sound, all of it synthesized here (nothing is loaded): the evening (wind, cicadas, crickets,
// far traffic, leaves), a few slow notes of the game's own melody, a low undertone that arrives only if you stay, the
// sounds of what happens in the scene (a lamp's buzz, a bell far off, the night going quiet), and the menu's own small
// sounds (moving, opening, going back, choosing, sliders and switches).
// Under all of it, from the first moment (the horror revision): a low organic drone that breathes and will not hold
// its pitch, a throat of filtered air, a thin metallic resonance that is not any instrument, groans from somewhere too
// far away to name, a melody that sags like an old tape and is sometimes answered a semitone wrong, and silences: when
// the title's picture loses something, the evening stops making sound. Nothing is loud; nothing arrives suddenly.
//
// It has its own AudioContext, made on the first key or click (browsers allow sound only after one), suspended while
// the game is played and resumed on the way back to the title. Volume follows Settings: Master × Music for the notes,
// Master × Effects for everything else, and Mute silences it all.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// The prologue's old melody (audio.js), and Aftermath I's four notes: the title plays them slowly, as remembered.
const MELODY={summer:[220,329.63,440,493.88,369.99,329.63,293.66,220],search:[220,329.63,440,392,329.63,293.66,261.63,220],after:[293.66,369.99,440,329.63]};
const PAD={summer:[110,164.81,277.18],search:[110,164.81,261.63],after:[73.42,110,146.83]};
const BED={summer:{cic:1,crick:.5,wind:1,traffic:1,under:95},search:{cic:.55,crick:.9,wind:1.1,traffic:.6,under:60},after:{cic:.12,crick:.75,wind:1.25,traffic:.25,under:28}};
// The wrongness under it: drone, throat and resonance levels, how far a note sags (cents), how often the melody is
// answered wrongly, and the gap between the distant sounds (seconds).
const DREAD={summer:{drone:.03,throat:.012,comb:.0035,sag:7,wrong:.2,groan:[34,60]},search:{drone:.036,throat:.016,comb:.005,sag:13,wrong:.34,groan:[26,48]},
 after:{drone:.042,throat:.02,comb:.0075,sag:24,wrong:.5,groan:[18,36]}};

export function createMenuAudio(){
 const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
 let ctx=null,master=null,music=null,sfx=null,wet=null,noise=null,pink=null,bed=null,running=false,muted=false,mood='summer',vol={master:1,music:1,sfx:1};
 let meterNode=null,limiter=null,t=0,nextNote=0,noteI=0,nextCrick=0,nextCar=0,nextGust=0,nextGroan=0,underOn=false,duck=1,lastTick=0,started=false,hush=null,dread=null;
 const now=()=>ctx.currentTime;
 function gain(v=0){const g=ctx.createGain();g.gain.value=v;return g;}
 function filt(type,f,q=1){const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b;}
 function pan(p){const n=ctx.createStereoPanner?ctx.createStereoPanner():null;if(n)n.pan.value=clamp(p,-1,1);return n;}
 function loop(buf){const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;s.start(0,Math.random()*2);return s;}
 // A night's space: a soft, long tail made of decaying noise (no impulse file needed).
 function impulse(sec=3.4){const n=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(2,n,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++){const k=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-k,3.2)*(k<.012?k/.012:1);}}return b;}
 function build(){
  ctx=new AC();const lim=limiter=ctx.createDynamicsCompressor();lim.threshold.value=-10;lim.ratio.value=4;lim.attack.value=.005;lim.release.value=.25;
  master=gain(0);hush=gain(1);master.connect(hush).connect(lim).connect(ctx.destination);/* (hush: the title's silences, under every bus) */music=gain(vol.music);sfx=gain(vol.sfx);music.connect(master);sfx.connect(master);
  const conv=ctx.createConvolver();conv.buffer=impulse();wet=gain(1);wet.connect(conv);const wetOut=gain(.55);conv.connect(wetOut).connect(master);
  const len=ctx.sampleRate*4;noise=ctx.createBuffer(1,len,ctx.sampleRate);pink=ctx.createBuffer(1,len,ctx.sampleRate);
  {const w=noise.getChannelData(0),p=pink.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<len;i++){const x=Math.random()*2-1;w[i]=x;b0=.99765*b0+x*.099046;b1=.963*b1+x*.2965164;b2=.57*b2+x*1.0526913;p[i]=(b0+b1+b2+x*.1848)*.16;}}
  // the evening's bed
  const B={duck:gain(1)};B.duck.connect(sfx);
  B.wind=gain(0);loop(pink).connect(filt('lowpass',420,.6)).connect(B.wind).connect(B.duck);
  B.leaves=gain(0);loop(noise).connect(filt('bandpass',2600,.7)).connect(B.leaves).connect(B.duck);
  B.traffic=gain(0);loop(pink).connect(filt('lowpass',150,.7)).connect(B.traffic).connect(B.duck);
  B.cic=[-.55,.6].map((p,i)=>{const amp=gain(.5),out=gain(0),lfo=ctx.createOscillator(),depth=gain(.5);lfo.frequency.value=40+i*8;lfo.connect(depth).connect(amp.gain);lfo.start();
   const pn=pan(p),chain=loop(noise).connect(filt('bandpass',5000+i*650,6)).connect(amp).connect(out);(pn?out.connect(pn):out).connect(B.duck);return {out,rate:.06+i*.045,ph:i*2.3};});
  // the undertone: two low tones a little apart, so they beat slowly, and a rumble under them
  B.under=gain(0);B.under.connect(B.duck);for(const f of [48.9,51.4]){const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;o.connect(gain(.5)).connect(B.under);o.start();}
  loop(pink).connect(filt('lowpass',90,.8)).connect(gain(.8)).connect(B.under);
  // the pad under the notes: barely there
  B.pad=gain(0);B.pad.connect(music);B.padOsc=[];for(let i=0;i<3;i++){const o=ctx.createOscillator();o.type=i===2?'triangle':'sine';o.frequency.value=PAD.summer[i];const g=gain(i===2?.18:.5);o.connect(g).connect(B.pad);o.start();B.padOsc.push(o);}
  B.pad.connect(wet);
  // the pad does not hold its pitch: a slow wow and a faint flutter, like a tape that has been in a warm car
  {const wow=ctx.createOscillator(),wd=gain(7),fl=ctx.createOscillator(),fd=gain(1.6);wow.frequency.value=.17;fl.frequency.value=5.3;wow.connect(wd);fl.connect(fd);
   for(const o of B.padOsc){wd.connect(o.detune);fd.connect(o.detune);}wow.start();fl.start();}
  bed=B;buildDread();}
 // ---- the dread: present from the first moment, under the evening ------------------------------------------------------
 function lfo(rate,depth,target,type='sine'){const o=ctx.createOscillator();o.type=type;o.frequency.value=rate;const g=gain(depth);o.connect(g).connect(target);o.start();return o;}
 function buildDread(){const D={};
  // the drone: low saws a fifth and a flat ninth apart, behind a filter that opens and closes like breathing; none of
  // them holds its pitch, so they beat against each other slowly
  D.drone=gain(0);D.drone.connect(music);D.droneOsc=[];
  const lp=filt('lowpass',170,3.2);lfo(.047,70,lp.frequency);lfo(.013,40,lp.frequency);lp.connect(D.drone);
  for(const [f,v,r] of [[41.2,.5,.071],[61.4,.32,.053],[87.4,.2,.089],[41.45,.4,.037]]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=f;lfo(r,14,o.detune);
   o.connect(gain(v)).connect(lp);o.start();D.droneOsc.push(o);}
  D.drone.connect(wet);
  // the throat: air through something that is not quite a room, its resonance moving on its own
  D.throat=gain(0);D.throat.connect(sfx);const th=filt('bandpass',210,9);lfo(.031,70,th.frequency);lfo(.0113,35,th.frequency);
  const tg=gain(.6);lfo(.11,.4,tg.gain);loop(pink).connect(th).connect(tg).connect(D.throat);const tp=pan(-.3);(tp?D.throat.connect(tp):D.throat).connect(wet);
  // the resonance: noise ringing in a short feedback delay, a thin pitched whine that is no instrument, its pitch drifting
  D.comb=gain(0);const dl=ctx.createDelay(.05);dl.delayTime.value=1/97;lfo(.023,.00012,dl.delayTime);const fb=gain(.72),cl=filt("lowpass",1800,-3);
  const src=gain(1);loop(noise).connect(filt('bandpass',900,.6)).connect(src);src.connect(dl);dl.connect(cl).connect(fb).connect(dl);cl.connect(D.comb);const cg=gain(1);lfo(.06,.8,cg.gain);
  D.comb.connect(cg).connect(sfx);cg.connect(wet);
  dread=D;}
 function dreadLevels(on=true,tc=4){const R=DREAD[mood]||DREAD.summer;setTarget(dread.drone,on?R.drone:0,tc);setTarget(dread.throat,on?R.throat:0,tc*1.3);setTarget(dread.comb,on?R.comb:0,tc*2);}
 // something far off that might be an animal and is not: a voice-like formant falling slowly, trembling, mostly reverb
 function groan(at,v=.02){const o=ctx.createOscillator();o.type='sawtooth';const f0=62+Math.random()*48;o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(f0*.74,at+4.2);
  lfo(4.6+Math.random()*2,9,o.detune);
  const f1=filt('bandpass',520,7),f2=filt('bandpass',880,8);f1.frequency.setValueAtTime(560,at);f1.frequency.linearRampToValueAtTime(380,at+4.2);f2.frequency.setValueAtTime(940,at);f2.frequency.linearRampToValueAtTime(640,at+4.2);
  const g=gain(0);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+1.4);g.gain.linearRampToValueAtTime(v*.7,at+2.8);g.gain.linearRampToValueAtTime(0,at+4.6);
  const lp=filt('lowpass',1100,.5),p=pan(Math.random()*1.6-.8),dry=gain(.35);o.connect(f1).connect(g);o.connect(f2).connect(g);g.connect(lp);lp.connect(dry);(p?dry.connect(p):dry).connect(sfx);lp.connect(wet);
  o.start(at);o.stop(at+4.8);}
 function level(){return muted?0:1.15*vol.master;}
 function setTarget(g,v,tc=.5){if(g)g.gain.setTargetAtTime(v,now(),tc);}
 // ---- notes -----------------------------------------------------------------------------------------------------------
 function pianoNote(f,at,v=.05,len=4.2){// a soft felt-piano-ish note: a few partials, quick attack, long decay; a touch of detune
  const out=gain(0);out.connect(music);out.connect(wet);
  for(const [m,a,d] of [[1,1,1],[2,.32,.55],[3,.12,.35],[4.02,.05,.2]])for(const det of [-1.2,1.4]){const o=ctx.createOscillator();o.type='sine';o.frequency.value=f*m*(1+det/1200*(mood==='after'?3:1));const sag=(DREAD[mood]||DREAD.summer).sag;o.detune.setValueAtTime(0,at);o.detune.linearRampToValueAtTime(-sag*(.6+Math.random()*.8),at+len*d);const g=gain(0);
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v*a*.5,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+len*d);o.connect(g).connect(out);o.start(at);o.stop(at+len*d+.1);}
  out.gain.setValueAtTime(1,at);
  // (the hammer: a breath of noise)
  const n=ctx.createBufferSource();n.buffer=noise;const ng=gain(0);ng.gain.setValueAtTime(0,at);ng.gain.linearRampToValueAtTime(v*.08,at+.004);ng.gain.exponentialRampToValueAtTime(.0001,at+.08);n.connect(filt('bandpass',f*3,.8)).connect(ng).connect(out);n.start(at,Math.random()*2);n.stop(at+.12);}
 function bell(at,v=.05,{panTo=0,far=true,flat=1}={}){const out=gain(v);const p=pan(panTo);const lp=filt('lowpass',far?3200:9000,.6);(p?out.connect(lp).connect(p):out.connect(lp)).connect(sfx);out.connect(wet);
  for(const [f,g,d] of [[2930,1,1.2],[4120,.62,.85],[6250,.35,.5],[7900,.16,.3]]){const o=ctx.createOscillator();o.frequency.value=f*flat*(1+(Math.random()-.5)*.004);const e=gain(0);e.gain.setValueAtTime(0,at);e.gain.linearRampToValueAtTime(g,at+.004);e.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(e).connect(out);o.start(at);o.stop(at+d+.05);}}
 function tone(f,at,v,d,type='sine',to=sfx,glide=null){const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,at);if(glide)o.frequency.exponentialRampToValueAtTime(glide,at+d);const g=gain(0);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(g).connect(to);o.start(at);o.stop(at+d+.05);return g;}
 function burst(at,v,d,type,f,q=1,to=sfx){const s=ctx.createBufferSource();s.buffer=noise;const g=gain(0);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.004);g.gain.exponentialRampToValueAtTime(.0001,at+d);s.connect(filt(type,f,q)).connect(g).connect(to);s.start(at,Math.random()*3);s.stop(at+d+.05);}
 function swell(at,v,d,f0,f1,to=sfx){const s=ctx.createBufferSource();s.buffer=pink;const b=filt('bandpass',f0,.9);b.frequency.setValueAtTime(f0,at);b.frequency.exponentialRampToValueAtTime(f1,at+d);const g=gain(0);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+d*.65);g.gain.linearRampToValueAtTime(0,at+d);s.connect(b).connect(g).connect(to);s.start(at,Math.random()*2);s.stop(at+d+.05);}

 // ---- the menu's own sounds ------------------------------------------------------------------------------------------------
 function ui(kind,o={}){if(!running||!ctx)return;const at=now()+.005;
  if(kind==='move'){const f=2350+Math.random()*180;tone(f,at,.016,.09);tone(f*2.01,at,.005,.05);}
  else if(kind==='tick'){if(o.throttle&&at-lastTick<.045)return;lastTick=at;tone(900+1300*clamp(o.value??.5,0,1),at,.012,.035,'triangle');}
  else if(kind==='tab'){burst(at,.03,.025,'bandpass',3200,2);tone(1560,at,.01,.07);}
  else if(kind==='on'){tone(1180,at,.014,.06);tone(1770,at+.05,.014,.09);}
  else if(kind==='off'){tone(1500,at,.012,.06);tone(1000,at+.05,.012,.09);}
  else if(kind==='open'){swell(at,.05,.42,700,2400);tone(440,at+.02,.012,.9);tone(659.25,at+.08,.008,.8);}
  else if(kind==='back'){tone(880,at,.014,.14);tone(587.33,at+.07,.012,.22);}
  else if(kind==='confirm'){bell(at,.022,{far:false});tone(1318.5,at,.008,.5);}
  else if(kind==='begin'){const v=o.soft?.6:1;pianoNote(440,at,.05*v,5);pianoNote(659.25,at+.18,.035*v,5);swell(at,.035*v,1.6,300,1200);}}
 // ---- what happens in the scene ---------------------------------------------------------------------------------------------
 let buzz=null;
 function event(kind,d={}){if(!running||!ctx)return;const at=now()+.01;
  if(kind==='bell'){const p=d.pan??0;bell(at,.03,{panTo:p});if(d.twice!==false)bell(at+(d.wrong?1.25:.42),.026,{panTo:p,flat:d.wrong?.944:1});}
  else if(kind==='flicker'){// the lamp's ballast: a buzz while it struggles, a tick each time it catches
   const steps=d.steps||[];const g=gain(0),o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=120;o.connect(filt('bandpass',360,3)).connect(g).connect(sfx);o.start(at);o.stop(at+(steps.at?.(-1)?.[0]??1)+.4);
   let last=1;for(const [s,v] of steps){g.gain.setValueAtTime(v>.5?.0035:.012,at+s);if((v>.5)!==(last>.5))burst(at+s,.02,.02,'highpass',2500,.7);last=v;}g.gain.setValueAtTime(0,at+(steps.at?.(-1)?.[0]??1)+.2);}
  else if(kind==='figure'){swell(at,.018,4.5,90,240);}
  else if(kind==='gone'){// the night goes quiet for a breath, the way it did on the pond road
   tone(46,at,.05,1.2,'sine');setTarget(bed.duck,.04,.08);duck=0;}
  else if(kind==='cut'){swell(at,.012,1.2,500,180);}
  // (the title art's events)
  else if(kind==='silence'){// everything stops, all at once but not abruptly, and comes back slowly
   const dur=Math.max(1,d.dur||4);hush.gain.cancelScheduledValues(at);hush.gain.setTargetAtTime(.04,at,.18);hush.gain.setTargetAtTime(1,at+dur,1.6);}
  else if(kind==='absence'){// the drone and the pad sag, as if the tape slowed; a breath of air where something was
   if(d.gone){for(const o of [...dread.droneOsc,...bed.padOsc]){const p=o.detune;p.cancelScheduledValues(at);p.setValueAtTime(0,at);p.linearRampToValueAtTime(-55,at+1.6);p.linearRampToValueAtTime(0,at+8);}
    swell(at,.012,3.2,1400,300);}else swell(at,.008,2.4,250,700);}
  else if(kind==='dark'){// something very low passing over, from one side to the other
   const s=ctx.createBufferSource();s.buffer=pink;const lp=filt('lowpass',70,1.2),g=gain(0),p=pan(-.8);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.06,at+5);g.gain.linearRampToValueAtTime(0,at+12);
   if(p){p.pan.setValueAtTime(-.8,at);p.pan.linearRampToValueAtTime(.8,at+12);}s.connect(lp).connect(g);(p?g.connect(p):g).connect(sfx);s.start(at,Math.random()*2);s.stop(at+12.2);
   tone(30.9,at+2,.03,9,'sine');}
  else if(kind==='erase'){// a dry, granular hiss, like a recording being worn through
   const s=ctx.createBufferSource();s.buffer=noise;const hp=filt('highpass',3800,.7),g=gain(0),tr=gain(0);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.007,at+2.5);g.gain.linearRampToValueAtTime(.007,at+6);g.gain.linearRampToValueAtTime(0,at+9);
   lfo(13,1,tr.gain,'square');s.connect(hp).connect(tr).connect(g).connect(sfx);s.start(at,Math.random()*2);s.stop(at+9.2);}}
 // ---- every frame (from menu.js) -----------------------------------------------------------------------------------------------
 function frame(dt){if(!running||!ctx)return;t+=dt;const B=bed,M=BED[mood]||BED.summer,at=now();
  if(duck<1){duck=Math.min(1,duck+dt/5.5);if(duck>=1||duck>.25)setTarget(B.duck,Math.max(.04,duck),1.2);}
  setTarget(B.wind,(.03+.012*Math.sin(t*.19)+.008*Math.sin(t*.53))*M.wind,1.2);
  setTarget(B.leaves,Math.max(0,Math.sin(t*.19)*.006+(at<nextGust-6?0:.004))*M.wind,.8);
  for(const c of B.cic){const sw=.55+.45*Math.sin(t*c.rate+c.ph);setTarget(c.out,.022*sw*M.cic,.9);}
  if(at>nextCar){nextCar=at+28+Math.random()*40;setTarget(B.traffic,.05*M.traffic,3);setTimeoutish(()=>setTarget(B.traffic,0,5),5);}
  if(at>nextGust){nextGust=at+14+Math.random()*16;swell(at,.012*M.wind,5,260,900);}
  if(at>nextCrick&&M.crick>0){nextCrick=at+.9+Math.random()*1.6/M.crick;const p=pan(Math.random()*1.6-.8),g=gain(.35*M.crick);(p?g.connect(p):g).connect(B.duck);const f=4300+Math.random()*700;for(let k=0;k<3;k++)tone(f,at+.02+k*.045,.012,.025,'sine',g);}
  if(at>nextGroan){const R=DREAD[mood]||DREAD.summer;nextGroan=at+R.groan[0]+Math.random()*(R.groan[1]-R.groan[0]);groan(at+.05,mood==='after'?.024:.018);}
  if(!underOn&&t>M.under){underOn=true;setTarget(B.under,mood==='after'?.05:.035,14);}
  // the notes: one at a time, slowly; fewer as the summer goes on
  if(at>nextNote){const seq=MELODY[mood]||MELODY.summer,f=seq[noteI++%seq.length],rest=mood==='after'?4.8:mood==='search'?3.6:2.6;
   if(!(mood!=='summer'&&Math.random()<.18)){pianoNote(f,at+.02,mood==='after'?.04:.045,mood==='after'?6:4.6);
    // after the first time through, the melody is sometimes answered a semitone low, or a tritone under: the harmony under the memory
    if(noteI>(MELODY[mood]||MELODY.summer).length&&Math.random()<(DREAD[mood]||DREAD.summer).wrong)pianoNote(f*(Math.random()<.6?.9439:.7071),at+.36+Math.random()*.3,.022,5.2);}
   nextNote=at+rest+Math.random()*1.6+(noteI%seq.length===0?rest*2.2:0);}
  timers.forEach(x=>{x.left-=dt;});for(const x of timers.filter(x=>x.left<=0)){timers.splice(timers.indexOf(x),1);x.fn();}}
 const timers=[];function setTimeoutish(fn,sec){timers.push({fn,left:sec});}

 function fadeIn(){if(!ctx)return;try{ctx.resume?.();}catch{}running=true;master.gain.cancelScheduledValues(now());setTarget(master,level(),1.4);
  setTarget(bed.pad,mood==='after'?.022:.018,6);dreadLevels(true,2.5);hush.gain.cancelScheduledValues(now());setTarget(hush,1,.4);
  if(!started){started=true;nextNote=now()+2.5;nextCrick=now()+1;nextCar=now()+12;nextGust=now()+6;nextGroan=now()+9+Math.random()*6;}}
 return {
  unlock(s){if(!AC)return;if(s)Object.assign(vol,{master:s.volume??1,music:s.music??1,sfx:s.sfx??1});muted=!!s?.muted;
   try{if(!ctx)build();setMoodNow(mood);fadeIn();}catch(e){try{console.warn('[menu-audio] no sound:',e?.message||e);}catch{}ctx=null;running=false;}},
  enter(s){if(!ctx)return;if(s)this.setMix(s);underOn=false;t=0;fadeIn();},
  leave(){if(!ctx||!running)return;running=false;setTarget(master,0,.35);setTarget(bed.pad,0,.3);setTarget(bed.under,0,.3);dreadLevels(false,.3);underOn=false;const c=ctx;setTimeout?.(()=>{if(!running)try{c.suspend?.();}catch{}},1600);},
  sleep(){this.leave();},wake(s){this.enter(s);},
  setMuted(m,s){muted=!!m;if(s)Object.assign(vol,{master:s.volume??1,music:s.music??1,sfx:s.sfx??1});if(ctx&&running)setTarget(master,level(),.25);},
  setMix(s){Object.assign(vol,{master:s.volume??1,music:s.music??1,sfx:s.sfx??1});muted=!!s.muted;if(!ctx)return;setTarget(music,vol.music,.15);setTarget(sfx,vol.sfx,.15);if(running)setTarget(master,level(),.15);},
  setMood(m){mood=m in BED?m:'summer';setMoodNow(mood);if(ctx&&running&&dread)dreadLevels(true,3);},
  ui,event,frame,
  // (QA: how loud the menu's sound is right now, measured after the limiter: RMS and peak, linear)
  meter(){if(!ctx)return null;if(!meterNode){meterNode=ctx.createAnalyser();meterNode.fftSize=8192;limiter.connect(meterNode);}const d=new Float32Array(meterNode.fftSize);meterNode.getFloatTimeDomainData(d);let sum=0,peak=0;for(const x of d){sum+=x*x;peak=Math.max(peak,Math.abs(x));}return {rms:+Math.sqrt(sum/d.length).toFixed(5),peak:+peak.toFixed(5)};},
  get state(){return {available:!!AC,unlocked:!!ctx,running,muted,mood,context:ctx?.state||null,levels:ctx?{master:+master.gain.value.toFixed(3),music:+music.gain.value.toFixed(3),sfx:+sfx.gain.value.toFixed(3)}:null};}};
 function setMoodNow(m){if(!ctx||!bed)return;PAD[m].forEach((f,i)=>bed.padOsc[i].frequency.setTargetAtTime(f,now(),2));}
}
