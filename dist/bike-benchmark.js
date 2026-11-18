// DEV benchmark: the four boys' authored bicycles in the running Prologue (feature flag ?bikes; nothing loads without it).
// It upgrades the game's own procedural bikes in place (bike-assets.js): the protagonist's (first person) and Jamie's,
// Sam's and Alex's under their riders, so the real ride, the real riders' poses, the real camera, shadows, fog and light
// drive them. Nothing in the story, route, characters or audio changes. A small DEV label says what loaded; on failure it
// says so and substitutes nothing (the procedural bikes simply stay).
//   B  authored <-> procedural (same frame, same camera: honest before/after)
//   N  LOD: auto -> 0 -> 1 -> 2 -> auto
//   J  the bikes' own reflections (scoped image-based light, approval item A-47) on / off
import * as THREE from './three.module.js';
import {BIKE_IDS,upgradeBike,bikeEnvironment} from './bike-assets.js';

export async function mountInGame({scene,camera,renderer,friends,playerBike,hemi}){
 const label=document.createElement('div');label.id='bike-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 label.textContent='BIKE BENCHMARK (DEV): loading the four authored bikes…';document.body.appendChild(label);
 const t0=performance.now();const targets=[['player',playerBike],...friends.list.map(f=>[f.key,f.bike])];
 const handles={},errors=[];
 for(const [key,bike] of targets){try{handles[key]=await upgradeBike(bike,BIKE_IDS[key],{renderer});}catch(e){errors.push(`${key}: ${e?.message||e}`);console.error('bike benchmark:',key,e);}}
 const loadMs=+(performance.now()-t0).toFixed(0);
 let authored=true,forced=null,env=true;
 const mats=new Set();for(const h of Object.values(handles))for(const m of h.materials)mats.add(m);
 const baseEnv=new Map([...mats].map(m=>[m,m.envMapIntensity]));
 const envTex=bikeEnvironment(renderer);
 // B: back to rig.js's drawing (restore()) and forth (upgrade again): the same frame and camera, an honest before/after
 async function toggle(on){authored=on;for(const [key,bike] of targets){
   if(on&&!bike.authored){handles[key]=await upgradeBike(bike,BIKE_IDS[key],{renderer});if(forced!==null)handles[key].setLOD(forced);}
   if(!on&&bike.authored)bike.authored.restore();}
  if(on)setEnv(env);updateLabel();}
 addEventListener('keydown',e=>{
  if(e.code==='KeyB')toggle(!authored);
  if(e.code==='KeyN'){forced=forced===null?0:forced===2?null:forced+1;for(const h of Object.values(handles))h.setLOD(forced);updateLabel();}
  if(e.code==='KeyJ')setEnv(!env);
 });
 function setEnv(on){env=on;for(const m of mats){m.envMap=on?envTex:null;m.needsUpdate=true;}updateLabel();}
 const info=()=>Object.fromEntries(Object.entries(handles).map(([k,h])=>[k,{lod:h.level,tris:h.stats().tris,anchors:h.report}]));
 function updateLabel(){const lines=[`BIKE BENCHMARK (DEV) — ${authored?'AUTHORED':'PROCEDURAL (rig.js)'} bikes · loaded in ${loadMs} ms`];
  for(const [k,h] of Object.entries(handles))lines.push(`${(h.id+'          ').slice(0,12)} v${h.info.version} LOD${h.level}${forced!==null?' (forced)':''} · ${h.stats().tris.map(t=>Math.round(t)).join('/')} tris · ${h.info.textures} tex · ${(h.info.bytes/1048576).toFixed(2)} MB`);
  if(errors.length)lines.push('FAILED (nothing substituted): '+errors.join(' | '));
  lines.push('B authored/procedural · N LOD auto/0/1/2 · J reflections '+(env?'on':'off'));label.textContent=lines.join('\n');label.style.color=errors.length?'#ff8a7a':'#e8e2d0';}
 // per frame: LOD by camera distance; reflections follow the scene's sky light (the Prologue darkens toward blue hour)
 const golden=2.0;
 function tick(){if(authored)for(const h of Object.values(handles))h.update(camera);
  const k=hemi?Math.max(.05,Math.min(1.4,hemi.intensity/golden)):1;for(const m of mats)m.envMapIntensity=(baseEnv.get(m)??.85)*k;}
 let last=0;const loop=now=>{tick();if(now-last>500){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 updateLabel();
 const api={handles,errors,loadMs,tick,info,toggle:on=>toggle(on),setLOD(n){forced=n;for(const h of Object.values(handles))h.setLOD(n);},
  setEnv,get authored(){return authored;},materials:mats};
 window.__bikes=api;return api;
}
