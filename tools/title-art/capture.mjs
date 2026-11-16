// Renders the title-art source passes from the game's own world (Chromium + SwiftShader, ?qa hook).
//   node tools/title-art/capture.mjs <outdir> <spec.json>
// spec: {w,h,dpr,mood,shots:[{name,cam:{d,lat,h},look:{d,lat,h},fov,passes:['beauty','key','depth'],hide:[bikeKeys],ghost:[bikeKeys]}]}
// beauty: the scene as lit for the mood; key: the sky replaced by pure green (sky mask); depth: linear depth (white near).
// ghost: those bikes are not drawn but still cast their shadows (for the "missing bike, shadow remains" event).
// Needs a static server for dist/ at BASE (default http://localhost:8123/).
import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let pw;for(const p of [null,'/opt/node-tools/node_modules'])try{pw=p?require(p+'/playwright'):require('playwright');break;}catch{}
const [out,specFile]=process.argv.slice(2);const spec=JSON.parse(fs.readFileSync(specFile,'utf8'));fs.mkdirSync(out,{recursive:true});
const browser=await pw.chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:spec.w||1920,height:spec.h||1080},deviceScaleFactor:spec.dpr||1});
page.on('pageerror',e=>console.error('pageerror',e.message));
await page.addInitScript(()=>{window.AudioContext=undefined;localStorage.setItem('lastlight.settings',JSON.stringify({quality:'high',grain:false}));});
await page.goto((process.env.BASE||'http://localhost:8123/')+'?qa',{timeout:300000});await page.waitForFunction(()=>window.lastLight,null,{timeout:300000});
await page.addStyleTag({content:'body>main>*:not(canvas){display:none!important}'});
await page.evaluate(async mood=>{const L=window.lastLight;window.__T=await import('./three.module.js');window.__R=await import('./route.js');window.__FOG0=L.scene.fog;L.titleScene.enter(mood);L.titleScene.preview({mood,shot:'oak',t:0});L.step(5,1/30);},spec.mood||'summer');
for(const s of spec.shots){for(const pass of s.passes||['beauty']){
 await page.evaluate(([s,pass,extra])=>{const L=window.lastLight,T=window.__T,R=window.__R,cam=L.camera,sc=L.scene,W=L.world;
  const P=(q)=>{const g=R.groundPoint(q.d,q.lat);return new T.Vector3(g.x,(W.groundY?W.groundY(q.d,q.lat):g.y)+q.h,g.z);};
  // (time is frozen across a mood's passes: the light and ambient were set once, so every pass shows the same instant)
  cam.position.copy(P(s.cam));cam.up.set(0,1,0);cam.lookAt(P(s.look));if(s.roll)cam.rotateZ(s.roll);cam.fov=s.fov||50;cam.near=.05;cam.far=390;cam.updateProjectionMatrix();cam.updateMatrixWorld();
  const sky=sc.children.find(c=>c.isMesh&&c.material?.uniforms?.apoc);sky.position.copy(cam.position);
  const bikes=L.titleScene.bikes;for(const [k,b] of Object.entries(bikes)){b.group.visible=!(s.hide||[]).includes(k)&&b.group.visible!==false;}
  // (title-art staging: where the bikes lie in this composition: [d, lat, yaw relative to the street, side down])
  for(const [k,v] of Object.entries(s.bikes||{})){const b=bikes[k];if(!b)continue;const [d,lat,yaw,side]=v,p=P({d,lat,h:0});const hd=R.heading(d);b.group.position.set(p.x,p.y+.035,p.z);b.group.rotation.set(0,-(hd+yaw),side*1.43,'YXZ');b.group.visible=(s.only?s.only.includes(k):true);}
  const restore=[];
  for(const k of s.ghost||[]){const b=bikes[k];if(!b)continue;b.group.traverse(m=>{if(m.isMesh){restore.push([m,m.material]);const mm=m.material.clone();mm.colorWrite=false;mm.depthWrite=false;m.material=mm;}});}
  window.__restore=()=>{for(const [m,mat] of restore)m.material=mat;};
  sc.fog=window.__FOG0;if(s.fog===false)sc.fog=null;
  if(pass==='key'){window.__skyMat=sky.material;sky.material=new T.MeshBasicMaterial({color:0x00ff00,side:T.BackSide,fog:false,depthWrite:false});}
  if(pass==='depth'){sc.fog=null;sc.overrideMaterial=new T.ShaderMaterial({vertexShader:'varying float vz;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vz=-mv.z;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float vz;void main(){float d=1.-clamp(log(max(vz,.3)/.3)/log(380./.3),0.,1.);gl_FragColor=vec4(vec3(d),1.);}'});sky.visible=false;}
  L.renderer.toneMapping=pass==='depth'?T.NoToneMapping:T.ACESFilmicToneMapping;
  L.renderer.render(sc,cam);
 },[s,pass]);
 await page.screenshot({path:`${out}/${s.name}-${pass}.png`,timeout:300000});
 await page.evaluate(pass=>{const L=window.lastLight,T=window.__T,sc=L.scene;const sky=sc.children.find(c=>c.isMesh&&(c.material?.uniforms?.apoc||c.material?.isMeshBasicMaterial&&c.geometry?.parameters?.radius===350));
  if(pass==='key'&&window.__skyMat)sky.material=window.__skyMat;if(pass==='depth'){sc.overrideMaterial=null;sky.visible=true;}window.__restore?.();sc.fog=window.__FOG0;L.renderer.toneMapping=T.ACESFilmicToneMapping;},pass);
 console.log('captured',s.name,pass);}}
await browser.close();
