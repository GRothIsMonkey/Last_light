// DEV benchmark: the Prologue's remaining neighborhood details in the running game (feature flag ?details; nothing loads
// without it). The street signs, lawn and porch chairs, kettle grills, garden hoses, impact sprinklers, yard toys, kiddie
// pools, trampolines, swing sets, sheds, clotheslines, Briarwood's creek chain link and the lookout's field fence are
// replaced in place by the Blender-built kit of dist/assets/details/ (details-assets.js): the same positions, the same
// collisions, the same story.
//   .  (Period)  AUTHORED <-> ORIGINAL (same frame, same camera: an honest before/after)
//   ,  (Comma)   LOD: auto -> 0 -> 1 -> 2 -> auto
// (Keys checked against every gameplay and DEV binding and the other benchmarks' keys: every letter is taken somewhere;
// Period and Comma are used nowhere.)
// The Prologue only, as the pavement and the street props: once the night chapters, the credits or the 2026 coda begin, the
// originals show. A DEV label says what loaded; on failure it says so and substitutes nothing.
import * as THREE from './three.module.js';
import {placeDetails} from './details-assets.js';

export async function mountInGame({scene,camera,renderer,world,hemi,sun,prologue=()=>true}){
 const label=document.createElement('div');label.id='details-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 const place=()=>{let y=8;for(const id of ['bike-benchmark-label','house-benchmark-label','vegetation-benchmark-label','pavement-benchmark-label','streetprops-benchmark-label']){const o=document.getElementById(id);if(o)y=Math.max(y,o.getBoundingClientRect().bottom+6);}label.style.top=Math.round(y)+'px';};place();
 label.textContent='DETAILS BENCHMARK (DEV): loading the authored neighborhood details…';document.body.appendChild(label);
 let S=null,error=null;const t0=performance.now();
 try{S=await placeDetails({world,scene,renderer,camera,hemi,sun});}catch(e){error=String(e?.message||e);console.error('details benchmark:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 let mode='authored',active=null,forced=null;
 function apply(){if(!S)return;const on=mode==='authored'&&prologue();if(on===active)return;active=on;S.setAuthored(on);updateLabel();}
 function setMode(m){mode=m==='original'?'original':'authored';active=null;apply();return mode;}
 addEventListener('keydown',e=>{if(e.repeat||!S)return;
  if(e.code==='Period')setMode(mode==='authored'?'original':'authored');
  if(e.code==='Comma'){forced=forced===null?0:forced===2?null:forced+1;S.setLOD(forced);S.update(camera,true);updateLabel();}});
 function updateLabel(){place();if(!S){label.textContent=`DETAILS BENCHMARK (DEV) — FAILED, nothing substituted: ${error}`;label.style.color='#ff8a7a';return;}
  const st=S.stats(),k=st.kinds,inP=prologue();
  const lines=[`DETAILS BENCHMARK (DEV) — ${mode==='authored'?(inP?'AUTHORED':'authored, but OUTSIDE THE PROLOGUE: originals shown'):'ORIGINAL (furniture.js / props.js / houses.js as before)'} · loaded in ${loadMs} ms · ${S.texInfo.files.length} textures (~${S.texInfo.gpuMB} MB GPU)`,
   `signs ${k.signs||0} · chairs ${(k['porch chairs']||0)+(k['lawn chairs']||0)} · grills ${k.grills||0} · hoses ${k['hose coils']||0} (+${k['sprinkler hoses']||0} to sprinklers) · sprinklers ${k.sprinklers||0} · toys ${(k.bigwheel||0)+(k.wagon||0)+(k.kidbike||0)+(k.scooter||0)+(k.balls||0)} · kiddie pools ${k['kiddie pools']||0}`,
   `trampolines ${k.trampolines||0} · swing sets ${k['swing sets']||0} · sheds ${(k.sheds||0)+(k['sheds behind the rear fences']||0)} · clotheslines ${k.clotheslines||0} · creek fence bays ${k['creek fence bays']||0} · field fence posts ${k['field fence posts']||0}`,
   `${Math.round(st.tris).toLocaleString()} detail tris in ${st.calls} draws (${st.instances} instances, LOD ${st.levels.join('/')})${forced!==null?' · LOD forced '+forced:''}`];
  if(S.errors.length)lines.push('ERRORS: '+S.errors.slice(0,3).join(' | '));
  lines.push('. authored/original · , LOD auto/0/1/2 · original work; lookout rails: CC BY 4.0 wood by DmitriyGDS; signs set in Overpass (SIL OFL)');label.textContent=lines.join('\n');label.style.color=S.errors.length?'#ff8a7a':'#e8e2d0';}
 let last=0;const loop=now=>{apply();if(S&&active)S.update(camera);if(now-last>700){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 apply();updateLabel();
 const api={get handle(){return S;},error,loadMs,setMode,get mode(){return mode;},get active(){return !!active;},
  tick(force=true){apply();if(S&&active)S.update(camera,force);},setLOD:n=>{forced=n;S?.setLOD(n);S?.update(camera,true);updateLabel();},stats:()=>S?.stats(),THREE};
 window.__details=api;return api;
}
