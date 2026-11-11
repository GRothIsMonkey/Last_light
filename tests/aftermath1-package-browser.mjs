// The offline Aftermath I package (tools/package-playtest.mjs with PLAYTEST_CHAPTER=9), opened from disk in Chromium
// (SwiftShader): the real DEV controls start Aftermath I (from Chapter Eight's end card); later scenes start from their
// jumps, each in an Aftermath I phase; the end card; no HTTP(S) requests and no JavaScript errors. Usage:
//   node tests/aftermath1-package-browser.mjs <package>/Last-Light-Aftermath1-Playtest.html [report.json]
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]||'docs/qa/aftermath1/package-browser-report.json');fs.mkdirSync(path.dirname(out),{recursive:true});
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[],requests=[],checks=[],r={file:path.basename(file),htmlSHA256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),htmlBytes:fs.statSync(file).size,renderer:'Chromium / ANGLE SwiftShader software'};
page.on('pageerror',e=>errors.push(String(e)));page.on('crash',()=>errors.push('page crashed'));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('request',q=>{if(/^https?:/.test(q.url()))requests.push(q.url());});
const ok=(name,v)=>{if(!v)throw Error(name);checks.push(name);};
try{await page.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});
 await page.goto(pathToFileURL(file).href+'?qa',{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.click('[data-dev-chapter="9"]');await page.selectOption('#dev-scene','aftermath1');await page.click('#dev-start',{timeout:300000});
 await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});
 await page.evaluate(()=>{for(let i=0;i<420;i++)lastLight.step(1/30);lastLight.render();});
 r.start=await page.evaluate(()=>({phase:lastLight.aftermath1.state.phase,date:document.getElementById('date')?.textContent||'',width:lastLight.renderer.domElement.width}));
 ok('Local file enters Aftermath I through the real DEV controls (from Chapter Eight’s end card)',/^a1-/.test(r.start.phase));ok('WebGL renders',r.start.width>0);
 await page.screenshot({path:out.replace(/\.json$/,'-start.jpg'),type:'jpeg',quality:86,timeout:300000});
 r.scenes={};for(const s of ['a1-gym','a1-record','a1-return','a1-porch','a1-memorial-jamie','a1-memorial-alex','a1-sam','a1-weeks','a1-packing','a1-goodbye','a1-road-out']){r.scenes[s]=await page.evaluate(s=>{const L=lastLight;L.jump(s);for(let i=0;i<90;i++)L.step(1/30);L.render();return L.aftermath1.state.phase;},s);}
 ok('Later scenes start from their jumps',Object.values(r.scenes).every(p=>/^a1-/.test(p)));
 await page.screenshot({path:out.replace(/\.json$/,'-later.jpg'),type:'jpeg',quality:86,timeout:300000});
 r.end=await page.evaluate(()=>{const L=lastLight;L.jump('aftermath1-end');for(let i=0;i<300;i++)L.step(1/30);L.render();const e=document.getElementById('ending');return {hidden:e?.hidden,text:(e?.textContent||'').replace(/\s+/g,' ').trim().slice(0,160),next:document.getElementById('next-chapter')?.hidden};});
 ok('The end card is Aftermath I’s, and offers nothing after it',r.end.hidden===false&&/Aftermath I/.test(r.end.text)&&/WHAT WAS LEFT/.test(r.end.text)&&r.end.next===true);
 await page.screenshot({path:out.replace(/\.json$/,'-end.jpg'),type:'jpeg',quality:86,timeout:300000});
 ok('No HTTP(S) requests',requests.length===0);ok('No JavaScript errors',errors.length===0);
}catch(e){r.failure=String(e.stack||e);process.exitCode=1;}
finally{await browser.close();Object.assign(r,{passed:checks.length,checks,errors,httpRequests:requests});fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,1));}
