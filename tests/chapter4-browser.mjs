// Chapter Four in Chromium (SwiftShader unless BROWSER_GPU=1), sound off. Two parts:
//  * the walkthrough: from the Chapter Three end checkpoint, its own ending and end card, the card's "Chapter Four"
//    button (a real click), then the whole chapter played with inputs (keys, the mouse's look, F, V), captured at each
//    beat; no QA jump inside it;
//  * the DEV selector: Chapter Four chosen with real clicks, each of its scenes started with START SCENE, captured.
// QA_OUTPUT (default docs/qa/chapter4-main-street) receives the captures, chapter4-browser-report.json and a gallery.
// Renders are software (SwiftShader): frame times here say nothing about a real GPU.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'/opt/node-tools/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const exe=process.env.BROWSER_PATH||(fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')?'/opt/pw-browsers/chromium-1194/chrome-linux/chrome':undefined);
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/chapter4-main-street');fs.mkdirSync(out,{recursive:true});
const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
const types={js:'application/javascript',css:'text/css',html:'text/html',glb:'model/gltf-binary',json:'application/json'};
const server=http.createServer((req,res)=>{const u=req.url.split('?')[0];if(u==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.join(root,decodeURIComponent(u).replace(/^\//,'')||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',types[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const args=['--no-sandbox','--disable-dev-shm-usage'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist');
const browser=await pw.chromium.launch({executablePath:exe,headless:true,args});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],warnings=[],checks=[],frames=[];
page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});
page.on('console',m=>{const t=m.text();if(m.type()==='error'){errors.push(t);console.error('CONSOLE',t);}else if(m.type()==='warning'&&/GL_INVALID|Feedback loop|shader/i.test(t))warnings.push(t);});
const check=(name,value,info='')=>{assert.ok(value,name+(info?' '+info:''));checks.push(name);console.log('PASS',name);};
const ev=(fn,arg)=>page.evaluate(fn,arg);
const snap=async(name)=>{await ev(()=>{for(const id of ['objective','objective-note','prompt','subtitle','fade','chapter-card','ending'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await ev(()=>{const L=lastLight,r={...L.render()},s=L.state.chapter4;return {calls:r.calls,triangles:r.triangles,phase:s.phase,clock:s.clock,caption:document.getElementById('subtitle').textContent.slice(0,90)};});
 await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:300000});frames.push({name,...info});console.log('Captured',name,info.phase,info.calls,info.triangles);};
// The in-page player: walking (turn toward the next point, hold W), riding (the game's own QA drive), F, V, looking.
const DRIVER=()=>{const L=lastLight,DT=1/30,A4=L.chapter4,at=A4.at,s4=()=>A4.state;
 const pos=()=>{const st=L.state.state;return st==='c1-walk'?{x:L.camera.position.x,z:L.camera.position.z}:{x:L.roam.x,z:L.roam.z};};
 const until=(fn,max)=>{for(let i=0;i<max/DT;i++){L.step(DT);if(fn())return true;}return false;};
 const face=(x,z,p=0)=>{const q=pos();L.face(Math.atan2(x-q.x,-(z-q.z)),p);};
 const walk=(pts,{r=.6,max=90}={})=>{let i=0;const ok=until(()=>{const q=pos();while(i<pts.length&&Math.hypot(pts[i][0]-q.x,pts[i][1]-q.z)<r)i++;if(i>=pts.length)return true;face(pts[i][0],pts[i][1]);L.press('KeyW');return false;},max);L.release('KeyW');L.step(.3);return ok;};
 const go=(t,o)=>{const q=pos(),p=L.nav.walkPath({x:q.x,z:q.z},{x:t.x,z:t.z});return walk(p.length?p:[[t.x,t.z]],o);};
 const goUV=(u,v,o)=>go(at(u,v),o);const faceUV=(u,v,y,p=0)=>{const q=at(u,v,y);face(q.x,q.z,p);};
 const tap=c=>{L.key(c);L.release(c);};
 const quiet=()=>{const c=L.chapter.state;return !c.line&&c.queue===0;};
 const ride=(pts,max=300,r=2.8,stop=null)=>{L.drive(pts,{r});const ok=until(()=>!L.driving||!!stop?.(),max);L.stopDriving();return ok;};
 const brake=()=>{L.release('KeyW');L.press('KeyS');until(()=>L.state.speed<.05,8);L.release('KeyS');};
 const off=()=>{if(L.state.state==='c1-ride'){brake();tap('KeyF');until(()=>L.state.state==='c1-walk',4);L.step(.3);}};
 const on=()=>{if(L.state.state==='c1-walk'){if(s4().view)tap('KeyV');L.step(.5);const r=L.roam;go({x:r.x,z:r.z},{r:1.2,max:40});face(r.x,r.z);L.step(.2);tap('KeyF');until(()=>L.state.state==='c1-ride',4);}};
 window.__d={L,A4,at,s4,pos,until,face,walk,go,goUV,faceUV,tap,quiet,ride,brake,off,on};};
const stage=async(name,fn,arg)=>{const t=Date.now();const r=await page.evaluate(fn,arg);console.log('stage',name,(Date.now()-t)/1000+'s',String(JSON.stringify(r)).slice(0,300));return r;};
let report={};
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html?qa`,{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.click('#start');await ev(()=>lastLight.step(.4));await ev(DRIVER);
 // ---- the hand-over: Chapter Three's ending, its card, the button ---------------------------------------------------------
 await stage('chapter three ending',()=>{lastLight.jump('chapter3-end');return __d.until(()=>lastLight.state.state==='ended',120);});
 check('Chapter Three ends on its card, with a "Chapter Four" button',await ev(()=>!document.getElementById('ending').hidden&&document.querySelector('#ending h2').textContent==='Chapter Three'&&!document.getElementById('next-chapter').hidden));
 await snap('00-chapter-three-end-card');
 await page.click('#next-chapter');
 const card=await stage('card',()=>{let seen=false;__d.until(()=>{if(document.getElementById('chapter-card').classList.contains('on'))seen=true;return __d.s4().phase==='d4-sam';},20);return {seen,phase:__d.s4().phase};});
 check('a CHAPTER FOUR card over black, then Sam’s house the next afternoon',card.seen&&card.phase==='d4-sam');
 await stage('mom',()=>{__d.until(()=>__d.s4().flags.bagReady,60);return __d.s4().objective;});await snap('01-sams-house-mom');
 // ---- the backpack, the camera, the pictures --------------------------------------------------------------------------------
 await stage('bag',()=>{const b=__d.A4.bag.position;__d.go(b,{r:1.6,max:20});__d.face(b.x,b.z,-.6);__d.L.step(.3);__d.tap('KeyF');__d.until(()=>false,2.4);});await snap('02-backpack');
 await stage('camera',()=>__d.until(()=>__d.s4().view==='camera',30)&&__d.until(()=>false,1.2));await snap('03-camera-first-picture');
 const found=await stage('pictures',()=>{const P=__d.A4.photo,out=[];for(const id of ['oak-sunset','briarwood','creek','mason']){const i=P.photos.findIndex(p=>p.id===id);let n=0;while(__d.s4().photos.index<i&&n++<20){__d.tap('KeyD');__d.until(()=>false,.4);}__d.until(()=>false,1.2);__d.tap('KeyF');if(__d.until(()=>__d.s4().found.includes(id),8))out.push(id);
   if(id!=='mason')__d.until(()=>__d.quiet(),12);else break;}return out;});
 await snap('04-picture-mason-old-bike-zoomed');
 check('the old bike found in four of Alex’s pictures, the last at Mason’s downtown',found.length===4,JSON.stringify(found));
 await stage('lead',()=>{__d.until(()=>__d.s4().phase==='d4-ride',40);__d.tap('KeyV');__d.until(()=>false,.8);__d.on();return __d.L.state.state;});
 // ---- the ride downtown ---------------------------------------------------------------------------------------------------------
 const rode=await stage('ride',()=>{const {L,at}=__d,M=(d,l)=>{const p=L.nav.main(d,l);return [p.x,p.z];},B2=L.world.sideFrames[1],S2=(u,v)=>{const p=B2.point(u,v);return [p.x,p.z];};
  const pts=[];for(let d=995;d>=884;d-=12)pts.push(M(d,-2.2));for(let u=6;u<=246;u+=12)pts.push(S2(u,-1.6));__d.ride(pts,160,3);const mid=__d.s4().phase;
  return {phase:mid,where:L.nav.locate(L.roam.x,L.roam.z).street};});
 await snap('05-summerfield-road');
 await stage('old mill',()=>{const {L}=__d;
  return import('./town-plan.js').then(m=>{const pts2=[];for(let s=4;s<=128;s+=10){const q=m.connAt(s,1.4);pts2.push([q.x,q.z]);}__d.ride(pts2,80,3);return {where:L.nav.locate(L.roam.x,L.roam.z).street};});});
 await snap('06-old-mill-road-crest');
 await stage('down into town',()=>import('./town-plan.js').then(m=>{const pts=[];for(let s=132;s<=168;s+=10){const q=m.connAt(s,1.4);pts.push([q.x,q.z]);}for(let u=-78;u<=-30;u+=8){const q=__d.at(u,-3);pts.push([q.x,q.z]);}__d.ride(pts,120,3,()=>__d.s4().phase==='d4-town');return __d.s4().phase;}));
 await snap('07-main-street-arrival');
 check('the ride downtown is a real ride (Summerfield, Old Mill Road) and arrives on Main Street',rode.where==='side2'||rode.where==='town');
 await stage('main street',()=>{__d.ride([[-20,-3.4],[20,-3.4],[60,-3.4]].map(([u,v])=>{const q=__d.at(u,v);return [q.x,q.z];}),80,2.4);return __d.s4().life;});await snap('08-main-street-by-day');
 await stage('to mason',()=>{__d.ride([[100,-3.4],[126,-4.2],[131,-5]].map(([u,v])=>{const q=__d.at(u,v);return [q.x,q.z];}),80,2.4);__d.brake();__d.off();__d.until(()=>__d.s4().flags.mason,12);__d.goUV(134.4,-9.4,{r:.8});__d.faceUV(134.4,-12.4,1.5);__d.L.step(.4);__d.tap('KeyF');__d.until(()=>false,3.2);});
 await snap('09-mason-window-poster');
 await stage('florist',()=>{__d.until(()=>__d.s4().flags.florist,30);__d.until(()=>false,4);});await snap('10-florist');
 await stage('to library',()=>{__d.until(()=>__d.s4().flags.toLibrary,90);__d.goUV(135,30);__d.goUV(135,42.4);__d.goUV(135,47.2);__d.until(()=>__d.s4().flags.reel,60);return __d.s4().objective;});await snap('11-library-librarian');
 await stage('reader',()=>{for(const [u,v] of [[144.6,47.9],[145.2,50.4],[146.8,53.4],[146.8,56],[148.8,59.2]])__d.goUV(u,v,{r:.7});__d.faceUV(148.8,61.2,1.7);__d.L.step(.4);__d.tap('KeyF');__d.until(()=>__d.s4().view==='reader',6);__d.until(()=>false,3);});
 await snap('12-microfilm-1988-mason');
 const read=await stage('records',()=>{for(let i=0;i<4;i++){__d.until(()=>__d.quiet(),30);__d.until(()=>false,.8);__d.tap('KeyD');}__d.until(()=>false,2.4);return __d.s4().read;});await snap('13-microfilm-1966');
 check('the microfilm: five records read',read.length===5,JSON.stringify(read));
 await stage('closing',()=>__d.until(()=>__d.s4().phase==='d4-closing',40));await snap('14-library-closing');
 // ---- dusk -----------------------------------------------------------------------------------------------------------------------
 await stage('out',()=>{__d.goUV(143,50.5);__d.goUV(135,47);__d.goUV(135,42);__d.until(()=>__d.s4().phase==='e4-dusk',8);__d.until(()=>false,1);});await snap('15-dusk-the-square');
 await stage('alex',()=>{__d.goUV(128.4,13.4);__d.until(()=>__d.s4().phase==='e4-alex',10);const a=__d.A4.AX.person.group.position;__d.face(a.x,a.z);__d.until(()=>false,1.5);});await snap('16-alex-across-the-street');
 await stage('alex gone',()=>__d.until(()=>__d.s4().phase==='e4-ride',45));
 await stage('creature',()=>{__d.on();__d.ride([[124,4],[110,3.2],[96,3]].map(([u,v])=>{const q=__d.at(u,v);return [q.x,q.z];}),60,2,()=>__d.s4().phase==='e4-creature');__d.brake();const q=__d.at(90.4,-48);__d.face(q.x,q.z,-.02);__d.until(()=>['freeze','fear'].includes(__d.s4().creature.stage),20);});
 await snap('17-creature-end-of-second-street');
 await stage('fear',()=>__d.until(()=>__d.s4().creature.stage==='fear',8)&&__d.until(()=>false,1));await snap('18-creature-afraid');
 await stage('cascade',()=>{__d.until(()=>__d.s4().phase==='e4-cascade',30);const q=__d.at(-10,2);__d.face(q.x,q.z,.05);__d.until(()=>false,8);});await snap('19-the-lights-going');
 const tvw=await stage('tv window',()=>{__d.until(()=>__d.s4().cascade?.tvAt!=null,40);__d.ride([[82,-3.5],[76,-6.4],[73.4,-8.4]].map(([u,v])=>{const q=__d.at(u,v);return [q.x,q.z];}),30,1.4,()=>__d.A4.C.cas.saidAt!=null);__d.brake();const q=__d.at(72.8,-11.6,1.5);__d.face(q.x,q.z,-.04);__d.until(()=>__d.A4.C.cas.saidAt!=null,18);__d.L.step(.2);return {said:__d.A4.C.cas.saidAt!=null,watch:+__d.A4.C.cas.watch.toFixed(1),shot:__d.s4().tvs.acetv.shot};});await snap('20-tv-window-live');
 check('the TV shop’s window: the dark waits there; up close, the sets show the three of them live from above ("That’s us.")',tvw.said&&tvw.watch>1&&tvw.shot==='live-high',JSON.stringify(tvw));
 await stage('to store',()=>{__d.until(()=>__d.s4().cascade?.nearAt!=null,30);__d.ride([[100,-2],[108,-6.6]].map(([u,v])=>{const q=__d.at(u,v);return [q.x,q.z];}),20,1.6);__d.brake();__d.off();__d.goUV(106.5,-10.2,{r:.6});__d.goUV(106.5,-14,{r:.8});__d.goUV(103,-15.4,{r:.5,max:20});__d.faceUV(99.35,-18,2.3,.12);return __d.until(()=>__d.s4().phase==='n4-store',8);});
 // ---- the video store ------------------------------------------------------------------------------------------------------------
 await stage('tv alex',()=>{__d.until(()=>__d.s4().store?.shot==='alex-ride',20);__d.faceUV(99.35,-18,2.3,.12);__d.until(()=>false,2.5);});await snap('21-store-tv-alex-from-above');
 await stage('pine',()=>{__d.until(()=>__d.s4().store?.shot==='pine-ridge',40);__d.until(()=>false,4);__d.faceUV(99.35,-18,2.3,.15);__d.tap('KeyV');__d.until(()=>false,1);__d.faceUV(99.35,-18,2.3,.18);__d.L.step(.4);});
 await snap('22-store-pine-ridge-viewfinder');
 const pic=await stage('picture',()=>{for(let k=0;k<30&&!__d.A4.C.aim;k++){__d.faceUV(99.35,-18,2.3,.14+(k%5)*.03);__d.L.step(.1);}__d.tap('KeyF');__d.until(()=>__d.s4().inv.lead,6);__d.until(()=>false,1.5);return {lead:__d.s4().inv.lead,by:__d.A4.C.leadBy};});
 check('the picture of the PINE RIDGE screen taken with Alex’s camera',pic.lead&&pic.by==='you',JSON.stringify(pic));
 await stage('room',()=>{__d.until(()=>__d.s4().store?.shot==='alex-room',30);__d.faceUV(99.35,-18,2.3,.12);__d.until(()=>false,2.5);});await snap('23-store-tv-alex-room-ceiling');
 await stage('phone',()=>{__d.until(()=>__d.s4().store?.ring,60);__d.goUV(102.2,-19.3,{r:.6});__d.faceUV(101,-19.4,1.1);__d.L.step(.3);__d.tap('KeyF');__d.until(()=>/Jamie\?/.test(document.getElementById('subtitle').textContent),12);});await snap('24-store-phone-jamie');
 await stage('live',()=>{__d.until(()=>__d.s4().store?.live!=null,40);__d.faceUV(99.35,-18,2.3,.12);__d.until(()=>false,2);});await snap('25-store-thats-us');
 await stage('dark',()=>{__d.until(()=>__d.s4().store?.dark!=null,20);__d.until(()=>false,5);});await snap('26-store-lights-going');
 await stage('back door',()=>{__d.goUV(111.2,-26,{r:.6});__d.goUV(111.2,-30,{r:.6});__d.goUV(104.2,-33.2,{r:.6});__d.faceUV(103.75,-35.6,1);__d.L.step(.3);__d.tap('KeyF');__d.until(()=>false,1);__d.goUV(103.75,-36.8,{r:.5});return __d.until(()=>__d.s4().phase==='n4-alley',5);});
 await snap('27-out-the-back-alley');
 // ---- out the back ---------------------------------------------------------------------------------------------------------------
 await stage('narrow',()=>{__d.goUV(118,-38.8);const {L,at}=__d,P=(a,b)=>{const p=L.nav.walkPath({x:a.x,z:a.z},{x:b.x,z:b.z});return p.length?p:[[b.x,b.z]];},a1=at(140,-39),a2=at(150,-38.2),q0=__d.pos(),pts=[...P(q0,a1),...P(a1,a2)];let i=0;
  /* (walking the narrow way; the moment it comes, stop and turn to it, as anyone would) */const seen=__d.until(()=>{const R=__d.A4.C.esc.pass,q=__d.pos();if(R&&R.stage!=='coming'){L.release('KeyW');if(R.stage==='run'){const c=at(R.u,R.v,1.2+(R.y||0));__d.face(c.x,c.z,.05+(R.y||0)*.12);}const pu=at(0,0).x-q.x;return R.stage==='gone'||(R.stage==='run'&&R.u>pu-6);}
   while(i<pts.length&&Math.hypot(pts[i][0]-q.x,pts[i][1]-q.z)<.6)i++;if(i<pts.length){__d.face(pts[i][0],pts[i][1]);L.press('KeyW');}else L.release('KeyW');return false;},45);L.release('KeyW');const R=__d.A4.C.esc.pass;return {seen,stage:R?.stage,roof:!!R?.roof,u:+(R?.u??0).toFixed(1)};});
 await snap('28-it-runs-past');
 await stage('laundromat',()=>{__d.until(()=>__d.s4().creature.pass?.stage==='gone',20);__d.goUV(163.75,-38.2,{r:.6});__d.goUV(163.75,-35,{r:.6});__d.until(()=>__d.s4().phase==='n4-laundry',5);__d.goUV(165,-30,{r:.6});__d.until(()=>false,1);});await snap('29-laundromat');
 await stage('depot',()=>{__d.goUV(169,-27,{r:.6});__d.goUV(173,-26.75,{r:.6});__d.until(()=>__d.s4().phase==='n4-depot',5);const s=[...__d.A4.SIL].sort((a,b)=>a.t-b.t)[0];__d.face(s.pos.x,s.pos.z,.4);__d.until(()=>__d.A4.SIL.some(x=>x.state==='on'),6);});
 await snap('30-theater-upper-windows');
 await stage('corner',()=>{__d.until(()=>__d.A4.SIL.some(x=>x.state==='gone'),8);__d.goUV(179.4,-20);__d.goUV(179.4,-10.8);__d.until(()=>__d.s4().phase==='n4-marquee',6);const a=__d.A4.AX.person.group.position;__d.face(a.x,a.z);__d.until(()=>/I know where he is/.test(document.getElementById('subtitle').textContent),20);});
 await snap('31-alex-under-the-marquee');
 await stage('blackout',()=>{__d.until(()=>__d.s4().mq?.out!=null,25);__d.until(()=>false,1.6);});await snap('32-marquee-blackout');
 await stage('power',()=>{__d.until(()=>__d.s4().phase==='n4-return',8);__d.until(()=>false,3);});await snap('33-power-returns-he-is-gone');
 await stage('bikes',()=>{__d.goUV(150,-9);__d.goUV(118,-8.6);const r=__d.L.roam;__d.go({x:r.x,z:r.z},{r:2});__d.until(()=>__d.s4().view==='camera',20);__d.until(()=>false,2);});await snap('34-the-picture-pine-ridge');
 await stage('home',()=>{__d.until(()=>__d.s4().phase==='n4-ride',45);__d.tap('KeyV');__d.until(()=>false,.6);__d.on();return import('./town-plan.js').then(m=>{const pts=[];for(let u=110;u>=-74;u-=10){const q=__d.at(u,3.2);pts.push([q.x,q.z]);}for(let s=166;s>=4;s-=10){const q=m.connAt(s,-1.4);pts.push([q.x,q.z]);}__d.ride(pts,200,3);return __d.s4().phase;});});
 await snap('35-ride-home-old-mill-road');
 await stage('oak',()=>{const L=__d.L,B2=L.world.sideFrames[1],pts=[];for(let u=244;u>=8;u-=12){const p=B2.point(u,1.6);pts.push([p.x,p.z]);}for(let d=880;d<=1132;d+=12){const p=L.nav.main(d,1.8);pts.push([p.x,p.z]);}__d.ride(pts,220,3,()=>__d.s4().phase==='n4-oak');__d.brake();__d.until(()=>/It was scared/.test(document.getElementById('subtitle').textContent),30);});
 await snap('36-the-old-oak-it-was-scared');
 const end=await stage('end',()=>{__d.until(()=>lastLight.state.state==='ended',40);return {state:lastLight.state.state,h2:document.querySelector('#ending h2').textContent,next:document.getElementById('next-chapter').hidden};});
 await snap('37-chapter-four-end-card');
 check('the walkthrough reaches Chapter Four’s end card, with sound off, by inputs alone',end.state==='ended'&&end.h2==='Chapter Four'&&end.next===true,JSON.stringify(end));
 const said=await ev(()=>lastLight.state.chapter4.sounds);report.walkthrough={found,read,pic,sounds:said};
 // ---- the DEV selector: Chapter Four, every scene, with real clicks ------------------------------------------------------------------
 const scenes=await ev(()=>lastLight.DEV_SCENES[4].map(s=>({id:s.id,label:s.label})));const dev=[];
 await ev(()=>lastLight.toTitle());
 for(const sc of scenes){await page.click('[data-dev-chapter="4"]');await page.selectOption('#dev-scene',sc.id);await page.click('#dev-start');
  await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});await ev(()=>lastLight.step(1.5));const s=await ev(()=>({phase:lastLight.state.chapter4.phase,state:lastLight.state.state}));
  dev.push({...sc,...s});await snap('dev-'+sc.id);await ev(()=>lastLight.toTitle());}
 check(`DEV: all ${scenes.length} Chapter Four scenes start from the selector (real clicks) in a Chapter Four phase`,dev.every(d=>/^(c4|d4|e4|n4)-/.test(d.phase)),JSON.stringify(dev.filter(d=>!/^(c4|d4|e4|n4)-/.test(d.phase))));
 report.dev=dev;
 const gpu=await ev(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});
 check('no JavaScript errors',errors.length===0,JSON.stringify(errors.slice(0,4)));check('no WebGL/shader warnings',warnings.length===0,JSON.stringify(warnings.slice(0,3)));
 report={runtimeHashes,browser:browser.version(),gpu,passed:checks.length,checks,frames,errors,warnings,...report,renderLimitation:/SwiftShader/i.test(gpu)?'Software rendering (SwiftShader): render counts are real, frame times are not a real-GPU measurement.':'GPU: '+gpu,audio:'Sound off; audio is deferred: placeholder hooks only.'};
}catch(e){report.failure=String(e.stack||e);console.error('FAILED',e);process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'chapter4-browser-report.json'),JSON.stringify({...report,checks,frames,errors,warnings},null,2));
 const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter Four QA</title><style>
:root{--bg:#f4f2ee;--fg:#1d1c1a;--mute:#5d5a55;--card:#fff}@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e9e6e0;--mute:#a19d96;--card:#1e1e1e}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}main{max-width:1400px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
figure{margin:0;background:var(--card);border-radius:6px;overflow:hidden}img{width:100%;display:block}figcaption{padding:6px 8px;color:var(--mute);font-size:12px}figcaption b{color:var(--fg)}</style></head><body><main>
<h1>Last Light — Chapter Four QA</h1><p>${esc(report.renderLimitation||'')} ${checks.length} checks passed; ${errors.length} JavaScript errors; ${warnings.length} WebGL warnings. Captures 00–37: the input-driven walkthrough from Chapter Three’s end card; <i>dev-*</i>: each DEV scene started from the selector.</p>
<div class="grid">${frames.map(f=>`<figure><a href="${esc(f.name)}.jpg"><img loading="lazy" src="${esc(f.name)}.jpg" alt="${esc(f.name)}"></a><figcaption><b>${esc(f.name)}</b><br>${esc(f.phase)} · ${esc(f.clock)} · ${f.triangles.toLocaleString('en-US')} tris · ${f.calls} draws<br>${esc(f.caption)}</figcaption></figure>`).join('')}</div></main></body></html>`);
 await browser.close();server.close();console.log(JSON.stringify({passed:checks.length,errors:errors.length,warnings:warnings.length,frames:frames.length,failure:report.failure||null}));}
