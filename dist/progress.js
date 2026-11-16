// How far the player has come, for the title screen: which chapters the Chapters menu offers, what Continue
// says, and which evening the title remembers. Read-only toward the story: it never writes the story's own saves.
//
// Sources (all already written by the game; nothing here changes their format):
//   lastlight.chapter1   {section, at}  the one Continue checkpoint, whatever chapter it is in
//   lastlight.chapter7   written at Chapter Seven's end;  lastlight.chapter8  at Chapter Eight's end
//   lastlight.aftermath1 written through Aftermath I
// Its own small record, so a chapter stays unlocked after the checkpoint moves on (or back, from the Chapters menu):
//   lastlight.progress   {furthest, at, v}
import {SECTIONS} from './chapter1.js';
import {LABEL3} from './chapter3.js';
import {LABEL4} from './chapter4.js';
import {LABEL5} from './chapter5.js';
import {LABEL6} from './chapter6.js';
import {LABEL7} from './chapter7.js';
import {LABEL8} from './chapter8.js';
import {LABEL9} from './aftermath1.js';
import {LABEL10} from './aftermath2.js';

export const SAVE_KEY='lastlight.chapter1',PROGRESS_KEY='lastlight.progress',DEV_KEY='lastlight.dev';
export const CHAPTER_NAMES=['Prologue','Chapter One','Chapter Two','Chapter Three','Chapter Four','Chapter Five','Chapter Six','Chapter Seven','Chapter Eight','Aftermath I','Aftermath II','One More Lap'];
export const LAST_CHAPTER=CHAPTER_NAMES.length-1;
// (Aftermath II's sections are 10; its coda and the credits, 2026, are 11)
const L10={},L11={};for(const [k,v] of Object.entries(LABEL10))(/^coda-/.test(k)?L11:L10)[k]=v;
const LATER=[[3,LABEL3],[4,LABEL4],[5,LABEL5],[6,LABEL6],[7,LABEL7],[8,LABEL8],[9,LABEL9],[10,L10],[11,L11]];

function read(storage,key){try{const v=JSON.parse(storage?.getItem?.(key)||'null');return v&&typeof v==='object'?v:null;}catch{return null;}}
function write(storage,key,v){try{storage?.setItem?.(key,JSON.stringify(v));}catch{}}

// The chapter a checkpoint belongs to. Chapter One's are its own sections; Chapters Three to Aftermath I export
// their labels; Chapter Two's are the rest of the merged checkpoint table (labels holds every chapter's at runtime).
export function chapterOf(section,labels=null){if(!section)return null;
 for(const [n,L] of LATER)if(L&&Object.prototype.hasOwnProperty.call(L,section))return n;
 if(SECTIONS.includes(section))return 1;
 if(labels&&Object.prototype.hasOwnProperty.call(labels,section))return 2;
 return null;}

export function createProgress({storage=globalThis.localStorage,labels=null}={}){
 // What Continue would resume: the checkpoint, its chapter and place, and when it was saved.
 function saved(){const s=read(storage,SAVE_KEY);if(!s||typeof s.section!=='string')return null;
  const label=labels?.[s.section];if(!label)return null;// (exactly the rule game.js has always used for showing Continue)
  const chapter=chapterOf(s.section,labels);return {section:s.section,label,chapter,chapterName:chapter===null?'':CHAPTER_NAMES[chapter],at:Number.isFinite(s.at)?s.at:null};}
 const finished8=()=>!!read(storage,'lastlight.chapter8'),finished7=()=>!!read(storage,'lastlight.chapter7'),inAftermath=()=>!!read(storage,'lastlight.aftermath1');
 // The furthest chapter reached: the record, the checkpoint now, and what the end-of-chapter saves say was finished.
 function derived(){let n=read(storage,PROGRESS_KEY)?.furthest;n=Number.isInteger(n)?n:0;
  const s=saved();if(s?.chapter!=null)n=Math.max(n,s.chapter);
  if(finished7())n=Math.max(n,8);if(finished8()||inAftermath())n=Math.max(n,9);
  // (Aftermath I finished: Aftermath II; Aftermath II finished, or the game complete: the coda)
  if(read(storage,'lastlight.aftermath1')?.section==='aftermath1-end'||read(storage,'lastlight.aftermath2'))n=Math.max(n,10);
  const a2=read(storage,'lastlight.aftermath2');if(a2?.a2done||a2?.section==='aftermath2-end'||read(storage,'lastlight.complete')?.complete)n=Math.max(n,11);
  return Math.max(0,Math.min(LAST_CHAPTER,n));}
 // (called now and then during play, and whenever a chapter is begun from the title)
 function record(n){const was=read(storage,PROGRESS_KEY)?.furthest;const cur=Math.max(Number.isInteger(was)?was:0,n|0,derived());
  if(cur!==was)write(storage,PROGRESS_KEY,{furthest:cur,at:Date.now(),v:1});return cur;}
 function poll(){const s=saved();return record(s?.chapter??0);}
 const dev=()=>read(storage,DEV_KEY)||{};
 function setDev(patch){const v={...dev(),...patch};write(storage,DEV_KEY,v);return v;}
 const furthest=()=>dev().unlockAll?LAST_CHAPTER:derived();
 const unlocked=n=>n===0||n<=furthest();
 // The evening the title remembers.
 function mood(){const m=dev().mood;if(m==='summer'||m==='search'||m==='after')return m;
  const n=derived();if(finished8()||n>=9)return 'after';if(n>=4)return 'search';return 'summer';}
 return {saved,furthest,unlocked,record,poll,mood,dev,setDev,finished8,derived};
}
