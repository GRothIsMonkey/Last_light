// What you carry, at a glance (I, or the bag button on a touch screen): a small panel over the corner of the view, the
// walk held while it is open. Two short lists: what you have with you and can use (taken out, put away: the flashlight,
// Alex's camera) and what you have found (Alex's pictures, the clues, and what a friend is carrying for all of you).
// Nothing to manage: no slots, no weight, no crafting. The chapter says what there is (items()) and what using a thing
// does (use(id)); this only shows it and passes the choice on. Keys while open: W/S or the arrows to choose, F or Enter
// to take out / put away, I or Esc to close. A click on a row chooses it; a click on its action uses it.
export function createInventory({doc=globalThis.document,items,use,onOpen=null,onClose=null}={}){
 const S={open:false,sel:0,rows:[],shown:''};
 let el=null;try{el=doc?.createElement?.('div')||null;if(el){el.id='inventory';el.setAttribute?.('role','dialog');el.setAttribute?.('aria-label','What you carry');el.hidden=true;doc.body?.appendChild?.(el);}}catch{el=null;}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function render(){const L=items()||{carry:[],found:[]};S.rows=[...L.carry.map(q=>({...q,kind:'carry'})),...L.found.map(q=>({...q,kind:'found'}))];S.sel=Math.max(0,Math.min(S.sel,S.rows.length-1));if(!el)return;
  const row=(q,i)=>`<li class="inv-row${i===S.sel?' sel':''}${q.kind==='found'?' found':''}" data-i="${i}"><span class="inv-name">${esc(q.name)}</span>${q.state?`<span class="inv-state">${esc(q.state)}</span>`:''}${q.note?`<span class="inv-note">${esc(q.note)}</span>`:''}${q.action?`<button class="inv-act" data-i="${i}">${esc(q.action)}</button>`:''}</li>`;
  const carry=S.rows.filter(q=>q.kind==='carry'),found=S.rows.filter(q=>q.kind==='found');
  const html=`<div class="inv-head">With you</div><ul>${carry.map(q=>row(q,S.rows.indexOf(q))).join('')||'<li class="inv-none">Nothing yet.</li>'}</ul>`+
   (found.length?`<div class="inv-head">Found</div><ul>${found.map(q=>row(q,S.rows.indexOf(q))).join('')}</ul>`:'')+`<div class="inv-keys"><kbd>W</kbd><kbd>S</kbd> choose · <kbd>F</kbd> use · <kbd>I</kbd> close</div>`;
  if(html!==S.shown){S.shown=html;el.innerHTML=html;}}
 el?.addEventListener?.('click',e=>{const t=e.target?.closest?.('[data-i]');if(!t)return;const i=+t.dataset.i;S.sel=i;if(t.classList.contains('inv-act'))act();else render();});
 function open(){if(S.open)return;S.open=true;S.sel=0;S.shown='';render();if(el)el.hidden=false;onOpen?.();}
 function close(){if(!S.open)return;S.open=false;if(el)el.hidden=true;onClose?.();}
 function toggle(){S.open?close():open();}
 function act(){const q=S.rows[S.sel];if(q?.action)use(q.id);render();}
 // keys while it is open (all of them: nothing reaches the walk behind it)
 function key(code,repeat){if(code==='KeyI'||code==='Tab'){if(!repeat)toggle();return true;}if(!S.open)return false;
  if(code==='Escape'){close();return true;}if(repeat&&!/Arrow|Key[WS]/.test(code))return true;
  if(code==='KeyW'||code==='ArrowUp'){S.sel=(S.sel-1+S.rows.length)%Math.max(1,S.rows.length);render();}
  else if(code==='KeyS'||code==='ArrowDown'){S.sel=(S.sel+1)%Math.max(1,S.rows.length);render();}
  else if(code==='KeyF'||code==='Enter'||code==='Space')act();return true;}
 function update(){if(S.open)render();}
 function reset(){close();S.sel=0;}
 return {S,open,close,toggle,key,update,reset,el,get isOpen(){return S.open;},rows:()=>{render();return S.rows;}};
}
