// Open the delivered HTML as a local file, with real title and DEV controls.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),pw=require('playwright');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(path.dirname(out),{recursive:true});
const browser=await pw.chromium.launch({executablePath:process.env.BROWSER_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],warnings=[],requests=[],checks=[];
const report={file:path.basename(file),htmlSHA256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),audio:'AudioContext initializes, then the game is muted. No listening review.',renderer:'Chromium with ANGLE SwiftShader'};
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning'&&/GL_INVALID|Feedback loop|shader/i.test(m.text()))warnings.push(m.text());});
page.on('request',q=>{if(/^https?:/.test(q.url()))requests.push(q.url());});
const check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name);};
try {
 await page.goto(pathToFileURL(file).href+'?qa',{timeout:180000});await page.waitForFunction(()=>window.lastLight,null,{timeout:180000});
 await page.click('#start');await page.evaluate(()=>lastLight.step(.4));
 check('Normal Start opens the prologue',await page.evaluate(()=>lastLight.state.state==='riding'));
 await page.evaluate(()=>lastLight.toTitle());
 await page.click('[data-dev-chapter="7"]');await page.selectOption('#dev-scene','chapter7');await page.click('#dev-start',{timeout:300000});
 await page.waitForFunction(()=>!document.body.classList.contains('dev-starting'),null,{timeout:300000});
 if(await page.locator('#sound').getAttribute('aria-pressed')==='true')await page.keyboard.press('m');
 report.opening=await page.evaluate(()=>{const L=lastLight;L.step(12);return {phase:L.chapter7.state.phase,photo:L.chapter7.state.photoRendered,render:L.render(),asset:L.chapter3.creature.loaded};});
 check('Local file enters Chapter Seven through real DEV controls',report.opening.phase==='d7-step');
 check('Both embedded photographs render',report.opening.photo.four&&report.opening.photo.one);
 check('The earlier chapter creature asset loads offline',report.opening.asset);
 await page.screenshot({path:out.replace('.json','-opening.jpg'),type:'jpeg',quality:86,timeout:300000});
 report.hunter=await page.evaluate(()=>{const L=lastLight;L.jump('c7-reveal');L.step(6);return {phase:L.chapter7.state.phase,visible:L.chapter7.HM.visible,render:L.render()};});
 check('Offline hunter reveal renders',report.hunter.visible&&report.hunter.render.triangles>1000);
 await page.screenshot({path:out.replace('.json','-hunter.jpg'),type:'jpeg',quality:86,timeout:300000});
 report.ending=await page.evaluate(()=>{const L=lastLight;L.jump('chapter7-end');L.step(45);L.render();return {state:L.state.state,photo:L.chapter7.state.photo,taken:L.chapter7.C.flags.jamieTaken};});
 check('Offline ending reaches its end card',report.ending.state==='ended');
 check('Ending retains the solitary photograph',report.ending.photo==='one');
 check('No network requests are needed',requests.length===0);check('No JavaScript or shader errors',!errors.length&&!warnings.length);
 await page.screenshot({path:out.replace('.json','-ending.jpg'),type:'jpeg',quality:86,timeout:300000});
} catch(e){report.failure=String(e.stack||e);process.exitCode=1;}
finally {await browser.close();Object.assign(report,{passed:checks.length,checks,errors,warnings,httpRequests:requests});fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
