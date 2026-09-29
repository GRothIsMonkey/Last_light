// Interface: title menu, pause menu, settings (saved in this browser), credits,
// contextual prompts and the memory-line overlay. Game logic calls in; nothing here
// knows about the world. Styling lives in style.css.
const KEY='lastlight.settings';
export const DEFAULTS={volume:1,sensitivity:1,quality:'medium',captions:true,memories:true,fullscreen:false};

export function createUI($,hooks={}){
 const settings={...DEFAULTS};
 try{Object.assign(settings,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch{}
 settings.fullscreen=false;// never restored on load: browsers only allow it from a click
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({...settings,fullscreen:false}));}catch{}};
 const on=(id,ev,fn)=>{const el=$(id);if(el)el.addEventListener?.(ev,fn);};
 const click=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
 // Settings form <-> settings object.
 const fields={volume:['set-volume','value',Number],sensitivity:['set-sensitivity','value',Number],quality:['set-quality','value',String],captions:['set-captions','checked',Boolean],memories:['set-memories','checked',Boolean],fullscreen:['set-fullscreen','checked',Boolean]};
 function fill(){for(const [k,[id,prop]] of Object.entries(fields)){const el=$(id);if(el)el[prop]=settings[k];}}
 function set(k,v){if(settings[k]===v)return;settings[k]=v;save();hooks.onSetting?.(k,v,settings);}
 for(const [k,[id,prop,cast]] of Object.entries(fields)){on(id,'input',e=>set(k,cast(e.target[prop])));on(id,'change',e=>set(k,cast(e.target[prop])));}
 // Panels: settings and credits open over the title or the pause menu, then return there.
 let returnTo=null;
 function openPanel(id,from){returnTo=from;for(const p of ['intro','pause'])if(p===from)$(p).hidden=true;fill();$(id).hidden=false;$(id).querySelector?.('button,input,select')?.focus?.();}
 function closePanels(){let closed=false;for(const id of ['settings','credits'])if(!$(id).hidden){$(id).hidden=true;closed=true;}if(closed&&returnTo){$(returnTo).hidden=false;returnTo=null;}return closed;}
 click('open-settings',()=>openPanel('settings','intro'));click('open-credits',()=>openPanel('credits','intro'));click('pause-settings',()=>openPanel('settings','pause'));
 click('settings-back',()=>closePanels());click('credits-back',()=>closePanels());
 // Contextual prompts: a key and a word, only when it matters.
 let promptKey='';
 function prompt(items){const key=items?items.map(i=>i.join(':')).join('|'):'';if(key===promptKey)return;promptKey=key;const el=$('prompt');
  if(!items||!items.length){el.classList?.remove('on');return;}
  el.innerHTML=items.map(([k,label])=>`<span>${k.split('+').map(x=>`<kbd>${x}</kbd>`).join('')} ${label}</span>`).join('');el.classList?.add('on');}
 // Memory lines fade in, stay a moment, fade out.
 let reflectT=0,reflectHold=0;
 function reflect(text,hold=3.2){const el=$('reflection');el.textContent=text;el.classList?.add('on');reflectT=0;reflectHold=hold+1.8;}
 function update(dt){if(reflectHold>0){reflectT+=dt;if(reflectT>=reflectHold){reflectHold=0;$('reflection').classList?.remove('on');}}}
 function clear(){prompt(null);reflectHold=0;reflectT=0;const r=$('reflection');r.classList?.remove('on');r.textContent='';}
 return {settings,prompt,reflect,update,clear,closePanels,openPanel,fill,get promptText(){return promptKey;},reflecting:()=>reflectHold>0,get reflection(){return reflectHold>0?$('reflection').textContent:'';}};
}
