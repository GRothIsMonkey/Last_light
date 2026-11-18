// DEV benchmark: the Prologue's authored houses in the running game (feature flag ?houses; nothing loads without it).
// Twelve lots of Oak Hollow Drive (dist/house-lots.js: the eight houses that open the ride, the hoop house and the car
// house, and the houses across from those two) get the Blender-built houses of dist/assets/house/house.prologue.glb on
// exactly their plans (house-assets.js). The real ride, riders, bikes, camera, sun, shadows, fog and evening drive them.
// Works beside the bike benchmark: ?bikes&houses.
//   H  C refined houses -> B the first benchmark (v1, loaded on first use) -> A the procedural houses -> C ...
//      (same frame, same camera: an honest three-way comparison)
//   G  LOD: auto -> 0 -> 1 -> 2 -> auto
//   V  the rooms' evening lamps: follow the evening -> on -> off -> follow
// A DEV label says what loaded; on failure it says so and substitutes nothing (the procedural houses simply stay).
import * as THREE from './three.module.js';
import {placeHouses,HOUSE_ASSET,HOUSE_ASSET_V1} from './house-assets.js';
import {lotKey} from './house-lots.js';

const NAMES={refined:'C · REFINED (realism pass, v2)',v1:'B · FIRST BENCHMARK (v1)',procedural:'A · PROCEDURAL (houses.js)'};

export async function mountInGame({scene,camera,renderer,world,hemi}){
 const label=document.createElement('div');label.id='house-benchmark-label';
 const below=document.getElementById('bike-benchmark-label');
 label.style.cssText=`position:fixed;left:8px;top:${below?96:8}px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre`;
 label.textContent='HOUSE BENCHMARK (DEV): loading the authored houses…';document.body.appendChild(label);
 const t0=performance.now();let H=null,H1=null,error=null,error1=null,mode='refined',loading1=null;
 try{H=await placeHouses({world,scene,renderer,lotKey,assetId:HOUSE_ASSET,refined:true});}catch(e){error=String(e?.message||e);console.error('house benchmark:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);let loadMs1=null;
 if(H?.errors?.length)console.error('house benchmark:',H.errors);
 let lamps='auto',forced=null;
 const U=world.glassLit?.userData?.uniforms;
 function light(){const h=hemi?hemi.intensity:null,v={uP:U?.uP.value||0,uNight:U?.uNight.value||0,uDim:U?.uDim.value||0,hemi:h};if(lamps==='on')return {uP:1,uNight:1,uDim:0,hemi:h};if(lamps==='off')return {uP:0,uNight:0,uDim:0,hemi:h};return v;}
 // the first benchmark, loaded once on first use (same lots, same placement, its own approved material treatment)
 function loadV1(){if(!loading1)loading1=(async()=>{const t=performance.now();try{H1=await placeHouses({world,scene,renderer,lotKey,assetId:HOUSE_ASSET_V1,refined:false});H1.showOwn(false);if(forced!==null)H1.setLOD(forced);}catch(e){error1=String(e?.message||e);console.error('house benchmark v1:',e);}loadMs1=+(performance.now()-t).toFixed(0);})();return loading1;}
 async function setMode(m){if(!H)return mode;if(m==='v1'){await loadV1();if(!H1)m='procedural';}
  mode=m;H.showOwn(m==='refined');H1?.showOwn(m==='v1');H.setProcedural(m==='procedural');updateLabel();return mode;}
 addEventListener('keydown',e=>{if(!H)return;
  if(e.code==='KeyH')setMode(mode==='refined'?'v1':mode==='v1'?'procedural':'refined');
  if(e.code==='KeyG'){forced=forced===null?0:forced===2?null:forced+1;H.setLOD(forced);H1?.setLOD(forced);updateLabel();}
  if(e.code==='KeyV'){lamps=lamps==='auto'?'on':lamps==='on'?'off':'auto';updateLabel();}});
 const active=()=>mode==='refined'?H:mode==='v1'?H1:null;
 function updateLabel(){if(!H){label.textContent=`HOUSE BENCHMARK (DEV) — FAILED, nothing substituted: ${error}`;label.style.color='#ff8a7a';return;}
  const A=active()||H,s=A.stats();const lv=[0,0,0];for(const v of Object.values(s.levels))lv[v]++;
  const lines=[`HOUSE BENCHMARK (DEV) — ${NAMES[mode]} on ${H.houses.length} lots · loaded in ${loadMs} ms · ${(H.info.bytes/1048576).toFixed(1)} MB${H1?` · v1 ${loadMs1} ms`:''}`,
   mode==='procedural'?'the procedural houses of houses.js (the authored sets are hidden)':`LOD now ${lv[0]}×0 ${lv[1]}×1 ${lv[2]}×2${forced!==null?' (forced '+forced+')':''} · ${Math.round(s.tris)} tris drawn by houses · ${A.info.materials} materials · ${A.info.textures} textures (shared)`];
  const errs=[...(H.errors||[]),...(H1?.errors||[]),...(error1?['v1: '+error1]:[])];
  if(errs.length)lines.push('ERRORS: '+errs.join(' | '));
  lines.push(`H refined/benchmark/procedural · G LOD auto/0/1/2 · V room lamps ${lamps}`);label.textContent=lines.join('\n');label.style.color=errs.length?'#ff8a7a':'#e8e2d0';}
 function tick(){const A=active();if(A)A.update(camera,light());}
 let last=0;const loop=now=>{tick();if(now-last>500){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 updateLabel();
 const api={get handle(){return H;},get handleV1(){return H1;},error,loadMs,get loadMsV1(){return loadMs1;},tick,setMode,get mode(){return mode;},loadV1,
  toggle:on=>setMode(on?'refined':'procedural'),setLOD:n=>{forced=n;H?.setLOD(n);H1?.setLOD(n);updateLabel();},setLamps:m=>{lamps=m;updateLabel();},get lamps(){return lamps;},stats:()=>active()?.stats(),THREE};
 window.__houses=api;return api;
}
