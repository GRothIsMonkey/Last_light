// Generated sound. Everything is synthesized; nothing plays before the player asks.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function createAudio({context=null,random=Math.random}={}){
 const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
 let ctx=null,master,bus,noise,enabled=false,memLP=null;
 const layers={},loops=new Map();let nextNote=0,note=0,crickets=[],lastCrank=0,musicOn=true,nextBird=0;
 const shots=new Set();
 function shot(node){shots.add(node);node.onended=()=>{shots.delete(node);node.disconnect();};return node;}
 const listener={x:0,y:0,z:0,fx:0,fz:-1};
 function src(){const s=ctx.createBufferSource();s.buffer=noise;s.loop=true;s.start(0,random()*2.5);return s;}
 function filt(type,f,q=1){const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b;}
 function gain(v=0){const g=ctx.createGain();g.gain.value=v;return g;}
 function ensure(){if(!AC&&!context)return;if(ctx){if(!context)ctx.resume?.();return;}
  ctx=context||new AC();master=gain(0);const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=10;limiter.ratio.value=4;limiter.attack.value=.006;limiter.release.value=.22;master.connect(limiter).connect(ctx.destination);bus=gain(1);memLP=filt('lowpass',20000,.5);bus.connect(memLP).connect(master);
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
  // The night chapter: knuckles on a window, a pebble on glass, a sash sliding up, a flashlight,
  // a radio's squelch and a car door.
  tap(t,o){for(const k of [0,.19,.36]){burst(t+k,.035,.16,'bandpass',2100+random()*400,2.5,o);tone(190,t+k,.05,.05,'sine',o,120);}},
  pebble(t,o){burst(t,.012,.12,'bandpass',4300,3,o);tone(3150+random()*300,t+.002,.07,.012,'sine',o);},
  window(t,o){const s=shot(ctx.createBufferSource());s.buffer=noise;const b=filt('bandpass',680,2.2),g=gain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.15);g.gain.linearRampToValueAtTime(.04,t+.6);g.gain.linearRampToValueAtTime(0,t+.8);s.connect(b).connect(g).connect(o);s.start(t,random()*2);s.stop(t+.85);burst(t+.78,.04,.08,'lowpass',900,.8,o);},
  click(t,o){burst(t,.008,.06,'bandpass',3200,3,o);burst(t+.05,.006,.04,'bandpass',2600,3,o);},
  squelch(t,o){burst(t,.12,.035,'highpass',1600,.7,o);tone(1180,t,.06,.012,'square',o);},
  carDoor(t,o){burst(t,.1,.3,'lowpass',650,.8,o);tone(88,t,.16,.14,'sine',o,60);burst(t+.02,.03,.05,'bandpass',2400,2,o);},
 };
 function sfx(name,pos,opts={}){if(!ctx||!enabled||!SFX[name])return;const refs={garage:9,doorSlam:9,dog:30,dribble:7,sprinkler:5,rim:8,tap:5,pebble:6,window:5,carDoor:12,squelch:7};const o=spatial(pos,opts.gain??1,refs[name]||6);SFX[name](now()+.01,o);}
 // An ordinary bicycle bell. tunnel: rung somewhere inside a concrete pipe, so a little duller, with
 // the short hollow return of the pipe after it (still just a bell).
 function bell(pos=null,g=1,{tunnel=false}={}){if(!ctx||!enabled)return;const o=spatial(pos,g,pos?10:6),t=now();let out=o;
  if(tunnel){const lp=filt('lowpass',2900,.7),d1=ctx.createDelay(.6),d2=ctx.createDelay(.6),e1=gain(.3),e2=gain(.14);d1.delayTime.value=.09;d2.delayTime.value=.21;
   lp.connect(o);lp.connect(d1).connect(e1).connect(o);lp.connect(d2).connect(e2).connect(o);out=lp;}
  for(const k of [0,.16]){tone(1760,t+k,1.3,.12,'sine',out);tone(1760*2.76,t+k,.5,.03,'sine',out);tone(1760*5.4,t+k,.2,.012,'sine',out);}}
 // Remembering: the whole mix goes soft at the top, as if heard from a little way off.
 function memory(on){if(!ctx||!memLP)return;memLP.frequency.setTargetAtTime(on?1900:20000,now(),on?.5:.4);}
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
 // Someone calling a name down the street (two syllables, a grown man's voice by default).
 function callName(pos,{f0=148,gain:g=.9,syllables=[[0,.24,1,1,760,1720],[.3,.62,1.04,.84,560,1820]]}={}){if(!ctx||!enabled)return;const t=now()+.05;
  const out=spatial(pos,g,26),soft=filt('lowpass',1900,.55);soft.connect(out);
  const real=new Float32Array(32),imag=new Float32Array(32);for(let n=1;n<32;n++)imag[n]=1/Math.pow(n,1.55);const voice=ctx.createPeriodicWave(real,imag);
  for(const [st,dur,p0,p1,f1,f2] of syllables){const c=shot(ctx.createOscillator()),q=gain(),a=filt('bandpass',f1,2.2),b=filt('bandpass',f2,3),br=gain(.14);
   c.setPeriodicWave(voice);c.frequency.setValueAtTime(f0*p0,t+st);c.frequency.linearRampToValueAtTime(f0*p0*1.04,t+st+.08);c.frequency.linearRampToValueAtTime(f0*p1,t+st+dur);
   b.frequency.setValueAtTime(st>0?1050:f2,t+st);b.frequency.linearRampToValueAtTime(f2,t+st+.09);
   q.gain.setValueAtTime(0,t+st);q.gain.linearRampToValueAtTime(.16,t+st+.06);q.gain.setValueAtTime(.13,t+st+dur-.12);q.gain.linearRampToValueAtTime(0,t+st+dur);
   c.connect(a).connect(q);c.connect(b).connect(br).connect(q);q.connect(soft);c.start(t+st);c.stop(t+st+dur+.03);}
  burst(t+.62,.06,.012,'highpass',4200,1,soft);}
 function ending(kind){if(!ctx)return;const t=now()+.4;
  for(const x of Object.values(layers))if(x?.gain)x.gain.setTargetAtTime(0,now(),.8);
  for(const x of layers.cic)x.out.gain.setTargetAtTime(0,now(),.8);for(const l of loops.values())l.out.gain.setTargetAtTime(0,now(),.8);
  // The chapter ends almost in silence: one low open fifth, held and let go.
  if(kind==='chapter')for(const [f,d] of [[110,0],[164.81,.8]])tone(f,t+d,7,.03);
  else for(const [f,d] of [[220,0],[277.18,.5],[329.63,1.0],[440,1.6]])tone(f,t+d,6,.045);musicOn=false;}
 function leaving(){if(!ctx||!enabled)return;const t=now();bell(null,.35);burst(t+.3,.05,.03,'bandpass',2000,2);}
 function reset(){musicOn=true;nextNote=0;note=0;nextBird=0;lastCrank=0;if(!ctx)return;
  for(const s of shots){try{s.stop();s.disconnect();}catch{}}shots.clear();
  for(const c of crickets)c.next=0;
  // A very short fade rather than a cut, so a loop that is playing (the fan, water) never clicks.
  for(const x of Object.values(layers))if(x?.gain){x.gain.cancelScheduledValues(now());x.gain.setTargetAtTime(0,now(),.02);}
  for(const x of layers.cic){x.out.gain.cancelScheduledValues(now());x.out.gain.setTargetAtTime(0,now(),.02);}
  for(const l of loops.values()){l.out.gain.cancelScheduledValues(now());l.out.gain.setTargetAtTime(0,now(),.02);}
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
  if(p<.55&&(s.state==='riding'||s.morning)&&t>nextBird){nextBird=t+8+random()*13;sfx('bird',{x:listener.x+(random()<.5?-1:1)*18,y:listener.y+6,z:listener.z-22},{gain:1-p});}
  // Positional loops from the world (a mower early on, a car engine).
  for(const src of s.sources||[]){const id=src.id||src.kind;let l=loops.get(id);if(!l){l=makeLoop(src.kind);loops.set(id,l);}const dx=src.pos.x-listener.x,dz=src.pos.z-listener.z,dist=Math.hypot(dx,dz);
   const rx=-listener.fz,rz=listener.fx;l.pan.pan.setTargetAtTime(clamp((dx*rx+dz*rz)/(dist||1),-1,1)*.8*(l.near?Math.min(1,dist/l.near):1),t,.1);set(l.out,src.level*l.vol*Math.min(1,l.ref/(dist+1))*(dist>(l.far||260)?0:1)*(1-.55*(src.muffle||0)),l.tc||.3);l.update?.(src,t,dist,dt);}
  for(const [k,l] of loops)if(!(s.sources||[]).some(x=>(x.id||x.kind)===k))set(l.out,0,.3);
  // Late at night: katydids in the trees, near and far.
  if(s.night1&&!s.morning){for(const k of katydids){if(t<k.next)continue;k.next=t+k.rate*(.85+random()*.3);const o=gain(k.vol),pn=ctx.createStereoPanner();pn.pan.value=k.pan;o.connect(pn).connect(bus);for(let j=0;j<k.n;j++)burst(t+.02+j*.075,.03,.05,'bandpass',k.pitch,6,o);}}
  // The old melody thins out through the ride and falls silent at the end of the street.
  if(musicOn&&s.finale<2&&t>nextNote){const notes=[220,329.63,440,493.88,369.99,329.63,293.66,220];tone(notes[note++%notes.length],t,4.5,.055*(1-p*.35));tone(110,t,5,.018);nextNote=t+3.5+random()*2+p*2.5;}
 }
 const katydids=[...Array(4)].map((_,i)=>({pan:-.9+i*.6,next:0,rate:1.05+random()*.6,pitch:5600+random()*1600,vol:.12+random()*.1,n:2+(i%2)}));
 // A speech-like on/off pattern for voices heard through a radio or a wall.
 // The syllable phase is accumulated from a slowly wandering rate. (It used to be the clock times
 // that rate, whose real frequency grows with the clock: by the time you reach the friends' windows
 // the gain jumped about every frame, a stutter heard as a broken fan.)
 function chatter(g,base,t,state,dt){state.left-=dt;if(state.left<=0){state.on=!state.on;state.left=state.on?.7+random()*2.2:1.8+random()*4.5;if(!state.on&&state.squelch)burst(t,.12,.03,'highpass',1700,.7,state.squelch);}
  state.w=(state.w||0)+dt*1.3;state.ph=(state.ph||0)+dt*(7+3*Math.sin(state.w));
  const syll=state.on?.55+.45*Math.abs(Math.sin(state.ph)):0;state.level=base*syll;g.gain.setTargetAtTime(state.level,t,.03);}
 function makeLoop(kind){const out=gain(0),pan=ctx.createStereoPanner();out.connect(pan).connect(bus);
  if(kind==='siren'){// two detuned voices through a horn-like band, swept as a wail or a yelp
   const o1=ctx.createOscillator(),o2=ctx.createOscillator();o1.type='sawtooth';o2.type='square';const mix=gain(.5),o2g=gain(.3),hp=filt('highpass',420,.7),pk=filt('peaking',1300,1.2),lp=filt('lowpass',6000,.5);pk.gain.value=6;
   o1.connect(mix);o2.connect(o2g).connect(mix);mix.connect(hp).connect(pk).connect(lp).connect(out);o1.start();o2.start();let ph=0,down=0;
   return {out,pan,vol:.15,ref:40,far:1600,tc:.12,update(src,t,dist,dt){ph+=dt;const w=ph%4.6/4.6,wail=w<.42?1-(1-w/.42)**2:1-((w-.42)/.58)**1.6,y=Math.abs(((ph*3.3)%1)*2-1);
    down=src.mode==='down'?Math.min(1,down+dt/1.6):0;const f=(src.mode==='yelp'?650+800*y:620+780*wail)*(1-.45*down)*(src.pitch||1);
    o1.frequency.setTargetAtTime(f,t,.012);o2.frequency.setTargetAtTime(f*1.004,t,.012);lp.frequency.setTargetAtTime(Math.max(450,9000*Math.exp(-dist/240))*(1-.75*(src.muffle||0))+200,t,.08);}};}
  if(kind==='radio'){const n=src(),bp=filt('bandpass',1650,1.5),g=gain(0),sq=gain(.6);n.connect(bp).connect(g).connect(out);sq.connect(out);const st={on:false,left:1,squelch:sq};
   return {out,pan,vol:.05,ref:6,far:60,gate:st,update(s2,t,dist,dt){chatter(g,1,t,st,dt);}};}
  if(kind==='tv'){const n=src(),bp=filt('bandpass',1050,.9),g=gain(0);n.connect(bp).connect(filt('lowpass',1800)).connect(g).connect(out);const st={on:false,left:.5};
   return {out,pan,vol:.03,ref:4,far:30,near:2.5,gate:st,update(s2,t,dist,dt){chatter(g,1,t,st,dt);}};}
  // An ordinary bedroom fan behind a closed window: steady air and a soft motor hum, never gated.
  // The slight swell is the blades, far too slow and shallow to read as a pulse.
  if(kind==='fan'){const n=src(),air=gain(.8);n.connect(filt('highpass',160,.6)).connect(filt('lowpass',1150,.5)).connect(air).connect(out);
   const m=ctx.createOscillator();m.frequency.value=118;m.connect(filt('lowpass',240)).connect(gain(.06)).connect(out);m.start();
   const lfo=ctx.createOscillator();lfo.frequency.value=.31;lfo.connect(gain(.05)).connect(air.gain);lfo.start();
   return {out,pan,vol:.045,ref:3,far:30,near:2.5,steady:true};}
  if(kind==='water'){const a=src(),b=src(),ga=gain(.6),gb=gain(.3);a.connect(filt('bandpass',850,.5)).connect(ga).connect(out);b.connect(filt('bandpass',2600,1.1)).connect(gb).connect(out);let ph=random()*9;
   return {out,pan,vol:.05,ref:7,far:70,update(s2,t,dist,dt){ph+=dt;ga.gain.setTargetAtTime(.45+.25*Math.sin(ph*.7)+.1*Math.sin(ph*2.3),t,.2);gb.gain.setTargetAtTime(.2+.15*Math.sin(ph*1.7+1),t,.15);}};}
  if(kind==='idle'){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=34;const lp=filt('lowpass',190);o.connect(lp).connect(out);o.start();const n=src();n.connect(filt('lowpass',380)).connect(gain(.18)).connect(out);return {out,pan,vol:.07,ref:7,far:90};}
  // The big culvert: a low hollow air in the pipe, and now and then a drip echoing somewhere inside.
  if(kind==='culvert'){const a=src(),b=src(),ga=gain(.7),gb=gain(0);a.connect(filt('lowpass',230,.8)).connect(ga).connect(out);b.connect(filt('bandpass',1250,7)).connect(gb).connect(out);let next=1+random()*3;
   return {out,pan,vol:.06,ref:6,far:50,update(s2,t,dist,dt){next-=dt;if(next<=0){next=2.5+random()*4;gb.gain.setValueAtTime(0,t);gb.gain.linearRampToValueAtTime(.5,t+.01);gb.gain.exponentialRampToValueAtTime(.001,t+.5);}}};}
  if(kind==='mower'){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=96;const lp=filt('lowpass',650),am=gain(.6),lfo=ctx.createOscillator(),d=gain(.35);lfo.frequency.value=7;lfo.connect(d).connect(am.gain);o.connect(lp).connect(am).connect(out);o.start();lfo.start();const n=src();n.connect(filt('bandpass',400,.8)).connect(gain(.2)).connect(out);return {out,pan,vol:.09,ref:40};}
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=48;const lp=filt('lowpass',320);o.connect(lp).connect(out);o.start();const n=src();n.connect(filt('lowpass',500)).connect(gain(.25)).connect(out);return {out,pan,vol:.18,ref:10};}
 return {ensure,setEnabled,setVolume,sfx,bell,memory,footstep,call,callName,ending,leaving,reset,update,get loops(){return loops;},get ctx(){return ctx;},get activeShots(){return shots.size;},get enabled(){return enabled;}};
}
