// DEV benchmark: the Prologue's authored houses in the running game (feature flag ?houses; nothing loads without it).
// Twelve lots of Oak Hollow Drive (dist/house-lots.js: the eight houses that open the ride, the hoop house and the car
// house, and the houses across from those two) get the Blender-built houses of dist/assets/house/house.prologue.glb on
// exactly their plans (house-assets.js). The real ride, riders, bikes, camera, sun, shadows, fog and evening drive them.
// Works beside the bike benchmark: ?bikes&houses.
//   H  authored <-> procedural houses (same frame, same camera: an honest before/after)
//   G  LOD: auto -> 0 -> 1 -> 2 -> auto
//   V  the rooms' evening lamps: follow the evening -> on -> off -> follow
// A DEV label says what loaded; on failure it says so and substitutes nothing (the procedural houses simply stay).
import * as THREE from './three.module.js';
import {placeHouses} from './house-assets.js';
import {lotKey} from './house-lots.js';

export async function mountInGame({scene,camera,renderer,world,hemi}){
 const label=document.createElement('div');label.id='house-benchmark-label';
 const below=document.getElementById('bike-benchmark-label');
 label.style.cssText=`position:fixed;left:8px;top:${below?96:8}px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre`;
 label.textContent='HOUSE BENCHMARK (DEV): loading the authored houses…';document.body.appendChild(label);
 const t0=performance.now();let H=null,error=null;
 try{H=await placeHouses({world,scene,renderer,lotKey});}catch(e){error=String(e?.message||e);console.error('house benchmark:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 if(H?.errors?.length)console.error('house benchmark:',H.errors);
 let lamps='auto';
 const U=world.glassLit?.userData?.uniforms;
 function light(){const h=hemi?hemi.intensity:null,v={uP:U?.uP.value||0,uNight:U?.uNight.value||0,uDim:U?.uDim.value||0,hemi:h};if(lamps==='on')return {uP:1,uNight:1,uDim:0,hemi:h};if(lamps==='off')return {uP:0,uNight:0,uDim:0,hemi:h};return v;}
 addEventListener('keydown',e=>{if(!H)return;
  if(e.code==='KeyH'){H.setAuthored(!H.authored);updateLabel();}
  if(e.code==='KeyG'){const f=H.forced;H.setLOD(f===null?0:f===2?null:f+1);updateLabel();}
  if(e.code==='KeyV'){lamps=lamps==='auto'?'on':lamps==='on'?'off':'auto';updateLabel();}});
 function updateLabel(){if(!H){label.textContent=`HOUSE BENCHMARK (DEV) — FAILED, nothing substituted: ${error}`;label.style.color='#ff8a7a';return;}
  const s=H.stats();const lv=[0,0,0];for(const v of Object.values(s.levels))lv[v]++;
  const lines=[`HOUSE BENCHMARK (DEV) — ${H.authored?'AUTHORED (Blender kit)':'PROCEDURAL (houses.js)'} houses on ${H.houses.length} lots · loaded in ${loadMs} ms · ${(H.info.bytes/1048576).toFixed(1)} MB`,
   `LOD now ${lv[0]}×0 ${lv[1]}×1 ${lv[2]}×2${H.forced!==null?' (forced '+H.forced+')':''} · ${Math.round(s.tris)} tris drawn by houses · ${H.info.materials} materials · ${H.info.textures} textures (shared)`];
  if(H.errors.length)lines.push('ERRORS: '+H.errors.join(' | '));
  lines.push(`H authored/procedural · G LOD auto/0/1/2 · V room lamps ${lamps}`);label.textContent=lines.join('\n');label.style.color=H.errors.length?'#ff8a7a':'#e8e2d0';}
 function tick(){if(H&&H.authored)H.update(camera,light());}
 let last=0;const loop=now=>{tick();if(now-last>500){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 updateLabel();
 const api={handle:H,error,loadMs,tick,toggle:on=>{H?.setAuthored(on);updateLabel();},setLOD:n=>{H?.setLOD(n);updateLabel();},setLamps:m=>{lamps=m;updateLabel();},get lamps(){return lamps;},stats:()=>H?.stats(),THREE};
 window.__houses=api;return api;
}
