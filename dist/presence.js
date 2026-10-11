// Chapter Four: the town's lights through the evening, and what happens to them.
//
// Two layers over the one array of levels town-build.js gives every lamp, shop, fixture and sign:
//  * the schedule: what an ordinary Tuesday does with them as the afternoon ends (shops close at their hour, the
//    streetlights' photocells come on one by one at dusk, the marquee comes on, the diner turns its sign off);
//  * the Presence (a development name: the story never names it): a mask over the schedule that the chapter
//    drives in authored stages. A light it reaches gives a small flicker and a relay's clunk and goes out; it can
//    hold a light out, or let it come back. Nothing here is random once a stage is set going: cascades are ordered
//    by distance along a path at a set speed, so the same thing happens every time, and it all resets to nothing.
// It also gives the handful of real point lights to whatever lit things are nearest the camera, so people, the
// creature and the rooms are lit by what you see lit.
import * as THREE from './three.module.js';
import {TW,TL,BUILDINGS,LAMPS,TY} from './town-plan.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);},damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
// Closing hours (24 h) and what stays lit after: the plan's own (BUILDINGS close), plus these.
const NIGHT_SHOPS=new Set(['video','laundry','tap','gas','oddfellows']);
export function createTownLights({town,sfx=()=>{},scene,camera}){
 const T=town,LV=T.LV,NEON=T.NEON,L=T.levels,n=L.length,base=new Float32Array(n),mask=new Float32Array(n).fill(1),hold=new Float32Array(n).fill(1);
 const S={clock:14,events:[],t:0,on:new Map(),open:{},forced:{},dark:0,dim:0,kills:0,restores:0,log:[],attached:false};
 // Each lamp's photocell: a moment between 7:56 and 8:02 PM (the same every time).
 const cell=LAMPS.map((Lm,i)=>19.93+((i*37)%17)/17*.1);
 const shopOf=new Map(BUILDINGS.filter(b=>b.lit>=0).map(b=>[b.lit,b]));
 // ---- the schedule -----------------------------------------------------------------------------------------------
 // dusk: 0 bright afternoon … 1 night. Shops: lit while open (a little more as it gets dark), the night shops after.
 function schedule(h){const dusk=smooth((h-19.2)/1.3);base.fill(0);
  for(let i=0;i<LAMPS.length;i++){const on=smooth((h-cell[i])/.03);base[LV.lamp+LAMPS[i].id]=on;}
  for(const [lit,b] of shopOf){const forced=S.forced[b.id];let open=forced!==undefined?forced:h<(b.close??18);if(b.closed||b.vacant)open=false;
   base[LV.shop+lit]=open?.55+.45*dusk:NIGHT_SHOPS.has(b.id)&&h<(b.close??24)?.8:0;}
  const lit=id=>{const b=BUILDINGS.find(q=>q.id===id);return b&&b.lit>=0?base[LV.shop+b.lit]>0:false;};
  base[LV.neon+NEON.marquee]=smooth((h-19.7)/.15);base[LV.neon+NEON.bulbs]=base[LV.neon+NEON.marquee];base[LV.neon+NEON.blade]=base[LV.neon+NEON.marquee];base[LV.neon+NEON.lyricUpper]=.8*base[LV.neon+NEON.marquee];
  base[LV.neon+NEON.dinerSign]=lit('diner')?.35+.65*dusk:0;base[LV.neon+NEON.dinerOpen]=lit('diner')?1:0;base[LV.neon+NEON.videoOpen]=lit('video')?1:0;base[LV.neon+NEON.videoSign]=lit('video')?.4+.6*dusk:0;
  base[LV.neon+NEON.exitSign]=1;base[LV.neon+NEON.vending]=.5+.5*dusk;base[LV.neon+NEON.gasPrice]=.6+.4*dusk;base[LV.neon+NEON.tapNeon]=lit('tap')?1:0;base[LV.neon+NEON.pizzaNeon]=lit('oddfellows')?1:0;
  base[LV.neon+NEON.drugNeon]=lit('drug')?1:0;base[LV.neon+NEON.clock]=.35+.65*dusk;
  // fixtures inside: on while the place is open (the chapter can force them: S.fixOn)
  for(const f of T.D.fixtures){const i=f.lv;if(i>=LV.fix&&i<LV.neon)base[i]=S.fixOn?.[i]??1;}}
 // ---- the Presence's mask -----------------------------------------------------------------------------------------
 // kill: at time `at`, the light flickers (a few dips, ~.5 s) and goes out; it stays out until restore().
 function kill(i,at=S.t,{flick=.55,quiet=false,dur=.55}={}){S.events.push({i,at,kind:'kill',flick,quiet,dur});}
 function restore(i,at=S.t,{flick=.3}={}){S.events.push({i,at,kind:'restore',flick});}
 const posOf=i=>{if(i>=LV.lamp&&i<LV.shop){const Lm=T.D.lamps.find(q=>q.id===i-LV.lamp);return Lm?{u:Lm.u,v:Lm.v,y:Lm.y}:null;}
  if(i>=LV.shop&&i<LV.fix){const b=shopOf.get(i-LV.shop);return b?{u:(b.u0+b.u1)/2,v:b.side==='N'?(b.front??11)+1:(b.front??-11)-1,y:TY+2}:null;}
  if(i>=LV.fix&&i<LV.neon){const f=T.D.fixtures.find(q=>q.lv===i&&q.u!==undefined);return f?{u:f.u,v:f.v,y:f.y}:null;}return null;};
 // A cascade: every light in `list` (indices) goes out in order of its distance from `from` along `dir` (a unit
 // vector in u,v; null: plain distance), `speed` m/s, starting at `at`. Returns the time the last goes.
 function cascade(list,{from,dir=null,speed=6,at=S.t,gap=.0,quiet=false}){let last=at;const items=list.map(i=>{const p=posOf(i);if(!p)return null;const du=p.u-from.u,dv=p.v-from.v,d=dir?du*dir.u+dv*dir.v:Math.hypot(du,dv);return {i,d};}).filter(Boolean).sort((a,b)=>a.d-b.d);
  items.forEach((q,k)=>{const t=at+Math.max(0,q.d)/speed+k*gap;kill(q.i,t,{quiet});last=Math.max(last,t);});return last;}
 function wave(list,{from,speed=10,at=S.t}){let last=at;for(const i of list){const p=posOf(i);const d=p?Math.hypot(p.u-from.u,p.v-from.v):0,t=at+d/speed;restore(i,t);last=Math.max(last,t);}return last;}
 const flick=new Map();
 function update(dt,h){S.t+=dt;S.clock=h;schedule(h);
  for(let k=S.events.length-1;k>=0;k--){const e=S.events[k];if(S.t<e.at)continue;S.events.splice(k,1);
   if(e.kind==='kill'){if(hold[e.i]>0){flick.set(e.i,{t:0,dur:e.dur||.55,to:0,amp:e.flick});S.kills++;if(!e.quiet){const p=posOf(e.i);if(p&&base[e.i]>.05){const w=TW(p.u,p.v);sfx('relay',{x:w.x,y:p.y,z:w.z},{gain:.7});}}S.log.push({i:e.i,at:+S.t.toFixed(2),kind:'kill'});}hold[e.i]=0;}
   else{hold[e.i]=1;flick.set(e.i,{t:0,dur:.45,to:1,amp:e.flick});S.restores++;S.log.push({i:e.i,at:+S.t.toFixed(2),kind:'restore'});}}
  for(let i=0;i<n;i++){let m=hold[i];const f=flick.get(i);if(f){f.t+=dt;const u=f.t/f.dur;if(u>=1)flick.delete(i);else{const dip=(Math.sin(f.t*61+i)*Math.sin(f.t*23+i*1.7))>.1?1:.15;m=f.to===0?(u<.8?dip*(1-f.amp*u):0):(u>.35?dip*Math.min(1,u*1.4):0);}}mask[i]=m;L[i]=base[i]*mask[i];}
  T.timeU.value+=dt;}
 function reset(){S.events.length=0;flick.clear();hold.fill(1);mask.fill(1);L.fill(0);S.t=0;S.kills=0;S.restores=0;S.log.length=0;S.forced={};S.fixOn=null;S.dark=0;S.dim=0;}
 // ---- the real lights: the brightest lit things near the camera ----------------------------------------------------
 const cand=[],_v=new THREE.Vector3();let assignT=0;
 function lights(dt,eye,{indoors=false}={}){const D=T.D;assignT-=dt;
  if(assignT<=0){assignT=.2;cand.length=0;const me=TL(eye.x,eye.z);
   for(const Lm of D.lamps){const lv=L[LV.lamp+Lm.id];if(lv<.05)continue;const d=Math.hypot(Lm.u-me.u,Lm.v-me.v);if(d>34)continue;cand.push({u:Lm.u,v:Lm.v,y:Lm.y-.4,lv,d,k:Lm.kind==='cobra'||Lm.kind==='pole'?16:Lm.kind==='wall'?7:10,r:Lm.kind==='cobra'||Lm.kind==='pole'?16:11,c:Lm.color});}
   for(const f of D.fixtures){if(f.u===undefined)continue;const lv=L[f.lv];if(lv<.05)continue;const d=Math.hypot(f.u-me.u,f.v-me.v);if(d>16)continue;cand.push({u:f.u,v:f.v,y:f.y-.3,lv,d:d*(indoors?.7:1.4),k:3.2,r:7,c:WHITE});}
   const mq=L[LV.neon+NEON.marquee];if(mq>.05){const d=Math.hypot(200-me.u,-8.5-me.v);if(d<40)cand.push({u:200,v:-8.6,y:TY+4,lv:mq,d:d*.8,k:14,r:18,c:MARQ});}
   for(const tv of S.tvLights||[]){if(tv.lv<.05)continue;const d=Math.hypot(tv.u-me.u,tv.v-me.v);if(d<10)cand.push({...tv,d:d*.6});}
   cand.sort((a,b)=>b.lv*b.k/(1+b.d*b.d/80)-a.lv*a.k/(1+a.d*a.d/80));}
  D.lights.forEach((slot,i)=>{const c=cand[i];const L2=slot.L;if(!c){L2.intensity=damp(L2.intensity,0,6,dt);return;}
   const w=TW(c.u,c.v);if(slot.src!==c.u+':'+c.v){slot.src=c.u+':'+c.v;L2.intensity=0;L2.position.set(w.x,c.y,w.z);L2.color.copy(c.c);L2.distance=c.r;}
   L2.intensity=damp(L2.intensity,c.k*c.lv,8,dt);});}
 function attach(on){if(S.attached===on)return;S.attached=on;for(const s of T.D.lights){if(on)scene.add(s.L);else{s.L.removeFromParent();s.L.intensity=0;s.src=null;}}}
 const WHITE=new THREE.Color(.92,.96,1),MARQ=new THREE.Color(1,.8,.55);
 return {S,base,mask,schedule,update,kill,restore,cascade,wave,reset,lights,attach,posOf,hold,
  // what the chapter asks about: is this lamp lit right now (and how much), which lamps are near (u,v)
  level:i=>L[i],lampIndex:id=>LV.lamp+id,lampsNear:(u,v,r)=>T.D.lamps.filter(Lm=>Math.hypot(Lm.u-u,Lm.v-v)<r).map(Lm=>LV.lamp+Lm.id),
  get state(){return {clock:+S.clock.toFixed(3),kills:S.kills,restores:S.restores,pending:S.events.length,dark:S.dark,lampsLit:T.D.lamps.filter(Lm=>L[LV.lamp+Lm.id]>.5).length,lampsOut:T.D.lamps.filter(Lm=>hold[LV.lamp+Lm.id]<.5).length,log:S.log.slice(-12)};}};
}
