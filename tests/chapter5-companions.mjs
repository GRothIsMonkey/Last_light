// Chapter Five: Jamie and Sam as people, measured. The eight companion acceptance tests (A–H), played with the keys in
// the simulation harness: idling for a minute, a sudden sprint, a sudden stop, turning back, the garage departure, the
// camp explored for minutes, a narrow room, the run. Each samples where everyone is every frame and checks what the eye
// would see: no pacing, no copying, no crowding, no flip-flopping between goals, nobody stuck. (Distances are not the
// whole story: tests/review/companions.mjs films the same situations for a person to look at.)
import assert from 'node:assert/strict';
import {PW,BLD,SPOT} from '../dist/pine-plan.js';

export function runCompanionTests(T,X){
 const {h,press,release,tap,check,metrics}=T,{until,wait,me,faceTo,go}=X,A5=h.chapter5,C5=()=>A5.state.get();
 const L=()=>h.chapter.companions.list,boys=()=>[L().jamie,L().sam],brain=A5.brain;
 const M={};
 // every frame: positions, speeds, goals, how close anyone is to anyone
 function sampler(){const R={t:0,frames:0,path:{jamie:0,sam:0},last:{},speeds:{jamie:[],sam:[]},goals:{jamie:[],sam:[]},minGap:1e9,minYou:1e9,sprints:{jamie:0,sam:0},fast:{jamie:0,sam:0},moves:{jamie:0,sam:0},mv:{jamie:0,sam:0},stuck:{jamie:0,sam:0},still:{jamie:0,sam:0},far:0,dist:{jamie:[],sam:[]}};
  R.tick=(dt,{settle=0}={})=>{R.t+=dt;R.frames++;const p=me(),[J,S]=boys();
   for(const c of [J,S]){const k=c.key,lp=R.last[k],x=c.mode==='ride'?c.bx:c.px,z=c.mode==='ride'?c.bz:c.pz;let v=0;if(lp){const d=Math.hypot(x-lp.x,z-lp.z);v=d/dt;if(R.t>settle)R.path[k]+=d;}R.last[k]={x,z};
    R.speeds[k].push(v);const g=brain.state(c).goal;const G=R.goals[k];if(G[G.length-1]?.g!==g)G.push({g,t:R.t});
    if(R.t>settle){if(v>2.3){R.fast[k]+=dt;}else{if(R.fast[k]>.25&&R.fast[k]<1.5)R.sprints[k]++;R.fast[k]=0;}
     if(v>.35){R.mv[k]+=dt;}else{if(R.mv[k]>.5)R.moves[k]++;R.mv[k]=0;}}
    const dy=Math.hypot(x-p.x,z-p.z);R.dist[k].push(dy);if(c.mode==='foot'&&R.t>settle)R.minYou=Math.min(R.minYou,dy);}
   if(J.mode==='foot'&&S.mode==='foot'&&R.t>settle)R.minGap=Math.min(R.minGap,Math.hypot(J.px-S.px,J.pz-S.pz));};
  R.flips=k=>{const G=R.goals[k];let n=0;for(let i=2;i<G.length;i++)if(G[i].g===G[i-2].g&&G[i].t-G[i-2].t<3)n++;return n;};
  R.median=k=>{const a=[...R.dist[k]].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]||0;};
  return R;}
 const step=(R,s,o)=>{for(let t=0;t<s;t+=1/30){h.advance?.(1/30)??T.advance(1/30);R.tick(1/30,o);}};
 const adv=T.advance;const run=(R,s,o)=>{for(let t=0;t<s;t+=1/30){adv(1/30);R.tick(1/30,o);}};
 const W5=(e,n)=>PW(e,n);
 // walking helper (held W toward a point), sampling as it goes
 const walk=(R,q,{max=20,sprint=false,o}={})=>{for(let t=0;t<max;t+=1/30){const p=me(),dx=q.x-p.x,dz=q.z-p.z;if(Math.hypot(dx,dz)<.5)break;faceTo(q.x,q.z);press('KeyW');if(sprint)press('ShiftLeft');adv(1/30);R.tick(1/30,o);}release('KeyW');release('ShiftLeft');};
 const walkPath=(R,q,o={})=>{const p=me(),pts=h.nav.walkPath({x:p.x,z:p.z},q);for(const [x,z] of (pts.length?pts:[[q.x,q.z]]))walk(R,{x,z},o);};

 const open=()=>{h.jump('c5-camp');adv(.5);const R0=sampler();walkPath(R0,W5(-182,523),{max:20});run(R0,4);};
 // ---- A: a minute standing still in the open ----
 {open();const R=sampler();run(R,60,{settle:8});
  M.A={path:{jamie:+R.path.jamie.toFixed(1),sam:+R.path.sam.toFixed(1)},moves:R.moves,sprints:R.sprints,minGap:+R.minGap.toFixed(2),minYou:+R.minYou.toFixed(2),goals:{jamie:R.goals.jamie.length,sam:R.goals.sam.length},flips:{jamie:R.flips('jamie'),sam:R.flips('sam')}};
  check(`Companions A: a minute standing still in the park: they settle (walked ${M.A.path.jamie} m and ${M.A.path.sam} m after settling, on purpose), no pacing, no sprints, nobody bumps`,()=>{
   for(const k of ['jamie','sam']){assert.ok(R.path[k]<30,k+' walked '+R.path[k]);assert.ok(R.moves[k]<=6,k+' moves '+R.moves[k]);assert.equal(R.sprints[k],0,k+' sprints');assert.ok(R.flips(k)<=1,k+' flip-flops '+R.flips(k));}assert.ok(R.minGap>.55,'gap '+R.minGap);assert.ok(R.minYou>.6,'to you '+R.minYou);});}
 // ---- B: a sudden sprint from rest ----
 {open();run(sampler(),6);const R=sampler(),q=(()=>{const w=W5(-206,545);return [w.x,w.z];})();
  const resp={};let t=0;for(;t<9;t+=1/30){faceTo(q[0],q[1]);press('KeyW');press('ShiftLeft');adv(1/30);R.tick(1/30);for(const c of boys()){const v=R.speeds[c.key].at(-1);if(resp[c.key]==null&&v>.6)resp[c.key]=+t.toFixed(2);}}
  release('KeyW');release('ShiftLeft');const early={jamie:Math.max(...R.speeds.jamie.slice(0,6)),sam:Math.max(...R.speeds.sam.slice(0,6))};run(R,20);
  const gap=boys().map(c=>Math.hypot(c.px-me().x,c.pz-me().z));M.B={response:resp,first02s:{jamie:+early.jamie.toFixed(2),sam:+early.sam.toFixed(2)},regroup:gap.map(v=>+v.toFixed(1))};
  check(`Companions B: a sudden sprint: they go after a moment (Jamie ${resp.jamie} s, Sam ${resp.sam} s), not with you, not together, and catch up`,()=>{
   for(const k of ['jamie','sam']){assert.ok(resp[k]!=null&&resp[k]>.3&&resp[k]<3,k+' response '+resp[k]);assert.ok(early[k]<.6,k+' copied the start '+early[k]);}
   assert.ok(Math.abs(resp.jamie-resp.sam)>.1,'not in step');assert.ok(gap.every(v=>v<9),'regrouped '+gap);});}
 // ---- C: a sudden stop ----
 {open();run(sampler(),4);const R=sampler(),tgt=W5(-206,545);
  for(let t=0;t<9;t+=1/30){faceTo(tgt.x,tgt.z);press('KeyW');adv(1/30);R.tick(1/30);}release('KeyW');const n0=R.frames,v0={jamie:R.speeds.jamie.at(-1),sam:R.speeds.sam.at(-1)};run(R,8);
  const stopT={};for(const k of ['jamie','sam']){const s=R.speeds[k].slice(n0);const i=s.findIndex((v,j)=>s.slice(j,j+12).every(u=>u<.15));stopT[k]=i<0?99:+(i/30).toFixed(2);}
  M.C={atStop:{jamie:+v0.jamie.toFixed(2),sam:+v0.sam.toFixed(2)},stoppedAfter:stopT};
  check(`Companions C: a sudden stop: they walk on a step or two and stop (Jamie after ${stopT.jamie} s, Sam ${stopT.sam} s), not frozen on the spot`,()=>{for(const k of ['jamie','sam']){if(v0[k]>.5)assert.ok(stopT[k]>.3,k+' froze '+stopT[k]);assert.ok(stopT[k]<6,k+' kept going '+stopT[k]);}assert.ok(R.minYou>.55,'nobody walked into you '+R.minYou);});}
 // ---- D: away, and back ----
 {open();run(sampler(),4);const R=sampler(),p0=me(),away=W5(-196,536);
  walkPath(R,away,{max:14});walkPath(R,{x:p0.x,z:p0.z},{max:14});run(R,6);M.D={flips:{jamie:R.flips('jamie'),sam:R.flips('sam')},goals:{jamie:R.goals.jamie.map(g=>g.g).join(' '),sam:R.goals.sam.map(g=>g.g).join(' ')}};
  check('Companions D: walking away and coming back: no flip-flopping between goals',()=>{for(const k of ['jamie','sam'])assert.ok(R.flips(k)<=2,k+': '+M.D.goals[k]);assert.ok(R.minYou>.55,'to you '+R.minYou);});}
 // ---- E: the garage departure, you standing still ----
 {h.jump('c5-departure');adv(.5);const R=sampler();let jr=null,sr=null,jm=null,sm=null;const[J0,S0]=boys();for(let t=0;t<150&&!(jr&&sr);t+=1/30){adv(1/30);R.tick(1/30);const F=A5.C.flags;if(!jr&&F['ready-jamie'])jr=+t.toFixed(1);if(!sr&&F['ready-sam'])sr=+t.toFixed(1);if(jm==null&&J0.mode==='ride')jm=+t.toFixed(1);if(sm==null&&S0.mode==='ride')sm=+t.toFixed(1);}
  M.E={jamieReady:jr,samReady:sr,jamieMounted:jm,samMounted:sm,modes:boys().map(c=>c.mode)};
  check(`Companions E: you stand still after packing; Jamie and Sam go to their own bikes and get on by themselves (Jamie on at ${jm} s, Sam at ${sm} s; waiting at ${jr} s and ${sr} s)`,()=>{assert.ok(jr!=null&&sr!=null&&jm!=null&&sm!=null,JSON.stringify(M.E));assert.ok(Math.abs(jm-sm)>.8,'not in step');assert.ok(boys().every(c=>c.mode==='ride'),'on their bikes');});}
 // ---- F: minutes in the camp, from building to building ----
 {h.jump('c5-camp');adv(.5);const R=sampler(),stops=[[-181,527],[-190,539],[-205,571],[-240,553],[-226,586],[-200,556]];
  for(const [e,n] of stops){walkPath(R,W5(e,n),{max:40,o:{settle:3}});run(R,9,{settle:3});}
  const ins=brain.LOG.inspects;M.F={seconds:+R.t.toFixed(0),median:{jamie:+R.median('jamie').toFixed(1),sam:+R.median('sam').toFixed(1)},max:{jamie:+Math.max(...R.dist.jamie).toFixed(1),sam:+Math.max(...R.dist.sam).toFixed(1)},minGap:+R.minGap.toFixed(2),minYou:+R.minYou.toFixed(2),inspects:ins,goals:{jamie:new Set(R.goals.jamie.map(g=>g.g)).size,sam:new Set(R.goals.sam.map(g=>g.g)).size}};
  check(`Companions F: ${M.F.seconds} s round the camp: they keep near (median ${M.F.median.jamie} m and ${M.F.median.sam} m), look at things on their own, wait, never crowd you`,()=>{
   for(const k of ['jamie','sam']){assert.ok(R.median(k)>1.4&&R.median(k)<10,k+' median '+R.median(k));assert.ok(Math.max(...R.dist[k])<30,k+' max');}assert.ok(R.minYou>.55,'to you '+R.minYou);assert.ok(R.minGap>.5,'gap '+R.minGap);
   assert.ok(M.F.goals.jamie>=3||M.F.goals.sam>=3,'more than following: '+JSON.stringify(M.F.goals));});}
 // ---- G: a narrow room (the office: the counter, the desk, the cabinets) ----
 {h.jump('c5-office');adv(.5);const b=BLD.office,R=sampler(),pt=(lx,lz)=>{const [e,n]=b.F.to(lx,lz);return W5(e,n);};const DO=A5.DOORS?.office;
  T.tap?.('KeyF');X.act?.('c5-door-office',3);run(R,1);
  for(const [lx,lz] of [[b.door[0],b.d/2-.8],[-1.2,1.9],[-2.2,1.3],[-2.2,-.3],[-1.2,1.9],[b.door[0],b.d/2-.8]]){walkPath(R,pt(lx,lz),{max:12});run(R,3);}
  const stuck={};for(const k of ['jamie','sam']){let s=0,run2=0;const sp=R.speeds[k];for(const v of sp){run2=v<.05?run2+1:0;if(run2===90)s++;}stuck[k]=s;}
  M.G={minGap:+R.minGap.toFixed(2),minYou:+R.minYou.toFixed(2),seconds:+R.t.toFixed(0)};void DO;
  check(`Companions G: inside the office, round the counter and back: nobody walks through anybody (closest ${M.G.minYou} m to you, ${M.G.minGap} m to each other)`,()=>{assert.ok(R.minYou>.45,'to you '+R.minYou);assert.ok(R.minGap>.45,'gap '+R.minGap);});}
 // ---- H: the run ----
 {h.jump('c5-run');adv(.3);const R=sampler(),pts=[[-262,556],[-236,552],[-212,546],[-192,538],[-180,528]].map(([e,n])=>W5(e,n));for(const q of pts)walkPath(R,q,{max:20,sprint:true});
  const far={jamie:Math.max(...R.dist.jamie),sam:Math.max(...R.dist.sam)},runFrac=k=>R.speeds[k].filter(v=>v>2.4).length/Math.max(1,R.speeds[k].length);
  M.H={far:{jamie:+far.jamie.toFixed(1),sam:+far.sam.toFixed(1)},running:{jamie:+runFrac('jamie').toFixed(2),sam:+runFrac('sam').toFixed(2)},minYou:+R.minYou.toFixed(2)};
  check(`Companions H: the run: they run (${Math.round(runFrac('jamie')*100)}% and ${Math.round(runFrac('sam')*100)}% of it), keep with you (farthest ${M.H.far.jamie} m, ${M.H.far.sam} m), and don't run into you`,()=>{for(const k of ['jamie','sam']){assert.ok(far[k]<18,k+' far '+far[k]);assert.ok(runFrac(k)>.25,k+' running '+runFrac(k));}assert.ok(R.minYou>.5,'to you '+R.minYou);});}
 metrics['chapter5 companions A-H']=M;void step;void until;void wait;void go;void tap;void SPOT;void C5;
}
