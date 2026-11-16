// The title screen and its menus: the boot curtain, the title's reveal and "press any key", the main menu and the
// small light that follows your choice, Chapters, Settings (tabs, sliders, switches), Credits (a slow roll), the
// confirmation before anything that cannot be undone, Quit's goodnight, and keyboard / mouse navigation for all of
// it (the pause menu too). It owns the menu's sound (menu-audio.js) and its 2D layers over the live title scene.
//
// It never touches the story directly: everything the game does goes through the hooks game.js passes in
// (start, jumpTo, startChapter, setSound …), the same functions the old title used.
//
// Notes for the headless test harness (tests/verify.mjs mocks a tiny DOM): every DOM call here is guarded, no
// requestAnimationFrame or timers of its own (game.js's frame() calls frame(dt)), and listeners go on `document`
// (the mock keeps one window listener per event type: those belong to game.js).
import {CHAPTER_INFO,TITLE_TEXT} from './menu-data.js';
import {CHAPTER_NAMES} from './progress.js';
import {createMenuAudio} from './menu-audio.js';
import {CHAPTER_ART} from './menu-art.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function createMenu(o){
 const {$,ui,progress,titleScene,titleArt=null,showTitleArt=null,qa=false}=o;
 const doc=typeof document!=='undefined'?document:null,body=doc?.body;
 const cls=(el,c,on)=>{if(!el?.classList)return;if(on)el.classList.add(c);else el.classList.remove(c);};
 const all=sel=>{try{return [...(doc?.querySelectorAll?.(sel)||[])];}catch{return [];}};
 const inside=(el,sel)=>{try{return [...(el?.querySelectorAll?.(sel)||[])];}catch{return [];}};
 const attr=(el,k,v)=>{try{el?.setAttribute?.(k,String(v));}catch{}};
 const getAttr=(el,k)=>{try{return el?.getAttribute?.(k)??null;}catch{return null;}};
 const shown=el=>!!el&&!el.hidden;
 const safe=fn=>(...a)=>{try{return fn(...a);}catch(e){if(qa)console.error('[menu]',e);}};
 // (automation: ?qa in a browser, or the headless harness's tiny DOM. No splash, no questions, no timers.)
 const auto=qa||typeof doc?.querySelector!=='function';
 const sound=createMenuAudio();

 // ---- state -------------------------------------------------------------------------------------------------------
 const S={phase:'boot',t:0,reveal:-1,splash:false,title:true,screen:'main',focus:{},busy:false,confirmFn:null,creditsIdle:0,
  flick:null,motes:null,pollT:0,lastFade:-1,mood:'summer',chapterSel:0,sleeping:false,enterT:0,art:false};
 const settings=ui.settings;

 // ---- the title's text and mood -------------------------------------------------------------------------------------
 function applyMood(){const m=progress.mood();S.mood=m;for(const k of ['summer','search','after'])cls(body,'mood-'+k,k===m);
  const T=TITLE_TEXT[m]||TITLE_TEXT.summer,eb=$('title-eyebrow'),tg=$('title-tagline');if(eb)eb.innerHTML=T.eyebrow;if(tg)tg.innerHTML=T.tagline;
  sound.setMood(m);}

 // ---- Continue: where, and when -----------------------------------------------------------------------------------------
 function when(at){if(!Number.isFinite(at))return '';const d=new Date(at),now=Date.now(),mins=Math.round((now-at)/60000);
  const clock=d.toLocaleTimeString?.([], {hour:'numeric',minute:'2-digit'})||'';
  if(mins<1)return 'Saved just now';if(mins<60)return `Saved ${mins} minute${mins===1?'':'s'} ago`;
  const days=Math.floor((new Date(now).setHours(0,0,0,0)-new Date(at).setHours(0,0,0,0))/864e5);
  if(days===0)return `Saved today, ${clock}`;if(days===1)return `Saved yesterday, ${clock}`;
  return `Saved ${MONTHS[d.getMonth()]} ${d.getDate()}, ${clock}`;}
 function refreshContinue(){const s=progress.saved(),b=$('continue');if(!b)return;
  // (game.js's showContinue() decides whether Continue is shown and what it does; this only adds the details)
  const w=$('continue-where'),t=$('continue-when');
  if(s&&w)w.textContent=(s.chapterName?s.chapterName+' · ':'')+s.label;if(t)t.textContent=s?when(s.at):'';}

 // ---- the light beside the focused main-menu item ---------------------------------------------------------------------
 function placeLight(el){const nav=$('main-menu'),dot=nav?.querySelector?.('.mm-light');if(!dot||!el)return;
  const y=el.offsetTop+(el.querySelector?.('.mm-label')?.offsetHeight||el.offsetHeight)/2+((el.querySelector?.('.mm-label')?.offsetTop)||0);
  try{dot.style.setProperty('--mm-y',y+'px');}catch{}cls(nav,'has-focus',true);}

 // ---- screens and what can be focused on each -------------------------------------------------------------------------
 function currentScreen(){if(shown($('farewell')))return 'farewell';if(shown($('confirm')))return 'confirm';
  for(const id of ['settings','chapters','credits'])if(shown($(id)))return id;
  if(shown($('pause')))return 'pause';if(shown($('intro'))&&S.title)return 'main';return null;}
 function focusables(screen){
  if(screen==='main')return inside($('main-menu'),'.mm-item').filter(b=>!b.hidden&&!b.disabled);
  if(screen==='pause')return inside($('pause'),'.mm-item').filter(b=>!b.hidden);
  if(screen==='confirm')return [$('confirm-no'),$('confirm-yes')].filter(Boolean);
  if(screen==='farewell')return [$('farewell-back')].filter(Boolean);
  if(screen==='credits')return [$('credits-back')].filter(Boolean);
  if(screen==='chapters')return [...inside($('chapter-list'),'button'),...(shown($('chapter-begin'))&&!$('chapter-detail')?.classList?.contains('locked')?[$('chapter-begin')]:[]),$('chapters-back')].filter(Boolean);
  if(screen==='settings'){const pane=inside($('settings'),'.st-pane').find(p=>!p.hidden),tab=inside($('settings'),'.st-tab').find(t=>getAttr(t,'aria-selected')==='true');
   const rows=inside(pane,'.st-row').map(r=>r.querySelector?.('input:not(.seg-native),.seg,button')).filter(Boolean);
   return [tab,...rows,$('settings-back')].filter(Boolean);}
  return [];}
 function setFocus(screen,el,{silent=false,scroll=true}={}){if(!el)return;const prev=S.focus[screen];S.focus[screen]=el;
  for(const f of focusables(screen))cls(f,'is-focus',f===el);
  for(const r of inside($('settings'),'.st-row'))cls(r,'is-focus',r.contains?.(el)&&screen==='settings');
  try{(el.classList?.contains('seg')?el.querySelector('[aria-pressed="true"]')||el.querySelector('button'):el).focus?.({preventScroll:!scroll});}catch{}
  if(scroll)try{el.scrollIntoView?.({block:'nearest'});}catch{}
  if(screen==='main')placeLight(el);
  if(screen==='chapters'&&el.parentElement?.parentElement===$('chapter-list'))selectChapter(+el.value,{silent:true});
  if(prev&&prev!==el&&!silent)sound.ui('move');}
 function move(screen,dir){const list=focusables(screen);if(!list.length)return;const cur=list.indexOf(S.focus[screen]);
  let i=cur<0?(dir>0?0:list.length-1):cur+dir;if(screen==='main'||screen==='pause')i=(i+list.length)%list.length;else i=clamp(i,0,list.length-1);
  if(i!==cur)setFocus(screen,list[i]);}
 function firstFocus(screen){const list=focusables(screen);if(!list.length)return;
  const keep=list.includes(S.focus[screen])?S.focus[screen]:null;
  const pick=keep||(screen==='main'?(list.find(b=>b.id==='continue')||list.find(b=>b.id==='start')):screen==='confirm'?$('confirm-no'):screen==='chapters'?list.find(b=>b.getAttribute?.('aria-selected')==='true')||list[0]:list[0]);
  setFocus(screen,pick||list[0],{silent:true});}

 // ---- opening and closing screens (settings and credits keep ui.js's panel logic, which the tests rely on) ---------------
 function open(id){const from=shown($('pause'))?'pause':'intro';if(id==='chapters')buildChapters();if(id==='settings'){selectTab(S.tab||'audio',{silent:true});fillOutputs();}
  ui.openPanel(id,from);if(id==='credits')startCredits();sound.ui('open');firstFocus(id);}
 function back(){const scr=currentScreen();
  if(scr==='confirm'){answer(false);return true;}
  if(scr==='farewell'){wake();return true;}
  if(scr==='settings'||scr==='chapters'||scr==='credits'){ui.closePanels();sound.ui('back');afterClose();return true;}
  return false;}
 function afterClose(){const scr=currentScreen();if(scr)firstFocus(scr);}

 // ---- the confirmation --------------------------------------------------------------------------------------------------
 function ask({title,text,yes='Yes',no='Not yet'},fn){if(auto){fn(true);return;}// (automation answers yes: tests click straight through)
  const c=$('confirm');if(!c){fn(true);return;}S.confirmFn=fn;S.confirmFrom=currentScreen();
  $('confirm-title').textContent=title;$('confirm-text').textContent=text;$('confirm-yes').querySelector('.mm-label').textContent=yes;$('confirm-no').querySelector('.mm-label').textContent=no;
  c.hidden=false;sound.ui('open');firstFocus('confirm');}
 function answer(yes){const c=$('confirm');if(!c||c.hidden)return;c.hidden=true;const fn=S.confirmFn;S.confirmFn=null;sound.ui(yes?'confirm':'back');
  const from=S.confirmFrom;if(from&&!yes)firstFocus(from);fn?.(yes);}

 // ---- New Game, Continue, a chapter ------------------------------------------------------------------------------------
 function newGame(){if(S.busy)return;const s=progress.saved();
  const go=()=>{sound.ui('begin');leaveTitle();o.start();};
  if(s&&!auto)ask({title:'Begin again?',text:`Your place in ${s.chapterName||'the story'} (${s.label}) will be replaced once you reach the first checkpoint of the new game.`,yes:'Begin again'},y=>{if(y)go();});
  else go();}
 function beginChapter(n){if(S.busy||!progress.unlocked(n))return;const info=CHAPTER_INFO[n],s=progress.saved();
  const go=()=>{S.busy=true;sound.ui('begin');const note=doc?.querySelector?.('#boot .boot-note');if(note)note.textContent=`${info.name} · ${info.date.split(' · ')[0]}`;cls(body,'chapter-loading',true);
   const run=()=>{try{ui.closePanels();leaveTitle();o.startChapter(n);progress.record(n);}catch(e){console.error(e);o.toTitle?.();}finally{S.busy=false;cls(body,'chapter-loading',false);}};
   // (a moment for the screen to go dark before the hand-over runs; still inside the click's user activation)
   if(!auto&&typeof requestAnimationFrame==='function'&&typeof setTimeout==='function')requestAnimationFrame(()=>setTimeout(run,30));else run();};
  if(s&&!auto&&s.chapter!==n)ask({title:`Begin ${info.name}?`,text:`Your place in ${s.chapterName||'the story'} (${s.label}) will be replaced by this chapter’s start.`,yes:'Begin'},y=>{if(y)go();});
  else go();}
 function leaveTitle(){S.title=false;sound.leave();cls(body,'splash',false);cls(body,'revealing',false);S.art=false;cls(body,'art-on',false);cls(body,'tw-hush',false);}

 // ---- Chapters ---------------------------------------------------------------------------------------------------------------
 let art=CHAPTER_ART;// (a still from each chapter, rendered by the game: menu-art.js; the painted stand-ins in menu-data.js otherwise)
 function buildChapters(){const list=$('chapter-list');if(!list||!doc?.createElement)return;list.replaceChildren?.();
  const save=progress.saved(),here=save?.chapter;
  for(const c of CHAPTER_INFO){const open=progress.unlocked(c.n),li=doc.createElement('li'),b=doc.createElement('button');
   b.type='button';b.value=String(c.n);b.className=open?'':'locked';attr(b,'role','option');attr(b,'aria-selected','false');
   b.innerHTML=`<span class="cl-num">${c.num}</span><span class="cl-name">${open?c.name:c.name}</span><span class="cl-tag">${c.n===here?'Your place':''}</span>`;
   attr(b,'aria-label',open?`${c.name}${c.title?': '+c.title:''}`:`${c.name}, not yet remembered`);
   b.addEventListener?.('click',()=>{selectChapter(c.n);setFocus('chapters',b,{silent:true});});
   b.addEventListener?.('dblclick',()=>beginChapter(c.n));
   b.addEventListener?.('pointerenter',()=>{if(currentScreen()==='chapters')setFocus('chapters',b);});
   li.append?.(b);list.append?.(li);}
  const start=here??Math.min(progress.furthest(),9);selectChapter(start,{silent:true});}
 function selectChapter(n,{silent=false}={}){const c=CHAPTER_INFO[n];if(!c)return;S.chapterSel=n;const open=progress.unlocked(n),save=progress.saved();
  for(const b of inside($('chapter-list'),'button'))attr(b,'aria-selected',+b.value===n?'true':'false');
  const d=$('chapter-detail');cls(d,'locked',!open);
  const img=$('cd-art-img');if(img?.style){const still=art?.[n];img.style.backgroundImage=still?`url(${still})`:c.art;}
  $('cd-stamp')&&($('cd-stamp').textContent=open?c.stamp:'');
  $('cd-eyebrow')&&($('cd-eyebrow').textContent=open?`${c.name} · ${c.date}`:c.name);
  $('cd-title')&&($('cd-title').textContent=open?c.title:'');
  $('cd-place')&&($('cd-place').textContent=open?c.place:'Not yet remembered.');
  $('cd-text')&&($('cd-text').textContent=open?c.text:'Play on to reach this part of the summer. Nothing about it is shown until you get there.');
  const note=$('cd-note');if(note)note.textContent=!open?'':save?.chapter===n?`Continue from the title returns to “${save.label}”.`:save?'Begins at the very start of this chapter.':'';
  if(!silent)sound.ui('move');}

 // ---- Settings: tabs, sliders, switches, segmented choices -------------------------------------------------------------
 function selectTab(name,{silent=false}={}){S.tab=name;for(const t of inside($('settings'),'.st-tab')){const on=t.getAttribute?.('data-pane')===name;attr(t,'aria-selected',on?'true':'false');attr(t,'tabindex',on?'0':'-1');}
  for(const p of inside($('settings'),'.st-pane'))p.hidden=p.id!=='pane-'+name;if(!silent)sound.ui('tab');fillOutputs();}
 function fmt(input,kind){const v=+input.value;if(kind==='x')return v.toFixed(2).replace(/0$/,'')+'×';return Math.round(v*100)+'%';}
 function fillOutputs(){for(const out of inside($('settings'),'output[data-for]')){const input=$(out.getAttribute('data-for'));if(!input)continue;out.textContent=fmt(input,out.getAttribute('data-fmt'));
   const min=+input.min||0,max=+input.max||1,pct=(+input.value-min)/((max-min)||1)*100;try{input.style.setProperty('--fill',pct+'%');}catch{}}
  for(const seg of inside($('settings'),'.seg')){const sel=$(seg.getAttribute('data-select'));for(const b of inside(seg,'button'))attr(b,'aria-pressed',b.getAttribute('data-value')===sel?.value?'true':'false');}}
 function setSeg(seg,value){const sel=$(seg.getAttribute('data-select'));if(!sel||sel.value===value)return;sel.value=value;sel.dispatchEvent?.(new Event('input',{bubbles:true}));sel.dispatchEvent?.(new Event('change',{bubbles:true}));fillOutputs();sound.ui('tick',{value:inside(seg,'button').findIndex(b=>b.getAttribute('data-value')===value)/3});}
 function nudge(el,dir){// ← → on the focused control
  if(el?.classList?.contains('st-tab')){const tabs=inside($('settings'),'.st-tab'),i=tabs.indexOf(el),n=tabs[clamp(i+dir,0,tabs.length-1)];if(n&&n!==el){selectTab(n.getAttribute('data-pane'));setFocus('settings',n,{silent:true});}return true;}
  if(el?.type==='range'){const step=+el.step||.05,v=clamp(+el.value+dir*step,+el.min,+el.max);if(v!==+el.value){el.value=String(+v.toFixed(4));el.dispatchEvent?.(new Event('input',{bubbles:true}));el.dispatchEvent?.(new Event('change',{bubbles:true}));fillOutputs();sound.ui('tick',{value:(v-el.min)/((el.max-el.min)||1)});}return true;}
  if(el?.type==='checkbox'){const want=dir>0;if(el.checked!==want){el.checked=want;el.dispatchEvent?.(new Event('input',{bubbles:true}));el.dispatchEvent?.(new Event('change',{bubbles:true}));sound.ui(want?'on':'off');}return true;}
  if(el?.classList?.contains('seg')){const btns=inside(el,'button'),sel=$(el.getAttribute('data-select')),i=btns.findIndex(b=>b.getAttribute('data-value')===sel?.value),n=btns[clamp(i+dir,0,btns.length-1)];if(n)setSeg(el,n.getAttribute('data-value'));return true;}
  return false;}
 function wireSettings(){
  for(const t of inside($('settings'),'.st-tab')){t.addEventListener?.('click',()=>{selectTab(t.getAttribute('data-pane'));setFocus('settings',t,{silent:true});});t.addEventListener?.('pointerenter',()=>{if(currentScreen()==='settings')cls(t,'hover',true);});}
  for(const seg of inside($('settings'),'.seg'))for(const b of inside(seg,'button'))b.addEventListener?.('click',()=>{setSeg(seg,b.getAttribute('data-value'));setFocus('settings',seg,{silent:true});});
  for(const input of inside($('settings'),'input')){input.addEventListener?.('input',()=>{fillOutputs();if(input.type==='range')sound.ui('tick',{value:(input.value-input.min)/((input.max-input.min)||1),throttle:true});});
   if(input.type==='checkbox')input.addEventListener?.('change',()=>sound.ui(input.checked?'on':'off'));
   input.addEventListener?.('focus',()=>{if(currentScreen()==='settings'&&S.focus.settings!==input)setFocus('settings',input,{silent:true,scroll:false});});}
  for(const row of inside($('settings'),'.st-row'))row.addEventListener?.('pointerenter',()=>{const c=row.querySelector?.('input:not(.seg-native),.seg,button');if(c&&currentScreen()==='settings')setFocus('settings',c,{silent:true,scroll:false});});
  const reset=$('settings-reset');if(reset)reset.onclick=()=>ask({title:'Reset every setting?',text:'Volume, display, controls and captions go back to how they started.',yes:'Reset'},y=>{if(!y)return;ui.reset?.();fillOutputs();firstFocus('settings');});}

 // ---- Credits: a slow roll you can take over at any time ------------------------------------------------------------------
 function startCredits(){const r=$('credits-roll');if(r){r.scrollTop=0;S.creditsIdle=-1.6;}}
 function creditsFrame(dt){const r=$('credits-roll');if(!r||!shown($('credits'))||settings.reduceMotion)return;S.creditsIdle+=dt;if(S.creditsIdle<0)return;
  const max=r.scrollHeight-r.clientHeight;if(r.scrollTop<max-1){S.creditsAcc=(S.creditsAcc||0)+dt*26;const step=Math.floor(S.creditsAcc);if(step>0){S.creditsAcc-=step;r.scrollTop+=step;}}}
 function creditsTouch(){S.creditsIdle=-5;}

 // ---- Quit: goodnight -------------------------------------------------------------------------------------------------------
 function quit(){ask({title:'Go home for the night?',text:'The evening will be here when you come back. Your place is kept.',yes:'Goodnight'},y=>{if(!y)return;
  const f=$('farewell');if(f)f.hidden=false;S.sleeping=true;sound.sleep();firstFocus('farewell');try{if(!auto)window.close?.();}catch{}});}
 function wake(){const f=$('farewell');if(f)f.hidden=true;S.sleeping=false;sound.wake(settings);firstFocus('main');}

 // ---- the title: boot, reveal, press any key --------------------------------------------------------------------------------
 function booted(){if(S.phase!=='boot')return;cls(body,'booting',false);applyMood();refreshContinue();
  if(auto||!S.title){S.phase='menu';showMenu({instant:true});return;}
  S.phase='reveal';S.t=0;cls(body,'splash',true);cls(body,'revealing',true);}
 function revealFrame(dt){S.t+=dt;const t=S.t;
  if(t>.9)cls(body,'rv-1',true);if(t>1.9)cls(body,'rv-2',true);if(t>3.1)cls(body,'rv-3',true);
  if(t>4.2&&!S.splash){S.splash=true;cls(body,'splash-ready',true);}}
 function dismissSplash(){if(S.phase!=='reveal')return;S.phase='menu';sound.unlock(settings);o.setSound?.(!settings.muted);
  for(const c of ['rv-1','rv-2','rv-3'])cls(body,c,true);cls(body,'revealing',false);cls(body,'splash-ready',false);cls(body,'splash',false);showMenu();sound.ui('begin',{soft:true});}
 function showMenu({instant=false}={}){S.title=true;S.screen='main';const items=focusables('main');items.forEach((b,i)=>{try{b.style.setProperty('--i',i);}catch{}});
  if(!instant&&!auto){cls(body,'menu-enter',true);S.enterT=2.2;}firstFocus('main');}

 // Called by game.js when the player comes back to the title from the game.
 function showTitle(){S.title=true;S.busy=false;applyMood();refreshContinue();const f=$('farewell');if(f)f.hidden=true;
  if(S.phase==='boot')return;S.phase='menu';cls(body,'splash',false);cls(body,'revealing',false);showMenu();sound.enter(settings);}
 function hideTitle(){leaveTitle();}
 function onPause(){firstFocus('pause');}

 // ---- 2D layers over the scene: out-of-focus fireflies and dust ---------------------------------------------------------------
 function motesFrame(dt){const cv=$('title-motes');if(!cv?.getContext||!S.title)return;const M=S.motes||(S.motes={t:0,acc:0,list:[],w:0,h:0,ctx:null,mood:''});
  M.acc+=dt;M.t+=dt;if(M.acc<1/30)return;const step=M.acc;M.acc=0;
  const W=Math.max(2,Math.round((cv.clientWidth||innerWidth)/2)),H=Math.max(2,Math.round((cv.clientHeight||innerHeight)/2));
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}const g=M.ctx||(M.ctx=cv.getContext('2d'));if(!g)return;
  const still=settings.reduceMotion,mood=S.mood;
  if(M.mood!==mood||!M.list.length){M.mood=mood;const flies=mood==='after'?4:mood==='search'?9:14,dust=mood==='after'?26:18;M.list=[];
   for(let i=0;i<flies;i++)M.list.push({k:'fly',x:.35+Math.random()*.65,y:.3+Math.random()*.6,r:6+Math.random()*16,vx:(Math.random()-.5)*.006,vy:(Math.random()-.5)*.004,p:Math.random()*20,s:.35+Math.random()*.6});
   for(let i=0;i<dust;i++)M.list.push({k:'dust',x:Math.random(),y:Math.random(),r:.8+Math.random()*1.6,vx:.002+Math.random()*.004,vy:-.001-Math.random()*.003,p:Math.random()*10,s:1});}
  g.clearRect(0,0,W,H);if(still||S.art)return;// (over the title art: no motes; its sky must not fill with points of light)
  for(const m of M.list){m.x+=(m.vx+Math.sin(M.t*.3+m.p)*.0015)*step*6;m.y+=(m.vy+Math.cos(M.t*.23+m.p)*.001)*step*6;if(m.x>1.08)m.x=-.05;if(m.x<-.08)m.x=1.05;if(m.y<-.08)m.y=1.05;if(m.y>1.08)m.y=-.05;
   const x=m.x*W,y=m.y*H;
   if(m.k==='fly'){const b=Math.pow(Math.max(0,Math.sin(M.t*(.5+m.s*.6)+m.p)),6)*Math.min(1,Math.max(0,(m.x-.34)/.12));if(b<.02)continue;const r=m.r*(.7+.5*b),grd=g.createRadialGradient(x,y,0,x,y,r);
    const c=mood==='after'?'255,190,150':'228,255,160';grd.addColorStop(0,`rgba(${c},${.55*b})`);grd.addColorStop(.35,`rgba(${c},${.18*b})`);grd.addColorStop(1,`rgba(${c},0)`);g.fillStyle=grd;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();}
   else{const a=.16+.12*Math.sin(M.t*.7+m.p);g.fillStyle=mood==='after'?`rgba(200,196,200,${a})`:`rgba(255,226,180,${a})`;g.beginPath();g.arc(x,y,m.r,0,6.283);g.fill();}}}

 // ---- the lamp over the oak stutters, and so does the title's "Light" -------------------------------------------------------
 function flickerFrame(dt){const F=S.flick;const el=doc?.querySelector?.('#intro .tw-light');if(!F){return;}F.t+=dt;let lv=1;for(const [at,v] of F.steps)if(F.t>=at)lv=v;cls(el,'out',lv<.5);
  if(F.t>F.steps[F.steps.length-1][0]+.05){cls(el,'out',false);S.flick=null;}}
 // (the live 3D title's events: only while it is the title on screen; the title art has its own)
 const live=()=>S.title&&!S.art;
 titleScene.on('flicker',d=>{if(!live()||settings.reduceFlashing)return;if(d.lookout)S.flick={t:0,steps:d.steps};sound.event('flicker',d);});
 titleScene.on('bell',d=>{if(live())sound.event('bell',d);});
 titleScene.on('figure',()=>{if(live())sound.event('figure');});
 titleScene.on('gone',()=>{if(live())sound.event('gone');});
 titleScene.on('cut',d=>{if(live())sound.event('cut',d);});

 // ---- the title art's events: the title loses letters when the picture loses something; the sound answers ----------------
 // A faded letter keeps its ghost (the afterimage stays, as the bike's shadow does). Slow fades only: nothing flashes.
 function letter(sel,on){const el=doc?.querySelector?.('#title-word '+sel);cls(el,'tw-gone',!!on);}
 if(titleArt?.on){
  titleArt.on('absence',d=>{if(!S.title)return;letter('.tw-last b:nth-child(4)',d?.gone);sound.event('absence',d);});
  titleArt.on('erase',()=>{if(!S.title)return;letter('.tw-light b:nth-child(4)',true);S.eraseT=8.5;sound.event('erase');});
  titleArt.on('dark',()=>{if(S.title)sound.event('dark');});
  titleArt.on('bell',d=>{if(S.title)sound.event('bell',{...d,wrong:true});});
  titleArt.on('silence',d=>{if(!S.title)return;sound.event('silence',d);cls(body,'tw-hush',true);S.hushT=(d?.dur||4.5)+1;});
  titleArt.on('ready',()=>{for(const b of all('#title-word b'))cls(b,'tw-gone',false);});}
 function artFrame(dt){const on=!!(titleArt?.active&&S.title);if(on!==S.art){S.art=on;cls(body,'art-on',on);if(on){S.flick=null;cls(doc?.querySelector?.('#intro .tw-light'),'out',false);}}
  if(S.eraseT>0){S.eraseT-=dt;if(S.eraseT<=0)letter('.tw-light b:nth-child(4)',false);}
  if(S.hushT>0){S.hushT-=dt;if(S.hushT<=0)cls(body,'tw-hush',false);}}

 // ---- each frame (game.js) -------------------------------------------------------------------------------------------------------
 const frame=safe(function frame(dt){
  S.pollT+=dt;if(S.pollT>2){S.pollT=0;if(!S.title)progress.poll();}
  if(S.enterT>0){S.enterT-=dt;if(S.enterT<=0)cls(body,'menu-enter',false);}
  if(!S.title)return;
  if(S.phase==='reveal')revealFrame(dt);
  artFrame(dt);
  const f=S.art?0:titleScene.fade,cut=doc?.querySelector?.('#title-layers .tl-cut');if(cut?.style&&Math.abs(f-S.lastFade)>.004){cut.style.opacity=String(f*.94);S.lastFade=f;}
  flickerFrame(dt);motesFrame(dt);creditsFrame(dt);sound.frame(dt,settings);});

 // ---- input ------------------------------------------------------------------------------------------------------------------------
 const KEYS_MOVE={ArrowUp:-1,ArrowDown:1,KeyW:-1,KeyS:1},KEYS_SIDE={ArrowLeft:-1,ArrowRight:1,KeyA:-1,KeyD:1};
 const onKey=safe(function onKey(e){if(e.repeat&&!(e.code in KEYS_MOVE||e.code in KEYS_SIDE))return;
  if(S.phase==='boot')return;
  if(S.phase==='reveal'){if(['ShiftLeft','ShiftRight','ControlLeft','ControlRight','AltLeft','AltRight','MetaLeft','MetaRight','Tab'].includes(e.code))return;if(e.code==='KeyM')return;// (M still mutes)
   e.preventDefault?.();e.stopPropagation?.();if(S.t<4.2){S.t=4.2;revealFrame(0);}dismissSplash();return;}
  const scr=currentScreen();if(!scr||S.busy&&scr!=='confirm')return;
  const focus=S.focus[scr],stop=()=>{e.preventDefault?.();e.stopPropagation?.();};
  if(scr==='credits'&&['ArrowUp','ArrowDown','PageUp','PageDown','Space','KeyW','KeyS'].includes(e.code)){creditsTouch();const r=$('credits-roll');if(r)r.scrollTop+=(e.code==='ArrowUp'||e.code==='KeyW'||e.code==='PageUp'?-1:1)*(e.code.startsWith('Page')||e.code==='Space'?r.clientHeight*.8:60);stop();return;}
  if(e.code in KEYS_MOVE){if(scr==='settings'&&focus?.classList?.contains('st-tab')&&KEYS_MOVE[e.code]<0){stop();return;}move(scr,KEYS_MOVE[e.code]);stop();return;}
  if(e.code in KEYS_SIDE){const dir=KEYS_SIDE[e.code];if(scr==='settings'&&nudge(focus,dir)){stop();return;}if(scr==='confirm'){move('confirm',dir);stop();return;}
   if(scr==='chapters'&&dir>0&&focus?.parentElement?.parentElement===$('chapter-list')&&progress.unlocked(S.chapterSel)){setFocus('chapters',$('chapter-begin'));stop();return;}
   if(scr==='chapters'&&dir<0&&focus===$('chapter-begin')){const b=inside($('chapter-list'),'button')[S.chapterSel];if(b)setFocus('chapters',b);stop();return;}
   if(scr==='main'||scr==='pause'){stop();return;}return;}
  if(e.code==='Tab'&&scr==='settings'){const tabs=inside($('settings'),'.st-tab'),i=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true'),n=tabs[(i+(e.shiftKey?-1:1)+tabs.length)%tabs.length];selectTab(n.getAttribute('data-pane'));setFocus('settings',n,{silent:true});stop();return;}
  if(e.code==='Enter'||e.code==='NumpadEnter'||e.code==='Space'){if(!focus)return;
   if(focus.type==='checkbox'){focus.checked=!focus.checked;focus.dispatchEvent?.(new Event('input',{bubbles:true}));focus.dispatchEvent?.(new Event('change',{bubbles:true}));stop();return;}
   if(focus.type==='range'||focus.classList?.contains('st-tab')){move(scr,1);stop();return;}
   if(scr==='chapters'&&focus.parentElement?.parentElement===$('chapter-list')){stop();if(progress.unlocked(+focus.value))beginChapter(+focus.value);else sound.ui('back');return;}
   if(focus.classList?.contains('seg')){const btns=inside(focus,'button'),sel=$(focus.getAttribute('data-select')),i=btns.findIndex(b=>b.getAttribute('data-value')===sel?.value);setSeg(focus,btns[(i+1)%btns.length].getAttribute('data-value'));stop();return;}
   stop();focus.click?.();return;}
  if(e.code==='Escape'){if(scr==='main'||scr==='pause')return;// (game.js: Esc resumes from the pause menu)
   if(back())stop();return;}});
 function wireInput(){if(!doc?.addEventListener)return;doc.addEventListener('keydown',onKey,true);
  doc.addEventListener('pointerdown',safe(e=>{if(S.phase==='reveal'){dismissSplash();e.preventDefault?.();}else if(shown($('credits'))&&e.target?.closest?.('#credits-roll'))creditsTouch();}),true);
  doc.addEventListener('pointermove',safe(e=>{if(!S.title||currentScreen()!=='main')return;const px=(e.clientX/(innerWidth||1))*2-1,py=(e.clientY/(innerHeight||1))*2-1;titleScene.pointer(px,py);titleArt?.pointer(px,py);}));
  doc.addEventListener('wheel',safe(()=>{if(shown($('credits')))creditsTouch();}),{passive:true});
  // hover = focus, so the keyboard and the mouse share one highlight (and one sound)
  for(const scr of ['main','pause'])for(const b of focusables(scr))b.addEventListener?.('pointerenter',()=>{if(currentScreen()===scr)setFocus(scr,b);});
  for(const id of ['confirm-no','confirm-yes','farewell-back','credits-back','chapters-back','settings-back','chapter-begin'])$(id)?.addEventListener?.('pointerenter',()=>{const scr=currentScreen();if(scr&&focusables(scr).includes($(id)))setFocus(scr,$(id));});}

 // ---- buttons ----------------------------------------------------------------------------------------------------------------------
 function wireButtons(){
  const click=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
  click('open-chapters',()=>open('chapters'));
  // (settings and credits: ui.js opens them; the sound and focus follow)
  for(const [id,scr] of [['open-settings','settings'],['pause-settings','settings'],['open-credits','credits']])$(id)?.addEventListener?.('click',()=>{if(scr==='settings'){selectTab(S.tab||'audio',{silent:true});fillOutputs();}if(scr==='credits')startCredits();sound.ui('open');firstFocus(scr);});
  for(const id of ['settings-back','credits-back'])$(id)?.addEventListener?.('click',()=>{sound.ui('back');afterClose();});
  click('chapters-back',()=>{ui.closePanels();sound.ui('back');afterClose();});
  click('chapter-begin',()=>beginChapter(S.chapterSel));
  click('quit',()=>quit());click('farewell-back',()=>wake());
  click('confirm-yes',()=>answer(true));click('confirm-no',()=>answer(false));
  $('continue')?.addEventListener?.('click',()=>{sound.ui('begin');leaveTitle();});
  for(const id of ['resume','restart','to-title'])$(id)?.addEventListener?.('click',()=>sound.ui(id==='resume'?'back':'confirm'));
  // the DEV tab (temporary): folded away unless opened, always open for automated runs
  const tog=$('dev-toggle');if(tog){const setOpen=on=>{cls(body,'dev-open',on);attr(tog,'aria-expanded',on?'true':'false');};setOpen(auto||!!progress.dev().open);cls(body,'has-dev',true);
   tog.onclick=()=>{const on=!body?.classList?.contains('dev-open');setOpen(on);progress.setDev({open:on});};}
  for(const b of all('[data-dev-mood]'))b.onclick=()=>{const m=b.getAttribute('data-dev-mood');progress.setDev({mood:m==='auto'?null:m});syncDev();applyMood();titleScene.enter?.(progress.mood());showTitleArt?.();};
  const lt=$('dev-live-title');if(lt)lt.onclick=()=>{progress.setDev({liveTitle:!progress.dev().liveTitle});syncDev();showTitleArt?.();};
  const un=$('dev-unlock');if(un)un.onclick=()=>{progress.setDev({unlockAll:!progress.dev().unlockAll});syncDev();if(shown($('chapters')))buildChapters();};
  syncDev();}
 function syncDev(){const d=progress.dev();for(const b of all('[data-dev-mood]'))attr(b,'aria-pressed',(b.getAttribute('data-dev-mood')===(d.mood||'auto'))?'true':'false');attr($('dev-unlock'),'aria-pressed',d.unlockAll?'true':'false');attr($('dev-live-title'),'aria-pressed',d.liveTitle?'true':'false');}

 // ---- settings that the menu itself follows ----------------------------------------------------------------------------------------
 function onSetting(k,v){if(k==='reduceMotion'){titleScene.reduceMotion=!!v;cls(body,'reduce-motion',!!v);}
  if(k==='grain')cls(body,'no-grain',!v);
  sound.setMix(settings);fillOutputs();}
 function onSound(on){sound.setMuted(!on,settings);}

 // ---- start --------------------------------------------------------------------------------------------------------------------------
 function init(){cls(body,'qa',!!auto);try{if(matchMedia?.('(pointer:coarse)')?.matches){const p=doc?.querySelector?.('#press span');if(p)p.textContent='Tap to begin';}}catch{}wireButtons();wireSettings();wireInput();applyMood();refreshContinue();onSetting('reduceMotion',settings.reduceMotion);onSetting('grain',settings.grain);fillOutputs();}
 init();
 return {booted,frame,showTitle,hideTitle,onPause,refresh(){applyMood();refreshContinue();if(shown($('chapters')))buildChapters();},newGame,beginChapter,open,back,onSetting,onSound,
  get sleeping(){return S.sleeping;},get phase(){return S.phase;},get screen(){return currentScreen();},get mood(){return S.mood;},
  setArt(a){art=a;},sound,
  // QA: what the menu is doing now
  get state(){return {phase:S.phase,title:S.title,screen:currentScreen(),focus:S.focus[currentScreen()]?.id||S.focus[currentScreen()]?.textContent?.trim()||null,mood:S.mood,chapter:S.chapterSel,sleeping:S.sleeping,busy:S.busy,audio:sound.state};},
  dismissSplash};
}
