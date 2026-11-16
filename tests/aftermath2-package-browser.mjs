// The offline complete-game package (tools/package-playtest.mjs with PLAYTEST_CHAPTER=final), opened from disk in Chromium
// (SwiftShader): the real DEV controls start Aftermath II (from Aftermath I's end card); its later sections start from their
// jumps, each in an Aftermath II phase; its end card offers the coda; the coda reaches the title on the monitor; the credits
// reach the end screen; no HTTP(S) requests and no JavaScript errors. Usage:
//   node tests/aftermath2-package-browser.mjs <package>/Last-Light-Complete-Playtest.html [report.json]
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]||'docs/qa/aftermath2/package-browser-report.json');fs.mkdirSync(path.dirname(out),{recursive:true});
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[],requests=[],checks=[],r={file:path.basename(file),htmlSHA256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),htmlBytes:fs.statSync(file).size,renderer:'Chromium / ANGLE SwiftShader software'};
page.on('pageerror',e=>errors.push(String(e)));page.on('crash',()=>errors.push('page crashed'));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('request',q=>{if(/^https?:/.test(q.url()))requests.push(q.url());});
const ok=(name,v)=>{if(!v)throw Error(name);checks.push(name);};
try{await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
 await page.goto(pathToFileURL(file).href+'?qa',{timeout:240000});await page.waitForFunction(()=>window.lastLight,null,{timeout:240000});
 // Aftermath II through the title screen's own DEV controls (its first entry starts it the way Aftermath I's end card does)
 await page.click('[data-dev-chapter="10"]');await page.selectOption('#dev-scene','aftermath2');await page.click('#dev-start',{timeout:300000});
 await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});
 await page.evaluate(()=>{for(let i=0;i<300;i++)lastLight.step(1/30);lastLight.render();});
 r.start=await page.evaluate(()=>({phase:lastLight.aftermath2.state.phase,date:document.getElementById('date')?.textContent||'',width:lastLight.renderer.domElement.width}));
 ok('Local file enters Aftermath II through the real DEV controls (from Aftermath I’s end card)',/^a2-/.test(r.start.phase)&&/AUGUST 27, 2021/.test(r.start.date));ok('WebGL renders',r.start.width>0);
 await page.screenshot({path:out.replace(/\.json$/,'-start.jpg'),type:'jpeg',quality:86,timeout:300000});
 r.scenes={};for(const s of ['a2-street','a2-sam','a2-walk','a2-alex','a2-jamie','a2-summerfield','a2-streetlight','a2-trench','a2-oak','a2-children','a2-leave']){r.scenes[s]=await page.evaluate(s=>{const L=lastLight;L.jump(s);for(let i=0;i<90;i++)L.step(1/30);L.render();return L.aftermath2.state.phase;},s);}
 ok('Later sections start from their jumps',Object.values(r.scenes).every(p=>/^a2-/.test(p)));
 await page.screenshot({path:out.replace(/\.json$/,'-later.jpg'),type:'jpeg',quality:86,timeout:300000});
 r.end=await page.evaluate(()=>{const L=lastLight;L.jump('aftermath2-end');for(let i=0;i<240;i++)L.step(1/30);L.render();const e=document.getElementById('ending'),n=document.getElementById('next-chapter');return {hidden:e?.hidden,text:(e?.textContent||'').replace(/\s+/g,' ').trim().slice(0,160),next:n?.hidden===false?(n.textContent||'').trim():null};});
 ok('Aftermath II’s end card offers the coda (One more lap)',r.end.hidden===false&&/Aftermath II/.test(r.end.text)&&/One more lap/.test(r.end.next||''));
 r.coda=await page.evaluate(()=>{const L=lastLight;document.getElementById('next-chapter').click();for(let i=0;i<120;i++)L.step(1/30);const a=L.coda.state();L.jump('coda-title');for(let i=0;i<150;i++)L.step(1/30);L.render();const b=L.coda.state();return {start:a.stage,active:a.active,title:b.stage,shown:b.title,date:document.getElementById('date')?.textContent||''};});
 ok('One more lap starts the coda; it reaches LAST LIGHT on the monitor in 2026',r.coda.active&&r.coda.start==='ride'&&r.coda.title==='title'&&r.coda.shown>.5&&/AUGUST 21, 2026/.test(r.coda.date));
 await page.screenshot({path:out.replace(/\.json$/,'-coda.jpg'),type:'jpeg',quality:86,timeout:300000});
 r.credits=await page.evaluate(()=>{const L=lastLight;L.jump('coda-credits');for(let i=0;i<60;i++)L.step(1/30);const a=L.credits.state();L.credits.skip();for(let i=0;i<300;i++)L.step(1/30);L.credits.skip();for(let i=0;i<150;i++)L.step(1/30);
  const e=document.getElementById('ending');return {active:a.active,phase:a.phase,end:L.state.state,text:(e?.textContent||'').replace(/\s+/g,' ').trim().slice(0,120),complete:JSON.parse(localStorage.getItem('lastlight.complete')||'{}').complete===true};});
 ok('The credits play, skip to the dedication and past it, and end on the end screen; the game is marked complete',r.credits.active&&r.credits.end==='ended'&&/THE END/.test(r.credits.text)&&r.credits.complete);
 await page.screenshot({path:out.replace(/\.json$/,'-end.jpg'),type:'jpeg',quality:86,timeout:300000});
 ok('No HTTP(S) requests',requests.length===0);ok('No JavaScript errors',errors.length===0);
}catch(e){r.failure=String(e.stack||e);process.exitCode=1;}
finally{await browser.close();Object.assign(r,{passed:checks.length,checks,errors,httpRequests:requests});fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,1));}
