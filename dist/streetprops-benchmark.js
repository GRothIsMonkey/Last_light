// DEV benchmark: the Prologue's authored vehicles and street props in the running game (feature flag ?streetprops; nothing
// loads without it). The parked cars, the parent's minivan, the utility poles' hardware and the wires between them, the
// cobra-head streetlights, mailboxes, hydrants, bins, hoops and Oak Hollow's fences are replaced in place by the Blender-built
// assets of dist/assets/street/ (streetprops-assets.js): the same positions, the same network, the same collisions.
//   X  AUTHORED <-> ORIGINAL (same frame, same camera: an honest before/after)
//   Z  LOD: auto -> 0 -> 1 -> 2 -> auto
// (Keys checked against every gameplay and DEV binding and the other benchmarks' keys: X and Z were unused.)
// The Prologue only, as the pavement: once the night chapters, the credits or the 2026 coda begin, the originals show (those
// chapters move, damage and reuse these cars and things). A DEV label says what loaded; on failure it says so and
// substitutes nothing (the procedural props simply stay).
import * as THREE from './three.module.js';
import {placeStreetProps} from './streetprops-assets.js';

export async function mountInGame({scene,camera,renderer,world,hemi,sun,prologue=()=>true}){
 const label=document.createElement('div');label.id='streetprops-benchmark-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 const place=()=>{let y=8;for(const id of ['bike-benchmark-label','house-benchmark-label','vegetation-benchmark-label','pavement-benchmark-label']){const o=document.getElementById(id);if(o)y=Math.max(y,o.getBoundingClientRect().bottom+6);}label.style.top=Math.round(y)+'px';};place();
 label.textContent='STREET PROPS BENCHMARK (DEV): loading the authored vehicles and street props…';document.body.appendChild(label);
 let S=null,error=null;const t0=performance.now();
 try{S=await placeStreetProps({world,scene,renderer,camera,hemi,sun});}catch(e){error=String(e?.message||e);console.error('street-props benchmark:',e);}
 const loadMs=+(performance.now()-t0).toFixed(0);
 let mode='authored',active=null,forced=null;
 function apply(){if(!S)return;const on=mode==='authored'&&prologue();if(on===active)return;active=on;S.setAuthored(on);updateLabel();}
 function setMode(m){mode=m==='original'?'original':'authored';active=null;apply();return mode;}
 addEventListener('keydown',e=>{if(e.repeat||!S)return;
  if(e.code==='KeyX')setMode(mode==='authored'?'original':'authored');
  if(e.code==='KeyZ'){forced=forced===null?0:forced===2?null:forced+1;S.setLOD(forced);S.update(camera,true);updateLabel();}});
 function updateLabel(){place();if(!S){label.textContent=`STREET PROPS BENCHMARK (DEV) — FAILED, nothing substituted: ${error}`;label.style.color='#ff8a7a';return;}
  const st=S.stats(),inP=prologue(),parts=Object.keys(st);let tris=0,calls=0;for(const v of Object.values(st)){tris+=v.tris;calls+=v.calls;}
  const v=st.vehicles,p=st.props,k=p?.kinds||{};
  const lines=[`STREET PROPS BENCHMARK (DEV) — ${mode==='authored'?(inP?'AUTHORED':'authored, but OUTSIDE THE PROLOGUE: originals shown'):'ORIGINAL (props.js / furniture.js as before)'} · loaded in ${loadMs} ms · ${S.texInfo.files.length} textures (~${S.texInfo.gpuMB} MB GPU)`,
   `cars ${v.instances} (LOD ${v.levels.join('/')}) · poles ${k.poles||0} (${k.transformers||0} transformers) · wires ${k.wires||0} · lamps ${k.lamps||0} · mailboxes ${Object.entries(k).filter(([n])=>n.startsWith('mailbox')).reduce((a,[,c])=>a+c,0)} · hydrants ${k.hydrants||0} · bins ${(k.carts||0)+(k.cans||0)} · hoops ${k.hoops||0} · fence bays ${k.bays||0} + gates ${k.gates||0}`,
   `${Math.round(tris).toLocaleString()} street-prop tris in ${calls} instanced draws${forced!==null?' · LOD forced '+forced:''}`];
  if(S.errors.length)lines.push('ERRORS: '+S.errors.slice(0,3).join(' | '));
  lines.push('X authored/original · Z LOD auto/0/1/2');label.textContent=lines.join('\n');label.style.color=S.errors.length?'#ff8a7a':'#e8e2d0';}
 let last=0;const loop=now=>{apply();if(S&&active)S.update(camera);if(now-last>700){last=now;updateLabel();}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 apply();updateLabel();
 const api={get handle(){return S;},error,loadMs,setMode,get mode(){return mode;},get active(){return !!active;},
  tick(force=true){apply();if(S&&active)S.update(camera,force);},setLOD:n=>{forced=n;S?.setLOD(n);S?.update(camera,true);updateLabel();},stats:()=>S?.stats(),THREE};
 window.__streetprops=api;return api;
}
