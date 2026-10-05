// TEMPORARY (private playtest build): the developer chapter selector in Chromium (SwiftShader unless
// BROWSER_GPU=1). Real clicks on the title's DEV buttons; each start compared with the state the simulation
// recorded while playing into that chapter naturally (docs/qa/dev-chapters/natural-snapshots.json, written by
// `DEV_NATURAL_OUT=… ONLY=dev node tests/verify.mjs`), with the same normalization and documented exceptions
// (tests/dev-chapters-sim.mjs). Then switching chapters repeatedly in one page through the pause menu's
// "Back to the title", the selector in normal (non-QA) mode, and Chapter Three played from the DEV start to
// its end card with inputs (no QA jump). QA_OUTPUT (default docs/qa/dev-chapters) receives captures and
// dev-chapters-browser-report.json.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
import {compare,far,strict,NEAR,OPENING_TIME_TOL} from './dev-chapters-sim.mjs';
import {runChapterThreeBrowser} from './chapter3-browser.mjs';
const require=createRequire(import.meta.url);let pw;try{pw=require('playwright');}catch{pw=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');}
const root=path.resolve('dist'),out=path.resolve(process.env.QA_OUTPUT||'docs/qa/dev-chapters');fs.mkdirSync(out,{recursive:true});
const NAT=JSON.parse(fs.readFileSync(path.resolve(process.env.DEV_NATURAL||'docs/qa/dev-chapters/natural-snapshots.json'),'utf8'));
const runtimeHashes=Object.fromEntries(fs.readdirSync(root).sort().filter(n=>fs.statSync(path.join(root,n)).isFile()).map(n=>['dist/'+n,createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')]));
const server=http.createServer((req,res)=>{if(req.url.split('?')[0]==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=q=>`http://127.0.0.1:${server.address().port}/index.html${q}`;
const args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'];if(!process.env.BROWSER_GPU)args.push('--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--single-process','--no-zygote','--in-process-gpu');
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args});
const errors=[],checks=[],frames=[],report={timings:{},starts:{},switching:null};
const check=(name,value,detail)=>{if(!value)console.error('FAIL',name,detail?JSON.stringify(detail).slice(0,1500):'');assert.ok(value,name+(detail?' '+JSON.stringify(detail).slice(0,1500):''));checks.push(name);console.log('PASS',name);};
// One tab (a single-process browser ends with its last tab); every "fresh page" is a new load of the game.
const tab=await browser.newPage({viewport:{width:1440,height:900}});
tab.on('pageerror',e=>{errors.push(String(e));console.error('PAGE',String(e));});tab.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE',m.text());}});
async function openPage(q='?qa'){const page=tab;await page.goto('about:blank');
 await page.goto(url(q));if(q.includes('qa'))await page.waitForFunction(()=>window.lastLight);else await page.waitForSelector('#start');return page;}
const snapOf=page=>page.evaluate(()=>lastLight.dev.snapshot());
const shot=async(page,name)=>{await page.evaluate(()=>{for(const id of ['title-card','objective','objective-note','ending','prompt','subtitle','reflection','fade','chapter-card'])for(const a of document.getElementById(id)?.getAnimations()||[])try{a.finish();}catch{}});
 const info=await page.evaluate(()=>{const L=lastLight,r={...L.render()};return {...r,phase:L.state.chapter.phase};});await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86});frames.push({name,...info});};
// A real click on a DEV button (the title must be showing), timed.
async function clickDev(page,n){check(`title shows the DEV selector before choosing ${n}`,await page.locator('#dev-chapters').isVisible());
 const t0=Date.now();await page.click(`[data-dev-chapter="${n}"]`);
 // The button shows "Preparing …" while the hand-over runs, then the chapter begins.
 const shown=await page.evaluate(()=>document.getElementById('dev-status')?.textContent||'');
 await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:120000});const ms=Date.now()-t0;
 if(!clickDev.saw&&shown){clickDev.saw=true;check(`the DEV button shows "${shown}" while it prepares`,/^Preparing /.test(shown));}return ms;}
async function backToTitle(page){await page.evaluate(()=>{if(document.pointerLockElement)document.exitPointerLock();});await page.keyboard.press('Escape');
 if(!(await page.locator('#pause').isVisible()))await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'})));
 check('Esc opens the pause menu (with "Back to the title")',await page.locator('#pause').isVisible()&&await page.locator('#to-title').isVisible());
 await page.click('#to-title');check('"Back to the title" shows the title with the DEV selector again',await page.locator('#intro').isVisible()&&await page.locator('#dev-chapters').isVisible());}
const EXPECT={0:{phase:'off',state:'riding'},1:{phase:'leave'},2:{phase:'c2-black'},3:{phase:'c3-black'}};
const step=(page,sec)=>page.evaluate(s=>lastLight.step(s),sec);
const openScene=page=>page.evaluate(()=>{const ph=lastLight.state.chapter.phase;let n=0;while(lastLight.state.chapter.phase===ph&&n++<900)lastLight.step(1/30);const s=lastLight.dev.snapshot();s.phase=lastLight.state.chapter.phase;return s;});
try{
 // ---- the selector on the title; hidden during play --------------------------------------------------------
 {const page=await openPage();
  check('the title shows the DEV · PLAYTEST ONLY selector with Prologue, Chapter One, Two and Three',await page.locator('#dev-chapters').isVisible()&&(await page.locator('#dev-chapters .dev-title').textContent()).includes('DEV')&&
   JSON.stringify(await page.locator('[data-dev-chapter]').allTextContents())===JSON.stringify(['Prologue','Chapter One','Chapter Two','Chapter Three']));
  await shot(page,'dev-00-title-selector');
  await page.click('#start');await page.waitForTimeout(150);report.startLock=await page.evaluate(()=>!!document.pointerLockElement);await step(page,.4);
  check('normal Start: the prologue begins; the DEV selector is not shown during play',(await page.evaluate(()=>lastLight.state.state))==='riding'&&!(await page.locator('#dev-chapters').isVisible()));
  }
 // ---- each chapter from a fresh page: compared with the natural arrival ----------------------------------------
 const clean={};
 for(const n of [0,1,2,3]){const page=await openPage();const ms=await clickDev(page,n);report.timings[n]=ms;
  let s;if(n===0){await step(page,1/30);s=await snapOf(page);}else s=await snapOf(page);
  await page.waitForTimeout(150);const lock=await page.evaluate(()=>!!document.pointerLockElement);
  check(`DEV ${n}: mouse look is captured the same way as the title's start button (pointer lock ${lock?'granted':'not granted'}, as for Start)`,lock===report.startLock);
  const st=await page.evaluate(()=>({state:lastLight.state.state,phase:lastLight.state.chapter.phase,intro:!document.getElementById('intro').hidden,pause:!document.getElementById('pause').hidden}));
  check(`DEV ${n}: a real click starts at the true beginning (phase ${EXPECT[n].phase}), title and pause closed (${ms} ms)`,st.phase===EXPECT[n].phase&&!st.intro&&!st.pause&&(n?true:st.state==='riding'),st);
  const nat=NAT.natural[n],d=compare(nat,s,n),f=far(nat,s);report.starts[n]={phase:st.phase,ms,differences:d,far:f};
  check(`DEV ${n}: the same state as the natural arrival recorded in the simulation (flags, objective, date, lighting, companions, people, police, props, doors, flashlight, save; ${d.length} differences)`,d.length===0,d.slice(0,15));
  check(`DEV ${n}: player and companions where a natural arrival leaves them (within ${NEAR} m)`,f.length===0,f);
  // The spot, the light and who is there, spelled out for the record.
  report.starts[n].summary={player:s.player.roam,night:s.world.sky.night,day:s.world.sky.day,objective:s.ui.objective,date:s.ui.date,companions:s.companions.map(c=>({key:c.key,active:c.active,mode:c.mode,visible:c.visible})),foot:s.player.foot,save:s.save};
  clean[n]=s;
  if(n>=2){const o=await openScene(page),d2=compare(NAT.opened[n],o,n,OPENING_TIME_TOL);report.starts[n].opening={phase:o.phase,differences:d2};
   check(`DEV ${n}: the opening scene after the card (${o.phase}) matches the natural one (${d2.length} differences)`,o.phase===NAT.opened[n].phase&&d2.length===0&&far(NAT.opened[n],o).length===0,d2.slice(0,15));
   await page.evaluate(()=>lastLight.step(3));}
  else if(n===1)await page.evaluate(()=>lastLight.step(2));else await page.evaluate(()=>lastLight.step(2));
  await shot(page,`dev-0${n+1}-start-chapter-${n}`);
  }
 // ---- switching in one page, through the pause menu: 3 → 1 → 2 → 3 (and on), playing a little each time -----
 {const page=await openPage(),order=[3,1,2,3,0,2],leaks=[];let first=true;
  for(const n of order){if(!first)await backToTitle(page);first=false;await clickDev(page,n);let s;if(n===0){await step(page,1/30);s=await snapOf(page);}else s=await snapOf(page);
   const d=strict(clean[n],s,n);if(d.length)leaks.push({n,d:d.slice(0,10)});
   // Play on for a while, so the next switch has something to clear: Chapter Three far enough for its first
   // dialogue and objective.
   await step(page,n===3?25:12);}
  report.switching={order:order.join('→'),leaks};
  check(`DEV switching ${order.join('→')} in one page via pause → Back to the title: every start identical to a clean start (no leaks)`,leaks.length===0,leaks);
  // After the night's horror beats have been running (QA jumps used here only to make the noise), a switch is clean.
  await page.evaluate(()=>{lastLight.jump('close-bell');lastLight.step(8);});const busy=await page.evaluate(()=>({phase:lastLight.state.chapter.phase,tension:lastLight.tension?.state?.value}));
  await backToTitle(page);await clickDev(page,1);const d1=strict(clean[1],await snapOf(page),1);
  check(`DEV start after Chapter Three's close bell (phase ${busy.phase}, tension ${busy.tension}): Chapter One starts clean`,d1.length===0,d1.slice(0,10));
  const audio=await page.evaluate(()=>({tension:lastLight.tension?.state?.value??0,heart:lastLight.tension?.state?.gain??0,caption:document.getElementById('subtitle')?.textContent||''}));
  check('…no tension or heartbeat carried over',audio.tension===0&&audio.heart===0,audio);
  }
 // ---- normal (non-QA) mode: the selector works for a player ----------------------------------------------------
 {const page=await openPage('');await page.waitForTimeout(500);
  const t0=Date.now();await page.click('[data-dev-chapter="3"]');const ms=Date.now()-t0;report.timings.normalMode3=ms;
  await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:120000});report.timings.normalMode3=Date.now()-t0;
  await page.waitForFunction(()=>document.querySelector('#chapter-card.on h2')?.textContent==='Chapter Three',null,{timeout:60000});
  check(`normal mode: DEV Chapter Three shows the CHAPTER THREE card over black (${Date.now()-t0} ms after the click), title hidden, not paused`,await page.locator('#intro').isHidden()&&await page.locator('#pause').isHidden());
  // (Real time under software rendering runs at about one frame a second here, so the scene itself is
  // played in QA stepping below; this only shows the button works for a player.)
  await page.screenshot({path:path.join(out,'dev-05-normal-mode-chapter-three.jpg'),type:'jpeg',quality:86});
  }
 // ---- Chapter Three, from the DEV start, played to its end card with inputs (no QA jump) --------------------------
 {const page=await openPage();await clickDev(page,3);
  const state=()=>page.evaluate(()=>lastLight.state);
  const snap=async name=>{await shot(page,name);};
  const run=await runChapterThreeBrowser({page,snap,check,state,errors,tag:'dev-c3'});report.chapterThree=run;
  }
 check('no JavaScript or shader errors',errors.length===0,errors);
 const gpu=await (async()=>{const page=await openPage();const g=await page.evaluate(()=>{const gl=lastLight.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable';});return g;})();
 fs.writeFileSync(path.join(out,'dev-chapters-browser-report.json'),JSON.stringify({runtimeHashes,browser:browser.version(),gpu,passed:checks.length,checks,frames,...report,errors},null,1));
 console.log(JSON.stringify({passed:checks.length,errors:errors.length,timings:report.timings,gpu},null,1));
}catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();server.close();}
