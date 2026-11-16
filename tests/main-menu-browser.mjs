// The redesigned title screen and menus in Chromium (ANGLE SwiftShader software WebGL), driven by real keys and clicks.
//   node tests/main-menu-browser.mjs                 serves dist/ over HTTP
//   node tests/main-menu-browser.mjs <package.html>  the offline package, opened from disk (no network at all)
// QA_OUTPUT (default docs/qa/main-menu-redesign) receives the screenshots and report.json.
//
// Part A plays it like a person (no ?qa): the boot curtain, the title's reveal, "press any key", the menu by keyboard,
// Settings changed and found again after a reload, the credits roll, the confirmations, Quit, the DEV tab, M.
// Part B uses the ?qa hook to look inside: the menu's sound and the game's mix follow the sliders, Chapters starts a
// chapter at its beginning, Continue, the DEV selector, the pause menu by keyboard, settings in play, the title moods.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {pathToFileURL} from 'node:url';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const pkg=process.argv[2]?path.resolve(process.argv[2]):null,out=path.resolve(process.env.QA_OUTPUT||'docs/qa/main-menu-horror-revision/'+(pkg?'package':'browser'));fs.mkdirSync(out,{recursive:true});
let base,server=null;
if(pkg)base=pathToFileURL(pkg).href;
else{const root=path.resolve('dist');server=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/favicon.ico'){r.writeHead(204);return r.end();}const f=path.join(root,u==='/'?'index.html':u.replace(/^\//,''));
  if(!f.startsWith(root)){r.writeHead(403);return r.end();}try{const b=fs.readFileSync(f);r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/`;}
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const report={source:pkg?path.basename(pkg):'dist/ over HTTP',renderer:'Chromium / ANGLE SwiftShader (software)',checks:[],errors:[],requests:[],timings:{}};
const check=(name,ok,detail)=>{report.checks.push({name,ok:!!ok,...(detail!==undefined?{detail}:{})});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined&&!ok?' — '+JSON.stringify(detail):''));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function newPage(storage={}){const page=await browser.newPage({viewport:{width:1600,height:900}});
 page.on('pageerror',e=>report.errors.push('pageerror: '+e.message));page.on('crash',()=>report.errors.push('page crashed'));page.on('console',m=>{if(m.type()==='error')report.errors.push('console: '+m.text());});
 page.on('request',q=>{const u=q.url();if(/^https?:/.test(u)&&!u.startsWith(base))report.requests.push(u);});
 await page.addInitScript(s=>{if(!sessionStorage.getItem('ll-seeded')){localStorage.clear();for(const [k,v] of Object.entries(s))localStorage.setItem(k,v);sessionStorage.setItem('ll-seeded','1');}},storage);
 return page;}
const shot=(page,name)=>page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,timeout:120000}).catch(e=>report.errors.push('screenshot '+name+': '+e.message));
const vis=(page,sel)=>page.locator(sel).isVisible();
const focusId=page=>page.evaluate(()=>document.activeElement?.id||document.activeElement?.className||null);
const settings=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('lastlight.settings')||'{}'));
const body=page=>page.evaluate(()=>document.body.className);

try{
 // ================================= Part A: as a player ===========================================================
 {const page=await newPage();let t0=Date.now();
  // (recorded by the page itself the moment the document is ready: the first frame, which lifts the curtain, cannot have run yet)
  await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('boot');window.__bootSeen=document.body.classList.contains('booting')&&!!b&&getComputedStyle(b).visibility==='visible'&&getComputedStyle(b).opacity==='1';}));
  await page.goto(base,{timeout:300000,waitUntil:'domcontentloaded'});
  check('A1 boot curtain is shown while the world is built',await page.evaluate(()=>window.__bootSeen===true));
  await page.waitForFunction(()=>!document.body.classList.contains('booting'),null,{timeout:300000});report.timings.bootMs=Date.now()-t0;
  check('A1 the title reveals itself after the first frame (letterbox, no menu yet)',/splash/.test(await body(page))&&!(await vis(page,'#start')));
  await page.waitForFunction(()=>document.body.classList.contains('splash-ready'),null,{timeout:180000});await sleep(1500);await shot(page,'a01-press-any-key');
  check('A1 "Press any key" appears',await vis(page,'#press'));
  check('A1 fonts are the embedded ones (offline)',await page.evaluate(()=>document.fonts.check('300 40px "Cormorant Garamond"')&&document.fonts.check('600 12px Karla')));
  await page.keyboard.press('Enter');await sleep(2500);
  {const st=await vis(page,'#start'),bd=await body(page),pr=await vis(page,'#press');
   check('A2 a key opens the menu (and only opens it: nothing else starts)',st&&!/riding/.test(bd)&&!pr,{start:st,body:bd,press:pr});}
  check('A2 with no saved place, Continue is hidden and New Game has the focus',!(await vis(page,'#continue'))&&await focusId(page)==='start');
  check('A2 the sound came on with the key (header shows ON)',await page.locator('#sound').getAttribute('aria-pressed')==='true');
  await shot(page,'a02-menu');
  // keyboard to Settings
  await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');
  check('A3 arrows move the choice (New Game → Chapters → Settings)',await focusId(page)==='open-settings');
  await page.keyboard.press('Enter');await sleep(600);
  check('A3 Enter opens Settings over the title',await vis(page,'#settings')&&!(await vis(page,'#intro')));
  check('A3 Audio is the first section',await page.locator('#tab-audio').getAttribute('aria-selected')==='true');
  await page.keyboard.press('ArrowDown');check('A4 down from the tabs reaches Master volume',await focusId(page)==='set-volume');
  for(let i=0;i<4;i++)await page.keyboard.press('ArrowLeft');await sleep(300);
  const vol=await page.evaluate(()=>[document.getElementById('set-volume').value,document.querySelector('output[data-for="set-volume"]').textContent]);
  check('A4 left lowers the slider in steps and the readout follows',vol[0]==='0.8'&&vol[1]==='80%',vol);
  check('A4 and it is remembered at once',(await settings(page)).volume===0.8);
  await page.keyboard.press('Tab');check('A5 Tab moves to the next section (Display)',await page.locator('#tab-display').getAttribute('aria-selected')==='true'&&await vis(page,'#pane-display'));
  await page.click('label[for="set-grain"]');await sleep(200);check('A5 film grain off hides the grain',/no-grain/.test(await body(page))&&(await settings(page)).grain===false);
  await page.evaluate(()=>{const e=document.getElementById('set-brightness');e.value='1.2';e.dispatchEvent(new Event('input',{bubbles:true}));});
  check('A5 brightness brightens the picture',await page.evaluate(()=>document.getElementById('world').style.filter)==='brightness(1.2)');
  await page.keyboard.press('Tab');check('A5 then Controls, with the keys listed',await vis(page,'#pane-controls')&&await page.locator('.keymap dl div').count()>=18);
  await page.keyboard.press('Tab');check('A5 then Accessibility',await vis(page,'#pane-access'));
  await page.click('.seg[data-select="set-caption-size"] button[data-value="large"]');await sleep(150);
  check('A5 caption size Large applies',/cap-large/.test(await body(page))&&(await settings(page)).captionSize==='large');
  await page.click('label[for="set-motion"]');await sleep(150);check('A5 reduce motion applies',/reduce-motion/.test(await body(page))&&(await settings(page)).reduceMotion===true);
  await shot(page,'a05-settings-accessibility');
  await page.keyboard.press('Escape');await sleep(500);
  check('A6 Esc closes Settings back to the title, the choice where it was',await vis(page,'#intro')&&!(await vis(page,'#settings'))&&await focusId(page)==='open-settings');
  // Credits roll
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await sleep(400);
  check('A8 Credits open',await vis(page,'#credits'));
  check('A8 the credits name the third-party model and its licence',/Smily horror monster[\s\S]*Creative Commons Attribution 4\.0/.test(await page.locator('#credits').textContent()));
  await page.keyboard.press('Escape');await sleep(400);check('A8 Esc closes Credits',!(await vis(page,'#credits'))&&await vis(page,'#intro'));
  // Chapters, fresh: only the Prologue
  await page.click('#open-chapters');await sleep(500);
  const locked=await page.locator('#chapter-list button.locked').count(),all=await page.locator('#chapter-list button').count();
  check('A9 Chapters lists the Prologue to Aftermath I, nine not yet reached',all===10&&locked===9,{all,locked});
  await page.keyboard.press('ArrowDown');await sleep(300);
  check('A9 a chapter not yet reached says nothing about itself',/Not yet remembered/.test(await page.locator('#chapter-detail').textContent())&&!(await vis(page,'#chapter-begin')));
  await page.keyboard.press('Escape');await sleep(300);
  // Quit
  await page.click('#quit');await sleep(400);check('A10 Quit asks first',await vis(page,'#confirm')&&await focusId(page)==='confirm-no');
  await shot(page,'a10-quit-confirm');
  await page.keyboard.press('Enter');await sleep(300);check('A10 "Not yet" (the default) keeps you here',!(await vis(page,'#confirm'))&&await vis(page,'#intro'));
  await page.click('#quit');await sleep(300);await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');await sleep(800);
  check('A10 Goodnight: the farewell screen',await vis(page,'#farewell'));await shot(page,'a10-goodnight');
  await page.click('#farewell-back');await sleep(800);check('A10 and back to the title',!(await vis(page,'#farewell'))&&await vis(page,'#start'));
  // DEV
  check('A11 the DEV tools are folded behind a tab',!(await vis(page,'#dev-chapters'))&&await vis(page,'#dev-toggle'));
  await page.click('#dev-toggle');await sleep(200);check('A11 the DEV tab opens the scene selector, as before',await vis(page,'#dev-chapters')&&await vis(page,'#dev-start'));
  check('A11 and remembers that it is open',await page.evaluate(()=>JSON.parse(localStorage.getItem('lastlight.dev')||'{}').open===true));
  await shot(page,'a11-dev-open');await page.click('#dev-toggle');
  // M
  await page.keyboard.press('KeyM');await sleep(200);
  check('A13 M mutes, the header says so, and it is remembered',await page.locator('#sound').getAttribute('aria-pressed')==='false'&&(await settings(page)).muted===true);
  await page.keyboard.press('KeyM');await sleep(200);check('A13 M again unmutes',(await settings(page)).muted===false);
  // Reload: settings come back
  await page.reload({timeout:300000});await page.waitForFunction(()=>!document.body.classList.contains('booting'),null,{timeout:300000});
  await page.waitForFunction(()=>document.body.classList.contains('splash-ready'),null,{timeout:180000});await page.keyboard.press('Space');await sleep(1500);
  const s2=await settings(page),b2=await body(page);
  check('A7 after a reload every setting is as it was left',s2.volume===0.8&&s2.grain===false&&s2.captionSize==='large'&&s2.reduceMotion===true&&Math.abs(s2.brightness-1.2)<1e-9&&/no-grain/.test(b2)&&/cap-large/.test(b2)&&/reduce-motion/.test(b2),{s2,b2});
  await page.click('#open-settings');await sleep(400);
  check('A7 and the Settings screen shows them',await page.evaluate(()=>document.getElementById('set-volume').value)==='0.8');
  await page.click('#tab-access');await page.click('#settings-reset');await sleep(300);check('A7 Reset asks first',await vis(page,'#confirm'));
  await page.click('#confirm-yes');await sleep(400);const s3=await settings(page);
  check('A7 Reset puts every setting back',s3.volume===1&&s3.grain===true&&s3.captionSize==='medium'&&s3.reduceMotion===false&&s3.brightness===1&&!/no-grain|cap-large|reduce-motion/.test(await body(page)),s3);
  await page.keyboard.press('Escape');await page.close();}

 // A12: with a saved place
 {const page=await newPage({'lastlight.chapter1':JSON.stringify({section:'morning',at:Date.now()-3*3600e3})});
  await page.goto(base,{timeout:300000});await page.waitForFunction(()=>document.body.classList.contains('splash-ready'),null,{timeout:300000});
  await page.mouse.click(800,450);await sleep(2000);
  const where=await page.locator('#continue-where').textContent(),when=await page.locator('#continue-when').textContent();
  check('A12 Continue is offered first, with the chapter, the place and when',await vis(page,'#continue')&&await focusId(page)==='continue'&&/Chapter Two · The next morning/.test(where)&&/Saved/.test(when),{where,when});
  await shot(page,'a12-continue');
  await page.click('#start');await sleep(500);check('A12 New Game asks before replacing a saved place',await vis(page,'#confirm')&&/Chapter Two/.test(await page.locator('#confirm-text').textContent()));
  await page.keyboard.press('Escape');await sleep(300);check('A12 Esc answers "not yet"',!(await vis(page,'#confirm'))&&!/riding/.test(await body(page)));
  await page.click('#start');await sleep(300);await page.click('#confirm-yes');await sleep(2500);
  check('A12 "Begin again" starts the prologue (the title is gone)',/riding/.test(await body(page))&&!(await vis(page,'#intro')));
  await shot(page,'a12-new-game-started');await page.close();}

 // ================================= Part B: through the QA hook =====================================================
 {const page=await newPage({'lastlight.dev':JSON.stringify({unlockAll:true})});
  await page.goto(base+'?qa',{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});
  const ev=(fn,arg)=>page.evaluate(fn,arg);
  check('B1 automation: no splash, the menu is there at once, DEV open',await vis(page,'#start')&&await vis(page,'#dev-chapters'));
  check('B1 the title scene is up at the end of the street',await ev(()=>lastLight.titleScene.active&&lastLight.titleScene.state.bikes.length>=2));
  // the menu's sound
  await ev(()=>lastLight.menu.sound.unlock(lastLight.ui.settings));await sleep(1800);
  let st=await ev(()=>lastLight.menu.sound.state);check('B2 the menu sound starts (its own context, running)',st.running&&st.context==='running',st);
  {let rms=0,peak=0;await sleep(4000);for(let i=0;i<12;i++){const m=await ev(()=>lastLight.menu.sound.meter());rms=Math.max(rms,m?.rms||0);peak=Math.max(peak,m?.peak||0);await sleep(350);}
   await ev(()=>{lastLight.menu.sound.ui('confirm');lastLight.menu.sound.ui('open');});for(let i=0;i<4;i++){const m=await ev(()=>lastLight.menu.sound.meter());peak=Math.max(peak,m?.peak||0);await sleep(120);}
   report.menuSound={rms,peak};check('B2 the evening is audible and never clips (RMS and peak after the limiter)',rms>.002&&peak<.98,{rms,peak});}
  await ev(()=>{for(const [id,v] of [['set-volume','.5'],['set-music','.25'],['set-sfx','.6']]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}});await sleep(1500);
  st=await ev(()=>lastLight.menu.sound.state);check('B2 Master, Music and Effects reach the menu sound',Math.abs(st.levels.master-.575)<.03&&Math.abs(st.levels.music-.25)<.03&&Math.abs(st.levels.sfx-.6)<.03,st.levels);
  await ev(()=>{const e=document.getElementById('set-muted');e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(1200);
  st=await ev(()=>lastLight.menu.sound.state);check('B2 Mute silences it',st.levels.master<.01,st.levels);
  await ev(()=>{const e=document.getElementById('set-muted');e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}));});
  // into the game: the title steps aside, the game's mix follows the sliders
  await page.click('#start');await ev(()=>lastLight.step(.5));
  check('B9 New Game: the title scene has gone, the camera is back on the bike',await ev(()=>!lastLight.titleScene.active&&lastLight.camera.fov===64&&lastLight.state.state==='riding'));
  await sleep(800);st=await ev(()=>lastLight.menu.sound.state);check('B2 the menu sound fades away in play',!st.running,st);
  await ev(()=>{const e=document.getElementById('set-voice');e.value='.35';e.dispatchEvent(new Event('input',{bubbles:true}));});await sleep(1200);
  const mix=await ev(()=>({mix:lastLight.audio()?.mix,gains:lastLight.audio()?.mixGains}));
  check('B2 in play, Music / Effects / Voices set the game\'s own buses',mix.mix&&Math.abs(mix.mix.music-.25)<1e-6&&Math.abs(mix.mix.sfx-.6)<1e-6&&Math.abs(mix.mix.voice-.35)<1e-6&&mix.gains&&Math.abs(mix.gains.music-.25)<.03&&Math.abs(mix.gains.voice-.35)<.03,mix);
  // settings in play
  await ev(()=>{const e=document.getElementById('set-scale');e.value='.5';e.dispatchEvent(new Event('input',{bubbles:true}));});
  const pr=await ev(()=>lastLight.renderer.getPixelRatio());check('B7 resolution scale lowers the render resolution',pr<=.51,pr);
  await ev(()=>{const e=document.getElementById('set-scale');e.value='1';e.dispatchEvent(new Event('input',{bubbles:true}));});
  // the pause menu by keyboard
  await ev(()=>{lastLight.pause();});await sleep(300);check('B6 Esc-pause shows the pause menu',await vis(page,'#pause'));
  await page.keyboard.press('ArrowDown');check('B6 arrows move in the pause menu',await focusId(page)==='pause-settings');
  await page.keyboard.press('Enter');await sleep(300);check('B6 Enter opens Settings from the pause menu',await vis(page,'#settings')&&!(await vis(page,'#pause')));
  await page.keyboard.press('Escape');await sleep(300);check('B6 Esc returns to the pause menu',await vis(page,'#pause'));
  await shot(page,'b06-pause');
  await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');await sleep(300);check('B6 "Keep going" resumes',await ev(()=>lastLight.state.state==='riding')&&!(await vis(page,'#pause')));
  // back to the title: no splash, the title scene is back
  await ev(()=>{lastLight.toTitle();lastLight.step(.3);});
  check('B9 back to the title: the menu at once, the scene back at the oak',await vis(page,'#start')&&await ev(()=>lastLight.titleScene.active));
  // Chapters → Begin (unlocked by the DEV switch)
  await page.click('#open-chapters');await sleep(300);check('B3 with "unlock every chapter", all ten can be begun',await page.locator('#chapter-list button.locked').count()===0);
  await page.click('#chapter-list li:nth-child(4) button');await sleep(200);await shot(page,'b03-chapters-three');
  let t1=Date.now();await page.click('#chapter-begin');await page.waitForFunction(()=>!document.body.classList.contains('chapter-loading')&&lastLight.state.state!=='intro',null,{timeout:300000});report.timings.chapterThreeMs=Date.now()-t1;
  let ph=await ev(()=>lastLight.state.chapter?.phase);check('B3 Begin starts Chapter Three at its beginning (its black card)',/^c3-black$|^d3-/.test(ph),ph);
  check('B3 and the chapter is recorded as reached',await ev(()=>lastLight.progress.furthest()>=3));
  await ev(()=>lastLight.step(8));ph=await ev(()=>lastLight.state.chapter?.phase);check('B3 the chapter plays on from there',/^d3-|^c3-/.test(ph),ph);
  // Continue after a checkpoint
  await ev(()=>{lastLight.jump('alex-bedroom');lastLight.step(1);lastLight.toTitle();lastLight.step(.3);});
  const cw=await page.locator('#continue-where').textContent();check('B4 Continue shows the chapter and the place',await vis(page,'#continue')&&/Chapter Three · Alex’s room/.test(cw),cw);
  await page.click('#continue');await ev(()=>lastLight.step(1.5));check('B4 Continue returns there',await ev(()=>lastLight.state.chapter?.phase==='d3-room'));
  // DEV: START SCENE still works
  await ev(()=>{lastLight.toTitle();lastLight.step(.2);});
  await page.click('[data-dev-chapter="2"]');await page.selectOption('#dev-scene','morning');t1=Date.now();await page.click('#dev-start');
  await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});report.timings.devMorningMs=Date.now()-t1;await ev(()=>lastLight.step(1));
  check('B5 DEV → Chapter Two → Morning → START SCENE still starts the scene',await ev(()=>lastLight.state.chapter?.phase==='m-home'));
  // title moods
  await ev(()=>{lastLight.toTitle();lastLight.step(.2);});
  for(const m of ['search','after','summer']){await page.click(`[data-dev-mood="${m}"]`);await ev(()=>{lastLight.step(2);lastLight.render();});
   check(`B8 DEV title mood "${m}" changes the title`,await ev(m=>lastLight.titleScene.mood===m&&document.body.classList.contains('mood-'+m),m));if(m!=='summer'){await sleep(300);await shot(page,'b08-mood-'+m);}}
  await page.click('[data-dev-mood="auto"]');
  await page.close();}

 // ================================= Part C: the title art (the horror revision) =======================================
 {const page=await newPage({});
  await page.goto(base+'?qa',{timeout:300000});await page.waitForFunction(()=>window.lastLight&&lastLight.titleArt.active,null,{timeout:300000});
  const ev=(fn,arg)=>page.evaluate(fn,arg);
  check('C1 the title shows the title art (one full-screen draw: the 3D world is not drawn behind it), and the interface knows it',await ev(()=>lastLight.titleArt.active&&document.body.classList.contains('art-on')&&(r=>r&&r.calls===1&&r.triangles===2)(lastLight.render())));
  check('C1 its picture is the composited title art: the sky is drawn (not black) and the frame is not empty',await ev(()=>{lastLight.titleArt.update(4);lastLight.render();const c=document.getElementById('world'),g=document.createElement('canvas');g.width=64;g.height=36;const x=g.getContext('2d');x.drawImage(c,0,0,64,36);const d=x.getImageData(0,0,64,36).data;let sum=0,sky=0;for(let i=0;i<d.length;i+=4)sum+=d[i]+d[i+1]+d[i+2];for(let y=4;y<10;y++)for(let X=2;X<12;X++){const i=(y*64+X)*4;sky+=d[i]+d[i+1]+d[i+2];}return sum/(64*36*3)>12&&sky/(60*3)>20;}));
  check('C1 the title word is one heading, read as "Last Light"',await ev(()=>document.getElementById('title-word').getAttribute('aria-label')==='Last Light'));
  check('C1 no fireflies or dust drawn over the art (no points of light in its sky)',await ev(()=>{const c=document.getElementById('title-motes');const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i])return false;return true;}));
  for(const m of ['search','after','summer']){await page.click(`[data-dev-mood="${m}"]`);await page.waitForFunction(m=>lastLight.titleArt.active&&lastLight.titleArt.mood===m,m,{timeout:120000});
   await ev(()=>{lastLight.titleArt.update(3);lastLight.render();});check(`C2 mood "${m}": the art changes with it`,await ev(m=>lastLight.titleArt.mood===m&&document.body.classList.contains('mood-'+m),m));await shot(page,'c02-art-'+m);}
  await page.click('[data-dev-mood="auto"]');await page.waitForFunction(()=>lastLight.titleArt.active,null,{timeout:120000});
  // Memory effect (Settings → Display)
  await ev(()=>{lastLight.menu.open?.('settings');});await page.click('#open-settings').catch(()=>{});await sleep(300);await page.click('#tab-display');
  await page.click('.seg[data-select="set-memory"] button[data-value="off"]');await sleep(150);
  check('C3 Memory effect: Off removes the analog treatment from the picture',await ev(()=>lastLight.titleArt.memory==='off'&&lastLight.titleArt.uniforms.uMem.value===0&&lastLight.ui.settings.memoryEffect==='off'));
  await page.click('.seg[data-select="set-memory"] button[data-value="subtle"]');await sleep(150);
  check('C3 Memory effect: Subtle',await ev(()=>lastLight.titleArt.memory==='subtle'&&Math.abs(lastLight.titleArt.uniforms.uMem.value-.55)<1e-6));
  await page.click('.seg[data-select="set-memory"] button[data-value="standard"]');await sleep(150);
  check('C3 Memory effect: Standard, and it is remembered',await ev(()=>lastLight.titleArt.memory==='standard'&&JSON.parse(localStorage.getItem('lastlight.settings')).memoryEffect==='standard'));
  // Reduce motion stops the drift, the weave and the slips
  await page.click('#tab-access');await page.click('label[for="set-motion"]');await sleep(150);
  check('C4 Reduce motion: the art holds still (no drift, no weave, no slip)',await ev(()=>{const A=lastLight.titleArt,U=A.uniforms;A.update(5);A.trigger('slip');A.update(.4);return A.state.reduce&&U.uMotion.value===0&&U.uTime.value===0&&U.uPush.value===0&&U.uSlip.value===0;}));
  await page.click('label[for="set-motion"]');await sleep(150);
  check('C4 and back',await ev(()=>!lastLight.titleArt.state.reduce&&lastLight.titleArt.uniforms.uMotion.value===1));
  await page.keyboard.press('Escape');await sleep(300);
  // its events reach the title and the sound (and nothing is left behind)
  await ev(()=>lastLight.menu.sound.unlock(lastLight.ui.settings));await sleep(1500);
  await ev(()=>{lastLight.titleArt.trigger('absence');for(let i=0;i<6;i++){lastLight.titleArt.update(.1);lastLight.step(.1);}});
  check('C5 a bike goes: the picture swaps to the frame without it (its shadow stays) and one letter of the title fades',await ev(()=>lastLight.titleArt.state.patch===1&&document.querySelector('#title-word .tw-last b:nth-child(4)').classList.contains('tw-gone')));
  await shot(page,'c05-absence');
  await ev(()=>{for(let i=0;i<200&&lastLight.titleArt.state.patch!==0;i++){lastLight.titleArt.update(.1);lastLight.step(.1);}});
  check('C5 and it comes back, and so does the letter',await ev(()=>lastLight.titleArt.state.patch===0&&!document.querySelector('#title-word .tw-last b:nth-child(4)').classList.contains('tw-gone')));
  {const before=[];for(let i=0;i<8;i++){const m=await ev(()=>lastLight.menu.sound.meter());before.push(m?.rms||0);await sleep(250);}
   await ev(()=>{lastLight.titleArt.trigger('bell');});await sleep(800);
   await ev(()=>{for(let i=0;i<30;i++)lastLight.titleArt.update(.1);});await sleep(2400);
   const during=[];for(let i=0;i<6;i++){const m=await ev(()=>lastLight.menu.sound.meter());during.push(m?.rms||0);await sleep(200);}
   const b=Math.max(...before),d=Math.max(...during);report.menuSilence={before:b,during:d};
   check('C6 after the bell, the title goes silent (the sound drops to a whisper, then returns)',b>.002&&d<b*.35,{before:b,during:d});
   check('C6 the silence also dims the title word (no flash)',await ev(()=>document.body.classList.contains('tw-hush')));}
  await ev(()=>{lastLight.titleArt.trigger('erase');for(let i=0;i<40;i++){lastLight.titleArt.update(.1);lastLight.step(.1);}lastLight.render();});
  check('C7 a house comes apart into the haze (and a letter of LIGHT fades)',await ev(()=>lastLight.titleArt.state.erase>.5&&document.querySelector('#title-word .tw-light b:nth-child(4)').classList.contains('tw-gone')));await shot(page,'c07-erase');
  await ev(()=>{lastLight.titleArt.trigger('dark');for(let i=0;i<60;i++)lastLight.titleArt.update(.1);lastLight.render();});
  check('C7 darkness passes through the clouds',await ev(()=>lastLight.titleArt.state.dark>.2));
  // the sound with the art: present, never clipping, nothing sudden
  {let rms=0,peak=0;for(let i=0;i<16;i++){const m=await ev(()=>lastLight.menu.sound.meter());rms=Math.max(rms,m?.rms||0);peak=Math.max(peak,m?.peak||0);await sleep(300);}
   report.menuSoundArt={rms,peak};check('C8 the title sound (drone, air, resonance, notes) is audible and never clips',rms>.002&&peak<.98,{rms,peak});}
  check('C8 the old lamp flicker of the live title does not touch the title word over the art',await ev(()=>!document.querySelector('#intro .tw-light').classList.contains('out')));
  // into the game and back: the art steps aside and returns
  await page.click('#start');await ev(()=>lastLight.step(.5));
  check('C9 New Game: the title art is gone and the world is drawn again',await ev(()=>!lastLight.titleArt.active&&lastLight.state.state==='riding'&&!document.body.classList.contains('art-on')));
  await ev(()=>{lastLight.toTitle();lastLight.step(.2);});await page.waitForFunction(()=>lastLight.titleArt.active,null,{timeout:120000});await ev(()=>lastLight.step(.1));
  check('C9 back to the title: the art is back',await ev(()=>lastLight.titleArt.active&&document.body.classList.contains('art-on')));
  // DEV: the first redesign's live title remains, for comparison
  await page.click('#dev-live-title');await ev(()=>{lastLight.step(.2);lastLight.render();});
  check('C10 DEV "Live 3D title" shows the first redesign\'s live scene instead',await ev(()=>!lastLight.titleArt.active&&lastLight.titleScene.active&&!document.body.classList.contains('art-on')&&JSON.parse(localStorage.getItem('lastlight.dev')).liveTitle===true));
  await page.click('#dev-live-title');await page.waitForFunction(()=>lastLight.titleArt.active,null,{timeout:120000});
  check('C10 and off again: the art returns',await ev(()=>lastLight.titleArt.active));
  await page.close();}
 // the boot screen shows the art early (a small still, inline in the page)
 {const page=await newPage({'lastlight.titleMood':'search'});await page.goto(base,{timeout:300000,waitUntil:'domcontentloaded'});
  check('C11 the boot screen shows a still of the title art at once (the remembered mood)',await page.evaluate(()=>document.body.classList.contains('boot-search')&&/data:image\/webp/.test(getComputedStyle(document.querySelector('#boot .boot-art')).backgroundImage)));
  await page.close();}
}catch(e){report.errors.push('test: '+(e.stack||e.message));console.error(e);}
finally{report.passed=report.checks.filter(c=>c.ok).length;report.failed=report.checks.filter(c=>!c.ok).length;
 check('no JavaScript errors',report.errors.filter(e=>!/performance warning/.test(e)).length===0,report.errors.slice(0,5));
 if(pkg)check('the offline package makes no network requests',report.requests.length===0,report.requests.slice(0,5));
 report.passed=report.checks.filter(c=>c.ok).length;report.failed=report.checks.filter(c=>!c.ok).length;
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed,timings:report.timings}));
 await browser.close();server?.close();process.exit(report.failed?1:0);}
