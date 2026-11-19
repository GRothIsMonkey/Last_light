// DEV benchmark: the Prologue's reconstructed pavement in the running game (feature flag ?pavement; nothing loads without
// it). The roads, gutter pans, curbs, sidewalks, driveway aprons, driveways and front walks of Oak Hollow Drive,
// Briarwood Lane and Summerfield Road (with their corners and the cul-de-sac) were built by streets.js / houses.js with
// the pavement materials of pavement-surfaces.js: the same geometry, the same positions and collisions, the same merged
// batches; this module builds the street layout map, loads the six CC0-derived textures and switches the look.
//   O  RECONSTRUCTED <-> ORIGINAL pavement (same frame, same camera: an honest before/after; the original shows the old
//      decal patches, crack lines, sidewalk joint bars and driveway joint lines exactly as the default game draws them)
// (Keys checked against every gameplay and DEV binding and the other benchmarks' keys: O, X and Z are unused; O is used.)
// The Prologue only: once the night chapters, the credits or the 2026 coda begin, the original surfaces show (Chapter
// Eight's cuts patch the very same materials, so no hole or trench can be covered). A DEV label says what loaded; on
// failure it says so and substitutes nothing (the original surfaces simply stay).
import * as THREE from './three.module.js';

export async function mountInGame({scene,camera,renderer,world,kit,prologue=()=>true}){
 const label=document.createElement('div');label.id='pavement-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 const place=()=>{let y=8;for(const id of ['bike-benchmark-label','house-benchmark-label','vegetation-benchmark-label']){const o=document.getElementById(id);if(o)y=Math.max(y,o.getBoundingClientRect().bottom+6);}label.style.top=Math.round(y)+'px';};place();
 label.textContent='PAVEMENT BENCHMARK (DEV): loading the reconstructed pavement…';document.body.appendChild(label);
 const P=kit.PAVE,L=world.pavement,t0=performance.now();let info=null,error=null,layout=null;
 try{if(!L)throw Error('the world was not built with the pavement flag');
  layout=kit.buildLayoutMap(L);
  L.inlets.slice(0,24).forEach((n,i)=>P.inlets.value[i].set(n.d,n.row,0,1));
  info=await kit.loadPavementTextures(renderer);}catch(e){error=String(e?.message||e);console.error('pavement benchmark:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 // what the comparison swaps: the shader (one uniform) and, for the original, the old decal patches and joint bars
 // (their own batches) and the crack / driveway-joint lines (their own line batches)
 const originalOnly=[...world.merged.filter(m=>m.material?.userData?.pvToggle==='original')];
 const lines=[];scene.traverse(o=>{if(o.isLineSegments&&o.userData.pvLine)lines.push(o);});
 const pave=world.merged.filter(m=>m.material?.userData?.pvKind!==undefined);
 let mode='reconstructed',active=null;
 function apply(){const inP=prologue(),on=!error&&mode==='reconstructed'&&inP;if(on===active)return;active=on;
  P.on.value=on?1:0;for(const m of originalOnly)m.visible=!on;for(const l of lines)l.visible=!on;updateLabel();}
 function setMode(m){mode=m==='original'?'original':'reconstructed';active=null;apply();return mode;}
 addEventListener('keydown',e=>{if(e.code==='KeyO'&&!e.repeat){setMode(mode==='reconstructed'?'original':'reconstructed');}});
 function stats(){let tris=0,calls=0;const kinds={};for(const m of pave){const n=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;tris+=n;const k=m.material.userData.pvKind;kinds[k]=(kinds[k]||0)+1;}
  return {batches:pave.length,triangles:Math.round(tris),kinds,originalOnly:originalOnly.length,lines:lines.length,active:!!active,mode};}
 function updateLabel(){place();if(error){label.textContent=`PAVEMENT BENCHMARK (DEV) — FAILED, nothing substituted: ${error}`;label.style.color='#ff8a7a';return;}
  const s=stats(),inP=prologue();
  const lines=[`PAVEMENT BENCHMARK (DEV) — ${mode==='reconstructed'?(inP?'RECONSTRUCTED':'reconstructed, but OUTSIDE THE PROLOGUE: original surfaces shown'):'ORIGINAL (streets.js / houses.js as before)'} · loaded in ${loadMs} ms`,
   `${info.files.length} textures 1024² (~${info.gpuMB} MB GPU, aniso ${info.aniso}) · ${s.batches} pavement batches · ${s.triangles.toLocaleString()} tris · ${L.drives.length} driveways · layout ${L.cuts.length} cuts, ${L.inlets.length} inlets, ${L.trees.length} trees`,
   'O reconstructed/original'];label.textContent=lines.join('\n');label.style.color='#e8e2d0';}
 let last=0;const loop=now=>{if(now-last>250){last=now;apply();}if(now-(loop.l||0)>1000){loop.l=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 apply();updateLabel();
 const api={error,loadMs,info,layout,setMode,get mode(){return mode;},get active(){return !!active;},stats,tick:()=>apply(),kit,THREE,
  setTune:(x,y,z)=>{P.tune.value.set(x,y,z,0);},world:L};
 window.__pavement=api;return api;
}
