// The consistency audit's survey: the riding camera every 60 m along Oak Hollow, looking left and right (all eight flags), as
// contact sheets for a person to read (docs/qa/envrepair-supportcast/audit/). Software WebGL, not a GPU.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);let pw;for(const p of [null,'/opt/node-tools/node_modules','/opt/node22/lib/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const OUT=path.resolve('docs/qa/envrepair-supportcast/audit');fs.mkdirSync(OUT,{recursive:true});const TMP=fs.mkdtempSync(path.join(OUT,'.tmp-'));
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const root=path.resolve('dist'),types={js:'application/javascript',html:'text/html',glb:'model/gltf-binary',json:'application/json',jpg:'image/jpeg',png:'image/png',css:'text/css'};
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(root,u.replace(/^\//,'')||'index.html');try{res.setHeader('Content-Type',types[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await pw.chromium.launch({headless:true,args:ARGS});const page=await (await browser.newContext({viewport:{width:1280,height:720}})).newPage();
await page.goto(base+'/index.html?qa&bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast',{timeout:300000});await page.waitForFunction(()=>window.lastLight&&window.__envrepair&&window.__supportcast,null,{timeout:600000});
await page.evaluate(()=>{for(const d of document.querySelectorAll('[id$="-benchmark-label"]'))d.style.display='none';const L=lastLight;L.start();for(let i=0;i<20;i++)L.step(1/30);document.getElementById('subtitle').style.visibility='hidden';});
const files=[];for(let d=0;d<=1140;d+=60)for(const [side,yaw] of [['L',.75],['R',-.75]]){
 await page.evaluate(({d,yaw})=>{const L=lastLight;L.place(d,yaw>0?-1.8:1.8,0);for(let i=0;i<4;i++)L.step(1/30);L.look(yaw,-.03);L.step(1/30);for(const k of ['__details','__streetprops','__vegetation','__houses','__bikes','__pavement','__envrepair','__supportcast'])window[k]?.tick?.(true);L.render();},{d,yaw});
 const f=path.join(TMP,`d${String(d).padStart(4,'0')}-${side}.jpg`);await page.screenshot({path:f,type:'jpeg',quality:80});files.push(f);console.log('view',d,side);}
await browser.close();server.close();
// contact sheets: 4 x 3 per sheet, each tile labelled by its distance and side
execFileSync('python3',['-c',`
import sys,glob,os
from PIL import Image,ImageDraw
fs=sorted(glob.glob(os.path.join(sys.argv[1],'*.jpg')));out=sys.argv[2]
for k in range(0,len(fs),12):
  sheet=Image.new('RGB',(4*640,3*360),(20,20,20));dr=ImageDraw.Draw(sheet)
  for i,f in enumerate(fs[k:k+12]):
    im=Image.open(f).resize((640,360));x,y=(i%4)*640,(i//4)*360;sheet.paste(im,(x,y));dr.rectangle([x,y,x+150,y+22],fill=(0,0,0));dr.text((x+6,y+5),os.path.basename(f)[:-4],fill=(255,255,255))
  sheet.save(os.path.join(out,'audit-sheet-%02d.jpg'%(k//12+1)),quality=82)
`,TMP,OUT]);fs.rmSync(TMP,{recursive:true,force:true});console.log('sheets written');
