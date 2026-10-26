// Chapter Six (Someone Was Here): played from Chapter Five's end card to Chapter Six's, with inputs only (walking, riding,
// F on what the prompt offers, V and the camera's keys, looking), plus the chapter's own checks. Used by verify.mjs
// (ONLY=chapter6, and the full run) and by chapter6-browser.mjs (the same playthrough in Chromium, a segment per call).
import assert from 'node:assert/strict';
import {chapterThreeTools} from './chapter3-sim.mjs';
import {LOOKOUT} from '../dist/layout.js';
import {DEV_SCENES} from '../dist/dev-chapters.js';

export function chapterSixTools(T0){
 // (every frame the game advances, through any helper, the playthrough's own watcher sees it: T.each)
 const T=T0.__six||(T0.__six={...T0,advance:(s,each)=>T0.advance(s,()=>{each?.();T.each?.();})});
 const X=chapterThreeTools(T),{h,press,release,tap}=T,{until,wait,me,faceTo,walkTo,go}=X;
 const A6=h.chapter6,C6=()=>A6.state,S=()=>h.chapter.kit.S,K=h.chapter.kit;
 const WP=(x,z,y)=>A6.WP(x,z,y);
 const faceV=(v,{pitch=null}={})=>{const c=h.camera.position;faceTo(v.x,v.z,pitch??Math.atan2((v.y??c.y)-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const M=(d,l)=>{const p=T.groundPoint(d,l);return [p.x,p.z];};
 const quiet=()=>!h.chapter.state.line&&h.chapter.state.queue===0;
 const spot=()=>h.chapter.spot?.();
 const act=(id,max=8)=>{let ok=false;until(()=>{const s=spot();if(s?.id===id){tap('KeyF');ok=true;return true;}return false;},max);return ok;};
 const boys=()=>h.chapter.companions.all.filter(c=>c.active&&!c.gone);
 const gap=()=>{const p=me();return Math.max(0,...boys().map(c=>Math.hypot((c.mode==='ride'?c.bx:c.px)-p.x,(c.mode==='ride'?c.bz:c.pz)-p.z)));};
 const offBike=()=>{if(h.night.state==='c1-ride'){release('KeyW');press('KeyS');until(()=>h.night.speed<.05,8);release('KeyS');tap('KeyF');until(()=>h.night.state==='c1-walk',4);wait(.3);}};
 const onBike=()=>{for(let k=0;k<3&&h.night.state==='c1-walk';k++){const r=h.night.roam;approach({x:r.x,z:r.z},1.0);faceTo(r.x,r.z);wait(.2);
  if(!/bike/i.test(h.ui.promptText||'')&&globalThis.process?.env?.TRACE6)console.log('  (no bike prompt: '+(h.ui.promptText||'')+' d='+Math.hypot(me().x-r.x,me().z-r.z).toFixed(2)+')');tap('KeyF');until(()=>h.night.state==='c1-ride',4);}};
 const rideTo=(pts,max=200,r=2.8,stop=null)=>{h.drive(pts,{r});const ok=until(()=>!h.driving||!!stop?.(),max);h.stopDriving();return ok;};
 // straight lines in a room or at the works (their own walkable, no street graph): leg by leg
 const walkLine=(pts,o={})=>walkTo(pts.map(q=>Array.isArray(q)?q:[q.x,q.z]),{r:.35,max:40,...o});
 const along=(d0,d1,l,st=30)=>{const o=[];const n=Math.max(1,Math.ceil(Math.abs(d1-d0)/st));for(let i=1;i<=n;i++)o.push(M(d0+(d1-d0)*i/n,l));return o;};
 const W6=(x,z)=>{const q=WP(x,z);return [q.x,q.z];};
 // To within r of q (a thing on a wall, a desk, a hand): the nearest walkable point to it, by a fine grid search over
 // the nav's own walkable (rooms and the works have narrow doors the street graph's coarse search misses).
 let BL=[];const ok=(x,z)=>h.nav.walkable(x,z,{r:.31})&&!BL.some(b=>Math.hypot(b.x-x,b.z-z)<b.r+.36);
 function route(to,r=0,step=.1,pad=4){const p=me();BL=(h.chapter.blockers?.(true)||[]).filter(b=>!b.low&&Math.hypot(b.x-p.x,b.z-p.z)>b.r+.3);const x0=Math.min(p.x,to.x)-pad,z0=Math.min(p.z,to.z)-pad,nx=Math.ceil((Math.max(p.x,to.x)+pad-x0)/step),nz=Math.ceil((Math.max(p.z,to.z)+pad-z0)/step);
  const I=(x,z)=>[Math.round((x-x0)/step),Math.round((z-z0)/step)],P=(i,j)=>({x:x0+i*step,z:z0+j*step}),key=(i,j)=>i*100000+j;
  const [si,sj]=I(p.x,p.z),prev=new Map([[key(si,sj),null]]),q=[[si,sj]];let end=null,best=null,bd=1e9;
  for(let n=0;n<q.length&&n<200000;n++){const [i,j]=q[n],c=P(i,j),d=Math.hypot(c.x-to.x,c.z-to.z);if(d<bd){bd=d;best=[i,j];}if(d<=Math.max(r,step*.8)){end=[i,j];break;}
   for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ii=i+a,jj=j+b,k=key(ii,jj);if(ii<0||jj<0||ii>nx||jj>nz||prev.has(k))continue;const w=P(ii,jj);if(!ok(w.x,w.z)&&Math.hypot(w.x-p.x,w.z-p.z)>.7)continue;/* (standing somewhere tight: out of it first) */prev.set(k,[i,j]);q.push([ii,jj]);}}
  const tail=end||best;if(!tail)return [];const pts=[];for(let c=tail;c;c=prev.get(key(c[0],c[1])))pts.unshift(P(c[0],c[1]));
  // (smoothed: the farthest point still in a straight clear line)
  const clear=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.1);for(let k=1;k<=n;k++)if(!ok(a.x+(b.x-a.x)*k/n,a.z+(b.z-a.z)*k/n))return false;return true;};
  const out=[];for(let i=0;i<pts.length-1;){let j=pts.length-1;while(j>i+1&&!clear(pts[i],pts[j]))j--;out.push([pts[j].x,pts[j].z]);i=j;}return out;}
 const approach=(q,r=.9,o={})=>{const path=route(q,r,.1,o.pad??(h.chapter6.works.nav.inside(me().x,me().z)?16:4));if(!path.length)return Math.hypot(me().x-q.x,me().z-q.z)<=r+.3;return walkTo(path,{r:.07,max:40,...o});};
 return {...X,T,A6,C6,S,K,WP,W6,along,faceV,M,quiet,spot,act,boys,gap,offBike,onBike,rideTo,walkLine,route,approach};
}

// segments, in order (from= starts at one by its jump; to= stops after one; cont= goes on from where the last call stopped)
export const SEG6=['morning','meeting','streets','records','works','below','flood','after'];
const JUMP6={morning:'chapter6-start',meeting:'c6-ride',streets:'c6-oak',records:'c6-records',works:'c6-works',below:'c6-lower',flood:'c6-emergency',after:'c6-sealed'};

export function playChapterSix(T,label,{fromCard=true,dev=false,from=null,to=null,cont=false,entered=false,looks=true}={}){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterSixTools(T),{A6,C6,S,K,WP,W6,along,faceV,M,quiet,spot,act,boys,gap,offBike,onBike,rideTo,walkLine,route,approach,log,until,wait,me,faceTo,walkTo,go}=X;
 const M6=/replay|DEV/.test(label)?{}:(metrics['chapter6']||(metrics['chapter6']={}));
 const watch=A6.__watch||(A6.__watch={bad:0,jumps:0,lastP:null,gapMax:{},samGone:0,samVisibleAfter:0,double:0,both:0,figure:0,phases:[],lines:[],minutes:{}});
 const sample=()=>{const s=C6(),p=me();if(watch.phases[watch.phases.length-1]!==s.phase)watch.phases.push(s.phase);
  for(const v of [p.x,p.z,h.camera.position.y])if(!Number.isFinite(v))watch.bad++;
  if(A6.C.fadeOut<0&&watch.lastP&&h.night.state===watch.lastP.st){const d=Math.hypot(p.x-watch.lastP.x,p.z-watch.lastP.z);if(d>2.5)watch.jumps++;}watch.lastP={x:p.x,z:p.z,st:h.night.state};
  if(/^(d6-(oak|street|creek)|e6-(yard|house|gallery|lower|grille)|n6-(rescue))$/.test(s.phase)&&A6.C.fadeOut<0){const g=gap();watch.gapMax[s.phase]=Math.max(watch.gapMax[s.phase]||0,+g.toFixed(1));}
  if(s.samGone&&h.chapter.companions.all.find(c=>c.key==='sam').person.group.visible)watch.samVisibleAfter++;if(s.sam2)watch.double++;if(s.ax)watch.figure++;
  const l=h.chapter.state.line;if(l&&watch.lastLine!==l){watch.lastLine=l;watch.lines.push((h.chapter.state.speaker||'')+': '+l);}};
 X.T.each=sample;const U=(fn,max)=>until(fn,max);const W=s=>U(()=>false,s);
 const seg=k=>{const fi=from?SEG6.indexOf(from):0,li=to?SEG6.indexOf(to):SEG6.length-1,ki=SEG6.indexOf(k);if(ki<fi||ki>li)return false;if(from===k&&ki>0&&!cont){h.jump(JUMP6[k]);W(.5);}return true;};
 const lines=()=>watch.lines;const said=t=>watch.lines.some(l=>l.includes(t));
 const clock0=()=>h.snapshot.clock;let t0=clock0(),tSeg=t0;const lap=k=>{const t=clock0();watch.minutes[k]=+((t-tSeg)/60).toFixed(2);tSeg=t;};
 const ph=()=>S().phase;
 const note=(...a)=>{if(globalThis.process?.env?.TRACE6){const p=me();console.log('['+(clock0()-t0).toFixed(1)+'s '+ph()+' '+p.x.toFixed(1)+','+p.z.toFixed(1)+']',...a);}};

 if(seg('morning')){
  if(from==='morning'||entered){if(from==='morning'&&!cont){h.jump('chapter6-start');}}
  else if(fromCard){if(h.snapshot.state!=='ended'){h.jump('chapter5-end');until(()=>h.snapshot.state==='ended',60);}
   check(`${label}: Chapter Five's end card offers Chapter Six`,()=>{assert.equal(element('next-chapter').hidden,false);assert.match(element('next-chapter').innerHTML,/Chapter Six/);});
   element('next-chapter').onclick();}
  else if(dev)h.devStart(6);else h.jump('chapter6-start');
  t0=tSeg=clock0();
  let card=null;U(()=>{const el=element('chapter-card');if(el.classList.contains('on'))card={h2:el.querySelector?.('h2')?.textContent,sub:el.querySelector?.('.card-sub')?.innerHTML};return ph()==='d6-room';},12);
  check(`${label}: black, the card (LAST LIGHT · Chapter Six · Someone Was Here · Thursday, August 25, 2011), then your room`,()=>{assert.equal(ph(),'d6-room');assert.match(element('date').innerHTML,/AUGUST 25, 2011/);
   if(card&&card.h2!==undefined){assert.match(card.h2,/Chapter Six/);if(card.sub!==undefined)assert.match(card.sub,/SOMEONE WAS HERE[\s\S]*AUGUST 25, 2011/);}assert.equal(h.nav.room,A6.home.nav,'in your room');});
  // in bed: "Thursday." — then up
  U(()=>A6.C.flags.awake,20);tap('KeyW');U(()=>A6.C.flags.up&&!A6.C.pose,6);
  check(`${label}: you wake in bed and get up yourself`,()=>{assert.ok(A6.C.flags.up);assert.equal(A6.C.pose,null);});
  const HS=A6.home.SPOTS;
  const near=(q,r)=>approach(q,r);const lookF=(q,id)=>{faceV(q);W(.1);return X.act(id,3);};
  note('up');if(looks){near(HS.window,1.3);note('window');if(lookF(HS.window,'c6-window'))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);near(HS.cork,1.2);note('cork');if(lookF(HS.cork,'c6-cork'))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);}
  note('looks done');near(A6.home.CAMERA_AT(),1.0);faceV(A6.home.CAMERA_AT());W(.1);note('desk',spot()?.id);
  check(`${label}: Alex's camera on your desk, F picks it up`,()=>{assert.equal(spot()?.id,'c6-cam');});X.act('c6-cam');U(()=>C6().inv.camera==='have'&&!A6.C.flags?.reach,4);W(.8);
  tap('KeyV');U(()=>A6.C.view==='camera',2);U(()=>A6.C.flags.reviewed,6);T.snap?.('c6-room-camera');
  check(`${label}: the last picture (the fire, from the trees), looked at`,()=>{assert.ok(A6.C.flags.reviewed);assert.equal(h.chapter4.photo.current?.id,'c5-campfire');});
  note('reviewed');U(()=>A6.C.flags.ring,30);note('ring');
  check(`${label}: the phone rings (the camera lowers itself), Mom from the kitchen`,()=>{assert.equal(ph(),'d6-phone');assert.equal(A6.C.view,null);});
  near(HS.phone,1.0);note('phone',spot()?.id);faceV(HS.phone);W(.1);X.act('c6-phone',4);U(()=>A6.C.flags.answered,3);
  U(()=>A6.C.flags.called,140);
  check(`${label}: Sam's call: his dad knows, Reyes at nine-thirty, and Jamie at two in the morning`,()=>{for(const t of ['Officer Reyes is coming','Jamie called me last night','Sam, come to the window','He says he was asleep','So who called you'])assert.ok(said(t),t);});
  near(HS.front,.9);faceV(HS.front);W(.1);note('front',spot()?.id);X.act('c6-out',4);U(()=>ph()==='d6-ride'&&A6.C.fadeIn<0,6);
  check(`${label}: out the front door, on the stoop, your bike in the drive`,()=>{assert.equal(ph(),'d6-ride');assert.equal(h.nav.room,null);assert.equal(h.night.state,'c1-walk');});
  lap('morning');}

 if(seg('meeting')){
  const SH=h.world.homes.sam;const dd=SH.drivD,L0=h.nav.locate(me().x,me().z);note('ride from',JSON.stringify(L0),'sam at',dd,'home at',A6.home.P.drivD);
  onBike();note('on bike',h.night.state);const dir=Math.sign(dd-(L0.d??dd))||1;
  const along=(d0,d1,l,st=30)=>{const o=[];const n=Math.max(1,Math.ceil(Math.abs(d1-d0)/st));for(let i=1;i<=n;i++)o.push(M(d0+(d1-d0)*i/n,l));return o;};
  rideTo([M(L0.d+dir*4,-1.8),...along(L0.d+dir*4,dd-dir*8,-1.6),M(dd-dir*3,-1.2)],160);note('rode',h.night.state,h.night.speed);offBike();note('off',h.night.state,JSON.stringify(h.roam));
  const t=A6.TL(0,-1.6);approach(t,.8);note('at garage');U(()=>ph()==='d6-meet',10);
  check(`${label}: Sam's garage: Sam's dad, Alex's dad and Officer Reyes at the card table`,()=>{assert.equal(ph(),'d6-meet');for(const a of [h.chapter.officer2,h.chapter.dad,A6.cast.samDad])assert.ok(a.visible,'adult missing');});
  U(()=>A6.C.flags.shirtOnTable,40);T.snap?.('c6-shirt-on-table');U(()=>A6.C.flags.dadHands,30);T.snap?.('c6-alex-dad');
  U(()=>A6.C.flags.bagged,90);
  check(`${label}: the gold shirt: on the table, Alex's dad, then into Reyes's evidence bag`,()=>{assert.equal(C6().inv.shirt,'reyes');for(const t of ['Where.','His mother bought this','He wore it anyway','I’m going to need to take it'])assert.ok(said(t),t);});
  U(()=>A6.C.flags.showPics,80);const R=h.chapter.officer2;approach(R.pos,1.6);faceV(R.pos.clone().setY(1.4));W(.1);note('show',spot()?.id);X.act('c6-show',6);U(()=>A6.C.view==='camera',3);
  // through the pictures: the register, the map, then the fire; zoom up the bank
  const photo=h.chapter4.photo;let guard=0;
  while(guard++<40&&!A6.C.flags.silSeen){const id=photo.current?.id;
   if(id!=='c5-campfire'){if(!quiet()){W(.5);continue;}W(1.4);tap('KeyD');W(.2);continue;}
   W(1.5);for(let i=0;i<4;i++){tap('KeyW');W(.15);}const V=photo.V,b=A6.FIREPIC.sil;V.px=b.x;V.py=b.y;V.dirty=true;W(2);}
  U(()=>A6.C.flags.silDone,60);T.snap?.('c6-silhouette');
  check(`${label}: the picture from the trees, zoomed: someone up the bank; Reyes says shadow`,()=>{assert.ok(A6.C.flags.silSeen);assert.ok(said('Up the bank. Behind us.'));assert.ok(said('It’s a shadow')||said('That’s a post'));});
  U(()=>A6.C.flags.copy,60);U(()=>quiet(),10);approach(R.pos,1.4);faceV(h.chapter.officer2.person.parts.rhand.getWorldPosition(new h.camera.position.constructor()));W(.1);X.act('c6-give',8);U(()=>A6.C.flags.given,4);
  check(`${label}: the camera, handed to Reyes to copy`,()=>{assert.equal(C6().inv.camera,'reyes');});
  U(()=>A6.C.flags.met,200);
  check(`${label}: Jamie tells them about Jamie; what Reyes can do today; Briarwood at eleven`,()=>{for(const t of ['And then there was me.','I’m writing down','Camp Whippoorwill','Mill Street bridge','Briarwood at eleven'])assert.ok(said(t),t);});
  lap('meeting');}
 if(seg('streets')){
  const where=()=>h.nav.locate(me().x,me().z);
  if(from!=='streets'||cont){U(()=>ph()==='d6-oak',10);
   // to the oak, on your bikes: the three of you
   U(()=>A6.C.flags['ready-jamie']&&A6.C.flags['ready-sam'],30);onBike();const L=where();note('to the oak from',L.d?.toFixed(1));
   rideTo([...along(L.d,LOOKOUT.stop.d-3,-1.6)],150);X.brake();W(1);note('at the oak',gap().toFixed(1));offBike();U(()=>A6.C.oak?.talk,20);}
  check(`${label}: the old oak: the three of them`,()=>{assert.ok(A6.C.oak?.talk);});
  U(()=>A6.C.oak.done,160);T.snap?.('c6-oak');
  check(`${label}: "It looked exactly like me." / "It looked at me like I was the one who wasn't supposed to be there."`,()=>{for(const t of ['It looked exactly like me.','It looked at me like I was the one who wasn’t supposed to be there.','pine needle','chose to dismount'])assert.ok(said(t),t);});
  if(looks){const c=A6.LOOK.chalk;approach(c,1.8);faceV({x:c.x,y:c.y,z:c.z});W(.1);if(X.act('c6-chalk',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);}
  U(()=>ph()==='d6-street',30);note('street');
  // back down Oak Hollow toward Briarwood: Jamie's house on the way
  onBike();{const L=where();rideTo([...along(L.d,840,-1.6)],120);}
  {const L=where();rideTo([...along(L.d,790,-1.8,10)],60,2.6,()=>ph()==='d6-jamie');}note('jamie stops',ph());
  U(()=>ph()==='d6-jamie',10);X.brake();
  const J=A6.JAM;rideTo([[J.drive.x+2.5,J.drive.z+2.5]],20,1.5);X.brake();offBike();
  check(`${label}: Jamie stops at his house to tell his mom`,()=>{assert.equal(ph(),'d6-jamie');assert.ok(said('I gotta tell my mom'));});
  // stand in front of the door (back on the walk) and watch the foyer
  const out={x:J.step.x+(J.step.x-J.door.x)*3.2,z:J.step.z+(J.step.z-J.door.z)*3.2};approach(out,.8);
  U(()=>A6.C.anom?.shown,60);note('shown',JSON.stringify(C6().anom));const fy={x:J.foyer.x,y:(J.foyer.y??0)+1.6,z:J.foyer.z};
  let both=0;U(()=>{faceV(fy);const j=h.chapter.companions.all.find(c=>c.key==='jamie');if(C6().jamie2&&j.person.group.visible)both++;return A6.C.flags.anomSeen&&C6().anom.seen>1.3;},20);
  T.snap?.('c6-jamie-double');note('seen',JSON.stringify(C6().anom));
  check(`${label}: on the stairs inside the open door, Jamie — while Jamie is outside with you`,()=>{assert.ok(A6.C.flags.anomSeen);assert.ok(both>10,'both '+both);});
  // look away (at Jamie): it is gone the first moment nobody is looking
  {const j=h.chapter.companions.all.find(c=>c.key==='jamie');U(()=>{faceV({x:j.px,y:1.4,z:j.pz});return C6().anom.gone;},8);}
  check(`${label}: it is gone when you look away (never while watched; the view never turned for you)`,()=>{assert.ok(C6().anom.gone);assert.match(C6().anom.why,/unwatched|lamp/);});
  U(()=>A6.C.anom.done,60);
  check(`${label}: "Was it me?" — Jamie locks his door`,()=>{assert.ok(said('Was it me?'));assert.ok(said('I’m locking it.'));});
  U(()=>ph()==='d6-street'&&A6.C.cr,20);note('to the creek');
  // Briarwood: Reyes at the creek
  onBike();note('on',h.night.state,JSON.stringify(where()));{const L=where();rideTo([M(L.d,-1.6),...along(L.d,604,-1.6),M(597,2.6),X.S1(8,1.6),...X.sline(8,92,1.6)],140);}note('rode',JSON.stringify(where()));X.brake();offBike();
  approach(A6.BW.reyes,6);note('walked',JSON.stringify(where()),'reyes',JSON.stringify(h.nav.locate(A6.BW.reyes.x,A6.BW.reyes.z)),Math.hypot(me().x-A6.BW.reyes.x,me().z-A6.BW.reyes.z).toFixed(1));U(()=>ph()==='d6-creek',20);
  check(`${label}: Officer Reyes at the creek, where Alex turned`,()=>{assert.equal(ph(),'d6-creek');});
  U(()=>A6.C.flags.creekDone,160);T.snap?.('c6-creek-reyes');
  check(`${label}: Reyes's questions; the dog that would not go past the culvert; the storm coming`,()=>{for(const t of ['The dog wouldn’t go past the culvert','From what?','Storm’s coming'])assert.ok(said(t),t);});
  U(()=>ph()==='e6-garage',12);
  lap('streets');}
 if(seg('records')){
  if(from!=='records'||cont)U(()=>ph()==='e6-garage',15);
  check(`${label}: a little after two, Sam's garage again: the weather radio, the storm warning`,()=>{assert.equal(ph(),'e6-garage');assert.match(element('date').innerHTML,/2:\d\d PM/);});
  U(()=>A6.C.flags.camBack,120);note('camera back offered');const R=h.chapter.officer2;
  approach(R.pos,1.5);faceV(R.person.parts.rhand.getWorldPosition(R.pos.clone()));W(.1);X.act('c6-camback',6);U(()=>C6().inv.camera==='have',4);
  check(`${label}: Reyes returns Alex's camera (the pictures copied at the station)`,()=>{assert.equal(C6().inv.camera,'have');assert.ok(said('The pictures are on a disk at the station'));});
  U(()=>C6().inv.plan&&quiet(),60);note('plan on the table');
  {const tp=A6.TL(-.05,-.02,.73);approach(tp,1.3);faceV(tp);W(.1);note('plan spot',spot()?.id);X.act('c6-plan',4);}
  U(()=>A6.C.flags.planWords,6);T.snap?.('c6-plan');
  U(()=>A6.C.rec?.stage==='go',260);note('to the car');
  check(`${label}: the 1958 plan, Sam reading it: Line Two (Mill Street, brick, 1908), Line Four (Briarwood), where they meet; the helmet in the bar screen`,()=>{
   for(const t of ['Line Four','Line Two. Mill Street','They meet. Right here.','Ruth Ann Carver','found open. Padlock missing','kid’s bike helmet out of it yesterday','Stay with him.','I will.'])assert.ok(said(t),t);
   for(const m of ['alex','line4','dw','rac','meet','works','rack'])assert.ok(A6.props.planMarks.has(m),'mark '+m);});
  if(looks){const f=A6.TL(-.55,.1,.74);approach(f,1.2);faceV(f);W(.1);note('file spot',spot()?.id);if(X.act('c6-file',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),25);
   const nb=A6.props.samNotes.getWorldPosition(f.clone());approach(nb,1.1);faceV(nb);W(.1);note('notes spot',spot()?.id);if(X.act('c6-notes',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),30);}
  const car=K.carA;approach(car.pos,2.6);faceV(car.pos.clone().setY(car.pos.y+1));W(.1);X.act('c6-car',6);U(()=>ph()==='e6-yard'&&A6.C.fadeIn<0,10);
  lap('records');}
 if(seg('works')){
  if(from!=='works'||cont)U(()=>ph()==='e6-yard',10);
  check(`${label}: the Mill Creek isolation works, half past three, the storm coming in`,()=>{assert.equal(ph(),'e6-yard');assert.match(element('date').innerHTML,/3:\d\d PM/);assert.ok(C6().storm>.4,'storm '+C6().storm);assert.ok(A6.works.root.parent,'the works in the scene');});
  U(()=>A6.C.wk.stage==='lights',40);const B=A6.cast.brandt;approach(B.pos,1.4);faceV(B.person.parts.rhand.getWorldPosition(B.pos.clone()));W(.1);X.act('c6-light',6);U(()=>C6().inv.flashlight,4);
  check(`${label}: Mr. Brandt, Public Works, hands you a flashlight`,()=>{assert.ok(C6().inv.flashlight);assert.ok(said('Thirty-one years with the township'));});
  if(looks){const q=WP(8.6,-20);approach(q,1.5);faceV(WP(7,-20,-1.5));W(.1);if(X.act('c6-channel',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);
   approach(WP(8.4,-23.6),.8);faceV(WP(4,-24.6,-2.6));W(.1);note('rack spot',spot()?.id);if(X.act('c6-rack',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);}
  approach(WP(18.5,-3.9),.6);U(()=>ph()==='e6-house',10);note('in the gatehouse');
  {const hb=WP(17.2,1.2,.25+.9);approach(hb,1.2);faceV(hb);W(.1);note('helmet spot',spot()?.id);X.act('c6-helmet',4);}
  U(()=>C6().inv.helmet==='reyes',40);T.snap?.('c6-helmet');
  check(`${label}: Alex's helmet (red, 17, the broken strap) identified, bagged by Reyes`,()=>{assert.ok(said('That’s his.'));assert.ok(said('Seventeen'));assert.equal(C6().inv.helmet,'reyes');});
  if(looks){const lg=WP(18.6,1.25,.25+.8);approach(lg,1.2);faceV(lg);W(.1);if(X.act('c6-log',3))U(()=>A6.C.view===null&&!A6.C.pose,15);
   const pn=WP(17.2,-7.2,.25+1.55);approach(WP(17.2,-5.6),.6);faceV(pn);W(.1);note('panel spot',spot()?.id);if(X.act('c6-panel',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);}
  U(()=>A6.C.wk.stage==='down',60);note('down');
  check(`${label}: Sam gets Brandt's spare radio; the boys to the gallery, "not one step past it"`,()=>{assert.ok(C6().inv.radio);assert.ok(said('Not one step past it'));});
  approach(WP(8,-4),.8);U(()=>ph()==='e6-gallery',20);note('gallery');
  if(looks){approach(WP(7.2,-1.6),.6);faceV(WP(.5,-1.6,-5.5+2.6));W(.1);note('gauge spot',spot()?.id);if(X.act('c6-gauge',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),12);}
  approach(WP(8,6),.8);U(()=>A6.C.gal?.echo,60);
  // the voice behind them: turn round, look at the speaker at the dead end
  {const ic=WP(8,-13.6,-3+1.9);U(()=>{faceV(ic);return false;},2);}
  U(()=>A6.C.gal.down,60);
  check(`${label}: the radio, twice: the second time from behind them, the intercom with its cable cut`,()=>{assert.ok(said('REYES — BEHIND YOU')||watch.lines.some(l=>/^REYES — BEHIND YOU/.test(l)));assert.ok(said('I said it once.'));});
  if(looks){const ic=WP(8,-13.6,-3+1.9);approach(WP(8,-12.6),.8);faceV(ic);W(.1);if(X.act('c6-speaker',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),12);}
  lap('works');}
 if(seg('below')){
  if(from!=='below'||cont){approach(WP(8,12.2),.6);approach(WP(8,17.4),.8);}
  U(()=>ph()==='e6-lower',20);note('lower');
  U(()=>A6.C.low?.stage==='prints',60);note('prints');
  {const pq=WP(8,16.95,-5.8);approach(WP(8.3,18.3),.5);faceV(pq);W(.1);note('prints spot',spot()?.id);X.act('c6-prints',4);T.snap?.('c6-prints');}
  U(()=>A6.C.low?.stage==='j',90);
  check(`${label}: wet prints on the landing (his Vans), out from under 2B to the stairs and back: "…At us."`,()=>{assert.ok(A6.works.prints.visible);for(const t of ['Look down.','His Vans','They’re wet','At us.'])assert.ok(said(t),t);});
  check(`${label}: gate 2B, the hand brake ("Pull and hold to stop leaf"), its broken return spring`,()=>{assert.ok(said('Pull and hold to stop leaf'));assert.ok(said('Return spring’s busted'));});
  approach(WP(9,31.6),.8);U(()=>ph()==='e6-grille',20);note('grille');
  U(()=>A6.C.gr?.stage==='figure',40);
  // look up the pipe through the grille
  const up=WP(9,40,-5.8+1.1);U(()=>{faceV(up);return A6.C.gr.shown&&A6.C.gr.seen>1.2;},12);T.snap?.('c6-alex-pipe');
  check(`${label}: the bell up Line Two, and Alex, up the pipe`,()=>{assert.ok(A6.C.gr.shown);assert.ok(C6().ax||A6.C.gr.stage!=='figure');});
  U(()=>A6.C.gr.stage==='charge',20);let seenRun=0;U(()=>{faceV(C6().ax?{x:A6.cast.AX.x,y:A6.cast.AX.y+1.2,z:A6.cast.AX.z}:up);if(C6().ax)seenRun++;return A6.C.gr.hit;},6);T.snap?.('c6-grate-hit');
  check(`${label}: it runs at the grille and hits it (the major scare): the lights out, gone`,()=>{assert.ok(A6.C.gr.hit);assert.ok((A6.C.sounds.c6Grate||0)>=1);});
  U(()=>ph()==='n6-flood',60);
  lap('below');}
 const LOW=-5.8,GZ=23;
 if(seg('flood')){
  if(from!=='flood'||cont)U(()=>ph()==='n6-flood',20);
  check(`${label}: the power goes: the alarm, the gate (2B) coming down on its own`,()=>{assert.equal(ph(),'n6-flood');assert.equal(C6().power,false);assert.equal(C6().gate.mode,'down');});
  U(()=>C6().gate.held,12);note('held',JSON.stringify(C6().gate));T.snap?.('c6-sam-holds');
  check(`${label}: Sam takes the hand brake and holds the leaf ("GO! I’ve got it! GO!")`,()=>{assert.ok(C6().gate.held);assert.ok(C6().gate.gap>1.45,'room to get under, standing: '+C6().gate.gap);});
  // under it: back down the chamber and through
  approach(WP(9,24.4),.4);approach(WP(9.1,21),.5);U(()=>A6.C.fl.crossed,6);note('under',JSON.stringify(C6().zone));
  check(`${label}: you get under the gate yourself (walking, through the gap)`,()=>{assert.ok(A6.C.fl.crossed);assert.ok(!A6.C.flags['carried-under'],'not carried');});
  U(()=>ph()==='n6-hold'&&A6.C.hold.stage==='pin'&&quiet(),40);note('pin');
  {const q=A6.works.pinAt.stow;approach(q,1.0);faceV(q);W(.1);note('pin spot',spot()?.id);X.act('c6-pin',4);U(()=>C6().inv.pin==='hand'&&!h.roam.walkLock,4);}
  {const q=A6.works.pinAt.hole;approach(q,.9);faceV(q);W(.1);note('hole spot',spot()?.id);X.act('c6-insert',4);U(()=>A6.C.hold.ready,12);}
  check(`${label}: the locking pin: pulled, but the holes don't line up ("It won't go in!")`,()=>{assert.ok(said('It won’t go in!'));assert.ok(said('It only stops'));});
  {const q=A6.WP(11.25,21.4,LOW+1.05);approach(q,1.1);faceV(q);W(.1);if(X.act('c6-crank',3))U(()=>quiet(),8);}
  U(()=>ph()==='n6-double',20);note('double');
  // the far end of the chamber, through the gap: Sam at the brake, and under the lamp, Sam
  const pos=WP(9.3,21.1);approach(pos,.3);
  const S2=A6.cast.SAM2,sam=h.chapter.companions.all.find(c=>c.key==='sam'),R=h.chapter.officer2;let both=0,reyesBoth=0;
  const through=(e,q)=>{const L=A6.works.toLocal(e.x,e.z),Q=A6.works.toLocal(q.x,q.z);const t=(GZ-L.z)/((Q.z-L.z)||1e-6);if(t<0||t>1)return false;const x=L.x+(Q.x-L.x)*t,y=e.y+(q.y-e.y)*t;return x>7.65&&x<10.35&&y<LOW+C6().gate.gap-.03&&y>LOW;};
  U(()=>{const a={x:S2.x,y:S2.y+1.2,z:S2.z},b={x:sam.px,y:LOW+1.15,z:sam.pz},m={x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2};faceV(m);
   if(C6().sam2&&sam.person.group.visible)both++;const re=R.person.parts.head?R.person.parts.head.getWorldPosition(R.pos.clone()):{x:R.x,y:LOW+1.1,z:R.z};if(C6().sam2&&through(re,a)&&through(re,b))reyesBoth++;
   if(A6.C.dbl?.stage==='still'&&!A6.__snapped){A6.__snapped=true;T.snap?.('c6-two-sams');}return C6().samGone;},40);
  note('dbl',JSON.stringify(C6().dbl),'reyesBoth',reyesBoth);
  check(`${label}: two Sams at once — Sam at the brake, and the other under the lamp — seen by you through the gap`,()=>{assert.ok(C6().dbl.both>1.5,'both in your view '+JSON.stringify(C6().dbl));assert.ok(both>45,'both in the world '+both);});
  check(`${label}: Officer Reyes has both in his line of sight, through the gap, while both are there`,()=>{assert.ok(reyesBoth>30,'reyes '+reyesBoth);assert.ok(said('Who’s that?'));});
  check(`${label}: it runs at the brake; the gate drops; Sam is gone (once; never seen again)`,()=>{assert.ok(C6().samGone);assert.equal(C6().gate.mode==='drop'||C6().gate.mode==='shut',true,C6().gate.mode);assert.equal((A6.C.sounds.c6Slam||0)>=1,true);});
  U(()=>ph()==='n6-sealed',10);
  lap('flood');}
 if(seg('after')){
  if(from!=='after'||cont)U(()=>ph()==='n6-sealed',10);
  U(()=>A6.C.sl.stage==='free',30);note('sealed, free');
  {const g=WP(9,22.85,LOW+1.2);approach(WP(9,22.1),.4);faceV(g);W(.1);X.act('c6-bang',3);U(()=>quiet(),10);}
  {const q=WP(9,22.85,LOW+1.55);faceV(q);W(.1);note('port spot',spot()?.id);if(X.act('c6-port',3))U(()=>A6.C.view===null&&!A6.C.pose&&quiet(),15);T.snap?.('c6-port');}
  U(()=>A6.C.sl.stage==='up',60);note('up');
  check(`${label}: the gate won't open; Reyes calls fire and rescue; the manhole on the bank`,()=>{assert.ok(said('fire and rescue'));assert.ok(said('manhole'));});
  approach(WP(8,13),.6);approach(WP(9,-6.9),.6);approach(WP(18,-3.9),.6);approach(WP(23,-3.9),.6);U(()=>ph()==='n6-rescue',10);note('rescue');
  approach(WP(16.5,21),.6);approach(WP(15.8,26),.6);approach(WP(14.6,31.8),.6);
  U(()=>A6.C.rs.stage==='lift',90);{const q=WP(12.85,33.2,.7);approach(q,1.5);faceV(q);W(.1);note('lift spot',spot()?.id);X.act('c6-lift',4);}
  U(()=>A6.C.rs.stage==='open',20);U(()=>said('Black water'),8);T.snap?.('c6-manhole');
  check(`${label}: the manhole lifted, black water; sirens; no Sam`,()=>{assert.equal(A6.C.rs.stage,'open');assert.ok(said('Black water'));});
  U(()=>ph()==='n6-after',60);note('after');
  check(`${label}: two hours later: the yard full of lights, Jamie in a blanket`,()=>{assert.equal(ph(),'n6-after');assert.ok(A6.rescue.g.visible);assert.ok(C6().samGone);});
  {const j=h.chapter.companions.all.find(c=>c.key==='jamie');approach({x:j.px,z:j.pz},2.4);}
  U(()=>A6.C.af.stage==='talk'||A6.C.af.stage==='t1',140);{const R=h.chapter.officer2;approach(R.pos,5);}
  U(()=>ph()==='n6-end',140);T.snap?.('c6-end');
  check(`${label}: Jamie: "He held it for me."; the firefighters: the grille open, nothing in the pipe`,()=>{for(const t of ['He held it for me.','The grille at the end was open','nothing in there','I was gonna ask him for gum'])assert.ok(said(t),t);});
  check(`${label}: Reyes: "I saw them both. At the same time." — and on his radio, "…I've got it."`,()=>{assert.ok(said('I saw them both. At the same time.'));assert.ok(said('I’ve got it.'));});
  U(()=>h.snapshot.state==='ended',10);
  check(`${label}: the end card: LAST LIGHT · Chapter Six · Someone Was Here · August 25, 2011; no Chapter Seven`,()=>{assert.equal(h.snapshot.state,'ended');const el=element('ending');assert.equal(el.hidden,false);
   assert.equal(element('next-chapter').hidden,true,'no next chapter');});
  check(`${label}: Sam missing, never confirmed dead; never seen again after the gate`,()=>{assert.ok(C6().samGone);assert.equal(watch.samVisibleAfter,0);assert.ok(!watch.lines.some(l=>/\b(dead|died|body|drowned)\b/i.test(l)),'no word of death');});
  lap('after');
  M6.minutes={...watch.minutes,total:+((clock0()-t0)/60).toFixed(2)};}
 return {watch,said,lines};
}

// The chapter's own checks: every jump and DEV scene, Continue, the story going on for a player who stands still, the gate and the
// water, and the earlier chapters exactly as they were after Chapter Six has run.
export async function runChapterSixChecks(T,cap=null){
 const {h,advance,check,element,metrics}=T,X=chapterSixTools(T),{A6,C6,S,until,wait,me,boys,gap,faceTo}=X;
 const M6=metrics['chapter6']||(metrics['chapter6']={});
 // ---- every jump ----
 const jumps={};
 for(const sec of A6.SECTIONS){let r;try{h.jump(sec);advance(.2);const ph0=S().phase;until(()=>false,2.5);const p=me(),fin=[p.x,p.z,h.camera.position.y].every(Number.isFinite)&&X.companionsFinite();
   r={ok:true,phase:ph0,owned:A6.owns(S().phase),finite:fin,boys:boys().length,samGone:C6().samGone};}catch(e){r={ok:false,err:String(e.stack||e).slice(0,400)};}jumps[sec]=r;}
 const after=s=>A6.SECTIONS.indexOf(s)>=A6.SECTIONS.indexOf('c6-sealed');
 check(`Chapter Six: every one of its ${A6.SECTIONS.length} jumps starts without an error, in its own phase, everyone finite`,()=>{const bad=Object.entries(jumps).filter(([,r])=>!r.ok||!r.owned||!r.finite);assert.deepEqual(bad,[]);});
 check('Chapter Six: Sam is with you in every jump before the gate, and gone in every one after it',()=>{const bad=Object.entries(jumps).filter(([k,r])=>after(k)?!r.samGone||r.boys!==1:r.samGone||r.boys!==2);assert.deepEqual(bad,[]);});
 for(const [k,a] of Object.entries(A6.ALIAS)){h.jump(k);advance(.1);check(`Chapter Six alias ${k} → ${a}`,()=>assert.ok(S().phase&&A6.owns(S().phase)));}
 // ---- Continue: the checkpoints ----
 const labels=Object.keys(A6.LABEL);check(`Chapter Six: ${labels.length} checkpoints, each one a jump`,()=>{for(const id of labels)assert.ok(A6.SECTIONS.includes(id),id);});
 {const saved={};for(const sec of ['c6-meeting','c6-works','c6-emergency','c6-aftermath']){h.jump(sec);advance(.3);try{saved[sec]=JSON.parse(localStorage.getItem('lastlight.chapter1')||'null')?.section;}catch{saved[sec]=null;}}
  check('Chapter Six: reaching a checkpoint saves it for Continue (Sam’s garage, the works, the water, later)',()=>{for(const [k,v] of Object.entries(saved))assert.equal(v,k,k);});
  h.jump('c6-works');advance(.3);const sv=JSON.parse(localStorage.getItem('lastlight.chapter1')||'null')?.section;h.jump(sv);advance(.5);
  check('Chapter Six: Continue from a saved checkpoint comes back to that moment',()=>{assert.equal(S().phase,'e6-yard');assert.ok(A6.works.root.parent);});}
 // ---- a player who does nothing: every beat goes on by itself ----
 const idle={};
 const stand=(sec,done,max)=>{h.jump(sec);advance(.2);const t0=h.snapshot.clock;const ok=until(done,max);idle[sec]={ok,s:+(h.snapshot.clock-t0).toFixed(1),phase:S().phase};};
 stand('c6-room',()=>A6.C.flags.called,330);
 stand('c6-ride',()=>S().phase==='d6-meet',420);
 stand('c6-photos',()=>A6.C.meet?.stage==='jamie'||A6.C.flags.met,420);
 stand('c6-street',()=>S().phase==='d6-jamie',460);
 stand('c6-anomaly',()=>A6.C.anom?.reacted,200);
 stand('c6-creek',()=>S().phase==='d6-creek',320);
 stand('c6-records',()=>S().phase==='e6-yard',700);
 stand('c6-works',()=>S().phase==='e6-gallery',600);
 stand('c6-gallery',()=>S().phase==='e6-lower',300);
 stand('c6-lower',()=>S().phase==='e6-grille',400);
 stand('c6-grille',()=>S().phase==='n6-flood',200);
 stand('c6-emergency',()=>S().phase==='n6-hold',200);
 stand('c6-hold',()=>C6().samGone,200);
 stand('c6-sealed',()=>S().phase==='n6-rescue',260);
 stand('c6-rescue',()=>S().phase==='n6-after',400);
 stand('c6-aftermath',()=>h.snapshot.state==='ended',400);
 check('Chapter Six: a player who stands still is carried on through every beat (nothing waits for ever)',()=>{const bad=Object.entries(idle).filter(([,r])=>!r.ok);assert.deepEqual(bad,[],JSON.stringify(idle));});
 M6.idle=idle;
 // ---- the anomaly never needs your eyes: never looked at, Sam sees it, and it is gone ----
 {h.jump('c6-anomaly');advance(.2);const J=A6.JAM;until(()=>{const p=me();faceTo(p.x-(J.door.x-p.x),p.z-(J.door.z-p.z));return A6.C.anom?.gone;},120);
  check('Chapter Six: the double in Jamie’s house, never looked at: Sam sees it, and it is gone without you',()=>{assert.ok(A6.C.anom.gone);assert.equal(A6.C.anom.why,'Sam saw');assert.ok(!A6.C.flags.anomSeen);});}
 // ---- the gate: it holds you out when it is down; you can get under it when it is held; the water slows you ----
 {h.jump('c6-hold');advance(.5);const nav=h.nav,g=A6.WP(9,23);const open=nav.walkable(g.x,g.z);A6.works.GS.gap=.6;const shut=nav.walkable(g.x,g.z);A6.works.GS.gap=1.62;
  h.jump('c6-sealed');advance(.5);const sealed=nav.walkable(g.x,g.z);
  check('Chapter Six: 2B as a wall: under it at 1.6 m standing; not at 0.6 m; not when it is shut',()=>{assert.ok(open,'held open');assert.ok(!shut,'low');assert.ok(!sealed,'shut');});}
 {h.jump('c6-emergency');advance(.3);const w0=C6().water.J;until(()=>false,20);const w1=C6().water.J;
  check('Chapter Six: the water comes up in the junction chamber when the power goes',()=>assert.ok(w1>w0+.05,w0+' → '+w1));}
 // ---- every DEV scene of Chapter Six ----
 const dev={};for(const sc of DEV_SCENES[6]||[]){try{const ph=h.devScene(6,sc.id);advance(.5);dev[sc.id]={ok:true,phase:S().phase,owned:A6.owns(S().phase)||S().phase==='c6-black'};}catch(e){dev[sc.id]={ok:false,err:String(e).slice(0,300)};}}
 check(`Chapter Six: every DEV scene (${Object.keys(dev).length}) starts, in Chapter Six`,()=>{assert.ok(Object.keys(dev).length>=20);const bad=Object.entries(dev).filter(([,r])=>!r.ok||!r.owned);assert.deepEqual(bad,[]);});
 // ---- DEV start at Chapter Six: the same state as arriving from Chapter Five's end card; switching leaves nothing behind ----
 if(cap?.natural?.[6]){const {compare,far,strict}=await import('./dev-chapters-sim.mjs');const devAt=()=>{const ph=h.devStart(6);advance(1/30);return {ph,snap:h.dev.snapshot()};};
  const {ph,snap}=devAt(),d=compare(cap.natural[6],snap,6,.04).filter(x=>!/^(chapter6\.C\.(t|pt|h|minute|lastEvent|sounds)|chapter6\.state\.(t|h|clock|sounds|guard)|chapter5\.C\.(t|pt|h|minute|lastEvent)|chapter5\.state\.(t|h|clock|where\.(e|n))|game\.clock)/.test(x[0])),f=far(cap.natural[6],snap);
  check(`DEV start at Chapter Six (phase ${ph}): the same state as arriving from Chapter Five's end card (${d.length} differences)`,()=>{assert.deepEqual(d,[],JSON.stringify(d.slice(0,12)));assert.deepEqual(f,[]);});
  // (one field is left out: Chapter Four's downtown streetlight clock, which Start over does not reset and which is only
  // overwritten when Chapter Four runs; a start of Chapter Five re-runs Chapter Four's ending, a start of Chapter Six does
  // not. Chapter Six never reads it.)
  const dormant=x=>/^chapter4\.state\.presence\.clock$/.test(x[0]);
  const clean6=devAt().snap,sw=[];for(const n of [6,1,6,5,6,0,3,6]){const s2=(n===6?devAt().snap:(h.devStart(n),h.dev.snapshot()));if(n===6){const dd=strict(clean6,s2,6).filter(x=>!dormant(x));if(dd.length)sw.push({n,d:dd.slice(0,6)});}}
  check('DEV switching 6→1→6→5→6→0→3→6 in one session: every Chapter Six start identical to a clean one',()=>assert.deepEqual(sw,[],JSON.stringify(sw)));M6.dev={differences:d.length,switchingLeaks:sw.length};}
 // ---- the earlier chapters as they were: nothing of Chapter Six left in them ----
 const clean={};for(const sec of ['chapter5-start','c5-camp','c4-library','c3-tunnel-entrance','chapter2-start']){h.jump(sec);advance(.5);
  clean[sec]={works:!!A6.works.root.parent,storm:!!A6.storm.rain.parent,home:!!A6.home.root.parent&&A6.home.root.visible!==false,room:h.nav.room===A6.home.nav||h.nav.room===A6.works.nav,sky:+(h.skyMat.uniforms.storm?.value||0),phase:S().phase,owned:A6.owns(S().phase)};}
 check('Chapter Six: after it has run, the earlier chapters start exactly as before (no works, no storm, no room, no storm sky)',()=>{const bad=Object.entries(clean).filter(([,r])=>r.works||r.storm||r.home||r.room||r.sky>0||r.owned);assert.deepEqual(bad,[],JSON.stringify(clean));});
}
