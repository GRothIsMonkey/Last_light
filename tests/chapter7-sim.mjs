// Chapter Seven (The Street That Wasn't There): played from Chapter Six's end card to Chapter Seven's, with inputs only
// (walking, riding, F on what the prompt offers, the mouse on the map, hiding and timing in the stealth, riding hard in the
// chase, holding on in the struggle, writing the names), plus the chapter's own checks. Used by verify.mjs (ONLY=chapter7,
// and the full run) and by chapter7-browser.mjs (the same playthrough in Chromium, a segment per call).
import assert from 'node:assert/strict';
import {chapterSixTools} from './chapter6-sim.mjs';
import {LOOKOUT} from '../dist/layout.js';
import {DEV_SCENES} from '../dist/dev-chapters.js';

export function chapterSevenTools(T0){
 const T=T0.__seven||(T0.__seven={...T0,advance:(s,each)=>T0.advance(s,()=>{each?.();T.each?.();})});
 const X=chapterSixTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo,route}=X;
 const A7=h.chapter7,C7=()=>A7.state,S=()=>h.chapter.kit.S,ph=()=>S().phase;
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 const spot=()=>h.chapter.spot?.();
 const faceV=(v,{pitch=null}={})=>{const c=h.camera.position;faceTo(v.x,v.z,pitch??Math.atan2((v.y??c.y)-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 // F on a spot: get near it, look at it, wait for the prompt to offer it, press
 const act=(id,{at=null,max=10,r=1.2}={})=>{if(at){approach(at,r);faceV(at);}let ok=false;until(()=>{const s=spot();if(s?.id===id){tap('KeyF');ok=true;return true;}if(at)faceV(at);return false;},max);return ok;};
 // (walking, a bike left standing is in the way like anything else: the route goes round it, not over it)
 // (and your own bike, standing where you got off it, is in your way on foot: the game keeps you half a metre from it)
 // To within r of q on foot: a fine grid search over the nav's own walkable (as Chapter Six's sim does), with what is in your
 // way: people standing (Jamie walking after you steps aside when you walk into him: he is not a wall; standing where the
 // chapter put him, he is), low things (the game does not let you walk through a bike or a can), and your own bike standing
 // where you got off it. Standing clear, the way never cuts a corner it could not walk; wedged somewhere, out of it first
 // (through what the game itself lets you stand in: never into a car or a wall).
 function solidRoute(to,r=0,step=.1,pad=6){const p=me(),J=h.chapter.kit?.jamie,yields=J&&J.active&&J.follow==='walk'&&!J.script,rb=h.night.roam;
  const BL=(h.chapter.blockers?.(true)||[]).filter(b=>!(yields&&Math.hypot(b.x-J.px,b.z-J.pz)<.08)&&Math.hypot(b.x-p.x,b.z-p.z)>b.r+.3);
  if(p.walking&&rb&&Number.isFinite(rb.x)&&Math.hypot(rb.x-p.x,rb.z-p.z)>.55)BL.push({x:rb.x,z:rb.z,r:.2});
  const ok=(x,z)=>h.nav.walkable(x,z,{r:.31})&&!BL.some(b=>Math.hypot(b.x-x,b.z-z)<b.r+.36),tight=!ok(p.x,p.z);
  const x0=Math.min(p.x,to.x)-pad,z0=Math.min(p.z,to.z)-pad,nx=Math.ceil((Math.max(p.x,to.x)+pad-x0)/step),nz=Math.ceil((Math.max(p.z,to.z)+pad-z0)/step);
  const I=(x,z)=>[Math.round((x-x0)/step),Math.round((z-z0)/step)],P=(i,j)=>({x:x0+i*step,z:z0+j*step}),key=(i,j)=>i*100000+j;
  const [si,sj]=I(p.x,p.z),prev=new Map([[key(si,sj),null]]),q=[[si,sj]];let end=null,best=null,bd=1e9;
  for(let n=0;n<q.length&&n<250000;n++){const [i,j]=q[n],c=P(i,j),d=Math.hypot(c.x-to.x,c.z-to.z);if(d<bd){bd=d;best=[i,j];}if(d<=Math.max(r,step*.8)){end=[i,j];break;}
   for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ii=i+a,jj=j+b,k=key(ii,jj);if(ii<0||jj<0||ii>nx||jj>nz||prev.has(k))continue;const w=P(ii,jj);
    if(!ok(w.x,w.z)&&!(tight&&Math.hypot(w.x-p.x,w.z-p.z)<.7&&h.nav.walkable(w.x,w.z)&&!BL.some(b=>Math.hypot(b.x-w.x,b.z-w.z)<b.r+.2)))continue;prev.set(k,[i,j]);q.push([ii,jj]);}}
  const tail=end||best;if(!tail)return [];const pts=[];for(let c=tail;c;c=prev.get(key(c[0],c[1])))pts.unshift(P(c[0],c[1]));
  const clear=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.04);for(let k=1;k<=n;k++)if(!ok(a.x+(b.x-a.x)*k/n,a.z+(b.z-a.z)*k/n))return false;return true;};
  const out=[];for(let i=0;i<pts.length-1;){let j=pts.length-1;while(j>i+1&&!clear(pts[i],pts[j]))j--;out.push([pts[j].x,pts[j].z]);i=j;}return out;}
 // (a walker pushed sideways on the way, round Jamie, can end up wedged on a corner the route only grazed: like a player,
 // it stops pushing after a moment (longer than Jamie takes to step round someone walking into him) and finds the way
 // again from where it stands: first a short step back out the way it can actually walk (open all along, as the game's
 // own walking checks it), the most toward where it is going, then a new way from there)
 const unwedge=q=>{const p=me();let best=null,bs=-9;
  for(let k=0;k<24;k++){const a=k*Math.PI/12,dx=Math.sin(a),dz=-Math.cos(a);let open=true;for(let s=.04;s<=.46;s+=.04)if(!h.nav.walkable(p.x+dx*s,p.z+dz*s)){open=false;break;}if(!open)continue;
   const e={x:p.x+dx*.45,z:p.z+dz*.45},sc=((q.x-p.x)*dx+(q.z-p.z)*dz)/(Math.hypot(q.x-p.x,q.z-p.z)||1)+(h.nav.walkable(e.x,e.z,{r:.36})?1:0);if(sc>bs){bs=sc;best=e;}}
  if(best)walkTo([[best.x,best.z]],{r:.1,max:1.5});return !!best;};
 const approach=(q,r=.9,o={})=>{const clock=()=>h.snapshot.clock,end=clock()+(o.max??60);
  for(let k=0;k<5;k++){const path=solidRoute(q,r,.1,o.pad??6);if(!path.length)return Math.hypot(me().x-q.x,me().z-q.z)<=r+.4;
   let last=me(),lastT=clock(),wedged=false;
   const ok=walkTo(path,{r:.08,...o,max:Math.max(.5,end-clock()),stop:()=>{if(o.stop?.())return true;const p=me();if(Math.hypot(p.x-last.x,p.z-last.z)>.05){last=p;lastT=clock();return false;}return wedged=clock()-lastT>1.6;}});
   if(!wedged||clock()>=end)return ok;
   if(globalThis.process?.env?.TRACE7){const p=me(),J=h.chapter.kit?.jamie;console.log('  (wedged at',p.x.toFixed(2),p.z.toFixed(2),'- stepping out and finding the way again)',J?'jamie '+J.mode+' '+(+J.px).toFixed(2)+','+(+J.pz).toFixed(2)+' script '+!!J.script+' follow '+J.follow:'','blockers',JSON.stringify((h.chapter.blockers?.(true)||[]).filter(b=>Math.hypot(b.x-p.x,b.z-p.z)<3).map(b=>[+b.x.toFixed(2),+b.z.toFixed(2),b.r])),'walk',h.nav.walkable(p.x,p.z),h.nav.walkable(p.x,p.z,{r:.31}));}
   unwedge(q);}
  return false;};
 const settle=(max=30)=>until(()=>quiet()&&!A7.C.view,max);
 const ride=(pts,{max=160,r=2.4,hard=false,stop=null}={})=>{if(hard)press('ShiftLeft');h.drive(pts.map(q=>Array.isArray(q)?q:[q.x,q.z]),{r,stop:false});const ok=until(()=>!h.driving||!!stop?.(),max);h.stopDriving();if(hard)release('ShiftLeft');return ok;};
 return {...X,T,A7,C7,S,ph,quiet,spot,faceV,act,approach,settle,ride,solidRoute};
}

export const SEG7=['house','garage','reyes','afternoon','court','green','upstairs','chase','abduction','after','night'];
const JUMP7={house:'chapter7-start',garage:'c7-garage',reyes:'c7-reyes',afternoon:'c7-curb',court:'c7-lane',green:'c7-house',upstairs:'c7-clues',chase:'c7-bikes',abduction:'c7-lookout-attack',after:'c7-after',night:'c7-sams'};

export function playChapterSeven(T,label,{fromCard=true,from=null,to=null,cont=false,looks=true}={}){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterSevenTools(T),{A7,C7,S,ph,quiet,spot,faceV,act,approach,settle,ride,until,wait,me,faceTo,walkTo,route,offBike,onBike}=X;
 const M7=/replay|DEV/.test(label)?{}:(metrics['chapter7']||(metrics['chapter7']={}));
 const watch=A7.__watch||(A7.__watch={bad:0,jumps:0,lastP:null,phases:[],lines:[],minutes:{},gapMax:{},creatureSeen:0,jamieVisibleAfter:0,samSeen:0,heldFrames:0,attachErr:0});
 const sample=()=>{const s=C7(),p=me();if(watch.phases[watch.phases.length-1]!==s.phase)watch.phases.push(s.phase);
  for(const v of [p.x,p.z,h.camera.position.y])if(!Number.isFinite(v))watch.bad++;
  if(A7.C.fadeOut<0&&watch.lastP&&h.night.state===watch.lastP.st&&!A7.C.lastCross||(A7.C.lastCross&&A7.C.t-A7.C.lastCross.t>.2&&watch.lastP)){const d=watch.lastP?Math.hypot(p.x-watch.lastP.x,p.z-watch.lastP.z):0;if(d>2.5&&A7.C.fadeOut<0&&!(A7.C.lastCross&&A7.C.t-A7.C.lastCross.t<.4))watch.jumps++;}watch.lastP={x:p.x,z:p.z,st:h.night.state};
  const jamie=h.chapter.kit.jamie,sam=h.chapter.kit.sam;if(s.hunter.visible)watch.creatureSeen++;if(sam.person.group.visible&&/^(d7|e7|n7)-/.test(s.phase))watch.samSeen++;
  if(s.flags.jamieTaken&&jamie.person.group.visible)watch.jamieVisibleAfter++;
  // (held: his ankle is in its hand: the distance from the hand to his feet)
  if(s.jamie.held&&A7.HM.visible){watch.heldFrames++;const g=A7.HM.sockets.grab.getWorldPosition(new (h.camera.position.constructor)()),f=jamie.person.group.position;if(Math.hypot(g.x-f.x,g.z-f.z)>.35)watch.attachErr++;}
  if(/^(d7-step|e7-(ride|lookout|court|dining)|n7-bikes)$/.test(s.phase)&&A7.C.fadeOut<0&&jamie.active&&!jamie.gone){const g=Math.hypot((jamie.mode==='ride'?jamie.bx:jamie.px)-p.x,(jamie.mode==='ride'?jamie.bz:jamie.pz)-p.z);watch.gapMax[s.phase]=Math.max(watch.gapMax[s.phase]||0,+g.toFixed(1));}
  const l=h.chapter.state.line;if(l&&watch.lastLine!==l){watch.lastLine=l;watch.lines.push((h.chapter.state.speaker||'')+': '+l);}};
 X.T.each=sample;const U=(fn,max)=>until(fn,max);const W=s=>U(()=>false,s);
 const seg=k=>{const fi=from?SEG7.indexOf(from):0,li=to?SEG7.indexOf(to):SEG7.length-1,ki=SEG7.indexOf(k);if(ki<fi||ki>li)return false;if(from===k&&ki>0&&!cont){h.jump(JUMP7[k]);W(.5);}return true;};
 const said=t=>watch.lines.some(l=>l.includes(t));
 const clock0=()=>h.snapshot.clock;let t0=clock0(),tSeg=t0;const lap=k=>{const t=clock0();watch.minutes[k]=+((t-tSeg)/60).toFixed(2);tSeg=t;};
 const note=(...a)=>{if(globalThis.process?.env?.TRACE7){const p=me();console.log('['+(clock0()-t0).toFixed(1)+'s '+ph()+' '+p.x.toFixed(1)+','+p.z.toFixed(1)+']',...a);}};
 const HS=A7.house.SPOTS,court=A7.court,SP=court.SPOT;
 // ---- I. the house without Sam ----
 if(seg('house')){
  if(!from&&fromCard){if(h.snapshot.state!=='ended'){h.jump('chapter6-end');U(()=>h.snapshot.state==='ended',80);}
   check(`${label}: Chapter Six's end card offers Chapter Seven`,()=>{assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/Chapter Seven/);});
   element('next-chapter').onclick();}
  else if(from==='house'&&!cont)h.jump('chapter7-start');
  t0=tSeg=clock0();let card=null;
  U(()=>{const el=element('chapter-card');if(el.classList.contains('on'))card={h2:el.querySelector?.('h2')?.textContent,sub:el.querySelector?.('.card-sub')?.innerHTML};return ph()==='d7-step';},14);
  check(`${label}: black, the card, then outside Sam's house on Friday morning`,()=>{assert.equal(ph(),'d7-step');assert.match(element('date').innerHTML,/AUGUST 26, 2011/);});
  note('step');approach(A7.STEP,2.2);U(()=>C7().phase==='d7-step'&&A7.C.st?.knock,40);settle(20);
  check(`${label}: Jamie on the step ("I couldn't knock.")`,()=>assert.ok(said('I couldn’t knock')));
  act('c7-knock',{at:{...A7.STEP,y:A7.STEP.y+1.4},max:12});U(()=>ph()==='d7-house',12);settle(30);
  check(`${label}: inside, Sam's mom and dad`,()=>{assert.equal(ph(),'d7-house');assert.ok(said('Shoes are fine'));assert.ok(said('Thank you for coming'));});
  note('to his room');approach(HS.samIn,.6);U(()=>A7.C.flags.inRoom,10);settle(12);
  check(`${label}: Sam's room (the fan running)`,()=>{assert.ok(A7.C.flags.inRoom);assert.ok(A7.house.ST.fan);});
  // the fan: off; his dad comes in and turns it back on
  act('c7-fan',{at:HS.fan,r:1.0,max:10});U(()=>A7.C.flags.fanOff,4);U(()=>A7.C.rm?.dadDone,30);settle(10);
  check(`${label}: the fan off, his dad turns it back on ("He can't sleep without that.")`,()=>{assert.ok(A7.house.ST.fan);assert.ok(said('He can’t sleep without that'));});
  // the photograph: hold it, put it down
  act('c7-photo',{at:HS.photo,r:.9,max:10});U(()=>A7.C.view==='inspect',4);W(2.5);h.chapter4.pan(60,0);W(.6);
  check(`${label}: the photograph in your hand (the four of you at the oak)`,()=>{assert.equal(C7().lookKind,'photo');assert.equal(C7().photo,'four');});
  settle(10);tap('KeyS');U(()=>!A7.C.view,3);
  // his notebook: take it, read it, put it down
  act('c7-notebook',{at:HS.notebook,r:.9,max:10});U(()=>A7.C.view==='inspect',6);settle(20);tap('KeyS');U(()=>!A7.C.view,3);
  check(`${label}: Sam's notebook taken (one page torn out)`,()=>{assert.equal(C7().inv.notebook,'have');assert.ok(said('torn out'));});
  if(looks){for(const id of ['shelf','window']){if(act('c7-look-'+id,{at:HS[id],r:1.1,max:6})){settle(12);U(()=>!A7.C.view,10);}}}
  // the gum: Jamie finds it
  U(()=>A7.C.inv.gum==='jamie',90);settle(12);
  check(`${label}: Jamie takes the gum ("I'm gonna give it back to him.")`,()=>{assert.equal(C7().inv.gum,'jamie');assert.ok(said('give it back to him'));});
  // (the expanded morning) the tube on top of his shelf: down, unrolled, turned over
  U(()=>!!A7.C.mem,40);settle(12);note('the tube');
  act('c7-tube',{at:HS.tube,r:1.0,max:12});U(()=>A7.C.view==='inspect'&&C7().lookKind==='tour',8);settle(45);
  for(let i=0;i<14&&!A7.C.mem?.back;i++){tap('KeyD');W(.12);}U(()=>A7.C.flags.memory,40);settle(20);if(A7.C.view)tap('KeyS');U(()=>!A7.C.view,3);
  check(`${label}: the Tour de Oak Hollow: Alex through the Hendersons' clothesline; on the back, the rules and four signatures`,()=>{assert.ok(A7.C.flags.memory);assert.ok(said('clothesline'));assert.ok(said('Four signatures'));});
  // his dad's list: the desk drawer (this year's school pictures), under the desk (the shoe box), the dresser (his watch)
  U(()=>A7.C.dl?.stage==='look',45);settle(5);note('his dad’s list');
  act('c7-drawer',{at:HS.drawer,r:1.0,max:10});U(()=>A7.C.view==='inspect',4);settle(20);tap('KeyS');U(()=>!A7.C.view,3);settle(14);
  act('c7-shoebox',{at:HS.shoebox,r:1.1,max:10});U(()=>!A7.C.view,25);settle(16);
  act('c7-watch',{at:HS.watch,r:1.0,max:10});U(()=>A7.C.view==='inspect',4);settle(14);tap('KeyS');U(()=>!A7.C.view,3);settle(18);
  check(`${label}: his dad's list: this year's school pictures, his shoes (Vans, six and a half), his watch left on the dresser`,()=>{assert.equal(A7.C.dl.found.size,3);assert.ok(said('Six and a half'));assert.ok(said('sleeps in it'));});
  // the machine in the kitchen: a message from Thursday at three in the morning; its cord; again
  U(()=>!!A7.C.mc,40);settle(14);note('the machine');
  act('c7-machine',{at:HS.machine,r:1.1,max:12});U(()=>A7.C.mc?.stage==='cord',70);settle(6);
  act('c7-cord',{at:HS.plug,r:1.0,max:10});U(()=>A7.C.mc?.stage==='again',30);settle(6);
  act('c7-machine',{at:HS.machine,r:1.1,max:10});U(()=>A7.C.flags.machineDone,12);settle(8);
  check(`${label}: the answering machine plays Sunday night's ride (Alex: "Did you guys hear that?" Sam: "Save me a spot tomorrow."); it isn't plugged in`,()=>{assert.ok(said('Did you guys hear that'));assert.ok(said('Save me a spot tomorrow'));assert.ok(said('not plugged in'));assert.ok(A7.C.flags.machineDone);});
  lap('house');}
 // ---- the garage ----
 if(seg('garage')){
  U(()=>ph()==='d7-garage',120);settle(10);
  check(`${label}: a noise in the garage`,()=>{assert.equal(ph(),'d7-garage');assert.ok(said('Is somebody in the garage'));});
  // out through the front door, round to the open garage
  approach(HS.front,.6);act('c7-out',{at:HS.door,max:8});U(()=>!A7.house.inHouse(me().x,me().z),6);W(1.8);
  const SH=h.world.homes.sam,gin=(()=>{const p=SH.toWorld(SH.gx,SH.gfront-2.6);return {x:p.x,z:p.z,y:p.ground};})(),gout=(()=>{const p=SH.toWorld(SH.gx,SH.gfront+3.5);return {x:p.x,z:p.z,y:p.ground};})();
  approach(gout,1.2);approach(gin,1.0);
  // look at what is by the side door
  U(()=>{const hd=A7.HM.visible?A7.HM.sockets.head.getWorldPosition(new (h.camera.position.constructor)()):null;if(hd)faceV(hd);return A7.C.gr?.go;},14);
  const seenIt=A7.C.gr?.seen||0;U(()=>A7.C.gr?.dad,12);settle(30);
  check(`${label}: something low by the side door, a long hand on the floor, gone out the side door (seen ${seenIt.toFixed(2)} s)`,()=>{assert.ok(A7.C.gr.go);assert.ok(said('its ARMS'));assert.ok(said('wasn’t a raccoon'));});
  M7.garageSeen=+seenIt.toFixed(2);lap('garage');}
 // ---- II. Reyes, the maps ----
 if(seg('reyes')){
  U(()=>ph()==='d7-reyes',30);settle(40);
  check(`${label}: Reyes at the kitchen table (nothing found; the grille open)`,()=>{assert.ok(said('I don’t have any news'));assert.ok(said('The grille was open'));});
  act('c7-give',{at:{x:h.chapter.officer2.x,y:h.chapter.officer2.pos.y+1.2,z:h.chapter.officer2.z},r:1.6,max:10});U(()=>ph()==='d7-map',30);settle(12);
  // the maps: the old plan over the new; find what is on both; mark it
  tap('KeyD');tap('KeyD');W(5);settle(12);
  const M=A7.MAPV,tgt={x:.575,y:.27};let guard=0;while((Math.abs(M.cursor.x-tgt.x)>.012||Math.abs(M.cursor.y-tgt.y)>.012)&&guard++<200){h.chapter4.pan((tgt.x-M.cursor.x)/.0011*.5,(tgt.y-M.cursor.y)/.0011*.5);W(.05);}
  tap('KeyF');U(()=>A7.C.mp?.stage==='solved',4);
  check(`${label}: you mark where Old Mill Court began (past the oak)`,()=>{assert.ok(A7.C.flags.marked);assert.equal(A7.C.flags.markedBy,'you');});
  // (the second look) Reyes's photograph of the plate in the junction chamber: find MH-12 on the old plan
  const moveTo=tg=>{let gd=0;while((Math.abs(M.cursor.x-tg.x)>.01||Math.abs(M.cursor.y-tg.y)>.01)&&gd++<200){h.chapter4.pan((tg.x-M.cursor.x)/.0011*.5,(tg.y-M.cursor.y)/.0011*.5);W(.05);}};
  U(()=>A7.C.mp?.stage==='mh',90);settle(20);note('MH-12');moveTo({x:.6,y:.24});tap('KeyF');U(()=>A7.C.mp?.stage!=='mh',4);
  check(`${label}: from Reyes's photograph of the plate (MH-12, O.M.C. 1959) you find MH-12 on the old plan: under the grass at the end of your street`,()=>{assert.equal(A7.C.flags.mh12,'you');assert.ok(said('Where’s twelve'));});
  // the streetlight schedule: the line that is wrong
  U(()=>A7.C.mp?.stage==='sched',40);settle(6);note('the schedule');moveTo({x:.82,y:.86});tap('KeyF');U(()=>A7.C.mp?.stage!=='sched',4);U(()=>['lift','crayon','after','done'].includes(A7.C.mp?.stage),40);
  check(`${label}: the streetlight schedule: four lamps on Old Mill Court, active, billed last month; the meter in the chamber was turning`,()=>{assert.equal(A7.C.flags.lamps,'you');assert.ok(said('meter on it turn'));});
  // Reyes lifts the tracing paper: on this morning's map, a circle in red crayon and a date
  U(()=>A7.C.flags.crayon,40);U(()=>['after','done'].includes(A7.C.mp?.stage),60);
  check(`${label}: under the tracing paper, on this morning's print of the map: a circle in red crayon round the spot, and 8/21/91`,()=>{assert.ok(A7.C.flags.crayon);assert.ok(A7.MAPV.crayon>.9);assert.ok(said('printer at nine'));assert.ok(said('Whitcomb'));});
  U(()=>ph()==='d7-curb',140);
  check(`${label}: "Four-thirty. You stay where I can see you."`,()=>{assert.ok(said('You stay where I can see you'));assert.ok(said('Sam drew that'));});
  lap('reyes');}
 // ---- that afternoon: the curb; down the street; the lookout; the lane ----
 if(seg('afternoon')){
  U(()=>ph()==='d7-curb',10);U(()=>!!A7.C.choice,40);
  check(`${label}: Jamie on the curb ("I keep thinking I'm gonna tell him about this."), and three things to say`,()=>{assert.ok(said('tell him about this'));assert.equal(A7.C.choice.options.length,3);});
  W(1.2);tap('Digit1');settle(20);U(()=>ph()==='e7-ride',60);
  check(`${label}: you answer him; Reyes: ride down, he follows; the radio to Jamie`,()=>{assert.equal(A7.C.flags.jamieTalk,'reassure');assert.equal(C7().inv.radio,true);});
  onBike();const M1=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];};const sh=h.world.homes.sam.drivD;
  ride([M1(sh+12,-2.4),M1(sh+50,-2.2),M1(1100,-2.0),M1(1128,-1.8)],{max:90});U(()=>ph()==='e7-lookout',20);
  release('KeyW');press('KeyS');U(()=>h.night.speed<.1,6);release('KeyS');
  check(`${label}: the end of the street (Reyes behind you in the car)`,()=>{assert.equal(ph(),'e7-lookout');});
  U(()=>A7.C.lk?.stage==='lane',90);settle(10);
  check(`${label}: Reyes: "the court started about… there"; the lane behind the oak`,()=>{assert.ok(said('the court started about'));assert.ok(court.ST.portalA);});
  if(looks&&A7.C.lk){act('c7-curbstones',{at:SP.curb,r:2.4,max:6});settle(10);U(()=>!A7.C.view,8);}
  lap('afternoon');}
 // ---- III. the lane, the court ----
 if(seg('court')){
  if(from==='court'&&!cont){/* (jumped to c7-lane: on the bike at the cul-de-sac) */}
  // on the bike, slow, round both bends
  if(h.night.state!=='c1-ride')onBike();
  const RL=(x,z)=>{const w=court.realW(x,z);return [w.x,w.z];};
  ride([RL(9,-11.6),RL(2.2,-4.6),RL(0,-2.2),RL(0,2),RL(0,10.2),RL(-2,12),RL(-6,12),RL(-8,14),RL(-8,20),RL(-8,24)],{max:80,r:1.1,stop:()=>ph()==='e7-court'});
  const crossedAt=A7.C.lastCross;
  check(`${label}: round the two bends, and out onto a street (the crossing: ${crossedAt?.to})`,()=>{assert.equal(crossedAt?.to,'A');assert.equal(ph(),'e7-court');});
  ride([[court.regW(-8,27).x,court.regW(-8,27).z],[court.regW(-7,30).x,court.regW(-7,30).z]],{max:20,r:1.4});release('KeyW');press('KeyS');U(()=>h.night.speed<.1,6);release('KeyS');
  U(()=>A7.C.ct?.stage==='back',50);
  check(`${label}: "There's nothing back here. There's a field." Reyes, on the radio: the field, nobody`,()=>{assert.ok(said('There’s a field'));assert.ok(said('It’s the field. There’s nobody here'));});
  // back up the lane on foot: the fence
  offBike();const F=SP.fenceA;approach({x:court.regW(-8,22).x,z:court.regW(-8,22).z},1.0,{pad:8});approach(court.L3(-5,12,'A'),.8);approach(court.L3(0,6,'A'),.9);U(()=>A7.C.ct?.stage==='lost',30);settle(30);
  check(`${label}: a board fence across the lane they came through ("This was OPEN.")`,()=>{assert.ok(A7.C.ct.fence);assert.ok(said('This was OPEN')||said('There’s a FENCE'));});
  // back out to the street, toward the lit window
  note('back out',approach(court.L3(-8,22,'A'),1.0));note('the street',approach(court.W3(-6,40),1.4,{pad:10}));
  // somebody must have a phone: knock (twice: the first door, nobody; then footsteps come to it and stop, and nobody opens it)
  U(()=>A7.C.ct?.knockAsk,20);settle(10);const D1=SP.doors.a1;
  for(let k=0;k<2;k++){note('knock',approach(D1.stand,.6,{pad:10}),act('c7-door-a1',{at:D1,r:1.6,max:10}));U(()=>!A7.C.ct.knocking,30);settle(10);}
  check(`${label}: you knock: nobody; you knock again: footsteps come to the door and stop, and nobody opens it`,()=>{assert.equal(A7.C.ct.knocks,2);assert.ok(said('Nobody’s coming'));assert.ok(said('Right behind it'));});
  note('up it',approach(court.W3(-1,58),1.4,{pad:10}));
  // (the expanded court) the Langes', No. 5: a door up the street that was shut comes open on its own; a TV on inside
  U(()=>A7.C.lg&&A7.C.lg.stage!=='open',90);settle(12);note('the Langes’ door');lap('court');
  check(`${label}: after Reyes sees you "by a fence", a door up the street that was shut comes open on its own (the Langes', No. 5)`,()=>{assert.ok(said('By the fence'));assert.ok(A7.court.lange.doors.front.open>.9);assert.ok(said('That one. The blue one'));});
  const LW=(x,z)=>court.LW3(x,z),LG=court.lange,LSP=LG.spots,lgP=A7.lgP;
  note('to the door',approach(SP.langeDoor,.7,{pad:10}));U(()=>A7.C.lg?.atDoor,10);settle(20);
  note('in',approach(LW(LG.doorX,-LG.hd+1.3),.5,{pad:6}));U(()=>A7.C.lg?.stage==='in',10);settle(8);
  check(`${label}: inside the Langes' (a checkpoint): "It smells like dinner."`,()=>{assert.equal(A7.C.lg.stage,'in');assert.equal(A7.C.lastCheckpoint,'c7-lange');});
  if(looks){note('the television',act('c7-lg-tv',{at:lgP(LSP.tv),r:1.7,max:12}));settle(12);U(()=>!A7.C.view,10);
   note('the Courier',act('c7-lg-courier',{at:lgP(LSP.courier),r:1.0,max:12}));U(()=>A7.C.view==='inspect',4);settle(18);tap('KeyS');U(()=>!A7.C.view,3);
   note('dinner',act('c7-lg-dinner',{at:lgP(LSP.dinner),r:1.3,max:14}));settle(12);U(()=>!A7.C.view,10);
   note('the cap',act('c7-lg-cap',{at:lgP(LSP.cap),r:1.0,max:12}));U(()=>A7.C.view==='inspect',4);settle(12);tap('KeyS');U(()=>!A7.C.view,3);
   note('the calendar',act('c7-lg-calendar',{at:lgP(LSP.calendar),r:1.0,max:12}));settle(10);U(()=>!A7.C.view,10);
   check(`${label}: an evening a minute old, from the wrong years: a 1959 set on a test card, the Courier of April 1974, dinner still warm, a damp cap, October 1983`,()=>{for(const k of ['lg-tv','lg-courier','lg-dinner','lg-cap','lg-calendar'])assert.ok(A7.C.looked.has(k),k);assert.ok(said('APRIL 11, 1974')||said('April 11, 1974'));assert.ok(said('still damp'));});}
  note('the phone',act('c7-lg-phone',{at:lgP(LSP.phone),r:.9,max:14}));U(()=>A7.C.lg?.stage==='presence',60);settle(14);
  check(`${label}: the phone: no dial tone; far off, a television; close, somebody breathing. Beside it, Ruth Ann Carver (1966) and Danny Whitcomb (1991) on one board, and an empty pin`,()=>{assert.ok(said('somebody breathing'));assert.ok(said('Ruth Ann Carver. August 1966'));assert.ok(said('Danny Whitcomb. August 1991'));assert.ok(said('third pin'));});
  // the hall: the light under the bathroom door, a shadow across it; listen at it
  note('the hall',approach(LW(1.9,-.6),.5,{pad:6}),approach(LW(1.9,.95),.45,{pad:6}),approach(LW(-.25,.95),.4,{pad:6}));U(()=>A7.C.lg?.hallAt!=null,6);settle(6);
  note('listen',act('c7-lg-listen',{at:lgP(LSP.bathDoor),r:.9,max:12}));U(()=>A7.C.lg?.shoved,25);U(()=>!!A7.C.choice,12);
  check(`${label}: something in the bathroom: the door strains on its latch, a shadow under it, breathing at the height of your face; the door is shoved from inside, a picture comes off the wall`,()=>{assert.ok(A7.C.lg.shoved);assert.ok(said('breathing. Slow'));assert.ok(A7.court.lange.ST.picT>0);assert.ok(A7.C.sounds.doorSlam>0);});
  // the choice (leave, or look): look
  tap('Digit2');U(()=>A7.C.lg?.stage==='look',4);settle(6);
  note('his room',approach(LW(-2.75,1.0),.45,{pad:6}),approach(LW(-3.2,2.5),.45,{pad:6}),approach(LW(-4.45,3.0),.4,{pad:6}));
  note('the drawings',act('c7-lg-drawings',{at:lgP(LSP.drawings),r:1.5,max:12}));U(()=>A7.C.lg?.drew,4);
  U(()=>!!A7.C.lg?.burst,40);note('it comes out');
  check(`${label}: you chose to look: three drawings over the bed, the same picture (a streetlight, four bikes): R.A.C. 1966, D.W. 1991, and a faint one, no name yet, 2011`,()=>{assert.equal(A7.C.lg.choice,'look');assert.ok(said('R.A.C., 1966'));assert.ok(said('No name on it. 2011'));});
  U(()=>{const F=A7.LF.F;faceV({x:F.x,y:F.y+1.45,z:F.z});return A7.C.lg?.stage==='flee';},16);
  check(`${label}: it comes out of the bathroom, fast, along the hall (the table goes), through the chair, and stops too close; Jamie gets in front of you; it goes back the way it came`,()=>{const P=A7.court.lange.props,why=()=>'route '+JSON.stringify((A7.C.lg.route||[]).map(q=>{const l=court.langeLocal(q[0],q[1]);return [+l.x.toFixed(2),+l.z.toFixed(2)];}));assert.ok(P.hall.hit,why());assert.ok(P.chair.hit,why());assert.ok(said('GET BACK'));assert.ok(A7.C.flags.langeScare);assert.equal(A7.LF.person.group.visible,false);});
  // out of the house; the door shuts behind you; the argument on the lawn
  note('out',approach(LW(-2.7,1.0),.45,{pad:6}),approach(LW(-2.6,-.3),.45,{pad:6}),approach(LW(-1.45,-2.9),.45,{pad:6}),approach(SP.langeDoor,.8,{pad:8}),approach(SP.langeWalk,1.0,{pad:8}));
  U(()=>A7.C.lg?.stage==='recover',15);U(()=>!!A7.C.choice,40);
  check(`${label}: outside, Jamie: "Was that a PERSON?"; the drawings were Ruth Ann Carver's and Danny Whitcomb's; "I'm going back to the fence"`,()=>{assert.ok(said('was that a PERSON'));assert.ok(said('That’s Ruth Ann Carver'));assert.ok(said('going back to the fence'));});
  tap('Digit3');U(()=>A7.C.lg?.stage==='done',20);
  U(()=>A7.C.ct?.lights,30);note('lights');lap('lange');
  check(`${label}: the clock runs fast here (it is getting dark), Reyes says he sees you by a fence`,()=>{assert.ok(A7.C.h>18.5,'h='+A7.C.h);assert.ok(said('By the fence'));});
  // the dining room
  U(()=>ph()==='e7-dining',30);note('to the window',approach(SP.diningLook,1.2,{pad:10}));faceV(SP.diningWindow);
  U(()=>{faceV(SP.diningWindow);return A7.C.dn?.stage==='after';},60);W(3.5);
  check(`${label}: the family at the table; heads turn one by one; the father comes at the glass and hits it (it cracks)`,()=>{assert.ok(A7.C.flags.windowHit);assert.equal(A7.court.dining.crack.material.opacity,1);assert.ok(said('They’re not moving'));});
  check(`${label}: after the hit he is still there, at the glass, then goes back to his chair`,()=>{const f=A7.cast.fam.father;assert.ok(f.person.group.visible);});
  if(looks){act('c7-crack',{at:SP.diningWindow,r:3,max:6});settle(10);U(()=>!A7.C.view,10);}
  U(()=>ph()==='e7-house',60);settle(30);lap('dining');}
 // ---- IV. the green door ----
 if(seg('green')){
  check(`${label}: Sam's voice on the radio ("The one with the green door. Upstairs.")`,()=>assert.ok(said('green door')||from==='green'));
  approach(SP.greenDoor,1.0,{pad:10});U(()=>A7.C.gh?.inside||(A7.C.gh?.opening>=1),12);W(.6);approach(court.H3(0,-2.6),.6,{pad:6});U(()=>A7.C.gh?.inside,8);settle(14);
  check(`${label}: inside; the footsteps upstairs stop`,()=>{assert.ok(A7.C.gh.inside);});
  // (expanded) before it comes down: the radio in the den, wet prints across the kitchen, a folded star on the stairs
  const GXW=q=>{const w=court.H3(q.x,q.z);return {x:w.x,y:court.G0+q.y,z:w.z};},GX=A7.court.HG.extra;
  if(looks){note('the den',approach(court.H3(-1.5,-2.6),.5,{pad:6}),approach(court.H3(-3.2,-1.4),.5,{pad:6}),approach(court.H3(-3.3,.6),.5,{pad:6}),approach(court.H3(-3.7,1.75),.45,{pad:6}));
   note('the radio',act('c7-radio',{at:GXW(GX.radioAt),r:1.1,max:10}));settle(16);U(()=>!A7.C.view,6);
   note('the kitchen',approach(court.H3(-1.7,3.7),.45,{pad:6}),approach(court.H3(.9,3.7),.45,{pad:6}),approach(court.H3(2.3,2.2),.45,{pad:6}));
   note('the prints',act('c7-prints',{at:{...court.H3(2.6,2.75),y:court.G0+court.HG.HH.F},r:1.4,max:10}));settle(14);U(()=>!A7.C.view,10);
   note('round to the front',approach(court.H3(3.3,-.4),.45,{pad:6}),approach(court.H3(2.0,-2.4),.45,{pad:6}),approach(court.H3(.4,-2.9),.45,{pad:6}));
   check(`${label}: before it comes down: the radio says Reyes's words back ("It's the field. There's nobody here."); wet prints, too long, out of the closet under the stairs`,()=>{assert.ok(said('Word for word'));assert.ok(said('toes spread out like fingers'));});}
  note('the star',approach(court.H3(0,-2.35),.4,{pad:6}),act('c7-star',{at:GXW(GX.starAt),r:1.3,max:10}));U(()=>A7.C.view==='inspect',4);settle(16);tap('KeyS');U(()=>!A7.C.view,3);
  check(`${label}: a star folded out of a spearmint wrapper on the stairs ("Sam makes these." "Anybody can fold a star, though.")`,()=>{assert.ok(A7.C.flags.star);assert.ok(said('Anybody can fold a star'));});
  // the foot of the stairs: look up
  approach(court.H3(0,-2.3),.4,{pad:6});const top=court.H3(0,2.9,null,'u');top.y+=1.4;U(()=>{faceV(top);return ph()==='e7-reveal';},50);
  // watch it at the top (the hand, the shoulder, the head), then run to the pantry before it is down
  const t1=A7.C.t;U(()=>{const hd=A7.HM.sockets.head.getWorldPosition(new (h.camera.position.constructor)());faceV(hd);return A7.C.t-t1>4.2;},6);
  check(`${label}: at the top of the stairs a hand round the corner, the head turns, it comes out`,()=>{assert.ok(A7.HM.visible);assert.equal(C7().hunter.mode,'script');});
  note('to the pantry',approach(court.H3(2.0,-2.6),.6,{pad:6}),approach(court.H3(3.4,-.3),.5,{pad:6}),approach(court.H3(4.1,2.7),.5,{pad:6}));note('hide',act('c7-hide-pantry',{max:16}));
  U(()=>ph()==='e7-stalk',20);note('stalk',A7.C.hiding);
  check(`${label}: it reaches the bottom and hunts (you are in the pantry)`,()=>{assert.equal(ph(),'e7-stalk');assert.ok(['patrol','search','pursue','script'].includes(C7().hunter.mode));});
  // (expanded) it comes to the pantry: its hand on the edge of the door, the door wider, its head in the gap: hold your breath
  const holdBreath=()=>{U(()=>['hand','open','head'].includes(A7.C.sk?.check?.phase)||A7.C.sk?.stage==='watch',30);if(A7.C.sk?.check){note('hold your breath');press('Space');U(()=>!A7.C.sk?.check,14);release('Space');}};
  holdBreath();U(()=>A7.C.sk?.stage==='watch'||A7.C.sk?.caught,12);
  check(`${label}: it comes to the pantry; its hand on the edge of the door; its head in the gap; you hold your breath and it does not find you; then it waits at the foot of the stairs`,()=>{assert.equal(A7.C.sk.stage,'watch');assert.ok(!A7.C.sk.caught);assert.ok(said('hold your breath'));assert.equal(A7.C.lastCheckpoint,'c7-stairs');});
  // the stealth: the timer on the counter, wound; out the back way (the back hall, the den) while it rings; it goes to it; round to the front, up
  const hloc=()=>{const q=court.regL(A7.HM.x,A7.HM.z);return court.cToH(q.x,q.z);};let tries=0;
  const goUp=()=>{U(()=>{const q=hloc();return Math.hypot(q.x-.45,q.z+2.75)<1.3||(A7.C.sk?.stage!=='watch'&&A7.C.sk?.stage!=='check');},25);W(1.5);settle(14);if(A7.C.hiding){tap('KeyF');W(.4);}
   if(!A7.C.sk.timer&&A7.court.HG.extra.timer.visible){note('the timer',approach(court.H3(2.55,3.3),.35,{pad:6}),act('c7-timer',{at:GXW(GX.timerAt),r:.9,max:8}));U(()=>!!A7.C.sk?.timer,2);}
   note('the back way',A7.C.sk?.timer?.t,approach(court.H3(1.6,3.7),.4,{pad:6}),approach(court.H3(-.3,3.75),.4,{pad:6}),approach(court.H3(-1.75,3.7),.4,{pad:6}));
   // (in the den doorway: wait for it to leave the stairs for what it heard)
   U(()=>{const q=hloc(),L=A7.C.sk?.lure;return (L&&C7().hunter.mode!=='patrol'&&q.x>1.4&&q.z>-3)||(A7.C.sk?.learned||0)>=1||A7.C.sk?.caught;},45);note('it went',JSON.stringify(hloc()),A7.C.sk?.lure?.id,C7().hunter.mode);
   approach(court.H3(-2.6,2.6),.45,{pad:6});approach(court.H3(-3.3,-.5),.4,{pad:6});approach(court.H3(-2.6,-2.3),.4,{pad:6});approach(court.H3(-.8,-2.6),.4,{pad:6});approach(court.H3(0,-1.9),.3,{pad:6});
   walkTo([[court.H3(0,-.5).x,court.H3(0,-.5).z],[court.H3(0,1.6).x,court.H3(0,1.6).z],[court.H3(0,2.9,null,'u').x,court.H3(0,2.9,null,'u').z]],{r:.15,max:20});};
  while(tries++<3&&ph()==='e7-stalk'){goUp();U(()=>ph()!=='e7-stalk'||A7.C.sk?.caught,3);if(A7.C.sk?.caught){note('caught; again');U(()=>ph()==='e7-stalk'&&!A7.C.sk?.caught,12);}}
  // (whether it has finished breaking the timer when you reach the top depends on how fast you were round: it has heard it and gone)
  M7.timerLearnedBeforeUp=(A7.C.sk.learned||0)>=1;
  check(`${label}: the egg timer, wound: it rings in the kitchen; it hears it (by its hearing range) and leaves the stairs for it; you go round the other way and up`,()=>{assert.ok(A7.C.sk.timer?.rang);assert.ok(A7.C.sk.lure?.heard);assert.equal(A7.C.sk.lure.id,'timer');});
  M7.stealthFails=C7().fails.stalk;
  check(`${label}: up the stairs without it catching you (failed ${C7().fails.stalk} time(s) first)`,()=>{assert.equal(ph(),'e7-door');assert.equal(C7().level,'u');});
  // the room at the top: shut the door; the dresser; it hammers; it goes
  approach(court.H3(-2.2,2.6,null,'u'),.5,{pad:6});act('c7-shut',{at:court.H3(-1.2,3.3,null,'u'),r:1.4,max:8});W(1);
  // (expanded) the dresser will not slide: it stands on the rug. Jamie lifts it; pull the rug out while it is up; then push
  approach(court.H3(-2.75,1.75,null,'u'),.45,{pad:6});act('c7-push',{max:6});U(()=>A7.C.dr?.rug?.stage==='lift',12);
  U(()=>A7.C.dr?.rug?.up,6);W(.25);act('c7-rug',{max:4});U(()=>A7.C.dr?.rug?.stage==='out',4);settle(4);act('c7-push',{max:6});
  check(`${label}: the dresser stands on a rug and will not slide; Jamie lifts it and you pull the rug out; then the dresser goes against the door`,()=>{assert.equal(A7.C.dr.rug.stage,'out');assert.ok(A7.C.dr.pushed);assert.ok(said('it’s on the RUG'));});
  U(()=>A7.C.dr?.hit===2,30);
  check(`${label}: the door shut, the dresser against it, and it hits the door twice`,()=>{assert.ok(A7.C.dr.shut);assert.ok(A7.C.dr.pushed);assert.equal(A7.C.dr.hit,2);});
  U(()=>ph()==='e7-upstairs',60);settle(14);
  check(`${label}: it goes; from the window, up the street; Jamie against the dresser with the star ("If it's his, he was in this house.")`,()=>{assert.ok(said('going up the street'));assert.ok(said('he was in this house'));});
  lap('green');}
 // ---- upstairs: what is here; the large thing; the lights; the porch roof ----
 if(seg('upstairs')){
  // (a thing upstairs, at its height over the upstairs floor: what you look at to be offered it)
  const U3=(x,z,dy)=>court.H3(x,z,court.G0+court.HG.HH.UP+dy,'u');
  U(()=>!A7.C.up||A7.C.up.unblock==null||A7.C.up.unblock>=1,6);// (Jamie drags the dresser back off the door first: until then there is no way into the room)
  note('the room',approach(court.H3(-3.6,1.9,null,'u'),.5,{pad:6}));note('the calendar',act('c7-calendar',{at:U3(-3.3,.085,1.5),r:1.8,max:8}));settle(14);tap('KeyS');U(()=>!A7.C.view,3);
  note('the desk',act('c7-trace',{at:U3(-4.55,.95,.8),r:1.6,max:8}));settle(24);tap('KeyS');U(()=>!A7.C.view,3);
  check(`${label}: the 1991 calendar; a page in Sam's writing, yellow, as if years old`,()=>{assert.ok(A7.C.flags.trace);assert.ok(said('That’s his WRITING'));assert.ok(said('could do his writing'));});
  // (out of the boy's room, down the hall past the stairwell, into the storeroom)
  note('to the storeroom',approach(court.H3(-2.2,3.3,null,'u'),.4,{pad:6}),approach(court.H3(-1.1,3.3,null,'u'),.4,{pad:6}),approach(court.H3(-1.1,-1.15,null,'u'),.3,{pad:6}),approach(court.H3(-2.4,-1.15,null,'u'),.4,{pad:6}));
  note('the old bike',act('c7-oldbike',{at:U3(-3.6,-2.5,.7),r:1.6,max:8}));settle(16);U(()=>!A7.C.view,12);note('the bell',act('c7-bell',{at:U3(-3.4,-2.1,1.0),r:1.6,max:8}));settle(10);
  check(`${label}: the old green bike, wet, 0417, AR; its bell rings, twice`,()=>{assert.ok(A7.C.flags.bell);assert.ok(said('It rings'));});
  note('to the hall window',approach(court.H3(-1.1,-1.15,null,'u'),.3,{pad:6}),approach(court.H3(0,-2.6,null,'u'),.4,{pad:6}));U(()=>A7.C.up?.down,60);
  note('the hall window',act('c7-hallwindow',{at:U3(0,-4.5,1.5),r:1.6,max:10}));U(()=>A7.C.gt?.lights,60);settle(30);
  check(`${label}: from the hall window something very large moves behind the roofs (the far roof gives); then the lights past a hedge`,()=>{assert.ok(['rise','done'].includes(court.GI.stage)||court.GI.t>0);assert.ok(said('What IS that'));assert.ok(said('come toward them'));});
  note('out',act('c7-climb',{at:U3(0,-4.6,1.2),r:1.0,max:8}));U(()=>ph()==='e7-out',4);W(1.6);tap('KeyF');U(()=>A7.C.flags.dropped,4);W(2.5);
  check(`${label}: out onto the porch roof, and drop`,()=>{assert.ok(A7.C.flags.dropped);assert.equal(C7().level,'g');});
  lap('upstairs');}
 // ---- V. the bikes, the chase ----
 if(seg('chase')){
  const b=h.night.roam;note('to the bikes',approach({x:b.x,z:b.z},3.4,{pad:12}));U(()=>ph()==='n7-bikes'||ph()==='n7-chase',20);onBike();
  U(()=>ph()==='n7-chase',20);
  check(`${label}: at the bikes it comes over the car at you; Jamie: "GO!"`,()=>{assert.equal(ph(),'n7-chase');assert.ok(said('GO GO GO'));});
  const R=court.routeWorld(),p=me();let i0=0,bd=1e9;R.forEach(([x,z],i)=>{const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;i0=i;}});
  const tc=A7.C.t;const minD={v:99};const each=()=>{const d=A7.H.chase?.dist;if(d!=null)minD.v=Math.min(minD.v,d);};const prevEach=X.T.each;X.T.each=()=>{prevEach();each();};
  // (on through the lane past its middle: the crossing is there; the ride stops the moment you are out at the oak)
  const last=R[R.length-1],prv=R[R.length-2],ux=last[0]-prv[0],uz=last[1]-prv[1],ul=Math.hypot(ux,uz)||1,past=[last[0]+ux/ul*4,last[1]+uz/ul*4];
  ride([...R.slice(i0+1),past],{max:150,r:2.2,hard:true,stop:()=>ph()==='n7-lookout'||ph()==='n7-grab'||A7.C.ch?.caught});X.T.each=prevEach;
  M7.chaseSeconds=+(A7.C.t-tc).toFixed(1);M7.chaseMinGap=+minD.v.toFixed(2);
  check(`${label}: down the court, round the bend, up the other side, into the other lane, and out at the oak (${M7.chaseSeconds} s; closest ${M7.chaseMinGap} m)`,()=>{assert.ok(['n7-lookout','n7-grab'].includes(ph()),ph());assert.equal(A7.C.lastCross?.to,'real');});
  // (through the middle of the lane and out of its mouth onto the grass by the oak: the way you came in this afternoon)
  if(ph()==='n7-lookout'){const RL=(x,z)=>{const w=court.realW(x,z);return [w.x,w.z];};note('out of the lane',ride([RL(-.5,11.6),RL(0,6.5),RL(0,1.5),RL(1.6,-3.5),RL(4.2,-8)],{max:25,r:1.3,hard:true,stop:()=>A7.C.lo?.stage!=='out'||ph()!=='n7-lookout'}));}
  check(`${label}: the chase took 45-110 s and it cut across (seen between the houses) and came at you from the side`,()=>{assert.ok(M7.chaseSeconds>=40&&M7.chaseSeconds<=115,M7.chaseSeconds);assert.ok(A7.C.ch.cut);});
  lap('chase');}
 // ---- the abduction ----
 if(seg('abduction')){
  U(()=>ph()==='n7-grab',12);
  check(`${label}: out of the lane it comes over you and takes Jamie off his bike; you are off yours`,()=>{assert.equal(ph(),'n7-grab');assert.ok(C7().jamie.down);});
  U(()=>!h.chapter.pose,3);U(()=>C7().jamie.held,6);
  // run to him; F: his hand; hold on; pull
  const hand=()=>{h.chapter.kit.jamie.person.group.updateMatrixWorld(true);return h.chapter.kit.jamie.person.parts.rhand.getWorldPosition(new (h.camera.position.constructor)());};
  note('to him',Math.hypot(me().x-hand().x,me().z-hand().z).toFixed(1));
  // (straight at him, running; held up by something on the way, a way round it, the way a player steers)
  {let last=me(),lastT=h.snapshot.clock;
   U(()=>{const q=hand();const d=Math.hypot(me().x-q.x,me().z-q.z);if(d>1.2){faceV(q);press('KeyW');if(d>3)press('ShiftLeft');else release('ShiftLeft');}else{release('KeyW');release('ShiftLeft');}
    const p=me();if(Math.hypot(p.x-last.x,p.z-last.z)>.05||d<=1.2){last=p;lastT=h.snapshot.clock;}
    else if(h.snapshot.clock-lastT>1){release('KeyW');release('ShiftLeft');note('held up on the way to him: a way round');approach(q,1.0,{sprint:true,max:2.5,stop:()=>spot()?.id==='c7-grab'});last=me();lastT=h.snapshot.clock;}
    return spot()?.id==='c7-grab';},20);}
  release('KeyW');release('ShiftLeft');tap('KeyF');
  U(()=>A7.C.gb?.stage==='struggle',3);
  check(`${label}: your hands on his wrist (the struggle)`,()=>{assert.equal(A7.C.gb.stage,'struggle');assert.ok(C7().jamie.grip);});
  // (and while you hold on, your view is there, behind his hands: never anywhere else)
  press('KeyF');press('KeyS');const ts=A7.C.t;let camFar=0;U(()=>{if(A7.C.gb?.stage==='struggle'&&A7.C.gb.st>.8){const q=hand(),c=h.camera.position;camFar=Math.max(camFar,Math.hypot(c.x-q.x,c.z-q.z));}return A7.C.gb?.stage==='lost';},20);release('KeyS');release('KeyF');M7.struggleSeconds=+(A7.C.t-ts).toFixed(1);M7.struggleView=+camFar.toFixed(2);
  check(`${label}: you hold on (${M7.struggleSeconds} s, the view within ${M7.struggleView} m of his hand); his hand goes out of yours; the gum falls`,()=>{assert.ok(M7.struggleSeconds>=5);assert.ok(camFar<2.5,'view '+camFar);assert.ok(A7.C.flags.gumDropped);});
  U(()=>A7.C.flags.jamieTaken,20);
  check(`${label}: it drags him into the lane, round the bend, and he is gone (never seen dead: gone)`,()=>{assert.ok(A7.C.flags.jamieTaken);assert.equal(C7().jamie.visible,false);});
  check(`${label}: while it held him his feet stayed in its hand (${watch.heldFrames} frames, ${watch.attachErr} off)`,()=>{assert.ok(watch.heldFrames>100);assert.equal(watch.attachErr,0);});
  // follow: the lane is only the lane; the gum; call his name; Reyes
  W(1.5);note('into the lane',approach(SP.mouth,1.0,{pad:8}),approach(SP.inLane,1.0),approach(SP.bend1,1.0),approach(court.R3(-6,12),.8));
  check(`${label}: in the lane, nothing (the lane comes out in the field)`,()=>{assert.equal(ph(),'n7-gone');assert.equal(C7().hunter.visible,false);});
  tap('KeyF');W(.5);
  // (back out of the lane the way you came, then across the grass to where it fell)
  const g=A7.C.gumAt;if(g){note('back out to the gum',approach(SP.bend1,1.0),approach(SP.inLane,1.0),approach(SP.mouth,1.0,{pad:8}),approach(g,.8,{pad:10}),act('c7-gum',{at:g,r:.9,max:8}));}U(()=>C7().inv.gum==='have',6);
  check(`${label}: the gum, picked up out of the grass`,()=>assert.equal(C7().inv.gum,'have'));
  U(()=>ph()==='n7-after',140);lap('abduction');}
 // ---- later: the lookout at night; Sam's room ----
 if(seg('after')){
  U(()=>ph()==='n7-after',10);
  // (expanded) show Reyes where: his bike, his cap, the marks in the grass, the gum; he photographs them and writes it down
  U(()=>A7.C.af?.go,60);settle(4);const AF=()=>A7.C.af,EV=()=>AF().E,gyy=(q,dy=0)=>({x:q.x,y:h.nav.groundY(q.x,q.z)+dy,z:q.z});
  for(const [k,dy,r] of [['bike',.4,1.6],['cap',.05,1.2],['marks',0,1.5]])for(let tryN=0;tryN<3&&!AF().shown?.[k];tryN++){note('show '+k,tryN,approach(gyy(EV()[k]),.5,{pad:8}),act('c7-ev-'+k,{at:gyy(EV()[k],dy),r,max:10}),JSON.stringify({sp:spot()?.id,view:A7.C.view,choice:!!A7.C.choice,walking:me().walking,busyR:AF().busyR}));U(()=>!AF().busyR,30);settle(8);}
  if(C7().inv.gum==='have'){note('show gum',act('c7-ev-gum',{max:10}));U(()=>!AF().busyR,30);}
  const putDown=()=>{for(let i=0;i<4&&A7.C.view;i++){settle(40);tap('KeyS');U(()=>!A7.C.view,2);}};
  U(()=>A7.C.view==='inspect'&&C7().lookKind==='reyes-page',40);putDown();
  check(`${label}: Reyes, shown his bike, his cap, the drag marks and the gum, photographs each and writes it down: "2ND JUV. MISSING. JAMIE, 12."`,()=>{assert.ok(AF().photos>=3,'photos '+AF().photos);assert.ok(said('2ND JUV. MISSING. JAMIE'));});
  // his mother: two questions; then her phone (the pool: nobody on the towel)
  U(()=>!!A7.C.choice,30);tap('Digit1');U(()=>!!A7.C.choice,20);tap('Digit2');U(()=>A7.C.view==='inspect'&&C7().lookKind==='mom-phone',20);putDown();
  check(`${label}: Jamie's mom asks what he was wearing and what he said; on her phone, the pool: nobody on the towel, a damp shape where somebody sat`,()=>{assert.ok(said('What was he wearing'));assert.ok(said('nobody on the towel'));});
  // the forgetting: one juvenile, the cap nobody's, Sam's name; then his page, an hour later: turn it to the light
  U(()=>A7.C.view==='inspect'&&C7().lookKind==='reyes-page-now',120);settle(10);for(let i=0;i<3&&!C7().flags.indentSeen;i++){tap('KeyD');W(.5);}U(()=>C7().flags.indentSeen,6);putDown();
  U(()=>A7.C.af?.stage==='done',40);
  check(`${label}: Jamie's mom ("You were WITH him."); the dispatcher says one juvenile; the cap in her hands is nobody's; her pictures have no Jamie in them; Reyes has to read Sam's name off his notebook`,()=>{assert.ok(said('You were WITH him'));assert.ok(said('one juvenile missing. One'));assert.ok(said('I don’t know whose this is'));assert.ok(said('nobody in this one'));assert.ok(said('His name is Sam'));});
  check(`${label}: his page, an hour later: no name in the ink, no SECOND; turned to the light, JAMIE pressed into the paper (you keep it)`,()=>{assert.ok(C7().flags.indentSeen);assert.ok(C7().flags.reyesPage);assert.ok(said('Pressed into the paper'));});
  U(()=>ph()==='n7-sams',20);lap('after');}
 if(seg('night')){
  U(()=>ph()==='n7-sams',10);settle(30);approach(HS.samIn,.6);U(()=>A7.C.sn?.inRoom,6);
  act('c7-fan',{at:HS.fan,r:1.0,max:8});U(()=>A7.C.flags.forgetFan,30);settle(12);
  check(`${label}: the fan: his dad turns it back on and does not know why (this morning he knew)`,()=>{assert.ok(said('I don’t know why'));assert.ok(said('He can’t sleep without that')||(from&&from!=='house'));});
  act('c7-photo',{at:HS.photo,r:.9,max:10});U(()=>A7.C.view==='inspect',4);W(3);
  check(`${label}: the same photograph: only you, at the oak, with your bike`,()=>{assert.equal(C7().photo,'one');assert.ok(A7.C.flags.altered);});
  settle(10);tap('KeyS');U(()=>!A7.C.view,3);U(()=>A7.C.flags.forgetPhoto,10);settle(8);
  check(`${label}: "That's a nice one of you."`,()=>assert.ok(said('nice one of you')));
  act('c7-write',{at:HS.notebook,r:1.0,max:8});U(()=>ph()==='n7-names',4);press('KeyF');U(()=>A7.C.flags.names,12);release('KeyF');
  check(`${label}: you write their names (ALEX, JAMIE, SAM), and they are kept for Chapter Eight`,()=>{assert.equal(A7.C.wr.text,'ALEX\nJAMIE\nSAM');const s=JSON.parse(globalThis.localStorage.getItem('lastlight.chapter7'));assert.deepEqual(s.names,['ALEX','JAMIE','SAM']);});
  U(()=>A7.C.flags.lookOutside,12);note('his window',act('c7-window',{at:HS.window,r:1.2,max:8}),A7.C.flags.lookOutside,!!h.chapter.pose);
  U(()=>h.snapshot.state==='ended',40);
  check(`${label}: four bikes under the streetlight; yours; the end card (LAST LIGHT · Chapter Seven · The Street That Wasn't There), no Chapter Eight`,()=>{
   assert.equal(h.snapshot.state,'ended');assert.match(element('ending').querySelector?.('h2')?.innerHTML||'Chapter Seven',/Chapter Seven/);assert.equal(element('next-chapter').hidden,true);assert.ok(said('Yours'));});
  lap('night');}
 M7.minutes={...watch.minutes};M7.total=+Object.values(watch.minutes).reduce((a,b)=>a+b,0).toFixed(2);M7.phases=watch.phases.length;M7.bad=watch.bad;M7.jumps=watch.jumps;M7.gapMax={...watch.gapMax};M7.samSeen=watch.samSeen;M7.jamieVisibleAfter=watch.jamieVisibleAfter;
 check(`${label}: nothing non-finite; Sam never seen; Jamie never seen after he is taken`,()=>{assert.equal(watch.bad,0);assert.equal(watch.samSeen,0);assert.equal(watch.jamieVisibleAfter,0);});
 return {watch,lines:()=>watch.lines};
}

// ---- targeted checks (each from its own jump) -----------------------------------------------------------------------------------
// (the DEV scenes the expansion added: Sam's house, Reyes's second look, the Langes')
export const EXPANSION_SCENES=['c7-memory','c7-search','c7-machine','c7-records','c7-lange','c7-lange-in','c7-lange-scare','c7-green-star','c7-stairs','c7-rug','c7-evidence','c7-mom','c7-record'];
export async function runChapterSevenChecks(T){const {h,check,element,metrics}=T,X=chapterSevenTools(T),{A7,C7,ph,until,wait,me,faceTo,walkTo,approach,act,settle,faceV,spot}=X,tap=X.tap||T.tap,press=X.press||T.press,release=X.release||T.release;
 const said7=w=>(A7.C.marks||[]).some(m=>m[1]===w);
 const court=A7.court,SP=court.SPOT,M7=metrics['chapter7']||(metrics['chapter7']={});
 // every DEV scene starts where it says and nothing throws
 check(`chapter 7: every DEV Chapter Seven scene starts (${DEV_SCENES[7].length} scenes: the 40 of the first draft and the expansion's)`,()=>{const sc=DEV_SCENES[7];assert.ok(sc.length>=40+EXPANSION_SCENES.length);for(const id of EXPANSION_SCENES)assert.ok(sc.some(s=>s.id===id),'DEV scene '+id);
  // (the expansion's scenes: you start on your feet somewhere you can stand, never inside a wall or a piece of furniture; or hidden, or holding something)
  for(const id of EXPANSION_SCENES){h.jump(id);T.advance(.6);const p=me();assert.ok(A7.C.hiding||A7.C.view||h.nav.walkable(p.x,p.z,{r:.22}),'DEV scene '+id+' starts where you can stand');}for(const s of sc){if(s.chapter!=null)continue;h.jump(s.jump);T.advance(.6);assert.match(ph(),/^(c7|d7|e7|n7)-/,s.id);}});
 // the creature is not the drain creature: a different model, a different id
 check('chapter 7: the hunter is its own thing (chapter7_hunter, not the drain creature)',()=>{assert.equal(A7.HM.id,'chapter7_hunter');assert.notEqual(A7.HM.root,h.chapter3.creature?.group);assert.equal(A7.HM.source,'stand-in');});
 // capture and retry in the stealth encounter
 {h.jump('c7-stalk');T.advance(.5);const hm=A7.HM;// out of the pantry (the checkpoint starts you hidden there), into the kitchen, and stand there in the open
  if(A7.C.hiding)act('c7-unhide',{max:3});approach(court.H3(2.4,2.2),.5,{pad:6});// (it comes looking; then it goes to wait at the foot of the stairs: walk out to where it can see you)
  let caught=false;until(()=>{faceTo(hm.x,hm.z);caught=!!A7.C.sk?.caught;return caught||A7.C.sk?.stage==='watch';},40);if(!caught){approach(court.H3(3.3,-.4),.5,{pad:6});approach(court.H3(2.0,-2.2),.5,{pad:6});until(()=>{faceTo(hm.x,hm.z);caught=!!A7.C.sk?.caught;return caught;},40);}
  until(()=>ph()==='e7-stalk'&&!A7.C.sk?.caught,10);
  check('chapter 7: walking into it in the stealth: it catches you, and you are back at the stealth checkpoint (not the chapter start)',()=>{assert.ok(caught);assert.equal(ph(),'e7-stalk');assert.equal(C7().fails.stalk,1);});}
 // it cannot see you in a closet (unless it watched you go in)
 {h.jump('c7-stalk');T.advance(.3);if(!A7.C.hiding)act('c7-hide-pantry',{max:4});let held=0;for(let i=0;i<250;i++){const ph2=A7.C.sk?.check?.phase,hold=['hand','open','head'].includes(ph2);if(hold&&!held){press('Space');held=1;}else if(!hold&&held){release('Space');held=0;}T.advance(.1);}if(held)release('Space');
  check('chapter 7: hidden in the pantry for 25 s, holding your breath while it looks in: not caught (and it goes to wait at the stairs)',()=>{assert.equal(A7.C.hiding,'pantry');assert.ok(!A7.C.sk.caught);assert.equal(A7.C.sk.stage,'watch');});}
 // (expanded) the pantry: not holding your breath while its head is in the gap: it hears you; back at the stealth checkpoint
 {h.jump('c7-stalk');T.advance(.3);let caught=false;until(()=>{caught=!!A7.C.sk?.caught;return caught;},20);const heard=said7('it hears you breathe'),fails=C7().fails.stalk;until(()=>ph()==='e7-stalk'&&!A7.C.sk?.caught,10);
  check('chapter 7: breathing while its head is in the pantry door: it hears you, and you are back in the pantry at the stealth checkpoint',()=>{assert.ok(caught);assert.ok(heard);assert.equal(ph(),'e7-stalk');assert.equal(C7().fails.stalk,fails);assert.equal(A7.C.hiding,'pantry');});}
 // (expanded) once it has waited at the stairs, a capture brings you back there, not to the pantry check again
 {h.jump('c7-stairs');T.advance(.5);if(A7.C.hiding)act('c7-unhide',{max:3});approach(court.H3(2.0,-2.2),.5,{pad:6});let caught=false;until(()=>{faceTo(A7.HM.x,A7.HM.z);caught=!!A7.C.sk?.caught;return caught;},40);until(()=>ph()==='e7-stalk'&&!A7.C.sk?.caught,10);
  check('chapter 7: seen from the stairs it waits at: caught, and back at the checkpoint by the stairs (it is still waiting there)',()=>{assert.ok(caught);assert.equal(A7.C.lastCheckpoint,'c7-stairs');assert.equal(A7.C.sk.stage,'watch');});}
 // (expanded) the timer is heard by its hearing (range), not by fiat; a sound out of range is not
 {h.jump('c7-stairs');T.advance(4);A7.act('c7-timer');T.advance(8.5);const L=A7.C.sk?.lure;const far=A7.H.hear({x:A7.HM.x+40,z:A7.HM.z},2.2,{id:'too far'});
  check('chapter 7: the egg timer rings; it hears it from the stairs (in range) and goes to it; a sound 40 m off is not heard',()=>{assert.ok(L&&L.heard,'heard');assert.ok(['search','script','patrol'].includes(C7().hunter.mode));assert.equal(far,false);});}
 // (expanded) the Langes': Continue comes back to the open door; the scare's figure is gone after it
 {h.jump('c7-lange-in');T.advance(.3);const saved=h.chapter.saved?.();check('chapter 7: inside the Langes\' the checkpoint is the Langes\' (Continue: the open door)',()=>{assert.equal(saved?.section,'c7-lange');});}
 // (expanded) the Langes', the other choice: leave. It comes into the front room after you (the couch goes); Jamie between; out
 {h.jump('c7-lange-in');T.advance(.5);const LG=court.lange,LSP=LG.spots;approach(court.LW3(.4,-1.9),.4,{pad:6});approach(court.LW3(.75,-3.3),.35,{pad:6});act('c7-lg-phone',{at:A7.lgP(LSP.phone),r:.9,max:12});until(()=>A7.C.lg?.stage==='presence',60);settle(10);
  until(()=>!!A7.C.choice,60);tap('Digit1');until(()=>A7.C.lg?.stage==='leave',4);approach(court.LW3(-.9,-1.9),.45,{pad:6});approach(court.LW3(-1.5,-3.0),.45,{pad:6});
  until(()=>{const F=A7.LF.F;faceV({x:F.x,y:F.y+1.4,z:F.z});return A7.C.lg?.stage==='flee';},16);const couch=!!LG.props.couch.hit;
  approach(court.SPOT.langeDoor,.8,{pad:8});approach(court.SPOT.langeWalk,1.0,{pad:8});until(()=>!!A7.C.choice,40);tap('Digit1');until(()=>A7.C.lg?.stage==='done',20);
  check('chapter 7: the Langes\', choosing to leave: it comes into the front room after you through the couch, Jamie between; out, the argument, then on',()=>{assert.equal(A7.C.lg.choice,'leave');assert.equal(A7.C.lg.burst,'front');assert.ok(couch);assert.equal(A7.C.lg.stage,'done');assert.equal(A7.C.lg.answer,'sam');});}
 // (expanded) Reyes's page: kept, in what you carry
 {h.jump('c7-record');until(()=>A7.C.view==='inspect',30);for(let i=0;i<3&&!C7().flags.indentSeen;i++){tap('KeyD');T.advance(.5);}until(()=>C7().flags.indentSeen,4);
  for(let i=0;i<4&&A7.C.view;i++){settle(30);tap('KeyS');until(()=>!A7.C.view,2);}
  check('chapter 7: Reyes\'s page, turned to the light (JAMIE pressed into it), goes into what you carry',()=>{assert.ok(C7().flags.indentSeen);assert.ok(A7.inv.items?A7.C.flags.reyesPage:A7.C.flags.reyesPage);});}
 // sight through walls: it does not know where you are through a wall
 {h.jump('c7-stalk');T.advance(.3);const H=A7.H,hT=court.H3(-3.0,1.8),pT=court.H3(3.0,1.8);// den and kitchen: the core between
  const e=new (h.camera.position.constructor)(hT.x,hT.y+2,hT.z);check('chapter 7: no line of sight through the stair core (den to kitchen)',()=>{assert.equal(court.HG.sight(-3,2.6,1.8,3,2.0,1.8),false);});}
 // the chase can be failed: stop and it catches you; back to the bikes
 {h.jump('c7-chase');T.advance(.4);let caught=false;until(()=>{caught=!!A7.C.ch?.caught;return caught;},20);until(()=>ph()==='n7-bikes'||ph()==='n7-chase',10);
  check('chapter 7: stop riding in the chase and it catches you; you start again at the bikes',()=>{assert.ok(caught);assert.equal(C7().fails.chase,1);});}
 // the photograph: two authored states, the same object, reliable on jumps
 check('chapter 7: the photograph is the four of you before the abduction and only you after it, on every jump',()=>{for(const [s,want] of [['c7-bedroom','four'],['c7-reyes','four'],['c7-stalk','four'],['c7-after','four'],['c7-sams','one'],['c7-photo','one'],['chapter7-end','one']]){h.jump(s);T.advance(.2);assert.equal(C7().photo,want,s);}});
 // the gum: in Jamie's pocket from his room to the grass, then yours
 check('chapter 7: the gum (nightstand → Jamie → the grass → you)',()=>{for(const [s,want] of [['c7-bedroom','nightstand'],['c7-garage','jamie'],['c7-chase','jamie'],['c7-gum-pickup','grass'],['c7-after','have'],['c7-record','have'],['c7-names','have']]){h.jump(s);T.advance(.2);assert.equal(C7().inv.gum,want,s);}});
 // Continue: the last checkpoint comes back
 {h.jump('c7-court');T.advance(.3);const saved=h.chapter.saved?.();check('chapter 7: Continue offers the last checkpoint (Old Mill Court)',()=>{assert.equal(saved?.section,'c7-court');});}
 // isolation: back to earlier chapters, nothing of this one is left
 for(const [sec,name] of [['c6-oak','Six'],['c5-arrival','Five'],['c4-sam-garage','Four']]){try{h.jump(sec);T.advance(.4);}catch(e){check(`chapter 7: then Chapter ${name} starts clean`,()=>{throw e;});continue;}
  check(`chapter 7: then Chapter ${name} starts clean (no court, no hunter, no Sam's house inside, Sam back)`,()=>{assert.equal(A7.court.real.parent,null);assert.equal(A7.court.court.parent,null);assert.equal(A7.HM.visible,false);assert.equal(A7.house.root.parent,null);
   assert.equal(h.nav.room?.kind==='chapter7-region',false);assert.equal(A7.LIGHTS.some(l=>l.parent),false);});}
 // the creature asset adapter can drive a real skinned glTF (here the drain creature's file, as a stand-in for a future asset)
 try{const {createHunterModel}=await import('../dist/chapter7-creature.js');const fs=await import('node:fs');const buf=fs.readFileSync(new URL('../dist/assets/creature/creature.glb',import.meta.url));
  const THREE=await import('../dist/three.module.js');const {parseCreature}=await import('../dist/creature-asset.js');const ab=buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength);const parsed=await parseCreature(ab,{textures:false});
  const sc=new THREE.Scene();const m=createHunterModel({scene:sc,asset:{url:null,scale:.0135,yaw:0,height:2.3,radius:.42,bones:{hips:'spinebase_01',head:'head_05',handL:'Hand.L_011',handR:'Hand.R_024',grab:'Hand.R_024'},clips:{idle:parsed.clips[0]?.name},speeds:{},fallback:{run:'idle',grab:'idle'}}});
  await m.useAsset(null,{parsed});m.place(0,0,0,0);m.setState('run');m.update(1/30);m.setState('grab');m.update(1/30);
  check('chapter 7: the adapter loads a skinned .glb, falls back for missing clips, and keeps its sockets',()=>{assert.equal(m.source,'asset');assert.ok(m.missing.length>0);const p=m.sockets.grab.getWorldPosition(new THREE.Vector3());assert.ok(Number.isFinite(p.x+p.y+p.z));});
  M7.adapter={bones:m.assetInfo.bones,clips:m.assetInfo.clips.length,missing:m.missing.length,size:m.assetInfo.size};}catch(e){check('chapter 7: the adapter loads a skinned .glb',()=>{throw e;});}
}
