// Embed the unchanged source runtime in a server-free desktop browser playtest.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
// PLAYTEST_CHAPTER=7 names the package and its instructions for Chapter Seven (default: Chapter Six, as before)
// PLAYTEST_CHAPTER=final: the complete game, the Prologue through Aftermath II, the 2026 coda and the credits (with the title screen of this build)
// PLAYTEST_MENU=1: the whole game with the redesigned title screen and menus
const RECOVERY=process.env.PLAYTEST_RECOVERY==='1',FINAL=process.env.PLAYTEST_CHAPTER==='final',MENU=process.env.PLAYTEST_MENU==='1'||FINAL,ART=RECOVERY||process.env.PLAYTEST_ART==='1',CH=RECOVERY?'9':ART?'8':MENU?'9':process.env.PLAYTEST_CHAPTER||'6',CHW={6:'Six',7:'Seven',8:'Eight',9:'Aftermath I'}[CH]||CH;
const root=path.resolve('dist'),out=path.resolve(process.argv[2]||'../release/playable');fs.mkdirSync(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),modules={},sourceHashes={};
for(const name of fs.readdirSync(root).sort().filter(n=>n.endsWith('.js'))){const b=fs.readFileSync(path.join(root,name));sourceHashes['dist/'+name]=hash(b);let s=String(b).replace(/(['"])\.\/([^'"]+\.js)\1/g,(_,q,f)=>q+'last-light/'+f+q);if(name==='creature.js'){const old="new URL('./assets/creature/creature.glb',import.meta.url)";if(!s.includes(old))throw Error('Creature loader changed');s=s.replace(old,'new URL(globalThis.__LL_CREATURE_URL__)');}modules['last-light/'+name]=Buffer.from(s).toString('base64');}
const css=fs.readFileSync(path.join(root,'style.css'),'utf8'),fontsPath=path.join(root,'fonts.css'),fonts=fs.existsSync(fontsPath)?fs.readFileSync(fontsPath,'utf8'):'',original=fs.readFileSync(path.join(root,'index.html'),'utf8'),asset=fs.readFileSync(path.join(root,'assets/creature/creature.glb'));
for(const [n,b]of [['style.css',css],['index.html',original],['assets/creature/creature.glb',asset],...(fonts?[['fonts.css',fonts]]:[])])sourceHashes['dist/'+n]=hash(b);
// PLAYTEST_MODELS=1: also embed the Blender-authored models under dist/assets/ (everything but the creature, which is
// always embedded) for asset-library.js, as Blob URLs in globalThis.__LL_ASSETS__, and write the offline Pipeline Lab page.
const MODELS=process.env.PLAYTEST_MODELS==='1',models={};
if(MODELS){const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of walk(path.join(root,'assets')).sort()){const rel=path.relative(root,f).split(path.sep).join('/');if(rel==='assets/creature/creature.glb'||!/\.(glb|ktx2|png|jpg|bin)$/.test(rel))continue;const b=fs.readFileSync(f);sourceHashes['dist/'+rel]=hash(b);models[rel]=b.toString('base64');}}
const boot=(entryModule)=>`<script>(()=>{const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),modules=${JSON.stringify(modules)},imports={};for(const[n,b]of Object.entries(modules))imports[n]=URL.createObjectURL(new Blob([bytes(b)],{type:'text/javascript'}));globalThis.__LL_OFFLINE__=true;globalThis.__LL_CREATURE_URL__=URL.createObjectURL(new Blob([bytes(${JSON.stringify(asset.toString('base64'))})],{type:'model/gltf-binary'}));const models=${JSON.stringify(models)};globalThis.__LL_ASSETS__={};for(const[n,b]of Object.entries(models))globalThis.__LL_ASSETS__[n]=URL.createObjectURL(new Blob([bytes(b)],{type:n.endsWith('.glb')?'model/gltf-binary':'application/octet-stream'}));const m=document.createElement('script');m.type='importmap';m.textContent=JSON.stringify({imports});document.head.appendChild(m);const e=document.createElement('script');e.type='module';e.textContent='import "last-light/${entryModule}";';document.body.appendChild(e);})();</script>`;
const html=original.replace('<link rel="stylesheet" href="fonts.css">',()=>fonts?'<style>'+fonts+'</style>':'').replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+css+'</style>').replace('href="./"','href="#"').replace('<script type="module" src="game.js"></script>',()=>boot('game.js')),entry=RECOVERY?'Last-Light-Visual-Recovery-Playtest.html':FINAL?'Last-Light-Complete-Playtest.html':MENU?'Last-Light-Playtest.html':ART?'Last-Light-Full-Game-Art-Rework.html':CH==='9'?'Last-Light-Aftermath1-Playtest.html':`Last-Light-Chapter${CH}-Playtest.html`;fs.writeFileSync(path.join(out,entry),html);
let lab=null;if(MODELS){const src=fs.readFileSync(path.join(root,'pipeline-lab.html'),'utf8');sourceHashes['dist/pipeline-lab.html']=hash(src);if(!src.includes('<script type="module" src="pipeline-lab-page.js"></script>'))throw Error('Pipeline lab page changed');
 const labHtml=src.replace('<script type="module" src="pipeline-lab-page.js"></script>',()=>boot('pipeline-lab-page.js'));lab={entry:'Last-Light-Pipeline-Lab.html',sha256:hash(labHtml),models:Object.keys(models)};fs.writeFileSync(path.join(out,lab.entry),labHtml);}
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim(),manifest={branch:git('branch','--show-current'),commit:git('rev-parse','HEAD'),dirty:!!git('status','--porcelain','--untracked-files=no'),untrackedFilesExcluded:true,entry,entrySHA256:hash(html),modules:Object.keys(modules).length,...(lab?{pipelineLab:lab}:{}),sourceHashes};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');fs.copyFileSync(path.join(root,'THREE-LICENSE.txt'),path.join(out,'THREE-LICENSE.txt'));fs.copyFileSync('docs/THIRD_PARTY_ASSETS.md',path.join(out,'THIRD_PARTY_ASSETS.md'));
fs.writeFileSync(path.join(out,'START-HERE.txt'),MENU?`LAST LIGHT — PLAYTEST: THE NEW TITLE SCREEN AND MENUS

Extract the ZIP, then open ${entry} in desktop Chrome or Edge. No server, installation or internet connection is needed. WebGL must be available.

The whole game is here, from the Prologue to Aftermath I. The game opens on its title screen: the end of Oak Hollow Drive at the last of the light. Press any key (or click) to begin; sound starts then.

Title menu: Continue (when you have a saved place: it shows the chapter, the place and when), New Game, Chapters (every chapter you have reached; Begin starts it from its true beginning), Settings, Credits, Quit.
Settings: Audio (master, music, effects and ambience, voices, mute), Display (full screen, graphics quality, resolution scale, brightness, film grain), Controls (mouse sensitivity, invert look, every key), Accessibility (captions and their size, memory lines, reduce flashing, reduce motion, reset). Everything is remembered in this browser.
The title changes with how far you have come: the evening it remembers is later and darker after the middle of the summer, and different again after Chapter Eight.

Keyboard: arrows or W/S choose, Enter selects, Esc goes back, left/right adjust a setting, Tab changes the settings section, M mutes. The mouse works everywhere.

DEV (for testing): the small DEV tab in the bottom-right corner of the title opens the scene selector, exactly as before (DEV → a chapter → a scene → START SCENE). It also has Title mood (Auto/Summer/Search/After) to preview the three title screens, and Unlock every chapter in Chapters.

In play: WASD and mouse move and look. Shift: run or pedal harder. Space: bell / jump. C: crouch. T: flashlight. F: use (hold F where it says Hold). Q/E: look. Esc: pause. M: sound. 1–4: what you say when asked.
Click to capture the mouse; if capture is unavailable, click-drag to look.

Not yet verified: a human playthrough, real-GPU performance (only software rendering was checked), and a listening pass on the menu's synthesized sound. Local-file saves are browser-specific; keep this file in one place.

Branch: ${manifest.branch}
Commit: ${manifest.commit}
`:ART?`LAST LIGHT — FULL-GAME ASTRA ART REWORK

Extract this ZIP, then open ${entry} in desktop Chrome or Edge. No terminal, server, or installation is needed. WebGL must be available.

The full game from the Prologue through Aftermath I is included. On the title screen, Take the long way home starts from the beginning. DEV → Chapter Eight → choose a scene → START SCENE goes directly to a review scene. The same menu has every earlier chapter and Aftermath I. Chapter Eight’s end card also continues into Aftermath I.

Suggested art review: The construction gallery; Sam; Jamie; All four of you; The breach; The surface; The Hendersons; Jamie; The oak; The last ride. Scene names in the menu use the story's existing labels.

Open geometry-review/index.html for 19 labeled model and staging renders. Read ART-REWORK-REPORT.md for changes, test results, and remaining limits.

WASD + mouse: move/look. Shift: run or pedal harder. Space: jump on foot / bicycle bell. C: crouch. T: flashlight. F: interact; hold when prompted. Q/E: look. Esc: pause. M: sound. Number keys 1–3: dialogue choices.
Click to capture the mouse; click-drag to look if capture is unavailable. Local-file saves are browser-specific; keep this file in one place.

This is a playable art-review candidate, with rebuilt procedural models and facial acting. Story, tragedy, lore, and the ending are preserved. Read ART-REWORK-REPORT.md for the changes and verification limits. The current preview browser cannot create WebGL, so final in-game lighting, GPU performance, animation playback, and sound still need a human playtest. Separate geometry renders are NOT screenshots of the running game.

Branch: ${manifest.branch}
Commit: ${manifest.commit}
`:CH==='9'?`LAST LIGHT — PROLOGUE TO AFTERMATH I PLAYTEST — WHAT WAS LEFT\n\nExtract the ZIP, then open ${entry} in desktop Chrome or Edge. No server is needed.\nThe whole game is in it, from the Prologue. To reach Aftermath I: play Chapter Eight to its end card and press Aftermath I; or DEV → Aftermath I → choose a scene → START SCENE (each scene starts the same way every time; two scenes have a variant where Jamie's cap is already with his mother). Continue (when shown) returns to the last checkpoint with what you kept.\nWASD and mouse: move/look. Shift: run. F: use (hold F where it says Hold; some things you take by looking at them). S: put a held thing down. A/D or the mouse: turn a held thing. I: what you carry.\n1–4: what you say when you are asked (or say nothing: let it pass). Esc: pause. M: sound.\nClick to capture the mouse; if capture is unavailable, click-drag to look.\n\nAftermath I is the chapter after Chapter Eight: the school as a shelter on August 27, 2011, the families, Reyes's record, the county's list, the street behind its fence in September, the two remembrances, Sam, and October, when your family leaves Oak Hollow. There is no monster, no chase and no failure state in it.\nNot yet verified: a human playthrough, performance on real GPUs (only software rendering was checked), and the sound (the crying and breathing are synthesized; nobody has listened to them). There is no voice acting: dialogue is captions.\nLocal-file saves are browser-specific; keep this folder in one place.\n\nBranch: ${manifest.branch}\nCommit: ${manifest.commit}\n`:CH==='8'?`LAST LIGHT — PROLOGUE TO CHAPTER EIGHT PLAYTEST — THE NIGHT OAK HOLLOW FELL\n\nExtract the ZIP, then open ${entry} in desktop Chrome or Edge. No server is needed.\nThe whole game is in it, from the Prologue. Title screen: “Take the long way home” plays from the beginning; DEV → Chapter Eight → choose a scene → START SCENE jumps in; or play Chapter Seven to its end card and press Chapter Eight. Continue (when shown) returns to the last checkpoint.\nWASD and mouse: move/look. Shift: run. Space: jump. C: crouch. T: flashlight. F: use (hold F where it says Hold). Q/E: look. S: put a page down.\nUnder the court the long thing hunts by sight and sound: crouch, keep your light off, hide (F) when it comes. G: throw a bolt to draw it (the retrieval wing). Where something is about to come down, grit falls first: move.\nOn the street: the pale smiling things and the second hunter see you if you are close, in front of them and not hidden; get down behind something, keep low, keep the houses between you. When the ground lifts under you, get off it.\n1–3: what you say when you are asked. Esc: pause. M: sound.\nClick to capture the mouse; if capture is unavailable, click-drag to look.\n\nThis is the Chapter Eight reconstruction (the rebuilt rescues, Oak Hollow falling, Jamie, Alex, the last ride).\nNot yet verified: a human playthrough, performance on real GPUs (only software rendering was checked), and the sound (the crying and breathing are synthesized; nobody has listened to them). There is no voice acting: dialogue is captions.\nLocal-file saves are browser-specific; keep this folder in one place.\n\nBranch: ${manifest.branch}\nCommit: ${manifest.commit}\n`:CH==='7'?`LAST LIGHT — CHAPTER SEVEN PLAYTEST — ASTRA VISUAL RECONSTRUCTION\n\nExtract the ZIP, then open ${entry} in desktop Chrome or Edge. No server is needed.\nTitle screen: DEV → Chapter Seven → choose a scene → START SCENE (or play Chapter Six to its end card and press Chapter Seven).\nWASD and mouse: move/look. Shift: run / ride hard. F: interact, knock, hide, grab. Hold F: hold on, write. S: pull back / put down.\nHeld things (a poster, a page): the mouse or A/D turns them. Hiding, when it looks in: hold Space to hold your breath.\nThe map: A/D or the wheel shows the old plan over the new; the mouse moves the pencil; F marks.\n1–3: what you say when you are asked. Esc: pause. M: sound.\nClick to capture the mouse; if capture is unavailable, click-drag to look.\n\nThe hunter is a temporary procedural stand-in (see the creature guide in the repository).\nReal-GPU performance and an audio-enabled human playthrough remain unverified.\nLocal-file saves are browser-specific; keep this folder in one place.\n\nBranch: ${manifest.branch}\nCommit: ${manifest.commit}\n`:`LAST LIGHT — CHAPTER SIX PLAYTEST\n\nExtract the ZIP, then open ${entry} in desktop Chrome or Edge. No server is needed.\nTitle screen: DEV → Chapter Six → choose a scene → START SCENE.\nWASD and mouse: move/look. F: interact. Esc: pause. M: sound.\nMorning: press F at a station, hold F to continue, S to cancel.\nClick to capture the mouse; if capture is unavailable, click-drag to look.\n\nHuman review candidate: stylized procedural cast and guided cloth.\nReal-GPU performance and an audio-enabled human playthrough remain unverified.\nLocal-file saves are browser-specific; keep this folder in one place.\n\nBranch: ${manifest.branch}\nCommit: ${manifest.commit}\n`);console.log(JSON.stringify({out,bytes:Buffer.byteLength(html),...manifest,sourceHashes:undefined}));

if(RECOVERY)fs.writeFileSync(path.join(out,'START-HERE.txt'),`LAST LIGHT — VISUAL RECOVERY

Extract this ZIP, then open ${entry} in desktop Chrome or Edge. No terminal, server or online asset service is needed.
The complete Prologue through Chapter Eight AND Aftermath I are included.
Title screen: DEV → Chapter Eight or Aftermath I → choose a scene → START SCENE. Chapter Eight's end card also continues to Aftermath I.

WASD: move / pedal. Mouse or click-drag: look. F: interact (hold when prompted). Shift: run. C: crouch. T: flashlight. Space: jump / bicycle bell. 1–4: dialogue choices. Esc: pause. M: mute. S: put a held item down.
Keep the folder in one place; local-file saves are browser-specific.

Open Before-and-After.html for actual game-renderer scene comparisons. Open VISUAL-RECOVERY-REPORT.md for changes, checks and limitations. These are software WebGL captures, not browser screenshots. Hardware GPU performance, pointer-lock, audio and a human full playthrough still require review.

Branch: ${manifest.branch}
Commit: ${manifest.commit}
`);
if(FINAL){fs.writeFileSync(path.join(out,'START-HERE.txt'),`LAST LIGHT — THE COMPLETE GAME — PLAYTEST

Extract the ZIP, then open ${entry} in desktop Chrome or Edge. No terminal, server or installation is needed. WebGL must be available.

Everything is in it: the Prologue through Chapter Eight, Aftermath I, Aftermath II (August 2021), the 2026 coda, and the credits.
It opens on the new title screen (the horror revision: the title artwork, the analog memory effects, the redesigned
LAST LIGHT logo). Press any key for the menu. From the beginning: New Game. Chapters lists every part you have reached
(Aftermath II and One More Lap, the coda, appear once you get there). Settings and Credits are on the same menu.
Straight to the end: the DEV tab (bottom right of the title) → Aftermath II → choose a scene → START SCENE (Aftermath II's scenes, and variants for what you kept in Aftermath I:
Jamie's cap kept, or given to his mother at the shelter or on her porch). DEV → 2026 · Credits has the coda's stages and the credits.
Aftermath I's end card continues to Aftermath II; Aftermath II's end card ("One more lap") to the coda; the coda to the credits; the credits
to the end screen (the credits again, start over, the title). Continue on the title screen returns to the last checkpoint with what you kept.

WASD + mouse: move and look. Shift: run, or pedal harder. Space: jump on foot / bicycle bell. F: use (hold F where it says Hold).
S: put a held thing down. Q / E: turn a page (the notebook), or look. A/D or the mouse: turn a held thing. I: what you carry.
1–4: what you say when you are asked (or say nothing: let it pass). Esc: pause. M: sound.
In the car (Aftermath II): hold W to drive, S to slow down, F to pull over when it offers.
The credits: Esc, Space or Enter (or the Skip button) goes to the dedication, then past it.
Click to capture the mouse; if capture is unavailable, click-drag to look. Saves are kept by this browser for this file: keep it in one place.

Read AFTERMATH2-TEST-REPORT.md for what was tested and how, and RELEASE-NOTES.md for the credits' sources and the known limits.
The screenshots in the reports are software-rendered WebGL captures of the real game (SwiftShader), not a GPU. GPU performance, audio,
pointer lock and a full human playthrough still need a person.

Branch: ${manifest.branch}
Commit: ${manifest.commit}
`);
 for(const [from,to] of [['docs/AFTERMATH2_TEST_REPORT.md','AFTERMATH2-TEST-REPORT.md'],['docs/FINAL_CREDITS_AND_RELEASE_HANDOFF.md','RELEASE-NOTES.md']])if(fs.existsSync(from))fs.copyFileSync(from,path.join(out,to));}
