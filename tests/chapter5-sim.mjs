// Chapter Five in the simulation harness: played the way a player would (walking and riding with the keys, turning to
// look, pressing F where the prompt says, V for Alex's camera, T for the flashlight, C to crouch), straight on from Chapter
// Four's end card; then every QA jump, alias and checkpoint, Continue and Start over, the friends under stress (wandering,
// running off, idling), the camp's attention at night answering what you do, seeded randomized runs through the
// fallbacks, and the DEV selector's Chapter Five against arriving naturally, and switching scenes leaking nothing.
// Called from verify.mjs with the running harness; real dist/ modules.
import assert from 'node:assert/strict';
import {chapterThreeTools} from './chapter3-sim.mjs';
import {runCompanionTests} from './chapter5-companions.mjs';
import {PW,PL,SPOT,BLD,ROADS,DOCKS,SOLIDS,WADE,WATER,shoreSD,wadeZone,heightAt} from '../dist/pine-plan.js';

export function chapterFiveTools(T){
 const X=chapterThreeTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo,go}=X;
 const C5=()=>h.chapter5.state,A5=h.chapter5,S=()=>h.chapter.kit.S;
 const P5=(e,n)=>{const p=PW(e,n);return [p.x,p.z];},Q5=(e,n)=>{const p=PW(e,n);return {x:p.x,z:p.z};};
 const en=(p=me())=>PL(p.x,p.z);
 const goEN=(e,n,o={})=>go(Q5(e,n),{max:120,...o});
 const faceEN=(e,n,y=null,pitch=0)=>{const q=Q5(e,n);if(y!=null){const c=h.camera.position;pitch=Math.atan2(y-c.y,Math.hypot(q.x-c.x,q.z-c.z));}faceTo(q.x,q.z,pitch);};
 const faceV=(v,{pitch=null}={})=>{const c=h.camera.position;faceTo(v.x,v.z,pitch??Math.atan2((v.y??c.y)-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const M=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];};
 const orr=(s0,s1,t=.9,st=10)=>{const o=[];for(let s=s0;s<=s1;s+=st){const q=ROADS.orr.at(s,t);o.push([q.x,q.z]);}return o;};
 // (a route walked leg by leg along the nav's paths: round a shut gate leaf, not into it)
 const trek=(pts,o={})=>{for(const q of pts){if(o.stop?.())return;go({x:q[0],z:q[1]},{...o,max:Math.min(o.max||60,60)});}};
 const gravel=(s0,s1,st=8)=>{const o=[];for(let s=s0;s<=s1;s+=st){const q=ROADS.gravel.at(s,0);o.push([q.x,q.z]);}return o;};
 const offBike=()=>{if(h.night.state==='c1-ride'){release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');tap('KeyF');until(()=>h.night.state==='c1-walk',4);wait(.3);}};
 const onBike=()=>{if(h.night.state==='c1-walk'){const r=h.night.roam;go({x:r.x,z:r.z},{r:1.2,max:40});faceTo(r.x,r.z);wait(.2);tap('KeyF');until(()=>h.night.state==='c1-ride',4);}};
 const rideTo=(pts,max=200,r=2.8,stop=null,each=null)=>{h.drive(pts,{r});const ok=until(()=>{each?.();return !h.driving||!!stop?.();},max);h.stopDriving();return ok;};
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 const spot=()=>h.chapter.spot?.();
 // F on what the prompt offers, if it is that one
 const act=(id,max=8)=>{let ok=false;until(()=>{const s=spot();if(s?.id===id){tap('KeyF');ok=true;return true;}return false;},max);return ok;};
 const boys=()=>h.chapter.companions.all.filter(c=>c.active),jamieSam=boys;
 const gap=()=>{const p=me();return Math.max(...boys().map(c=>Math.hypot((c.mode==='ride'?c.bx:c.px)-p.x,(c.mode==='ride'?c.bz:c.pz)-p.z)));};
 return {...X,C5,A5,S,P5,Q5,en,goEN,faceEN,faceV,M,orr,gravel,trek,offBike,onBike,rideTo,quiet,spot,act,boys,jamieSam,gap};
}

// From Chapter Four's end card (or the chapter's own start, or the DEV selector's) to Chapter Five's end card, inputs only.
export function playChapterFive(T,label,{fromCard=true,dev=false,route='A',choice='sam',seedLook=true,from=null,entered=false,to=null,cont=false}={}){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterFiveTools(T),{C5,A5,S,P5,Q5,en,goEN,faceEN,faceV,M,orr,gravel,trek,offBike,onBike,rideTo,quiet,act,boys,jamieSam,gap,log,until,wait,me,faceTo,walkTo,go}=X;
 const M2=/replay|DEV/.test(label)?{}:metrics;const watch={streets:[],gapMax:0,gapAt:null,bad:0,jumps:0,lastP:null,sky:[],darkMax:0,lit:0,carried:0,creature:0,double:0};
 const sample=()=>{const s=C5(),p=me(),w=s.where?.street;if(watch.streets[watch.streets.length-1]!==w)watch.streets.push(w);
  if(!/^(c5-black|d5-garage|d5-ride)$/.test(s.phase)&&A5.C.fadeOut<0&&!A5.C.lapse){const g=gap();if(g>watch.gapMax){watch.gapMax=g;watch.gapAt={phase:s.phase,where:s.where};}}
  if(watch.lastP&&A5.C.fadeOut<0){const d=Math.hypot(p.x-watch.lastP.x,p.z-watch.lastP.z);if(d>2.5&&h.night.state===watch.lastP.st)watch.jumps++;}watch.lastP={x:p.x,z:p.z,st:h.night.state};
  watch.lit=Math.max(watch.lit,Object.values(s.lamps).filter(v=>v>.5).length);watch.carried=Math.max(watch.carried,s.carried);if(s.creature.visible)watch.creature++;if(s.double)watch.double++;watch.darkMax=Math.max(watch.darkMax,s.dark);};
 const U=(fn,max)=>until(()=>{sample();return fn();},max);const W=s=>U(()=>false,s);
 const B=id=>BLD[id],door=(id,o=1.6)=>{const b=B(id);return b.F.to(b.door[0],b.d/2+o);};
 // (for development: from= one of these starts there, by its jump, and plays on)
 const ORDER=['start','stones','sign','road','camp','dusk','lights','split','run'],JUMPS={stones:'c5-stones',sign:'c5-sign-search',road:'c5-gravel-road',camp:'c5-camp',dusk:'c5-golden-hour',lights:'c5-three-lights',split:'c5-split',run:'c5-run'};
 // (to= stops after that segment; cont=true goes on from where the last call left off instead of jumping: Chromium plays the
 // chapter a segment per call, so the page gets its event loop back between them)
 const seg=k=>{const fi=from?ORDER.indexOf(from):0,li=to?ORDER.indexOf(to):ORDER.length-1,ki=ORDER.indexOf(k);if(ki<fi||ki>li)return false;if(from===k&&ki>0&&!cont){h.jump(JUMPS[k]);W(.5);}return true;};
 let t0=h.snapshot.clock;
 if(seg('start')){
 // ---- in: from the card, or a start ----
 if(from||entered){}// (entered: the caller already pressed the end card's button itself, e.g. a real click in Chromium)
 else if(fromCard){if(h.snapshot.state!=='ended'){h.jump('chapter4-end');until(()=>h.snapshot.state==='ended',30);}check(`${label}: Chapter Four's end card offers Chapter Five`,()=>{assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/Chapter Five/);});
  element('next-chapter').onclick();}
 else if(dev){h.devStart(5);}else h.jump('chapter5-start');
 t0=h.snapshot.clock;
 U(()=>S().phase==='c5-black',3);check(`${label}: the chapter opens on its card (Chapter Five, The Place in the Picture)`,()=>{assert.equal(S().phase,'c5-black');U(()=>element('chapter-card').classList.contains('on'),3);assert.match(element('chapter-card').querySelector?.('h2')?.textContent||'Chapter Five',/Chapter Five/);});
 U(()=>S().phase==='d5-garage',10);U(()=>C5().flags.packReady,15);
 check(`${label}: Sam's garage, the next afternoon (Wednesday, August 24)`,()=>{assert.equal(S().phase,'d5-garage');assert.match(element('date').innerHTML,/AUGUST 24, 2011/);});
 // ---- pack, Jamie's sock, out ----
 const sq=A5.W5?null:null;void sq;const g=h.world.homes.sam;void g;
 // up to the table; pack two things with your own hands (F on one, F on the bag); take Alex's camera from Sam's hand
 const GS=A5.G5.S,lookV=v=>faceV(v);{const t=A5.G5.TL(0,-.78,0);go({x:t.x,z:t.z},{r:.3,max:20});}U(()=>GS.flags.packing,20);
 let mine=0;for(let k=0;k<2;k++){const P=GS.items.find(q=>q.state==='placed'&&!q.claimed);if(!P)break;{const t=A5.G5.TL(P.lx??0,-.62,0);go({x:t.x,z:t.z},{r:.2,max:8});}/* (in front of it, within an arm's length) */lookV(P.obj.position);W(.05);if(X.spot()?.id==='g5-take:'+P.name){tap('KeyF');U(()=>GS.holding===P,3);W(.6);lookV(GS.bag.mouth());W(.05);if(X.spot()?.id==='g5-put'){tap('KeyF');U(()=>P.state==='stored',3);mine++;}}W(.6);}
 U(()=>GS.flags.cameraAsked,90);lookV(GS.cam.obj.position);W(.05);if(X.spot()?.id==='g5-camera')tap('KeyF');U(()=>C5().inv.camera,20);T.snap?.('garage-camera-taken');
 check(`${label}: the garage: the supplies packed by hand (you ${mine}, Sam the rest), Alex's camera from Sam's hand`,()=>{assert.equal(GS.items.filter(P=>P.state==='stored').length,GS.items.length,'everything in the bag');assert.ok(GS.packedBy.you>=2&&GS.packedBy.sam>=1,JSON.stringify(GS.packedBy));assert.ok(C5().inv.camera);assert.equal(GS.cam.state,'hidden','in your pocket, not on the table');});
 // Jamie: his backpack off his back, the sock out of it, the granola bars from Sam's hand; the map, the way, the rules
 U(()=>GS.sockShownAt!=null,90);T.snap?.('jamie-one-sock');U(()=>C5().flags.leave,150);
 check(`${label}: Jamie's backpack and one sock, Sam's granola bars, the map and the plan`,()=>{assert.ok(C5().flags.departure&&C5().flags.plan&&C5().flags.leave);assert.ok(GS.flags.barsTaken&&GS.sock.state==='stored'&&GS.bars.every(b=>b.state==='stored'),'sock and bars in Jamie’s bag');
  assert.ok(GS.flags.mapOpen);assert.ok(log.said.some(l=>/one sock/.test(l)));assert.ok(log.said.some(l=>/come find him/.test(l))&&log.said.some(l=>/Danny Whitcomb/.test(l))&&log.said.some(l=>/before dark/i.test(l)),'why Pine Ridge, and the rules');});
 // they go to their bikes and get on them themselves, before you do
 U(()=>C5().flags['ready-jamie']&&C5().flags['ready-sam'],60);
 check(`${label}: Jamie and Sam get on their own bikes before you do, and wait`,()=>{assert.ok(boys().every(c=>c.mode==='ride'),boys().map(c=>c.mode).join());assert.equal(h.night.state,'c1-walk','you are still on foot');assert.equal(GS.bagP.state,'worn');assert.equal(GS.jbagP.state,'worn');});
 onBike();const d0=h.world.homes.sam.drivD;rideTo([M(d0-14,-2.2),M(d0-30,-2.2),M(d0-50,-2.2)],40,3,()=>S().phase==='d5-ride');U(()=>S().phase==='d5-ride'&&A5.C.fadeIn<0,10);
 check(`${label}: out of town, on Mill Street past the sawhorse (the Old Reservoir Road)`,()=>{assert.equal(S().phase,'d5-ride');assert.ok(Math.abs(C5().where.e)<12&&C5().where.n<10,JSON.stringify(C5().where));});
 // ---- the race: Jamie goes; you go too ----
 U(()=>C5().race&&A5.C.race.racing,12);const tr=h.snapshot.clock;rideTo(orr(10,240),120,3);
 check(`${label}: the race to the top of the ridge has a winner`,()=>{assert.ok(['you','jamie'].includes(C5().race.winner),JSON.stringify(C5().race));});
 M2['chapter5 race']={winner:C5().race.winner,seconds:+(h.snapshot.clock-tr).toFixed(1)};
 rideTo([...orr(240,318),P5(-100,302),P5(-118,308),P5(-128,314)],90,3,()=>false);U(()=>S().phase==='d5-park',20);
 check(`${label}: Pine Ridge Park (the new sign is not the one in the picture)`,()=>{assert.ok(['d5-park','d5-stones'].includes(S().phase),S().phase);assert.ok(log.said.some(l=>/Recreation Area/.test(l)));});
 // ---- the bikes into the rack ----
 offBike();goEN(SPOT.rack.c[0]+2,SPOT.rack.c[1]-.6,{r:1});faceEN(...SPOT.rack.c);act('c5-lock',6);U(()=>S().phase==='d5-stones',25);
 check(`${label}: the bikes locked to the rack (no riding off from here on)`,()=>{assert.ok(C5().flags.locked);assert.equal(h.chapter.canRemount(),false);});
 }
 // ---- skipping stones ----
 if(seg('stones')){
 // the beach: pick a stone up off the ground (F on it), hold F to wind up, crouch, aim low across the water, let go
 const STN=SPOT.shoreStones,AIM=[STN[0]-14,STN[1]+6],PKS=A5.PK.S;goEN(STN[0]+.4,STN[1]+.4,{r:.8});U(()=>C5().stones,20);
 let throws=0;U(()=>{const s=C5().stones;if(!s||s.done)return true;if(A5.C.st.turn==='you'&&!A5.C.st.busy&&!PKS.flying.length&&!A5.PK.holding&&!A5.phys.playerBusy()){
   const P=A5.PK.nearestStone(me().x,me().z);if(P){go({x:P.obj.position.x,z:P.obj.position.z},{r:.7,max:12});faceV(P.obj.position);W(.05);if(X.spot()?.id==='p5-stone:'+P.name){tap('KeyF');U(()=>A5.PK.holding,3);W(.5);}}}
  if(A5.C.st.turn==='you'&&A5.PK.holding&&!A5.PK.winding){faceEN(AIM[0],AIM[1],null,-.1);press('KeyC');W(.5);press('KeyF');W(.85);release('KeyF');W(.3);release('KeyC');throws++;U(()=>!PKS.flying.length,8);W(.5);}return false;},220);
 check(`${label}: skipping stones: a stone picked up off the shore, wound up and let go, each time; Jamie's and Sam's their own; Sam's six`,()=>{assert.ok(C5().stones.done);assert.equal(throws,3,'your throws '+throws);assert.equal(PKS.best.sam,6,JSON.stringify(PKS.log));assert.ok(PKS.you.every(n=>n>=2),'low, flat, across the water: '+PKS.you);
  assert.ok(PKS.jamie.length===3&&PKS.sam.length===3,'they threw their own');assert.ok(A5.phys.LOG.log.filter(l=>l[0]==='hold'&&/beach-stone/.test(l[1])).length>=9,'every stone picked up by a hand');});
 M2['chapter5 stones']={you:PKS.you,jamie:PKS.jamie,sam:PKS.sam};
 // ---- the dock ----
 U(()=>S().phase==='d5-dock',30);const DE=SPOT.dockEnd,DK=DOCKS[0];goEN(DE[0]+Math.sin(DK.a+Math.PI)*.8,DE[1]+Math.cos(DK.a+Math.PI)*.8,{r:.5});faceEN(DE[0]+Math.sin(DK.a)*3,DE[1]+Math.cos(DK.a)*3);const dockAt={where:C5().where,spot:X.spot()?.id,pt:+h.snapshot.clock?.toFixed?.(1),flags:Object.keys(A5.C.flags).filter(k=>/dock/.test(k)),holding:!!A5.PK.holding,view:A5.C.view,pose:!!A5.C.pose};act('c5-sit',6);
 let seatedAll=false;U(()=>{if(jamieSam().every(c=>c.seated)&&(A5.C.pose?.w||0)>.95)seatedAll=true;return S().phase==='d5-sign';},150);
 check(`${label}: the dock: the three of you sat on its edge, legs over the water; Alex, and the shoe he named Gary`,()=>{assert.ok(C5().flags.dock);assert.ok(seatedAll,'all three seated '+JSON.stringify(dockAt));assert.ok(log.said.some(l=>/Gary/.test(l)));});
 // ---- the shallows: off the beach into the water, at a wading pace while the bed is under it, and back out ----
 {let tgt=null;for(let r=2;r<9&&!tgt;r+=.5)for(let k=0;k<24&&!tgt;k++){const e=STN[0]+Math.sin(k/24*Math.PI*2)*r,n=STN[1]+Math.cos(k/24*Math.PI*2)*r,sd=shoreSD(e,n);if(sd<-1.9&&sd>-2.6&&wadeZone(e,n).beach>.8){const w=PW(e,n);if(heightAt(w.x,w.z)<WATER-.14)tgt=[e,n];}}
  const back=[STN[0]+.4,STN[1]+.4];let wet=0,slow=0,dry=0,deep=9,diag=null;const watch=()=>{const p=me(),wsurf=h.nav.surface(p.x,p.z),d=heightAt(p.x,p.z)-WATER;if(wsurf==='water')wet++;if(Math.abs((h.foot.pace??1)-.58)<.01)slow++;if(d<deep){deep=d;diag={phase:S().phase,state:h.snapshot.state,walking:me().walking,pace:h.foot.pace,surf:wsurf};}};
  if(tgt){goEN(tgt[0],tgt[1],{r:.3,max:25,stop:()=>{watch();return false;}});for(let i=0;i<30;i++){W(1/30);watch();}goEN(back[0],back[1],{r:.8,max:20});W(.4);dry=Math.abs((h.foot.pace??1)-1)<.01?1:0;}
  M2['chapter5 wading']={target:tgt&&tgt.map(v=>+v.toFixed(1)),wetFrames:wet,slowFrames:slow,deepest:+deep.toFixed(2),atDeepest:diag,paceBack:h.foot.pace};
  check(`${label}: the shallows: off the beach into the water (wading pace while the bed is under water), and back out`,()=>{assert.ok(tgt,'a wading point');assert.ok(wet>10,'in the water '+wet);assert.ok(slow>10,'wading pace '+slow+' '+JSON.stringify(M2['chapter5 wading']));assert.ok(dry,'back to walking pace on the beach '+h.foot.pace);});}
 }
 // ---- the place in the picture: Alex's camera, compared ----
 if(seg('sign')){
 const V=SPOT.vantage,OS=SPOT.oldSign;goEN(...DOCKS[0].root,{r:1.2});for(const q of [[-164.5,344.5],[-150,345],[-130,350]])goEN(...q,{r:1.5,max:60});goEN(V[0],V[1],{r:.6});const sh=h.chapter5.W5(OS[0],OS[1]);faceV({x:sh.x,y:sh.y+1.7,z:sh.z});tap('KeyV');
 U(()=>C5().flags.match,20);if(C5().view==='camera')tap('KeyV');U(()=>S().phase==='d5-map',40);
 check(`${label}: the picture matched, by looking, at the old lot (camera up on the lead, at the vantage)`,()=>{assert.ok(C5().flags.match,JSON.stringify({where:C5().where,view:C5().view,sign:A5.C.sign,phase:S().phase}));assert.ok(log.said.some(l=>/exactly it/.test(l)));});
 U(()=>S().phase==='d5-map',40);
 // ---- the trail map; the gate ----
 goEN(-108,320.4,{r:.7});faceEN(-108,318.4,1.45);act('c5-map',6);U(()=>S().phase==='d5-gate',40);
 const GQ=Q5(...SPOT.gate),gateShut=h.nav.walkable(GQ.x,GQ.z)===false;goEN(SPOT.gate[0]+.6,SPOT.gate[1]-3.6,{r:.8});U(()=>C5().flags.choose,40);
 const gateBy=A5.GT.S.by.swing,gateOpen=A5.GT.isOpen('swing'),gateWalk=h.nav.walkable(GQ.x,GQ.z)===true;
 check(`${label}: the yellow gate is shut and in the way until a hand opens it: Jamie lifts the latch and walks it round, and then it lets you by`,()=>{assert.ok(gateShut,'shut: the road through it blocked');assert.equal(gateBy,'jamie');assert.ok(gateOpen,'swung open');assert.ok(gateWalk,'open: the way through');});
 if(choice==='sam'){const s=boys().find(c=>c.key==='sam');go({x:s.px,z:s.pz},{r:2,max:15});faceTo(s.px,s.pz);act('c5-hear',6);}else{goEN(SPOT.gate[0]-.2,SPOT.gate[1]+2.6,{r:.8});}
 U(()=>S().phase==='d5-road',40);check(`${label}: the yellow gate: a disagreement, and your call (${choice})`,()=>{assert.equal(C5().choice,choice==='sam'?'sam':'jamie');});
 }
 // ---- the road to the camp ----
 if(seg('road')){
 trek(gravel(14,186),{r:2,max:220,sprint:true});U(()=>S().phase==='d5-camp',20);
 // (Sam gets the flashlights out of his bag and holds yours out: F takes it, into your hand; Jamie takes his from Sam's)
 U(()=>A5.GR.S.offerTorch,30);{const P=A5.GR.S.torch;if(P){go({x:P.obj.position.x,z:P.obj.position.z},{r:.8,max:10});faceV(P.obj.position);W(.1);act('c5-torch',6);}}U(()=>C5().inv.flashlight,12);U(()=>A5.GR.S.jtorchTaken,30);
 check(`${label}: Camp Whippoorwill: the arch, a flashlight each, out of Sam's bag and handed over`,()=>{assert.equal(S().phase,'d5-camp');assert.ok(C5().inv.flashlight);assert.ok(h.foot.owned,'in your hand');assert.ok(A5.GR.S.jtorchTaken,'Jamie took his from Sam');assert.ok(A5.phys.LOG.log.some(l=>l[0]==='handoff'&&/flashlight/.test(l[1])),'handed');});
 // ---- what you carry (I): the camera and the flashlight listed; the flashlight put away and taken out from it; Escape closes it ----
 {const inv=A5.GR.inv;W(1.5);tap('KeyI');W(.2);const open1=inv.isOpen,rows=inv.rows(),names=rows.map(r=>r.id);const fi=rows.findIndex(r=>r.id==='flashlight');let away=null,outAgain=null;
  const wasOn=A5.GR.on;if(fi>=0){inv.S.sel=fi;tap('KeyF');W(.9);away=!A5.GR.inHand;inv.S.sel=inv.rows().findIndex(r=>r.id==='flashlight');tap('KeyF');W(.9);outAgain=A5.GR.inHand;}
  tap('Escape');W(.1);const closed=!inv.isOpen;if(A5.GR.on!==wasOn){tap('KeyT');W(.3);}/* (as it was: off, so it dies where the story has it, in Bluejay) */
  M2['chapter5 inventory']={open:open1,rows:names,putAway:away,takenOut:outAgain,escapeCloses:closed};
  check(`${label}: what you carry (I): the camera and the flashlight; put away and taken out from the bag; Escape closes it (not the pause)`,()=>{assert.ok(open1,'opens');assert.ok(names.includes('camera')&&names.includes('flashlight'),JSON.stringify(names));assert.ok(away,'put away');assert.ok(outAgain,'taken out');assert.ok(closed,'Escape closes it');assert.notEqual(h.snapshot.state,'paused','not paused');});}
 }
 // ---- the office: the door, the register, the search map ----
 if(seg('camp')){
 const campAt={where:C5().where,lock:h.roam.walkLock,view:A5.C.view,pose:!!A5.C.pose,inv:A5.GR.inv.isOpen,state:h.snapshot.state,act:A5.phys.ME.act?.what||A5.phys.ME.act?.kind||null,
  boys:jamieSam().map(c=>{const q=PL(c.px,c.pz);return [+q.e.toFixed(2),+q.n.toFixed(2),c.script?'script':'',h.chapter5.brain.state(c).goal];}),path:(()=>{const p=me(),d=Q5(...door('office',1.1));return h.nav.walkPath({x:p.x,z:p.z},d).map(q=>{const r=PL(q[0],q[1]);return [+r.e.toFixed(1),+r.n.toFixed(1)];});})(),walk0:h.nav.walkable(me().x,me().z),blk:h.chapter.blockers(true).map(o=>{const q=PL(o.x,o.z);return [o.r,+q.e.toFixed(1),+q.n.toFixed(1)];})};
 goEN(-165.6,513.4,{r:.3,max:6});/* (through the open half of the arch first, between the leaves, as you would: the right leaf stands half shut) */
 goEN(...door('office',1.1),{r:.5});campAt.after=C5().where;faceEN(...B('office').c);act('c5-door-office',5);W(1);
 {const b=B('office'),R=h.world.pine.anchors.register,[e,n]=b.F.to(R.x+.4,-R.z+.8);goEN(...b.F.to(b.door[0],b.d/2-.9),{r:.25});goEN(e,n,{r:.25});faceEN(...b.F.to(R.x+.4,-R.z));act('c5-register',6);
  for(let i=0;i<3;i++){W(1.2);tap('KeyD');}U(()=>quiet(),40);tap('KeyV');W(.6);tap('KeyS');W(1.5);
  const M3=h.world.pine.anchors.searchMap,[e2,n2]=b.F.to(M3.x,-M3.z+1.2);goEN(e2,n2,{r:.25});faceEN(...b.F.to(M3.x,-M3.z));act('c5-searchmap',6);U(()=>C5().clues.includes('searchmap'),40);}
 check(`${label}: the office: the 1991 register (August 24, twenty years ago) and the search map, photographed`,()=>{assert.ok(C5().clues.includes('register')&&C5().clues.includes('searchmap'),JSON.stringify(campAt));assert.ok(C5().photos.includes('register3'),JSON.stringify(C5().photos));assert.ok(log.said.some(l=>/None out/.test(l)));});
 // ---- the lodge: the pantry ----
 {const b=B('office');for(const [lx,lz] of [[-2.2,-.3],[-2.2,1.3],[-1.2,1.9],[-1.2,3.2],[-1.2,4.5]])goEN(...b.F.to(lx,lz),{r:.25,max:20});}// (round the counter, out the door)
 goEN(...door('office',2.6),{r:.3});goEN(...door('lodge',1.2),{r:.5});faceEN(...B('lodge').c);act('c5-door-lodge',5);W(1);
 {const b=B('lodge'),R=h.world.pine.anchors.pantryGap,[e,n]=b.F.to(R.x+1.15,-R.z);goEN(...b.F.to(b.door[0],b.d/2-1.2),{r:.3});goEN(e,n,{r:.25,max:60});faceEN(...b.F.to(R.x,-R.z));act('c5-pantry',6);U(()=>C5().clues.includes('pantry'),40);}
 check(`${label}: the lodge: cans gone from the dust, recently`,()=>{assert.ok(C5().clues.includes('pantry'),JSON.stringify({where:C5().where,view:C5().view,phase:S().phase,flags:C5().flags.pantry,lodge:BLD.lodge.F.of(C5().where.e,C5().where.n),doors:h.chapter5.C.flags}));assert.ok(log.said.some(l=>/soup/.test(l)));});
 // ---- a cabin: Bluejay; the flashlight; Sam's batteries ----
 goEN(...door('lodge',3),{r:.3});goEN(...door('bluejay',1.1),{r:.5});faceEN(...B('bluejay').c);act('c5-door-bluejay',5);W(.8);goEN(...door('bluejay',-.9),{r:.25});goEN(...B('bluejay').c,{r:.5});tap('KeyT');
 // (in the dark of the cabin it flickers and dies; Sam gets the spare batteries out of his bag and holds them out; F takes them, your hands change them)
 U(()=>C5().flags.dead,12);const deadAt=A5.C.t;U(()=>A5.GR.S.offerBatt,40);const offerAfter=A5.C.t-deadAt;{const P=A5.GR.S.batt;if(P){faceV(P.obj.position);W(.1);act('c5-batt',6);}}
 U(()=>C5().flags.batteries&&quiet(),40);check(`${label}: Bluejay, a dead flashlight, and Sam's batteries out of his bag, without being asked`,()=>{assert.ok(C5().clues.includes('cabin'));assert.ok(C5().flags.batteries);assert.ok(h.foot.on,'back on');assert.ok(offerAfter>2,'Sam took '+offerAfter.toFixed(1)+' s to get them out');assert.ok(log.said.some(l=>/batteries for the batteries/.test(l)));});
 // ---- the campfire ----
 U(()=>C5().flags.fireOffer,30);const L0=(()=>{const F=SPOT.campfire,a=.5;return [F[0]+Math.sin(a)*2.05,F[1]+Math.cos(a)*2.05];})();goEN(...door('bluejay',2.6),{r:.3});goEN(L0[0]+Math.sin(.5)*.9,L0[1]+Math.cos(.5)*.9,{r:.6,max:90});faceEN(...SPOT.campfire);act('c5-fire',6);
 const hf=C5().h,tf=A5.C.t;let lapsed=false;U(()=>{if(A5.C.lapse)lapsed=true;return S().phase==='e5-dusk';},240);const restS=A5.C.t-tf,restH=C5().h-hf;
 M2['chapter5 campfire rest']={seconds:+restS.toFixed(1),clockMinutes:+(restH*60).toFixed(1),from:hf,picture:A5.C.fireShot?.time};
 check(`${label}: the campfire: a short rest (${restS.toFixed(0)} s, the clock ${(restH*60).toFixed(0)} minutes on), water passed round, no hours lost`,()=>{assert.equal(S().phase,'e5-dusk');assert.ok(!lapsed,'no lapse');assert.ok(restS>45&&restS<240,'seconds '+restS);assert.ok(restH>0&&restH<.5,'clock '+restH);
  assert.ok(hf>18.2&&hf<19.1,'about a quarter to seven: '+hf);assert.ok(A5.C.flags.fireWater,'the water');assert.ok(log.said.some(l=>/Never mind/.test(l)));assert.ok(log.said.some(l=>/keep going/.test(l)));assert.ok(A5.C.fireShot&&/PM$/.test(A5.C.fireShot.time),'the picture from the trees, stamped '+A5.C.fireShot?.time);});
 }
 // ---- dusk: Wren; Owl ----
 if(seg('dusk')){
 const wren=A5.camp.LAMPS.wren.pos;faceV(wren);W(1.5);
 goEN(-232,548,{r:1.5});goEN(...door('owl',1.1),{r:.5,max:120});faceEN(...B('owl').c);act('c5-door-owl',6);W(1);
 {const b=B('owl'),[e,n]=b.F.to(b.w/2-1.25,-(b.d/2-.75));goEN(...door('owl',-.9),{r:.25});goEN(e,n,{r:.3});faceV(A5.C?{x:Q5(...b.F.to(0,-b.d/2)).x,y:b.y+b.floor+1.5,z:Q5(...b.F.to(0,-b.d/2)).z}:null);act('c5-shirt',6);U(()=>C5().flags.shirtDone,40);
  const cv=A5.carving.position;faceV(cv);act('c5-carving',6);U(()=>C5().flags.carvingDone,40);}
 check(`${label}: Owl: Alex's gold shirt, wet, and JSA cut fresh into the wall`,()=>{assert.ok(C5().flags.shirtSeen&&C5().flags.carvingSeen);assert.ok(log.said.some(l=>/still wet/.test(l)));assert.ok(log.said.some(l=>/J\. S\. A\./.test(l)));});
 // ---- they call; a light in the trees ----
 goEN(...door('owl',3.2),{r:.3});U(()=>S().phase==='e5-lights',60);
 check(`${label}: they call his name; a light in the trees (a ranger? somebody fishing?) turns its beam on them and goes out; the shirt off its nail by Sam's hand, into his bag`,()=>{assert.ok(C5().inv.shirt);assert.equal(A5.phys.PROPS.get('alex-shirt')?.state,'stored');assert.ok(A5.phys.LOG.log.some(l=>l[0]==='hold'&&l[1]==='alex-shirt'),'held');assert.ok(log.said.some(l=>/A light\. In the trees/.test(l)));assert.ok(log.said.some(l=>/Or a ranger/.test(l)));assert.ok(log.said.some(l=>/would have said something/.test(l)));});
 }
 // ---- going back: three lights, where you walked; the creature, afraid of them ----
 if(seg('lights')){
 goEN(-252,551,{r:1.5});U(()=>A5.C.lt?.started,30);const tl=h.snapshot.clock;faceEN(-190,541,4);let nearest=1e9;const lightGap=()=>{const p=me();for(let i=0;i<3;i++){const q=A5.camp.carriedAt(i);if(q)nearest=Math.min(nearest,Math.hypot(q.x-p.x,q.z-p.z));}};
 // (they stop at the map board: Jamie says flash them; you do, twice: off, on, off, on)
 U(()=>{lightGap();return A5.C.lt.board;},60);W(4);for(let i=0;i<4;i++){tap('KeyT');U(()=>{lightGap();return false;},1.3);}
 U(()=>{lightGap();return S().phase==='n5-split';},120);const LT=A5.C.lt;
 check(`${label}: three lights at the gate (lights, not people, the length of the camp away) walk where you walked: the office, the map board (they stop where you stood), one copies your flashlight, then they sit where you sat at the fire; the creature runs from them; they turn on you and go out`,()=>{
  assert.ok(watch.carried>=3,'carried '+watch.carried);assert.ok(LT.office&&LT.board&&LT.sat&&LT.turned&&LT.out,JSON.stringify({o:LT.office,b:LT.board,s:LT.sat,t:LT.turned,x:LT.out}));assert.ok(LT.copies>=2,'copied '+LT.copies);assert.ok(!LT.close,'never close');assert.ok(nearest>12,'nearest light '+nearest.toFixed(1)+' m');
  assert.ok(watch.creature>10,'creature frames '+watch.creature);assert.equal(C5().creature.stage,'gone');assert.ok(log.said.some(l=>/There’s a light\. At the gate/.test(l)));assert.ok(!log.said.some(l=>/Three of them|people/i.test(l)&&/gate/.test(l)),'no people seen at a hundred metres');
  assert.ok(log.said.some(l=>/doing what you do/.test(l)));assert.ok(log.said.some(l=>/where we sat/.test(l)));});
 M2['chapter5 three lights']={seconds:+(h.snapshot.clock-tl).toFixed(1),copies:LT.copies,nearest:+nearest.toFixed(1)};
 M2['chapter5 three lights seconds']=+(h.snapshot.clock-tl).toFixed(1);
 }
 // ---- the camp that wants them apart: look at Owl (it pulls Sam), then keep both close ----
 if(seg('split')){
 const sp0=C5().split;let pulled=null;faceV(A5.camp.LAMPS.owl.pos);U(()=>{const s=C5().split;if(s.drift.sam>1.5&&pulled==null)pulled={t:s.t,drift:s.drift};return C5().split.t>13;},20);
 // (as a player would: go and get whichever of them has gone farthest, then back to where the three of you were)
 U(()=>{const s=C5().split;if(s?.resolved)return true;const [j,sm]=[boys().find(c=>c.key==='jamie'),boys().find(c=>c.key==='sam')],far=s.drift.jamie>=s.drift.sam?j:sm;let t;
  if(Math.max(s.drift.jamie,s.drift.sam)>2)t={x:far.px,z:far.pz};else t=Q5(...s.center);const p=me();if(Math.hypot(t.x-p.x,t.z-p.z)>1.6){faceTo(t.x,t.z);press('KeyW');}else release('KeyW');return false;},75);release('KeyW');
 check(`${label}: at night the camp pulls at whichever friend you leave; together, Sam's compromise`,()=>{assert.ok(C5().split.resolved);assert.equal(C5().split.how,'together');assert.ok(pulled,'looking at Owl pulled Sam toward the office');assert.ok(log.said.some(l=>/she’s at work/.test(l)));});
 M2['chapter5 split']={resolvedAt:C5().split.t,how:C5().split.how,maxSpread:C5().split.maxSpread,pullAfterLookingAtOwl:pulled};void sp0;
 // ---- Owl, from the porch: Jamie ----
 U(()=>A5.C.flags.toWindow,20);const OP=(()=>{const b=B('owl');return b.F.to(0,b.d/2+b.porch-.4);})();goEN(OP[0],OP[1],{r:.6,max:120});
 U(()=>S().phase==='n5-window',10);const D0=A5.DOUBLE();faceV({x:D0.x,y:D0.y+1.45,z:D0.z});let dMin=1e9;U(()=>{const d=A5.camp.D,p=me();if(d.person.group.visible)dMin=Math.min(dMin,Math.hypot(d.x-p.x,d.z-p.z));return S().phase==='n5-run';},40);
 const moved=Math.hypot(A5.camp.D.x-D0.x,A5.camp.D.z-D0.z),iBack=log.said.findIndex(l=>/Back up/.test(l)),iRun=log.said.findIndex(l=>/RUN/.test(l));
 check(`${label}: Owl from the porch: a second Jamie, while Jamie is next to you; it turns to look at him, then comes out toward you (${moved.toFixed(1)} m, to ${dMin.toFixed(1)} m); only then every light at once, RUN`,()=>{assert.ok(watch.double>20,'double frames '+watch.double);assert.ok(log.said.some(l=>/That’s me/.test(l)));
  assert.ok(A5.C.win.comeAt!=null,'it came out');assert.ok(moved>2,'walked '+moved);assert.ok(iBack>=0&&iRun>iBack,'RUN after it came: '+iBack+' '+iRun);assert.ok(watch.lit>=6,'lamps lit '+watch.lit);});
 }
 // ---- run ----
 if(!seg('run'))return;
 const tRun=h.snapshot.clock;
 if(route==='A'){trek([P5(-262,556),P5(-236,552),P5(-212,546),P5(-192,538),P5(-178,524),P5(-170,518)],{r:1.6,max:120,sprint:true,stop:()=>C5().flags.gateShut});
  const latch=A5.GT.barPoint('campL',.75),mp=me(),ld=Math.hypot(mp.x-latch.x,mp.z-latch.z);go({x:latch.x+(mp.x-latch.x)/ld*1.15,z:latch.z+(mp.z-latch.z)/ld*1.15},{r:.4,max:25});faceV(latch);W(.25);assert.ok(act('c5-shove',5),'gate offers the player a pull');W(1.6);
  trek([P5(-163,506),P5(-158,496)],{r:1.6,max:30,sprint:true,stop:()=>C5().flags.boundary});}

 else{// Leave Owl's east-facing porch around its south wall; a distant waypoint cuts the cabin corner.
 trek([P5(-274,551),P5(-300,551),P5(-312,562)],{r:.25,max:60,sprint:true,stop:()=>C5().flags.boundary});
 walkTo([P5(-320,540),P5(-326,516),P5(-337,492),P5(-347,466),P5(-352,450),P5(-352,444)],{r:1.6,max:150,sprint:true,stop:()=>C5().flags.boundary});}// (onto the dam itself)
 U(()=>S().phase==='n5-out',40);check(`${label}: the escape by route ${route}, and the boundary: ${route==='A'?'the camp gate slams shut in front of you; you pull while Sam holds the latch':'the bell, by itself'}; every light out at once`,()=>{assert.equal(C5().route,route);assert.ok(C5().flags.boundary);if(route==='A')assert.equal(A5.C.flags.gateOpened,'you');assert.ok(Object.values(C5().lamps).every(v=>v<.2),JSON.stringify(C5().lamps));});
 M2['chapter5 escape seconds']=+(h.snapshot.clock-tRun).toFixed(1);
 M2['chapter5 pursuit']={secondsPresent:+(A5.C.esc?.visibleSeconds||0).toFixed(1),closestMetres:+(A5.C.esc?.closest||0).toFixed(2),gateHelp:!!A5.C.flags.gateHelp,doorBeat:!!A5.C.esc?.doorBeat,serviceBeat:!!A5.C.esc?.serviceBeat};
 const tRecovery=h.snapshot.clock;
 // ---- back to the bikes ----
 // (from the first point of the road ahead: the escape can end past the camp gate, and a point behind it would take the
 // walk back in and across the fence line)
 if(route==='A'){const back=gravel(4,186).reverse(),d=q=>Math.hypot(q[0]-me().x,q[1]-me().z);let i=0;while(i<back.length-1&&d(back[i+1])<d(back[i]))i++;
  trek([...back.slice(i),P5(-118,352),P5(-122,338),P5(-130,322),P5(-132.5,318.5)],{r:2,max:260,sprint:false,stop:()=>A5.C.flags.after});}/* (on to the rack itself: the lamp scene starts within 6 m of it) */
 else walkTo([P5(-358,410),P5(-362,380),P5(-346,347),P5(-320,334),P5(-292,324),P5(-262,317),P5(-228,316),P5(-198,319),P5(-170,322),P5(-145,320),P5(-132,318)],{r:2,max:320,stop:()=>A5.C.flags.after});
 U(()=>S().phase==='n5-final',40);M2['chapter5 recovery seconds']=+(h.snapshot.clock-tRecovery).toFixed(1);M2['chapter5 announced transition']=!!A5.C.out?.transition;U(()=>A5.C.flags.review,90);
 check(`${label}: the lamp in the lot: a shaky laugh, the shirt in Sam's bag, “it knew we’d come”`,()=>{assert.ok(log.said.some(l=>/like a duck/.test(l)),JSON.stringify({phase:S().phase,after:!!A5.C.flags.after,review:!!A5.C.flags.review,last:log.said.slice(-10)}));assert.ok(log.said.some(l=>/knew we’d come/.test(l)));});
 // ---- the last picture ----
 tap('KeyV');W(.5);for(let i=0;i<40&&A5.C.view==='camera'&&h.chapter4.photo.V.i<C5().fireIdx;i++){tap('KeyD');W(.15);}U(()=>C5().flags.found,20);
 check(`${label}: on Alex's camera, a picture none of them took (the three of them at the fire, ${A5.C.fireShot?.time})`,()=>{assert.ok(C5().flags.found);assert.ok(C5().fireIdx>0);assert.ok(log.said.some(l=>/in my bag/.test(l)));});
 U(()=>A5.C.flags.finalImage,90);faceV(A5.camp.LAMPS.owl.pos);U(()=>h.snapshot.state==='ended',30);
 check(`${label}: the last image (one light across the water), then the end card: LAST LIGHT · Chapter Five · August 24, 2011, and its Chapter Six button`,()=>{assert.equal(h.snapshot.state,'ended');const el=element('ending');assert.match(el.querySelector?.('h2')?.innerHTML||'Chapter Five',/Chapter Five/);assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/Chapter Six/);
  assert.ok(log.said.some(l=>/good sock/.test(l)));});
 check(`${label}: Jamie and Sam never left: farthest ${watch.gapMax.toFixed(1)} m (${JSON.stringify(watch.gapAt)}); nothing non-finite`,()=>{assert.ok(watch.gapMax<30,JSON.stringify(watch.gapAt));assert.deepEqual(log.bad,[]);});
 const minutes=(h.snapshot.clock-t0)/60;
 // (each time the guard put a friend back near you out of sight, and the two events before it: where it happened)
 {const L=h.tension?.log||[];M2['chapter5 catch-ups']=L.map((e,i)=>/^caught up/.test(e.why||'')?{who:e.why.slice(11),after:L.slice(Math.max(0,i-2),i).map(x=>x.why)}:null).filter(Boolean);}
 M2['chapter5 natural minutes']=+minutes.toFixed(2);M2['chapter5 lines spoken']=log.said.length;M2['chapter5 photos on the camera']=C5().photosOnCamera;M2['chapter5 guard']=C5().guard;M2['chapter5 sounds']=C5().sounds;
 return {minutes,watch};
}

// ---- jumps, Continue, Start over, the DEV selector, stress, the camp's attention, fallbacks ----------------------------------------
export async function runChapterFiveChecks(T,cap){
 const {h,advance,check,metrics,element}=T,X=chapterFiveTools(T),{C5,A5,S,until,wait,me,faceTo,boys,gap,log,Q5,go}=X;
 // every jump: no error; the phase it should be; Jamie and Sam there, near you, finite
 const jumps={};
 for(const sec of A5.SECTIONS){let r;try{h.jump(sec);advance(.2);const ph0=S().phase;until(()=>false,2.5);r={ok:true,phase:ph0,phase2:S().phase,gap:+gap().toFixed(1),finite:X.companionsFinite(),boys:boys().length};}catch(e){r={ok:false,err:String(e).slice(0,300)};}jumps[sec]=r;}
 check(`Chapter Five: every one of its ${A5.SECTIONS.length} jumps starts without an error, Jamie and Sam with you`,()=>{const bad=Object.entries(jumps).filter(([k,r])=>!r.ok||!r.finite||r.boys!==2||(r.gap>14&&!/^(chapter5-start|c5-garage|c5-departure)$/.test(k)));assert.deepEqual(bad,[]);});
 // a jump (Continue, DEV) into the ride, the park or the set piece: the beat's own lines and objective; the flashlight's lights in the scene
 const obj={};for(const sec of ['c5-ride','c5-race','c5-crest','c5-arrival','c5-camp-gate','c5-split','c5-compromise','c5-camp']){h.jump(sec);advance(.2);until(()=>!!S().objective,20);obj[sec]={objective:S().objective||'',flash:!!h.foot.light.parent&&!!h.foot.spill.parent};}
 check('Chapter Five: a jump into the ride, the park or the set piece shows its objective; the flashlight’s two lights are in the scene',()=>{const bad=Object.entries(obj).filter(([k,v])=>!v.objective||!v.flash);assert.deepEqual(bad,[],JSON.stringify(obj));});
 for(const [k,a] of Object.entries(A5.ALIAS)){h.jump(k);advance(.1);check(`Chapter Five alias ${k} → ${a}`,()=>assert.ok(S().phase&&A5.owns(S().phase)));}
 // Continue: every checkpoint label exists and returns there
 const labels=Object.keys(A5.LABEL);check(`Chapter Five: ${labels.length} checkpoints, each a jump`,()=>{for(const id of labels)assert.ok(A5.SECTIONS.includes(id),id);});
 // ---- Jamie and Sam under stress: you run off across the camp, double back, stand in a cabin; they keep up -----------------
 h.jump('c5-camp');advance(.5);const stress={max:0};const pts=[[-200,560],[-246,552],[-276,540],[-206,520],[-170,516],[-230,600],[-190,545]];
 for(const [e,n] of pts){X.goEN(e,n,{r:1.2,max:60,sprint:true});until(()=>{stress.max=Math.max(stress.max,gap());return false;},2);}
 check(`Chapter Five stress: sprinting round the camp, Jamie and Sam stay with you (farthest ${stress.max.toFixed(1)} m, ${JSON.stringify(C5().guard)})`,()=>assert.ok(stress.max<26,stress.max));
 metrics['chapter5 companion stress']={farthest:+stress.max.toFixed(1),guard:C5().guard};
 // ---- the camp's attention answers you: stay with Jamie (Sam is pulled), with Sam (Jamie is), look at Owl (Sam is) ----
 const att={};for(const [name,fn] of [['stay with Jamie',()=>{const j=boys().find(c=>c.key==='jamie');go({x:j.px,z:j.pz},{r:1.5,max:3});}],['stay with Sam',()=>{const s=boys().find(c=>c.key==='sam');go({x:s.px,z:s.pz},{r:1.5,max:3});}],['look at Owl',()=>{const q=A5.camp.LAMPS.owl.pos;X.faceV(q);}]]){
  h.jump('c5-split');advance(.2);S().queue.length=0;S().line=null;until(()=>{fn();return C5().split.t>22;},40);att[name]={...C5().split.drift,resolved:C5().split.resolved};}
 check('Chapter Five set piece: the camp pulls at the friend you are not with (and at Sam when you watch Owl)',()=>{assert.ok(att['stay with Jamie'].sam>att['stay with Jamie'].jamie,JSON.stringify(att));assert.ok(att['stay with Sam'].jamie>att['stay with Sam'].sam,JSON.stringify(att));assert.ok(att['look at Owl'].sam>1,JSON.stringify(att));});
 metrics['chapter5 attention']=att;
 // and in time, whatever you do, they come back together (nobody is lost)
 h.jump('c5-split');advance(.2);until(()=>C5().split.resolved,80);check('Chapter Five set piece: in time the two of them come back together on their own (Sam’s compromise)',()=>assert.ok(C5().split.resolved));
 // ---- fallbacks: a player who idles everywhere is carried on, never stuck ------------------------------------------------------
 // Standing still in each scene. Evidence is yours to find (the picture's match, the camp's records and pantry and cabins,
 // the shirt, the last picture): those scenes never move on without you, they say more and more plainly where to look.
 // Getting somewhere (the map, the gate, the road, Owl, the porch, the walk back) is pulled along by the boys, and only
 // after a long while (a lost walk) does a fade bring you on. The optional and the eventful move on in time.
 const EVIDENCE=new Set(['c5-sign-search','c5-camp','c5-owl','c5-second-discovery']),TRAVEL=new Set(['c5-trail-map','c5-gate-decision','c5-gravel-road','c5-golden-hour','c5-window','c5-aftermath']);
 const idle={};for(const sec of ['c5-park','c5-stones','c5-dock-memory','c5-sign-search','c5-trail-map','c5-gate-decision','c5-gravel-road','c5-camp','c5-golden-hour','c5-owl','c5-three-lights','c5-split','c5-window','c5-run','c5-route-c','c5-aftermath','c5-second-discovery','chapter5-end']){
  h.jump(sec);advance(.3);const ev0=JSON.stringify({m:!!C5().flags.match,c:C5().clues.length,s:!!C5().flags.shirtSeen,f:!!C5().flags.found}),ph=S().phase,n0=log.said.length,lim=EVIDENCE.has(sec)?(sec==='c5-camp'?420:300):sec==='c5-park'?260:TRAVEL.has(sec)?320:420;const moved=until(()=>S().phase!==ph||h.snapshot.state==='ended'||(sec==='c5-split'&&C5().split?.resolved),lim);
  // (and wherever a fallback's fade put the three of you, it is ground you can walk on)
  wait(1.5);const p=me(),stand=[p,...boys().map(c=>({x:c.px,z:c.pz}))].map(q=>!!h.nav.walkable(q.x,q.z,{r:.25}));
  const found=JSON.stringify({m:!!C5().flags.match,c:C5().clues.length,s:!!C5().flags.shirtSeen,f:!!C5().flags.found})!==ev0;
  idle[sec]={from:ph,to:S().phase,moved,found,said:log.said.length-n0,kind:EVIDENCE.has(sec)?'evidence':TRAVEL.has(sec)?'travel':'event',ended:h.snapshot.state==='ended',stand:A5.C.pose||h.snapshot.state==='ended'||stand.every(Boolean)};}
 check('Chapter Five fallbacks: standing still, evidence is never found for you (only hints, plainer each time); getting somewhere, the boys pull you along; the optional and the eventful move on; nobody left where they cannot walk',()=>{
  const bad=Object.entries(idle).filter(([k,v])=>!v.stand||(v.kind==='evidence'&&(v.found||v.said<2))||(v.kind==='travel'&&!v.moved&&v.said<2)||(v.kind==='event'&&!v.moved));assert.deepEqual(bad,[]);});
 metrics['chapter5 idle fallbacks']=Object.fromEntries(Object.entries(idle).map(([k,v])=>[k,v.kind+': '+v.from+'→'+(v.ended?'end':v.to)+' ('+v.said+' lines)']));
 // ---- the garage: after "Ride to Pine Ridge." you have a minute to ride out before the fade carries you ----
 {h.jump('c5-departure');advance(.3);until(()=>A5.C.flags.leave,120);const t0=h.snapshot.clock,n0=log.said.length;until(()=>A5.C.flags.toRoad,220);const gap=h.snapshot.clock-t0,calls=log.said.length-n0;
  check(`Chapter Five garage: standing still after “Ride to Pine Ridge.”, they wait at the end of the driveway and call you (${calls} lines); only after ${gap.toFixed(0)} s does the ride out come on its own`,()=>{assert.ok(gap>150&&gap<175,gap);assert.ok(calls>=2,'calls '+calls);});}
 // ---- the campfire: S stands you up while they talk, F sits you back down ----
 {const {tap}=T;h.jump('c5-campfire');advance(.3);X.act('c5-fire',6);until(()=>A5.C.pose?.w>.95,5);const sat=!!A5.C.pose;tap('KeyS');until(()=>!A5.C.pose,4);const stood=!A5.C.pose&&!h.night.roam.walkLock;
  wait(1);const talking=S().phase==='d5-fire'&&(!!S().line||S().queue.length>0);X.act('c5-resit',6);until(()=>A5.C.pose?.w>.95,5);const again=!!A5.C.pose;
  // stand up again and walk off: the talk goes on and ends, and they get up to go on (no carrying you back, no lapse)
  tap('KeyS');until(()=>!A5.C.pose,4);X.goEN(SPOT.campfire[0]+12,SPOT.campfire[1]-8,{r:1,max:20});let lapsed=false;until(()=>{if(A5.C.lapse)lapsed=true;return S().phase==='e5-dusk';},200);const went=S().phase==='e5-dusk'&&!lapsed&&!A5.C.pose;
  check('Chapter Five campfire: sitting is yours to undo (S stands you up, the talk goes on, F sits you back down; walk off and it still ends, nobody carries you back)',()=>{assert.ok(sat&&stood&&talking&&again&&went,JSON.stringify({sat,stood,talking,again,went,lapsed}));});}
 // ---- Chapter Four keeps its north edge: Mill Street past the sawhorse opens only in Chapter Five ------------------------------
 {const {TW}=await import('../dist/town-plan.js'),probe=()=>[70,78,84].map(v=>{const q=TW(0,v);return {v,walk:!!h.nav.walkable(q.x,q.z),ride:!!h.nav.rideable(q.x,q.z)};});
  h.jump('c4-main-street');advance(.5);const ch4=probe();h.jump('c5-ride');advance(.5);const ch5=probe();
  check('Chapter Four keeps its north edge (Mill Street past the sawhorse is closed); Chapter Five opens the road to Pine Ridge',()=>{assert.ok(ch4.every(r=>!r.walk&&!r.ride),JSON.stringify(ch4));assert.ok(ch5.every(r=>r.ride),JSON.stringify(ch5));});}
 // ---- Start over from inside Chapter Five: the prologue, clean ----------------------------------------------------------------
 h.jump('c5-split');advance(2);element('restart').onclick?.();advance(.5);check('Start over from inside Chapter Five begins the prologue normally (nothing of the camp left)',()=>{assert.equal(h.snapshot.state,'riding');assert.equal(h.chapter.state.phase,'off');assert.equal(A5.camp.carrying(),0);assert.equal(A5.props.parent,null);});
 // ---- the DEV selector: Chapter Five Start equals arriving naturally; scenes start; switching leaks nothing --------------------
 if(cap?.natural?.[5]){const {compare,far,strict}=await import('./dev-chapters-sim.mjs');const devAt=()=>{const ph=h.devStart(5);advance(1/30);return {ph,snap:h.dev.snapshot()};};
  const {ph,snap}=devAt(),d=compare(cap.natural[5],snap,5,.04).filter(x=>!/^(chapter5\.C\.(t|pt|h|minute|lastEvent)|chapter5\.state\.(t|h|clock|where\.(e|n))|game\.clock)/.test(x[0])),f=far(cap.natural[5],snap);// (where.e/n mirror the player's position, which far() checks like every inherited position)
  check(`DEV start at Chapter Five (phase ${ph}): the same state as arriving from Chapter Four's end card (${d.length} differences)`,()=>{assert.deepEqual(d,[],JSON.stringify(d.slice(0,12)));assert.deepEqual(f,[]);});
  const clean5=devAt().snap,sw=[];for(const n of [5,1,5,4,5,0,3,5]){const s=(n===5?devAt().snap:(h.devStart(n),h.dev.snapshot()));if(n===5){const dd=strict(clean5,s,5);if(dd.length)sw.push({n,d:dd.slice(0,6)});}}
  check('DEV switching 5→1→5→4→5→0→3→5 in one session: every Chapter Five start identical to a clean one',()=>assert.deepEqual(sw,[],JSON.stringify(sw)));metrics['chapter5 dev']={differences:d.length,switchingLeaks:sw.length};}
 const SC=h.dev.SCENES[5],st={};for(const sc of SC){try{const p2=h.devScene(5,sc.id);advance(1/30);st[sc.id]={ok:true,phase:p2};}catch(e){st[sc.id]={ok:false,err:String(e).slice(0,200)};}}
 check(`DEV scenes: all ${SC.length} Chapter Five scenes start without an error`,()=>assert.deepEqual(Object.entries(st).filter(([,r])=>!r.ok),[]));
 // (each key scene starts shortly BEFORE its event)
 const BEFORE={'c5-race':()=>!C5().race?.winner,'c5-stones':()=>!C5().stones,'c5-dock-memory':()=>!C5().flags.dock,'c5-photo-match':()=>!C5().flags.match,'c5-gate-decision':()=>!C5().choice,'c5-register':()=>!C5().clues.includes('register'),
  'c5-pantry':()=>!C5().clues.includes('pantry'),'c5-cabins':()=>!C5().flags.batteries,'c5-campfire':()=>!C5().flags.fire,'c5-owl':()=>!C5().flags.shirtSeen,'c5-calling':()=>C5().carried===0,'c5-three-lights':()=>!A5.C.lt?.started,
  'c5-split':()=>!C5().split?.resolved,'c5-compromise':()=>!C5().split?.resolved,'c5-window':()=>!C5().double,'c5-boundary':()=>!C5().flags.boundary,'c5-second-discovery':()=>!C5().flags.found,'chapter5-end':()=>h.snapshot.state!=='ended'};
 const notBefore=[];for(const [id,fn] of Object.entries(BEFORE)){h.devScene(5,id);advance(1/30);if(!fn())notBefore.push(id);}
 check(`DEV scenes: each of ${Object.keys(BEFORE).length} key Chapter Five scenes starts shortly BEFORE its event`,()=>assert.deepEqual(notBefore,[]));
 // switching scenes, playing a little each time: no leaks (each identical to a clean start of that scene)
 const {strict}=await import('./dev-chapters-sim.mjs');const ORDER=[[5,'c5-split'],[3,'c3-creature-chase-start'],[5,'c5-owl'],[4,'c4-escape'],[5,'c5-run'],[1,'oak'],[5,'c5-split'],[5,'chapter5-end'],[5,'c5-owl']];
 const clean={},leaks=[];const scene=(n,id)=>{h.devScene(n,id);advance(1/30);return h.dev.snapshot();};for(const [n,id] of ORDER)if(n===5&&!clean[id])clean[id]=scene(5,id);
 for(const [n,id] of ORDER){const snap=scene(n,id);if(n===5){/* (Chapter Four's own dormant streetlight clock, as chapter4-sim.mjs leaves it out too) */const d=strict(clean[id],snap,5).filter(x=>!/^(game\.clock|chapter5\.(C|state)\.(t|lastEvent)|chapter4\.state\.(photos|presence))/.test(x[0]));if(d.length)leaks.push({id,d:d.slice(0,6)});}advance(4);}
 check(`DEV scene switching through Chapter Five and back (${ORDER.map(o=>o.join('/')).join(' → ')}): no leaks`,()=>assert.deepEqual(leaks,[],JSON.stringify(leaks)));
 metrics['chapter5 dev scenes']={scenes:SC.length,started:Object.values(st).filter(r=>r.ok).length,before:Object.keys(BEFORE).length-notBefore.length+'/'+Object.keys(BEFORE).length,leaks:leaks.length};
 // ---- Jamie and Sam, measured: the companion acceptance tests ----
 runCompanionTests(T,X);
 element('restart').onclick?.();advance(.5);
 void wait;void me;void faceTo;void Q5;void log;
}
