// Build a portable, self-contained comparison from real accepted/final game captures.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('docs/qa/chapter7-astra');
const out=path.resolve(process.argv[2]||'../release/Last-Light-Chapter7-Visual-Review.html');
const before=JSON.parse(fs.readFileSync(path.join(root,'before/frames.json')));
const after=JSON.parse(fs.readFileSync(path.join(root,'frames/frames.json')));
if(after.errors.length)throw Error('Resolve capture errors before building the review');
const titles={
 '01-sams-room':'Sam’s room · a lived-in morning',
 'a03-jamie':'Jamie · clothing, face and expression',
 '09-old-mill-court':'Old Mill Court · the street beyond the oak',
 'x11-lange-front':'The Langes’ front room · worn domestic detail',
 'x12-lange-kitchen':'The Langes’ kitchen · dinner left waiting',
 'x14-lange-bath-door':'The bathroom door · light beneath the threshold',
 'x16-lange-burst':'Mrs. Lange · the existing rush through the doorway',
 'x17-lange-loom':'Mrs. Lange · the close encounter',
 'a01-foyer-from-entry':'The green-door house · foyer from the entrance',
 'x20-green-star':'The folded star · the existing clue on the stair',
 '13-reveal-hand':'The hunter · hand around the post',
 '14-reveal-landing':'The hunter · emerging onto the landing',
 'x22-pantry-hand':'The pantry · the hand at the door',
 'x23-pantry-head':'The pantry · holding your breath',
 '21-grab':'The oak · Jamie’s ankle caught',
 '22-struggle':'The rescue attempt · hands on Jamie’s wrist',
 '23-gum':'The gum · the small thing left behind',
 'a04-after-grip':'The empty lane · after Jamie is gone',
 'x30-evidence':'The marks · Reyes’s flashlight',
 '24-photo-one':'The photograph · only you remain',
 '26-final-image':'The final image · four bicycles'
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const image=(folder,name,embedded)=>embedded?'data:image/jpeg;base64,'+fs.readFileSync(path.join(root,folder,name+'.jpg')).toString('base64'):folder+'/'+name+'.jpg';
function document(embedded){
 const cards=Object.entries(titles).map(([name,title],i)=>{
  const a=after.frames.find(f=>f.name===name),b=before.frames.find(f=>f.name===name);if(!a||!b)throw Error('Missing metadata: '+name);
  return `<section id="${name}"><header><span>${String(i+1).padStart(2,'0')}</span><h2>${esc(title)}</h2></header><div class="pair"><figure class="before"><figcaption>ACCEPTED DRAFT</figcaption><img loading="lazy" src="${image('before',name,embedded)}" alt="Accepted draft: ${esc(title)}"><p>${b.calls.toLocaleString()} draw calls · ${b.triangles.toLocaleString()} triangles</p></figure><figure class="after"><figcaption>VISUAL RECONSTRUCTION</figcaption><img loading="lazy" src="${image('frames',name,embedded)}" alt="Visual reconstruction: ${esc(title)}"><p>${a.calls.toLocaleString()} draw calls · ${a.triangles.toLocaleString()} triangles</p></figure></div></section>`;
 }).join('\n');
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Last Light — Chapter Seven visual review</title><style>
 :root{color-scheme:dark;font-family:system-ui,sans-serif;background:#101616;color:#e1e6df}*{box-sizing:border-box}body{margin:0}main{max-width:1600px;padding:40px 24px;margin:auto}.eyebrow{font-size:12px;letter-spacing:.22em;color:#b5c79e}h1{font:clamp(34px,5vw,64px)/1.02 Georgia,serif;max-width:1000px;margin:20px 0}p{line-height:1.6;color:#aebbb5}.intro{max-width:920px}.intro strong{color:#edf0e9}nav{position:sticky;top:0;background:#182220f2;border-bottom:1px solid #435047;z-index:2;padding:12px 24px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}button{cursor:pointer;border:1px solid #536456;background:#1a2721;color:#e7eee4;border-radius:4px;padding:10px 16px;font:inherit}button[aria-pressed=true]{background:#c5d6af;color:#182017}nav span{margin-right:auto;font-size:13px;color:#adbdad}section{margin:34px 0 60px;border-top:1px solid #39483d;padding-top:16px}section header{display:flex;align-items:baseline;gap:18px}section header span{font:16px Georgia;color:#a6be8e}h2{font:24px/1.35 Georgia,serif;margin:4px 0 18px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}figure{margin:0;background:#0b1010;border:1px solid #2c3b31}figcaption{font-size:10px;letter-spacing:.16em;padding:13px;color:#bacaac}img{width:100%;display:block}figure p{font-size:11px;margin:8px 13px}body[data-view=before] .after,body[data-view=after] .before{display:none}body[data-view=before] .pair,body[data-view=after] .pair{grid-template-columns:1fr}footer{font-size:13px;border-top:1px solid #435047;padding-top:24px}@media(max-width:760px){.pair{grid-template-columns:1fr}main{padding:24px 12px}nav{padding:10px 12px}h2{font-size:21px}}
 </style><body data-view="both"><main><div class="eyebrow">LAST LIGHT / CHAPTER SEVEN</div><h1>The same chapter.<br>A reconstructed visual world.</h1><div class="intro"><p><strong>21 matched views from the game.</strong> The accepted draft is compared with the Chapter Seven reconstruction at the same scripted moments, at 1440 × 900 using the default Medium setting. These are game captures, not concept images.</p><p>The existing story, dialogue, objectives and encounter order are preserved. There is no added false-Jamie or reflection encounter. The final cast and hunter remain procedural; these images document the improvement and its limits.</p><p>Accepted source: <code>e24f663</code> · Reconstruction branch: <code>codex/astra-chapter7-final-polish</code>. The playable’s manifest records the exact release commit.</p></div></main><nav aria-label="Compare versions"><span>COMPARE THE SAME MOMENT</span><button data-mode="both" aria-pressed="true">Side by side</button><button data-mode="before" aria-pressed="false">Accepted draft</button><button data-mode="after" aria-pressed="false">Reconstruction</button></nav><main>${cards}<footer><p>Draw counts describe these particular captured views and are not a frame-rate benchmark. Rendering used Chromium with software graphics; real-GPU performance and an audio-enabled human playthrough remain unverified. An additional ${after.frames.length-21} final captures cover the garage, Reyes, dining scare and upstairs views in the repository.</p></footer></main><script>for(const button of document.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{document.body.dataset.view=button.dataset.mode;for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b===button));});</script></body></html>`;
}
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,document(true));fs.writeFileSync(path.join(root,'index.html'),document(false));
console.log(JSON.stringify({out,pairs:Object.keys(titles).length,bytes:fs.statSync(out).size}));
