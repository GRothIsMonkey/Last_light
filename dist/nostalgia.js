// Memory lines: shows each reflection from story.js once, at its moment, never over a
// friend's line and never back to back. The overlay itself belongs to ui.js.
import {reflections} from './story.js';

export function createNostalgia(ui){
 let shown=new Set(),events=new Map(),quiet=0;
 const reset=()=>{shown=new Set();events=new Map();quiet=0;};
 // Mark a moment ('first-home', 'leaving') so reflections waiting for it can follow.
 const mark=(name,clock)=>{if(!events.has(name))events.set(name,clock);};
 function update(dt,ctx,{captionBusy=false,enabled=true}={}){
  quiet=captionBusy?0:quiet+dt;
  if(!enabled||ui.reflecting())return null;
  for(const r of reflections){if(shown.has(r.id))continue;
   if(r.until!==undefined&&ctx.distance>r.until){shown.add(r.id);continue;}// the moment passed
   const due=r.after?events.has(r.after)&&ctx.clock-events.get(r.after)>=(r.delay||0):ctx.distance>=r.at;
   if(!due)continue;
   // Wait for a quiet moment, except at the very end, which has nothing else to say.
   if(r.after!=='leaving'&&(captionBusy||quiet<1.2))return null;
   shown.add(r.id);ui.reflect(r.text,r.after==='leaving'?4.2:3.2);return r.id;}
  return null;
 }
 return {update,mark,reset,get shown(){return [...shown];}};
}
