// Generated sound. Everything is synthesized; nothing plays before the player asks.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function createAudio({context=null,random=Math.random}={}){
 const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
 let ctx=null,master,bus,noise,enabled=false;
 const layers={},loops=new Map();let nextNote=0,note=0,crickets=[],lastCrank=0,musicOn=true,nextBird=0;
 const shots=new Set();
 function shot(node){shots.add(node);node.onended=()=>{shots.delete(node);node.disconnect();};return node;}
 const listener={x:0,y:0,z:0,fx:0,fz:-1};
 function src(){const s=ctx.createBufferSource();s.buffer=noise;s.loop=true;s.start(0,random()*2.5);return s;}
 function filt(type,f,q=1){const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b;}
 function gain(v=0){const g=ctx.createGain();g.gain.value=v;return g;}
 function ensure(){if(!AC&&!context)return;if(ctx){if(!context)ctx.resume?.();return;}
  ctx=context||new AC();master=gain(0);const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=10;limiter.ratio.value=4;limiter.attack.value=.006;limiter.release.value=.22;master.connect(limiter).connect(ctx.destination);bus=gain(1);bus.connect(master);
  const len=ctx.sampleRate*3;noise=ctx.createBuffer(1,len,ctx.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<len;i++)data[i]=random()*2-1;
  // Cicadas: bright noise, pulsed, in two slowly swelling choruses.
  layers.cic=[-.6,.5].map((pan,i)=>{const s=src(),b=filt('bandpass',4700+i*700,5),amp=gain(0),out=gain(0),p=ctx.createStereoPanner();p.pan.value=pan;const lfo=ctx.createOscillator();lfo.frequency.value=38+i*9;const depth=gain(.5);lfo.connect(depth).connect(amp.gain);amp.gain.value=.5;lfo.start();s.connect(b).connect(amp).connect(out).connect(p).connect(bus);return {out,rate:.07+i*.05,phase:i*2};});
  const w=src();layers.wind=gain(0);w.connect(filt('lowpass',380)).connect(layers.wind).connect(bus);
  const r=src();layers.rush=gain(0);r.connect(filt('bandpass',900,.7)).connect(layers.rush).connect(bus);
  const t=src();layers.traffic=gain(0);t.connect(filt('lowpass',150)).connect(layers.traffic).connect(bus);
  const ty=src();layers.tyre=gain(0);ty.connect(filt('bandpass',300,1.1)).connect(layers.tyre).connect(bus);
  const gr=src();layers.grit=gain(0);gr.connect(filt('highpass',3200)).connect(layers.grit).connect(bus);
  const fw=ctx.createOscillator();fw.type='square';fw.frequency.value=40;layers.free=gain(0);fw.connect(filt('highpass',2600)).connect(layers.free).connect(bus);fw.start();layers.freeOsc=fw;
  const chain=src();layers.chain=gain(0);chain.connect(filt('bandpass',1650,1.7)).connect(layers.chain).connect(bus);
  crickets=[...Array(5)].map((_,i)=>({pan:-.8+i*.4,next:0,rate:.55+random()*.6,pitch:4300+random()*700,vol:.5+random()*.5}));
 }
 let volume=1;
 function setEnabled(on){enabled=on;if(!ctx)return;if(on&&!context)ctx.resume?.();master.gain.setTargetAtTime(on?.775*volume:0,ctx.currentTime,on?.3:.15);}
 function setVolume(v){volume=Math.max(0,Math.min(1,v));if(ctx&&enabled)master.gain.setTargetAtTime(.775*volume,ctx.currentTime,.1);}
 const now=()=>ctx.currentTime;
 function env(g,t,a,peak,d,shape='exp'){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);if(shape==='exp')g.gain.exponentialRampToValueAtTime(.0001,t+a+d);else g.gain.linearRampToValueAtTime(0,t+a+d);}
 function tone(freq,t,dur,vol,type='sine',out=bus,glide=null){const o=shot(ctx.createOscillator()),g=gain();o.type=type;o.frequency.setValueAtTime(freq,t);if(glide)o.frequency.exponentialRampToValueAtTime(glide,t+dur);env(g,t,.012,vol,dur);o.connect(g).connect(out);o.start(t);o.stop(t+dur+.1);return o;}
 function burst(t,dur,vol,type,f,q=1,out=bus){const s=shot(ctx.createBufferSource());s.buffer=noise;const b=filt(type,f,q),g=gain();env(g,t,.003,vol,dur);s.connect(b).connect(g).connect(out);s.start(t,random()*2);s.stop(t+dur+.05);}
 // Place a one-shot in the world relative to the listener.
 function spatial(pos,base=1,ref=6){const out=gain(0),p=ctx.createStereoPanner(),lp=filt('lowpass',18000);out.connect(lp).connect(p).connect(bus);
  if(pos){const dx=pos.x-listener.x,dz=pos.z-listener.z,dist=Math.hypot(dx,dz,(pos.y??listener.y)-listener.y);const rx=-listener.fz,rz=listener.fx;p.pan.value=clamp((dx*rx+dz*rz)/(dist||1),-1,1)*.85;
   out.gain.value=base*Math.min(1,ref/(dist+1));lp.frequency.value=Math.max(500,16000*Math.exp(-dist/55));if(dist>220)out.gain.value=0;}else out.gain.value=base;return out;}
 const SFX={
  bird(t,o){for(const [i,f] of [[0,2100],[.13,2450],[.35,1950]])tone(f,t+i,.10,.025,'sine',o,f*1.35);},
  sprinkler(t,o){burst(t,.03,.1,'highpass',2400,.7,o);burst(t+.01,.09,.03,'bandpass',5200,1.5,o);},
  dribble(t,o){tone(110,t,.14,.28,'sine',o,55);burst(t,.03,.06,'lowpass',900,.7,o);},
  rim(t,o){for(const [f,v] of [[520,.05],[1180,.03],[1730,.02]])tone(f,t,.6,v,'sine',o);},
  doorOpen(t,o){const c=shot(ctx.createOscillator()),b=filt('bandpass',900,9),g=gain();c.type='sawtooth';c.frequency.setValueAtTime(260,t);c.frequency.linearRampToValueAtTime(430,t+.45);env(g,t,.08,.035,.45,'lin');c.connect(b).connect(g).connect(o);c.start(t);c.stop(t+.6);burst(t,.02,.08,'bandpass',2600,2,o);},
  doorSlam(t,o){burst(t,.12,.35,'lowpass',1400,.8,o);tone(95,t,.18,.2,'sine',o,60);for(let k=0;k<4;k++)burst(t+.04+k*.035,.02,.06/(k+1),'bandpass',3000,3,o);burst(t+.16,.06,.1,'lowpass',1200,.8,o);},
  garage(t,o){const m=shot(ctx.createOscillator()),b=filt('lowpass',520),g=gain();m.type='sawtooth';m.frequency.value=112;env(g,t,.25,.07,3.3,'lin');m.connect(b).connect(g).connect(o);m.start(t);m.stop(t+3.7);
   for(let k=0;k<26;k++)burst(t+.2+k*.12+random()*.03,.03,.025,'bandpass',1800,2,o);burst(t+3.45,.14,.25,'lowpass',700,.7,o);},
  curb(t,o){burst(t,.045,.055,'lowpass',620,.8,o);burst(t+.014,.045,.018,'bandpass',2100,2,o);tone(1240,t+.016,.085,.007,'sine',o);},
  bikeDrop(t,o){burst(t,.09,.3,'lowpass',900,.6,o);for(let k=0;k<5;k++)burst(t+.03+k*.05+random()*.02,.03,.1/(1+k*.4),'bandpass',2200+random()*1800,4,o);tone(930,t+.04,.5,.035,'sine',o);tone(2310,t+.05,.35,.02,'sine',o);},
  kickstand(t,o){burst(t,.02,.12,'bandpass',2600,3,o);tone(1850,t+.01,.18,.03,'sine',o);},
  engineOff(t,o){tone(55,t,.6,.08,'sawtooth',o,40);},
  dog(t,o){for(const k of [0,.32]){const c=shot(ctx.createOscillator()),b=filt('bandpass',720,2.2),g=gain();c.type='sawtooth';c.frequency.setValueAtTime(420,t+k);c.frequency.exponentialRampToValueAtTime(230,t+k+.12);env(g,t+k,.01,.16,.14);c.connect(b).connect(g).connect(o);c.start(t+k);c.stop(t+k+.25);burst(t+k,.08,.05,'bandpass',1200,1.5,o);}},
  creak(t,o){const c=shot(ctx.createOscillator()),b=filt('bandpass',850,12),g=gain();c.type='sawtooth';c.frequency.setValueAtTime(170,t);c.frequency.linearRampToValueAtTime(205,t+.45);env(g,t,.1,.05,.45,'lin');c.connect(b).connect(g).connect(o);c.start(t);c.stop(t+.6);},
 };
 function sfx(name,pos,opts={}){if(!ctx||!enabled||!SFX[name])return;const refs={garage:9,doorSlam:9,dog:30,dribble:7,sprinkler:5,rim:8};const o=spatial(pos,opts.gain??1,refs[name]||6);SFX[name](now()+.01,o);}
 function bell(pos=null,g=1){if(!ctx||!enabled)return;const o=spatial(pos,g,pos?10:6),t=now();for(const k of [0,.16]){tone(1760,t+k,1.3,.12,'sine',o);tone(1760*2.76,t+k,.5,.03,'sine',o);tone(1760*5.4,t+k,.2,.012,'sine',o);}}
 function footstep(surface,v){if(!ctx||!enabled)return;const t=now();if(surface==='grass'){burst(t,.08,.05*v,'lowpass',850,.7);burst(t+.01,.05,.012*v,'highpass',4000,.7);}else{burst(t,.04,.06*v,'bandpass',1700,1.2);tone(80,t,.06,.04*v,'sine',bus,50);}}
 // A distant, ordinary two-syllable call. A soft harmonic source and changing
 // vowel resonances replace the old sawtooth/feedback echo. No second voice.
 function call(){if(!ctx||!enabled)return;const t=now()+.2;
  const out=spatial({x:listener.x-13,y:listener.y+1,z:listener.z+38},.95,24);
  const soft=filt('lowpass',2100,.55);soft.connect(out);
  SFX.doorSlam(t,spatial({x:listener.x-13,z:listener.z+38},.3,12));
  const real=new Float32Array(32),imag=new Float32Array(32);for(let n=1;n<32;n++)imag[n]=1/Math.pow(n,1.65);
  const voice=ctx.createPeriodicWave(real,imag);
  for(const [st,dur,f0,fend,f1,f2] of [[.7,.30,242,228,660,1450],[1.08,.69,236,203,510,1170]]){
   const c=shot(ctx.createOscillator()),g=gain(),a=filt('bandpass',f1,2),b=filt('bandpass',f2,3),breath=gain(.12);
   c.setPeriodicWave(voice);c.frequency.setValueAtTime(f0,t+st);c.frequency.linearRampToValueAtTime(f0+6,t+st+.09);c.frequency.linearRampToValueAtTime(fend,t+st+dur);
   a.frequency.setValueAtTime(f1,t+st);a.frequency.linearRampToValueAtTime(f1*.86,t+st+dur);
   g.gain.setValueAtTime(0,t+st);g.gain.linearRampToValueAtTime(.15,t+st+.07);g.gain.setValueAtTime(.12,t+st+dur-.12);g.gain.linearRampToValueAtTime(0,t+st+dur);
   c.connect(a).connect(g);c.connect(b).connect(breath).connect(g);g.connect(soft);c.start(t+st);c.stop(t+st+dur+.03);
   burst(t+st-.035,.045,.015,'bandpass',1800,1,soft);
  }
 }
 function ending(){if(!ctx)return;const t=now()+.4;
  for(const x of Object.values(layers))if(x?.gain)x.gain.setTargetAtTime(0,now(),.8);
  for(const x of layers.cic)x.out.gain.setTargetAtTime(0,now(),.8);for(const l of loops.values())l.out.gain.setTargetAtTime(0,now(),.8);
for(const [f,d] of [[220,0],[277.18,.5],[329.63,1.0],[440,1.6]])tone(f,t+d,6,.045);musicOn=false;}
 function leaving(){if(!ctx||!enabled)return;const t=now();bell(null,.35);burst(t+.3,.05,.03,'bandpass',2000,2);}
 function reset(){musicOn=true;nextNote=0;note=0;nextBird=0;lastCrank=0;if(!ctx)return;
  for(const s of shots){try{s.stop();s.disconnect();}catch{}}shots.clear();
  for(const c of crickets)c.next=0;
  for(const x of Object.values(layers))if(x?.gain){x.gain.cancelScheduledValues(now());x.gain.setValueAtTime(0,now());}
  for(const x of layers.cic){x.out.gain.cancelScheduledValues(now());x.out.gain.setValueAtTime(0,now());}
  for(const l of loops.values()){l.out.gain.cancelScheduledValues(now());l.out.gain.setValueAtTime(0,now());}
 }
 // Continuous layers follow the ride; life thins out as friends go home.
 function update(dt,s){if(!ctx||!enabled)return;const t=now();listener.x=s.listener.x;listener.y=s.listener.y;listener.z=s.listener.z;const fl=Math.hypot(s.forward.x,s.forward.z)||1;listener.fx=s.forward.x/fl;listener.fz=s.forward.z/fl;
  const life=.35+.65*(s.friendsLeft/3),p=s.p,night=s.night,set=(g,v,tc=.4)=>g.gain.setTargetAtTime(v,t,tc);
  for(const c of layers.cic){const swell=.55+.45*Math.sin(t*c.rate+c.phase);set(c.out,.05*swell*(1-p*.75)*(1-night)*(.5+.5*life),.8);}
  set(layers.wind,.02+.012*Math.sin(t*.21)+(s.state==='walking'||s.state==='stopped'?.008:0),1);set(layers.rush,Math.min(.03,s.speed*s.speed*.0014));
  set(layers.traffic,(.022+.012*Math.max(0,Math.sin(t*.09)))*life*(1-night*.6),1.5);
  const roll=s.onBike?s.speed:0,grass=s.surface==='grass';set(layers.tyre,roll*(grass?.007:.011),.15);set(layers.grit,roll*(grass?.0035:.0016),.15);
  set(layers.chain,s.onBike&&s.pedal?Math.min(.008,roll*.0014):0,.16);
  layers.freeOsc.frequency.setTargetAtTime(Math.max(8,roll/1.95*16),t,.1);set(layers.free,s.onBike&&s.coasting?Math.min(.012,roll*.004):0,.08);
  if(s.pedal&&s.crank!==undefined){const half=Math.floor(s.crank/Math.PI);if(half!==lastCrank){lastCrank=half;burst(t,.03,.008,'bandpass',1900,2);}}
  // Crickets arrive as the light goes.
  const ck=smooth((p-.35)/.45)*.6+night*.25;for(const c of crickets){if(ck<.02)break;if(t>=c.next){c.next=t+1/c.rate*(.8+random()*.5);const o=gain(ck*c.vol*.9),pn=ctx.createStereoPanner();pn.pan.value=c.pan;o.connect(pn).connect(bus);
   for(let k=0;k<3;k++)tone(c.pitch,t+.02+k*.045,.022,.03,'sine',o);}}
  if(p<.55&&s.state==='riding'&&t>nextBird){nextBird=t+8+random()*13;sfx('bird',{x:listener.x+(random()<.5?-1:1)*18,y:listener.y+6,z:listener.z-22},{gain:1-p});}
  // Positional loops from the world (a mower early on, a car engine).
  for(const src of s.sources||[]){let l=loops.get(src.kind);if(!l){l=makeLoop(src.kind);loops.set(src.kind,l);}const dx=src.pos.x-listener.x,dz=src.pos.z-listener.z,dist=Math.hypot(dx,dz);
   const rx=-listener.fz,rz=listener.fx;l.pan.pan.setTargetAtTime(clamp((dx*rx+dz*rz)/(dist||1),-1,1)*.8,t,.1);set(l.out,src.level*l.vol*Math.min(1,l.ref/(dist+1))*(dist>260?0:1),.3);}
  for(const [k,l] of loops)if(!(s.sources||[]).some(x=>x.kind===k))set(l.out,0,.3);
  // The old melody thins out through the ride and falls silent at the end of the street.
  if(musicOn&&s.finale<2&&t>nextNote){const notes=[220,329.63,440,493.88,369.99,329.63,293.66,220];tone(notes[note++%notes.length],t,4.5,.055*(1-p*.35));tone(110,t,5,.018);nextNote=t+3.5+random()*2+p*2.5;}
 }
 function makeLoop(kind){const out=gain(0),pan=ctx.createStereoPanner();out.connect(pan).connect(bus);
  if(kind==='mower'){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=96;const lp=filt('lowpass',650),am=gain(.6),lfo=ctx.createOscillator(),d=gain(.35);lfo.frequency.value=7;lfo.connect(d).connect(am.gain);o.connect(lp).connect(am).connect(out);o.start();lfo.start();const n=src();n.connect(filt('bandpass',400,.8)).connect(gain(.2)).connect(out);return {out,pan,vol:.09,ref:40};}
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=48;const lp=filt('lowpass',320);o.connect(lp).connect(out);o.start();const n=src();n.connect(filt('lowpass',500)).connect(gain(.25)).connect(out);return {out,pan,vol:.18,ref:10};}
 return {ensure,setEnabled,setVolume,sfx,bell,footstep,call,ending,leaving,reset,update,get ctx(){return ctx;},get activeShots(){return shots.size;},get enabled(){return enabled;}};
}
