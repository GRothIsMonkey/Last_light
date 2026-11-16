// The final credits, after the 2026 coda's title. Dark, quiet, readable: off-white text rising slowly over near-black, the Prologue's
// own melody under it (audio.js theme(): the game's synthesized motif, no licensed recording), then the dedication on its own, long
// enough to read twice, and the end screen. Skip (Esc, Space, Enter or the button) goes to the dedication; again, past it.
//
// Every name here is one the repository itself establishes (docs/FINAL_CREDITS_AND_RELEASE_HANDOFF.md says where each comes from).
// Nothing is invented: the creator's credited name is the repository's commit author name and must be confirmed before a release; there
// is no special-thanks list because none is recorded (the slot is empty, not filled with guesses). The one third-party asset still in
// the game is credited as its licence (CC BY 4.0) requires.
export const CREDITS=[
 {title:'LAST LIGHT'},
 {role:'Created by',names:['Grayson']},
 {role:'Story and creative direction',names:['Grayson']},
 {role:'Writing, game design and development',names:['Claude (Anthropic)']},
 {role:'Visual development',names:['Astra (the art passes)','directed by Grayson']},// (the repository's own name for its visual passes, on its codex/astra-* branches; who or what Astra is, it does not say: to confirm)
 {role:'Music and sound',names:['Synthesized by the game as you play','The Prologue’s melody and every sound in Last Light are written in code']},
 {role:'Third-party asset',names:['“Smily horror monster” by Bento','sketchfab.com/gostbento · skfb.ly/6W6ut','Licensed under Creative Commons Attribution 4.0','creativecommons.org/licenses/by/4.0','Modified and optimized for Last Light.','The author does not endorse Last Light or this use.']},
 {role:'Built with',names:['Three.js r160','© 2010–2023 three.js authors · MIT License']},
 {role:'Tested with',names:['Node.js','Chromium, through Playwright']},
 {role:'Special thanks',names:[],slot:true},// (none recorded: shown only when names are added)
];
export const DEDICATION=['For Jamie and Alex.','And for every summer we thought would last forever.'];
export const SAVE_COMPLETE='lastlight.complete';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function createFinalCredits({$,doc=globalThis.document,audio=()=>null,onDone=null,onStart=null}={}){
 const S={active:false,phase:null,t:0,dur:92,y:0,h:1600,vh:900,skips:0,plays:0,log:[]};
 let el=null,roll=null,ded=null,lines=[],btn=null;
 function build(){if(el)return;try{el=$('final-credits')||null;if(!el&&doc?.createElement){el=doc.createElement('section');el.id='final-credits';el.setAttribute?.('aria-label','Credits');doc.body?.appendChild?.(el);}}catch{el=null;}
  if(!el)return;el.hidden=true;
  const parts=CREDITS.filter(c=>!c.slot||c.names.length).map(c=>c.title?`<h2 class="fc-title">${esc(c.title)}</h2>`:`<div class="fc-block"><div class="fc-role">${esc(c.role)}</div>${c.names.map(n=>`<div class="fc-name">${esc(n)}</div>`).join('')}</div>`).join('');
  el.innerHTML=`<div class="fc-roll">${parts}</div><div class="fc-dedication">${DEDICATION.map(l=>`<p>${esc(l)}</p>`).join('')}</div><button class="fc-skip" type="button">Skip <span>›</span></button>`;
  roll=el.querySelector?.('.fc-roll')||null;ded=el.querySelector?.('.fc-dedication')||null;lines=[...(el.querySelectorAll?.('.fc-dedication p')||[])];btn=el.querySelector?.('.fc-skip')||null;
  if(btn)btn.onclick=()=>skip();}
 function measure(){S.vh=globalThis.innerHeight||900;try{const r=roll?.getBoundingClientRect?.();S.h=r&&r.height?r.height:1600;}catch{S.h=1600;}
  // (about thirty-eight pixels a second: slow enough to read every line, never a crawl)
  S.dur=Math.max(64,Math.min(120,(S.vh+S.h)/38));}
 function play({again=false}={}){build();S.active=true;S.phase='roll';S.t=0;S.skips=0;S.plays++;if(el){el.hidden=false;el.classList?.add('on');el.classList?.remove('done');}
  for(const l of lines){if(l.style)l.style.opacity=0;}if(ded?.style)ded.style.opacity=0;if(roll?.style)roll.style.opacity=1;
  measure();place(0);
  try{localStorage.setItem(SAVE_COMPLETE,JSON.stringify({complete:true,at:Date.now(),plays:S.plays}));}catch{}
  audio()?.theme?.(true);onStart?.({again});mark('play');}
 const mark=w=>{S.log.push([+S.t.toFixed(1),w]);};
 function place(u){S.y=S.vh-(S.vh+S.h)*u;if(roll?.style)roll.style.transform=`translate(-50%,${S.y.toFixed(1)}px)`;}
 function update(dt){if(!S.active)return;S.t+=dt;
  if(S.phase==='roll'){const u=Math.min(1,S.t/S.dur);place(u);if(u>=1){S.phase='ded';S.t=0;mark('dedication');}}
  else if(S.phase==='ded'){if(roll?.style)roll.style.opacity=0;// (the roll fades out over 2.5 s (CSS); the first line only after it has gone)
   const a=Math.min(1,Math.max(0,(S.t-2.8)/2.4)),b=Math.min(1,Math.max(0,(S.t-6)/2.4));
   if(ded?.style)ded.style.opacity=1;if(lines[0]?.style)lines[0].style.opacity=a.toFixed(3);if(lines[1]?.style)lines[1].style.opacity=b.toFixed(3);
   if(S.t>17.4){S.phase='out';S.t=0;mark('out');}}
  else if(S.phase==='out'){const k=Math.max(0,1-S.t/3.2);if(ded?.style)ded.style.opacity=k.toFixed(3);if(S.t>3.6)finish();}}
 function skip(){if(!S.active)return;S.skips++;if(S.phase==='roll'){S.phase='ded';S.t=0;mark('skip to dedication');}else if(S.phase==='ded'){if(S.t<8.4)S.t=Math.max(S.t,8.4);else{S.phase='out';S.t=0;}mark('skip');}else if(S.phase==='out')finish();}
 function finish(){if(!S.active)return;S.active=false;S.phase='done';if(el){el.hidden=true;el.classList?.remove('on');el.classList?.add('done');}audio()?.theme?.(false);mark('done');onDone?.();}
 function stop(){if(!S.active&&!el)return;S.active=false;S.phase=null;if(el){el.hidden=true;el.classList?.remove('on');}audio()?.theme?.(false);}
 return {play,update,skip,stop,finish,get active(){return S.active;},state:()=>({active:S.active,phase:S.phase,t:+S.t.toFixed(2),dur:+S.dur.toFixed(1),y:+S.y.toFixed(1),skips:S.skips,plays:S.plays,log:S.log.slice(-12)}),
  text:()=>({credits:CREDITS.filter(c=>!c.slot||c.names.length),dedication:DEDICATION})};
}
