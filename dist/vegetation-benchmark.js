// DEV benchmark: the Prologue's authored vegetation in the running game (feature flag ?vegetation; nothing loads without it).
// Every tree within 95 m of Oak Hollow Drive, every foundation-bed shrub and the lookout's grass are replaced in place by
// the Blender-built vegetation (vegetation-assets.js): the old oak on the lookout, 44 street-tree variants, shrubs, a lawn
// of real blades near the camera and the lookout meadow. The real ride, riders, camera, sun, shadows, fog and evening
// drive them; positions, collisions and story marks come from the plan. Works beside ?bikes and ?houses.
//   K  authored <-> procedural vegetation (same frame, same camera: an honest before/after)
//   L  LOD: auto -> 0 -> 1 -> 2 -> auto
//   U  wind: the game's evening breeze -> breezy x2.2 -> still -> breeze ... (the storm chapters can raise it further)
// (Keys checked against every gameplay and DEV binding: K, L, U and Y are unused. Y steps the lawns alone: C the grass-and-ground
// repair, B the first benchmark's lawn, A the original procedural lawn, the trees and shrubs staying authored.) A DEV label says what loaded; on failure it
// says so and substitutes nothing (the procedural vegetation simply stays).
import * as THREE from './three.module.js';
import {placeVegetation} from './vegetation-assets.js';

export async function mountInGame({scene,camera,renderer,world,sun,ambient}){
 const label=document.createElement('div');label.id='vegetation-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 // stacked under the bike and house benchmark labels when those flags are on too (they may mount after this one)
 const place=()=>{let y=8;for(const id of ['bike-benchmark-label','house-benchmark-label']){const o=document.getElementById(id);if(o)y=Math.max(y,o.getBoundingClientRect().bottom+6);}label.style.top=Math.round(y)+'px';};place();
 label.textContent='VEGETATION BENCHMARK (DEV): loading the authored vegetation…';document.body.appendChild(label);
 let V=null,error=null;const t0=performance.now();
 try{V=await placeVegetation({world,scene,renderer,ambient});}catch(e){error=String(e?.message||e);console.error('vegetation benchmark:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 let forced=null,wind=0;const WINDS=[1,2.2,0];
 addEventListener('keydown',e=>{if(!V)return;
  if(e.code==='KeyK'){V.setAuthored(!V.authored);updateLabel();}
  if(e.code==='KeyL'){forced=forced===null?0:forced===2?null:forced+1;V.setLOD(forced);updateLabel();}
  if(e.code==='KeyU'){wind=(wind+1)%WINDS.length;V.setWind(WINDS[wind]);updateLabel();}
  if(e.code==='KeyY'){V.setLawn(V.lawnMode==='C'?'B':V.lawnMode==='B'?'A':'C');updateLabel();}});
 function updateLabel(){place();if(!V){label.textContent=`VEGETATION BENCHMARK (DEV) — FAILED, nothing substituted: ${error}`;label.style.color='#ff8a7a';return;}
  const s=V.stats(),I=V.info;
  const lines=[`VEGETATION BENCHMARK (DEV) — ${V.authored?'AUTHORED':'PROCEDURAL (vegetation.js)'} · loaded in ${loadMs} ms · ${(I.bytes/1048576).toFixed(1)} MB · ${I.materials} materials · ${I.textures} textures (~${I.gpuTextureMB} MB GPU)`];
  if(V.authored)lines.push(`oak LOD${s.oak.level} · trees ${I.trees} (${I.variantsUsed} variants; LOD ${s.trees.levels.join('/')}) · shrubs ${I.shrubs} · meadow ${s.meadow.items??I.meadow}`,
   `LAWN ${{C:'C — repaired ground + continuous blades',B:'B — first benchmark (clumps on a flat colour)',A:'A — original procedural lawn'}[V.lawnMode]}`+(V.lawnMode==='C'?` · blade tiles ${s.blades.tiles.join('/')} · ${Math.round(s.blades.tris).toLocaleString()} tris · ${s.blades.pending} chunks pending`:V.lawnMode==='B'?` · clumps ${s.lawn.clumps}`:''),
   `${Math.round(s.tris).toLocaleString()} veg tris drawn · ${s.calls} veg draw groups${forced!==null?' · LOD forced '+forced:''} · wind ×${V.wind}${V.gameWind?' (game breeze)':''}`);
  else lines.push('the procedural trees, bed shrubs and lookout grass of vegetation.js / houses.js / props.js (authored set hidden)');
  if(V.errors.length)lines.push('ERRORS: '+V.errors.slice(0,3).join(' | '));
  lines.push('K authored/procedural · Y lawn C/B/A · L LOD auto/0/1/2 · U wind');label.textContent=lines.join('\n');label.style.color=V.errors.length?'#ff8a7a':'#e8e2d0';}
 let last=0,lastT=performance.now();
 const loop=now=>{const dt=Math.min(.1,(now-lastT)/1000);lastT=now;V?.update(camera,{dt,sun});if(now-last>500){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 updateLabel();
 const api={get handle(){return V;},error,loadMs,setMode:m=>{V?.setAuthored(m!=='procedural');updateLabel();return V?.authored?'authored':'procedural';},get mode(){return V?.authored?'authored':'procedural';},
  toggle:on=>{V?.setAuthored(on);updateLabel();},setLOD:n=>{forced=n;V?.setLOD(n);updateLabel();},setWind:w=>{V?.setWind(w);updateLabel();},stats:()=>V?.stats(),info:()=>V?.info,
  tick:(o={})=>V?.update(camera,{dt:0,sun,sync:o.sync!==false}),setLawn:m=>{const r=V?.setLawn(m);updateLabel();return r;},get lawnMode(){return V?.lawnMode;},THREE};
 window.__vegetation=api;return api;
}
