// Chapter Six (Someone Was Here): played from Chapter Five's end card to Chapter Six's, with inputs only (walking, riding,
// F on what the prompt offers, V and the camera's keys, looking), plus the chapter's own checks. Used by verify.mjs
// (ONLY=chapter6, and the full run) and by chapter6-browser.mjs (the same playthrough in Chromium, a segment per call).
import assert from 'node:assert/strict';
import {chapterThreeTools} from './chapter3-sim.mjs';

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
 const onBike=()=>{if(h.night.state==='c1-walk'){const r=h.night.roam;go({x:r.x,z:r.z},{r:1.2,max:40});faceTo(r.x,r.z);wait(.2);tap('KeyF');until(()=>h.night.state==='c1-ride',4);}};
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
   for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ii=i+a,jj=j+b,k=key(ii,jj);if(ii<0||jj<0||ii>nx||jj>nz||prev.has(k))continue;const w=P(ii,jj);if(!ok(w.x,w.z))continue;prev.set(k,[i,j]);q.push([ii,jj]);}}
  const tail=end||best;if(!tail)return [];const pts=[];for(let c=tail;c;c=prev.get(key(c[0],c[1])))pts.unshift(P(c[0],c[1]));
  // (smoothed: the farthest point still in a straight clear line)
  const clear=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.1);for(let k=1;k<=n;k++)if(!ok(a.x+(b.x-a.x)*k/n,a.z+(b.z-a.z)*k/n))return false;return true;};
  const out=[];for(let i=0;i<pts.length-1;){let j=pts.length-1;while(j>i+1&&!clear(pts[i],pts[j]))j--;out.push([pts[j].x,pts[j].z]);i=j;}return out;}
 const approach=(q,r=.9,o={})=>{const path=route(q,r);if(!path.length)return Math.hypot(me().x-q.x,me().z-q.z)<=r+.3;return walkTo(path,{r:.07,max:40,...o});};
 return {...X,T,A6,C6,S,K,WP,W6,along,faceV,M,quiet,spot,act,boys,gap,offBike,onBike,rideTo,walkLine,route,approach};
}

// segments, in order (from= starts at one by its jump; to= stops after one; cont= goes on from where the last call stopped)
export const SEG6=['morning','meeting','streets','records','works','below','flood','after'];
const JUMP6={morning:'chapter6-start',meeting:'c6-ride',streets:'c6-oak',records:'c6-records',works:'c6-works',below:'c6-lower',flood:'c6-emergency',after:'c6-sealed'};

export function playChapterSix(T,label,{fromCard=true,dev=false,from=null,to=null,cont=false,entered=false,looks=true}={}){
 const {h,press,release,tap,check,element,metrics}=T,X=chapterSixTools(T),{A6,C6,S,K,WP,W6,faceV,M,quiet,spot,act,boys,gap,offBike,onBike,rideTo,walkLine,route,approach,log,until,wait,me,faceTo,walkTo,go}=X;
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
 const note=(...a)=>{if(process.env.TRACE6){const p=me();console.log('['+(clock0()-t0).toFixed(1)+'s '+ph()+' '+p.x.toFixed(1)+','+p.z.toFixed(1)+']',...a);}};

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
  note('up');if(looks){near(HS.window,1.3);note('window');if(lookF(HS.window,'c6-window'))U(()=>A6.C.view===null&&quiet(),15);near(HS.cork,1.2);note('cork');if(lookF(HS.cork,'c6-cork'))U(()=>A6.C.view===null&&quiet(),15);}
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
 return {watch,said,lines};
}

export async function runChapterSixChecks(T){const {h,check}=T;void h;void check;}
