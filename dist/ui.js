// Interface: the panels over the title or the pause menu (settings, credits, chapters), settings (saved in this
// browser), contextual prompts and the memory-line overlay. Game logic calls in; nothing here knows about the world.
// The title screen's presentation and navigation live in menu.js; styling in style.css.
const KEY='lastlight.settings';
// Older saved settings ({volume, sensitivity, quality, captions, memories}) load unchanged; the rest take these defaults.
export const DEFAULTS={volume:1,music:1,sfx:1,voice:1,muted:false,sensitivity:1,invertY:false,quality:'medium',renderScale:1,brightness:1,grain:true,
 captions:true,captionSize:'medium',memories:true,reduceFlashing:false,reduceMotion:false,fullscreen:false};
const PANELS=['settings','credits','chapters'];

export function createUI($,hooks={}){
 const settings={...DEFAULTS};
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');for(const k of Object.keys(DEFAULTS))if(saved?.[k]!==undefined&&typeof saved[k]===typeof DEFAULTS[k])settings[k]=saved[k];}catch{}
 settings.fullscreen=false;// never restored on load: browsers only allow it from a click
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({...settings,fullscreen:false}));}catch{}};
 const on=(id,ev,fn)=>{const el=$(id);if(el)el.addEventListener?.(ev,fn);};
 const click=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
 // Settings form <-> settings object.
 const fields={volume:['set-volume','value',Number],music:['set-music','value',Number],sfx:['set-sfx','value',Number],voice:['set-voice','value',Number],muted:['set-muted','checked',Boolean],
  sensitivity:['set-sensitivity','value',Number],invertY:['set-invert','checked',Boolean],quality:['set-quality','value',String],renderScale:['set-scale','value',Number],brightness:['set-brightness','value',Number],grain:['set-grain','checked',Boolean],
  captions:['set-captions','checked',Boolean],captionSize:['set-caption-size','value',String],memories:['set-memories','checked',Boolean],reduceFlashing:['set-flashing','checked',Boolean],reduceMotion:['set-motion','checked',Boolean],
  fullscreen:['set-fullscreen','checked',Boolean]};
 function fill(){for(const [k,[id,prop]] of Object.entries(fields)){const el=$(id);if(el)el[prop]=settings[k];}}
 function set(k,v){if(settings[k]===v)return;settings[k]=v;save();hooks.onSetting?.(k,v,settings);}
 for(const [k,[id,prop,cast]] of Object.entries(fields)){on(id,'input',e=>set(k,cast(e.target[prop])));on(id,'change',e=>set(k,cast(e.target[prop])));}
 // Every setting back to its default (full screen stays as it is: only a click may change it).
 function reset(){for(const k of Object.keys(DEFAULTS)){if(k==='fullscreen')continue;set(k,DEFAULTS[k]);}fill();}
 // Panels: settings, credits and chapters open over the title or the pause menu, then return there.
 let returnTo=null;
 function openPanel(id,from){returnTo=from;for(const p of ['intro','pause'])if(p===from)$(p).hidden=true;fill();$(id).hidden=false;hooks.onPanel?.(id,true);}
 function closePanels(){let closed=false;for(const id of PANELS){const el=$(id);if(el&&!el.hidden){el.hidden=true;closed=true;hooks.onPanel?.(id,false);}}if(closed&&returnTo){$(returnTo).hidden=false;returnTo=null;}return closed;}
 click('open-settings',()=>openPanel('settings','intro'));click('open-credits',()=>openPanel('credits','intro'));click('pause-settings',()=>openPanel('settings','pause'));
 click('settings-back',()=>closePanels());click('credits-back',()=>closePanels());
 // Contextual prompts: a key and a word, only when it matters.
 let promptKey='';
 function prompt(items){const key=items?items.map(i=>i.join(':')).join('|'):'';if(key===promptKey)return;promptKey=key;const el=$('prompt');
  if(!items||!items.length){el.classList?.remove('on');return;}
  el.innerHTML=items.map(([k,label])=>`<span class="${label==='Remember'?'memory-action':''}">${k.split('+').map(x=>`<kbd>${x}</kbd>`).join('')}${label==='Remember'?' — ': ' '}${label}</span>`).join('');el.classList?.add('on');}
 // Memory lines fade in, stay a moment, fade out.
 let reflectT=0,reflectHold=0;
 function reflect(text,hold=3.2){const el=$('reflection');el.textContent=text;el.classList?.add('on');reflectT=0;reflectHold=hold+1.8;}
 function update(dt){if(reflectHold>0){reflectT+=dt;if(reflectT>=reflectHold){reflectHold=0;$('reflection').classList?.remove('on');}}}
 function clear(){prompt(null);reflectHold=0;reflectT=0;const r=$('reflection');r.classList?.remove('on');r.textContent='';}
 return {settings,prompt,reflect,update,clear,closePanels,openPanel,fill,set,reset,get promptText(){return promptKey;},reflecting:()=>reflectHold>0,get reflection(){return reflectHold>0?$('reflection').textContent:'';}};
}
